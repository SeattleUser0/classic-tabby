# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
#
# Makefile — top-level entry point for the Classic Tabby Linux build (Task 01, Step 7)
#
# Purpose
#   One place to run every Linux build step described in docs/BUILD.md:
#
#     make verify            input checks only: sdk/manifest.json hashes, synth.json
#                            contract, pinned toolchain hashes (both tracks if present)
#     make firmware          default firmware build = Track B (native JieLi Linux
#                            toolchain) into build/<MODEL>/        [= firmware-native]
#     make firmware-native   same as above, explicit
#     make firmware-ref      Track A reference build (JieLi Windows 2.5.3 toolchain under
#                            Wine) into build/ref/<MODEL>/
#     make crosscheck        build both tracks and compare the SHA-256 of sdk.elf and the
#                            .fwsc package (they are byte-identical as of Task 01)
#     make web               web workbench local preview (Linux WASI SDK 27) into
#                            build/preview/index.html                      [Step 6]
#     make test              host tests: native gcc build of the app + simulator sources
#                            with FM1_HOST_TEST, a Node check of the wasm, and the
#                            workbench song-write test                           [Step 7]
#     make workbench-test    Node tests of the workbench: the shared song write path on a fake
#                            device [Task 03 f] and the device library schema [Task 04]
#     make midi-import-sim   also plays a row-event song through the wasm       [Task 04]
#     make timed-note-test   the timed note module (app/timed_note.c, web/timed-note) against
#                            tests/timed-note/vectors.txt, C and JS            [Task 05]
#     make midi-import-test  Node tests of the MIDI importer (web/import, tests/midi-import)
#                            against the generated fixture .mid files        [Task 02 MIDI]
#     make midi-import-sim   plays an imported Renoise export through build/web/simulator.wasm
#                            (after make web) and checks MIDI out            [Task 02 Step 4]
#     make flash-budget      docs tables from the current build/<MODEL>/ (read only)
#     make check             Task 07: the 16 app units through the native JieLi clang with the
#                            build's flags and -fsyntax-only; no link, no package (about 2 s)
#     make lint              Task 07: host gcc -Wall -Wextra over the host-test sources one file at
#                            a time, then the target clang with -Wall -Wextra; counts by file and
#                            kind; LINT="--cppcheck --tidy" adds the analyzers (tools/linux/lint.sh)
#     make host-sanitize     Task 07: the host tests under ASan+UBSan, built in build/host-san/
#                            (through the lock)
#     make test-fast         Task 07: the tests to run while working, no sanitizers, no lock:
#                            timed-note-test, host-smoke, web-smoke, workbench-test, midi-import-test
#     make suite             Task 07: the full run before a flash or a release, through the lock:
#                            crosscheck, test, midi-import-sim, host-sanitize; build/suite-passed.txt
#     make profile           Task 07: the timing lines of build/profile.txt (every target writes one)
#     make package-equivalence  Package.cs (pwsh) vs package.py byte comparison; skipped
#                            with a message when pwsh is not installed
#     make package           distribution build (= build.bat pro --package): firmware plus
#                            build/official-web/<MODEL>/SMK37-Open-Source.html with the
#                            firmware and the stock V16 image embedded; the page links to
#                            FM1_SOURCE_URL (the GitHub archive of TAG)           [Task 02]
#     make hosted            static site from that HTML (tools/Build-Hosted.cjs) into
#                            build/hosted/<MODEL>, not committed anywhere
#     make release-assets    build/release/<TAG>/: .fwsc, offline HTML, SHA256SUMS.txt
#     make publish           package + hosted + commit the site to gh-pages and push it to
#                            origin (HEAD must carry TAG, tree clean, TAG already pushed)
#     make release           GitHub release for TAG with the release assets attached
#                            (needs docs/releases/<TAG>.md as the notes)
#     make clean             remove build/ (also detaches the gh-pages worktree)
#     A2=0                   Task 16: build WITHOUT option A2 (the tabby-v04.1 firmware). Option A2, the control
#                            pass on demand, is in every normal build since tabby-v04.2 (BUILD.md 28.4, 32)
#     DIAG=1 / USER_BYTES=N  Task 11: the diagnostic build / the USER size (any firmware, check,
#                            package or web target); make web-old536: the old 536576-layout simulator
#
#   Nothing here touches device flash. Factory calibration and protected flash regions
#   are never written. Flashing is done by the user through the workbench.
#
#   Paths with spaces: the toolchains live under "~/Documents/Classic Tabby/toolchains",
#   so every path variable is quoted inside recipes and never used as a prerequisite.
#   Override any variable on the command line, e.g.
#       make firmware JIELI_LINUX=/opt/jieli
#       make firmware-ref WINEPREFIX=$HOME/.wine-jieli
#
#   Task 07 (v0.10): crosscheck, firmware-ref, host-sanitize and suite run through Classic Tabby's
#   machine lock, "flock /tmp/tabby-suite.lock systemd-run --user --scope -p MemoryMax=4G", so the
#   sessions on this NUC queue among themselves (LOCKED below: each of those targets is a wrapper
#   that runs its "-run" twin in a sub-make under the lock; TABBY_LOCKED=1 marks a make already
#   inside, so the twin runs directly). Single builds and the fast tests run under nice -n 19 and
#   never wait. At most JOBS=2 compiles at once. Every command of every target is timed into
#   build/profile.txt by tools/linux/timed.sh ($(T)). Default outputs are unchanged (the gate in
#   docs/DEV_CHECKS.md).
#
# Version: 0.27
#
# Revision log
#   v0.27 2026-11-12  Task 16 Goal 5 (branch mc707-phase2): clip-v3-test (the v3 clip module, C and JS, and the importer's v3 output) in test and test-fast.
#   v0.26 2026-11-11  Task 16: option A2 is on in the normal build (A2 defaults to 1; A2=0 builds without it).
#   v0.25 2026-11-11  tabby-v04.2: merge of the timing branch (A2=1 build switch, host tests always build the A2
#                     code) with the guide test; v0.22 of the timing branch is listed below as v0.22t.
#   v0.24 2026-11-10  tabby-v04.1.1: workbench-test runs tests/workbench/guide.mjs (the testing guide's
#                     shape).
#   v0.23 2026-11-10  Task 14: English only: tests/workbench/manual-i18n.mjs became manual-structure.mjs (no
#                     translation table any more); help-banned.mjs also fails on any CJK in a user-facing string.
#   v0.22 2026-11-10  Task 14: workbench-test runs tests/workbench/help-banned.mjs (no Help, panel or
#                     tooltip string names a removed page, mode, action or flow, in both languages).
#   v0.22t2026-11-10  Task 15 Step 4: A2=1 (build.py --a2, -DCT_A2=1: option A2, the control pass on demand) for
#                     firmware, check and package; the host tests always build the A2 code (HOST_FLAGS
#                     -DCT_A2=1). Unset, every command line is as before.
#   v0.21 2026-11-09  workbench-test runs tests/workbench/update-safety.mjs (no force flash after a timeout; the
#                     zero-tag loader resumes; sdk/WebUpdate.js, BUILD.md 26.8).
#   v0.20 2026-11-09  workbench-test runs tests/workbench/recover-page.mjs (the tabby-v04.0 recovery page:
#                     zero-tag resume, no force flash; tools/linux/recover-page.py).
#   v0.19 2026-11-08  Task 12 A5: workbench-test runs tests/workbench/loader-tag.mjs (stale-loader resume) and
#                     tests/linux/builds-index-test.py (permanent build pages, builds/index.json). publish-pages.py
#                     v0.4 adds every tagged publish to builds/<tag>/ and the index by itself.
#   v0.18 2026-11-08  Task 12 A1: the normal layout is USER 471040. web-diag now builds the diagnostic
#                     simulator on that layout; web-old536 (was web-probe64) the diagnostic simulator on
#                     the old 536576 layout, the source of the cross-layout restore in backup-test.
#   v0.17 2026-11-08  Task 11B: workbench-test runs tests/workbench/update-ports.mjs (updater port selection).
#   v0.16 2026-11-07  Task 11: DIAG=1 (the diagnostic build, build.py --diag) and USER_BYTES=N (the USER
#                     size, build.py --user-bytes) reach build.py and build-web.py through $(OPTS); unset,
#                     nothing is added and every output is as before. web-probe64 builds the simulator
#                     (diagnostic) with the 471040 layout into build/web-probe64/, web-diag the diagnostic
#                     simulator on the stock layout into build/web-diag/; backup-test (part of test and
#                     test-fast) runs tests/workbench/backup.mjs on the three simulators; workbench-test
#                     runs tests/linux/midi-monitor-test.py (the monitor's analysis); SITE_DIR for publish
#                     (the probe's page in gh-pages/probe64/); PRERELEASE=1 and RELEASE_TITLE for release.
#   v0.15 2026-11-05  Task 09 (d): midi-import-sim runs tests/workbench/wrong-room-sim.mjs.
#   v0.14 2026-11-05  Task 09 (c): midi-guide target; workbench-test runs tests/workbench/midi-guide.mjs.
#   v0.13 2026-11-05  Task 09 (a): workbench-test runs tests/workbench/rig-profile.mjs (the built-in
#                     Wrong Room profile).
#   v0.12 2026-11-04  Task 08 (manual): workbench-test runs tests/workbench/manual-i18n.mjs (every
#                     Chinese text of the manual tab has a translation).
#   v0.11 2026-11-04  Task 08: DISPLAY_VERSION / $(DV) passed to build.py, build-web.py and the
#                     check (the display version shown to the user, normally the git tag; the
#                     forced label for the release gate); web-smoke also runs
#                     tests/display-version.mjs; web-smoke and midi-import-sim depend on
#                     the phony `web` (an existing wasm was never refreshed before).
#   v0.10 2026-11-04  Task 07: check, lint, host-sanitize, test-fast, suite, profile targets; the host
#                     test build compiles one object per source into build/host/obj with -MMD depfiles
#                     (a header edit rebuilds what includes it; before, only the .c files were
#                     prerequisites), JOBS=2 at once; the lock wrapper (LOCK, LOCKED) and nice (NICE);
#                     the crosscheck comparison moved to tools/linux/crosscheck-compare.sh; every
#                     command prefixed with $(T) (tools/linux/timed.sh). Same flags, same outputs.
#   v0.9  2026-11-04  Task 06: workbench-test runs tests/workbench/transfer-radio.mjs (command 24)
#                     and tests/workbench/rig-lead.mjs (the rig's lead before the bar);
#                     midi-import-sim runs tests/workbench/launch-sim.mjs (a scripted 32-bar
#                     performance with launches, stops, a scene jump and back-to-song).
#   v0.8  2026-11-02  Task 04: workbench-test also runs tests/workbench/devices.mjs;
#                     midi-import-sim also runs tests/workbench/row-events-sim.mjs.
#   v0.7  2026-11-02  Task 03 (f): workbench-test target, part of test.
#   v0.6  2026-11-02  Task 02 Step 4: midi-import-sim target (Node, needs build/web/simulator.wasm).
#   v0.5  2026-11-02  Task 02 (MIDI import): midi-import-test target (Node, no build needed).
#   v0.4  2026-11-02  Task 02: package, hosted, release-assets, publish and release targets;
#                     GITHUB_REPO, TAG, FM1_SOURCE_URL, PAGES_URL variables. clean also
#                     removes the gh-pages worktree registration.
#   v0.3  2026-11-01  Step 7: host-smoke (native $(CC) build of the app + simulator sources
#                     with FM1_HOST_TEST, tests/host/smoke.c) and test (= host-smoke +
#                     web-smoke).
#   v0.2  2026-11-01  Step 6: web (tools/linux/build-web.py --local-preview with the pinned
#                     Linux WASI SDK 27) and web-smoke (/usr/bin/node runs
#                     tests/simulator-wasm-smoke.mjs against build/web/simulator.wasm).
#   v0.1  2026-11-01  Initial version (Task 01 Step 5): verify, firmware (= Track B,
#                     native, the default since Track A and Track B proved byte-identical),
#                     firmware-native, firmware-ref, crosscheck, flash-budget,
#                     package-equivalence, clean. web and test are added in Steps 6 and 7.

