#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
#
# scripts/oc_nice.sh — "nice -n 19 COMMAND" behind the Orange Cat soak guard: the Makefile's $(NICE)
#
# Purpose
#   The Makefile puts $(NICE) in front of every compiler and builder call. Through this script each of those calls
#   asks scripts/oc_guard.sh first, so a build that is under way stops at its next command when a soak begins
#   (docs/DEV_CHECKS.md, the Orange Cat soak rule). Usage: scripts/oc_nice.sh COMMAND [ARGS...]
#
# Version: 0.1 (2026-11-24, docs/BUILD.md 69)
"$(dirname "$(readlink -f "$0")")/oc_guard.sh" "$(basename -- "${1:-command}")"; oc=$?; [ $oc -eq 0 ] || exit $(( oc == 64 ? 0 : oc ))   # OC-GUARD
exec nice -n 19 "$@"
