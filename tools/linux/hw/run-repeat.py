#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-repeat.py — tabby-v04.22 on the device: NOTE REPEAT repeats a held key; KNOB BANK + NOTE REPEAT is the focus switch

Purpose
    docs/CONTROL-MAP.md section 3.1, checked on the device with nobody at the panel (remote panel events; the
    panel's playing state read with command 29 op 18; the notes heard on the DIN MIDI out).

    Checked: NOTE REPEAT held switches the key track and the pad track to repeating and does not change the focus
    or the page; a held key then comes out again and again, evenly (the arpeggiator starts notes on audio blocks of
    2.9 ms, so two intervals can differ by one block: the limit is 4.5 ms from the median); K1 while NOTE REPEAT is held changes the rate
    (one click faster halves the time between notes); letting NOTE REPEAT go ends the repeats and leaves every
    track's ARP switch as it was; a track whose ARP is on is not touched; KNOB BANK + NOTE REPEAT switches the
    focus between keys and pads and back. The test sets the rate back and leaves the focus as it found it.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-repeat.py --song N --out DIR

Version: 0.1

Revision log
    v0.1  2026-11-18  First version.
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

RESULTS = []
K1 = 0
NOTE_REPEAT, SHIFT, ARP = 7, 0, 6


def check(ok, what, detail=""):
    RESULTS.append({"pass": bool(ok), "what": what, "detail": str(detail)})
    print("%s %s%s" % ("PASS" if ok else "FAIL", what, (" (" + str(detail) + ")") if detail != "" else ""), flush=True)
    return ok


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, required=True)
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--even", type=float, default=4.5, help="ms: how far one interval between repeats may lie from their median")
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

    def panel():
        d = l.query(29, bytes([18]), attempts=1)
        if len(d) < 9 or d[0] != 5:
            raise T.DeviceError(-1)
        return {"focus": d[1], "repeat": d[2] | d[3] << 7, "arp": d[4] | d[5] << 7, "key_track": d[6], "pad_track": d[7], "rate": d[8]}

    def ons(since, until=None):
        return [(t, m[1]) for t, m in list(din.messages) if t > since and (until is None or t <= until) and len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2]]

    def gaps(since, until):
        t = [x for x, _ in ons(since, until)]
        return [(b - c) / 1e6 for c, b in zip(t, t[1:])]

    def median(v):
        v = sorted(v)
        return v[len(v) // 2] if v else 0.0

    s0 = None
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
        s0 = panel()
        if s0["arp"] & (1 << s0["key_track"]):                      # the test wants the key track's ARP off; it is put back at the end
            l.press("ARP"); idle(0.4)
        s = panel(); page0 = l.remote_status()["page_name"]
        check(s["repeat"] == 0 and not s["arp"] & (1 << s["key_track"]), "nothing repeats; the key track (track %d) has its ARP off; rate setting %d" % (s["key_track"] + 1, s["rate"]), s)
        rate0 = s["rate"]
        if rate0 == 3:                                              # room for one click faster
            l.key(0, NOTE_REPEAT, 1); idle(0.2); l.knob(K1, -1); idle(0.3); l.key(0, NOTE_REPEAT, 0); idle(0.3)
        base = panel()["rate"]
        # ---- NOTE REPEAT held, a key held ----
        l.key(0, NOTE_REPEAT, 1); idle(0.3); s = panel(); st = l.remote_status()
        check(s["repeat"] & (1 << s["key_track"]) and s["arp"] & (1 << s["key_track"]) and s["focus"] == s0["focus"] and st["page_name"] == page0,
              "NOTE REPEAT held: the key track repeats; the focus and the page stay", (s, st["page_name"]))
        t0 = time.monotonic_ns()
        l.key(1, 12, 100); idle(2.2)
        t1 = time.monotonic_ns()
        g1 = gaps(t0, t1); m1 = median(g1); n1 = len(g1) + 1
        worst1 = max((abs(x - m1) for x in g1), default=99.0)
        check(n1 >= 3 and worst1 <= a.even, "a held key repeats: %d notes in 2.2 s, %.1f ms apart, each within %.1f ms of that" % (n1, m1, a.even), "worst %.2f ms" % worst1)
        pitches = {p_ for _, p_ in ons(t0, t1)}
        check(len(pitches) == 1, "it is one pitch that repeats", sorted(pitches))
        l.knob(K1, 1); idle(0.4)
        t2 = time.monotonic_ns(); idle(2.2); t3 = time.monotonic_ns()
        g2 = gaps(t2, t3); m2 = median(g2); s = panel()
        worst2 = max((abs(x - m2) for x in g2), default=99.0)
        check(s["rate"] == base + 1 and g2 and 0.45 <= m2 / m1 <= 0.55 and worst2 <= a.even, "K1 one click right while NOTE REPEAT is held: twice as fast (%.1f ms apart)" % m2, "ratio %.3f, worst %.2f ms" % (m2 / m1 if m1 else 0, worst2))
        l.knob(K1, -1); idle(0.3)
        l.key(0, NOTE_REPEAT, 0); idle(0.3)
        t4 = time.monotonic_ns(); idle(1.2)
        late = ons(t4 + 150_000_000)
        s = panel()
        check(not late and s["repeat"] == 0 and not s["arp"] & (1 << s["key_track"]) and s["rate"] == base, "NOTE REPEAT let go with the key still down: nothing repeats, the ARP switch is off again", (len(late), s))
        l.key(1, 12, 0); idle(0.3)
        measured = {"gap_ms": round(m1, 2), "worst_ms": round(worst1, 2), "gap_fast_ms": round(m2, 2), "worst_fast_ms": round(worst2, 2), "notes": n1}
        # ---- a track whose ARP is on is left alone ----
        l.press("ARP"); idle(0.4); s = panel()
        on = bool(s["arp"] & (1 << s["key_track"]))
        l.key(0, NOTE_REPEAT, 1); idle(0.3); held = panel(); l.key(0, NOTE_REPEAT, 0); idle(0.3); s = panel()
        check(on and not held["repeat"] & (1 << held["key_track"]) and s["arp"] & (1 << s["key_track"]), "with the track's ARP on, NOTE REPEAT leaves it alone and it stays on afterwards", (held, s))
        l.press("ARP"); idle(0.4)
        # ---- the focus switch ----
        l.hold([SHIFT, NOTE_REPEAT], 0.15); idle(0.4); s = panel(); st = l.remote_status()
        check(s["focus"] == 1 - s0["focus"] and s["repeat"] == 0 and st["page_name"] == "OVERVIEW", "KNOB BANK + NOTE REPEAT: the focus goes from %s to %s; nothing repeats" % (("keys", "pads")[s0["focus"]], ("keys", "pads")[1 - s0["focus"]]), (s, st["page_name"]))
        l.hold([SHIFT, NOTE_REPEAT], 0.15); idle(0.4); s = panel()
        check(s["focus"] == s0["focus"], "and back", s["focus"])
        if rate0 != base:
            l.key(0, NOTE_REPEAT, 1); idle(0.2); l.knob(K1, rate0 - base); idle(0.3); l.key(0, NOTE_REPEAT, 0); idle(0.3)
        if s0["arp"] & (1 << s0["key_track"]):
            l.press("ARP"); idle(0.4)
        s = panel()
        check(s["arp"] == s0["arp"] and s["rate"] == rate0 and s["focus"] == s0["focus"], "the ARP switches, the rate and the focus are as the test found them", s)
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
    with open(os.path.join(a.out, "repeat.json"), "w") as f:
        json.dump({"results": RESULTS, "measured": measured}, f, indent=1)
    print("%s note repeat: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
