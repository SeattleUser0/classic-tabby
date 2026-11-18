#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-takeedit.py — tabby-v04.21 on the device: shift a clip, clear notes during a take, a new song

Purpose
    docs/CONTROL-MAP.md sections 12 (KNOB BANK + OCTAVE-/+ on the STEP page), 13 (FX + a key during a take) and 15
    (ACTIONS: NEW SONG), checked on the device with nobody at the panel (remote panel events; the pages read back
    with command 29 op 15, 17 and 12). The song must be the one of tools/linux/hw/clips-song.mjs imported with
    {"record":"scenes","loop":true,"rowSteps":16}: track 1 clip 1 has pitch 60 on steps 1, 5, 9 and 13.

    Checked: SHIFT + OCT_UP moves every note of the open clip one step later, SHIFT + OCT_DOWN one step earlier
    and round the clip's end; a run of shifts is one undo level. During a take FX held with the key 60 takes the
    clip's four notes out as the clip passes them and records nothing; FX alone does nothing during a take; with
    FX up a key is recorded again; the take is one undo level. NEW SONG is refused on a slot that holds a song;
    on an empty slot it asks, then makes a song of one empty scene and shows CLIPS; SEQ REC on a selected empty
    pad records a first clip into it; the song is saved, read again and then deleted, so the slot is empty again.
    The test discards its clip edits (the test song is left as it was).

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-takeedit.py --song N --out DIR

Version: 0.2

Revision log
    v0.2  2026-11-18  v0.1 pressed key 12 and took it for pitch 60; that holds only while the keys' octave is 0. The key
                      for pitch 60 is now found from the note the STEP page shows after a key press (candidate 1 of
                      tabby-v04.21 failed three checks for this reason; docs/BUILD.md 57.4).
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
NEW_SONG = 7        # the entry's place in the ACTIONS list (app/screen.c ACT_NEW_SONG)


