#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-12b.py — Task 12 Part B1: L.2 on DIN and USB at once, with the loop profile

Purpose
    tabby-v04.0 is a normal build: it has the counters and the control-loop profile (command 25
    pages 1-5) but not the diag-only command 26, so a song is started by a person (PLAY on the SONG
    page). This script therefore waits for the first note instead of starting the song:

      rest  reset the counters, wait --seconds, read them: the profile at rest.
      l2    open the DIN input (default "H4MIDI-WC Port 1": the SMK-37's TRS out, type A adapter,
            into the H4MIDI WC DIN in 1; SPEC 15: not the AUDIO4c) and the SMK-37's own USB MIDI
            port together, both with kernel receive timestamps (CLOCK_MONOTONIC, one clock), wait
            up to --wait seconds for the first note-on, reset the counters at that moment, record
            for --seconds, read the counters and the song status, and write:
              <tag>-din-usb.csv     both streams (monitor CSV, port "din" / "usb")
              <tag>-report.txt      tools/linux/midi-monitor.py's analysis of DIN, of USB, and of
                                    the two together (the "lag" of DIN behind USB per note)
              <tag>-counters.txt / .json   the counters and the profile (tabby_link v0.4)
            It sends only command 25 (reset and read) and 23 (song status). It never writes.

Usage (the browser closed: Chrome holds the SMK-37's port while a workbench tab is connected)
    python3 tools/linux/hw/run-12b.py rest --seconds 30 --tag rest --out RUN/
    python3 tools/linux/hw/run-12b.py l2 --seconds 125 --wait 300 --tag l2-1x16 --out RUN/
    then press PLAY on the SONG page of the SMK-37 for the song in question.

Version: 0.1

Revision log
    v0.1  2026-11-09  Task 12 B1: first version.
"""
import argparse
import io
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

M = T.monitor


def save(out, name, text):
    with open(os.path.join(out, name), "w") as f:
        f.write(text)


def counters(l, out, tag, extra=None):
    d = l.diag(0)
    text = T.diag_text(d)
    save(out, "%s-counters.txt" % tag, text + "\n")
    save(out, "%s-counters.json" % tag, json.dumps({"counters": d, **(extra or {})}, indent=1))
    return d, text


def rest(a):
    l = T.Link()
    try:
        l.diag(1)
        time.sleep(a.seconds)
        _, text = counters(l, a.out, a.tag, {"song_status": l.song_status()})
    finally:
        l.close()
    print(text)


def l2(a):
    din = T.Monitor(a.din)
    din.start()
    l = T.Link()
    print("kernel timestamps on USB in:", l.kernel_time, "| DIN:", a.din, flush=True)
    usb = []
    try:
        deadline = time.monotonic() + a.wait
        first = None
        while first is None and time.monotonic() < deadline:
            usb.extend(l.messages(20))
            for t, m in usb + list(din.messages):
                if len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2]:
                    first = t; break
        if first is None:
            print("no note-on within %d s; nothing recorded" % a.wait); return
        l.diag(1)                      # reset at the first note: the counters cover the song only
        print("first note seen; counters reset; recording %d s" % a.seconds, flush=True)
        end = time.monotonic() + a.seconds
        while time.monotonic() < end:
            usb.extend(l.messages(50))
        usb.extend(l.other); l.other = []
        st = l.song_status()
        d, text = counters(l, a.out, a.tag, {"song_status": st, "din_port": a.din})
    finally:
        l.close()
        din_rows = din.finish()
    usb_rows = M.to_rows(sorted(usb, key=lambda x: x[0]), "usb")
    din_rows = [r[:6] + ("din",) for r in din_rows]
    rows = sorted(din_rows + usb_rows, key=lambda r: r[0])
    if not rows:
        print("nothing captured"); return
    M.write_csv(os.path.join(a.out, "%s-din-usb.csv" % a.tag), rows, rows[0][0])
    buf = io.StringIO()
    for label, sel in (("DIN (H4MIDI WC Port 1, kernel timestamps)", din_rows), ("USB (SMK37 Open MIDI 1, kernel timestamps)", usb_rows)):
        buf.write("==== %s\n" % label)
        M.report(M.analyze([r[:5] for r in sel], a.bpm), buf)
    buf.write("==== DIN and USB together (lag = DIN note-on behind the same USB note-on)\n")
    M.report(M.analyze([r[:5] + (r[6],) for r in sorted(usb_rows + din_rows, key=lambda r: r[0])], a.bpm), buf)
    save(a.out, "%s-report.txt" % a.tag, buf.getvalue())
    print(buf.getvalue()); print(text); print("song status:", st)


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("cmd", choices=["rest", "l2"])
    p.add_argument("--seconds", type=float, default=30)
    p.add_argument("--wait", type=float, default=300, help="l2: how long to wait for the first note-on")
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--bpm", type=float, default=120)
    p.add_argument("--tag", default="run")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    {"rest": rest, "l2": l2}[a.cmd](a)


if __name__ == "__main__":
    main()
