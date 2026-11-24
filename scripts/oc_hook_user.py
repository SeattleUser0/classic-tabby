#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
scripts/oc_hook_user.py — the Orange Cat soak rule as a USER-LEVEL Claude Code hook, for Classic Tabby's commands only

Purpose
    scripts/oc_hook.py is the hook of this repository (.claude/settings.json): it loads in a session started inside
    the repository and blocks, during a soak, every command that builds, tests, browses, publishes or reaches a device.
    A session started somewhere else (the home directory) does not load it. This hook is installed in the USER's
    ~/.claude/settings.json, so it loads in every session on this computer, Orange Cat's included, and they must keep
    working during their own soaks. So it blocks ONLY while /tmp/oc-soak-running exists AND ONLY a command that is
    clearly Classic Tabby's:
      - it runs in the Classic Tabby directory (the hook's cwd), or goes there (cd, git -C, make -C), or names a path
        in it outside the text of a here-document;
      - it loads tabby_link, or runs workbench.mjs, rc-validate.py, release-flow.sh or another tool of the repository
        by a path in it;
      - it publishes for SeattleUser0/classic-tabby (gh, git, the pages);
      - it opens the SMK-37's MIDI port by name (amidi and the like with -p ... SMK37; a listing, amidi -l, is not that).
    and then only what the repository's hook would block (scripts/oc_hook.py reason()): reading a file of ours stays
    allowed. Generic amidi, node, python, make or Chrome, the shared ~/fm1-hw venv when it is not loading tabby_link,
    and everything under Orange Cat's repositories are never blocked by it. No override.

    Like oc_hook.py this file does not call oc_guard.check(): it must run during a soak. make test-oc-guard runs it
    against commands of ours (all blocked with the flag) and against real Orange Cat commands (all allowed).

Usage
    echo '{"tool_name":"Bash","cwd":"/home/userzero","tool_input":{"command":"..."}}' | python3 scripts/oc_hook_user.py
    For make test-oc-guard only: OC_GUARD_TEST_FLAG=path (a SECOND file that blocks; the real one always counts).

Version: 0.1

Revision log
    v0.1  2026-11-24  First version (the user's order of 2026-11-24; docs/BUILD.md 69.4).
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import oc_hook

OURS_DIR = r"/Documents/Classic\\? Tabby(?:/|\b)"
HEREDOC = re.compile(r"<<-?\s*(['\"]?)([A-Za-z_][A-Za-z0-9_]*)\1[^\n]*\n.*?\n\s*\2[ \t]*(?=\n|$)", re.S)
MARKS = [
    # a path in the Classic Tabby directory, outside the text of a here-document
    (re.compile(OURS_DIR), False, "a path in the Classic Tabby directory"),
    (re.compile(r"\bfirmware-(?:clipv3|timing|help-audit|devchecks|task02|diag-r2)\b"), False, "a Classic Tabby worktree"),
    # the repository's own tools
    (re.compile(r"\bimport\s+tabby_link\b|\btabby_link\s+as\b|\btabby_link\.py\b|\bfrom\s+tabby_link\b"), True, "tabby_link"),
    (re.compile(r"\bworkbench\.mjs\b|\brc-validate\.py\b|\brelease-flow\.sh\b|\bpanel-state\.py\b|\btools/linux/(?:hw/)?[A-Za-z0-9_.-]+\.(?:py|mjs|sh)\b"), False, "a tool of the Classic Tabby repository"),
    # publishing for our repository
    (re.compile(r"SeattleUser0/classic-tabby|seattleuser0\.github\.io/classic-tabby|classic-tabby\.git\b", re.I), False, "SeattleUser0/classic-tabby"),
    # the SMK-37's MIDI port opened by name
    (re.compile(r"\b(?:amidi|aplaymidi|arecordmidi|aseqdump|aconnect|sendmidi|receivemidi)\b[^;&|\n]*(?:-p|--port|-d|--dev)\s*=?\s*['\"]?[^;&|\n]*SMK-?37", re.I), True, "the SMK-37's MIDI port"),
]


def ours(command, cwd):
    """Why this command is Classic Tabby's, or None."""
    if cwd and re.search(OURS_DIR, cwd.rstrip("/") + "/"):
        return "it runs in the Classic Tabby directory"
    outside = HEREDOC.sub("\n", command)
    for pattern, in_heredocs_too, what in MARKS:
        if pattern.search(command if in_heredocs_too else outside):
            return what
    return None


def main():
    path = oc_hook.blocked()
    if not path:
        return 0
    try:
        event = json.load(sys.stdin)
    except Exception:
        return 0
    if event.get("tool_name") not in (None, "Bash"):
        return 0
    command = str((event.get("tool_input") or {}).get("command") or "")
    why = ours(command, str(event.get("cwd") or ""))
    if not why:
        return 0
    what = oc_hook.reason(command)
    if not what and why == "the SMK-37's MIDI port":
        what = "an ALSA MIDI tool on the SMK-37's port"
    if not what:
        return 0
    sys.stderr.write("Orange Cat soak running (%s). Refusing to start %s (a Classic Tabby command: %s). Nothing of Classic Tabby starts "
                     "while that file exists; there is no override: wait until the file is gone (scripts/oc_guard.sh --waiting).\n" % (path, what, why))
    return 2


if __name__ == "__main__":
    sys.exit(main())
