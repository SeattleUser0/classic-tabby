# tabby-p0-probe64: TEST BUILD — moves the device storage; make a full backup first

**This test build moves the device's storage (USER 64 KiB smaller). Make a Full backup on
tabby-v03.3-diag first and keep it; do not use this build for anything but the Task 11 hardware
checklist (docs/BUILD.md 24.6).**

> Installing it makes your projects, device settings and songs unreadable until you run Full
> restore from that backup; going back to tabby-v03.3-diag needs the same restore again (docs/BUILD.md
> 24.5, the way back). Bluetooth pairings are lost once. If the device does not boot or no longer
> appears as a USB MIDI device after the install, stop and report; do not retry.

This is tabby-v03.3-diag (same sources, same counters) with one change: the USER region is 471040
bytes instead of 536576, its base at 0x8C000 instead of 0x7C000 (docs/FLASH-BUDGET.md 3.5). It
tests whether the SDK, the update loader, Bluetooth and the workbench accept a moved boundary,
which every later phase of the MC-707 workflow port depends on (docs/tasks/TASK-10-step1-assessment.md).

- Firmware package build ID: `2525715294cc33a7d14ec1285d6f8c7f1102e911aa395af8e1af625417dcc73c`.
  The Device update tab shows build number **2525715294cc33a7**.
- The boot screen and the workbench badge show **tabby-p0-probe64**; the Open base version stays
  **V01**, and the device still identifies as `SMK-37 Pro_8000001`.
- App image 453284 bytes; packaging limit 519457 with the moved boundary (margin 66173). Song
  storage: 97 sectors (80 for blocks) instead of 113 (96).
- The result is on the device: ACTIONS (hold SEQ) reads `USER 471040 SONG READY` when the SDK
  accepted the layout, `USER 0 INVALID` when it did not.
- **Not hardware-validated.** That is what it is for.

## Files

| File | Purpose |
| --- | --- |
| `SMK37_PRO_OPEN.fwsc` | Firmware package for the SMK-37 Pro (the workbench writes it) |
| `SMK37-Open-Source.html` | Offline workbench with this firmware and the stock V16 restore image embedded |
| `SHA256SUMS.txt` | SHA-256 of the two files above |

Hosted page for this build only (the main page never offers it):
https://seattleuser0.github.io/classic-tabby/probe64/

## Source

The page's "Source and SDK" link and this release point at the archive of this tag,
https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-p0-probe64.zip. Build:
`make package DIAG=1 USER_BYTES=471040 TAG=tabby-p0-probe64` (docs/BUILD.md 24.1, 24.5).

## Before pressing anything

The page's title starts with "TEST BUILD (moves storage)" and a red-bordered note above the tabs
says the same. The Device update tab shows Version **tabby-p0-probe64**, build number
**2525715294cc33a7**. The device identity after Connect device must read `SMK-37 Pro_8000001`
(or `SMK-37 Pro_016` in checklist step 6). Have `backup-4-diag.json` from the checklist's step 4.
