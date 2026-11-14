#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/suite-gate.py — nothing is published unless make suite passed on the exact commit

Purpose
    Task 17 hard limit 5. tabby-v04.4-rc4 was published and installed although its suite had failed (a batch
    script went on after the failure). This tool makes that impossible through the normal targets:

      begin  --display V   (first step of `make suite`) records HEAD and that the tree is clean
      mark   --display V   (last step of `make suite`, reached only when every part passed) writes
                           build/suite-gate.json: the commit, the display version, the time; it refuses when HEAD
                           moved or the tree changed during the run, or when the tree was not clean at the start
      check  --display V   (`make publish`, `make release-assets`, and tools/linux/publish-pages.py itself before it
                           commits or pushes gh-pages) passes only when the marker's commit is HEAD, the display
                           version is the same and the tree is clean (tracked and untracked files; ignored files such
                           as build/ do not count)

    Exit 0 = allowed, 1 = refused (the reason is printed).

Version: 0.1

Revision log
    v0.1  2026-11-14  Task 17: first version.
"""
import argparse, json, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
MARK, BEGIN = ROOT / "build/suite-gate.json", ROOT / "build/suite-gate.begin.json"


def git(*a):
    return subprocess.run(["git", "-C", str(ROOT), *a], capture_output=True, text=True, check=True).stdout.strip()


def state():
    return {"commit": git("rev-parse", "HEAD"), "dirty": git("status", "--porcelain")}


def refuse(why):
    print("suite gate: REFUSED: " + why)
    return 1


def check(display):
    """None when publishing HEAD with this display version is allowed, else the reason."""
    if not MARK.exists():
        return "no suite has passed in this tree (build/suite-gate.json is missing): run make suite DISPLAY_VERSION=%s" % (display or "...")
    m, s = json.loads(MARK.read_text()), state()
    if s["dirty"]:
        return "the tree is not clean:\n" + s["dirty"]
    if m["commit"] != s["commit"]:
        return "the suite passed on %s, HEAD is %s: run make suite on this commit" % (m["commit"][:12], s["commit"][:12])
    if (m.get("display") or "") != (display or ""):
        return "the suite passed for display version '%s', this is '%s'" % (m.get("display"), display)
    return None


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("cmd", choices=["begin", "mark", "check"])
    p.add_argument("--display", default="")
    a = p.parse_args()
    MARK.parent.mkdir(exist_ok=True)
    if a.cmd == "begin":
        if MARK.exists():
            MARK.unlink()                      # a run in progress has not passed
        s = state(); s["display"] = a.display
        BEGIN.write_text(json.dumps(s))
        if s["dirty"]:
            print("suite gate: the tree is not clean; this run cannot be used to publish:\n" + s["dirty"])
        return 0
    if a.cmd == "mark":
        if not BEGIN.exists():
            return refuse("the run did not begin through make suite")
        b, s = json.loads(BEGIN.read_text()), state()
        if b["dirty"] or s["dirty"]:
            print("suite gate: the suite passed, but the tree was not clean: no marker written (nothing can be published from this run)")
            return 0
        if b["commit"] != s["commit"] or b.get("display", "") != a.display:
            return refuse("HEAD or the display version changed during the run")
        MARK.write_text(json.dumps({"commit": s["commit"], "display": a.display, "passed": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}, indent=1) + "\n")
        print("suite gate: marker written for %s (%s)" % (s["commit"][:12], a.display or "no display version"))
        return 0
    why = check(a.display)
    if why:
        return refuse(why)
    print("suite gate: ok (%s, %s)" % (git("rev-parse", "--short", "HEAD"), a.display or "no display version"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
