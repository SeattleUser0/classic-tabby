#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-11b.py — the timed measurements of the unattended Task 11 hardware run

Purpose
    Runs the parts of docs/BUILD.md 24.6 step 3 that need exact timing, with the browser closed
    (tabby_link.Link holds the SMK-37's MIDI port). Each subcommand writes its CSV / WAV / JSON
    files and a text report into --out (the run directory) and prints the report.

      runA        counters at rest: reset, wait --seconds (60), read            (L.1, L.5)
      runB        counters under router load: reset, ~100 notes with mixed velocities over
                  --seconds (120) into the USB port on channel 1, read; the audio of the
                  internal engine is recorded to find the AUDIO4c channels         (L.1, L.5)
      l6          external clock follow on the stock sequencer: 120 BPM clock from this
                  machine, Start, clock loss (3 s without clock, no Stop), resume, Stop, a
                  restart; the DIN monitor runs throughout; lock time, band, behaviour  (L.6)
      audio-probe short capture of all 8 AUDIO4c inputs with a note sent, RMS per channel

    The clock is sent with a busy-wait to each pulse's due time (20.833 ms apart at 120 BPM);
    every sent byte's time (time.monotonic_ns() just before the write) is logged, so the analysis
    compares the SMK-37's DIN output with the master on one clock (the monitor's timestamps are
    the kernel's, also CLOCK_MONOTONIC).

Rerun: python3 tools/linux/hw/run-11b.py <subcommand> --out DIR   (docs/BUILD.md 25.2)

Version: 0.6

Revision log
    v0.6  2026-11-07  l3 renames the project before each save so it writes; gaps: envelope detector.
    v0.5  2026-11-07  l3 (saves with a held note and during the clocked pattern) and gaps (audio
                      dropouts and clicks).
    v0.4  2026-11-07  onsets: a rise detector (the FM6 tails overlap).
    v0.3  2026-11-07  record (audio as its own process), clocked (a short clocked stock-sequencer run
                      with the USB output logged), fm6-delay (FM6 audio onsets against the note-ons).
    v0.2  2026-11-07  l6 --usb: the device's USB output as the measured stream (nothing reached
                      the AUDIO4c DIN input in this run); --tag for file names.
    v0.1  2026-11-07  Task 11B: first version (runA, runB, l6, audio-probe).
