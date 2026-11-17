Clip chains: a launched clip leads to the next one by itself. Reinstall to get them (Full backup first; storage does not move).

# Classic Tabby tabby-v04.11: clip chains

- Firmware package build ID: `7b85cd8d3d193809` (first 16 hex digits). App image 479236 bytes (measured), margin 40221 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 34). From tabby-v04.10 (`7e376d6bb50aacdb`): +864 bytes.
- Installing over tabby-v04.2 to tabby-v04.10 keeps storage as it is. Take a Full backup first anyway.
- A clip with a chain is not played by firmware before tabby-v04.10 (the track is silent there).
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.

## What is new

- **Clip chains**, as on the MC-707, on CLIP SETTING (FX on CLIPS), after LENGTH:
  - NEXT CLIP: STAY (no chain), STOP, or a clip of the same track. K1 steps through the pads that hold a clip.
  - AFTER: CLIP END, or 1 to 512 steps (the MC-707 calls this LENGTH).
  - TIMES: 1 to 64, our addition: the chain is due after TIMES x AFTER (or TIMES x the clip).
- A chain runs on a track that plays the clip launched (its pad, a reservation before PLAY, or another chain). A track
  that follows the scenes ignores chains.
- The CLIPS page shows under each track where its chain leads: +05 for clip 5, +STP for a stop.
- Notes that sound when the next clip starts play out their length.

## Changed

- The count-in now ends exactly on the beat: the song's Start comes one cycle after the first click (in tabby-v04.10
  it came with the next audio block, measured 3.1 ms late).
