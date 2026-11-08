#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/midi-monitor.py — timestamped MIDI capture from an ALSA port, with the timing
                              analysis for the Classic Tabby hardware checklist

Purpose
    Replaces a DAW for the Task 10 assessment's measurements L.2 (MIDI out jitter) and L.6
    (external clock follow): it reads one ALSA raw MIDI input (the iConnectivity AUDIO4c's DIN
    input, wired from the SMK-37's MIDI out), stamps every message, writes them to a CSV file and
    prints the timing spread and drift of the test songs
    (tests/midi-import/fixtures/timing-8x16.mid and timing-1x16.mid: a 16th on every step at
    120 BPM for 2 minutes, on channels 1-8 or on channel 1 alone).

    It only reads. Nothing is ever sent to the port or to any device.

How the time is taken
    With alsa-lib 1.2.6 or later and a kernel that supports it, the port is opened in ALSA's
    timestamp read mode (SND_RAWMIDI_READ_TSTAMP, CLOCK_MONOTONIC): the kernel stamps each
    chunk of bytes when the USB transfer that carried it completes, so the Python loop adds no
    jitter. Otherwise (or with --user-time) each read is stamped with time.monotonic_ns() right
    after it returns. Either way the floor is the interface's own USB packet timing (the
    AUDIO4c is a high-speed device: 125 us microframes) and DIN's 320 us per byte.

Analysis (printed at the end of a capture, or with --analyze FILE.csv)
    * Clock (0xF8): count, tempo from the median pulse interval, pulse-interval spread.
    * Per channel, the note-ons: each is assigned the 16th it belongs to, k = round((t - t0) / P)
      with P the nominal step (--bpm, default 120: 125 ms; or 6 clock pulses when a clock is in
      the capture and --bpm is not given). A least-squares line t = a + b * k through them gives
      the device's actual step b; the residuals are the jitter:
        spread  max - min of the residuals (the band)       std  their standard deviation
        p99     99th percentile of |residual|               drift  (b - P) / P in ppm, and the
        wander  the largest excursion of a 4-bar moving average of the residuals (a slow walk
                the straight line does not remove).
    * Across channels (the 8-track song): for each 16th, the width of the burst from the first to
      the last channel's note-on. On DIN, eight note-ons take at least 7.7 ms to send (24 bytes at
      31250 baud), so the burst is mostly the wire; its spread from step to step is the jitter.

Two ports at once (L.6)
    --port can be given twice (the MC-101's own USB output and the AUDIO4c's DIN input from the
    SMK-37): both are captured into one CSV (column `port`) on the same clock, analysed per port
    and channel, and the second port's note-ons are paired with the first port's nearest note-on:
    the lag (mean, min, max, spread) is how far the follower sits behind the master. Give the
    master first: the CSV labels the ports "1 ..." and "2 ...".

Run (docs/BUILD.md 24.6)
    python3 tools/linux/midi-monitor.py --list
    python3 tools/linux/midi-monitor.py --port "AUDIO4c DIN" --seconds 150 --csv l2-8x16.csv
    python3 tools/linux/midi-monitor.py --analyze l2-8x16.csv [--bpm 120] [--channel 1]
    --port takes a name substring as `amidi -l` prints it, or hw:CARD,DEVICE[,SUB].
    Stop early with Ctrl-C: the capture so far is written and analysed.

Version: 0.3

Revision log
    v0.3  2026-11-08  Task 11B: steps are counted note to note (robust to drift); the clock's tempo
                      comes from the pulse count over the capture, not the median interval (a device
                      that sends two pulses per control loop has a bimodal interval).
    v0.2  2026-11-07  Task 11 Step 6: two ports in one capture (--port twice, a port column) and
                      the lag of the second port's note-ons behind the first's.
    v0.1  2026-11-07  Task 11 Step 3: first version (capture, CSV, analysis, --list).
