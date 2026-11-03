# Task 02 — MIDI file import: spec and build notes

Version: 0.2
Revision log:
- v0.2, 2026-11-02: section 9 v0.3 layout adopted (commit b7abb99 on classic-tabby/linux-build):
  per-row step length and per-track output channels are written and validated; section 3
  closed. Renoise fixtures (four files in tests/fixtures/) run in the tests; findings in 6.
- v0.1, 2026-11-02: Step 2 checkpoint on branch classic-tabby/task02-midi-import. Parser,
  conversion, format encoder, transfer stub, standalone page, host tests (74 checks).

This file is folded into docs/SPEC.md (sections 1–3) and docs/BUILD.md (sections 4–6) at
merge; until then it is the only place these notes live (Task 02 parallel-work rules).

## 1. Scope

Import Standard MIDI Files (type 0 and type 1, PPQ time division; binary SMF or the mf2t
text form that the Renoise/XRNS2MIDI tool chain writes) in the browser workbench
and turn them into Task 03 songs: rows of 64-step blocks shared through a per-song pool, up
to 4 independent notes per step (pitch, velocity, length) at 16th resolution. Everything
runs in the browser (web/import/); the device write goes through one transfer interface
whose only implementation today is a stub that validates and reports. No firmware change,
no change under app/ or sdk/. The approved Task 03 Step 1 report, section 9, is the binding
format (v0.3, commit b7abb99).

Files (all new, Task 02):

| File | Role |
| --- | --- |
| web/import/midi-parse.js | SMF parser (binary MThd/MTrk and mf2t text "MFile …"): header, tracks, running status, meta, SysEx, note pairing |
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
| mf2t text files | read like binary files; measure:beat:click times are refused (re-run mf2t without -t); unknown lines are counted, not fatal |

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
jump mode bar, loop row 0, every row's step length (above; row byte 10), OUT CH per track
(user choice, default "device setting" = header byte 0; channel n is written as n, 1..16). `song.source` records file name, format, division, exact tempo, meter,
bar range, rules and the part-to-track assignment; `song.warnings` records the warning
kinds and counts.

Limits, checked after deduplication: 128 rows, 255 blocks, block payload 64..832 bytes,
pool 96 × 4076 bytes. The import is refused with a message (narrow the bar range) when a
limit is exceeded.

## 3. Layout as written (section 9 v0.3)

Song record: header 64 bytes (magic FM1G, generation, target, CRC over 20..1599, commit,
version 1, name at 24, project slot 36, flags 37, tempo 38, row count 40, block count 41,
loop row 42, reserved 43..47, **output channels 48..55** as 0 = device setting or 1..16,
reserved 56..63), then **128 rows × 12 bytes at offset 64**: 8 block ids, repeat, flags,
**step length at row byte 10** (16/32/48/64; 0 reads as 64), reserved byte 11; 1600..4095
0xFF. The importer writes the step length explicitly in every used row and leaves unused
rows zero. Decoding rejects channel bytes above 16 and step lengths other than 0/16/32/48/
64, as the device does. `validate()` warns when a row shorter than 64 steps points at a block
with notes beyond the row's end (the device never starts them); the importer never produces
that. The v0.1 placeholder ("pending layout") is gone; v0.1 JSON files with `song.rowSteps`
still load (the value moves into each row).

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
- Host tests (`make midi-import-test`): parser, every fixture scenario, deduplication,
  JSON and .tabby round trips with byte-level checks of the v0.3 offsets, decode rejection
  of bad channel and step-length bytes, validation rules, stub transfer, limits, and the four
  Renoise files in tests/fixtures/. Headless Chrome run of the page: multitrack fixture
  imported, OUT CH and bar range changed, stub write reported, no script errors.
- Makefile: `midi-import-test` target (the only shared file touched; approved).
- v0.2: encoder and decoder write and read the row step length and the output channels;
  tests updated; Renoise fixtures run (section 6).

## 5. Left to build

- Step 4 (after Task 03 Step 2 merges): rebase; compare the merged code with section 9
  v0.3; device implementation of the transfer
  interface on the Library class (kinds 5 and 6, command 23, capability bit 2); mount the
  panel in the workbench Library tab (two placeholders in tools/linux/build-web.py and
  sdk/Update.html.in, FM1I18n strings); export in whatever song file container the merged
  workbench uses if it differs from 9.9.
- Optional, not planned for v1: sustain pedal (CC 64) lengthening notes; splitting a file
  into several songs; transposed-block detection.

## 6. Renoise fixtures: what the files hold (2026-11-02)

The four files in tests/fixtures/ (renoise-export.mid, Glass Relay.mid, meridian_fault.mid,
the_space_between_wires.mid) are **mf2t text**, not binary SMF: first line `MFile 1 N 96`
(format 1, N tracks, 96 ticks per quarter = 24 ticks per 16th), then `MTrk` … `TrkEnd`
blocks of `<tick> On|Off ch=1 n=… v=…` lines. Track 0 holds only `TimeSig 4/4 24 8` and
`Tempo`; every other track is one Renoise instrument, named "Track name (NN: Instrument)"
with an InstrName meta, all on channel 1. No CC, program change, pitch bend, SysEx or
tempo/meter change in any file. The importer reads the text form directly (midi-parse.js
v0.2).

| File | Tracks / parts | Bars | BPM | Rows | Blocks (cells) | Bytes (pool %) | Changed | Dropped |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| renoise-export.mid | 9 / 8 | 69 | 80 | 18 | 112 (112) | 10772 (2.75) | 193 starts moved, 139 lengths rounded, 10 overlaps clipped | none |
| Glass Relay.mid | 9 / 8 | 66 | 110 | 17 | 98 (119) | 10672 (2.73) | 126 moved, 165 rounded, 1 overlap | none |
| meridian_fault.mid | 12 / 11 | 85 | 104 | 22 | 137 (157) | 13420 (3.43) | 91 moved, 182 rounded, 1 overlap | 3 parts unassigned by default (11 parts > 8 tracks) |
| the_space_between_wires.mid | 10 / 9 | 64 | 104 | 16 | 117 (117) | 11924 (3.05) | 250 moved, 130 rounded, 44 overlaps | 1 part unassigned by default (9 parts) |

- **Moved starts** are chord strums and humanisation: offsets of 1–3 ticks (up to 8 in
  meridian_fault) inside a 24-tick 16th, so every note snaps back to its own step; nothing
  moves by a whole step.
- **Rounded lengths** are note-offs a tick or two early or late (3.969 → 4.00 beats and
  the like).
- **Overlaps clipped** are sustained pad and string notes re-struck on the same pitch
  before the previous one ended (16 → 8 steps); MIDI would have cut them the same way.
- **Nothing was dropped**: every note of every assigned part survives, no step has more
  than 4 notes on one track, and the only unassigned parts are the ones beyond eight,
  which the user assigns or merges in the preview.
- **Deduplication finds almost nothing** in these files (blocks ≈ cells, no merged rows):
  the material is through-composed and humanised, so no two 4-bar cells are byte-identical.
  The songs still fit easily (2.7–3.4 % of the pool) but use 44–54 % of the 255 block ids
  per song; a 128-bar file of this kind would approach the id limit. Velocity and strum
  humanisation are what defeat the byte equality.

## 7. Left to test

- Step 4: simulator check (64-bar imported song on FM6 and MIDI out) and the hardware
  checklist (Step 5).
