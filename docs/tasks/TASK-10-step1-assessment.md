# Task 10, Step 1: MC-707 workflow port, assessment (read only)

Version 0.1, 2026-11-07. Branch `classic-tabby/linux-build`, head 11bb153 (the task text v0.2).
No tracked file other than this one and docs/MC707-PARITY.md was changed. Nothing was pushed,
nothing was flashed.

Revision log
- v0.1 2026-11-07: first assessment against task text v0.2 (docs/tasks/TASK-10-mc707-workflow.md).

Every number is marked **M** (measured in this session on head 11bb153: `make check`, `make lint`,
`make firmware`, `make flash-budget`, the toolchain `nm` on sdk/lib/libfm1_engine.a, scripts over
the test fixtures) or **E** (estimated, with the basis given). The MC-707 facts come from Roland's
Reference Manual eng02 (RM) and Update manual eng08 (UM), read in full this day; page numbers
are the printed ones. docs/MC707-PARITY.md holds the feature matrix (section B).

## 0. The seven facts, checked

1. **SDK whole-archive: true.** `--whole-archive sdk/lib/libfm1_engine.a --no-whole-archive`
   (tools/linux/build.py line 901). build.py lines 430–446 require the sequencer and engine SRAM
   entry points (`groove_sequence_render/clock/position/transport`, `sampledrum_*`, the render
   functions). The archive is 364060 B of the 451428 B image (M). The sequencer family inside it
   is 18488 B / 130 symbols by the flash-budget grouping and 20308 B / 144 symbols counting every
   `groove_*` symbol with `nm` (M). None of it can go. web/engine/sequencer.c is the simulator's
   copy. Correct as stated.
2. **Margin: correct number, wrong conclusion about the lever.** Today's image is 451428 B with
   the development display string (M); a tag build is 32 B shorter, 451396 B, margin 2525 B against
   the hard limit 453921 (M, FLASH-BUDGET 3.2). Moving USER is the only large lever, but "the size
   is ours to set" is not true today: **both packagers refuse any other size.** sdk/Package.cs
   line 141 (`userBytes != UserSize`) and tools/linux/package.py lines 244–245 (`user_bytes !=
   USER_SIZE`, 536576) throw "Application does not fit the FM1 layout" for anything but 536576
   (M). build.py line 782 hard-codes 536576 into the variant and line 873 only checks a multiple
   of 4096. The SDK's `fm1_flash_size()` "returns zero when the fixed reservation could not be
   validated" (sdk/include/fm1.h line 154): the word *fixed* means the runtime check may compare
   against a vendor layout record, not only against `fm1_layout.user_bytes`. That cannot be read
   from the closed archive; it is a hardware item (section L.8). The redo of FLASH-BUDGET 3.4 is in
   section H.3, path by path.
3. **Mapping: done in section C.0.** Most of it holds. It breaks at clip identity (a launched
   pattern is "row N of track T", so clips cannot be reordered, copied or chained without rows)
   and at per-clip program change (events are per row, not per clip).
4. **MC-707 reference points: verified**, with corrections: the master clock STEP LEN is 2–128
   (RM p. 52), clip chain LENGTH 1–512 steps (UM p. 12), scene chain LENGTH OFF–127 master clocks
   (UM p. 5), count-in 1–128 steps (UM p. 5), undo 10 levels (UM p. 1), motion up to four external
   parameters plus pitch bend per clip (UM p. 3), per-clip PC default = clip number 0–15, or fixed,
   or OFF, LSB/MSB since v1.80 (UM pp. 4, 11). The MC-707 does **not** receive Song Position
   Pointer (MIDI chart v1.60: SPP x/x; Continue recognized only). Clock loss is not documented.
   The MC-101 shows the 16 clips of the selected track on its 16 pads (MC-101 RM p. 17).
5. **Hardware: as stated.** The control struct has 7 encoders (`fm1_controls.encoders[7]`,
   sdk/include/fm1.h line 115: K1–K6 and SELECT) plus the MASTER knob on an ADC; 14 FM1 button
   ids plus the physical SHIFT (app/smk37_controls.c lines 24–27, 307). Pads report pressure. No
   DIN in. Correct.
6. **Earlier decisions: respected.** Where this plan would touch one (4 notes per step, samples),
   it asks in section M.
7. **No chorus: nothing costed.** `nm` finds no chorus symbol in the SDK either (M).

## A. Current architecture

### A.1 The modules (what each does today, M from the sources)

| File | Size post-LTO (M) | Static RAM (M) | Role |
| --- | ---: | ---: | --- |
| app/song.c v0.4 | 7604 B | 36560 B | The song sequencer. A master clock in units (480 per 16th, bar = 7680) advanced per 128-frame block with a carried remainder. Per track: a frame (start, length), two decode buffers of 64 steps × 25 B, a state (FOLLOW, LAUNCHED, STOPPED), a queue (launch, stop, attach) landing on the next bar, a sounding table of 16 notes. Each block builds a sorted action list for its window and plays it into router lane 0. Decode-ahead on the control task (`song_poll`); the audio tick never waits on flash. Refuses to start in MIDI clock mode (line 793). |
| app/song_storage.c v0.6 | 5206 B | 15588 B | The song region: USER 69632..532480, 113 sectors: staging journal, 16 song records (4096 B each: name, tempo, 128 rows × 20 B, event table at 2624, 292 events max), 96 block sectors holding packed block records (payload ≤ 1600 B, format 0 or 1). Transactions through the staging sector; batch uploads (kind 7) with a journal; directory of live blocks per song (2048 max); compaction. All synchronous on the control task; a transaction takes three sector erases. |
| app/timed_note.c/.h v0.1 | (in LTO) | 0 | The 6-byte timed note: pitch, velocity, retrigger, offset −240..+240 units, length mantissa/exponent. Encode, decode, validate; JavaScript twin in web/timed-note. |
| app/screen.c | 32994 B | 10374 B | Every page: the stock sequencer pages (STEPS 1/7..7/7, STEP_EDIT, RHYTHM, ARP_EDIT: 5920 B M), OVERVIEW/MIX 3176 B, PROJECT/PRESET_BROWSER 1254 B, EFFECTS 680 B, SONG and TRACK_LAUNCH, ACTIONS, FM pages; shared paint/controls 21764 B (apply_controls 6500, strings 5578, draw_page_body 2584). |
| app/midi_router.c | 4271 B | 4014 B | Owners (SEQ, ARP, LIVE, 16 Thru, 8 song), held-note maps, three 128-entry queues, per-track output channel with the song override, clock out (F8 per 24 ppqn), transport out (FA/FB/FC and SPP F2 on Start), clock-source acceptance (auto over USB/BLE), the per-block hook that ticks song.c (`groove_midi_clock`). |
| app/project.c | 5796 B | 4140 B | 16 project slots + settings sector + staging sector (USER 0..69631), tuning sector at the USER end, settings (role, clock mode, MIDI config), undo checkpoints into the SDK, conversion of sampler presets to the 808. |
| app/transfer.c | 3288 B | 1144 B | SysEx transfer protocol (F0 7D 'F' 'M' 02): projects, timbres, tuning, songs (kinds 6 and 7), capability reply (command 49 family/build/state; song storage and batch flags), engine stats. |
| app/smk37_controls.c, app/board/scan.c | 2629 B, 5405 B | 230 B, 2844 B | Panel: 37 keys with two-contact velocity, 16 pads with pressure, 7 encoders, faders with pickup and bank, SHIFT shortcuts, pad-to-key navigation. The scan ISR fills a 256-entry queue of (kind, id, value) words **without timestamps**; the control task drains it (`smk37_scan_read`). |

