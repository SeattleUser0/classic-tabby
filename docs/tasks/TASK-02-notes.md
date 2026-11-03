# Task 02 — MIDI file import: spec and build notes

Version: 0.1
Revision log:
- v0.1, 2026-11-02: Step 2 checkpoint on branch classic-tabby/task02-midi-import. Parser,
  conversion, format encoder, transfer stub, standalone page, host tests (74 checks).

This file is folded into docs/SPEC.md (sections 1–3) and docs/BUILD.md (sections 4–6) at
merge; until then it is the only place these notes live (Task 02 parallel-work rules).

## 1. Scope

Import Standard MIDI Files (type 0 and type 1, PPQ time division) in the browser workbench
and turn them into Task 03 songs: rows of 64-step blocks shared through a per-song pool, up
to 4 independent notes per step (pitch, velocity, length) at 16th resolution. Everything
runs in the browser (web/import/); the device write goes through one transfer interface
whose only implementation today is a stub that validates and reports. No firmware change,
no change under app/ or sdk/. The approved Task 03 Step 1 report, section 9, is the binding
format; see section 3 for the two fields that are still pending there.

Files (all new, Task 02):

| File | Role |
| --- | --- |
| web/import/midi-parse.js | SMF parser: header, tracks, running status, meta, SysEx, note pairing |
| web/import/midi-song.js | analyze() the file into parts; convert() to a song with the mapping rules |
| web/import/song-format.js | song model, block/record/.tabby encoding and decoding, validation rules, pool usage, JSON save/load |
| web/import/song-transfer.js | transfer interface; stub implementation |
| web/import/import-ui.js | the Import MIDI panel as a DOM component (`TabbyImportUI.mount`) |
| web/import/index.html | standalone development page (open from disk) |
| tests/midi-import/smf-write.mjs | SMF writer for fixtures |
| tests/midi-import/make-fixtures.mjs | generates tests/midi-import/fixtures/*.mid deterministically |
| tests/midi-import/run.mjs | the host tests (`make midi-import-test`) |

The scripts are classic scripts publishing `globalThis.TabbyMidi`, `TabbyMidiSong`,
`TabbySongFormat`, `TabbySongTransfer`, `TabbyImportUI`, with a CommonJS export guard so
Node loads the same files. No library is used (the parser is about 200 lines), so
THIRD_PARTY.md is unchanged.

## 2. Mapping rules (as implemented, v0.1)

Positions: `step = tick × 4 / division` in 16ths from the start of the file; starts snap to
the nearest step, ties toward the earlier step (2.5 → 2).

| MIDI content | Handling |
| --- | --- |
| Note ends | rounded to whole steps by the chosen rule: nearest (default, ties earlier), never shorter (round up), never longer (round down); stored length = max(1, end − start) |
| Notes shorter than a step | length 1 (counted: lengthMin) |
| Notes longer than 255 steps | clipped to 255 (lengthClipped) |
| Notes outside the chosen bar range | dropped (droppedRange); notes ending past it clipped (clippedRange) |
| Same pitch overlapping on one track | the earlier note is shortened to end where the next starts (overlapClipped); two same-pitch notes on one step keep the louder (duplicateDropped); the retrigger bit is never set |
| More than 4 notes starting on one step on one track | keep the 4 loudest (tie → higher pitch), or highest, or lowest (overflowDropped) |
| Velocity 0 note-on | note-off (MIDI rule) |
| Tempo | first set-tempo event, rounded to an integer BPM (tempoRounded), clamped 30..300 (tempoClamped); becomes the song's tempo override; no tempo → 120 (noTempo); later tempo events that differ from the previous one are listed and ignored (tempoChangesIgnored) |
| Time signature | first one sets the bar length `16 × numerator / denominator` steps (must be a whole number 1..64, else the file is refused); later changes listed and ignored (meterChangesIgnored) |
| Control changes, pitch bend, aftertouch, SysEx, other meta | ignored, counted per type; sustain (CC 64) counted separately |
| Program changes | ignored, listed with track, channel, program (1-based) and position |
| Several channels in one MIDI track | split into parts keyed (track, channel); the part name gets " chN" |
| More than 8 parts | the first 8 non-empty parts are pre-assigned to tracks 1..8, the rest are "skip"; any part may be assigned to any track; several parts may share a track |
| Truncated file / missing end-of-track | events read so far are kept; warning shown |
| SMPTE division, format 2 | refused with a message |

Rows: one row per `rowSteps` steps from the start of the bar range. `rowSteps` is one of 16,
32, 48, 64 (the allowed row lengths) and must hold whole bars; the default is the candidate
closest to 4 bars (ties → longer): 4/4 → 64, 3/4 and 6/8 → 48, 2/4 → 32, 12/8 → 48 (2
bars), 1/4 → 16. Meters with no aligned candidate (5/4, 7/8, 9/8, 7/4 …) use 64 with the
warning meterUnaligned. A note is stored in the row and step where it starts with its full
length; steps ≥ rowSteps inside a block stay empty. Trailing silent rows inside the bar
range are kept (a long note may ring through them).

Deduplication: the cell (row, track) is encoded with the section 9.3 block encoding; the
byte string is the pool key; an empty cell is block id 0 and is never stored; identical
cells share one id (1..255 in order of first appearance). Consecutive rows with identical 8
ids merge into one row with repeat + 1, up to 64. The merge is lossless (test 3 unrolls the
rows and compares with the pre-deduplication grid).

Song fields set by the importer: name (file name, 12 upper-case ASCII, editable), project
slot (user choice, default 1), tempo override (first tempo), loop flag (checkbox, off),
jump mode bar, loop row 0, row length (above), OUT CH per track (user choice, default
"device setting"). `song.source` records file name, format, division, exact tempo, meter,
bar range, rules and the part-to-track assignment; `song.warnings` records the warning
kinds and counts.

Limits, checked after deduplication: 128 rows, 255 blocks, block payload 64..832 bytes,
pool 96 × 4076 bytes. The import is refused with a message (narrow the bar range) when a
limit is exceeded.

## 3. Pending layout (blocks nothing today, must be closed at Step 4)

The Task 02 approval message (2026-11-02) states that Task 03 added (1) a per-row step
length (16/32/48/64) and (2) eight per-track output channels with a "use the device
setting" value to the song header. The committed section 9 of the Task 03 assessment at
classic-tabby/linux-build 7c1cdc2 (checked 2026-11-02, clean tree, no other branch,
worktree or stash) does not contain either field: 9.5 says "every block is 64 steps", the
row is 8 ids + repeat + flags, header bytes 43..47 are reserved 0. The importer therefore:

- keeps `rowSteps` and `outChannels` in the song model and the JSON save file;
- does not write them into the binary song record or the .tabby file
  (`TabbySongFormat.PENDING.encode/decode` are no-ops);
- reports them in `validate()` as warnings ("pending layout") shown in the result panel.

When the offsets are published, `PENDING.encode/decode` in song-format.js, the tests in
run.mjs (round trip and header-offset checks) and this section change; nothing else.

## 4. Done (Step 2, 2026-11-02)

- SMF parser with note pairing, running status, type 0 channel split, SMPTE and format 2
  refusal, tolerant of truncated tracks.
- Analysis and conversion with the mapping rules in section 2, warnings grouped by kind
  with positions (bar, beat.sixteenth) and per-Tabby-track labels, statistics (rows before
  and after merging, cells vs distinct blocks, notes in vs out, block bytes, sectors, pool %,
  id %).
- Song format module: block encoding/decoding, block records, song record with the 9.5
  offsets and CRC, .tabby file (9.9) encode/decode, validation rule list, pool usage
  (first-fit-decreasing into 4076-byte areas), JSON save/load.
- Transfer interface and stub (plan: kind 5 record + kind 6 per block, targets
  `(song << 8) | id`, query and time estimate; write: validate, plan, report, send nothing).
- Standalone page with the full flow (file → parts and assignment → options → result →
  save/load/export → write with the replace warning and the stub report).
- Host tests: 74 checks, all pass (`make midi-import-test`). Headless Chrome run of the
  page: multitrack fixture imported, OUT CH and bar range changed, stub write reported, no
  script errors.
- Makefile: `midi-import-test` target (the only shared file touched; approved).

## 5. Left to build

- Step 4 (after Task 03 Step 2 merges): rebase; confirm or correct the section 9 layout
  including the two pending fields (section 3); device implementation of the transfer
  interface on the Library class (kinds 5 and 6, command 23, capability bit 2); mount the
  panel in the workbench Library tab (two placeholders in tools/linux/build-web.py and
  sdk/Update.html.in, FM1I18n strings); export in whatever song file container the merged
  workbench uses if it differs from 9.9.
- Optional, not planned for v1: sustain pedal (CC 64) lengthening notes; splitting a file
  into several songs; transposed-block detection.

## 6. Left to test

- Renoise export fixture: `tests/fixtures/renoise-export.mid` (the path named in the
  approval) or `tests/midi-import/fixtures/renoise-export.mid`. The test exists and is
  SKIPPED until the file is present; it prints the file's division and part layout and
  checks parse, convert, validate and the JSON round trip.
- Step 4: simulator check (64-bar imported song on FM6 and MIDI out) and the hardware
  checklist (Step 5).
