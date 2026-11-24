#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tests/linux/device-gate-test.py — the device gate refuses every promotion of a build that did not pass on the device

A scratch git repository gets a copy of tools/linux/device-gate.py and a stand-in firmware in build/; the scenarios of
SPEC 17.13 are run against it: no marker, results with a failed or a missing step, results of another build, a passed
candidate, another tag, a commit after the tests, a dirty tree, another firmware build id. Also: the note banner of a
release candidate's page (tools/linux/builds-index.py).

Run: python3 -I tests/linux/device-gate-test.py   (part of make workbench-test)
Version: 0.1 (2026-11-17)
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import importlib.util, json, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
failed = 0


def check(ok, what):
    global failed
    print(("ok   " if ok else "FAIL ") + what)
    failed += 0 if ok else 1


spec = importlib.util.spec_from_file_location("device_gate", str(ROOT / "tools/linux/device-gate.py"))
real = importlib.util.module_from_spec(spec); spec.loader.exec_module(real)

with tempfile.TemporaryDirectory() as d:
    r = Path(d)
    (r / "tools/linux").mkdir(parents=True)
    shutil.copy(ROOT / "tools/linux/device-gate.py", r / "tools/linux/device-gate.py")
    shutil.copytree(ROOT / "scripts", r / "scripts")   # the Orange Cat soak guard goes with every tool: without it the copy refuses to run
    (r / ".gitignore").write_text("build/\n")
    (r / "build/pro/generated").mkdir(parents=True)
    BUILD = "ab" * 32
    (r / "build/pro/build-identity.json").write_text(json.dumps({"build_id": BUILD}))
    (r / "build/pro/generated/SMK37_PRO_OPEN.fwsc").write_bytes(b"firmware")
    env = {"GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@example.invalid", "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@example.invalid", "PATH": "/usr/bin:/bin", "HOME": d}
    git = lambda *a: subprocess.run(["git", "-C", d, *a], check=True, capture_output=True, text=True, env=env).stdout.strip()
    gate = lambda *a: subprocess.run([sys.executable, "-I", str(r / "tools/linux/device-gate.py"), *a], capture_output=True, text=True).returncode
    git("init", "-q"); git("add", "-A"); git("commit", "-q", "-m", "one"); git("tag", "v1-rc1")
    head = git("rev-parse", "HEAD")
    res = r / "build/results.json"

    def results(**over):
        steps = [{"step": n, "pass": True, "summary": "ok"} for n in real.REQUIRED]
        data = {"tag": "v1", "rc": 1, "commit": head, "build": BUILD, "device_build": BUILD, "steps": steps}
        data.update(over)
        res.write_text(json.dumps(data))

    check(gate("check", "--tag", "v1") == 1, "no marker: refused")
    results(steps=[{"step": n, "pass": n != "restore", "summary": ""} for n in real.REQUIRED])
    check(gate("mark", "--tag", "v1", "--rc", "1", "--results", str(res)) == 1 and gate("check", "--tag", "v1") == 1, "a failed step (the restore): no marker")
    results(steps=[{"step": n, "pass": True, "summary": ""} for n in real.REQUIRED if n != "verify"])
    check(gate("mark", "--tag", "v1", "--rc", "1", "--results", str(res)) == 1, "a missing step (the verify): no marker")
    results(device_build="cd" * 32)
    check(gate("mark", "--tag", "v1", "--rc", "1", "--results", str(res)) == 1, "the device reported another build: no marker")
    results()
    check(gate("mark", "--tag", "v1", "--rc", "2", "--results", str(res)) == 1, "HEAD does not carry the candidate's tag: no marker")
    check(gate("mark", "--tag", "v1", "--rc", "1", "--results", str(res)) == 0 and gate("check", "--tag", "v1") == 0, "every step passed on HEAD: marked, promotion allowed")
    check(gate("check", "--tag", "v1", "--build", BUILD) == 0 and gate("check", "--tag", "v1", "--build", "cd" * 32) == 1, "only for the firmware build that was tested")
    check(gate("check", "--tag", "v2") == 1, "another tag: refused")
    (r / "x.txt").write_text("x")
    check(gate("check", "--tag", "v1") == 1, "an untracked file in the tree: refused")
    git("add", "-A"); git("commit", "-q", "-m", "two")
    check(gate("check", "--tag", "v1") == 1, "a commit after the device tests: refused")

# the note banner of a release candidate's page
spec = importlib.util.spec_from_file_location("builds_index", str(ROOT / "tools/linux/builds-index.py"))
bi = importlib.util.module_from_spec(spec); spec.loader.exec_module(bi)
with tempfile.TemporaryDirectory() as d:
    w = Path(d)

    def site(tag, build):
        s = w / "site" / tag; s.mkdir(parents=True)
        (s / "index.html").write_text("<!doctype html><style></style>\n<main>\n<a href=\"https://example.invalid/x.zip\">Source + SDK</a></main>")
        (s / "assets.json").write_text(json.dumps({"build": build, "version": "v9"}))
        return s
    quiet = lambda *a: None
    bi.add_site(w, "v9-rc1", site("v9-rc1", "11" * 32), log=quiet)
    page = (w / "builds/v9-rc1/index.html").read_text()
    check("Release candidate of v9: not a release." in page and page.index("background:#b00020") < page.index("<main>"), "a release candidate's page says so in a banner before <main>")
    bi.add_site(w, "v9-rc2", site("v9-rc2", "22" * 32), log=quiet)
    bi.add_site(w, "v9", site("v9", "22" * 32), log=quiet)
    one, two, rel = [(w / "builds" / t / "index.html").read_text() for t in ("v9-rc1", "v9-rc2", "v9")]
    check("passed the device tests and was released as v9" in two and "not a release" in one and "b00020" not in rel, "after the release: the candidate that became it says so; the other stays a candidate; the release has no banner")
    index = json.loads((w / "builds/index.json").read_text())
    notes = {e["tag"]: e["note"] for e in index["builds"]}
    check(notes["v9-rc1"].startswith("Release candidate of v9") and "released as v9" in notes["v9-rc2"] and notes["v9"] == "", "the index carries the same notes")
    bi.write_index(w, log=quiet, notes={"v9-rc1": {"text": "Failed on the device: the restore stopped. Do not install.", "link": "v9"}})
    one = (w / "builds/v9-rc1/index.html").read_text()
    check("Failed on the device: the restore stopped." in one and "not a release" not in one, "a tracked note (a candidate that failed) replaces the banner's text")

print("device-gate-test: %s" % ("all passed" if not failed else "%d FAILED" % failed))
sys.exit(1 if failed else 0)
