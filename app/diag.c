/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/diag.c — Classic Tabby diagnostic build: the timing counters and the ACTIONS storage
 *              lines (Task 11 Step 3)
 *
 * Purpose
 *   The counters of app/diag.h (control loop period, flash erase/write time, key-to-router
 *   latency; the scan ISR's are in app/board/scan.c), their read-and-reset for transfer
 *   command 25, and the two lines the ACTIONS page shows in a diagnostic build: the USER size
 *   the SDK validated (fm1_flash_size()) with the song storage state, and the free and
 *   reclaimable song storage. The whole file is empty unless CT_DIAG is defined, so the
 *   normal build links nothing from it.
 *
 *   Reply of command 25 (64 bytes, little-endian u32 unless noted; times in 24 MHz ticks):
 *     0  tick rate (24000000)            4  ticks since the last reset
 *     8  control loops counted          12  longest loop period        16  mean loop period
 *    20  flash erases counted           24  longest erase              28  flash writes counted
 *    32  longest write                  36  bytes of the longest write
 *    40  key/pad note-ons counted       44  longest note-on latency
 *    48  8 x u16 latency histogram: < 0.5, < 1, < 2, < 4, < 8, < 16, < 32, >= 32 ms (saturating)
 *   ... the scan ISR fields follow the histogram: the histogram ends at byte 63, so the scan
 *       count and longest gap travel in the second page: command 25 with data byte 2 answers
 *       {scan count, longest scan gap, scan ISR peak ticks, ADC ISR peak ticks, the reset tick}
 *       (20 bytes). See ct_diag_read().
 *
 *   Control-loop timing is taken at groove_midi_poll() because that call sends MIDI out: its
 *   period is the MIDI-out quantum during playback (SPEC 9.6, SPEC 14.3).
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-08  Task 11B: page 3 (request 3), the screen timing: groove_screen_control()
 *                     calls (count, mean, longest) and paint_flush() band paints (count, bands,
 *                     mean, longest), to see whether drawing sets the control loop's period.
 *   v0.1  2026-11-07  Task 11 Step 3: first version.
 */
#define CT_DIAG_IMPL
#include "diag.h"
#ifdef CT_DIAG
#include "instrument.h"
#include "song_storage.h"
#include "fm1_device.h"
#include <string.h>

#ifdef FM1_HOST_TEST
/* The simulator and the host tests have no TIMER4: a millisecond clock scaled to 24 MHz. */
static uint32_t ticks(void) { return fm1_millis() * 24000U; }
volatile uint32_t ct_diag_scan_count, ct_diag_scan_last, ct_diag_scan_gap_max;
#else
static uint32_t ticks(void) { return fm1_device_ticks(); }
/* app/board/scan.c defines the ISR-side counters (they live with the ISR). */
extern volatile uint32_t smk37_scan_peak_ticks, smk37_adc_peak_ticks;
#endif

static struct {
    uint32_t reset_at, loop_last, loop_count, loop_max;
    uint64_t loop_sum;
    uint32_t erase_count, erase_max, write_count, write_max, write_max_bytes;
    uint32_t key_count, key_max;
    uint16_t key_bins[CT_DIAG_KEY_BINS];
    uint8_t loop_started;
    /* v0.2: the screen. */
    uint32_t screen_count, screen_max, paint_count, paint_bands, paint_max;
    uint64_t screen_sum, paint_sum;
} d;
uint32_t ct_diag_ticks(void) { return ticks(); }
void ct_diag_screen(uint32_t t)
{ ++d.screen_count; d.screen_sum += t; if (t > d.screen_max) d.screen_max = t; }
void ct_diag_paint(uint32_t t, unsigned bands)
{
    if (!bands) return;
    ++d.paint_count; d.paint_bands += bands; d.paint_sum += t; if (t > d.paint_max) d.paint_max = t;
}

void ct_diag_loop(void)
{
    uint32_t now = ticks();
    if (d.loop_started) {
        uint32_t period = now - d.loop_last;
        d.loop_sum += period; ++d.loop_count;
        if (period > d.loop_max) d.loop_max = period;
    }
    d.loop_last = now; d.loop_started = 1;
}
void ct_diag_key(uint32_t queued)
{
    uint32_t latency = ticks() - queued;
    unsigned bin = 0;
    /* Bin edges 0.5, 1, 2, 4, 8, 16, 32 ms = 12000 << n ticks. */
    while (bin < CT_DIAG_KEY_BINS - 1 && latency >= (12000U << bin)) ++bin;
    if (d.key_bins[bin] != 0xffffU) ++d.key_bins[bin];
    ++d.key_count;
    if (latency > d.key_max) d.key_max = latency;
}
int ct_diag_flash_erase(uint32_t offset)
{
    uint32_t start = ticks();
    int r = fm1_flash_erase(offset);
    uint32_t used = ticks() - start;
    ++d.erase_count; if (used > d.erase_max) d.erase_max = used;
    return r;
}
int ct_diag_flash_write(uint32_t offset, const void *data, size_t bytes)
{
    uint32_t start = ticks();
    int r = fm1_flash_write(offset, data, bytes);
    uint32_t used = ticks() - start;
    ++d.write_count;
    if (used > d.write_max) { d.write_max = used; d.write_max_bytes = (uint32_t)bytes; }
    return r;
}
static void put32(uint8_t *p, uint32_t v) { for (unsigned i = 0; i < 4; ++i) p[i] = (uint8_t)(v >> (8U * i)); }
int ct_diag_read(unsigned request, uint8_t out[CT_DIAG_REPLY_BYTES])
{
    /* request 0: page 1 (64 bytes); 1: reset everything, then page 1; 2: page 2 (20 bytes). */
    uint32_t now = ticks();
    if (request == 1) {
        memset(&d, 0, sizeof d);
        ct_diag_scan_count = 0; ct_diag_scan_gap_max = 0;
#ifndef FM1_HOST_TEST
        smk37_scan_peak_ticks = 0; smk37_adc_peak_ticks = 0;
#endif
        d.reset_at = now;
    }
    if (request == 3) {
        /* v0.2: page 3: screen control calls, their mean and longest; band paints (flushes that
         * sent at least one band), bands sent, mean and longest paint (24 bytes). */
        put32(out, d.screen_count); put32(out + 4, d.screen_count ? (uint32_t)(d.screen_sum / d.screen_count) : 0);
        put32(out + 8, d.screen_max); put32(out + 12, d.paint_count); put32(out + 16, d.paint_bands);
        put32(out + 20, d.paint_count ? (uint32_t)(d.paint_sum / d.paint_count) : 0);
        put32(out + 24, d.paint_max);
        return 28;
    }
    if (request == 2) {
        put32(out, ct_diag_scan_count); put32(out + 4, ct_diag_scan_gap_max);
#ifndef FM1_HOST_TEST
        put32(out + 8, smk37_scan_peak_ticks); put32(out + 12, smk37_adc_peak_ticks);
#else
        put32(out + 8, 0); put32(out + 12, 0);
#endif
        put32(out + 16, d.reset_at);
        return 20;
    }
    put32(out, CT_DIAG_TICK_HZ); put32(out + 4, now - d.reset_at);
    put32(out + 8, d.loop_count); put32(out + 12, d.loop_max);
    put32(out + 16, d.loop_count ? (uint32_t)(d.loop_sum / d.loop_count) : 0);
    put32(out + 20, d.erase_count); put32(out + 24, d.erase_max);
    put32(out + 28, d.write_count); put32(out + 32, d.write_max); put32(out + 36, d.write_max_bytes);
    put32(out + 40, d.key_count); put32(out + 44, d.key_max);
    for (unsigned i = 0; i < CT_DIAG_KEY_BINS; ++i) { out[48 + 2 * i] = (uint8_t)d.key_bins[i]; out[49 + 2 * i] = (uint8_t)(d.key_bins[i] >> 8); }
    return CT_DIAG_REPLY_BYTES;
}
/* Right-aligned decimal without printf (the link list bans the printf family). */
static char *number(char *p, uint32_t v)
{
    char digits[10]; unsigned n = 0;
    do { digits[n++] = (char)('0' + v % 10U); v /= 10U; } while (v);
    while (n) *p++ = digits[--n];
    return p;
}
static char *word(char *p, const char *s) { while (*s) *p++ = *s++; return p; }
void ct_diag_storage_lines(char user_line[40], char song_line[40])
{
    static const char *const states[] = {"SCANNING", "READY", "OLD DATA", "ERASING", "ERROR", "COMPACTING"};
    unsigned st = song_storage_state();
    uint32_t size = fm1_flash_size();
    char *p = word(user_line, "USER ");
    p = size ? number(p, size) : word(p, "0 INVALID");
    p = word(p, " SONG ");
    p = word(p, st < 6 ? states[st] : "?");
    *p = 0;
    uint32_t free_bytes = 0, reclaim = 0;
    p = song_line;
    if (st == SONG_STORAGE_READY && !song_storage_status(&free_bytes, &reclaim)) {
        p = word(p, "FREE "); p = number(p, free_bytes / 1024U);
        p = word(p, "K  RECLAIM "); p = number(p, reclaim / 1024U); p = word(p, "K");
    } else p = word(p, "SONG STORAGE NOT READY");
    *p = 0;
}
#endif
