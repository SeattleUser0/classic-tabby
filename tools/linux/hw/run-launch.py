#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-launch.py — Task 17 Goal 4: the CLIPS and SCENES pages on the device, played by remote panel keys

Purpose
    tabby-v04.7 has the clip launch page (docs/CONTROL-MAP.md). This script plays it on the device with nobody at
    the panel: every action is a remote panel key (command 29 op 6: BT, SHIFT, PLAY, SCL, ENV, the pads), every
    check reads the page state the firmware reports (op 12: page, track, per pad its state code and LED colour)
    and the TRS MIDI out on the DIN input. The song must be the one tools/linux/hw/clips-song.mjs writes,
    imported with {"record":"scenes","loop":true,"rowSteps":16} (track 1: clip 1 = pitch 60, clip 2 = pitch 72;
    track 2: one clip, pitches 36 and 38; 120 BPM; master cycle 16 steps).

    Checked: BT opens CLIPS; SHIFT + pad selects the track; pad colours for empty, stopped, playing, queued, stop
    queued, selected, muted; PLAY starts the song; a launch lands on the master cycle (the clip's first note a
    multiple of the cycle after the MIDI Start, the first one after the press); a stop lands on the cycle (no note
    of the track after it); a queue taken back; the long press; mute (no note of the track, the clip runs on);
    ENV; SCL to SCENES and a scene recall; BT back; PLAY stops; the audio counters.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-launch.py --song N --out DIR

Version: 0.8

Revision log
    v0.6  2026-11-17  The launched clip's first note is judged against where it is expected: one audio block (2.90 ms)
                      after the cycle counted from MIDI Start, within 2.0 ms either way. v0.5 allowed 0 to 4.0 ms after
                      the cycle: 70 measurements on five builds lie between 2.31 and 4.21 ms (a spread of 1.90 ms, the
                      one-line band), so the upper limit sat 1.1 ms above the mean and the lower 2.9 ms below it; the
                      4.21 ms held tabby-v04.18-rc1 back.
    v0.7  2026-11-20  The two "on the beat" checks (after an unmute, after ENV) measure the note against the device's own
                      MIDI clock byte of that beat, within the timing band (--band 2.0), and say every figure; the DIN
                      capture is saved (launch-din.csv). Until now the beat was worked out from Start and an averaged
                      cycle length: 2.8 to 3.9 ms "late" in 56 runs, 4.01 once against 4.0 (docs/BUILD.md 66.3).
    v0.5  2026-11-16  The cycle length comes from the device's MIDI clock on the DIN input, not from a fixed clock ratio.
    v0.4  2026-11-16  tabby-v04.7.1: a pad pressed while stopped reserves; a reserved clip starts with PLAY.
    v0.3  2026-11-14  Presses whose queued state is checked are not made in the last 700 ms before a cycle.
    v0.2  2026-11-14  The launch loop starts from a stopped track (v0.1 pressed the playing clip half the time); the scene
                      recall is read after its whole cycle; the scene pad is no longer read after the next scene began.
    v0.1  2026-11-14  First version.
