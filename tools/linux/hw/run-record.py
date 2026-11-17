#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-record.py — Goal 6: real-time recording on the device, played by remote keys and MIDI in

Purpose
    tabby-v04.9 records into a clip (docs/CONTROL-MAP.md section 13, SPEC 19.11). This script makes takes on the
    device with nobody at the panel: REC, PLAY and keyboard keys are remote panel events (command 29 op 6), notes and
    a controller sweep are sent to the SMK-37's USB MIDI in from this computer, and the TRS MIDI out on the DIN input
    shows both what was played (the live note) and what the clip plays back in its following loops. The song must be
    the one of tools/linux/hw/clips-song.mjs imported with {"record":"scenes","loop":true,"rowSteps":16}; nothing is
    saved (the take is discarded at the end).

    Checked: REC while stopped arms; PLAY starts the take; a key played between two steps is recorded on the nearest
    step (input quantize on) and plays there in the next loops; a note from MIDI in likewise; with quantize off the
    clip plays the note where it was played (the difference between the live note and its playback is the recorder's
    timing error, reported); a controller sweep is thinned to one value per 240 units plus the last; REC stops the
    take; the take is one undo level; the audio counters.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-record.py --song N --out DIR

Version: 0.3

Revision log
    v0.3  2026-11-16  tabby-v04.10: the unquantized error must now be inside 2 ms on average (takes are placed one audio
                      block earlier; it was +3 ms); REC on an empty pad records a new clip of one master cycle, the clip
                      plays, and the save (remote op 16, stopped) stores the clip and the song.
    v0.2  2026-11-16  wait_phase cannot miss its moment; input quantize is set, not assumed, and left on.
    v0.1  2026-11-16  First version.
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

CYCLE_MS = 2000.0 * 0.9996
STEP_MS = CYCLE_MS / 16.0
RESULTS = []


