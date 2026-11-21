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

Version: 0.3

Revision log
    v0.3  2026-11-20  Also read (and then reset): the device's own lateness counters as the test before left them.
    v0.2  2026-11-20  Also read: the selected track, the track the keys and the pads play, the page the device was left on.
                      --restore-track selects the baseline's track again, so every test of the release run starts from
                      the same state: overview, song stopped, the same track, the same mutes.
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
    # v0.3: the device's own lateness counters as the test before left them (they count since the last reset, and each
    # timing tool resets them when it starts): the latest any timed event left after its due time, and how many left
    # 4 ms or more late. Read first, before this tool does anything; reset at the end (main), so the next reading
    # belongs to the next test alone. 115.67 ms once stood there between manual runs and nothing said which run.
    own = None
    try:
        f = l.fg()
        if f:
            own = {"own_latest_ms": round(f["late_max_ms"], 2), "own_4ms_or_more": f["late_bins"][5], "own_sent": f["sent"]}
    except Exception:
        pass
    l.release_all(); l.stop_song(); time.sleep(0.4)
    page = l.remote_status().get("page_name")     # v0.2: the page the test left the device on (it goes back to the overview)
    l.show_page("overview"); l.press("BLUETOOTH"); time.sleep(0.4)
    l.key(0, 0, 1); time.sleep(0.25)
    cs = l.clips_state(); pads = cs["pads"]
    l.key(0, 0, 0); time.sleep(0.2)
    mutes = ["muted" if p["rgb"] == 0x301008 else "internal" if p["rgb"] == 0x081030 else "on" for p in pads[8:16]]
    st = l.remote_status()
    out = {"mutes": mutes, "clock": st.get("clock"), "a2": st.get("a2"), "loaded": st.get("loaded"), "track": cs["track"], "left_on_page": page}
    try:
        d = l.query(29, bytes([18]), attempts=1)
        if len(d) >= 9 and d[0] == 5:
            out.update({"focus": d[1], "repeat": d[2] | d[3] << 7, "arp": d[4] | d[5] << 7, "key_track": d[6], "pad_track": d[7]})
    except T.DeviceError:
        pass
    l.show_page("overview")
    if own:
        out.update(own)
    return out


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--baseline", default="")
    p.add_argument("--restore-mutes", action="store_true")
    p.add_argument("--restore-track", action="store_true", help="v0.2: select the baseline's track again")
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
        # v0.2: the selected track too: the next test starts where the first one did (KNOB BANK + pad 1 to 8)
        if a.baseline and a.restore_track:
            want = json.loads(a.baseline).get("track")
            if want is not None and s.get("track") != want:
                was, kept, page = s.get("track"), s.get("restored"), s.get("left_on_page")
                l.shift_pad(want); time.sleep(0.3)
                s = read(l); s["track_was"] = was; s["left_on_page"] = page
                if kept:
                    s["restored"] = kept
        try:
            l.diag(1)      # v0.3: the counters start again for the next test
        except Exception:
            pass
        print(json.dumps(s))
    finally:
        l.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
