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

Filled in after the candidate has passed on the device.
