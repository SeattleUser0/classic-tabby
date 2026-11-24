#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-barline.py — how late before the bar line can a launch be pressed and still land on it?

Purpose (the user's question of 2026-11-22)
    A clip launch or a scene recall lands on the next master cycle (the bar line). The press has to be read (a key
    can be read up to 19 ms late while the screen draws a page whole), the clip prepared, and the change planned
    before the line. A press that comes too late waits a whole cycle. This tool measures where "too late" begins:
    with the test song playing (tools/linux/hw/clips-song.mjs: 120 BPM, a cycle of 2 s; track 2 plays pitch 36 on
    every bar line, track 1 has clip 1 = pitch 60 and clip 2 = pitch 72), it sends a pad press L ms before a bar line,
    for each L of --leads, --repeats times, and looks at the DIN out: the new clip's pitch at that line (LANDED), or
    the old one there and the new one a cycle later (WAITED A CYCLE). Three cases:
        clips        on the CLIPS page: the pad of the clip track 1 does not play
        scenes       on the SCENES page, the chain held (K3): the pad of the other scene
        page+clip    on SCENES: the BT key (the CLIPS page is drawn whole) and at once the clip's pad
    L is counted at this computer, from the moment the press is sent; the USB command takes about 1 ms of it. In the
    third case the figure that is judged is the moment the PAD is sent (the page key goes about 10 ms before it).
    LANDED: the new clip's pitch within -10..+60 ms of the line (after the old clip's note on the line, when the press
    came in the grace after it); its first note's distance from the line is reported.
    With --limit N the run fails when a press N ms or more before the line waited a cycle.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-barline.py --out DIR [--leads 100,60,40,30,25,20,15,10,6,3] [--limit 30]

Version: 0.3

