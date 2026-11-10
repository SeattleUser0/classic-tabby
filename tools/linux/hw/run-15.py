#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-15.py — Task 15 Step 5: option A2 off against on, and the one-hour soak

Purpose
    The diag build tabby-v04.2-diagA2 carries option A2 (the control pass asked for from the audio
    interrupt, app/midi_router.c) behind a run-time switch that is off at boot. This script
    measures the same song with the switch off (option B alone) and on (B + A2):

      l2    set A2 (--a2 off | on, by command 25 request 8 / 9: a RAM switch, no flash write), open
            the DIN input ("H4MIDI-WC Port 1": the SMK-37's TRS out through the type A adapter;
            SPEC 15: not the AUDIO4c DIN) and the SMK-37's own USB MIDI port, both with kernel
            receive timestamps on one clock, wait for the first note-on (the user presses PLAY on
            the SONG page), reset the counters at that note, record --seconds, then read: the
            counters and the control pass profile (pages 1 to 6), the A2 page (calls, calls per
            second, mean and longest call inside the audio interrupt, retries), and the audio
            counters before and after (engine underruns, DMA overruns, CPU GUARD "adapted").
            With --audio 0,1 it also records those AUDIO4c inputs and counts silent gaps.
            Files: <tag>-din-usb.csv, <tag>-summary.txt / .json, <tag>-counters.txt,
            <tag>-audio-inN.wav.
      soak  the same capture for --seconds (3600), with the audio counters, the A2 page and the
            pass profile logged every --every seconds to <tag>-soak.log; stops by itself and says
            so at the first rise of underruns, DMA overruns or CPU GUARD (with --stop-on-rise).
      table print the off / on comparison from two l2 summaries (--off TAG --on TAG).

    Timing analysis (per port): each channel's note-ons are fitted to a straight line (least
    squares, note index against time); "band" is the largest minus the smallest error, "std" their
    standard deviation; "all lines" puts every channel on the first channel's grid. Stuck notes:
    note-ons without a note-off at the end of the capture, per port (stop the song before the
    capture ends, or let it end by itself, for this check to mean anything). USB against DIN: the
    two ports must carry the same note-ons per channel, in the same order.

    It sends commands 17, 18, 19, 23 and 25 only. It never writes flash and never installs.

