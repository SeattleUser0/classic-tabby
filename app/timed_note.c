/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/timed_note.c — encode, decode and validate the timed note (see timed_note.h)
 *
 * Purpose
 *   The arithmetic behind the 6-byte wire form. Nothing here knows about songs, blocks,
 *   the SMK-37 or the SDK; the same rules are implemented in web/timed-note/timed-note.js
 *   and both are checked against tests/timed-note/vectors.txt. The device links only
 *   what it calls (decode and the field unpack; the encoder is dropped by LTO).
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-03  Initial version (Task 05, checkpoint a).
 */
#include "timed_note.h"

int timed_note_valid(const struct timed_note *n)
{
    return n->pitch <= 127 && n->velocity >= 1 && n->velocity <= 127 && n->retrigger <= 1 &&
           n->offset >= -TIMED_NOTE_OFFSET_MAX && n->offset <= TIMED_NOTE_OFFSET_MAX &&
           n->length >= 1 && n->length <= TIMED_NOTE_LENGTH_MAX;
}
/* Mantissa and exponent for a length: the smallest exponent whose mantissa fits 16 bits
 * after rounding to the nearest multiple of 2^e (ties up). When the rounded mantissa
 * would be 65536 the next exponent takes it, as exactly 32768. Returns the exponent. */
static unsigned split(uint32_t length, uint32_t *mantissa)
{
    for (unsigned e = 0; ; ++e) {
        uint32_t half = e ? 1u << (e - 1) : 0, m = (length + half) >> e;
        if (m <= TIMED_NOTE_MANTISSA_MAX || e == TIMED_NOTE_EXPONENT_MAX) {
            *mantissa = m > TIMED_NOTE_MANTISSA_MAX ? TIMED_NOTE_MANTISSA_MAX : m;
            return e;
        }
    }
}
uint32_t timed_note_length_stored(uint32_t length)
{
    uint32_t m;
    if (!length) return 0;
    if (length >= TIMED_NOTE_LENGTH_MAX) return TIMED_NOTE_LENGTH_MAX;
    unsigned e = split(length, &m);
    return m << e;
}
int timed_note_encode(const struct timed_note *n, uint8_t out[TIMED_NOTE_BYTES])
{
    if (!timed_note_valid(n)) return -1;
    uint32_t m;
    unsigned e = split(n->length, &m);
    unsigned w = ((unsigned)n->offset & 0x1ffU) | (e << 9);   /* 9-bit two's complement, exponent above it */
    out[0] = (uint8_t)(n->pitch | (n->retrigger ? 128U : 0U));
    out[1] = n->velocity;
    out[2] = (uint8_t)w; out[3] = (uint8_t)(w >> 8);
    out[4] = (uint8_t)m; out[5] = (uint8_t)(m >> 8);
    return 0;
}
int timed_note_decode(const uint8_t in[TIMED_NOTE_BYTES], struct timed_note *n)
{
    unsigned w = in[2] | (unsigned)in[3] << 8, e = (w >> 9) & 7U, m = in[4] | (unsigned)in[5] << 8;
    if ((in[1] & 128U) || (w & 0xf000U)) return -1;             /* reserved bits */
    if (!(in[1] & 127U) || !m || (e && m < 32768U)) return -1;  /* velocity 0, mantissa 0, non-canonical */
    timed_note_unpack(in, n);
    if (n->offset < -TIMED_NOTE_OFFSET_MAX || n->offset > TIMED_NOTE_OFFSET_MAX) return -1;
    return 0;
}
