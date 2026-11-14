/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
#include "instrument.h"
#include "song.h"
#include "fm1_engine_control.h"
#include "diag.h"   /* Classic Tabby Task 11: CT_DIAG_LOOP(); Task 12 A4: the loop profile (every build) */
#include <string.h>
#ifdef FM1_HOST_TEST
#include <stdatomic.h>
#define WORD _Atomic(unsigned)
#else
#define WORD volatile unsigned
#endif

/* Device preferences, not project data: 4 channel nibbles, 8 two-bit modes,
 * ports/local/clock/live flags, and Thru/source-clock fields. */
static struct groove_midi_config config;
enum { LOCAL_OFF = 8, CLOCK_OUT = 16, LIVE_OUT = 32, SEQ_OFF = 64, QUEUE = 128 };
/* Classic Tabby (Task 03 d): song owners 40..47 follow the 16 Thru channel owners. */
enum { ARP_OWNER = 8, LIVE_OWNER = 16, THRU_OWNER = 24, SONG_OWNER = 40, OWNERS = 48 };
struct events { WORD read, write, lost; unsigned seen; uint32_t data[QUEUE]; } __attribute__((aligned(32)));
/* One producer per audio owner and one for the MIDI routing task. */
static struct events events[3] __attribute__((aligned(32)));
struct output {
    uint8_t held[OWNERS][16]; /* SEQ, ARP, physical, then Thru channel owners */
    uint16_t channels, recover, sustain, sent_sustain;
    uint8_t reset, stop;
};
static struct output output[3];
#ifdef CT_A2
/* Task 17 (F + G): the due time (TIMER4 ticks, 24 MHz) of every event in lanes 0 and 1, beside the lanes. */
static uint32_t fg_due[2][QUEUE];
static uint32_t fg_stamp;             /* the due time given to the events queued now (audio interrupt) */
#endif
static unsigned ready_seen, auto_source = 3;
/* Song output-channel override per track: 0 = device OUT CH, 1..16 (Task 03 d). */
static uint8_t song_channel[8];
static uint32_t clock_seen, clock_phase;
static uint32_t resume_phase;
static unsigned clock_first, resume_first, master_running;
static uint32_t dropped;
static void release_owner(unsigned owner, unsigned ports);
#ifdef CT_A2
static void fg_start(void);
#endif
/* Boards with independent held-key state discard its old MIDI ownership when
 * routing changes. FM1's common panel already retries released keys itself. */
extern void groove_midi_panel_reset(void) __attribute__((weak));
extern void groove_midi_panel_track_reset(unsigned track) __attribute__((weak));

static FM1_AUDIO_CODE void barrier(void)
{
#ifndef FM1_HOST_TEST
    __asm__ volatile("csync" ::: "memory");
#endif
}
static unsigned size(unsigned status) { return status >= 0xf8 ? 1 : (status & 0xe0U) == 0xc0U ? 2 : 3; }
static unsigned channel(unsigned track)
{
    if (song_channel[track]) return song_channel[track] - 1U;
    return (config.channel[track >> 1] >> (4U * (track & 1U))) & 15U;
}
/* Task 06 (9.13): the track's resolved output channel (0..15): the song override or the
 * device setting, as its notes are sent. Control task, for the per-track event slices. */
