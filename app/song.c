/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/song.c — Classic Tabby song sequencer (Task 03 checkpoint d, Task 04, Task 05, Task 06)
 *
 * Purpose
 *   Row playback for song mode with, since Task 06, one playhead per track. The master
 *   clock is one position in units (1/480 of a 16th step) since PLAY, advanced per
 *   128-frame block by tempo × 1024 / 11025 with a carried remainder (acc), so there is no
 *   drift; bars are 16 steps of it. Every track has a frame: the start (master time) and
 *   the length of the pattern it plays, and the buffer that holds the pattern's decoded
 *   block (8 tracks × 2 buffers × 64 steps × 25 bytes: a step header and up to four timed
 *   notes in their 6-byte wire form, section 9.12). Patterns are the song's rows: pattern N
 *   of track T is T's block in row N, with row N's step length as the loop length (9.13).
 *
 *   Track states (9.13). ATTACHED: the track follows the song playhead (the row sequence
 *   with its repeats, loop-here rows, queued scene jumps and the song end, as before Task
 *   06; the song playhead is rowset[cur]); LAUNCHED: the track loops a pattern of its own;
 *   STOPPED: silent. The control task queues, per track, a launch, a stop or "back to
 *   song" (queue_kind / queue_row); the audio tick lands the queue on the next bar: the
 *   track's sounding notes are released at the bar, the new frame starts at the bar. A
 *   scene jump (jump_row) overrides every per-track queue; when it lands every track is
 *   attached again. Launching or stopping tracks never touches the master clock, the bar
 *   count, MIDI clock or the transport: the song stops on PLAY (song_stop) or, with no
 *   track detached, when its last row ends; when the last row ends while tracks are
 *   detached the attached tracks fall silent (song_over) and the transport runs on.
 *
 *   Buffers and decode-ahead. The control task (song_poll) decodes, for each track, the
 *   block it will need next into the track's free buffer: the next row for an attached
 *   track, the queued pattern for a launch, the current row for "back to song"; the row's
 *   events (9.11) are decoded with it: the whole list into rowset[] for the song playhead's
 *   row entries, the track's channel slice into the track buffer for launches. The audio
 *   thread never waits on flash: a frame whose buffer is not ready when it starts is
 *   entered as soon as the buffer is (positioned as if it had started on time, the notes
 *   already passed skipped) and counts in `late`.
 *
 *   Time inside a frame (Task 05). A note's due time is warp(step × 480 + offset) where
 *   warp() applies the swing of the note's block (a v1 block the project swing, a v2 block
 *   the song flag); its note-off is warp(start + length) later. Warp is the identity at
 *   every pair of steps, so bars and row ends are the same instants for every track
 *   whatever their swing. Each tick builds one action list for the window [m0, m1) of the
 *   master clock: note-offs due from the per-track sounding tables, note-ons of every
 *   track's current frame, the frame switches (song row entry, pattern loop, queue landing)
 *   as actions at their time, and the note-ons of the frames entered inside the window;
 *   sorted by time (note-offs, then switches, then note-ons at equal times) and played in
 *   that order into router lane 0, which drains in FIFO order. Step-0 notes with a negative
 *   offset belong to the frame that follows: while the window approaches a boundary whose
 *   next frame is known they are fired ahead of it (look-ahead); when the next frame became
 *   known too late they fire at the boundary and the entry counts in `late`.
 *
 *   Notes go through app/midi_router.c under the song owner (groove_midi_song_note): MIDI
 *   out gets stock timing, the internal engine gets the same notes through the control-task
 *   MIDI-in queue (FM6 preview), and the router's held-note maps release everything on the
 *   right channel when the song's output-channel override starts or ends.
 *
 *   Shared state between the two threads is written on one side only:
 *     control -> audio: start_request, stop_request, jump_row, jump_mode, song_end, swing
 *                       values, tempo override, queue_row then queue_kind, buffer
 *                       contents then buffer.ready
 *     audio -> control: playing, cur, master, song_start, repeat, underruns, late_count,
 *                       tr[].state / row / waiting / cur, queue_kind = NONE once landed,
 *                       buffer.ready = 0 after a swap; the audio-only fields of a buffer
 *   Each buffer is filled by control only while its ready flag is 0 and read by audio only
 *   while it is 1 (a playing buffer keeps ready = 1 until it is swapped out).
 *
 *   Known limits: internal clock only (song mode refuses to start in MIDI clock mode); the
 *   alt-tuning bit of a step is stored but not applied. The look-ahead fires the notes of
 *   the frame it expects; a queue or jump placed after that lands elsewhere and those few
 *   notes play anyway (their note-offs follow as usual). A hand-edited note due at or past
 *   its pattern's end (offset +240 on the last step) fires one unit before the end.
 *
 * Version: 0.4
 *
 * Revision log
 *   v0.4  2026-11-04  Task 06: per-track playheads (master clock, per-track frames and
 *                     buffers, launch / stop / back-to-song queues landing on bars, scene
 *                     jumps re-attaching, song end with detached tracks, late adoption of a
 *                     buffer, per-track event slices and streams), status per track.
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
enum { LOOK_NONE = 0x7fff, ACTIONS = 160 }; /* 8 tracks × 4 notes × 3 steps, note-offs, 9 switches: a window spans at most 28 units */
/* Buffer purpose: decoded for the song playhead (a row the track follows) or for a launch. */
enum { P_SONG = 0, P_LAUNCH = 1 };
enum { Q_NONE = SONG_QUEUE_NONE, Q_LAUNCH = SONG_QUEUE_LAUNCH, Q_STOP = SONG_QUEUE_STOP, Q_ATTACH = SONG_QUEUE_ATTACH };
/* Switch actions (kind 1): what and which track. */
enum { SW_SONG = 0, SW_LOOP = 1, SW_QUEUE = 2 };
/* The song playhead's next frame. */
enum { NEXT_NONE = 0, NEXT_SAME = 1, NEXT_ROW = 2 };

/* One decoded block for one track: the cells, this track's slice of the row's events (its
 * launch stream, 9.13), the row it came from and why it was decoded. */