SHELL := /bin/bash
.DEFAULT_GOAL := help

MODEL      ?= pro
PYTHON     ?= python3
# Node for the web-side checks: the nodesource /usr/bin/node (22 LTS), not Homebrew's.
NODE       ?= /usr/bin/node
CC         ?= gcc

TOOLCHAINS  ?= $(HOME)/Documents/Classic Tabby/toolchains
# Track B: JieLi Linux toolchain root (contains common/bin/clang and pi32v2/bin/ld).
JIELI_LINUX ?= $(TOOLCHAINS)/jieli-linux/jieli-linux-toolchains-20260730.1
# Track A: the "pi32" directory of the extracted Windows 2.5.3 installer (bin/clang.exe).
JIELI_WIN   ?= $(TOOLCHAINS)/jieli-2.5.3/C$$/JL/pi32
WINEPREFIX  ?= $(HOME)/.wine-jieli
# Step 6: extracted Linux x86_64 WASI SDK 27 (bin/clang, share/wasi-sysroot).
FM1_WASI_SDK ?= $(TOOLCHAINS)/wasi-sdk-27.0-x86_64-linux

# Task 02: publication. The workbench's GPL source link must name the archive of the exact
# tag that was built, so TAG is both the git tag and the archive name. Override for a new
# version:  make publish TAG=tabby-v01.1   (after committing and tagging that commit).
GITHUB_REPO    ?= SeattleUser0/classic-tabby
TAG            ?= tabby-v01.0
FM1_SOURCE_URL ?= https://github.com/$(GITHUB_REPO)/archive/refs/tags/$(TAG).zip
PAGES_URL      ?= https://seattleuser0.github.io/classic-tabby/
PACKAGE_HTML   := build/official-web/$(MODEL)/SMK37-Open-Source.html
FWSC           := build/$(MODEL)/generated/SMK37_$(shell echo $(MODEL) | tr a-z A-Z)_OPEN.fwsc

