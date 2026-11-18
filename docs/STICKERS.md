# Classic Tabby stickers for the SMK-37 Pro

Version 0.3 (2026-11-17). For tabby-v04.18 and docs/CONTROL-MAP.md v0.13.
v0.3: checked against a photograph of the unit; stickers A, B and C redesigned because the place v0.2 gave them
carries printing; the stickers now say what a control does, since every document and the screen use the printed
names. v0.2: dimensions in inches as fractions to 1/32.

Classic Tabby calls every button by the word M-VAVE printed on it (KNOB BANK, CHORD, PARA ...). Those words say
little about what the buttons do here. These four stickers put the function under each button, name the tracks
under the pads with what the knob above does, and name the faders.

Files:

| File | What it is |
| --- | --- |
| docs/stickers/classic-tabby-stickers.pdf | Print-ready, US Letter landscape, four pages. Page 1: the stickers at actual size, twice (one spare set), with a 5-inch check bar. Page 2: where they go, dimensioned. Pages 3 and 4: the panel at actual size in two halves, with the stickers in place and the printing they must not cover in blue: a paper template to lay on the panel. |
| docs/stickers/classic-tabby-stickers.html | The same pages as HTML with SVG (the PDF is printed from it). |
| docs/stickers/measurements.json | Every number below, unrounded, and what was read from the photograph. |
| tools/linux/stickers.py | Makes all three. The measurements and the texts are tables at its top. |

Print at 100 % ("actual size", no "fit to page"). The bar on page 1 must measure exactly 5 inches.

## 1. The four stickers

Every dimension is in inches, as a fraction to the nearest 1/32. Positions are from the back left corner of the
case, looking down at the panel with the keys towards you: "left" is from the case's left edge to the sticker's
left edge, "top" from the case's back edge to the sticker's top edge.

| Sticker | Under | Width x height | Left | Top |
| --- | --- | --- | --- | --- |
| A | the six left buttons | 1 5/16 x 7/32 | 2 17/32 | 3 1/8 |
| B | the pads | 8 7/16 x 7/32 | 4 17/32 | 3 1/8 |
| C | the twelve right buttons | 4 1/8 x 7/32 | 13 7/16 | 3 1/8 |
| D | the four faders, between the slots' ends and the right buttons | 4 1/16 x 5/32 | 13 15/32 | 2 1/8 |

Where A, B and C go. Under the button fields and under the lower pad row the panel is printed: first the transport
symbols under the pads (play, pause, record, rewind, fast forward, <, >, UNDO), then, just above the keys, a strip
with two lines of M-VAVE's key functions (ARP: UP, DOWN, INCL ...; GLOB: CHN 1 to 16, PRE 1 to 8; RATE 1/4 to
1/32T; RESET). Between the two there is a clear gap, 11/32 high, from 3 1/16 to 3 13/32 from the back edge.
A, B and C are 7/32 high and sit in the middle of that gap, about 1/16 clear of the printing above and below.
**No sticker covers any printing.** Version 0.2 of this sheet put 19/32-high stickers there, which would have
covered the whole function strip; that was wrong and came from measuring a drawing that does not show the printing.

The quick way to place them: centre each one in the gap by eye; line up A with the left edge of the left button
field, B with the left edge of the upper left pad, C with the left edge of the right button field. D goes in the
clear space between the lower ends of the fader slots and the right button field.

If you would rather have large, readable labels: the function strip is the only large area near the controls, and
Classic Tabby uses none of the functions printed on it. Covering it would be a deliberate replacement of that
text. This sheet does not do that; say so and I will make that version.

Columns inside the stickers, from each sticker's own left edge to the column's centre:

| Sticker | Column centres |
| --- | --- |
| A (2 columns) | 11/32, 15/16 |
| B (8 columns, one per pad column) | 7/16, 1 1/2, 2 19/32, 3 11/16, 4 3/4, 5 27/32, 6 15/16, 8 |
| C (6 columns) | 7/16, 1 3/32, 1 3/4, 2 13/32, 3 1/32, 3 11/16 |
| D (4 faders) | 3/8, 1 15/32, 2 19/32, 3 11/16 |

