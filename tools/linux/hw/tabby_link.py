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

Version: 0.29

Revision log
    v0.25 2026-11-19  now_ns() is THE clock of the device tools: every tool takes its marks ("notes since now") from it and not
                      from time.monotonic_ns(). Receive times have been on the raw clock since v0.23; a mark from the
                      steered clock can lie tens of ms off them after a few minutes (the time service slews it by up
                      to 365 ppm), and then a message that came right after the mark counted as before it: one check
                      of run-setup.py failed that way in the tabby-v1.0.2-rc1 run (docs/BUILD.md 63.2).
    v0.24 2026-11-18  tabby-v1.0.2: setup_state() reports the song's event lead and how many lines the song's page has.
    v0.23 2026-11-18  Every receive time (the device's USB port and the DIN monitor) is put on a clock this computer does
                      not correct: the kernel stamps with CLOCK_MONOTONIC, which the time service slews (up to -365 ppm
                      on 2026-11-18, 46 ms in two minutes: the 9.9 ms of tabby-v04.23-rc1, docs/BUILD.md 60); steady()
                      maps a stamp to CLOCK_MONOTONIC_RAW through a sampled table and adds the offset the two clocks
                      had when the tool started, so times still compare with time.monotonic_ns() to within what the
                      clock was moved since. clock_report() says what the steered clock did over a span. show_page()
                      knows "clips", "scenes" and "mixer".
    v0.22 2026-11-17  tabby-v04.20: setup_state() reports the open clip's direction.
    v0.21 2026-11-17  tabby-v04.19: setup_state() reports the open clip's scale.
    v0.20 2026-11-17  tabby-v04.17: setup_state() reports the open clip's shuffle and playback quantize.
    v0.19 2026-11-17  tabby-v04.15: setup_state() reports the open clip's transpose.
    v0.18 2026-11-17  tabby-v04.14: setup_state() reports the click level and the controller numbers of K1 to K4.
    v0.17 2026-11-16  tabby-v04.12: setup_state() reports the scene chain's scene.
    v0.16 2026-11-16  tabby-v04.10: setup_state() and setup_do() (the CLIP SETTING page), flash_part().
    v0.15 2026-11-16  Goal 6: steps_state() reports the recorder (tabby-v04.9).
    v0.14 2026-11-16  Goal 6: steps_state(), edit_save(), edit_discard(), edit_open(), play_key(), knob() (remote ops 15 and 16, tabby-v04.8).
    v0.13 2026-11-14  Task 17 Goal 4: clips_state(), clip_launch(), unqueue(), pad(), shift_pad() (remote ops 12 to 14, tabby-v04.7).
    v0.12 2026-11-14  Task 17 Goal 3: launch(), stop_track(), attach() (remote ops 9 to 11, tabby-v04.6).
    v0.11 2026-11-14  messages(): every kernel timestamp frame is read, not one per wake-up (the rest of a reply used to
                      wait in alsa-lib until more MIDI arrived: the cause of the "no replies with CLOCK = MIDI" of
                      Task 16, BUILD 36.5). Link(timestamps=False) reads without kernel timestamps.
    v0.10 2026-11-13  Task 17: fg() reads the F + G page (command 25 request 10); the remote status carries CLOCK
                      (tabby-v04.4); show_page().
    v0.9  2026-11-12  a2(): the 52-byte A2 page of tabby-v04.3 (flash_skipped).
    v0.8  2026-11-11  Task 16: remote control (command 29, every build from tabby-v04.2): remote_status(),
                      select_song(), play_song(), stop_song(), jump(), set_a2(), key(), press() / hold() /
                      release() by control name (PANEL), release_all(). play() and stop() use command 29 when the
                      firmware has it and fall back to command 26 (diag builds). None of it writes flash; the
                      firmware refuses the SAVE button (physical 3).
    v0.7  2026-11-11  Task 15 Step 5: query() goes through the whole read before it returns; the
                      events one read brought after the reply were dropped (run-15's USB capture
                      lost up to 167 ms after the counter reset at the song start; a 20 s probe with
                      230 queries then counted the same clock bytes on USB and DIN, A2 off and on).
    v0.6  2026-11-10  Task 15 Step 4: a2() reads the A2 page (command 25 request 7) and switches option A2
                      (requests 8 = off, 9 = on; CT_A2 diag builds only, a RAM switch, off at boot);
                      health() reads the audio counters (commands 17, 18, 19: engine underruns and dropped
                      MIDI, the render time and CPU GUARD's "adapted" count, the DMA overruns); a2_lines()
                      and health_lines() print them. None of these writes flash.
    v0.5  2026-11-10  Task 13 Step 1: diag() reads profile page 6 when the firmware has it (tabby-v04.1 and
                      later): busy time per pass, passes busy over 10 ms, lost ticks, deferrals;
                      profile_lines() prints it.
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

# ---- v0.23: a clock the time service does not move -------------------------------------------------------------
STEADY = True
# v0.26 (2026-11-20): an unanswered command's error says what the port brought meanwhile (docs/BUILD.md 66.3).
# v0.29 (2026-11-23): the input log of tabby-v1.4 (input_counts, input_events, input_analog, pad_levels, input_reset).
# v0.28 (2026-11-21): worst() and worst_text(): the firmware's worst-lateness record of tabby-v1.3 (command 25 requests 12, 13).
# v0.27 (2026-11-20): query() empties the port before it sends: a full input buffer dropped the reply (docs/BUILD.md 66.5).
CLOCKMAP = []                  # (CLOCK_MONOTONIC ns, CLOCK_MONOTONIC_RAW ns), ten times a second while the tool runs
_CLOCK_LOCK = threading.Lock()


def _clock_pair():
    for _ in range(8):
        a = time.clock_gettime_ns(time.CLOCK_MONOTONIC); r = time.clock_gettime_ns(time.CLOCK_MONOTONIC_RAW); b = time.clock_gettime_ns(time.CLOCK_MONOTONIC)
        if b - a < 100000:
            break
    return (a + b) // 2, r


_FIRST = _clock_pair()
CLOCK_OFFSET = _FIRST[0] - _FIRST[1]       # what the two clocks differed by when this tool started
CLOCKMAP.append(_FIRST)


def _clock_sampler():
    while True:
        time.sleep(0.1)
        pair = _clock_pair()
        with _CLOCK_LOCK:
            CLOCKMAP.append(pair)
            if len(CLOCKMAP) > 400000:
                del CLOCKMAP[:100000]


threading.Thread(target=_clock_sampler, daemon=True).start()


def steady(t):
    """A CLOCK_MONOTONIC time (ns), as the kernel stamps MIDI with, on the unsteered clock: CLOCK_MONOTONIC_RAW plus the
    offset at the tool's start. Intervals of steady times are intervals of the raw clock."""
    import bisect
    with _CLOCK_LOCK:
        m = CLOCKMAP
        if len(m) < 2:
            a0, r0 = m[0]
            return r0 + (t - a0) + CLOCK_OFFSET
        i = min(max(bisect.bisect_left(m, (t, 0)), 1), len(m) - 1)
        (a0, r0), (a1, r1) = m[i - 1], m[i]
    return int(r0 + (t - a0) * (r1 - r0) / (a1 - a0)) + CLOCK_OFFSET


def now_ns():
    """Now, on the steady clock."""
    return time.clock_gettime_ns(time.CLOCK_MONOTONIC_RAW) + CLOCK_OFFSET


def clock_report(t0, t1):
    """What this computer's steered clock did against its raw clock between two times (ns, either clock): the mean
    rate in ppm, how far the two parted in ms, and the bend: the largest distance in ms of their difference from a
    straight line over the span, which is the error a fit over the span would have shown had the stamps not been
    mapped. None when there are not enough samples."""
    with _CLOCK_LOCK:
        d = [(a, a - r) for a, r in CLOCKMAP if t0 - 2_000_000_000 <= a <= t1 + 2_000_000_000]
    if len(d) < 3 or d[-1][0] == d[0][0]:
        return None
    (a0, d0), (a1, d1) = d[0], d[-1]
    slope = (d1 - d0) / (a1 - a0)
    bend = max(abs(x - (d0 + slope * (a - a0))) for a, x in d)
    return {"steer_ppm": round(slope * 1e6, 2), "parted_ms": round((d1 - d0) / 1e6, 3), "bend_ms": round(bend / 1e6, 3), "seconds": round((a1 - a0) / 1e9, 1)}


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

    def __init__(self, port="SMK37", timestamps=True):
        self.name = monitor.resolve(port)
        self.inp, self.out = ctypes.c_void_p(), ctypes.c_void_p()
        r = LIB.snd_rawmidi_open(ctypes.byref(self.inp), ctypes.byref(self.out), self.name.encode(), 2)   # non-blocking
        # v0.28: "Device or resource busy" (-16) for a moment after the browser of the step before let go of the port
        # (tabby-v1.3-rc1: the program test died of it): asked again for 20 s before it is an error
        for _ in range(40):
            if r != -16:
                break
            time.sleep(0.5)
            r = LIB.snd_rawmidi_open(ctypes.byref(self.inp), ctypes.byref(self.out), self.name.encode(), 2)
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
        self.fd = fds[0].fd                         # v0.11: messages() reads the kernel's timestamp frames from it
        self.parser = monitor.Parser()
        self.buf = ctypes.create_string_buffer(4096)
        self.token = 1000
        # v0.3: kernel receive timestamps (CLOCK_MONOTONIC) on the device's USB output, as the DIN
        # monitor has, so a measurement on USB out adds no Python scheduling jitter.
        self.kernel_time = False
        params = ctypes.c_void_p()
        if timestamps and hasattr(LIB, "snd_rawmidi_tread") and LIB.snd_rawmidi_params_malloc(ctypes.byref(params)) == 0:
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
        """Write bytes now; returns now_ns() (the steady clock, v0.25) taken just before the write call."""
        t = now_ns()
        n = LIB.snd_rawmidi_write(self.out, bytes(data), len(data))
        if n != len(data):
            raise OSError("snd_rawmidi_write: %s" % (err(n) if n < 0 else "short"))
        LIB.snd_rawmidi_drain(self.out) if len(data) > 64 else None
        return t

    def messages(self, timeout_ms):
        if not self.poll.poll(timeout_ms):
            return []
        if self.kernel_time:
            # v0.11: the kernel's timestamp frames (struct snd_rawmidi_framing_tstamp, 32 bytes: type, length, 2 reserved,
            # tv_nsec u32, tv_sec u64, 16 data bytes) are read straight from the port's file descriptor, every frame that
            # is there. Until v0.10 this called snd_rawmidi_tread once per wake-up: that returns ONE frame (at most 16
            # bytes) and alsa-lib keeps the other frames it read in its own buffer, where poll() does not see them, so
            # the rest of a reply (a SysEx is 3 or more frames) stayed in the library until more MIDI arrived. With a
            # MIDI clock coming in (CLOCK = INT) that was within 21 ms; with no clock the reply "never came" (BUILD
            # 36.5: this, not the device, was the "no replies with CLOCK = MIDI" of Task 16).
            out = []
            while True:
                raw = os.read(self.fd, 32 * 128)
                for i in range(0, len(raw) - 31, 32):
                    _, length, nsec, sec = struct.unpack_from("<BB2xIQ", raw, i)
                    if 0 < length <= 16:
                        out.extend(self.parser.feed(steady(sec * 1000000000 + nsec or time.monotonic_ns()), raw[i + 16:i + 16 + length]))
                if not self.poll.poll(0):
                    break
            return out
        n = LIB.snd_rawmidi_read(self.inp, self.buf, 4096); t = now_ns()
        if n <= 0:
            return []
        return self.parser.feed(t, self.buf.raw[:n])

    def query(self, command, payload=b"", timeout=1.5, attempts=3, empty_ok=False):
        seen = []      # v0.26: what did come in while a reply was awaited (for the error below)
        # v0.27: what is waiting in the port is read BEFORE the request goes out. A tool that slept while the device played
        # (the screen tour's 2.4 s waits) left the kernel's input buffer full of clock bytes; the reply, about a
        # millisecond after the request, found no room and was dropped by the kernel: "no reply to command 29 ...
        # meanwhile the port brought: 195 x clock" (tabby-v1.2.1-rc1; the one of tabby-v1.2-rc5 was this too).
        for t, m in self.messages(0):
            if m[0] != 0xF0:
                self.other.append((t, m))
        for _ in range(attempts):
            self.token = (self.token + 1) & 16383
            token = self.token
            self.send(frame(command, token, payload))
            end = time.monotonic() + timeout
            while time.monotonic() < end:
                # v0.7: the whole batch is gone through before returning: what one read brings
                # after the reply (clock bytes, notes) used to be dropped with the return.
                found = None
                for t, m in self.messages(50):
                    if m[0] != 0xF0:
                        self.other.append((t, m)); seen.append(m[0]); continue
                    r = parse(m)
                    seen.append(("reply to %d token %d" % (r["command"] & 63, r["token"])) if r else "a SysEx that is not ours")
                    if found is None and r and r["command"] == (command | 64) and r["token"] == token:
                        found = r
                if found is not None:
                    code = found["data"][0]
                    if code and not (empty_ok and code == 1):
                        raise DeviceError(code)
                    return found["data"][1:]
        # v0.26: an unanswered command says what the port did bring meanwhile: clock bytes mean the device runs and the
        # cable is good (the request or the reply was lost); nothing at all means the port or the device was silent.
        kinds = {}
        for x in seen:
            k = x if isinstance(x, str) else ("clock" if x == 0xF8 else "status %02X" % x)
            kinds[k] = kinds.get(k, 0) + 1
        raise TimeoutError("no reply to command %d (token %d, %d tries of %.1f s); meanwhile the port brought: %s"
                           % (command, self.token, attempts, timeout, ", ".join("%d x %s" % (n, k) for k, n in sorted(kinds.items())) or "nothing"))

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
                "line1": "USER %s %s" % (size if size else "0 BAD", ["SCAN", "READY", "OLD DATA", "ERASING", "ERROR", "COMPACT"][s[4]] if s[4] < 6 else "?"),   # as tabby-v1.1 draws them
                "line2": "FREE %dK RECL %dK" % (free // 1024, recl // 1024)}

    def play(self, song):
        """Start a song. v0.8: command 29 (tabby-v04.2 and later), else command 26 (diag builds)."""
        try:
            self.query(29, bytes([2, song]), attempts=1)
        except DeviceError as e:
            if e.code != 71 and e.code != 70:
                raise
            self.query(26, bytes([1, song]))

    def stop(self):
        try:
            self.query(29, bytes([3]), attempts=1)
        except DeviceError as e:
            if e.code != 71 and e.code != 70:
                raise
            self.query(26, bytes([0]))

    # ---- remote control, command 29 (v0.8) -----------------------------------------------------
    PAGES = {0: "OVERVIEW", 1: "STEPS", 2: "FM_EDIT", 3: "FM_ENV", 4: "FM_LFO", 5: "TONE_EDIT", 6: "MIX", 7: "BLE",
             8: "PROJECT", 9: "NAME", 10: "EFFECTS", 11: "SOURCE", 12: "ACTIONS", 13: "STEP_EDIT", 14: "RHYTHM",
             15: "FM_QUICK", 16: "PRESET_BROWSER", 17: "ARP_EDIT", 18: "STARTUP", 19: "SONG", 20: "CLIPS", 21: "STEP", 22: "SETTING"}
    # Physical button ids (app/smk37_controls.c button_map) by the firmware's names. SAVE (physical 3) is
    # refused by the device on purpose. HOME has two physical ids (2 and 12); 12 is HOME / SRC.
    PANEL = {"SHIFT": 0, "FADER_BANK": 1, "HOME": 2, "OCT_DOWN": 4, "OCT_UP": 5, "ARP": 6, "PAD_STEP": 7, "SCL": 8,
             "ENV": 9, "GLO": 10, "BLUETOOTH": 11, "SRC": 12, "EDIT": 13, "FX": 14, "SEQ": 15, "PLAY": 16, "REC": 17}

    def remote(self, *ops):
        d = self.query(29, bytes(ops), attempts=1)
        if len(d) < 12:
            raise DeviceError(-1)
        return {"page": d[1], "page_name": self.PAGES.get(d[1], str(d[1])), "song_state": d[2], "loaded": d[3],
                "row": d[4], "queued": d[5], "a2": d[6], "shift": d[7], "transport": d[8], "bar": d[9] | d[10] << 8,
                "action": d[11], "follow": d[12] if len(d) > 12 else 0,
                "clock": d[13] if len(d) > 13 else None}

    def launch(self, track, row):
        """v0.12: remote op 9 (tabby-v04.6): launch row `row`'s pattern on track `track` (both 0-based) at the next master cycle."""
        return self.remote(9, track, row)

    def stop_track(self, track):
        return self.remote(10, track)

    def attach(self, track=255):
        return self.remote(11, track)

    def clips_state(self):
        """v0.13: remote op 12 (tabby-v04.7): the CLIPS / SCENES page: page, selected track, clip bank, scene bank, the
        track's selected clip place (255 none), and per pad its state code (0 empty, 1 stopped, 2 playing, 3 queued,
        4 stop queued; + 8 selected, + 16 track muted) and its LED colour (0xRRGGBB, 5 bits a channel)."""
        d = self.query(29, bytes([12]), attempts=1)
        if len(d) < 55 or d[0] != 2:
            raise DeviceError(-1)
        d = d[1:]
        pads = []
        for i in range(16):
            v = d[7 + 3 * i] | d[8 + 3 * i] << 7
            pads.append({"code": d[6 + 3 * i], "rgb": ((v >> 10) & 31) << 17 | ((v >> 5) & 31) << 9 | (v & 31) << 1})
        return {"page": d[0], "page_name": self.PAGES.get(d[0], str(d[0])), "track": d[1], "bank": d[2], "scene_bank": d[3],
                "selected": d[4], "notice": d[5], "pads": pads}

    def clip_launch(self, track, place):
        """v0.13: remote op 13: launch the track's clip in `place` (both 0-based), as its pad does."""
        return self.remote(13, track, place)

    def unqueue(self, track):
        return self.remote(14, track)

    def pad(self, pad, hold=0.05, velocity=100):
        """v0.13: press pad `pad` (0-based) for `hold` seconds through the remote panel keys."""
        self.key(3, pad, velocity)
        time.sleep(hold)
        return self.key(3, pad, 0)

    def shift_pad(self, pad):
        self.key(0, self.PANEL["SHIFT"], 1); time.sleep(0.05)
        self.pad(pad); time.sleep(0.05)
        return self.key(0, self.PANEL["SHIFT"], 0)

    def steps_state(self):
        """v0.14: remote op 15 (tabby-v04.8): the STEP page: page, track, clip place, bar, selected step (255 none),
        unsaved, undo / redo levels, events, the current note, steps, the step that plays (255 none), pad mode, the 16
        pad states (bit 0 notes, 1 the current note, 2 selected, 3 playing, 4 past the end) and up to four notes of
        the selected step."""
        d = self.query(29, bytes([15]), attempts=1)
        if len(d) < 56 or d[0] != 3:
            raise DeviceError(-1)
        d = d[1:]
        notes = [{"pitch": d[31 + 6 * k], "velocity": d[32 + 6 * k], "start": (d[33 + 6 * k] | d[34 + 6 * k] << 8) - 240,
                  "length": d[35 + 6 * k] | d[36 + 6 * k] << 8} for k in range(min(d[30], 4))]
        return {"page": d[0], "page_name": self.PAGES.get(d[0], str(d[0])), "track": d[1], "place": d[2], "bar": d[3], "selected": d[4],
                "dirty": d[5], "undo": d[6], "redo": d[7], "events": d[8] | d[9] << 8, "note": d[10], "steps": d[11], "play_step": d[12],
                "toggle": d[13], "pads": list(d[14:30]), "count": d[30], "notes": notes,
                "recording": d[55] if len(d) > 55 else 0, "quantize": d[56] if len(d) > 56 else 1}   # v0.15 (tabby-v04.9)

    def edit_save(self):
        """v0.14: remote op 16 {16, 1}: save the edited clip (refused with code 76 while a transport runs)."""
        return self.remote(16, 1)

    def edit_discard(self):
        return self.remote(16, 2)

    def edit_open(self, track, place):
        """v0.14: remote op 16 {16, 3, track, place}: open the STEP page on a clip (both 0-based)."""
        return self.remote(16, 3, track, place)

    def setup_state(self):
        """v0.16: remote op 17 (tabby-v04.10): the CLIP SETTING page: page, row, the open clip's track / place / steps, the
        COPY target, the song's count-in / click / click output / channel / note, unsaved, rows, the clip's chain and
        program, the number of scenes, the scene hold, the count-in's beats left."""
        d = self.query(29, bytes([17]), attempts=1)
        if len(d) < 24 or d[0] != 4:
            raise DeviceError(-1)
        d = d[1:]
        return {"page": d[0], "page_name": self.PAGES.get(d[0], str(d[0])), "row": d[1], "track": d[2], "place": d[3], "steps": d[4],
                "to": d[5], "count_in": d[6], "click": d[7], "click_out": d[8], "click_ch": d[9], "click_note": d[10], "unsaved": d[11],
                "rows": d[12], "next": d[13], "after": d[14] | d[15] << 8, "times": d[16], "program": d[17], "bank_msb": d[18],
                "bank_lsb": d[19], "scenes": d[20], "hold": d[21], "counting": d[22],
                # v0.17 (tabby-v04.12): the scene the SCENES page's knobs work on
                "scene": d[23] if len(d) > 27 else None, "scene_times": d[24] if len(d) > 27 else None,
                "scene_flags": d[25] if len(d) > 27 else None, "scene_steps": d[26] if len(d) > 27 else None, "cycle": d[27] if len(d) > 27 else None,
                # v0.18 (tabby-v04.14): the click level (0 LOW, 1 MID, 2 HIGH) and the controller numbers of K1 to K4
                "click_level": d[28] if len(d) > 32 else None, "knobs": list(d[29:33]) if len(d) > 32 else None,
                # v0.19 (tabby-v04.15): the open clip's transpose in semitones
                "transpose": (d[33] - 256 if d[33] > 127 else d[33]) if len(d) > 33 else None,
                # v0.20 (tabby-v04.17): the open clip's shuffle byte (0 the song's, 1..51 its own 0..50 percent) and playback quantize (0..3)
                "shuffle": d[34] if len(d) > 35 else None, "quantize": d[35] if len(d) > 35 else None,
                # v0.21 (tabby-v04.19): the open clip's scale (0 a 16th, 1 an 8th, 2 a 32nd, 3 a 16th triplet, 4 an 8th triplet)
                "scale": d[36] & 15 if len(d) > 36 else None,
                # v0.22 (tabby-v04.20): the open clip's direction (0 forwards, 1 backwards, 2 forwards then backwards); None before tabby-v04.20
                "direction": d[36] >> 4 if len(d) > 37 else None,
                # v0.24 (tabby-v1.0.2): the song's event lead (0 OFF, 1 a 32nd, 2 a 16th, 3 an 8th, 4 a quarter); the song's page has eleven lines then, ten before
                "event_lead": d[38] if len(d) > 38 else None, "song_lines": 11 if len(d) > 38 else 10}

    def setup_do(self):
        """v0.16: remote op 16 {16, 4}: what the 4th left button does on the CLIP SETTING page (COPY on its row, else save)."""
        return self.remote(16, 4)

    def flash_part(self):
        """v0.16: command 25 request 11 (tabby-v04.9.3): the flash chip's JEDEC ID and size as the SDK read them at boot."""
        d = self.query(25, bytes([11]))
        jedec, capacity, user, source = struct.unpack_from("<IIII", bytes(d), 0)
        return {"jedec": jedec, "capacity": capacity, "user": user, "source": source}

    def play_key(self, key, hold=0.05, velocity=100):
        """v0.14: press keyboard key `key` (0 to 36; key 12 is note 60 at octave 0) through the remote panel keys."""
        self.key(1, key, velocity)
        time.sleep(hold)
        return self.key(1, key, 0)

    def knob(self, index, detents):
        """v0.14: turn a knob by remote: index 0 to 3 = K1 to K4, 4 = K5, 5 = K6, 6 = K7."""
        return self.key(4, index, detents)

    def show_page(self, name):
        """v0.10: bring the device to a page by remote panel keys: "overview", "steps" (SYNC / MIDI, SEQ) or
        "actions" (SEQ + EDIT); v0.23: "clips" (BT), "scenes" (BT, SCALE), "mixer" (GLOBE). Returns the status; raises if
        the page did not come."""
        want = {"overview": "OVERVIEW", "steps": "STEPS", "actions": "ACTIONS", "clips": "CLIPS", "scenes": "SONG", "mixer": "MIX"}[name]
        for _ in range(4):                                  # HOME from the overview opens the project list: press until it is the overview
            s = self.remote_status()
            if s["page_name"] == "OVERVIEW":
                break
            self.press("HOME"); time.sleep(0.3)
        if name == "steps":
            self.press("SEQ"); time.sleep(0.4)
        elif name == "actions":
            self.hold(["SEQ", "EDIT"], 0.15); time.sleep(0.4)
        elif name in ("clips", "scenes"):
            self.press("BLUETOOTH"); time.sleep(0.4)
            if name == "scenes":
                self.press("SCL"); time.sleep(0.4)
        elif name == "mixer":
            self.press("GLO"); time.sleep(0.4)
        s = self.remote_status()
        if s["page_name"] != want:
            raise RuntimeError("page %s wanted, the device shows %s" % (want, s["page_name"]))
        return s

    def remote_status(self):
        return self.remote(0)

    def select_song(self, song):
        return self.remote(1, song)

    def play_song(self, song=None):
        return self.remote(2) if song is None else self.remote(2, song)

    def stop_song(self):
        return self.remote(3)

    def jump(self, row):
        return self.remote(4, row)

    def set_a2(self, on):
        return self.remote(5, 1 if on else 0)

    def key(self, kind, ident, value):
        """kind 0 button (physical id), 1 key, 3 pad, 4 encoder (signed detents); value 0 releases."""
        return self.remote(6, kind, ident, value & 255)

    def press(self, name, hold=0.05):
        """Press, hold for `hold` seconds, release a named button (PANEL) or a physical id."""
        ident = self.PANEL[name] if isinstance(name, str) else name
        self.key(0, ident, 1)
        time.sleep(hold)
        return self.key(0, ident, 0)

    def hold(self, names, seconds=0.1):
        """Press several buttons in order, hold, release them in reverse order (SEQ + EDIT, SHIFT + SRC...)."""
        ids = [self.PANEL[n] if isinstance(n, str) else n for n in names]
        for i in ids:
            self.key(0, i, 1)
        time.sleep(seconds)
        r = None
        for i in reversed(ids):
            r = self.key(0, i, 0)
        return r

    def release_all(self):
        return self.remote(7)

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

    def a2(self, request=7):
        """v0.6: command 25 request 7 (read), 8 (A2 off) or 9 (A2 on): the A2 page as a dict, or None
        when the firmware has no A2 (the normal build refuses the request)."""
        try:
            p = self.query(25, bytes([request]), attempts=1)
        except (DeviceError, TimeoutError):
            return None
        if len(p) not in (48, 52):            # v0.9: 52 bytes since tabby-v04.3 (the last u32: blocks skipped during flash writes)
            return None
        v = struct.unpack("<12I", p[:48])
        us = lambda t: t / 24.0
        return {"on": v[0], "blocks": v[1], "calls": v[2], "mean_us": us(v[3]), "max_us": us(v[4]), "retries": v[5],
                "bins": list(v[6:12]), "calls_per_second": v[2] * 44118.0 / (v[1] * 128.0) if v[1] else 0.0,
                "flash_skipped": struct.unpack_from("<I", p, 48)[0] if len(p) == 52 else None}

    def fg(self):
        """v0.10: command 25 request 10 (tabby-v04.4): the F + G page, or None when the firmware has none."""
        try:
            p = self.query(25, bytes([10]), attempts=1)
        except (DeviceError, TimeoutError):
            return None
        if len(p) != 56:
            return None
        v = struct.unpack("<14I", p)
        return {"running": v[0], "timer_ticks": v[1], "sent": v[2], "late_max_ms": v[3] / 24000.0,
                "late_bins": list(v[4:10]), "block_ticks": v[10], "period_ticks": v[11], "live": v[12]}

    # v0.29 (tabby-v1.4): the input log, command 29 op 20 (app/smk37_controls.c ct_input_read)
    INPUT_KINDS = {0: "button", 1: "key", 3: "pad", 4: "encoder"}
    INPUT_SOURCES = {0: "panel", 1: "remote", 2: "app"}

    def _input(self, what, index=None):
        d = self.query(29, bytes([20, what] + ([index & 255, (index >> 8) & 255, (index >> 16) & 255] if index is not None else [])), attempts=1)
        if not d or d[0] != 7:
            raise DeviceError(-1)
        return d[1:]

    def input_counts(self):
        """Events of pads, buttons, keys and encoders since the log's reset: all, those from the panel itself, the device's time (ms)."""
        a, b, c = struct.unpack("<3I", self._input(0)[:12])
        return {"events": a, "panel": b, "now_ms": c}

    def input_reset(self):
        self._input(3)

    def input_events(self, since=0):
        """Every event from number `since` on (the log keeps the last 128): number, time, kind, id, value, source, and for a pad from the
        panel what its sensor read (raw: the peak; gate: the resting level)."""
        out = []
        total = self.input_counts()["events"]
        while since < total:
            d = self._input(1, since)
            first = struct.unpack("<I", d[:4])[0]
            n = (len(d) - 4) // 14
            if not n:
                break
            for k in range(n):
                at, kind, ident, source, _, value, raw, gate = struct.unpack("<I4B3H", d[4 + 14 * k:18 + 14 * k])
                out.append({"n": first + k, "at_ms": at, "kind": self.INPUT_KINDS.get(kind, str(kind)), "id": ident, "value": value if value < 32768 else value - 65536,
                            "source": self.INPUT_SOURCES.get(source, str(source)), "raw": raw, "gate": gate})
            since = first + n
        return out

    def input_analog(self):
        """The analog controls since the reset: how many messages, the lowest, highest and last value. Faders 1 to 4, the two wheels,
        the pedal, the pressure of pads 1 to 16."""
        names = ["fader 1", "fader 2", "fader 3", "fader 4", "wheel 1 (pitch)", "wheel 2 (mod)", "pedal"] + ["pad %d pressure" % (i + 1) for i in range(16)]
        out = {}
        for start in (0, 6, 12, 18):
            d = self._input(2, start)
            for k in range(len(d) // 10):
                count, lo, hi, last = struct.unpack("<I3H", d[10 * k:10 * k + 10])
                out[names[start + k]] = {"count": count, "low": lo, "high": hi, "last": last}
        return out

    def pad_levels(self):
        """Per pad: the highest sensor reading above its resting level that did not become a press since the last call (a near miss),
        and the resting level itself."""
        d = self._input(4)
        v = struct.unpack("<32H", d[:64])
        return {"near": list(v[:16]), "gate": list(v[16:])}

    def worst(self, boot=False):
        """v0.28 (tabby-v1.3): command 25 request 12 (since the counters' reset) or 13 (since power-on): the latest a
        timed event left after its due time, once for "the transport stopped" and once for "running", each with what
        the device was doing then. None when the firmware has no such record."""
        try:
            p = self.query(25, bytes([13 if boot else 12]), attempts=1)
        except (DeviceError, TimeoutError):
            return None
        if len(p) != 60:
            return None
        out = {}
        for i, name in enumerate(("stopped", "running")):
            late, at, count, flags, page, cmd, op, cmd_ms, kind, ident, panel_ms, flash_ms, status, lane, transport_ms, gap = struct.unpack("<3I4BH2B2H2B2H", p[30 * i:30 * i + 30])
            age = lambda v: None if v == 0xffff else v
            out[name] = {"late_ms": round(late / 24000.0, 2), "at_ms": at, "at_4ms_or_more": count, "page": self.PAGES.get(page, str(page)),
                         "flash_within_250ms": bool(flags & 2), "transfer_within_250ms": bool(flags & 4), "flash_running": bool(flags & 8),
                         "last_remote": [cmd, op], "remote_ms_before": age(cmd_ms),
                         "last_panel": [{0: "none", 1: "button", 2: "pad", 3: "key", 4: "knob"}.get(kind, str(kind)), ident], "panel_ms_before": age(panel_ms),
                         "flash_ms_before": age(flash_ms), "transport_change_ms_before": age(transport_ms), "event": "%02X" % status, "lane": lane, "pass_gap_ms": round(gap / 10.0, 1)}
        return out

    @staticmethod
    def worst_text(w):
        """One line for a report: what the record says, in words."""
        if not w:
            return "no record (firmware before tabby-v1.3)"
        parts = []
        for name in ("running", "stopped"):
            r = w[name]
            if not r["late_ms"]:
                parts.append("%s: none" % name); continue
            ago = lambda v: "never" if v is None else "%d ms before" % v
            parts.append("%s: %.2f ms (%d at 4 ms or more) on %s, event %s, the pass before %s ms earlier; last remote command %d/%d %s, last panel action %s %d %s, flash %s%s, start/stop %s" % (
                name, r["late_ms"], r["at_4ms_or_more"], r["page"], r["event"], r.get("pass_gap_ms"), r["last_remote"][0], r["last_remote"][1], ago(r["remote_ms_before"]),
                r["last_panel"][0], r["last_panel"][1], ago(r["panel_ms_before"]), ago(r["flash_ms_before"]),
                " (a transfer within 250 ms)" if r["transfer_within_250ms"] else "", ago(r["transport_change_ms_before"])))
        return "; ".join(parts)

    def health(self):
        """v0.6: commands 17, 18, 19 (read only): the audio counters that show a dropout or CPU GUARD."""
        e = self.query(17); r = self.query(18); d = self.query(19)
        u = lambda p, i: struct.unpack_from("<I", p, i)[0]
        ms = lambda t: t / 24000.0
        return {"underruns": u(e, 8), "midi_dropped": u(e, 12),
                "render_ms": ms(u(r, 0)), "render_peak_ms": ms(u(r, 4)), "adapted": u(r, 12), "overloads": u(r, 16),
                "voice_capacity": u(r, 20), "deadline_ms": ms(u(r, 28)),
                "dma_blocks": u(d, 0), "short_intervals": u(d, 4), "dma_overruns": u(d, 8), "irq_peak_ms": ms(u(d, 12))}

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
        if profile:
            try:                              # v0.5: page 6 (Task 13, the pass budget), tabby-v04.1 and later
                p6 = self.query(25, bytes([6]), attempts=1)
                if len(p6) == 56:
                    profile["budget"] = {"passes": u(p6, 0), "busy_mean_ms": ms(u(p6, 4)), "busy_max_ms": ms(u(p6, 8)),
                                         "busy_over_10ms": u(p6, 12), "lost_ticks": u(p6, 16),
                                         "deferred": {"compose": u(p6, 20), "band": u(p6, 24), "transfer": u(p6, 28)},
                                         "busy_bins": [u(p6, 32 + 4 * i) for i in range(6)]}
            except (DeviceError, TimeoutError):
                pass
        return {"seconds": secs, "screen": screen, "profile": profile, "loop": {"count": u(a, 8), "max_ms": ms(u(a, 12)), "mean_ms": ms(u(a, 16))},
                "flash": {"erases": u(a, 20), "erase_max_ms": ms(u(a, 24)), "writes": u(a, 28), "write_max_ms": ms(u(a, 32)), "write_max_bytes": u(a, 36)},
                "keys": {"count": u(a, 40), "max_ms": ms(u(a, 44)), "bins": [a[48 + 2 * i] | a[49 + 2 * i] << 8 for i in range(8)]},
                "scan": {"count": u(b, 0), "per_second": u(b, 0) / secs if secs else 0, "gap_max_ms": ms(u(b, 4)),
                         "isr_peak_ms": ms(u(b, 8)), "adc_peak_ms": ms(u(b, 12))}}


A2_BINS = ["<5", "<10", "<20", "<50", "<100", ">=100"]   # microseconds, app/midi_router.c a2.bins


def a2_lines(a):
    """v0.6: the A2 page as text."""
    if a is None:
        return ["A2: not in this build (command 25 request 7 refused)"]
    return ["A2 (pass request from the audio interrupt): %s; %d calls in %d audio blocks (%.1f calls per second), "
            "mean %.1f us, longest %.1f us, %d retries" % ("ON" if a["on"] else "off", a["calls"], a["blocks"], a["calls_per_second"],
                                                             a["mean_us"], a["max_us"], a["retries"]),
            "  call cost histogram (us): " + ", ".join("%s %d" % (n, v) for n, v in zip(A2_BINS, a["bins"]))]


def health_lines(h, before=None):
    """v0.6: the audio counters; with `before`, the rise since then."""
    d = lambda k: (" (+%d)" % (h[k] - before[k])) if before else ""
    return ["audio: engine underruns %d%s, MIDI in dropped %d%s; DMA overruns %d%s, short intervals %d%s, IRQ peak %.3f ms"
            % (h["underruns"], d("underruns"), h["midi_dropped"], d("midi_dropped"), h["dma_overruns"], d("dma_overruns"),
               h["short_intervals"], d("short_intervals"), h["irq_peak_ms"]),
            "render: last %.3f ms, peak %.3f ms, deadline %.3f ms; CPU GUARD adapted %d%s, overloads %d%s"
            % (h["render_ms"], h["render_peak_ms"], h["deadline_ms"], h["adapted"], d("adapted"), h["overloads"], d("overloads"))]


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
    b = p.get("budget")
    if b:                                     # v0.5: page 6
        out.append("pass busy (pass start to the end of the screen hook): mean %s ms, max %s ms; %d passes busy over 10 ms; %d lost ticks (periods over 15 ms)"
                   % (f(b["busy_mean_ms"]), f(b["busy_max_ms"]), b["busy_over_10ms"], b["lost_ticks"]))
        out.append("  busy histogram <2 %d, <4 %d, <6 %d, <8 %d, <10 %d, >=10 %d (ms); deferred: compose %d, band %d, transfer %d"
                   % (tuple(b["busy_bins"]) + (b["deferred"]["compose"], b["deferred"]["band"], b["deferred"]["transfer"])))
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
                self.messages.extend(self.parser.feed(steady(t), chunk))   # v0.23

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
