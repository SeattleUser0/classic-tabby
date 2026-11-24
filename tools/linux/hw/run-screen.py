#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-screen.py — the device's own screen pictures, read back over USB

Purpose
    The SMK-37's LCD cannot be read back (one data line, driven by the SoC only). From tabby-v1.2 the firmware can
    keep a copy of every rectangle of pixels it hands to the LCD (app/screen.c, remote command 29 {19}: read only).
    This tool runs the tour of tools/linux/hw/screen-tour.json on the device with remote panel keys (every page of
    docs/CONTROL-MAP.md section 20, at rest and while the song plays), freezes the copy for each picture, reads it,
    and writes OUT/<page>.rgb565 (240 x 240, 16 bits a pixel, low byte first) and OUT/device-shots.json (what the
    song showed at each picture and at each "at" step, so the simulator can be brought to the same place).
    Then: node tools/linux/screens.mjs --match OUT compares every pixel with the simulator's.

    The song must be in slot 6 already (tools/linux/hw/rig-song.mjs --loop, written with workbench.mjs song
    --song-json FILE --slot 5; rc-validate.py does both and deletes it afterwards). Nothing is written to flash.

    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-screen.py --out OUT --song wrong-room-song.json [--build ID]

Version: 0.1

Revision log
    v0.1  2026-11-19  First version (tabby-v1.2: the user's order: compare the device's actual pixels).
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import argparse, json, struct, sys, time
from pathlib import Path

HW = Path(__file__).resolve().parent
sys.path.insert(0, str(HW))
import tabby_link as T

B = {"KB": 0, "FADER": 1, "LEFT": 2, "SAVE": 3, "OCTM": 4, "OCTP": 5, "ARP": 6, "NR": 7, "SCALE": 8, "CHORD": 9, "GLOBE": 10,
     "BT": 11, "PATCH": 12, "PARA": 13, "FX": 14, "SEQ": 15, "PLAY": 16, "REC": 17}
PIXELS = 240 * 240


