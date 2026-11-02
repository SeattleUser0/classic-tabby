/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/song_storage.h — Classic Tabby song storage region (Task 03)
 *
 * Purpose
 *   The former sample bank (USER offset 69632, 446464 bytes) and the four DX7 user
 *   library sectors (516096, 16384 bytes) form one contiguous region of 113 sectors
 *   that holds songs and blocks (docs/tasks/TASK-03-step1-assessment.md section 9).
 *   This header declares the region constants and the first-boot migration API.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-02  Checkpoint (a): region constants, migration scan and erase.
 */
#ifndef CT_SONG_STORAGE_H
#define CT_SONG_STORAGE_H
#include <stdint.h>

enum {
    SONG_REGION_OFFSET = 69632,          /* = GROOVE_SAMPLE_OFFSET */
    SONG_REGION_SECTORS = 113,           /* 446464 + 16384 bytes, up to the tuning sector */
    SONG_REGION_BYTES = SONG_REGION_SECTORS * 4096, /* 462848 */
    SONG_STAGING_SECTOR = 0,             /* region sector of the song staging journal */
    SONG_FIRST_SONG_SECTOR = 1,          /* region sectors 1..16: song records */
    SONG_SONGS = 16,
    SONG_FIRST_BLOCK_SECTOR = 17,        /* region sectors 17..112: block sectors 0..95 */
    SONG_BLOCK_SECTORS = 96
};
/* Little-endian magics (assessment 9.2). */
enum {
    SONG_MAGIC_RECORD = 0x47314d46U,     /* "FM1G" song record */
    SONG_MAGIC_BLOCKS = 0x42314d46U,     /* "FM1B" block sector */
    SONG_MAGIC_STAGING = 0x51314d46U,    /* "FM1Q" staging journal */
    LEGACY_SAMPLE_MAGIC = 0x53314d46U,   /* "FM1S" V01 sample bank header at 69632 */
    LEGACY_DX7_BANK_MAGIC = 0x31424d46U  /* "FMB1" V01 DX7 library bank at 516096.. */
};
/* Migration state (control task):
 *   SONG_STORAGE_SCANNING  boot scan in progress (a few sectors per poll)
 *   SONG_STORAGE_READY     every sector is song-formatted or erased
 *   SONG_STORAGE_OLD_DATA  V01 sample bank / DX7 library (or unknown data) present;
 *                          song mode stays disabled until the user confirms the erase
 *   SONG_STORAGE_ERASING   confirmed erase in progress
 *   SONG_STORAGE_ERROR     flash read/erase failed or the partition is the wrong size */
enum { SONG_STORAGE_SCANNING, SONG_STORAGE_READY, SONG_STORAGE_OLD_DATA,
       SONG_STORAGE_ERASING, SONG_STORAGE_ERROR };
void song_storage_init(void);         /* start (or restart) the boot scan */
void song_storage_poll(void);         /* control task; budgeted flash reads/erases */
unsigned song_storage_state(void);
unsigned song_storage_old_sectors(void); /* sectors holding old data (valid after the scan) */
int song_storage_initialize(void);    /* user-confirmed: erase the old-data sectors; 0 = started */
#endif
