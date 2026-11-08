Classic Tabby, Task 11: decisions, full backup, diagnostic build and USER probe build (Phase 0 preparation)

Version 0.1
Revision log:
- v0.1, 2026-11-07: first version, after review of the Task 10 Step 1 assessment (c41b013).

Save this task text to docs/tasks/TASK-11-phase0-prep.md and commit it before you start.

ROLES
You are the implementing agent. I review with Claude in the desktop app, which orchestrates. Do not flash or send anything to the device. I do every hardware step myself from Chrome.

PURPOSE
Task 10 showed that nothing in the MC-707 port fits until USER moves, and that the move cannot be trusted until it runs on the real device. This task gets everything ready for those hardware tests and nothing more. No Phase 1 or Phase 2 feature code.

STEP 1. Record the decisions
Update docs/SPEC.md (bump version, revision log) with these decisions from the Task 10 Step 1 assessment, section M:
1. Clip format: event list v3, as in C.3. Accepted.
2. USER move: 64 KiB, only after the probe in Step 4 passes on hardware. 96 KiB held in reserve. Accepted.
3. Migration: full workbench backup before the move and restore after. No relocating build. Accepted, with the backup defined in Step 2.
4. Clips per track: 16 per bank, 64 stored, importer groups into 8-bar clips. Accepted.
5. Factory DX7 bank: kept unless Phases 4 or 5 overrun. Accepted.
6. Drums: the 808 engine only. No sample region. Accepted.
7. Metronome: both an internal 808 click and a MIDI-note click to a chosen channel and note, selectable, with the internal click able to be turned off. The SMK-37 audio out may go to the house mix, so the MIDI option matters.
8. Undo: 4 levels. Accepted.
9. Scenes: rows become scenes, 128 per song, 8 banks of 16. Accepted.
10. External clock follow with Start, Stop, Continue and SPP, in Phase 1. Accepted.
11. The probe build runs on my device after a full backup, before any Phase 0 code depends on the move. Accepted.
12. Arpeggiator page kept. Accepted.
13. The 4-notes-per-step limit is superseded by the event list's per-clip cap. The importer keeps exact timing. Accepted.

Add two design rules to SPEC for later phases:
- Event cap behavior. A clip holds up to 512 events. Say what happens when real-time recording or overdub reaches the cap: recording into that clip stops, notes already held still get their note off, the screen shows a clear message, and nothing already in the clip is lost. Recorded CC from encoders and incoming MIDI is thinned so one sweep cannot fill a clip: at most one event per controller per 1/32 step unless the value change is the last in a gesture. Put the exact rule and its numbers in SPEC and say whether 512 is still the right cap for 8-bar clips with dense chords plus CC; raise it if the RAM budget in C.2 allows.
- MIDI out timing is the top priority. The control loop sends MIDI, so its period sets output jitter during playback, not just recording. If the hardware numbers from Step 3 show a band wider than about 2 ms, that becomes the first item of Phase 1, ahead of external clock.

STEP 2. Full backup and restore
Before any build that changes layout, the workbench must be able to back up and restore everything on the device in one file, and prove it.
- Add a "Full backup" and "Full restore" action to the workbench. One file holds: all 16 project slots including slot 15 and the settings it carries, session settings, the staging/journal state (or a statement of why it is not needed), the tuning sector, every song record and every block, and the build ID and layout of the firmware it came from. Version the file format and document it in docs/.
- Restore writes through the normal transfer kinds only, never absolute offsets, so the same file restores onto the current layout and onto the 64 KiB layout.
- Restore refuses a file it does not understand and never erases anything before the whole file has been validated.
- Verify-after-restore: after a restore, read everything back and compare with the file, and show a pass or fail with the first difference.
- Host and simulator tests: backup, wipe, restore, read back, byte-identical; a truncated file is refused; a file from the 536576 layout restores into a simulator running the 471040 layout.
- Rig profiles live in the browser; add them to the backup file too, or say plainly in the UI that they are saved separately.

STEP 3. Diagnostic build on the current layout
Build tabby-v03.3-diag: the current firmware, same layout, no behavior changes, plus the counters from assessment section L items 1, 3, 4 and 5 (control loop period max and mean, flash erase and write time max, key scan to router latency histogram, scan ISR rate and max gap), read over USB and shown in the workbench device panel with a reset button.
- If the counters do not fit in the flash margin, stop and tell me. Do not remove features to make them fit.
- Write tools/linux/midi-monitor.py: it logs timestamped MIDI from an ALSA port (my iConnectivity AUDIO4c's DIN input, wired from the SMK-37's MIDI out) to a CSV file and prints the timing spread and drift for a test song. This replaces a DAW for L.2 and L.6. Comment it well and document how to run it in BUILD.md.
- Add a test song for the measurements to the fixtures: 16ths on all 8 tracks for 2 minutes, plus a single steady 16th line on one channel.

STEP 4. USER probe build
Build tabby-p0-probe64: the current firmware with user_bytes 471040 (USER moved down 64 KiB) and nothing else changed.
- Change the packagers, build.py, the layout constants, the capability reply, WebUpdate.js line 654 and Simulator.js so the size comes from one setting in the build variant. The normal build keeps 536576 and must stay byte-identical to the current one (crosscheck).
- The probe firmware shows on its ACTIONS page what fm1_flash_size() and the song storage report, so I can read the result on the device without a monitor.
- Write the way back before I need it: the exact steps to return to tabby-v03.3-diag or tabby-v03.2, and to restore my backup afterward.

STEP 5. Publishing
- Publish tabby-v03.3-diag to the main Pages URL, https://seattleuser0.github.io/classic-tabby/, and as a release.
- Publish the probe on its own page under the same site, https://seattleuser0.github.io/classic-tabby/probe64/, and as a pre-release whose notes say in the first line that it moves storage, needs a full backup first, and is a test build. The main page must never offer the probe.
- Each page's source link points at its own tag.

STEP 6. Hardware checklist for me
Write one checklist in BUILD.md that I can follow in order. Plain steps, what I should see, and when to stop. Merge in the open items from BUILD.md 19.5 and 23.5 that overlap assessment section L, and leave the rest of those lists where they are.
1. On tabby-v03.2: full backup, then full restore of the same file, verify passes. Keep that file.
2. Install tabby-v03.3-diag from the main page. Confirm my songs and projects are still there.
3. Run the measurements: L.1, L.3, L.4, L.5 from the counters; L.2 with midi-monitor.py through the AUDIO4c; L.6 with the MC-101 as clock master over USB; L.7 pad colors by eye. Tell me exactly what numbers to send back to you.
4. Full backup again on the diag build.
5. Install the probe from the probe64 page. Read the storage result on the ACTIONS page. Run L.8: save a project, pair Bluetooth, power-cycle, check again. Full restore from step 4 and verify.
6. Restore factory V16 from the workbench, then install the probe again and confirm it boots.
7. Return to tabby-v03.3-diag by the documented way back and restore the step 4 backup.
State the stop conditions plainly: when to stop and use the way back, and what to send you.

RULES
- No Phase 1 or later feature code. No change to song playback behavior.
- Every normal build stays byte-identical to the current head apart from the version string and the diag counters. make crosscheck must pass.
- Keep SPEC.md, BUILD.md and FLASH-BUDGET.md current. Version headers and revision logs on every file you change, and comment the code heavily.
- Commit at the end of each step. Push and publish only in Step 5.
- When done, report in no more than 30 lines: what was built, the URLs, flash margin of each build, the backup file format version, and anything that did not fit or could not be verified.
