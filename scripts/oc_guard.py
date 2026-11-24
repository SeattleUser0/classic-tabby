# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
scripts/oc_guard.py — the Orange Cat soak guard (Python)

Purpose
    THE RULE (the user, 2026-11-24): while /tmp/oc-soak-running exists, nothing of Classic Tabby starts: no build, no
    test (host, simulator or device), no browser, no publish or promote, no install, no read or write to the SMK-37 or
    the H4MIDI. The file is what counts, not the clock. There is no override: what must run during a soak waits.
    scripts/oc_guard.sh is the same guard for shell and make, scripts/oc_guard.mjs and .cjs for node.

    check()        the first statement of every Python script (after its docstring): exits 75 with
                   "Orange Cat soak running (/tmp/oc-soak-running). Refusing to start NAME." (NAME: the script that
                   was started, sys.argv[0]). A module that is imported checks too; the name is still the entry's.
    blocked()      the path of the file that blocks, or None: for the re-check between the steps of a long run and
                   right before a browser is launched or the device is opened or written to
    Interrupted    the exception a long run raises when the file appears in the middle (exit code 75 = interrupted:
                   neither pass nor fail)

    For make test-oc-guard only; neither can let anything run during a soak:
      OC_GUARD_TEST_FLAG=path   a SECOND file that blocks as well (the real one is always looked at)
      OC_GUARD_TEST_STOP=1      when nothing blocks: say "oc-guard: passed NAME" and exit 0 there

Version: 0.1

Revision log
    v0.1  2026-11-24  First version, after two breaches in the night of 2026-11-23 (docs/BUILD.md 69).
"""
import os
import sys

FLAG = "/tmp/oc-soak-running"
EXIT_INTERRUPTED = 75


class Interrupted(Exception):
    """The Orange Cat soak began while a long run was under way."""


def blocked():
    if os.path.exists(FLAG):
        return FLAG
    extra = os.environ.get("OC_GUARD_TEST_FLAG")
    if extra and os.path.exists(extra):
        return extra
    return None


def message(name, path):
    return "Orange Cat soak running (%s). Refusing to start %s." % (path, name)


def check(name=None):
    name = name or os.path.basename(sys.argv[0] or "python")
    path = blocked()
    if path:
        sys.stderr.write(message(name, path) + "\n")
        sys.stderr.flush()
        os._exit(EXIT_INTERRUPTED)
    if os.environ.get("OC_GUARD_TEST_STOP") == "1":
        sys.stderr.write("oc-guard: passed %s\n" % name)
        sys.stderr.flush()
        os._exit(0)


def recheck(what):
    """Between the steps of a long run, and right before a browser launch or a device access: raise Interrupted."""
    path = blocked()
    if path:
        raise Interrupted(message(what, path))
