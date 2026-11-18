The release for the stage: no new function, a full regression with a two-hour soak, one screen fix, and a one-page stage checklist. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.0

- Firmware package build ID: `3b6cde4c259dd43a` (first 16 hex digits). App image 490468 bytes (measured), margin 28989 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 47). From tabby-v04.23 (`c7b2ff04e81b3226`): +32 bytes. At least
  15360 bytes stay free for fixes. Free RAM 142412 bytes (unchanged).
- Installing over tabby-v04.2 to tabby-v04.23 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20.
- Released through the candidate flow: published as builds/tabby-v1.0-rcN/, installed and tested on the device
  (every device test, the soak, full backup, restore, verify) before it reached the main page.
- The name has no leading zero any more: tabby-v1.0 follows tabby-v04.23.

## What changed

- **No new function.** Everything is as in tabby-v04.23.
- **One fix on the screen.** KNOB BANK with a pad selects or mutes a track and says so (TRACK SELECTED, TRACK MUTED:
  SOUND AND MIDI, TRACK UNMUTED). That message was written on a line the KNOB BANK list covers while the button is
  down, so it was never seen. It is now the first line of that list for a second.
- **The stage checklist**: one page, docs/STAGE-CHECKLIST.md in the source and section 9 of the manual: before the
  show day (never install firmware on a show day), power-up order, what to check on the screen, what to do when a
  synth does not respond, what to do when the timing feels off.
- The pad rows are confirmed on a unit: pads 1 to 8 are the upper row.

## A limit you should know

On one DIN cable (the TRS jack with an adapter) a scene's program changes and controllers pass ahead of its first
notes, about 0.8 ms each. With the Wrong Room test song (17 such messages at its loop point) the first notes after
the loop came 14 ms late on the cable, while on USB every note was within 2 ms. With the H4MIDI on USB each synth's
cable carries only its own messages. This is not new and not changed; the manual's known limits say it too.

## Validation

Filled in after the candidate has passed on the device.
