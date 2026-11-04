#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
# Shape and the analyzer check sets after tools/lint.sh of Orange Cat's dev-tools branch
# (Copyright (C) 2026 Kerem Kilic (Ellic Studio), GPL-3.0-only); rewritten for this layout.
#
# tools/linux/lint.sh — the compilers' warnings on the sources, counted by file (make lint, Task 07)
#
# Purpose
#   Classic Tabby's builds show no warnings: the firmware build runs the target compiler with
#   -Wuninitialized only, and the host test build silences four groups. This script reads the same
#   sources with the warnings on and counts what they say, as a report (never a gate: exit 1 only
#   when a file does not compile at all). Three passes, the first two in about two seconds:
#
#     1. host gcc, -fsyntax-only, -Wall -Wextra, one file at a time over the host test sources
#        (LINT_SRCS: app/, web/, third_party/synth minus app/board; the Makefile passes the list and
#        the flags of its host build with the -Wno-* suppressions taken out except -Wno-attributes,
#        since the clang-only "minsize" attribute alone is 69 lines of noise). One line per
#        diagnostic in build/host/lint.txt.
#     2. the target compiler (the native JieLi clang) with -Wall -Wextra added to the build's own
#        options, -fsyntax-only, over the 16 firmware units, read from the compile database that
#        `make check` wrote (build/check/<model>/compile_commands.json). This is the compiler whose
#        opinion counts for the device. build/host/lint-target.txt.
#     3. optional, slower: --cppcheck (cppcheck, warning and portability checks, about a minute)
#        and --tidy (clang-tidy, bugprone-* and clang-analyzer-*, about a minute) over the host
#        compile database build/check/<model>/compile_commands.host.json (the same commands with
#        the pi32v2-only flags removed; tools/linux/build.py v0.6). build/host/cppcheck.txt,
#        build/host/tidy.txt. Either tool missing: a line says so, nothing fails.
#
#   Every pass prints its count, the counts by file and by kind, and its time. At most LINT_JOBS
#   compiles run at once (default 2: the machine's rule).
#
# Usage (normally through make)
#   make lint                                    passes 1 and 2
#   make lint LINT="--cppcheck --tidy"           plus the analyzers
#   LINT_SRCS="..." LINT_CFLAGS="..." MODEL=pro tools/linux/lint.sh [--cppcheck] [--tidy] [--jobs N]
#
# Version: 0.1
#
# Revision log
#   v0.1  2026-11-04  Task 07 Step 2: initial version. Counts at the start (linux-build 56b09d3):
#                     pass 1: 11 distinct warnings, none in app/ (web/synth and third_party/synth:
#                     misleading-indentation, array-parameter); pass 2: 3 (app/board/scan.c:369
#                     unused variable; app/screen.c:1570 and :2346 missing field initializer);
#                     cppcheck: app/screen.c:107 arrayIndexOutOfBoundsCond, app/project.c:750 uninitvar;
#                     clang-tidy: 13 (docs/DEV_CHECKS.md lists them). Line numbers as of linux-build
#                     8114114 (after Task 06).
set -u
cd "$(dirname "$0")/../.."
MODEL=${MODEL:-pro}
JOBS=${LINT_JOBS:-2}
CPPCHECK=0 TIDY=0
while [ $# -gt 0 ]; do
    case $1 in
        --cppcheck) CPPCHECK=1 ;;
        --tidy) TIDY=1 ;;
        --jobs) JOBS=$2; shift ;;
        *) echo "tools/linux/lint.sh: unknown option $1 (--cppcheck, --tidy, --jobs N)" >&2; exit 2 ;;
    esac
    shift
done
OUT=build/host
mkdir -p "$OUT"
DB=build/check/$MODEL/compile_commands.json
HOSTDB=build/check/$MODEL/compile_commands.host.json
[ -f "$DB" ] || { echo "tools/linux/lint.sh: no $DB; run make check first" >&2; exit 2; }

# Defaults when run by hand: the Makefile's host sources and flags (the Makefile is the source of truth).
if [ -z "${LINT_SRCS:-}" ]; then
    LINT_SRCS=$(find app web third_party/synth -name '*.c' ! -path 'app/board/*' | sort | tr '\n' ' ')
