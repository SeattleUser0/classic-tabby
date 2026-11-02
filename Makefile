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
#                            with FM1_HOST_TEST, plus a Node check of the wasm   [Step 7]
#     make flash-budget      docs tables from the current build/<MODEL>/ (read only)
#     make package-equivalence  Package.cs (pwsh) vs package.py byte comparison; skipped
#                            with a message when pwsh is not installed
#     make clean             remove build/
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
# Version: 0.2
#
# Revision log
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

BUILD      := tools/linux/build.py
NATIVE     := $(PYTHON) -I $(BUILD) --model $(MODEL) --firmware-only --toolchain-kind native --toolchain "$(JIELI_LINUX)"
WINE       := $(PYTHON) -I $(BUILD) --model $(MODEL) --firmware-only --toolchain-kind wine --toolchain "$(JIELI_WIN)" --wine-prefix "$(WINEPREFIX)"

.PHONY: help verify firmware firmware-native firmware-ref crosscheck web web-smoke flash-budget package-equivalence clean

help:
	@sed -n '7,30p' Makefile | sed 's/^#   //; s/^#//'

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

web-smoke:
	$(NODE) tests/simulator-wasm-smoke.mjs build/web/simulator.wasm

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

clean:
	rm -rf build