struct trackbuf {
    uint8_t cell[SONG_BLOCK_STEPS][CELL];
    uint8_t event[SONG_ROW_EVENTS_MAX][4]; /* {channel | type << 4, d0, d1, d2}; a gap's d0 in blocks */
    uint8_t event_count;
    uint16_t lead;                     /* the slice's gaps in blocks */
    uint8_t row, steps, swing, has_block, purpose;
    /* Audio only. look_from: the look-ahead's coverage of this buffer's step 0, as the
     * smallest next-frame due time already scanned (LOOK_NONE: no look-ahead yet; a note
     * due before look_from was not fired and is late at the entry); look_row guards against
     * a buffer decoded anew. */
    int16_t look_from;
    uint8_t look_row;
    volatile uint8_t ready;
};
/* The song playhead's row: step length, repeat, loop flag and the whole event list. */
struct rowinfo {
    uint8_t event[SONG_ROW_EVENTS_MAX][4];
    uint8_t event_count;
    uint16_t lead;
    uint8_t row, steps, repeat, loop_here;
    volatile uint8_t ready;
};
static struct trackbuf tbuf[SONG_TRACKS][2];
static struct rowinfo rowset[2];
static struct song_record record;
static unsigned loaded = SONG_NONE, state, last_error; /* state: 0 stopped, 1 playing, 2 stopping */
static uint8_t payload[SONG_PAYLOAD_MAX];
/* control -> audio */
static volatile unsigned start_request, stop_request, jump_row = SONG_NONE, jump_mode, song_end, swing_project, swing_song, tempo_override;
static volatile uint8_t queue_kind[SONG_TRACKS], queue_row[SONG_TRACKS];
/* audio -> control */
static volatile unsigned playing, cur, repeat, underruns, song_over;
static volatile uint32_t master, song_start;
/* audio only */
static uint32_t acc, song_len, rnd = 0x2545f491U;
struct track {
    uint8_t cur, state, pass, waiting, row;   /* waiting: the frame began without its buffer; row: the launched pattern */
    uint32_t start, len;                      /* the current frame, master units */
};
static struct track tr[SONG_TRACKS];
static struct { uint8_t pitch; uint32_t remaining; } sounding[SONG_TRACKS][SONG_SOUNDING_MAX]; /* remaining: units from the next window start */
static uint8_t sounding_count[SONG_TRACKS];
/* Probability (9.3): one roll per track, step and pass, shared by the step's notes. A
 * track's notes are met in time order, so the last roll is the only one that can be asked
 * again (a step's notes spread over several blocks); tr[].pass counts the track's frame
 * entries and the look-ahead rolls for the pass to come. */
static uint8_t roll_step[SONG_TRACKS], roll_pass[SONG_TRACKS], roll_skip[SONG_TRACKS];
/* One tick's actions: `at` is units after the window start; kind 0 = note-off (pitch),
 * 1 = switch (step = what, index = queue kind), 2 = note-on of note `index` on `step` of
 * buffer `buf` of `track`. */
struct action { uint16_t at; uint8_t kind, buf, track, step, index, pitch; };
static struct action actions[ACTIONS];
static unsigned action_count;
/* The tick's plan per track: its next boundary (master units, or 0 = none), what happens
 * there and the buffer of the frame that follows (SONG_NONE = unknown). */
static struct { uint32_t tb; uint8_t what, nb, landing; } plan[SONG_TRACKS];
/* Row event streams (9.11): stream 0 is the song playhead's (the whole row list), stream
 * 1 + t is track t's (its slice, for launches and "back to song"). A stream sends events
 * until a gap, waits the gap's blocks, and ends; the song stream of the next row is
 * pre-fired `lead` blocks before the boundary so its last message leaves in the boundary
 * tick, before the row's first notes. armed/streamed detect a freshly decoded row buffer so
 * that each row entry is streamed exactly once; tstreamed does the same per track queue. */
