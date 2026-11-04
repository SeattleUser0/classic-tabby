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
 * Version: 0.6
 *
 * Revision log
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
    return n;
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
/* The block whose window holds unit position u at `tempo`: p_k = floor(k * tempo * 1024 / 11025). */
static unsigned block_of(uint64_t u, unsigned tempo)
{ return (unsigned)(((u + 1) * 11025 + tempo * 1024 - 1) / (tempo * 1024)) - 1; }
#include "v1_reference.inc"
int main(void)
{
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
        enum { REGION = 69632, LIBRARY = 516096, TUNING = 532480, OLD_DATA = 2, READY = 1 };
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
        enum { REGION = 69632, BLOCKS = REGION + 17 * 4096, POOL = 96 * 4076, FULL = 832, REC = 840 };
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
        for (unsigned b = 0; b < 96; ++b) {
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
        unsigned src = 96, dst = 96;
        for (unsigned b = 0; b < 96; ++b) {
            const uint8_t *h = flash + BLOCKS + b * 4096;
            if (!memcmp(h, "FM1B", 4) && h[6] == 2 && src == 96) src = b;
            if (h[0] == 0xff && dst == 96) dst = b;
        }
        CHECK(src < 96 && dst < 96, "found the two-record batch sector (%u) and an erased sector (%u)", src, dst);
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
        for (unsigned b = 0; b < 96; ++b) if (!memcmp(flash + BLOCKS + b * 4096, "FM1B", 4)) ++formatted;
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

    printf(failures ? "%d check(s) FAILED\n" : "all checks passed\n", failures);
    return failures;
}
