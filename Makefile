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
# Version: 0.9
#
# Revision log
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

BUILD      := tools/linux/build.py
NATIVE     := $(PYTHON) -I $(BUILD) --model $(MODEL) --firmware-only --toolchain-kind native --toolchain "$(JIELI_LINUX)"
WINE       := $(PYTHON) -I $(BUILD) --model $(MODEL) --firmware-only --toolchain-kind wine --toolchain "$(JIELI_WIN)" --wine-prefix "$(WINEPREFIX)"

.PHONY: help verify firmware firmware-native firmware-ref crosscheck web web-smoke host-smoke test flash-budget package-equivalence \
        package hosted release-assets publish release clean midi-import-test midi-import-sim workbench-test timed-note-test

# Host test build: the same source set and defines as the WASI simulator build in
# tools/linux/build-web.py (Build-Web.ps1 L78-L83), compiled natively. gcc does not know
# clang's minsize attribute and warns about third_party indentation, so -Werror is not
# used here (it stays on in the wasm build). CC=clang works too when clang is installed.
HOST_SRCS  := $(shell find app web third_party/synth -name '*.c' ! -path 'app/board/*' | sort)
HOST_FLAGS := -std=c11 -O1 -g -fwrapv -fno-fast-math -ffp-contract=off -DFM1_HOST_TEST -DFM1_OPEN_WEB \
              -Wall -Wextra -Wno-unused-function -Wno-array-parameter -Wno-attributes -Wno-misleading-indentation \
              -Iweb/engine -Iweb/synth -Ithird_party/synth -Isdk/include -Iapp/synth -Iapp

help:
	@sed -n '7,53p' Makefile | sed 's/^#   //; s/^#//'

verify:
	$(PYTHON) -I $(BUILD) --verify-only --toolchain-kind native --toolchain "$(JIELI_LINUX)"
	@if [ -f "$(JIELI_WIN)/bin/clang.exe" ]; then \
	    $(PYTHON) -I $(BUILD) --verify-only --toolchain-kind wine --toolchain "$(JIELI_WIN)" --wine-prefix "$(WINEPREFIX)"; \
	else echo "Track A toolchain not present at $(JIELI_WIN); Windows toolchain hashes not checked."; fi

firmware: firmware-native

firmware-native:
	$(NATIVE)

firmware-ref:
	$(WINE) --build-root build/ref

crosscheck: firmware-native firmware-ref
	@echo "== Track A (Wine, reference) vs Track B (native)"
	@for f in sdk.elf generated/SMK37_$(shell echo $(MODEL) | tr a-z A-Z)_OPEN.fwsc generated/app-image.bin; do \
	    a=$$(sha256sum "build/ref/$(MODEL)/$$f" | cut -c1-64); b=$$(sha256sum "build/$(MODEL)/$$f" | cut -c1-64); \
	    if [ "$$a" = "$$b" ]; then echo "IDENTICAL  $$f  $$a"; else echo "DIFFERS    $$f  A=$$a  B=$$b"; fail=1; fi; \
	done; [ -z "$$fail" ] || { echo "crosscheck FAILED"; exit 1; }; echo "crosscheck passed"

web:
	FM1_WASI_SDK="$(FM1_WASI_SDK)" $(PYTHON) -I tools/linux/build-web.py --local-preview
	@echo "Open with: google-chrome \"file://$(CURDIR)/build/preview/index.html\""

build/web/simulator.wasm:
	$(MAKE) web

web-smoke: build/web/simulator.wasm
	$(NODE) tests/simulator-wasm-smoke.mjs build/web/simulator.wasm

build/host/smoke: tests/host/smoke.c $(HOST_SRCS)
	@mkdir -p build/host
	$(CC) $(HOST_FLAGS) $(HOST_SRCS) tests/host/smoke.c -lm -o $@

# Task 05: the timed note module against the shared vectors, C (gcc, the module alone) and JS.
build/host/timed_note: tests/host/timed_note_test.c app/timed_note.c app/timed_note.h
	@mkdir -p build/host
	$(CC) -std=c11 -O1 -g -Wall -Wextra -Iapp app/timed_note.c tests/host/timed_note_test.c -o $@

timed-note-test: build/host/timed_note
	./build/host/timed_note tests/timed-note/vectors.txt
	$(NODE) tests/timed-note/run.mjs

host-smoke: build/host/smoke
	./build/host/smoke

