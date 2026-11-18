# Classic Tabby stickers for the SMK-37 Pro

Version 0.2 (2026-11-17). Labels as in docs/CONTROL-MAP.md v0.9 (tabby-v04.14); they are the same in v0.11 (tabby-v04.16).
v0.2: every dimension in inches as fractions to 1/32; the photograph the check was to use was not found (3.1).

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

Every dimension is in inches, as a fraction to the nearest 1/32 (what a ruler shows). The unrounded decimals are in
docs/stickers/measurements.json. Positions are measured from the back left corner of the case, looking down at the
panel with the keys towards you: "left" is the distance from the case's left edge to the sticker's left edge,
"top" the distance from the case's back edge to the sticker's top edge.

| Sticker | Under | Width x height | Left | Top |
| --- | --- | --- | --- | --- |
| A | the six left buttons | 1 5/16 x 19/32 | 2 17/32 | 3 1/8 |
| B | the pads (and, above them, the knobs) | 8 7/16 x 19/32 | 4 17/32 | 3 1/8 |
| C | the twelve right buttons | 4 1/8 x 19/32 | 13 7/16 | 3 1/8 |
| D | the four faders, between the slots and the right buttons | 4 1/16 x 5/32 | 13 15/32 | 2 1/8 |

A, B and C lie in the free band between the button fields / pads and the keys. The band runs from 3 1/16 to 3 25/32
from the back edge (23/32 high); the stickers use 3 1/8 to 3 23/32 and leave the transport symbols printed under the
lower pads visible. Each sticker is exactly as wide as the group above it and its columns sit under that group's
columns. The quick way to place them: line up A with the left edge of the left button field, B with the left edge
of pad 1 (the upper left pad), C with the left edge of the right button field.

Columns inside the stickers, from each sticker's own left edge to the column's centre:

| Sticker | Column centres |
| --- | --- |
| A (2 columns) | 11/32, 15/16 |
| B (8 columns, one per pad column) | 7/16, 1 1/2, 2 19/32, 3 11/16, 4 3/4, 5 27/32, 6 15/16, 8 |
| C (6 columns) | 7/16, 1 3/32, 1 3/4, 2 13/32, 3 1/32, 3 11/16 |
| D (4 faders) | 3/8, 1 15/32, 2 19/32, 3 11/16 |

For a label maker: A, B and C fit 3/4 inch (18 mm) tape trimmed to 19/32 inch, D fits 1/4 inch (6 mm) tape trimmed
to 5/32 inch. Black on white is drawn (the user's choice of 2026-11-17). Type sizes are in points, the printer's
unit (1 point = 1/72 inch): the large words are 5.8 to 8 point, the small ones 2.8 to 4.6 point; sharp print
(600 dpi or a laser printer) is needed for the small ones.

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

Measured, in inches to the nearest 1/32 (from the case's back left corner where a position is given):

| Item | Value |
| --- | --- |
| Case, top view | 18 1/32 x 7 1/8 |
| Knobs K1 to K8 | centres 25/32 from the back; from the left: 4 31/32, 6 1/16, 7 1/8, 8 7/32, 9 9/32, 10 3/8, 11 15/32, 12 17/32; diameter 21/32 |
| Pads | 7/8 x 11/16 each; left edges 4 17/32, 5 5/8, 6 11/16, 7 25/32, 8 7/8, 9 15/16, 11 1/32, 12 1/8; row tops 1 11/32 and 2 1/8 |
| Left button field | 1 5/16 x 1 1/32, at 2 17/32 from the left, 2 1/32 from the back |
| Right button field | 4 1/8 x 3/4, at 13 7/16 from the left, 2 5/16 from the back; six buttons across, 21/32 from one to the next |
| Button caps | 19/32 x 9/32 |
| Fader slots | centres at 13 27/32, 14 15/16, 16 1/32, 17 5/32 from the left; from 17/32 to 2 3/32 from the back; cap 5/8 wide |
| Display window | 1 1/2 x 1 15/32, at 2 7/16 from the left, 3/8 from the back |
| Free band under the buttons and pads | 3 1/16 to 3 25/32 from the back, the whole width |
| White keys | 25/32 wide, 22 of them |

Each position is rounded by itself. Do not add up a spacing (for example 21/32 six times): use the listed
positions, or the unrounded numbers in measurements.json.

Expected accuracy: about 1/32 inch for positions next to each other, about 1/16 inch across the whole width,
because the scale rests on a published width given to the millimetre (458 mm, 18 1/32 inch) and each number is
rounded to 1/32.

### 3.1 The photograph of 2026-11-17: not found

The user named a photograph of the unit taken from straight above with a tape measure along the front edge,
~/Documents/Classic Tabby/panel.jpg, to check these numbers and to read the printed labels and the pad rows. On
2026-11-17 no such file was on this computer: no panel.jpg in that folder and no image newer than a day anywhere
under the home directory except files of another project. So nothing in this document has been checked against
the unit yet. When the photograph is there: the tape gives the scale along the front edge; every position in the
table above is compared with it and corrected; sections 4.1 to 4.3 are closed.

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
   is fully down (the cap is 5/8 wide and its travel ends 1/32 above the sticker).
6. **The gap sticker D sits in.** It is 7/32 high in the drawing (slot ends at 2 3/32, the button field begins at
   2 5/16). The sticker is 5/32. If the gap is tighter on the unit, D can instead cover the printed FADER1 to FADER4
   above the slots (the same width, 5/16 from the back).
7. **Corner radii, the case's bevel and the colour of the panel** (which decides black on white or white on black).
8. **The wheels, the display and the back panel** get no sticker: CONTROL-MAP.md gives them no Classic Tabby name
   that differs from what is printed.