RAM picture (M, build/pro/firmware-report.json): .ram0_data 80932 B + .ram0_bss 242812 B =
323744 B static; runtime heap 199820 B, SDK minimum 49152 B. So 150668 B (E: heap less the SDK
minimum) can become new static data before the build check fails. song.c holds 25600 B of decode
buffers (8 tracks × 2 × 1600 B) inside its 36560 B.

### A.2 Every app-side path that drives the stock pattern sequencer (M, grep over app/)

| Path | Where | Calls | Can it go? |
| --- | --- | --- | --- |
| STEPS pages 1/7–7/7, STEP_EDIT, RHYTHM | app/screen.c (edit_page_draw 4646 B, steps 938 B, move_step, toggle_step, sequence_length_adjust, step_first) | `groove_sequence_edit` ×3, `groove_sequence_length_set`, `groove_sequence_chord`, `groove_sequence_setting_edit`, `groove_step_*` ×4, `groove_drum_steps` ×2, `groove_edit_*` ×19 (record, seek, copy, paste, clear, repeat, undo) | yes: 5920 B of page code (M) plus their share of apply_controls and the string table (E 2–3 KB) |
| REC button and count-in logic | app/screen.c lines 1551–1594, 1676, 2091–2094 | `groove_edit_record`, `groove_edit_seek`, `groove_sequence_count_in` ×3, `groove_edit_undo` | yes, replaced by song-mode recording |
| Tempo | app/screen.c | `groove_tempo_edit` ×4, `groove_tempo_tap` | **no**: the SDK tempo is the master tempo for clock out and the song tick |
| ARP_EDIT page | app/screen.c | `groove_arp_*` ×16 | optional: the arpeggiator is live playing, not the pattern sequencer |
| Project load/save | app/project.c | `groove_project_apply_edit` ×3, `groove_edit_*` ×2 | **no**: `struct groove_project` (SDK, 4064 B) carries the 8 × 64 stock steps; load/save must keep applying it |
| Project transfer | app/transfer.c | `groove_edit_*` ×1, `groove_arrangement_capture` | **no**: workbench project backup |
| ACTIONS entry 14 (undo) | app/screen.c line 1867 | `groove_edit_undo` | yes |
| Simulator | web/engine/sequencer.c | the browser copy | stays (not firmware) |

Nothing in app/song.c, app/song_storage.c or app/midi_router.c calls the stock sequencer. The
stock transport still owns PLAY outside song mode; song mode takes it while a song plays
(app/song.h line 13).

## B. Parity matrix

docs/MC707-PARITY.md: 62 rows in seven groups, each with status and files; the excluded set
listed once. Headline counts (M over the matrix): implemented 15, partial 19, missing 22, not
applicable 6. The biggest "missing" blocks are recording in song mode, clip settings and the
step/event editor; the biggest "partial" blocks are clip identity and per-clip program change.

## C. Data model

### C.0 Mapping song mode onto the MC-707 (fact 3)

