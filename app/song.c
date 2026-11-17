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
 *   Known limits: (v0.6: with CLOCK = MIDI the song follows the external clock, see the follow
 *   section below; the engine's pattern sequencer does not see the clock then); the alt-tuning bit of a step is stored but not applied. The look-ahead fires the notes of
 *   the frame it expects; a queue or jump placed after that lands elsewhere and those few
 *   notes play anyway (their note-offs follow as usual). A hand-edited note due at or past
 *   its pattern's end (offset +240 on the last step) fires one unit before the end.
 *
 * Version: 0.7
 *
 * Revision log
 *   v0.7  2026-11-12  Task 16 Goal 5 (branch mc707-phase2): block payload format 2 (the v3 clip, docs/CLIP-V3.md) decodes
 *                     into the step grid when it is v2-shaped; anything else is an error for now.
 *   v0.6  2026-11-12  Task 16 Goal 3: external clock follow (SPEC 19.3): with CLOCK = MIDI a song follows the
 *                     incoming MIDI clock, Start, Stop, Continue and Song Position Pointer (song_clock_in), holds
 *                     after 3 missed pulses, relocks inside 2 s, shows LOST after that; the transport is the
 *                     master's. Internal-clock behaviour is unchanged.
 *   v0.5  2026-11-08  Task 12 A1/A3: ct_transport_running() (song or stock transport).
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
#include "clip_v3.h"   /* Task 16 Goal 5: v3 clips through the step grid */
#include "instrument.h"
#include "diag.h"   /* Task 12 A4: ct_midi_flush */
#include <string.h>

enum { NOTE = TIMED_NOTE_BYTES, CELL = 1 + SONG_NOTES_PER_STEP * NOTE };   /* 25: step header + 4 timed notes */
enum { UNITS = TIMED_NOTE_UNITS_PER_STEP, HALF = TIMED_NOTE_OFFSET_MAX, PAIR = 2 * UNITS, BAR = 16 * UNITS };
enum { ADV_MUL = 1024, ADV_DIV = 11025 };  /* units per block = tempo × 4 × 480 × 128 / (44100 × 60) = tempo × 1024 / 11025 */
enum { LOOK_NONE = 0x7fff, ACTIONS = 160 }; /* 8 tracks × 4 notes × 3 steps, note-offs, 9 switches: a window spans at most 28 units */
/* Buffer purpose: decoded for the song playhead (a row the track follows) or for a launch. */
enum { P_SONG = 0, P_LAUNCH = 1 };
enum { Q_NONE = SONG_QUEUE_NONE, Q_LAUNCH = SONG_QUEUE_LAUNCH, Q_STOP = SONG_QUEUE_STOP, Q_ATTACH = SONG_QUEUE_ATTACH };
/* Switch actions (kind 1): what and which track. */
enum { SW_SONG = 0, SW_LOOP = 1, SW_QUEUE = 2, SW_CHAIN = 3 };   /* SW_CHAIN (tabby-v04.10): a launched clip's chain is due */
/* The song playhead's next frame. */
enum { NEXT_NONE = 0, NEXT_SAME = 1, NEXT_ROW = 2 };

/* One decoded block for one track: the cells, this track's slice of the row's events (its
 * launch stream, 9.13), the row it came from and why it was decoded. */
struct trackbuf {
    /* The step grid, or (v3 set) the clip's event list: one storage, the larger of the two (measured on the device
     * build: the 16 buffers with both cost 54 KB of the runtime heap, with the union 28 KB; BUILD 37.1). */
    union {
    uint8_t cell[SONG_BLOCK_STEPS][CELL];
    uint8_t clip[SONG_PAYLOAD_V3_MAX];
    };
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
    /* The scheduler cursor (branch clipv3-cursor): a v3 clip the step grid cannot hold is kept as its event
     * list and played from it (scan_v3). v3: this buffer plays from `clip`; prob: per anchor step, the step
     * modifier's probability | tuning << 3 (0: none). */
    uint8_t v3;
    uint8_t prob[CLIP_V3_STEPS_MAX];
    uint16_t block;                    /* the block id (the clip header's program and bank are sent once per clip) */
    /* tabby-v04.10: `steps` above is the clip's own length (a v3 clip's header; a v2 block: the steps of the first
     * scene that uses it, 64 when none does). The clip chain (docs/CLIP-V3.md 2.1), read from a v3 clip's header:
     * chain_next 0 = none, 1 = stop the track, 2 = go to row chain_row (the next clip's launch row). */
    uint8_t chain_next, chain_times, chain_row;
    uint16_t chain_after;
    uint32_t prog;                     /* tabby-v04.13: a v3 clip's header program and bank (flags | program << 8 | msb << 16 | lsb << 24): sent again when an edit changes them */
    volatile uint8_t fresh;            /* Goal 6: decoded again after an edit of the clip this track loops: the loop takes it at its next pass */
};
#if defined(FM1_HOST_TEST) || defined(FM1_OPEN_WEB)
static unsigned force_cursor;   /* tests: every v3 clip plays from its event list, also one the grid could hold */
void song_test_cursor(unsigned on) { force_cursor = on != 0; }
#else
enum { force_cursor = 0 };
#endif
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
static struct song_model model;                    /* Task 17 Goal 3: the loaded song's clip table, scenes and master cycle */
static volatile uint32_t cycle_units = 16 * TIMED_NOTE_UNITS_PER_STEP;   /* the master cycle: launches, stops and scene recalls land on its multiples */
static unsigned loaded = SONG_NONE, state, last_error; /* state: 0 stopped, 1 playing, 2 stopping */
static uint8_t payload[SONG_PAYLOAD_MAX];
/* control -> audio */
static volatile unsigned start_request, stop_request, jump_row = SONG_NONE, jump_mode, song_end, swing_project, swing_song, tempo_override;
static volatile uint8_t queue_kind[SONG_TRACKS], queue_row[SONG_TRACKS];
/* Task 17 Goal 4: a clip no scene uses is launched as row SONG_ROWS + place (a "place row": no row record, no row
 * events); place_steps is its length, read from the clip when it is queued. mute_mask: tracks whose notes stay in. */
static volatile uint8_t place_steps[SONG_TRACKS];
/* Clips reserved while the song is stopped (the MC-707's "reserve playback", Reference Manual p. 12): reserve_row is
 * the control task's (the row to start launched, SONG_NONE: the track follows the scenes); song_play hands it to the
 * audio thread as start_row and clears it. Internal clock only: a song that follows a MIDI clock starts on its scenes. */
static uint8_t reserve_row[SONG_TRACKS] = {SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE};
static volatile uint8_t start_row[SONG_TRACKS], start_steps[SONG_TRACKS];
/* ---- Goal 6 (tabby-v04.8): the clip being edited. One clip at a time lives here as a v3 payload; the decoder takes it
 * instead of the stored block while it is unsaved, so edits are heard without a flash write (flash is written only
 * while the transport is stopped, SPEC 15.4). Four undo levels (SPEC 14.1 decision 8): `slot` holds the undo states
 * (slot[0..undo), oldest first) and above them the redo states (slot[undo..undo + redo), the next redo first).
 * Control task only, except edit_refresh (control -> control across polls). */
enum { EDIT_LEVELS = 4 };
static struct {
    uint8_t clip[SONG_PAYLOAD_V3_MAX];
    uint8_t slot[EDIT_LEVELS][SONG_PAYLOAD_V3_MAX];
    uint16_t block;
    uint8_t track, place, active, dirty, undo, redo;
    uint8_t created;                   /* tabby-v04.10: the clip was made on the device and is not in song storage yet */
    uint32_t gesture;                  /* the last knob gesture (step, note, field): one undo level per gesture */
    uint32_t changed_ms;
    uint16_t revision;                 /* counts the changes: the screen redraws on it */
} edit;
static uint8_t edit_refresh;           /* 1 + the track whose looping buffer should be decoded again */
/* tabby-v04.10: the song itself (its clip table, scenes or header) was changed on the device: the record is written,
 * as version 3, when the song is saved (stopped only, as every flash write). */
static uint8_t reserve_scene;           /* tabby-v04.12: the scene PLAY starts at (a scene pad pressed while stopped; 0: the first) */
static uint8_t song_dirty;
static uint32_t song_changed_ms;
static void song_changed(void) { song_dirty = 1; song_changed_ms = fm1_millis(); }
/* ---- Goal 6, second step (tabby-v04.9): real-time recording into the open clip (SPEC 14.2, 19.11) -------------
 * Notes, controllers, pitch bend and channel pressure from the panel (queue 0, control task) and from MIDI in (queue
 * 1, the SDK's MIDI task) are stamped with TIMER4 where they arrive and turned into clip positions when the control
 * task drains them, from the block the audio thread published last (rec_block_*). */
enum { REC_OFF = 0, REC_ARMED = 1, REC_ON = 2, REC_HELD = 16, REC_CONTROLLERS = 8, REC_QUEUE = 32, REC_TICKS_PER_BLOCK = 69660 };
struct rec_event { uint8_t status, a, b; uint32_t ticks; };
static struct rec_event rec_queue[2][REC_QUEUE];
static volatile uint8_t rec_wr[2], rec_rd[2];
static volatile uint32_t rec_block_master, rec_block_ticks, rec_block_adv, rec_block_seq;   /* audio -> control */
static struct {
    uint8_t state, quantize, full;     /* full: the cap stopped the take (the screen reads and clears it) */
    uint8_t taken;                     /* something was written in this take */
    struct { uint8_t used, pitch, velocity; int32_t time; uint32_t at; } held[REC_HELD];
    /* Controller thinning (SPEC 14.2): per controller the last written value and time, one pending value. */
    struct { uint8_t used, kind, number, has_pending, has_last; uint16_t last, pending; int32_t pending_time; uint32_t last_at, seen_at; } ctl[REC_CONTROLLERS];   /* a bend's value is lsb | msb << 7 */
} rec = { .quantize = 1 };
static volatile unsigned mute_mask;
static volatile unsigned scene_hold;
/* ---- tabby-v04.10: the click and the count-in (SPEC 14.1 decision 7) ------------------------------------------
 * Two clicks: one mixed into the audio output (song_click_mix, from app/audio_output.c) and one as a MIDI note on a
 * chosen channel, sent with the song's events; either, both or none. A click falls on every quarter note of the
 * master cycle, the first of a cycle louder. The count-in: PLAY with a take armed plays `count_units` of clicks before
 * the song starts (the song's Start goes out after it, as on the MC-707 since its version 1.20); it clicks whatever
 * the click mode says, on the outputs chosen. Settings live in the song record (header bytes 44 to 46).
 * tabby-v04.14: the internal click's level (LOW twice the level of tabby-v04.13, MID four times, HIGH eight times). */
static volatile uint8_t click_live, click_out, click_ch = 9, click_note = 37, click_level = 1;   /* control -> audio; out: 0 internal, 1 MIDI, 2 both */
static volatile uint32_t count_units;                                          /* control sets it with start_request; audio clears it */
static uint32_t count_pos, count_acc, click_off_in;                            /* audio only */
static volatile uint32_t count_from;                                           /* where the count-in's position starts (song_play) */
static uint8_t click_held, click_held_ch, click_held_note;
static volatile uint16_t click_frames; static volatile uint8_t click_delay, click_accent;   /* tabby-v04.10: the scene that plays repeats until this is taken off or a scene is recalled */
/* audio -> control */
static volatile unsigned playing, cur, repeat, underruns, song_over;
static volatile uint32_t master, song_start;
/* audio only */
static uint32_t acc, song_len, rnd = 0x2545f491U;
struct track {
    uint16_t head;                            /* the block whose header program and bank were sent last (0: none) */
    uint8_t cur, state, pass, waiting, row;   /* waiting: the frame began without its buffer; row: the launched pattern */
    uint32_t start, len;                      /* the current frame, master units */
    uint32_t entry, chain_at;                 /* tabby-v04.10: when the clip was entered; when its chain is due (0: no chain) */
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
struct action { uint16_t at, index; uint8_t kind, buf, track, step, pitch; };   /* index: the note in its cell, or the event in a v3 clip (up to 511) */
static struct action actions[ACTIONS];
static unsigned action_count;
/* The tick's plan per track: its next boundary (master units, or 0 = none), what happens
 * there and the buffer of the frame that follows (SONG_NONE = unknown). */
static struct { uint32_t tb; int32_t origin; uint8_t what, nb, landing; } plan[SONG_TRACKS];   /* origin: where in its clip a track that goes back to the scenes joins */
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

/* ---- Task 16 Goal 3: external clock follow (SPEC 19.3) -----------------------------------------------
 * With CLOCK = MIDI (SYNC / MIDI, K1) PLAY ARMS the song instead of refusing: the buffers of row 0 are
 * decoded and the song waits for the master's Start (FA) or Continue (FB). From then on the transport is
 * the master's:
 *   - every clock pulse (F8, 24 per quarter note = 80 units) moves the song 80 units; between two pulses
 *     the song moves at the pulse period estimated from the last pulses, nudged by a quarter of its
 *     phase error per block (so one block of arrival jitter does not become note jitter);
 *   - Start (FA): from the beginning, at the first pulse after it; Continue (FB): from the held position
 *     at the next pulse; Stop (FC): note-offs for everything that sounds, position kept, ALWAYS wins;
 *   - Song Position Pointer (F2, in 16th notes = steps = 480 units): accepted stopped and running; the
 *     control task decodes the row that holds the position (song_locate) and the audio thread restarts the
 *     frames at it; a running song goes on at the next pulse, a stopped one waits for Continue;
 *   - 3 missed pulses (no pulse for 3.5 periods): the song stops advancing and sends note-offs (HELD);
 *     pulses back within 2 s without a Stop: relock and go on from the held position; a gap of 2 s or more:
 *     LOST, and clock pulses alone never restart it: only Continue or Start do.
 * Threads: the routing task (MIDI-in callback) counts pulses (ext_pulses, one writer) and queues the other
 * messages in a ring with the pulse count at their arrival (so a Start keeps its place among the pulses);
 * the audio thread (ext_block, once per block) owns the state machine; the control task (song_poll) only
 * decodes when the audio thread asks for a position (ext_prep_*). Nothing here is built into a song that
 * does not follow: follow_on is 0 and every path below is skipped. */
enum { EXT_OFF, EXT_IDLE, EXT_PREP, EXT_WAIT, EXT_RUN, EXT_HELD, EXT_LOST, EXT_STOP };
enum { EXT_PULSE_UNITS = UNITS / 6, EXT_RELOCK_BLOCKS = 2 * 44100 / 128, EXT_ADV_MAX = 28 };
enum { EXT_MSG_START = 1, EXT_MSG_CONTINUE = 2, EXT_MSG_STOP = 3, EXT_MSG_SPP = 4 };
struct ext_msg { uint16_t arg; uint8_t kind; uint32_t pulses; };
static volatile unsigned follow_on, ext_state, user_stop;     /* follow_on / user_stop: control; ext_state: audio */
static volatile uint32_t ext_pulses;                           /* routing task: F8 count */
static volatile struct ext_msg ext_ring[8];
static volatile unsigned ext_wr, ext_rd;
static volatile unsigned ext_prep_request, ext_prep_done, ext_prep_steps, ext_after_resume, ext_start_row, ext_start_repeat, ext_start_step;
static volatile uint32_t ext_pos;                              /* units: where the prepared buffers start */
static volatile uint32_t ext_resume_at;
static int32_t ext_frac;
static uint32_t ext_block_no, ext_seen, ext_last_block, ext_ref_pulses, ext_ref_master, ext_period_q8 = 7U * 256U, ext_adv;
static unsigned ext_stay_state, ext_use_adv;
static unsigned ext_first;   /* Task 17: the block that begins to run after a Start / Continue / relock: its events get no look-ahead */

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
/* The v3 event reader for the audio thread: the same as clip_v3_event / clip_v3_count / clip_v3_anchor
 * (app/clip_v3.c), here as RAM code like everything else the audio interrupt runs. */
static FM1_AUDIO_CODE unsigned v3_count(const uint8_t *p) { return p[6] | (unsigned)p[7] << 8; }
static FM1_AUDIO_CODE void v3_event(const uint8_t *p, unsigned index, struct clip_v3_event *out)
{
    const uint8_t *e = p + CLIP_V3_HEADER + CLIP_V3_EVENT * index;
    out->time = (int32_t)(e[0] | (unsigned)e[1] << 8) - CLIP_V3_BIAS;
    if (!(e[3] & 0x80U)) {
        out->kind = CLIP_V3_NOTE; out->a = e[2] & 127U; out->retrigger = e[2] >> 7; out->b = e[3] & 127U; out->length = (uint16_t)(e[4] | (unsigned)e[5] << 8);
    } else {
        out->kind = e[2]; out->a = e[4]; out->b = e[5]; out->retrigger = 0; out->length = 0;
    }
}
static FM1_AUDIO_CODE unsigned v3_anchor(int time) { return time + 239 < 0 ? 0U : (unsigned)(time + 239) / CLIP_V3_UNITS_PER_STEP; }
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
    int32_t start;
    if (b->v3) {
        /* The cursor: `index` is the event in the clip's list. A note plays as a grid note does; a controller,
         * program, bend or pressure event goes out on the track's channel (no copy to the internal engine). */
        struct clip_v3_event e;
        v3_event(b->clip, index, &e);
        if (e.kind != CLIP_V3_NOTE) {
            static const uint8_t status[5] = {0, 0xb0, 0xc0, 0xe0, 0xd0};
            if (e.kind <= CLIP_V3_PRESSURE) groove_midi_song_track_event(t, status[e.kind], e.a, e.kind == CLIP_V3_CC || e.kind == CLIP_V3_BEND ? e.b : 0);
            return;
        }
        n.pitch = e.a; n.velocity = e.b; n.retrigger = e.retrigger; n.offset = 0; n.length = e.length;
        start = e.time;
    } else {
        timed_note_unpack(b->cell[step] + 1 + NOTE * index, &n);
        start = (int32_t)step * UNITS + n.offset;
    }
    if (mute_mask & (1U << t)) return;   /* Task 17 Goal 4: a muted track's notes stay in; the clip runs on */
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
    struct action a = { (uint16_t)at, (uint16_t)index, (uint8_t)kind, (uint8_t)buf, (uint8_t)t, (uint8_t)step, (uint8_t)pitch };
    /* Insertion sort: by time, note-offs before switches before note-ons, then arrival order. */
    unsigned i = action_count++;
    while (i > 0 && (actions[i - 1].at > a.at || (actions[i - 1].at == a.at && actions[i - 1].kind > a.kind))) { actions[i] = actions[i - 1]; --i; }
    actions[i] = a;
}
/* Note-ons of track t's buffer `buf` whose due time (warped, frame units) falls in
 * [from, to), as actions at `base` + (due - from); `which` the pass the probability rolls
 * belong to. mode 0: every step that can reach the range, except step-0 notes with a
 * negative offset; mode 1: only those (the look-ahead), whose due times are negative. */
/* The same for a buffer that plays from a v3 event list (the scheduler cursor). The list is sorted by time and
 * a swung time lies within [time, time + 240], so the first event that can be due at or after `from` is found by
 * a binary search and the walk ends at the first event at or after `to`: no empty step is visited. Events of the
 * same time keep their list order (a controller before its note). An event at or past the row's end is not
 * played (a clip longer than its row); one whose swing carries it past the end is due at the last unit. */
static FM1_AUDIO_CODE unsigned scan_v3(unsigned t, unsigned buf, int32_t from, int32_t to, int32_t base, unsigned mode, unsigned which)
{
    const struct trackbuf *b = &tbuf[t][buf];
    unsigned count = v3_count(b->clip), lo = 0, hi = count, added = 0;
    int32_t end = (int32_t)b->steps * UNITS, first = mode ? -HALF : from - HALF;
    while (lo < hi) {
        unsigned mid = (lo + hi) / 2U;
        struct clip_v3_event e; v3_event(b->clip, mid, &e);
        if (e.time < first) lo = mid + 1U; else hi = mid;
    }
    for (unsigned i = lo; i < count; ++i) {
        struct clip_v3_event e; v3_event(b->clip, i, &e);
        if (e.time >= to || e.time >= end) break;
        if (e.kind == CLIP_V3_STEPMOD) continue;
        if ((e.time < 0) != (mode != 0)) continue;
        int32_t due = warp(e.time, b->swing);
        if (!mode && due >= end) due = end - 1;
        if (due < from || due >= to) continue;
        unsigned anchor = v3_anchor(e.time);
        if (e.kind == CLIP_V3_NOTE && step_skipped(t, anchor, b->prob[anchor] & 7U, which)) continue;
        add_action((unsigned)(base + due - from), 2, buf, t, anchor, i, e.kind == CLIP_V3_NOTE ? e.a : 0);
        ++added;
    }
    return added;
}
static FM1_AUDIO_CODE unsigned scan(unsigned t, unsigned buf, int32_t from, int32_t to, int32_t base, unsigned mode, unsigned which)
{
    const struct trackbuf *b = &tbuf[t][buf];
    unsigned lo = 0, hi = 0, added = 0;
    int32_t end = (int32_t)b->steps * UNITS;
    if (from >= to || !b->has_block) return 0;
    if (b->v3) return scan_v3(t, buf, from, to, base, mode, which);
    if (!mode) {   /* warp(t) lies within [t, t + 240] */
        lo = from >= UNITS ? (unsigned)(from - UNITS) / UNITS : 0; hi = (unsigned)(to + HALF) / UNITS;
        if (hi >= b->steps) hi = b->steps - 1U;
        if (hi >= SONG_BLOCK_STEPS) hi = SONG_BLOCK_STEPS - 1U;   /* Task 17: a row may be longer than the 64-step grid (a v2 block is silent past step 64) */
        if (lo >= SONG_BLOCK_STEPS) return 0;
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
/* ---- audio thread: the click ---------------------------------------------------------- */
static FM1_AUDIO_CODE void click_release(void)
{
    if (click_held) { groove_midi_song_event(click_held_ch, 0x80, click_held_note, 0); click_held = 0; }
}
/* The clicks of the window [p0, p0 + adv), p0 counted from a cycle start; none at or past `limit` (the end of a
 * count-in: that beat is the song's first; 0: no limit). */
static FM1_AUDIO_CODE void click_window(uint32_t p0, unsigned adv, unsigned on, uint32_t limit)
{
    if (click_held) {
        if (click_off_in < adv) { groove_midi_at(click_off_in, adv); click_release(); }
        else click_off_in -= adv;
    }
    if (!on) return;
    uint32_t c = cycle_units, p = p0 % c, beat = 4U * UNITS, next = (p + beat - 1U) / beat * beat;
    if (next > c) next = c;
    if (next - p >= adv || (limit && p0 - p + next >= limit)) return;
    unsigned at = next - p, accent = next == c || next == 0, out = click_out;
    if (out) {
        groove_midi_at(at, adv);
        click_release();
        click_held_ch = click_ch; click_held_note = click_note; click_held = 1; click_off_in = at + (uint32_t)HALF - adv;
        groove_midi_song_event(click_held_ch, 0x90, click_held_note, accent ? 127 : 90);
    }
    if (out != 1) { click_delay = (uint8_t)(at * FM1_BLOCK_FRAMES / (adv ? adv : 1U)); click_accent = (uint8_t)accent; click_frames = 300; }
}
/* The internal click, added to the block the output stage is about to send (app/audio_output.c): a short square
 * burst that dies away, higher for the first beat of a cycle. */
FM1_AUDIO_CODE void song_click_mix(int32_t *out)
{
    unsigned n = click_frames;
    if (!n) return;
    for (unsigned i = click_delay; i < FM1_BLOCK_FRAMES && n; ++i, --n) {
        int32_t v = ((n >> (click_accent ? 2 : 3)) & 1U ? 1 : -1) * (int32_t)n * (2000 << click_level);   /* tabby-v04.14: CLICK LEVEL: LOW twice the old level, MID four times, HIGH eight times */
        out[2U * i] += v; out[2U * i + 1U] += v;
    }
    click_delay = 0; click_frames = (uint16_t)n;
}
/* ---- audio thread: frames ------------------------------------------------------------ */
/* The next bar for a queue placed before master time m: the first bar at or after m (a
 * window that ended exactly on a bar did not cross it, so the bar belongs to the window that
 * starts there), except at the song start, which is bar 0 itself: there the next bar is bar 1. */
static FM1_AUDIO_CODE uint32_t next_bar(uint32_t m) { uint32_t c = cycle_units; return m ? (m + c - 1U) / c * c : c; }   /* Task 17: the next master cycle (a bar of 16 steps unless the song says otherwise) */
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
    /* A v3 clip's header program and bank (docs/CLIP-V3.md 2) go out when the track enters the clip, once, before
     * the clip's first events: bank select MSB and LSB, then the program, on the track's channel. A repeat of the
     * same clip sends nothing. */
    if (b->has_block && b->v3 && b->block != k->head) {
        const uint8_t *h = b->clip;
        if (h[1] & CLIP_V3_FLAG_BANK) { groove_midi_song_track_event(t, 0xb0, 0, h[3]); groove_midi_song_track_event(t, 0xb0, 32, h[4]); }
        if (h[1] & CLIP_V3_FLAG_PROGRAM) groove_midi_song_track_event(t, 0xc0, h[2], 0);
    }
    if (b->has_block) k->head = b->v3 ? b->block : 0;
    if (check_late && b->has_block && b->v3) {
        /* The cursor: the events before the frame's start (time < 0) lead the list. */
        unsigned count = v3_count(b->clip);
        for (unsigned i = 0; i < count; ++i) {
            struct clip_v3_event e; v3_event(b->clip, i, &e);
            if (e.time >= 0) break;
            if (e.kind == CLIP_V3_STEPMOD || (covered && warp(e.time, b->swing) >= b->look_from)) continue;   /* fired ahead */
            late = 1;
            if (e.kind != CLIP_V3_NOTE || !step_skipped(t, 0, b->prob[0] & 7U, k->pass)) note_on(buf, t, 0, i, at);
        }
    } else if (check_late && b->has_block) {
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
/* tabby-v04.10: every track loops its clip at the clip's own length, whatever the scene's length is. chain_set: when the
 * chain of the launched clip in the track's buffer is due: `times` times `after` steps (or the clip's length) after the
 * clip was entered; a chain that is already past (the settings were edited while it played) is due at the end of this
 * pass. frame_set: the length and chain of the buffer a frame was just entered from. */
static FM1_AUDIO_CODE void chain_set(unsigned t)
{
    struct track *k = &tr[t];
    const struct trackbuf *b = &tbuf[t][k->cur];
    k->chain_at = 0;
    if (k->state != 1 || !b->chain_next || !b->steps) return;
    k->chain_at = k->entry + (uint32_t)b->chain_times * (b->chain_after ? b->chain_after : b->steps) * UNITS;
    if (k->chain_at <= k->start) k->chain_at = k->start + k->len;
}
static FM1_AUDIO_CODE void frame_set(unsigned t)
{
    struct track *k = &tr[t];
    if (k->waiting) return;
    if (tbuf[t][k->cur].steps) k->len = (uint32_t)tbuf[t][k->cur].steps * UNITS;
    k->entry = k->start;
    chain_set(t);
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
    if (repeat + 1U < b->repeat || ((b->loop_here || scene_hold) && (target_row == SONG_NONE || !n->ready))) return NEXT_SAME;
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
    release_all(); click_release();
    playing = 0; master = 0; song_over = 0; ext_use_adv = 0; ext_state = EXT_OFF;
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
    if (next != NEXT_ROW) return 1;   /* tabby-v04.10: a repeat of the scene: the tracks loop their clips by themselves (track_switch) */
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        struct track *k = &tr[t];
        if (!landed && (k->state != 0 || plan[t].landing)) continue;
        unsigned o = k->cur ^ 1U, nr = rowset[cur].row;
        unsigned nb = holds(&tbuf[t][k->cur], nr, P_SONG) ? k->cur : holds(&tbuf[t][o], nr, P_SONG) ? o : SONG_NONE;
        k->start = bd; k->len = song_len; k->chain_at = 0;
        adopt(t, nb, at, 1);
        frame_set(t);
        /* A scene jump into a row with no block for this track stops the track (9.13). */
        if (landed && !k->waiting && !tbuf[t][k->cur].has_block) release_track(t);
    }
    return 1;
}
/* A track's own boundary: its pattern loops, or a queue lands on the bar. */
static FM1_AUDIO_CODE void track_switch(unsigned t, unsigned what, unsigned at)
{
    struct track *k = &tr[t];
    if (what == SW_LOOP) {
        k->start += k->len;
        unsigned nb = plan[t].nb;
        if (nb != SONG_NONE && nb != k->cur && tbuf[t][nb].fresh) {   /* Goal 6: the loop's next pass plays the edited clip */
            if (tbuf[t][nb].prog != tbuf[t][k->cur].prog) k->head = 0;   /* tabby-v04.13: the clip's program or bank was edited: it goes out again */
            tbuf[t][k->cur].ready = 0; barrier(); k->cur = (uint8_t)nb; tbuf[t][nb].fresh = 0;
            k->len = (uint32_t)tbuf[t][nb].steps * UNITS;
            chain_set(t);   /* the edited clip's chain settings */
        }
        enter_frame(t, k->cur, at, 1); return;
    }
    if (what == SW_CHAIN) {
        /* tabby-v04.10: the launched clip's chain is due: the track stops, or goes on with the next clip from here.
         * Notes that sound run out at their own length (a stop releases them). */
        const struct trackbuf *c = &tbuf[t][k->cur];
        unsigned next = c->chain_next, row = c->chain_row;
        k->chain_at = 0;
        if (next == 1) { release_track(t); k->state = 2; k->waiting = 0; return; }
        k->row = (uint8_t)row; k->start = plan[t].tb;
        adopt(t, plan[t].nb, at, 1);
        frame_set(t);
        if (!k->waiting) { stream_begin(1 + t, 1, t * 2U + k->cur); stream_run_one(&streams[1 + t]); }
        return;
    }
    unsigned kind = queue_kind[t];
    release_track(t);
    queue_kind[t] = Q_NONE; seen_kind[t] = Q_NONE;
    if (kind == Q_STOP) { k->state = 2; k->waiting = 0; return; }
    if (kind == Q_LAUNCH) {
        k->state = 1; k->row = queue_row[t];
        k->start = plan[t].tb;
        k->len = (k->row >= SONG_ROWS ? (place_steps[t] ? place_steps[t] : SONG_BLOCK_STEPS)
                  : record.row[k->row].steps ? record.row[k->row].steps : SONG_BLOCK_STEPS) * UNITS;
        k->chain_at = 0;
        adopt(t, plan[t].nb, at, 1);
        frame_set(t);   /* the clip's own length and its chain */
    } else {   /* Q_ATTACH: back to song, into the scene's clip where it stands (no look-ahead) */
        k->state = 0; k->row = 0; k->chain_at = 0;
        k->start = plan[t].tb - (uint32_t)plan[t].origin; k->len = song_len;
        if (song_over) { k->waiting = 0; return; }
        adopt(t, plan[t].nb, at, 0);
        if (!k->waiting && tbuf[t][k->cur].steps) k->len = (uint32_t)tbuf[t][k->cur].steps * UNITS;
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
    unsigned adv;
    if (ext_use_adv) adv = ext_adv;           /* Task 16: a follow song advances as the clock pulses say (ext_block) */
    else { acc += tempo * ADV_MUL; adv = acc / ADV_DIV; acc %= ADV_DIV; }
    uint32_t m0 = master, m1 = master + adv, bar = next_bar(m0), sbd;
    /* Goal 6: where this block starts in time and in the song, for the recorder's stamps */
    ++rec_block_seq; rec_block_master = m0; rec_block_ticks = ct_diag_ticks(); rec_block_adv = adv; ++rec_block_seq;
    unsigned snext = song_next(m0, &sbd);
    prefire(tempo, m0, sbd, snext);
    if (click_live || click_held) { click_window(m0, adv, click_live, 0); groove_midi_at(0, 0); }   /* tabby-v04.10 */
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
        /* tabby-v04.10: the clip's own length; in phase with where it would have started (the scene's entry for a
         * track that follows the scenes) */
        if (k->state == 0) k->start = song_start - repeat * song_len;
        frame_set(t);
        while (k->len && (int32_t)(m0 - k->start) >= (int32_t)k->len) k->start += k->len;
        chain_set(t);
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
        plan[t].tb = 0; plan[t].what = SW_SONG; plan[t].nb = SONG_NONE; plan[t].origin = 0;
        if (active) {
            /* tabby-v04.10: the track's own boundary is the end of its clip (every track loops its clip at the clip's
             * length), for a launched clip its chain when that comes first; a track that follows the scenes takes the
             * next scene's clip where the scene changes, and plays nothing past the end of the song. */
            uint32_t loop_at = k->start + k->len;
            plan[t].tb = loop_at; plan[t].what = SW_LOOP;
            if (k->state == 1) { if (k->chain_at && k->chain_at <= loop_at) { plan[t].tb = k->chain_at; plan[t].what = SW_CHAIN; } }
            else if (snext == NEXT_ROW && loop_at >= sbd) { plan[t].tb = sbd; plan[t].what = SW_SONG; }
            else if (snext == NEXT_NONE && song_end && loop_at >= sbd) plan[t].tb = 0;
        }
        if (scene && (!plan[t].tb || plan[t].tb >= sbd)) { plan[t].tb = sbd; plan[t].what = SW_SONG; }
        if (scene) qk = Q_NONE;
        else if (qk != Q_NONE && (!plan[t].tb || bar <= plan[t].tb)) { plan[t].tb = bar; plan[t].what = SW_QUEUE; }
        /* The buffer of the frame that follows the boundary. */
        if (plan[t].what == SW_SONG) { if (plan[t].tb) { unsigned nr = rowset[cur ^ 1U].row; plan[t].nb = holds(&tbuf[t][k->cur], nr, P_SONG) ? k->cur : holds(&tbuf[t][o], nr, P_SONG) ? o : SONG_NONE; } }
        else if (plan[t].what == SW_LOOP) plan[t].nb = tbuf[t][o].fresh && holds(&tbuf[t][o], row, purpose) ? o : k->cur;   /* Goal 6: the edited clip, decoded again */
        else if (plan[t].what == SW_CHAIN) {
            const struct trackbuf *c = &tbuf[t][k->cur];
            if (c->chain_next >= 2) plan[t].nb = holds(c, c->chain_row, P_LAUNCH) ? k->cur : holds(&tbuf[t][o], c->chain_row, P_LAUNCH) ? o : SONG_NONE;
        } else if (plan[t].what == SW_QUEUE) {
            if (qk == Q_LAUNCH) plan[t].nb = holds(&tbuf[t][k->cur], qr, P_LAUNCH) ? k->cur : holds(&tbuf[t][o], qr, P_LAUNCH) ? o : SONG_NONE;
            else if (qk == Q_ATTACH && !song_over) {
                /* The row the song is in at the bar: the next row when the song changes rows there. */
                unsigned change = sbd == bar && snext == NEXT_ROW, ar = change ? rowset[cur ^ 1U].row : rowset[cur].row;
                plan[t].nb = holds(&tbuf[t][k->cur], ar, P_SONG) ? k->cur : holds(&tbuf[t][o], ar, P_SONG) ? o : SONG_NONE;
                /* it joins its clip where the clip stands: the clip has looped since the scene was entered */
                if (!change && plan[t].nb != SONG_NONE && tbuf[t][plan[t].nb].steps)
                    plan[t].origin = (int32_t)((bar - (song_start - repeat * song_len)) % ((uint32_t)tbuf[t][plan[t].nb].steps * UNITS));
            }
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
            int32_t origin = plan[t].origin;   /* back to song joins mid-clip */
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
        /* Task 17 (G): the action's place in the block's window is its due time; the first block of a
         * follow song after the master's first pulse is sent at once. */
        if (ext_first) groove_midi_immediate(); else groove_midi_at(a->at, adv);
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
            if (sounding[t][i].remaining < adv) { if (!ext_first) groove_midi_at(sounding[t][i].remaining, adv); note_off(t, i); }
            else { sounding[t][i].remaining -= adv; ++i; }
        }
    groove_midi_at(0, 0); ext_first = 0;
    master = m1;
}

/* ---- external clock follow, audio thread (Task 16 Goal 3) ---------------------------------------------- */
/* Release everything that sounds (note-offs into lane 0), as a Stop or a hold must. */
static FM1_AUDIO_CODE void ext_prepare(uint32_t units, unsigned resume)
{
    release_all();
    ext_state = EXT_PREP;
    ext_after_resume = resume;
    ext_prep_steps = units / UNITS;
    barrier();
    ext_prep_request = 1;
}
/* Accept a resume (Start or Continue): wait for the first pulse after the message. The first pulse is the
 * resume point (position ext_ref_master); the pulses after it add EXT_PULSE_UNITS each. */
static FM1_AUDIO_CODE void ext_resume(uint32_t at_pulses)
{
    ext_state = EXT_WAIT;
    ext_ref_pulses = at_pulses + 1U; ext_ref_master = master; ext_seen = at_pulses; ext_last_block = ext_block_no;
}
static FM1_AUDIO_CODE void ext_message(const struct ext_msg *m)
{
    switch (m->kind) {
    case EXT_MSG_START:
        release_all();
        if (ext_state == EXT_IDLE && ext_pos == 0) { master = 0; ext_resume(m->pulses); }
        else { ext_resume_at = m->pulses; ext_prepare(0, 1); }
        break;
    case EXT_MSG_CONTINUE:
        if (ext_state == EXT_PREP) { ext_after_resume = 1; ext_resume_at = m->pulses; }
        else if (ext_state == EXT_IDLE || ext_state == EXT_STOP || ext_state == EXT_HELD || ext_state == EXT_LOST) ext_resume(m->pulses);
        break;
    case EXT_MSG_STOP:                                   /* Stop always wins */
        release_all();
        if (ext_state == EXT_PREP) ext_after_resume = 0;
        else if (ext_state != EXT_IDLE) ext_state = EXT_STOP;
        break;
    case EXT_MSG_SPP: {
        unsigned running = ext_state == EXT_RUN || ext_state == EXT_WAIT || ext_state == EXT_HELD;
        if (ext_state == EXT_PREP) { ext_after_resume = ext_after_resume || running; ext_prep_steps = m->arg; ext_prep_request = 1; break; }
        ext_stay_state = ext_state == EXT_IDLE ? EXT_IDLE : EXT_STOP;
        ext_resume_at = m->pulses;
        ext_prepare((uint32_t)m->arg * UNITS, running);
        break; }
    }
}
/* Once per block, from song_tick while a follow song plays. Returns 1 when this block advances the song
 * (ext_adv units, *tempo for the look-ahead), 0 when it does not. */
static FM1_AUDIO_CODE int ext_block(unsigned *tempo)
{
    ++ext_block_no;
    uint32_t pulses = ext_pulses;
    while (ext_rd != ext_wr) {
        struct ext_msg m;
        m.arg = ext_ring[ext_rd & 7U].arg; m.kind = ext_ring[ext_rd & 7U].kind; m.pulses = ext_ring[ext_rd & 7U].pulses;
        ++ext_rd;
        ext_message(&m);
    }
    if (ext_state == EXT_PREP || ext_state == EXT_IDLE || ext_state == EXT_STOP) { ext_seen = pulses; return 0; }
    uint32_t newp = pulses - ext_seen;
    if (ext_state == EXT_LOST) { ext_seen = pulses; ext_last_block = ext_block_no; return 0; }
    if (ext_state == EXT_WAIT) {
        if (pulses < ext_ref_pulses) return 0;           /* the first pulse after the message has not come */
        ext_state = EXT_RUN; ext_last_block = ext_block_no; ext_seen = pulses; ext_frac = 0; newp = 0; ext_first = 1;
    } else if (newp) {
        uint32_t gap = ext_block_no - ext_last_block;
        if (ext_state == EXT_HELD) {                    /* pulses are back inside the 2 s: relock, go on from the hold */
            ext_state = EXT_RUN; ext_ref_pulses = pulses; ext_ref_master = master; ext_frac = 0; ext_first = 1;
        } else {
            uint32_t per = (gap << 8) / newp;
            if (per >= 2U * 256U && per <= 60U * 256U) ext_period_q8 = (uint32_t)((int32_t)ext_period_q8 + ((int32_t)per - (int32_t)ext_period_q8) / 8);
        }
        ext_last_block = ext_block_no; ext_seen = pulses;
    } else {
        uint32_t gap = ext_block_no - ext_last_block;
        if (ext_state == EXT_RUN && gap * 256U > ext_period_q8 * 7U / 2U) { release_all(); ext_state = EXT_HELD; }
        if (ext_state == EXT_HELD && gap >= EXT_RELOCK_BLOCKS) ext_state = EXT_LOST;
        if (ext_state != EXT_RUN) return 0;
    }
    /* RUN: the predicted position and the advance toward it. Task 17 (G): while the MIDI out has the
     * look-ahead of one block (app/midi_router.c), the song runs one block ahead of the pulses, so a
     * note leaves at its pulse and not a block after it; the block that begins the run starts ahead
     * and sends its events at once (ext_first). */
    uint32_t ahead = groove_midi_live() ? (256U * EXT_PULSE_UNITS) / ext_period_q8 : 0U;   /* units in one block */
    uint32_t frac = ((ext_block_no - ext_last_block) * 256U * EXT_PULSE_UNITS) / ext_period_q8;
    if (frac > EXT_PULSE_UNITS - 1U) frac = EXT_PULSE_UNITS - 1U;
    int32_t pred = (int32_t)(ext_ref_master + (pulses - ext_ref_pulses) * EXT_PULSE_UNITS + frac + ahead);
    int32_t err = pred - (int32_t)master;
    int32_t q8 = (int32_t)((EXT_PULSE_UNITS << 16) / ext_period_q8) + err * 64;   /* nominal + a quarter of the error, units x 256 */
    if (ext_first) q8 = (int32_t)((EXT_PULSE_UNITS << 16) / ext_period_q8) + (int32_t)ahead * 256;   /* start ahead in one step */
    ext_frac += q8;
    int32_t adv = ext_frac >> 8;
    ext_frac -= adv * 256;
    if (adv < 0) { adv = 0; ext_frac = 0; }
    if (adv > EXT_ADV_MAX) { adv = EXT_ADV_MAX; ext_frac = 0; }
    ext_adv = (uint32_t)adv;
    unsigned bpm = 220500U / ext_period_q8;
    *tempo = bpm < 30U ? 30U : bpm > 300U ? 300U : bpm;
    return 1;
}
FM1_AUDIO_CODE unsigned song_tempo(void) { return playing ? tempo_override : 0; }
#if defined(FM1_HOST_TEST) || defined(FM1_OPEN_WEB)
/* Simulator and host tests only: the master position in units and the advance remainder,
 * for the timing checks (never built into the device image). */
unsigned song_test_position(unsigned *remainder) { if (remainder) *remainder = acc; return master; }
#endif
FM1_AUDIO_CODE void song_tick(unsigned tempo)
{
    if (start_request && count_units) {
        /* tabby-v04.10: the count-in: clicks at the song's tempo; the song starts with the block after its last unit */
        if (stop_request) { stop_request = 0; start_request = 0; count_units = 0; count_pos = count_acc = 0; click_release(); return; }
        if (!count_pos) count_pos = count_from;
        count_acc += (tempo_override ? tempo_override : tempo) * ADV_MUL;
        unsigned adv = count_acc / ADV_DIV; count_acc %= ADV_DIV;
        click_window(count_pos, adv, 1, count_units);
        groove_midi_at(0, 0);
        count_pos += adv;
        if (count_pos >= count_units) { count_units = 0; count_pos = count_acc = 0; }
        return;
    }
    if (start_request) {
        start_request = 0;
        /* The caller read song_tempo() before `playing` was set: the first block must
         * already advance at the song's own tempo (an exact-clock requirement, 9.12). */
        if (tempo_override) tempo = tempo_override;
        unsigned fol = follow_on;                  /* Task 16: a follow song starts at a position (ext_pos) and waits for the clock */
        uint32_t from = fol ? ext_pos : 0, offset = fol ? ext_start_step * UNITS : 0;
        unsigned fresh = !fol || (!ext_start_step && !ext_start_repeat);
        if (fol) release_all();
        memset(sounding_count, 0, sizeof sounding_count);
        master = from; acc = 0; repeat = fol ? ext_start_repeat : 0; song_over = 0; song_start = from - offset;
        song_len = rowset[0].steps * UNITS;
        playing = 1;
        if (!fol) groove_midi_transport(0, 0xfa);
        /* Row 0's events go out before its first notes; no lead exists at PLAY (SEND
         * SETUP is the way to send them early), so this is not counted as late. Its
         * step-0 notes with a negative offset play at the start and are (9.12). A follow
         * start in the middle of a row sends no row events. */
        for (unsigned s = 0; s <= SONG_TRACKS; ++s) streams[s].active = 0;
        armed[0] = 1; armed_row[0] = rowset[0].row; armed[1] = 0; streamed[0] = 1;
        if (fresh) { stream_begin(0, 0, 0); stream_run_one(&streams[0]); }
        memset(roll_step, 255, sizeof roll_step);
        for (unsigned t = 0; t < SONG_TRACKS; ++t) {
            struct track *k = &tr[t];
            k->cur = 0; k->state = 0; k->pass = 0; k->waiting = 0; k->row = 0; k->head = 0; k->len = song_len;
            k->start = song_start - repeat * song_len;   /* where the scene was entered (a follow start may be inside it) */
            if (!fol && start_row[t] != SONG_NONE) {   /* a clip reserved while stopped: the track starts launched on it */
                k->state = 1; k->row = start_row[t];
                k->len = (uint32_t)(start_steps[t] ? start_steps[t] : SONG_BLOCK_STEPS) * UNITS;
            }
            tbuf[t][0].look_from = tbuf[t][1].look_from = LOOK_NONE;
            tstreamed[t] = 0; seen_kind[t] = Q_NONE; seen_row[t] = 0;
            frame_set(t);   /* tabby-v04.10: the clip's own length and chain */
            while (k->len && (int32_t)(from - k->start) >= (int32_t)k->len) k->start += k->len;
            enter_frame(t, 0, 0, fresh);
        }
        if (fol) {
            ext_use_adv = 1; ext_prep_done = 1;
            if (ext_after_resume) ext_resume(ext_resume_at);
            else ext_state = ext_stay_state == EXT_STOP ? EXT_STOP : EXT_IDLE;
            ext_stay_state = EXT_IDLE;
            return;
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
    if (follow_on && !ext_block(&tempo)) return;   /* Task 16: held, stopped, waiting for a pulse or for a position */
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
/* tabby-v04.10: lengths. A v3 clip carries its length and loops at it wherever it plays. A v2 block has none: in a
 * scene of a song as it was imported it plays the scene's steps, as it always did (the same block may sit in scenes of
 * different lengths). Where it plays outside those scenes (launched from a place no scene uses, or in a scene that was
 * stored on the device: SONG_ROW_FLAG_OWN), its length is v2_steps: the steps of the first imported scene that uses
 * it on this track, 64 when none does. */
static unsigned v2_steps(unsigned t, unsigned id)
{
    for (unsigned r = 0; r < record.rows; ++r)
        if (record.row[r].block[t] == id && !(record.row[r].flags & SONG_ROW_FLAG_OWN)) return record.row[r].steps ? record.row[r].steps : SONG_BLOCK_STEPS;
    return SONG_BLOCK_STEPS;
}
/* The row a clip is launched as: the first scene that uses it (the scene's row events for the track come with it), or
 * its place row (SONG_ROWS + place) when no scene does. */
static unsigned launch_row(unsigned track, unsigned place)
{
    unsigned id = model.clip[track][place];
    for (unsigned r = 0; r < record.rows; ++r)
        if (model.scene_clip[r][track] == place + 1U && record.row[r].block[track] == id) return r;
    return SONG_ROWS + place;
}
/* Decode row `row`'s block of track t into buffer b (ready == 0) for `purpose`. A v1 block
 * is upgraded to timed notes on the way (9.12) and keeps the project swing. A missing or bad
 * block plays silent (has_block = 0). */
static void decode_track(unsigned t, struct trackbuf *b, unsigned row, unsigned purpose)
{
    /* Task 17 Goal 4: a place row (SONG_ROWS + place) is the track's clip in that place, with its own length. */
    unsigned place_row = row >= SONG_ROWS;
    const struct song_row *r = &record.row[place_row ? 0 : row];
    b->row = (uint8_t)row; b->steps = place_row ? SONG_BLOCK_STEPS : r->steps ? r->steps : SONG_BLOCK_STEPS; b->purpose = (uint8_t)purpose;
    b->swing = (uint8_t)swing_song; b->has_block = 0; b->v3 = 0; b->block = 0;
    b->chain_next = 0; b->chain_times = 1; b->chain_after = 0; b->chain_row = 0; b->prog = 0;
    memset(b->cell, 0, sizeof b->cell);
    unsigned id = place_row ? model.clip[t][(row - SONG_ROWS) % SONG_CLIPS] : r->block[t], bytes, format = SONG_FORMAT_V2;
    if (id) {
        int e = 0;
        b->block = (uint16_t)id;
        if (edit.active && edit.dirty && id == edit.block) {   /* Goal 6: the unsaved edit is what plays */
            bytes = clip_v3_bytes(edit.clip); memcpy(payload, edit.clip, bytes); format = SONG_FORMAT_V3;
        } else {
            e = song_block_read(loaded, id, payload, &bytes, &format);
            if (!e) e = song_payload_valid(format, payload, bytes);
        }
        if (e) last_error = (unsigned)e;
        else {
            /* tabby-v04.10: the clip's own length, and a v3 clip's chain */
            if (format != SONG_FORMAT_V3 && (place_row || (r->flags & SONG_ROW_FLAG_OWN))) b->steps = (uint8_t)v2_steps(t, id);
            if (format == SONG_FORMAT_V3) {
                unsigned next = clip_v3_next(payload);
                b->steps = (uint8_t)clip_v3_steps(payload);
                b->prog = (uint32_t)(payload[1] & 3U) | (uint32_t)payload[2] << 8 | (uint32_t)payload[3] << 16 | (uint32_t)payload[4] << 24;
                if (next >= CLIP_V3_NEXT_CLIP && !model.clip[t][next - CLIP_V3_NEXT_CLIP]) next = CLIP_V3_NEXT_STAY;   /* no clip there: no chain */
                b->chain_next = (uint8_t)(next > CLIP_V3_NEXT_CLIP ? CLIP_V3_NEXT_CLIP : next);
                b->chain_times = (uint8_t)clip_v3_times(payload); b->chain_after = (uint16_t)clip_v3_after(payload);
                if (next >= CLIP_V3_NEXT_CLIP) b->chain_row = (uint8_t)launch_row(t, next - CLIP_V3_NEXT_CLIP);
                /* Task 16 Goal 5: a v3 clip that the step grid can hold plays through the grid (identical MIDI to the same notes
                 * as v2); one it cannot hold (docs/CLIP-V3.md) is an error until the cursor replaces the grid scan. */
                /* The cursor (branch clipv3-cursor): a clip the grid cannot hold plays from its event list. */
                if (force_cursor || clip_v3_to_cells(payload, bytes, b->cell)) {
                    memset(b->prob, 0, sizeof b->prob);
                    memcpy(b->clip, payload, bytes);   /* the grid and the list share their storage */
                    for (unsigned i = 0, n = clip_v3_count(payload); i < n; ++i) {
                        struct clip_v3_event e; clip_v3_event(payload, i, &e);
                        if (e.kind == CLIP_V3_STEPMOD && e.b < CLIP_V3_STEPS_MAX) b->prob[e.b] = e.a;
                    }
                    b->v3 = 1;
                }
                b->has_block = 1;
            } else {
            if (format == SONG_FORMAT_V1) { bytes = song_payload_upgrade(payload, bytes); b->swing = (uint8_t)swing_project; }
            for (unsigned step = 0, at = 0; step < SONG_BLOCK_STEPS; ++step) {
                unsigned count = payload[at] & 7U;
                memcpy(b->cell[step], payload + at, 1 + NOTE * count);
                at += 1 + NOTE * count;
            }
            b->has_block = 1;
            }
        }
    }
    b->lead = 0;
    b->event_count = place_row ? 0 : (uint8_t)slice_events(row, groove_midi_song_track_channel(t), b->event, &b->lead);
    barrier();
    b->ready = 1;
}
static void decode_rowinfo(struct rowinfo *b, unsigned row)
{
    const struct song_row *r = &record.row[row];
    b->row = (uint8_t)row; b->steps = r->steps ? r->steps : SONG_BLOCK_STEPS;
    b->repeat = r->repeat; b->loop_here = (r->flags & SONG_ROW_FLAG_LOOP_HERE) != 0;
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
        uint32_t m = master, c = cycle_units, bar = m ? (m + c - 1U) / c * c : c;
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
    if (k->state == 1) {   /* tabby-v04.10: the next clip of the launched clip's chain */
        const struct trackbuf *b = &tbuf[t][k->cur];
        if (b->ready && b->chain_next >= 2) { *row = b->chain_row; *purpose = P_LAUNCH; return 1; }
    }
    return 0;
}
static void leave_song(void)
{
    /* The audio thread has released every note into the lanes; deliver them on the
     * song channels, then the device channels apply again. */
    ct_midi_flush();   /* Task 12 A4 */
    groove_midi_song_channels(NULL);
    state = 0; jump_row = SONG_NONE;
    follow_on = 0; user_stop = 0; ext_state = EXT_OFF; ext_prep_request = 0;   /* Task 16 */
    memset((void *)queue_kind, 0, sizeof queue_kind);
}
/* Task 16: where does 16th-note position `steps` (counted from the start of the song, rows with their
 * repeats, loops followed) fall: row, repeat inside the row, step inside the repeat. A position past the
 * end of a song that does not loop clamps to its last step. Returns the (clamped) position in steps. */
static unsigned song_locate(unsigned steps, unsigned *row, unsigned *rep, unsigned *step)
{
    unsigned r = 0, base = 0, last_row = 0, last_rep = 0, last_step = 0, last_pos = 0;
    for (unsigned guard = 0; guard < 2048 && r != SONG_NONE && r < record.rows; ++guard) {
        const struct song_row *w = &record.row[r];
        unsigned len = w->steps ? w->steps : SONG_BLOCK_STEPS, reps = w->repeat ? w->repeat : 1U, total = len * reps;
        last_row = r; last_rep = reps - 1U; last_step = len - 1U; last_pos = base + total - 1U;
        if (steps - base < total) { *row = r; *rep = (steps - base) / len; *step = (steps - base) % len; return steps; }
        base += total;
        r = natural_next(r);
    }
    *row = last_row; *rep = last_rep; *step = last_step;
    return last_pos;
}
/* Decode the song's buffers at 16th-note position `steps` and ask the audio thread to start there (a follow
 * song: it then waits for the clock). Control task. */
static int song_prepare(unsigned steps)
{
    unsigned row, rep, step;
    steps = song_locate(steps, &row, &rep, &step);
    rowset[0].ready = rowset[1].ready = 0;
    for (unsigned t = 0; t < SONG_TRACKS; ++t) { tbuf[t][0].ready = tbuf[t][1].ready = 0; tr[t].cur = 0; tr[t].state = 0; tr[t].waiting = 0; }
    cur = 0; jump_row = SONG_NONE; setup_request = 0; song_over = 0;
    memset((void *)queue_kind, 0, sizeof queue_kind);
    ct_midi_flush();
    for (unsigned t = 0; t < SONG_TRACKS; ++t) decode_track(t, &tbuf[t][0], row, P_SONG);
    decode_rowinfo(&rowset[0], row);
    unsigned next = natural_next(row);
    song_end = next == SONG_NONE && !rowset[0].loop_here;
    if (next != SONG_NONE) {
        for (unsigned t = 0; t < SONG_TRACKS; ++t) decode_track(t, &tbuf[t][1], next, P_SONG);
        decode_rowinfo(&rowset[1], next);
    }
    ext_pos = (uint32_t)steps * UNITS; ext_start_row = row; ext_start_repeat = rep; ext_start_step = step;
    barrier();
    start_request = 1;
    return 0;
}
void song_poll(void)
{
    if (!state) return;
    if (follow_on && ext_prep_request) { ext_prep_request = 0; (void)song_prepare(ext_prep_steps); return; }   /* Task 16 */
    if (follow_on && groove_clock_mode() == GROOVE_CLOCK_INTERNAL && !user_stop) { user_stop = 1; stop_request = 1; }   /* the clock source was switched away */
    if (!playing) {
        if (start_request) return;
        if (follow_on && !user_stop && state == 1) { ext_after_resume = 0; ext_stay_state = EXT_IDLE; (void)song_prepare(0); return; }   /* a follow song ended: arm again */
        leave_song(); return;                                                                /* stopped or ended */
    }
    if (state == 2) return;
    if (edit_refresh) {
        /* Goal 6: the edited clip loops on its track: decode it again into the track's free buffer; the audio thread
         * takes it at the loop's next pass. A track that follows the scenes hears the edit at its next decode. */
        unsigned t = edit_refresh - 1U; struct track *k = &tr[t];
        struct trackbuf *p = &tbuf[t][k->cur], *o = &tbuf[t][k->cur ^ 1U];
        edit_refresh = 0;
        if (k->state == 1 && !k->waiting && queue_kind[t] == Q_NONE && p->ready && p->purpose == P_LAUNCH && p->row == k->row && p->block == edit.block) {
            o->ready = 0; barrier();
            o->fresh = 1;
            decode_track(t, o, k->row, P_LAUNCH);
        }
    }
    /* Each track's free buffer: what it will need next (one block read per decode). */
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        unsigned row, purpose;
        if (!wanted(t, &row, &purpose)) continue;
        struct trackbuf *p = &tbuf[t][tr[t].cur], *o = &tbuf[t][tr[t].cur ^ 1U];
        if (holds(p, row, purpose) && purpose == P_LAUNCH) continue;   /* a relaunch of the pattern still in the playing buffer */
        if (holds(o, row, purpose)) continue;
        if (o->ready && o->fresh) continue;   /* the edited clip waits there for the loop's next pass */
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
/* ---- tabby-v04.10: the song's settings for the click and the count-in (record header bytes 44..46) ----------
 * byte 44: bits 0-1 the click (0 off, 1 while a take is armed or runs, 2 always), bits 2-3 its output (0 internal, 1
 * MIDI, 2 both), bits 4-5 the count-in (0 off, 1, 2 or 4 master cycles as 1, 2, 3); byte 45: the MIDI click's
 * channel + 1 (0: channel 10); byte 46: its note (0: note 37). All zero in a song that was never set: no click. */
static void click_apply(void)
{
    click_out = (uint8_t)song_setting(SONG_SET_CLICK_OUT); click_ch = (uint8_t)song_setting(SONG_SET_CLICK_CH); click_note = (uint8_t)song_setting(SONG_SET_CLICK_NOTE);
    click_level = (uint8_t)song_setting(SONG_SET_CLICK_LEVEL);
}
unsigned song_setting(unsigned which);
/* Does the click sound now: always, or while a take is armed or runs (control task; the audio thread reads click_live). */
static void click_update(void)
{
    unsigned mode = song_setting(SONG_SET_CLICK);
    click_live = state == 1 && (mode == 2 || (mode == 1 && rec.state != REC_OFF));
}
unsigned song_setting(unsigned which)
{
    const uint8_t *r = record.reserved;
    if (loaded == SONG_NONE && which != SONG_SET_CLICK_CH && which != SONG_SET_CLICK_NOTE) return 0;
    switch (which) {
    case SONG_SET_COUNT_IN: { unsigned c = (r[1] >> 4) & 3U; return c == 3 ? 4U : c; }
    case SONG_SET_CLICK: return (r[1] & 3U) > 2 ? 0U : r[1] & 3U;
    case SONG_SET_CLICK_OUT: return ((r[1] >> 2) & 3U) > 2 ? 0U : (r[1] >> 2) & 3U;
    case SONG_SET_CLICK_CH: return r[2] >= 1 && r[2] <= 16 && loaded != SONG_NONE ? r[2] - 1U : 9U;
    case SONG_SET_CLICK_NOTE: return r[3] >= 1 && r[3] <= 127 && loaded != SONG_NONE ? r[3] : 37U;
    /* tabby-v04.14: stored 0 = MID (a song never set), 1 = LOW, 2 = HIGH; returned 0 LOW, 1 MID, 2 HIGH */
    case SONG_SET_CLICK_LEVEL: { unsigned s = loaded != SONG_NONE ? r[1] >> 6 : 0; return s == 1 ? 0U : s == 2 ? 2U : 1U; }
    case SONG_SET_KNOB1: case SONG_SET_KNOB2: case SONG_SET_KNOB3: case SONG_SET_KNOB4: {
        static const uint8_t first[4] = {74, 71, 1, 11};
        unsigned k = which - SONG_SET_KNOB1, s = loaded != SONG_NONE ? record.reserved2[k] : 0;
        return s >= 1 && s <= 128 ? s - 1U : first[k]; }
    default: return 0;
    }
}
int song_setting_edit(unsigned which, int delta)
{
    if (loaded == SONG_NONE || which >= SONG_SETTINGS || !delta) return SONG_INVALID;
    static const uint8_t max[SONG_SETTINGS] = {3, 2, 2, 15, 127, 2, 127, 127, 127, 127}, min[SONG_SETTINGS] = {0, 0, 0, 0, 1};
    uint8_t *r = record.reserved;
    int now = (int)song_setting(which);
    if (which == SONG_SET_COUNT_IN && now == 4) now = 3;
    int v = now + delta; v = v < min[which] ? min[which] : v > max[which] ? max[which] : v;
    if (v == now) return 0;
    if (which == SONG_SET_COUNT_IN) r[1] = (uint8_t)((r[1] & ~0x30U) | (unsigned)v << 4);
    else if (which == SONG_SET_CLICK) r[1] = (uint8_t)((r[1] & ~3U) | (unsigned)v);
    else if (which == SONG_SET_CLICK_OUT) r[1] = (uint8_t)((r[1] & ~0x0cU) | (unsigned)v << 2);
    else if (which == SONG_SET_CLICK_CH) r[2] = (uint8_t)(v + 1);
    else if (which == SONG_SET_CLICK_LEVEL) r[1] = (uint8_t)((r[1] & 0x3fU) | (v == 0 ? 0x40U : v == 2 ? 0x80U : 0U));
    else if (which >= SONG_SET_KNOB1) record.reserved2[which - SONG_SET_KNOB1] = (uint8_t)(v + 1);
    else r[3] = (uint8_t)v;
    click_apply(); song_changed();
    return 0;
}
int song_load(unsigned song)
{
    if (state) return SONG_BUSY;
    if ((song_dirty || (edit.active && edit.dirty)) && loaded != SONG_NONE) (void)song_edit_save();   /* Goal 6: the unsaved clip and song changes belong to the song being left */
    edit.active = 0; edit.dirty = 0; edit.created = 0; song_dirty = 0; scene_hold = 0; reserve_scene = 0;
    loaded = SONG_NONE; memset(reserve_row, SONG_NONE, sizeof reserve_row);
    int r = song_record_read(song, &record);
    if (!r) r = song_directory_build(song);
    last_error = r ? (unsigned)r : 0;
    if (r) return r;
    song_record_expand(&record, &model);   /* Task 17 Goal 3: a version-3 record (scenes) becomes rows; every version gets its clip table */
    cycle_units = (uint32_t)model.cycle * UNITS;
    loaded = song;
    click_apply();
    jump_mode = (record.flags & SONG_FLAG_JUMP_ROW) ? 1U : 0U;
    return 0;
}
unsigned song_loaded(void) { return loaded; }
const struct song_record *song_current(void) { return loaded == SONG_NONE ? NULL : &record; }
const struct song_model *song_model_current(void) { return loaded == SONG_NONE ? NULL : &model; }
int song_play(void)
{
    if (loaded == SONG_NONE) return SONG_EMPTY;
    if (state || song_storage_state() != SONG_STORAGE_READY) return SONG_BUSY;
    unsigned follow = groove_clock_mode() != GROOVE_CLOCK_INTERNAL;   /* Task 16: CLOCK = MIDI arms the song and follows the clock */
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
    ct_midi_flush();   /* Task 12 A4 */
    groove_midi_song_channels(record.channel);   /* before the decodes: the event slices use the channels */
    /* tabby-v04.12: the scene reserved while stopped is where the song starts (internal clock; the MC-707's reserved
     * scene); the reservation is used up */
    unsigned first = follow || reserve_scene >= record.rows ? 0U : reserve_scene;
    reserve_scene = 0;
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        unsigned r = follow ? SONG_NONE : reserve_row[t];
        start_row[t] = (uint8_t)r; reserve_row[t] = SONG_NONE;
        if (r == SONG_NONE) { decode_track(t, &tbuf[t][0], first, P_SONG); continue; }
        decode_track(t, &tbuf[t][0], r, P_LAUNCH);
        start_steps[t] = tbuf[t][0].steps;
    }
    decode_rowinfo(&rowset[0], first);
    unsigned next = natural_next(first);
    song_end = next == SONG_NONE && !rowset[0].loop_here;
    if (next != SONG_NONE) {
        for (unsigned t = 0; t < SONG_TRACKS; ++t) if (start_row[t] == SONG_NONE) decode_track(t, &tbuf[t][1], next, P_SONG);
        decode_rowinfo(&rowset[1], next);
    }
    state = 1;
    if (follow) {
        follow_on = 1; user_stop = 0; ext_after_resume = 0; ext_stay_state = EXT_IDLE; ext_pos = 0;
        ext_start_row = 0; ext_start_repeat = 0; ext_start_step = 0; ext_prep_request = 0;
        ext_period_q8 = tempo_override ? 220500U / tempo_override : 7U * 256U;
        ext_wr = ext_rd = 0; ext_pulses = 0;
    }
    /* tabby-v04.10: a take is armed: the count-in comes first (internal clock only) */
    click_update();
    {
        /* tabby-v04.11: the count-in ends exactly where a block begins, so the song's first beat is one beat after the
         * last click (in tabby-v04.10 the song started with the next block: up to 2.9 ms late; measured 3.1 ms). The
         * blocks the count-in takes are a whole number; what they overshoot is waited before the first click. The
         * count runs from one cycle minus that lead to one cycle plus the count-in. Known tempo only (the song's own). */
        uint32_t want = !follow && rec.state == REC_ARMED ? (uint32_t)song_setting(SONG_SET_COUNT_IN) * cycle_units : 0, lead = 0;
        if (want && tempo_override) {
            uint64_t per = (uint64_t)tempo_override * ADV_MUL, need = (uint64_t)want * ADV_DIV, blocks = (need + per - 1U) / per;
            lead = (uint32_t)(blocks * per / ADV_DIV) - want;
        }
        count_from = cycle_units - lead;
        count_units = want ? want + cycle_units : 0;
    }
    barrier();
    start_request = 1;
    return 0;
}
void song_stop(void)
{
    if (state != 1) return;
    state = 2;
    user_stop = 1;
    stop_request = 1;
}
/* Task 16: the MIDI-in callback (routing task) hands the clock messages of the accepted source to a follow
 * song; returns 1 when the song took the message (the engine's own sequencer must not see it). status 0xf8
 * pulse, 0xfa Start, 0xfb Continue, 0xfc Stop, 0xf2 Song Position Pointer (a = lsb, b = msb). */
int song_clock_in(unsigned status, unsigned a, unsigned b)
{
    if (!follow_on || user_stop) return 0;
    if (status == 0xf8) { ++ext_pulses; return 1; }
    unsigned kind = status == 0xfa ? EXT_MSG_START : status == 0xfb ? EXT_MSG_CONTINUE : status == 0xfc ? EXT_MSG_STOP : status == 0xf2 ? EXT_MSG_SPP : 0U;
    if (!kind) return 0;
    unsigned w = ext_wr;
    if (w - ext_rd >= 8U) return 1;                        /* a flood of transport messages: the ring keeps the oldest */
    ext_ring[w & 7U].arg = (uint16_t)((a & 127U) | (b & 127U) << 7); ext_ring[w & 7U].kind = (uint8_t)kind; ext_ring[w & 7U].pulses = ext_pulses;
    barrier();
    ext_wr = w + 1U;
    return 1;
}
unsigned song_follow_state(void) { return follow_on ? ext_state : 0U; }
int song_queue_jump(unsigned row)
{
    /* tabby-v04.12: stopped: the scene is reserved and PLAY starts there; the reserved scene again takes it back */
    if (!state && loaded != SONG_NONE && row < record.rows) { reserve_scene = (uint8_t)(reserve_scene == row ? 0U : row); return reserve_scene == row ? 0 : SONG_EMPTY; }
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
/* Task 17 Goal 4: launch the track's clip in `place` (0-based, the song's clip table). A clip some scene uses is
 * launched as that scene's pattern (its length and its row events come with it); a clip no scene uses plays as a
 * place row with the clip's own length (a v3 clip's header; 64 steps otherwise). */
int song_clip_launch(unsigned track, unsigned place)
{
    if (state > 1 || loaded == SONG_NONE || track >= SONG_TRACKS || place >= SONG_CLIPS) return SONG_INVALID;
    unsigned id = model.clip[track][place];
    if (!id) return SONG_EMPTY;
    unsigned row = launch_row(track, place);
    if (!state) { reserve_row[track] = (uint8_t)row; return 0; }   /* stopped: reserved, PLAY starts it */
    if (row < SONG_ROWS) return song_track_launch(track, row);
    place_steps[track] = SONG_BLOCK_STEPS;   /* until its buffer is taken: the clip's own length comes with it (frame_set) */
    queue_row[track] = (uint8_t)row;
    barrier();
    queue_kind[track] = Q_LAUNCH;
    return 0;
}
/* Take a queued launch, stop or return back before it lands. 0: taken back; SONG_EMPTY: nothing was queued. */
int song_track_unqueue(unsigned track)
{
    if (state > 1 || track >= SONG_TRACKS) return SONG_INVALID;
    if (!state) { if (reserve_row[track] == SONG_NONE) return SONG_EMPTY; reserve_row[track] = SONG_NONE; return 0; }
    if (queue_kind[track] == Q_NONE) return SONG_EMPTY;
    queue_kind[track] = Q_NONE;
    return 0;
}
void song_mute_set(unsigned mask) { mute_mask = mask & 255U; }
void song_scene_hold_set(unsigned on) { scene_hold = on != 0; }
/* tabby-v04.12: the scene chain's settings. field 0: how many times the scene plays before the next one (1 to 64; its
 * length is steps x that); field 1: what follows it: 0 the next scene, 1 it stays (loop here) until a scene is recalled.
 * The scene that plays takes the change at once. Saved with the song. */
int song_scene_edit(unsigned row, unsigned field, int delta)
{
    if (loaded == SONG_NONE || row >= record.rows || field > 1 || !delta) return SONG_INVALID;
    struct song_row *w = &record.row[row];
    if (field == 0) {
        int v = (int)w->repeat + delta; v = v < 1 ? 1 : v > 64 ? 64 : v;
        if (v == w->repeat) return 0;
        w->repeat = (uint8_t)v;
    } else {
        unsigned want = delta > 0;
        if (((w->flags & SONG_ROW_FLAG_LOOP_HERE) != 0) == want) return 0;
        w->flags = (uint8_t)((w->flags & ~SONG_ROW_FLAG_LOOP_HERE) | (want ? SONG_ROW_FLAG_LOOP_HERE : 0));
    }
    for (unsigned i = 0; i < 2; ++i)
        if (state && rowset[i].ready && rowset[i].row == row) { rowset[i].repeat = w->repeat; rowset[i].loop_here = (w->flags & SONG_ROW_FLAG_LOOP_HERE) != 0; }
    song_changed();
    return 0;
}
unsigned song_scene_reserved(void) { return reserve_scene; }
unsigned song_scene_hold(void) { return scene_hold; }

/* ---- Goal 6: the clip editor (control task) ------------------------------------------------------------------ */
static void edit_swap(uint8_t *a, uint8_t *b)
{ for (unsigned i = 0; i < SONG_PAYLOAD_V3_MAX; ++i) { uint8_t x = a[i]; a[i] = b[i]; b[i] = x; } }
/* Before a change: the state now becomes an undo level (the oldest of four is dropped), redo is gone. */
static void edit_push(void)
{
    if (edit.undo == EDIT_LEVELS) { memmove(edit.slot[0], edit.slot[1], (size_t)(EDIT_LEVELS - 1) * SONG_PAYLOAD_V3_MAX); --edit.undo; }
    memcpy(edit.slot[edit.undo++], edit.clip, SONG_PAYLOAD_V3_MAX);
    edit.redo = 0;
}
static void edit_changed(void)
{
    edit.dirty = 1; edit.changed_ms = fm1_millis(); ++edit.revision;
    edit_refresh = (uint8_t)(1U + edit.track);
}
int song_edit_open(unsigned track, unsigned place)
{
    if (loaded == SONG_NONE || track >= SONG_TRACKS || place >= SONG_CLIPS) return SONG_INVALID;
    unsigned id = model.clip[track][place], bytes, format = SONG_FORMAT_V2;
    if (!id) return SONG_EMPTY;
    if (edit.active && edit.track == track && edit.block == id) { edit.place = (uint8_t)place; return 0; }   /* the same block in another place of the track is the same clip */
    if (edit.active && edit.dirty) return SONG_BUSY;                 /* one unsaved clip at a time */
    for (unsigned t = 0; t < SONG_TRACKS; ++t)
        for (unsigned c = 0; t != track && c < model.clips[t]; ++c) if (model.clip[t][c] == id) return SONG_EDIT_SHARED;
    int e = song_block_read(loaded, id, payload, &bytes, &format);
    if (!e) e = song_payload_valid(format, payload, bytes);
    if (e) return e < 0 ? e : SONG_INVALID;
    edit.active = 0;
    if (format == SONG_FORMAT_V3) memcpy(edit.clip, payload, bytes);
    else {
        /* a grid block becomes an event list: each step's modifier, then its notes */
        if (format == SONG_FORMAT_V1) bytes = song_payload_upgrade(payload, bytes);
        /* tabby-v04.10: with the block's own length (the steps of its first scene); what a block holds past that was
         * never played and is not taken over */
        unsigned own = v2_steps(track, id);
        clip_v3_empty(edit.clip, own > SONG_BLOCK_STEPS ? SONG_BLOCK_STEPS : own);
        for (unsigned step = 0, at = 0; step < SONG_BLOCK_STEPS; ++step) {
            unsigned head = payload[at++], count = head & 7U;
            if (head & 0x78U) (void)clip_v3_step_mod_set(edit.clip, step, ((head >> 3) & 7U) | ((head >> 6) & 1U) << 3);
            for (unsigned i = 0; i < count; ++i, at += NOTE) {
                struct timed_note n; timed_note_unpack(payload + at, &n);
                int32_t time = (int32_t)step * UNITS + n.offset;
                if (time < -HALF) time = -HALF;
                struct clip_v3_event v = { time, CLIP_V3_NOTE, n.pitch, n.velocity, n.retrigger, (uint16_t)(n.length > 65535U ? 65535U : n.length) };
                (void)clip_v3_insert(edit.clip, &v);
            }
        }
    }
    edit.block = (uint16_t)id; edit.track = (uint8_t)track; edit.place = (uint8_t)place;
    edit.undo = edit.redo = 0; edit.dirty = 0; edit.gesture = 0; edit.created = 0; edit.active = 1;
    return 0;
}
/* tabby-v04.10: a new, empty clip in an empty place of the track: one master cycle long, open in the editor and
 * unsaved (it is written, with the song's clip table, at the next save). SONG_BUSY: another clip is unsaved;
 * SONG_INVALID: the place holds a clip; SONG_FULL: no block id is free. */
int song_clip_new(unsigned track, unsigned place)
{
    if (loaded == SONG_NONE || track >= SONG_TRACKS || place >= SONG_CLIPS || model.clip[track][place]) return SONG_INVALID;
    if (edit.active && edit.dirty) return SONG_BUSY;
    unsigned id = 0;
    for (unsigned t = 0; t < SONG_TRACKS; ++t)
        for (unsigned c = 0; c < SONG_CLIPS; ++c) if (model.clip[t][c] > id) id = model.clip[t][c];
    if (id >= 65535U) return SONG_FULL;
    clip_v3_empty(edit.clip, model.cycle > CLIP_V3_STEPS_MAX ? CLIP_V3_STEPS_MAX : model.cycle);
    edit.block = (uint16_t)(id + 1U); edit.track = (uint8_t)track; edit.place = (uint8_t)place;
    edit.undo = edit.redo = 0; edit.gesture = 0; edit.created = 1; edit.active = 1;
    model.clip[track][place] = edit.block;
    if (place >= model.clips[track]) model.clips[track] = (uint8_t)(place + 1U);
    edit_changed(); song_changed();
    return 0;
}
void song_edit_info(struct song_edit_info *out)
{
    memset(out, 0, sizeof *out);
    out->play_step = SONG_NONE;
    if (!edit.active) return;
    out->active = 1; out->track = edit.track; out->place = edit.place; out->dirty = edit.dirty; out->steps = clip_v3_steps(edit.clip);
    out->undo = edit.undo; out->redo = edit.redo; out->block = edit.block; out->revision = edit.revision;
    out->recording = rec.state; out->quantize = rec.quantize; out->events = (uint16_t)clip_v3_count(edit.clip);
    out->created = edit.created;
    const struct track *k = &tr[edit.track];
    if (state == 1 && playing && !k->waiting && k->state != 2) {
        const struct trackbuf *b = &tbuf[edit.track][k->cur];
        uint32_t m = master, s0 = k->start;
        if (b->ready && b->has_block && b->block == edit.block && m >= s0 && !(k->state == 0 && song_over))
            out->play_step = (uint8_t)(((m - s0) / UNITS) % (b->steps ? b->steps : 1U));
    }
}
const uint8_t *song_edit_clip(void) { return edit.active ? edit.clip : NULL; }
int song_edit_note_toggle(unsigned step, unsigned pitch, unsigned velocity, unsigned length)
{
    if (!edit.active || step >= clip_v3_steps(edit.clip) || pitch > 127) return SONG_INVALID;
    int at = clip_v3_note_find(edit.clip, step, pitch);
    if (at >= 0) { edit_push(); clip_v3_remove(edit.clip, (unsigned)at); edit.gesture = 0; edit_changed(); return 0; }
    if (clip_v3_count(edit.clip) >= CLIP_V3_EVENTS_MAX) return SONG_FULL;      /* SPEC 14.2: CLIP FULL, nothing changes */
    struct clip_v3_event v = { (int32_t)step * UNITS, CLIP_V3_NOTE, (uint8_t)pitch, (uint8_t)(velocity < 1 ? 1 : velocity > 127 ? 127 : velocity), 1,
                               (uint16_t)(length < 1 ? 1 : length > 65535U ? 65535U : length) };
    edit_push();
    if (clip_v3_insert(edit.clip, &v) < 0) { --edit.undo; return SONG_INVALID; }
    edit.gesture = 0; edit_changed();
    return 1;
}
int song_edit_step_clear(unsigned step)
{
    uint16_t idx[8];
    if (!edit.active || step >= clip_v3_steps(edit.clip)) return SONG_INVALID;
    unsigned n = clip_v3_step_notes(edit.clip, step, idx, 8);
    if (!n && !clip_v3_step_mod(edit.clip, step)) return SONG_EMPTY;
    edit_push();
    while ((n = clip_v3_step_notes(edit.clip, step, idx, 8)) != 0) clip_v3_remove(edit.clip, idx[0]);
    (void)clip_v3_step_mod_set(edit.clip, step, 0);
    edit.gesture = 0; edit_changed();
    return 0;
}
/* Change note `n` of a step: field 0 velocity, 1 start (units from the step's grid line, -239 .. 240; step 0 from
 * -240), 2 length (units), 3 the step's probability (0 = always .. 7; `n` unused). Clamped to what the step can hold. */
int song_edit_note_adjust(unsigned step, unsigned n, unsigned field, int delta)
{
    uint16_t idx[16];
    if (!edit.active || step >= clip_v3_steps(edit.clip) || field > 3 || !delta) return SONG_INVALID;
    uint32_t gesture = 0x80000000U | step << 16 | n << 8 | field;
    if (field == 3) {
        int now = (int)(clip_v3_step_mod(edit.clip, step) & 7U), want = now + delta;
        want = want < 0 ? 0 : want > 7 ? 7 : want;
        if (want == now) return 0;
        if (!want || clip_v3_count(edit.clip) < CLIP_V3_EVENTS_MAX || now) {
            if (edit.gesture != gesture) edit_push();
            (void)clip_v3_step_mod_set(edit.clip, step, (clip_v3_step_mod(edit.clip, step) & 8U) | (unsigned)want);
            edit.gesture = gesture; edit_changed(); return 0;
        }
        return SONG_FULL;
    }
    unsigned count = clip_v3_step_notes(edit.clip, step, idx, 16);
    if (n >= count || n >= 16) return SONG_EMPTY;
    struct clip_v3_event v, old; clip_v3_event(edit.clip, idx[n], &v); old = v;
    if (field == 0) { int x = (int)v.b + delta; v.b = (uint8_t)(x < 1 ? 1 : x > 127 ? 127 : x); }
    else if (field == 1) {
        int base = (int)step * UNITS, low = step ? -(HALF - 1) : -HALF, x = v.time - base + delta;
        v.time = base + (x < low ? low : x > HALF ? HALF : x);
    } else { int x = (int)v.length + delta; v.length = (uint16_t)(x < 1 ? 1 : x > 65535 ? 65535 : x); }
    if (v.time == old.time && v.b == old.b && v.length == old.length) return 0;
    if (edit.gesture != gesture) edit_push();
    clip_v3_remove(edit.clip, idx[n]);
    if (clip_v3_insert(edit.clip, &v) < 0) (void)clip_v3_insert(edit.clip, &old);
    edit.gesture = gesture; edit_changed();
    return 0;
}
/* tabby-v04.10: the clip's settings (the CLIP SETTING page). The length: 1 to 128 steps; what lies past a shorter end is
 * removed (undo brings it back). One undo level per run of changes of the same setting. Returns what was removed. */
int song_edit_length(int delta)
{
    if (!edit.active || !delta) return SONG_INVALID;
    if (rec.state == REC_ON) return SONG_BUSY;
    int now = (int)clip_v3_steps(edit.clip), want = now + delta;
    want = want < 1 ? 1 : want > CLIP_V3_STEPS_MAX ? CLIP_V3_STEPS_MAX : want;
    if (want == now) return 0;
    if (edit.gesture != 0x40000001U) edit_push();
    int cut = clip_v3_steps_set(edit.clip, (unsigned)want);
    edit.gesture = 0x40000001U; edit_changed();
    return cut;
}
/* tabby-v04.11: the open clip's chain (docs/CLIP-V3.md 2.1): field 0 = next (stay, stop, then the places that hold a
 * clip, in order), 1 = after (0 = the clip's end, 1 to 512 steps), 2 = times (1 to 64). One undo level per run of
 * changes of the same field. */
int song_edit_chain(unsigned field, int delta)
{
    if (!edit.active || field > 2 || !delta) return SONG_INVALID;
    if (rec.state == REC_ON) return SONG_BUSY;
    int next = (int)clip_v3_next(edit.clip), after = (int)clip_v3_after(edit.clip), times = (int)clip_v3_times(edit.clip);
    int was_next = next, was_after = after, was_times = times;
    if (field == 0) {
        for (int n = delta < 0 ? -delta : delta; n > 0; --n) {
            int v = next;
            do { v += delta < 0 ? -1 : 1; } while (v >= CLIP_V3_NEXT_CLIP && v <= CLIP_V3_NEXT_MAX && !model.clip[edit.track][v - CLIP_V3_NEXT_CLIP]);
            if (v < 0 || v > CLIP_V3_NEXT_MAX) break;
            next = v;
        }
    } else if (field == 1) { after += delta; after = after < 0 ? 0 : after > CLIP_V3_AFTER_MAX ? CLIP_V3_AFTER_MAX : after; }
    else { times += delta; times = times < 1 ? 1 : times > CLIP_V3_TIMES_MAX ? CLIP_V3_TIMES_MAX : times; }
    if (next == was_next && after == was_after && times == was_times) return 0;
    if (edit.gesture != (0x40000010U | field)) edit_push();
    (void)clip_v3_chain_set(edit.clip, (unsigned)next, (unsigned)after, (unsigned)times);
    edit.gesture = 0x40000010U | field; edit_changed();
    return 0;
}
/* tabby-v04.13: the open clip's program and bank (its header; sent on the track's channel when the track enters the
 * clip, bank first). field 0 = program (OFF, 1 to 128), 1 = bank MSB (OFF, 0 to 127), 2 = bank LSB (0 to 127, with a
 * bank only). One undo level per run of changes of the same field. */
int song_edit_program(unsigned field, int delta)
{
    if (!edit.active || field > 2 || !delta) return SONG_INVALID;
    if (rec.state == REC_ON) return SONG_BUSY;
    const uint8_t *h = edit.clip;
    int program = h[1] & CLIP_V3_FLAG_PROGRAM ? h[2] : -1, msb = h[1] & CLIP_V3_FLAG_BANK ? h[3] : -1, lsb = h[4];
    int p0 = program, m0 = msb, l0 = lsb;
    if (field == 0) { program += delta; program = program < -1 ? -1 : program > 127 ? 127 : program; }
    else if (field == 1) { msb += delta; msb = msb < -1 ? -1 : msb > 127 ? 127 : msb; if (msb < 0) lsb = 0; }
    else { if (msb < 0) return SONG_EMPTY; lsb += delta; lsb = lsb < 0 ? 0 : lsb > 127 ? 127 : lsb; }
    if (program == p0 && msb == m0 && lsb == l0) return 0;
    if (edit.gesture != (0x40000020U | field)) edit_push();
    (void)clip_v3_program_set(edit.clip, program < 0 ? 255U : (unsigned)program, msb < 0 ? 255U : (unsigned)msb, (unsigned)lsb);
    edit.gesture = 0x40000020U | field; edit_changed();
    return 0;
}
/* A copy of the track's clip in `from` as a new clip in the empty place `to`: it is the open clip, unsaved, and is
 * written with the song at the next save. SONG_BUSY: a clip is unsaved; SONG_EMPTY: no clip in `from`; SONG_INVALID:
 * `to` holds a clip. */
int song_clip_copy(unsigned track, unsigned from, unsigned to)
{
    if (loaded == SONG_NONE || track >= SONG_TRACKS || from >= SONG_CLIPS || to >= SONG_CLIPS || model.clip[track][to]) return SONG_INVALID;
    if (!model.clip[track][from]) return SONG_EMPTY;
    if (edit.active && edit.dirty) return SONG_BUSY;
    unsigned id = 0;
    for (unsigned t = 0; t < SONG_TRACKS; ++t)
        for (unsigned c = 0; c < SONG_CLIPS; ++c) if (model.clip[t][c] > id) id = model.clip[t][c];
    if (id >= 65535U) return SONG_FULL;
    edit.active = 0;
    int r = song_edit_open(track, from);
    if (r && r != SONG_EDIT_SHARED) return r;
    if (r == SONG_EDIT_SHARED) return r;
    edit.block = (uint16_t)(id + 1U); edit.place = (uint8_t)to; edit.created = 1;
    model.clip[track][to] = edit.block;
    if (to >= model.clips[track]) model.clips[track] = (uint8_t)(to + 1U);
    edit_changed(); song_changed();
    return 0;
}
/* Store what plays now as a new scene after the last one: per track the clip it plays (launched, or the scene's), none
 * for a stopped or silent track. The scene is as long as its longest clip (in whole bars), repeats until another is
 * recalled (loop here), and its clips keep their own lengths (SONG_ROW_FLAG_OWN). Returns the scene's index, or
 * SONG_INVALID (not playing), SONG_FULL (128 scenes). Written with the song at the next save. */
int song_scene_store(void)
{
    if (state != 1 || !playing || loaded == SONG_NONE) return SONG_INVALID;
    if (record.rows >= SONG_ROWS) return SONG_FULL;
    unsigned n = record.rows, longest = 0;
    struct song_row *w = &record.row[n];
    memset(w, 0, sizeof *w); memset(model.scene_clip[n], 0, sizeof model.scene_clip[n]);
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        const struct track *k = &tr[t];
        unsigned row = k->state == 1 ? k->row : k->state == 0 && !song_over ? rowset[cur].row : SONG_NONE;
        unsigned place = song_row_place(t, row);
        if (place == SONG_NONE || !model.clip[t][place]) continue;
        w->block[t] = model.clip[t][place]; model.scene_clip[n][t] = (uint8_t)(place + 1U);
        const struct trackbuf *b = &tbuf[t][k->cur];
        unsigned steps = !k->waiting && b->ready && b->steps ? b->steps : 16U;
        if (steps > longest) longest = steps;
    }
    longest = (longest + 15U) / 16U * 16U;
    w->steps = (uint8_t)(longest < 16 ? 16 : longest > SONG_ROW_STEPS_MAX ? SONG_ROW_STEPS_MAX : longest);
    w->repeat = 1; w->flags = SONG_ROW_FLAG_LOOP_HERE | SONG_ROW_FLAG_OWN;
    record.rows = (uint8_t)(n + 1U);
    song_changed();
    return (int)n;
}
int song_edit_undo(void)
{
    if (rec.state == REC_ON) return SONG_BUSY;                       /* not during a take (as on the MC-707) */
    if (!edit.active || !edit.undo) return SONG_EMPTY;
    edit_swap(edit.clip, edit.slot[--edit.undo]); ++edit.redo;
    edit.gesture = 0; edit_changed();
    return 0;
}
int song_edit_redo(void)
{
    if (rec.state == REC_ON) return SONG_BUSY;
    if (!edit.active || !edit.redo) return SONG_EMPTY;
    edit_swap(edit.clip, edit.slot[edit.undo++]); --edit.redo;
    edit.gesture = 0; edit_changed();
    return 0;
}
/* Write the edited clip to song storage under its block id (a v3 block; the newest record of an id is the block).
 * Only while every transport is stopped (SPEC 15.4): SONG_BUSY otherwise. */
int song_edit_save(void)
{
    unsigned clip = edit.active && edit.dirty;
    if (!clip && !song_dirty) return 0;
    if (ct_transport_running() || state) return SONG_BUSY;
    if (clip) {
        int r = song_block_append(loaded, edit.block, SONG_FORMAT_V3, edit.clip, clip_v3_bytes(edit.clip));
        if (!r) r = song_directory_build(loaded);
        if (r) return r;
        edit.dirty = 0; edit.created = 0;
    }
    if (song_dirty) {   /* tabby-v04.10: after the clip, so that the record never names a block that is not stored */
        int r = song_record_write_model(loaded, &record, &model);
        if (r) return r;
        song_dirty = 0;
    }
    return 0;
}
unsigned song_unsaved(void) { return song_dirty || (edit.active && edit.dirty); }
/* Give the edit up: the stored clip plays again. */
void song_edit_discard(void)
{
    rec.state = REC_OFF;
    if (!edit.active) return;
    unsigned was = edit.dirty;
    if (edit.created) {
        /* a clip made on the device and never saved goes out of the song again: its place, and the scenes that took it */
        for (unsigned r = 0; r < record.rows; ++r)
            if (model.scene_clip[r][edit.track] == edit.place + 1U) { model.scene_clip[r][edit.track] = 0; record.row[r].block[edit.track] = 0; }
        model.clip[edit.track][edit.place] = 0;
        while (model.clips[edit.track] && !model.clip[edit.track][model.clips[edit.track] - 1U]) --model.clips[edit.track];
        if (reserve_row[edit.track] == SONG_ROWS + edit.place) reserve_row[edit.track] = SONG_NONE;
        edit.created = 0;
    }
    edit.active = 0; edit.dirty = 0; edit.undo = edit.redo = 0;
    if (was) edit_refresh = (uint8_t)(1U + edit.track);
}
/* ---- the recorder (control task, except song_record_in) ---------------------------------------------------- */
/* A channel voice message arrived: source 0 the panel (keys, pads, wheels, pedal; control task), 1 MIDI in (the
 * SDK's MIDI task). Stamped here; one writer per queue. */
void song_record_in(unsigned source, unsigned status, unsigned a, unsigned b)
{
    if (rec.state != REC_ON || source > 1 || status < 0x80 || status >= 0xf0) return;
    unsigned w = rec_wr[source], next = (w + 1U) % REC_QUEUE;
    if (next == rec_rd[source]) return;                              /* full: the event is not recorded */
    struct rec_event *e = &rec_queue[source][w];
    e->status = (uint8_t)status; e->a = (uint8_t)a; e->b = (uint8_t)b; e->ticks = ct_diag_ticks();
    barrier();
    rec_wr[source] = (uint8_t)next;
}
/* The master position (units) at TIMER4 time `ticks`, from the block the audio thread published last. */
static uint32_t rec_units_at(uint32_t ticks)
{
    uint32_t m, t, adv, seq;
    do { seq = rec_block_seq; m = rec_block_master; t = rec_block_ticks; adv = rec_block_adv; } while (seq != rec_block_seq || (seq & 1U));
    int32_t d = (int32_t)(ticks - t);
    if (d > 3 * REC_TICKS_PER_BLOCK) d = 3 * REC_TICKS_PER_BLOCK;      /* the host has no TIMER4: block resolution */
    if (d < -16 * REC_TICKS_PER_BLOCK) d = -16 * REC_TICKS_PER_BLOCK;
    int32_t u = (int32_t)(((int64_t)d * (int64_t)adv) / REC_TICKS_PER_BLOCK);
    /* tabby-v04.10: what the player hears is one block behind the master position while the MIDI out runs with its
     * one-block look-ahead (app/midi_router.c, F + G): a key played on a note that sounds is one block later in master
     * time than the note. The take is placed where it was heard (measured: unquantized takes played back 3 ms late). */
    if (groove_midi_live()) u -= (int32_t)adv;
    return (uint32_t)((int32_t)m + u);
}
/* Does the recording track play the open clip as a launched loop now? */
static unsigned rec_track_plays(void)
{
    const struct track *k = &tr[edit.track];
    const struct trackbuf *b = &tbuf[edit.track][k->cur];
    return state == 1 && playing && edit.active && k->state == 1 && !k->waiting && b->ready && b->has_block && b->block == edit.block;
}
/* A master time as a time in the clip (units from its start; the last 240 units count as "just before the start"
 * when the editor shows the whole clip, so that every time is one the format can hold). */
static int32_t rec_clip_time(uint32_t units, unsigned quantize)
{
    const struct track *k = &tr[edit.track];
    int32_t len = (int32_t)clip_v3_steps(edit.clip) * UNITS, p = (int32_t)(units - k->start) % len;
    if (p < 0) p += len;
    if (quantize) { p = (p + UNITS / 2) / UNITS * UNITS; if (p >= len) p = 0; }
    if (p > len - HALF) p -= len;
    return p;
}
static unsigned rec_held_count(void)
{ unsigned n = 0; for (unsigned i = 0; i < REC_HELD; ++i) n += rec.held[i].used; return n; }
static void rec_full(void) { rec.full = 1; rec.state = REC_OFF; }
/* Write one event of the take. */
static int rec_write(const struct clip_v3_event *v)
{
    int r = clip_v3_insert(edit.clip, v);
    if (r == CLIP_V3_DUPLICATE && v->kind == CLIP_V3_NOTE) {         /* the same pitch on the same step: the new one replaces it */
        int old = clip_v3_note_find(edit.clip, clip_v3_anchor(v->time), v->a);
        if (old >= 0) { clip_v3_remove(edit.clip, (unsigned)old); r = clip_v3_insert(edit.clip, v); }
    }
    if (r >= 0) { rec.taken = 1; edit_changed(); }
    return r;
}
static void rec_note_off(unsigned i, uint32_t units)
{
    uint32_t length = units - rec.held[i].at;
    if ((int32_t)length < 1) length = 1;
    if (length > 65535U) length = 65535U;
    struct clip_v3_event v = { rec.held[i].time, CLIP_V3_NOTE, rec.held[i].pitch, rec.held[i].velocity, 1, (uint16_t)length };
    rec.held[i].used = 0;
    (void)rec_write(&v);                 /* its place was reserved at the note-on */
}
static void rec_controller_write(unsigned c, int32_t time, unsigned value, uint32_t units)
{
    rec.ctl[c].has_pending = 0;
    if (rec.ctl[c].has_last && rec.ctl[c].last == value) return;       /* equal to the last written value: not written */
    if (clip_v3_count(edit.clip) + rec_held_count() >= CLIP_V3_EVENTS_MAX) { rec_full(); return; }
    unsigned kind = rec.ctl[c].kind;
    struct clip_v3_event v = { time, (uint8_t)kind, (uint8_t)(kind == CLIP_V3_CC ? rec.ctl[c].number : kind == CLIP_V3_BEND ? (value & 127U) : value),
                               (uint8_t)(kind == CLIP_V3_CC ? value : kind == CLIP_V3_BEND ? value >> 7 : 0), 0, 0 };
    (void)rec_write(&v);
    rec.ctl[c].last = (uint16_t)value; rec.ctl[c].has_last = 1; rec.ctl[c].last_at = units;
}
/* One drained event at master time `units`. */
static void rec_event(const struct rec_event *e, uint32_t units)
{
    unsigned type = e->status & 0xf0U;
    if ((e->status & 15U) != groove_midi_input_channel(edit.track)) return;
    if (type == 0x90 && e->b) {
        for (unsigned i = 0; i < REC_HELD; ++i) if (rec.held[i].used && rec.held[i].pitch == e->a) rec_note_off(i, units);   /* the same key again */
        /* SPEC 14.2: a new event is accepted only while the clip's events plus the held notes are below the cap */
        if (clip_v3_count(edit.clip) + rec_held_count() >= CLIP_V3_EVENTS_MAX) { rec_full(); return; }
        for (unsigned i = 0; i < REC_HELD; ++i) if (!rec.held[i].used) {
            rec.held[i].used = 1; rec.held[i].pitch = e->a; rec.held[i].velocity = e->b; rec.held[i].at = units;
            rec.held[i].time = rec_clip_time(units, rec.quantize);
            return;
        }
        return;                                                      /* more than 16 keys down: not recorded */
    }
    if (type == 0x80 || type == 0x90) {
        for (unsigned i = 0; i < REC_HELD; ++i) if (rec.held[i].used && rec.held[i].pitch == e->a) { rec_note_off(i, units); return; }
        return;
    }
    unsigned kind = type == 0xb0 ? CLIP_V3_CC : type == 0xe0 ? CLIP_V3_BEND : type == 0xd0 ? CLIP_V3_PRESSURE : 0;
    if (!kind || (kind == CLIP_V3_CC && e->a >= 120)) return;        /* poly aftertouch and channel mode messages are not recorded */
    unsigned number = kind == CLIP_V3_CC ? e->a : 0, c = REC_CONTROLLERS, idle = REC_CONTROLLERS;
    unsigned value = kind == CLIP_V3_CC ? e->b : kind == CLIP_V3_BEND ? (unsigned)e->a | (unsigned)e->b << 7 : e->a;
    for (unsigned i = 0; i < REC_CONTROLLERS; ++i) {
        if (rec.ctl[i].used && rec.ctl[i].kind == kind && rec.ctl[i].number == number) { c = i; break; }
        if (!rec.ctl[i].used) { if (idle == REC_CONTROLLERS || rec.ctl[idle].used) idle = i; }
        else if (!rec.ctl[i].has_pending && idle == REC_CONTROLLERS) idle = i;
    }
    if (c == REC_CONTROLLERS) {
        if (idle == REC_CONTROLLERS) return;                         /* nine controllers moving at once: the ninth is not recorded */
        c = idle; memset(&rec.ctl[c], 0, sizeof rec.ctl[c]); rec.ctl[c].used = 1; rec.ctl[c].kind = (uint8_t)kind; rec.ctl[c].number = (uint8_t)number;
    }
    rec.ctl[c].seen_at = units;
    /* SPEC 14.2: written only when 240 units have passed since the last written value of this controller; inside that
     * window one pending value, replaced by each newer one */
    if (!rec.ctl[c].has_last || units - rec.ctl[c].last_at >= (uint32_t)HALF) rec_controller_write(c, rec_clip_time(units, 0), value, units);
    else { rec.ctl[c].pending = (uint16_t)value; rec.ctl[c].has_pending = 1; rec.ctl[c].pending_time = rec_clip_time(units, 0); }
}
/* The end of a gesture, or of the take: a pending value is written at the time it arrived. */
static void rec_flush(unsigned c, uint32_t units)
{
    if (!rec.ctl[c].used || !rec.ctl[c].has_pending) return;
    rec_controller_write(c, rec.ctl[c].pending_time, rec.ctl[c].pending, units);
}
static void rec_end(uint32_t units)
{
    for (unsigned i = 0; i < REC_HELD; ++i) if (rec.held[i].used) rec_note_off(i, units);
    for (unsigned c = 0; c < REC_CONTROLLERS; ++c) rec_flush(c, units);
    if (!rec.taken && edit.undo) --edit.undo;                        /* an empty take leaves no undo level */
    rec.state = REC_OFF;
}
/* REC: start a take into the open clip. The clip must loop on its track: it is launched if it does not (reserved when
 * the song is stopped, and PLAY then starts both). Returns REC_ON, REC_ARMED, or a negative code. */
int song_record_start(void)
{
    if (!edit.active) return SONG_INVALID;
    if (rec.state) return rec.state;
    memset(rec.held, 0, sizeof rec.held); memset(rec.ctl, 0, sizeof rec.ctl);
    rec.full = 0; rec.taken = 0; rec_rd[0] = rec_wr[0]; rec_rd[1] = rec_wr[1];
    if (!rec_track_plays()) {
        int r = song_clip_launch(edit.track, edit.place);
        if (r) return r < 0 ? r : SONG_INVALID;
    }
    rec.state = REC_ARMED;
    return rec.state;
}
void song_record_stop(void)
{
    if (rec.state == REC_ON) rec_end(rec_units_at(ct_diag_ticks()));
    rec.state = REC_OFF;
}
void song_record_quantize(unsigned on) { rec.quantize = on != 0; }
unsigned song_record_full(void) { unsigned f = rec.full; rec.full = 0; return f; }
/* Control task, every pass. */
void song_record_poll(void)
{
    if (rec.state == REC_OFF) return;
    if (!edit.active) { rec.state = REC_OFF; return; }
    if (rec.state == REC_ARMED) {
        if (!rec_track_plays()) return;
        edit_push(); edit.gesture = 0;                               /* the take is one undo level: undo gives the clip before it */
        rec_rd[0] = rec_wr[0]; rec_rd[1] = rec_wr[1];
        rec.taken = 0; rec.state = REC_ON;
        return;
    }
    uint32_t now = rec_units_at(ct_diag_ticks());
    if (!rec_track_plays()) { rec_end(now); return; }                /* the song stopped, or the track left the clip */
    for (unsigned q = 0; q < 2 && rec.state == REC_ON; ++q)
        while (rec_rd[q] != rec_wr[q] && rec.state == REC_ON) {
            struct rec_event e = rec_queue[q][rec_rd[q]];
            rec_rd[q] = (uint8_t)((rec_rd[q] + 1U) % REC_QUEUE);
            rec_event(&e, rec_units_at(e.ticks));
        }
    if (rec.state != REC_ON) {                                       /* the cap: held notes keep their places and are written at once */
        for (unsigned i = 0; i < REC_HELD; ++i) if (rec.held[i].used) rec_note_off(i, now);
        return;
    }
    /* a gesture ends when its controller has been still for one step (480 units) */
    for (unsigned c = 0; c < REC_CONTROLLERS; ++c)
        if (rec.ctl[c].used && rec.ctl[c].has_pending && now - rec.ctl[c].seen_at >= (uint32_t)UNITS) rec_flush(c, now);
}

/* Control task, every pass: an unsaved clip is written once the transport has been stopped and the clip untouched for
 * ten seconds (the assessment's F: never while playing). Returns 1 when it saved now. */
int song_edit_poll(void)
{
    song_record_poll();
    click_update();   /* tabby-v04.10 */
    unsigned clip = edit.active && edit.dirty, now = fm1_millis();
    if ((!clip && !song_dirty) || state) return 0;
    if ((clip && now - edit.changed_ms < 10000U) || (song_dirty && now - song_changed_ms < 10000U)) return 0;
    if (ct_transport_running() || song_storage_state() != SONG_STORAGE_READY) return 0;
    return song_edit_save() == 0;
}
/* The clip place (0-based) behind a status row of a track, SONG_NONE when there is none. */
unsigned song_row_place(unsigned track, unsigned row)
{
    if (track >= SONG_TRACKS || row == SONG_NONE) return SONG_NONE;
    if (row >= SONG_ROWS) return row - SONG_ROWS < SONG_CLIPS ? row - SONG_ROWS : SONG_NONE;
    return model.scene_clip[row][track] ? model.scene_clip[row][track] - 1U : SONG_NONE;
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
    out->queued = (uint8_t)(!state && reserve_scene && reserve_scene < record.rows ? reserve_scene : jump_row);   /* tabby-v04.12: stopped: the reserved start scene */
    out->jump_mode = (uint8_t)jump_mode;
    out->song_over = (uint8_t)song_over;
    out->error = (uint8_t)last_error;
    out->underruns = (uint16_t)underruns;
    out->late = (uint16_t)late_count;
    out->follow = (uint8_t)(follow_on ? ext_state : 0U);   /* Task 16: EXT_* (song.h) */
    { uint32_t cu = count_units, cp = count_pos; out->count_in = (uint8_t)(start_request && cu > cp ? (cu - cp + 4U * UNITS - 1U) / (4U * UNITS) : 0U); }   /* tabby-v04.10: beats of the count-in left */
    out->events = (uint16_t)(loaded == SONG_NONE ? 0 : song_event_count(&record));
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        const struct track *k = &tr[t];
        unsigned qk = queue_kind[t];
        /* tabby-v04.9.2: a stopped song has no launched or stopped tracks and plays no clip. Until then the last
         * performance's track states stayed in the status after the stop: the CLIPS page kept a launched clip's pad
         * green, and a press on it (meant to reserve it) did nothing. Found by the device tests. */
        unsigned ks = state ? k->state : 0U;
        out->track_state[t] = (uint8_t)(ks | qk << 2 | (state && k->waiting ? 16U : 0U));
        out->track_row[t] = (uint8_t)(!state ? SONG_NONE : ks == 1 ? k->row : ks == 0 && !song_over ? rowset[cur].row : SONG_NONE);
        out->track_queued[t] = (uint8_t)(qk == Q_LAUNCH ? queue_row[t] : qk == Q_ATTACH ? out->row : SONG_NONE);
        /* tabby-v04.11: where the launched clip's chain leads: a row, 254 = stop, SONG_NONE = no chain */
        { const struct trackbuf *b = &tbuf[t][k->cur];
          out->track_chain[t] = (uint8_t)(state && ks == 1 && !k->waiting && b->ready && b->chain_next ? (b->chain_next == 1 ? 254U : b->chain_row) : SONG_NONE); }
        if (!state && reserve_row[t] != SONG_NONE) {   /* stopped with a clip reserved: shown as a queued launch */
            out->track_state[t] = (uint8_t)(Q_LAUNCH << 2); out->track_queued[t] = reserve_row[t];
        }
    }
}

/* Task 12 A1/A3: the transport test for every flash-write path (song.h). The stock sequencer's
 * state comes from the same view the screen reads (track 0; the transport is global). */
unsigned ct_transport_running(void)
{
    struct groove_view v;
    if (song_playing()) return 1;
    groove_get_view(0, 0, &v);
    return v.playing != 0;
}
