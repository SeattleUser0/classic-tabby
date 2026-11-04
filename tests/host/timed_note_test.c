/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * tests/host/timed_note_test.c — the C timed note against the shared vectors
 *
 * Purpose
 *   Reads tests/timed-note/vectors.txt (the same file tests/timed-note/run.mjs checks the
 *   JavaScript twin against) and checks app/timed_note.c:
 *     ok        timed_note_encode gives exactly the bytes, timed_note_decode exactly the fields,
 *               timed_note_unpack the same fields;
 *     bad       timed_note_decode returns -1;
 *     badfields timed_note_encode returns -1 and timed_note_valid 0;
 *     round     timed_note_length_stored gives the stored value, and encode/decode agree.
 *   Then the properties beyond the file: every offset -240..240 and every exponent at both
 *   mantissa ends round-trip.
 *
 *   Build and run:  make timed-note-test   (gcc, app/timed_note.c, no simulator)
 *   The vectors path is the first argument (default tests/timed-note/vectors.txt).
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-03  Initial version (Task 05, checkpoint a).
 */
#include "timed_note.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int failures, checks;
#define CHECK(cond, ...) do { ++checks; if (!(cond)) { ++failures; printf("FAIL "); printf(__VA_ARGS__); printf("\n"); } } while (0)

static int unhex(const char *s, uint8_t out[6])
{
    if (strlen(s) != 12) return 0;
    for (int i = 0; i < 6; ++i) { unsigned v; if (sscanf(s + 2 * i, "%2x", &v) != 1) return 0; out[i] = (uint8_t)v; }
    return 1;
}
static int same(const struct timed_note *a, const struct timed_note *b)
{
    return a->pitch == b->pitch && a->velocity == b->velocity && a->retrigger == b->retrigger && a->offset == b->offset && a->length == b->length;
}
int main(int argc, char **argv)
{
    const char *path = argc > 1 ? argv[1] : "tests/timed-note/vectors.txt";
    FILE *f = fopen(path, "r");
    if (!f) { printf("FAIL cannot open %s\n", path); return 1; }
    char line[256]; unsigned n_ok = 0, n_bad = 0, n_badfields = 0, n_round = 0;
    while (fgets(line, sizeof line, f)) {
        char kind[16], hex[32]; int pitch, vel, retrig, offset; long long length, stored;
        if (line[0] == '#' || line[0] == '\n' || line[0] == '\r') continue;
        if (sscanf(line, "%15s", kind) != 1) continue;
        if (!strcmp(kind, "ok")) {
            if (sscanf(line, "ok %d %d %d %d %lld -> %31s", &pitch, &vel, &retrig, &offset, &length, hex) != 6) { CHECK(0, "parse: %s", line); continue; }
            struct timed_note n = { (uint8_t)pitch, (uint8_t)vel, (uint8_t)retrig, (int16_t)offset, (uint32_t)length }, back, fast;
            uint8_t want[6], got[6];
            CHECK(unhex(hex, want), "hex: %s", line);
            CHECK(timed_note_encode(&n, got) == 0 && !memcmp(got, want, 6), "encode: %s -> %02x%02x%02x%02x%02x%02x", line, got[0], got[1], got[2], got[3], got[4], got[5]);
            CHECK(timed_note_decode(want, &back) == 0 && same(&back, &n), "decode: %s", line);
            timed_note_unpack(want, &fast);
            CHECK(same(&fast, &n) && timed_note_valid(&n), "unpack/valid: %s", line);
            ++n_ok;
        } else if (!strcmp(kind, "bad")) {
            if (sscanf(line, "bad %31s", hex) != 1) { CHECK(0, "parse: %s", line); continue; }
            uint8_t b[6]; struct timed_note back;
            CHECK(unhex(hex, b) && timed_note_decode(b, &back) == -1, "bad accepted: %s", line);
            ++n_bad;
        } else if (!strcmp(kind, "badfields")) {
            if (sscanf(line, "badfields %d %d %d %d %lld", &pitch, &vel, &retrig, &offset, &length) != 5) { CHECK(0, "parse: %s", line); continue; }
            /* Fields are widened on purpose: the test must be able to express 128 and 2. */
            struct timed_note n = { (uint8_t)pitch, (uint8_t)vel, (uint8_t)retrig, (int16_t)offset, (uint32_t)length };
            if (pitch > 255 || vel > 255 || retrig > 255 || length > 0xffffffffLL) { ++n_badfields; continue; }
            uint8_t got[6];
            CHECK(!timed_note_valid(&n) && timed_note_encode(&n, got) == -1, "badfields accepted: %s", line);
            ++n_badfields;
        } else if (!strcmp(kind, "round")) {
            if (sscanf(line, "round %lld -> %lld", &length, &stored) != 2) { CHECK(0, "parse: %s", line); continue; }
            struct timed_note n = { 60, 100, 0, 0, (uint32_t)length }, back; uint8_t b[6];
            CHECK(timed_note_length_stored((uint32_t)length) == (uint32_t)stored, "round: %s gave %u", line, timed_note_length_stored((uint32_t)length));
            if (length <= (long long)TIMED_NOTE_LENGTH_MAX)   /* above the maximum the encoder refuses (the importer clips first) */
                CHECK(timed_note_encode(&n, b) == 0 && timed_note_decode(b, &back) == 0 && back.length == (uint32_t)stored, "round encode/decode: %s", line);
            else CHECK(timed_note_encode(&n, b) == -1, "round: a length above the maximum must be refused by encode: %s", line);
            ++n_round;
        } else CHECK(0, "unknown vector: %s", line);
    }
    fclose(f);
    for (int o = -240; o <= 240; ++o) {
        struct timed_note n = { 1, 1, 0, (int16_t)o, 1 }, back; uint8_t b[6];
        CHECK(timed_note_encode(&n, b) == 0 && timed_note_decode(b, &back) == 0 && back.offset == o, "offset %d round trip", o);
    }
    for (unsigned e = 0; e <= 7; ++e) for (unsigned k = 0; k < 2; ++k) {
        uint32_t m = k ? 65535u : (e ? 32768u : 1u), length = m << e;
        struct timed_note n = { 1, 1, 1, 0, length }, back; uint8_t b[6];
        CHECK(timed_note_encode(&n, b) == 0 && timed_note_decode(b, &back) == 0 && back.length == length && back.retrigger == 1, "exponent %u mantissa %u round trip", e, m);
    }
    CHECK(timed_note_length_stored(0) == 0 && timed_note_length_stored(TIMED_NOTE_LENGTH_MAX + 5u) == TIMED_NOTE_LENGTH_MAX, "length_stored at the ends");
    printf("timed-note (C): %u ok, %u bad, %u badfields, %u round vectors; %d checks, %d failed\n", n_ok, n_bad, n_badfields, n_round, checks, failures);
    return failures ? 1 : 0;
}
