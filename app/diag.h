/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/diag.h — Classic Tabby timing counters (Task 11 Step 3, in every build since Task 12 A4),
 *              the control-loop profile (Task 12 A4), the device settings transfer kind of the
 *              full backup, the ACTIONS storage line
 *
 * Purpose
 *   Task 11 built these only with CT_DIAG (the tabby-v03.3-diag and tabby-p0-probe64 builds).
 *   Task 12 A4 (2026-11-08) moved everything here into the normal build: the counters, the
 *   Diagnostics panel's command 25, transfer kind 8 and the ACTIONS storage lines. CT_DIAG
 *   (tools/linux/build.py --diag, Makefile DIAG=1) now adds only command 26, the remote ACTIONS
 *   and song commands for unattended hardware runs (app/transfer.c).
 *
 *   The loop profile (Task 12 A4, for the Phase 1 timing investigation): one control pass runs
 *   from one SDK call of groove_midi_poll() to the next. Each app hook the SDK calls in the pass
 *   is a section, timed exclusive of the sections it calls (a nesting stack), summed per pass,
 *   and kept as the mean and the longest per pass:
 *     ROUTER    groove_midi_poll / ct_midi_flush: the router's MIDI out sends (also when the
 *               panel or the song code flush it)
 *     SONG      song_poll(): song scheduling (decode ahead, stops); the notes themselves are sent
 *               by the router from the audio thread's song tick
 *     STORAGE   song_storage_poll(): the boot scan, a confirmed erase, a compaction
 *     SCREEN    groove_screen_control(): panel input handling, pages, the LCD painter
 *     PANEL     fm1_controls_read() (app/board/panel.c): key and encoder queue, pad and button LEDs
 *     TRANSFER  groove_transfer_poll(): the workbench protocol
 *     PROJECT   groove_project_poll(): restores, the deferred settings saves
 *     SDK       the rest of the pass: the SDK's own work between the hooks (its MIDI input
 *               processing, the engine's control work, the Bluetooth stack)
 *   MIDI input arrives in the SDK's routing task (fm1_app_midi_received), not in the pass; its
 *   calls are counted apart (count, mean, longest).
 *
 *   What the diagnostic build measures, for the hardware checklist (docs/BUILD.md 24.6) and the
 *   Task 10 assessment's section L:
 *     L.1  the control loop's period, taken at groove_midi_poll() (the call that sends MIDI
 *          out, so its period is the MIDI-out quantum): count, maximum and mean;
 *     L.3  the longest fm1_flash_erase() and fm1_flash_write() (one call each, any size),
 *          with their counts: what a save does to the control loop;
 *     L.4  key and pad note-on latency from the scan ISR (app/board/scan.c, the moment the
 *          event is queued) to the control task taking it (smk37_scan_read, which hands it to
 *          the router at once): an 8-bin histogram and the maximum;
 *     L.5  the full-matrix scan rate (scan_soft_isr, once per 16 SPI rows) and its longest gap.
 *   All times are TIMER4 ticks (fm1_device_ticks(), 24 MHz, wraps every 179 s; every interval
 *   is a difference, so the wrap is harmless). Transfer command 25 reads them: no data or data
 *   byte 0 = page 1 (64 bytes), 1 = reset everything and then page 1, 2 = page 2 (the scan ISR
 *   counters, 20 bytes); app/diag.c lists the fields. The workbench's Diagnostics panel shows
 *   them with a reset button.
 *
 *   The device settings transfer kind 8 (40 bytes, wire layout CT_SETTINGS_*) carries what no
 *   other transfer kind does: the device settings stored with slot 15 (BLE role, clock mode,
 *   radio switches, the MIDI configuration) and the session settings in the tuning sector (track
 *   roles, input channels, panel preferences). docs/BACKUP-FORMAT.md describes it.
 *
 * Version: 0.6
 *
 * Revision log
 *   v0.6  2026-11-12  Task 16: ct_flash_busy; the A2 page is 52 bytes.
 *   v0.5  2026-11-10  Task 15 Step 4: option A2 (ct_a2_*: the pass request from the audio
 *                     interrupt, CT_A2 builds only) and command 25 requests 7, 8 and 9.
 *   v0.4  2026-11-10  Task 13 Step 1: the pass budget (ct_pass_*: option B, no pass over the
 *                     10 ms tick) and profile page 6 (busy time, lost ticks, deferrals).
 *   v0.3  2026-11-08  Task 12 A4: every build; the loop profile (command 25 pages 4 and 5).
 *   v0.2  2026-11-08  Task 11B: screen timing (command 25 page 3: groove_screen_control calls and
 *                     paint_flush band painting).
 *   v0.1  2026-11-07  Task 11 Steps 2 and 3: first version.
 */
