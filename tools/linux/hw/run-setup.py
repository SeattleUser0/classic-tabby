#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/run-setup.py — tabby-v04.10 on the device: the CLIP SETTING page, the click, the count-in, a stored scene

Purpose
    docs/CONTROL-MAP.md sections 14 to 16, checked on the device with nobody at the panel. Buttons, pads, keys and knobs
    are remote panel events (command 29 op 6); the 4th left button, which cannot be injected, is remote op 16; the page
    is read back with op 17. What the device plays is read from its TRS MIDI out on the DIN input, and the internal
    click from the audio interface. The song must be the one of tools/linux/hw/clips-song.mjs imported with
    {"record":"scenes","loop":true,"rowSteps":16}; the run adds two clips and one scene to it and saves them (import the
    song again for a clean start).

    Checked: EDIT on an empty pad makes a clip; CLIP SETTING opens on it; LENGTH 16 to 8 steps is heard (the clip's note
    twice a cycle); a scene pad held stores what plays, and recalling it plays it; the save; COPY TO PAD; the song's
    click as a MIDI note in time with the song, the count-in before a take with the song's Start after it; the internal
    click on the audio output; everything switched off again at the end; the audio counters.

Usage (browser closed)
    ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/run-setup.py --song N --out DIR

Version: 0.11

Revision log
    v0.11 2026-11-17  tabby-v04.19: STEP SIZE 1/8 heard on MIDI out.
    v0.10 2026-11-17  tabby-v04.17: SHUFFLE and PLAY QUANTIZE heard on MIDI out (a second note 150 units late on step 2);
                      DELETE CLIP is found from the number of lines, not by a fixed index.
    v0.9  2026-11-17  Two more tool errors, found in the tabby-v04.15-rc2 run: the takes of the click checks ran on clip 1,
                      which the scenes leave after two bars (the take ends by design; the tool's next REC armed one), and
                      the K1 check assumed the knob's value of a fresh start. The internal-click check reports what the
                      device did during the capture (selection, take, count-in, notes).
    v0.8  2026-11-17  A tool error in the tabby-v04.15-rc1 run: FX opens CLIP SETTING on its first line, so after going to
                      CLIPS and back the tool turned LENGTH instead of TRANSPOSE and pressed the 4th left button on
                      the wrong line; the copy stayed, was still reserved, and its notes hid the internal click.
    v0.7  2026-11-17  tabby-v04.15: TRANSPOSE heard on MIDI out; DELETE CLIP asks twice, refuses a clip a scene uses, deletes
                      the copy; the song's lines are addressed from the end of the list.
    v0.6  2026-11-17  tabby-v04.14: CLICK LEVEL measured on the audio output at LOW, MID and HIGH; the controller number of
                      K1 set on the second page and seen on MIDI out.
    v0.5  2026-11-16  tabby-v04.13: the page's lines moved again (PROGRAM, BANK MSB, BANK LSB follow TIMES).
    v0.4  2026-11-16  The internal click is found against the noise floor, not against the loudest sound (the song's notes are
                      eight times louder than the click and hid it in the second device run).
    v0.3  2026-11-16  Two tool errors of the first device run: the cycle was taken from MIDI clock pulses that included the
                      time before PLAY (it is now twice the note spacing of the 8-step clip), and the internal click
                      was looked for on inputs 1 and 2 with a capture that ended early (now arecord, inputs 3 and 4,
                      where the SMK-37 is). The count-in must end within 1 ms of the beat (tabby-v04.11).
    v0.2  2026-11-16  tabby-v04.11: the page's lines moved (the chain's three lines follow LENGTH).
    v0.1  2026-11-16  First version.
