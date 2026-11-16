The STEP page: edit a clip's notes on the pads and keys of the SMK-37; reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.8: step editing

- Firmware package build ID: `6238066d230eee73` (first 16 hex digits). App image 467588 bytes (measured), margin 51869 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 28). From tabby-v04.7.1 (`35cc4d303068d66f`): +7968 bytes. Runtime heap
  145804 bytes (161420 before; the editor's copy of the clip and four undo levels).
- Installing over tabby-v04.2 to tabby-v04.7.1 keeps storage as it is. Take a Full backup first anyway.
- Songs are not changed until you edit a clip and it is saved. An edited clip is stored in the v3 clip format: a song
  edited on the device needs tabby-v04.5 or later to play.

## What is new

- **The STEP page** (docs/CONTROL-MAP.md section 12). EDIT on the CLIPS page opens it on the selected clip. The 16 pads
  are the steps of one bar: a pad selects a step, a key of the keyboard enters its note on that step, the same key
  removes it. K1 chooses a note of the step; K2, K3, K4 set its velocity, its start (early or late, 1/480 of a step) and
  its length. K7 sets the step's probability. OCT - / OCT + or K6 change the bar.
- **Drums in one press.** SCL switches the pads to toggle the current note (the last key played) on each step.
- **Undo and redo**, four levels: FX, SHIFT + FX. ENV clears the selected step; SHIFT + ENV discards every unsaved change.
- **You hear the edit without saving.** The song plays the unsaved clip; a clip that loops on its track plays each change
  from its next loop, and a white pad shows the step that plays.
- **Saving.** Never while the song plays (STOP TO SAVE). Stopped: the 4th left button, or by itself ten seconds after
  the last change.
- The control map lists how this differs from the MC-707's step recording, and why.

## Known limits

- One clip can be unsaved at a time. A clip that two tracks share cannot be edited on the device.
- The clip's length cannot be changed on the device. A clip holds 512 events.
- No recording yet (the next release).
- The step editor in the workbench cannot show a v3 clip, so a clip edited on the device cannot be opened there.

## Hardware validation

See the release page's "Hardware validation" text (added after the install) and docs/BUILD.md 41.3.
