#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
#
# scripts/oc_guard.sh — the Orange Cat soak guard (shell)
#
# Purpose
#   THE RULE (the user, 2026-11-24): while /tmp/oc-soak-running exists, nothing of Classic Tabby starts: no build, no
#   test (host, simulator or device), no browser, no publish or promote, no install, no read or write to the SMK-37 or
#   the H4MIDI. The file is what counts, not the clock. There is no override: what must run during a soak waits.
#   Every entry point calls this guard first (the Makefile at parse time, every script for itself), and long runs
#   call it again between their steps.
#
# Usage
#   scripts/oc_guard.sh NAME        exit 0 when no soak runs; exit 75 with
#                                   "Orange Cat soak running (/tmp/oc-soak-running). Refusing to start NAME."
#   scripts/oc_guard.sh --waiting   exit 0 at once when no soak runs, else wait (asking every 30 s) until the file is
#                                   gone, then exit 0: for a queued job, BEFORE it starts anything
#
#   For make test-oc-guard only (tests/linux/oc-guard-test.py); neither can let anything run during a soak:
#     OC_GUARD_TEST_FLAG=path   a SECOND file that blocks as well (the real one is always looked at)
#     OC_GUARD_TEST_STOP=1      when nothing blocks: say "oc-guard: passed NAME" and make the caller stop there
#                               (exit 64 from this script; the callers end their run on it)
#
# Version: 0.1
#
# Revision log
#   v0.1  2026-11-24  First version, after two breaches in the night of 2026-11-23 (docs/BUILD.md 69).
OC_FLAG=/tmp/oc-soak-running
oc_blocked() {
    if [ -e "$OC_FLAG" ]; then echo "$OC_FLAG"; return 0; fi
    if [ -n "${OC_GUARD_TEST_FLAG:-}" ] && [ -e "$OC_GUARD_TEST_FLAG" ]; then echo "$OC_GUARD_TEST_FLAG"; return 0; fi
    return 1
}
name=${1:-a command}
if [ "$name" = "--waiting" ]; then
    while f=$(oc_blocked); do sleep 30; done
    exit 0
fi
name=$(basename -- "$name")
[ $# -gt 1 ] && name="$name ${*:2}"
if f=$(oc_blocked); then
    echo "Orange Cat soak running ($f). Refusing to start $name." >&2
    exit 75
fi
if [ "${OC_GUARD_TEST_STOP:-}" = "1" ]; then
    echo "oc-guard: passed $name" >&2
    exit 64
fi
exit 0
