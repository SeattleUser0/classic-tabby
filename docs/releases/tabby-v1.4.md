Nothing happens by itself: a scene is stored with SEQ REC held and an empty pad, a control that wiggles at rest is not recorded, and the firmware logs every pad, button and key event. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.4: nothing happens by itself

- Firmware package build ID: `BUILDID` (first 16 hex digits). App image IMAGE bytes (measured), margin MARGIN bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 54). At least 15360 bytes stay free for fixes. Free RAM HEAP bytes.
- Installing over tabby-v04.2 to tabby-v1.3 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow, with the per-page timing check, the comparison of the device's own screen
  pixels and the soaks. CANDIDATES

## What changed

CHANGES

## Validation

VALIDATION
