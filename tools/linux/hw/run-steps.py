#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-steps.py — Goal 6: the STEP page on the device, played by remote panel keys

Purpose
    tabby-v04.8 has the step editor (docs/CONTROL-MAP.md section 12). This script edits a clip on the device with
    nobody at the panel: pads, keyboard keys, knobs and buttons are remote panel events (command 29 op 6), the page
    state comes from op 15, the save from op 16 (the 4th left button itself is refused by remote on purpose), and
    the TRS MIDI out on the DIN input shows what the edit sounds like. The song must be the one of
    tools/linux/hw/clips-song.mjs imported with {"record":"scenes","loop":true,"rowSteps":16} (track 1 clip 2 = pitch
    72 on steps 1 and 9; 120 BPM; master cycle 16 steps). The script changes that clip: import the song again after it.

    Checked: the editor opens on the clip; a pad selects a step; a key enters a note; the knobs change velocity, start
    and length; undo and redo; the unsaved edit plays in the song, on its step; a launched clip plays a new note from
    its next loop; the playing step is reported; a save while playing is refused; stopped, it is saved and is there
    after a discard and a reopen; clear step; the save by itself after ten seconds; the audio counters.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-steps.py --song N --out DIR

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

CYCLE_MS = 2000.0 * 0.9996      # 16 steps at 120 BPM on the device's audio clock
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
    p.add_argument("--tolerance", type=float, default=4.0)
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    din = T.Monitor(a.din); din.start()
    l = T.Link()

    def idle(seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            l.messages(20)

    def ons(since, pitch):
        return [t for t, m in list(din.messages) if t > since and len(m) == 3 and m[0] == 0x90 and m[1] == pitch and m[2]]

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
        s = l.steps_state()
        check(s["page_name"] == "STEP" and s["track"] == 0 and s["place"] == 1 and s["steps"] == 16 and s["events"] == 2 and not s["dirty"],
              "the editor opens on track 1 clip 2: 16 steps, 2 events, saved", {k: s[k] for k in ("page_name", "steps", "events", "dirty")})
        check(s["pads"][0] & 1 and s["pads"][8] & 1 and not s["pads"][4] & 1, "pads: steps 1 and 9 hold notes, step 5 is empty", s["pads"])
        l.pad(4); idle(0.2); s = l.steps_state()
        check(s["selected"] == 4, "a pad selects its step", s["selected"])
        l.play_key(14); idle(0.3); s = l.steps_state()
        p1 = s["note"]
        check(s["count"] == 1 and s["events"] == 3 and s["dirty"] and s["notes"][0]["pitch"] == p1 and s["notes"][0]["start"] == 0 and s["notes"][0]["length"] == 480,
              "a key enters its note on the step (pitch %d)" % p1, s["notes"])
        v0 = s["notes"][0]["velocity"] if s["notes"] else 0
        l.knob(1, 10); idle(0.2); l.knob(2, 3); idle(0.2); l.knob(3, 2); idle(0.3); s = l.steps_state()
        n = s["notes"][0] if s["notes"] else {}
        check(n.get("velocity") == min(127, v0 + 10) and n.get("start") == 30 and n.get("length") == 600 and s["undo"] == 4, "K2 velocity +10, K3 start +30, K4 length 600; four undo levels", (n, s["undo"]))
        l.press("FX"); idle(0.3); u = l.steps_state()
        l.hold(["SHIFT", "FX"], 0.1); idle(0.3); r = l.steps_state()
        check(u["notes"] and u["notes"][0]["length"] == 480 and u["redo"] == 1 and r["notes"] and r["notes"][0]["length"] == 600 and r["redo"] == 0, "FX undoes the last change, SHIFT + FX redoes it",
              (u["notes"], r["notes"]))
        # ---- the unsaved edit in the song ----
        armed = time.monotonic_ns()
        l.press("PLAY"); idle(2 * CYCLE_MS / 1000.0 + 0.9)
        starts = [t for t, m in list(din.messages) if t >= armed and list(m) == [0xFA]]
        if not check(bool(starts), "PLAY on the STEP page starts the song"):
            return 1
        t0 = starts[0]
        want = CYCLE_MS + (4 + 30.0 / 480.0) * STEP_MS            # scene 2 = the second cycle; step 5, 30 units late
        got = [(t - t0) / 1e6 for t in ons(t0, p1)]
        near = [g for g in got if abs(g - want) <= a.tolerance]
        check(len(near) == 1, "the song plays the unsaved note on its step, 30 units late (%.1f ms after Start)" % want, ["%.1f" % g for g in got[:6]])
        # ---- a launched clip: a new note from the next loop ----
        l.clip_launch(0, 1); idle(CYCLE_MS / 1000.0 + 0.3)
        while not 100.0 < ((time.monotonic_ns() - t0) / 1e6) % CYCLE_MS < 700.0:
            idle(0.02)
        l.pad(12); idle(0.1)
        tk = time.monotonic_ns()
        l.play_key(17); idle(0.2); s = l.steps_state()
        p2 = s["note"]
        idle(3 * CYCLE_MS / 1000.0)
        hits = [((t - t0) / 1e6) for t in ons(tk + 400_000_000, p2)]
        phase = [h % CYCLE_MS - 12 * STEP_MS for h in hits]
        check(s["count"] == 1 and len(hits) >= 2 and all(abs(x) <= a.tolerance for x in phase), "a note entered while the clip loops plays on step 13 of the following loops (pitch %d)" % p2,
              ["%+.2f" % x for x in phase])
        s = l.steps_state()
        check(s["play_step"] != 255 and sum(1 for x in s["pads"] if x & 8) <= 1, "the page reports the step that plays", s["play_step"])
        code = 0
        try:
            l.edit_save()
        except T.DeviceError as e:
            code = e.code
        check(code == 76 and l.steps_state()["dirty"], "a save while the song plays is refused (code 76); the clip stays unsaved", code)
        l.press("PLAY"); idle(0.8)
        l.edit_save(); idle(0.5); s = l.steps_state()
        check(not s["dirty"] and s["events"] == 4, "stopped: saved, 4 events", (s["dirty"], s["events"]))
        l.edit_discard(); l.edit_open(0, 1); idle(0.3); s = l.steps_state()
        check(s["events"] == 4 and not s["dirty"], "after a discard and a reopen the saved clip is there", s["events"])
        l.pad(12); idle(0.2); l.press("ENV"); idle(0.3); s = l.steps_state()
        check(s["events"] == 3 and s["dirty"], "ENV clears the selected step", (s["events"], s["dirty"]))
        idle(11.5); s = l.steps_state()
        check(not s["dirty"], "ten seconds after the change, stopped, the clip is saved by itself", s["dirty"])
        # the stored clip plays after a reload of the song
        l.edit_discard(); l.show_page("overview"); l.select_song(a.song - 1); idle(0.3)
        armed = time.monotonic_ns()
        l.play_song(a.song - 1); idle(2 * CYCLE_MS / 1000.0 + 0.9)
        starts = [t for t, m in list(din.messages) if t >= armed and list(m) == [0xFA]]
        t1 = starts[0] if starts else armed
        got = [(t - t1) / 1e6 for t in ons(t1, p1)]
        near = [g for g in got if abs(g - want) <= a.tolerance]
        late = [g for g in ((t - t1) / 1e6 for t in ons(t1, p2)) if g > CYCLE_MS]
        check(len(near) == 1 and not late, "the song plays the stored clip: the entered note is there, the cleared one is not", (["%.1f" % g for g in got[:4]], len(late)))
        l.stop_song(); idle(0.5)
        held = {}
        for t, m in din.messages[:]:
            if len(m) == 3 and m[0] & 0xF0 == 0x90 and m[2]:
                held[(m[0] & 15, m[1])] = held.get((m[0] & 15, m[1]), 0) + 1
            elif len(m) == 3 and (m[0] & 0xF0 == 0x80 or (m[0] & 0xF0 == 0x90 and not m[2])):
                held[(m[0] & 15, m[1])] = held.get((m[0] & 15, m[1]), 0) - 1
        check(all(v == 0 for v in held.values()), "every note-on has its note-off", {k: v for k, v in held.items() if v})
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
    with open(os.path.join(a.out, "step-page.json"), "w") as f:
        json.dump({"results": RESULTS}, f, indent=1)
    print("%s step page: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
