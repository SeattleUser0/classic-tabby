Classic Tabby, Task 15: find a way past the 10 ms MIDI timing floor

Version 0.1
Revision log:
- v0.1, 2026-11-10: first version, for a Claude Code session running on Fable.

Save this task text to docs/tasks/TASK-15-timing-research.md and commit it before you start.

SETUP
- Work in your own git worktree on a new branch, classic-tabby/timing-research, made from the head of classic-tabby/linux-build. Another session is editing Help text in a different worktree at the same time. Use the shared build lock as DEV_CHECKS.md says.
- Read first: docs/SPEC.md, docs/BUILD.md sections 26.9 and later (Task 12 Part B and Task 13), docs/tasks/TASK-13-timing-fixes.md and its results, and docs/FLASH-BUDGET.md.

DEVICE RULES
- You may build, run host and simulator tests, disassemble the SDK, and read from the device at any time.
- Firmware installs are done only by me, from my MacBook, in Chrome. Never install or force flash from this NUC.
- Other device writes from the NUC (song uploads, erase) only while I am at the desk and have said so in this session.
- DIN measurements use the CME H4MIDI WC Port 1 (DIN in 1), with the SMK-37's TRS out through a Type A adapter. Do not use the AUDIO4c DIN input.

THE PROBLEM
Song notes are scheduled in the song tick, which runs inside the audio interrupt (IRQ 11) every 2.9 ms. The SDK only lets the control pass send MIDI, and the control pass runs from a fixed 10 ms timer inside the SDK. So every note waits 0 to 10 ms for the next pass. Measured spread before Task 13: 14 ms on one line, 14 to 16 ms per line with eight lines. Task 13's option B (6 ms pass budget, sends first) is expected to bring it to about 10 to 11 ms and remove the 20 ms cases. Option A (ask the SDK for an extra pass from the song tick) was rejected: the SDK call looks up the task by name with the scheduler suspended and can switch tasks, which is not allowed in an interrupt.

Goal: 4 ms or less of spread on one line, measured on DIN, without hurting audio, USB MIDI, the update loader or flash writes. If that is impossible on this hardware, prove it and say what the floor is.

WHAT TO DO

Step 1. Baseline. Read the device's build id. If it is tabby-v04.1 and the SMK-37 is on this NUC with me at the desk, run Task 13 Step 6 (one line and eight lines, DIN and USB, control pass profile) and record it as the baseline. If it is not on v04.1, say so and use the Task 12 B1 numbers until I install it.

Step 2. Research, read only. For each option below, find out from the SDK disassembly, the headers, the chip's register map and JieLi's public documentation whether it can work, with evidence (addresses, function names, call paths). Add any option you find that is not on this list.
- E. Our own high-priority task, woken from the audio interrupt by an interrupt-safe notify or semaphore, that calls the MIDI send. Does the SDK's OS layer expose interrupt-safe signaling and task creation to the app? Is the MIDI send function safe from a task other than the control task? What priority would it need, and what does that do to audio?
- D. Write DIN MIDI straight to the TRS jack's UART from the song tick, through a small ring buffer drained by the UART's own TX interrupt, for DIN only (USB stays on the SDK path). Which UART drives the TRS out? Does the SDK's MIDI task own it in a way that would collide (shared buffer, DMA, running status, locking)? What would the SDK need to stop doing on that port?
- F. A hardware timer interrupt at 1 ms or finer that hands due notes to the send path through E or D, instead of the audio interrupt.
- G. Look-ahead: schedule notes early with their due time so whichever send path wins only has to release them on time.
- H. The 10 ms constant in the SDK. Where is it, what else depends on it, and what would changing it do to audio and CPU? Before proposing any change to the SDK binary, read sdk/ and THIRD_PARTY.md and say whether the SDK terms allow modifying it. If they do not, drop H and say so.
- I. A request to M-VAVE for an SDK change (a send call that is safe from an interrupt, or a configurable control tick). Draft the request text, plain and short, for me to send. Do not send anything.

Step 3. Rank the options by expected spread, risk, flash and RAM cost, and how we would prove each one on hardware. Recommend one, with the reason in plain words.

STOP after Step 3 and report in no more than 30 lines: the baseline, each option with yes or no and the key evidence, the ranking and your recommendation, and the M-VAVE request text. Do not build anything until I approve.

AFTER APPROVAL (do not start until I say so)
Step 4. Build the recommended option behind a build flag, off in the normal build, on in a diag build. Host and simulator tests first. Publish the diag build only under builds/<tag>/, never on the main page. I install it from the Mac. Then measure it the same way as Step 1 and compare in one table, including audio dropouts (record the SMK-37's audio through the AUDIO4c during the eight-line run) and USB MIDI timing.

RULES
- Version headers and revision logs on every file you change; comment the code heavily, with revision notes by version.
- Keep SPEC.md, BUILD.md and FLASH-BUDGET.md current. Mark every number as measured or estimated.
- Commit at the end of each step. Do not push or publish before Step 4.
