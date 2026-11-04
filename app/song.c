/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/song.c — Classic Tabby song sequencer (Task 03 checkpoint d, Task 04, Task 05)
 *
 * Purpose
 *   Row playback for song mode. Two RAM row buffers hold the decoded blocks of the
 *   current and the next row (8 tracks × 64 steps × 25 bytes: a step header and up to
 *   four timed notes in their 6-byte wire form, section 9.12). The control task
 *   (song_poll) decodes one row ahead from song storage, so the audio thread never waits
 *   on flash; the audio tick (song_tick, once per 128-frame block from the router's
 *   clock hook) keeps the song position in units (1/480 of a 16th step), starts and
 *   releases notes in the block that contains their time, and switches frames (row
 *   entries, repeats, queued jumps) at the boundary.
 *
 *   Time (Task 05). Each tick advances the position by tempo × 1024 / 11025 units, kept
 *   exact with a remainder (acc), so there is no drift. A note's due time is
 *   warp(step × 480 + offset) where warp() applies the swing that belongs to the note's
 *   block (section 9.12: a v1 block follows the project swing as on tabby-v02.0, a v2
 *   block follows the song's flag bit 2); its note-off is warp(start + length) later.
 *   Everything due inside the tick's window [p0, p1) is turned into an action list,
 *   sorted by time (note-offs before note-ons at equal times), and played in that order
 *   into router lane 0, which drains in FIFO order. Notes anchored on step 0 with a
 *   negative offset belong to the frame that follows: while the window approaches a
 *   boundary whose next frame is known (the natural next row or repeat, or a queued jump
 *   whose row is decoded), they are fired ahead of it (look-ahead); when the next frame
 *   became known too late, they fire at the boundary and the entry counts in `late`.
 *
 *   Notes go through app/midi_router.c under the song owner (groove_midi_song_note):
 *   MIDI out gets stock timing, the internal engine gets the same notes through the
 *   control-task MIDI-in queue (FM6 preview), and the router's held-note maps release
 *   everything on the right channel when the song's output-channel override starts or
 *   ends (groove_midi_song_channels).
 *
 *   Shared state between the two threads is written on one side only:
 *     control -> audio: start_request, stop_request, jump_row, jump_mode, song_end,
 *                       swing values, tempo override, buffer contents then buffer.ready
 *     audio -> control: playing, cur (current buffer index), pos, repeat, underruns,
 *                       late_count, buffer.ready = 0 after a swap; the audio-only fields
 *                       of a buffer (look-ahead coverage, probability masks)
 *   Each buffer is filled by control only while its ready flag is 0 and read by audio
 *   only while it is 1 (the current buffer keeps ready = 1 until it is swapped out).
 *
 *   Known limits (v1): internal clock only (song mode refuses to start in MIDI clock
 *   mode); the alt-tuning bit of a step is stored but not applied by the device. The
 *   look-ahead fires the notes of the frame it expects; a jump queued after that lands
 *   elsewhere and those few notes play anyway (their note-offs follow as usual).
 *
 *   Row events (Task 04, 9.11): a row buffer also carries the row's events (program
 *   change, bank + program, control change, gap). The audio tick streams them under the
 *   router's channel owners: the stream of the next row starts `lead` blocks (the sum of
 *   its gaps) before the boundary where the row is entered, so its last message leaves in
 *   the boundary tick, before the row's first notes (lane 0 drains in order). A stream
 *   that could not start early enough (a jump queued late) is counted in `late`. SEND
 *   SETUP streams row 0 while stopped, from the same tick.
 *
 * Version: 0.3
 *
 * Revision log
 *   v0.3  2026-11-03  Task 05: timed notes (payload v2), unit positions with an exact
 *                     advance, window scheduling in time order, per-block swing, note-offs
 *                     in units, look-ahead for negative offsets with the late counter,
 *                     probability rolled once per step and pass, song notes in lane 0.
 *   v0.2  2026-11-02  Task 04: row events, pre-firing, late counter, SEND SETUP.
 *   v0.1  2026-11-02  Initial version.
 */
