# The v3 clip: an event list

Version 0.3 (2026-11-14; first version 2026-11-12, Task 16 Goal 5, MC-707 workflow Phase 2). The block payload that replaces the
v2 step grid (docs/TIMED-NOTE.md, TASK-03 9.12) when a clip needs more than 64 steps, more than four
notes in a step, or controller events. It is built and tested on the host and in the simulator on the
branch classic-tabby/mc707-phase2; released in tabby-v04.5 (Task 17 Goal 2; the user's decisions on docs/CLIP-V3-REVIEW.md: the 240 bias, the length clamp, option B
for kind-6 downloads). Source: docs/tasks/TASK-10-step1-assessment.md C.3 to C.5.

| Piece | File |
| --- | --- |
| C module (codec, validator, migration both ways, window cursor) | `app/clip_v3.h`, `app/clip_v3.c` |
| JavaScript twin (workbench reader / writer, importer) | `web/clip-v3/clip-v3.js` |
| Tests | `tests/host/clip_v3_test.c`, `tests/clip-v3/run.mjs`; `make clip-v3-test` |
| Where it is used | block record byte 1 (format) = 2; `song_payload_valid`, `decode_track` (app/song.c) |

Revision log
- v0.3 2026-11-14: tabby-v04.5: sections 4 to 6 (the cursor complete, header program and bank, rows to 128 steps, kind 9, the
  workbench and the importer, the tests); the event time is 32 bits in the C module.
- v0.2 2026-11-14: section 4, the scheduler cursor's first step (branch clipv3-cursor).
- v0.1 2026-11-12: first version (Task 16 Goal 5).

## 1. The model

A **clip** is what v2 calls a block: the notes one track plays for one scene (row), looped for the row's
length. In v3 it is a header and a list of events sorted by time; time is in the same units as the timed
note (1 unit = 1/480 of a 16th step; 1920 units per quarter note), counted from the clip's start. A clip is
1 to 128 steps long (a row's `steps` field still sets how long the row plays; the clip's own `steps` says how
long its event list is; a clip shorter than its row is played, until the cursor lands, as a v2 block padded with empty steps).

## 2. The bytes

All fields little-endian. A payload is `16 + 6 x count` bytes.

**Header, 16 bytes**

| Byte | Field | Range |
| ---: | --- | --- |
| 0 | `steps` | 1..128: the clip's length in 16th steps |
| 1 | `flags` | bit 0 program present, bit 1 bank present; bits 2..7 reserved, 0 |
| 2 | `program` | 0..127 (0 when flag bit 0 is clear) |
| 3 | `bank_msb` | 0..127 (0 when flag bit 1 is clear) |
| 4 | `bank_lsb` | 0..127 (0 when flag bit 1 is clear) |
| 5 | reserved | 0 |
| 6..7 | `count` | number of events, 0..512 |
| 8..15 | reserved | 0 |

**Event, 6 bytes.** Sorted by `time` (ascending; events at the same time keep their list order, which the
scheduler follows). `time` is stored with a bias of 240: stored = time + 240, so times from -240 (a note
slightly before the clip starts, as at step 0 of v2) to `steps` x 480 - 240 (the last step, offset +240) are valid.

| Kind | Bytes | Fields |
| --- | --- | --- |
| note (byte 3 bit 7 = 0) | 0..1 time u16 (biased); 2: bits 0..6 pitch, bit 7 retrigger; 3: bits 0..6 velocity 1..127, bit 7 = 0; 4..5 length u16, units 1..65535 | |
| other (byte 3 bit 7 = 1) | 0..1 time u16 (biased); 2: type; 3: bit 7 = 1, bits 0..6 reserved 0; 4: a; 5: b | |

Types of "other": 1 CC (a = controller 0..127, b = value 0..127), 2 program change (a = program), 3 pitch bend
(a = lsb, b = msb), 4 channel pressure (a = value), 8 step modifier (a = probability 0..7 in bits 0..2, bit 3
= the stored "alternative tuning" bit of v2; b = the anchor step 0..127; the modifier is placed at time
anchor x 480 - 240 so that it precedes every note anchored at that step). Types 0, 5..7 and 9..127 are reserved
(the validator refuses them: a new type needs a new format number).

A note's **anchor** is the step it is heard against: `max(0, floor((time + 239) / 480))`, so a start exactly
half a step after a grid line belongs to the earlier step (the v2 rule). Probability and the stored tuning bit are
per anchor step, as in v2: one roll per step and pass, shared by the step's notes.

Rules: no two notes of the same pitch in the same anchor step (the v2 rule);
`time` is non-decreasing; every event's time is inside `[-240, steps x 480 - 240]`; a note longer than the clip is
legal (it plays its length: legato over the loop, as in v2).

## 3. Migration

- **v2 -> v3** (`clip_v3_from_v2`): a 64-step v2 payload becomes a 64-step clip. Each step's notes become note
  events in order (time = step x 480 + offset); a step whose header carries probability or the tuning bit gets one
  step-modifier event before its notes. Lossless for every valid v2 payload except: a length above 65535 units
  (136 steps, only possible on a v2 note that outlives its 64-step block by more than 70 steps) is clamped to 65535
  and counted in the report; a note stored at step s + 1 with offset -240 (a tie the v2 rule would have written as
  step s with +240) is read as anchored at s (same time, same sound; only a probability set on both steps could
  tell). Counts and the report are printed by the tool.
