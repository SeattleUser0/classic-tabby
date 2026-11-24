#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-guard.py — what trips the CPU guard while a song plays, part by part

Purpose
    The sound engine (sdk/lib/libfm1_engine.a) takes voices back when a block's rendering comes near its deadline
    ("CPU GUARD adapted", command 18). This tool plays a song and reads the engine's counters twice a second: how
    often the guard adapted, the render time of a block (last and peak), the voice capacity it allows, underruns
    and DMA overruns. It does so with the song as it is, then with one track at a time muted altogether (KNOB BANK +
    pad 9 to 16: the track's sound and its song notes), then with every track's internal sound muted on the mixer
    (GLOBE, pads 1 to 8), and puts every mute back. Nothing is written to flash.

    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-guard.py --song 6 --seconds 20 --out OUT

Version: 0.2

Revision log
    v0.2  2026-11-20  The mixer case mutes exactly the tracks that were on and unmutes them; a PASS / FAIL line for the
                      release run (tabby-v1.2.1: muted internal sounds are not rendered for the song).
    v0.1  2026-11-20  First version (the user's question of 2026-11-20: why is CPU GUARD on for the whole song).
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import argparse, json, sys, time
from pathlib import Path

HW = Path(__file__).resolve().parent
sys.path.insert(0, str(HW))
import tabby_link as T


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--song", type=int, default=6)
    ap.add_argument("--seconds", type=float, default=20.0)
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", default="", help="comma list of case names to run")
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    l = T.Link(); time.sleep(0.3)
    res = []

    def measure(name):
        l.stop_song(); time.sleep(0.6)
        l.play_song(a.song - 1); time.sleep(1.0)
        h0 = l.health(); t0 = time.time(); rows = []
        while time.time() - t0 < a.seconds:
            time.sleep(0.5)
            h = l.health(); rows.append(h)
        h1 = rows[-1]; secs = time.time() - t0
        l.stop_song(); time.sleep(0.6)
        r = {"case": name, "seconds": round(secs, 1), "adapted_per_s": round((h1["adapted"] - h0["adapted"]) / secs, 2),
             "render_last_ms": [round(min(x["render_ms"] for x in rows), 3), round(sum(x["render_ms"] for x in rows) / len(rows), 3), round(max(x["render_ms"] for x in rows), 3)],
             "render_peak_ms": round(h1["render_peak_ms"], 3), "deadline_ms": round(h1["deadline_ms"], 3),
             "voice_capacity": sorted({x["voice_capacity"] for x in rows}), "overloads": h1["overloads"] - h0["overloads"],
             "underruns": h1["underruns"] - h0["underruns"], "dma_overruns": h1["dma_overruns"] - h0["dma_overruns"]}
        res.append(r); print(json.dumps(r), flush=True)

    want = [x for x in a.only.split(",") if x]
    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        l.stop_song(); time.sleep(0.4)
        l.select_song(a.song - 1)
        if not want or "as it is" in want:
            measure("as it is")
        # one track at a time muted altogether (sound and song notes); CLIPS shows the mutes on the pads
        l.show_page("clips")
        for t in range(8):
            name = "without track %d" % (t + 1)
            if want and name not in want:
                continue
            l.shift_pad(8 + t); time.sleep(0.3)
            try:
                measure(name)
            finally:
                l.show_page("clips"); l.shift_pad(8 + t); time.sleep(0.3)
        if not want or "internal sounds muted" in want:
            # every internal sound muted on the mixer (GLOBE, pads 1 to 8): the song's notes still go out on MIDI. Only
            # the tracks that were not muted are touched, and they are unmuted again.
            l.show_page("overview"); l.press("BLUETOOTH"); time.sleep(0.4)
            l.key(0, 0, 1); time.sleep(0.25); pads = l.clips_state()["pads"]; l.key(0, 0, 0); time.sleep(0.2)
            on = [t for t in range(8) if pads[8 + t]["rgb"] not in (0x301008, 0x081030)]
            l.show_page("mixer")
            for t in on:
                l.pad(t); time.sleep(0.15)
            try:
                measure("internal sounds muted")
            finally:
                l.show_page("mixer")
                for t in on:
                    l.pad(t); time.sleep(0.15)
            l.show_page("overview")
    finally:
        try:
            l.stop_song(); l.remote(7)
        except Exception:
            pass
        l.close()
    (out / "guard.json").write_text(json.dumps(res, indent=1) + "\n")
    by = {r["case"]: r for r in res}
    if "as it is" in by and "internal sounds muted" in by:
        a0, m0 = by["as it is"], by["internal sounds muted"]
        clean = all(r["underruns"] == 0 and r["dma_overruns"] == 0 and r["overloads"] == 0 for r in res)
        # v0.2 (tabby-v1.2.1): a song whose internal sounds are all muted must not load the engine: no guard, and a block
        # rendered in well under what the song costs with its sounds on
        ok = clean and m0["adapted_per_s"] == 0 and m0["render_last_ms"][1] < 0.6 * a0["render_last_ms"][1]
        print("%s guard: as it is %.2f adaptations a second, a block %.2f ms (of %.2f), voices %s; every internal sound muted: %.2f a second, a block %.2f ms, voices %s; underruns, DMA overruns, overloads: %s"
              % ("PASS" if ok else "FAIL", a0["adapted_per_s"], a0["render_last_ms"][1], a0["deadline_ms"], a0["voice_capacity"], m0["adapted_per_s"], m0["render_last_ms"][1], m0["voice_capacity"], "none" if clean else "SOME"))
        return 0 if ok else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