struct stream { uint8_t active, next, src, idx; uint16_t wait; };  /* src 0: rowset[idx]; 1: tbuf[idx >> 1][idx & 1] */
static struct stream streams[1 + SONG_TRACKS];
static uint8_t armed[2], streamed[2], armed_row[2];
static uint8_t tstreamed[SONG_TRACKS], seen_kind[SONG_TRACKS], seen_row[SONG_TRACKS];
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
static FM1_AUDIO_CODE void release_track(unsigned t)
{
    while (sounding_count[t]) note_off(t, 0);
}
static FM1_AUDIO_CODE void release_all(void)
{
    for (unsigned t = 0; t < SONG_TRACKS; ++t) release_track(t);
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
/* Start note `index` of `step` on track t from buffer `buf`, `at` units after the window start. */
static FM1_AUDIO_CODE void note_on(unsigned buf, unsigned t, unsigned step, unsigned index, unsigned at)
{
    const struct trackbuf *b = &tbuf[t][buf];
    struct timed_note n;
    timed_note_unpack(b->cell[step] + 1 + NOTE * index, &n);
    int32_t start = (int32_t)step * UNITS + n.offset;
    uint32_t dur = (uint32_t)(warp(start + (int32_t)n.length, b->swing) - warp(start, b->swing));
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
static FM1_AUDIO_CODE void add_action(unsigned at, unsigned kind, unsigned buf, unsigned t, unsigned step, unsigned index, unsigned pitch)
{
    if (action_count == ACTIONS) return;   /* cannot happen within the window bound; a note would then wait one block */
    struct action a = { (uint16_t)at, (uint8_t)kind, (uint8_t)buf, (uint8_t)t, (uint8_t)step, (uint8_t)index, (uint8_t)pitch };
    /* Insertion sort: by time, note-offs before switches before note-ons, then arrival order. */
    unsigned i = action_count++;
    while (i > 0 && (actions[i - 1].at > a.at || (actions[i - 1].at == a.at && actions[i - 1].kind > a.kind))) { actions[i] = actions[i - 1]; --i; }
    actions[i] = a;
}
/* Note-ons of track t's buffer `buf` whose due time (warped, frame units) falls in
 * [from, to), as actions at `base` + (due - from); `which` the pass the probability rolls
 * belong to. mode 0: every step that can reach the range, except step-0 notes with a
 * negative offset; mode 1: only those (the look-ahead), whose due times are negative. */
static FM1_AUDIO_CODE unsigned scan(unsigned t, unsigned buf, int32_t from, int32_t to, int32_t base, unsigned mode, unsigned which)
{
    const struct trackbuf *b = &tbuf[t][buf];
    unsigned lo = 0, hi = 0, added = 0;
    int32_t end = (int32_t)b->steps * UNITS;
    if (from >= to || !b->has_block) return 0;
    if (!mode) {   /* warp(t) lies within [t, t + 240] */
        lo = from >= UNITS ? (unsigned)(from - UNITS) / UNITS : 0; hi = (unsigned)(to + HALF) / UNITS;
        if (hi >= b->steps) hi = b->steps - 1U;
    }
    for (unsigned step = lo; step <= hi; ++step) {
        const uint8_t *c = b->cell[step];
        unsigned count = c[0] & 7U, probability = (c[0] >> 3) & 7U;
        for (unsigned i = 0; i < count; ++i) {
            struct timed_note n;
            timed_note_unpack(c + 1 + NOTE * i, &n);
            if ((n.offset < 0 && step == 0) != (mode != 0)) continue;
            int32_t due = warp((int32_t)step * UNITS + n.offset, b->swing);
            if (!mode && due >= end) due = end - 1;   /* a note past its pattern's end (hand-edited +240 on the last step) */
            if (due < from || due >= to) continue;
            if (step_skipped(t, step, probability, which)) continue;
            add_action((unsigned)(base + due - from), 2, buf, t, step, i, n.pitch);
            ++added;
        }
    }
    return added;
}
/* ---- audio thread: frames ------------------------------------------------------------ */
/* The next bar for a queue placed before master time m: the first bar at or after m (a
 * window that ended exactly on a bar did not cross it, so the bar belongs to the window that
 * starts there), except at the song start, which is bar 0 itself: there the next bar is bar 1. */
static FM1_AUDIO_CODE uint32_t next_bar(uint32_t m) { return m ? (m + BAR - 1U) / BAR * BAR : BAR; }
/* Does buffer `b` hold what track t should play: row `row`, decoded for `purpose`? */
static FM1_AUDIO_CODE int holds(const struct trackbuf *b, unsigned row, unsigned purpose)
{ return b->ready && b->row == row && b->purpose == purpose; }
/* The row track t should play now and why, or SONG_NONE (silent). */
static FM1_AUDIO_CODE unsigned target(unsigned t, unsigned *purpose)
{
    if (tr[t].state == 1) { *purpose = P_LAUNCH; return tr[t].row; }
    if (tr[t].state == 0 && !song_over) { *purpose = P_SONG; return rowset[cur].row; }
    return SONG_NONE;
}
/* Entry into a frame of track t from buffer `buf` at `at` units into the window: a new
 * pass; with check_late, step-0 notes with a negative offset the look-ahead did not reach
 * fire now and count as late. */
static FM1_AUDIO_CODE void enter_frame(unsigned t, unsigned buf, unsigned at, unsigned check_late)
{
    struct trackbuf *b = &tbuf[t][buf];
    struct track *k = &tr[t];
    int covered = b->look_from != LOOK_NONE && b->look_row == b->row, late = 0;
    ++k->pass;
    if (check_late && b->has_block) {
        const uint8_t *c = b->cell[0];
        unsigned count = c[0] & 7U, probability = (c[0] >> 3) & 7U;
        for (unsigned i = 0; i < count; ++i) {
            struct timed_note n;
            timed_note_unpack(c + 1 + NOTE * i, &n);
            if (n.offset >= 0 || (covered && warp(n.offset, b->swing) >= b->look_from)) continue;   /* fired ahead */
            late = 1;
            if (!step_skipped(t, 0, probability, k->pass)) note_on(buf, t, 0, i, at);
        }
    }
    if (late) ++late_count;
    b->look_from = LOOK_NONE;
    tbuf[t][buf ^ 1U].look_from = LOOK_NONE;
}
/* Take buffer `nb` (the plan's next buffer) for track t's new frame, or wait for it. */
static FM1_AUDIO_CODE void adopt(unsigned t, unsigned nb, unsigned at, unsigned check_late)
{
    struct track *k = &tr[t];
    if (nb == SONG_NONE) { k->waiting = 1; return; }
    if (nb != k->cur) { tbuf[t][k->cur].ready = 0; barrier(); k->cur = (uint8_t)nb; }
    k->waiting = 0;
    enter_frame(t, nb, at, check_late);
}
/* Where the song playhead's frame ends (*bd, master units) and what follows: the queued
 * jump's row at the next bar (bar mode) or at the row end (row mode) once it is decoded,
 * the same row for another repeat (or a loop-here row waiting for a jump), the decoded next
 * row, or nothing yet (song end, or not decoded). After the song ended with tracks detached
 * (song_over) only a jump makes a boundary, at the next bar. */
static FM1_AUDIO_CODE unsigned song_next(uint32_t m0, uint32_t *bd)
{
    const struct rowinfo *b = &rowset[cur], *n = &rowset[cur ^ 1U];
    unsigned target_row = jump_row, landing = target_row != SONG_NONE && n->ready && n->row == target_row;
    uint32_t row_end = song_start + song_len, bar = next_bar(m0);
    if (song_over) { *bd = bar; return landing ? NEXT_ROW : NEXT_NONE; }
    if (landing && !jump_mode) { *bd = bar < row_end ? bar : row_end; return NEXT_ROW; }
    *bd = row_end;
    if (landing) return NEXT_ROW;
    if (repeat + 1U < b->repeat || (b->loop_here && (target_row == SONG_NONE || !n->ready))) return NEXT_SAME;
    if (n->ready) return NEXT_ROW;
    return NEXT_NONE;
}
/* ---- row events (9.11, 9.13) ------------------------------------------------------- */
static FM1_AUDIO_CODE void stream_begin(unsigned s, unsigned src, unsigned idx)
{
    struct stream *st = &streams[s];
    unsigned count = src ? tbuf[idx >> 1][idx & 1U].event_count : rowset[idx].event_count;
    st->src = (uint8_t)src; st->idx = (uint8_t)idx; st->next = 0; st->wait = 0;
    st->active = count != 0;
}
/* One tick of a stream: send events until a gap (then wait its blocks) or the end. */
static FM1_AUDIO_CODE void stream_run_one(struct stream *st)
{
    if (!st->active) return;
    if (st->wait) { --st->wait; return; }
    const uint8_t (*ev)[4] = st->src ? tbuf[st->idx >> 1][st->idx & 1U].event : rowset[st->idx].event;
    unsigned count = st->src ? tbuf[st->idx >> 1][st->idx & 1U].event_count : rowset[st->idx].event_count;
    while (st->next < count) {
        const uint8_t *e = ev[st->next++];
        unsigned ch = e[0] & 15U, type = e[0] >> 4;
        if (type == SONG_EVENT_GAP) { st->wait = e[1]; if (st->wait) return; continue; }
        if (type == SONG_EVENT_BANK_PC) {
            if (e[1] != 0xff) groove_midi_song_event(ch, 0xb0, 0, e[1]);
            if (e[2] != 0xff) groove_midi_song_event(ch, 0xb0, 32, e[2]);
            groove_midi_song_event(ch, 0xc0, e[3], 0);
        } else if (type == SONG_EVENT_CC) groove_midi_song_event(ch, 0xb0, e[1], e[2]);
        else groove_midi_song_event(ch, 0xc0, e[1], 0);
    }
    st->active = 0;
}
static FM1_AUDIO_CODE void stream_run(void)
{
    for (unsigned s = 0; s <= SONG_TRACKS; ++s) stream_run_one(&streams[s]);
}
/* Blocks from master time m0 to the boundary bd at this tempo. */
static FM1_AUDIO_CODE unsigned blocks_to(uint32_t m0, uint32_t bd, unsigned tempo)
{ return bd > m0 ? (unsigned)((bd - m0) * ADV_DIV / (tempo * ADV_MUL)) : 0; }
/* Pre-fire (9.11): start the song's next-row stream early enough for its last message to
 * leave in the block that contains the boundary. A stream begun now sends its last message
 * lead + 1 ticks later; the row's first note fires in the block containing the boundary,
 * `blocks` ticks away, so it starts when blocks = lead + 1. */
static FM1_AUDIO_CODE void prefire(unsigned tempo, uint32_t m0, uint32_t bd, unsigned next)
{
    unsigned idx = cur ^ 1U;
    const struct rowinfo *n = &rowset[idx];
    if (!n->ready) { armed[idx] = 0; return; }
    if (!armed[idx] || armed_row[idx] != n->row) { armed[idx] = 1; armed_row[idx] = n->row; streamed[idx] = 0; }
    if (next != NEXT_ROW || streamed[idx] || streams[0].active || !n->event_count || !n->lead) return;
    if (blocks_to(m0, bd, tempo) <= n->lead + 1U) { stream_begin(0, 0, idx); streamed[idx] = 1; }
}
/* The same for a track's queued launch / back-to-song stream (its slice of the row), from
 * the tick that is lead + 1 blocks before the bar it lands on. */
static FM1_AUDIO_CODE void prefire_track(unsigned t, unsigned tempo, uint32_t m0, uint32_t bar)
{
    unsigned nb = plan[t].nb;
    if (plan[t].what != SW_QUEUE || nb == SONG_NONE || tstreamed[t] || streams[1 + t].active) return;
    const struct trackbuf *b = &tbuf[t][nb];
    if (!b->event_count || !b->lead) return;
    if (blocks_to(m0, bar, tempo) <= b->lead + 1U) { stream_begin(1 + t, 1, t * 2U + nb); tstreamed[t] = 1; }
}
static FM1_AUDIO_CODE void stop_now(void)
{
    release_all();
    playing = 0; master = 0; song_over = 0;
    for (unsigned s = 0; s <= SONG_TRACKS; ++s) streams[s].active = 0;
    groove_midi_transport(0, 0xfc);
}
/* Does any track not follow the song (or is about to leave it)? */
static FM1_AUDIO_CODE int any_detached(void)
{
    for (unsigned t = 0; t < SONG_TRACKS; ++t) if (tr[t].state != 0 || queue_kind[t] != Q_NONE) return 1;
    return 0;
}
/* The song playhead's boundary at `at` units into the window: a repeat of the row, a replay
 * after an underrun, the song end, or a row entry (events streamed before the row's first
 * notes, every attached track takes its next buffer). Tracks whose own queue lands on this
 * boundary are left to their switch action, which follows. Returns 0 when the song stopped. */
static FM1_AUDIO_CODE int song_switch(unsigned next, uint32_t bd, unsigned at)
{
    if (next == NEXT_NONE) {
        if (song_end) {
            if (!any_detached()) { stop_now(); return 0; }
            song_over = 1;   /* attached tracks fall silent, the transport runs on (9.13) */
            return 1;
        }
        ++underruns; repeat = 0; next = NEXT_SAME;   /* replay: the next row was not decoded in time */
    } else if (next == NEXT_SAME) ++repeat;
    unsigned landed = 0;
    if (next == NEXT_ROW) {
        rowset[cur].ready = 0;
        barrier();
        cur ^= 1U; repeat = 0;
        song_len = rowset[cur].steps * UNITS;
        if (jump_row == rowset[cur].row) {
            /* A scene jump landed: every track follows the song again (9.13). */
            jump_row = SONG_NONE; song_over = 0; landed = 1;
            for (unsigned t = 0; t < SONG_TRACKS; ++t) {
                if (tr[t].state != 0) release_track(t);
                tr[t].state = 0; queue_kind[t] = Q_NONE; plan[t].landing = 0;
                streams[1 + t].active = 0;
            }
        }
        /* Row events: the entered row's stream, started early by prefire() or started now.
         * A row entered with its gaps unsent (no lead was available) counts as late. */
        if (!armed[cur] || armed_row[cur] != rowset[cur].row) { armed[cur] = 1; armed_row[cur] = rowset[cur].row; streamed[cur] = 0; }
        if (streams[0].active && streams[0].idx != cur) streams[0].active = 0;   /* the left row's tail is abandoned */
        if (!streamed[cur]) { stream_begin(0, 0, cur); streamed[cur] = 1; }
        stream_run_one(&streams[0]);       /* the boundary tick's sends, before this tick's notes */
        if (streams[0].active) ++late_count;   /* events still pending after the boundary: late */
    }
    song_start = bd;
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        struct track *k = &tr[t];
        if (!landed && (k->state != 0 || plan[t].landing)) continue;
        k->start = bd; k->len = song_len;
        if (next == NEXT_ROW) {
            adopt(t, plan[t].nb, at, 1);
            /* A scene jump into a row with no block for this track stops the track (9.13). */
            if (landed && !k->waiting && !tbuf[t][k->cur].has_block) release_track(t);
        } else enter_frame(t, k->cur, at, 1);
    }
    return 1;
}
/* A track's own boundary: its pattern loops, or a queue lands on the bar. */
static FM1_AUDIO_CODE void track_switch(unsigned t, unsigned what, unsigned at)
{
    struct track *k = &tr[t];
    if (what == SW_LOOP) { k->start += k->len; enter_frame(t, k->cur, at, 1); return; }
    unsigned kind = queue_kind[t];
    release_track(t);
    queue_kind[t] = Q_NONE; seen_kind[t] = Q_NONE;
    if (kind == Q_STOP) { k->state = 2; k->waiting = 0; return; }
    if (kind == Q_LAUNCH) {
        k->state = 1; k->row = queue_row[t];
        k->start = plan[t].tb;
        k->len = (record.row[k->row].steps ? record.row[k->row].steps : SONG_BLOCK_STEPS) * UNITS;
        adopt(t, plan[t].nb, at, 1);
    } else {   /* Q_ATTACH: back to song, into the current row where it stands (no look-ahead) */
        k->state = 0; k->row = 0;
        k->start = song_start; k->len = song_len;
        if (song_over) { k->waiting = 0; return; }
        adopt(t, plan[t].nb, at, 0);
    }
    /* The launch stream (the row's events on this track's channel): pre-fired, or now. */
    if (!tstreamed[t] && !k->waiting) { stream_begin(1 + t, 1, t * 2U + k->cur); tstreamed[t] = 1; }
    stream_run_one(&streams[1 + t]);
    if (streams[1 + t].active) ++late_count;
}
/* One block: the window [m0, m1) of the master clock, every track's frame, the switches
 * inside the window and the look-ahead into the frames that follow. */
static FM1_AUDIO_CODE void tick(unsigned tempo)
{
    acc += tempo * ADV_MUL;
    unsigned adv = acc / ADV_DIV; acc %= ADV_DIV;
    uint32_t m0 = master, m1 = master + adv, bar = next_bar(m0), sbd;
    unsigned snext = song_next(m0, &sbd);
    prefire(tempo, m0, sbd, snext);
    action_count = 0;
    /* Late adoption: a frame that began without its buffer, or a following track whose
     * buffer is not the song's row (a row change on the bar it rejoined the song), takes
     * the right buffer as soon as it is ready, in phase, and counts late. */
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        struct track *k = &tr[t];
        unsigned purpose, row = target(t, &purpose);
        if (row == SONG_NONE) { k->waiting = 0; continue; }
        if (!k->waiting && holds(&tbuf[t][k->cur], row, purpose)) continue;
        unsigned o = k->cur ^ 1U, nb = holds(&tbuf[t][k->cur], row, purpose) ? k->cur : holds(&tbuf[t][o], row, purpose) ? o : SONG_NONE;
        if (nb == SONG_NONE) { k->waiting = 1; continue; }
        if (nb != k->cur) { tbuf[t][k->cur].ready = 0; barrier(); k->cur = (uint8_t)nb; }
        k->waiting = 0; ++k->pass; ++late_count;
        tbuf[t][nb].look_from = LOOK_NONE;
    }
    for (unsigned t = 0; t < SONG_TRACKS; ++t)
        for (unsigned i = 0; i < sounding_count[t]; ++i)
            if (sounding[t][i].remaining < adv) add_action(sounding[t][i].remaining, 0, 0, t, 0, 0, sounding[t][i].pitch);
    unsigned song_crossing = snext != NEXT_NONE && sbd < m1 && sbd >= m0;
    /* A scene jump landing at sbd takes every track, whatever it does now (9.13). */
    unsigned scene = snext == NEXT_ROW && jump_row != SONG_NONE && rowset[cur ^ 1U].row == jump_row;
    if (song_crossing) add_action(sbd - m0, 1, 0, SONG_NONE, SW_SONG, 0, 0);
    else if (snext == NEXT_NONE && sbd < m1 && !song_over) add_action(sbd - m0, 1, 0, SONG_NONE, SW_SONG, 0, 0);   /* end or underrun */
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        struct track *k = &tr[t];
        unsigned qk = queue_kind[t], qr = queue_row[t];
        if (qk != seen_kind[t] || qr != seen_row[t]) { seen_kind[t] = (uint8_t)qk; seen_row[t] = (uint8_t)qr; tstreamed[t] = 0; streams[1 + t].active = 0; }
        unsigned purpose, row = target(t, &purpose);
        unsigned active = row != SONG_NONE && !k->waiting;
        unsigned o = k->cur ^ 1U;
        plan[t].landing = !scene && qk != Q_NONE && bar < m1;
        plan[t].tb = 0; plan[t].what = SW_SONG; plan[t].nb = SONG_NONE;
        if (active) {
            plan[t].tb = k->state == 1 ? k->start + k->len : sbd;
            plan[t].what = k->state == 1 ? SW_LOOP : SW_SONG;
            if (k->state == 0 && snext == NEXT_NONE) plan[t].tb = 0;
        }
        if (scene) { plan[t].tb = sbd; plan[t].what = SW_SONG; qk = Q_NONE; }
        else if (qk != Q_NONE && (!plan[t].tb || bar <= plan[t].tb)) { plan[t].tb = bar; plan[t].what = SW_QUEUE; }
        /* The buffer of the frame that follows the boundary. */
        if (scene) { unsigned nr = rowset[cur ^ 1U].row; plan[t].nb = holds(&tbuf[t][k->cur], nr, P_SONG) ? k->cur : holds(&tbuf[t][o], nr, P_SONG) ? o : SONG_NONE; }
        else if (plan[t].what == SW_LOOP) plan[t].nb = k->cur;
        else if (plan[t].what == SW_QUEUE) {
            if (qk == Q_LAUNCH) plan[t].nb = holds(&tbuf[t][k->cur], qr, P_LAUNCH) ? k->cur : holds(&tbuf[t][o], qr, P_LAUNCH) ? o : SONG_NONE;
            else if (qk == Q_ATTACH && !song_over) {
                /* The row the song is in at the bar: the next row when the song changes rows there. */
                unsigned ar = sbd == bar && snext == NEXT_ROW ? rowset[cur ^ 1U].row : rowset[cur].row;
                plan[t].nb = holds(&tbuf[t][k->cur], ar, P_SONG) ? k->cur : holds(&tbuf[t][o], ar, P_SONG) ? o : SONG_NONE;
            }
        } else if (plan[t].tb && k->state == 0) {
            if (snext == NEXT_SAME) plan[t].nb = k->cur;
            else if (snext == NEXT_ROW) { unsigned nr = rowset[cur ^ 1U].row; plan[t].nb = holds(&tbuf[t][k->cur], nr, P_SONG) ? k->cur : holds(&tbuf[t][o], nr, P_SONG) ? o : SONG_NONE; }
        }
        uint32_t tb = plan[t].tb;
        unsigned crossing = tb && tb < m1;
        if (active) {
            int32_t p0 = (int32_t)(m0 - k->start), end = (int32_t)((crossing ? tb : m1) - k->start);
            scan(t, k->cur, p0, end, 0, 0, k->pass);
        }
        if (crossing && plan[t].what != SW_SONG) add_action(tb - m0, 1, 0, t, plan[t].what, qk, 0);
        if (tb && plan[t].nb != SONG_NONE && !(plan[t].what == SW_QUEUE && qk == Q_STOP)) {
            unsigned nb = plan[t].nb;
            int32_t origin = plan[t].what == SW_QUEUE && qk == Q_ATTACH && !(sbd == bar && snext != NEXT_NONE) ? (int32_t)(bar - song_start) : 0;   /* back to song joins mid-row */
            if (crossing) scan(t, nb, origin, origin + (int32_t)(m1 - tb), (int32_t)(tb - m0), 0, k->pass + 1U);
            /* Look-ahead: step-0 notes of the next frame whose negative offset lands in this window. */
            if (!origin && m1 + HALF > tb) {
                struct trackbuf *n = &tbuf[t][nb];
                int32_t from_d = (int32_t)m0 - (int32_t)tb, to_d = (int32_t)(crossing ? tb : m1) - (int32_t)tb;
                if (from_d < -HALF) from_d = -HALF;
                if (n->look_from == LOOK_NONE || n->look_row != n->row) { n->look_from = (int16_t)from_d; n->look_row = n->row; }
                scan(t, nb, from_d, to_d, (int32_t)tb + from_d - (int32_t)m0, 1, k->pass + 1U);
            }
        }
        if (qk == Q_LAUNCH || qk == Q_ATTACH) prefire_track(t, tempo, m0, bar);
    }
    for (unsigned k = 0; k < action_count; ++k) {
        const struct action *a = &actions[k];
        if (a->kind == 2) note_on(a->buf, a->track, a->step, a->index, a->at);
        else if (a->kind == 1) {
            if (a->track == SONG_NONE) { if (!song_switch(snext, sbd, a->at)) return; }
            else track_switch(a->track, a->step, a->at);
        } else {
            for (unsigned i = 0; i < sounding_count[a->track]; ++i)
                if (sounding[a->track][i].pitch == a->pitch && sounding[a->track][i].remaining == a->at) { note_off(a->track, i); break; }
        }
    }
    /* Notes started in this window that also end in it, then the window moves on. */
    for (unsigned t = 0; t < SONG_TRACKS; ++t)
        for (unsigned i = 0; i < sounding_count[t];) {
            if (sounding[t][i].remaining < adv) note_off(t, i);
            else { sounding[t][i].remaining -= adv; ++i; }
        }
    master = m1;
}
FM1_AUDIO_CODE unsigned song_tempo(void) { return playing ? tempo_override : 0; }
#if defined(FM1_HOST_TEST) || defined(FM1_OPEN_WEB)
/* Simulator and host tests only: the master position in units and the advance remainder,
 * for the timing checks (never built into the device image). */
