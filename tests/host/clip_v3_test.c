/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * tests/host/clip_v3_test.c — the v3 clip module (app/clip_v3.c, docs/CLIP-V3.md)
 *
 * Purpose
 *   1. Round trip: 20000 random valid v2 payloads (canonical note order, lengths up to 65535) go to v3 and back and
 *      must come back byte for byte; every v3 result validates.
 *   2. Every v2 block the importer produces for the fixtures (file given as argv[1], written by
 *      tests/clip-v3/dump-v2.mjs: u16 length + payload, repeated): migrates, validates, and returns to the same
 *      notes (byte for byte when the payload was canonical; as the same set of timed notes when the migration
 *      reordered, re-tied or clamped, which the report counts and this test prints).
 *   3. The cursor: for each random clip and each swing 0, 20, 50, windows of 1..28 units walk the whole clip: every
 *      event is delivered once, in list order, at its swung time (checked against a swing formula written out again here, from
 *      app/song.c's warp), and a clip walked from a late cursor skips what is past.
 *   4. Rejections: each way a payload can be wrong is refused with the right code; to_v2 refuses what a v2 grid
 *      cannot hold (65 steps, five notes in a step, CC, program).
 *   5. Sizes: the payloads of the migrated fixtures against their v2 sizes (printed, measured).
 *
 *   Run: build/host/clip_v3 [fixtures-v2.bin [fixtures-v3.bin]]   (the second file is written, for the JavaScript twin's test)
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-12  Initial version (Task 16 Goal 5).
 */
#include "clip_v3.h"
#include "timed_note.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int failures, checks;
#define CHECK(cond, ...) do { ++checks; if (!(cond)) { ++failures; printf("FAIL "); printf(__VA_ARGS__); printf("\n"); } } while (0)
#define OK(...) do { printf("ok   "); printf(__VA_ARGS__); printf("\n"); } while (0)

static uint32_t rng_state = 0x2545f491U;
static unsigned rnd(void) { rng_state ^= rng_state << 13; rng_state ^= rng_state >> 17; rng_state ^= rng_state << 5; return rng_state; }

/* A random valid v2 payload in canonical form: notes in each step sorted by offset, no offset -240 after step 0,
 * lengths up to 65535, distinct pitches in a step. Returns its length. */
static unsigned random_v2(uint8_t *out, unsigned density)
{
    unsigned at = 0;
    for (unsigned step = 0; step < 64; ++step) {
        unsigned count = rnd() % 100 < density ? 1 + rnd() % 4 : 0, prob = rnd() % 4 == 0 ? rnd() % 8 : 0, tune = rnd() % 16 == 0;
        out[at++] = (uint8_t)(count | prob << 3 | tune << 6);
        int offsets[4]; unsigned pitches[4];
        for (unsigned i = 0; i < count; ++i) {
            for (;;) {
                pitches[i] = 24 + rnd() % 72; int dup = 0;
                for (unsigned k = 0; k < i; ++k) dup |= pitches[k] == pitches[i];
                if (!dup) break;
            }
            offsets[i] = (int)(rnd() % 481) - 240;
            if (step > 0 && offsets[i] == -240) offsets[i] = -239;
        }
        for (unsigned i = 1; i < count; ++i) { int o = offsets[i]; unsigned p = pitches[i]; unsigned j = i; while (j && offsets[j - 1] > o) { offsets[j] = offsets[j - 1]; pitches[j] = pitches[j - 1]; --j; } offsets[j] = o; pitches[j] = p; }
        for (unsigned i = 1; i < count; ++i) if (offsets[i] == offsets[i - 1]) offsets[i] += offsets[i] < 240 ? 1 : 0;   /* ties keep list order; make them rare */
        for (unsigned i = 0; i < count; ++i) {
            struct timed_note n; n.pitch = (uint8_t)pitches[i]; n.velocity = (uint8_t)(1 + rnd() % 127); n.retrigger = (uint8_t)(rnd() & 1);
            n.offset = (int16_t)offsets[i]; n.length = 1 + rnd() % (rnd() % 3 ? 2000 : 65535);
            if (timed_note_encode(&n, out + at)) { printf("test generator made an invalid note\n"); exit(2); }
            at += TIMED_NOTE_BYTES;
        }
    }
    return at;
}
/* The swing formula of app/song.c, written out again. */
static int ref_warp(int t, unsigned s)
{
    if (!s) return t;
    if (t < 0) return t * (int)(100 - s) / 100;
    int pair = t / 960, x = t % 960;
    int w = x < 480 ? x * (int)(100 + s) / 100 : 480 * (int)(100 + s) / 100 + (x - 480) * (int)(100 - s) / 100;
    return pair * 960 + w;
}
struct walk { unsigned n, bad; int last_time; const uint8_t *p; unsigned expect_index; unsigned swing; int from, to; };
static void sink(void *c, const struct clip_v3_event *e, int swung) { (void)c; (void)e; (void)swung; }
static void on_event(void *c, const struct clip_v3_event *e, int swung)
{
    struct walk *w = c;
    struct clip_v3_event ref; clip_v3_event(w->p, w->expect_index, &ref);
    if (ref.time != e->time || ref.kind != e->kind || ref.a != e->a || ref.b != e->b || swung != ref_warp(e->time, w->swing) || swung < w->from || swung >= w->to) ++w->bad;
    ++w->expect_index; ++w->n;
}

int main(int argc, char **argv)
{
    static uint8_t v2[2048], v3[CLIP_V3_BYTES_MAX], back[2048];
    /* 1. round trip on random payloads */
    unsigned exact = 0, sum_v2 = 0, sum_v3 = 0;
    for (unsigned round = 0; round < 20000; ++round) {
        unsigned bytes = random_v2(v2, round % 5 == 0 ? 10 : round % 5 == 1 ? 100 : 40);
        struct clip_v3_report rep;
        int n = clip_v3_from_v2(v2, bytes, v3, sizeof v3, &rep);
        CHECK(n > 0 && clip_v3_validate(v3, (unsigned)n) == 0, "round %u: migration validates (%d)", round, n);
        if (n <= 0) continue;
        int m = clip_v3_to_v2(v3, (unsigned)n, back, sizeof back);
        /* a tie of two notes at the same time keeps list order: canonical by construction unless two offsets are equal and
         * the generator could not separate them; those are compared as sets below. */
        if (m == (int)bytes && !memcmp(v2, back, bytes) && !rep.reordered) ++exact;
        else {
            /* same notes? compare as sorted (step, offset, pitch) lists */
            int same = m == (int)bytes;
            if (same) {
                for (unsigned s = 0, a = 0, b = 0; s < 64 && same; ++s) {
                    unsigned ca = v2[a] & 7U, cb = back[b] & 7U;
                    if (v2[a] != back[b]) same = 0;
                    unsigned used = 0;
                    for (unsigned i = 0; i < ca && same; ++i) {
                        unsigned found = 0;
                        for (unsigned k = 0; k < cb; ++k) if (!(used >> k & 1U) && !memcmp(v2 + a + 1 + 6 * i, back + b + 1 + 6 * k, 6)) { used |= 1U << k; found = 1; break; }
                        same &= found;
                    }
                    a += 1 + 6 * ca; b += 1 + 6 * cb;
                }
            }
            CHECK(same, "round %u: v3 -> v2 returns the same notes (%d vs %u bytes)", round, m, bytes);
        }
        sum_v2 += bytes; sum_v3 += (unsigned)n;
        /* 3. the cursor on a subset */
        if (round % 40 == 0) for (unsigned swing = 0; swing <= 50; swing += 25) {
            struct walk w = { 0, 0, 0, v3, 0, swing, 0, 0 }; unsigned cursor = 0; int from = -300;
            unsigned total = clip_v3_count(v3);
            while (from < 64 * 480 + 300) {
                int to = from + 1 + (int)(rnd() % 28); w.from = from; w.to = to;
                clip_v3_window(v3, &cursor, from, to, swing, on_event, &w);
                from = to;
            }
            CHECK(w.n == total && !w.bad, "round %u swing %u: the cursor delivered %u of %u events, %u wrong", round, swing, w.n, total, w.bad);
        }
    }
    OK("round trip: %u of 20000 random payloads return byte for byte, the rest as the same notes; v3 is %u bytes against %u (measured, random density mix)", exact, sum_v3, sum_v2);
    /* late start: a cursor at 0 asked for a window in the middle skips the earlier events */
    {
        unsigned bytes = random_v2(v2, 60); int n = clip_v3_from_v2(v2, bytes, v3, sizeof v3, NULL);
        struct walk w = { 0, 0, 0, v3, 0, 0, 10000, 10050 }; unsigned cursor = 0;
        unsigned first = 0; while (first < clip_v3_count(v3)) { struct clip_v3_event e; clip_v3_event(v3, first, &e); if (e.time >= 10000) break; ++first; }
        w.expect_index = first;
        clip_v3_window(v3, &cursor, 10000, 10050, 0, on_event, &w);
        CHECK(n > 0 && !w.bad, "a late start skips what is past (%u delivered)", w.n);
    }
    /* 2. importer fixtures */
    if (argc > 1) {
        FILE *f = fopen(argv[1], "rb");
        CHECK(f != NULL, "the fixture file %s opens", argv[1]);
        FILE *cout = argc > 2 ? fopen(argv[2], "wb") : NULL;   /* the v3 bytes, for tests/clip-v3/run.mjs to compare the JavaScript twin against */
        unsigned blocks = 0, canonical = 0, reordered = 0, retied = 0, clamped = 0, mods = 0, b2 = 0, b3 = 0;
        while (f) {
            uint8_t len[2]; if (fread(len, 1, 2, f) != 2) break;
            unsigned bytes = len[0] | (unsigned)len[1] << 8;
            if (bytes > sizeof v2 || fread(v2, 1, bytes, f) != bytes) { CHECK(0, "fixture file truncated"); break; }
            struct clip_v3_report rep;
            int n = clip_v3_from_v2(v2, bytes, v3, sizeof v3, &rep);
            CHECK(n > 0 && clip_v3_validate(v3, (unsigned)n) == 0, "fixture block %u: migrates and validates (%d)", blocks, n);
            if (n > 0 && cout) { uint8_t l2[2] = { (uint8_t)n, (uint8_t)((unsigned)n >> 8) }; fwrite(l2, 1, 2, cout); fwrite(v3, 1, (unsigned)n, cout); }
            if (n > 0) {
                int m = clip_v3_to_v2(v3, (unsigned)n, back, sizeof back);
                if (m == (int)bytes && !memcmp(v2, back, bytes)) ++canonical;
                else CHECK(rep.reordered || rep.retied || rep.clamped_lengths, "fixture block %u: differs from its original only where the report says (%u reordered, %u retied, %u clamped)", blocks, rep.reordered, rep.retied, rep.clamped_lengths);
                reordered += rep.reordered; retied += rep.retied; clamped += rep.clamped_lengths; mods += rep.step_modifiers; b2 += bytes; b3 += (unsigned)n;
            }
            ++blocks;
        }
        if (f) fclose(f);
        if (cout) fclose(cout);
        OK("fixtures: %u blocks migrated; %u returned byte for byte; %u steps reordered, %u notes re-tied, %u lengths clamped, %u step modifiers; v3 %u bytes against v2 %u (measured)", blocks, canonical, reordered, retied, clamped, mods, b3, b2);
    }
    /* 4. rejections */
    {
        unsigned bytes = random_v2(v2, 60); int n = clip_v3_from_v2(v2, bytes, v3, sizeof v3, NULL);
        uint8_t t[CLIP_V3_BYTES_MAX]; memcpy(t, v3, (unsigned)n);
        CHECK(clip_v3_validate(t, 10) == CLIP_V3_BAD_SIZE, "too short");
        CHECK(clip_v3_validate(t, (unsigned)n - 1) == CLIP_V3_BAD_SIZE, "size does not match the count");
        t[0] = 0; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "steps 0"); t[0] = 129; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "steps 129"); t[0] = 64;
        t[1] = 4; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "reserved flag bit"); t[1] = 0;
        t[2] = 5; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "program without its flag"); t[2] = 0;
        t[14] = 1; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "reserved header byte"); t[14] = 0;
        /* v0.6 (tabby-v04.17): the shuffle in byte 13, the playback quantize in byte 15 */
        t[13] = 52; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "shuffle above 51"); t[13] = 51; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_OK && clip_v3_shuffle(t) == 51, "shuffle 51 (50 percent) is valid");
        { uint8_t o2[2048]; CHECK(clip_v3_to_v2(t, (unsigned)n, o2, sizeof o2) == CLIP_V3_NOT_V2_SHAPED, "a clip with a shuffle is not a v2 block"); } t[13] = 0;
        t[15] = 4; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "quantize above 3"); t[15] = 0;
        { static uint8_t c[CLIP_V3_BYTES_MAX]; struct clip_v3_event e = { 0, CLIP_V3_NOTE, 0, 100, 0, 240 }, g;
          static const int in_t[] = { -240, 100, 240, 241, 700, 7300, 7440 };
          clip_v3_empty(c, 16);
          for (unsigned i = 0; i < 7; ++i) { e.time = in_t[i]; e.a = (uint8_t)(60 + i); (void)clip_v3_insert(c, &e); }
          { struct clip_v3_event cc = { 300, CLIP_V3_CC, 74, 10, 0, 0 }; (void)clip_v3_insert(c, &cc); }
          CHECK(clip_v3_quantize_set(c, 4) == CLIP_V3_BAD_HEADER && clip_v3_quantize_set(c, 1) == CLIP_V3_OK && clip_v3_validate(c, clip_v3_bytes(c)) == CLIP_V3_OK && clip_v3_quantize(c) == 1, "quantize: set to a 16th");
          clip_v3_quantize_apply(c);
          static const int out_t[] = { 0, 0, 0, 300, 480, 480, 7200, 7200 }; unsigned okq = clip_v3_count(c) == 8 && c[15] == 0 && clip_v3_validate(c, clip_v3_bytes(c)) == CLIP_V3_OK;
          for (unsigned i = 0; okq && i < 8; ++i) { clip_v3_event(c, i, &g); if (g.time != out_t[i] || (i == 3) != (g.kind == CLIP_V3_CC)) okq = 0; }
          CHECK(okq, "quantize to a 16th: notes on the nearest step (halfway goes to the earlier one), the controller stays, the list is valid");
          clip_v3_empty(c, 16); e.a = 60; e.time = 900; (void)clip_v3_insert(c, &e); e.time = 1000; (void)clip_v3_insert(c, &e); e.a = 61; (void)clip_v3_insert(c, &e);
          (void)clip_v3_quantize_set(c, 1); clip_v3_quantize_apply(c); clip_v3_event(c, 0, &g);
          CHECK(clip_v3_count(c) == 2 && g.time == 960 && g.a == 60 && clip_v3_validate(c, clip_v3_bytes(c)) == CLIP_V3_OK, "quantize: two notes of one pitch on one step: the first stays");
          clip_v3_empty(c, 16); e.a = 60; e.time = 960; (void)clip_v3_insert(c, &e); e.a = 61; e.time = 961; (void)clip_v3_insert(c, &e); e.a = 62; e.time = 6800; (void)clip_v3_insert(c, &e);
          (void)clip_v3_quantize_set(c, 3); clip_v3_quantize_apply(c);
          { struct clip_v3_event g1, g2; clip_v3_event(c, 0, &g); clip_v3_event(c, 1, &g1); clip_v3_event(c, 2, &g2);
            CHECK(g.a == 60 && g.time == 0 && g1.a == 62 && g1.time == 0 && g2.a == 61 && g2.time == 1920 && clip_v3_validate(c, clip_v3_bytes(c)) == CLIP_V3_OK, "quantize to a quarter: a note nearest the clip's end opens the clip; the list is in time order"); }
          unsigned badq = 0; srand(7);
          for (unsigned r = 0; r < 4000; ++r) {
              unsigned steps = 1U + (unsigned)rand() % 128U, k = (unsigned)rand() % 60U; clip_v3_empty(c, steps);
              for (unsigned i = 0; i < k; ++i) { e.time = rand() % (int)(steps * 480U) - 240; e.a = (uint8_t)(48 + rand() % 6); (void)clip_v3_insert(c, &e); }
              (void)clip_v3_shuffle_set(c, (unsigned)rand() % 52U); (void)clip_v3_quantize_set(c, 1U + (unsigned)rand() % 3U);
              if (clip_v3_validate(c, clip_v3_bytes(c))) ++badq;
              clip_v3_quantize_apply(c);
              if (clip_v3_validate(c, clip_v3_bytes(c))) ++badq;
          }
          CHECK(badq == 0, "quantize: 4000 random clips are valid before and after (%u bad)", badq); }
        t[12] = 13; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "transpose above 12"); t[12] = (uint8_t)-13; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "transpose below -12");
        t[12] = (uint8_t)-12; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_OK && clip_v3_transpose(t) == -12, "transpose -12 is valid"); t[12] = 0;
        { uint8_t c2[CLIP_V3_HEADER + CLIP_V3_EVENT * 2]; clip_v3_empty(c2, 16); c2[6] = 2;
          uint8_t *e0 = c2 + CLIP_V3_HEADER, *e1 = e0 + CLIP_V3_EVENT;
          e0[0] = 240; e0[1] = 0; e0[2] = 60; e0[3] = 100; e0[4] = 240; e0[5] = 0;
          e1[0] = 0xd0; e1[1] = 0x02; e1[2] = 0x80 | 125; e1[3] = 90; e1[4] = 240; e1[5] = 0;
          CHECK(clip_v3_validate(c2, sizeof c2) == CLIP_V3_OK && clip_v3_transpose_set(c2, 13) == CLIP_V3_BAD_HEADER && clip_v3_transpose_set(c2, 7) == CLIP_V3_OK && clip_v3_validate(c2, sizeof c2) == CLIP_V3_OK, "transpose: set 7, 13 refused");
          clip_v3_transpose_apply(c2);
          CHECK(c2[12] == 0 && e0[2] == 67 && e1[2] == (0x80 | 127) && clip_v3_validate(c2, sizeof c2) == CLIP_V3_OK, "transpose applied: 60 -> 67, 125 stays at 127 with its retrigger bit, the header is cleared"); }
        /* v0.4 (tabby-v04.10): the chain in bytes 8..11, the length and the program setters */
        t[8] = 66; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "chain: next above the last place"); t[8] = 0;
        t[9] = 1; t[10] = 2; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "chain: after above 512 steps"); t[9] = t[10] = 0;
        t[11] = 65; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "chain: more than 64 times"); t[11] = 0;
        CHECK(clip_v3_chain_set(t, CLIP_V3_NEXT_CLIP + 63, 512, 64) == 0 && clip_v3_validate(t, (unsigned)n) == 0 && clip_v3_next(t) == 65 && clip_v3_after(t) == 512 && clip_v3_times(t) == 64, "chain: the largest values are valid and read back");
        CHECK(clip_v3_chain_set(t, 66, 0, 1) == CLIP_V3_BAD_HEADER && clip_v3_chain_set(t, 0, 513, 1) == CLIP_V3_BAD_HEADER && clip_v3_chain_set(t, 0, 0, 0) == CLIP_V3_BAD_HEADER && clip_v3_chain_set(t, 0, 0, 65) == CLIP_V3_BAD_HEADER, "chain: values out of range are refused");
        CHECK(clip_v3_chain_set(t, 0, 0, 1) == 0 && t[8] == 0 && t[9] == 0 && t[10] == 0 && t[11] == 0 && clip_v3_times(t) == 1, "chain: none is all zero (one time)");
        CHECK(clip_v3_program_set(t, 5, 1, 2) == 0 && t[1] == 3 && t[2] == 5 && t[3] == 1 && t[4] == 2 && clip_v3_validate(t, (unsigned)n) == 0, "program and bank set");
        CHECK(clip_v3_program_set(t, 255, 255, 9) == 0 && t[1] == 0 && t[2] == 0 && t[3] == 0 && t[4] == 0 && clip_v3_validate(t, (unsigned)n) == 0 && clip_v3_program_set(t, 128, 0, 0) == CLIP_V3_BAD_HEADER, "program and bank taken off; 128 refused");
        { static uint8_t w[CLIP_V3_BYTES_MAX]; clip_v3_empty(w, 32);
          struct clip_v3_event a1 = { 0, CLIP_V3_NOTE, 60, 100, 1, 240 }, a2 = { 15 * 480 + 240, CLIP_V3_NOTE, 61, 100, 1, 240 }, a3 = { 15 * 480 + 241, CLIP_V3_NOTE, 62, 100, 1, 240 }, a4 = { 31 * 480, CLIP_V3_NOTE, 63, 100, 1, 240 }, a5 = { -100, CLIP_V3_NOTE, 64, 100, 1, 240 };
          (void)clip_v3_insert(w, &a1); (void)clip_v3_insert(w, &a2); (void)clip_v3_insert(w, &a3); (void)clip_v3_insert(w, &a4); (void)clip_v3_insert(w, &a5);
          (void)clip_v3_step_mod_set(w, 15, 3); (void)clip_v3_step_mod_set(w, 16, 4);
          int cut = clip_v3_steps_set(w, 16);
          CHECK(cut == 3 && clip_v3_steps(w) == 16 && clip_v3_count(w) == 4 && clip_v3_validate(w, clip_v3_bytes(w)) == 0 && clip_v3_note_find(w, 15, 61) >= 0 && clip_v3_note_find(w, 0, 64) >= 0 && clip_v3_step_mod(w, 15) == 3,
                "length: 32 to 16 steps removes what lies past the end (the note at the last half step stays, the pickup before the start stays): %d removed, %u left", cut, clip_v3_count(w));
          CHECK(clip_v3_steps_set(w, 128) == 0 && clip_v3_steps(w) == 128 && clip_v3_count(w) == 4 && clip_v3_validate(w, clip_v3_bytes(w)) == 0 && clip_v3_steps_set(w, 0) == CLIP_V3_BAD_HEADER && clip_v3_steps_set(w, 129) == CLIP_V3_BAD_HEADER, "length: longer keeps everything; 0 and 129 are refused"); }
        CHECK(clip_v3_validate(t, (unsigned)n) == 0, "restored, valid again");
        unsigned count = clip_v3_count(t);
        if (count >= 4) {
            uint8_t u[CLIP_V3_BYTES_MAX]; memcpy(u, t, (unsigned)n);
            uint8_t *e1 = u + CLIP_V3_HEADER + 6, *e2 = u + CLIP_V3_HEADER + 12;
            uint8_t tmp[6]; memcpy(tmp, e1, 6); memcpy(e1, e2, 6); memcpy(e2, tmp, 6);
            int expect_order = memcmp(e1, e2, 2) != 0;
            CHECK(!expect_order || clip_v3_validate(u, (unsigned)n) == CLIP_V3_BAD_ORDER, "events out of time order");
        }
        /* a note with velocity 0, a note with length 0, an unknown type, a modifier at the wrong time */
        uint8_t w[CLIP_V3_HEADER + 6 * 3]; memset(w, 0, sizeof w); w[0] = 16; w[6] = 1;
        uint8_t *e = w + CLIP_V3_HEADER; e[0] = 240; e[1] = 0; e[2] = 60; e[3] = 100; e[4] = 10; e[5] = 0;
        CHECK(clip_v3_validate(w, CLIP_V3_HEADER + 6) == 0, "a one-note clip is valid");
        e[3] = 0; CHECK(clip_v3_validate(w, CLIP_V3_HEADER + 6) == CLIP_V3_BAD_EVENT, "velocity 0"); e[3] = 100;
        e[4] = 0; CHECK(clip_v3_validate(w, CLIP_V3_HEADER + 6) == CLIP_V3_BAD_EVENT, "length 0"); e[4] = 10;
        e[0] = 0xff; e[1] = 0xff; CHECK(clip_v3_validate(w, CLIP_V3_HEADER + 6) == CLIP_V3_BAD_EVENT, "time beyond the clip"); e[0] = 240; e[1] = 0;
        e[2] = 77; e[3] = 0x80; CHECK(clip_v3_validate(w, CLIP_V3_HEADER + 6) == CLIP_V3_BAD_EVENT, "unknown other type"); e[2] = 60; e[3] = 100;
        w[6] = 2; uint8_t *e2 = w + CLIP_V3_HEADER + 6; memcpy(e2, e, 6);
        CHECK(clip_v3_validate(w, CLIP_V3_HEADER + 12) == CLIP_V3_DUPLICATE, "the same pitch twice in one step");
        e2[2] = 61; CHECK(clip_v3_validate(w, CLIP_V3_HEADER + 12) == 0, "a second pitch is fine");
        /* what a v2 grid cannot hold */
        uint8_t g[CLIP_V3_HEADER + 6 * 5 + 6]; memset(g, 0, sizeof g); g[0] = 64;
        g[6] = 5;
        for (unsigned i = 0; i < 5; ++i) { uint8_t *q = g + CLIP_V3_HEADER + 6 * i; q[0] = 240; q[2] = (uint8_t)(60 + i); q[3] = 100; q[4] = 10; }
        CHECK(clip_v3_validate(g, CLIP_V3_HEADER + 30) == 0, "five notes in one step is a valid v3 clip");
        CHECK(clip_v3_to_v2(g, CLIP_V3_HEADER + 30, back, sizeof back) == CLIP_V3_NOT_V2_SHAPED, "...but a v2 grid cannot hold it");
        uint8_t h[CLIP_V3_HEADER + 6]; memset(h, 0, sizeof h); h[0] = 128; h[6] = 1; h[CLIP_V3_HEADER] = 240; h[CLIP_V3_HEADER + 2] = 60; h[CLIP_V3_HEADER + 3] = 100; h[CLIP_V3_HEADER + 4] = 10;
        CHECK(clip_v3_validate(h, sizeof h) == 0 && clip_v3_to_v2(h, sizeof h, back, sizeof back) == CLIP_V3_NOT_V2_SHAPED, "128 steps is valid v3 and not a v2 block");
        h[0] = 64; h[1] = 1; h[2] = 5; CHECK(clip_v3_to_v2(h, sizeof h, back, sizeof back) == CLIP_V3_NOT_V2_SHAPED, "a clip header program has no v2 form");
        h[1] = 0; h[2] = 0; h[CLIP_V3_HEADER + 2] = 0; h[CLIP_V3_HEADER + 3] = 0x80; h[CLIP_V3_HEADER + 2] = CLIP_V3_CC; h[CLIP_V3_HEADER + 4] = 7; h[CLIP_V3_HEADER + 5] = 100;
        CHECK(clip_v3_validate(h, sizeof h) == 0 && clip_v3_to_v2(h, sizeof h, back, sizeof back) == CLIP_V3_NOT_V2_SHAPED, "a CC event has no v2 form");
        CHECK(clip_v3_anchor(-240) == 0 && clip_v3_anchor(-1) == 0 && clip_v3_anchor(240) == 0 && clip_v3_anchor(241) == 1 && clip_v3_anchor(720) == 1 && clip_v3_anchor(721) == 2, "the anchor rule: halfway belongs to the earlier step");
    }
    /* ---- Task 17: fuzz. Random bytes, random headers over random bodies, and valid clips with random damage must
     * never crash, hang or read outside the payload (the sanitizer run of this file is the proof), and whatever the
     * validator accepts must be usable: every event inside the clip, in time order, the window walk ends and delivers
     * each event exactly once, the v2 conversions return a result or a refusal. */
    {
        static uint8_t f[CLIP_V3_BYTES_MAX + 64], out2[4096]; static uint8_t cells[64][25];
        uint32_t seed = 0x1234abcdU; unsigned accepted = 0, refused = 0, bad = 0, walked = 0;
        #define RND() (seed = seed * 1664525U + 1013904223U, seed >> 8)
        for (unsigned round = 0; round < 60000; ++round) {
            unsigned bytes, mode = round % 4;
            if (mode == 0) {                                   /* pure noise of a random length */
                bytes = RND() % (CLIP_V3_BYTES_MAX + 40);
                for (unsigned i = 0; i < bytes; ++i) f[i] = (uint8_t)RND();
            } else if (mode == 1) {                            /* a plausible header over noise events */
                unsigned count = RND() % 40; bytes = CLIP_V3_HEADER + 6 * count;
                memset(f, 0, CLIP_V3_HEADER); f[0] = (uint8_t)(1 + RND() % 128); f[6] = (uint8_t)count;
                for (unsigned i = CLIP_V3_HEADER; i < bytes; ++i) f[i] = (uint8_t)RND();
            } else {                                           /* a valid clip built here, then (mode 3) damaged in 1 to 3 bytes */
                unsigned steps = 1 + RND() % 128, count = RND() % 60, time = 0; bytes = CLIP_V3_HEADER + 6 * count;
                memset(f, 0, bytes); f[0] = (uint8_t)steps; f[6] = (uint8_t)count;
                if (RND() & 1) { f[1] |= 1; f[2] = (uint8_t)(RND() & 127); }
                if (RND() & 1) { f[1] |= 2; f[3] = (uint8_t)(RND() & 127); f[4] = (uint8_t)(RND() & 127); }
                for (unsigned i = 0; i < count; ++i) {
                    uint8_t *e = f + CLIP_V3_HEADER + 6 * i;
                    time += RND() % (steps * 480U / (count + 1U) + 1U);
                    if (time > steps * 480U) time = steps * 480U;
                    e[0] = (uint8_t)time; e[1] = (uint8_t)(time >> 8);
                    if (RND() % 5) { e[2] = (uint8_t)(RND() & 127); e[3] = (uint8_t)(1 + RND() % 127); unsigned len = 1 + RND() % 4000; e[4] = (uint8_t)len; e[5] = (uint8_t)(len >> 8); }
                    else { static const uint8_t kinds[4] = {CLIP_V3_CC, CLIP_V3_PC, CLIP_V3_BEND, CLIP_V3_PRESSURE}; e[2] = kinds[RND() & 3]; e[3] = 0x80; e[4] = (uint8_t)(RND() & 127); e[5] = (e[2] == CLIP_V3_CC || e[2] == CLIP_V3_BEND) ? (uint8_t)(RND() & 127) : 0; }
                }
                if (mode == 3) for (unsigned k = 1 + RND() % 3; k; --k) { unsigned at = RND() % (bytes ? bytes : 1), bit = RND() & 7; f[at] ^= (uint8_t)(1U << bit); }
            }
            int v = clip_v3_validate(f, bytes);
            if (v) { ++refused; continue; }
            ++accepted;
            unsigned count = clip_v3_count(f), steps = clip_v3_steps(f); int last = -241;
            for (unsigned i = 0; i < count; ++i) {
                struct clip_v3_event e; clip_v3_event(f, i, &e);
                if (e.time < last || e.time < -240 || e.time > (int)steps * 480 - 240) ++bad;
                last = e.time;
            }
            unsigned cursor = 0, delivered = 0, swing = RND() % 51;
            for (int from = -240; from < (int)steps * 480 + 480;) {       /* windows of 1 to 28 units, end to end */
                int to = from + 1 + (int)(RND() % 28);
                delivered += clip_v3_window(f, &cursor, from, to, swing, sink, NULL); from = to;
            }
            if (delivered != count || cursor != count) ++bad;
            ++walked;
            int a = clip_v3_to_v2(f, bytes, out2, sizeof out2), b = clip_v3_to_cells(f, bytes, cells);
            if (!f[8] && !f[12] && !f[13] && !f[15] && (a < 0) != (b != 0)) ++bad;   /* the two grid conversions agree on what a grid can hold (a chain or a transpose keeps a clip out of v2 only) */
            if (a > 0) { int c = clip_v3_from_v2(out2, (unsigned)a, f, sizeof f, NULL); if (c <= 0) ++bad; }
        }
        CHECK(bad == 0, "fuzz: nothing the validator accepts breaks a rule (%u bad)", bad);
        CHECK(accepted > 8000 && refused > 20000 && walked == accepted, "fuzz: 60000 payloads: %u accepted and walked through the window, %u refused", accepted, refused);
        #undef RND
    }
    /* ---- Goal 6: editing in place. Known cases, then 40000 random edits: the clip is valid after every one. ---- */
    {
        static uint8_t c[CLIP_V3_BYTES_MAX]; uint16_t idx[8];
        clip_v3_empty(c, 32);
        CHECK(clip_v3_validate(c, clip_v3_bytes(c)) == 0 && clip_v3_steps(c) == 32 && clip_v3_count(c) == 0, "edit: an empty clip of 32 steps is valid");
        struct clip_v3_event n = { 4 * 480, CLIP_V3_NOTE, 60, 100, 1, 480 };
        int i0 = clip_v3_insert(c, &n); n.a = 64; int i1 = clip_v3_insert(c, &n); n.a = 60; int dup = clip_v3_insert(c, &n);
        CHECK(i0 == 0 && i1 == 1 && dup == CLIP_V3_DUPLICATE && clip_v3_count(c) == 2, "edit: two notes on step 5; the same pitch again is refused (%d %d %d)", i0, i1, dup);
        n.a = 62; n.time = 2 * 480 + 100; int i2 = clip_v3_insert(c, &n);
        CHECK(i2 == 0 && clip_v3_step_notes(c, 2, idx, 8) == 1 && idx[0] == 0 && clip_v3_step_notes(c, 4, idx, 8) == 2 && idx[0] == 1 && idx[1] == 2, "edit: an earlier note goes in front; the notes of a step are found");
        n.time = 2 * 480 + 240; n.a = 70; (void)clip_v3_insert(c, &n); n.time = 2 * 480 + 241; n.a = 71; (void)clip_v3_insert(c, &n);
        CHECK(clip_v3_step_notes(c, 2, idx, 8) == 2 && clip_v3_step_notes(c, 3, idx, 8) == 1 && clip_v3_note_find(c, 2, 70) >= 0 && clip_v3_note_find(c, 3, 71) >= 0 && clip_v3_note_find(c, 3, 70) < 0,
              "edit: a start half a step late belongs to the earlier step, one unit later to the next (the anchor rule)");
        CHECK(clip_v3_step_mod(c, 4) == 0 && clip_v3_step_mod_set(c, 4, 5) >= 0 && clip_v3_step_mod(c, 4) == 5 && clip_v3_validate(c, clip_v3_bytes(c)) == 0, "edit: a step's probability is set and read, the clip stays valid");
        CHECK(clip_v3_step_mod_set(c, 4, 0) == 0 && clip_v3_step_mod(c, 4) == 0, "edit: probability 0 removes the modifier");
        n.time = 32 * 480; n.a = 60; int out = clip_v3_insert(c, &n); n.time = 0; n.b = 0; int vel = clip_v3_insert(c, &n); n.b = 100; n.length = 0; int len = clip_v3_insert(c, &n);
        CHECK(out == CLIP_V3_BAD_EVENT && vel == CLIP_V3_BAD_EVENT && len == CLIP_V3_BAD_EVENT, "edit: a note past the clip, velocity 0 and length 0 are refused");
        unsigned before = clip_v3_count(c); clip_v3_remove(c, (unsigned)clip_v3_note_find(c, 4, 64));
        CHECK(clip_v3_count(c) == before - 1 && clip_v3_note_find(c, 4, 64) < 0 && clip_v3_note_find(c, 4, 60) >= 0 && clip_v3_validate(c, clip_v3_bytes(c)) == 0, "edit: a note is removed, its neighbour stays");
        /* full: the 512th event fits, the 513th does not, nothing changes */
        clip_v3_empty(c, 128); n.length = 240; n.b = 100; unsigned made = 0;
        for (unsigned s = 0; s < 128; ++s) for (unsigned k = 0; k < 4; ++k) { n.time = (int32_t)s * 480; n.a = (uint8_t)(40 + k); if (clip_v3_insert(c, &n) >= 0) ++made; }
        n.time = 0; n.a = 90; int full = clip_v3_insert(c, &n);
        CHECK(made == 512 && full == CLIP_V3_NO_ROOM && clip_v3_count(c) == 512 && clip_v3_validate(c, clip_v3_bytes(c)) == 0, "edit: a full clip (512 events) refuses one more and is unchanged");
        uint32_t seed = 0x9e3779b9U;
        #define RND() (seed = seed * 1664525U + 1013904223U, seed >> 8)
        unsigned bad = 0, inserted = 0, refused = 0, removed = 0;
        clip_v3_empty(c, 1 + RND() % 128);
        for (unsigned round = 0; round < 40000; ++round) {
            unsigned op = RND() % 10, steps = clip_v3_steps(c), count = clip_v3_count(c);
            if (op < 6) {
                struct clip_v3_event v; v.kind = (uint8_t)(RND() % 12 == 0 ? 1 + RND() % 4 : CLIP_V3_NOTE);
                v.time = (int32_t)(RND() % (steps * 480U + 400U)) - 300; v.a = (uint8_t)(RND() % 140); v.b = (uint8_t)(RND() % 140); v.retrigger = RND() & 1; v.length = (uint16_t)(RND() % 3000);
                if (v.kind == CLIP_V3_PC || v.kind == CLIP_V3_PRESSURE) v.b = 0;
                int r = clip_v3_insert(c, &v);
                if (r >= 0) { ++inserted; if (clip_v3_count(c) != count + 1) ++bad; } else { ++refused; if (clip_v3_count(c) != count) ++bad; }
            } else if (op < 9 && count) { clip_v3_remove(c, RND() % count); ++removed; if (clip_v3_count(c) != count - 1) ++bad; }
            else { unsigned ms = RND() % 130; unsigned mv = RND() % 18; (void)clip_v3_step_mod_set(c, ms, mv); }
            if (clip_v3_validate(c, clip_v3_bytes(c)) != 0) { ++bad; clip_v3_empty(c, 1 + RND() % 128); }
            if (round % 5000 == 4999) clip_v3_empty(c, 1 + RND() % 128);
        }
        CHECK(bad == 0 && inserted > 5000 && refused > 1000 && removed > 5000, "edit: 40000 random edits, the clip valid after each (%u inserted, %u refused, %u removed, %u bad)", inserted, refused, removed, bad);
        #undef RND
    }
    printf(failures ? "%d of %d checks FAILED\n" : "all %d checks passed\n", failures ? failures : checks, checks);
    return failures != 0;
}
