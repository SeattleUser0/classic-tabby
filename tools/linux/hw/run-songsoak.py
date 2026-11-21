#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-songsoak.py — a soak with a real song: played again and again, every note against the file

Purpose
    run-soak.py soaks timing songs (lines of equal notes, each against its own grid). A real song has no such grid.
    This tool plays the song in --song for --minutes, pass after pass, each pass on the next page of --pages, and
    lets run-clips.py compare every note-on of every pass (pitch, velocity, channel, order, time) on DIN and USB
    with the list expected-events.mjs made from the same MIDI file. Before each pass the device's own lateness
    counters are reset; after it they are read. Per pass one line; at the end the worst of all.
    The song must be in the slot already and must end by itself (no loop).

Usage (browser closed)
    node tools/linux/hw/expected-events.mjs FILE.mid --options '{"record":"scenes"}' > expected.json
    node tools/linux/hw/workbench.mjs song --url URL --mid FILE.mid --slot 5 --options '{"record":"scenes"}'
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-songsoak.py --song 6 --expected expected.json --minutes 40 --out DIR

Version: 0.1

Revision log
    v0.1  2026-11-21  First version (the user's answer of 2026-11-21: soak the densest of their own MIDI files).
"""
import argparse
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import tabby_link as T


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, required=True, help="the slot, 1 to 16 as on the screen")
    p.add_argument("--expected", required=True)
    p.add_argument("--minutes", type=float, default=40.0)
    p.add_argument("--pages", default="overview,clips,scenes,steps,mixer,actions")
    p.add_argument("--tolerance", type=float, default=4.0)
    p.add_argument("--tag", default="songsoak")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    pages = a.pages.split(",")
    # this computer awake while MIDI times are taken (rc-validate v0.13): a low-priority spinner per core
    spin = [subprocess.Popen(["nice", "-n", "19", sys.executable, "-c", "while True: pass"]) for _ in range(os.cpu_count() or 1)]
    rows = []; bad = 0; n = 0
    end = time.monotonic() + a.minutes * 60.0
    try:
        while time.monotonic() < end:
            page = pages[n % len(pages)]; tag = "%s-%02d" % (a.tag, n + 1)
            l = T.Link(); time.sleep(0.3)
            try:
                l.stop_song(); l.show_page(page); l.diag(1)
            finally:
                l.close()
            r = subprocess.run([sys.executable, os.path.join(HERE, "run-clips.py"), "--song", str(a.song), "--expected", a.expected,
                                "--tolerance", str(a.tolerance), "--tag", tag, "--out", a.out], capture_output=True, text=True)
            l = T.Link(); time.sleep(0.3)
            try:
                f = l.fg() or {}
                try:
                    w = l.worst()
                except Exception:
                    w = None
                l.show_page("overview")
            finally:
                l.close()
            lines = [x for x in r.stdout.splitlines() if x.startswith(("PASS", "FAIL"))]
            ok = r.returncode == 0
            bad += 0 if ok else 1
            row = {"pass": n + 1, "page": page, "ok": ok, "lines": lines, "own_latest_ms": round(f.get("late_max_ms", -1), 2),
                   "own_4ms_or_more": (f.get("late_bins") or [0] * 6)[5], "worst_record": w}
            try:
                j = json.load(open(os.path.join(a.out, tag + "-clips.json")))
                for port in ("din", "usb"):
                    row[port] = {k: j[port].get(k) for k in ("matched", "expected_notes", "worst_ms", "std_ms", "tolerance_ms", "tempo_ratio")}
                row["audio"] = j.get("audio")
            except Exception as e:
                row["result_file"] = repr(e)
            rows.append(row)
            print("%s %s on %-8s DIN %s of %s worst %s ms; USB %s of %s worst %s ms; own latest %.2f ms (%d at 4 ms or more); audio %s" % (
                "PASS" if ok else "FAIL", tag, page,
                row.get("din", {}).get("matched"), row.get("din", {}).get("expected_notes"), "%.2f" % row["din"]["worst_ms"] if row.get("din", {}).get("worst_ms") is not None else "?",
                row.get("usb", {}).get("matched"), row.get("usb", {}).get("expected_notes"), "%.2f" % row["usb"]["worst_ms"] if row.get("usb", {}).get("worst_ms") is not None else "?",
                row["own_latest_ms"], row["own_4ms_or_more"], row.get("audio")), flush=True)
            if not ok:
                print("   " + " | ".join(lines)[:600] + (r.stdout[-300:] if not lines else ""), flush=True)
            n += 1
    finally:
        for s in spin:
            s.kill()
    json.dump({"tag": a.tag, "passes": rows, "bad": bad}, open(os.path.join(a.out, a.tag + "-soak.json"), "w"), indent=1)
    def worst(port):
        v = [r[port]["worst_ms"] for r in rows if r.get(port, {}).get("worst_ms") is not None]
        return max(v) if v else float("nan")
    print("%s %s: %d passes in %.0f minutes, %d bad; worst note DIN %.2f ms, USB %.2f ms; the device's own latest send %.2f ms" % (
        "PASS" if not bad and rows else "FAIL", a.tag, len(rows), a.minutes, bad, worst("din"), worst("usb"), max((r["own_latest_ms"] for r in rows), default=-1)))
    return 0 if not bad and rows else 1


if __name__ == "__main__":
    sys.exit(main())
