A clip launched in the last moment before the bar line keeps its first note again (a fault of tabby-v1.5). Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.5.1: the first note of a late launch

- Firmware package build ID: `9867cdab400d5af9` (first 16 hex digits). App image 494404 bytes (measured), margin 25053 bytes
  below the 519457-byte limit. From tabby-v1.5 (`1a9b1f5a63c8b84b`): +0 bytes (the build ID also covers the guide inside the package, which has a new paragraph). At least 15360 bytes stay free for
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
  rule as a launch or a recall: pressed up to about 15 ms late, the clip still lands on that line and the take
  starts there; pressed later, the take is armed and starts on the next line. The firmware did this since tabby-v1.4; it is now
  written down (docs/CONTROL-MAP.md 13.1, the guide) and the release run tests both sides of the window.
- **The release run:** the grace window after the bar line is judged on both sides: a press sent up to 3 ms after
  the line must land on it with its first note, a press sent 24 ms or more after it must wait and land on the next
  line (until now only presses 12 ms and earlier were judged, which is how tabby-v1.5 passed). Every figure the run
  prints is now checked against a limit or marked as information with its reason (docs/BUILD.md 71.4), and a
  candidate's tables are compared with the last release's, row by row, before it is promoted; a worse row holds it
  back.

## Validation

Candidate 2 (builds/tabby-v1.5.1-rc2/) on the device, unattended, 15:09 to 18:21 on 2026-11-25, every stage behind
the Orange Cat soak guard, promotion off. Every step passed, every limit held. Then its tables were compared with
tabby-v1.5's release run (the bar line with tabby-v1.4's) and with tabby-v1.4's.

**Rows worse than the tabby-v1.5 release run, accepted by the owner for this release (2026-11-25):**

- Eight lines at once on DIN, the worst line: 2.60 ms (overview) and 2.85 ms (SCENES) against 1.97 to 2.10 ms; the
  limit is 3.5 ms. Accepted because the figure has two states between runs of one build: of 18 runs since
  tabby-v1.2.1, 15 read 2.35 to 2.96 ms and three 2.0 to 2.2; the tabby-v1.5 release run was one of the three,
  and candidate 2 of the same tabby-v1.5 build read 2.81, 2.76 and 2.96. tabby-v1.4's release run: 2.69 to 2.95.
- The MIXER page's longest screen pass: 2.05 ms against 1.48 (inside every limit; no line of notes is later for
  it: one line on MIXER 1.73 ms).

**Worse than tabby-v1.4, as in tabby-v1.5: recorded as a regression of tabby-v1.5, to be found next:** in the Wrong
Room soak the device's own latest send 3.26 ms (tabby-v1.5: 4.01; tabby-v1.4: 2.49; limit 10) and the song
section's longest pass 2.52 ms (2.46; 1.68).

- The bar line, 252 presses: sent up to 3 ms after the line 161 of 161 landed on it with the first note (30 of them
  sent after the line); sent 24 ms or more after it 36 of 36 waited and landed on the next line; between the two
  53 landed (the latest sent 14.0 ms after the line) and 2 waited (13.7, 19.6); no other outcome. An old note ended
  1 to 6 ms before the new clip's first note (142 landings in the grace).
- SEQ REC 3 ms after the line: the take ran on that line, 5 of 5; 40 ms after it: armed, then on the next line, 5 of 5.
- Stop (ms, DIN): after SEQ PLAY 5.36 to 8.48; after a page change 7.56 to 16.30; a save sent after it 5.60 to
  13.07. The clock's pause at a save while stopped 102 to 105 ms (limit 170).
- One line, 960 notes (DIN / USB / own, ms): overview 1.71, 1.60, 1.71 / 1.69, 1.66, 1.72 / 1.53, 1.51, 1.47; the
  other pages 1.68 to 1.80 / 1.69 to 1.79 / 1.47 to 1.74. Eight lines: DIN 2.57 to 2.85, USB 2.02 to 2.15.
- The latest send while a song ran 3.38 ms; stopped 17.15 ms.
- Soaks: Wrong Room 40 + 40 minutes, none bad; Meridian Fault 9 passes, none bad (USB worst 1.76 ms).
- Clip launch page 40 of 40 twice, scene edit 16 of 16, recording 30 of 30, setting page 41 of 41, pixels 46 of
  46; backup, restore, verify PASS.
