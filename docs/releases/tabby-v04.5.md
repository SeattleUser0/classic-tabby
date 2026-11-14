Larger clips: any number of notes on a step, controller events, rows of up to 8 bars; reinstall to get it (Full backup first; storage does not move).

**Known fault, fixed in tabby-v04.5.1:** this release's page cannot import a MIDI part that needs a v3 clip (a chord of more than four notes, controller events, rows of more than 64 steps): it stops with "clip-v3.js not loaded". Plain imports work. The firmware is not affected. Use the tabby-v04.5.1 page.

# Classic Tabby tabby-v04.5: v3 clips play from their event lists; rows of up to 128 steps

- Firmware package build ID: `e5a6c8b4789170be` (first 16 hex digits; the full ID is in the Device update tab's
  firmware details). App image 456196 bytes (measured), margin 63261 bytes below the 519457-byte limit
  (docs/FLASH-BUDGET.md 24). From tabby-v04.4 (`4b9196357ae5ba07`): +2784 bytes. Runtime heap 166220 bytes (194956 before).
- Installing over tabby-v04.2 to tabby-v04.4 keeps storage as it is (USER 471040, no move). Take a Full backup first anyway.
- Songs written by earlier versions play unchanged. A song with v3 clips or rows of more than 64 steps needs tabby-v04.5 on
  the device; the workbench refuses to write one to older firmware and says why.

## What is new

- **The v3 clip is played whole** (docs/CLIP-V3.md, docs/SPEC.md 19.6). The part a track plays in a row can hold any number
  of notes on a step (it was four), controller, pitch bend and channel pressure events, and up to 128 steps and 512 events.
  The device plays such a clip straight from its event list.
- **A clip's own program and bank** go out once when the track enters the clip, before its first note.
- **Rows of 16 to 128 steps** (8 bars of 4/4; it was 64).
- **The importer** writes a v3 clip only where a part needs one: all notes of a big chord are kept, the box "keep
  controller, pitch bend and aftertouch events in the clips" keeps them (one value per controller per 1/8 step), Bars per
  row offers up to 128 steps. Everything else is stored as before.
- **Backup and files.** The full backup, restore, verify and .tabby files carry v3 clips (a new download, transfer kind 9,
  hands a block over as it is stored). The step editor shows clips of up to 64 steps and four notes per step and keeps
  larger ones as they are.
- **The builds/tabby-v04.3 note** now reads "Never released; superseded by tabby-v04.4. (An earlier note called it faulty;
  that was a measuring error.)"

## For developers

- `make publish` and `make release-assets` refuse unless `make suite` passed on exactly the commit being published
  (tools/linux/suite-gate.py, docs/DEV_CHECKS.md 0b).
- Tests: a fuzz of the clip parser, the scheduler cursor and the storage under ASan and UBSan; the importer's v3 rule; a v3
  clip through backup, wipe, restore and verify against the firmware in the simulator.

## Hardware validation

See the release page's "Hardware validation" text (added after the install) and docs/BUILD.md 37.4.

## Known limits

- The step editor in the workbench cannot show or edit a v3 clip.
- A clip's program change goes out together with its first note; gear that needs time to change sounds wants a row event
  with a pre-roll.
- Song records are unchanged in this release: scenes and clip launching are the next releases.
