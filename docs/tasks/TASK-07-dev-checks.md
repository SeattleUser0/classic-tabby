Start Task 07 in this session. Session A is working on Tasks 05 and 06 in the main checkout. Do not work there. Create a git worktree at ~/Documents/Classic Tabby/firmware-devchecks on a new branch classic-tabby/dev-checks, based on classic-tabby/linux-build, and work only there. First save this whole message as docs/tasks/TASK-07-dev-checks.md on your branch and commit it. Then do Step 1 and stop with the report. No changes to build files or tools until I approve it.

Classic Tabby, Task 07: Faster development checks
Revision log:
- v0.1 2026-11-03: first draft, from the Orange Cat orchestrator's handoff.

WHY
The Orange Cat project (my FM-1 firmware, same JieLi toolchain family, same NUC) found that its sessions caught ordinary C mistakes only through full builds and an hour-long suite, that warnings were hidden, that no sanitizer run was green, and that parallel sessions ran the machine out of memory. They fixed it with opt-in fast checks. Their write-up and scripts are on https://github.com/SeattleUser0/OrangeCat, branch dev-tools, docs/DEV_CHECKS.md (OC_CHECK=1 compile-only build, tools/lint.sh, compile_commands.json from build.py, run_tests.sh --fast and --changed, a timing profile, a shared suite lock). Read it from a read-only scratch clone outside this repo. Classic Tabby is laid out differently, so check before copying anything.

What I already know about Classic Tabby, verify it: not a unity build (app/*.c compile separately); firmware builds through tools/linux build.py in two tracks (Track B native, Track A under Wine) and make crosscheck compares them; the host suite is one binary (tests/host/smoke.c with all app, web and synth sources) built with -Wall -Wextra and no sanitizers and no -Werror; there are Node suites for the workbench, devices, the importer and the wasm smoke; there is no compile-only target and no compile_commands.json.

STEP 1. Measure and report. STOP AND REPORT. Do not change any tracked file except the task doc.
- Time every make target on the current linux-build head in your worktree: verify, firmware-native, firmware-ref, crosscheck, web, web-smoke, host-smoke, workbench-test, midi-import-test, and anything else a session runs before saying "suites pass". Report which dominate.
- Count compiler warnings in the host suite build and in the native firmware build, by file. Report, do not fix.
- Build and run the host suite once with -fsanitize=address,undefined into a scratch build directory outside build/ (no tracked changes). Report every failure with file and line. Do not fix.
- Check whether any test writes over real build outputs, so a second run on the same tree behaves differently. Run the suites twice in a row and compare.
- Check whether the JieLi toolchain path and the WASI SDK path are set in the login shell, and what the build falls back to when they are not.
- Read Orange Cat's DEV_CHECKS.md and scripts, and say for each one whether it ports as is, needs reworking for this layout, or does not apply here (for example, the 205-compile problem and ccache findings come from Orange Cat's unity build and per-test compiles, which Classic Tabby may not have).
- Propose the targets for Step 2 with expected run times.

STEP 2. Implement after I approve. Everything opt-in; default build behavior unchanged.
- make check: compile app sources with the real target flags and -fsyntax-only through the native JieLi clang, no link. Target under 20 s.
- make lint: host gcc with -Wall -Wextra over the app sources through the host test build, warnings counted by file, summary at the end. Optional cppcheck and clang-tidy steps if installed.
- compile_commands.json written by the build, with target-only flags stripped so host tools can read it.
- make host-sanitize: the host suite under address and undefined sanitizers, in its own build directory.
- make test-fast: the suites a session should run while working, without sanitizers, as fast as possible.
- A timing profile of each target written each run, under build/.
- Shared machine lock: every full suite, crosscheck and sanitizer run goes through
  flock /tmp/oc-suite.lock systemd-run --user --scope -p MemoryMax=12G -- <command>
  The lock file is the same one Orange Cat's sessions use, so all sessions on this NUC queue together. At most 4 parallel jobs. Single builds run under nice -n 19. No background wait loops left behind.
- If Step 1 found tests that overwrite build outputs, make them write to their own directory.
- Gate: the firmware package (.fwsc, sdk.elf, app-image.bin) and the hosted workbench page are byte-for-byte identical before and after your changes, by SHA-256. Report the hashes.
- Orange Cat's scripts may be copied and adapted (they are build tools, not linked into the firmware). Keep their license and copyright headers and note the source in a revision line.

STEP 3. Document and report.
- docs/DEV_CHECKS.md for Classic Tabby: each target, what it catches, how long it takes, and the standing rules: syntax check and lint before any build; only affected tests, without sanitizers, while working; the full suite plus host-sanitize green before any flash or release build; all full runs through the shared lock.
- Add the rules to BUILD.md under the build section. Add warning fixes and sanitizer fixes to BUILD.md's left-to-build list as separate work with an identical-output gate.
- Commit on your branch. Do not push. Do not merge. Report: targets and timings, warning counts, sanitizer findings, the gate hashes, and what I should tell Session A to merge and adopt.

RULES
- Do not touch app/, sdk/, web/ or tests/ content except to redirect a test's output directory if Step 1 found one overwriting builds, and say so.
- Never flash, never write device flash.
- Comment heavily. Top of every new file: purpose, version, revision log. Note revision changes inline by version.
