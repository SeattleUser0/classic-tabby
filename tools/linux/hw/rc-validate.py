#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/rc-validate.py — the full device test set of a release candidate (SPEC 17.13)

Purpose
    Runs, unattended, everything a build must pass on the device before it may go to the main page:

      page           builds/<tag>-rc<N>/ is live and carries the firmware build in build/
      backup-before  a full backup through the page of the firmware that is on the device (--backup-url)
      install        ONE install attempt from the release candidate's page (the normal update path, identity checked)
      identity       the device then reports the build id of build/
      song           the two-clip test song is imported (slot 7)
      program, chain, scenechain, setup, record, steps, launch, launch-again, clips, timing
                     the device tests (run-*.py), the test song written anew between them
      backup         a full backup through the release candidate's page
      restore        that backup restored to the device (the page verifies after the restore)
      verify         the device verified against the file once more

    It stops at the first failed step that writes to the device (backup-before, install, restore): no further
    device writes. A failed test does not stop the other tests (they only read and play), but nothing is marked.
    When every step passed it calls tools/linux/device-gate.py mark, which lets `make promote` publish this build
    to the main page. A step that fails is reported with the tool's own last lines; hard limit 6 still applies:
    confirm a device fault with a second tool before reporting it.

    Run from the repository root, with the Python of the hardware venv:
      ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/rc-validate.py --tag tabby-v04.14 --rc 1 --out ../overnight/g8

Version: 0.1