# Task 07: the machine rules. LOCK serialises the heavy runs among the Classic Tabby sessions (not with
# Orange Cat's /tmp/oc-suite.lock) and caps their memory; NICE keeps single builds out of the way;
# T times every command into build/profile.txt (tools/linux/timed.sh; `make profile` prints it).
NICE       ?= nice -n 19
JOBS       ?= 2
LOCKFILE   ?= /tmp/tabby-suite.lock
LOCK       := flock $(LOCKFILE) systemd-run --user --scope -q -p MemoryMax=4G -- env TABBY_LOCKED=1
T           = tools/linux/timed.sh $@
# make lint LINT="--cppcheck --tidy": the analyzers (GNU make predefines LINT=lint, hence := not ?=).
LINT       :=
# A target that must run through the lock is a wrapper: "$(LOCKED) name-run" runs the twin target in
# a sub-make, under $(LOCK) when this make is outside the lock, directly when it is already inside
# (TABBY_LOCKED=1 reaches every sub-make through the environment). The twin is where the work and
# the prerequisites are, so nothing is built before the lock is held, and nothing runs twice.
LOCKED      = $(if $(TABBY_LOCKED),$(MAKE) --no-print-directory,@echo "== $@ through $(LOCKFILE) (systemd scope, MemoryMax=4G)"; $(LOCK) $(MAKE) --no-print-directory)