unsigned groove_midi_song_track_channel(unsigned track) { return channel(track & 7U); }
FM1_AUDIO_CODE unsigned groove_midi_mode(unsigned track)
{ return (config.mode[track >> 2] >> (2U * (track & 3U))) & 3U; }
void groove_midi_defaults(struct groove_midi_config *c)
{
    static const uint8_t channels[4] = {0x10, 0x32, 0x54, 0x96};
    memcpy(c->channel, channels, sizeof channels);
    /* Product defaults: SEQ BOTH on all eight tracks, KEY OUT and SEQ OUT
     * ON. Available ports only select destinations, not the default modes.
     * Restoring valid preferences retains the user's explicit choices. */
    memset(c->mode, 0x55, sizeof c->mode);
    c->flags = (uint8_t)(fm1_midi_output_ports() | LIVE_OUT | CLOCK_OUT);
    c->thru = (fm1_midi_input_ports() & 1U) ? 0 : 8;
}
int groove_midi_config_valid(const struct groove_midi_config *c)
{
    if ((c->flags & 0x80U) || (c->thru & 0x80U) || ((c->thru >> 3) & 3U) == 3) return 0;
    for (unsigned t = 0; t < 8; ++t) if (((c->mode[t >> 2] >> (2U * (t & 3U))) & 3U) == 3) return 0;
    return 1;
}
void groove_midi_config_read(struct groove_midi_config *c) { *c = config; }
static void recover(unsigned port)
{
    struct output *o = &output[port];
    if (!o->recover) o->reset = 0;
    o->recover |= o->channels;
    o->sent_sustain = 0;
    if ((config.flags & CLOCK_OUT) && (config.flags & (1U << port))) o->stop = 1;
    memset(o->held, 0, sizeof o->held);
}
void groove_midi_panic(void)
{
    fm1_engine_pause();
    for (unsigned i = 0; i < 3; ++i) {
        events[i].read = events[i].write; events[i].seen = events[i].lost;
        output[i].sustain = 0; recover(i);
    }
    fm1_engine_resume();
}
__attribute__((cold, minsize)) void groove_midi_config_apply(const struct groove_midi_config *c)
{
    if (!memcmp(&config, c, sizeof config)) return;
    unsigned modes = (config.mode[0] ^ c->mode[0]) | ((config.mode[1] ^ c->mode[1]) << 8);
    unsigned changed = config.flags ^ c->flags;
    if (!memcmp(config.channel, c->channel, sizeof config.channel) && config.thru == c->thru &&
        !(changed & ~(SEQ_OFF | CLOCK_OUT))) {
        /* SEQ mode/output edits leave transport, ARP and live controls intact.
         * Release changed pattern gates using the OLD local/output routing. */
        fm1_engine_pause();
        ct_midi_flush();   /* Task 12 A4: an app flush, not a pass */
        for (unsigned t = 0; t < 8; ++t, modes >>= 2) {
            if (modes & 3U) groove_sequence_release(t);
            if ((changed & SEQ_OFF) || (modes & 3U)) release_owner(t, config.flags & 7U);
        }
        if ((changed & CLOCK_OUT) && (config.flags & CLOCK_OUT))
            for (unsigned p = 0; p < 3; ++p) if (config.flags & (1U << p)) output[p].stop = 1;
        config = *c; barrier();
        if ((changed & CLOCK_OUT) && !groove_clock_mode()) groove_midi_clock_reset();
        fm1_engine_resume();
        return;
    }
    fm1_engine_pause();
    fm1_engine_stop();
    groove_midi_panic();
    config = *c;
    barrier();
    groove_midi_clock_reset();
    fm1_engine_resume();
    if (groove_midi_panel_reset) groove_midi_panel_reset();
    const uint8_t reset = 0xff; (void)fm1_midi_post(&reset, 1);
}
void groove_midi_clock_reset(void)
{
    auto_source = 3; clock_phase = resume_phase = 0;
    clock_first = resume_first = 1; master_running = 0;
}
void groove_midi_init(void)
{
    memset(events, 0, sizeof events); memset(output, 0, sizeof output); memset(song_channel, 0, sizeof song_channel);
    groove_midi_defaults(&config);
    ready_seen = dropped = clock_seen = 0; groove_midi_clock_reset();
#ifdef CT_A2
    fg_start();
#endif
}
unsigned groove_midi_setting(unsigned track, unsigned parameter)
{
    switch (parameter) {
    case 0: return groove_midi_mode(track);
    case 1: return channel(track);
    case 2: return config.flags & 7U;
    case 3: return !(config.flags & LOCAL_OFF);
    case 4: return !!(config.flags & LIVE_OUT);
    case 5: return !!(config.flags & CLOCK_OUT);
    case 6: return (config.thru >> 5) & 3U;
    case 7: return (config.thru >> 3) & 3U;
    case 8: return config.thru & 7U;
    case 9: return (config.flags & SEQ_OFF) ? ((config.flags & CLOCK_OUT) ? 2 : 0) : 1;
    default: return 0;
    }
}
static FM1_AUDIO_CODE void enqueue(unsigned lane, unsigned owner, unsigned ports, unsigned status, unsigned a, unsigned b)
{
    /* Song events travel without ports when only the local engine listens. */
    if (!ports && status != 0xf6 && owner < SONG_OWNER) return;
    struct events *q = &events[lane];
    unsigned w = q->write;
    if (w - q->read == QUEUE) { ++q->lost; return; }
    /* MIDI data bytes are seven-bit. Their spare bit stores owner bit 5,
     * keeping the fixed-size queue and three destination bits unchanged. */
    q->data[w & (QUEUE - 1)] = status | (a << 8) | (b << 16) |
        ((owner & 31U) << 24) | ((owner & 32U) << 18) | (ports << 29);
#ifdef CT_A2
    if (lane < 2) fg_due[lane][w & (QUEUE - 1)] = fg_stamp;
#endif
    barrier(); q->write = w + 1U;
}
FM1_AUDIO_CODE void groove_midi_note(unsigned track, unsigned note, unsigned velocity)
{
    if ((config.flags & SEQ_OFF) || !groove_midi_mode(track)) return;
    enqueue(track & 1U, track, config.flags & 7U, (velocity ? 0x90U : 0x80U) | channel(track), note, velocity);
}
/* Song sequencer notes (Task 03 d): same SEQ mode rules as pattern notes for MIDI out
 * (mode LOCAL or SEQ OUT off sends nothing); the local engine copy is posted when the
 * lane is drained (song_local), so the event is queued even without ports. Task 05: every
 * song note goes into lane 0 (with the row events), so the drain keeps the tick's
 * time order across tracks; the stock sequencer's lane split is unchanged. */
FM1_AUDIO_CODE void groove_midi_song_note(unsigned track, unsigned note, unsigned velocity)
{
    unsigned ports = ((config.flags & SEQ_OFF) || !groove_midi_mode(track)) ? 0 : config.flags & 7U;
    enqueue(0, SONG_OWNER + track, ports, (velocity ? 0x90U : 0x80U) | channel(track), note, velocity);
}
/* Row events (Task 04, 9.11): a channel message for a MIDI channel, not a track. The
 * channel's thru owner (24..39) gives the channel back at delivery (owner_channel), every
 * port is a destination, and lane 0 drains before the note lanes, so an event enqueued in
 * the tick before play_step() leaves before that tick's notes. Program and control
 * messages touch no held-note map. No local-engine copy: events target external gear. */
