# Classic Tabby tabby-v02.0 — song mode, MIDI import, row events and the device library

> **Back up before updating.** Export your projects and DX7 voices from the workbench you
> are using now (Projects & sounds tab) before installing this firmware. The on-device
> sample bank and the DX7 user library have **no place in this firmware**: at the first boot
> the device shows "OLD SAMPLE/DX7 DATA IN FLASH" and erases that data only after you
> confirm "ERASE OLD SAMPLE/DX7" on the ACTIONS page, but once erased it is gone. **Restoring
> factory V16** from the workbench overwrites the last 40 KB of song storage (block sectors
> 86–95): export your songs as `.tabby` files first.

Classic Tabby is a performance fork of SMK37 Open V01 for the M-VAVE SMK-37 Pro. This is
the first release with the fork's own features. Everything below is built from the tagged
tree with the project's reproducible Linux toolchain; the native toolchain and the Windows
toolchain under Wine produce byte-identical output (docs/BUILD.md).

- Firmware package build ID: `41d72747b0f68867dc8f9a8c4457c4558b4399faaca6b3630e52770c8c18f972`
  (the Device update tab shows build number **41d72747b0f68867**; the version line still
  reads **V01**, the Open firmware line this fork is built on, and the device identifies as
  `SMK-37 Pro_8000001` as Open V01 does).
- App image 449252 bytes (packaging limit 453921, margin 4669 bytes).
- **Not yet hardware-validated.** The hardware checklists for this release are
  docs/BUILD.md sections 13.4 (song mode), 14.5 (MIDI import) and 17.3 (row events); the
  firmware is tested on the host and in the browser simulator.

## What is new since tabby-v01.0

**Song mode (Task 03).** Songs of up to 128 rows, each row pointing to one 64-step block
per track, blocks shared through a per-song pool of up to 2048 blocks; up to four notes per
step with their own pitch, velocity and length, probability and retrigger; per-row step
length (16/32/48/64) and repeat count; per-track output channels that override the device
setting while the song plays; queued jumps at the next bar or row end; loop rows and whole-
song loops; a BPM override. 16 songs live in the former sample region of the USER
partition, written through power-cut-safe staging transactions; the SONG page (ACTIONS →
SONG MODE) selects and plays songs, pads queue jumps, "COMPACT SONG STORAGE" reclaims
stale blocks. The workbench's Library tab has the song editor (rows, blocks, step text,
`.tabby` export and import, device or browser-simulator target) and writes songs in batches
through the transfer protocol (kinds 5, 6 and 7, command 23).

**MIDI file import (Task 02).** The Library tab's "Import MIDI file" panel turns a standard
MIDI file (type 0 or 1, including Renoise's mf2t text exports) into a song: parts assigned
to tracks with per-track output channels, bar range, bars per row, note-end rounding and
overflow rules, exact or loose block deduplication, a full list of everything moved,
dropped or ignored; the result can be saved as JSON, exported as `.tabby` or written to the
device or the simulator.

**Row events and the device library (Task 04).** A row can carry program changes, bank
selects and control changes that fire when the row is entered, before its first notes, on
all MIDI out ports, addressed to a MIDI channel; per-device gaps are pre-fired so a bank
select and its program change still land before the bar; "SEND SETUP" on the ACTIONS page
sends row 1's events for a set or after power-up; the SONG page shows the event count and
late sends. The workbench holds the device knowledge: eleven definitions in `web/devices/`
(E-MU Proteus/2 XR, Eventide H90, Zoom MS-70CDR+, Waldorf Blofeld and Pulse 2, Dirtywave
M8, Korg volca fm2, Instruo Seashell, and the M-VAVE FM-1 under the Skiff, Melodee and
Orange Cat firmwares), each with its program numbering, bank scheme, preset names where
the manufacturer publishes them, named controllers, the settings to make on the device,
its sources and its unverified fields; a rig setup (which device on which channel, saved
in the browser, exportable, with an optional per-song copy in the `.tabby` file); a row
event editor that picks presets by name; and the importer converts program changes and
CCs at or near row starts into row events. Song records with events use record version 2;
songs without events keep version 1.

**Removed.** The sampler and the four-sector DX7 user library (their flash region is song
storage now; projects with sampler tracks load with the 808 kit on that track); the DX7
operator editor and tone editor pages (preset select and the macros stay; voices are edited
in the workbench); the sixteen factory scenes (HOME lists the USER projects only; the scenes
are shipped as project files under `web/scenes/` in the source archive and can be imported
through the workbench's project import).

**Fixed on the way.** A V01 project with a sampler track failed validation after its
conversion to the 808 kit (sampler-pad count left at 8).

## Files

| File | Purpose |
| --- | --- |
| `SMK37_PRO_OPEN.fwsc` | Firmware package for the SMK-37 Pro (the workbench writes it; it is not a file to copy onto the device) |
| `SMK37-Open-Source.html` | Offline workbench with this firmware and the stock V16 restore image embedded; open in desktop Chrome or Edge |
| `SHA256SUMS.txt` | SHA-256 of the two files above |

Hosted workbench (same content, served over HTTPS for WebMIDI):
https://seattleuser0.github.io/classic-tabby/

## Source

The page's "Source and SDK" link and this release point at the archive of this tag,
https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v02.0.zip, the exact
tree the firmware was built from (GPLv3 with the SMK37 SDK linking exception; SDK and
resource terms in THIRD_PARTY.md). Build instructions: docs/BUILD.md. Formats of the song
storage: docs/tasks/TASK-03-step1-assessment.md section 9.

## Before pressing anything

In the workbench's Device update tab the page should show Firmware **SMK37 Pro Open**,
version **V01**, build number **41d72747b0f68867**. After Connect device, the device
identity line must read `SMK-37 Pro_016` (factory V16) or `SMK-37 Pro_8000001` (an Open
firmware already installed). Any other identity, in particular an Orange Cat FM-1, is the
wrong device: do not continue. Make the backups named at the top first.