#include "song.h"
#include "timed_note.h"
#include "instrument.h"
#include <string.h>

enum { NOTE = TIMED_NOTE_BYTES, CELL = 1 + SONG_NOTES_PER_STEP * NOTE };   /* 25: step header + 4 timed notes */
enum { UNITS = TIMED_NOTE_UNITS_PER_STEP, HALF = TIMED_NOTE_OFFSET_MAX, PAIR = 2 * UNITS, BAR = 16 * UNITS };
enum { ADV_MUL = 1024, ADV_DIV = 11025 };  /* units per block = tempo × 4 × 480 × 128 / (44100 × 60) = tempo × 1024 / 11025 */
enum { LOOK_NONE = 0x7fff, ACTIONS = 128 }; /* 8 tracks × 4 notes × 3 steps + note-offs: a window spans at most 28 units */
struct rowbuf {
    uint8_t cell[SONG_TRACKS][SONG_BLOCK_STEPS][CELL];
    uint8_t swing[SONG_TRACKS];        /* swing percent that applies to this track's block (9.12) */
    /* Row events (9.11): {channel | type << 4, d0, d1, d2} in firing order; a gap's d0 is
     * already converted to audio blocks. lead = the sum of the gaps, in blocks. */
    uint8_t event[SONG_ROW_EVENTS_MAX][4];
    uint8_t event_count;
    uint16_t lead;
    uint8_t row, steps, repeat, loop_here;
    /* Audio only. look_from: the look-ahead's coverage of this buffer's step 0, as the
     * smallest next-frame due time already scanned (LOOK_NONE: no look-ahead yet; a note
     * due before look_from was not fired and is late at the entry); look_row guards against
     * a buffer decoded anew. */
    int16_t look_from;
    uint8_t look_row;
    volatile uint8_t ready;
};
static struct rowbuf buffers[2];
static struct song_record record;
static unsigned loaded = SONG_NONE, state, last_error; /* state: 0 stopped, 1 playing, 2 stopping */
static uint8_t payload[SONG_PAYLOAD_MAX];
/* control -> audio */
static volatile unsigned start_request, stop_request, jump_row = SONG_NONE, jump_mode, song_end, swing_project, swing_song, tempo_override;
/* audio -> control */
static volatile unsigned playing, cur, pos, repeat, underruns;
/* audio only */
static struct { uint8_t pitch; uint32_t remaining; } sounding[SONG_TRACKS][SONG_SOUNDING_MAX]; /* remaining: units from the next window start */
static uint8_t sounding_count[SONG_TRACKS];
static uint32_t acc, rnd = 0x2545f491U;
/* Probability (9.3): one roll per track, step and pass, shared by the step's notes. A
 * track's notes are met in time order, so the last roll is the only one that can be asked
 * again (a step's notes spread over several blocks); `pass` counts frame entries and the
 * look-ahead rolls for the pass to come. */
static uint8_t roll_step[SONG_TRACKS], roll_pass[SONG_TRACKS], roll_skip[SONG_TRACKS], pass;
/* One tick's actions: `at` is units after the window start; kind 0 = note-off (pitch),
 * 1 = note-on of note `index` on `step` of buffer `buf`; phase 1 = after the boundary. */
struct action { uint16_t at; uint8_t kind, phase, buf, track, step, index, pitch; };
static struct action actions[ACTIONS];
static unsigned action_count;
/* Row event stream (9.11), audio only: the buffer being streamed, the next event, the
 * blocks still to wait. armed/streamed/armed_row detect a freshly decoded buffer (ready
 * 0 -> 1) so that each row entry is streamed exactly once. */
static struct { uint8_t buf, next, active; uint16_t wait; } stream;
static uint8_t armed[2], streamed[2], armed_row[2];
static volatile unsigned late_count, setup_request;   /* audio -> control, control -> audio */

static FM1_AUDIO_CODE void barrier(void)
{
#ifndef FM1_HOST_TEST
    __asm__ volatile("csync" ::: "memory");
#endif
}
/* ---- time ---------------------------------------------------------------------------- */
/* Swung time of a straight time (9.12): inside each pair of steps the first 480 units
 * scale by (100 + s)/100 and the next 480 by (100 - s)/100; a negative time (a step-0
 * note before its frame, -240..-1) scales by (100 - s)/100. Identity for s = 0. */