fi
if [ -z "${LINT_CFLAGS:-}" ]; then
    LINT_CFLAGS="-std=c11 -O1 -g -fwrapv -fno-fast-math -ffp-contract=off -DFM1_HOST_TEST -DFM1_OPEN_WEB -Wall -Wextra -Wno-attributes -Iweb/engine -Iweb/synth -Ithird_party/synth -Isdk/include -Iapp/synth -Iapp"
fi
CC=${CC:-gcc}

# (v0.1) every pattern allows a space in the path: the target compiler prints absolute paths, and the
# repository lives under "Classic Tabby"; the paths are made relative to the repository first.
count_by() {   # $1: file of "path:line:col: kind: text [id]" lines. Prints the counts by file and by kind.
    echo "  by file:"
    grep -oE '^[^:]+' "$1" | sort | uniq -c | sort -rn | awk '{n=$1; $1=""; sub(/^ /, ""); printf "  %5d  %s\n", n, $0}'
    echo "  by kind:"
    grep -oE '\[[-A-Za-z0-9_.,=]+\]$' "$1" | sort | uniq -c | sort -rn | awk '{printf "  %5d  %s\n", $1, $2}'
}

status=0

# ---- pass 1: host gcc, one file at a time -----------------------------------------------------
t0=$(date +%s.%N)
raw=$OUT/lint.raw; : > "$raw"
# shellcheck disable=SC2086
printf '%s\n' $LINT_SRCS | xargs -P "$JOBS" -I{} sh -c "$CC $LINT_CFLAGS -fsyntax-only {} 2>> $raw || echo 'LINT-ERROR {}' >> $raw"
sed "s#^$PWD/##" "$raw" | grep -E '^[^:]+:[0-9]+:[0-9]+: (warning|error): ' | sort -u > "$OUT/lint.txt"
nwarn=$(grep -c ': warning: ' "$OUT/lint.txt" || true)
nerr=$(grep -c ': error: ' "$OUT/lint.txt" || true)
nfail=$(grep -c '^LINT-ERROR' "$raw" || true)
printf 'lint 1, host %s -Wall -Wextra over %d files: %d warnings, %d errors, %.1f s; the lines in %s\n' \
    "$CC" "$(echo "$LINT_SRCS" | wc -w)" "$nwarn" "$nerr" "$(echo "$(date +%s.%N) - $t0" | bc)" "$OUT/lint.txt"
count_by "$OUT/lint.txt"
[ "$nerr" = 0 ] && [ "$nfail" = 0 ] || { echo "errors:"; grep -E ': error: |^LINT-ERROR' "$OUT/lint.txt" "$raw" | head -20; status=1; }

# ---- pass 2: the target compiler with -Wall -Wextra, from the check's compile database ---------
t0=$(date +%s.%N)
python3 -I - "$DB" "$OUT/lint-target.raw" <<'PY'
import json, subprocess, sys
db = json.load(open(sys.argv[1]))
with open(sys.argv[2], "w") as raw:
    for e in db:
        args, skip = [], False
        for x in e["arguments"]:
            if skip: skip = False; continue
            if x in ("-MF", "-o"): skip = True; continue
            if x in ("-MMD", "-c"): continue
            args.append(x)
        r = subprocess.run(args + ["-fsyntax-only", "-Wall", "-Wextra"], cwd=e["directory"], capture_output=True, text=True)
        raw.write(r.stderr)
        if r.returncode:
            raw.write("LINT-ERROR %s\n" % e["file"])
PY
sed "s#^$PWD/##" "$OUT/lint-target.raw" | grep -E '^[^:]+:[0-9]+:[0-9]+: (warning|error): ' | sort -u > "$OUT/lint-target.txt"
nwarn=$(grep -c ': warning: ' "$OUT/lint-target.txt" || true)
nerr=$(grep -c '^LINT-ERROR' "$OUT/lint-target.raw" || true)
printf 'lint 2, target clang -Wall -Wextra over %d units: %d warnings, %d errors, %.1f s; the lines in %s\n' \
    "$(python3 -I -c 'import json,sys; print(len(json.load(open(sys.argv[1]))))' "$DB")" "$nwarn" "$nerr" \
    "$(echo "$(date +%s.%N) - $t0" | bc)" "$OUT/lint-target.txt"