unsigned song_test_position(unsigned *remainder) { if (remainder) *remainder = acc; return master; }
#endif
FM1_AUDIO_CODE void song_tick(unsigned tempo)
{
    if (start_request) {
        start_request = 0;
        /* The caller read song_tempo() before `playing` was set: the first block must
         * already advance at the song's own tempo (an exact-clock requirement, 9.12). */
        if (tempo_override) tempo = tempo_override;
        memset(sounding_count, 0, sizeof sounding_count);
        master = 0; acc = 0; repeat = 0; song_over = 0; song_start = 0;
        song_len = rowset[0].steps * UNITS;
        playing = 1;
        groove_midi_transport(0, 0xfa);
        /* Row 0's events go out before its first notes; no lead exists at PLAY (SEND
         * SETUP is the way to send them early), so this is not counted as late. Its
         * step-0 notes with a negative offset play at the start and are (9.12). */
        for (unsigned s = 0; s <= SONG_TRACKS; ++s) streams[s].active = 0;
        armed[0] = 1; armed_row[0] = rowset[0].row; armed[1] = 0; streamed[0] = 1; stream_begin(0, 0, 0); stream_run_one(&streams[0]);
        memset(roll_step, 255, sizeof roll_step);
        for (unsigned t = 0; t < SONG_TRACKS; ++t) {
            struct track *k = &tr[t];
            k->cur = 0; k->state = 0; k->pass = 0; k->waiting = 0; k->row = 0; k->start = 0; k->len = song_len;
            tbuf[t][0].look_from = tbuf[t][1].look_from = LOOK_NONE;
            tstreamed[t] = 0; seen_kind[t] = Q_NONE; seen_row[t] = 0;
            enter_frame(t, 0, 0, 1);
        }
        tick(tempo);
        return;
    }
    if (!playing) {
        /* SEND SETUP (9.11): row 0 was decoded into rowset[0] by the control task. */
        if (setup_request) { setup_request = 0; armed[0] = 1; armed_row[0] = rowset[0].row; stream_begin(0, 0, 0); }
        stream_run_one(&streams[0]);
        return;
    }
    if (stop_request) { stop_request = 0; stop_now(); return; }
    stream_run();
    tick(tempo);
}
/* ---- control task ------------------------------------------------------------------ */
void song_init(void)
{
    memset(tbuf, 0, sizeof tbuf); memset(rowset, 0, sizeof rowset); memset(tr, 0, sizeof tr);
    loaded = SONG_NONE; state = 0; last_error = 0;
    start_request = stop_request = playing = cur = repeat = underruns = song_over = 0;
    master = song_start = 0; song_len = 16 * UNITS;
    jump_row = SONG_NONE; jump_mode = song_end = swing_project = swing_song = tempo_override = 0;
    acc = 0;
    memset(sounding_count, 0, sizeof sounding_count);
    memset(streams, 0, sizeof streams); memset(armed, 0, sizeof armed); memset(streamed, 0, sizeof streamed);
    memset((void *)queue_kind, 0, sizeof queue_kind); memset((void *)queue_row, 0, sizeof queue_row);
    memset(tstreamed, 0, sizeof tstreamed); memset(seen_kind, 0, sizeof seen_kind);
    late_count = setup_request = 0;
}
static unsigned natural_next(unsigned row)
{
    if (record.row[row].flags & SONG_ROW_FLAG_LOOP_HERE) return SONG_NONE;
    if (row + 1U < record.rows) return row + 1U;
    return (record.flags & SONG_FLAG_LOOP) ? record.loop_row : SONG_NONE;
}
/* A gap event in blocks, from milliseconds (9.11). */
static unsigned gap_blocks(unsigned ms)
{ return (ms * FM1_SAMPLE_RATE + 1000U * FM1_BLOCK_FRAMES - 1U) / (1000U * FM1_BLOCK_FRAMES); }
/* The row's events (9.11) into `out` in firing order, gaps converted to blocks, lead = the
 * sum of the gaps. With channel < 16 only the events of that channel and the gaps that
 * carry its channel bits (9.13: a track's launch slice); 16 = the whole list. */
