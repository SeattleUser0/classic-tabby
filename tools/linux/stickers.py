#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/stickers.py — the SMK-37 sticker sheet for Classic Tabby (docs/STICKERS.md, docs/stickers/)

Purpose
    Writes the print-ready sticker sheet and its placement drawings from one table of measurements and one table of
    label texts, so the PDF, the dimensions in docs/STICKERS.md and the labels cannot drift apart:

      docs/stickers/classic-tabby-stickers.html   the pages as HTML + SVG (inches; the source of the PDF)
      docs/stickers/classic-tabby-stickers.pdf    US Letter landscape, print at 100 % ("actual size"):
                                                  page 1 the stickers at 1:1 with cut lines,
                                                  page 2 where they go (the panel at half size, dimensioned),
                                                  pages 3 and 4 the panel at 1:1 in two halves (a placement template)
      docs/stickers/measurements.json             every number, in inches and millimetres
      --table                                     prints the tables of docs/STICKERS.md (sections 3 and 4)

    The panel geometry was measured from the manufacturer's top-view line drawing (the first page of M-VAVE's SMK-37
    PRO user manual: an orthographic drawing, 2962 x 1732 px), scaled by the published case width of 458 mm; the
    case depth that follows (181.0 mm) agrees with the published 181 mm. PANEL below holds the pixel coordinates read
    from that drawing (tools: numpy / scipy connected components; docs/STICKERS.md 2 says how). The PDF is made by
    headless Chrome from the HTML (no other dependency).

Usage (from the repository root)
    python3 -I tools/linux/stickers.py [--out docs/stickers] [--table] [--no-pdf]

Version: 0.4

Revision log
    v0.4  2026-11-18  The user's rule: no type below 6 point. Nothing printed in the function strip does anything in Classic
                      Tabby (STRIP_ITEMS), so A, B and C now cover it on purpose: 11/16" high, from under the transport
                      symbols to the keys, their side edges in gaps of the printing (STRIP_LABELS, measured in the
                      photograph); E (optional) covers what is left of it. D is 7/32" high. Texts for tabby-v04.21.
    v0.3  2026-11-17  Checked against the user's photograph of the unit (PHOTO): the band under the buttons and pads is not
                      free: it carries the transport symbols and the strip of key functions. Stickers A, B and C are
                      7/32" high and sit in the gap between them; D moved; the stickers say what a button does (the
                      printed words are the names now, SPEC 17.4).
    v0.2  2026-11-17  Every dimension is printed as inches in fractions to 1/32 (frac); the decimals stay in measurements.json.
    v0.1  2026-11-17  First version (labels of CONTROL-MAP.md v0.9, tabby-v04.14).
