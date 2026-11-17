# Scenes: song record version 3

Version 0.2 (2026-11-17; first version 2026-11-14, Task 17 Goal 3, tabby-v04.6). How a song is stored as scenes with a clip table per track, what the
firmware does with it, and how songs get into this form. Source: docs/tasks/TASK-10-step1-assessment.md C.0, C.1, C.5, D.2, D.3.

Revision log
- v0.2 2026-11-17: section 2.1, the header bytes and the scene flag added since tabby-v04.10 (they were only in SPEC 19.13 to 19.16).
- v0.1 2026-11-14: first version.

## 1. The model

- A **clip** is a block (a v2 block or a v3 clip, docs/CLIP-V3.md) that belongs to a track. Each track has 64 **places**
  for clips; the device shows them in banks of 16 (Goal 4).
- A **scene** names at most one clip per track (by its place), a length in steps (16 to 128, a multiple of 16), a repeat
  count (1 to 64) and "loop here". A song has 1 to 128 scenes (8 banks of 16). Played in order they are the song (the
  scene chain); the length a scene plays is its steps times its repeat count.
- The **master cycle** (2 to 128 steps, 16 unless the song says otherwise) is the grid for everything that is queued while
  the song plays: a track launch, a track stop, back to the song, a scene recall in "bar" mode all land on its next multiple,
  counted from the song's start.

## 2. The record (4096 bytes; little-endian)

Bytes 0..63 are the header of versions 1 and 2 with `version` = 3 (offset 20) and one new field: byte 43 = the master cycle
in steps (0 = 16). `rows` (byte 40) is the number of scenes. Bytes 2624..4091 are the row event table of version 2 (events
belong to scenes as they belonged to rows); it is always present (it may be empty). The CRC covers 20..4091.

### 2.1 Header bytes added since (a song saved on the device)

| Byte | Since | Content |
| --- | --- | --- |
| 44 | tabby-v04.10 | bits 0-1 CLICK (0 off, 1 when recording, 2 always); bits 2-3 CLICK OUT (0 internal, 1 MIDI note, 2 both); bits 4-5 COUNT-IN (0 off, 1, 2 = cycles, 3 = 4 cycles); bits 6-7 CLICK LEVEL (tabby-v04.14: 0 MID, 1 LOW, 2 HIGH) |
| 45 | tabby-v04.10 | the MIDI click's channel + 1 (0: channel 10) |
| 46 | tabby-v04.10 | the MIDI click's note (0: note 37) |
| 56..59 | tabby-v04.14 | the controller numbers K1 to K4 send on CLIPS, each number + 1 (0: 74, 71, 1, 11) |
| scene flags | tabby-v04.10 | bit 1: the scene was stored on the panel; its clips keep their own lengths (SONG_ROW_FLAG_OWN) |

All of them are 0 in a song that was never changed on the device. Every reader must accept them and every writer
must keep them: the device (app/song_storage.c), the page (sdk/WebUpdate.js songRecordParse / songRecordBuild) and the
workbench importer (web/import/song-format.js decodeRecord / encodeRecord). tests/workbench/setup-sim.mjs runs a record
the device wrote through both page readers and compares the bytes they write back. A page older than a byte's release
either refuses the song (the tabby-v04.10 page and a stored scene) or drops the byte when it rewrites the song.

| Bytes | Content |
| --- | --- |
| 64..1087 | the clip table: 8 tracks x 64 places, a block id (u16) each, 0 = empty |
| 1088..2623 | 128 scenes of 12 bytes: `clip[8]` (per track 0 = silent, 1..64 = place + 1), `repeat` (1..64), `flags` (bit 0 loop here), `steps` (16..128, multiple of 16), `reserved` (0). Scenes beyond `rows` are all 0 |

Refused (SONG_INVALID): a scene that names an empty place or a place above 64, steps or repeat out of range, reserved bits,
a master cycle of 1 or above 128, bytes in a scene beyond the count, any version other than 1, 2, 3.

## 3. The firmware (app/song_storage.c, app/song.c)

- It reads versions 1, 2 and 3 and never rewrites a record. Migration happens only when a song is written again from the
  workbench (re-saved or re-imported).
- `song_record_expand` turns a loaded record into the scheduler's rows (a scene's clips become the row's block ids) and a
  `struct song_model`: the clip table, each scene's places, the master cycle. A version-1 or -2 record gets its clip table
  from its rows (per track every distinct block in the order of its first row, up to 64) and a cycle of 16 steps, so the
  clip workflow sees every song the same way. The scheduler itself is unchanged: a version-3 song plays byte-identical MIDI
  to the same song stored as rows (tests/host/smoke.c section 21).
- The master cycle replaces the fixed bar of 16 steps in the launch quantize (`next_bar`).
- Capability flag bit 4 (command 27) announces version 3. Remote ops 9, 10, 11 queue a track launch, stop and back-to-song
  (for the unattended tests).

## 4. The workbench and the importer

- sdk/WebUpdate.js `songRecordParse` / `songRecordBuild` and web/import/song-format.js `decodeRecord` / `encodeRecord` read
  and write version 3 (`song.version = 3` / `song.recordVersion = 3`, the master cycle, the clip table: places a song
  already has are kept, also for clips no scene uses; a block a scene uses that has no place gets the first free one).
- The song editor has "Stored as" (scenes or rows) and "Master cycle"; a new song is scenes when the device can take them.
  Writing a scenes song to firmware without flag bit 4 is refused with the reason.
- The importer (`record: 'scenes'`, the import page's box, ticked at the start) groups the parts into clips of up to 8 bars
  (the longest whole-bar scene length of at most 8 bars and 128 steps), builds one scene per stretch, sets the master cycle
  to the file's bar (12 steps for 3/4), and fails with the reason when a track would need more than 64 clips.
  `record: 'rows'` (the importer's own default) writes rows as before.
- Full backup, restore, verify and .tabby files carry the record as it is; the backup also holds clips no scene uses.
