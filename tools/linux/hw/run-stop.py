#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-stop.py — MIDI Stop latency, the clock around a save, and saves that nobody asked for

Purpose (the user's requests of 2026-11-21, after a Stop message that the device's own record showed 177.79 ms late)
    A flash write masks every interrupt and holds the control task for up to 0.2 s. Three things follow from that,
    and each is measured here on the DIN out (H4MIDI WC) and the device's USB port, on this computer's raw clock:

    1. STOP LATENCY: from the moment the stop is sent to the device (the remote SEQ PLAY key) to the MIDI Stop byte
       (FC) on each port. Cases: after SEQ PLAY alone; right after a page change (the stop sent with the page key);
       with a save sent at once after the stop (the clip unsaved: the write that could hold the Stop back); and the
       first stop after a save. To SEE: every Stop within --stop-limit ms on both ports, and in the case with the
       save: the Stop on the cable BEFORE the clock's pause that the write makes.
    2. THE CLOCK WHILE STOPPED: the clock bytes (F8) run on while the transport is stopped (CLOCK OUT is on by
       default). Around a save: the longest pause between two clock bytes, and the shortest interval after it.
       To SEE: no interval after the pause shorter than half the clock's period: no bytes sent together afterwards
       (a burst reads as a tempo spike on a synced synth). The pause itself is reported: about five periods.
    3. NO SAVE BY ITSELF WITHOUT A CHANGE: pages visited, the song played and stopped, a clip opened and closed;
       15 s later the device's flash counters have not moved. Then one note is changed: within 15 s after the stop
       they have (the save by itself works), and after that they stand still again.

    The song in --song must loop (the release run's test song, slot 7). The note the test adds is taken out again.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-stop.py --out DIR [--tag NAME] [--report-only]

Version: 0.3

Revision log
    v0.3  2026-11-22  One limit, 30 ms, for every case: the screen's own drawing delays the key in any of them.
    v0.2  2026-11-22  'The Stop before the pause': within one clock period after the last clock byte before the write (v0.1
                      asked for it before that byte and failed a Stop that left 4 to 15 ms after the key).
    v0.1  2026-11-21  First version.
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

RESULTS = []


def check(ok, what, detail=""):
    RESULTS.append((bool(ok), what, str(detail)))
    print("%s %s%s" % ("ok  " if ok else "FAIL", what, (" (%s)" % detail) if detail != "" else ""), flush=True)
    return bool(ok)


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, default=7, help="the looping test song's slot, 1 to 16")
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--stop-limit", type=float, default=30.0,
                   help="ms from the stop being sent to FC on a port. The path: the remote command over USB (1 to 2 ms), the control pass "
                        "that reads the key (a pass may wait for one screen band, up to 6 ms), the audio block that stops the song "
                        "(2.9 ms), the Stop due one block later (2.9 ms), the pass that sends it: 15 ms; and when the screen is drawing a page "
                        "whole (after a page change, a message, a save) the key is read after that pass: up to 12 ms more measured "
                        "(16.67 ms after a save, 19.33 after a page change). 30 ms. A Stop behind a flash write is 85 ms or more.")
    p.add_argument("--repeats", type=int, default=5)
    p.add_argument("--tag", default="stop")
    p.add_argument("--out", required=True)
    p.add_argument("--report-only", action="store_true", help="measure and print, judge nothing (for a firmware before the fix)")
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    din = T.Monitor(a.din); din.start()
    l = T.Link(); time.sleep(0.3)
    usb = []
    data = {"tag": a.tag, "stops": [], "clock": {}, "saves": {}}

    def pump(seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            usb.extend(l.messages(20))
            usb.extend(l.other); l.other = []

    def first(events, since, status):
        for t, m in list(events):
            if t >= since and len(m) >= 1 and m[0] == status:
                return t
        return None

    def f8(events, lo, hi):
        return sorted(t for t, m in list(events) if lo <= t <= hi and list(m) == [0xF8])   # sorted: the USB list is filled from two readers

    def clock_report(events, lo, hi):
        ts = f8(events, lo, hi)
        if len(ts) < 12:
            return None
        gaps = [(ts[i + 1] - ts[i]) / 1e6 for i in range(len(ts) - 1)]
        period = sorted(gaps)[len(gaps) // 2]
        k = max(range(len(gaps)), key=lambda i: gaps[i])
        after = gaps[k + 1:k + 13]
        return {"period_ms": round(period, 2), "longest_pause_ms": round(gaps[k], 2), "pause_at": ts[k],
                "shortest_after_ms": round(min(after), 2) if after else None,
                "short_intervals_after": sum(1 for g in after if g < 0.5 * period),
                "bytes_missing": round(gaps[k] / period) - 1, "intervals_after_ms": [round(g, 2) for g in after[:10]]}

    def flash():
        f = l.diag(0)["flash"]
        return f["erases"] + f["writes"]

    def stop_case(name, before=None, after=None, limit=None, play_s=1.2):
        """Play, wait, send the stop; latency of FC per port."""
        rows = []
        for n in range(a.repeats):
            l.play_song(a.song - 1); pump(play_s + 0.137 * n)
            if before:
                before()
            t0 = T.now_ns()
            l.key(0, l.PANEL["PLAY"], 1)
            extra = after() if after else None
            l.key(0, l.PANEL["PLAY"], 0)
            pump(0.6)
            row = {"case": name, "n": n + 1}
            for port, ev in (("din", din.messages), ("usb", usb)):
                t = first(ev, t0, 0xFC)
                row[port] = None if t is None else round((t - t0) / 1e6, 2)
            if extra is not None:
                row.update(extra)
            row["t0"] = t0
            rows.append(row); data["stops"].append(row)
            l.stop_song(); pump(0.3)
        d = [r["din"] for r in rows]; u = [r["usb"] for r in rows]
        lim = limit or a.stop_limit
        ok = all(v is not None and v < lim for v in d + u)
        check(ok or a.report_only, "Stop after %s: FC within %.0f ms of the stop being sent, %d times" % (name, lim, len(rows)),
              "DIN %s ms; USB %s ms" % (", ".join("?" if v is None else "%.2f" % v for v in d), ", ".join("?" if v is None else "%.2f" % v for v in u)))
        return rows

    try:
        l.release_all(); l.stop_song(); pump(0.5)
        l.select_song(a.song - 1); l.show_page("overview"); pump(0.3)
        h0 = l.health()

        # ---- 3a. nothing changed: no save by itself ----
        l.diag(1); pump(0.3); f0 = flash()
        for page in ("clips", "scenes", "steps", "mixer", "actions", "overview"):
            l.show_page(page); pump(0.3)
        l.play_song(a.song - 1); pump(2.0); l.stop_song(); pump(0.5)
        l.show_page("clips"); l.pad(0, 0.7) if hasattr(l, "pad") else None; pump(0.3)      # hold: select the clip, no launch
        l.edit_open(0, 0); pump(0.4); l.pad(0); pump(0.3); l.pad(0); pump(0.3)              # a step selected and let go: no change
        l.show_page("overview"); pump(15.0)
        f1 = flash()
        data["saves"]["without_change"] = f1 - f0
        check(f1 == f0 or a.report_only, "nothing changed (six pages visited, the song played and stopped, a clip opened, a step selected): 15 s after, no flash erase or write",
              "%d flash operations" % (f1 - f0))

        # ---- 1. Stop latency ----
        stop_case("SEQ PLAY")
        pages = ["BLUETOOTH", "HOME"]
        def page_change():
            l.key(0, l.PANEL[pages[0]], 1); l.key(0, l.PANEL[pages[0]], 0); pages.reverse()
        # a page change: the pass that draws the new page whole (not interruptible; 12 ms measured) reads the stop after it
        stop_case("a page change (the page key, then SEQ PLAY at once)", before=page_change)
        l.show_page("overview"); pump(0.3)

        # the clip unsaved, and a save sent at once after the stop
        def dirty():
            l.edit_open(0, 0); pump(0.3)
            s = l.steps_state()
            if s.get("selected", 255) != 0:
                l.pad(0); pump(0.2)
            l.key(1, 16, 100); pump(0.1); l.key(1, 16, 0); pump(0.3)
            return l.steps_state()
        saves = []
        def save_now():
            # the save is refused while the transport runs (code 76): asked again until it is taken, as fast as the port goes
            t1 = T.now_ns(); tries = 0; done = None
            while (T.now_ns() - t1) < 400_000_000:
                tries += 1
                try:
                    l.edit_save(); done = T.now_ns(); break
                except T.DeviceError:
                    continue
            saves.append((t1, done))
            return {"save_tries": tries, "save_taken_ms": None if done is None else round((done - t1) / 1e6, 2)}
        rows = []
        for n in range(a.repeats):
            s = dirty()
            if not s.get("dirty"):
                check(False, "the test's note made the clip unsaved", s); break
            l.show_page("overview"); pump(0.2)
            l.play_song(a.song - 1); pump(1.3 + 0.111 * n)
            t0 = T.now_ns()
            l.key(0, l.PANEL["PLAY"], 1)
            extra = save_now()
            l.key(0, l.PANEL["PLAY"], 0)
            pump(1.0)
            row = {"case": "a save at once after the stop", "n": n + 1, "t0": t0}; row.update(extra)
            for port, ev in (("din", din.messages), ("usb", usb)):
                t = first(ev, t0, 0xFC)
                row[port] = None if t is None else round((t - t0) / 1e6, 2)
                c = clock_report(ev, t0 - 400_000_000, t0 + 900_000_000)
                row[port + "_clock"] = c
                # the Stop before the pause the write makes: FC earlier than the start of the longest clock pause
                # (v0.2) the pause is counted from the last clock byte before the write: the Stop leaves within one period after that byte
                row[port + "_stop_before_pause"] = bool(t is not None and c and (c["longest_pause_ms"] < 3 * c["period_ms"] or t <= c["pause_at"] + int((c["period_ms"] + 2.0) * 1e6)))
            rows.append(row); data["stops"].append(row)
            l.stop_song(); pump(0.3)
        if rows:
            d = [r["din"] for r in rows]; u = [r["usb"] for r in rows]
            ok = all(v is not None and v < a.stop_limit for v in d + u)
            check(ok or a.report_only, "Stop with a save sent at once after it (the clip unsaved): FC within %.0f ms, %d times" % (a.stop_limit, len(rows)),
                  "DIN %s ms; USB %s ms; the save taken after %s ms" % (", ".join("?" if v is None else "%.2f" % v for v in d), ", ".join("?" if v is None else "%.2f" % v for v in u),
                                                                      ", ".join(str(r["save_taken_ms"]) for r in rows)))
            pauses = [r["din_clock"]["longest_pause_ms"] if r["din_clock"] else None for r in rows]
            check(all(r["din_stop_before_pause"] and r["usb_stop_before_pause"] for r in rows) or a.report_only,
                  "in each of them the Stop is on the cable before the pause the write makes in the clock", "the clock's pause on DIN: %s ms" % pauses)
            # ---- 2. the clock around those saves ----
            short = [(r["din_clock"] or {}).get("short_intervals_after") for r in rows] + [(r["usb_clock"] or {}).get("short_intervals_after") for r in rows]
            c0 = rows[0]["din_clock"] or {}
            data["clock"] = {"period_ms": c0.get("period_ms"), "din_pauses_ms": pauses, "usb_pauses_ms": [(r["usb_clock"] or {}).get("longest_pause_ms") for r in rows],
                             "din_shortest_after_ms": [(r["din_clock"] or {}).get("shortest_after_ms") for r in rows],
                             "usb_shortest_after_ms": [(r["usb_clock"] or {}).get("shortest_after_ms") for r in rows],
                             "din_bytes_missing": [(r["din_clock"] or {}).get("bytes_missing") for r in rows]}
            check(all(v == 0 for v in short) or a.report_only,
                  "the clock around a save while stopped (period %s ms): after the pause no interval shorter than half a period: no burst" % c0.get("period_ms"),
                  "pause DIN %s ms, USB %s ms; shortest interval after it DIN %s, USB %s ms; clock bytes left out %s; DIN intervals after the first pause: %s"
                  % (pauses, data["clock"]["usb_pauses_ms"], data["clock"]["din_shortest_after_ms"], data["clock"]["usb_shortest_after_ms"],
                     data["clock"]["din_bytes_missing"], c0.get("intervals_after_ms")))
            stop_case("a save (the first stop after it)")
            # A change older than ten seconds when the song stops: the save by itself is due at once, in the pass that
            # sees the stop. Before tabby-v1.3-rc4 it began before the Stop had left (the device's record: a Stop 177.79
            # and 230.46 ms late, flash 1 ms before, the pass before 231.9 ms earlier).
            late_rows = []
            for n in range(2):
                s = dirty()
                l.show_page("overview"); pump(0.2)
                l.play_song(a.song - 1); pump(11.5)
                t0 = T.now_ns()
                l.key(0, l.PANEL["PLAY"], 1); l.key(0, l.PANEL["PLAY"], 0)
                pump(1.5)
                row = {"case": "the stop more than 10 s after a change", "n": n + 1, "t0": t0}
                for port, ev in (("din", din.messages), ("usb", usb)):
                    t = first(ev, t0, 0xFC)
                    row[port] = None if t is None else round((t - t0) / 1e6, 2)
                    row[port + "_clock"] = clock_report(ev, t0 - 400_000_000, t0 + 1_200_000_000)
                late_rows.append(row); data["stops"].append(row)
                l.stop_song(); pump(0.5)
            d = [r["din"] for r in late_rows]; u = [r["usb"] for r in late_rows]
            check(all(v is not None and v < a.stop_limit for v in d + u) or a.report_only,
                  "Stop more than 10 s after a change (the save by itself is due at the stop): FC within %.0f ms, the save after it" % a.stop_limit,
                  "DIN %s ms; USB %s ms; the clock's pause after it DIN %s ms" % (", ".join("?" if v is None else "%.2f" % v for v in d), ", ".join("?" if v is None else "%.2f" % v for v in u),
                                                                              [(r["din_clock"] or {}).get("longest_pause_ms") for r in late_rows]))

        # ---- 3b. a change is saved by itself, once ----
        l.diag(1); pump(0.3); f0 = flash()
        s = dirty()                                              # an odd number of entries so far? this one leaves the note as the repeats left it, toggled once more
        l.show_page("overview"); pump(15.0); f1 = flash(); pump(8.0); f2 = flash()
        data["saves"]["after_change"] = f1 - f0; data["saves"]["then"] = f2 - f1
        check((f1 > f0 and f2 == f1) or a.report_only, "one note changed while stopped: saved by itself within 15 s, and nothing more in the 8 s after",
              "%d flash operations, then %d" % (f1 - f0, f2 - f1))
        # the note was entered and removed --repeats + 3 times: with an odd --repeats the clip is as it was found
        l.show_page("overview"); pump(0.3)
        w = l.worst(True)
        if w:
            print("     worst lateness since power-on: " + T.Link.worst_text(w), flush=True)
            data["worst_boot"] = w
        h = l.health()
        check(h["underruns"] == h0["underruns"] and h["dma_overruns"] == h0["dma_overruns"], "no audio underrun, no DMA overrun during the test")
    finally:
        try:
            l.release_all(); l.stop_song(); l.show_page("overview")
        except Exception:
            pass
        l.close(); din.finish()
    json.dump(data, open(os.path.join(a.out, a.tag + "-stop.json"), "w"), indent=1, default=str)
    bad = sum(1 for ok, _, _ in RESULTS if not ok)
    print("%s stop and clock: %d of %d checks passed%s" % ("PASS" if not bad else "FAIL", len(RESULTS) - bad, len(RESULTS), " (report only: nothing judged)" if a.report_only else ""))
    return 0 if not bad else 1


if __name__ == "__main__":
    sys.exit(main())
