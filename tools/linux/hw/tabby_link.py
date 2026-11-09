#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/tabby_link.py — a USB MIDI link to a Classic Tabby device for the unattended
                               hardware run (Task 11B), plus timestamped audio capture

Purpose
    The timed parts of docs/BUILD.md 24.6 need no browser: reading the diagnostic counters,
    starting and stopping a song, saving a project slot, sending notes and MIDI clock at exact
    times, recording the DIN monitor and the audio. This module talks to the device the way the
    workbench does (the project-library SysEx protocol of app/transfer.c: F0 7D 'F' 'M' 02 cmd
    token-lo token-hi <7-bit packed payload> checksum F7, ported from sdk/WebUpdate.js demoFrame /
    demoParse), over the device's own ALSA raw MIDI port, so the browser must be closed while it
    runs (Chrome holds the port). It never writes firmware: installs and restores go through the
    workbench pages (tools/linux/hw/workbench.mjs).

    Commands it sends (all exist on the device; 25 and 26 only on the diagnostic build):
      0  device info             9  slot name (empty test)     7  save the workspace to a slot
      21 / 22 / 23  capabilities and song storage status        25  diagnostic counters
      26 (Task 11B, diag only)  ACTIONS status, play song, stop, compact
      1/2/6  download (read)    3/4/5/6  upload (only to delete a song: an all-0xFF record)

    Audio: Capture records an ALSA PCM device (the AUDIO4c: 8 channels S32_LE at 48 kHz) and keeps
    the channels asked for, with pairs (CLOCK_MONOTONIC time, frame index) taken from the PCM's
    hardware timestamps after every read, so a sample's time is known on the same clock as the
    DIN monitor's kernel MIDI timestamps (tools/linux/midi-monitor.py).

Version: 0.4

Revision log
    v0.4  2026-11-09  Task 12 B1: diag() reads the control-loop profile (command 25 pages 4 and 5, every build
                      from tabby-v04.0; decoded as sdk/WebUpdate.js diagRead), diag_text() prints it.
    v0.3  2026-11-08  kernel timestamps on the device's USB output (snd_rawmidi_tread).
    v0.2  2026-11-08  diag page 3 (screen timing) when the firmware has it.
    v0.1  2026-11-07  Task 11B: first version.