BUILD      := tools/linux/build.py
# Task 08: the display version (tools/linux/display_version.py: the git tag) is computed by the
# build scripts themselves. DISPLAY_VERSION=V01 forces the fallback label (the release gate:
# the firmware must then match the previous release apart from the build id).
DISPLAY_VERSION ?=
DV         := $(if $(DISPLAY_VERSION),--display-version "$(DISPLAY_VERSION)",)
# Task 11 (v0.16): the build options; empty unless DIAG=1 or USER_BYTES is given.
DIAG       ?=
USER_BYTES ?=
OPTS       := $(if $(filter 1,$(DIAG)),--diag,) $(if $(USER_BYTES),--user-bytes $(USER_BYTES),)
# Task 15 Step 4 (v0.22): A2=1 builds option A2 (the control pass on demand, -DCT_A2=1) into the firmware:
# the diag build tabby-v04.2-diagA2. build.py only (the simulator has no A2); the host tests always have it.
A2         ?= 1
A2OPT      := $(if $(filter 0,$(A2)),--no-a2,--a2)
NATIVE     := $(PYTHON) -I $(BUILD) --model $(MODEL) --firmware-only --toolchain-kind native --toolchain "$(JIELI_LINUX)" $(DV) $(OPTS) $(A2OPT)
WINE       := $(PYTHON) -I $(BUILD) --model $(MODEL) --firmware-only --toolchain-kind wine --toolchain "$(JIELI_WIN)" --wine-prefix "$(WINEPREFIX)" $(DV) $(OPTS) $(A2OPT)

.PHONY: help verify firmware firmware-native firmware-ref crosscheck web web-smoke host-smoke test flash-budget package-equivalence \
        package hosted release-assets publish release clean midi-import-test midi-import-sim workbench-test timed-note-test clip-v3-test \
        check lint host-sanitize test-fast suite profile firmware-ref-run crosscheck-run host-sanitize-run suite-run midi-guide \
        web-normal web-diag web-old536 backup-test

