#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-clips.py — Task 17 Goal 2: a song's MIDI out against the events the song holds

Purpose
    tabby-v04.5 plays v3 clips (more than four notes on a step, controller events, rows of more than 64 steps) from
    their event lists. This script plays a song by remote command on the device, records what leaves the TRS MIDI out
    (H4MIDI WC DIN in 1) and USB with kernel timestamps until the song ends, and compares it with the list
    tools/linux/hw/expected-events.mjs made from the same MIDI file with the repository's importer:

      - every expected note-on is there, with its pitch, velocity and channel, in the expected order per channel,
        and nothing else is (extra and missing notes are listed);
      - the times: a straight line is fitted through (expected time, measured time); its slope is the device's
        tempo against the nominal one, the residuals are the timing errors (largest, standard deviation);
      - clip controller events (CC, bend, pressure): each expected one is there, in order per channel;
      - every note-on got its note-off (nothing left sounding), the audio counters did not move.

    The song must already be in the slot (tools/linux/hw/workbench.mjs song --mid FILE --slot N [--options JSON],
    through the published page). Track n sends on the device's OUT CH of track n (defaults 1..7 and 10) unless the
    song sets its own.

Usage (browser closed)
    node tools/linux/hw/expected-events.mjs FILE.mid [--options JSON] > expected.json
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-clips.py --song N --expected expected.json --out DIR --tag NAME

Version: 0.1

Revision log
    v0.1  2026-11-14  Task 17: first version.
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

TRACK_CHANNEL = [0, 1, 2, 3, 4, 5, 6, 9]          # the device's default OUT CH per track (0-based)


def fit(xs, ys):
    n = len(xs)
    if n < 2:
        return (ys[0] - xs[0] if n else 0.0), 1.0
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx if sxx else 1.0
    return my - b * mx, b


