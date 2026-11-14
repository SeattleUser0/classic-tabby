/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/clip_v3.c — the v3 clip: validate, migrate, window (see clip_v3.h and docs/CLIP-V3.md)
 *
 * Purpose
 *   Everything the device and the tests do with a v3 payload. Pure C on <stdint.h> and timed_note.h. The device
 *   links what it calls (validate, to_v2, window; LTO drops from_v2, which only the host tools use).
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-14  Task 17: an event's time is 32 bits (the 16-bit field was wrong for a clip longer than 68 steps).
 *   v0.1  2026-11-12  Initial version (Task 16 Goal 5, branch classic-tabby/mc707-phase2; not released).
 */
#include "clip_v3.h"
#include "timed_note.h"
#include <string.h>

enum { V2_STEPS = 64, V2_NOTES_MAX = 4, PAIR = 2 * CLIP_V3_UNITS_PER_STEP, LENGTH_MAX = 65535 };

static unsigned get16(const uint8_t *p) { return p[0] | (unsigned)p[1] << 8; }
static void put16(uint8_t *p, unsigned v) { p[0] = (uint8_t)v; p[1] = (uint8_t)(v >> 8); }

unsigned clip_v3_steps(const uint8_t *p) { return p[0]; }
unsigned clip_v3_count(const uint8_t *p) { return get16(p + 6); }
unsigned clip_v3_anchor(int time)
{
    int s = (time + 239) / CLIP_V3_UNITS_PER_STEP;
    if (time + 239 < 0) s = 0;                       /* C division truncates toward zero: -239..-1 -> 0, and -240 clamps to step 0 */
    return (unsigned)(s < 0 ? 0 : s);
}
void clip_v3_event(const uint8_t *p, unsigned index, struct clip_v3_event *out)
{
    const uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * index;
    out->time = (int32_t)get16(e) - CLIP_V3_BIAS;   /* v0.2: was cast to int16_t, wrong past step 68 */
    if (!(e[3] & 0x80U)) {
        out->kind = CLIP_V3_NOTE; out->a = e[2] & 127U; out->retrigger = e[2] >> 7; out->b = e[3] & 127U; out->length = (uint16_t)get16(e + 4);
    } else {
        out->kind = e[2]; out->a = e[4]; out->b = e[5]; out->retrigger = 0; out->length = 0;
    }
}
int clip_v3_validate(const uint8_t *p, unsigned bytes)
{
    if (bytes < CLIP_V3_HEADER) return CLIP_V3_BAD_SIZE;
    unsigned steps = p[0], flags = p[1], count = get16(p + 6);
    if (count > CLIP_V3_EVENTS_MAX || bytes != CLIP_V3_HEADER + (unsigned)CLIP_V3_EVENT * count) return CLIP_V3_BAD_SIZE;
    if (steps < 1 || steps > CLIP_V3_STEPS_MAX || (flags & ~3U) || p[2] > 127 || p[3] > 127 || p[4] > 127 || p[5]) return CLIP_V3_BAD_HEADER;
    if (!(flags & CLIP_V3_FLAG_PROGRAM) && p[2]) return CLIP_V3_BAD_HEADER;
    if (!(flags & CLIP_V3_FLAG_BANK) && (p[3] || p[4])) return CLIP_V3_BAD_HEADER;
    for (unsigned i = 8; i < CLIP_V3_HEADER; ++i) if (p[i]) return CLIP_V3_BAD_HEADER;
    int last = -CLIP_V3_BIAS - 1, max_time = (int)steps * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS;
    unsigned group_anchor = 0xffffffffU, group_start = 0;
    for (unsigned i = 0; i < count; ++i) {
        const uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * i;
        int time = (int)get16(e) - CLIP_V3_BIAS;
        if (time < -CLIP_V3_BIAS || time > max_time) return CLIP_V3_BAD_EVENT;
        if (time < last) return CLIP_V3_BAD_ORDER;
        last = time;
        if (!(e[3] & 0x80U)) {
            if (!(e[3] & 127U) || !get16(e + 4)) return CLIP_V3_BAD_EVENT;
            unsigned anchor = clip_v3_anchor(time);
            if (anchor != group_anchor) { group_anchor = anchor; group_start = i; }
            for (unsigned k = group_start; k < i; ++k) {
                const uint8_t *q = p + CLIP_V3_HEADER + CLIP_V3_EVENT * k;
                if (!(q[3] & 0x80U) && (q[2] & 127U) == (e[2] & 127U) && clip_v3_anchor((int)get16(q) - CLIP_V3_BIAS) == anchor) return CLIP_V3_DUPLICATE;
            }
        } else {
            unsigned type = e[2];
            if ((e[3] & 127U)) return CLIP_V3_BAD_EVENT;
            if (type == CLIP_V3_CC) { if (e[4] > 127 || e[5] > 127) return CLIP_V3_BAD_EVENT; }
            else if (type == CLIP_V3_PC) { if (e[4] > 127 || e[5]) return CLIP_V3_BAD_EVENT; }
            else if (type == CLIP_V3_BEND) { if (e[4] > 127 || e[5] > 127) return CLIP_V3_BAD_EVENT; }
            else if (type == CLIP_V3_PRESSURE) { if (e[4] > 127 || e[5]) return CLIP_V3_BAD_EVENT; }
            else if (type == CLIP_V3_STEPMOD) {
                if (e[4] > 15 || e[5] >= steps || time != (int)e[5] * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS) return CLIP_V3_BAD_EVENT;
            } else return CLIP_V3_BAD_EVENT;
        }
    }
    return CLIP_V3_OK;
}

