A mute under KNOB BANK needs its pad held, so reaching for a track pad no longer mutes by accident; a late launch cuts the old clip's notes. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.5: a mute under KNOB BANK needs its pad held

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
  asks the Orange Cat soak guard first and between its steps (docs/DEV_CHECKS.md). Candidate 1 (a short run) was held back: a track sent back to the scenes with CHORD could lose its
  note on the bar line (fixed, below). Candidate 2 was a short run of the fixed firmware, not to be promoted;
  candidate 3 is the same firmware, tested in full.

## What changed

- **A mute under KNOB BANK needs its pad held.** KNOB BANK + pad 1 to 8 selects a track and KNOB BANK + pad 9 to 16
  mutes one, and the two rows lie one above the other: a hand that goes for track 1's pad and catches the pad under
  it muted track 1. Now the lower pad must be held for a moment (0.15 s): a brushed pad does nothing (HOLD THE PAD TO
  MUTE), and a pad of the upper row pressed in that moment takes the mute back. The mixer page mutes with one press,
  as before.
- **A launch or recall that lands in the grace after the bar line cuts the old notes.** What the old clip or scene
  still sounds on those tracks ends where the new one begins: one short overlap (the grace, 7 to 25 ms), not two
  parts ringing together. The release run checks it.
- **A track sent back to the scenes keeps its note on the bar line.** CHORD (back to the scenes) lands on the next
  bar and the track joins its clip where the clip stands; when the clip's buffer was ready a block late, the note on
  that line was lost (the release run found it: the first note heard was on beat 3). What a frame holds from where
  it began without its buffer is now played when the buffer is taken, for every kind of landing.
- **A key held by remote lets go after 30 s** whatever else arrives (test tools only): a tool that died between its
  KNOB BANK down and up left KNOB BANK held.
- No new feature. docs/FLASH-BUDGET.md 55 is the plan for the flash margin before the next one.

## Validation

VALIDATION
