# Task 06, Step 1 — read-only assessment (independent track launching)

Version: 0.1
Revision log:
- v0.1, 2026-11-04: first version. Read-only: no source was changed for this assessment.

Task text: docs/tasks/TASK-06-track-launching.md. Figures come from the Task 05 build
(commit 67c8937: app image 451364 bytes, margin 2557 bytes, static SRAM 319252 bytes,
runtime heap 204364 bytes above a 49152-byte minimum) and from `build/pro/sdk.elf` symbol
sizes (`nm --print-size`).

## 1. Summary and recommendation

- **The sequencer can take per-track playheads without a new storage format and without
  more RAM than it uses now.** The two row buffers (8 tracks × 64 steps × 25 bytes each)
  become two buffers per track of the same cells; the decode-ahead and the look-ahead
  already work per track inside one row, so they become per track in time as well. The
  worst case, eight tracks launching eight different rows at one bar, costs the control
  task exactly what one row costs today: eight block reads.
- **The master clock becomes one monotonic position**; each track keeps a start time and
  a loop length. Bars are multiples of 16 steps, rows are too, and the swing warp is the
  identity at every pair boundary, so the bar grid is the same for every track, swing or
  not.
- **Pad LEDs**: 16 RGB pads with 8 bits per colour, refreshed on every control read
  (10 ms) over the LCD's SPI bus; no hardware flashing or dimming, both are done by
  choosing colours in software, so flashing can run in time with the song's eighth
  notes. Enough for playing / queued / stopped / empty / pending stop.
- **Controls**: the layout in the task fits the hardware with one change: SHIFT + pads
  1-8 already selects the track on every page, so the TRACK LAUNCH page needs no
  selection logic of its own. The page switch and "back to song" go on buttons that have
  no meaning on the song pages (SCL, ENV, SHIFT+ENV) rather than on pad combinations,
  because every SHIFT+pad is taken (1-8 track, 9-16 mute).
- **Row events per track**: an event belongs to track T when its channel equals T's
  resolved output channel (song override or device setting). The "lead before bar"
  setting needs **no firmware setting and no format change**: it is a trailing gap event
  on that channel, which the firmware already honours (the stream starts `lead` blocks
  early) and the workbench currently drops.
- **Flash**: estimate +3.1 KB (range 2.5..3.9 KB) against a margin of 2557 bytes, so
  removals are needed. Recommended: the BLE page (≈2.3 KB) and the NAME page (≈0.55 KB),
  leaving an estimated 2.3 KB after Task 06; the EFFECTS page (≈1.4 KB) is the reserve.
  Nothing is removed until you approve (section 7).

## 2. The sequencer after Task 05 (app/song.c v0.3)

**Playhead.** One position `pos` in units (1/480 step) inside the current frame, advanced
per 128-frame block by `tempo × 1024 / 11025` with a carried remainder. A frame is one
pass through the current row buffer; at the boundary (`switch_frame`) the position wraps
to `p1 − bd`, so `pos` is frame-relative and there is no global time. Repeats, the natural
next row, loop-here rows and queued jumps (next bar or row end) are decided by
`next_frame`, which returns the boundary and which of the two buffers follows.

**Row buffers.** `buffers[2]`, each 12948 bytes: `cell[8][64][25]` (a step header and up
to four 6-byte timed notes), `swing[8]`, the row's events (32 × 4 bytes, gaps already in
blocks) with their total `lead`, row / steps / repeat / loop-here, the look-ahead coverage
(`look_from`, `look_row`) and the `ready` flag that hands a buffer between the two
threads (control fills while 0, audio reads while 1).

**Decode-ahead.** `song_poll` (control task, every 10 ms poll through
`groove_samples_poll`) decodes the expected next row into the free buffer: eight
`song_block_read` calls (a 6-byte header and up to 1600 bytes each, synchronous SPI flash
reads through the per-song directory), validation, the v1 → v2 upgrade in place, the
cells copied, then the row's slice of the event table. A queued jump that changes the
expected row invalidates the decoded buffer and decodes again. The audio thread never
touches flash; a row not ready at its boundary is counted as an underrun and the current
row replays ("ROW DECODE LATE"), which never showed in the Task 03-05 hardware checks.

