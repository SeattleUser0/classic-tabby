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
        t[9] = 1; CHECK(clip_v3_validate(t, (unsigned)n) == CLIP_V3_BAD_HEADER, "reserved header byte"); t[9] = 0;
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
            if ((a < 0) != (b != 0)) ++bad;                    /* the two grid conversions agree on what a grid can hold */
            if (a > 0) { int c = clip_v3_from_v2(out2, (unsigned)a, f, sizeof f, NULL); if (c <= 0) ++bad; }
        }
        CHECK(bad == 0, "fuzz: nothing the validator accepts breaks a rule (%u bad)", bad);
        CHECK(accepted > 8000 && refused > 20000 && walked == accepted, "fuzz: 60000 payloads: %u accepted and walked through the window, %u refused", accepted, refused);
        #undef RND
    }
    printf(failures ? "%d of %d checks FAILED\n" : "all %d checks passed\n", failures ? failures : checks, checks);
    return failures != 0;
}
