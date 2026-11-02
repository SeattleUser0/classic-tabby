/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/song_storage.c — Classic Tabby song storage region: first-boot migration (Task 03)
 *
 * Purpose
 *   Checkpoint (a) of Task 03 removes the sampler and the DX7 user library. Their flash
 *   region becomes song storage, but a device coming from SMK37 Open V01 still carries a
 *   sample bank at USER offset 69632 and DX7 library banks at 516096. Those bytes must
 *   never be read as song data, and must not be erased silently: the user backs them up
 *   with the V01 workbench first. This file
 *     * scans the 113 region sectors on boot (first 32 bytes of each, a few per poll),
 *     * classifies each as song-formatted (FM1G / FM1B / FM1Q magic), erased (0xFF) or
 *       old data (anything else, in particular FM1S and FMB1),
 *     * reports SONG_STORAGE_OLD_DATA so the screen can ask, and erases only the
 *       old-data sectors after the user confirms (ACTIONS page, "ERASE OLD SAMPLE/DX7").
 *   Nothing below 69632 (projects, settings, staging) and nothing at or above 532480
 *   (tuning sector) is touched. No flash write happens without confirmation.
 *
 *   Song and block records themselves arrive in checkpoint (d); this file only owns
 *   the region's lifecycle until then.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-02  Initial version: scan, classification, confirmed erase.
 */
#include "song_storage.h"
#include "instrument.h"
#include <string.h>

/* One bit per region sector (113 bits): sectors that hold old data. */
static uint32_t old_mask[4];
static unsigned state, position, old_count;

static void mark_old(unsigned sector) { old_mask[sector >> 5] |= 1U << (sector & 31U); ++old_count; }
static unsigned is_old(unsigned sector) { return (old_mask[sector >> 5] >> (sector & 31U)) & 1U; }

void song_storage_init(void)
{
    memset(old_mask, 0, sizeof old_mask);
    old_count = position = 0;
    /* The region must sit exactly below the tuning sector of a 536576-byte partition. */
    state = fm1_flash_size() == GROOVE_FLASH_BYTES &&
            SONG_REGION_OFFSET + SONG_REGION_BYTES == GROOVE_TUNING_OFFSET ? SONG_STORAGE_SCANNING
                                                                           : SONG_STORAGE_ERROR;
}
/* Classify one sector from its first 32 bytes: song magic, erased, or old. */
static int classify(unsigned sector)
{
    uint8_t head[32];
    int r = fm1_flash_read(SONG_REGION_OFFSET + sector * 4096U, head, sizeof head);
    if (r) return r;
    uint32_t magic = head[0] | (uint32_t)head[1] << 8 | (uint32_t)head[2] << 16 | (uint32_t)head[3] << 24;
    if (magic == SONG_MAGIC_RECORD || magic == SONG_MAGIC_BLOCKS || magic == SONG_MAGIC_STAGING) return 0;
    for (unsigned i = 0; i < sizeof head; ++i)
        if (head[i] != 0xff) { mark_old(sector); return 0; }
    return 0;
}
void song_storage_poll(void)
{
    if (state == SONG_STORAGE_SCANNING) {
        /* Four sectors per control iteration: the whole scan takes 29 polls. */
        for (unsigned n = 0; n < 4 && position < SONG_REGION_SECTORS; ++n, ++position) {
            int r = classify(position);
            if (r == FM1_FLASH_BUSY) return;
            if (r) { state = SONG_STORAGE_ERROR; return; }
        }
        if (position == SONG_REGION_SECTORS) state = old_count ? SONG_STORAGE_OLD_DATA : SONG_STORAGE_READY;
    } else if (state == SONG_STORAGE_ERASING) {
        /* One sector per poll keeps the audio gaps short (an erase silences audio briefly). */
        while (position < SONG_REGION_SECTORS && !is_old(position)) ++position;
        if (position == SONG_REGION_SECTORS) {
            memset(old_mask, 0, sizeof old_mask); old_count = 0;
            state = SONG_STORAGE_READY;
            return;
        }
        int r = fm1_flash_erase(SONG_REGION_OFFSET + position * 4096U);
        if (r == FM1_FLASH_BUSY) return;
        if (r) { state = SONG_STORAGE_ERROR; return; }
        ++position;
    }
}
unsigned song_storage_state(void) { return state; }
unsigned song_storage_old_sectors(void) { return old_count; }
int song_storage_initialize(void)
{
    if (state != SONG_STORAGE_OLD_DATA) return -1;
    position = 0;
    state = SONG_STORAGE_ERASING;
    return 0;
}