static unsigned slice_events(unsigned row, unsigned channel, uint8_t out[][4], uint16_t *lead)
{
    unsigned n = song_event_count(&record), count = 0;
    *lead = 0;
    for (unsigned i = 0; i < n && count < SONG_ROW_EVENTS_MAX; ++i) {
        const uint8_t *e = song_event(&record, i);
        if (e[0] < row) continue;
        if (e[0] > row) break;
        if (channel < 16 && (e[1] & 15U) != channel) continue;
        uint8_t *d = out[count++];
        d[0] = e[1];
        if ((e[1] >> 4) == SONG_EVENT_GAP) { unsigned blocks = gap_blocks(e[2]); d[1] = (uint8_t)blocks; d[2] = d[3] = 0; *lead = (uint16_t)(*lead + blocks); }
        else { d[1] = e[2]; d[2] = e[3]; d[3] = e[4]; }
    }
    return count;
}
/* Decode row `row`'s block of track t into buffer b (ready == 0) for `purpose`. A v1 block
 * is upgraded to timed notes on the way (9.12) and keeps the project swing. A missing or bad
 * block plays silent (has_block = 0). */
static void decode_track(unsigned t, struct trackbuf *b, unsigned row, unsigned purpose)
{
    const struct song_row *r = &record.row[row];
    b->row = (uint8_t)row; b->steps = r->steps ? r->steps : SONG_BLOCK_STEPS; b->purpose = (uint8_t)purpose;
    b->swing = (uint8_t)swing_song; b->has_block = 0;
    memset(b->cell, 0, sizeof b->cell);
    unsigned id = r->block[t], bytes, format = SONG_FORMAT_V2;
    if (id) {
        int e = song_block_read(loaded, id, payload, &bytes, &format);
        if (!e) e = song_payload_valid(format, payload, bytes);
        if (e) last_error = (unsigned)e;
        else {
            if (format == SONG_FORMAT_V1) { bytes = song_payload_upgrade(payload, bytes); b->swing = (uint8_t)swing_project; }
            for (unsigned step = 0, at = 0; step < SONG_BLOCK_STEPS; ++step) {
                unsigned count = payload[at] & 7U;
                memcpy(b->cell[step], payload + at, 1 + NOTE * count);
                at += 1 + NOTE * count;
            }
            b->has_block = 1;
        }
    }
    b->event_count = (uint8_t)slice_events(row, groove_midi_song_track_channel(t), b->event, &b->lead);
    barrier();
    b->ready = 1;
}
static void decode_rowinfo(struct rowinfo *b, unsigned row)
{
    const struct song_row *r = &record.row[row];
    b->row = (uint8_t)row; b->steps = r->steps ? r->steps : SONG_BLOCK_STEPS;
    b->repeat = r->repeat; b->loop_here = r->flags & SONG_ROW_FLAG_LOOP_HERE;
    b->event_count = (uint8_t)slice_events(row, 16, b->event, &b->lead);
    barrier();
    b->ready = 1;
}
/* What track t will need in its free buffer: a row and a purpose, or 0 for nothing. */
static unsigned wanted(unsigned t, unsigned *row, unsigned *purpose)
{
    const struct track *k = &tr[t];
    unsigned qk = queue_kind[t], now = rowset[cur].row;
    if (jump_row != SONG_NONE) { *row = jump_row; *purpose = P_SONG; return 1; }
    if (qk == Q_LAUNCH) { *row = queue_row[t]; *purpose = P_LAUNCH; return 1; }
    if (qk == Q_ATTACH) {
        /* The row the song is in at the next bar: when the current row ends exactly there,
         * the one that follows it (a scene jump's target, or the natural next row). */
        uint32_t m = master, bar = m ? (m + BAR - 1U) / BAR * BAR : BAR;
        if (!song_over && song_start + song_len == bar) {
            unsigned next = jump_row != SONG_NONE ? jump_row : natural_next(now);
            if (next != SONG_NONE) now = next;
        }
        *row = now; *purpose = P_SONG; return !song_over;
    }
    if (k->state == 0) {
        if (song_over) return 0;
        if (k->waiting || !holds(&tbuf[t][k->cur], now, P_SONG)) { *row = now; *purpose = P_SONG; return 1; }   /* catch up with the current row */
        unsigned next = natural_next(now);
        if (next == SONG_NONE) return 0;
        *row = next; *purpose = P_SONG; return 1;
    }
    if (k->state == 1 && k->waiting) { *row = k->row; *purpose = P_LAUNCH; return 1; }
    return 0;
}
static void leave_song(void)
{
    /* The audio thread has released every note into the lanes; deliver them on the
     * song channels, then the device channels apply again. */
    groove_midi_poll();
    groove_midi_song_channels(NULL);
    state = 0; jump_row = SONG_NONE;
    memset((void *)queue_kind, 0, sizeof queue_kind);
}
void song_poll(void)
{
    if (!state) return;
    if (!playing) { if (!start_request) leave_song(); return; } /* stopped or ended */
    if (state == 2) return;
    /* Each track's free buffer: what it will need next (one block read per decode). */
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        unsigned row, purpose;
        if (!wanted(t, &row, &purpose)) continue;
        struct trackbuf *p = &tbuf[t][tr[t].cur], *o = &tbuf[t][tr[t].cur ^ 1U];
        if (holds(p, row, purpose) && purpose == P_LAUNCH) continue;   /* a relaunch of the pattern still in the playing buffer */
        if (holds(o, row, purpose)) continue;
        o->ready = 0;
        barrier();
        decode_track(t, o, row, purpose);
    }
    /* The song playhead's next row, after the tracks that follow it have their blocks. */
    unsigned now = rowset[cur].row, target_row = jump_row, expected = target_row != SONG_NONE ? target_row : natural_next(now);
    struct rowinfo *n = &rowset[cur ^ 1U];
    if (n->ready && n->row != expected) n->ready = 0; /* a jump replaced the natural next row */
    if (n->ready) return;
    if (expected == SONG_NONE) { song_end = !rowset[cur].loop_here; return; }
    song_end = 0;
    decode_rowinfo(n, expected);
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
    rowset[0].ready = rowset[1].ready = 0;
    for (unsigned t = 0; t < SONG_TRACKS; ++t) { tbuf[t][0].ready = tbuf[t][1].ready = 0; tr[t].cur = 0; tr[t].state = 0; tr[t].waiting = 0; }
    cur = 0; jump_row = SONG_NONE; underruns = 0; late_count = 0; setup_request = 0; song_over = 0;
    memset((void *)queue_kind, 0, sizeof queue_kind);
    groove_midi_poll();
    groove_midi_song_channels(record.channel);   /* before the decodes: the event slices use the channels */
    for (unsigned t = 0; t < SONG_TRACKS; ++t) decode_track(t, &tbuf[t][0], 0, P_SONG);
    decode_rowinfo(&rowset[0], 0);
    unsigned next = natural_next(0);
    song_end = next == SONG_NONE && !rowset[0].loop_here;
    if (next != SONG_NONE) {
        for (unsigned t = 0; t < SONG_TRACKS; ++t) decode_track(t, &tbuf[t][1], next, P_SONG);
        decode_rowinfo(&rowset[1], next);
    }
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
    memset((void *)queue_kind, 0, sizeof queue_kind);   /* a scene jump overrides every per-track queue (9.13) */
    jump_row = row;
    return 0;
}
void song_jump_mode_set(unsigned mode) { jump_mode = mode ? 1U : 0U; }
unsigned song_playing(void) { return state != 0; }
/* Track launching (9.13): queue a pattern (row) for one track, a stop, or "back to song";
 * each lands on the next bar. A newer queue on the same track replaces the older one. */
