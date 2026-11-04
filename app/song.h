/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/song.h — Classic Tabby song sequencer (Task 03, checkpoint d)
 *
 * Purpose
 *   Plays a song (docs/tasks/TASK-03-step1-assessment.md section 9) from RAM row buffers:
 *   the control task decodes one row ahead from song storage, an audio-thread tick
 *   hooked into the per-block clock callback (app/midi_router.c groove_midi_clock) steps
 *   through the current row and sends notes through the router under the song owner, so
 *   MIDI out keeps the stock pattern-sequencer timing and the internal engine (FM6 and
 *   the others) gets the same notes through the control-task MIDI-in queue.
 *
 *   Transport: song mode owns PLAY while a song plays; the stock pattern sequencer stays
 *   stopped (its transport is never started by song mode). Internal clock only (v1).
 *
 * Version: 0.3
 *
 * Revision log
 *   v0.3  2026-11-04  Task 06: per-track playheads (9.13): launch / stop / back-to-song
 *                     queues, per-track status, bar counter, song_over.
 *   v0.2  2026-11-02  Task 04: row events (9.11): the event stream per row buffer, pre-fired
 *                     gaps, the late counter, SEND SETUP, status fields.
 *   v0.1  2026-11-02  Initial version.
 */
#ifndef CT_SONG_H
#define CT_SONG_H
#include "song_storage.h"
#include "fm1.h"

enum { SONG_NONE = 255, SONG_SOUNDING_MAX = 16 };
/* Task 06 (9.13): a track follows the song (0), loops a launched pattern (1) or is stopped
 * (2); a queue lands on the next bar: launch a pattern, stop, back to song. */
enum { SONG_TRACK_FOLLOW = 0, SONG_TRACK_LAUNCHED = 1, SONG_TRACK_STOPPED = 2 };
enum { SONG_QUEUE_NONE = 0, SONG_QUEUE_LAUNCH = 1, SONG_QUEUE_STOP = 2, SONG_QUEUE_ATTACH = 3 };
/* Playback status for the screen and the workbench (control task snapshot). */
struct song_status {
    uint8_t song;        /* loaded song or SONG_NONE */
    uint8_t playing;     /* 0 stopped, 1 playing, 2 stopping (notes releasing) */
    uint8_t row, repeat, step;   /* current position (valid while playing) */
    uint8_t next_row;    /* row decoded as next, SONG_NONE at the end / loop-here */
    uint8_t queued;      /* queued jump target or SONG_NONE */
    uint8_t jump_mode;   /* 0 next bar, 1 end of row (RAM copy of the record flag) */
    uint8_t error;       /* last load/decode error (0 none, see song_storage.h) */
    uint16_t underruns;  /* rows replayed because the next one was not decoded in time */
    uint16_t late;       /* row entries whose event stream ended after the row boundary (9.11),
                            frame entries whose notes or buffer came late (9.12, 9.13) */
    uint16_t events;     /* events in the loaded song's table */
    /* Task 06 (9.13) */
    uint16_t bar;        /* bars since PLAY (the master clock) */
    uint8_t bar_step;    /* step within the bar, 0..15 */
    uint8_t song_over;   /* 1: the last row ended while tracks were detached; the transport runs on */
    uint8_t track_state[8];  /* bits 0-1 SONG_TRACK_*, bits 2-3 SONG_QUEUE_* pending, bit 4 waiting for its buffer */
    uint8_t track_row[8];    /* the pattern (row) the track plays, SONG_NONE when silent or stopped */
    uint8_t track_queued[8]; /* the queued pattern row (launch) or the row it returns to (attach), else SONG_NONE */
};
void song_init(void);                 /* once, before audio starts */
void song_poll(void);                 /* control task: decode ahead, finish stops */
int song_load(unsigned song);         /* read the record and build its directory */
unsigned song_loaded(void);           /* SONG_NONE when nothing is loaded */
const struct song_record *song_current(void);
int song_play(void);                  /* start the loaded song at row 0 */
void song_stop(void);                 /* release everything, device channels return */
int song_queue_jump(unsigned row);    /* lands at the next bar / row end */
void song_jump_mode_set(unsigned mode);
void song_status_read(struct song_status *out);
unsigned song_playing(void);          /* 1 while playing or stopping */
int song_send_setup(void);            /* stopped only: send row 0's events now (9.11) */
/* Task 06 (9.13): per-track queues, each landing on the next bar of the master clock. */
int song_track_launch(unsigned track, unsigned row);  /* SONG_INVALID: not playing / no such row; SONG_EMPTY: no block */
int song_track_stop(unsigned track);
int song_track_attach(unsigned track);                /* back to song */
void song_track_attach_all(void);
/* Audio thread, once per 128-frame block, from groove_midi_clock(0, tempo). song_tempo
 * returns the playing song's BPM override, 0 for the project tempo. */
FM1_AUDIO_CODE void song_tick(unsigned tempo);
FM1_AUDIO_CODE unsigned song_tempo(void);
#endif
