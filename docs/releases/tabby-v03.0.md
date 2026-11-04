# Classic Tabby tabby-v03.0 — exact note timing, track launching, lead time, Bluetooth settings in the workbench

> **Back up before updating.** Export your projects from the workbench you are using now
> (Projects & sounds tab) and export your songs as `.tabby` files (Library tab) before
> installing this firmware. Restoring factory V16 from the workbench overwrites the last
> 40 KB of song storage, so the song export matters even if you only mean to go back.

Classic Tabby is a performance fork of SMK37 Open V01 for the M-VAVE SMK-37 Pro. Everything
below is built from the tagged tree with the project's reproducible Linux toolchain. The
native toolchain and the Windows toolchain under Wine produce byte-identical output
(docs/BUILD.md).

- Firmware package build ID: `77077ef338a95beffd665da8b003e96929edf29bca840d4166dd3e7fe69e29d4`.
  The Device update tab shows build number **77077ef338a95bef**. The version line still
  reads **V01**, the Open firmware line this fork is built on, and the device identifies as
  `SMK-37 Pro_8000001` as Open V01 does.
- App image 451396 bytes. The packaging limit is 453921 bytes, so the margin is 2525 bytes.
- **Not yet hardware-validated.** The firmware is tested on the host and in the browser
  simulator. The hardware checklists for this release are docs/BUILD.md sections 13.4,
  14.5, 17.3, 18.5 and 19.5.

## New

Exact note timing. A note keeps the start offset and the length that the `.mid` file gives
it, in units of 1/480 of a step. The importer no longer quantizes by default. A quantize
switch is in the block editor for when you want it.

Track launching. A new TRACK LAUNCH page sits on the SCL button while a song plays. Each of
the eight tracks can leave the song and play one of the song's patterns on its own loop.
Launches, stops and returns to the song land on the next bar. The master transport, the MIDI
clock and the Song Position Pointer keep running whatever the tracks do. The SONG page's
scene jumps bring every track back to the song.

Per-channel lead time in the rig. Each channel in the workbench's rig setup has a "Lead ms"
value. A program change on that channel leaves that long before the bar, for launches and
scene changes alike.

Bluetooth settings in the workbench. The Library tab has a "Bluetooth settings" group that
reads and writes the radio on/off switch, Bluetooth audio, the DEVICE/HOST role, and forgets
BLE MIDI pairs. Each change is written to the device at once.

## Removed

The device's BLE page is gone. Bluetooth MIDI still works. Its settings moved to the
workbench as described above. The device's BT button now shows "BLUETOOTH: SET IN WORKBENCH".

The NAME page is gone. Projects are named in the workbench.

## Compatibility

Songs written by tabby-v02.0 keep playing as before, including swing. The workbench rewrites
a song in the new format the next time you write it. A rewritten song plays straight unless
its "swing follows the project setting" box is ticked.

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
https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v03.0.zip, the exact
tree the firmware was built from (GPLv3 with the SMK37 SDK linking exception; SDK and
resource terms in THIRD_PARTY.md). Build instructions: docs/BUILD.md. Formats of the song
storage and the transfer commands: docs/tasks/TASK-03-step1-assessment.md section 9.

## Before pressing anything

In the workbench's Device update tab the page should show Firmware **SMK37 Pro Open**,
version **V01**, build number **77077ef338a95bef**. After Connect device, the device
identity line must read `SMK-37 Pro_016` (factory V16) or `SMK-37 Pro_8000001` (an Open
firmware already installed). Any other identity, in particular an Orange Cat FM-1, is the
wrong device: do not continue. Make the backups named at the top first.