- **v3 -> v2** (`clip_v3_to_v2`): only for a clip of at most 64 steps with at most four notes per anchor step, no
  CC, program, bend or pressure events and no clip header program or bank; anything else is refused (code -2).
  `clip_v3_from_v2` followed by `clip_v3_to_v2` returns the original bytes (tested on every fixture and 20000
  random payloads).
- **v1 -> v2 -> v3**: v1 payloads upgrade to v2 first (`song_payload_upgrade`), then to v3.
- Songs are never rewritten by the firmware: a v2 song stays v2 until the workbench writes it again.

## 4. Playing it (tabby-v04.5)

Two paths in `app/song.c`:

- A v3 clip that is v2-representable is decoded into the step grid (`clip_v3_to_cells`) and the grid scheduler plays it,
  byte-identical to the same notes stored as v2.
- A clip the grid cannot hold (more than four notes in a step, controller events, a header program or bank, more than 64
  steps) is kept as its event list in the track's decode buffer (the buffer is a union of the grid and the list) and played
  from it: **the scheduler cursor**, `scan_v3`. For each window `[from, to)` of the block it finds the first event that can be
  due (a binary search: the list is sorted and a swung time lies within `[time, time + 240]`), walks to the first event at or
  after `to`, and makes one action per due event; no empty step is visited. Events of one time keep their list order (a
  controller before the note listed after it). Notes go through the same `note_on` as grid notes (legato, retrigger, the
  sounding table, the note-off). CC, program, bend and pressure events go out on the track's output channel with the track's
  song owner, by the track's SEQ mode, with no copy to the internal engine. Probability is rolled per anchor step and pass
  from the step-modifier events (a table per buffer, built at decode). The look-ahead into the next frame (events before the
  frame start) and the late check at a frame's entry have a v3 form. The event reader the audio interrupt uses is RAM code.
- **The clip header's program and bank** go out when a track enters the clip: bank select MSB (CC 0) and LSB (CC 32), then the
  program change, on the track's channel, before the clip's first events and in the same audio block. A repeat of the same clip
  sends nothing. (A synth that needs time to change sounds wants a row event with a pre-roll instead.)
- **Rows are 16 to 128 steps** (multiples of 16; song record validation, `SONG_ROW_STEPS_MAX`). A v2 block in a row of more
  than 64 steps is silent past step 64. An event at or past its row's end is not played.
- Test switch (host and simulator): `song_test_cursor(1)` sends every v3 clip through the cursor.

## 5. Transfers, the workbench and the importer (tabby-v04.5)

- Capability: command 27 flag bit 3 = v3 clips (format-2 blocks play whole, kind 9, rows to 128 steps).
- Upload: kind-7 batches carry block records with format byte 2. Kind 6 (one v2 block) is unchanged.
- Download: kind 6 hands a v2-shaped v3 clip over as v2 and refuses the others (decision "option B", unchanged). **Kind 9**
  (new, download only) hands any block over as it is stored, its format in front (byte 0: 0 v1, 1 v2, 2 v3). The workbench
  uses kind 9 for the song read, the full backup and the .tabby export, so a v3 clip is never lost.
- The workbench marks a v3 payload with `.format = 2`; batches, .tabby files (block record byte 1 = 2) and the full backup
  (`format: 2` per block, docs/BACKUP-FORMAT.md) carry the mark. Writing a song with v3 clips or rows of more than 64 steps
  to firmware without flag bit 3 is refused with the reason, before anything is sent.
- The importer (web/import/midi-song.js `clipFormat: 'auto'`, the default) writes a block as a v3 clip only when the v2 grid
  cannot hold it: more than four notes on a step (all are kept; the "kept the 4 loudest" rule is `clipFormat: 'v2'`), notes
  past step 63 (rows of 80 to 128 steps), or controller events. Controller, pitch bend and channel pressure events are kept
  with `controllers: true` (the import page's box, ticked at the start): on the track of their part, thinned to one value per
  controller per 1/8 step, dropped for a clip that would pass 512 events. Everything else stays v2.
- The step editor shows clips of up to 64 steps and four notes per step; a v3 clip is kept as it is.

## 6. Tests

`make clip-v3-test`: tests/host/clip_v3_test.c (22102 checks: random round trips, the 550 fixture blocks, the window against
a reference, the rejection cases, and a fuzz of 60000 random, plausible and damaged payloads through the validator, the
window and the conversions), tests/clip-v3/run.mjs (the JavaScript twin), tests/clip-v3/importer.mjs. tests/host/smoke.c
section 20: grid against cursor byte-identical; five-note chord and controller; header program and bank once; a 128-step
row; kind 9; a fuzz of random valid clips through the scheduler and 1500 damaged payloads against the storage. The clip
test and the smoke test also run under ASan and UBSan (`make host-sanitize`, part of `make suite`). tests/midi-import/run.mjs
section 5b (the importer's v3 rule), tests/workbench/backup.mjs (a v3 clip through backup, wipe, restore, verify against the
firmware in the simulator). On the device: tools/linux/hw/run-clips.py (docs/BUILD.md 37).