int song_track_launch(unsigned track, unsigned row)
{
    if (state != 1 || track >= SONG_TRACKS || row >= record.rows) return SONG_INVALID;
    if (!record.row[row].block[track]) return SONG_EMPTY;
    queue_row[track] = (uint8_t)row;
    barrier();
    queue_kind[track] = Q_LAUNCH;
    return 0;
}
int song_track_stop(unsigned track)
{
    if (state != 1 || track >= SONG_TRACKS) return SONG_INVALID;
    queue_kind[track] = Q_STOP;
    return 0;
}
int song_track_attach(unsigned track)
{
    if (state != 1 || track >= SONG_TRACKS) return SONG_INVALID;
    if (tr[track].state == 0 && queue_kind[track] == Q_NONE) return 0;   /* already following */
    queue_kind[track] = Q_ATTACH;
    return 0;
}
void song_track_attach_all(void)
{
    for (unsigned t = 0; t < SONG_TRACKS; ++t) (void)song_track_attach(t);
}
/* SEND SETUP (9.11): while stopped, decode row 0's events into rowset[0] (the audio thread
 * reads no buffer while stopped) and let the tick stream it, gaps included. */
int song_send_setup(void)
{
    if (loaded == SONG_NONE) return SONG_EMPTY;
    if (state || playing || setup_request) return SONG_BUSY;
    rowset[0].ready = 0;
    barrier();
    decode_rowinfo(&rowset[0], 0);
    setup_request = 1;
    return 0;
}
void song_status_read(struct song_status *out)
{
    memset(out, 0, sizeof *out);
    uint32_t m = master, s0 = song_start;
    out->song = (uint8_t)loaded;
    out->playing = (uint8_t)state;
    out->row = rowset[cur].row; out->repeat = (uint8_t)repeat;
    out->step = (uint8_t)(song_over || m < s0 ? 0 : ((m - s0) / UNITS) & 255U);
    out->bar = (uint16_t)(m / BAR);
    out->bar_step = (uint8_t)((m % BAR) / UNITS);
    out->next_row = rowset[cur ^ 1U].ready ? rowset[cur ^ 1U].row : SONG_NONE;
    out->queued = (uint8_t)jump_row;
    out->jump_mode = (uint8_t)jump_mode;
    out->song_over = (uint8_t)song_over;
    out->error = (uint8_t)last_error;
    out->underruns = (uint16_t)underruns;
    out->late = (uint16_t)late_count;
    out->events = (uint16_t)(loaded == SONG_NONE ? 0 : song_event_count(&record));
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        const struct track *k = &tr[t];
        unsigned qk = queue_kind[t];
        out->track_state[t] = (uint8_t)(k->state | qk << 2 | (k->waiting ? 16U : 0U));
        out->track_row[t] = (uint8_t)(k->state == 1 ? k->row : k->state == 0 && !song_over && state ? rowset[cur].row : SONG_NONE);
        out->track_queued[t] = (uint8_t)(qk == Q_LAUNCH ? queue_row[t] : qk == Q_ATTACH ? out->row : SONG_NONE);
    }
}
