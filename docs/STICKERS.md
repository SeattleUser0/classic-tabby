# Classic Tabby stickers for the SMK-37 Pro

Version 0.5 (2026-11-18). For tabby-v04.22 and docs/CONTROL-MAP.md v0.17.
v0.5: NOTE REPEAT on sticker C says what it does from tabby-v04.22.
v0.4: no type below 6 point (the user's rule: 3.3 to 4.4 point cannot be read on a dark stage). To make room, stickers
A, B and C now cover the strip of key functions printed above the keys, on purpose: section 2 lists every function
printed there and shows that none of them does anything in Classic Tabby. A fifth, optional sticker E covers the
rest of the strip. The pad rows are settled as far as the sources allow (5.1). v0.3: checked against a photograph of
the unit; the stickers say what a control does, since every document and the screen use the printed names. v0.2:
dimensions in inches as fractions to 1/32.

Classic Tabby calls every button by the word M-VAVE printed on it (KNOB BANK, CHORD, PARA ...). Those words say
little about what the buttons do here. These stickers put the function under each button, name the tracks under the
pads with what the knob above does, and name the faders.

Files:

| File | What it is |
| --- | --- |
| docs/stickers/classic-tabby-stickers.pdf | Print-ready, US Letter landscape, four pages. Page 1: the stickers at actual size, twice (one spare set), with a 5-inch check bar. Page 2: where they go, dimensioned. Pages 3 and 4: the panel at actual size in two halves with the stickers in place: a paper template to lay on the panel. |
| docs/stickers/classic-tabby-stickers.html | The same pages as HTML with SVG (the PDF is printed from it). |
| docs/stickers/measurements.json | Every number below, unrounded; the printed strip label by label with its position; what each sticker covers. |
| tools/linux/stickers.py | Makes all three. The measurements and the texts are tables at its top. It refuses type below 6 point. |

Print at 100 % ("actual size", no "fit to page"). The bar on page 1 must measure exactly 5 inches. Black on white.

## 1. The five stickers

Every dimension is in inches, as a fraction to the nearest 1/32. Positions are from the back left corner of the
case, looking down at the panel with the keys towards you: "left" is from the case's left edge to the sticker's
left edge, "top" from the case's back edge to the sticker's top edge.

| Sticker | Under | Width x height | Left | Top | Smallest type |
| --- | --- | --- | --- | --- | --- |
| A | the six left buttons | 1 27/32 x 11/16 | 2 1/4 | 3 3/32 | 6 point |
| B | the pads | 8 7/8 x 11/16 | 4 5/32 | 3 3/32 | 6 point |
| C | the twelve right buttons | 4 15/32 x 11/16 | 13 3/32 | 3 3/32 | 6 point |
| D | the four faders, between the slots' ends and the right buttons | 4 5/16 x 7/32 | 13 11/32 | 2 3/32 | 7 point |
| E (optional) | the wheels and the screen: the left end of the strip | 2 1/16 x 11/16 | 5/32 | 3 3/32 | 6 point |

All type is 6 point or larger (1 point = 1/72 inch; capitals 6 point high are a little over 1/16 inch). No line is
squeezed to fit. On a dark stage 6 point is still small: it is the floor you set, and the 11/16 height does not
allow more with these texts. If it is too small in use, say which lines matter most and I will cut the rest and
enlarge those.

Where they go, front to back. Under the button fields and under the lower pad row the panel is printed twice: the
transport symbols under the pads (2 15/16 to 3 1/16 from the back edge), and, just above the keys, the strip of key
functions (3 13/32 to 3 3/4). The keys begin at 3 13/16. A, B, C and E start at 3 3/32, 1/32 under the transport
symbols, and end at 3 25/32, 1/32 before the keys. **The transport symbols stay visible. The strip is covered.**
D sits in the clear space between the lower ends of the fader slots (2 1/32) and the right button field (2 3/8) and
covers no printing.

Where they go, left to right: their side edges lie in gaps of the strip's printing, so no printed word is cut in
half. Go by the printing, not by a ruler:

| Edge | Position | Landmark in the printed strip |
| --- | --- | --- |
| E left | 5/32 | just left of the printed ARP and GLOB |
| E right, A left | 2 7/32, 2 1/4 | between EXCL / CHN 4 and RAND / CHN 5 (a gap of 5/32) |
| A right, B left | 4 3/32, 4 5/32 | between OCT+ / CHN 8 and LATCH / CHN 9 (a gap of 1/4) |
| B right, C left | 13 1/32, 13 3/32 | between 1/8T / D# and 1/16 / E (a gap of 1/4) |
| C right | 17 9/16 | right of RESET, level with the right end of the right button field |

A, B and C are wider than the groups above them for that reason; the columns inside them still line up with the
buttons, pads and knobs. Neighbours almost touch (1/32 to 1/16 between them).

Columns inside the stickers, from each sticker's own left edge to the column's centre:

| Sticker | Column centres |
| --- | --- |
| A (2 columns) | 21/32, 1 7/32 (the two button columns; the dividing line is at 15/16) |
| B (8 columns, one per pad column) | 13/16, 1 29/32, 2 31/32, 4 1/16, 5 5/32, 6 7/32, 7 5/16, 8 3/8 |
| C (6 columns) | 25/32, 1 7/16, 2 1/16, 2 23/32, 3 3/8, 4 1/32 |
| D (4 faders) | 1/2, 1 19/32, 2 11/16, 3 13/16 |

For a label maker: A, B, C and E need 18 mm (3/4 inch) tape trimmed to 11/16, with up to five lines of 6 point;
most label makers cannot print that. Sticker paper cut by hand is the practical way. D fits 6 mm (1/4 inch) tape.

## 2. The printed strip: what it says, what still works, what is covered

The strip prints one label above every key, in two lines (read from the photograph; positions in
docs/stickers/measurements.json). They are the key functions of M-VAVE's own firmware: hold a button, press the key.

| Printed | M-VAVE's gesture | In Classic Tabby |
| --- | --- | --- |
| ARP: UP, DOWN, INCL, EXCL, RAND, ORDER, REPEAT, OCT+, LATCH, GATE+, GATE-, TAP, SWING+, SWING-, TEMPO+, TEMPO-, SYNC (upper line, keys 1 to 17) | hold ARP, press the key (M-VAVE's manual) | **Dead.** Holding ARP opens the ARP settings page; the knobs set rate, direction, range, gate, swing and hold. The key plays its note. |
| RATE: 1/4, 1/4T, 1/8, 1/8T, 1/16, 1/16T, 1/32, 1/32T (upper line, keys 25 to 32) | a held button and the key (the manual does not say which) | **Dead.** The arpeggiator's rate is K1 on the ARP page. |
| GLOB: CHN 1 to CHN 16 (lower line, keys 1 to 16) | by the label, GLOBE held and the key (not in the manual) | **Dead.** Holding GLOBE shows the mixer (pads mute and solo). Channels are on the MIDI TRACK page (KNOB BANK + SEQ). |
| PRE 1 to PRE 8 (lower line, keys 17 to 24) | as CHN | **Dead.** Projects are chosen with K7 on the overview. |
| SC: C, C#, D, D#, E, F, F#, G, G#, A, A#, B (lower line, keys 25 to 36) | by the label, SCALE held and the key | **Dead.** SCALE switches CLIPS and SCENES; there is no scale lock. The letters are also true as the names of those twelve keys; that is all they still say. |
| RESET (lower line, key 37) | a held button and the highest key | **Dead.** No key resets anything. Recovery is in the workbench. |

I know M-VAVE's gestures only from its manual, which describes ARP held with a key and nothing more; the others
are read off the labels. It does not matter which button M-VAVE meant: in Classic Tabby no key does anything but
play its note.

How this was checked: in Classic Tabby every key is sent as a note whatever button is held
(app/smk37_controls.c, `smk37_control_event`, the `SMK37_KEY` branch has no other path), and the screen code
(app/screen.c) reads the keys' own bits only as pad presses on the pages where the pads navigate. So nothing in the
strip still works, and nothing in it needed to be kept visible or carried over to a sticker. The functions that
replace them (ARP settings, channels, projects) are on pages, not on keys.

What each sticker covers, and why:

| Sticker | Covers (upper line / lower line) | Why |
| --- | --- | --- |
| E (optional) | ARP: UP, DOWN, INCL, EXCL / GLOB: CHN 1 to CHN 4 | Dead; without E this end of the strip stays visible and is simply wrong. |
| A | RAND, ORDER, REPEAT, OCT+ / CHN 5 to CHN 8 | Dead; room for two lines of 6 point under each left button. |
| B | LATCH, GATE+, GATE-, TAP, SWING+, SWING-, TEMPO+, TEMPO-, SYNC, RATE: 1/4, 1/4T, 1/8, 1/8T / CHN 9 to CHN 16, PRE 1 to PRE 8, SC: C, C#, D, D# | Dead; room for five lines under each pad column. |
| C | 1/16, 1/16T, 1/32, 1/32T / E, F, F#, G, G#, A, A#, B, RESET | Dead; room for up to three lines under each right button. The eight key names it hides are the only printed thing lost that was still true. |
| D | nothing | |

Not covered by any sticker: the transport symbols under the lower pads (play, pause, record, rewind, fast forward,
<, >, UNDO). They mean nothing in Classic Tabby either (no pad has a fixed transport function), but they are small
and the stickers do not need their place.

If you return the SMK-37 to M-VAVE's firmware the strip's functions work again and the stickers hide them.

## 3. What each sticker says

"KB" on the stickers means: with KNOB BANK held.

### Sticker A (left buttons; two columns, three rows, as the buttons lie)

| Printed on the button | Sticker |
| --- | --- |
| KNOB BANK | SHIFT: HOLD FOR / 2ND FUNCTIONS |
| FADER BANK | FADERS ON / T1-4 / T5-8 |
| < | AS PATCH: / OVERVIEW |
| > | SAVE / / CONFIRM |
| OCTAVE- | BANK / BAR - / KB: SHIFT CLIP |
| OCTAVE+ | BANK / BAR + / KB: SHIFT CLIP |

### Sticker C (right buttons; six columns, two rows, as the buttons lie)

| Printed on the button | Sticker |
| --- | --- |
| ARP | ARP ON/OFF / HOLD: SETUP |
| NOTE REPEAT | REPEATS (while held) / K1: RATE / KB: KEY/PAD (the focus switch) |
| SCALE | CLIPS OR / SCENES / STEP: PADS (on the STEP page it switches what a pad does) |
| CHORD | TRACK TO / SCENES / STEP: CLEAR |
| GLOBE | MIXER / MUTE / SOLO |
| BT | CLIPS PAGE / AGAIN: BACK |
| PATCH | OVERVIEW / KB: SOURCE |
| PARA | STEP PAGE / EDIT A CLIP |
| FX | SETTING / STEP: UNDO / TAKE: CLEAR |
| SEQ | SYNC / MIDI / + PARA: / ACTIONS |
| SEQ PLAY | PLAY / STOP / THE SONG |
| SEQ REC | TAKE / KB: INPUT / QUANTIZE |

From tabby-v04.22 NOTE REPEAT, held, repeats a held key or pad, and KNOB BANK + NOTE REPEAT is the keys / pads
focus switch; the sticker says so. With older firmware the button alone is the focus switch.

### Sticker B (eight columns, one under each pad column)

Three lines for the pads of column n: KNOB BANK + PAD: / UPPER: TRACK n / LOWER: MUTE n (KNOB BANK held, the upper
pad of the column selects track n, the lower one mutes it; which row is which is an assumption, section 5.1). Two
lines for the knob above that column:

- K1 CLIPS: CTRL 74* / SCENES: TIMES
- K2 CLIPS: CTRL 71* / SCENES: THEN
- K3 CLIPS: CTRL 1* / SCENES: HOLD
- K4 CLIPS: CTRL 11* / SCENES: JUMP
- K5 CLIPS: TRACK / SCENES: SONG
- K6 CLIPS: BANK / STEP: BAR
- K7 SCENES: SONG / STEP: PROBABILITY
- K8 MASTER / VOLUME

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
between tracks 1 to 4 and 5 to 8). 7 point. The panel prints FADER1 to FADER4 above the slots; D does not cover that.

### Sticker E (optional)

CLASSIC TABBY (10 point) / SEQ + PARA: ACTIONS / PATCH + SEQ PLAY: STOP ALL / KB = KNOB BANK HELD.

## 4. How the panel was measured

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

The columns inside the stickers come from the drawing (the photograph confirms them within 1/16 and is the less
exact of the two left to right). The stickers' tops, their height and their side edges come from the photograph,
because only the photograph shows the printing: the strip was measured label by label (the bright runs of its two
lines, 105.4 pixels per inch; the table is STRIP_LABELS in tools/linux/stickers.py and in measurements.json).

Expected accuracy: 1/32 for the sticker sizes and for the band they sit in (measured over a short distance); about
1/16 for positions across the panel, which is why the side edges are placed by the printed words.

## 5. What still could not be measured or read

### 5.1 Which pad row is pads 1 to 8: the upper row, as an assumption

Worked out from the sources, not seen on the unit (the pads carry no numbers and nobody has pressed one to look):

| Source | What it says | What it settles |
| --- | --- | --- |
| M-VAVE's own panel model in the SMK37 Open V01 kit (sdk/Simulator.js, the workbench's drawing of the SMK-37; the upstream copy is the same) | The 16 pads are made in id order into a grid of eight columns: pads 1 to 8 fill the upper row, 9 to 16 the lower. Its Help says SHIFT + Pads 1 to 8 select tracks, 9 to 16 mute. | Upper row = pads 1 to 8, if the drawing matches the unit. It is the manufacturer's drawing of its own panel, but a drawing. |
| The pads' LED chain (app/board/panel.c, `rgb_map` = 0, 15, 14 ... 9, 1, 2 ... 8; unchanged from upstream) | The chain runs pad 1, then pads 9 to 16, then pads 8 down to 2. A chain laid along one row and back along the other fits only if pads 1 to 8 are one row, 9 to 16 the other, both numbered left to right, with pad n and pad n + 8 in one column. | The columns and the left-to-right order: certain. Which row is the upper one: not. |
| The pad scan (app/board/scan.c, `padmap`) | ADC channels 0 to 7 are pads 1 to 8 and 8 to 15 are pads 9 to 16, in groups of four. | Two rows of two groups. Not which is upper. |
| M-VAVE's user manual | Does not number the pads; "Pad Bank ... pads 9-16" is a second bank. Its drawing shows the transport symbols under the lower row. | Nothing. |