Usage (the browser closed: Chrome holds the SMK-37's port while a workbench tab is connected)
    P=~/fm1-hw/hwvenv/bin/python3
    $P tools/linux/hw/run-15.py l2 --a2 off --seconds 125 --tag off-1x16 --out RUN/     then PLAY song 16
    $P tools/linux/hw/run-15.py l2 --a2 on  --seconds 125 --tag on-1x16  --out RUN/     then PLAY song 16
    $P tools/linux/hw/run-15.py l2 --a2 on  --seconds 125 --tag on-8x16 --audio 0,1 --out RUN/
    $P tools/linux/hw/run-15.py table --off off-1x16 --on on-1x16 --out RUN/
    $P tools/linux/hw/run-15.py soak --a2 on --seconds 3600 --tag soak --stop-on-rise --out RUN/

Version: 0.1

Revision log
    v0.1  2026-11-10  Task 15 Step 4: first version (written before the device was available; the
                      analysis was checked on synthetic rows, the device calls on the simulator's
                      page layouts only).
"""
import argparse
import json
import math
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

M = T.monitor


def save(out, name, text):
    with open(os.path.join(out, name), "w") as f:
        f.write(text)


def fit(times):
    """Least squares of time against note index; returns (band_ms, std_ms, slope_s, intercept_s).
    The index of each note is its place on the grid of the median gap, so a missing note leaves
    a hole instead of shifting the rest."""
    if len(times) < 3:
        return None
    gaps = sorted(b - a for a, b in zip(times, times[1:]))
    step = gaps[len(gaps) // 2] or 1e-9
    # Each note's index is the one before plus its own gap in steps (rounded): the median gap is
    # only exact to a fraction of the jitter, so counting from the first note would drift over
    # hundreds of notes; gap by gap it cannot, while the jitter stays under half a step.
    idx = [0]
    for g in (y - x for x, y in zip(times, times[1:])):
        idx.append(idx[-1] + max(0, round(g / step)))
    n = len(times); mx = sum(idx) / n; my = sum(times) / n
    sxx = sum((x - mx) ** 2 for x in idx) or 1e-9
    b = sum((x - mx) * (y - my) for x, y in zip(idx, times)) / sxx
    a = my - b * mx
    res = [y - (a + b * x) for x, y in zip(idx, times)]
    std = math.sqrt(sum(r * r for r in res) / n)
    return (max(res) - min(res)) * 1000.0, std * 1000.0, b, a


def analyze(events):
    """events: [(seconds, bytes)] of one port. Note-on timing per channel, all channels on the
    first channel's grid, and the notes still held at the end."""
    ons = {}; held = {}
    for t, m in events:
        if len(m) != 3:
            continue
        kind, ch = m[0] & 0xF0, m[0] & 15
        if kind == 0x90 and m[2]:
            ons.setdefault(ch, []).append(t); held[(ch, m[1])] = held.get((ch, m[1]), 0) + 1
        elif kind == 0x80 or (kind == 0x90 and not m[2]):
            if held.get((ch, m[1]), 0) > 0:
                held[(ch, m[1])] -= 1
    lines = {}
    for ch, ts in sorted(ons.items()):
        f = fit(ts)
        if f:
            lines[ch + 1] = {"notes": len(ts), "band_ms": f[0], "std_ms": f[1], "step_ms": f[2] * 1000.0}
    out = {"lines": lines, "notes": sum(len(v) for v in ons.values()),
           "stuck": sorted("ch%d note %d" % (c + 1, n) for (c, n), v in held.items() if v > 0)}
    if lines:
        bands = [v["band_ms"] for v in lines.values()]
        out["band_min_ms"], out["band_max_ms"] = min(bands), max(bands)
        out["std_max_ms"] = max(v["std_ms"] for v in lines.values())
        first = min(ons)
        f = fit(ons[first])
        if f and len(ons) > 1:
            res = []
            for ts in ons.values():
                res += [t - (f[3] + f[2] * round((t - f[3]) / f[2])) for t in ts]
            out["all_lines_band_ms"] = (max(res) - min(res)) * 1000.0
    return out


def same_notes(din, usb):
    """The note-ons of both ports, per channel, as sequences of note numbers: equal or not."""
    def seqs(ev):
        d = {}
        for _, m in ev:
            if len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2]:
                d.setdefault(m[0] & 15, []).append(m[1])
        return d
    a, b = seqs(din), seqs(usb)
    diff = []
    for ch in sorted(set(a) | set(b)):
        x, y = a.get(ch, []), b.get(ch, [])
        # The capture starts and ends on both ports at slightly different notes: compare the overlap.
        n = min(len(x), len(y))
        if abs(len(x) - len(y)) > 2 or (n and x[1:n - 1] != y[1:n - 1] and x[:n - 2] != y[1:n - 1] and x[1:n - 1] != y[:n - 2]):
            diff.append("ch%d: DIN %d notes, USB %d notes" % (ch + 1, len(x), len(y)))
    return diff


def silent_gaps(samples, rate=48000, floor=24, min_ms=2.0):
    """int16 mono bytes: runs of |sample| <= floor lasting min_ms or more that lie between louder
    audio (a dropout shows as such a run; a rest between notes does too, so read it against the
    A2-off recording of the same song). Returns (count, longest_ms)."""
    import array
    a = array.array("h"); a.frombytes(bytes(samples))
    need = int(rate * min_ms / 1000.0); run = 0; count = 0; longest = 0; seen = False
    for v in a:
        if -floor <= v <= floor:
            run += 1
        else:
            if seen and run >= need:
                count += 1; longest = max(longest, run)
            run = 0; seen = True
    return count, longest * 1000.0 / rate


def set_a2(l, want):
    a = l.a2(9 if want == "on" else 8) if want in ("on", "off") else l.a2(7)
    if a is None:
        raise SystemExit("this firmware has no A2 (command 25 request 7 refused): install tabby-v04.2-diagA2")
    if want in ("on", "off") and a["on"] != (want == "on"):
        raise SystemExit("A2 did not switch %s" % want)
    return a