"""

import ctypes
import ctypes.util
import os
import select
import struct
import sys
import threading
import time
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import importlib.util
_spec = importlib.util.spec_from_file_location("midi_monitor", os.path.join(os.path.dirname(HERE), "midi-monitor.py"))
monitor = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(monitor)

LIB = ctypes.CDLL(ctypes.util.find_library("asound") or "libasound.so.2")
LIB.snd_strerror.restype = ctypes.c_char_p
LIB.snd_rawmidi_read.restype = ctypes.c_ssize_t
LIB.snd_rawmidi_write.restype = ctypes.c_ssize_t
LIB.snd_pcm_readi.restype = ctypes.c_long


def err(code):
    return LIB.snd_strerror(code).decode()


# ---- the workbench's project-library framing (sdk/WebUpdate.js demoFrame/demoParse) -------
def pack7(data):
    out, value, bits = [], 0, 0
    for b in data:
        value |= b << bits; bits += 8
        while bits >= 7:
            out.append(value & 127); value >>= 7; bits -= 7
    if bits:
        out.append(value & 127)
    return out


def frame(command, token, payload=b""):
    data = [0xF0, 0x7D, 0x46, 0x4D, 2, command, token & 127, token >> 7] + pack7(payload)
    data.append((-sum(data[1:])) & 127)
    data.append(0xF7)
    return bytes(data)


def parse(msg):
    if len(msg) < 10 or msg[0] != 0xF0 or msg[-1] != 0xF7 or list(msg[1:5]) != [0x7D, 0x46, 0x4D, 2]:
        return None
    if any(b > 127 for b in msg[1:-1]) or sum(msg[1:-1]) % 128:
        return None
    value = bits = 0
    out = []
    for b in msg[8:-2]:
        value |= b << bits; bits += 7
        if bits >= 8:
            out.append(value & 255); value >>= 8; bits -= 8
    return {"command": msg[5], "token": msg[6] | msg[7] << 7, "data": bytes(out)}


class DeviceError(Exception):
    def __init__(self, code):
        super().__init__("device reply code %d" % code)
        self.code = code


def crc32(data):
    import zlib
    return zlib.crc32(bytes(data)) & 0xFFFFFFFF


class Link:
    """Duplex raw MIDI on the device's port (default: the ALSA port named "SMK37")."""

    def __init__(self, port="SMK37"):
        self.name = monitor.resolve(port)
        self.inp, self.out = ctypes.c_void_p(), ctypes.c_void_p()
        r = LIB.snd_rawmidi_open(ctypes.byref(self.inp), ctypes.byref(self.out), self.name.encode(), 2)   # non-blocking
        if r < 0:
            raise OSError("snd_rawmidi_open(%s): %s (close the browser: it holds the port)" % (self.name, err(r)))
        LIB.snd_rawmidi_nonblock(self.out, 0)       # writes block until the bytes are queued
        class PollFd(ctypes.Structure):
            _fields_ = [("fd", ctypes.c_int), ("events", ctypes.c_short), ("revents", ctypes.c_short)]
        fds = (PollFd * 4)()
        n = LIB.snd_rawmidi_poll_descriptors(self.inp, fds, 4)
        self.poll = select.poll()
        for i in range(max(0, n)):
            self.poll.register(fds[i].fd, fds[i].events)
        self.parser = monitor.Parser()
        self.buf = ctypes.create_string_buffer(4096)
        self.token = 1000
        # v0.3: kernel receive timestamps (CLOCK_MONOTONIC) on the device's USB output, as the DIN
        # monitor has, so a measurement on USB out adds no Python scheduling jitter.
        self.kernel_time = False
        params = ctypes.c_void_p()
        if hasattr(LIB, "snd_rawmidi_tread") and LIB.snd_rawmidi_params_malloc(ctypes.byref(params)) == 0:
            ok = (LIB.snd_rawmidi_params_current(self.inp, params) == 0 and
                  LIB.snd_rawmidi_params_set_read_mode(self.inp, params, 1) == 0 and
                  LIB.snd_rawmidi_params_set_clock_type(self.inp, params, 2) == 0 and
                  LIB.snd_rawmidi_params(self.inp, params) == 0)
            LIB.snd_rawmidi_params_free(params)
            self.kernel_time = bool(ok)
            LIB.snd_rawmidi_tread.restype = ctypes.c_ssize_t
        self.other = []                              # non-SysEx messages seen while waiting

    def close(self):
        for h in (self.inp, self.out):
            if h:
                LIB.snd_rawmidi_close(h)
        self.inp = self.out = None

    def send(self, data):
        """Write bytes now; returns time.monotonic_ns() taken just before the write call."""
        t = time.monotonic_ns()
        n = LIB.snd_rawmidi_write(self.out, bytes(data), len(data))
        if n != len(data):
            raise OSError("snd_rawmidi_write: %s" % (err(n) if n < 0 else "short"))
        LIB.snd_rawmidi_drain(self.out) if len(data) > 64 else None
        return t

    def messages(self, timeout_ms):
        if not self.poll.poll(timeout_ms):
            return []
        if self.kernel_time:
            ts = Timespec()
            n = LIB.snd_rawmidi_tread(self.inp, ctypes.byref(ts), self.buf, 4096)
            t = ts.tv_sec * 1000000000 + ts.tv_nsec if n > 0 else 0
        else:
            n = LIB.snd_rawmidi_read(self.inp, self.buf, 4096); t = time.monotonic_ns()
        if n <= 0:
            return []
        return self.parser.feed(t or time.monotonic_ns(), self.buf.raw[:n])

    def query(self, command, payload=b"", timeout=1.5, attempts=3, empty_ok=False):
        for _ in range(attempts):
            self.token = (self.token + 1) & 16383
            token = self.token
            self.send(frame(command, token, payload))
            end = time.monotonic() + timeout
            while time.monotonic() < end:
                for t, m in self.messages(50):
                    if m[0] != 0xF0:
                        self.other.append((t, m)); continue
                    r = parse(m)
                    if r and r["command"] == (command | 64) and r["token"] == token:
                        code = r["data"][0]
                        if code and not (empty_ok and code == 1):
                            raise DeviceError(code)
                        return r["data"][1:]
        raise TimeoutError("no reply to command %d" % command)

    # ---- commands --------------------------------------------------------------------------
    def info(self):
        d = self.query(0)
        return {"version": d[0], "slots": d[1], "slot": d[2], "project_bytes": d[3] | d[4] << 8, "clock": d[5], "sources": list(d[6:14])}

    def capabilities(self):
        a = self.query(21); b = self.query(22)
        region = struct.unpack_from("<I", a, 3)[0]
        return {"tuning": bool(a[0] & 1), "song_region": region, "user_bytes": region + 73728, "flags": b[8],
                "diag_counters": bool(b[8] & 64), "settings_kind8": bool(b[8] & 128)}

    def song_status(self):
        s = self.query(23)
        free, recl = struct.unpack_from("<II", s, 0)
        return {"free": free, "reclaimable": recl, "state": s[8], "loaded": s[9], "playing": s[10], "row": s[11], "error": s[12], "late": s[13]}

    def actions(self):
        """Command 26 (diag build with the Task 11B remote command): the ACTIONS page's content."""
        s = self.query(26)
        size, = struct.unpack_from("<I", s, 0)
        free, recl = struct.unpack_from("<II", s, 7)
        names = ["SCANNING", "READY", "OLD DATA", "ERASING", "ERROR", "COMPACTING"]
        return {"flash_size": size, "storage": names[s[4]] if s[4] < 6 else s[4], "playing": s[5], "loaded": s[6],
                "free": free, "reclaim": recl,
                "line1": "USER %s SONG %s" % (size if size else "0 INVALID", names[s[4]] if s[4] < 6 else "?"),
                "line2": "FREE %dK  RECLAIM %dK" % (free // 1024, recl // 1024)}

    def play(self, song):
        self.query(26, bytes([1, song]))

    def stop(self):
        self.query(26, bytes([0]))

    def compact(self):
        self.query(26, bytes([2]))

    def erase_old(self):
        """ACTIONS > ERASE OLD SAMPLE/DX7 through command 26 {3}; the poll then erases."""
        self.query(26, bytes([3]))

    def save_slot(self, slot):
        self.query(7, bytes([slot]), timeout=6, attempts=1)

    def song_delete(self, slot):
        """Delete a song the workbench's way (kind 5 upload of an all-0xFF record)."""
        data = b"\xff" * 4096
        try:
            self.query(3, bytes([5, slot, 0, 16]))
            for at in range(0, 4096, 64):
                self.query(4, bytes([at & 255, at >> 8]) + data[at:at + 64])
            self.query(5, struct.pack("<I", crc32(data)), timeout=6, attempts=1)
        finally:
            try: self.query(6)
            except Exception: pass

    def diag(self, request=0):
        """Command 25: page 1 (request 0 or 1 = reset first) and page 2, as a dict in ms."""
        a = self.query(25, bytes([request])); b = self.query(25, bytes([2]))
        u = lambda p, i: struct.unpack_from("<I", p, i)[0]
        hz = u(a, 0) or 24000000
        ms = lambda t: t * 1000.0 / hz
        secs = u(a, 4) / hz
        screen = None
        try:                                  # v0.2: page 3 (screen timing), diag-r2 builds and later
            c = self.query(25, bytes([3]), attempts=1)
            if len(c) == 28:
                screen = {"controls": u(c, 0), "control_mean_ms": ms(u(c, 4)), "control_max_ms": ms(u(c, 8)),
                          "paints": u(c, 12), "bands": u(c, 16), "paint_mean_ms": ms(u(c, 20)), "paint_max_ms": ms(u(c, 24)),
                          "paints_per_second": u(c, 12) / secs if secs else 0}
        except (DeviceError, TimeoutError):
            pass
        profile = None
        try:                                  # v0.4: pages 4 and 5 (the loop profile, app/diag.c ct_prof_read)
            p4 = self.query(25, bytes([4]), attempts=1); p5 = self.query(25, bytes([5]), attempts=1)
            if len(p4) == 60 and len(p5) == 56:
                names = ["router", "song", "storage", "screen", "panel", "transfer", "project", "sdk"]
                sec = {names[i]: {"max_ms": ms(u(p4, 12 + 8 * i)), "mean_ms": ms(u(p4, 16 + 8 * i))} for i in range(6)}
                for i in range(2):
                    sec[names[6 + i]] = {"max_ms": ms(u(p5, 8 * i)), "mean_ms": ms(u(p5, 4 + 8 * i))}
                for i in range(7):
                    sec[names[i]]["calls"] = u(p5, 28 + 4 * i)
                profile = {"passes": u(p4, 0), "pass_mean_ms": ms(u(p4, 4)), "pass_max_ms": ms(u(p4, 8)), "sections": sec,
                           "midi_in": {"calls": u(p5, 16), "mean_ms": ms(u(p5, 20)), "max_ms": ms(u(p5, 24))}}
        except (DeviceError, TimeoutError):
            pass
        return {"seconds": secs, "screen": screen, "profile": profile, "loop": {"count": u(a, 8), "max_ms": ms(u(a, 12)), "mean_ms": ms(u(a, 16))},
                "flash": {"erases": u(a, 20), "erase_max_ms": ms(u(a, 24)), "writes": u(a, 28), "write_max_ms": ms(u(a, 32)), "write_max_bytes": u(a, 36)},
                "keys": {"count": u(a, 40), "max_ms": ms(u(a, 44)), "bins": [a[48 + 2 * i] | a[49 + 2 * i] << 8 for i in range(8)]},
                "scan": {"count": u(b, 0), "per_second": u(b, 0) / secs if secs else 0, "gap_max_ms": ms(u(b, 4)),
                         "isr_peak_ms": ms(u(b, 8)), "adc_peak_ms": ms(u(b, 12))}}


def diag_text(d):
    """The same text as the workbench's "Copy as text" (sdk/WebUpdate.js diagText)."""
    f = lambda v: "%.3f" % v
    k = d["keys"]["bins"]
    return "\n".join([
        "Classic Tabby diagnostic counters, %s s since reset" % f(d["seconds"]),
        "L.1 control loop (groove_midi_poll): %d loops, mean %s ms, max %s ms" % (d["loop"]["count"], f(d["loop"]["mean_ms"]), f(d["loop"]["max_ms"])),
        "L.3 flash: %d erases, longest %s ms; %d writes, longest %s ms (%d bytes)" % (d["flash"]["erases"], f(d["flash"]["erase_max_ms"]), d["flash"]["writes"], f(d["flash"]["write_max_ms"]), d["flash"]["write_max_bytes"]),
        "L.4 key/pad note-on to router: %d notes, max %s ms; <0.5 %d, <1 %d, <2 %d, <4 %d, <8 %d, <16 %d, <32 %d, >=32 %d (ms)" % ((d["keys"]["count"], f(d["keys"]["max_ms"])) + tuple(k)),
        "L.5 matrix scan: %d scans, %.1f per second, longest gap %s ms; scan ISR peak %s ms, ADC ISR peak %s ms" % (d["scan"]["count"], d["scan"]["per_second"], f(d["scan"]["gap_max_ms"]), f(d["scan"]["isr_peak_ms"]), f(d["scan"]["adc_peak_ms"]))]
        + (["screen: %d control calls, mean %s ms, max %s ms; %d band paints (%.1f per second, %d bands), mean %s ms, max %s ms" % (
            d["screen"]["controls"], f(d["screen"]["control_mean_ms"]), f(d["screen"]["control_max_ms"]), d["screen"]["paints"],
            d["screen"]["paints_per_second"], d["screen"]["bands"], f(d["screen"]["paint_mean_ms"]), f(d["screen"]["paint_max_ms"]))] if d.get("screen") else [])
        + (profile_lines(d["profile"]) if d.get("profile") else []))


PROFILE_LABELS = [("router", "router (MIDI out sends)"), ("song", "song scheduling"), ("storage", "song storage (scan / erase / compact)"),
                  ("screen", "screen (panel input, pages, LCD)"), ("panel", "panel and LEDs (key queue, LEDs)"),
                  ("transfer", "transfer (workbench protocol)"), ("project", "project (restores, settings saves)"), ("sdk", "SDK between the hooks")]


def profile_lines(p):
    """v0.4: the profile lines of the workbench's text (sdk/WebUpdate.js diagText)."""
    f = lambda v: "%.3f" % v
    out = ["control pass (SDK call of groove_midi_poll to the next): %d passes, mean %s ms, max %s ms; per section, per pass (mean / max, exclusive):"
           % (p["passes"], f(p["pass_mean_ms"]), f(p["pass_max_ms"]))]
    for k, label in PROFILE_LABELS:
        s = p["sections"][k]
        calls = (", %.2f calls per pass" % (s["calls"] / p["passes"])) if "calls" in s and p["passes"] else ""
        out.append("  %s: %s / %s ms%s" % (label, f(s["mean_ms"]), f(s["max_ms"]), calls))
    m = p["midi_in"]
    out.append("  MIDI input callback (routing task, not in the pass): %d calls, mean %s ms, max %s ms" % (m["calls"], f(m["mean_ms"]), f(m["max_ms"])))
    return out


# ---- DIN monitor in a thread (same capture code as midi-monitor.py) ---------------------
class Monitor(threading.Thread):
    def __init__(self, port="AUDIO4c DIN"):
        super().__init__(daemon=True)
        self.port = monitor.AlsaInput(monitor.resolve(port))
        self.parser, self.messages, self.running = monitor.Parser(), [], True

    def run(self):
        while self.running:
            t, chunk = self.port.read(100)
            if chunk:
                self.messages.extend(self.parser.feed(t, chunk))

    def finish(self):
        self.running = False; self.join(2); self.port.close()
        return monitor.to_rows(self.messages)


# ---- audio capture with monotonic timestamps --------------------------------------------
class Timespec(ctypes.Structure):
    _fields_ = [("tv_sec", ctypes.c_long), ("tv_nsec", ctypes.c_long)]


class Capture(threading.Thread):
    """Record `device` (8 x S32_LE, 48 kHz) and keep `keep` channels as int16. After every read,
    snd_pcm_status gives (htstamp, avail): the frame read_total + avail was captured at htstamp."""

    def __init__(self, device="hw:AUDIO4c", channels=8, rate=48000, keep=(0, 1)):
        super().__init__(daemon=True)
        self.h = ctypes.c_void_p()
        r = LIB.snd_pcm_open(ctypes.byref(self.h), device.encode(), 1, 0)   # SND_PCM_STREAM_CAPTURE, blocking
        if r < 0:
            raise OSError("snd_pcm_open(%s): %s" % (device, err(r)))
        self.channels, self.rate, self.keep = channels, rate, keep
        # S32_LE = 10, RW_INTERLEAVED = 3, no resampling, 20 ms latency.
        r = LIB.snd_pcm_set_params(self.h, 10, 3, channels, rate, 0, 20000)
        if r < 0:
            raise OSError("snd_pcm_set_params: %s" % err(r))
        sw = ctypes.c_void_p(); LIB.snd_pcm_sw_params_malloc(ctypes.byref(sw))
        LIB.snd_pcm_sw_params_current(self.h, sw)
        LIB.snd_pcm_sw_params_set_tstamp_mode(self.h, sw, 1)          # SND_PCM_TSTAMP_ENABLE
        LIB.snd_pcm_sw_params_set_tstamp_type(self.h, sw, 1)          # SND_PCM_TSTAMP_TYPE_MONOTONIC
        r = LIB.snd_pcm_sw_params(self.h, sw); LIB.snd_pcm_sw_params_free(sw)
        if r < 0:
            raise OSError("snd_pcm_sw_params: %s" % err(r))
        self.status = ctypes.c_void_p(); LIB.snd_pcm_status_malloc(ctypes.byref(self.status))
        LIB.snd_pcm_status_get_avail.restype = ctypes.c_ulong
        self.frames = 0; self.pairs = []; self.data = []; self.running = True; self.xruns = 0

    def run(self):
        period = 480
        buf = (ctypes.c_int32 * (period * self.channels))()
        LIB.snd_pcm_start(self.h)          # the AUDIO4c's capture does not auto-start on readi (-EIO)
        while self.running:
            n = LIB.snd_pcm_readi(self.h, buf, period)
            if n < 0:
                self.xruns += 1; LIB.snd_pcm_recover(self.h, n, 1); continue
            arr = memoryview(buf).cast("B").cast("i")[:n * self.channels]
            for c in self.keep:
                self.data.append((c, bytes(struct.pack("<%dh" % n, *[(arr[i * self.channels + c] >> 16) for i in range(n)]))))
            self.frames += n
            if LIB.snd_pcm_status(self.h, self.status) == 0:
                ts = Timespec(); LIB.snd_pcm_status_get_htstamp(self.status, ctypes.byref(ts))
                avail = LIB.snd_pcm_status_get_avail(self.status)
                t = ts.tv_sec * 1000000000 + ts.tv_nsec
                if t:
                    self.pairs.append((t, self.frames + avail))

    def finish(self):
        self.running = False; self.join(3); LIB.snd_pcm_close(self.h)
        chans = {c: bytearray() for c in self.keep}
        for c, b in self.data:
            chans[c] += b
        return chans

    def time_fit(self):
        """Least-squares frame -> monotonic ns: t = a + b * frame (b ~ 1e9 / rate)."""
        xs = [f for _, f in self.pairs]; ys = [t for t, _ in self.pairs]
        n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
        sxx = sum((x - mx) ** 2 for x in xs)
        b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx
        res = [y - (my + b * (x - mx)) for x, y in zip(xs, ys)]
        return {"a": my - b * mx, "b": b, "rate_hz": 1e9 / b, "fit_spread_ms": (max(res) - min(res)) / 1e6, "pairs": n}


def write_wav(path, samples, rate=48000):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(bytes(samples))