"""
import argparse
import json
import math
import os
import random
import statistics
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

M = T.monitor


USB_IN = None   # v0.2: when set (a Link), the device's USB output is read while waiting


def wait_until(ns):
    """Sleep (or, with USB_IN, read the device's USB output) to 1 ms before ns, then busy-wait:
    sub-0.1 ms send timing from Python."""
    while True:
        d = ns - time.monotonic_ns()
        if d <= 0:
            return
        if d > 1_500_000:
            if USB_IN is not None:
                for t, m in USB_IN.messages(0):
                    USB_IN.other.append((t, m))
            else:
                time.sleep((d - 1_000_000) / 1e9)


def save(out, name, text):
    with open(os.path.join(out, name), "w") as f:
        f.write(text)


def run_a(a):
    l = T.Link()
    l.diag(1)
    time.sleep(a.seconds)
    d = l.diag(0); l.close()
    text = T.diag_text(d)
    save(a.out, "runA-counters.txt", text + "\n")
    save(a.out, "runA-counters.json", json.dumps(d, indent=1))
    print(text)


def run_b(a):
    l = T.Link()
    cap = T.Capture(keep=tuple(int(c) for c in a.keep.split(",")))
    cap.start()
    rng = random.Random(7)
    l.diag(1)
    start = time.monotonic_ns() + 500_000_000
    sent = []
    n = 100
    for i in range(n):
        due = start + int(i * a.seconds * 1e9 / n) + rng.randint(-200_000_000, 200_000_000)
        wait_until(due)
        note, vel = 48 + rng.randint(0, 24), rng.choice([20, 45, 70, 95, 120, 127])
        t = l.send(bytes([0x90, note, vel])); sent.append((t, "note_on", 1, note, vel, "sent"))
        wait_until(t + rng.randint(60, 300) * 1_000_000)
        t = l.send(bytes([0x80, note, 0])); sent.append((t, "note_off", 1, note, 0, "sent"))
    time.sleep(1.0)
    d = l.diag(0); l.close()
    chans = cap.finish(); fit = cap.time_fit()
    text = T.diag_text(d)
    rms = {c: rms_of(b) for c, b in chans.items()}
    for c, b in chans.items():
        T.write_wav(os.path.join(a.out, "runB-audio-in%d.wav" % (c + 1)), b)
    save(a.out, "runB-counters.txt", text + "\n")
    save(a.out, "runB-counters.json", json.dumps({"counters": d, "notes_sent": n, "audio_rms": rms, "audio_fit": fit, "xruns": cap.xruns}, indent=1))
    M.write_csv(os.path.join(a.out, "runB-sent.csv"), [s[:5] + ("",) + s[5:] for s in sent], sent[0][0])
    print(text); print("audio RMS per kept input:", rms, "fit", fit)


def rms_of(b):
    import array
    x = array.array("h"); x.frombytes(bytes(b))
    if not x:
        return 0.0
    return math.sqrt(sum(v * v for v in x[::8]) / max(1, len(x[::8]))) / 32768.0


def audio_probe(a):
    l = T.Link()
    cap = T.Capture(keep=tuple(range(8))); cap.start()
    time.sleep(1.0)
    for note in (48, 55, 60, 67):
        l.send(bytes([0x90, note, 110])); time.sleep(0.6); l.send(bytes([0x80, note, 0])); time.sleep(0.2)
    time.sleep(1.0)
    l.close(); chans = cap.finish()
    rms = {c + 1: round(rms_of(b), 5) for c, b in chans.items()}
    save(a.out, "audio-probe.json", json.dumps({"rms_per_input": rms, "fit": cap.time_fit()}, indent=1))
    print("RMS per AUDIO4c input (1-8):", rms)


def l6(a):
    """Clock follow: pre-roll clock 2 s, Start, 60 s, 3 s without clock (no Stop), 30 s, Stop,
    2 s of clock, Start, 20 s, Stop."""
    global USB_IN
    l = T.Link()
    mon = None
    if a.usb:
        USB_IN = l          # v0.2: substitute for DIN: the SMK-37's own USB output, user-space stamped
    else:
        mon = T.Monitor(); mon.start()
    period = int(60e9 / (a.bpm * 24))
    sent = []
    t0 = time.monotonic_ns() + 300_000_000
    k = 0
    def pulses(count, marker=None):
        nonlocal k
        for _ in range(count):
            due = t0 + k * period
            wait_until(due)
            sent.append((l.send(b"\xf8"), "clock", "", "", "", "sent")); k += 1
    def msg(status, kind):
        due = t0 + k * period - period // 2
        wait_until(due)
        sent.append((l.send(bytes([status])), kind, "", "", "", "sent"))
    per_s = int(a.bpm * 24 / 60)
    pulses(2 * per_s)
    msg(0xFA, "start"); pulses(60 * per_s)
    k += 3 * per_s                                   # clock loss: 3 s with no clock and no Stop
    sent.append((t0 + (k - 3 * per_s) * period, "gap_begin", "", "", "", "marker"))
    pulses(30 * per_s)
    msg(0xFC, "stop"); pulses(2 * per_s)
    msg(0xFA, "start"); pulses(20 * per_s)
    msg(0xFC, "stop"); pulses(per_s)
    time.sleep(0.5)
    if a.usb:
        for t, m in l.messages(100):
            l.other.append((t, m))
        din = [r[:5] + ("usb",) for r in M.to_rows(l.other)]
    else:
        din = mon.finish()
    l.close()
    rows = sorted(din + sent, key=lambda r: r[0])
    M.write_csv(os.path.join(a.out, "l6-clock-follow%s.csv" % a.tag), [r[:5] + ("",) + (r[5] if len(r) > 5 else "",) for r in rows], rows[0][0])
    rep = analyze_l6(sent, din, period)
    save(a.out, "l6-report%s.json" % a.tag, json.dumps(rep, indent=1))
    print(json.dumps(rep, indent=1))


def analyze_l6(sent, din, period):
    clocks = [r[0] for r in sent if r[1] == "clock"]
    starts = [r[0] for r in sent if r[1] == "start"]
    stops = [r[0] for r in sent if r[1] == "stop"]
    gap = [r[0] for r in sent if r[1] == "gap_begin"][0]
    notes = [r[0] for r in din if r[1] == "note_on"]
    din_clock = sum(1 for r in din if r[1] == "clock")
    out = {"pulses_sent": len(clocks), "din_note_ons": len(notes), "din_clock_bytes": din_clock}
    seg = []
    for i, s in enumerate(starts):
        end = stops[i] if i < len(stops) else float("inf")
        after = [c for c in clocks if s < c < end]
        ns = [n for n in notes if s < n < end + 200e6]
        if not after or not ns:
            seg.append({"start": i, "notes": len(ns)}); continue
        first_pulse = after[0]
        # The 16th grid of the master: every 6th pulse from the first pulse after Start.
        grid = after[::6]
        lags = []
        for n in ns:
            j = max(0, min(len(grid) - 1, int(round((n - grid[0]) / (6 * period)))))
            while j > 0 and grid[j] > n:
                j -= 1
            lags.append((n - grid[j]) / 1e6)
        s_info = {"start": i, "notes": len(ns), "lock_ms": (ns[0] - first_pulse) / 1e6,
                  "lag_mean_ms": statistics.fmean(lags), "lag_min_ms": min(lags), "lag_max_ms": max(lags),
                  "band_ms": max(lags) - min(lags)}
        if i == 0:
            gap_end = gap + 3e9
            in_gap = [n for n in ns if gap + 30e6 < n < gap_end]
            resumed = [c for c in clocks if c > gap_end - 50e6]
            after_gap = [n for n in ns if n > gap_end - 50e6]
            pre = [l_ for n, l_ in zip(ns, lags) if n < gap]
            post = [l_ for n, l_ in zip(ns, lags) if n > gap_end + 1e9]
            s_info.update({"notes_during_gap": len(in_gap),
                           "first_note_after_resume_ms": (after_gap[0] - resumed[0]) / 1e6 if after_gap and resumed else None,
                           "band_before_gap_ms": (max(pre) - min(pre)) if pre else None,
                           "band_after_gap_ms": (max(post) - min(post)) if post else None,
                           "lag_mean_after_gap_ms": statistics.fmean(post) if post else None})
        seg.append(s_info)
    out["segments"] = seg
    after_stop = [n for n in notes if any(st + 300e6 < n < (starts[i + 1] if i + 1 < len(starts) else float("inf")) for i, st in enumerate(stops))]
    out["notes_after_stop"] = len(after_stop)
    return out


def record(a):
    """v0.3: audio only (run as its own process next to a timed run): --seconds of AUDIO4c inputs
    --keep, a WAV per input and the (monotonic ns, frame) fit in <tag>-audio.json."""
    cap = T.Capture(keep=tuple(int(c) for c in a.keep.split(","))); cap.start()
    time.sleep(a.seconds)
    chans = cap.finish(); fit = cap.time_fit()
    for c, b in chans.items():
        T.write_wav(os.path.join(a.out, "%s-audio-in%d.wav" % (a.tag, c + 1)), b)
    save(a.out, "%s-audio.json" % a.tag, json.dumps({"fit": fit, "xruns": cap.xruns, "frames": cap.frames}, indent=1))
    print(json.dumps(fit))


def onsets(path, fit, min_level=0.12, ratio=1.8, refractory_ms=60):
    """Note onsets in a mono WAV (v0.4: a rise detector; the FM6 tail of one 16th overlaps the
    next, so a threshold with a hold finds only the first note). A 1 ms envelope (max |x|) rising
    above `ratio` times its value 8 ms earlier and above min_level marks a note; the onset is the
    first sample after the earlier level where |x| exceeds 1.5 x that level. Returned in monotonic
    ns through the capture's frame -> time fit."""
    import array, wave
    w = wave.open(path); x = array.array("h"); x.frombytes(w.readframes(w.getnframes()))
    win = 48
    env = [max(abs(v) for v in x[i:i + win]) for i in range(0, len(x) - win, win)]
    out, last = [], -10**9
    for i in range(8, len(env)):
        if env[i] >= min_level * 32768 and env[i] > ratio * env[i - 8] and (i - last) * 1.0 >= refractory_ms:
            floor = max(env[i - 8], 1)
            j = (i - 8) * win
            while j < i * win + win and abs(x[j]) <= 1.5 * floor:
                j += 1
            out.append(fit["a"] + fit["b"] * j); last = i
    return out


def fm6_delay(a):
    """v0.3: pair every FM6 onset in <tag>-audio-in1.wav with the latest note-on of the measured
    MIDI stream before it (within one 16th); report the delay's mean, spread and percentiles."""
    fit = json.load(open(os.path.join(a.out, "%s-audio.json" % a.tag)))["fit"]
    on = onsets(os.path.join(a.out, "%s-audio-in1.wav" % a.tag), fit)
    rows = M.read_csv(a.csv)
    notes = sorted(r[0] for r in rows if r[1] == "note_on" and (r[5] if len(r) > 5 else "") in ("usb", "2 hw:2,0,0", ""))
    # v0.4: for every note-on, the first onset after it within 50 ms (the patch's beating gives a
    # second rise later in some notes; those are not note starts).
    import bisect
    d = []
    for n in notes:
        i = bisect.bisect_right(on, n)
        if i < len(on) and on[i] - n < 50e6:
            d.append((on[i] - n) / 1e6)
    rep = {"onsets": len(on), "notes": len(notes), "pairs": len(d)}
    if d:
        rep.update({"mean_ms": statistics.fmean(d), "min_ms": min(d), "max_ms": max(d), "spread_ms": max(d) - min(d),
                    "std_ms": statistics.pstdev(d), "p05_ms": M.percentile(d, 0.05), "p95_ms": M.percentile(d, 0.95)})
    save(a.out, "%s-fm6-delay.json" % a.tag, json.dumps(rep, indent=1))
    print(json.dumps(rep, indent=1))


def clocked(a):
    """v0.3: a short clocked run of the stock sequencer (2 s pre-roll, Start, --seconds, Stop) with
    the device's USB output read and logged: the MIDI side of the FM6 delay measurement."""
    global USB_IN
    l = T.Link(); USB_IN = l
    period = int(60e9 / (a.bpm * 24)); t0 = time.monotonic_ns() + 300_000_000; k = 0; sent = []
    def pulses(n):
        nonlocal k
        for _ in range(n):
            wait_until(t0 + k * period); sent.append((l.send(b"\xf8"), "clock", "", "", "", "sent")); k += 1
    per_s = int(a.bpm * 24 / 60)
    pulses(2 * per_s); wait_until(t0 + k * period - period // 2); sent.append((l.send(b"\xfa"), "start", "", "", "", "sent"))
    pulses(int(a.seconds * per_s)); wait_until(t0 + k * period - period // 2); sent.append((l.send(b"\xfc"), "stop", "", "", "", "sent")); pulses(per_s)
    for t, m in l.messages(100):
        l.other.append((t, m))
    usb = [r[:5] + ("usb",) for r in M.to_rows(l.other)]; l.close()
    rows = sorted(usb + sent, key=lambda r: r[0])
    M.write_csv(os.path.join(a.out, "%s-midi.csv" % a.tag), [r[:5] + ("", r[5]) for r in rows], rows[0][0])
    print("usb note-ons:", sum(1 for r in usb if r[1] == "note_on"))


def l3(a):
    """v0.5: L.3 without song storage. Part 1: reset the counters, hold an FM6 note (USB note-on
    on channel 1) and save the workspace to slot --slot (command 7, the panel's SAVE); part 2: the
    clocked stock pattern plays (FM6 and USB out) and the slot is saved again after 6 s. The send
    time of each save is logged; run `record` alongside for the audio."""
    global USB_IN
    l = T.Link(); USB_IN = l; log = []
    l.diag(1)
    t = l.send(bytes([0x90, 52, 100])); log.append((t, "hold_on", 1, 52, 100, "sent"))
    time.sleep(2.0)
    l.query(10, b"L3 HELD     ")          # v0.6: a changed name, so the save really writes (an unchanged project is not rewritten)
    t = time.monotonic_ns(); l.save_slot(a.slot); log.append((t, "save_begin", "", "", "", "marker")); log.append((time.monotonic_ns(), "save_end", "", "", "", "marker"))
    time.sleep(2.0)
    t = l.send(bytes([0x80, 52, 0])); log.append((t, "hold_off", 1, 52, 0, "sent"))
    d1 = l.diag(0)
    time.sleep(1.0)
    l.diag(1)
    period = int(60e9 / (a.bpm * 24)); t0 = time.monotonic_ns() + 300_000_000; k = 0
    def pulses(n):
        nonlocal k
        for _ in range(n):
            wait_until(t0 + k * period); log.append((l.send(b"\xf8"), "clock", "", "", "", "sent")); k += 1
    per_s = int(a.bpm * 24 / 60)
    pulses(per_s); wait_until(t0 + k * period - period // 2); log.append((l.send(b"\xfa"), "start", "", "", "", "sent"))
    pulses(6 * per_s)
    # The save blocks this script for its duration, so no clock is sent then: the gap in the device's
    # output measures the save only if the device keeps playing without clock; a clean comparison is
    # the counters and the audio (the FM6 also stops without clock). Report both.
    l.query(10, b"L3 PLAYING  ")          # v0.6: changed again before the save during play
    tb = time.monotonic_ns(); l.save_slot(a.slot); te = time.monotonic_ns()
    log.append((tb, "save_begin", "", "", "", "marker")); log.append((te, "save_end", "", "", "", "marker"))
    k = int((time.monotonic_ns() - t0) / period) + 1
    pulses(6 * per_s); wait_until(t0 + k * period - period // 2); log.append((l.send(b"\xfc"), "stop", "", "", "", "sent"))
    for t, m in l.messages(100):
        l.other.append((t, m))
    d2 = l.diag(0)
    usb = [r[:5] + ("usb",) for r in M.to_rows(l.other)]; l.close()
    rows = sorted(usb + log, key=lambda r: r[0])
    M.write_csv(os.path.join(a.out, "l3-midi.csv"), [r[:5] + ("", r[5]) for r in rows], rows[0][0])
    text = "part 1 (save with a held FM6 note):\n" + T.diag_text(d1) + "\n\npart 2 (save while the clocked pattern plays):\n" + T.diag_text(d2)
    save(a.out, "runC-counters.txt", text + "\n")
    save(a.out, "runC-counters.json", json.dumps({"part1": d1, "part2": d2, "save2_ms": (te - tb) / 1e6}, indent=1))
    print(text); print("save during play took %.1f ms at the host" % ((te - tb) / 1e6))


def gaps(a):
    """v0.5: dropouts in a WAV: runs where |x| stays below --level for at least 0.5 ms while the
    1 ms envelope before and after is above 4x that level; and clicks: sample steps above
    --click x full scale. Times in ms from the file start and in monotonic ns via the fit."""
    import array, wave
    fit = json.load(open(os.path.join(a.out, "%s-audio.json" % a.tag)))["fit"]
    w = wave.open(os.path.join(a.out, "%s-audio-in1.wav" % a.tag)); x = array.array("h"); x.frombytes(w.readframes(w.getnframes()))
    # v0.6: an envelope detector. 4 ms windows of max |x|; a dropout is a run of windows below 20 %
    # of the median of the 40 ms around it (a held note's level), at least 1 ms long. Zero
    # crossings of a low note no longer count.
    n = len(x); W = 192   # 4 ms windows: longer than one period of a low held note
    env = [max(abs(v) for v in x[i:i + W]) for i in range(0, n - W, W)]
    out = []; i = 20
    while i < len(env) - 20:
        ref = sorted(env[i - 20:i] + env[i + 1:i + 21])[20]
        if ref > 0.02 * 32768 and env[i] < 0.2 * ref:
            j = i
            while j < len(env) - 20 and env[j] < 0.2 * ref:
                j += 1
            out.append({"at_ms": i * W / 48.0, "length_ms": (j - i) * W / 48.0, "mono_ns": fit["a"] + fit["b"] * i * W, "level_before": round(ref / 32768, 3)})
            i = j
        i += 1
    clicks = [k / 48.0 for k in range(1, n) if abs(x[k] - x[k - 1]) > int(a.click * 32768)]
    rep = {"dropouts": out, "clicks_ms": clicks[:50], "clicks": len(clicks)}
    save(a.out, "%s-gaps.json" % a.tag, json.dumps(rep, indent=1))
    print(json.dumps({"dropouts": out[:20], "clicks": len(clicks), "first_clicks_ms": clicks[:10]}, indent=1))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("cmd", choices=["runA", "runB", "l6", "audio-probe", "record", "clocked", "fm6-delay", "l3", "gaps"])
    p.add_argument("--out", required=True)
    p.add_argument("--seconds", type=float, default=60)
    p.add_argument("--bpm", type=float, default=120)
    p.add_argument("--keep", default="0,1", help="AUDIO4c inputs to keep, 0-based")
    p.add_argument("--usb", action="store_true", help="l6: measure the SMK-37's USB output instead of DIN (v0.2)")
    p.add_argument("--tag", default="", help="suffix / prefix for the output file names (v0.2)")
    p.add_argument("--csv", help="fm6-delay: the MIDI CSV to pair with the audio (v0.3)")
    p.add_argument("--slot", type=int, default=15, help="l3: the project slot saved (v0.5)")
    p.add_argument("--click", type=float, default=0.25, help="gaps: sample step that counts as a click (v0.5)")
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    {"runA": run_a, "runB": run_b, "l6": l6, "audio-probe": audio_probe, "record": record, "clocked": clocked, "fm6-delay": fm6_delay, "l3": l3, "gaps": gaps}[a.cmd](a)


if __name__ == "__main__":
    main()
