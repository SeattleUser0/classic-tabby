/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * tests/host/smoke.c — native host smoke tests for the SMK37 Open app code
 *
 * Purpose
 *   Compile the app code (every app .c file except app/board, plus app/synth headers) with the
 *   browser simulator platform (web/engine, web/synth, third_party/synth) natively with
 *   gcc or clang, using the same FM1_HOST_TEST / FM1_OPEN_WEB path the WASI simulator
 *   uses, so midi_router.c, project.c and transfer.c logic can be exercised without
 *   hardware. The harness drives the same sim_* entry points the browser uses
 *   (web/engine/Simulator.c), so a test that passes here describes what the workbench
 *   simulator and, through the shared app code, the device do.
 *
 *   Smoke tests (Task 01, Step 7):
 *     1. it builds and links (this file running at all);
 *     2. the simulator initializes: sim_boot(1) with cleared storage, the panel
 *        snapshot and block size are readable, default keyboard track/channel;
 *     3. a keyboard note produces the expected MIDI output on the expected channel:
 *        SMK37 key 12 with velocity 100 -> Note On 60 (48 + id + 12*octave) on the
 *        keyboard track's output channel (default channel 1, status 0x90) on every
 *        ready port, Note Off on release; then the track's output channel is moved to
 *        channel 3 through the MIDI settings and the note follows it.
 *     4. the audio path renders finite output after the note.
 *
 *   Task 03 checkpoint (a) (v0.2):
 *     5. song storage migration: a cleared flash scans as READY with no old sectors;
 *        a V01 sample bank magic at 69632 and a DX7 library bank magic at 516096 are
 *        detected as OLD_DATA (2 sectors); the confirmed erase clears exactly those
 *        sectors and leaves the project area and the tuning sector untouched;
 *     6. a project with a sampler track loads with no GROOVE_SAMPLE track (808 instead).
 *   Task 03 checkpoint (f) (v0.5):
 *     9. a song record's tempo override outside 30..300 is rejected (0 stays valid), and a
 *        song replaced through delete-then-write leaves the old blocks reclaimable, so one
 *        compaction brings the pool back to one copy.
 *
 *   Build and run through the Makefile:  make test   (or make host-smoke)
 *   Exit status is the number of failed checks (0 = pass).
 *
 *   Task 04 (v0.6):
 *    10. row events (9.11): a version-2 record with program / bank+program / control / gap
 *        events plays with every event once per row entry, before the row's first note and
 *        on its own channel; bank select precedes the program; a gap pre-fires the stream
 *        so the last event still lands before the notes; a queued jump fires the target
 *        row's events; a jump queued too late counts as late; SEND SETUP streams row 0 while
 *        stopped; a version-1 record still loads; bad tables and a bad CRC are rejected.
 *
 * Version: 0.29
 *
 * Revision log
 *   v0.29 2026-11-17  tabby-v04.20: section 26: DIRECTION per clip (played, the cursor, a take).
 *   v0.28 2026-11-17  tabby-v04.19: section 26: STEP SIZE per clip (played, the cursor, a take).
 *   v0.27 2026-11-17  tabby-v04.17: section 26: SHUFFLE and PLAY QUANTIZE per clip, heard on MIDI out.
 *   v0.26 2026-11-17  tabby-v04.16: section 26: a scene moved and deleted (events and loop row follow; the grid-block
 *                     length rule), a stop takes an armed take off.
 *   v0.25 2026-11-16  tabby-v04.10: section 26: every clip loops at its own length, a new clip made on the device, the
 *                     song saved as a version-3 record, clip chains, the scene hold. Sections 22 and 23 follow the
 *                     own-length rule (a v2 block has the steps of its first scene).
 *   v0.24 2026-11-16  Section 25, the flash part page (command 25 request 11): any ID is reported, none is needed.
 *   v0.23 2026-11-16  Goal 6: section 24, recording at the event cap (SPEC 14.2).
 *   v0.22 2026-11-16  Goal 6: section 23, the clip editor (song_edit_*).
 *   v0.21 2026-11-14  Task 17 Goal 4: section 22, clip launching by place (place rows, taking a queue back).
 *   v0.20 2026-11-14  Task 17 Goal 3: section 21, song record version 3 (scenes, the clip table, the master cycle).
 *   v0.19 2026-11-14  Branch clipv3-cursor: section 20, the scheduler cursor (a v3 clip from its event list is
 *                     byte-identical to the grid; a clip the grid cannot hold plays: chord of five, a controller event).
 *   v0.18 2026-11-14  Merge of tabby-v04.4 into the clip v3 branch: F + G is section 19, the v3 clip section is 20.
 *   v0.17 2026-11-13  Task 17: section 19, options F + G (due times, the timer tick, the fallback to A2, lateness
 *                     counters, a song with F + G off and on, clock follow); the USB pusher checks of v0.16 now expect
 *                     no 0xF9 (the pusher is removed); the remote status is 14 bytes (CLOCK).
 *   v0.16 2026-11-12  Task 16: USB pusher checks in section 17.
 *   v0.15 2026-11-12  Task 16: flash guard checks in section 17 (an audio block inside every flash operation).
 *   v0.15b 2026-11-12 Task 16 Goal 5 (branch mc707-phase2): section 20 (was 19): v3 blocks play byte-identical MIDI to v2.
 *   v0.14 2026-11-12  Task 16 Goal 3: section 18, external clock follow: arm, Start, the first pulse, the step-4 note
 *                     on its pulse, tempo changes, 3 missed pulses (HELD), relock inside 2 s, LOST after 2 s and
 *                     the pulses-alone rule, Continue, Stop wins, SPP stopped and running, Start from the
 *                     middle, the song end arms again, PLAY leaves follow.
 *   v0.13 2026-11-11  Task 16 Goal 1: section 17, command 29 (remote control) through the SysEx path:
 *                     status, A2, key press and release, refusals (SAVE, ids, kinds), SHIFT + HOME / SRC and
 *                     SEQ + EDIT against the reported page, the 5 s watchdog, song select / play / jump /
 *                     stop, and a refused project save while playing. Section 16: A2 is ON at boot.
 *   v0.12 2026-11-10  Task 15 Step 4: section 16, option A2 (the control pass on demand): off at
 *                     boot and then no request at all; on: one request per audio block with an
 *                     event waiting and the note leaves in that block; a request that gets no
 *                     pass is repeated once per block (retries counted), never more; no request
 *                     with empty lanes; the counters, their reset, and the ACTIONS switch.
 *   v0.11 2026-11-10  Task 13 Step 1: section 15, the pass budget (option B): screen slices give
 *                     the same picture as one unbudgeted paint, no pass runs past the budget plus
 *                     one band, the starvation guard repaints a pass that is always late, MIDI
 *                     sends come before bands in a pass and a note queued while a band paints
 *                     leaves before the next pass; a deferred workbench request gets the same
 *                     reply a few passes later and never waits more than CT_PASS_DEFER_MAX.
 *   v0.10 2026-11-08  Task 12 A2: section 14, the SYNC / MIDI page (SEQ), MIDI TRACK (SHIFT+SEQ),
 *                     no REC, STEP_EDIT / RHYTHM refused.
 *   v0.9  2026-11-08  Task 12 A1: the song-region constants come from CT_USER_BYTES (471040 by
 *                     default: 80 block sectors), not the old 536576 layout's 96.
 *   v0.8  2026-11-04  Task 06: section 13, independent track launching (launch at the next
 *                     bar, two presses keep the last, quantized stops with every note-off,
 *                     back to song, scene jumps re-attaching, a late press, polymeter for 64
 *                     bars, song end with detached tracks, eight launches at one bar).
 *   v0.7  2026-11-03  Task 05: section 11, timed notes (offsets at the limits, two notes 3 ms
 *                     apart, a negative offset before a row boundary, the late case, no stuck
 *                     notes across jumps, 10 minutes without drift), section 12, a v1 song
 *                     against the tabby-v02.0 capture (tests/host/v1_reference.inc); block
 *                     read-backs come upgraded to format 1 (sections 7..9).
 *   v0.6  2026-11-02  Task 04: section 10, row events.
 *   v0.5  2026-11-02  Task 03 (f): section 6 builds its sampler project from the workspace
 *                     (the factory scenes are gone); section 9: tempo range, replace via
 *                     delete, compaction back to one copy.
 *   v0.4  2026-11-02  Task 03 (e): section 8, batched block upload: packing, superseding,
 *                     rejected streams, power-cut recovery before and after the commit,
 *                     playback from batch blocks, plain-erase compaction.
 *   v0.3  2026-11-02  Task 03 (d): song storage (records, blocks, rewrite, compaction) and
 *                     song playback (channel override, note timing, end, queued jump).
 *   v0.2  2026-11-02  Task 03 (a): song storage migration and sampler-removal checks.
 *   v0.1  2026-11-01  Initial version.
 */
#include "timed_note.h"
#include "song_storage.h"   /* Task 17 Goal 3: struct song_record, struct song_model (section 21) */
#include "song.h"
#include "clip_v3.h"
#include "ct_layout.h"   /* Task 12 A1: CT_USER_BYTES */
/* Task 12 A1: block sectors of the song region of this build's layout (80 at 471040, 96 at 536576). */
enum { SECTORS = (CT_USER_BYTES - 73728) / 4096 - 17 };
#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Simulator entry points (web/engine/Simulator.c; EXPORT() is empty off-wasm). */
void sim_boot(unsigned clear);
void sim_midi_capture(unsigned enable);
unsigned sim_midi_output(void);
unsigned sim_midi_setting(unsigned track, unsigned parameter);
void sim_midi_edit(unsigned track, unsigned parameter, int delta);
int sim_smk37(unsigned kind, unsigned id, int value);
int sim_open(unsigned target);                       /* Task 12 A2 */
/* Task 13 Step 1: the pass-budget hooks (web/engine/Simulator.c) and the profile (app/diag.c). */
void sim_test_costs(uint32_t band, uint32_t pass);
const char *sim_test_log(void);
void sim_test_log_reset(void);
void sim_test_inject(int band);
/* Task 15 Step 4: option A2 (app/midi_router.c, app/diag.c) and its simulator hooks. */
void sim_test_request_passes(unsigned on);
extern uint32_t sim_test_control_requests;
int ct_diag_read(unsigned request, uint8_t out[64]);
void ct_fg_tick(void); void ct_fg_test(unsigned on); uint32_t ct_diag_ticks(void);   /* Task 17 */
extern uint32_t ct_test_flash_jedec, ct_test_flash_bytes;   /* the flash part page (app/diag.c v0.8) */
void sim_test_pass(void);
void song_test_cursor(unsigned on);   /* app/song.c, host and simulator: every v3 clip plays from its event list */
unsigned ct_a2_get(void);
void sim_control(unsigned kind, unsigned index, int value);
void sim_release(void);
const uint16_t *sim_pixels(void);
int sim_midi_from(unsigned source, unsigned bytes);
int ct_prof_read(unsigned page, uint8_t out[64]);
void ct_prof_reset(void);
void groove_midi_song_note(unsigned track, unsigned note, unsigned velocity);
unsigned groove_sequence_setting(unsigned setting);  /* Task 12 A2: swing (setting 0) */
unsigned sim_smk37_instruments(void);
const uint8_t *sim_state(void);
uint8_t *sim_file(void);
unsigned sim_block_frames(void);
const float *sim_render(void);
const void *sim_lcd_targets(void);
uint8_t *sim_flash(void);
unsigned sim_song_storage_state(void);
int sim_song_storage_initialize(void);
int sim_export(void);
int sim_import(unsigned bytes);
int sim_song_record_read(unsigned song);
int sim_song_record_write(unsigned song);
int sim_song_record_delete(unsigned song);
int sim_block_write(unsigned song, unsigned id, unsigned bytes);
int sim_block_write2(unsigned song, unsigned id, unsigned format, unsigned bytes);
void sim_midi_drain(unsigned on);
void sim_sequence_setting_edit(unsigned setting, int delta);
int sim_block_read(unsigned song, unsigned id);
uint32_t sim_song_free(void);
uint32_t sim_song_reclaimable(void);
int sim_song_compact(void);
int sim_song_load(unsigned song);
int sim_song_play(void);
void sim_song_stop(void);
int sim_song_jump(unsigned row);
uint32_t sim_song_status(unsigned word);
int sim_song_track(unsigned kind, unsigned track, unsigned row);   /* Task 06 */
unsigned groove_midi_input_channel(unsigned track);   /* app/midi_router.c: the channel a track listens on (section 24) */
unsigned sim_song_units(void);
uint32_t sim_song_track_status(unsigned track);
int sim_song_send_setup(void);
uint8_t *sim_batch_buffer(void);
int sim_block_batch(unsigned song, unsigned bytes);
uint32_t groove_crc32(uint32_t crc, const void *data, unsigned bytes);

enum { SMK37_BUTTON, SMK37_KEY, SMK37_PRESSURE, SMK37_PAD, SMK37_ENCODER, SMK37_COMBINATION, SMK37_PEDAL, SMK37_FADER };

static int failures;
#define CHECK(cond, ...) do { \
    int ok_ = (cond) != 0; \
    printf("%s ", ok_ ? "ok  " : "FAIL"); printf(__VA_ARGS__); printf("\n"); \
    if (!ok_) ++failures; \
} while (0)

struct message { unsigned port, bytes; uint8_t data[8]; };

/* Run audio blocks so queued MIDI is polled (Simulator.c polls every 10 ms of audio). */
static void settle(void) { for (int i = 0; i < 8; ++i) (void)sim_render(); }
/* Flash guard test (Task 16): an audio block inside a flash operation, with a note waiting for an A2 pass. */
static unsigned flash_hook_requests;
#define PG32(p_, i_) ((uint32_t)(p_)[4 * (i_)] | (uint32_t)(p_)[4 * (i_) + 1] << 8 | (uint32_t)(p_)[4 * (i_) + 2] << 16 | (uint32_t)(p_)[4 * (i_) + 3] << 24)
static void flash_hook_block(void)
{
    uint8_t pg[64]; (void)ct_diag_read(7, pg); uint32_t before = PG32(pg, 2);
    groove_midi_song_note(0, 70, 100);
    (void)sim_render();
    (void)ct_diag_read(7, pg);
    flash_hook_requests += PG32(pg, 2) - before;
    groove_midi_song_note(0, 70, 0);
}

static unsigned drain(struct message *out, unsigned max)
{
    unsigned n = 0, r;
    while ((r = sim_midi_output()) != 0) {
        if (n < max) {
            out[n].port = r >> 8; out[n].bytes = r & 255U;
            memcpy(out[n].data, sim_file(), out[n].bytes > 8 ? 8 : out[n].bytes);
        }
        ++n;
    }
    return n < max ? n : max;   /* v0.17: never more than were stored (the simulator's capture holds 128 since Task 17; callers index what they got) */
}

static void dump(const struct message *m, unsigned n)
{
    for (unsigned i = 0; i < n; ++i) {
        printf("       port %u:", m[i].port);
        for (unsigned b = 0; b < m[i].bytes && b < 8; ++b) printf(" %02x", m[i].data[b]);
        printf("\n");
    }
}

/* Count channel messages matching status/note/velocity; ports seen in *ports. */
static unsigned count(const struct message *m, unsigned n, unsigned status, unsigned note, unsigned velocity, unsigned *ports)
{
    unsigned hits = 0; *ports = 0;
    for (unsigned i = 0; i < n; ++i)
        if (m[i].bytes == 3 && m[i].data[0] == status && m[i].data[1] == note && m[i].data[2] == velocity) {
            ++hits; *ports |= 1U << m[i].port;
        }
    return hits;
}

static int stray_channel(const struct message *m, unsigned n, unsigned channel)
{
    for (unsigned i = 0; i < n; ++i)
        if (m[i].data[0] < 0xf0 && (m[i].data[0] & 15U) != channel) return 1;
    return 0;
}

static void note_test(unsigned id, unsigned velocity, unsigned channel, const char *label)
{
    struct message m[64]; unsigned n, ports;
    unsigned inst = sim_smk37_instruments();
    int octave = (int)((inst >> 14) & 7U) - 2;
    unsigned note = 48 + id + 12U * (unsigned)octave;
    (void)drain(m, 64);
    CHECK(sim_smk37(SMK37_KEY, id, (int)velocity) == 0, "%s: key %u press accepted", label, id);
    settle();
    n = drain(m, 64);
    unsigned on = count(m, n, 0x90U | channel, note, velocity, &ports);
    CHECK(on > 0, "%s: Note On %u velocity %u on channel %u", label, note, velocity, channel + 1);
    CHECK(ports == 7, "%s: delivered to ports 0, 1 and 2 (mask %u)", label, ports);
    int stray = stray_channel(m, n, channel);
    CHECK(!stray, "%s: no channel message on another channel", label);
    if (on == 0 || ports != 7 || stray) dump(m, n);
    CHECK(sim_smk37(SMK37_KEY, id, 0) == 0, "%s: key release accepted", label);
    settle();
    n = drain(m, 64);
    unsigned off = count(m, n, 0x80U | channel, note, 0, &ports) + count(m, n, 0x90U | channel, note, 0, &ports);
    CHECK(off > 0, "%s: Note Off %u on channel %u", label, note, channel + 1);
    if (off == 0) dump(m, n);
}

/* Task 04: first index >= from of a logged message with the given bytes, or -1. */
struct log_entry { uint8_t s, d1, d2; unsigned block; };
static int find_log(const void *entries, unsigned n, unsigned s, unsigned a, unsigned b, int from)
{
    const struct log_entry *e = entries;
    for (unsigned i = from < 0 ? 0 : (unsigned)from; i < n; ++i) if (e[i].s == s && e[i].d1 == a && e[i].d2 == b) return (int)i;
    return -1;
}
/* ---- Task 05 helpers ---------------------------------------------------------------- */
/* A v2 block under construction: up to 4 timed notes per step, serialised by v2_put. */
struct v2b { uint8_t count[64]; uint8_t notes[64][4][6]; };
static struct v2b vb;
static void v2_note(unsigned step, unsigned pitch, unsigned vel, int offset, uint32_t length, unsigned retrig)
{
    struct timed_note n = { (uint8_t)pitch, (uint8_t)vel, (uint8_t)retrig, (int16_t)offset, length };
    if (timed_note_encode(&n, vb.notes[step][vb.count[step]])) { printf("FAIL v2_note encodes\n"); ++failures; return; }
    vb.count[step]++;
}
static unsigned v2_put(uint8_t *out)
{
    unsigned at = 0;
    for (unsigned s = 0; s < 64; ++s) { out[at++] = vb.count[s]; for (unsigned i = 0; i < vb.count[s]; ++i) { memcpy(out + at, vb.notes[s][i], 6); at += 6; } }
    return at;
}
/* A song record image: magic, version 1, name, tempo, row count; rows set by the caller. */
static void make_record(uint8_t *f, const char *name, unsigned tempo, unsigned rows, unsigned flags)
{
    memset(f, 0, 2624); memset(f + 2624, 0xff, 4096 - 2624); memcpy(f, "FM1G", 4); f[20] = 1;
    memcpy(f + 24, name, 12); f[37] = (uint8_t)flags; f[38] = (uint8_t)tempo; f[39] = (uint8_t)(tempo >> 8); f[40] = (uint8_t)rows;
}
static void make_row(uint8_t *f, unsigned r, const uint16_t ids[8], unsigned repeat, unsigned steps, unsigned flags)
{
    uint8_t *row = f + 64 + 20 * r;
    for (unsigned t = 0; t < 8; ++t) { row[2 * t] = (uint8_t)ids[t]; row[2 * t + 1] = (uint8_t)(ids[t] >> 8); }
    row[16] = (uint8_t)repeat; row[17] = (uint8_t)flags; row[18] = (uint8_t)steps;
}
/* Render until the song stops by itself (or `max` blocks), logging port-1 messages (clock
 * excluded) with the block that enqueued them (sim_midi_drain(1) is on). Block 0 is the
 * first render after sim_song_play. `jump_at` >= 0 queues a jump to `jump_row` at that block. */
static unsigned play_log(struct log_entry *log, unsigned max_log, unsigned *logged, unsigned max, int jump_at, unsigned jump_row)
{
    unsigned blocks = 0, started = 0, tail = 0; *logged = 0;
    for (; blocks < max; ++blocks) {
        if ((int)blocks == jump_at) sim_song_jump(jump_row);
        (void)sim_render();
        struct message m[64]; unsigned n = drain(m, 64);
        for (unsigned k = 0; k < n && k < 64; ++k)
            if (m[k].port == 0 && m[k].data[0] != 0xf8 && *logged < max_log) { log[*logged].s = m[k].data[0]; log[*logged].d1 = m[k].bytes > 1 ? m[k].data[1] : 0; log[*logged].d2 = m[k].bytes > 2 ? m[k].data[2] : 0; log[(*logged)++].block = blocks; }
        unsigned playing = (sim_song_status(0) >> 8) & 255U;
        if (playing) started = 1; else if (started) { if (++tail > 4) { ++blocks; break; } }
    }
    return blocks;
}
/* Note-ons minus note-offs per (channel, pitch) over a log: 0 everywhere = nothing stuck. */
static int stuck(const struct log_entry *log, unsigned n)
{
    static int held[16][128]; memset(held, 0, sizeof held);
    int bad = 0;
    for (unsigned i = 0; i < n; ++i) {
        unsigned st = log[i].s & 0xf0U, ch = log[i].s & 15U;
        if (st == 0x90 && log[i].d2) ++held[ch][log[i].d1]; else if (st == 0x80 || (st == 0x90 && !log[i].d2)) { if (held[ch][log[i].d1] <= 0) ++bad; else --held[ch][log[i].d1]; }
    }
    for (unsigned c = 0; c < 16; ++c) for (unsigned p = 0; p < 128; ++p) if (held[c][p]) ++bad;
    return bad;
}
/* Print the (channel, pitch) pairs a log leaves held or over-released (section 13 diagnostics). */
static void stuck_report(const struct log_entry *log, unsigned n)
{
    static int held[16][128]; memset(held, 0, sizeof held);
    for (unsigned i = 0; i < n; ++i) {
        unsigned st = log[i].s & 0xf0U, ch = log[i].s & 15U;
        if (st == 0x90 && log[i].d2) ++held[ch][log[i].d1]; else if (st == 0x80 || (st == 0x90 && !log[i].d2)) --held[ch][log[i].d1];
    }
    for (unsigned c = 0; c < 16; ++c) for (unsigned p = 0; p < 128; ++p) if (held[c][p]) {
        printf("       channel %u pitch %u: %+d\n", c + 1, p, held[c][p]);
        for (unsigned i = 0; i < n; ++i) if ((log[i].s & 15U) == c && log[i].d1 == p && (log[i].s & 0xe0U) == 0x80) printf("         %02x %u %u at block %u\n", log[i].s, log[i].d1, log[i].d2, log[i].block);
    }
}
/* The block whose window holds unit position u at `tempo`: p_k = floor(k * tempo * 1024 / 11025). */
static unsigned block_of(uint64_t u, unsigned tempo)
{ return (unsigned)(((u + 1) * 11025 + tempo * 1024 - 1) / (tempo * 1024)) - 1; }
/* Task 16: one remote-control request through the real SysEx path (USB source), and its reply payload. */
static unsigned token = 100;
static struct message rc_log[128]; static unsigned rc_n;   /* what else the device sent while a request waited */
static int any_on(const struct message *m, unsigned n, unsigned vel)
{ for (unsigned i = 0; i < n; ++i) if (m[i].port == 0 && (m[i].data[0] & 0xf0U) == 0x90 && m[i].data[2] == vel) return 1; return 0; }
static int any_off(const struct message *m, unsigned n)
{ for (unsigned i = 0; i < n; ++i) if (m[i].port == 0 && ((m[i].data[0] & 0xf0U) == 0x80 || ((m[i].data[0] & 0xf0U) == 0x90 && !m[i].data[2]))) return 1; return 0; }
static unsigned rc_source;   /* the port the request arrives on (0 DIN, 1 USB): the reply goes back there */
static int rcmd(unsigned cmd, const uint8_t *d, unsigned n, uint8_t *outp)
{
    uint8_t *f = sim_file(); unsigned at = 0, bits = 0, v = 0, sum = 0;
    f[at++] = 0xf0; f[at++] = 0x7d; f[at++] = 'F'; f[at++] = 'M'; f[at++] = 2; f[at++] = (uint8_t)cmd;
    ++token; f[at++] = token & 127U; f[at++] = (uint8_t)(token >> 7);
    for (unsigned i = 0; i < n; ++i) { v |= (unsigned)d[i] << bits; bits += 8; while (bits >= 7) { f[at++] = v & 127U; v >>= 7; bits -= 7; } }
    if (bits) f[at++] = v & 127U;
    for (unsigned i = 1; i < at; ++i) sum += f[i];
    f[at++] = (uint8_t)((0U - sum) & 127U); f[at++] = 0xf7;
    (void)sim_midi_from(rc_source, at);
    for (unsigned pass = 0; pass < 40; ++pass) {
        unsigned r;
        while ((r = sim_midi_output()) != 0) {
            unsigned len = r & 255U;
            if (!(len > 8 && sim_file()[0] == 0xf0) && rc_n < 128) { rc_log[rc_n].port = r >> 8; rc_log[rc_n].bytes = len; memcpy(rc_log[rc_n].data, sim_file(), len > 8 ? 8 : len); ++rc_n; }
            if (len > 8 && sim_file()[0] == 0xf0 && sim_file()[5] == (cmd | 64U)) {
                const uint8_t *g = sim_file(); unsigned bb = 0, vv = 0, cnt = 0;
                for (unsigned i = 8; i + 2 < len; ++i) { vv |= (unsigned)g[i] << bb; bb += 7; if (bb >= 8) { outp[cnt++] = (uint8_t)vv; vv >>= 8; bb -= 8; } }
                return (int)cnt;
            }
        }
        for (unsigned i = 0; i < 4; ++i) (void)sim_render();
    }
    return -1;
}