"""
import argparse
import json
import os
import struct
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tabby_link as T

RESULTS = []
K1, K2, K5 = 0, 1, 4


def check(ok, what, detail=""):
    RESULTS.append({"pass": bool(ok), "what": what, "detail": str(detail)})
    print("%s %s%s" % ("PASS" if ok else "FAIL", what, (" (" + str(detail) + ")") if detail != "" else ""), flush=True)
    return ok


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--song", type=int, required=True)
    p.add_argument("--din", default="H4MIDI-WC Port 1")
    p.add_argument("--no-audio", action="store_true", help="skip the internal click on the audio interface")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    din = T.Monitor(a.din); din.start()
    l = T.Link()
    measured = {}

    def idle(seconds):
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            l.messages(20)

    def since(t, pred):
        return [(x, m) for x, m in list(din.messages) if x > t and pred(m)]

    def row(n):
        s = l.setup_state()
        if n >= 8:
            n += s["rows"] - 18          # v0.7: the song's lines are the last ten; lines added to the clip's page move them
        if n != s["row"]:
            l.knob(K5, n - s["row"]); idle(0.2)

    def setting(row_index, name, want):
        row(row_index)
        for _ in range(140):
            v = l.setup_state()[name]
            if v == want:
                return True
            l.knob(K1, 1 if want > v else -1); idle(0.06)
        return False

    try:
        for _ in range(4):
            try:
                l.remote_status(); break
            except Exception:
                time.sleep(0.3)
        l.release_all(); l.stop_song(); idle(0.5)
        l.edit_discard()
        l.show_page("overview")
        l.select_song(a.song - 1); idle(0.3)
        h0 = l.health()
        l.press("BLUETOOTH"); idle(0.4)
        c = l.clips_state()
        if c["track"] != 0:
            l.shift_pad(0); idle(0.3); c = l.clips_state()
        empty = next((i for i, q in enumerate(c["pads"]) if (q["code"] & 7) == 0), None)
        if not check(c["page_name"] == "CLIPS" and empty is not None, "CLIPS, track 1, an empty pad", (c["page_name"], empty)):
            return 1
        # ---- a new clip by EDIT on the empty pad, one note on its first step ----
        l.pad(empty); idle(0.3); l.press("EDIT"); idle(0.4); s = l.steps_state()
        check(s["page_name"] == "STEP" and s["place"] == empty and s["steps"] == 16 and s["events"] == 0 and s["dirty"], "EDIT on the empty pad: a new clip of 16 steps, open on the STEP page, unsaved", (s["page_name"], s["steps"], s["events"]))
        if s["toggle"]:
            l.press("SCL"); idle(0.2)
        l.pad(0); idle(0.2); l.play_key(12, 0.1); idle(0.3); s = l.steps_state()
        pitch = s["notes"][0]["pitch"] if s["notes"] else None
        check(s["events"] == 1 and pitch is not None, "a key puts a note on step 1", s["notes"])
        l.press("EDIT"); idle(0.3)
        # ---- CLIP SETTING: LENGTH ----
        l.press("FX"); idle(0.4); u = l.setup_state()
        check(u["page_name"] == "SETTING" and u["place"] == empty and u["steps"] == 16 and u["row"] == 0, "FX on CLIPS opens CLIP SETTING on the clip", (u["page_name"], u["place"], u["steps"]))
        l.knob(K1, -8); idle(0.3); u = l.setup_state()
        check(u["steps"] == 8, "K1: LENGTH 8 steps", u["steps"])
        l.press("FX"); idle(0.3); l.pad(empty); idle(0.3)
        mark = time.monotonic_ns()
        l.press("PLAY"); idle(6.5)
        ch = None
        hits = []
        for t, m in since(mark, lambda m: len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2] and m[1] == pitch):
            ch = m[0] & 15 if ch is None else ch
            if (m[0] & 15) == ch:
                hits.append(t)
        gaps = [(y - x) / 1e6 for x, y in zip(hits, hits[1:])]
        cycle = 2.0 * sorted(gaps[1:])[len(gaps[1:]) // 2] if len(gaps) >= 4 else None     # v0.3: from the notes themselves
        ok = len(gaps) >= 4 and cycle and all(abs(g - cycle / 2) <= 3.0 for g in gaps)
        check(ok, "the 8-step clip loops twice a cycle: its note every half cycle (%.2f ms by the device's MIDI clock)" % ((cycle or 0) / 2), ["%.2f" % g for g in gaps[:6]])
        measured["cycle_ms"] = round(cycle or 0, 3); measured["clock_ratio"] = round((cycle or 0) / 2000.0, 6)
        # ---- a stored scene ----
        l.press("SCL"); idle(0.4); c = l.clips_state(); before = l.setup_state()["scenes"]
        free = next((i for i, q in enumerate(c["pads"]) if (q["code"] & 7) == 0), None)
        if check(c["page_name"] == "SONG" and free is not None, "SCENES: an empty scene pad", (c["page_name"], free)):
            l.pad(free, hold=0.15); idle(0.3)
            check(l.setup_state()["scenes"] == before, "a short press stores nothing")
            l.pad(free, hold=0.8); idle(0.3); u = l.setup_state()
            check(u["scenes"] == before + 1 and u["unsaved"], "the pad held: what plays is stored as scene %d" % (before + 1), u["scenes"])
            l.pad(0); idle(cycle / 1000.0 + 0.3 if cycle else 2.5)          # scene 1: track 1 leaves the new clip
            l.pad(before % 16); idle((cycle or 2000.0) / 1000.0 * 2 + 0.3)
            st = l.remote_status(); t1 = time.monotonic_ns(); idle((cycle or 2000.0) / 1000.0 * 2)
            again = [t for t, m in since(t1, lambda m: len(m) == 3 and m[0] == (0x90 | (ch or 0)) and m[1] == pitch and m[2])]
            check(st["row"] == before and len(again) >= 3, "the new scene recalled: it plays, track 1 on the new clip", (st["row"], len(again)))
        refused = False
        try:
            l.edit_save()
        except T.DeviceError:
            refused = True
        check(refused, "a save while the song plays is refused")
        l.press("PLAY"); idle(0.8)
        l.edit_save(); idle(0.6); u = l.setup_state()
        check(not u["unsaved"], "stopped: the clip and the song are saved")
        # ---- COPY TO PAD ----
        l.press("SCL"); idle(0.3)
        c = l.clips_state()
        if c["selected"] != empty:
            l.pad(empty); idle(0.2); l.pad(empty); idle(0.2)
        l.press("FX"); idle(0.4); row(7); u = l.setup_state()
        target = u["to"]
        l.setup_do(); idle(0.4); u2 = l.setup_state(); l.press("FX"); idle(0.3); c = l.clips_state()
        check(u["row"] == 7 and target != empty and u2["place"] == target and u2["steps"] == 8 and u2["unsaved"] and (c["pads"][target % 16]["code"] & 7) == 1,
              "COPY TO PAD %d: the copy is there (8 steps), open and unsaved" % (target + 1), (u2["place"], u2["steps"], u2["unsaved"]))
        l.edit_save(); idle(0.6)
        check(not l.setup_state()["unsaved"], "the copy is saved")
        # ---- tabby-v04.15: TRANSPOSE on the copy, heard; DELETE CLIP ----
        if l.setup_state().get("transpose") is not None:
            l.press("FX"); idle(0.4); l.knob(K5, 8 - l.setup_state()["row"]); idle(0.3)   # line 9, TRANSPOSE, follows COPY TO PAD
            l.knob(K1, 3); idle(0.3); u = l.setup_state()
            l.press("FX"); idle(0.3); l.pad(target % 16); idle(0.3)
            mark = time.monotonic_ns()
            l.press("PLAY"); idle(4.5)
            ups = [m[1] for _, m in since(mark, lambda m: len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2] and (m[0] & 15) == ch)]
            l.press("PLAY"); idle(0.8)
            check(u["transpose"] == 3 and u["place"] == target and ups and all(x == pitch + 3 for x in ups), "TRANSPOSE +3 on the copy: its note plays three semitones up", (u["transpose"], pitch, ups[:6]))
            # FX opens the page on its first line each time (v0.8: the first device run turned LENGTH instead)
            l.press("FX"); idle(0.4); l.knob(K5, 8 - l.setup_state()["row"]); idle(0.3); l.knob(K1, -3); idle(0.3)
            check(l.setup_state()["row"] == 8 and l.setup_state()["transpose"] == 0, "TRANSPOSE back to 0")
            l.edit_save(); idle(0.6)
            # ---- tabby-v04.17: SHUFFLE and PLAY QUANTIZE on the copy, heard: a second note on step 2, 150 units late ----
            if l.setup_state().get("shuffle") is not None:
                l.press("FX"); idle(0.3); l.press("EDIT"); idle(0.4); s = l.steps_state()
                if s["toggle"]:
                    l.press("SCL"); idle(0.2)
                l.pad(1); idle(0.2); l.play_key(14, 0.1); idle(0.3); l.knob(2, 15); idle(0.3); s = l.steps_state()
                second = s["notes"][0] if s["notes"] else {}
                check(s["page_name"] == "STEP" and s["place"] == target and second.get("start") == 150 and second.get("pitch") not in (None, pitch),
                      "STEP page: a second note on step 2 of the copy, moved 150 units late", (s["place"], second))
                l.pad(1); idle(0.2); l.press("EDIT"); idle(0.3)

                def gap(seconds=4.5):
                    """Launch the copy, play: the median time from the first note to the second, in ms."""
                    l.pad(target % 16); idle(0.3)
                    mark = time.monotonic_ns()
                    l.press("PLAY"); idle(seconds)
                    ons = since(mark, lambda m: len(m) == 3 and m[0] == (0x90 | ch) and m[2] and m[1] in (pitch, second.get("pitch")))
                    l.press("PLAY"); idle(0.8)
                    d = [(tb - ta) / 1e6 for (ta, ma), (tb, mb) in zip(ons, ons[1:]) if ma[1] == pitch and mb[1] == second.get("pitch")]
                    return sorted(d)[len(d) // 2] if len(d) >= 3 else -1.0

                def feel(shuffle, quantize):
                    l.press("FX"); idle(0.4); l.knob(K5, 9 - l.setup_state()["row"]); idle(0.3)
                    d = shuffle - l.setup_state()["shuffle"]
                    if d:
                        l.knob(K1, d); idle(0.3)
                    l.knob(K5, 1); idle(0.3)
                    d = quantize - l.setup_state()["quantize"]
                    if d:
                        l.knob(K1, d); idle(0.3)
                    u = l.setup_state(); l.press("FX"); idle(0.3)
                    return u

                g0 = gap()
                u1 = feel(51, 0); g1 = gap()
                u2 = feel(0, 1); g2 = gap()
                u3 = feel(0, 0)
                measured["feel_gap_ms"] = [round(g0, 2), round(g1, 2), round(g2, 2)]
                # 120 BPM: a step is 125 ms. As recorded 630 units (164.1 ms); SHUFFLE 50: 795 units (207.0 ms); PLAY QUANTIZE 1/16: 480 units (125.0 ms)
                check(abs(g0 - 164.1) <= 3.0, "as recorded the second note comes 164 ms after the first", "%.2f ms" % g0)
                check(u1["row"] == 10 and u1["shuffle"] == 51 and abs(g1 - 207.0) <= 3.0, "SHUFFLE 50 PERCENT: it comes 207 ms after the first", (u1["shuffle"], "%.2f ms" % g1))
                check(u2["shuffle"] == 0 and u2["quantize"] == 1 and abs(g2 - 125.0) <= 3.0, "SHUFFLE SONG, PLAY QUANTIZE 1/16: it plays on its step, 125 ms after the first", (u2["quantize"], "%.2f ms" % g2))
                check(u3["shuffle"] == 0 and u3["quantize"] == 0, "both back to SONG and OFF", (u3["shuffle"], u3["quantize"]))
                # ---- tabby-v04.19: STEP SIZE 1/8: the 8-step copy plays 16 sixteenths; 630 units become 1260 (328.1 ms) ----
                if l.setup_state().get("scale") is not None:
                    def size(want):
                        l.press("FX"); idle(0.4); l.knob(K5, 11 - l.setup_state()["row"]); idle(0.3)
                        for _ in range(5):
                            now = l.setup_state()["scale"]
                            if now == want:
                                break
                            l.knob(K1, 1 if want > now else -1); idle(0.3)
                        u = l.setup_state(); l.press("FX"); idle(0.3)
                        return u
                    u4 = size(1); g4 = gap(8.5)
                    u5 = size(0)
                    measured["step_size_gap_ms"] = round(g4, 2)
                    check(u4["row"] == 11 and u4["scale"] == 1 and abs(g4 - 328.1) <= 3.0, "STEP SIZE 1/8: every step lasts an 8th: the second note 328 ms after the first", (u4["scale"], "%.2f ms" % g4))
                    check(u5["scale"] == 0, "STEP SIZE back to 1/16", u5["scale"])
                l.edit_save(); idle(0.6)
                l.press("FX"); idle(0.4)
            D = l.setup_state()["rows"] - 11                                           # v0.10: DELETE CLIP is the last line before the song's ten
            l.knob(K5, D - l.setup_state()["row"]); idle(0.3)                          # DELETE CLIP
            l.setup_do(); idle(0.4); l.press("FX"); idle(0.3); c1 = l.clips_state()
            l.press("FX"); idle(0.4); l.knob(K5, D - l.setup_state()["row"]); idle(2.4)   # more than two seconds after the first press
            l.setup_do(); idle(0.3); l.setup_do(); idle(0.4); l.press("FX"); idle(0.3); c2 = l.clips_state()
            check((c1["pads"][target % 16]["code"] & 7) != 0 and (c2["pads"][target % 16]["code"] & 7) == 0 and l.setup_state()["unsaved"],
                  "DELETE CLIP: one press only asks, two presses delete the copy; the song is unsaved", (c1["pads"][target % 16]["code"], c2["pads"][target % 16]["code"]))
            l.pad(0); idle(0.2); l.pad(0); idle(0.2)                                     # clip 1 is used by scene 1
            l.press("FX"); idle(0.4); l.knob(K5, D - l.setup_state()["row"]); idle(0.3)
            l.setup_do(); idle(0.3); l.setup_do(); idle(0.4); l.press("FX"); idle(0.3); c3 = l.clips_state()
            check((c3["pads"][0]["code"] & 7) != 0, "a clip a scene uses is not deleted", c3["pads"][0]["code"])
            l.edit_save(); idle(0.6)
            check(not l.setup_state()["unsaved"], "saved without the copy")
            # v0.9: the takes below need a clip no scene of the first bars uses (a take on clip 1 ends by design when the
            # song reaches scene 3, and the next REC press then arms a take instead of stopping one): the clip made above
            l.pad(empty % 16); idle(0.2)
            if l.clips_state()["selected"] != empty or (l.clips_state()["pads"][empty % 16]["code"] & 7) == 3:
                l.pad(empty % 16); idle(0.2)
        # ---- the click as a MIDI note, and the count-in ----
        l.press("FX"); idle(0.4)
        ok = setting(8, "count_in", 1) and setting(9, "click", 2) and setting(10, "click_out", 1) and setting(11, "click_ch", 15)
        u = l.setup_state()
        check(ok and u["click_note"] == 37, "the song's settings: COUNT-IN 1 cycle, CLICK ALWAYS, MIDI NOTE, channel 16 (note 37)", (u["count_in"], u["click"], u["click_out"], u["click_ch"], u["click_note"]))
        l.press("FX"); idle(0.3)
        l.press("REC"); idle(0.4)
        mark = time.monotonic_ns()
        l.press("PLAY"); idle(1.0)
        counting = l.setup_state()["counting"]
        idle((cycle or 2000.0) / 1000.0 * 3)
        clicks = [(t, m[2]) for t, m in since(mark, lambda m: len(m) == 3 and m[0] == 0x9F and m[1] == 37 and m[2])]
        start = [t for t, m in since(mark, lambda m: list(m) == [0xFA])]
        beat = (cycle or 2000.0) / 4
        if check(len(clicks) >= 10 and start, "clicks on channel 16 and the song's Start", (len(clicks), len(start))):
            pre = [t for t, _ in clicks if t < start[0] - 20_000_000]
            lead = (start[0] - clicks[0][0]) / 1e6
            check(len(pre) == 4 and clicks[0][1] == 127 and clicks[1][1] == 90 and abs(lead - (cycle or 2000.0)) <= 1.5 and 1 <= counting <= 4,
                  "the count-in: four clicks, the first louder, then MIDI Start one cycle after the first click", "%d clicks, %.2f ms, %d beats left after 1 s" % (len(pre), lead, counting))
            res = [((t - clicks[0][0]) / 1e6 + beat / 2) % beat - beat / 2 for t, _ in clicks]
            band = max(res) - min(res)
            check(band <= 4.0, "every click on its quarter note, the count-in and the song on one grid", "band %.2f ms over %d clicks" % (band, len(clicks)))
            measured["click_band_ms"] = round(band, 2); measured["count_in_lead_ms"] = round(lead, 2)
        l.press("REC"); idle(0.3)
        l.press("PLAY"); idle(0.8)
        # ---- the internal click on the audio output ----
        l.press("FX"); idle(0.4)
        ok = setting(10, "click_out", 0)
        l.press("FX"); idle(0.3)
        if not a.no_audio:
            import subprocess, wave

            def capture(name):
                """A count-in recorded from the audio interface: (onsets in ms, the first click's peak)."""
                wav = os.path.join(a.out, name)
                rec = subprocess.Popen(["arecord", "-q", "-D", "hw:AUDIO4c", "-c", "8", "-f", "S32_LE", "-r", "48000", "-d", "6", wav])
                idle(1.0)
                m0 = time.monotonic_ns(); before = l.clips_state(); st0 = l.steps_state()
                l.press("REC"); idle(0.3); st1 = l.steps_state(); l.press("PLAY"); idle(0.6); cnt = l.setup_state()["counting"]; idle((cycle or 2000.0) / 1000.0 + 0.4)
                l.press("REC"); idle(0.2); l.press("PLAY"); idle(0.5)
                rec.wait()
                # v0.9: what the device did during the capture, for the check's detail line
                seen = [(round((x - m0) / 1e6), m[0], m[1]) for x, m in since(m0, lambda m: len(m) == 3 and (m[0] & 0xF0) == 0x90 and m[2])]
                capture.detail = "selected pad %s, recording %s -> %s after REC, count-in beats left %s, notes on DIN (ms, status, note) %s" % (
                    before["selected"], st0.get("recording"), st1.get("recording"), cnt, seen[:10])
                w = wave.open(wav); n = w.getnframes(); raw = w.readframes(n)
                x = struct.unpack("<%di" % (n * 8), raw)
                onsets = []; peak = 0
                for cnum in (2, 3):
                    v = x[cnum::8]; win = 48                    # 1 ms
                    env = [max(abs(q) for q in v[i:i + win]) >> 16 for i in range(0, n - win, win)]
                    thr = max(6 * sorted(env)[len(env) // 2], 600)
                    on = []; last = -1000
                    for i, e in enumerate(env):
                        if e > thr and i - last > 200:
                            on.append(i)
                        if e > thr:
                            last = i
                    if len(on) > len(onsets):
                        onsets = on
                        peak = max(env[on[1]:on[1] + 30]) if len(on) > 1 else 0     # the second click: not the louder first of the cycle
                return onsets, peak

            onsets, mid = capture("click.wav")
            gaps = [y - x for x, y in zip(onsets, onsets[1:])]
            first4 = gaps[:3]
            check(ok and len(onsets) >= 4 and all(abs(g - beat) <= 6 for g in first4), "the internal click: bursts on the audio output a quarter note apart during the count-in", "onsets at ms %s; %s" % (onsets[:8], capture.detail))
            measured["internal_click_gaps_ms"] = gaps[:6]
            # ---- tabby-v04.14: CLICK LEVEL: LOW, MID (a song never set), HIGH, each twice the one before ----
            l.press("FX"); idle(0.4)
            u = l.setup_state()
            was_mid = u.get("click_level") == 1
            ok_low = setting(13, "click_level", 0); l.press("FX"); idle(0.3)
            _, low = capture("click-low.wav")
            l.press("FX"); idle(0.4); ok_high = setting(13, "click_level", 2); l.press("FX"); idle(0.3)
            _, high = capture("click-high.wav")
            r1, r2 = (mid / low if low else 0), (high / mid if mid else 0)
            check(was_mid and ok_low and ok_high and 1.6 <= r1 <= 2.5 and 1.6 <= r2 <= 2.5, "CLICK LEVEL: a song never set is on MID; LOW, MID and HIGH are each about twice the one before",
                  "peaks %d, %d, %d (x%.2f, x%.2f)" % (low, mid, high, r1, r2))
            measured["click_peaks_low_mid_high"] = [low, mid, high]
            l.press("FX"); idle(0.4); setting(13, "click_level", 1); l.press("FX"); idle(0.3)
        else:
            l.press("REC"); idle(0.2); l.press("REC"); idle(0.2)
        # ---- tabby-v04.14: the controller number of K1 on CLIPS is the song's ----
        l.press("FX"); idle(0.4)
        row(14)
        for _ in range(140):
            v = l.setup_state()["knobs"][0]
            if v == 7:
                break
            l.knob(K1, 1 if v < 7 else -1) if abs(v - 7) < 16 else l.knob(K2, 1 if v < 7 else -1)
            idle(0.06)
        u = l.setup_state()
        l.press("FX"); idle(0.3)
        l.knob(K1, -4); idle(0.4)                      # v0.9: the knob's value is kept while the power is on; leave the top first
        mark = time.monotonic_ns(); l.knob(K1, 1); idle(0.4)
        cc = [m for _, m in since(mark, lambda m: len(m) == 3 and (m[0] & 0xF0) == 0xB0)]
        check(u["knobs"][0] == 7 and len(cc) == 1 and cc[0][1] == 7, "K1 CONTROLLER set to 7 on the second page: K1 on CLIPS sends controller 7", (u["knobs"], [list(m) for m in cc]))
        l.press("FX"); idle(0.4); row(14)
        for _ in range(140):
            v = l.setup_state()["knobs"][0]
            if v == 74:
                break
            l.knob(K1, 1 if v < 74 else -1) if abs(v - 74) < 16 else l.knob(K2, 1 if v < 74 else -1)
            idle(0.06)
        check(l.setup_state()["knobs"] == [74, 71, 1, 11], "the controllers are 74, 71, 1 and 11 again", l.setup_state()["knobs"])
        l.press("FX"); idle(0.3)
        # ---- everything off again, and saved ----
        l.press("FX"); idle(0.4)
        ok = setting(9, "click", 0) and setting(8, "count_in", 0)
        l.setup_do(); idle(0.6); u = l.setup_state()
        check(ok and u["click"] == 0 and u["count_in"] == 0 and not u["unsaved"], "the click and the count-in are off again and the song is saved", (u["click"], u["count_in"], u["unsaved"]))
        l.press("FX"); idle(0.3)
        l.edit_discard()
        l.show_page("overview")
        h = l.health()
        check(h["underruns"] == h0["underruns"] and h["dma_overruns"] == h0["dma_overruns"], "no audio underrun, no DMA overrun during the test",
              "underruns +%d, DMA overruns +%d, render peak %.2f ms" % (h["underruns"] - h0["underruns"], h["dma_overruns"] - h0["dma_overruns"], h["render_peak_ms"]))
    finally:
        try:
            l.release_all()
        except Exception:
            pass
        l.close(); din.finish()
    ok = bool(RESULTS) and all(r["pass"] for r in RESULTS)
    with open(os.path.join(a.out, "setup.json"), "w") as f:
        json.dump({"results": RESULTS, "measured": measured}, f, indent=1)
    print("%s setting page: %d of %d checks passed" % ("PASS" if ok else "FAIL", sum(1 for r in RESULTS if r["pass"]), len(RESULTS)))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
