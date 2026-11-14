Classic Tabby, Task 17: from timing to the MC-707 workflow (clips, scenes, clip launching)

Save this text to docs/tasks/TASK-17-clips-and-scenes.md and commit it before you start.

Timing is done: tabby-v04.4 measures under 2 ms on one line and under 3 ms on eight, on every page. Good work. The project now moves to the MC-707 workflow from the Task 10 assessment. Work on your own, in the order below, as far as you can get. You decide the approach inside the hard limits. Do not stop to ask me questions; collect them for the report.

CURRENT SETUP
- The SMK-37 is on tabby-v04.4, on this NUC through the USB hub. TRS MIDI out into H4MIDI WC DIN in 1. Audio out into AUDIO4c inputs 3 and 4. The AUDIO4c's DIN input is not used.
- Read first: SPEC.md, BUILD.md (sections 34 to 36), DEV_CHECKS.md, docs/tasks/TASK-10-step1-assessment.md, docs/MC707-PARITY.md, docs/CLIP-V3.md, CLIP-V3-REVIEW.md, TESTING-GUIDE.

HARD LIMITS (same as Task 16, plus two)
1. Installs from this NUC are allowed: normal update path of the published page only, identity checked first, one attempt per build. Never force flash, never factory restore, never switch to official Open V01, never touch the bootloader, key_mac or calibration. If an install stalls, stop all device writes and carry on with work that needs no device.
2. Never modify the SDK binary. Never post anywhere outside our own repo.
3. Never move or delete a pushed tag or a builds/ page. Fetch gh-pages before every publish.
4. Device data may be erased or overwritten for tests. Take a full backup before each install.
5. NEW: nothing is published or installed unless make suite passed on the exact commit being published. Make the publish script enforce this (a suite-passed marker that records the commit hash; publish refuses if it does not match HEAD). rc4 went out without a green suite; that must not be possible again.
6. NEW: before you report a device fault, confirm it with a second, independent tool (amidi, the browser workbench, or another reader). The v04.3 "fault" was a bug in our own reader and cost a release and two power cycles.

TESTING RULE (unchanged): you run every test yourself, unattended, using the remote commands and panel-key injection. If a test needs a device action you can't do remotely, build the remote command first.

GOALS, IN ORDER

Goal 1. Correct the v04.3 page. Replace its warning line, on the page and in builds/index.json, with: "Never released; superseded by tabby-v04.4. (An earlier note called it faulty; that was a measuring error.)" Same correction anywhere else the false fault is still described.

Goal 2. Finish the clip v3 cursor and release it.
- Device build: measure the real RAM cost of the decode buffers and fix anything that does not fit.
- Send the clip header's program and bank at clip start.
- Rows longer than 64 steps.
- A fuzz test for the v3 parser and cursor (random and malformed payloads must never crash or hang; bad clips are refused cleanly).
- The importer writes v3 when a part needs it (more than four notes on a step, clips longer than 64 steps, controller events), and v2 otherwise.
- Release as tabby-v04.5 when the full suite is green. Install it and validate it on the device: play v2 and v3 songs and compare the MIDI out against the expected events.

Goal 3. Song record v3: rows become scenes.
- As in the Task 10 assessment: each scene names one clip per track; up to 16 clips per track in view (banks), 64 stored per track; 128 scenes per song (8 banks of 16); a master cycle length for launch quantize; scene chains with a length per scene.
- The firmware reads v2 song records unchanged and never rewrites them on its own. Migration happens only when a song is re-saved or re-imported.
- The importer groups imported parts into clips of up to 8 bars and builds scenes from them.
- Host and simulator first. Release as tabby-v04.6 when green; install and validate.

Goal 4. Clip launching on the device.
- First write docs/CONTROL-MAP.md: the complete SMK-37 control map for the clip workflow, MC-707 style, using the control names in SPEC 17.4. Short press, long press, SHIFT combinations, encoders, faders (tracks 1 to 4 and 5 to 8 with pickup), pad colours, screen pages, transport, error feedback. Common stage actions in one or two presses: launch a clip, stop a track, recall a scene, mute.
- Then build the clip launch page: pads show clips, with distinct colours for playing, queued, selected, stopped, muted and empty; launches and stops land on the master cycle; scene recall from the panel. Test it unattended with panel-key injection, checking the screen state and the MIDI out.
- Release when green; install and validate.

Goal 5. Keep the docs current as you go: the testing guide (new sections and tests for every new feature, written for me as a musician), Help, SPEC, BUILD, FLASH-BUDGET, the MIDI guide.

Goal 6. Anything else that moves the MC-707 workflow forward (step editing on the pads, real-time recording) once Goals 2 to 4 are done, inside the hard limits.

REPORT
Rewrite ~/Documents/Classic Tabby/MORNING-REPORT.txt when you stop, plain text, one page:
1. What is on the device and whether it works.
2. What was released, with URLs.
3. Measured results in one small table (flash margin, RAM, timing still under 2 ms on one line).
4. Decisions you made, one line each, with the reason.
5. Questions for me, if any, each with your recommendation.
6. What you would do next.
