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
 *     6. a factory scene that used the sampler loads with no GROOVE_SAMPLE track.
 *
 *   Build and run through the Makefile:  make test   (or make host-smoke)
 *   Exit status is the number of failed checks (0 = pass).
 *
 * Version: 0.3
 *
 * Revision log
 *   v0.3  2026-11-02  Task 03 (d): song storage (records, blocks, rewrite, compaction) and
 *                     song playback (channel override, note timing, end, queued jump).
 *   v0.2  2026-11-02  Task 03 (a): song storage migration and sampler-removal checks.
 *   v0.1  2026-11-01  Initial version.
 */
#include <math.h>
#include <stdint.h>
#include <stdio.h>
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
int sim_factory_project(unsigned index);
int sim_import(unsigned bytes);
int sim_song_record_read(unsigned song);
int sim_song_record_write(unsigned song);
int sim_song_record_delete(unsigned song);
int sim_block_write(unsigned song, unsigned id, unsigned bytes);
int sim_block_read(unsigned song, unsigned id);
uint32_t sim_song_free(void);
uint32_t sim_song_reclaimable(void);
int sim_song_compact(void);
int sim_song_load(unsigned song);
int sim_song_play(void);
void sim_song_stop(void);
int sim_song_jump(unsigned row);
uint32_t sim_song_status(unsigned word);

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
    /* ---- 6. sampler removal: factory scene with a former sampler part ------------------- */
    {
        /* Scene 0 "NEON KEYS" used SA(BEAT) in V01; it must load as an 808 track now. */
        int r = sim_factory_project(0);
        CHECK(r == 0, "factory scene 0 built (%d)", r);
        r = sim_import(4064);
        CHECK(r == 0, "factory scene 0 imported into the simulator (%d)", r);
        const uint8_t *st8 = sim_state();
        unsigned sampler = 0, drums = 0;
        for (unsigned t = 0; t < 8; ++t) { sampler |= st8[8 + t * 20] == 5; drums |= st8[8 + t * 20] == 2; }
        CHECK(!sampler, "no track uses the sampler source");
        CHECK(drums, "the beat part plays on the 808");
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
        CHECK(r == (int)sizeof block1 && !memcmp(f, block1, sizeof block1), "block 1 reads back (%d bytes)", r);
        CHECK(sim_block_read(0, 3) < 0, "a missing block id is reported");
        block1[1] = 61; memcpy(f, block1, sizeof block1); block1[1] = 60;
        CHECK(sim_block_write(0, 1, sizeof block1) == 0, "block 1 rewritten (stale copy left behind)");
        r = sim_block_read(0, 1);
        CHECK(r == (int)sizeof block1 && f[1] == 61, "the newest copy of block 1 is live (pitch %u)", f[1]);
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
        CHECK(r == (int)sizeof block1 && f[1] == 61, "block 1 still live after compaction");
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

    printf(failures ? "%d check(s) FAILED\n" : "all checks passed\n", failures);
    return failures;
}
