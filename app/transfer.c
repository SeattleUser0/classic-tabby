/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/transfer.c — the project-library SysEx protocol (the workbench's USB link to the device)
 *
 * Classic Tabby revision log (the upstream file had no header; earlier Classic Tabby changes are
 * marked "Task NN" where they are)
 *   v0.1  2026-11-08  Task 12 A1: command 27, the Classic Tabby capability reply (version, feature
 *                     flags, USER size), and command 28, ERASE OLD DATA from the workbench (needs
 *                     the five confirm bytes "ERASE"; refused unless song storage reports OLD DATA).
 */
#include "instrument.h"
#include "tuning_hook.h"
#include "fm_patch.h"
#include "song.h"
#include "fm1_engine_control.h"
#include "diag.h"   /* Classic Tabby Task 11: kind 8 and command 25, diagnostic build only */
/* Task 12: command 27 feature flags (bit 1: command 28 ERASE OLD DATA). */
#define CT_CAPABILITY_FLAGS 2U
#include <stdlib.h>
#include <string.h>

/* Project transfer protocol: F0 7D 'F' 'M' 02 cmd token-lo token-hi packed checksum F7.
 * Packing is an LSB-first stream of 8-bit bytes in 7-bit MIDI data. Checksum
 * makes the sum from 7D through checksum zero modulo 128. Replies set cmd bit
 * 6, and begin with status (0 success, 1 empty, 64-error for negative errors).
 * One request at a time; exact retries receive the cached reply. Each reply
 * fits the SDK's 128-byte outgoing queue. Audio never handles file transfers.
 */
#ifdef FM1_HOST_TEST
#include <stdatomic.h>
#define TRANSFER_WORD _Atomic(unsigned)
#else
#define TRANSFER_WORD volatile unsigned
#endif
static struct { uint8_t bytes[192], source; TRANSFER_WORD length; } incoming;
static struct reply_cache {
    uint8_t request[192], reply[96];
    unsigned request_length, reply_length, pending;
    uint32_t started;
} replies[3];
static unsigned session_source;
static uint32_t last_activity;
static uint8_t *transfer;
static unsigned transfer_size, transferred, transfer_kind, transfer_target, transfer_writing;
static void barrier(void)
{
#ifndef FM1_HOST_TEST
    __asm__ volatile("csync" ::: "memory");
#endif
}
void fm1_app_sysex(const uint8_t *m, size_t n)
{
    if (!m || n < 6 || n > sizeof incoming.bytes || m[0] != 0xf0 || m[n - 1] != 0xf7 ||
        incoming.length)
        return;
    if (!(n >= 8 && m[1] == 0x7d && m[2] == 'F' && m[3] == 'M' && m[4] == 2) &&
        !(n == 6 && m[1] == 0x7f && (m[2] == 0 || m[2] == 0x7f) && m[3] == 6) &&
        !(n == 163 && m[1] == 0x43 && m[2] < 16 && m[3] == 0 && m[4] == 1 && m[5] == 27))
        return;
    incoming.source = (uint8_t)fm1_midi_input_source();
    memcpy(incoming.bytes, m, n);
    barrier();
    incoming.length = (unsigned)n;
    fm1_control_request();
}
static void transfer_cancel(void)
{
    free(transfer);
    transfer = NULL;
    transfer_size = transferred = transfer_writing = 0;
}
void groove_transfer_init(void)
{
    transfer_cancel();
    incoming.length = 0; memset(replies,0,sizeof replies);
    session_source = FM1_MIDI_USB;
}
static int transfer_begin(unsigned kind, unsigned target, unsigned size, unsigned writing)
{
    /* Kind 4 (DX7 library bank) is gone with the user library (Task 03 a). Kinds 5 (song
     * record, 4096 bytes, target = song) and 6 (one block payload, target = song << 16 |
     * id) are song storage (Task 03 d, assessment 9.9 v0.4). Kind 7 (Task 03 e, 9.9 v0.5)
     * is a block batch: upload only, target = song, size = stream length. */
    if (kind == 5 && (target >= SONG_SONGS || size != SONG_RECORD_BYTES)) return GROOVE_PROJECT_INVALID;
    /* Task 05 (9.12): kind 6 carries payload format 1 (timed notes) both ways; the device
     * upgrades a stored v1 block on download. v1 payloads travel in kind-7 streams only. */
    if (kind == 6 && ((target >> 16) >= SONG_SONGS || !(target & 0xffffU) ||
                      size < SONG_PAYLOAD_MIN || size > SONG_PAYLOAD_MAX)) return GROOVE_PROJECT_INVALID;
    if (kind == 7 && (!writing || target >= SONG_SONGS || size < SONG_BLOCK_HEADER + SONG_PAYLOAD_MIN ||
                      size > SONG_BATCH_BYTES)) return GROOVE_PROJECT_INVALID;
#ifdef CT_DIAG
    /* Task 11: kind 8 = the device and session settings (40 bytes, target 0), both ways. */
    if (kind == 8 && (target || size != CT_SETTINGS_BYTES)) return GROOVE_PROJECT_INVALID;
    if (kind == 4 || kind > 8 || (kind == 1 && (target >= GROOVE_TRACKS || size != 156)) ||
#else
    if (kind == 4 || kind > 7 || (kind == 1 && (target >= GROOVE_TRACKS || size != 156)) ||
#endif
        (kind == 2 && (target >= GROOVE_TRACKS || size != sizeof(struct groove_preset))) ||
        (!kind && (target || (size != GROOVE_PROJECT_BYTES && size != GROOVE_PROJECT_LEGACY_BYTES &&
                              (!writing || size != GROOVE_PROJECT_TUNED_BYTES)))) ||
        (kind == 3 && (target || size != GROOVE_PROJECT_TUNED_BYTES)))
        return GROOVE_PROJECT_INVALID;
    if (transfer && transfer_size == size) {
        /* A new session replaces the old one; equal sizes need no new block. */
        memset(transfer, 0, size);
    } else {
        uint8_t *next = calloc(1, size);
        if (!next)
            return GROOVE_PROJECT_MEMORY;
        transfer_cancel();
        transfer = next;
    }
    transfer_size = size;
    transferred = 0;
    transfer_kind = kind;
    transfer_target = target;
    transfer_writing = writing;
    return 0;
}
static unsigned get16(const uint8_t *p) { return p[0] | (unsigned)p[1] << 8; }
static uint32_t get32(const uint8_t *p)
{ return p[0] | (uint32_t)p[1] << 8 | (uint32_t)p[2] << 16 | (uint32_t)p[3] << 24; }
static void put32(uint8_t *p, uint32_t value)
{ for (unsigned i = 0; i < 4; ++i) p[i] = (uint8_t)(value >> (i * 8U)); }
static int command(unsigned cmd, const uint8_t *data, unsigned n, uint8_t *out, unsigned *count)
{
    int r = GROOVE_PROJECT_INVALID;
    *count = 0;
    /* Task 12 A1: command 27, the Classic Tabby capability reply. A new command, so pages older
     * than tabby-v04.0 never see it (they read 21 and 22 with fixed lengths). Reply:
     *   out[0]    version of this reply (1)
     *   out[1..2] feature flags, u16 LE: bit 0 flash writes are refused while the transport runs
     *             (Task 12 A3, reply code 76), bit 1 command 28 (ERASE OLD DATA), bits 2.. later
     *   out[3..6] the USER size the build reserves (CT_USER_BYTES: 471040 normal, 536576 old)
     * Later versions only append. */
    if (cmd == 27 && !n) {
        out[0] = 1; out[1] = CT_CAPABILITY_FLAGS & 255; out[2] = CT_CAPABILITY_FLAGS >> 8;
        put32(out + 3, CT_USER_BYTES);
        *count = 7; return 0;
    }
    /* Task 12 A1: ERASE OLD DATA from the workbench, the same erase as the confirmed ACTIONS entry
     * (song_storage_initialize: one old-data sector per poll; projects, tunings and settings are
     * not touched). The five bytes "ERASE" are the workbench's confirmation. */
    if (cmd == 28) {
        if (n != 5 || memcmp(data, "ERASE", 5)) return GROOVE_PROJECT_INVALID;
        if (ct_transport_running()) return GROOVE_PROJECT_PLAYING;
        return song_storage_initialize() ? GROOVE_PROJECT_INVALID : 0;
    }
    /* Additive capability reply; command 21 retains its old exact layout. */
    if (cmd == 22 && !n) {
        /* Classic Tabby (Task 03 a): no DX7 user library (0 banks, unavailable) and no
         * sample bank (limit 0); bit 2 of out[8] announces song storage (checkpoint d),
         * bit 3 the batched block upload, transfer kind 7 (checkpoint e). */
        out[0]=1; out[1]=128; out[2]=0; out[3]=0;
        put32(out+4,0); out[8]=63; /* session roles, extended delay, song storage, batches, timed notes (Task 05, bit 4), Bluetooth settings (Task 06, bit 5) */
#ifdef CT_DIAG
        out[8]=255; /* Task 11: + bit 6 diagnostic counters (command 25), bit 7 settings transfer kind 8 */
#endif
        *count=9; return 0;
    }
#ifdef CT_DIAG
    if (cmd == 26 && n <= 2) {
        /* Task 11B (diagnostic build only): what the ACTIONS page shows, and the song
         * transport, for the unattended hardware run (docs/BUILD.md 25). No data: reply
         * {fm1_flash_size u32, song storage state u8, playing u8, loaded song u8, free u32,
         * reclaimable u32} (15 bytes). {0}: stop the song. {1, song}: load it if needed and
         * play it, as PLAY on the SONG page does. {2}: COMPACT SONG STORAGE, refused while a
         * song plays, as the ACTIONS entry is. {3}: ERASE OLD SAMPLE/DX7 (the confirmed ACTIONS
         * entry; refused unless the storage reports OLD DATA). */
        if (!n) {
            uint32_t free_bytes = 0, reclaim = 0;
            unsigned st = song_storage_state();
            if (st == SONG_STORAGE_READY) (void)song_storage_status(&free_bytes, &reclaim);
            put32(out, fm1_flash_size()); out[4] = (uint8_t)st;
            out[5] = (uint8_t)song_playing(); out[6] = (uint8_t)song_loaded();
            put32(out + 7, free_bytes); put32(out + 11, reclaim);
            *count = 15; return 0;
        }
        if (n == 1 && !data[0]) { song_stop(); return 0; }
        if (n == 2 && data[0] == 1 && data[1] < SONG_SONGS) {
            if (song_playing()) return GROOVE_PROJECT_INVALID;
            if (song_loaded() != data[1]) { r = song_load(data[1]); if (r) return r < 0 ? r : GROOVE_PROJECT_EMPTY; }
            r = song_play();
            return r < 0 ? r : 0;
        }
        if (n == 1 && data[0] == 2) return song_playing() ? GROOVE_PROJECT_INVALID : song_storage_compact();
        if (n == 1 && data[0] == 3) return song_storage_initialize() ? GROOVE_PROJECT_INVALID : 0;
        return GROOVE_PROJECT_INVALID;
    }
    if (cmd == 25 && n <= 1 && (!n || data[0] <= 3)) {   /* Task 11B: 3 = the screen page */
        /* Task 11 (diagnostic build): the timing counters; data byte 1 resets them first,
         * 2 asks for the scan page (app/diag.c lists the fields). */
        *count = (unsigned)ct_diag_read(n ? data[0] : 0, out);
        return 0;
    }
#endif
    if (cmd == 24) {
        /* Task 06 (a): the Bluetooth settings that the device's BLE page used to edit.
         * n = 0 reads {flags, role}: flags bit 0 radio on, bit 1 Bluetooth audio, bit 2 MIDI
         * (always set), role 0 = DEVICE (peripheral), 1 = HOST (central). n = 2 writes them
         * (applied and saved by app/project.c as the page did). n = 1 with data[0] = 0x7f
         * forgets the BLE MIDI pairs. The clock source stays on SEQ page 5/7. */
        if (!n) { out[0] = (uint8_t)groove_settings_radio_flags(); out[1] = (uint8_t)groove_settings_role_value(); *count = 2; return 0; }
        if (n == 2) return groove_settings_radio(data[0], data[1]) ? GROOVE_PROJECT_INVALID : 0;
        if (n == 1 && data[0] == 0x7f) { int fr = fm1_ble_forget_bonds(); return fr ? fr : 0; }
        return GROOVE_PROJECT_INVALID;
    }
    if (cmd == 23 && !n) {
        /* Song storage status (Task 03 d): free bytes, reclaimable bytes, state. */
        uint32_t free_bytes, reclaimable;
        unsigned st = song_storage_state();
        int sr = st == SONG_STORAGE_READY ? song_storage_status(&free_bytes, &reclaimable) : 1;
        put32(out, sr ? 0 : free_bytes); put32(out + 4, sr ? 0 : reclaimable);
        out[8] = (uint8_t)(st == SONG_STORAGE_OLD_DATA ? 2 : st == SONG_STORAGE_READY ? 0 : 1);
        struct song_status song; song_status_read(&song);
        out[9] = song.song; out[10] = song.playing; out[11] = song.row; out[12] = song.error;
        out[13] = (uint8_t)song.late; out[14] = (uint8_t)song.events;   /* Task 04 (9.11) */
        /* Task 06 (9.13): per-track state (bits 0-1 follow / launched / stopped, bits 2-3
         * the pending queue, bit 4 waiting) and the pattern row each track plays. */
        for (unsigned t = 0; t < 8; ++t) { out[15 + t] = song.track_state[t]; out[23 + t] = song.track_row[t]; }
        *count = 31; return 0;
    }
    if (cmd == 21 && !n) {
        out[0] = groove_tuning_capture && groove_tuning_apply ? 1 : 0;
        out[1] = GROOVE_PROJECT_TUNED_BYTES & 255;
        out[2] = GROOVE_PROJECT_TUNED_BYTES >> 8;
        put32(out + 3, GROOVE_SAMPLE_BYTES - 4096);   /* Task 11: = the song region, 462848 stock, 397312 probe */
        *count = 7; return 0;
    }
    if (cmd == 20 && !n) {
        put32(out, groove_master_state());
        *count = 4; return 0;
    }
    if (cmd == 19 && !n) {
        struct fm1_audio_stats stats; fm1_audio_stats_read(&stats);
        put32(out, stats.blocks); put32(out+4, stats.short_intervals);
        put32(out+8, stats.overruns); put32(out+12, stats.peak_ticks);
        *count = 16; return 0;
    }
    if (cmd == 18 && !n) {
        struct fm1_render_stats s; groove_audio_stats(&s);
        put32(out, s.render_ticks); put32(out+4, s.peak_ticks);
        put32(out+8, s.midi_ticks); put32(out+12, s.adapted);
        put32(out+16, s.overloads); put32(out+20, s.voice_capacity);
        put32(out+24, s.master_gain); put32(out+28, s.deadline_ticks);
        *count = 32; return 0;
    }
    if (cmd == 17 && !n) {
        struct fm1_engine_stats stats;
        fm1_engine_stats_read(&stats);
        put32(out, stats.submitted); put32(out + 4, stats.completed);
        put32(out + 8, stats.underruns); put32(out + 12, stats.midi_dropped);
        out[16] = (uint8_t)groove_samples_status(); /* always 0: no sample bank (Task 03 a) */
        out[17] = (uint8_t)groove_edit_recording();
        *count = 18; return 0;
    }
    /* Commands 11..16 (sample bank status/begin/write/finish/read/cancel) are gone with
     * the sampler (Task 03 a); they fall through to GROOVE_PROJECT_INVALID. */
    if (cmd == 0 && !n) {
        out[0] = 4;
        out[1] = GROOVE_PROJECT_SLOTS;
        out[2] = (uint8_t)groove_project_slot();
        out[3] = GROOVE_PROJECT_BYTES & 255;
        out[4] = GROOVE_PROJECT_BYTES >> 8;
        out[5] = (uint8_t)groove_clock_mode();
        for (unsigned t = 0; t < GROOVE_TRACKS; ++t)
            out[6 + t] = (uint8_t)groove_source_type(t);
        *count = 14;
        return 0;
    }
    if (cmd == 1 && (n == 2 || (n == 4 && data[0] == 6))) {
        unsigned size = data[0] == 2 ? sizeof(struct groove_preset) : data[0] == 1 ? 156
#ifdef CT_DIAG
                        : data[0] == 8 ? CT_SETTINGS_BYTES   /* Task 11 */
#endif
                        : data[0] == 3 ? GROOVE_PROJECT_TUNED_BYTES : data[0] == 5 ? SONG_RECORD_BYTES
                        : GROOVE_PROJECT_BYTES;
        unsigned target = data[1], block_id = n == 4 ? get16(data + 2) : 0;
        if (data[0] == 6) {
            /* The live payload length is only known after reading the block. */
            uint8_t *next = calloc(1, SONG_PAYLOAD_MAX);
            unsigned format = SONG_FORMAT_V2;
            if (!next) return GROOVE_PROJECT_MEMORY;
            r = song_block_read(data[1], block_id, next, &size, &format);
            if (r) { free(next); return r > 0 ? GROOVE_PROJECT_EMPTY : r; }
            if (format == SONG_FORMAT_V1) size = song_payload_upgrade(next, size);   /* Task 05: downloads are v2 */
            transfer_cancel(); transfer = next; transfer_size = size; transferred = 0;
            transfer_kind = 6; transfer_target = data[1] << 16 | block_id; transfer_writing = 0;
            out[0] = (uint8_t)size; out[1] = (uint8_t)(size >> 8); *count = 2;
            return 0;
        }
        r = transfer_begin(data[0], target, size, 0);
        if (!r) {
            if (data[0] == 5) {
                /* The record image: 2624 bytes from flash, 0xFF after (as stored). */
                memset(transfer, 0xff, size);
                r = song_record_read(target, (struct song_record *)transfer);
                if (r > 0) r = GROOVE_PROJECT_EMPTY;
            }
#ifdef CT_DIAG
            else if (data[0] == 8) r = groove_settings_export(transfer);   /* Task 11 */
#endif
            else
            r = data[0] == 2 ? groove_timbre_export(data[1], transfer, size)
                : data[0] == 1 ? groove_fm_copy(data[1], transfer, NULL)
                        : groove_project_export(transfer, size);
            if (r)
                transfer_cancel();
            else {
                out[0] = (uint8_t)size;
                out[1] = (uint8_t)(size >> 8);
                *count = 2;
            }
        }
    } else if (cmd == 2 && n == 3 && transfer && !transfer_writing) {
        unsigned at = get16(data), bytes = data[2];
        if (bytes && bytes <= 64 && at <= transfer_size && bytes <= transfer_size - at) {
            memcpy(out, transfer + at, bytes);
            *count = bytes;
            r = 0;
        }
    } else if (cmd == 3 && n == 4)
        r = transfer_begin(data[0], data[1], get16(data + 2), 1);
    else if (cmd == 3 && n == 6 && data[0] == 6)
        r = transfer_begin(6, data[1] << 16 | get16(data + 2), get16(data + 4), 1);
    else if (cmd == 4 && n > 2 && n <= 66 && transfer && transfer_writing) {
        unsigned at = get16(data), bytes = n - 2;
        if (at == transferred && at <= transfer_size && bytes <= transfer_size - at) {
            memcpy(transfer + at, data + 2, bytes);
            transferred += bytes;
            r = 0;
        }
    } else if (cmd == 5 && n == 4 && transfer && transfer_writing && transferred == transfer_size) {
        if (get32(data) == ~groove_crc32(~0U, transfer, transfer_size)) {
            if (transfer_kind == 5) {
                /* An image whose magic is not FM1G (for example all 0xFF) deletes the song. */
                r = get32(transfer) == SONG_MAGIC_RECORD
                        ? song_record_write(transfer_target, (const struct song_record *)transfer)
                        : song_record_delete(transfer_target);
            } else if (transfer_kind == 6)
                r = song_block_append(transfer_target >> 16, transfer_target & 0xffffU, SONG_FORMAT_V2, transfer, transfer_size);
            else if (transfer_kind == 7)
                r = song_block_batch(transfer_target, transfer, transfer_size); /* all or nothing (9.6 v0.5) */
#ifdef CT_DIAG
            else if (transfer_kind == 8)
                r = groove_settings_import(transfer, transfer_size);   /* Task 11: validated, then applied */
#endif
            else
            r = transfer_kind == 2 ? groove_timbre_import(transfer_target, transfer, transfer_size)
                : transfer_kind == 1 ? groove_fm_import(transfer_target, transfer)
                              : groove_project_import(transfer, transfer_size);
            if (!r)
                transfer_cancel();
        }
    } else if (cmd == 6 && !n) {
        transfer_cancel();
        r = 0;
    } else if (cmd == 7 && n == 1)
        r = groove_project_save_slot(data[0]);
    else if (cmd == 8 && n == 1)
        r = groove_project_load_slot(data[0]);
    else if (cmd == 9 && n == 1) {
        char name[13];
        r = groove_project_info(data[0], name);
        if (r >= 0) {
            memcpy(out, name, 12);
            *count = 12;
        }
    } else if (cmd == 10 && n == 12) {
        for (unsigned i = 0; i < n; ++i)
            if (data[i] < 32 || data[i] > 126)
                return GROOVE_PROJECT_INVALID;
        for (unsigned i = 0; i < n; ++i)
            groove_project_rename(i, (char)data[i]);
        r = 0;
    }
    return r;
}
void groove_transfer_poll(void)
{
    uint32_t now = fm1_millis();
    if (transfer && now - last_activity > 10000U)
        transfer_cancel();
    /* Retry each port independently. A blocked BLE reply never delays USB
     * notes or its transfer ACK. Cached retries also belong to that port. */
    for (unsigned p=0;p<3;++p) if (replies[p].pending) {
        int r=fm1_midi_send_port(p,replies[p].reply,replies[p].reply_length);
        if (r!=-2 || now-replies[p].started>2000U) replies[p].pending=0;
    }
    unsigned n = incoming.length;
    if (!n) return;
    barrier();
    unsigned source=incoming.source;
    struct reply_cache *c=&replies[source];
    if (c->pending) return;
    if (c->request_length == n && !memcmp(c->request, incoming.bytes, n) && c->reply_length) {
        incoming.length = 0;
        c->started=now;
        if (source==session_source || !transfer) last_activity=now;
        c->pending=fm1_midi_send_port(source,c->reply,c->reply_length)==-2;
        return;
    }
    /* Keep the last file reply across MMC, voice dumps and rejected frames.
     * These can arrive while the sender is retrying a lost chunk ACK. Hold
     * the incoming mailbox until validation has consumed all of its bytes. */
    const uint8_t *message = incoming.bytes;
    for (unsigned i = 1; i + 1 < n; ++i)
        if (message[i] >= 128)
            goto discard;
    if (message[1] == 0x7f) {
        unsigned code = message[4];
        barrier();
        incoming.length = 0;
        if (groove_midi_clock_accept(source, code == 1 ? 0xfc : 0xfa)) groove_screen_mmc(code);
        return;
    }
    if (message[1] == 0x43) {
        unsigned sum = 0;
        for (unsigned i = 6; i < 162; ++i)
            sum += message[i];
        if (!(sum & 127U)) {
            uint8_t patch[156];
            unsigned channel = message[2];
            memcpy(patch, message + 6, 155);
            patch[155] = 63;
            barrier();
            incoming.length = 0;
            for (unsigned track=0;track<GROOVE_TRACKS;++track)
                if (groove_track_role(track) != GROOVE_TRACK_OFF && channel == groove_midi_input_channel(track))
                    (void)groove_fm_import(track, patch);
            return;
        }
        goto discard;
    }
    if (n < 10 || message[5] >= 64)
        goto discard;
    unsigned sum = 0;
    for (unsigned i = 1; i + 1 < n; ++i)
        sum += message[i];
    if (sum & 127U)
        goto discard;
    uint8_t data[132], response[65];
    unsigned bits = 0, value = 0, bytes = 0;
    for (unsigned i = 8; i + 2 < n; ++i) {
        value |= (unsigned)message[i] << bits;
        bits += 7;
        if (bits >= 8) {
            if (bytes == sizeof data)
                goto discard;
            data[bytes++] = (uint8_t)value;
            value >>= 8;
            bits -= 8;
        }
    }
    if (value || bits >= 7)
        goto discard;
    if (transfer && source != session_source) {
        uint8_t busy[12]; memcpy(busy,message,8); busy[5]|=64;
        busy[8]=64-FM1_FLASH_BUSY; busy[9]=0; unsigned sum=0;
        for (unsigned i=1;i<10;++i) sum+=busy[i];
        busy[10]=(uint8_t)((0U-sum)&127U); busy[11]=0xf7;
        (void)fm1_midi_send_port(source,busy,sizeof busy);
        goto discard;
    }
    memcpy(c->request, message, n);
    barrier();
    incoming.length = 0;
    c->request_length = n;
    c->reply_length = 0;
    unsigned count = 0;
    int r = command(c->request[5], data, bytes, response + 1, &count);
    if (!r && transfer) session_source = source;
    response[0] = (uint8_t)(r < 0 ? 64 - r : r);
    memcpy(c->reply, c->request, 8);
    c->reply[5] |= 64;
    unsigned at = 8;
    value = bits = 0;
    for (unsigned i = 0; i <= count; ++i) {
        value |= (unsigned)response[i] << bits;
        bits += 8;
        while (bits >= 7) {
            c->reply[at++] = value & 127U;
            value >>= 7;
            bits -= 7;
        }
    }
    if (bits)
        c->reply[at++] = value & 127U;
    sum = 0;
    for (unsigned i = 1; i < at; ++i)
        sum += c->reply[i];
    c->reply[at++] = (uint8_t)((0U - sum) & 127U);
    c->reply[at++] = 0xf7;
    c->reply_length = at;
    c->started = last_activity = now;
    c->pending = fm1_midi_send_port(source,c->reply,c->reply_length)==-2;
    return;
discard:
    barrier();
    incoming.length = 0;
}
