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

Version: 0.1

Revision log
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
ICON_ROW = (480, 502)                      # the transport symbols printed under the lower pads
FADER_X = [2266.5, 2445.5, 2624.5, 2803.5]
FADER_SLOT = (95, 350)
FADER_CAP_W = 100
KEYS = (109, 2856, 22)                     # first and last white-key edge, number of white keys

# ---- the labels (docs/CONTROL-MAP.md v0.9; names as in SPEC.md 17.4) ---------------------------------------------
# Left group, as the buttons lie: (printed on the device, Classic Tabby name, what it does on the clip pages)
LEFT = [[("KNOB BANK", "SHIFT", "PADS: TRACKS, MUTES"), ("FADER BANK", "FADER BANK", "FADERS T1-4 / T5-8")],
        [("<", "HOME", "+PLAY: STOP ALL"), (">", "SAVE", "SAVES (STOPPED)")],
        [("OCTAVE-", "OCT -", "PREV 16 / BAR"), ("OCTAVE+", "OCT +", "NEXT 16 / BAR")]]
RIGHT = [[("ARP", "ARP", "ARPEGGIATOR"), ("NOTE REPEAT", "PAD / STEP", "KEYS / PADS FOCUS"), ("SCALE", "SCL", "CLIPS <> SCENES"),
          ("CHORD", "ENV", "TO SCENES (SHIFT: ALL)"), ("GLOBE", "MIX", "MIXER"), ("BT", "BT", "CLIPS PAGE")],
         [("PATCH", "HOME / SRC", "SHIFT: SOURCE"), ("PARA", "EDIT", "STEP PAGE"), ("FX", "FX", "SETTING / UNDO"),
          ("SEQ", "SEQ", "SYNC  +EDIT: ACTIONS"), ("SEQ PLAY", "PLAY", "START / STOP"), ("SEQ REC", "REC", "TAKE (SHIFT: QUANT)")]]
# Knobs: (name, CLIPS, SCENES, STEP, SETTING)
KNOBS = [("K1", "CTRL 74*", "TIMES", "NOTE SELECT", "VALUE"), ("K2", "CTRL 71*", "THEN", "VELOCITY", "VALUE x16"),
         ("K3", "CTRL 1*", "CHAIN HOLD", "START", "-"), ("K4", "CTRL 11*", "JUMP MODE", "LENGTH", "-"),
         ("K5", "TRACK", "SONG", "NOTE", "LINE"), ("K6", "CLIP BANK", "-", "BAR", "-"),
         ("K7", "-", "SONG", "PROBABILITY", "-"), ("K8", "MASTER VOLUME", "MASTER VOLUME", "MASTER VOLUME", "MASTER VOLUME")]
FADERS = ["LEVEL T1 / T5", "LEVEL T2 / T6", "LEVEL T3 / T7", "LEVEL T4 / T8"]

# ---- the stickers: (id, title, x0, y0, x1, y1) in drawing pixels -------------------------------------------------
BAND = (514, 610)                           # the free band between the panels / pads and the keys
STICKERS = {
    "A": ("left buttons", LEFT_PANEL[0], BAND[0], LEFT_PANEL[2], BAND[1]),
    "B": ("pads and knobs", PAD_X[0][0], BAND[0], PAD_X[7][1], BAND[1]),
    "C": ("right buttons", RIGHT_PANEL[0], BAND[0], RIGHT_PANEL[2], BAND[1]),
    "D": ("faders", 2206, 354, 2864, 380),
}