static FM1_AUDIO_CODE int32_t warp(int32_t t, unsigned s)
{
    if (!s) return t;
    if (t < 0) return t * (int32_t)(100 - s) / 100;
    int32_t pair = t / PAIR, x = t % PAIR;
    int32_t w = x < UNITS ? x * (int32_t)(100 + s) / 100
                          : UNITS * (int32_t)(100 + s) / 100 + (x - UNITS) * (int32_t)(100 - s) / 100;
    return pair * PAIR + w;
}
/* ---- audio thread: notes ------------------------------------------------------------- */
static FM1_AUDIO_CODE void note_off(unsigned t, unsigned i)
{
    groove_midi_song_note(t, sounding[t][i].pitch, 0);
    sounding[t][i] = sounding[t][--sounding_count[t]];
}
static FM1_AUDIO_CODE void release_all(void)
{
    for (unsigned t = 0; t < SONG_TRACKS; ++t) while (sounding_count[t]) note_off(t, 0);
}
static FM1_AUDIO_CODE int step_skipped(unsigned t, unsigned step, unsigned probability, unsigned which)
{
    if (!probability) return 0;
    if (roll_step[t] != step || roll_pass[t] != which) {
        roll_step[t] = (uint8_t)step; roll_pass[t] = (uint8_t)which;
        rnd = rnd * 1103515245U + 12345U;
        roll_skip[t] = ((rnd >> 16) & 7U) >= probability;
    }
    return roll_skip[t];
}
/* Start note `index` of `step` on track t, `at` units after the window start. */
static FM1_AUDIO_CODE void note_on(unsigned buf, unsigned t, unsigned step, unsigned index, unsigned at)
{
    struct rowbuf *b = &buffers[buf];
    struct timed_note n;
    timed_note_unpack(b->cell[t][step] + 1 + NOTE * index, &n);
    int32_t start = (int32_t)step * UNITS + n.offset;
    uint32_t dur = (uint32_t)(warp(start + (int32_t)n.length, b->swing[t]) - warp(start, b->swing[t]));
    if (!dur) dur = 1;
    unsigned found = SONG_SOUNDING_MAX;
    for (unsigned i = 0; i < sounding_count[t]; ++i) if (sounding[t][i].pitch == n.pitch) found = i;
    if (found != SONG_SOUNDING_MAX) {
        if (!n.retrigger) { sounding[t][found].remaining = at + dur; return; } /* legato */
        note_off(t, found);
    }
    if (sounding_count[t] == SONG_SOUNDING_MAX) note_off(t, 0); /* steal the oldest slot */
    sounding[t][sounding_count[t]].pitch = n.pitch;
    sounding[t][sounding_count[t]++].remaining = at + dur;
    groove_midi_song_note(t, n.pitch, n.velocity);
}
static FM1_AUDIO_CODE void add_action(unsigned at, unsigned kind, unsigned phase, unsigned buf, unsigned t, unsigned step, unsigned index, unsigned pitch)
{
    if (action_count == ACTIONS) return;   /* cannot happen within the window bound; a note would then wait one block */
    struct action a = { (uint16_t)at, (uint8_t)kind, (uint8_t)phase, (uint8_t)buf, (uint8_t)t, (uint8_t)step, (uint8_t)index, (uint8_t)pitch };
    /* Insertion sort: by time, note-offs before note-ons, then arrival order. */
    unsigned i = action_count++;
    while (i > 0 && (actions[i - 1].at > a.at || (actions[i - 1].at == a.at && actions[i - 1].kind > a.kind))) { actions[i] = actions[i - 1]; --i; }
    actions[i] = a;
}
/* Note-ons of frame `buf` whose due time (warped, frame units) falls in [from, to), as
 * actions at `base` + (due - from); `phase` 1 for the frame after the boundary, `which`
 * the pass the probability rolls belong to. mode 0: every step that can reach the range,
 * except step-0 notes with a negative offset; mode 1: only those (the look-ahead), whose
 * due times are negative. Returns the number of notes added. */