count_by "$OUT/lint-target.txt"
[ "$nerr" = 0 ] || { echo "errors:"; grep -B3 '^LINT-ERROR' "$OUT/lint-target.raw" | head -20; status=1; }

# ---- pass 3: the analyzers over the host compile database ---------------------------------------
if [ $CPPCHECK = 1 ]; then
    if command -v cppcheck >/dev/null 2>&1; then
        t0=$(date +%s.%N)
        # warning and portability: the checks that find bugs (uninitialised, out of bounds, null, shifts), not style
        cppcheck --project="$HOSTDB" --enable=warning,portability --inline-suppr --quiet -j "$JOBS" \
            --suppress=missingIncludeSystem --suppress=unknownMacro \
            --template='{file}:{line}:{column}: {severity}: {message} [{id}]' 2> "$OUT/cppcheck.raw" >/dev/null
        sed "s#^$PWD/##" "$OUT/cppcheck.raw" | grep -E '^[^:]+:[0-9]+:[0-9]+: (warning|error|portability): ' | sort -u > "$OUT/cppcheck.txt"
        printf 'lint 3a, cppcheck (warning, portability): %d findings, %.1f s; the lines in %s\n' \
            "$(wc -l < "$OUT/cppcheck.txt")" "$(echo "$(date +%s.%N) - $t0" | bc)" "$OUT/cppcheck.txt"
        count_by "$OUT/cppcheck.txt"
    else
        echo "lint 3a, cppcheck: not installed (sudo apt-get install cppcheck)"
    fi
fi
if [ $TIDY = 1 ]; then
    if command -v clang-tidy >/dev/null 2>&1; then
        t0=$(date +%s.%N)
        # bugprone and the static analyzer minus the style checks (the sets Orange Cat's lint.sh settled on);
        # a fixed-address dereference is every memory-mapped register of app/board (SMK_REG, the SFR structs)
        CHECKS='-*,bugprone-*,clang-analyzer-*,-bugprone-easily-swappable-parameters,-bugprone-narrowing-conversions,-bugprone-implicit-widening-of-multiplication-result,-bugprone-reserved-identifier,-bugprone-branch-clone,-bugprone-multi-level-implicit-pointer-conversion,-bugprone-assignment-in-if-condition,-bugprone-macro-parentheses,-bugprone-switch-missing-default-case,-clang-analyzer-optin.*,-clang-analyzer-security.insecureAPI.*,-clang-analyzer-core.FixedAddressDereference'
        # clang-tidy -p takes a directory and reads its compile_commands.json, so the host database is
        # staged under its own directory (build/host/tidy-db/) where that name means the host one.
        mkdir -p "$OUT/tidy-db" && cp "$HOSTDB" "$OUT/tidy-db/compile_commands.json"
        python3 -I - "$OUT/tidy-db/compile_commands.json" "$OUT/tidy.raw" "$CHECKS" "$JOBS" <<'PY'
import json, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
db = json.load(open(sys.argv[1])); checks = sys.argv[3]; jobs = int(sys.argv[4])
d = sys.argv[1].rsplit("/", 1)[0]
def one(e):
    return subprocess.run(["clang-tidy", "-p", d, "-checks=" + checks, "-header-filter=.*/app/.*", "--quiet", e["file"]],
                          capture_output=True, text=True).stdout
with ThreadPoolExecutor(jobs) as pool, open(sys.argv[2], "w") as raw:
    for text in pool.map(one, db):
        raw.write(text)
PY
        sed "s#^$PWD/##" "$OUT/tidy.raw" | grep -E '^[^:]+:[0-9]+:[0-9]+: (warning|error): ' | sort -u > "$OUT/tidy.txt"
        printf 'lint 3b, clang-tidy (bugprone-*, clang-analyzer-*): %d findings, %.1f s; the lines in %s\n' \
            "$(wc -l < "$OUT/tidy.txt")" "$(echo "$(date +%s.%N) - $t0" | bc)" "$OUT/tidy.txt"
        count_by "$OUT/tidy.txt"
        nerr=$(grep -c ': error: ' "$OUT/tidy.txt" || true)
        [ "$nerr" = 0 ] || { echo "  clang-tidy could not parse some units (errors above): read $OUT/tidy.txt"; }
    else
        echo "lint 3b, clang-tidy: not installed (sudo apt-get install clang-tidy)"
    fi
fi
exit $status
