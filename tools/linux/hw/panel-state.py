#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/panel-state.py — what a device test must leave as it found it: mutes, focus, ARP switches, clock

Purpose
    After the tabby-v1.0.1 release run the device was found with track 1 muted and no test had noticed (the tests
    that follow a mute set their own state or do not use that track). This reads the state a musician would trip
    over and prints it as one JSON line; tools/linux/hw/rc-validate.py reads it before the tests and after each one
    and fails the step that changed it. With --restore-mutes it unmutes what --baseline JSON says was not muted.

    Read: per track the colour of its mute pad with KNOB BANK held on CLIPS (orange 0x301008 = muted, sound and
    MIDI; blue 0x081030 = the internal sound only; green = not muted), the playing focus, the tracks NOTE REPEAT
    holds, the ARP switches (command 29 op 18, tabby-v04.22 and later), CLOCK, A2, the loaded song.
    The song is stopped first and the overview is shown afterwards.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/panel-state.py [--baseline JSON --restore-mutes]

Version: 0.1

Revision log
    v0.1  2026-11-18  First version (tabby-v1.0.2).
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T


def read(l):
    l.release_all(); l.stop_song(); time.sleep(0.4)
    l.show_page("overview"); l.press("BLUETOOTH"); time.sleep(0.4)
    l.key(0, 0, 1); time.sleep(0.25)
    pads = l.clips_state()["pads"]
    l.key(0, 0, 0); time.sleep(0.2)
    mutes = ["muted" if p["rgb"] == 0x301008 else "internal" if p["rgb"] == 0x081030 else "on" for p in pads[8:16]]
    st = l.remote_status()
    out = {"mutes": mutes, "clock": st.get("clock"), "a2": st.get("a2"), "loaded": st.get("loaded")}
    try:
        d = l.query(29, bytes([18]), attempts=1)
        if len(d) >= 9 and d[0] == 5:
            out.update({"focus": d[1], "repeat": d[2] | d[3] << 7, "arp": d[4] | d[5] << 7})
    except T.DeviceError:
        pass
    l.show_page("overview")
    return out


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--baseline", default="")
    p.add_argument("--restore-mutes", action="store_true")
    a = p.parse_args()
    l = T.Link()
    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        s = read(l)
        if a.baseline and a.restore_mutes:
            want = json.loads(a.baseline)["mutes"]
            changed = [t for t in range(8) if s["mutes"][t] != want[t] and "internal" not in (s["mutes"][t], want[t])]
            if changed:
                l.press("BLUETOOTH"); time.sleep(0.4)
                for t in changed:
                    l.shift_pad(8 + t); time.sleep(0.3)
                s = read(l); s["restored"] = [t + 1 for t in changed]
        print(json.dumps(s))
    finally:
        l.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
