Classic Tabby, Task 14: bring the workbench Help up to date with tabby-v04.1

Version 0.1
Revision log:
- v0.1, 2026-11-10: first version.

Save this task text to docs/tasks/TASK-14-help-audit.md and commit it before you start.

SETUP
- Work in your own git worktree on a new branch, classic-tabby/help-audit, made from the head of classic-tabby/linux-build. Another session is working on timing in a different worktree at the same time. Do not touch app/ timing code. Use the shared build lock as DEV_CHECKS.md says.
- No device writes. This task is text only.

WHAT IS WRONG
The live page (gh-pages b0f765a, tabby-v04.1) still has Help, panel and tooltip text for features removed in tabby-v04.0. Examples found in the published HTML:
- "SEQ: Tap for steps; tap again for BASIC and playback follow ... Hold about 0.6 seconds for copy / paste, clear, repeat, undo"
- "PLAY / REC: Play / pause / resume; toggle note recording on musical pages"
- "On HOME, K3 (STEP) selects a step on the current track, including the insertion position while recording. Tap REC to start or stop recording."
- "HOME: K5 chooses a track; K3 (STEP) selects a step"
- "REC from a menu or step details opens the SEQ basic page and starts recording"
- "PAD / STEP: ... SHIFT + PAD / STEP switches step editing" and "Make a beat: SHIFT + PAD / STEP switches step editing. Toggle steps with Pads and press PLAY."
- The song mode text still says blocks are "64 steps, at most 4 notes per step" (check this against the current block format and limits).
- The device update help still describes "Enable force flash and reconnect", which was removed.

WHAT TO DO
1. Audit every user-facing string in the workbench against the tabby-v04.1 firmware: Help chapters, the quick start, panel tooltips, the simulator's panel text, the shortcuts text, status and error messages, the device update help, and the release-facing docs (README, MIDI guide). Both languages, English and Chinese.
2. For each string: keep, rewrite or delete. A string is wrong if it names a removed page, mode or action, a control by a name that does not match the SPEC 17.4 control table, a limit that changed, or a flow the page no longer has.
3. Use the control names from SPEC 17.4: K1 to K8 for the knobs (SELECT is K5, PAGE is K6, PRESETS is K7, MASTER is K8), and "the 4th button in the left group (after SHIFT, FADER BANK, HOME)" for the button the firmware calls SAVE.
4. Write a short Help chapter "What changed in tabby-v04" at the top of Help: storage move, step editing removed, SYNC / MIDI page, STOP TO SAVE, the timing counters, recovery pages under builds/.
5. Add a host test that fails if any Help or panel string mentions a removed page or action (a list of banned phrases kept next to the test), in both languages.
6. Do not change any firmware behavior. If the firmware's own screen text is wrong too, list it in BUILD.md's left-to-build list instead of changing it here.

RELEASE
- Help is part of the workbench, so publish it with the next release only. Do not republish tabby-v04.1 for this. Merge the branch into classic-tabby/linux-build when the timing session is not mid-build (check the lock), with make suite green.

REPORT in no more than 15 lines: how many strings were rewritten or deleted, by chapter, anything you were unsure of, and the new test.
