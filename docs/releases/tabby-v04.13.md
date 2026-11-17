A program change and bank for each clip, and four controller knobs that a take records. Reinstall to get them (Full backup first; storage does not move).

# Classic Tabby tabby-v04.13: a clip's program and bank; the controller knobs

- Firmware package build ID: `9c6c2806e46ffae0` (first 16 hex digits). App image 481156 bytes (measured), margin 38301 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 36). From tabby-v04.12 (`568ffa35e8faa236`): +736 bytes.
- Installing over tabby-v04.2 to tabby-v04.12 keeps storage as it is. Take a Full backup first anyway.

## What is new

- **PROGRAM, BANK MSB and BANK LSB on CLIP SETTING** (FX on CLIPS, after TIMES). The bank select and the program change
  go out on the track's channel when the track enters the clip (its pad, a chain, a scene), just before the clip's first
  notes; not on every loop. They go to MIDI out only. Changed while the clip loops, they go out once at its next loop.
- **K1 to K4 on the CLIPS page send controllers** 74, 71, 1 and 11 for the selected track (two per click; the screen
  shows the value). They go where the track's keys go.
- **A take records the knobs.** REC, then turn: the movement is written into the clip, thinned like every controller
  (once per 1/32 note while it moves, and its last value), and the clip plays it back.

## Known

- The four controller numbers are fixed.
- A clip's program change leaves together with its first note. Gear that needs time to change sounds wants a scene's
  row event with a pre-roll (the workbench's song editor).

## Validation on the device (2026-11-16, unattended)

Full backup first, one install attempt: "Firmware ready." after 9.6 s. Program and knobs 10 of 10 (bank MSB, LSB and
program on the track's channel before the clip's first note; K1 sends controller 74; twelve clicks in a take are
recorded thinned and played back). Clip chains 11 of 11, scene chain 13 of 13, CLIP SETTING 21 of 21, recording 25 of
25, STEP page 18 of 18, CLIPS page 40 of 40 twice. 960 notes on one line, three runs: DIN band 2.05, 1.92, 1.85 ms; USB
1.80, 1.91, 1.79 ms; the device's rate 0.999580 in each. Backup and verify after: PASS.