# Task 03 (f): the workbench's shared song write path (Node, no build needed).
workbench-test:
	$(NODE) tests/workbench/song-write.mjs
	$(NODE) tests/workbench/devices.mjs
	$(NODE) tests/workbench/transfer-radio.mjs build/web/simulator.wasm
	$(NODE) tests/workbench/rig-lead.mjs

test: timed-note-test host-smoke web-smoke workbench-test
	@echo "test: timed-note-test, host-smoke, web-smoke and workbench-test passed"

# Task 02 (MIDI import): pure Node, no toolchain. Regenerates the fixture files first.
midi-import-test:
	$(NODE) tests/midi-import/make-fixtures.mjs >/dev/null && $(NODE) tests/midi-import/run.mjs

# Task 02 Step 4: the imported Renoise export played through the wasm simulator (make web first).
midi-import-sim:
	$(NODE) tests/midi-import/simulator.mjs build/web/simulator.wasm
	$(NODE) tests/workbench/row-events-sim.mjs build/web/simulator.wasm
	$(NODE) tests/workbench/launch-sim.mjs build/web/simulator.wasm

flash-budget:
	@# The analysis symbol map (per-file attribution of LTO-merged code) is built once per
	@# source state from a -fno-lto compile with the native toolchain; delete it to refresh.
	@if [ ! -f build/$(MODEL)/nolto.json ]; then \
	    $(PYTHON) -I tools/linux/flash-budget.py --model $(MODEL) --make-nolto-map build/$(MODEL)/nolto.json \
	        --clang "$(JIELI_LINUX)/common/bin/clang" --nm-native "$(JIELI_LINUX)/pi32v2/bin/nm" \
	        --objdump "$(JIELI_LINUX)/pi32v2/bin/objdump"; fi
	$(PYTHON) -I tools/linux/flash-budget.py --build-dir build/$(MODEL) --nm "$(JIELI_LINUX)/pi32v2/bin/nm" \
	    --nolto-map build/$(MODEL)/nolto.json --top 40

package-equivalence:
	@if command -v pwsh >/dev/null 2>&1; then \
	    pwsh -NoProfile -File tools/linux/package-pwsh.ps1 -Model $(MODEL) -Image build/$(MODEL)/generated/app-image.bin -Output build/$(MODEL)/generated/pwsh.fwsc && \
	    cmp build/$(MODEL)/generated/pwsh.fwsc build/$(MODEL)/generated/SMK37_$(shell echo $(MODEL) | tr a-z A-Z)_OPEN.fwsc && echo "package.py == Package.cs (byte identical)"; \
	else echo "SKIPPED: pwsh not installed (see docs/BUILD.md, PowerShell without the apt repo)."; fi

# ---- Task 02: distribution package, static site, GitHub Pages and release ----------------
package:
	FM1_WASI_SDK="$(FM1_WASI_SDK)" $(PYTHON) -I $(BUILD) --model $(MODEL) --package --toolchain-kind native \
	    --toolchain "$(JIELI_LINUX)" --source-url "$(FM1_SOURCE_URL)"
	@echo "Distribution: $(PACKAGE_HTML)  (source link: $(FM1_SOURCE_URL))"

hosted:
	NODE="$(NODE)" $(PYTHON) -I tools/linux/publish-pages.py --model $(MODEL) --source-url "$(FM1_SOURCE_URL)"

release-assets:
	@test -f "$(FWSC)" -a -f "$(PACKAGE_HTML)" || { echo "run 'make package' first"; exit 1; }
	rm -rf "build/release/$(TAG)"; mkdir -p "build/release/$(TAG)"
	cp "$(FWSC)" "$(PACKAGE_HTML)" "build/release/$(TAG)/"
	cd "build/release/$(TAG)" && sha256sum SMK37_*_OPEN.fwsc SMK37-Open-Source.html > SHA256SUMS.txt && cat SHA256SUMS.txt

publish: package hosted
	NODE="$(NODE)" $(PYTHON) -I tools/linux/publish-pages.py --model $(MODEL) --tag "$(TAG)" \
	    --source-url "$(FM1_SOURCE_URL)" --push
	@echo "Pages: $(PAGES_URL)  (GitHub deploys the gh-pages branch within a minute or two)"

release: release-assets
	@test -f "docs/releases/$(TAG).md" || { echo "write docs/releases/$(TAG).md first"; exit 1; }
	gh release create "$(TAG)" --repo "$(GITHUB_REPO)" --verify-tag --title "$(TAG)" \
	    --notes-file "docs/releases/$(TAG).md" "build/release/$(TAG)/"*

clean:
	git worktree remove --force build/gh-pages 2>/dev/null || true
	rm -rf build
	git worktree prune
