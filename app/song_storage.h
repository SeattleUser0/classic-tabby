/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/song_storage.h — Classic Tabby song storage region (Task 03)
 *
 * Purpose
 *   The former sample bank (USER offset 69632, 446464 bytes) and the four DX7 user
 *   library sectors (516096, 16384 bytes) form one contiguous region of 113 sectors
 *   that holds songs and blocks. The byte layouts are FINAL and live in
 *   docs/tasks/TASK-03-step1-assessment.md section 9 (v0.5): a MIDI importer is built
 *   against them in another session. This header declares the region constants, the
 *   record structures (exactly the on-flash byte order, little-endian, packed by
 *   construction), the first-boot migration API (checkpoint a) and the record, block,
 *   directory, reclaim and status API (checkpoint d).
 *
 * Version: 0.8
 *
 * Revision log
 *   v0.8  2026-11-12  Task 16 Goal 5 (branch mc707-phase2): SONG_FORMAT_V3 (the v3 clip), per-format payload limits.
 *   v0.7  2026-11-07  Task 11 Step 4: the region's sector count follows the USER size
 *                     (app/ct_layout.h): (CT_USER_BYTES - 69632 - 4096) / 4096 sectors, 113 in the
 *                     stock layout and 97 in the 471040 probe layout; block sectors = that - 17
 *                     (96 / 80). The byte layouts are unchanged.
 *   v0.6  2026-11-03  Task 05: block payload format v2 (timed notes, section 9.12): block
 *                     record byte 1 = payload format, SONG_PAYLOAD_MAX 1600, validators by
 *                     format, song_payload_upgrade (v1 -> v2 in place), song flags bit 2 (swing).
 *   v0.5  2026-11-02  Task 04: song record version 2 with the row event table in the sector
 *                     tail (section 9.11 v0.6): struct song_record covers the whole 4096-byte
 *                     image, event constants and accessors.
 *   v0.4  2026-11-02  Checkpoint (f): tempo override range (via song_record_valid).
 *   v0.3  2026-11-02  Checkpoint (e): batched block write (song_block_batch, section 9.6
 *                     v0.5: whole sectors, one erase each, one journal commit).
 *   v0.2  2026-11-02  Checkpoint (d): song record / row structures (section 9.5 v0.4,
 *                     16-bit block ids),
 *                     block records (9.4), staging transactions and recovery (9.6),
 *                     block directory (9.7), compaction and status.
 *   v0.1  2026-11-02  Checkpoint (a): region constants, migration scan and erase.
 */
#ifndef CT_SONG_STORAGE_H
#define CT_SONG_STORAGE_H
#include <stdint.h>
#include "ct_layout.h"

