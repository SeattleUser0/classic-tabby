/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/timed_note.h — the timed note: a note with its own start offset and exact length
 *
 * Purpose
 *   One self-contained definition of a sequencer note that keeps the timing a MIDI file
 *   (or a player) put there: pitch, velocity, a retrigger flag, a signed start offset from
 *   the 16th step the note belongs to, and an exact length. Encode, decode and validate
 *   live here and nowhere else; web/timed-note/timed-note.js is the JavaScript twin and
 *   tests/timed-note/vectors.txt pins both to the same bytes. docs/TIMED-NOTE.md is the
 *   format description, written so the module can be lifted into another project.
 *
 *   This file depends on <stdint.h> only: no board, SDK, song-storage or project symbol.
 *
 * Units and ranges (docs/TIMED-NOTE.md)
 *   1 unit = 1/480 of a 16th step = 1/1920 quarter note; musical, so it scales with tempo.
 *   offset  −240..+240 units (plus or minus half a step); negative = before the step.
 *   length  1 .. 65535 << 7 units, stored as a 16-bit mantissa m and a 3-bit exponent e
 *           (length = m << e); exact up to 65535 units, then to the nearest 2, 4, ... 128
 *           units. The canonical rule (e = 0 unless the length needs it; e > 0 only with
 *           m >= 32768) gives every value exactly one byte pattern.
 *
 * Wire form, 6 bytes, little-endian fields
 *   byte 0   bits 0-6 pitch 0..127, bit 7 retrigger
 *   byte 1   bits 0-6 velocity 1..127, bit 7 reserved (0)
 *   bytes 2-3 (u16) bits 0-8 offset as 9-bit two's complement, bits 9-11 exponent e,
 *            bits 12-15 reserved (0)
 *   bytes 4-5 (u16) mantissa m 1..65535
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-03  Initial version (Task 05, checkpoint a).
 */
#ifndef TIMED_NOTE_H
#define TIMED_NOTE_H
#include <stdint.h>

enum {
    TIMED_NOTE_BYTES = 6,
    TIMED_NOTE_UNITS_PER_STEP = 480,        /* units in one 16th step */
    TIMED_NOTE_UNITS_PER_QUARTER = 1920,
    TIMED_NOTE_OFFSET_MAX = 240,            /* valid offsets: -240 .. +240 */
    TIMED_NOTE_MANTISSA_MAX = 65535,
    TIMED_NOTE_EXPONENT_MAX = 7
};
#define TIMED_NOTE_LENGTH_MAX (65535u << 7)  /* 8388480 units = 17476 steps */

struct timed_note {
    uint8_t pitch;       /* 0..127 */
    uint8_t velocity;    /* 1..127 */
    uint8_t retrigger;   /* 0 legato (a sounding note of the same pitch is extended), 1 note-off then note-on */
    int16_t offset;      /* -240..+240 units from the anchor step's grid time */
    uint32_t length;     /* 1 .. TIMED_NOTE_LENGTH_MAX units from the note's own start to its note-off */
};

/* 1 when every field is inside its range (the length need not be representable: encode
 * rounds it), 0 otherwise. */
int timed_note_valid(const struct timed_note *n);
/* The length the encoder stores for `length`: itself up to 65535, else the nearest
 * representable value (ties round up). 0 stays 0 (invalid); values above the maximum
 * come back as the maximum. */
uint32_t timed_note_length_stored(uint32_t length);
/* Canonical 6 bytes for a valid note (length rounded as above): 0, or -1 when the note
 * is invalid (out is then untouched). */
int timed_note_encode(const struct timed_note *n, uint8_t out[TIMED_NOTE_BYTES]);
/* The note in 6 bytes: 0, or -1 for a reserved bit set, velocity 0, mantissa 0, a
 * non-canonical exponent (e > 0 with m < 32768) or an offset outside the range. */
int timed_note_decode(const uint8_t in[TIMED_NOTE_BYTES], struct timed_note *n);
/* Field read without validation, for bytes that passed timed_note_decode earlier (the
 * sequencer's inner loop). */
static inline void timed_note_unpack(const uint8_t in[TIMED_NOTE_BYTES], struct timed_note *n)
{
    unsigned w = in[2] | (unsigned)in[3] << 8, raw = w & 0x1ffU;
    n->pitch = (uint8_t)(in[0] & 127U);
    n->retrigger = (uint8_t)(in[0] >> 7);
    n->velocity = (uint8_t)(in[1] & 127U);
    n->offset = (int16_t)(raw >= 256U ? (int)raw - 512 : (int)raw);
    n->length = (uint32_t)(in[4] | (unsigned)in[5] << 8) << ((w >> 9) & 7U);
}
#endif