"""
import argparse, html, json, shutil, subprocess, sys
from pathlib import Path

# ---- the drawing: pixel coordinates (x right, y towards the player) --------------------------------------------
CASE = (20, 9, 2947, 1166)                 # outer outline of the case in the top view
CASE_WIDTH_MM = 458.0                      # published width (the depth, 181 mm, is the check)
IN_PER_PX = CASE_WIDTH_MM / (CASE[2] - CASE[0]) / 25.4
KEYBED_Y = 622                             # the line where the keys begin
LCD = (416, 71, 660, 310)
WHEELS = [(122, 155, 183, 421), (264, 155, 325, 421)]
LEFT_PANEL = (432, 338, 643, 505)          # the black field of the six left buttons
LEFT_COLS = [(444, 536), (540, 631)]
LEFT_ROWS = [(350, 396), (399, 445), (448, 493)]
RIGHT_PANEL = (2199, 383, 2871, 505)       # the black field of the twelve right buttons
RIGHT_COLS = [(2224, 2319), (2329, 2425), (2434, 2530), (2540, 2635), (2645, 2741), (2751, 2846)]
RIGHT_ROWS = [(396, 440), (447, 492)]
KNOB_X = [826.25, 1001.75, 1177.5, 1353.0, 1528.5, 1704.25, 1879.75, 2055.5]
KNOB_Y, KNOB_R = 137.0, 52.0
PAD_X = [(757, 897), (932, 1073), (1108, 1249), (1283, 1425), (1459, 1600), (1635, 1776), (1810, 1952), (1986, 2127)]
PAD_ROWS = [(225, 337), (356, 468)]
ICON_ROW = (480, 502)                      # the transport symbols printed under the lower pads (the drawing)
FADER_X = [2266.5, 2445.5, 2624.5, 2803.5]
FADER_SLOT = (95, 350)
FADER_CAP_W = 100
KEYS = (109, 2856, 22)                     # first and last white-key edge, number of white keys

# ---- the labels (docs/CONTROL-MAP.md v0.9; names as in SPEC.md 17.4) ---------------------------------------------
# Left group, as the buttons lie: (printed on the device = the name, what it does)
# v0.4: two lines a button (6 point): what it does, and its second use ("KB" = with KNOB BANK held)
LEFT = [[("KNOB BANK", ("SHIFT: HOLD FOR", "2ND FUNCTIONS")), ("FADER BANK", ("FADERS ON", "T1-4 / T5-8"))],
        [("<", ("AS PATCH:", "OVERVIEW")), (">", ("SAVE /", "CONFIRM"))],
        [("OCTAVE-", ("BANK / BAR -", "KB: SHIFT CLIP")), ("OCTAVE+", ("BANK / BAR +", "KB: SHIFT CLIP"))]]
RIGHT = [[("ARP", ("ARP ON/OFF", "HOLD: SETUP")), ("NOTE REPEAT", ("KEYS/PADS", "FOCUS")), ("SCALE", ("CLIPS OR", "SCENES", "STEP: PADS")),
          ("CHORD", ("TRACK TO", "SCENES", "STEP: CLEAR")), ("GLOBE", ("MIXER", "MUTE / SOLO")), ("BT", ("CLIPS PAGE", "AGAIN: BACK"))],
         [("PATCH", ("OVERVIEW", "KB: SOURCE")), ("PARA", ("STEP PAGE", "EDIT A CLIP")), ("FX", ("SETTING", "STEP: UNDO", "TAKE: CLEAR")),
          ("SEQ", ("SYNC / MIDI", "+ PARA:", "ACTIONS")), ("SEQ PLAY", ("PLAY / STOP", "THE SONG")), ("SEQ REC", ("TAKE", "KB: INPUT", "QUANTIZE"))]]
# Knobs: (name, CLIPS, SCENES, STEP, SETTING)
KNOBS = [("K1", "CTRL 74*", "TIMES", "NOTE SELECT", "VALUE"), ("K2", "CTRL 71*", "THEN", "VELOCITY", "VALUE x16"),
         ("K3", "CTRL 1*", "CHAIN HOLD", "START", "-"), ("K4", "CTRL 11*", "JUMP MODE", "LENGTH", "-"),
         ("K5", "TRACK", "SONG", "NOTE", "LINE"), ("K6", "CLIP BANK", "-", "BAR", "-"),
         ("K7", "-", "SONG", "PROBABILITY", "-"), ("K8", "MASTER VOLUME", "MASTER VOLUME", "MASTER VOLUME", "MASTER VOLUME")]
# Sticker B, second line: the knob above the column on the two pages a song is played from (30 characters at most)
# v0.4: two lines a column (6 point)
KNOB_LINE = [("K1 CLIPS: CTRL 74*", "SCENES: TIMES"), ("K2 CLIPS: CTRL 71*", "SCENES: THEN"), ("K3 CLIPS: CTRL 1*", "SCENES: HOLD"), ("K4 CLIPS: CTRL 11*", "SCENES: JUMP"),
             ("K5 CLIPS: TRACK", "SCENES: SONG"), ("K6 CLIPS: BANK", "STEP: BAR"), ("K7 SCENES: SONG", "STEP: PROBABILITY"), ("K8 MASTER", "VOLUME")]
# Which pad row is pads 1 to 8: the upper one. An assumption (docs/STICKERS.md 5.1): M-VAVE's own panel model in the kit
# draws it so and the LED chain confirms the columns; nobody has pressed a pad to see.
PAD_ROW_LINES = ("KNOB BANK + PAD:", "UPPER: TRACK %d", "LOWER: MUTE %d")
EXTRA = ("CLASSIC TABBY", "SEQ + PARA: ACTIONS", "PATCH + SEQ PLAY: STOP ALL", "KB = KNOB BANK HELD")
FADERS = ["LEVEL T1 / T5", "LEVEL T2 / T6", "LEVEL T3 / T7", "LEVEL T4 / T8"]

# ---- the photograph of the unit (2026-11-17; ~/Documents/Classic Tabby/panel.jpg, 2016 x 1512, straight above) -------
# Scale: the case is 1901 px wide in it (56..1957 at the panel) = the published 458 mm: 105.4 px per inch. The tape in the
# picture lies on the desk below the panel and reads 6 % long (99.3 px per inch), so it confirms the order of size only.
# Depth: 740 px = 7.02" against the published 7.13" (the front edge is rounded and lower): vertical figures are good
# to about 1.5 %. Inches from the case's back left corner. Horizontal positions agree with the drawing within 1/16".
PHOTO = {
    "px_per_inch": 105.4, "tape_px_per_inch": 99.3,
    "pad_left_edges": [4.54, 5.65, 6.75, 7.84, 8.91, 9.98, 11.06, 12.14], "pad_size": [0.85, 0.68], "pad_row_tops": [1.32, 2.16],
    "left_field": [2.50, 2.03, 1.28, 0.99], "right_field": [13.50, 2.36, 4.11, 0.69],
    "fader_centres": [13.89, 15.01, 16.11, 17.21], "fader_slot_bottom": 2.02,
    "knob_centres": [4.97, 6.08, 7.16, 8.24, 9.32, 10.40, 11.48, 12.56],
    "transport_symbols": [2.94, 3.05],       # printed under the lower pad row: play, pause, record, rewind, fast forward, <, >, UNDO
    "function_strip": [3.40, 3.74],          # printed above the keys: ARP / GLOB functions, CHN 1-16, PRE 1-8, RATE values, RESET
    "keys_begin": 3.82,
}
def y_px(inches):
    return CASE[1] + inches / IN_PER_PX
SYMBOLS = (y_px(PHOTO["transport_symbols"][0]), y_px(PHOTO["transport_symbols"][1]))
STRIP = (y_px(PHOTO["function_strip"][0]), y_px(PHOTO["function_strip"][1]))

# ---- the stickers: (id, title, x0, y0, x1, y1) in drawing pixels -------------------------------------------------
# A, B, C: in the gap between the button fields / transport symbols (down to 3.05") and the function strip (from 3.40"):
# 11/32" high. The stickers are 7/32" and sit in its middle (3 1/8" to 3 11/32"), about 1/16" clear of the printing on either side.
BAND = (y_px(3.0 + 4 / 32), y_px(3.0 + 11 / 32))
# D: between the fader slots' ends (2.02") and the right button field (2.36"): 5/32" high, in the middle.
D_BAND = (y_px(2.0 + 4 / 32), y_px(2.0 + 9 / 32))
# v0.4: A, B and C run from 3 3/32" (1/32" under the transport symbols) to 3 25/32" (1/32" past the function strip, 1/32" short
# of the keys): 11/16" high. They cover the strip on purpose. D: 2 3/32" to 2 5/16" (7/32").
def x_px(inches):
    return CASE[0] + inches / IN_PER_PX
BAND = (y_px(3.0 + 3 / 32), y_px(3.0 + 25 / 32))
D_BAND = (y_px(2.0 + 3 / 32), y_px(2.0 + 10 / 32))
# The printing of the function strip, read and measured in the photograph (inches from the case's left edge, to 0.03"):
# (left, right, upper line, lower line). Upper line: held ARP + key; lower: held GLOBE + key (CHN, PRE), SCALE + key (the
# root), and RESET. One label a key, from the lowest key up.
STRIP_LABELS = [
    (0.20, 0.76, "ARP | UP", "GLOB | CHN 1"), (1.00, 1.28, "DOWN", "CHN 2"), (1.40, 1.67, "INCL", "CHN 3"), (1.91, 2.16, "EXCL", "CHN 4"),
    (2.32, 2.59, "RAND", "CHN 5"), (2.86, 3.19, "ORDER", "CHN 6"), (3.33, 3.69, "REPEAT", "CHN 7"), (3.76, 4.01, "OCT+", "CHN 8"),
    (4.25, 4.56, "LATCH", "CHN 9"), (4.63, 4.93, "GATE+", "CHN 10"), (5.14, 5.45, "GATE-", "CHN 11"), (5.52, 5.82, "TAP", "CHN 12"),
    (6.01, 6.38, "SWING+", "CHN 13"), (6.49, 6.82, "SWING-", "CHN 14"), (6.91, 7.28, "TEMPO+", "CHN 15"), (7.39, 7.75, "TEMPO-", "CHN 16"),
    (7.83, 8.16, "SYNC", "PRE 1"), (8.32, 8.56, "", "PRE 2"), (8.79, 9.02, "", "PRE 3"), (9.19, 9.42, "", "PRE 4"), (9.64, 9.88, "", "PRE 5"),
    (10.05, 10.28, "", "PRE 6"), (10.50, 10.73, "", "PRE 7"), (10.91, 11.14, "", "PRE 8"), (11.10, 11.52, "RATE | 1/4", "SC | C"),
    (11.88, 12.06, "1/4T", "C#"), (12.31, 12.43, "1/8", "D"), (12.78, 12.96, "1/8T", "D#"), (13.20, 13.38, "1/16", "E"),
    (13.73, 13.97, "1/16T", "F"), (14.19, 14.36, "1/32", "F#"), (14.61, 14.85, "1/32T", "G"), (15.08, 15.19, "", "G#"),
    (15.48, 15.55, "", "A"), (15.94, 16.05, "", "A#"), (16.37, 16.42, "", "B"), (17.05, 17.32, "", "RESET")]
# What each printed function is in M-VAVE's firmware and what Classic Tabby does with the same gesture: nothing of the
# strip works (the keys only play notes: app/smk37_controls.c sends every key as a note, whatever button is held).
STRIP_ITEMS = [
    ("ARP: UP, DOWN, INCL, EXCL, RAND, ORDER, REPEAT, OCT+, LATCH, GATE+, GATE-, TAP, SWING+, SWING-, TEMPO+, TEMPO-, SYNC", "hold ARP, press the key (M-VAVE's manual)",
     "dead: holding ARP opens the ARP settings page; the knobs set rate, direction, range, gate, swing, hold. The key plays its note."),
    ("RATE: 1/4, 1/4T, 1/8, 1/8T, 1/16, 1/16T, 1/32, 1/32T", "a held button and the key (the manual does not say which)", "dead: the arpeggiator's rate is K1 on the ARP page."),
    ("GLOB: CHN 1 to CHN 16", "hold GLOBE, press the key (by the label; not in the manual)", "dead: holding GLOBE shows the mixer (pads mute and solo). Channels are on the MIDI TRACK page (KNOB BANK + SEQ)."),
    ("PRE 1 to PRE 8", "as CHN", "dead: projects are chosen with K7 on the overview."),
    ("SC: C, C#, D ... B", "a held button and the key (by the label: SCALE)", "dead: SCALE switches CLIPS and SCENES; there is no scale lock. The letters are also the names of those twelve keys."),
    ("RESET", "a held button and the highest key", "dead: no key resets anything. Recovery is in the workbench.")]
# Sticker edges: in gaps of that printing, so that no printed word is cut in half:
#   2 7/32" | 2 1/4" between EXCL / CHN 4 (ends 2.16) and RAND / CHN 5 (begins 2.32);
#   4 3/32" | 4 5/32" between OCT+ / CHN 8 (4.01) and LATCH / CHN 9 (4.25);
#   13 1/32" | 13 3/32" between 1/8T / D# (12.96) and 1/16 / E (13.20);  17 9/16" right of RESET (17.32).
EDGE = {"E0": 5 / 32, "E1": 2 + 7 / 32, "A0": 2 + 8 / 32, "A1": 4 + 3 / 32, "B0": 4 + 5 / 32, "B1": 13 + 1 / 32, "C0": 13 + 3 / 32, "C1": 17 + 18 / 32}
STICKERS = {
    "A": ("left buttons", x_px(EDGE["A0"]), BAND[0], x_px(EDGE["A1"]), BAND[1]),
    "B": ("pads and knobs", x_px(EDGE["B0"]), BAND[0], x_px(EDGE["B1"]), BAND[1]),
    "C": ("right buttons", x_px(EDGE["C0"]), BAND[0], x_px(EDGE["C1"]), BAND[1]),
    "D": ("faders", 2186, D_BAND[0], 2884, D_BAND[1]),
    "E": ("optional: left end of the strip", x_px(EDGE["E0"]), BAND[0], x_px(EDGE["E1"]), BAND[1]),
}
MIN_POINT = 6.0
SQUEEZE = {"most": 1.0}      # the strongest horizontal squeeze any line needed (1.0 = none)


def covered(key):
    """The strip labels a sticker covers (wholly), as (upper, lower) texts."""
    x0, x1 = inch(STICKERS[key][1] - CASE[0]), inch(STICKERS[key][3] - CASE[0])
    return [(u, l) for a, b, u, l in STRIP_LABELS if a >= x0 - 0.02 and b <= x1 + 0.02]


def est_width(s, size):
    """Width in inches of bold Helvetica capitals at `size` points (an estimate, a little on the wide side)."""
    w = 0.0
    for ch in s:
        w += 0.28 if ch == " " else 0.30 if ch in ".,:;'|!/()-*" else 0.58 if ch.isdigit() or ch in "+<>=" else 0.72
    return w * size / 72.0


def fit(x, y, s, size, avail, weight="700"):
    """A line of at least MIN_POINT type centred at x; squeezed sideways (never made smaller) when it is too wide."""
    assert size >= MIN_POINT, (s, size)
    w = est_width(s, size)
    if w <= avail:
        return text(x, y, s, size, weight)
    SQUEEZE["most"] = min(SQUEEZE["most"], avail / w)
    return text(x, y, s, size, weight, extra='textLength="%.4f" lengthAdjust="spacingAndGlyphs"' % avail)


def inch(px):
    return px * IN_PER_PX


def frac(v):
    """Inches as a fraction to the nearest 1/32, the way a ruler reads: 2 17/32"."""
    from fractions import Fraction
    f = Fraction(round(v * 32), 32)
    whole, rest = divmod(f, 1)
    if not rest:
        return '%d"' % whole
    return ('%d %d/%d"' % (whole, rest.numerator, rest.denominator)) if whole else '%d/%d"' % (rest.numerator, rest.denominator)


