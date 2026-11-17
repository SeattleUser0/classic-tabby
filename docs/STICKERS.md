# Classic Tabby stickers for the SMK-37 Pro

Version 0.1 (2026-11-17). Labels as in docs/CONTROL-MAP.md v0.9 (tabby-v04.14).

The words printed on the SMK-37 are M-VAVE's (KNOB BANK, NOTE REPEAT, CHORD, PARA ...). Classic Tabby uses the
buttons for other things and calls them by other names (SHIFT, PAD / STEP, ENV, EDIT ...). These four stickers put
the Classic Tabby name under every button, say what each knob does on each clip page, and name the faders.

Files:

| File | What it is |
| --- | --- |
| docs/stickers/classic-tabby-stickers.pdf | Print-ready, US Letter landscape, four pages. Page 1: the stickers at actual size, twice (one spare set), with a 5-inch check bar. Page 2: where they go, dimensioned. Pages 3 and 4: the panel at actual size in two halves, with the stickers in place (a template to lay on the device). |
| docs/stickers/classic-tabby-stickers.html | The same pages as HTML with SVG (the PDF is printed from it). |
| docs/stickers/measurements.json | Every number below, unrounded. |
| tools/linux/stickers.py | Makes all three. The measurements and the label texts are tables at its top. |

Print at 100 % ("actual size", no "fit to page"). The bar on page 1 must measure exactly 5 inches.

## 1. The four stickers

All dimensions are inches; millimetres in brackets. Positions are measured from the back left corner of the case,
looking down at the panel with the keys towards you: "left" is the distance from the case's left edge to the
sticker's left edge, "top" the distance from the case's back edge to the sticker's top edge.

| Sticker | Under | Width x height | Left | Top |
| --- | --- | --- | --- | --- |
| A | the six left buttons | 1.30 x 0.59 (33.0 x 15.0) | 2.54 | 3.11 |
| B | the pads (and, above them, the knobs) | 8.44 x 0.59 (214.4 x 15.0) | 4.54 | 3.11 |
| C | the twelve right buttons | 4.14 x 0.59 (105.2 x 15.0) | 13.42 | 3.11 |
| D | the four faders, between the slots and the right buttons | 4.05 x 0.16 (103.0 x 4.1) | 13.47 | 2.12 |

A, B and C lie in the free band between the button fields / pads and the keys. The band runs from 3.06 to 3.78
from the back edge (0.72 high); the stickers use 3.11 to 3.70 and leave the transport symbols printed under the
lower pads visible. Each sticker is exactly as wide as the group above it and its columns sit under that group's
columns. The quick way to place them: line up A with the left edge of the left button field, B with the left edge
of pad 1 (the upper left pad), C with the left edge of the right button field.

For a label maker: A, B and C fit 18 mm (3/4 inch) tape trimmed to 0.59 inch, D fits 6 mm (1/4 inch) tape trimmed to
0.16 inch. Black on white is drawn; white on black or clear works as well. The large words are 5.8 to 8 point, the
small ones 2.8 to 4.6 point: sharp print (600 dpi or a laser printer) is needed for the small ones.

## 2. What each sticker says

### Sticker A (left buttons; two columns, three rows, as the buttons lie)

| Printed on the device | Sticker | Small line |
| --- | --- | --- |
| KNOB BANK | SHIFT | PADS: TRACKS, MUTES |
| FADER BANK | FADER BANK | FADERS T1-4 / T5-8 |
| < | HOME | +PLAY: STOP ALL |
| > | SAVE | SAVES (STOPPED) |
| OCTAVE- | OCT - | PREV 16 / BAR |
| OCTAVE+ | OCT + | NEXT 16 / BAR |

SAVE is the button the documents call "the 4th button in the left group" and the screen calls 4TH LEFT BTN: on
CLIPS, SCENES and CLIP SETTING it saves the song, on the STEP page the clip, on the overview it opens SAVE PROJECT.

### Sticker C (right buttons; six columns, two rows)

| Printed on the device | Sticker | Small line |
| --- | --- | --- |
| ARP | ARP | ARPEGGIATOR |
| NOTE REPEAT | PAD / STEP | KEYS / PADS FOCUS |
| SCALE | SCL | CLIPS <> SCENES |
| CHORD | ENV | TO SCENES (SHIFT: ALL) |
| GLOBE | MIX | MIXER |
| BT | BT | CLIPS PAGE |
| PATCH | HOME / SRC | SHIFT: SOURCE |
| PARA | EDIT | STEP PAGE |
| FX | FX | SETTING / UNDO |
| SEQ | SEQ | SYNC  +EDIT: ACTIONS |
| SEQ PLAY | PLAY | START / STOP |
| SEQ REC | REC | TAKE (SHIFT: QUANT) |

### Sticker B (eight columns, one under each pad column and knob)

Top line of column n: SHIFT+PAD: TRACK n / MUTE n (SHIFT with the upper pad selects track n, with the lower pad
mutes it). Below it, the knob above that column and what it does on each page:

| Knob | CLIPS | SCENES | STEP | SETTING |
| --- | --- | --- | --- | --- |
| K1 | CTRL 74* | TIMES | NOTE SELECT | VALUE |
| K2 | CTRL 71* | THEN | VELOCITY | VALUE x16 |
| K3 | CTRL 1* | CHAIN HOLD | START | - |
| K4 | CTRL 11* | JUMP MODE | LENGTH | - |
| K5 | TRACK | SONG | NOTE | LINE |
| K6 | CLIP BANK | - | BAR | - |
| K7 | - | SONG | PROBABILITY | - |
| K8 | MASTER VOLUME on every page | | | |

\* The controller numbers are the song's (CLIP SETTING, page 2/2); 74, 71, 1 and 11 are what a song uses until
you change them.

### Sticker D (faders)

LEVEL T1 / T5, LEVEL T2 / T6, LEVEL T3 / T7, LEVEL T4 / T8, each centred under its fader (FADER BANK switches
between tracks 1 to 4 and 5 to 8).

## 3. How the panel was measured

There are no photographs of the device on this computer, so nothing was measured from a photograph. The source is
better than a photograph: the top-view line drawing on the first page of M-VAVE's SMK-37 PRO user manual (an
orthographic drawing without perspective, 2962 x 1732 pixels in the PDF), which also shows the words printed on
every button.

1. Scale: the case outline in the drawing is 2927 pixels wide. The published case size is 458 x 181 x 50 mm (several
   listings; one gives 457 x 180 x 48). 458 mm / 2927 px = 0.1565 mm per pixel (0.006160 inch).
2. Check: with that scale the outline's depth, 1157 pixels, is 181.0 mm. The published depth is 181 mm. The drawing's
   proportions are therefore right to within about 0.5 %.
3. Every control was located as a closed region of the line art (pads, button caps, fader slots, the display
   window, the wheels) or by the edges of its outline along a row and a column (knobs, button fields, the keys),
   with numpy and scipy. The pixel coordinates are in tools/linux/stickers.py (PANEL tables at the top).
4. The workbench's panel drawing (the Play & edit tab) was used for the order of the controls only: it gives the
   button numbering (left group: SHIFT, FADER BANK, HOME, BTN 4, OCT -, OCT +; right group: ARP to REC) and shows
   pads 1 to 8 in the upper row. It is not to scale (its panel is 1000 : 624; the device is 1000 : 395).

Measured, in inches (from the case's back left corner where a position is given):

| Item | Value |
| --- | --- |
| Case, top view | 18.03 x 7.13 |
| Knobs K1 to K8 | centres 0.79 from the back; K1 at 4.97 from the left, then every 1.082; diameter 0.64 |
| Pads | 0.86 x 0.69 each; left edges 4.54, 5.62, 6.70, 7.78, 8.87, 9.95, 11.03, 12.11; row tops 1.33 and 2.14 |
| Left button field | 1.30 x 1.03, at 2.54 from the left, 2.03 from the back |
| Right button field | 4.14 x 0.75, at 13.42 from the left, 2.30 from the back; button pitch 0.649 |
| Button caps | 0.58 x 0.27 |
| Fader slots | centres at 13.84, 14.94, 16.05, 17.15 from the left; from 0.53 to 2.10 from the back; cap 0.62 wide |
| Display window | 1.50 x 1.47, at 2.44 from the left, 0.38 from the back |
| Free band under the buttons and pads | 3.06 to 3.78 from the back, the whole width |
| White keys | 0.769 wide (19.5 mm), 22 of them |

Expected accuracy: about 0.02 inch (0.5 mm) for positions next to each other, about 0.05 inch (1.3 mm) across the
whole width, because the scale rests on a published width given to the millimetre.

## 4. What could not be measured

1. **The device itself.** Every number comes from the manufacturer's drawing and the published case size. Before
   printing a batch, print page 3 and 4 on plain paper, lay them on the panel and check that the knobs, pads and
   buttons sit under their outlines.
2. **Whether the unit's printing matches the drawing.** The drawing shows KNOB BANK, <, >, CHORD, GLOBE, PATCH, PARA
   and so on. SPEC.md 17.4 lists most button labels as "not confirmed", and the 4th left button's label as unknown;
   by the drawing it is ">". Not checked against the unit.
3. **Pad numbering.** That SHIFT + the upper row selects tracks and the lower row mutes them follows the workbench
   drawing (pads 1 to 8 above). The firmware only knows pad numbers. If pads 1 to 8 are the lower row on the unit,
   read the top line of sticker B the other way round.
4. **The surface of the free band.** The drawing shows nothing between the buttons / pads and the keys, but a line
   drawing does not show a slope, a step, a seam or texture there. The side view suggests a flat top.
5. **Heights.** Knob, fader-cap and button heights, and so how much a fader cap hides of sticker D when the fader
   is fully down (the cap is 0.62 wide and its travel ends 0.02 above the sticker).
6. **The gap sticker D sits in.** It is 0.20 high in the drawing (slot ends at 2.10, the button field begins at
   2.30). The sticker is 0.16. If the gap is tighter on the unit, D can instead cover the printed FADER1 to FADER4
   above the slots (the same width, 0.30 from the back).
7. **Corner radii, the case's bevel and the colour of the panel** (which decides black on white or white on black).
8. **The wheels, the display and the back panel** get no sticker: CONTROL-MAP.md gives them no Classic Tabby name
   that differs from what is printed.