class Shot:
    def __init__(self, link):
        self.l = link

    def ask(self, what, offset=None):
        payload = bytes([19, what]) if offset is None else bytes([19, what, offset & 255, (offset >> 8) & 255, (offset >> 16) & 255])
        d = self.l.query(29, payload, attempts=2)
        if not d or d[0] != 6:
            raise RuntimeError("command 29 {19, %d}: not the screen copy's reply: %r" % (what, list(d[:4])))
        return d[1:]

    def status(self, what=0):
        d = self.ask(what)
        return {"state": d[0], "colors": d[1], "errors": d[2] | d[3] << 8, "info": list(d[4:20])}

    def read(self):
        palettes = []
        for band in range(15):
            p = self.ask(4, band)
            palettes.append([p[i] | p[i + 1] << 8 for i in range(0, len(p) - 1, 2)])
        frame, unpainted = [], 0
        while len(frame) < PIXELS:
            r = self.ask(3, len(frame))
            if not r:
                raise RuntimeError("the screen copy stopped at pixel %d" % len(frame))
            i = 0
            while i < len(r):
                run, v = r[i] >> 5, r[i] & 31
                i += 1
                if not run:
                    run = r[i] + 1; i += 1
                palette = palettes[len(frame) // 3840]
                if v >= len(palette):
                    unpainted += run       # a sixteenth colour in one band, or never painted
                frame.extend([palette[v] if v < len(palette) else 0xF81F] * run)
        return frame[:PIXELS], unpainted

    def largest_block(self):
        d = self.ask(8)
        return (d[0] | d[1] << 8) * 256


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--out", required=True)
    ap.add_argument("--song", required=True, help="the file name (inside OUT) of the song JSON that was written to slot 6")
    ap.add_argument("--build", default="")
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    tour = json.loads((HW / "screen-tour.json").read_text())
    l = T.Link(); time.sleep(0.3)
    s = Shot(l)
    log, started = [], time.time()
    press = lambda name: (l.key(0, B[name], 1), time.sleep(0.06), l.key(0, B[name], 0), time.sleep(0.14))
    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        l.stop_song(); time.sleep(0.4)
        l.select_song(5)
        try:
            s.status(1)
        except T.DeviceError as e:
            try:
                most = "the largest single block the heap gives is %d bytes" % s.largest_block()
            except Exception as e2:
                most = "the heap could not be asked (%s)" % e2
            print("FAIL the device did not switch the screen copy on (%s): fifteen blocks of 1952 bytes were not free; %s" % (e, most)); return 1
        heap = s.largest_block()
        own = s.ask(9)                    # the device's own project: the simulator is given the same levels
        levels, edited = list(own[:8]), (list(own[8:16]) if len(own) >= 16 else None)   # (a later firmware may also say which tracks' sounds were edited)
        time.sleep(0.6)
        for st in tour["steps"]:
            op, x, y = st[0], (st[1] if len(st) > 1 else None), (st[2] if len(st) > 2 else None)
            if op == "press":
                press(x)
            elif op == "down":
                l.key(0, B[x], 1); time.sleep(0.1)
            elif op == "up":
                l.key(0, B[x], 0); time.sleep(0.14)
            elif op == "pad":
                l.key(3, x, 100); time.sleep((y or 50) / 1000.0); l.key(3, x, 0); time.sleep(0.14)
            elif op == "key":
                l.key(1, x, 100); time.sleep(0.06); l.key(1, x, 0); time.sleep(0.14)
            elif op == "pad_down":
                l.key(3, x, 100); time.sleep(0.1)
            elif op == "pad_up":
                l.key(3, x, 0); time.sleep(0.14)
            elif op == "knob":
                l.key(4, x, y); time.sleep(0.14)
            elif op == "do_action":
                l.remote(16, 5); time.sleep(0.14)    # the > button on ACTIONS (a remote press of the button itself is refused)
            elif op == "settle":
                time.sleep(2.4)
            elif op == "wait_ms":
                time.sleep(x / 1000.0)
            elif op == "home":
                for n in range(8):
                    if s.status()["info"][0] == 0:
                        break
                    press("PATCH"); time.sleep(0.4)
                else:
                    print("FAIL PATCH did not lead to the overview"); return 1
            elif op == "at":
                end = time.time() + 40
                while True:
                    i = s.status()["info"]
                    bar, step = i[5] | i[6] << 8, i[4]
                    if i[1] == 1 and bar % x == y and step % 16 <= 3:
                        break
                    if time.time() > end:
                        print("FAIL the song never reached a bar %d of %d (it is at %s)" % (y, x, i)); return 1
                    time.sleep(0.004)
                log.append({"op": "at", "info": i})
            elif op == "shot":
                opt = y or {}
                s.status(6 if opt.get("now") else 2)
                end = time.time() + 4
                while True:
                    f = s.status()
                    if f["state"] == 3:
                        break
                    if time.time() > end:
                        print("FAIL %s: the picture never stood still within 4 s (a band was always waiting); the tour must name it \"now\"" % x); return 1
                    time.sleep(0.01)
                t0 = time.time()
                frame, unpainted = s.read()
                (out / (x + ".rgb565")).write_bytes(struct.pack("<%dH" % PIXELS, *frame))
                log.append({"op": "shot", "name": x, "info": f["info"], "unpainted": unpainted, "errors": f["errors"], "read_s": round(time.time() - t0, 2)})
                print("shot %-24s info %s, read in %.1f s" % (x, f["info"], time.time() - t0), flush=True)
                s.status(1); time.sleep(0.5)
            else:
                print("FAIL unknown tour step %r" % (st,)); return 1
    finally:
        try:
            s.ask(5)
        except Exception:
            pass
        try:
            l.remote(7)
        except Exception:
            pass
        l.close()
    (out / "device-shots.json").write_text(json.dumps({"tool": "tools/linux/hw/run-screen.py v0.1", "tour": tour["version"], "build": a.build, "song": a.song,
                                                       "seconds": round(time.time() - started, 1), "largest_heap_block_with_the_copy_on": heap, "levels": levels, "edited": edited, "log": log}, indent=1) + "\n")
    shots = [e for e in log if e["op"] == "shot"]
    print("the largest single block the heap gave with the copy on: %d bytes" % heap)
    print("PASS %d pictures read from the device in %.0f s (%d while playing)" % (len(shots), time.time() - started, sum(1 for e in shots if e["info"][1])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
