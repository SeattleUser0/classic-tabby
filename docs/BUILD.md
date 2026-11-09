# Classic Tabby — Linux build of SMK37 Open V01

Version: 0.49
Revision log:
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

Current release **tabby-v04.0** (2026-11-08, Task 12 Phase 0: the storage move as the normal
layout, at the site root and at `builds/tabby-v04.0/`); the earlier releases' values below stay
as the record of their publications.

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