FM1_AUDIO_CODE void groove_midi_song_event(unsigned channel, unsigned status, unsigned a, unsigned b)
{
    enqueue(0, THRU_OWNER + (channel & 15U), 7, status | (channel & 15U), a, b);
}
FM1_AUDIO_CODE void groove_midi_arp_note(unsigned track, unsigned note, unsigned velocity)
{
    enqueue(track & 1U, ARP_OWNER + track, config.flags & 7U,
            (velocity ? 0x90U : 0x80U) | channel(track), note, velocity);
}
FM1_AUDIO_CODE void groove_midi_track_reset(unsigned track)
{ enqueue(track & 1U, track, config.flags & 7U, 0xf6, 0, 0); }
FM1_AUDIO_CODE void groove_midi_transport(unsigned owner, uint8_t status)
{
    if (owner || !(config.flags & CLOCK_OUT) || groove_clock_mode()) return;
    if (status == 0xfa || status == 0xff) {
        clock_phase = resume_phase = 0; clock_first = resume_first = 1;
        master_running = status == 0xfa;
        enqueue(0, 0, config.flags & 7U, 0xf2, 0, 0);
    } else if (status == 0xfb) {
        /* Free-running clocks during Stop must not move the paused musical
         * phase. Continue resumes its remaining fraction of a MIDI pulse. */
        if (!master_running) { clock_phase = resume_phase; clock_first = resume_first; }
        master_running = 1;
    } else if (status == 0xfc && master_running) {
        resume_phase = clock_phase; resume_first = clock_first; master_running = 0;
    }
    enqueue(0, 0, config.flags & 7U, status == 0xff ? 0xfc : status, 0, 0);
}
#ifdef CT_A2
/* ---- Classic Tabby Task 15 Step 4: option A2, the control pass on demand (diag builds only) ----
 * Revision notes
 *   v0.4  2026-11-13  Task 17: options F + G (the timer and the look-ahead, below); the USB pusher of v0.3 removed
 *                     (the fault it answered was in the NUC's tool, BUILD 36.5).
 *   v0.3  2026-11-12  Task 16: the USB pusher (ct_midi_send_port, usb_pusher; BUILD 35).
 *   v0.2  2026-11-12  Task 16: ct_flash_busy: no request while an app flash erase or write runs (BUILD 34); the A2
 *                     page is 52 bytes (blocks skipped).
 *   v0.1  2026-11-10  First version. Built only with CT_A2 (tools/linux/build.py --a2, Makefile
 *                     A2=1; the host tests always have it). Off at boot; switched at run time
 *                     (ACTIONS "A2 FAST MIDI", or transfer command 25 requests 8 = off, 9 = on).
 *
 * What it does. The song tick runs in the audio interrupt (fm1_audio_irq, IRQ 11) and can only
 * queue notes into the lock-free lanes; the control pass that sends them runs on the SDK's 10 ms
 * timer, so a note waits 0..10 ms (BUILD.md 26.9). With A2 on, the audio interrupt asks the SDK
 * for a control pass (fm1_control_request, sdk/include/fm1.h) in every block that ends with an
 * event still waiting in lane 0 or 1. The pass starts with the router flush, so the note leaves
 * about one task switch after the audio interrupt returns.
 *
 * Why the call is allowed here (BUILD.md 28.2 and 28.4 have the evidence): this SDK's kernel
 * masks every interrupt in its critical sections, defers the task switch to a soft interrupt,
 * and its own interrupt handlers post to task queues through the same __os_taskq_post.
 *
 * Rules kept here:
 *   - At most ONE request per audio block, never a loop. The SDK drops a request made while a
 *     pass waits or runs (its control_pending flag); the retry is simply the next block's
 *     request, while events still wait ("retries" counts the requests made while nothing had
 *     been drained since the block before asked).
 *   - Every call is timed with TIMER4 (24 MHz) inside the interrupt: count, sum, longest and a
 *     histogram, read by command 25 request 7 (ct_a2_read). The time is part of the audio
 *     render's budget (CPU GUARD), which is why it is measured.
 *   - No request is ever made with A2 off: the build then behaves as the normal build does. */
volatile uint8_t ct_flash_busy;   /* depth of app flash erases / writes in progress (RAM: read by the audio interrupt) */
static volatile uint8_t a2_on = 1, a2_reset_request;   /* Task 16: ON at boot (tabby-v04.2) */
static struct {
    uint32_t blocks;      /* audio blocks seen (one per 128 frames): the time base for calls per second */
    uint32_t calls;       /* fm1_control_request calls made from the audio interrupt */
    uint32_t retries;     /* of those, repeats: the block before asked and nothing was drained since */
    uint32_t max;         /* longest call, TIMER4 ticks */
    uint32_t bins[6];     /* calls < 5, < 10, < 20, < 50, < 100, >= 100 microseconds */
    uint64_t sum;         /* ticks of all calls */
    uint32_t skipped;     /* blocks that did not ask because a flash erase or write was running (ct_flash_busy) */
    uint8_t waiting;      /* the previous block asked */
    unsigned drained;     /* the lanes' read positions when it asked */
} a2;
/* ---- Classic Tabby Task 17: options F + G, the timer and the look-ahead ----------------------------
 * A2 alone sends a note when the audio block that found it ends: one block (2.9 ms) of quantization, and
 * a request that arrives while a pass paints the screen is dropped and repeated a block later (BUILD 35.4:
 * the band depended on the page shown). F + G:
 *   G  every event queued by the audio interrupt carries a due time on the 24 MHz counter (TIMER4):
 *      the time the block's interrupt began + one block (the look-ahead) + the event's place inside the
 *      block's window (the song tick's `at` of `adv` units, groove_midi_at; the MIDI clock's phase). So
 *      MIDI out is one block later than with A2, the same for every event, and no longer block-quantized.
 *   F  TIMER5 (free until now, IRQ 63) fires every FG_PERIOD ticks (0.5 ms). Its handler, RAM code, asks
 *      for a control pass (fm1_control_request) when the head of lane 0 or 1 is due within FG_LEAD; the
 *      pass sends the events that are due and leaves the others. A request the SDK drops (a pass runs)
 *      is repeated by the next timer tick, 0.5 ms later, not a block later.
 * The timer interrupt has priority 3, below the audio interrupt (4): a task cannot run while the audio
 * interrupt renders, so a higher priority would gain nothing and would interrupt the render.
 * Flash: the SDK's flash driver masks every interrupt for the whole of each SPI operation
 * (enter_spi_code -> cpu_enter_sfc_critical -> __local_irq_disable; BUILD 36.2), so this handler never
 * runs while flash is unreadable; the ct_flash_busy test is kept (it costs one load).
 * If the timer does not tick (fg.ticks stands still for a block) the block falls back to A2: it asks
 * itself and stamps no look-ahead. The host tests have no timer: they start F + G with ct_fg_test()
 * and call ct_fg_tick() themselves; the web simulator is built without CT_A2. */
