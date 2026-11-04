Start Task 05. First save this whole message as docs/tasks/TASK-05-timed-notes.md and commit it. Then do Step 1 only (read-only assessment) and stop with the report. No code changes until I approve it.

Classic Tabby, Task 05: Timed notes (exact start offsets and lengths)
Revision log:
- v0.1 2026-11-03: first draft.

PROBLEM
The MIDI importer snaps every note start to the nearest 16th and rounds every length to whole steps. That destroys timing we put there on purpose. We nudge the kick a few milliseconds against a bass note so they don't hit together, and strums and swing feel live in the timing. Imported songs must play back with the timing of the .mid file, not a quantized copy of it. The song sequencer and the song block format have to carry exact start offsets and exact note lengths.

CONTEXT
Classic Tabby (~/Documents/Classic Tabby/firmware, branch classic-tabby/linux-build). Read PROJECT-BRIEF.md, docs/SPEC.md, docs/BUILD.md, docs/FLASH-BUDGET.md, section 9 of docs/tasks/TASK-03-step1-assessment.md (block, row and song formats, event table), and docs/tasks/TASK-02 and TASK-04 docs first.

Reference design: Orange Cat, my FM-1 firmware, already solved this. Read it from https://github.com/SeattleUser0/OrangeCat, branch linux-hw (clone read-only into a scratch directory outside this repo; do not add it as a remote or submodule):
- firmware/src/core.h: recorded_note_t (the timed note: onset as a fraction of its step in 1/65536, duration as a 16-bit mantissa with a 3-bit exponent in owner's top bits, note, velocity, step anchor, flags), and step_t's nudge field.
- firmware/src/recording.c: how onsets and durations are turned into play times (recording_raw_on, recording_shape), the exponent encoding, quantize as an option, and validation (recording_valid).
- firmware/src/step_snapshot.h: a compact, self-contained step encoding with put/get functions.
- docs/orangecat/PROJECT_FORMAT_R3.md section 8.2b: how timed notes are stored and edited.
The idea to carry over: the step is a self-contained object (the note with its own onset and length, and the step it belongs to), defined once with its encode, decode and validate functions, so it can be reused later in other projects.

LICENSE RULE: Orange Cat's files are GPL-3.0-only and partly copyright Kerem Kilic (Melodee). Classic Tabby is GPLv3 with the SDK linking exception, and links a binary SDK. Do not copy Orange Cat code into Classic Tabby. Reuse the design and write the code fresh. If you think a piece should be copied, stop and tell me which file and why.

FIXED DECISIONS (mine, do not reopen)
- A timed note object, defined once in a self-contained module (C header plus source with no SMK-37, SDK or song-storage dependencies, and a JavaScript twin for the workbench and importer). Fields: pitch, velocity, retrigger flag, start offset, length. Encode, decode and validate functions in both languages, sharing one set of test vectors so C and JS can never disagree. Document it in its own doc file so it can be lifted into another project.
- Anchor and offset: each note belongs to the 16th-note step nearest its start, with a signed offset from that step. Offset range is plus or minus half a step. A note nudged early stays on the step it is heard against.
- Resolution: 1/480 of a 16th step (1920 per quarter note). That holds 96, 120, 192, 240, 384, 480, 960 and 1920 PPQ files exactly. Other PPQ values round to the nearest unit and the importer reports it.
- Length in the same units, using Orange Cat's mantissa-and-exponent idea: exact up to at least 8 bars, longer notes keep their length to within 1/480 of a step times the exponent scale. Report the real exact range.
- Offsets and lengths are musical, not milliseconds: they scale with tempo.
- Swing: offsets are measured on the straight grid. Imported songs play exactly as the file, whatever the project's swing setting. Song blocks ignore project swing unless a song explicitly turns swing on (default off). Document what swing does to a note with an offset when it is on.
- Notes per step stays at up to 4 unless the assessment shows real files need more. Report it.
- Importer: no quantizing by default. Import is exact. Quantize stays available as an option, off by default (starts only, or starts and ends, to 16ths). Warnings list only real changes: rounding for odd PPQ values, notes dropped past 4 per step, same-pitch overlaps clipped.
- Playback accuracy: every note leaves MIDI out within one audio block (128 frames, about 2.9 ms) of its exact time, with no growing lag. Two notes with different offsets come out in the right order with the right gap, plus or minus one block. The checkpoint (d) report measured notes landing up to about 3 blocks after their step; that spread is larger than a typical nudge and must be fixed in the song sequencer as part of this task. FM6 preview may be looser; report how loose.
- Negative offsets on a row's first step play before the row boundary, using the existing decode-ahead. If the next row is not known in time (a jump queued late, or the first note after PLAY), the note plays at the boundary and counts in the LATE counter.
- Song blocks only. The stock pattern sequencer for normal projects is inside the binary SDK and stays as it is.
- Workbench song editor: show and edit each note's offset and length. Show offset at a glance (as a signed fraction of a step and in ms at the song's tempo); show length in steps and fractions. Editing stays in the workbench, as decided in Task 03.
- Old songs: songs and .tabby files in the current block format must never play wrong. Either the firmware reads them as offset 0 and whole-step lengths, or it refuses them with a clear screen message and the workbench converts them. Pick by flash cost and report it.