#ifndef CT_DIAG_H
#define CT_DIAG_H
#include <stdint.h>
#include <stddef.h>

enum {
    CT_DIAG_TICK_HZ = 24000000,      /* TIMER4 */
    CT_DIAG_REPLY_BYTES = 64,        /* command 25's reply, the protocol's maximum */
    CT_DIAG_KEY_BINS = 8,            /* <0.5, <1, <2, <4, <8, <16, <32, >=32 ms */
    CT_SETTINGS_BYTES = 40,          /* transfer kind 8 */
    CT_SETTINGS_MAGIC = 0x31534254U, /* "TBS1", little-endian */
    CT_SETTINGS_VERSION = 1
};
/* Written by the scan ISRs (app/board/scan.c), read by command 25. */
extern volatile uint32_t ct_diag_scan_count, ct_diag_scan_last, ct_diag_scan_gap_max;
/* Hooks. Control task unless marked. */
void ct_diag_loop(void);                         /* groove_midi_poll(): one control loop */
void ct_diag_key(uint32_t queued_ticks);         /* smk37_scan_read(): a note-on dequeued */
/* Task 11B: screen timing. ct_diag_ticks() is TIMER4; ct_diag_screen() records one
 * groove_screen_control() call, ct_diag_paint() one paint_flush() that sent `bands` bands. */
uint32_t ct_diag_ticks(void);
void ct_diag_screen(uint32_t ticks);
void ct_diag_paint(uint32_t ticks, unsigned bands);
int ct_diag_read(unsigned reset, uint8_t out[CT_DIAG_REPLY_BYTES]);   /* command 25 */
int ct_diag_flash_erase(uint32_t offset);        /* fm1_flash_erase() with its time kept */
int ct_diag_flash_write(uint32_t offset, const void *data, size_t bytes);
/* The ACTIONS page's two storage lines: "USER 536576 SONG READY" / "FREE 123K  RECLAIM 4K"
 * (at most 31 characters each; the buffers are 40). */
void ct_diag_storage_lines(char user_line[40], char song_line[40]);
/* Transfer kind 8 (app/project.c). */
int groove_settings_export(uint8_t out[CT_SETTINGS_BYTES]);
int groove_settings_import(const uint8_t *in, unsigned bytes);
/* Every flash erase and write of the app goes through the timed wrappers. diag.c defines
 * CT_DIAG_IMPL so that it calls the SDK functions themselves. */
#ifndef CT_DIAG_IMPL
#define fm1_flash_erase(offset) ct_diag_flash_erase(offset)
#define fm1_flash_write(offset, data, bytes) ct_diag_flash_write(offset, data, bytes)
#endif
#define CT_DIAG_LOOP() ct_diag_loop()
/* Task 12 A4: the loop profile. Control task only, except ct_prof_midi_in (routing task). */
enum { CT_PROF_ROUTER, CT_PROF_SONG, CT_PROF_STORAGE, CT_PROF_SCREEN, CT_PROF_PANEL, CT_PROF_TRANSFER,
       CT_PROF_PROJECT, CT_PROF_SECTIONS };
