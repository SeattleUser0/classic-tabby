#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tests/timed-note/make-vectors.py — the shared test vectors of the timed note, from a third
implementation

Purpose
  Writes tests/timed-note/vectors.txt: the bytes that app/timed_note.c and
  web/timed-note/timed-note.js must produce and accept. The encoder below is written from
  docs/TIMED-NOTE.md alone (not from the C or the JS), so the three can only agree by
  implementing the document; tests/timed-note/run.mjs and tests/host/timed_note_test.c read
  this file and fail on a single differing byte.

  Line forms (one vector per line, '#' comments, blank lines ignored):
    ok <pitch> <velocity> <retrigger> <offset> <length> -> <12 hex digits>
        encode(fields) gives exactly these bytes and decode(bytes) gives exactly these fields
        (the length is representable: no rounding)
    bad <12 hex digits>
        decode must refuse these bytes
    badfields <pitch> <velocity> <retrigger> <offset> <length>
        encode (validate) must refuse these fields
    round <length> -> <stored>
        the encoder stores <stored> for a length that is not representable

  Run:  python3 -I tests/timed-note/make-vectors.py        (rewrites vectors.txt)

Version: 0.1

Revision log
  v0.1  2026-11-03  Initial version (Task 05, checkpoint a).
"""
from pathlib import Path

LENGTH_MAX = 65535 << 7


def split(length):
    """Mantissa and exponent per docs/TIMED-NOTE.md: the smallest exponent whose mantissa
    fits 16 bits after rounding to the nearest multiple of 2^e (ties up)."""
    e = 0
    while True:
        half = (1 << (e - 1)) if e else 0
        m = (length + half) >> e
        if m <= 65535 or e == 7:
            return min(m, 65535), e
        e += 1


def encode(pitch, velocity, retrigger, offset, length):
    m, e = split(length)
    w = (offset & 0x1FF) | (e << 9)
    return bytes([pitch | (128 if retrigger else 0), velocity, w & 255, w >> 8, m & 255, m >> 8])


def stored(length):
    if length <= 0:
        return 0
    if length >= LENGTH_MAX:
        return LENGTH_MAX
    m, e = split(length)
    return m << e


lines = ["# Timed note test vectors (tests/timed-note/make-vectors.py). Do not edit by hand.",
         "# ok <pitch> <velocity> <retrigger> <offset> <length> -> <bytes>   bad <bytes>",
         "# badfields <pitch> <velocity> <retrigger> <offset> <length>        round <length> -> <stored>", ""]

ok = []
# Field edges, one at a time, on a plain note.
for pitch in (0, 1, 60, 127):
    ok.append((pitch, 100, 0, 0, 480))
for vel in (1, 2, 64, 127):
    ok.append((60, vel, 0, 0, 480))
ok.append((60, 100, 1, 0, 480))
for off in (0, 1, -1, 2, -2, 120, -120, 239, -239, 240, -240, 100, -100, 20, -20):
    ok.append((36, 110, 0, off, 480))
# Lengths across every exponent: both ends of each mantissa range, and the whole-step
# lengths a v1 block can hold (480 .. 122400) at a few points.
for length in (1, 2, 3, 479, 480, 481, 960, 32767, 32768, 65534, 65535,
               65536, 65538, 131070,                      # e=1: m 32768 .. 65535
               131072, 131076, 262140,                    # e=2
               262144, 524280,                            # e=3
               524288, 1048560,                           # e=4
               1048576, 2097120,                          # e=5
               2097152, 4194240,                          # e=6
               4194304, 8388352, 8388480,                 # e=7, up to the maximum
               480 * 136, 480 * 137, 480 * 255, 480 * 232, 480 * 128):
    ok.append((64, 90, 0, 0, length))
# A few combined notes (the kind an importer makes).
ok += [(36, 127, 1, -20, 240), (38, 64, 0, 60, 1920), (127, 1, 1, 240, 8388480), (0, 127, 0, -240, 1)]
for v in ok:
    lines.append("ok %d %d %d %d %d -> %s" % (v + (encode(*v).hex(),)))

lines.append("")
bad = [
    bytes([60, 100 | 128, 0, 0, 0xE0, 0x01]),     # byte 1 bit 7
    bytes([60, 100, 0, 0x10, 0xE0, 0x01]),        # bits 12-15 of the word
    bytes([60, 100, 0, 0x80, 0xE0, 0x01]),        # bit 15
    bytes([60, 0, 0, 0, 0xE0, 0x01]),             # velocity 0
    bytes([60, 100, 0, 0, 0, 0]),                 # mantissa 0
    bytes([60, 100, 0, 0x02, 0x01, 0x00]),        # e=1 with m=1 (non-canonical)
    bytes([60, 100, 0, 0x02, 0xFF, 0x7F]),        # e=1 with m=32767
    bytes([60, 100, 0, 0x0E, 0x00, 0x40]),        # e=7 with m=16384
    bytes([60, 100, 0xF1, 0x00, 0xE0, 0x01]),     # offset +241
    bytes([60, 100, 0xFF, 0x00, 0xE0, 0x01]),     # offset +255
    bytes([60, 100, 0x0F, 0x01, 0xE0, 0x01]),     # offset -241 (0x10F)
    bytes([60, 100, 0x00, 0x01, 0xE0, 0x01]),     # offset -256 (0x100)
    bytes([0xFF] * 6),                            # erased flash
    bytes([0] * 6),                               # all zero
]
for b in bad:
    lines.append("bad " + b.hex())

lines.append("")
for v in [(128, 100, 0, 0, 480), (60, 0, 0, 0, 480), (60, 128, 0, 0, 480), (60, 100, 2, 0, 480),
          (60, 100, 0, 241, 480), (60, 100, 0, -241, 480), (60, 100, 0, 0, 0), (60, 100, 0, 0, LENGTH_MAX + 1)]:
    lines.append("badfields %d %d %d %d %d" % v)

lines.append("")
for length in (65537, 65539, 65541, 131071, 131073, 131074, 131075, 262141, 262142, 262143,
               524281, 1048561, 2097121, 4194241, 8388479, 8388481, 10000000, 100000, 1000000, 480 * 300 + 1):
    lines.append("round %d -> %d" % (length, stored(length)))

Path(__file__).with_name("vectors.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("%d vectors" % sum(1 for l in lines if l and not l.startswith("#")))
