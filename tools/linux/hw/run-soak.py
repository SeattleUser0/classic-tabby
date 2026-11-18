#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-soak.py — a timing soak in segments: one song after the other, page after page, every note kept

Purpose
    Plays timing songs on the device again and again for --minutes, each time on the next page of --pages, with A2
    on, and measures every note-on on the DIN out and on the device's USB port (tools/linux/hw/run-15.py l2 does one
    segment; the receive times are on this computer's raw clock, tabby_link v0.23). Per segment it keeps: the band
    of every line (largest minus smallest error against the line's own grid), the largest single error, every note's
    error (in the segment's summary file), what this computer's steered clock did meanwhile (rate, and the bend an
    unmapped measurement would have shown), the device's counters (underruns, DMA overruns, CPU GUARD) and stuck
    notes. A segment is "bad" when a line's band is above --band-limit ms (one line; --band-limit-many for more), a note is missing against the other
    port, a counter rose or a note stuck. The soak does not stop at a bad segment: it goes on and says how many.

    Songs: --songs "16:1,15:8" = slot 16 with one line and slot 15 with eight lines (the timing songs; they end by
    themselves after 120 s). Files: <tag>-NN-*.{txt,json,csv} per segment (run-15's), <tag>-soak.json and
    <tag>-soak.txt (the table).

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-soak.py --minutes 65 --tag soak-v0423 --out DIR

Version: 0.2

Revision log
    v0.2  2026-11-18  For a song with row events (the Wrong Room song): --din-band-limit (on one DIN cable a scene's program
                      changes and controllers pass ahead of its first notes, about 0.8 ms each: 17 events at the loop
                      point are 14 ms; USB carries them at once), and every segment's program changes, controllers,
                      note-ons and note-offs are counted on both ports and must agree (--events: there must be some).
    v0.1  2026-11-18  First version (the user's priority 1 of 2026-11-18: the 9.9 ms run of tabby-v04.23-rc1).
"""
import argparse
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--minutes", type=float, default=65.0)
    p.add_argument("--songs", default="16:1,15:8", help="slot:lines, ...")
    p.add_argument("--pages", default="overview,clips,scenes,steps,mixer,actions")
    p.add_argument("--seconds", type=int, default=125, help="capture per segment (the timing songs last 120 s)")
    p.add_argument("--band-limit", type=float, default=2.5, help="ms, one line (the goal is 2)")
    p.add_argument("--band-limit-many", type=float, default=3.5, help="ms, several lines (the goal is about 3; on DIN notes due together leave one after the other)")
    p.add_argument("--din-band-limit", type=float, default=0.0, help="ms; v0.2: its own limit for the DIN port (0: as the other limits)")
    p.add_argument("--events", action="store_true", help="v0.2: the song has row events: program changes and controllers must be seen in every segment")
    p.add_argument("--tag", default="soak")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    songs = [tuple(int(x) for x in s.split(":")) for s in a.songs.split(",")]
    pages = a.pages.split(",")
    end = time.monotonic() + a.minutes * 60.0
    rows = []; n = 0; t_begin = time.time()
    while time.monotonic() < end:
        slot, lines = songs[n % len(songs)]
        page = pages[(n // len(songs)) % len(pages)]
        tag = "%s-%02d" % (a.tag, n + 1)
        cmd = [sys.executable, os.path.join(HERE, "run-15.py"), "l2", "--a2", "on", "--seconds", str(a.seconds), "--play", str(slot), "--page", page, "--tag", tag, "--out", a.out]
        t0 = time.time()
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        row = {"segment": n + 1, "at_min": round((t0 - t_begin) / 60.0, 1), "song": slot, "lines": lines, "page": page, "exit": r.returncode}
        try:
            s = json.load(open(os.path.join(a.out, tag + "-summary.json")))
            for port in ("din", "usb"):
                q = s[port]
                errs = [abs(e) for v in q["lines"].values() for e in v.get("errors_ms", [])]
                row[port] = {"notes": q["notes"], "lines": len(q["lines"]), "band_min_ms": round(q.get("band_min_ms", 0), 2), "band_max_ms": round(q.get("band_max_ms", 99), 2),
                             "all_lines_band_ms": round(q.get("all_lines_band_ms", q.get("band_max_ms", 99)), 2), "worst_error_ms": round(max(errs, default=99.0), 2),
                             "stuck": q["stuck"], "clock_ratio": q.get("clock_ratio")}
            row["clock"] = {"steer_ppm": s["din"].get("clock_steer_ppm"), "parted_ms": s["din"].get("clock_parted_ms"), "bend_ms": s["din"].get("clock_bend_ms")}
            hb, ha = s["health_before"], s["health_after"]
            row["device"] = {k: ha[k] - hb[k] for k in ("underruns", "dma_overruns", "adapted", "midi_dropped") if k in ha and k in hb}
            row["device"]["render_peak_ms"] = ha.get("render_peak_ms")
            row["differences"] = s.get("din_usb_differences")
            row["shown_page"] = s.get("page")
            bad = []
            import csv, collections
            cnt = collections.Counter()
            with open(os.path.join(a.out, tag + "-din-usb.csv"), newline="") as f:
                for q in csv.DictReader(f):
                    cnt[(q["port"], q["kind"])] += 1
            row["events"] = {k: [cnt[("din", k)], cnt[("usb", k)]] for k in ("note_on", "note_off", "program", "cc")}
            for k, (d_, u_) in row["events"].items():
                if d_ != u_: bad.append("%s: %d on DIN, %d on USB" % (k, d_, u_))
            if row["events"]["note_on"][0] != row["events"]["note_off"][0]: bad.append("note-ons and note-offs differ")
            if a.events and not (row["events"]["program"][0] and row["events"]["cc"][0]): bad.append("no program change or controller seen")
            for port in ("din", "usb"):
                if row[port]["lines"] != lines: bad.append("%s: %d lines, %d expected" % (port, row[port]["lines"], lines))
                if row[port]["band_max_ms"] > (a.din_band_limit if port == "din" and a.din_band_limit else a.band_limit if lines == 1 else a.band_limit_many): bad.append("%s band %.2f ms" % (port, row[port]["band_max_ms"]))
                if row[port]["stuck"]: bad.append("%s stuck notes" % port)
            if row["device"].get("underruns") or row["device"].get("dma_overruns"): bad.append("underrun / DMA overrun")
            if row["differences"]: bad.append("DIN and USB differ")
            row["bad"] = bad
        except Exception as e:
            row["bad"] = ["no summary: %r; %s" % (e, r.stdout[-300:].replace("\n", " | "))]
        rows.append(row); n += 1
        d, u, c = row.get("din", {}), row.get("usb", {}), row.get("clock", {})
        print("%2d %5.1f min  song %2d (%d line%s)  %-8s  DIN band %s  worst %s | USB band %s  worst %s | NUC clock %s ppm, bend %s ms | %s" % (
            row["segment"], row["at_min"], slot, lines, "" if lines == 1 else "s", page, d.get("band_max_ms"), d.get("worst_error_ms"), u.get("band_max_ms"), u.get("worst_error_ms"),
            c.get("steer_ppm"), c.get("bend_ms"), ("ok" + (" (PC %d, CC %d)" % (row["events"]["program"][0], row["events"]["cc"][0]) if a.events and row.get("events") else "")) if not row["bad"] else "BAD: " + "; ".join(row["bad"])), flush=True)
        with open(os.path.join(a.out, a.tag + "-soak.json"), "w") as f:
            json.dump({"tag": a.tag, "band_limit_ms": a.band_limit, "band_limit_many_ms": a.band_limit_many, "segments": rows}, f, indent=1)
    good = [r for r in rows if not r["bad"]]
    lines_out = ["%s: %d segments in %.0f minutes, %d bad" % (a.tag, len(rows), (time.time() - t_begin) / 60.0, len(rows) - len(good))]
    for lines in sorted({r["lines"] for r in rows}):
        g = [r for r in good if r["lines"] == lines]
        if g:
            lines_out.append("%d line%s, %d segments: DIN band %.2f to %.2f ms, largest single error %.2f ms; USB band %.2f to %.2f ms, largest single error %.2f ms" % (
                lines, "" if lines == 1 else "s", len(g), min(r["din"]["band_max_ms"] for r in g), max(r["din"]["band_max_ms"] for r in g), max(r["din"]["worst_error_ms"] for r in g),
                min(r["usb"]["band_max_ms"] for r in g), max(r["usb"]["band_max_ms"] for r in g), max(r["usb"]["worst_error_ms"] for r in g)))
    cl = [r["clock"] for r in rows if r.get("clock") and r["clock"].get("steer_ppm") is not None]
    if cl:
        lines_out.append("this computer's steered clock against its raw clock: %+.1f to %+.1f ppm; largest bend inside one segment %.2f ms (an unmapped measurement would have shown it as timing error)" % (
            min(c["steer_ppm"] for c in cl), max(c["steer_ppm"] for c in cl), max(c["bend_ms"] or 0 for c in cl)))
    for r in rows:
        if r["bad"]:
            lines_out.append("BAD segment %d (song %d, %s, at %.1f min): %s" % (r["segment"], r["song"], r["page"], r["at_min"], "; ".join(r["bad"])))
    text = "\n".join(lines_out)
    with open(os.path.join(a.out, a.tag + "-soak.txt"), "w") as f:
        f.write(text + "\n")
    print(text)
    return 0 if len(good) == len(rows) else 1


if __name__ == "__main__":
    sys.exit(main())
