#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tests/linux/midi-monitor-test.py — the analysis of tools/linux/midi-monitor.py on synthetic captures

Purpose
    The monitor's numbers decide whether MIDI-out timing becomes Phase 1's first item (SPEC 14.3),
    so its parser and analysis are checked against captures whose jitter and drift are known by
    construction (no port is opened):
      1. the parser: running status, a real-time clock byte inside a note-on, note-on velocity 0
         as a note-off, SysEx, system common;
      2. one 16th line at 120 BPM with a uniform jitter of +-0.5 ms and a drift of +80 ppm:
         spread close to 1.0 ms, drift close to 80 ppm, no doubled step;
      3. eight channels sent as DIN would (each 0.96 ms after the one before) with +-0.25 ms jitter
         per step: per-channel spread close to 0.5 ms, burst width close to 6.7 ms;
      4. a MIDI clock at 120 BPM gives the tempo and the step when --bpm is not given;
      5. the CSV written and read back gives the same analysis.

    Run:  python3 tests/linux/midi-monitor-test.py     (or: make workbench-test)

Version: 0.1

Revision log
    v0.1  2026-11-07  Initial version (Task 11 Step 3).
"""
import importlib.util
import os
import random
import sys
import tempfile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
spec = importlib.util.spec_from_file_location("midi_monitor", os.path.join(ROOT, "tools/linux/midi-monitor.py"))
mm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mm)

failed = 0


def check(cond, what, detail=""):
    global failed
    print(("ok   " if cond else "FAIL ") + what + (" — " + str(detail) if detail != "" else ""))
    if not cond:
        failed += 1


# 1. parser
p = mm.Parser()
msgs = p.feed(1000, bytes([0x90, 60, 100, 62, 0xF8, 90, 0x90, 64, 0, 0xF0, 1, 2, 0xF7, 0xB1, 7, 99, 0xF2, 3, 4, 0x91]))
msgs += p.feed(2000, bytes([65, 70]))
kinds = [mm.describe(m)[0] for _, m in msgs]
check(kinds == ["note_on", "clock", "note_on", "note_off", "sysex", "cc", "song_position", "note_on"], "parser: running status, real-time inside a message, velocity 0, SysEx, system common", kinds)
check(msgs[2][1] == [0x90, 62, 90] and msgs[-1] == (2000, [0x91, 65, 70]), "parser: the interrupted note keeps its bytes; a message split over two reads takes the later time")

rng = random.Random(11)
STEP_NS = 125_000_000


def line(channel, n=960, jitter_ms=0.5, ppm=0.0, offset_ms=0.0):
    rows = []
    for k in range(n):
        t = 5_000_000_000 + k * STEP_NS * (1 + ppm * 1e-6) + offset_ms * 1e6 + rng.uniform(-jitter_ms, jitter_ms) * 1e6
        rows.append((int(t), "note_on", channel, 60, 100))
        rows.append((int(t + 62_500_000), "note_off", channel, 60, 0))
    return rows


# 2. one line
r = mm.analyze(line(1, jitter_ms=0.5, ppm=80.0), bpm=120)
c = r["channels"][1]
check(0.9 < c["spread_ms"] <= 1.0 and 70 < c["drift_ppm"] < 90 and c["same_step_twice"] == 0, "one line: spread about 1.0 ms, drift about 80 ppm", "%.3f ms, %.1f ppm" % (c["spread_ms"], c["drift_ppm"]))
check(abs(c["end_vs_nominal_ms"] - 959 * 125 * 80e-6) < 1.0, "one line: end against the nominal grid = the drift over 2 minutes", "%.3f ms" % c["end_vs_nominal_ms"])

# 3. eight channels with DIN serialisation
rows = []
for ch in range(1, 9):
    rows += line(ch, jitter_ms=0.25, offset_ms=(ch - 1) * 0.96)
rows.sort()
r8 = mm.analyze(rows, bpm=120)
spreads = [v["spread_ms"] for v in r8["channels"].values()]
check(len(spreads) == 8 and all(0.4 < s < 0.55 for s in spreads), "eight channels: per-channel spread about 0.5 ms", ["%.3f" % s for s in spreads])
check(6.0 < r8["burst"]["width_mean_ms"] < 7.4, "eight channels: burst width about 6.7 ms (7 x 0.96)", "%.3f" % r8["burst"]["width_mean_ms"])

# 4. clock
clock = [(5_000_000_000 + i * 20_833_333, "clock", "", "", "") for i in range(24 * 120)]
rc = mm.analyze(clock + line(1, n=200, jitter_ms=0.1))
check(abs(rc["clock"]["bpm"] - 120) < 0.01 and abs(rc["step_ms"] - 125) < 0.01, "clock: 120 BPM and a 125 ms step from the pulses", "%.3f BPM" % rc["clock"]["bpm"])

# 5. CSV round trip
with tempfile.TemporaryDirectory() as d:
    path = os.path.join(d, "capture.csv")
    raw = [(t, k, ch, d1, d2, "") for t, k, ch, d1, d2 in rows]
    mm.write_csv(path, raw, raw[0][0])
    back = mm.analyze(mm.read_csv(path), bpm=120)
    check(abs(back["channels"][3]["spread_ms"] - r8["channels"][3]["spread_ms"]) < 1e-9, "CSV written and read back: the same analysis")

print("%s" % ("FAILED" if failed else "all checks passed"))
sys.exit(1 if failed else 0)
