#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-program.py — tabby-v04.13 on the device: a clip's program and bank, and the controller knobs

Purpose
    docs/CONTROL-MAP.md section 19, checked on the device with nobody at the panel (remote panel events, command 29 op
    17, the TRS MIDI out on the DIN input). The song must be the one of tools/linux/hw/clips-song.mjs imported with
    {"record":"scenes","loop":true,"rowSteps":16}; the run changes clip 1 of track 1 and saves it (import again after).

    Checked: PROGRAM, BANK MSB and BANK LSB on CLIP SETTING; saved and read back; bank select and program change go out
    on the track's channel when the track enters the clip, before its first note; K1 on CLIPS sends controller 74; a
    take records the knob (thinned) and the clip plays it back in its following loops; the audio counters.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-program.py --song N --out DIR

Version: 0.2

Revision log
    v0.2  2026-11-17  K1 is set to 64 first (the tabby-v04.15-rc2 run had no fresh start: the knob's value was 98).
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
K1, K5 = 0, 4


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

    def idle(seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            l.messages(20)

    def row(n):
        for _ in range(24):
            s = l.setup_state()
            if s["row"] == n:
                return
            l.knob(K5, 1 if n > s["row"] else -1); idle(0.12)

    def setting(r, name, want):
        row(r)
        for _ in range(140):
            v = l.setup_state()[name]
            if v == want:
                return True
            l.knob(K1, 1 if (want != 255 and (v == 255 or want > v)) else -1); idle(0.06)
        return False

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
        l.press("BLUETOOTH"); idle(0.4)
        if l.clips_state()["track"] != 0:
            l.shift_pad(0); idle(0.3)
        l.pad(0); idle(0.2); l.pad(0); idle(0.2)
        l.press("FX"); idle(0.4); u = l.setup_state()
        check(u["page_name"] == "SETTING" and u["rows"] >= 18 and u["program"] == 255 and u["bank_msb"] == 255, "CLIP SETTING on clip 1: PROGRAM OFF, BANK OFF", (u["rows"], u["program"], u["bank_msb"]))
        ok = setting(4, "program", 5) and setting(5, "bank_msb", 2) and setting(6, "bank_lsb", 7); u = l.setup_state()
        check(ok and u["unsaved"], "PROGRAM 6, BANK MSB 2, BANK LSB 7", (u["program"], u["bank_msb"], u["bank_lsb"]))
        l.setup_do() if u["row"] != 7 else None; idle(0.6)
        l.press("FX"); idle(0.3); l.select_song(a.song - 1); idle(0.4)
        l.pad(0); idle(0.2); l.pad(0); idle(0.2); l.press("FX"); idle(0.4); u = l.setup_state(); l.press("FX"); idle(0.3)
        check((u["program"], u["bank_msb"], u["bank_lsb"]) == (5, 2, 7) and not u["unsaved"], "saved and read back from storage", (u["program"], u["bank_msb"], u["bank_lsb"]))
        # ---- the clip launched: bank and program before its first note ----
        l.edit_discard(); l.pad(0); idle(0.3)
        mark = T.now_ns()
        l.press("PLAY"); idle(2.5)
        msgs = [(t, list(m)) for t, m in list(din.messages) if t > mark and len(m) >= 2 and m[0] < 0xF0]
        pcs = [(t, m) for t, m in msgs if (m[0] & 0xF0) == 0xC0 and m[1] == 5]
        if check(bool(pcs), "a program change 6 goes out", [m for _, m in msgs[:6]]):
            ch = pcs[0][1][0] & 15; tpc = pcs[0][0]
            b0 = [t for t, m in msgs if m[:3] == [0xB0 | ch, 0, 2]]; b32 = [t for t, m in msgs if m[:3] == [0xB0 | ch, 32, 7]]
            notes = [t for t, m in msgs if m[0] == (0x90 | ch) and len(m) == 3 and m[2]]
            check(b0 and b32 and b0[0] <= b32[0] <= tpc and notes and tpc <= notes[0] and (notes[0] - b0[0]) / 1e6 < 12.0,
                  "bank MSB 2, LSB 7, then the program, on the track's channel %d, before the clip's first note" % (ch + 1), "%.2f ms from the bank select to the note" % ((notes[0] - b0[0]) / 1e6 if b0 and notes else -1))
        # ---- K1 on CLIPS sends controller 74; a take records it ----
        # v0.2: the knob keeps its value while the power is on: to the bottom, then to 64, where a fresh start has it
        l.knob(K1, -64); idle(0.3); l.knob(K1, 32); idle(0.4)
        t1 = T.now_ns()
        l.knob(K1, 3); idle(0.4)
        cc = [m for t, m in list(din.messages) if t > t1 and len(m) == 3 and (m[0] & 0xF0) == 0xB0 and m[1] == 74]
        check(len(cc) == 1 and cc[0][2] == 70, "K1 on CLIPS, three clicks: one controller 74 message, value 64 + 6", [list(m) for m in cc])
        live_ch = cc[0][0] & 15 if cc else 0
        l.press("REC"); idle(2.5); s = l.steps_state(); before = s["events"]
        check(s["recording"] == 2, "REC: the take runs (the clip loops already)", s["recording"])
        for _ in range(12):
            l.knob(K1, 1); idle(0.02)      # v0.2: well under a 1/32 note apart (at 0.05 s the spacing was near one 1/32 and 7 to 9 events were all correct)
        idle(1.5); s = l.steps_state(); grown = s["events"] - before
        check(1 <= grown <= 8, "twelve clicks of K1 in under a second are recorded as %d controller events (thinned)" % grown, grown)
        l.press("REC"); idle(0.3)
        t2 = T.now_ns(); idle(4.5)
        back = [list(m) for t, m in list(din.messages) if t > t2 and len(m) == 3 and (m[0] & 0xF0) == 0xB0 and m[1] == 74]
        check(len(back) >= grown and back and back[-1][2] == 94, "the clip plays the knob movement back in its following loops; its last value is the last one turned (94)", back[:8])
        l.press("PLAY"); idle(0.8)
        l.edit_discard(); l.show_page("overview")
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
    with open(os.path.join(a.out, "program.json"), "w") as f:
        json.dump({"results": RESULTS}, f, indent=1)
    print("%s program and knobs: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