enum { FG_PERIOD = 12000, FG_LEAD = FG_PERIOD / 2, FG_BLOCK = 69632, FG_FAR = 4 * FG_BLOCK };
volatile uint32_t ct_fg_irq_ticks;    /* TIMER4 at the entry of the audio interrupt (app/board/audio.c) */
static volatile uint8_t fg_run;       /* the timer was started */
static uint8_t fg_live;               /* this block: the timer ticks, events get the look-ahead */
static uint32_t fg_base, fg_len = FG_BLOCK, fg_block_at, fg_ticks_seen;
static struct {
    uint32_t ticks;       /* timer interrupts */
    uint32_t sent;        /* events sent with a due time */
    uint32_t late_max;    /* the latest send after its due time, ticks */
    uint32_t late[6];     /* sent < 0.25, < 0.5, < 1, < 2, < 4, >= 4 ms after the due time (early counts as < 0.25) */
} fg;
static FM1_AUDIO_CODE uint32_t a2_ticks(void);
/* Audio interrupt, at the start of the block's clock hook: the block's time and length, the base stamp. */
static FM1_AUDIO_CODE void fg_block(void)
{
#ifdef FM1_HOST_TEST
    uint32_t t = a2_ticks();
#else
    uint32_t t = ct_fg_irq_ticks;
#endif
    uint32_t interval = t - fg_block_at;
    if (interval > FG_BLOCK - FG_BLOCK / 8 && interval < FG_BLOCK + FG_BLOCK / 8)
        fg_len = (uint32_t)((int32_t)fg_len + ((int32_t)interval - (int32_t)fg_len) / 8);
    fg_block_at = t;
    fg_live = fg_run && a2_on && fg.ticks != fg_ticks_seen;
    fg_ticks_seen = fg.ticks;
    fg_base = fg_live ? t + fg_len : t;
    fg_stamp = fg_base;
}
/* Audio interrupt: the events queued from now on are due `num` / `den` of a block after the block's
 * start (plus the look-ahead). den = 0 or F + G off: the block's start. */
FM1_AUDIO_CODE void groove_midi_at(unsigned num, unsigned den)
{
    fg_stamp = fg_live && den ? fg_base + (uint32_t)((uint64_t)fg_len * num / den) : fg_base;
}
/* Audio interrupt: no look-ahead for the events queued from now on (the first block of a follow song:
 * the master's first pulse cannot be anticipated). */
FM1_AUDIO_CODE void groove_midi_immediate(void) { fg_stamp = fg_block_at; }
FM1_AUDIO_CODE unsigned groove_midi_live(void) { return fg_live; }
static FM1_AUDIO_CODE uint32_t a2_ticks(void)
{
#ifdef FM1_HOST_TEST
    return ct_diag_ticks();
#else
    return *(volatile uint32_t *)0x10804U;   /* TIMER4 count (app/board/smk37_hw.h), no call */
#endif
}
/* Audio interrupt, once per block, after the song tick and the MIDI clock. */
static FM1_AUDIO_CODE void a2_block(void)
{
    if (a2_reset_request) {
        /* Field by field: no libc call from the audio interrupt. */
        a2.blocks = a2.calls = a2.retries = a2.max = a2.skipped = 0; a2.sum = 0;
        for (unsigned i = 0; i < 6; ++i) a2.bins[i] = 0;
        a2_reset_request = 0;
    }
    ++a2.blocks;
    /* Task 16 hang fix: fm1_control_request and the SDK's task-queue post (os_taskq_post_type,
     * __os_taskq_post, xQueueGenericSendFromISR, get_taskq) are in FLASH (.text / .os_code,
     * build/pro/sdk.map) while this interrupt and the render are in RAM and keep running during a
     * flash erase or write. A call made then fetches code from flash that the SPI controller is busy
     * with: the chip freezes (BUILD 33.3, 34). Every app flash operation sets ct_flash_busy first. */
    if (ct_flash_busy) { ++a2.skipped; return; }
    if (fg_live) return;                     /* Task 17: the timer asks, at the due time */
    if (!a2_on || (events[0].write == events[0].read && events[1].write == events[1].read)) { a2.waiting = 0; return; }
    unsigned drained = events[0].read + events[1].read;
    if (a2.waiting && drained == a2.drained) ++a2.retries;   /* the last request got no pass yet */
    a2.waiting = 1; a2.drained = drained;
    uint32_t t0 = a2_ticks();
    fm1_control_request();                   /* the one call of this block */
    uint32_t dt = a2_ticks() - t0;
    ++a2.calls; a2.sum += dt;
    if (dt > a2.max) a2.max = dt;
    ++a2.bins[dt < 120U ? 0 : dt < 240U ? 1 : dt < 480U ? 2 : dt < 1200U ? 3 : dt < 2400U ? 4 : 5];
}
/* Task 17 (F): one timer tick. TIMER5 interrupt on the device (RAM code); the host tests call it. */
FM1_AUDIO_CODE void ct_fg_tick(void)
{
    ++fg.ticks;
    if (ct_flash_busy) { ++a2.skipped; return; }
    if (!a2_on) return;
    uint32_t now = a2_ticks();
    unsigned ask = 0;
    for (unsigned i = 0; i < 2; ++i) {
        unsigned r = events[i].read;
        if (r == events[i].write) continue;
        int32_t wait = (int32_t)(fg_due[i][r & (QUEUE - 1)] - now);
        if (wait <= FG_LEAD || wait > FG_FAR) ask = 1;
    }
    if (!ask) { a2.waiting = 0; return; }
    unsigned drained = events[0].read + events[1].read;
    if (a2.waiting && drained == a2.drained) ++a2.retries;   /* the last request got no pass yet */
    a2.waiting = 1; a2.drained = drained;
    fm1_control_request();
    uint32_t dt = a2_ticks() - now;
    ++a2.calls; a2.sum += dt;
    if (dt > a2.max) a2.max = dt;
    ++a2.bins[dt < 120U ? 0 : dt < 240U ? 1 : dt < 480U ? 2 : dt < 1200U ? 3 : dt < 2400U ? 4 : 5];
}
#ifndef FM1_HOST_TEST
#define FG_T5_CON (*(volatile uint32_t *)0x10900U)   /* TIMER5: CON, CNT, PRD as TIMER4 at 0x10800 (app/board/scan.c) */
#define FG_T5_CNT (*(volatile uint32_t *)0x10904U)
#define FG_T5_PRD (*(volatile uint32_t *)0x10908U)
static FM1_AUDIO_CODE __attribute__((interrupt(""))) void fg_timer_isr(void)
{
    FG_T5_CON |= 1U << 14;                   /* clear the pending bit */
    ct_fg_tick();
}
extern void fm1_device_irq_attach(unsigned index, void (*handler)(void), unsigned priority);
#endif
/* Control task, once at boot (groove_midi_init): TIMER5 counts the 24 MHz clock as TIMER4 does (CON
 * 0x4009: count mode, the same source, pending cleared) and interrupts every FG_PERIOD ticks. */
