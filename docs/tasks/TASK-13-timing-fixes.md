Classic Tabby, Task 13: timing fixes (option B, then option A as a diag experiment)

Version 0.1
Revision log:
- v0.1, 2026-11-09: first version, after Task 12 Part B (BUILD.md 26.9).

Save this task text to docs/tasks/TASK-13-timing-fixes.md and commit it before you start.

ROLES AND DEVICE RULES (unchanged from Task 12)
- You build, test in the simulator and read from the device. Firmware installs are done by me, from the MacBook, in Chrome. Never from this NUC.
- Other device writes from the NUC (song uploads, erase) only while I am at the desk and have said so in this session.
- DIN measurements use the H4MIDI WC Port 1 (DIN in 1), Type A adapter on the SMK-37's TRS out.

WHAT WE KNOW (BUILD.md 26.9)
- The SDK runs the control pass from a fixed 10 ms timer. Song notes are queued on the audio thread every 2.9 ms, but only the control pass sends them, so a note waits 0 to 10 ms. A pass that overruns loses the next tick and the wait becomes 20 ms.
- Measured spread: 14 ms on one line, 14 to 16 ms per line with eight lines. With eight lines the control pass averages 12.5 ms (max 19.2) and the device shows CPU GUARD.
- The 10 ms tick is a constant in the SDK. Sends are queued and sent at once by an SDK MIDI task. No timestamped sends.
- On DIN, the 8 notes of one step take about 7.3 ms to send, because DIN is serial.

STEP 1. Option B: no pass over 10 ms
- Split screen drawing, transfer handling and any other long work into slices, so no control pass runs past the 10 ms tick under the eight-line test song. Song scheduling and MIDI sends always run first in each pass.
- Find out what CPU GUARD is (where it is raised, what it measures, what it does when it trips) and whether it changes behavior during play. Report it before changing anything about it.
- Host and simulator tests: slice correctness for the screen and for transfers, and a test that sends still go out first when the screen is busy.

STEP 2. Option A, as a diag experiment only
- Before writing any code, check from the SDK disassembly whether the function that requests an extra control pass is safe to call from the audio thread: reentrancy, locking, interrupt state, what happens if it is called while a pass is running, and what it does to audio. Write the finding in BUILD.md. If it is not clearly safe, stop at this step and report; do not build A.
- If it is safe: build it behind a build flag, off in the normal build, on in a diag build tabby-v04.1-diagA. Do not publish the diag build yet; give it a page under builds/ only when I ask for it.

STEP 3. DIN burst
- Check whether the SDK's MIDI output uses running status on DIN and whether the app can control it. Report what it would save on an 8-note step.
- Write down, without building anything, the rig answer for the burst: the SMK-37 sends over USB to the H4MIDI WC, and the H4MIDI fans out to separate DIN ports per device, so each cable carries only its own notes. Say what the SMK-37 would need for that (per-track port choice on USB, already there or not) and add it to the MIDI guide as the recommended live wiring.

STEP 4. Fix the panel wording
- The SMK-37 has no button labelled SAVE in the place the install notes and screen text say, and the song is chosen with K5, not K1. Fix the screen text, Help, the panel shortcuts text and the install file template so they name the controls as they really are. If any control name is unclear from the source, list it and ask me; I can read the labels off the device.

STEP 5. Release tabby-v04.1
- Normal build with option B, the panel wording fixes, and the update page fixes from Task 12 (zero-tag resume, no automatic force flash).
- make suite and make crosscheck green; report the flash margin.
- Publish to the main page, builds/tabby-v04.1/ and a GitHub release. Write install steps to ~/Documents/Classic Tabby/INSTALL-tabby-v04.1.txt: a normal update from tabby-v04.0, no storage move, no backup or restore needed, and the stall steps (close the tab, power-cycle, open the page the loader asks for; never force flash).

STOP after Step 5 and report in no more than 25 lines: what B changed, what CPU GUARD is, the result of the A safety check, the running status answer, the flash margin and the URLs.

AFTER I INSTALL (do not start until I say so)
STEP 6. Measure tabby-v04.1 the same way as B1: one line and eight lines, DIN and USB, control pass profile. Compare with B1 in one table. If the A safety check passed, I will then install tabby-v04.1-diagA from its page and you measure it the same way.

The target is 4 ms spread or less on one line. If option A cannot get there, say what the best achievable number is on this hardware and why.

RULES
- Version headers and revision logs on every file you change; comment the code heavily, with revision notes by version.
- Keep SPEC.md, BUILD.md, FLASH-BUDGET.md and the MIDI guide current.
- Commit at the end of each step. Push and publish only in Step 5.