def pos(x, y):
    """Drawing pixel -> inches from the case's back left corner."""
    return inch(x - CASE[0]), inch(y - CASE[1])


def esc(s):
    return html.escape(s, quote=True)


FONT = "font-family:'Helvetica Neue',Helvetica,Arial,'Liberation Sans',sans-serif"


def text(x, y, s, size, weight="700", anchor="middle", fill="#000", extra=""):
    return '<text x="%.4f" y="%.4f" font-size="%.4f" font-weight="%s" text-anchor="%s" fill="%s" style="%s" %s>%s</text>' % (
        x, y, size / 72.0, weight, anchor, fill, FONT, extra, esc(s))


def sticker_svg(key, ox, oy, outline=True):
    """One sticker drawn with its top left corner at (ox, oy) inches. Returns SVG."""
    _, x0, y0, x1, y1 = STICKERS[key]
    w, h = inch(x1 - x0), inch(y1 - y0)
    out = ['<g transform="translate(%.4f %.4f)">' % (ox, oy)]
    out.append('<rect x="0" y="0" width="%.4f" height="%.4f" rx="0.03" fill="#fff" stroke="%s" stroke-width="0.006"/>' % (w, h, "#000" if outline else "#888"))
    lx = lambda px: inch(px - x0)
    PT = 1 / 72.0
    if key == "A":
        rh = h / 3
        mid = lx((LEFT_COLS[0][1] + LEFT_COLS[1][0]) / 2)
        for r, row in enumerate(LEFT):
            for c, (_, lines) in enumerate(row):
                x0c, x1c = (0.0, mid) if c == 0 else (mid, w)
                for n, line in enumerate(lines):
                    out.append(fit((x0c + x1c) / 2, r * rh + (6.6 + 7.0 * n) * PT, line, 6.0, x1c - x0c - 0.06))
            if r:
                out.append('<line x1="0.03" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.003"/>' % (r * rh, w - 0.03, r * rh))
        out.append('<line x1="%.4f" y1="0.02" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.003"/>' % (mid, mid, h - 0.02))
    elif key == "C":
        rh = h / 2
        edges = [0.0] + [lx((RIGHT_COLS[c - 1][1] + RIGHT_COLS[c][0]) / 2) for c in range(1, 6)] + [w]
        for r, row in enumerate(RIGHT):
            for c, (_, lines) in enumerate(row):
                top = (rh / PT - (4.4 + 7.4 * (len(lines) - 1))) / 2 + 4.4          # the block of lines centred in its cell (capitals are 4.4 pt high)
                for n, line in enumerate(lines):
                    out.append(fit((edges[c] + edges[c + 1]) / 2, r * rh + (top + 7.4 * n) * PT, line, 6.0, edges[c + 1] - edges[c] - 0.06))
        out.append('<line x1="0.03" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.003"/>' % (rh, w - 0.03, rh))
        for x in edges[1:-1]:
            out.append('<line x1="%.4f" y1="0.02" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.003"/>' % (x, x, h - 0.02))
    elif key == "B":
        edges = [0.0] + [lx((PAD_X[k - 1][1] + PAD_X[k][0]) / 2) for k in range(1, 8)] + [w]
        for k in range(8):
            cx, avail = (edges[k] + edges[k + 1]) / 2, edges[k + 1] - edges[k] - 0.06
            lines = [PAD_ROW_LINES[0], PAD_ROW_LINES[1] % (k + 1), PAD_ROW_LINES[2] % (k + 1), KNOB_LINE[k][0], KNOB_LINE[k][1]]
            for n, line in enumerate(lines):
                out.append(fit(cx, (8.0 + 8.2 * n + (3.0 if n >= 3 else 0.0)) * PT, line, 6.0, avail, "700" if n else "400"))
            if k:
                out.append('<line x1="%.4f" y1="0.02" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.003"/>' % (edges[k], edges[k], h - 0.02))
        out.append('<line x1="0.03" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.003"/>' % (28.2 * PT, w - 0.03, 28.2 * PT))
    elif key == "D":
        for k, t in enumerate(FADERS):
            out.append(fit(lx(FADER_X[k]), h * 0.70, t, 7.0, 0.95))
    elif key == "E":
        out.append(fit(w / 2, 13.0 * PT, EXTRA[0], 10.0, w - 0.1))
        for n, line in enumerate(EXTRA[1:]):
            out.append(fit(w / 2, (24.0 + 8.5 * n) * PT, line, 6.0, w - 0.1))
    out.append("</g>")
    return "\n".join(out), w, h


