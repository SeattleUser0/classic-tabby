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

See the release page's "Hardware validation" text (added after the install) and docs/BUILD.md 43.
