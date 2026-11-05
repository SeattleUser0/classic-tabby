# Classic Tabby tabby-v03.1 — the manual, and the version on the boot screen and in the workbench

Manual rewritten for Classic Tabby. The installed version now shows on the boot screen and
in the workbench. No other firmware change from tabby-v03.0; reflashing is optional.

> **Back up before updating.** Export your projects from the workbench (Projects & sounds)
> and export your songs as `.tabby` files (Song mode) before installing any firmware.
> Restoring factory V16 from the workbench overwrites the last 40 KB of song storage, so
> the song export matters even if you only mean to go back.

Classic Tabby is a performance fork of SMK37 Open V01 for the M-VAVE SMK-37 Pro. Everything
below is built from the tagged tree with the project's reproducible Linux toolchain. The
native toolchain and the Windows toolchain under Wine produce byte-identical output
(docs/BUILD.md).

- Firmware package build ID: `e8d7b7ac4f80c45fb393447f3a260b6288ef854afa23fe507e6a520a558e8f07`.
  The Device update tab shows build number **e8d7b7ac4f80c45f**.
- The boot screen and the workbench badge show **tabby-v03.1**. The update tab's Version line
  shows it too; the Open base version in the firmware details stays **V01**, and the device
  still identifies as `SMK-37 Pro_8000001`.
- App image 451396 bytes, the same size as tabby-v03.0. The packaging limit is 453921 bytes,
  so the margin is 2525 bytes.
- The only firmware change from tabby-v03.0 is the display version string. A build of these
  sources with the version forced back to the old label differs from the tabby-v03.0
  firmware in its 32-byte build ID alone (docs/BUILD.md 9.3d).
- **Not yet hardware-validated.** The hardware checklists are docs/BUILD.md sections 13.4,
  14.5, 17.3, 18.5 and 19.5.

## Manual

The Help tab of the workbench has twelve new chapters on Classic Tabby, in English and shown
in both languages: what it is, getting started, songs, scene changes, track launching,
importing MIDI files, timed notes, program changes and CCs with the device setup checklist,
FM6 preview, Bluetooth settings, storage, and a quick reference that prints on one sheet.
The SMK37 OPEN chapters that still apply follow, corrected for the removed features.

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
https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v03.1.zip, the exact
tree the firmware was built from (GPLv3 with the SMK37 SDK linking exception; SDK and
resource terms in THIRD_PARTY.md). Build instructions: docs/BUILD.md. The archive's VERSION
file carries the tag, so a build from the archive shows the same version.

## Before pressing anything

In the workbench's Device update tab the page should show Firmware **SMK37 Pro Open**,
Version **tabby-v03.1**, build number **e8d7b7ac4f80c45f**. After Connect device, the device
identity line must read `SMK-37 Pro_016` (factory V16) or `SMK-37 Pro_8000001` (an Open
firmware already installed). Any other identity, in particular an Orange Cat FM-1, is the
wrong device: do not continue. Make the backups named at the top first.
