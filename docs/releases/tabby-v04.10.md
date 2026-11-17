New clips, a clip's length, copies, a click and a count-in, and stored scenes, all from the panel. Reinstall to get them (Full backup first; storage does not move).

# Classic Tabby tabby-v04.10: the clip workflow on the panel

- Firmware package build ID: `7e376d6bb50aacdb` (first 16 hex digits). App image 478372 bytes (measured), margin 41085 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 33). From tabby-v04.9.3 (`85d3dd36e7d4288e`): +7200 bytes.
- Installing over tabby-v04.2 to tabby-v04.9.3 keeps storage as it is. Take a Full backup first anyway.
- Songs changed on the device with this release (a new clip, a copy, a stored scene, a click setting) are saved in a
  form that older firmware does not read. Keep the backup if you may go back.

## What is new

- **A new clip from an empty pad.** Press an empty pad on CLIPS (it lights dim cyan). REC records a new clip there;
  EDIT opens a new empty clip on the STEP page. A new clip is one master cycle long.
- **CLIP SETTING** (FX on CLIPS; K5 chooses the line, K1 changes it, K2 by 16):
  - LENGTH, 1 to 128 steps. Shorter removes the notes past the new end; FX on the STEP page brings them back.
  - COPY TO PAD: the 4th left button copies the clip to an empty pad of the same track.
  - COUNT-IN: OFF, 1, 2 or 4 master cycles before a take that starts the song (REC, then PLAY). MIDI Start goes out
    after the count-in.
  - CLICK: OFF, WHEN RECORDING or ALWAYS. CLICK OUT: INTERNAL (the SMK-37's audio), MIDI NOTE (channel and note of
    your choice; channel 10, note 37 unless changed) or BOTH. If the audio goes to the house mix, use MIDI NOTE.
- **Store a scene.** On SCENES, while the song plays, hold an empty pad for half a second: what plays becomes a new
  scene. A pad that holds a scene is never written over.
- **Saving the song.** The 4th left button on CLIPS, SCENES and CLIP SETTING saves the unsaved clip and the song
  (stopped only); it also happens by itself ten seconds after the stop. The pages show UNSAVED until then.
- **Every clip loops at its own length.** A 1-bar clip in a 4-bar scene plays four times. Imported songs play as before.
- **Takes land where you heard them.** A take is placed one audio block (3 ms) earlier than before.

## Fixed

- A song record in the scenes format (version 3) that was being written when the power failed was dropped at the next
  start instead of being finished. Present since tabby-v04.6; found by reading the code, not seen on a device.

## Known

- A clip edited on tabby-v04.8 to tabby-v04.9.3 was stored as 64 steps. If its scene is shorter it now loops at 64
  steps: set LENGTH once.
- The click settings are stored in each song, not once for the device.
- Clip chains, scene lengths and a clip's own program change are not on the panel yet (next releases).

## Validation on the device (2026-11-16, unattended)

Full backup first (through the tabby-v04.9.3 page), one install attempt: "Firmware ready." after 11.8 s. Then, by
remote panel keys with the MIDI out read on a DIN input:

- CLIP SETTING, new clip, length, copy, stored scene, click and count-in: 21 of 21 (three checks failed first through
  errors in the test tool; the internal click was confirmed with a plain audio recording: clicks 500 ms apart).
- Recording: 25 of 25, with REC on an empty pad. A take without input quantize now plays back -0.15, +0.10 and
  -0.05 ms from where it was played (it was +3 ms).
- STEP page 18 of 18; CLIPS page 40 of 40, twice.
- 960 notes on one line: 1.89 ms band on DIN, 1.80 ms on USB; clock ratio 0.999600; no underruns.
- The count-in's MIDI Start came 2002.3 ms after the first click, 3.1 ms after the exact cycle (the song starts with
  the next audio block; made exact in tabby-v04.11).
- Backup after the tests and verify: PASS, 41 items.