void ct_prof_pass(void);                 /* the SDK's call of groove_midi_poll: a pass begins */
void ct_prof_enter(unsigned section);    /* a hook starts (pauses the section it interrupts) */
void ct_prof_leave(void);                /* it ends (resumes that section) */
void ct_prof_midi_in(uint32_t ticks);    /* one fm1_app_midi_received call, routing task */
int ct_prof_read(unsigned page, uint8_t out[CT_DIAG_REPLY_BYTES]);   /* command 25 requests 4 / 5 */
void ct_prof_reset(void);
/* The router's flush without a pass boundary, for the app's own calls (panel, song, router). */
void ct_midi_flush(void);

/* ---- Task 13 Step 1 (option B): the pass budget ------------------------------------------------
 * The SDK posts one control pass per 10 ms timer tick and drops a tick while a pass still runs or
 * waits (BUILD.md 26.9 B2). A pass that runs past the next tick therefore turns a 0..10 ms MIDI
 * wait into 10..20 ms. The budget keeps the pass short: work that can wait a pass (the LCD
 * compose and its band paints, a new workbench request) asks first and is deferred once the pass
 * has used CT_PASS_BUDGET_TICKS of wall time (wall time on purpose: the audio thread's share of
 * the CPU is in it, and that is what decides whether the tick is missed). The router flush and
 * the song code are never deferred; they run first in the pass (groove_midi_poll, then
 * groove_samples_poll: song_poll before song_storage_poll).
 *
 * Every deferrable kind has a starvation guard in its own module (the screen paints at least one
 * band per CT_PASS_STARVE_MS, the transfer answers after at most CT_PASS_DEFER_MAX passes), so a
 * pass that is always late still makes progress. */
enum {
    CT_PASS_BUDGET_TICKS = 6U * 24000U,   /* 6 ms of the 10 ms tick: room for the SDK's own hooks */
    CT_PASS_STARVE_MS = 60,               /* the screen paints at least one band this often */
    CT_PASS_DEFER_MAX = 4,                /* a workbench request waits at most 4 passes */
    CT_DEFER_DRAW = 0, CT_DEFER_BAND, CT_DEFER_TRANSFER, CT_DEFER_KINDS
};
uint32_t ct_pass_elapsed(void);          /* ticks since this pass began */
int ct_pass_over(uint32_t more);         /* 1 if elapsed + more would pass the budget */
void ct_pass_defer(unsigned kind);       /* count one deferral (profile page 6) */
void ct_pass_busy_end(void);             /* the pass's last app hook ended: its busy time */
/* ---- Task 15 Step 4 (option A2): the control pass on demand, CT_A2 builds only ----------------
 * tools/linux/build.py --a2 (Makefile A2=1) defines CT_A2; the host tests always build it. The
 * normal build has none of this code. A2 is OFF at boot and lives in RAM only: one install
 * measures option B alone (off) and B + A2 (on). The code and its rules are in app/midi_router.c.
 * Command 25: request 7 reads the A2 page (52 bytes, ct_a2_read), 8 switches A2 off and 9 on
 * (both answer with the page); request 1 (reset everything) also clears the A2 counters. */
#if defined(FM1_HOST_TEST) && !defined(CT_A2)
#define CT_A2 1
#endif
#ifdef CT_A2
void ct_a2_set(unsigned on);             /* control task: switch A2 */
unsigned ct_a2_get(void);
void ct_a2_reset(void);                  /* clear the counters at the next audio block */
int ct_a2_read(uint8_t *out);            /* the A2 page, 52 bytes (the last u32: blocks skipped during flash writes) */
extern volatile uint8_t ct_flash_busy;   /* nonzero while an app flash erase or write runs: no A2 request then */
#endif
#ifdef FM1_HOST_TEST
/* Host tests only: extra ticks added to the diag clock, so a test can make a band paint or a
 * request "take" a given time (web/engine/Simulator.c sim_test_*). */
extern uint32_t ct_test_ticks_extra;
#endif
#endif