static FM1_AUDIO_CODE unsigned scan(unsigned buf, int32_t from, int32_t to, int32_t base, unsigned phase, unsigned mode, unsigned which)
{
    struct rowbuf *b = &buffers[buf];
    unsigned lo = 0, hi = 0, added = 0;
    if (from >= to) return 0;
    if (!mode) {   /* warp(t) lies within [t, t + 240] */
        lo = from >= UNITS ? (unsigned)(from - UNITS) / UNITS : 0; hi = (unsigned)(to + HALF) / UNITS;
        if (hi >= b->steps) hi = b->steps - 1U;
    }
    for (unsigned step = lo; step <= hi; ++step)
        for (unsigned t = 0; t < SONG_TRACKS; ++t) {
            const uint8_t *c = b->cell[t][step];
            unsigned count = c[0] & 7U, probability = (c[0] >> 3) & 7U;
            for (unsigned i = 0; i < count; ++i) {
                struct timed_note n;
                timed_note_unpack(c + 1 + NOTE * i, &n);
                if ((n.offset < 0 && step == 0) != (mode != 0)) continue;
                int32_t due = warp((int32_t)step * UNITS + n.offset, b->swing[t]);
                if (due < from || due >= to) continue;
                if (step_skipped(t, step, probability, which)) continue;
                add_action((unsigned)(base + due - from), 1, phase, buf, t, step, i, n.pitch);
                ++added;
            }
        }
    return added;
}
/* ---- audio thread: frames ------------------------------------------------------------ */
/* Where the current frame ends (*bd, units) and which buffer follows it: the queued jump's
 * buffer at the next bar (bar mode) or at the row end (row mode) once it is decoded, else
 * the same buffer for another repeat (or a loop-here row waiting for a jump), else the
 * decoded next row; SONG_NONE when nothing is known yet (song end, or not decoded). */
static FM1_AUDIO_CODE unsigned next_frame(unsigned *bd)
{
    const struct rowbuf *b = &buffers[cur], *n = &buffers[cur ^ 1U];
    unsigned target = jump_row, other = cur ^ 1U, row_end = b->steps * UNITS;
    unsigned landing = target != SONG_NONE && n->ready && n->row == target;
    if (landing && !jump_mode) { unsigned bar = (pos / BAR + 1U) * BAR; *bd = bar < row_end ? bar : row_end; return other; }
    *bd = row_end;
    if (landing) return other;
    if (repeat + 1U < b->repeat || (b->loop_here && (target == SONG_NONE || !n->ready))) return cur;
    if (n->ready) return other;
    return SONG_NONE;
}
/* ---- row events (9.11) ------------------------------------------------------------- */
static FM1_AUDIO_CODE void stream_begin(unsigned buf)
{
    stream.buf = (uint8_t)buf; stream.next = 0; stream.wait = 0;
    stream.active = buffers[buf].event_count != 0;
    streamed[buf] = 1;
}
/* One tick of the stream: send events until a gap (then wait its blocks) or the end. */
static FM1_AUDIO_CODE void stream_run(void)
{
    if (!stream.active) return;
    if (stream.wait) { --stream.wait; return; }
    const struct rowbuf *b = &buffers[stream.buf];
    while (stream.next < b->event_count) {
        const uint8_t *e = b->event[stream.next++];
        unsigned ch = e[0] & 15U, type = e[0] >> 4;
        if (type == SONG_EVENT_GAP) { stream.wait = e[1]; if (stream.wait) return; continue; }
        if (type == SONG_EVENT_BANK_PC) {
            if (e[1] != 0xff) groove_midi_song_event(ch, 0xb0, 0, e[1]);
            if (e[2] != 0xff) groove_midi_song_event(ch, 0xb0, 32, e[2]);
            groove_midi_song_event(ch, 0xc0, e[3], 0);
        } else if (type == SONG_EVENT_CC) groove_midi_song_event(ch, 0xb0, e[1], e[2]);
        else groove_midi_song_event(ch, 0xc0, e[1], 0);
    }
    stream.active = 0;
}
/* Pre-fire (9.11): start the next row's stream early enough for its last message to leave
 * in the block that contains the boundary (next_frame's landing rules). A stream begun
 * now sends its last message lead + 1 ticks later; the row's first note fires in the
 * block containing the boundary, `blocks` ticks away, so it starts when blocks = lead + 1. */
