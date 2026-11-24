Nothing happens by itself: a scene is stored with SEQ REC held and an empty pad, a control that wiggles at rest is not recorded, and the firmware logs every pad, button and key event. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.4: nothing happens by itself

- Firmware package build ID: `46301b99eb3e5a67` (first 16 hex digits). App image 493924 bytes (measured), margin 25533 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 54). From tabby-v1.3 (`2fea867243829b60`): +3392 bytes. At least 15360 bytes stay free for fixes. Free RAM 138220 bytes.
- Installing over tabby-v04.2 to tabby-v1.3 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow, with the per-page timing check, the comparison of the device's own screen
  pixels, the bar-line check and the soaks, as candidate 5. Candidates 1 to 4 were not to be promoted or were held
  back (docs/BUILD.md 68): 1 carried the input log onto the device for a soak with nothing injected; 2 stopped at the
  new bar-line step (the release tool's fault) after one failed check that was not seen again; 3 was held back by
  three checks that the grace after the bar line made wrong (fixed in the tools and in what the LATE counter
  counts); 4 made the device's screen pictures for the manual. Candidate 5 is candidate 4's firmware.

## What changed

- **A scene is stored with two controls**: SEQ REC held and an empty pad pressed on SCENES. An empty pad alone
  stores nothing, however long it is held (SEQ REC + PAD - NEW SCENE). Until tabby-v1.3 half a second on an empty
  pad stored a scene, and a pad that read as held could do that by itself: one scene was stored that nobody asked
  for. No pad gesture writes over an existing scene, and none ever did.
- **The pads' levels follow each pad's own resting noise.** A pad used to be let go when 24 readings in a row were at
  its resting level + 5 or lower, while the sensors at rest read up to 16 above that level; an excursion began at
  + 10. Now each pad's noise is measured as it rests; the release level is the noise + 8 (at least + 12), an excursion
  begins 12 above that, a press must have peaked 64 above the release level, and a reading that falls back to under
  a quarter of its peak in one sample is a spike, not a press.
- **A control that wiggles at rest is not recorded.** The mod wheel of this unit reads 0 or 1 at rest, and a take
  held "controller 1 = 1" beside its note. A wheel, the pedal, pad pressure or a fader of the panel is recorded once
  it moves 2 of 127 from where it rests (a pitch bend 256 of 16383); what comes in at MIDI in is not touched.
- **The bar line.** Measured: a clip launched 10 to 20 ms before the line landed on it WITHOUT ITS FIRST NOTE, and a
  press in the last milliseconds waited a whole cycle. Now a clip or a scene that is ready a moment late plays what
  it skipped at once, and a clip launch or a scene recall that reaches the SMK-37 up to about 20 ms after the line
  still lands on that line (its first notes up to 20 ms late, never missing). The LATE counter on the screen does
  not count these; it starts at 0 for a song that is loaded.
- **An edit is heard at once.** A note put on a step of a launched clip sounds in the pass in which you enter it when
  the step is still ahead (until tabby-v1.3: from the clip's next loop, up to eight bars later). A change of the
  clip's settings, and a take, play from the next loop as before.
- **The input log**: every pad, button, key and encoder event with its source and, for a pad, what its sensor read;
  the analog controls counted with their range; the samples of the highest pad reading that did not become a press.
  Read by the test tools; the release run and a soak with nothing injected look for presses nobody made.

## Validation

Candidate 5 (builds/tabby-v1.4-rc5/) on the device, unattended, before the promotion; the test computer awake and
otherwise idle; the same firmware had passed as candidate 4 the evening before.

- **Nothing pressed by itself**: soaks with nothing injected (only read-only questions), on six pages, stopped and
  playing: 2 hours on candidate 1 and 4 hours on candidate 3: 0 events from the panel. One pad reading came near a
  press in those six hours (582 above rest, pad 2, the mixer page, playing; on candidate 1, before the levels were
  changed). In this run: 4970 events of pads, buttons, keys and knobs in the log, every one sent by the test tools;
  no spike refused; the pads' resting noise 0 to 4 (their release levels: rest + 12).
- **The bar line** (120 BPM; a press sent 100 to 3 ms before the line, 6 times each): clip launch 60 of 60 on the
  line, scene recall 60 of 60, the page key and then a clip pad 60 of 60; none without its first note; none waited
  a cycle. Measured on the candidate before with presses after the line too: a press up to 8 ms after the line
  landed 18 of 18 times in each case, its first note 7 to 25 ms after the line; from 15 ms after, the next line.
- **A scene is stored** with SEQ REC + an empty pad; the pad alone held 1.2 s stores nothing (setting page 41 of 41).
- **An edit is heard in the same loop**: 1207 ms after the key, on its step (STEP page 19 of 19).
- **Stop** (ms from SEQ PLAY sent to the Stop byte, DIN): after SEQ PLAY 4.71 to 9.05; after a page change 5.41 to
  21.06; a save sent 1 ms after it 6.70 to 9.15; the first stop after a save 5.09 to 16.90; with the save by itself
  due 5.89, 5.60. The clock around a save: a pause of 90 to 93 ms, then its period (20.3 ms at the shortest).
- **One line, 960 notes** (DIN without the first note / USB / own, ms): overview 1.64, 1.73, 1.61 / 1.68, 1.68, 1.69 /
  1.50, 1.53, 1.54; CLIPS 1.79 / 1.76 / 1.63; SCENES 1.85 / 1.84 / 1.66; SYNC / MIDI 1.65 / 1.79 / 1.52; ACTIONS 1.74 /
  1.79 / 1.57; mixer 1.72 / 1.70 / 1.52. Eight lines: 2.69 to 2.95 on DIN, 2.0 to 2.2 on USB.
- **The latest send while a song ran**: 5.07 ms (CLIPS, in a device test; 5 sends at 4 ms or more in the whole run,
  none in the soaks); stopped 17.40 ms.
- **Soaks**: Wrong Room 40 + 40 minutes, 19 + 19 segments, none bad (USB band 1.39 to 2.40 and 1.41 to 1.77 ms);
  Meridian Fault 30 minutes, 9 passes, none bad, every note on both ports (worst USB 2.08 ms, DIN 11.86, own 2.88).
- The device's pixels 46 of 46; the CPU guard quiet; recording 30 of 30 (the mod wheel's controller did not appear in
  the takes); clip launch page 40 of 40 twice; the other device tests as before; backup, restore, verify PASS; the
  panel as it was found; the timing songs unchanged after every test.
- Still not looked at by a person: the glass itself (test T97 of the guide).
