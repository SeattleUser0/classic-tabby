# The timed note

Version 0.1 (2026-11-03, Task 05). A sequencer note that keeps its own timing: pitch,
velocity, a retrigger flag, a signed start offset from the grid step it belongs to, and an
exact length. One definition, two implementations that must agree byte for byte, one set
of test vectors. Written so the module can be lifted into another project: the C files
depend on `<stdint.h>` only, the JavaScript file on nothing.

| Piece | File |
| --- | --- |
| C header and source | `app/timed_note.h`, `app/timed_note.c` |
| JavaScript twin (classic script and CommonJS) | `web/timed-note/timed-note.js` |
| Shared test vectors and their generator (a third, independent implementation in Python) | `tests/timed-note/vectors.txt`, `tests/timed-note/make-vectors.py` |
| Tests | `tests/host/timed_note_test.c` (C), `tests/timed-note/run.mjs` (JS); `make timed-note-test` |
| Where Classic Tabby uses it | block payload format v2, docs/tasks/TASK-03-step1-assessment.md section 9.12 |

Revision log
- v0.1 2026-11-03: first version.

## 1. The object

| Field | Range | Meaning |
| --- | --- | --- |
| pitch | 0..127 | MIDI note number |
| velocity | 1..127 | note-on velocity (0 is not a note) |
| retrigger | 0 or 1 | 1: if the same pitch is still sounding on this track, send note-off then note-on; 0: legato, the sounding note is extended to this note's end and no new note-on is sent |
| offset | −240..+240 units | signed distance of the note's start from its anchor step's grid time; negative = early |
| length | 1..8388480 units | from the note's own start to its note-off |

**Units.** 1 unit = 1/480 of a 16th step = 1/1920 of a quarter note. Units are musical:
they scale with the tempo (at 120 BPM a unit is 0.26 ms, a step 125 ms). The values 96,
120, 192, 240, 384, 480, 960 and 1920 ticks per quarter note divide 1920, so files at those
resolutions convert exactly; anything else rounds to the nearest unit.

**Anchor.** The note belongs to the 16th step nearest its start; the container (here a
block's step list) names the step, the note carries the offset. A start exactly half a
step after a grid line belongs to the earlier step with offset +240. The offset's range,
plus or minus half a step, follows from that rule. A note nudged early therefore stays in
the step it is heard against, which is what an editor shows.

**Time.** start = anchor step × 480 + offset; note-off = start + length. Both are
positions on the straight grid; what a sequencer does with swing is its own business (in
Classic Tabby a song's swing flag warps each pair of steps, section 9.12).

## 2. The six bytes

Little-endian fields.

| Byte | Bits | Field |
| --- | --- | --- |
| 0 | 0..6 | pitch |
| 0 | 7 | retrigger |
| 1 | 0..6 | velocity (never 0) |
| 1 | 7 | reserved, 0 |
| 2..3 (u16) | 0..8 | offset, 9-bit two's complement (−256..255 representable, −240..+240 valid) |
| 2..3 | 9..11 | length exponent e, 0..7 |
| 2..3 | 12..15 | reserved, 0 |
| 4..5 (u16) | 0..15 | length mantissa m, 1..65535; length = m << e |

**Canonical rule.** e is 0 unless the length does not fit 16 bits; when e > 0, m ≥ 32768.
So every value has exactly one byte pattern, byte equality is value equality, and two
encoders written from this document produce identical bytes.

**Encoding a length.** For e = 0, 1, ... take m = round(length / 2^e) with ties rounded up
(m = (length + 2^(e−1)) >> e, half = 0 for e = 0); the first e with m ≤ 65535 is the one.
A rounded m of 65536 is not "fits": the next exponent takes it as exactly 32768. Lengths
above 65535 × 128 are refused by the encoder (clip them first); `length_stored` reports
what a length becomes.

**Exact range.**

| e | lengths exact to (units) | 16th steps | 4/4 bars | resolution |
| ---: | ---: | ---: | ---: | --- |
| 0 | 65535 | 136.53 | 8.53 | 1 unit |
| 1 | 131070 | 273.06 | 17.07 | 2 units |
| 2 | 262140 | 546.1 | 34.1 | 4 |
| 3 | 524280 | 1092.3 | 68.3 | 8 |
| 4 | 1048560 | 2184.5 | 136.5 | 16 |
| 5 | 2097120 | 4369 | 273 | 32 |
| 6 | 4194240 | 8738 | 546 | 64 |
| 7 | 8388480 | 17476 | 1092 | 128 (0.27 step) |

Every whole-step length up to 273 steps is exact (480 × L is even), so a sequencer whose
old format held whole steps converts without loss.

**Decoding refuses** a reserved bit set, velocity 0, mantissa 0, a non-canonical pair
(e > 0 with m < 32768) and an offset outside ±240. A decoder that accepts fewer things than
this is wrong; one that accepts more breaks the uniqueness.

## 3. The two implementations

C (`app/timed_note.h`):

```c
struct timed_note { uint8_t pitch, velocity, retrigger; int16_t offset; uint32_t length; };
int      timed_note_valid(const struct timed_note *n);            /* 1 when every field is in range */
uint32_t timed_note_length_stored(uint32_t length);               /* what the encoder stores */
int      timed_note_encode(const struct timed_note *n, uint8_t out[6]);  /* 0, or -1 invalid */
int      timed_note_decode(const uint8_t in[6], struct timed_note *n);   /* 0, or -1 refused */
static inline void timed_note_unpack(const uint8_t in[6], struct timed_note *n); /* no checks */
```

JavaScript (`web/timed-note/timed-note.js`, `globalThis.TabbyTimedNote` or `require`):
`valid(n)`, `lengthStored(length)`, `encode(n) → Uint8Array(6)` (throws), `decode(bytes)
→ {pitch, velocity, retrigger, offset, length}` (throws), the constants
`UNITS_PER_STEP`, `OFFSET_MAX`, `LENGTH_MAX`, and two display helpers: `offsetFraction(units)`
(a reduced fraction of a step, "+1/24") and `unitMs(bpm)`.

## 4. The vectors

`tests/timed-note/vectors.txt` is generated by `make-vectors.py`, whose encoder is written
from section 2 and not from either implementation. Four line forms:

```
ok <pitch> <velocity> <retrigger> <offset> <length> -> <12 hex digits>
bad <12 hex digits>
badfields <pitch> <velocity> <retrigger> <offset> <length>
round <length> -> <stored>
```

`ok`: encode gives exactly the bytes and decode exactly the fields (field edges, offsets at
and inside the limits, every exponent at both ends of its mantissa, the whole-step lengths
of the old format). `bad`: decode refuses (reserved bits, velocity 0, mantissa 0,
non-canonical pairs, offsets ±241 and −256, erased flash, all zero). `badfields`: the
validator refuses (pitch 128, velocity 0 and 128, retrigger 2, offsets ±241, length 0 and
above the maximum). `round`: the stored length for values that are not representable.
Both tests also walk every offset −240..240 and every exponent, and check that no two `ok`
vectors share bytes. A single differing byte fails the suite.

## 5. Lifting it into another project

Copy the three files (header, source, JavaScript) and the vectors with their test and
generator; keep the license header (GPL-3.0-only with the SMK37 SDK linking exception in
Classic Tabby; the files carry no other dependency). The container format is yours: put
the step index (and anything else, like a probability) in it, keep the six bytes as they
are, and reuse the vectors unchanged. If a field must change, add a format version in the
container, never reinterpret these bits.
