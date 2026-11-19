Messages moved to the top of the screen, so they never cover the pads' cells. The firmware can now give back the pixels it sent to its screen; the release test compares them with the simulator's on every page, and the manual's pictures are the device's own. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.2: messages at the top; the screen proven on the device

- Firmware package build ID: `965a711d666e271a` (first 16 hex digits). App image 487844 bytes (measured), margin 31613 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 51). From tabby-v1.1 (`f0bd5047ca742907`): +1120 bytes. At least
  15360 bytes stay free for fixes. Free RAM 143340 bytes (96 fewer).
- Installing over tabby-v04.2 to tabby-v1.1 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow. Candidate 1 was installed and tested and made the device's screen pictures;
  candidate 2 is the same firmware with those pictures in the manual, tested again in full, and promoted.

## What changed

- **A message is an amber box across the top**, over the top line (in tabby-v1.1 it was across the bottom and
  covered the lower pad row and part of the queue line of tracks 5 to 8). One line covers the top line; two or
  three lines also cover the title row and the row under it. It stays about a second and a half, as before. The
  KNOB BANK list stays at the bottom and is readable under a shortcut's message.
- Kept as they were, by your answers: MASTER MUTED small in the top line (`K8=0`); no pattern cells and no knob strip
  on HOME.
- **The screen copy** (remote command 29 {19}; it only reads). The LCD cannot be read back: one data line, driven by
  the SoC only. So the firmware can keep a copy of every rectangle of pixels it hands to the LCD, freeze it when the
  picture is whole, and send it over USB. It takes 57600 bytes of memory only while a test has switched it on.
- **The comparison** (a step of every release run from now on): one tour of every page of docs/CONTROL-MAP.md
  section 20, 23 pictures at rest and 23 while the song plays, run on the device with remote panel keys and in the
  simulator with the same song at the same place in the song; every pixel compared. Left out, and named in the
  result: the level meters and MIDI-in marks on HOME (they follow the audio), FREE / RECL on ACTIONS and the stored
  project name on PRESETS and SAVE PROJECT (the device holds your data, the simulator starts empty).
- **The manual's pictures are the device's**, taken by that test, in place of simulator renders.
- What this does not prove: the last step from the LCD's input to the glass (colours, contrast, viewing angle, a
  dead pixel), and the start screen (gone before a command can ask). Test T97 of the guide is that look, by you.

## Validation

The device run's results are added here after the promotion.