def inch(px):
    return px * IN_PER_PX


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
    if key == "A":
        rh = h / 3
        for r, row in enumerate(LEFT):
            for c, (_, name, what) in enumerate(row):
                cx = lx((LEFT_COLS[c][0] + LEFT_COLS[c][1]) / 2)
                out.append(text(cx, r * rh + rh * 0.52, name, 5.8))
                out.append(text(cx, r * rh + rh * 0.90, what, 3.2, "400"))
            if r:
                out.append('<line x1="0.03" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.004"/>' % (r * rh, w - 0.03, r * rh))
        out.append('<line x1="%.4f" y1="0.03" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.004"/>' % (w / 2, w / 2, h - 0.03))
    elif key == "C":
        rh = h / 2
        for r, row in enumerate(RIGHT):
            for c, (_, name, what) in enumerate(row):
                cx = lx((RIGHT_COLS[c][0] + RIGHT_COLS[c][1]) / 2)
                out.append(text(cx, r * rh + rh * 0.50, name, 7))
                out.append(text(cx, r * rh + rh * 0.86, what, 3.3, "400"))
        out.append('<line x1="0.03" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.004"/>' % (rh, w - 0.03, rh))
        for c in range(1, 6):
            x = lx((RIGHT_COLS[c - 1][1] + RIGHT_COLS[c][0]) / 2)
            out.append('<line x1="%.4f" y1="0.03" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.004"/>' % (x, x, h - 0.03))
    elif key == "B":
        rows = ["CLIPS", "SCENES", "STEP", "SETTING"]
        top = 0.135                           # the pad line
        for k, (name, *vals) in enumerate(KNOBS):
            cx = lx((PAD_X[k][0] + PAD_X[k][1]) / 2)
            x_l, x_r = lx(PAD_X[k][0]), lx(PAD_X[k][1])
            out.append(text(cx, 0.095, "SHIFT+PAD: TRACK %d / MUTE %d" % (k + 1, k + 1), 3.6, "700"))
            out.append(text(x_l + 0.03, top + (h - top) * 0.55, name, 8, "700", "start"))
            if name == "K8":
                out.append(text(x_r - 0.03, top + (h - top) * 0.36, "MASTER", 4.6, "700", "end"))
                out.append(text(x_r - 0.03, top + (h - top) * 0.58, "VOLUME", 4.6, "700", "end"))
                out.append(text(x_r - 0.03, top + (h - top) * 0.80, "EVERY PAGE", 2.8, "400", "end"))
            else:
                for i, v in enumerate(vals):
                    y = top + (h - top - 0.05) * (i + 0.85) / 4.0
                    out.append(text(x_l + 0.24, y, rows[i], 2.8, "400", "start"))
                    out.append(text(x_r - 0.03, y, v, 4.6, "700", "end"))
            if k:
                x = lx((PAD_X[k - 1][1] + PAD_X[k][0]) / 2)
                out.append('<line x1="%.4f" y1="0.03" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.004"/>' % (x, x, h - 0.03))
        out.append('<line x1="0.03" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#000" stroke-width="0.004"/>' % (top, w - 0.03, top))

    elif key == "D":
        for k, s in enumerate(FADERS):
            out.append(text(lx(FADER_X[k]), h * 0.70, s, 5.6))
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
            o.append(text((ax + bx) / 2, ay - 0.05 if label_above else ay + 0.2, '%.2f"' % (bx - ax), 11, "700", "middle", "#c00"))
        def dim_v(x, ya, yb, right=True):
            (ax, ay), (_, by) = pos(x, ya), pos(x, yb)
            o.append('<line x1="%.4f" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#c00" stroke-width="0.006"/>' % (ax, ay, ax, by))
            for y in (ay, by):
                o.append('<line x1="%.4f" y1="%.4f" x2="%.4f" y2="%.4f" stroke="#c00" stroke-width="0.006"/>' % (ax - 0.06, y, ax + 0.06, y))
            o.append(text(ax + (0.06 if right else -0.06), (ay + by) / 2 + 0.05, '%.2f"' % (by - ay), 11, "700", "start" if right else "end", "#c00"))
        for n, key in enumerate(("A", "B", "C")):
            _, x0, y0, x1, y1 = STICKERS[key]
            dim_h(CASE[0], x0, KEYBED_Y + 120 + 110 * n, False)
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
    for n, (dy, label) in enumerate(((1.75, True), (5.45, False))):
        if not label:
            p.append(text(0.5, dy - 0.25, "Spare set (the same four stickers)", 9, "700", "start"))
        for key, (x, y) in (("B", (0.5, dy)), ("C", (0.5, dy + 1.05)), ("A", (5.3, dy + 1.05)), ("D", (0.5, dy + 2.1))):
            s, w, h = sticker_svg(key, x, y)
            p.append(text(x, y - 0.07, 'Sticker %s  -  %s  -  %.2f" x %.2f"  (%.1f x %.1f mm)' % (key, STICKERS[key][0], w, h, w * 25.4, h * 25.4), 7.5, "700", "start"))
            p.append(s)
    p.append(text(0.5, 8.2, "Sizes fit sticker paper cut by hand, or label tape: A, B, C on 18 mm (3/4\") tape trimmed to 0.59\"; D on 6 mm (1/4\") tape trimmed to 0.16\". docs/STICKERS.md has every text and position.", 7.5, "400", "start"))
    p.append("</svg>")
    pages.append("\n".join(p))
    # page 2: where they go, half size, dimensioned
    p = ['<svg xmlns="http://www.w3.org/2000/svg" width="11in" height="8.5in" viewBox="0 0 11 8.5">']
    p.append(text(0.5, 0.55, "Page 2 of 4: where the stickers go  -  the panel at half size; dimensions in inches at full size, from the case's back left corner", 12, "700", "start"))
    p.append(text(0.5, 0.78, "Grey: the button fields with the words printed on the device. Yellow: stickers A to D. Stickers A, B and C sit in the free band between the buttons / pads and the keys.", 8.5, "400", "start"))
    p.append('<g transform="translate(0.75 1.6) scale(0.5)">' + panel_svg(0.5, dims=True) + "</g>")
    p.append(text(0.5, 6.6, "Sticker tops: A, B, C  %.2f\" from the back edge (the band is %.2f\" to %.2f\"; the keys begin at %.2f\").  D  %.2f\" from the back edge." % (
        pos(0, BAND[0])[1], pos(0, LEFT_PANEL[3])[1], pos(0, KEYBED_Y)[1], pos(0, KEYBED_Y)[1], pos(0, STICKERS["D"][2])[1]), 9, "400", "start"))
    p.append(text(0.5, 6.85, "Left edges from the case's left edge: A %.2f\"   B %.2f\"   C %.2f\"   D %.2f\".   Each sticker is as wide as the group above it, so its columns line up with the buttons, pads and knobs." % (
        pos(STICKERS["A"][1], 0)[0], pos(STICKERS["B"][1], 0)[0], pos(STICKERS["C"][1], 0)[0], pos(STICKERS["D"][1], 0)[0]), 9, "400", "start"))
    p.append(text(0.5, 7.1, "Easier than measuring: line up the left edge of A with the left edge of the left button field, B with the left edge of pad 1,", 9, "400", "start"))
    p.append(text(0.5, 7.35, "C and D with the left edge of the right button field (D starts 0.04\" further right). Pages 3 and 4 show the same at actual size.", 9, "400", "start"))
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
    m = {"source": "M-VAVE SMK-37 PRO user manual, top-view line drawing (2962 x 1732 px); scale from the published case width",
         "case_width_mm": CASE_WIDTH_MM, "inch_per_pixel": IN_PER_PX,
         "case_in": [inch(CASE[2] - CASE[0]), inch(CASE[3] - CASE[1])], "case_mm": [inch(CASE[2] - CASE[0]) * 25.4, inch(CASE[3] - CASE[1]) * 25.4],
         "stickers": {}, "controls": {}}
    for key, (title, x0, y0, x1, y1) in STICKERS.items():
        x, y = pos(x0, y0)
        m["stickers"][key] = {"title": title, "left_in": round(x, 3), "top_in": round(y, 3), "width_in": round(inch(x1 - x0), 3), "height_in": round(inch(y1 - y0), 3),
                              "width_mm": round(inch(x1 - x0) * 25.4, 1), "height_mm": round(inch(y1 - y0) * 25.4, 1)}
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
        print('| %s | %s | %.2f" x %.2f" (%.1f x %.1f mm) | %.2f" | %.2f" |' % (key, s["title"], s["width_in"], s["height_in"], s["width_mm"], s["height_mm"], s["left_in"], s["top_in"]))
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
    (out / "measurements.json").write_text(json.dumps(measurements(), indent=1) + "\n")
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
