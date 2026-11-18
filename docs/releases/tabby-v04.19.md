STEP SIZE for each clip on CLIP SETTING: half speed, double speed and triplet steps. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.19: step size for each clip

- Firmware package build ID: `60dd42e69b99e957` (first 16 hex digits). App image 486404 bytes (measured), margin 33053 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 42). From tabby-v04.18 (`1046c8ec5c0c7c0a`): +1216 bytes. At least
  15360 bytes stay free for fixes, so 17693 bytes can still go to features.
- Installing over tabby-v04.2 to tabby-v04.18 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip with a TRANSPOSE other than 0 is refused by firmware before tabby-v04.15, a clip with a SHUFFLE or a PLAY
  QUANTIZE by firmware before tabby-v04.17, and a clip with a STEP SIZE other than 1/16 by firmware before
  tabby-v04.19 (the track is silent there).
- Released through the candidate flow: published as builds/tabby-v04.19-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What is new

- **STEP SIZE** on CLIP SETTING (FX on CLIPS, page 2/3, after PLAY QUANTIZE): what one step of the clip lasts.
  1/16 is what every clip had. 1/8 plays the clip at half speed, 1/32 at double speed. 1/16T and 1/8T are triplet
  steps: a clip of 12 steps at 1/16T lasts half a bar, three steps to each 8th note. The MC-707 calls this SCALE;
  here SCALE is the printed name of a button, so the line is called STEP SIZE.
- K1 only stops at a size that gives the clip a whole number of 16ths, from 1 to 128; triplet sizes need a length
  that divides by 3. The line shows what the clip then plays (for example = 32 16THS).
- The notes stored in the clip are not changed. The STEP page still shows the clip's own steps; the play cursor and
  a take count in them.
- CLIP SETTING has 23 lines.

## Validation

Filled in after the candidate ran on the device.