static void fg_start(void)
{
#ifndef FM1_HOST_TEST
    FG_T5_CON = 1U << 14; FG_T5_CNT = 0; FG_T5_PRD = FG_PERIOD;
    fm1_device_irq_attach(63, fg_timer_isr, 3);
    FG_T5_CON = 0x4009U;
    fg_run = 1;
#endif
}
#ifdef FM1_HOST_TEST
void ct_fg_test(unsigned on) { fg_run = on ? 1 : 0; }
#endif
/* Command 25 request 10 (56 bytes, u32 LE): F + G running (0/1), timer interrupts, events sent with a
 * due time, the latest send after its due time (ticks), six bins of that lateness (< 0.25, < 0.5, < 1,
 * < 2, < 4, >= 4 ms), the block length (ticks), the timer period (ticks), the look-ahead in use (0/1). */
int ct_fg_read(uint8_t *out)
{
    uint32_t v[14] = { fg_run, fg.ticks, fg.sent, fg.late_max, 0, 0, 0, 0, 0, 0, fg_len, FG_PERIOD, fg_live, 0 };
    for (unsigned i = 0; i < 6; ++i) v[4 + i] = fg.late[i];
    for (unsigned i = 0; i < 14; ++i) for (unsigned b = 0; b < 4; ++b) out[i * 4 + b] = (uint8_t)(v[i] >> (8U * b));
    return 56;
}
static volatile uint8_t fg_reset_request;
/* Control task (the screen painter, before it starts a band): 1 when an event in lane 0 or 1 is due within
 * `ticks` from now, while F + G is live. A band takes 2 to 6 ms and cannot be interrupted; one that would
 * run over a due time waits for the pass after the event (app/screen.c paint_flush). */
unsigned ct_midi_due_within(uint32_t ticks)
{
    if (!fg_live) return 0;
    uint32_t now = a2_ticks();
    for (unsigned i = 0; i < 2; ++i) {
        unsigned r = events[i].read;
        if (r == events[i].write) continue;
        int32_t wait = (int32_t)(fg_due[i][r & (QUEUE - 1)] - now);
        if (wait <= (int32_t)ticks || wait > FG_FAR) return 1;
    }
    return 0;
}
/* Control task. */
void ct_a2_set(unsigned on) { a2_on = on ? 1 : 0; barrier(); }
unsigned ct_a2_get(void) { return a2_on; }
void ct_a2_reset(void) { a2_reset_request = 1; fg_reset_request = 1; barrier(); }
/* Command 25 request 7 (48 bytes, little-endian u32): on (0/1), audio blocks, calls, mean call
 * ticks, longest call ticks, retries, then the six histogram bins. Calls per second =
 * calls * 44118 / (blocks * 128). The snapshot is repeated until no block ended inside it. */
int ct_a2_read(uint8_t *out)
{
    uint32_t v[13], blocks;
    do {
        blocks = a2.blocks;
        v[0] = a2_on; v[1] = blocks; v[12] = a2.skipped; v[2] = a2.calls;
        v[3] = v[2] ? (uint32_t)(a2.sum / v[2]) : 0; v[4] = a2.max; v[5] = a2.retries;
        for (unsigned i = 0; i < 6; ++i) v[6 + i] = a2.bins[i];
    } while (blocks != a2.blocks);
    for (unsigned i = 0; i < 13; ++i) for (unsigned b = 0; b < 4; ++b) out[i * 4 + b] = (uint8_t)(v[i] >> (8U * b));
    return 52;
}
#endif   /* CT_A2 */
#ifdef CT_A2
/* Task 15 (A2): the block's work is this body; the wrapper below asks for the pass after it, so
 * the block's clock byte (queued at the end of the body) is covered by the same request. The
 * normal build compiles the body as groove_midi_clock itself, unchanged. */
