# The v3 clip: review for the user

Version 0.1, 2026-11-12 (Task 16 Goal 5, MC-707 workflow Phase 2). Branch `classic-tabby/mc707-phase2` in the
worktree `../firmware-clipv3` (commit 6de5d26 on top of tabby-v04.3). **Nothing here is released or installed** (hard
limit 5). Format: docs/CLIP-V3.md. Every number is marked measured or estimated.

## 1. What the format is

A block (a "clip" in the MC-707 model) becomes a 16-byte header and a list of 6-byte events sorted by time, instead of
64 fixed steps of up to four notes. A clip may be 1 to 128 steps long, may hold up to 512 events, and may hold, beside
notes, controller changes, program changes, pitch bend, channel pressure and "step modifier" events that carry the v2
step's probability and tuning bit. The header carries an optional program and bank for the clip. Times are in the same
1/480-step units as the timed note, biased by 240 so that a note slightly before step 0 fits. The block record keeps its
layout; byte 1 (the payload format) says 2. Nothing in the song record changes yet: rows still name blocks.

What it gives you that v2 cannot: clips longer than 64 steps (up to 8 bars), chords of more than four notes, controller
events inside a clip, a program and bank per clip.

## 2. What it costs

| Item | v2 / before | v3 | Basis |
| --- | ---: | ---: | --- |
| 550 importer blocks from the fixtures (payload bytes) | 77968 | 51568 (-34 %) | measured, tests/clip-v3 |
| the 42 fixture songs as .tabby files | 254084 | 227684 (-10 %) | measured |
| firmware app image (this branch against tabby-v04.3) | 451812 | 453412 (+1600) | measured, make firmware |
| margin below the 519457-byte limit | 67645 | 66045 | measured |
| static RAM: the block payload buffer in app/song.c | 1600 | 3088 (+1488) | measured (sizeof) |
| decode buffers, 8 tracks x 2 buffers, when the scheduler reads event lists directly (not built) | 25600 (the 64-step grid) | about 49408 (+24 KB) | estimated (TASK-10 C.2) |
| the clip module's code (validate, grid adapter, v3 -> v2 for downloads) | | about 1600 bytes of the +1600 | measured as the image difference |

The 150 KB of heap above the SDK minimum (TASK-10, measured) takes the estimated +24 KB.

## 3. What migrates, and how

- v2 -> v3 is lossless for every valid v2 payload except three cases the migration counts (measured on the 550 importer
  blocks): **12 steps** whose notes the time sort puts in another order (the importer orders a step's notes by pitch, v3
  orders by time; same notes, same sound, the bytes differ); **0 notes** re-tied (a note at step s+1 with offset -240); **21
  notes** whose length is above 65535 units (136 steps) and is clamped (from the long-notes fixture). Random payloads: 19997
  of 20000 come back byte for byte, the other 3 as the same notes.
- v3 -> v2 exists only for a clip that a v2 grid can hold (at most 64 steps, four notes per step, no controller events, no
  header program or bank); anything else is refused with a code. That is also how the device answers a block download (the
  download has no format byte, and v2 and v3 payload lengths cannot be told apart).
- The firmware never rewrites a song: it reads v1, v2 and v3 blocks. The workbench writes v2 by default; a .tabby file or
  a batch upload can carry v3 (`encodeFile(song, {format: 2})`, tested on all 42 fixture songs).
- Played on the device: a v3 clip that fits the grid goes through the existing scheduler (`clip_v3_to_cells`): the
  simulator test plays two songs with the same notes, one v2 and one v3, and the MIDI is byte for byte identical (47 of 47
  messages, same block each; chords, offsets before and after the step, probability-free). A clip the grid cannot hold is
  stored and refused at playback (BLOCK READ ERROR) until the scheduler reads event lists.

## 4. What the device UI and the scheduler need next

1. The scheduler cursor: `clip_v3_window` exists and is tested against a reference (swing 0, 25, 50, windows of 1..28
   units); song.c's `tick` has to call it per track instead of `scan` over the step grid, with the per-step probability
   rolls driven by the step-modifier events, and its decode buffers become event lists (+24 KB, estimated).
2. Song record v3: rows become scenes with a clip index per track and a master-cycle length (TASK-10 C.5); this branch
   leaves the record as it is.
3. The workbench: a clip editor that shows more than 64 steps and controller events; today it reads a v3 clip only as the
   v2 notes when a grid holds it.
4. A download that carries the format (a new transfer kind or a format byte in the reply), so the workbench can read a v3
   clip back whole.
5. The device's own clip pages (CLIPS / TRACKS, TASK-10 Phase 3) are the next phase and need no format change.

## 5. Decisions I need from you

- **Time bias.** I biased the stored time by 240 (so -240 is representable) instead of the assessment's "store a negative
  note at the end of the previous pass". It makes the order and the anchor unambiguous. Say if you prefer the other.
- **Length above 65535 units** is clamped (21 of 550 fixture blocks have such a note). The alternative is an exponent bit,
  at the cost of a bigger note or a smaller maximum clip.
- **Download format.** Option A: add a format byte to the kind-6 reply (breaks nothing, new workbench needed). Option B: keep
  v2 downloads for v2-shaped clips only. I built B.
- Whether to go on with the scheduler cursor (about a day of work, host and simulator first) before the song record v3.

## 6. Tests

`make clip-v3-test` (in test and test-fast): tests/host/clip_v3_test.c (22100 checks: 20000 random round trips, the 550
fixture blocks, the cursor, the rejection cases), tests/clip-v3/run.mjs (the JavaScript twin identical to C on every block, 1133
checks), tests/clip-v3/importer.mjs (1143 checks). tests/host/smoke.c section 19 (the simulator plays v3 as v2). `make
test-fast` and `make suite DISPLAY_VERSION=tabby-v04.3` (crosscheck, the whole test run, the simulator import test and the ASan / UBSan run) passed at adaa7e6.

## 7. The cursor: done, released in tabby-v04.5 (2026-11-14)

Your decisions of 2026-11-13 are kept: the 240 bias, the length clamp, option B for kind-6 downloads. One addition I made on
my own: transfer kind 9 (a block as stored, with its format byte), because with option B alone a full backup could not have
carried a clip the grid cannot hold. Everything that was open in the earlier version of this section is done; see
docs/CLIP-V3.md sections 4 to 6 and docs/BUILD.md 37.