| MC-707 | Song mode today | Holds | Breaks |
| --- | --- | --- | --- |
| Scene = combination of playing clips (RM p. 36) | Row = one block per track + repeat + steps + flags | recall at the next bar lands like a scene reservation; 128 rows ≥ 128 scenes (UM p. 10) | a scene can be **stored** from what is playing (long press); a row cannot be written on the device at all |
| Clip (RM p. 10) | Block (64 steps, timed notes) referenced by row and track | a launched pattern is a clip playing on its own loop; polymeter works | a block has no settings (length beyond the row's, scale, direction, chain, PC); "pattern N of track T" means a clip is addressed by row, so copying rows duplicates clips and a clip cannot be reordered |
| Clip launch at the master clock (RM p. 52) | per-track launch/stop/attach at the next bar (Task 06) | yes | only "next bar"; no 2–128-step master cycle; no "end of clip" |
| Scene chain with LENGTH (UM p. 5) | row order + repeat 1–64 + loop-here + song end + queued jumps | richer than the MC-707 (a repeat count, loop-here) | LENGTH counts master clocks on the MC-707; ours counts the row's own length × repeat |
| Clip chain NEXT CLIP / LENGTH (UM p. 12) | none for a launched track; the song playhead chains rows | — | a launched track loops forever until stopped or re-attached |
| Per-clip program change (UM p. 11) | row events: PC, bank+PC, CC, gap, with lead time, per row (292 per song) | a row's PC lands before the row like a clip's PC lands on the switch | events belong to the row, not the clip: launching a clip alone sends no PC; a device not played by any track (the pedals) has no clip to hang its PC on |
| Project (RM p. 17) | song record + the project slot it names | yes | — |
| Transport (RM p. 58) | one master clock in units; MIDI clock and SPP out; internal clock only | one transport | no clock follow in song mode |

Conclusion: evolve song.c and song_storage.c (rows → scenes, blocks → clips with a header, a
clip-chain field, scene-level events kept). No parallel system; one transport.

### C.1 Clips per track and imported songs

Counts in the fixtures (M, scripts over the files this session; "distinct" = byte-identical
one-bar step content on a 16th grid):

| Fixture | Tracks | Notes | Bars | Distinct 1-bar blocks per track | Distinct 8-bar phrases per track | Max notes per step |
| --- | ---: | ---: | ---: | --- | --- | ---: |
| tests/fixtures/Glass Relay.mid | 8 | 1617 | 66 | 5, 8, 8, 11, 13, 23, 31, 32 | 7–9 | 4 |
| tests/fixtures/meridian_fault.mid | 11 | 2189 | 85 | 10–43 (median 20) | 9–11 | 3 |
| tests/fixtures/renoise-export.mid | 8 | 1002 | 68 | 13, 13, 17, 20, 23, 33, 38, 59 | 7–9 | 4 |
| tests/fixtures/the_space_between_wires.mid | 9 | 1662 | 63 | 4, 4, 5, 7, 9, 11, 18, 20, 21 | 6–8 | 3 |
| tests/midi-import/fixtures/multitrack-64bar.mid | 3 | 1600 | 64 | 2, 2, 2 | 3 | 3 |
| tests/midi-import/fixtures/wrong-room-all.mid | 8 | 256 | 8 | 1 each (plus 6 CC, 17 PC) | 1 | 1 |

So real songs exceed 16 one-bar clips per track on most tracks, but never exceed 16 eight-bar
phrases. No fixture has a step with more than 4 notes (M), so the 4-note ceiling has not bitten
the importer; it bites chords played live.

Proposal: a clip is up to 128 steps (8 bars). Storage allows 64 clips per track (6-bit clip
index in the scene row, 16 bits of block id stay); the pads show one bank of 16, SHIFT+encoder or
the OCT buttons switch banks. The importer keeps its exact timing and converts an arrangement
with this rule: split each track at the scene boundaries the importer already finds (a scene
boundary is a bar where any track's phrase changes), merge consecutive identical bars, and grow
clips up to 8 bars; if a track still needs more than 64 clips, the importer reports it and
falls back to 4-bar clips on that track. For the four Renoise songs this gives 6–11 clips per
track (M, the 8-bar column), inside one bank.

### C.2 128-step clips: sizes against the measured RAM

| Item | Grid v2 today (M) | 128-step grid (E) | 128-step event list (E, cap 512 events) |
| --- | ---: | ---: | ---: |
| Payload in flash, dense (4 notes every step) | 64 + 64×24 = 1600 B | 128 + 128×24 = 3200 B | 16 + 512×6 = 3088 B |
| Payload in flash, sparse (64 notes) | 64 + 64×6 = 448 B | 128 + 384 = 512 B | 16 + 384 = 400 B |
| Decode buffer per track (2 buffers) | 2 × 1600 = 3200 B | 2 × 3200 = 6400 B | 2 × 3088 = 6176 B |
| 8 tracks | 25600 B | 51200 B | 49408 B |
| Edit buffer (one clip being edited, RAM copy) | none | 3200 B | 3088 B + 2 B per event index |
| Undo (4 levels × one clip) | SDK: 4064 B | 12800 B | 12352 B |
| Total new static RAM | — | +41 KB | +40 KB |

Both fit: 150668 B of heap above the SDK minimum (M). The block record area is 4076 B, so a
128-step dense payload fits one block record either way (M, SONG_BLOCK_AREA_BYTES).

### C.3 Clip format: event list versus the grid

The candidates. **Grid v3** = today's v2 extended to 128 steps: one header byte per step (note
count, flags) and up to 4 timed notes of 6 B per step; CC would need a second structure. **Event
list v3** = a 16-byte clip header, then N sorted 6-byte events; two kinds:

```
note  : time u16 (0..61439 units from clip start) | pitch 7 + retrigger 1 | velocity 7 + kind 0 | length u16 (units, 1..65535)
other : time u16 | kind 1 + type 7 (CC, PC, bank MSB/LSB, pitch bend, aftertouch, pre-roll mark) | data a | data b | reserved
```

A note longer than the clip is cut at the clip end with retrigger = 0 (legato), so a tie across
the loop extends the sounding note the way song.c already treats a same-pitch legato note. Notes
due before step 0 (today's negative offsets at step 0) are stored at the end of the previous pass
(time ≥ length − 240) and fire through the same look-ahead as today.

| Criterion | Grid v3 | Event list v3 |
| --- | --- | --- |
| Bytes per note in flash | 6 B + 1 B per step (M today: 64 B per block) | 6 B |
| Bytes per CC / PC event | needs a lane structure: 3 B per event + lane header (E) | 6 B |
| Chords | 4 notes per step, hard | no ceiling but the clip cap (512, E) |
| Notes between steps, overlapping notes with own lengths | yes (offset ±240 only) | yes, any time |
| Unquantized performance | yes within ±half a step; a note later than +240 moves to the next step's slot (loses nothing in time but the slot can be full) | yes |
| CC at any time | no | yes |
| Scheduler code | today's `tick` (1860 B M) scans the current step's 4 slots per track | a cursor per track into a sorted list; smaller code (E −300 B): no slot scan, no per-step header walk |
| Worst case per 128-frame block, 8 dense clips | per block: 8 tracks × (step boundary check + up to 4 notes) + note-offs; at 300 BPM a block is 5.8 % of a step, so at most one step per track per block: ≤ 32 note-ons + ≤ 32 note-offs = 64 router entries (E) | same bound: events in the window; the cap is the router queue of 128 entries per lane (M, QUEUE) and the sounding table; with CC the count rises by the CC in the window |
| Editor on the device | pads = steps, keys = notes; a step holds ≤ 4 | pads = steps, keys = notes; a step holds a list, encoder K1 selects "event 2/5" |
| Recorder | each note needs a free slot; the 5th note in a step is dropped or moved | insert sorted; drop only at the clip cap |
| Importer | keeps exact timing today; chords > 4 would be dropped | same timing; no drop |
| Migration of v2 blocks | re-pack 64-step blocks into 128-step clips | walk steps, emit events: lossless, time = step × 480 + offset |
| Row events | unchanged | unchanged at the scene level; per-clip PC/bank move into the header |
| Host tests | tests/song and the v1 reference replay keep passing if decode stays format-aware | same; the replay compares MIDI out, not bytes |
| Code to write (E) | header widening, 128-step buffers, a CC lane module, editor for slots | decoder/validator (new), scheduler cursor (rewrite of tick's note part), editor for lists |

Cost of the event list for the realistic song (section H.2): 72 clips × 16 B headers + 1800
events × 6 B ≈ 12 KB of blocks (E); the same material as v2 one-bar blocks is 131–256 blocks × 64 B
headers + notes ≈ 19–29 KB (E from the fixture counts). The event list is smaller for real
songs because long clips need no step headers.

**Recommendation: the event list.** It costs about 6 KB of new firmware for the decoder,
validator, upgrade and scheduler cursor (E, by the size of song_storage.c's validators and
song.c's tick), about 24 KB more static RAM than today for 8 × 2 buffers of 128-step clips
(E, C.2), the same 6 B per note as today, 6 B per CC, and a cap of 512 events per clip. It is
rejected only if the SDK heap minimum cannot give the 40 KB (it can: 150 KB measured). The grid
is cheaper in nothing but familiarity, and it cannot hold CC.

### C.4 Per-clip PC, bank, CC lanes; row events

- The clip header carries program (0..127 or none) and bank MSB/LSB (or none). The scheduler
  sends them `lead` units before the clip's first pass starts, where `lead` is the device
  library's lead time for the track's channel (as the row gap does today). A clip launched from
  the pads therefore brings its own sound, which a row event cannot do today.
- CC automation is CC events in the same list, any count within the clip cap. The MC-707's cap
  of four parameters plus pitch bend per clip (UM p. 3) is a convention; ours is the event cap.
- Row events stay: they become **scene events** in the record tail (same bytes, same 292 cap),
  for devices no track plays (the pedals on channels 12, 14, 15 in the Wrong Room rig) and for
  anything per scene. Migration: a row event on a channel that is some track's channel in that
  row **may** be moved into that clip's header by the workbench (optional, with a preview); the
  firmware never moves them.

### C.5 Versioned format and migration

- Block record byte 1 (format): 0 = v1, 1 = v2 timed notes, **2 = v3 event list**. The
  validator per format exists (song_storage.c v0.6); add format 2. `song_payload_upgrade` gains
  v2 → v3 in place (a 64-step block becomes a 64-step clip).
- Song record version 3: rows become scenes with a 6-bit clip index per track beside the block
  id, a master-cycle length field, the scene's chain length; records v1/v2 stay readable;
  writing a v3 record happens only when the user saves. Nothing is erased: an old song stays
  v2 until saved, and the workbench exports it before and after.
- `.tabby` files: the workbench reads v1/v2/v3 and writes v3; the importer writes v3 directly.
- Upload path: kind 6 (single block) and kind 7 (batch) carry the format byte already; no new
  protocol command (M, song_storage.h `SONG_FORMAT_*`).
- Confirmation rule: the first boot of a v3 firmware scans and reports; it rewrites nothing
  until the user saves a song or runs COMPACT.

## D. Timing and transport

### D.1 One master clock
The master position in units stays in song.c; every clip, scene and chain is scheduled from it.
The stock sequencer keeps running only for PLAY outside song mode; after Phase 3 the SONG page
becomes the home page and the stock transport is never started (the SDK still owns the tempo).

### D.2 Launch quantize
Settings per song: master cycle = 2..128 steps (default 16 = today's bar) and per launch: next
cycle (default), end of the playing clip, or immediate (not in the MC-707; cheap for us: the
queue lands at the current window). The existing queues land at `bar` boundaries (song.c
`plan[]`); the change is the boundary function. Chains with different lengths stay in sync because
every frame is positioned from the master clock, not from its own counter (song.c frame start
+ length, Task 06), which the polymeter test already checks.

### D.3 Scenes and chains
Scene recall = today's row jump with "next bar" replaced by "next master cycle". Clip chain:
header fields next (stay / stop / clip n / back to scene) and length (steps, 0 = clip length)
plus a repeat count; the queue code already handles launch, stop and attach, so a chain is a
self-queued launch at the frame's end. Scene chain = row order with repeat and loop-here, as
today, counted in master cycles when the user sets the song's cycle smaller than a row.

### D.4 External clock follow
Today: the SDK follows F8 for the stock sequencer (WAIT / LOCKED / LOST after 2 s, BLE pulses
through a 25 ms jitter buffer, app/instrument.h lines 105–110, app/clock_sync.h) and song mode
refuses to start in MIDI mode (song.c line 793). The router already accepts one clock source at a
time over USB or BLE (`groove_midi_clock_accept`) and posts F8/FA/FB/FC/F2 into the SDK.
Proposal for song mode: count the accepted pulses in the app (24 per quarter = 80 units each),
with the BLE timestamp buffer of app/clock_sync.h (MIT, already in the tree) for BLE sources.
`song_tick` advances by the measured pulse rate between pulses and never passes the next pulse's
position until it arrives (phase lock, no drift). Start = position 0, run at the next F8. Continue
= run from the held position. Stop = hold position, release sounding notes. SPP = position ×
480 units (one MIDI beat is a 16th; exceeds the MC-707, which ignores SPP). Loss (no F8 for 2 s,
the SDK's own constant) = notes off, position held, page shows LOST; the next F8 resumes. Clock
out is suppressed in MIDI mode as today (router line 223).

### D.5 Count-in and metronome
Count-in in steps (1..128) before recording starts; MIDI Start goes out after the count-in as
the MC-707 does since v1.80 (UM p. 4). The click has no SDK entry point for song mode (the SDK
click belongs to the stock sequencer). It sounds through the internal 808 on a reserved voice
via the local-engine path song mode already uses for FM6 preview (`groove_midi_song_note` to the
control-task MIDI-in queue, one block looser than MIDI out). So the click comes out of the
SMK-37's audio output, not MIDI. A MIDI click (a note on a chosen channel) is a cheap option.

### D.6 Send-call limits
SPEC 9.6 stands: the MIDI send is control-task only, untimestamped; a note leaves at the control
task's next poll. All of the above keeps the per-block action list and lane 0 FIFO. Nothing here
can improve on the control-loop band (BUILD.md 13.4 step 12, unmeasured on hardware).

## E. Recording

### E.1 Where a timestamp can be taken (M from the sources, jitter E)
| Point | What exists | Jitter |
| --- | --- | --- |
| Key/pad scan ISR | `kbd_hw_msg_wr_atom` queues a (kind, id, value) word; no time; TIMER4 is a 24 MHz monotonic counter the ISR could read (scan.c line 795) | the scan ISR period (unmeasured; L.5) |
| Router input (USB/BLE MIDI) | `fm1_app_midi_received` on the SDK's MIDI task; `fm1_millis` (1 ms) | USB: ≈1 ms; BLE: radio delivery jitter, the SDK uses 25 ms for clocks |
| Control task | `smk37_scan_read` drains the queue; `song_poll` | the control-loop period: the simulator predicts a 3-block band ≈ 8.7 ms, hardware unmeasured (BUILD.md 13.4 step 12) |

Proposal: stamp at the ISR. A parallel array of 256 × u32 (1 KB RAM, E) holds the TIMER4 value
beside each queued word; the audio tick publishes the master position and the TIMER4 value at
each block start (two words), so the control task converts a stamp to units with one
multiply. Expected accuracy: the scan period plus one block (E). External MIDI notes get the
1 ms clock for USB; BLE notes get the packet timestamp when the SDK exposes it (it does for
clocks; for notes this is unverified, L.6).

### E.2 Overdub, quantize, undo
- Record into the clip's RAM edit copy (C.2); on each note-off insert the note sorted; the
  playing buffer is swapped at the next loop pass (the existing buffer swap).
- Input quantize: snap time to the nearest step or substep (1/2, 1/3, 1/4) when on; AREA
  (UM p. 18) later. Playback quantize (per clip 0..100 %, master, larger wins, RM p. 33): time' =
  t + (grid − t) × q, applied at decode; cheap.
- Undo: snapshot of the edit copy per level, 3088 B each (C.2). 4 levels = 12 KB (E); 10 levels
  as the MC-707 = 31 KB. Cleared on clip switch, off during real-time recording (UM p. 1).

## F. Storage while performing

Facts (M): `fm1_flash_*` is control-task only; "writes/erases briefly silence audio and
synchronize hardware caches" (fm1.h line 146); a song transaction takes three sector erases and
is synchronous (song_storage.c header). The audio tick runs from SRAM, but the router's delivery
of MIDI bytes runs on the control task, so an erase stalls MIDI out and the decode-ahead for its
whole duration. The erase time is unmeasured (L.3); NOR sector erases are typically tens to
hundreds of milliseconds (E).

Proposal: edits live in RAM; flash is written only (a) on SAVE, (b) when the transport is
stopped and the song is dirty for 10 s, or (c) on an explicit action; never while playing. The
page shows UNSAVED. Writes use today's staging transaction and recovery, so a power cut leaves
the old or the new sector. A dirty clip buffer survives a stop/start; it is lost on power-off
(the MC-707 behaves the same: unsaved projects are lost).

## G. Control map, first draft

The SMK-37 has SHIFT, OCT−, OCT+, FX, SCL, ENV, LFO, EDIT, GLO, HOME, SAVE, ARP, SEQ, PLAY, REC,
7 encoders (K1–K6, SELECT), the MASTER knob, 4 faders, pitch and mod, 16 pressure pads, 37 keys
(M). Labels are not constraints (fact 5). Conventions borrowed: MC-707 MUTE-mode split (pads 1–8
play/stop, 9–16 mute, RM p. 22), long press stores a scene (RM p. 36), [SHIFT]+step opens the
step editor (RM p. 29), [FUNC]+knob edits a whole step (UM p. 19), MC-101's 16 pads = the 16
clips of the selected track (MC-101 RM p. 17).

### G.1 Pages
| Page | Button | Pads | Encoders | Keys |
| --- | --- | --- | --- | --- |
| CLIPS (home) | HOME | 16 clips of the selected track (bank shown in the header) | K1 track, K2 bank, K3 master cycle, K4 launch mode, K5 tempo, K6 level, SELECT scene | play the selected track live |
| TRACKS | SHIFT held on CLIPS | pads 1–8 select + play/stop the track, 9–16 mute/unmute | as CLIPS | — |
| SCENES | SCL | 16 scenes of the current bank: press recalls at the cycle, long press stores the playing combination, SHIFT+pad selects the bank | K1 bank, K2 chain on/off, K3 length, K4 repeat, K5 loop-here, SELECT scene | — |
| STEP | SEQ | 16 steps of the current page of the selected clip: press selects, press again toggles the last played note (or the drum on a drum track); SHIFT+pad sets the clip's last step; OCT−/OCT+ previous/next 16 steps | K1 page, K2 clip length, K3 scale, K4 direction, K5 shuffle, K6 transpose | add/remove notes at the selected step; pressure = velocity |
| EVENT | EDIT (from STEP) | steps as STEP | K1 event n/N in the step, K2 note, K3 velocity, K4 start (units, shown as ±%), K5 length, K6 value (CC) or probability; SHIFT+K edits every event of the step | replace the selected note |
| CLIP SETTINGS | GLO | — | K1 next clip, K2 chain length, K3 repeat, K4 program, K5 bank MSB, K6 bank LSB, SELECT clip | — |
| MIX | ENV | — | faders = tracks 1–4; OCT−/OCT+ switches to 5–8 with pickup (exists in smk37_controls.c) | — |
| REC SETTINGS | SHIFT+REC | — | K1 input quantize, K2 substep, K3 count-in steps, K4 metronome, K5 playback quantize clip, K6 master | — |
| MIDI / CLOCK | LFO | — | K1 clock INT/MIDI, K2 source, K3 song channel of the track, K4 lead, K5 clock out, K6 thru | — |
| FX | FX | — | reverb / delay (exists: effects_draw) | — |
| FM6 | ARP long press or ACTIONS | — | the FM pages as today | — |
| PROJECT / SONG | SAVE long press | — | slot, name, save, load, export | — |

### G.2 Transport and global
PLAY: start / stop the master transport. SHIFT+PLAY: restart at cycle 1 (MC-707 [SHIFT]+START,
RM p. 58). REC: arm real-time recording into the selected clip (count-in if set), REC again
stops it; REC held + a step pad: step-record from that step. SAVE: commit the song to flash;
SHIFT+SAVE: save as. ARP: arpeggiator on/off for live keys. OCT−/OCT+: octave on CLIPS, page on
STEP, fader bank on MIX. SHIFT+SCL: all tracks back to the scene (today's SHIFT+ENV).
SHIFT+HOME: stop every clip, transport runs. SHIFT+SEQ: ACTIONS menu (compact, send setup, undo,
erase old data). Undo: SHIFT+EDIT (4 levels); redo: SHIFT+GLO.

### G.3 Common stage actions
Launch a clip: HOME, pad (one press). Stop a track: HOME, SHIFT+pad 1–8 (or press its playing
pad). Recall a scene: SCL, pad. Mute: HOME, SHIFT+pad 9–16. Record: REC, play, REC. Step edit:
SEQ, pad, keys; EDIT for the detail.

### G.4 Pad colours
| State | CLIPS page | SCENES page | STEP page |
| --- | --- | --- | --- |
| playing | green steady | green steady | current step: white chase |
| queued launch | green blinking on the 8ths (as today) | blue blinking | — |
| queued stop | red blinking | — | — |
| stopped, has content | dim white | dim blue | step with events: amber |
| empty | off | off | off |
| selected for editing | white steady | — | selected step: white blinking |
| recording target | red steady | — | red chase |
| muted track (TRACKS view) | orange | — | — |
| error | one red flash on the pad + a 2 s message | same | same |

### G.5 Error feedback
The existing `announce()` text for 2 s ("SONG NEEDS INTERNAL CLOCK" becomes "CLOCK LOST" etc.),
the pad flash above, and LATE / UNDERRUN counters on the CLIPS header as today.

## H. Resource budget

### H.1 Per phase (flash E unless marked; RAM E; CPU E)
| Phase | Flash | Static RAM | CPU per block | Basis |
| --- | ---: | ---: | --- | --- |
| 0 make room: USER move, removals | −8 KB (removals E; the pages are 5920 B M) | −1 KB | — | A.2, J |
| 1 timing, external clock follow | +3 KB | +0.5 KB | +1 % (pulse accounting) | clock_sync.h is 96 B per worker (M); router changes small |
| 2 clip format v3, migration, importer | +6 KB | +24 KB (8 × 2 × 3088 B buffers) | about today's | song_storage.c validators 5206 B (M) |
| 3 clip grid, launching, quantized switching, scenes basic | +8 KB | +1 KB | — | TRACK_LAUNCH + SONG pages today are inside screen.c's 32994 B (M); CLIPS/SCENES replace them |
| 4 step editing, clip settings, copy/clear | +10 KB | +3 KB (edit copy) | — | the stock editor pages were 5920 B (M) with a simpler model |
| 5 recording, overdub, quantize, count-in, undo | +8 KB | +13 KB (stamps 1 KB, undo 12 KB) | +2 % | E.1, E.2 |
| 6 clip chains, scene chains | +4 KB | 0 | — | queue logic exists (song.c) |
| 7 PC/bank/CC lanes, motion-like recording | +5 KB | 0 | + CC in window | C.4 |
| 8 FM6 preview and 808 drums in the clip model | +2 KB | 0 | — | exists |
| 9 reverb and delay controls | +1 KB | 0 | — | effects_draw 680 B (M) exists |
| **Total new** | **+47 KB (E, range 40–60)** | **+42 KB** | small | |

Against the margin: 2525 B (M). Removals alone give ≈ 8 KB (E) or ≈ 18 KB with the factory DX7
bank (J). So without moving USER only Phase 1 and a bare Phase 2 fit; Phases 3–9 cannot fit
without the move. Nothing in the list is impossible with a 64 KiB move (76 KB available, E).
Static RAM: 42 KB of 150 KB headroom (M heap minus SDK minimum).

### H.2 The realistic song
From the fixtures (C.1) and the Wrong Room material: 8 tracks, 9 clips per track of 128 steps
(72 clips), 1800 notes, 100 CC events, 20 program/bank events, 20 scene events, 10 scenes. In v3:
72 × 16 B + 1920 × 6 B + 72 × 6 B record headers ≈ 13.1 KB of block records (E) = 4 block sectors
with slack, plus the 4096 B song record = 5 sectors. Ten sectors stay free for batch uploads and
compaction (SONG_BATCH_SECTORS = 10, M).

### H.3 Capacity table per USER option (E unless marked)
Sizes M from the layout rules (USER end 0xFF000, tuning sector at the USER end, projects at
USER 0..69631, song region from 69632 to the tuning sector): app limit = 453921 + moved bytes.

| Option | user_bytes / USER base / app limit | Application space | Song storage | Clips | MIDI events | Drum samples (one slot from song storage) | Recovery |
| --- | --- | --- | --- | --- | --- | --- | --- |
| no move | 536576 / 0x7C000 / 453921 (M) | +0 B; with removals ≈ 10 KB: Phase 1 and a bare Phase 2 | 462848 B, 113 sectors, 96 block sectors (393216 B); 16 realistic songs (record slots cap) | 512 per song by format, 64 per track; ≈ 900 sparse clips by space | ≈ 65 000 notes+CC total; per song up to ≈ 58 000 if one song takes the pool | 32 KiB = 1.4 s, 64 KiB = 2.9 s, 128 KiB = 5.7 s; leaves 88 / 80 / 64 block sectors | safe |
| 64 KiB | 471040 / 0x8C000 / 519457 | +65536 B; with removals ≈ 76 KB: every phase (47 KB E) with ≈ 20 KB reserve | 397312 B, 97 sectors, 80 block sectors (327680 B); 16 songs | same per song; ≈ 750 sparse clips by space | ≈ 54 000 total | 1.4 / 2.9 / 5.7 s; leaves 72 / 64 / 48 | needs changes (H.4); SDK boot check unverified (L.8) |
| 96 KiB | 438272 / 0x94000 / 552225 | +98304 B ≈ 108 KB: every phase and a drum-sample glue | 364544 B, 89 sectors, 72 block sectors (294912 B); 15 songs | ≈ 680 sparse clips | ≈ 49 000 | leaves 64 / 56 / 40 | same as 64 KiB |
| 128 KiB | 405504 / 0x9C000 / 584993 | +131072 B ≈ 141 KB | 331776 B, 81 sectors, 64 block sectors (262144 B); 13 songs | ≈ 600 sparse clips | ≈ 43 000 | leaves 56 / 48 / 32 | same as 64 KiB |

Seconds at the codec rate: 32 kHz SEA, 228 B per 320 frames, 512 B bank header (M,
app/synth/sampledrum.h): 32768 B → 141 chunks → 1.41 s; 65536 B → 2.85 s; 131072 B → 5.72 s.

### H.4 Every path that touches flash outside the code image, against a moved boundary
| Path | Today (M) | Verdict for a move |
| --- | --- | --- |
| Packagers | Package.cs line 141 and package.py lines 244–245 refuse user_bytes ≠ 536576 | **needs change** (both, plus build.py line 782 and the identity check) |
| SDK boot check | `fm1_layout.user_bytes` compiled in; `fm1_flash_size()` returns 0 "when the fixed reservation could not be validated" (fm1.h) | **unverifiable without hardware**: if the SDK compares against a vendor partition record that the packager also rewrites, it passes; if it compares against a constant, song storage and projects die (size 0). L.8 |
| App layout constants | instrument.h GROOVE_SAMPLE_BYTES/GROOVE_FLASH_BYTES; song_storage.h 113 sectors; song_storage.c line 99 requires size == GROOVE_FLASH_BYTES; project.c lines 150, 306, 475 require ≥ | needs change (one constant each) |
| Projects, settings, staging (USER 0..69631) | addressed from the USER base | **data loss on the move**: the old area is under the new image/VM/BTIF. Backup in the workbench before, restore after; or a relocating build first (K, Phase 0) |
| Songs (USER 69632..) | addressed from the base | old records are overwritten by the new project area for a 64 KiB move (new projects 0x8C000..0x9CFFF cover old song records 0x8E000..0x9DFFF); old block sectors survive at a shifted region offset and are self-describing (FM1B headers) | needs a backup or a relocating build |
| Tuning sector | addressed from the USER end (0xFE000) | safe |
| Update loader (ota.bin, type 100 entry, < 32 KB) | writes the image 0..FLASH_BIN_SIZE; VM and BTIF positions come from the package's layout records | believed safe (FLASH-BUDGET 3.4 items 1, 5): VM and BTIF are rebuilt by the runtime at the new place; verify on hardware (L.8) |
| Force flash / migration mode | WebUpdate.js lines 318–329: legacy or migration mode writes the full image | safe (same loader) |
| Interrupted update | the loader identity persists; the workbench resumes (`mode='loader'`, resume) | safe; a device left in the loader resumes with either layout |
| Workbench update flow checks | line 106: image ≤ 1044480 and 4096-aligned; line 654: song capability must report 462848; line 660: sample capacity 446464 or 0 | needs change (line 654 for the new region size) |
| "Check / initialize samples" | samplesWrite uses device commands 12/13/14; Classic Tabby removed the sample transfer (samples.c header); the button belongs to the V01 flow | safe: the device rejects the commands; confirm the button stays hidden with songStorage set (not verified this session) |
| Song mode workbench paths | read/write through kinds 6/7 and the capability reply, no absolute offsets (M, grep) | safe once the capability reply carries the new size |
| Simulator | Simulator.js lines 26–27, 155 hard-code 536576 | needs change |
| Restore factory V16 | absolute 0xF4000..0xFDFFF (WebUpdate.js line 415) | safe for code; it overwrites up to 10 song block sectors in any layout (also today) |
| Switching back to official V01/V16 | stock package restores its own layout; our data at 0x8C000+ reads as an invalid sample bank → EMPTY → initialize | safe (data loss expected, the stock warning text already says so) |
| BTIF and pairings | BTIF = USER base − 4096 moves with the base | pairings lost once; the vendor runtime is believed to rebuild BTIF (unverified, L.8) |
| key_mac 0xFF000 | never written by any path (M) | safe |

## I. Drums and effects

### I.1 Drums
| | 808 (SDK) | User drum-sample region |
| --- | --- | --- |
| Storage | none | from song storage: 32/64/128 KiB = 1.4 / 2.9 / 5.7 s at 32 kHz (M codec constants) |
| Voices | the 808 engine's | sampledrum: 24 voices, 8 pads, 6 parameters (M, sampledrum.h) |
| Code | present (`groove_preset_drum_default`) | the SDK sampler is linked (1862 B M of `sampledrum_*`, `fm1_sea_*` 762 B); the app glue is gone: bank validation, `fm1_flash_map` binding, transfer kinds for samples, `groove_samples_status`. Rebuilding it: ≈ 4–6 KB firmware (E, the V01 samples.c was of that order), a region constant, workbench sample upload reinstated |
| Fit with the plan | zero cost; drums are previews | costs song storage and Phase 8 time; revisits decision 6 (asks in M) |

Recommendation: 808 only. A sample slot can be added later from the 128 KiB option if wanted.

### I.2 Effects
Reverb and delay are in the SDK; `fm1_fx` is 698 B of code and 48832 B of state (M, nm). The
EFFECTS page exists (effects_draw 680 B M: track sends, shared reverb time, delay time/feedback,
return, delay sync). They apply to the internal mix only: FM6 and the 808. The glue needed is the
page's place in the new map (G.1 FX) and nothing else. No chorus.

## J. Removals and simplifications
| Item | Bytes freed | Depends on it |
| --- | ---: | --- |
| Stock sequencer pages (STEPS 1–7, STEP_EDIT, RHYTHM) and REC logic | 5920 B (M) + ≈ 2 KB of apply_controls/strings (E) | nothing after Phase 3; the stock pattern still loads with the project (SDK struct) |
| ARP_EDIT page | inside the 5920 B above (edit_page_draw shares code); keeping it costs ≈ 1 KB (E) | the live arpeggiator; keep |
| ACTIONS undo entry | ≈ 100 B (E) | — |
| Factory DX7 bank (fm_factory.c) | 10233 B (M, tokens 9399) | FM_QUICK preset select, project.c's sampler-to-808 default, every FM6 timbre not stored in a project; the DX7 user library sectors are already song storage, so removing the bank leaves no DX7 presets but the project's eight. Keep unless Phases 4–5 overrun (M.5) |
| samples.c | 1298 B (M) but it is the song poll entry point | keep |
| fm_library.c, presets.c | 14 B, 22 B (M) | nothing to gain |
| SONG and TRACK_LAUNCH pages | replaced, not removed | — |
| transfer.c project arrangement export | ≈ 0; keep | workbench backup |
| **Total** | **≈ 8 KB (E) without the DX7 bank, ≈ 18 KB with it** | |

## K. Phased roadmap

Each phase: deliverable, host/simulator tests, hardware tests, the MC-707 behaviour check.

**Phase 0 – make room.** (a) The USER decision (M.2). (b) A probe build with user_bytes 471040
flashed by the user after a full workbench backup, to settle L.8 before any code depends on it.
(c) Packagers, build.py, layout constants, capability reply, WebUpdate.js line 654, Simulator.js.
(d) Migration: workbench backup of projects, timbres and songs before the update, restore after;
or, if asked, a relocating build on the old layout first. (e) Removals (J). Tests: host suite,
crosscheck, a package test that the fit formula accepts the new size; simulator with the new
flash size; hardware: boot, projects restored, songs restored, Bluetooth re-paired, a stock V16
restore and back. MC-707 check: none.

**Phase 1 – timing and external clock.** Pulse-locked song tick, Start/Stop/Continue/SPP in,
clock loss. Tests: host: a pulse-train test (drift < 1 unit per 1000 pulses, SPP positions,
Continue from a held position, loss after 2 s); simulator: the existing song tests unchanged;
hardware: MC-101 as master over USB, DIN out to a timestamped monitor, the band and drift
(L.6). MC-707 check: the MC-101/707 as slave to Classic Tabby's clock and the reverse, both
stay locked over 10 minutes.

**Phase 2 – clip format v3 and migration.** Decoder, validator, upgrade, scheduler cursor,
workbench reader/writer, importer output. Tests: host: vectors for v3 (like
tests/timed-note/vectors.txt), v2 → v3 lossless on every fixture, the v1 reference replay
identical; simulator: a song uploaded in v3 plays byte-identical MIDI to v2; hardware: upload,
play, compact, power cut during a save (staging recovery). MC-707 check: none.

**Phase 3 – clip grid, launching, quantized switching, scenes basic.** CLIPS/TRACKS/SCENES
pages, master cycle 2–128, launch modes. Tests: host: queue landing on cycle boundaries of 2, 12,
16, 128 steps, end-of-clip mode, polymeter; simulator: pad colours and page targets; hardware:
BUILD.md 19.5 steps 2–11 re-run plus master cycle 8 and 32. MC-707 check: launch and scene
timing against the MC-707's 12 o'clock with the same cycle setting.

**Phase 4 – step editing and clip settings.** STEP/EVENT/CLIP SETTINGS pages, copy/clear,
length/scale/direction/shuffle/transpose. Tests: host: editor model (insert, select, edit all,
delete, last step); simulator: a step with 7 notes edited through the list; hardware: entry
speed and pad feedback. MC-707 check: step edit C1–C4 semantics (RM p. 29) and [FUNC]+knob.

**Phase 5 – recording, overdub, quantize, count-in, undo.** ISR timestamps, edit copy, undo
levels, metronome. Tests: host: a synthetic key stream with known times records within ±1 block;
quantize snaps; undo depth; simulator: count-in then Start out; hardware: L.4 and L.5 measured
first, then a recorded 16th-note line against a DAW's recording of the same MIDI out. MC-707
check: overdub and real-time erase behaviour (RM pp. 32, 35).

**Phase 6 – clip chains and scene chains.** Tests: host: chain stay/stop/next/back, length and
repeat, scene chain with lengths; hardware: 19.5 steps 6, 8, 10 re-run with chains. MC-707
check: NEXT CLIP / LENGTH (UM p. 12) and scene chain (UM p. 5) side by side.

**Phase 7 – PC/bank/CC lanes.** Per-clip PC/bank with lead, CC events, CC recording from the
encoders. Tests: host: lead timing, bank order (MSB, LSB, PC), CC in window; hardware:
BUILD.md 23.5 steps 16–18 re-run with per-clip programs. MC-707 check: Tx Program Change
Number default/fixed/off (UM p. 11).

**Phase 8 – FM6 and 808 in the clip model.** Local preview per track, drum track step entry.
Tests: simulator; hardware: latency of the preview path. MC-707 check: TR-REC (RM p. 30).

**Phase 9 – reverb and delay controls.** The FX page in the new map. Tests: simulator targets.

## L. Hardware measurements before Phase 1

Every item needs the device; none may be flashed or published by the agent. An "instrumented
build" means a development build that adds counters to the engine-stats reply (transfer.c
already carries render, peak and overload ticks) and exposes them in the workbench's device
panel; the counters are read over USB, so no monitor is needed for items 1, 3, 4 and 5.

1. **Control-loop period under load.** Counter: max and mean of `fm1_millis()` deltas between
   `groove_samples_poll` calls, reset on read. Load: a song with 16ths on all 8 tracks, CLIPS page
   open, encoders turned. Overlaps BUILD.md 13.4 step 12 and 19.5 step 13.
2. **MIDI out jitter.** Timestamped monitor on DIN and on USB; the same song; spread and drift
   over 2 minutes; compare DIN and USB. Overlaps 13.4 step 12.
3. **Flash erase and write stall.** Instrumented build: time around `fm1_flash_erase` and
   `fm1_flash_write` (one sector each) in COMPACT, max kept; run COMPACT while a 16th-note line
   plays and read the gap on the monitor. Decides F's "never while playing" and whether a
   stopped-only save is enough.
4. **Key scan to router latency.** Instrumented build: stamp hw_msg entries with TIMER4 at the
   ISR and at `smk37_scan_read`; histogram of the delta; plus the MIDI monitor from key press
   (a contact closure on a second MIDI input, or the DAW's audio of the key click) to note out.
5. **Scan ISR period.** Counter of `scan_isr` calls per second and the max gap. Decides the
   timestamp jitter (E.1).
6. **External clock follow.** MC-101 as master over USB (and over BLE through a phone or the
   H4MIDI's USB host if it exposes BLE; otherwise USB only): lock time, band of note out against
   the master's own note out, behaviour on stopping the master (LOST after 2 s). Overlaps 23.5
   step 18 (devices locked to Classic Tabby's clock) in the other direction.
7. **Pad LED colours and pressure.** The set in G.4 judged by eye; pressure curve for velocity
   entry. Overlaps 19.5 step 12.
8. **The USER boundary probe.** After a full workbench backup: a 471040 build; boot; the ACTIONS
   page shows song storage status (size 0 would show SONG STORAGE ERROR); save a project; pair
   Bluetooth; power-cycle; restore V16 and back. If the device stops answering, force flash the
   current release. This is the one item that can leave the device needing recovery; it is also
   the one every later phase depends on.
9. **DIN jack TRS type** (23.5 step 1) and **the H4MIDI routing** (23.5 steps 1–5) are
   unchanged and still open.

## M. Risks, fallbacks, decisions

Risks: (1) the SDK rejects a moved USER (fallback: no move, Phases 1–2 only, or the DX7 bank
removed for a few more KB); (2) the control-loop band on hardware is wider than the simulator's
8.7 ms (fallback: recording timestamps at the ISR still make recording exact; playback jitter
stays what it is today); (3) flash stalls are long (fallback: saves only when stopped, already
the proposal); (4) the event list's RAM (fallback: one decode buffer per track with a larger
look-ahead, −24 KB); (5) 16-pad ergonomics for 128 scenes (fallback: 8 banks × 16 is already
one SHIFT away).

Decisions needed, each with a recommendation:
1. Clip format: the event list v3 (C.3)? **Recommend yes.**
2. USER move: 64 KiB now, 96 KiB held in reserve, 128 KiB only with a drum-sample slot?
   **Recommend 64 KiB**, after the probe (L.8).
3. Migration for the move: workbench backup/restore, or a relocating build on the old layout
   first? **Recommend backup/restore** (the flows exist); the relocating build only if you want
   no PC in the loop.
4. Clips per track: 16 per bank, 64 stored, importer groups into 8-bar clips (C.1)?
   **Recommend yes.**
5. Factory DX7 bank: keep (10233 B)? **Recommend keep** unless Phase 4–5 overruns.
6. Drums: 808 only, no sample region (revisits decision 6 only if you say so)? **Recommend 808
   only.**
7. Metronome: internal 808 click through the preview path, with a MIDI-note option?
   **Recommend the internal click.**
8. Undo depth: 4 levels (12 KB) or 10 (31 KB)? **Recommend 4.**
9. Scenes: rows are scenes, 128 per song, 8 banks of 16 pads? **Recommend yes.**
10. External clock: song mode follows MIDI clock with SPP and Continue (exceeds the MC-707)?
    **Recommend yes**, Phase 1.
11. The probe build (L.8) before Phase 0 code: do it on your device with a backup first?
    **Recommend yes**; it is the gate for everything after Phase 2.
12. Arpeggiator page: keep? **Recommend keep** (≈ 1 KB).
13. The 4-notes-per-step decision (fact 6) is superseded by the event list's clip cap; the
    importer keeps exact timing. Confirm? **Recommend confirm.**
