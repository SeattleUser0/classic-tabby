#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
#
# tools/linux/timed.sh — one timing line per make command into build/profile.txt (Task 07)
#
# Purpose
#   The Makefile prefixes the commands of its targets with "$(T)" = "tools/linux/timed.sh <target>".
#   This script runs the command unchanged, with the caller's stdin/stdout/stderr and exit status,
#   and appends one line to the profile:
#
#       2026-11-04T10:00:00Z  crosscheck        17.1 s  rc=0  load=2.31  python3 -I tools/linux/build.py ...
#
#   so that every run of every target leaves its wall time behind. Nothing else changes: the
#   command sees the same arguments, environment and working directory.
#
# Usage
#   tools/linux/timed.sh TARGET COMMAND [ARGS...]     run and record
#   tools/linux/timed.sh --report [N]                 the last N lines (default 40) and, for the targets
#                                                     in them, the sum of their seconds (make profile)
#   TABBY_PROFILE=path                                 the profile file (default build/profile.txt)
#
# Version: 0.1
#
# Revision log
#   v0.1  2026-11-04  Task 07 Step 2: initial version. The shape of the line follows Orange Cat's
#                     build/host/profile.txt (docs/DEV_CHECKS.md on its dev-tools branch), reduced to
#                     one line per command since Classic Tabby's targets are single commands.
set -u
PROFILE=${TABBY_PROFILE:-build/profile.txt}

if [ "${1:-}" = "--report" ]; then
    n=${2:-40}
    [ -f "$PROFILE" ] || { echo "no profile yet ($PROFILE): run a make target first"; exit 0; }
    echo "== last $n lines of $PROFILE"
    tail -n "$n" "$PROFILE"
    echo "== seconds per target over those lines"
    tail -n "$n" "$PROFILE" | awk '{ s[$2] += $3; c[$2]++ } END { for (t in s) printf "  %8.1f s  %3d cmd  %s\n", s[t], c[t], t }' | sort -rn
    exit 0
fi

target=${1:?usage: timed.sh TARGET COMMAND...}; shift
target=${target%-run}      # the Makefile's locked targets do their work in a "-run" twin; one name in the profile
mkdir -p "$(dirname "$PROFILE")"
start=$(date +%s.%N)
"$@"
rc=$?
end=$(date +%s.%N)
# the command's first words, enough to tell the lines of a multi-command target apart
head=$(printf '%s ' "$@" | cut -c1-80)
printf '%s  %-18s %7.1f s  rc=%d  load=%s  %s\n' "$(date -u +%FT%TZ)" "$target" "$(echo "$end - $start" | bc)" "$rc" \
    "$(cut -d' ' -f1 /proc/loadavg)" "$head" >> "$PROFILE"
exit $rc