static FM1_AUDIO_CODE void prefire(unsigned tempo, unsigned bd, unsigned next)
{
    unsigned idx = cur ^ 1U;
    const struct rowbuf *n = &buffers[idx];
    if (!n->ready) { armed[idx] = 0; return; }
    if (!armed[idx] || armed_row[idx] != n->row) { armed[idx] = 1; armed_row[idx] = n->row; streamed[idx] = 0; }
    if (next != idx || streamed[idx] || stream.active || !n->event_count || !n->lead) return;
    unsigned blocks = (bd - pos) * ADV_DIV / (tempo * ADV_MUL);
    if (blocks <= n->lead + 1U) stream_begin(idx);
}
/* Entry into frame `buf` at the boundary (`at` units into the window): a new pass; step-0
 * notes with a negative offset the look-ahead did not reach fire now and count as late. */
static FM1_AUDIO_CODE void enter_frame(unsigned buf, unsigned at)
{
    struct rowbuf *b = &buffers[buf];
    int covered = b->look_from != LOOK_NONE && b->look_row == b->row, late = 0;
    ++pass;
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        const uint8_t *c = b->cell[t][0];
        unsigned count = c[0] & 7U, probability = (c[0] >> 3) & 7U;
        for (unsigned i = 0; i < count; ++i) {
            struct timed_note n;
            timed_note_unpack(c + 1 + NOTE * i, &n);
            if (n.offset >= 0 || (covered && warp(n.offset, b->swing[t]) >= b->look_from)) continue;   /* fired ahead */
            late = 1;
            if (!step_skipped(t, 0, probability, pass)) note_on(buf, t, 0, i, at);
        }
    }
    if (late) ++late_count;
    b->look_from = LOOK_NONE;
    buffers[buf ^ 1U].look_from = LOOK_NONE;
}
static FM1_AUDIO_CODE void stop_now(void)
{
    release_all();
    playing = 0; stream.active = 0; pos = 0;
    groove_midi_transport(0, 0xfc);
}
/* The boundary: a repeat of the same buffer, a replay after an underrun, the song end,
 * or a row entry (buffer swap, events streamed before the row's first notes). */
static FM1_AUDIO_CODE int switch_frame(unsigned next, unsigned at)
{
    if (next == SONG_NONE) {
        if (song_end) { stop_now(); return 0; }
        ++underruns; repeat = 0; next = cur;   /* replay: the next row was not decoded in time */
    } else if (next == cur) ++repeat;
    else {
        buffers[cur].ready = 0;
        barrier();
        cur = next; repeat = 0;
        if (jump_row == buffers[cur].row) jump_row = SONG_NONE;
        /* Row events: the entered row's stream, started early by prefire() or started now.
         * A row entered with its gaps unsent (no lead was available) counts as late. */
        if (!armed[cur] || armed_row[cur] != buffers[cur].row) { armed[cur] = 1; armed_row[cur] = buffers[cur].row; streamed[cur] = 0; }
        if (stream.active && stream.buf != cur) stream.active = 0;   /* the left row's tail is abandoned */
        if (!streamed[cur]) stream_begin(cur);
        stream_run();                      /* the boundary tick's sends, before this tick's notes */
        if (stream.active) ++late_count;   /* events still pending after the boundary: late */
    }
    enter_frame(cur, at);
    return 1;
}
/* One block: the window [p0, p1) of the song position, its actions in time order, the
 * look-ahead into the next frame and the boundary when the window crosses it. */
