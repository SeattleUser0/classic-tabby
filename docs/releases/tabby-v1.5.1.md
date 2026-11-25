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
  promoted (one check of its scene-edit test pressed SEQ REC right after a bar line, inside the grace: the test's
  timing, corrected); candidate 2 is the same firmware, tested in full, its tables read against tabby-v1.4's, then
  promoted.

## What changed

- **A clip launched in the last 10 ms before the bar line, or just after it, keeps its first note.** In tabby-v1.5
  such a launch, when its clip was not decoded yet, landed on the line without its first note (24 of 60 presses in
  tabby-v1.5's own release run). tabby-v1.4 had it right; tabby-v1.5 broke it with a change I made on a wrong
  diagnosis, and the bar-line tool called those presses "waited a cycle". What a launch or a scene skipped is again
  played from the line itself.
- **The bar-line check** now tells a clip that landed without its first note from one that waited a cycle, and fails
  on the first at any lead.

## Validation

VALIDATION