static FM1_AUDIO_CODE void midi_clock_body(unsigned owner, unsigned tempo)
#else
FM1_AUDIO_CODE void groove_midi_clock(unsigned owner, unsigned tempo)
#endif
{
    if (!owner) {
#ifdef CT_A2
        fg_block();    /* Task 17: this block's time; the events of the block get their due times from it */
#endif
        /* Task 03 d: the song sequencer ticks here, once per block, with the song's
         * tempo override (if any) so the MIDI clock below follows the same tempo. */
        unsigned song = song_tempo();
        if (song) tempo = song;
        song_tick(tempo);
#ifdef CT_A2
        fg_stamp = fg_base;
#endif
    }
    if (owner || !(config.flags & CLOCK_OUT) || groove_clock_mode()) return;
    enum { PERIOD = FM1_SAMPLE_RATE * 60U };
    if (clock_first || clock_phase >= PERIOD) {
#ifdef CT_A2
        /* Task 17: the pulse was due before this block began, by (phase - PERIOD) of the phase one block
         * adds; with the look-ahead of one block its due time is that much before base. A song note
         * at the same musical time gets the same due time (BUILD 36.1). */
        if (fg_live && !clock_first) {
            uint32_t step = tempo * 24U * FM1_BLOCK_FRAMES, over = clock_phase - PERIOD;
            if (over < step) fg_stamp = fg_base - (uint32_t)((uint64_t)fg_len * over / step);
        }
#endif
        if (!clock_first) clock_phase -= PERIOD;
        clock_first = 0;
        enqueue(0, 0, config.flags & 7U, 0xf8, 0, 0);
#ifdef CT_A2
        fg_stamp = fg_base;
#endif
    }
    clock_phase += tempo * 24U * FM1_BLOCK_FRAMES;
}
#ifdef CT_A2
FM1_AUDIO_CODE void groove_midi_clock(unsigned owner, unsigned tempo)
{
    midi_clock_body(owner, tempo);
    if (!owner) a2_block();   /* Task 15 (A2): at most one pass request per block, see above */
}
#endif
static unsigned owner_channel(unsigned owner)
{ return owner < THRU_OWNER || owner >= SONG_OWNER ? channel(owner & 7U) : owner - THRU_OWNER; }
static int held_elsewhere(const struct output *o, unsigned owner, unsigned ch, unsigned note)
{
    /* Thru has exactly one owner per channel; the other fifteen cannot
     * share this note. SEQ, ARP and physical owners use track maps. */
    unsigned thru = THRU_OWNER + ch;
    if (owner != thru && (o->held[thru][note >> 3] & (1U << (note & 7U)))) return 1;
    for (unsigned i = 0; i < OWNERS; ++i) {
        if (i >= THRU_OWNER && i < SONG_OWNER) continue;
        if (i != owner && (o->held[i][note >> 3] & (1U << (note & 7U))) && owner_channel(i) == ch) return 1;
    }
    return 0;
}
/* Task 16 added a "USB pusher" here (one 0xF9 after a USB write when no clock went out on USB) for replies
 * that "never arrived with CLOCK = MIDI". Task 17 found the fault in the measuring tool on the NUC, not in the
 * device (tools/linux/hw/tabby_link.py v0.11, BUILD 36.5): the pusher is removed in tabby-v04.4. Every app
 * write still goes through this one function. */
int ct_midi_send_port(unsigned port, const uint8_t *m, size_t n) { return fm1_midi_send_port(port, m, n); }
static void deliver(unsigned port, unsigned owner, const uint8_t *m)
{
    struct output *o = &output[port];
    unsigned ch = m[0] & 15U, type = m[0] & 0xf0U, note = m[1], bit = 1U << (note & 7U);
    if (o->recover || o->stop) return;
    if (m[0] < 0xf0) o->channels |= (uint16_t)(1U << ch);
    if (type == 0x90 || type == 0x80) {
        uint8_t *held = &o->held[owner][note >> 3];
        unsigned on = type == 0x90 && m[2];
        unsigned drum = owner < THRU_OWNER && groove_pad_count(owner & 7U);
        if (!!(*held & bit) == !!on && !(on && drum)) return;
        if (on) *held |= bit; else *held &= ~bit;
        if (held_elsewhere(o, owner, ch, note) && !(on && drum)) return;
        if (on && (o->sustain & (1U << ch)) && !(o->sent_sustain & (1U << ch))) {
            uint8_t pedal[3] = {(uint8_t)(0xb0 | ch), 64, 127};
            if (ct_midi_send_port(port, pedal, 3)) { recover(port); ++dropped; return; }
            o->sent_sustain |= (uint16_t)(1U << ch);
        }
    }
    if (ct_midi_send_port(port, m, size(m[0]))) { recover(port); ++dropped; }
    else if (type == 0xb0 && m[1] == 64) {
        if (m[2] >= 64) o->sent_sustain |= (uint16_t)(1U << ch);
        else o->sent_sustain &= (uint16_t)~(1U << ch);
    } else if (type == 0xb0 && (m[1] == 120 || m[1] == 123)) {
        for (unsigned i = 0; i < OWNERS; ++i) if (owner_channel(i) == ch) memset(o->held[i], 0, 16);
    } else if (type == 0xb0 && m[1] == 121) {
        o->sent_sustain &= (uint16_t)~(1U << ch);
    }
}
static void send_event(unsigned owner, unsigned ports, const uint8_t *in)
{
    /* The channel is resolved at delivery from the owner, not from the queued status
     * byte: an event queued just before a song channel override changed still goes
     * where its note-off will go (Task 03 d). Thru owners already carry their channel. */
    uint8_t m[3] = {in[0], in[1], in[2]};
    if (m[0] < 0xf0) m[0] = (uint8_t)((m[0] & 0xf0U) | owner_channel(owner));
    for (unsigned p = 0; p < 3; ++p) if (ports & (1U << p)) {
        /* Desired state must follow a controller reset even if the port is
         * disconnected or congested; recovery must not revive an old pedal. */
        if ((m[0] & 0xf0U) == 0xb0 && (m[1] == 64 || m[1] == 121)) {
            unsigned bit = 1U << (m[0] & 15U);
            if (m[1] == 64 && m[2] >= 64) output[p].sustain |= bit; else output[p].sustain &= ~bit;
        }
        if (ready_seen & (1U << p)) deliver(p, owner, m);
    }
}
static void release_owner(unsigned owner, unsigned ports)
{
    unsigned ch = owner_channel(owner);
    for (unsigned p = 0; p < 3; ++p) if (ports & (1U << p)) {
        for (unsigned byte = 0; byte < 16; ++byte) {
            unsigned held = output[p].held[owner][byte];
            while (held) {
                unsigned bit = (unsigned)__builtin_ctz(held);
                held &= held - 1;
                uint8_t off[3] = {(uint8_t)(0x80 | ch), (uint8_t)(byte * 8 + bit), 0};
                deliver(p, owner, off);
            }
        }
    }
}
/* Local engine copy of a song note: the track's input channel, when Local Control is
 * on, the track's SEQ mode is not MIDI-only and the track is not OFF (Task 03 d). */