static FM1_AUDIO_CODE void tick(unsigned tempo)
{
    acc += tempo * ADV_MUL;
    unsigned adv = acc / ADV_DIV; acc %= ADV_DIV;
    unsigned p0 = pos, p1 = pos + adv, bd;
    unsigned next = next_frame(&bd);
    prefire(tempo, bd, next);
    unsigned crossing = p1 > bd, end = crossing ? bd : p1;
    action_count = 0;
    for (unsigned t = 0; t < SONG_TRACKS; ++t)
        for (unsigned i = 0; i < sounding_count[t]; ++i)
            if (sounding[t][i].remaining < adv) add_action(sounding[t][i].remaining, 0, 0, 0, t, 0, 0, sounding[t][i].pitch);
    scan(cur, (int32_t)p0, (int32_t)end, 0, 0, 0, pass);
    /* Look-ahead: step-0 notes of the next frame whose negative offset lands in this window. */
    if (next != SONG_NONE && p1 + HALF > bd) {
        struct rowbuf *nb = &buffers[next];
        int32_t from_d = (int32_t)p0 - (int32_t)bd, to_d = (int32_t)end - (int32_t)bd;
        if (from_d < -HALF) from_d = -HALF;
        if (nb->look_from == LOOK_NONE || nb->look_row != nb->row) { nb->look_from = (int16_t)from_d; nb->look_row = nb->row; }
        scan(next, from_d, to_d, (int32_t)bd + from_d - (int32_t)p0, 0, 1, pass + 1U);
    }
    if (crossing && next != SONG_NONE) scan(next, 0, (int32_t)(p1 - bd), (int32_t)(bd - p0), 1, 0, pass + 1U);
    unsigned switched = 0;
    for (unsigned k = 0; k < action_count; ++k) {
        const struct action *a = &actions[k];
        if (crossing && !switched && a->phase) { switched = 1; if (!switch_frame(next, bd - p0)) return; }
        if (a->kind) note_on(a->buf, a->track, a->step, a->index, a->at);
        else {
            for (unsigned i = 0; i < sounding_count[a->track]; ++i)
                if (sounding[a->track][i].pitch == a->pitch && sounding[a->track][i].remaining == a->at) { note_off(a->track, i); break; }
        }
    }
    if (crossing && !switched && !switch_frame(next, bd - p0)) return;
    /* Notes started in this window that also end in it, then the window moves on. */
    for (unsigned t = 0; t < SONG_TRACKS; ++t)
        for (unsigned i = 0; i < sounding_count[t];) {
            if (sounding[t][i].remaining < adv) note_off(t, i);
            else { sounding[t][i].remaining -= adv; ++i; }
        }
    pos = crossing ? p1 - bd : p1;
}
FM1_AUDIO_CODE unsigned song_tempo(void) { return playing ? tempo_override : 0; }
#if defined(FM1_HOST_TEST) || defined(FM1_OPEN_WEB)
/* Simulator and host tests only: the song position in units within the current frame and
 * the advance remainder, for the timing checks (never built into the device image). */