# Host test build: the same source set and defines as the WASI simulator build in
# tools/linux/build-web.py (Build-Web.ps1 L78-L83), compiled natively. gcc does not know
# clang's minsize attribute and warns about third_party indentation, so -Werror is not
# used here (it stays on in the wasm build). CC=clang works too when clang is installed.
HOST_SRCS  := $(shell find app web third_party/synth -name '*.c' ! -path 'app/board/*' | sort)
HOST_WARN_OFF := -Wno-unused-function -Wno-array-parameter -Wno-attributes -Wno-misleading-indentation
HOST_FLAGS := -std=c11 -O1 -g -fwrapv -fno-fast-math -ffp-contract=off -DFM1_HOST_TEST -DFM1_OPEN_WEB -DCT_A2=1 \
              -Wall -Wextra $(HOST_WARN_OFF) \
              -Iweb/engine -Iweb/synth -Ithird_party/synth -Isdk/include -Iapp/synth -Iapp
# Task 07: one object per source (build/host/obj/<path>.o) with a depfile each, so an edited header
# rebuilds exactly the units that include it; the link line and the flags are the v0.3 ones.
HOST_OBJS  := $(patsubst %.c,build/host/obj/%.o,$(HOST_SRCS) tests/host/smoke.c)
# make host-sanitize: the same objects under AddressSanitizer and UndefinedBehaviorSanitizer, stopping
# at the first finding, in their own directory build/host-san/.
SAN_FLAGS  := -fsanitize=address,undefined -fno-sanitize-recover=all -fno-omit-frame-pointer
HOST_SAN_OBJS := $(patsubst %.c,build/host-san/obj/%.o,$(HOST_SRCS) tests/host/smoke.c)

help:
	@sed -n '7,68p' Makefile | sed 's/^#   //; s/^#//'

verify:
	$(T) $(PYTHON) -I $(BUILD) --verify-only --toolchain-kind native --toolchain "$(JIELI_LINUX)"
	@if [ -f "$(JIELI_WIN)/bin/clang.exe" ]; then \
	    $(PYTHON) -I $(BUILD) --verify-only --toolchain-kind wine --toolchain "$(JIELI_WIN)" --wine-prefix "$(WINEPREFIX)"; \
	else echo "Track A toolchain not present at $(JIELI_WIN); Windows toolchain hashes not checked."; fi

firmware: firmware-native

firmware-native:
	$(T) $(NICE) $(NATIVE)

# Task 07: the Wine build and the crosscheck go through the lock (LOCKED); the -run twins hold the
# work, and crosscheck-run's two builds are its prerequisites, so they are built inside the lock.
firmware-ref:
	$(LOCKED) firmware-ref-run

firmware-ref-run:
	$(T) $(WINE) --build-root build/ref

crosscheck:
	$(LOCKED) crosscheck-run

crosscheck-run: firmware-native firmware-ref-run
	@echo "== Track A (Wine, reference) vs Track B (native)"
	$(T) tools/linux/crosscheck-compare.sh $(MODEL)

web:
	$(T) env FM1_WASI_SDK="$(FM1_WASI_SDK)" $(NICE) $(PYTHON) -I tools/linux/build-web.py --local-preview $(DV) $(OPTS)
	@echo "Open with: google-chrome \"file://$(CURDIR)/build/preview/index.html\""

build/web/simulator.wasm:
	$(MAKE) web

# Task 11: the simulators for tests/workbench/backup.mjs. Task 12 A1: the diagnostic build on the
# normal 471040 layout (build/web-diag) and on the old 536576 layout of tabby-v03.x (build/web-old536,
# the device a backup comes from before the storage move).
web-diag:
	$(T) env FM1_WASI_SDK="$(FM1_WASI_SDK)" $(NICE) $(PYTHON) -I tools/linux/build-web.py --simulator-only \
	    --diag --wasm-out build/web-diag $(DV)

web-old536:
	$(T) env FM1_WASI_SDK="$(FM1_WASI_SDK)" $(NICE) $(PYTHON) -I tools/linux/build-web.py --simulator-only \
	    --diag --user-bytes 536576 --wasm-out build/web-old536 $(DV)

