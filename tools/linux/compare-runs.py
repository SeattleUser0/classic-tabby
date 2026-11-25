#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/compare-runs.py — a candidate's release-run tables against the last release's, row by row, before promotion

Purpose (the user's rule of 2026-11-25)
    tabby-v1.5 was promoted while its own bar-line table had gone from 60 of 60 landings (tabby-v1.4) to 36 of 60: the
    step's check only judged presses 12 ms and earlier, the figure "60 of 60" was printed and never compared, and the
    flow promoted by itself (docs/BUILD.md 71.2). Now a full candidate runs with TABBY_NO_PROMOTE=1, this tool compares
    EVERY table of its run with the last release's, and tools/linux/release-flow.sh promotes (TABBY_PROMOTE_ONLY=1)
    only when this tool finds no row worse. A candidate with a worse row is held back, with the row as the reason.

What it compares (files written into the run's directory by tools/linux/hw/rc-validate.py and the tools it runs)
    1. STEPS (<prefix>-results.json). WORSE: a step of the old run that is missing or failed; a step whose count of
       checks or of things compared ("40 of 40", "960 of 960", "9 passes", "19 segments") is lower than before: checks
       that quietly stopped running. The figures of both summaries are printed one under the other, and every
       figure followed by "ms" is compared in its place in the line (rule of 3).
    2. THE BAR LINE (<prefix>-barline.json), per case, by where the pad press was really SENT (not by the lead asked
       for: the leads have changed between releases): before the line; up to --window-in ms after it; the edge; from
       --window-out ms after it. WORSE: inside the window a press that did not land on its line; after the window a
       press that did not wait and land on the next; anywhere a clip without its first note or that never came; a
       side of the window the old run tried and the new one did not. In the edge the two outcomes are counted and a
       press that waited although the old run landed one sent later is marked "look" (the edge moves with what the
       screen is drawing; it is not a row that can be worse).
    3. EVERY OTHER TABLE: each JSON file both runs wrote under the same name (<prefix>-stop.json, the soaks'
       <prefix>-...-soak.json, every <prefix>-...-summary.json and -clips.json, <prefix>-recline.json, the guard's
       guard.json), walked leaf by leaf; the same path in both files is one row.
         times (a key ending in _ms): the largest value of the row.
             WORSE when the new one is more than --slack percent AND more than --floor ms above the old one (defaults
             25 %, 0.5 ms: under that two runs of one firmware differ by themselves; docs/BUILD.md 71.4).
         a list of more than 8 times (one line's notes): its span, largest minus smallest, judged like a time.
         faults (underruns, DMA overruns, overloads, stuck notes, dropped MIDI, CPU guard, missing, extra, bad,
             differences, bytes missing): WORSE when the new count is higher.
         counts of what was seen (matched, expected notes, lines): WORSE when lower.
         NOT compared, by name, each with its reason: see IGNORED below; they are listed at the end of the output
         with how many rows each left out, so that nothing is left out silently.
       A table of the old run that the new run did not write is WORSE.
    4. What the run kept beside the steps (results.json): unanswered remote commands (WORSE when more), tests that left
       another page or track (information: put back by the run), the device's own latest send while a song ran after
       each step (a time, as in 3).

Usage
    python3 -I tools/linux/compare-runs.py --new ../overnight/v17/tabby-v1.5.1-rc2 --old ../overnight/v16/tabby-v1.5-rc3 [--barline-old ../overnight/v15/tabby-v1.4-rc5]
    Exit 0: no row worse (the text is also written to <new>-compare.txt). Exit 1: a row is worse. Exit 2: a file is missing.

Version: 0.2

Revision log
    v0.2  2026-11-25  Every table of the run (the user's second order of the day): all JSON files leaf by leaf, the counts of
                      checks, the grace window's two sides.
    v0.1  2026-11-25  First version: steps and the bar line.
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import argparse
import glob
import json
import os
import re
import sys

# rows that are not compared: key name (or a word of the path) -> the reason
IGNORED = {
    "steer_ppm": "this computer's clock steering, not the device", "bend_ms": "this computer's clock steering", "parted_ms": "this computer's clock steering",
    "din_pauses_ms": "the clock's pause around a save follows how full the sector being written is (87 to 137 ms in runs of one build); judged in the step stop against 170 ms",
    "usb_pauses_ms": "as din_pauses_ms", "din_bytes_missing": "the clock bytes inside that pause: as din_pauses_ms", "longest_pause_ms": "as din_pauses_ms", "bytes_missing": "as din_pauses_ms",
    "save_taken_ms": "how long the save takes: as din_pauses_ms",
    "at_min": "when in the run a segment was taken", "at_ms": "when since power-on the worst send was (a time stamp)",
    "clock_parted_ms": "this computer's clock steering", "clock_bend_ms": "this computer's clock steering", "t_ms": "a time stamp", "tolerance_ms": "a limit, not a result", "deadline_ms": "a constant",
    "band_limit_ms": "a limit", "band_limit_many_ms": "a limit", "period_ms": "the clock's period: the tempo (judged by the clock ratio in the step timing)",
    "remote_ms_before": "a circumstance of the worst send", "panel_ms_before": "a circumstance", "flash_ms_before": "a circumstance",
    "transport_change_ms_before": "a circumstance", "pass_gap_ms": "a circumstance",
    "stopped": "late sends while the song is stopped are the clock alone, during a flash write; reported, not judged (rc-validate, lateness)",
    "sent_before_line_ms": "where the test sent a press (the bar line and SEQ REC tables have their own comparison)", "sent_after_line_ms": "where the test sent a press",
    "first_key_before_line_ms": "where the test sent a press", "lead_ms": "what the test asked for", "offset_ms": "what the test asked for",
    "first_note_after_line_ms": "the bar line table has its own comparison", "old_note_ends_after_new_ms": "judged in the bar-line step against 3 ms",
}
FAULTS = ("underruns", "dma_overruns", "overloads", "stuck", "midi_dropped", "cpu_guard", "missing", "extra", "bad", "differences", "din_usb_differences", "din_bytes_missing", "usb_bytes_missing")
SEEN = ("matched", "expected_notes", "lines")
OWN_TABLE = ("-barline.json", "-results.json")


def load(path):
    try:
        return json.load(open(path, encoding="utf-8"))
    except (OSError, ValueError) as e:
        print("compare-runs: cannot read %s: %s" % (path, e))
        sys.exit(2)


def flatten(node, path, out):
    """Every numeric leaf under its path without list places: {path: [values]}; a list of more than 8 numbers is one row, its span."""
    if isinstance(node, dict):
        for k, v in node.items():
            flatten(v, path + (str(k),), out)
    elif isinstance(node, list):
        nums = [x for x in node if isinstance(x, (int, float)) and not isinstance(x, bool)]
        if len(nums) > 8 and len(nums) == len(node):
            out.setdefault(path + ("(span)",), []).append(max(nums) - min(nums))
        else:
            for v in node:
                flatten(v, path, out)
    elif isinstance(node, bool):
        return
    elif isinstance(node, (int, float)):
        out.setdefault(path, []).append(node)
    elif isinstance(node, str) and path and path[-1] in FAULTS and node:
        out.setdefault(path, []).append(1)       # a fault told in words counts as one


def kind(path):
    names = [p for p in path if p != "(span)"]
    for p in names:
        if p in IGNORED:
            return "ignored", p
    last = names[-1] if names else ""
    if last in FAULTS or (path[-1] != "(span)" and any(last == f for f in FAULTS)):
        return "fault", last
    if last in SEEN:
        return "seen", last
    if last.endswith("_ms"):
        return "time", last
    return "other", last


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--new", required=True, help="path prefix of the candidate's files, e.g. ../overnight/v17/tabby-v1.5.1-rc2")
    p.add_argument("--old", required=True, help="path prefix of the last release's run")
    p.add_argument("--barline-old", default="", help="another prefix for the bar-line table (the last release whose bar line was right)")
    p.add_argument("--slack", type=float, default=25.0, help="percent a time may be above the old one")
    p.add_argument("--floor", type=float, default=0.5, help="ms a time may be above the old one whatever the percent")
    p.add_argument("--window-in", type=float, default=3.0)
    p.add_argument("--window-out", type=float, default=24.0)
    a = p.parse_args()
    out = []; worse = []; look = []

    def say(s=""):
        out.append(s)

    def time_worse(new, old):
        return new > old * (1 + a.slack / 100.0) and new - old > a.floor

    new = load(a.new + "-results.json"); old = load(a.old + "-results.json")
    say("NEW %s-rc%s build %s   OLD %s-rc%s build %s" % (new.get("tag"), new.get("rc"), str(new.get("device_build") or new.get("build"))[:16], old.get("tag"), old.get("rc"), str(old.get("device_build") or old.get("build"))[:16]))

    # ---- 1. steps
    say(); say("1. STEPS")
    ns = {s["step"]: s for s in new["steps"]}
    count_re = r"(\d+) (?:of \d+ )?(checks passed|note-ons matched|pictures|passes|segments|landing)"
    ms_re = r"(-?\d+(?:\.\d+)?)(?=(?:[,/ ]| to | / )*[-\d., /to]*ms)"
    for s in old["steps"]:
        n = ns.get(s["step"])
        if n is None:
            worse.append("step %s: in the old run, not in the new one" % s["step"]); say("WORSE %-13s missing in the new run" % s["step"]); continue
        mark = "ok   "
        if not n["pass"]:
            mark = "WORSE"; worse.append("step %s failed" % s["step"])
        oc = re.findall(count_re, s["summary"]); nc = re.findall(count_re, n["summary"])
        for (ov, what), (nv, what2) in zip(oc, nc):
            if what == what2 and what != "landing" and int(nv) < int(ov):
                mark = "WORSE"; worse.append("step %s: %s %s, before %s: checks or rows that no longer run" % (s["step"], nv, what, ov))
        of = [float(x) for x in re.findall(ms_re, s["summary"])]; nf = [float(x) for x in re.findall(ms_re, n["summary"])]
        if s["step"] != "lateness" and of and len(of) == len(nf):
            grown = [(i, o_, n_) for i, (o_, n_) in enumerate(zip(of, nf)) if time_worse(n_, o_)]
            for i, o_, n_ in grown:
                mark = "WORSE"; worse.append("step %s: figure %d of its line is %.2f ms, before %.2f" % (s["step"], i + 1, n_, o_))
        elif s["step"] != "lateness" and of and nf and time_worse(max(nf), max(of)):
            mark = "WORSE"; worse.append("step %s: its largest figure is %.2f ms, before %.2f (the lines differ in shape: largest against largest)" % (s["step"], max(nf), max(of)))
        say("%s %-13s old: %s" % (mark, s["step"], s["summary"][:400])); say("      %-13s new: %s" % ("", n["summary"][:400]))
    for name in ns:
        if name not in {s["step"] for s in old["steps"]}:
            say("new   %-13s new: %s%s" % (name, "" if ns[name]["pass"] else "FAILED: ", ns[name]["summary"][:400]))
            if not ns[name]["pass"]:
                worse.append("step %s failed" % name)

    # ---- 2. the bar line
    say(); say("2. THE BAR LINE (by where the pad press was really sent; ms after the line)")
    nb = load(a.new + "-barline.json")["rows"]; ob = load((a.barline_old or a.old) + "-barline.json")["rows"]
    say("   old table: %s" % ((a.barline_old or a.old) + "-barline.json"))
    zones = (("before the line", -1e9, 0.0, "land"), ("inside the window, 0 to %.0f after" % a.window_in, 0.0, a.window_in + 1e-9, "land"),
             ("the edge, %.0f to %.0f after" % (a.window_in, a.window_out), a.window_in + 1e-9, a.window_out, "either"), ("after the window, %.0f or more after" % a.window_out, a.window_out, 1e9, "wait"))
    for case in sorted({r["case"] for r in ob} | {r["case"] for r in nb}):
        o = [r for r in ob if r["case"] == case]; n = [r for r in nb if r["case"] == case]
        if o and not n:
            worse.append("bar line, %s: not measured in the new run" % case); say("WORSE %s: not measured in the new run" % case); continue
        o_latest = max((-r["sent_before_line_ms"] for r in o if r["landed"]), default=None)
        say("   %s (the old run's latest landed press: %s ms after the line)" % (case, "-" if o_latest is None else "%.1f" % o_latest))
        for label, lo, hi, want in zones:
            oo = [r for r in o if lo <= -r["sent_before_line_ms"] < hi]; nn = [r for r in n if lo <= -r["sent_before_line_ms"] < hi]
            other = [r for r in nn if not r["landed"] and not r["waited_a_cycle"]]
            wrong = [r for r in nn if (want == "land" and not r["landed"]) or (want == "wait" and not r["waited_a_cycle"])] if want != "either" else other
            mark = "ok   "; note = ""
            if wrong:
                mark = "WORSE"; note = "   NOT AS IT MUST BE: sent %s ms after the line" % ", ".join("%.1f" % -r["sent_before_line_ms"] for r in wrong)
                worse.append("bar line, %s, %s: %d press(es) did not %s (sent %s ms after the line)" % (case, label, len(wrong), {"land": "land on the line with the first note", "wait": "wait for the next line and land there", "either": "land or wait: another outcome"}[want],
                                                                                                   ", ".join("%.1f" % -r["sent_before_line_ms"] for r in wrong)))
            elif oo and not nn and want != "either":
                mark = "WORSE"; note = "   the old run tried this side, the new one did not"
                worse.append("bar line, %s, %s: not tried in the new run (%d presses in the old one)" % (case, label, len(oo)))
            elif want == "either" and o_latest is not None:
                early = [r for r in nn if r["waited_a_cycle"] and -r["sent_before_line_ms"] <= o_latest]
                if early:
                    mark = "look "; look.append("bar line, %s, the edge: %d press(es) waited although sent no later than one the old run landed (%s against %.1f ms after the line)" % (
                        case, len(early), ", ".join("%.1f" % -r["sent_before_line_ms"] for r in early), o_latest))
            say("%s   %-34s old: %2d landed, %2d waited, %2d other of %2d   new: %2d landed, %2d waited, %2d other of %2d%s" % (
                mark, label, sum(r["landed"] for r in oo), sum(r["waited_a_cycle"] for r in oo), sum(1 for r in oo if not r["landed"] and not r["waited_a_cycle"]), len(oo),
                sum(r["landed"] for r in nn), sum(r["waited_a_cycle"] for r in nn), len(other), len(nn), note))
        headless = [r for r in n if r.get("landed_without_first_note")]
        if headless:
            say("        %d of the 'other' are clips that landed without the first note" % len(headless))

    # ---- 3. every other table
    say(); say("3. EVERY OTHER TABLE (the same file name and the same path in both runs is one row)")
    odir, opre = os.path.split(a.old); ndir, npre = os.path.split(a.new)
    pairs = []
    for f in sorted(glob.glob(os.path.join(odir, opre + "-*.json"))):
        suffix = os.path.basename(f)[len(opre):]
        if suffix.endswith(OWN_TABLE):
            continue
        pairs.append((suffix, f, os.path.join(ndir, npre + suffix)))
    pairs.append(("guard.json", os.path.join(odir, "guard-" + opre, "guard.json"), os.path.join(ndir, "guard-" + npre, "guard.json")))
    for f in sorted(glob.glob(os.path.join(ndir, npre + "-*.json"))):
        suffix = os.path.basename(f)[len(npre):]
        if not suffix.endswith(OWN_TABLE) and not os.path.exists(os.path.join(odir, opre + suffix)):
            say("new   %s: a table the old run did not write (nothing to compare it with)" % suffix)
    rows = 0; left_out = {}; others = {}
    # v0.2: the files of one family (the 19 segments of a soak, the 9 passes of the song soak, the three one-line runs)
    # are ONE table: a row is the largest value over the family. Segment against segment, the largest of 8000 events
    # in two minutes differs by itself (tried on tabby-v1.5-rc3 against tabby-v1.4-rc5: 24 "worse" rows, none in the
    # family's own largest).
    families = {}
    for suffix, fo, fn in pairs:
        if not os.path.exists(fo):
            continue
        if not os.path.exists(fn):
            worse.append("table %s: written by the old run, not by the new one" % suffix); say("WORSE %s: not written by the new run" % suffix); continue
        fam = re.sub(r"-\d+(?=-)", "-NN", suffix).lstrip("-")
        f_ = families.setdefault(fam, [{}, {}, 0])
        flatten(load(fo), (), f_[0]); flatten(load(fn), (), f_[1]); f_[2] += 1
    for fam, (fo_, fn_, files) in sorted(families.items()):
        bad_here = []; n_here = 0
        for path, ov in sorted(fo_.items()):
            what, name = kind(path)
            if what == "ignored":
                left_out[name] = left_out.get(name, 0) + 1; continue
            if what == "other":
                others[name] = others.get(name, 0) + 1; continue
            nv = fn_.get(path)
            if nv is None:
                bad_here.append("%s: in the old table, not in the new one" % "/".join(path)); continue
            n_here += 1
            if what == "time" and time_worse(max(nv), max(ov)):
                bad_here.append("%s: %.2f ms, before %.2f" % ("/".join(path), max(nv), max(ov)))
            elif what == "fault" and max(nv) > max(ov):
                bad_here.append("%s: %s, before %s" % ("/".join(path), max(nv), max(ov)))
            elif what == "seen" and sum(nv) < sum(ov):
                bad_here.append("%s: %s in all, before %s" % ("/".join(path), sum(nv), sum(ov)))
        rows += n_here
        say("%s %-34s %3d rows compared%s%s" % ("WORSE" if bad_here else "ok   ", fam, n_here, " (%d files, the largest of each row)" % files if files > 1 else "", "".join("\n        " + x for x in bad_here)))
        worse.extend("table %s: %s" % (fam, x) for x in bad_here)

    # ---- 4. what the run kept beside the steps
    say(); say("4. KEPT BESIDE THE STEPS")
    ou, nu = len(old.get("unanswered_commands") or []), len(new.get("unanswered_commands") or [])
    say("%s unanswered remote commands: %d, before %d" % ("WORSE" if nu > ou else "ok   ", nu, ou))
    if nu > ou:
        worse.append("unanswered remote commands: %d, before %d" % (nu, ou))
    say("info  tests that left another page or track selected (put back by the run): %d, before %d" % (len(new.get("left_by_tests") or []), len(old.get("left_by_tests") or [])))
    run_late = lambda r: max([o_["worst_boot"]["running"]["late_ms"] for o_ in (r.get("own_lateness_by_step") or []) if o_.get("worst_boot")] or [0.0])
    ol, nl = run_late(old), run_late(new)
    say("%s the device's own latest send while a song ran, the largest after any step: %.2f ms, before %.2f" % ("WORSE" if time_worse(nl, ol) else "ok   ", nl, ol))
    if time_worse(nl, ol):
        worse.append("the device's own latest send while a song ran: %.2f ms, before %.2f" % (nl, ol))
    os_, ns_ = (old.get("timing_song_scenes") or [{}])[-1].get("scenes"), (new.get("timing_song_scenes") or [{}])[-1].get("scenes")
    say("%s the timing songs' scenes at the end: %s, before %s" % ("WORSE" if os_ != ns_ else "ok   ", ns_, os_))
    if os_ != ns_:
        worse.append("the timing songs' scenes: %s, before %s" % (ns_, os_))

    say(); say("%d rows of the other tables compared. Not compared, by name (rows): %s" % (rows, "; ".join("%s (%d): %s" % (k, v, IGNORED[k]) for k, v in sorted(left_out.items())) or "none"))
    say("Numbers that are neither a time, a fault nor a count of what was seen (rows; settings, places, ids): %s" % (", ".join("%s (%d)" % kv for kv in sorted(others.items())) or "none"))
    say()
    for x in look:
        say("LOOK: " + x)
    for x in worse:
        say("WORSE: " + x)
    say("%s compare: %d row(s) worse than %s, %d to look at" % ("PASS" if not worse else "FAIL", len(worse), old.get("tag"), len(look)))
    text = "\n".join(out) + "\n"
    sys.stdout.write(text)
    try:
        open(a.new + "-compare.txt", "w", encoding="utf-8").write(text)
    except OSError:
        pass
    return 0 if not worse else 1


if __name__ == "__main__":
    sys.exit(main())