def capture(a, soak=False):
    din = T.Monitor(a.din); din.start()
    l = T.Link()
    usb = []; log = []; stopped = None
    cap = None
    try:
        state = set_a2(l, a.a2)
        print("A2 is %s | kernel timestamps on USB in: %s | DIN: %s" % ("ON" if state["on"] else "off", l.kernel_time, a.din), flush=True)
        print("press PLAY on the SONG page now (waiting up to %d s for the first note)" % a.wait, flush=True)
        deadline = time.monotonic() + a.wait; first = None
        while first is None and time.monotonic() < deadline:
            usb.extend(l.messages(20))
            for t, m in usb + list(din.messages):
                if len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2]:
                    first = t; break
        if first is None:
            print("no note-on within %d s; nothing recorded" % a.wait); return None
        if a.audio:
            cap = T.Capture(keep=tuple(int(c) for c in a.audio.split(","))); cap.start()
        l.diag(1)                                  # reset at the first note (the A2 counters too)
        before = l.health()
        print("first note seen; counters reset; recording %d s" % a.seconds, flush=True)
        t0 = time.monotonic(); end = t0 + a.seconds; next_log = t0 + a.every
        while time.monotonic() < end:
            usb.extend(l.messages(50))
            if soak and time.monotonic() >= next_log:
                next_log += a.every
                h = l.health(); s = l.a2(7); d = l.diag(0)
                b = (d.get("profile") or {}).get("budget") or {}
                line = ("%6.0f s  underruns +%d  dma overruns +%d  short +%d  adapted +%d  midi-in dropped +%d | A2 %d calls %.1f/s mean %.1f us max %.1f us retries %d | "
                        "pass mean %.2f max %.2f ms, lost ticks %d"
                        % (time.monotonic() - t0, h["underruns"] - before["underruns"], h["dma_overruns"] - before["dma_overruns"],
                           h["short_intervals"] - before["short_intervals"], h["adapted"] - before["adapted"],
                           h["midi_dropped"] - before["midi_dropped"], s["calls"], s["calls_per_second"], s["mean_us"], s["max_us"], s["retries"],
                           (d.get("profile") or {}).get("pass_mean_ms", 0), (d.get("profile") or {}).get("pass_max_ms", 0), b.get("lost_ticks", 0)))
                print(line, flush=True); log.append(line)
                rise = [k for k in ("underruns", "dma_overruns", "adapted") if h[k] > before[k]]
                if rise and a.stop_on_rise:
                    stopped = "STOPPED at %.0f s: %s rose" % (time.monotonic() - t0, ", ".join(rise)); print(stopped, flush=True); break
        usb.extend(l.other); l.other = []
        after = l.health(); a2page = l.a2(7); d = l.diag(0); st = l.song_status()
    finally:
        l.close()
        din_rows = din.finish()
        chans = cap.finish() if cap else {}
    din_ev = sorted(din.messages, key=lambda x: x[0]); usb_ev = sorted(usb, key=lambda x: x[0])
    usb_rows = M.to_rows(usb_ev, "usb"); din_rows = [r[:6] + ("din",) for r in din_rows]
    rows = sorted(din_rows + usb_rows, key=lambda r: r[0])
    if rows:
        M.write_csv(os.path.join(a.out, "%s-din-usb.csv" % a.tag), rows, rows[0][0])
    res = {"tag": a.tag, "a2": a2page, "seconds": a.seconds, "din": analyze(din_ev), "usb": analyze(usb_ev),
           "din_usb_differences": same_notes(din_ev, usb_ev), "health_before": before, "health_after": after,
           "profile": d.get("profile"), "song_status": st, "stopped": stopped, "audio": {}}
    for c, b in chans.items():
        T.write_wav(os.path.join(a.out, "%s-audio-in%d.wav" % (a.tag, c + 1)), b)
        n, longest = silent_gaps(b)
        res["audio"]["in%d" % (c + 1)] = {"silent_gaps_2ms": n, "longest_gap_ms": longest, "capture_xruns": cap.xruns}
    text = summary(res)
    save(a.out, "%s-summary.json" % a.tag, json.dumps(res, indent=1))
    save(a.out, "%s-summary.txt" % a.tag, text + "\n")
    save(a.out, "%s-counters.txt" % a.tag, T.diag_text(d) + "\n")
    if soak:
        save(a.out, "%s-soak.log" % a.tag, "\n".join(log) + "\n")
    print(text)
    return res


def port_line(name, p):
    if not p.get("lines"):
        return "%s: no notes" % name
    s = "%s: %d notes on %d line(s); band per line %.2f..%.2f ms, std up to %.2f ms" % (
        name, p["notes"], len(p["lines"]), p["band_min_ms"], p["band_max_ms"], p["std_max_ms"])
    if "all_lines_band_ms" in p:
        s += "; all lines on one grid %.2f ms" % p["all_lines_band_ms"]
    return s + ("; STUCK: " + ", ".join(p["stuck"]) if p["stuck"] else "; no note left on")


