HOME works on the STEP page; otherwise tabby-v04.9. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.9.1: HOME on the STEP page

- Firmware package build ID: `fdcb1d2e916fb8a6` (first 16 hex digits). App image 471076 bytes (measured), margin 48381 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 30). From tabby-v04.9 (`d1191dd33942c3c3`): +32 bytes.
- Installing over tabby-v04.2 to tabby-v04.9 keeps storage as it is. Take a Full backup first anyway.

## What changed

- **HOME on the STEP page** goes to the overview, and the clip stays open with its unsaved changes. In tabby-v04.8 and
  tabby-v04.9 HOME did nothing there while a clip was open (EDIT and BT worked). Found by the unattended device tests.

Everything else is tabby-v04.9: recording with REC, step editing, clip launching.

## Hardware validation

Installed on the SMK-37 Pro on 2026-11-16 through the published page (Full backup first; identity checked; one attempt;
"Firmware ready." after 10.7 s). By remote keys (docs/BUILD.md 43.1):

- HOME on the STEP page with an unsaved clip open goes to the overview and the clip stays open.
- Recording 15 of 15, the STEP page 18 of 18, 960 timed notes all present; one line: band 1.77 ms on DIN, 1.80 ms on USB.
- **Known fault, fixed in tabby-v04.9.2:** after the song is stopped, the pad of a clip that had been launched stays green
  on the CLIPS page and cannot be reserved for the next PLAY.