def panel_svg(scale, x_from=None, x_to=None, with_stickers=True, dims=False):
    """The panel's outline with its controls (inches from the case's corner, scaled), optionally a part of it."""
    o = []
    R = lambda x0, y0, x1, y1, extra='fill="none" stroke="#000" stroke-width="0.008"', rx=0.0: o.append(
        '<rect x="%.4f" y="%.4f" width="%.4f" height="%.4f" rx="%.4f" %s/>' % (*pos(x0, y0), inch(x1 - x0), inch(y1 - y0), rx, extra))
    R(*CASE, rx=0.12)
    o.append('<line x1="%.4f" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.006"/>' % (*pos(CASE[0], KEYBED_Y), *pos(CASE[2], KEYBED_Y)))
    kw = (KEYS[1] - KEYS[0]) / KEYS[2]
    for i in range(KEYS[2] + 1):
        x = KEYS[0] + i * kw
        o.append('<line x1="%.4f" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#999" stroke-width="0.004"/>' % (*pos(x, KEYBED_Y + 20), *pos(x, CASE[3] - 12)))
    R(*LCD, rx=0.06)
    for wh in WHEELS:
        R(*wh, rx=0.03)
    R(*LEFT_PANEL, extra='fill="#ddd" stroke="#000" stroke-width="0.006"', rx=0.05)
    R(*RIGHT_PANEL, extra='fill="#ddd" stroke="#000" stroke-width="0.006"', rx=0.05)
    for r, (y0, y1) in enumerate(LEFT_ROWS):
        for c, (x0, x1) in enumerate(LEFT_COLS):
            R(x0, y0, x1, y1, extra='fill="#fff" stroke="#000" stroke-width="0.004"', rx=0.02)
            cx, cy = pos((x0 + x1) / 2, (y0 + y1) / 2)
            o.append(text(cx, cy + 0.02, LEFT[r][c][0], 3.6 if scale >= 1 else 5.0, "400"))
    for r, (y0, y1) in enumerate(RIGHT_ROWS):
        for c, (x0, x1) in enumerate(RIGHT_COLS):
            R(x0, y0, x1, y1, extra='fill="#fff" stroke="#000" stroke-width="0.004"', rx=0.02)
            cx, cy = pos((x0 + x1) / 2, (y0 + y1) / 2)
            o.append(text(cx, cy + 0.02, RIGHT[r][c][0], 3.6 if scale >= 1 else 5.0, "400"))
    for k, x in enumerate(KNOB_X):
        cx, cy = pos(x, KNOB_Y)
        o.append('<circle cx="%.4f" cy="%.4f" r="%.4f" fill="none" stroke="#000" stroke-width="0.006"/>' % (cx, cy, inch(KNOB_R)))
        o.append(text(cx, cy + 0.03, "K%d" % (k + 1), 6 if scale >= 1 else 9, "400"))
    for (y0, y1) in PAD_ROWS:
        for (x0, x1) in PAD_X:
            R(x0, y0, x1, y1, rx=0.04)
    for x in FADER_X:
        R(x - 12, FADER_SLOT[0], x + 12, FADER_SLOT[1], rx=0.02)
    # the printing the stickers must not cover (from the photograph): the transport symbols and the function strip
    R(PAD_X[0][0], SYMBOLS[0], PAD_X[7][1], SYMBOLS[1], extra='fill="#cfe3ff" stroke="#369" stroke-width="0.004"')
    R(x_px(0.15), STRIP[0], x_px(17.4), STRIP[1], extra='fill="#cfe3ff" stroke="#369" stroke-width="0.004"')
    if scale >= 1:
        for a_, b_, up, low in STRIP_LABELS:
            cx = (a_ + b_) / 2
            if up:
                o.append(text(cx, pos(0, STRIP[0])[1] + 0.10, up, 4.0, '400', 'middle', '#135'))
            o.append(text(cx, pos(0, STRIP[1])[1] - 0.04, low, 4.0, '400', 'middle', '#135'))
    o.append(text(pos((PAD_X[0][0] + PAD_X[7][1]) / 2, 0)[0], pos(0, (SYMBOLS[0] + SYMBOLS[1]) / 2)[1] + 0.025, 'printed: transport symbols', 4.5 if scale >= 1 else 7, '400', 'middle', '#135'))
    if scale < 1:
        o.append(text(pos(x_px(1.2), 0)[0], pos(0, (STRIP[0] + STRIP[1]) / 2)[1] + 0.05, 'strip', 10, '400', 'middle', '#135'))
    if with_stickers:
        for key in STICKERS:
            _, x0, y0, x1, y1 = STICKERS[key]
            if scale >= 1:
                s, _, _ = sticker_svg(key, *pos(x0, y0), outline=True)
                o.append(s)
            else:
                R(x0, y0, x1, y1, extra='fill="#ffe08a" stroke="#000" stroke-width="0.008"', rx=0.03)
                cx, cy = pos((x0 + x1) / 2, (y0 + y1) / 2)
                o.append(text(cx, cy + 0.06, key, 16))
    if dims:
        def dim_h(xa, xb, y, label_above=True):
            (ax, ay), (bx, _) = pos(xa, y), pos(xb, y)
            o.append('<line x1="%.4f" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#c00" stroke-width="0.006"/>' % (ax, ay, bx, ay))
            for x in (ax, bx):
                o.append('<line x1="%.4f" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#c00" stroke-width="0.006"/>' % (x, ay - 0.06, x, ay + 0.06))
            o.append(text((ax + bx) / 2, ay - 0.05 if label_above else ay + 0.2, frac(bx - ax), 11, "700", "middle", "#c00"))
        def dim_v(x, ya, yb, right=True):
            (ax, ay), (_, by) = pos(x, ya), pos(x, yb)
            o.append('<line x1="%.4f" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#c00" stroke-width="0.006"/>' % (ax, ay, ax, by))
            for y in (ay, by):
                o.append('<line x1="%.4f" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#c00" stroke-width="0.006"/>' % (ax - 0.06, y, ax + 0.06, y))
            o.append(text(ax + (0.06 if right else -0.06), (ay + by) / 2 + 0.05, frac(by - ay), 11, "700", "start" if right else "end", "#c00"))
        for n, key in enumerate(("E", "A", "B", "C")):
            _, x0, y0, x1, y1 = STICKERS[key]
            dim_h(CASE[0], x0, KEYBED_Y + 100 + 100 * n, False)
        dim_v(CASE[0] + 250, CASE[1], BAND[0], False)
        dim_v(CASE[0] + 330, BAND[0], BAND[1], True)
        _, x0, y0, x1, y1 = STICKERS["D"]
        dim_h(CASE[0], x0, y0 - 20, True)
        dim_v(x1 + 30, CASE[1], y0, True)
        dim_h(CASE[0], CASE[2], CASE[3] + 60, False)
        dim_v(CASE[2] + 60, CASE[1], CASE[3], True)
    return "\n".join(o)


