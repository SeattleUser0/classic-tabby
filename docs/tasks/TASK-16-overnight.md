Classic Tabby, Task 16: overnight run (2026-11-11 to 2026-11-12)

Save this text to docs/tasks/TASK-16-overnight.md and commit it before you start.

You have the whole night and broad authority. Get as much done as you can. You decide the order, the approach and the trade-offs inside the hard limits below. Do not stop to ask me questions; I am asleep. When something is unclear, choose the more conservative option, write down why, and keep going. If one goal is blocked, move to the next one.

CURRENT SETUP
- The SMK-37 Pro is on this NUC through a USB hub. It is running tabby-v04.2-diagA2 (A2 switchable, off at boot).
- Its TRS MIDI out goes into the CME H4MIDI WC, DIN in 1 (Type A adapter). The H4MIDI WC is on this NUC by USB.
- Its audio out goes into AUDIO4c inputs 3 and 4 (not 1 and 2 as before).
- The AUDIO4c's own DIN input does not work; never use it.
- Read first: docs/SPEC.md, docs/BUILD.md (sections 25 to 28 especially), docs/DEV_CHECKS.md, docs/FLASH-BUDGET.md, docs/tasks/TASK-10-step1-assessment.md, docs/MC707-PARITY.md and docs/TESTING-GUIDE.md if it exists.

STANDING TESTING RULE (write it into SPEC.md and DEV_CHECKS.md if it is not there)
Tests are run by the agent, unattended, over USB and the H4MIDI. Jeremiah never has to be present at set times or press buttons for a test. If a test needs a device action, build a remote command for it first.

HARD LIMITS (these are not yours to decide)
1. Installs from this NUC are allowed tonight, under these rules only:
   - Before the first install, run a read-only USB soak through the hub (at least 2000 rounds). If it shows any error or timeout, do not install from this NUC tonight; publish the build and leave the install for me.
   - Use only the normal update path of the published page for that build, driven in Chrome as before. Confirm the device identity first.
   - Never force flash, never factory restore, never switch to official Open V01, never touch the bootloader, key_mac or calibration.
   - One attempt per build. If an install stalls or fails, stop all device writes for the rest of the night, leave the device as it is, and write exactly what happened and which recovery page I need in the morning report. Then carry on with work that needs no device.
2. Never modify the SDK binary (its licence forbids it). Never send anything to M-VAVE or post anywhere outside our own GitHub repo.
3. Never delete or overwrite an existing page under builds/. Fetch gh-pages before every publish. Every new build gets its permanent builds/<tag>/ page and an entry in builds/index.json.
4. The device's song storage, projects and settings may be erased or overwritten for tests. Take a full backup before any release you install, and keep it.
5. A storage format change (the v3 clip format) may be built and tested on the host and in the simulator, but do not release or install it tonight. It waits for my review.
6. Check for other worktrees and the build lock before you build, and respect them; another session may have published tabby-v04.1.1. If it did, build on it.

GOALS, IN PRIORITY ORDER
Do them in this order unless a dependency says otherwise. Each one: tests first, then code, then docs, then commit.

Goal 1. Release tabby-v04.2.
- Merge classic-tabby/timing-research into classic-tabby/linux-build. It must carry the English-only workbench, the Help fixes and the testing guide.
- A2 on by default in the normal build; keep the ACTIONS switch to turn it off; keep its counters in Diagnostics.
- Remote control over USB in the normal build, as workbench transfer commands: select song, PLAY, STOP, jump to row, A2 on/off, and a panel-key injection command (press, hold, release a named control) so UI flows can be tested without hands. No flash writes from these commands. Host tests for each.
- F + G: not now. Record why (one line under 4 ms; eight-line worst case is mostly the DIN cable, fixed by the H4MIDI fan-out wiring).
- make suite and make crosscheck green. Publish to the main page, builds/tabby-v04.2/ and a GitHub release. Update Help chapter 00, the testing guide's known limits and the install file template.
- Install it on the device under hard limit 1.

Goal 2. Validate tabby-v04.2 on the device, unattended.
- One line and eight lines, A2 on and off, DIN through the H4MIDI and USB, control pass profile, CPU GUARD count, audio recorded from AUDIO4c inputs 3 and 4.
- A one-hour continuous-play soak with A2 on, using remote PLAY, with a transfer and a save while stopped at the end. Check STOP TO SAVE refuses writes while playing.
- Check every remote command and the panel-key injection against the screen state the firmware reports.

Goal 3. External clock follow in song mode (decision 10).
- Start, Stop, Continue, Song Position Pointer, and clock loss, with these rules: after about 3 missed pulses stop advancing and send note-offs; a gap under 2 s without Stop relocks and continues from the held position; a longer gap shows LOST and waits for Continue or Start; clock pulses alone never restart a song in LOST; Stop always wins; SPP is accepted while stopped and while running.
- Clock in over USB, and over the TRS jack if the SDK allows it as an input (see the Task 14 findings).
- Test it unattended by sending clock from this NUC, including tempo changes, gaps and SPP jumps. Measure lock time and timing spread with A2 on.
- Release it as tabby-v04.3 if it passes, and install it under hard limit 1.

Goal 4. Clean-up that is already on the left-to-build list.
- Stale firmware screen text (the STEP and NOTE knob labels, the pad-step lines, "ERASE OLD SAMPLE DATA").
- The open lint findings (the two out-of-bound sector accesses in song_storage.c first), with the identical-output gate where behavior must not change.
- The remaining Help items and anything the banned-phrase test or the guide flags.
- Ship with the next release you make.

Goal 5. Start the MC-707 workflow, Phase 2, on a branch.
- The v3 event-list clip format from the Task 10 assessment: data model, storage format, scheduler changes, migration from v2 songs and .tabby files, importer changes. Host and simulator only, with tests. Do not release (hard limit 5).
- Write the review document I will read: what the format is, what it costs in flash and RAM (measured), what migrates and how, what the device UI for clips will need next, and any decision you need from me.

Goal 6. Anything else you judge worth doing that serves the roadmap in SPEC.md, within the hard limits.

KEEP THROUGHOUT
- SPEC.md, BUILD.md, FLASH-BUDGET.md, the MIDI guide, Help and the testing guide current. Version headers and revision logs on every file you change. Comment the code heavily, with revision notes by version.
- Mark every number as measured or estimated.
- Commit at the end of each goal. Push releases and their docs.

MORNING REPORT
When you finish or run out of work, write ~/Documents/Classic Tabby/MORNING-REPORT.txt, plain text, short sentences, for me to read on my iPad. At most one page:
1. What firmware is on the device now, and whether it is working.
2. What was released, with the URLs.
3. The measured results, in one small table.
4. Decisions you made on your own, one line each, with the reason.
5. What needs me, if anything. If the answer is nothing, say so.
6. What you would do next.
