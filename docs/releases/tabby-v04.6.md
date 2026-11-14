Songs can be stored as scenes and clips, with a master cycle for launches; reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.6: song record version 3, scenes

- Firmware package build ID: `e9bc4788e8399d26` (first 16 hex digits). App image 456900 bytes (measured), margin 62557 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 25). From tabby-v04.5.1 (`3df5848e878827d6`): +704 bytes. Runtime heap
  161548 bytes (166220 before).
- Installing over tabby-v04.2 to tabby-v04.5.1 keeps storage as it is. Take a Full backup first anyway.
- Songs written by earlier versions play unchanged, and the device never rewrites a stored song. A song becomes scenes only
  when you write it again from the workbench. A song stored as scenes needs tabby-v04.6 on the device.

## What is new

- **Scenes and clips** (docs/SCENES.md, docs/SPEC.md 19.7). A song can be stored as scenes: every track has 64 places for
  clips, a scene names one clip per track with a length of 16 to 128 steps and a repeat count, a song has up to 128 scenes.
- **The master cycle.** Each song has a cycle of 2 to 128 steps (16 unless set). A track launch, a track stop, back to the
  song and a scene recall land on its next multiple. An imported 3/4 song gets 12 steps, so launches land on its bar lines.
- **The importer** writes scenes when its box is ticked (it is at the start): clips of up to 8 bars, one scene per stretch,
  the cycle set to the file's bar. It no longer sends a controller twice when it sits at a row start.
- **The song editor** has "Stored as" (scenes and clips, or rows) and "Master cycle".
- Remote commands for the unattended tests: launch a track's pattern, stop a track, back to the song.

## Hardware validation

Installed on the SMK-37 Pro on 2026-11-14 through the published page (Full backup first; identity checked; one attempt;
"Firmware ready." after 11 s). All tests by remote command, nobody at the panel (docs/BUILD.md 38.3):

- Six songs imported through the page as scenes and played: every expected note-on sent (6, 16, 7, 16, 960 and 1600 of
  them), on DIN and USB, worst timing error 0.3 to 1.7 ms (6.7 ms on DIN where three lines share the cable), controller
  events in order, no stuck note.
- Master cycle of 12 steps: six launches at random moments, each on the next cycle, within 1.4 ms.
- One line of 960 notes: band 1.82 ms on DIN, 1.67 ms on USB. No audio underrun.
- Full backup and verify after: PASS (9 songs, 25 blocks).

## Known limits

- The device's pages still show rows and patterns (the SONG and LAUNCH pages); the clip page that shows a track's clips in
  banks of 16 is the next release.
- The step editor in the workbench cannot show a v3 clip.