So: the columns are certain, and "upper row = pads 1 to 8" rests on M-VAVE's panel model alone. It is used as an
**assumption** here and in docs/CONTROL-MAP.md 1.2, as you said. Sticker B prints UPPER: TRACK n and LOWER: MUTE n
on that assumption. If on the unit KNOB BANK with an upper pad mutes instead of selecting, the rows are the other
way round: tell me and UPPER and LOWER are swapped on the sheet (one table in tools/linux/stickers.py).

### 5.2 The rest

1. **Heights and overhang.** A view from above shows no heights: how far a fader cap overhangs the lower end of its
   slot when the fader is fully down (it may hide part of sticker D, which starts 1/16 below the slot ends), and
   whether the knob skirts shade the K1 to K8 printing.
2. **The band for A, B, C and E to better than 1/32.** From the transport symbols to the keys it is 3/4 in the
   photograph (79 pixels); the stickers take 11/16 of it. If they touch the keys on the unit, trim the lower edge.
   The side edges lie in gaps of the printing that are 5/32 to 1/4 wide, measured to about 1/32: place them by the
   printed words (section 1), not by a ruler.
3. **Absolute size from the tape.** The tape is in a different plane from the panel (section 4); a tape laid on the
   panel itself, across the knobs' printing, would give the scale directly.
4. **Surface.** Whether the band is flat and smooth enough for a sticker to hold (the photograph shows a matt, flat
   surface; no seam is visible).
5. **Corner radii and the bevel of the case.** Not needed for these stickers.
