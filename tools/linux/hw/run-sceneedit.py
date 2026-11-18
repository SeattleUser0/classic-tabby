#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-sceneedit.py — tabby-v04.16 on the device: a scene moved and deleted; a stop takes an armed take off

Purpose
    docs/CONTROL-MAP.md section 5.1 and 13.2, checked on the device with nobody at the panel (remote panel events; the
    pages read back with command 29 op 17, 15 and 12). The song must be the one of tools/linux/hw/clips-song.mjs
    imported with {"record":"scenes","loop":true,"rowSteps":16}. The test changes the song and saves it: write the
    song anew afterwards (rc-validate.py does).

    Checked: on SCENES, stopped, EDIT held + K1 moves the selected scene one place and it stays selected; the first
    scene moves no earlier; FX once only asks, FX twice within two seconds deletes the scene; nothing is deleted or
    moved while the song plays; the song saved and read again has one scene less. REC while the song plays arms a
    take on a clip the track does not play; stopping the song takes it off; a take armed while stopped stays armed.
    The test sets its own starting state (song stopped, clip discarded, chain not held, no scene reserved).

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-sceneedit.py --song N --out DIR

Version: 0.1

Revision log
    v0.1  2026-11-17  First version.
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

RESULTS = []
K1, K3 = 0, 2


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

    def edit_knob(detents):
        l.key(0, l.PANEL["EDIT"], 1); idle(0.15)
        l.knob(K1, detents); idle(0.25)
        l.key(0, l.PANEL["EDIT"], 0); idle(0.2)

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
        l.press("BLUETOOTH"); idle(0.4); l.press("SCL"); idle(0.4)
        l.knob(K3, -1); idle(0.2)                                  # the chain runs
        u = l.setup_state()
        if u["scene"]:
            l.pad(u["scene"] % 16); idle(0.3)                      # a reservation left behind is taken back
        c = l.clips_state(); u = l.setup_state(); n0 = u["scenes"]
        check(c["page_name"] == "SONG" and u["scene"] == 0 and u["hold"] == 0 and n0 >= 2, "SCENES, stopped, the chain runs, no scene reserved; the song has %d scenes" % n0, (c["page_name"], u["scene"], u["hold"]))
        l.pad(1); idle(0.3); u = l.setup_state(); t1 = u["scene_times"]
        l.knob(K1, 2); idle(0.3); u = l.setup_state(); mark = u["scene_times"]
        check(u["scene"] == 1 and mark == t1 + 2, "scene 2 selected; its TIMES set to %d to tell it apart" % mark, (u["scene"], mark))
        edit_knob(-1); u = l.setup_state()
        check(u["scene"] == 0 and u["scene_times"] == mark and u["scenes"] == n0 and u["unsaved"], "EDIT held + K1 left: it is scene 1 now and still selected; the song is unsaved", (u["scene"], u["scene_times"]))
        edit_knob(-1); u = l.setup_state()
        check(u["scene"] == 0 and u["scene_times"] == mark, "the first scene moves no earlier", (u["scene"], u["scene_times"]))
        edit_knob(1); u = l.setup_state()
        check(u["scene"] == 1 and u["scene_times"] == mark, "EDIT held + K1 right: scene 2 again", (u["scene"], u["scene_times"]))
        l.press("FX"); idle(0.3); u = l.setup_state(); c = l.clips_state()
        check(u["scenes"] == n0 and c["page_name"] == "SONG", "FX once asks: nothing is deleted, the page stays SCENES", (u["scenes"], c["page_name"]))
        idle(2.6); l.press("FX"); idle(0.3); u = l.setup_state()
        check(u["scenes"] == n0, "FX again after more than two seconds only asks again", u["scenes"])
        idle(2.6); l.press("FX"); idle(0.2); l.press("FX"); idle(0.4); u = l.setup_state()
        check(u["scenes"] == n0 - 1 and u["scene"] == 0 and u["scene_times"] != mark and u["unsaved"], "FX twice: the scene is deleted: %d left, scene 1 selected" % (n0 - 1), (u["scenes"], u["scene"], u["scene_times"]))
        l.press("PLAY"); idle(1.0)
        l.press("FX"); idle(0.2); l.press("FX"); idle(0.3); edit_knob(1); u = l.setup_state(); st = l.remote_status()
        check(u["scenes"] == n0 - 1 and st["song_state"] != 0, "while the song plays nothing is deleted or moved", (u["scenes"], st["song_state"]))
        l.press("PLAY"); idle(0.8)
        l.edit_save(); idle(0.8); u = l.setup_state()
        check(not u["unsaved"], "stopped: the song is saved")
        l.select_song(a.song - 1); idle(0.5); u = l.setup_state()
        check(u["scenes"] == n0 - 1, "read again from storage: %d scenes" % (n0 - 1), u["scenes"])
        # ---- a stop takes an armed take off ----
        seen = None                                                # on the STEP page, as run-record.py does
        for attempt in range(6):
            place = attempt % 2
            l.edit_open(0, place); idle(0.3)
            l.press("PLAY"); idle(0.3)
            bar = l.remote_status()["bar"]; t0 = time.monotonic()
            while l.remote_status()["bar"] == bar and time.monotonic() - t0 < 4.0:
                idle(0.02)
            l.press("REC")
            seen = l.steps_state()["recording"]
            l.press("PLAY"); idle(0.8)
            after = l.steps_state()["recording"]
            if seen == 1:
                break
            l.edit_discard(); idle(0.3)                            # the track played that clip: the take ran; try the other clip
        check(seen == 1, "REC while the song plays, on a clip the track does not play: the take is armed", seen)
        check(seen == 1 and after == 0 and l.remote_status()["song_state"] == 0, "the song stopped: the armed take is off", after)
        l.press("REC"); idle(0.3); s1 = l.steps_state()["recording"]; idle(1.5); s2 = l.steps_state()["recording"]
        check(s1 == 1 and s2 == 1, "REC while stopped arms a take, and it stays armed for PLAY", (s1, s2))
        l.press("REC"); idle(0.3); s3 = l.steps_state()["recording"]
        check(s3 == 0, "REC again takes it off", s3)
        l.edit_discard(); idle(0.2)
        l.show_page("overview")
        h = l.health()
        check(h["underruns"] == h0["underruns"] and h["dma_overruns"] == h0["dma_overruns"], "no audio underrun, no DMA overrun during the test",
              "underruns +%d, DMA overruns +%d, render peak %.2f ms" % (h["underruns"] - h0["underruns"], h["dma_overruns"] - h0["dma_overruns"], h["render_peak_ms"]))
    finally:
        try:
            l.release_all()
        except Exception:
            pass
        l.close()
    ok = bool(RESULTS) and all(r["pass"] for r in RESULTS)
    with open(os.path.join(a.out, "sceneedit.json"), "w") as f:
        json.dump({"results": RESULTS}, f, indent=1)
    print("%s scene edit: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
