Start Task 02. Task 03 Step 1 is approved but Task 03 Step 2 is still in progress in another session. Do not work in the main checkout. Create a git worktree at ~/Documents/Classic Tabby/firmware-task02 on a new branch classic-tabby/task02-midi-import, based on classic-tabby/linux-build, and work only there. First save this whole message as docs/tasks/TASK-02-midi-import.md on your branch and commit it. Then do Step 1 and stop with the report. Do not write code until I approve the report.

Classic Tabby, Task 02: MIDI file import into songs
Revision log:
- v0.1 2026-11-02: first draft, single-project import.
- v0.2 2026-11-02: retargeted to Task 03 song mode. Imports write songs (rows plus shared blocks) in the v0.3 note format: up to 4 independent notes per step, each with its own pitch, velocity and length.
- v0.3 2026-11-02: runs in parallel with Task 03 Step 2 in its own worktree and branch. Builds against the approved Task 03 Step 1 format spec, stubs the device transfer, and keeps its notes in a separate file until merge.

CONTEXT
Classic Tabby (main checkout ~/Documents/Classic Tabby/firmware, branch classic-tabby/linux-build) runs on my SMK-37 Pro. Read PROJECT-BRIEF.md, docs/SPEC.md, docs/BUILD.md, docs/FLASH-BUDGET.md, docs/tasks/TASK-03-song-mode.md, and the approved Task 03 Step 1 report (in docs/ of the main checkout; if you can't find it, ask me to paste it). Task 03 adds song mode: songs made of rows, each row pointing to one block per track, with blocks shared across rows and a note format of up to 4 independent notes per step at 16th-note resolution.

Another session is implementing Task 03 Step 2 on classic-tabby/linux-build right now. Treat the approved Step 1 report as a fixed spec for the song and block format. If the spec is unclear or you think it needs to change, stop and ask me. Do not change it yourself.

I want to import standard MIDI files (.mid, type 0 and type 1) as full-length songs. My files mostly come from Renoise MIDI exports.

APPROACH
Do the import in the browser workbench (web/), not in firmware. Parse the .mid in the browser and convert it to a Task 03 song (rows plus block pool). Put the device write behind one interface with a stub implementation for now. Do not implement the real transfer until I tell you Task 03 Step 2 is merged. No firmware changes in this task.

PARALLEL WORK RULES
- Work only in ~/Documents/Classic Tabby/firmware-task02 on classic-tabby/task02-midi-import.
- Do not touch app/, sdk/, or any file Task 03 is changing. If you need a change there, stop and tell me.
- Keep your spec and build notes in docs/tasks/TASK-02-notes.md (same structure as SPEC.md and BUILD.md: scope, mapping rules, limits, done, left to build, left to test). Do not edit SPEC.md or BUILD.md. I will fold your notes in at merge.
- Commit on your branch. Do not push. Do not merge.

STEP 1. Read-only assessment. STOP AND REPORT.
- Restate the song and block format from the approved Task 03 Step 1 report: block length, notes per step, note fields and ranges, how notes that run past a block end are stored, row fields, repeat counts, song-to-project link, limits (songs, rows, blocks). Flag anything the spec leaves open.
- Find the workbench code you will build on: how it loads files, how it shows previews and warnings, how it holds a browser copy of a project, and how it writes to the device today.
- List what a .mid can hold that the format cannot, and propose how to handle each: notes off the 16th grid, more than 4 notes starting on one step on one track, notes shorter than a step, very long notes, tempo changes, time signatures other than 4/4, CCs, pitch bend, program and bank changes, multiple channels inside one MIDI track, and more than 8 MIDI tracks or channels.
- Propose how bars map to rows. Default: one row per 4 bars of 4/4 (64 steps). For other meters, propose a row length that stays on bar lines (for example 48 steps for 4 bars of 3/4).
- Propose block deduplication: after quantizing, any block that is identical to one already in the pool is shared, not stored again. Also consider merging consecutive identical rows into one row with a repeat count.
- Estimate pool usage for a typical 5-minute song at 120 BPM with and without deduplication.
- Propose the transfer interface and its stub.

STEP 2. Implement after I approve the mapping.
- Add an Import MIDI control to the workbench: choose a file, then show a preview before anything is written.
- The preview lists each MIDI track or channel with its name, note count, range and length in bars. Let me assign each one to a Classic Tabby track (1 to 8) and set that track's OUT CH. Let me pick a bar range, the quantize grid (16ths), and whether to quantize note ends as well as starts.
- Show the resulting song: rows, repeats, block count and how much of the song pool it uses.
- Show a warning list of everything dropped or changed: notes moved by quantizing, notes dropped past 4 per step (keep the 4 loudest, or a rule I pick), lengths clipped, tempo changes ignored, program changes and other events ignored.
- Use the file's first tempo as the song tempo.
- Result loads into the browser first. Writing it to the device is an explicit separate step that goes through the transfer interface, and it warns before replacing an existing song. Until I say Task 03 Step 2 is merged, the stub only validates and reports what it would send.
- Use a small, well-known MIT or BSD licensed MIDI parser, or write one. Record any library in THIRD_PARTY.md, and keep it compatible with the GPLv3 plus SDK exception terms.

STEP 3. Tests.
- Host tests with fixture .mid files: a 4-bar bass line; a 64-bar type 1 multitrack file with repeated sections; a sustained pad under a moving melody on one track; 5 or more notes on one step; off-grid notes; a file in 3/4; a file with tempo changes, CCs and program changes; a Renoise MIDI export. Check the resulting rows, blocks and notes against expected values.
- Deduplication test: repeated sections produce shared blocks and the expected block count.
- Round trip: import, save the song in the browser, reload it, and confirm it is identical.
- Format check: every song the importer produces passes the validation rules from the Task 03 spec.

STEP 4. After I tell you Task 03 Step 2 is merged.
- Rebase your branch on classic-tabby/linux-build and resolve conflicts. Report any place where the merged Task 03 code differs from the Step 1 spec, and fix the importer to match the merged code.
- Replace the stub with the real song transfer path Task 03 built.
- Simulator check: an imported 64-bar song plays through in the WASM simulator on FM6 and sends the expected notes, lengths and channels on MIDI out.
- Move the content of docs/tasks/TASK-02-notes.md into SPEC.md and BUILD.md.

STEP 5. Hardware check, done by me.
- Write a checklist for me: import a test file, write it to a spare song, audition it on FM6, switch the tracks to MIDI out, and confirm notes, lengths and channels on the M8 or a MIDI monitor.

RULES
- No changes to app/ or sdk/ without my approval. New code goes in web/ (import UI and parser), tests/ and docs/.
- Never touch device flash outside the normal song and project write paths. Never write factory calibration or protected regions.
- Comment heavily. Top of every new file: purpose, version, and a revision log. Note revision changes inline by version.
- Commit at each checkpoint with clear messages. Do not push.

FINAL REPORT
What was built, the mapping rules as implemented, deduplication results, any differences found between the Task 03 spec and the merged code, known limits, test results, and the hardware checklist.
