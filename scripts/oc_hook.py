#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
scripts/oc_hook.py — the Orange Cat soak rule for Claude Code's own ad-hoc commands (a PreToolUse hook)

Purpose
    scripts/oc_guard.* stop every entry point of the repository while /tmp/oc-soak-running exists. A command typed
    by hand (or by Claude) that is not one of those entry points would pass them by: an amidi line, a python one-liner
    that opens the SMK-37 port, a chrome call. This hook reads the Bash command Claude Code is about to run (the
    hook's JSON on stdin: tool_name, tool_input.command) and, while the file exists, blocks it (exit code 2, the
    reason on stderr, which Claude Code shows to the model) when it would run make, a build, a test, a browser, node,
    amidi or another ALSA MIDI tool, a publish or a push, or anything that opens the SMK-37 or the H4MIDI port.
    Reading and editing files stays possible. No override. It is wired in .claude/settings.json (PreToolUse, Bash).

    This file does NOT call oc_guard.check(): it must run during a soak, to say no. make test-oc-guard knows it.

Usage
    echo '{"tool_name":"Bash","tool_input":{"command":"make suite"}}' | python3 scripts/oc_hook.py ; echo $?
    For make test-oc-guard only: OC_GUARD_TEST_FLAG=path (a SECOND file that blocks; the real one always counts).

Version: 0.1

Revision log
    v0.1  2026-11-24  First version (docs/BUILD.md 69).
"""
import json
import os
import re
import sys

FLAG = "/tmp/oc-soak-running"

# a command word at the start of the line or after ; & | ( ` $( or a newline, optionally behind env/sudo/timeout/nice/xargs
START = r"(?:^|[;&|(`\n]|\$\()\s*(?:(?:env|sudo|nice|ionice|timeout|xargs|time|nohup|setsid|stdbuf|taskset|command|exec)\s+(?:-\S+\s+|\S+=\S+\s+|\d+\S*\s+)*)*(?:\S+=\S+\s+)*"
ALWAYS = [
    (r"(?:\S*/)?g?make\b", "make"),
    (r"(?:\S*/)?(?:node|nodejs|npx|npm|pnpm|yarn|deno|bun)\b", "node"),
    (r"(?:\S*/)?(?:google-chrome\S*|chromium\S*|chrome|firefox|playwright)\b", "a browser"),
    (r"(?:\S*/)?(?:amidi|aplaymidi|arecordmidi|aseqdump|aconnect|amixer|arecord|aplay|sendmidi|receivemidi)\b", "an ALSA MIDI tool"),
    (r"(?:\S*/)?(?:wine\S*|clang\S*|gcc\S*|cc|g\+\+|ld|cmake|ninja|emcc|pwsh|powershell)\b", "a build tool"),
    (r"(?:\S*/)?gh\s+(?:release|workflow|run|api|pr|repo)\b", "a publish (gh)"),
    (r"git\s+(?:-\S+\s+(?:\S+\s+)?)*(?:push|tag\s+-a|worktree)\b", "a publish (git)"),
    (r"(?:bash|sh|zsh|dash|source|\.)\s+(?:-\S+\s+)*\S*(?:tools|scripts|tests)/\S+", "a script of the repository"),
    (r"(?:\./|\S*/)?(?:tools|scripts|tests)/\S+\.(?:sh|py|mjs|cjs|js|ps1)\b", "a script of the repository"),
    (r"(?:\S*/)?build/\S+", "a built program"),
]
# python is also how files are edited: blocked when the command names anything that builds, tests, browses, publishes
# or reaches a device
PYTHON = r"(?:\S*/)?python[0-9.]*\b"
PYTHON_WORDS = r"tabby_link|midi|snd_|/dev/snd|rawmidi|\bLink\(|\bMonitor\(|subprocess|os\.system|os\.popen|Popen|pexpect|tools/|tests/|scripts/|\bmake\b|\bnode\b|chrome|chromium|playwright|wine|socket|urllib|requests|http\.client|webbrowser|H4MIDI|SMK"
ANYWHERE = [
    (r"/dev/(?:snd|midi|ttyACM|ttyUSB|hidraw|bus/usb)", "a device node"),
    (r"release-flow\.sh|rc-validate\.py|workbench\.mjs|run-[a-z0-9]+\.py|tabby_link", "a tool that reaches the SMK-37"),
]


def blocked():
    if os.path.exists(FLAG):
        return FLAG
    extra = os.environ.get("OC_GUARD_TEST_FLAG")
    if extra and os.path.exists(extra):
        return extra
    return None


def reason(command):
    for pattern, what in ALWAYS:
        if re.search(START + pattern, command):
            return what
    if re.search(START + PYTHON, command) and re.search(PYTHON_WORDS, command):
        return "python that builds, tests, browses, publishes or reaches a device"
    for pattern, what in ANYWHERE:
        if re.search(pattern, command):
            return what
    return None


def main():
    path = blocked()
    if not path:
        return 0
    try:
        event = json.load(sys.stdin)
    except Exception:
        event = {}
    if event.get("tool_name") not in (None, "Bash"):
        return 0
    command = str((event.get("tool_input") or {}).get("command") or "")
    what = reason(command)
    if not what:
        return 0
    sys.stderr.write("Orange Cat soak running (%s). Refusing to start %s. Nothing of Classic Tabby starts while that file exists "
                     "(no build, test, browser, publish, promote, install, or access to the SMK-37 or the H4MIDI); there is no "
                     "override: wait until the file is gone (scripts/oc_guard.sh --waiting).\n" % (path, what))
    return 2


if __name__ == "__main__":
    sys.exit(main())
