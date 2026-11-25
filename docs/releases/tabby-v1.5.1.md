A clip launched in the last moment before the bar line keeps its first note again (a fault of tabby-v1.5). Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.5.1: the first note of a late launch

- Firmware package build ID: `22db9afc4704af3e` (first 16 hex digits). App image 494404 bytes (measured), margin 25053 bytes
  below the 519457-byte limit. From tabby-v1.5 (`1a9b1f5a63c8b84b`): +0 bytes. At least 15360 bytes stay free for
  fixes. Free RAM 137964 bytes.
- Installing over tabby-v04.2 to tabby-v1.5 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow, with the per-page timing check, the comparison of the device's own screen
  pixels, the bar-line check and the soaks, every stage behind the Orange Cat soak guard. Candidate 1 was a short run, not to be
  promoted (one check of its scene-edit test pressed SEQ REC right after a bar line, where the take starts at once);
  candidate 2 is the same firmware with the guide's new paragraph, tested in full, its tables compared with the
  last releases', then promoted.

## What changed

- **A clip launched in the last 10 ms before the bar line, or just after it, lands on the line again.** In
  tabby-v1.5 such a launch missed the line (24 of 60 presses in tabby-v1.5's own release run; tabby-v1.4: 60 of 60).
  tabby-v1.5 broke it with a change made on a wrong diagnosis. What a launch or a scene skipped is again played from
  the line itself.
- **SEQ REC and the bar line, decided:** SEQ REC on a clip that is not looping launches it like a pad, with the same
  grace. Pressed within about 20 ms after the bar line, the clip lands on that line and the take starts there;
  pressed later, the take is armed and starts on the next line. The firmware did this since tabby-v1.4; it is now
  written down (docs/CONTROL-MAP.md 13.1, the guide) and the release run tests both sides of the window.
- **The release run:** the bar-line step fails on any press sent at or before the line that does not land with its
  first note (until now it judged only presses 12 ms and earlier, which is how tabby-v1.5 passed); a candidate's
  tables are compared with the last release's, row by row, before it is promoted, and a worse row holds it back.

## Validation

VALIDATION
