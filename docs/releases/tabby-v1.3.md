Record or edit one clip after another while the song plays on: eight clips can be unsaved at once (one before). The firmware keeps a record of its latest timed MIDI send with what it was doing. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.3: take after take without stopping

- Firmware package build ID: `2fea867243829b60` (first 16 hex digits). App image 490532 bytes (measured), margin 28925 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 53). From tabby-v1.2.1 (`9e858b3b5fa9f1b1`): +1856 bytes. At least
  15360 bytes stay free for fixes. Free RAM 142892 bytes; each waiting clip takes 3088 bytes of it until it is saved.
- Installing over tabby-v04.2 to tabby-v1.2.1 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow, with the per-page timing check, the comparison of the device's own screen
  pixels and the soaks, as candidate 6. Candidates 1 to 5 were held back (docs/BUILD.md 67.4 to 67.8): 1: the places
  for waiting clips took the test tools' screen copy its memory; 2: the ACTIONS page sent late (fixed, below); 3:
  stopped by hand; 4: the Stop still waited 17 ms when a save was due at the stop; 5: the firmware that is
  released, held back by three checks of the test run itself. Candidate 6 is candidate 5's firmware, tested in full.

## What changed

- **Eight clips can be unsaved at a time.** Nothing is written to flash while a song plays, and until now a second
  clip could not be opened, recorded into or made while one was unsaved (ANOTHER CLIP IS UNSAVED): in a set that
  plays on, one take was all there was. Now the clip you leave waits: it plays as you left it and is saved with the
  others when the song is stopped (the > button, or by itself after ten seconds). Open it again and it is as you
  left it, without its undo levels (only the open clip has undo; the MC-707 also clears undo when the clip
  changes). A copy can be made of an unsaved clip. With eight unsaved, a ninth is refused: 8 UNSAVED - STOP TO
  SAVE. Another clip while a take is armed or runs: END THE TAKE FIRST. Unsaved clips are lost at power-off, as
  before: stop and save between songs.
- **The worst-lateness record.** The firmware now remembers the latest any timed MIDI event left after its due
  time, apart for "song running" and "stopped", since power-on and since the counters' reset, each with what the
  SMK-37 was doing: how long before it the pass before ran (a late pass, or an event that was given a due time
  already past), the page, the last remote command and the last panel action with their age, how long ago flash
  was written and the song was started or stopped. The test tools read it after every test and every soak; the
  release run fails when anything left 10 ms or more late while a song ran.
- **The ACTIONS page no longer sends late while a song plays.** It read the song storage every two seconds whatever
  was due (up to 5 ms): with a dense song the latest send on that page was 6.5 to 6.9 ms, 3 to 4 ms in every version
  before. While the transport runs the storage cannot change, so it is not read then.
- **A MIDI Stop can no longer wait behind a flash write.** A save that began in the few milliseconds between SEQ
  PLAY and the Stop message leaving held the Stop back for the whole write: measured 86, 86 and 91 ms in three of
  five tries with a save sent 1 ms after the stop (and 178 and 230 ms in the device's own record during the release
  tests). Now every flash erase and write first sends what is due and waits until a Stop in the queue has left.
  By hand this needed SEQ PLAY and the > button within about 7 ms.
- **The clock while stopped**: it runs on (CLOCK OUT is on by default), and a save or a transfer pauses it for
  about 105 ms (five clock bytes at 120). Measured on DIN and USB: after the pause it goes on at its period; no
  bytes are sent together afterwards. A save happens only after a change: ten seconds after the stop, or with the
  > button. The release run measures all of this (the step `stop`).
- **The release run soaks one of the user's own songs**: Meridian Fault (tests/fixtures/meridian_fault.mid), every
  note of every pass against the file.

## Validation

Candidate 6 (builds/tabby-v1.3-rc6/) on the device, unattended, before the promotion; the test computer kept awake
and otherwise idle. "Own" is the device's own record of how late a timed event left.

| Stop: ms from SEQ PLAY being sent to the Stop byte | DIN | USB |
| --- | --- | --- |
| after SEQ PLAY | 13.11, 7.77, 8.09, 6.78, 5.14 | 10.79, 7.46, 7.91, 5.41, 4.74 |
| right after a page change | 7.11, 11.74, 13.84, 19.22, 6.01 | 4.85, 11.40, 12.45, 17.91, 5.72 |
| a save sent 1 ms after the stop (before: 86, 86, 8, 8, 91) | 6.18, 11.78, 8.00, 7.90, 6.57 | 5.85, 11.55, 6.70, 6.54, 6.20 |
| the first stop after a save | 7.99, 5.45, 4.65, 7.89, 7.16 | 5.71, 5.08, 4.58, 6.92, 6.77 |
| more than 10 s after a change (the save by itself due) | 6.17, 7.08 | 5.81, 6.76 |

- **The clock around a save while stopped** (120 BPM, period 20.95 ms): a pause of 87.2 to 88.9 ms on DIN, 87.1 to
  90.0 on USB (three clock bytes missing); the shortest interval after it 20.10 ms (DIN), 19.94 (USB): no burst.
  Before this release: 105 to 108 ms, four bytes missing, no burst either.
- **No save without a change**: 0 flash operations 15 s after pages, play, stop, a clip opened; one changed note: one
  save within 15 s, nothing after.
- **The worst-lateness record over the run** (three soaks, every test): while a song ran 5.68 ms at most (STEP page,
  during the recording test; 4.84 on CLIPS in the program test; 7 sends at 4 ms or more in all, none in the soaks or
  timing runs); stopped 17.24 ms (a transfer).
- **One line, 960 notes** (DIN without the first note / USB / own, ms): overview 1.69, 1.71, 1.74 / 1.64, 1.65, 1.70 /
  1.46, 1.52, 1.52 (the first note +1.32, +1.20, +1.24); CLIPS 1.69 / 1.69 / 1.49; SCENES 1.72 / 1.73 / 1.53; SYNC /
  MIDI 1.73 / 1.66 / 1.50; **ACTIONS 1.67 / 1.66 / 1.49** (own was 3 to 4 in every version); mixer 1.67 / 1.75 / 1.50.
  Eight lines: 2.65 to 2.93 on DIN, about 2.0 on USB.
- **Soaks**: Wrong Room, EVENT LEAD OFF, 40 minutes, 19 segments, none bad (USB band 1.36 to 2.36 ms; DIN 14.79 to
  15.07 as before); EVENT LEAD 1/16, 19 segments, none bad (DIN 1.57 to 2.50, USB 1.33 to 1.56). **Meridian Fault**
  (the user's song), 30 minutes, 9 passes, none bad: 1532 of 1532 notes on both ports each time, worst note USB
  1.76 ms, DIN 11.76 ms (the cable: up to 18 messages due together), own 2.76 ms.
- The device's pixels: 46 of 46 pictures identical to the simulator's. The CPU guard: no action.
- Recording 30 of 30 (with a second take into a second new clip while the first is unsaved and the song plays; one
  save writes both), CLIP SETTING 40 of 40, take edit 26 of 26, note repeat 20 of 20, program and knobs 10 of 10,
  clip chains 11 of 11, scene chain 13 of 13, scene edit 16 of 16, STEP page 18 of 18, CLIPS page 40 of 40 twice.
- Full backup, restore, verify: PASS (41 items). The panel as it was found; the timing songs unchanged after every
  test; no command unanswered.
- Still not looked at by a person: the glass itself (test T97 of the guide).
