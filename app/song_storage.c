/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/song_storage.c — Classic Tabby song storage region (Task 03)
 *
 * Purpose
 *   Owns the 113-sector song region (USER 69632..532480): the first-boot migration from
 *   V01 (checkpoint a) and, since checkpoint (d), the song records, block sectors, the
 *   staging transactions that make every write power-cut safe, the per-song block
 *   directory and the reclaim (compaction) logic. The byte layouts are final, see
 *   docs/tasks/TASK-03-step1-assessment.md section 9 (v0.5):
 *
 *     region sector 0        staging journal: a complete image of the sector being
 *                            written, plus a commit word at byte 4092 (0 = committed)
 *     region sectors 1..16   one song record per sector (FM1G, CRC over bytes 20..2623)
 *     region sectors 17..112 block sectors (FM1B): a header (generation, songs mask, CRC
 *                            over bytes 20..4095) and packed records {song, 0, id16,
 *                            length16, payload}, 4-byte aligned, 0xFF after the last
 *
 *   Transactions (9.6): build the destination image in RAM, program it into staging,
 *   verify, program the commit word, program the destination, verify, erase staging.
 *   song_storage_prepare() repeats the destination program of a committed staged image
 *   whose destination differs, so a power cut leaves either the old or the new sector.
 *
 *   Batch writes (9.6 v0.5, checkpoint e): a stream of block records is packed into
 *   whole block sectors chosen among the free ones (erased, or holding no live record).
 *   Each is erased once and programmed with header byte 5 = 0xFF ("pending": the scan,
 *   the directory and the free-space search ignore it). Then one journal (FM1Q, the
 *   sector list and the first generation) goes into staging with the commit word, and
 *   byte 5 of every batch sector is programmed to 0 (a 1->0 write, no erase). Recovery:
 *   a committed journal finishes the byte-5 writes; a pending sector nobody committed
 *   is erased. The batch is therefore visible as a whole or not at all.
 *
 *   Everything here runs on the control task and is synchronous (a transaction takes
 *   three sector erases). The sequencer (app/song.c) only reads through the directory.
 *
 * Version: 0.4
 *
 * Revision log
 *   v0.4  2026-11-02  Checkpoint (f): song_record_valid rejects a tempo override outside
 *                     30..300 (0 = project tempo).
 *   v0.3  2026-11-02  Checkpoint (e): song_block_batch, batch journal recovery, pending
 *                     sectors, plain erase when compacting a sector without live records.
 *   v0.2  2026-11-02  Checkpoint (d): records, blocks, staging transactions, recovery,
 *                     directory (sorted, 16-bit ids), status, compaction.
 *   v0.1  2026-11-02  Checkpoint (a): scan, classification, confirmed erase.
 */
#include "song_storage.h"
#include "instrument.h"
#include <string.h>

/* ---- region lifecycle (checkpoint a) ----------------------------------------------- */
static uint32_t old_mask[4];                 /* one bit per region sector: holds old data */
static unsigned state, position, old_count;
/* ---- storage (checkpoint d) -------------------------------------------------------- */
static uint8_t image[4096];                  /* the one RAM sector image (transactions, walks) */
/* Block sector cache, authoritative after the boot scan because every write passes
 * through this file: songs mask, generation and the end of the record area
 * (used = 20 for an erased sector, SONG_USED_UNKNOWN until the sector was walked). */
/* used >= SONG_USED_PENDING means "load before use": PENDING (a batch member awaiting
 * its commit, or left by a failed batch) loads as empty, UNKNOWN as whatever is there. */
enum { SONG_USED_UNKNOWN = 0xffff, SONG_USED_PENDING = 0xfffe, SONG_BLOCK_SECTOR_EMPTY = 20 };
enum { SONG_PENDING_BYTE = 0xff };               /* block header byte 5 of a pending batch member */
static struct { uint16_t songs, used; uint32_t gen; } sectors[SONG_BLOCK_SECTORS];
static uint32_t block_gen_max;
/* Directory of one song (9.7): sorted by id. */
static uint16_t dir_id[SONG_DIRECTORY_MAX], dir_at[SONG_DIRECTORY_MAX];
static uint8_t dir_sector[SONG_DIRECTORY_MAX];
static unsigned dir_count, dir_song = 255;
/* Full compaction pass (poll driven). */
static uint16_t live_bytes[SONG_BLOCK_SECTORS];

static uint32_t sector_address(unsigned sector) { return SONG_REGION_OFFSET + sector * 4096U; }
static unsigned le16(const uint8_t *p) { return p[0] | (unsigned)p[1] << 8; }
static uint32_t le32(const uint8_t *p) { return le16(p) | (uint32_t)le16(p + 2) << 16; }
static void put16(uint8_t *p, unsigned v) { p[0] = (uint8_t)v; p[1] = (uint8_t)(v >> 8); }
static void put32(uint8_t *p, uint32_t v) { put16(p, v & 0xffffU); put16(p + 2, v >> 16); }
static uint32_t crc(const void *data, unsigned bytes) { return ~groove_crc32(~0U, data, bytes); }
static unsigned align4(unsigned n) { return (n + 3U) & ~3U; }
static int read_sector(unsigned sector) { return fm1_flash_read(sector_address(sector), image, sizeof image); }
static unsigned erased(const uint8_t *p, unsigned n)
{ for (unsigned i = 0; i < n; ++i) if (p[i] != 0xff) return 0; return 1; }