"""

import argparse
import csv
import ctypes
import ctypes.util
import math
import re
import select
import statistics
import subprocess
import sys
import time

# ---- MIDI byte stream to messages ----------------------------------------------------------
DATA_BYTES = {0x80: 2, 0x90: 2, 0xA0: 2, 0xB0: 2, 0xC0: 1, 0xD0: 1, 0xE0: 2}
SYSTEM_BYTES = {0xF1: 1, 0xF2: 2, 0xF3: 1, 0xF6: 0}
KINDS = {0x80: "note_off", 0x90: "note_on", 0xA0: "poly_pressure", 0xB0: "cc", 0xC0: "program",
         0xD0: "channel_pressure", 0xE0: "pitch_bend", 0xF8: "clock", 0xFA: "start", 0xFB: "continue",
         0xFC: "stop", 0xF2: "song_position", 0xFE: "active_sensing", 0xF0: "sysex"}


class Parser:
    """Turn bytes into complete messages, with running status and real-time bytes that may
    arrive in the middle of another message (MIDI 1.0 rules). Each message keeps the time of the
    chunk its last byte arrived in."""

    def __init__(self):
        self.status = 0
        self.data = []
        self.sysex = None

    def feed(self, t_ns, chunk):
        out = []
        for b in chunk:
            if b >= 0xF8:                         # real-time: complete by itself, does not touch running status
                out.append((t_ns, [b]))
                continue
            if b == 0xF0:
                self.sysex = [b]; self.status = 0; continue
            if b == 0xF7:
                if self.sysex is not None:
                    out.append((t_ns, self.sysex + [b])); self.sysex = None
                continue
            if self.sysex is not None:
                if b & 0x80:
                    self.sysex = None             # an unterminated SysEx ends at any status byte
                else:
                    self.sysex.append(b); continue
            if b & 0x80:
                self.status = b; self.data = []
                if b in SYSTEM_BYTES and SYSTEM_BYTES[b] == 0:
                    out.append((t_ns, [b])); self.status = 0
                continue
            if not self.status:
                continue                          # data without a status: dropped
            self.data.append(b)
            need = SYSTEM_BYTES.get(self.status, DATA_BYTES.get(self.status & 0xF0, 0))
            if len(self.data) == need:
                out.append((t_ns, [self.status] + self.data)); self.data = []
                if self.status >= 0xF0:
                    self.status = 0               # system common messages cancel running status
        return out


def describe(message):
    s = message[0]
    if s >= 0xF0:
        return KINDS.get(s, "system"), ""
    kind = KINDS[s & 0xF0]
    if kind == "note_on" and len(message) > 2 and message[2] == 0:
        kind = "note_off"
    return kind, (s & 15) + 1


# ---- ALSA raw MIDI input (ctypes over libasound) -------------------------------------------
class AlsaInput:
    SND_RAWMIDI_READ_TSTAMP = 1
    SND_RAWMIDI_CLOCK_MONOTONIC = 2

    class Timespec(ctypes.Structure):
        _fields_ = [("tv_sec", ctypes.c_long), ("tv_nsec", ctypes.c_long)]

    def __init__(self, name, user_time=False):
        path = ctypes.util.find_library("asound") or "libasound.so.2"
        self.lib = ctypes.CDLL(path)
        self.handle = ctypes.c_void_p()
        # Input only (output pointer NULL), non-blocking (SND_RAWMIDI_NONBLOCK = 2): the loop waits
        # in poll() on the port's descriptor, so a silent port cannot hang the capture.
        r = self.lib.snd_rawmidi_open(ctypes.byref(self.handle), None, name.encode(), 2)
        if r < 0:
            raise OSError("snd_rawmidi_open(%s) failed: %s" % (name, self.error(r)))
        class PollFd(ctypes.Structure):
            _fields_ = [("fd", ctypes.c_int), ("events", ctypes.c_short), ("revents", ctypes.c_short)]
        fds = (PollFd * 4)()
        n = self.lib.snd_rawmidi_poll_descriptors(self.handle, fds, 4)
        self.poll = select.poll()
        for i in range(max(0, n)):
            self.poll.register(fds[i].fd, fds[i].events)
        self.kernel_time = False
        if not user_time and hasattr(self.lib, "snd_rawmidi_tread") and hasattr(self.lib, "snd_rawmidi_params_set_read_mode"):
            params = ctypes.c_void_p()
            if self.lib.snd_rawmidi_params_malloc(ctypes.byref(params)) == 0:
                ok = (self.lib.snd_rawmidi_params_current(self.handle, params) == 0 and
                      self.lib.snd_rawmidi_params_set_read_mode(self.handle, params, self.SND_RAWMIDI_READ_TSTAMP) == 0 and
                      self.lib.snd_rawmidi_params_set_clock_type(self.handle, params, self.SND_RAWMIDI_CLOCK_MONOTONIC) == 0 and
                      self.lib.snd_rawmidi_params(self.handle, params) == 0)
                self.lib.snd_rawmidi_params_free(params)
                self.kernel_time = bool(ok)
        self.lib.snd_rawmidi_read.restype = ctypes.c_ssize_t
        if hasattr(self.lib, "snd_rawmidi_tread"):
            self.lib.snd_rawmidi_tread.restype = ctypes.c_ssize_t
        self.buffer = ctypes.create_string_buffer(4096)

    def error(self, code):
        self.lib.snd_strerror.restype = ctypes.c_char_p
        return self.lib.snd_strerror(code).decode()

    def read(self, timeout_ms=200):
        """Wait up to timeout_ms for bytes; return (t_ns, bytes), bytes empty on a timeout."""
        if not self.poll.poll(timeout_ms):
            return time.monotonic_ns(), b""
        if self.kernel_time:
            ts = self.Timespec()
            n = self.lib.snd_rawmidi_tread(self.handle, ctypes.byref(ts), self.buffer, 4096)
            if n == -11:                           # -EAGAIN
                return time.monotonic_ns(), b""
            if n < 0:
                raise OSError("snd_rawmidi_tread: %s" % self.error(n))
            t = ts.tv_sec * 1000000000 + ts.tv_nsec
            if t == 0:
                t = time.monotonic_ns()
            return t, self.buffer.raw[:n]
        n = self.lib.snd_rawmidi_read(self.handle, self.buffer, 4096)
        t = time.monotonic_ns()
        if n == -11:                               # -EAGAIN
            return t, b""
        if n < 0:
            raise OSError("snd_rawmidi_read: %s" % self.error(n))
        return t, self.buffer.raw[:n]

    def close(self):
        if self.handle:
            self.lib.snd_rawmidi_close(self.handle); self.handle = None


def list_ports():
    """The ports `amidi -l` reports (amidi only reads the card info)."""
    try:
        text = subprocess.run(["amidi", "-l"], capture_output=True, text=True, check=False).stdout
    except FileNotFoundError:
        text = ""
    ports = []
    for line in text.splitlines():
        m = re.match(r"^\s*([IO]+)\s+(hw:\d+,\d+(?:,\d+)?)\s+(.*)$", line)
        if m:
            ports.append((m.group(1), m.group(2), m.group(3).strip()))
    return ports


def resolve(port):
    if re.match(r"^hw:\d+,\d+(,\d+)?$", port):
        return port
    found = [p for p in list_ports() if "I" in p[0] and port.lower() in p[2].lower()]
    if len(found) != 1:
        raise SystemExit("--port %r matches %d input ports; use --list and give hw:C,D,S" % (port, len(found)))
    return found[0][1]


# ---- analysis ------------------------------------------------------------------------------
def fit(ks, ts):
    """Least-squares line t = a + b k."""
    n = len(ks)
    mk, mt = sum(ks) / n, sum(ts) / n
    sxx = sum((k - mk) ** 2 for k in ks)
    b = sum((k - mk) * (t - mt) for k, t in zip(ks, ts)) / sxx if sxx else 0.0
    return mt - b * mk, b


def percentile(values, q):
    v = sorted(values)
    if not v:
        return 0.0
    i = min(len(v) - 1, max(0, int(math.ceil(q * len(v))) - 1))
    return v[i]


def analyze(rows, bpm=None, channel=None):
    """rows: [(t_ns, kind, channel, data1, data2[, port])]. Returns a dict of results (times in ms).
    With more than one port, the per-channel keys are "port:channel" and "lag" pairs the second
    port's note-ons with the first port's."""
    ports = sorted({r[5] for r in rows if len(r) > 5 and r[5]})
    multi = len(ports) > 1
    result = {"messages": len(rows), "ports": ports}
    clocks = [r[0] for r in rows if r[1] == "clock"]
    if len(clocks) > 24:
        iv = [(b - a) / 1e6 for a, b in zip(clocks, clocks[1:])]
        med = (clocks[-1] - clocks[0]) / 1e6 / (len(clocks) - 1)   # v0.3: mean over the run
        result["clock"] = {"pulses": len(clocks), "bpm": 60000.0 / (24 * med), "interval_ms": med,
                           "interval_spread_ms": max(iv) - min(iv), "interval_std_ms": statistics.pstdev(iv)}
    if bpm:
        period = 60000.0 / bpm / 4
    elif "clock" in result:
        period = result["clock"]["interval_ms"] * 6
    else:
        period = 125.0
    result["step_ms"] = period
    ons = {}
    for r in rows:
        t, kind, ch = r[0], r[1], r[2]
        if kind == "note_on" and (channel is None or ch == channel):
            key = "%s:%s" % (r[5], ch) if multi else ch
            ons.setdefault(key, []).append(t / 1e6)
    channels = sorted(ons, key=str)
    result["channels"] = {}
    t0 = min(ons[c][0] for c in channels if c in ons) if any(c in ons for c in channels) else 0.0
    burst_steps = {}
    for c in channels:
        ts = ons.get(c, [])
        if len(ts) < 8:
            continue
        # v0.3: step from note to note (k_i = k_(i-1) + round(dt / P)), so drift accumulated over a
        # long run cannot round a note onto its neighbour's step (with -438 ppm on the device the old
        # rounding against t0 misassigned notes after about a minute).
        ks = [round((ts[0] - t0) / period)]
        for prev, t in zip(ts, ts[1:]):
            ks.append(ks[-1] + max(1, round((t - prev) / period)))
        a, b = fit(ks, ts)
        res = [t - (a + b * k) for k, t in zip(ks, ts)]
        window = 64                                       # 4 bars of 16ths
        avg = [statistics.fmean(res[i:i + window]) for i in range(0, max(1, len(res) - window + 1), 16)]
        dup = len(ks) - len(set(ks))
        result["channels"][c] = {
            "notes": len(ts), "spread_ms": max(res) - min(res), "std_ms": statistics.pstdev(res),
            "p99_ms": percentile([abs(x) for x in res], 0.99), "step_fit_ms": b,
            "drift_ppm": (b - period) / period * 1e6, "wander_ms": (max(avg) - min(avg)) if avg else 0.0,
            "end_vs_nominal_ms": (ts[-1] - ts[0]) - (ks[-1] - ks[0]) * period, "same_step_twice": dup}
        for k, t in zip(ks, ts):
            burst_steps.setdefault(k, []).append(t)
    if multi:
        first = sorted(t for k, v in ons.items() if str(k).startswith(ports[0] + ":") for t in v)
        second = sorted(t for k, v in ons.items() if str(k).startswith(ports[1] + ":") for t in v)
        lags, j = [], 0
        for t in second:
            while j + 1 < len(first) and abs(first[j + 1] - t) <= abs(first[j] - t):
                j += 1
            if first and abs(first[j] - t) <= period / 2:
                lags.append(t - first[j])
        if lags:
            result["lag"] = {"from": ports[0], "to": ports[1], "pairs": len(lags), "mean_ms": statistics.fmean(lags),
                             "min_ms": min(lags), "max_ms": max(lags), "spread_ms": max(lags) - min(lags)}
        burst_steps = {}                                   # bursts mix ports: not meaningful
    widths = [max(v) - min(v) for v in burst_steps.values() if len(v) == len(result["channels"]) and len(v) > 1]
    if widths:
        result["burst"] = {"steps": len(widths), "width_mean_ms": statistics.fmean(widths),
                           "width_min_ms": min(widths), "width_max_ms": max(widths)}
    return result


def report(result, out=sys.stdout):
    w = out.write
    w("messages: %d   nominal 16th: %.3f ms\n" % (result["messages"], result["step_ms"]))
    if "clock" in result:
        c = result["clock"]
        w("clock: %d pulses, %.3f BPM, pulse %.4f ms, pulse spread %.3f ms (std %.3f)\n"
          % (c["pulses"], c["bpm"], c["interval_ms"], c["interval_spread_ms"], c["interval_std_ms"]))
    w("%-4s %7s %10s %9s %9s %11s %10s %10s\n" % ("ch", "notes", "spread_ms", "std_ms", "p99_ms", "drift_ppm", "wander_ms", "end_ms"))
    for ch, r in sorted(result["channels"].items(), key=lambda x: str(x[0])):
        w("%-4s %7d %10.3f %9.3f %9.3f %11.1f %10.3f %10.3f%s\n" % (ch, r["notes"], r["spread_ms"], r["std_ms"], r["p99_ms"],
          r["drift_ppm"], r["wander_ms"], r["end_vs_nominal_ms"], "   (%d steps doubled)" % r["same_step_twice"] if r["same_step_twice"] else ""))
    if "burst" in result:
        b = result["burst"]
        w("8-channel burst (first to last note-on of a 16th): mean %.3f ms, min %.3f, max %.3f over %d steps\n"
          % (b["width_mean_ms"], b["width_min_ms"], b["width_max_ms"], b["steps"]))
    if "lag" in result:
        g = result["lag"]
        w("lag of %s behind %s: %d pairs, mean %.3f ms, min %.3f, max %.3f, spread %.3f ms\n"
          % (g["to"], g["from"], g["pairs"], g["mean_ms"], g["min_ms"], g["max_ms"], g["spread_ms"]))
    if result["channels"]:
        worst = max(result["channels"].values(), key=lambda r: r["spread_ms"])
        w("BAND (largest per-channel spread): %.3f ms   (SPEC 14.3: wider than about 2 ms makes it Phase 1's first item)\n" % worst["spread_ms"])


def write_csv(path, rows, origin):
    with open(path, "w", newline="") as f:
        out = csv.writer(f)
        out.writerow(["t_ns", "t_ms", "kind", "channel", "data1", "data2", "bytes", "port"])
        for row in rows:
            t, kind, ch, d1, d2, raw = row[:6]
            out.writerow([t, "%.4f" % ((t - origin) / 1e6), kind, ch, d1, d2, raw, row[6] if len(row) > 6 else ""])


def read_csv(path):
    rows = []
    with open(path, newline="") as f:
        for r in csv.DictReader(f):
            ch = int(r["channel"]) if r["channel"] else ""
            d1 = int(r["data1"]) if r["data1"] else ""
            d2 = int(r["data2"]) if r["data2"] else ""
            rows.append((int(r["t_ns"]), r["kind"], ch, d1, d2, r.get("port") or ""))
    return rows


def to_rows(messages, port=""):
    rows = []
    for t, m in messages:
        kind, ch = describe(m)
        d1 = m[1] if len(m) > 1 and m[0] != 0xF0 else ""
        d2 = m[2] if len(m) > 2 and m[0] != 0xF0 else ""
        rows.append((t, kind, ch, d1, d2, " ".join("%02X" % b for b in m), port))
    return rows


def main(argv=None):
    p = argparse.ArgumentParser(description="Timestamped MIDI capture and timing analysis (read only).")
    p.add_argument("--list", action="store_true", help="list the ALSA raw MIDI ports")
    p.add_argument("--port", action="append", help='input port: a name substring from --list ("AUDIO4c DIN") or hw:C,D[,S]; twice for two ports')
    p.add_argument("--seconds", type=float, default=150.0, help="capture length (default 150: the 2-minute song and margin)")
    p.add_argument("--csv", help="write the capture to this CSV file")
    p.add_argument("--analyze", help="analyse an earlier CSV instead of capturing")
    p.add_argument("--bpm", type=float, help="song tempo (default: from the clock, else 120)")
    p.add_argument("--channel", type=int, help="analyse this channel only (1-16)")
    p.add_argument("--user-time", action="store_true", help="stamp in user space even if kernel timestamps are available")
    a = p.parse_args(argv)
    if a.list:
        for d, hw, name in list_ports():
            print("%-3s %-10s %s" % (d, hw, name))
        return 0
    if a.analyze:
        rows = read_csv(a.analyze)
        report(analyze(rows, a.bpm, a.channel))
        return 0
    if not a.port:
        p.error("give --port (see --list), or --analyze FILE")
    if len(a.port) > 2:
        p.error("at most two ports")
    names = [resolve(x) for x in a.port]
    inputs = [AlsaInput(n, a.user_time) for n in names]
    print("capturing %s for %.0f s (%s timestamps); start the song now, Ctrl-C ends early" %
          (" and ".join(names), a.seconds, "kernel" if all(i.kernel_time for i in inputs) else "user-space"), file=sys.stderr)
    parsers, messages = [Parser() for _ in inputs], [[] for _ in inputs]
    end = time.monotonic() + a.seconds
    try:
        while time.monotonic() < end:
            for i, port in enumerate(inputs):
                t, chunk = port.read(20 if len(inputs) > 1 else 200)
                if chunk:
                    messages[i].extend(parsers[i].feed(t, chunk))
    except KeyboardInterrupt:
        pass
    finally:
        for port in inputs:
            port.close()
    # Port labels "1 hw:...", "2 hw:...": their sort order is the command line's, so the first --port
    # is the reference (the master) for the lag, also when a CSV is analysed later.
    rows = sorted((r for i, n in enumerate(names) for r in to_rows(messages[i], "%d %s" % (i + 1, n) if len(names) > 1 else "")), key=lambda r: r[0])
    if a.csv:
        write_csv(a.csv, rows, rows[0][0] if rows else 0)
        print("wrote %d messages to %s" % (len(rows), a.csv), file=sys.stderr)
    report(analyze([r[:5] + (r[6],) for r in rows], a.bpm, a.channel))
    return 0


if __name__ == "__main__":
    sys.exit(main())
