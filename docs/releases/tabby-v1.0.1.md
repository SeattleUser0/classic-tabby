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

Filled in after the candidate has passed on the device.