unsigned song_test_position(unsigned *remainder) { if (remainder) *remainder = acc; return pos; }
#endif
FM1_AUDIO_CODE void song_tick(unsigned tempo)
{
    if (start_request) {
        start_request = 0;
        /* The caller read song_tempo() before `playing` was set: the first block must
         * already advance at the song's own tempo (an exact-clock requirement, 9.12). */
        if (tempo_override) tempo = tempo_override;
        memset(sounding_count, 0, sizeof sounding_count);
        pos = 0; acc = 0; repeat = 0;
        playing = 1;
        groove_midi_transport(0, 0xfa);
        /* Row 0's events go out before its first notes; no lead exists at PLAY (SEND
         * SETUP is the way to send them early), so this is not counted as late. Its
         * step-0 notes with a negative offset play at the start and are (9.12). */
        stream.active = 0; armed[0] = armed[1] = 0;
        armed[0] = 1; armed_row[0] = buffers[0].row; stream_begin(0); stream_run();
        buffers[0].look_from = buffers[1].look_from = LOOK_NONE;
        memset(roll_step, 255, sizeof roll_step);
        enter_frame(0, 0);
        tick(tempo);
        return;
    }
    if (!playing) {
        /* SEND SETUP (9.11): row 0 was decoded into buffer 0 by the control task. */
        if (setup_request) { setup_request = 0; armed[0] = 1; armed_row[0] = buffers[0].row; stream_begin(0); }
        stream_run();
        return;
    }
    if (stop_request) { stop_request = 0; stop_now(); return; }
    stream_run();
    tick(tempo);
}
/* ---- control task ------------------------------------------------------------------ */
void song_init(void)
{
    memset(buffers, 0, sizeof buffers);
    loaded = SONG_NONE; state = 0; last_error = 0;
    start_request = stop_request = playing = cur = pos = repeat = underruns = 0;
    jump_row = SONG_NONE; jump_mode = song_end = swing_project = swing_song = tempo_override = 0;
    acc = 0;
    memset(sounding_count, 0, sizeof sounding_count);
    memset(&stream, 0, sizeof stream); memset(armed, 0, sizeof armed); memset(streamed, 0, sizeof streamed);
    late_count = setup_request = 0;
}
static unsigned natural_next(unsigned row)
{
    if (record.row[row].flags & SONG_ROW_FLAG_LOOP_HERE) return SONG_NONE;
    if (row + 1U < record.rows) return row + 1U;
    return (record.flags & SONG_FLAG_LOOP) ? record.loop_row : SONG_NONE;
}
/* Decode one row into a buffer that the audio thread is not reading (ready == 0). A v1
 * block is upgraded to timed notes on the way (9.12) and keeps the project swing. */
