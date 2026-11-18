SHUFFLE and PLAY QUANTIZE for each clip, on CLIP SETTING (now three pages). Reinstall to get them (Full backup first; storage does not move).

# Classic Tabby tabby-v04.17: shuffle and play quantize for each clip

- Firmware package build ID: `748004a45cce48bd` (first 16 hex digits). App image 485188 bytes (measured), margin 34269 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 40). From tabby-v04.16 (`ed9182d3a3d67ec9`): +864 bytes. At least
  15360 bytes stay free for fixes, so 18909 bytes can still go to features.
- Installing over tabby-v04.2 to tabby-v04.16 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip with a TRANSPOSE other than 0 is refused by firmware before tabby-v04.15, and a clip with a SHUFFLE or a
  PLAY QUANTIZE by firmware before tabby-v04.17 (the track is silent there).
- Released through the candidate flow: published as builds/tabby-v04.17-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What is new

- **SHUFFLE** on CLIP SETTING (FX on CLIPS, page 2/3): SONG, or the clip's own shuffle from 0 to 50 PERCENT. Every
  second 16th step comes that much of a step late. SONG is what every clip did until now: it follows the song's
  swing. 0 PERCENT plays the clip straight even in a song that swings. The MC-707's negative values are not built.
- **PLAY QUANTIZE** on CLIP SETTING: OFF, 1/16, 1/8 or 1/4. When the clip plays, every note starts on the nearest
  line of that grid. The notes stored in the clip keep their own timing, so OFF brings it back. Controllers are not
  moved.
- **CLIP SETTING has three pages**: 1/3 the clip (LENGTH to COPY TO PAD, as before), 2/3 more of the clip (TRANSPOSE,
  SHUFFLE, PLAY QUANTIZE, DELETE CLIP), 3/3 the song. K5 walks through all 22 lines.
- The guide, its printable PDF, Help and docs/CONTROL-MAP.md are brought up to date.

## Validation

Candidate 1 (builds/tabby-v04.17-rc1/) on the device, unattended, before the promotion; it passed at the first attempt:

- CLIP SETTING 34 of 34. With a second note 150 units late on step 2 of a clip, measured on MIDI out: 163.9 ms
  after the first note as recorded (164.1 calculated), 206.7 ms with SHUFFLE 50 PERCENT (207.0), 126.0 ms with PLAY
  QUANTIZE 1/16 (125.0).
- Program and knobs 10 of 10, clip chains 11 of 11, scene chain 13 of 13, scene edit 16 of 16, recording 25 of 25,
  STEP page 18 of 18, CLIPS page 40 of 40 twice, the timing song 960 of 960 notes on DIN and USB.
- One line, 960 notes, three runs: DIN 1.75, 1.81, 1.82 ms; USB 1.72, 1.72, 1.87 ms.
- Full backup, restore of that backup, verify: PASS (41 items), twice.