def summary(r):
    out = ["Task 15 run %s, %d s, measured" % (r["tag"], r["seconds"])]
    out += T.a2_lines(r["a2"])
    out += [port_line("DIN", r["din"]), port_line("USB", r["usb"])]
    out.append("USB against DIN: " + ("; ".join(r["din_usb_differences"]) if r["din_usb_differences"] else "the same notes on both"))
    out += T.health_lines(r["health_after"], r["health_before"])
    p = r.get("profile")
    if p:
        b = p.get("budget") or {}
        out.append("control pass: %d passes, mean %.2f ms, max %.2f ms; lost ticks %d; busy mean %.2f max %.2f ms"
                   % (p["passes"], p["pass_mean_ms"], p["pass_max_ms"], b.get("lost_ticks", 0), b.get("busy_mean_ms", 0), b.get("busy_max_ms", 0)))
    for k, v in sorted(r.get("audio", {}).items()):
        out.append("audio %s: %d silent gaps of 2 ms or more (longest %.1f ms), capture xruns %d" % (k, v["silent_gaps_2ms"], v["longest_gap_ms"], v["capture_xruns"]))
    if r.get("stopped"):
        out.append(r["stopped"])
    return "\n".join(out)


def table(a):
    rd = lambda tag: json.load(open(os.path.join(a.out, "%s-summary.json" % tag)))
    off, on = rd(a.off), rd(a.on)
    rows = [("", "A2 off (%s)" % a.off, "A2 on (%s)" % a.on)]
    def add(label, f):
        try:
            rows.append((label, f(off), f(on)))
        except (KeyError, TypeError, ZeroDivisionError):
            rows.append((label, "-", "-"))
    band = lambda port: lambda r: "%.2f..%.2f" % (r[port]["band_min_ms"], r[port]["band_max_ms"])
    add("DIN band per line, ms", band("din")); add("USB band per line, ms", band("usb"))
    add("DIN std, ms", lambda r: "%.2f" % r["din"]["std_max_ms"])
    add("DIN all lines, ms", lambda r: "%.2f" % r["din"]["all_lines_band_ms"])
    add("USB all lines, ms", lambda r: "%.2f" % r["usb"]["all_lines_band_ms"])
    add("pass mean / max, ms", lambda r: "%.2f / %.2f" % (r["profile"]["pass_mean_ms"], r["profile"]["pass_max_ms"]))
    add("lost ticks", lambda r: "%d" % r["profile"]["budget"]["lost_ticks"])
    add("A2 calls per second", lambda r: "%.1f" % r["a2"]["calls_per_second"])
    add("A2 call mean / max, us", lambda r: "%.1f / %.1f" % (r["a2"]["mean_us"], r["a2"]["max_us"]))
    add("A2 retries", lambda r: "%d" % r["a2"]["retries"])
    rise = lambda k: lambda r: "+%d" % (r["health_after"][k] - r["health_before"][k])
    add("CPU GUARD adapted", rise("adapted")); add("engine underruns", rise("underruns")); add("DMA overruns", rise("dma_overruns"))
    add("render peak, ms", lambda r: "%.3f" % r["health_after"]["render_peak_ms"])
    add("stuck notes", lambda r: "%d" % (len(r["din"]["stuck"]) + len(r["usb"]["stuck"])))
    add("USB differs from DIN", lambda r: "%d" % len(r["din_usb_differences"]))
    w = [max(len(r[i]) for r in rows) for i in range(3)]
    text = "\n".join("%-*s  %-*s  %-*s" % (w[0], r[0], w[1], r[1], w[2], r[2]) for r in rows)
    save(a.out, "table-%s-%s.txt" % (a.off, a.on), text + "\n"); print(text)


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("cmd", choices=["l2", "soak", "table"])
    p.add_argument("--a2", choices=["off", "on", "keep"], default="keep", help="switch A2 first (keep: only read it)")
    p.add_argument("--seconds", type=float, default=125)
    p.add_argument("--wait", type=float, default=300, help="how long to wait for the first note-on")
    p.add_argument("--every", type=float, default=60, help="soak: seconds between log lines")
    p.add_argument("--stop-on-rise", action="store_true", help="soak: stop at the first rise of underruns, DMA overruns or CPU GUARD")
    p.add_argument("--audio", default="", help="AUDIO4c input channels to record, e.g. 0,1")
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--tag", default="run")
    p.add_argument("--off", help="table: the A2-off run's tag"); p.add_argument("--on", help="table: the A2-on run's tag")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    if a.cmd == "table":
        table(a)
    else:
        capture(a, soak=a.cmd == "soak")


if __name__ == "__main__":
    main()