# Task 11 Step 2: full backup and restore end to end on the three simulators. The normal one is
# built here without DIAG/USER_BYTES (build/web-normal), so the test means the same whatever
# options the surrounding make (a DIAG=1 suite) was given.
web-normal:
	$(T) env FM1_WASI_SDK="$(FM1_WASI_SDK)" $(NICE) $(PYTHON) -I tools/linux/build-web.py --simulator-only \
	    --wasm-out build/web-normal $(DV)

backup-test: web-normal web-diag web-old536
	$(T) $(NODE) tests/workbench/backup.mjs build/web-normal/simulator.wasm build/web-old536/simulator.wasm build/web-diag/simulator.wasm

# Task 08: web-smoke and midi-import-sim depend on `web` (phony) instead of the wasm file, so a
# source or display-version change rebuilds the simulator before the tests read it; build-web.py's
# cache makes an unchanged rebuild a 0.6 s hash check. Before, an existing wasm was never refreshed.
web-smoke: web
	$(T) $(NODE) tests/simulator-wasm-smoke.mjs build/web/simulator.wasm
	$(T) $(NODE) tests/display-version.mjs $(DISPLAY_VERSION)

# Host test build (Task 07: per object, with depfiles; was one gcc command over every source).
build/host/obj/%.o: %.c
	@mkdir -p $(dir $@)
	$(NICE) $(CC) $(HOST_FLAGS) -MMD -MP -c $< -o $@

build/host/smoke: $(HOST_OBJS)
	$(NICE) $(CC) $(HOST_FLAGS) $(HOST_OBJS) -lm -o $@

build/host-san/obj/%.o: %.c
	@mkdir -p $(dir $@)
	$(NICE) $(CC) $(HOST_FLAGS) $(SAN_FLAGS) -MMD -MP -c $< -o $@

build/host-san/smoke: $(HOST_SAN_OBJS)
	$(NICE) $(CC) $(HOST_FLAGS) $(SAN_FLAGS) $(HOST_SAN_OBJS) -lm -o $@

-include $(HOST_OBJS:.o=.d) $(HOST_SAN_OBJS:.o=.d)

# Task 05: the timed note module against the shared vectors, C (gcc, the module alone) and JS.
build/host/timed_note: tests/host/timed_note_test.c app/timed_note.c app/timed_note.h
	@mkdir -p build/host
	$(NICE) $(CC) -std=c11 -O1 -g -Wall -Wextra -Iapp app/timed_note.c tests/host/timed_note_test.c -o $@

build/host-san/timed_note: tests/host/timed_note_test.c app/timed_note.c app/timed_note.h
	@mkdir -p build/host-san
	$(NICE) $(CC) -std=c11 -O1 -g -Wall -Wextra $(SAN_FLAGS) -Iapp app/timed_note.c tests/host/timed_note_test.c -o $@

# Task 16 Goal 5 (branch mc707-phase2): the v3 clip module against the importer's blocks, C and JS, and the importer's v3 output.
build/host/clip_v3: tests/host/clip_v3_test.c app/clip_v3.c app/clip_v3.h app/timed_note.c app/timed_note.h
	@mkdir -p build/host
	$(NICE) $(CC) -std=c11 -O1 -g -Wall -Wextra -Iapp app/clip_v3.c app/timed_note.c tests/host/clip_v3_test.c -o $@

clip-v3-test:
	$(T) $(MAKE) --no-print-directory build/host/clip_v3
	$(T) $(NODE) tests/clip-v3/dump-v2.mjs
	$(T) ./build/host/clip_v3 build/clip-v3/fixtures-v2.bin build/clip-v3/fixtures-v3-c.bin
	$(T) $(NODE) tests/clip-v3/run.mjs
	$(T) $(NODE) tests/clip-v3/importer.mjs

timed-note-test:
	$(T) $(MAKE) --no-print-directory build/host/timed_note
	$(T) ./build/host/timed_note tests/timed-note/vectors.txt
	$(T) $(NODE) tests/timed-note/run.mjs

host-smoke:
	$(T) $(MAKE) --no-print-directory -j$(JOBS) build/host/smoke
	$(T) ./build/host/smoke

# Task 07: the host tests under the sanitizers, through the lock.
host-sanitize:
	$(LOCKED) host-sanitize-run

