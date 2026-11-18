The step loop: on CLIPS, hold NOTE REPEAT and pad 9, 10, 11 or 12, and everything that plays repeats its last 1, 2, 4 or 8 steps until you let go. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.23: the step loop

- Firmware package build ID: `c7b2ff04e81b3226` (first 16 hex digits). App image 490436 bytes (measured), margin 29021 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 46). From tabby-v04.22 (`1726ba6b317b1bb5`): +640 bytes. At least
  15360 bytes stay free for fixes, so 13661 bytes can still go to features. Free RAM 142412 bytes (-288).
- Installing over tabby-v04.2 to tabby-v04.22 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20.
- Released through the candidate flow: published as builds/tabby-v04.23-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What is new

- **The step loop.** While the song plays, on the CLIPS page, hold NOTE REPEAT: pads 9 to 12 light amber. Hold one of
  them: every track that plays repeats its last 1, 2, 4 or 8 steps (16th notes), over and over: STEP LOOP: LAST 4
  STEPS. Let the pad go and the song goes on where it would have been, in time with the master cycle.
- Launched clips and tracks that follow the scenes are looped alike. Clips, chains and scenes change underneath as
  they would have; you hear the result when you let go.
- While NOTE REPEAT is down no pad launches a clip.
- Not while the song is stopped and not during a take. Stopping the song ends a loop.
- It takes the steps just played, not steps you choose, and it loops all tracks, not one (on the MC-707 the pads are
  the steps; here they are the clips).

## Validation

Filled in after the candidate has passed on the device.