Revision log
    v0.1  2026-11-17  First version (the user's release-flow rule).
"""
import argparse, json, re, subprocess, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent.parent
HW = ROOT / "tools/linux/hw"
PAGES = "https://seattleuser0.github.io/classic-tabby/"
SONGOPT = '{"record":"scenes","loop":true,"rowSteps":16}'
BAND_LIMIT_MS = 2.5      # one line: the goal is 2 ms; above this the run fails. The bands are reported either way.


def sh(cmd, timeout, log):
    """Run a command; return (exit code, output). The output is appended to the log."""
    try:
        r = subprocess.run(cmd, cwd=str(ROOT), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=timeout)
        code, out = r.returncode, r.stdout
    except subprocess.TimeoutExpired as e:
        code, out = 124, (e.stdout or "") + "\nTIMEOUT after %d s" % timeout
    with open(log, "a") as f:
        f.write("\n$ %s\n%s\n" % (" ".join(str(c) for c in cmd), out))
    return code, out


def last_json(out):
    for line in reversed(out.strip().splitlines()):
        if line.startswith("{"):
            try:
                return json.loads(line)
            except ValueError:
                pass
    return {}


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--tag", required=True)
    p.add_argument("--rc", required=True)
    p.add_argument("--out", required=True, help="directory for the logs and results")
    p.add_argument("--backup-url", default=PAGES, help="the page of the firmware now on the device (default: the main page)")
    p.add_argument("--backups", default=str(ROOT.parent / "overnight/backups"))
    p.add_argument("--expected", default=str(ROOT.parent / "overnight/g6/exp-v046-s13-timing-1x16.json"))
    a = p.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    rc_tag = "%s-rc%s" % (a.tag, a.rc)
    url = "%sbuilds/%s/" % (PAGES, rc_tag)
    log = out / (rc_tag + "-validate.log")
    wb_log = str(out / "workbench.log")
    py = sys.executable
    W = ["node", str(HW / "workbench.mjs")]
    build = json.loads((ROOT / "build/pro/build-identity.json").read_text())["build_id"]
    head = subprocess.run(["git", "-C", str(ROOT), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
    results = {"tag": a.tag, "rc": int(a.rc), "commit": head, "build": build, "device_build": None, "page": url,
               "started": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "steps": []}
    file = out / (rc_tag + "-results.json")

    def step(name, ok, summary):
        results["steps"].append({"step": name, "pass": bool(ok), "summary": summary[:400]})
        file.write_text(json.dumps(results, indent=1) + "\n")
        print("%s %-13s %s" % ("PASS" if ok else "FAIL", name, summary[:300]), flush=True)
        return bool(ok)

    def stop(why):
        print("STOPPED: %s. No further device writes. Nothing marked." % why, flush=True)
        return 1

    # page: live and the same build
    seen = ""
    for _ in range(80):
        try:
            seen = json.loads(urllib.request.urlopen(url + "assets.json", timeout=20).read()).get("build", "")
        except Exception as e:      # not there yet
            seen = "not live (%s)" % type(e).__name__
        if seen == build:
            break
        time.sleep(15)
    if not step("page", seen == build, "%s carries build %s" % (url, seen[:16])):
        return stop("the release candidate's page is not live with this build")

    # backup-before
    before = str(Path(a.backups) / ("before-%s.json" % rc_tag))
    code, o = sh(W + ["backup", "--url", a.backup_url, "--file", before, "--log", wb_log], 1200, log)
    j = last_json(o)
    if not step("backup-before", code == 0 and j.get("ok"), j.get("message") or j.get("error") or o[-200:]):
        return stop("the backup before the install failed")

    # install: one attempt
    code, o = sh(W + ["install", "--url", url, "--expect", a.tag, "--log", str(out / ("install-%s.log" % rc_tag))], 900, log)
    j = last_json(o)
    if not step("install", code == 0 and j.get("installed") is True, (j.get("status") or j.get("error") or o[-200:]) + (" in %.0f s" % j["seconds"] if j.get("seconds") else "")):
        return stop("the install did not complete (one attempt per build)")
    time.sleep(6)
    code, o = sh(W + ["info", "--url", url, "--log", wb_log], 300, log)
    j = last_json(o)
    results["device_build"] = (j.get("identity") or {}).get("build")
    if not step("identity", results["device_build"] == build, "the device reports build %s" % str(results["device_build"])[:16]):
        return stop("the device does not run the build of this tree")

    mid = str(out / "clips-song.mid")
    def song():
        c1, o1 = sh(["node", str(HW / "clips-song.mjs"), mid], 60, log)
        c2, o2 = sh(W + ["song", "--url", url, "--mid", mid, "--slot", "6", "--options", SONGOPT, "--log", wb_log], 600, log)
        return c1 == 0 and c2 == 0 and last_json(o2).get("ok"), last_json(o2)
    ok, j = song()
    step("song", ok, "the test song is in slot 7 (%s blocks, %s rows)" % (j.get("blocks"), j.get("rows")))

    def test(name, tool, extra=(), timeout=700, rewrite=True, pattern=r"^(PASS|FAIL) .*checks passed.*$"):
        code, o = sh([py, str(HW / tool), "--song", "7", "--out", str(out), *extra], timeout, log)
        m = re.findall(pattern, o, re.M)
        lines = [l for l in o.splitlines() if re.match(pattern, l)]
        fails = [l for l in o.splitlines() if l.startswith("FAIL")]
        good = code == 0 and lines and not fails
        step(name, good, (lines[-1] if lines else "no summary line") + ("; " + " | ".join(fails[:3]) if fails else ""))
        if rewrite:
            song()
    if ok:
        test("program", "run-program.py")
        test("chain", "run-chain.py")
        test("scenechain", "run-scenechain.py")
        test("setup", "run-setup.py")
        test("record", "run-record.py")
        test("steps", "run-steps.py")
        test("launch", "run-launch.py", rewrite=False)
        test("launch-again", "run-launch.py")
        # the timing song (slot 13 of the device, as imported) and the one-line timing run
        code, o = sh([py, str(HW / "run-clips.py"), "--song", "13", "--expected", a.expected, "--out", str(out), "--tag", rc_tag + "-s13"], 600, log)
        lines = [l for l in o.splitlines() if l.startswith(("PASS", "FAIL"))]
        step("clips", code == 0 and lines and not any(l.startswith("FAIL") for l in lines), " | ".join(l[:120] for l in lines[-3:]) or o[-200:])
        bands = {}
        runs = []
        for n in range(3):
            code, o = sh([py, str(HW / "run-15.py"), "l2", "--a2", "keep", "--seconds", "125", "--play", "16", "--page", "overview", "--tag", "%s-1x16-%d" % (rc_tag, n + 1), "--out", str(out)], 500, log)
            for port in ("DIN", "USB"):
                m = re.search(r"^%s: (\d+) notes on 1 line\(s\); band per line [\d.]+\.\.([\d.]+) ms.*clock ratio ([\d.]+)" % port, o, re.M)
                if m:
                    bands.setdefault(port, []).append((int(m.group(1)), float(m.group(2)), m.group(3)))
            runs.append(code)
        din, usb = bands.get("DIN", []), bands.get("USB", [])
        good = len(din) == 3 and len(usb) == 3 and all(n == 960 and b <= BAND_LIMIT_MS for n, b, _ in din + usb) and not any(runs)
        step("timing", good, "one line, 960 notes, three runs: DIN %s ms; USB %s ms; clock ratio %s" % (
            ", ".join("%.2f" % b for _, b, _ in din), ", ".join("%.2f" % b for _, b, _ in usb), ", ".join(sorted({r for _, _, r in din}))))
        song()

    # backup, restore, verify through the release candidate's page
    after = str(Path(a.backups) / ("after-%s.json" % rc_tag))
    code, o = sh(W + ["backup", "--url", url, "--file", after, "--log", wb_log], 1200, log)
    j = last_json(o)
    if not step("backup", code == 0 and j.get("ok"), j.get("message") or j.get("error") or o[-200:]):
        return stop("the full backup through the release candidate's page failed")
    code, o = sh(W + ["restore", "--url", url, "--file", after, "--log", wb_log], 1800, log)
    j = last_json(o)
    if not step("restore", code == 0 and j.get("pass") is True, j.get("message") or j.get("error") or o[-200:]):
        return stop("the restore failed")
    code, o = sh(W + ["verify", "--url", url, "--file", after, "--log", wb_log], 1200, log)
    j = last_json(o)
    step("verify", code == 0 and j.get("pass") is True, j.get("message") or j.get("error") or o[-200:])

    failed = [s["step"] for s in results["steps"] if not s["pass"]]
    results["finished"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    file.write_text(json.dumps(results, indent=1) + "\n")
    if failed:
        print("NOT MARKED: failed steps: %s. The build stays a release candidate; give its page a note (tools/linux/builds-notes.json)." % ", ".join(failed))
        return 1
    code, o = sh([sys.executable, "-I", str(ROOT / "tools/linux/device-gate.py"), "mark", "--tag", a.tag, "--rc", a.rc, "--results", str(file)], 60, log)
    print(o.strip())
    return code


if __name__ == "__main__":
    sys.exit(main())
