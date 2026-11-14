#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tests/linux/suite-gate-test.py — the suite gate refuses every publish that is not on a passed commit

A scratch git repository gets a copy of tools/linux/suite-gate.py; the scenarios of Task 17 hard limit 5 are run
against it: no marker, a passed run, a commit after the run, another display version, a dirty tree at check time,
a dirty tree during the run, a failed run (begin without mark), HEAD moved during the run.

Run: python3 -I tests/linux/suite-gate-test.py   (part of make workbench-test)
Version: 0.1 (2026-11-14, Task 17)
"""
import shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
failed = 0


def check(ok, what):
    global failed
    print(("ok   " if ok else "FAIL ") + what)
    failed += 0 if ok else 1


with tempfile.TemporaryDirectory() as d:
    r = Path(d)
    (r / "tools/linux").mkdir(parents=True)
    shutil.copy(ROOT / "tools/linux/suite-gate.py", r / "tools/linux/suite-gate.py")
    (r / ".gitignore").write_text("build/\n")
    env = {"GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@example.invalid", "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@example.invalid", "PATH": "/usr/bin:/bin", "HOME": d}
    git = lambda *a: subprocess.run(["git", "-C", d, *a], check=True, capture_output=True, env=env)
    gate = lambda *a: subprocess.run([sys.executable, "-I", str(r / "tools/linux/suite-gate.py"), *a], capture_output=True, text=True).returncode
    git("init", "-q"); git("add", "-A"); git("commit", "-q", "-m", "one")
    check(gate("check", "--display", "v1") == 1, "no marker: refused")
    gate("begin", "--display", "v1"); gate("mark", "--display", "v1")
    check(gate("check", "--display", "v1") == 0, "a passed run on HEAD with the same display version: allowed")
    check(gate("check", "--display", "v2") == 1, "another display version: refused")
    (r / "x.txt").write_text("x")
    check(gate("check", "--display", "v1") == 1, "an untracked file in the tree: refused")
    git("add", "-A"); git("commit", "-q", "-m", "two")
    check(gate("check", "--display", "v1") == 1, "a commit after the run: refused")
    gate("begin", "--display", "v1")
    check(gate("check", "--display", "v1") == 1, "a run that began and did not pass (the rc4 case): refused, the old marker is gone")
    gate("mark", "--display", "v1")
    check(gate("check", "--display", "v1") == 0, "after the pass: allowed")
    (r / "x.txt").write_text("y"); gate("begin", "--display", "v1"); gate("mark", "--display", "v1"); git("checkout", "x.txt")
    check(gate("check", "--display", "v1") == 1, "a run on a tree that was not clean: no marker, refused")
    gate("begin", "--display", "v1"); (r / "y.txt").write_text("y"); git("add", "-A"); git("commit", "-q", "-m", "three")
    check(gate("mark", "--display", "v1") == 1 and gate("check", "--display", "v1") == 1, "HEAD moved during the run: no marker, refused")

print("suite-gate: %s" % ("%d FAILED" % failed if failed else "all checks passed"))
sys.exit(1 if failed else 0)
