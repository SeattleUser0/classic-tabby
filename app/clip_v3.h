/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/clip_v3.h — the v3 clip: an event list (docs/CLIP-V3.md)
 *
 * Purpose
 *   The block payload for clips longer than 64 steps, with more than four notes in a step, or with controller
 *   events. This module is pure: it depends on <stdint.h> and timed_note.h only (no board, SDK, song-storage or
 *   project symbol), so the host tests, the simulator and the device compile the same file. JavaScript twin:
 *   web/clip-v3/clip-v3.js (checked byte for byte against this code by tests/clip-v3/run.mjs).
 *
 *   Layout (all little-endian): 16-byte header {steps, flags, program, bank_msb, bank_lsb, 0, count u16, 8 x 0},
 *   then `count` 6-byte events sorted by time. A note: {time u16 (biased by 240), pitch | retrigger << 7,
 *   velocity (bit 7 = 0), length u16}; other: {time u16, type, 0x80, a, b}. See the document for the types.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-12  Initial version (Task 16 Goal 5, branch classic-tabby/mc707-phase2; not released).
 */
#ifndef CLIP_V3_H
#define CLIP_V3_H
#include <stdint.h>

enum {
    CLIP_V3_HEADER = 16, CLIP_V3_EVENT = 6,
    CLIP_V3_EVENTS_MAX = 512, CLIP_V3_STEPS_MAX = 128,
    CLIP_V3_BYTES_MAX = CLIP_V3_HEADER + CLIP_V3_EVENTS_MAX * CLIP_V3_EVENT,   /* 3088 */
    CLIP_V3_BIAS = 240, CLIP_V3_UNITS_PER_STEP = 480
};
/* Event kinds: 0 = note; otherwise the "other" type byte. */
enum { CLIP_V3_NOTE = 0, CLIP_V3_CC = 1, CLIP_V3_PC = 2, CLIP_V3_BEND = 3, CLIP_V3_PRESSURE = 4, CLIP_V3_STEPMOD = 8 };
enum { CLIP_V3_FLAG_PROGRAM = 1, CLIP_V3_FLAG_BANK = 2 };
/* Result codes (negative). */
enum { CLIP_V3_OK = 0, CLIP_V3_BAD_SIZE = -1, CLIP_V3_NOT_V2_SHAPED = -2, CLIP_V3_BAD_HEADER = -3, CLIP_V3_BAD_EVENT = -4,
       CLIP_V3_BAD_ORDER = -5, CLIP_V3_DUPLICATE = -6, CLIP_V3_NO_ROOM = -7, CLIP_V3_BAD_SOURCE = -8 };

struct clip_v3_event {
    int16_t time;          /* units from the clip start, -240 .. steps * 480 - 240 */
    uint8_t kind;          /* CLIP_V3_NOTE or the type */
    uint8_t a, b;          /* note: pitch, velocity; CC: controller, value; PC: program; bend: lsb, msb; pressure: value; step mod: probability | tuning << 3, step */
    uint8_t retrigger;     /* note only */
    uint16_t length;       /* note only, units */
};
struct clip_v3_report {
    unsigned clamped_lengths;   /* notes whose length was above 65535 units and was clamped */
    unsigned retied;            /* notes stored at step s + 1 with offset -240 (read as step s, offset +240) */
    unsigned reordered;         /* steps whose notes the sort put in another order */
    unsigned step_modifiers;    /* steps that carry probability or the tuning bit */
};

/* 0 when `p[0..bytes)` is a valid v3 payload, a negative CLIP_V3_* code otherwise. */
int clip_v3_validate(const uint8_t *p, unsigned bytes);
unsigned clip_v3_steps(const uint8_t *p);
unsigned clip_v3_count(const uint8_t *p);
void clip_v3_event(const uint8_t *p, unsigned index, struct clip_v3_event *out);
/* The anchor step of a time (the step the note is heard against; the v2 rule, ties to the earlier step). */
unsigned clip_v3_anchor(int time);
/* v2 payload (64 steps of {head, notes}) -> v3. Returns the v3 length, or a negative code. `rep` may be NULL. */
int clip_v3_from_v2(const uint8_t *v2, unsigned bytes, uint8_t *out, unsigned cap, struct clip_v3_report *rep);
/* v3 -> v2, only when the clip is v2-shaped (<= 64 steps, <= 4 notes per anchor step, notes and step modifiers
 * only, no header program or bank): the exact inverse of clip_v3_from_v2 up to the canonical note order. A clip
 * shorter than 64 steps is padded with empty steps. Returns the v2 length or a negative code. */
int clip_v3_to_v2(const uint8_t *v3, unsigned bytes, uint8_t *out, unsigned cap);
/* v3 -> the scheduler's step grid directly (app/song.c's cell layout: 64 cells of {head, 4 timed notes of 6 bytes}, 25
 * bytes each; cells are cleared first): the adapter that lets the existing scheduler play a v3 clip that is v2-shaped.
 * Returns 0 or a negative code (CLIP_V3_NOT_V2_SHAPED when the grid cannot hold the clip). */
int clip_v3_to_cells(const uint8_t *v3, unsigned bytes, uint8_t cells[][25]);
/* The scheduler cursor. `cursor` is the index of the next event to consider; the call hands every event whose
 * swung time lies in [from, to) (units from the clip start) to `fn`, in list order, and advances the cursor past
 * them. `swing` is the block's swing percent (0..50), warped as app/song.c does. Events before `from` that the
 * cursor had not reached are skipped (a late start). Returns the number of events delivered. */
typedef void (*clip_v3_fn)(void *context, const struct clip_v3_event *event, int swung_time);
unsigned clip_v3_window(const uint8_t *p, unsigned *cursor, int from, int to, unsigned swing, clip_v3_fn fn, void *context);
int clip_v3_warp(int time, unsigned swing);
#endif
