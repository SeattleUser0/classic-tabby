The step loop: on CLIPS, hold NOTE REPEAT and pad 9, 10, 11 or 12, and everything that plays repeats its last 1, 2, 4 or 8 steps until you let go. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.23: the step loop

- Firmware package build ID: `c7b2ff04e81b3226` (first 16 hex digits). App image 490436 bytes (measured), margin 29021 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 46). From tabby-v04.22 (`1726ba6b317b1bb5`): +640 bytes. At least
  15360 bytes stay free for fixes, so 13661 bytes can still go to features. Free RAM 142412 bytes (-288).
- Installing over tabby-v04.2 to tabby-v04.22 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20.
- Released through the candidate flow: published as builds/tabby-v04.23-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What is new

- **The step loop.** While the song plays, on the CLIPS page, hold NOTE REPEAT: pads 9 to 12 light amber. Hold one of
  them: every track that plays repeats its last 1, 2, 4 or 8 steps (16th notes), over and over: STEP LOOP: LAST 4
  STEPS. Let the pad go and the song goes on where it would have been, in time with the master cycle.
- Launched clips and tracks that follow the scenes are looped alike. Clips, chains and scenes change underneath as
  they would have; you hear the result when you let go.
- While NOTE REPEAT is down no pad launches a clip.
- Not while the song is stopped and not during a take. Stopping the song ends a loop.
- It takes the steps just played, not steps you choose, and it loops all tracks, not one (on the MC-707 the pads are
  the steps; here they are the clips).

## Validation

Candidate 2 (builds/tabby-v04.23-rc2/) on the device, unattended, before the promotion:

- Note repeat and step loop 20 of 20. Heard on the MIDI out: with pad 10 held the last two steps repeat, the note
  every 250.0 ms (249.9 expected); with pad 12 the last eight, the bass note every 999.4 ms (999.7 expected) and the
  other bass note not at all; after the pad is let go the notes are back on the song's beats (within 1.5 ms); a pad
  pressed while NOTE REPEAT is down launches nothing. A one-step loop cannot be aimed by remote and was only
  checked to loop one step (the simulator checks its notes: every 16th).
- One line, 960 notes, three runs: DIN 1.90, 1.76, 1.71 ms; USB 1.78, 1.79, 1.73 ms: the change in the audio thread
  costs nothing that shows. The timing song: 960 of 960 notes, worst 1.22 ms.
- Take edit 26 of 26, program and knobs 10 of 10, clip chains 11 of 11, scene chain 13 of 13, scene edit 16 of 16,
  CLIP SETTING 38 of 38, recording 25 of 25, STEP page 18 of 18, CLIPS page 40 of 40 twice.
- Full backup, restore of that backup, verify: PASS (41 items), twice.

Candidate 1 was the same firmware build. It was not promoted: one new check of mine could not be aimed by remote,
and three timing checks read up to 9.9 ms in that run, equally on DIN and USB. The same build read 1.2 ms in three
later runs of that test; the likeliest cause is the test computer's clock being corrected during the run, which I
could not prove (docs/BUILD.md 59.1 and 59.2).