host-sanitize-run:
	$(T) $(MAKE) --no-print-directory -j$(JOBS) build/host-san/smoke build/host-san/timed_note
	$(T) ./build/host-san/smoke
	$(T) ./build/host-san/timed_note tests/timed-note/vectors.txt
	@echo "host-sanitize: smoke and timed_note passed under ASan+UBSan"

# Task 03 (f): the workbench's shared song write path (Node, no build needed).
workbench-test:
	$(T) $(NODE) tests/workbench/song-write.mjs
	$(T) $(NODE) tests/workbench/devices.mjs
	$(T) $(NODE) tests/workbench/transfer-radio.mjs build/web/simulator.wasm
	$(T) $(NODE) tests/workbench/rig-lead.mjs
	$(T) $(NODE) tests/workbench/manual-structure.mjs
	$(T) $(NODE) tests/workbench/help-banned.mjs
	$(T) $(NODE) tests/workbench/guide.mjs
	$(T) $(NODE) tests/workbench/rig-profile.mjs
	$(T) $(NODE) tests/workbench/midi-guide.mjs
	$(T) $(NODE) tests/workbench/update-ports.mjs
	$(T) $(NODE) tests/workbench/loader-tag.mjs
	$(T) $(NODE) tests/workbench/recover-page.mjs
	$(T) $(NODE) tests/workbench/update-safety.mjs
	$(T) $(PYTHON) -I tests/linux/midi-monitor-test.py
	$(T) $(PYTHON) -I tests/linux/builds-index-test.py

test: timed-note-test clip-v3-test host-smoke web-smoke workbench-test backup-test
	@echo "test: timed-note-test, host-smoke, web-smoke, workbench-test and backup-test passed"

# Task 07: the tier to run while working (no sanitizers, no lock, about 20 s cold and 3 s warm),
# and the full run before a flash or a release (through the lock; writes build/suite-passed.txt).
test-fast: timed-note-test clip-v3-test host-smoke web-smoke workbench-test midi-import-test backup-test
	@echo "test-fast: timed-note-test, host-smoke, web-smoke, workbench-test, midi-import-test and backup-test passed (no sanitizers; the full run is make suite)"

suite:
	$(LOCKED) suite-run

suite-run: crosscheck-run test midi-import-sim host-sanitize-run
	@{ echo "suite passed $$(date -u +%FT%TZ) at $$(git rev-parse --short HEAD) (crosscheck, test, midi-import-sim, host-sanitize)"; \
	   sha256sum build/$(MODEL)/sdk.elf "$(FWSC)" build/$(MODEL)/generated/app-image.bin; } | tee build/suite-passed.txt

# Task 07: the compile check and the lint (tools/linux/lint.sh reads the check's compile database).
check:
	$(T) $(NICE) $(PYTHON) -I $(BUILD) --model $(MODEL) --check-only --toolchain-kind native --toolchain "$(JIELI_LINUX)" $(DV) $(OPTS) $(A2OPT)

lint: check
	$(T) env MODEL=$(MODEL) LINT_JOBS=$(JOBS) LINT_SRCS="$(HOST_SRCS)" \
	    LINT_CFLAGS="$(filter-out $(HOST_WARN_OFF),$(HOST_FLAGS)) -Wno-attributes" $(NICE) tools/linux/lint.sh $(LINT)

profile:
	@tools/linux/timed.sh --report

# Task 02 (MIDI import): pure Node, no toolchain. Regenerates the fixture files first.
midi-import-test:
	$(T) $(NODE) tests/midi-import/make-fixtures.mjs >/dev/null
	$(T) $(NODE) tests/midi-import/run.mjs

# Task 02 Step 4: the imported Renoise export played through the wasm simulator (make web first).
midi-import-sim: web
	$(T) $(NODE) tests/midi-import/simulator.mjs build/web/simulator.wasm
	$(T) $(NODE) tests/workbench/row-events-sim.mjs build/web/simulator.wasm
	$(T) $(NODE) tests/workbench/launch-sim.mjs build/web/simulator.wasm
	$(T) $(NODE) tests/workbench/wrong-room-sim.mjs build/web/simulator.wasm

