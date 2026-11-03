# Task 03, Step 1 — read-only assessment (song mode)

Version: 0.3
Revision log:
- v0.3, 2026-11-02: two format additions approved after checkpoint (a): the row record gets
  a step-length field (16/32/48/64, default 64) and the song header gets eight per-track
  output channels. Row record 10 -> 12 bytes, rows move to offset 64, song body CRC now
  covers bytes 20..1599. Decisions 6 and 7 in 9.1; playback rules in 9.5. No code change.
- v0.2, 2026-11-02: section 9, approved decisions and final block/row/song formats, reclaim
  and lookup design, migration and transfer definitions. Formats in section 9 are final.
- v0.1, 2026-11-02: first assessment against commit 5e5f0d7 (Task 02 state, firmware unchanged
  since Task 01). No code changed. Figures from build/pro (Track B), `make flash-budget`,
  `nm` on sdk/lib/libfm1_engine.a and web/engine sources.

## 1. Flash regions (confirmed in code)

app/instrument.h:331-339 and app/project.c:18-22, 160-176:

| Region | USER offset | Bytes | Sectors | Source |
| --- | ---: | ---: | ---: | --- |
| Project slots 0..14, settings sector 15 | 0 | 65536 | 16 | GROOVE_PROJECT_SLOTS = 16, SETTINGS_SECTOR = 15 (sector 15 holds slot 15's project *and* the device settings in one record) |
| Staging sector (projects, tuning journal, DX7 library stage) | 65536 | 4096 | 1 | STAGING_SECTOR = 16; fm_library.c STAGE = 16*4096 |
| Sample bank | 69632 (0x11000) | 446464 (GROOVE_SAMPLE_LIMIT) | 109 | GROOVE_SAMPLE_OFFSET; limit = LIBRARY_OFFSET − SAMPLE_OFFSET |
| DX7 user library (4 banks) | 516096 (0x7E000) | 16384 | 4 | GROOVE_LIBRARY_OFFSET = TUNING − 4*4096 |
| Tuning / session sector | 532480 (0x82000) | 4096 | 1 | GROOVE_TUNING_OFFSET = GROOVE_FLASH_BYTES − 4096 |
| Total | | 536576 | 131 | = USER region (package-report user_bytes) |

The sample bank and the library are **contiguous**: one region of **113 sectors = 462848 bytes**
from 69632 to 532480. `GROOVE_SAMPLE_BYTES` (466944) counts to the end of USER and is only
used by the capability replies (transfer.c cmd 11/21) and the workbench; `GROOVE_SAMPLE_LIMIT`
(446464) is the real bank limit (transfer.c cmd 22, WebUpdate.js:659 expects exactly 446464).
Legacy banks larger than the limit are detected by project.c `tuning_blocked()` (reads the
bank header at 69632) and fm_library.c `conflict()`; both go away with the sampler.

Usable for songs (proposal, section 6): 113 sectors − 1 song staging − 16 song sectors =
**96 block sectors = 393216 bytes** of block store, plus 65536 bytes of song/row records.

## 2. Sampler and DX7 user library dependencies

Exclusive app code (removable), with the current linked sizes from `make flash-budget`
(nm attribution for LTO units, map for -fno-lto units):

| Item | Where | Bytes (approx.) |
| --- | --- | ---: |
| app/samples.c, whole file (bank header validation, flash map/bind, transfer begin/write/finish/read/cancel) | all 241 lines; callers: transfer.c cmd 11-16, sound.c init/poll, Simulator.c | 1420 text + 532 data |
| app/fm_library.c library part: `groove_fm_library_write` 504, `_read` 288, `_recover` 220, `_init` 96, `_available` 28, `groove_fm_pack` | fm_library.c:92-182 | ≈1140 |
| app/fm_library.c **kept**: `groove_fm_unpack`, `groove_fm_program` (factory voice loader, used by sound.c:783/953 and fm_factory.c) | fm_library.c:20-62, 113-120 | ≈400 stays |
| app/transfer.c: commands 11-16 (sample status/begin/write/finish/read/cancel), kind 4 (library bank), sample fields in cmd 17/21/22, `status==3` activity checks | transfer.c:67, 100-109, 135-161, 173, 203, 254, 312, 327 | ≈500 (est.) |
| app/screen.c: "SAMPLER" source name, sampler knob map, pad hints, "SLOT", "REDUCE SAMPLE BANK" | screen.c:149, 577, 826-830, 875, 895, 915, 939, 1112, 1597 | ≈150 (est.) |
| app/presets.c: sampler preset defaults and drum mapping | presets.c:31, 192-201, 242-251 | ≈200 (est.) |
| app/smk37_controls.c: white keys trigger sample slots | smk37_controls.c:193-200 | ≈60 (est.) |
| project.c `tuning_blocked()` and the TUNING_SPACE result, `groove_fm_library_recover` call | project.c:288-296, 311, 380, 461, 773 | ≈120 (est.) |
| tools: build.py `extra` list entries, flash-budget.py groups, synth.json `sram_required` names | tools/linux/*, sdk/synth.json | 0 (checks only; synth.json is pinned and must keep passing) |

**Estimated app-side code flash recovered: 3.5–4.0 KB** (1.4 KB certain from samples.c, 1.1 KB
certain from fm_library.c, the rest estimated until a build). Data RAM: ≈560 bytes.

Not removable (binary SDK, one object linked with --whole-archive): the sampler engine
`sampledrum_*` (1856 B text), the SEA decoder `fm1_sea_decode*`, `fm1_codec_sea_mono_s16_run`,
`sample_dqt` (≈2.3 KB), and the GROOVE_SAMPLE source type inside sound.c's binary twin. These
stay in the image. `sampledrum_lpf20_asm` and `sampledrum_mix_asm` are in sdk/synth.json
`sram_required`, so Test-Firmware requires them to remain linked in SRAM. The sampler can only
be **disabled**: the GROOVE_SAMPLE type is refused by `groove_source_set` in app code, hidden
in the source list, and `groove_samples_init/poll` become stubs returning "empty". The engine's
default track 5 = GROOVE_SAMPLE (sound.c:1051) is overridden by the app's project defaults.

Workbench (sdk/, changes allowed in Task 03 per the task text): WebUpdate.js:651-660 capability
check (`le(info,4,4)===446464`), :724-749 samplesRead/Write; Samples.js (whole file, 202 lines);
Simulator.js:81-90 worker 'samples' and :84 (keeps the final 20480 bytes for library + tuning),
:329 preview, :479-486 sample key styling, :74-79/:250-253/:657-659/:986-1015 library UI;
Update.html.in `#sample-section` :277-293, `#sample-check` :232 and its logic :514-515/:710-727/:875,
library `<details>` :268-276 and handlers :535-536/:573/:750/:837-856, manual chapters :369-374;
I18n.js 123 + 39 strings. Simulator.c exports sim_sample_*, sim_library_* (:446-481, :503-514).

## 3. Stock sequencer: what is where, and what the SDK exposes

- The sequencer is **inside libfm1_engine.a** (web/engine/sequencer.c is its source twin for
  the simulator; names and sizes match: `sequence_event` 942 B, `sequence_pulse`,
  `sequence_transport`, `groove_sequence_render` 366 B, `groove_sequence_clock_at`, all
  `FM1_DSP_CODE` in `.volatile_ram_code`). `groove_note` / `groove_note_ex` are **local** (t)
  symbols: the app cannot call them.
- Step advance: `fm1_engine_render` → `render()` → `groove_sequence_render()` once per
  128-frame block (2.902 ms at 44.1 kHz). Internal clock: `phase += tempo*4*128` per block,
  a step fires when `phase >= PERIOD/100*(100±swing)` with PERIOD = 44100*60; gates are
  released by the same loop. External MIDI clock: `groove_sequence_clock*` from the engine's
  MIDI handler, 6 pulses per 16th. Ties, probability, chords and parameter locks live in
  `sequence_event` (sequencer.c:169-246).
- **Per-block audio-context hook that the app already owns:** the engine's first action in
  `groove_sequence_render` is `groove_midi_clock(0, tempo)` (app/midi_router.c:166), followed
  by `groove_midi_transport(0, status)` on Start/Stop/Continue and `groove_midi_note(track,
  note, velocity)` for every sequenced note. These are `FM1_AUDIO_CODE` functions in app/ and
  are imported by the archive (nm -u). They are the only audio-thread entry points into app
  code besides the panel scan ISR.
- MIDI out: `groove_midi_note` → `enqueue()` into lock-free lanes → `groove_midi_poll()`
  (control task) → `fm1_midi_send_port` with held-note bookkeeping, dedup, sustain and
  recovery (midi_router.c:154-285). Clock/SPP/transport: `groove_midi_clock` emits F8 from its
  own phase accumulator (24 ppqn), `groove_midi_transport` emits F2 00 00 + FA/FB/FC. All of
  this is app code.
- Notes into FM6 on a given track: **only** `fm1_midi_post()` (control task, "no ISR") into
  the instrument's MIDI input; the engine's `midi()` handler (sound.c:889, audio context)
  routes by the track's input channel (`groove_midi_input_channel`) to `message(track, …)`,
  recording it if REC is on and arpeggiating it if that track's ARP is enabled. Posted
  notes are consumed on the next audio block. There is no timestamped scheduling
  (fm1.h:96 "No receive-timestamp scheduling").
- Audio-thread rules (fm1.h, fm1_engine_control.h): audio code and everything it calls must
  be `FM1_AUDIO_CODE` (section `.volatile_ram_code`, SRAM, safe during flash programming);
  no flash, allocation, UI, blocking or RTOS calls; one producer/consumer queues with
  `csync` barriers as midi_router does. Flash read/write/erase only from the control task.
  `fm1_engine_pause/resume` bracket control-task edits of audio-visible state.
- Control task cadence is not visible in source (the SDK calls `groove_screen_control`);
  screen.c budgets 4 ms per paint slice (screen.c:1764). Measure on hardware in Step 3.

**Conclusion:** the SDK exposes enough for an app-side song sequencer without touching the
binary:

1. Clock: run the song step clock inside `groove_midi_clock()` (every block, with the
   current tempo), mirroring the stock phase arithmetic, so step boundaries are
   block-accurate like the stock sequencer. The stock pattern sequencer is left stopped
   (song mode posts FC) and song mode owns transport, F8, F2 and FA/FB/FC through the
   router functions it already has.
2. MIDI out: enqueue song note on/off into the router lanes with a new owner id (SONG_OWNER)
   so held-note tracking, dedup and panic cover song notes; identical timing to stock SEQ.
3. FM6 preview: song note events are also pushed into a small lock-free queue drained by
   the control task into `fm1_midi_post()` on the track's input channel. Preview latency =
   control-task period + ≤1 block; MIDI out is not affected. The per-track SEQ mode
   (`groove_midi_mode`: 0 LOCAL, 1 BOTH, 2 MIDI) selects the paths, as it does for the
   stock sequencer; `SEQ_OFF` is honoured.
4. External MIDI clock (GROOVE_CLOCK_MIDI) has no per-pulse app callback in audio context;
   F8 is visible to the app only in `fm1_app_midi_received` (routing task). v1 song mode
   runs from the internal clock (SMK-37 as master, which is the M8 cueing use case);
   slave mode is a later step via the routing-task hook.

Least invasive alternative if the hook proves unsuitable: drive the stock pattern sequencer
row by row (load each row's 8×64 `groove_step` cells with `groove_sequence_replace` at the
row boundary). That keeps timing in the binary but cannot play the v0.3 note format
(overlaps, independent lengths), so it is not recommended.

## 4. RAM

| Item | Bytes |
| --- | ---: |
| Internal SRAM 0x01c00000–0x01c80000 | 524288 |
| Static: .ram0_data 75940 + .ram0_bss 191356 + .boot_info 52 | 267348 |
| Runtime heap (HEAP_BEGIN 0x01c41420 to 0x01c7fd2c), minimum required 49152 | 256268 |
| Largest static consumers | fm1_fx_states 48832, BT PCM 16384, scratch 8192, paint 7680, record 4096, undo 4064, pattern 2048, DX7 tables 4096 |

Heap use at runtime is not reported by the SDK; engine instances (DX7 8 voices, 303, …) and
transfer buffers come from it. Song mode runtime need (all static, in app bss):

| Structure | Bytes |
| --- | ---: |
| Current row decoded: 8 tracks × 64 steps × (1 header + 4 × 3) | 6656 |
| Next row preloaded (same) | 6656 |
| Active note table for note-offs: 8 tracks × 32 entries × 4 B (note, velocity, remaining steps, flags) | 1024 |
| Song row table in RAM: 128 rows × 10 B + header | ≈1300 |
| Preview queue (audio → control) 128 × 4 B + indices | ≈544 |
| FM6 per-track voice age table (stealing) 8 × 8 × 2 | 128 |
| **Total** | **≈16.3 KB** |

Comfortable against 256 KB of heap headroom; removing the sampler frees ≈0.5 KB of app
statics only (its engine state is inside the binary).

## 5. Flash budget consequence (important)

App image 453892 B, hard limit 453921 B: **29 bytes free**. The sampler/library removal
recovers ≈3.5–4 KB. A song sequencer (clock, note table, MIDI/preview paths), storage with
staging and CRC, migration prompt, and a SONG page will cost an estimated 6–10 KB. Song mode
therefore cannot land on its own: it needs the Phase 1 page removals already planned in
docs/FLASH-BUDGET.md section 4 (DX7 operator editor pages 3.9 KB, tone editor 1.9 KB, parts
of the step editor and effects pages; net headroom estimated 7–12 KB). Proposal: do the
removals in the same Step 2 checkpoint order: (a) sampler + library out, (b) FM_EDIT/FM_ENV/
FM_LFO and TONE_EDIT pages out, measure, (c) song mode in. Each checkpoint reports the image
size.

## 6. Proposed formats

### 6.1 Block (v0.3 note format)

Per step: 1 header byte, then 0–4 notes of 3 bytes.

- Header: bits 0-2 note count (0..4), bits 3-5 probability (0 always, 1..7 = 1/8..7/8, as
  stock), bit 6 alt tuning, bit 7 reserved (ratchet/accent later).
- Note: byte 0 pitch 0..127 (bit 7 reserved); byte 1 velocity 1..127 (bit 7 = "retrigger if
  the same pitch is still sounding", default 0 = legato continue); byte 2 length in 16th
  steps 1..255 (so a note can ring up to ~4 rows past its start).
- Chords are several notes. Same-pitch overlap on one track is collapsed (MIDI cannot
  express it); retrigger sends off then on.
- Size: empty step 1 B, full step 13 B; worst-case block 64 + 768 = **832 B**; typical
  blocks 120–400 B.

Storage: packed variable-length block records inside 4 KiB sectors (sector header 16 B:
magic 'FM1S'-style, version, generation, CRC-32 over the payload using the existing
`groove_crc32`; each record: song id 4 bits + block id 8 bits, length 12 bits, then the
bytes). Playback never reads flash: a row is decoded into the fixed RAM structure above in
the control task while the previous row plays (next row preloaded one bar ahead), so
compaction has no timing cost. Capacity, 96 block sectors:

| Content | Blocks per sector | Blocks |
| --- | ---: | ---: |
| Worst case, every step 4 notes (832 B) | 4 | **384 guaranteed** |
| Dense: a 4-note chord every 4th step, single notes elsewhere (≈400 B) | 10 | ≈960 |
| Typical mono line, 16 notes per block (≈112 B) | 36 | ≈3450 |

Alternative kept for comparison: fixed 768-byte slots (no header, probability packed into
spare bits) give 5 per sector = 480 blocks on 96 sectors, or 555 on all 111 data sectors
without song sectors, matching the "about 550" target, but every block costs 768 B whether
empty or full. Recommendation: packed records; a song never needs 384 distinct full blocks,
and real content lands near the "dense" row.

### 6.2 Song record (one sector per song, 16 songs)

Header (magic, version 1, generation, CRC, commit word as in project.c `struct header`),
name 12 chars, project slot 0..15, flags (loop row, jump mode BAR/ROW, tempo override
0 = project tempo), row count, then up to **128 rows × 10 B**: block id per track (0 = empty,
1..255) and repeat count 1..64, flags (loop here). Max per song: 128 rows, 255 blocks, 8
tracks, 4 notes per step. 16 songs pair 1:1 with the 16 project slots by default (a song
may point at any slot).

Writes use the project.c pattern: payload → song staging sector (first sector of the song
region, with header.target = destination sector, commit word written last) → destination
erase + program → readback; `groove_storage_prepare`-style recovery completes an
interrupted copy before any new transaction. Block sectors are rewritten the same way (the
staging sector is shared by song and block writes; one transaction at a time).

### 6.3 Migration

The song region starts at 69632, where a legacy sample bank puts `SAMPLE_BANK_MAGIC`
0x53314d46, and at 516096 a legacy DX7 bank puts `BANK_MAGIC` 0x31424d46 (fm_library.c:14).
New song/block sectors use new magics with a different first word. On boot the app checks
the 113 sectors: if any old magic (or any non-erased sector without a song magic) is
present, the screen shows "OLD SAMPLE/DX7 DATA FOUND — SHIFT+SAVE TO INITIALIZE SONG STORAGE"
and song mode stays disabled (projects still work) until the user confirms; initialization
erases only those sectors. Nothing outside USER, never the tuning sector, never key_mac.

### 6.4 Transfer and workbench

New transfer kinds 5 (song record, 4096 B, target = song 0..15) and 6 (block sector image,
4096 B, target = sector 0..95) through the existing begin/write/finish path (transfer.c:66),
plus a capability bit in cmd 22 (out[8] gains bit 2 "song storage", and the sample limit
field becomes 0). The workbench's capability check (`===446464`) is replaced by "0 or 446464".

## 7. Controls and screen (proposal)

- **SONG page** (new page id, opened with SHIFT+SEQ from HOME; SEQ alone keeps the stock
  step page): header "SONG 03 WRONG ROOM   BAR 2/4", row list of 8 visible rows with the
  current row highlighted, the queued row marked ">", per row "R01 x2  B1 B1 .  B3 B3 . . ."
  (block ids per track or "."), and a footer with the K1–K4 assignments.
- Pads 1–16 = rows 1–16 (K4 or SHIFT+OCT pages rows 17–128): press queues a jump; the pad
  blinks until it lands; the landed row's pad stays lit. PLAY starts/stops the song (song
  mode owns transport); REC is unused in v1.
- K1 scroll/select row, K2 repeat count, K3 block id of the selected track in that row
  (select track with SHIFT+pad 1–8 as today), K4 jump mode BAR / ROW. SAVE writes the song.
- **Note editing on the device: stays in the workbench for v1.** The stock STEPS page
  (one note + chord id per step) cannot show four independent notes; a device editor for
  the v0.3 format is a later task. The device can audition a block (hold a pad in SONG page
  with SHIFT) and clear a block assignment.
- **FM6 preview / external switch:** on the SONG page, SEQ + pad 1–8 cycles that track's
  SEQ mode LOCAL → BOTH → MIDI (calls `groove_settings_midi(track, 0, +1)`, which already
  releases gates on the old route); the row list shows the mode as a one-letter tag per
  track (L/B/M). This is fast, one gesture, and uses the existing setting. Preview tracks
  should have ARP off (the engine arpeggiates posted notes when ARP is enabled on that
  track).
- Voice stealing on FM6: the song sequencer tracks the sounding FM6 notes per track; when
  a 9th note would start, it sends note-off for the oldest sounding note of that track to
  FM6 only (MIDI out still gets every note-on and its real note-off). Chords are started
  lowest pitch first so stealing is deterministic.

## 8. Open points for the approval

1. Checkpoint order with the page removals (section 5), since the 29-byte margin blocks
   any addition before removals land.
2. 16 songs × 128 rows (one sector per song) vs 8 songs (8 more block sectors).
3. Packed block records (recommended, 384 blocks guaranteed) vs fixed 768-byte slots.
4. Internal clock only for v1 song mode; MIDI-clock slave later.
5. Note editing stays in the workbench for v1.

## 9. Approved decisions and final formats (v0.2, 2026-11-02)

Approved by the user after the Step 1 report. These formats are **final**: a second session
builds the MIDI importer against this section. Any later change to a byte layout here stops
the work and goes back to the user first.

### 9.1 Decisions

1. Checkpoint order: (a) sampler and DX7 user library out, with the migration prompt;
   (b) DX7 operator editor pages (FM_EDIT / FM_ENV / FM_LFO) and the tone editor
   (TONE_EDIT) out, keeping on-device DX7 preset select and the existing macros;
   (c) measure; (d) song mode in. Flash free is reported after every checkpoint. After song
   mode at least **4 KB of flash headroom** must remain for the scene PC/CC work; if the
   measurement after (c) says that cannot happen, stop after (c) and list further removal
   candidates with sizes before building song mode.
2. 16 songs, 128 rows per song, 255 blocks per song.
3. Packed block records (section 9.4), with the reclaim and lookup design in 9.6 and 9.7.
   Decoding always runs ahead of the row change; playback never waits on flash.
4. Internal clock only for v1. **Known limit:** with the clock source set to MIDI
   (GROOVE_CLOCK_MIDI) song mode does not run; the SMK-37 is the clock master. The stock
   pattern sequencer keeps its external-clock behaviour.
5. Note editing in the workbench only for v1. FM6 preview goes through the control-task
   MIDI-in queue; MIDI out keeps stock timing (router lanes from the audio-thread hook).
6. (v0.3, after checkpoint (a)) Each row has a **step length** of 16, 32, 48 or 64 steps,
   default 64. A shorter row plays the first N steps of each of its blocks and then
   advances. Notes running past the row end follow the same release rules as at a block
   end (9.3).
7. (v0.3, after checkpoint (a)) The song header carries **eight per-track output
   channels** (1..16, or 0 = use the device setting). While a song plays they override the
   device OUT CH (per-track MIDI setting 1, the project's channel) for those tracks. When
   playback leaves the song the device settings apply again. Hanging notes are released on
   the old channel before any channel change takes effect.

### 9.2 Common conventions

- All multi-byte fields are little-endian. Offsets are USER-partition offsets
  (`fm1_flash_*`), never absolute flash addresses.
- CRC-32: `groove_crc32` in app/project.c, i.e. the standard reflected CRC-32 (polynomial
  0xEDB88320, initial value 0xFFFFFFFF, final complement), computed over the exact byte
  ranges stated below.
- Magics are four ASCII characters stored as a little-endian uint32: `FM1G` = 0x47314D46
  (song record), `FM1B` = 0x42314D46 (block sector), `FM1Q` = 0x51314D46 (song staging
  journal). Legacy magics that must never be read as song data: the sample bank header
  `FM1S` = 0x53314D46 at offset 69632, and the DX7 library bank 0x31424D46 (`FMB1`) at
  516096 and the three sectors after it. Both are checked explicitly (9.8).
- Region sector numbering: song region sector `n` (0..112) is at USER offset
  `69632 + 4096 * n`.

| Region sector | USER offset | Use |
| ---: | ---: | --- |
| 0 | 69632 | song staging / journal sector |
| 1..16 | 73728 .. 135168 | song records, song 0..15 (sector 1 + song) |
| 17..112 | 139264 .. 532480 | block sectors 0..95 (sector 17 + b) |

The tuning sector at 532480 and everything below 69632 are untouched.

### 9.3 Block payload (the note format, v0.3)

A block is one track's 64 steps. The payload is the 64 steps in order, each:

| Byte | Field |
| --- | --- |
| 0 | step header: bits 0-2 note count N (0..4); bits 3-5 probability P (0 = always, 1..7 = play with probability P/8, as stock); bit 6 alt tuning table for this step's notes; bit 7 reserved, must be 0 |
| 1 .. 3N | N notes, 3 bytes each, in ascending pitch order (the importer sorts; the device does not require it but starts notes in stored order, which defines FM6 voice stealing) |

Note (3 bytes):

| Byte | Field |
| --- | --- |
| 0 | pitch 0..127 (MIDI note number); bit 7 reserved, must be 0 |
| 1 | velocity 1..127; bit 7 = retrigger: 1 = if the same pitch is still sounding on this track, send note-off then note-on; 0 = legato: the sounding note is extended to this note's end and no new note-on is sent |
| 2 | length L in 16th steps, 1..255; the note ends L steps after it starts, which may be inside a later row or after a jump |

Rules:
- Minimum payload 64 bytes (all steps empty), maximum 64 + 64*12 = 832 bytes.
- A note runs past the block end into whatever row plays next; on a queued jump or stop it
  is released at the jump/stop point. Note-off is always sent exactly once per note-on.
  The **row end** is the block end for release purposes: when the row's step length (9.5)
  is shorter than 64, a note that would run past step N of the row's last repeat continues
  into whatever row plays next, exactly as a note running past step 64 does; it is released
  at a queued jump or stop. Steps N..63 of the block are never started by that row.
- Same pitch twice in one step is invalid (the device rejects the block). Chords are N
  notes with the same start.
- Step resolution is 16ths; swing follows the project's swing setting at playback.

### 9.4 Block record and block sector

Block sector (4096 bytes, region sectors 17..112):

| Offset | Size | Field |
| ---: | ---: | --- |
| 0 | 4 | magic `FM1B` 0x42314D46 |
| 4 | 1 | version = 1 |
| 5 | 1 | staged target: 0 in a block sector; in the staging copy, the destination region sector 17..112 |
| 6 | 2 | record count (records stored in this sector, including stale ones) |
| 8 | 4 | generation: global counter, +1 on every block-sector program (also after compaction); the larger generation wins when the same (song, block) is in two sectors |
| 12 | 2 | songs mask: bit s set if any record of song s is in this sector |
| 14 | 2 | crc16 placeholder, reserved = 0xFFFF |
| 16 | 4 | crc32 over bytes 20..4095 (the record area, including unused 0xFF bytes) |
| 20 | 4076 | record area: records back to back, then 0xFF to the end |

Block record (inside the record area):

| Offset | Size | Field |
| ---: | ---: | --- |
| 0 | 1 | song 0..15 (0xFF = erased filler, stop parsing) |
| 1 | 1 | block id 1..255 (0 is "empty" in rows and never stored) |
| 2 | 2 | payload length 64..832 |
| 4 | L | payload (9.3) |

Records are 4-byte aligned (pad with 0xFF after the payload; the next record starts at the
next multiple of 4). A record is **live** when its song's record (9.5) is valid and no
record with the same (song, block id) exists in a sector with a higher generation. The
sector CRC covers stale records too; they are ordinary bytes until compaction.

Capacity: 96 sectors × 4076 bytes. Worst case (832 + 4 per record) 4 per sector = 384
blocks guaranteed; realistic content 1000–3000 blocks.

### 9.5 Song record (one sector per song, region sectors 1..16)

| Offset | Size | Field |
| ---: | ---: | --- |
| 0 | 4 | magic `FM1G` 0x47314D46 |
| 4 | 4 | generation: +1 on every write of this song (and of the staging copy) |
| 8 | 4 | target: region sector this record belongs to (1 + song), as project.c's header.target, used by staging recovery |
| 12 | 4 | crc32 over bytes 20..1599 (body: header fields and the 128 rows) |
| 16 | 4 | commit: 0xFFFFFFFF while being written, 0 once complete (programmed last) |
| 20 | 4 | version = 1 |
| 24 | 12 | name: 12 printable ASCII bytes (32..126), space padded, no terminator |
| 36 | 1 | project slot 0..15 (timbres, effects, tempo, MIDI channels) |
| 37 | 1 | flags: bit 0 loop the whole song when the last row ends (else stop); bit 1 jump mode: 0 = queued jumps land at the next bar, 1 = at the end of the current row; bits 2-7 reserved 0 |
| 38 | 2 | tempo override in BPM (0 = use the project's tempo) |
| 40 | 1 | row count 1..128 |
| 41 | 1 | block count: highest block id used + 0 (informational, 0..255) |
| 42 | 1 | loop row: row index the song returns to when flag bit 0 is set (0..row count-1); 0 by default |
| 43 | 5 | reserved 0 |
| 48 | 8 | output channel per track 0..7 (v0.3): 0 = use the device setting, 1..16 = MIDI channel 1..16; values 17..255 are invalid (the device rejects the record) |
| 56 | 8 | reserved 0 |
| 64 | 1536 | rows[128] × 12 bytes (unused rows are zero) |
| 1600 | 2496 | reserved 0xFF |

Sizes (v0.3): header 64 bytes, rows 1536 bytes, body 1580 bytes under the CRC (20..1599),
record image 4096 bytes as before. The v0.2 layout (rows of 10 bytes at offset 48, CRC over
20..1327) was never written to a device and is not supported.

Row (12 bytes, v0.3):

| Offset | Size | Field |
| ---: | ---: | --- |
| 0 | 8 | block id per track 0..7 (0 = track silent in this row) |
| 8 | 1 | repeat count 1..64 (the row plays this many times) |
| 9 | 1 | flags: bit 0 "loop here": playback repeats this row until a jump is queued; bits 1-7 reserved 0 |
| 10 | 1 | step length N: 16, 32, 48 or 64 (steps of each block played per repeat); 0 is read as 64 so zero-filled unused rows stay valid; any other value is invalid (the device rejects the record) |
| 11 | 1 | reserved 0 |

Row length: a block holds 64 steps (4 bars of 4/4 at 16ths). Each repeat of the row plays
steps 0..N-1 of every block in the row, then the next repeat (or the next row) starts at
step 0 of its blocks. With N = 64 the whole block plays; with N = 16 the row is one bar.
Shorter musical phrases that do not fit 16/32/48 repeat inside the block (the importer
fills the block). Row changes happen at the end of the row's last repeat. A queued jump in
jump mode 0 lands at the next bar boundary of the playing row (bars are 16 steps, so every
N is a whole number of bars); in jump mode 1 at the end of the current row.

Output channels (song header offset 48, v0.3), playback rules:

- The override is applied when the song starts playing and removed when playback leaves
  the song (stop, or the end of the last row with loop off). Tracks whose value is 0 keep
  the device OUT CH throughout. The project's stored MIDI settings are not modified; the
  override lives in RAM only (a router-level channel substitution for that track, so the
  song's notes and anything else the track sends on MIDI out, such as live keys on that
  track, go to the song's channel while it plays). How the SEQ/STEPS "OUT CH" readout marks
  an active override is decided at checkpoint (d).
- Before any effective channel change of a track (song start, song stop/leave, or a device
  OUT CH edit while the track's value is 0), every note still sounding on that track is
  released with a note-off on the **old** channel, then the new channel takes effect. A
  note-on and its note-off always use the same channel. Notes started by the stock
  sequencer or live keys on that track are released the same way: app/midi_router.c keeps
  a held-note map per owner (SEQ, ARP, keys) and `release_owner` sends their note-offs on
  the owner's current channel. The song override uses that per-track path; it does not go
  through `groove_midi_config_apply`'s channel-edit branch, which stops the engine and
  sends a panic.

### 9.6 Writing, rewriting, deleting: reclaim without data loss

Only the control task touches flash. One transaction at a time; every transaction goes
through region sector 0 (song staging) with the project.c pattern:

1. Build the full 4096-byte image of the destination sector in RAM.
2. Erase staging and program the image into it. Both image types carry what recovery
   needs: a song record has `target`; a block-sector image stores its region sector number
   in header byte 5 (reserved in 9.4 for exactly this, 0 means "not a staged copy") and its
   CRC. After readback verifies, program the journal commit word (the last 4 bytes of the
   staging sector, offset 4092, outside both image CRC ranges) to 0.
3. Erase the destination, program the image, verify by readback.
4. Erase staging (clears the commit).

Recovery at boot and before any new transaction (`song_storage_prepare`, the analogue of
`groove_storage_prepare`): if staging has a committed image (commit word 0 and CRC valid)
whose target differs from what is on flash, repeat step 3. An image that was never
committed is ignored. A power cut therefore leaves either the old destination intact or
the new one fully written.

Block writes (workbench upload or importer file): records are appended to a block sector
that has room (first fit by lowest region sector), via a full-sector rewrite through
staging; a sector rewrite increments the global generation. Writing a block that already
exists for that (song, id) makes the old copy stale; it is not erased in place.

Rewriting a song: the workbench uploads the changed blocks (appends), then the song record
(one sector through staging). Unchanged blocks are untouched.

Deleting a song: its song sector is rewritten with an all-0xFF body and commit = 0 is not
needed: a sector whose magic is not `FM1G` is "empty". All block records of that song
become garbage.

Compaction (space reclaim): when an append finds no sector with room, the device picks
the sector with the most reclaimable bytes (stale + garbage records), builds the compacted
image in RAM (live records only, 0xFF after), and writes it through staging as above. Live
records keep their bytes; nothing is lost on a power cut because the old sector stays
intact until the staged image is committed. Garbage is also compacted lazily: `SHIFT+SAVE`
on the SONG page runs a full compaction pass sector by sector. Space available to the
workbench = sum over sectors of (4076 − live bytes), reported in the capability reply.

### 9.7 Locating a block at a row change

- At boot and after any block-sector write, the device builds a RAM **block directory**
  for the currently loaded song only: `uint16_t where[256]` (region sector 17..112 in bits
  0-6, 0 = absent) and `uint16_t at[256]` (byte offset of the record in the sector, bits
  0-11, length is read from the record). Build cost: read the 16-byte header of each of
  the 96 sectors (songs mask), and walk the record area only of sectors whose mask has
  this song's bit, keeping the copy with the highest sector generation. 1 KB of RAM.
- A row change needs the 8 block ids of the next row: 8 array lookups, then up to 8
  `fm1_flash_read` calls of ≤ 836 bytes each (or `fm1_flash_map` for a direct read), then
  decoding into the fixed RAM row structure (8 × 64 × 13 bytes). This runs in the control
  task **when the current row starts** (one full row ahead, ≥ 4 bars of time). For a queued
  jump the decode of the target row starts at the pad press, into the "next row" buffer;
  if the jump point (next bar, ≥ 1 beat away) arrives before the decode finished, the jump
  lands at the following bar instead. The audio-thread sequencer reads only the RAM row
  buffers and swaps a pointer at the row boundary.

### 9.8 Migration (first boot on the new layout)

The app checks region sectors 0..112 at boot: a sector is "song-formatted" when its
first word is `FM1G`, `FM1B` or `FM1Q` or the sector is all 0xFF in its first 32 bytes.
Any other content (in particular `FM1S` 0x53314D46 at 69632 and `FMB1` 0x31424D46 at
516096 or in the following three sectors) marks the region as holding old data. Song mode
is then disabled and the SONG page shows "OLD SAMPLE / DX7 DATA FOUND — SHIFT+SAVE TO
INITIALIZE SONG STORAGE". Confirming erases only the non-song-formatted sectors of the
region. Projects, settings, staging (sector 16) and tuning are never touched. Back up
`.fm1s` banks and DX7 library banks with the V01 workbench before flashing.

### 9.9 Transfer protocol and file container

- Capability reply (cmd 22): out[8] gains bit 2 = song storage present; the sample limit
  field (bytes 4-7) reports 0 on Classic Tabby. The workbench accepts 0 or 446464.
- Transfer kind 5: song record, size 4096, target = song 0..15 (download reads the song
  sector; upload writes it through staging after validation).
- Transfer kind 6: one block, target = (song << 8) | block id, size = payload length
  64..832 (upload appends; download returns the live payload).
- Command 23 (new): song storage status: out[0..3] = free bytes, out[4..7] = reclaimable
  bytes, out[8] = compaction/migration state (0 ready, 1 busy, 2 old data present).
- Song file (`.tabby`, produced by the importer and by the workbench "export song"): the
  4096-byte song record image (9.5 v0.3 layout, with generation 0, target 0, commit 0, crc
  valid over 20..1599), followed by block records exactly as in 9.4 (4-byte header +
  payload, 4-byte aligned), terminated by end of file. The song byte in each record must
  equal 0 in a file; the device assigns the song number on upload. The importer sets each
  row's step length (16/32/48/64; 64 when the row fills its blocks) and may fill the
  per-track output channels from the MIDI file's channels or leave them 0 (device
  setting); both are valid files.