/* ---- v2 -> v3 ---------------------------------------------------------------------------------- */
struct work { int16_t time; uint8_t step, kind, a, b, retrigger; uint16_t length; };
int clip_v3_from_v2(const uint8_t *v2, unsigned bytes, uint8_t *out, unsigned cap, struct clip_v3_report *rep)
{
    struct clip_v3_report local; if (!rep) rep = &local;
    memset(rep, 0, sizeof *rep);
    static struct work w[CLIP_V3_EVENTS_MAX];              /* host and workbench-side tool only: not on the device's stack */
    unsigned n = 0, at = 0;
    for (unsigned step = 0; step < V2_STEPS; ++step) {
        if (at >= bytes) return CLIP_V3_BAD_SOURCE;
        unsigned head = v2[at++], count = head & 7U, prob = (head >> 3) & 7U, tune = (head >> 6) & 1U;
        if (count > V2_NOTES_MAX || (head & 0x80U) || at + TIMED_NOTE_BYTES * count > bytes) return CLIP_V3_BAD_SOURCE;
        if (prob || tune) {
            if (n >= CLIP_V3_EVENTS_MAX) return CLIP_V3_NO_ROOM;
            w[n].time = (int16_t)((int)step * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS); w[n].step = (uint8_t)step; w[n].kind = CLIP_V3_STEPMOD;
            w[n].a = (uint8_t)(prob | tune << 3); w[n].b = (uint8_t)step; w[n].retrigger = 0; w[n].length = 0; ++n; ++rep->step_modifiers;
        }
        for (unsigned i = 0; i < count; ++i, at += TIMED_NOTE_BYTES) {
            struct timed_note note;
            if (n >= CLIP_V3_EVENTS_MAX) return CLIP_V3_NO_ROOM;
            if (timed_note_decode(v2 + at, &note)) return CLIP_V3_BAD_SOURCE;
            int time = (int)step * CLIP_V3_UNITS_PER_STEP + note.offset;
            if (step > 0 && note.offset == -CLIP_V3_BIAS) ++rep->retied;
            if (note.length > LENGTH_MAX) { note.length = LENGTH_MAX; ++rep->clamped_lengths; }
            w[n].time = (int16_t)time; w[n].step = (uint8_t)step; w[n].kind = CLIP_V3_NOTE; w[n].a = note.pitch; w[n].b = note.velocity;
            w[n].retrigger = note.retrigger; w[n].length = (uint16_t)note.length; ++n;
        }
    }
    if (at != bytes) return CLIP_V3_BAD_SOURCE;
    if (CLIP_V3_HEADER + CLIP_V3_EVENT * n > cap) return CLIP_V3_NO_ROOM;
    /* stable insertion sort by time; count the steps whose notes changed order */
    uint64_t moved = 0;
    for (unsigned i = 1; i < n; ++i) {
        struct work x = w[i]; unsigned j = i;
        while (j > 0 && w[j - 1].time > x.time) {
            if (w[j - 1].kind == CLIP_V3_NOTE && x.kind == CLIP_V3_NOTE && w[j - 1].step == x.step) moved |= (uint64_t)1 << x.step;
            w[j] = w[j - 1]; --j;
        }
        w[j] = x;
    }
    for (unsigned s = 0; s < V2_STEPS; ++s) if ((moved >> s) & 1U) ++rep->reordered;
    memset(out, 0, CLIP_V3_HEADER);
    out[0] = V2_STEPS; put16(out + 6, n);
    for (unsigned i = 0; i < n; ++i) {
        uint8_t *e = out + CLIP_V3_HEADER + CLIP_V3_EVENT * i;
        put16(e, (unsigned)(w[i].time + CLIP_V3_BIAS));
        if (w[i].kind == CLIP_V3_NOTE) { e[2] = (uint8_t)(w[i].a | w[i].retrigger << 7); e[3] = w[i].b; put16(e + 4, w[i].length); }
        else { e[2] = w[i].kind; e[3] = 0x80; e[4] = w[i].a; e[5] = w[i].b; }
    }
    return (int)(CLIP_V3_HEADER + CLIP_V3_EVENT * n);
}

