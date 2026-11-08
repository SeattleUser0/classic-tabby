Classic Tabby, Task 11B: run the Task 11 hardware checklist yourself

Version 0.1
Revision log:
- v0.1, 2026-11-07: first version. Replaces the manual run of BUILD.md 24.6 with an automated run by the agent.

Save this task text to docs/tasks/TASK-11B-automated-hardware-tests.md and commit it before you start.

WHAT CHANGED
I am not going to run BUILD.md 24.6 by hand. The SMK-37 Pro is plugged into the NUC by USB, and its MIDI out is wired to the AUDIO4c's DIN input. You run the checklist yourself, unattended. I do not need my data on the device kept: it may be lost.

PERMISSION, AND ITS LIMITS
This task lifts the earlier "do not flash or send anything to the device" rule, for this task only, and only for the SMK-37 Pro:
- You may install tabby-v03.3-diag, tabby-p0-probe64, tabby-v03.2 and factory V16, and nothing else.
- You may run backups, restores, verifies, counter reads, the commands the workbench already sends, and MIDI clock, Start, Stop and notes sent to the SMK-37 over USB.
- Install and restore only through the real workbench pages (the published ones or the same files built locally), driven by Playwright with the installed Google Chrome and the midi and midi-sysex permissions granted. Do not write a separate flasher. The point is to test the path I will use.
- Before every install, confirm the connected device identifies as an SMK-37 Pro (SMK-37 Pro_8000001 on Open firmware, SMK-37 Pro_016 on factory V16). If it identifies as anything else, including an FM-1 or Orange Cat, stop at once and send nothing. Two FM-1s may also be connected to this computer.
- If an install leaves the device with no USB MIDI port, or it stops answering, stop. Do not retry, do not force-flash, do not power-cycle anything. Write down the state and wait for me.

STEP 1. See what you can do without hands
Before running anything, work out and write in BUILD.md which parts of 24.6 can run with no one at the device, and how:
- Starting and stopping songs on the device. Find out whether song mode can be started over USB today (MIDI Start, a workbench command, or anything else). If it cannot, say what a diag-only remote command would cost. You may add it to the diag build only if it fits the 637-byte margin and changes nothing for the normal build; otherwise tell me and continue with what you can do.
- Reading what the ACTIONS page shows (USER size, song storage state, free and reclaim). Use the capability reply and the diagnostics read over USB. Say if anything on that page cannot be read over USB.
- Load for run B. Real key and pad presses are not possible. Use MIDI notes sent into the SMK-37 over USB at a similar rate (about 100 notes over 2 minutes, mixed velocities) as the router load instead. Mark L.4 (key scan to router latency) as needing a person, and still report the scan ISR counters (L.5).
- External clock follow (L.6). The MC-101 is not needed: send MIDI clock, Start and Stop from the NUC over USB at 120 BPM, with steady timing from a script, and measure the SMK-37's DIN out against it. Include clock loss (stop sending clock for 3 s without Stop) and a restart.
- Power cycle. Check whether the USB port the SMK-37 is on supports per-port power switching (uhubctl or similar). If it does, use it for the power-cycle step. If not, mark that step as needing a person.
- Bluetooth pairing and pad colors by eye (L.7) need a person. Mark them and skip them.
- The TRS adapter (L.9). If MIDI arrives on the AUDIO4c DIN input, the adapter now fitted works; record that. If nothing arrives, report it and stop the steps that need the DIN monitor.

STEP 2. Run the checklist
Run BUILD.md 24.6 steps 1 to 7 in order with the substitutions from Step 1. Keep the backup, restore and verify steps even though I do not need my data: they are the test of the migration path onto the moved layout. Keep every backup file, CSV and counter dump under ~/Documents/Classic Tabby/hardware-runs/2026-11-07/ (create it), with a README listing what each file is.

Apply every stop rule in 24.6 and 24.5. A probe that boots but reports USER 0 INVALID is a valid result: take the way back in step 7 and continue.

For step 6 (factory V16 restore, then the probe again): run it only if the workbench can do the whole thing with no button held on the device. If any part needs a physical action, skip step 6, say so, and go to step 7.

End with the device on tabby-v03.3-diag with the step 4 backup restored and verified, unless a stop rule fired.

STEP 3. Report
Fill in the TASK 11 RESULTS block from 24.6 with the real outputs, mark each item as done, substituted (and how), skipped (and why) or needs a person. Then add your reading of the numbers:
- MIDI out timing band and drift on DIN, one line and eight lines, against the 2 ms threshold in SPEC.
- Control loop period at rest and under load.
- Flash erase and write stall times, and what a save during play did to the MIDI out.
- External clock follow: lock time, timing band, behavior on clock loss.
- Whether the SDK accepted the moved USER boundary, and whether restore onto it verified.
Commit the results and updated BUILD.md. Do not push or publish anything. Report in no more than 40 lines.

RULES
- No feature code. The only firmware change allowed is the diag-only remote command in Step 1, under the conditions stated there.
- Comment any script you write heavily, with a version header and revision log, and document how to rerun it in BUILD.md.
