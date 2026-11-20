Messages moved to the top of the screen, so they never cover the pads' cells. The firmware can now give back the pixels it sent to its screen; the release test compares them with the simulator's on every page, and the manual's pictures are the device's own. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.2: messages at the top; the screen proven on the device

- Firmware package build ID: `fd7ec6000403a35c` (first 16 hex digits). App image 488516 bytes (measured), margin 30941 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 51). From tabby-v1.1 (`f0bd5047ca742907`): +1792 bytes. At least
  15360 bytes stay free for fixes. Free RAM 143244 bytes (192 fewer).
- Installing over tabby-v04.2 to tabby-v1.1 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow, as candidate 6. Candidate 1 was held back: its screen copy asked the device
  for one block of 57600 bytes and the device's heap refused. Candidate 2 (a smaller copy) was held back: one line
  measured 2.01 and 2.03 ms on two of eight pages, and its screen copy showed why the device never finished a
  picture while a song played (below). Candidate 3 (no more repaint on every step) was held back: the pages were still
  repainted on every eighth note, now exactly on the notes, and one line measured 2.3 to 2.5 ms on CLIPS and
  SCENES. Candidate 4 has the fix for that and for the standing CPU GUARD box, was installed and tested and made
  the device's screen pictures. Candidate 5 (candidate 4's firmware, those pictures in the manual) was held back:
  its own pixel comparison found leftover pieces of the page before on HOME, and eight lines on SCENES measured
  3.9 ms once. Candidate 6 has both fixed, was tested in full, and is the one promoted. Its manual pictures are
  the ones taken on candidate 4's build; its own release run compared its own pixels again. docs/BUILD.md 65.1
  to 65.6.

## What changed

- **A message is an amber box across the top**, over the top line (in tabby-v1.1 it was across the bottom and
  covered the lower pad row and part of the queue line of tracks 5 to 8). One line covers the top line; two or
  three lines also cover the title row and the row under it. It stays about a second and a half, as before. The
  KNOB BANK list stays at the bottom and is readable under a shortcut's message.
- **CLIPS and SCENES are no longer painted again on every 16th note while a song plays.** Found by the screen
  copy: the page's own "did anything change" test included the step counter, so the whole page (15 bands) was
  repainted eight times a second, more than the painter manages beside the MIDI sends (84 bands a second): a
  picture was never finished, and every note had a band in its way. It has been so since these pages exist. Now a
  page is repainted when something it shows changes (the scene, a launch, a queue); the bar count repaints only its
  own digits; on STEP only the rows of the step cells follow the running step. The pads' blink phase, which
  repainted the page on every eighth note without anything on the screen blinking, is out of that test too.
- **A band left over from the page before is painted within a few passes.** Found by the pixel comparison on
  candidate 5: 2.4 seconds after PATCH from CLIPS to HOME, while a song played, the project name's row still showed
  pieces of CLIPS. On HOME the level meters ask for their bands on every frame and were served first every time.
  Every second band now goes in plain rotation.
- A page is not composed when a note is due before the composing would end (as for a band): SCENES is composed
  again at each new scene, the moment its first notes are due.
- **CPU GUARD - VOICES ADAPTED is no longer a message box.** Seen in the device's own pictures: with eight parts on
  the internal sounds the guard takes voices back about once a second, and its message stood over the page for the
  whole song (every Wrong Room soak since tabby-v1.0 counted 125 of them in 125 seconds; nobody was looking at the
  screen). It is `CPU!` in amber in the top line while it happens. AUDIO OVERLOAD and MIDI FULL stay message boxes.
- The wait before a due MIDI note counts the band's own last painting time, not only that of the band before it
  (large text makes bands differ more: 0.6 to 2.5 ms).
- Kept as they were, by your answers: MASTER MUTED small in the top line (`K8=0`); no pattern cells and no knob strip
  on HOME.
- **The screen copy** (remote command 29 {19}; it only reads). The LCD cannot be read back: one data line, driven by
  the SoC only. So the firmware can keep a copy of every rectangle of pixels it hands to the LCD, freeze it when the
  picture is whole, and send it over USB. It takes 29 KB of memory, in fifteen small blocks, only while a test has
  switched it on.
- **The comparison** (a step of every release run from now on): one tour of every page of docs/CONTROL-MAP.md
  section 20, 22 pictures at rest and 22 while the song plays, run on the device with remote panel keys and in the
  simulator with the same song at the same place in the song; every pixel compared. Left out, and named in the
  result: the level meters and MIDI-in marks on HOME (they follow the audio), FREE / RECL on ACTIONS and the stored
  project name on PRESETS and SAVE PROJECT (the device holds your data, the simulator starts empty).
- The timing figures: this computer measures when a note arrives; the device also counts, by its own clock, how
  long after its due time each note left. From this release the release run reads both, and one line must be
  under 2 ms by both. The test computer is kept awake while it measures: idle, its own timestamps wander by 0.1 to
  0.3 ms (docs/BUILD.md 65.4).
- **The manual's pictures are the device's**, taken by that test, in place of simulator renders. Two are still the
  simulator's and say so: SAVE PROJECT and STOP TO SAVE need the > button, which the device does not let a remote
  command press.
- What this does not prove: the last step from the LCD's input to the glass (colours, contrast, viewing angle, a
  dead pixel), and the start screen (gone before a command can ask). Test T97 of the guide is that look, by you.

## Validation

The device run's results are added here after the promotion.
