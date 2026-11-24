Nothing happens by itself: a scene is stored with SEQ REC held and an empty pad, a control that wiggles at rest is not recorded, and the firmware logs every pad, button and key event. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.4: nothing happens by itself

- Firmware package build ID: `BUILDID` (first 16 hex digits). App image IMAGE bytes (measured), margin MARGIN bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 54). At least 15360 bytes stay free for fixes. Free RAM HEAP bytes.
- Installing over tabby-v04.2 to tabby-v1.3 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow, with the per-page timing check, the comparison of the device's own screen
  pixels and the soaks. CANDIDATES

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

VALIDATION
