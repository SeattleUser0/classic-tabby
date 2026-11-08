# Classic Tabby tabby-v03.3-diag — full backup and restore, diagnostic counters, MIDI monitor

Diagnostic build: the tabby-v03.2 firmware and storage layout with timing counters and the
settings transfer for the new full backup. Song playback is unchanged.

> **Back up before updating.** Use the new **Full backup** (Projects & sounds > Full backup and
> restore) and keep the file. On tabby-v03.2 the file cannot hold the device MIDI settings, track
> roles and input channels: note those by hand once; after this update the full backup includes
> them. Restoring factory V16 from the workbench overwrites the last 40 KB of song storage.

Classic Tabby is a performance fork of SMK37 Open V01 for the M-VAVE SMK-37 Pro. Everything
below is built from the tagged tree with the project's reproducible Linux toolchain. The
native toolchain and the Windows toolchain under Wine produce byte-identical output
(docs/BUILD.md 24.7).

- Firmware package build ID: `6ada221504309d10f544a5d9743791e385f60fe2e88b7bc6570b32d2060c78a1`.
  The Device update tab shows build number **6ada221504309d10**.
- The boot screen and the workbench badge show **tabby-v03.3-diag**; the Open base version in the
  firmware details stays **V01**, and the device still identifies as `SMK-37 Pro_8000001`.
- App image 453284 bytes (the diagnostic code is 1888 bytes); margin 637 bytes to the packaging
  limit. Storage layout unchanged (USER 536576).
- **Not yet hardware-validated.** This build exists for the hardware checklist in docs/BUILD.md
  24.6; the earlier checklists (13.4, 14.5, 17.3, 18.5, 19.5, 23.5) stay open.

## What is new

**Full backup and restore** (Projects & sounds tab). One file holds the 16 project slots, the
unsaved workspace and the current slot, the device and session settings (on this firmware), the
Bluetooth switches, every song and block, the firmware's build ID and layout, and the browser's
"My rig" profile. Restore checks the whole file before writing anything, writes only through the
normal transfer commands, and ends with a read-back verify that shows PASS or the first
difference. The same file restores onto a device with a different storage layout. Format:
docs/BACKUP-FORMAT.md.

**Diagnostic counters** (Projects & sounds > Diagnostics, with Read, Reset and Copy as text): the
control loop's period at the call that sends MIDI out, the longest flash erase and write, the
latency from a key or pad press to the router, and the key scan's rate and longest gap. The
ACTIONS page shows the storage size the firmware runs with and the song storage state.

**MIDI monitor** for the computer (tools/linux/midi-monitor.py in the source): reads an ALSA MIDI
input with kernel timestamps and prints the timing spread and drift of the test songs
(tests/midi-import/fixtures/timing-8x16.mid and timing-1x16.mid). It only reads.

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
https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v03.3-diag.zip, the exact
tree the firmware was built from (GPLv3 with the SMK37 SDK linking exception; SDK and resource
terms in THIRD_PARTY.md). Build: `make package DIAG=1 TAG=tabby-v03.3-diag` (docs/BUILD.md 24.1).

## Before pressing anything

In the workbench's Device update tab the page should show Firmware **SMK37 Pro Open**,
Version **tabby-v03.3-diag**, build number **6ada221504309d10**, and the red-bordered note
"Diagnostic build" above the tabs. After Connect device, the device identity line must read
`SMK-37 Pro_016` (factory V16) or `SMK-37 Pro_8000001` (an Open firmware already installed). Any
other identity, in particular an Orange Cat FM-1, is the wrong device: do not continue. Make the
full backup named at the top first.