STEP 1. Read-only assessment. STOP AND REPORT.
- Read the Orange Cat files listed above and summarize what you will carry over and what you will do differently, and why.
- Propose the timed note encoding: bytes per note (target 6 or less), bit layout, ranges, the length exponent's exact range, and validation rules. Propose the block format version that uses it, inside section 9, with the CRC and packing rules unchanged where possible.
- Pool capacity: re-run the four Renoise fixtures through the new format and report blocks, bytes and percent of pool per song.
- Find where the 3-block spread in song playback comes from (decode, queue, router lanes, the tick, the MIDI out path) and propose how to get to one block. Say what limits it (for example, whether MIDI out can be timed inside a block at all).
- Report the flash cost estimate against the current margin (4669 bytes after Task 04). I want at least 2 KB left after this task. If that will not happen, list removal candidates with sizes.
- Report RAM cost (decode buffers grow with the bigger note record).
- Propose the editor UI for offset and length.
- Propose the handling of old-format songs, with its flash cost.

STEP 2. Implement after I approve.
- The timed note module in C and JS, with shared test vectors and its own doc.
- New block format version, firmware decode, song sequencer scheduling at sub-step resolution, pre-fire for negative offsets, the timing fix.
- Importer: exact conversion, quantize option off by default, updated warnings.
- Workbench song editor: offset and length display and editing; .tabby import and export.
- Old-format handling as approved.

STEP 3. Tests.
- Timed note module: every test vector round-trips identically in C and JS; offsets at the range limits; lengths across every exponent; invalid encodings rejected.
- Importer: the four Renoise fixtures import with zero timing changes at 96 PPQ (every note start and length matches the file exactly); a fixture with a kick 3 ms ahead of a bass note on the same step keeps the gap; fixtures at 120, 480 and 960 PPQ exact; a 100 PPQ fixture reports its rounding; quantize option still works.
- Sequencer, host and simulator: a note with offset +1 unit, -1 unit, +half step and -half step plays at the right block; two notes 3 ms apart come out in order and 3 ms apart, plus or minus one block; a negative offset on a row's first step plays before the boundary; the late case counts; no stuck notes across row changes and jumps; timing error stays within one block over a 10-minute run with no drift.
- Simulator check: renoise-export.mid plays in the WASM simulator and every MIDI out note-on and note-off lands within one block of the time computed from the .mid file. Report the largest error.
- Old-format songs behave as approved.

STEP 4. Hardware checklist for me.
- Import a file with a kick nudged a few ms ahead of a bass note, write it, play it to the M8 and a timestamped MIDI monitor, and read the gap. Compare against the same file played from Renoise. Then the four Renoise songs on the M8 by ear against Renoise.

RULES
- Stop and ask before any change to data layouts that affects existing projects or songs beyond what this task approves.
- Never write factory calibration or any region outside USER.
- Update SPEC.md, BUILD.md, FLASH-BUDGET.md and section 9 at each checkpoint.
- Comment heavily. Top of every new file: purpose, version, revision log. Note revision changes inline by version.
- Commit at each checkpoint with clear messages. Do not push.

FINAL REPORT
What was built, the timed note format, flash and RAM cost and margin, measured timing accuracy, test results, and the hardware checklist.
