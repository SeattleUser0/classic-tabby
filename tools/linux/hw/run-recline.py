#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-recline.py — SEQ REC at the bar line: inside the grace the take starts on that line, after it it arms.

Purpose (the user's decision of 2026-11-25, docs/CONTROL-MAP.md 13.1)
    SEQ REC on a clip its track does not play launches the clip, and the take starts when the clip lands. A launch that
    reaches the SMK-37 within the grace after a bar line (about 20 ms) lands on that line. So:
        INSIDE   SEQ REC sent --inside ms after a bar line (default 3): the clip lands on THAT line and the take RUNS.
        OUTSIDE  SEQ REC sent --outside ms after a bar line (default 40, twice the grace): the take is ARMED, the clip
                 does not sound in that cycle; on the NEXT line the clip lands and the take runs.
    Between the two (the edge of the window, which moves with what the screen is drawing) nothing is judged.

What each check has to SEE (test song of tools/linux/hw/clips-song.mjs, 120 BPM, a cycle of 2 s; track 2 plays pitch
36 on channel 2 on every bar line; track 1 is launched on clip 1 = pitch 60, the STEP page is opened on its clip 2 =
pitch 72, which it does not play):
    INSIDE   on the DIN out a note 72 of channel 1 within -10..+60 ms of the line the press followed, and the STEP
             page's recording state = 2 (running) read 0.25 s after the press.
    OUTSIDE  the recording state = 1 (armed) read 0.25 s after the press; no note 72 from the press to 60 ms before
             the next line; a note 72 within -10..+60 ms of the next line; the recording state = 2 read 0.3 s after it.
    Every repeat prints where the press went out (ms after the line as the line really came) and what was heard. A
    press that went out more than 6 ms from where it was meant is not judged and is repeated (at most twice).

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-recline.py --out DIR [--song 7] [--repeats 5]

Version: 0.1

Revision log
    v0.1  2026-11-25  First version.
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, default=7)
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--inside", type=float, default=3.0, help="ms after the line: inside the grace")
    p.add_argument("--outside", type=float, default=40.0, help="ms after the line: outside the grace")
    p.add_argument("--repeats", type=int, default=5)
    p.add_argument("--tag", default="recline")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    din = T.Monitor(a.din); din.start()
    l = T.Link(); time.sleep(0.3)
    rows = []; results = []

    def check(good, text, detail=None):
        results.append(bool(good))
        print("%s %s%s" % ("PASS" if good else "FAIL", text, "" if detail is None else " (%s)" % (detail,)), flush=True)

    def idle(seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            l.messages(20)

    def bars(since=0):
        return [t for t, m in list(din.messages) if t > since and len(m) == 3 and m[0] == 0x91 and m[1] == 36 and m[2]]

    def notes(lo, hi):
        return [(t, m[1]) for t, m in list(din.messages) if lo <= t <= hi and len(m) == 3 and m[0] == 0x90 and m[2]]

    def wait_until(t_ns):
        while True:
            d = t_ns - T.now_ns()
            if d <= 0:
                return
            if d > 3_000_000:
                l.messages(1)

    def one(offset_ms):
        """One press of SEQ REC offset_ms after a bar line. Returns the row, or None when the press went out elsewhere."""
        l.release_all(); l.stop_song(); idle(0.4)
        l.edit_discard(); idle(0.2)
        l.show_page("clips"); idle(0.3)
        if l.clips_state()["track"] != 0:
            l.shift_pad(0); idle(0.3)
        t_play = T.now_ns()
        l.play_song(a.song - 1); idle(0.6)
        l.pad(0); idle(6.6)                                           # track 1 launched on clip 1 (pitch 60), whatever the scenes do
        b = bars(t_play)
        if len(b) < 3:
            return {"offset_ms": offset_ms, "error": "fewer than 3 bar lines heard after SEQ PLAY (%d)" % len(b)}
        cyc = (b[-1] - b[0]) / (len(b) - 1)
        playing = [pp for _, pp in notes(b[-1] - 10_000_000, b[-1] + 60_000_000)]
        l.edit_open(0, 1); idle(0.4)                                  # the STEP page on track 1's clip 2 (pitch 72)
        before = l.steps_state()["recording"]
        line = b[-1]
        while line + offset_ms * 1e6 - T.now_ns() < 400e6:
            line += cyc
        line = int(line)
        wait_until(line + int(offset_ms * 1e6))
        l.key(0, l.PANEL["REC"], 1); t_key = T.now_ns(); l.key(0, l.PANEL["REC"], 0)
        idle(0.25); soon = l.steps_state()["recording"]
        idle((line + cyc - T.now_ns()) / 1e9 + 0.3); later = l.steps_state()["recording"]
        idle(0.2)
        got = bars(line - 30_000_000)
        real = got[0] if got else line                              # the bar line as it really came
        sent = round((t_key - real) / 1e6, 2)
        at = [(round((t - real) / 1e6, 1), pp) for t, pp in notes(real - 10_000_000, real + 60_000_000)]
        inside = [(round((t - real) / 1e6, 1), pp) for t, pp in notes(max(real + 60_000_001, t_key), real + int(cyc) - 60_000_000)]
        nxt = [(round((t - real - cyc) / 1e6, 1), pp) for t, pp in notes(real + int(cyc) - 10_000_000, real + int(cyc) + 60_000_000)]
        l.stop_song(); idle(0.4); l.edit_discard(); idle(0.2)
        return {"offset_ms": offset_ms, "sent_after_line_ms": sent, "track_played_before": playing, "recording_before": before, "recording_0.25s_after_press": soon,
                "recording_after_next_line": later, "notes_at_line": at, "notes_inside_the_cycle": inside, "notes_at_next_line": nxt}

    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        l.select_song(a.song - 1); idle(0.3)
        for name, off in (("INSIDE", a.inside), ("OUTSIDE", a.outside)):
            good = 0; judged = 0; lines = []
            for n in range(a.repeats):
                r = None
                for attempt in range(3):
                    r = one(off)
                    if "error" in r or abs(r["sent_after_line_ms"] - off) <= 6.0:
                        break
                    r["not_judged"] = "the press went out %.1f ms after the line, meant %.1f" % (r["sent_after_line_ms"], off); rows.append(dict(r, case=name, n=n + 1))
                r = dict(r, case=name, n=n + 1)
                if not r.get("not_judged"):
                    rows.append(r)
                if "error" in r or r.get("not_judged") or abs(r["sent_after_line_ms"] - off) > 6.0:
                    lines.append("%d: not judged (%s)" % (n + 1, r.get("error") or "press at %.1f ms" % r["sent_after_line_ms"]))
                    continue
                judged += 1
                new_at = [ms for ms, pp in r["notes_at_line"] if pp == 72]
                new_next = [ms for ms, pp in r["notes_at_next_line"] if pp == 72]
                new_in = [ms for ms, pp in r["notes_inside_the_cycle"] if pp == 72]
                clean = 72 not in r["track_played_before"] and r["recording_before"] == 0
                if name == "INSIDE":
                    passed = clean and bool(new_at) and r["recording_0.25s_after_press"] == 2
                else:
                    passed = clean and not new_at and not new_in and r["recording_0.25s_after_press"] == 1 and bool(new_next) and r["recording_after_next_line"] == 2
                good += passed
                lines.append("%d: sent %.1f ms after the line; state 0.25 s later %d, after the next line %d; pitch 72 at the line %s, in the cycle %s, at the next line %s%s" % (
                    n + 1, r["sent_after_line_ms"], r["recording_0.25s_after_press"], r["recording_after_next_line"], new_at or "-", new_in or "-", new_next or "-",
                    "" if clean else "; NOT CLEAN before the press: played %s, state %d" % (r["track_played_before"], r["recording_before"])))
            for x in lines:
                print("     %s %s" % (name, x), flush=True)
            if name == "INSIDE":
                check(judged == a.repeats and good == judged, "SEQ REC %.0f ms after the bar line (inside the grace): the clip lands on that line and the take runs at once: %d of %d" % (off, good, a.repeats), "judged %d" % judged)
            else:
                check(judged == a.repeats and good == judged, "SEQ REC %.0f ms after the bar line (outside the grace): the take is armed, the clip silent in that cycle; on the next line the clip lands and the take runs: %d of %d" % (off, good, a.repeats), "judged %d" % judged)
    finally:
        try:
            l.release_all(); l.stop_song(); l.edit_discard(); l.show_page("overview")
        except Exception:
            pass
        l.close(); din.finish()
    json.dump({"tag": a.tag, "rows": rows}, open(os.path.join(a.out, a.tag + "-recline.json"), "w"), indent=1)
    bad = results.count(False)
    print("%s rec at the line: %d of %d checks passed" % ("PASS" if results and not bad else "FAIL", len(results) - bad, len(results)))
    return 0 if results and not bad else 1


if __name__ == "__main__":
    sys.exit(main())