#include "v1_reference.inc"
void song_test_launch_grace(unsigned blocks);
int main(void)
{
    song_test_launch_grace(0);   /* tabby-v1.4: the launch tests below queue on the bar line itself and expect the next one; the grace has its own test */
    /* 2. Initialization with cleared storage (the workbench's first-run path). */
    sim_boot(1);
    const uint8_t *state = sim_state();
    CHECK(state != NULL, "sim_state snapshot readable (page %u)", state ? state[0] : 0);
    CHECK(sim_block_frames() == 128, "audio block is 128 frames (%u)", sim_block_frames());
    CHECK(sim_lcd_targets() != NULL, "LCD target table readable");
    unsigned inst = sim_smk37_instruments();
    unsigned track = inst & 7U, channel = sim_midi_setting(track, 1), ports = sim_midi_setting(track, 2);
    CHECK(track == 0 && channel == 0, "default keyboard track 0 on MIDI channel 1 (track %u, channel %u)", track, channel + 1);
    CHECK(ports == 7, "default destinations: all three ports (mask %u)", ports);
    CHECK(sim_midi_setting(track, 4) == 1, "KEY OUT (live output) enabled by default");

    /* 3. Keyboard note -> MIDI on the expected channel. */
    sim_midi_capture(1);
    note_test(12, 100, channel, "default");

    /* Move the keyboard track's output channel 1 -> 3 and check the note follows. */
    sim_midi_edit(track, 1, +2);
    unsigned moved = sim_midi_setting(track, 1);
    CHECK(moved == 2, "track %u output channel set to 3 (channel %u)", track, moved + 1);
    /* A settings change resets the old channel on the next poll (stop, sustain off,
     * all sound off, wheel/bend/pressure neutral) and releases held notes; let that
     * finish before playing, exactly as a user would after turning the encoder. */
    { struct message m[64]; settle(); unsigned n = drain(m, 64);
      unsigned ports_; unsigned reset = count(m, n, 0xb0U | channel, 120, 0, &ports_);
      CHECK(reset > 0 && ports_ == 7, "controller reset (all sound off) sent on the old channel %u", channel + 1); }
    note_test(12, 100, moved, "channel 3");

    /* 4. Audio keeps rendering. */
    const float *out = sim_render(); int finite = 1;
    for (unsigned i = 0; i < sim_block_frames() * 2; ++i) if (!isfinite(out[i])) finite = 0;
    CHECK(finite, "render output finite");

    /* ---- 5. song storage migration (Task 03 a) ---------------------------------------- */
    {
        /* Task 12 A1: LIBRARY is any sector inside the region (it was the V01 DX7 library's 516096). */
        enum { REGION = 69632, TUNING = CT_USER_BYTES - 4096, LIBRARY = TUNING - 4 * 4096, OLD_DATA = 2, READY = 1 };
        uint8_t *flash = sim_flash();
        unsigned st = sim_song_storage_state();
        CHECK((st & 255U) == READY && (st >> 8) == 0, "cleared flash: song region READY, 0 old sectors (state %u, old %u)", st & 255U, st >> 8);
        /* Plant a V01 sample bank header, a DX7 library bank, and markers outside the region. */
        memcpy(flash + REGION, "FM1S", 4); memset(flash + REGION + 4, 0x11, 28);
        memcpy(flash + LIBRARY, "FMB1", 4); memset(flash + LIBRARY + 4, 0x22, 28);
        memcpy(flash + REGION - 4096, "KEEP", 4);  /* staging sector 16, below the region */
        memcpy(flash + TUNING, "TUNE", 4);         /* tuning sector, above the region */
        sim_boot(0);
        st = sim_song_storage_state();
        CHECK((st & 255U) == OLD_DATA, "old sample/DX7 data detected (state %u)", st & 255U);
        CHECK((st >> 8) == 2, "exactly the two planted sectors are old (%u)", st >> 8);
        CHECK(!memcmp(flash + REGION, "FM1S", 4), "nothing erased before confirmation");
        CHECK(sim_song_storage_initialize() == 0, "confirmed erase accepted");
        st = sim_song_storage_state();
        CHECK((st & 255U) == READY && (st >> 8) == 0, "after erase: READY, 0 old sectors (state %u)", st & 255U);
        unsigned clean = 1;
        for (unsigned i = 0; i < 4096; ++i) clean &= flash[REGION + i] == 0xff && flash[LIBRARY + i] == 0xff;
        CHECK(clean, "planted sectors erased to 0xFF");
        CHECK(!memcmp(flash + REGION - 4096, "KEEP", 4), "staging sector below the region untouched");
        CHECK(!memcmp(flash + TUNING, "TUNE", 4), "tuning sector above the region untouched");
        CHECK(sim_song_storage_initialize() != 0, "erase refused when nothing is old");
    }
    /* ---- 6. sampler removal: a V01 project with a sampler track loads on the 808 --------- */
    {
        /* Export the workspace project, mark track 0 as GROOVE_SAMPLE (type byte at offset
         * 2048 of the 4064-byte image: preset[0].type) and import it back: the sampler is
         * gone (Task 03 a), so the track must come back as an 808 kit. (Checkpoint (f): the
         * factory scene this test used to build is gone too; see web/scenes/.) */
        uint8_t *f = sim_file();
        int r = sim_export();
        CHECK(r == 0, "workspace project exported (%d)", r);
        /* preset[0] becomes a bare sampler preset: type GROOVE_SAMPLE, volume 100, 8 pads,
         * zeroed parameters (the validator checks the sampler parameter ranges). */
        memset(f + 2048, 0, 223); f[2048] = 5; f[2048 + 1] = 100; f[2048 + 222] = 8;
        memset(f, 0, 256);                /* track 0's 64 step cells: a drum track holds pad masks */
        r = sim_import(4064);             /* the bare project; the exported tuning block is not needed */
        CHECK(r == 0, "project with a sampler track imported into the simulator (%d)", r);
        const uint8_t *st8 = sim_state();
        unsigned sampler = 0;
        for (unsigned t = 0; t < 8; ++t) sampler |= st8[8 + t * 20] == 5;
        CHECK(!sampler, "no track uses the sampler source");
        CHECK(st8[8] == 2, "the former sampler track plays on the 808 (source %u)", st8[8]);
    }

    /* ---- 7. song storage and playback (Task 03 d) --------------------------------------- */
    {
        uint8_t *f = sim_file();
        /* Block payloads (assessment 9.3): 64 steps, header + 3 bytes per note. */
        uint8_t block1[64 + 6], block2[64 + 3];
        memset(block1, 0, sizeof block1); memset(block2, 0, sizeof block2);
        unsigned at = 0;
        block1[at++] = 1; block1[at++] = 60; block1[at++] = 100; block1[at++] = 2; /* step 0: C4, 2 steps */
        at += 3;                                                                /* steps 1..3 empty */
        block1[at++] = 1; block1[at++] = 62; block1[at++] = 90; block1[at++] = 1;  /* step 4: D4, 1 step */
        block2[0] = 1; block2[1] = 64; block2[2] = 80; block2[3] = 1;             /* step 0: E4 */
        memcpy(f, block1, sizeof block1);
        int r = sim_block_write(0, 1, sizeof block1);
        CHECK(r == 0, "block 1 of song 0 appended (%d)", r);
        memcpy(f, block2, sizeof block2);
        r = sim_block_write(0, 2, sizeof block2);
        CHECK(r == 0, "block 2 of song 0 appended (%d)", r);
        r = sim_block_read(0, 1);
        /* Task 05: a stored v1 block reads back upgraded to timed notes (9.12): 6 bytes a note,
         * offset 0, length L x 480 units; the upgrade is checked field by field in section 11. */
        CHECK(r == 76 && f[0] == 1 && f[1] == 60 && f[2] == 100 && (f[5] | f[6] << 8) == 960 && f[7] == 0 && f[10] == 1 && f[11] == 62, "block 1 reads back upgraded (%d bytes)", r);
        CHECK(sim_block_read(0, 3) < 0, "a missing block id is reported");
        block1[1] = 61; memcpy(f, block1, sizeof block1); block1[1] = 60;
        CHECK(sim_block_write(0, 1, sizeof block1) == 0, "block 1 rewritten (stale copy left behind)");
        r = sim_block_read(0, 1);
        CHECK(r == 76 && f[1] == 61, "the newest copy of block 1 is live (pitch %u)", f[1]);
        /* Song record (9.5 v0.4): two rows of 16 steps, track 0 to MIDI channel 5. */
        memset(f, 0, 4096); memcpy(f, "FM1G", 4);
        f[20] = 1; memcpy(f + 24, "HOST TEST   ", 12); f[36] = 0; f[37] = 0; f[40] = 2; f[42] = 0;
        f[48] = 5;
        f[64] = 1; f[64 + 16] = 1; f[64 + 18] = 16;            /* row 0: block 1, x1, 16 steps */
        f[84] = 2; f[84 + 16] = 1; f[84 + 18] = 16;            /* row 1: block 2, x1, 16 steps */
        r = sim_song_record_write(0);
        CHECK(r == 0, "song record 0 written (%d)", r);
        memset(f, 0, 4096);
        r = sim_song_record_read(0);
        CHECK(r == 0 && !memcmp(f + 24, "HOST TEST   ", 12) && f[40] == 2 && f[84] == 2, "song record 0 reads back (%d)", r);
        CHECK(sim_song_record_read(1) == 1, "song 1 is empty");
        uint32_t reclaim = sim_song_reclaimable(), before = sim_song_free();
        CHECK(reclaim == 76, "stale copy of block 1 is reclaimable (%u bytes = 6 + 70, 4-aligned)", reclaim);
        r = sim_song_compact();
        CHECK(r == 0 && sim_song_reclaimable() == 0 && sim_song_free() == before + 76, "compaction reclaims it (%d, free %u -> %u)", r, before, sim_song_free());
        r = sim_block_read(0, 1);
        CHECK(r == 76 && f[1] == 61, "block 1 still live after compaction");
        /* Playback: the song moves track 0 from its device channel to channel 5. The
         * factory import above reset the device preferences, so read the channel now. */
        unsigned device_channel = sim_midi_setting(0, 1);
        r = sim_song_load(0);
        CHECK(r == 0, "song 0 loaded (%d)", r);
        sim_midi_capture(1); { struct message m[64]; (void)drain(m, 64); }
        r = sim_song_play();
        CHECK(r == 0, "song 0 started (%d)", r);
        const uint8_t *st = sim_state(); unsigned tempo = st[8 + 10] | st[8 + 11] << 8;
        unsigned blocks_per_step = (unsigned)(44100.0 * 60.0 / 4.0 / tempo / 128.0 + 1);
        unsigned on60 = 0, off60 = 0, on62 = 0, on64 = 0, start = 0, stop = 0, stray = 0, first64 = 0, blocks = 0;
        for (unsigned i = 0; i < blocks_per_step * 40; ++i) {
            (void)sim_render(); ++blocks;
            struct message m[64]; unsigned n = drain(m, 64), p;
            on60 += count(m, n, 0x94, 61, 100, &p); off60 += count(m, n, 0x84, 61, 0, &p);
            on62 += count(m, n, 0x94, 62, 90, &p);
            unsigned e = count(m, n, 0x94, 64, 80, &p); if (e && !first64) first64 = blocks; on64 += e;
            for (unsigned k = 0; k < n && k < 64; ++k) {
                if (m[k].data[0] == 0xfa) ++start; else if (m[k].data[0] == 0xfc) ++stop;
                else if (m[k].data[0] < 0xf0 && (m[k].data[0] & 15U) != 4 && (m[k].data[0] & 0xf0U) != 0xb0) ++stray;
            }
        }
        /* Every message reaches the three ports, so one event counts 3. */
        CHECK(start == 3, "song start sent MIDI Start once to 3 ports (%u)", start);
        CHECK(on60 == 3 && off60 == 3, "row 0 step 0: C#4 on channel 5 once with its note-off (%u/%u)", on60, off60);
        CHECK(on62 == 3, "row 0 step 4: D4 on channel 5 (%u)", on62);
        CHECK(on64 == 3 && first64 > 15 * blocks_per_step && first64 < 18 * blocks_per_step,
              "row 1 follows after 16 steps (E4 at block %u, step ~%u)", first64, blocks_per_step ? first64 / blocks_per_step : 0);
        CHECK(stray == 0, "no song note left the override channel");
        CHECK(stop == 3 && (sim_song_status(0) >> 8 & 255U) == 0, "song ended after its last row: Stop sent once, stopped (%u)", stop);
        CHECK(sim_song_status(2) == 0, "no row underruns (%u)", sim_song_status(2));
        /* The device channel applies again after the song. */
        CHECK(sim_midi_setting(0, 1) == device_channel, "device OUT CH unchanged by the song (%u)", device_channel + 1);
        note_test(12, 100, device_channel, "after song");
        /* Queued jump: row 0 x4 then row 1; a jump queued at once lands at the next bar. */
        r = sim_song_record_read(0); f[64 + 16] = 4; f[37] = 1; /* loop the song */
        CHECK(sim_song_record_write(0) == 0, "song record rewritten with row 0 x4 and loop");
        /* ---- tabby-v1.2: a start taken by the audio interrupt while song_poll looks at the song (docs/BUILD.md 65.6) ----
         * Up to tabby-v1.1 song_poll read `playing` and then `start_request`; an interrupt between the two made it leave
         * the song while the audio thread played on (no scene decoded any more, the device's channels). Both places an
         * interrupt can fall are tried: the song must still be the control task's afterwards. */
        {
            extern unsigned song_test_interrupt; extern void song_poll(void);
            for (unsigned point = 1; point <= 2; ++point) {
                sim_song_stop(); settle(); settle();
                CHECK(sim_song_load(0) == 0, "start race: the song loads");
                song_test_interrupt = point;
                CHECK(sim_song_play() == 0, "start race: PLAY");
                song_poll();
                struct song_status st; song_status_read(&st);
                CHECK(song_test_interrupt == 0 && st.playing == 1 && st.track_row[0] != SONG_NONE,
                      "start race: the audio thread takes the start %s: the song is still held (playing %u, track 1 on row %u)",
                      point == 1 ? "before song_poll reads `playing`" : "between its two reads", st.playing, st.track_row[0]);
            }
            sim_song_stop(); settle(); settle();
        }

        CHECK(sim_song_load(0) == 0 && sim_song_play() == 0, "song restarted");
        CHECK(sim_song_jump(1) == 0, "jump to row 1 queued");
        first64 = 0; blocks = 0;
        for (unsigned i = 0; i < blocks_per_step * 40 && !first64; ++i) {
            (void)sim_render(); ++blocks;
            struct message m[64]; unsigned n = drain(m, 64), p;
            if (count(m, n, 0x94, 64, 80, &p)) first64 = blocks;
        }
        CHECK(first64 > 15 * blocks_per_step && first64 < 18 * blocks_per_step, "jump landed at the next bar (block %u)", first64);
        CHECK((sim_song_status(0) >> 8 & 255U) == 1, "looping song still playing");
        sim_song_stop(); settle(); settle();
        CHECK((sim_song_status(0) >> 8 & 255U) == 0, "song stopped on request");
        { struct message m[64]; (void)drain(m, 64); }
        sim_midi_capture(0);
        CHECK(sim_song_record_delete(0) == 0 && sim_song_record_read(0) == 1, "song 0 deleted");
    }

    /* ---- 8. batched block upload (Task 03 e, assessment 9.6 / 9.9 v0.5) ---------------- */
    {
        enum { REGION = 69632, BLOCKS = REGION + 17 * 4096, POOL = SECTORS * 4076, FULL = 832, REC = 840 };   /* Task 12 A1 */
        uint8_t *flash = sim_flash(), *f = sim_file(), *s = sim_batch_buffer();
        /* Song 1 record first (9.6 v0.5): row 0 plays blocks 10..17 on tracks 1..8, row 1
         * blocks 18..21 on tracks 1..4 (20 and 21 arrive later; a record may reference blocks
         * that are still to come). Since (f) a block only a row references is live. */
        memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "BATCH TEST  ", 12); f[40] = 2;
        for (unsigned t = 0; t < 8; ++t) f[64 + 2 * t] = (uint8_t)(10 + t);
        f[64 + 16] = 1; f[64 + 18] = 16;
        for (unsigned t = 0; t < 4; ++t) f[84 + 2 * t] = (uint8_t)(18 + t);
        f[84 + 16] = 1; f[84 + 18] = 16;
        CHECK(sim_song_record_write(1) == 0, "song 1 record written before its blocks");
        /* Ten full-size blocks (64 steps x 4 notes = 832 bytes, 840 per record): four fit a
         * sector, so the stream must pack into three sectors (4 + 4 + 2). Ids 10..19. */
        unsigned at = 0;
        for (unsigned id = 10; id < 20; ++id) {
            memset(s + at, 0, 6); s[at + 2] = (uint8_t)id; s[at + 4] = FULL & 255; s[at + 5] = FULL >> 8;
            uint8_t *p = s + at + 6;
            for (unsigned step = 0; step < 64; ++step) {
                *p++ = 4;
                for (unsigned n = 0; n < 4; ++n) { *p++ = (uint8_t)(30 + 10 * n + (id - 10)); *p++ = 100; *p++ = 1; }
            }
            memset(s + at + 6 + FULL, 0xff, REC - 6 - FULL);
            at += REC;
        }
        uint32_t before = sim_song_free();
        int r = sim_block_batch(1, at);
        CHECK(r == 0, "batch of 10 x 832-byte blocks stored (%d)", r);
        r = sim_block_read(1, 10);
        CHECK(r == 1600 && f[1] == 30 && f[7] == 40, "block 10 reads back from the batch upgraded (%d bytes, pitches %u %u)", r, f[1], f[7]);
        r = sim_block_read(1, 19);
        CHECK(r == 1600 && f[1] == 39, "block 19 (last of the batch) reads back (%d bytes, pitch %u)", r, f[1]);
        unsigned members = 0, pending = 0, staging_clear = 1;
        for (unsigned b = 0; b < SECTORS; ++b) {
            const uint8_t *h = flash + BLOCKS + b * 4096;
            if (memcmp(h, "FM1B", 4)) continue;
            if (h[5] == 0xff) ++pending; else if (h[12] & 2) ++members;
        }
        for (unsigned i = 0; i < 4096; ++i) staging_clear &= flash[REGION + i] == 0xff;
        CHECK(members == 3 && pending == 0, "three committed batch sectors, none pending (%u/%u)", members, pending);
        CHECK(staging_clear, "staging sector erased after the batch");
        CHECK(sim_song_free() == POOL - 10 * REC && sim_song_reclaimable() == 0,
              "free space fell by exactly the stream (%u -> %u, reclaimable %u)", before, sim_song_free(), sim_song_reclaimable());
        /* A second batch supersedes block 10 (pitch 99) and adds block 20; the end padding
         * may be omitted (9.9 v0.5). */
        memset(s, 0, 6); s[2] = 10; s[4] = 67; uint8_t *p = s + 6; *p++ = 1; *p++ = 99; *p++ = 100; *p++ = 1;
        memset(p, 0, 63); at = 6 + 67; memset(s + at, 0xff, 1); at += 1;   /* 74 -> pad to 76 */
        at += 2; memset(s + at, 0, 6); s[at + 2] = 20; s[at + 4] = 67; p = s + at + 6; *p++ = 1; *p++ = 77; *p++ = 100; *p++ = 1;
        memset(p, 0, 63); at += 6 + 67;                                     /* no final padding */
        r = sim_block_batch(1, at);
        CHECK(r == 0, "second batch (two short records, unpadded end) stored (%d)", r);
        r = sim_block_read(1, 10);
        CHECK(r == 70 && f[1] == 99, "newest copy of block 10 is the batch one (pitch %u)", f[1]);
        CHECK(sim_block_read(1, 20) == 70 && f[1] == 77, "block 20 added by the second batch");
        CHECK(sim_song_reclaimable() == REC, "the superseded 832-byte block 10 is reclaimable (%u)", sim_song_reclaimable());
        /* Bad streams change nothing: a zero length, and a record for another song. */
        before = sim_song_free();
        memset(s, 0, 6); s[2] = 30;
        CHECK(sim_block_batch(1, 70) == -7, "stream with payload length 0 rejected");
        s[0] = 3; s[4] = 67; memset(s + 6, 0, 67);
        CHECK(sim_block_batch(1, 73) == -7, "record claiming another song rejected");
        CHECK(sim_song_free() == before, "nothing stored by rejected batches");
        /* Power cut before the commit: a pending sector (header byte 5 = 0xFF) with no
         * journal. Planted by copying the committed sector of block 20 (CRC excludes the
         * header) into an erased sector; a reboot must erase it and keep the rest. */
        unsigned src = SECTORS, dst = SECTORS;
        for (unsigned b = 0; b < SECTORS; ++b) {
            const uint8_t *h = flash + BLOCKS + b * 4096;
            if (!memcmp(h, "FM1B", 4) && h[6] == 2 && src == SECTORS) src = b;
            if (h[0] == 0xff && dst == SECTORS) dst = b;
        }
        CHECK(src < SECTORS && dst < SECTORS, "found the two-record batch sector (%u) and an erased sector (%u)", src, dst);
        memcpy(flash + BLOCKS + dst * 4096, flash + BLOCKS + src * 4096, 4096);
        flash[BLOCKS + dst * 4096 + 5] = 0xff;
        sim_boot(0);
        unsigned st = sim_song_storage_state();
        CHECK((st & 255U) == 1, "reboot with an uncommitted batch member: storage READY, not old data (%u)", st & 255U);
        unsigned erased_again = 1;
        for (unsigned i = 0; i < 4096; ++i) erased_again &= flash[BLOCKS + dst * 4096 + i] == 0xff;
        CHECK(erased_again, "uncommitted pending sector erased at boot");
        CHECK(sim_block_read(1, 20) == 70 && f[1] == 77, "committed blocks survive the reboot");
        /* Power cut after the commit: a pending sector holding block 21 (pitch 55) with a
         * committed journal listing it. A reboot must finalize it (byte 5 -> 0). */
        uint8_t *img = flash + BLOCKS + dst * 4096;
        memset(img, 0xff, 4096); memcpy(img, "FM1B", 4); img[4] = 1; img[5] = 0xff; img[6] = 1; img[7] = 0;
        img[8] = 1000 & 255; img[9] = 1000 >> 8; img[10] = 0; img[11] = 0; img[12] = 2; img[13] = 0;
        img[20] = 1; img[21] = 0; img[22] = 21; img[23] = 0; img[24] = 67; img[25] = 0;
        img[26] = 1; img[27] = 55; img[28] = 100; img[29] = 1; memset(img + 30, 0, 63);
        uint32_t c = ~groove_crc32(~0U, img + 20, 4096 - 20);
        for (unsigned i = 0; i < 4; ++i) img[16 + i] = (uint8_t)(c >> (8 * i));
        uint8_t *j = flash + REGION;
        memset(j, 0xff, 4096); memcpy(j, "FM1Q", 4); j[4] = 1; j[5] = 1; j[6] = 1; j[7] = 0;
        j[8] = 1000 & 255; j[9] = 1000 >> 8; j[10] = 0; j[11] = 0; j[20] = (uint8_t)(17 + dst);
        c = ~groove_crc32(~0U, j + 20, 16);
        for (unsigned i = 0; i < 4; ++i) j[16 + i] = (uint8_t)(c >> (8 * i));
        memset(j + 4092, 0, 4);
        sim_boot(0);
        st = sim_song_storage_state();
        CHECK((st & 255U) == 1 && img[5] == 0 && !memcmp(img, "FM1B", 4), "reboot with a committed journal: sector finalized (state %u, byte 5 = %u)", st & 255U, img[5]);
        staging_clear = 1;
        for (unsigned i = 0; i < 4096; ++i) staging_clear &= flash[REGION + i] == 0xff;
        CHECK(staging_clear, "journal erased after recovery");
        CHECK(sim_block_read(1, 21) == 70 && f[1] == 55, "block 21 from the recovered batch is live (pitch %u)", f[1]);
        /* The song plays its batch block: row 0 is block 10 (pitch 99 at step 0). */
        sim_midi_capture(1);
        CHECK(sim_song_load(1) == 0 && sim_song_play() == 0, "song 1 loads and plays from batch blocks");
        unsigned on99 = 0;
        for (unsigned i = 0; i < 64 && !on99; ++i) {
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64), ports;
            if (count(m, n, 0x90 | sim_midi_setting(0, 1), 99, 100, &ports)) on99 = 1;
        }
        CHECK(on99, "block 10's note from the batch sounded");
        sim_song_stop(); settle(); settle(); { struct message m[64]; (void)drain(m, 64); } sim_midi_capture(0);
        /* Deleting the song makes every batch sector garbage; the full compaction pass
         * erases such sectors outright (v0.5) and the pool is empty again. */
        CHECK(sim_song_record_delete(1) == 0, "song 1 deleted");
        r = sim_song_compact();
        unsigned formatted = 0;
        for (unsigned b = 0; b < SECTORS; ++b) if (!memcmp(flash + BLOCKS + b * 4096, "FM1B", 4)) ++formatted;
        CHECK(r == 0 && formatted == 0 && sim_song_free() == POOL, "compaction erased every garbage-only sector (%d, %u left, free %u)", r, formatted, sim_song_free());
    }

    /* ---- 9. checkpoint (f): tempo range and delete-before-replace ----------------------- */
    {
        uint8_t *f = sim_file();
        memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "TEMPO TEST  ", 12); f[40] = 1; f[64 + 16] = 1;
        f[38] = 29; CHECK(sim_song_record_write(4) == -7, "tempo override 29 rejected");
        f[38] = 301 & 255; f[39] = 301 >> 8; CHECK(sim_song_record_write(4) == -7, "tempo override 301 rejected");
        f[38] = 30; f[39] = 0; CHECK(sim_song_record_write(4) == 0, "tempo override 30 accepted");
        f[38] = 300 & 255; f[39] = 300 >> 8; CHECK(sim_song_record_write(4) == 0, "tempo override 300 accepted");
        f[38] = 0; f[39] = 0; CHECK(sim_song_record_write(4) == 0, "tempo override 0 (project tempo) accepted");
        CHECK(sim_song_record_delete(4) == 0, "tempo test song deleted");
        /* Replacing a song the way the workbench's song write does since (f): delete, then
         * write. Song 5 (A) has blocks 1 and 2; B uses block 3 only. After the delete A's
         * blocks are garbage (reclaimable), B's block is live, and one compaction leaves the
         * pool with one copy: free = A's free + 152 (A's two records) - 76 (B's one). */
        uint8_t blk[67]; memset(blk, 0, sizeof blk); blk[0] = 1; blk[1] = 60; blk[2] = 100; blk[3] = 1;
        memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "REPLACE A   ", 12); f[40] = 1; f[64] = 1; f[66] = 2; f[64 + 16] = 1;
        CHECK(sim_song_record_write(5) == 0, "song 5 (A) record written");
        memcpy(f, blk, sizeof blk);
        CHECK(sim_block_write(5, 1, sizeof blk) == 0 && sim_block_write(5, 2, sizeof blk) == 0, "song 5 (A) blocks 1 and 2 stored");
        uint32_t free_a = sim_song_free();
        CHECK(sim_song_reclaimable() == 0, "nothing reclaimable while A is live");
        CHECK(sim_song_record_delete(5) == 0, "song 5 deleted before the replacement");
        CHECK(sim_song_reclaimable() == 2 * 76, "A's two blocks are garbage after the delete (%u)", sim_song_reclaimable());
        memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "REPLACE B   ", 12); f[40] = 1; f[64] = 3; f[64 + 16] = 1;
        CHECK(sim_song_record_write(5) == 0, "song 5 (B) record written");
        memcpy(f, blk, sizeof blk);
        CHECK(sim_block_write(5, 3, sizeof blk) == 0, "song 5 (B) block 3 stored");
        CHECK(sim_song_reclaimable() == 2 * 76, "A's blocks stay reclaimable under B (%u)", sim_song_reclaimable());
        int r = sim_song_compact();
        CHECK(r == 0 && sim_song_reclaimable() == 0 && sim_song_free() == free_a + 76, "one compaction leaves one copy (free %u, expected %u)", sim_song_free(), free_a + 76);
        CHECK(sim_block_read(5, 3) == 70 && sim_block_read(5, 1) < 0, "B's block is live, A's block is gone");
        CHECK(sim_song_record_delete(5) == 0, "song 5 deleted");
    }


    /* ---- 10. row events (Task 04, assessment 9.11 v0.6) ---------------------------------- */
    {
        enum { SONG = 6, REGION = 69632, EVENTS = 2624, FIRST = 2632 };
        uint8_t *f = sim_file(), *flash = sim_flash();
        uint8_t blk[67]; memset(blk, 0, sizeof blk); blk[0] = 1; blk[1] = 60; blk[2] = 100; blk[3] = 1;
        memcpy(f, blk, sizeof blk);
        CHECK(sim_block_write(SONG, 1, sizeof blk) == 0, "events: block 1 of song 7 stored");
        /* A version-2 record: three rows of 16 steps, block 1 on track 1, and six events:
         * row 0: PC 7 on ch 5, CC 74 = 96 on ch 1; row 1: bank MSB 1 + PC 9 on ch 2, a 250 ms
         * gap, PC 1 on ch 3; row 2: a 250 ms gap, then CC 7 = 100 on ch 4. */
        static const uint8_t ev[7][5] = {{0, 0x04, 7, 0, 0}, {0, 0x20, 74, 96, 0}, {1, 0x11, 1, 0xff, 9},
                                         {1, 0x30, 250, 0, 0}, {1, 0x02, 1, 0, 0}, {2, 0x30, 250, 0, 0}, {2, 0x23, 7, 100, 0}};
        #define EVENT_RECORD(rows_, version_) do { \
            memset(f, 0, 2624); memset(f + 2624, 0xff, 4096 - 2624); memcpy(f, "FM1G", 4); f[20] = (version_); \
            memcpy(f + 24, "EVENT TEST  ", 12); f[40] = (rows_); \
            for (unsigned r_ = 0; r_ < (rows_); ++r_) { f[64 + 20 * r_] = 1; f[64 + 20 * r_ + 16] = 1; f[64 + 20 * r_ + 18] = 16; } \
            if ((version_) == 2) { f[EVENTS] = 7; f[EVENTS + 1] = 0; f[EVENTS + 2] = 1; f[EVENTS + 3] = 0; memset(f + EVENTS + 4, 0, 4); memcpy(f + FIRST, ev, sizeof ev); } \
        } while (0)
        EVENT_RECORD(3, 2);
        int r = sim_song_record_write(SONG);
        CHECK(r == 0, "events: version-2 record with seven events written (%d)", r);
        memset(f, 0, 4096);
        r = sim_song_record_read(SONG);
        CHECK(r == 0 && f[20] == 2 && f[EVENTS] == 7 && !memcmp(f + FIRST, ev, sizeof ev) && f[4091] == 0xff, "events: record reads back with its table (%d)", r);
        /* Play it through, logging port-1 messages in order with their block. */
        struct log { uint8_t s, d1, d2; unsigned block; } log[512]; unsigned logged = 0, blocks = 0;
        #define PLAY_LOG(stop_when) do { logged = 0; blocks = 0; int tail_ = -1; \
            for (unsigned i = 0; i < 6000 && tail_ != 0; ++i) { (void)sim_render(); ++blocks; \
                struct message m[64]; unsigned n = drain(m, 64); \
                for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && m[k].data[0] != 0xf8 && logged < 512) {   /* clock skipped */ log[logged].s = m[k].data[0]; log[logged].d1 = m[k].bytes > 1 ? m[k].data[1] : 0; log[logged].d2 = m[k].bytes > 2 ? m[k].data[2] : 0; log[logged].block = blocks; ++logged; } \
                if (tail_ > 0) --tail_; else if (stop_when) tail_ = 8; } } while (0)
        #define FIND(st_, a_, b_, from_) find_log(log, logged, (st_), (a_), (b_), (from_))
        sim_midi_capture(1);
        CHECK(sim_song_load(SONG) == 0 && sim_song_status(3) == 7, "events: song loads, status reports 7 events (%u)", sim_song_status(3));
        CHECK(sim_song_play() == 0, "events: song plays");
        unsigned ch = sim_midi_setting(0, 1), on = 0x90 | ch;
        PLAY_LOG(blocks > 40 && (sim_song_status(0) >> 8 & 255U) == 0);
        int start = FIND(0xfa, 0, 0, 0), pc5 = FIND(0xc4, 7, 0, 0), cc1 = FIND(0xb0, 74, 96, 0), note0 = FIND(on, 60, 100, 0);
        CHECK(start >= 0 && pc5 > start && cc1 > pc5 && note0 > cc1, "row 0: Start, then PC ch5 and CC ch1 in order, then the first note (%d %d %d %d)", start, pc5, cc1, note0);
        int note1 = FIND(on, 60, 100, note0 + 1), note2 = FIND(on, 60, 100, note1 + 1);
        int msb = FIND(0xb1, 0, 1, 0), pc2 = FIND(0xc1, 9, 0, 0), pc3 = FIND(0xc2, 1, 0, 0), cc4 = FIND(0xb3, 7, 100, 0);
        CHECK(note1 > 0 && note2 > note1, "three rows played their note (%d %d %d)", note0, note1, note2);
        CHECK(msb > 0 && pc2 == msb + 1, "row 1: bank MSB (CC 0 = 1) immediately before PC 9 on ch2 (%d %d)", msb, pc2);
        CHECK(pc3 > pc2 && pc3 < note1 && log[pc3].block - log[msb].block >= 80 && log[pc3].block - log[msb].block <= 95,
              "row 1: the 250 ms gap pre-fired: PC ch3 %u blocks after the bank select, still before row 1's note", pc3 > 0 ? log[pc3].block - log[msb].block : 0);
        CHECK(note1 - log[note1].block == note1 - log[note1].block && log[pc3].block <= log[note1].block && log[msb].block < log[note1].block, "row 1: events land at or before the boundary block");
        CHECK(cc4 > note1 && cc4 < note2 && log[note2].block - log[cc4].block <= 2, "row 2: the gapped CC 7 on ch4 pre-fired to land just before row 2's note (%u blocks before)", cc4 > 0 ? log[note2].block - log[cc4].block : 0);
        CHECK(FIND(0xc4, 7, 0, pc5 + 1) < 0 && FIND(0xb1, 0, 1, msb + 1) < 0 && FIND(0xc2, 1, 0, pc3 + 1) < 0 && FIND(0xb3, 7, 100, cc4 + 1) < 0, "every event fired exactly once");
        CHECK((sim_song_status(2) >> 16) == 0 && (sim_song_status(2) & 0xffffU) == 0, "no late rows, no underruns (%u)", sim_song_status(2) >> 16);
        CHECK((sim_song_status(0) >> 8 & 255U) == 0 && FIND(0xfc, 0, 0, 0) > cc4, "song ended by itself after row 2");
        /* Queued jump: from row 0 straight to row 2 (bar mode: lands at row 0's end). */
        { struct message m[64]; (void)drain(m, 64); }
        CHECK(sim_song_play() == 0 && sim_song_jump(2) == 0, "events: play again and queue a jump to row 3");
        PLAY_LOG(blocks > 40 && (sim_song_status(0) >> 8 & 255U) == 0);
        note0 = FIND(on, 60, 100, 0); note1 = FIND(on, 60, 100, note0 + 1); cc4 = FIND(0xb3, 7, 100, 0);
        CHECK(note1 > 0 && cc4 > note0 && cc4 < note1 && FIND(0xb1, 0, 1, 0) < 0, "jump: row 3's CC fired before its note, row 2's events never fired");
        CHECK((sim_song_status(2) >> 16) == 0, "jump with enough lead: not late");
        /* A jump to row 3 queued at the last step of row 1: less than one step to the bar
         * but row 3's lead is 87 blocks, so its stream starts at the boundary, the gapped CC
         * lands after row 3's note, and the row entry is counted late. */
        { struct message m[64]; (void)drain(m, 64); }
        CHECK(sim_song_play() == 0, "events: play again");
        for (unsigned i = 0; i < 3000 && (sim_song_status(0) >> 24) != 15; ++i) { (void)sim_render(); struct message m[64]; (void)drain(m, 64); }
        CHECK((sim_song_status(0) >> 24) == 15 && sim_song_jump(2) == 0, "jump to row 3 queued at step 16 of row 1");
        PLAY_LOG(blocks > 40 && (sim_song_status(0) >> 8 & 255U) == 0);
        note1 = FIND(on, 60, 100, 0); cc4 = FIND(0xb3, 7, 100, 0);
        CHECK(note1 >= 0 && cc4 > note1 && log[cc4].block - log[note1].block >= 80, "late jump: the gapped CC lands %u blocks after row 3's note", cc4 > 0 && note1 >= 0 ? log[cc4].block - log[note1].block : 0);
        CHECK((sim_song_status(2) >> 16) == 1, "late counter is 1 (%u)", sim_song_status(2) >> 16);
        sim_song_stop(); settle(); settle(); { struct message m[64]; (void)drain(m, 64); }
        /* SEND SETUP while stopped: row 0's events, no Start, no notes. */
        CHECK(sim_song_send_setup() == 0, "SEND SETUP accepted while stopped");
        PLAY_LOG(blocks >= 12);
        CHECK(FIND(0xc4, 7, 0, 0) >= 0 && FIND(0xb0, 74, 96, 0) >= 0 && FIND(0xfa, 0, 0, 0) < 0 && FIND(on, 60, 100, 0) < 0, "SEND SETUP sent row 1's two events and nothing else (%u messages)", logged);
        CHECK(sim_song_play() == 0 && sim_song_send_setup() == -3, "SEND SETUP refused while playing");
        sim_song_stop(); settle(); settle(); { struct message m[64]; (void)drain(m, 64); } sim_midi_capture(0);
        /* A version-1 record still loads and reports no events. */
        EVENT_RECORD(3, 1);
        CHECK(sim_song_record_write(7) == 0 && sim_song_load(7) == 0 && sim_song_status(3) == 0, "version-1 record loads with 0 events");
        /* Bad tables are rejected at the write. */
        EVENT_RECORD(3, 2); f[EVENTS] = 293 & 255; f[EVENTS + 1] = 293 >> 8;
        CHECK(sim_song_record_write(7) == -7, "293 events rejected");
        EVENT_RECORD(3, 2); f[FIRST + 5 * 5] = 3;
        CHECK(sim_song_record_write(7) == -7, "event row 3 of a 3-row song rejected");
        EVENT_RECORD(3, 2); f[FIRST + 5 * 2] = 2; f[FIRST + 5 * 5] = 1;
        CHECK(sim_song_record_write(7) == -7, "unsorted rows rejected");
        EVENT_RECORD(3, 2); f[FIRST + 5 * 3 + 2] = 0;
        CHECK(sim_song_record_write(7) == -7, "gap of 0 ms rejected");
        EVENT_RECORD(3, 2); f[FIRST + 5 * 0 + 1] = 0x44;
        CHECK(sim_song_record_write(7) == -7, "event type 4 rejected");
        EVENT_RECORD(3, 2); f[EVENTS] = 33; for (unsigned i = 0; i < 33; ++i) { uint8_t *e = f + FIRST + 5 * i; e[0] = 0; e[1] = 0x20; e[2] = 1; e[3] = 1; e[4] = 0; }
        CHECK(sim_song_record_write(7) == -7, "33 events in one row rejected");
        EVENT_RECORD(3, 2); f[4000] = 0;
        CHECK(sim_song_record_write(7) == -7, "a non-0xFF byte after the table rejected");
        EVENT_RECORD(3, 2); f[EVENTS + 2] = 2;
        CHECK(sim_song_record_write(7) == -7, "table version 2 rejected");
        /* A corrupted table on flash fails the version-2 CRC: the song reads as invalid. */
        flash[REGION + (1 + SONG) * 4096 + FIRST + 2] ^= 1;
        CHECK(sim_song_load(SONG) == -7, "corrupted event byte: version-2 CRC rejects the record");
        flash[REGION + (1 + SONG) * 4096 + FIRST + 2] ^= 1;
        CHECK(sim_song_load(SONG) == 0, "restored byte: the record loads again");
        CHECK(sim_song_record_delete(SONG) == 0 && sim_song_record_delete(7) == 0, "event test songs deleted");
        #undef EVENT_RECORD
        #undef PLAY_LOG
        #undef FIND
    }

    /* ---- 11. timed notes (Task 05): scheduling at unit resolution ----------------------- */
    {
        enum { TEMPO = 120, U = 480, SONG = 9 };
        uint8_t *f = sim_file();
        static struct log_entry log[4096]; unsigned logged;
        sim_midi_drain(1);   /* measure the sequencer, not the simulator's 10 ms control poll */
        /* Song A: offsets at and inside the limits, two notes 12 units apart, a negative
         * offset on the first step of row 2. Channels 1, 2, 3 for tracks 1..3. */
        memset(&vb, 0, sizeof vb);
        v2_note(2, 65, 100, -240, 480, 0); v2_note(4, 60, 100, 1, 480, 0); v2_note(8, 62, 100, -1, 480, 0); v2_note(12, 64, 100, 240, 240, 0);
        unsigned n1 = v2_put(f);
        CHECK(sim_block_write2(SONG, 1, 1, n1) == 0, "timed: block 1 (format 1, %u bytes) stored", n1);
        memset(&vb, 0, sizeof vb); v2_note(6, 36, 100, 0, 480, 0); v2_note(6, 38, 100, 12, 480, 0);
        CHECK(sim_block_write2(SONG, 2, 1, v2_put(f)) == 0, "timed: block 2 stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 48, 100, -120, 480, 0);
        CHECK(sim_block_write2(SONG, 3, 1, v2_put(f)) == 0, "timed: block 3 stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 60, 100, 0, 240, 0);
        CHECK(sim_block_write2(SONG, 4, 1, v2_put(f)) == 0, "timed: block 4 stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 72, 100, -5, 4000, 0); v2_note(8, 74, 100, 100, 3000, 0); v2_note(3, 76, 100, 0, 6000, 1);
        CHECK(sim_block_write2(SONG, 5, 1, v2_put(f)) == 0, "timed: block 5 stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 60, 100, 240, 480, 0); unsigned n6 = v2_put(f); f[3] = 0xf1;   /* offset byte: +241 */
        CHECK(sim_block_write2(SONG, 6, 1, n6) != 0, "timed: a block with offset +241 is refused");
        f[3] = 0xf0; f[4] = 0x02;                                                                    /* e = 1 with m = 480: non-canonical */
        CHECK(sim_block_write2(SONG, 6, 1, n6) != 0, "timed: a block with a non-canonical length is refused");
        { uint16_t r0[8] = {1, 2, 0, 0, 0, 0, 0, 0}, r1[8] = {0, 0, 3, 0, 0, 0, 0, 0};
          make_record(f, "TIMED A     ", TEMPO, 2, 0); f[48] = 1; f[49] = 2; f[50] = 3;
          make_row(f, 0, r0, 1, 16, 0); make_row(f, 1, r1, 1, 16, 0); }
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0, "timed: song A written and loaded");
        sim_midi_capture(1); { struct message m[64]; (void)drain(m, 64); }
        CHECK(sim_song_play() == 0, "timed: song A plays");
        unsigned blocks = play_log(log, 4096, &logged, 4000, -1, 0);
        #define ON_AT(ch_, pitch_) find_log(log, logged, 0x90U | (ch_), (pitch_), 100, 0)
        #define OFF_AT(ch_, pitch_) find_log(log, logged, 0x80U | (ch_), (pitch_), 0, 0)
        #define AT(i_) ((i_) >= 0 ? log[i_].block : 999999U)
        CHECK(AT(ON_AT(0, 65)) == block_of(2 * U - 240, TEMPO), "timed: offset -240 on step 3 plays at block %u (expected %u)", AT(ON_AT(0, 65)), block_of(2 * U - 240, TEMPO));
        CHECK(AT(ON_AT(0, 60)) == block_of(4 * U + 1, TEMPO), "timed: offset +1 plays at block %u (expected %u)", AT(ON_AT(0, 60)), block_of(4 * U + 1, TEMPO));
        CHECK(AT(ON_AT(0, 62)) == block_of(8 * U - 1, TEMPO), "timed: offset -1 plays at block %u (expected %u)", AT(ON_AT(0, 62)), block_of(8 * U - 1, TEMPO));
        CHECK(AT(ON_AT(0, 64)) == block_of(12 * U + 240, TEMPO) && AT(OFF_AT(0, 64)) == block_of(12 * U + 480, TEMPO), "timed: offset +240 plays at block %u and ends 240 units later at %u", AT(ON_AT(0, 64)), AT(OFF_AT(0, 64)));
        CHECK(AT(OFF_AT(0, 60)) == block_of(5 * U + 1, TEMPO), "timed: a 480-unit note ends 480 units after its own start (block %u)", AT(OFF_AT(0, 60)));
        { int a = ON_AT(1, 36), b = ON_AT(1, 38); unsigned want = block_of(6 * U + 12, TEMPO) - block_of(6 * U, TEMPO);
          CHECK(a >= 0 && b > a && AT(b) >= AT(a) && AT(b) - AT(a) + 1 >= want && AT(b) - AT(a) <= want + 1, "timed: two notes 12 units (3.1 ms) apart leave in order, %u block(s) apart (expected %u)", AT(b) - AT(a), want); }
        CHECK(AT(ON_AT(2, 48)) == block_of(16 * U - 120, TEMPO) && AT(ON_AT(2, 48)) < block_of(16 * U, TEMPO), "timed: offset -120 on row 2's first step plays before the boundary (block %u, boundary %u)", AT(ON_AT(2, 48)), block_of(16 * U, TEMPO));
        CHECK(AT(OFF_AT(2, 48)) == block_of(16 * U + 360, TEMPO), "timed: and ends 480 units after its start (block %u)", AT(OFF_AT(2, 48)));
        CHECK(((sim_song_status(2) >> 16) & 0xffffU) == 0 && (sim_song_status(2) & 0xffffU) == 0, "timed: song A: nothing late, no underruns");
        /* The transport sends Song Position Pointer then Start at PLAY (midi_router.c). */
        CHECK(stuck(log, logged) == 0 && find_log(log, logged, 0xfa, 0, 0, 0) <= 1 && log[logged - 1].s == 0xfc, "timed: song A: Start first, Stop last, every note-on has its note-off (%u messages, %u blocks)", logged, blocks);
        if (stuck(log, logged) || find_log(log, logged, 0xfa, 0, 0, 0) > 1 || log[logged - 1].s != 0xfc) for (unsigned i = 0; i < logged; ++i) printf("       %02x %3u %3u at block %u\n", log[i].s, log[i].d1, log[i].d2, log[i].block);
        /* Song B: row 1 loops here; a jump to row 2 queued inside the last half step lands at
         * the bar; row 2's step-0 note with offset -120 then plays at the boundary and the
         * entry counts as late. */
        { uint16_t r0[8] = {4, 0, 0, 0, 0, 0, 0, 0}, r1[8] = {0, 0, 3, 0, 0, 0, 0, 0};
          make_record(f, "TIMED B     ", TEMPO, 2, 0); f[48] = 1; f[49] = 2; f[50] = 3;
          make_row(f, 0, r0, 1, 16, 1); make_row(f, 1, r1, 1, 16, 0); }
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0 && sim_song_play() == 0, "timed: song B (loop-here row) plays");
        { struct message m[64]; (void)drain(m, 64); }
        unsigned bar = block_of(16 * U, TEMPO);
        blocks = play_log(log, 4096, &logged, 4000, (int)bar - 9, 1);
        CHECK(AT(ON_AT(2, 48)) == bar, "timed: late jump: the -120 note plays at the boundary block %u (expected %u)", AT(ON_AT(2, 48)), bar);
        CHECK(((sim_song_status(2) >> 16) & 0xffffU) == 1, "timed: late counter is 1 (%u)", (sim_song_status(2) >> 16) & 0xffffU);
        CHECK(stuck(log, logged) == 0, "timed: song B: no stuck notes");
        /* Song C: long notes across row changes and jumps, stopped while they sound. */
        { uint16_t r0[8] = {5, 1, 0, 0, 0, 0, 0, 0}, r1[8] = {1, 5, 0, 0, 0, 0, 0, 0}, r2[8] = {5, 5, 0, 0, 0, 0, 0, 0};
          make_record(f, "TIMED C     ", TEMPO, 3, 1); f[48] = 1; f[49] = 2;
          make_row(f, 0, r0, 1, 16, 0); make_row(f, 1, r1, 2, 32, 0); make_row(f, 2, r2, 1, 16, 0); }
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0 && sim_song_play() == 0, "timed: song C (long notes, looping) plays");
        { struct message m[64]; (void)drain(m, 64); }
        blocks = play_log(log, 4096, &logged, 900, 300, 2);
        unsigned part = logged;
        blocks += play_log(log + part, 4096 - part, &logged, 500, 100, 0); logged += part;
        sim_song_stop(); { unsigned more; part = logged; (void)play_log(log + part, 4096 - part, &more, 60, -1, 0); logged += more; }
        CHECK(stuck(log, logged) == 0 && find_log(log, logged, 0xfc, 0, 0, 0) >= 0 && ((sim_song_status(0) >> 8) & 255U) == 0, "timed: song C: jumps and a stop while notes sound leave nothing stuck (%u messages)", logged);
        /* Song D: ten minutes at 120 BPM, a note every step: every note-on in the block the
         * exact clock predicts, so no drift. 206719 blocks of audio. */
        { uint16_t r0[8] = {4, 0, 0, 0, 0, 0, 0, 0};
          make_record(f, "TIMED D     ", TEMPO, 1, 1); f[48] = 1;
          make_row(f, 0, r0, 64, 16, 0); }
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0 && sim_song_play() == 0, "timed: song D (10 minutes) plays");
        { struct message m[64]; (void)drain(m, 64); }
        /* Block 4 holds one note on step 0: one note-on per 16-step pass, 7680 units apart. */
        unsigned ons = 0, bad = 0, worst = 0, k = 0;
        for (blocks = 0; blocks < 206719; ++blocks) {
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned i = 0; i < n && i < 64; ++i) if (m[i].port == 0 && m[i].data[0] == 0x90 && m[i].data[2]) {
                unsigned want = block_of((uint64_t)k * 16 * U, TEMPO), err = blocks > want ? blocks - want : want - blocks;
                if (err) ++bad; if (err > worst) worst = err;
                ++ons; ++k;
            }
        }
        sim_song_stop(); settle(); settle(); { struct message m[64]; (void)drain(m, 64); }
        unsigned want_ons = (unsigned)((uint64_t)206719 * TEMPO * 1024 / 11025 / (16 * U)) + 1;
        CHECK(ons == want_ons && bad == 0, "timed: song D: %u note-ons in 10 minutes (expected %u), every one in its predicted block (worst error %u blocks, %u off)", ons, want_ons, worst, bad);
        sim_midi_capture(0); sim_midi_drain(0);
        CHECK(sim_song_record_delete(SONG) == 0, "timed: test song deleted");
        #undef ON_AT
        #undef OFF_AT
        #undef AT
    }

    /* ---- 12. v1 songs play as on tabby-v02.0 (Task 05) ------------------------------------ */
    {
        enum { SONG = 10 };
        uint8_t *f = sim_file();
        static struct log_entry log[4096]; unsigned logged;
        for (unsigned i = 0; i < sizeof v1ref_blocks / sizeof v1ref_blocks[0]; ++i) {
            memcpy(f, v1ref_blocks[i].bytes, v1ref_blocks[i].length);
            CHECK(sim_block_write(SONG, v1ref_blocks[i].id, v1ref_blocks[i].length) == 0, "v1 reference: block %u stored as format 0", v1ref_blocks[i].id);
        }
        memcpy(f, v1ref_record, 2624); memset(f + 2624, 0xff, 4096 - 2624);
        CHECK(sim_song_record_write(SONG) == 0, "v1 reference: record written");
        sim_midi_drain(1);
        for (unsigned swing = 0; swing <= 25; swing += 25) {
            const struct v1ref_msg *ref = swing ? v1ref_swing25 : v1ref_swing0;
            unsigned count = swing ? sizeof v1ref_swing25 / sizeof v1ref_swing25[0] : sizeof v1ref_swing0 / sizeof v1ref_swing0[0];
            sim_sequence_setting_edit(0, -60); if (swing) sim_sequence_setting_edit(0, (int)swing);
            CHECK(sim_song_load(SONG) == 0, "v1 reference: song loads (swing %u)", swing);
            sim_midi_capture(1); { struct message m[64]; (void)drain(m, 64); }
            CHECK(sim_song_play() == 0, "v1 reference: plays (swing %u)", swing);
            (void)play_log(log, 4096, &logged, 20000, -1, 0);
            sim_midi_capture(0);
            /* Note for note: every reference message is matched by one of ours with the same
             * bytes within one block (tabby-v02.0 interleaved the two router lanes inside a
             * block; the order inside a block is not musical), nothing is left over, and per
             * (channel, pitch) the sequence of note-ons and note-offs is identical. */
            static uint8_t used[4096]; memset(used, 0, sizeof used);
            unsigned matched = 0, worst = 0, first_bad = count;
            for (unsigned i = 0; i < count; ++i) {
                int hit = -1;
                for (unsigned j = 0; j < logged; ++j) {
                    unsigned d = log[j].block > ref[i].block ? log[j].block - ref[i].block : ref[i].block - log[j].block;
                    if (!used[j] && log[j].s == ref[i].s && log[j].d1 == ref[i].d1 && log[j].d2 == ref[i].d2 && d <= 1) { hit = (int)j; if (d > worst) worst = d; break; }
                }
                if (hit < 0) { if (first_bad == count) first_bad = i; continue; }
                used[hit] = 1; ++matched;
            }
            unsigned ordered = 1;
            for (unsigned ch = 0; ch < 16 && ordered; ++ch) for (unsigned pitch = 0; pitch < 128 && ordered; ++pitch) {
                unsigned a = 0, b = 0;
                for (;;) {
                    while (a < count && !((ref[a].s & 0xe0U) == 0x80 && (ref[a].s & 15U) == ch && ref[a].d1 == pitch)) ++a;
                    while (b < logged && !((log[b].s & 0xe0U) == 0x80 && (log[b].s & 15U) == ch && log[b].d1 == pitch)) ++b;
                    if (a >= count || b >= logged) { ordered = a >= count && b >= logged; break; }
                    if (ref[a].s != log[b].s || ref[a].d2 != log[b].d2) { ordered = 0; break; }
                    ++a; ++b;
                }
            }
            CHECK(matched == count && logged == count, "v1 reference (swing %u): every one of the %u tabby-v02.0 messages matched within one block, none extra (got %u, matched %u)", swing, count, logged, matched);
            if (first_bad < count) printf("       first unmatched reference message %u: %02x %u %u at block %u\n", first_bad, ref[first_bad].s, ref[first_bad].d1, ref[first_bad].d2, ref[first_bad].block);
            CHECK(ordered, "v1 reference (swing %u): per pitch, the same sequence of note-ons and note-offs", swing);
            CHECK(worst <= 1, "v1 reference (swing %u): worst block difference %u", swing, worst);
        }
        sim_sequence_setting_edit(0, -60); sim_midi_drain(0);
        CHECK(sim_song_record_delete(SONG) == 0, "v1 reference: song deleted");
    }

    /* ---- 13. independent track launching (Task 06, 9.13) ------------------------------- */
    {
        /* Build with -DLAUNCH_DEBUG to trace the clock and every message of this section. */
#ifdef LAUNCH_DEBUG
        #define DBG13(blocks_) do { if ((blocks_) % 20 == 0) printf("dbg block %u master %u bar %u row %u rep %u step %u T1 %08x T3 %08x late %u\n", (blocks_), sim_song_units(), sim_song_status(4) & 0xffffU, (sim_song_status(0) >> 16) & 255U, sim_song_status(1) & 255U, (sim_song_status(0) >> 24) & 255U, (unsigned)sim_song_track_status(0), (unsigned)sim_song_track_status(2), (sim_song_status(2) >> 16) & 0xffffU); } while (0)
        #define DBG13M(m_, blocks_) printf("dbg   msg %02x %u %u at %u\n", (m_).data[0], (m_).bytes > 1 ? (m_).data[1] : 0, (m_).bytes > 2 ? (m_).data[2] : 0, (blocks_))
#else
        #define DBG13(blocks_) do {} while (0)
        #define DBG13M(m_, blocks_) do {} while (0)
#endif
        enum { TEMPO = 120, U = 480, BARU = 16 * U, SONG = 11 };
        uint8_t *f = sim_file();
        static struct log_entry log[8192]; unsigned logged = 0, blocks = 0;
        sim_midi_drain(1);
        #define RUN(n_) do { unsigned n__ = (unsigned)(n_); for (unsigned r_ = 0; r_ < n__; ++r_) { (void)sim_render(); \
            struct message m_[64]; unsigned k_ = drain(m_, 64); \
            for (unsigned j_ = 0; j_ < k_ && j_ < 64; ++j_) if (m_[j_].port == 0 && m_[j_].data[0] != 0xf8 && logged < 8192) { \
                log[logged].s = m_[j_].data[0]; log[logged].d1 = m_[j_].bytes > 1 ? m_[j_].data[1] : 0; log[logged].d2 = m_[j_].bytes > 2 ? m_[j_].data[2] : 0; log[logged].block = blocks; ++logged; DBG13M(m_[j_], blocks); } \
            DBG13(blocks); ++blocks; } } while (0)
        #define RUN_TO(block_) RUN((block_) > blocks ? (block_) - blocks : 0)
        #define ON_AT(ch_, pitch_, from_) find_log(log, logged, 0x90U | (ch_), (pitch_), 100, (from_))
        #define OFF_AT(ch_, pitch_, from_) find_log(log, logged, 0x80U | (ch_), (pitch_), 0, (from_))
        #define AT(i_) ((i_) >= 0 ? log[i_].block : 999999U)
        #define BAR(n_) block_of((uint64_t)(n_) * BARU, TEMPO)
        #define TSTATE(t_) (sim_song_track_status(t_) & 3U)
        #define TQUEUE(t_) ((sim_song_track_status(t_) >> 2) & 3U)
        #define TROW(t_) ((sim_song_track_status(t_) >> 8) & 255U)
        #define LATE() ((sim_song_status(2) >> 16) & 0xffffU)
        /* Count note-ons of (channel, pitch) whose block is exactly block_of(u) for u in a list. */
        /* Blocks: 10 hats every step (T1), 11 bass (T2), 12 melody A, 13 melody B with a note
         * ringing 3 steps past the bar, 14 a step-0 note with offset -120, 15 a 48-step
         * pattern, 16 a two-bar note. */
        memset(&vb, 0, sizeof vb); for (unsigned s = 0; s < 64; ++s) v2_note(s, 42, 100, 0, 240, 0);
        CHECK(sim_block_write2(SONG, 10, 1, v2_put(f)) == 0, "launch: block 10 (hats) stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 36, 100, 0, 480, 0); v2_note(8, 38, 100, 0, 480, 0);
        CHECK(sim_block_write2(SONG, 11, 1, v2_put(f)) == 0, "launch: block 11 (bass) stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 60, 100, 0, 480, 0); v2_note(4, 64, 100, 0, 480, 0); v2_note(8, 67, 100, 0, 480, 0);
        CHECK(sim_block_write2(SONG, 12, 1, v2_put(f)) == 0, "launch: block 12 (melody A) stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 72, 100, 0, 480, 0); v2_note(15, 76, 100, 0, 1920, 0);
        CHECK(sim_block_write2(SONG, 13, 1, v2_put(f)) == 0, "launch: block 13 (melody B) stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 48, 100, -120, 480, 0);
        CHECK(sim_block_write2(SONG, 14, 1, v2_put(f)) == 0, "launch: block 14 (offset -120) stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 50, 100, 0, 480, 0); v2_note(32, 52, 100, 0, 480, 0);
        CHECK(sim_block_write2(SONG, 15, 1, v2_put(f)) == 0, "launch: block 15 (48-step pattern) stored");
        memset(&vb, 0, sizeof vb); v2_note(0, 55, 100, 0, 2 * BARU, 0);
        CHECK(sim_block_write2(SONG, 16, 1, v2_put(f)) == 0, "launch: block 16 (two-bar note) stored");
        /* Song E (loops): row 0 x2 (16 steps), row 1 (16), row 2 (48). Channels 10, 2, 3, 4, 5,
         * 6 for T1..T6. Version-2 record with events: row 1: PC 10 on channel 3 then a 20 ms
         * gap (track 3's device), PC 20 on channel 7 (no track: a pedal); row 2: PC 5 on
         * channel 5. */
        { uint16_t r0[8] = {10, 11, 12, 0, 0, 0, 0, 0}, r1[8] = {10, 11, 13, 14, 0, 16, 0, 0}, r2[8] = {10, 0, 12, 14, 15, 0, 0, 0};
          make_record(f, "LAUNCH E    ", TEMPO, 3, 1); f[20] = 2;
          f[48] = 10; f[49] = 2; f[50] = 3; f[51] = 4; f[52] = 5; f[53] = 6;
          make_row(f, 0, r0, 2, 16, 0); make_row(f, 1, r1, 1, 16, 0); make_row(f, 2, r2, 1, 48, 0);
          uint8_t ev[4][5] = {{1, 2 | 0 << 4, 10, 0, 0}, {1, 2 | 3 << 4, 20, 0, 0}, {1, 6 | 0 << 4, 20, 0, 0}, {2, 4 | 0 << 4, 5, 0, 0}};
          f[2624] = 4; f[2625] = 0; f[2626] = 1; f[2627] = 0; memset(f + 2628, 0, 4);
          for (unsigned i = 0; i < 4; ++i) memcpy(f + 2632 + 5 * i, ev[i], 5); }
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0, "launch: song E written and loaded");
        sim_midi_capture(1); { struct message m[64]; (void)drain(m, 64); }
        CHECK(sim_song_play() == 0, "launch: song E plays");
        /* 1. A launch on T3 (pattern 1 = row 1, block 13) queued in bar 0 lands at bar 1:
         *    its PC 10 leaves 20 ms (7 blocks) before the bar, the first note at the bar,
         *    the other tracks' notes are untouched, the bar count and MIDI clock run on. */
        RUN(20);
        CHECK(sim_song_track(0, 2, 1) == 0, "launch: T3 pattern 1 queued at block 20");
        CHECK(TSTATE(2) == 0 && TQUEUE(2) == 1 && ((sim_song_track_status(2) >> 16) & 255U) == 1, "launch: status shows T3 following with pattern 1 queued (%08x)", (unsigned)sim_song_track_status(2));
        RUN_TO(BAR(2) + 5);
        { int on72 = ON_AT(2, 72, 0), pc = find_log(log, logged, 0xc2, 10, 0, 0);
          unsigned gap = (20 * 44100 + 128000 - 1) / 128000;   /* 7 blocks */
          CHECK(AT(on72) == BAR(1), "launch: T3's first note plays at bar 1 (block %u, expected %u)", AT(on72), BAR(1));
          CHECK(pc >= 0 && AT(pc) + gap + 1 >= BAR(1) && AT(pc) + gap <= BAR(1) + 1 && pc < on72, "launch: PC 10 on channel 3 left %u block(s) before the note (block %u)", AT(on72) - AT(pc), AT(pc));
          { int pedal = find_log(log, logged, 0xc6, 20, 0, 0);
            CHECK(pedal >= 0 && AT(pedal) + 1 >= BAR(2), "launch: the pedal's PC 20 (channel 7) fired for the row entry at bar 2 only (block %u), not for the launch", AT(pedal)); }
          CHECK(TSTATE(2) == 1 && TQUEUE(2) == 0 && TROW(2) == 1, "launch: T3 is launched on pattern 1 (%08x)", (unsigned)sim_song_track_status(2)); }
        { unsigned bad = 0, from = 0;
          for (unsigned k = 0; k < 32; ++k) { int i = ON_AT(9, 42, (int)from); if (AT(i) != block_of((uint64_t)k * U, TEMPO)) ++bad; if (i >= 0) from = (unsigned)i + 1; }
          CHECK(bad == 0, "launch: T1's 32 hats over bars 0-1 stay in their blocks (%u off)", bad); }
        { int b36 = ON_AT(1, 36, 0); int b36b = ON_AT(1, 36, b36 + 1);
          CHECK(AT(b36) == BAR(0) && AT(b36b) == BAR(1), "launch: T2's bass keeps its bars (%u, %u)", AT(b36), AT(b36b)); }
        CHECK((sim_song_status(4) & 0xffffU) == 2, "launch: the master clock is at bar 2 (%u)", sim_song_status(4) & 0xffffU);
        CHECK(((sim_song_status(0) >> 16) & 255U) == 1, "launch: the song playhead entered row 1 at bar 2 (row %u)", (sim_song_status(0) >> 16) & 255U);
        /* 2. The song advanced to row 1 at bar 2; T3 (detached) ignored it: its pattern loops
         *    (note 72 at bar 2 again), and row 1's own block 13 did not start twice. */
        RUN_TO(BAR(3) + 5);
        { int a = ON_AT(2, 72, 0), b = ON_AT(2, 72, a + 1), c = ON_AT(2, 72, b + 1);
          CHECK(AT(b) == BAR(2) && AT(c) == BAR(3), "launch: the detached T3 loops its pattern at bars 2 and 3 (%u, %u)", AT(b), AT(c)); }
        /* 3. Two presses before the bar keep the last: T3 pattern 0 (row 0: block 12) then
         *    pattern 2 (row 2: block 12 too, 48 steps). Then a stop. */
        CHECK(sim_song_track(0, 2, 0) == 0 && sim_song_track(0, 2, 2) == 0, "launch: two presses queued on T3");
        CHECK(((sim_song_track_status(2) >> 16) & 255U) == 2, "launch: the later press replaced the earlier one (queued %u)", (sim_song_track_status(2) >> 16) & 255U);
        RUN_TO(BAR(4) + 5);
        { int on60 = ON_AT(2, 60, 0); while (on60 >= 0 && AT(on60) < BAR(4)) on60 = ON_AT(2, 60, on60 + 1);
          int on72 = ON_AT(2, 72, 0), last72 = on72; while (last72 >= 0) { int n = ON_AT(2, 72, last72 + 1); if (n < 0) break; last72 = n; }
          CHECK(AT(on60) == BAR(4) && AT(last72) == BAR(3), "launch: pattern 2 starts at bar 4 (block %u), pattern 1's last start was bar 3 (%u)", AT(on60), AT(last72));
          CHECK(TROW(2) == 2, "launch: T3 plays pattern 2 (%u)", TROW(2)); }
        /* 4. A quantized stop releases every sounding note at the bar: T6 launches the
         *    two-bar note at bar 5, T4 the -120 note; stops queued in bar 6 land at bar 7 with
         *    the note-offs at bar 7, including the note that would have been pre-fired. */
        CHECK(sim_song_track(0, 5, 1) == 0 && sim_song_track(0, 3, 1) == 0 && sim_song_track(1, 2, 0) == 0, "launch: T6 and T4 queued, T3 stop queued");
        RUN_TO(BAR(6) + 20);
        { int on55 = ON_AT(5, 55, 0); while (on55 >= 0 && AT(on55) < BAR(4)) on55 = ON_AT(5, 55, on55 + 1);
          int on48 = ON_AT(3, 48, 0); while (on48 >= 0 && AT(on48) < BAR(4)) on48 = ON_AT(3, 48, on48 + 1);
          CHECK(AT(on55) == BAR(5) && AT(on48) == block_of(5 * BARU - 120, TEMPO), "launch: T6's long note at bar 5 (%u), T4's -120 note before it (%u)", AT(on55), AT(on48)); }
        CHECK(TSTATE(2) == 2 && TROW(2) == 255, "launch: T3 stopped at bar 6 (%08x)", (unsigned)sim_song_track_status(2));
        CHECK(sim_song_track(1, 5, 0) == 0 && sim_song_track(1, 3, 0) == 0, "launch: stops queued on T6 and T4 in bar 6");
        CHECK(TQUEUE(5) == 2 && TQUEUE(3) == 2, "launch: pending stops shown");
        RUN_TO(BAR(8) + 5);
        { int off55 = OFF_AT(5, 55, 0); while (off55 >= 0 && AT(off55) < BAR(5)) off55 = OFF_AT(5, 55, off55 + 1);
          int on48 = ON_AT(3, 48, 0), last48 = on48; while (last48 >= 0) { int n = ON_AT(3, 48, last48 + 1); if (n < 0) break; last48 = n; }
          int off48 = OFF_AT(3, 48, last48);
          CHECK(AT(off55) == BAR(7), "launch: the two-bar note got its note-off at the stop bar (block %u, bar 7 = %u)", AT(off55), BAR(7));
          CHECK(AT(off48) <= BAR(7) && AT(last48) < BAR(7) + 2, "launch: the -120 note's last note-off is at or before bar 7 (%u), nothing after", AT(off48));
          CHECK(ON_AT(5, 55, off55) < 0 && ON_AT(3, 48, off48 + 1) < 0, "launch: stopped tracks play nothing after their bar"); }
        CHECK(TSTATE(5) == 2 && TSTATE(3) == 2 && ((sim_song_status(0) >> 8) & 255U) == 1, "launch: T6 and T4 stopped, the song still plays");
        /* 5. Back to song: T3 re-attaches at the next bar and plays the song's row from
         *    where it stands; a scene jump then re-attaches everything. */
        CHECK(sim_song_track(2, 2, 0) == 0 && TQUEUE(2) == 3, "launch: back to song queued on T3");
        RUN_TO(BAR(9) + 5);
        CHECK(TSTATE(2) == 0 && TROW(2) == ((sim_song_status(0) >> 16) & 255U), "launch: T3 follows the song again (row %u)", TROW(2));
        CHECK(sim_song_track(0, 5, 1) == 0 && sim_song_jump(0) == 0, "launch: a launch on T6 then a scene jump to row 1 queued");
        CHECK(TQUEUE(5) == 0, "launch: the scene jump cleared T6's queue");
        RUN_TO(BAR(10) + 5);
        { unsigned all = 1; for (unsigned t = 0; t < 8; ++t) if (TSTATE(t) != 0 || TQUEUE(t) != 0) all = 0;
          CHECK(all && ((sim_song_status(0) >> 16) & 255U) == 0, "launch: after the jump every track follows row 1 (row %u)", (sim_song_status(0) >> 16) & 255U); }
        CHECK(AT(ON_AT(1, 36, (int)logged - 40 > 0 ? (int)logged - 40 : 0)) >= BAR(9), "launch: T2's bass (silent while stopped? no: it followed) plays in the jumped row");
        /* 6. A late press: T3 pattern 1 queued one block before bar 11: the pattern enters in
         *    phase at the next control poll, its downbeat is skipped and counted late. */
        { unsigned late0 = LATE();
          RUN_TO(BAR(11) - 1);
          CHECK(sim_song_track(0, 2, 1) == 0, "launch: T3 pattern 1 queued one block before bar 11");
          RUN_TO(BAR(12) + 5);
          CHECK(LATE() > late0, "launch: the late press counts late (%u -> %u)", late0, LATE());
          CHECK(TSTATE(2) == 1 && TROW(2) == 1, "launch: T3 is launched on pattern 1 after the late press");
          int on72 = ON_AT(2, 72, 0), last = on72; while (last >= 0) { int n = ON_AT(2, 72, last + 1); if (n < 0) break; last = n; }
          CHECK(AT(last) == BAR(12), "launch: the pattern's next downbeat plays at bar 12 (block %u)", AT(last)); }
        sim_song_stop(); RUN(12); { struct message m[64]; (void)drain(m, 64); }
        CHECK(stuck(log, logged) == 0, "launch: song E: nothing stuck across launches, stops, jumps, the late press and the stop (%u messages)", logged);
        if (stuck(log, logged)) stuck_report(log, logged);
        /* 7. Polymeter: T5's 48-step pattern (row 2) against T1's 16-step rows for 64 bars: no
         *    drift on either, every note in its predicted block. */
        logged = 0; blocks = 0;
        CHECK(sim_song_load(SONG) == 0 && sim_song_play() == 0, "launch: song E replays for the polymeter run");
        { struct message m[64]; (void)drain(m, 64); }
        CHECK(sim_song_track(0, 4, 2) == 0, "launch: T5 pattern 2 (48 steps) queued at once");
        RUN_TO(BAR(65));
        { unsigned bad50 = 0, bad52 = 0, bad42 = 0, from = 0, k = 0;
          for (k = 0; k < 21; ++k) { int i = ON_AT(4, 50, (int)from); if (AT(i) != BAR(1 + 3 * k)) ++bad50; if (i >= 0) from = (unsigned)i + 1; }
          from = 0;
          for (k = 0; k < 21; ++k) { int i = ON_AT(4, 52, (int)from); if (AT(i) != block_of((uint64_t)(1 + 3 * k) * BARU + 32 * U, TEMPO)) ++bad52; if (i >= 0) from = (unsigned)i + 1; }
          from = 0;
          for (k = 0; k < 64 * 16; ++k) { int i = ON_AT(9, 42, (int)from); if (AT(i) != block_of((uint64_t)k * U, TEMPO)) ++bad42; if (i >= 0) from = (unsigned)i + 1; }
          CHECK(bad50 == 0 && bad52 == 0, "launch: the 48-step pattern's notes land on bars 1, 4, 7... and 32 steps later for 64 bars (%u / %u off)", bad50, bad52);
          CHECK(bad42 == 0, "launch: T1's 1024 hats over 64 bars of 16-step rows all in their blocks (%u off)", bad42); }
        CHECK(stuck(log, logged) == 0, "launch: polymeter run: nothing stuck");
        sim_song_stop(); RUN(12); { struct message m[64]; (void)drain(m, 64); }
        /* 8. Song end with detached tracks: song G has one row, no loop; T2 is launched, so at
         *    the row end the song is over for T1, T2 keeps looping, the clock keeps running and
         *    PLAY stops everything; stopping T2 alone leaves the transport running. */
        { uint16_t r0[8] = {10, 11, 0, 0, 0, 0, 0, 0};
          make_record(f, "LAUNCH G    ", TEMPO, 1, 0); f[48] = 10; f[49] = 2; make_row(f, 0, r0, 1, 16, 0); }
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0 && sim_song_play() == 0, "launch: song G (one row, no loop) plays");
        { struct message m[64]; (void)drain(m, 64); }
        logged = 0; blocks = 0;
        CHECK(sim_song_track(0, 1, 0) == 0, "launch: T2 launched on its pattern 0");
        RUN_TO(BAR(3) + 5);
        { unsigned clocks = 0; for (unsigned r = 0; r < 20; ++r) { (void)sim_render(); ++blocks; struct message m[64]; unsigned n = drain(m, 64); for (unsigned j = 0; j < n && j < 64; ++j) if (m[j].port == 0 && m[j].data[0] == 0xf8) ++clocks; }
          CHECK(((sim_song_status(0) >> 8) & 255U) == 1 && (sim_song_status(4) >> 24) == 1, "launch: after the last row the song is over but still playing (song_over %u)", sim_song_status(4) >> 24);
          CHECK(clocks > 0, "launch: MIDI clock keeps running after the song's end (%u clocks in 20 blocks)", clocks); }
        { int h = ON_AT(9, 42, 0), last = h; while (last >= 0) { int n = ON_AT(9, 42, last + 1); if (n < 0) break; last = n; }
          CHECK(AT(last) < BAR(1), "launch: T1 (attached) fell silent at the song's end (last hat at block %u)", AT(last));
          int b = ON_AT(1, 36, 0), lastb = b; while (lastb >= 0) { int n = ON_AT(1, 36, lastb + 1); if (n < 0) break; lastb = n; }
          CHECK(AT(lastb) == BAR(3), "launch: T2 (launched) kept playing (last bass at bar 3 = block %u)", AT(lastb)); }
        CHECK(find_log(log, logged, 0xfc, 0, 0, 0) < 0, "launch: no Stop was sent at the song's end");
        CHECK(sim_song_track(1, 1, 0) == 0, "launch: stop queued on T2");
        RUN_TO(BAR(5));
        CHECK(((sim_song_status(0) >> 8) & 255U) == 1 && find_log(log, logged, 0xfc, 0, 0, 0) < 0, "launch: all tracks stopped, the transport still runs (no Stop)");
        sim_song_stop(); RUN(12);
        CHECK(find_log(log, logged, 0xfc, 0, 0, 0) >= 0 && ((sim_song_status(0) >> 8) & 255U) == 0 && stuck(log, logged) == 0, "launch: PLAY stops the transport: Stop sent, nothing stuck");
        { struct message m[64]; (void)drain(m, 64); }
        /* 9. Eight tracks launching eight different rows at one bar. Song F: 8 rows, track t's
         *    block in row r is 20 + ((t + r) & 7); block 20 + i holds note 60 + i on step i. */
        for (unsigned i = 0; i < 8; ++i) { memset(&vb, 0, sizeof vb); v2_note(i, 60 + i, 100, 0, 480, 0); if (sim_block_write2(SONG, 20 + i, 1, v2_put(f)) != 0) { CHECK(0, "launch: block %u stored", 20 + i); } }
        { make_record(f, "LAUNCH F    ", TEMPO, 8, 1); for (unsigned t = 0; t < 8; ++t) f[48 + t] = (uint8_t)(t + 1);
          for (unsigned r = 0; r < 8; ++r) { uint16_t ids[8]; for (unsigned t = 0; t < 8; ++t) ids[t] = (uint16_t)(20 + ((t + r) & 7)); make_row(f, r, ids, 1, 16, 0); } }
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0 && sim_song_play() == 0, "launch: song F (8 rows x 8 tracks) plays");
        { struct message m[64]; (void)drain(m, 64); }
        logged = 0; blocks = 0;
        RUN_TO(BAR(1) + 10);
        for (unsigned t = 0; t < 8; ++t) if (sim_song_track(0, t, t) != 0) CHECK(0, "launch: T%u pattern %u queued", t + 1, t);
        RUN_TO(BAR(3) + 5);
        { unsigned bad = 0;
          for (unsigned t = 0; t < 8; ++t) {
              unsigned step = (2 * t) & 7, pitch = 60 + step;
              int i = ON_AT(t, pitch, 0); while (i >= 0 && AT(i) < BAR(2)) i = ON_AT(t, pitch, i + 1);
              if (AT(i) != block_of((uint64_t)2 * BARU + step * U, TEMPO)) { ++bad; printf("       T%u: note %u at block %u, expected %u\n", t + 1, pitch, AT(i), block_of((uint64_t)2 * BARU + step * U, TEMPO)); }
              if (TSTATE(t) != 1 || TROW(t) != t) ++bad;
          }
          CHECK(bad == 0, "launch: all eight tracks launched different rows at bar 2 and played their notes on time (%u off)", bad); }
        /* 10. A scene jump overrides pending launches and re-attaches all eight. */
        for (unsigned t = 0; t < 8; ++t) (void)sim_song_track(0, t, (t + 3) & 7);
        CHECK(sim_song_jump(5) == 0, "launch: scene jump to row 5 queued over eight pending launches");
        RUN_TO(BAR(5) + 5);
        { unsigned bad = 0;
          for (unsigned t = 0; t < 8; ++t) {
              unsigned step = (t + 5) & 7, pitch = 60 + step;
              int i = ON_AT(t, pitch, 0); while (i >= 0 && AT(i) < BAR(4)) i = ON_AT(t, pitch, i + 1);
              if (AT(i) != block_of((uint64_t)4 * BARU + step * U, TEMPO)) ++bad;
              if (TSTATE(t) != 0 || TQUEUE(t) != 0) ++bad;
          }
          CHECK(bad == 0 && ((sim_song_status(0) >> 16) & 255U) == 6, "launch: at bar 4 every track played row 5's block and follows the song (row %u now, %u off)", (sim_song_status(0) >> 16) & 255U, bad); }
        sim_song_stop(); RUN(12); { struct message m[64]; (void)drain(m, 64); }
        CHECK(stuck(log, logged) == 0, "launch: song F: nothing stuck after the stop");
        if (stuck(log, logged)) stuck_report(log, logged);
        sim_midi_capture(0); sim_midi_drain(0);
        CHECK(sim_song_record_delete(SONG) == 0, "launch: test song deleted");
        #undef RUN
        #undef RUN_TO
        #undef ON_AT
        #undef OFF_AT
        #undef AT
        #undef BAR
        #undef TSTATE
        #undef TQUEUE
        #undef TROW
        #undef LATE
        #undef DBG13
        #undef DBG13M
    }

    /* ---- 14. Task 12 A2: SYNC / MIDI (SEQ), MIDI TRACK (SHIFT+SEQ), no REC ------------------ */
    {
        /* Physical ids (app/smk37_controls.c): button 0 SHIFT, 15 SEQ, 17 REC; encoders 0-3 = K1-K4,
         * 6 = PRESETS. */
        #define PRESS(id) do { sim_smk37(SMK37_BUTTON, id, 1); settle(); sim_smk37(SMK37_BUTTON, id, 0); settle(); } while (0)
        PRESS(15);
        CHECK(sim_state()[1] == 1, "SEQ opens page 1, SYNC / MIDI (page %u)", sim_state()[1]);
        unsigned swing = groove_sequence_setting(0), seq_out = sim_midi_setting(0, 9), key_out = sim_midi_setting(0, 4);
        sim_smk37(SMK37_ENCODER, 2, 2); settle();
        CHECK(groove_sequence_setting(0) != swing, "SYNC / MIDI K3 changes SWING (%u -> %u)", swing, groove_sequence_setting(0));
        sim_smk37(SMK37_ENCODER, 2, -2); settle();
        sim_smk37(SMK37_ENCODER, 3, seq_out ? -1 : 1); settle();
        CHECK(sim_midi_setting(0, 9) != seq_out, "SYNC / MIDI K4 changes SEQ OUT (%u -> %u)", seq_out, sim_midi_setting(0, 9));
        sim_smk37(SMK37_ENCODER, 3, seq_out ? 1 : -1); settle();
        sim_smk37(SMK37_ENCODER, 6, key_out ? -1 : 1); settle();
        CHECK(sim_midi_setting(0, 4) != key_out, "SYNC / MIDI PRESETS changes KEY OUT (%u -> %u)", key_out, sim_midi_setting(0, 4));
        sim_smk37(SMK37_ENCODER, 6, key_out ? 1 : -1); settle();
        CHECK(sim_midi_setting(0, 9) == seq_out && sim_midi_setting(0, 4) == key_out, "SEQ OUT and KEY OUT restored");
        sim_smk37(SMK37_ENCODER, 0, 1); settle();
        CHECK(sim_state()[16] == 1, "SYNC / MIDI K1 sets CLOCK to MIDI");
        sim_smk37(SMK37_ENCODER, 0, -1); settle();
        CHECK(sim_state()[16] == 0, "and back to INT");
        sim_smk37(SMK37_BUTTON, 0, 1); sim_smk37(SMK37_BUTTON, 15, 1); settle();
        sim_smk37(SMK37_BUTTON, 15, 0); sim_smk37(SMK37_BUTTON, 0, 0); settle();
        unsigned out_ch = sim_midi_setting(0, 1);
        sim_smk37(SMK37_ENCODER, 1, out_ch ? -1 : 1); settle();
        CHECK(sim_state()[1] == 1 && sim_midi_setting(0, 1) != out_ch, "SHIFT+SEQ: MIDI TRACK K2 changes OUT CH (%u -> %u)", out_ch, sim_midi_setting(0, 1));
        sim_smk37(SMK37_ENCODER, 1, out_ch ? 1 : -1); settle();
        PRESS(17);
        CHECK(sim_state()[4] == 0, "REC does not start recording");
        CHECK(sim_open(13) == -1 && sim_open(14) == -1, "STEP_EDIT (13) and RHYTHM (14) are refused");
        CHECK(sim_open(1) == 0 && sim_state()[1] == 1, "page 1 still opens (SYNC / MIDI)");
        #undef PRESS
    }


    /* ---- 15. Task 13 Step 1: the pass budget (option B) ------------------------------------ */
    {
        enum { MS = 24000, BUDGET = 6 * MS, BAND = 4 * MS };
        uint8_t page6[64];
        #define U32(p_, i_) ((uint32_t)(p_)[4 * (i_)] | (uint32_t)(p_)[4 * (i_) + 1] << 8 | (uint32_t)(p_)[4 * (i_) + 2] << 16 | (uint32_t)(p_)[4 * (i_) + 3] << 24)
        /* FNV-1a over the LCD: the picture after the screen has settled. */
        #define PIXHASH() ({ const uint16_t *px_ = sim_pixels(); uint32_t h_ = 2166136261U; for (unsigned i_ = 0; i_ < 240 * 240; ++i_) { h_ ^= px_[i_]; h_ *= 16777619U; } h_; })
        static const unsigned pages[] = {19, 1, 0};
        for (unsigned k = 0; k < sizeof pages / sizeof pages[0]; ++k) {
            unsigned pg = pages[k];
            /* Reference: no cost, the old behaviour (every band within one pass). */
            sim_test_costs(0, 0); sim_boot(1); (void)sim_open(pg);
            for (unsigned i = 0; i < 400; ++i) (void)sim_render();
            uint32_t ref = PIXHASH();
            for (unsigned i = 400; i < 1600; ++i) (void)sim_render();
            uint32_t ref_late = PIXHASH();   /* the same page 1600 blocks in (it may show time) */
            /* Slices: each band "takes" 4 ms, so at most one band fits after the first. */
            sim_boot(1); sim_test_costs(BAND, 0); (void)sim_open(pg); ct_prof_reset(); sim_test_log_reset();
            for (unsigned i = 0; i < 400; ++i) (void)sim_render();
            uint32_t sliced = PIXHASH();
            (void)ct_prof_read(6, page6);
            CHECK(sliced == ref, "budget: page %u painted in slices equals the unbudgeted picture (%08x / %08x)", pg, sliced, ref);
            CHECK(U32(page6, 0) > 0 && U32(page6, 2) <= BUDGET + MS, "budget: page %u: no pass busy past the budget (longest %.2f ms, %u passes)", pg, U32(page6, 2) / (double)MS, U32(page6, 0));
            /* The longest run of bands inside one pass of the log. */
            const char *lg = sim_test_log(); unsigned run = 0, longest = 0;
            for (const char *c = lg; *c; ++c) { if (*c == 'P') run = 0; else if (*c == 'B' && ++run > longest) longest = run; }
            CHECK(longest <= 2, "budget: page %u: at most 2 bands of 4 ms in one pass (%u)", pg, longest);
            /* Starvation: every pass is already 8 ms in when the screen runs (over the budget):
             * the guard still paints one band per 60 ms and the picture still completes. */
            sim_boot(1); sim_test_costs(BAND, 8 * MS); (void)sim_open(pg); ct_prof_reset();
            for (unsigned i = 0; i < 1600; ++i) (void)sim_render();
            uint32_t starved = PIXHASH();
            (void)ct_prof_read(6, page6);
            if (starved != ref_late) printf("       page %u: starved %08x, unbudgeted at the same time %08x\n", pg, starved, ref_late);
            CHECK(starved == ref_late && U32(page6, 6) > 0, "budget: page %u: a pass that is always late still repaints the page (%u bands deferred)", pg, U32(page6, 6));
        }
        /* Sends first: a pass that sends MIDI sends before it paints, and a note the audio thread
         * queues while a band paints leaves right after that band, inside the same pass. */
        sim_boot(1); sim_test_costs(BAND, 2 * MS); sim_midi_capture(1); (void)sim_open(19);
        { struct message m[64]; settle(); (void)drain(m, 64); }
        sim_test_log_reset();
        /* A song note queued before the pass (as the audio thread does between passes), then a
         * page change in that pass: the note leaves before the first band. (A key press is no
         * test of this: the panel sends its own notes at once, outside the pass.) */
        groove_midi_song_note(0, 62, 100);
        (void)sim_open(1);
        { const char *lg = sim_test_log(); const char *p = strchr(lg, 'P'), *mm = p ? strchr(p, 'M') : NULL, *b = p ? strchr(p, 'B') : NULL;
          CHECK(p && mm && b && mm < b, "budget: the pass sends MIDI before its first band (log %.24s)", lg); }
        groove_midi_song_note(0, 62, 0);
        { struct message m[64]; settle(); (void)drain(m, 64); }
        (void)sim_open(19); { struct message m[64]; settle(); (void)drain(m, 64); }
        sim_test_log_reset(); sim_test_inject(0);
        (void)sim_open(1);                          /* a page change: bands to paint */
        { const char *lg = sim_test_log(); const char *b = strchr(lg, 'B'); const char *after = b ? b + 1 : NULL;
          const char *mm = after ? strchr(after, 'M') : NULL, *np = after ? strchr(after, 'P') : NULL;
          CHECK(b && mm && (!np || mm < np), "budget: a note queued while a band paints leaves before the next pass (log %.24s)", lg); }
        sim_test_inject(-1);
        { struct message m[64]; settle(); unsigned n = drain(m, 64), ports;
          (void)count(m, n, 0x90, 60, 100, &ports); }
        /* Transfer: a new request waits while the pass is over budget, then gets the same reply. */
        static const uint8_t req[] = {0xf0, 0x7d, 'F', 'M', 2, 27, 5, 0, 0, 0xf7};
        uint8_t frame[sizeof req]; memcpy(frame, req, sizeof req);
        { unsigned sum = 0; for (unsigned i = 1; i < sizeof req - 2; ++i) sum += frame[i]; frame[sizeof req - 2] = (uint8_t)((0U - sum) & 127U); }
        uint8_t reply_ref[96], reply_late[96]; unsigned ref_n = 0, late_n = 0, passes_late = 0;
        for (unsigned round = 0; round < 2; ++round) {
            sim_boot(1); sim_test_costs(0, round ? 8 * MS : 0); sim_midi_capture(1); ct_prof_reset();
            { struct message m[64]; settle(); (void)drain(m, 64); }
            memcpy(sim_file(), frame, sizeof frame);
            (void)sim_midi_from(0, sizeof frame);   /* the sysex arrives and asks for a pass */
            unsigned got = 0, passes = 1;
            for (; passes < 12 && !got; ++passes) {
                unsigned r;
                while ((r = sim_midi_output()) != 0) if ((r & 255U) > 8 && sim_file()[0] == 0xf0 && sim_file()[5] == (27 | 64)) {
                    got = r & 255U; memcpy(round ? reply_late : reply_ref, sim_file(), got);
                }
                if (!got) for (unsigned i = 0; i < 4; ++i) (void)sim_render();   /* about one more pass */
            }
            if (round) { late_n = got; passes_late = passes; } else ref_n = got;
        }
        (void)ct_prof_read(6, page6);
        CHECK(ref_n && ref_n == late_n && !memcmp(reply_ref, reply_late, ref_n), "budget: a deferred capability request gets the same reply (%u / %u bytes)", ref_n, late_n);
        CHECK(U32(page6, 7) >= 1 && U32(page6, 7) <= 4 && passes_late <= 7, "budget: it waited %u pass(es), at most 4 (answered after %u)", U32(page6, 7), passes_late);
        sim_test_costs(0, 0);
        #undef U32
        #undef PIXHASH
    }

    /* ---- 16. Task 15 Step 4: option A2, the control pass on demand ----------------------- */
    {
        #define U32(p, i) ((uint32_t)(p)[(i) * 4] | (uint32_t)(p)[(i) * 4 + 1] << 8 | (uint32_t)(p)[(i) * 4 + 2] << 16 | (uint32_t)(p)[(i) * 4 + 3] << 24)
        /* A2 page (request 7): 0 on, 1 blocks, 2 calls, 3 mean, 4 longest, 5 retries, 6..11 bins. */
        uint8_t a2[64]; struct message m[64]; unsigned n, ports;
        /* Render until a block ends with a 10 ms pass, so the next two blocks have none. */
        #define AFTER_PASS() do { sim_test_log_reset(); while (!strchr(sim_test_log(), 'P')) (void)sim_render(); } while (0)
        sim_boot(1); sim_midi_capture(1); sim_test_request_passes(0); sim_test_costs(0, 0);
        settle(); (void)drain(m, 64);
        CHECK(ct_diag_read(7, a2) == 52 && U32(a2, 0) == 1 && ct_a2_get(), "A2: on at boot, the normal build's default since Task 16 (page %u bytes)", 52U);
        (void)ct_diag_read(8, a2);   /* the "off" checks below start from the switch off */
        /* Off: a waiting note asks for nothing and leaves with the 10 ms pass, as in the normal build. */
        (void)ct_diag_read(1, a2); AFTER_PASS(); (void)drain(m, 64);
        uint32_t asked = sim_test_control_requests;
        groove_midi_song_note(0, 61, 100);
        (void)sim_render(); (void)sim_render();
        n = drain(m, 64); (void)ct_diag_read(7, a2);
        CHECK(U32(a2, 2) == 0 && sim_test_control_requests == asked && !count(m, n, 0x90, 61, 100, &ports),
              "A2 off: no pass request from the audio block, the note waits (%u calls)", U32(a2, 2));
        settle(); n = drain(m, 64);
        CHECK(count(m, n, 0x90, 61, 100, &ports) >= 1, "A2 off: the note leaves with the 10 ms pass");
        groove_midi_song_note(0, 61, 0); settle(); (void)drain(m, 64);
        /* On, and the request gets its pass (the device): the note leaves in the block that queued it. */
        CHECK(ct_diag_read(9, a2) == 52 && U32(a2, 0) == 1 && ct_a2_get(), "A2: request 9 switches it on");
        sim_test_request_passes(1);
        /* (The MIDI clock's F8 travels in lane 0 too and asks for its own passes, so the checks
         * here count from the state just before the note.) */
        AFTER_PASS(); (void)drain(m, 64); (void)ct_diag_read(7, a2);
        asked = sim_test_control_requests; uint32_t calls0 = U32(a2, 2);
        groove_midi_song_note(0, 62, 100);
        (void)sim_render();
        n = drain(m, 64); (void)ct_diag_read(7, a2);
        /* (the simulator's own 10 ms tick may add one request of its own in this block) */
        CHECK(U32(a2, 2) == calls0 + 1 && sim_test_control_requests - asked >= 1 && sim_test_control_requests - asked <= 2 && U32(a2, 5) == 0 && count(m, n, 0x90, 62, 100, &ports) >= 1,
              "A2 on: one request, and the note leaves in the same block (%u call, %u retries)", U32(a2, 2) - calls0, U32(a2, 5));
        CHECK(U32(a2, 2) <= U32(a2, 1), "A2 on: never more calls than blocks (%u / %u)", U32(a2, 2), U32(a2, 1));
        groove_midi_song_note(0, 62, 0); settle(); (void)drain(m, 64);
        /* On, and the request is dropped (a pass already waits or runs): asked again once per
         * block, never more than once, until the lane is empty. */
        sim_test_request_passes(0);
        AFTER_PASS(); (void)drain(m, 64); (void)ct_diag_read(7, a2);
        asked = sim_test_control_requests; calls0 = U32(a2, 2); uint32_t retries0 = U32(a2, 5);
        groove_midi_song_note(0, 63, 100);
        (void)sim_render(); (void)ct_diag_read(7, a2);
        uint32_t first_calls = U32(a2, 2) - calls0;
        (void)sim_render(); (void)ct_diag_read(7, a2);
        CHECK(first_calls == 1 && U32(a2, 2) == calls0 + 2 && U32(a2, 5) == retries0 + 1 && sim_test_control_requests == asked + 2,
              "A2 on, request dropped: one retry per block (%u then %u calls, %u retry)", first_calls, U32(a2, 2) - calls0, U32(a2, 5) - retries0);
        CHECK(U32(a2, 6) + U32(a2, 7) + U32(a2, 8) + U32(a2, 9) + U32(a2, 10) + U32(a2, 11) == U32(a2, 2) && U32(a2, 4) >= U32(a2, 3),
              "A2: the cost histogram holds every call (longest %u, mean %u ticks)", U32(a2, 4), U32(a2, 3));
        settle(); n = drain(m, 64); (void)ct_diag_read(7, a2);
        uint32_t calls_done = U32(a2, 2), blocks_done = U32(a2, 1);
        CHECK(count(m, n, 0x90, 63, 100, &ports) >= 1 && calls_done <= blocks_done, "A2: the note left with the next pass; never more calls than blocks (%u / %u)", calls_done, blocks_done);
        /* Idle (no note, the clock's F8 aside): far fewer requests than blocks. At 120 BPM the
         * clock sends 48 F8 per second, one block in seven. */
        sim_test_request_passes(1);   /* as on the device: a request gets its pass */
        (void)sim_render(); (void)ct_diag_read(7, a2);
        calls_done = U32(a2, 2); uint32_t retries_done = U32(a2, 5);
        for (unsigned i = 0; i < 344; ++i) (void)sim_render();
        (void)ct_diag_read(7, a2);
        CHECK(U32(a2, 2) - calls_done <= 60 && U32(a2, 5) == retries_done,
              "A2 on: idle blocks ask only for the clock, once each (%u calls in 344 blocks, %u retries)", U32(a2, 2) - calls_done, U32(a2, 5) - retries_done);
        sim_test_request_passes(0);
        groove_midi_song_note(0, 63, 0); settle(); (void)drain(m, 64);
        /* Reset clears the counters at the next block and keeps the switch; request 8 is off. */
        (void)ct_diag_read(1, a2); (void)sim_render(); (void)ct_diag_read(7, a2);
        CHECK(U32(a2, 2) == 0 && U32(a2, 4) == 0 && U32(a2, 1) >= 1 && U32(a2, 1) < 4 && U32(a2, 0) == 1, "A2: the reset clears the counters, not the switch");
        CHECK(ct_diag_read(8, a2) == 52 && U32(a2, 0) == 0, "A2: request 8 switches it off");
        groove_midi_song_note(0, 64, 100); (void)sim_render(); (void)ct_diag_read(7, a2);
        CHECK(U32(a2, 2) == 0, "A2 off again: no request");
        groove_midi_song_note(0, 64, 0); settle(); (void)drain(m, 64);
        /* The ACTIONS entry (page 12): K1 to the last entry, the SAVE button switches A2. */
        (void)sim_open(12);
        sim_control(2, 0, 20); sim_release();
        sim_control(0, 9, 1); sim_release();
        unsigned panel_on = ct_a2_get();
        sim_control(0, 9, 1); sim_release();
        CHECK(panel_on == 1 && ct_a2_get() == 0, "A2: the ACTIONS entry switches it on and off (%u, %u)", panel_on, ct_a2_get());
        sim_test_request_passes(0); (void)sim_open(0);
        #undef AFTER_PASS
        #undef U32
    }


    /* ---- 17. Task 16 Goal 1: command 29, remote control, in every build -------------------- */
    {
        #define RCMD(cmd, ...) rcmd((cmd), (const uint8_t[]){__VA_ARGS__}, sizeof((const uint8_t[]){__VA_ARGS__}), reply)
        uint8_t reply[96];
        #define STATUS_PAGE reply[1]
        sim_boot(1); sim_midi_capture(1); sim_test_request_passes(1); settle();
        (void)sim_smk37(0, 0, 0);   /* the simulator reads the panel from the SMK-37 layer from now on, as the device does */
        { uint8_t a[64]; (void)ct_diag_read(9, a); }   /* section 16 left A2 off; the device boots with it on */
        { struct message m[64]; (void)drain(m, 64); }
        int n = RCMD(29, 0);
        CHECK(n == 15 && reply[0] == 0 && reply[1] == 1 && reply[2] == 0 && reply[3] == 0 && reply[4] == 255 && reply[5] == 255 && reply[7] == 1,
              "remote: status at boot: version 1, page OVERVIEW, stopped, nothing loaded (%d bytes: %u %u %u %u %u %u %u)", n, reply[0], reply[1], reply[2], reply[3], reply[4], reply[5], reply[7]);
        { uint8_t caps[96]; int k = rcmd(27, (const uint8_t[]){0}, 0, caps); (void)k;
          CHECK(k >= 8 && (caps[2] & 4U), "remote: capability flag bit 2 (command 29) is set"); }
        /* A2 */
        n = RCMD(29, 5, 0); CHECK(n == 15 && reply[0] == 0 && reply[7] == 0 && !ct_a2_get(), "remote: A2 off");
        n = RCMD(29, 5, 1); CHECK(n == 15 && reply[7] == 1 && ct_a2_get(), "remote: A2 on");
        CHECK(RCMD(29, 5, 2) >= 0 && reply[0] != 0, "remote: A2 value 2 refused (code %u)", reply[0]);
        /* A key press and release: the note leaves on the MIDI out, the release ends it. */
        { struct message m[64]; unsigned np;
          rc_n = 0; n = RCMD(29, 6, 1, 0, 100); settle(); np = drain(m, 64); for (unsigned i = 0; i < np && i < 64 && rc_n < 128; ++i) rc_log[rc_n++] = m[i]; np = rc_n > 64 ? 64 : rc_n; memcpy(m, rc_log, np * sizeof m[0]);
          CHECK(n == 15 && reply[0] == 0 && any_on(m, np, 100), "remote: key 1 press sends a note-on with velocity 100 on the keyboard track (reply %u, %u messages)", reply[0], np);
          rc_n = 0; n = RCMD(29, 6, 1, 0, 0); settle(); np = drain(m, 64); for (unsigned i = 0; i < np && i < 64 && rc_n < 128; ++i) rc_log[rc_n++] = m[i]; np = rc_n > 64 ? 64 : rc_n; memcpy(m, rc_log, np * sizeof m[0]);
          CHECK(reply[0] == 0 && (any_off(m, np)), "remote: key 1 release ends it"); }
        { struct message m[64]; unsigned np;   /* the last key (36): 37 keys do not fit a 32-bit mask */
          rc_n = 0; n = RCMD(29, 6, 1, 36, 100); settle(); np = drain(m, 64); for (unsigned i = 0; i < np && i < 64 && rc_n < 128; ++i) rc_log[rc_n++] = m[i];
          CHECK(reply[0] == 0 && any_on(rc_log, rc_n, 100), "remote: key 37 (id 36) press sends a note");
          rc_n = 0; n = RCMD(29, 7); settle(); np = drain(m, 64); for (unsigned i = 0; i < np && i < 64 && rc_n < 128; ++i) rc_log[rc_n++] = m[i];
          CHECK(reply[0] == 0 && any_off(rc_log, rc_n), "remote: release-all lets go of a held key above bit 31"); }
        /* The same request twice is a cached retry; the tool changes the token, so each press acts. */
        /* Refusals: SAVE (physical 3), bad kind, bad ids, bad length. */
        n = RCMD(29, 6, 0, 3, 1); CHECK(n >= 0 && reply[0] == 71, "remote: the SAVE button (physical 3) is refused (code %u)", reply[0]);
        n = RCMD(29, 6, 0, 18, 1); CHECK(n >= 0 && reply[0] == 71, "remote: physical button 18 refused");
        n = RCMD(29, 6, 1, 37, 1); CHECK(n >= 0 && reply[0] == 71, "remote: key 37 refused");
        n = RCMD(29, 6, 9, 0, 1); CHECK(n >= 0 && reply[0] == 71, "remote: kind 9 refused");
        n = RCMD(29, 99); CHECK(n >= 0 && reply[0] == 71, "remote: unknown operation refused");
        n = RCMD(29, 12); CHECK(n >= 56 && reply[0] == 0 && reply[1] == 2, "remote: operation 12 reads the CLIPS / SCENES page state (%d bytes)", n);
        n = RCMD(29, 9, 0, 0); CHECK(n >= 0 && reply[0] != 0, "remote: a track launch is refused while no song plays (code %u)", reply[0]);
        /* Panel flows, checked against the page the firmware reports. */
        n = RCMD(29, 6, 0, 0, 1); n = RCMD(29, 6, 0, 12, 1);       /* SHIFT + HOME / SRC */
        CHECK(reply[8] == 1, "remote: SHIFT held (%u)", reply[8]);
        n = RCMD(29, 6, 0, 12, 0); n = RCMD(29, 6, 0, 0, 0); settle();
        n = RCMD(29, 0);
        CHECK(reply[2] == 11 && reply[8] == 0, "remote: SHIFT + HOME / SRC opens SOUND SOURCE (page %u), SHIFT released", reply[2]);
        (void)sim_open(0); settle();
        (void)sim_open(0); settle();
        n = RCMD(29, 6, 0, 15, 1); n = RCMD(29, 6, 0, 13, 1); settle();  /* SEQ + EDIT together */
        n = RCMD(29, 6, 0, 15, 0); n = RCMD(29, 6, 0, 13, 0); settle(); n = RCMD(29, 0);
        CHECK(reply[2] == 12, "remote: SEQ + EDIT opens ACTIONS (page %u)", reply[2]);
        (void)sim_open(0);
        /* Watchdog: a button left held is released by itself after 5 s with no remote call. */
        n = RCMD(29, 6, 0, 0, 1);
        CHECK(reply[8] == 1, "remote: SHIFT held");
        for (unsigned i = 0; i < 1900; ++i) (void)sim_render();   /* about 5.5 s of audio blocks */
        sim_test_request_passes(1); settle(); n = RCMD(29, 0);
        CHECK(reply[8] == 0, "remote: the watchdog released SHIFT after 5 s (SHIFT %u)", reply[8]);
        /* The CLOCK switch by the panel injection (SEQ, then K1 up / down), as tools/linux/hw/run-follow.py does it: the clock
         * mode follows, the device keeps running (a hang here would stop this test), and A2 is untouched. */
        { void groove_clock_set(unsigned mode); unsigned groove_clock_mode(void);
          (void)sim_open(0); settle();
          n = RCMD(29, 6, 0, 15, 1); n = RCMD(29, 6, 0, 15, 0); settle();
          /* The hang of 2026-11-11 22:53 (BUILD 33.3, 34): the settings save 1.5 s after the CLOCK change, with notes
           * waiting for A2 passes. The hook plays the audio interrupt inside every flash operation. */
          { extern uint32_t sim_test_flash_unguarded, sim_test_flash_ops, sim_test_control_requests;
            extern void (*sim_test_flash_hook)(void);
            uint8_t pg[64]; (void)ct_diag_read(7, pg); uint32_t skipped0 = PG32(pg, 12);
            sim_test_flash_unguarded = sim_test_flash_ops = 0; flash_hook_requests = 0;
            sim_test_flash_hook = flash_hook_block;
            n = RCMD(29, 6, 4, 0, 1); for (unsigned i = 0; i < 600; ++i) (void)sim_render();
            sim_test_flash_hook = 0;
            (void)ct_diag_read(7, pg);
            CHECK(sim_test_flash_ops >= 1, "flash guard: the CLOCK change caused a settings save (%u flash operations)", sim_test_flash_ops);
            CHECK(sim_test_flash_unguarded == 0, "flash guard: every flash operation began with ct_flash_busy set (%u without)", sim_test_flash_unguarded);
            CHECK(flash_hook_requests == 0, "flash guard: no A2 request from an audio block inside a flash operation (%u)", flash_hook_requests);
            CHECK(PG32(pg, 12) > skipped0, "flash guard: the A2 page counts the skipped blocks (%u)", (unsigned)(PG32(pg, 12) - skipped0));
            extern volatile uint8_t ct_flash_busy;
            CHECK(ct_flash_busy == 0, "flash guard: the flag is clear after the save"); }
          CHECK(groove_clock_mode() == 1 && ct_a2_get(), "remote: SEQ then K1 up sets CLOCK = MIDI (mode %u), A2 still on", groove_clock_mode());
          n = RCMD(29, 0); CHECK(n == 15 && reply[0] == 0, "remote: the status still answers with CLOCK = MIDI");
          /* Task 16 had a USB pusher here (0xF9 after a USB write); Task 17 removed it (BUILD 36.5): nothing is added. */
          { unsigned f9[3] = {0, 0, 0}, nm; struct message m[64];
            for (unsigned i = 0; i < 40; ++i) (void)sim_render();
            (void)drain(m, 64); rc_n = 0; rc_source = 1;
            n = RCMD(29, 0); rc_source = 0; for (unsigned i = 0; i < 60; ++i) (void)sim_render();
            nm = drain(m, 64);
            for (unsigned i = 0; i < rc_n; ++i) if (rc_log[i].bytes == 1 && rc_log[i].data[0] == 0xf9 && rc_log[i].port < 3) ++f9[rc_log[i].port];
            for (unsigned i = 0; i < nm && i < 64; ++i) if (m[i].bytes == 1 && m[i].data[0] == 0xf9 && m[i].port < 3) ++f9[m[i].port];
            CHECK(f9[1] == 0 && f9[0] == 0 && f9[2] == 0, "no USB pusher (removed in tabby-v04.4): CLOCK = MIDI, a reply is followed by no 0xF9 (DIN %u, USB %u, BLE %u)", f9[0], f9[1], f9[2]); }
          n = RCMD(29, 6, 4, 0, 255); for (unsigned i = 0; i < 600; ++i) (void)sim_render();
          CHECK(groove_clock_mode() == 0, "remote: K1 down sets CLOCK = INT again (mode %u)", groove_clock_mode()); (void)sim_open(0);
          { unsigned f9 = 0, nm; struct message m[64];
            for (unsigned i = 0; i < 40; ++i) (void)sim_render();
            (void)drain(m, 64); rc_n = 0; rc_source = 1;
            n = RCMD(29, 0); rc_source = 0; for (unsigned i = 0; i < 60; ++i) (void)sim_render();
            nm = drain(m, 64);
            for (unsigned i = 0; i < rc_n; ++i) if (rc_log[i].bytes == 1 && rc_log[i].data[0] == 0xf9) ++f9;
            for (unsigned i = 0; i < nm && i < 64; ++i) if (m[i].bytes == 1 && m[i].data[0] == 0xf9) ++f9;
            CHECK(f9 == 0, "no USB pusher: CLOCK = INT, no 0xF9 (%u)", f9); } }
        /* Songs: one stored, then select, play, jump, stop. */
        { uint8_t *f = sim_file(); uint8_t b1[70], b2[67]; memset(b1, 0, sizeof b1); memset(b2, 0, sizeof b2);
          b1[0] = 1; b1[1] = 60; b1[2] = 100; b1[3] = 2; b2[0] = 1; b2[1] = 64; b2[2] = 80; b2[3] = 1;
          memcpy(f, b1, sizeof b1); (void)sim_block_write(0, 1, sizeof b1);
          memcpy(f, b2, sizeof b2); (void)sim_block_write(0, 2, sizeof b2);
          memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "REMOTE      ", 12); f[40] = 2; f[48] = 5;
          f[64] = 1; f[64 + 16] = 1; f[64 + 18] = 16; f[84] = 2; f[84 + 16] = 1; f[84 + 18] = 16;
          CHECK(sim_song_record_write(0) == 0, "remote: test song stored"); }
        n = RCMD(29, 1, 0); CHECK(n == 15 && reply[0] == 0 && reply[4] == 0 && reply[3] == 0, "remote: select song 1 loads it (loaded %u)", reply[4]);
        n = RCMD(29, 1, 7); CHECK(n >= 0 && reply[0] != 0, "remote: select an empty song is refused (code %u)", reply[0]);
        n = RCMD(29, 4, 1); CHECK(n >= 0 && reply[0] == 71, "remote: a jump while stopped is refused");
        n = RCMD(29, 1, 0);   /* a refused select of an empty song leaves nothing loaded; load song 1 again */
        n = RCMD(29, 2); for (unsigned i = 0; i < 20; ++i) (void)sim_render(); n = RCMD(29, 0); CHECK(n == 15 && reply[0] == 0 && reply[3] == 1 && reply[9] == 1, "remote: PLAY starts the loaded song (state %u, transport %u, code %u, loaded %u)", reply[3], reply[9], reply[0], reply[4]);
        for (unsigned i = 0; i < 20; ++i) (void)sim_render();
        n = RCMD(29, 2); CHECK(n >= 0 && reply[0] != 0, "remote: PLAY while playing is refused");
        n = RCMD(29, 4, 1); CHECK(n == 15 && reply[0] == 0 && reply[6] == 1, "remote: jump to row 2 is queued (queued %u)", reply[6]);
        { uint8_t save[96]; int k = rcmd(7, (const uint8_t[]){0}, 0, save); (void)k;
          CHECK(save[0] != 0, "remote: project save refuses while playing (code %u)", save[0]); }
        n = RCMD(29, 3); CHECK(n == 15 && reply[0] == 0, "remote: STOP");
        for (unsigned i = 0; i < 200; ++i) (void)sim_render();
        n = RCMD(29, 0); CHECK(reply[3] == 0 && reply[9] == 0, "remote: stopped and no transport after STOP (%u, %u)", reply[3], reply[9]);
        n = RCMD(29, 2, 0); CHECK(n == 15 && reply[0] == 0 && reply[3] == 1, "remote: PLAY with a song number loads and plays it");
        n = RCMD(29, 3); for (unsigned i = 0; i < 200; ++i) (void)sim_render();
        #undef RCMD
        #undef STATUS_PAGE
        sim_test_request_passes(0); (void)sim_open(0);
    }


    /* ---- 18. Task 16 Goal 3: external clock follow (song mode with CLOCK = MIDI) ----------------- */
    {
        enum { ARMED = 1, WAITING = 3, RUNNING = 4, HELD = 5, LOST = 6, STOPPED = 7 };
        void groove_clock_set(unsigned mode);
        unsigned sim_song_units(void);
        /* A master clock sent block by block: bpm * 24 pulses a minute, one pulse every 861.33 / bpm blocks. */
        static double phase, period; static unsigned pulses_sent;
        #define MASTER_SET(bpm) (period = 861.328125 / (double)(bpm))
        #define SEND1(b) do { sim_file()[0] = (uint8_t)(b); (void)sim_midi_from(0, 1); } while (0)
        #define FOLLOW() (sim_song_status(5))
        /* One audio block of a running master: its pulse if one is due, then the block. */
        #define BLOCK_RUN() do { phase += 1.0; if (phase >= period) { phase -= period; SEND1(0xf8); ++pulses_sent; } (void)sim_render(); } while (0)
        #define BLOCK_SILENT() do { (void)sim_render(); } while (0)
        struct message mm[64]; unsigned pn;
        sim_boot(1); sim_midi_capture(1); sim_test_request_passes(1); sim_midi_drain(1);
        { uint8_t *f = sim_file(); uint8_t b1[70], b2[67]; memset(b1, 0, sizeof b1); memset(b2, 0, sizeof b2);
          unsigned at = 0; b1[at++] = 1; b1[at++] = 60; b1[at++] = 100; b1[at++] = 2; at += 3; b1[at++] = 1; b1[at++] = 62; b1[at++] = 90; b1[at++] = 1;
          b2[0] = 1; b2[1] = 64; b2[2] = 80; b2[3] = 1;
          memcpy(f, b1, sizeof b1); (void)sim_block_write(0, 1, sizeof b1);
          memcpy(f, b2, sizeof b2); (void)sim_block_write(0, 2, sizeof b2);
          memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "FOLLOW      ", 12); f[40] = 2; f[48] = 5;
          f[64] = 1; f[64 + 16] = 1; f[64 + 18] = 64; f[84] = 2; f[84 + 16] = 1; f[84 + 18] = 64;   /* two rows of 64 steps */
          CHECK(sim_song_record_write(0) == 0, "follow: test song stored"); }
        CHECK(sim_song_load(0) == 0, "follow: song loaded");
        groove_clock_set(1);                                      /* CLOCK = MIDI */
        CHECK(sim_song_play() == 0, "follow: PLAY with CLOCK = MIDI arms the song (it used to refuse)");
        for (int i = 0; i < 4; ++i) (void)sim_render();
        CHECK(FOLLOW() == ARMED && (sim_song_status(0) >> 8 & 255U) == 1, "follow: armed, waiting for Start (state %u)", FOLLOW());
        /* No clock yet: pulses without a Start never start it (the song is armed, the master has not started). */
        MASTER_SET(120); for (int i = 0; i < 60; ++i) BLOCK_RUN();
        { struct message m0[64]; unsigned n0 = drain(m0, 64), p0; CHECK(!count(m0, n0, 0x94, 61, 100, &p0) && FOLLOW() == ARMED && sim_song_units() == 0, "follow: pulses alone do not start an armed song (position %u)", sim_song_units()); }
        /* Start: from the first pulse after it. */
        SEND1(0xfa); pulses_sent = 0; (void)drain(mm, 64);
        unsigned first_note_block = 0, blocks = 0, block_at_pulse24 = 0, note62_block = 0;
        uint32_t pulses_at_start = pulses_sent;
        for (; blocks < 400 && !(first_note_block && note62_block); ++blocks) {
            unsigned before = pulses_sent; BLOCK_RUN();
            if (pulses_sent == before + 1 && pulses_sent - pulses_at_start == 25) block_at_pulse24 = blocks;
            pn = drain(mm, 64); unsigned pp;
            if (!first_note_block && count(mm, pn, 0x94, 60, 100, &pp)) first_note_block = blocks + 1;
            if (!note62_block && count(mm, pn, 0x94, 62, 90, &pp)) note62_block = blocks + 1;
        }
        CHECK(FOLLOW() == RUNNING, "follow: Start then pulses: running (state %u)", FOLLOW());
        CHECK(first_note_block >= 1 && first_note_block <= 12, "follow: the step-0 note leaves with the first pulse (block %u)", first_note_block);
        { int d = (int)note62_block - (int)block_at_pulse24; if (d < 0) d = -d;
          CHECK(note62_block && d <= 3, "follow: step 4 (the 25th pulse: the first is position 0) leaves within 3 blocks of its pulse (%u vs %u)", note62_block, block_at_pulse24); }
        /* The position follows the pulses, and a tempo change (120 to 90 to 150 BPM) is followed. */
        unsigned base_pulses = pulses_sent; uint32_t base_units = sim_song_units();
        MASTER_SET(90); for (int i = 0; i < 700; ++i) BLOCK_RUN();
        { int32_t want = (int32_t)(base_units + (pulses_sent - base_pulses) * 80U), got = (int32_t)sim_song_units(), e = got - want;
          CHECK(e > -90 && e < 90, "follow: after a change to 90 BPM the position is within one pulse of the pulses (%d units off over %u pulses)", e, pulses_sent - base_pulses); }
        MASTER_SET(150); for (int i = 0; i < 500; ++i) BLOCK_RUN();
        { int32_t want = (int32_t)(base_units + (pulses_sent - base_pulses) * 80U), got = (int32_t)sim_song_units(), e = got - want;
          CHECK(e > -90 && e < 90, "follow: after 150 BPM the position is within one pulse (%d units off over %u pulses)", e, pulses_sent - base_pulses); }
        CHECK(FOLLOW() == RUNNING && sim_song_status(2) == 0, "follow: still running, no underrun (%u)", sim_song_status(2));
        /* No drift (TASK-10 Phase 1): 400 pulses at 133 BPM (what is left of the 768-pulse song); the position keeps within a pulse of the pulses, at every 50th pulse. */
        MASTER_SET(133);
        { unsigned worst = 0; uint32_t u0 = sim_song_units(), p0 = pulses_sent; unsigned seen = 0;
          for (int i = 0; i < 25000 && pulses_sent - p0 < 400; ++i) {
              unsigned before = pulses_sent; BLOCK_RUN();
              if (pulses_sent != before && (pulses_sent - p0) % 50 == 0) {
                  int32_t want = (int32_t)(u0 + (pulses_sent - p0) * 80U), e = (int32_t)sim_song_units() - want; if (e < 0) e = -e;
                  if ((unsigned)e > worst) worst = (unsigned)e; ++seen;
              }
              if (FOLLOW() != RUNNING) break;
          }
          CHECK(seen >= 5 && worst <= 100 && FOLLOW() == RUNNING, "follow: 400 pulses at 133 BPM: the position stays within %u units of the pulses at %u checkpoints (no drift)", worst, seen); }
        /* Missed pulses: 4 periods of silence: HELD, notes released, no advance; pulses back inside 2 s: relock. */
        MASTER_SET(120); for (int i = 0; i < 30; ++i) BLOCK_RUN();
        uint32_t held_at = sim_song_units();
        (void)drain(mm, 64);
        for (int i = 0; i < 40; ++i) BLOCK_SILENT();             /* 40 blocks = 5.5 pulses of 120 BPM */
        CHECK(FOLLOW() == HELD, "follow: 3 missed pulses: HELD (state %u)", FOLLOW());
        { uint32_t u = sim_song_units(); for (int i = 0; i < 20; ++i) BLOCK_SILENT();
          CHECK(sim_song_units() == u && u <= held_at + 200 && FOLLOW() == HELD, "follow: HELD does not advance (%u, then %u after 20 more blocks; the prediction ran at most one pulse past %u)", u, sim_song_units(), held_at); }
        { int on = 0, off = 0; for (int i = 0; i < 4; ++i) BLOCK_SILENT(); pn = drain(mm, 64);
          for (unsigned k = 0; k < pn && k < 64; ++k) { if ((mm[k].data[0] & 0xf0U) == 0x90 && mm[k].data[2]) ++on; if ((mm[k].data[0] & 0xf0U) == 0x80 || ((mm[k].data[0] & 0xf0U) == 0x90 && !mm[k].data[2])) ++off; }
          CHECK(on == 0, "follow: no note starts while held (%d)", on); (void)off; }
        uint32_t held_units = sim_song_units();
        for (int i = 0; i < 20; ++i) BLOCK_RUN();                  /* the pulses are back after about 0.2 s */
        CHECK(FOLLOW() == RUNNING, "follow: pulses back inside 2 s without Stop: relocked (state %u)", FOLLOW());
        { uint32_t u = sim_song_units(); CHECK(u > held_units && u < held_units + 6 * 80 + 80, "follow: it goes on from the held position, not from where the clock would be (%u -> %u)", held_units, u); }
        /* A gap of 2 s or more: LOST; pulses alone never restart; Continue does. */
        for (int i = 0; i < 40; ++i) BLOCK_SILENT();
        for (int i = 0; i < 700; ++i) BLOCK_SILENT();             /* > 2 s */
        CHECK(FOLLOW() == LOST, "follow: a gap over 2 s: LOST (state %u)", FOLLOW());
        uint32_t lost_units = sim_song_units();
        for (int i = 0; i < 100; ++i) BLOCK_RUN();
        CHECK(FOLLOW() == LOST && sim_song_units() == lost_units, "follow: clock pulses alone do not restart a LOST song (state %u, %u -> %u)", FOLLOW(), lost_units, sim_song_units());
        SEND1(0xfb); for (int i = 0; i < 40; ++i) BLOCK_RUN();
        CHECK(FOLLOW() == RUNNING && sim_song_units() > lost_units, "follow: Continue restarts it from the held position (state %u, %u -> %u)", FOLLOW(), lost_units, sim_song_units());
        /* Stop always wins. */
        (void)drain(mm, 64);
        SEND1(0xfc); for (int i = 0; i < 30; ++i) BLOCK_RUN();
        CHECK(FOLLOW() == STOPPED, "follow: Stop: stopped (state %u)", FOLLOW());
        uint32_t stop_units = sim_song_units(); for (int i = 0; i < 60; ++i) BLOCK_RUN();
        CHECK(sim_song_units() == stop_units && FOLLOW() == STOPPED, "follow: pulses after a Stop do not move the song (%u -> %u)", stop_units, sim_song_units());
        /* Song position pointer while stopped, then Continue: the song goes on from the new position. */
        sim_file()[0] = 0xf2; sim_file()[1] = 64; sim_file()[2] = 0; (void)sim_midi_from(0, 3);   /* SPP 64 = row 2 (64 steps in) */
        for (int i = 0; i < 40; ++i) BLOCK_RUN();
        CHECK(FOLLOW() == STOPPED && sim_song_units() == 64U * 480U && (sim_song_status(0) >> 16 & 255U) == 1,
              "follow: SPP while stopped moves to row 2 (units %u, row %u) and stays stopped", sim_song_units(), sim_song_status(0) >> 16 & 255U);
        (void)drain(mm, 64);
        SEND1(0xfb); unsigned e_block = 0;
        for (int i = 0; i < 60; ++i) { BLOCK_RUN(); pn = drain(mm, 64); unsigned pp; if (!e_block && count(mm, pn, 0x94, 64, 80, &pp)) e_block = (unsigned)i + 1; }
        CHECK(FOLLOW() == RUNNING && e_block && e_block <= 12, "follow: Continue after SPP starts row 2's note at its first pulse (block %u)", e_block);
        /* SPP while running jumps; to the middle of a row: row 1 step 4. */
        sim_file()[0] = 0xf2; sim_file()[1] = 4; sim_file()[2] = 0; (void)sim_midi_from(0, 3);
        for (int i = 0; i < 40; ++i) BLOCK_RUN();
        CHECK(FOLLOW() == RUNNING && (sim_song_status(0) >> 16 & 255U) == 0 && sim_song_units() >= 4U * 480U && sim_song_units() < 4U * 480U + 600U,
              "follow: SPP while running jumps back to step 4 of row 1 (units %u)", sim_song_units());
        /* Start from the middle restarts at the beginning; the song runs to its end and arms again. */
        SEND1(0xfa); for (int i = 0; i < 60; ++i) BLOCK_RUN();
        CHECK(FOLLOW() == RUNNING && sim_song_units() < 800U, "follow: Start restarts from the beginning (units %u)", sim_song_units());
        sim_file()[0] = 0xf2; sim_file()[1] = 120; sim_file()[2] = 0; (void)sim_midi_from(0, 3);   /* SPP 120: eight steps from the end */
        for (int i = 0; i < 6000 && FOLLOW() != ARMED; ++i) BLOCK_RUN();
        for (int i = 0; i < 200; ++i) BLOCK_RUN();
        CHECK((sim_song_status(0) >> 8 & 255U) == 1 && (FOLLOW() == ARMED || FOLLOW() == WAITING), "follow: at the song end it arms again for the next Start (state %u)", FOLLOW());
        /* Fuzz: random Start / Stop / Continue / SPP / pulse trains / gaps for 240000 blocks (the second half every 23 blocks): the state stays one of the
         * known ones, the position never passes the song's end, and after a final Stop no note is left sounding. */
        {
            sim_song_stop(); for (int i = 0; i < 30; ++i) BLOCK_SILENT();
            (void)drain(mm, 64);
            CHECK(sim_song_load(0) == 0 && sim_song_play() == 0, "follow fuzz: armed again");
            uint32_t rs = 0x9e3779b9U; static int held[16][128]; memset(held, 0, sizeof held);
            #define FRND() (rs ^= rs << 13, rs ^= rs >> 17, rs ^= rs << 5, rs)
            int run = 0; unsigned bad_state = 0, over_end = 0, neg = 0, ops = 0; double bpm = 120; MASTER_SET(bpm);
            for (int blk = 0; blk < 240000; ++blk) {
                if (blk % (blk < 120000 ? 150 : 23) == 0) {   /* the second half acts every 23 blocks (67 ms): messages arrive back to back */
                    unsigned a = FRND() % 14; ++ops;
                    if (a == 0) SEND1(0xfa); else if (a == 1) SEND1(0xfc); else if (a == 2) SEND1(0xfb);
                    else if (a == 3) { sim_file()[0] = 0xf2; sim_file()[1] = (uint8_t)(FRND() % 128); sim_file()[2] = (uint8_t)(FRND() % 2); (void)sim_midi_from(0, 3); }
                    else if (a < 9) { bpm = 60 + FRND() % 140; MASTER_SET(bpm); run = 1; }
                    else if (a < 11) run = 0;                      /* a gap */
                    else run = 1;
                }
                if (run) BLOCK_RUN(); else BLOCK_SILENT();
                pn = drain(mm, 64);
                for (unsigned k = 0; k < pn && k < 64; ++k) if (mm[k].port == 0) {
                    unsigned st = mm[k].data[0] & 0xf0U, ch = mm[k].data[0] & 15U;
                    if (st == 0x90 && mm[k].data[2]) ++held[ch][mm[k].data[1]];
                    else if (st == 0x80 || (st == 0x90 && !mm[k].data[2])) { if (held[ch][mm[k].data[1]] > 0) --held[ch][mm[k].data[1]]; }
                }
                unsigned f = FOLLOW(); if (f > STOPPED && f != 0) ++bad_state;
                if (sim_song_units() > 64U * 480U * 2U + 960U) ++over_end;
                (void)neg;
            }
            SEND1(0xfc); for (int i = 0; i < 40; ++i) BLOCK_SILENT();
            pn = drain(mm, 64);
            for (unsigned k = 0; k < pn && k < 64; ++k) if (mm[k].port == 0) {
                unsigned st = mm[k].data[0] & 0xf0U, ch = mm[k].data[0] & 15U;
                if (st == 0x80 || (st == 0x90 && !mm[k].data[2])) { if (held[ch][mm[k].data[1]] > 0) --held[ch][mm[k].data[1]]; }
            }
            unsigned stuck_notes = 0; for (unsigned c = 0; c < 16; ++c) for (unsigned n = 0; n < 128; ++n) stuck_notes += held[c][n] > 0;
            CHECK(bad_state == 0 && over_end == 0 && FOLLOW() != 0, "follow fuzz: %u random operations, the state always valid (%u bad), the position inside the song (%u over)", ops, bad_state, over_end);
            CHECK(stuck_notes == 0, "follow fuzz: after the final Stop no note is left sounding (%u stuck)", stuck_notes);
            #undef FRND
        }
        /* PLAY while following stops it; back to the internal clock everything is as before. */
        (void)drain(mm, 64);
        sim_song_stop(); for (int i = 0; i < 30; ++i) BLOCK_SILENT();
        CHECK((sim_song_status(0) >> 8 & 255U) == 0 && FOLLOW() == 0, "follow: PLAY (stop) leaves follow mode (state %u)", FOLLOW());
        groove_clock_set(0);
        #undef MASTER_SET
        #undef SEND1
        #undef FOLLOW
        #undef BLOCK_RUN
        #undef BLOCK_SILENT
        sim_midi_drain(0); sim_test_request_passes(0); (void)sim_open(0);
    }

    /* ---- 19. Task 17: options F + G (the timer and the look-ahead) ------------------------------------ */
    {
        extern uint32_t ct_test_ticks_extra;
        void groove_clock_set(unsigned mode);
        void groove_midi_at(unsigned num, unsigned den);
        enum { PERIOD = 12000, LEAD = 6000 };
        /* The diag clock is fm1_millis() * 24000 + ct_test_ticks_extra: the test sets the time it wants. */
        #define SET_NOW(x) (ct_test_ticks_extra += (uint32_t)(x) - ct_diag_ticks())
        #define HAS(note) (count(m, n, 0x90, (note), 100, &ports) >= 1)
        uint8_t pg[64], a2[64], reply[96]; struct message m[64]; unsigned n, ports;
        sim_boot(1); sim_midi_capture(1); sim_test_request_passes(0); sim_test_costs(0, 0); sim_midi_drain(0);
        (void)ct_diag_read(9, a2); settle(); (void)drain(m, 64);
        CHECK(ct_diag_read(10, pg) == 56 && PG32(pg, 0) == 0 && PG32(pg, 12) == 0 && PG32(pg, 11) == PERIOD,
              "F+G: the page is 56 bytes; not running in the host build until the test starts it");
        ct_fg_test(1);
        /* A block after a timer tick is live: its events are due one block after its start. */
        ct_fg_tick();
        uint32_t tb = ct_diag_ticks();
        (void)sim_render(); (void)ct_diag_read(10, pg);
        uint32_t len = PG32(pg, 10), due = tb + len;
        CHECK(PG32(pg, 0) == 1 && PG32(pg, 12) == 1 && len > 60000 && len < 80000, "F+G: running and live after a timer tick (block %u ticks)", len);
        SET_NOW(due + PERIOD); sim_test_pass(); (void)drain(m, 64);          /* empty the lanes (the clock's F8) */
        groove_midi_song_note(0, 70, 100);                                     /* stamped with the block's base: due */
        SET_NOW(due - LEAD - 1);
        uint32_t asked = sim_test_control_requests;
        ct_fg_tick(); sim_test_pass(); n = drain(m, 64);
        CHECK(sim_test_control_requests == asked && !HAS(70), "F+G: before its due time (less the lead) the timer asks for no pass and a pass leaves the note (%u requests)", sim_test_control_requests - asked);
        SET_NOW(due - LEAD);
        (void)ct_diag_read(7, a2); uint32_t retries0 = PG32(a2, 5);
        ct_fg_tick(); ct_fg_tick(); (void)ct_diag_read(7, a2);
        CHECK(sim_test_control_requests == asked + 2 && PG32(a2, 5) == retries0 + 1, "F+G: at the due time the timer asks; a request that got no pass is repeated by the next tick (%u requests, %u retry)", sim_test_control_requests - asked, PG32(a2, 5) - retries0);
        sim_test_pass(); n = drain(m, 64); (void)ct_diag_read(10, pg);
        CHECK(HAS(70) && PG32(pg, 2) >= 1 && PG32(pg, 4) >= 1, "F+G: the pass sends the due note (%u sent with a due time)", PG32(pg, 2));
        asked = sim_test_control_requests; ct_fg_tick();
        CHECK(sim_test_control_requests == asked, "F+G: nothing waiting, the timer asks for nothing");
        { unsigned ct_midi_due_within(uint32_t ticks);
          groove_midi_song_note(0, 69, 100);                                   /* due at `due` again */
          SET_NOW(due - 50000);
          unsigned far = ct_midi_due_within(40000), near = ct_midi_due_within(60000);
          SET_NOW(due + PERIOD); sim_test_pass(); (void)drain(m, 64);
          CHECK(!far && near && !ct_midi_due_within(60000), "F+G: the painter's question: due within 2.5 ms yes, within 1.7 ms no, nothing waiting no (%u %u)", far, near);
          groove_midi_song_note(0, 69, 0); sim_test_pass(); (void)drain(m, 64); }
        groove_midi_song_note(0, 70, 0); SET_NOW(due + PERIOD); sim_test_pass(); (void)drain(m, 64);
        /* Places inside the block: a quarter and three quarters of a block after the base; the order is kept. */
        ct_fg_tick(); tb = ct_diag_ticks(); (void)sim_render(); (void)ct_diag_read(10, pg); len = PG32(pg, 10); due = tb + len;
        SET_NOW(due + PERIOD); sim_test_pass(); (void)drain(m, 64);
        groove_midi_at(1, 4); groove_midi_song_note(0, 71, 100);
        groove_midi_at(3, 4); groove_midi_song_note(0, 72, 100);
        groove_midi_at(0, 0);
        uint32_t due_a = due + (uint32_t)((uint64_t)len * 1 / 4), due_b = due + (uint32_t)((uint64_t)len * 3 / 4);
        SET_NOW(due_a - LEAD - 1); sim_test_pass(); n = drain(m, 64);
        unsigned early = HAS(71) || HAS(72);
        SET_NOW(due_a - LEAD); sim_test_pass(); n = drain(m, 64);
        unsigned a_only = HAS(71) && !HAS(72);
        SET_NOW(due_b - LEAD - 1); sim_test_pass(); n = drain(m, 64);
        unsigned b_early = HAS(72);
        SET_NOW(due_b - LEAD); sim_test_pass(); n = drain(m, 64);
        CHECK(!early && a_only && !b_early && HAS(72), "F+G: two notes at 1/4 and 3/4 of the block leave at their own due times, in order (%u %u %u %u)", early, a_only, b_early, HAS(72));
        /* The batch: eight notes due together are handed to each port in one call (one burst), in their order. */
        { for (unsigned k = 0; k < 8; ++k) groove_midi_song_note(0, 80 + k, 100);
          SET_NOW(due_b + PERIOD); sim_test_log_reset(); sim_test_pass(); n = drain(m, 64);
          unsigned calls = 0, in_order = 1, seen = 0; for (const char *c = sim_test_log(); *c; ++c) if (*c == 'M') ++calls;
          for (unsigned i = 0; i < n && i < 64; ++i) if (m[i].port == 0 && (m[i].data[0] & 0xf0U) == 0x90) { if (m[i].data[1] != 80 + seen) in_order = 0; ++seen; }
          CHECK(calls == 3 && seen == 8 && in_order && n == 24, "batch: eight notes due together: one send call per port (%u calls for %u messages), in order", calls, n);
          for (unsigned k = 0; k < 8; ++k) groove_midi_song_note(0, 80 + k, 0);
          sim_test_pass(); (void)drain(m, 64); }
        /* Lateness is counted: a note sent 1.25 ms after its due time is in the < 2 ms bin. */
        (void)ct_diag_read(1, a2); sim_test_pass(); (void)drain(m, 64);
        groove_midi_song_note(0, 73, 100);                                     /* due at the base again */
        SET_NOW(due + 30000); sim_test_pass(); n = drain(m, 64); (void)ct_diag_read(10, pg);
        CHECK(HAS(73) && PG32(pg, 7) == 1 && PG32(pg, 3) == 30000, "F+G: a note sent 1.25 ms late is counted (bin < 2 ms: %u, latest %u ticks)", PG32(pg, 7), PG32(pg, 3));
        for (unsigned k = 70; k < 74; ++k) groove_midi_song_note(0, k, 0);
        SET_NOW(due + 4 * PERIOD); sim_test_pass(); (void)drain(m, 64);
        /* The timer stands still: the block is not live, no look-ahead, and the block asks itself (A2). */
        sim_test_request_passes(1);
        (void)sim_render(); (void)sim_render(); (void)drain(m, 64); (void)ct_diag_read(10, pg);
        CHECK(PG32(pg, 12) == 0, "F+G: no timer tick since the last block: not live");
        groove_midi_song_note(0, 74, 100); (void)sim_render(); n = drain(m, 64);
        CHECK(HAS(74), "F+G: without the timer the block asks for the pass itself and the note leaves in that block (A2)");
        groove_midi_song_note(0, 74, 0); settle(); (void)drain(m, 64);
        /* A2 off: no look-ahead and no request, whatever the timer does. */
        sim_test_request_passes(0); (void)ct_diag_read(8, a2);
        ct_fg_tick(); (void)sim_render(); (void)ct_diag_read(10, pg); sim_test_pass(); (void)drain(m, 64);
        groove_midi_song_note(0, 75, 100);
        asked = sim_test_control_requests; ct_fg_tick(); sim_test_pass(); n = drain(m, 64);
        CHECK(PG32(pg, 12) == 0 && sim_test_control_requests == asked && HAS(75), "F+G: with A2 off the note leaves with the next pass and the timer asks for nothing");
        groove_midi_song_note(0, 75, 0); settle(); (void)drain(m, 64);
        (void)ct_diag_read(9, a2);
        /* tabby-v1.3: the worst lateness with what the device was doing (command 25 requests 12 and 13). */
        { uint8_t lr[64], lb[64];
          void ct_late_remote(unsigned cmd, unsigned op); void ct_late_panel(unsigned kind, unsigned id);
          ct_fg_tick(); tb = ct_diag_ticks(); (void)sim_render(); (void)ct_diag_read(10, pg); len = PG32(pg, 10);
          SET_NOW(tb + len + PERIOD); sim_test_pass(); (void)drain(m, 64);
          ct_late_remote(29, 2); ct_late_panel(2, 5);
          ct_fg_tick(); tb = ct_diag_ticks(); (void)sim_render();
          groove_midi_song_note(0, 71, 100);
          SET_NOW(tb + len + 240000U); sim_test_pass(); n = drain(m, 64);        /* the pass comes 10 ms after the due time */
          CHECK(ct_diag_read(12, lr) == 60 && ct_diag_read(13, lb) == 60, "worst lateness: both pages are 60 bytes");
          CHECK(HAS(71) && PG32(lr, 0) >= 239000U && PG32(lr, 0) <= 260000U && PG32(lr, 2) >= 1 && !(lr[12] & 1) && lr[14] == 29 && lr[15] == 2
                && lr[18] == 2 && lr[19] == 5 && lr[24] == 0x90 && (lr[16] | lr[17] << 8) != 0xffff && (lr[28] | lr[29] << 8) >= 90 && lr[30] == 0 && lr[31] == 0 && lr[32] == 0 && lr[33] == 0,
                "worst lateness: a note sent 10 ms late is in the record for 'stopped' with the last remote command (29, 2), the last panel action (pad 5) and the event; none while running (%u ticks, %u at 4 ms or more, flags %u, command %u %u, panel %u %u, status %02x)",
                PG32(lr, 0), PG32(lr, 2), lr[12], lr[14], lr[15], lr[18], lr[19], lr[24]);
          CHECK(!memcmp(lr, lb, 28), "worst lateness: the record since power-on holds the same");
          groove_midi_song_note(0, 71, 0); sim_test_pass(); (void)drain(m, 64);
          (void)ct_diag_read(1, lr); sim_test_pass(); (void)drain(m, 64);
          (void)ct_diag_read(12, lr); (void)ct_diag_read(13, lb);
          { unsigned ct_midi_stop_pending(void); void groove_midi_transport(unsigned owner, uint8_t status);
            ct_fg_tick(); tb = ct_diag_ticks(); (void)sim_render();
            groove_midi_transport(0, 0xfa); groove_midi_transport(0, 0xfc);
            unsigned waits = ct_midi_stop_pending();
            SET_NOW(tb + 2 * len + PERIOD); sim_test_pass(); n = drain(m, 64);
            unsigned fc = 0; for (unsigned i = 0; i < n; ++i) fc += m[i].data[0] == 0xfc;
            CHECK(waits == 1 && fc >= 1 && !ct_midi_stop_pending(), "stop: a MIDI Stop in the queue is 'pending' until the pass that sends it (%u, %u sent)", waits, fc);
            { uint8_t tmp[64]; (void)ct_diag_read(1, tmp); } sim_test_pass(); (void)drain(m, 64); }
          CHECK(PG32(lr, 0) < 239000U && PG32(lb, 0) >= 239000U && lb[14] == 29, "worst lateness: the reset of the counters clears the first record and keeps the one since power-on (%u, %u; event %02x gap %u)", PG32(lr, 0), PG32(lb, 0), lr[24], lr[28] | lr[29] << 8); }
        /* The same song with F + G off and on: the same notes in the same order, none lost. */
        { static uint8_t seq[2][600][3]; unsigned len2[2] = {0, 0};
          for (unsigned run = 0; run < 2; ++run) {
            sim_boot(1); sim_midi_capture(1); sim_test_costs(0, 0); sim_midi_drain(0); sim_test_request_passes(1);
            ct_fg_test(run); (void)ct_diag_read(9, a2); ct_test_ticks_extra = 0;
            uint8_t *f = sim_file(); uint8_t b1[76], b2[67]; memset(b1, 0, sizeof b1); memset(b2, 0, sizeof b2);
            unsigned at = 0; b1[at++] = 1; b1[at++] = 60; b1[at++] = 100; b1[at++] = 2; at += 3; b1[at++] = 1; b1[at++] = 62; b1[at++] = 90; b1[at++] = 1;
            b1[at++] = 2; b1[at++] = 65; b1[at++] = 80; b1[at++] = 1; b1[at++] = 67; b1[at++] = 70; b1[at++] = 3;
            b2[0] = 1; b2[1] = 64; b2[2] = 80; b2[3] = 1;
            memcpy(f, b1, sizeof b1); (void)sim_block_write(0, 1, sizeof b1);
            memcpy(f, b2, sizeof b2); (void)sim_block_write(0, 2, sizeof b2);
            memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "FG          ", 12); f[40] = 2; f[48] = 5;
            f[64] = 1; f[64 + 16] = 1; f[64 + 18] = 16; f[84] = 2; f[84 + 16] = 1; f[84 + 18] = 16;
            (void)sim_song_record_write(0); (void)sim_song_load(0); settle(); (void)drain(m, 64);
            (void)sim_song_play();
            /* Run 1 keeps the device's time: a block every 69632 ticks, a timer tick every 12000, each at its own
             * time (the simulator's millisecond clock is corrected before every block and tick). */
            uint32_t t0 = ct_diag_ticks() + 100000U, next_tick = t0 + 3000U;
            if (run) { SET_NOW(t0 - 1000U); ct_fg_tick(); }
            for (unsigned b = 0; b < 1500; ++b) {
                uint32_t tb2 = t0 + b * 69632U;
                if (run) SET_NOW(tb2);
                (void)sim_render();
                while (run && (int32_t)(next_tick - (tb2 + 69632U)) < 0) {
                    SET_NOW(next_tick); next_tick += PERIOD;
                    uint32_t before = sim_test_control_requests; ct_fg_tick();
                    if (sim_test_control_requests != before) sim_test_pass();
                }
                n = drain(m, 64);
                for (unsigned i = 0; i < n; ++i) if (m[i].port == 0 && m[i].data[0] < 0xf0 && len2[run] < 600) { memcpy(seq[run][len2[run]], m[i].data, 3); ++len2[run]; }
            }
            if (run) { (void)ct_diag_read(10, pg);
              /* (the simulator's own 10 ms pass runs with its millisecond clock up to 3 ms ahead, so "late" up to 3.3 ms here) */
              CHECK(PG32(pg, 2) > 40 && PG32(pg, 9) == 0, "F+G: a song played with the timer: %u events sent at their due times, none 4 ms late (latest %u ticks)", PG32(pg, 2), PG32(pg, 3)); }
            sim_song_stop(); settle(); (void)drain(m, 64);
          }
          CHECK(len2[0] >= 10 && len2[0] == len2[1] && !memcmp(seq[0], seq[1], (size_t)len2[0] * 3), "F+G: the song's notes are the same with F + G off and on (%u and %u messages on DIN)", len2[0], len2[1]);
          if (memcmp(seq[0], seq[1], (size_t)len2[0] * 3)) for (unsigned i = 0; i < len2[0]; ++i) printf("     %02x %u %u | %02x %u %u\n", seq[0][i][0], seq[0][i][1], seq[0][i][2], seq[1][i][0], seq[1][i][1], seq[1][i][2]);
          ct_fg_test(0); }
        /* Clock follow with the look-ahead: the song runs one block ahead of the pulses (so its notes leave at their
         * pulses, not a block later), and the first note after Start leaves in the block that saw the first pulse. */
        { unsigned sim_song_units(void); int lead[2] = {0, 0}; unsigned first_block[2] = {999, 999};
          for (unsigned run = 0; run < 2; ++run) {
            sim_boot(1); sim_midi_capture(1); sim_test_costs(0, 0); sim_midi_drain(0); sim_test_request_passes(1);
            ct_fg_test(run); (void)ct_diag_read(9, a2); ct_test_ticks_extra = 0;
            uint8_t *f = sim_file(); uint8_t b1[67]; memset(b1, 0, sizeof b1); b1[0] = 1; b1[1] = 60; b1[2] = 100; b1[3] = 2;
            memcpy(f, b1, sizeof b1); (void)sim_block_write(0, 1, sizeof b1);
            memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "FGFOLLOW    ", 12); f[40] = 1; f[48] = 5;
            f[64] = 1; f[64 + 16] = 1; f[64 + 18] = 64;
            (void)sim_song_record_write(0); groove_clock_set(1); (void)sim_song_load(0); (void)sim_song_play(); settle(); (void)drain(m, 64);
            uint32_t t0 = ct_diag_ticks() + 100000U, next_tick = t0 + 3000U;
            double phase = 0, period = 861.328125 / 120.0; unsigned pulses = 0;
            if (run) { SET_NOW(t0 - 1000U); ct_fg_tick(); }
            sim_file()[0] = 0xfa; (void)sim_midi_from(0, 1);
            for (unsigned b = 0; b < 300; ++b) {
                uint32_t tb2 = t0 + b * 69632U;
                if (run) SET_NOW(tb2);
                phase += 1.0; if (phase >= period) { phase -= period; sim_file()[0] = 0xf8; (void)sim_midi_from(0, 1); ++pulses; }
                (void)sim_render();
                while (run && (int32_t)(next_tick - (tb2 + 69632U)) < 0) {
                    SET_NOW(next_tick); next_tick += PERIOD;
                    uint32_t before = sim_test_control_requests; ct_fg_tick();
                    if (sim_test_control_requests != before) sim_test_pass();
                }
                n = drain(m, 64);
                if (first_block[run] == 999 && pulses && count(m, n, 0x94, 60, 100, &ports)) first_block[run] = b;   /* the song's channel 5 */
            }
            /* where the pulses say the song is: 80 units a pulse from the first one, plus the part of a pulse since the last */
            lead[run] = (int)sim_song_units() - (int)((pulses - 1U) * 80U + (unsigned)(phase / period * 80.0));
            sim_song_stop(); groove_clock_set(0); settle(); (void)drain(m, 64);
          }
          ct_fg_test(0);
          CHECK(first_block[0] != 999 && first_block[1] <= first_block[0] + 1, "F+G follow: the first note after Start leaves in the block of the first pulse, as without F + G (block %u and %u)", first_block[0], first_block[1]);
          CHECK(lead[0] >= -12 && lead[0] <= 12 && lead[1] - lead[0] >= 6 && lead[1] - lead[0] <= 16, "F+G follow: the song runs one block (11 units at 120 BPM) ahead of the pulses (%d units without, %d with)", lead[0], lead[1]); }
        /* Command 25 request 10 through the transfer path, and the remote status with CLOCK. */
        { sim_boot(1); sim_midi_capture(1); sim_test_request_passes(1); sim_midi_drain(0); ct_test_ticks_extra = 0; settle();
          rc_source = 1; rc_n = 0;
          int k = rcmd(25, (const uint8_t[]){10}, 1, reply);
          CHECK(k == 57 && reply[0] == 0, "F+G: command 25 request 10 answers with the page (%d bytes, code %u)", k, reply[0]);
          groove_clock_set(1); settle(); (void)drain(m, 64);
          k = rcmd(29, (const uint8_t[]){0}, 1, reply);
          CHECK(k == 15 && reply[0] == 0 && reply[14] == 1, "remote: the status is 14 bytes and reports CLOCK = MIDI (%d bytes, %u)", k, reply[14]);
          k = rcmd(29, (const uint8_t[]){8, 1}, 2, reply);
          CHECK(k >= 1 && reply[0] == 71, "remote: operation 8 does not exist (code %u)", reply[0]);
          rc_source = 0; groove_clock_set(0); settle(); (void)drain(m, 64); }
        #undef SET_NOW
        #undef HAS
        sim_test_request_passes(0); (void)sim_open(0);
    }

    /* ---- 20. Task 16 Goal 5: the v3 clip plays as the same notes as v2 (docs/CLIP-V3.md) ------------------ */
    {
        sim_boot(1); sim_midi_capture(1); sim_midi_drain(1);
        uint8_t v2a[1600], v2b[1600], v3a[3100], v3b[3100]; unsigned la = 0, lb = 0;
        /* Two blocks with chords, offsets before and after the step, long and short lengths, retrigger and legato. */
        memset(v2a, 0, sizeof v2a); memset(v2b, 0, sizeof v2b);
        struct { unsigned step; int off; unsigned pitch, vel, len, retrig; } na[] = {
            {0, -100, 60, 100, 960, 1}, {0, 0, 64, 90, 480, 1}, {0, 200, 67, 80, 240, 0}, {3, 60, 62, 70, 120, 1}, {4, -240, 65, 96, 700, 1},
            {8, 0, 48, 110, 1920, 1}, {8, 0, 55, 100, 1920, 1}, {8, 10, 59, 90, 1900, 0}, {8, 20, 64, 80, 1800, 1}, {12, 240, 71, 60, 100, 1}, {15, -50, 72, 127, 300, 1} };
        for (int pass = 0; pass < 2; ++pass) {
            uint8_t *out = pass ? v2b : v2a; unsigned at = 0; unsigned shift = pass ? 5 : 0;
            for (unsigned step = 0; step < 64; ++step) {
                unsigned count = 0; uint8_t notes[4][6];
                for (unsigned i = 0; i < sizeof na / sizeof na[0]; ++i) if (na[i].step == step) {
                    struct timed_note n; n.pitch = (uint8_t)(na[i].pitch + shift); n.velocity = (uint8_t)na[i].vel; n.retrigger = (uint8_t)na[i].retrig; n.offset = (int16_t)na[i].off; n.length = na[i].len;
                    (void)timed_note_encode(&n, notes[count++]);
                }
                out[at++] = (uint8_t)count;
                for (unsigned i = 0; i < count; ++i) { memcpy(out + at, notes[i], 6); at += 6; }
            }
            if (pass) lb = at; else la = at;
        }
        int ra = clip_v3_from_v2(v2a, la, v3a, sizeof v3a, NULL), rb = clip_v3_from_v2(v2b, lb, v3b, sizeof v3b, NULL);
        CHECK(ra > 0 && rb > 0, "v3: the two test blocks migrate (%d, %d bytes against %u, %u as v2)", ra, rb, la, lb);
        uint8_t *f = sim_file();
        for (unsigned version = 2; version <= 3; ++version) {            /* song 2 = v2 blocks, song 3 = the same notes as v3 blocks */
            unsigned song = version, format = version == 2 ? 1 : 2;
            memcpy(f, version == 2 ? v2a : v3a, version == 2 ? la : (unsigned)ra); int r = sim_block_write2(song, 1, format, version == 2 ? la : (unsigned)ra);
            CHECK(r == 0, "v%u: block 1 stored (%d)", version, r);
            memcpy(f, version == 2 ? v2b : v3b, version == 2 ? lb : (unsigned)rb); r = sim_block_write2(song, 2, format, version == 2 ? lb : (unsigned)rb);
            CHECK(r == 0, "v%u: block 2 stored (%d)", version, r);
            memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "CLIP COMPARE", 12); f[40] = 2; f[48] = 5;
            f[64] = 1; f[64 + 16] = 1; f[64 + 18] = 16; f[84] = 2; f[84 + 16] = 1; f[84 + 18] = 16;
            CHECK(sim_song_record_write(song) == 0, "v%u: song record stored", version);
        }
        static struct log_entry log[2][4096]; unsigned logged[2] = {0, 0}, late_grid = 0;
        for (unsigned version = 2; version <= 3; ++version) {
            CHECK(sim_song_load(version) == 0, "v%u: song loaded", version);
            { struct message m[64]; (void)drain(m, 64); }
            CHECK(sim_song_play() == 0, "v%u: song started", version);
            (void)play_log(log[version - 2], 4096, &logged[version - 2], 4000, -1, 0);
            late_grid = sim_song_status(2);
        }
        CHECK(logged[0] > 20 && logged[0] == logged[1], "v3 plays as many messages as v2 (%u, %u)", logged[0], logged[1]);
        unsigned differ = 0;
        for (unsigned i = 0; i < logged[0] && i < logged[1]; ++i) if (memcmp(&log[0][i], &log[1][i], sizeof log[0][i])) ++differ;
        CHECK(differ == 0, "v3 plays byte-identical MIDI to v2, each message in the same block (%u of %u differ)", differ, logged[0]);
        /* The scheduler cursor (branch clipv3-cursor): the same v3 song played from its event lists (the test switch
         * sends every v3 clip that way) is byte-identical to the grid, message for message and block for block. */
        { static struct log_entry clog[4096]; unsigned clogged = 0;
          song_test_cursor(1);
          CHECK(sim_song_load(3) == 0, "cursor: the v3 song loaded again");
          { struct message m[64]; (void)drain(m, 64); }
          CHECK(sim_song_play() == 0, "cursor: song started");
          (void)play_log(clog, 4096, &clogged, 4000, -1, 0);
          unsigned cd = 0; for (unsigned i = 0; i < logged[0] && i < clogged; ++i) if (memcmp(&log[0][i], &clog[i], sizeof clog[i])) ++cd;
          CHECK(clogged == logged[0] && cd == 0, "cursor: the event-list scheduler plays byte-identical MIDI to the step grid (%u messages, %u differ)", clogged, cd);
          CHECK(sim_song_status(2) == late_grid, "cursor: the same late and underrun counts as the grid (the step-0 note before the song's start counts as late in both: %u, %u)", sim_song_status(2), late_grid);
          song_test_cursor(0); }
        /* A v3 clip the grid cannot hold (five notes in a step, a controller event) is stored (it is valid v3) and now
         * plays from its event list: the chord in list order, the controller before the note listed after it at the
         * same time, a note late in the clip in its block. */
        uint8_t big[16 + 6 * 8]; memset(big, 0, sizeof big); big[0] = 64; big[6] = 8;
        for (unsigned i = 0; i < 5; ++i) { uint8_t *q = big + 16 + 6 * i; q[0] = 240; q[2] = (uint8_t)(60 + i); q[3] = 100; q[4] = 100; }
        { uint8_t *q = big + 16 + 6 * 5; unsigned tm = 4 * 480 + 240; q[0] = (uint8_t)tm; q[1] = (uint8_t)(tm >> 8); q[2] = 1; q[3] = 0x80; q[4] = 74; q[5] = 99;   /* CC 74 = 99 at step 4 */
          q += 6; q[0] = (uint8_t)tm; q[1] = (uint8_t)(tm >> 8); q[2] = 72; q[3] = 90; q[4] = 100;                                                          /* a note at the same time, listed after it */
          q += 6; tm = 12 * 480 + 240; q[0] = (uint8_t)tm; q[1] = (uint8_t)(tm >> 8); q[2] = 76; q[3] = 80; q[4] = 100; }                                  /* a note at step 12 */
        memcpy(f, big, sizeof big); CHECK(sim_block_write2(2, 9, 2, sizeof big) == 0, "v3: a five-note step is a valid block");
        { memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "CURSOR      ", 12); f[40] = 1; f[48] = 5;
          f[64] = 9; f[64 + 16] = 1; f[64 + 18] = 16;
          CHECK(sim_song_record_write(2) == 0, "cursor: a song with the five-note clip stored");
          static struct log_entry blog[512]; unsigned bl = 0;
          CHECK(sim_song_load(2) == 0, "cursor: it loads");
          { struct message m[64]; (void)drain(m, 64); }
          CHECK(sim_song_play() == 0, "cursor: it plays (the grid could not hold it: BLOCK READ ERROR before)");
          (void)play_log(blog, 512, &bl, 4000, -1, 0);
          unsigned ch5 = 4, chord = 0, order = 1, at = 0;
          for (unsigned i = 0; i < bl; ++i) if (blog[i].s == (0x90 | ch5) && blog[i].d1 >= 60 && blog[i].d1 <= 64 && blog[i].d2) { if (blog[i].d1 != 60 + chord) order = 0; ++chord; at = blog[i].block; }
          int cc = find_log(blog, bl, 0xb0 | ch5, 74, 99, 0), n72 = find_log(blog, bl, 0x90 | ch5, 72, 90, 0), n76 = find_log(blog, bl, 0x90 | ch5, 76, 80, 0);
          CHECK(chord == 5 && order, "cursor: the five-note chord plays, in list order (%u notes)", chord);
          CHECK(cc >= 0 && n72 == cc + 1 && blog[cc].block == blog[n72].block, "cursor: the controller event leaves on the track's channel just before the note listed after it (%d, %d)", cc, n72);
          /* step 12 is 8 steps after step 4: 8 x 480 units at 120 BPM = 1 s = 344.5 blocks */
          CHECK(n76 > n72 && blog[n76].block - blog[n72].block >= 343 && blog[n76].block - blog[n72].block <= 346, "cursor: the note at step 12 is 8 steps after the one at step 4 (%u blocks)", n76 > 0 ? blog[n76].block - blog[n72].block : 0);
          CHECK(stuck(blog, bl) == 0 && at < 8, "cursor: every note gets its note-off; the chord starts with the song"); }
        /* The clip header's program and bank go out once when the track enters the clip, before its first note; a repeat
         * of the same clip sends nothing more. */
        { uint8_t hp[16 + 6]; memset(hp, 0, sizeof hp); hp[0] = 16; hp[1] = 3; hp[2] = 5; hp[3] = 1; hp[4] = 2; hp[6] = 1;
          hp[16] = 240; hp[18] = 67; hp[19] = 100; hp[20] = 100;
          memcpy(f, hp, sizeof hp); CHECK(sim_block_write2(2, 11, 2, sizeof hp) == 0, "cursor: a clip with a header program and bank is stored");
          memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "HEADER PROG ", 12); f[40] = 1; f[48] = 5;
          f[64] = 11; f[64 + 16] = 3; f[64 + 18] = 16;                                     /* the row plays three times */
          CHECK(sim_song_record_write(2) == 0 && sim_song_load(2) == 0, "cursor: its song stored and loaded");
          static struct log_entry hl[256]; unsigned hn = 0;
          { struct message m[64]; (void)drain(m, 64); }
          (void)sim_song_play(); (void)play_log(hl, 256, &hn, 6000, -1, 0);
          int msb = find_log(hl, hn, 0xb4, 0, 1, 0), lsb = find_log(hl, hn, 0xb4, 32, 2, 0), pc = find_log(hl, hn, 0xc4, 5, 0, 0), note = find_log(hl, hn, 0x94, 67, 100, 0);
          unsigned notes = 0, pcs = 0; for (unsigned i = 0; i < hn; ++i) { if (hl[i].s == 0x94 && hl[i].d2) ++notes; if (hl[i].s == 0xc4) ++pcs; }
          CHECK(msb >= 0 && lsb == msb + 1 && pc == lsb + 1 && note > pc && hl[note].block == hl[pc].block, "cursor: bank MSB, bank LSB, program, then the first note, in the same block (%d %d %d %d)", msb, lsb, pc, note);
          CHECK(notes == 3 && pcs == 1, "cursor: three passes of the clip, the program sent once (%u notes, %u program changes)", notes, pcs); }
        /* A row of 128 steps with a 128-step clip: the note at step 100 plays 100 steps after the first (4306.6 blocks at
         * 120 BPM), and the song ends after 128 steps. A row of 144 steps is refused. */
        { uint8_t lc[16 + 12]; memset(lc, 0, sizeof lc); lc[0] = 128; lc[6] = 2;
          lc[16] = 240; lc[18] = 60; lc[19] = 100; lc[20] = 100;
          unsigned tm = 100 * 480 + 240; lc[22] = (uint8_t)tm; lc[23] = (uint8_t)(tm >> 8); lc[24] = 62; lc[25] = 100; lc[26] = 100;
          memcpy(f, lc, sizeof lc); CHECK(sim_block_write2(2, 12, 2, sizeof lc) == 0, "long row: a 128-step clip is stored");
          memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "LONG ROW    ", 12); f[40] = 1; f[48] = 5;
          f[64] = 12; f[64 + 16] = 1; f[64 + 18] = 144;
          CHECK(sim_song_record_write(2) != 0, "long row: a row of 144 steps is refused");
          f[64 + 18] = 128;
          CHECK(sim_song_record_write(2) == 0 && sim_song_load(2) == 0, "long row: a row of 128 steps is stored and loads");
          static struct log_entry ll[64]; unsigned ln = 0;
          { struct message m[64]; (void)drain(m, 64); }
          (void)sim_song_play(); unsigned blocks = play_log(ll, 64, &ln, 9000, -1, 0);
          int n0 = find_log(ll, ln, 0x94, 60, 100, 0), n1 = find_log(ll, ln, 0x94, 62, 100, 0);
          CHECK(n0 >= 0 && n1 > n0 && ll[n1].block - ll[n0].block >= 4305 && ll[n1].block - ll[n0].block <= 4308, "long row: the note at step 100 plays 100 steps after step 0 (%u blocks)", n1 > 0 ? ll[n1].block - ll[n0].block : 0);
          CHECK(blocks >= 5510 && blocks <= 5530 && stuck(ll, ln) == 0, "long row: the song ends after 128 steps (%u blocks), nothing stuck", blocks); }
        /* Transfer kind 9: a block as it is stored, its format byte first; kind 6 still refuses a clip the grid cannot hold. */
        { uint8_t rp[96]; rc_source = 1; rc_n = 0;
          int k = rcmd(1, (const uint8_t[]){9, 2, 12, 0}, 4, rp);
          unsigned size = k == 3 ? rp[1] | (unsigned)rp[2] << 8 : 0;
          CHECK(k == 3 && rp[0] == 0 && size == 1 + 16 + 12, "kind 9: the download of the 128-step clip begins (%d bytes, size %u)", k, size);
          k = rcmd(2, (const uint8_t[]){0, 0, 29}, 3, rp);
          CHECK(k == 30 && rp[0] == 0 && rp[1] == 2 && rp[2] == 128 && rp[8] == 2, "kind 9: format 2, then the clip (128 steps, 2 events)");
          (void)rcmd(6, NULL, 0, rp);
          k = rcmd(1, (const uint8_t[]){6, 2, 12, 0}, 4, rp);
          CHECK(k >= 1 && rp[0] != 0, "kind 6: the same clip is refused as a v2 download (code %u)", rp[0]);
          (void)rcmd(6, NULL, 0, rp);
          k = rcmd(27, NULL, 0, rp);
          CHECK(k >= 4 && (rp[2] & 8), "capability flag bit 3 (v3 clips) is set");
          rc_source = 0; }
        /* Fuzz through the scheduler: random valid clips play to the end with every note released; damaged payloads are
         * stored exactly when the validator accepts them. (The sanitizer run of this file checks the memory.) */
        { uint32_t seed = 0x51f15eedU; unsigned played = 0, stuck_total = 0, not_ended = 0, mismatch = 0, stored = 0;
          static uint8_t c[CLIP_V3_BYTES_MAX]; static struct log_entry fl[1024];
          #define RND() (seed = seed * 1664525U + 1013904223U, seed >> 8)
          for (unsigned round = 0; round < 1500; ++round) {
              unsigned steps = 16 * (1 + RND() % 2), count = RND() % 40, time = 0, bytes = 16 + 6 * count;
              memset(c, 0, bytes); c[0] = (uint8_t)steps; c[6] = (uint8_t)count;
              if (RND() & 1) { c[1] |= 1; c[2] = (uint8_t)(RND() & 127); }
              for (unsigned i = 0; i < count; ++i) {
                  uint8_t *e = c + 16 + 6 * i;
                  time += RND() % (steps * 480U / (count + 1U) + 1U);
                  e[0] = (uint8_t)time; e[1] = (uint8_t)(time >> 8);
                  if (RND() % 5) { e[2] = (uint8_t)(RND() & 127); e[3] = (uint8_t)(1 + RND() % 127); unsigned len = 1 + RND() % 3000; e[4] = (uint8_t)len; e[5] = (uint8_t)(len >> 8); }
                  else { e[2] = (RND() & 1) ? CLIP_V3_CC : CLIP_V3_BEND; e[3] = 0x80; e[4] = (uint8_t)(RND() & 127); e[5] = (uint8_t)(RND() & 127); }
              }
              unsigned play = round < 40;
              if (!play) for (unsigned k = 1 + RND() % 3; k; --k) { unsigned at = RND() % bytes, bit = RND() & 7; c[at] ^= (uint8_t)(1U << bit); }
              int valid = clip_v3_validate(c, bytes) == 0;
              memcpy(f, c, bytes);
              int w = sim_block_write2(3, 100 + round % 60, 2, bytes);
              if ((w == 0) != valid) { if (!(valid && w != 0 && round >= 40)) ++mismatch; }   /* a full pool may refuse a valid clip late in the run; never the reverse */
              if (w == 0) ++stored;
              if (!play || !valid) continue;
              memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "FUZZ        ", 12); f[40] = 1; f[48] = 5;
              f[64] = (uint8_t)(100 + round % 60); f[64 + 16] = 2; f[64 + 18] = (uint8_t)steps;
              if (sim_song_record_write(3) || sim_song_load(3)) { ++mismatch; continue; }
              { struct message m[64]; (void)drain(m, 64); }
              unsigned fn = 0; (void)sim_song_play(); unsigned blocks = play_log(fl, 1024, &fn, 4000, -1, 0);
              ++played; stuck_total += (unsigned)stuck(fl, fn); if (blocks >= 4000) ++not_ended;
          }
          CHECK(played >= 30 && stuck_total == 0 && not_ended == 0, "fuzz: %u random valid clips played twice each from their event lists: every note released, every song ended", played);
          CHECK(mismatch == 0 && stored > 40, "fuzz: 1500 payloads, most of them damaged: the storage took exactly the valid ones (%u stored, %u mismatches)", stored, mismatch);
          #undef RND
          song_test_cursor(0); }
        big[0] = 129; memcpy(f, big, sizeof big); CHECK(sim_block_write2(2, 10, 2, sizeof big) != 0, "v3: 129 steps is refused by the storage");
        sim_midi_drain(0); (void)sim_open(0);
    }

    /* ---- 21. Task 17 Goal 3: song record version 3 (scenes and a clip table per track) ----------------- */
    {
        sim_boot(1); sim_midi_capture(1); sim_midi_drain(1); sim_test_request_passes(1);
        uint8_t *f = sim_file(); const unsigned SONG = 4;
        uint8_t b[64 + 6]; struct timed_note tn; tn.velocity = 100; tn.retrigger = 1; tn.offset = 0; tn.length = 240;
        for (unsigned id = 1; id <= 3; ++id) {                    /* block 1: note 60 on step 0; 2: note 62 on step 4; 3: note 64 on step 0 (track 2) */
            unsigned step = id == 2 ? 4 : 0, at = 0; memset(b, 0, sizeof b);
            for (unsigned k = 0; k < 64; ++k) { if (k == step) { b[at++] = 1; tn.pitch = (uint8_t)(58 + 2 * id); (void)timed_note_encode(&tn, b + at); at += 6; } else b[at++] = 0; }
            memcpy(f, b, sizeof b); CHECK(sim_block_write2(SONG, id, 1, sizeof b) == 0, "scenes: block %u stored", id);
        }
        #define HEADER(version_, rows_, name_) do { memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = (version_); memcpy(f + 24, name_, 12); f[40] = (rows_); f[48] = 5; f[49] = 6; \
            if ((version_) >= 2) { memset(f + 2624, 0xff, 4096 - 2624); memset(f + 2624, 0, 8); f[2626] = 1; } } while (0)   /* an empty event table */
        #define CLIP(t_, c_, id_) do { f[64 + (t_) * 128 + (c_) * 2] = (uint8_t)(id_); f[65 + (t_) * 128 + (c_) * 2] = (uint8_t)((id_) >> 8); } while (0)
        #define SCENE(i_, c0_, c1_, steps_) do { uint8_t *q_ = f + 1088 + (i_) * 12; q_[0] = (c0_); q_[1] = (c1_); q_[8] = 1; q_[10] = (steps_); } while (0)
        /* the same song as rows (version 1) and as scenes (version 3): identical MIDI */
        static struct log_entry la[256], lb[256]; unsigned na = 0, nb = 0;
        HEADER(1, 3, "AS ROWS     ");
        f[64] = 1; f[66] = 3; f[64 + 16] = 1; f[64 + 18] = 16;                    /* row 0: T1 block 1, T2 block 3 */
        f[84] = 2; f[84 + 16] = 1; f[84 + 18] = 16;                               /* row 1: T1 block 2 */
        f[104] = 1; f[104 + 16] = 1; f[104 + 18] = 32;                            /* row 2: T1 block 1 again, 32 steps */
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0, "scenes: the song as rows stored and loaded");
        { const struct song_model *m = song_model_current();
          CHECK(m && m->cycle == 16 && m->clips[0] == 2 && m->clip[0][0] == 1 && m->clip[0][1] == 2 && m->clips[1] == 1 && m->clip[1][0] == 3 &&
                m->scene_clip[0][0] == 1 && m->scene_clip[1][0] == 2 && m->scene_clip[2][0] == 1 && m->scene_clip[0][1] == 1 && m->scene_clip[1][1] == 0,
                "scenes: a song stored as rows gets its clip table from the rows (T1: 2 clips, T2: 1), cycle 16"); }
        { struct message m[64]; (void)drain(m, 64); } (void)sim_song_play(); (void)play_log(la, 256, &na, 6000, -1, 0);
        HEADER(3, 3, "AS SCENES   ");
        CLIP(0, 0, 1); CLIP(0, 1, 2); CLIP(1, 0, 3); CLIP(0, 5, 2);               /* T1 clips in places 1 and 2 (and block 2 again in place 6, unused by a scene), T2 place 1 */
        SCENE(0, 1, 1, 16); SCENE(1, 2, 0, 16); SCENE(2, 1, 0, 32);
        int w3 = sim_song_record_write(SONG);
        CHECK(w3 == 0 && sim_song_load(SONG) == 0, "scenes: the same song as a version-3 record stored and loaded (%d)", w3);
        { const struct song_model *m = song_model_current(); const struct song_record *r = song_current();
          CHECK(m && m->clips[0] == 6 && m->clip[0][5] == 2 && m->scene_clip[1][0] == 2 && m->scene_clip[1][1] == 0 && m->cycle == 16, "scenes: the clip table, the scenes and the default cycle of the record are loaded");
          CHECK(r && r->rows == 3 && r->row[0].block[0] == 1 && r->row[0].block[1] == 3 && r->row[1].block[0] == 2 && r->row[1].block[1] == 0 && r->row[2].steps == 32, "scenes: the scheduler sees them as rows"); }
        { struct message m[64]; (void)drain(m, 64); } (void)sim_song_play(); (void)play_log(lb, 256, &nb, 6000, -1, 0);
        unsigned differ = 0; for (unsigned i = 0; i < na && i < nb; ++i) if (memcmp(&la[i], &lb[i], sizeof la[i])) ++differ;
        CHECK(na >= 8 && na == nb && differ == 0, "scenes: the version-3 record plays byte-identical MIDI to the rows, each message in the same block (%u and %u messages, %u differ)", na, nb, differ);
        memset(f, 0, 4096); CHECK(sim_song_record_read(SONG) == 0 && f[20] == 3 && f[64] == 1 && f[1088] == 1 && f[1088 + 12] == 2, "scenes: the stored record is still version 3 (the firmware rewrites nothing)");
        /* what the validator refuses */
        #define REFUSED(what_) do { int r_ = sim_song_record_write(SONG + 1); CHECK(r_ != 0, "scenes: refused: " what_ " (%d)", r_); } while (0)
        HEADER(3, 1, "BAD         "); CLIP(0, 0, 1); SCENE(0, 2, 0, 16); REFUSED("a scene names a place with no clip");
        HEADER(3, 1, "BAD         "); CLIP(0, 0, 1); SCENE(0, 65, 0, 16); REFUSED("a clip place above 64");
        HEADER(3, 1, "BAD         "); CLIP(0, 0, 1); SCENE(0, 1, 0, 0); REFUSED("a scene of 0 steps");
        HEADER(3, 1, "BAD         "); CLIP(0, 0, 1); SCENE(0, 1, 0, 144); REFUSED("a scene of 144 steps");
        HEADER(3, 1, "BAD         "); CLIP(0, 0, 1); SCENE(0, 1, 0, 16); f[43] = 1; REFUSED("a master cycle of 1 step");
        HEADER(3, 1, "BAD         "); CLIP(0, 0, 1); SCENE(0, 1, 0, 16); f[43] = 129; REFUSED("a master cycle of 129 steps");
        HEADER(3, 1, "BAD         "); CLIP(0, 0, 1); SCENE(0, 1, 0, 16); f[1088 + 12 + 8] = 1; REFUSED("a scene beyond the scene count that is not empty");
        HEADER(4, 1, "BAD         "); f[64] = 1; f[64 + 16] = 1; f[64 + 18] = 16; REFUSED("record version 4");
        /* the master cycle: a launch lands on the next multiple of it (12 steps here, a bar of 3/4), not of 16 */
        HEADER(3, 2, "CYCLE 12    "); f[43] = 12;
        CLIP(0, 0, 1); CLIP(1, 0, 3); SCENE(0, 1, 0, 48); f[1088 + 9] = 1;          /* scene 1: T1, loops here */
        SCENE(1, 0, 1, 16);                                                           /* scene 2 holds T2's clip (never reached: launched by hand) */
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0 && song_model_current()->cycle == 12, "scenes: a record with a master cycle of 12 steps loads");
        { struct message m[64]; (void)drain(m, 64); }
        static struct log_entry lc[256]; unsigned nc = 0, blocks = 0; int queued = 0;
        (void)sim_song_play();
        for (; blocks < 2400; ++blocks) {
            if (blocks == 300) queued = sim_song_track(0, 1, 1);                    /* at block 300 (step 7 of the first cycle): launch T2's clip of scene 2 */
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && m[k].data[0] != 0xf8 && nc < 256) { lc[nc].s = m[k].data[0]; lc[nc].d1 = m[k].data[1]; lc[nc].d2 = m[k].data[2]; lc[nc].block = blocks; ++nc; }
        }
        sim_song_stop(); settle();
        { int first = find_log(lc, nc, 0x94, 60, 100, 0), launch = find_log(lc, nc, 0x95, 64, 100, 0);
          /* 12 steps = 12 x 480 units = 516.8 blocks at 120 BPM: queued at block 300, the launch lands at the cycle that begins at step 12 */
          unsigned d = launch >= 0 && first >= 0 ? lc[launch].block - lc[first].block : 0;
          CHECK(queued == 0 && launch > first && d >= 515 && d <= 519, "scenes: with a master cycle of 12 steps a launch queued in the first cycle starts at step 12 (%u blocks after the song's first note; 16 steps would be 689)", d); }
        #undef HEADER
        #undef CLIP
        #undef SCENE
        #undef REFUSED
        sim_midi_drain(0); sim_test_request_passes(0); (void)sim_open(0);
    }

    /* ---- 22. Task 17 Goal 4: launching a clip by its place (song_clip_launch), place rows, taking a queue back ---- */
    {
        sim_boot(1); sim_midi_capture(1); sim_midi_drain(1); sim_test_request_passes(1);
        uint8_t *f = sim_file(); const unsigned SONG = 5;
        uint8_t b[64 + 6]; static uint8_t v3[256]; struct timed_note tn; tn.velocity = 100; tn.retrigger = 1; tn.offset = 0; tn.length = 240;
        /* block 1: 60 on step 0; 2: 62 on step 4; 3: 64 on step 0; 4: a v3 clip of 32 steps with 67 on step 8 */
        for (unsigned id = 1; id <= 4; ++id) {
            unsigned step = id == 2 ? 4 : id == 4 ? 8 : 0, at = 0; memset(b, 0, sizeof b);
            for (unsigned k = 0; k < 64; ++k) { if (k == step) { b[at++] = 1; tn.pitch = (uint8_t)(id == 4 ? 67 : 58 + 2 * id); (void)timed_note_encode(&tn, b + at); at += 6; } else b[at++] = 0; }
            if (id == 4) {
                int n3 = clip_v3_from_v2(b, sizeof b, v3, sizeof v3, NULL);
                if (n3 > 0) v3[0] = 32;
                CHECK(n3 > 0 && clip_v3_validate(v3, (unsigned)n3) == 0 && clip_v3_steps(v3) == 32, "clips: a v3 clip of 32 steps is built (%d bytes)", n3);
                memcpy(f, v3, (unsigned)(n3 > 0 ? n3 : 0)); CHECK(sim_block_write2(SONG, id, 2, (unsigned)(n3 > 0 ? n3 : 0)) == 0, "clips: block 4 (v3) stored");
            } else { memcpy(f, b, sizeof b); CHECK(sim_block_write2(SONG, id, 1, sizeof b) == 0, "clips: block %u stored", id); }
        }
        memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 3; memcpy(f + 24, "CLIP PLACES ", 12); f[40] = 2; f[48] = 5; f[49] = 6;
        memset(f + 2624, 0xff, 4096 - 2624); memset(f + 2624, 0, 8); f[2626] = 1;
        #define CLIP(t_, c_, id_) do { f[64 + (t_) * 128 + (c_) * 2] = (uint8_t)(id_); } while (0)
        CLIP(0, 0, 1); CLIP(0, 1, 2); CLIP(0, 5, 2); CLIP(0, 6, 4); CLIP(1, 0, 3);     /* T1: places 1, 2 in scenes; 6 (block 2 again) and 7 (the v3 clip) in none */
        f[1088] = 1; f[1088 + 8] = 1; f[1088 + 9] = 1; f[1088 + 10] = 16;               /* scene 1: T1 place 1, loops here */
        f[1100] = 2; f[1101] = 1; f[1100 + 8] = 1; f[1100 + 10] = 16;                   /* scene 2: T1 place 2, T2 place 1 */
        #undef CLIP
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0, "clips: the song stored and loaded");
        CHECK(song_clip_launch(0, 1) == 0 && ((sim_song_track_status(0) >> 2) & 3U) == 1 && song_track_unqueue(0) == 0 && song_track_unqueue(0) == SONG_EMPTY && ((sim_song_track_status(0) >> 2) & 3U) == 0, "clips: while the song is stopped a launch reserves the clip, and it can be taken back");
        CHECK(song_row_place(0, 0) == 0 && song_row_place(0, 1) == 1 && song_row_place(1, 0) == SONG_NONE && song_row_place(0, SONG_ROWS + 6) == 6 && song_row_place(0, SONG_NONE) == SONG_NONE,
              "clips: the place behind a row: scene 1 T1 place 1, scene 2 T1 place 2, T2 silent in scene 1, a place row its place");
        { struct message m[64]; (void)drain(m, 64); }
        static struct log_entry lc[512]; unsigned nc = 0, blocks = 0; int r1 = -9, r2 = -9, r3 = -9, r4 = -9, u1 = -9, u2 = -9, e1 = -9, e2 = -9, e3 = -9;
        unsigned row800 = 0, row2000 = 0, row5600 = 0, row7500 = 0, queue6700 = 0;
        (void)sim_song_play();
        for (; blocks < 7600; ++blocks) {
            if (blocks == 100) r1 = song_clip_launch(0, 1);                         /* a clip scene 2 uses: launched as that scene's pattern */
            if (blocks == 800) { row800 = (sim_song_track_status(0) >> 8) & 255U; r2 = song_clip_launch(0, 5); }   /* a clip no scene uses: a place row */
            if (blocks == 2000) row2000 = (sim_song_track_status(0) >> 8) & 255U;
            if (blocks == 4400) r3 = song_clip_launch(0, 6);                         /* the v3 clip of 32 steps */
            if (blocks == 5600) { row5600 = (sim_song_track_status(0) >> 8) & 255U; e1 = song_clip_launch(0, 9); e2 = song_clip_launch(0, 64); e3 = song_clip_launch(8, 0); }
            if (blocks == 6600) r4 = song_clip_launch(0, 0);
            if (blocks == 6700) { queue6700 = (sim_song_track_status(0) >> 2) & 3U; u1 = song_track_unqueue(0); u2 = song_track_unqueue(0); }
            if (blocks == 7500) row7500 = (sim_song_track_status(0) >> 8) & 255U;
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && m[k].data[0] != 0xf8 && nc < 512) { lc[nc].s = m[k].data[0]; lc[nc].d1 = m[k].data[1]; lc[nc].d2 = m[k].data[2]; lc[nc].block = blocks; ++nc; }
        }
        sim_song_stop(); settle();
        { int first = find_log(lc, nc, 0x94, 60, 100, 0); unsigned o = first >= 0 ? lc[first].block : 0;
          /* 16 steps = 689.06 blocks at 120 BPM; a step = 43.07 blocks */
          int a = find_log(lc, nc, 0x94, 62, 100, 0);
          unsigned da = a >= 0 ? lc[a].block - o : 0;
          CHECK(r1 == 0 && row800 == 1 && da >= 859 && da <= 863, "clips: the clip of place 2 is launched as scene 2's pattern (row %u) on the next cycle (its note %u blocks after the song's first; 861)", row800, da);
          /* the place row: queued at 800, lands at cycle 2 (1378): 62 on step 4 at 1550, then every 64 steps (2756 blocks) */
          int p = -1, q = -1; for (unsigned i = 0; i < nc; ++i) if (lc[i].s == 0x94 && lc[i].d1 == 62 && lc[i].d2 && lc[i].block - o > 1400) { if (p < 0) p = (int)i; else if (q < 0) q = (int)i; }
          unsigned dp = p >= 0 ? lc[p].block - o : 0, dq = q >= 0 ? lc[q].block - o : 0;
          /* tabby-v04.10: block 2 is also scene 2's clip (16 steps): a v2 block has the steps of the first scene that uses it, in every place */
          CHECK(r2 == 0 && row2000 == SONG_ROWS + 5 && dp >= 1548 && dp <= 1552 && dq >= 2237 && dq <= 2241, "clips: a place no scene uses plays as a place row (row %u) with its block's 16 steps from the next cycle (%u and %u; 1550 and 2239)", row2000, dp, dq);
          /* the v3 place row: queued at 4400, lands at cycle 7 (4823): 67 on step 8 at 5168, then every 32 steps (1378 blocks) */
          int g = find_log(lc, nc, 0x94, 67, 100, 0), h = g >= 0 ? find_log(lc, nc, 0x94, 67, 100, g + 1) : -1;
          unsigned dg = g >= 0 ? lc[g].block - o : 0, dh = h >= 0 ? lc[h].block - o : 0;
          CHECK(r3 == 0 && row5600 == SONG_ROWS + 6 && dg >= 5166 && dg <= 5170 && dh >= 6544 && dh <= 6548, "clips: a v3 clip in no scene plays with its own length of 32 steps (row %u; %u and %u; 5168 and 6546)", row5600, dg, dh);
          CHECK(e1 == SONG_EMPTY && e2 == SONG_INVALID && e3 == SONG_INVALID, "clips: an empty place, a place above 64 and a track above 8 are refused (%d %d %d)", e1, e2, e3);
          CHECK(r4 == 0 && queue6700 == 1 && u1 == 0 && u2 == SONG_EMPTY && row7500 == SONG_ROWS + 6, "clips: a queued launch is taken back before it lands (%d %u %d %d, row %u)", r4, queue6700, u1, u2, row7500);
          unsigned late60 = 0; for (unsigned i = 0; i < nc; ++i) if (lc[i].s == 0x94 && lc[i].d1 == 60 && lc[i].d2 && lc[i].block - o > 700) ++late60;
          CHECK(late60 == 0 && stuck(lc, nc) == 0, "clips: the clip taken back never played; nothing stuck (%u, %d)", late60, stuck(lc, nc)); }
        sim_midi_drain(0); sim_test_request_passes(0); (void)sim_open(0);
    }

    /* ---- 23. Goal 6: the clip editor (song_edit_*): a grid block opened as an event list, edits, four undo levels,
     *          the save, one unsaved clip at a time, a block two tracks share ---- */
    {
        sim_boot(1); sim_midi_capture(1); sim_midi_drain(1); sim_test_request_passes(1);
        uint8_t *f = sim_file(); const unsigned SONG = 6;
        uint8_t b[64 + 12]; struct timed_note tn; tn.velocity = 90; tn.retrigger = 1; tn.offset = 0; tn.length = 240;
        { unsigned at = 0; memset(b, 0, sizeof b);                     /* block 1: 60 on step 0 (probability 3), 62 on step 4 with offset +100 */
          for (unsigned k = 0; k < 64; ++k) {
              if (k == 0) { b[at++] = 1 | 3 << 3; tn.pitch = 60; tn.offset = 0; (void)timed_note_encode(&tn, b + at); at += 6; }
              else if (k == 4) { b[at++] = 1; tn.pitch = 62; tn.offset = 100; (void)timed_note_encode(&tn, b + at); at += 6; }
              else b[at++] = 0; }
          memcpy(f, b, at); CHECK(sim_block_write2(SONG, 1, 1, at) == 0, "editor: block 1 (a grid block) stored"); }
        memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 3; memcpy(f + 24, "EDITOR      ", 12); f[40] = 1; f[48] = 5; f[49] = 6;
        memset(f + 2624, 0xff, 4096 - 2624); memset(f + 2624, 0, 8); f[2626] = 1;
        f[64] = 1; f[64 + 2] = 1;                                       /* T1 places 1 and 2: block 1 (one track, two places) */
        f[64 + 128 + 2] = 1;                                            /* T2 place 2: block 1 too: shared between tracks */
        f[1088] = 1; f[1088 + 8] = 1; f[1088 + 10] = 32;                /* scene 1: T1 place 1, 32 steps */
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0, "editor: the song stored and loaded");
        CHECK(song_edit_open(0, 0) == SONG_EDIT_SHARED && song_edit_open(0, 9) == SONG_EMPTY && song_edit_clip() == NULL, "editor: a block another track uses is refused; an empty place is refused");
        f[64 + 128 + 2] = 0;
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0 && song_edit_open(0, 0) == 0, "editor: without the other track it opens");
        struct song_edit_info ei; song_edit_info(&ei); const uint8_t *c = song_edit_clip();
        struct clip_v3_event e0, e1, e2;
        clip_v3_event(c, 0, &e0); clip_v3_event(c, 1, &e1); clip_v3_event(c, 2, &e2);
        CHECK(ei.active && ei.steps == 32 && ei.events == 3 && !ei.dirty && clip_v3_validate(c, clip_v3_bytes(c)) == 0 &&
              e0.kind == CLIP_V3_STEPMOD && e0.a == 3 && e1.kind == CLIP_V3_NOTE && e1.a == 60 && e1.time == 0 && e2.a == 62 && e2.time == 4 * 480 + 100 && e2.length == 240 && e2.b == 90,
              "editor: the grid block as an event list: the step's probability, then its notes with their offsets; the scene's 32 steps (%u steps, %u events)", ei.steps, ei.events);
        CHECK(song_edit_note_toggle(32, 60, 100, 480) == SONG_INVALID && song_edit_note_toggle(8, 64, 100, 480) == 1 && song_edit_note_toggle(8, 64, 100, 480) == 0 && song_edit_note_toggle(8, 65, 0, 0) == 1,
              "editor: a step past the playing length is refused; a note goes on, comes off, another goes on (velocity and length at least 1)");
        for (unsigned k = 0; k < 6; ++k) (void)song_edit_note_toggle(10 + k, 70, 100, 480);
        song_edit_info(&ei);
        CHECK(ei.undo == 4 && ei.redo == 0 && ei.events == 10 && ei.dirty, "editor: nine changes leave four undo levels (%u) and %u events", ei.undo, ei.events);
        unsigned undone = 0; while (song_edit_undo() == 0) ++undone;
        song_edit_info(&ei);
        CHECK(undone == 4 && ei.events == 6 && ei.redo == 4 && song_edit_redo() == 0 && song_edit_redo() == 0, "editor: four undos and no fifth; redo works (%u undone, %u events)", undone, ei.events);
        (void)song_edit_note_toggle(20, 72, 100, 480);
        song_edit_info(&ei);
        CHECK(ei.redo == 0 && ei.events == 9, "editor: a new change drops the redo levels (%u events)", ei.events);
        CHECK(song_edit_note_adjust(4, 0, 0, 200) == 0 && song_edit_note_adjust(4, 0, 1, -1000) == 0 && song_edit_note_adjust(4, 0, 2, -5000) == 0 && song_edit_note_adjust(4, 3, 0, 1) == SONG_EMPTY, "editor: velocity, start and length are adjusted and clamped; a note that is not there is refused");
        { int at = clip_v3_note_find(song_edit_clip(), 4, 62); struct clip_v3_event v; clip_v3_event(song_edit_clip(), at < 0 ? 0 : (unsigned)at, &v);
          CHECK(at >= 0 && v.b == 127 && v.time == 4 * 480 - 239 && v.length == 1 && clip_v3_validate(song_edit_clip(), clip_v3_bytes(song_edit_clip())) == 0, "editor: clamped to velocity 127, half a step early (still step 5), length 1; the clip is valid (%d %u %d %u)", at, v.b, (int)v.time, v.length); }
        CHECK(song_edit_note_adjust(0, 0, 3, 9) == 0 && (clip_v3_step_mod(song_edit_clip(), 0) & 7U) == 7 && song_edit_note_adjust(0, 0, 3, -9) == 0 && clip_v3_step_mod(song_edit_clip(), 0) == 0, "editor: a step's probability is raised to 7 and taken off");
        CHECK(song_edit_step_clear(4) == 0 && song_edit_step_clear(4) == SONG_EMPTY, "editor: a step is cleared; an empty step says so");
        CHECK(song_edit_open(0, 1) == 0, "editor: the same block in another place of the track is the same clip");
        /* the unsaved edit is what the song plays; a save is refused while it plays */
        { struct message m[64]; (void)drain(m, 64); }
        static struct log_entry le[128]; unsigned ne = 0;
        (void)sim_song_play();
        for (unsigned blocks = 0; blocks < 1200; ++blocks) {
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && (m[k].data[0] & 0xf0) == 0x90 && m[k].data[2] && ne < 128) { le[ne].s = m[k].data[0]; le[ne].d1 = m[k].data[1]; le[ne].d2 = m[k].data[2]; le[ne].block = blocks; ++ne; }
        }
        int busy = song_edit_save();
        sim_song_stop(); settle(); settle();
        CHECK(find_log(le, ne, 0x94, 60, 90, 0) >= 0 && find_log(le, ne, 0x94, 65, 1, 0) >= 0 && find_log(le, ne, 0x94, 72, 100, 0) >= 0 && find_log(le, ne, 0x94, 62, 90, 0) < 0 && find_log(le, ne, 0x94, 62, 127, 0) < 0,
              "editor: the song plays the unsaved clip: the old note, the entered ones, not the cleared one (%u note-ons)", ne);
        CHECK(busy == SONG_BUSY, "editor: a save while the song plays is refused (%d)", busy);
        int saved = song_edit_save(); song_edit_info(&ei);
        CHECK(saved == 0 && !ei.dirty, "editor: stopped, the clip is saved (%d)", saved);
        { int n = sim_block_read(SONG, 1);
          CHECK(n == 16 + 6 * (int)ei.events && f[0] == 32 && clip_v3_validate(f, (unsigned)n) == 0, "editor: storage holds it as a v3 clip of %u events (%d bytes)", ei.events, n); }
        CHECK(song_edit_open(0, 0) == 0 && song_edit_note_toggle(0, 61, 100, 480) == 1, "editor: open and changed again");
        song_edit_discard(); song_edit_info(&ei);
        CHECK(!ei.active && song_edit_open(0, 0) == 0 && clip_v3_note_find(song_edit_clip(), 0, 61) < 0 && clip_v3_note_find(song_edit_clip(), 8, 65) >= 0, "editor: a discard gives the stored clip back");
        song_edit_discard();
        sim_midi_drain(0); sim_test_request_passes(0); (void)sim_open(0);
    }

    /* ---- 24. Goal 6: recording at the event cap (SPEC 14.2): events plus held notes below the cap; at the cap the
     *          take stops, held notes are written into their reserved places, nothing in the clip is lost ---- */
    {
        sim_boot(1); sim_midi_capture(1); sim_midi_drain(1); sim_test_request_passes(1);
        uint8_t *f = sim_file(); const unsigned SONG = 7;
        uint8_t b[64]; memset(b, 0, sizeof b);
        memcpy(f, b, sizeof b); CHECK(sim_block_write2(SONG, 1, 1, sizeof b) == 0, "record: an empty block stored");
        memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 3; memcpy(f + 24, "RECORD CAP  ", 12); f[40] = 1; f[48] = 1;
        memset(f + 2624, 0xff, 4096 - 2624); memset(f + 2624, 0, 8); f[2626] = 1;
        f[64] = 1; f[1088] = 1; f[1088 + 8] = 1; f[1088 + 9] = 1; f[1088 + 10] = 64;   /* T1 place 1, one scene of 64 steps, loops */
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0 && song_edit_open(0, 0) == 0, "record: the song loaded, the clip open");
        unsigned made = 0;
        for (unsigned s2 = 0; s2 < 64 && made < 509; ++s2) for (unsigned k = 0; k < 8 && made < 509; ++k) if (song_edit_note_toggle(s2, 30 + k, 100, 240) == 1) ++made;
        struct song_edit_info ei; song_edit_info(&ei);
        CHECK(made == 509 && ei.events == 509, "record: the clip holds 509 events");
        CHECK(song_record_start() == 1, "record: armed while stopped (the clip is reserved)");
        (void)sim_song_play();
        for (unsigned i = 0; i < 40; ++i) (void)sim_render();
        song_edit_info(&ei);
        CHECK(ei.recording == 2, "record: PLAY starts the take (%u)", ei.recording);
        unsigned ch = groove_midi_input_channel(0);
        /* three keys go down and stay down: 509 + 3 held = 512, the cap; a fourth note-on must stop the take */
        for (unsigned k = 0; k < 3; ++k) { song_record_in(1, 0x90 | ch, 90 + k, 100); for (unsigned i = 0; i < 8; ++i) (void)sim_render(); }
        song_edit_info(&ei);
        CHECK(ei.recording == 2 && ei.events == 509 && song_record_full() == 0, "record: three held notes are accepted: their places are reserved, the take runs");
        song_record_in(1, 0xb0 | ch, 74, 50); for (unsigned i = 0; i < 8; ++i) (void)sim_render();
        song_edit_info(&ei);
        unsigned full = song_record_full();
        (void)full;   /* the screen's control pass has read the flag by now and shows CLIP FULL - 512 EVENTS - REC STOPPED */
        CHECK(ei.recording == 0 && ei.events == 512 && clip_v3_validate(song_edit_clip(), clip_v3_bytes(song_edit_clip())) == 0,
              "record: the next event meets the cap: the take stops, the three held notes are written, the clip holds 512 valid events (%u, full %u, %u events)", ei.recording, full, ei.events);
        CHECK(clip_v3_note_find(song_edit_clip(), 0, 90) >= 0 || clip_v3_note_find(song_edit_clip(), 1, 90) >= 0 || clip_v3_note_find(song_edit_clip(), 2, 90) >= 0, "record: a held note is in the clip");
        { unsigned cc = 0; for (unsigned i = 0; i < clip_v3_count(song_edit_clip()); ++i) { struct clip_v3_event e; clip_v3_event(song_edit_clip(), i, &e); if (e.kind == CLIP_V3_CC) ++cc; }
          CHECK(cc == 0 && clip_v3_note_find(song_edit_clip(), 0, 30) >= 0, "record: the event that met the cap is not in the clip; what was there is still there"); }
        song_record_in(1, 0x90 | ch, 99, 100); for (unsigned i = 0; i < 8; ++i) (void)sim_render();
        song_edit_info(&ei);
        CHECK(ei.events == 512 && ei.undo >= 1, "record: after the stop nothing more is taken; undo holds the clip before the take (%u levels)", ei.undo);
        CHECK(song_edit_undo() == 0, "record: undo");
        song_edit_info(&ei);
        CHECK(ei.events == 509, "record: the clip before the take (%u events)", ei.events);
        CHECK(song_edit_note_toggle(63, 127, 100, 240) == 1 && song_edit_note_toggle(63, 126, 100, 240) == 1 && song_edit_note_toggle(63, 125, 100, 240) == 1 && song_edit_note_toggle(63, 124, 100, 240) == SONG_FULL,
              "record: step entry into a full clip is refused (CLIP FULL) and changes nothing");
        sim_song_stop(); settle(); song_edit_discard();
        sim_midi_drain(0); sim_test_request_passes(0); (void)sim_open(0);
    }

    /* ---- 25. The flash part page (command 25 request 11, app/diag.c v0.8, docs/FLASH-CHIP.md 4): it reports the
     *          JEDEC ID and size it is given and nothing depends on them: with any ID, the known chips, an unknown
     *          one, none at all, the same block is stored and read back ---- */
    {
        static const uint32_t ids[] = {0, 0x856014U, 0xB36014U, 0xEB6014U, 0x123456U, 0xFFFFFFU};
        static const uint32_t sizes[] = {0, 1048576U, 1048576U, 1048576U, 65536U, 0xFFFFFFFFU};
        uint8_t r[96];
        for (unsigned i = 0; i < sizeof ids / sizeof ids[0]; ++i) {
            ct_test_flash_jedec = ids[i]; ct_test_flash_bytes = sizes[i];
            sim_boot(1); sim_midi_capture(1); sim_midi_drain(0); settle();
            rc_source = 1; rc_n = 0;
            int k = rcmd(25, (const uint8_t[]){11}, 1, r);
            rc_source = 0; sim_midi_capture(0);
            uint32_t id = r[1] | r[2] << 8 | (uint32_t)r[3] << 16 | (uint32_t)r[4] << 24;
            uint32_t bytes = r[5] | r[6] << 8 | (uint32_t)r[7] << 16 | (uint32_t)r[8] << 24;
            uint32_t user = r[9] | r[10] << 8 | (uint32_t)r[11] << 16 | (uint32_t)r[12] << 24;
            uint32_t source = r[13] | r[14] << 8 | (uint32_t)r[15] << 16 | (uint32_t)r[16] << 24;
            CHECK(k == 17 && r[0] == 0 && id == ids[i] && bytes == sizes[i] && user == CT_USER_BYTES && source == 0,
                  "flash part: request 11 reports ID 0x%06x, %u bytes, USER %u, source %u as given (%d bytes)", (unsigned)id, (unsigned)bytes, (unsigned)user, (unsigned)source, k);
            uint8_t *f = sim_file(); memset(f, 0, 67); f[0] = 1; f[1] = (uint8_t)(60 + i); f[2] = 100; f[3] = 1;   /* one note (section 7's form) */
            CHECK(sim_block_write(0, 1, 67) == 0 && sim_block_read(0, 1) > 0 && f[0] == 1 && f[1] == (uint8_t)(60 + i),
                  "flash part: with ID 0x%06x a block is stored and read back: nothing depends on the ID", (unsigned)ids[i]);
        }
        ct_test_flash_jedec = 0; ct_test_flash_bytes = 0;
        sim_boot(1); settle();
    }

    /* ---- 26. tabby-v04.10: clips loop at their own length; a clip made on the device; the song saved as a version-3
     *          record; clip chains; the scene hold ---- */
    {
        sim_boot(1); sim_midi_capture(1); sim_midi_drain(1); sim_test_request_passes(1);
        uint8_t *f = sim_file(); const unsigned SONG = 8;
        static uint8_t c3[CLIP_V3_BYTES_MAX];
        /* v3 clips of track 1: id 1: 16 steps, 60 on step 0; id 2: 32 steps, 62 on step 20; id 3: 16 steps, 64 on step 0,
         * chain: twice, then the clip of place 4; id 4: 16 steps, 65 on step 0, chain: after 8 steps, stop */
        static const struct { uint8_t steps, pitch, step, next, after, times; } spec[4] = {{16, 60, 0, 0, 0, 1}, {32, 62, 20, 0, 0, 1}, {16, 64, 0, CLIP_V3_NEXT_CLIP + 3, 0, 2}, {16, 65, 0, CLIP_V3_NEXT_STOP, 8, 1}};
        for (unsigned id = 1; id <= 4; ++id) {
            clip_v3_empty(c3, spec[id - 1].steps);
            struct clip_v3_event v = { (int32_t)spec[id - 1].step * 480, CLIP_V3_NOTE, spec[id - 1].pitch, 100, 1, 240 };
            int ins = clip_v3_insert(c3, &v), ch = clip_v3_chain_set(c3, spec[id - 1].next, spec[id - 1].after, spec[id - 1].times);
            unsigned n = clip_v3_bytes(c3);
            memcpy(f, c3, n);
            CHECK(ins >= 0 && ch == 0 && clip_v3_validate(c3, n) == 0 && sim_block_write2(SONG, id, 2, n) == 0, "own length: v3 clip %u stored", id);
        }
        memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 3; memcpy(f + 24, "OWN LENGTH  ", 12); f[40] = 3; f[48] = 5; f[49] = 6;
        memset(f + 2624, 0xff, 4096 - 2624); memset(f + 2624, 0, 8); f[2626] = 1;
        f[64] = 1; f[66] = 2; f[68] = 3; f[70] = 4;                         /* T1 places 1..4: clips 1..4 */
        f[1088] = 1; f[1088 + 8] = 1; f[1088 + 10] = 64;                    /* scene 1: clip 1 (16 steps) in a scene of 64 steps */
        f[1100] = 2; f[1100 + 8] = 3; f[1100 + 10] = 16;                    /* scene 2: clip 2 (32 steps) in a scene of 16 steps x 3 */
        f[1112] = 1; f[1112 + 8] = 1; f[1112 + 9] = 1; f[1112 + 10] = 16;   /* scene 3: clip 1, loops here */
        CHECK(sim_song_record_write(SONG) == 0 && sim_song_load(SONG) == 0, "own length: the song stored and loaded");
        { struct message m[64]; (void)drain(m, 64); }
        static struct log_entry lo[512]; unsigned no = 0;
        (void)sim_song_play();
        for (unsigned blocks = 0; blocks < 5600; ++blocks) {
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && (m[k].data[0] & 0xf0) == 0x90 && m[k].data[2] && no < 512) { lo[no].s = m[k].data[0]; lo[no].d1 = m[k].data[1]; lo[no].d2 = m[k].data[2]; lo[no].block = blocks; ++no; }
        }
        { /* scene 1 (64 steps = 2756 blocks): the 16-step clip sounds four times, 689 blocks apart. Scene 2 (48 steps from
           * step 64): the 32-step clip plays through: its note on step 20 at step 84 (3618 blocks), then the clip begins
           * again at step 96 and the scene ends at step 112 before the note comes round. Scene 3 from step 112 (4823). */
          unsigned n60 = 0, ok60 = 1, first = 0, n62 = 0, at62 = 0;
          for (unsigned i = 0; i < no; ++i) {
              if (lo[i].d1 == 60 && lo[i].block < 2700) { if (!n60) first = lo[i].block; else if (lo[i].block - first < n60 * 689 - 2 || lo[i].block - first > n60 * 689 + 2) ok60 = 0; ++n60; }
              if (lo[i].d1 == 62) { ++n62; at62 = lo[i].block - first; }
          }
          int s3 = -1; for (unsigned i = 0; i < no; ++i) if (lo[i].d1 == 60 && lo[i].block - first > 4000 && s3 < 0) s3 = (int)(lo[i].block - first);
          CHECK(n60 == 4 && ok60, "own length: a 16-step clip in a scene of 64 steps loops four times, a bar apart (%u times)", n60);
          CHECK(n62 == 1 && at62 >= 3616 && at62 <= 3620, "own length: a 32-step clip in a scene of 16 steps x 3 plays through: its step-21 note once, at step 84 (%u times, block %u; 3618)", n62, at62);
          CHECK(s3 >= 4821 && s3 <= 4825, "own length: the next scene starts where the scene's steps x repeats end (block %d; 4823)", s3); }
        /* the scene hold: scene 3 would loop anyway; hold scene 1 instead and see it repeat past its 64 steps, then go on */
        sim_song_stop(); settle();
        { struct message m[64]; (void)drain(m, 64); }
        no = 0; song_scene_hold_set(1);
        (void)sim_song_play();
        unsigned row_held = 0, row_after = 0;
        for (unsigned blocks = 0; blocks < 6200; ++blocks) {
            if (blocks == 3000) { row_held = sim_song_status(0) >> 16 & 255U; song_scene_hold_set(0); }
            if (blocks == 6000) row_after = sim_song_status(0) >> 16 & 255U;
            (void)sim_render();
            struct message m[64]; (void)drain(m, 64);
        }
        CHECK(row_held == 0 && row_after == 1 && song_scene_hold() == 0, "hold: with the hold on, scene 1 repeats past its length (scene %u at block 3000); taken off, the song goes on at the scene's next end (scene %u at 6000)", row_held + 1, row_after + 1);
        sim_song_stop(); settle();
        /* clip chains: launch clip 3 (twice, then clip 4; clip 4: after 8 steps, stop) */
        { struct message m[64]; (void)drain(m, 64); }
        no = 0;
        CHECK(song_clip_launch(0, 2) == 0, "chain: clip 3 reserved while stopped");
        (void)sim_song_play();
        unsigned st1800 = 0, row1000 = 0, row1500 = 0;
        for (unsigned blocks = 0; blocks < 2600; ++blocks) {
            if (blocks == 1000) row1000 = (sim_song_track_status(0) >> 8) & 255U;
            if (blocks == 1500) row1500 = (sim_song_track_status(0) >> 8) & 255U;
            if (blocks == 1800) st1800 = sim_song_track_status(0) & 3U;
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && (m[k].data[0] & 0xf0) == 0x90 && m[k].data[2] && no < 512) { lo[no].s = m[k].data[0]; lo[no].d1 = m[k].data[1]; lo[no].d2 = m[k].data[2]; lo[no].block = blocks; ++no; }
        }
        sim_song_stop(); settle();
        { unsigned n64 = 0, n65 = 0, first = 0, at65 = 0, other = 0;
          for (unsigned i = 0; i < no; ++i) { if (lo[i].d1 == 64) { if (!n64) first = lo[i].block; ++n64; } else if (lo[i].d1 == 65) { ++n65; at65 = lo[i].block - first; } else ++other; }
          CHECK(n64 == 2 && n65 == 1 && at65 >= 1376 && at65 <= 1380 && other == 0, "chain: clip 3 plays twice, then clip 4 starts at step 32 (%u, %u, block %u; 1378; %u other notes)", n64, n65, at65, other);
          CHECK(row1000 == SONG_ROWS + 2 && row1500 == SONG_ROWS + 3 && st1800 == SONG_TRACK_STOPPED, "chain: the track is on clip 3, then on clip 4, and stopped 8 steps into clip 4 (rows %u, %u, state %u)", row1000, row1500, st1800); }
        /* a clip made on the device, and the song saved */
        int made = song_clip_new(0, 9), again = SONG_BUSY /* until tabby-v1.3 a second new clip was refused here; the test of several unsaved clips is below */, taken = song_clip_new(0, 0);
        struct song_edit_info ei; song_edit_info(&ei);
        CHECK(made == 0 && again == SONG_BUSY && taken == SONG_INVALID && ei.active && ei.created && ei.dirty && ei.steps == 16 && ei.place == 9 && ei.block == 5 && song_unsaved(),
              "new clip: an empty clip of one master cycle in place 10, block id 5, open and unsaved; a place that holds a clip is refused (%d %d %d)", made, again, taken);
        CHECK(song_edit_note_toggle(0, 72, 100, 240) == 1 && song_clip_launch(0, 9) == 0, "new clip: a note entered, the clip reserved");
        { struct message m[64]; (void)drain(m, 64); }
        no = 0; (void)sim_song_play();
        for (unsigned blocks = 0; blocks < 1500; ++blocks) {
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && (m[k].data[0] & 0xf0) == 0x90 && m[k].data[2] && no < 512) { lo[no].s = m[k].data[0]; lo[no].d1 = m[k].data[1]; lo[no].d2 = m[k].data[2]; lo[no].block = blocks; ++no; }
        }
        int busy = song_edit_save();
        sim_song_stop(); settle(); settle();
        { unsigned n72 = 0; for (unsigned i = 0; i < no; ++i) if (lo[i].d1 == 72) ++n72;
          CHECK(n72 >= 2 && busy == SONG_BUSY, "new clip: it plays before it is saved (%u times in 2 bars); a save while playing is refused", n72); }
        int saved = song_edit_save();
        CHECK(saved == 0 && !song_unsaved(), "new clip: stopped, the clip and the song are saved (%d)", saved);
        CHECK(sim_song_load(SONG) == 0 && song_model_current()->clip[0][9] == 5 && song_model_current()->clips[0] == 10 && song_current()->rows == 3 && song_current()->row[1].repeat == 3, "new clip: loaded again, the clip table has it in place 10 and the scenes are as they were");
        { int n = sim_block_read(SONG, 5); CHECK(n == 22 && f[0] == 16 && clip_v3_validate(f, 22) == 0, "new clip: its block is stored as a v3 clip of 16 steps with the note (%d bytes)", n); }
        memset(f, 0, 4096); CHECK(sim_song_record_read(SONG) == 0 && f[20] == 3 && f[64 + 18] == 5 && f[1088] == 1 && f[1100 + 8] == 3, "new clip: the stored record is version 3 with the new clip in the table");
        /* discarding a new clip takes it out of the song again */
        CHECK(song_clip_new(0, 11) == 0 && song_model_current()->clip[0][11] == 6, "new clip: another one in place 12");
        song_edit_discard();
        CHECK(song_model_current()->clip[0][11] == 0 && song_model_current()->clips[0] == 10 && song_clip_launch(0, 11) == SONG_EMPTY, "new clip: discarded, its place is empty again");
        (void)song_edit_save();
        /* a song stored as rows (version 1) becomes a version-3 record when it is changed on the device, and plays the same */
        { uint8_t b[64 + 6]; struct timed_note tn; tn.velocity = 100; tn.retrigger = 1; tn.offset = 0; tn.length = 240; tn.pitch = 60;
          unsigned at = 0; memset(b, 0, sizeof b);
          for (unsigned k = 0; k < 64; ++k) { if (k == 0) { b[at++] = 1; (void)timed_note_encode(&tn, b + at); at += 6; } else b[at++] = 0; }
          memcpy(f, b, sizeof b); CHECK(sim_block_write2(SONG + 1, 1, 1, sizeof b) == 0, "rows to scenes: a grid block stored"); }
        memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 1; memcpy(f + 24, "AS ROWS     ", 12); f[40] = 2; f[48] = 5;
        f[64] = 1; f[64 + 16] = 2; f[64 + 18] = 16; f[84] = 1; f[84 + 16] = 1; f[84 + 18] = 32;
        CHECK(sim_song_record_write(SONG + 1) == 0 && sim_song_load(SONG + 1) == 0 && song_clip_new(1, 0) == 0, "rows to scenes: a version-1 song loaded; a new clip on track 2");
        int s1 = song_edit_save();
        memset(f, 0, 4096);
        CHECK(s1 == 0 && sim_song_record_read(SONG + 1) == 0 && f[20] == 3 && f[64] == 1 && f[64 + 128] == 2 && f[1088] == 1 && f[1088 + 8] == 2 && f[1088 + 10] == 16 && f[1100] == 1 && f[1100 + 10] == 32 && f[2626] == 1,
              "rows to scenes: saved as a version-3 record: the clip table, the two scenes with their repeats and steps, an empty event table (%d)", s1);
        CHECK(sim_song_load(SONG + 1) == 0 && song_current()->rows == 2 && song_current()->row[0].block[0] == 1 && song_current()->row[1].steps == 32, "rows to scenes: it loads again as the same rows");
        /* ---- the clip's length, a copy, the click, the count-in, a stored scene ---- */
        CHECK(sim_song_load(SONG) == 0 && song_edit_open(0, 0) == 0, "workflow: the song loaded again, clip 1 open");
        int l1 = song_edit_length(16); song_edit_info(&ei);
        CHECK(l1 == 0 && ei.steps == 32 && ei.dirty && song_edit_note_toggle(20, 61, 100, 240) == 1, "length: 16 to 32 steps removes nothing; a note goes on step 21");
        int l2 = song_edit_length(-16); song_edit_info(&ei);
        CHECK(l2 == 1 && ei.steps == 16 && ei.events == 1 && song_edit_length(-200) == 0 && clip_v3_steps(song_edit_clip()) == 1 && song_edit_length(500) == 0 && clip_v3_steps(song_edit_clip()) == 128,
              "length: back to 16 steps removes the note past the end (%d); the length is held between 1 and 128", l2);
        CHECK(song_edit_undo() == 0 && clip_v3_steps(song_edit_clip()) == 32 && clip_v3_note_find(song_edit_clip(), 20, 61) >= 0, "length: one undo brings the 32 steps and the note back");
        CHECK(song_edit_save() == 0, "length: saved");
        /* tabby-v04.11: the chain's settings from the panel */
        CHECK(song_edit_open(0, 0) == 0 && song_edit_chain(0, 1) == 0 && clip_v3_next(song_edit_clip()) == CLIP_V3_NEXT_STOP && song_edit_chain(0, 2) == 0 && clip_v3_next(song_edit_clip()) == CLIP_V3_NEXT_CLIP + 1,
              "chain setting: NEXT steps through STAY, STOP and the places that hold a clip (%u)", clip_v3_next(song_edit_clip()));
        CHECK(song_edit_chain(0, 50) == 0 && clip_v3_next(song_edit_clip()) == CLIP_V3_NEXT_CLIP + 9 && song_edit_chain(1, 600) == 0 && clip_v3_after(song_edit_clip()) == 512 && song_edit_chain(2, 100) == 0 && clip_v3_times(song_edit_clip()) == 64 && clip_v3_validate(song_edit_clip(), clip_v3_bytes(song_edit_clip())) == 0,
              "chain setting: NEXT ends at the last place with a clip (place 10); AFTER holds at 512 steps, TIMES at 64 (%u)", clip_v3_next(song_edit_clip()));
        { unsigned undone = 0; while (song_edit_undo() == 0) ++undone;
          CHECK(undone >= 3 && undone <= 4 && clip_v3_next(song_edit_clip()) == 0 && clip_v3_after(song_edit_clip()) == 0 && clip_v3_times(song_edit_clip()) == 1, "chain setting: one undo level per setting: the undos give the clip without a chain (%u; one more level is the length test's)", undone); }
        song_edit_discard();
        int c1 = song_clip_copy(0, 0, 1), c2 = song_clip_copy(0, 30, 20), cp3 = song_clip_copy(0, 0, 20); song_edit_info(&ei);
        CHECK(c1 == SONG_INVALID && c2 == SONG_EMPTY && cp3 == 0 && ei.active && ei.created && ei.place == 20 && ei.steps == 32 && ei.events == 2 && ei.block == 6,
              "copy: a place that holds a clip and an empty source are refused; the copy is a new clip (block 6) in place 21, open and unsaved; no second copy before a save (%d %d %d)", c1, c2, cp3);
        CHECK(song_edit_save() == 0 && sim_song_load(SONG) == 0 && song_model_current()->clip[0][20] == 6 && sim_block_read(SONG, 6) == 16 + 12 && f[0] == 32, "copy: saved and loaded again: place 21 holds a 32-step clip with both notes");
        /* tabby-v1.4: a control of the panel that wiggles at rest is not recorded (song_record_in drops it) */
        { unsigned song_test_rest_wiggle(unsigned status, unsigned a, unsigned b);
          unsigned f = song_test_rest_wiggle(0xb0, 1, 0), w1 = song_test_rest_wiggle(0xb0, 1, 1), w0 = song_test_rest_wiggle(0xb0, 1, 0), w1b = song_test_rest_wiggle(0xb0, 1, 1);
          unsigned m2 = song_test_rest_wiggle(0xb0, 1, 2), m3 = song_test_rest_wiggle(0xb0, 1, 3), m2b = song_test_rest_wiggle(0xb0, 1, 2);
          CHECK(!f && w1 && w0 && w1b && !m2 && !m3 && !m2b, "resting controls: the mod wheel between 0 and 1 is dropped; 2 is a move, and what follows at once passes (%u %u %u %u, %u %u %u)", f, w1, w0, w1b, m2, m3, m2b);
          for (unsigned i = 0; i < 140; ++i) (void)sim_render();                 /* 0.4 s without a message: it rests at 2 */
          unsigned r3 = song_test_rest_wiggle(0xb0, 1, 3), r1 = song_test_rest_wiggle(0xb0, 1, 1), r4 = song_test_rest_wiggle(0xb0, 1, 4);
          CHECK(r3 && r1 && !r4, "resting controls: after 0.3 s of quiet its last value is the rest: one step either way is dropped, two pass (%u %u %u)", r3, r1, r4);
          unsigned b0 = song_test_rest_wiggle(0xe0, 0, 64), b1 = song_test_rest_wiggle(0xe0, 64, 64), b2 = song_test_rest_wiggle(0xe0, 127, 63), b3 = song_test_rest_wiggle(0xe0, 0, 67);
          unsigned p0 = song_test_rest_wiggle(0xb0, 64, 0), p1 = song_test_rest_wiggle(0xb0, 64, 127), n0 = song_test_rest_wiggle(0x90, 60, 100);
          CHECK(!b0 && b1 && b2 && !b3 && !p0 && !p1 && !n0, "resting controls: a pitch bend within 255 of its centre is dropped, 384 away passes; the pedal's press passes; notes are never touched (%u %u %u %u, %u %u, %u)", b0, b1, b2, b3, p0, p1, n0); }
        /* tabby-v1.3: several unsaved clips. The open one goes to wait when another is opened, plays from there, comes
         * back when it is opened again, and all are written by one save. Eight at most (the open one and seven). */
        { unsigned song_unsaved_clips(void);
          int o0 = song_edit_open(0, 0), t0 = song_edit_note_toggle(3, 90, 100, 480);
          int o1 = song_edit_open(0, 1); unsigned n1 = song_unsaved_clips();
          int t1 = song_edit_note_toggle(5, 91, 100, 480); unsigned n2 = song_unsaved_clips();
          CHECK(o0 == 0 && t0 >= 0 && o1 == 0 && n1 == 1 && t1 >= 0 && n2 == 2 && song_unsaved(), "unsaved clips: a second clip opens while the first is unsaved; both count (%d %d %d, %u then %u)", o0, t0, o1, n1, n2);
          int back = song_edit_open(0, 0); song_edit_info(&ei);
          CHECK(back == 0 && ei.dirty && ei.place == 0 && clip_v3_note_find(song_edit_clip(), 3, 90) >= 0 && clip_v3_note_find(song_edit_clip(), 5, 91) < 0 && song_unsaved_clips() == 2 && song_edit_undo() == SONG_EMPTY,
                "unsaved clips: the first comes back with its note, unsaved, without undo levels; the second waits");
          int made2 = song_clip_new(0, 40), copy2 = song_clip_copy(0, 0, 41);
          CHECK(made2 == 0 && copy2 == 0 && song_unsaved_clips() == 4 && clip_v3_note_find(song_edit_clip(), 3, 90) >= 0, "unsaved clips: a new clip and a copy of an unsaved clip beside them: four unsaved, the copy has the unsaved note (%d %d, %u)", made2, copy2, song_unsaved_clips());
          int more[5], full, k = 0;
          for (; k < 4; ++k) more[k] = song_clip_new(0, 42U + (unsigned)k);
          full = song_clip_new(0, 50);
          CHECK(!more[0] && !more[1] && !more[2] && !more[3] && full == SONG_BUSY && song_unsaved_clips() == 8 && !song_model_current()->clip[0][50], "unsaved clips: eight are held, the ninth is refused and leaves no clip (%d, %u)", full, song_unsaved_clips());
          CHECK(song_edit_save() == 0 && !song_unsaved() && song_unsaved_clips() == 0 && sim_song_load(SONG) == 0, "unsaved clips: one save writes all of them");
          int r0 = song_edit_open(0, 0); int a = clip_v3_note_find(song_edit_clip(), 3, 90);
          int r1 = song_edit_open(0, 1); int b = clip_v3_note_find(song_edit_clip(), 5, 91);
          int r2 = song_edit_open(0, 41); int c = clip_v3_note_find(song_edit_clip(), 3, 90);
          CHECK(r0 == 0 && a >= 0 && r1 == 0 && b >= 0 && r2 == 0 && c >= 0 && song_model_current()->clip[0][45] && !song_unsaved(), "unsaved clips: loaded again, each clip holds its note and the new clips are in the song (%d %d %d)", a, b, c);
          /* put the two notes back so that the tests after this find the clips as before */
          (void)song_edit_open(0, 0); (void)song_edit_note_toggle(3, 90, 100, 480); (void)song_edit_open(0, 1); (void)song_edit_note_toggle(5, 91, 100, 480);
          CHECK(song_edit_save() == 0 && !song_unsaved(), "unsaved clips: taken out again and saved"); }
        /* the song's click settings */
        CHECK(song_setting(SONG_SET_CLICK) == 0 && song_setting(SONG_SET_COUNT_IN) == 0 && song_setting(SONG_SET_CLICK_CH) == 9 && song_setting(SONG_SET_CLICK_NOTE) == 37, "click: a song that was never set: no click, no count-in; channel 10 and note 37 when it is switched on");
        (void)song_setting_edit(SONG_SET_CLICK, 5); (void)song_setting_edit(SONG_SET_CLICK_OUT, 1); (void)song_setting_edit(SONG_SET_CLICK_CH, -6); (void)song_setting_edit(SONG_SET_CLICK_NOTE, 3); (void)song_setting_edit(SONG_SET_COUNT_IN, 1);
        CHECK(song_setting(SONG_SET_CLICK) == 2 && song_setting(SONG_SET_CLICK_OUT) == 1 && song_setting(SONG_SET_CLICK_CH) == 3 && song_setting(SONG_SET_CLICK_NOTE) == 40 && song_setting(SONG_SET_COUNT_IN) == 1 && song_unsaved(),
              "click: always, as a MIDI note, channel 4, note 40; count-in one cycle; the song is unsaved");
        CHECK(song_edit_save() == 0 && sim_song_load(SONG) == 0 && song_setting(SONG_SET_CLICK) == 2 && song_setting(SONG_SET_CLICK_CH) == 3 && song_setting(SONG_SET_CLICK_NOTE) == 40 && song_setting(SONG_SET_COUNT_IN) == 1, "click: the settings are stored with the song");
        /* tabby-v04.14: CLICK LEVEL and the controller numbers of K1 to K4 on CLIPS */
        CHECK(song_setting(SONG_SET_CLICK_LEVEL) == 1 && song_setting(SONG_SET_KNOB1) == 74 && song_setting(SONG_SET_KNOB2) == 71 && song_setting(SONG_SET_KNOB3) == 1 && song_setting(SONG_SET_KNOB4) == 11,
              "settings: a song never set: CLICK LEVEL MID, K1 to K4 send controllers 74, 71, 1, 11");
        (void)song_setting_edit(SONG_SET_CLICK_LEVEL, -9); (void)song_setting_edit(SONG_SET_KNOB1, -100); (void)song_setting_edit(SONG_SET_KNOB3, 300); (void)song_setting_edit(SONG_SET_KNOB4, -1);
        CHECK(song_setting(SONG_SET_CLICK_LEVEL) == 0 && song_setting(SONG_SET_KNOB1) == 0 && song_setting(SONG_SET_KNOB2) == 71 && song_setting(SONG_SET_KNOB3) == 127 && song_setting(SONG_SET_KNOB4) == 10 && song_unsaved(),
              "settings: LOW; controller 0 can be chosen, 127 is the highest; unsaved");
        CHECK(song_setting_edit(SONG_SETTINGS, 1) == SONG_INVALID, "settings: an unknown setting is refused");
        (void)song_setting_edit(SONG_SET_CLICK_LEVEL, 9);
        CHECK(song_edit_save() == 0 && sim_song_load(SONG) == 0 && song_setting(SONG_SET_CLICK_LEVEL) == 2 && song_setting(SONG_SET_KNOB1) == 0 && song_setting(SONG_SET_KNOB3) == 127 && song_setting(SONG_SET_KNOB4) == 10
              && song_setting(SONG_SET_CLICK) == 2 && song_setting(SONG_SET_COUNT_IN) == 1, "settings: HIGH and the controllers are stored with the song; the click and the count-in are as they were");
        (void)song_setting_edit(SONG_SET_CLICK_LEVEL, -1); (void)song_setting_edit(SONG_SET_KNOB1, 74); (void)song_setting_edit(SONG_SET_KNOB3, -126); (void)song_setting_edit(SONG_SET_KNOB4, 1);
        CHECK(song_edit_save() == 0 && sim_song_load(SONG) == 0 && song_setting(SONG_SET_CLICK_LEVEL) == 1 && song_setting(SONG_SET_KNOB1) == 74, "settings: set back and stored");
        { struct message m[64]; (void)drain(m, 64); }
        no = 0; (void)sim_song_play();
        for (unsigned blocks = 0; blocks < 1500; ++blocks) {
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && (m[k].data[0] & 0xe0) == 0x80 && no < 512) { lo[no].s = m[k].data[0]; lo[no].d1 = m[k].data[1]; lo[no].d2 = m[k].data[2]; lo[no].block = blocks; ++no; }
        }
        sim_song_stop(); settle(); settle();
        { unsigned clicks = 0, accents = 0, offs = 0, first = 0, spaced = 1, prev = 0; int song0 = find_log(lo, no, 0x94, 60, 100, 0);
          for (unsigned i = 0; i < no; ++i) {
              if (lo[i].s == 0x93 && lo[i].d1 == 40 && lo[i].d2) { if (!clicks) first = lo[i].block; else if (lo[i].block - prev < 171 || lo[i].block - prev > 174) spaced = 0; prev = lo[i].block; ++clicks; accents += lo[i].d2 == 127; }
              if ((lo[i].s == 0x83 || (lo[i].s == 0x93 && !lo[i].d2)) && lo[i].d1 == 40) ++offs;
          }
          CHECK(clicks == 9 && accents == 3 && spaced && offs == clicks && song0 >= 0 && lo[song0].block == first, "click: a MIDI note on every quarter note, the first of each cycle louder, each released; in step with the song (%u clicks, %u loud, %u released)", clicks, accents, offs); }
        /* the count-in: a take is armed, PLAY clicks one cycle before the song starts */
        (void)song_setting_edit(SONG_SET_CLICK, -5); (void)song_setting_edit(SONG_SET_CLICK, 1);
        CHECK(song_edit_open(0, 0) == 0 && song_record_start() == 1 && song_setting(SONG_SET_CLICK) == 1, "count-in: clip 1 open, a take armed; the click is on WHEN RECORDING");
        { struct message m[64]; (void)drain(m, 64); }
        no = 0; (void)sim_song_play();
        unsigned counting = 0, rec700 = 0, rec1000 = 0;
        for (unsigned blocks = 0; blocks < 1300; ++blocks) {
            if (blocks == 300) { struct song_status st; song_status_read(&st); counting = st.count_in; }
            if (blocks == 600 || blocks == 1000) { song_edit_info(&ei); if (blocks == 600) rec700 = ei.recording; else rec1000 = ei.recording; }
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && ((m[k].data[0] & 0xf0) == 0x90 || m[k].data[0] == 0xfa) && (m[k].data[0] == 0xfa || m[k].data[2]) && no < 512) { lo[no].s = m[k].data[0]; lo[no].d1 = m[k].data[1]; lo[no].d2 = m[k].data[2]; lo[no].block = blocks; ++no; }
        }
        { int c0 = find_log(lo, no, 0x93, 40, 127, 0), s0 = find_log(lo, no, 0x94, 60, 100, 0), fa = -1; unsigned during = 0, after = 0;
          for (unsigned i = 0; i < no; ++i) { if (lo[i].s == 0xfa && fa < 0) fa = (int)i; if (lo[i].s == 0x93 && s0 >= 0) { if (lo[i].block < lo[s0].block) ++during; else ++after; } }
          unsigned d = c0 >= 0 && s0 >= 0 ? lo[s0].block - lo[c0].block : 0;
          CHECK(during == 4 && d >= 688 && d <= 691 && counting >= 2 && counting <= 3, "count-in: four clicks, then the song's first note one cycle after the first click (%u clicks, %u blocks; 689; %u beats left at block 300)", during, d, counting);
          CHECK(fa >= 0 && s0 >= 0 && lo[fa].block + 2 >= lo[s0].block && lo[fa].block > lo[c0].block + 600, "count-in: MIDI Start goes out when the song starts, not when the count-in does");
          CHECK(rec700 == 1 && rec1000 == 2 && after >= 1, "count-in: the take is armed during it and runs after it; with the click on WHEN RECORDING it clicks on during the take (%u %u, %u clicks)", rec700, rec1000, after); }
        song_record_stop();
        /* a stored scene: T1 on clip 2 (32 steps, launched by hand) */
        int stopped_store = 0;
        CHECK(song_clip_launch(0, 1) == 0, "scene store: clip 2 queued on T1");
        for (unsigned i = 0; i < 800; ++i) (void)sim_render();
        int stored = song_scene_store();
        { const struct song_record *r = song_current();
          CHECK(stored == 3 && r->rows == 4 && r->row[3].block[0] == 2 && r->row[3].steps == 32 && r->row[3].repeat == 1 && r->row[3].flags == (SONG_ROW_FLAG_LOOP_HERE | SONG_ROW_FLAG_OWN) && song_model_current()->scene_clip[3][0] == 2,
                "scene store: what plays is scene 4: T1's clip 2, as long as that clip (32 steps), looping until another is recalled (%d)", stored); }
        CHECK(song_queue_jump(3) == 0, "scene store: the new scene can be recalled at once");
        for (unsigned i = 0; i < 800; ++i) (void)sim_render();
        CHECK((sim_song_status(0) >> 16 & 255U) == 3, "scene store: it plays (scene %u)", (sim_song_status(0) >> 16 & 255U) + 1);
        sim_song_stop(); settle(); settle();
        stopped_store = song_scene_store();
        song_edit_discard();
        CHECK(stopped_store == SONG_INVALID && song_edit_save() == 0 && sim_song_load(SONG) == 0 && song_current()->rows == 4 && song_current()->row[3].block[0] == 2 && (song_current()->row[3].flags & SONG_ROW_FLAG_OWN),
              "scene store: nothing is stored while stopped; saved and loaded again, the song has four scenes");
        /* ---- tabby-v04.13: a clip's program and bank from the panel: set, played when the track enters the clip, sent
         *      again when an edit changes them while the clip loops ---- */
        CHECK(song_edit_open(0, 0) == 0 && song_edit_program(2, 5) == SONG_EMPTY && song_edit_program(0, 6) == 0 && song_edit_program(1, 3) == 0 && song_edit_program(2, 7) == 0,
              "program: the bank LSB needs a bank; program 6 (0-based 5), bank MSB 2, LSB 7 set");
        { const uint8_t *h = song_edit_clip();
          CHECK(h[1] == 3 && h[2] == 5 && h[3] == 2 && h[4] == 7 && clip_v3_validate(h, clip_v3_bytes(h)) == 0 && song_edit_program(0, 500) == 0 && song_edit_clip()[2] == 127 && song_edit_program(0, -122) == 0 && song_edit_clip()[2] == 5, "program: in the clip's header, valid; held at 128"); }
        { struct message m[64]; (void)drain(m, 64); }
        no = 0; CHECK(song_clip_launch(0, 0) == 0, "program: the clip reserved");
        (void)sim_song_play();
        for (unsigned blocks = 0; blocks < 2200; ++blocks) {
            if (blocks == 1000) (void)song_edit_program(0, 4);                         /* while it loops: program 10 */
            (void)sim_render();
            struct message m[64]; unsigned n = drain(m, 64);
            for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && ((m[k].data[0] & 0xf0) == 0xc0 || (m[k].data[0] & 0xf0) == 0xb0 || ((m[k].data[0] & 0xf0) == 0x90 && m[k].data[2])) && no < 512) { lo[no].s = m[k].data[0]; lo[no].d1 = m[k].data[1]; lo[no].d2 = (m[k].data[0] & 0xf0) == 0xc0 ? 0 : m[k].data[2]; lo[no].block = blocks; ++no; }
        }
        sim_song_stop(); settle(); settle();
        { int b0 = find_log(lo, no, 0xb4, 0, 2, 0), b32 = find_log(lo, no, 0xb4, 32, 7, 0), pc = find_log(lo, no, 0xc4, 5, 0, 0), n0 = find_log(lo, no, 0x94, 60, 100, 0), pc2 = find_log(lo, no, 0xc4, 9, 0, 0);
          unsigned pcs = 0; for (unsigned i = 0; i < no; ++i) if (lo[i].s == 0xc4) ++pcs;
          CHECK(b0 >= 0 && b32 > b0 && pc > b32 && n0 > pc && lo[pc].block == lo[n0].block, "program: bank MSB, LSB, then the program go out on the track's channel before the clip's first note, in its block");
          CHECK(pc2 > pc && lo[pc2].block > 1000 && pcs == 2, "program: changed while the clip loops, the new program goes out once, at the clip's next loop (%u program changes, the second at block %u)", pcs, pc2 >= 0 ? lo[pc2].block : 0); }
        song_edit_discard();
        /* ---- tabby-v04.12: the scene chain: a start scene reserved while stopped, a scene's times and what follows it ---- */
        { int r1 = song_queue_jump(2), r9 = song_queue_jump(9); struct song_status st; song_status_read(&st);
          CHECK(r1 == 0 && r9 == SONG_INVALID && st.queued == 2 && song_scene_reserved() == 2, "scene chain: stopped, a scene pad reserves the scene PLAY starts at (%d %d, queued %u)", r1, r9, st.queued);
          CHECK(song_queue_jump(2) == SONG_EMPTY && song_scene_reserved() == 0 && song_queue_jump(2) == 0, "scene chain: the reserved scene again takes it back; reserved once more"); }
        CHECK(song_scene_edit(2, 1, -1) == 0 && !(song_current()->row[2].flags & SONG_ROW_FLAG_LOOP_HERE) && song_scene_edit(2, 0, 1) == 0 && song_current()->row[2].repeat == 2 && song_scene_edit(2, 0, 99) == 0 && song_current()->row[2].repeat == 64 && song_scene_edit(2, 0, -62) == 0 && song_unsaved(),
              "scene chain: scene 3 no longer stays (THEN NEXT), plays 2 times; TIMES is held between 1 and 64; the song is unsaved");
        (void)sim_song_play();
        unsigned row50 = 0, sc1000 = 0, row1600 = 0, row3000 = 0, sheld = 0;
        for (unsigned blocks = 0; blocks < 4400; ++blocks) {
            if (blocks == 50) row50 = sim_song_status(0) >> 16 & 255U;
            if (blocks == 1000) sc1000 = sim_song_status(0) >> 16 & 255U;                  /* scene 3 is 16 steps x 2 = 1378 blocks */
            if (blocks == 1600) { row1600 = sim_song_status(0) >> 16 & 255U; (void)song_scene_edit(3, 1, -1); (void)song_scene_edit(3, 0, 1); }   /* scene 4 (32 steps): THEN NEXT (the last scene: the song loops or ends), 2 times */
            if (blocks == 3000) { row3000 = sim_song_status(0) >> 16 & 255U; song_scene_hold_set(1); }
            if (blocks == 4300) sheld = sim_song_status(0) >> 16 & 255U;
            (void)sim_render();
            struct message m[64]; (void)drain(m, 64);
        }
        CHECK(row50 == 2 && song_scene_reserved() == 0, "scene chain: PLAY starts at the reserved scene 3 (scene %u); the reservation is used up", row50 + 1);
        CHECK(sc1000 == 2 && row1600 == 3, "scene chain: scene 3 plays its 2 times, then the next scene follows (scene %u at block 1000, %u at 1600)", sc1000 + 1, row1600 + 1);
        CHECK(row3000 == 3 && sheld == 3 && (sim_song_status(0) >> 8 & 255U) == 1, "scene chain: TIMES changed while the scene plays is taken at once (still scene 4 at 3000); held, it repeats past its end (scene %u at 4300)", sheld + 1);
        song_scene_hold_set(0);
        sim_song_stop(); settle(); settle();
        CHECK(song_edit_save() == 0 && sim_song_load(SONG) == 0 && song_current()->row[2].repeat == 2 && !(song_current()->row[2].flags & SONG_ROW_FLAG_LOOP_HERE) && song_current()->row[3].repeat == 2, "scene chain: the settings are saved with the song");
        /* ---- tabby-v04.16: a scene moved and deleted (stopped only); the row events and the loop row follow ---- */
        { struct song_record *w = (struct song_record *)(uintptr_t)song_current(); const struct song_model *m = song_model_current();
          static const uint8_t ev[15] = { 0, 0x02, 10, 0, 0,  1, 0x02, 11, 0, 0,  3, 0x02, 13, 0, 0 };   /* a program change in scenes 1, 2 and 4 */
          uint8_t *tb = w->tail; tb[0] = 3; tb[1] = 0; memcpy(tb + 8, ev, sizeof ev); w->loop_row = 3;
          (void)sim_song_play(); for (unsigned i = 0; i < 100; ++i) (void)sim_render();
          CHECK(song_scene_delete(1) == SONG_BUSY && song_scene_move(1, 1) == SONG_BUSY && w->rows == 4, "scene edit: nothing is deleted or moved while the song plays");
          sim_song_stop(); settle(); settle();
          CHECK(song_scene_move(0, -1) == 0 && song_scene_move(3, 1) == 3 && w->row[3].block[0] == 2 && tb[8] == 0 && tb[18] == 3, "scene edit: the first scene does not move earlier, the last not later");
          int mv = song_scene_move(3, -1);
          CHECK(mv == 2 && (w->row[2].flags & SONG_ROW_FLAG_OWN) && w->row[2].block[0] == 2 && w->row[2].steps == 32 && w->row[3].block[0] == 1 && w->row[3].repeat == 2 && m->scene_clip[2][0] == 2 && m->scene_clip[3][0] == 1,
                "scene edit: scene 4 moved earlier is scene 3, and scene 3 is scene 4 (%d)", mv);
          CHECK(tb[0] == 3 && tb[8] == 0 && tb[13] == 1 && tb[18] == 2 && tb[20] == 13 && w->loop_row == 2 && song_scene_reserved() == 2, "scene edit: its row event and the loop row moved with it; it stays the selected scene");
          CHECK(song_scene_move(1, 1) == 2 && tb[13] == 1 && tb[15] == 13 && tb[18] == 2 && tb[20] == 11 && w->row[1].steps == 32 && w->loop_row == 1, "scene edit: moved again, the events of the two scenes change places in the table");
          int del = song_scene_delete(0);
          CHECK(del == 0 && w->rows == 3 && w->row[0].steps == 32 && w->row[1].repeat == 3 && w->row[2].block[0] == 1 && m->scene_clip[0][0] == 2 && m->scene_clip[3][0] == 0 && w->row[3].repeat == 0,
                "scene edit: scene 1 deleted: three scenes, the others one place earlier (%d)", del);
          CHECK(tb[0] == 2 && tb[8] == 0 && tb[10] == 13 && tb[13] == 1 && tb[15] == 11 && tb[18] == 0xff && tb[22] == 0xff && w->loop_row == 0 && song_scene_reserved() == 0, "scene edit: its event is gone, the others follow their scenes, the loop row too");
          CHECK(song_scene_delete(2) == 0 && song_scene_delete(1) == 0 && w->rows == 1 && tb[0] == 1 && song_scene_delete(0) == SONG_EMPTY && w->rows == 1, "scene edit: the last scene of a song stays");
          CHECK(song_edit_save() == 0 && sim_song_load(SONG) == 0 && song_current()->rows == 1 && song_current()->row[0].steps == 32 && song_current()->tail[0] == 1 && song_current()->tail[10] == 13 && song_model_current()->clip[0][0] == 1,
                "scene edit: saved and loaded again: one scene, its event, and every clip still in the song"); }
        /* a clip stored as a grid block plays as long as its first imported scene: a change that would alter that is refused */
        { const unsigned G = 9;
          memset(f, 0, 64); CHECK(sim_block_write2(G, 1, 1, 64) == 0, "scene edit: a grid block stored");
          memset(f, 0, 4096); memcpy(f, "FM1G", 4); f[20] = 3; memcpy(f + 24, "GRID        ", 12); f[40] = 3; f[48] = 5;
          memset(f + 2624, 0xff, 4096 - 2624); memset(f + 2624, 0, 8); f[2626] = 1;
          f[64] = 1;
          f[1088] = 1; f[1088 + 8] = 1; f[1088 + 10] = 16; f[1100] = 1; f[1100 + 8] = 1; f[1100 + 10] = 32; f[1112] = 1; f[1112 + 8] = 1; f[1112 + 10] = 16;
          CHECK(sim_song_record_write(G) == 0 && sim_song_load(G) == 0, "scene edit: a song of three scenes on one grid block (16, 32, 16 steps)");
          CHECK(song_scene_delete(0) == SONG_EDIT_SHARED && song_scene_move(0, 1) == SONG_EDIT_SHARED && song_current()->rows == 3 && song_current()->row[0].steps == 16, "scene edit: refused: scene 1 gives the clip its 16 steps and scene 2 would give it 32");
          CHECK(song_scene_move(2, -1) == 1 && song_current()->row[1].steps == 16 && song_current()->row[2].steps == 32, "scene edit: scenes 2 and 3 change places (the clip's first scene is still scene 1)");
          CHECK(song_scene_delete(0) == 0 && song_current()->rows == 2 && song_scene_delete(0) == SONG_EDIT_SHARED && song_scene_delete(1) == 0 && song_current()->rows == 1, "scene edit: scene 1 goes when the next scene has the same steps, not when it has others; a later scene always goes"); }
        /* ---- tabby-v04.16: a take armed while the song plays is taken off when the song stops; armed while stopped it waits ---- */
        { struct song_edit_info ei;
          CHECK(sim_song_load(SONG) == 0 && song_edit_open(0, 2) == 0, "disarm: the song loaded, clip 3 open (the scene plays clip 2)");
          (void)sim_song_play(); for (unsigned i = 0; i < 100; ++i) (void)sim_render();
          int r = song_record_start(); for (unsigned i = 0; i < 20; ++i) { (void)sim_render(); (void)song_edit_poll(); }
          song_edit_info(&ei);
          CHECK(r == 1 && ei.recording == 1, "disarm: REC while the song plays arms the take (the clip is queued) (%d %u)", r, ei.recording);
          sim_song_stop(); settle(); settle(); (void)song_edit_poll();
          song_edit_info(&ei);
          CHECK(ei.recording == 0, "disarm: the song stopped: the take is off (the screen reads song_record_disarmed and says so) (%u)", ei.recording);
          r = song_record_start(); settle(); (void)song_edit_poll(); (void)song_edit_poll();
          song_edit_info(&ei);
          CHECK(r == 1 && ei.recording == 1, "disarm: a take armed while stopped stays armed for PLAY (%u)", ei.recording);
          song_record_stop(); song_edit_discard(); }
        /* ---- tabby-v04.17: SHUFFLE and PLAY QUANTIZE per clip: the copy that plays is changed, the stored clip is not ---- */
        { CHECK(sim_song_load(SONG) == 0 && song_edit_open(0, 0) == 0, "feel: clip 1 open (16 steps, 60 on step 1)");
          int a1 = song_edit_note_toggle(1, 71, 100, 240), a2 = song_edit_note_toggle(4, 72, 100, 240), a3 = song_edit_note_adjust(4, 0, 1, 200);
          CHECK(a1 == 1 && a2 == 1 && a3 == 0, "feel: 71 on step 2, 72 on step 5 moved 200 units late (%d %d %d)", a1, a2, a3);
          unsigned d71[4] = {0}, d72[4] = {0};
          for (unsigned run = 0; run < 4; ++run) {
              /* run 0: as it is; 1: SHUFFLE 50; 2: SHUFFLE 0 of its own with PLAY QUANTIZE 1/16; 3: both back to SONG and OFF */
              if (run == 1) CHECK(song_edit_feel(0, 60) == 0 && song_edit_clip()[13] == 51, "feel: SHUFFLE stops at 50 percent (byte 13 = 51)");
              if (run == 2) CHECK(song_edit_feel(0, -50) == 0 && song_edit_feel(1, 1) == 0 && song_edit_clip()[13] == 1 && song_edit_clip()[15] == 1, "feel: SHUFFLE 0 of its own, PLAY QUANTIZE 1/16");
              if (run == 3) CHECK(song_edit_feel(0, -5) == 0 && song_edit_feel(1, -5) == 0 && song_edit_clip()[13] == 0 && song_edit_clip()[15] == 0 && song_edit_feel(2, 1) == SONG_INVALID, "feel: back to SONG and OFF");
              { struct message m[64]; (void)drain(m, 64); }
              CHECK(song_clip_launch(0, 0) == 0, "feel: the clip reserved (run %u)", run);
              (void)sim_song_play();
              unsigned b60 = 0, got = 0;
              for (unsigned blocks = 0; blocks < 500 && got < 3; ++blocks) {
                  (void)sim_render();
                  struct message m[64]; unsigned n = drain(m, 64);
                  for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && m[k].data[0] == 0x94 && m[k].data[2]) {
                      if (m[k].data[1] == 60 && !got) { b60 = blocks; got = 1; }
                      if (m[k].data[1] == 71 && got && !d71[run]) { d71[run] = blocks - b60; ++got; }
                      if (m[k].data[1] == 72 && got && !d72[run]) { d72[run] = blocks - b60; ++got; }
                  }
              }
              sim_song_stop(); settle(); settle();
          }
          /* a step is 43.07 blocks. Straight: 71 after 1 step (43), 72 after 4 steps + 200 units (190). SHUFFLE 50: the second
           * step of a pair half a step late (65), the 200 units in a first step stretched to 300 (199). Quantized: 72 on its step (172). */
          CHECK(d71[0] >= 42 && d71[0] <= 44 && d72[0] >= 189 && d72[0] <= 191, "feel: as recorded: 71 one step after 60, 72 late (%u, %u blocks)", d71[0], d72[0]);
          CHECK(d71[1] >= 64 && d71[1] <= 66 && d72[1] >= 198 && d72[1] <= 200, "feel: SHUFFLE 50: the off-beat step comes half a step late (%u, %u blocks; 65, 199)", d71[1], d72[1]);
          CHECK(d71[2] >= 42 && d71[2] <= 44 && d72[2] >= 171 && d72[2] <= 173, "feel: PLAY QUANTIZE 1/16: the late note plays on its step (%u, %u blocks; 43, 172)", d71[2], d72[2]);
          CHECK(d71[3] == d71[0] && d72[3] == d72[0], "feel: SONG and OFF again: the clip plays as recorded, the stored notes were never changed (%u, %u)", d71[3], d72[3]);
          { struct clip_v3_event e; unsigned late = 0; for (unsigned i = 0; i < clip_v3_count(song_edit_clip()); ++i) { clip_v3_event(song_edit_clip(), i, &e); if (e.kind == CLIP_V3_NOTE && e.a == 72 && e.time == 4 * 480 + 200) late = 1; }
            CHECK(late, "feel: the open clip still holds the note 200 units late"); }
          song_edit_discard(); }
        /* ---- tabby-v04.19: STEP SIZE per clip: what a step lasts; the take and the play cursor are in the clip's own steps ---- */
        { CHECK(sim_song_load(SONG) == 0 && song_edit_open(0, 0) == 0 && song_edit_length(16 - (int)clip_v3_steps(song_edit_clip())) >= 0 && clip_v3_steps(song_edit_clip()) == 16 && song_edit_note_toggle(2, 71, 100, 240) == 1,
                "step size: clip 1 open and set to 16 steps (60 on step 1), 71 on step 3");
          unsigned d71[4] = {0}, loop[4] = {0}, cursor = 255, rec_ok = 0; unsigned ch = groove_midi_input_channel(0);
          for (unsigned run = 0; run < 4; ++run) {
              /* run 0: 1/16; 1: 1/8 (with a take); 2: 1/32; 3: 12 steps at 1/16T */
              if (run == 1) CHECK(song_edit_scale(1) == 0 && clip_v3_scale(song_edit_clip()) == 1, "step size: K1 right: 1/8");
              if (run == 2) CHECK(song_edit_scale(1) == 0 && clip_v3_scale(song_edit_clip()) == 2 && song_edit_scale(1) == 0 && clip_v3_scale(song_edit_clip()) == 2, "step size: 1/32; the triplet sizes do not fit 16 steps and are passed over");
              if (run == 3) CHECK(song_edit_length(-4) >= 0 && song_edit_scale(1) == 0 && clip_v3_scale(song_edit_clip()) == 3, "step size: with 12 steps 1/16T can be chosen");
              { struct message m[64]; (void)drain(m, 64); }
              CHECK(song_clip_launch(0, 0) == 0, "step size: the clip reserved (run %u)", run);
              if (run == 1) (void)song_record_start();
              (void)sim_song_play();
              unsigned b60 = 0, got = 0, on = 0, off = 0;
              for (unsigned blocks = 0; blocks < 2300 && got < 3; ++blocks) {   /* run 1 begins with the count-in of the take */
                  (void)sim_render();
                  struct message m[64]; unsigned n = drain(m, 64);
                  for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && m[k].data[0] == 0x94 && m[k].data[2]) {
                      if (m[k].data[1] == 60 && !got) { b60 = blocks; got = 1; }
                      else if (m[k].data[1] == 60 && got && !loop[run]) { loop[run] = blocks - b60; ++got; }
                      if (m[k].data[1] == 71 && got && !d71[run]) { d71[run] = blocks - b60; ++got; }
                  }
                  if (run == 1 && got) {
                      struct song_edit_info ei; song_edit_info(&ei);
                      if (blocks == b60 + 180) cursor = ei.play_step;                       /* 4.2 played steps in: the clip's step 3 (index 2) */
                      if (blocks == b60 + 344 && !on) { song_record_in(1, 0x90 | ch, 80, 100); on = 1; }   /* 8 played steps = the clip's step 5 */
                      if (blocks == b60 + 430 && !off) { song_record_in(1, 0x80 | ch, 80, 0); off = 1; }  /* 2 played steps later: one step of the clip */
                  }
              }
              if (run == 1) { for (unsigned i = 0; i < 20; ++i) (void)sim_render(); song_record_stop();
                  struct clip_v3_event e; for (unsigned i = 0; i < clip_v3_count(song_edit_clip()); ++i) { clip_v3_event(song_edit_clip(), i, &e); if (e.kind == CLIP_V3_NOTE && e.a == 80 && e.time == 4 * 480 && e.length >= 440 && e.length <= 520) rec_ok = 1; } }
              sim_song_stop(); settle(); settle();
          }
          /* a 16th is 43.07 blocks: 71 two steps after 60, the clip 16 steps long */
          CHECK(d71[0] >= 85 && d71[0] <= 87 && loop[0] >= 688 && loop[0] <= 690, "step size 1/16: 71 after 2 sixteenths, the clip loops after 16 (%u, %u blocks; 86, 689)", d71[0], loop[0]);
          CHECK(d71[1] >= 171 && d71[1] <= 173 && loop[1] >= 1377 && loop[1] <= 1379, "step size 1/8: 71 after 4 sixteenths, the clip loops after 32 (%u, %u blocks; 172, 1378)", d71[1], loop[1]);
          CHECK(cursor == 2, "step size 1/8: the play cursor counts the clip's own steps (step %u at 4.2 sixteenths)", cursor + 1U);
          CHECK(rec_ok, "step size 1/8: a key played at the 9th sixteenth for two sixteenths is recorded on the clip's step 5, one step long");
          CHECK(d71[2] >= 42 && d71[2] <= 44 && loop[2] >= 343 && loop[2] <= 346, "step size 1/32: 71 after 1 sixteenth, the clip loops after 8 (%u, %u blocks; 43, 344.5)", d71[2], loop[2]);
          CHECK(d71[3] >= 56 && d71[3] <= 59 && loop[3] >= 343 && loop[3] <= 346, "step size 1/16T, 12 steps: 71 after two triplet steps (%u blocks; 57.4), the clip loops after 8 sixteenths (%u)", d71[3], loop[3]);
          song_edit_discard(); }
        /* ---- tabby-v04.20: DIRECTION per clip; the play cursor and a take stay in the clip's own steps ---- */
        { CHECK(sim_song_load(SONG) == 0 && song_edit_open(0, 0) == 0 && song_edit_length(16 - (int)clip_v3_steps(song_edit_clip())) >= 0 && song_edit_note_toggle(2, 71, 100, 240) == 1,
                "direction: clip 1 open, 16 steps, 60 on step 1 and 71 on step 3");
          unsigned ch = groove_midi_input_channel(0), rec_ok = 0, cursor = 255;
          unsigned t60[3][4], t71[3][4], n60[3] = {0}, n71[3] = {0};
          for (unsigned run = 0; run < 3; ++run) {
              /* run 0: FORWARD; 1: REVERSE (with a take); 2: FWD THEN REV */
              if (run) CHECK(song_edit_direction(1) == 0 && clip_v3_direction(song_edit_clip()) == run, "direction: K1 right: %s", run == 1 ? "REVERSE" : "FWD THEN REV");
              if (run == 2) CHECK(song_edit_direction(5) == 0 && clip_v3_direction(song_edit_clip()) == 2, "direction: it stops at FWD THEN REV");
              { struct message m[64]; (void)drain(m, 64); }
              CHECK(song_clip_launch(0, 0) == 0, "direction: the clip reserved (run %u)", run);
              if (run == 1) (void)song_record_start();
              (void)sim_song_play();
              unsigned on = 0, off = 0, mark = 0;
              for (unsigned blocks = 0; blocks < 3600 && (n60[run] < 4 || n71[run] < 4); ++blocks) {
                  (void)sim_render();
                  struct message m[64]; unsigned n = drain(m, 64);
                  for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && m[k].data[0] == 0x94 && m[k].data[2]) {
                      if (m[k].data[1] == 60 && n60[run] < 4) t60[run][n60[run]++] = blocks;
                      if (m[k].data[1] == 71 && n71[run] < 4) { t71[run][n71[run]++] = blocks; if (run == 1 && !mark) mark = blocks; }
                  }
                  if (run == 1 && mark) {
                      struct song_edit_info ei; song_edit_info(&ei);
                      if (blocks == mark + 10) cursor = ei.play_step;                             /* 71 sounds: the clip's step 3 (index 2) */
                      if (blocks == mark + 43 && !on) { song_record_in(1, 0x90 | ch, 81, 100); on = 1; }    /* one sixteenth later the clip is on its step 2 */
                      if (blocks == mark + 60 && !off) { song_record_in(1, 0x80 | ch, 81, 0); off = 1; }
                  }
              }
              if (run == 1) { for (unsigned i = 0; i < 20; ++i) (void)sim_render(); song_record_stop();
                  struct clip_v3_event e; for (unsigned i = 0; i < clip_v3_count(song_edit_clip()); ++i) { clip_v3_event(song_edit_clip(), i, &e); if (e.kind == CLIP_V3_NOTE && e.a == 81 && e.time == 1 * 480) rec_ok = 1; } }
              sim_song_stop(); settle(); settle();
          }
          #define NEAR(a_, b_) ((a_) + 2U >= (b_) && (a_) <= (b_) + 2U)
          /* a 16th is 43.07 blocks; the clip is 16 steps = 689 blocks */
          CHECK(n60[0] >= 2 && n71[0] >= 2 && NEAR(t71[0][0] - t60[0][0], 86U) && NEAR(t60[0][1] - t60[0][0], 689U), "direction FORWARD: 71 two sixteenths after 60, every 16 (%u, %u blocks)", t71[0][0] - t60[0][0], t60[0][1] - t60[0][0]);
          CHECK(n60[1] >= 2 && n71[1] >= 2 && NEAR(t60[1][0] - t71[1][0], 86U) && NEAR(t71[1][1] - t71[1][0], 689U), "direction REVERSE: 60 two sixteenths after 71 (steps 14 and 16 of the pass), every 16 (%u, %u blocks)", t60[1][0] - t71[1][0], t71[1][1] - t71[1][0]);
          CHECK(cursor == 2, "direction REVERSE: the play cursor is on the clip's step 3 while its note sounds (step %u)", cursor + 1U);
          CHECK(rec_ok, "direction REVERSE: a key played one sixteenth after that note is recorded on the clip's step 2");
          CHECK(n60[2] >= 3 && n71[2] >= 3 && NEAR(t71[2][0] - t60[2][0], 86U) && NEAR(t71[2][1] - t71[2][0], 1163U) && NEAR(t60[2][1] - t71[2][1], 86U) && NEAR(t60[2][2] - t60[2][1], 43U),
                "direction FWD THEN REV: 60, 71, then 27 sixteenths later 71, 60, and 60 again at once: 32 sixteenths in all (%u, %u, %u, %u blocks; 86, 1163, 86, 43)", t71[2][0] - t60[2][0], t71[2][1] - t71[2][0], t60[2][1] - t71[2][1], t60[2][2] - t60[2][1]);
          song_edit_discard(); }
        /* ---- tabby-v04.21: shift a clip by a step; FX + key clears notes during a take; a new empty song ---- */
        { CHECK(sim_song_load(SONG) == 0 && song_edit_open(0, 0) == 0 && song_edit_length(16 - (int)clip_v3_steps(song_edit_clip())) >= 0 && song_edit_note_toggle(2, 71, 100, 240) == 1 && song_edit_note_toggle(15, 72, 100, 240) == 1,
                "shift: clip 1 open, 16 steps, 60 on step 1, 71 on step 3, 72 on step 16");
          struct song_edit_info ei; song_edit_info(&ei); unsigned undo0 = ei.undo, events0 = ei.events;
          CHECK(song_edit_shift(1) == 0 && clip_v3_note_find(song_edit_clip(), 1, 60) >= 0 && clip_v3_note_find(song_edit_clip(), 3, 71) >= 0 && clip_v3_note_find(song_edit_clip(), 0, 72) >= 0 && clip_v3_note_find(song_edit_clip(), 0, 60) < 0,
                "shift: one step later: 60 on step 2, 71 on step 4, 72 from step 16 round to step 1");
          CHECK(song_edit_shift(1) == 0 && clip_v3_note_find(song_edit_clip(), 2, 60) >= 0 && clip_v3_note_find(song_edit_clip(), 1, 72) >= 0 && clip_v3_validate(song_edit_clip(), clip_v3_bytes(song_edit_clip())) == 0, "shift: once more; the clip is valid");
          song_edit_info(&ei);
          CHECK(ei.undo == undo0 + 1U && ei.events == events0, "shift: one run of shifts is one undo level, no event lost (%u levels, %u events)", ei.undo, ei.events);
          CHECK(song_edit_undo() == 0 && clip_v3_note_find(song_edit_clip(), 0, 60) >= 0 && clip_v3_note_find(song_edit_clip(), 15, 72) >= 0, "shift: undo gives the clip before the run");
          CHECK(song_edit_shift(-1) == 0 && clip_v3_note_find(song_edit_clip(), 15, 60) >= 0 && clip_v3_note_find(song_edit_clip(), 1, 71) >= 0 && clip_v3_note_find(song_edit_clip(), 14, 72) >= 0, "shift: one step earlier: 60 from step 1 round to step 16");
          CHECK(song_edit_undo() == 0, "shift: undo");
          /* FX + key in a take: 71 held with FX while the clip passes step 3 */
          unsigned ch = groove_midi_input_channel(0), b60 = 0, got = 0, phase = 0, n60_after = 0, n71_after = 0, rec_at = 0, hint = 0;
          { struct message m[64]; (void)drain(m, 64); }
          CHECK(song_clip_launch(0, 0) == 0 && song_record_start() == 1, "clear: the clip reserved, a take armed");
          (void)sim_song_play();
          for (unsigned blocks = 0; blocks < 4200 && phase < 5; ++blocks) {
              (void)sim_render();
              struct message m[64]; unsigned n = drain(m, 64);
              song_edit_info(&ei);
              for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && m[k].data[0] == 0x94 && m[k].data[2]) {
                  if (m[k].data[1] == 60 && ei.recording == 2 && !got) { b60 = blocks; got = 1; }
                  if (got && phase >= 2 && blocks > rec_at + 700) { if (m[k].data[1] == 71) ++n71_after; if (m[k].data[1] == 60) ++n60_after; }
              }
              if (!got) continue;
              if (phase == 0 && blocks == b60 + 20) { (void)sim_smk37(SMK37_BUTTON, 14, 1); phase = 1; }                    /* FX down */
              if (phase == 1 && blocks == b60 + 30) { hint = clip_v3_note_find(song_edit_clip(), 2, 71) >= 0; song_record_in(1, 0x90 | ch, 71, 100); phase = 2; rec_at = blocks; }
              if (phase == 2 && blocks == b60 + 200) { song_record_in(1, 0x80 | ch, 71, 0); phase = 3; }                    /* step 3 was passed at 86 blocks */
              if (phase == 3 && blocks == b60 + 210) { (void)sim_smk37(SMK37_BUTTON, 14, 0); phase = 4; }
              if (phase == 4 && blocks == b60 + 1500) phase = 5;                                                             /* two more passes of the clip */
          }
          song_edit_info(&ei);
          CHECK(phase == 5 && ei.recording == 2 && hint, "clear: the take runs; 71 was on step 3 when FX and the key went down");
          CHECK(clip_v3_note_find(song_edit_clip(), 2, 71) < 0 && clip_v3_note_find(song_edit_clip(), 0, 60) >= 0 && clip_v3_note_find(song_edit_clip(), 15, 72) >= 0 && ei.events == events0 - 1U,
                "clear: FX + the key 71 over step 3: that note is out of the clip, 60 and 72 stay, the key was not recorded (%u events)", ei.events);
          CHECK(n60_after >= 1 && n71_after == 0, "clear: in the passes that follow 60 comes out of the clip (%u) and 71 no longer (%u)", n60_after, n71_after);
          song_record_in(1, 0x90 | ch, 75, 100); for (unsigned i = 0; i < 20; ++i) (void)sim_render(); song_record_in(1, 0x80 | ch, 75, 0); for (unsigned i = 0; i < 20; ++i) (void)sim_render();
          song_record_stop(); song_edit_info(&ei);
          CHECK(ei.events == events0 && ei.undo >= 1, "clear: with FX up a key is recorded again (%u events)", ei.events);
          sim_song_stop(); settle(); settle();
          CHECK(song_edit_undo() == 0 && clip_v3_note_find(song_edit_clip(), 2, 71) >= 0, "clear: undo gives the clip before the take, 71 back on step 3");
          song_edit_discard();
          /* a new empty song */
          const unsigned NEW = 12;
          (void)sim_song_record_delete(NEW);
          CHECK(song_new(SONG) == SONG_NEW_EXISTS && song_loaded() == SONG, "new song: a slot that holds a song is refused (the song stays loaded)");
          CHECK(song_new(NEW) == 0 && song_loaded() == NEW && song_current() && song_current()->rows == 1 && !memcmp(song_current()->name, "NEW SONG    ", 12) && song_model_current()->cycle == 16,
                "new song: slot %u was empty: a song of one scene, cycle 16, named NEW SONG, is loaded", NEW + 1U);
          CHECK(song_clip_new(0, 0) == 0 && song_edit_note_toggle(0, 64, 100, 240) == 1 && song_edit_note_toggle(4, 67, 100, 240) == 1 && song_clip_scene(0, 0) < 0, "new song: a new clip on track 1 with two notes (scene 1 stays empty)");
          CHECK(song_edit_save() == 0 && !song_unsaved(), "new song: saved");
          CHECK(sim_song_load(SONG) == 0 && sim_song_load(NEW) == 0 && song_edit_open(0, 0) == 0 && clip_v3_note_find(song_edit_clip(), 0, 64) >= 0 && clip_v3_note_find(song_edit_clip(), 4, 67) >= 0, "new song: loaded again from storage: the clip and its notes are there");
          { struct message m[64]; (void)drain(m, 64); }
          unsigned n64 = 0, n67 = 0;
          CHECK(song_clip_launch(0, 0) == 0, "new song: the clip reserved");
          (void)sim_song_play();
          for (unsigned blocks = 0; blocks < 1500; ++blocks) { (void)sim_render(); struct message m[64]; unsigned n = drain(m, 64);
              for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && (m[k].data[0] & 0xf0) == 0x90 && m[k].data[2]) { if (m[k].data[1] == 64) ++n64; if (m[k].data[1] == 67) ++n67; } }
          sim_song_stop(); settle(); settle();
          CHECK(n64 >= 2 && n67 >= 2, "new song: SEQ PLAY starts the song and the reserved clip, which loops (%u, %u notes)", n64, n67);
          CHECK(song_new(NEW) == SONG_NEW_EXISTS, "new song: the slot is taken now");
          song_edit_discard(); (void)sim_song_record_delete(NEW); }
        /* ---- tabby-v04.22: NOTE REPEAT held repeats a held key at the ARP rate; KNOB BANK + NOTE REPEAT is the focus switch ---- */
        { extern unsigned smk37_performance_track(unsigned), smk37_pad_focus(void), groove_arp_enabled(unsigned), smk37_note_repeat(void), groove_arp_setting(unsigned, unsigned);
          extern void groove_arp_set(unsigned, unsigned);
          unsigned kt = smk37_performance_track(0), focus0 = smk37_pad_focus(), arp0 = groove_arp_enabled(kt);
          { struct message m[64]; (void)drain(m, 64); }
          (void)sim_smk37(SMK37_BUTTON, 7, 1); settle();
          CHECK(!arp0 && smk37_note_repeat() == (1U << kt | 1U << smk37_performance_track(1)) && groove_arp_enabled(kt) && smk37_pad_focus() == focus0,
                "note repeat: NOTE REPEAT down: the key track and the pad track repeat (mask 0x%x); the focus does not change", smk37_note_repeat());
          (void)sim_smk37(SMK37_KEY, 12, 100);
          unsigned ons = 0, first = 0, last = 0;
          for (unsigned blocks = 0; blocks < 345; ++blocks) { (void)sim_render(); struct message m[64]; unsigned n = drain(m, 64);
              for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && (m[k].data[0] & 0xf0) == 0x90 && m[k].data[1] == 60 && m[k].data[2]) { if (!ons) first = blocks; last = blocks; ++ons; } }
          CHECK(ons >= 7 && ons <= 9 && (last - first) / (ons - 1U) >= 42 && (last - first) / (ons - 1U) <= 44, "note repeat: a held key repeats every 16th: %u note-ons in a second, %u blocks apart (43.07)", ons, ons > 1 ? (last - first) / (ons - 1U) : 0);
          (void)sim_smk37(SMK37_ENCODER, 0, 1); settle();
          CHECK(groove_arp_setting(kt, 0) == 3, "note repeat: K1 while it is held: the rate is 1/32 (%u)", groove_arp_setting(kt, 0));
          { struct message m[64]; (void)drain(m, 64); }
          ons = 0;
          for (unsigned blocks = 0; blocks < 345; ++blocks) { (void)sim_render(); struct message m[64]; unsigned n = drain(m, 64);
              for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && (m[k].data[0] & 0xf0) == 0x90 && m[k].data[1] == 60 && m[k].data[2]) ++ons; }
          CHECK(ons >= 15 && ons <= 17, "note repeat: at 1/32 %u note-ons in a second", ons);
          (void)sim_smk37(SMK37_ENCODER, 0, -1); settle();
          (void)sim_smk37(SMK37_BUTTON, 7, 0); settle();
          { struct message m[64]; (void)drain(m, 64); }
          ons = 0;
          for (unsigned blocks = 0; blocks < 200; ++blocks) { (void)sim_render(); struct message m[64]; unsigned n = drain(m, 64);
              for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && (m[k].data[0] & 0xf0) == 0x90 && m[k].data[2]) ++ons; }
          CHECK(ons == 0 && !smk37_note_repeat() && !groove_arp_enabled(kt) && groove_arp_setting(kt, 0) == 2, "note repeat: NOTE REPEAT up: nothing repeats, the ARP is off again, the rate is 1/16 again");
          (void)sim_smk37(SMK37_KEY, 12, 0); settle();
          groove_arp_set(kt, 1);
          (void)sim_smk37(SMK37_BUTTON, 7, 1); settle();
          unsigned own = smk37_note_repeat() & (1U << kt);
          (void)sim_smk37(SMK37_BUTTON, 7, 0); settle();
          CHECK(!own && groove_arp_enabled(kt), "note repeat: a track whose ARP is on is left alone, and its ARP stays on afterwards");
          groove_arp_set(kt, 0);
          (void)sim_smk37(SMK37_BUTTON, 0, 1); settle(); (void)sim_smk37(SMK37_BUTTON, 7, 1); settle(); (void)sim_smk37(SMK37_BUTTON, 7, 0); settle(); (void)sim_smk37(SMK37_BUTTON, 0, 0); settle();
          CHECK(smk37_pad_focus() != focus0 && !smk37_note_repeat(), "focus: KNOB BANK + NOTE REPEAT switches keys / pads (%u -> %u); nothing repeats", focus0, smk37_pad_focus());
          (void)sim_smk37(SMK37_BUTTON, 0, 1); settle(); (void)sim_smk37(SMK37_BUTTON, 7, 1); settle(); (void)sim_smk37(SMK37_BUTTON, 7, 0); settle(); (void)sim_smk37(SMK37_BUTTON, 0, 0); settle();
          CHECK(smk37_pad_focus() == focus0, "focus: and back"); }
        /* ---- tabby-v04.23: the step loop: every playing track repeats the last n 16ths while it is held; the clip's clock runs on ---- */
        { CHECK(sim_song_load(SONG) == 0 && song_edit_open(0, 0) == 0 && song_edit_length(16 - (int)clip_v3_steps(song_edit_clip())) >= 0 && song_edit_note_toggle(2, 71, 100, 240) == 1 && song_edit_note_toggle(6, 64, 100, 240) == 1,
                "step loop: clip 1 open, 16 steps: 60 on step 1, 71 on step 3, 64 on step 7");
          CHECK(song_step_loop(2) == SONG_INVALID, "step loop: refused while the song is stopped");
          { struct message m[64]; (void)drain(m, 64); }
          CHECK(song_clip_launch(0, 0) == 0, "step loop: the clip reserved");
          (void)sim_song_play();
          unsigned t60[8], n60 = 0, t64[12], n64 = 0, other = 0, on_at = 0, off_at = 0, phase = 0;
          for (unsigned blocks = 0; blocks < 4000 && phase < 3; ++blocks) {
              (void)sim_render();
              struct message m[64]; unsigned n = drain(m, 64);
              for (unsigned k = 0; k < n && k < 64; ++k) if (m[k].port == 0 && m[k].data[0] == 0x94 && m[k].data[2]) {
                  if (m[k].data[1] == 60 && n60 < 8) t60[n60++] = blocks;
                  if (m[k].data[1] == 64 && n64 < 12) t64[n64++] = blocks;
                  if (phase == 1 && blocks > on_at + 2 && m[k].data[1] != 64) ++other;
              }
              if (phase == 0 && n64 == 1 && blocks == t64[0] + 10) { CHECK(song_step_loop(2) == 0, "step loop: two steps, engaged while step 7 plays"); on_at = blocks; phase = 1; }
              if (phase == 1 && n64 == 6) { (void)song_step_loop(0); off_at = blocks; phase = 2; }
              if (phase == 2 && blocks == off_at + 1500) phase = 3;
          }
          #define NEAR(a_, b_) ((a_) + 2U >= (b_) && (a_) <= (b_) + 2U)
          CHECK(n64 >= 6 && NEAR(t64[1] - t64[0], 86U) && NEAR(t64[2] - t64[1], 86U) && NEAR(t64[4] - t64[3], 86U) && other == 0,
                "step loop: the window is steps 6 and 7: 64 comes every two 16ths (%u, %u, %u blocks; 86), nothing else sounds (%u)", n64 > 1 ? t64[1] - t64[0] : 0, n64 > 2 ? t64[2] - t64[1] : 0, n64 > 4 ? t64[4] - t64[3] : 0, other);
          unsigned grid = 1; for (unsigned i = 1; i < n60; ++i) { unsigned d = (t60[i] - t60[0]) % 689U; if (!(d <= 3 || d >= 686)) grid = 0; }
          CHECK(n60 >= 3 && grid && t60[n60 - 1] > off_at, "step loop: let go, the clip is where it would have been: 60 falls on the 16-step grid it began on (%u notes)", n60);
          sim_song_stop(); settle(); settle();
          CHECK(song_step_loop(0) == 0 && song_step_looping() == 0, "step loop: off");
          #undef NEAR
          song_edit_discard(); }
        sim_midi_drain(0); sim_test_request_passes(0); (void)sim_open(0);
    }

    printf(failures ? "%d check(s) FAILED\n" : "all checks passed\n", failures);
    return failures;
}