"""
import argparse
import json
import os
import random
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

CYCLE_MS = 2000.0 * 0.9996      # 16 steps at 120 BPM on the device's audio clock (note times are 0.9996 of nominal: run-clips.py)
RESULTS = []


def check(ok, what, detail=""):
    RESULTS.append({"pass": bool(ok), "what": what, "detail": str(detail)})
    print("%s %s%s" % ("PASS" if ok else "FAIL", what, (" (" + str(detail) + ")") if detail != "" else ""), flush=True)
    return ok


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, required=True, help="the song slot as on the screen, 1 to 16")
    p.add_argument("--launches", type=int, default=5)
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--tolerance", type=float, default=4.0)
    p.add_argument("--band", type=float, default=2.0, help="v0.7: ms a note may lie from the MIDI clock byte that marks its place (the timing band)")
    p.add_argument("--lead", type=float, default=2.90, help="ms from the cycle (counted from MIDI Start) to a note on it: one audio block")
    p.add_argument("--launch-tolerance", type=float, default=2.0, help="ms a launched clip's first note may lie from cycle + lead")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    din = T.Monitor(a.din); din.start()
    l = T.Link()
    random.seed(17)

    def idle(seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            l.messages(20)

    try:
        fg0 = l.fg()       # the device's own lateness counters when the test began
    except Exception:
        fg0 = None

    def own():
        """v0.7: the device's own figure beside a time taken at this computer: the latest any timed event left after its due
        time since the device's counters were reset. A late note with a small figure here was late at this computer."""
        f = l.fg()
        if not f:
            return ""
        now = f["late_bins"]; d = [x - y for x, y in zip(now, fg0["late_bins"])] if fg0 else now
        return "; the device's own count of sends 2 ms or more after their due time since this test began: %d" % (d[4] + d[5])

    def ons(channel, since, until=None):
        return [(t, m[1]) for t, m in list(din.messages) if t > since and (until is None or t <= until) and len(m) == 3 and m[0] == (0x90 | channel) and m[2]]

    def pads():
        return l.clips_state()["pads"]

    def blink(pad, colour, seconds=1.2):
        seen = set(); end = time.monotonic() + seconds
        while time.monotonic() < end:
            seen.add(pads()[pad]["rgb"]); idle(0.03)
        return seen == {colour, 0}, ["%06x" % v for v in sorted(seen)]

    h0 = None
    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        l.release_all(); l.stop_song(); idle(0.5)
        l.show_page("overview")
        l.select_song(a.song - 1); idle(0.3)
        h0 = l.health()
        # ---- stopped ----
        l.press("BLUETOOTH"); idle(0.3)
        s = l.clips_state()
        check(s["page_name"] == "CLIPS", "BT opens the CLIPS page", s["page_name"])
        l.shift_pad(0); idle(0.3); s = l.clips_state()
        check(s["track"] == 0, "SHIFT + pad 1 selects track 1", s["track"])
        c = [x["code"] & 7 for x in s["pads"]]
        check(c[0] == 1 and c[1] == 1 and c[2] == 0, "track 1 has clips on pads 1 and 2, pad 3 is empty", c[:4])
        check(s["pads"][2]["rgb"] == 0 and s["pads"][1]["rgb"] in (0x080808, 0x303030), "colours: empty off, stopped white", "%06x %06x" % (s["pads"][2]["rgb"], s["pads"][1]["rgb"]))
        l.pad(0); idle(0.3); s = l.clips_state()
        check(s["selected"] == 0 and s["pads"][0]["code"] == 11, "a pad pressed while stopped reserves its clip (blinking, selected)", s["pads"][0]["code"])
        l.pad(0); idle(0.3); s = l.clips_state()
        check(s["pads"][0]["code"] == 9 and s["pads"][0]["rgb"] == 0x303030 and s["pads"][1]["rgb"] == 0x080808,
              "pressed again: the reservation is taken back; selected bright white, the other clip dim white", "%d %06x %06x" % (s["pads"][0]["code"], s["pads"][0]["rgb"], s["pads"][1]["rgb"]))
        # ---- play ----
        armed = T.now_ns()
        l.press("PLAY"); idle(1.0)
        starts = [t for t, m in list(din.messages) if t >= armed and list(m) == [0xFA]]
        if not check(bool(starts), "PLAY on the CLIPS page starts the song (MIDI Start on DIN)"):
            return 1
        t0 = starts[0]

        def cyc():
            # v0.5: the master cycle as the device's own MIDI clock gives it (96 clocks at 24 per quarter), measured since
            # Start. v0.4 used a fixed ratio between the two clocks; that ratio moves by a few 1e-5 from run to run, which is
            # 3 to 5 ms after a minute and failed two checks by under a millisecond in one run.
            clocks = [t for t, m in list(din.messages) if t >= t0 and list(m) == [0xF8]]
            return (clocks[-1] - clocks[0]) / 1e6 / (len(clocks) - 1) * 96.0 if len(clocks) > 200 else CYCLE_MS
        on_cycle = lambda t: ((t - t0) / 1e6) - round(((t - t0) / 1e6) / cyc()) * cyc()
        cycle_of = lambda t: round(((t - t0) / 1e6) / cyc())
        idle(0.3); s = l.clips_state()
        playing = [i for i, x in enumerate(s["pads"]) if x["code"] & 7 == 2]
        check(len(playing) == 1 and s["pads"][playing[0]]["rgb"] in (0x083008, 0x103c10), "one pad of track 1 plays, green", ["%d:%06x" % (x["code"], x["rgb"]) for x in s["pads"][:3]])
        # ---- launches and stops on the master cycle ----
        # v0.2: track 1 follows the scenes, which alternate its two clips, so "pad 2" is the playing clip in every other
        # cycle and a press there is a stop, not a launch (v0.1 pressed it blind and failed its own checks). Stop the
        # track first, early in a cycle, by pressing whichever pad is green; every launch below then starts from a stopped track.
        while not 300.0 < ((T.now_ns() - t0) / 1e6) % CYCLE_MS < 900.0:
            idle(0.02)
        s = l.clips_state()
        green = [i for i, x in enumerate(s["pads"]) if x["code"] & 7 == 2]
        l.pad(green[0], hold=0.04) if green else None
        idle(CYCLE_MS / 1000.0 + 0.3)
        s = l.clips_state()
        check(green and all(x["code"] & 7 != 2 for x in s["pads"]), "the playing pad pressed: track 1 is stopped after the cycle", [x["code"] for x in s["pads"][:3]])
        for i in range(a.launches):
            idle(random.uniform(0.3, 2.2))
            # v0.3: not inside the last 700 ms before a cycle: the queued state and its blink are read after the press, and
            # a press 22 ms before the cycle (v0.2, once) had landed before they could be seen. The device was right.
            # v0.8 (tabby-v1.4): nor in the 80 ms after a cycle: a press there lands on that cycle (the grace after the bar line,
            # measured by run-barline.py) and there is no queued state to look at
            while ((T.now_ns() - t0) / 1e6) % CYCLE_MS > CYCLE_MS - 700.0 or ((T.now_ns() - t0) / 1e6) % CYCLE_MS < 80.0:
                idle(0.02)
            tc = T.now_ns()
            l.pad(1, hold=0.04)
            s = l.clips_state()
            queued = s["pads"][1]["code"] & 7 == 3
            ok_blink, seen = blink(1, 0x083008, 0.5) if i == 0 else (True, [])
            idle(CYCLE_MS / 1000.0 + 0.6)
            notes = [t for t, pitch in ons(0, tc) if pitch == 72]
            cmd_ms = (tc - t0) / 1e6
            first = int(cmd_ms // CYCLE_MS) + 1
            if not notes:
                check(False, "launch %d: the clip's first note" % (i + 1), "no note 72 after the press"); continue
            err, k = on_cycle(notes[0]), cycle_of(notes[0])
            s = l.clips_state()
            check(queued and abs(err - a.lead) <= a.launch_tolerance and (k == first or (k == first + 1 and first * CYCLE_MS - cmd_ms < 60.0)) and s["pads"][1]["code"] == (2 | 8) and s["pads"][1]["rgb"] == 0x103c10,
                  "launch %d: queued at the press, the clip's first note on the next master cycle, pad bright green" % (i + 1),
                  "press %.0f ms, note %.1f ms, cycle %d (first after the press %d), error %+.2f ms, pad %d %06x" % (cmd_ms, (notes[0] - t0) / 1e6, k, first, err, s["pads"][1]["code"], s["pads"][1]["rgb"]))
            if i == 0:
                check(ok_blink, "the queued pad blinks green", seen)
            # two cycles later the launched clip still loops (the scenes moved on): 72 on beats 1 and 3 only
            idle(CYCLE_MS / 1000.0)
            late = ons(0, notes[0] + int(CYCLE_MS * 1e6) - 20_000_000)
            check(late and all(pitch == 72 for _, pitch in late), "launch %d: the launched clip loops over the scene change" % (i + 1), [pitch for _, pitch in late][:6])
            idle(random.uniform(0.2, 1.5))
            # v0.8 (tabby-v1.4): nor in the 80 ms after a cycle: a press there lands on that cycle (the grace after the bar line,
            # measured by run-barline.py) and there is no queued state to look at
            while ((T.now_ns() - t0) / 1e6) % CYCLE_MS > CYCLE_MS - 700.0 or ((T.now_ns() - t0) / 1e6) % CYCLE_MS < 80.0:
                idle(0.02)
            tc = T.now_ns()
            l.pad(1, hold=0.04)
            s = l.clips_state()
            stop_code = s["pads"][1]["code"]; stop_queued = stop_code & 7 == 4
            ok_blink, seen = blink(1, 0x300808, 0.5) if i == 0 else (True, [])
            cmd_ms = (tc - t0) / 1e6
            boundary = t0 + int((int(cmd_ms // CYCLE_MS) + 1) * CYCLE_MS * 1e6)
            idle(max(0.0, (boundary - T.now_ns()) / 1e9) + CYCLE_MS / 1000.0 + 0.3)
            after = ons(0, boundary + 60_000_000)
            s = l.clips_state()
            if not stop_queued:
                print("     (stop %d: the pad read %d right after the press, %.0f ms before the cycle)" % (i + 1, stop_code, (boundary - tc) / 1e6), flush=True)
            check((stop_queued or (stop_code & 7 == 1 and (boundary - tc) / 1e6 < 120.0)) and not after and s["pads"][1]["code"] == (1 | 8), "stop %d: queued at the press, no note of track 1 after the cycle, pad stopped" % (i + 1),
                  "%d notes after, pad %d" % (len(after), s["pads"][1]["code"]))
            if i == 0:
                check(ok_blink, "the pad with a stop queued blinks red", seen)
        # ---- take a queue back; the long press ----
        l.pad(0); idle(0.1); q1 = l.clips_state()["pads"][0]["code"]
        l.pad(0); idle(0.1); q2 = l.clips_state()["pads"][0]["code"]
        check(q1 == (3 | 8) and q2 == (1 | 8), "a blinking pad pressed again takes the launch back", "%d then %d" % (q1, q2))
        l.key(3, 1, 100); idle(0.2); q1 = l.clips_state()["pads"][1]["code"]
        idle(0.6); q2 = l.clips_state()["pads"][1]["code"]
        l.key(3, 1, 0)
        tc = T.now_ns(); idle(CYCLE_MS / 1000.0 + 0.3)
        check(q1 == (3 | 8) and q2 == (1 | 8) and not ons(0, tc), "a pad held half a second: queued at once, then selected only; nothing launched", "%d then %d" % (q1, q2))
        # ---- track 2: mute, back to the scenes ----
        l.shift_pad(1); idle(0.2); s = l.clips_state()
        check(s["track"] == 1 and s["pads"][0]["code"] & 7 == 2, "SHIFT + pad 2: track 2, its clip plays (following the scenes)", s["pads"][0]["code"])
        l.shift_pad(9); idle(0.3); s = l.clips_state()
        tc = T.now_ns()
        check(s["pads"][0]["code"] & 16 and s["pads"][0]["rgb"] == 0x301808, "SHIFT + pad 10 mutes track 2: its playing pad is orange", "%d %06x" % (s["pads"][0]["code"], s["pads"][0]["rgb"]))
        # v0.7: "on the beat" is judged against the device's own MIDI clock, byte by byte. The song's notes and the clock
        # byte of their 16th leave together (in a capture of this test: track 1's notes 1.17 to 1.37 ms before that byte,
        # track 2's 0.02 to 0.39), so a note on the beat lies within the timing band of the clock byte that marks its
        # place: byte 0, 96, 192 ... after Start for a cycle, every 48th for a half cycle. Until v0.6 the place was worked
        # out from Start and an averaged cycle length, which put these notes 2.8 to 3.9 ms "late" in 56 runs and 4.01
        # once, against a limit of 4.0 (tabby-v1.2-rc2): a figure of the arithmetic, not of the device.
        def beat(t, every):
            clk = [u for u, m in list(din.messages) if u >= t0 and list(m) == [0xF8]]
            j = min(range(len(clk)), key=lambda k: abs(clk[k] - t)) if clk else 0
            return ((t - clk[j]) / 1e6 if clk else 999.0), j % every
        on_beat = lambda t, every: (lambda d, r: r == 0 and abs(d) <= a.band)(*beat(t, every))
        said = lambda t, every: (lambda d, r: "%+.2f%s" % (d, "" if r == 0 else " (clock byte %d of %d: not the beat)" % (r, every)))(*beat(t, every))
        idle(2 * CYCLE_MS / 1000.0)
        muted = ons(1, tc + 300_000_000)
        l.shift_pad(9); idle(0.2); tc = T.now_ns(); s = l.clips_state()
        idle(2 * CYCLE_MS / 1000.0)
        back = ons(1, tc)
        check(not muted and len(back) >= 3 and not (s["pads"][0]["code"] & 16) and all(on_beat(t, 48) for t, _ in back),
              "muted: no note of track 2 for two cycles; unmuted: its notes are back on the beat", "%d while muted, %d after; ms from the clock byte of their half cycle: %s%s"
              % (len(muted), len(back), ", ".join(said(t, 48) for t, _ in back), own()))
        # ---- track 1 is still stopped: ENV brings it back ----
        l.shift_pad(0); idle(0.2)
        l.press("ENV"); idle(0.1)
        tc = T.now_ns(); idle(CYCLE_MS / 1000.0 + 0.5)
        got = ons(0, tc)
        check(bool(got) and on_beat(got[0][0], 96), "ENV: track 1 follows the scenes again from the next cycle",
              "first note %s ms from the clock byte of its cycle%s" % (said(got[0][0], 96) if got else "none", own()))
        # ---- SCENES ----
        l.press("SCL"); idle(0.3); s = l.clips_state()
        codes = [x["code"] for x in s["pads"]]
        check(s["page_name"] == "SONG" and codes[4] == 0 and sorted(codes[:4]).count(2) == 1, "SCL: the SCENES page; four scene pads, one playing", codes[:6])
        want = [i for i in range(4) if codes[i] == 2][0]        # the scene that plays now: recalled, it plays again instead of its neighbour
        tc = T.now_ns()
        l.pad(want); idle(0.1); q = l.clips_state()["pads"][want]["code"]
        cmd_ms = (tc - t0) / 1e6
        boundary = t0 + int((int(cmd_ms // CYCLE_MS) + 1) * CYCLE_MS * 1e6)
        idle(max(0.0, (boundary - T.now_ns()) / 1e9) + CYCLE_MS / 1000.0)      # v0.2: until the recalled scene's cycle has ended (v0.1 read it too early)
        got = [pitch for t, pitch in ons(0, boundary - 20_000_000, boundary + int(CYCLE_MS * 1e6) - 40_000_000)]
        expect = [60, 60, 60, 60] if want % 2 == 0 else [72, 72]
        s = l.clips_state()
        check(q == 3 and got[:len(expect)] == expect, "a scene pad recalls its scene at the next cycle (scene %d again)" % (want + 1), "queued %d, now %d, track 1 played %s" % (q, s["pads"][want]["code"], got))
        l.press("BLUETOOTH"); idle(0.3); p1 = l.clips_state()["page_name"]
        l.press("BLUETOOTH"); idle(0.3); p2 = l.clips_state()["page_name"]
        check(p1 == "CLIPS" and p2 == "SONG", "BT from SCENES opens CLIPS; BT again returns", "%s then %s" % (p1, p2))
        l.press("PLAY"); idle(0.8)
        st = l.remote_status()
        check(st["song_state"] == 0, "PLAY stops the song", st["song_state"])
        # v0.4 (tabby-v04.7.1): a clip reserved while stopped starts with PLAY (MC-707 Reference Manual p. 12)
        l.press("BLUETOOTH"); idle(0.3); l.shift_pad(0); idle(0.2)
        l.pad(1); idle(0.2); r1 = l.clips_state()["pads"][1]["code"]
        armed = T.now_ns()
        l.press("PLAY"); idle(2 * CYCLE_MS / 1000.0 + 0.3)
        starts = [t for t, m in list(din.messages) if t >= armed and list(m) == [0xFA]]
        t1 = starts[0] if starts else armed
        got = [(round((t - t1) / 1e6), pitch) for t, pitch in ons(0, t1 - 5_000_000)]
        check(r1 == 11 and got[:4] and all(pitch == 72 for _, pitch in got) and abs(got[0][0]) <= 6, "a reserved clip starts with PLAY and loops: track 1 plays clip 2 from the first beat", "%d, %s" % (r1, got[:4]))
        s2 = l.clips_state()
        check(s2["pads"][1]["code"] == (2 | 8), "its pad is green", s2["pads"][1]["code"])
        l.press("PLAY"); idle(0.8)
        l.shift_pad(0); idle(0.1)
        rows = din.messages[:]
        held = {}
        for t, m in rows:
            if len(m) == 3 and m[0] & 0xF0 == 0x90 and m[2]:
                held[(m[0] & 15, m[1])] = held.get((m[0] & 15, m[1]), 0) + 1
            elif len(m) == 3 and (m[0] & 0xF0 == 0x80 or (m[0] & 0xF0 == 0x90 and not m[2])):
                held[(m[0] & 15, m[1])] = held.get((m[0] & 15, m[1]), 0) - 1
        check(all(v == 0 for v in held.values()), "every note-on has its note-off after the stop", {k: v for k, v in held.items() if v})
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
    # every message the DIN input brought, with this computer's time (ns): a check that fails can be worked out afterwards
    try:
        with open(os.path.join(a.out, "launch-din.csv"), "w") as f:
            f.write("t_ns,bytes\n" + "".join("%d,%s\n" % (t, bytes(m).hex()) for t, m in list(din.messages)))
    except Exception as e:
        print("the DIN capture was not written: %s" % e)
    with open(os.path.join(a.out, "launch-page.json"), "w") as f:
        json.dump({"results": RESULTS}, f, indent=1)
    print("%s clip launch page: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
