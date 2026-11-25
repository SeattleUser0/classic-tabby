**Use tabby-v1.5.1, not this build: in tabby-v1.5 a clip launched in the last 10 ms before the bar line (or just after it) can land without its first note. tabby-v1.5.1 fixes it.** A mute under KNOB BANK needs its pad held, so reaching for a track pad no longer mutes by accident; a late launch cuts the old clip's notes.

# Classic Tabby tabby-v1.5: a mute under KNOB BANK needs its pad held

> **Known fault, fixed in tabby-v1.5.1:** a clip launch pressed in the last 10 ms before the bar line, or just after
> it, can land on the line without its first note (24 of 60 such presses in this build's own release run; tabby-v1.4
> landed all of them). A press 12 ms or more before the line, and every scene recall, is not affected.

- Firmware package build ID: `1a9b1f5a63c8b84b` (first 16 hex digits). App image 494404 bytes (measured), margin 25053 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 55). From tabby-v1.4 (`46301b99eb3e5a67`): +480 bytes. At least
  15360 bytes stay free for fixes. Free RAM 137964 bytes.
- Installing over tabby-v04.2 to tabby-v1.4 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow, with the per-page timing check, the comparison of the device's own screen
  pixels, the bar-line check and the soaks. Every build, test, browser, publish and device access of the flow now
  asks the Orange Cat soak guard first and between its steps (docs/DEV_CHECKS.md). Candidates 1 and 2 were short runs, not to be promoted; both failed one check of the clip launch test,
  which was the test's own counting (docs/BUILD.md 70.1, 70.2). Candidate 3 is candidate 2's firmware, tested in full.

## What changed

- **A mute under KNOB BANK needs its pad held.** KNOB BANK + pad 1 to 8 selects a track and KNOB BANK + pad 9 to 16
  mutes one, and the two rows lie one above the other: a hand that goes for track 1's pad and catches the pad under
  it muted track 1. Now the lower pad must be held for a moment (0.15 s): a brushed pad does nothing (HOLD THE PAD TO
  MUTE), and a pad of the upper row pressed in that moment takes the mute back. The mixer page mutes with one press,
  as before.
- **A launch or recall that lands in the grace after the bar line cuts the old notes.** What the old clip or scene
  still sounds on those tracks ends where the new one begins: one short overlap (the grace, 7 to 25 ms), not two
  parts ringing together. The release run checks it.
- **A frame that begins without its buffer** (the clip was not decoded in time) plays what it skipped when the buffer
  comes, counted from where the frame began: now also for a track sent back to the scenes with CHORD, which joins
  its clip where the clip stands. (Not seen to go wrong on the device; closed by reading.)
- **A key held by remote lets go after 30 s** whatever else arrives (test tools only): a tool that died between its
  KNOB BANK down and up left KNOB BANK held.
- No new feature. docs/FLASH-BUDGET.md 55 is the plan for the flash margin before the next one.

## Validation

Candidate 3 (builds/tabby-v1.5-rc3/) on the device, unattended, 01:35 to 04:36 on 2026-11-25, every stage behind
the Orange Cat soak guard. Every step passed and it was promoted.

**A fault found in this run's own figures after the release, fixed in tabby-v1.5.1:** a clip launched in the last
10 ms before the bar line, or just after it, whose buffer was not ready, lands on the line WITHOUT ITS FIRST NOTE
(24 of 60 such presses on CLIPS, 33 of 60 with a page change before the pad; a scene recall is not affected: 60 of
60). tabby-v1.4 did not have this; it came in with this release's change to the catch-up, and the bar-line tool
called those presses "waited a cycle" (they were all sent later than the 12 ms the check asks for). A press 12 ms
or more before the line landed with its first note every time. Install tabby-v1.5.1.

- Stop (ms, DIN): after SEQ PLAY 4.86 to 17.00; after a page change 7.43 to 19.28; a save sent after it 5.66 to
  8.30; the first stop after a save 5.44 to 13.84; the save by itself due 8.92, 6.50. The clock around a save: a
  pause of 105 to 108 ms, then its period.
- A landing in the grace cuts the old notes: the old clip's note on the line ended 1 to 2 ms BEFORE the new clip's
  first note (11 landings).
- One line, 960 notes (DIN / USB / own, ms): overview 1.68, 1.74, 1.72 / 1.62, 1.73, 1.72 / 1.47, 1.50, 1.49; the
  other pages 1.59 to 1.96 / 1.66 to 1.84 / 1.47 to 1.62. Eight lines: about 2.1 on DIN and 2.0 on USB.
- The latest send while a song ran 4.71 ms; stopped 17.51 ms.
- Soaks: Wrong Room 40 + 40 minutes, none bad; Meridian Fault 9 passes, none bad (USB worst 1.89 ms).
- The mute under KNOB BANK with the pad held: clip launch page 40 of 40 twice. Pixels 46 of 46. Recording 30 of 30,
  setting page 41 of 41, the other device tests as before; backup, restore, verify PASS.