def build_html():
    PW, PH = 11.0, 8.5
    pages = []
    # page 1: the stickers at 1:1
    p = ['<svg xmlns="http://www.w3.org/2000/svg" width="11in" height="8.5in" viewBox="0 0 11 8.5">']
    p.append(text(0.5, 0.55, "Classic Tabby stickers for the M-VAVE SMK-37 Pro  -  page 1 of 4: the stickers, actual size", 13, "700", "start"))
    p.append(text(0.5, 0.78, "Print at 100 % (actual size, no scaling) on US Letter, landscape. Check: the bar below must measure exactly 5 inches. Cut along the outlines.", 8.5, "400", "start"))
    p.append('<rect x="0.5" y="0.95" width="5" height="0.08" fill="#000"/>')
    for i in range(6):
        p.append('<line x1="%.3f" y1="0.95" x2="%.3f" y2="1.12" stroke="#000" stroke-width="0.008"/>' % (0.5 + i, 0.5 + i))
        p.append(text(0.5 + i, 1.24, '%d"' % i, 7, "400"))
    for n, (dy, label) in enumerate(((1.75, True), (5.0, False))):
        if not label:
            p.append(text(0.5, dy - 0.25, "Spare set (the same five stickers)", 9, "700", "start"))
        for key, (x, y) in (("B", (0.5, dy)), ("C", (0.5, dy + 1.0)), ("A", (5.2, dy + 1.0)), ("E", (7.35, dy + 1.0)), ("D", (0.5, dy + 2.0))):
            s, w, h = sticker_svg(key, x, y)
            p.append(text(x, y - 0.07, 'Sticker %s  -  %s  -  %s x %s' % (key, STICKERS[key][0], frac(w), frac(h)), 7.5, "700", "start"))
            p.append(s)
    p.append(text(0.5, 7.85, "Black on white, no type below 6 point. A, B and C are 11/16\" high and cover the strip of key functions printed above the keys on purpose (none of them works in Classic Tabby); E is optional and covers the rest of it.", 7.5, "400", "start"))
    p.append(text(0.5, 8.05, "KB = with KNOB BANK held. * = the controller numbers of the song (CLIP SETTING). Upper / lower pad row: an assumption, see docs/STICKERS.md 5.1. docs/STICKERS.md has every text and position.", 7.5, "400", "start"))
    p.append("</svg>")
    pages.append("\n".join(p))
    # page 2: where they go, half size, dimensioned
    p = ['<svg xmlns="http://www.w3.org/2000/svg" width="11in" height="8.5in" viewBox="0 0 11 8.5">']
    p.append(text(0.5, 0.55, "Page 2 of 4: where the stickers go  -  the panel at half size; dimensions in inches at full size, from the case's back left corner", 12, "700", "start"))
    p.append(text(0.5, 0.78, "Grey: the button fields with the words printed on the device. Blue: the printing (the transport symbols stay visible; the strip of key functions is covered on purpose). Yellow: stickers A to E.", 8.5, "400", "start"))
    p.append('<g transform="translate(0.75 1.6) scale(0.5)">' + panel_svg(0.5, dims=True) + "</g>")
    p.append(text(0.5, 6.6, "Sticker tops: A, B, C, E  %s from the back edge (the transport symbols end at %s; the function strip, %s to %s, is covered; the keys begin at %s).  D  %s from the back edge." % tuple(frac(v) for v in (
        pos(0, BAND[0])[1], PHOTO["transport_symbols"][1], PHOTO["function_strip"][0], PHOTO["function_strip"][1], PHOTO["keys_begin"], pos(0, STICKERS["D"][2])[1])), 9, "400", "start"))
    p.append(text(0.5, 6.85, "Left edges from the case's left edge: E %s   A %s   B %s   C %s   D %s.   The columns inside A, B and C line up with the buttons, pads and knobs above them." % tuple(frac(v) for v in (
        pos(STICKERS["E"][1], 0)[0], pos(STICKERS["A"][1], 0)[0], pos(STICKERS["B"][1], 0)[0], pos(STICKERS["C"][1], 0)[0], pos(STICKERS["D"][1], 0)[0])), 9, "400", "start"))
    p.append(text(0.5, 7.1, "Easier than measuring: go by the printing. Top edges just under the transport symbols. A: left edge just left of the printed RAND / CHN 5. B: just left of LATCH / CHN 9, touching A.", 9, "400", "start"))
    p.append(text(0.5, 7.35, "C: just left of 1/16 / E, touching B. E: its right edge touching A. D: under the fader slots, left edge with the right button field. Pages 3 and 4 show the same at actual size.", 9, "400", "start"))
    p.append("</svg>")
    pages.append("\n".join(p))
    # pages 3 and 4: the panel at 1:1, two halves with an overlap
    total_w = inch(CASE[2] - CASE[0])
    half = total_w / 2
    for n, x_off in ((3, 0.0), (4, half - 0.75)):
        p = ['<svg xmlns="http://www.w3.org/2000/svg" width="11in" height="8.5in" viewBox="0 0 11 8.5">']
        p.append(text(0.5, 0.45, "Page %d of 4: placement template, actual size  -  the %s half of the panel (the halves overlap by 1.5\")" % (n, "left" if n == 3 else "right"), 11, "700", "start"))
        p.append('<svg x="0.5" y="0.7" width="10" height="7.5" viewBox="%.4f -0.15 10 7.5">' % (x_off - 0.1) + panel_svg(1.0) + "</svg>")
        p.append("</svg>")
        pages.append("\n".join(p))
    body = "\n".join('<div class="page">%s</div>' % pg for pg in pages)
    return ("<!doctype html>\n<!-- SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception -->\n"
            "<!-- Generated by tools/linux/stickers.py; do not edit. -->\n"
            '<html lang="en"><meta charset="utf-8"><title>Classic Tabby stickers for the SMK-37 Pro</title>\n'
            "<style>@page{size:11in 8.5in;margin:0}html,body{margin:0;padding:0;background:#fff}"
            ".page{width:11in;height:8.5in;page-break-after:always;overflow:hidden}.page:last-child{page-break-after:auto}svg{display:block}</style>\n"
            + body + "\n</html>\n")


