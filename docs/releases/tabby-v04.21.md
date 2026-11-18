Three things on the panel: FX with a key clears notes during a take, KNOB BANK with OCTAVE- or OCTAVE+ shifts a clip by a step, and NEW SONG in ACTIONS starts an empty song. Reinstall to get them (Full backup first; storage does not move).

# Classic Tabby tabby-v04.21: clear notes in a take, shift a clip, a new song on the panel

- Firmware package build ID: `0bb7c4fb25bc175a` (first 16 hex digits). App image 489188 bytes (measured), margin 30269 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 44). From tabby-v04.20 (`693c8946957ae272`): +1600 bytes. At least
  15360 bytes stay free for fixes, so 14909 bytes can still go to features. Free RAM 142700 bytes (-64).
- Installing over tabby-v04.2 to tabby-v04.20 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. Nothing in this release adds to that list: a shifted clip and a song made with NEW SONG are read by
  tabby-v04.10 and later.
- Released through the candidate flow: published as builds/tabby-v04.21-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What is new

- **Clear notes during a take.** While a take runs, hold FX and hold a key: each note of that key is taken out of
  the clip as the clip passes it. One pass of the clip clears them all; a shorter hold clears only what was passed.
  The key sounds but is not recorded; several keys can be held. During a take FX does nothing else (pressed alone it
  says HOLD FX + A KEY: CLEARS ITS NOTES). The cleared notes come back with the undo of the take.
- **Shift a clip.** On the STEP page, KNOB BANK + OCTAVE+ moves every note, controller and step probability of the
  clip one step later, KNOB BANK + OCTAVE- one step earlier. What leaves one end of the clip comes in at the other.
  A run of shifts is one undo level. Without KNOB BANK the two buttons change the bar, as before.
- **NEW SONG** in ACTIONS (SEQ + PARA). On SCENES, with the song stopped, turn K5 to a slot that says NO SONG; open
  ACTIONS, choose NEW SONG, press the > button twice. The song is named NEW SONG, uses the loaded project and its
  tempo, and has one empty scene. CLIPS opens: hold an empty pad and press SEQ REC or PARA for the first clip. A
  slot that holds a song is never replaced. The song's name is changed in the workbench.
- ACTIONS has nine entries now (NEW SONG before A2 FAST MIDI) and shows them a little closer together.
- Stickers (docs/STICKERS.md v0.4, in the source): no type below 6 point; they now cover the strip of key functions
  printed above the keys, on purpose, because none of those functions works in Classic Tabby. The pad rows are
  written down as an assumption: upper row = pads 1 to 8.

## Validation

Candidate 2 (builds/tabby-v04.21-rc2/) on the device, unattended, before the promotion:

- Take edit 26 of 26: the clip shifted later, earlier and round its end; FX + the key cleared the clip's four notes
  in one pass (2 left after 0.9 s) and recorded nothing; NEW SONG refused on a slot that holds a song, made in an
  empty slot, a first clip recorded into it, saved, read again, and the song deleted again.
- Program and knobs 10 of 10, clip chains 11 of 11, scene chain 13 of 13, scene edit 16 of 16, CLIP SETTING 38 of 38,
  recording 25 of 25, STEP page 18 of 18, CLIPS page 40 of 40 twice, the timing song 960 of 960 notes on DIN and USB.
- One line, 960 notes, three runs: DIN 1.91, 1.72, 1.81 ms; USB 1.59, 1.67, 1.74 ms.
- Full backup, restore of that backup, verify: PASS (41 items), twice.

Candidate 1 was the same firmware build. It was not promoted because one check group of the new device test failed:
the test pressed the wrong key (it assumed the keys' octave). The corrected test passed on candidate 1 as installed,
and candidate 2 passed every step (docs/BUILD.md 57.4).
