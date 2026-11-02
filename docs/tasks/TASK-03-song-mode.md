Start Task 03. First save this whole message as docs/tasks/TASK-03-song-mode.md in the repo and commit it. Then do Step 1 only (read-only assessment) and stop with the report. Do not modify any code until I approve the report.

Classic Tabby, Task 03: Song mode (chained sequences)
Revision log:
- v0.1 2026-11-02: first draft.
- v0.2 2026-11-02: fixed storage decision added (sample bank and DX7 user library become song storage; sampler removed; FM6 kept for previewing sequences).
- v0.3 2026-11-02: song blocks use a new note format with up to 4 independent notes per step (own pitch, velocity, length). Block size, capacity target, sequencer ownership, tests and assessment items updated to match.

CONTEXT
Classic Tabby (~/Documents/Classic Tabby/firmware, branch classic-tabby/linux-build) builds and runs on my SMK-37 Pro. Read PROJECT-BRIEF.md, docs/SPEC.md, docs/BUILD.md and docs/FLASH-BUDGET.md first.

Stock V01 stores one struct groove_project per slot: 8 tracks x 64 steps (struct groove_step, 4 bytes), 16 slots, one 4 KiB sector each plus a staging sector (project.c, USER_BYTES). There is no chaining. Songs longer than 4 bars are not possible. I need song mode, and it is the base for scene cueing and MIDI file import (Task 02, which is on hold until this lands).

Stock steps are chord-only polyphony: one root note plus a chord ID into a 16-shape table shared by the whole project, with one velocity, gate and tie per step. Notes on a track cannot overlap or end at different times. That is not enough for imported MIDI (v0.3).

FIXED DECISIONS (mine, do not reopen)
v0.2:
- Classic Tabby does not play samples. The M8 does that. Remove the sampler engine, sample storage code (samples.c paths, sample bank checks) and the workbench sample UI. Report the code flash this frees; the app image margin is only 29 bytes today, so this matters.
- Song storage takes over the sample bank region (USER offset 69632, 446464 bytes) and the four DX7 user library sectors (USER offset 516096, 16384 bytes).
- Unchanged: the 16 project slots, the settings sector, the staging sector and the tuning sector. Project slots keep holding timbres, effects, tempo and MIDI channels.
- The FM6 (DX7) engine stays. The factory DX7 bank stays in firmware, and DX7 voices saved inside projects stay. The DX7 user library feature goes away; voice import goes into a project track instead.
- FM6 is the preview path for imported or edited sequences. Use the existing per-track SEQ setting (LOCAL / BOTH / MIDI) so a track can be auditioned on FM6, then switched to external MIDI only. Make that switch fast from the device.
- Step resolution stays at 16ths.
- Migration: the new layout must not read old sample or DX7 library data as song data. First boot on the new layout detects the old contents and asks before initializing those sectors. Document that I back up my .fm1s and DX7 banks before flashing.
- Workbench: update the capability check (WebUpdate.js expects sample capacity 446464 exactly), Samples.js, Simulator.js flash sizes, and the help text, so the workbench accepts the device.
- Document that the workbench "Restore factory V16" writes 0xF4000 to 0xFDFFF, which now holds song data. Warn in the workbench before that runs.
v0.3:
- Song blocks use a new note format, not struct groove_step. Each step holds up to 4 independent notes. Each note has its own pitch, velocity and length in steps (length can run past the end of the block into the next row; define how that is stored and released). Notes on one track can overlap and end at different times.
- Keep per-step probability if it fits. Drop the shared chord table for song blocks; chords are just several notes.
- Target about 4 notes per step at roughly 3 bytes per note, so about 768 bytes per 64-step block before compaction, and about 550 blocks in the song region. Propose a compact encoding (for example, only store steps that have notes) if it raises capacity without hurting playback timing, and report the real number.
- Classic Tabby owns playback of song blocks: a sequencer in app code that sends MIDI out with correct note-offs and drives FM6 for preview. The stock V01 project sequencer keeps working for normal projects.
- FM6 preview has 8 voices. When a song needs more, steal voices in a defined way on FM6 only. MIDI out is never limited by FM6 voice count.

TARGET DESIGN (challenge it in the assessment if something better fits the code)
- Blocks: one track's 64 steps in the v0.3 note format. A song has a pool of blocks shared across its rows.
- Song rows: each row has one block index per track (or empty) and a repeat count. Like M8 song rows. Rows play top to bottom. A row can be marked to loop.
- Each song points to a project slot for timbres, effects, tempo and MIDI channels. Only step data changes between rows.
- Row changes happen at the row's loop end. Notes that ring past a row change end at their stored length, or on a jump, are released cleanly. Nothing sticks.
- Live: pad press queues a jump to a row. The jump lands at the next bar by default, with an option for end of row. The screen shows the current row, the queued row and the bar count.
- MIDI out: clock and Song Position Pointer stay correct across row changes.

STEP 1. Read-only assessment. STOP AND REPORT.
- Confirm the region boundaries above against the code. Report exact usable bytes, sector count and block count for the v0.3 format after headers, index and staging.
- List everything that depends on the sampler and the DX7 user library (engine, screen pages, transfer kinds, workbench), and what removing each saves in code flash.
- Find how the stock sequencer advances steps, what lives in libfm1_engine.a and what lives in app/. Report what an app-side sequencer needs from the SDK: a clock tick or step callback, MIDI out, note on/off into the FM6 engine on a given track, and audio-thread timing rules. If the SDK does not expose what is needed, say so and propose the least invasive alternative.
- Report whether the sampler can be dropped from the engine at all, or only disabled, given the SDK is binary.
- Report free RAM, and what song mode needs at runtime (one row resident, next row preloaded, active note table for note-offs).
- Propose the v0.3 block encoding, the storage format (versioned, CRC checked, using the staging-commit pattern project.c already uses), max songs, max rows per song and max blocks per song.
- Propose the controls and screen layout for song mode, for editing notes in the new format on the device (or say editing stays in the workbench), and for the FM6 preview / external switch.

STEP 2. Implement after I approve.
- Sampler and DX7 user library removal, with the migration prompt.
- App-side song sequencer, song storage, quantized row changes and queued jumps.
- Workbench support: view and edit the row list and blocks in the new note format, assign blocks, save and load songs, write them to the device through the existing transfer path.

STEP 3. Tests.
- Host tests: row advance timing at 16, 32, 48 and 64 step lengths; repeat counts; queued jumps at bar and row end; overlapping notes on one track with different lengths; 4 notes on one step; notes ringing across a row change and across a jump; no stuck notes; SPP and clock continuity; FM6 voice stealing past 8 voices while MIDI out still sends every note; storage round trip; corrupted record rejected; old sample data not misread as songs.
- Simulator check: a 3-row test song with overlapping notes plays in order and loops, on FM6 and on MIDI out.
- Hardware checklist for me: migration prompt on first boot, tempo extremes, rapid jumps, a power cycle mid-save, and a 64-bar song with sustained and overlapping parts played through on FM6 and then on MIDI out to the M8.

RULES
- Stop and ask before any change to app/ data layouts that affects existing projects.
- Never write factory calibration (key_mac) or any region outside USER.
- Update SPEC.md, BUILD.md (done, left to build, left to test) and FLASH-BUDGET.md at each checkpoint.
- Comment heavily. Top of every new file: purpose, version, revision log. Note revision changes inline by version.
- Commit at each checkpoint with clear messages. Do not push.

FINAL REPORT
Design as built, flash and RAM cost, code flash recovered, limits (songs, rows, blocks, notes per step), test results, and the hardware checklist.
