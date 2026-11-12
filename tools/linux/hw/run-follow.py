#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-follow.py — Task 16 Goal 3: external clock follow on the device, unattended

Purpose
    Song mode follows an external MIDI clock (SPEC 19.3, app/song.c). This tool is the master: it sends
    MIDI clock (24 ppqn), Start, Continue, Stop and Song Position Pointer to the SMK-37's own USB MIDI
    port from this computer, with the pulse times taken on CLOCK_MONOTONIC just before each write, and
    records what the device plays back on its USB MIDI out (kernel receive timestamps) and on the DIN
    input the TRS out is wired to ("H4MIDI-WC Port 1"), on the same clock. Nobody touches the device:
    CLOCK = MIDI is set through the panel-key injection of transfer command 29 (SEQ, then K1), the song
    is selected and armed by remote commands.

    The clock goes in over USB only: the TRS jack is output only (SPEC 17.6).

    Scenarios (--only to pick):
      lock    120 BPM: Start, the first note, then --seconds of steady state: every device note-on is
              compared with the nearest master pulse (note time minus pulse time): mean, spread (std,
              band), per port, and the lock time (Start to first note).
      tempo   90 BPM, 150 BPM, back to 120: the same statistics per segment; the song must keep up.
      gap     the clock stops for 0.25 s (HELD: note-offs, no advance), comes back (RUNNING, from the held
              position); stops for 3 s (LOST), comes back (still LOST: pulses alone never restart it),
              Continue (RUNNING). The follow state is read by command 29 after each step.
      stop    Stop (STOPPED, note-offs), pulses ignored, Continue resumes; Start restarts.
      spp     Song Position Pointer while running and while stopped (the follow state and that notes go on).

    Uses commands 17, 19, 23, 29 and MIDI realtime only. It writes no flash and never installs; the
    panel-key injection refuses the SAVE button.