enum {
    SONG_REGION_OFFSET = 69632,          /* = GROOVE_SAMPLE_OFFSET */
    /* v0.7: up to the tuning sector, the last USER sector: 113 sectors (446464 + 16384 bytes)
     * in the stock 536576 layout, 97 in the 471040 probe layout. */
    SONG_REGION_SECTORS = (CT_USER_BYTES - 69632 - 4096) / 4096,
    SONG_REGION_BYTES = SONG_REGION_SECTORS * 4096, /* 462848 stock */
    SONG_STAGING_SECTOR = 0,             /* region sector of the song staging journal */
    SONG_FIRST_SONG_SECTOR = 1,          /* region sectors 1..16: song records */
    SONG_SONGS = 16,
    SONG_FIRST_BLOCK_SECTOR = 17,        /* region sectors 17..112: block sectors 0..95 (stock) */
    SONG_BLOCK_SECTORS = SONG_REGION_SECTORS - 17   /* v0.7: 96 stock, 80 in the probe layout */
};
/* v0.7: song_storage.c keeps one bit per region sector in four words. */
_Static_assert(SONG_REGION_SECTORS <= 128 && SONG_BLOCK_SECTORS >= 16, "song region size");
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
    SONG_ROW_STEPS_MAX = 128,                                    /* Task 17: a row of 16..128 steps (a v3 clip is up to 128 steps; the v2 grid holds 64) */
    SONG_PAYLOAD_MIN = 64, SONG_PAYLOAD_V1_MAX = 64 + 64 * 12,    /* 832: format 0, 3-byte notes */
    SONG_PAYLOAD_V2_MAX = 64 + 64 * 24,                          /* 1600: format 1, 6-byte timed notes (9.12) */
    SONG_PAYLOAD_V3_MIN = 16, SONG_PAYLOAD_V3_MAX = 16 + 512 * 6, /* 16 .. 3088: format 2, the v3 clip (docs/CLIP-V3.md) */
    SONG_PAYLOAD_MAX = SONG_PAYLOAD_V3_MAX,                      /* the largest payload of any format: buffers use it (v0.8) */
    SONG_FORMAT_V1 = 0, SONG_FORMAT_V2 = 1, SONG_FORMAT_V3 = 2,  /* block record byte 1 (9.4 v0.7; v3: Task 16 Goal 5) */
    SONG_RECORD_BYTES = 4096, SONG_RECORD_BODY_END = 2624,       /* CRC covers 20..2623 */
    SONG_BLOCK_AREA = 20, SONG_BLOCK_AREA_BYTES = 4096 - 20,     /* record area 20..4095 */
    SONG_BLOCK_HEADER = 6,                                       /* song, 0, id16, length16 */
    SONG_JOURNAL_COMMIT = 4092,                                  /* staging commit word */
    SONG_DIRECTORY_MAX = 2048,                                   /* live blocks per song */
    /* Batch write (9.6 v0.5): a stream of block records packed into whole sectors. */
    SONG_BATCH_BYTES = 32768,                                    /* longest stream accepted */
    SONG_BATCH_SECTORS = 10,                                     /* sectors one batch may fill */
    SONG_BATCH_LIST = 16,                                        /* journal sector list bytes */
    /* Row events (9.11 v0.6, Task 04): the event table of a version-2 record. */
    SONG_EVENTS_OFFSET = 2624,                                   /* count u16, table version, flags, reserved */
    SONG_EVENTS_START = 2632,                                    /* first 5-byte event */
    SONG_EVENT_BYTES = 5,
    SONG_EVENTS_MAX = 292,                                       /* (4092 - 2632) / 5 */
    SONG_ROW_EVENTS_MAX = 32,                                    /* kept in RAM per row */
    SONG_RECORD_V2_END = 4092                                    /* version 2 CRC covers 20..4091 */
};
/* Event types (9.11): {row, channel | type << 4, d0, d1, d2}. */
enum { SONG_EVENT_PC = 0, SONG_EVENT_BANK_PC = 1, SONG_EVENT_CC = 2, SONG_EVENT_GAP = 3 };
/* Song record: the whole 4096-byte sector image (9.5 v0.4 layout for bytes 0..2623; since
 * v0.6 a version-2 record carries the row event table in `tail`, bytes 2624..4091, 9.11;
 * a version-1 record's tail is 0xFF). Field order and widths are the on-flash layout. */
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
    uint32_t version;           /* 1 = no events (CRC 20..2623), 2 = event table (CRC 20..4091) */
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
    uint8_t tail[SONG_RECORD_BYTES - SONG_RECORD_BODY_END]; /* 2624..4095: event table (v2) or 0xFF */
};
_Static_assert(sizeof(struct song_row) == 20, "song row layout");
_Static_assert(sizeof(struct song_record) == SONG_RECORD_BYTES, "song record layout");
/* Event table accessors (9.11): count 0 for a version-1 record; event i's 5 bytes. */
static inline unsigned song_event_count(const struct song_record *r)
{ return r->version == 2 ? (unsigned)(r->tail[0] | r->tail[1] << 8) : 0; }
static inline const uint8_t *song_event(const struct song_record *r, unsigned i)
{ return r->tail + (SONG_EVENTS_START - SONG_RECORD_BODY_END) + SONG_EVENT_BYTES * i; }
enum { SONG_FLAG_LOOP = 1, SONG_FLAG_JUMP_ROW = 2, SONG_FLAG_SWING = 4 /* v0.7: v2 blocks follow the project swing */, SONG_ROW_FLAG_LOOP_HERE = 1 };

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
/* Blocks. Payload formats: 0 = 9.3 (3-byte notes), 1 = 9.12 (6-byte timed notes); both
 * are validated on append. On read, *bytes receives the payload length and *format (may be
 * NULL) the stored format; the caller's buffer must hold SONG_PAYLOAD_MAX bytes. */
int song_payload_valid(unsigned format, const uint8_t *payload, unsigned bytes);
/* Rewrite a valid format-0 payload as format 1 in place (offset 0, length L x 480 units,
 * exact): `buf` must hold SONG_PAYLOAD_MAX bytes; returns the new length. */
unsigned song_payload_upgrade(uint8_t *buf, unsigned bytes);
int song_block_append(unsigned song, unsigned id, unsigned format, const uint8_t *payload, unsigned bytes);
/* Batch write (9.6 v0.5): `stream` holds block records as in 9.4 / the .tabby file (6-byte
 * header with song byte 0 or `song`, payload, 0xFF padding to a multiple of 4; the last
 * record's padding may be missing), at most SONG_BATCH_BYTES. The whole batch lands in
 * fresh block sectors under one journal commit, or nothing does: 0, SONG_INVALID (bad
 * stream), SONG_FULL (fewer free sectors than the stream packs into), or a flash error. */
int song_block_batch(unsigned song, const uint8_t *stream, unsigned bytes);
int song_block_read(unsigned song, unsigned id, uint8_t *payload, unsigned *bytes, unsigned *format);
/* Directory (9.7) of one song, rebuilt on demand; song_block_read uses it. */
int song_directory_build(unsigned song);
unsigned song_directory_song(void);   /* song the directory describes, 255 = none */
/* Storage status for command 23 and the screen: free record bytes (sum over sectors
 * of unused area), reclaimable bytes (stale and deleted records). */
int song_storage_status(uint32_t *free_bytes, uint32_t *reclaimable);
int song_storage_compact(void);       /* start a full compaction pass (poll drives it) */
int song_storage_compact_sector(unsigned block_sector); /* rewrite one sector, live records only */
#endif
