EVENT LEAD: a song setting that sends a scene's program changes before its downbeat. It is OFF unless you turn it on, and with OFF every song plays exactly as on tabby-v1.0.1. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.0.2: EVENT LEAD

- Firmware package build ID: `9b00a12fd0346a65` (first 16 hex digits). App image 490756 bytes (measured), margin 28701 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 49). From tabby-v1.0.1 (`b3ecdffbabe49bf0`): +288 bytes. At least
  15360 bytes stay free for fixes. Free RAM 142412 bytes (unchanged).
- Installing over tabby-v04.2 to tabby-v1.0.1 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow: published as builds/tabby-v1.0.2-rcN/, installed and tested on the device
  (every device test, both soaks, full backup, restore, verify) before it reached the main page.

## What is new: one setting

- **EVENT LEAD** on CLIP SETTING (FX on CLIPS; page 3/3, the last line): OFF, 1/32, 1/16, 1/8 or 1/4.
- A scene can send program changes, a bank select and controllers when it is entered. With EVENT LEAD they go out
  that long before the scene's downbeat. On one DIN cable those messages used to pass ahead of the scene's first
  notes and made them late (about 0.8 ms a message: 14 ms behind 17 messages). With a lead they have left the cable
  before the downbeat and the first notes are on time.
- **It is OFF in every song until you set it.** With OFF the SMK-37 sends exactly what tabby-v1.0.1 sends: in the
  simulator, every byte of six passes of the Wrong Room song, clock included, in the same audio block.
- **What a lead costs.** The synth changes its sound that much before the downbeat, so the tail of the previous
  scene's last notes is heard on the new sound. Use the shortest lead that is enough, and leave it OFF where the
  change must not be heard early.
- A device's waiting time from the rig profile (the H90's 255 ms, for example) is kept and counts from when its
  own program change goes out; the lead comes in front of it.
- No lead at SEQ PLAY: the first scene's messages go out with the start (use SEND SETUP before). A scene recalled
  later than the lead before its bar sends its messages at once. A change of the setting is heard from the scene
  after the next. It is saved with the song.
- Nothing else is new.

## Validation

Candidate 2 (builds/tabby-v1.0.2-rc2/) on the device, unattended, before the promotion. Every time below was taken
against a clock the test computer does not correct.

- **Soak with EVENT LEAD OFF**, the Wrong Room song looping, 40 minutes, 19 segments on six pages, none bad: every
  scene entry sent its events (136 program changes and 48 controllers in every segment); USB band 1.64 to 2.75 ms;
  on the one DIN cable 14.8 to 17.0 ms, the first notes after the loop point behind the events, as on tabby-v1.0.1.
- **Soak with EVENT LEAD 1/16**, 80 minutes, 38 segments, none bad: every scene entry sent all its events, and on
  the DIN cable they had ended 112 to 126 ms before the scene's first note (124 to 128 ms on USB). **The first notes
  are on time on DIN: band 1.82 to 2.42 ms** (USB 1.66 to 2.07 ms). Left out of that band, and still late on a
  shared cable: the very first note at SEQ PLAY (14.4 ms), where there is no lead.
- In the simulator: with EVENT LEAD OFF every byte of six passes of the song, the clock included, in the same audio
  block as tabby-v1.0.1 sends it (SHA-256 f2651bb6dbf247c6...); with 1/16 every entry's events 43 blocks (a 16th)
  before its first note and every note in the block it was in; with a 255 ms device gap inside the stream, the next
  message 255 ms after that program change and the last one still a 16th before the note.
- CLIP SETTING 40 of 40 (with the EVENT LEAD line: OFF, two clicks 1/16, no further than 1/4, back to OFF), take
  edit 26 of 26, note repeat and step loop 20 of 20, program and knobs 10 of 10, clip chains 11 of 11, scene chain
  13 of 13, scene edit 16 of 16, recording 25 of 25, STEP page 18 of 18, CLIPS page 40 of 40 twice, the timing song
  960 of 960 notes (worst 1.19 ms).
- One line, 960 notes, three runs: DIN 1.83, 1.74, 1.94 ms; USB 1.74, 1.70, 1.78 ms.
- Full backup, restore of that backup, verify: PASS (41 items), twice. The panel was left as it was found (mutes,
  focus, ARP switches, CLOCK, A2: read after every test).

Candidate 1 was the same firmware build and passed both soaks too. It was not promoted because one check of the
CLIP SETTING test counted no controller message after a knob click, once; the test passed 40 of 40 twice afterwards
and in candidate 2. The likely cause was the test tool mixing two clocks (docs/BUILD.md 63.2); that is not proven.
