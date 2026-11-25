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
    With --limit (any value but 0) the run fails when a press sent at or before the line did not land with its first note,
    when a clip landed without its first note at any lead, or when an old note rang on.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-barline.py --out DIR [--leads 100,60,40,30,25,20,15,10,6,3] [--limit 30]

Version: 0.5

Revision log
    v0.5  2026-11-25  The grace window is judged (the user's rule): with --limit every press sent up to --window-in ms after the
                      line must land on it with its first note, every press sent --window-out ms or more after it must
                      wait and land on the next line with its first note, between the two either; any other outcome
                      fails; each case needs 3 presses on each side. Until v0.3 only presses 12 ms and earlier were
                      judged and "60 of 60 landed" was a printed figure, not a check: tabby-v1.5 passed with 36 of 60
                      (docs/BUILD.md 71.2). Leads now reach 45 ms after the line. The lines are taken from the song's
                      own grid (a recall in the grace doubles track 2's note and the old estimate sent presses 400 ms
                      early).
    v0.4  2026-11-25  A clip that landed without its first note is not "waited a cycle": it is counted apart and fails the run.
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
    p.add_argument("--leads", default="100,40,20,12,8,6,5,3,0,-1,-2,-4,-30,-45")
    p.add_argument("--window-in", type=float, default=3.0, help="ms after the line: a press sent up to here must land on that line")
    p.add_argument("--window-out", type=float, default=24.0, help="ms after the line: a press sent from here on must wait for the next line")
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
    rows = []; t_play = [0]

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
        # v0.5: from the song's own grid: the first bar line after SEQ PLAY and the cycle, refined over every bar note that
        # lies on the grid. Until v0.4 the cycle was the mean distance of the last six bar notes; a recall that lands in
        # the grace plays track 2's note on the line a second time, six notes then span four cycles, and the next
        # "line" was 400 or 800 ms early: half the presses of the scenes case in the tabby-v1.5 and v1.5.1-rc1 runs were
        # sent that early (they landed, and tested nothing).
        b = bars(t_play[0])
        t0 = b[0]; cyc = 2.0e9; last_k = 0
        for t in b[1:]:
            k = round((t - t0) / cyc)
            if k > last_k and abs(t - t0 - k * cyc) < 12_000_000:
                cyc = (t - t0) / k; last_k = k
        k = int((T.now_ns() + margin_ms * 1e6 - t0) // cyc) + 1
        return int(t0 + k * cyc), cyc

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
        t_play[0] = T.now_ns()
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
                    b = [t for t in bars(line - 30_000_000) if t < line + 30_000_000]
                    real = b[0] if b else line                      # the bar line as it really came (v0.5: only a bar note at the line itself)
                    at, after = pitch_at(real, cyc)
                    landed = any(pp == want for _, pp in at)
                    # v0.4: "waited a cycle" only when the new clip is silent for the whole cycle. A clip that landed WITHOUT its
                    # first note plays its later notes in that cycle: that is neither landing nor waiting, and it fails the run
                    # at any lead (v0.3 called it "waited": tabby-v1.5 was released with 24 such launches in its own figures).
                    inside = [(round((t - real) / 1e6, 1), pp) for t, pp in lead_notes(real + 60_000_001, real + int(cyc) - 60_000_000)]
                    headless = not landed and any(pp == want for _, pp in inside)
                    waited = not landed and not headless and any(pp == want for _, pp in after)
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
                                 "landed": landed, "waited_a_cycle": waited, "landed_without_first_note": headless, "notes_inside_the_cycle": inside[:6], "first_note_after_line_ms": first_ms, "old_note_ends_after_new_ms": overlap, "notes_at_line": at, "notes_a_cycle_later": after})
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
        # v0.5 (the user's rule of 2026-11-25): the grace window has its own pass / fail lines. By where the pad press was
        # really SENT, in ms after the line (negative: before it):
        #   INSIDE   up to --window-in after the line (and everything before it): must land on that line with its first note
        #   AFTER    --window-out or more after the line: must wait and land on the NEXT line with its first note
        #   THE EDGE between the two: either of those two outcomes
        #   any other outcome anywhere (a clip without its first note, a clip that never came) fails
        # and each case must have at least 3 presses sent after the line inside the window and 3 after the window: a
        # window that was not tried is not a window that works.
        # Where the limits come from: the grace is LAUNCH_GRACE = 7 audio blocks of 2.9 ms = 20.3 ms, counted where the
        # launch reaches the audio thread; its first note then leaves in the next block (up to 24 ms after the line,
        # measured). MEASURED on tabby-v1.5.1 (2026-11-25, 216 presses): from the press being sent to the first note
        # 8 to 16 ms (the command, the key read, the clips decoded: eight of them for a scene), once more than 19 (a
        # scene recall sent 5.0 ms after the line waited; two others sent 5.0 and 5.1 landed). So in terms of when a
        # press is SENT: up to 3 ms after the line it is always inside (3 + 16 = 19 of 24), from 24 ms on it can never
        # be, and between the two it depends on what the device is doing. Until v0.4 only presses 12 ms and earlier
        # were judged.
        after_ms = lambda r: -r["sent_before_line_ms"]
        inside = [r for r in got if after_ms(r) <= a.window_in]
        outside = [r for r in got if after_ms(r) >= a.window_out]
        edge = [r for r in got if a.window_in < after_ms(r) < a.window_out]
        in_bad = [r for r in inside if not r["landed"]]
        out_bad = [r for r in outside if not r["waited_a_cycle"]]
        in_late = [r for r in inside if after_ms(r) > 0.0]
        few = bool(a.limit) and (len(in_late) < 3 or len(outside) < 3)
        over = in_bad + out_bad
        headless = sum(1 for r in got if r.get("landed_without_first_note"))
        laps = [r["old_note_ends_after_new_ms"] for r in got if r.get("old_note_ends_after_new_ms") is not None]
        ringing = [x for x in laps if x > 3.0]
        bad += (len(over) + neither + len(ringing) + few) if a.limit else neither
        if laps:
            print("%s %s: %d landing(s) in the grace after the old clip's note on the line: that note ended %.2f to %.2f ms after the new clip's first note (it must not ring on: 3 ms at most)%s" % (
                "FAIL" if ringing and a.limit else "ok  ", case, len(laps), min(laps), max(laps), "; %d rang on" % len(ringing) if ringing else ""))
        where = lambda rs: ", ".join("%.1f" % after_ms(r) for r in rs)
        print("%s %s, inside the window (sent up to %.0f ms after the line): %d of %d landed on that line with the first note; %d of them were sent after the line (%s ms after it)%s%s" % (
            "FAIL" if a.limit and (in_bad or len(in_late) < 3) else "ok  ", case, a.window_in, len(inside) - len(in_bad), len(inside), len(in_late), where(in_late) or "-",
            "; DID NOT LAND, sent %s ms after the line" % where(in_bad) if in_bad else "", "; FEWER THAN 3 SENT AFTER THE LINE: the window was not tried" if len(in_late) < 3 else ""))
        print("%s %s, after the window (sent %.0f ms or more after the line): %d of %d waited and landed on the next line with the first note (sent %s ms after the line)%s%s" % (
            "FAIL" if a.limit and (out_bad or len(outside) < 3) else "ok  ", case, a.window_out, len(outside) - len(out_bad), len(outside), where(outside) or "-",
            "; NOT SO: sent %s ms after the line" % where(out_bad) if out_bad else "", "; FEWER THAN 3: not tried" if len(outside) < 3 else ""))
        print("%s %s, the edge between: %d landed (sent %s ms after the line), %d waited (%s); in the whole case %d of %d landed, %d waited a cycle, any other outcome %d (%d of them a clip without its first note)" % (
            "FAIL" if neither else "ok  ", case, sum(r["landed"] for r in edge), where([r for r in edge if r["landed"]]) or "-", sum(r["waited_a_cycle"] for r in edge), where([r for r in edge if r["waited_a_cycle"]]) or "-",
            len(landed), len(got), len(missed), neither, headless))
    print("%s bar line: %s" % ("PASS" if not bad else "FAIL", "inside the grace window every press landed on its line with the first note, after it every press waited for the next line; no other outcome" if a.limit and not bad else "see the lines above"))
    return 0 if not bad else 1


if __name__ == "__main__":
    sys.exit(main())
