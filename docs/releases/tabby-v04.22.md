NOTE REPEAT now does what is printed on it: hold it and a held key or pad repeats. The keys / pads switch moved to KNOB BANK + NOTE REPEAT. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.22: NOTE REPEAT repeats notes

- Firmware package build ID: `1726ba6b317b1bb5` (first 16 hex digits). App image 489796 bytes (measured), margin 29661 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 45). From tabby-v04.21 (`0bb7c4fb25bc175a`): +608 bytes. At least
  15360 bytes stay free for fixes, so 14301 bytes can still go to features. Free RAM 142700 bytes (unchanged).
- Installing over tabby-v04.2 to tabby-v04.21 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20.
- Released through the candidate flow: published as builds/tabby-v04.22-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What changed: one gesture moved

- **The keys / pads focus switch is now KNOB BANK + NOTE REPEAT.** Before, it was NOTE REPEAT alone. The KNOB BANK
  list on the screen has always shown it as NOTE REPEAT KEY-PAD.

## What is new

- **Note repeat.** Hold NOTE REPEAT and hold a key (or a pad, on a page where the pads play notes): the note repeats
  at the track's ARP rate for as long as you hold both. The screen says NOTE REPEAT 1/16 - HOLD A KEY OR PAD and the
  NOTE REPEAT lamp is lit. Turn K1 while you hold NOTE REPEAT for the rate: 1/4, 1/8, 1/16, 1/32. It works on every
  page and does not change the page.
- **What it is, and its limits.** Note repeat is the track's arpeggiator switched on while the button is down. One
  held note repeats. Several held notes take turns in the ARP's DIRECTION (a chord is arpeggiated, not repeated as a
  chord), and with RANGE above 1 OCT a note also climbs octaves. GATE and SWING of the ARP page apply. A key that is
  already down when you press NOTE REPEAT is cut off: press NOTE REPEAT first. A take records the key you hold as one
  note, not the repeats. The project shows as changed afterwards, because the ARP switch belongs to the project. A
  track whose ARP is on already is left alone.

## Validation

Candidate 1 (builds/tabby-v04.22-rc1/) on the device, unattended, before the promotion; it passed at the first attempt:

- Note repeat 11 of 11. Heard on the MIDI out: a held key 18 times in 2.2 s, 124.8 ms apart at 1/16; one click of
  K1 faster, 62.7 ms apart (1/32). No interval was more than 3.0 ms from the middle one: the arpeggiator starts its
  notes on audio blocks of 2.9 ms, so the repeats are even to one block, not to the 2 ms of the song's notes.
  NOTE REPEAT let go: nothing repeats and the ARP switch is off again. KNOB BANK + NOTE REPEAT: keys to pads and back.
- Take edit 26 of 26, program and knobs 10 of 10, clip chains 11 of 11, scene chain 13 of 13, scene edit 16 of 16,
  CLIP SETTING 38 of 38, recording 25 of 25, STEP page 18 of 18, CLIPS page 40 of 40 twice, the timing song 960 of
  960 notes on DIN and USB.
- One line, 960 notes, three runs: DIN 1.71, 1.73, 1.79 ms; USB 1.60, 1.68, 1.70 ms.
- Full backup, restore of that backup, verify: PASS (41 items), twice.
