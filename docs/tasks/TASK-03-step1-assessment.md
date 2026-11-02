# Task 03, Step 1 — read-only assessment (song mode)

Version: 0.1
Revision log:
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
