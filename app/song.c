/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/song.c — Classic Tabby song sequencer (Task 03, checkpoint d)
 *
 * Purpose
 *   Row playback for song mode. Two RAM row buffers hold the decoded blocks of the
 *   current and the next row (8 tracks × 64 steps × 13 bytes each). The control task
 *   (song_poll) decodes one row ahead from song storage, so the audio thread never
 *   waits on flash; the audio tick (song_tick, called once per 128-frame block from the
 *   router's clock hook) advances 16th steps from the tempo, applies the project swing,
 *   starts and releases notes and swaps buffers at row boundaries, bar boundaries
 *   (queued jumps in bar mode) and the end of the song.
 *
 *   Notes go through app/midi_router.c under the song owner (groove_midi_song_note):
 *   MIDI out gets stock timing, the internal engine gets the same notes through the
 *   control-task MIDI-in queue (FM6 preview), and the router's held-note maps release
 *   everything on the right channel when the song's output-channel override starts or
 *   ends (groove_midi_song_channels).
 *
 *   Shared state between the two threads is written on one side only:
 *     control -> audio: start_request, stop_request, jump_row, jump_mode, song_end,
 *                       swing, tempo override, buffer contents then buffer.ready
 *     audio -> control: playing, cur (current buffer index), pos, repeat, underruns,
 *                       buffer.ready = 0 after a swap
 *   Each buffer is filled by control only while its ready flag is 0 and read by audio
 *   only while it is 1 (the current buffer keeps ready = 1 until it is swapped out).
 *
 *   Known limits (v1): internal clock only (song mode refuses to start in MIDI clock
 *   mode); the alt-tuning bit of a step is stored but not applied by the device.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-02  Initial version.
 */
#include "song.h"
#include "instrument.h"
#include <string.h>

enum { CELL = 1 + 3 * SONG_NOTES_PER_STEP }; /* step header + 4 notes × (pitch, velocity, length) */
struct rowbuf {
    uint8_t cell[SONG_TRACKS][SONG_BLOCK_STEPS][CELL];
    uint8_t row, steps, repeat, loop_here;
    volatile uint8_t ready;
};
static struct rowbuf buffers[2];
static struct song_record record;
static unsigned loaded = SONG_NONE, state, last_error; /* state: 0 stopped, 1 playing, 2 stopping */
static uint8_t payload[SONG_PAYLOAD_MAX];
/* control -> audio */
static volatile unsigned start_request, stop_request, jump_row = SONG_NONE, jump_mode, song_end, swing, tempo_override;
/* audio -> control */
static volatile unsigned playing, cur, pos, repeat, underruns;
/* audio only */
static struct { uint8_t pitch, remaining; } sounding[SONG_TRACKS][SONG_SOUNDING_MAX];
static uint8_t sounding_count[SONG_TRACKS];
static uint32_t phase, rnd = 0x2545f491U;

static FM1_AUDIO_CODE void barrier(void)
{
#ifndef FM1_HOST_TEST
    __asm__ volatile("csync" ::: "memory");
#endif
}
/* ---- audio thread ------------------------------------------------------------------ */
static FM1_AUDIO_CODE void note_off(unsigned t, unsigned i)
{
    groove_midi_song_note(t, sounding[t][i].pitch, 0);
    sounding[t][i] = sounding[t][--sounding_count[t]];
}
static FM1_AUDIO_CODE void release_all(void)
{
    for (unsigned t = 0; t < SONG_TRACKS; ++t) while (sounding_count[t]) note_off(t, 0);
}
static FM1_AUDIO_CODE void play_step(void)
{
    const struct rowbuf *b = &buffers[cur];
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        const uint8_t *c = b->cell[t][pos];
        unsigned count = c[0] & 7U, probability = (c[0] >> 3) & 7U;
        if (!count) continue;
        if (probability) {
            rnd = rnd * 1103515245U + 12345U;
            if (((rnd >> 16) & 7U) >= probability) continue;
        }
        for (unsigned n = 0; n < count; ++n) {
            unsigned pitch = c[1 + 3 * n], velocity = c[2 + 3 * n] & 127U, retrigger = c[2 + 3 * n] & 128U,
                     length = c[3 + 3 * n], found = SONG_SOUNDING_MAX;
            for (unsigned i = 0; i < sounding_count[t]; ++i) if (sounding[t][i].pitch == pitch) found = i;
            if (found != SONG_SOUNDING_MAX) {
                if (!retrigger) { sounding[t][found].remaining = (uint8_t)length; continue; } /* legato */
                note_off(t, found);
            }
            if (sounding_count[t] == SONG_SOUNDING_MAX) note_off(t, 0); /* steal the oldest slot */
            sounding[t][sounding_count[t]].pitch = (uint8_t)pitch;
            sounding[t][sounding_count[t]++].remaining = (uint8_t)length;
            groove_midi_song_note(t, pitch, velocity);
        }
    }
}
static FM1_AUDIO_CODE void switch_row(void)
{
    buffers[cur].ready = 0;
    barrier();
    cur ^= 1U; pos = 0; repeat = 0;
    if (jump_row == buffers[cur].row) jump_row = SONG_NONE;
}
static FM1_AUDIO_CODE void stop_now(void)
{
    release_all();
    playing = 0;
    groove_midi_transport(0, 0xfc);
}
static FM1_AUDIO_CODE void advance(void)
{
    for (unsigned t = 0; t < SONG_TRACKS; ++t)
        for (unsigned i = sounding_count[t]; i-- > 0;)
            if (--sounding[t][i].remaining == 0) note_off(t, i);
    const struct rowbuf *b = &buffers[cur], *n = &buffers[cur ^ 1U];
    ++pos;
    unsigned bar = (pos & 15U) == 0, row_end = pos >= b->steps;
    if (row_end) { pos = 0; ++repeat; }
    unsigned target = jump_row;
    if (target != SONG_NONE && n->ready && n->row == target && (jump_mode ? row_end : bar)) switch_row();
    else if (row_end) {
        unsigned stay = repeat < b->repeat || (b->loop_here && (target == SONG_NONE || !n->ready));
        if (!stay) {
            if (n->ready) switch_row();
            else if (song_end) { stop_now(); return; }
            else { ++underruns; repeat = 0; } /* replay: the next row was not decoded in time */
        }
    }
    play_step();
}
FM1_AUDIO_CODE unsigned song_tempo(void) { return playing ? tempo_override : 0; }
FM1_AUDIO_CODE void song_tick(unsigned tempo)
{
    if (start_request) {
        start_request = 0;
        memset(sounding_count, 0, sizeof sounding_count);
        phase = 0; pos = 0; repeat = 0;
        playing = 1;
        groove_midi_transport(0, 0xfa);
        play_step();
        return;
    }
    if (!playing) return;
    if (stop_request) { stop_request = 0; stop_now(); return; }
    /* One 16th = FM1_SAMPLE_RATE * 60 / (4 * tempo) frames; the phase counts
     * tempo * 4 * frames so the period is a constant. Swing (0..50 %) lengthens the
     * even steps and shortens the odd ones by the same share of a step. */
    enum { PERIOD = FM1_SAMPLE_RATE * 60U / 100U };
    phase += tempo * (FM1_BLOCK_FRAMES * 4U);
    unsigned period = PERIOD * ((pos & 1U) ? 100U - swing : 100U + swing);
    if (phase < period) return;
    phase -= period;
    advance();
}
/* ---- control task ------------------------------------------------------------------ */
void song_init(void)
{
    memset(buffers, 0, sizeof buffers);
    loaded = SONG_NONE; state = 0; last_error = 0;
    start_request = stop_request = playing = cur = pos = repeat = underruns = 0;
    jump_row = SONG_NONE; jump_mode = song_end = swing = tempo_override = 0;
    memset(sounding_count, 0, sizeof sounding_count);
}
static unsigned natural_next(unsigned row)
{
    if (record.row[row].flags & SONG_ROW_FLAG_LOOP_HERE) return SONG_NONE;
    if (row + 1U < record.rows) return row + 1U;
    return (record.flags & SONG_FLAG_LOOP) ? record.loop_row : SONG_NONE;
}
/* Decode one row into a buffer that the audio thread is not reading (ready == 0). */
static void decode_row(struct rowbuf *b, unsigned row)
{
    const struct song_row *r = &record.row[row];
    b->row = (uint8_t)row; b->steps = r->steps ? r->steps : SONG_BLOCK_STEPS;
    b->repeat = r->repeat; b->loop_here = r->flags & SONG_ROW_FLAG_LOOP_HERE;
    for (unsigned t = 0; t < SONG_TRACKS; ++t) {
        memset(b->cell[t], 0, sizeof b->cell[t]);
        unsigned id = r->block[t], bytes;
        if (!id) continue;
        int e = song_block_read(loaded, id, payload, &bytes);
        if (!e) e = song_payload_valid(payload, bytes);
        if (e) { last_error = (unsigned)e; continue; } /* a missing or bad block plays silent */
        for (unsigned step = 0, at = 0; step < SONG_BLOCK_STEPS; ++step) {
            unsigned count = payload[at] & 7U;
            memcpy(b->cell[t][step], payload + at, 1 + 3 * count);
            at += 1 + 3 * count;
        }
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
    swing = groove_sequence_setting(0);
    if (swing > 50) swing = 50;
    tempo_override = record.tempo;
    buffers[0].ready = buffers[1].ready = 0;
    cur = 0; jump_row = SONG_NONE; underruns = 0;
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
void song_status_read(struct song_status *out)
{
    memset(out, 0, sizeof *out);
    out->song = (uint8_t)loaded;
    out->playing = (uint8_t)state;
    out->row = buffers[cur].row; out->repeat = (uint8_t)repeat; out->step = (uint8_t)pos;
    out->next_row = buffers[cur ^ 1U].ready ? buffers[cur ^ 1U].row : SONG_NONE;
    out->queued = (uint8_t)jump_row;
    out->jump_mode = (uint8_t)jump_mode;
    out->error = (uint8_t)last_error;
    out->underruns = (uint16_t)underruns;
}
