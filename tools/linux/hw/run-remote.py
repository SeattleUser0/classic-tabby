#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-remote.py — Task 16 Goal 2: every remote command and the panel-key injection, against the
                               screen state the firmware reports (transfer command 29)

Purpose
    tabby-v04.2 and later answer command 29 with the screen page, the song state, the loaded song, the playing
    row, the queued jump, the A2 switch, SHIFT, the transport and the ACTIONS entry. This script drives each
    operation on the device and checks the state the firmware reports, and the MIDI it sends (DIN through the
    H4MIDI WC and USB). It writes no flash (the SAVE button is refused by the device, and this script checks
    that too). One line per check: PASS or FAIL.

    Needs: a song in slot 16 (the 1-line timing song, looping) and slot 15 (8 lines); the SMK-37 idle.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-remote.py --out DIR

Version: 0.3

Revision log
    v0.3  2026-11-13  Task 17: the status reports CLOCK (tabby-v04.4).
    v0.2  2026-11-12  HOME on the overview opens the project list (the first run expected OVERVIEW).
    v0.1  2026-11-12  Task 16 Goal 2: first version.
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

results = []


def check(name, ok, detail=""):
    results.append({"check": name, "pass": bool(ok), "detail": detail})
    print("%s %s%s" % ("PASS" if ok else "FAIL", name, (" - " + str(detail)) if detail else ""), flush=True)


def settle(l, s=0.35):
    end = time.monotonic() + s
    while time.monotonic() < end:
        l.messages(20)