For a label maker: all four fit 1/4 inch (6 mm) tape, A, B and C trimmed to 7/32, D to 5/32. Black on white. The
type is small because the gap is: 3.3 to 4.4 point on A, B and C (1 point = 1/72 inch), 5.6 point on D. That needs
sharp print (600 dpi or a laser printer) and is read from close up, not from playing distance.

## 2. What each sticker says

### Sticker A (left buttons; two columns, three rows, as the buttons lie)

| Printed on the button | Sticker |
| --- | --- |
| KNOB BANK | SHIFT: 2ND FUNCTION |
| FADER BANK | FADERS T1-4 / T5-8 |
| < | AS PATCH |
| > | SAVE / CONFIRM |
| OCTAVE- | PREV BANK / BAR |
| OCTAVE+ | NEXT BANK / BAR |

### Sticker C (right buttons; six columns, two rows, as the buttons lie)

| Printed on the button | Sticker |
| --- | --- |
| ARP | ARPEGGIATOR |
| NOTE REPEAT | KEYS / PADS |
| SCALE | CLIPS <> SCENES |
| CHORD | TO SCENES |
| GLOBE | MIXER |
| BT | CLIPS PAGE |
| PATCH | OVERVIEW |
| PARA | STEP PAGE |
| FX | SETTING / UNDO |
| SEQ | SYNC / MIDI |
| SEQ PLAY | START / STOP |
| SEQ REC | TAKE |

### Sticker B (eight columns, one under each pad column)

Upper line of column n: KNOB BANK: TRACK n / MUTE n (KNOB BANK held, one pad of the column selects track n and
the other mutes it; see 4.2 for which is which). Lower line: the knob above that column on the two pages a song is
played from:

- K1 CLIPS CTRL 74*  SCENES TIMES
- K2 CLIPS CTRL 71*  SCENES THEN
- K3 CLIPS CTRL 1*  SCENES HOLD
- K4 CLIPS CTRL 11*  SCENES JUMP
- K5 CLIPS TRACK  SCENES SONG
- K6 CLIPS CLIP BANK
- K7 SCENES SONG
- K8 MASTER VOLUME

\* The controller numbers are the song's (CLIP SETTING, the song's page); 74, 71, 1 and 11 until you change them.

The knobs on every clip page (not on a sticker; there is no room):

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

### Sticker D (faders)

LEVEL T1 / T5, LEVEL T2 / T6, LEVEL T3 / T7, LEVEL T4 / T8, each centred under its fader (FADER BANK switches
between tracks 1 to 4 and 5 to 8). The panel prints FADER1 to FADER4 above the slots; D does not cover that.

## 3. How the panel was measured

Two sources.

1. **The top-view line drawing** in M-VAVE's SMK-37 PRO user manual (2962 x 1732 pixels, no perspective), scaled
   by the published case width of 458 mm (18 1/32 inch): 0.006160 inch per pixel. The case depth then comes out at
   181.0 mm against a published 181 mm. Every control position comes from it (tools/linux/stickers.py, the tables
   at the top).
2. **The photograph of the unit** (2026-11-17, 2016 x 1512 pixels, taken from above with a tape measure along the
   front edge). It was used to read the printing and to check the drawing.

What the photograph gave:

- Scale. The case is 1901 pixels wide at the panel: 105.4 pixels per inch with the published width. The tape reads
  99.3 pixels per inch, 6 % fewer, because it lies on the desk, further from the camera than the
  panel. So the tape confirms the size to within that perspective effect, not better; it cannot replace the
  published width as the scale. Front to back the case measures 7 1/32 in the photograph against the published
  7 1/8 (its front edge is rounded and lower), so front-to-back figures from the photograph are good to about 1.5 %.
- Left to right, the photograph agrees with the drawing within 1/16 everywhere checked:

| Item, inches from the case's left edge | Drawing | Photograph |
| --- | --- | --- |
| Left edges of the eight pad columns | 4 17/32, 5 5/8, 6 11/16, 7 25/32, 8 7/8, 9 15/16, 11 1/32, 12 1/8 | 4 17/32, 5 21/32, 6 3/4, 7 27/32, 8 29/32, 9 31/32, 11 1/16, 12 1/8 |
| Knob centres K1 to K8 | 4 31/32, 6 1/16, 7 1/8, 8 7/32, 9 9/32, 10 3/8, 11 15/32, 12 17/32 | 4 31/32, 6 3/32, 7 5/32, 8 1/4, 9 5/16, 10 13/32, 11 15/32, 12 9/16 |
| Left button field: left edge, width | 2 17/32, 1 5/16 | 2 1/2, 1 9/32 |
| Right button field: left edge, width | 13 7/16, 4 1/8 | 13 1/2, 4 1/8 |
| Fader centres | 13 27/32, 14 15/16, 16 1/32, 17 5/32 | 13 7/8, 15, 16 1/8, 17 7/32 |
| Pad size | 7/8 x 11/16 | 27/32 x 11/16 |

- Front to back (inches from the case's back edge), where the drawing was wrong or silent:

| Item | Drawing | Photograph |
| --- | --- | --- |
| Pad rows, top edges | 1 11/32, 2 1/8 | 1 5/16, 2 5/32 |
| Lower ends of the fader slots | 2 3/32 | 2 1/32 |
| Right button field, top edge | 2 5/16 | 2 3/8 |
| Transport symbols under the lower pads | not shown as printing | 2 15/16 to 3 1/16 |
| Function strip above the keys | not shown | 3 13/32 to 3 3/4 |
| The keys begin | 3 25/32 | 3 13/16 |

- The printing, read from the photograph: the left group is headed PAD BANK and its buttons are KNOB BANK, FADER
  BANK, <, >, OCTAVE-, OCTAVE+; the right group is ARP, NOTE REPEAT, SCALE, CHORD, GLOBE, BT above PATCH, PARA, FX,
  SEQ, SEQ PLAY, SEQ REC; the knobs are K1 to K8, the faders FADER1 to FADER4, the wheels PITCH and MOD. This is
  what M-VAVE's drawing shows and what the user read. Two buttons were lit and partly washed out in the picture
  (OCTAVE- and PATCH); their words agree with the drawing and the user's reading.

The sticker widths and left edges are kept from the drawing (the photograph confirms them within 1/16 and is the
less exact of the two left to right). The sticker tops come from the photograph.

Expected accuracy: 1/32 for the sticker sizes and for the gap they sit in (measured over a short distance); about
1/16 for positions across the panel.

## 4. What still could not be measured or read

1. **Which pad row is pads 1 to 8.** The pads carry no numbers, so the photograph cannot say. The workbench drawing
   (M-VAVE's own) puts pads 1 to 8 in the upper row; sticker B says TRACK n / MUTE n without naming the row. To
   settle it: hold KNOB BANK and press the upper left pad; the screen says TRACK SELECTED if the upper row is
   pads 1 to 8.
2. **Heights and overhang.** A view from above shows no heights: how far a fader cap overhangs the lower end of its
   slot when the fader is fully down (it may hide part of sticker D, which starts 3/32 below the slot ends), and
   whether the knob skirts shade the K1 to K8 printing.
3. **The gap for A, B and C to better than 1/32.** It is 11/32 in the photograph (37 pixels). If the stickers look
   tight on the unit, trim them to 3/16.
4. **Absolute size from the tape.** The tape is in a different plane from the panel (section 3); a tape laid on the
   panel itself, across the knobs' printing, would give the scale directly.
5. **Surface.** Whether the gap is flat and smooth enough for a sticker to hold (the photograph shows a matt, flat
   surface; no seam is visible).
6. **Corner radii and the bevel of the case.** Not needed for these stickers.
