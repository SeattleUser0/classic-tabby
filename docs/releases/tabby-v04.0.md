# Classic Tabby tabby-v04.0 — this release moves storage; back up first

**This release moves the device storage. Make a Full backup on your current firmware before
installing it, and keep the file.** The USER region is 64 KiB smaller (471040 bytes instead of
536576), so after the install every project slot, the device settings and every song are gone
until you run Full restore from that backup. Bluetooth pairings are lost once (pair again).
Going back to tabby-v03.x is the same procedure in reverse (back up on v04.0, install the v03.x
build from its permanent page, erase old data if offered, restore). Install steps for this release:
docs/BUILD.md 26.6.

> After the install the device may announce OLD DATA IN SONG STORAGE for six seconds and the
> ACTIONS page may show OLD DATA: that is the old layout's flash in the moved song region. Erase it
> from ACTIONS > ERASE OLD DATA (SAVE, then SAVE again to confirm) or from the workbench's "Erase old
> data…" (it asks first), then run Full restore and Verify. Nothing is erased without confirmation;
> projects, tunings and settings are never touched by the erase.

Classic Tabby is a performance fork of SMK37 Open V01 for the M-VAVE SMK-37 Pro. Everything below
is built from the tagged tree with the project's reproducible Linux toolchain; the native toolchain
and the Windows toolchain under Wine produce byte-identical output (`make crosscheck`).

- Firmware package build ID: `b6e9590223446363dff53a2190bd80eb020233c63dd2d90cfa778e361ce0f708`.
  The Device update tab shows build number **b6e9590223446363**; while an install of this build is
  in progress the device's update loader is named `ota-SMK37b6e9590223446363`.
- The boot screen and the workbench badge show **tabby-v04.0**; the Open base version in the
  firmware details stays **V01**, and the device still identifies as `SMK-37 Pro_8000001`.
- App image 447716 bytes; margin **71741 bytes** to the packaging limit of 519457 bytes on the new
  layout (docs/FLASH-BUDGET.md 17). Runtime heap 198636 bytes.
- **Hardware validation:** the storage layout itself was validated on the device with the
  tabby-p0-probe64 test build (USER 471040 SONG READY, full restore onto it verified, the way back
  verified; docs/BUILD.md 25). This build has not been installed on a device yet; it is the first
  normal build on the moved layout. The earlier checklists stay open.

## What is new (Phase 0 of the MC-707 workflow port, Task 12 Part A)

**The storage move is the normal layout** (A1). Song storage: 97 sectors with 80 block sectors
(326080 bytes of block pool) after the 16 project slots; the code image gains 64 KiB of room. The
first boot after the move reports OLD DATA when the song region holds non-song flash, and ACTIONS
and the workbench offer ERASE OLD DATA behind a confirmation. New transfer commands 27 (Classic
Tabby capability: version, flags, USER size) and 28 (erase old data, confirm bytes "ERASE").

**The stock step editor is removed** (A2): the STEP DETAILS, LOCKS and RHYTHM/REC pages, REC
recording, the count-in, the metronome, pad-step mode and the step-editing ACTIONS entries. The
arpeggiator and its ARP page, the factory DX7 bank and the stock pattern inside a project (load,
save, play) stay. The settings that are not pattern data stay on the device, each in one place: a
new **SYNC / MIDI page** on SEQ from any page (K1 CLOCK, K2 CLK IN, K3 SWING, K4 SEQ OUT, PRESETS
KEY OUT), MIDI TRACK on SHIFT + SEQ, the tempo on HOME K4. Help chapters and the panel shortcuts
are updated. −8224 bytes.

**No flash write while the transport runs** (A3). Project SAVE, song uploads and deletes, COMPACT,
ERASE, full restore and settings writes are refused while a song or the pattern plays: the screen
says STOP TO SAVE (or STOP TO ERASE / COMPACT), the workbench says the device is playing and sends
nothing. Reads stay allowed. Setting changes made while playing are saved after the stop.

**Timing counters in every build** (A4). The Task 11 diagnostic counters, the Diagnostics panel
(command 25), the device settings in the full backup (transfer kind 8) and the ACTIONS storage
lines are in the normal build, plus a per-section profile of the control loop (router, song,
storage, screen, panel, transfer, project, SDK; MIDI input apart) for the Phase 1 timing work.
The diagnostic build (`DIAG=1`) now adds only the remote command 26.

**Permanent build pages and a safe resume** (A5). Every published build has a page at
https://seattleuser0.github.io/classic-tabby/builds/<tag>/ that is never removed, listed in
https://seattleuser0.github.io/classic-tabby/builds/ (builds/index.json). If an install was
interrupted, the device's update loader keeps the name of the build it was receiving and accepts
only that build: this workbench reads that name, says which build the loader is waiting for and
links to its page, instead of refusing silently or timing out.

## Compatibility

- Full backup files from tabby-v03.2, tabby-v03.3-diag and the diag-r2 resume build restore onto
  this release (the device settings only from tabby-v03.3-diag and later; the file says so).
- Songs and projects are unchanged in format; a song that fits on v04.0 (80 block sectors) fits on
  v03.x (96). The MIDI importer's storage estimate uses the 80-sector pool.
- Pages older than tabby-v04.0 do not know commands 27 and 28 and cannot erase old data from the
  web; use ACTIONS on the device.

## Files

| File | Purpose |
| --- | --- |
| `SMK37_PRO_OPEN.fwsc` | Firmware package for the SMK-37 Pro (the workbench writes it; it is not a file to copy onto the device) |
| `SMK37-Open-Source.html` | Offline workbench with this firmware and the stock V16 restore image embedded; open in desktop Chrome or Edge |
| `SHA256SUMS.txt` | SHA-256 of the two files above |

Hosted workbench (same content, served over HTTPS for WebMIDI):
https://seattleuser0.github.io/classic-tabby/ — and permanently at
https://seattleuser0.github.io/classic-tabby/builds/tabby-v04.0/

## Source

The page's "Source and SDK" link and this release point at the archive of this tag,
https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v04.0.zip, the exact tree
the firmware was built from (GPLv3 with the SMK37 SDK linking exception; SDK and resource terms in
THIRD_PARTY.md). Build: `make package TAG=tabby-v04.0 DISPLAY_VERSION=tabby-v04.0` (docs/BUILD.md 4
and 26).

## Before pressing anything

In the workbench's Device update tab the page should show Firmware **SMK37 Pro Open**, Version
**tabby-v04.0**, build number **b6e9590223446363**, and a note that this release moves the device
storage. After Connect device, the device identity line must read `SMK-37 Pro_8000001` (an Open
firmware already installed) or `SMK-37 Pro_016` (factory V16). Any other identity, in particular
an Orange Cat FM-1, is the wrong device: do not continue. Have the full backup named at the top.
