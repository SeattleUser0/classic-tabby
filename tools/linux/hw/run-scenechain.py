#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-scenechain.py — tabby-v04.12 on the device: the scene chain from the SCENES page

Purpose
    docs/CONTROL-MAP.md section 18, checked on the device with nobody at the panel (remote panel events; the page read
    back with command 29 op 17 and op 12; the song's scene from the remote status). The song must be the one of
    tools/linux/hw/clips-song.mjs imported with {"record":"scenes","loop":true,"rowSteps":16} (scenes of one cycle each).

    Checked: a scene pad pressed while stopped reserves the start scene and takes it back; K1 changes the scene's
    times and K2 what follows it; PLAY starts at the reserved scene; the scene lasts its new length, to the cycle; the
    next scene follows by itself; K3 holds the chain and lets it go; a pad jumps; the save; the audio counters.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-scenechain.py --song N --out DIR

Version: 0.1

Revision log
    v0.1  2026-11-16  First version.
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

RESULTS = []
K1, K2, K3 = 0, 1, 2


def check(ok, what, detail=""):
    RESULTS.append({"pass": bool(ok), "what": what, "detail": str(detail)})
    print("%s %s%s" % ("PASS" if ok else "FAIL", what, (" (" + str(detail) + ")") if detail != "" else ""), flush=True)
    return ok


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, required=True)
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    din = T.Monitor(a.din); din.start()
    l = T.Link()
    measured = {}

    def idle(seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            l.messages(20)

    def scene_changes(until_s):
        """Poll the playing scene; returns [(seconds since the call, scene)] at each change."""
        out = []; t0 = time.monotonic(); last = None
        while time.monotonic() - t0 < until_s:
            st = l.remote_status()
            if st["row"] != last:
                out.append((time.monotonic() - t0, st["row"])); last = st["row"]
            idle(0.03)
        return out

    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        l.release_all(); l.stop_song(); idle(0.5)
        l.edit_discard()
        l.show_page("overview")
        l.select_song(a.song - 1); idle(0.3)
        h0 = l.health()
        l.press("BLUETOOTH"); idle(0.4); l.press("SCL"); idle(0.4)
        c = l.clips_state(); u = l.setup_state()
        check(c["page_name"] == "SONG" and u["scene"] == 0 and u["hold"] == 0, "SCENES; stopped, the knobs work on scene 1", (c["page_name"], u["scene"]))
        l.pad(1); idle(0.3); c = l.clips_state(); u = l.setup_state()
        check(u["scene"] == 1 and (c["pads"][1]["code"] & 7) == 3, "pad 2 while stopped: scene 2 is reserved (its pad blinks)", (u["scene"], c["pads"][1]["code"]))
        l.pad(1); idle(0.3); u1 = l.setup_state(); l.pad(1); idle(0.3); u = l.setup_state()
        check(u1["scene"] == 0 and u["scene"] == 1, "the pad again takes the reservation back; pressed once more it is reserved again", (u1["scene"], u["scene"]))
        times0, flags0 = u["scene_times"], u["scene_flags"]
        l.knob(K1, 2); idle(0.3); l.knob(K2, 1); idle(0.3); u = l.setup_state()
        check(u["scene_times"] == times0 + 2 and (u["scene_flags"] & 1) == 1 and u["unsaved"], "K1: two times more; K2 right: THEN STAY; the song is unsaved", (u["scene_times"], u["scene_flags"]))
        l.knob(K2, -1); idle(0.3); u = l.setup_state()
        check((u["scene_flags"] & 1) == 0, "K2 left: THEN NEXT")
        length_s = u["scene_steps"] * u["scene_times"] / 16.0 * 2.0 * 0.9996            # 120 BPM: a bar of 16 steps is 2 s
        mark = T.now_ns()
        l.press("PLAY")
        ch = scene_changes(length_s + 3.0)
        start = [t for t, m in list(din.messages) if t > mark and list(m) == [0xFA]]
        first = next((s for _, s in ch if s != 255), None)
        left = next((t for t, s in ch if s not in (1, 255) and t > 0.5), None)
        after = next((s for t, s in ch if s not in (1, 255) and t > 0.5), None)
        check(bool(start) and first == 1, "PLAY starts the song at the reserved scene 2", ch[:4])
        t_play = (start[0] - mark) / 1e9 if start else 0.0
        took = (left - t_play) if left is not None else -1
        check(left is not None and abs(took - length_s) <= 0.15 and after == 2, "scene 2 lasts its %d times (%.2f s), then scene 3 follows by itself" % (u["scene_times"], length_s), "%.2f s, then scene %s" % (took, None if after is None else after + 1))
        measured["scene_length_s"] = round(took, 3); measured["expected_s"] = round(length_s, 3)
        # ---- the hold ----
        l.knob(K3, 1); idle(0.2); u = l.setup_state()
        held_row = l.remote_status()["row"]
        idle(6.5); st = l.remote_status()
        check(u["hold"] == 1 and st["row"] == held_row, "K3 right: CHAIN HELD: the scene that plays repeats (still scene %d after 6.5 s)" % (held_row + 1), st["row"])
        l.knob(K3, -1); idle(0.2); u = l.setup_state()
        ch = scene_changes(5.0)
        check(u["hold"] == 0 and any(s != held_row for _, s in ch), "K3 left: CHAIN RUNS: the song goes on", ch[:3])
        l.pad(0); idle(2.6); st = l.remote_status()
        check(st["row"] == 0, "a pad jumps: scene 1 plays", st["row"])
        l.press("PLAY"); idle(0.8)
        l.edit_save(); idle(0.6); u = l.setup_state()
        check(not u["unsaved"], "stopped: the song is saved")
        l.select_song(a.song - 1); idle(0.4); l.pad(1); idle(0.3); u = l.setup_state(); l.pad(1); idle(0.2)
        check(u["scene"] == 1 and u["scene_times"] == times0 + 2 and (u["scene_flags"] & 1) == 0, "read again from storage: scene 2 keeps its times and THEN NEXT", (u["scene_times"], u["scene_flags"]))
        l.show_page("overview")
        h = l.health()
        check(h["underruns"] == h0["underruns"] and h["dma_overruns"] == h0["dma_overruns"], "no audio underrun, no DMA overrun during the test",
              "underruns +%d, DMA overruns +%d, render peak %.2f ms" % (h["underruns"] - h0["underruns"], h["dma_overruns"] - h0["dma_overruns"], h["render_peak_ms"]))
    finally:
        try:
            l.release_all()
        except Exception:
            pass
        l.close(); din.finish()
    ok = bool(RESULTS) and all(r["pass"] for r in RESULTS)
    with open(os.path.join(a.out, "scenechain.json"), "w") as f:
        json.dump({"results": RESULTS, "measured": measured}, f, indent=1)
    print("%s scene chain: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
