/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/clip_v3.c — the v3 clip: validate, migrate, window (see clip_v3.h and docs/CLIP-V3.md)
 *
 * Purpose
 *   Everything the device and the tests do with a v3 payload. Pure C on <stdint.h> and timed_note.h. The device
 *   links what it calls (validate, to_v2, window; LTO drops from_v2, which only the host tools use).
 *
 * Version: 0.6
 *
 * Revision log
 *   v0.3  2026-11-16  Goal 6: editing in place (insert, remove, the notes of a step, step modifiers) for the step editor.
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
    /* v0.4: the clip chain: next, after (u16), times; the last four bytes stay 0 */
    if (p[8] > CLIP_V3_NEXT_MAX || get16(p + 9) > CLIP_V3_AFTER_MAX || p[11] > CLIP_V3_TIMES_MAX) return CLIP_V3_BAD_HEADER;
    /* v0.5: byte 12 is the transpose (-12..12 as a signed byte); the last three bytes stay 0 */
    if ((int8_t)p[12] < -CLIP_V3_TRANSPOSE_MAX || (int8_t)p[12] > CLIP_V3_TRANSPOSE_MAX) return CLIP_V3_BAD_HEADER;
    /* v0.6: byte 13 is the shuffle, byte 15 the playback quantize; byte 14 stays 0 */
    if (p[13] > CLIP_V3_SHUFFLE_MAX || p[14] || p[15] > CLIP_V3_QUANTIZE_MAX) return CLIP_V3_BAD_HEADER;
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
    if (steps > V2_STEPS || v3[1] || v3[8] || v3[12] || v3[13] || v3[15]) return CLIP_V3_NOT_V2_SHAPED;   /* v0.4: a chain is not v2 either; v0.5: nor a transpose */
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

