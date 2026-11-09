Classic Tabby, Task 12: Phase 0 (make room) and the Phase 1 timing investigation

Version 0.1
Revision log:
- v0.1, 2026-11-08: first version, after Task 11 and 11B hardware results.

Save this task text to docs/tasks/TASK-12-phase0-and-timing.md and commit it before you start.

ROLES AND DEVICE RULES
You are the implementing agent. I review with Claude in the desktop app, which orchestrates.
- No unattended installs or device writes. You may build, test in the simulator, and read from the device at any time.
- Firmware installs (updates, force flash, factory restore) are done only from my MacBook, by me, in Chrome, with the SMK-37 plugged straight into the Mac. Never from this NUC.
- Other device writes from the NUC (song uploads, erase, restore, backup that writes) are allowed only while I am at the desk and have said so in this session.
- Timing measurements on DIN use the CME H4MIDI WC, Port 1 (DIN in 1), with the SMK-37's TRS out through a Type A adapter. Do not use the AUDIO4c DIN input; it receives nothing and is not yet understood.

WHAT WE KNOW (BUILD.md 25)
- Moving USER down 64 KiB (user_bytes 471040) works on the device: USER 471040 SONG READY, restore onto it verified, and the way back verified.
- MIDI out timing is far past SPEC's 2 ms threshold: band 14 to 18 ms (USB, host-timestamped), control loop mean 5.5 ms at rest and 6.3 ms under load, worst 19 ms. The screen takes about 4% of the loop and does not set its period.
- A project save stops MIDI out for about 213 ms and audio for at least 104 ms. A song delete over USB stopped notes for 1.35 s and left a note hanging.
- An interrupted install left the loader waiting for the exact build that was being installed. It accepted only that build. It recovered when power-cycled and finished from the Mac. The update loop on the NUC is not explained; the AUDIO4c and the USB link were ruled out by the soak test.

PART A: PHASE 0, MAKE ROOM (release tabby-v04.0)

A1. Storage move becomes the normal layout.
- The normal build uses user_bytes 471040. Keep the single build setting from Task 11 so the old size can still be built for tests.
- Bump the song record and capability numbers as needed, update the workbench (WebUpdate.js, capability checks, importer storage estimate for 80 block sectors) and the simulator.
- First boot after the move: if song storage reads OLD DATA, the ACTIONS page and the workbench both say so plainly and offer ERASE OLD DATA, with confirmation. Nothing is erased without confirmation.
- Document the move in BUILD.md and in the release notes: back up first, what is lost (Bluetooth pairings once, anything not restored), how to restore, and how to go back to v03.x.

A2. Removals.
- Remove the stock sequencer pages and their REC logic (STEPS 1 to 7, STEP_EDIT, RHYTHM), as listed in the Task 10 assessment section J. Keep the ARP_EDIT page and the arpeggiator. Keep the factory DX7 bank.
- Anything that still needs the stock pattern (project load and save of the SDK struct) stays.
- Update the Help chapters and the panel shortcuts text so nothing points at a removed page.

A3. Block writes during play.
- While the transport is running (song mode or the stock sequencer), refuse every flash write: project SAVE, song upload, song delete, COMPACT, ERASE, full restore, settings writes, and any other transfer kind that writes flash. On the device show a short message (for example STOP TO SAVE). In the workbench, show a clear message and do not send the write.
- Reads stay allowed during play.
- Host tests for each write path while playing and while stopped.

A4. Keep the timing counters in the normal build.
- The diag counters (control loop, flash erase and write, scan ISR, screen) and the Diagnostics panel become part of the normal build, if they fit with the space A1 and A2 free. Drop the diag-only remote commands from the normal build.
- Add a finer profile of the control loop for Part B: the time spent in each major section of one pass (MIDI input handling, song scheduling and sends, router, screen, panel and LEDs, transfer handling, and the SDK calls between them), as max and mean per section, readable over USB. Name each section in the report.

A5. Recovery pages for every build.
- Every published build gets a permanent page at https://seattleuser0.github.io/classic-tabby/builds/<tag>/ that is never removed. Publish the existing tabby-v03.2, tabby-v03.3-diag, tabby-p0-probe64 and the diag-r2 build (move /recover/ there and keep /recover/ as a redirect or copy).
- Write builds/index.json listing every build: tag, build id, and page path.
- Safe resume for a stale loader: when the page finds a loader whose tag is not its own build, it reads the build id from the tag, looks it up in builds/index.json, and tells the user which build the loader is waiting for, with a link to that build's page. It never accepts a mismatched loader silently, and it never times out without a message. Host tests for: own tag, a known other tag, an unknown tag.
- make publish adds the new build to builds/ and to the index automatically.

A6. Release.
- Build, run make suite and make crosscheck, and confirm the flash margin. Report the margin.
- Publish tabby-v04.0 to the main page and to builds/tabby-v04.0/, plus a GitHub release. Release notes start with: this release moves storage; back up first.
- Write the install steps for me in BUILD.md and in a plain text file at ~/Documents/Classic Tabby/INSTALL-tabby-v04.0.txt. I will do them on the MacBook. Cover: full backup on the current firmware, install from the main page, what ACTIONS should show, ERASE OLD DATA if offered, full restore and verify, and what to do if the install stalls (close the tab, power-cycle, reopen the build page the loader asks for).

STOP after A6 and report. I will install from the Mac and tell you when the SMK-37 is back on the NUC.

PART B: PHASE 1 TIMING INVESTIGATION (after I confirm tabby-v04.0 is installed)

B1. Measure, with me present.
- Upload the two timing test songs (timing-1x16, timing-8x16), with my OK in this session.
- With the SMK-37 on the NUC by USB and its TRS out on the H4MIDI WC Port 1: run L.2 on DIN (one line and eight lines), read the per-section loop profile at rest and while each song plays, and repeat the USB L.2 run for comparison.

B2. Find what sets the loop period.
- From the profile and the source, say exactly where the 5.5 ms mean and the 19 ms worst case come from. If the SDK's control task has a fixed tick or wait, find it in the headers and by measurement, and say whether the app can change it.
- Find out which contexts may call the MIDI send functions (control task only, as SPEC 9.6 says, or others), and what the SDK's MIDI output path does with a send: buffered, sent at once, or sent on its own tick.

B3. Propose the fix, do not build it yet.
- At least two options, each with expected band, flash and RAM cost, risk to audio, and how we would prove it on hardware. Examples to evaluate: running the song scheduler and sends more often within each pass, splitting long work (screen, transfers) into small slices, sending from a timer context if the SDK allows it, and timestamped look-ahead if the output path supports it.
- Say what external clock follow needs from the same design: Start, Stop, Continue and SPP, and clock loss. Proposed clock-loss rule: a gap under 2 s without Stop keeps position and relocks when clock returns; a longer gap shows LOST and waits for Continue (resume from the held position) or Start (from the top). Say if you would change it.

STOP after B3 and report.

RULES
- Version headers and revision logs on every file you change; comment the code heavily, with revision notes by version.
- Keep SPEC.md, BUILD.md and FLASH-BUDGET.md current.
- Commit at the end of each numbered step. Push and publish only in A5 and A6.
- Report after Part A in no more than 25 lines: what was built, flash margin, the URLs, the install file path, and anything that did not fit. Report after Part B in no more than 30 lines: the measurements, the cause, and the fix options with your recommendation.