static void song_local(unsigned track, const uint8_t *m)
{
    if ((config.flags & LOCAL_OFF) || groove_midi_mode(track) == 2 || groove_track_role(track) == GROOVE_TRACK_OFF) return;
    uint8_t local[3] = {(uint8_t)((m[0] & 0xf0U) | groove_midi_input_channel(track)), m[1], m[2]};
    (void)fm1_midi_post(local, 3);
}
/* Song output-channel override (assessment 9.5 v0.3). Called on the control task with
 * the lanes drained; every note still held by any owner of a track whose channel
 * changes is released on the old channel first, then the new channel applies. */
void groove_midi_song_channels(const uint8_t *channels)
{
    for (unsigned t = 0; t < 8; ++t) {
        unsigned next = channels ? channels[t] : 0;
        if (next == song_channel[t]) continue;
        release_owner(t, config.flags & 7U);
        release_owner(ARP_OWNER + t, config.flags & 7U);
        release_owner(LIVE_OWNER + t, config.flags & 7U);
        release_owner(SONG_OWNER + t, config.flags & 7U);
        song_channel[t] = (uint8_t)next;
        barrier();
    }
}
/* Task 12 A4: the SDK calls groove_midi_poll() once per control pass, so that call marks the pass
 * boundary of the loop profile (app/diag.h). The app's own flushes (panel snapshot, a played note,
 * song start and stop, a MIDI setting change) call ct_midi_flush(): the same router work, counted in
 * the ROUTER section, without a boundary. L.1 (CT_DIAG_LOOP) still counts every flush, as in Task 11,
 * so its numbers stay comparable with the Task 11B hardware runs. */
