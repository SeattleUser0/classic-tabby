DIRECTION for each clip on CLIP SETTING: forwards, backwards, or forwards then backwards. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.20: direction for each clip

- Firmware package build ID: `693c8946957ae272` (first 16 hex digits). App image 487588 bytes (measured), margin 31869 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 43). From tabby-v04.19 (`60dd42e69b99e957`): +1184 bytes. At least
  15360 bytes stay free for fixes, so 16509 bytes can still go to features. Free RAM 142764 bytes (-256).
- Installing over tabby-v04.2 to tabby-v04.19 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20.
- Released through the candidate flow: published as builds/tabby-v04.20-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What is new

- **DIRECTION** on CLIP SETTING (FX on CLIPS, page 2/3, after STEP SIZE): FORWARD, REVERSE or FWD THEN REV.
  REVERSE plays the clip's steps from the last to the first; each note keeps its place inside its step and its
  length. FWD THEN REV plays the clip forwards and then backwards, twice as long; if that would be more than 128
  steps or 512 events the line shows LONG and the clip plays forwards.
- The clip itself is not changed. The STEP page shows the clip's own steps: the running light walks backwards, and
  a take is recorded at the step that sounds.
- The MC-707's random direction is not built.
- CLIP SETTING has 24 lines.

## Validation

Filled in after the candidate ran on the device.