flash-budget:
	@# The analysis symbol map (per-file attribution of LTO-merged code) is built once per
	@# source state from a -fno-lto compile with the native toolchain; delete it to refresh.
	@if [ ! -f build/$(MODEL)/nolto.json ]; then \
	    $(T) $(NICE) $(PYTHON) -I tools/linux/flash-budget.py --model $(MODEL) --make-nolto-map build/$(MODEL)/nolto.json \
	        --clang "$(JIELI_LINUX)/common/bin/clang" --nm-native "$(JIELI_LINUX)/pi32v2/bin/nm" \
	        --objdump "$(JIELI_LINUX)/pi32v2/bin/objdump"; fi
	$(T) $(PYTHON) -I tools/linux/flash-budget.py --build-dir build/$(MODEL) --nm "$(JIELI_LINUX)/pi32v2/bin/nm" \
	    --nolto-map build/$(MODEL)/nolto.json --top 40

package-equivalence:
	@if command -v pwsh >/dev/null 2>&1; then \
	    pwsh -NoProfile -File tools/linux/package-pwsh.ps1 -Model $(MODEL) -Image build/$(MODEL)/generated/app-image.bin -Output build/$(MODEL)/generated/pwsh.fwsc && \
	    cmp build/$(MODEL)/generated/pwsh.fwsc build/$(MODEL)/generated/SMK37_$(shell echo $(MODEL) | tr a-z A-Z)_OPEN.fwsc && echo "package.py == Package.cs (byte identical)"; \
	else echo "SKIPPED: pwsh not installed (see docs/BUILD.md, PowerShell without the apt repo)."; fi

# Task 09: the MIDI authoring guide, generated from the Wrong Room profile and the device library
# (tools/linux/midi-guide.mjs, web/rig/guide.js); run after changing the profile, a definition or
# docs/MIDI-GUIDE.template.md. tests/workbench/midi-guide.mjs fails when the committed guide is stale.
midi-guide:
	$(T) $(NODE) tools/linux/midi-guide.mjs $(if $(DISPLAY_VERSION),--version "$(DISPLAY_VERSION)",)

# ---- Task 02: distribution package, static site, GitHub Pages and release ----------------
package:
	$(T) env FM1_WASI_SDK="$(FM1_WASI_SDK)" $(NICE) $(PYTHON) -I $(BUILD) --model $(MODEL) --package --toolchain-kind native \
	    --toolchain "$(JIELI_LINUX)" --source-url "$(FM1_SOURCE_URL)" $(DV) $(OPTS) $(A2OPT)
	@echo "Distribution: $(PACKAGE_HTML)  (source link: $(FM1_SOURCE_URL))"

hosted:
	$(T) env NODE="$(NODE)" $(PYTHON) -I tools/linux/publish-pages.py --model $(MODEL) --source-url "$(FM1_SOURCE_URL)"

release-assets:
	@test -f "$(FWSC)" -a -f "$(PACKAGE_HTML)" || { echo "run 'make package' first"; exit 1; }
	rm -rf "build/release/$(TAG)"; mkdir -p "build/release/$(TAG)"
	cp "$(FWSC)" "$(PACKAGE_HTML)" "build/release/$(TAG)/"
	cd "build/release/$(TAG)" && sha256sum SMK37_*_OPEN.fwsc SMK37-Open-Source.html > SHA256SUMS.txt && cat SHA256SUMS.txt

# Task 11: SITE_DIR=probe64 publishes into that subdirectory of gh-pages (the probe's page); a root
# publish keeps probe64/ (publish-pages.py v0.3).
SITE_DIR ?= .
publish: package hosted
	NODE="$(NODE)" $(PYTHON) -I tools/linux/publish-pages.py --model $(MODEL) --tag "$(TAG)" \
	    --source-url "$(FM1_SOURCE_URL)" --site-dir "$(SITE_DIR)" --push
	@echo "Pages: $(PAGES_URL)  (GitHub deploys the gh-pages branch within a minute or two)"

# Task 11: PRERELEASE=1 marks the release a pre-release (the probe); RELEASE_TITLE overrides the title.
PRERELEASE ?=
RELEASE_TITLE ?= $(TAG)
release: release-assets
	@test -f "docs/releases/$(TAG).md" || { echo "write docs/releases/$(TAG).md first"; exit 1; }
	gh release create "$(TAG)" --repo "$(GITHUB_REPO)" --verify-tag --title "$(RELEASE_TITLE)" \
	    $(if $(filter 1,$(PRERELEASE)),--prerelease,) --notes-file "docs/releases/$(TAG).md" "build/release/$(TAG)/"*

clean:
	git worktree remove --force build/gh-pages 2>/dev/null || true
	rm -rf build
	git worktree prune
