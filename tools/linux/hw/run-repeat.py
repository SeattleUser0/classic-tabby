#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-repeat.py — tabby-v04.22 on the device: NOTE REPEAT repeats a held key; KNOB BANK + NOTE REPEAT is the focus switch

Purpose
    docs/CONTROL-MAP.md section 3.1, checked on the device with nobody at the panel (remote panel events; the
    panel's playing state read with command 29 op 18; the notes heard on the DIN MIDI out).

    Checked: NOTE REPEAT held switches the key track and the pad track to repeating and does not change the focus
    or the page; a held key then comes out again and again, evenly; K1 while NOTE REPEAT is held changes the rate
    (one click faster halves the time between notes); letting NOTE REPEAT go ends the repeats and leaves every
    track's ARP switch as it was; a track whose ARP is on is not touched; KNOB BANK + NOTE REPEAT switches the
    focus between keys and pads and back. The test sets the rate back and leaves the focus as it found it.

    The step loop (tabby-v04.23; the song of tools/linux/hw/clips-song.mjs, whose track 1 clip 1 plays pitch 60 on
    every beat): stopped, NOTE REPEAT + pad 9 does nothing; playing, with clip 1 launched, NOTE REPEAT + pad 9
    pressed just after a beat repeats that step (a note every 16th), pad 10 the last two steps (a note every 8th);
    no pad launches a clip while NOTE REPEAT is down; after the pad is let go the notes fall on the beats the song
    had before the loop.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-repeat.py --song N --out DIR

Version: 0.3

Revision log
    v0.3  2026-11-18  The one-step loop cannot be aimed by remote: from a note heard on the DIN out to the pad on the
                      device takes 125 to 250 ms here, more than a step (candidate 1 of tabby-v04.23: one check failed
                      for this; docs/BUILD.md 59.1). One step now passes when the step repeats its note or, if the
                      pad came a step late, plays nothing but that step's silence; new: pad 12 (8 steps) on track 2's
                      bass note, which a late pad cannot miss.
    v0.2  2026-11-18  tabby-v04.23: the step loop (NOTE REPEAT + pad 9 or 10 on CLIPS while the song plays): the loop's
                      period on the MIDI out, nothing launched meanwhile, the song back on its beats afterwards.
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
        # ---- the step loop (tabby-v04.23) ----
        l.press("BLUETOOTH"); idle(0.4)
        if l.clips_state()["page_name"] != "CLIPS":
            l.press("BLUETOOTH"); idle(0.4)
        l.shift_pad(0); idle(0.3)
        c = l.clips_state()
        l.key(0, NOTE_REPEAT, 1); idle(0.2); l.pad(8, hold=0.3); idle(0.2); l.key(0, NOTE_REPEAT, 0); idle(0.3)
        st = l.remote_status(); c2 = l.clips_state()
        check(c["page_name"] == "CLIPS" and st["song_state"] == 0 and [p_["code"] for p_ in c2["pads"]] == [p_["code"] for p_ in c["pads"]],
              "the song stopped: NOTE REPEAT + pad 9 loops nothing and queues nothing", st["song_state"])
        l.clip_launch(0, 0); idle(0.2)
        l.press("PLAY"); idle(4.2)                                  # two bars: clip 1 loops on track 1 (60 on every beat)
        beats = [t for t, p_ in ons(time.monotonic_ns() - 3_000_000_000) if p_ == 60]
        beat = (beats[-1] - beats[0]) / 1e6 / (len(beats) - 1) if len(beats) > 1 else 0.0   # the mean over the bars heard
        check(len(beats) >= 4 and 400.0 < beat < 600.0, "the song plays; track 1 plays 60 on every beat, %.1f ms apart" % beat, len(beats))

        def after_beat():
            """Wait for the next 60 of track 1 on the MIDI out; its time, or None."""
            seen = len(din.messages); t_end = time.monotonic() + 3.0
            while time.monotonic() < t_end:
                l.messages(2)
                new = [t for t, m in list(din.messages)[seen:] if len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[1] == 60 and m[2]]
                if new:
                    return new[0]
            return None

        def gaps60(since, until):
            t = [x for x, p_ in ons(since, until) if p_ == 60]
            return [(b - c_) / 1e6 for c_, b in zip(t, t[1:])]

        loops = {}
        for pad, steps in ((8, 1), (9, 2)):
            l.key(0, NOTE_REPEAT, 1); idle(0.3)
            lit = l.clips_state()["pads"]
            ref = after_beat()
            l.key(3, pad, 100)
            t5 = time.monotonic_ns(); idle(1.6); t6 = time.monotonic_ns()
            g = gaps60(t5 + 60_000_000, t6); m = median(g)
            worst = max((abs(x - m) for x in g), default=99.0)
            expect = beat / 4.0 * steps
            quiet = steps == 1 and not [1 for t, p_ in ons(t5 + 300_000_000, t6) if p_ == 60]   # v0.3: the pad came after the beat's step: that step is empty
            check(ref is not None and (quiet or (len(g) >= (6 if steps == 1 else 3) and abs(m - expect) <= 3.0 and worst <= a.even)),
                  "NOTE REPEAT + pad %d just after a beat: the last %d step%s repeat: 60 every %.1f ms (%.1f expected)" % (pad + 1, steps, "" if steps == 1 else "s", m, expect), "%d notes, worst %.2f ms" % (len(g) + 1, worst))
            if pad == 8:
                check(lit[8]["rgb"] and lit[11]["rgb"] and not lit[12]["rgb"] and not lit[15]["rgb"], "while NOTE REPEAT is down pads 9 to 12 are lit and 13 to 16 dark")
                q = [p_["code"] for p_ in l.clips_state()["pads"][:8]]
                l.pad(1, hold=0.1); idle(0.2)
                check([p_["code"] for p_ in l.clips_state()["pads"][:8]] == q, "another pad pressed meanwhile launches nothing")
            l.key(3, pad, 0); idle(0.1); l.key(0, NOTE_REPEAT, 0)
            t7 = time.monotonic_ns(); idle(2.6)
            back = [t for t, p_ in ons(t7 + 300_000_000) if p_ == 60]
            off = [(((t - (ref or beats[0])) / 1e6 + beat / 2) % beat) - beat / 2 for t in back]
            check(len(back) >= 3 and all(abs(x) <= 8.0 for x in off), "the pad let go: 60 is back on the beats the song had before the loop", ["%+.1f" % x for x in off[:4]])
            loops[steps] = {"gap_ms": round(m, 2), "worst_ms": round(worst, 2), "expected_ms": round(expect, 2)}
        # v0.3: eight steps on track 2 (36 on beat 1, 38 on beat 3 of each bar): after a 36 the last eight steps hold 36 and not 38
        l.key(0, NOTE_REPEAT, 1); idle(0.3)
        seen = len(din.messages); t_end = time.monotonic() + 4.0; got = None
        while time.monotonic() < t_end and got is None:
            l.messages(2)
            hit = [t for t, m in list(din.messages)[seen:] if len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[1] == 36 and m[2]]
            got = hit[0] if hit else None
        l.key(3, 11, 100)
        t8 = time.monotonic_ns(); idle(4.3); t9 = time.monotonic_ns()
        n36 = [t for t, p_ in ons(t8 + 100_000_000, t9) if p_ == 36]; n38 = [t for t, p_ in ons(t8 + 100_000_000, t9) if p_ == 38]
        g36 = [(b - c_) / 1e6 for c_, b in zip(n36, n36[1:])]
        check(got is not None and len(n36) >= 3 and not n38 and all(abs(x - 2 * beat) <= 3.0 for x in g36),
              "NOTE REPEAT + pad 12 after the bass note of beat 1: the last 8 steps repeat: 36 every %.1f ms (%.1f expected), 38 does not come" % (median(g36), 2 * beat), "%d and %d notes" % (len(n36), len(n38)))
        l.key(3, 11, 0); idle(0.1); l.key(0, NOTE_REPEAT, 0); idle(2.6)
        loops[8] = {"gap_ms": round(median(g36), 2), "expected_ms": round(2 * beat, 2)}
        measured["step_loop"] = loops; measured["beat_ms"] = round(beat, 2)
        l.press("PLAY"); idle(0.8)
        l.show_page("overview")
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