**Window scan.** Each tick builds a sorted action list for the window [p0, p1): note-offs
due from the per-track `sounding` tables, note-ons of every step that can reach the
window (`scan`, one pass over 8 tracks × the candidate steps), the look-ahead into the
next frame for step-0 notes with negative offsets, and the part of the next frame that
falls inside the window when the boundary is crossed. Probability rolls once per track,
step and pass. Everything is already indexed by track; only the frame (row, boundary,
position) is shared.

**Row events.** One stream (`stream`, `armed`, `streamed`) for the next row, started
`lead + 1` blocks before the boundary so the last message leaves in the boundary tick,
before the row's first notes (lane 0 drains in order). SEND SETUP reuses it while
stopped.

**Transport.** PLAY sends Start once, the tick drives MIDI clock through the router's
clock hook; STOP releases every sounding note and sends Stop. The song's output-channel
override is applied at PLAY and withdrawn when playback leaves the song.

## 3. Design: per-track playheads, queues and decode-ahead

### 3.1 Time

- **Master position** `master` (uint32 units since PLAY; at 300 BPM it wraps after five
  days) advanced exactly as `pos` is today. **Bar** = 16 × 480 = 7680 units; `bar_pos =
  master mod 7680`; the next bar is `master − bar_pos + 7680`. MIDI clock, Song Position
  Pointer, Start/Stop and the bar count come from `master` only and are never touched by
  a launch.
- **Per track**: `start[t]` (master time when its current pattern began), `len[t]`
  (steps × 480 of the pattern's row), `buf[t]` (which of the track's two buffers plays).
  The track's position is `(master − start[t])`, wrapped at `len[t]` for a looping
  pattern. The frame boundary of a track is either its own pattern end (loop, or the
  song's row sequence for an attached track) or the next bar (a queued launch, stop or
  back-to-song).
- **Swing** stays a per-buffer value and `warp()` stays pattern-relative. Because
  `warp(k × 960) = k × 960`, a bar (8 pairs) and every row length (16, 32, 48, 64 steps)
  map to themselves, so the bar grid is shared by all tracks whatever their swing, and a
  pattern launched at a bar starts at its step 0 exactly on the bar.

### 3.2 Buffers

`struct trackbuf { uint8_t cell[64][25]; uint8_t event[32][4]; uint8_t event_count;
uint16_t lead; uint8_t row, steps, swing; int16_t look_from; uint8_t look_row; volatile
uint8_t ready; }` ≈ 1740 bytes; `tbuf[8][2]` = 27840 bytes against 25896 today (+1944,
section 4). The note cells are exactly today's cells regrouped: no decode or scan code
changes its inner loops, `scan`, `note_on`, `step_skipped` and `enter_frame` lose their
8-track loops and take the track as an argument, and `tick` runs them per track with the
track's own window and boundary. The action list stays global (one sort per block, as
now): it already carries the track.

The event slice of a track buffer is the row's events on the track's channel (section 6),
so a launch streams only what that track's device needs. The scene path (a row entry for
all attached tracks) streams the row's full list as today, from the buffer of any
attached track, so that effects pedals on channels that belong to no track keep firing on
scene changes only.

### 3.3 State per track

```
state[t]:   ATTACHED (follows the song rows, as today)
            LAUNCHED (detached, loops its pattern)
            STOPPED  (detached, silent)
queue[t]:   NONE | LAUNCH row | STOP | BACK_TO_SONG      (lands at the next bar)
```

