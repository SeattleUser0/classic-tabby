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
 * Version: 0.4
 *
 * Revision log
 *   v0.4  2026-11-08  Task 12 A1/A3: ct_transport_running(), the one test every flash-write path
 *                     uses: a song plays (or is stopping) or the stock transport runs.
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
    uint8_t track_chain[8];  /* tabby-v04.11: the row the launched clip's chain leads to, 254 = it stops the track, SONG_NONE = no chain */
    uint8_t count_in;    /* tabby-v04.10: quarter notes of the count-in still to come (0: none runs) */
    uint8_t follow;      /* Task 16: external clock follow: 0 off, 1 armed (waiting for Start), 2 preparing, 3 waiting for a pulse, 4 running, 5 held (missed pulses), 6 LOST, 7 stopped */
};
/* Task 16 Goal 3: the MIDI-in callback gives a follow song the clock messages; 1 = taken (SPEC 19.3). */
int song_clock_in(unsigned status, unsigned a, unsigned b);
unsigned song_follow_state(void);
void song_init(void);                 /* once, before audio starts */
void song_poll(void);                 /* control task: decode ahead, finish stops */
int song_load(unsigned song);         /* read the record and build its directory */
unsigned song_loaded(void);           /* SONG_NONE when nothing is loaded */
const struct song_record *song_current(void);
const struct song_model *song_model_current(void);   /* Task 17 Goal 3: clip table, scene clips, master cycle of the loaded song */
int song_play(void);                  /* start the loaded song at row 0 */
void song_stop(void);                 /* release everything, device channels return */
int song_queue_jump(unsigned row);    /* lands at the next bar / row end */
void song_jump_mode_set(unsigned mode);
void song_status_read(struct song_status *out);
unsigned song_playing(void);          /* 1 while playing or stopping */
/* Task 12 A3: 1 while any transport runs: song mode (song_playing) or the stock pattern
 * sequencer (internal or external clock). While it does, no path writes flash (SPEC 15.4):
 * project SAVE, song upload / delete, COMPACT, ERASE OLD DATA, settings. Control task only. */
unsigned ct_transport_running(void);
int song_send_setup(void);            /* stopped only: send row 0's events now (9.11) */
/* Task 06 (9.13): per-track queues, each landing on the next bar of the master clock. */
int song_track_launch(unsigned track, unsigned row);  /* SONG_INVALID: not playing / no such row; SONG_EMPTY: no block */
int song_clip_launch(unsigned track, unsigned place); /* Task 17 Goal 4: by clip place (0..63) of the song's clip table */
int song_track_unqueue(unsigned track);               /* take a queue back before it lands; SONG_EMPTY: none */
void song_mute_set(unsigned mask);                    /* bit t: track t's song notes are held back (the clip runs on) */
unsigned song_row_place(unsigned track, unsigned row);/* the clip place behind a status row, SONG_NONE if none */
int song_track_stop(unsigned track);
/* Goal 6 (tabby-v04.8): the clip editor. One clip at a time is open as an event list in RAM; edits are heard at the
 * loop's next pass when the clip is launched on its track, and are written to song storage by song_edit_save (only
 * while stopped) or by song_edit_poll ten seconds after the last change while stopped. Four undo levels. */
enum { SONG_EDIT_SHARED = 2 };          /* song_edit_open: another track uses the same block */
struct song_edit_info {
    uint8_t active, track, place, dirty;
    uint8_t steps;                       /* the steps the editor shows: the clip's playing length */
    uint8_t undo, redo;                  /* levels available */
    uint8_t play_step;                   /* the step the track plays in this clip now, SONG_NONE when it does not */
    uint16_t events, block;
    uint16_t revision;                   /* changes since power-up */
    uint8_t recording;                   /* 0 off, 1 armed (waiting for the clip to loop on its track), 2 recording */
    uint8_t quantize;                    /* input quantize: notes are recorded on the nearest step */
    uint8_t created;                     /* tabby-v04.10: made on the device, not in song storage yet */
};
int song_edit_open(unsigned track, unsigned place);   /* 0, SONG_EMPTY (no clip), SONG_BUSY (another clip is unsaved), SONG_EDIT_SHARED */
void song_edit_info(struct song_edit_info *out);
const uint8_t *song_edit_clip(void);                  /* the v3 payload being edited, NULL when none */
int song_edit_note_toggle(unsigned step, unsigned pitch, unsigned velocity, unsigned length);   /* 1 added, 0 removed, SONG_FULL */
int song_edit_step_clear(unsigned step);
int song_edit_note_adjust(unsigned step, unsigned n, unsigned field, int delta);
int song_edit_undo(void);
int song_edit_redo(void);
int song_edit_save(void);                             /* SONG_BUSY while a transport runs */
void song_edit_discard(void);
int song_edit_poll(void);
/* tabby-v04.10: a new empty clip (one master cycle) in an empty place, open and unsaved; song_edit_save also writes the
 * song record when the song was changed on the device (song_unsaved: a clip or the song waits for a save). */
int song_clip_new(unsigned track, unsigned place);
unsigned song_unsaved(void);
/* tabby-v04.10: the clip workflow on the panel. song_edit_length changes the open clip's length by `delta` steps (1 to
 * 128; returns the events it removed past a shorter end); song_clip_copy makes a copy of a clip in an empty place of the
 * same track (it becomes the open, unsaved clip); song_scene_store adds what plays now as a new scene (its index). */
