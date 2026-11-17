#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-chain.py — tabby-v04.11 on the device: clip chains set on the panel and played

Purpose
    docs/CONTROL-MAP.md section 17, checked on the device with nobody at the panel (remote panel events, the CLIP
    SETTING page read back with command 29 op 17, the TRS MIDI out on the DIN input). The song must be the one of
    tools/linux/hw/clips-song.mjs imported with {"record":"scenes","loop":true,"rowSteps":16}: track 1 has two clips
    with different notes in places 1 and 2. The run sets clip 1 to NEXT CLIP 2, TIMES 2 and clip 2 to NEXT STOP,
    AFTER 8 STEPS, saves both, launches clip 1 and reads what the track plays; import the song again afterwards.

    Checked: the three lines on the page; the settings are saved and read back from storage; clip 1 plays twice, clip
    2 starts on the cycle after, the track stops 8 steps into clip 2; the CLIPS page shows where the chain leads; the
    other tracks follow the scenes meanwhile; the audio counters.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-chain.py --song N --out DIR

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
K1, K2, K5 = 0, 1, 4
ROW = {"length": 0, "next": 1, "after": 2, "times": 3}


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

    def row(n):
        for _ in range(20):
            s = l.setup_state()
            if s["row"] == n:
                return
            l.knob(K5, 1 if n > s["row"] else -1); idle(0.12)

    def setting(name, want, coarse=False):
        row(ROW[name])
        for _ in range(140):
            v = l.setup_state()[name]
            if v == want:
                return True
            l.knob(K1, 1 if want > v else -1); idle(0.06)
        return False

    def open_setting(place):
        c = l.clips_state()
        if c["page_name"] != "CLIPS":
            l.show_page("overview"); l.press("BLUETOOTH"); idle(0.4); c = l.clips_state()
        if c["track"] != 0:
            l.shift_pad(0); idle(0.3)
        if l.clips_state()["selected"] != place:
            l.pad(place); idle(0.2); l.pad(place); idle(0.2)          # stopped: reserved, then taken back: selected
        l.press("FX"); idle(0.4)
        return l.setup_state()

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
        # ---- clip 1: NEXT CLIP 2, TIMES 2 ----
        u = open_setting(0)
        check(u["page_name"] == "SETTING" and u["place"] == 0 and u["rows"] == 10 and u["next"] == 0 and u["times"] == 1 and u["after"] == 0, "CLIP SETTING on clip 1: NEXT CLIP STAY, AFTER CLIP END, TIMES 1", (u["place"], u["rows"], u["next"], u["after"], u["times"]))
        ok = setting("next", 3) and setting("times", 2); u = l.setup_state()
        check(ok and u["unsaved"], "NEXT CLIP: STAY, STOP, CLIP 1, CLIP 2 with K1; TIMES 2; the clip is unsaved", (u["next"], u["times"]))
        l.setup_do(); idle(0.6); u = l.setup_state()
        check(not u["unsaved"], "saved (the 4th left button, stopped)")
        l.press("FX"); idle(0.3)
        # ---- clip 2: NEXT STOP, AFTER 8 STEPS ----
        u = open_setting(1)
        ok = setting("next", 1) and setting("after", 8); u = l.setup_state()
        check(ok and u["place"] == 1 and u["next"] == 1 and u["after"] == 8, "clip 2: NEXT CLIP STOP, AFTER 8 STEPS", (u["place"], u["next"], u["after"]))
        l.setup_do(); idle(0.6)
        l.press("FX"); idle(0.3)
        l.select_song(a.song - 1); idle(0.4)                            # from storage again
        u = open_setting(0); n1 = (u["next"], u["times"]); l.press("FX"); idle(0.3)
        u = open_setting(1); n2 = (u["next"], u["after"]); l.press("FX"); idle(0.3)
        check(n1 == (3, 2) and n2 == (1, 8), "read back from storage: both chains are stored with their clips", (n1, n2))
        # ---- play: clip 1 reserved, PLAY ----
        l.edit_discard()
        c = l.clips_state()
        l.pad(0); idle(0.3)
        mark = time.monotonic_ns()
        l.press("PLAY"); idle(1.2)
        c1 = l.clips_state()
        idle(8.5)
        c2 = l.clips_state(); st = l.remote_status()
        msgs = [(t, m) for t, m in list(din.messages) if t > mark]
        start = [t for t, m in msgs if list(m) == [0xFA]]
        clock = [t for t, m in msgs if list(m) == [0xF8]]
        cycle = (clock[-1] - clock[0]) / 1e6 / (len(clock) - 1) * 96.0 if len(clock) > 96 else 2000.0
        if check(bool(start), "PLAY starts the song"):
            t0 = start[0]
            ons = [((t - t0) / 1e6, m[0] & 15, m[1]) for t, m in msgs if len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2]]
            ch = ons[0][1] if ons else 0
            first = [x for x in ons if x[0] < 0.25 * cycle]
            chans = sorted(set(x[1] for x in ons))
            # track 1's channel: the one that falls silent; find per channel the last note time
            last = {c_: max(x[0] for x in ons if x[1] == c_) for c_ in chans}
            t1ch = min(last, key=last.get)
            mine = [x for x in ons if x[1] == t1ch]
            p1 = sorted(set(x[2] for x in mine if x[0] < 1.9 * cycle)); p2 = sorted(set(x[2] for x in mine if 2.0 * cycle - 5 <= x[0]))
            in1 = [x for x in mine if x[0] < 2.0 * cycle - 5]; in2 = [x for x in mine if x[0] >= 2.0 * cycle - 5]
            first2 = in2[0][0] if in2 else -1
            check(p1 and p2 and p1 != p2 and abs(first2 - 2.0 * cycle) <= 3.0, "clip 1 plays for two cycles, then clip 2 starts on the cycle line (its first note %.2f ms after it)" % (first2 - 2.0 * cycle), (p1, p2))
            check(in2 and max(x[0] for x in in2) < 2.5 * cycle + 5 and last[t1ch] < 2.5 * cycle + 5, "the track stops 8 steps into clip 2: nothing on its channel after that", "last note at %.0f ms, 2.5 cycles = %.0f" % (last[t1ch], 2.5 * cycle))
            others = [c_ for c_ in chans if c_ != t1ch]
            check(others and all(last[c_] > 4.0 * cycle for c_ in others), "the other tracks follow the scenes meanwhile", {c_: round(last[c_]) for c_ in others})
            measured["cycle_ms"] = round(cycle, 3); measured["clip2_start_error_ms"] = round(first2 - 2.0 * cycle, 2)
        check((c1["pads"][0]["code"] & 7) == 2 and (c2["pads"][0]["code"] & 7) == 1 and (c2["pads"][1]["code"] & 7) == 1, "the pads: clip 1 green at first; after the chain no pad of the track is green (it is stopped)", (c1["pads"][0]["code"], c2["pads"][0]["code"], c2["pads"][1]["code"]))
        l.press("PLAY"); idle(0.8)
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
    with open(os.path.join(a.out, "chain.json"), "w") as f:
        json.dump({"results": RESULTS, "measured": measured}, f, indent=1)
    print("%s clip chains: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
