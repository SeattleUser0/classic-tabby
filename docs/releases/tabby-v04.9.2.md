After a stop no pad stays green and every clip can be reserved; otherwise tabby-v04.9.1. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.9.2: the CLIPS page after a stop

- Firmware package build ID: `25b19e683786f068` (first 16 hex digits). App image 471108 bytes (measured), margin 48349 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 31). From tabby-v04.9.1 (`fdcb1d2e916fb8a6`): +32 bytes.
- Installing over tabby-v04.2 to tabby-v04.9.1 keeps storage as it is. Take a Full backup first anyway.

## What changed

- **After the song is stopped, nothing shows as playing.** Before, a clip that had been launched kept its green pad on the
  CLIPS page after the stop, its track still read CLIP, and a press on that pad, meant to reserve the clip for the next
  PLAY, did nothing. Now the pad is white and reserves like any other. In tabby-v04.7 to tabby-v04.9.1; found by the
  unattended device tests.

Everything else is tabby-v04.9.1: recording with REC, step editing, clip launching.

## Hardware validation

Installed on the SMK-37 Pro on 2026-11-16 through the published page (Full backup first; identity checked; one attempt;
"Firmware ready." after 11.1 s). By remote keys and MIDI in, nobody at the panel (docs/BUILD.md 44.1):

- The CLIPS page 40 of 40, and 40 of 40 again straight after a stop (the case that was wrong before).
- Recording 15 of 15, the STEP page 18 of 18, HOME on the STEP page, 960 timed notes all present.
- One line of 960 notes: band 1.77 ms on DIN, 1.73 ms on USB. No audio underrun. Full backup and verify: PASS.
