**Use tabby-v1.0.1.** Found after this release: in a song of two scenes that loops, this build skips most of the scenes' program changes after the first pass (tabby-v04.23 does too; older builds have the same code). The notes are not affected. tabby-v1.0.1 fixes it.

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
the loop came 14 ms late on the cable, while on USB every note was within 2.2 ms. With the H4MIDI on USB each synth's
cable carries only its own messages. This is not new and not changed; the manual's known limits say it too.

## Validation

Candidate 1 (builds/tabby-v1.0-rc1/) on the device, unattended, before the promotion; it passed at the first attempt.
Every time below was taken against a clock the test computer does not correct.

- **The two-hour soak:** the Wrong Room song (8 parts, 16 program changes, a bank select and 5 controllers in its two
  scenes, looping) for 121 minutes in 57 segments on six pages. No bad segment: every note-on, note-off, program
  change and controller arrived, the same on USB and on the DIN cable; no stuck note, no underrun. On USB each
  line's band was 1.65 to 2.76 ms and the largest single error 2.13 ms. **Correction:** "every ... program change
  and controller arrived" was wrong. The check compared the two ports with each other; both lacked the same
  messages. Between 68 and 136 of 136 program changes arrived in a segment (docs/BUILD.md 62). On the one DIN cable the band was 14.8 to
  15.8 ms, all of it in the first notes after the loop point (the limit described above).
- **The one-hour soak** (on tabby-v04.23, the same code but for the screen fix): 70 minutes, 33 segments, one line
  and eight lines in turn on six pages, A2 on: one line 1.60 to 1.93 ms on DIN and 1.62 to 1.87 ms on USB; eight
  lines 2.26 to 3.14 ms on DIN and 2.15 to 2.67 ms on USB; no bad segment.
- Take edit 26 of 26, note repeat and step loop 20 of 20, program and knobs 10 of 10, clip chains 11 of 11, scene
  chain 13 of 13, scene edit 16 of 16, CLIP SETTING 38 of 38, recording 25 of 25, STEP page 18 of 18, CLIPS page 40
  of 40 twice, the timing song 960 of 960 notes on DIN and USB (worst 1.12 ms).
- One line, 960 notes, three runs: DIN 1.78, 1.70, 1.64 ms; USB 1.75, 1.78, 1.67 ms.
- Full backup, restore of that backup, verify: PASS (41 items), twice.
- Not checked by a machine: the screen fix was seen in the simulator's picture; nobody has looked at it on a unit yet.