static void midi_poll_body(void);
void groove_midi_poll(void)
{
    ct_prof_pass();
    ct_midi_flush();
}
void ct_midi_flush(void)
{
    ct_prof_enter(CT_PROF_ROUTER);
    midi_poll_body();
    ct_prof_leave();
}
static void midi_poll_body(void)
{
    CT_DIAG_LOOP();   /* Task 11 (L.1): this call sends MIDI out; its period is the control loop's */
    unsigned ready = fm1_midi_ready_ports();
    for (unsigned p = 0; p < 3; ++p) {
        if ((ready_seen & ~ready) & (1U << p)) recover(p);
        if (!(ready & (1U << p))) continue;
        struct output *o = &output[p];
        if (o->stop) {
            const uint8_t stop = 0xfc;
            if (ct_midi_send_port(p, &stop, 1)) continue;
            o->stop = 0;
        }
        /* Recovery is bounded and independent per port. Retain desired pedal
         * state, restoring it only before a subsequent accepted Note On. */
        for (unsigned work = 0; work < 16 && o->recover; ++work) {
            unsigned ch = (unsigned)__builtin_ctz(o->recover);
            static const uint8_t neutral[5][3] = {{0xb0,64,0},{0xb0,120,0},{0xb0,1,0},{0xe0,0,64},{0xd0,0,0}};
            uint8_t m[3]; memcpy(m, neutral[o->reset], 3); m[0] |= ch;
            if (ct_midi_send_port(p, m, size(m[0]))) break;
            if (++o->reset == 5) { o->reset = 0; o->recover &= (uint16_t)~(1U << ch); o->channels &= (uint16_t)~(1U << ch); }
        }
    }
    ready_seen = ready;
    for (unsigned i = 0; i < 3; ++i) {
        struct events *q = &events[i];
        if (q->lost != q->seen) {
            dropped += q->lost - q->seen; q->seen = q->lost;
            q->read = q->write;
            for (unsigned p = 0; p < 3; ++p) recover(p);
        }
    }
    /* Round robin: a dense chord on one owner cannot starve the other's gates
     * or source-routed Thru. Maximum work per control iteration is fixed. */
#ifdef CT_A2
    if (fg_reset_request) { fg_reset_request = 0; fg.sent = fg.late_max = 0; memset(fg.late, 0, sizeof fg.late); }
#endif
    for (unsigned work = 0; work < QUEUE; ++work) {
        unsigned found = 0;
        for (unsigned i = 0; i < 3; ++i) {
            struct events *q = &events[i]; unsigned r = q->read;
            if (r == q->write) continue;
#ifdef CT_A2
            if (i < 2) {
                /* Task 17 (G): an event leaves when it is due (within FG_LEAD); the lane keeps its order,
                 * so an event behind one that is not due waits with it. A due time further away than
                 * FG_FAR is not believed and the event leaves at once. */
                int32_t wait = (int32_t)(fg_due[i][r & (QUEUE - 1)] - a2_ticks());
                if (wait > FG_LEAD && wait <= FG_FAR) continue;
                if (fg_live) {
                    uint32_t late = wait < 0 ? (uint32_t)-wait : 0;
                    ++fg.sent; if (late > fg.late_max) fg.late_max = late;
                    ++fg.late[late < 6000U ? 0 : late < 12000U ? 1 : late < 24000U ? 2 : late < 48000U ? 3 : late < 96000U ? 4 : 5];
                }
            }
#endif
            barrier(); uint32_t event = q->data[r & (QUEUE - 1)]; barrier(); q->read = r + 1;
            unsigned owner = ((event >> 24) & 31U) | ((event >> 18) & 32U), ports = event >> 29;
            uint8_t m[3] = {(uint8_t)event, (uint8_t)(event >> 8), (uint8_t)((event >> 16) & 127U)};
            if (m[0] == 0xff) {
                for (unsigned p = 0; p < 3; ++p) if (ports & (1U << p)) { output[p].sustain = 0; recover(p); }
                if (groove_midi_panel_reset) groove_midi_panel_reset();
            }
            else if (m[0] == 0xf6) {
                if (owner < ARP_OWNER) release_owner(owner, ports);
                owner &= 7U;
                release_owner(owner + ARP_OWNER, ports);
                release_owner(owner + LIVE_OWNER, ports);
                if (groove_midi_panel_track_reset) groove_midi_panel_track_reset(owner);
            }
            else {
                if (owner >= SONG_OWNER) song_local(owner & 7U, m);
                if (ports) send_event(owner, ports, m);
            }
            found = 1;
        }
        if (!found) break;
    }
}
int groove_midi_local(const uint8_t *m, size_t n)
{
    if (!m || !n || n > 3 || m[0] < 0x80 || (n > 1 && m[1] >= 128) || (n > 2 && m[2] >= 128)) return -1;
    if (m[0] >= 0xf0) {
        if (m[0] == 0xff) groove_midi_panic();
        return fm1_midi_post(m, n);
    }
    unsigned ch = m[0] & 15U, targets = 0;
    if (n != size(m[0])) return -1;
    for (unsigned t=0;t<GROOVE_TRACKS;++t)
        if (groove_track_role(t) != GROOVE_TRACK_OFF && groove_midi_input_channel(t)==ch) targets |= 1U<<t;
    /* An Off/unmapped channel is intentionally silent, not a queue failure.
     * The panel interprets failure as a lost key and performs a global reset. */
    if (!targets) return 0;
    int result = (config.flags & LOCAL_OFF) ? 0 : fm1_midi_post(m, n);
    if (result) { groove_midi_panic(); return result; }
    if (!(config.flags & LIVE_OUT)) return 0;
    unsigned note = (m[0] & 0xe0U) == 0x80U, sent_channels = 0;
    for (unsigned track=0;track<GROOVE_TRACKS;++track) if (targets & (1U<<track)) {
        /* Suppress raw keys only while this ARP actually owns note output. */
        if (note && !(config.flags & LOCAL_OFF) && groove_arp_enabled(track)) continue;
        unsigned out = channel(track), bit = 1U << out;
        /* Layered tracks share channel controls, but each retains its own
         * note ownership so releasing one layer cannot cut off another. */
        if (!note && (sent_channels & bit)) continue;
        sent_channels |= bit;
        uint8_t data[3] = {(uint8_t)((m[0] & 0xf0U) | out), m[1], n > 2 ? m[2] : 0};
        send_event(LIVE_OWNER + track, config.flags & 7U, data);
    }
    return 0;
}
void groove_midi_fader(unsigned track, unsigned value)
{
    if (!(config.flags & LIVE_OUT)) return;
    uint8_t m[3] = {(uint8_t)(0xb0U | channel(track)), 7, (uint8_t)value};
    send_event(LIVE_OWNER + track, config.flags & 7U, m);
}
int groove_midi_clock_accept(unsigned source, uint8_t status)
{
    if (source >= 3) return 0;
    if (!groove_clock_mode()) return !(config.flags & CLOCK_OUT); /* legacy remote transport */
    unsigned choice = (config.thru >> 5) & 3U;
    if (choice) return source == (choice == 3 ? FM1_MIDI_DIN : choice);
    uint32_t now = fm1_millis();
    if (status == 0xf8 || status == 0xfa || status == 0xfb || status == 0xf2) {
        if (auto_source == 3 || now - clock_seen >= 2000U) auto_source = source;
        if (auto_source == source) clock_seen = now;
    }
    return source == auto_source;
}
/* Task 12 A4: the routing task's MIDI input callback is timed (ct_prof_midi_in), apart from the pass. */
static void midi_received_body(unsigned source, const uint8_t *m, size_t n);
void fm1_app_midi_received(unsigned source, const uint8_t *m, size_t n)
{
    uint32_t t = ct_diag_ticks();
    midi_received_body(source, m, n);
    ct_prof_midi_in(ct_diag_ticks() - t);
}
static void midi_received_body(unsigned source, const uint8_t *m, size_t n)
{
    if (source >= 3 || !m || !n || n > 3) return;
    unsigned clock = m[0] == 0xf8 || m[0] == 0xfa || m[0] == 0xfb || m[0] == 0xfc || m[0] == 0xf2;
    unsigned taken = 0;
    if (clock) {
        if (!groove_midi_clock_accept(source, m[0])) return;
        taken = song_clock_in(m[0], n > 1 ? m[1] : 0, n > 2 ? m[2] : 0);   /* Task 16: a follow song takes the clock */
    }
    if (!taken) (void)fm1_midi_post(m, n);
    if (m[0] == 0xff) enqueue(2, 0, (config.flags | config.thru) & 7U, 0xff, 0, 0);
    if (((config.thru >> 3) & 3U) == source && m[0] != 0xff && (m[0] < 0xf0 || clock)) {
        unsigned ports = config.thru & 7U & ~(1U << source) & fm1_midi_output_ports();
        enqueue(2, THRU_OWNER + (m[0] & 15U), ports, m[0], n > 1 ? m[1] : 0, n > 2 ? m[2] : 0);
    }
}
uint32_t groove_midi_dropped(void) { return dropped; }
