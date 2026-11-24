#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/device-gate.py — nothing reaches the main page unless that build passed on the device as a release candidate

Purpose
    The release flow of SPEC 17.13 (the user's rule of 2026-11-17). A new build is published only at
    builds/<tag>-rc<N>/ first, installed on the device from that page, and run through the full device test set
    (tools/linux/hw/rc-validate.py: every device test, then a full backup, a restore of that backup and a verify).
    Only then may it go to the main page and become a GitHub release. tabby-v04.11 and tabby-v04.11.1 went to the
    main page before anything had been tried on the device; this tool makes that impossible through the normal
    targets, as tools/linux/suite-gate.py does for the suite:

      mark  --tag T --rc N --results FILE   (last step of rc-validate.py) writes build/device-gate.json: the commit,
                                            the tag, the candidate, the firmware build id and the package's SHA-256.
                                            Refused unless the results file lists every required step as passed,
                                            HEAD carries the tag T-rcN, the tree is clean, and the firmware in
                                            build/ is the one the results name.
      check --tag T [--build ID]            (`make promote`, `make release-assets`, and publish-pages.py before it
                                            writes the main page or builds/T/) passes only when the marker is for
                                            HEAD and T, and (with --build) for that firmware build id.
      show                                  prints the marker.

    Exit 0 = allowed, 1 = refused (the reason is printed).

Version: 0.1

Revision log
    v0.1  2026-11-17  First version (the user's release-flow rule; SPEC 17.13, docs/DEV_CHECKS.md).
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import argparse, hashlib, json, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
MARK = ROOT / "build/device-gate.json"
# The steps rc-validate.py must report as passed. Names are fixed here so a shortened batch cannot mark a build.
REQUIRED = ["page", "backup-before", "install", "identity", "song", "program", "chain", "scenechain", "setup", "record",
            "steps", "launch", "launch-again", "clips", "timing", "backup", "restore", "verify"]


def git(*a):
    return subprocess.run(["git", "-C", str(ROOT), *a], capture_output=True, text=True, check=True).stdout.strip()


def firmware(model="pro"):
    """(build id, sha256 of the package) of the firmware in build/<model>/."""
    ident = json.loads((ROOT / "build" / model / "build-identity.json").read_text())
    pkg = next((ROOT / "build" / model / "generated").glob("SMK37_*_OPEN.fwsc"))
    return ident.get("build_id") or ident.get("build"), hashlib.sha256(pkg.read_bytes()).hexdigest()


def check(tag, build=None):
    """None when the build marked for `tag` is HEAD (and has build id `build`), else the reason."""
    if not MARK.exists():
        return "no release candidate of this tree has passed on the device (build/device-gate.json is missing): make rc, then tools/linux/hw/rc-validate.py"
    m = json.loads(MARK.read_text())
    head, dirty = git("rev-parse", "HEAD"), git("status", "--porcelain")
    if dirty:
        return "the tree is not clean:\n" + dirty
    if m["commit"] != head:
        return "the device tests passed on %s (%s-rc%s), HEAD is %s: publish and test a new release candidate" % (m["commit"][:12], m["tag"], m["rc"], head[:12])
    if m["tag"] != tag:
        return "the device tests passed for %s, this is %s" % (m["tag"], tag)
    if build and m["build"] != build:
        return "the device tests passed on firmware build %s, this build is %s: the promoted firmware must be the tested one" % (m["build"][:16], build[:16])
    return None


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("cmd", choices=["mark", "check", "show"])
    p.add_argument("--tag", default="")
    p.add_argument("--rc", default="")
    p.add_argument("--results")
    p.add_argument("--build")
    a = p.parse_args()
    if a.cmd == "show":
        print(MARK.read_text() if MARK.exists() else "no marker")
        return 0
    if a.cmd == "check":
        why = check(a.tag, a.build)
        if why:
            print("device gate: REFUSED: " + why)
            return 1
        m = json.loads(MARK.read_text())
        print("device gate: ok (%s-rc%s passed on the device %s, build %s)" % (m["tag"], m["rc"], m["passed"], m["build"][:16]))
        return 0
    # mark
    def refuse(why):
        print("device gate: REFUSED: " + why)
        return 1
    if not a.tag or not a.rc.isdigit() or not a.results:
        return refuse("mark needs --tag, --rc and --results")
    results = json.loads(Path(a.results).read_text())
    steps = {s["step"]: s for s in results.get("steps", [])}
    missing = [n for n in REQUIRED if n not in steps]
    failed = [n for n in REQUIRED if n in steps and not steps[n].get("pass")]
    if missing or failed:
        return refuse("not every step passed (missing: %s; failed: %s)" % (", ".join(missing) or "none", ", ".join(failed) or "none"))
    head, dirty = git("rev-parse", "HEAD"), git("status", "--porcelain")
    if dirty:
        return refuse("the tree is not clean:\n" + dirty)
    rc_tag = "%s-rc%s" % (a.tag, a.rc)
    if rc_tag not in git("tag", "--points-at", "HEAD").split():
        return refuse("HEAD (%s) does not carry %s" % (head[:12], rc_tag))
    build, sha = firmware()
    if results.get("commit") != head or results.get("tag") != a.tag or str(results.get("rc")) != a.rc:
        return refuse("the results are for %s %s-rc%s" % (str(results.get("commit"))[:12], results.get("tag"), results.get("rc")))
    if results.get("build") != build or results.get("device_build") != build:
        return refuse("the results name build %s (on the device: %s), build/ holds %s" % (str(results.get("build"))[:16], str(results.get("device_build"))[:16], build[:16]))
    MARK.parent.mkdir(exist_ok=True)
    MARK.write_text(json.dumps({"commit": head, "tag": a.tag, "rc": int(a.rc), "build": build, "package_sha256": sha,
                                "passed": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "results": str(a.results),
                                "steps": {n: steps[n].get("summary", "") for n in REQUIRED}}, indent=1) + "\n")
    print("device gate: marker written for %s (%s, build %s)" % (rc_tag, head[:12], build[:16]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