def compare(expected, events, t_start):
    chan = lambda track: expected["outChannels"][track] if expected["outChannels"][track] is not None else TRACK_CHANNEL[track]
    want = {}
    for n in expected["notes"]:
        want.setdefault((chan(n["track"]), n["pitch"], n["velocity"]), []).append(n["ms"])
    got = {}; held = {}; ctl = []
    for t, m in events:
        if t < t_start or len(m) < 2:
            continue
        kind, ch = m[0] & 0xF0, m[0] & 15
        ms = (t - t_start) / 1e6
        if kind == 0x90 and len(m) == 3 and m[2]:
            got.setdefault((ch, m[1], m[2]), []).append(ms); held[(ch, m[1])] = held.get((ch, m[1]), 0) + 1
        elif (kind == 0x80 or kind == 0x90) and len(m) == 3:
            held[(ch, m[1])] = held.get((ch, m[1]), 0) - 1
        elif kind in (0xB0, 0xE0, 0xD0, 0xC0):
            ctl.append((ms, ch, kind, m[1], m[2] if len(m) > 2 else 0))
    missing, extra, xs, ys = [], [], [], []
    for key in sorted(set(want) | set(got)):
        w, g = want.get(key, []), got.get(key, [])
        for a, b in zip(w, g):
            xs.append(a); ys.append(b)
        if len(w) > len(g):
            missing.append("ch%d pitch %d vel %d: %d of %d" % (key[0] + 1, key[1], key[2], len(g), len(w)))
        if len(g) > len(w):
            extra.append("ch%d pitch %d vel %d: %d, expected %d" % (key[0] + 1, key[1], key[2], len(g), len(w)))
    a, b = fit(xs, ys)
    res = [y - (a + b * x) for x, y in zip(xs, ys)]
    sd = (sum(r * r for r in res) / len(res)) ** 0.5 if res else 0.0
    # clip controller events, in order per (channel, kind, controller)
    status = {1: 0xB0, 3: 0xE0, 4: 0xD0}
    cwant = {}
    for c in expected["controls"]:
        k = (chan(c["track"]), status[c["kind"]], c["a"] if c["kind"] == 1 else -1)
        cwant.setdefault(k, []).append((c["a"], c["b"]) if c["kind"] != 4 else (c["a"], 0))
    cgot = {}
    for ms, ch, kind, d1, d2 in ctl:
        k = (ch, kind, d1 if kind == 0xB0 else -1)
        if k in cwant:
            cgot.setdefault(k, []).append((d1, d2))
    cbad = ["ch%d %s: sent %s, expected %s" % (k[0] + 1, {0xB0: "CC %d" % k[2], 0xE0: "bend", 0xD0: "pressure"}[k[1]], cgot.get(k, [])[:12], v[:12])
            for k, v in sorted(cwant.items()) if cgot.get(k, []) != v]
    return {"expected_notes": len(expected["notes"]), "matched": len(xs), "missing": missing, "extra": extra,
            "tempo_ratio": b, "offset_ms": a, "worst_ms": max((abs(r) for r in res), default=0.0), "std_ms": sd,
            "expected_controls": len(expected["controls"]), "controls_wrong": cbad,
            "stuck": sorted("ch%d note %d" % (c + 1, n) for (c, n), v in held.items() if v > 0),
            "program_changes": [(round(ms, 1), ch + 1, d1) for ms, ch, kind, d1, d2 in ctl if kind == 0xC0]}


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, required=True, help="the song's slot, 1 to 16 as on the screen")
    p.add_argument("--expected", required=True)
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--tolerance", type=float, default=4.0, help="largest timing error accepted, ms")
    p.add_argument("--tag", default="clip")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    expected = json.load(open(a.expected))
    din = T.Monitor(a.din); din.start()
    l = T.Link()
    usb = []
    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        l.stop_song(); time.sleep(0.5); l.messages(50)
        before = l.health()
        armed = time.monotonic_ns()
        st = l.play_song(a.song - 1)
        end = time.monotonic() + expected["lengthMs"] / 1000.0 * 1.02 + 6.0
        done_at = None; next_poll = time.monotonic() + 1.5
        while time.monotonic() < end:
            usb.extend(l.messages(50))
            if done_at is None and time.monotonic() >= next_poll:
                next_poll = time.monotonic() + 0.5
                try:
                    usb.extend(l.other); l.other = []
                    if l.remote_status()["song_state"] == 0:
                        done_at = time.monotonic()
                except Exception:
                    pass
            if done_at is not None and time.monotonic() - done_at > 1.0:
                break
        usb.extend(l.other); l.other = []
        l.stop_song(); time.sleep(0.3); usb.extend(l.messages(50))
        after = l.health(); song = l.song_status()
    finally:
        l.close(); din.finish()
    result = {"tag": a.tag, "file": expected["file"], "options": expected["options"], "song_ended_by_itself": done_at is not None,
              "blocks": {"v2": expected["v2Blocks"], "v3": expected["v3Blocks"]}, "rows": expected["rows"], "rowSteps": expected["rowSteps"]}
    ok = True
    for name, events in (("din", din.messages), ("usb", usb)):
        starts = [t for t, m in events if t >= armed and list(m) == [0xFA]]
        if not starts:
            result[name] = {"error": "no MIDI Start seen"}; ok = False; continue
        r = compare(expected, sorted(events, key=lambda x: x[0]), starts[0])
        r["pass"] = (r["matched"] == r["expected_notes"] and not r["missing"] and not r["extra"] and not r["controls_wrong"]
                     and not r["stuck"] and r["worst_ms"] <= a.tolerance)
        ok = ok and r["pass"]; result[name] = r
    result["audio"] = {"underruns": after["underruns"] - before["underruns"], "dma_overruns": after["dma_overruns"] - before["dma_overruns"],
                       "render_peak_ms": after["render_peak_ms"], "cpu_guard": after["adapted"] - before["adapted"]}
    ok = ok and result["audio"]["underruns"] == 0 and result["audio"]["dma_overruns"] == 0 and result["song_ended_by_itself"]
    result["pass"] = ok
    with open(os.path.join(a.out, a.tag + "-clips.json"), "w") as f:
        json.dump(result, f, indent=1, default=str)
    for name in ("din", "usb"):
        r = result[name]
        if "error" in r:
            print("%s %s: %s" % (a.tag, name, r["error"])); continue
        print("%s %s %s: %d of %d note-ons matched; timing worst %.2f ms, std %.2f ms, tempo x %.5f; %d clip controller events %s; missing %s; extra %s; stuck %s"
              % ("PASS" if r["pass"] else "FAIL", a.tag, name, r["matched"], r["expected_notes"], r["worst_ms"], r["std_ms"], r["tempo_ratio"], r["expected_controls"],
                 "in order" if not r["controls_wrong"] else "WRONG " + "; ".join(r["controls_wrong"]), r["missing"] or "none", r["extra"] or "none", r["stuck"] or "none"))
    print("%s %s: blocks v2 %d / v3 %d; song ended by itself: %s; underruns +%d, DMA overruns +%d, render peak %.2f ms, CPU GUARD +%d"
          % ("PASS" if ok else "FAIL", a.tag, expected["v2Blocks"], expected["v3Blocks"], result["song_ended_by_itself"], result["audio"]["underruns"],
             result["audio"]["dma_overruns"], result["audio"]["render_peak_ms"], result["audio"]["cpu_guard"]))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