/* ---- editing in place (v0.3) ------------------------------------------------------------------------------- */
unsigned clip_v3_bytes(const uint8_t *p) { return CLIP_V3_HEADER + CLIP_V3_EVENT * clip_v3_count(p); }
void clip_v3_empty(uint8_t *p, unsigned steps)
{
    memset(p, 0, CLIP_V3_HEADER);
    p[0] = (uint8_t)(steps < 1 ? 1 : steps > CLIP_V3_STEPS_MAX ? CLIP_V3_STEPS_MAX : steps);
}
unsigned clip_v3_step_notes(const uint8_t *p, unsigned step, uint16_t *out, unsigned max)
{
    unsigned count = clip_v3_count(p), n = 0;
    int from = (int)step * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS;      /* the earliest time anchored at `step` is from + 1 (from itself at step 0) */
    for (unsigned i = 0; i < count; ++i) {
        const uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * i;
        int time = (int)get16(e) - CLIP_V3_BIAS;
        if (time < from) continue;
        if (time > from + CLIP_V3_UNITS_PER_STEP) break;
        if ((e[3] & 0x80U) || clip_v3_anchor(time) != step) continue;
        if (n < max && out) out[n] = (uint16_t)i;
        ++n;
    }
    return n;
}
int clip_v3_note_find(const uint8_t *p, unsigned step, unsigned pitch)
{
    unsigned count = clip_v3_count(p);
    int from = (int)step * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS;
    for (unsigned i = 0; i < count; ++i) {
        const uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * i;
        int time = (int)get16(e) - CLIP_V3_BIAS;
        if (time < from) continue;
        if (time > from + CLIP_V3_UNITS_PER_STEP) break;
        if (!(e[3] & 0x80U) && (e[2] & 127U) == pitch && clip_v3_anchor(time) == step) return (int)i;
    }
    return -1;
}
int clip_v3_insert(uint8_t *p, const struct clip_v3_event *v)
{
    unsigned count = clip_v3_count(p), steps = p[0];
    int max_time = (int)steps * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS;
    if (v->time < -CLIP_V3_BIAS || v->time > max_time) return CLIP_V3_BAD_EVENT;
    if (v->kind == CLIP_V3_NOTE) {
        if (v->a > 127 || !v->b || v->b > 127 || !v->length) return CLIP_V3_BAD_EVENT;
        if (clip_v3_note_find(p, clip_v3_anchor(v->time), v->a) >= 0) return CLIP_V3_DUPLICATE;
    } else if (v->kind == CLIP_V3_CC || v->kind == CLIP_V3_BEND) { if (v->a > 127 || v->b > 127) return CLIP_V3_BAD_EVENT; }
    else if (v->kind == CLIP_V3_PC || v->kind == CLIP_V3_PRESSURE) { if (v->a > 127 || v->b) return CLIP_V3_BAD_EVENT; }
    else if (v->kind == CLIP_V3_STEPMOD) {
        if (v->a > 15 || v->b >= steps || v->time != (int)v->b * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS) return CLIP_V3_BAD_EVENT;
    } else return CLIP_V3_BAD_EVENT;
    if (count >= CLIP_V3_EVENTS_MAX) return CLIP_V3_NO_ROOM;
    unsigned at = count;
    /* A step modifier leads the events at its time (it must precede every note anchored at its step); anything else
     * follows the events already at its time. */
    while (at > 0) {
        int t = (int)get16(p + CLIP_V3_HEADER + CLIP_V3_EVENT * (at - 1U)) - CLIP_V3_BIAS;
        if (t < v->time || (t == v->time && v->kind != CLIP_V3_STEPMOD)) break;
        --at;
    }
    uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * at;
    memmove(e + CLIP_V3_EVENT, e, (size_t)CLIP_V3_EVENT * (count - at));
    put16(e, (unsigned)(v->time + CLIP_V3_BIAS));
    if (v->kind == CLIP_V3_NOTE) { e[2] = (uint8_t)(v->a | (v->retrigger ? 0x80U : 0U)); e[3] = v->b; put16(e + 4, v->length); }
    else { e[2] = v->kind; e[3] = 0x80; e[4] = v->a; e[5] = v->b; }
    put16(p + 6, count + 1U);
    return (int)at;
}
void clip_v3_remove(uint8_t *p, unsigned index)
{
    unsigned count = clip_v3_count(p);
    if (index >= count) return;
    uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * index;
    memmove(e, e + CLIP_V3_EVENT, (size_t)CLIP_V3_EVENT * (count - index - 1U));
    put16(p + 6, count - 1U);
}
static int step_mod_index(const uint8_t *p, unsigned step)
{
    unsigned count = clip_v3_count(p);
    int time = (int)step * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS;
    for (unsigned i = 0; i < count; ++i) {
        const uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * i;
        int t = (int)get16(e) - CLIP_V3_BIAS;
        if (t > time) break;
        if (t == time && (e[3] & 0x80U) && e[2] == CLIP_V3_STEPMOD && e[5] == step) return (int)i;
    }
    return -1;
}
unsigned clip_v3_step_mod(const uint8_t *p, unsigned step)
{
    int i = step_mod_index(p, step);
    return i < 0 ? 0U : p[CLIP_V3_HEADER + CLIP_V3_EVENT * (unsigned)i + 4];
}
int clip_v3_step_mod_set(uint8_t *p, unsigned step, unsigned value)
{
    int i = step_mod_index(p, step);
    if (value > 15 || step >= p[0]) return CLIP_V3_BAD_EVENT;
    if (i >= 0) { if (value) { p[CLIP_V3_HEADER + CLIP_V3_EVENT * (unsigned)i + 4] = (uint8_t)value; return i; } clip_v3_remove(p, (unsigned)i); return 0; }
    if (!value) return 0;
    struct clip_v3_event v = { (int32_t)step * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS, CLIP_V3_STEPMOD, (uint8_t)value, (uint8_t)step, 0, 0 };
    return clip_v3_insert(p, &v);
}
/* ---- the header's settings (v0.4) -------------------------------------------------------------------------- */
unsigned clip_v3_next(const uint8_t *p) { return p[8]; }
unsigned clip_v3_after(const uint8_t *p) { return get16(p + 9); }
unsigned clip_v3_times(const uint8_t *p) { return p[11] ? p[11] : 1U; }
int clip_v3_chain_set(uint8_t *p, unsigned next, unsigned after, unsigned times)
{
    if (next > CLIP_V3_NEXT_MAX || after > CLIP_V3_AFTER_MAX || times < 1 || times > CLIP_V3_TIMES_MAX) return CLIP_V3_BAD_HEADER;
    p[8] = (uint8_t)next; put16(p + 9, after); p[11] = (uint8_t)(times == 1 ? 0 : times);
    return CLIP_V3_OK;
}
int clip_v3_steps_set(uint8_t *p, unsigned steps)
{
    if (steps < 1 || steps > CLIP_V3_STEPS_MAX) return CLIP_V3_BAD_HEADER;
    int max_time = (int)steps * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS, removed = 0;
    for (unsigned i = clip_v3_count(p); i-- > 0;) {
        const uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * i;
        int time = (int)get16(e) - CLIP_V3_BIAS;
        if (time > max_time || ((e[3] & 0x80U) && e[2] == CLIP_V3_STEPMOD && e[5] >= steps)) { clip_v3_remove(p, i); ++removed; }
    }
    p[0] = (uint8_t)steps;
    return removed;
}
int clip_v3_program_set(uint8_t *p, unsigned program, unsigned bank_msb, unsigned bank_lsb)
{
    if ((program > 127 && program != 255) || (bank_msb > 127 && bank_msb != 255) || bank_lsb > 127) return CLIP_V3_BAD_HEADER;
    p[1] = (uint8_t)((p[1] & ~3U) | (program != 255 ? CLIP_V3_FLAG_PROGRAM : 0U) | (bank_msb != 255 ? CLIP_V3_FLAG_BANK : 0U));
    p[2] = (uint8_t)(program != 255 ? program : 0); p[3] = (uint8_t)(bank_msb != 255 ? bank_msb : 0); p[4] = (uint8_t)(bank_msb != 255 ? bank_lsb : 0);
    return CLIP_V3_OK;
}
int clip_v3_transpose(const uint8_t *p) { return (int8_t)p[12]; }
int clip_v3_transpose_set(uint8_t *p, int semitones)
{
    if (semitones < -CLIP_V3_TRANSPOSE_MAX || semitones > CLIP_V3_TRANSPOSE_MAX) return CLIP_V3_BAD_HEADER;
    p[12] = (uint8_t)(int8_t)semitones;
    return CLIP_V3_OK;
}
unsigned clip_v3_shuffle(const uint8_t *p) { return p[13]; }
int clip_v3_shuffle_set(uint8_t *p, unsigned value)
{
    if (value > CLIP_V3_SHUFFLE_MAX) return CLIP_V3_BAD_HEADER;
    p[13] = (uint8_t)value;
    return CLIP_V3_OK;
}
unsigned clip_v3_quantize(const uint8_t *p) { return p[15]; }
int clip_v3_quantize_set(uint8_t *p, unsigned value)
{
    if (value > CLIP_V3_QUANTIZE_MAX) return CLIP_V3_BAD_HEADER;
    p[15] = (uint8_t)value;
    return CLIP_V3_OK;
}
void clip_v3_quantize_apply(uint8_t *p)
{
    unsigned q = p[15], count = clip_v3_count(p);
    uint8_t *base = p + CLIP_V3_HEADER;
    p[15] = 0;
    if (!q || q > CLIP_V3_QUANTIZE_MAX) return;
    int grid = CLIP_V3_UNITS_PER_STEP << (q - 1U), max_time = (int)p[0] * CLIP_V3_UNITS_PER_STEP - CLIP_V3_BIAS;
    for (unsigned i = 0; i < count; ++i) {
        uint8_t *e = base + CLIP_V3_EVENT * i;
        if (e[3] & 0x80U) continue;
        int v = (int)get16(e) - CLIP_V3_BIAS + grid / 2 - 1;
        v = v < 0 ? 0 : v / grid * grid;
        if (v > max_time) v = 0;                     /* the clip's end is its start: the note opens the next pass */
        put16(e, (unsigned)(v + CLIP_V3_BIAS));
    }
    for (unsigned i = 1; i < count; ++i) {           /* back in time order; events at one time keep their order */
        uint8_t x[CLIP_V3_EVENT]; unsigned k = i;
        memcpy(x, base + CLIP_V3_EVENT * i, sizeof x);
        for (; k && get16(base + CLIP_V3_EVENT * (k - 1U)) > get16(x); --k) memcpy(base + CLIP_V3_EVENT * k, base + CLIP_V3_EVENT * (k - 1U), sizeof x);
        memcpy(base + CLIP_V3_EVENT * k, x, sizeof x);
    }
    for (unsigned i = 1; i < count; ++i) {           /* two notes of one pitch on one step: the first stays */
        const uint8_t *e = base + CLIP_V3_EVENT * i;
        if (e[3] & 0x80U) continue;
        for (unsigned k = i; k-- > 0 && get16(base + CLIP_V3_EVENT * k) == get16(e);) {
            const uint8_t *o = base + CLIP_V3_EVENT * k;
            if (!(o[3] & 0x80U) && (o[2] & 127U) == (e[2] & 127U)) { clip_v3_remove(p, i); --i; --count; break; }
        }
    }
}
void clip_v3_transpose_apply(uint8_t *p)
{
    int by = (int8_t)p[12];
    p[12] = 0;
    if (!by) return;
    for (unsigned i = 0, n = clip_v3_count(p); i < n; ++i) {
        uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * i;
        if (e[3] & 0x80U) continue;
        int pitch = (int)(e[2] & 127U) + by;
        pitch = pitch < 0 ? 0 : pitch > 127 ? 127 : pitch;
        e[2] = (uint8_t)((e[2] & 0x80U) | (unsigned)pitch);
    }
}