def check(ok, what, detail=""):
    RESULTS.append({"pass": bool(ok), "what": what, "detail": str(detail)})
    print("%s %s%s" % ("PASS" if ok else "FAIL", what, (" (" + str(detail) + ")") if detail != "" else ""), flush=True)
    return ok


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, required=True)
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--tolerance", type=float, default=4.0, help="ms, a quantized note against its step")
    p.add_argument("--free-tolerance", type=float, default=8.0, help="ms, an unquantized note's playback against the live note")
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

    def ons(since, pitch):
        return [t for t, m in list(din.messages) if t > since and len(m) == 3 and m[0] == 0x90 and m[1] == pitch and m[2]]

    def phase(t, t0):
        return ((t - t0) / 1e6) % CYCLE_MS

    def wait_phase(t0, step):
        # v0.2: v0.1 looked for a 15 ms window with a 20 ms poll and could miss it for minutes (the first device run was
        # killed by its timeout in the middle of a take). Idle until 80 ms before, then sleep the rest.
        target = step * STEP_MS
        while True:
            d = (target - phase(time.monotonic_ns(), t0)) % CYCLE_MS
            if d <= 80.0:
                time.sleep(max(0.0, d - 2.0) / 1000.0)
                return
            idle(min(0.2, (d - 60.0) / 1000.0))

    def near(x, target, tol):
        d = (x - target + CYCLE_MS / 2) % CYCLE_MS - CYCLE_MS / 2
        return abs(d) <= tol, d

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
        l.edit_discard()
        l.edit_open(0, 1); idle(0.3)
        if l.steps_state()["quantize"] != 1:        # v0.2: input quantize stays as it was left; start from "on"
            l.hold(["SHIFT", "REC"], 0.1); idle(0.3)
        s = l.steps_state()
        check(s["page_name"] == "STEP" and s["events"] == 2 and s["quantize"] == 1, "the editor is open on track 1 clip 2; input quantize is on", (s["events"], s["quantize"]))
        l.press("REC"); idle(0.3); s = l.steps_state()
        check(s["recording"] == 1, "REC while stopped: armed", s["recording"])
        armed = time.monotonic_ns()
        l.press("PLAY"); idle(1.0)
        starts = [t for t, m in list(din.messages) if t >= armed and list(m) == [0xFA]]
        if not check(bool(starts), "PLAY starts the song"):
            return 1
        t0 = starts[0]
        s = l.steps_state()
        check(s["recording"] == 2 and s["undo"] == 1, "the take runs; the clip before it is one undo level", (s["recording"], s["undo"]))
        # ---- a key, quantize on: played at step 5.6 (0-based 4.6), recorded on step 6 (0-based 5) ----
        wait_phase(t0, 4.6)
        tk = time.monotonic_ns()
        l.key(1, 14, 100); idle(0.3); l.key(1, 14, 0); idle(0.2)
        l.pad(5); idle(0.2); s = l.steps_state()
        p1 = s["note"]
        live = [t for t in ons(tk - 5_000_000, p1)][:1]
        check(s["count"] == 1 and s["notes"][0]["pitch"] == p1 and s["notes"][0]["start"] == 0 and 800 <= s["notes"][0]["length"] <= 1500,
              "a key played between two steps is recorded on the nearer one, with its length (pitch %d)" % p1, s["notes"])
        l.pad(5); idle(2 * CYCLE_MS / 1000.0)
        later = [phase(t, t0) for t in ons(tk + 700_000_000, p1)]
        oks = [near(x, 5 * STEP_MS, a.tolerance) for x in later]
        check(len(later) >= 1 and all(o for o, _ in oks), "the clip plays it on that step in the following loops", ["%+.2f" % d for _, d in oks])
        measured["quantized_error_ms"] = [round(d, 2) for _, d in oks]
        # ---- a note from MIDI in ----
        wait_phase(t0, 10.4)
        tk = time.monotonic_ns()
        l.send(bytes([0x90, 67, 90])); idle(0.2); l.send(bytes([0x80, 67, 0])); idle(2 * CYCLE_MS / 1000.0 + 0.2)
        later = [phase(t, t0) for t in ons(tk + 600_000_000, 67)]
        oks = [near(x, 10 * STEP_MS, a.tolerance) for x in later]
        check(len(later) >= 1 and all(o for o, _ in oks), "a note sent to MIDI in is recorded on its nearest step and plays there", ["%+.2f" % d for _, d in oks])
        # ---- quantize off: the playback against the live note ----
        l.hold(["SHIFT", "REC"], 0.1); idle(0.3); s = l.steps_state()
        check(s["quantize"] == 0 and s["recording"] == 2, "SHIFT + REC: input quantize off, the take goes on", (s["quantize"], s["recording"]))
        errors = []
        for k, (key, step) in enumerate(((17, 2.5), (19, 7.3), (21, 13.6))):
            wait_phase(t0, step)
            tk = time.monotonic_ns()
            l.key(1, key, 100); idle(0.15); l.key(1, key, 0); idle(0.1)
            pitch = l.steps_state()["note"]
            idle(CYCLE_MS / 1000.0 + 0.3)
            hits = ons(tk - 5_000_000, pitch)
            if len(hits) >= 2:
                errors.append(near(phase(hits[1], t0), phase(hits[0], t0), 1e9)[1])
        check(len(errors) == 3 and all(abs(e) <= a.free_tolerance for e in errors), "quantize off: the clip plays each note where it was played (playback minus live note, ms)", ["%+.2f" % e for e in errors])
        measured["free_error_ms"] = [round(e, 2) for e in errors]
        mean = sum(errors) / len(errors) if errors else 99.0
        measured["free_error_mean_ms"] = round(mean, 2)
        check(abs(mean) <= 2.0, "v0.3: on average the playback is within 2 ms of the live note (it was +3 ms before tabby-v04.10)", "%+.2f ms" % mean)
        # ---- a controller sweep from MIDI in ----
        before = l.steps_state()["events"]
        wait_phase(t0, 1.0)
        tk = time.monotonic_ns()
        for v in range(61):
            l.send(bytes([0xB0, 74, v])); time.sleep(0.004)
        sweep_ms = (time.monotonic_ns() - tk) / 1e6
        idle(CYCLE_MS / 1000.0 + 0.5)
        after = l.steps_state()["events"]
        expect = int(sweep_ms / (240.0 / 480.0 * STEP_MS)) + 2
        cc = [m[2] for t, m in list(din.messages) if t > tk + int((sweep_ms + 300) * 1e6) and len(m) == 3 and m[0] == 0xB0 and m[1] == 74]
        check(3 <= after - before <= expect and after - before < 20, "a sweep of 61 controller values in %.0f ms is recorded as %d (one per 240 units and the last)" % (sweep_ms, after - before), "at most %d expected" % expect)
        check(cc and cc[-1] == 60 and len(cc) <= 2 * (after - before), "the clip plays the thinned sweep back; its last value is the gesture's last", cc[:10])
        measured["sweep"] = {"sent": 61, "ms": round(sweep_ms), "recorded": after - before}
        # ---- stop, undo ----
        l.press("REC"); idle(0.3); s = l.steps_state()
        check(s["recording"] == 0 and s["undo"] == 1 and s["dirty"], "REC stops the take; it is one undo level", (s["recording"], s["undo"]))
        l.press("FX"); idle(0.3); s = l.steps_state()
        check(s["events"] == 2 and s["redo"] == 1, "FX undoes the whole take", s["events"])
        l.press("PLAY"); idle(0.8)
        l.hold(["SHIFT", "REC"], 0.1); idle(0.3)       # input quantize on again, as at power-up
        check(l.steps_state()["quantize"] == 1, "input quantize is on again")
        l.edit_discard()
        # ---- v0.3 (tabby-v04.10): REC on an empty pad records a new clip ----
        l.show_page("overview"); l.press("BLUETOOTH"); idle(0.4)
        c = l.clips_state()
        if c["track"] != 0:
            l.shift_pad(0); idle(0.3); c = l.clips_state()
        empty = next((i for i, q in enumerate(c["pads"]) if (q["code"] & 7) == 0), None)
        if check(c["page_name"] == "CLIPS" and empty is not None, "BT opens CLIPS; track 1 has an empty pad", (c["page_name"], empty)):
            l.pad(empty); idle(0.3); c = l.clips_state()
            check(c["selected"] == empty and c["pads"][empty]["code"] == 8, "the empty pad is selected and nothing is queued", c["pads"][empty])
            l.press("REC"); idle(0.4); s = l.steps_state(); c = l.clips_state()
            check(s["recording"] == 1 and s["events"] == 0 and s["steps"] == 16 and s["place"] == empty and (c["pads"][empty]["code"] & 7) == 3,
                  "REC on the empty pad: a new clip of one master cycle (16 steps), reserved, armed", (s["recording"], s["events"], s["steps"], c["pads"][empty]["code"]))
            armed = time.monotonic_ns()
            l.press("PLAY"); idle(1.0)
            starts = [t for t, m in list(din.messages) if t >= armed and list(m) == [0xFA]]
            if check(bool(starts) and l.steps_state()["recording"] == 2, "PLAY starts the song and the take into the new clip"):
                t0 = starts[0]
                wait_phase(t0, 7.6)
                tk = time.monotonic_ns()
                l.key(1, 16, 100); idle(0.2); l.key(1, 16, 0); idle(0.2)
                pitch = None
                for t, m in list(din.messages):
                    if t > tk - 5_000_000 and len(m) == 3 and m[0] == 0x90 and m[2]:
                        pitch = m[1]; break
                idle(2 * CYCLE_MS / 1000.0)
                later = [phase(t, t0) for t in ons(tk + 700_000_000, pitch)] if pitch is not None else []
                oks = [near(x, 8 * STEP_MS, a.tolerance) for x in later]
                check(len(later) >= 1 and all(o for o, _ in oks), "the new clip plays the recorded note on its step in the following loops", ["%+.2f" % d for _, d in oks])
                l.press("REC"); idle(0.3); s = l.steps_state()
                check(s["recording"] == 0 and s["events"] == 1 and s["dirty"], "REC stops the take: one note in the new clip, unsaved", (s["recording"], s["events"]))
                refused = False
                try:
                    l.edit_save()
                except T.DeviceError:
                    refused = True
                check(refused, "a save while the song plays is refused")
            l.press("PLAY"); idle(0.8)
            l.edit_save(); idle(0.5); s = l.steps_state(); c = l.clips_state()
            check(not s["dirty"] and (c["pads"][empty]["code"] & 7) == 1, "stopped: the clip and the song are saved; the pad holds a clip", (s["dirty"], c["pads"][empty]["code"]))
            l.select_song(a.song - 1); idle(0.4)                    # remote op 1 reads the song from storage again
            c = l.clips_state()
            check((c["pads"][empty]["code"] & 7) == 1, "loaded again from storage: the new clip is in its place", c["pads"][empty])
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
    with open(os.path.join(a.out, "record.json"), "w") as f:
        json.dump({"results": RESULTS, "measured": measured}, f, indent=1)
    print("%s recording: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