- **Launch** (`song_track_launch(t, row)`): `queue[t] = LAUNCH row` if the row exists and
  its block for t is not 0 (an empty pattern is refused, the pad stays dark). A newer
  press before the bar replaces it. The control task decodes the row's block into the
  track's free buffer (one block read) and its event slice; the audio tick, at the bar:
  note-offs for the track's sounding notes (at the bar, as a scene change does today),
  `start[t] = bar`, `len[t]` from the row, `buf[t]` swapped, `state[t] = LAUNCHED`. The
  look-ahead fires the new pattern's negative-offset step-0 notes before the bar through
  the same `scan(mode 1)` path, with the queued buffer as "next frame"; a press that
  leaves no time for that plays them at the bar and counts in `late` (today's rule).
- **Stop** (`song_track_stop(t)`): `queue[t] = STOP`; at the bar every sounding note of
  the track gets its note-off (the `sounding` table holds the pitch, the router resolves
  the channel the note-on used, so a note-off goes where its note-on went even if the
  device channel setting changed meanwhile), `state[t] = STOPPED`, the buffer stays
  decoded so a relaunch of the same pattern needs no read.
- **Back to song** (`song_track_attach(t)`): `queue[t] = BACK_TO_SONG`; at the bar the
  track takes the song's current row block for t at the song's current position within
  the row (`start[t] = song_start`, the row's buffer decoded for t), `state[t] =
  ATTACHED`. If the song row has no block for t the track is attached and silent.
- **Pattern not decoded at the bar** (a press inside the last control poll before the
  bar, or flash busy): the launch is not dropped and not delayed a whole bar; the track
  enters the pattern as soon as its buffer is ready, positioned where it would be had it
  started at the bar (`start[t] = bar`, notes already passed are skipped), and the entry
  counts in `late`. In practice a block read is well under the 10 ms poll (eight of them
  fit today).

### 3.4 The song playhead and attached tracks

The row state machine (row, repeat, natural next, loop-here, song end, the queued scene
jump and the jump mode) stays as it is and becomes the **song playhead** that attached
tracks follow: `song_start` (master time of the current row entry), `song_row`,
`song_len`. At a row boundary the attached tracks switch to the next row's block for
their track (decoded ahead per track exactly as today's next row, eight reads spread over
the control polls before the boundary), and the row's full event stream is pre-fired as
today. Detached tracks ignore the boundary.

- **Scene jump** (pads on the SONG page): `jump_row` as today; when it lands (next bar or
  row end by the jump mode) **every** track takes the row's block (`0` = that track
  stops: sounding notes released at the landing), every per-track queue is cleared, every
  track becomes ATTACHED. A scene jump queued after per-track queues overrides them at
  once (the queued buffers are reused where the row matches).
- **Song end** (no loop flag, last row ends): attached tracks stop at the end as today.
  Proposed rule (not in the task, for approval): if any track is detached and playing,
  the master keeps running and those tracks keep looping; the song stops fully when the
  last track stops, on PLAY, or on a scene jump that lands on silence. If no track is
  detached the song stops as today.
- **Repeats and loop-here rows** apply to the song playhead only; a launched pattern
  loops regardless of its row's repeat count.
- **Late counter**: one counter as today, incremented per track entry that fired notes or
  events after their time.

### 3.5 Worst case: eight tracks launching eight different rows at one bar

- Control task: 8 block reads (≤ 1606 bytes each) plus 8 event slices, spread over the
  polls between the presses and the bar; identical to one row decode today. A press in
  the last poll before the bar follows the late rule of 3.3.
- Audio tick at the bar: 8 frame switches in one block (release ≤ 16 sounding notes per
  track, swap, enter frame), then the window scan over 8 tracks: the same work as a
  scene jump that lands today, which the Task 05 ten-minute run and the 80 BPM Renoise
  song exercise every row boundary.
- Event streams: up to 8 concurrent streams (one per track, each with its own gap wait),
  interleaved into lane 0; a PC with a bank select is three messages per stream per
  block, well inside the lane.

### 3.6 Status and transfer

`struct song_status` gains `track_state[8]` (state and pending queue) and
`track_row[8]` (current pattern, SONG_NONE when stopped / no block) and
`track_queued[8]`. Command 23 grows from 15 to 31 bytes (bytes 15..22 state, 23..30 row);
`sim_song_status` gains words 4..5. The `.tabby` file, kinds 5-7 and the song record are
untouched.

## 4. RAM

| Item | Today | Proposed | Change |
| --- | ---: | ---: | ---: |
| Row / track buffers | 2 × 12948 = 25896 | 8 × 2 × 1740 = 27840 | +1944 |
| Per-track clock state (start, len, buf, state, queue, queued row) | — | 8 × 12 = 96 | +96 |
| Song playhead (song_start, row, len) and master position | — | 16 | +16 |
| Event streams (buf, next, active, wait) | 1 × 6 | 9 × 6 = 54 | +48 |
| Sounding tables, action list, probability cache | unchanged | | 0 |
| **Total** | | | **≈ +2.1 KB** |

Static SRAM 319252 → ≈ 321360; the runtime heap keeps ≈ 153 KB above its minimum. The
alternative, decoding whole rows per launch (a row buffer per distinct row, up to eight
at once), would cost 8 × 12.9 KB in the worst case and still need per-track clocks, so
the per-track buffer is both the cheapest and the simplest. Nothing in either design
makes the audio thread wait on flash: every read stays on the control task behind a
`ready` flag, as now.

## 5. Pad LEDs and the control layout

### 5.1 What the hardware can do (app/board/panel.c, app/board/scan.c, app/smk37_controls.c)

- **16 RGB pads**, 24-bit colour (8 bits per channel), driven as a WS2812-style bit
  stream over SPI1 by DMA from a 420-byte buffer (`smk37_rgb_service`). Colours come from
  `smk37_pad_color(pad, lit)` on **every control read** (`fm1_controls_read`, the 10 ms
  control tick); only changed pads are re-encoded and the transfer is skipped while an
  LCD paint owns the bus, so a colour change lands within one or two ticks. No hardware
  brightness control: the current palette runs the LEDs dim (0x183010 for "lit",
  0x040804 for "off"), full 0xFF values are bright. **Flashing is software**: the colour
  function returns one of two colours by time; taking the song's eighth note from the
  master position makes queued pads blink in tempo (and the control tick is fast enough
  for 16th notes). Under SHIFT the pads already show a different picture (pads 1-8 the
  selected track, 9-16 mute state), so a per-track status view under SHIFT costs nothing
  new.
- **19 button LEDs**, single colour on/off (`smk37_led`), multiplexed in two groups by
  the scan interrupt; PLAY has a second lamp. ENV and LFO share one physical button and
  one lamp (LFO = SHIFT+ENV). Usable as page indicators (SCL lit on the TRACK LAUNCH
  page) at no cost.
- Pads reach the screen as the 16 white keys (`navigation_mode()` on the SONG page), so
  the TRACK LAUNCH page reads them exactly as the SONG page reads row pads; SHIFT+pad goes
  to `smk37_screen_shortcut` before the page sees it.

### 5.2 Proposed layout

| Control | SONG page (scene changes, unchanged) | TRACK LAUNCH page (new, page 20) |
| --- | --- | --- |
| Pads 1-16 | queue a scene jump to row (page × 16 + pad) | queue pattern (page × 16 + pad) for the selected track; the playing pattern's pad queues a stop; an empty pattern (block 0) does nothing |
| OCT DOWN / UP | pad page (rows 1-16, 17-32, …) | same, shared page variable |
| SHIFT + pads 1-8 | select track (existing, every page) | select track; the pads show every track's state while SHIFT is held |
| SHIFT + pads 9-16 | mute (existing) | mute (existing) |
| SCL | — (announces "voice edit moved") | **switch SONG ↔ TRACK LAUNCH**; SCL's lamp lit on TRACK LAUNCH |
| ENV | — | **back to song, selected track** (lands at the next bar) |
| SHIFT + ENV (LFO) | — | back to song, all tracks (re-attach without a scene jump) |
| PLAY | start / stop the song (unchanged) | same |
| K4 (encoder 5) | jump mode | — |
| HOME | back to OVERVIEW | back to OVERVIEW |

Why buttons and not a pad combination for "back to song": every SHIFT+pad is taken
(track select, mute) and HOME+PLAY is the emergency stop; SCL, ENV and LFO have no song
meaning (their only handler on these pages is an announcement), they sit next to each
other, and a single press needs no second hand. If you prefer a pad combination, the one
free pair is **OCT DOWN + OCT UP held together** then a pad 1-8; I recommend the buttons.

Screen (TRACK LAUNCH): header as on the SONG page, then eight columns T1..T8 in the track
colours with the pattern number (row + 1) and a state word: FOLLOW (attached, with the
song row), PLAY n (launched), STOP, QUEUE n (flashing), ->STOP (flashing), ->SONG;
below, the pad page and the selected track's pattern map (which pads have a block). The
bar counter and the late count stay visible.

### 5.3 Pad colours (proposal, same brightness scale as the current palette)

| Pad state | Colour | Behaviour |
| --- | --- | --- |
| playing (this track, this pattern) | green 0x083008 | steady |
| queued launch | green / off | flashing on eighth notes |
| pending stop | red 0x300808 / off | flashing on eighth notes |
| has a pattern, not playing | dim white 0x080808 | steady |
| empty (block 0 or row beyond the song) | off | |
| under SHIFT, pads 1-8 (one per track) | track colour: bright = playing or following with a block, dim = stopped or silent, flashing = queued | |
| under SHIFT, pads 9-16 | unchanged (mute) | |

## 6. Row events mapped to tracks by channel

- A track's **resolved output channel** is `record.channel[t] − 1` when the song overrides
  it (1..16) and otherwise the device setting, the nibble `config.channel[t >> 1]` the
  router's static `channel(t)` reads. One new accessor in app/midi_router.c returns it
  (about 20 bytes); the override is applied at PLAY and cannot change during the song, the
  device setting can, so the slice is computed at decode time (every launch decodes).
- **Slice rule**: the launch stream of track T for row N is, in the row's stream order,
  every non-gap event whose channel equals T's channel, plus every gap event with the
  same channel bits. The workbench already writes a gap with the channel of the program
  change it follows (`applyGaps`, `channel: e.channel`), the device validator ignores a
  gap's channel bits, and 9.11 says the device ignores them when streaming, so **old songs
  are unchanged** and the only text change is one sentence in 9.11: "a gap's channel bits
  name the channel it belongs to (0 in records written before Task 06, where a gap simply
  follows the event before it)". For such a record the slice takes a gap whose channel
  bits are 0 as belonging to the preceding event's channel.
- **Two tracks on one channel** (two tracks driving one synth on different notes) each
  send their own slice at their own launch; two launches at the same bar send the PC
  twice, last wins. Reported, not prevented.
- **Channels that belong to no track** (pedals) are never in a launch slice; they fire on
  scene changes only, as today, because the scene path streams the row's whole list.
- **Lead before bar** (per device, default 0): a **trailing gap** on the channel. The
  firmware already does the right thing with it: `lead` is the sum of a row's gaps and the
  stream starts `lead + 1` blocks before the boundary, so a trailing gap of L ms makes the
  program change leave L ms before the bar; the stream ends (`active = 0`) in the boundary
  tick. The workbench's `applyGaps` currently drops a gap that ends a row's stream (rig.js
  line 107): it will instead emit `max(leadMs, device gap after program)` as the trailing
  gap of each channel that has a lead. For a per-track launch the lead is the slice's gap
  sum, so a late press (less time than the lead) sends at once and counts late, as the
  task asks. Scene changes get the same lead automatically, which is what a slow Blofeld
  wants there too.

## 7. Flash estimate and the removal plan

### 7.1 Estimated cost of Task 06

| Part | Estimate | Basis |
| --- | ---: | --- |
| app/song.c: per-track clocks, queues, launch / stop / attach, per-track frame switch and look-ahead, 8 event streams, scene override, song-end rule, status | +1600 (1300..2000) | Task 05's rewrite of the same functions cost +1556 with more new arithmetic |
| app/screen.c: TRACK LAUNCH page draw, its controls, SCL / ENV routing, page constant, strings | +1250 (1000..1500) | the SONG page's draw and controls are of that size |
| app/smk37_controls.c: pad colours and flashing | +160 | `smk37_pad_color` is 100 bytes today |
| app/transfer.c: command 23 bytes 15..30 | +40 | |
| app/midi_router.c: channel accessor | +20 | |
| **Total** | **≈ +3100 (2500..3900)** | |

Margin after Task 06 with nothing removed: 2557 − 3100 ≈ **−540** (range −1340..+60).
The 2 KB floor needs about 2.6 KB freed (range 2.0..3.4 KB).

### 7.2 Candidates, exact sizes from the current build

Sizes are `nm` sizes of the functions that exist only for the page; "+ est." is the part
that cannot be measured separately: the page's branch inside `apply_controls` (6366 bytes
for every page together), its strings in the shared pool (`str1.1`, 5990 bytes) and its
web-target lines. The measured figure after removal will be reported at the checkpoint.

| Candidate | Measured | + est. | ≈ Total | What is lost on the device |
| --- | ---: | ---: | ---: | --- |
| **BLE page** (page 7): `draw_ble` 1288, `ble_control` 400, `radio_line` 80, its tables 104 | 1872 | strings ≈ 420 (41 strings), HOME+GLO and ACTIONS 18 routing ≈ 60 | **≈ 2300** | Bluetooth on/off, BT audio, host/device role, "forget MIDI pairs", the MIDI device scan list. BLE MIDI itself stays (library code, not removable) with the saved settings; the clock source stays on SEQ page 5/7 (`groove_settings_clock`) and tap tempo; the workbench's "连接设置预览" shortcut shows this page in the simulator and goes with it |
| **NAME page** (page 9): `name_draw` 244, `edit_character` 82 + alphabet 39 | 365 | controls branch ≈ 120, EDIT+REC combo and ACTIONS 17 ≈ 70 | **≈ 550** | renaming a DX7 patch on the device; patch names still arrive with voices imported in the workbench |
| **EFFECTS page** (page 10, FX button): `effects_draw` 680 + tables 84 | 764 | controls branch ≈ 350, web targets ≈ 120, strings ≈ 200 | **≈ 1400** | editing reverb / delay sends, returns and delay time on the device **and in the workbench simulator** (the workbench has no separate effects editor; the values keep loading and saving with projects and timbres). FX would announce "edit in workbench" like SCL / ENV / LFO do |
| STARTUP page: `boot_draw` 192 + boot phases ≈ 120 | 192 | ≈ 120 | ≈ 300 | the boot splash |
| COPY / PASTE TIMBRE actions (`tone_clip` 223 bytes RAM, code ≈ 80) | — | ≈ 80 | ≈ 80 | on-device timbre copy between tracks |
| STEP_EDIT + RHYTHM pages (`edit_page_draw` 3690 is shared with STEPS and ARP_EDIT, cannot be split exactly) | — | ≈ 2000..2500 | ≈ 2200 | step details and rhythm / record editing on the device (the basic STEPS page and ARP settings stay) |

Not candidates: PROJECT / PRESET_BROWSER (loading projects), MIX (mute / solo), FM_QUICK
(DX7 preset select and macros), ARP_EDIT, the factory DX7 bank (decision), the migration
code (a fresh V01 device needs it).

### 7.3 Combinations and the margin they leave after Task 06 (estimate +3100)

| Removed | Freed | Margin after Task 06 | Range (cost 2500..3900) |
| --- | ---: | ---: | ---: |
| nothing | 0 | −543 | −1343 .. +57 |
| NAME | 550 | 7 | −793 .. +607 |
| BLE | 2300 | 1757 | 957 .. 2357 |
| **BLE + NAME (recommended)** | **2850** | **2307** | **1507 .. 2907** |
| BLE + EFFECTS | 3700 | 3157 | 2357 .. 3757 |
| BLE + NAME + EFFECTS | 4250 | 3707 | 2907 .. 4307 |
| BLE + NAME + STARTUP | 3150 | 2607 | 1807 .. 3207 |
| all of the above + STEP_EDIT / RHYTHM | ≈ 6450 | ≈ 5900 | |

**Recommendation.** Approve BLE + NAME now; approve EFFECTS as a reserve that I take only
if the measured margin after the Task 06 code is under 2 KB, with a stop-and-report
before removing it. Order of work: Task 06 code first on the branch, measure, then the
approved removals in their own checkpoint so each figure is attributable. The BLE page is
the one real loss: if you pair BLE MIDI devices from the device rather than leaving the
radio settings as they are, say so and I will take EFFECTS + NAME + STARTUP instead
(≈ 2250, margin ≈ 1700, under the floor by the estimate's mid point but inside its range).

## 8. Workbench changes

- **Rig** (web/rig/rig.js, rig-ui.js): per-channel `leadMs` (0..255, default 0) next to
  the gap override; `applyGaps` emits the trailing gap (section 6); the rig profile stays
  `tabby-rig/1` with an optional field (old profiles read as 0). The row event editor
  shows the trailing gap greyed like the other generated gaps.
- **Song editor** (sdk/Update.html.in, WebUpdate.js): rows labelled as patterns ("ROW 3 =
  PAD 3, PAGE 1") and, per track, a 16-pad map of the current page showing which pads
  have a block (a block id per cell already exists in the table; the map is a readout).
  The simulator gains the page-20 shortcut button and the per-track states from command
  23 in the song status line. `sim_song_status` words 4..5 for the tests.
- Importer: nothing (patterns are rows).

## 9. Tests (Step 3 as written) and the hooks they need

Host (tests/host/smoke.c, new section 13) and simulator (tests/midi-import/simulator.mjs,
a scripted 32-bar performance) need: `song_track_launch / stop / attach` exports in
web/engine/Simulator.c, `sim_song_status` words 4..5, the per-block drain (exists), a
"bar count / master position" readout (`song_test_position` extended), and `sim_control`
for the SCL / ENV buttons and pads (exists). Checks: launch lands at the next bar and
leaves the other seven starts, the bar count and the MIDI clock count untouched; two
presses keep the last; stop releases every sounding note including negative-offset and
ringing notes; 16-step against 48-step for 64 bars with no drift (positions are exact
integers, so this is an equality check); eight launches at one bar play every note in
its block; scene jump overrides and re-attaches; detached ignores row advances; back to
song re-attaches at the bar; per-track PC with lead and gaps before the first note; a
late press counts late; no stuck notes (every note-on has a note-off, checked per
channel).

## 10. Points for approval (besides the removals)

1. Song end while tracks are detached (section 3.4): master keeps running, detached
   tracks keep looping, the song stops when the last track stops or on PLAY.
2. A pattern not decoded at the bar enters late in phase and counts late (3.3), rather
   than waiting a whole bar.
3. Buttons for the page switch and back-to-song (SCL, ENV, SHIFT+ENV) instead of a pad
   combination (5.2).
4. The 9.11 sentence on a gap's channel bits (section 6): a clarification of bits the
   device ignored, not a layout change; old records keep their meaning.
5. Pad colours (5.3).
6. Command 23 grows to 31 bytes (3.6).

## 11. Deferred (to add to BUILD.md's left-to-build list at the first checkpoint)

- Following external MIDI clock in song mode.
- CC automation inside a row (importing Renoise automation that does not fall at a row
  start).
