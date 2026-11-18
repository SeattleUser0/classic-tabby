Delete and move a scene on the SCENES page; stopping the song takes an armed take off; the manual as one printable PDF. Reinstall to get them (Full backup first; storage does not move).

# Classic Tabby tabby-v04.16: delete and move a scene, a stop ends an armed take, the printable manual

- Firmware package build ID: `ed9182d3a3d67ec9` (first 16 hex digits). App image 484324 bytes (measured), margin 35133 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 39). From tabby-v04.15 (`8b5a73f6a2d9ee40`): +1792 bytes. At least
  15360 bytes stay free for fixes, so 19773 bytes can still go to features.
- Installing over tabby-v04.2 to tabby-v04.15 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip with a TRANSPOSE other than 0 is refused by firmware before tabby-v04.15 (the track is silent there).
- Released through the candidate flow: published as builds/tabby-v04.16-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What is new

- **Delete a scene.** On SCENES, with the song stopped, select the scene (press its pad: it blinks; with no pad
  blinking it is scene 1) and press FX. The screen asks FX AGAIN DELETES SCENE and its number; FX again within two
  seconds deletes it. The later scenes move one pad earlier. The scene's clips stay in the song. A song keeps at
  least one scene. There is no undo: the change is saved with the song.
- **Move a scene.** Hold EDIT and turn K1: the selected scene moves one pad earlier or later and stays selected. A
  scene stored while playing is added after the last one; stop and move it to where it belongs.
- Both only while the song is stopped (STOP TO DELETE OR MOVE A SCENE). In a song imported from a MIDI file a
  change that would alter the length of a clip is refused (NOT DELETED: SETS A CLIP'S LENGTH); the guide says what
  to do then. FX and EDIT no longer open the effects page and the DX7 quick page from SCENES.
- **A stop takes an armed take off.** REC pressed while the song plays arms a take until the clip loops. If the song
  is stopped before that, the take is now taken off: SONG STOPPED - REC OFF, and the REC lamp goes out. A take armed
  while the song is stopped still waits for PLAY.
- **The manual as one PDF.** The testing and user guide is also one printable file (US Letter, 46 pages):
  guide/classic-tabby-manual.pdf, linked from the top of the guide.
- **Stickers.** docs/STICKERS.md gives every dimension in inches as fractions to 1/32. It is still measured from
  the manufacturer's drawing, not from a unit.

## Validation

Filled in after the candidate ran on the device.