static void mark_old(unsigned sector) { old_mask[sector >> 5] |= 1U << (sector & 31U); ++old_count; }
static unsigned is_old(unsigned sector) { return (old_mask[sector >> 5] >> (sector & 31U)) & 1U; }

void song_storage_init(void)
{
    memset(old_mask, 0, sizeof old_mask);
    old_count = position = 0;
    dir_song = 255; dir_count = 0; block_gen_max = 0;
    for (unsigned s = 0; s < SONG_BLOCK_SECTORS; ++s) { sectors[s].songs = 0; sectors[s].gen = 0; sectors[s].used = SONG_USED_UNKNOWN; }
    /* The region must sit exactly below the tuning sector of a 536576-byte partition. */
    state = fm1_flash_size() == GROOVE_FLASH_BYTES &&
            SONG_REGION_OFFSET + SONG_REGION_BYTES == GROOVE_TUNING_OFFSET ? SONG_STORAGE_SCANNING
                                                                           : SONG_STORAGE_ERROR;
}
/* Classify one sector from its first 32 bytes: song magic, erased, or old. Block sector
 * headers are cached on the way (generation, songs mask) for the directory. */
static int classify(unsigned sector)
{
    uint8_t head[32];
    int r = fm1_flash_read(sector_address(sector), head, sizeof head);
    if (r) return r;
    uint32_t magic = le32(head);
    if (sector >= SONG_FIRST_BLOCK_SECTOR) {
        unsigned b = sector - SONG_FIRST_BLOCK_SECTOR;
        sectors[b].songs = 0; sectors[b].gen = 0; sectors[b].used = SONG_USED_UNKNOWN;
        if (magic == SONG_MAGIC_BLOCKS && head[5] == SONG_PENDING_BYTE) {
            /* A batch member whose journal did not commit before a power cut (9.6 v0.5):
             * invisible; song_storage_prepare() erases it or, with a committed journal
             * in staging, adopts it. */
            sectors[b].used = SONG_USED_PENDING;
        } else if (magic == SONG_MAGIC_BLOCKS) {
            sectors[b].gen = le32(head + 8); sectors[b].songs = (uint16_t)le16(head + 12);
            if (sectors[b].gen > block_gen_max) block_gen_max = sectors[b].gen;
        } else if (erased(head, sizeof head)) sectors[b].used = SONG_BLOCK_SECTOR_EMPTY;
    }
    if (magic == SONG_MAGIC_RECORD || magic == SONG_MAGIC_BLOCKS || magic == SONG_MAGIC_STAGING) return 0;
    if (!erased(head, sizeof head)) mark_old(sector);
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
        if (position == SONG_REGION_SECTORS) {
            state = old_count ? SONG_STORAGE_OLD_DATA : SONG_STORAGE_READY;
            /* A staged image left by a power cut is finished before anything else. */
            if (state == SONG_STORAGE_READY && song_storage_prepare() < 0) state = SONG_STORAGE_ERROR;
        }
    } else if (state == SONG_STORAGE_ERASING) {
        /* One sector per poll keeps the audio gaps short (an erase silences audio briefly). */
        while (position < SONG_REGION_SECTORS && !is_old(position)) ++position;
        if (position == SONG_REGION_SECTORS) {
            memset(old_mask, 0, sizeof old_mask); old_count = 0;
            state = SONG_STORAGE_READY;
            return;
        }
        int r = fm1_flash_erase(sector_address(position));
        if (r == FM1_FLASH_BUSY) return;
        if (r) { state = SONG_STORAGE_ERROR; return; }
        if (position >= SONG_FIRST_BLOCK_SECTOR) sectors[position - SONG_FIRST_BLOCK_SECTOR].used = SONG_BLOCK_SECTOR_EMPTY;
        ++position;
    } else if (state == SONG_STORAGE_COMPACTING) {
        /* One sector per poll; live_bytes[] was filled when the pass started. */
        while (position < SONG_BLOCK_SECTORS &&
               (sectors[position].used >= SONG_USED_PENDING || sectors[position].used <= SONG_BLOCK_SECTOR_EMPTY + live_bytes[position]))
            ++position;
        if (position == SONG_BLOCK_SECTORS) { state = SONG_STORAGE_READY; return; }
        int r = song_storage_compact_sector(position);
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

/* ---- transactions (9.6) ------------------------------------------------------------ */
/* Erase a sector, program the first n bytes of image, verify them by readback. */
static int program(unsigned sector, unsigned n)
{
    uint32_t a = sector_address(sector);
    int r = fm1_flash_erase(a);
    if (!r) r = fm1_flash_write(a, image, n);
    uint8_t chunk[128];
    for (unsigned at = 0; !r && at < n; at += sizeof chunk) {
        unsigned m = n - at < sizeof chunk ? n - at : sizeof chunk;
        r = fm1_flash_read(a + at, chunk, m);
        if (!r && memcmp(chunk, image + at, m)) r = FM1_FLASH_IO;
    }
    return r;
}
/* Does the first n bytes of `sector` equal image (byte 5 excluded for block images)? */
static int same_as_image(unsigned sector, unsigned n, unsigned block)
{
    uint8_t chunk[128];
    for (unsigned at = 0; at < n; at += sizeof chunk) {
        unsigned m = n - at < sizeof chunk ? n - at : sizeof chunk;
        if (fm1_flash_read(sector_address(sector) + at, chunk, m)) return 0;
        if (block && at == 0) chunk[5] = image[5];
        if (memcmp(chunk, image + at, m)) return 0;
    }
    return 1;
}
/* image holds the destination image (bytes n..4095 are 0xFF). For a block image byte 5
 * carries the destination sector in the staged copy and is 0 in the destination. */
static int transact(unsigned target, unsigned n)
{
    /* Callers ran song_storage_prepare() before building image (prepare uses image). */
    unsigned block = le32(image) == SONG_MAGIC_BLOCKS;
    if (block) image[5] = (uint8_t)target;
    int r = program(SONG_STAGING_SECTOR, n > SONG_JOURNAL_COMMIT ? SONG_JOURNAL_COMMIT : n);
    if (r) return r;
    uint32_t zero = 0;
    r = fm1_flash_write(sector_address(SONG_STAGING_SECTOR) + SONG_JOURNAL_COMMIT, &zero, sizeof zero);
    if (r) return r;
    if (block) image[5] = 0;
    r = program(target, n);
    if (r) return r;
    return fm1_flash_erase(sector_address(SONG_STAGING_SECTOR));
}
/* Validate the image in RAM as a staged copy and return its destination sector, or 0. */
static unsigned staged_target(unsigned *n)
{
    uint32_t magic = le32(image);
    if (magic == SONG_MAGIC_RECORD) {
        uint32_t target = le32(image + 8);
        *n = SONG_RECORD_BODY_END;
        if (target < SONG_FIRST_SONG_SECTOR || target >= SONG_FIRST_BLOCK_SECTOR) return 0;
        return le32(image + 12) == crc(image + 20, SONG_RECORD_BODY_END - 20) ? target : 0;
    }
    if (magic == SONG_MAGIC_BLOCKS) {
        unsigned target = image[5];
        *n = 4096;
        if (target < SONG_FIRST_BLOCK_SECTOR || target >= SONG_REGION_SECTORS) return 0;
        memset(image + SONG_JOURNAL_COMMIT, 0xff, 4); /* the journal word is outside the image */
        return le32(image + 16) == crc(image + 20, 4096 - 20) ? target : 0;
    }
    return 0;
}
static int batch_finalize(void);
int song_storage_prepare(void)
{
    if (state == SONG_STORAGE_ERROR) return FM1_FLASH_UNAVAILABLE;
    int r = read_sector(SONG_STAGING_SECTOR);
    if (r) return r;
    if (!(erased(image, 32) && erased(image + SONG_JOURNAL_COMMIT, 4))) {
        unsigned committed = le32(image + SONG_JOURNAL_COMMIT) == 0;
        if (committed && le32(image) == SONG_MAGIC_STAGING) {
            /* A committed batch journal (9.6 v0.5): repeat the byte-5 writes of step 4. */
            r = batch_finalize();
            if (r) return r;
        } else {
            unsigned n = 0, target = committed ? staged_target(&n) : 0;
            if (target) {
                unsigned block = le32(image) == SONG_MAGIC_BLOCKS;
                if (block) image[5] = 0;
                if (!same_as_image(target, n, block)) {
                    r = program(target, n);
                    if (r) return r;
                    if (block) {
                        unsigned b = target - SONG_FIRST_BLOCK_SECTOR;
                        sectors[b].gen = le32(image + 8); sectors[b].songs = (uint16_t)le16(image + 12);
                        sectors[b].used = SONG_USED_UNKNOWN;
                        if (sectors[b].gen > block_gen_max) block_gen_max = sectors[b].gen;
                    }
                    dir_song = 255;
                }
            }
        }
        r = fm1_flash_erase(sector_address(SONG_STAGING_SECTOR));
        if (r) return r;
    }
    /* Pending batch members that no committed journal adopted are garbage (9.6 v0.5). At
     * boot the scan marked them; at run time none survive song_block_batch(). */
    for (unsigned b = 0; b < SONG_BLOCK_SECTORS; ++b) {
        if (sectors[b].used != SONG_USED_PENDING) continue;
        r = fm1_flash_erase(sector_address(SONG_FIRST_BLOCK_SECTOR + b));
        if (r) return r;
        sectors[b].used = SONG_BLOCK_SECTOR_EMPTY; sectors[b].songs = 0; sectors[b].gen = 0;
    }
    return 0;
}

/* ---- song records (9.5) ------------------------------------------------------------ */
int song_record_valid(const struct song_record *r)
{
    if (r->version != 1 || r->project >= GROOVE_PROJECT_SLOTS || (r->flags & ~3U) ||
        r->rows < 1 || r->rows > SONG_ROWS || r->loop_row >= r->rows) return SONG_INVALID;
    /* Checkpoint (f), 9.5 v0.5.1: the tempo override is 0 (project tempo) or 30..300 BPM. */
    if (r->tempo && (r->tempo < 30 || r->tempo > 300)) return SONG_INVALID;
    for (unsigned i = 0; i < 12; ++i) if (r->name[i] < 32 || r->name[i] > 126) return SONG_INVALID;
    for (unsigned t = 0; t < SONG_TRACKS; ++t) if (r->channel[t] > 16) return SONG_INVALID;
    for (unsigned i = 0; i < r->rows; ++i) {
        const struct song_row *row = &r->row[i];
        if (row->repeat < 1 || row->repeat > 64 || (row->flags & ~1U) ||
            (row->steps && (row->steps > 64 || row->steps % 16))) return SONG_INVALID;
    }
    return 0;
}
int song_record_read(unsigned song, struct song_record *out)
{
    if (song >= SONG_SONGS || state == SONG_STORAGE_ERROR) return SONG_INVALID;
    int r = fm1_flash_read(sector_address(SONG_FIRST_SONG_SECTOR + song), out, sizeof *out);
    if (r) return r;
    if (out->magic != SONG_MAGIC_RECORD || out->commit != 0) return SONG_EMPTY;
    if (out->crc != crc((const uint8_t *)out + 20, SONG_RECORD_BODY_END - 20)) return SONG_INVALID;
    return song_record_valid(out);
}
int song_record_write(unsigned song, const struct song_record *in)
{
    if (song >= SONG_SONGS || state != SONG_STORAGE_READY) return SONG_INVALID;
    int r = song_record_valid(in);
    if (!r) r = song_storage_prepare();
    if (r) return r;
    uint8_t head[8];
    r = fm1_flash_read(sector_address(SONG_FIRST_SONG_SECTOR + song), head, sizeof head);
    if (r) return r;
    uint32_t generation = le32(head) == SONG_MAGIC_RECORD ? le32(head + 4) + 1U : 1U;
    memset(image, 0xff, sizeof image);
    memcpy(image, in, SONG_RECORD_BODY_END);
    put32(image, SONG_MAGIC_RECORD); put32(image + 4, generation);
    put32(image + 8, SONG_FIRST_SONG_SECTOR + song); put32(image + 16, 0);
    put32(image + 12, crc(image + 20, SONG_RECORD_BODY_END - 20));
    return transact(SONG_FIRST_SONG_SECTOR + song, SONG_RECORD_BODY_END);
}
int song_record_delete(unsigned song)
{
    if (song >= SONG_SONGS || state != SONG_STORAGE_READY) return SONG_INVALID;
    if (dir_song == song) dir_song = 255;
    /* A single erase is atomic enough: a half-erased record fails its CRC and reads as
     * empty. Its block records become garbage for the next compaction. */
    return fm1_flash_erase(sector_address(SONG_FIRST_SONG_SECTOR + song));
}

/* ---- block payloads (9.3) ---------------------------------------------------------- */
int song_payload_valid(const uint8_t *p, unsigned bytes)
{
    if (bytes < SONG_PAYLOAD_MIN || bytes > SONG_PAYLOAD_MAX) return SONG_INVALID;
    unsigned at = 0;
    for (unsigned step = 0; step < SONG_BLOCK_STEPS; ++step) {
        if (at >= bytes) return SONG_INVALID;
        unsigned head = p[at++], count = head & 7U;
        if (count > SONG_NOTES_PER_STEP || (head & 0x80U)) return SONG_INVALID;
        if (at + 3U * count > bytes) return SONG_INVALID;
        for (unsigned n = 0; n < count; ++n, at += 3) {
            if ((p[at] & 0x80U) || !(p[at + 1] & 127U) || !p[at + 2]) return SONG_INVALID;
            for (unsigned m = 0; m < n; ++m) if (p[at - 3U * (n - m)] == p[at]) return SONG_INVALID;
        }
    }
    return at == bytes ? 0 : SONG_INVALID;
}

/* ---- block sectors (9.4) ----------------------------------------------------------- */
/* Walk the records of the block image in RAM: *at is the offset of the next header
 * (20 for the first call); returns 0 at the end of the records, else the record's
 * aligned size and the fields. A record that would overrun the sector ends the walk. */
static unsigned next_record(unsigned *at, unsigned *song, unsigned *id, unsigned *bytes)
{
    unsigned a = *at;
    if (a + SONG_BLOCK_HEADER > 4096 || image[a] == 0xff) return 0;
    unsigned len = le16(image + a + 4), size = align4(SONG_BLOCK_HEADER + len);
    if (image[a] >= SONG_SONGS || len < SONG_PAYLOAD_MIN || len > SONG_PAYLOAD_MAX || a + size > 4096) return 0;
    *song = image[a]; *id = le16(image + a + 2); *bytes = len;
    *at = a + size;
    return size;
}
/* Load block sector b into image and make sure its `used` offset is known. Returns 0,
 * or <0; an unformatted/erased sector loads as an empty FM1B image. */
static int load_block_sector(unsigned b)
{
    int r = read_sector(SONG_FIRST_BLOCK_SECTOR + b);
    if (r) return r;
    if (le32(image) != SONG_MAGIC_BLOCKS || image[5] == SONG_PENDING_BYTE) {
        /* Unformatted, erased, or a pending batch member (9.6 v0.5): nothing stored. */
        memset(image, 0xff, sizeof image);
        put32(image, SONG_MAGIC_BLOCKS); image[4] = 1; image[5] = 0;
        put16(image + 6, 0); put32(image + 8, 0); put16(image + 12, 0);
        sectors[b].songs = 0; sectors[b].gen = 0; sectors[b].used = SONG_BLOCK_SECTOR_EMPTY;
        return 0;
    }
    unsigned at = SONG_BLOCK_AREA, song, id, len;
    while (next_record(&at, &song, &id, &len)) {}
    sectors[b].used = (uint16_t)at;
    return 0;
}
/* Program the image in RAM as block sector b (header refreshed, new generation). */
static int store_block_sector(unsigned b)
{
    unsigned at = SONG_BLOCK_AREA, song, id, len, count = 0, songs = 0;
    while (next_record(&at, &song, &id, &len)) { ++count; songs |= 1U << song; }
    memset(image + at, 0xff, 4096 - at);
    image[4] = 1; image[5] = 0;
    put16(image + 6, count); put32(image + 8, ++block_gen_max); put16(image + 12, songs); put16(image + 14, 0xffff);
    put32(image + 16, crc(image + 20, 4096 - 20));
    int r = transact(SONG_FIRST_BLOCK_SECTOR + b, at);
    if (r) { block_gen_max--; return r; }
    sectors[b].songs = (uint16_t)songs; sectors[b].gen = block_gen_max; sectors[b].used = (uint16_t)at;
    dir_song = 255; /* entries may have moved; rebuilt on demand */
    return 0;
}

/* ---- directory (9.7) --------------------------------------------------------------- */
static int dir_find(unsigned id, unsigned *index)
{
    unsigned lo = 0, hi = dir_count;
    while (lo < hi) {
        unsigned mid = (lo + hi) / 2;
        if (dir_id[mid] < id) lo = mid + 1; else hi = mid;
    }
    *index = lo;
    return lo < dir_count && dir_id[lo] == id;
}
int song_directory_build(unsigned song)
{
    dir_count = 0; dir_song = 255;
    if (song >= SONG_SONGS || state == SONG_STORAGE_ERROR) return SONG_INVALID;
    for (unsigned b = 0; b < SONG_BLOCK_SECTORS; ++b) {
        if (!((sectors[b].songs >> song) & 1U)) continue;
        int r = load_block_sector(b);
        if (r) return r;
        unsigned at = SONG_BLOCK_AREA, s, id, len;
        while (next_record(&at, &s, &id, &len)) {
            if (s != song) continue;
            unsigned i, here = at - align4(SONG_BLOCK_HEADER + len);
            if (dir_find(id, &i)) {
                /* The higher sector generation wins; inside one sector the later record. */
                if (sectors[dir_sector[i]].gen > sectors[b].gen) continue;
            } else {
                if (dir_count == SONG_DIRECTORY_MAX) return SONG_FULL;
                memmove(dir_id + i + 1, dir_id + i, (dir_count - i) * sizeof dir_id[0]);
                memmove(dir_at + i + 1, dir_at + i, (dir_count - i) * sizeof dir_at[0]);
                memmove(dir_sector + i + 1, dir_sector + i, (dir_count - i) * sizeof dir_sector[0]);
                ++dir_count; dir_id[i] = (uint16_t)id;
            }
            dir_at[i] = (uint16_t)here; dir_sector[i] = (uint8_t)b;
        }
    }
    dir_song = song;
    return 0;
}
unsigned song_directory_song(void) { return dir_song; }
int song_block_read(unsigned song, unsigned id, uint8_t *payload, unsigned *bytes)
{
    if (song >= SONG_SONGS || !id || id > 0xffffU) return SONG_INVALID;
    if (dir_song != song) { int r = song_directory_build(song); if (r) return r; }
    unsigned i;
    if (!dir_find(id, &i)) return SONG_EMPTY;
    uint32_t a = sector_address(SONG_FIRST_BLOCK_SECTOR + dir_sector[i]) + dir_at[i];
    uint8_t head[SONG_BLOCK_HEADER];
    int r = fm1_flash_read(a, head, sizeof head);
    if (r) return r;
    unsigned len = le16(head + 4);
    if (head[0] != song || le16(head + 2) != id || len < SONG_PAYLOAD_MIN || len > SONG_PAYLOAD_MAX) return SONG_INVALID;
    r = fm1_flash_read(a + SONG_BLOCK_HEADER, payload, len);
    if (r) return r;
    *bytes = len;
    return 0;
}

/* ---- liveness, reclaim, compaction (9.6) ------------------------------------------- */
/* Live bytes per block sector over all valid songs. With bits != NULL, also mark the
 * live records of block sector `which` (bit = record offset / 4). Leaves the directory
 * on the last song scanned (callers that need it rebuild on demand).
 *
 * Live (9.4, v0.5.1 since checkpoint f): the song's record is valid, a row of that record
 * references the block id, and this is the newest copy of (song, id). A block no row uses
 * (left behind by a rewrite that renumbered its blocks, or by a re-import after a delete) is
 * garbage and is reclaimed by the next compaction; it stays readable until then. */
static uint32_t referenced[SONG_DIRECTORY_MAX / 32];   /* one bit per directory entry */
static int scan_live(uint16_t live[SONG_BLOCK_SECTORS], uint32_t *bits, unsigned which)
{
    memset(live, 0, SONG_BLOCK_SECTORS * sizeof live[0]);
    if (bits) memset(bits, 0, 32 * sizeof bits[0]);
    for (unsigned song = 0; song < SONG_SONGS; ++song) {
        uint8_t head[48];
        uint32_t a = sector_address(SONG_FIRST_SONG_SECTOR + song);
        int r = fm1_flash_read(a, head, sizeof head);
        if (r) return r;
        if (le32(head) != SONG_MAGIC_RECORD || le32(head + 16) != 0) continue; /* deleted: garbage */
        r = song_directory_build(song);
        if (r < 0 && r != SONG_FULL) return r;
        /* Mark the directory entries a row references: the rows (offset 64, 20 bytes each)
         * are read into image, which the directory build has finished with. */
        unsigned rows = head[40] > SONG_ROWS ? SONG_ROWS : head[40];
        r = fm1_flash_read(a + 64, image, rows * 20U);
        if (r) return r;
        memset(referenced, 0, sizeof referenced);
        for (unsigned row = 0; row < rows; ++row)
            for (unsigned t = 0; t < SONG_TRACKS; ++t) {
                unsigned id = le16(image + row * 20U + 2U * t), i;
                if (id && dir_find(id, &i)) referenced[i >> 5] |= 1U << (i & 31U);
            }
        for (unsigned i = 0; i < dir_count; ++i) {
            if (!((referenced[i >> 5] >> (i & 31U)) & 1U)) continue;   /* unreferenced: garbage */
            uint8_t h[SONG_BLOCK_HEADER];
            r = fm1_flash_read(sector_address(SONG_FIRST_BLOCK_SECTOR + dir_sector[i]) + dir_at[i], h, sizeof h);
            if (r) return r;
            live[dir_sector[i]] = (uint16_t)(live[dir_sector[i]] + align4(SONG_BLOCK_HEADER + le16(h + 4)));
            if (bits && dir_sector[i] == which) bits[dir_at[i] >> 7] |= 1U << ((dir_at[i] >> 2) & 31U);
        }
    }
    dir_song = 255;
    return 0;
}
/* Rewrite block sector b with its live records only (through staging). */
int song_storage_compact_sector(unsigned b)
{
    uint32_t bits[32];
    int r = song_storage_prepare();
    if (!r) r = scan_live(live_bytes, bits, b);
    if (r) return r;
    r = load_block_sector(b);
    if (r) return r;
    unsigned at = SONG_BLOCK_AREA, dest = SONG_BLOCK_AREA, song, id, len, size;
    while ((size = next_record(&at, &song, &id, &len)) != 0) {
        unsigned here = at - size;
        if (!((bits[here >> 7] >> ((here >> 2) & 31U)) & 1U)) continue;
        if (dest != here) memmove(image + dest, image + here, size);
        dest += size;
    }
    if (dest == SONG_BLOCK_AREA) {
        /* Nothing live (v0.5): a plain erase reclaims the sector without a staging pass;
         * nothing of value can be lost. */
        r = fm1_flash_erase(sector_address(SONG_FIRST_BLOCK_SECTOR + b));
        if (r) return r;
        sectors[b].songs = 0; sectors[b].gen = 0; sectors[b].used = SONG_BLOCK_SECTOR_EMPTY;
        dir_song = 255;
        return 0;
    }
    memset(image + dest, 0xff, 4096 - dest);
    return store_block_sector(b);
}
int song_storage_status(uint32_t *free_bytes, uint32_t *reclaimable)
{
    *free_bytes = *reclaimable = 0;
    if (state != SONG_STORAGE_READY) return SONG_BUSY;
    int r = scan_live(live_bytes, NULL, 0);
    if (r) return r;
    for (unsigned b = 0; b < SONG_BLOCK_SECTORS; ++b) {
        if (sectors[b].used >= SONG_USED_PENDING) { r = load_block_sector(b); if (r) return r; }
        *free_bytes += 4096U - sectors[b].used;
        *reclaimable += sectors[b].used - SONG_BLOCK_SECTOR_EMPTY - live_bytes[b];
    }
    return 0;
}
int song_storage_compact(void)
{
    if (state != SONG_STORAGE_READY) return SONG_BUSY;
    int r = scan_live(live_bytes, NULL, 0);
    if (r) return r;
    for (unsigned b = 0; b < SONG_BLOCK_SECTORS; ++b)
        if (sectors[b].used >= SONG_USED_PENDING) { r = load_block_sector(b); if (r) return r; }
    position = 0; state = SONG_STORAGE_COMPACTING;
    return 0;
}
int song_block_append(unsigned song, unsigned id, const uint8_t *payload, unsigned bytes)
{
    if (song >= SONG_SONGS || !id || id > 0xffffU || state != SONG_STORAGE_READY) return SONG_INVALID;
    int r = song_payload_valid(payload, bytes);
    if (!r) r = song_storage_prepare();
    if (r) return r;
    unsigned need = align4(SONG_BLOCK_HEADER + bytes), b = SONG_BLOCK_SECTORS;
    for (unsigned pass = 0; pass < 2 && b == SONG_BLOCK_SECTORS; ++pass) {
        if (pass) {
            /* No room anywhere: compact the sector with the most reclaimable bytes. */
            r = scan_live(live_bytes, NULL, 0);
            if (r) return r;
            unsigned best = SONG_BLOCK_SECTORS, gain = 0;
            for (unsigned s = 0; s < SONG_BLOCK_SECTORS; ++s) {
                unsigned g = sectors[s].used - SONG_BLOCK_SECTOR_EMPTY - live_bytes[s];
                if (g > gain) { gain = g; best = s; }
            }
            if (best == SONG_BLOCK_SECTORS) return SONG_FULL;
            r = song_storage_compact_sector(best);
            if (r) return r;
        }
        for (unsigned s = 0; s < SONG_BLOCK_SECTORS; ++s) {
            if (sectors[s].used >= SONG_USED_PENDING) { r = load_block_sector(s); if (r) return r; }
            if (4096U - sectors[s].used >= need) { b = s; break; }
        }
    }
    if (b == SONG_BLOCK_SECTORS) return SONG_FULL;
    r = load_block_sector(b);
    if (r) return r;
    uint8_t *rec = image + sectors[b].used;
    rec[0] = (uint8_t)song; rec[1] = 0; put16(rec + 2, id); put16(rec + 4, bytes);
    memcpy(rec + SONG_BLOCK_HEADER, payload, bytes);
    memset(rec + SONG_BLOCK_HEADER + bytes, 0xff, need - SONG_BLOCK_HEADER - bytes);
    return store_block_sector(b);
}

/* ---- batch writes (9.6 v0.5, checkpoint e) ------------------------------------------ */
/* Validate a batch stream (block records as in 9.4 / the .tabby file) and count the
 * sectors it packs into with the device's rule: in stream order, a record goes into the
 * current sector when it fits in the remaining record area, else it starts the next one;
 * records never split. The last record's padding to a multiple of 4 may be missing. */
static int batch_parse(unsigned song, const uint8_t *s, unsigned bytes, unsigned *needed)
{
    unsigned at = 0, fill = SONG_BLOCK_AREA, n = 1;
    if (!bytes) return SONG_INVALID;
    while (at < bytes) {
        if (bytes - at < SONG_BLOCK_HEADER) return SONG_INVALID;
        unsigned id = le16(s + at + 2), len = le16(s + at + 4), size = align4(SONG_BLOCK_HEADER + len);
        if ((s[at] && s[at] != song) || s[at + 1] || !id || len < SONG_PAYLOAD_MIN || len > SONG_PAYLOAD_MAX ||
            bytes - at < SONG_BLOCK_HEADER + len || song_payload_valid(s + at + SONG_BLOCK_HEADER, len))
            return SONG_INVALID;
        if (fill + size > 4096) { ++n; fill = SONG_BLOCK_AREA; }
        fill += size;
        at += size;
    }
    *needed = n;
    return n > SONG_BATCH_SECTORS ? SONG_INVALID : 0;
}
/* Step 4 of the batch transaction from the journal in image (just built, or read back
 * from staging by song_storage_prepare): every listed sector that carries this batch's
 * generation and is still pending gets header byte 5 programmed to 0 and joins the cache.
 * A journal that fails its checks is ignored (the caller erases staging). */
static int batch_finalize(void)
{
    unsigned n = image[5];
    if (image[4] != 1 || !n || n > SONG_BATCH_SECTORS || le32(image + 16) != crc(image + 20, SONG_BATCH_LIST)) return 0;
    uint32_t gen = le32(image + 8);
    for (unsigned i = 0; i < n; ++i) {
        unsigned sector = image[20 + i];
        if (sector < SONG_FIRST_BLOCK_SECTOR || sector >= SONG_REGION_SECTORS) continue;
        unsigned b = sector - SONG_FIRST_BLOCK_SECTOR;
        uint8_t head[20];
        int r = fm1_flash_read(sector_address(sector), head, sizeof head);
        if (r) return r;
        if (le32(head) != SONG_MAGIC_BLOCKS || le32(head + 8) != gen + i) continue;
        if (head[5] == SONG_PENDING_BYTE) {
            uint8_t zero = 0;
            r = fm1_flash_write(sector_address(sector) + 5, &zero, 1);
            if (r) return r;
        }
        sectors[b].gen = gen + i; sectors[b].songs = (uint16_t)le16(head + 12); sectors[b].used = SONG_USED_UNKNOWN;
        if (sectors[b].gen > block_gen_max) block_gen_max = sectors[b].gen;
    }
    dir_song = 255;
    return 0;
}
int song_block_batch(unsigned song, const uint8_t *stream, unsigned bytes)
{
    if (song >= SONG_SONGS || state != SONG_STORAGE_READY || !stream || bytes > SONG_BATCH_BYTES) return SONG_INVALID;
    unsigned need = 0;
    int r = batch_parse(song, stream, bytes, &need);
    if (!r) r = song_storage_prepare();
    if (!r) r = scan_live(live_bytes, NULL, 0);
    if (r) return r;
    /* Step 1: free sectors, lowest first: erased, or holding no live record (garbage). */
    uint8_t chosen[SONG_BATCH_SECTORS]; unsigned n = 0;
    for (unsigned b = 0; b < SONG_BLOCK_SECTORS && n < need; ++b) {
        if (sectors[b].used >= SONG_USED_PENDING) { r = load_block_sector(b); if (r) return r; }
        if (sectors[b].used == SONG_BLOCK_SECTOR_EMPTY || live_bytes[b] == 0) chosen[n++] = (uint8_t)b;
    }
    if (n < need) return SONG_FULL;
    /* Step 2: one erase and one program per batch sector, header byte 5 = pending. */
    uint32_t gen = block_gen_max + 1;
    unsigned at = 0;
    for (unsigned i = 0; i < need; ++i) {
        memset(image, 0xff, sizeof image);
        put32(image, SONG_MAGIC_BLOCKS); image[4] = 1; image[5] = SONG_PENDING_BYTE;
        unsigned dest = SONG_BLOCK_AREA, count = 0;
        while (at < bytes) {
            unsigned len = le16(stream + at + 4), size = align4(SONG_BLOCK_HEADER + len);
            if (dest + size > 4096) break;                     /* same rule as batch_parse */
            memcpy(image + dest, stream + at, SONG_BLOCK_HEADER + len); /* padding stays 0xFF */
            image[dest] = (uint8_t)song; image[dest + 1] = 0;
            dest += size; at += size; ++count;
        }
        put16(image + 6, count); put32(image + 8, gen + i); put16(image + 12, 1U << song); put16(image + 14, 0xffff);
        put32(image + 16, crc(image + 20, 4096 - 20));
        /* Marked pending in the cache first: after a failure anywhere below, the next
         * song_storage_prepare() (every write starts with one) erases these sectors and
         * the uncommitted journal, and the batch leaves no trace. */
        sectors[chosen[i]].used = SONG_USED_PENDING; sectors[chosen[i]].songs = 0; sectors[chosen[i]].gen = 0;
        r = program(SONG_FIRST_BLOCK_SECTOR + chosen[i], dest);
        if (r) return r;
    }
    /* Step 3: the journal and its commit word, one for the whole batch. */
    memset(image, 0xff, sizeof image);
    put32(image, SONG_MAGIC_STAGING); image[4] = 1; image[5] = (uint8_t)need; image[6] = (uint8_t)song; image[7] = 0;
    put32(image + 8, gen); put32(image + 12, 0xffffffffU);
    for (unsigned i = 0; i < need; ++i) image[20 + i] = (uint8_t)(SONG_FIRST_BLOCK_SECTOR + chosen[i]);
    put32(image + 16, crc(image + 20, SONG_BATCH_LIST));
    r = program(SONG_STAGING_SECTOR, 20 + SONG_BATCH_LIST);
    if (!r) { uint32_t zero = 0; r = fm1_flash_write(sector_address(SONG_STAGING_SECTOR) + SONG_JOURNAL_COMMIT, &zero, sizeof zero); }
    /* Steps 4 and 5. Once committed, a failure here is finished by the next prepare(). */
    if (!r) r = batch_finalize();
    if (r) return r;
    return fm1_flash_erase(sector_address(SONG_STAGING_SECTOR));
}
