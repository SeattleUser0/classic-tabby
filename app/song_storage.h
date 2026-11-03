/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/song_storage.h — Classic Tabby song storage region (Task 03)
 *
 * Purpose
 *   The former sample bank (USER offset 69632, 446464 bytes) and the four DX7 user
 *   library sectors (516096, 16384 bytes) form one contiguous region of 113 sectors
 *   that holds songs and blocks. The byte layouts are FINAL and live in
 *   docs/tasks/TASK-03-step1-assessment.md section 9 (v0.4): a MIDI importer is built
 *   against them in another session. This header declares the region constants, the
 *   record structures (exactly the on-flash byte order, little-endian, packed by
 *   construction), the first-boot migration API (checkpoint a) and the record, block,
 *   directory, reclaim and status API (checkpoint d).
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-02  Checkpoint (d): song record / row structures (section 9.5 v0.4,
 *                     16-bit block ids),
 *                     block records (9.4), staging transactions and recovery (9.6),
 *                     block directory (9.7), compaction and status.
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
    SONG_MAGIC_STAGING = 0x51314d46U,    /* "FM1Q" staging journal (reserved, unused: the
                                            staged image keeps its own magic, 9.6) */
    LEGACY_SAMPLE_MAGIC = 0x53314d46U,   /* "FM1S" V01 sample bank header at 69632 */
    LEGACY_DX7_BANK_MAGIC = 0x31424d46U  /* "FMB1" V01 DX7 library bank at 516096.. */
};
/* Format limits (section 9). */
enum {
    SONG_ROWS = 128, SONG_TRACKS = 8, SONG_BLOCK_STEPS = 64, SONG_NOTES_PER_STEP = 4,
    SONG_PAYLOAD_MIN = 64, SONG_PAYLOAD_MAX = 64 + 64 * 12,       /* 832 */
    SONG_RECORD_BYTES = 4096, SONG_RECORD_BODY_END = 2624,       /* CRC covers 20..2623 */
    SONG_BLOCK_AREA = 20, SONG_BLOCK_AREA_BYTES = 4096 - 20,     /* record area 20..4095 */
    SONG_BLOCK_HEADER = 6,                                       /* song, 0, id16, length16 */
    SONG_JOURNAL_COMMIT = 4092,                                  /* staging commit word */
    SONG_DIRECTORY_MAX = 2048                                    /* live blocks per song */
};
/* Song record, bytes 0..2623 of the 4096-byte sector image (9.5, v0.4 layout). The
 * remaining 1472 bytes are 0xFF. Field order and widths are the on-flash layout. */
struct song_row {
    uint16_t block[SONG_TRACKS]; /* block id per track (little-endian), 0 = silent */
    uint8_t repeat;             /* 1..64 */
    uint8_t flags;              /* bit 0: loop here until a jump is queued */
    uint8_t steps;              /* 16, 32, 48 or 64; 0 is read as 64 */
    uint8_t reserved;           /* 0 */
};
struct song_record {
    uint32_t magic;             /* FM1G */
    uint32_t generation;
    uint32_t target;            /* region sector 1 + song (staging recovery) */
    uint32_t crc;               /* crc32 over bytes 20..2623 */
    uint32_t commit;            /* 0xFFFFFFFF while writing, 0 once complete */
    uint32_t version;           /* 1 */
    char name[12];              /* printable ASCII, space padded */
    uint8_t project;            /* project slot 0..15 */
    uint8_t flags;              /* bit 0 loop song, bit 1 jump mode (0 bar, 1 row) */
    uint16_t tempo;             /* BPM override, 0 = project tempo */
    uint8_t rows;               /* 1..128 */
    uint8_t reserved41;         /* 0 (v0.4: the old block count, ignored) */
    uint8_t loop_row;           /* 0..rows-1 */
    uint8_t reserved[5];
    uint8_t channel[SONG_TRACKS]; /* 0 = device OUT CH, 1..16 = MIDI channel */
    uint8_t reserved2[8];
    struct song_row row[SONG_ROWS]; /* offset 64, 2560 bytes */
};
_Static_assert(sizeof(struct song_row) == 20, "song row layout");
_Static_assert(sizeof(struct song_record) == SONG_RECORD_BODY_END, "song record layout");
enum { SONG_FLAG_LOOP = 1, SONG_FLAG_JUMP_ROW = 2, SONG_ROW_FLAG_LOOP_HERE = 1 };

/* Migration state (control task), checkpoint (a):
 *   SONG_STORAGE_SCANNING  boot scan in progress (a few sectors per poll)
 *   SONG_STORAGE_READY     every sector is song-formatted or erased
 *   SONG_STORAGE_OLD_DATA  V01 sample bank / DX7 library (or unknown data) present;
 *                          song mode stays disabled until the user confirms the erase
 *   SONG_STORAGE_ERASING   confirmed erase in progress
 *   SONG_STORAGE_ERROR     flash read/erase failed or the partition is the wrong size
 *   SONG_STORAGE_COMPACTING (d) user-requested full compaction pass in progress */
enum { SONG_STORAGE_SCANNING, SONG_STORAGE_READY, SONG_STORAGE_OLD_DATA,
       SONG_STORAGE_ERASING, SONG_STORAGE_ERROR, SONG_STORAGE_COMPACTING };
void song_storage_init(void);         /* start (or restart) the boot scan */
void song_storage_poll(void);         /* control task; budgeted flash reads/erases */
unsigned song_storage_state(void);
unsigned song_storage_old_sectors(void); /* sectors holding old data (valid after the scan) */
int song_storage_initialize(void);    /* user-confirmed: erase the old-data sectors; 0 = started */

/* Checkpoint (d). All functions are control task only and synchronous; results are
 * 0 on success, SONG_EMPTY (1) for an absent song/block, or a negative fm1_flash_result
 * / SONG_INVALID. Every write goes through the staging sector (9.6). */
enum { SONG_EMPTY = 1, SONG_INVALID = -7, SONG_FULL = -10, SONG_BUSY = -3 };
int song_storage_prepare(void);       /* finish a committed staged image (recovery) */
int song_record_valid(const struct song_record *r); /* 0 valid, SONG_INVALID otherwise */
int song_record_read(unsigned song, struct song_record *out);
int song_record_write(unsigned song, const struct song_record *in); /* magic/gen/crc set here */
int song_record_delete(unsigned song);
/* Blocks. Payload format: 9.3 (validated on append). On read, *bytes receives the
 * payload length; the caller's buffer must hold SONG_PAYLOAD_MAX bytes. */
int song_payload_valid(const uint8_t *payload, unsigned bytes);
int song_block_append(unsigned song, unsigned id, const uint8_t *payload, unsigned bytes);
int song_block_read(unsigned song, unsigned id, uint8_t *payload, unsigned *bytes);
/* Directory (9.7) of one song, rebuilt on demand; song_block_read uses it. */
int song_directory_build(unsigned song);
unsigned song_directory_song(void);   /* song the directory describes, 255 = none */
/* Storage status for command 23 and the screen: free record bytes (sum over sectors
 * of unused area), reclaimable bytes (stale and deleted records). */
int song_storage_status(uint32_t *free_bytes, uint32_t *reclaimable);
int song_storage_compact(void);       /* start a full compaction pass (poll drives it) */
int song_storage_compact_sector(unsigned block_sector); /* rewrite one sector, live records only */
#endif
