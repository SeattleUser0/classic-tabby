#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-phantom.py — a soak with nothing injected: does the panel report a press that nobody made?

Purpose (the user's order of 2026-11-22)
    Twice the device did something nobody asked for: track 1 muted itself, and a scene was stored in a timing song.
    Both fit a pad that read as pressed or held. tabby-v1.4 keeps a log of every pad, button, key and encoder event
    with its source (the panel's own scan, a remote command, the app itself) and, for a pad, what its sensor read.
    This tool lets the device sit: on each page of --pages, first stopped and then with the song of --song playing,
    --minutes on each. The only remote commands in a period are read-only questions; the page change and SEQ PLAY
    before a period are remote and marked so in the log. Any event whose source is the panel is a press nobody made
    (NOBODY MAY TOUCH THE DEVICE DURING THE RUN) and is printed with its time, the page, the pad's sensor peak and its
    resting level. Also per period: how often each analog control (faders, wheels, pedal, pad pressure) sent a
    value and over what range (a control that wiggles at rest), and per pad the highest sensor reading above its
    resting level that stayed below a press (a near miss).

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-phantom.py --out DIR [--minutes 10] [--pages overview,clips,...] [--tag NAME]

Version: 0.2

Revision log
    v0.2  2026-11-23  Per period: the samples of the highest reading that did not press and of the last press, the sample rate.
    v0.1  2026-11-23  First version.
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, default=7, help="a looping song's slot, 1 to 16")
    p.add_argument("--minutes", type=float, default=10.0, help="per page and state")
    p.add_argument("--pages", default="overview,clips,scenes,steps,mixer,actions")
    p.add_argument("--states", default="stopped,playing")
    p.add_argument("--tag", default="phantom")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    periods = []; phantom = []
    l = T.Link(); time.sleep(0.3)
    try:
        l.release_all(); l.stop_song(); time.sleep(0.5)
        l.select_song(a.song - 1); time.sleep(0.3)
        t_begin = time.time()
        for state in a.states.split(","):
            for page in a.pages.split(","):
                l.stop_song(); time.sleep(0.3); l.show_page(page); time.sleep(0.3)
                if state == "playing":
                    l.play_song(a.song - 1); time.sleep(0.5)
                l.input_reset(); l.pad_levels(); time.sleep(0.2)
                try:
                    l.pad_forget()
                except Exception:
                    pass
                t_period = time.monotonic()
                start = l.input_counts(); seen = start["events"]
                end = time.monotonic() + a.minutes * 60.0
                found = []; near = [0] * 16; gate = [0] * 16; polls = 0
                while time.monotonic() < end:
                    time.sleep(min(10.0, max(0.1, end - time.monotonic())))
                    c = l.input_counts(); polls += 1
                    if c["events"] > seen:
                        for e in l.input_events(seen):
                            if e["source"] == "panel":
                                e["page"] = page; e["state"] = state; e["wall"] = time.strftime("%H:%M:%S")
                                found.append(e)
                                print("PHANTOM %s on %s, %s: %s %d value %d at %d ms (sensor peak %d, resting level %d)" % (
                                    e["wall"], page, state, e["kind"], e["id"] + 1, e["value"], e["at_ms"], e["raw"], e["gate"]), flush=True)
                        seen = c["events"]
                    lv = l.pad_levels()
                    near = [max(x, y) for x, y in zip(near, lv["near"])]; gate = lv["gate"]
                analog = {k: v for k, v in l.input_analog().items() if v["count"]}
                # v0.2: the samples of the highest reading that did not press, of the last press, the sample rate, the release waits
                shape = press = rates = None
                try:
                    shape = l.pad_capture(); press = l.pad_capture(True); rates = l.pad_rates()
                    rates["per_second"] = round(rates["samples"] / max(1.0, time.monotonic() - t_period), 1)
                except Exception:
                    pass
                st = l.remote_status()
                row = {"page": page, "state": state, "minutes": a.minutes, "panel_events": found, "analog": analog, "pad_near_miss": near, "pad_resting": gate, "highest_without_press": shape, "last_press": press, "rates": rates,
                       "page_at_end": st["page_name"], "song_state_at_end": st["song_state"]}
                periods.append(row); phantom += found
                wig = "; ".join("%s x%d %d..%d" % (k, v["count"], v["low"], v["high"]) for k, v in analog.items()) or "none"
                print("%s %-8s %-7s %4.1f min: %d event(s) from the panel; analog messages: %s; highest pad reading above rest without a press: %d (pad %d; a press needs more than rest + 10 and a rising run)" % (
                    "ok  " if not found else "FAIL", page, state, a.minutes, len(found), wig, max(near), near.index(max(near)) + 1), flush=True)
                if shape and shape["peak"] - shape["resting"] >= 100:
                    print("     the highest reading without a press: pad %d, resting %d, samples %s (%s samples of a pad a second)" % (
                        shape["pad"], shape["resting"], shape["samples"], rates["per_second"] if rates else "?"), flush=True)
                if press:
                    print("     the last press seen by the scan: pad %d, resting %d, samples %s" % (press["pad"], press["resting"], press["samples"]), flush=True)
        l.stop_song(); l.show_page("overview")
    finally:
        try:
            l.release_all()
        except Exception:
            pass
        l.close()
    json.dump({"tag": a.tag, "begun": t_begin, "periods": periods}, open(os.path.join(a.out, a.tag + "-phantom.json"), "w"), indent=1)
    total = sum(p["minutes"] for p in periods)
    print("%s phantom: %d of %d periods without an event from the panel (%.0f minutes in all, nothing injected); %d event(s) nobody made" % (
        "PASS" if not phantom else "FAIL", sum(1 for p in periods if not p["panel_events"]), len(periods), total, len(phantom)))
    return 0 if not phantom else 1


if __name__ == "__main__":
    sys.exit(main())