def measurements():
    m = {"photo": PHOTO, "source": "M-VAVE SMK-37 PRO user manual, top-view line drawing (2962 x 1732 px); scale from the published case width",
         "case_width_mm": CASE_WIDTH_MM, "inch_per_pixel": IN_PER_PX,
         "case_in": [inch(CASE[2] - CASE[0]), inch(CASE[3] - CASE[1])], "case_mm": [inch(CASE[2] - CASE[0]) * 25.4, inch(CASE[3] - CASE[1]) * 25.4],
         "stickers": {}, "controls": {}, "strip_labels": STRIP_LABELS, "strip_items": STRIP_ITEMS, "edges_in": EDGE, "min_point": MIN_POINT}
    for key, (title, x0, y0, x1, y1) in STICKERS.items():
        x, y = pos(x0, y0)
        m["stickers"][key] = {"title": title, "left_in": round(x, 3), "top_in": round(y, 3), "width_in": round(inch(x1 - x0), 3), "height_in": round(inch(y1 - y0), 3),
                              "width_mm": round(inch(x1 - x0) * 25.4, 1), "height_mm": round(inch(y1 - y0) * 25.4, 1),
                              "covers": [] if key == "D" else covered(key)}
    c = m["controls"]
    c["knob_centres_in"] = [[round(v, 3) for v in pos(x, KNOB_Y)] for x in KNOB_X]
    c["knob_diameter_in"] = round(inch(2 * KNOB_R), 3)
    c["knob_pitch_in"] = round(inch((KNOB_X[7] - KNOB_X[0]) / 7), 3)
    c["pad_size_in"] = [round(inch(PAD_X[0][1] - PAD_X[0][0]), 3), round(inch(PAD_ROWS[0][1] - PAD_ROWS[0][0]), 3)]
    c["pad_left_edges_in"] = [round(pos(x0, 0)[0], 3) for x0, _ in PAD_X]
    c["pad_rows_top_in"] = [round(pos(0, y0)[1], 3) for y0, _ in PAD_ROWS]
    c["left_button_field_in"] = [round(v, 3) for v in (*pos(LEFT_PANEL[0], LEFT_PANEL[1]), inch(LEFT_PANEL[2] - LEFT_PANEL[0]), inch(LEFT_PANEL[3] - LEFT_PANEL[1]))]
    c["right_button_field_in"] = [round(v, 3) for v in (*pos(RIGHT_PANEL[0], RIGHT_PANEL[1]), inch(RIGHT_PANEL[2] - RIGHT_PANEL[0]), inch(RIGHT_PANEL[3] - RIGHT_PANEL[1]))]
    c["button_cap_in"] = [round(inch(RIGHT_COLS[0][1] - RIGHT_COLS[0][0]), 3), round(inch(RIGHT_ROWS[0][1] - RIGHT_ROWS[0][0]), 3)]
    c["right_button_pitch_in"] = round(inch((RIGHT_COLS[5][0] - RIGHT_COLS[0][0]) / 5), 3)
    c["fader_centres_x_in"] = [round(pos(x, 0)[0], 3) for x in FADER_X]
    c["fader_slot_in"] = [round(pos(0, FADER_SLOT[0])[1], 3), round(pos(0, FADER_SLOT[1])[1], 3)]
    c["fader_cap_width_in"] = round(inch(FADER_CAP_W), 3)
    c["lcd_window_in"] = [round(v, 3) for v in (*pos(LCD[0], LCD[1]), inch(LCD[2] - LCD[0]), inch(LCD[3] - LCD[1]))]
    c["free_band_in"] = [round(pos(0, LEFT_PANEL[3])[1], 3), round(pos(0, KEYBED_Y)[1], 3)]
    c["white_key_pitch_in"] = round(inch((KEYS[1] - KEYS[0]) / KEYS[2]), 3)
    return m


