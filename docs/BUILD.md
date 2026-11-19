# Classic Tabby — Linux build of SMK37 Open V01

Version: 1.00
Revision log:
- v1.00, 2026-11-18: 62.4 (tabby-v1.0.1 released as candidate 1), section 63 (tabby-v1.0.2: EVENT LEAD; the device found with track 1 muted; the panel state guard).
- v0.99, 2026-11-18: section 62 (the soak's data showed missing row events; my soak check had not looked; tabby-v1.0.1).
- v0.98, 2026-11-18: 61.1 (tabby-v1.0 released as candidate 1).
- v0.97, 2026-11-18: 59.2 (tabby-v04.23 released as candidate 2), section 60 (the 9.9 ms run answered: the NUC's clock; the tools on the raw clock; a 70-minute soak), section 61 (tabby-v1.0).
- v0.96, 2026-11-18: 58.1 (tabby-v04.22 released as candidate 1), 59.1 (tabby-v04.23-rc1 not promoted: the NUC's clock, and one check of mine), section 59 (tabby-v04.23: the step loop).
- v0.95, 2026-11-18: 57.5 (tabby-v04.21 released as candidate 2), section 58 (tabby-v04.22: NOTE REPEAT).
- v0.94, 2026-11-18: 56.1 (tabby-v04.20 released as candidate 1), 57.4 (tabby-v04.21-rc1 not promoted: a test tool error), section 57 (tabby-v04.21: clear notes in a take, NEW SONG, shift a clip; the pad rows; stickers v0.4).
- v0.93, 2026-11-18: 55.1 (tabby-v04.19 released as candidate 1), section 56 (tabby-v04.20: DIRECTION per clip).
- v0.92, 2026-11-17: 54.3, 54.4 (tabby-v04.18: candidate 1 held back by a tool limit, candidate 2 released), section 55 (tabby-v04.19: STEP SIZE per clip).
- v0.91, 2026-11-17: 53.1 (tabby-v04.17 released as candidate 1), section 54 (tabby-v04.18: the printed button names; the photograph; the stickers redesigned).
- v0.90, 2026-11-17: 52.3 (tabby-v04.16 released as candidate 1), section 53 (tabby-v04.17: SHUFFLE and PLAY QUANTIZE per clip, three pages).
- v0.89, 2026-11-17: section 52 (tabby-v04.16: a scene deleted and moved, a stop takes an armed take off, the printable manual, stickers in inch fractions; the photograph that was not there).
- v0.88, 2026-11-17: section 51 (tabby-v04.15: TRANSPOSE, DELETE CLIP; the parity list v0.2).
- v0.87, 2026-11-17: 50.3 (tabby-v04.14 on the device, the first release through the flow), 50.4 (stickers, the manual).
- v0.86, 2026-11-17: section 50 (tabby-v04.14: the page fixes, CLICK LEVEL, the controller numbers; the release flow of SPEC 17.13 and its tools).
- v0.81, 2026-11-16: section 45 (tabby-v04.9.3: the flash part page, command 25 request 11) and 45.1 (on the device: 0x856014).
- v0.80, 2026-11-16: 43.1 (tabby-v04.9.1 on the device; the publish gate and the untracked file), section 44 (tabby-v04.9.2).
- v0.79, 2026-11-16: 42.3 (tabby-v04.9 on the device; the HOME fault, the killed test, the one odd timing run), section 43 (tabby-v04.9.1).
- v0.78, 2026-11-16: 41.3 (tabby-v04.8 on the device), section 42 (tabby-v04.9: real-time recording).
- v0.77, 2026-11-16: 40.3 (tabby-v04.7.1 on the device), section 41 (tabby-v04.8: the clip editor and the STEP page).
- v0.76, 2026-11-16: section 40 (tabby-v04.7.1: the user's answers; reservation, the two mutes, the MC-707 differences).
- v0.75, 2026-11-14 (Task 17 Goals 3 and 4): 38.3 (tabby-v04.6 on the device), section 39 (tabby-v04.7, the CLIPS page).
- v0.74, 2026-11-14 (Task 17 Goal 3): 37.4 and 37.5 (tabby-v04.5 and its page fault, tabby-v04.5.1 on the device), section 38
  (tabby-v04.6: scenes).
- v0.73, 2026-11-14 (Task 17 Goals 1 and 2): section 37: the suite gate, the tracked note lines, the v3 clip finished
  (RAM, the 16-bit time fault, fuzz, kind 9), the validation tools, tabby-v04.5.
- v0.72, 2026-11-14 (Task 17): section 36, tabby-v04.4: options F + G as built, the flash and interrupt evidence, updating with
  CLOCK on MIDI, the "late note" in clock follow, the correction of section 35 (the "no replies" fault was the NUC's tool), the
  device results, the release.
- v0.71, 2026-11-12 (Task 16, day 2): section 35: the real cause of the "hang" (the SDK holds the last USB write when no clock
  goes out on USB), the USB pusher, the device results (hang tests A2 off and on, follow measurements), the band and the screen page.
  34.1 to 34.3 corrected: the flash guard closes a hazard, it was not the cause.
- v0.70, 2026-11-12 (Task 16, second night): section 34, the hang: the map-file evidence, the flash guard (ct_flash_busy), the
  host test; 34.4 why the one-line band measured 4.91 ms against 3.67.
- v0.69, 2026-11-12 (Task 16 Goal 3): section 33, tabby-v04.3: what changed, the gate, the soak and the device results.
- v0.68, 2026-11-11 (Task 16 Goal 1): section 32, tabby-v04.2: the merge, what changed, the gate, publishing.
- v0.67, 2026-11-11 (tabby-v04.2 merge): the Task 14 and v04.1.1 sections are now 30 and 31 (Task 15 keeps 28);
  the timing branch's sections stay where the device-run notes point.
- v0.66, 2026-11-11 (Task 15 Step 5): 28.6: the overnight A2 soak, the transfer and the save while
  stopped (A2 on against off, backups equal before and after), what was not covered.
- v0.65, 2026-11-11 (Task 15 Step 5): 28.6, option A2 measured on the device: one line 3.67 ms on DIN
  (12.34 ms with A2 off), eight lines 3.8..6.5 ms, call cost, CPU GUARD baseline, the soak so far, the
  measuring-tool faults.
- v0.64, 2026-11-10 (Task 15 Step 4): 28.5, the publication record of tabby-v04.2-diagA2.
- v0.63, 2026-11-10 (Task 15 Step 4): section 28.5, the diag build tabby-v04.2-diagA2: build record, where
  it is published (builds/ only), the install and the Step 5 plan.
- v0.62, 2026-11-10 (Task 15 Step 4): section 28.4, option A2 as a diag build: why 27.2's "not safe"
  verdict was wrong (the evidence), what was built (A2=1, the run-time switch, the call-cost counters),
  tests and the unchanged normal build.
- v0.61, 2026-11-10 (Task 15 Step 3): section 28.3, the ranking and the recommendation (the pass request
  from the song tick first, the TIMER5 release second), the floor on the SDK's send path.
- v0.60, 2026-11-10 (Task 15 Step 2): section 28.2, the options from the disassembly and JieLi's public
  headers: the pass request from the audio interrupt is the SDK's own pattern (27.2's verdict revised),
  no OS calls exported, UART1 and TIMER5 facts, the SDK may not be modified, the M-VAVE request draft.
- v0.59, 2026-11-10 (Task 15 Step 1): section 28.1, the baseline: the SMK-37 is not on the NUC, so the
  Task 12 B1 numbers (tabby-v04.0) stand until tabby-v04.1 is installed and measured.
- v0.62, 2026-11-10 (tabby-v04.1.1): section 31 (was 29), the testing guide and the Help/text-only release.
- v0.61, 2026-11-10 (Task 14, English only): 30.5 (was 28.5), the conversion and what a future upstream merge needs.
- v0.60, 2026-11-10 (Task 14, second pass): 28.4 (30.4) settled: the restore sectors, the TRS jack, the demo samples.
- v0.59, 2026-11-10 (Task 14): section 30 (was 28), the Help audit against tabby-v04.1 (counts, the banned-phrase
  guard, stale firmware texts for the left-to-build list, open questions).
- v0.58, 2026-11-10 (Task 13 Step 5): 9.1, tabby-v04.1 is the current release; 27.5 its publication and
  verification record.
- v0.57, 2026-11-10 (Task 13 Step 5): 27.5, the tabby-v04.1 release build and its install steps.
- v0.56, 2026-11-10 (Task 13 Step 4): 27.4, the panel wording (knobs by number, the firmware's SAVE
  button by position), SPEC 17.4's table, docs/releases/INSTALL.template.txt.
- v0.55, 2026-11-10 (Task 13 Step 3): 27.3, DIN running status and the recommended live wiring.
- v0.54, 2026-11-10 (Task 13 Step 2): 27.2, the option A safety check: not safe (the song tick runs in
  the audio interrupt; the request takes scheduler paths that are not interrupt-safe). A not built.
- v0.53, 2026-11-10 (Task 13 Step 1): section 27.1, option B (the control-pass budget) and what
  CPU GUARD is.
- v0.52, 2026-11-09 (Task 12 B3): 26.9 B3, fix options (none built), external clock follow and
  the clock-loss rule.
- v0.51, 2026-11-09 (Task 12 B2): 26.9 B2, where the band comes from (the SDK's 10 ms control
  timer, the send path).
- v0.50, 2026-11-09 (Task 12 B1): 26.9 the Phase 1 timing measurements on tabby-v04.0 (L.2 on DIN
  and USB at once, one line and eight lines, the loop profile at rest and while playing).
- v0.49, 2026-11-09 (Task 12, install incident): 26.8 the record of the night and the update page fix
  (zero tag resumes, no force after a timeout); left-to-build updated; tabby-v04.0-recover listed on builds/.
- v0.48, 2026-11-09 (Task 12, install incident): 26.7 the tabby-v04.0 recovery page
  (builds/tabby-v04.0-recover/, tools/linux/recover-page.py, tests/workbench/recover-page.mjs).
- v0.47, 2026-11-09 (Task 12, install incident, read only): left-to-build: the all-zero loader tag
  (a loader entered by the forced path carries no build tag; the page refuses it and must not).
- v0.46, 2026-11-09 (Task 12 A6, verification): 9.1 the tabby-v04.0 record (current release);
  9.3g verification after publishing, including the Pages deployment that hung and the rebuild.
- v0.45, 2026-11-08 (Task 12 A6): 26.6 the tabby-v04.0 release build and the install steps for the
  user (also ~/Documents/Classic Tabby/INSTALL-tabby-v04.0.txt).
- v0.44, 2026-11-08 (Task 12 A5): 26.5 permanent build pages (builds/<tag>/, builds/index.json) and
  the safe resume for a stale loader; 9.1 and 9.2 updated.
- v0.43, 2026-11-08 (Task 12 A4): 26.4 the counters and the loop profile in the normal build.
- v0.42, 2026-11-08 (Task 12 A3): 26.3 block writes during play.
- v0.41, 2026-11-08 (Task 12 A2): 26.2 the step editor removed; SYNC / MIDI; left-to-build: the
  metronome and count-in (Phase 5).
- v0.40, 2026-11-08 (Task 12 A1): section 26: Task 12; 26.1 the storage move as the normal layout,
  migration, OLD DATA, commands 27/28, how to go back.
- v0.39, 2026-11-08 (Task 11C, part 3): 25.7: L.9 closed: the TRS out works with a type A
  adapter (all notes and clock into the CME H4MIDI WC); the AUDIO4c side is the fault.
- v0.38, 2026-11-08 (Task 11C, part 2): 25.6: the shared-controller USB test (four conditions,
  all pass; AUDIO4c audio is not the likely cause), the rule that follows, the TRS MIDI out watch
  (nothing reaches the AUDIO4c), make suite after the port-name fix; usb-readback.py v0.4.
- v0.37, 2026-11-08 (Task 11C): device rules (top and SPEC 15); 25.5: the Mac recovery, the port
  name fix (normalized names, no silent failure), what the stale loader tag did today, the NUC
  USB failure and a read-only link test, the firmware read back over USB; usb-readback.py in
  25.2.
- v0.36, 2026-11-08: 25.3c the approved resume: the write looped and never finished; stopped,
  the manual resume steps handed to the user.
- v0.35, 2026-11-08 (Task 11B, the first way out): 25.3b the reproduced diag-r2 tag and the
  resume stopped by a driver bug; left-to-build: a safe resume path for a stale loader tag.
- v0.34, 2026-11-08 (Task 11B continuation): 25.2 the resume, --port and trs-watch commands and
  the update-ports test; 25.3a the device state, the workbench port fix, the failed loader
  resume and why the published-diag install timed out (a stale loader tag).
- v0.33, 2026-11-07 (Task 11): sections 9.1 and 9.3f (tabby-v03.3-diag and tabby-p0-probe64
  published) and 24: the build options (DIAG, USER_BYTES), the full backup,
  the diagnostic build and its counters, the MIDI monitor, the probe and the way back, the
  hardware checklist; publication of tabby-v03.3-diag and tabby-p0-probe64.
- v0.32, 2026-11-05: section 9: tabby-v03.2 published (9.1 current values, 9.3e verification
  with the forced-version gate against tabby-v03.1 and the archive VERSION check); the
  Task 09 hardware items in the left-to-build list.
- v0.31, 2026-11-05 (Task 09 checkpoint d): sections 23.4 (the simulator check, the two
  findings) and 23.5 (the Step 4 hardware checklist); the gap-order rule in the guide.
- v0.30, 2026-11-05 (Task 09 checkpoint c): section 23.3: the generated MIDI guide, its tool,
  test and download; the hand-written template.
- v0.29, 2026-11-05 (Task 09 checkpoint b): section 23.2: the importer's rig-aware mapping,
  the four rig warnings, the fixtures; a programIgnored bookkeeping bug fixed on the way.
- v0.28, 2026-11-05 (Task 09 checkpoint a): section 23: the device library additions and
  rechecks, the Wrong Room profile, the profile selector; the Orange Cat cross-project note in
  the left-to-build list.
- v0.27, 2026-11-05: section 9: tabby-v03.1 published (9.1 current values, 9.3d verification
  with the forced-label gate and the archive VERSION check); the ACTIONS confirmation index
  and the two hint texts in the left-to-build list.
- v0.26, 2026-11-04 (Task 08, manual): section 22: the workbench manual rewritten for Classic
  Tabby; the code-versus-spec disagreements found while writing it.
- v0.25, 2026-11-04 (Task 08): section 21: the display version (git tag) on the boot screen,
  the workbench badge and the update tab; 9.2 release-note template; 9.4 wording; the
  forced-label gate measured.
- v0.24, 2026-11-04: left-to-build list: the Task 07 lint findings read and closed (verdicts
  per line); the harmless-warning clean-up stays listed as optional separate work.
- v0.23, 2026-11-04: section 9: tabby-v03.0 published (9.1 current values, 9.3c verification,
  the pre-publication sanitizer run and the cppcheck item).
- v0.22, 2026-11-04 (Task 06 checkpoint d): sections 19.4 (workbench), 19.5 (the Step 4
  hardware checklist) and 19.6 (results for the final report).
- v0.21, 2026-11-04 (Task 06 checkpoint c): section 19.3: the TRACK LAUNCH page, pad
  colours, SCL / ENV routing, measured figures.
- v0.20, 2026-11-04 (Task 06 checkpoint b): section 19.2: per-track playheads in firmware,
  measured figures, host test section 13, build.py v0.5 (-Oz for the sequencer units).
- v0.19, 2026-11-04 (Task 06 checkpoint a): section 19: BLE and NAME pages removed, Bluetooth
  settings through the workbench (command 24), build.py v0.4, measured figures; the two
  deferred items in the left-to-build list.
- v0.18, 2026-11-04 (Task 05): section 18: timed notes (module, firmware, workbench,
  importer), measured figures, the timing results, the test suites, the hardware checklist;
  section 14.2 superseded by 18.4; `make timed-note-test` in `make test`.
- v0.17, 2026-11-02: section 9: tabby-v02.0 published (9.1 current values, 9.3b verification).
- v0.16, 2026-11-02 (Task 04, workbench part): section 17: device library, rig setup, row
  event editor, importer conversion, tests, the Task 04 hardware checklist.
- v0.15, 2026-11-02 (Task 04, firmware part): section 16: row events in firmware, measured
  figures, host tests, and the device setup list for the hardware checklist.
- v0.14, 2026-11-02 (Task 03 checkpoint f): section 15: factory scenes out, delete-before-
  replace in the shared song write, tempo range, liveness by reference; 13.4 step 12 (timing
  against the stock sequencer); 14.5 step 5 wording.
- v0.13, 2026-11-02 (Task 02 Step 4): section 14: MIDI import build notes folded from
  docs/tasks/TASK-02-notes.md, the Step 4 changes, the simulator check and the hardware
  checklist for the importer.
- v0.12, 2026-11-02 (Task 03 checkpoint e): section 13: batched block upload (transfer
  kind 7), measured figures, upload time estimate, hardware checklist for the first flash.
- v0.11, 2026-11-02 (Task 03 checkpoint d): section 12: song mode (storage, sequencer,
  transfer, SONG page, workbench editor); measured figures; host test v0.3.
- v0.10, 2026-11-02 (Task 03 checkpoint b): section 11: DX7 operator editor pages and the
  tone editor removed from app/screen.c and the workbench simulator; measured figures.
- v0.9, 2026-11-02 (Task 03 checkpoint a): section 10: sampler and DX7 user library removal,
  migration prompt, workbench changes, manifest re-pin tool (tools/linux/pin-sdk-files.py),
  measured flash/RAM. `make test` now has 35 host checks.
- v0.8.1, 2026-11-02: section 9.3a, verification of the live site, archive and release.
- v0.8, 2026-11-02 (Task 02): publication. `build.py` v0.3 ports `-Package`; `make package`,
  `hosted`, `release-assets`, `publish`, `release` (Makefile v0.4); `tools/linux/publish-pages.py`
  v0.1 (Build-Hosted.cjs + gh-pages); section 9 with the published hashes, Pages URL and the
  tag rule for the GPL source link. Section 7 rows for Build-Web.ps1 and Build-Hosted.cjs updated.
- v0.7, 2026-11-01 (Step 8, end of Task 01): hardware readiness recorded read-only
  (section 8); no udev rule needed for Chrome WebMIDI/SysEx; the plugged-in device
  enumerates as "Orange Cat FM-1", not as an M-VAVE SMK-37 (open question).
- v0.6, 2026-11-01 (Step 7): host smoke tests (`tests/host/smoke.c`, native gcc build of
  the app + simulator sources with FM1_HOST_TEST) and `make test`; Makefile v0.3.
- v0.5, 2026-11-01 (Step 6): web workbench preview built with the Linux WASI SDK 27
  (`tools/linux/build-web.py`); simulator wasm byte-identical to the official release;
  preview verified in Chrome; Node check of the wasm; Makefile v0.2 (web, web-smoke).
- v0.4, 2026-11-01 (Step 5, Checkpoint C): Track B built from the toolchains folder (no
  /opt/jieli); A/B comparison: byte-identical; Track B is the default `make firmware`;
  top-level Makefile v0.1 (verify, firmware, firmware-native, firmware-ref, crosscheck,
  flash-budget, package-equivalence, clean).
- v0.3, 2026-11-01 (Step 4): official package reproduced byte for byte from the official
  source kit (`build.py --source-root`, v0.2); second-directory determinism result recorded;
  fork keeps LF line endings, so its build_id differs from official for that reason only.
- v0.2, 2026-11-01 (Checkpoint A): Wine installed, ~/.wine-jieli created, Track A build
  done and deterministic; package versions updated; flash/RAM baseline now from Track A.
- v0.1.2, 2026-11-01: PowerShell unavailable from Microsoft's repo for Ubuntu 26.04; pwsh
  equivalence test deferred (left to test); tar.gz alternative noted; install script v0.2.
- v0.1.1, 2026-11-01: added docs/FLASH-BUDGET.md reference and tools/linux/flash-budget.py.
- v0.1, 2026-11-01: created during Task 01. Steps 1 (repo) and 2 (host packages, partly
  blocked on sudo) done; Track A port written and verified against the native toolchain in
  a scratch build; official V01 release metadata captured; Track B toolchain pinned.

This file tracks what is done, what is left to build, what is left to test, exact package
versions, toolchain hashes, and the commands to reproduce the build from a clean Ubuntu
install. It is updated at every checkpoint. Scope and acceptance criteria: docs/SPEC.md.

Nothing in Task 01 touches device flash. Factory calibration and protected flash regions
are never written.

**Device rules (2026-11-08, Task 11C; SPEC 15).** No unattended installs or device writes: the
agent builds, tests in the simulator and reads from the device; every install, restore or erase
is done by the user or with the user present. No flashing from the NUC until its USB problem is
understood (25.5); installs are done from the user's MacBook.

## 1. Status

### Done

- Step 1: upstream cloned to `firmware/` (remote `upstream`, tag `upstream-v01` =
  b2d6bcb "SMK37 OPEN V01"), branch `classic-tabby/linux-build`. `.gitattributes` intact.
  All 67 hashes in the `files` section of `sdk/manifest.json` verified against disk.
- Step 7 (**done**): `make test` = `host-smoke` + `web-smoke`. `host-smoke` compiles the 33
  app/web/third_party C units (the simulator's source set, `-DFM1_HOST_TEST -DFM1_OPEN_WEB`)
  natively with gcc 15.2 in 7 s together with `tests/host/smoke.c`, and runs it: it builds,
  the simulator initializes with cleared storage, SMK37 key 12 gives Note On 60 velocity
  100 on MIDI channel 1 (the default for keyboard track 0) on ports 0-2 and Note Off on
  release, the track's output channel moved to 3 through the MIDI settings makes the note
  follow (after the firmware's controller reset on the old channel), and audio renders.
  21 checks, all pass. The Makefile (v0.3) has verify, firmware, firmware-native,
  firmware-ref, crosscheck, web, web-smoke, host-smoke, test, flash-budget,
  package-equivalence, clean.
- Step 8 (**done, read only**): USB and ALSA enumeration recorded in section 8. Nothing
  was sent to or written on any device. Resolved 2026-11-02: the user confirmed the
  plugged-in device is the Orange Cat FM-1; the SMK-37 Pro was not connected.
- Task 02 (**done**, 2026-11-02): `make package` builds the distribution workbench with the
  firmware and stock V16 embedded, `make publish` puts the static site on GitHub Pages, and
  the tabby-v01.0 release carries the files. Section 9.
- Task 03 checkpoint (a) (**done**, 2026-11-02): sampler and DX7 user library removed, song
  region migration prompt. Section 10. Checkpoints (b)-(d) open.
- Step 2 (partial): versions recorded below. Packages that need root are not installed yet
  (sudo requires an interactive password); `tools/linux/install-host-packages.sh` is the
  reproducible installer for a clean host.
- Step 3 (Track A, **Checkpoint A reached**): JieLi Windows toolchain 2.5.3 unpacked with
  innoextract (no Wine needed to extract); all 22 `external_toolchain` hashes match.
  Wine 10.0 (wine64 + wine32:i386) with a dedicated prefix `~/.wine-jieli` runs
  `clang.exe --version` (clang 4.0.1, target i686-pc-windows-msvc build), `pi32v2-ld.exe`
  (GNU ld 2.26.51.20160621), `llvm-nm.exe` and `llvm-objcopy.exe` (LLVM 4.0.1), and accepts
  Unix absolute paths as arguments (resolved through the `Z:` drive), so no path shim is
  needed. Option (b) chosen: `tools/linux/build.py` is a faithful Python port of
  `sdk/Build.ps1`; `tools/linux/package.py` ports `sdk/Package.cs`. Build time 12.6 s.
  Every Test-Firmware check passes; outputs in `build/pro/` (log: `build/track-a.log`).
  A second build in the same directory is bit-identical (sdk.elf e697dd67…, .fwsc b5bb4026…).
  The Track A ELF is also byte-identical to the native Linux toolchain build (Track B
  preview), which makes the A/B comparison in Step 5 trivial.
- Step 4 (**done**): official V01 Pro release fetched from open.m-vave.com (metadata,
  `.fwsc`, simulator, official source kit). Building the official source kit tree with
  Track A (`build.py --source-root <kit>`) reproduces the official package
  `SMK37_PRO_OPEN.fwsc` **byte for byte** (SHA-256 09fc9346…, 492084 bytes, build_id
  4c9e0084…). A build of the fork in a second, different directory gives a byte-identical
  `.fwsc` and `app-image.bin`; only the ELF symbol-table strings differ (section 5).
- Step 5 (**done, Checkpoint C**): JieLi Linux toolchain 20260730.1 downloaded, extracted
  and pinned in `tools/linux/toolchain-linux.json` (24 files). Used in place from
  `~/Documents/Classic Tabby/toolchains/` (not `/opt/jieli`, which would need sudo). Track B
  build: 4.0 s, every Test-Firmware check passes, and `sdk.elf`, `app-image.bin` and the
  `.fwsc` are **byte-identical to Track A** (section 5a). Track B is therefore the default
  `make firmware` target; Track A stays as `make firmware-ref` (output in `build/ref/`) and
  `make crosscheck` builds both and compares SHA-256.
- Step 6 (**done**): `tools/linux/build-web.py` ports `tools/Build-Web.ps1`; with the
  pinned Linux WASI SDK 27 (`FM1_WASI_SDK`, SHA-256 below) it builds
  `build/web/simulator.wasm` in 10 s and `build/preview/index.html` (1031406 bytes).
  The wasm is **byte-identical to the official V01 simulator** (b8b4a463…, 315420
  bytes). The preview loads in Google Chrome 156 (headless check: no console errors, the
  loading placeholder is hidden, the simulator generated 149 LCD targets and shows
  "Eight-track overview 01" with status "Browser preview · no device"; also opened in the
  desktop Chrome). `tests/simulator-wasm-smoke.mjs` run by `/usr/bin/node` (v22.23.3)
  boots the same wasm, presses key 12 and sees Note On 60 / Note Off 60 on MIDI channel 1
  on all three ports (section 5b).

### Left to build

- Package equivalence proof (`package.py` vs `sdk/Package.cs` through `pwsh`); deferred:
  PowerShell 7 is not installable from Microsoft's apt repository on Ubuntu 26.04 yet (the
  repo config .deb exists but carries no `powershell` package for this release). See
  "PowerShell without the apt repo" below. The Python packager is validated meanwhile by
  reproducing the official package byte for byte (Step 4), which exercises every code path
  of Package.cs on the real image.
- (nothing of the original port; Steps 1-7 complete)
- Deferred from Task 06 (2026-11-04): following external MIDI clock in song mode (song mode
  runs from the internal clock only, decision 4 of Task 03); CC automation inside a row
  (importing Renoise automation that does not fall at a row start; row events fire at row
  entry only).
- **Lint findings of Task 07, read and closed (2026-11-04, linux-build fe334c7).** None is a
  bug; nothing was changed. The verdicts, one per line, line numbers as of 8114114:
  - clang-tidy `app/song_storage.c:263` "out of bound access to `sectors`": **false positive**.
    `b = target - SONG_FIRST_BLOCK_SECTOR` is reached only when `block` is set, and `block` is
    the same `le32(image) == SONG_MAGIC_BLOCKS` test under which `staged_target()` returned
    `target` only if `SONG_FIRST_BLOCK_SECTOR <= target < SONG_REGION_SECTORS`, so `b` is 0..95
    for the 96-entry table; the analyzer cannot relate the two reads of the same four bytes
    (the memset in between touches image+4092 only) and pairs the record branch's target
    (1..16) with the block branch.
  - clang-tidy `app/song_storage.c:595` "out of bound access to `sectors`": **harmless**.
    `song_storage_compact_sector(b)` is exported without a range check and the analyzer
    reports it for an unbounded `b`; its only callers are the compaction poll (`position <
    SONG_BLOCK_SECTORS` by the loop above the call) and `song_block_append` (`best` from a loop
    over 0..95), and nothing outside app/song_storage.c calls it.
  - cppcheck `app/project.c:750` uninitialized `c->magic`: **false positive**. In
    `session_settings_load` the struct is read by `session_settings_valid(&c)` only when `r` is
    0 (short circuit), and `r` is 0 only after `fm1_flash_read` filled it.
  - cppcheck `app/screen.c:107` arrayIndexOutOfBoundsCond: **false positive** (section 9.3c): the
    offset is chosen per character range, the index is 0..31 for the 32-row table.
  - target clang `app/board/scan.c:369` unused `adc_con`: **harmless**, an unused static in the
    upstream board file; optional clean-up under the identical-output gate.
  - target clang `app/screen.c:1481` and `:2225` missing field `state` initializer: **harmless**,
    the `= {0}` idiom; the compiler zero-fills the remaining fields.
  - clang-tidy `memcmp` without an explicit comparison, `app/project.c:132`, `:416`, `:515`,
    `app/song_storage.c:188`, `:200`: **harmless**, the C idiom `if (memcmp(...))` for "differs";
    every use means exactly that (an all-zero MIDI config, a changed tuning entry, a read-back
    mismatch, a verify mismatch, a staged image comparison).
  - clang-tidy `memcpy` result not null-terminated, `app/project.c:822`: **false positive**, the
    project name is a 12-byte space-padded field with no terminator by definition
    (app/instrument.h); `app/screen.c:2175` and `:2187`: **false positive**, the `memcpy` writes
    a prefix and the `strcpy` or `decimal()` that follows writes the terminator before the
    buffer is read.
  - clang-tidy signed char to int, `app/screen.c:2347` and `:2359`: **false positive**, the
    per-pad octave is an `int8_t` that holds negative octaves on purpose; sign extension is
    the intent.
  - clang-tidy decrement inside a condition, `app/board/audio.c:79`: **harmless**,
    `if (mute_depth && --mute_depth == 0)` is the guarded decrement of the mute depth; the
    short circuit keeps it from going below zero.
- **Warning clean-up** (optional, separate work; gate: sdk.elf, .fwsc and app-image.bin
  identical before and after): the three target-clang lines above, and outside app/ the 8
  misleading-indentation lines in third_party/synth (bass303.c:28, drum808.c:48, 83, 266,
  dsp_math.h:26, 28, 50, pluck.c:74) and 3 array-parameter mismatches in web/synth/dx7synth.c
  (117, 401, 406). Line numbers as of linux-build 8114114.
- **ACTIONS and hint texts** (found while writing the manual, BUILD.md 22.1; a firmware
  change with the usual suite, not in tabby-v03.1): app/screen.c `destructive` and the
  confirmation prompt still name action 20 (ERASE before Task 06 (a); COMPACT SONG STORAGE
  now), so ERASE OLD SAMPLE/DX7 (18) runs on the first SAVE without "ERASE OLD FLASH DATA?"
  and the compaction asks it instead: change both indexes 20 → 18 and add a host check. The
  SONG page's "K1 SONG" hint names the wrong knob (SELECT / PRESETS select the song); the
  SOUND SOURCE page's "K1 / PADS 1-6 CHOOSE" should say 1-5, and the overview's PAGE / K2
  path into it wraps with GROOVE_SOURCES (6) instead of SOURCE_CHOICES (5).
- **Task 09 hardware items** (BUILD.md 23.5 step 19): after the checklist, correct the
  definitions with the Zoom's PC base, the Royalist's own CC list (replacing the SYN-20IR map),
  the SMK-37 jack's TRS type and whether the NightSky latched channel 14 over DIN; then
  `make midi-guide` and a release.
- **Cross-project (Orange Cat firmware, not Classic Tabby):** a per-track MIDI input channel with
  OFF, as Skiff 2.2's T1–T6 CHANNEL, so an Orange Cat FM-1 can take one channel without an
  H4MIDI WC port filter (today ROUT routes a block of four channels or every channel; Task 09
  Step 1 assessment section 3). Until then the Wrong Room profile filters the unit's port.
- **Safe resume for a loader with a stale build tag** (Task 11B, 25.3a/b; not built). Today the
  page accepts only `ota-SMK37<its own build[0:16]>` and refuses any other tagged loader with
  "does not match this model". The page should:
  - read the tag, name the build the loader is waiting for (match it against the builds it knows:
    its own, the release list, the user's local files), and offer that image;
  - or require an explicit confirm, with the model checked, before writing another image to it.
  - Never accept silently. Also find out why the loader kept the previous update's tag when the
    page armed a new one with command 50 (the cause of the 2026-11-08 16:50 timeout).
  - Learned on 2026-11-08 (25.5): the loader kept the diag-r2 tag across a failed install (the
    published diag page armed its own build with command 50; the loader still reported
    `ota-SMK378b7dff801f1b0876` afterwards), and the published page then waited for its own
    tag after the reboot and timed out ("Timed out waiting for reconnection") instead of naming
    the tag it saw. The waiting page must report the tag it sees and stop, not wait it out. A
    power cycle (on the Mac) left the loader and booted the image already in flash (diag-r2).
- **The all-zero loader tag** (2026-11-09; 26.8). Built in source, ships with the next release:
  the zero tag resumes after the model confirmation, and a query timeout never leads to force
  flash. Left: send command 50 on the forced (legacy) path when the identity is Open, so a
  forced write still names its build; and revisit 25.5's reading of the 11B tag (the SDK writes
  the tag only from command 50, so the diag-r2 tag came from a command 50 that carried 8b7dff…).
- **Metronome and count-in** (Task 12 A2 removed CLICK and COUNT IN with the step editor; not built).
  They come back in Phase 5 under SPEC 14 decision 7: an internal 808 click that can be turned off,
  and a MIDI-note click to a chosen channel and note, selectable.
- **NUC USB link to the SMK-37** (Task 11C, 25.5; not understood). No flashing from the NUC until
  the read-only link test in 25.5 explains the 125 MB loop and `urb status -115`.
- **Sanitizer fixes**: none needed; `make host-sanitize` is green (0 findings, leaks included)
  at linux-build 8114114. Keep it green: it is part of `make suite`.

- **Firmware screen texts that are stale** (Task 14, 28.3): the overview knob labels (STEP, NOTE), the
  pad-step lines, ERASE OLD SAMPLE DATA. Text only; check reachability first.

### Left to test

- First flash of the Track B package on the SMK-37 Pro through the workbench (the user
  does this; see section 8 for the device question first).
- **pwsh packaging equivalence** (`make package-equivalence`: `tools/linux/package-pwsh.ps1`
  drives the original sdk/Package.cs via Add-Type on `build/pro/generated/app-image.bin`,
  compared byte for byte with `tools/linux/package.py`). Skipped until PowerShell 7 is
  available on this host.


## 2. Host packages (Ubuntu 26.04.1 LTS "resolute", kernel 7.0.0-42-generic)

| Package | Version | Source | State |
| --- | --- | --- | --- |
| git | 1:2.53.0-1ubuntu1.1 | Ubuntu | installed |
| build-essential | 12.12ubuntu2.26.04.2 (gcc 15.2.0) | Ubuntu | installed |
| python3 | 3.14.3-0ubuntu2 | Ubuntu | installed |
| nodejs (Node LTS) | 22.23.3-1nodesource1 (`/usr/bin/node`, v22.23.3) | nodesource repo (pre-existing) | installed; Homebrew node 25.6.1 shadows it in PATH, so the Makefile calls `/usr/bin/node` explicitly (`NODE=`) |
| powershell | — | Microsoft apt repo | **not available for Ubuntu 26.04** (repo config exists, no package); see below |
| wine64, wine32:i386, libwine | 10.0~repack-12ubuntu1 | Ubuntu | installed; prefix `~/.wine-jieli` |
| innoextract | 1.9-3 (apt); Homebrew 1.9_14 also present and first in PATH | Ubuntu / Homebrew | installed |
| p7zip-full (7zip) | 26.00+dfsg-1 | Ubuntu | installed; not needed (innoextract handles 2.5.3.exe) |
| alsa-utils | 1.2.15.2-1ubuntu1 | Ubuntu | installed |
| google-chrome-stable | 156.0.8078.73-1 | Google apt repo (pre-existing) | installed (not snap) |
| usbutils (lsusb) | 1:019-1 | Ubuntu | installed |

Install everything missing with:

```sh
sudo bash tools/linux/install-host-packages.sh
```

The PowerShell step is optional since script v0.2: a failure prints a warning and the
script continues with Wine and Chrome.

**PowerShell without the apt repo (not done yet).** Microsoft publishes a self-contained
build per release on GitHub: `https://github.com/PowerShell/PowerShell/releases` →
`powershell-<version>-linux-x64.tar.gz` (plus a `.sha256` file to verify). Install is:

```sh
sudo mkdir -p /opt/microsoft/powershell/7
sudo tar -xzf powershell-<version>-linux-x64.tar.gz -C /opt/microsoft/powershell/7
sudo chmod +x /opt/microsoft/powershell/7/pwsh
sudo ln -s /opt/microsoft/powershell/7/pwsh /usr/bin/pwsh
```

It needs only libicu (already present on Ubuntu desktop) and runs Add-Type (Roslyn)
normally, which is all `package-pwsh.ps1` requires. Record the version and SHA-256 here
when it is installed.

## 3. Toolchains and downloads

All archives live outside the repository in `~/Documents/Classic Tabby/toolchains/`.

| Item | URL | SHA-256 | Size |
| --- | --- | --- | --- |
| JieLi Windows toolchain 2.5.3 installer (Inno Setup 5.5.7) | https://jl-update.oss-cn-shenzhen.aliyuncs.com/2.5.3.exe | 399bd518a28e47a7a0394506cebd5bf658748a58cd6b7c02512e24b4b88c5a5e | 52860672 |
| JieLi Linux toolchain 20260730.1 | https://pkgman.jieliapp.com/s/linux-toolchain → jieli-linux-toolchains-20260730.1.tar.xz | a1545cddbc451a06bac43eb5cd96d831470c42a97c5c0b1f98879a20fc7647bd | 26027508 |
| WASI SDK 27 (Linux x86_64) | https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-27/wasi-sdk-27.0-x86_64-linux.tar.gz | b7d4d944c88503e4f21d84af07ac293e3440b1b6210bfd7fe78e0afd92c23bc2 | 124790235 |

Layout after extraction:

- `toolchains/jieli-2.5.3/C$/JL/pi32` — the `pi32` directory with `bin/clang.exe`
  (`innoextract --extract --output-dir toolchains/jieli-2.5.3 2.5.3.exe`). All 22
  `external_toolchain` hashes from `sdk/manifest.json` match. clang.exe, pi32v2-ld.exe,
  llvm-nm.exe, llvm-objcopy.exe and LLVMgold.dll are PE32 (i386), so Wine needs 32-bit
  support.
- `toolchains/jieli-linux/jieli-linux-toolchains-20260730.1` — JieLi documents extracting it
  to `/opt/jieli` so that `/opt/jieli/common/bin/clang` exists. Pinned in
  `tools/linux/toolchain-linux.json` (generated by `tools/linux/pin-toolchain.py`):
  clang 4.0.1 (`common/bin/clang`, c45189ee…), `LLVMgold.so` (2ca8dafd…),
  `pi32v2/bin/ld` = GNU ld 2.26.51.20160621 with elf32-pi32v2 target (fd61aff1…),
  `pi32v2/bin/nm` = GNU nm 2.26.51 (32bee027…), `common/bin/objcopy` = LLVM 4.0.1 objcopy
  (29515122…), plus the 16 clang resource headers. The headers are the Windows ones with
  LF instead of CRLF line endings (identical after stripping `\r`).
- `toolchains/wasi-sdk-27.0-x86_64-linux` — clang 20.1.8-wasi-sdk, `share/wasi-sysroot`.

## 4. Commands

From the repository root (`~/Documents/Classic Tabby/firmware`). The Makefile (v0.1) wraps
the commands below; every path variable can be overridden on the command line
(`make firmware JIELI_LINUX=/opt/jieli`):

```sh
make verify           # manifest / synth.json / toolchain pin checks, both tracks
make firmware         # default: Track B (native) -> build/pro/
make firmware-ref     # Track A (Wine)            -> build/ref/pro/
make crosscheck       # both, then compare SHA-256 of sdk.elf, .fwsc, app-image.bin
make web              # build/web/simulator.wasm + build/preview/index.html (Linux WASI SDK 27)
make web-smoke        # /usr/bin/node tests/simulator-wasm-smoke.mjs build/web/simulator.wasm
make host-smoke       # gcc build of app + simulator sources with FM1_HOST_TEST, runs tests/host/smoke.c
make test             # host-smoke + web-smoke
make flash-budget     # build/pro/flash-budget.md (read only)
make package          # Task 02: firmware + build/official-web/pro/SMK37-Open-Source.html (FM1_SOURCE_URL = archive of TAG)
make hosted           # static site from it with tools/Build-Hosted.cjs -> build/hosted/pro/
make release-assets   # build/release/<TAG>/: .fwsc, offline HTML, SHA256SUMS.txt
make publish          # package + hosted + commit/push the site to gh-pages (HEAD must carry TAG)
make release          # gh release create TAG with docs/releases/<TAG>.md and the release assets
make clean
# Task 07 (Makefile v0.10, docs/DEV_CHECKS.md): the checks between builds, all opt-in
make check            # the 16 app units through the native JieLi clang, -fsyntax-only, no link (2 s)
make lint             # host gcc -Wall -Wextra per file, then the target clang -Wall -Wextra; counts by file
make lint LINT="--cppcheck --tidy"   # plus the analyzers over build/check/pro/compile_commands.host.json
make test-fast        # while working: timed-note-test, host-smoke, web-smoke, workbench-test, midi-import-test
make host-sanitize    # the host tests under ASan+UBSan in build/host-san/ (through the lock)
make suite            # before a flash or a release: crosscheck, test, midi-import-sim, host-sanitize (through the lock)
make profile          # build/profile.txt: one timing line per command of every target
```

**The standing rules (Task 07, 2026-11-04; the detail is docs/DEV_CHECKS.md):**

1. `make check` and `make lint` before any firmware build.
2. `make test-fast` while working: the affected tests, no sanitizers, no lock.
3. `make suite` green (the full suite plus `host-sanitize`) before any flash or release build.
4. Every full run through Classic Tabby's machine lock. `make suite`, `make crosscheck`,
   `make firmware-ref` and `make host-sanitize` take it themselves
   (`flock /tmp/tabby-suite.lock systemd-run --user --scope -p MemoryMax=4G -- ...`, not Orange
   Cat's /tmp/oc-suite.lock); `make firmware`, `make web`, `make check`, `make lint`, `make test`
   and `make test-fast` run under `nice -n 19` without it. At most 2 compiles at once. No
   background wait loops.

The underlying commands:

```sh
# Input checks only (SDK manifest, synth.json, toolchain pins)
python3 tools/linux/build.py --verify-only --toolchain-kind wine \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-2.5.3/C\$/JL/pi32"

# Track A: reference build, Windows toolchain under Wine (= sdk\Build.ps1 -Model pro -FirmwareOnly)
python3 tools/linux/build.py --model pro --firmware-only --toolchain-kind wine \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-2.5.3/C\$/JL/pi32" \
    --wine-prefix ~/.wine-jieli

# Track B: native Linux toolchain, pinned by tools/linux/toolchain-linux.json
python3 tools/linux/build.py --model pro --firmware-only --toolchain-kind native \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-linux/jieli-linux-toolchains-20260730.1"

# Step 6: web workbench local preview (= tools\Build-Web.ps1 -LocalPreview)
FM1_WASI_SDK="$HOME/Documents/Classic Tabby/toolchains/wasi-sdk-27.0-x86_64-linux" \
    python3 tools/linux/build-web.py --local-preview
google-chrome "file://$PWD/build/preview/index.html"

# Step 4: build another checkout (here: the official source kit, copied to a scratch dir)
# with this script and its own build directory. build.py v0.2.
python3 tools/linux/build.py --model pro --firmware-only --toolchain-kind wine \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-2.5.3/C\$/JL/pi32" \
    --wine-prefix ~/.wine-jieli --source-root /path/to/kit-copy --build-root /path/to/kit-build
```

Outputs: `build/pro/sdk.elf`, `sdk.map`, `firmware-report.json`, `package-report.json`,
`build-identity.json`, `compile_commands.json`, `link-arguments.json`,
`generated/SMK37_PRO_OPEN.fwsc` and `generated/app-image.bin` (raw image kept for the
package equivalence test).

## 5. Official V01 release (for Step 4)

Fetched 2026-11-01 from https://open.m-vave.com/smk37-workbench (static selector page
linking `releases/smk37/V01-fa2b726-07f2269d67d5/`). Saved under
`~/Documents/Classic Tabby/official-release/`.

| Field | Value |
| --- | --- |
| product / release | SMK-37 Pro_8000001 / V01, family 8 |
| build_id | 4c9e008431b7489f4595879e0885bb5cc0faa25b5e2909f7f3e19a0877370977 |
| package sha256 | 09fc934630d9a3565966f533abeda6330abc4b6ed6801d746753383946cbb44b |
| package bytes | 492084 |
| loader (ota.bin) sha256 | ef1f2db89b011fa53e71df363f0122de0ea896618c53fb53e8da676322004541 (matches sdk/tools/pack/ota.bin) |
| stock V16 sha256 / bytes | 2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0 / 705252 |
| simulator wasm sha256 / bytes / source_sha256 | b8b4a463e3149f9ea46e8e460a211e391a9a14c668221903a8f510d3aca98743 / 315420 / 0f8ffc3a51a5b7477914296111f8a90db9be9a9721a1057ef61047a8df8a766a |
| source kit | SMK37-Open-V01-Development-Kit-07f2269d67d5.zip, sha256 07f2269d67d5c4a5b130af72f4b7bc5308aa6fc7d7a75442618364f8107a4c3c |

Checkpoint A result: Track A `.fwsc` is 492084 bytes (same as official), SHA-256
b5bb4026b9c8f501cf97c6f7eea36925bb9220100295cfe06fe34b1d4f294afa, `cmp -l` against the
official package reports 46 differing bytes (the 32-byte `fm1_build_id` plus the CRC /
cipher bytes that depend on it).

### Step 4 result: official package reproduced

The official source kit (zip above, extracted to a scratch copy) built with Track A and
`build.py --source-root` gives:

| Output | Value |
| --- | --- |
| `generated/SMK37_PRO_OPEN.fwsc` | SHA-256 **09fc934630d9a3565966f533abeda6330abc4b6ed6801d746753383946cbb44b**, 492084 bytes — `cmp` against the official package: identical |
| `build-identity.json` | build_id 4c9e0084… (ordinal sort) — identical to the official metadata |
| `sdk.elf` | 6e5edc68e6222d64f6a71433ff20524367367dab981b1f1eeb5ddc9d9eb52c43 (loaded sections identical to the fork's build; only the identity bytes and the symbol-table path strings differ) |

So the whole Linux chain (Wine + JieLi 2.5.3 clang/ld, the Build.ps1 port and the
Package.cs port) is proven against M-VAVE's own release: the bytes they ship are the bytes
this chain produces.

**Why our fork's build_id differs from the official one, and only for that reason.** The
fork keeps the GitHub tree, where `.gitattributes` normalizes all SDK files to LF. The
official kit carries CRLF in `app/fm_factory.c` and `app/fm_library.c`. The build identity
hashes the raw bytes of every file under `app/`, so the fork's identity is
e3344029ab696c7395093fdddc5c3f949bbd47d8b605a78e6f691af664e0d12e instead of 4c9e0084….
The compiled code is identical (the ELF's `.text`, `.ram0_data` and every other loaded
section match byte for byte between the kit build and the fork build); only the 32
`fm1_build_id` bytes in the image and the package CRC/cipher bytes that depend on them
differ (46 bytes of 492084). The fork deliberately keeps LF.

### Step 4 result: determinism in a second directory

A fresh `git clone` of the fork in a different directory
(`/tmp/claude-1000/…/scratchpad/det-clone`) built with the same Track A command:

| Output | Result |
| --- | --- |
| `generated/SMK37_PRO_OPEN.fwsc` | byte-identical (b5bb4026…) |
| `generated/app-image.bin` | byte-identical |
| `build-identity.json`, `package-report.json`, `link-arguments.json` | identical |
| `sdk.elf` | differs only in `.strtab` / `.symtab`: the five `-fno-lto` objects (screen.c, transfer.c, midi_router.c, panel.c, scan.c) carry a `FILE` symbol with the absolute source path; `.text`, `.ram0_data`, `.boot_info`, `.cache_ram_data` and `.shstrtab` are identical |
| `sdk.map`, `compile_commands.json` | differ in paths only (the map also names the random `lto-llvm-xxxxxx.o` temp object) |

Source of the ELF nondeterminism: the compiler is given absolute source paths, exactly as
`sdk/Build.ps1` does on Windows (`C:\…\app\screen.c` in the official build). The
flashed image does not contain them. This is accepted as-is; the deterministic artefact is
the package, and `firmware-report.json` reports the ELF hash for information only.

Build identity finding: the identity is SHA-256 over `pro`, the manifest hash, and
`path:sha256` of every file under `app/` (sorted). From the GitHub checkout it comes out as
e3344029ab696c7395093fdddc5c3f949bbd47d8b605a78e6f691af664e0d12e, which does not match.
From the official source kit it comes out as 4c9e0084… — an exact match, with ordinal sort
order. The kit differs from GitHub only in line endings: `app/fm_factory.c` and
`app/fm_library.c` (and several web/third_party files) carry CRLF in the kit and LF in git
(`.gitattributes` normalizes to LF). The compiled code is unaffected; only the 32
`fm1_build_id` bytes in the image (and the package CRCs) differ. A byte-identical
reproduction of the official package therefore needs the kit's CRLF versions of those two
files; the GitHub tree gives the same machine code with a different identity.

### 5a. Checkpoint C: Track B toolchain and the A/B comparison

JieLi Linux toolchain `jieli-linux-toolchains-20260730.1` (archive SHA-256 a1545cdd…):

| Tool | Path in the archive | Version |
| --- | --- | --- |
| clang | `common/bin/clang` (symlinked from `pi32v2/bin/clang`) | clang 4.0.1, host x86_64-linux; accepts `-target pi32v2 -mcpu=r3` (same PI32v2 clang 4.0.1 r3 target as the Windows 2.5.3 build) |
| ld | `pi32v2/bin/ld` | GNU ld 2.26.51.20160621, targets elf32-pi32v2 / elf32-pi32v2fdpic (= pi32v2-ld.exe) |
| LTO plugin | `common/bin/LLVMgold.so` | LLVM 4.0.1 gold plugin (= LLVMgold.dll) |
| nm | `pi32v2/bin/nm` | GNU nm 2.26.51 (Track A uses llvm-nm 4.0.1; same symbol output for the checks) |
| objcopy | `common/bin/objcopy` | LLVM objcopy 4.0.1 (= llvm-objcopy.exe) |

File limit: JieLi's README asks for `ulimit -n 8192` or more for linking; build.py raises
`RLIMIT_NOFILE` itself for native builds (the host default here is 524288 anyway).

Comparison, same source, same flags (`make crosscheck`):

| Output | Track A (Wine, reference) | Track B (native) |
| --- | --- | --- |
| `sdk.elf` | e697dd67a0e1bac86bc2256675bfe7c184f1a30853dd75a2c8fb8f8e07b6f697 | identical |
| `generated/SMK37_PRO_OPEN.fwsc` | b5bb4026b9c8f501cf97c6f7eea36925bb9220100295cfe06fe34b1d4f294afa | identical |
| `generated/app-image.bin` | 5a1a46825af608e352f30bd8ddba9c2c3d3bb09f3ef463d95fbbb44261af7301 | identical |
| section sizes / symbol placement / Test-Firmware | .text 377920, .ram0_data 75940, .ram0_bss 191356, .boot_info 52, .cache_ram_data 32; all checks pass | identical (same ELF) |
| build time | 12.6 s | 4.0 s |

The two toolchains are the same LLVM 4.0.1 / binutils 2.26.51 sources built for Windows
and Linux, so byte identity is plausible and was confirmed. Track B is the default
`make firmware`; Track A remains the reference and `make crosscheck` re-verifies identity
after any change to the build script or toolchain pins.

### 5b. Step 6: web workbench preview and the official simulator

| Output | Value |
| --- | --- |
| `build/web/simulator.wasm` | SHA-256 **b8b4a463e3149f9ea46e8e460a211e391a9a14c668221903a8f510d3aca98743**, 315420 bytes: identical to the official V01 simulator (`official-metadata.json` and the extracted `simulator-official.wasm`) |
| simulator `source_sha256` (fork, LF) | 78bda82981a96b36bb5de10a2c4febe6ffc5308e21fa827ebf10fef8e7589d9a |
| simulator `source_sha256` (official kit) | 0f8ffc3a51a5b7477914296111f8a90db9be9a9721a1057ef61047a8df8a766a — reproduced from the kit tree; the difference to the fork is CRLF in 10 of the 84 hashed inputs (`app/fm_factory.c`, `app/fm_library.c`, `third_party/synth/pluck.c`, `third_party/synth/voices.h`, `web/engine/sound.c`, `web/synth/adsr.c`, …), the same cause as the firmware build_id |
| `build/preview/index.html` | 1031406 bytes; source link replaced by "(local preview)" as upstream does |
| Chrome 156 headless (`--dump-dom`, 8 s virtual time) | no console errors; `#sim-placeholder` hidden; 149 `.lcd-target` elements generated by the simulator; `.sim-details` = "Eight-track overview 01"; `.device-status` = "Browser preview · no device" |
| Node 22.23.3 (`/usr/bin/node`) smoke | `_initialize`, `sim_boot(1)`, key 12 pressed: Note On 60 velocity 100 on channel 1, ports 0-2; release: Note Off 60; render output finite |

The Linux WASI SDK produces the same wasm as the Windows one (both clang 20.1.8-wasi-sdk
with the same sysroot), so the browser workbench is reproducible on Linux byte for byte.
Node is not needed to build the preview; upstream uses it only in `tools/Build-Hosted.cjs`
(static-site packaging of a distribution build, not part of Task 01).

### 5c. Step 7: host tests

`make host-smoke` compiles exactly the simulator's source set (every `.c` under `app/`,
`web/` and `third_party/synth/` except `app/board/`, with `-DFM1_HOST_TEST -DFM1_OPEN_WEB`
and the same include order as Build-Web.ps1 L82) with the host compiler (`CC`, default
gcc; clang works when installed) and links `tests/host/smoke.c` against it. `-Werror` is
not used in the host build because gcc rejects clang's `minsize` attribute and warns about
indentation in third_party; both are warnings only and the wasm build keeps `-Werror`.

The harness drives `web/engine/Simulator.c`'s `sim_*` entry points, the same ones the
browser calls, so the app code under test (`smk37_controls.c`, `midi_router.c`,
`project.c`, `screen.c`, …) runs unchanged. Checks (21, all pass):

| Area | Check |
| --- | --- |
| builds | 33 units + harness compile and link natively (7 s) |
| initializes | `sim_boot(1)`; panel snapshot readable; 128-frame blocks; LCD target table; keyboard track 0 on channel 1; destinations = ports 0-2; KEY OUT on |
| keyboard note | key 12 velocity 100 → `90 3C 64` on ports 0, 1, 2; nothing on another channel; release → `80 3C 00` |
| expected channel | `sim_midi_edit(0, 1, +2)` moves track 0 to channel 3; the firmware first sends its controller reset on channel 1 (`B0 78 00` all sound off, sustain/mod/bend/pressure neutral, stop); then key 12 → `92 3C 64` / `82 3C 00` |
| audio | one rendered block, all values finite |

Finding worth knowing for Phase 1: a MIDI settings change resets the previous channel
and releases held notes on the next 10 ms poll. The test waits for that, as a player would.

## 6. Flash / RAM baseline (Track A and Track B, identical)

From `build/pro/firmware-report.json` and `package-report.json` of the Track A build
(identical to the native-toolchain build):

| Quantity | Value |
| --- | --- |
| app image (.text 377920 + .ram0_data 75940 + .cache_ram_data 32) | 453892 bytes |
| hard app limit from Package.cs (0xff000 − USER − BTIF − min VM − area − header − cfg − 64) | 453921 bytes (margin 29 bytes) |
| FLASH_BIN_SIZE / VM_START | 471040 (0x73000) |
| VM region | 471040–503808 = 32768 bytes (exactly the 32768 minimum; vm_extra_gap 0) |
| BTIF | 503808–507904 (4096) |
| USER region | 507904–1044480 (536576 bytes, untouched by the package) |
| runtime heap (_MALLOC_SIZE) | 256268 bytes (minimum 49152) |
| internal SRAM 0x01c00000–0x01c80000 | sections 267348 bytes (.ram0_data 75940 + .ram0_bss 191356 + .boot_info 52); heap 256268 bytes follows the bss up to _HEAP_END; 524288 − 267348 = 256940 bytes not statically allocated, of which the heap takes 256268 |

The V01 image sits at the very top of the flash layout: one more 4 KiB page of code would
fail `Insufficient FM1 settings space` in Package.cs. This is the single most important
constraint for Phase 1 work. The per-input breakdown, savings estimates and the USER-region
layout are in [FLASH-BUDGET.md](FLASH-BUDGET.md) (generated tables:
`tools/linux/flash-budget.py`).

## 8. Hardware readiness (Step 8, read only, 2026-11-01)

Commands run: `lsusb`, `amidi -l`, `aconnect -l`, `cat /proc/asound/cards`, and reads of
`/sys/bus/usb/devices/1-1/*`. No MIDI message (not even an identity request) was sent, and
nothing was written to any device.

| Item | Result |
| --- | --- |
| USB devices (besides hubs) | 046d:c52b Logitech Unifying Receiver; 2321:0022 iConnectivity AUDIO4c; 8087:0a2b Intel Bluetooth; **1209:0001 "Generic pid.codes Test PID"** (bus 1, device 37, full speed, bus-powered 100 mA) |
| 1209:0001 descriptors | manufacturer "Orange Cat", product **"Orange Cat FM-1"**, no serial, bcdDevice 3.30, 5 interfaces: Audio Control, MIDI Streaming, Audio Control, 2 × Audio Streaming; all bound to `snd-usb-audio` |
| ALSA card | card 1 `FM1` "Orange Cat FM-1" (USB-Audio); `amidi -l`: `hw:1,0,0` "Orange Cat FM-1 MIDI 1" (IO); `aconnect -l`: client 20 "Orange Cat FM-1", port 0 |
| other MIDI | AUDIO4c client 24 with DIN, USB2, HST1-8 ports; PipeWire sequencer clients 142/143 |
| device permissions | `/dev/snd/seq` and `/dev/snd/midiC1D0` are `root:audio 0660` with a logind ACL `user:userzero:rw-` (seat session), so Chrome can open them without group membership changes; `/dev/bus/usb/001/037` is `root:root 0664` (not needed) |
| udev rule | **not needed.** The workbench uses WebMIDI (`navigator.requestMIDIAccess({sysex:true})` in `sdk/Update.html.in`), which Chrome on Linux serves through the ALSA sequencer, not WebUSB/WebHID. Chrome will show its own per-site SysEx permission prompt. Nothing was added under `/etc/udev/rules.d/` |
| firmware version | **not visible from descriptors as an M-VAVE version.** The only candidate device identifies itself as "Orange Cat FM-1" with USB VID/PID 1209:0001 (pid.codes test ID) and bcdDevice 3.30. The stock V16 and the Open V01 images carry the strings "M-VAVE" and "SMK-37 Pro_8000001" (found in `build/pro/generated/app-image.bin`); no such strings exist in the enumerated device. Either the SMK-37 Pro currently runs the Orange Cat firmware (the user's other project), or the plugged-in unit is the Orange Cat FM-1 and the SMK-37 Pro is not connected. Reading the version through the workbench would require sending SysEx to the device, which Step 8 forbids, so this is left as an open question for the user |

## 7. Windows-specific items found in the upstream build and how they are handled

| Item | Where | Handling |
| --- | --- | --- |
| PowerShell 5.1 host (`powershell` in build.bat) | build.bat, sdk/Build.ps1, tools/Build-Web.ps1 | Build.ps1 ported to `tools/linux/build.py` (including `-Package` since v0.3); Build-Web.ps1 ported to `tools/linux/build-web.py`; top-level Makefile replaces build.bat |
| `/opt/jieli` install location and `ulimit -n` | JieLi Linux toolchain README | used in place from the toolchains folder (`--toolchain`), RLIMIT_NOFILE raised by build.py |
| C# packager loaded with Add-Type | sdk/Package.cs | Ported to `tools/linux/package.py`; `tools/linux/package-pwsh.ps1` runs the original under pwsh for the equivalence test |
| `.exe` tool names and `LLVMgold.dll` plugin | Build.ps1 L36, L241, L307, L422, L436 | Track A keeps the names and runs them through Wine; Track B maps them in toolchain-linux.json |
| `StartsWith($sdk + '\')` manifest path check | Build.ps1 L342 | `os.sep` prefix check |
| `StartsWith($root + '\build\')` object directory guard | Build.ps1 L364 | `os.sep` prefix check, honouring `--build-root` |
| `app/synth` exclusion with `'\'` suffix | Build.ps1 L357 | `os.sep` prefix check |
| `Sort-Object FullName` (culture-sensitive) | Build.ps1 L357, L401 | ordinal sort; proven correct by reproducing the official build_id (`--identity-sort culture` kept for reference) |
| 22 Windows toolchain hashes | sdk/manifest.json, sdk/synth.json | Track A: enforced unchanged. Track B: replaced by `tools/linux/toolchain-linux.json`; every SDK file check and every synth.json check except the installed-compiler hash remains |
| `curl.exe`, `tar.exe`, Windows WASI SDK (`wasi-sdk-27.0-x86_64-windows.tar.gz`, `bin/clang.exe`) | Build-Web.ps1 L42-L62 | `tools/linux/build-web.py`: Linux archive pinned (b7d4d944…), `curl` / `tar` from the Ubuntu archive, `bin/clang`; set `FM1_WASI_SDK` to skip the download |
| .NET `LastWriteTimeUtc.Ticks` in the wasm cache stamp; `\\?\` long-path prefix | Build-Web.ps1 L64-L68 | size + mtime_ns stamp; no prefix needed |
| `[Net.WebUtility]::HtmlEncode` | Build-Web.ps1 L128, L141 | re-implemented with the same rules in build-web.py |
| `tools/Build-Hosted.cjs` run by Node | hosting step (HOSTING.md) | unchanged; run by `tools/linux/publish-pages.py` with `/usr/bin/node` v22.23.3 (section 9) |
| `ConvertTo-Json -Depth 4 -Compress` package metadata passed as a command-line argument | Build.ps1 L454-L458 | build.py writes the same compact JSON, same key order, to `build/<model>/web-package.json` and passes the path (1.6 MB of base64 would exceed a safe argv) |
| CRLF in the official kit's app files | official source zip | Documented in section 5; the fork keeps LF and therefore a different build_id; no change to app/ |
| Absolute source paths in the ELF symbol table | Build.ps1 L360-L370 (compile command) | Same behaviour on Linux; package unaffected (section 5, determinism) |

## 9. Publication (Task 02, 2026-11-02)

### 9.1 What is published

**Permanent build pages (Task 12 A5, 2026-11-08).** Every published build also has a page of its
own at `https://seattleuser0.github.io/classic-tabby/builds/<tag>/` that is never removed, and
`builds/index.json` lists every build (tag, build id, loader tag `ota-SMK37` + the first 16 hex
digits of the build id, page path, date, source archive, note); `builds/` itself is a readable
list. `make publish TAG=...` adds the new build by itself (publish-pages.py v0.4 calls
tools/linux/builds-index.py); the historic builds were imported once (26.5). Published so far:
tabby-v03.2, tabby-v03.3-diag, tabby-p0-probe64 (the same site as `probe64/`),
tabby-v03.3-diag-r2 (the resume page that was `/recover/`; `/recover/` now redirects there) and
tabby-v04.0 (also the site root).
The workbench reads the index when it meets an update loader waiting for another build (26.5).

Current release **tabby-v04.1** (2026-11-10, Task 13: option B, the panel wording, the safer update
page; at the site root and at `builds/tabby-v04.1/`):

| Item | Value |
| --- | --- |
| Branch and tag | `classic-tabby/linux-build` = c207d92; tag `tabby-v04.1` (annotated, 89ca0ee) → c207d92 |
| Build options | none (the normal build: USER 471040) |
| Firmware package `SMK37_PRO_OPEN.fwsc` | SHA-256 f6377d634ee3c69f35e182935fa1b4769a69afec364e3b041eedd5a9266fe1c9, 487988 bytes, build_id 013976a54777bb5fa25ae42738aac840e2016584245a663296f7aee396a03d27 (loader tag `ota-SMK37013976a54777bb5f`), app image 448420 (margin 71037); sdk.elf e11ca82c03a8e7a0fd796738f24ee3c26e25108d06a8b823df487366b30ce910, app-image.bin ead3d62447642dd6c0ae789346fb72097f0044820757fddb87277a151cdca97f; display version tabby-v04.1 |
| Offline workbench `SMK37-Open-Source.html` | SHA-256 b74e5b4b93189b35062323808b34add5876baf598fe3ba44f545d977c3705794, 3142557 bytes |
| Static site | https://seattleuser0.github.io/classic-tabby/ — `gh-pages` b0f765a ("Pages: tabby-v04.1 (build 013976a54777, release V01)"), `index.html` 337939 bytes (SHA-256 1caf0d8c6d87673dcb475db45bc07c9466b4bbea1da6ac98d630ffa8daf31dee); `builds/tabby-v04.1/`; builds/index.json 7 builds |
| Source archive | https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v04.1.zip (VERSION expands to `tabby-v04.1`) |
| GitHub release | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v04.1 (`SMK37_PRO_OPEN.fwsc`, `SMK37-Open-Source.html`, `SHA256SUMS.txt`; notes docs/releases/tabby-v04.1.md) |
| Install steps | 27.5 and `~/Documents/Classic Tabby/INSTALL-tabby-v04.1.txt` (normal update from tabby-v04.0, no backup or restore needed) |

Record of tabby-v04.0 (2026-11-08, Task 12 Phase 0: the storage move as the normal layout, at
`builds/tabby-v04.0/`); the earlier releases' values below stay as the record of their publications.

| Item | Value |
| --- | --- |
| Branch and tag | `classic-tabby/linux-build` = c55695a; tag `tabby-v04.0` (annotated, cf3a97d) → c55695a |
| Build options | none (the normal build: USER 471040, counters, block writes during play) |
| Firmware package `SMK37_PRO_OPEN.fwsc` | SHA-256 368c613022672f8918cb990cd886970edc771014afba2dd93a736577e29f24af, 487988 bytes, build_id b6e9590223446363dff53a2190bd80eb020233c63dd2d90cfa778e361ce0f708 (loader tag `ota-SMK37b6e9590223446363`), app image 447716 (margin 71741 to the 519457-byte limit), heap 198636; sdk.elf cb28814082ef177a465e1d1720e65c879f58e2e588b89cc79cc06948f6f9fdf4, app-image.bin 998a66f4bd943a32cce9ed5cdf89fa4c2290e3d3550af01270e8956bbb144260; display version tabby-v04.0 |
| Offline workbench `SMK37-Open-Source.html` | SHA-256 fe7d9604786551081b00e59d16f3fd16028c2e191b9ea5b5bb74774e426122e8, 3126358 bytes |
| Static site | https://seattleuser0.github.io/classic-tabby/ — `gh-pages` 010b553 ("Pages: tabby-v04.0 (build b6e959022344, release V01)"), `index.html` 335451 bytes (SHA-256 61a528aa3e1ec0809db91c3ec69d48935bd56469461f70ed711b1af41304b582), assets.json `"version": "tabby-v04.0"`, 9 assets under `assets/smk37/` (firmware = `368c6130….bin`); the same page at `builds/tabby-v04.0/`; `builds/index.json` lists 5 builds |
| Source archive | https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v04.0.zip (VERSION expands to `tabby-v04.0`) |
| GitHub release | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v04.0 (`SMK37_PRO_OPEN.fwsc`, `SMK37-Open-Source.html`, `SHA256SUMS.txt`; notes docs/releases/tabby-v04.0.md, first line "this release moves storage; back up first") |
| Install steps | 26.6 and `~/Documents/Classic Tabby/INSTALL-tabby-v04.0.txt` (full backup on `builds/tabby-v03.3-diag-r2/` first) |

Record of tabby-v03.3-diag (2026-11-07, Task 11: the diagnostic build) and the test pre-release
tabby-p0-probe64 (the site's `probe64/` directory):

| Item | tabby-v03.3-diag | tabby-p0-probe64 (pre-release) |
| --- | --- | --- |
| Tag | `tabby-v03.3-diag` (annotated, f661dd9) → a47a51b | `tabby-p0-probe64` (annotated, baca50b) → 0b0c41b |
| Build options | `DIAG=1` | `DIAG=1 USER_BYTES=471040` |
| `SMK37_PRO_OPEN.fwsc` | SHA-256 969a8f7ccfaac0aff4b345c64ede53a5a5b80d669b5c4e1a49aef42b329a5770, 492084 bytes, build_id 6ada221504309d10f544a5d9743791e385f60fe2e88b7bc6570b32d2060c78a1 | SHA-256 f99e461cbba7da398a974dbb8691bd3f10f026b22647a60789a7fc7dd150995c, build_id 2525715294cc33a7d14ec1285d6f8c7f1102e911aa395af8e1af625417dcc73c |
| App image, margin | 453284, 637 to 453921 | 453284, 66173 to 519457 |
| `SMK37-Open-Source.html` | SHA-256 4d9b9fde883a6282d51b25e2ada1f103e1ac1265cdbe62a9c43f3d039b8f4344, 3111456 bytes | SHA-256 fceb8a4557781976fac8fb3fbd2a6c7b4c382e454ddea8b8a8d80e1d825ef676, 3111520 bytes |
| Static site | https://seattleuser0.github.io/classic-tabby/ — `gh-pages` e0811fa, `index.html` 336380 bytes (SHA-256 b12e9d4ed3f02fc26e1bce5493d7fd1c9906e453ba0ae439719634c52aa46a16) | https://seattleuser0.github.io/classic-tabby/probe64/ — `gh-pages` 6b0b485, `probe64/index.html` 336380 bytes (SHA-256 348e0065cc8dee79eeb03400d1945ce32deff740757d4fd21979545138a5b8bb) |
| Source archive | …/archive/refs/tags/tabby-v03.3-diag.zip (VERSION expands to `tabby-v03.3-diag`) | …/archive/refs/tags/tabby-p0-probe64.zip (VERSION `tabby-p0-probe64`) |
| GitHub release | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v03.3-diag | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-p0-probe64 (marked pre-release, title "tabby-p0-probe64 (TEST BUILD: moves storage)") |

Record of tabby-v03.2:

| Item | Value |
| --- | --- |
| Branch and tag | `classic-tabby/linux-build` = c3454e3; tag `tabby-v03.2` (annotated) → c3454e3 |
| Firmware package `SMK37_PRO_OPEN.fwsc` | SHA-256 10a88928be02790a13764511b1946f24d1d8f0cc0a4bbf80af5d46200751e61d, 492084 bytes, build_id d842d29d324339e73beb16e984046711d95baf556a777f95ad78cb6d679215f9, app image 451396 (margin 2525); sdk.elf ef71f1325e9921cea00d64fcc363515828011540a86f302f2489b1788660d59f, app-image.bin 7abb861f739118da241dc99ea96ec1fff63b428c441754847273ecbf5021586a; display version tabby-v03.2 |
| Offline workbench `SMK37-Open-Source.html` | SHA-256 9ffbd973301e738f10d225b438cd5ee3811d7c18272462fece36768675d1a60c, 3078692 bytes |
| Static site | `gh-pages` = 4c675ae ("Pages: tabby-v03.2 (build d842d29d3243, release V01)"), `index.html` 334195 bytes (SHA-256 a8abaeb063d020f443ae1c0431c4e931d0f192c4d47f60eaae1a78f78c2441a8), assets.json `"version": "tabby-v03.2"`, 9 assets under `assets/smk37/` (firmware = `10a88928….bin`) |
| Source archive | https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v03.2.zip (VERSION expands to `tabby-v03.2`) |
| GitHub release | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v03.2 (`SMK37_PRO_OPEN.fwsc`, `SMK37-Open-Source.html`, `SHA256SUMS.txt`; notes docs/releases/tabby-v03.2.md) |

Record of tabby-v03.1:

| Item | Value |
| --- | --- |
| Branch and tag | `classic-tabby/linux-build` = 22018ac; tag `tabby-v03.1` (annotated, 27c92e9) → 22018ac |
| Firmware package `SMK37_PRO_OPEN.fwsc` | SHA-256 94987db8846ffa30de8db704396f4fa9042aec6f451005af6b40b0be8373b0b2, 492084 bytes, build_id e8d7b7ac4f80c45fb393447f3a260b6288ef854afa23fe507e6a520a558e8f07, app image 451396 (margin 2525); sdk.elf 9908d145700cda0412b0a9378dbb026fa0bc729a834cf25c41606df0a328315a, app-image.bin f06f541afcd364370276d1ac158fac9166001743a9b788b35983d40903a01f29; display version tabby-v03.1 |
| Offline workbench `SMK37-Open-Source.html` | SHA-256 04e81a827de84c8aa04351f9527f1de259745fa5681544209c29ddaf31433a90, 2981734 bytes |
| Static site | `gh-pages` = d26dfd6 ("Pages: tabby-v03.1 (build e8d7b7ac4f80, release V01)"), `index.html` 334195 bytes (SHA-256 85aaad0dcbf2504df332c511179d8a1a35729afb20bdd5cee8b58dda2a9adf71), assets.json `"version": "tabby-v03.1"`, 9 assets under `assets/smk37/` named by SHA-256 (firmware = `94987db8….bin`) |
| Source archive | https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v03.1.zip (its VERSION file expands to `tabby-v03.1`) |
| GitHub release | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v03.1 (`SMK37_PRO_OPEN.fwsc`, `SMK37-Open-Source.html`, `SHA256SUMS.txt`; notes docs/releases/tabby-v03.1.md) |

Record of tabby-v03.0:

| Item | Value |
| --- | --- |
| Branch and tag | `classic-tabby/linux-build` = bb8c456; tag `tabby-v03.0` (annotated, a407835) → bb8c456 |
| Firmware package `SMK37_PRO_OPEN.fwsc` | SHA-256 2cb180caab27f4ac5301658244c33f4eb59394e831d7c6319729f486e4ea5bcd, 492084 bytes, build_id 77077ef338a95beffd665da8b003e96929edf29bca840d4166dd3e7fe69e29d4, app image 451396 (margin 2525 to the 453921-byte packaging limit); sdk.elf fe1771353b6849e3b70f10e0e8b6c9806b77501a0e15b0894a4753e5031740f1, app-image.bin 1cdf1e64c5470d990b42dc39494c8b98942e2d7ea001de94f07f11fc7d281552 |
| Offline workbench `SMK37-Open-Source.html` | SHA-256 3c2a88d9f0cc5749f11d81ff40bc8105f1589245d8c9a67a44b527e2cdcbf0d6, 2921340 bytes |
| Static site | `gh-pages` = e2e20b5 ("Pages: tabby-v03.0 (build 77077ef338a9, release V01)"), `index.html` 291608 bytes (SHA-256 b9156a4ff3e10d83da6e6b915e626787b907996925fb2de3af580d45385fa0f5), 9 assets under `assets/smk37/` named by SHA-256 (firmware = `2cb180ca….bin`, stock V16 `2d98ce72….bin`, simulator `7f2657c2….wasm`, three scripts) |
| Source archive | https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v03.0.zip |
| GitHub release | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v03.0 (`SMK37_PRO_OPEN.fwsc`, `SMK37-Open-Source.html`, `SHA256SUMS.txt`; notes docs/releases/tabby-v03.0.md) |

Record of tabby-v02.0:

| Item | Value |
| --- | --- |
| Branch and tag | `classic-tabby/linux-build` = ad73b97; tag `tabby-v02.0` (annotated) → ad73b97 |
| Firmware package `SMK37_PRO_OPEN.fwsc` | SHA-256 73c1a5ad11703ca701851ef6de9f2682d7cd9ae629eeebf8c10b0b47957ee34c, 487988 bytes, build_id 41d72747b0f68867dc8f9a8c4457c4558b4399faaca6b3630e52770c8c18f972, app image 449252 |
| Offline workbench `SMK37-Open-Source.html` | SHA-256 e97f3227c396dafecda7f47107d4530327e50fd5dd80e00011cddee66edc3a48, 2870621 bytes |
| Static site | `gh-pages` = 67968bf ("Pages: tabby-v02.0 (build 41d72747b0f6, release V01)"), `index.html` 289251 bytes, assets under `assets/smk37/` named by SHA-256 (firmware = `73c1a5ad….bin`, simulator `7f52193e….wasm`) |
| Source archive | https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v02.0.zip |
| GitHub release | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v02.0 (`SMK37_PRO_OPEN.fwsc`, `SMK37-Open-Source.html`, `SHA256SUMS.txt`; notes docs/releases/tabby-v02.0.md) |

Record of tabby-v01.0:

| Item | Where | Value |
| --- | --- | --- |
| Repository | https://github.com/SeattleUser0/classic-tabby (public) | branch `classic-tabby/linux-build`, tags `upstream-v01` (= b2d6bcb, M-VAVE's V01) and `tabby-v01.0`; remote `upstream` stays m-vave/smk37_open |
| Source archive (GPL offer) | https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v01.0.zip | the tree of the tagged commit; embedded in the workbench as the "Source and SDK" link |
| Firmware package | `build/pro/generated/SMK37_PRO_OPEN.fwsc` | SHA-256 b5bb4026b9c8f501cf97c6f7eea36925bb9220100295cfe06fe34b1d4f294afa, 492084 bytes, build_id e3344029ab696c7395093fdddc5c3f949bbd47d8b605a78e6f691af664e0d12e (same as Task 01) |
| Offline workbench | `build/official-web/pro/SMK37-Open-Source.html` | SHA-256 462de137213a338662bc1ef77a1c89e4eaee6350bbc050b7daf5f0ffcaa7ff36, 2628842 bytes; embeds the firmware above and the stock `SMK37-Pro-V16.fwsc` (2d98ce72…, 705252 bytes, loader ef1f2db8…); simulator b8b4a463… (official) |
| Static site | `build/hosted/pro/` → branch `gh-pages` → https://seattleuser0.github.io/classic-tabby/ | `index.html` = `smk37-workbench.html` (291993 bytes), 9 assets under `assets/smk37/` named by SHA-256 (3 scripts with SRI, firmware .bin, stock .bin, simulator .wasm), `SMK37-Open-Source.html` as the offline download, `assets.json`, `.nojekyll`; initial load 928312 bytes |
| GitHub release | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v01.0 | `SMK37_PRO_OPEN.fwsc`, `SMK37-Open-Source.html`, `SHA256SUMS.txt`; notes in `docs/releases/tabby-v01.0.md` |

The package build is deterministic in the same way as the firmware: the HTML embeds only
the source URL, the compact package JSON, the simulator and the notice files, none of which
depend on the commit id, so a rebuild from the tagged commit gives the same SHA-256.

### 9.2 Procedure for a new version (`make publish`)

1. Commit everything. Tag the commit that will be built: `git tag -a tabby-v01.1 -m ...`
   and push the tag first (`git push origin tabby-v01.1`), so the archive URL exists.
2. `make publish TAG=tabby-v01.1`. This runs, in order:
   - `make package`: `build.py --package` (v0.3) compiles with Track B, packages the `.fwsc`,
     checks the stock V16 image against its pinned SHA-256, writes
     `build/pro/web-package.json` (the exact `const FM1_PACKAGE` text, same key order as
     Build.ps1's `ConvertTo-Json -Compress`), runs `build-web.py --package-json` with
     `FM1_SOURCE_URL = https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/<TAG>.zip`,
     and writes `build/pro/web-package-report.json`. Build.ps1 L282-L288 and L439-L463.
   - `make hosted`: `publish-pages.py` checks the page's source link, runs
     `tools/Build-Hosted.cjs` into a fresh `build/hosted/pro/` and adds `.nojekyll`.
   - `publish-pages.py --tag <TAG> --push`: refuses unless HEAD carries the tag, the tree is
     clean and the tag is on origin with the same id; then checks out `gh-pages` in the
     worktree `build/gh-pages/` (created as an orphan branch the first time), replaces the
     site (keeping `probe64/`, `builds/` and `recover/`), copies it to `builds/<TAG>/` and
     rewrites `builds/index.json` and `builds/index.html` (v0.4, Task 12 A5; `--note "..."`
     adds the index note, `--no-builds` skips the step), commits ("Pages: <TAG> (build …)")
     and pushes with `gh auth git-credential` as a one-command credential helper (no global
     git config is changed). Without a git identity configured, the author of HEAD is used.
3. `make release TAG=tabby-v01.1` after writing `docs/releases/tabby-v01.1.md`: gathers
   `build/release/<TAG>/` (`.fwsc`, offline HTML, `SHA256SUMS.txt`) and runs
   `gh release create --verify-tag`.
   Release-note template (docs/releases/tabby-v02.0.md and tabby-v03.0.md follow it): title
   with the tag and the headline features; the back-up warning; the build ID and the build
   number the update tab shows; the app image size and margin; the hardware-validation state
   and the checklist sections; what is new, removed and compatible; the Files table; the
   Source section with the tag archive; "Before pressing anything" with the identity line.
   Since Task 08 the note also states the display version the boot screen and the workbench
   badge show (the tag itself) and that the version line's Open base label stays V01.
4. GitHub Pages serves the `gh-pages` branch root (enabled once with
   `gh api -X POST repos/SeattleUser0/classic-tabby/pages -f build_type=legacy -f source[branch]=gh-pages -f source[path]=/`).
   Nothing is built on GitHub; the toolchains stay local.

Only the Pro model is published, at the site root. An Elite site would go in a
subdirectory (`--site-dir elite`), as HOSTING.md asks for separate directories.

### 9.3 Checks made before publishing

- Repository content: every path ever committed is under app/, docs/, sdk/, tests/,
  third_party/, tools/, web/ or the top-level files; no toolchains/, official-release/ or
  build/ entry in any commit (`git log --all --name-only`); every blob in the history
  scanned for token/key patterns (GitHub, AWS, Slack, PEM) and secret-looking file names:
  none.
- Static site in headless Chrome 156 from a local HTTP server: no console errors, the
  simulator placeholder hidden, scripts and wasm fetched from `assets/smk37/`, source link
  `https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v01.0.zip`.
- `file://` opening of `index.html` redirects to the offline `SMK37-Open-Source.html`
  (Build-Hosted.cjs entry loader), as HOSTING.md describes.

### 9.3a Verification after publishing (2026-11-02)

- Pushed: `classic-tabby/linux-build` = ff723d2, tags `upstream-v01` (b2d6bcb) and
  `tabby-v01.0` (annotated, → ff723d2), `gh-pages` = 43f4c2b. GitHub enabled Pages by
  itself on the first gh-pages push (legacy build, branch root); the first build took 54 s.
- The archive https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v01.0.zip
  (302 → codeload.github.com, `classic-tabby-tabby-v01.0.zip`, 2606964 bytes, SHA-256
  45c0cd15…) unpacks to 179 files whose SHA-256 all equal `git archive tabby-v01.0`. The
  same URL fetched through the live page's source link gives the same bytes. GitHub does
  not promise archive bytes stay stable forever, so the release carries no hash of the zip.
- Live site https://seattleuser0.github.io/classic-tabby/: `index.html` byte-identical to
  `build/hosted/pro/index.html`; scripts served as `application/javascript`, the simulator
  as `application/wasm`, the two firmware images as `application/octet-stream`, the offline
  HTML as `text/html` (2628842 bytes). Headless Chrome 156: no console errors, placeholder
  hidden, 149 LCD targets, "Eight-track overview", status "Firmware loads when Device
  Update is opened" (the firmware details in 9.4 are filled when that tab is opened).
- Release https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v01.0: the
  three assets downloaded back and `sha256sum -c SHA256SUMS.txt` passes.
- This commit is a documentation follow-up on the branch; the tag stays on ff723d2, the
  commit the firmware was built from. app/, sdk/, web/ and third_party/ are unchanged.

### 9.3b Verification after publishing tabby-v02.0 (2026-11-02)

- Before tagging: tree clean at 310526d + the release note (ad73b97); `make verify`,
  `make crosscheck` (sdk.elf 36bd2380…, .fwsc 73c1a5ad…, app image 449252), `make test`
  (148 host checks, wasm smoke, workbench song-write and device schema tests),
  `make midi-import-test` (140) and `make midi-import-sim` (Renoise song, row-event song)
  all passed.
- Pushed: `classic-tabby/linux-build` d54b579 → ad73b97, tag `tabby-v02.0` (annotated →
  ad73b97), `gh-pages` 43f4c2b → 67968bf. `classic-tabby/task02-midi-import` stays local.
- `make publish TAG=tabby-v02.0` rebuilt the package from the tagged tree with the same
  firmware SHA-256 and build_id as the pre-tag build (the release note changed nothing the
  build id hashes). `make release TAG=tabby-v02.0` created the release; the three assets
  downloaded back and `sha256sum -c SHA256SUMS.txt` passes; the release `.fwsc` is
  byte-identical to `build/pro/generated/SMK37_PRO_OPEN.fwsc`.
- Live site https://seattleuser0.github.io/classic-tabby/ after the Pages build (the first
  poll already saw it built): `index.html` byte-identical to `build/hosted/pro/index.html`;
  the firmware asset `assets/smk37/73c1a5ad….bin` served as `application/octet-stream`,
  487988 bytes, byte-identical to the local package; headless Chrome: no console errors,
  placeholder hidden, 149 LCD targets, the song editor, the importer panel (6 sections),
  the rig setup table and the events panel present; the source link is the tag archive.
- The archive https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v02.0.zip
  (2939630 bytes) unpacks to 249 files whose SHA-256 all equal `git archive tabby-v02.0`.
- This commit is the documentation follow-up; the tag stays on ad73b97.

### 9.3c Verification after publishing tabby-v03.0 (2026-11-04)

- Before tagging, on d2d0c41 (Task 06 checkpoint d), every heavy job through Classic Tabby's
  own machine lock (`flock /tmp/tabby-suite.lock systemd-run --user --scope -p MemoryMax=4G`,
  the rule since this day; the earlier runs in sections 18 and 19 used the shared Orange Cat
  lock): the host suite and the timed-note test built and run under
  `-fsanitize=address,undefined -fno-omit-frame-pointer` with leak detection on, in a scratch
  directory outside build/, as docs/tasks/TASK-07-step1-assessment.md section 4 on branch
  classic-tabby/dev-checks describes. Recoverable run (`halt_on_error=0`): 258 host checks,
  0 findings, exit 0; strict run (`-fno-sanitize-recover=all`): passes; timed_note 804 checks,
  0 findings. The last clean sanitizer run before this was on 56b09d3, before Task 05 and
  Task 06. No fix was needed.
- cppcheck's `arrayIndexOutOfBoundsCond` at app/screen.c:109 on 56b09d3 (line 107 on head,
  the `punctuation[32][5]` lookup in draw_text) is a false positive: the subtracted offset is
  chosen per range by the ternary (33 for '!'..'9', 43 for ':'..'@', 69 for '['..'`', 95 for
  '{'..'~'), digits and letters are taken by the earlier branches, so the index is 0..31;
  cppcheck's 93 is '~' (126) minus the first offset, ignoring the condition. Unchanged.
- Then `make verify`, `make crosscheck` (IDENTICAL: sdk.elf fe177135…, .fwsc 2cb180ca…,
  app-image.bin 1cdf1e64…, 451396 bytes), `make test` (timed-note 804 C / 806 JS, host 258,
  wasm smoke, song-write, devices, transfer-radio 12, rig-lead 9), `make midi-import-test`
  (167) and `make midi-import-sim` (Renoise song per-block drain: Note On and Note Off error
  0..0 blocks; launch-sim 591/591 note-ons, worst 0) all passed.
- Pushed: `classic-tabby/linux-build` 73d54e0 → bb8c456 (the release note), tag `tabby-v03.0`
  (annotated a407835 → bb8c456), `gh-pages` 67968bf → e2e20b5. `classic-tabby/dev-checks` and
  `classic-tabby/task02-midi-import` stay local.
- `make publish TAG=tabby-v03.0` rebuilt the package from the tagged tree with the same
  firmware SHA-256 and build_id as the pre-tag build; the offline HTML differs from the
  pre-tag build only by the source URL (the tag archive). `make release TAG=tabby-v03.0`
  created the release; the three assets downloaded back and `sha256sum -c SHA256SUMS.txt`
  passes; the release `.fwsc` is byte-identical to `build/pro/generated/SMK37_PRO_OPEN.fwsc`.
- Live site https://seattleuser0.github.io/classic-tabby/ after the Pages build (76 s):
  `index.html` byte-identical to `build/hosted/pro/index.html` (291608 bytes); the firmware
  asset `assets/smk37/2cb180ca….bin` served as `application/octet-stream`, 492084 bytes,
  byte-identical to the local package; the simulator as `application/wasm`, the three scripts
  as `application/javascript`; `SMK37-Open-Source.html` 2921340 bytes, byte-identical to the
  local build. Headless Chrome: no console errors, placeholder hidden, 149 LCD targets, the
  TRACK LAUNCH page shortcut (page 20), the Bluetooth settings group and the rig's "Lead ms"
  column present; the source link is the tag archive.
- The archive https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v03.0.zip
  (3068722 bytes) unpacks to 272 files whose SHA-256 all equal `git archive tabby-v03.0`.
- This commit is the documentation follow-up; the tag stays on bb8c456.

### 9.3d Verification after publishing tabby-v03.1 (2026-11-05)

- **The gate, forced label.** On the Task 08 tree (3cba327) `make check`, `make lint` and
  `make firmware DISPLAY_VERSION=V01`: against the tabby-v03.0 outputs, app-image.bin differs
  in exactly 32 contiguous bytes (offset 158237..158268, the `fm1_build_id` constant),
  sdk.elf in the same 32 bytes, the .fwsc in those plus 14 bytes of package checksums
  (sdk.elf a76b8c87…, .fwsc 3d229c32…, app-image 110e890a… against fe177135…, 2cb180ca…,
  1cdf1e64…). The build id moves because app/version.h and app/screen.c changed, so the
  stated gate "byte-identical to tabby-v03.0" cannot hold for any firmware whose app/ differs;
  the difference is confined to the build id, which is the proof the gate was meant to give.
- **Suite.** `make suite DISPLAY_VERSION=tabby-v03.1` green on 3cba327 (crosscheck IDENTICAL:
  sdk.elf 9908d145…, .fwsc 94987db8…, app-image f06f541a…; test, midi-import-sim,
  host-sanitize; 12 "all checks passed", 804 / 806 timed-note checks, importer 167). The
  forced display version equals what the tagged tree produces, since the display version is
  folded into the identity exactly as the tag is; `make publish` from the tagged tree gave
  the same .fwsc (94987db8…) and build id (e8d7b7ac…).
- Pushed: `classic-tabby/linux-build` 0c32d69 → 22018ac (Task 08 version display 68cd41d, the
  manual 3cba327, the release note 22018ac), tag `tabby-v03.1` (annotated 27c92e9 → 22018ac),
  `gh-pages` e2e20b5 → d26dfd6.
- `make release TAG=tabby-v03.1` created the release; the three assets downloaded back and
  `sha256sum -c SHA256SUMS.txt` passes; the release `.fwsc` is byte-identical to
  `build/pro/generated/SMK37_PRO_OPEN.fwsc`.
- **The archive.** https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v03.1.zip
  (3139369 bytes) unpacks to 283 files whose SHA-256 all equal `git archive tabby-v03.1`, and
  its VERSION file reads `tabby-v03.1`: GitHub applies export-subst with `%(describe:tags)`,
  so a build from the archive shows the same version (tools/linux/display_version.py run from
  the unpacked tree prints `tabby-v03.1`).
- Live site https://seattleuser0.github.io/classic-tabby/ after the Pages build (19 s):
  `index.html` byte-identical to `build/hosted/pro/index.html` (334195 bytes); the firmware
  asset `assets/smk37/94987db8….bin` served as `application/octet-stream`, 492084 bytes,
  byte-identical to the local package; `SMK37-Open-Source.html` 2981734 bytes, byte-identical;
  assets.json carries `"version": "tabby-v03.1"`. Headless Chrome: no console errors, the
  simulator placeholder hidden, the badge reads **tabby-v03.1**, the manual tab has 21 chapters
  ("21 chapters", heading "Classic Tabby manual", the twelve new chapter ids present, no
  Chinese text left in the English UI), the source link is the tag archive.
- This commit is the documentation follow-up; the tag stays on 22018ac.

### 9.3e Verification after publishing tabby-v03.2 (2026-11-05)

- **The gate, forced version.** The Task 09 tree (d57fc26) built with `--display-version
  tabby-v03.1` against the tabby-v03.1 release package: the .fwsc differs in 46 bytes, the
  32-byte `fm1_build_id` (package offset 175953..175984) plus 14 package checksum bytes; sdk.elf
  and app-image.bin carry the same 32-byte difference (dc29edce…, 8e6e2536… against 9908d145…,
  f06f541a…). app/ is unchanged since tabby-v03.1 (`git diff tabby-v03.1 -- app/` is empty); the
  build id moves because sdk/manifest.json, whose pin of sdk/Update.html.in changed with the
  workbench, is an identity input (build.py `identity_inputs = [profile, sha256(manifest)] +
  app files`). So a byte-identical package across a workbench change is impossible by
  construction; the proof that the firmware sources are unchanged is the empty app/ diff and the
  difference confined to the id.
- **Suite.** `make check`, `make lint`, then `make suite DISPLAY_VERSION=tabby-v03.2` green on
  d57fc26 (crosscheck IDENTICAL: sdk.elf ef71f132…, .fwsc 10a88928…, app-image 7abb861f…; test,
  midi-import-sim with the Wrong Room simulator check, host-sanitize; 15 "all checks passed",
  importer 183). `make publish` from the tagged tree gave the same .fwsc and build id.
- Pushed: `classic-tabby/linux-build` fc6ea29 → c3454e3 (the Task 09 commits 6090f65, 3892ce0,
  8a4e629, fda8f07, 71cad94, 1f8fdae, 077c210, d57fc26, c3454e3), tag `tabby-v03.2` → c3454e3,
  `gh-pages` d26dfd6 → 4c675ae.
- `make release TAG=tabby-v03.2` created the release; the three assets downloaded back and
  `sha256sum -c SHA256SUMS.txt` passes; the release `.fwsc` is byte-identical to the local package.
- **The archive** (3254766 bytes) unpacks to 300 files whose SHA-256 all equal `git archive
  tabby-v03.2`; its VERSION file reads `tabby-v03.2`.
- Live site after the Pages build (21 s): `index.html` and `SMK37-Open-Source.html` byte-identical
  to the local build (334195 and 3078692 bytes), the firmware asset `10a88928….bin` byte-identical
  (492084 bytes, `application/octet-stream`), assets.json `"version": "tabby-v03.2"`. Headless
  Chrome: no console errors, the simulator placeholder hidden, the badge **tabby-v03.2**, the rig
  panel's profile select with "Wrong Room (built-in)" and nine columns, the Import MIDI panel's
  "Rig device" column and "Download the MIDI guide" button, the manual's 21 chapters.
- This commit is the documentation follow-up; the tag stays on c3454e3.

### 9.3f Verification after publishing tabby-v03.3-diag and tabby-p0-probe64 (2026-11-07)

- Before: `make suite DIAG=1 DISPLAY_VERSION=tabby-v03.3-diag` and `make suite DIAG=1
  USER_BYTES=471040 DISPLAY_VERSION=tabby-p0-probe64` passed (crosscheck identical on both tracks,
  the tests on the diagnostic and probe simulators, the sanitizers); the suites' .fwsc hashes are
  the released ones.
- The two tags sit on different commits (release notes only between them), so each archive's
  VERSION names its own tag; display_version.py on each tagged HEAD printed that tag.
- Both releases downloaded: `sha256sum -c SHA256SUMS.txt` OK for both files of each.
- Live site: `/index.html`, `/assets.json`, `/probe64/index.html`, `/probe64/assets.json` fetched
  over HTTPS are byte-identical to the gh-pages branch; assets.json names build 6ada2215… /
  tabby-v03.3-diag at the root and 2525715294cc… / tabby-p0-probe64 in probe64/. The root page
  does not contain the string `probe64`; each page's source link is its own tag's archive.
- Headless Chrome on both offline pages: no script error; the root shows the "Diagnostic build"
  note, the probe page the "TEST BUILD: this firmware moves the device storage" note and a title
  starting "TEST BUILD (moves storage)".
- The probe's release body was edited once after creation so its first line names all three
  points (test build, moves storage, full backup first); docs/releases/tabby-p0-probe64.md on the
  branch carries that line, the tagged copy the earlier title line.
- Known limit of the probe page: the MIDI importer's pool estimate (web/import/song-format.js)
  assumes 96 block sectors; on the probe the device has 80 and refuses a batch that does not fit
  (code 74), as it would on any full storage.

### 9.3g Verification after publishing tabby-v04.0 (2026-11-08/09)

- Before: `make check`, `make lint` (the same three pre-existing warnings: two
  missing-field-initializers in screen.c, one unused variable in scan.c) and `make suite
  DISPLAY_VERSION=tabby-v04.0` at 40fdd71 passed in 4 min 59 s (crosscheck identical on both
  tracks, the simulator tests, the workbench tests including loader-tag.mjs and
  builds-index-test.py, the sanitizers); the suite's .fwsc hash is the released one. The release
  notes commit c55695a changed only docs/releases/ and docs/MIDI-GUIDE.md, so the package is the
  suite's.
- Flash: app image 447716, margin 71741 to 519457 (FLASH-BUDGET.md v0.20); heap 198636.
- Release downloaded: `sha256sum -c SHA256SUMS.txt` OK for both files; the .fwsc is byte-identical
  to build/pro/generated/. The tag archive (326 files) equals `git archive tabby-v04.0`; its
  VERSION expands to `tabby-v04.0`.
- Live site (2026-11-09 07:55 UTC): `/index.html`, `/assets.json`, `/builds/index.json`,
  `/builds/index.html`, `/builds/tabby-v04.0/index.html`, `/builds/tabby-v04.0/assets.json`,
  `/builds/tabby-v03.3-diag-r2/index.html`, `/recover/index.html`, `/SMK37-Open-Source.html` and
  the firmware asset `368c6130….bin` fetched over HTTPS are byte-identical to gh-pages 010b553;
  assets.json names build b6e9590223446363 / tabby-v04.0; the index lists tabby-v03.2,
  tabby-p0-probe64, tabby-v03.3-diag, tabby-v03.3-diag-r2, tabby-v04.0.
- Headless Chrome on the gh-pages copy: no console message; badge tabby-v04.0; the storage-move
  note; the simulator placeholder hidden; `#loader-hint` present; `builds/index.html` lists the
  five builds.
- Pages incident: the deployment of gh-pages 89ef820 (the A5 import, 04:29 UTC) hung in
  "syncing_files" and deploy-pages timed out after 600 s; the deployment of 010b553 (04:41 UTC)
  was refused ("in progress deployment"); a re-run of its failed job sat in "queued" for three
  hours without a job. Fix: `gh api -X POST repos/SeattleUser0/classic-tabby/pages/builds`
  (07:53 UTC) started a fresh build of 010b553 that deployed in under a minute. The repository,
  the tag and the release were not affected; until 07:54 UTC the live root still served
  tabby-v03.3-diag and `builds/` returned 404. GitHub's status page showed Pages operational
  throughout, with one unrelated incident (504s for anonymous traffic).
- Small mismatch left as is: `builds/index.json` dates tabby-v04.0 2026-11-09 (the UTC day of the
  publish); the notes and this file say 2026-11-08 (the local day).
- Known limit: the historic pages under `builds/` carry the workbench of their own day, so only
  the root and `builds/tabby-v04.0/` (and later builds) show the stale-loader hint (26.5).

### 9.4 What the install screen shows for the SMK-37 Pro

Device update tab, before connecting: Firmware **SMK37 Pro Open**, Version **the display
version** (Task 08: the git tag, `tabby-v03.1` and later; up to tabby-v03.0 the line showed
the Open label **V01**), Firmware details: size, build number and **Open base version V01**
(480.6 KiB and build number **77077ef338a95bef** for tabby-v03.0; 476.6 KiB and
**41d72747b0f68867** were tabby-v02.0, 480.6 KiB and **e3344029ab696c73** tabby-v01.0; the full build_id is the tooltip; the
version line stays V01, the Open firmware line the fork builds on). After "Connect device" the identity line shows the device's own name:
`SMK-37 Pro_016` for factory V16 (status "Device and current firmware recognized. To
migrate, click Enable force flash and reconnect."), or `SMK-37 Pro_8000001` for an
installed Open V01 (status "SMK37 OPEN connected. Ready to update", or "This version is
already installed" when the device reports the same build_id). An `Orange Cat FM-1` or any
other identity is not the target device.

## 10. Task 03 — song mode, checkpoint (a) (2026-11-02)

### 10.1 What changed

Firmware (app/, the first functional change to the fork):

- `app/samples.c` v0.1: the V01 sample bank code is gone. The binary SDK still imports
  `groove_samples_init` / `groove_samples_poll`; they now start and drive the song-region
  scan. `groove_samples_status` always returns 0.
- `app/song_storage.c` / `.h` v0.1: region constants (USER 69632, 113 sectors, up to the
  tuning sector), boot scan (first 32 bytes of each sector, four per control poll),
  classification (FM1G / FM1B / FM1Q song magics, erased, or old data such as the V01
  `FM1S` bank and `FMB1` DX7 banks), and the user-confirmed erase of only the old sectors.
  Nothing below 69632 and nothing at or above 532480 is touched.
- `app/fm_library.c` v0.1 and `app/fm_patch.h`: library banks, staging recovery and the
  sample-bank conflict check removed; `groove_fm_program` serves the factory bank only;
  `groove_fm_library_init` stays as an SDK entry point (no-op).
- `app/transfer.c`: commands 11-16 and transfer kind 4 removed; command 22 reports 0 DX7
  library banks (unavailable) and a sample limit of 0; the "sample transfer in progress"
  session checks are gone. Command 21 is unchanged (the workbench checks its exact bytes).
- `app/project.c`: projects, imports and factory scenes with a GROOVE_SAMPLE track are
  converted to the 808 default kit (volume and sends kept, step masks kept) before they
  are applied; the SDK's power-on sampler track is moved to the 808 on the first poll;
  the DX7 library staging recovery call is gone. The legacy `tuning_blocked()` check stays
  as protection for the tuning sector until the old bank is erased.
- `app/presets.c`: the seven factory scenes that used the sampler play their beat on the
  808; `groove_preset_drum_default()` added for project.c.
- `app/screen.c`: the sampler is not offered on the SOURCE page (`SOURCE_CHOICES`), its
  knob map, pad hints and labels are gone; new ACTIONS entry 21 "ERASE OLD SAMPLE/DX7"
  (destructive, SAVE to confirm, "ERASE OLD FLASH DATA?"); a one-time notice "OLD
  SAMPLE/DX7 DATA - SEE ACTIONS TO ERASE" at boot when the scan finds old data.
- `app/smk37_controls.c`: the sampler slot keys are gone; every track plays pitches.
- `web/engine/Simulator.c`: sim_factory*, sim_sample_* and sim_library_* exports removed;
  `sim_song_storage_state` / `sim_song_storage_initialize` added; the cleared simulator
  flash no longer carries a factory sample bank.

Workbench (sdk/, pinned files re-hashed with `tools/linux/pin-sdk-files.py`):

- `sdk/WebUpdate.js`: the capability check accepts 0 DX7 banks and a sample limit of 0
  (`sampleCapacity` follows the reply; `bankAvailable` needs 4 banks).
- `sdk/Update.html.in`: the "8-slot sample bank" and "128 DX7 standalone voices" sections,
  the simulator's standalone-library controls, the post-update sample check button and
  the sample manual chapter are removed; the post-update check reports the firmware as
  ready without touching samples.
- `sdk/Simulator.js`: worker cases samples / library-read / library-load / library-write
  and the library UI handlers removed.
- `sdk/Samples.js`: reduced to two globals the shared code still references.
- `sdk/manifest.json`: hashes of those four files updated. Every other entry, including
  the binary SDK files, is unchanged; `make verify` still enforces all 67.

### 10.2 Measured

| Quantity | V01 | After (a) |
| --- | ---: | ---: |
| App image (limit 453921) | 453892 | **450820** (margin 3101) |
| Static SRAM | 267348 | 266676 |
| Runtime heap (min 49152) | 256268 | 256940 |

Track A and Track B stay byte-identical (`make crosscheck`: sdk.elf 44adf5d3…, .fwsc
d9e0c577…). `make test`: 35 host checks (migration scan, detection of planted FM1S/FMB1
sectors, confirmed erase of exactly those sectors, staging and tuning sectors untouched,
factory scene 0 loads with no sampler track) and the wasm smoke test all pass. The web
preview rebuilt with the edited workbench loads in headless Chrome 156 with no console
errors and the simulator running. Details in docs/FLASH-BUDGET.md section 5.

### 10.3 Before flashing a V01 device with this firmware

Back up the sample bank (`.fm1s`) and the four DX7 library banks (`.syx`) with the V01
workbench first. On the first boot the screen shows "OLD SAMPLE/DX7 DATA - SEE ACTIONS TO
ERASE"; song mode (checkpoint d) stays disabled until ACTIONS → "ERASE OLD SAMPLE/DX7" →
SAVE is confirmed. Projects, settings and tuning are untouched either way. The workbench's
"Restore factory V16" writes the factory resources back over 0xF4000-0xFDFFF of the
device, which is inside the song region; that warning is added with checkpoint (d).

## 11. Task 03 — song mode, checkpoint (b) (2026-11-02)

### 11.1 What changed

Firmware, `app/screen.c` only (no data layout, no project format, no flash write changed):

- The DX7 operator editor pages FM_EDIT / FM_ENV / FM_LFO and the per-engine tone editor
  TONE_EDIT are gone: `fm_draw`, `tone_draw`, `track_lfo_draw`, `fm_control`,
  `tone_control`, the algorithm diagram, the `fm_pages` parameter table, the EDIT black-key
  map, the operator / tone / LFO page state and the hold-EDIT (600 ms) gesture.
- The page numbers stay in the enum so the workbench simulator's page ids do not shift;
  `groove_screen_open` rejects the four removed targets (the workbench shows its existing
  "not supported for this source" message) and `groove_screen_snapshot` reports operator
  and FM page as 0.
- Buttons: EDIT on a DX7 track toggles FM_QUICK (voice / bank select, ALGORITHM, FEEDBACK,
  TRANSPOSE, LEVEL) as before; EDIT on any other source, SCL, ENV and LFO show
  "VOICE EDIT MOVED TO WORKBENCH". EDIT+REC (DX7 patch name), SEQ+EDIT (ACTIONS) and the
  other chords are unchanged. The shift-shortcut strip no longer lists ENV / LFO.
- The selected drum part per track is still remembered for STEPS editing (`drum_parts`).
- Kept: on-device DX7 preset select and the existing macros (FM_QUICK), the NAME page,
  PROJECT / PRESET_BROWSER, EFFECTS, MIX, BLE, STEPS, ARP_EDIT, SOURCE, ACTIONS.

Workbench (`sdk/`, re-pinned with `tools/linux/pin-sdk-files.py`):

- `sdk/Update.html.in`: the simulator shortcut buttons for the envelope, LFO and full
  voice editor pages (page ids 3, 4, 2) are removed.
- `sdk/Simulator.js`: the page tips and PRESETS-knob hints for pages 2-5 are removed; the
  FM quick-page tip no longer mentions the hold-EDIT editor.
- `sdk/manifest.json`: those two hashes updated; all 67 entries still enforced.

Not changed: the SDK's DX7 voice editing API (`groove_fm_edit` etc.) is still linked and
used by the FM_QUICK knobs and the workbench import paths; the web workbench's own DX7
editor is unaffected.

### 11.2 Measured

| Quantity | After (a) | After (b) |
| --- | ---: | ---: |
| App image (limit 453921) | 450820 | **439812** (margin 14109) |
| Static SRAM | 266676 | 266356 |
| Runtime heap (min 49152) | 256940 | 257260 |

Track A and Track B stay byte-identical (`make crosscheck`: sdk.elf 7ffed3da…, .fwsc
c3cc41ac…). `make test`: the 35 host checks and the wasm smoke test pass unchanged; the
host build compiles app/screen.c with no warnings. The rebuilt preview (`make web`) loads
in headless Chrome 156 with no console errors, the placeholder hidden and 149 LCD targets.
Details and the post-song-mode headroom projection in docs/FLASH-BUDGET.md section 6.

## 12. Task 03 — song mode, checkpoint (d) (2026-11-02)

### 12.1 What changed

Firmware (formats: docs/tasks/TASK-03-step1-assessment.md section 9 v0.4, binding):

- `app/song_storage.c` / `.h` v0.2: song records (one sector per song, CRC over bytes
  20..2623), block sectors (packed records, 6-byte header with a 16-bit id), the staging
  transactions of 9.6 with recovery at boot and before every write, the sorted per-song
  directory (2048 entries), free / reclaimable accounting, compaction of one sector or of
  the whole region (poll driven, one sector per poll). Payloads and records are validated
  before any flash write.
- `app/song.c` / `.h` v0.1: the sequencer. Two RAM row buffers (8 × 64 × 13 bytes); the
  control task decodes the next row (natural next, loop row, or the queued jump target)
  while the current one plays; the audio tick runs from `groove_midi_clock` once per
  block, counts 16ths from the tempo (or the song's BPM override), applies swing,
  probability, legato / retrigger and note lengths, swaps rows at row ends, lands jumps at
  the next bar (mode 0) or row end (mode 1), replays a row if the next one is not decoded
  in time (counted as an underrun), stops at the end of the last row unless the song loops.
- `app/midi_router.c`: song owners 40..47 (`OWNERS` 48), `groove_midi_song_note` (SEQ
  mode rules as for pattern notes; the local engine copy is posted on the track's input
  channel when the lane drains), `groove_midi_song_channels` (per-track override, notes
  released on the old channel first), channel resolved at delivery from the owner, the
  song tick hooked at the top of the clock callback.
- `app/transfer.c`: kinds 5 (song record, 4096) and 6 (block, target song << 16 | id,
  begin commands `[6, song, id lo, id hi]` / `[6, song, id lo, id hi, size lo, size hi]`),
  command 23 (free, reclaimable, state, loaded song, playing, row, error), capability bit
  2 set in command 22. An uploaded record whose magic is not `FM1G` deletes the song.
- `app/screen.c`: page 19 SONG (ACTIONS entry 21 "SONG MODE", web shortcut 19): song
  select on K1 / PRESETS, row / repeat / bar readout, block id per track, queued jump,
  storage state, errors; pads 1-16 queue jumps (OCT pages the pads), K4 jump mode, PLAY
  starts / stops the song (PLAY anywhere stops a playing song, starting a song stops the
  stock transport); ACTIONS entry 22 "COMPACT SONG STORAGE".
- `app/samples.c` v0.2: initializes and polls the sequencer from the SDK entry points.
- `web/engine/Simulator.c`: `sim_song_*` / `sim_block_*` exports (records, blocks,
  status, compaction, load / play / stop / jump) for the tests and the simulator target.
- `tools/linux/flash-budget.py` v0.2: the two new units in the attribution lists.

Workbench (`sdk/`, re-pinned; all 67 manifest entries still enforced):

- `sdk/WebUpdate.js`: `songRecordParse` / `songRecordBuild` (v0.4 layout, CRC),
  `songPayloadParse` / `songPayloadBuild`, step text syntax, `.tabby` writer / reader,
  `Library.songStatus / downloadBlock / uploadBlock / songRead / songWrite / songDelete`,
  kind 5 in `download` / `upload`, capability bit 2 → `songStorage`, error 74 text.
- `sdk/Update.html.in`: library group "Song mode" (target device or browser simulator,
  song slot, read / new / write / delete / export / import / status, header fields,
  channels, rows table, block step editor), the factory-V16 confirmation now warns that
  the restore overwrites the last 40 KB of song storage (block sectors 86..95), simulator
  shortcut button for page 19.
- `sdk/Simulator.js`: worker cases song-read / song-write / song-delete / song-status,
  `FM1Simulator.request` for the editor, page tip 19.
- `sdk/I18n.js`: English strings for the song section.

### 12.2 Measured

| Quantity | After (b) | After (d) |
| --- | ---: | ---: |
| App image (limit 453921) | 439812 | **449572** (margin 4349) |
| Static SRAM | 266356 | 300340 |
| Runtime heap (min 49152) | 257260 | 223276 |

Track A and Track B byte-identical (`make crosscheck`, hashes in docs/FLASH-BUDGET.md
section 7). `make test`: 70 host checks (35 from Task 01 / checkpoint a plus 35 for song
storage and playback) and the wasm smoke test pass; no compiler warnings. The rebuilt
preview (`make web`) loads in headless Chrome 156 with no console errors, the placeholder
hidden, 149 LCD targets and the page-19 shortcut present.

### 12.3 Using song mode

1. Workbench → Projects & sounds → Song mode: choose the device (project library
   connected) or the browser simulator, pick a song slot, "New song" or "Import .tabby",
   fill the rows (block id per track, repeat, steps, loop here), store blocks (step text
   `pitch:velocity:length[r]`, `@n` probability, `!` alt tuning), "Write song".
2. Device: ACTIONS → SONG MODE, K1 selects the song, PLAY starts; pads 1-16 queue a jump to
   that row (OCT pages rows 17..128), PLAY stops. The song's output channels apply while it
   plays and the device channels return afterwards.
3. "COMPACT SONG STORAGE" (ACTIONS) reclaims stale block copies after rewrites.

## 13. Task 03 — song mode, checkpoint (e): batched block upload (2026-11-02)

### 13.1 What changed

Formats: docs/tasks/TASK-03-step1-assessment.md section 9 **v0.5** (96c9058, doc commit on
its own): transfer kind 7, the batch journal, the pending marker, capability bit 3, the
record-first upload order. Block, row, song record and `.tabby` layouts unchanged.

- `app/song_storage.c` / `.h` v0.3: `song_block_batch(song, stream, bytes)`. The stream
  (block records as in the `.tabby` file, up to 32768 bytes) is validated in full, packed
  in order into whole block sectors (a record never splits; at most 10 sectors), the
  sectors are chosen among the free ones (erased, or holding no live record; lowest
  first), each is erased once and programmed with header byte 5 = 0xFF ("pending"), then
  the journal (`FM1Q`: version, sector count, song, first generation, CRC, sector list)
  goes into the staging sector with the commit word, and byte 5 of every batch sector is
  programmed to 0 (a one-byte 1→0 write). `song_storage_prepare` finishes a committed
  journal and erases pending sectors nobody committed, at boot and before every write;
  the boot scan marks pending sectors and keeps them invisible. A failed batch leaves its
  sectors marked pending in the cache and the next prepare erases them (no separate
  cleanup path). Compacting a sector with no live record is now a plain erase.
- `app/transfer.c`: kind 7 in `transfer_begin` (upload only, target = song, size 70..32768),
  the finish calls `song_block_batch` (all or nothing), capability reply out[8] = 15.
- `web/engine/Simulator.c`: `sim_batch_buffer` (32 KB) and `sim_block_batch`.
- `tests/host/smoke.c` v0.4: section 8 (39 checks): a 10 × 832-byte batch packs into
  three sectors and reads back, free space falls by exactly the stream, a second batch
  supersedes a block and may omit its final padding, bad streams store nothing, a power
  cut before the commit (planted pending sector, reboot) erases the pending sector and
  keeps everything else, a power cut after the commit (planted pending sector + committed
  journal, reboot) finalizes it and the block is live, a song plays from batch blocks,
  compaction after a delete erases every garbage-only sector.
- `sdk/WebUpdate.js`: `Library.uploadBatch`, `songBatches` (records cut at the device's
  packing boundaries, 8 sectors = at most 32608 bytes per batch), `songWrite` = record,
  batches (or kind 6 one by one on firmware without bit 3), read-back check;
  `this.songBatch` from capability bit 3. `sdk/Simulator.js`: the simulator target writes
  the record first and uses `sim_block_batch` with the same cutting rule.
  `sdk/Update.html.in` + `sdk/I18n.js`: the song editor help text describes the order and
  the audio pauses. `sdk/manifest.json` re-pinned for the four files.

### 13.2 Measured

| Quantity | After (d) | After (e) |
| --- | ---: | ---: |
| App image (limit 453921) | 449572 | **450980** (margin **2941**) |
| Static SRAM | 300340 | 300340 |
| Runtime heap (min 49152) | 223276 | 223276 |

Checkpoint (e) costs 1408 bytes of flash and no static RAM (the batch uses the transfer
buffer and the existing sector image). **The margin is 1155 bytes below the 4 KB target
of decision 1**; candidates in docs/FLASH-BUDGET.md section 8.1. Track A and Track B are
byte-identical (`make crosscheck`: sdk.elf 114461b2…, .fwsc ef0a6f43…). `make test`: 109
host checks (70 + 39) and the wasm smoke test pass, no compiler warnings. The rebuilt
preview loads in headless Chrome with no console errors, the placeholder hidden, 149 LCD
targets and the page-19 shortcut present.

### 13.3 Upload time, single-block against batched (estimate; measure on hardware)

Nothing here was timed on a device. Assumptions, to be replaced by the stopwatch figures
of checklist step 11: one SysEx exchange (request + reply, 64 payload bytes per chunk)
takes 5 ms (fast) to 20 ms (slow); a 4 KB sector erase 60 ms (typical for 25Q-class
SPI NOR; the datasheet maximum is 400 ms); a 4 KB program 12 ms. Two 137-block songs:
"sparse" (average payload 202 bytes, record 208, stream 28496 bytes) and "dense" (every
payload 832 bytes, record 840, stream 115080 bytes). The song record (4096 bytes, 67
exchanges, one 3-erase transaction) adds 0.5–1.5 s to every row.

| | Flash operations | Exchanges | Fast link | Slow link |
| --- | ---: | ---: | ---: | ---: |
| Sparse, kind 6 (one block per transaction) | 411 erases, 411 programs | 959 | ≈ 31 s | ≈ 46 s |
| Sparse, kind 7 (1 batch of 8 sectors) | 10 erases, 9 programs, 8 byte writes | 449 | ≈ 3.5 s | ≈ 11 s |
| Dense, kind 6 | 411 erases, 411 programs | 2192 | ≈ 38 s | ≈ 71 s |
| Dense, kind 7 (5 batches, 35 sectors) | 45 erases, 40 programs, 35 byte writes | 1814 | ≈ 13 s | ≈ 41 s |

Per block, kind 6 spends about 190 ms in flash (three erases) plus 7–16 exchanges; kind 7
spends about 90 ms of flash per sector and is then limited by the 64-byte chunk rate of
the stock protocol, which is the next lever if the batched figure is still too slow.

Audio during an upload: the flash API silences audio briefly on every erase and every
write (sdk/include/fm1.h), so the device still dips. Kind 6 dips about seven times per
block (three erases, three programs, the commit word), spread over the whole upload;
kind 7 dips about 2N + 12 times per batch of N sectors (N erases, N programs, N byte
writes, the journal's two erases, one program and one commit word), all inside the few
hundred milliseconds after the batch's last chunk, and not at all while chunks arrive.
Uploads are not done during a performance; the dips are reported, not avoided.

### 13.4 Hardware checklist for the first flash (in order)

Nothing of Task 03 has run on hardware yet. Preparation: back up with the V01 workbench
(sample bank, DX7 user library, projects): the migration erases the first two. Flash the
Classic Tabby package. In the workbench song editor build and export (keep the `.tabby`
files) three songs: **TICK** (1 row, 16 steps, repeat 1, loop on; track 1 = a block with
`60:100:1` on every step), **THREE** (3 rows × 16 steps, repeat 1, loop off; row 1 block A =
C4 on steps 1, 5, 9, 13; row 2 block B = E4 on every other step; row 3 block C = G4 on
every step; the same block ids on track 1 and track 2), and the importer's 137-block song.
Project: tempo 120, swing 0, clock source internal; track 1 source FM6 with SEQ on; track
2 with MIDI out to the M8 (USB or DIN), OUT CH 1, the M8 listening on channel 1 and its own
sequencer stopped. A MIDI monitor on the same port helps for steps 1, 4 and 7.

On a device that still holds V01 sample or DX7 data the SONG page shows "OLD SAMPLE/DX7
DATA IN FLASH" and song storage stays disabled: run step 2 before step 1 there.

1. **Song ticks and sends MIDI with the stock sequencer stopped.** Write TICK to slot 1
   (workbench, device target). Check the stock transport is stopped (SEQ page shows STOP).
   ACTIONS → SONG MODE, K1 to song 1, PLAY. See: "PLAYING", "ROW 1", "BAR" counting 1..4
   and wrapping, PLAY LED on. Hear: FM6 plays the note on every 16th at 120 BPM, eight
   notes per second, evenly. Monitor: Start (FA) once, Clock (F8) 24 per beat, note on /
   off on channel 1, no pattern notes. PLAY again: "STOPPED - PLAY STARTS", Stop (FC)
   once, nothing hangs, LED off. If BAR stays at 1 and nothing sounds, the per-block clock
   hook is not called while the transport is stopped on the real engine (it was verified
   against the web engine only): stop here and report.
2. **Migration prompt and erase of old sample / DX7 data.** Boot a device with V01 data.
   See: the SONG page says "OLD SAMPLE/DX7 DATA IN FLASH" and "ACTIONS: ERASE OLD
   SAMPLE/DX7"; song slots cannot be used. ACTIONS → "ERASE OLD SAMPLE/DX7" → "ERASE OLD
   FLASH DATA?" → SAVE confirms (HOME cancels). The erase runs one sector per control
   poll; if audio is playing it dips briefly per sector. Afterwards the SONG page shows
   "NO SONG HERE - UPLOAD FROM WORKBENCH", the workbench "Storage status" says 391296
   bytes free, 0 reclaimable, no "old data" suffix. Projects, tunings and settings are
   unchanged (load a project; play a tuned scale).
3. **Three-row song on FM6 and on MIDI out to the M8.** Write THREE to slot 2, K1 to song
   2, PLAY. See: "ROW 1", then "ROW 2" exactly when BAR wraps, then "ROW 3"; "NEXT ROW 2"
   / "NEXT ROW 3" during rows 1 and 2, "LAST ROW" during row 3, then "STOPPED - PLAY
   STARTS" with Stop sent once. Hear: FM6 plays C4 four times in bar 1, E4 eight times in
   bar 2, G4 sixteen times in bar 3; the M8 plays the same rhythm on channel 1, in step
   with FM6 for all three bars, and goes silent with it (no hanging note).
4. **Per-track channel override and release on leaving the song.** In THREE set the
   song's channel for track 2 to 5 (device OUT CH stays 1), set the M8 to channel 5,
   write, PLAY. See on the monitor: track 2 notes as 94 / 84 (channel 5), none on channel
   1. Hold a key on track 2 while the song plays: it sounds on channel 5 too. Keep holding
   it and press PLAY to stop: the key's note-off arrives on channel 5 (the channel its
   note-on used), the M8 shows no stuck note. Release, press the key again: channel 1.
5. **Queued jump at the next bar.** Set every row of THREE to repeat 4 and loop on; PLAY.
   During row 1, bar 2, press pad 3. See: "JUMP TO ROW 3" in amber at once; when BAR
   wraps from 4 to 1 the page shows "ROW 3" and "X 1": the change lands on beat 1 of the
   next bar, never mid-bar, with no stutter. Hear: row 1 finishes its bar, then G4 on
   every step. K4 → "JUMP: ROW END"; press pad 1: the jump waits for row 3's four repeats
   to end, then "ROW 1".
6. **Rapid jumps.** While playing, press pads 1, 2, 3 within one bar: only the last one
   shows ("JUMP TO ROW 3") and only it lands, at the next bar. Press pad 2 ten times
   inside one bar: one jump. Press pad 4 (no such row): a short "NO SUCH ROW / NOT
   PLAYING" notice, nothing queued. Throughout: no "ROW DECODE LATE" and no "BLOCK READ
   ERROR" on the page, audio continuous, one row change per bar at most.
7. **Tempo extremes.** Project tempo 30, THREE with repeat 1: a bar takes 8 s (BAR
   advances every 2 s), row 3's notes come every 0.5 s, Clock at 12 per second, the M8's
   tempo display (if slaved) reads 30. Project tempo 300: a bar takes 0.8 s, "ROW"
   changes every 0.8 s, row 3 plays 20 notes per second with none missing, no "ROW
   DECODE LATE", clean stop with no hanging note. Then set the song's BPM override to 300
   with the project at 120: the song and the Clock out run at 300; after the stop, the
   project's own pattern sequencer still runs at 120.
8. **Power cut during a song write, then recovery.** Write the 137-block song to slot 3
   and pull the USB cable (or power) while the workbench shows "Writing song NN%" between
   20 % and 80 % (the block batches). Power up. See: no old-data prompt; slot 3 shows the
   song's name (the record went first); PLAY starts it, and a row whose blocks were still
   missing shows "BLOCK READ ERROR" and plays silent for those tracks. "Storage status"
   answers (no "SONG STORAGE ERROR" on the device): batches that reached their commit are
   complete, a batch cut before its commit is absent entirely (its sectors were erased at
   boot). Write the song again: it completes and every row plays. Variant: pull power in
   the first second (the record write): afterwards slot 3 holds either the old content or
   the new record, never an error.
9. **Compaction.** Write the 137-block song to slot 3 twice. "Storage status": reclaimable
   ≈ the song's block bytes (one stale copy per block). ACTIONS → "COMPACT SONG STORAGE".
   See: "COMPACTING STORAGE..." on the SONG page for a few seconds (one sector per
   control poll, an audio dip per sector if something plays), then reclaimable 0 and free
   up by the same amount; the song still plays every row. With a song playing the action
   is refused.
10. **Factory-V16 restore warning.** Workbench firmware tab, choose the stock V16 package,
    click "Restore factory V16". See: the confirm dialog ends with "Restoring V16 also
    overwrites the last 40 KB of Classic Tabby song storage (block sectors 86-95). Export
    your songs first in Projects & sounds > Song mode." (Chinese UI: 恢复 V16 还会覆盖
    Classic Tabby 歌曲存储的最后 40 KB…). Cancel.
11. **Upload timing (for the (e) estimate).** Hold a long FM6 note (or play a pattern) and
    write the 137-block song: stopwatch from the click to "Song written and verified by
    read-back"; note where the audio dips (expected: only in the moment after each batch's
    last chunk, none while chunks stream). Record the time against section 13.3.
12. **Timing: song mode against the stock pattern sequencer.** Same material both ways: a
    one-track pattern of a C4 on every 16th at 120 BPM in the stock sequencer (SEQ page,
    track 1, MIDI out on), and the same thing as a song (TICK from step 1 with repeat 8).
    Record each on a MIDI monitor with millisecond timestamps (MIDI-OX, Pocket MIDI,
    Protokol or the like) for at least 32 bars, through the same cable. For each
    recording, take the note-on timestamps, subtract the first, and compute each note's
    deviation from n × 125 ms. Report, for each: the mean deviation (a fixed offset), the
    spread (max − min), and whether the deviation walks (drift) or stays within a band.
    What the simulator predicts for song mode: a band of about 3 blocks (8.7 ms), no drift
    over minutes, the mean about one block early relative to the ideal grid. The question
    for you: is the stock sequencer's band the same (both run from the same per-block
    clock, so it should be), and is song mode's deviation a fixed offset note to note or
    does it vary within the band? Write both numbers down; if song mode's band is wider
    than the stock sequencer's, tell me.

## 14. Task 02 — MIDI file import (folded from docs/tasks/TASK-02-notes.md at Step 4)

Spec side (scope, mapping rules, layout, differences found at the rebase): SPEC.md section 7.

### 14.1 Step 4 (2026-11-02): rebase, real transfer, workbench mount, simulator check

- Rebase of classic-tabby/task02-midi-import onto classic-tabby/linux-build (659422b,
  checkpoint e): clean, no conflicts; the only shared file both sides had touched was the
  Makefile (different hunks).
- `web/import/song-transfer.js` v0.3: `createBackend()` on the workbench song backend
  (device or simulator), `select({backend, name})`, kind-7 batch plan (same cut as
  `FM1Web.songBatches`: 4076-byte record areas, 8 sectors per batch), delete-before-replace,
  `read()` decoding the slot into the song model. The stub stays for the standalone page.
- `web/import/import-ui.js` v0.4: target name (device / simulator) in the confirm and the
  messages, batch plan shown, elapsed time reported, "Write song…" button.
- Shared files touched (kept small): `tools/linux/build-web.py` (+3 lines: the
  `/*FM1_IMPORT_SCRIPT*/` placeholder inlining the five web/import scripts in load order),
  `sdk/Update.html.in` (+1 `<details>` group with the mount point, +1 script placeholder,
  `songBackend()` gains an optional progress callback and `exists(slot)`, +3 lines mounting
  the panel), `sdk/I18n.js` (+2 entries: the group title and its help line),
  `sdk/manifest.json` (re-pinned for those two), `Makefile` (+`midi-import-sim` target).
- `tests/midi-import/run.mjs` v0.4: section 11c on a fake backend: first write = record +
  blocks with no delete, occupied slot reported with name / rows / distinct blocks, rewrite
  deletes first, read() gives identical `.tabby` bytes, batch plan within 8 sectors / 32608
  bytes, unconnected target reports "unknown" with the reason. 127 checks.
- `tests/midi-import/simulator.mjs` v0.1 (`make midi-import-sim`): renoise-export.mid
  through the wasm simulator, below.
- docs/tasks/TASK-02-notes.md folded into SPEC.md section 7 and this section, then removed.

### 14.2 Simulator check (renoise-export.mid, 2026-11-02)

tests/midi-import/simulator.mjs imports the file with the default assignments, output
channels 3 / 5 / 7 / 9 on tracks 1–4 and "device setting" on tracks 5–8, writes it to the
simulator's slot 3 as the workbench's simulator target does (record first, one kind-7
batch of 112 blocks, 10 772 bytes), switches all eight tracks to FM6, plays it to the end
with MIDI capture on and compares MIDI out with the model:

| Check | Result |
| --- | --- |
| Song: rows / blocks / steps / tempo | 18 / 112 / 1152 / 80 BPM |
| Played to its end and stopped by itself | 74 422 blocks = 216.0 s of audio, 0 underruns |
| FM6 audible | mean RMS 0.135 over the run |
| Note-ons on MIDI out | 1002 sent = 1002 in the model, every one matched by pitch, channel and step |
| Velocities | all equal |
| Note-on timing | within one tick block of the step: max error 3.0 blocks (8.7 ms), mean −0.8 blocks first and last 100 notes (no drift) |
| Note lengths | every Note Off at start + length (or the song end) within 3.5 blocks |
| Channels | tracks 1–4 on 3 / 5 / 7 / 9, track 5 on the device channel, nothing on any other channel |

Run time about 23 s in Node 22. The check is not part of `make test` because it needs the
wasm from `make web`.

### 14.3 Done (Steps 2 and 3, 2026-11-02)
- SMF parser with note pairing, running status, type 0 channel split, SMPTE and format 2
  refusal, tolerant of truncated tracks.
- Analysis and conversion with the mapping rules in section 2, warnings grouped by kind
  with positions (bar, beat.sixteenth) and per-Tabby-track labels, statistics (rows before
  and after merging, cells vs distinct blocks, notes in vs out, block bytes, sectors, pool %,
  id %).
- Song format module: block encoding/decoding, block records, song record with the 9.5
  offsets and CRC, .tabby file (9.9) encode/decode, validation rule list, pool usage
  (first-fit-decreasing into 4076-byte areas), JSON save/load.
- Transfer interface and stub (plan: kind 5 record + kind 6 per block, targets
  `(song << 8) | id`, query and time estimate; write: validate, plan, report, send nothing).
- Standalone page with the full flow (file → parts and assignment → options → result →
  save/load/export → write with the replace warning and the stub report).
- Host tests (`make midi-import-test`): parser, every fixture scenario, deduplication,
  JSON and .tabby round trips with byte-level checks of the v0.3 offsets, decode rejection
  of bad channel and step-length bytes, validation rules, stub transfer, limits, and the four
  Renoise files in tests/fixtures/. Headless Chrome run of the page: multitrack fixture
  imported, OUT CH and bar range changed, stub write reported, no script errors.
- Makefile: `midi-import-test` target (the only shared file touched; approved).
- v0.2: encoder and decoder write and read the row step length and the output channels;
  tests updated; Renoise fixtures run (section 6).
- v0.3: 16-bit block ids, 20-byte rows, 6-byte block record header, CRC over 20..2623,
  2048-block limit, kind 6 target (song << 16) | id; loose deduplication option in the
  converter and the page (checkbox + tolerance); tests: byte checks of the new offsets, id
  300 round trip, 256 distinct blocks accepted, 2049 rejected, loose mode at ±4/8/16 on a
  synthetic file and on the four Renoise files (119 checks).

### 14.4 Renoise fixtures: what the files hold (2026-11-02)

The four files in tests/fixtures/ (renoise-export.mid, Glass Relay.mid, meridian_fault.mid,
the_space_between_wires.mid) are **mf2t text**, not binary SMF: first line `MFile 1 N 96`
(format 1, N tracks, 96 ticks per quarter = 24 ticks per 16th), then `MTrk` … `TrkEnd`
blocks of `<tick> On|Off ch=1 n=… v=…` lines. Track 0 holds only `TimeSig 4/4 24 8` and
`Tempo`; every other track is one Renoise instrument, named "Track name (NN: Instrument)"
with an InstrName meta, all on channel 1. No CC, program change, pitch bend, SysEx or
tempo/meter change in any file. The importer reads the text form directly (midi-parse.js
v0.2).

| File | Tracks / parts | Bars | BPM | Rows | Blocks exact (cells) | Bytes (pool %) | Changed | Dropped |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| renoise-export.mid | 9 / 8 | 69 | 80 | 18 | 112 (112) | 10772 (2.75) | 193 starts moved, 139 lengths rounded, 10 overlaps clipped | none |
| Glass Relay.mid | 9 / 8 | 66 | 110 | 17 | 98 (119) | 10672 (2.73) | 126 moved, 165 rounded, 1 overlap | none |
| meridian_fault.mid | 12 / 11 | 85 | 104 | 22 | 137 (157) | 13420 (3.43) | 91 moved, 182 rounded, 1 overlap | 3 parts unassigned by default (11 parts > 8 tracks) |
| the_space_between_wires.mid | 10 / 9 | 64 | 104 | 16 | 117 (117) | 11924 (3.05) | 250 moved, 130 rounded, 44 overlaps | 1 part unassigned by default (9 parts) |

- **Moved starts** are chord strums and humanisation: offsets of 1–3 ticks (up to 8 in
  meridian_fault) inside a 24-tick 16th, so every note snaps back to its own step; nothing
  moves by a whole step.
- **Rounded lengths** are note-offs a tick or two early or late (3.969 → 4.00 beats and
  the like).
- **Overlaps clipped** are sustained pad and string notes re-struck on the same pitch
  before the previous one ended (16 → 8 steps); MIDI would have cut them the same way.
- **Nothing was dropped**: every note of every assigned part survives, no step has more
  than 4 notes on one track, and the only unassigned parts are the ones beyond eight,
  which the user assigns or merges in the preview.
- **Exact deduplication finds almost nothing** in these files (blocks ≈ cells, no merged
  rows): the material is through-composed and humanised, so no two 4-bar cells are
  byte-identical. With 16-bit ids (v0.4) the songs use 5–7 % of the 2048 ids per song and
  2.7–3.4 % of the pool, so capacity is no longer a concern for files of this size.
- **Loose deduplication** (same notes, velocities within the tolerance) recovers a little,
  because the humanisation is mostly in the strums (timing) rather than in velocities, and
  strums that cross a step boundary change the notes themselves:

| File | exact | ±4 | ±8 | ±16 |
| --- | ---: | ---: | ---: | ---: |
| renoise-export.mid | 112 | 111 (1 merge) | 110 (2) | 110 (2) |
| Glass Relay.mid | 98 | 97 (3) | 95 (6) | 91 (10) |
| meridian_fault.mid | 137 | 137 (0) | 135 (6) | 132 (13) |
| the_space_between_wires.mid | 117 | 110 (7) | 106 (11) | 104 (13) |

  Rows never merge in these files even in loose mode (a merged block in one track rarely
  lines up with identical blocks in all eight). Every merge is listed in the warnings with
  the row, bar range, block id and the largest velocity difference.

### 14.5 Hardware checklist (Task 02 Step 5, done by the user)

Do this after the Task 03 checklist of section 13.4 (song mode itself works on the device).
Preparation: workbench connected to the device with the project library open (Projects &
sounds); the song editor's target set to "device"; a project with tracks 1–8 on FM6 and SEQ
on; the M8 (or a MIDI monitor) on the device's MIDI out; the four files from tests/fixtures/
at hand: renoise-export.mid (69 bars, 80 BPM, 112 blocks), Glass Relay.mid (66 bars, 110
BPM, 98 blocks), meridian_fault.mid (85 bars, 104 BPM, 137 blocks, 11 parts), and
the_space_between_wires.mid (64 bars, 104 BPM, 117 blocks, 9 parts). Use spare song slots
(for example 13–16) so nothing of yours is replaced.

1. **Import each Renoise file.** Library tab → "Import MIDI file (Classic Tabby)" → choose
   the file. See: the summary line (format 1, 96 ticks per quarter, N tracks, parts, bars,
   tempo), the parts table with every Renoise instrument on channel 1 and its note count and
   range, and in step 4 the row table and the "Dropped or changed" list with only
   `moved`, `lengthRounded` and `overlapClipped` entries (the counts of section 14.4) and,
   for meridian_fault and the_space_between_wires, the parts beyond eight marked "skip".
   Assign the skipped parts to a track or leave them. Nothing is written yet.
2. **Write it to a spare song slot and time the upload.** Step 6: pick the slot, confirm
   the dialog ("Write … to device song N? Existing content … deleted and replaced."), start
   a stopwatch at OK. See: "Writing… NN %" climbing, then the message "Written to device
   song N: record + K block(s) in B batch(es), X bytes, T s; record read back and verified."
   and the plan box listing kind 5 then the kind-7 batches. Expected T (section 13.3
   estimate): about 3.5–11 s for these songs (one or two batches of 10–13 KB plus the
   record); write the measured T next to the file name. Audio dips only in the moment after
   each batch's last chunk.
3. **Audition on FM6.** Device: ACTIONS → SONG MODE, K1 to the slot, PLAY. See: the song's
   name, ROW advancing every 4 bars (64-step rows; the last row shorter), the tempo of the
   file (80 / 110 / 104 BPM) on MIDI clock out. Hear: the Renoise arrangement on FM6, every
   part on its track, chords intact (up to 4 notes per step), sustained pads holding across
   row changes, the song stopping by itself after the last bar with "STOPPED - PLAY STARTS".
4. **Switch the tracks to MIDI out and confirm on the M8.** Set the song's OUT CH per track
   in the importer (step 2 of the panel, for example T1 ch 1 … T8 ch 8), write again (the
   slot is deleted and replaced; time it again), and set the M8 to receive those channels.
   PLAY. See on the M8 / monitor: each track's notes on its channel only, note lengths as
   in Renoise (a 4-step note is 4 sixteenths at the song tempo), velocities as exported,
   Start at the beginning and Stop at the end, no hanging note after the stop. Compare one
   bar against Renoise's pattern editor: the same pitches on the same 16th positions
   (strums snapped to their step, as the warning list said).
5. **Re-import one file to the same slot and check free space after compaction.** Note
   "Storage status" (song editor) before: free F0, reclaimable R0. Write the same file to
   the same slot again. See: the song editor's confirm (or the importer's) warns that the
   old song is deleted first and suggests a `.tabby` export; the message afterwards says
   "(replaced "NAME", deleted first by the workbench)"; status now shows reclaimable ≈ R0 +
   the song's block bytes (the first copy is garbage) and free lower by the second copy. ACTIONS → COMPACT SONG STORAGE on the device, wait for
   "COMPACTING STORAGE..." to clear. See: reclaimable back to R0 and free = F0 (one copy of
   the song in the pool, no leak), and the song still plays through.

## 15. Task 03 — song mode, checkpoint (f) (2026-11-02)

### 15.1 What changed

1. **Factory scenes out.** `app/presets.c` v0.2 keeps only `groove_preset_drum_default()`
   (the 808 kit a sampler track becomes); the sixteen scene recipes, the pattern generator,
   the sixteen demo DX7 voices, `groove_factory_name` / `groove_factory_build` /
   `groove_factory_load` (app/instrument.h, app/project.c) and the FACTORY bank of the HOME
   preset browser (app/screen.c: no bank encoder, "USER PROJECTS" only, the position word's
   bank bit is gone) are removed; `web/engine/Simulator.c` loses `sim_factory_*`; the
   workbench simulator (sdk/Simulator.js, sdk/Update.html.in, sdk/I18n.js) loses the
   factory picker and "export selected preset"; prev / next step through the USER slots of
   the simulated flash. The scenes were exported from the checkpoint (e) build as
   `web/scenes/NN-NAME.fm1` (16 project files, importable through the workbench's project
   import). Found on the way and fixed: a V01 project with a sampler track failed
   validation after the (a) conversion to the 808 kit because the preset kept its "8
   sampler pads" byte; `groove_preset_drum_default` now clears it (host test 6 imports such
   a project for real; the old test built a scene that no longer had a sampler part).
2. **Delete-before-replace in the shared write path.** `Library.songWrite` (sdk/WebUpdate.js)
   checks the slot with a kind-5 download begin and cancel, deletes an occupied slot
   (`songDelete`), then record, batches, read-back; it returns `{record, replaced}`. The
   simulator target (sdk/Simulator.js `song-write`) does the same. The song editor's confirm
   says the old song is deleted first and suggests exporting a `.tabby`; the importer's
   confirm and warning say the same, and its transfer wrapper (web/import/song-transfer.js
   v0.4) no longer deletes on its own. Tests: tests/workbench/song-write.mjs (`make
   workbench-test`, part of `make test`) runs the real `Library.songWrite` against a fake
   device: command sequence for an empty and for an occupied slot, device state after the
   replace, `songDelete`, tempo parse; the importer suite (128 checks) keeps passing with
   its 11c expectations updated; host test 9 covers the device side (a replaced song's old
   blocks reclaimable, one compaction back to one copy).
3. **Tempo range.** `song_record_valid` rejects a tempo override outside 30..300 (0 stays
   the project tempo), like a bad channel or step-length byte; `songRecordParse` (workbench)
   and `decodeRecord` (importer) do the same. Host test 9: 29 and 301 rejected, 30, 300 and
   0 accepted.
4. **Liveness by reference** (assessment 9.4 v0.5.1). Without it, deleting before replacing
   changed nothing for a song whose new blocks use other ids: the moment the new record was
   valid, every old record of that song counted as live again (host test 9 showed exactly
   that before the change). The storage's liveness scan now reads the record's rows after
   building the song's directory and counts only referenced entries (a 256-byte bitmap of
   directory entries). Compaction, the status reply and the batch's free-sector choice use
   it; the directory and playback are unchanged.
5. Hardware checklist 13.4 gains step 12 (timing against the stock sequencer); 14.5 step 5
   wording follows the new confirm and message.

### 15.2 Measured

| Quantity | After (e) | After (f) |
| --- | ---: | ---: |
| App image (limit 453921) | 450980 | **447588** (margin **6333**) |
| Static SRAM | 300340 | 299924 |
| Runtime heap (min 49152) | 223276 | 223692 |

The factory scenes gave back 3392 bytes net (presets.c 2664 → 22, project.c −736, screen.c
−198, song_storage.c +212 for the liveness references and the tempo check); the 4 KB target
of decision 1 is met again with 2237 bytes to spare. Track A and Track B byte-identical
(`make crosscheck`: sdk.elf 099162a9…, .fwsc 2321722b…). `make test`: 112 host checks, the
wasm smoke test and the workbench song-write test pass, no compiler warnings;
`make midi-import-test` 128 checks; `make midi-import-sim` passes on the new wasm. The
rebuilt preview loads in headless Chrome with no console errors, the factory picker gone,
prev / next present, the import panel mounted.

## 16. Task 04 — row events, firmware part (2026-11-02)

### 16.1 What changed

Format: section 9.11 v0.6 (commit 5542841, doc only, committed first).

- `app/song_storage.h` / `.c` v0.5: `struct song_record` now covers the whole 4096-byte
  image (`tail` from 2624); event constants, `song_event_count` / `song_event` accessors;
  `song_record_valid` accepts version 1 or 2 and validates a version-2 table (count,
  table version, reserved bytes, row index and order, per-row cap of 32, data ranges per
  type, 0xFF after the last event); read, write and the staging recovery use the CRC range
  and transaction length of the record's version (20..2623 or 20..4091).
- `app/song.c` / `.h` v0.2: each row buffer carries the row's events (up to 32, gaps
  already converted to blocks) and the stream's lead; the tick streams events under the
  channel owners into router lane 0 and pre-fires the next row's stream `lead` blocks
  before the boundary (by the same landing rules as the row switch: natural next, queued
  jump at the next bar or row end); a row entered with events still pending after the
  boundary tick increments `late`; `song_send_setup` decodes row 0 into buffer 0 while
  stopped and the tick streams it; status gains `late` and `events`.
- `app/midi_router.c`: `groove_midi_song_event(channel, status, a, b)` enqueues a channel
  message under `THRU_OWNER + channel` on all three ports (lane 0).
- `app/screen.c`: ACTIONS "SEND SETUP" (refused while playing: "STOP THE SONG FIRST";
  without a song: "NO SONG LOADED"; else "SETUP SENT - ROW 1 EVENTS"); SONG page line
  "EVENTS n" with "LATE m" in amber when nonzero.
- `app/transfer.c`: command 23 bytes 13 (late, low byte) and 14 (event count, low byte).
- `web/engine/Simulator.c`: `sim_song_send_setup`; `sim_song_status(2)` carries late in its
  high half, `sim_song_status(3)` the event count.
- `tests/host/smoke.c` v0.6, section 10 (36 checks): a three-row song with PC, CC,
  bank+PC, two 250 ms gaps and a CC: every event once per row entry, in order, before the
  row's first note and on its own channel; bank MSB immediately before the PC; the gapped
  events pre-fired so they land at or just before the boundary (87 blocks between bank
  select and the gapped PC); a queued jump fires the target row's events and skips the
  other row's; a jump queued one step before the bar into a gapped row counts as late and
  its gapped event lands after the note; SEND SETUP sends row 1's events while stopped
  with no Start and no notes, and is refused while playing; a version-1 record loads with
  0 events; 293 events, a row index past the row count, unsorted rows, a 0 ms gap, type 4,
  33 events in a row, a stray byte after the table and table version 2 are rejected at the
  write; a flipped byte in the stored table fails the version-2 CRC on load.

### 16.2 Measured

| Quantity | After (f) | After Task 04 firmware |
| --- | ---: | ---: |
| App image (limit 453921) | 447588 | **449252** (margin **4669**) |
| Static SRAM | 299924 | 302580 |
| Runtime heap (min 49152) | 223692 | 221036 |

The firmware part costs 1664 bytes of flash (the Step 1 estimate was 1250: song.c took 1220
instead of 600, the stream scheduler with pre-firing and the per-row decode being larger
than guessed) and 2656 bytes of static SRAM (the record's 1472-byte tail now held in RAM,
the two row buffers' 32-event tables, the stream state). The margin stays above the 2 KB
floor of the task by 2.6 KB and above the 4 KB target of Task 03 as well. Track A and
Track B byte-identical (`make crosscheck`: sdk.elf 832f395b…, .fwsc 544cacc2…). `make test`:
148 host checks (112 + 36), the wasm smoke test and the workbench song-write test pass, no
compiler warnings; `make midi-import-test` 128 checks and `make midi-import-sim` pass on
the new wasm (the importer's version-1 songs are unaffected).

### 16.3 Device setup list for the hardware checklist (from the Step 1 research)

Settings on the gear itself, without which row events do nothing; each device JSON carries
the same text in its `notes`. Sources: docs/tasks/TASK-04-step1-assessment.md section 4.

| Device | Set on the device |
| --- | --- |
| E-MU Proteus/2 XR | Master menu MIDI MODE = Multi; per channel "MIDI ENABLE" on and "PRESET CHANGE" on for every channel a song addresses; "MIDI PROG>PRESET" map: identity for presets 0..127, and an explicit mapping (program → preset 128..383) for any preset above 127, because the Proteus has no bank select; leave the Edit menu (program changes are ignored inside it). The manual asks for setup messages before the song starts, so run SEND SETUP before PLAY. |
| Eventide H90 | System > MIDI: channel (15) or Receive Omni; PC Offset 0 (PC n = Program n as displayed, 1-based) or 1 (PC 0 = Program 1) and the rig profile set to match; the Playlist is the User List the song's program numbers refer to (no bank select exists); CC numbers for bypass / HotSwitch / tap assigned in Global Control and entered in the rig profile; on firmware 1.8.6..1.9.x put the device gap after the program change (a CC with a PC is ignored). |
| Zoom MS-70CDR+ | MENU > USB MIDI CH = 16 (or OMNI) behind the H4MIDI WC filter; USB host powered and connected before the set; patches 001..100 by program change only (no CC, no bank). Checklist item: send PC 0 and PC 1 and note which patch the display shows, to settle the PC base. |
| Waldorf Blofeld | Global: MIDI Channel (or per-part channel in Multi mode with the part's "Prg Change" filter on receive); **Ctrl Receive = on** or no CC changes anything; banks by CC 32 = 0..7 (A..H); Multi selection by CC 0 = 127 + PC only when already in Multi mode (secondary); avoid channel 10 in Multi mode (Waldorf FAQ: crashes). Allow a gap after a program change (secondary: slow program changes). |
| Waldorf Pulse 2 | Global: MIDI Channel; banks by CC 32 = 0..4 (×100 programs; CC 0 ignored; PC clamped to 0..99 inside the bank); no enable switch; program 500 is the random patch. |
| Dirtywave M8 Model:02 | MIDI Settings: track channels (default track n = channel n), **PG CHANGE = on**; program change selects the track's instrument (INST 00..7F, hex); these settings are stored in the song file. |
| Korg volca fm2 | MIDI channel (hold MEMORY at power-on, key 1..16); global 7 "MIDI ShortMessage" = on (factory default). No program change at all: a song can only send its CCs (40..50, 91, 93, 64). |
| Instruo Seashell | MIDI channel in the Seashell Controller app (Settings); no program change in firmware 1.0.x, parameters by MIDI Learn only. |
| M-VAVE FM-1 (Skiff / Melodee / Orange Cat) | Per the firmware loaded; definitions pending (workbench part). |

## 17. Task 04 — row events, workbench part (2026-11-02)

### 17.1 What changed

- `web/devices/*.json` (11): `emu-proteus-2-xr`, `eventide-h90`, `zoom-ms-70cdr-plus`,
  `waldorf-blofeld`, `waldorf-pulse-2`, `dirtywave-m8`, `korg-volca-fm2`,
  `instruo-seashell`, `mvave-fm1-skiff`, `mvave-fm1-melodee`, `mvave-fm1-orange-cat`
  (placeholder). Written by `tools/linux/devices-from-sources.py`: the hand-written facts
  come from the cited manufacturer pages (assessment section 4 plus the Skiff and Melodee
  research: Skiff v2.1.1 receives program changes counted from 0 per engine, no bank
  select, a fixed CC map; Melodee 1.6.1 has no program change handler, CCs only), the
  preset lists are parsed from the manufacturers' own files (Proteus manual text layer
  pp. 92–93: 192 names, 128..191 marked as reachable only through the program map;
  Blofeld 2012 SNDD dumps: 1024 sixteen-character names, Waldorf's programmer code
  included as the device shows it; Pulse 2 preset list: 500 with categories; Zoom patch
  list: 80). Each file lists `sources`, `setup` (what to set on the device) and
  `unverified`.
- `web/rig/device-library.js` v0.1: the `tabby-device/1` validator, `programLabel` /
  `programFromLabel` (0- or 1-based display, letter banks, hundreds, hex), `bankBytes` /
  `bankFromBytes` (CC 0 / CC 32 schemes), preset, controller and value-meaning lookups.
- `web/rig/rig.js` v0.1: the `tabby-rig/1` profile (16 channels: device, name, gap
  override, user program names), localStorage persistence, export / import, `applyGaps`
  (type-3 gap events after a program change, or between bank select and program change
  with the bank+program event split into CC 0 / CC 32 events), `describe` for the editor.
- `web/rig/rig-ui.js` v0.1: the rig setup table (device select from the library, name, gap,
  numbering note, "Names…" for user-named programs, export / import / reset) and the row
  event editor (row selector with counts, the row's events with device and preset names
  and raw numbers, move / delete, an add form driven by the device on the chosen channel:
  preset list, bank list, named controllers with value meanings, raw fields always; a
  checkbox for the per-song rig copy).
- `sdk/WebUpdate.js`: `songRecordParse` / `songRecordBuild` read and write version-2
  records (`song.events`, validated as the device does; a song without events stays
  version 1), `tabbyFile` / `readTabbyFile` carry the `TRIG` trailer, `songStatus` reads
  bytes 13..14 (late, events). `sdk/Simulator.js`: the simulator's status carries late and
  events. `sdk/Update.html.in`: the rig group before the song mode group, the events panel
  under the row table, the mount, the write / export paths applying the rig's gaps, the
  import path reading the trailer, the status message. `sdk/I18n.js`: 3 entries.
  `tools/linux/build-web.py`: placeholders `/*FM1_DEVICES*/` (the JSON files as one array)
  and `/*FM1_RIG_SCRIPT*/`. `sdk/manifest.json` re-pinned.
- Importer: `web/import/song-format.js` v0.4 (events in the model, version-2 encode and
  decode with the device's rules, `validateEvents`, the `.tabby` trailer with `song.rig`,
  JSON round trip), `web/import/midi-song.js` v0.4 (every CC and PC collected in file
  order; the window rule with the pre-roll option; bank CCs merged into a bank+program
  event; rows with events never merged into repeats; `rowEvents`, `bankWithoutProgram` and
  the reworded `programIgnored` / `ccIgnored` warnings), `web/import/import-ui.js` v0.6
  (pre-roll select, an Events column in the row table, the count in the statistics).
- Tests: `tests/workbench/devices.mjs` (38 checks: every file validates and cites sources;
  Proteus 0-based "007" = Arco Violas and the map-only presets; Blofeld "B001" = bank 1 PC
  0 by CC 32; Pulse 2 "102" = bank 1 PC 1 and "500" = RANDOM; H90 1-based; Zoom base marked
  unverified; M8 hex; value meanings; a broken definition refused), part of
  `make workbench-test`; `tests/midi-import/run.mjs` v0.5 section 13 (the `row-events.mid`
  fixture: PC, CC and bank+PC at row 1, a pre-rolled PC and a PC at row 2, a mid-row CC and
  a lone bank select dropped; pre-roll none / bar; the version-2 record bytes; decode
  rejection of an unsorted table and of type 4; the trailer and JSON round trips; 140
  checks in all); `tests/workbench/row-events-sim.mjs` (`make midi-import-sim`): a
  three-row song with a program change and a control change per row, built with the
  workbench's own record builder, played through the wasm: Start, then each row's PC and
  CC on its channel immediately before the row's note, bank LSB before the PC, every
  event once, nothing stray, Stop last, 0 late; plus the rig's gap generation and the
  Blofeld vocabulary ("B010" with its factory name, "CC 7 Channel Volume").

### 17.2 Measured

No firmware change in this part (margin stays 4669, section 16.2). `make test` (148 host
checks, wasm smoke, workbench song-write and device tests), `make midi-import-test` (140)
and `make midi-import-sim` (Renoise song and row-event song) pass. The rebuilt preview
loads in headless Chrome with no console errors, the rig table with the eleven devices,
the events panel (hidden until a song is in the editor), the importer's pre-roll option
and the eleven definitions inlined.

### 17.3 Hardware checklist for Task 04

Do the device setup list of section 16.3 first (Proteus/2 XR MIDI mode Multi, per-channel
MIDI ENABLE and PRESET CHANGE, the program map for presets above 127; H90 channel 15 and
PC Offset; Zoom USB MIDI CH 16 behind the H4MIDI WC; Blofeld Ctrl Receive on; M8 PG CHANGE
on; Pulse 2 channel; volca fm2 ShortMessage on; Seashell channel in its app). Then, in the
workbench, Library tab → "Rig setup": put each device on its channel, set the gaps you want
(H90: after the program change if its firmware is below 1.13.2), export the profile once.

1. **SEND SETUP changes every device to its row-1 preset.** Build a song (song editor or
   the importer) with row 1 events: a Proteus/2 XR program (name from the list), an H90
   Program number, a Zoom patch, a Blofeld "A001"-style program (bank by CC 32), a Pulse 2
   program 101..200 (bank 1), an M8 instrument, and a CC for the volca fm2 (for example CC
   48 algorithm). Write it to a spare slot. Device: ACTIONS → SEND SETUP. See on the SONG
   page "SETUP SENT - ROW 1 EVENTS" and the line "EVENTS n". See on the gear: every device
   shows the preset you named, the volca's algorithm changed, the Zoom shows the patch
   number (note which PC base matched: the definition assumes PC 0 = patch 001, marked
   unverified; if patch 002 appears, set displayBase 0 in web/devices/zoom-ms-70cdr-plus.json
   or correct the event numbers). Nothing on channels the song does not address.
2. **Row changes switch the Proteus/2 part, the H90 program and the Zoom patch at the bar
   line.** Three rows of 16 steps with notes on tracks routed to the Proteus (channel per
   part), the H90's channel and the Zoom's channel, and a different program for each on
   every row. PLAY. See: each device changes at the row boundary; on a MIDI monitor the
   program changes (and the H90's CC, if any) arrive before the row's first note-on, in the
   row's event order, bank select before the program change; "LATE" stays absent on the
   SONG page. Hear: the new sound from the first note of the row, no note of the previous
   row cut short, no glitch at the change (a Blofeld program change on a sustained note
   may retrigger: that is the device, not the sequencer).
3. **The Zoom reacts on channel 16 only.** Add a row event with the same program number on
   channel 15 (the H90's) and on channel 16: at the row change the Zoom changes only once
   (the channel-16 event). Send a program change on channel 1 from the workbench song
   (a row event addressed to channel 1): the Zoom does not react. If USB MIDI CH is OMNI it
   reacts to all: set it to 16.
4. **Nothing glitches or drops notes at the change.** The three-row song with dense
   chords on FM6 and on the external synths at 120 BPM and again at 240 BPM: every note of
   the row after a change sounds (count the first bar on the monitor against the block),
   FM6 does not click, the device's audio continues, and "ROW DECODE LATE" never shows.
   Then with gaps: set a 50 ms gap on the Blofeld's channel in the rig, write again: on
   the monitor the Blofeld's program change arrives about 50 ms before the row's first
   note (pre-fired), the note-on still on the bar line; "LATE" stays 0. Queue a jump to a
   row with gaps one step before the bar: "LATE 1" appears once and the gapped program
   change lands just after the bar (the known limit).
5. **Importer round trip.** Export a `.mid` from Renoise with program changes at bar starts
   (one bar before the section where possible) and a CC at a bar start, import it: the
   "Dropped or changed" list shows "rowEvents" with each converted event and lists the
   mid-bar ones as dropped; the row table's Events column shows them; write the song and
   confirm the gear changes as in step 2.

## 18. Task 05 — Timed notes: exact start offsets and lengths (2026-11-04)

Spec side: SPEC.md section 9. Formats: docs/tasks/TASK-03-step1-assessment.md section 9
v0.7 (9.12) and docs/TIMED-NOTE.md. Assessment and decisions: docs/tasks/
TASK-05-step1-assessment.md. Commits: section 9 v0.7 alone first, then (a) the module,
(b) firmware and host tests, (c) workbench, importer, tests and docs.

### 18.1 What was built

- **Timed note module** (a): app/timed_note.h/.c (no dependency beyond stdint; the device
  links decode and the field unpack only), web/timed-note/timed-note.js (classic script and
  CommonJS), tests/timed-note/vectors.txt generated by tests/timed-note/make-vectors.py (an
  independent Python encoder written from docs/TIMED-NOTE.md: 61 ok, 14 bad, 8 badfields,
  20 round vectors), tests/host/timed_note_test.c and tests/timed-note/run.mjs
  (`make timed-note-test`, 804 / 806 checks, in `make test`).
- **Storage** (b): app/song_storage.c v0.6: block record byte 1 = payload format, payloads
  up to 1600 bytes, `song_payload_valid(format, ...)` (format 1 through
  `timed_note_decode`), `song_payload_upgrade` (v1 → v2 in place, from the end), song flags
  bit 2 allowed, `song_block_read` returns the format, `song_block_append` takes it.
- **Sequencer** (b): app/song.c v0.3, described in SPEC.md 9.3: unit position with the exact
  advance `tempo × 1024 / 11025` per block and a carried remainder, the window scheduler
  (actions sorted by time, note-offs before note-ons), per-block swing through `warp()`, the
  look-ahead for negative offsets with the LATE counter, probability rolled once per track,
  step and pass through a one-entry cache (no 64-bit masks), row-event pre-fire one block
  earlier, all song notes in router lane 0 (app/midi_router.c). The first block after PLAY
  advances at the song's tempo override (the caller had read `song_tempo()` before
  `playing` was set; the one-block error of tabby-v02.0 became a permanent 4-unit offset
  under the exact clock and was fixed).
- **Transfer** (b): app/transfer.c: kind 6 uploads are format 1, downloads upgrade a stored
  v1 block; capability byte bit 4 "timed notes".
- **Simulator** (b): web/engine/Simulator.c: `sim_midi_drain(1)` drains the MIDI lanes every
  block (the timing tests measure the sequencer and not the 10 ms control poll; off by
  default), `sim_block_write2` (format argument), `sim_block_read` returns the upgraded
  payload as the device's kind-6 download does, `sim_sequence_setting_edit` (swing),
  `sim_song_units` (the position, test builds only: `song_test_position` under
  FM1_HOST_TEST / FM1_OPEN_WEB).
- **Workbench** (c): web/import/song-format.js v0.5 (model tabby-song/2, format 1 encode,
  format 0 and 1 decode, swing flag, quantize helpers, JSON upgrade), midi-song.js v0.5
  (exact conversion, quantize option, PPQ rounding report), import-ui.js v0.7 (Quantize
  select, statistics), song-transfer.js v0.5; sdk/WebUpdate.js (payload format 1 parse and
  build, v1 parse for `.tabby` files, step text with `/offset`, record flags bit 2,
  `timedNotes` capability, kind-6 limit 1600), sdk/Simulator.js (format byte),
  sdk/Update.html.in (swing checkbox, step marks, note inspector, quantize buttons),
  sdk/I18n.js (9 strings), tools/linux/build-web.py (the module inlined first in the
  importer bundle); sdk/manifest.json re-pinned.

### 18.2 Measured figures

Built with Track B (`make firmware`), byte-identical to Track A under the machine lock
(`flock /tmp/oc-suite.lock systemd-run --user --scope -p MemoryMax=12G -- make crosscheck`).
FLASH-BUDGET.md section 11 has the table; the app image is 451364 bytes (+2112), margin
2557 bytes to the 453921-byte packaging limit (the task's floor of 2 KB holds with 509
to spare), static SRAM 319252 bytes (+16672: the row buffers with 25-byte cells, the
1600-byte payload buffer, the sounding table in units, the action list and the
probability cache), runtime heap 204364 bytes (minimum 49152).

### 18.3 Timing results (simulator, per-block drain)

tests/midi-import/simulator.mjs v0.2 on renoise-export.mid (18 rows, 112 blocks, 1152
steps, 80 BPM, 1002 notes, 193 with offsets, 151 fractional lengths):

| Check | Result |
| --- | --- |
| Note-ons, time computed from the file, `sim_midi_drain(1)` | all 1002 in the predicted block: **largest error 0 blocks** (range 0..0) |
| Note-offs (start + length; the 22 same-pitch overlap clips follow the model, as reported) | largest error 0 blocks |
| Same run under the simulator's stock 10 ms control poll (reported, not checked) | note-ons 0..3 blocks late (mean 1.0), note-offs 0..3: the poll period, as in 14.2 |
| Underruns / late | 0 / 0; FM6 audible (RMS 0.13); nothing on another channel |

Host (tests/host/smoke.c section 11, 120 BPM, per-block drain): offsets +1, −1, +240 and
−240 units each play in the predicted block (exact equality); two notes 12 units (3.1 ms)
apart leave in order one block apart as predicted; a −120-unit note on row 2's first
step plays 11 blocks before the boundary and ends 480 units after its own start; a jump
queued 9 blocks before the bar makes that note play at the boundary with LATE = 1; long
notes across row changes, jumps and a stop while they sound leave nothing stuck; ten
minutes at 120 BPM (206719 blocks): 301 note-ons, every one in its predicted block, drift
0. Section 12: the v1 reference song (tests/host/v1_reference.inc, captured from the
tabby-v02.0 simulator with the lanes drained every block) plays note for note the same
with swing 0 and swing 25: all 151 messages matched within one block (the order inside a
block differs because tabby-v02.0 interleaved two router lanes), per pitch the same
note-on / note-off sequence.

### 18.4 Importer results

`make midi-import-test` (167 checks): the four Renoise exports (96 PPQ) import with every
note start and length exact apart from the reported same-pitch overlap clips (Glass Relay
1617 notes, 1 clip; meridian_fault 1532, 1; renoise-export 1002, 22; the_space_between_wires
1300, 91); kick-nudge.mid keeps the kick's −12 units (3 ticks, 3.1 ms at 120 BPM) on the
bass note's step and the late bass note's +20 units and 2-step-7-tick length; ppq-120,
ppq-480 and ppq-960 convert exactly (80-unit offsets, 720-unit lengths); ppq-100 reports
its rounding (every start within half a unit, every length within one unit); the quantize
option reproduces the Task 02 behaviour (4 moved starts and 1 minimum length reported);
tabby-song/1 JSON and format-0 `.tabby` records load upgraded; the swing flag round-trips.

### 18.5 Hardware checklist (Task 05)

1. **Install and old songs.** Install the build; load a song written by tabby-v02.0 (v1
   blocks) and play it: it must sound as before, project swing included (SEQ page swing
   above 0 swings it). Then rewrite the same song from the workbench (it becomes format 1,
   swing flag off) and confirm it now plays straight whatever the project swing; tick the
   song's "swing follows the project setting" box, rewrite, and confirm it swings again.
2. **Nudged kick.** In Renoise (or any DAW) make a kick 3 ms ahead of a bass note on the same
   step, export `.mid` (96 or 480 PPQ), import with Quantize off (the statistics show "1
   with offsets"), write it, play it to the M8 with a timestamped MIDI monitor (MIDI-OX,
   Pocket MIDI, Protokol) on the same cable: read the kick-to-bass gap on every bar. Expected:
   the file's gap within one block (2.9 ms) plus the control-loop band of 13.4 step 12,
   consistently early. Compare against the same file played from Renoise through the same
   monitor.
3. **Ordering.** Two notes 3 ms apart on different tracks (the kick-nudge fixture: drums on
   channel 10, bass on 1): the monitor shows them in file order every time.
4. **The four Renoise songs.** Import each with Quantize off, write, play on the M8 by ear
   against Renoise: the delay-column feel (hats and snares pushed by one tick) must match.
5. **Row boundary.** A song whose second row starts with a note 20 units early (edit it in
   the inspector: offset −20): it sounds before the bar line; "LATE" stays 0. Queue a jump to
   such a row within the last half step before the bar: the note lands on the bar and "LATE"
   shows 1.
6. **Editor.** Load a block, click a step with an offset: the inspector shows the fraction
   and the milliseconds at the song's tempo; change the offset by ±1 and the ms read-out
   follows; "Quantize starts to 16ths" clears the orange marks; "Save block" then "Write
   song" and the device plays the quantized version.
7. **Timing band.** Repeat 13.4 step 12 (song mode against the stock sequencer with a
   timestamped monitor): the device's control-loop band is the number the simulator cannot
   give; record it in this section.

## 19. Task 06 — Independent track launching (2026-11-04)

Task text: docs/tasks/TASK-06-track-launching.md; assessment (approved):
docs/tasks/TASK-06-step1-assessment.md; spec: SPEC.md section 10.

### 19.1 Checkpoint (a): BLE and NAME pages removed, Bluetooth settings in the workbench

What changed:

- **app/screen.c**: `draw_ble`, `radio_line`, `ble_control`, `name_draw`, the BLE state
  (device list, view, action, forget, stage timer) and the NAME control branch are gone;
  HOME+GLO, EDIT+REC, ACTIONS "DX7 PATCH NAME" / "BLUETOOTH / CLOCK" and the BT button no
  longer open a page (the BT button announces "BLUETOOTH: SET IN WORKBENCH"; the ACTIONS
  entries after them moved up two: 17 STOP ALL, 18 ERASE, 19 SONG MODE, 20 COMPACT, 21 SEND
  SETUP). `groove_screen_open` rejects pages 7 and 9 like the pages removed in Task 03 (b);
  page numbers do not shift. The BLE link-loss watch (`ble_was_linked` → `retry_reset`) and
  the clock source on SEQ page 5/7 stay. `edit_character` stays for project names.
- **app/transfer.c**: command 24: n = 0 reads {flags, role} (flags bit 0 radio on, bit 1
  Bluetooth audio, bit 2 MIDI always set; role 0 DEVICE, 1 HOST), n = 2 writes them through
  `groove_settings_radio` (applied and saved as the page did), n = 1 with 0x7f forgets the
  BLE MIDI pairs (`fm1_ble_forget_bonds`; the simulator answers "not ready"). Command 22
  reply byte 8 = 63 (bit 5).
- **tools/linux/build.py v0.4**: `fm1_ble_scan / connect / disconnect / get_device` and
  `fm1_bluetooth_get_status` left the required-symbol list: nothing references them now and
  the linker drops them (that is part of the saving). The sdp / gatt discovery check stays.
- **Workbench**: sdk/WebUpdate.js `radioRead / radioWrite / radioForget` (command 24) and
  `radioSettings` (capability bit 5); the capability mask `~15` → `~63` (**Task 05 bug**: a
  device replying 31 was refused at connect with "设备扩展能力回复无效"; the simulator path
  never hit it). sdk/Update.html.in: "蓝牙设置" group in the Library tab (hidden when the
  device lacks bit 5), read on every library refresh, written on every change, "清除 MIDI
  配对" with a confirm; the simulator shortcuts "DX7 音色改名" (page 9) and "连接设置预览"
  (page 7) removed; manual chapters 02, 03, 04 and 08 updated. sdk/I18n.js: strings
  replaced and added. sdk/manifest.json re-pinned.

Measured (Track B, crosscheck IDENTICAL, FLASH-BUDGET.md section 12):

| Quantity | After Task 05 | After (a) | Change |
| --- | ---: | ---: | ---: |
| App image | 451364 | **447140** | **−4224** |
| Margin to the 453921-byte limit | 2557 | **6781** | +4224 |
| screen.c | 34570 | 30896 | −3674 (functions −2070, string pool −772, controls and dispatch −832) |
| libfm1_engine.a | 364647 | 364060 | −587 (BLE client wrappers and Bluetooth status dropped) |
| transfer.c | 3164 | 3252 | +88 (command 24) |
| project.c | 5844 | 5794 | −50 (inlined callers gone) |
| Static SRAM | 319252 | 318932 | −320 |

The assessment estimated ≈ 2850 for the two pages; the library's unreferenced wrappers
and the shorter string pool made it 4224. The Task 06 code (estimate +3100) now fits with
≈ 3.7 KB to spare; EFFECTS stays the reserve.

Checks: host smoke 193, web smoke, workbench tests, importer suite 167, simulator check,
headless Chrome preview (no console errors; the Bluetooth group is in the DOM, the two page
buttons are not).

Hardware checklist additions (for the Step 4 list): with the library connected, open
"Bluetooth settings", switch Bluetooth off, reconnect the library and confirm the box
reads off after a power cycle; switch it back on; press the BT button on the device and
read the notice.

### 19.2 Checkpoint (b): per-track playheads in firmware

What changed (section 9.13 of docs/tasks/TASK-03-step1-assessment.md has the behaviour):

- **app/song.c v0.4** (rewritten): `master` (units since PLAY) and `acc` replace the
  frame-relative position; `tbuf[8][2]` (one decoded block per track and buffer, with the
  track's event slice, row, purpose, look-ahead coverage, ready flag) and `rowset[2]` (the
  song playhead's row: step length, repeat, loop flag, the whole event list) replace the two
  row buffers; `tr[8]` holds each track's frame (start, length, buffer, state, pass,
  waiting, launched row); `queue_kind / queue_row` carry the per-track queues; `plan[8]`
  is the tick's per-track boundary, what happens there and the buffer that follows. The
  tick: late adoption of buffers that became ready, note-offs due, the song playhead's
  switch as an action, per track the current frame's scan up to its boundary, the switch
  action (loop or queue landing), the next frame's scan and look-ahead, per-track stream
  pre-fire; then the sorted actions (`song_switch`, `track_switch`, `note_on`, note-offs).
  Nine event streams (the song's row list, one slice per track). Control task:
  `wanted()` decides what each track's free buffer must hold, `decode_track` reads one
  block and the channel slice (`slice_events`, gaps by their channel bits), `decode_rowinfo`
  the row and the whole list; `song_track_launch / stop / attach / attach_all`;
  `song_queue_jump` clears the per-track queues; `song_status_read` fills the per-track
  fields, the bar and `song_over`.
- **app/song.h v0.3**: the status fields, the state and queue enums, the API.
- **app/midi_router.c**: `groove_midi_song_track_channel` (the resolved output channel, for
  the slices). **app/transfer.c**: command 23 bytes 15..30. **web/engine/Simulator.c**:
  `sim_song_track`, `sim_song_track_status`, `sim_song_status(4)`; `sim_song_units` now
  returns the master position.
- **tools/linux/build.py v0.5**: app/song.c, app/song_storage.c and app/timed_note.c compile
  at -Oz (at -O2 the first build of the new song.c cost +4000 bytes: the eight-track loops
  unrolled; at -Oz the same source costs +1888 and song_storage.c shrank by 766).
- **tests/host/smoke.c v0.8**: section 13 (65 checks, `-DLAUNCH_DEBUG` traces the clock and
  every message): songs E (three rows with a 48-step row, events with a gapped program
  change on track 3's channel and a pedal channel), G (one row, no loop) and F (8 rows × 8
  tracks, block 20 + i holds note 60 + i on step i).

Measured (Track B, crosscheck IDENTICAL, FLASH-BUDGET.md section 13):

| Quantity | After (a) | After (b) | Change |
| --- | ---: | ---: | ---: |
| App image | 447140 | **449028** | **+1888** |
| Margin to the 453921-byte limit | 6781 | **4893** | −1888 |
| app/song.c (post-LTO) | 4662 | 7396 | +2734 (of which SRAM audio code +2272) |
| app/song_storage.c | 5972 | 5206 | −766 (-Oz) |
| app/transfer.c | 3252 | 3288 | +36 |
| app/midi_router.c | 4257 | 4271 | +14 |
| Static SRAM | 318932 | 323764 | +4832 (tbuf 27872 against the old 25896, rowset 276, actions 1280 against 1024, plan / tr / streams, the audio code) |
| Runtime heap (minimum 49152) | 204684 | 199852 | −4832 |

Host results worth knowing: a launch queued in bar 0 lands at bar 1 with its program change
7 blocks (20 ms) before the downbeat; the other tracks' notes, the bar count and the MIDI
clock are untouched; the 48-step pattern against 16-step rows holds for 64 bars (21 and
1024 notes, every one in its predicted block); eight launches at one bar play all eight
downbeats on time; a press one block before the bar enters the pattern at the next control
poll with its downbeat skipped and counted late (the window is one control poll, 10 ms in
the simulator); nothing is left sounding after stops, jumps, the song end or PLAY.

Pending for (c) and (d): the TRACK LAUNCH page, pad LEDs, SCL / ENV routing; the rig's lead
before bar, the song editor's pattern view, the simulator's scripted 32-bar performance.

### 19.3 Checkpoint (c): the TRACK LAUNCH page, pad LEDs, SCL / ENV routing

Control layout as approved (assessment section 5.2):

| Control | SONG page (unchanged) | TRACK LAUNCH page (page 20) |
| --- | --- | --- |
| Pads 1-16 | queue a scene jump to row (page × 16 + pad) | the selected track's pattern (page × 16 + pad): launch at the next bar; the pad of the playing pattern queues a stop; an empty pad announces "NO PATTERN ON THIS PAD" |
| OCT DOWN / UP | pad page | pad page (shared) |
| SHIFT + pads 1-8 / 9-16 | track select / mute (every page) | the same; the pads show the eight tracks' states while SHIFT is held |
| SCL | to TRACK LAUNCH | to SONG; the SCL lamp is lit on TRACK LAUNCH |
| ENV | back to song, selected track | the same |
| SHIFT + ENV (LFO) | back to song, all tracks | the same |
| PLAY | start / stop the song | the same |
| HOME | OVERVIEW | OVERVIEW |

Implementation: `TRACK_LAUNCH` in the page enum (20; `groove_screen_open` accepts it, the
song is loaded on entry as for SONG), `navigation_mode` routes the pads as keys, the draw
block in `draw_page_body` (its cache signature takes the song status, the track, the pad
page and the flash phase), the control block after the SONG block, the SCL / ENV / LFO
intercept before the generic button block (song pages only), the SCL lamp in the button
LED word, `smk37_screen_launch_color` (one status snapshot per control read, taken on pad
0) called first from `smk37_pad_color`. The pad colour of a track under SHIFT is the track's
RGB565 colour scaled to three levels. web/engine/Simulator.c exports `sim_pad_color`;
sdk/Update.html.in has the page-20 shortcut; sdk/manifest.json re-pinned.

Measured (Track B, crosscheck IDENTICAL, FLASH-BUDGET.md section 14):

| Quantity | After (b) | After (c) | Change |
| --- | ---: | ---: | ---: |
| App image | 449028 | **451396** | **+2368** |
| Margin to the 453921-byte limit | 4893 | **2525** | −2368 |
| app/screen.c | 30896 | 32975 | +2079 (`apply_controls` 6102 → 6500, `smk37_screen_launch_color` 340, the draw block and its strings) |
| app/song.c | 7396 | 7604 | +208 (the launch API now referenced by the device build; the back-to-song fix below) |
| app/samples.c | 1226 | 1298 | +72 (inlining) |
| app/smk37_controls.c | 2615 | 2629 | +14 |
| Static SRAM | 323764 | 323796 | +32 |

The assessment estimated ≈ 1450 for this checkpoint; the page's text and the three-level
pad colours cost more. The floor of 2 KB holds (2525) and checkpoint (d) adds no firmware,
so the EFFECTS page stays.

A sequencer fault found by the scripted performance check (tests/workbench/launch-sim.mjs,
written for (d) and run here first) and fixed in this checkpoint: a track sent back to the
song on a bar where the song also changed rows adopted the old row's block (its buffer had
been decoded for the row current when the press came) and kept it until the next row. Now
the control task decodes, for "back to song", the row the song will be in at the landing bar
(the next row when the current one ends exactly there), the tick plans the same, and, as a
safety net, a following track whose playing buffer is not the song's row adopts the right
buffer as soon as it is decoded (in phase, counted late). The check: 591 of 591 predicted
note-ons within one block (worst error 0), nothing beyond the model, every note-on with its
note-off, Start once and Stop once.

Checks: host smoke 258, web smoke, the performance check (32 checks), headless Chrome
preview (no console errors, shortcut 20 present). The page's behaviour on the device is in
the Step 4 checklist (19.5).

### 19.4 Checkpoint (d): workbench

- **web/rig/rig.js v0.2**: `leadMs` per channel (0..255, default 0; `rigNormalize` reads a
  profile without it as 0), `leadFor`, and in `applyGaps` the trailing gap: after the
  channel's last program event of a row a gap of max(lead, the device's gap after the
  program) on that channel, kept by the final filter (other trailing gaps are dropped as
  before). **web/rig/rig-ui.js v0.2**: the "Lead ms" column with its help text.
- **sdk/Update.html.in**: the song-mode help explains track launching; the rows table is
  labelled "rows = patterns"; `#song-patterns` lists each track's pattern numbers after the
  table; the storage status line appends every track's state, pattern and pending queue.
  **sdk/Simulator.js**: the `song-status` reply carries the eight track words
  (`sim_song_track_status`). **sdk/I18n.js**: three strings. sdk/manifest.json re-pinned.
- **tests/workbench/rig-lead.mjs** (9 checks, in `workbench-test`): profile round trip and
  clamping, the trailing lead gap after a program change, the larger of lead and device gap
  on a Blofeld bank + program, a lead gap kept at the row end, a channel without lead
  losing its trailing gap as before. **tests/workbench/launch-sim.mjs** (in
  `midi-import-sim`, section 19.3).
- Checks: `make workbench-test` (song-write, devices, transfer-radio, rig-lead),
  `make midi-import-sim` (Renoise timing, row events, the performance), `make
  midi-import-test` 167, headless Chrome preview (no console errors; the pattern list, the
  Lead column and shortcut 20 in the DOM). No firmware change.

### 19.5 Hardware checklist (Task 06 Step 4, for the user)

Device with the M8 and a timestamped MIDI monitor on the wired MIDI out; a song with at
least three rows and blocks on several tracks (the Renoise export of 18.4 works), uploaded
from the workbench; the rig with the Blofeld's channel given a Lead ms (say 30) and the
song written again so the gaps are in the record.

1. **Bluetooth settings** (19.1): with the library connected, open "Bluetooth settings",
   switch Bluetooth off, write, power-cycle, reconnect: the box reads off; switch it back on.
   Press the device's BT button: "BLUETOOTH: SET IN WORKBENCH".
2. **Page switch.** ACTIONS → SONG MODE, PLAY. Press SCL: the TRACK LAUNCH page, the SCL
   lamp lit, eight columns FOLLOW with the row's pattern numbers, the bar counter running.
   SCL again returns to the SONG page.
3. **Launch while the others play.** On TRACK LAUNCH, SHIFT + pad 3 selects track 3; the
   pads show its patterns (dim white), the playing one green. Press another pattern's pad:
   it flashes green on the eighth notes, the column shows "Q n"; at the next bar it turns
   steady green, the old one dim, the column "PLAY n". On the monitor: track 3's program
   change `Lead` ms before the bar (when its channel has one), the new pattern's first note
   on the bar, drums and bass unbroken, the M8 still locked (clock and SPP untouched).
4. **Stop and restart.** Press the green pad: it flashes red, the column ">STOP"; at the bar
   every note of that track gets its note-off (monitor: no hanging note on the synth), the
   column "STOP". Press a pad: the pattern starts at the next bar.
5. **Two presses before the bar**: press pattern 2 then pattern 3 inside one bar: only 3
   starts.
6. **Polymeter.** Launch a 48-step row's pattern on one track while a 16-step row plays on
   another; over a minute the long pattern's downbeat falls on every third bar of the
   short one.
7. **All eight.** SHIFT + pad t, pad n for each track inside one bar (eight presses); at the
   bar all eight start; every column "PLAY".
8. **Scene jump.** On the SONG page press a row pad while tracks are launched: at the
   landing every column reads FOLLOW with that row's patterns, the detached tracks' notes
   released at the landing (monitor), pedals' program changes sent.
9. **Back to song.** Launch a pattern on track 2, press ENV: the column ">SONG" then
   FOLLOW at the next bar with the song's current row; SHIFT+ENV with several tracks
   launched returns them all.
10. **Song end with detached tracks.** A song without loop: launch one track, let the last
    row end: the following tracks go silent ("SONG OVER" on the page), the launched one
    loops, the M8 stays locked (clock running); stop the track with its pad: silence, still
    running; PLAY: Stop sent.
11. **Late press.** Press a pad a hair before the bar: either the pattern starts on the bar
    or (inside the control-loop window) LATE counts up and the pattern enters in phase at
    the next bar with its downbeat skipped.
12. *(Moved to 24.6 step 3, L.7, on 2026-11-07.)* **Pad colours** (assessment 5.3) judged by eye: playing, queued, pending stop, a
    pattern, empty, and the SHIFT view of the eight tracks; report what to change.
13. *(Superseded by 24.6 step 3, L.1/L.2, on 2026-11-07; the launch mix of this step is still
    wanted.)* **Timing band.** As 13.4 step 12 with launches in the mix: note the device's
    control-loop band here.

### 19.6 Results for the Task 06 final report

| Quantity | Before Task 06 | After (a) | After (b) | After (c) = final |
| --- | ---: | ---: | ---: | ---: |
| App image | 451364 | 447140 | 449028 | **451396** |
| Margin to 453921 | 2557 | 6781 | 4893 | **2525** |
| Static SRAM | 319252 | 318932 | 323764 | **323796** |
| Runtime heap | 204364 | 204684 | 199852 | **199820** |

Simulator timing: the scripted 32-bar performance (launches, stops, a scene jump, back to
song): 591 predicted note-ons, all within one block, worst error 0, nothing beyond the
model; the Renoise export (18.3) unchanged: largest error 0 blocks. Host: 258 checks, of
which 65 for launching (section 13). The device's control-loop band is the number the
simulator cannot give (19.5 step 13).


## 20. Task 07 — Faster development checks (2026-11-04)

Branch `classic-tabby/dev-checks` (worktree `firmware-devchecks`), rebased onto linux-build
8114114 (tabby-v03.0). Task text: docs/tasks/TASK-07-dev-checks.md; the measurement series:
docs/tasks/TASK-07-step1-assessment.md; the page that documents every target and the rules:
docs/DEV_CHECKS.md.

### 20.1 What changed

- `tools/linux/build.py` v0.6: `--check-only` (the 16 app units through the native JieLi clang
  with the build's exact per-unit options and `-fsyntax-only`, into build/check/<model>/; no
  identity unit, no link, no package; build/<model>/ untouched) and the compile database written
  twice on every build and check: `compile_commands.json` as before, and
  `compile_commands.host.json` with the pi32v2-only flags removed and a host clang named, for
  cppcheck, clang-tidy and clangd (a copy at build/compile_commands.json). `invalidate_outputs`
  is the former inline block, moved unchanged so the check can skip it.
- `tools/linux/lint.sh` (new): host gcc `-Wall -Wextra` on the 36 host test sources one file at a
  time (the Makefile's suppressions off except `-Wno-attributes`), the target clang with
  `-Wall -Wextra` over the 16 units, optional cppcheck and clang-tidy; counts by file and kind;
  exit 1 only when a file does not compile.
- `tools/linux/timed.sh` (new): one line per command of every target into build/profile.txt.
- `tools/linux/crosscheck-compare.sh` (new): the comparison loop out of the Makefile, unchanged.
- Makefile v0.10: `check`, `lint`, `host-sanitize`, `test-fast`, `suite`, `profile`; the host test
  build compiles one object per source into build/host/obj/ with `-MMD -MP` depfiles (a header
  edit rebuilds exactly the units that include it; before, only the .c files were prerequisites,
  so a warm `make test` after a header edit tested stale code), `JOBS=2`; the sanitizer objects in
  build/host-san/; `nice -n 19` on single builds; the lock wrapper: `firmware-ref`, `crosscheck`,
  `host-sanitize` and `suite` run their `-run` twin in a sub-make under
  `flock /tmp/tabby-suite.lock systemd-run --user --scope -p MemoryMax=4G`, directly when already
  inside (`TABBY_LOCKED=1`). The flags of every compile and the link lines are unchanged.
- Not changed: the firmware targets still rewrite build/official-web/<model>/SMK37-Open-Source.html
  with a placeholder (Build.ps1's invalidation, kept; documented as a trap in DEV_CHECKS.md).
  app/, sdk/, web/ and tests/ untouched.

### 20.2 Measured

Rebased head, 2026-11-04, load 5 to 7 (an Orange Cat sanitizer suite and Session A beside); the
quiet-machine numbers are Step 1's (load 2 to 3):

| target | quiet | loaded |
|---|---|---|
| make check | 2 s | 3 s |
| make lint | 2.5 s | 4 s |
| make lint LINT="--cppcheck --tidy" | +15 s, +55 s | +17 s, +116 s |
| make test-fast | 20 s cold, 3 s warm | 30 s cold, 4 s warm |
| make host-sanitize | 27 s cold, 1 s warm | 85 s cold |
| make firmware-ref (Wine) | 13 s | 53 to 130 s |
| make suite | about 75 s cold | 3 min 24 s cold |

Warnings: 0 in every build as before; the lint's counts are in the left-to-build list above.
Sanitizers: 0 findings. `make suite` green at 50bb537 (the rebased Step 2 head).

### 20.3 The gate

linux-build 8114114 and the rebased dev-checks head built at the same path (the ELF carries the
absolute source paths of app/board, so two builds of one source only compare from one
directory; crosscheck compares build/ref against build/ in one tree for that reason):

```
dcc903fe02bd9506a469ad193abf7166eceb978b842d502ae1860f7ded2ab600  build/pro/sdk.elf
2cb180caab27f4ac5301658244c33f4eb59394e831d7c6319729f486e4ea5bcd  build/pro/generated/SMK37_PRO_OPEN.fwsc
1cdf1e64c5470d990b42dc39494c8b98942e2d7ea001de94f07f11fc7d281552  build/pro/generated/app-image.bin
30c8b2ca4c38bbbfaf3a59a13b069b489a0935e46c306337d8d6045db00332c9  build/official-web/pro/SMK37-Open-Source.html
970fd36c8e2e3a4748213fc7effe6641d788d341eddccca02dda344ca43f7ea8  build/hosted/pro/index.html
```

identical for both. The same gate on the Task 07 base (linux-build 56b09d3) before the rebase:
sdk.elf b35aff61…, .fwsc 0fb5c158…, app-image 3436a996…, page 33fb077b…, hosted 206306e2…,
identical before and after the changes.

## 21. Task 08 — The display version (2026-11-04)

The user sees the installed version on the boot screen, in the workbench's header badge and
on the update tab. Up to tabby-v03.0 all three showed `FM1_RELEASE_VERSION`, upstream's
label "V01". That label is the firmware's identity: build.py (and Build.ps1) require the
update product macro to equal "SMK-37 Pro_" + (8000000 + the label's number), the string is
compiled into `fm1_update_identity` (the device's reply to query 17), and WebUpdate.js
recognises Open firmware, validates the package, arms the update and waits for the rebooted
device by that identity; the factory V16 restore runs on the same checks. So the label stays
"V01" and a separate **display version** is shown instead.

### 21.1 What changed

- `VERSION` (new, root) holds `$Format:%(describe:tags)$`; `.gitattributes` marks it
  export-subst, so `git archive` and GitHub's tag archives expand it to the tag.
- `tools/linux/display_version.py` v0.1 (new): the display version is `--display-version` /
  `FM1_DISPLAY_VERSION` when given; else `git describe --tags --exact-match` (the bare tag,
  "-dirty" appended when tracked files are modified); else `git describe --tags --long --dirty`
  (tag-count-hash); else, without a git repository, the expanded VERSION file; an unexpanded
  placeholder is refused with a message naming `--display-version`.
- `tools/linux/build.py` v0.7: computes it after the identity check, logs it, passes
  `-DFM1_DISPLAY_VERSION="…"` to every unit (also in `--check-only`, so the compile
  databases carry it), folds it into the build identity **only when it differs from the Open
  label** (a re-tag of unchanged sources is then a new build id and is not refused as already
  installed; the forced-label gate build keeps the old id), writes `display_version` into
  build-identity.json, the package JSON (`FM1_PACKAGE`) and web-package-report.json, and
  passes `--display-version` to build-web.py. `tools/linux/build-web.py` v0.2: the same define
  for the simulator (the simulated boot screen draws it), the wasm cache record keyed by it
  (simulator.json schema 3), `display_version` in `FM1_SIMULATOR` and web-report.json, and a
  check that the package and the page agree.
- `app/version.h`: `FM1_DISPLAY_VERSION` falls back to `FM1_RELEASE_VERSION` when the build
  does not define it (sdk/Build.ps1, the host test build). `FM1_RELEASE_VERSION` and the
  product macros are untouched. `app/screen.c` boot_draw draws `FM1_DISPLAY_VERSION` centred
  at scale 2 up to 20 characters, else scale 1 (a dirty development string is 28).
- `sdk/Update.html.in`: the header badge and the update tab's Version line show the display
  version (falling back to the label); the firmware details block gains "Open base version"
  (the label). `sdk/I18n.js`: one string. `sdk/manifest.json` re-pinned.
- `tools/Build-Hosted.cjs`: assets.json gains `"version"` beside `"release"`;
  `tools/linux/publish-pages.py` v0.2 logs it and writes it into the gh-pages commit body.
- Makefile v0.11: `DISPLAY_VERSION=…` forces the value (`$(DV)` on build.py, build-web.py and
  the check); web-smoke runs `tests/display-version.mjs` (the cache record, the wasm bytes and
  the preview page's `FM1_SIMULATOR.display_version` all equal the module's answer); web-smoke
  and midi-import-sim now depend on the phony `web` target, so a changed source or display
  version rebuilds the simulator before the tests read it (an existing wasm was never
  refreshed before; the cache keeps an unchanged rebuild at 0.6 s).

### 21.2 Measured

- A tag such as "tabby-v03.1" costs 0 bytes of app image (the 8 extra string bytes fall inside
  .text alignment; measured in a scratch copy with "TABBY-V03.0", 451396 both ways). The
  28-character development string costs 32 bytes (451428).
- **The forced-label gate** (`make firmware DISPLAY_VERSION=V01` on the Task 08 tree against
  the tabby-v03.0 outputs): app-image.bin differs in exactly 32 contiguous bytes at offset
  158237..158268, the `fm1_build_id` constant (0x02026b3c in sdk.map); the .fwsc differs in
  those 32 plus 14 bytes of package checksums. Everything else is byte-identical. The build id
  moves because it hashes every file under app/, and app/version.h and app/screen.c changed;
  no build whose app/ differs can reproduce an earlier package byte for byte. The gate as
  stated for tabby-v03.1 ("byte-identical to tabby-v03.0") therefore cannot hold; the nearest
  proof, that the difference is confined to the build id, is recorded in 9.3d.
- `make check`, `make lint` (3 target warnings as before), `make test-fast` green; headless
  Chrome on build/preview/index.html: badge and Version line show the describe string, base
  version V01, no console errors.

## 22. Task 08 — The manual rewritten for Classic Tabby (2026-11-04)

The workbench's manual tab (sdk/Update.html.in, section `#tab-manual`) was rewritten so a
new user can learn Classic Tabby from it. Chapters 01 to 12 are new, written in English and
shown in both UI languages (no CJK text, so FM1I18n leaves them alone, as the importer and
rig panels are): what Classic Tabby is, getting started, songs, scene changes, track
launching, importing MIDI files, timed notes, program changes and CCs (with the device
setup checklist of 16.3), FM6 preview, Bluetooth settings, storage, and a quick-reference
table that prints on its own sheet (`.manual-quickref`, compact cells, `break-before: page`).
Chapters 13 to 21 are the SMK37 OPEN chapters that still apply, renumbered and corrected:
every sentence about the sampler, the sample bank, the DX7 user library, the factory scenes,
the BLE page, the NAME page and the DX7 operator and tone editor pages is removed or
rewritten; the changed Chinese paragraphs got new entries in sdk/I18n.js (50 strings, with
their English). tests/workbench/manual-i18n.mjs (in `make workbench-test`) checks that every
CJK text node and attribute of the manual has a translation, that the manual has 21
chapters and links, that the English chapters carry no em dash and that the removed-feature
texts are gone. Every button, page number, pad combination and screen text in the new
chapters was taken from app/screen.c, app/smk37_controls.c, app/song.c and the workbench
scripts on this head, not from the plans.

### 22.1 Code against the specification, found while writing

1. **SONG page, song selection.** The page's key line says "K1 SONG" and the code comment
   and BUILD.md 13.4 say K1; the code reads `encoders[0] + encoders[6]`, which are SELECT and
   PRESETS (encoder_map: K1..K4 are indexes 2..5). The manual says SELECT or PRESETS. The hint
   text is wrong, not changed in this release.
2. **ACTIONS confirmation after the Task 06 (a) renumbering.** `destructive` still names
   action 20 and the prompt text checks `action == 20`; after "DX7 PATCH NAME" and
   "BLUETOOTH / CLOCK" left the list, 20 is COMPACT SONG STORAGE and 18 is ERASE OLD
   SAMPLE/DX7. So the erase runs on the first SAVE with no confirmation and the compaction
   asks "ERASE OLD FLASH DATA?" first. BUILD.md 13.4 step 2 and SPEC 6 (a) describe the
   confirmation on the erase. The manual documents the real behaviour (chapters 02 and 11)
   and warns. Not fixed in this release (the release carries no firmware change beyond the
   display string); the fix is the two indexes 20 → 18 in app/screen.c, with a host test.
3. **The song's project slot.** The song record stores a project slot (byte 36, validated
   0..15, shown in the editor as "Project slot") but nothing in the firmware loads that
   project when the song plays. The manual says the field is a note only.
4. **SOUND SOURCE page, pad count.** The page says "K1 / PADS 1-6 CHOOSE" while five sources
   are selectable (SOURCE_CHOICES = 5); and the overview's PAGE / K2 path into the page
   wraps with GROOVE_SOURCES (6), so it can preview "SAMPLER"; what SAVE does with it was
   not exercised. The manual names five sources and pads 1 to 5.
5. **"EVENTS" and "LATE" on the SONG page** are drawn only when the song has events
   (`if (st.events)`), while the late counter also counts late note frames of songs without
   events; the TRACK LAUNCH page shows LATE whenever it is non-zero. The manual says so.
6. **Stale texts outside the manual, left as they are:** the Projects & sounds intro
   ("管理设备项目、音色和采样") and the update tab's back-up checkbox ("…工程和采样") still
   mention samples; the SMK37 Open "Six sound engines" wording in sdk/I18n.js for other UI
   strings is untouched.

## 23. Task 09 — The Wrong Room rig (2026-11-05)

Task text: docs/tasks/TASK-09-wrong-room-rig.md (v0.2: the Boss RE-2 has no MIDI and left the
plan). Step 1 research and the approved decisions: docs/tasks/TASK-09-step1-assessment.md.
Firmware unchanged throughout (margin 2525).

### 23.1 Checkpoint (a): device library, the Wrong Room profile, the profile selector

- `tools/linux/devices-from-sources.py` v0.2 writes fifteen definitions: four new (Chase Bliss
  Brothers, Strymon NightSky, Tone King Royalist Preamp, the SMK-37's FM6 as an internal
  pseudo-device) and the eleven of Task 04 rechecked (Skiff 2.2 with T CHANNEL OFF and clock,
  Melodee 1.6.1, Orange Cat read from its source, M8 firmware 6.6.3 / manual 6.5.2, H90 1.12.5
  with the CC-after-PC bug still open, Zoom 1.20, Seashell 1.0.3, the Proteus's lack of clock).
  Definitions gained the optional fields `kind`, `midiIn`, `clock`, `channelSetting`,
  `firmware` and `programChange.programsTotal`; `web/rig/device-library.js` v0.2 validates them
  when present and adds `kind()`, `isEffect()`, `programInRange()`.
- `web/rig/profiles/wrong-room.json`: the built-in profile (the approved plan: 1 Seashell, 2 and 3
  FM-1 A and B, 4 / 10 / 13 M8 parts 1..3, 5..8 Proteus parts 1..4, 9 FM6 pinned to Tabby track
  8, 11 Royalist, 12 Brothers, 14 NightSky, 15 H90 with a 255 ms gap after the program change,
  16 Zoom), each channel with its port note (H4MIDI WC port and filter, adapter), and the
  profile notes (the Proteus reservation, the H4MIDI preset, the RE-2 as audio only).
  `web/rig/rig.js` v0.3: `port` and `track` per channel, `notes`, `rigBuiltins()`, `trackFor()`,
  `channelsOfKind()`; old profiles load unchanged. `web/rig/rig-ui.js` v0.3: a Profile select
  (My rig, each built-in read-only, Copy to my rig), Port and Track columns, the notes under
  the table. `tools/linux/build-web.py` v0.3 inlines the profiles as `FM1_RIG_PROFILES`.
- Tests: tests/workbench/devices.mjs v0.2 (fifteen definitions, NightSky and Brothers numbering,
  kinds, programInRange, the optional-field validation) and tests/workbench/rig-profile.mjs
  (the plan, the pin, the copy, the old-profile load, the H90 gap). `make test-fast` green;
  headless Chrome on the preview: the profile select with "Wrong Room (built-in)", the nine
  columns, fifteen devices inlined, no console errors.

### 23.2 Checkpoint (b): the importer maps by the rig

- `web/import/midi-song.js` v0.6: `convert()` takes `rig` and `library`. Each part's channel
  becomes its track's OUT CH (an explicit choice still overrides: a channel, or null for the
  device setting); `defaultAssignments(analysis, rig)` keeps file order but a part on a channel
  with a pinned track (channel 9 → track 8) takes that track whatever its position; `partDevice()`
  names the rig device on the part's channel and a device the track name mentions; four
  warnings: `channelNotInRig`, `notesOnEffectsChannel`, `programOutOfRange` (also a device that
  takes no program change, or a bank select that fits no bank), `ccNotNamed` (devices without a
  fixed CC map are not warned about). Without a rig the v0.5 behaviour holds.
- Fixed on the way: every program change was listed under `programIgnored` even when it became a
  row event (the taken-set held spread copies, not the analysis objects, since Task 04; an
  info-level line, so no song was wrong). The tempo/CC/program test's expectation rested on it
  and now checks the real behaviour.
- `web/import/import-ui.js` v0.8: the parts table gains a "Rig device" column (with the pinned
  track and a name/channel mismatch note), the OUT CH selects follow the parts' channels until
  the user changes one, the rig name is shown above the table, and a "Download the MIDI guide"
  button (checkpoint c fills it). `sdk/Update.html.in` builds the device library once and hands
  the importer the active rig ("My rig", or the song's own copy) and the library.
- Fixtures (tests/midi-import/make-fixtures.mjs v0.3): `wrong-room-all.mid` (eight instrument
  parts on 1, 2, 3, 4, 5, 6, 10 and 9 with the FM6 part third in file order, 22 events each
  device accepts, five notes-free pedal tracks) and `wrong-room-wrong.mid` (one of each fault).
  Tests (tests/midi-import/run.mjs v0.6, section 15, 183 checks): every OUT CH from the file,
  the pin, 22 events on their channels, no warning of warn severity, the v0.5 behaviour without
  a rig, each of the four warnings exactly once (with channel 13 cleared in the test rig). The
  preview checked in headless Chrome.

### 23.3 Checkpoint (c): the generated MIDI guide

- `docs/MIDI-GUIDE.template.md` (new): the hand-written part of the guide, from the user's guide
  of 2026-11-05 (file rules, timing, notes, row events, song shape, how to produce the file,
  common mistakes, Appendix A's mido template, Appendix B's checker) with placeholders for
  everything that comes from the rig: the channel map, the device sections, the effects list in
  section 6, the pinned-track rule, the profile notes, the limits (from song-format.js LIMITS),
  Appendix A's three example channels and Appendix B's RIG dict. New hand-written section 10
  (scene changes against track launches: pedal events in notes-free tracks, instrument presets on
  the instrument's channel, the FM6 convention). The checker gained the rig checks: a part on a
  channel with no device, notes on an effects channel, a program the device does not reach (bank
  bytes seen before the PC are matched against the device's banks), a CC the device does not
  name, a pinned track claimed twice. `docs/MIDI-GUIDE.md` is now the generated file: never edit
  it, run `make midi-guide`.
- `web/rig/guide.js` v0.1 (new): `TabbyGuide.build({ rig, library, template, version, date })`
  fills the template; deterministic for a given input. The page gets the template as
  `FM1_GUIDE_TEMPLATE` and the script in the rig bundle (build-web.py v0.3); the Import MIDI
  panel's "Download the MIDI guide" button writes `Classic-Tabby-MIDI-Guide.md` for the active
  rig ("My rig", or the song's own copy) with the installed workbench's display version.
- `tools/linux/midi-guide.mjs` v0.1 (new, `make midi-guide [DISPLAY_VERSION=…]`): writes
  docs/MIDI-GUIDE.md from the Wrong Room profile with the display version of the tree (or the
  one given; the release passes the tag). `tests/workbench/midi-guide.mjs` (in
  `make workbench-test`): the committed guide equals a fresh build apart from the version line,
  every placeholder is filled, each of the 16 channels has its section and map row with the
  definition's CC rows, the NightSky / Brothers / Proteus / H90 numbering strings, the FM6 pin,
  the RIG dict, section 6's effects list, Appendix A's channels; and, with the harness Python
  that has mido (~/fm1-hw/hwvenv), Appendix B's checker passes wrong-room-all.mid with no
  warning, shows the effects / range / CC warnings on wrong-room-wrong.mid (plus the no-device
  one when channel 13 is removed from RIG), and Appendix A's script writes a file the checker
  passes.

### 23.4 Checkpoint (d): the simulator check

`tests/workbench/wrong-room-sim.mjs` (in `make midi-import-sim`) imports wrong-room-all.mid with
the Wrong Room profile as the workbench does, writes the song into the simulator and plays it:
256 note-ons on channels 1, 2, 3, 4, 5, 6, 9 and 10 only, each channel with its part's 32 notes
and pitches (the FM6 part on channel 9 from track 8), every one of the 17 events of row 1 and
the 6 of row 2 once, on its channel, before the row's first note (row 1 at PLAY included), the
NightSky's CC 0 before its PC, Song Position then Start before any channel message, Stop last,
no late row. Two things learnt on the way:

1. **A gap stalls the events after it in a row's stream.** Events leave in file order; the H90's
   255 ms gap, placed before the Zoom's track in the first version of the fixture, held the
   Zoom's program change for 88 blocks after PLAY (row 1 cannot be sent early at PLAY; row 2
   was pre-fired and fine). The fixture now puts the H90 last, the guide's section 10 states
   the rule (put a gapped device's track last; SEND SETUP before PLAY), and applyGaps drops the
   trailing gap because nothing waits on it. Firmware behaviour as designed (Task 04 2.3).
2. **The simulator's MIDI capture is a test artefact to respect:** it holds 64 messages a block
   and captures every message once per ready port (three by default); 23 messages in block 0
   overflowed it, the firmware treated the full capture as a busy port and reset the channels,
   and four note-ons were lost. The check sets one ready port (`sim_midi_ports(1, 0)`). Not a
   firmware fault: the device's DIN path has its own buffer (31250 baud, 2.11 of the
   assessment).

### 23.5 Hardware checklist for Task 09 (Step 4, for the user)

One list of what to set on each unit, then the fixture. The device sections of docs/MIDI-GUIDE.md
repeat each unit's steps with the sources.

**The CME H4MIDI WC** (HxMIDI Tools over USB-C, one preset, stored in the unit):
1. *(The TRS type question moved to 24.6 step 3, L.9, on 2026-11-07.)* DIN IN 1 = Classic Tabby (3.5 mm MIDI OUT adapter; the jack's TRS type is unconfirmed: if a
   type A adapter is silent, try type B). DIN IN 2 = the second controller.
2. Routing: IN 1 → OUT 1, OUT 2, USB host 1, 2, 3; IN 2 → OUT 2. Nothing else (DIN IN does not
   route to DIN OUT by default).
3. Filters: OUT 2: block channels 1–4 and 9–16 (pass 5–8); USB host 1: block every channel but 2;
   USB host 2: block every channel but 3; USB host 3: block every channel but 16 and block every
   message type but Program Change. Realtime (clock, start, stop) stays unfiltered on the FM-1
   ports.
4. USB host port reservation: FM-1 A, FM-1 B, Zoom in that order behind the powered hub.
5. OUT 1 → Thru5 WC → NightSky, H90, Royalist, MIDIbox (Brothers), Seashell (DIN-to-TRS A), M8
   (DIN-to-TRS A). OUT 2 → Proteus.

**Per device:**
6. Seashell: Controller app > Settings > MIDI Channel = 1.
7. FM-1 A and B: Skiff 2.2: MENU > MIDI > T1 CHANNEL = 2 (A) / 3 (B), T2..T6 = OFF, CLOCK = USB
   (or TRS), CLOCK OUT off. Melodee / Orange Cat: ROUT = CH1-4, CLK = USB; the port filter does
   the rest (channel 2 plays the unit's track 2, channel 3 its track 3).
8. M8 (per song, then save as default): track 1 CHAN 04, track 2 CHAN 10, track 3 CHAN 13,
   tracks 4..8 on a channel nothing sends on (or 13 in POLY); PG CHANGE on; SYNC IN =
   CLK+TRANSP+SPP.
9. Proteus/2 XR: Master > MIDI MODE = Multi; MIDI ENABLE on for 05..08 (and the second
   controller's channels), off elsewhere; PRESET CHANGE on for 05..08; C05..C08 presets; the
   MIDI PROG>PRESET map for presets above 127. Leave the Edit menu.
10. SMK-37: SEQ page 6/7, track 8, K3 SEQ = LOCAL (the FM6 part); OUT PORT ALL on the others.
11. Royalist: Synergy Editor App (USB-C) > MIDI CHANNEL = 11, STORE; open MIDI CC LIST and
    note the Royalist's CC numbers (replace the SYN-20IR guesses in the definition).
12. Brothers: MIDIbox powered, jumper RING, TRS patch cable; power up holding both stomp
    switches, release, run SEND SETUP (row 1 holds PC 3 on channel 12): the channel is learnt.
13. NightSky: DIN in; power-up channel mode, SPEED to blue, SEND SETUP again (PC on 14),
    INFINITE to store; TRS MIDI Output OFF; per preset, RESPOND TO MIDI CLOCK as wanted.
14. H90: System > MIDI > Channel 15, PC Offset off; Tempo Source = MIDI Clock, Clock Source DIN.
15. Zoom: MENU > USB MIDI CH = 16; USB host connected before the set.

**The fixture:**
16. Import tests/midi-import/fixtures/wrong-room-all.mid in the workbench with the Wrong Room
    profile copied to "My rig": the parts table shows every device on its channel, the FM6 part
    on T8, no warning; write it to a song slot.
17. ACTIONS → SEND SETUP: every device shows its row-1 preset (Seashell nothing, FM-1 A sound 3,
    M8 INST 05, Proteus 007 and 012, Royalist 7, Brothers preset 3, NightSky preset 200, H90
    Program 12, Zoom patch 001 or 002, which settles its PC base).
18. PLAY: each part on its device (the Seashell bass, the FM-1s, the M8's three tracks on 4, 10
    and 13, the Proteus parts 1 and 2, the FM6 inside), the M8, H90 and NightSky locked to the
    clock; at bar 5 the row-2 presets (FM-1 A sound 4, M8 INST 06, Proteus 013, Brothers preset
    4, H90 Program 13, Zoom patch 2) land before the downbeat; LATE stays 0 on the SONG page.
19. Record the Zoom's PC base, the Royalist's CC list, the SMK-37 jack's TRS type and whether
    the NightSky took channel 14 over DIN, and correct the definitions (BUILD.md left-to-build).

## 24. Task 11 — Phase 0 preparation: backup, diagnostic build, USER probe (2026-11-07)

Task text: docs/tasks/TASK-11-phase0-prep.md. Decisions recorded in SPEC 14. Nothing here
changes song playback; the normal build compiles to the same code as before (24.1).

### 24.1 The two build options

| Option | Makefile | build.py | Effect |
| --- | --- | --- | --- |
| Diagnostic build | `DIAG=1` | `--diag` | `-DCT_DIAG=1`: the counters (24.3), transfer kind 8 (24.2), the ACTIONS storage lines; capability bits 6 and 7 |
| USER size | `USER_BYTES=N` | `--user-bytes N` | the one layout setting: `fm1_layout.user_bytes`, both packagers' USER record and BTIF/VM placement, `-DCT_USER_BYTES=N` for the app constants (app/ct_layout.h), the simulator's flash size |

Both work on every firmware, check, package and web target (`make firmware DIAG=1`,
`make package DIAG=1 USER_BYTES=471040 ...`). Unset, nothing is added to any command line.
A non-default option is folded into the build identity (`diag:1`, `user_bytes:N`), so a diag or
probe package never shares a build id with the normal build of the same sources;
build-identity.json and the package JSON name both. `make web-diag` and `make web-probe64` build
the two extra simulators into build/web-diag/ and build/web-probe64/ (for the backup test).

The gate (measured 2026-11-07, both built with DISPLAY_VERSION=tabby-v03.2 at one path): the
normal build of this tree against head 0274b81 differs in 32 bytes of app-image.bin (the build
id) and 46 bytes of the .fwsc (the id and checksums), as for every app/ change (the build id
hashes app/ and sdk/manifest.json; section 9.3d). `make crosscheck`: 24.7.

### 24.2 Full backup and restore

Workbench library tab, "Full backup and restore (Classic Tabby)". File format and rules:
docs/BACKUP-FORMAT.md (version 1). What goes in: the 16 project slots (slot 16 with the device
settings), the workspace and current slot, transfer kind 8 (device MIDI settings, BLE role, radio
switches, clock mode, track roles, input channels, panel preferences; on the diagnostic build and
later), the Bluetooth switches (command 24), every song record and block, the firmware identity,
build id and USER size, and the browser's "My rig". What does not: Bluetooth pairings, staging
(transient), the built-in rig profiles. On tabby-v03.2 the file has no kind 8 and says so in its
`not_included` list; note the MIDI page settings, track roles and input channels by hand.

Restore checks the whole file first (every CRC, length, project and song structure, every
referenced block, the counts and the end marker), then the device (song storage READY, playback
stopped), and only then writes, in the order settings, projects, songs, current slot and
workspace, through the transfer commands only. Song slots empty in the file are deleted. It ends
with a read-back verify: PASS with the number of items compared, or FAIL with the first
difference. "Verify against file" does the read-back alone.

Test: `make backup-test` (tests/workbench/backup.mjs, also in `make test` and `test-fast`), 28
checks on three simulators: round trip byte-identical on the diagnostic simulator (projects in
slots 1, 4 and 16, changed settings, an unsaved workspace, two songs with 15 blocks and row
events), the settings stored across a reboot, five kinds of damaged file refused with the flash
revision unchanged, the 536576 file restored and verified on the 471040 simulator, an emulated
move (the probe simulator booted on the stock simulator's flash shifted by 64 KiB: song storage
READY, no old project visible, restore and verify PASS), the round trip on the normal simulator
without kind 8, and the counters through command 25.

### 24.3 The diagnostic build (tabby-v03.3-diag)

`make firmware DIAG=1` (or `make package DIAG=1 ...`). The current firmware and layout, no
behaviour change, plus (app/diag.c, app/board/scan.c under `CT_DIAG`):

| Counter | Where | Assessment item |
| --- | --- | --- |
| control loop: count, mean and longest period | `groove_midi_poll()`, the call that sends MIDI out | L.1 |
| flash: erase count and longest erase, write count, longest write and its size | wrappers around every app `fm1_flash_erase` / `fm1_flash_write` | L.3 |
| key and pad note-on latency: 8-bin histogram (<0.5, <1, <2, <4, <8, <16, <32, ≥32 ms) and maximum | TIMER4 stamp when the scan ISR queues the event, read when `smk37_scan_read()` hands it to the router | L.4 |
| matrix scans: count (rate), longest gap; scan and ADC ISR peak time | `scan_soft_isr()` (one full 16-row scan) | L.5 |

Times are TIMER4 ticks (24 MHz). Transfer command 25 reads them (page 1, 64 bytes; page 2, 20
bytes; data byte 1 resets first); the workbench shows them in the library tab's "Diagnostics"
group (Read, Reset, Copy as text), visible when the device reports capability bit 6. The ACTIONS
page shows two extra lines: `USER <fm1_flash_size()> SONG <state>` at the top and
`FREE <n>K  RECLAIM <n>K` at the bottom (the size reads `0 INVALID` if the SDK refused the layout).

Size (measured, DISPLAY_VERSION=tabby-v03.3-diag): app image 453284 bytes against the normal
build's 451396 with the same string: the diagnostic code is 1888 bytes; the hard limit is 453921,
so the diagnostic build's margin is **637 bytes**. It fits; nothing was removed.

### 24.4 The MIDI monitor (tools/linux/midi-monitor.py)

Replaces a DAW for L.2 (MIDI out jitter) and L.6 (clock follow). It opens one ALSA raw MIDI input
read-only (it never sends), stamps each chunk with the kernel's receive time (ALSA timestamp read
mode, CLOCK_MONOTONIC; `--user-time` falls back to time.monotonic_ns()), writes a CSV and prints
the analysis: the clock (pulses, BPM, pulse spread), per channel the note-on residuals against a
least-squares 16th grid (spread = the band, std, p99, drift in ppm, 4-bar wander, end against the
nominal grid) and, for the 8-channel song, the burst width per 16th. The last line is
`BAND (largest per-channel spread): x ms`, the number SPEC 14.3 compares with 2 ms.

```
python3 tools/linux/midi-monitor.py --list                    # the ALSA ports; the AUDIO4c's DIN input is "AUDIO4c DIN" (hw:2,0,0 here)
python3 tools/linux/midi-monitor.py --port "AUDIO4c DIN" --seconds 150 --csv l2-8x16.csv
python3 tools/linux/midi-monitor.py --analyze l2-8x16.csv --bpm 120      # again, from the file
python3 tools/linux/midi-monitor.py --analyze l2-8x16.csv --channel 1    # one channel only
```

Start the capture, then PLAY on the SMK-37 within a few seconds; stop the capture with Ctrl-C after
the song or let `--seconds` run out. The measurement floor is the AUDIO4c's USB timing (high speed,
125 µs microframes) and DIN's 0.32 ms per byte: eight note-ons on one 16th take at least 7.7 ms on
the wire, which the burst line shows; the per-channel spread is the jitter.

The test songs (tests/midi-import/fixtures, generated by make-fixtures.mjs): `timing-8x16.mid`
(16ths on channels 1-8, one pitch each, 1/32 long, 120 BPM, 60 bars = 2 minutes) and
`timing-1x16.mid` (the same on channel 1 only). The importer test checks that each imports as one
16th-note block per track over 960 steps. tests/linux/midi-monitor-test.py (in
`make workbench-test`) checks the parser and the analysis on synthetic captures with known jitter
and drift. Smoke run on this machine: `--port "AUDIO4c DIN" --seconds 1` opened hw:2,0,0 with
kernel timestamps and read nothing (nothing connected).

### 24.5 The USER probe (tabby-p0-probe64) and the way back

`make package DIAG=1 USER_BYTES=471040 TAG=tabby-p0-probe64 DISPLAY_VERSION=tabby-p0-probe64`.
The probe is the diagnostic build (24.3) with USER moved 64 KiB smaller (base 0x8C000) and
nothing else changed; the only difference between the two published builds is the layout, so the
counters can be compared across them. Layout, data effects and margins: FLASH-BUDGET 3.5 and 16.
What changed so that the size comes from one setting: both packagers, build.py, app/ct_layout.h
(instrument.h and song_storage.h derive from it), the capability reply 21 (it reports the song
region of the layout), WebUpdate.js (accepts any region of a 405504–536576 layout and records the
layout for the backup) and Simulator.js / Simulator.c (`sim_flash_size`). The normal build keeps
536576 and stays the same code (24.1).

**Reading the result on the device.** Hold SEQ for about 0.6 s: the ACTIONS page's top line reads
`USER 471040 SONG READY` when the SDK accepted the layout and the song region scanned;
`USER 0 INVALID ...` means the SDK refused the reservation (fm1_flash_size() returned 0: projects
and songs are unavailable, the firmware itself runs). The bottom line shows `FREE <n>K  RECLAIM
<n>K` (about 320K free on an empty probe: 80 block sectors).

**The way back** (to tabby-v03.3-diag, or to tabby-v03.2). Both are normal updates, because the
probe is Open firmware with the same update protocol:

1. Open the main page, https://seattleuser0.github.io/classic-tabby/ (tabby-v03.3-diag), or the
   tabby-v03.2 offline page from its release
   (https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v03.2, file
   SMK37-Open-Source.html). Device update tab, Connect device, Start update. No force option is
   needed.
2. After the reboot the device runs USER 536576 again. Its ACTIONS page (on the diag build) reads
   `USER 536576 SONG OLD DATA`, and the SONG page shows OLD SAMPLE/DX7 DATA: the stock layout sees
   the probe's project sectors where its song region starts. ACTIONS > ERASE OLD SAMPLE/DX7, SAVE
   to confirm. The top line then reads `SONG READY` (on tabby-v03.2: the SONG page clears).
3. On the main page (the full restore is part of the Task 11 workbench; the tabby-v03.2 page has
   none, but the main page's library works with tabby-v03.2 firmware too): Library tab, Connect
   project library, Full backup and restore: choose the backup file made on the diagnostic build
   before the probe (24.6 step 4), Full restore, confirm. It ends with Verify: PASS. On tabby-v03.2
   firmware the file's device settings cannot be written (no kind 8): the restore says so; set the
   MIDI page, track roles and input channels by hand, or go back to the diag build instead.
4. Pair Bluetooth again if you use it.

If the probe install leaves the device without a boot screen or without its USB MIDI port: stop.
Do not retry the update, do not force-flash anything, and send me what the screen shows and what
`amidi -l` (or the workbench's connection details) lists. A device that boots but reads
`USER 0 INVALID` is fine: take the way back above.

### 24.6 Hardware checklist for Task 11 (for the user, in this order)

Pages: **main** = https://seattleuser0.github.io/classic-tabby/ (tabby-v03.3-diag), **probe** =
https://seattleuser0.github.io/classic-tabby/probe64/ (tabby-p0-probe64, a test build that moves
storage). Everything is done from Chrome on the computer the SMK-37 is plugged into by USB. Keep
every backup file; name them as below. "Library tab" = Projects & sounds, then Connect project
library. This list takes over the overlapping items of 19.5 (steps 12 and 13) and 23.5 (step 1);
the rest of those lists stays where it is.

**What you need:** the SMK-37 with tabby-v03.2 on it; the AUDIO4c with its DIN input wired from the
SMK-37's MIDI out (3.5 mm adapter); this repository on the computer
(`tools/linux/midi-monitor.py`, the test songs `tests/midi-import/fixtures/timing-8x16.mid` and
`timing-1x16.mid`); the MC-101.

**Step 1. Full backup and restore on tabby-v03.2.**
1. Open the main page. Library tab, Connect project library. Stop any song.
2. Full backup and restore > Full backup. The page saves `classic-tabby-backup-<time>.json`;
   rename it `backup-1-v03.2.json`. The message shows the counts (projects, songs, blocks) and USER
   536576.
3. Write down by hand what this firmware cannot put in the file (the page lists it): the SEQ page
   6/7 MIDI settings per track, the track roles and input channels (SOURCE page), the clock mode.
4. Backup file: choose `backup-1-v03.2.json`. Full restore, OK. You should see `Verify PASS: <n>
   items identical to the file`.
5. **Stop** if you see `Verify FAIL` or any error: install nothing; send me the message line.

**Step 2. Install tabby-v03.3-diag from the main page.**
1. Device update tab > Connect device > tick the backup box > Start update. Wait for the reboot.
2. The boot screen shows tabby-v03.3-diag. Library tab: the project list and Song mode > song slots
   show your projects and songs as before. ACTIONS (hold SEQ 0.6 s): the top line reads
   `USER 536576 SONG READY`.
3. **Stop** if projects or songs are missing: do not save anything on the device; send me what is
   missing. (Your step-1 file restores them.)

**Step 3. The measurements.** Write the two test songs to the device first: Import MIDI file >
`timing-8x16.mid` > write to song slot 15; `timing-1x16.mid` > song slot 16. Library tab > the
Diagnostics group must be visible (it is, on the diag build).

- **L.5 and L.1 at rest (run A).** Diagnostics > Reset counters. Leave the device on the SONG page,
  stopped, for 60 s. Read counters > Copy as text. Keep the text as `run A`.
- **L.1, L.4 and L.5 under load (run B).** ACTIONS > SONG MODE, select song 15 (timing-8x16), Reset
  counters, PLAY. For the 2 minutes it plays: play keys and pads on the keyboard (about 100 notes,
  hard and soft), turn K1–K4 and SELECT now and then (stay on the SONG page; do not press the row
  pads, they queue jumps). After it stops: Read counters > Copy as text = `run B`.
- **L.2, MIDI out jitter on DIN.** On the computer: `python3 tools/linux/midi-monitor.py --list`
  must show `AUDIO4c DIN`. Then
  `python3 tools/linux/midi-monitor.py --port "AUDIO4c DIN" --seconds 150 --csv l2-1x16.csv`
  and within 10 s start song 16 (timing-1x16) on the device. When it ends, copy everything the
  tool printed = `L.2 one line`. Again with song 15 and `--csv l2-8x16.csv` = `L.2 eight lines`.
  Keep both CSV files.
- **L.3, flash stalls (run C).** Reset counters. With the device stopped: SAVE the current project
  to its slot once, then ACTIONS > COMPACT SONG STORAGE, SAVE to confirm, wait until it is done.
  Read counters = `run C`. Then start the monitor as for L.2 (`--csv l3-save.csv`), play song 16,
  and after about 30 s press SAVE (save the project) while it plays; if the device refuses, note
  the message. Copy the tool's output = `L.3 during play`.
- **L.6, external clock follow (MC-101 master over USB).** Plug the MC-101 into the computer by
  USB. On the MC-101: MIDI Sync Out USB = ON, a clip of 16ths playing, 120 BPM. On the computer:
  `aconnect -l`, then `aconnect '<MC-101 client>:0' '<SMK37 client>:0'` with the numbers it lists.
  On the SMK-37, song mode refuses MIDI clock, so use the stock sequencer: SEQ page 5/7 SYNC = MIDI,
  track 1 with all 16 steps on (STEPS page, pads 1–16). Start the monitor
  (`--port "AUDIO4c DIN" --seconds 150 --csv l6.csv`), then START on the MC-101; after about 60 s
  STOP on the MC-101 and watch the SMK-37's tempo field for 3 s (it should show LOST after about
  2 s); START again. Copy the tool's output = `L.6`, and note: how long until the SMK-37 played after
  START, what the screen showed after STOP. Afterwards set SYNC back to INT and `aconnect -x`.
  (Optional, if the AUDIO4c can route its USB host port to two computer ports: plug the MC-101 into
  the AUDIO4c's USB host jack, capture both with `--port "AUDIO4c HST1" --port "AUDIO4c DIN"`,
  master first, and the tool also prints the SMK-37's lag behind the MC-101.)
- **L.7, pad colours by eye** (was 19.5 step 12). Song 15, PLAY, SCL for TRACK LAUNCH: judge
  playing, queued, pending stop, a pattern, empty, and the SHIFT view of the eight tracks; note what
  you would change. Press pads soft and hard on the keyboard page and note whether velocity follows.
- **L.9, the jack** (was 23.5 step 1). Note which TRS adapter type (A or B) works on the SMK-37's
  MIDI out with the AUDIO4c. **Closed 2026-11-08 (25.7): type A works.**

**Step 4. Full backup on the diag build.** Library tab > Full backup. Rename the file
`backup-4-diag.json`. Its message must say the settings are in it (no "no settings transfer" note)
and the counts must equal step 1's (plus the two test songs). This is the file for steps 5 and 7.

**Step 5. The probe.**
1. Open the probe page (its banner says it moves storage). Device update > Connect device > tick the
   backup box > Start update.
2. **Stop** if the device shows no boot screen or no longer appears as a USB MIDI device: do not
   retry, do not force-flash; send me what the screen shows and what the page's Connection details
   list.
3. ACTIONS: write down both lines exactly (expected: `USER 471040 SONG READY` and `FREE ...K
   RECLAIM ...K`). If the top line says `USER 0 INVALID`: go to step 7 and send me the lines.
4. L.8: Library tab > Full restore with `backup-4-diag.json` (on the probe page). Expected `Verify
   PASS`. If FAIL: go to step 7 and send me the difference line.
5. Change and SAVE one project on the device; pair Bluetooth MIDI with your phone or computer;
   power the SMK-37 off and on. ACTIONS lines again; the saved project is still there; Bluetooth
   reconnects. Library tab > Verify against file (`backup-4-diag.json`): the only difference may be
   the project you changed.
6. Diagnostics > Read counters = `run D` (any time on the probe).

**Step 6. Factory V16 and the probe again.**
1. Probe page > Device update > Migration, factory restore and forced updates > Restore factory V16;
   follow the page. The device boots the stock firmware.
2. Probe page > Device update: the page will offer Enable force flash and reconnect (the stock
   firmware does not speak the Open protocol); do that, tick the boxes, Start update.
3. It must boot to tabby-p0-probe64; ACTIONS lines again (expected `USER 471040`; the song
   storage may read OLD DATA because V16 wrote its resource into the song area: then ACTIONS > ERASE
   OLD SAMPLE/DX7, SAVE). **Stop** as in step 5.2 if it does not boot.

**Step 7. Back to tabby-v03.3-diag** (BUILD.md 24.5).
1. Main page > Device update > Connect device > Start update.
2. ACTIONS shows `USER 536576 SONG OLD DATA`: ACTIONS > ERASE OLD SAMPLE/DX7, SAVE. Top line then
   `SONG READY`.
3. Library tab > Full restore with `backup-4-diag.json`. Expected `Verify PASS`.

**Send me back** (paste as text, in this order):

```
TASK 11 RESULTS
step 1  backup counts line: ...            verify line: ...
step 2  projects and songs all there: yes/no     ACTIONS top line: ...
run A   <Copy as text output>
run B   <Copy as text output>
L.2 one line     <monitor output>
L.2 eight lines  <monitor output>
run C   <Copy as text output>
L.3 during play  <monitor output>   device message if SAVE was refused: ...
L.6     <monitor output>   time from START to first note: ...   screen after STOP: ...
L.7     notes on the pad colours and velocity: ...
L.9     adapter type that works: A / B
step 4  backup counts line: ...
step 5  ACTIONS lines after install: ... / ...   verify line: ...
        after save + Bluetooth + power cycle: ACTIONS lines ... / verify line ...
run D   <Copy as text output>
step 6  boots after V16 and reinstall: yes/no   ACTIONS lines: ...
step 7  ACTIONS lines before and after ERASE OLD: ...   verify line: ...
anything else you saw
```

Stop rules in one place: a verify FAIL in step 1 (stop, send); missing data after step 2 (stop,
send); no boot or no USB after the probe (stop, no retry, send); `USER 0 INVALID` or a verify FAIL
on the probe (take step 7, send); no boot after step 6 (stop, send).

### 24.7 Gates run for Task 11

- `make crosscheck` (normal build, through the lock): Track A (Wine) and Track B (native) give the
  same sdk.elf, .fwsc and app-image.bin (`crosscheck passed`).
- `make crosscheck DIAG=1 USER_BYTES=471040` (the probe): identical on both tracks too.
- The normal-build gate of 24.1: 32 bytes of app-image.bin and 46 of the .fwsc differ from head
  0274b81, all in the build id.
- `make lint` and `make lint DIAG=1`: the same three target-clang warnings as before (scan.c
  `adc_con`, screen.c's two missing-initializer lines; closed in the left-to-build list).
- `make package-equivalence` is skipped (no pwsh on this machine), so sdk/Package.cs v0.2 is
  checked only by reading: it is the same change as package.py v0.2, line for line.

## 25. Task 11B — the Task 11 checklist run unattended (2026-11-07)

Task text: docs/tasks/TASK-11B-automated-hardware-tests.md. The agent runs BUILD.md 24.6 itself,
with the SMK-37 Pro on USB, its TRS MIDI out on the AUDIO4c's DIN input and its audio out on the
AUDIO4c's inputs. Results: 25.3 and ~/Documents/Classic Tabby/hardware-runs/2026-11-07/.

### 25.1 What runs without hands (written before the run)

| 24.6 item | Unattended? | How |
| --- | --- | --- |
| Installs, factory V16, force flash | yes | the real pages (published, or the release's offline page served on localhost) driven by tools/linux/hw/workbench.mjs (playwright-core + the installed Chrome, midi and midi-sysex granted); identity checked before every "Start update" |
| Full backup, restore, verify | yes | the same driver, the page's own buttons |
| Starting and stopping songs | **not on any released build**: PLAY on the SONG page is the only way (MIDI Start is ignored while the device sends clock; MMC only drives the stock transport) | a diag-only transfer command 26 (play / stop / compact / erase old / the ACTIONS status), 288 bytes, inside the 637-byte margin (diag image 453572, margin 349); the normal build is unchanged (gate 24.1). It is in the locally built diag and probe used for the measurements, not in the published ones |
| ACTIONS page lines | yes, on that build | command 26 returns fm1_flash_size(), the storage state, free and reclaimable: everything on the page except the clipboard line. On the published probe the capability reply 21 gives the compiled layout only, so 26 is what tells whether the SDK accepted the size |
| ERASE OLD SAMPLE/DX7 (24.5, 24.6 step 7) | on that build | command 26 {3}, the confirmed ACTIONS entry. The device still reported OLD DATA before the run, so this is needed before any song can be written |
| Run B load | substituted | about 100 MIDI notes over 2 minutes with mixed velocities sent into the USB port (the router load) instead of key and pad presses. L.4 (key scan to router) **needs a person**; the scan ISR counters (L.5) are still read |
| L.2 MIDI out on DIN | yes | tools/linux/midi-monitor.py's capture code on the AUDIO4c DIN input while command 26 plays the test songs; one song track also on the internal FM6, recorded through the AUDIO4c for the FM6-versus-DIN delay |
| L.3 flash stalls | yes | counters, plus a project save (command 7) and a song delete (kind 5) during play with DIN and audio recorded; COMPACT during play is refused by the firmware as on the panel, so it runs stopped, with a held FM6 note sounding |
| L.6 clock follow | substituted | the NUC sends MIDI clock, Start and Stop at 120 BPM from a script (busy-wait timing, send times logged); the stock sequencer follows (song mode refuses MIDI clock); clock loss = 3 s without clock and without Stop, then restart |
| Power cycle (step 5) | **needs a person** | no per-port power switching: the root hub port is not switchable without root and uhubctl is not installed, and the SMK-37 has a battery, so USB power does not power-cycle it |
| Bluetooth pairing, L.7 pad colours | **need a person** | skipped |
| L.9 the TRS adapter | yes | if MIDI from the SMK-37 arrives on the AUDIO4c DIN input, the fitted adapter works |

### 25.2 How to rerun

playwright-core 1.49.1 is installed outside the repository (`~/Documents/Classic Tabby/hw-tools`,
`npm install playwright-core@1.49.1`); it drives /usr/bin/google-chrome. Local pages are served with
`python3 -m http.server 8711 --bind 127.0.0.1` from the run's pages/ directory (the page needs a
secure origin; localhost is one).

```
node tools/linux/hw/workbench.mjs install --url URL --expect tabby-v03.3-diag --log run/workbench.log
node tools/linux/hw/workbench.mjs backup|restore|verify --url URL --file run/backup-N.json --log ...
node tools/linux/hw/workbench.mjs workspace --steps16 0 --url URL       # 16 steps on track 1 (L.6)
node tools/linux/hw/workbench.mjs settings --patch '{"6":1}' --url URL   # kind 8 byte 6: clock MIDI (0 = INT)
python3 tools/linux/hw/run-11b.py runA|runB|l6 [--usb --tag=-usb]|l3 --out run/   # browser closed
python3 tools/linux/hw/run-11b.py record --seconds 30 --keep 0 --tag X --out run/  # audio, own process
python3 tools/linux/hw/run-11b.py fm6-delay|gaps --tag X [--csv run/X-midi.csv] --out run/
node tools/linux/hw/workbench.mjs resume --url URL --expect VERSION     # update from the loader (v0.3)
node tools/linux/hw/workbench.mjs install|stock|resume --port NAME ...  # pick NAME if the page asks
python3 tools/linux/hw/run-11b.py trs-watch --clock|--passive --seconds 60 [--port NAME] --tag T --out run/
# Task 11C, read-only (no install, write, erase or reset; --seq shares the port with an open Chrome):
~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/usb-readback.py identity --seq --out run/
~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/usb-readback.py soak --seq --rounds 2000 --out run/
~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/usb-readback.py condition --seq --tag a --audio --out run/  # soak + 2 backup reads, AUDIO4c capturing
~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/usb-readback.py midi-watch --seconds 120 --tag T --out run/  # passive: AUDIO4c inputs + SMK USB out
node tests/workbench/update-ports.mjs                                   # the updater's port selection
```

trs-watch (run-11b v0.10) opens all ten AUDIO4c MIDI inputs and the SMK-37's USB output at once. It
either sends 120 BPM clock and Start (`--clock`; the stock sequencer plays with nobody at the device)
or sends nothing (`--passive`; a person plays keys). It reports the messages per port and the AUDIO4c's
kernel Rx counters. A page carrying another firmware image with the fixed workbench is built from
that page's FM1_PACKAGE (whose image hash is checked first) with
`build-web.py --package-json PKG.json --display-version V --user-bytes 536576`.

Findings for the tools: the AUDIO4c's capture must be started explicitly (`snd_pcm_start`; a plain
readi fails with EIO); a Python busy-wait clock loop starves a capture thread, so audio runs as its
own process; the page translates its status texts, so the driver accepts both languages.

### 25.3 Results (2026-11-07 and 2026-11-08; files in hardware-runs/2026-11-07/)

Run continued on 2026-11-08 after the user approved the remote ERASE OLD. The device was found on
**tabby-v03.0**; tabby-v03.2 was installed first. Installs through the page take about 9 s. Measurements
are on the local builds tabby-v03.3-diag-r2 (8b7dff80…) and tabby-p0-probe64-r2 (e2abe8ee…): the diag
and probe plus command 26 and the diag-only screen timing (command 25 page 3); diag image 453892,
margin **29 bytes** of the 637. Normal build unchanged (gate: 32 bytes of build id).

**DIN (L.9): no adapter type works here.** *(Superseded 2026-11-08: 25.7, type A works; the AUDIO4c
input side is the fault.)* The firmware sends to DIN: stored ports 7 (DIN, USB, BLE),
every track's mode BOTH, the SDK reports DIN as a physical output, and song notes use that mask; the
rig profile sets channels, not ports. While a song played, the SMK-37's USB output carried every note,
clock, Start, SPP and Stop, but all ten AUDIO4c MIDI inputs, opened together, received 0 bytes. The
AUDIO4c's internal routing can only be read with iConnectivity's own SysEx protocol (not attempted).
L.2 and L.3 are therefore **measured on USB out**: kernel receive timestamps at the NUC; USB adds
host-side timing of its own (1 ms full-speed frames, the host's polling).

| Item | Status | Result |
| --- | --- | --- |
| step 1 backup / restore / verify (v03.2) | done; restore refused (old data), verify PASS | see the first run below |
| step 2 install, verify | done | published tabby-v03.3-diag; verify PASS |
| ERASE OLD (command 26 {3}) | done (approved) | OLD DATA → READY, 382K free, in 2 s |
| run A, at rest | done | loop mean 5.484, max 12.293 ms; scan gap 0.34 ms |
| run B, song 15 + 100 USB notes | substituted (no keys) | loop **mean 6.341, max 19.189 ms**; screen control 79/s, mean 0.543, max 10.817 ms; band paints 17/s, mean 0.272, max 2.805 ms; L.4 needs a person |
| L.2 one line | measured on USB out | **band 14.7 ms**, std 3.3, p99 7.6, drift −438 ppm (device vs NUC), wander 1.4 ms; loop mean 5.80, max 14.1 |
| L.2 eight lines | measured on USB out | band 14.4–18.6 ms per channel, std 3.2–3.7; burst mean 5.5 ms (1.6–9.2); loop mean 6.32, max 19.0; LATE 0 |
| FM6 behind the USB note (track 1 only on FM6) | measured on USB out | one line: mean **23.5 ms**, std 12.2, p05 5.5, p95 39.9 (853 of 960 paired); eight lines: mean 21.8, p05 3.8, p95 39.0 |
| L.3 save during play | measured on USB out | longest note interval around the save 338 ms (nominal 125): MIDI out held ~213 ms; loop max 223 ms; 5 erases (max 17.6 ms), writes max 29.1 ms; audio gap ≥104 ms starting 23 ms after the save command (held note, earlier run: 220–224 ms) |
| L.3 song delete during play (kind 5, 1.29 s) | measured on USB out | **no note for 1.35 s** and 15 of ~62 clock pulses during the transfer; one note held 1.46 s; audio gap 24 ms at the record write |
| L.3 COMPACT | done | refused while playing (code 71), as on the panel; stopped with a held FM6 note: 1 erase 17.6 ms, audio gap 32 ms starting 12 ms after the command; no clicks |
| L.6 clock follow | substituted (USB out, first run) | lock 9–12 ms, band 11.5–14.3 ms; after 3 s without clock no resume until a new Start |
| step 4 backup, verify | done | 1 project, 2 songs, 9 blocks, kind 8 included; verify PASS |
| step 5 probe | done | **SDK accepted USER 471040**: ACTIONS `USER 471040 SONG READY`, `FREE 318K RECLAIM 0K` (80 block sectors); capability reply 397312 |
| step 5 restore onto the moved layout | done | **Verify PASS, 14 items** |
| step 5 save + verify | done | verify stops at the changed project only (slot 16, byte 3836 = its name); run D: 20 erases max 18.1 ms, loop max 220.6 ms |
| Bluetooth, power cycle, L.7 | need a person | |
| step 6 factory V16 | **skipped** | the V16 restore turns force flash on, and the page then probes every MIDI input (12 here, 10 of them the AUDIO4c's); its 12 s connect timer expires twice and it sends its identity query to ports that are not the SMK-37. Nothing was installed |
| step 7 way back (local diag-r2) | done | `USER 536576 SONG OLD DATA` as 24.5 says; ERASE OLD; restore + **Verify PASS, 14 items** |
| final install of the published diag | **STOP** | "Timed out waiting for reconnection": the device enumerates as its update loader ("USB Composite Device MIDI 1", Jieli 4d4a:4155); not retried, nothing sent since (stop-state.txt) |

Readings. MIDI out timing is far outside SPEC 14.3's 2 ms: a 14–19 ms band on USB, a control loop of
5.5–6.3 ms mean and 12–19 ms worst; the screen takes about 4 % of the time (79 calls/s × 0.54 ms), so
drawing does not set the 5.5 ms period, though its 10.8 ms worst call adds to the worst loops. Timing is
Phase 1's first item. A save during play stops MIDI out and audio for about 215–225 ms (the flash erase
blocks interrupts for up to 17.6 ms each); a song transfer during play starves the USB MIDI output for its
whole length. Saves and transfers belong to the stopped state. The moved boundary works: the SDK, the
loader, song storage, the full restore and the way back all passed.

### 25.3a Continuation (2026-11-08 afternoon): port fix done, the loader resume refused, stopped

**Step 1, state.** The SMK-37 was **not** running Classic Tabby. It was still in its update loader:
USB 4d4a:4155 "USB Composite Device", the same device number since 16:50:07Z. Over ALSA rawmidi from
Python the loader answered nothing (identity request, command 0, command 17; Rx stayed at 2706). In
Chrome it answered command 17 with **`ota-SMK378b7dff801f1b0876`**, a tagged loader. The tag is
the build id of **tabby-v03.3-diag-r2**, the build the step 4 backup was made on.

The one authorized resume ran at 18:29:30Z with `workbench.mjs resume` and the fixed page
(pages/diag-r3, build 3276f3c6…). It was **refused at Connect**: "Connected hardware does not match
this SMK37 model". No image byte was sent. **Stop rule: not retried, not force-flashed, not
power-cycled.** The state is in stop-state-2.txt and loader-identity.txt.

**Why the final install of 16:50 timed out.** For a tagged update the page sends the target's build
id with command 50. After the hand-off it waits only for `ota-FM-1_015`, `ota-<old identity>` or
`ota-SMK37<its own build[0:16]>`. The published diag (6ada2215…) waited for `ota-SMK376ada2215…`.
The loader came up with the tag of the **previous** update (diag-r2), so waitFor never matched. The
page closed the link and gave up after 40 s. Today's Connect fails on the same check. Not yet
explained: why the loader kept the old tag. It is set by the vendor loader or SDK code, not app/.
Two ways out, the user's decision:
- the fixed workbench carrying the diag-r2 image, whose tag the loader reports;
- a page change that accepts any `ota-SMK37…` tag after the model has been confirmed.

**Step 2, workbench port fix (done; sdk/WebUpdate.js, sdk/Update.html.in, sdk/I18n.js).**
- The update, force-flash and V16 flows open only ports named like the SMK-37 or its Jieli loader
  (`UPDATE_PORT`: smk37, sinco, usb midi, composite, jieli). The FM-1 names and the loose "ota"
  match are gone.
- Force flash no longer widens the search to every input.
- When no port name matches, or more than one port answers, connect() sends nothing more and fails
  with code CHOOSE_PORT. The page then lists the candidates (#update-port), and the next Connect uses
  only the picked input.
- tests/workbench/update-ports.mjs covers 7 scenarios, each with 12 fake ports, 10 of which are the
  AUDIO4c. Results: 18 ok on the fix; 10 of 16 fail on the old code, including force and V16.
- make check, lint and suite passed (suite at d9e83f0 plus these changes, 2026-11-08 18:28Z).
- On the real rig, the fixed page made two Connects (12 inputs) and queried only the loader port.
  The AUDIO4c's kernel Tx counters stay at 40 bytes on DIN to HST6 and 0 on HST7/HST8. That is
  exactly what the two unfixed V16 Connects of the morning sent (2 Connects × 2 identity queries ×
  10 bytes, before the timer ran out), so the fixed page sent the AUDIO4c nothing.
- Pages built locally, not published:
  - pages/diag-r3: tabby-v03.3-diag from the current source.
  - pages/v01-fixed: the fixed workbench carrying the official Open V01 image, SHA-256 09fc9346…,
    checked byte-for-byte against official-release/.

**Steps 3 to 5 not run** (the stop rule): the TRS test on Open V01 and V16, the source comparison,
and the final restore. One fact from the source: app/board/panel.c's `fm1_io_trs_midi_enabled()`
returns 0 in upstream V01 and here alike. By the SDK header it gates the TRS **receiver** only.

### 25.3b The first way out: diag-r2's image, resume stopped by a driver bug (2026-11-08 19:05Z)

- **The tag reproduced.** diag-r2 was rebuilt at d9e83f0, the commit of the tree it was built
  from at 08:33, in its own worktree with `DIAG=1 DISPLAY_VERSION=tabby-v03.3-diag-r2`. Results:
  - build id 8b7dff801f1b0876…, which gives the tag `ota-SMK378b7dff801f1b0876`, the one the loader
    reports;
  - the image (SHA-256 4141e7ad…) and every package field are identical to what pages/diag-r2
    carried.
- The page tag check is unchanged. pages/diag-r2-fixed is the fixed workbench, built from the
  current source around that package.
- **The resume (once) failed before it started.**
  - Connect found the loader and entered resume mode, and the page showed its model question.
  - workbench.mjs v0.3 had two dialog handlers. Both accepted the question, the second accept
    threw, and the script ended and closed the browser before the update's first query.
  - The loader received 10 bytes, the Connect's identity query, and no image byte.
  - **Stop rule: not retried.**
- The driver is fixed (v0.4: one handler that accepts the model question only for "SMK-37 Pro").
  Checked on a dummy page: Pro accepted, Elite refused, the restore confirmations accepted.
- The device is in its loader as before. Steps 3 to 6 are not run.

### 25.3c The approved resume: the write never finished (2026-11-08 19:53Z)

- **Checked before sending:**
  - the loader reported `ota-SMK378b7dff801f1b0876`;
  - the page (pages/diag-r2-fixed) carried image 4141e7ad….
- **What happened:**
  - Connect entered resume mode and the model question was confirmed (SMK-37 Pro). Then Start
    update.
  - The page showed "Writing firmware" for 8 minutes, with no error and no reboot. workbench.mjs
    gave up after 8 minutes and closed the browser.
  - On the loader's port: 125 MB sent and 6.9 MB received, for a 492084-byte image. The loader
    kept re-requesting blocks and never completed.
  - The kernel logged `urb status -115` twice on usb 1-1.
- The device is still the loader (4d4a:4155, device 12). **Stop rule: not retried.** By the
  user's instruction, the resume was handed to the user as manual steps in Chrome (the same page
  from localhost:8711). Steps 3 to 6 are not run.

### 25.5 Task 11C: after the Mac recovery (2026-11-08 evening)

- **Recovery (by the user, no flash).** After a power cycle on the user's MacBook the SMK-37
  left the loader and enumerated as "SMK37 Open" (Jieli Technology, 3654:7756), on normal
  firmware with working keys. Nothing was flashed on the Mac.
- **Firmware on the device now** (read over USB from the NUC, read-only, 2026-11-08 16:06 PST;
  `usb-readback.py identity --seq`; file hardware-runs/2026-11-07/2026-11-08-after-mac/):
  identity `SMK-37 Pro_8000001`, capability family 8, state 0, **build id
  `8b7dff801f1b08768bb95855ed11b92e894a65cd284caff07bbf204da06f9449`** (= tabby-v03.3-diag-r2,
  the tag the loader held); USER 536576 (song region 462848), extension flags 255 (diag counters
  and settings kind 8 present); project info version 4, 16 slots; song storage state 2 (OLD DATA),
  free 0, reclaim 0. The step 4 backup has not been restored.
- **1. Port names (fixed, not published).** CoreMIDI reports the device as "SMK37 Open" with 3 or
  4 trailing spaces (the USB product string is space padded: the NUC's kernel also logs
  `Product: SMK37 Open   `), and the input and output endpoints need not carry the same padding.
  Pairing compared raw names, so no input/output pair formed and the page connected to nothing.
  sdk/WebUpdate.js now normalizes every name (`portName`: NFKC, NUL and control characters to
  spaces, white space collapsed, trimmed, lower case) before matching and before pairing an
  input with its output, for the loader ("USB Composite Device", Jieli), Open firmware ("SMK37
  Open") and the factory names ("SMK-37 Pro", "SINCO-MIDI", "USB MIDI"), in the macOS, Linux and
  Windows forms. No silent failure: no matching port -> CHOOSE_PORT with every input and a
  message (as before); a chosen input without a same-name output -> CHOOSE_PORT with that message
  (was a dead end); the reconnect wait times out with code NO_DEVICE and the ports seen; the
  project library fails with NO_PORT and the page shows the port list (connection details).
  tests/workbench/update-ports.mjs v0.2 adds scenarios H–O (macOS 3/4 spaces, mismatched
  endpoint padding, mixed case, NUL, NBSP, Linux and macOS loader and factory names, the library,
  the error paths): 46 ok; the old code fails 17 of 44. make check, lint, workbench-test and
  test-fast pass.
- **2. Stale loader tag.** Kept in left-to-build, with today's facts added (the loader kept the
  diag-r2 tag across the failed install; the published page waited for its own tag and timed
  out).
- **3. The NUC's USB failure (recorded; not understood).** The approved resume (25.3c) sent
  125,162,049 bytes and received 6,937,112 for a 492,084-byte image (about 254 times the image)
  over 8 minutes; the loader kept re-requesting the same blocks and never finished; the kernel
  logged `usb 1-1: urb status -115` (EINPROGRESS) twice. The device was on root port 1-1 at full
  speed (12 Mb/s) on the same xHCI bus as the AUDIO4c (480 Mb/s). Python over ALSA raw MIDI never
  got a reply from the loader while Chrome did. The same image was already in flash and boots,
  so the image was not the cause.
  **Proposed read-only link test (no flashing; all commands are queries Connect already sends):**
  1. `usb-readback.py soak --rounds 2000` on Open firmware, on root port 1-1 and on 1-4, with and
     without the AUDIO4c attached. Pass: 0 timeouts, 0 malformed, every reply byte-identical, no
     kernel `urb`/reset/disconnect lines. First sample today on 1-4, AUDIO4c attached, 50 rounds:
     **pass** (100 replies, round trip 1.12 / 1.19 / 2.26 ms min/median/max, no kernel lines).
  2. Volume device-to-host: the workbench's full backup read path (read-only downloads), twice,
     compared byte for byte.
  3. Volume host-to-device, the direction that looped: queries sent back to back without waiting
     (several in flight, about the loader's block rate), counting the replies.
  4. With the user present: `sudo modprobe usbmon` and a capture of bus 1 during 1–3 to see
     whether OUT URBs are being cancelled or resubmitted (what -115 points at), and
     `/sys/bus/usb/devices/1-*/power/control` (today `on`, so autosuspend is not the cause).
  5. The same soak from the MacBook, so the computer is the only difference.
  If any step fails on the NUC and passes on the Mac, the NUC's USB is the cause; installs stay on
  the Mac either way until the user changes the rule.
- **4. Tools.** tools/linux/hw/usb-readback.py v0.2 (read-only: identity and soak; `--seq` uses
  the ALSA sequencer so it works while Chrome holds the port).

### 25.6 Task 11C part 2: does AUDIO4c audio on the same controller break the SMK-37's transfers? (2026-11-08)

Read-only toward the device throughout (usb-readback.py v0.4 `condition`, `--seq`; files in
hardware-runs/2026-11-07/2026-11-08-usb-test/). Each condition: 2000 rounds of identity (17) and
capability (49) = 4000 queries, then two read-only backup reads (workspace + tuning, settings, 8
timbres, the DX7 tracks' patches, 16 slot names, 16 song records: 300 queries, 14,592 bytes, all
songs empty), compared byte for byte; "streaming" = arecord capturing the AUDIO4c's 8 inputs at
48 kHz for the whole run (PCM state RUNNING before and after, no xrun reported).

**Controllers.** The NUC has one USB controller, Intel Sunrise Point-LP xHCI at PCI 00:14.0; every
port is on its bus 1 (USB 2 root hub; bus 2 is the same controller's 5 Gb/s side, empty). The
AUDIO4c is on port 1-3 (480 Mb/s), the SMK-37 at 12 Mb/s on 1-4 (back port) or 1-1 (the port it was
on during the failed update). So the "back port" is not a separate controller: both SMK-37 ports
share the controller and root hub with the AUDIO4c; only the audio traffic varies.

| | port | AUDIO4c | replies | timeouts / malformed / differing | round trip ms min / median / p99 / max | backup reads | kernel |
|---|---|---|---|---|---|---|---|
| a | 1-4 | streaming | 4000/4000 | 0 / 0 / 0 | 1.08 / 1.17 / 1.30 / 6.60 | 2 x 14592 B, identical | none |
| b | 1-4 | idle | 4000/4000 | 0 / 0 / 0 | 1.09 / 1.18 / 1.34 / 3.47 | identical | none |
| c | 1-1 | streaming | 4000/4000 | 0 / 0 / 0 | 1.07 / 1.17 / 2.29 / 4.51 | identical | none |
| d | 1-1 | idle | 4000/4000 | 0 / 0 / 0 | 0.33 / 1.18 / 2.30 / 4.57 | identical | none |

**Conclusion: shared-controller audio traffic is not the likely cause of the update loop** — no
error, timeout or kernel message in any condition, and audio moved only the round-trip tail
(max 6.6 ms vs 3.5 ms on 1-4), never a reply. Limits: these are small queries (about 12 bytes out
per query) to the Open firmware, not the loader's sustained 512-byte blocks host-to-device; the
loop and `urb status -115` happened with the Jieli loader on the other end (which also never
answered Python over raw MIDI while Chrome got replies).

**Rule that follows.** Do not blame or work around the AUDIO4c (no need to unplug it or stop
audio for SMK-37 work). The NUC stays read-only toward the device (SPEC 15) because the cause is
still unknown and now points at the loader's host-to-device path, not the shared controller.
Next read-only steps, with the user present: a host-to-device volume test (queries sent back to
back, several in flight), a usbmon capture of bus 1 during it, and the same soak from the Mac.
Installs stay on the Mac.

**TRS MIDI out (item 2).** Passive watch (`midi-watch`, sends nothing) on all 10 AUDIO4c MIDI inputs
and the SMK-37's USB out while the user played keys, the device on tabby-v03.3-diag-r2:
- run 1 (150 s): no keys reached the window (USB: clock only) — not counted;
- run 2 (120 s): USB carried 316 note-on / 316 note-off (channels 1 and 10), 48 other, 5765 clock;
  **the AUDIO4c received nothing on any input (kernel Rx counters +0 on all 10)**;
- run 3 (120 s), after the user routed the AUDIO4c's DIN input to all outputs in Auracle X: USB
  166 note-on / 166 note-off (channel 1), 5764 clock; **the AUDIO4c again received nothing (+0)**.
Nothing from the SMK-37's TRS out reaches the AUDIO4c while USB carries the notes and clock. Not
yet separated: our firmware not sending on TRS, the TRS adapter type (A/B) or the cable. Checks
without a device write: Auracle X's DIN input activity while keys are played; the adapter type.
The Open V01 comparison needs an install (the user, from the Mac).

**make suite** after the port-name fix: **passed** 2026-11-09T02:10:00Z at c80c166 (crosscheck, test, midi-import-sim, host-sanitize; the uncommitted changes were only this section and usb-readback.py, which the suite does not run).

### 25.7 L.9 closed: TRS MIDI out isolation (2026-11-08, read-only toward the device)

Wiring: the SMK-37's TRS MIDI out, through the **type A** adapter (user read the label), into DIN
input 1 of the CME H4MIDI WC (USB 7104:2100, ALSA card 3, ports "H4MIDI-WC Port 1..4"), plugged into
the NUC. Passive `usb-readback.py midi-watch` v0.5 (sends nothing) on all 4 H4MIDI WC inputs, all 10
AUDIO4c inputs and the SMK-37's USB out at once; the device on tabby-v03.3-diag-r2; user played
keys for about 15 s (file 2026-11-08-usb-test/midi-watch-l9-adapter1.*):

| port | received |
|---|---|
| SMK-37 USB out | 152 note-on, 152 note-off (channel 1), 2884 clock |
| H4MIDI WC Port 1 (DIN in 1) | **152 note-on, 152 note-off (channel 1), 2882 clock**; kernel Rx +3793 bytes |
| H4MIDI WC Ports 2-4, all 10 AUDIO4c inputs | nothing (kernel Rx +0) |

Every note that left on USB also arrived from the TRS jack. A type B adapter was not available, so
step 2 (swap) did not run; step 3 (a known-good DIN source into the AUDIO4c) was conditional on
both types failing and did not run either.

**Conclusion: not the SMK-37's TRS output and not the adapter type (type A works); the fault is on
the AUDIO4c input side** (its DIN input, the DIN cable to it, or its internal routing; the earlier
runs, 25.3 and 25.6, gave 0 bytes on all 10 AUDIO4c inputs, also with DIN routed to all outputs in
Auracle X). Confirming which of those needs the step 3 test (a known-good DIN out into the
AUDIO4c). **L.9: adapter type A.** For the timing measurements (L.2, L.6), use the H4MIDI WC Port 1
as the DIN monitor (midi-monitor.py `--port H4MIDI-WC Port 1`) until the AUDIO4c input is fixed.

### 25.4 First run (2026-11-07, before the erase approval)


Device found on **tabby-v03.0** (build 77077ef3…), not v03.2; tabby-v03.2 was installed first from
its release page. Every install took about 9 s through the page and came back with its identity
`SMK-37 Pro_8000001`. Song storage reported **OLD DATA** (the V01 sample bank was never erased).

| Item | Status | Result |
| --- | --- | --- |
| step 1 backup on v03.2 | done | 0 projects, 0 songs, 0 blocks, USER 536576, no kind 8 |
| step 1 restore | refused (precondition) | "Song storage holds old data … Run ACTIONS > ERASE OLD SAMPLE/DX7 on the device first. Nothing was changed." The restore checks song storage even when the file holds no songs; that check is stricter than it needs to be |
| step 1 verify | done | Verify PASS, 2 items |
| step 2 install main page | done | tabby-v03.3-diag (6ada2215…) installed; verify against the step-1 file PASS. Then the local diag with command 26 (tabby-v03.3-diag-r, 2f82301b…) for the measurements |
| ERASE OLD (needed for every song step) | **blocked** | command 26 {3} was refused by the agent's permission system (irreversible deletion); waiting for the user |
| run A (60 s at rest) | done | loop 10941, **mean 5.484 ms, max 12.293 ms**; scans 14727/s, longest gap 0.337 ms |
| run B (100 USB notes / 2 min) | substituted | loop **mean 5.507 ms, max 13.266 ms**; scans 14452/s, gap 0.400 ms; L.4 needs a person |
| L.9 TRS adapter | **fails** | the device plays (FM6 audible; 48 note-ons on USB in 12 beats) but the AUDIO4c DIN input has received 0 bytes (kernel counter). Adapter type, cable or the AUDIO4c's DIN routing: needs a person. DIN steps stopped |
| L.2 (DIN band) | not run | no DIN signal, and no song storage |
| L.6 clock follow | substituted (USB out) | lock 9.0 ms (first run) and 11.5 ms (restart) after the first clock after Start; lag behind the master's 16th mean 7.2 ms, **band 14.3 ms** and 11.5 ms; after 3 s without clock the sequencer **did not resume** when the clock came back (0 notes until the next Start); Stop stops it |
| FM6 vs MIDI out (user's addition) | substituted (USB out) | FM6 onset after the same note on USB: mean 7.2 ms, std 5.1, p05 1.2 ms, p95 15.6 ms (188 of 240 notes paired; indicative) |
| L.3 save with a held FM6 note | done | 5 erases (longest **17.8 ms**), 8 writes (longest **29.1 ms**, 4096 B); control loop max **217 ms**; scan ISR gap 17.6 ms; audio **silent for 220–224 ms**, starting 7–10 ms after the save command; no clicks |
| L.3 save during play, COMPACT | not run | needs song storage (COMPACT) or a clock thread through the save; COMPACT is refused while playing, as on the panel |
| L.7, Bluetooth, power cycle | need a person | no per-port power switch; the SMK-37 has a battery |
| steps 4–7 (probe, restore, V16, way back) | waiting | every restore onto the moved layout and the way back needs ERASE OLD |

## 26. Task 12 — Phase 0 (make room, tabby-v04.0) and the Phase 1 timing investigation (2026-11-08)

Task text: docs/tasks/TASK-12-phase0-and-timing.md. Device rules: SPEC 15 (no unattended writes,
no installs from the NUC; DIN timing on the CME H4MIDI WC Port 1 with the type A adapter).

### 26.1 A1: the storage move becomes the normal layout

**What changed.** The default USER size is 471040 (app/ct_layout.h v0.2, build.py v0.9,
build-web.py v0.5, sdk/Build.ps1, the simulator, the workbench). `USER_BYTES=536576` still builds
the old layout (the define and the build-identity input are added only for a size other than
471040). Song region: 97 sectors = staging + 16 records + 80 block sectors (pool 326080 bytes;
web/import/song-format.js v0.6). Commands 27 (capability: version, flags, USER size) and 28
(ERASE OLD DATA, confirm bytes "ERASE") in app/transfer.c; reply code 76 = refused while playing.
ACTIONS > ERASE OLD DATA now asks for confirmation (it ran on the first SAVE before, and the erase
prompt showed on COMPACT). The workbench shows OLD DATA after connecting and offers Erase old data…
behind a dialog. Tests: tests/workbench/backup.mjs v0.3 (the 536576 backup restores into the 471040
layout and verifies; the move on real old-layout flash; planted OLD DATA erased through command 28;
27/28 replies), tests/host/smoke.c v0.9 (layout constants from CT_USER_BYTES). Simulators:
`make web-diag` (471040, diag), `make web-old536` (536576, diag; was web-probe64).

**Migration (installing tabby-v04.0 over V01, V16 or tabby-v03.x, which use 536576).**
1. On the current firmware: workbench > Projects & sounds > Connect project library > Full backup.
   Keep the file. Only tabby-v03.3-diag and later put the device settings (transfer kind 8) in the
   file; from older firmware the settings are not in it (the file says so).
2. Install tabby-v04.0 (from the MacBook, SPEC 15).
3. What is lost until the restore: every project slot, the device and session settings (slot 16),
   and every song. Bluetooth pairings are lost for good (pair again). Kept: the tuning sector.
4. Connect the project library. If the page (or ACTIONS) says OLD DATA, run Erase old data (it asks
   first). Then Full restore with the file, then Verify: it must pass.

**Going back to tabby-v03.x.** The same in reverse: Full backup on tabby-v04.0, install the v03.x
build from its permanent page (builds/<tag>/, A5), Erase old data if offered, Full restore, Verify.
Songs written by v04.0 restore onto v03.x unchanged (the song format did not change); the 80-sector
pool is smaller than v03.x's 96, so anything that fits on v04.0 fits on v03.x.

### 26.2 A2: removals (the stock step editor)

Scope as decided with the user on 2026-11-08 (option 1 with details): the step-editing parts go
(STEPS 1/7, 2/7, 4/7, STEP_EDIT, RHYTHM, REC and the step logic, CLICK and COUNT IN); the settings
that are not pattern data stay on the device, each in exactly one place (SPEC 16.2): HOME K4 BPM
(existing), MIDI TRACK on SHIFT + SEQ (existing), and one new SYNC / MIDI page on SEQ from any page
(K1 CLOCK, K2 CLK IN, K3 SWING, K4 SEQ OUT, PRESETS KEY OUT). Kept: ARP_EDIT and the arpeggiator,
the factory DX7 bank, the stock pattern in the project (load, save, play).

Code: app/screen.c v0.2 (pages, controls, LEDs, header, overview, ACTIONS, web targets), app/
smk37_controls.c v0.1 (no pad-step mode), sdk/Simulator.js (no step grid), sdk/Update.html.in and
sdk/I18n.js (Help: chapters 09, 11, 12 in English and 13-15, 16, 19, 21 in Chinese with their
translations; the simulator's page buttons), README.md. Tests: tests/host/smoke.c v0.10 section 14
(SEQ opens SYNC / MIDI; K3 SWING, K4 SEQ OUT, PRESETS KEY OUT, K1 CLOCK change; SHIFT + SEQ MIDI
TRACK K2 OUT CH; REC records nothing; pages 13 and 14 refused); tests/workbench/manual-i18n.mjs
v0.2 (the removed texts are absent). make check, lint (no new warning) and test-fast pass.

Bytes: 451620 -> 443396, **-8224 bytes** (FLASH-BUDGET 17), against about 8 KB estimated for the
full removal in the Task 10 assessment, section J.

### 26.3 A3: no flash write during play

One test, `ct_transport_running()` (app/song.c v0.5: a song plays or the stock transport runs),
guards every flash write: app/project.c (save slot refuses with GROOVE_PROJECT_PLAYING, reply code
76; the deferred settings / session save waits for the stop), app/transfer.c v0.2 (uploads of kinds
5-8 refused at begin and finish, commands 24 writes, 26 {2,3}, 28), app/song_storage.c v0.8 (a
running erase or compaction pauses), app/screen.c v0.3 (STOP TO SAVE, STOP TO ERASE / COMPACT). The
workbench (sdk/WebUpdate.js) calls writeGuard() before every flash write and sends nothing while
command 27's live byte says the device plays. The complete table is SPEC 16.3.

Tests (all pass): tests/workbench/backup.mjs v0.4, section 8 and the erase-pause block: 25 checks
while playing and stopped. Found on the way: every MIDI setting change (OUT CH, SEQ OUT, KEY OUT,
CLK IN, OUT PORT, SEQ) stops the stock transport by itself (the old channel is reset), so only
session preferences such as OCT can change during play; the deferral covers them.

### 26.4 A4: the counters in the normal build, and the loop profile

The `#ifdef CT_DIAG` blocks of app/diag.c, app/diag.h, app/board/scan.c, app/transfer.c,
app/project.c and app/screen.c are gone: the counters, command 25, transfer kind 8 and the ACTIONS
storage lines are in every build; capability bits 6 and 7 are set by the normal build. `DIAG=1`
now adds only command 26. The loop profile (app/diag.c v0.3 `ct_prof_*`; sections and their hooks
in SPEC 16.4: router, song, storage, screen, panel, transfer, project, SDK, plus the routing
task's MIDI input) is read with command 25 requests 4 and 5; the workbench's Diagnostics panel
prints it under "control pass" (sdk/WebUpdate.js diagRead / diagText).

Reading the profile on the device (Part B): Projects & sounds > Connect project library >
Diagnostics > Reset counters, run the measurement, Read counters, Copy as text. Or from the NUC,
read-only: `~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/usb-readback.py` does not read command 25
yet; Part B adds the profile read to it (reading counters is allowed; the reset is a write to RAM
only, but needs the user present under SPEC 15).

Tests: tests/workbench/backup.mjs v0.5 section 5 (normal build: bits 6 and 7, kind 8 in the
backup, no command 26; the profile counts passes, the sections add up to the pass within 2 %, the
screen, router and transfer hooks are counted). make check, lint (no new warning), test-fast pass.
Size: 447748 bytes after A3 + A4, margin 71709 (FLASH-BUDGET 17).

### 26.5 A5: permanent build pages and the safe resume for a stale loader

**Why.** The 2026-11-08 incident (25.3a-c): an interrupted install left the SMK-37 in its Jieli
loader, named `ota-SMK378b7dff801f1b0876` after the build it was receiving, and the loader accepts
only that build. The published page waited for its own tag until the timeout and said nothing
useful; the build the loader wanted had no page of its own until one was made by hand (`/recover/`).

**The pages.** `https://seattleuser0.github.io/classic-tabby/builds/<tag>/` for every published
build, never removed; `builds/index.json` (schema 1: tag, build, loader, version, page, published,
source, note; ordered by date) and `builds/index.html` (the same as a static list; no scripts).
Tool: `tools/linux/builds-index.py` (`add --tag T --site DIR [--published D] [--note N]
[--source URL] [--replace]`, `index`, `redirect --path P --to T`). `add` refuses to overwrite a tag
that holds a different build id (pages are permanent); the same build id is replaced quietly.
`publish-pages.py` v0.4 calls it on every tagged publish and keeps `builds/` and `recover/` on a
root publish, so `make publish` needs nothing more. Test: tests/linux/builds-index-test.py (21
checks: hosted and standalone sites, permanence, index rewrite keeping dates and notes, redirect,
the command line).

**The import (done once, gh-pages 89ef820, worktree build/gh-pages).** The sites came from the
gh-pages history, so the bytes are the published ones:

```
git -C build/gh-pages archive 4c675ae | tar -x -C <staging>/tabby-v03.2        # the v03.2 root
git -C build/gh-pages archive e0811fa | tar -x -C <staging>/tabby-v03.3-diag   # the v03.3-diag root
cp -a build/gh-pages/probe64/. <staging>/tabby-p0-probe64/
cp build/gh-pages/recover/index.html <staging>/tabby-v03.3-diag-r2/index.html  # bytes = diag-r2-fixed page
python3 -I tools/linux/builds-index.py add --tag tabby-v03.2 --site ... --published 2026-11-05 --note ...
   (likewise tabby-v03.3-diag 2026-11-07, tabby-p0-probe64 2026-11-07, tabby-v03.3-diag-r2 2026-11-08
    with --source https://github.com/SeattleUser0/classic-tabby/archive/c80c166.zip)
python3 -I tools/linux/builds-index.py redirect --path recover --to builds/tabby-v03.3-diag-r2/
```

The diag-r2 entry is the untagged resume page: firmware built at d9e83f0 (DIAG=1, 536576 layout)
inside the workbench of c80c166; its index entry names both commits, and the source link is the
archive of c80c166 (a commit archive; both commits are on the pushed branch). Checked from a local
HTTP server before the push: every moved page returns 200 and loads its three scripts from its
own `assets/smk37/` (relative URLs), `/recover/` redirects. Sizes: 5.8-5.9 MB per hosted build,
3.0 MB for the single-file resume page.

**Safe resume (sdk/WebUpdate.js, Task 12 A5).** `loaderTag(identity)` reads the 16 hex digits of an
`ota-SMK37…` name. In `connect()` and in `waitFor()`, a loader whose tag is not this page's build is
never treated as the page's own loader and never left to the timeout: the Updater asks its
`builds` lookup (a 5th constructor argument; the page passes `FM1Web.buildsLookup([...])` over
`./builds/index.json`, `../index.json` and `../builds/index.json` resolved against its own URL,
so the main page, a `builds/<tag>/` page and `probe64/` or `recover/` all find the same file) and
throws code `LOADER_MISMATCH` with `loaderTag`, `build` ({tag, page, url} or null), `indexState`
(`found`, `unknown`, `unavailable`) and `indexUrl`. The message names the tag, the build's own tag
when the index lists it, and this page's version; the page (`#loader-hint`, showLoaderHint) adds
the link to that build's page, or to the `builds/` list for an unknown tag, or (offline page, no
network) says to open the list online. Force flash does not change the answer: the loader accepts
only its build. The old behaviour was the generic "Connected hardware does not match this SMK37
model" at Connect and a silent skip until `NO_DEVICE` in waitFor. The three messages have English
patterns in sdk/I18n.js. Tests: tests/workbench/loader-tag.mjs (40 checks: own tag resumes; a known
tag names the build and its URL, only the identity query reached the loader, the port is closed;
an unknown tag; no index, failing fetch, throwing lookup; waitFor ends at once; matchBuild and
buildsLookup over candidates with a 404 and a malformed index; every message translates; the page
wiring). make test-fast passes (the two new tests are in workbench-test, Makefile v0.19).

**What this does not cover (A5).** The pages of the historic builds carry their own, older workbench:
tabby-v03.2 and tabby-v03.3-diag refuse a mismatched loader with the old generic message, and the
diag-r2 page (c80c166) with the Task 11C messages; only pages published from here on (tabby-v04.0
and later, and the root page) have the lookup. A loader can be in the list only if its build was
published; a private build's tag reads `unknown`, and the message says to use the page that built
it or to power-cycle.

### 26.6 A6: the tabby-v04.0 release and the install steps

**Release build.** `make check`, `make lint` (the same 3 warnings as after A2: two
missing-field-initializers in screen.c, one unused variable in scan.c; a report, not a gate),
`make suite DISPLAY_VERSION=tabby-v04.0` passed at 40fdd71 (crosscheck identical on both tracks,
test, midi-import-sim, host-sanitize; 4 min 59 s with Orange Cat work beside). `make package
TAG=tabby-v04.0 DISPLAY_VERSION=tabby-v04.0`: build id
b6e9590223446363dff53a2190bd80eb020233c63dd2d90cfa778e361ce0f708, `.fwsc` SHA-256
368c613022672f8918cb990cd886970edc771014afba2dd93a736577e29f24af (487988 bytes; the package tracks
FLASH_BIN_SIZE, now 466944 with the slack given to VM), offline workbench SHA-256
fe7d9604786551081b00e59d16f3fd16028c2e191b9ea5b5bb74774e426122e8 (3126358 bytes). App image
447716 bytes, **margin 71741** to the 519457-byte limit of the moved layout (FLASH-BUDGET 17);
heap 198636. The loader tag of this build is `ota-SMK37b6e9590223446363`. Publication record: 9.1
and 9.3g.

**Install steps for the user** (MacBook, Chrome, the SMK-37 plugged straight into the Mac; SPEC 15;
the full text with every screen is ~/Documents/Classic Tabby/INSTALL-tabby-v04.0.txt):

1. **Full backup on the current firmware** (tabby-v03.3-diag-r2, build 8b7dff801f1b0876): open
   https://seattleuser0.github.io/classic-tabby/builds/tabby-v03.3-diag-r2/ (the old `/recover/`
   address redirects there), Projects & sounds > Connect project library (identity `SMK-37
   Pro_8000001`), Full backup, save the file, then Verify with it: PASS. Keep the file.
2. **Install from the main page** https://seattleuser0.github.io/classic-tabby/ : Device update
   shows Version tabby-v04.0, build number b6e9590223446363 and the storage-move note. Connect
   device (identity `SMK-37 Pro_8000001`), tick the backup box, Start update, keep the tab open:
   preparing the loader, waiting for the device to reconnect, writing firmware, restart and verify,
   done.
3. **What ACTIONS shows**: boot screen tabby-v04.0; expected OLD DATA IN SONG STORAGE - SEE ACTIONS
   for six seconds; ACTIONS (hold SEQ 0.6 s) reads `USER 471040` with `OLD DATA IN SONG STORAGE`
   (expected) or `SONG READY` (nothing to erase). `USER 0 INVALID` or `USER 536576`: stop and
   report.
4. **ERASE OLD DATA if offered**: ACTIONS > ERASE OLD DATA > SAVE > "ERASE OLD DATA?" > SAVE
   (HOME cancels); or the workbench's "Erase old data…" after connecting the library, which asks
   first. Afterwards the SONG page says NO SONG HERE - UPLOAD FROM THE WEB WORKBENCH.
5. **Full restore and Verify** on the main page: Connect project library (badge tabby-v04.0), Full
   restore with the file from step 1, Verify PASS. Check projects, MIDI TRACK channels, SYNC / MIDI;
   pair Bluetooth again.
6. **If the install stalls**: close the tab, power-cycle the SMK-37 (USB stays), open the page of
   the build the loader waits for (for this install the main page or builds/tabby-v04.0/; any
   other build's page names the right one and links to it), Connect, Start update, confirm the model
   SMK-37 Pro. If the device boots normally after the power-cycle, read its version: tabby-v04.0
   continues at step 3, tabby-v03.3-diag-r2 starts again at step 2. No USB device at all: stop and
   report.

Going back to tabby-v03.x: full backup on v04.0, install from builds/tabby-v03.2/ or
builds/tabby-v03.3-diag/, erase old data if offered, restore, verify (26.1).

### 26.7 The tabby-v04.0 recovery page (2026-11-09)

**Why.** The user's install from the Mac left the SMK-37 in its loader as
`ota-SMK370000000000000000` (left-to-build: "The all-zero loader tag"). A power cycle on the Mac
did not leave the loader this time, and no published page accepts that name.

**What.** `https://seattleuser0.github.io/classic-tabby/builds/tabby-v04.0-recover/`, made by
`tools/linux/recover-page.py build` from the **published** tabby-v04.0 standalone page
(SHA-256 fe7d9604…): the firmware package is carried byte for byte (build b6e9590223446363,
.fwsc 368c6130…; a rebuild from source would change the build id, which hashes the manifest
that pins sdk/WebUpdate.js). Only the page's script text is patched (each patch must match once):
- the zero tag takes the existing model-confirmed resume path (as the vendor's unidentified
  loader); any other tag that is not this build is still refused (LOADER_MISMATCH);
- force flash can not be turned on by any path (Connect and Start update pass false; the
  checkbox is disabled; the "Enable force flash" button is hidden and inert; factory restore,
  which ticks force, is disabled; the migration group is hidden); a non-Open identity is refused;
- the capability query at Connect is retried four times on a timeout and then fails with
  "power-cycle and connect again; do not use force flash"; the identity queries are retried;
- all other checks are unchanged (package SHA-256, model, container, AC791N, directory and
  component CRCs, loader hash, the "SMK-37 Pro" confirmation, the build id after the restart).
- The page is not listed in builds/index.json (the user asked for this one directory only);
  the next index rewrite (`builds-index.py index`) would list it.

Tests: tests/workbench/recover-page.mjs (29 checks, in workbench-test): the zero tag resumes only
after the Pro confirmation, writes without command 50, and the restart check passes for this build
and fails for another; nonzero other tags are refused with and without force; force stays off,
the capability timeout is retried and never leads to migration or legacy; the built page carries
the tested WebUpdate.js verbatim and the published FM1_PACKAGE, and every write to the force
checkbox sets false.

Published 2026-11-09 08:48 UTC: gh-pages 953c3a9 adds only `builds/tabby-v04.0-recover/` (10
files); made at 95ec02b with the source link to that commit's archive. Standalone SHA-256
c4ef289ad6433f5f4da362135a52596e7f9dab6cc6b8c1dcf43d53a161d6d9c3 (3127637 bytes), index.html
24c3a033c98de69b03a31f7cae2ed56c5fe9d2c0229b2d027a0450b6a1296e87, patched script d06f5c09….js;
firmware asset 368c6130….bin and FM1_PACKAGE identical to tabby-v04.0; the page's own prepare()
passes on that asset. All 10 live files are byte-identical to the local build; the main page,
assets.json, builds/index.json and builds/tabby-v04.0/ are unchanged. Headless Chrome: no console
error, the notice shown, the force checkbox disabled, the force button and the migration group hidden.

### 26.8 The night of 2026-11-08/09: what happened, and the update page fix

**What happened (the user's install of tabby-v04.0 on the MacBook).**
- On the main page, Connect read the identity `SMK-37 Pro_8000001` (diag-r2), but the capability
  query (49) timed out. The page took that for other firmware: it reported "Device and current
  firmware recognized. To migrate, click Enable force flash and reconnect", and force flash was
  turned on from that offer.
- The forced (legacy) install skips command 50, so the SDK's loader tag (`target_id`, written
  only by command 50) stayed all zeros, and the device came up in its loader as
  `ota-SMK370000000000000000`. The page refused it ("waiting for build 0000000000000000, not in
  the list of published builds") and sent no image. No image byte was written.
- A power cycle on the Mac did **not** clear it: the device came back in the loader with the same
  name (on 2026-11-08 a power cycle had booted the image in flash).
- The recovery page `builds/tabby-v04.0-recover/` (26.7) connected to the zero-tag loader, asked
  for the "SMK-37 Pro" confirmation, wrote the image and passed the build id check after the
  restart. The SMK-37 runs tabby-v04.0; ACTIONS read USER 471040; ERASE OLD DATA was run; no
  restore was needed. It is back on the NUC (USB, back port; TRS out to the H4MIDI WC DIN in 1
  through the type A adapter).

**The fix (sdk/WebUpdate.js, sdk/Update.html.in, sdk/I18n.js; SPEC 16.5 items 4 and 5).**
- The zero tag (`ZERO_TAG`) takes the model-confirmed resume in connect() and is accepted by
  waitFor() while it waits for a loader; any other foreign tag is still LOADER_MISMATCH.
- The identity query is tried 4 times when a port opens (was 2); the capability query 4 times
  (`queryRetry`); on an Open identity that still does not answer, Connect fails with code
  NO_REPLY: "The device did not answer the version query after 4 tries. Nothing was written.
  Power-cycle the SMK-37 ... then click Connect device again." No migration, no force offer.
  Force ticked by hand beforehand keeps the old legacy path (the manual choice).
- The page's "Enable force flash and reconnect" button is always hidden and has no handler; an
  error never sets the force suggestion; for a non-Open identity (factory V16) the page says to
  tick Force flash by hand in "Migration, factory restore and forced updates". The manual's
  install chapter says the same, in both languages.
- Tests: tests/workbench/update-safety.mjs (30 checks, in workbench-test): zero-tag resume with
  and without the confirmation, the write without command 50 and the restart check; nonzero
  tags refused; 4 capability queries then NO_REPLY, never migration or legacy; a retry that
  succeeds; force by hand keeps legacy; V16 still migration; 4 identity tries; the page's
  static force paths; the English texts. make check, lint (the same three warnings), test-fast
  and workbench-test pass. recover-page.py v0.2 reads tabby-v04.0's WebUpdate.js from the tag and
  rebuilds the published recovery page identically.
- Publication: with the next release only; tabby-v04.0 is not republished.
  `builds/tabby-v04.0-recover/` is now listed on builds/ with a note on when to use it.

### 26.9 Part B: the Phase 1 timing investigation (2026-11-09)

#### B1: measurements (tabby-v04.0, build b6e9590223446363)

Rig: SMK-37 on the NUC's USB (back port); its TRS MIDI out through the type A adapter into the
CME H4MIDI WC DIN in 1, read as ALSA "H4MIDI-WC Port 1" (SPEC 15: not the AUDIO4c). USB is the
SMK-37's own port "SMK37 Open MIDI 1". Both inputs use kernel receive timestamps on one clock
(CLOCK_MONOTONIC), so DIN and USB are compared note for note. Tool: tools/linux/hw/run-12b.py
v0.1 (sends only commands 25 and 23; the songs were started with PLAY on the SONG page by the
user). Raw data: ~/Documents/Classic Tabby/hardware-runs/2026-11-09-b1/ (CSV, reports,
counters, the analysis files l2-1x16-analysis.txt and l2-8x16-analysis.txt).

Device writes this session, both authorized by the user at the desk: one ERASE OLD DATA
(command 28; 6 sectors; storage then SONG READY, 321976 bytes free, no restart; no A1 bug), and
the upload of timing-8x16 as song 15 and timing-1x16 as song 16.

Grid analysis: each line's note-ons are fitted to a straight line (least squares) and the error
to that grid is reported; "band" = largest minus smallest error. The songs are 60 bars (2 min).

| Run | Notes | Band DIN | Band USB | std | DIN behind USB |
|---|---|---|---|---|---|
| L.2 one line (song 16, 82.8 s steady) | 664 | 13.97 ms | 14.10 ms | 3.14 ms | 1.06 ms (0.10..1.31) |
| L.2 eight lines (song 15, 66 s in two stretches), per line | 531 each | 14.4..16.5 ms | 14.4..16.0 ms | 3.3..3.4 ms | |
| L.2 eight lines, all lines on line 1's grid | 4245 / 4231 | 23.34 ms | 17.11 ms | 4.10 / 3.47 ms | first note 0.99 ms |

- Eight lines, one step: the 8 note-ons of a step leave over 7.30 ms mean (max 9.30) on DIN and
  2.43 ms (max 3.05) on USB. On DIN that is the wire: 8 three-byte messages at 31250 baud are
  7.7 ms; line n's mean offset grows by about 1.0 ms per line (0.00, 1.26, 2.24 ... 7.31 ms).
- DIN adds one message time (0.96 ms) and nothing else: DIN and USB carry the same jitter, so
  the spread is made before the bytes leave the firmware, not by the transport.
- One line's std 3.14 ms is what an error spread evenly over 10.9 ms gives (width/sqrt(12)):
  the note waits for the next control pass. Note gaps were 113..137 ms around 125.
- Line 8 of timing-8x16 goes out on channel 10 (the track's OUT CH), lines 1-7 on 1-7.
- Song 15 shows CPU GUARD - VOICES ADAPTED on the device while it plays (eight internal voices
  per 16th); song 15 was stopped and restarted once by PLAY (19.3 s .. 23.3 s), fitted per stretch.
- At port open, USB delivered a burst of old note-ons (12 for song 16) queued while nothing read
  the port; they are dropped from the analysis (not song timing).

Loop profile (command 25 pages 4-5, reset at the first note; mean / max per pass):

| | Rest (30 s) | One line (125 s) | Eight lines (70 s) |
|---|---|---|---|
| Control pass | 10.00 / 12.16 ms | 10.61 / 14.03 ms | 12.49 / 19.21 ms |
| SDK between the hooks | 9.77 / 11.73 | 10.07 / 12.60 | 10.52 / 14.53 |
| Router (MIDI out sends) | 0.10 / 0.43 | 0.16 / 1.36 | 0.76 / 4.79 |
| Screen (panel, pages, LCD) | 0.08 / 0.42 | 0.32 / 2.23 | 1.08 / 2.83 |
| Song scheduling | 0.00 / 0.13 | 0.01 / 1.04 | 0.03 / 1.58 |
| L.1 (counts each flush, 2 per pass) | 5.01 / 11.94 | 5.31 / 13.67 | 6.24 / 14.60 |

An earlier partial one-line run with key presses on the panel: screen max 8.36 ms, pass max
18.04 ms. The USB comparison L.2 is the same capture (USB recorded with DIN at the same time).

#### B2: where the band comes from

Read from sdk/include/fm1.h, the app, and the disassembly of build/pro/sdk.elf (objdump).

- **The control pass runs on a fixed 10 ms SDK timer.** `app_task_handler` registers
  `sys_timer_add(NULL, tick, 10)`. `tick` calls `fm1_control_request`, which sets the byte
  `control_pending` and posts message 0x464d32 to the app task; while the flag is set a second
  request is dropped. `fm1_application_message` runs the pass (`fm1_r_f03cc16d330d`: groove_midi_poll,
  groove_samples_poll, groove_performance_idle, groove_project_poll, groove_transfer_poll,
  groove_edit_poll, groove_screen_control, effects_poll) and clears the flag after it. A tick
  that falls while a pass still runs or waits is lost, so the next pass comes 20 ms later.
- **The 10 ms is a constant inside the SDK.** `sys_timer_add`, `usr_timer_add` and
  `sys_timeout_add` are local symbols of libfm1_engine.a; the public API has no period setting
  and no timer for the app. `fm1_control_request` is a global symbol (not in the public header);
  the SDK itself calls it from `fm1_app_sysex` (the routing task), so a request from outside the
  control task is how the SDK works internally. A request made while a pass runs is dropped (the
  flag is cleared only after the pass).
- **Song notes.** The audio thread calls `groove_midi_clock` once per audio block (128 frames at
  44.1 kHz = 2.90 ms), which calls `song_tick` (app/song.c, FM1_AUDIO_CODE); due notes go into the
  router's lock-free lane 0. Only the control pass drains lane 0 (`groove_midi_poll`, and the
  app's second `ct_midi_flush` in the same pass: the "2.00 router calls per pass"). So a note
  waits from its audio block to the next drain: 0..10 ms, and 10..20 ms after a lost tick.
- **The SDK output path.** `fm1_midi_send` / `fm1_midi_send_port` are "control task only,
  complete messages <= 128 B; 0 = queued, not a delivery receipt; -2 = full" (fm1.h). The call
  checks `fm1_port_ready`, copies the message into a bounded per-port queue under a lock and calls
  `fm1_port_signal`, which posts to `midi_scheduler_task` (`connectivity_wl82_midi_signal`). That
  task pends on its queue and starts the UART (DIN) or USB transfer at once
  (`request_uart_transmit`, `request_usb_transmit`). Buffered per port, sent at once, no tick of
  its own, no timestamps; the SDK has no timestamped send.
- **Contexts that may send:** the control task only (the API rule). The audio thread and the
  routing task (`fm1_app_midi_received`) may not; the audio thread hands notes over through lane 0.
- **The numbers agree.** Pass 10.0 ms at rest is the timer. The old "5.5 ms mean" is L.1 counting
  both flushes of a pass. One line: a 0..~11 ms wait spread evenly gives std 3.1 ms (measured
  3.14) and a band near 11 ms plus lost ticks: 14 ms measured, 19 ms worst case seen before (Task
  11) and pass max 18-19 ms here. Eight lines add the DIN wire time (7.7 ms per step) and push
  the pass to 12.5 ms mean (router 0.76 ms, screen 1.08 ms, SDK 10.5 ms with eight voices and CPU
  GUARD), more lost ticks: 23 ms across all lines on DIN.

#### B3: fix options (proposed, none built)

Flash margin today 71741 bytes (FLASH-BUDGET); every option below fits easily.

| Option | Expected band (one line / eight lines all-lines) | Flash, RAM | Risk to audio | Proof on hardware |
|---|---|---|---|---|
| A. Pass on demand: `song_tick` calls `fm1_control_request` after it puts a note in lane 0; the app's last hook of a pass requests again if lane 0 is not empty (closes the "dropped while a pass runs" hole) | about 3-4 ms (the 2.9 ms audio block plus the task switch) / USB about 5 ms, DIN plus the 7.7 ms wire | about 150 B, 4 B | low to medium: an undocumented SDK call from the audio thread (the post must be safe there: if the audio callback runs in an interrupt, `os_taskq_post_type` may not be); extra passes run all hooks (screen too), at most one per audio block with notes | diag build first: L.2 one line band <= 5 ms, pass max, no extra CPU GUARD, audio capture of the AUDIO4c inputs free of clicks; check the audio callback's context in the disassembly before building |
| B. Slice the long work: screen paint and transfer work in slices with a `ct_midi_flush` between them, so no pass passes 10 ms and no tick is lost | about 10-11 ms (the 10 ms quantization stays; the 20 ms tail goes) / about 18 ms | about 300 B, 0 | none (less work per pass) | pass max < 10 ms in the profile with eight lines and panel use; band <= 11 ms one line |
| C. Timestamped look-ahead: the audio thread queues notes early with their due time, released at the due time | with only 10 ms passes: no gain (release is still per pass); with A: as A, and the DIN burst of a step can be sent half a burst early (about 3.8 ms), so the eight lines sit at +-3.8 ms instead of 0..7.7 ms | about 400 B, 1-2 KB queue | as A | as A, plus the per-line mean offsets on DIN centred on the grid |
| Sends from a timer | not allowed: sends are control task only, the SDK's timers are local symbols | | | |
| Back-to-back passes (request a pass at the end of every pass) | about 3 ms | small | high: the CPU runs passes all the time; audio and CPU GUARD suffer | rejected |

**Recommendation:** B first (safe, small, removes the lost-tick tail), then A behind a diag
build after the audio-context check; C only as A's refinement for DIN bursts. Target one line
<= 4 ms on USB and DIN.

**External clock follow needs:** clock in from a chosen port (USB, DIN, BLE); F8 timestamped
where it arrives (the routing task, `fm1_app_midi_received`) and passed to the audio thread
through a lock-free lane; the song advances one 16th per 6 pulses (24 ppqn) instead of by the
internal tempo; tempo shown from the smoothed pulse period. Start (FA): position 0, start on the
next pulse. Stop (FC): stop, note-offs, keep the position. Continue (FB): resume from the kept or
SPP position on the next pulse. SPP (F2): set the position (16ths) while stopped, and relocate
when it comes while running. Song mode today refuses to start in MIDI clock mode (Task 03
decision 4). Following adds the receive-to-pass wait to every note, so it needs A (or the same
wake) to be tight; on today's 10 ms pass it gets today's 14-20 ms band.

**The proposed clock-loss rule** (a gap under 2 s without Stop keeps position and relocks; a
longer gap shows LOST and waits for Continue or Start): sound; keep the 2 s. Changes I would
make: (1) hold after about 3 missed pulses (3 x the last period): stop advancing and send
note-offs, so no note hangs during a gap; show HOLD. (2) On relock within 2 s continue from the
held position (the sender has moved on; without SPP the device cannot know by how much), and
accept SPP at any time so a DAW relocate corrects it. (3) In LOST, pulses alone never restart the
song; Start, Continue (or SPP then Continue) do. (4) Stop always wins, at any time.

## 27. Task 13 — timing fixes (2026-11-10)

Task text: docs/tasks/TASK-13-timing-fixes.md. No device writes from the NUC; the user installs.

### 27.1 Step 1: option B, no pass over the 10 ms tick

**CPU GUARD, found before anything was changed** (SPEC 17.2 has the full description): it is the
SDK engine's per-audio-block render budget, raised in `audio_track_end` (a track's render passed its
deadline) and `audio_finish` (a block's total render passed its budget of 52244 or 59210 timer ticks).
It lowers the heavy track's voice limit by one, steals voices at once and declicks; after 344 quiet
blocks (about 1 s under 3/4 of the budget) it gives one voice back. app/screen.c only announces it
(the "adapted" count from `groove_audio_stats`, every 500 ms). During play it changes the sound of
the internal voices (fewer voices) but not MIDI out, the song clock or the control pass; its only
effect on timing is the CPU the audio thread takes from the control task. Task 13 does not change it.

**What changed** (app/diag.h v0.4, app/diag.c v0.4, app/screen.c v0.5, app/transfer.c v0.4,
app/samples.c v0.4):
- A pass budget: 6 ms of wall time from the start of the pass (`ct_pass_over`). Wall time includes
  the audio thread's share, which is what decides a missed tick.
- Song work first: `groove_samples_poll` runs `song_poll` before `song_storage_poll`; the router flush
  (groove_midi_poll) was already the SDK's first hook. Neither is ever deferred.
- Screen: the page compose (`draw`, a walk of the whole page) waits for a later pass once the pass is
  over budget (at most 120 ms past its 33 ms frame); each band paint starts only if the last band's
  time still fits (was: bands until 4 ms of the millisecond clock had passed, whatever the pass had
  used before); one band per 60 ms always goes, in plain rotation when over budget (a page that marks
  the same priority band on every compose would otherwise take all guard bands). Panel input
  (`apply_controls`) still runs in every pass; only the picture can be late.
- A router flush after every band: a note the audio thread queues while the screen paints leaves
  then, not at the next pass (about 1 ms later instead of up to 10).
- Transfer: a new request (not a cached retry, not MMC) waits for a later pass while the pass is over
  budget, at most 4 passes in a row (the mailbox stays full; the workbench's timeouts are far longer).
- Measurement: command 25 request 6, profile page 6 (56 bytes): busy passes, mean and longest busy
  time (pass start to the end of the screen hook), passes busy over 10 ms, lost ticks (periods over
  15 ms), deferrals per kind, a busy histogram. tools/linux/hw/tabby_link.py v0.5 reads and prints it.

**Tests** (tests/host/smoke.c v0.11, section 15; hooks in web/engine/Simulator.c v0.1: a cost per
band and per pass added to the diag clock, an event log, a note injected while a band paints):
- pages 19, 1 and 0 painted with 4 ms bands give the same picture as one unbudgeted paint; no pass
  is busy past the budget (longest 4.0 ms); at most 2 bands in one pass (1 measured);
- every pass 8 ms in at the screen (always over budget): the page still completes (guard bands);
- a song note queued before a pass leaves before the pass's first band; a note queued while a band
  paints leaves before the next pass;
- a capability request (command 27) arriving in an over-budget pass waits 4 passes and gets the
  same 21-byte reply as without the delay.
make check, lint (unchanged: 11 host and 3 target warnings, all pre-existing) and test-fast pass.

Size: app image 448516 bytes, +768 against the Task 12 A4 build; margin 70941 (FLASH-BUDGET 18).

What B can and cannot do: it removes the lost ticks the app causes (the 20 ms tail) and lets notes
queued during the screen leave early. It does not change the 10 ms quantum: a note queued between
passes still waits for the next tick (0..10 ms). Expected one-line band about 10-11 ms (26.9 B3);
measured in Step 6.

### 27.2 Step 2: option A safety check (from the disassembly of build/pro/sdk.elf) — NOT SAFE, not built

**Superseded 2026-11-10 by 28.2 and 28.4 (Task 15): the verdict below judged JieLi's kernel by stock
FreeRTOS rules and is wrong. The call chain it lists is right; the evidence against the verdict is in
28.4. The text stays as the record of what Task 13 concluded.**

Option A would call `fm1_control_request` from `song_tick` when a note is queued. Findings:

- **The calling context is an interrupt.** `song_tick` is called by `groove_midi_clock` <-
  `groove_sequence_render` <- `render.2` <- `fm1_r_0aa010fe1de1` / `fm1_r_ffe3f82683f6` <-
  `fm1_engine_render` <- `fm1_audio_irq`. `fm1_audio_irq` is a hardware interrupt handler: it saves
  `{psr, rets, reti}`, ends with `rti`, and `fm1_audio_start` attaches it to IRQ 11 at priority 4
  (`fm1_device_irq_attach(11, fm1_audio_irq, 4)`). The whole audio render, the song tick with it,
  runs inside that interrupt (app/song.c's "audio thread" is this ISR).
- **What the request does.** `fm1_control_request` reads the byte `control_pending`; if 0 it sets it
  to 1 and calls `os_taskq_post_type` (clearing the flag again if the post fails). No lock and no
  interrupt mask around that read-modify-write. `os_taskq_post_type` -> `__os_taskq_post`, which:
  1. calls `xTaskGetHandle(name)`: `strlen`, `vTaskSuspendAll`, then `prvSearchForNameWithinSingleList`
     over every task list (string compares), then the matching resume. FreeRTOS forbids
     `vTaskSuspendAll` / `xTaskResumeAll` from an interrupt (the resume can switch tasks and touches
     the scheduler lists the interrupted task may be in the middle of changing);
  2. then, with interrupts masked (`__local_irq_disable`), checks the queue's room and sends with
     `xQueueGenericSendFromISR` (this part is interrupt-safe);
  3. then, if a higher-priority task was woken, calls `vPortYield` directly (a task-level yield; the
     interrupt-safe pattern defers the switch to the interrupt exit).
- **Reentrancy and a pass in progress.** A request while a pass runs or waits is dropped (the flag is
  cleared only after the pass, in `fm1_application_message`), so A would also miss every note queued
  during a pass. The unguarded flag can race with the control task's clear (a lost or a doubled
  request; the doubled one is harmless, the lost one is the case above).
- **Effect on audio.** The name search runs over every task, inside the audio interrupt, at up to
  one call per 2.9 ms block: time taken from the render budget that drives CPU GUARD (27.1), and a
  scheduler-list walk with the scheduler possibly mid-update.
- **Where the SDK itself calls it:** its 10 ms timer callback and `fm1_app_sysex` (the routing task),
  both task context. Nothing in the SDK calls it from an interrupt.

**Verdict:** not clearly safe; on the evidence (scheduler suspend/resume and a direct yield from an
interrupt) it is unsafe. Option A is not built and tabby-v04.1-diagA does not exist. Without a
task-context wake source of finer grain than the 10 ms timer (the SDK exports none; its timers are
local symbols), the best this hardware and SDK can give is option B's result: notes wait for the next
10 ms pass (0..10 ms, about 10-11 ms band on one line), with the 20 ms tail removed. Reaching 4 ms
needs a change in the SDK (a shorter control timer, an interrupt-safe pass request, or a timestamped
send in its MIDI task).

### 27.3 Step 3: the DIN burst

**Running status: yes, in the SDK, always on, per transmit burst.** `request_uart_transmit` (the
SDK MIDI task's DIN sender) copies queued messages into `uart_midi_tx_buf` and keeps the last
status byte in a register for the burst: a channel message whose status equals the previous one is
written without its status byte; real-time bytes (F8-FF) keep it; other system messages (F0-F7)
clear it; it starts empty at every call. The app has no API for it (no switch, no flush control);
it can only influence it by the order and the status bytes it sends.

What it saves on an 8-note step: **nothing** for the eight-line test song (8 channels = 8 different
status bytes: 24 bytes, 7.7 ms, matching the measured 7.30 ms mean). Notes on one channel do share:
a 4-note chord on one channel is 3 + 2 x 3 = 9 bytes instead of 12 (about 1 ms saved). Note-offs go
out as 0x8n (midi_router.c), so a note-off and the next note-on on the same channel never share a
status; sending note-offs as note-on velocity 0 would let them, but the note-offs of the test songs
fall between steps, not inside the step's burst, so it would not shorten the step either.

**The rig answer (written, nothing built):** SMK-37 USB -> CME H4MIDI WC USB host port -> one DIN out
per device (channel routing in the H4MIDI), so each cable carries only its own notes (one device:
about 1 ms per step on its cable; two: 1.9 ms). What the SMK-37 needs: a channel per track (there:
MIDI TRACK K2 OUT CH, set by the importer) and the song on USB (there: OUT PORT ALL). A per-track
port choice is **not** there: OUT PORT is one global setting (ALL / OFF, `config.flags & 7` in
midi_router.c, the same mask for every track); it is not needed for this wiring (leave the
SMK-37's TRS out unconnected). Added to the MIDI guide as section 14 (docs/MIDI-GUIDE.template.md
v0.2, docs/MIDI-GUIDE.md regenerated).

### 27.4 Step 4: the panel wording

The user's rules (2026-11-10, not asked again): knobs by their printed numbers K1-K8 from the left
(the firmware's SELECT = K5, PAGE = K6, PRESETS = K7, MASTER = K8); the button the firmware calls
SAVE is "the 4th button in the left group (after SHIFT, FADER BANK, HOME)" until the sticker map is
done; any other button whose printed label cannot be confirmed from the source is described by
position. The source for button labels is the workbench's panel map (sdk/Simulator.js), which had
SAVE wrong; SPEC 17.4 lists every control with its status (user-confirmed or panel map only).

What was wrong besides the names: the SONG page and its Help said K1 selects the song; the code reads
SELECT and PRESETS (K5 / K7). K1-K4 in the old texts were right (`encoder_map` sends physical K1-K4 to
indices 2-5, which the screen code calls K1-K4).

Changed:
- app/screen.c v0.6: 25 LCD strings (hints, page help, the SONG page's "K5/K7 SONG", ACTIONS
  "K1/K5 ACTION  4TH LEFT BTN DOES IT", the save and preset pages, SHIFT shortcuts "HOME/SRC SOURCE",
  "TURN K8 UP", the ARP page's stale "SEQ 6/7" -> "SHIFT+SEQ"). On the LCD the 4th left button is
  "4TH LEFT BTN": the full phrase does not fit a 38-character line. Page names (SAVE PROJECT,
  PRESETS) and words (STOP TO SAVE, NO VALID SAVE) are unchanged.
- The workbench: sdk/Update.html.in (manual, both languages, and the erase prompt), sdk/I18n.js
  (keys and English texts in step, plus the new table cell), sdk/Simulator.js (the knob labels
  K1-K8, the panel button "BTN 4", the per-page Help), README.md and README.zh-CN.md. Done by one
  rule set applied to the Chinese source and its translation keys alike, so every key still matches
  (manual-i18n passes; the simulator's Chinese strings keep 123 of 130 with keys, as before).
  sdk/manifest.json re-pinned (tools/linux/pin-sdk-files.py).
- docs/releases/INSTALL.template.txt (new): the install-file template with the right names and the
  stall steps (never force flash). INSTALL-tabby-v04.1.txt is written from it in Step 5.

Not changed: docs of old releases and INSTALL-tabby-v04.0.txt (records of what was published).
make check, lint (unchanged counts) and test-fast pass.

### 27.5 Step 5: the tabby-v04.1 release

**Release build.** `make check`, `make lint` (unchanged: 11 host and 3 target warnings, all from
before Task 13), `make suite DISPLAY_VERSION=tabby-v04.1` passed at 0a4cf87 (crosscheck identical on
both tracks, test, midi-import-sim, host-sanitize), and `make crosscheck DISPLAY_VERSION=tabby-v04.1`
on its own: IDENTICAL sdk.elf, .fwsc, app-image.bin. `make package TAG=tabby-v04.1
DISPLAY_VERSION=tabby-v04.1`: build id
013976a54777bb5fa25ae42738aac840e2016584245a663296f7aee396a03d27 (build number 013976a54777bb5f,
loader `ota-SMK37013976a54777bb5f`), `.fwsc` SHA-256
f6377d634ee3c69f35e182935fa1b4769a69afec364e3b041eedd5a9266fe1c9 (487988 bytes), offline workbench
SHA-256 b74e5b4b93189b35062323808b34add5876baf598fe3ba44f545d977c3705794 (3142557 bytes). App image
448420 bytes, **margin 71037** (FLASH-BUDGET 18). The tree only adds docs after 0a4cf87 (release
notes, the guide's version line), which the build id does not hash.

Contents: option B (27.1), the panel wording (27.4), the update-page fixes of 26.8 (zero-tag resume,
no automatic force flash, NO_REPLY after 4 tries), the MIDI guide's section 14. Option A is not in it
(27.2).

**Install steps for the user** (MacBook, Chrome; full text ~/Documents/Classic Tabby/INSTALL-tabby-v04.1.txt):
1. A normal update from tabby-v04.0: no storage move, no backup or restore needed.
2. Main page (or builds/tabby-v04.1/): Device update shows tabby-v04.1, build number
   013976a54777bb5f. Connect device (`SMK-37 Pro_8000001`); a device that does not answer: power-cycle
   and connect again, never force flash. Start update, keep the tab open.
3. Check: boot screen tabby-v04.1; ACTIONS reads USER 471040 SONG READY and its bottom line
   K1/K5 ACTION  4TH LEFT BTN DOES IT.
4. If it stalls: close the tab, power-cycle (USB stays), open the page the loader asks for (main page
   or builds/tabby-v04.1/; another build's page names the right one), Connect, Start update, confirm
   SMK-37 Pro. Never force flash. A normal boot after the power-cycle: tabby-v04.1 -> step 3,
   tabby-v04.0 -> step 2. No USB device: stop and report.



**Publication (2026-11-10).** Branch and tag pushed (c207d92, tag tabby-v04.1); `make publish
TAG=tabby-v04.1 DISPLAY_VERSION=tabby-v04.1`: gh-pages b0f765a, `builds/tabby-v04.1/` added,
builds/index.json 7 builds (tabby-v04.0-recover kept with its note); Pages build "built" at b0f765a.
`make release TAG=tabby-v04.1`: https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v04.1.
Verified: the release assets pass `sha256sum -c SHA256SUMS.txt`; the tag's tar.gz equals
`git archive tabby-v04.1` (no difference) and its VERSION reads tabby-v04.1; a rebuild of the package
at the tag gives the same .fwsc and offline HTML hashes; 8 live files (root index.html and
assets.json, builds/tabby-v04.1/ index.html, assets.json, the offline HTML and the firmware asset,
builds/index.json and index.html) equal the gh-pages files byte for byte; the live assets.json names
build 013976a5... version tabby-v04.1; headless Chrome loads the root and builds/tabby-v04.1/ with the
tabby-v04.1 badge and the new wording. The plain `builds/tabby-v04.1/` URL answered 404 for a few
minutes after the deploy (the CDN kept the 404 of a request made just before it; the same URL with a
query string, and later without, answers 200).

## 30. Task 14 — Help audit against tabby-v04.1 (2026-11-10)

Task text: docs/tasks/TASK-14-help-audit.md. Branch classic-tabby/help-audit (worktree
../firmware-help-audit), made from classic-tabby/linux-build 5ae7626. Text only: no firmware behavior
changed (app/ is untouched), nothing was written to the device. The workbench is part of the next
release only; tabby-v04.1 is not republished.

### 30.1 What the audit covered and found

Every user-facing string of sdk/Update.html.in (HTML text and attributes, script literals),
sdk/Simulator.js, sdk/WebUpdate.js, sdk/Samples.js, the translation table sdk/I18n.js (1029 keys), both
READMEs, the MIDI guide template and the install template was read against the firmware (app/screen.c,
SPEC 16.2 and 17.4). The translation table went from 1029 keys to 763: 327 removed (290 were text no
source file used any more: the old chapters 01-09, the sampler and DX7 user library pages, the step editor
and recording help, the count-in lines, old update-page branches, the removed button; 37 were replaced by
rewritten keys) and 61 added (the 18 of chapter 00 and the rewrites). By place, counting one string, tooltip
or sentence once:

| Where | Rewritten | Deleted |
|---|---:|---:|
| Manual ch 13 quick start | 3 | 0 |
| Manual ch 14 panel and shortcuts | 5 | 0 |
| Manual ch 15 sync and MIDI; ch 17 mix; ch 18 files | 3 | 0 |
| Manual ch 19 MIDI and Bluetooth | 4 | 0 |
| Manual ch 20 update firmware (incl. the stall steps) | 5 | 1 (the "Enable force flash and reconnect" paragraph) |
| Manual ch 21 questions | 3 | 0 |
| Manual heading, search hint, chapter 10 line | 3 | 0 |
| Simulator panel text (page tips 0, 1, 12; SEQ, SCL and PAD / STEP tips; the preset-knob line; the clear-saves texts) | 10 | 9 (tips of the removed Bluetooth and FM naming pages, the DELAY-page SEQ tap hint, the five recording and step-record status texts, the count-in text) |
| Update page (progress texts after a flash, the "same version" line, the backup label, two settings texts) | 6 | 3 (the force-activate button with its two handler lines, the two sample-check branches) |
| WebUpdate.js | 1 message | 1 message, and the unused samplesRead / samplesWrite methods |
| READMEs: English / Chinese | 10 / 13 | 2 / 2 (the Sampler bullet and the sample-check paragraph, replaced) |
| MIDI guide template, install template | 0 | 0 (checked; already current) |
| New: Help chapter 00 "What changed in tabby-v04" (8 items, both languages) | 18 new keys | - |

Chapters 01 to 12 (English) were already current after Tasks 12 and 13, apart from one line in chapter 10
(the OUT CH readout is on the MIDI TRACK page, not "the SEQ page"). The song help's "64 steps, at most 4
notes per step" was checked against app/song_storage.h and stays (SONG_BLOCK_STEPS 64, SONG_NOTES_PER_STEP 4).

### 30.2 The guard

tests/workbench/help-banned.mjs reads 4761 strings with tests/workbench/help-banned-phrases.json (52 phrases, 19 allow fragments, 5 exact allows). Run against the published tabby-v04.1 sources it
reports 263 hits; now 0. tests/workbench/manual-i18n.mjs v0.3 expects 22 chapters. Both are in
`make workbench-test`. SPEC 17.5 has the rules.

### 30.3 Left to build: firmware screen texts that are stale (listed, not changed here)

Found while auditing; all in app/, so out of this task's scope. Check whether each is still reachable.
- app/screen.c, the overview knob labels `{"LEVEL", "STEP", "NOTE", "BPM"}`: K3 STEP and K2 NOTE are
  not HOME controls since Task 12 A2 (K1 level, K2 engine, K4 tempo).
- app/screen.c, "PAD/STEP STEP EDIT  RELEASE TO RETURN" and "PAD STEPS - SHIFT+PAD TO PLAY" /
  "PAD PLAY - SHIFT+PAD TO EDIT STEPS": pad-step mode is gone.
- app/screen.c, "ERASE OLD SAMPLE DATA" (project result GROOVE_PROJECT_TUNING_SPACE): the action is called
  ERASE OLD DATA now.
- app/screen.c line 619 "K2 CLK IN  AUTO USB BLE DIN": DIN receives nothing (SPEC 17.6); drop DIN from the line
  and from the choices.
- app/screen.c line 1125, `"HOLD SEQ: ACTIONS"` on SYNC / MIDI: holding SEQ does not open ACTIONS (the long-press
  test requires the removed STEPS page; SPEC 17.8). Either change the text to `SEQ+EDIT: ACTIONS` or restore the
  long press on SYNC / MIDI (a behaviour decision for the user).
- The firmware still lists SAMPLER in `source_names` (it is not selectable; a project with a sampler track
  loads as the 808 kit).

### 30.4 The three open items, settled (second pass)
1. **Factory V16 restore** overwrites 40960 bytes at 0xF4000..0xFDFFF. In the v04 layout that is block
   sectors 70..79 of the 80 (SPEC 16.1 has the arithmetic); 86..95 of 96 only in the old 536576 layout.
   Chapter 11, the song-editor note and the confirmation dialog now say so, in both languages.
2. **The TRS jack is output only** (SPEC 17.6 has the evidence): `fm1_midi_input_ports` returns 6 (USB, BLE),
   the board hook `fm1_io_trs_midi_enabled` returns 0 (PH8 is an encoder input, no receiver fitted), and
   `smk37_uart_start` sets up transmit only. CLK IN DIN accepts clock only from a source the SDK never
   delivers. Help (chapters 15, 19, the quick reference, both READMEs) says so; the MIDI guide section 14 says
   how a DIN master's clock can reach the SMK-37 (DIN in on the H4MIDI WC, routed to its USB host port;
   CLOCK = MIDI, CLK IN AUTO or USB; not tried on this rig).
3. **Demo samples**: the simulator still builds the synthesized demo bank (web/synth/demo_bank.h) and its
   source list still offers SAMPLER, so the line stays, reworded to say it applies only to that source and
   that the device has no sampler. Left to decide: whether the simulator should stop offering SAMPLER.

### 30.5 English only: the conversion, and future upstream merges (the user's decision, 2026-11-10; SPEC 17.7)

What was done (sdk/Update.html.in, Simulator.js, WebUpdate.js, Samples.js): 840 text nodes, attributes and
string literals that were Chinese keys of the table were replaced by their English values by script
(tools/linux/anglicize-workbench.mjs, kept for the next merge); 92 pieces that no table entry covered
(strings built from fragments, validation errors in WebUpdate.js, the block editor's messages, the
bilingual loading messages) were translated by hand. The translation table (763 keys, patterns, language
picker, `fm1-language`) was deleted: sdk/I18n.js is now a small pass-through (three functions). README.zh-CN.md and the
language link in README.md were deleted. tests/workbench/manual-i18n.mjs became manual-structure.mjs;
update-safety, loader-tag, update-ports and backup lost their Chinese expectations;
recover-page.mjs keeps `机型` because the recovery page is the published (Chinese) tabby-v04.0 page.

**Future merges of upstream workbench changes need the same conversion.** Upstream writes its UI in Chinese
with a table of English values. After taking upstream's sdk/Update.html.in, Simulator.js, WebUpdate.js,
Samples.js and I18n.js: run `node tools/linux/anglicize-workbench.mjs <upstream I18n.js>`, translate what it
lists in anglicize-left.json by hand, put Classic Tabby's pass-through sdk/I18n.js back, remove the
language selector, run tests/workbench/help-banned.mjs (its CJK check lists what is left) and re-pin the
files (tools/linux/pin-sdk-files.py). Upstream's license and notice files are taken unchanged.

Size of the built local preview (build/preview/index.html, `make web`): 1492495 bytes before, 1365411 after
(127084 bytes, 8.5 percent smaller). The release page carries the same saving on top of its firmware.

## 31. tabby-v04.1.1: the testing guide and the Help release (2026-11-10)

### 31.1 What it is
Text only: the same firmware as tabby-v04.1 plus the English-only workbench (SPEC 17.7), the corrected Help and
docs/TESTING-GUIDE.md. Built from classic-tabby/linux-build at the commit the tag tabby-v04.1.1 names, with
`DISPLAY_VERSION=tabby-v04.1` forced (the gate pattern of 9.3d/e), so the app image is the tabby-v04.1 image.

### 31.2 The gate
- `git diff tabby-v04.1 HEAD -- app` is empty.
- `cmp -l` of the new SMK37_PRO_OPEN.fwsc against the tabby-v04.1 release asset: 46 bytes differ, offsets 173888..173919
  (the 32-byte build identity) and 0-3, 69-70, 17428-17431, 17460-17463 (package checksums). Size equal (487988).
- App image 448420 bytes (same as v04.1), margin 71037; build identity 1249d59746334fcf (v04.1: 013976a54777bb5f; the
  manifest pins the new sdk files, which is why the identity moves).
- `make suite DISPLAY_VERSION=tabby-v04.1` green at 0e67c3e; `make crosscheck` IDENTICAL (sdk.elf cd6cc4ed..., fwsc
  25077dd8..., app-image 1b87aeda...).

### 31.3 What the guide check found (simulator, current source)
Every device step of the guide was driven on build/web/simulator.wasm through the SMK-37 control events (the
harness reads the 240x240 LCD). Two documentation errors came out and were fixed in the text: holding SEQ does not open
ACTIONS (screen.c: the long-press needs the removed STEPS page; SPEC 17.8; the firmware line HOLD SEQ: ACTIONS is in
28.3), and SHIFT + HOME means SHIFT + HOME / SRC. Steps that cannot run in the simulator (USB, flashing, outside gear,
the workbench against a device, a few messages) carry the marker in the guide (33 of them).

### 31.4 Publishing
The site gets guide/index.html from tools/linux/guide-html.py (publish-pages.py v0.5), at the root and in
builds/<tag>/. gh-pages was fetched from origin first (it already held builds/tabby-v04.2-diagA2/, 686e4cc); the root
publish keeps builds/ and recover/. The timing session's clean build/gh-pages worktree had to be removed so this
checkout could use the branch; it recreates it at its next publish.

## 28. Task 15 — past the 10 ms MIDI timing floor: research (2026-11-10)

Task text: docs/tasks/TASK-15-timing-research.md. Branch classic-tabby/timing-research (worktree
../firmware-timing), from linux-build 5ae7626. Steps 1 to 3 are read-only: nothing built, nothing
written to the device, nothing pushed.

### 28.1 Step 1: the baseline

**The SMK-37 is not on this NUC** (2026-11-10): `lsusb` shows the AUDIO4c and the H4MIDI-WC only, and
ALSA has no "SMK37 Open" port. Its build id could not be read, so Task 13 Step 6 (the tabby-v04.1
measurement) was not run. Until the user installs tabby-v04.1 and puts the device back on the NUC,
the baseline is Task 12 B1 (26.9), **measured on tabby-v04.0**, before option B:

| Run (measured, tabby-v04.0, 2026-11-09) | Band DIN | Band USB | std |
|---|---|---|---|
| One line (song 16) | 13.97 ms | 14.10 ms | 3.14 ms |
| Eight lines, per line (song 15) | 14.4..16.5 ms | 14.4..16.0 ms | 3.3..3.4 ms |
| Eight lines, all lines on one grid | 23.34 ms | 17.11 ms | 4.10 / 3.47 ms |
| Control pass, one line / eight lines (mean / max) | 10.61 / 14.03 ms | 12.49 / 19.21 ms | |

tabby-v04.1 (option B) is **estimated** at 10 to 11 ms on one line with the 20 ms cases gone (27.1);
not measured yet.

### 28.2 Step 2: the options, read only

Sources: the disassembly of the tabby-v04.1 build (build/pro/sdk.elf, build id 013976a5…, pi32v2
objdump; addresses below are from that ELF), the symbol table of sdk/lib/libfm1_engine.a, sdk/include,
app/board, THIRD_PARTY.md, and JieLi's public AC79 SDK at the commit THIRD_PARTY.md names (5fa84a9:
WL82.h register map, hwi.h interrupt numbers, os_api.h, timer.h). Nothing here is measured; every
timing figure in 28.2 and 28.3 is an estimate.

**What the app can link against.** libfm1_engine.a has 224 global symbols; none is an OS call (no
`os_*`, `task_create`, `thread_fork`, semaphore or timer function; all are local). The app does get:
`fm1_control_request` (global, and in fm1.h: "Request deferred control work after queuing a message"),
`fm1_device_irq_attach(index, handler, priority)` (accepts any index below 64, or 122, priority 0..7),
the soft interrupt 122 (bit 2 of 0x1eef1a0, used by app/board/scan.c), and direct register access
(app/board already drives ALNK, SPI2, ADC and TIMER4 itself).

**A2 (new): the pass request from the audio interrupt, looked at again. Task 13's "not safe" does
not hold up.** 27.2 judged the call by stock FreeRTOS rules. This SDK's kernel is JieLi's variant:
- `__local_irq_disable` (0x1c07b08) is a global `cli` plus a per-CPU nesting count; `__local_irq_enable`
  (0x1c07b20) does `sti` when the count is back to 0. There is no "highest priority that may call the
  OS": every kernel critical section masks every interrupt, the audio interrupt included.
- `vTaskSuspendAll` (0x202fa8c) is exactly `__local_irq_disable` plus `uxSchedulerSuspended++`; so
  nothing can run between suspend and resume, and the name search in `xTaskGetHandle` is one masked
  section, the same in a task or an interrupt.
- `vPortYield` (0x202fa28) does not switch: it picks the next task and sets soft interrupt 7
  (`0x1eef1a0 |= 0x80`); the switch happens in `vSoftwareInterruptISR` (priority 0) after every
  hardware handler has returned. That is the deferred, interrupt-safe pattern.
- **The SDK's own interrupt handlers use the same call.** `midi_tx_irq` (0x1c07ae2, IRQ 20, priority
  1) -> `smk37_connectivity_platform_uart_transmit_ready` -> `connectivity_wl82_midi_signal` ->
  `os_taskq_post_msg` -> `__os_taskq_post` (0x20305f0), after every DIN burst. `timer4_isr` (IRQ 62,
  priority 5, above the audio interrupt's 4) and `slot_timer_irq_handler` (IRQ 41, priority 2) ->
  `os_taskq_post_type` -> `__os_taskq_post`; `timer1_isr` and `sbc_isr` -> `os_sem_post`.
- JieLi's os_api.h marks the waiting calls (`os_time_dly`, `os_sem_pend`, `os_sem_accept`, the mutex
  calls) "not from an interrupt or a critical section" and puts no such note on `os_taskq_post`,
  `__os_taskq_post` or `os_sem_post`.
What stays true from 27.2: a request made while a pass runs is dropped (`control_pending`, 0x1c3d19c,
is cleared only after the pass), and the flag is unguarded (worst case one extra, empty pass). The
cure is in the app: the song tick asks again on every audio block while lane 0 is not empty, and the
pass already flushes after every LCD band. The name search costs time inside the audio interrupt (it
counts toward the render budget behind CPU GUARD), only on blocks that queue a note.
Limit of A2: a task cannot run while the audio interrupt renders, and notes are found once per
2.9 ms block; estimated one-line band 3 to 4.5 ms on DIN and USB.

**E. Our own high-priority task: no (and not needed).** No task creation and no interrupt-safe
signal is exported, so the app cannot make or wake a task of its own through the API. The wake E
wanted exists as A2, on the control task (`app_core`, priority 15 in `task_info_table` 0x202a9cc;
the Bluetooth tasks 16 to 21 and `sys_event` 29 are above it). `fm1_midi_send_port` (0x2024e90) is
built for more than one caller (a lock and a per-port busy byte, -2 when busy), so a second sending
task would work if we could create one. Any task, at any priority, waits for the audio interrupt.

**D. DIN straight from an interrupt: possible, with a takeover.** The TRS out is UART1 (0x12100,
JL_UART1; TX on gpio 39 = PC7 through output channel 17; BAUD from the clock / 125000, 31250 baud;
`smk37_uart_start` 0x2024f90). The SDK sends by DMA: `request_uart_transmit` (0x200ffcc) packs up to
126 bytes with running status into `uart_midi_tx_buf` and `smk37_uart_write` (0x2025006) sets TXADR
(0x12114) and TXCNT (0x12118); the end-of-burst interrupt (IRQ 20, `midi_tx_irq`) acknowledges and
signals the MIDI task, which sends the next burst and keeps a busy bit. Two writers on TXADR/TXCNT
would cut each other's bursts, so D needs the app to be the only DIN writer: no
`fm1_midi_send_port(FM1_MIDI_DIN)` at all (keys, clock and song all through the app's own ring), IRQ
20 re-attached to an app handler (index 20 is allowed), our own running status. Not settled from the
static image: whether the SDK's own routes (`connectivity_midi_routes`, 0x202c384; source counts are
set at run time) ever queue to DIN without the app, for example update or SysEx replies; that would
have to be read from the running device. DIN only; USB cannot be written from an interrupt.

**F. A hardware timer interrupt: yes.** TIMER5 (0x10900, IRQ 63) is free: sdk.elf never touches it,
fm1_device.h gives TIMER4/TIMER5 to the board code, and scan.c uses only TIMER4 (the 24 MHz counter
at 0x10800). IRQ 63 can be attached. A 1 ms tick, or one shot per due note. By itself it changes
nothing; it needs G for due times and A2 or D to send.

**G. Look-ahead: yes, app code only.** The song tick already knows the next block's notes; it can
queue them one block early with a due time on the 24 MHz counter. Useful only with F.

**H. The 10 ms constant: found, dropped.** `app_task_handler` 0x201fc3a: `r2 = 10`, then
`sys_timer_add(NULL, tick, 10)`; `tick` (0x201fdd6) calls `fm1_control_request`. THIRD_PARTY.md lets
us download, copy, link and redistribute libfm1_engine.a in binary form; it grants no right to modify
it and supplies no source. Patching the constant is not allowed. With A2 it is also not needed.

**I. The request to M-VAVE** (draft, not sent):

> Subject: SMK37 Open SDK: MIDI output timing from the sequencer
>
> Hello. We build open firmware for the SMK-37 Pro with your SDK (libfm1_engine.a). Notes scheduled
> in the audio interrupt can only be sent from the control task, which runs every 10 ms, so MIDI
> output has about 10 to 14 ms of jitter (measured on DIN and USB).
> Could you tell us, or add, one of these:
> 1. Is `fm1_control_request()` safe to call from the audio interrupt (`fm1_engine_render` context)?
>    Your own UART interrupt posts to a task the same way, so we believe it is. If yes, please say so
>    in fm1.h, and let a request made during a pass run one more pass instead of being dropped.
> 2. Or a send call that is safe from an interrupt, or one that takes a time stamp
>    (`fm1_midi_send_port_at(port, message, bytes, ticks)`).
> 3. Or a setting for the control timer period (10 ms today).
> Thank you.

### 28.3 Step 3: ranking and recommendation (all figures estimated; nothing built)

Flash margin today 71037 bytes (measured, FLASH-BUDGET 18); every option fits.

| Rank | Option | One-line band (estimated) | Risk | Flash, RAM (estimated) | Proof on hardware |
|---|---|---|---|---|---|
| 1 | **A2**: the song tick calls `fm1_control_request` when lane 0 has a note, and again each block while it is not empty | 3 to 4.5 ms, DIN and USB | low to medium: one exported, documented SDK call in a context the SDK's own handlers already use; a little time inside the audio interrupt | about 200 B, 4 B | diag build: one line and eight lines on DIN and USB, profile page 6 (passes, lost ticks), CPU GUARD count, audio recorded through the AUDIO4c, a one-hour soak with panel use, a workbench transfer and a song save while playing |
| 2 | **A2 + F + G**: notes queued one block early with a due time; TIMER5 (priority 5) fires at the due time and requests the pass | 1.5 to 3 ms, DIN and USB (what is left: the audio render that no task can interrupt, and a pass in progress) | medium: a new interrupt above the audio one (short, RAM code) | about 800 B, 0.3 KB | as rank 1, plus the band against audio load (one voice, eight voices) |
| 3 | **D + F + G**: DIN bytes written by the timer interrupt, USB as rank 1 | DIN under 0.5 ms plus the wire; USB as A2 | high: takes UART1 and IRQ 20 from the SDK; SDK-side DIN traffic not yet ruled out; DIN in, update and SysEx paths to retest | about 1.5 KB, 0.3 KB | as rank 2, plus DIN in, clock out, keys and song together, an update from the workbench |
| - | I: the M-VAVE request | no change by itself | none | 0 | send it whatever we build; a yes to its point 1 settles A2 |
| no | E: our own task | | not possible: no task or signal call exported | | |
| no | H: patch the 10 ms constant | | not allowed by the SDK terms | | |

**Recommendation: A2 as the diag build, with F + G as the next step on the same path if A2 measures
over 4 ms.** A2 is one call in song.c plus a retry, it helps DIN and USB alike, it leaves the SDK's
send path, UART and update code alone, and its measurement tells us how much the audio render really
costs before we add a timer. D stays in reserve for the case where DIN must be tighter than the
audio render allows.

**The floor.** On the SDK's send path a note cannot leave while the audio interrupt renders; the
render budget is 52244 or 59210 ticks of 24 MHz (2.18 or 2.47 ms, SPEC 17.2), so about 2.5 ms is the
worst case under full load and less at normal load. Under that only D goes (DIN only). The 4 ms goal
looks reachable; it is not proven until measured.

### 28.4 Step 4: option A2 built as a diag build (approved 2026-11-10, with six conditions)

#### Why Task 13's "not safe" verdict (27.2) was wrong: the record

Do not reverse this again without new evidence. 27.2 read the call chain correctly
(`fm1_control_request` -> `os_taskq_post_type` -> `__os_taskq_post` -> `xTaskGetHandle` with
`vTaskSuspendAll` / `xTaskResumeAll`, then `vPortYield`) and then judged it by the rules of stock
FreeRTOS, where suspending the scheduler and yielding are task-only. This SDK's kernel is JieLi's
variant and those rules do not describe it. The evidence, from the tabby-v04.1 ELF (build id
013976a5…) and JieLi's public AC79 SDK (commit 5fa84a9, the one THIRD_PARTY.md names):

1. **Critical sections mask every interrupt.** `__local_irq_disable` (0x1c07b08) is `cli` plus a
   per-CPU nesting count (`irq_lock_cnt`); `__local_irq_enable` (0x1c07b20) is `sti` when the count
   returns to 0. `vTaskSuspendAll` (0x202fa8c) is exactly `__local_irq_disable` plus
   `uxSchedulerSuspended++`. So "scheduler suspended" here means "interrupts off": nothing, task or
   interrupt, runs inside it, the pending-ready list and pended ticks that make the stock call
   dangerous in an interrupt cannot fill, and there is no priority level above which the OS may not
   be called. The audio interrupt (priority 4) is masked by it like any other.
2. **The yield is deferred.** `vPortYield` (0x202fa28) picks the next task (`xTaskSwitchContext`)
   and sets soft interrupt 7 (`0x1eef1a0 |= 0x80`); the switch itself happens in
   `vSoftwareInterruptISR` at priority 0, after every hardware handler has returned. 27.2 called
   this "a task-level yield"; it is the interrupt-safe pattern.
3. **The SDK's own interrupt handlers post through the same function.** `midi_tx_irq` (0x1c07ae2,
   IRQ 20, priority 1, after every DIN burst) -> `smk37_connectivity_platform_uart_transmit_ready`
   -> `connectivity_wl82_midi_signal` -> `os_taskq_post_msg` -> `__os_taskq_post` (0x20305f0).
   `timer4_isr` (0x201343a, IRQ 62, priority 5, above the audio interrupt) -> `os_taskq_post_type`
   -> `__os_taskq_post`. Also `slot_timer_irq_handler` (IRQ 41, priority 2) -> `os_taskq_post_type`,
   and `timer1_isr`, `sbc_isr` -> `os_sem_post`.
4. **The API offers the call.** sdk/include/fm1.h declares `fm1_control_request` ("Request deferred
   control work after queuing a message"), the library exports it, and the SDK calls it outside the
   control task itself (`fm1_app_sysex`, the routing task). JieLi's os_api.h marks the waiting calls
   (`os_time_dly`, `os_sem_pend`, `os_sem_accept`, the mutex calls) "not from an interrupt or a
   critical section" and puts no such note on `os_taskq_post`, `__os_taskq_post` or `os_sem_post`.

What 27.2 had right, and A2 handles: a request made while a pass waits or runs is dropped
(`control_pending`); the flag is unguarded (worst case one extra, empty pass); the name search costs
time inside the audio interrupt. Still open until measured on the device (Step 5): the cost of the
call inside the audio interrupt and what the extra passes do to audio and CPU GUARD.

#### What was built

- **Build flag.** `A2=1` (Makefile v0.22) -> tools/linux/build.py `--a2` (v0.10) -> `-DCT_A2=1`,
  folded into the build identity (`a2:1`; build-identity.json and the package JSON say `"a2": true`).
  Without it no A2 code is compiled. The host tests always build it (HOST_FLAGS).
- **The request** (app/midi_router.c, `a2_block`, in RAM with the audio code): once per audio block,
  after the song tick and the MIDI clock, if A2 is on and lane 0 or 1 holds an event, one call of
  `fm1_control_request`. At most one per block, no loop; a dropped request is repeated by the next
  block while events still wait. The lanes carry the song's notes and row events, the pattern and
  arpeggio notes and the MIDI clock byte, so all of them leave sooner; the song's local-engine notes
  are posted at the same drain, so the internal sound follows the same timing.
- **The switch** (condition 1): off at boot, RAM only. On the device: ACTIONS, the last entry
  "A2 FAST MIDI: OFF / ON" (K1 or K5 to it, the 4th left button switches it; the screen says "A2 ON -
  PASS ON DEMAND" or "A2 OFF - 10 MS PASSES"). From the NUC: transfer command 25, request 8 = off,
  9 = on, 7 = read (tools/linux/hw/tabby_link.py `a2()`, run-15.py `--a2 off|on`). A power cycle is
  off again. With A2 off the build makes no request: it measures option B alone.
- **The counters** (condition 2; command 25 request 7, 48 bytes): on, audio blocks, calls, mean and
  longest call (TIMER4 ticks, taken inside the audio interrupt around the call), retries (requests
  made while nothing had been drained since the block before asked), and a histogram of the call
  time (< 5, < 10, < 20, < 50, < 100, >= 100 microseconds). Calls per second = calls x 44118 /
  (blocks x 128). Request 1 (reset) clears them, not the switch.
- **Tools.** tools/linux/hw/tabby_link.py v0.6 (`a2()`, `health()`: commands 17, 18, 19, the audio
  counters and CPU GUARD's "adapted"); tools/linux/hw/run-15.py v0.1 (`l2` for one run with A2 off
  or on, DIN and USB together, optional AUDIO4c recording; `soak`; `table` for the off / on
  comparison). run-15.py's analysis was checked on synthetic notes only; it has not met the device.

#### Tests and gates (measured on this machine)

- Host tests, tests/host/smoke.c v0.12 section 16 (14 checks; the simulator's `fm1_control_request`
  counts calls, and `sim_test_request_passes` gives a request its pass as the SDK does): off at
  boot; off = no request and the note waits for the 10 ms pass; on = one request and the note
  leaves in the block that queued it; a request that gets no pass is repeated once per block; never
  more calls than blocks; idle blocks ask only for the MIDI clock; reset, request 8, the ACTIONS
  entry. `make test-fast`: 189 host checks and the rest pass.
- **The normal build is unchanged**: built from this tree with DISPLAY_VERSION=tabby-v04.1, its
  app image (448420 bytes) differs from the released tabby-v04.1 image in 32 bytes, the build id
  (offsets 156173..156204; app/ sources are part of the id), and nowhere else.
- The A2 build: app image 448868 bytes, +448 against the normal build, margin 70589 (FLASH-BUDGET
  19). `a2_block` and the wrapper are in the RAM code section with the audio code (0x1c031f8).

### 28.5 The diag build tabby-v04.2-diagA2 (2026-11-10)

**Build.** `make check`, `make lint` (3 target warnings, all from before Task 15), `make suite`
(normal build) and `make suite A2=1 DISPLAY_VERSION=tabby-v04.2-diagA2` passed at f883476: crosscheck
IDENTICAL on both tracks (sdk.elf, .fwsc, app-image.bin), test, midi-import-sim, host-sanitize.
`make package TAG=tabby-v04.2-diagA2 DISPLAY_VERSION=tabby-v04.2-diagA2 A2=1`: build id
49b872869fdda9f1218e8041639a1ab9dbd55271337127cdd1f06d46a67e0c3d (build number 49b872869fdda9f1,
loader `ota-SMK3749b872869fdda9f1`), `.fwsc` SHA-256
d10fd71d0f57ee122121fe8f31da0606aa060537545f7cd07422dbb37b0203c8 (487988 bytes), offline workbench
SHA-256 30eb5c0b05efacfd19d077e6f198f4b85a5ec6a98a826255f5164d43384c7f07 (3144055 bytes). App image
448868 bytes, margin 70589. The tree adds only docs after f883476, which the build id does not hash.

**Where it is published:** only `builds/tabby-v04.2-diagA2/` (`make publish TAG=tabby-v04.2-diagA2
DISPLAY_VERSION=tabby-v04.2-diagA2 A2=1 SITE_DIR=builds/tabby-v04.2-diagA2`), with its entry in
builds/index.json so another build's page can name it for a stale loader. The main page stays
tabby-v04.1. No GitHub release.

**Install** (the user, from the MacBook; full text ~/Documents/Classic Tabby/INSTALL-tabby-v04.2-diagA2.txt):
a normal update from tabby-v04.0 or tabby-v04.1 through the build's own page; check the boot screen
(tabby-v04.2-diagA2) and the new last ACTIONS entry "A2 FAST MIDI: OFF"; then back to the NUC (USB
back port, TRS out to H4MIDI WC DIN in 1, audio to the AUDIO4c). Never force flash.

**Step 5, after the user says it is installed and on the NUC** (tools/linux/hw/run-15.py, the
user present, PLAY pressed by the user):
1. A2 off, then on: one line (song 16) and eight lines (song 15), DIN and USB together, the control
   pass profile, CPU GUARD count, the call cost; the AUDIO4c recording during the eight-line runs.
2. A one-hour soak with A2 on, with the user's panel use, one transfer and a save while stopped.
3. Stop at once and report on any audio dropout, a rise in CPU GUARD trips, a stuck note or a USB
   MIDI error with A2 on.
4. F + G only if A2 measures over 4 ms.

**Publication (2026-11-10).** Branch classic-tabby/timing-research and tag tabby-v04.2-diagA2 pushed
(9283860). gh-pages b0934f7 added `builds/tabby-v04.2-diagA2/` and its index entry; 686e4cc added the
entry's note ("TEST BUILD ..."). Both commits change files under builds/ only (`git diff --name-only`
shows nothing outside it); the root index.html and assets.json are the tabby-v04.1 ones, byte for
byte. To publish from this worktree, the main checkout's build/gh-pages worktree (clean, at the
remote's b0f765a) was removed first, as publish-pages.py does with its own; the next publish from
the main checkout recreates it from the remote.

### 28.6 Step 5: A2 off against on, measured on the device (2026-11-10 and 11)

Device: tabby-v04.2-diagA2 installed by the user from the MacBook; SMK-37 on the NUC's USB back
port, TRS out through the type A adapter to H4MIDI-WC DIN in 1, audio out to AUDIO4c inputs 1 and 2.
PLAY pressed by the user; `tools/linux/hw/run-15.py l2`, 100 s from the song's MIDI Start, kernel
receive timestamps on both ports. Song 16 = timing-1x16 (one line), song 15 = timing-8x16 (eight
lines, the internal engine sounding). "Spread" = largest minus smallest error of the note-ons
against a least-squares line, per line. Raw files: build/task15/ (not committed). **All figures in
this section are measured.**

| | One line, A2 off | One line, A2 on | Eight lines, A2 off | Eight lines, A2 on |
| --- | ---: | ---: | ---: | ---: |
| Notes per line | 715 | 804 | 808 | about 805 |
| DIN spread per line, ms | 12.34 | **3.67** | 14.38..15.45 | 3.77..6.50 |
| USB spread per line, ms | 12.29 | 3.68 | 14.50..15.71 | 3.71..5.39 |
| DIN standard deviation, ms | 3.25 | 0.84 | 3.37 | 0.98 |
| All lines on one grid, DIN / USB, ms | | | 21.46 / 17.28 | 12.44 / 6.57 |
| Control pass period, mean / max, ms | 11.63 / 14.52 | 6.61 / 13.47 | 12.71 / 19.01 | 7.74 / 18.92 |
| Pass periods over 15 ms ("lost ticks") | 0 | 0 | 727 | 111 |
| Pass busy time, mean / max, ms | 1.42 / 3.01 | 0.84 / 2.49 | 2.20 / 7.54 | 1.44 / 7.25 |
| A2 calls per second | 0 | 62.7 | 0 | 64.0 |
| A2 call inside the audio interrupt, mean / longest, us | | 23.3 / 53.0 | | 18.3 / 49.5 |
| A2 retries in 100 s | 0 | 14 | 0 | 1 |
| CPU GUARD "adapted" | +0 | +0 | +97 | +100 |
| Engine underruns / DMA overruns | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Render peak, ms (deadline 2.902) | 0.886 | (1.478, carried over from song 15) | 1.471 | 1.475 |
| AUDIO4c recording: silent gaps of 2 ms or more, recorder overruns | | | 0, 0 | 0, 0 |
| Notes left on / USB differing from DIN | 0 / 0 | 0 / see below | 0 / 0 | 0 / 0 |

What the table says:
- **The goal is met on one line: 3.67 ms on DIN** (a first A2-on run gave 3.78 ms). The errors lie
  in a flat band about 2.9 ms wide (1st to 99th percentile 2.91 ms): one audio block, which is how
  often the song tick runs. A2 cannot go under that; F + G could.
- **Eight lines: 3.8 to 6.5 ms per line on DIN**, so the worst line is over 4 ms; all eight lines on
  one grid 12.4 ms on DIN (the DIN wire carries 8 notes one after the other, 0.96 ms each) and
  6.6 ms on USB.
- **Option B alone is 12.3 ms on one line, not the 10 to 11 ms Task 13 expected**: the SDK's pass
  comes round every 11.6 ms on average (10.1 ms with no song playing, read on this build), not every 10 ms. Run to run the
  A2-off eight-line spread moved by about 2 ms (12.2..14.2 ms in another clean run with +94
  CPU GUARD).
- **Cost of A2:** 18 to 24 us per call inside the audio interrupt, longest 53 us in every run
  (2 percent of the 2.9 ms block), 49 to 64 calls a second (48 of them the MIDI clock at 120 BPM).
  Passes run more often (every 6.6 to 7.7 ms) and are shorter.
- **CPU GUARD trips on song 15 with A2 off**, about once a second (+94, +97 in 100 s; render peak
  1.47 ms of 2.90 ms). A2 does not change it (+100). This is the song's eight internal voices, not
  A2; it was not looked into further here. The stop rule "a rise in CPU GUARD trips" was therefore
  read as a rise over this baseline (soak: over 1.5 a second across a minute).
- No stop condition occurred: no underrun, no DMA overrun, no silent gap in the recording, no note
  left on, no USB MIDI error from the device.

**Faults of the measuring tools found on the way (all on the NUC, none in the firmware):**
1. run-15.py v0.1 treated the receive times (ns) as seconds and started at the first note-on; a key
   pressed before PLAY started one run early (v0.2: starts at the MIDI Start).
2. PLAY, STOP, PLAY inside one capture gave a false 231 ms spread (v0.3: the longest unbroken
   stretch is fitted; v0.4: the capture starts over at every new Start).
3. The in-process audio capture overran 810 times in one run (v0.5: `arecord` with a 0.5 s buffer).
4. After a 5.4 h wait for PLAY the script scanned 930,000 stored clock bytes per turn and did not
   read the USB port for seconds; that run's USB capture lost 0.6 s and 125 ms (v0.6).
5. tabby_link `query()` returned at the reply and dropped what the same read brought after it; the
   A2-on one-line run's USB capture has a 167 ms hole right after the Start for that reason (one
   note-on, one note-off; DIN complete). Fixed in tabby_link v0.7. Proof that it is not the device:
   a 20 s probe with about 230 read commands counted the same clock bytes on USB and DIN (942..952
   each), with A2 off and on; and the soak below, with 75 reads, has the same 6166 note events on
   both ports. That one-line run was not repeated after the fix.

**Soak with A2 on (condition 5; what was and was not covered):**
- Two hours idle (MIDI clock only) before the last timing run: 355,707 calls, 48.5 a second, mean
  23.7 us, longest 54.2 us, 1785 retries (0.5 percent); underruns 0, DMA overruns 0.
- `run-15.py soak`, 1500 s (soak-1): the user played songs for the first 121 s (12 starts and
  stops), then the device idled. 73,335 calls, mean 23.6 us, longest 52.1 us, 353 retries; 213,623
  passes, mean 7.02 ms, longest 17.4 ms; underruns 0, DMA overruns 0, CPU GUARD +44 (all in the
  first two minutes, with song 15); 3083 note-ons and 3083 note-offs on each port, the same events
  in the same order per channel; no note left on; DIN spread per line 3.60..4.46 ms in the longest
  stretch.
- Overnight, A2 left on, device idle on MIDI clock, about 11 h from the soak's counter reset
  (13,631,476 audio blocks): 1,911,164 calls, 48.3 a second, mean 23.8 us, longest 55.4 us, 11,095
  retries (0.58 percent); 5,632,778 passes, mean 7.02 ms, longest 17.4 ms; underruns 0, DMA
  overruns 0.
- **Transfer and save, done from the NUC without the user at the device** (the user's instruction of
  2026-11-11: finish the testing alone; device on and connected). Both were made content-neutral
  and checked by a full backup through the workbench page before and after
  (tools/linux/hw/workbench.mjs, headless Chrome, the published builds/tabby-v04.2-diagA2/ page;
  identity SMK-37 Pro_8000001, build 49b87286...): every part of the two backup files is equal
  (workspace, 16 project slots, settings, songs, rig). DIN watched alone meanwhile
  (`run-15.py din`), since the page holds the USB port.

  | No song playing | A2 on | A2 off (same action, for comparison) |
  | --- | --- | --- |
  | Transfer: timing-1x16.mid written again to song 16 (7 erases, 7 writes, 2624 bytes) | longest erase 17.8 ms, write 20.2 ms; longest pass 100.8 ms, 3 passes over 10 ms; DIN clock: 3 gaps over 35 ms, longest 118 ms | 17.7 ms, 20.2 ms; 97.2 ms, 3 passes; 3 gaps, longest 121 ms |
  | Save while stopped: project renamed, command 7 to slot 1 (5 erases, 8 writes, 4096 bytes) | longest erase 17.6 ms, write 29.1 ms; one pass of 217.9 ms; DIN clock: one gap of 232 ms | 17.6 ms, 29.0 ms; one pass of 216.8 ms; one gap of 240 ms |
  | Underruns / DMA overruns / CPU GUARD during it | 0 / 0 / 0 | 0 / 0 / 0 |
  | A2 calls during the save window | 206, longest 31.6 us, 1 retry | |

  Flash writes hold the control pass for 100 to 220 ms with or without A2 (the MIDI clock on DIN
  stops for that long; known since Task 12, run D); A2 changes nothing there. A save of an
  unchanged project writes nothing (write_record compares first), so the project was renamed
  "A2 SOAK TEST" for the A2-on save and back to "UNTITLED" for the A2-off save.
- **Not done:** an hour of continuous song play with panel use. This build has no remote PLAY
  (command 26 is in `DIAG=1` builds only; reply code 71 here), and installs are the user's. Song
  play with A2 on was covered by the two 100 s timing runs, the first A2-on run (100 s), and the 12
  starts and stops of soak-1; panel use by the user's presses in those.
- The device was left with A2 **off** (as after a power cycle). The audio counters "adapted" and
  render peak read 0 after the workbench page connected; why was not looked into.

**Decision left to the user:** F + G was approved only if A2 measures over 4 ms. One line is under
(3.67 ms); eight lines are over on the worst line (6.5 ms).


## 32. Task 16 — tabby-v04.2 (2026-11-11 night; task text docs/tasks/TASK-16-overnight.md)

### 32.1 Setup found, and what changed against the task text

- **The device was running tabby-v04.1.1, not tabby-v04.2-diagA2** (read-only: build id 1249d59746334fcf, command 25
  request 7 refused). The task's "CURRENT SETUP" said diagA2; the install order below therefore starts from v04.1.1.
- Other worktrees: ../firmware-timing (classic-tabby/timing-research, 70ec9de), ../firmware-help-audit, -task02,
  -devchecks, -diag-r2; the build lock /tmp/tabby-suite.lock was free. tabby-v04.1.1 was published by the earlier
  session (gh-pages f1cff8b), and is the base here.

### 32.2 What is in tabby-v04.2

- classic-tabby/timing-research (Task 15: A2 behind a build switch, counters, run-15) merged into classic-tabby/v04.2,
  which carries the English-only workbench, the Help fixes and the testing guide (tabby-v04.1.1). Merge conflicts were
  only revision logs and appended sections; Task 14's BUILD sections became 30 and 31 so that Task 15's 28.x
  references (device-run notes, release notes) stay valid.
- A2 on by default: tools/linux/build.py v0.11 (`--a2` default, `--no-a2` / Makefile `A2=0` builds the v04.1 firmware);
  app/midi_router.c `a2_on = 1` at boot; ACTIONS entry "A2 FAST MIDI: ON/OFF" (screen.c v0.8).
- Remote control: command 29 (app/transfer.c v0.6), SPEC 19.2; host tests tests/host/smoke.c section 17 (49 new
  checks); tools/linux/hw/tabby_link.py v0.8, run-15.py v0.9 (`--play N`).
- Workbench Diagnostics shows the A2 counters (sdk/WebUpdate.js diagRead / diagText).
- Goal 4 (shipped here): the stale screen texts (screen.c v0.9), the two out-of-bound lint findings (song_storage.c
  v0.9). cppcheck also found a real bug in the first draft of command 29: a 37-key mask in 32 bits (shift by 36);
  fixed before any build (a 64-bit mask; a host test presses key id 36).
- Lint after: the remaining findings are project.c (6 tidy, 1 cppcheck uninitvar on a struct read after a size test),
  screen.c (2 tidy, 1 cppcheck conditional index), transfer.c (1 tidy), board/audio.c (1) and the memcmp-without-compare
  style findings; none changes behaviour; they stay on the list.

### 32.3 The gate

- `make suite DISPLAY_VERSION=tabby-v04.2`: passed 2026-11-12T05:31:29Z at 1d9b27d (crosscheck IDENTICAL, test,
  midi-import-sim, host-sanitize).
- Build id b926f5556483ee65 (full b926f5556483ee65c05a605284a09ac1263f199c236b6a6e9050252850c2cd98); app image 449700 bytes, margin 69757
  (FLASH-BUDGET 20).
- Read-only USB soak through the hub before any install: 2500 rounds (5000 queries), 0 timeouts, 0 malformed, 0 differing
  replies, round trip 0.73 / 20.1 / 43.5 ms (min / median / max), no kernel USB lines (measured, 2026-11-11).
- Full backup before the install: ~/Documents/Classic Tabby/overnight/backups/before-v04.2.json (1 project, 2 songs,
  9 blocks, USER 471040).


### 32.4 tabby-v04.2 device results (measured, 2026-11-11 night, the device on this NUC, DIN through the H4MIDI WC port 1, audio in AUDIO4c inputs 3 and 4)

Installed from this NUC through the published page builds/tabby-v04.2/ (driven with Playwright, no force flash,
identity SMK-37 Pro_8000001 read first; one attempt; 10.2 s; "Firmware ready"). The device ran tabby-v04.1.1 before,
not the diagA2 build the task text said (32.1). Read back afterwards: build id b926f5556483ee65, A2 on at power-up.

| Run (125 s each, song 16 = one line, song 15 = eight lines) | A2 off | A2 on |
| --- | ---: | ---: |
| One line, DIN, band per line | 14.27 ms | 4.91 ms |
| One line, USB, band per line | 14.22 ms | 4.98 ms |
| One line, std (DIN) | 3.07 ms | 0.86 ms |
| Eight lines, DIN, per line band | 13.93..14.06 ms | 4.68..4.86 ms |
| Eight lines, DIN, all lines on one grid | 20.96 ms | 11.82 ms |
| Eight lines, USB, per line band / all on one grid | 13.96..15.04 / 16.07 ms | 4.73..6.56 / 7.68 ms |
| Control pass mean / max (one line) | 10.68 / 13.32 ms | 6.34 / 12.99 ms |
| A2 calls per second, mean cost, longest (one line) | 0 | 62.2, 20.3 us, 49.1 us |
| Engine underruns, DMA overruns, MIDI in dropped | 0, 0, 0 | 0, 0, 0 |
| CPU GUARD adapted (125 s; eight lines) | +115 | +119 (one line: 0 and 0) |
| Notes left on at the end | none | none |

The one-line band with A2 on is 4.91 ms here against 3.67 ms in the Task 15 run of the diag build (BUILD 28.6); the
difference is not explained (run-to-run and the DIN capture path differ; a repeat is in 32.5). USB and DIN carry the
same notes in every run. The recorded audio (inputs 3 and 4) had no capture overrun in any run; its "silent gaps" are
the song's own rests (the count is the same A2 off and on within 2 percent), so no dropout showed.


## 33. Task 16 — tabby-v04.3: external clock follow in song mode (2026-11-12)

Spec: SPEC 19.3. Code: app/song.c v0.6 (the follow state machine `ext_block`, `ext_message`, the control side `song_locate`
and `song_prepare`, the routing task's `song_clock_in`), app/midi_router.c (the hook), app/screen.c v0.10 (the SONG page
text), app/transfer.c v0.7 (the status byte). Tools: tools/linux/hw/run-follow.py (the NUC as master over USB),
tools/linux/hw/run-remote.py.

### 33.1 Design in short (details are the comment block above `enum { EXT_OFF ...` in app/song.c)

- The song keeps its own clock (units per block); in follow mode each block's advance comes from the pulses: the pulse
  period (EMA 1/8 over blocks between pulses, bounds 2 to 60 blocks) gives the nominal advance, and a quarter of the phase
  error against the predicted position (pulses x 80 units + the interpolation inside the pulse) is added per block,
  capped at 28 units (the action list is sized for that, app/song.c ACTIONS).
- States: ARMED, PREPARING (the control task decodes a position), WAIT PULSE, FOLLOWING, HOLD (3.5 periods without a
  pulse, note-offs sent), LOST (2 s), STOPPED (by the master). Start / Continue / Stop / SPP arrive in a ring with the pulse
  count at their arrival; the audio thread owns the state machine.
- SPP is row-exact: `song_locate` walks the rows with their repeats and loops; the frames restart at the step (no notes
  before it, no row events when it is not a row start).

### 33.2 Tests (host and simulator; all passed in `make suite DISPLAY_VERSION=tabby-v04.3` at 1d73065, and again for the test-only commits)

tests/host/smoke.c section 18 (43 checks): arm; pulses alone do not start an armed song; Start; the first note at the first
pulse; step 4 on its pulse (25th); 120 -> 90 -> 150 BPM followed within a pulse; 400 pulses at 133 BPM, position within 22
units of the pulses at 8 checkpoints (no drift); HOLD after 3 missed pulses, no advance while held, relock inside 2 s from
the held position; LOST after 2 s, pulses alone never restart it, Continue does; Stop wins and pulses after it do nothing;
SPP stopped (row 2, stays stopped), Continue after SPP, SPP while running (back to step 4 of row 1), Start from the middle,
the song end arms again, PLAY leaves follow; a fuzz of 6000 random Start / Stop / Continue / SPP / tempo / gap operations
(states always valid, the position inside the song, no stuck note after the last Stop).

### 33.3 Install and the device incident (2026-11-11, 22:50 to 23:00 PST; what is known and what is not)

- tabby-v04.3 was published only under builds/tabby-v04.3/ (the main page stayed on tabby-v04.2; no GitHub release yet) and
  installed from this NUC through that page: identity SMK-37 Pro_8000001 first, one attempt, 10.2 s, "Firmware ready."
  Read back: build id b136b74165821a3a, USER 471040, A2 on, command 29 status answered. A full backup was taken before
  (overnight/backups/before-v04.3.json, equal to the one taken after the v04.2 transfer-and-save test).
- The first follow run (tools/linux/hw/run-follow.py v0.1) set CLOCK = MIDI by the panel injection (SEQ, then K1 one detent
  up). The next command, select song, got no reply in 1.5 s; a later status read answered after about 5 s (page SYNC / MIDI, song
  16 loaded, CLOCK change applied). After that **the device stopped answering both protocols** (the project-library
  commands and the update protocol's identity query). USB stays enumerated (device 41, no disconnect in the kernel log
  since the install), the device accepts MIDI bytes, and nothing comes back. It did not recover in the minutes that followed
  (a poll every 20 s: overnight/device-poll.log).
- **Needs a power cycle of the SMK-37** (this account cannot reset the USB device: usbreset needs privileges; the hub has no
  per-port power control here). Nothing was written to the device after the hang. Whether the hang interrupted a flash write
  (the CLOCK change marks the settings dirty) is not known.
- What the host says: the same injection sequence (SEQ, K1 up, 600 blocks, K1 down) runs without a hang in the simulator
  (tests/host/smoke.c section 17), and nothing in the v04.3 follow code runs while no song is armed (follow_on = 0).
- **Hypotheses, not verified** (a power cycle and the checks below tell): (H1) the CLOCK change on a firmware with option A2 on
  deadlocks the control task against the audio interrupt's pass requests (the SDK's engine function `groove_clock_set` is not
  ours; before tabby-v04.2 nothing in the audio interrupt called the SDK's control request, and the user's own CLOCK changes
  on v04.0 and v04.1 never hung); (H2) a flash write of the settings (A2's pass request during an erase); (H3) something in
  v04.3's follow or remote code that the simulator does not exercise. H1 and H2 would also hit tabby-v04.2 (on the main page);
  H3 only v04.3.
- **Checks after the power cycle** (all remote, nobody presses anything): (1) `run-remote.py` (v04.3, must pass 26 of 26);
  (2) `run-follow.py --a2 off --song 16 --seconds 30 --out DIR`: the same CLOCK change with A2 off; if that runs and a
  repeat with `--a2 on` hangs, H1 is confirmed and the fix is to switch A2 off around `groove_clock_set` in
  `groove_settings_clock` (app/project.c) or to build A2 off when the clock mode changes.
- Decision taken (the conservative one): **tabby-v04.3 is not released** (main page, GitHub release) until it has passed on the
  device; tabby-v04.2 stays the release. The hard limit "one attempt per build, no more device writes after a failure" was
  applied to the incident as well: no further write was sent.

- **What the disassembly of the SDK shows about the CLOCK change** (read only, build/pro/sdk.elf of v04.3, objdump of the JieLi
  pi32v2 toolchain; the SDK binary is not touched): `groove_clock_set` (SDK engine, 0xBE bytes) starts with a call to
  `fm1_r_7e5e04f16253` and ends with `fm1_r_aa9848f062ec`. The first raises a nesting counter and a "hold" flag in the SDK's flash
  state (the same structure `fm1_flash_read` and `norflash_read` use), then **spins, with interrupts enabled, until the flash
  worker's busy flag is 0**; the second lowers the counter and the flag. The worker is a RAM thread (`fm1_r_2c729ca92be9`) that
  loops over `fm1_r_e7d3da61dac2`: it runs one queued flash operation at a time and is held off while the flag is up. So a CLOCK
  change waits for any flash operation in progress. If that wait never ends the control task never returns: both protocols go
  silent while USB (an interrupt) stays up, which is what the device does. Not ruled out: the audio interrupt's call of
  `fm1_control_request` (option A2) lives in flash (0x201ecb0) and so does `os_taskq_post_type` it calls, while every other call in
  the audio interrupt is RAM code (FM1_AUDIO_CODE); during a flash operation by the worker that call may stall. This is a reading,
  not a proof; the checks above (A2 off against on) decide it.

- **The timing points at the settings save, not at the CLOCK change itself.** After a settings change the firmware saves the
  settings 1500 ms later from `groove_project_poll` (app/project.c: `settings_dirty`, `groove_performance_idle(1500)`; it
  runs `tuning_upgrade`, `recover_staging`, `latest`, a sector read, an erase and writes through the SDK's flash functions).
  The reply to select song that timed out came about 1.5 s after the K1 detent; the first status answer 5 s later; the device
  was dead by the time the identity query ran, 10 to 30 s later. This is the first settings save that ran on a firmware with
  option A2 on in this series (the Task 15 soak and the tests of this night saved projects and songs through commands, not
  through this deferred path). Prime suspect: a flash erase / write in `groove_project_poll` while the audio interrupt asks for
  control passes (A2). Check: after the power cycle, switch A2 off (command 29 op 5), change CLOCK (a settings save), see
  whether the device still answers 5 s later; then repeat with A2 on. tabby-v04.2's release notes now carry a known-issue line.


## 34. Task 16 (second night) — the hang and its fix: no A2 request while flash is being written (2026-11-12)

### 34.1 The evidence (read only: build/pro/sdk.map and the objdump of build/pro/sdk.elf, tabby-v04.3)

| What | Where | Address |
| --- | --- | --- |
| the audio interrupt, render, mixer, MIDI router lanes (FM1_AUDIO_CODE, `.volatile_ram_code`) | RAM (`.ram0_data`, 0x1c00000..0x1c11e74) | RAM |
| the SPI flash driver (`.spi_code`: norflash erase / write / read, cache flush), the irq enable / disable, p33 | RAM | RAM |
| `fm1_control_request` (engine_startup.S, 0x2c bytes) | `.text`, rom | **0x0201ecb0 (flash)** |
| `os_taskq_post_type` (0x2030ebc), `__os_taskq_post` (0x2030e10, 0xac bytes), `xQueueGenericSendFromISR` (0x2030db2), `get_taskq` (0x2030d7c), `xTaskGetHandle` (0x2030cf4) | `.os_code`, rom | **0x02030cf4..0x02030ebc (flash)** |

`fm1_control_request` calls `os_taskq_post_type` (disassembly: `call 2030ebc`). So an A2 request runs about 0x2c + 0xe + 0xac +
0x5e + 0x36 bytes of **flash-resident** code from inside an interrupt that is itself RAM code on purpose: the audio interrupt
keeps running while the SDK erases or writes flash (`fm1_audio_suspend` only mutes the output and zeroes the buffers; it does not
mask the interrupt; the SDK's flash worker and `.spi_code` are in RAM for the same reason). While the SPI controller is busy with
an erase or a write the flash is not readable through the cache: an instruction fetch from 0x02xxxxxx then stalls or returns
garbage, and the chip freezes (USB, a hardware block, stays enumerated; both protocols are silent; this is what the device did).

Why the earlier tests did not see it: the one-hour soak's save ran while stopped, with no MIDI flowing, so no block had an event
waiting and `a2_block` made no request (`a2_block` asks only for an event waiting in lane 0 or 1). In the failed run CLOCK was
being set to MIDI while the NUC sent clock, so lane events kept arriving during the settings save 1.5 s after the change.
v04.2 on the main page has the same fault in the same circumstances (a flash write while MIDI is being routed with A2 on).
**The evidence supports the hypothesis**; it is a reading of the binary plus the timing of the incident, not yet a hardware
proof (the device did not answer on the second night, see 34.3).

### 34.2 The fix (app/midi_router.c, app/diag.c, app/diag.h)

- `volatile uint8_t ct_flash_busy` (RAM): a depth count of app flash erases and writes in progress. Every flash erase and write of
  the app already goes through `ct_diag_flash_erase` / `ct_diag_flash_write` (diag.h redefines `fm1_flash_erase` / `fm1_flash_write`
  for all app files); both now raise the count before the SDK call and lower it after, with a compiler barrier each side.
- `a2_block` (audio interrupt) tests it **first**, after counting the block: if set it counts a skipped block and returns; no
  `fm1_control_request`. The event waits for the SDK's own 10 ms control pass (the A2-off behaviour), which is the
  v04.1.1 situation. A request that began just before the flag was raised has finished before the control task can continue
  (the interrupt is not preempted by a task), so the window is closed on a single core.
- The A2 page (command 25, request 7) grows from 48 to 52 bytes: the last u32 is the number of blocks skipped because of a flash
  operation, so the hardware run can show the guard working. The web page reads by index and ignores the extra word.
- **Not covered, stated plainly:** flash operations the SDK starts itself (outside `fm1_flash_erase` / `fm1_flash_write`: the SDK's
  VM, the loader, the update protocol's own writes while Firmware Update runs). There is no hook in the closed SDK; none of them
  runs while a song plays, and the Firmware Update path stops the app's MIDI routing first.
- Host test (tests/host/smoke.c section 17, "flash guard"): the simulator calls a hook inside every flash erase and write that
  queues a note and renders a block (the audio interrupt during the write). Run with the real sequence of the incident (SEQ, K1 up,
  settings save after 1.5 s): 16 flash operations, 0 without the flag, 0 A2 requests inside them, 8 blocks skipped, flag clear after.
  With the guard line disabled the test fails (8 requests inside a flash operation), so it catches the fault.

**Correction (section 35):** the device was never frozen; the cause was the USB reply path, not flash. The guard stays (the
call path is in flash, that is a fact of the binary), but on the device the skipped-blocks counter stayed 0 through settings
saves with notes flowing: the engine does not call the app's clock hook while a flash operation holds it, so the hazard has
not been seen to occur.

### 34.3 Device state on the second night

The SMK-37 was still not answering at 08:41 PST on 2026-11-12 (device number 41, unchanged since the hang: it has not
re-enumerated, so it has not lost power). The hang tests (`run-follow.py --a2 off`, then `--a2 on`) are therefore not done.

### 34.4 Why one line with A2 on measured 4.91 ms and not 3.67 ms (analysis of the raw captures)

"Band" is the largest minus the smallest residual of a straight-line fit: two extreme notes decide it. The residuals of the
four one-line captures (DIN, note-on time against the fitted grid):

| Capture | notes | p1 | p5 | p50 | p95 | p99 | min..max | band | p5..p95 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| Task 15 diag, A2 on (longwait) | 821 | -1.44 | -1.32 | 0.00 | 1.28 | 1.46 | -1.55..2.23 | 3.78 | 2.60 |
| v04.2, A2 on (overnight) | 960 | -1.47 | -1.31 | -0.01 | 1.31 | 1.46 | -1.54..3.38 | 4.91 | 2.62 |
| Task 15 diag, A2 off | 606 | -5.46 | -4.89 | -0.46 | 5.43 | 5.83 | -5.65..7.36 | 13.01 | 10.31 |
| v04.2, A2 off | 960 | -4.94 | -4.37 | -0.51 | 5.60 | 6.58 | -5.10..9.18 | 14.27 | 9.97 |

The body of the distribution is identical with A2 on (p1 to p99 within 0.1 ms, p5 to p95 2.62 against 2.60 ms): nothing we added
moved the typical note. The v04.2 run has **three** notes above 1.9 ms (2.68 ms at 0.9 s, 3.38 ms at 85.1 s, 2.58 ms at 108.2 s,
of 960); the Task 15 capture has none above 2.23 ms. The band is the extreme of a tail, so a run of 960 notes against 821 and one
bad note give 4.91 against 3.78. Whether the tail is more frequent now (the remote status reads, the control loop's added
`groove_remote_poll`, the song-follow hook) or the same, needs repeated runs: each of three or more 125 s A2-on runs, comparing
the count of notes beyond 2.3 ms; this needs the device and is queued after the hang tests. It is not an A2 effect (A2 off also
shows the wider tail: 14.27 against 13.01). No fix is justified from this data.


## 35. Task 16 (day 2) — what the "hang" was: the SDK holds the last USB write; the USB pusher (2026-11-12)

### 35.1 What was measured on the device (tabby-v04.3 build b136b741, after a real power cycle and a second hub)

| Observation | Result |
| --- | --- |
| CLOCK = MIDI, identity query and command 29 | no reply (same after power cycles: the setting is stored) |
| a note-on sent over USB | sounds on AUDIO4c inputs 3 and 4: the firmware runs |
| K1 back to INT at the panel | replies at once: the control task was never stuck |
| CLOCK = MIDI set by injection with **A2 off** | replies stop at once; a blind K1 -1 injection brings them back: commands are executed, not A2, not flash |
| a key injection in CLOCK = MIDI | the note leaves on DIN in 1.8 ms and on USB in 1 ms; the SysEx reply does not |
| reply to request N in CLOCK = MIDI | arrives 1 to 3 ms after request N + 1 is sent (any length; 26, 34, 66, 80, 85 bytes) |
| FE, a note-off or F8 sent by the host after the request | does not release the reply |
| control passes per second | 100 in INT, 99 in MIDI idle, 106 with clock: the passes run |

Reading: the reply is written to the SDK's USB port ring and stays there until **the next write to the USB port**. With
CLOCK = INT and clock out on USB the next F8 follows within 21 ms (replies take 10 to 20 ms there, a note 1 ms); with
CLOCK = MIDI (or clock out off) nothing follows. The SDK code (`fm1_midi_send_port`, `fm1_port_signal`,
`midi_scheduler_task`, `request_usb_transmit`) was read and looks sound: the exact fault inside it was not found. It is in
every release (the SDK is pinned): tabby-v04.2 and earlier answer nothing over USB with CLOCK = MIDI. The first night's
"hang" (33.3) was this, seen through a tool that waits for replies.

### 35.2 The fix: the USB pusher (app/midi_router.c v0.3)

Every app write to a MIDI port goes through `ct_midi_send_port` (router and transfer replies). A successful USB write arms
`usb_push` (4). At the start of each control pass, when no clock is going out on USB (CLOCK = MIDI, or clock out off, or USB
not a clock port), the pusher sends one undefined real-time byte 0xF9 to USB and counts down; the pusher's own bytes do not
re-arm it. With the clock running on USB nothing is sent (the clock pushes). 0xF9 is undefined in MIDI 1.0: receivers ignore
it and the ALSA sequencer drops it. Host tests: smoke section 17 "USB pusher" (four 0xF9 on USB only after a reply in
CLOCK = MIDI; none in CLOCK = INT). Not covered: replies the SDK sends itself during Firmware Update (the app does not run
then); the update's identity query goes through the app's pass and is pushed.

### 35.3 Device results with the fix (pre-release tabby-v04.3-rc2, build a622f12971fa5162, pusher = 2 bytes)

Published only as builds/tabby-v04.3-rc2/; full backup before (projects, songs, blocks equal to the first night's), identity
first, one install attempt, 12.1 s, read back.

| Test | Result |
| --- | --- |
| CLOCK = MIDI, status every 0.5 s for 12 s | every reply, 7 to 22 ms |
| 1700 status queries back to back in CLOCK = MIDI over three CLOCK changes | 0 lost (one lost in an earlier 300: about 1 in 2000, single attempt; the release sends 4 pusher bytes) |
| settings save 1.5 s after each CLOCK change | one reply delayed to about 70 ms, none lost |
| hang test `run-follow.py --a2 off` | pass: armed, lock, tempo 90 / 150 / 120, HELD, relock, LOST, Stop, Continue, Start, SPP; 0 underruns |
| hang test `run-follow.py --a2 on` | pass, the same states; 0 underruns, 0 DMA overruns |
| `run-remote.py` | 26 of 26 |
| flash guard counter (A2 page word 12) after saves with notes flowing | 0 (34: not seen to be needed) |

Clock follow, measured (NUC as master over USB, 120 BPM, note against the master's pulse; the NUC's own send jitter is in it):

| | A2 off | A2 on |
| --- | --- | --- |
| lock time after Start (DIN / USB) | 7.1 / 6.0 ms | 4.1 / 3.1 ms |
| note offset, mean / std (DIN, 224 notes) | 7.42 / 3.34 ms | 3.46 / 1.75 ms |
| largest single offset | 26.6 ms | 24.1 ms |
| after a tempo change to 90 / 150 / 120, mean | 6.1 / 6.0 / 7.3 ms | 5.5 / 2.7 / 3.7 ms |

In CLOCK = MIDI the engine does not call the app's clock hook, so key and pad notes get no A2 request there (0 calls in 3.5 s
of notes); they leave with the 10 ms pass as before A2.

### 35.4 The one-line band again: it is the screen page

Five more 125 s runs, one line, A2 on, DIN (USB identical):

| Page shown while playing | band | notes later than +1.9 ms (of 960) | largest |
| --- | ---: | ---: | ---: |
| OVERVIEW (three runs) | 5.65, 5.23, 5.00 ms | 3, 3, 5 | +4.12 ms |
| STEPS | 5.84 ms | 9 | +4.28 ms |
| ACTIONS | 5.91 ms | 16 | +4.28 ms |
| SONG, by hand, Task 15 diag build (two captures) | 3.78, 3.67 ms | 2, 3 | +2.23 ms |

The standard deviation is 0.86 to 0.93 ms in all of them. A late note is one whose A2 request arrived while a control pass was
painting (the SDK drops a request made during a pass; the next block asks again, 2.9 ms later). How often that happens depends
on the page being painted. Task 15 measured with the SONG page showing (PLAY pressed there); the remote PLAY of Task 16 leaves
another page showing, and the SONG page cannot be opened remotely (it needs the SAVE button, which the remote control refuses).
So the difference does not come from code added to the MIDI path. A fix would be to let the painter yield while an event waits
(not done; it belongs with F + G).

### 35.5 The release: tabby-v04.3.1 (2026-11-12)

The user's decision: the fix is tabby-v04.3.1; the tag tabby-v04.3 and builds/tabby-v04.3/ stay untouched except for a
"do not install" line (SPEC 17.11). The pusher sends four bytes (USB_PUSHES). Gate: make check, make lint,
`make suite DISPLAY_VERSION=tabby-v04.3.1` green; `make package`: build id 71df5724063bc0cb, app image 452036 bytes, margin
67421. Published to the main page and builds/tabby-v04.3.1/, GitHub release, installed from the page (results in the
release notes and MORNING-REPORT.txt).

## 36. Task 17 — tabby-v04.4: the timer and the look-ahead (F + G), updating with CLOCK on MIDI, the "late note" (2026-11-13)

### 36.1 Options F + G as built (app/midi_router.c v0.4, app/song.c, app/board/audio.c)

A2 (28.4) sends a song note when the audio block that found it ends: 2.9 ms of quantization, and a pass request that arrives
while a pass paints the screen is dropped and repeated a block later (35.4: the band depended on the page). F + G:

- **G, the look-ahead.** Every event the audio interrupt queues into lane 0 or 1 gets a due time on the 24 MHz counter (TIMER4),
  kept beside the lane (`fg_due`, 2 x 128 words of RAM): the counter at the entry of the block's audio interrupt
  (`ct_fg_irq_ticks`, read first thing in `fm1_audio_irq`) + one block (the measured interval between interrupts, `fg_len`,
  about 69632 ticks) + the event's place inside the block. The song tick already sorts its actions by `at` units inside the
  window of `adv` units: `groove_midi_at(at, adv)` before each action. The MIDI clock byte is due `(phase - PERIOD)` of one
  block's phase step before the base, which gives a pulse and a song note at the same musical time the same due time (before,
  the pulse left one block after the note). Stock sequencer and arpeggio notes get the block's base. So MIDI out is one block
  later than with A2, by the same amount for every event, and no longer quantized to blocks. The internal sound of a song is
  posted when its event is sent, as before.
- **F, the timer.** TIMER5 (0x10900, IRQ 63, unused until now) counts the same 24 MHz and interrupts every 12000 ticks (0.5 ms),
  priority 3 (below the audio interrupt's 4: no task can run while the audio interrupt renders, so a higher priority would gain
  nothing). The handler (`ct_fg_tick`, RAM code) asks for a control pass (`fm1_control_request`) when the head of lane 0 or 1 is
  due within 0.25 ms (`FG_LEAD`). The pass (and every flush between LCD bands) sends what is due and leaves the rest in the lane,
  in order. A request the SDK drops because a pass runs is repeated by the next tick, 0.5 ms later.
- **One burst per port.** `fm1_midi_send_port` copies bytes into the port's ring and wakes the SDK's MIDI task on every call
  (read from its code: a byte stream, at most 128 bytes a call). Eight notes due together used to be eight calls per port; when
  the audio interrupt came between two calls the rest left 1.5 ms later. While the router drains its lanes it now collects the
  short messages per port and hands them over in one call (`ct_midi_send_port`, `batch_flush`).
- **The painter waits.** A screen band cannot be interrupted (0.3 ms typical, up to 5 ms). `paint_flush` does not start a band
  while an event is due within the last band's time + 1.5 ms (`ct_midi_due_within`; the 60 ms starvation guard still lets one
  through). The ACTIONS page's two storage lines (up to 5 ms to work out, asked for on every pass) are worked out at most twice
  a second and not while an event is due within 6 ms.
- **The audio block asks no more.** `a2_block` only counts blocks while F + G is live. If the timer does not tick (no tick
  between two blocks) the block is "not live": no look-ahead, and it asks for the pass itself, which is A2 as in tabby-v04.3.1.
- **The switch.** "A2 FAST MIDI" (ACTIONS, remote op 5) switches all of it: off = the 10 ms passes, no look-ahead.
- **Counters.** Command 25 request 10 (56 bytes): running, timer interrupts, events sent with a due time, the latest send after
  its due time, six bins of that lateness (< 0.25, < 0.5, < 1, < 2, < 4, >= 4 ms), block length, timer period, live. The A2 page
  (request 7) now counts the timer's requests (calls, cost, retries).
- **Clock follow.** With the look-ahead a follow song would sound one block after its pulses, so while F + G is live the follower
  predicts one block ahead (`ahead` in `ext_block`); the block in which the run begins (first pulse after Start or Continue, a
  relock) starts ahead in one step and sends its events at once (`groove_midi_immediate`), because the first pulse cannot be
  anticipated.

### 36.2 An interrupt may call the SDK while flash is written: the evidence (corrects 34.1)

Section 34 feared an interrupt fetching flash-resident code while the flash chip is busy. The disassembly of the tabby-v04.3.1
ELF shows the SDK closes that itself: every flash SPI operation runs inside `enter_spi_code` (0x1c00388) ... `exit_spi_code`
(0x1c00470), and `enter_spi_code` calls `cpu_enter_sfc_critical` (0x1c09170), which calls `__local_irq_disable` (0x1c0802c);
`cpu_exit_sfc_critical` (0x1c09214) calls `__local_irq_enable`. `_norflash_write` (0x1c005e6) is one such section per 256-byte
page including the wait for the chip (`norflash_wait_ok`); the erase goes the same way through `norflash_ioctl`. No interrupt of
any priority runs while flash is unreadable, which is also why the SDK mutes the audio around flash writes (`fm1_audio_suspend`
in `fm1_flash_write` / `fm1_flash_erase`) and why the "blocks skipped" counter of 34.2 stayed 0. The SDK's own interrupt handlers
rely on it (they call flash-resident OS code). So the TIMER5 handler may call `fm1_control_request`; `ct_flash_busy` is still
tested first (one load).

### 36.3 Updating with CLOCK on MIDI (item 2): nothing to handle

The task assumed (from section 35) that the device holds its replies when no MIDI clock goes out on USB. A first version of
this work built a page-side check, a "push hold" (remote op 8) and a CLOCK switch (remote op 9) for it, with a fake-device
test. Then the first real update with CLOCK on MIDI (tabby-v04.3.1 to tabby-v04.4-rc1, through the published page in Chrome)
simply ran: 11.4 s, the normal path, the page's check found every reply arriving. That contradiction led to 36.5: the
replies were never held. All of that code was removed again before rc2 (sdk/WebUpdate.js and sdk/Update.html.in are the
tabby-v04.3.1 files plus the Help text). Measured, through the published pages, nobody at the device:

| Update | CLOCK | Result |
| --- | --- | --- |
| tabby-v04.3.1 to v04.4-rc1 | MIDI | 11.4 s, CLOCK still MIDI after |
| rc1 to rc2 | INT | 11.7 s |
| rc2 (no pusher) to rc3 | MIDI | 10.0 s, CLOCK still MIDI after; before it, a Full backup through the page with CLOCK on MIDI |
| rc3 to rc4 | INT | 9.9 s |
| rc4 to tabby-v04.4 (the main page) | MIDI | 10.0 s, CLOCK still MIDI after; Full backup before and after through the page, equal but for the CLOCK setting |

In the page itself (tools/linux/hw/workbench.mjs v0.5, command `replies`): with CLOCK on MIDI on rc2, eight single update-protocol
queries (identity and version, no retry) each got their own reply in 2 to 7 ms.

### 36.4 The note 21 to 26 ms late in clock follow (item 3): the measuring tool, not the device

`run-follow.py` v0.2 measured a note against "the nearest master pulse before it". Two faults of that, both on the NUC:

1. A note that leaves 0.3 ms **before** its own pulse was counted against the pulse before: one pulse period late (20.83 ms at
   120 BPM, 27.8 at 90, 16.7 at 150: the "largest offsets" of 35.3 and of the v04.3.1 runs sit at those values).
2. The master is a Python thread on the NUC. When it sends a pulse late the follower, which predicts between pulses, is early
   against that pulse and late against the next ones. In the first v0.3 capture the NUC sent two pulses 42.6 and 21.9 ms late
   (another job was compiling on the NUC); the one note 15 ms off is the note right after them.

v0.3 measures each note against the pulse of its own step, signed, reports the master's lateness (send time minus schedule) and
a "clean" figure (notes with every one of the 24 pulses before them sent within 0.5 ms of schedule), and saves the raw times.

Before and after (tabby-v04.3.1 against tabby-v04.4-rc3 / rc4, A2 on, 120 BPM, 60 s from Start, DIN; "clean" notes only):

| | v04.3.1 (three runs) | v04.4-rc3 / rc4 (five runs) |
| --- | --- | --- |
| old figure, "largest offset" (nearest pulse before) | 15.0, 23.0, 7.8 ms | not used |
| note against its own pulse, mean | 3.37 to 3.47 ms | 3.27 to 3.40 ms |
| standard deviation | 0.86 to 0.88 ms | 0.76 to 0.82 ms |
| band (largest minus smallest) | 5.1 to 5.9 ms | 2.7 to 3.1 ms |
| lock time after Start | 4.2 ms | 3.6 to 5.8 ms |

The firmware change behind the smaller band is F + G (36.1), not a fix for the "late note": that note was never late.

### 36.5 The "no replies with CLOCK = MIDI" of Task 16 was the NUC's tool (corrects section 35, SPEC 19.4)

`tools/linux/hw/tabby_link.py` reads the device's USB MIDI with kernel timestamps since v0.3 (2026-11-08). `snd_rawmidi_tread`
returns ONE kernel frame (at most 16 bytes) per call and alsa-lib keeps the other frames it read in its own buffer, where
`poll()` does not see them. `messages()` called it once per wake-up, so the rest of a reply (a SysEx is 3 or more frames) stayed
in the library until more MIDI arrived. With CLOCK = INT the device's clock bytes arrived 48 times a second and released it
within 21 ms; with CLOCK = MIDI nothing arrived and the tool reported "no reply". Everything section 35 measured fits this:
"the reply arrives when the next write follows", "K1 back to INT brings the replies back", "one reply in 2000 lost".

Proof (2026-11-14, tabby-v04.4-rc1 and rc2, CLOCK = MIDI):

| Reader | one update-protocol query, no retry |
| --- | --- |
| tabby_link v0.10 (one frame per wake-up) | no reply in 0.5 s; the reply appears 0.2 to 0.6 ms after the NEXT query is sent (the next reply's arrival wakes the reader) |
| the same with kernel timestamps off | own reply, 0.4 to 5 ms |
| amidi | own reply |
| Chrome (the workbench page) | own reply, 2 to 7 ms |
| tabby_link v0.11 (every frame read from the port's file descriptor) | own reply, 0.3 to 0.5 ms; 500 of 500 status queries answered, slowest 18.5 ms |

Consequences: the device never held a reply; tabby-v04.3 was not faulty; the USB pusher of tabby-v04.3.1 (0xF9 bytes after a
USB write) answered nothing and is removed in tabby-v04.4 (the host test now expects no 0xF9). The same one-frame read was in
tools/linux/midi-monitor.py (the DIN capture) and is fixed there too. The timing figures of sections 26 to 35 stand: the
timestamps are the kernel's receive times, only the delivery to the script was late.

### 36.6 Device results (item 4): A2 on, 125 s per run, DIN through the H4MIDI WC and USB, kernel timestamps

Band = largest minus smallest error against a straight-line fit, per line; eight lines: the worst line.

| | OVERVIEW DIN / USB | STEPS DIN / USB | ACTIONS DIN / USB |
| --- | --- | --- | --- |
| tabby-v04.3.1, one line | 4.62 / 4.63 | 5.10 / 5.08 | 5.70 / 5.73 |
| tabby-v04.3.1, eight lines | 5.61 / 6.78 | 6.18 / 6.88 | 6.43 / 7.49 |
| rc1 (F + G), one line | 1.73 / 1.70 | 1.64 / 1.64 | 2.29 / 2.30 |
| rc1, eight lines | 3.40 / 3.77 | 3.89 / 3.75 | 4.08 / 4.47 |
| rc3 (+ painter waits, ACTIONS lines cached), one line | 1.62 / 1.79 | 1.90 / 1.63 | 1.73 / 1.62 |
| rc3, eight lines | 4.17, 4.26, 3.54 / 3.70, 3.79, 3.74 | 3.33 / 3.69 | 2.84 / 3.56 |
| **rc4 (+ one burst per port), one line** | **1.79 / 1.72** | **1.89 / 1.81** | **1.76 / 1.62** |
| **rc4, eight lines** | **2.28, 2.95, 2.32 / 2.20, 2.20, 2.26** | **2.22 / 2.13** | **2.25 / 2.15** |

| rc4 | one line | eight lines |
| --- | --- | --- |
| standard deviation per line | 0.35 to 0.38 ms | 0.58 to 0.62 ms |
| all eight lines on one grid, DIN / USB | | 9.1 / 2.2 ms (tabby-v04.3.1: 12.6 / 8.2; DIN carries eight notes one after the other) |
| events sent < 0.25, < 0.5, < 1, < 2, < 4 ms after their due time | 65, 17, 15, 2.4, 0 percent | 42, 16, 17, 25, 0.1 percent; latest 2.2 ms |
| timer interrupts | 2000 per second | the same |
| pass requests | 51 per second, mean 28 us; longest 0.9 ms (the timer interrupt waiting behind the audio interrupt, not the call) | 57 per second (115 before the bursts), mean 27 us |
| engine underruns / DMA overruns | 0 / 0 | 0 / 0 |
| render peak (deadline 2.90 ms) | 0.87 ms | 1.46 ms |
| CPU GUARD "adapted" | +0 | +120 per run, as on tabby-v04.3.1 (the song's eight voices; 28.6) |

What each step fixed: rc1 ACTIONS eight lines over 4 ms: the page's storage lines (up to 5 ms inside the screen hook). rc3
OVERVIEW eight lines 4.2 ms in two of three runs: one note in 7680, in a burst the audio interrupt cut in two. rc4: no line
over 3 ms in five eight-line runs. Clock follow on rc4: every state of `run-follow.py` as expected with A2 off and on (armed,
lock, HELD after 0.3 s, relock, LOST after 3 s, pulses alone do not restart, Continue, Stop, Start, SPP stopped and running);
`run-remote.py` 27 of 27. Raw files: ~/Documents/Classic Tabby/overnight/g5/ (before, rc1 to rc4).

### 36.7 Tool faults found on the way (all on the NUC)

1. tabby_link `messages()` and midi-monitor `read()`: one timestamp frame per wake-up (36.5).
2. run-follow.py: the offset against the nearest pulse before (36.4); the gap, stop and SPP scenarios need the lock scenario
   before them (the song must be running); song 16 is 120 s long and arms again at its end, so a run of all scenarios with
   --seconds 60 reaches the end during the tempo scenario.
3. The F + G page's timer count was not reset with the other counters on rc2 (fixed in rc3).
4. Another job compiling on the NUC makes the Python clock master late (up to 43 ms): the follow figures use only notes whose
   last 24 pulses were sent within 0.5 ms of schedule.

### 36.8 The release: tabby-v04.4 (2026-11-14)

Gate: make check, make lint (the same 11 host and 3 target warnings as before), `make suite DISPLAY_VERSION=tabby-v04.4` green at
7f4221b; `make package`: build id 4b9196357ae5ba07, app image 453412 bytes, margin 66045 (FLASH-BUDGET 23). Four device-test
builds went before it, each on its own builds/ page (SPEC 17.11): rc1 (F + G, with the later-removed update check and push
hold), rc2 (those and the USB pusher removed, the painter waits), rc3 (the ACTIONS lines cached), rc4 (one burst per port).

**A breach of the gate, stated plainly:** the suite for rc4 FAILED (the sanitizer step: a 64-entry array in tests/host/smoke.c
indexed with the count of a drain that now holds up to 128 messages; a fault of the test, not of the firmware), and rc4 was
published to builds/tabby-v04.4-rc4/ and installed all the same, because the batch script's `set -e` does not act inside an
`&&` list. The rc1, rc2 and rc3 suites passed before their installs. The test is fixed (drain returns no more than it stored)
and the tabby-v04.4 suite passed before anything of tabby-v04.4 was published. The firmware sources of rc4 and tabby-v04.4 are
the same (`git diff tabby-v04.4-rc4 7f4221b -- app web`: empty; only the Help text, the display version and the test differ).

Published: the main page, builds/tabby-v04.4/, the GitHub release. Installed from the main page with CLOCK on MIDI (one
attempt, 10.0 s). On the installed release, 125 s per run: one line 1.82 / 1.80 (OVERVIEW), 1.74 / 1.78 (STEPS), 1.69 / 1.63
(ACTIONS) ms on DIN / USB; eight lines 2.83 / 2.25, 2.33 / 2.24, 2.40 / 2.20 (worst line); 0 underruns, 0 DMA overruns;
`run-follow.py --only lock,gap,stop,spp` with A2 off and on: every state as expected; follow band 2.7 ms (A2 on, clean notes);
`run-remote.py` 27 of 27. The device was left on CLOCK = INT, A2 on, OVERVIEW. Raw files: overnight/g5/final/.

## 37. Task 17 (clips, scenes, clip launching) — Goals 1 and 2: the publish gate, the v04.3 note, tabby-v04.5 (2026-11-14)

### 37.1 The gate and the note line (hard limits 5 and 6, Goal 1)

- **Suite gate.** `make suite DISPLAY_VERSION=<tag>` writes build/suite-gate.json (commit, display version) only when every
  part passed, HEAD did not move and the tree was clean from start to end. `make publish`, `make release-assets` and
  tools/linux/publish-pages.py itself (`--commit` / `--push`) refuse any other commit, display version or a tree that is not
  clean (tools/linux/suite-gate.py; tests/linux/suite-gate-test.py: nine scenarios, the rc4 case among them). DEV_CHECKS 0b.
- **Second tool before a fault report** is rule 0c of DEV_CHECKS.
- **The tabby-v04.3 note line** is now "Never released; superseded by tabby-v04.4. (An earlier note called it faulty; that
  was a measuring error.)". A direct edit and push of the gh-pages checkout was refused by the session's permission
  system, and the publish script rebuilds that checkout from the remote anyway, so note lines are now kept in
  tools/linux/builds-notes.json and applied by tools/linux/builds-index.py on every publish: the index entry, the list
  page, and the text of a page's existing note banner (with its assets.json entry). SPEC 17.11. The correction went out
  with the tabby-v04.5 publish. The release notes of v04.2, v04.3 and v04.3.1 and SPEC 17.11 / 19.4 no longer call the
  build faulty.

### 37.2 The v3 clip, finished (Goal 2; branch classic-tabby/clipv3-cursor, merged)

What was built is in docs/CLIP-V3.md sections 4 to 6 and SPEC 19.6. Measured:

| | tabby-v04.4 | tabby-v04.5 |
| --- | ---: | ---: |
| app image, bytes (margin below 519457) | 453412 (66045) | 456196 (63261) |
| runtime heap, bytes (the build's minimum 49152) | 194956 | 166220 |
| decode buffers (16) with grid and list side by side | | heap 141004 (measured, first build of the branch) |
| decode buffers as a union of grid and list | | heap 166220 (as released) |

- **RAM.** The first device build of the branch (each buffer holding the 1600-byte grid and a 3088-byte event list) took
  53952 bytes of heap. The grid and the list are never used together, so the buffer is now a union: 28736 bytes.
- **A fault found on the way:** `struct clip_v3_event.time` was 16 bits signed, wrong for a clip longer than 68 steps
  (61200 units at 128 steps). It is 32 bits now (app/clip_v3.h v0.2); the 128-step host test covers it.
- **Fuzz.** 60000 payloads through the clip module (22102 checks in all) and 1500 through the storage and scheduler,
  under ASan and UBSan in `make suite`: nothing accepted breaks a rule, the storage takes exactly what the validator
  accepts, 37 random valid clips play to the end with every note released.
- **Decision: transfer kind 9.** Option B (kind 6 hands over v2 or refuses) would have made a full backup lose every clip
  the grid cannot hold. Kind 9 downloads a block as stored, with its format byte; kind 6 is unchanged.
- **Decision: controllers are an importer option** (`controllers`, the page's box ticked at the start; off in the
  importer's own defaults so the fixture tests stay comparable), thinned to one value per controller per 1/8 step.
- **Decision: the default row length stays within 64 steps** when a whole-bar length of at most 64 steps exists, so a plain
  import still writes v2 blocks that older firmware plays.

### 37.3 Tools for the device validation

- tools/linux/hw/expected-events.mjs: the repository's importer on a MIDI file with given options, as a flat list of
  note-ons (time from the song start, track, pitch, velocity), clip controller events and the block formats.
- tools/linux/hw/run-clips.py: remote PLAY, DIN and USB capture until the song ends, then every expected note-on matched
  per channel, a straight-line fit of measured against expected times (slope = the device's tempo ratio, residuals = timing
  errors), the clip controller events in order, stuck notes, the audio counters.
- tools/linux/hw/workbench.mjs v0.6: `song --options JSON` (importer options through the published page).
- First use, on tabby-v04.4 with a v2 song (offgrid.mid through the main page): 6 of 6 note-ons, worst 0.20 ms,
  tempo ratio 0.99972 on DIN (the device's audio clock against the nominal 44100).

### 37.4 The releases: tabby-v04.5, and tabby-v04.5.1 for a fault of its page

**tabby-v04.5** (build e5a6c8b4789170be): suite green at b2dee55 (the gate's marker), published to the main page and
builds/tabby-v04.5/ through the gated targets, GitHub release; Full backup, identity check, one install attempt, 12.3 s.
On the device, through the published page and `run-clips.py`: offgrid.mid (v2) 6 of 6 note-ons, worst 0.27 ms;
bassline-4bar.mid (v2) 16 of 16, worst 0.71 ms on DIN. Then the three imports that need a v3 clip failed **in the page**:
"clip-v3.js not loaded". tools/linux/build-web.py did not inline web/clip-v3/clip-v3.js with the importer; every test loaded
the modules through Node's require, where the module is found. The firmware was not at fault (the device never got those
songs).

**tabby-v04.5.1** (build 3df5848e878827d6, the same firmware with its version text): the module is in the bundle;
tests/workbench/page-bundle.mjs reads the script list out of build-web.py, runs it in a bare context without require and
imports the chord, controller and long-row fixtures there, and checks a built page for the modules. Device results follow
in 37.5.

### 37.5 tabby-v04.5.1 on the device (2026-11-14)

Full backup, identity check, one install attempt from the main page: 12.2 s. Songs imported through the published page
(`workbench.mjs song`), played by remote command, DIN and USB compared with `expected-events.mjs` by `run-clips.py`:

| Song (importer options) | blocks v2 / v3 | note-ons matched | worst timing error DIN / USB | result |
| --- | --- | --- | --- | --- |
| offgrid.mid | 1 / 0 | 6 of 6 | 0.28 / 0.27 ms | pass |
| bassline-4bar.mid | 1 / 0 | 16 of 16 | 0.84 / 0.32 ms | pass |
| five-notes.mid (a six-note chord) | 0 / 1 | 7 of 7 | 1.69 / 0.00 ms | pass |
| tempo-cc-program.mid (controllers) | 0 / 1 | 16 of 16 | 1.77 / 0.32 ms | notes pass; CC 74 = 0 at the row start sent twice (below) |
| timing-1x16.mid (rows of 128 steps) | 1 / 1 | 960 of 960 | 1.42 / 1.07 ms | pass |
| multitrack-64bar.mid (3 tracks, chords) | 6 / 0 | 1600 of 1600 | 6.32 / 1.44 ms | pass on USB; on DIN up to nine notes on a step pass the cable one after the other (the tool's DIN tolerance now allows for it) |

0 underruns and 0 DMA overruns in every run; render peak 0.9 ms with a v3 clip playing (0.3 to 0.5 ms with the small v2
songs), 1.44 ms with the three-track song. The device's tempo is 0.9996 of nominal in every run (its audio clock).
Full backup after it and Verify against file through the page: PASS, 32 items (8 songs, 21 blocks, v3 clips among them).

**One fault found, in the importer (not the firmware):** a control change at a row start became a row event and was also
put into the clip, so it went out twice. Fixed in the importer (the fix ships with tabby-v04.6); tests/midi-import/run.mjs
checks it. tabby-v04.5.1's page still does it: harmless (the same value twice), listed in its release notes.

## 38. Task 17 Goal 3 — tabby-v04.6: song record version 3, scenes (2026-11-14)

### 38.1 What was built (the format and the behaviour are in docs/SCENES.md; SPEC 19.7)

- Firmware: `scenes_valid`, `song_record_expand` (app/song_storage.c), the song model and the master cycle in app/song.c
  (`next_bar` uses it), capability flag bit 4, remote ops 9 to 11. The scheduler is untouched: a loaded record of any version
  is rows to it. Host tests, section 21: the same song as rows and as scenes plays byte-identical MIDI (11 messages, each
  in the same block); the stored record stays version 3; eight refusals; a launch with a master cycle of 12 steps starts at
  step 12 (516 blocks after the song's first note; 689 would be 16 steps).
- Workbench: both record codecs read and write version 3; the song editor's "Stored as" and "Master cycle"; the guard for
  older firmware; the backup round trip with a scenes song (its clip table, a clip no scene uses) against the firmware in the
  simulator.
- Importer: `record: 'scenes'` (clips of up to 8 bars, the cycle = the file's bar, the 64-clips-per-track limit with its
  message); the row-event controller is no longer repeated in the clip (37.5).
- Decisions: (1) the firmware converts a version-3 record to rows at load instead of a second scheduler path (one scheduler,
  identical MIDI, 704 bytes of flash); (2) a version-1 or -2 song gets a clip table made from its rows, so the clip page of
  Goal 4 needs one model only; (3) the importer's own default stays rows, the page's box asks for scenes, so the existing
  importer tests keep their meaning; (4) a scene's length stays steps x repeat (the assessment's "LENGTH in master cycles"
  would have made 3/4 scenes awkward).

### 38.2 Measured

| | tabby-v04.5.1 | tabby-v04.6 |
| --- | ---: | ---: |
| app image, bytes (margin) | 456196 (63261) | 456900 (62557) |
| runtime heap, bytes | 166220 | 161548 |

### 38.3 On the device (2026-11-14)

Suite green on commit 2fdf9cb (the gate's marker), tagged, published (main page and builds/tabby-v04.6/), released. Full
backup through the tabby-v04.5.1 page (overnight/backups/before-v04.6.json), one install attempt from the main page:
identity SMK-37 Pro_8000001, "Firmware ready." after 11.1 s, version tabby-v04.6. Then, all by remote command
(overnight/g6/v046.log):

| Song (imported through the page with "scenes" on) | Blocks v2 / v3 | DIN | USB |
| --- | --- | --- | --- |
| offgrid | 1 / 0 | 6 of 6, worst 0.29 ms | 6 of 6, 0.31 ms |
| bassline-4bar | 1 / 0 | 16 of 16, 0.85 ms | 16 of 16, 0.32 ms |
| five-notes | 0 / 1 | 7 of 7, 1.62 ms | 7 of 7, 0.00 ms |
| tempo-cc-program (controllers) | 0 / 1 | 16 of 16, 1.38 ms; 10 controller events in order | 16 of 16, 0.26 ms; 10 in order |
| timing-1x16 (rows of 128 steps) | 1 / 1 | 960 of 960, 1.23 ms | 960 of 960, 1.18 ms |
| multitrack-64bar (controllers) | 0 / 9 | 1600 of 1600, 6.69 ms (three lines together on one cable: 37.5) | 1600 of 1600, 1.71 ms |

- Master cycle: bassline-4bar imported with a cycle of 12 steps, looping; six launches at random moments by remote op 9:
  each first note on the next multiple of 12 steps after the command, errors -0.33 to -1.32 ms (run-scenes.py).
- Timing (run-15.py, song 16, one line, 125 s, overview page): band 1.82 ms on DIN, 1.67 ms on USB; F + G latest event
  1.49 ms after its due time; no underrun, no DMA overrun.
- Full backup and verify after: PASS, 37 items (9 songs, 25 blocks).

Two failures in the first run were my tools, not the device (hard limit 6: each was checked against the wire before
anything was called a fault):

1. run-clips.py reported the controller song as wrong: "sent (74, 0) first, expected starts at (74, 10)". The wire was
   right: controller 74 = 0 at the song start is a row event since the importer fix of 37.5 and goes out once. The
   expected list (expected-events.mjs) held the clips' controllers only. v0.2 adds the row controller events; the rerun
   passes on both ports.
2. run-scenes.py failed five of six launches with an error growing 1.2 ms per cycle. It scaled the cycle by the device
   clock the wrong way round (divided by 0.9996; the device's note times are 0.9996 of nominal on every song measured).
   v0.2 multiplies; the rerun passes six of six.

## 39. Task 17 Goal 4 — tabby-v04.7: the control map and the CLIPS page (2026-11-14)

### 39.1 What was built (docs/CONTROL-MAP.md; SPEC 19.8)

- docs/CONTROL-MAP.md first: every control on the two pages, the stage actions with their press counts, pad colours,
  faders, mute, transport, messages.
- app/song.c: `song_clip_launch(track, place)` (a clip a scene uses is launched as that scene's pattern; any other as a
  place row with the clip's own length), `song_track_unqueue`, `song_mute_set` (a muted track's note-ons stay in),
  `song_row_place`.
- app/screen.c: page 20 is the CLIPS page (pads = clip places in four banks, press / long press / take back, K5 track,
  K6 and OCT bank), pad states and colours for CLIPS and for the SONG page's scene pads, BT opens the page, the song-mute
  bit set by SHIFT + pad 9 to 16, wording (SCENE, CYCLE) on both pages.
- app/transfer.c: remote ops 12 (page state), 13 (clip launch), 14 (take back).
- Tests: host section 22 (14 checks); tests/workbench/clips-sim.mjs (48 checks, panel events only, MIDI out compared);
  tools/linux/hw/run-launch.py for the device.

Decisions:

1. BT is the CLIPS button. It did nothing but show a notice since tabby-v03.0, it is in the right-hand group next to
   SCL and ENV, and one press from any page was the requirement.
2. A press queues at once and a long press takes it back, instead of waiting for the release to tell short from long: a
   press just before the bar line must not lose the bar.
3. Pressing the playing clip stops the track (as on the old LAUNCH page), not "restart the clip" as on the MC-707: stop
   is the commoner stage action and had no other one-press control.
4. Mute holds song notes back only when set by SHIFT + pad. The first version followed the mixer's mute and silenced
   tracks 6 and 7 of every existing song on MIDI out (they start muted in the mixer); the host tests of Task 06 caught
   it.
5. The SONG page keeps its name on the screen; only the words on it changed (SCENE, NEXT CYCLE). Renaming the page would
   have touched ACTIONS, Help and the guide for no gain on stage.
6. With the song stopped a pad only selects. Starting the transport from a clip pad needs a decision about what the other
   tracks do; left for the report.

### 39.2 Measured

| | tabby-v04.6 | tabby-v04.7 |
| --- | ---: | ---: |
| app image, bytes (margin) | 456900 (62557) | 459044 (60413) |
| runtime heap, bytes | 161548 | 161484 |

Build id `0d191b58095bef25`. make check, lint, test-fast and midi-import-sim green on the branch before the merge
(overnight/g6/tf-v047.log); the suite result and the device results are in 39.3.

### 39.3 The suite, the release and the device (2026-11-14)

Suite green on commit 3bb9e3a (the gate's marker), tagged, published (main page and builds/tabby-v04.7/), released. Full
backup through the tabby-v04.6 page (overnight/backups/before-v04.7.json), one install attempt from the main page: identity
SMK-37 Pro_8000001, "Firmware ready." after 10.5 s, version tabby-v04.7. Then, all by remote command (overnight/g6/v047.log,
v047-launch.log):

- The CLIPS and SCENES pages (run-launch.py v0.3, the song of clips-song.mjs imported through the page as scenes; every
  action a remote panel key, every check the page state of op 12 and the TRS MIDI out): 37 of 37. BT opens the page;
  SHIFT + pad selects the track; colours empty / stopped / selected / playing / queued (blinking green) / stop queued
  (blinking red) / muted (orange) as in the control map; five launches at random moments, each first note on the next
  master cycle (errors -0.30 to +0.66 ms) and looping over the scene change; five stops, no note after the cycle; a
  queue taken back; the long press; mute (no note of the track for two cycles, back on the beat after); ENV; a scene
  recall from its pad; BT back; PLAY stops; no stuck note, no underrun.
- Earlier songs again: timing-1x16 960 of 960 (DIN worst 1.19 ms, USB 1.01), multitrack-64bar 1600 of 1600 (USB 1.53 ms;
  DIN 7.16 ms, the three-lines-on-one-cable case), tempo-cc-program 16 of 16 with its 10 controller events in order.
- Master cycle of 12 steps: 6 of 6 launches on the cycle.
- Timing (run-15.py, song 16, one line, 125 s): band 1.67 ms on DIN, 2.00 ms on USB; F + G latest event 1.63 ms after its
  due time; no underrun, no DMA overrun.
- Full backup and verify after: PASS, 41 items (10 songs, 28 blocks).

The page test failed twice before it passed, both times through the script (hard limit 6; the MIDI on the DIN input was
the second reader each time, and it showed the device doing the right thing):

1. v0.1, 20 of 34: it pressed "pad 2" blind. Track 1 follows scenes that alternate its two clips, so in every other
   cycle pad 2 is the playing clip and the press correctly queued a stop (the pad blinked red, as the control map says).
   v0.2 stops the track first and launches from a stopped track. It also read the scene recall before the recalled
   scene's cycle had ended.
2. v0.2, 35 of 37: one press fell 22 ms before the cycle; the clip started on that cycle (error -0.09 ms), and the script
   then looked for a queued, blinking pad. v0.3 makes the presses whose queued state it checks at least 700 ms before a cycle.

## 40. tabby-v04.7.1: the answers to the tabby-v04.7 report (2026-11-16)

### 40.1 What was built (SPEC 19.9, docs/CONTROL-MAP.md v0.2)

- The MC-707 manuals were read from Roland's site (MC-707_Reference_eng02_W.pdf, MC-707_update_eng09_W.pdf): a clip selected
  while stopped is reserved and START plays it (p. 12); Clip mode plays and stops clips (p. 21); neither manual says that a
  press on the playing clip restarts it. The tabby-v04.7 report's "the MC-707 restarts it" was my error.
- app/song.c: `reserve_row` / `start_row`; `song_clip_launch` and `song_track_unqueue` work with the transport stopped.
- app/screen.c: the stopped press reserves (RESERVED - PLAY STARTS IT); `mute_kind`; blue for the mixer's mute alone;
  M-ALL / M-INT on the overview.
- tools/linux/builds-notes.json: the tabby-v04.5 note line (applied by the publish).
- docs/CONTROL-MAP.md section 11, "Differences from the MC-707".
- Tests: host section 22 (reserve and take back while stopped); clips-sim.mjs v0.2, 54 checks (reserve, take back, PLAY
  starts the reserved clip on the song's first note, the mixer's mute shows blue and lets the notes out).

### 40.2 Measured

| | tabby-v04.7 | tabby-v04.7.1 |
| --- | ---: | ---: |
| app image, bytes (margin) | 459044 (60413) | 459620 (59837) |
| runtime heap, bytes | 161484 | 161420 |

Build id `35cc4d303068d66f`.

### 40.3 The suite, the release and the device (2026-11-16)

Suite green on commit 482326e (the gate's marker), tagged, published, released; the builds list shows the tabby-v04.5 note
line. Full backup through the tabby-v04.7 page, one install attempt: "Firmware ready." after 11.6 s, version tabby-v04.7.1.
By remote keys (overnight/g6/v0471.log): the clip page test, run-launch.py v0.4, 40 of 40 (a pad pressed while stopped
reserves and blinks; pressed again it is taken back; PLAY starts the reserved clip on the first beat and it loops; five
launches on the cycle within 2.1 ms; five stops; mute; ENV; scene recall); timing-1x16 960 of 960 (DIN worst 1.20 ms, USB
1.10); master cycle of 12 steps 6 of 6; one line of 960 notes: band 1.66 ms on DIN, 1.67 ms on USB; no underrun; backup and
verify PASS (41 items).

## 41. Goal 6, first step — tabby-v04.8: step editing on the pads (2026-11-16)

### 41.1 What was built (SPEC 19.10, docs/CONTROL-MAP.md section 12)

- app/clip_v3.c v0.3: editing in place (`clip_v3_insert`, `_remove`, `_step_notes`, `_note_find`, `_step_mod`,
  `_step_mod_set`, `_empty`, `_bytes`).
- app/song.c: the editor (`song_edit_*`), the decoder taking the unsaved clip, the refresh of a looping clip (`fresh`,
  taken at SW_LOOP), four undo levels, the save and the save by itself.
- app/screen.c: page 21, the STEP page (pads = steps, keys enter notes through the new `smk37_screen_key`, K1 to K7,
  ENV, FX, SCL, the 4th left button), its pad colours, remote ops 15 and 16.
- Tests: clip_v3_test.c (9 edit cases and 40000 random edits under the sanitizers), smoke.c section 23 (19 checks),
  tests/workbench/steps-sim.mjs (48 checks), the Help audit's chapter 00 check follows the new sentence.

Decisions:

1. The edit lives in RAM and the decoder reads it. Nothing else lets an edit be heard while the song plays, because
   flash is not written then (SPEC 15.4).
2. A looping clip takes the edit at its next pass, not mid-bar: the audio thread reads a prepared buffer, and a swap at
   the loop point needs no lock and cannot drop or double a note.
3. One open clip, one unsaved clip. Each further unsaved clip would cost 3 KB plus its undo levels; the refusal says
   what to do.
4. The event cap stays the format's 512 for this release (SPEC 14.2 says 768). Raising it changes the clip format, the
   workbench codecs and the backups; asked in the report.
5. A grid block is saved as a v3 clip after an edit. It plays identically, and one writer is less code than two.
6. Pads select and keys enter, the MC-707's split between step buttons and pads; SCL switches to one-press toggling for
   drums on any track, because an outside drum machine sits on a track that is not a drum track inside the SMK-37.
7. Saving by itself after ten seconds stopped, on top of the explicit save: unsaved work is lost at power-off, and a
   stage device gets switched off.

### 41.2 Measured

| | tabby-v04.7.1 | tabby-v04.8 |
| --- | ---: | ---: |
| app image, bytes (margin) | 459620 (59837) | 467588 (51869) |
| runtime heap, bytes | 161420 | 145804 |

Build id `6238066d230eee73`. make check, lint, test-fast and midi-import-sim green on the branch (overnight/g6/tf-v048.log).

### 41.3 The suite, the release and the device (2026-11-16)

Suite green on commit 068e2a5 (the gate's marker), tagged, published, released. Full backup through the tabby-v04.7.1 page,
one install attempt: "Firmware ready." after 11.1 s, version tabby-v04.8. By remote keys (overnight/g6/v048.log):

- The STEP page (run-steps.py v0.1, first run): 18 of 18. The editor opens on the clip; a pad selects a step; a remote
  key enters its note; K2, K3 and K4 change velocity, start and length; undo and redo; PLAY starts the song and the
  unsaved note plays on its step, 30 units late as set (2506.4 ms after Start; 2506.8 expected); a note entered while
  the clip loops plays on its step in the following loops (-1.0 and -1.2 ms); the playing step is reported; a save while
  playing is refused (code 76); stopped it is saved, and is there after a discard and a reopen; ENV clears a step; the
  clip is saved by itself ten seconds after the change; the song started again plays the stored clip; no stuck note,
  no underrun.
- The CLIPS page again (run-launch.py): 40 of 40. timing-1x16: 960 of 960 (DIN worst 1.32 ms, USB 1.07).
- Timing, one line of 960 notes: band 1.86 ms on DIN, 1.73 ms on USB; F + G latest 1.54 ms.
- Full backup and verify after: PASS (41 items).

## 42. Goal 6, second step — tabby-v04.9: real-time recording (2026-11-16)

### 42.1 What was built (SPEC 19.11 and 14.2 as amended, docs/CONTROL-MAP.md section 13)

- app/song.c: the recorder (`song_record_start`, `_stop`, `_poll`, `_in`, `_quantize`, `_full`): TIMER4 stamps turned into
  clip times from the block the audio thread publishes; 16 held notes with reserved places; controller thinning; the cap;
  the take as one undo level.
- app/smk37_controls.c `send()` and app/midi_router.c `midi_received_body` feed it (panel and MIDI in).
- app/screen.c: REC on the CLIPS and STEP pages (start, stop, SHIFT + REC input quantize), the REC lamp, the messages,
  the red pad at the cap; op 15's reply carries the recorder's state.
- Tests: smoke.c section 24 (the cap: three held notes keep their places, the next event stops the take, 512 valid events,
  undo gives the clip before the take, step entry into a full clip is refused); tests/workbench/record-sim.mjs (28
  checks); the Help audit list (the Help text avoids two words the list bans for the removed features).

Decisions:

1. **The cap is 512, not SPEC 14.2's 768.** A 768-event clip is 4624 bytes and a block must fit one 4096-byte sector
   (4070 bytes of payload). SPEC 14.2 is amended with the reason; the rule itself is built as written.
2. A take needs the clip looping on its track, and REC launches it. A track that follows the scenes changes clips under
   the player; one fixed loop makes "where in the clip am I" a single subtraction.
3. A note is written at its note-off (its length is known then) and heard from the next loop. Writing at the note-on
   and patching the length would let the player read a clip that is being changed.
4. Input quantize is on at power-up, to the step. The MC-707 has it on a button; here SHIFT + REC. Unquantized takes
   are stamped where the message arrives (TIMER4), not when the control task gets to them.
5. A second note of a pitch on a step replaces the first (the format allows one). Overdubbing the same hit twice
   should not fail.
6. No count-in and no metronome in this release (SPEC 14.1 decision 7 stands); recording into an empty place waits for
   clip creation. Both are in the report's next steps.

### 42.2 Measured

| | tabby-v04.8 | tabby-v04.9 |
| --- | ---: | ---: |
| app image, bytes (margin) | 467588 (51869) | 471044 (48413) |
| runtime heap, bytes | 145804 | 144844 |

Build id `d1191dd33942c3c3`. make check, lint, test-fast and midi-import-sim green on the branch (overnight/g6/tf-v049.log).

### 42.3 The suite, the release and the device (2026-11-16)

Suite green on commit 8711092 (the gate's marker), tagged, published, released. Full backup through the tabby-v04.8 page,
one install attempt: "Firmware ready." after 11.6 s, version tabby-v04.9.

Recording on the device (run-record.py v0.2, overnight/g6/v049-record.log): 15 of 15.

| Check | Result |
| --- | --- |
| REC while stopped arms; PLAY starts the take; the clip before it is one undo level | yes |
| A remote key played at step 5.6, input quantize on | recorded on step 6, length 1231 units (0.3 s held); played back -0.45 and -0.52 ms from the step |
| A note sent to USB MIDI in at step 11.4 | recorded on step 11; played back +1.71 and +1.48 ms from the step |
| Input quantize off, three keys between steps | played back +3.29, +2.82 and +2.84 ms after where the live note sounded |
| 61 controller values in 272 ms (1045 units) | recorded as 6: one per 240 units and the last; played back 0, 13, 27, 43, 59, 60 |
| REC stops; FX undoes the whole take | yes |
| Audio underruns, DMA overruns | 0, 0 |

An unquantized note comes back about 3 ms (one audio block) after the place it was played. The stamp is exact; the note
is sent in the block after its due time is reached where the live note went out at once. Not corrected in this release.

Then run-steps.py 18 of 18 and run-launch.py 40 of 40 on tabby-v04.9; timing-1x16 960 of 960 (DIN worst 1.23 ms); backup
and verify PASS (41 items).

Three things went wrong in the first batch run. Each was looked at with a second reader (the DIN capture, the page state
read back, a repeat) before it was called anything (hard limit 6):

1. **The recording test stopped after eight passing checks.** My script: `wait_phase` looked for a 15 ms window with a
   20 ms poll, missed it again and again and was killed by its 500 s timeout, in the middle of a take. v0.2 idles until
   80 ms before the moment and sleeps the rest; it also sets input quantize instead of assuming it (the killed run had
   left it off, which made the next run's checks read backwards).
2. **A device fault, found because of 1: HOME did nothing on the STEP page while a clip was open.** The page's handler
   took every button it did not know and returned. The killed test left the device there, and the two tests after it
   could not reach the overview ("page OVERVIEW wanted, the device shows STEP"). Confirmed by hand with the page read back
   after a remote HOME. In tabby-v04.8 and tabby-v04.9; EDIT and BT were the ways out. Fixed in tabby-v04.9.1 (section 43);
   the simulator test now presses HOME there.
3. **One timing run showed a band of 5.04 ms on DIN and 4.89 ms on USB** where every other run shows 1.7 to 2.0 ms. It
   was not jitter: averaged over 96 notes the error runs smoothly from -1.5 ms up to +1.3 ms in the first 45 s and back
   down to -0.9 ms, a rate change of about 70 parts per million, the same on both ports, with the usual 0.36 ms scatter
   around it. Three repeats, one of them after recreating the state the killed test left behind and the same sequence
   of tests, gave 1.98, 1.87 and 1.87 ms. F + G's own counter in the odd run was normal (latest event 1.41 ms after its
   due time). The cause is not established: the two clocks compared (this computer's and the SMK-37's) drifted against
   each other during that run, and nothing in the logs says which one moved. Not counted as a device fault; the report
   lists it.

## 43. tabby-v04.9.1: HOME on the STEP page (2026-11-16)

app/screen.c: HOME on the STEP page goes to the overview and the clip stays open (docs/CONTROL-MAP.md 12.4 said so all
along). tests/workbench/steps-sim.mjs v0.2 presses HOME with an unsaved clip open, then BT and EDIT, and finds the clip
as it was. App image 471076 bytes (+32), margin 48381; build id `fdcb1d2e916fb8a6`.

### 43.1 The suite, the gate, the release and the device (2026-11-16)

- The first suite run, in the release worktree (`firmware`), passed every test, and the gate wrote no marker: "the suite
  passed, but the tree was not clean". An untracked file, docs/FLASH-CHIP.md, had appeared there during the run (a
  read-only investigation of the flash chip identity, dated the same day, not written by this session). It was left as it
  was. The suite was run again on the same commit (c53f6fc) in the second worktree (`firmware-clipv3`), which was clean;
  the gate wrote its marker there and the publish and the release were made from that worktree. Nothing about the gate
  was changed. The publish checkout (`build/gh-pages`) moved to that worktree with it.
- Full backup through the tabby-v04.9 page, one install attempt: "Firmware ready." after 10.7 s, version tabby-v04.9.1.
- HOME on the STEP page with an unsaved clip open: the overview, the clip still open and unsaved. PASS.
- Recording 15 of 15 (quantize off: playback +3.12, +2.84, +3.65 ms after the live note; a sweep of 61 values in 253 ms
  recorded as 5). The STEP page 18 of 18. timing-1x16 960 of 960 (DIN worst 1.18 ms). One line of 960 notes: band
  1.77 ms on DIN, 1.80 ms on USB. Backup and verify PASS (41 items).
- The CLIPS page: 38 of 40 in the batch, 40 of 40 on the rerun, then 37 of 40. Two different things:
  1. My script (v0.4) compared late notes against cycles of a fixed length, 2000 ms x 0.9996. The ratio between the two
     clocks was 0.99965 in that run; after a minute that is 3 to 5 ms, and two checks failed by under a millisecond.
     v0.5 takes the cycle from the device's own MIDI clock on the DIN input.
  2. **A device fault**, seen when the script ran twice without the song being written again in between: after the song
     is stopped, a track that was launched stays "launched" in the status. The CLIPS page kept that clip's pad green
     while nothing played, and a press on it, meant to reserve it for the next PLAY, was taken as "stop the playing
     clip" and did nothing. Read back twice from the page state. In every build since the reservation came
     (tabby-v04.7.1); the green pad since tabby-v04.7. Fixed in tabby-v04.9.2 (section 44).

## 44. tabby-v04.9.2: a stopped song has no launched tracks (2026-11-16)

app/song.c `song_status_read`: while the song is stopped every track reports "follows", no row and no clip (a reservation
still shows as a queued launch). tests/workbench/clips-sim.mjs v0.3: play, launch a clip, stop: no pad green, no track
launched, and the clip that had been launched can be reserved. App image 471108 bytes (+32), margin 48349; build id
`25b19e683786f068`.

### 44.1 The suite, the release and the device (2026-11-16)

Suite green on commit 3125c61 in the clean worktree (the gate's marker), tagged, published, released. Full backup through
the tabby-v04.9.1 page, one install attempt: "Firmware ready." after 11.1 s, version tabby-v04.9.2. By remote keys and MIDI
in (overnight/g6/v0492.log): HOME on the STEP page PASS; recording 15 of 15 (quantize off: playback +2.66, +2.89, +3.08 ms
after the live note; 61 controller values in 256 ms recorded as 5); the STEP page 18 of 18; the CLIPS page 40 of 40, and
40 of 40 again without the song being written anew in between (the state after a stop, which failed on tabby-v04.9.1);
timing-1x16 960 of 960 (DIN worst 1.12 ms); one line of 960 notes: band 1.77 ms on DIN, 1.73 ms on USB; no underrun;
backup and verify PASS (41 items).

## 45. tabby-v04.9.3: the flash part page (2026-11-16)

Command 25 request 11 (app/diag.c v0.8, SPEC 19.12) reports the flash chip's JEDEC ID and size as the SDK read them at
boot, for docs/FLASH-CHIP.md (would a newer SMK-37 with another chip break Classic Tabby? No: nothing gates on the ID).
The SDK keeps them in `flash_info`, a local symbol of libfm1_engine.a. tools/linux/build.py v0.12 therefore links twice:
pass 1 with `ct_sdk_flash_info=0`, nm finds `flash_info` (0x01c5c268), pass 2 with `--defsym ct_sdk_flash_info=0x01c5c268`.
The build stops unless both links put `flash_info` at the same address. In the image the page is eight byte loads from
`flash_info+24..31` inside `ct_diag_read` (0x2000b72): no call, no SPI command, no flash access.

Workbench: `diagRead` asks for request 11 and keeps `flash_part`. `diagText` prints one line through `flashPartText`,
any ID as it is. Older firmware answers an error, which is skipped. Tests: smoke.c section 25 (six IDs: none, the
Puya, the UC25HQ80, Skiff's SMK-37 part, two unknown; each reported as given and a block stored and read back with
it), backup.mjs v0.6 (the simulator says "none"; the text of a device line), tests/linux/flash-part-guard.py in
workbench-test (the symbol and the decoded page are named nowhere else; no JEDEC constant in app/, web/, the page).
App image 471172 bytes (+64), margin 48285; build id `85d3dd36e7d4288e`.

### 45.1 The suite, the release and the device (2026-11-16)

Suite green on 48ca383 (crosscheck: both tracks link twice and put `flash_info` at 0x01c5c268; the same sdk.elf
626d23c5…, .fwsc ccc19f6d…). The suite and the publish ran in the main checkout, because another session was working in
../firmware-clipv3. Its `build/gh-pages` worktree (clean, at origin) was removed for the publish and added back afterwards
at the new gh-pages head. Tagged, published (root and builds/tabby-v04.9.3/), released. Before the install,
tools/linux/hw/tabby_link.py was proven read-only on tabby-v04.9.2: request 11 gave error 71 and request 0 gave 64 bytes.
Full backup through the tabby-v04.9.2 page, one install attempt: "Firmware ready." after 11.1 s, version tabby-v04.9.3
(overnight/g6/v0493.log). Diagnostics on the page: `flash part (read by the SDK at boot): JEDEC 0x856014, 1024 KiB; USER
471040 bytes`. tabby_link request 11: 16 bytes, 0x856014, 1048576, 471040, source 1. **This unit's flash is the Puya P25Q80**
(docs/FLASH-CHIP.md 6). Backup after the install and verify against the file from before: PASS (41 items).

## 46. tabby-v04.10: the clip workflow on the panel (2026-11-16)

### 46.1 What was built (SPEC 19.13, docs/CONTROL-MAP.md sections 13 to 16)

- app/song.c: every track loops its clip at the clip's own length (`frame_set`, `SW_LOOP` for tracks that follow the
  scenes too; a scene repeat no longer restarts the tracks); the v2 length rule (`v2_steps`, `SONG_ROW_FLAG_OWN`);
  clip chains (`SW_CHAIN`, `chain_set`, the next clip decoded ahead by `wanted`); the scene hold; `song_clip_new`,
  `song_clip_copy`, `song_edit_length`, `song_scene_store`; the song's settings (`song_setting`, header bytes 44 to
  46); the click (`click_window`, `song_click_mix`) and the count-in (in `song_tick`, before the start request);
  takes one block earlier (`rec_units_at`); `song_edit_save` also writes the song record.
- app/song_storage.c: `song_record_write_model` (the loaded song as a version-3 record, built in the sector image);
  scene flag bit 1; a staged version-3 record is recovered (`staged_target` used the version-1 CRC range for it).
- app/clip_v3.c v0.4: the chain in header bytes 8 to 11, `clip_v3_steps_set`, `clip_v3_chain_set`,
  `clip_v3_program_set`; web/clip-v3/clip-v3.js v0.3 validates the same.
- app/screen.c: an empty pad on CLIPS is selected; REC and EDIT make a new clip there; page 22 CLIP SETTING (FX on
  CLIPS); the 4th left button saves the song on CLIPS and SCENES; a held empty scene pad stores a scene; COUNT-IN on
  the CLIPS page. app/audio_output.c: the internal click before the master gain. app/transfer.c: remote op 17 and
  op 16 sub 4.
- Tests: tests/host/smoke.c v0.25 section 26 (own lengths in scenes, the hold, a chain, a new clip, the song saved as
  version 3 from a version-3 and from a version-1 record, length, copy, the settings, the MIDI click, the count-in
  and MIDI Start, a stored scene); tests/host/clip_v3_test.c (chain bytes, the setters); clips-sim (an empty pad),
  steps-sim, record-sim (REC on an empty pad, the save), tests/workbench/setup-sim.mjs (the page through the panel).
  Old tests that changed: smoke section 22 (a place row of a v2 block plays the block's 16 steps, not 64) and section
  23 (an edited v2 block is stored with its 32 steps).
- One rule was wrong in the first draft and the old tests caught it: giving a v2 block the steps of its first scene
  everywhere made the tabby-v02.0 reference song play 8 extra notes (the same block sits in rows of different
  lengths). A v2 block in an imported scene keeps the scene's steps.
- Tools: tools/linux/hw/run-15.py v0.13 logs the clock ratio in every timing run (the user's answer 3);
  run-record.py v0.3 (the unquantized error, REC on an empty pad); run-setup.py v0.1; tabby_link.py v0.16.

### 46.2 Measured (the build)

App image 478372 bytes (+7200 from tabby-v04.9.3), margin 41085 below the 519457 limit. Runtime heap 143116 bytes
(-1728: the clip buffers' chain fields, the count-in and click state, the CLIP SETTING page). Build id
`7e376d6bb50aacdb`. docs/FLASH-BUDGET.md 33.

### 46.3 The suite, the release and the device (2026-11-16)

Suite green on 5bce4d9 (overnight/g7/suite-v0410.log), gate ok, tagged, published (root and builds/tabby-v04.10/),
released. Full backup through the tabby-v04.9.3 page, one install attempt: "Firmware ready." after 11.84 s
(overnight/g7/v0410-batch.log). On the device:

| Test | Result |
| --- | --- |
| run-setup.py (CLIP SETTING, new clip, LENGTH, COPY, stored scene, click, count-in) | 21 of 21 after three tool errors, below |
| run-record.py v0.3 | 25 of 25; unquantized playback minus live note -0.15, +0.10, -0.05 ms (mean -0.03; +3 ms before); quantized -0.25, -0.35 ms; a sweep of 61 values recorded as 5 |
| run-steps.py | 18 of 18 |
| run-launch.py | 40 of 40, twice |
| run-clips.py, song 13 | 960 of 960 on DIN and USB, worst 1.22 / 1.38 ms |
| run-15.py v0.13, one line, 960 notes | DIN band 1.89 ms, USB 1.80 ms; clock ratio 0.999600 on both; latest event 1.60 ms after its due time; underruns 0 |
| backup and verify after the tests | PASS, 41 items |

Tool errors (not the device; each checked with a second reading before it was written down):
1. The first run of run-setup.py failed four checks (COPY, the settings, the clicks): I had changed the tool's row
   numbers for tabby-v04.11 while the batch for tabby-v04.10 was still using it. Rerun with the tool as committed
   in 5bce4d9: those checks pass.
2. "MIDI Start one cycle after the first click" and "every click on one grid" failed in the rerun: the tool took the
   cycle from MIDI clock pulses that included the time before PLAY (1994.3 ms; the notes say 1999.2). With the right
   cycle the Start is 3.1 ms late: the song starts with the block after the count-in's last unit, as SPEC 19.13
   says (at most 2.9 ms plus the measuring jitter). tabby-v04.11 makes the count-in end on a block.
3. "The internal click on the audio output" failed: the tool listened on inputs 1 and 2 of the audio interface and
   its capture ended after 0.7 s. A plain arecord of all eight inputs shows the SMK-37 on inputs 3 and 4: a key at
   1020 ms, then clicks at 4410, 4910, 5410, 5900, 6410, 6910, 7400 ms: the four of the count-in and the song's.
   run-setup.py v0.3 does it this way.

## 47. tabby-v04.11: clip chains on the panel; the count-in ends on the beat (2026-11-16)

- app/song.c: `song_edit_chain` (NEXT CLIP, AFTER, TIMES of the open clip; NEXT steps through the places that hold
  a clip); `track_chain[]` in the status; the count-in is shifted so that it ends where a block begins (`count_from`:
  the blocks a count-in takes are a whole number, and what they overshoot is waited before the first click; the
  song's own tempo only). app/screen.c: the three lines on CLIP SETTING (ten lines now), the chain's target under
  the track's column on CLIPS.
- Tests: smoke.c section 26 (the setting's steps, limits and undo), setup-sim.mjs v0.1 with the chain set and played
  through the panel (40 checks); tools/linux/hw/run-chain.py v0.1, run-setup.py v0.3.
- Measured (the build): app image 479236 bytes (+864), margin 40221, heap 143116 (unchanged), build id
  `7b85cd8d3d193809`. docs/FLASH-BUDGET.md 34.

### 47.1 tabby-v04.11 published, not installed: the page could not back up a stored scene (2026-11-16)

Suite green on d5f975f, tagged, published, released. The Full backup before the install (through the tabby-v04.10
page) stood still at "Reading the device... 66 %" and timed out after 15 minutes; by the rule no install was made. A
second run with the page's text printed showed the same. Cause, read from the code and then proven by a test:
web/import/song-format.js `decodeRecord` refused scene flags other than bit 0, and the test song on the device held a
scene stored from the panel (flag bit 1, new in tabby-v04.10). The firmware was right; the page's reader was not
updated with it, and no test read a device-written record with the workbench code. The backups of the tabby-v04.10
batch passed because the song had just been imported again each time.

tabby-v04.11.1: song-format.js v0.8 accepts the flag, keeps it (`own`) and the click bytes 44 to 46 when it writes a
record; setup-sim.mjs decodes and re-encodes the record the simulated device saved (42 checks). Note lines on the
builds pages of tabby-v04.10 and tabby-v04.11 (tools/linux/builds-notes.json). App image 479236 bytes, build id `ea12999a89238727`.
Still open: the page shows no error when a song cannot be read; it should say which song and stop.

### 47.2 tabby-v04.11.1 published, not installed; tabby-v04.11.2 (2026-11-16)

The backup through the tabby-v04.11.1 page stood still again. This time the page's status line was read: "Scene 5 is
invalid". The page has a second reader of song records, `songRecordParse` in sdk/WebUpdate.js, with the same check, and
the Full backup goes through that one. 47.1's diagnosis was half of it: I fixed the reader I found, a test of that
reader passed, and I published without running the fixed page against the device. Hours cost: one suite and one release.

tabby-v04.11.2: sdk/WebUpdate.js accepts scene flag bit 1 in `songRecordParse` and keeps it and the click bytes in
`songRecordBuild`; setup-sim.mjs runs the simulated device's record through both readers (43 checks);
tools/linux/hw/workbench.mjs `backup` watches the page's status line and fails at once with its words instead of
waiting 15 minutes. **Before the suite** the built page was served from this computer and the Full backup run against
the device: "Full backup saved: 1 projects, 10 songs, 30 blocks" (overnight/backups/before-tabby-v04.11.2.json).
Rule taken from this: a change to the page that a device operation depends on is run against the device from a local
copy before it is published. Build id `5132d1244cb66781`, app image 479236 bytes.

### 47.3 tabby-v04.11.2 on the device (2026-11-16)

Suite green on aff1f77, gate ok, published, released. Backup through the new main page: 10 songs, 30 blocks. One
install attempt: "Firmware ready." after 9.44 s (overnight/g7/tabby-v04.11.2-batch.log).

| Test | Result |
| --- | --- |
| run-chain.py v0.2 | 11 of 11; clip 2 starts 0.03 ms from the cycle line; the track stops 8 steps into clip 2 |
| run-setup.py v0.4 | 21 of 21; count-in: MIDI Start 1999.47 ms after the first click (tabby-v04.10: 2002.33); internal click every 500 ms on the audio output |
| run-record.py | 25 of 25 |
| run-steps.py / run-launch.py | 18 of 18 / 40 of 40, twice |
| run-clips.py, song 13 | 960 of 960 on DIN and USB, worst 1.21 / 1.07 ms |
| run-15.py, one line, 960 notes | DIN band 2.04 ms, USB 2.02 ms; clock ratio 0.999556 on both; underruns 0 |
| backup and verify | PASS, 41 items |

- Two tool errors in the first run, both of the kind 46.3 lists: run-chain.py took the cycle from MIDI clock pulses
  (the mistake I had just corrected in run-setup.py and had copied into the new tool before that), and run-setup.py
  set its click threshold from the loudest sound, the song's notes. Both tools corrected and run again on the device:
  11 of 11 and 21 of 21.
- **The one-line band is 2.04 ms on DIN, above the 2 ms it has held since tabby-v04.4** (1.67 to 1.98). The clock
  ratio in this run is 0.999556; the three runs earlier today gave 0.999600. A band is measured against one straight
  line, so a ratio that moves inside a run widens it. This is the effect asked about on 2026-11-16 (one run of 5 ms);
  the ratio is now in every log, and this run and the next ones are the first data. Not called a device fault: the
  notes are all there, in order, the latest 1.6 ms after its due time by the device's own count.
- The internal click's level on the audio output is about an eighth of a note's (1600 against 12400 peak on the
  capture, master volume as left): quiet next to a full song. A question for the user.

## 48. tabby-v04.12: the scene chain on the panel (2026-11-16)

- app/song.c: `song_scene_edit` (TIMES, THEN), the start scene (`reserve_scene`, `song_queue_jump` while stopped,
  `song_play`), `song_scene_reserved`. app/screen.c: K1, K2, K3 and the LEN / THEN / CHAIN line on SCENES, the
  reserved scene. The hold was in the engine since tabby-v04.10. Remote op 17: 28 bytes.
- Tests: smoke.c section 26 (reserve and take back, TIMES and THEN and their limits, the start at the reserved scene,
  a scene's length, a change while the scene plays, the hold, the save); setup-sim.mjs (50 checks, the page through
  the panel); tools/linux/hw/run-scenechain.py v0.1, tabby_link.py v0.17.
- Measured (the build): app image 480420 bytes (+1184), margin 39037, heap 143116, build id `568ffa35e8faa236`.

### 48.1 tabby-v04.12 on the device; which clock moved (2026-11-16)

Suite green on 0bf1c07, gate ok, published, released; full backup, one install attempt: "Firmware ready." after 9.43 s
(overnight/g7/tabby-v04.12-batch.log).

| Test | Result |
| --- | --- |
| run-scenechain.py | 13 of 13 |
| run-chain.py / run-setup.py | 11 of 11 / 21 of 21 |
| run-record.py v0.5 | 25 of 25 (24 of 25 with v0.3 and v0.4: tool errors, below) |
| run-steps.py / run-launch.py | 18 of 18 / 40 of 40, twice |
| run-clips.py, song 13 | 960 of 960 on DIN and USB, worst 1.30 / 1.36 ms |
| run-15.py v0.14, one line, 960 notes, three runs | DIN 1.90, 1.89, 1.86 ms; USB 1.83, 1.93, 1.89 ms; clock ratio 0.999580 in all three |
| backup and verify | PASS, 41 items |

**Which clock moved (the user's question 3 of the last round; answered).** run-15.py v0.13 logged the clock ratio as
asked: 0.999600 (three runs on tabby-v04.10), 0.999556, 0.999699, 0.999670, 0.999648, with bands of 1.89, 2.04, 2.13,
1.95 and 3.76 ms. The band followed the ratio's movement, not the firmware. Then, read from this computer itself:
CLOCK_MONOTONIC ran -25.06 ppm against CLOCK_MONOTONIC_RAW over 20 s; systemd-timesyncd had exchanged time minutes
before, with a server jitter of 91 ms, and changes the rate at every exchange. The kernel stamps the MIDI input with
CLOCK_MONOTONIC. run-15.py v0.14 samples both clocks during a run and maps the stamps to the raw clock before the fit:
three runs in a row give the ratio 0.999580 each and bands of 1.86 to 1.93 ms, while the steered clock ran +3.8, -9.1
and -19.3 ppm against the raw one (0.5 to 2.4 ms over a run). So the "5 ms drift" of tabby-v04.9 and tonight's 3.76 ms
were this computer's time service; the device's rate did not move. The 2.04 ms of 47.3 is withdrawn as a device
figure. The other tools compare times inside a few seconds and are not affected beyond 0.1 ms; run-record.py and
run-chain.py now take the cycle from the song's own notes.

Tool errors on the way (not the device): run-record.py v0.3 used a fixed ratio (a MIDI-in note "6 ms late" 40 s into
the run), v0.4 took the cycle from four seconds of MIDI clock pulses (wrong by 2.6e-4: "+5 ms"); v0.5 takes it from all
the song's notes: +1.62 and +1.80 ms, as on the releases before.

## 49. tabby-v04.13: a clip's program and bank; the controller knobs (2026-11-16)

- app/song.c: `song_edit_program`; a buffer's `prog` word, compared when an edited clip is swapped in at its loop, so a
  changed program or bank is sent again once. app/smk37_controls.c: `smk37_send_controller` (the panel's send path:
  engine, MIDI out, the recorder's panel queue). app/screen.c: three lines on CLIP SETTING (13 lines, 11 pixels apart),
  K1 to K4 on CLIPS with the value on the notice line.
- Tests: smoke.c section 26 (the settings and their limits; bank MSB, LSB and program before the clip's first note in
  its block; one more program change after an edit while it loops), setup-sim.mjs (52 checks),
  tools/linux/hw/run-program.py v0.1.
- Measured (the build): app image 481156 bytes (+736), margin 38301, heap 143084 (-32), build id `9c6c2806e46ffae0`.

### 49.1 tabby-v04.13 on the device (2026-11-16)

Suite green on the release commit, gate ok, published, released; full backup, one install attempt: "Firmware ready."
after 9.58 s (overnight/g7/tabby-v04.13-batch.log). No tool error and no failed check in this batch.

| Test | Result |
| --- | --- |
| run-program.py | 10 of 10 |
| run-chain.py / run-scenechain.py / run-setup.py | 11 of 11 / 13 of 13 / 21 of 21 |
| run-record.py v0.5 / run-steps.py / run-launch.py | 25 of 25 / 18 of 18 / 40 of 40, twice |
| run-clips.py, song 13 | 960 of 960 on DIN and USB, worst 1.14 / 1.19 ms |
| run-15.py v0.14, one line, 960 notes, three runs | DIN 2.05, 1.92, 1.85 ms; USB 1.80, 1.91, 1.79 ms; clock ratio 0.999580 in all three |
| backup and verify | PASS, 41 items |

One DIN run of three is at 2.05 ms; the other five figures are 1.79 to 1.92. During these runs this computer's steered
clock ran -50 to -53 ppm against its raw clock (6.3 to 6.6 ms over a run, taken out by the mapping at four samples a
second). With tabby-v04.12 an hour earlier (steering +4 to -19 ppm) the six figures were 1.83 to 1.93. The spread is
the measurement's; a soak on the raw clock with the time service stopped would settle the last tenth.

## 50. tabby-v04.14: two page fixes, CLICK LEVEL, the controller numbers; the release flow (2026-11-17)

The user's answers of 2026-11-17 (CLICK LEVEL in three steps; click settings stay per song; the controller numbers
settable per song on a second CLIP SETTING page; chains stay on launched tracks; the backup names an unreadable song;
the chain loss fixed with it) and two new rules (SPEC 17.12, 17.13).

### 50.1 What changed

- Page, fix 5: `Library.fullRead` (sdk/WebUpdate.js) catches a song the page's reader refuses and throws
  "STOPPED at song N: this page cannot read it (...)" with what to do; the backup and verify handlers in
  sdk/Update.html.in put it on the backup line (it was only in the library status line; the backup line kept its
  last percentage). Device errors and a lost link pass unchanged. tools/linux/hw/workbench.mjs already watched the
  status line (BUILD 47.2).
- Page, fix 6 (data loss): the importer path (web/import/song-format.js `decodeBlock` / `payloadOf`, used when a song
  is read from the device into the importer and written again) turned a v3 clip back into a v2 block whenever a grid
  could hold it, and built other clips from a model without the chain. Lost: NEXT CLIP, AFTER, TIMES, and a clip's own
  length when it was 64 steps or fewer (a 32-step clip came back as 64). Now: only a clip of exactly 64 steps without
  a chain goes back to the grid; every other clip is read with `block.clip`, `block.steps` and `block.chain` and
  written as the same bytes. web/clip-v3/clip-v3.js v0.4 `model()` / `build()` carry the chain. The page's song editor
  and the Full backup were never affected: sdk/WebUpdate.js keeps a v3 clip byte for byte.
- Firmware: `SONG_SET_CLICK_LEVEL` (record header byte 44 bits 6-7) and `SONG_SET_KNOB1..4` (bytes 56 to 59) in
  app/song.c `song_setting` / `song_setting_edit`; `song_click_mix` scales by `2000 << level`; app/screen.c: CLIP SETTING
  in two pages (the clip's 8 lines, the song's 10), K1 to K4 on CLIPS read the song's numbers; remote op 17 returns 33
  bytes. Both page readers keep the new bytes (byte 44 was masked to 6 bits before).
- Tests: smoke.c section 26 (five new checks); tests/workbench/setup-sim.mjs v0.2 (66 checks: the second page through
  the panel, the saved record through both page readers and back byte for byte, every clip the device made through
  the importer and back byte for byte, the backup's stop message, a lost link not mistaken for an unreadable song);
  tests/linux/device-gate-test.py (14 checks). Device: run-setup.py v0.6 (the click measured at the three levels on
  the audio output; K1's controller number set and seen on MIDI out), tabby_link.py v0.18.

### 50.2 The release flow (SPEC 17.13) as built

- tools/linux/device-gate.py: `mark` (only from rc-validate.py, only when every required step passed, HEAD carries
  the candidate's tag and the device reported this build id), `check` (publish, release-assets, promote).
- tools/linux/hw/rc-validate.py: page live with this build, backup before, one install from the candidate's page,
  the device's build id, the test song, run-program, run-chain, run-scenechain, run-setup, run-record, run-steps,
  run-launch twice, run-clips on the timing song, run-15 one line three times (limit 2.5 ms per run; the bands are
  reported), then full backup, restore and verify through the candidate's page. Stops all device writes at a failed
  backup, install or restore.
- tools/linux/publish-pages.py v0.7: `--rc N` publishes builds/<tag>-rc<N>/ only; any other tagged publish needs the
  device gate for this commit and this firmware build id; nothing is committed without TABBY_RELEASE_SESSION=1.
- tools/linux/builds-index.py v0.3: a candidate's page gets the red note line before `<main>` (candidate; released
  as <tag>; or the tracked note of a failed candidate). Candidates published before 2026-11-17 are not touched.
- Makefile v0.30: `make rc` (builds the package with the release's source link and with the candidate's and refuses
  if the firmware package differs), `make promote`, `make device-gate`; release-assets needs the device gate.
- tools/linux/release-flow.sh: the sequence, unattended.

### 50.3 tabby-v04.14 on the device: the first release through the flow (2026-11-17)

`tools/linux/release-flow.sh tabby-v04.14 1`: suite green on 4eac442, candidate published at
builds/tabby-v04.14-rc1/ (build `781bd68d03f176ca`), every step of rc-validate.py passed at the first attempt,
then promoted (main page, builds/tabby-v04.14/, GitHub release). Logs: overnight/g8/.

| Step | Result |
| --- | --- |
| backup before (main page, tabby-v04.13) | 1 project, 10 songs, 28 blocks |
| install from the candidate's page | Firmware ready, 12 s; the device reports build 781bd68d03f176ca |
| run-program / run-chain / run-scenechain | 10 of 10 / 11 of 11 / 13 of 13 |
| run-setup v0.6 | 24 of 24; click peaks LOW 3154, MID 6161, HIGH 12795 (x1.95, x2.08); K1 on CLIPS sent controller 7 after the setting |
| run-record / run-steps / run-launch twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.25 and 1.13 ms |
| run-15, one line, three runs | DIN 1.75, 1.73, 1.78 ms; USB 1.63, 1.72, 1.77 ms; clock ratio 0.999583 to 0.999584 |
| full backup, restore, verify (candidate's page) | Verify PASS, 41 items, after the restore and again |

Flash margin 37885 bytes, free RAM 143052 bytes. After the promotion the candidate's page says "it passed the device
tests and was released as tabby-v04.14". No tool error and no device fault in this run.

### 50.4 Stickers and the manual (2026-11-17; documents only, published with the next release)

- docs/STICKERS.md, docs/stickers/ (PDF, HTML, measurements.json), tools/linux/stickers.py: four stickers with the
  Classic Tabby names under the buttons, the knobs' functions per page and the fader tracks. Measured from the top-view
  drawing in M-VAVE's manual (no photographs of the device exist on this computer), scaled by the published width;
  what could not be measured is listed in STICKERS.md 4. The drawing also shows the printed button words (SPEC 17.4).
- docs/TESTING-GUIDE.md v3.2: sections 1 and 2.1 rewritten for clips and scenes; section 4 in one order without the
  duplicate numbers (the project and housekeeping sections are 4.15 to 4.18; the clip sections keep 4.8 to 4.14);
  2.2 in release order. Help: chapters 01, 03, 12 and 20 brought up to tabby-v04.14.

## 51. tabby-v04.15: TRANSPOSE per clip, DELETE CLIP (2026-11-17)

The first release from the parity list (docs/MC707-PARITY.md 0.2, written in the same change): the two items with
the highest value for a live set that were cheap, a clip's transpose and deleting a clip.

- app/clip_v3.c v0.5: header byte 12 (validate, `clip_v3_transpose`, `_set`, `_apply`); `clip_v3_to_v2` refuses a
  transposed clip. app/song.c: `decode_track` applies it to the copy it plays; `song_edit_transpose`,
  `song_clip_delete`, `song_clip_scene`. app/screen.c: the two lines, the two-press question, op 17 byte 33.
- Page: clip-v3.js v0.5, song-format.js v0.10.
- Tests: clip_v3_test.c (the byte's range, apply with the retrigger bit and the clamp; the fuzz rule about the two
  grid conversions holds for clips without a chain or a transpose); setup-sim.mjs v0.3 (76 checks: TRANSPOSE through
  the panel and heard, its limits, DELETE CLIP asking, the two-second window, a clip a scene uses, the saved song
  without the copy, a transposed clip through the workbench). Device: run-setup.py v0.7, tabby_link.py v0.19.
- A test-tool slip while writing setup-sim: FX reopens CLIP SETTING on line 1, so presses meant for DELETE CLIP
  saved the song instead; found from the simulator's state, not on the device.

### 51.1 tabby-v04.15-rc1 on the device: not promoted; a tool error (2026-11-17)

The first candidate that the device gate held back. Suite green on 980c89f; builds/tabby-v04.15-rc1/ (build
`8b5a73f6a2d9ee40`) installed in 10 s; every step passed except `setup`: run-setup.py v0.7, 25 of 29 (TRANSPOSE back to
0, DELETE CLIP, the internal click, CLICK LEVEL). Nothing was promoted and no marker was written.

The cause was the tool, the same slip as in setup-sim.mjs (section 51): FX opens CLIP SETTING on its first line, and
the tool went to CLIPS and back before it turned K1 and pressed the 4th left button. It turned LENGTH instead of
TRANSPOSE, never reached DELETE CLIP, the copy stayed reserved, and its notes on the audio output hid the click in
the two audio checks. Confirmed with a second run on the same firmware (hard limit 6): run-setup.py v0.8, which
returns to the line after each reopening, 29 of 29 (click peaks LOW 3187, MID 6058, HIGH 12625). The other steps of
rc1: program 10 of 10, chains 11 of 11, scene chain 13 of 13, recording 25 of 25, STEP 18 of 18, CLIPS 40 of 40
twice, the timing song 960 of 960, one line DIN 1.80, 1.56, 1.77 ms and USB 1.66, 1.61, 1.61 ms, backup, restore and
verify PASS.

rc1's page keeps its banner with a note (tools/linux/builds-notes.json). rc-validate.py v0.2 accepts "already
installed" in the install step, because candidate 2 is the same firmware build (only a test tool changed) and one
install attempt per build has been used.

### 51.2 tabby-v04.15-rc2: not promoted either; three more tool errors, and 51.1 corrected (2026-11-17)

Candidate 2 (the same firmware build, nothing written at the install step) failed `program` (8 of 10) and `setup`
(26 of 29). Nothing was promoted. Every failure was traced on the device before anything was changed, and each was the
tools':

1. run-setup.py, the internal click and CLICK LEVEL (the failure 51.1 explained wrongly). The step added for
   tabby-v04.15 ("a clip a scene uses is not deleted") leaves clip 1 selected, so the takes of the click checks ran on
   clip 1. Clip 1 belongs to scenes 1 and 2 only: its track follows the scenes, and when the song reaches scene 3 the
   track leaves the clip and the take ends, as designed. The tool's next REC press, meant to stop the take, armed a
   new one; the capture's REC press then disarmed it, PLAY started the song without a count-in, and the song's notes
   hid the click. Shown by reading the take state every 0.9 s: recording until 6.0 s after PLAY, then off, with pad 2
   playing. Before tabby-v04.15 the selected clip at that point was the copy, which no scene uses. This also failed
   rc1; the "copy stayed reserved" of 51.1 was a guess that the first rerun seemed to confirm. Why that rerun and two
   others passed is not established: in them the song must have stayed on scenes 1 and 2 for the seven seconds of
   the take (a scene hold left on by an earlier test would do that; not checked). v0.9 selects the clip
   the test made itself.
2. run-setup.py, K1 CONTROLLER, and run-program.py, "value 64 + 6": both assumed the knob values of a fresh start.
   Candidate 2 was not installed (the build was on the device), so K1 still had its value from earlier runs (at 127
   a turn up sends nothing). run-setup.py v0.9 turns down first; run-program.py v0.2 sets 64 first.
3. run-program.py, "twelve clicks ... thinned": the tool's clicks were about one 1/32 note apart, where 7 to 9
   events are all correct; its limit was 8 and this run gave 9. v0.2 sends them 20 ms apart: 6 and 7 events in two
   runs.

Two wrong tracks on the way, both ruled out with a second reader before they were written down as faults: that the
workbench's song rewrite left a stale clip in memory (the clip read back from storage through remote op 16 / 17 had
no chain, and no clip was open), and that a chain fired (the track's move to clip 2 at 6.0 s was the scene change).

After the fixes, in the batch's order on the device: run-program.py 10 of 10 (twice), run-chain.py 11 of 11,
run-setup.py 29 of 29.

Seen on the way, behaviour not fault: when a take has ended by itself, REC arms a new take, and a take that is armed
when the song stops stays armed (the REC lamp shows it). Question for the user in the report.

### 51.3 tabby-v04.15 released: candidate 3 (2026-11-17)

Suite green on 9554ede; builds/tabby-v04.15-rc3/ (build `8b5a73f6a2d9ee40`, on the device since candidate 1: the
install step wrote nothing); every step passed; promoted.

| Step | Result |
| --- | --- |
| run-program v0.2 / run-chain / run-scenechain | 10 of 10 / 11 of 11 / 13 of 13 |
| run-setup v0.9 | 29 of 29 (TRANSPOSE +3 heard on MIDI out; DELETE CLIP asks, deletes the copy, refuses a clip a scene uses) |
| run-record / run-steps / run-launch twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.14 and 1.08 ms |
| run-15, one line, three runs | DIN 1.83, 1.83, 1.65 ms; USB 1.67, 1.79, 1.65 ms; clock ratio 0.999583 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

Flash margin 36925 bytes, free RAM 143020 bytes. The candidates' pages: rc1 and rc2 carry their notes, rc3 says it
was released.

## 52. tabby-v04.16: a scene deleted and moved; a stop takes an armed take off; the manual as a PDF (2026-11-17)

The user's answers of the evening of 2026-11-17 (SPEC 17.15): the parity order stands, 15 KB of flash stay free,
no TRANSPOSE lockout on drum tracks, the manual as one PDF with the next release, a stop takes an armed take off,
the stickers as they are. Answers 1 and 2 pointed to a photograph of the panel.

### 52.1 The photograph was not there

`~/Documents/Classic Tabby/panel.jpg` did not exist on the NUC (2026-11-17, evening). Searched: that folder, the
home directory for any file named panel*, and for any image changed in the last ten hours. The only hits were
`docs/panel.jpg` in worktrees of the other project (the FM-1's panel; looked at, not an SMK-37). So: the printed
labels and the pad rows are still unconfirmed, "4th left button" is not renamed, and the sticker positions are not
checked against a unit. docs/STICKERS.md v0.2 gives every dimension in inches as fractions to 1/32 (the part of
the request that needed no photograph) and says in 3.1 what waits for it.

### 52.2 What changed

| Part | Change |
| --- | --- |
| app/song.c | `song_scene_delete`, `song_scene_move` (stopped only; row events and the loop row follow; the grid-block length rule, SPEC 19.19); `rec.armed_playing`, `song_record_disarmed`: a take armed while the song played is taken off when the song stops |
| app/screen.c | SCENES: FX twice deletes the selected scene, EDIT held + K1 moves it; the bottom line while stopped; SONG STOPPED - REC OFF |
| tests | tests/host/smoke.c v0.26 (19 checks: move, delete, events, loop row, the last scene, save and load, the grid rule, the disarm); setup-sim.mjs v0.4 (11 checks through the panel); record-sim.mjs v0.2 (4 checks through the panel) |
| tools/linux/hw/run-sceneedit.py | the device test (16 checks); step `sceneedit` of rc-validate.py v0.3. Run once against tabby-v04.15 before the release to prove its mechanics: the checks of the new behaviour failed there as they must (FX opened EFFECTS; the armed take stayed armed after the stop: 1), the others passed |
| tools/linux/manual-pdf.py, guide-html.py v1.1, publish-pages.py v0.8, guide.mjs | the printable manual: docs/manual/classic-tabby-manual.pdf (46 pages, US Letter), published at guide/classic-tabby-manual.pdf; a PDF that was not made from the guide text fails the suite and is refused by the publish script |
| tools/linux/stickers.py v0.2, docs/STICKERS.md v0.2 | inches as fractions to 1/32 everywhere; column centres inside each sticker |
| docs | SPEC v0.54 (17.15, 19.19), CONTROL-MAP v0.11 (5, 10, 11, 13.2), TESTING-GUIDE v3.4 (4.10, 4.11, T85, T86), Help chapters 00 and 05, MC707-PARITY v0.3, FLASH-BUDGET v0.39 |

A mistake of mine on the way, with no effect on the repository: I wrote the new device test over the existing
tools/linux/hw/run-scenes.py (the master-cycle test of Task 17 Goal 3). Seen in `git status` before any commit; the
file was restored from HEAD and the new test is run-sceneedit.py.

Deleting a scene has no undo: a song change is saved by the 4th left button, ten seconds after the change while
stopped, and when another song is chosen (song_load saves the song being left). The guide, Help and the control
map say so; the delete asks twice.

Measured: app image 484324 bytes (+1792), margin 35133, heap 143020 (unchanged). Build `ed9182d3a3d67ec9`.

### 52.3 tabby-v04.16 released: candidate 1 (2026-11-17)

Suite green on 5175ef0; builds/tabby-v04.16-rc1/ (build `ed9182d3a3d67ec9`), installed in 9 s; every step passed at
the first attempt; promoted.

| Step | Result |
| --- | --- |
| run-program / run-chain / run-scenechain | 10 of 10 / 11 of 11 / 13 of 13 |
| run-sceneedit v0.1 | 16 of 16 |
| run-setup / run-record / run-steps / run-launch twice | 29 of 29 / 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.41 and 1.29 ms |
| run-15, one line, three runs | DIN 1.85, 1.90, 1.81 ms; USB 1.89, 1.81, 1.84 ms; clock ratio 0.99958 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

Flash margin 35133 bytes, free RAM 143020 bytes.

## 53. tabby-v04.17: SHUFFLE and PLAY QUANTIZE per clip; CLIP SETTING in three pages (2026-11-17)

Parity list items 2 and 6 (SPEC 19.20). Built while tabby-v04.16's candidate was on the device: the quantize code
was written and tested in a copy outside the worktree (the flow needs a clean tree) and brought in afterwards.

| Part | Change |
| --- | --- |
| app/clip_v3.c, .h v0.6 | header byte 13 (shuffle) and 15 (play quantize): validate, `clip_v3_shuffle`, `clip_v3_quantize`, `_set`, `clip_v3_quantize_apply` |
| app/song.c | `decode_track`: the clip's own shuffle replaces the song's swing for its buffer; the quantize is applied to the copy that plays; `song_edit_feel` |
| app/screen.c | lines SHUFFLE and PLAY QUANTIZE after TRANSPOSE; three pages; op 17 replies 36 bytes |
| web/clip-v3/clip-v3.js v0.6, web/import/song-format.js v0.11 | both readers keep bytes 13 and 15 |
| tests | clip_v3_test.c (9 checks, 4000 random clips valid before and after the quantize); smoke.c v0.27 (15 checks: 71 on the off-beat step 43 blocks after 60 as recorded, 64 with SHUFFLE 50; the late note 190, 199, and 172 blocks with PLAY QUANTIZE 1/16); setup-sim.mjs v0.5 (95 checks) |
| tools/linux/hw/run-setup.py v0.10 | SHUFFLE and PLAY QUANTIZE heard on MIDI out: a second note 150 units late on step 2 of the copy; expected 164.1 ms after the first as recorded, 207.0 ms with SHUFFLE 50, 125.0 ms with PLAY QUANTIZE 1/16. DELETE CLIP and the song's lines are found from the number of lines |

Before the candidate, on the device with tabby-v04.16: run-setup.py v0.10 passed 29 of 29 (the new section is
skipped on firmware that does not report a shuffle), and a scratch copy with the section forced measured the
second note 164.13 ms after the first, three times within 0.3 ms: the measuring works; the two checks of the new
behaviour failed there, as they must.

Measured: app image 485188 bytes (+864), margin 34269, heap 143020 (unchanged). Build `748004a45cce48bd`.

### 53.1 tabby-v04.17 released: candidate 1 (2026-11-17)

Suite green on a337868; builds/tabby-v04.17-rc1/ (build `748004a45cce48bd`), installed in 9 s; every step passed at
the first attempt; promoted.

| Step | Result |
| --- | --- |
| run-setup v0.10 | 34 of 34; the second note 163.93 ms after the first as recorded, 206.70 ms with SHUFFLE 50, 125.96 ms with PLAY QUANTIZE 1/16 (calculated 164.1, 207.0, 125.0) |
| run-program / run-chain / run-scenechain / run-sceneedit | 10 of 10 / 11 of 11 / 13 of 13 / 16 of 16 |
| run-record / run-steps / run-launch twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.18 and 1.09 ms |
| run-15, one line, three runs | DIN 1.75, 1.81, 1.82 ms; USB 1.72, 1.72, 1.87 ms; clock ratio 0.999583 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

Flash margin 34269 bytes, free RAM 143020 bytes.

## 54. tabby-v04.18: every button by its printed word; the photograph of the unit; the stickers (2026-11-17)

The user's photograph (~/Documents/Classic Tabby/panel.jpg, 2016 x 1512) arrived while tabby-v04.17's candidate was
on the device. The work was done on copies outside the worktree and brought in after the flow had ended.

### 54.1 What the photograph says

- The printed words: as the user read them and as M-VAVE's drawing shows (SPEC 17.4). The pads carry no numbers.
- Measuring (ffmpeg to raw pixels, numpy / scipy): case 56..1957 px wide at the panel = 105.4 px per inch with the
  published 458 mm; the tape (on the desk, further from the camera) 99.3 px per inch, 6 % fewer; depth 740 px = 7.02
  inch against 7.13 published. Pad rims found as bright regions: left edges 4.54 to 12.14 inch, 0.85 x 0.68 inch.
  Left to right the drawing was right within 1/16 inch.
- What the drawing did not show: the transport symbols under the lower pads (2.94 to 3.05 inch from the back edge)
  and the function strip above the keys (3.40 to 3.74). My stickers A, B and C of docs/STICKERS.md v0.1 and v0.2
  (3 1/8 to 3 23/32) lay across the whole strip. That was an error of the first sheet: I had called the band free
  from a line drawing. v0.3: 7/32 high in the 11/32 gap between symbols and strip.

### 54.2 The rename

Scripted, on the files as they were at 235e148: a map of the screen messages (below) applied first to every
document, then rules per word (SHIFT, the phrases for the 4th left button, HOME / SRC, PAD / STEP, OCT, SCL, ENV,
EDIT, MIX, PLAY, REC, HOME, with the exceptions SPEC 17.4 lists), then the name tables and the "how to read"
texts by hand. Changed: app/screen.c (61 string literals), sdk/Update.html.in (142 lines), docs/TESTING-GUIDE.md
(205), docs/CONTROL-MAP.md (125), sdk/Simulator.js (the panel's button labels and tips), README.md,
docs/MIDI-GUIDE.template.md. After it no old name is left in those files outside the tables that explain them.
The firmware's code, the remote protocol and the device tools keep their names, so no test tool changed.

| Screen text before | From tabby-v04.18 |
| --- | --- |
| `SET ON HOME K4` | `SET ON OVERVIEW K4` |
| `SHIFT+SEQ: MIDI TRACK` | `KNOB BANK+SEQ: MIDI TRACK` |
| `4TH LEFT BTN: WRITE PROJECT` | `>: WRITE PROJECT` |
| `4TH LEFT BTN CONFIRM  HOME CANCEL` | `> CONFIRM  PATCH CANCEL` |
| `HOME CANCEL  EDIT SOUND` | `PATCH CANCEL  PARA SOUND` |
| `PLAY LOAD+RUN  4TH LEFT BTN SAVE` | `SEQ PLAY LOAD+RUN  > SAVE` |
| `HOME BACK  HOME+4TH LEFT BTN UNDO` | `PATCH BACK  PATCH+> UNDO` |
| `K2 ENABLE TRACK   HOME BACK` | `K2 ENABLE TRACK   PATCH BACK` |
| `4TH LEFT BTN APPLY  HOME BACK` | `> APPLY  PATCH BACK` |
| `K1/K5 ACTION  4TH LEFT BTN DOES IT` | `K1/K5 ACTION  > DOES IT` |
| `STOPPED - PLAY STARTS THE SONG` | `STOPPED - SEQ PLAY STARTS THE SONG` |
| `STOPPED - PLAY STARTS` | `STOPPED - SEQ PLAY STARTS` |
| `PADS RECALL SCENE  OCT BANK  K5 SONG` | `PADS: SCENE  OCTAVE-/+: BANK  K5: SONG` |
| `SCL CLIPS  ENV TRACK TO SCENES` | `SCALE CLIPS  CHORD TRACK TO SCENES` |
| `FX X2 DELETE  EDIT+K1 MOVE` | `FX X2 DELETE  PARA+K1 MOVE` |
| `OCT BANK` | `OCTAVE-/+ BANK` |
| `EMPTY: REC OR EDIT` | `EMPTY: SEQ REC OR PARA` |
| `ENV TRACK TO SCENES  SHIFT+ENV ALL` | `CHORD: TO SCENES  KNOB BANK+CHORD: ALL` |
| `SCL SCENES  K5 TRACK  K1-K4 CC` | `SCALE SCENES  K5 TRACK  K1-K4 CC` |
| `4TH LEFT BTN TWICE DELETES` | `> TWICE DELETES` |
| `4TH LEFT BTN TWICE` | `> TWICE` |
| `4TH LEFT BTN COPIES THE CLIP` | `> COPIES THE CLIP` |
| `4TH LEFT BTN SAVES (STOPPED)` | `> SAVES (STOPPED)` |
| `FX BACK TO CLIPS  PLAY START/STOP` | `FX BACK TO CLIPS  SEQ PLAY START/STOP` |
| `ENV CLEAR STEP  FX UNDO  SCL PAD MODE` | `CHORD CLEAR  FX UNDO  SCALE PAD MODE` |
| `4TH LEFT BTN SAVE  EDIT BACK  OCT BAR` | `> SAVE  PARA BACK  OCTAVE-/+ BAR` |
| `ARP BOTH - SHIFT+SEQ: OUT PORT` | `ARP BOTH - KNOB BANK+SEQ: OUT PORT` |
| `TRACK OFF - SHIFT+HOME K2 TO ENABLE` | `TRACK OFF - KNOB BANK+PATCH, K2 ON` |
| `TRACK MUTED - MIX / PAD TO UNMUTE` | `TRACK MUTED - GLOBE / PAD TO UNMUTE` |
| `OTHER TRACK SOLO - MIX TO CHECK` | `OTHER TRACK SOLO - GLOBE TO CHECK` |
| `TRACK LEVEL 0 - USE MIX / FADER` | `TRACK LEVEL 0 - USE GLOBE / FADER` |
| `KEY/PAD SAME CH - SHIFT+SEQ TO SET` | `KEY/PAD SAME CH - KNOB BANK+SEQ SETS` |
| `EDIT BACK  K5 TRACK` | `PARA BACK  K5 TRACK` |
| `ARP ON/OFF   HOME BACK` | `ARP ON/OFF   PATCH BACK` |
| `SEQ+EDIT: ACTIONS` | `SEQ+PARA: ACTIONS` |
| `K7 SOURCE  EDIT PARAMETERS` | `K7 SOURCE  PARA: PARAMETERS` |
| `K7 KEY OUT  SHIFT+SEQ MIDI TRACK` | `K7 KEY OUT  KNOB BANK+SEQ MIDI TRACK` |
| `SEQ: SYNC / MIDI  HOME BACK` | `SEQ: SYNC / MIDI  PATCH BACK` |
| `PADS MUTE/SOLO  MIX / HOME BACK` | `PADS MUTE/SOLO  GLOBE / PATCH BACK` |
| `K5 TRACK  HOME TRACKS` | `K5 TRACK  PATCH TRACKS` |
| `SHIFT SHORTCUTS` | `KNOB BANK SHORTCUTS` |
| `HOME/SRC SOURCE  SEQ MIDI` | `PATCH SOURCE  SEQ MIDI` |
| `PAD/STEP KEY-PAD  RELEASE TO RETURN` | `NOTE REPEAT KEY-PAD  RELEASE: RETURN` |
| `PRESET LOADED - PLAY TO START` | `PRESET LOADED - SEQ PLAY TO START` |
| `TAP AGAIN / HOME+SEQ` | `TAP AGAIN / PATCH+SEQ` |
| `HOLD EDIT, TURN K1: MOVE THE SCENE` | `HOLD PARA, TURN K1: MOVE THE SCENE` |
| `REC ARMED - PLAY STARTS IT` | `REC ARMED - SEQ PLAY STARTS IT` |
| `REC: ON THE CLIPS OR STEP PAGE` | `SEQ REC: ON THE CLIPS OR STEP PAGE` |
| `TAKEN BACK - PLAY STARTS AT SCENE 1` | `TAKEN BACK - SEQ PLAY STARTS: SCENE 1` |
| `RESERVED - PLAY STARTS AT THIS SCENE` | `RESERVED - SEQ PLAY STARTS HERE` |
| `PLAY FIRST` | `SEQ PLAY FIRST` |
| `EMPTY PAD - REC OR EDIT MAKES A CLIP` | `EMPTY PAD - SEQ REC OR PARA: NEW CLIP` |
| `RESERVED - PLAY STARTS IT` | `RESERVED - SEQ PLAY STARTS IT` |
| `PAD STEPS - SHIFT+PAD TO PLAY` | `PAD STEPS - KNOB BANK+PAD TO PLAY` |
| `PAD PLAY - SHIFT+PAD TO EDIT STEPS` | `PAD PLAY - KNOB BANK+PAD: EDIT STEPS` |
| `PAD READY - EDIT / FX` | `PAD READY - PARA / FX` |
| `KEY READY - EDIT / FX` | `KEY READY - PARA / FX` |
| `EDIT BACK` | `PARA BACK` |

Measured: app image 485188 bytes (unchanged), margin 34269, heap 143020. Build `1046c8ec5c0c7c0a`.

### 54.3 tabby-v04.18-rc1: not promoted; one timing check 0.21 ms over a limit of the test tool (2026-11-17)

Suite green on e0c4a18; builds/tabby-v04.18-rc1/ (build `1046c8ec5c0c7c0a`), installed in 11 s. 19 of 20 steps
passed. The first run of run-launch.py failed one check of 40: "launch 2: ... the clip's first note on the next
master cycle": the note came on the right cycle (10), 4.21 ms after it; the tool allowed 4.0. The second run of
the same tool passed 40 of 40 (2.74 ms and its neighbours).

Is it the device or the tool? Looked at before changing anything:

- The same check in every candidate log so far (tabby-v04.14 to v04.18, seven candidate runs, 70 launches): 2.31 to 4.21 ms after the
  cycle, mean 2.95. The cycle is counted from the MIDI Start message, and a note leaves one audio block (2.90 ms)
  after its time by design (the F + G timing of tabby-v04.4). So the expected value is 2.90 ms and the measurements
  lie from 0.59 ms before it to 1.31 ms after it: a spread of 1.90 ms, which is the one-line band the timing runs
  measure (1.65 to 2.05 ms in the releases since tabby-v04.13; DIN 1.94, 1.85, 1.81 ms in this candidate).
- A second, independent reading of this candidate's timing: run-clips (960 notes against the file's times): worst
  1.06 ms on DIN and 1.09 on USB; run-15, three runs: 1.94 ms at most. Nothing is late beyond the band.
- The firmware of tabby-v04.18 differs from tabby-v04.17 in text only (the image has the same size).

So this is not a device fault: the tool judged the note against "0 to 4.0 ms after the cycle", a window that is
not centred on the expected 2.90 ms; its upper edge was 1.1 ms above the mean and the band reaches 1.3 ms. One
failure in 70 was to be expected. run-launch.py v0.6 judges the note against cycle + 2.90 ms within 2.0 ms either
way (0.90 to 4.90 ms): tighter than before on the early side, 0.9 ms wider on the late side. All 70 measurements
pass it. The candidate's page stays with its note; the same build goes out as candidate 2.

### 54.4 tabby-v04.18 released: candidate 2 (2026-11-17)

Suite green on 0d288c3; builds/tabby-v04.18-rc2/ (build `1046c8ec5c0c7c0a`, on the device since candidate 1: the
install step wrote nothing); every step passed; promoted.

| Step | Result |
| --- | --- |
| run-launch v0.6, twice | 40 of 40 and 40 of 40; the ten launches 2.60 to 3.48 ms after the cycle |
| run-program / run-chain / run-scenechain / run-sceneedit / run-setup | 10 of 10 / 11 of 11 / 13 of 13 / 16 of 16 / 34 of 34 |
| run-record / run-steps | 25 of 25 / 18 of 18 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.16 ms on DIN |
| run-15, one line, three runs | DIN 1.73, 1.71, 1.79 ms; USB 1.68, 1.71, 1.74 ms; clock ratio 0.999583 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

Flash margin 34269 bytes, free RAM 143020 bytes.

## 55. tabby-v04.19: STEP SIZE per clip (2026-11-17)

Parity list item 3, the MC-707's SCALE (SPEC 19.22). The clip library part was written and tested in a copy outside
the worktree while earlier candidates were on the device.

| Part | Change |
| --- | --- |
| app/clip_v3.c, .h v0.7 | header byte 14: `clip_v3_scale`, `_scale_steps`, `_scale_set`, `_scale_apply`, `_scale_back`; `reorder` shared with the quantize |
| app/song.c | `decode_track` applies the step size before the quantize and the transpose; `trackbuf.scale`; `rec_clip_time`, a recorded note's length and `play_step` in the clip's own steps; `song_edit_scale` |
| app/screen.c | the line STEP SIZE (23 lines); op 17 replies 37 bytes |
| web | clip-v3.js v0.7, song-format.js v0.12 keep byte 14 |
| tests | clip_v3_test.c (10 checks; random clips valid before and after); smoke.c v0.28 (14 checks: at 1/8 the note two steps in comes after 172 blocks and the clip loops after 1378; at 1/32 43 and 344; 12 steps at 1/16T 57 and 344; the play cursor on the clip's step 3 at 4.2 sixteenths; a key played at the 9th sixteenth for two sixteenths is recorded on the clip's step 5, one step long); setup-sim.mjs v0.6 (101 checks) |
| tools/linux/hw/run-setup.py v0.11 | STEP SIZE 1/8 heard on MIDI out: the second note of the copy 328.1 ms after the first (164.1 at 1/16) |

A mistake in my first version of the smoke test, not in the engine: it assumed the test clip was 16 steps long; an
earlier part of the same test section had left it at 32. Found by printing what the test heard; the test now sets
the length itself.

Before the candidate, on the device with tabby-v04.18: run-setup.py v0.11 passed 34 of 34 (the new section is
skipped on firmware that reports no step size).

Measured: app image 486404 bytes (+1216), margin 33053, heap 143020 (unchanged). Build `60dd42e69b99e957`.

### 55.1 tabby-v04.19 released: candidate 1 (2026-11-17)

Suite green on 6dbba88; builds/tabby-v04.19-rc1/ (build `60dd42e69b99e957`), installed in 11 s; every step passed at
the first attempt; promoted.

| Step | Result |
| --- | --- |
| run-setup v0.11 | 36 of 36; the second note 164.00 ms after the first at 1/16, 328.04 ms at STEP SIZE 1/8 (calculated 164.1, 328.1); SHUFFLE 50: 207.02 ms; PLAY QUANTIZE 1/16: 125.92 ms |
| run-program / run-chain / run-scenechain / run-sceneedit | 10 of 10 / 11 of 11 / 13 of 13 / 16 of 16 |
| run-record / run-steps / run-launch v0.6 twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.24 ms on DIN |
| run-15, one line, three runs | DIN 1.96, 1.83, 1.81 ms; USB 1.97, 1.76, 1.83 ms; clock ratio 0.999583 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

Flash margin 33053 bytes, free RAM 143020 bytes. The one-line band of 1.96 and 1.97 ms is the highest since
tabby-v04.13 (2.05); the runs of one candidate differ by up to 0.2 ms, and tabby-v04.18's second candidate measured
1.68 to 1.79 ms with the same engine code, so this is not read as a trend; it is watched.

## 56. tabby-v04.20: DIRECTION per clip (2026-11-18)

Parity list item 5 without the random order (SPEC 19.23).

| Part | Change |
| --- | --- |
| app/clip_v3.c, .h v0.8 | header byte 14, high four bits: `clip_v3_direction`, `_set`, `_apply`, `clip_v3_reverse_time` |
| app/song.c | `decode_track` applies the direction after the step size; `trackbuf.dir`; `played_to_clip` replaces the two separate mappings of tabby-v04.19 (the play cursor, the recorder), now taken from the buffer that plays; `song_edit_direction` |
| app/screen.c | the line DIRECTION (24 lines); op 17 replies 38 bytes |
| web | clip-v3.js v0.8, song-format.js v0.13 keep both fields of byte 14 |
| tests | clip_v3_test.c (9 checks; random clips with a step size, a direction and a quantize valid before and after); smoke.c v0.29 (12 checks: REVERSE: 60 two sixteenths after 71; the play cursor on the clip's step 3 while its note sounds; a key played one sixteenth later recorded on the clip's step 2; FWD THEN REV: 86, 1163, 86, 43 blocks between the four notes); setup-sim.mjs v0.7 (105 checks) |
| tools/linux/hw/run-setup.py v0.12 | DIRECTION REVERSE heard on MIDI out: from the first note of the copy to the second 914.1 ms (164.1 forwards) |

Before the candidate, on the device with tabby-v04.19: run-setup.py v0.12 passed 36 of 36 (the new section is
skipped on firmware that reports no direction).

Measured: app image 487588 bytes (+1184), margin 31869, heap 142764 (-256). Build `693c8946957ae272`.

### 56.1 tabby-v04.20 released: candidate 1 (2026-11-18)

Suite green on e1dab17; builds/tabby-v04.20-rc1/ (build `693c8946957ae272`), installed in 11 s; every step passed at
the first attempt; promoted.

| Step | Result |
| --- | --- |
| run-setup v0.12 | 38 of 38; REVERSE: 913.65 ms from the first note to the second (calculated 914.1); forwards 164.01; STEP SIZE 1/8 327.56; SHUFFLE 50 207.01; PLAY QUANTIZE 1/16 125.95 |
| run-program / run-chain / run-scenechain / run-sceneedit | 10 of 10 / 11 of 11 / 13 of 13 / 16 of 16 |
| run-record / run-steps / run-launch v0.6 twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.13 ms on DIN |
| run-15, one line, three runs | DIN 1.68, 1.79, 1.85 ms; USB 1.68, 1.75, 1.82 ms; clock ratio 0.999583 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

Flash margin 31869 bytes, free RAM 142764 bytes. The one-line band is back at 1.68 to 1.85 ms (55.1 watched it).

## 57. tabby-v04.21: clear notes in a take, NEW SONG, shift a clip; the pad rows; stickers v0.4 (2026-11-18)

The user's answers of 2026-11-18 (SPEC 17.16): work the pad rows out from the sources; stickers with no type below
6 point, covering dead printing on purpose; the three small parity items first; NOTE REPEAT gets its printed meaning
(the next release).

### 57.1 The pad rows

Read: app/board/scan.c (`padmap`: ADC channel to pad id, groups of four), app/board/panel.c (`rgb_map`: pad id to its
place in the LED chain: 0, 15, 14 ... 9, 1 ... 8), both unchanged from the upstream kit (official-release/sources/kit);
the kit's sdk/Simulator.js (the pads are made in id order into an eight-column grid: 1 to 8 on top); M-VAVE's manual
(no pad numbers). The LED chain proves the columns and the order left to right; only the panel model says which row
is the upper one. Written down as an assumption (STICKERS.md 5.1, CONTROL-MAP.md 1.2).

### 57.2 Stickers v0.4

- The strip was measured label by label in the photograph (ffmpeg to grey, the bright runs of rows 768 to 783 and
  789 to 803, 105.4 pixels per inch): 37 labels, `STRIP_LABELS` in tools/linux/stickers.py.
- None of its functions works here: `smk37_control_event` sends every key as a note; app/screen.c reads key bits
  only as pad presses. So A, B, C (and the optional E) cover it: 11/16 high, 3 3/32 to 3 25/32 from the back edge;
  side edges in gaps of the printing (2 7/32 | 2 1/4, 4 3/32 | 4 5/32, 13 1/32 | 13 3/32, 17 9/16).
- tools/linux/stickers.py v0.4 asserts 6 point as the smallest size and reports any sideways squeeze (none).
  A first set of texts needed a squeeze to 72 %; the right-button texts were shortened to three short lines instead.
- My first table of column centres in STICKERS.md was written from memory and was wrong in three places; replaced by
  the generator's values before the commit.

### 57.3 The firmware

| Part | Change |
| --- | --- |
| app/song.c | `rec_clip_pos` (split from `rec_clip_time`); `rec.erase`, `rec.erasing`, `rec_erase`, `song_record_erase`; `song_edit_shift`; `song_new` |
| app/clip_v3.c, .h v0.9 | `clip_v3_shift` |
| app/screen.c | FX during a take; KNOB BANK + OCTAVE-/+ on STEP; ACTIONS entry NEW SONG with its question (nine entries, 17 lines apart); `ct_screen_action_do` |
| app/transfer.c | command 29 {16, 5}; {1, slot} selects an empty slot too |
| tests | clip_v3_test.c (5 checks; 300 random clips shifted and shifted back byte for byte); smoke.c (22 checks); record-sim.mjs v0.3 (70 checks, 26 new) |
| tools/linux/hw | run-takeedit.py v0.1 (new), rc-validate.py v0.4 (the step `takeedit`) |

Found on the way:
- `song_new` first took the project slot as it came; a simulator without a stored project reports a slot above 15
  and the record was refused as invalid. The slot is now limited to 0..15, and "the slot holds a song" has its own
  code (`SONG_NEW_EXISTS`) instead of sharing SONG_INVALID with a failed write.
- A stored time of exactly the clip's length (the tie to the last step) did not survive a shift and back byte for
  byte; `clip_v3_shift` keeps stored times in 1..loop.
- Release builds carry the A2 FAST MIDI entry (A2 is on unless A2=0), so ACTIONS has nine entries, not eight: my first
  guide text said the ninth was only in test builds. The device said otherwise (the entry index); corrected, and the
  page now spaces nine entries 17 lines apart.
- Before the candidate, on the device with tabby-v04.20: run-takeedit.py ran as far as the firmware allows: its
  set-up, take, undo and closing checks passed, the checks of the new behaviour failed, and the first {16, 5} was
  refused with code 71 as expected.

Measured: app image 489188 bytes (+1600), margin 30269, heap 142700 (-64). Build `0bb7c4fb25bc175a`.

### 57.4 tabby-v04.21-rc1: not promoted; my device test pressed the wrong key (2026-11-18)

Suite green on 1d5685d; builds/tabby-v04.21-rc1/ (build `0bb7c4fb25bc175a`), installed in 12 s. 20 of 21 steps passed
(one line DIN 1.73, 1.76, 1.84 ms; USB 1.62, 1.66, 1.58 ms; backup, restore, verify PASS). The new step `takeedit`
failed 3 checks of 25, all in "clear notes during a take": the clip's four notes were still there after FX + the key.

Not a device fault (hard limit 6: confirmed with a second tool before anything was said about the firmware):
run-takeedit.py v0.1 pressed key 12 and took it for pitch 60. That holds at octave 0; the keys of this unit stand at
octave -1, so key 12 plays 48. The clip's notes are 60: nothing was held that could clear them, and the two later
checks failed with it. run-takeedit.py v0.2 reads the pitch a key plays from the STEP page first and presses the key
for 60 (key 24 here). On the same candidate, same install: 26 of 26, among them "FX + the key 60 held: its notes go
as the clip passes them (2 left after 0.9 s)" and "after one pass the clip's four notes are cleared".

The shift and NEW SONG checks passed in both runs. The page builds/tabby-v04.21-rc1/ gets a note line
(tools/linux/builds-notes.json); the same build goes out as candidate 2.

Lesson: a device test takes nothing about the panel's state for granted that it can read (the octave here); the
same rule as the starting state of 54.3.

### 57.5 tabby-v04.21 released: candidate 2 (2026-11-18)

Suite green on acf9be3; builds/tabby-v04.21-rc2/ (build `0bb7c4fb25bc175a`, on the device already: nothing written);
every step passed; promoted.

| Step | Result |
| --- | --- |
| run-takeedit v0.2 | 26 of 26 |
| run-program / run-chain / run-scenechain / run-sceneedit / run-setup | 10 of 10 / 11 of 11 / 13 of 13 / 16 of 16 / 38 of 38 |
| run-record / run-steps / run-launch twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.32 ms on DIN |
| run-15, one line, three runs | DIN 1.91, 1.72, 1.81 ms; USB 1.59, 1.67, 1.74 ms; clock ratio 0.999583 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

Flash margin 30269 bytes, free RAM 142700 bytes.

## 58. tabby-v04.22: NOTE REPEAT repeats; the focus switch on KNOB BANK + NOTE REPEAT (2026-11-18)

The user's answer 4 of 2026-11-18 (SPEC 17.16, 19.25).

| Part | Change |
| --- | --- |
| app/smk37_controls.c | button 7: alone, the arpeggiator of the key track and the pad track on while it is down (`repeat_tracks`, `smk37_note_repeat`); with KNOB BANK, the focus switch as before |
| app/screen.c | `smk37_screen_note_repeat` (the notice with the rate); K1 while NOTE REPEAT is held edits the ARP rate |
| app/board/panel.c | the NOTE REPEAT lamp also while notes repeat |
| app/transfer.c | command 29 {18}: the panel's playing state, 9 bytes |
| texts | the guide (4.1, T7, T94), Help, the workbench panel's hint, README, CONTROL-MAP v0.17 (1.1, 3.1, 4.3, 11), STICKERS v0.5 (sticker C) |
| tests | smoke.c (8 checks: 8 note-ons a second 43 blocks apart; 16 at 1/32; ARP off again; a track with ARP on left alone; the focus with KNOB BANK); record-sim.mjs v0.4 (4 checks through the panel) |
| tools/linux/hw | run-repeat.py v0.1 (new), rc-validate.py v0.5 (the step `repeat`) |

Why the arpeggiator and not a generator of our own: SPEC 19.25. What follows from it (a chord is arpeggiated, the
ARP's GATE / SWING / DIRECTION / RANGE apply, the project counts as changed) is in CONTROL-MAP 3.1 and goes to the
user as a question.

Developed in a scratch clone while the tabby-v04.21 flow held the tree. A first version lengthened the remote status
reply to 16 bytes; eleven host checks pin its 14 bytes, so the new state got its own op instead.

run-repeat.py could not be proven on tabby-v04.21 first (it needs op 18).

Measured: app image 489796 bytes (+608), margin 29661, heap 142700. Build `1726ba6b317b1bb5`.

### 58.1 tabby-v04.22 released: candidate 1 (2026-11-18)

Suite green on 140a13c; builds/tabby-v04.22-rc1/ (build `1726ba6b317b1bb5`), installed in 12 s; every step passed at
the first attempt; promoted.

| Step | Result |
| --- | --- |
| run-repeat v0.1 | 11 of 11; 18 notes in 2.2 s, 124.85 ms apart (worst 2.75 ms from the median); at 1/32 62.74 ms (worst 3.00 ms): the arpeggiator's notes start on audio blocks (2.9 ms) |
| run-takeedit / run-program / run-chain / run-scenechain / run-sceneedit / run-setup | 26 of 26 / 10 of 10 / 11 of 11 / 13 of 13 / 16 of 16 / 38 of 38 |
| run-record / run-steps / run-launch twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.28 ms on DIN |
| run-15, one line, three runs | DIN 1.71, 1.73, 1.79 ms; USB 1.60, 1.68, 1.70 ms; clock ratio 0.999583 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

Flash margin 29661 bytes, free RAM 142700 bytes.

## 59. tabby-v04.23: the step loop while held (2026-11-18)

Parity list item 4, the last of the user's order (SPEC 19.26).

| Part | Change |
| --- | --- |
| app/song.c | `loop_steps`, `loop_scan` (the block's scan window turned back into each track's loop window), two lines in `tick`; `song_step_loop`, `song_step_looping`; `song_stop` ends a loop |
| app/smk37_controls.c | `smk37_note_repeat_down` |
| app/screen.c | CLIPS: NOTE REPEAT + pad 9 to 12 engages (1, 2, 4, 8 steps), no pad launches while NOTE REPEAT is down; the loop ends on any page when its pad is up; the lower pad row's colours while NOTE REPEAT is down |
| tests | smoke.c (7 checks: the window of two steps repeats every 86 blocks, nothing else sounds, afterwards the clip is on its 16-step grid); record-sim.mjs v0.5 (7 checks through the panel) |
| tools/linux/hw | run-repeat.py v0.2 (the step loop on the MIDI out), rc-validate.py v0.6 |

This is the first change to the audio thread's tick since tabby-v04.10. It is small because `scan` is stateless: the
loop only changes which window of the clip one block scans. Not looping, a tick costs one byte compare and one test
per track more. The one-line timing of the candidate run is the check that this costs nothing that matters.

Found on the way: my first simulator check looped nothing, because an earlier part of the same test had left the
screen on a deleted song slot (the song did not play); and it compared the pad colour through the wrong conversion.
Both were errors of the check.

Before the candidate, on the device with tabby-v04.22: run-repeat.py v0.2 passed its 12 note repeat and focus
checks; the 7 step loop checks failed as they must without the loop (the pads launched and stopped clips).

Measured: app image 490436 bytes (+640), margin 29021, heap 142412 (-288). Build `c7b2ff04e81b3226`.

### 59.1 tabby-v04.23-rc1: not promoted; the NUC's clock was being corrected, and one check could not be aimed (2026-11-18)

The first start of the flow ended in the suite: the reference compile under Wine died ("wine client error:0: recvmsg:
Connection reset by peer"); nothing was tagged. Started again: suite green on 4708be1; builds/tabby-v04.23-rc1/ (build
`c7b2ff04e81b3226`), installed in 11 s. 17 of 21 steps passed. Failed:

| Step | Failure |
| --- | --- |
| repeat | 18 of 19: "NOTE REPEAT + pad 9 just after a beat: the last 1 step repeat": one note, then silence |
| setup | 37 of 38: the click band 4.07 ms over 15 clicks |
| steps | 17 of 18: a note entered while the clip loops came 3.26 and 4.39 ms early |
| clips | the timing song: all 960 notes there, worst 9.87 ms on DIN and 9.89 ms on USB, std 2.66 ms, tempo ratio 0.99956 |

The same run: run-15 one line DIN 1.79, 1.76, 1.75 ms, USB 1.70, 1.66, 1.74 ms; record 25 of 25; launch 40 of 40
twice; no underrun, no DMA overrun; backup, restore, verify PASS.

Not device faults (hard limit 6; each confirmed with a second run or tool before saying so):

- **repeat:** my check. From a note heard on the DIN out to the pad arriving on the device takes 125 to 250 ms by
  remote, more than one step: the pad came in the step after the beat, which is empty, and the loop repeated that
  empty step, as it should. The two-step loop of the same run passed (250.05 ms, 249.94 expected) and both times the
  song was back on its beats (within 1.5 ms). run-repeat.py v0.3 accepts the empty step for one step and adds an
  eight-step loop on the bass note, which a late pad cannot miss. On the candidate as installed: 20 of 20 (36 every
  999.6 ms, 999.7 expected; 38 does not come).
- **setup, steps, clips:** the measuring. DIN and USB show the same error to 0.02 ms and a tempo ratio of 0.99956
  where every other run of this device reads 0.99958 to 0.99961: both captures are stamped with the NUC's monotonic
  clock, and that clock is slewed when the time service corrects it. systemd-timesyncd reported a jitter of 142 ms
  and a delay of 134 ms to its server on this day (a correction of a few milliseconds is slewed in over seconds: a
  bend in the time axis in the middle of a two-minute song). The device's own counters saw nothing. run-clips.py on
  the same candidate, twice, straight afterwards (once directly after the repeat test): worst 1.22 and 1.15 ms, std
  0.35 and 0.36 ms, tempo ratio 0.99961. The NUC was also under load from another project's suites (load average 8);
  the rerun under the same load passed, so the load alone was not it.

Not proven beyond that: I did not catch the correction itself in a log. If candidate 2 shows the same pattern the
measuring tools must move to a clock that is not slewed (CLOCK_MONOTONIC_RAW) before another release.

The page builds/tabby-v04.23-rc1/ gets a note line; the same build goes out as candidate 2.

### 59.2 tabby-v04.23 released: candidate 2 (2026-11-18); a correction to 59.1

Suite green on 921f33b; builds/tabby-v04.23-rc2/ (build `c7b2ff04e81b3226`, on the device already: nothing written);
every step passed; promoted.

| Step | Result |
| --- | --- |
| run-repeat v0.3 | 20 of 20; note repeat 124.81 ms apart (worst 3.5 ms from the median; the limit is 4.5), 62.73 ms at 1/32; step loop: two steps 249.98 ms (249.92 expected), eight steps 999.43 ms (999.70 expected); one step: the pad came in an empty step |
| run-takeedit / run-program / run-chain / run-scenechain / run-sceneedit / run-setup | 26 of 26 / 10 of 10 / 11 of 11 / 13 of 13 / 16 of 16 / 38 of 38 |
| run-record / run-steps / run-launch twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.22 ms on DIN; tempo ratio 0.99956 |
| run-15, one line, three runs | DIN 1.90, 1.76, 1.71 ms; USB 1.78, 1.79, 1.73 ms; clock ratio 0.999583 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

Flash margin 29021 bytes, free RAM 142412 bytes.

Correction to 59.1: I gave the tempo ratio of 0.99956 in the failed run as a sign of the NUC's clock. This passing
run reads 0.99956 too, so that figure shows nothing. What is left for "the measuring, not the device": DIN and USB
agreed to 0.02 ms in the failed run; the device's counters saw nothing; the same build has now read 1.22, 1.15 and
1.22 ms in three runs of the same test and passed setup and steps; the time service's jitter of 142 ms that day.
That makes the NUC's clock the likeliest cause. It is not proven, and a fault of the device that shows once in four
runs is not excluded by three good runs. The next step is to stamp the captures with a clock that is not slewed and
to keep every note's error in the result file, so that a failed run shows whether the time axis bent or notes came late.

## 60. The 9.9 ms run of tabby-v04.23-rc1, answered (2026-11-18)

The user's priority 1: time against a clock the computer does not correct, keep every note's error, soak for an hour
with one line and eight lines, A2 on, on several pages; nothing is released before this is answered.

### 60.1 What the clock data says about candidate 1's run

In 59.1 and 59.2 I wrote that I could not prove the NUC's clock was the cause. The record was there and I had not
looked: run-15.py has mapped its times to CLOCK_MONOTONIC_RAW since v0.14 (2026-11-16) and logs what the steered
clock did in every run. Its lines for the three releases of this day:

| Time | Run | The NUC's steered clock against its raw clock |
| --- | --- | --- |
| 09:32 to 09:36 | tabby-v04.21-rc1, three runs | -14.8, -15.8, -16.6 ppm |
| 10:00 to 10:04 | tabby-v04.21-rc2 | +37.8, +30.0, +23.8 ppm |
| 10:37, 10:39 | tabby-v04.22-rc1 | +2.3, +2.2 ppm |
| 10:42 | tabby-v04.22-rc1, third run | **-252.1 ppm (-31.7 ms in the run)** |
| 11:17 | tabby-v04.23-rc1, first run, two minutes after the failed timing song | **-364.7 ppm (-45.8 ms in the run)** |
| 11:19, 11:21 | tabby-v04.23-rc1 | -151.7, -72.5 ppm |
| 11:52 to 11:56 | tabby-v04.23-rc2 | +11.3, +5.6, +1.2 ppm |

So at 11:17 the time service was in the middle of a correction that decays by about half every two minutes; counted
back, it began between 11:13 and 11:15, while run-clips.py measured the timing song (11:13 to 11:15) on the steered
clock. A clock whose rate changes by several hundred ppm in the middle of a 120-second song bends the time axis by
several milliseconds against a straight line: a change of 500 ppm at the middle of the song is 7.5 ms at its ends.
That is the 9.9 ms, the same on DIN and USB (both stamped by the same clock), with all 960 notes present and nothing
on the device's counters. The three runs of run-15.py in that same candidate run, mapped to the raw clock, read 1.75
to 1.79 ms on DIN. The tools that failed (run-clips, run-setup, run-steps) were the ones that did not map.
(The step of 10:42 did no harm because it fell into a run-15 run.)

### 60.2 The tools

| Tool | Change |
| --- | --- |
| tools/linux/hw/tabby_link.py v0.23 | `steady()`: every receive time, from the device's USB port and from the DIN monitor, is mapped to CLOCK_MONOTONIC_RAW (a table of both clocks, sampled ten times a second) plus the offset the clocks had when the tool started; `clock_report()`: the steered clock's rate, how far it parted and its bend over a span. Every device tool uses the link, so every one of them is on the raw clock now. `show_page()`: clips, scenes, mixer |
| run-15.py v0.15 | uses the link's mapping; keeps every note's error per line in the summary (`errors_ms`); names the clock's bend |
| run-clips.py | keeps every note's error (`errors`: time in the song, error) and the clock record in its result file |
| run-soak.py v0.2 (new) | a soak in segments: song after song, page after page; per segment the band of every line, the largest single error, the clock record, the device's counters, stuck notes, the event counts on both ports |

Check of the mapping: run-clips.py on the raw clock reads a tempo ratio of 0.99958, the figure run-15.py has always
given (0.999583); on the steered clock it had read 0.99954 to 0.99961 from run to run.

### 60.3 The soak on tabby-v04.23 (build `c7b2ff04e81b3226`)

70 minutes, 33 segments of 125 s, A2 on, song 16 (one line, 960 notes) and song 15 (eight lines) in turn, on the
pages overview, CLIPS, SCENES, SYNC / MIDI, mixer and ACTIONS in turn (../overnight/g11/soak-v0423-*).

| | Segments | DIN band | DIN largest single error | USB band | USB largest single error |
| --- | ---: | --- | ---: | --- | ---: |
| one line | 17 | 1.60 to 1.93 ms | 1.32 ms | 1.62 to 1.87 ms | 1.30 ms |
| eight lines | 16 | 2.26 to 3.14 ms | 2.24 ms | 2.15 to 2.67 ms | 1.69 ms |

No bad segment; no underrun, no DMA overrun, no stuck note; DIN and USB carried the same notes. No page stands out.

During the soak the time service corrected the NUC's clock once, at minute 47: the steered clock went from +23 ppm
to -90 ppm inside segment 23 and bent 3.73 ms against a straight line within that segment. The device, on the raw
clock, read a band of 1.83 ms in that segment. An unmapped tool would have had up to 3.7 ms of the clock's own in its figure there. This is the
candidate 1 event again, caught with both clocks recorded.

### 60.4 The answer, and how sure it is

The 9.9 ms was the measuring computer's clock, not the SMK-37. I am confident of it: the clock record shows a
correction of -365 ppm at the minute of the failure; the mapped tool in the same run read 1.8 ms; the same build has
since read 1.1 to 1.3 ms in four runs of the failed test and passed a 70-minute soak of 33 segments; and the soak
reproduced the event, a 3.7 ms bend of the steered clock with 1.8 ms on the device. What I do not have is the
per-note record of the failed run itself (that tool kept none; it does now), so the size 9.9 is explained by the
clock's rate, not reconstructed note by note. A device fault of that size hiding behind it would have had to appear
exactly while the clock was being corrected and never in the 4000 seconds of the soak; I do not believe that.

## 61. tabby-v1.0 (2026-11-18)

The user's order: no new features; the full regression on the device with a two-hour soak of a multi-track song with
the Wrong Room rig profile; fix only what the regression finds, with the TRACK SELECTED text; a stage checklist;
release through the candidate flow.

| Part | Change |
| --- | --- |
| app/screen.c | the KNOB BANK list's first line shows a shortcut's notice while it lasts (SPEC 19.27); 32 bytes |
| docs | STAGE-CHECKLIST.md (new) and section 9 of the guide, one text (guide.mjs checks it); pad rows confirmed (STICKERS.md v0.7 5.1, CONTROL-MAP.md v0.19 1.2); the guide v5.0, Help, SPEC v0.62 (17.17, 19.27) say what the screen shows for KNOB BANK + a pad; known limits: row events ahead of notes on one DIN cable |
| tools/linux/hw | rig-song.mjs (new: a MIDI file with a rig profile as a song), workbench.mjs v0.7 (song --song-json), rc-validate.py v0.7 (the step `soak`), run-soak.py v0.2, release-flow.sh passes TABBY_RC_ARGS; the timing tools of section 60 |

Why TRACK SELECTED was never seen (the user's item 1): `smk37_screen_shortcut` sets the notice, and every page writes
its notice at y 198 or 213; the KNOB BANK list is painted over y 195 to 240 for as long as KNOB BANK is down. The
notice lasts 1.2 s, so it showed only when the button was let go at once. Checked in the simulator before and after
(the list's first line reads TRACK SELECTED, then KNOB BANK SHORTCUTS again; TRACK MUTED: SOUND AND MIDI likewise).

The Wrong Room song on the device, a trial before the candidate (tabby-v04.23, three segments): USB band 1.66 to
1.73 ms on all eight lines; on the one DIN cable 14.9 to 15.4 ms, all of it in the first note of each line after the
song's loop point (every 32nd note of a line: 13.8 ms late), where the first scene's 17 row events pass the cable
ahead of the notes. Program changes 113 and controllers 42 in a segment, the same on both ports. This is the cable,
not a regression: documented in the guide's known limits and in the stage checklist, nothing changed. The soak
judges USB by the 3.5 ms limit and DIN by a limit of 20 ms.

Measured: app image 490468 bytes (+32), margin 28989, heap 142412. Build `3b6cde4c259dd43a`.

### 61.1 tabby-v1.0 released: candidate 1 (2026-11-18)

Suite green on 5cf1d14; builds/tabby-v1.0-rc1/ (build `3b6cde4c259dd43a`), installed in 11 s; every step passed at the
first attempt (22 steps with the soak); promoted.

| Step | Result |
| --- | --- |
| soak, the Wrong Room song, 121 minutes, 57 segments on six pages | 0 bad; USB band 1.65 to 2.76 ms, largest single error 2.13 ms; DIN (one cable) band 14.83 to 15.78 ms, largest single error 14.62 ms (the first notes after the loop point, behind the row events); program changes and controllers the same on both ports in every segment; no underrun, no stuck note |
| run-takeedit / run-repeat / run-program / run-chain / run-scenechain / run-sceneedit / run-setup | 26 of 26 / 20 of 20 / 10 of 10 / 11 of 11 / 13 of 13 / 16 of 16 / 38 of 38 |
| run-record / run-steps / run-launch twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.12 ms on DIN; tempo ratio 0.99958 |
| run-15, one line, three runs | DIN 1.78, 1.70, 1.64 ms; USB 1.75, 1.78, 1.67 ms; clock ratio 0.999583 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

During the soak the NUC's steered clock ran between +5.5 and +55.6 ppm against its raw clock and bent up to 1.68 ms
inside one segment; the figures above are on the raw clock. The regression found nothing to fix. The Wrong Room song
was deleted from slot 6 afterwards. Flash margin 28989 bytes, free RAM 142412 bytes.

Not verified on hardware: the screen fix (the notice in the KNOB BANK list) was looked at in the simulator only.

## 62. tabby-v1.0.1: row events were missing in a two-scene loop; my soak had passed it (2026-11-18)

### 62.1 What happened

tabby-v1.0 was promoted with "soak: 57 segments, 0 bad". Writing its notes I listed the program changes per segment
and they were not the same number: 68 to 136 in 125 s, where the first trial had shown 113. The soak check (run-soak
v0.2) compared DIN with USB and asked for "some" program changes; both ports lacked the same ones, so it passed.
In the capture, whole bursts were missing: a scene was entered and none of its row events was sent.

| Page shown | Program changes per segment (136 = none missing) |
| --- | --- |
| overview | 125 to 136 |
| CLIPS | 97 to 136 |
| SCENES | 113 to 130 |
| SYNC / MIDI | 78 to 136 |
| mixer | 68 to 130 |
| ACTIONS | 80 to 114 |

With the rule the soak has now (every entry's burst, of the right size) 47 of those 57 segments are bad. The notes
were all there and on time; only row events were lost. So tabby-v1.0 went out with a fault that its own regression
had recorded and my check had not looked for. That is my error: I wrote a check that could not fail on this.

### 62.2 The cause and the fix

SPEC 19.28. One line in the audio thread (`armed[cur] = 0` where the row buffer is released). The same code is in
tabby-v04.23 (the trial of section 61 already had 113 of 136) and, by reading, in the versions before; three or more
scenes in a row never showed it. In the simulator, six passes of the looping song: before "17 6 0 0 0 6 0 0 0 6 0 0"
event messages per scene entry, after "17 6 17 6 17 6 17 6 17 6 17 6" (tests/workbench/wrong-room-loop-sim.mjs, in
make midi-import-sim, so in the suite).

### 62.3 What changed besides the line

| Part | Change |
| --- | --- |
| tools/linux/hw/run-soak.py v0.3 | --row-events 17,6 --row-seconds 8: every scene entry in a segment must show its burst of that size on both ports |
| tools/linux/hw/rc-validate.py v0.8 | the soak step passes that |
| tools/linux/builds-notes.json | the page builds/tabby-v1.0/ gets a note line: use tabby-v1.0.1 |
| the guide v5.1, Help, SPEC 19.28 | what was wrong, who was affected |

Measured: app image 490468 bytes (unchanged), margin 28989, heap 142412. Build `b3ecdffbabe49bf0`.

### 62.4 tabby-v1.0.1 released: candidate 1 (2026-11-18)

Suite green on cd7ebb4; builds/tabby-v1.0.1-rc1/ (build `b3ecdffbabe49bf0`), installed; every step passed at the first
attempt (22 steps with the soak).

| Step | Result |
| --- | --- |
| soak, the Wrong Room song, 120 minutes, 57 segments on six pages (run-soak v0.3) | 0 bad; in every segment sixteen scene entries with 17, 6, 17, 6 ... event messages on both ports, 136 program changes and 48 controllers; USB band 1.70 to 2.45 ms, largest single error 1.75 ms; DIN (one cable) 14.82 to 16.21 ms; no underrun, no stuck note |
| run-takeedit / run-repeat / run-program / run-chain / run-scenechain / run-sceneedit / run-setup | 26 of 26 / 20 of 20 / 10 of 10 / 11 of 11 / 13 of 13 / 16 of 16 / 38 of 38 |
| run-record / run-steps / run-launch twice | 25 of 25 / 18 of 18 / 40 of 40 and 40 of 40 |
| run-clips, the timing song | 960 of 960 on DIN and USB; worst 1.12 ms |
| run-15, one line, three runs | DIN 1.87, 1.81, 1.77 ms; USB 1.90, 1.78, 1.98 ms; clock ratio 0.999580 |
| full backup, restore, verify | Verify PASS, 41 items, twice |

The promotion stopped at its last push: "Could not resolve host: github.com" (the tag tabby-v1.0.1 was pushed, the
pages commit 61f0131 was made but not sent). When the name resolved again: gh-pages fetched (nothing new there), that
commit pushed with the tool's own command, `make release` run. Nothing was rebuilt. The NUC's steered clock ran
between -50.2 and +59.1 ppm against its raw clock during the soak (bend up to 2.01 ms inside a segment).

The release notes of tabby-v1.0 carry a correction of their soak claim and "use tabby-v1.0.1" at the top; its page
has the note line.

## 63. tabby-v1.0.2: EVENT LEAD (2026-11-18)

The user's order (SPEC 19.29): send a scene's events before the downbeat by a lead that is a song setting; changed by
the user while I was building it: the default is OFF, a song with it OFF must send byte for byte what tabby-v1.0.1
sends, and the manual says next to the setting that an early program change lets the previous scene's last notes
sound on the new patch. I had started with 1/16 as the stored default (the first message); the stored encoding was
changed to 0 = OFF before anything was tested.

| Part | Change |
| --- | --- |
| app/song.c, song.h | `SONG_SET_EVENT_LEAD` (header byte 47), `event_lead_blocks`; `decode_rowinfo` and `decode_track` add it to the row's lead. Nothing changed in the audio thread |
| app/screen.c | the line EVENT LEAD (25 lines; the last of page 3/3); op 17 replies 39 bytes |
| web/import/song-format.js v0.14 | keeps byte 47 (`song.eventLead`) in a record of any version |
| tests | wrong-room-loop-sim.mjs v0.2 (16 checks); setup-sim.mjs (106); fixtures/wrong-room-loop-v1.0.1.json |
| tools/linux/hw | run-soak.py v0.4 (--events-ahead-ms, --skip-first-note), rig-song.mjs v0.2 (--event-lead), rc-validate.py v0.10 (two soaks: `soak` lead OFF, `soak-lead` 1/16; the panel state guard), panel-state.py (new), run-setup.py v0.13, tabby_link.py v0.24 |

The reference for "byte-identical": a simulator built from the tag tabby-v1.0.1 in a scratch clone played the looping
Wrong Room song for six passes; the SHA-256 over every message of port 0 (the clock bytes too) with its audio block
is f2651bb6dbf247c6...; 3237 messages without the clock. The tree's simulator with EVENT LEAD OFF gives the same hash.
With 1/16: per scene entry "0 43 43 43 ..." blocks from the last event to the first note (43 blocks = a 16th at 120
BPM; 0 at SEQ PLAY), 3080 note messages in the blocks they were in. With the H90's program change first in scene 2
and its 255 ms gap behind it: "6:89:42" at every entry (six messages; the next message 89 blocks after the program
change, 88 = 255 ms; the last message 42 blocks before the note).

### 63.1 Found on the way: the device had been left with track 1 muted

Proving run-setup.py v0.13 on the installed tabby-v1.0.1, the tool failed its first sound check three times: track 1
was muted (KNOB BANK list: its mute pad orange). From a clean state (unmuted, the test song written anew) the same
tool passed 38 of 38. So the tabby-v1.0.1 release run, or what I did on the device after it, left track 1 muted,
and the user would have found track 1 silent. I could not find what did it: the project data in the backups before
and after that run are identical; playing on each of the soak's six pages by remote did not mute anything; no test
tool mutes track 1. It is not explained.

What is done about it: tools/linux/hw/panel-state.py reads the mutes of all eight tracks, the focus, the ARP
switches, CLOCK and A2; rc-validate.py v0.10 reads it before the tests, after every test and after the last step,
fails the step after which it changed, and puts the mutes back. If it happens again the run names the step.

Measured: app image 490756 bytes (+288), margin 28701, heap 142412. Build `9b00a12fd0346a65`.