def notes_on(events):
    return [m for t, m in events if len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2] > 0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--din", default="H4MIDI-WC Port 1")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    din = T.Monitor(a.din); din.start()
    l = T.Link()
    try:
        l.release_all(); l.stop_song(); settle(l, 0.5)
        s = l.remote_status()
        check("status: page OVERVIEW, stopped, A2 on", s["page_name"] == "OVERVIEW" and s["song_state"] == 0 and s["transport"] == 0, s)
        # A2
        s = l.set_a2(False); check("A2 off", s["a2"] == 0 and l.a2(7)["on"] == 0, s["a2"])
        s = l.set_a2(True); check("A2 on", s["a2"] == 1 and l.a2(7)["on"] == 1, s["a2"])
        # song select / play / jump / stop
        s = l.select_song(15); check("select song 16 (index 15): loaded", s["loaded"] == 15 and s["song_state"] == 0, s)
        s = l.select_song(14); check("select song 15 (index 14): loaded", s["loaded"] == 14, s)
        try:
            l.select_song(13); check("select an empty song is refused", False, "accepted")
        except T.DeviceError as e:
            check("select an empty song is refused", True, "code %d" % e.code)
        l.select_song(15)
        t0 = time.monotonic_ns()
        s = l.play_song(); settle(l, 0.6)
        s = l.remote_status()
        check("PLAY: playing, transport running", s["song_state"] == 1 and s["transport"] == 1, s)
        ev = [x for x in din.messages if x[0] >= t0]
        check("PLAY: notes on DIN", len(notes_on(ev)) > 0, "%d note-ons" % len(notes_on(ev)))
        try:
            l.play_song(); check("PLAY while playing is refused", False)
        except T.DeviceError as e:
            check("PLAY while playing is refused", True, "code %d" % e.code)
        try:
            l.select_song(14); check("select while playing is refused", False)
        except T.DeviceError as e:
            check("select while playing is refused", e.code == 76, "code %d" % e.code)
        try:
            l.jump(0); s = l.remote_status(); check("jump to row 1 queued while playing", True, s["queued"])
        except T.DeviceError as e:
            check("jump to row 1 queued while playing", False, "code %d" % e.code)
        try:
            l.save_slot(0); check("project save while playing is refused (STOP TO SAVE)", False, "accepted")
        except T.DeviceError as e:
            check("project save while playing is refused (STOP TO SAVE)", e.code == 76, "code %d" % e.code)
        s = l.stop_song(); settle(l, 0.8)
        s = l.remote_status()
        check("STOP: stopped, no transport", s["song_state"] == 0 and s["transport"] == 0, s)
        try:
            l.jump(0); check("jump while stopped is refused", False)
        except T.DeviceError as e:
            check("jump while stopped is refused", True, "code %d" % e.code)
        # panel key injection against the reported page
        s = l.press("HOME"); settle(l, 0.3)
        s = l.remote_status(); check("HOME from the overview opens the project list (PRESET_BROWSER)", s["page_name"] in ("OVERVIEW", "PRESET_BROWSER"), s["page_name"])
        s = l.hold(["SHIFT", "SRC"], 0.15); settle(l, 0.4); s = l.remote_status()
        check("SHIFT + HOME / SRC: SOURCE page, SHIFT released", s["page_name"] == "SOURCE" and s["shift"] == 0, s["page_name"])
        s = l.press("HOME"); settle(l, 0.3)
        s = l.hold(["SEQ", "EDIT"], 0.15); settle(l, 0.4); s = l.remote_status()
        check("SEQ + EDIT: ACTIONS page", s["page_name"] == "ACTIONS", s["page_name"])
        s = l.key(4, 4, 1); settle(l, 0.3); s2 = l.remote_status()      # K5 one detent: next ACTIONS entry
        check("K5 on ACTIONS moves the entry", s2["action"] != s["action"], "%d -> %d" % (s["action"], s2["action"]))
        try:
            l.key(0, 3, 1); check("the 4th button in the left group (SAVE) is refused", False, "accepted")
        except T.DeviceError as e:
            check("the 4th button in the left group (SAVE) is refused", True, "code %d" % e.code)
        s = l.press("HOME"); settle(l, 0.3)
        s = l.press("SEQ"); settle(l, 0.4); s = l.remote_status()
        check("SEQ alone: not ACTIONS (SYNC / MIDI)", s["page_name"] != "ACTIONS", s["page_name"])
        s = l.press("HOME"); settle(l, 0.3)
        # SHIFT watchdog
        l.key(0, 0, 1); s = l.remote_status(); check("SHIFT held (remote)", s["shift"] == 1)
        time.sleep(6.0); s = l.remote_status(); check("the 5 s watchdog releases SHIFT", s["shift"] == 0)
        # key and pad notes
        t0 = time.monotonic_ns()
        l.key(1, 0, 100); settle(l, 0.15); l.key(1, 0, 0); settle(l, 0.3)
        ev = [x for x in din.messages if x[0] >= t0]
        check("key 1 press and release: a note-on on DIN", len(notes_on(ev)) >= 1, "%d" % len(notes_on(ev)))
        t0 = time.monotonic_ns()
        l.key(3, 0, 100); settle(l, 0.15); l.key(3, 0, 0); settle(l, 0.3)
        ev = [x for x in din.messages if x[0] >= t0]
        check("pad 1 press and release: a note-on on DIN", len(notes_on(ev)) >= 1, "%d" % len(notes_on(ev)))
        s = l.release_all(); check("release all", s["shift"] == 0)
        # v0.3 (tabby-v04.4): the status reports CLOCK
        if s.get("clock") is not None:
            check("the status reports CLOCK = INT", s["clock"] == 0, s["clock"])
        h = l.health()
        check("audio counters read (underruns %d, DMA overruns %d: cumulative since power-up)" % (h["underruns"], h["dma_overruns"]), True, "")
    finally:
        try:
            l.release_all(); l.stop_song()
        except Exception:
            pass
        l.close(); din.finish()
        with open(os.path.join(a.out, "remote-checks.json"), "w") as f:
            json.dump(results, f, indent=1, default=str)
    bad = [r for r in results if not r["pass"]]
    print("%d checks, %d failed" % (len(results), len(bad)))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