Revision log
    v0.3  2026-11-24  A landing in the grace: the old clip's note on the line ends with the new clip's first note (3 ms at most).
    v0.2  2026-11-23  A landing in the grace after the line is seen (the old clip's note sounds on the line first); the pad's own
                      send time is the one judged; the first note's distance from the line.
    v0.1  2026-11-23  First version.
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
    p.add_argument("--leads", default="100,40,20,15,12,10,6,3,0,-5")
    p.add_argument("--repeats", type=int, default=6)
    p.add_argument("--cases", default="clips,scenes,page+clip")
    p.add_argument("--limit", type=float, default=0.0, help="ms: a press this long or longer before the line must land (0: report only)")
    p.add_argument("--tag", default="barline")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    leads = [float(x) for x in a.leads.split(",")]
    din = T.Monitor(a.din); din.start()
    l = T.Link(); time.sleep(0.3)
    rows = []

    def idle(seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            l.messages(20)

    def bars(since=0):
        return [t for t, m in list(din.messages) if t > since and len(m) == 3 and m[0] == 0x91 and m[1] == 36 and m[2]]

    def lead_notes(lo, hi):
        return [(t, m[1]) for t, m in list(din.messages) if lo <= t <= hi and len(m) == 3 and m[0] == 0x90 and m[2]]

    def lead_offs(lo, hi, pitch):
        return [t for t, m in list(din.messages) if lo <= t <= hi and len(m) == 3 and (m[0] == 0x80 or (m[0] == 0x90 and not m[2])) and m[1] == pitch]

    def next_bar(margin_ms):
        """The time (this computer's raw clock, ns) of the next bar line at least margin_ms away, and the cycle (ns)."""
        b = bars()[-6:]
        cyc = (b[-1] - b[0]) / (len(b) - 1)
        t = b[-1]
        while t - T.now_ns() < margin_ms * 1e6:
            t += cyc
        return int(t), cyc

    def wait_until(t_ns):
        while True:
            d = t_ns - T.now_ns()
            if d <= 0:
                return
            if d > 3_000_000:
                l.messages(1)
            # the last 3 ms: spin

    def pitch_at(line, cyc):
        """Track 1's notes on the bar line `line` and on the one after: (ms from the line, pitch) within -10..+60 ms of each.
        v0.2: all of them: a press in the grace after the line lands on it AFTER the old clip's note on the line has sounded."""
        out = []
        for k in (0, 1):
            out.append([(round((t - line - k * cyc) / 1e6, 1), pp) for t, pp in lead_notes(line + k * cyc - 10_000_000, line + k * cyc + 60_000_000)])
        return out

    try:
        l.release_all(); l.stop_song(); idle(0.5)
        l.select_song(a.song - 1); l.show_page("clips"); idle(0.3)
        if l.clips_state()["track"] != 0:
            l.shift_pad(0); idle(0.3)
        l.play_song(a.song - 1); idle(9.0)
        for case in a.cases.split(","):
            if case == "clips":
                l.show_page("clips"); idle(0.3)
                l.pad(0); idle(4.5)                                   # track 1 launched on clip 1 (pitch 60), whatever the scenes do
            else:
                l.show_page("scenes"); idle(0.3)
                # every track back to the scenes, and the chain held: the scene that plays repeats
                st = l.setup_state()
                if not st.get("hold"):
                    l.knob(2, 1); idle(0.3)
                l.pad(0); idle(4.5)                                   # scene 1 (track 1: pitch 60), recalled and held
            now_pitch = 60
            for L in leads:
                for n in range(a.repeats):
                    line, cyc = next_bar(L + 400.0)
                    want = 72 if now_pitch == 60 else 60
                    pad = 1 if want == 72 else 0
                    wait_until(line - int(L * 1e6))
                    t_send = T.now_ns()
                    if case == "page+clip":
                        l.key(0, l.PANEL["BLUETOOTH"], 1); l.key(3, pad, 100)
                        t_pad = T.now_ns()
                        l.key(3, pad, 0); l.key(0, l.PANEL["BLUETOOTH"], 0)
                    else:
                        l.key(3, pad, 100); t_pad = T.now_ns(); l.key(3, pad, 0)
                    idle((line - T.now_ns()) / 1e9 + cyc / 1e9 + 0.3)
                    b = bars(line - 30_000_000)
                    real = b[0] if b else line                      # the bar line as it really came
                    at, after = pitch_at(real, cyc)
                    landed = any(pp == want for _, pp in at)
                    waited = not landed and any(pp == want for _, pp in after)
                    first_ms = min((ms for ms, pp in at if pp == want), default=None)
                    # v0.3 (the user's answer of 2026-11-24): a landing in the grace: the old clip's note on the line must end where the
                    # new clip's first note begins (one short overlap, not two parts ringing together): its note-off, in ms after
                    # the new clip's first note
                    overlap = None
                    if landed and first_ms is not None and first_ms > 3.0 and any(pp == now_pitch for _, pp in at):
                        t_new = real + int(first_ms * 1e6)
                        offs = lead_offs(real - 5_000_000, real + 400_000_000, now_pitch)
                        overlap = round((offs[0] - t_new) / 1e6, 2) if offs else 999.0
                    rows.append({"case": case, "lead_ms": L, "n": n + 1, "sent_before_line_ms": round((real - t_pad) / 1e6, 2), "first_key_before_line_ms": round((real - t_send) / 1e6, 2),
                                 "landed": landed, "waited_a_cycle": waited, "first_note_after_line_ms": first_ms, "old_note_ends_after_new_ms": overlap, "notes_at_line": at, "notes_a_cycle_later": after})
                    if landed or waited:
                        now_pitch = want
                    if case == "page+clip":
                        # back to SCENES with every track following and scene 1 held, for the next press
                        l.show_page("scenes"); idle(0.2); l.pad(0); idle(2 * cyc / 1e9 + 0.3); now_pitch = 60
                    elif not (landed or waited):
                        idle(cyc / 1e9)
                got = [r for r in rows if r["case"] == case and r["lead_ms"] == L]
                print("%-9s %5.0f ms before the line: landed %d of %d, waited a cycle %d, neither %d (the pad sent %s ms before the line as it came; the new clip's first note %s ms after the line)" % (
                    case, L, sum(r["landed"] for r in got), len(got), sum(r["waited_a_cycle"] for r in got), sum(1 for r in got if not r["landed"] and not r["waited_a_cycle"]),
                    ", ".join("%.1f" % r["sent_before_line_ms"] for r in got), ", ".join("%.1f" % r["first_note_after_line_ms"] if r["first_note_after_line_ms"] is not None else "-" for r in got)), flush=True)
            if case != "clips":
                l.show_page("scenes"); idle(0.2); l.knob(2, -1); idle(0.3)        # the chain runs again
        l.stop_song(); idle(0.3)
    finally:
        try:
            l.release_all(); l.stop_song(); l.show_page("overview")
        except Exception:
            pass
        l.close(); din.finish()
    json.dump({"tag": a.tag, "rows": rows}, open(os.path.join(a.out, a.tag + "-barline.json"), "w"), indent=1)
    bad = 0
    for case in a.cases.split(","):
        got = [r for r in rows if r["case"] == case]
        missed = [r["sent_before_line_ms"] for r in got if r["waited_a_cycle"]]
        landed = [r["sent_before_line_ms"] for r in got if r["landed"]]
        neither = sum(1 for r in got if not r["landed"] and not r["waited_a_cycle"])
        latest_ok = min(landed) if landed else None
        earliest_miss = max(missed) if missed else None
        over = [m for m in missed if a.limit and m >= a.limit]
        laps = [r["old_note_ends_after_new_ms"] for r in got if r.get("old_note_ends_after_new_ms") is not None]
        ringing = [x for x in laps if x > 3.0]
        bad += len(over) + neither + (len(ringing) if a.limit else 0)
        if laps:
            print("%s %s: %d landing(s) in the grace after the old clip's note on the line: that note ended %.2f to %.2f ms after the new clip's first note (it must not ring on: 3 ms at most)%s" % (
                "FAIL" if ringing and a.limit else "ok  ", case, len(laps), min(laps), max(laps), "; %d rang on" % len(ringing) if ringing else ""))
        print("%s %s: the latest press that landed %s ms before the line; the earliest that waited a cycle %s ms before it; %d of %d landed; neither %d%s" % (
            "FAIL" if over or neither else "ok  ", case, "%.1f" % latest_ok if latest_ok is not None else "-", "%.1f" % earliest_miss if earliest_miss is not None else "-",
            len(landed), len(got), neither, ("; LIMIT %.0f ms: %d press(es) that early waited a cycle" % (a.limit, len(over))) if a.limit else ""))
    print("%s bar line: %s" % ("PASS" if not bad else "FAIL", "a press %.0f ms or more before the line always landed" % a.limit if a.limit and not bad else "see the lines above"))
    return 0 if not bad else 1


if __name__ == "__main__":
    sys.exit(main())
