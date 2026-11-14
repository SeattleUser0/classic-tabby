The page of tabby-v04.5 could not import parts that need the new clip form; fixed. Install this one (Full backup first; storage does not move).

# Classic Tabby tabby-v04.5.1: the page imports v3 clips

- Firmware package build ID: `3df5848e878827d6` (first 16 hex digits). App image 456196 bytes (measured), margin 63261 bytes
  below the 519457-byte limit: the firmware is tabby-v04.5's with its version text.
- Everything of tabby-v04.5 (docs/releases/tabby-v04.5.md): v3 clips played from their event lists, rows of up to 128
  steps, clip program and bank, the importer's v3 rule, backup and files that carry v3 clips.

## What is fixed

- **The workbench page of tabby-v04.5 could not import a MIDI part that needs a v3 clip** (a chord of more than four notes,
  controller events, rows of more than 64 steps): it stopped with "clip-v3.js not loaded". The page's script bundle did not
  contain the v3 clip module; the tests loaded it another way and did not see that. The module is in the bundle now, and a
  new test (tests/workbench/page-bundle.mjs) loads the importer exactly as the page does and checks the built page.
  Found on the device validation of tabby-v04.5, before anything else was released.

## Hardware validation

On one SMK-37 Pro, from the NUC, nobody at the panel (docs/BUILD.md 37.5): installed from the main page (one attempt, 12.2 s).
Six songs imported through this page and played by remote command, the MIDI out on DIN and USB compared with the events the
songs hold: every expected note-on is there (6, 16, 7, 16, 960 and 1600 of them), nothing extra, nothing left sounding; worst
timing error on USB 0.0 to 1.4 ms. Among them a six-note chord (a v3 clip), controller events in a clip, and rows of 128
steps. 0 underruns, 0 DMA overruns. Full backup and Verify against file with v3 clips on the device: PASS.

## Known limits

- With "keep controller events" ticked, a control change that sits exactly at a row start is sent twice (once as the row
  event, once from the clip): the same value twice, harmless. Fixed in the next release.