/* ---- v3 -> v2 ---------------------------------------------------------------------------------- */
int clip_v3_to_v2(const uint8_t *v3, unsigned bytes, uint8_t *out, unsigned cap)
{
    int r = clip_v3_validate(v3, bytes);
    if (r) return r;
    unsigned steps = v3[0], count = clip_v3_count(v3);
    if (steps > V2_STEPS || v3[1]) return CLIP_V3_NOT_V2_SHAPED;
    uint8_t per_step[V2_STEPS], head[V2_STEPS];
    memset(per_step, 0, sizeof per_step); memset(head, 0, sizeof head);
    unsigned notes = 0;
    for (unsigned i = 0; i < count; ++i) {
        struct clip_v3_event e; clip_v3_event(v3, i, &e);
        if (e.kind == CLIP_V3_NOTE) {
            unsigned a = clip_v3_anchor(e.time);
            if (a >= V2_STEPS || per_step[a] >= V2_NOTES_MAX) return CLIP_V3_NOT_V2_SHAPED;
            ++per_step[a]; ++notes;
        } else if (e.kind == CLIP_V3_STEPMOD) head[e.b] = (uint8_t)((e.a & 7U) << 3 | ((e.a >> 3) & 1U) << 6);
        else return CLIP_V3_NOT_V2_SHAPED;
    }
    unsigned size = V2_STEPS + TIMED_NOTE_BYTES * notes;
    if (size > cap) return CLIP_V3_NO_ROOM;
    unsigned at = 0;
    for (unsigned s = 0; s < V2_STEPS; ++s) {
        out[at++] = (uint8_t)(per_step[s] | head[s]);
        for (unsigned i = 0, written = 0; i < count && written < per_step[s]; ++i) {
            struct clip_v3_event e; clip_v3_event(v3, i, &e);
            if (e.kind != CLIP_V3_NOTE || clip_v3_anchor(e.time) != s) continue;
            struct timed_note note;
            note.pitch = e.a; note.velocity = e.b; note.retrigger = e.retrigger; note.offset = (int16_t)(e.time - (int)s * CLIP_V3_UNITS_PER_STEP); note.length = e.length;
            if (timed_note_encode(&note, out + at)) return CLIP_V3_BAD_EVENT;
            at += TIMED_NOTE_BYTES; ++written;
        }
    }
    return (int)at;
}

int clip_v3_to_cells(const uint8_t *v3, unsigned bytes, uint8_t cells[][25])
{
    int r = clip_v3_validate(v3, bytes);
    if (r) return r;
    unsigned steps = v3[0], count = clip_v3_count(v3);
    if (steps > V2_STEPS || v3[1]) return CLIP_V3_NOT_V2_SHAPED;
    for (unsigned s = 0; s < V2_STEPS; ++s) memset(cells[s], 0, 25);
    for (unsigned i = 0; i < count; ++i) {
        struct clip_v3_event e; clip_v3_event(v3, i, &e);
        if (e.kind == CLIP_V3_NOTE) {
            unsigned a = clip_v3_anchor(e.time), k = cells[a][0] & 7U;
            if (a >= V2_STEPS || k >= V2_NOTES_MAX) return CLIP_V3_NOT_V2_SHAPED;
            struct timed_note note;
            note.pitch = e.a; note.velocity = e.b; note.retrigger = e.retrigger; note.offset = (int16_t)(e.time - (int)a * CLIP_V3_UNITS_PER_STEP); note.length = e.length;
            if (timed_note_encode(&note, cells[a] + 1 + TIMED_NOTE_BYTES * k)) return CLIP_V3_BAD_EVENT;
            cells[a][0] = (uint8_t)((cells[a][0] & ~7U) | (k + 1U));
        } else if (e.kind == CLIP_V3_STEPMOD) {
            cells[e.b][0] = (uint8_t)((cells[e.b][0] & 7U) | (e.a & 7U) << 3 | ((e.a >> 3) & 1U) << 6);
        } else return CLIP_V3_NOT_V2_SHAPED;
    }
    return CLIP_V3_OK;
}

/* ---- the cursor -------------------------------------------------------------------------------- */
int clip_v3_warp(int t, unsigned s)
{
    if (!s) return t;
    if (t < 0) return t * (int)(100 - s) / 100;
    int pair = t / PAIR, x = t % PAIR;
    int w = x < CLIP_V3_UNITS_PER_STEP ? x * (int)(100 + s) / 100
                                       : CLIP_V3_UNITS_PER_STEP * (int)(100 + s) / 100 + (x - CLIP_V3_UNITS_PER_STEP) * (int)(100 - s) / 100;
    return pair * PAIR + w;
}
unsigned clip_v3_window(const uint8_t *p, unsigned *cursor, int from, int to, unsigned swing, clip_v3_fn fn, void *context)
{
    unsigned count = clip_v3_count(p), delivered = 0, i = *cursor;
    for (; i < count; ++i) {
        struct clip_v3_event e; clip_v3_event(p, i, &e);
        int t = clip_v3_warp(e.time, swing);
        if (t >= to) break;
        if (t < from) continue;                  /* a late start: what is already past is not played */
        fn(context, &e, t); ++delivered;
    }
    *cursor = i;
    return delivered;
}
