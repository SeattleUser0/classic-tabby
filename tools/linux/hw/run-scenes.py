#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-scenes.py — Task 17 Goal 3: a launch lands on the song's master cycle

Purpose
    tabby-v04.6 reads song records of version 3 (scenes, a clip table per track, a master cycle). This script
    checks the master cycle on the device: it plays a looping song by remote command, then several times, at
    random moments, launches a track's pattern (remote op 9), stops it (op 10) and brings it back to the song
    (op 11), and measures on the TRS MIDI out where the launched pattern's first note falls: it must be a multiple
    of the cycle after the song's start (the cycle is given in steps; one step is 60 / (4 x BPM) s), the first
    multiple after the command (or the one after it when the command came within 50 ms of the boundary), and the
    note must be the pattern's first one. The song must be in the slot already, written as scenes with that cycle
    (workbench.mjs song --options '{"record":"scenes","loop":true}').

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-scenes.py --song N --track T --row R --cycle STEPS --bpm BPM --pitch P --out DIR

Version: 0.1

Revision log
    v0.1  2026-11-14  Task 17 Goal 3: first version.
"""
import argparse
import json
import os
import random
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, required=True)
    p.add_argument("--track", type=int, default=1, help="track to launch, 1 to 8")
    p.add_argument("--row", type=int, default=1, help="the scene whose clip of that track is launched, 1-based")
    p.add_argument("--cycle", type=int, required=True, help="the song's master cycle in steps")
    p.add_argument("--bpm", type=float, required=True)
    p.add_argument("--pitch", type=int, required=True, help="the pitch of the launched pattern's first note")
    p.add_argument("--channel", type=int, default=0, help="the track's MIDI channel, 1 to 16 (0: the device default for the track)")
    p.add_argument("--launches", type=int, default=6)
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--tolerance", type=float, default=4.0)
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    ch = (a.channel - 1) if a.channel else [0, 1, 2, 3, 4, 5, 6, 9][a.track - 1]
    cycle_ms = a.cycle * 60000.0 / (4.0 * a.bpm)
    din = T.Monitor(a.din); din.start()
    l = T.Link()
    random.seed(17)
    out = []
    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        l.stop_song(); time.sleep(0.5); l.messages(50)
        armed = time.monotonic_ns()
        l.play_song(a.song - 1)
        end = time.monotonic() + 2.0
        while time.monotonic() < end:
            l.messages(50)
        starts = [t for t, m in din.messages if t >= armed and list(m) == [0xFA]]
        if not starts:
            print("FAIL no MIDI Start on DIN"); return 1
        t0 = starts[0]
        for i in range(a.launches):
            wait = time.monotonic() + random.uniform(0.3, 2.2)
            while time.monotonic() < wait:
                l.messages(20)
            tc = time.monotonic_ns()
            l.launch(a.track - 1, a.row - 1)
            end = time.monotonic() + cycle_ms / 1000.0 * 2 + 1.0
            while time.monotonic() < end:
                l.messages(20)
            notes = [t for t, m in din.messages if t > tc and len(m) == 3 and m[0] == (0x90 | ch) and m[1] == a.pitch and m[2]]
            st = l.song_status() if hasattr(l, "song_status") else {}
            if not notes:
                out.append({"launch": i + 1, "pass": False, "error": "no note of the launched pattern"}); continue
            ms = (notes[0] - t0) / 1e6 * 1.0
            # the device runs 0.04 % slow against nominal (its audio clock): compare against cycles scaled by the measured tempo ratio 0.9996
            scaled = cycle_ms / 0.9996
            k = round(ms / scaled)
            err = ms - k * scaled
            cmd_ms = (tc - t0) / 1e6
            first = int(cmd_ms // scaled) + 1
            ok = abs(err) <= a.tolerance and (k == first or (k == first + 1 and first * scaled - cmd_ms < 50.0))
            out.append({"launch": i + 1, "command_ms": round(cmd_ms, 1), "note_ms": round(ms, 1), "cycle": k, "first_cycle_after_command": first,
                        "error_ms": round(err, 2), "pass": ok})
            l.stop_track(a.track - 1)
            end = time.monotonic() + cycle_ms / 1000.0 + 0.3
            while time.monotonic() < end:
                l.messages(20)
            l.attach(a.track - 1)
        l.stop_song(); time.sleep(0.3)
        h = l.health()
    finally:
        l.close(); din.finish()
    ok = bool(out) and all(o["pass"] for o in out)
    with open(os.path.join(a.out, "scenes-cycle.json"), "w") as f:
        json.dump({"cycle_steps": a.cycle, "cycle_ms": cycle_ms, "launches": out, "health": h}, f, indent=1)
    for o in out:
        print("%s launch %d: %s" % ("PASS" if o["pass"] else "FAIL", o["launch"], {k: v for k, v in o.items() if k not in ("launch", "pass")}))
    print("%s master cycle of %d steps (%.1f ms): %d of %d launches on the cycle; underruns %d, DMA overruns %d"
          % ("PASS" if ok else "FAIL", a.cycle, cycle_ms, sum(1 for o in out if o["pass"]), len(out), h["underruns"], h["dma_overruns"]))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