static void decode_row(struct rowbuf *b, unsigned row)
{
    const struct song_row *r = &record.row[row];
    b->row = (uint8_t)row; b->steps = r->steps ? r->steps : SONG_BLOCK_STEPS;
    b->repeat = r->repeat; b->loop_here = r->flags & SONG_ROW_FLAG_LOOP_HERE;
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        memset(b->cell[t], 0, sizeof b->cell[t]);
        unsigned id = r->block[t], bytes, format = SONG_FORMAT_V2;
        b->swing[t] = (uint8_t)swing_song;
        if (!id) continue;
        int e = song_block_read(loaded, id, payload, &bytes, &format);
        if (!e) e = song_payload_valid(format, payload, bytes);
        if (e) { last_error = (unsigned)e; continue; } /* a missing or bad block plays silent */
        if (format == SONG_FORMAT_V1) { bytes = song_payload_upgrade(payload, bytes); b->swing[t] = (uint8_t)swing_project; }
        for (unsigned step = 0, at = 0; step < SONG_BLOCK_STEPS; ++step) {
            unsigned count = payload[at] & 7U;
            memcpy(b->cell[t][step], payload + at, 1 + NOTE * count);
            at += 1 + NOTE * count;
        }
    }
    /* Row events (9.11): this row's slice of the sorted table; gaps become blocks here. */
    b->event_count = 0; b->lead = 0;
    unsigned n = song_event_count(&record);
    for (unsigned i = 0; i < n && b->event_count < SONG_ROW_EVENTS_MAX; ++i) {
        const uint8_t *e = song_event(&record, i);
        if (e[0] < row) continue;
        if (e[0] > row) break;
        uint8_t *d = b->event[b->event_count++];
        d[0] = e[1];
        if ((e[1] >> 4) == SONG_EVENT_GAP) {
            unsigned blocks = (e[2] * FM1_SAMPLE_RATE + 1000U * FM1_BLOCK_FRAMES - 1U) / (1000U * FM1_BLOCK_FRAMES);
            d[1] = (uint8_t)blocks; d[2] = d[3] = 0; b->lead = (uint16_t)(b->lead + blocks);
        } else { d[1] = e[2]; d[2] = e[3]; d[3] = e[4]; }
    }
    barrier();
    b->ready = 1;
}
static void leave_song(void)
{
    /* The audio thread has released every note into the lanes; deliver them on the
     * song channels, then the device channels apply again. */
    groove_midi_poll();
    groove_midi_song_channels(NULL);
    state = 0; jump_row = SONG_NONE;
}
void song_poll(void)
{
    if (!state) return;
    if (!playing) { if (!start_request) leave_song(); return; } /* stopped or ended */
    if (state == 2) return;
    struct rowbuf *b = &buffers[cur], *n = &buffers[cur ^ 1U];
    unsigned target = jump_row, expected = target != SONG_NONE ? target : natural_next(b->row);
    if (n->ready && n->row != expected) n->ready = 0; /* a jump replaced the natural next row */
    if (n->ready) return;
    if (expected == SONG_NONE) { song_end = !b->loop_here; return; }
    song_end = 0;
    decode_row(n, expected);
}
int song_load(unsigned song)
{
    if (state) return SONG_BUSY;
    loaded = SONG_NONE;
    int r = song_record_read(song, &record);
    if (!r) r = song_directory_build(song);
    last_error = r ? (unsigned)r : 0;
    if (r) return r;
    loaded = song;
    jump_mode = (record.flags & SONG_FLAG_JUMP_ROW) ? 1U : 0U;
    return 0;
}
unsigned song_loaded(void) { return loaded; }
const struct song_record *song_current(void) { return loaded == SONG_NONE ? NULL : &record; }
int song_play(void)
{
    if (loaded == SONG_NONE) return SONG_EMPTY;
    if (state || song_storage_state() != SONG_STORAGE_READY) return SONG_BUSY;
    if (groove_clock_mode() != GROOVE_CLOCK_INTERNAL) return SONG_INVALID; /* v1: internal clock only */
    /* Swing (9.12): v1 blocks follow the project setting as on tabby-v02.0; v2 blocks only
     * when the song's flag says so. Both values are read once, at PLAY. */
    swing_project = groove_sequence_setting(0);
    if (swing_project > 50) swing_project = 50;
    swing_song = (record.flags & SONG_FLAG_SWING) ? swing_project : 0;
    tempo_override = record.tempo;
    buffers[0].ready = buffers[1].ready = 0;
    cur = 0; jump_row = SONG_NONE; underruns = 0; late_count = 0; setup_request = 0;
    decode_row(&buffers[0], 0);
    unsigned next = natural_next(0);
    song_end = next == SONG_NONE && !buffers[0].loop_here;
    if (next != SONG_NONE) decode_row(&buffers[1], next);
    groove_midi_poll();
    groove_midi_song_channels(record.channel);
    state = 1;
    barrier();
    start_request = 1;
    return 0;
}
void song_stop(void)
{
    if (state != 1) return;
    state = 2;
    stop_request = 1;
}
int song_queue_jump(unsigned row)
{
    if (state != 1 || row >= record.rows) return SONG_INVALID;
    jump_row = row;
    return 0;
}
void song_jump_mode_set(unsigned mode) { jump_mode = mode ? 1U : 0U; }
unsigned song_playing(void) { return state != 0; }
/* SEND SETUP (9.11): while stopped, decode row 0 into buffer 0 (the audio thread reads
 * no buffer while stopped) and let the tick stream it, gaps included. */
int song_send_setup(void)
{
    if (loaded == SONG_NONE) return SONG_EMPTY;
    if (state || playing || setup_request) return SONG_BUSY;
    buffers[0].ready = 0;
    barrier();
    decode_row(&buffers[0], 0);
    setup_request = 1;
    return 0;
}
void song_status_read(struct song_status *out)
{
    memset(out, 0, sizeof *out);
    out->song = (uint8_t)loaded;
    out->playing = (uint8_t)state;
    out->row = buffers[cur].row; out->repeat = (uint8_t)repeat; out->step = (uint8_t)(pos / UNITS);
    out->next_row = buffers[cur ^ 1U].ready ? buffers[cur ^ 1U].row : SONG_NONE;
    out->queued = (uint8_t)jump_row;
    out->jump_mode = (uint8_t)jump_mode;
    out->error = (uint8_t)last_error;
    out->underruns = (uint16_t)underruns;
    out->late = (uint16_t)late_count;
    out->events = (uint16_t)(loaded == SONG_NONE ? 0 : song_event_count(&record));
}
