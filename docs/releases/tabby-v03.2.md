# Classic Tabby tabby-v03.2 — the Wrong Room rig, device profiles, importer channels, the MIDI guide

Wrong Room rig profile, new device profiles, importer sets output channels from the file, MIDI
authoring guide built in. Firmware unchanged apart from the version label.

> **Back up before updating.** Export your projects from the workbench (Projects & sounds)
> and export your songs as `.tabby` files (Song mode) before installing any firmware.
> Restoring factory V16 from the workbench overwrites the last 40 KB of song storage.

Classic Tabby is a performance fork of SMK37 Open V01 for the M-VAVE SMK-37 Pro. Everything
below is built from the tagged tree with the project's reproducible Linux toolchain. The
native toolchain and the Windows toolchain under Wine produce byte-identical output
(docs/BUILD.md).

- Firmware package build ID: `d842d29d324339e73beb16e984046711d95baf556a777f95ad78cb6d679215f9`.
  The Device update tab shows build number **d842d29d324339e7**.
- The boot screen and the workbench badge show **tabby-v03.2**; the Open base version in the
  firmware details stays **V01**, and the device still identifies as `SMK-37 Pro_8000001`.
- App image 451396 bytes, as tabby-v03.1; margin 2525 bytes to the packaging limit.
- The firmware sources are those of tabby-v03.1. A build with the version forced back to
  tabby-v03.1 differs from that release's package in its 32-byte build ID alone (plus the
  package checksums), because the workbench page's pinned hash is part of the build identity
  (docs/BUILD.md 9.3e). Reflashing is optional.
- **Not yet hardware-validated.** The hardware checklists are docs/BUILD.md sections 13.4,
  14.5, 17.3, 18.5, 19.5 and, for this release, 23.5.

## What is new

The rig setup panel has a built-in "Wrong Room" profile: one channel per device, the H4MIDI WC
routing and filters, the FM6 internal engine on channel 9 pinned to Tabby track 8, three M8 parts
on channels 4, 10 and 13, the Proteus on channels 5 to 8 behind a filtered port. It is read-only;
"Copy to my rig" makes the editable copy. Four device profiles were added (Chase Bliss Brothers,
Strymon NightSky, Tone King Royalist Preamp, the SMK-37's own FM6) and the eleven existing ones
were rechecked against the current manufacturer documents and firmware releases.

The MIDI importer sets each track's output channel from the part's channel in the file, places a
part on a pinned channel on its track whatever its order, shows the rig device for every part,
and warns when a channel is not in the rig, when notes go to an effects pedal, when a program
number is outside the device's range, and when a CC is not one the device names.

The MIDI authoring guide (docs/MIDI-GUIDE.md) is generated from the rig profile and the device
definitions: the channel map, one section per device with its connection, channel setting,
program numbering with the wire value beside the shown number, bank select, named CCs and clock,
the limits, and a checker that knows the rig. The Import MIDI panel downloads the guide for the
active rig.

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
https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v03.2.zip, the exact
tree the firmware was built from (GPLv3 with the SMK37 SDK linking exception; SDK and
resource terms in THIRD_PARTY.md). Build instructions: docs/BUILD.md.

## Before pressing anything

In the workbench's Device update tab the page should show Firmware **SMK37 Pro Open**,
Version **tabby-v03.2**, build number **d842d29d324339e7**. After Connect device, the device
identity line must read `SMK-37 Pro_016` (factory V16) or `SMK-37 Pro_8000001` (an Open
firmware already installed). Any other identity, in particular an Orange Cat FM-1, is the
wrong device: do not continue. Make the backups named at the top first.
