A fix for songs of two scenes that loop: each scene's program changes are now sent every time the scene is entered. Use this instead of tabby-v1.0 (Full backup first; storage does not move).

# Classic Tabby tabby-v1.0.1: scene events in a two-scene loop

- Firmware package build ID: `b3ecdffbabe49bf0` (first 16 hex digits). App image 490468 bytes (measured, unchanged), margin 28989 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 48). At least 15360 bytes stay free for fixes. Free RAM 142412 bytes.
- Installing over tabby-v04.2 to tabby-v1.0 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20.
- Released through the candidate flow: published as builds/tabby-v1.0.1-rcN/, installed and tested on the device
  (every device test, the soak, full backup, restore, verify) before it reached the main page.

## The fix

- **What was wrong.** A scene can carry row events: program changes, a bank select, controllers for your synths and
  pedals. They are sent when the scene is entered. In a song of two scenes that loops (scene 1, scene 2, scene 1,
  ...) they were sent on the first pass and after that only now and then: in the two-hour test of tabby-v1.0 between
  half and all of them arrived, depending on the page on the screen. A synth could stay on the other scene's sound.
  The notes were never affected.
- **Who was affected.** Songs that go round two scenes. Three or more scenes in a row were not, and neither was a
  scene that repeats. tabby-v04.23 shows the same; older versions have the same code.
- **Now** every entry sends its events. Nothing else changed from tabby-v1.0.

## How it was missed

The two-hour soak of tabby-v1.0 recorded the missing program changes; my check of the soak only compared the two
MIDI ports with each other, and both lacked the same messages, so it passed and tabby-v1.0 was released. I found it
when I read the numbers for the release notes. The soak now requires the events of every scene entry.

## The limit of tabby-v1.0's notes still holds

On one DIN cable a scene's program changes pass ahead of its first notes (about 0.8 ms each).

## Validation

Candidate 1 (builds/tabby-v1.0.1-rc1/) on the device, unattended, before the promotion; it passed at the first attempt.
Every time below was taken against a clock the test computer does not correct.

- **The two-hour soak**, the Wrong Room song looping, 120 minutes in 57 segments on six pages. **Every scene entry
  sent its events:** 17 messages for scene 1 and 6 for scene 2, sixteen entries in every segment, on USB and on the DIN
  cable; 136 program changes and 48 controllers in each of the 57 segments (tabby-v1.0: 68 to 136). Every note-on
  and note-off arrived, no stuck note, no underrun. On USB each line's band was 1.70 to 2.45 ms, the largest single
  error 1.75 ms. On the one DIN cable 14.8 to 16.2 ms, in the first notes after the loop point (behind the events).
- Take edit 26 of 26, note repeat and step loop 20 of 20, program and knobs 10 of 10, clip chains 11 of 11, scene
  chain 13 of 13, scene edit 16 of 16, CLIP SETTING 38 of 38, recording 25 of 25, STEP page 18 of 18, CLIPS page 40
  of 40 twice, the timing song 960 of 960 notes on DIN and USB (worst 1.12 ms).
- One line, 960 notes, three runs: DIN 1.87, 1.81, 1.77 ms; USB 1.90, 1.78, 1.98 ms.
- Full backup, restore of that backup, verify: PASS (41 items), twice.
- In the simulator, six passes of the song: 17 and 6 event messages at every entry (before the fix: 17 6 0 0 0 6 0 0 0 6 0 0).
- Not checked by a machine: the screen fix of tabby-v1.0 (the KNOB BANK list) has been seen in the simulator only.