Usage (browser closed: Chrome holds the SMK-37's port)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-follow.py --song 16 --seconds 60 --out DIR [--only lock,gap]

Version: 0.2

Revision log
    v0.2  2026-11-12  --a2 on|off|keep; arm() waits for the device after the CLOCK change (a retry loop instead of one 1.5 s query).
    v0.1  2026-11-12  Task 16 Goal 3: first version.
"""
import argparse
import bisect
import json
import math
import os
import sys
import threading
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

NS = 1_000_000_000


class Master(threading.Thread):
    """MIDI clock master: F8 every 60/(24*bpm) s from a drift-free schedule; the time before each write is kept."""

    def __init__(self, link, lock):
        super().__init__(daemon=True)
        self.l, self.lock = link, lock
        self.bpm = 120.0
        self.paused = True
        self.quit = False
        self.pulse_ns = []
        self.sent = 0

    def say(self, data):
        with self.lock:
            return self.l_send(data)

    def run(self):
        self.l_send = self.l.send_raw
        nxt = time.monotonic_ns()
        while not self.quit:
            if self.paused:
                time.sleep(0.002)
                nxt = time.monotonic_ns()
                continue
            now = time.monotonic_ns()
            if now < nxt - 400_000:
                time.sleep(max(0.0, (nxt - now - 400_000) / NS))
                continue
            while time.monotonic_ns() < nxt:
                pass
            t = self.say(b"\xf8")
            self.pulse_ns.append(t)
            self.sent += 1
            nxt += int(NS * 60.0 / (24.0 * self.bpm))


def note_ons(events):
    """(time_ns, channel, note) of every note-on in a list of (t, message) pairs."""
    return [(t, m[0] & 15, m[1]) for t, m in events if len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2] > 0]


def note_offs(events):
    return [(t, m[0] & 15, m[1]) for t, m in events if len(m) == 3 and ((m[0] & 0xF0) == 0x80 or ((m[0] & 0xF0) == 0x90 and m[2] == 0))]


def offsets(notes, pulses, t_from, t_to):
    """Note time minus the time of the master pulse that is nearest before it (ms), for the notes in [t_from, t_to)."""
    out = []
    for t, ch, n in notes:
        if t < t_from or t >= t_to:
            continue
        i = bisect.bisect_right(pulses, t) - 1
        if i >= 0:
            out.append((t - pulses[i]) / 1e6)
    return out


def stats(v):
    if len(v) < 3:
        return {"n": len(v)}
    m = sum(v) / len(v)
    sd = math.sqrt(sum((x - m) ** 2 for x in v) / len(v))
    return {"n": len(v), "mean_ms": round(m, 2), "std_ms": round(sd, 2), "min_ms": round(min(v), 2), "max_ms": round(max(v), 2),
            "band_ms": round(max(v) - min(v), 2)}


class Rig:
    def __init__(self, a):
        self.a = a
        self.din = T.Monitor(a.din); self.din.start()
        self.l = T.Link()
        self.lock = threading.Lock()
        raw = self.l.send
        self.l.send_raw = raw
        def locked(data):
            with self.lock:
                return raw(data)
        self.l.send = locked
        self.m = Master(self.l, self.lock)
        self.m.start()
        self.usb = []
        self.log = []

    def pump(self, seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            self.usb.extend(self.l.messages(20))

    def status(self):
        self.usb.extend(self.l.other); self.l.other = []
        return self.l.remote_status()

    def say(self, text):
        print(text, flush=True); self.log.append(text)

    def ev(self, since_ns=0):
        din = [x for x in self.din.messages if x[0] >= since_ns]
        usb = [x for x in self.usb + self.l.other if x[0] >= since_ns]
        return din, usb

    def close(self):
        self.m.quit = True
        try:
            self.l.release_all()
        except Exception:
            pass
        self.l.close(); self.din.finish()


def arm(r, song):
    """CLOCK = MIDI by the panel (SEQ, K1), the song selected and armed by remote commands."""
    l = r.l
    l.release_all()
    l.stop_song()
    st = l.press("SEQ")
    r.say("SEQ pressed: page %s" % st["page_name"])
    l.key(4, 0, 1); time.sleep(0.2)          # K1: one detent up = CLOCK MIDI (read back below by arming)
    for attempt in range(8):                  # v0.2: the device may be busy for seconds after the CLOCK change
        try:
            l.select_song(song - 1); break
        except T.DeviceError:
            raise
        except TimeoutError:
            r.say("select song: no reply yet (attempt %d)" % (attempt + 1)); time.sleep(1.0)
    else:
        r.say("the device does not answer after the CLOCK change"); return False
    st = l.play_song()
    r.pump(0.3)
    st = r.status()
    r.say("armed: follow state %d (1 = armed), song state %d, loaded %d" % (st["follow"], st["song_state"], st["loaded"]))
    if st["follow"] != 1:
        # the detent went the other way, or the clock was already MIDI and PLAY toggled something: try once the other way
        l.stop_song(); r.pump(0.3)
        l.key(4, 0, 255); time.sleep(0.2)
        l.play_song(); r.pump(0.3)
        st = r.status()
        r.say("armed (second try): follow state %d" % st["follow"])
    return st["follow"] == 1


def scenario_lock(r, seconds):
    m = r.m
    m.bpm = 120.0
    r.pump(0.2)
    t_start = time.monotonic_ns()
    r.say("Start at 120 BPM")
    with r.lock:
        r.l.send_raw(b"\xfa")
    m.paused = False
    r.pump(seconds + 2)
    m.paused = True
    din, usb = r.ev(t_start)
    first = {k: min([n[0] for n in note_ons(e)] or [0]) for k, e in (("din", din), ("usb", usb))}
    res = {"lock_time_ms": {k: round((first[k] - t_start) / 1e6, 1) if first[k] else None for k in first}}
    for k, e in (("din", din), ("usb", usb)):
        res[k] = stats(offsets(note_ons(e), m.pulse_ns, t_start + 3 * NS, t_start + (seconds + 1) * NS))
    r.say("lock: " + json.dumps(res))
    return res


def scenario_tempo(r, seconds):
    m = r.m
    res = {}
    for bpm in (90, 150, 120):
        m.bpm = float(bpm)
        t0 = time.monotonic_ns()
        m.paused = False
        r.pump(seconds)
        din, usb = r.ev(t0)
        res[str(bpm)] = {k: stats(offsets(note_ons(e), m.pulse_ns, t0 + 4 * NS, t0 + seconds * NS)) for k, e in (("din", din), ("usb", usb))}
        st = r.status()
        res[str(bpm)]["follow"] = st["follow"]
        r.say("tempo %d: %s (follow %d)" % (bpm, json.dumps(res[str(bpm)]), st["follow"]))
    m.paused = True
    return res


def scenario_gap(r):
    m = r.m
    out = []
    m.bpm = 120.0
    m.paused = False
    r.pump(2.0)
    s = r.status(); out.append(("running", s["follow"]))
    t0 = time.monotonic_ns()
    m.paused = True
    r.pump(0.3)
    s = r.status(); out.append(("0.3 s gap (HELD expected 5)", s["follow"]))
    din, usb = r.ev(t0)
    out.append(("note-offs during the hold (din, usb)", (len(note_offs(din)), len(note_offs(usb)))))
    t1 = time.monotonic_ns()
    m.paused = False
    r.pump(0.6)
    s = r.status(); out.append(("pulses back inside 2 s (RUNNING expected 4)", s["follow"]))
    m.paused = True
    r.pump(3.0)
    s = r.status(); out.append(("3 s gap (LOST expected 6)", s["follow"]))
    m.paused = False
    r.pump(1.5)
    s = r.status(); out.append(("pulses alone after LOST (still 6)", s["follow"]))
    with r.lock:
        r.l.send_raw(b"\xfb")
    r.pump(0.8)
    s = r.status(); out.append(("Continue (RUNNING 4)", s["follow"]))
    m.paused = True
    for k, v in out:
        r.say("gap: %s: %s" % (k, v))
    return out


def scenario_stop(r):
    m = r.m
    out = []
    m.paused = False
    r.pump(1.5)
    t0 = time.monotonic_ns()
    with r.lock:
        r.l.send_raw(b"\xfc")
    r.pump(0.5)
    s = r.status(); out.append(("Stop (STOPPED expected 7)", s["follow"]))
    din, usb = r.ev(t0)
    out.append(("note-ons after Stop (din, usb; 0 expected)", (len([n for n in note_ons(din) if n[0] > t0 + 100_000_000]), len([n for n in note_ons(usb) if n[0] > t0 + 100_000_000]))))
    r.pump(1.0)
    s = r.status(); out.append(("pulses after Stop (still 7)", s["follow"]))
    with r.lock:
        r.l.send_raw(b"\xfb")
    r.pump(0.8)
    s = r.status(); out.append(("Continue (4)", s["follow"]))
    with r.lock:
        r.l.send_raw(b"\xfa")
    r.pump(0.8)
    s = r.status(); out.append(("Start (4)", s["follow"]))
    m.paused = True
    for k, v in out:
        r.say("stop: %s: %s" % (k, v))
    return out


def scenario_spp(r):
    m = r.m
    out = []
    m.paused = False
    r.pump(1.0)
    with r.lock:
        r.l.send_raw(bytes([0xf2, 8, 0]))            # SPP 8 while running
    r.pump(1.0)
    s = r.status(); out.append(("SPP while running (4)", s["follow"]))
    with r.lock:
        r.l.send_raw(b"\xfc")
    r.pump(0.3)
    with r.lock:
        r.l.send_raw(bytes([0xf2, 4, 0]))            # SPP 4 while stopped
    r.pump(0.5)
    s = r.status(); out.append(("SPP while stopped (7)", s["follow"]))
    with r.lock:
        r.l.send_raw(b"\xfb")
    r.pump(1.0)
    s = r.status(); out.append(("Continue after SPP (4)", s["follow"]))
    m.paused = True
    for k, v in out:
        r.say("spp: %s: %s" % (k, v))
    return out


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, default=16)
    p.add_argument("--seconds", type=float, default=60)
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--only", default="lock,tempo,gap,stop,spp")
    p.add_argument("--a2", choices=["keep", "on", "off"], default="keep", help="v0.2: set option A2 (remote command 29) before the CLOCK change; the first run on tabby-v04.3 hung the device after the CLOCK change with A2 on (BUILD.md 33.3)")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    r = Rig(a)
    result = {}
    try:
        if a.a2 != "keep":
            st = r.l.set_a2(a.a2 == "on"); r.say("A2 set %s: reported %d" % (a.a2, st["a2"]))
        if not arm(r, a.song):
            r.say("could not arm the song (CLOCK = MIDI not set by the panel injection): stopping")
            return 1
        for name in a.only.split(","):
            fn = {"lock": lambda: scenario_lock(r, a.seconds), "tempo": lambda: scenario_tempo(r, max(10, a.seconds / 3)),
                  "gap": lambda: scenario_gap(r), "stop": lambda: scenario_stop(r), "spp": lambda: scenario_spp(r)}[name]
            result[name] = fn()
        h = r.l.health()
        result["health"] = h
        r.say("health: " + json.dumps(h))
    finally:
        try:
            r.l.stop_song(); time.sleep(0.4)
            r.l.press("HOME"); r.l.press("SEQ")      # back on SYNC / MIDI: K1 one detent down = CLOCK INT again (the device is left as it was)
            r.l.key(4, 0, 255); time.sleep(0.3)
            r.l.press("HOME")
        except Exception:
            pass
        r.close()
        with open(os.path.join(a.out, "follow-summary.json"), "w") as f:
            json.dump({"result": result, "log": r.log}, f, indent=1, default=str)
    return 0


if __name__ == "__main__":
    sys.exit(main())
