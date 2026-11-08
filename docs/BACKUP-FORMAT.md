# Classic Tabby full backup file, format version 1

Version 0.1, 2026-11-07 (Task 11 Step 2).

Revision log
- v0.1 2026-11-07: first version, written with the workbench code (sdk/WebUpdate.js:
  `Library.fullBackup`, `backupParse`, `fullRestore`, `fullVerify`) and its test
  (tests/workbench/backup.mjs).

## 1. What it is

One JSON file holds everything on a Classic Tabby device that a later firmware may need to put
back: the project slots, the workspace, the device and session settings, the songs and their
blocks, plus the browser's "My rig" profile. The workbench's library tab makes it ("Full
backup"), checks it ("Backup file"), writes it back ("Full restore", which ends with a verify)
and compares it with a device ("Verify against file").

The file never names a flash address. A backup is read, and a restore is written, only through
the project library's transfer commands, so one file restores onto the stock layout (USER 536576)
and onto any moved layout, such as the 471040 probe (docs/FLASH-BUDGET.md 3.5).

## 2. How it is read and written

| Content | Read with | Written with |
| --- | --- | --- |
| Project slots 1–16 | command 9 (name or empty), command 8 (load the slot into the workspace), download kind 3 (project + tuning block, 4264 bytes; kind 0 on firmware without tuning) | upload kind 3/0 into the workspace, command 7 (save to the slot), reload and compare (the existing `saveProject`) |
| Workspace and current slot | command 0 (current slot), download kind 3 before the slots are read | after the slots: command 8 (the current slot), then upload kind 3 when the workspace differs from that slot |
| Device and session settings | download kind 8 (40 bytes, diagnostic build and later) | upload kind 8: validated in full, then applied; the device stores it 1.5 s later |
| Bluetooth switches | command 24 | inside kind 8; command 24 when the file has no kind 8 |
| Clock mode | command 0 byte 5 | inside kind 8 |
| Songs 1–16 | download kind 5 (record), kind 6 per block id the record references | the existing `songWrite`: an occupied slot is deleted first, the record (kind 5), the blocks in kind-7 batches, the record read back. A song slot that is empty in the file is deleted on the device |
| Firmware identity, build ID | update protocol commands 17 and 49 on the same ports | not written |
| Layout | capability reply 21: the song region size; user_bytes = region + 73728 | not written |

Reading a backup loads every project slot into the workspace in turn and then puts the workspace
back as it was (the current slot, then any unsaved edits). The device's "current slot" setting
changes while the slots load and is stored again at the end; nothing else is written. Song
playback must be stopped.

## 3. The file

UTF-8 JSON, one object. Binary payloads are entries `{size, crc32, data}` with `data` in base64,
`size` its decoded length and `crc32` the standard CRC-32 (the same function as the transfer
protocol) of the decoded bytes.

| Key | Value |
| --- | --- |
| `format` | `"classic-tabby-full-backup"` |
| `version` | `1` |
| `created` | ISO 8601 time of the backup |
| `workbench` | the workbench's display version (for example `tabby-v03.3-diag`), or null |
| `device` | `identity` (for example `SMK-37 Pro_8000001`), `build_id` (64 hex digits or null), `user_bytes`, `song_region`, `project_bytes`, and the capability flags `tuning`, `song_storage`, `settings_kind8`, `radio` |
| `current_slot` | 0–15 |
| `workspace` | entry: the workspace (4264 bytes with tuning; 4064 or 4048 on older firmware) |
| `projects` | 16 objects in slot order: `{slot, empty: true}`, or `{slot, name, size, crc32, data}`, or `{slot, name, error}` for a slot that would not load (its device error code) |
| `settings` | `clock` (0 internal, 1 MIDI), `kind8` (entry, 40 bytes, or null), `radio` (`{on, audio, host}` or null) |
| `songs` | 16 objects in slot order: `{slot, empty: true}` or `{slot, record: entry (4096 bytes), blocks: [{id, size, crc32, data}, ...]}`, blocks sorted by id |
| `rig` | the browser's "My rig" profile (`tabby-rig/1` JSON, as the rig panel exports it) or null |
| `not_included` | sentences naming what the file cannot hold (section 5) |
| `counts` | `projects` (slots with data), `songs`, `blocks` |
| `end` | `"classic-tabby-full-backup"` again: the last key, so a cut file has no end marker |

## 4. Transfer kind 8: device and session settings (40 bytes)

Added by the diagnostic build (app/project.c, `CT_DIAG`); firmware without it reports capability
bit 7 clear (command 22, byte 8) and refuses kind 8. Little-endian.

| Bytes | Field |
| --- | --- |
| 0–3 | magic `TBS1` (0x31534254) |
| 4 | version 1 |
| 5 | BLE MIDI role: 0 DEVICE, 1 HOST |
| 6 | clock mode: 0 internal, 1 MIDI |
| 7 | radio-off bits: 1 radio, 2 Bluetooth audio, 4 BLE MIDI (the device keeps MIDI on) |
| 8–15 | the MIDI configuration: output channels (4 bytes, two tracks per byte), output modes (2 bytes), port/clock/live flags, Thru |
| 16–23 | track roles 1–8: 0 PROJECT, 1 LIVE, 2 OFF |
| 24–31 | input channels 1–8: 0–15 |
| 32–35 | panel preferences as the SMK-37 panel stores them; FF FF FF FF = none |
| 36–39 | CRC-32 of bytes 0–35 |

On upload the device checks every field first and changes nothing on any error (reply code 71);
then it applies them as the panel and command 24 would and stores them 1.5 s later (the slot-16
settings sector and the tuning sector). The current slot is not in kind 8.

## 5. What a backup does not hold

- **Bluetooth pairings.** They live in the BTIF area, which the vendor runtime owns. After a layout
  change pair again.
- **Staging and journal sectors.** They are transient. A committed journal is finished by the
  device before any transfer write starts; an uncommitted one is discarded. The backup reads the
  settled state, so there is nothing to keep.
- **Rig profiles other than "My rig".** The built-in profiles come with the workbench.
- **Device and session settings from firmware without kind 8** (tabby-v03.2 and earlier). The file
  says so in `not_included`; note the MIDI page settings, track roles and input channels by hand.

## 6. Restore rules

1. The whole file is parsed and checked before anything is sent: format, version, end marker,
   every payload's length and CRC-32, every project payload (`projectVersion`, including its
   tuning block), every song record (`songRecordParse`) and block (`songPayloadParse`), every
   block a record references present, and the counts. A file that fails any check is refused and
   the device is not touched.
2. Then the device is checked: song storage present if the file has songs; storage READY (not OLD
   DATA, which needs ACTIONS > ERASE OLD SAMPLE/DX7 first; not scanning or compacting); playback
   stopped.
3. Write order: device settings (track roles decide how projects load), project slots, songs, then
   the current slot and the workspace.
4. A project slot that is empty in the file but holds a project on the device is left as it is
   (there is no transfer command that clears a slot) and the restore says so; verify then fails at
   that slot.
5. After the restore the workbench reads everything back (`fullVerify`) and compares: project
   slots, current slot and workspace byte for byte, kind 8 byte for byte (or the Bluetooth
   switches without it), the clock mode, every song record from byte 20 (bytes 0–19 are storage
   bookkeeping: magic, generation, target, CRC, commit word) and every block byte for byte. It
   shows PASS with the number of items compared, or FAIL with the first difference.

## 7. Compatibility

A version-1 reader refuses any other version. Later versions may add keys; a version-1 file
stays readable by later workbenches. The project and song payloads inside are the device's own
transfer formats, so their own version fields apply (projects v3/v4, song records v1/v2, block
payload format 1).