int song_edit_length(int delta);
int song_clip_copy(unsigned track, unsigned from, unsigned to);
/* tabby-v04.15: the open clip's TRANSPOSE (-12 to 12 semitones; one undo level per run), and taking a clip out of the
 * song (stopped only; SONG_EDIT_SHARED when a scene uses it: song_clip_scene gives that scene, or -1). */
int song_edit_transpose(int delta);
int song_edit_scale(int delta);                      /* tabby-v04.19: 0 a 16th, 1 an 8th, 2 a 32nd, 3 a 16th triplet, 4 an 8th triplet; only what fits the length */
int song_edit_direction(int delta);                  /* tabby-v04.20: 0 forwards, 1 backwards, 2 forwards then backwards */
int song_edit_shift(int delta);                      /* tabby-v04.21: every event one step later (> 0) or earlier, round the end */
enum { SONG_NEW_EXISTS = 2 };
int song_step_loop(unsigned steps);                  /* tabby-v04.23: every playing track repeats the last `steps` 16ths; 0 ends it */
unsigned song_step_looping(void);
int song_new(unsigned song);                         /* tabby-v04.21: an empty song in an empty slot; SONG_NEW_EXISTS: the slot holds a song */
unsigned song_record_erase(unsigned held);           /* tabby-v04.21: FX held in a take: played keys clear their notes; 1 while a take runs */
int song_edit_feel(unsigned field, int delta);       /* tabby-v04.17: 0 SHUFFLE (0 the song's, 1..51 own 0..50 %), 1 PLAY QUANTIZE (0 off, 1..3) */
int song_clip_delete(unsigned track, unsigned place);
int song_clip_scene(unsigned track, unsigned place);
int song_edit_program(unsigned field, int delta);   /* tabby-v04.13: 0 program, 1 bank MSB, 2 bank LSB */
int song_edit_chain(unsigned field, int delta);   /* tabby-v04.11: 0 next clip, 1 after (steps), 2 times */
int song_scene_store(void);
/* tabby-v04.16: a scene out of the song / one place earlier or later (stopped only: SONG_BUSY; SONG_EMPTY: the last
 * scene stays; SONG_EDIT_SHARED: an imported clip would change its length). song_scene_move returns the new index. */
int song_scene_delete(unsigned row);
int song_scene_move(unsigned row, int delta);
unsigned song_record_disarmed(void);
/* The song's click and count-in settings (stored in the song record): the count-in in master cycles (0, 1, 2 or 4),
 * the click (0 off, 1 while a take is armed or runs, 2 always), its output (0 internal, 1 MIDI, 2 both), the MIDI
 * click's channel (0..15) and note. song_setting_edit steps a setting by `delta`. */
enum { SONG_SET_COUNT_IN = 0, SONG_SET_CLICK = 1, SONG_SET_CLICK_OUT = 2, SONG_SET_CLICK_CH = 3, SONG_SET_CLICK_NOTE = 4,
       SONG_SET_CLICK_LEVEL = 5,   /* tabby-v04.14: 0 LOW, 1 MID, 2 HIGH (header byte 44 bits 6-7: 0 MID, 1 LOW, 2 HIGH) */
       SONG_SET_KNOB1 = 6, SONG_SET_KNOB2 = 7, SONG_SET_KNOB3 = 8, SONG_SET_KNOB4 = 9,   /* tabby-v04.14: the controller numbers of K1 to K4 on CLIPS (header bytes 56 to 59: 0 = 74, 71, 1, 11; else number + 1) */
       SONG_SET_EVENT_LEAD = 10,   /* tabby-v1.0.2: how long before a scene's downbeat its row events go out: 0 OFF, 1 a 32nd, 2 a 16th, 3 an 8th, 4 a quarter note (header byte 47 holds the value; 0, OFF, is what every song has that never set it: its events go out at the downbeat, as before) */
       SONG_SETTINGS = 11 };
unsigned song_setting(unsigned which);
int song_setting_edit(unsigned which, int delta);
FM1_AUDIO_CODE void song_click_mix(int32_t *output);   /* audio thread: the internal click into one block of the output */
/* The scene that plays repeats until the hold is taken off or a scene is recalled (RAM only). */
void song_scene_hold_set(unsigned on);
unsigned song_scene_hold(void);
int song_scene_edit(unsigned row, unsigned field, int delta);   /* tabby-v04.12: 0 times (1..64), 1 then (0 next scene, 1 stay) */
unsigned song_scene_reserved(void);                            /* the scene PLAY starts at (stopped) */
/* Goal 6, second step (tabby-v04.9): real-time recording into the open clip (SPEC 19.11). */
int song_record_start(void);                          /* 2 recording, 1 armed, negative: no clip open / cannot launch */
void song_record_stop(void);
void song_record_quantize(unsigned on);
unsigned song_record_full(void);                      /* 1 once after the event cap stopped a take */
void song_record_poll(void);
void song_record_in(unsigned source, unsigned status, unsigned a, unsigned b);   /* 0 panel, 1 MIDI in */
int song_track_attach(unsigned track);                /* back to song */
void song_track_attach_all(void);
/* Audio thread, once per 128-frame block, from groove_midi_clock(0, tempo). song_tempo
 * returns the playing song's BPM override, 0 for the project tempo. */
FM1_AUDIO_CODE void song_tick(unsigned tempo);
FM1_AUDIO_CODE unsigned song_tempo(void);
#endif