def table():
    m = measurements()
    print("| Sticker | Goes | Width x height | Left edge from the case's left edge | Top edge from the case's back edge |")
    print("| --- | --- | --- | --- | --- |")
    for key, s in m["stickers"].items():
        print('| %s | %s | %s x %s | %s | %s |' % (key, s["title"], frac(s["width_in"]), frac(s["height_in"]), frac(s["left_in"]), frac(s["top_in"])))
    print()
    print(json.dumps(m["controls"], indent=1))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--out", default="docs/stickers")
    ap.add_argument("--table", action="store_true")
    ap.add_argument("--no-pdf", action="store_true")
    ap.add_argument("--chrome", default=shutil.which("google-chrome") or shutil.which("chromium") or "google-chrome")
    a = ap.parse_args()
    if a.table:
        table()
        return 0
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    page = out / "classic-tabby-stickers.html"
    page.write_text(build_html(), encoding="utf-8")
    m = measurements(); m["strongest_squeeze"] = round(SQUEEZE["most"], 3)
    (out / "measurements.json").write_text(json.dumps(m, indent=1) + "\n")
    print("no type below %.1f point; the strongest sideways squeeze of a line: to %.0f %% of its width" % (MIN_POINT, 100 * SQUEEZE["most"]))
    print("wrote %s and measurements.json" % page)
    if not a.no_pdf:
        pdf = out / "classic-tabby-stickers.pdf"
        r = subprocess.run([a.chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--print-to-pdf=%s" % pdf.resolve(), page.resolve().as_uri()],
                           capture_output=True, text=True)
        if r.returncode or not pdf.is_file():
            sys.stderr.write("chrome failed: %s\n" % r.stderr[-400:])
            return 1
        print("wrote %s" % pdf)
    return 0


if __name__ == "__main__":
    sys.exit(main())
