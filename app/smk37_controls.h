/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
#ifndef SMK37_CONTROLS_H
#define SMK37_CONTROLS_H
#include "fm1.h"
enum { SMK37_BUTTON, SMK37_KEY, SMK37_PRESSURE, SMK37_PAD,
       SMK37_ENCODER, SMK37_COMBINATION, SMK37_PEDAL, SMK37_FADER };
void smk37_controls_reset(void);
void smk37_control_event(unsigned kind, unsigned id, int value);
void smk37_controls_snapshot(struct fm1_controls *out);
void smk37_controls_panic(void);
void smk37_controls_release(void);
unsigned smk37_fader_bank(void);
unsigned smk37_pad_steps(void);
unsigned smk37_shift(void);
uint32_t smk37_pad_color(unsigned pad, unsigned lit);
unsigned smk37_pickup_mask(void);
uint32_t smk37_fader_feedback(void);
unsigned smk37_master_level(void);
void smk37_master_set(unsigned level);
unsigned smk37_screen_track(void);
int smk37_screen_octave(void);
unsigned smk37_performance_track(unsigned pad);
int smk37_performance_octave(unsigned pad);
unsigned smk37_pad_focus(void);
unsigned smk37_pad_aftertouch(void);
void smk37_screen_note(unsigned owner, unsigned note);
void smk37_screen_pad_mode(unsigned steps, unsigned instrument);
void smk37_panel_preferences_read(uint8_t data[4]);
void smk37_panel_preferences_apply(const uint8_t data[4]);
void groove_settings_panel_changed(void);
int smk37_screen_pad(unsigned pad, unsigned velocity, unsigned steps);
unsigned smk37_screen_pad_key(unsigned pad);
int smk37_screen_launch_color(unsigned pad, uint32_t *rgb);   /* Task 06: TRACK LAUNCH page pad colours */
enum { SMK37_PAGE_BLUETOOTH, SMK37_PAGE_SOURCE, SMK37_PAGE_MIDI };
void smk37_screen_page(unsigned page);
void smk37_screen_shortcut(unsigned pad);
/* Task 16 (remote control, app/transfer.c command 29): the screen state the status reply reports. */
unsigned ct_screen_page(void);
unsigned ct_screen_track_muted(unsigned track);   /* Task 17 Goal 4: the song's mute of a track (mixer mute, or the MIDI-only mute of an OFF track) */
unsigned ct_screen_mute_kind(unsigned track);     /* 0 none, 1 internal sound only (mixer), 2 sound and song notes (SHIFT + pad) */
unsigned ct_screen_clips_read(uint8_t *out);
unsigned ct_screen_steps_read(uint8_t *out);      /* command 29 op 15: the STEP page state, 55 bytes */
int ct_screen_steps_open(unsigned track, unsigned place);   /* command 29 op 16 {16, 3, track, place} */
unsigned ct_screen_setup_read(uint8_t *out);      /* tabby-v04.10: command 29 op 17: the CLIP SETTING page state, 23 bytes */
int smk37_send_controller(unsigned track, unsigned controller, unsigned value);   /* tabby-v04.13: K1..K4 on the CLIPS page */
int ct_screen_action_do(void);                    /* command 29 op 16 {16, 5}: the > button on ACTIONS while NEW SONG is selected (tabby-v04.21) */
int ct_screen_setup_do(void);                     /* command 29 op 16 {16, 4}: the 4th left button on that page */
void smk37_screen_key(unsigned note, unsigned velocity);   /* Goal 6: a keyboard key went down (after it was played) */      /* command 29 op 12: the CLIPS / SCENES page state, 54 bytes */
unsigned ct_screen_action(void);
void ct_screen_song_select(unsigned song);
#endif