def check(ok, what, detail=""):
    RESULTS.append({"pass": bool(ok), "what": what, "detail": str(detail)})
    print("%s %s%s" % ("PASS" if ok else "FAIL", what, (" (" + str(detail) + ")") if detail != "" else ""), flush=True)
    return ok


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, required=True)
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    l = T.Link()

    def idle(seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            l.messages(20)

    def noted():
        s = l.steps_state()
        return [i for i, v in enumerate(s["pads"]) if v & 1], s

    def select(slot):
        """Select a song slot (0-based); True when it holds a song."""
        try:
            l.select_song(slot)
            return True
        except T.DeviceError:
            return False

    def new_song_entry():
        l.show_page("actions"); idle(0.2)
        for _ in range(12):
            at = l.remote_status()["action"]
            if at == NEW_SONG:
                return True
            l.knob(K1, 1 if at < NEW_SONG else -1); idle(0.15)
        return False

    slot = None
    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        # the starting state
        l.release_all(); l.stop_song(); idle(0.5)
        l.edit_discard()
        l.show_page("overview")
        l.select_song(a.song - 1); idle(0.3)
        h0 = l.health()
        # ---- shift ----
        l.edit_open(0, 0); idle(0.4)
        at, s = noted(); undo0 = s["undo"]
        check(s["page_name"] == "STEP" and at == [0, 4, 8, 12] and s["events"] == 4, "the STEP page is open on track 1 clip 1: notes on steps 1, 5, 9, 13", (at, s["events"]))
        l.hold(["SHIFT", "OCT_UP"], 0.1); idle(0.3); at, s = noted()
        check(at == [1, 5, 9, 13] and s["events"] == 4 and s["dirty"] and s["bar"] == 0, "KNOB BANK + OCTAVE+: every note one step later; the bar shown does not change", at)
        l.hold(["SHIFT", "OCT_DOWN"], 0.1); idle(0.3); l.hold(["SHIFT", "OCT_DOWN"], 0.1); idle(0.3); at, s = noted()
        check(at == [3, 7, 11, 15] and s["events"] == 4, "KNOB BANK + OCTAVE- twice: one step earlier than at first; step 1's note is on step 16", at)
        check(s["undo"] == undo0 + 1, "the run of shifts is one undo level", (undo0, s["undo"]))
        l.press("FX"); idle(0.3); at, s = noted()
        check(at == [0, 4, 8, 12], "FX undoes the run: the notes are on steps 1, 5, 9, 13 again", at)
        l.edit_discard(); idle(0.3)
        # ---- clear notes during a take ----
        l.edit_open(0, 0); idle(0.4)
        l.key(1, 12, 100); idle(0.15); l.key(1, 12, 0); idle(0.3)   # v0.2: which pitch key 12 plays (the keys' octave): the STEP page shows it
        heard = l.steps_state()["note"]
        k60 = 12 + 60 - heard                                       # the key that plays the clip's pitch, 60
        other = k60 + 2 if k60 + 2 <= 36 else k60 - 2
        if not check(0 <= k60 <= 36, "key 12 plays pitch %d: the key for pitch 60 is key %d" % (heard, k60)):
            return 1
        l.press("REC"); idle(0.3)
        l.press("PLAY")
        t0 = time.monotonic(); s = l.steps_state()
        while s["recording"] != 2 and time.monotonic() - t0 < 12.0:
            idle(0.1); s = l.steps_state()
        check(s["recording"] == 2 and s["events"] == 4, "a take runs on the clip (4 notes)", (s["recording"], s["events"]))
        l.press("FX"); idle(0.4); s = l.steps_state()
        check(s["recording"] == 2 and s["events"] == 4 and s["page_name"] == "STEP", "FX alone during a take changes nothing (no undo, the page stays)", (s["recording"], s["events"], s["page_name"]))
        l.key(0, l.PANEL["FX"], 1); idle(0.15)
        l.key(1, k60, 100); idle(0.9); mid = l.steps_state()["events"]
        idle(1.6)                                                  # the clip is 2 s long: the key is down for more than one pass
        l.key(1, k60, 0); idle(0.15)
        l.key(0, l.PANEL["FX"], 0); idle(0.3)
        at, s = noted()
        check(0 < mid < 4, "FX + the key 60 held: its notes go as the clip passes them (%d left after 0.9 s)" % mid, mid)
        check(s["events"] == 0 and at == [] and s["recording"] == 2, "after one pass the clip's four notes are cleared; the held key was not recorded; the take goes on", (s["events"], at, s["recording"]))
        l.key(1, other, 100); idle(0.2); l.key(1, other, 0); idle(0.5); s = l.steps_state()
        check(s["events"] == 1, "with FX up a key is recorded again", s["events"])
        l.press("PLAY"); idle(0.8); s = l.steps_state()
        check(s["recording"] == 0 and l.remote_status()["song_state"] == 0, "the song stopped; the take ended", s["recording"])
        l.press("FX"); idle(0.3); at, s = noted()
        check(at == [0, 4, 8, 12] and s["events"] == 4, "FX undoes the take: the four notes are back", at)
        l.edit_discard(); idle(0.3)
        # ---- a new song ----
        ok = new_song_entry()
        check(ok, "ACTIONS: K1 reaches NEW SONG", l.remote_status()["action"])
        scenes0 = l.setup_state()["scenes"]
        l.remote(16, 5); idle(0.3); l.remote(16, 5); idle(0.6); st = l.remote_status()
        check(st["loaded"] == a.song - 1 and st["page_name"] == "ACTIONS" and l.setup_state()["scenes"] == scenes0, "NEW SONG on a slot that holds a song is refused: song %d stays as it is" % a.song, (st["loaded"], st["page_name"]))
        for cand in range(15, -1, -1):
            if cand != a.song - 1 and not select(cand):
                slot = cand; break
        if not check(slot is not None, "an empty song slot is found and selected", "slot %s" % (slot + 1 if slot is not None else None)):
            return 1
        idle(0.3)
        ok = new_song_entry()
        l.remote(16, 5); idle(0.4); st = l.remote_status()
        check(ok and st["loaded"] == 255 and st["page_name"] == "ACTIONS", "the > button once: it asks, nothing is made yet", (st["loaded"], st["page_name"]))
        l.remote(16, 5); idle(0.8); st = l.remote_status(); u = l.setup_state()
        check(st["loaded"] == slot and st["page_name"] == "CLIPS" and u["scenes"] == 1, "the > button again: the new song is loaded in slot %d, one scene, the CLIPS page" % (slot + 1), (st["loaded"], st["page_name"], u["scenes"]))
        c = l.clips_state()
        check(all((pad["code"] & 7) == 0 for pad in c["pads"]), "every clip pad of track %d is empty" % (c["track"] + 1))
        l.pad(0, hold=0.9); idle(0.3)                              # a long press selects the empty pad
        l.press("REC"); idle(0.4); s = l.steps_state()
        check(s["recording"] == 1, "SEQ REC on the selected empty pad: a new clip, the take armed", s["recording"])
        l.press("PLAY")
        t0 = time.monotonic()
        while s["recording"] != 2 and time.monotonic() - t0 < 12.0:
            idle(0.1); s = l.steps_state()
        l.key(1, 12, 100); idle(0.2); l.key(1, 12, 0); idle(0.4)
        l.key(1, 16, 100); idle(0.2); l.key(1, 16, 0); idle(0.6)
        l.press("PLAY"); idle(0.8); s = l.steps_state()
        check(s["events"] == 2 and s["recording"] == 0, "two keys played into the take are in the new clip", s["events"])
        l.edit_save(); idle(1.0)
        check(select(a.song - 1) and select(slot), "the song is saved; the test song and then the new song load from storage")
        idle(0.3); l.show_page("overview"); l.press("BLUETOOTH"); idle(0.4)
        c = l.clips_state()
        check((c["pads"][0]["code"] & 7) == 1, "its first pad holds the recorded clip", c["pads"][0]["code"])
        l.edit_open(c["track"], 0); idle(0.3); s = l.steps_state()
        check(s["events"] == 2, "the clip read again has its two notes", s["events"])
        l.edit_discard(); idle(0.2)
    finally:
        try:
            l.release_all(); l.stop_song(); idle(0.5)
            if slot is not None:
                l.select_song(a.song - 1); idle(0.3)
                l.song_delete(slot); idle(1.0)
                check(not select(slot), "the new song is deleted again: slot %d is empty as before" % (slot + 1))
                l.select_song(a.song - 1); idle(0.3)
            l.show_page("overview")
            h = l.health()
            check(h["underruns"] == h0["underruns"] and h["dma_overruns"] == h0["dma_overruns"], "no audio underrun, no DMA overrun during the test",
                  "underruns +%d, DMA overruns +%d, render peak %.2f ms" % (h["underruns"] - h0["underruns"], h["dma_overruns"] - h0["dma_overruns"], h["render_peak_ms"]))
            l.release_all()
        except Exception as e:
            check(False, "the closing steps ran", repr(e))
        l.close()
    ok = bool(RESULTS) and all(r["pass"] for r in RESULTS)
    with open(os.path.join(a.out, "takeedit.json"), "w") as f:
        json.dump({"results": RESULTS}, f, indent=1)
    print("%s take edit: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
