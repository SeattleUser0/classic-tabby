#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
#
# tools/linux/crosscheck-compare.sh — Track A against Track B, byte for byte (make crosscheck)
#
# Purpose
#   After both tracks are built (build/ref/<model>/ by the Windows toolchain under Wine, build/<model>/
#   by the native Linux toolchain), compare the SHA-256 of sdk.elf, the .fwsc package and the raw app
#   image. Exit 1 if any differs. This is the comparison loop that lived in the Makefile's crosscheck
#   recipe (Makefile v0.1 to v0.8), moved here unchanged so the recipe is one timed command (Task 07).
#
# Usage
#   tools/linux/crosscheck-compare.sh [MODEL]      MODEL = pro (default) or elite
#
# Version: 0.1
#
# Revision log
#   v0.1  2026-11-04  Task 07 Step 2: moved out of the Makefile; same files, same output lines.
set -u
model=${1:-pro}
upper=$(echo "$model" | tr a-z A-Z)
fail=
for f in sdk.elf "generated/SMK37_${upper}_OPEN.fwsc" generated/app-image.bin; do
    a=$(sha256sum "build/ref/$model/$f" | cut -c1-64)
    b=$(sha256sum "build/$model/$f" | cut -c1-64)
    if [ "$a" = "$b" ]; then echo "IDENTICAL  $f  $a"; else echo "DIFFERS    $f  A=$a  B=$b"; fail=1; fi
done
[ -z "$fail" ] || { echo "crosscheck FAILED"; exit 1; }
echo "crosscheck passed"
