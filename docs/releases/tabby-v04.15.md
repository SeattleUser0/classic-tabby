TRANSPOSE for each clip and DELETE CLIP, both on CLIP SETTING; the page also carries the updated manual. Reinstall to get them (Full backup first; storage does not move).

# Classic Tabby tabby-v04.15: transpose a clip, delete a clip

- Firmware package build ID: `8b5a73f6a2d9ee40` (first 16 hex digits). App image 482532 bytes (measured), margin 36925 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 38). From tabby-v04.14 (`781bd68d03f176ca`): +960 bytes.
- Installing over tabby-v04.2 to tabby-v04.14 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip with a TRANSPOSE other than 0 is refused by firmware before tabby-v04.15 (the track is silent there).
- Released through the candidate flow: published as builds/tabby-v04.15-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What is new

- **TRANSPOSE** on CLIP SETTING (FX on CLIPS, page 1/2, after COPY TO PAD): -12 to +12 semitones. Every note of the
  clip is moved when the clip plays; the notes stored in the clip are not changed, so 0 plays it as it was. You hear
  it from the clip's next loop. As on the MC-707.
- **DELETE CLIP** on CLIP SETTING: with the song stopped, press the 4th button in the left group; the screen asks
  PRESS AGAIN TO DELETE THE CLIP; press again within two seconds. A clip that a scene uses is never deleted (USED BY
  SCENE n - NOT DELETED). Until you save the song, loading it again brings the clip back.
- **The manual.** The testing and user guide (guide/) is reordered and rewritten as a manual for everything through
  this release (sections 1, 2 and 4), and Help chapters 01, 03, 12 and 20 are brought up to date.
- **docs/MC707-PARITY.md** now starts with the list that is worked from: what is done, and what comes next in order
  (delete and insert a scene, shuffle per clip, SCALE per clip, a step loop while held, direction, playback
  quantize).
- **Stickers.** docs/STICKERS.md and docs/stickers/classic-tabby-stickers.pdf in the source: a printable sheet with
  the Classic Tabby name for every button, the knobs' functions per page and the fader tracks.

## Validation

The candidate's device results are in docs/BUILD.md 51.1 and are added here after the release.
