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
      program, chain, scenechain, sceneedit, takeedit, repeat, setup, record, steps, launch, launch-again, clips, timing
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

Version: 0.13

Revision log
    v0.13 2026-11-20  This computer is kept awake (a low-priority spinner per core) while a timing-sensitive tool runs; the
                      timing steps also read the device's own figure (the latest a timed event left after its due
                      time) and one line must be under 2 ms by both. The three ordinary runs use that limit too.
    v0.12 2026-11-19  tabby-v1.2: step screen: the device's own pixels (the screen copy, run-screen.py) against the
                      simulator's for every page, at rest and while playing (screens.mjs --match).
    v0.11 2026-11-19  tabby-v1.1 (the readable screen): step timing-pages: one line on CLIPS, SCENES, SYNC / MIDI, ACTIONS
                      and the mixer (under 2 ms each), eight lines on the overview, CLIPS and SCENES.
    v0.10 2026-11-18  The panel state (mutes, focus, ARP switches, CLOCK, A2) is read before the tests, after each one and at the
                      end (panel-state.py); a step that leaves it changed fails and the mutes are put back. After the
                      tabby-v1.0.1 run the device was found with track 1 muted and nothing had noticed.
    v0.9  2026-11-18  tabby-v1.0.2: --soak-lead-minutes: a second soak, the Wrong Room song with EVENT LEAD 1/16 (the step
                      `soak-lead`): every scene entry's events at least 80 ms before its first note, the DIN band by the
                      limit of the other lines (the first note at SEQ PLAY left out).
    v0.8  2026-11-18  tabby-v1.0.1: the soak requires every scene entry's events (run-soak.py v0.3: --row-events 17,6).
    v0.7  2026-11-18  tabby-v1.0: --soak-minutes N adds the step `soak` before the last backup: the Wrong Room song
                      (tests/midi-import/fixtures/wrong-room-all.mid with the rig profile, looping; tools/linux/hw/rig-song.mjs)
                      is written to song slot 6 if that slot is empty, played for N minutes in segments on six pages
                      (tools/linux/hw/run-soak.py) and deleted again.
    v0.6  2026-11-18  tabby-v04.23: run-repeat.py v0.2 has the step loop (the same step `repeat`).
    v0.5  2026-11-18  tabby-v04.22: the step `repeat` (run-repeat.py: NOTE REPEAT repeats a held key; the focus switch).
    v0.4  2026-11-18  tabby-v04.21: the step `takeedit` (run-takeedit.py: a clip shifted, notes cleared during a take, a new song made and deleted again).
    v0.3  2026-11-17  tabby-v04.16: the step `sceneedit` (run-sceneedit.py: a scene moved and deleted, a stop takes an armed take off).
    v0.2  2026-11-17  The install step accepts "already installed" (the build is on the device from an earlier candidate).
    v0.1  2026-11-17  First version (the user's release-flow rule).
"""
import argparse, json, os, re, subprocess, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent.parent
HW = ROOT / "tools/linux/hw"
PAGES = "https://seattleuser0.github.io/classic-tabby/"
SONGOPT = '{"record":"scenes","loop":true,"rowSteps":16}'
PAGE_LIMIT_MS = 2.0      # v0.11: one line with any page on the screen: under 2 ms, or the step fails
EIGHT_LIMIT_MS = 3.5     # v0.11: eight lines, the worst line (2.2 to 3.1 ms measured from tabby-v04.4 to tabby-v1.0)
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
    p.add_argument("--soak-minutes", type=float, default=0.0, help="v0.7: the Wrong Room soak, in minutes (0: no soak)")
    p.add_argument("--soak-lead-minutes", type=float, default=0.0, help="v0.9: the Wrong Room soak with EVENT LEAD 1/16, in minutes")
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
    # v0.2: the same firmware build can already be on the device (an earlier candidate of this release whose failure was
    # a tool error): the page then says so and writes nothing. That counts; the identity step below proves the build.
    already = code == 0 and j.get("installed") is False and re.search(r"already installed", j.get("status") or "")
    if not step("install", (code == 0 and j.get("installed") is True) or already, (j.get("status") or j.get("error") or o[-200:]) + (" in %.0f s" % j["seconds"] if j.get("seconds") else "") + (" (this build is on the device already: nothing written)" if already else "")):
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

    # v0.10: the panel state a test must leave as it found it (tools/linux/hw/panel-state.py): read before the tests,
    # after every test and at the end; the step that changed it fails, and the mutes are put back.
    base = {}
    def state(after):
        code, o = sh([py, str(HW / "panel-state.py")] + (["--baseline", json.dumps(base), "--restore-mutes"] if base else []), 120, log)
        now = last_json(o)
        if not base:
            base.update(now); return True
        diff = {k: (base.get(k), now.get(k)) for k in ("mutes", "focus", "arp", "repeat", "clock", "a2") if base.get(k) != now.get(k) and not now.get("restored")}
        if now.get("restored"):
            diff["mutes"] = "tracks %s were left muted (unmuted again)" % now["restored"]
        if diff:
            step("state-after-" + after, False, "the panel was not left as it was found: %s" % json.dumps(diff))
        return not diff
    state("")
    # v0.13: this computer awake while MIDI times are taken. Its kernel stamps each MIDI byte when the USB interrupt is
    # served; with the machine idle the cores sit in deep sleep states and some stamps come late by 0.1 to 0.3 ms
    # (docs/BUILD.md 65.4: the same firmware, one line: 1.63 to 1.89 ms awake, up to 2.17 idle, the device's own figure
    # 1.42 to 1.75 in both). One low-priority spinner per core for as long as a timing-sensitive tool runs.
    class awake:
        def __enter__(self):
            self.p = [subprocess.Popen(["nice", "-n", "19", "taskset", "-c", str(n), sys.executable, "-c", "while True: pass"]) for n in range(os.cpu_count() or 1)]
            time.sleep(0.5)
        def __exit__(self, *exc):
            for p in self.p:
                p.kill()
            for p in self.p:
                p.wait()
    def test(name, tool, extra=(), timeout=700, rewrite=True, pattern=r"^(PASS|FAIL) .*checks passed.*$"):
        with awake():
            code, o = sh([py, str(HW / tool), "--song", "7", "--out", str(out), *extra], timeout, log)
        m = re.findall(pattern, o, re.M)
        lines = [l for l in o.splitlines() if re.match(pattern, l)]
        fails = [l for l in o.splitlines() if l.startswith("FAIL")]
        good = code == 0 and lines and not fails
        step(name, good, (lines[-1] if lines else "no summary line") + ("; " + " | ".join(fails[:3]) if fails else ""))
        state(name)
        if rewrite:
            song()
    if ok:
        test("program", "run-program.py")
        test("chain", "run-chain.py")
        test("scenechain", "run-scenechain.py")
        test("sceneedit", "run-sceneedit.py")
        test("takeedit", "run-takeedit.py")
        test("repeat", "run-repeat.py")
        test("setup", "run-setup.py")
        test("record", "run-record.py")
        test("steps", "run-steps.py")
        test("launch", "run-launch.py", rewrite=False)
        test("launch-again", "run-launch.py")
        # v0.12 (tabby-v1.2): the device's own pixels. The Wrong Room song goes into slot 6 (index 5; only if that slot is
        # empty), run-screen.py runs the tour of screen-tour.json and reads the screen copy for every page, at rest and
        # while playing; screens.mjs --match runs the simulator through the same tour and compares every pixel.
        shots = out / ("screen-%s" % rc_tag)
        shots.mkdir(parents=True, exist_ok=True)
        link = "import sys; sys.path.insert(0, %r); import tabby_link as T, time; l = T.Link(); time.sleep(0.3)\n" % str(HW)
        c0, o0 = sh([py, "-c", link + "try:\n    l.stop_song(); l.select_song(5); print('HOLDS A SONG')\nexcept T.DeviceError:\n    print('EMPTY')\nl.close()"], 60, log)
        if "EMPTY" in o0:
            r = subprocess.run(["node", str(HW / "rig-song.mjs"), str(ROOT / "tests/midi-import/fixtures/wrong-room-all.mid"), "--loop"], cwd=str(ROOT), capture_output=True, text=True)
            (shots / "wrong-room-song.json").write_text(r.stdout)
            c1, o1 = sh(W + ["song", "--url", url, "--song-json", str(shots / "wrong-room-song.json"), "--slot", "5", "--log", wb_log], 600, log)
            c2, o2 = sh([py, str(HW / "run-screen.py"), "--out", str(shots), "--song", "wrong-room-song.json", "--build", build], 1500, log) if c1 == 0 else (1, "the song could not be written")
            c3, o3 = sh(["node", str(ROOT / "tools/linux/screens.mjs"), "--match", str(shots)], 600, log) if c2 == 0 else (1, "")
            sh([py, "-c", link + "l.stop_song(); time.sleep(0.5)\ntry:\n    l.remote(16, 2)\nexcept Exception:\n    pass\ntry:\n    l.select_song(6)\nexcept T.DeviceError:\n    pass\nl.song_delete(5); l.close()"], 120, log)
            fails = [l for l in (o2 + "\n" + o3).splitlines() if l.startswith("FAIL")]
            last = [l for l in (o3 or o2).splitlines() if l.startswith(("PASS", "FAIL"))]
            step("screen", c2 == 0 and c3 == 0, (last[-1] if last else (o2 or o1)[-200:]) + ("; " + " | ".join(f[:110] for f in fails[:4]) if fails and (c2 or c3) else ""))
        else:
            step("screen", False, "song slot 6 is not empty: the tour's song could not be written")
        state("screen")
        song()
        # the timing song (slot 13 of the device, as imported) and the one-line timing run
        with awake():
            code, o = sh([py, str(HW / "run-clips.py"), "--song", "13", "--expected", a.expected, "--out", str(out), "--tag", rc_tag + "-s13"], 600, log)
        lines = [l for l in o.splitlines() if l.startswith(("PASS", "FAIL"))]
        step("clips", code == 0 and lines and not any(l.startswith("FAIL") for l in lines), " | ".join(l[:120] for l in lines[-3:]) or o[-200:])
        bands = {}
        runs = []
        own = []    # v0.13: the device's own figure: the latest a timed event left after its due time
        for n in range(3):
            with awake():
                code, o = sh([py, str(HW / "run-15.py"), "l2", "--a2", "keep", "--seconds", "125", "--play", "16", "--page", "overview", "--tag", "%s-1x16-%d" % (rc_tag, n + 1), "--out", str(out)], 500, log)
            m = re.search(r"^F \+ G: .*latest ([\d.]+) ms", o, re.M)
            own.append(float(m.group(1)) if m else None)
            for port in ("DIN", "USB"):
                m = re.search(r"^%s: (\d+) notes on 1 line\(s\); band per line [\d.]+\.\.([\d.]+) ms.*clock ratio ([\d.]+)" % port, o, re.M)
                if m:
                    bands.setdefault(port, []).append((int(m.group(1)), float(m.group(2)), m.group(3)))
            runs.append(code)
        din, usb = bands.get("DIN", []), bands.get("USB", [])
        good = len(din) == 3 and len(usb) == 3 and all(n == 960 and b < PAGE_LIMIT_MS for n, b, _ in din + usb) and not any(runs) and all(x is not None and x < PAGE_LIMIT_MS for x in own)
        step("timing", good, "one line, 960 notes, three runs: DIN %s ms; USB %s ms; the device's own latest send %s ms; clock ratio %s" % (
            ", ".join("%.2f" % b for _, b, _ in din), ", ".join("%.2f" % b for _, b, _ in usb), ", ".join("?" if x is None else "%.2f" % x for x in own), ", ".join(sorted({r for _, _, r in din}))))
        # v0.11 (tabby-v1.1, the readable screen): the same one-line song with each of the other pages on the screen, and
        # the eight-line song (slot 15) on the three pages looked at while playing. One line must stay under 2 ms on every
        # page (the user's limit); eight lines under EIGHT_LIMIT_MS for every line.
        got, bad = [], 0
        for lines_n, slot, page in [(1, "16", pg) for pg in ("clips", "scenes", "steps", "actions", "mixer")] + [(8, "15", pg) for pg in ("overview", "clips", "scenes")]:
            with awake():
                code, o = sh([py, str(HW / "run-15.py"), "l2", "--a2", "keep", "--seconds", "125", "--play", slot, "--page", page, "--tag", "%s-%dx-%s" % (rc_tag, lines_n, page), "--out", str(out)], 500, log)
            m = re.search(r"^F \+ G: .*latest ([\d.]+) ms", o, re.M)
            latest = float(m.group(1)) if m else None
            worst = {}
            for port in ("DIN", "USB"):
                m = re.search(r"^%s: (\d+) notes on %d line\(s\); band per line [\d.]+\.\.([\d.]+) ms" % (port, lines_n), o, re.M)
                if m:
                    worst[port] = float(m.group(2))
            limit = PAGE_LIMIT_MS if lines_n == 1 else EIGHT_LIMIT_MS
            ok = code == 0 and len(worst) == 2 and all(b < limit for b in worst.values()) and latest is not None and (lines_n > 1 or latest < PAGE_LIMIT_MS)
            bad += not ok
            got.append("%s %s %s/%s/%s" % ("1L" if lines_n == 1 else "8L", page, "%.2f" % worst["DIN"] if "DIN" in worst else "?", "%.2f" % worst["USB"] if "USB" in worst else "?", "?" if latest is None else "%.2f" % latest))
        step("timing-pages", not bad, "worst line DIN / USB / the device's own latest send, ms: " + "; ".join(got))
        song()

    # v0.7: the soak with the Wrong Room song (slot 6 on the screen, index 5; only if that slot is empty)
    # v0.9: twice: with EVENT LEAD OFF (as every song has it that never set it) and with EVENT LEAD 1/16
    for name, minutes, lead, extra in (("soak", a.soak_minutes, 0, ["--din-band-limit", "20"]),
                                       ("soak-lead", a.soak_lead_minutes, 2, ["--events-ahead-ms", "80", "--skip-first-note"])):
        if minutes <= 0:
            continue
        link = "import sys; sys.path.insert(0, %r); import tabby_link as T, time; l = T.Link(); time.sleep(0.3)\n" % str(HW)
        c0, o0 = sh([py, "-c", link + "try:\n    l.stop_song(); l.select_song(5); print('HOLDS A SONG')\nexcept T.DeviceError:\n    print('EMPTY')\nl.close()"], 60, log)
        songfile = str(out / ("wrong-room-song-lead%d.json" % lead))
        c1 = 1
        if "EMPTY" in o0:
            r = subprocess.run(["node", str(HW / "rig-song.mjs"), str(ROOT / "tests/midi-import/fixtures/wrong-room-all.mid"), "--loop", "--event-lead", str(lead)], cwd=str(ROOT), capture_output=True, text=True)
            Path(songfile).write_text(r.stdout)
            c1, o1 = sh(W + ["song", "--url", url, "--song-json", songfile, "--slot", "5", "--log", wb_log], 600, log)
        if c1 == 0:
            tag = rc_tag + ("-wrongroom" if not lead else "-wrongroom-lead")
            c2, o2 = sh([py, str(HW / "run-soak.py"), "--minutes", str(minutes), "--songs", "6:8", "--seconds", "125", "--events", "--row-events", "17,6", "--row-seconds", "8",
                         *extra, "--tag", tag, "--out", str(out)], int(minutes * 60 + 900), log)
            tail = [l for l in o2.splitlines() if l.startswith(tag + ":") or "lines," in l or l.startswith("BAD")]
            sh([py, "-c", link + "l.stop_song(); time.sleep(0.5)\ntry:\n    l.select_song(6)\nexcept T.DeviceError:\n    pass\nl.song_delete(5); l.close()"], 120, log)
            step(name, c2 == 0, ("EVENT LEAD %s: " % ("1/16" if lead else "OFF")) + (" | ".join(tail[:4]) or o2[-300:]))
        else:
            step(name, False, "song slot 6 is not empty, or the Wrong Room song could not be written: %s" % (o0.strip()[-80:]))
        state(name)
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
    if state("verify"):
        step("state", True, "the panel is as it was before the tests: mutes %s, focus, ARP switches, CLOCK, A2" % ",".join(m[0] for m in base.get("mutes", [])))

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
