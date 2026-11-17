CLICK LEVEL, your own controller numbers for K1 to K4, a Full backup that names a song it cannot read, and a fix for clips losing their chain in the workbench. Reinstall to get them (Full backup first; storage does not move).

# Classic Tabby tabby-v04.14: click level, controller numbers, two page fixes

- Firmware package build ID: `781bd68d03f176ca` (first 16 hex digits). App image 481572 bytes (measured), margin 37885 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 37). From tabby-v04.13 (`9c6c2806e46ffae0`): +416 bytes.
- Installing over tabby-v04.2 to tabby-v04.13 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
- First release made under the new flow: it was published as a release candidate (builds/tabby-v04.14-rcN/),
  installed on the device from that page and passed every device test, a full backup, a restore and a verify before
  it reached the main page.

## Fixed

- **The Full backup names a song it cannot read and stops.** When a song on the device was saved by newer firmware
  than the page knows, the backup line now says "STOPPED at song 7: this page cannot read it", that no file was made
  and nothing on the device changed, and what to do (open the page of the firmware on the device, or delete the
  song). Verify does the same. Before, the reason appeared on another line and the backup stood still.
- **The workbench dropped a clip's chain and its own length (data loss).** A song read from the device into the MIDI
  importer and written again lost NEXT CLIP, AFTER and TIMES of its clips, and a clip shorter than 64 steps came back
  64 steps long. Clips now come back byte for byte. The Full backup, restore and the song editor were not affected.

## What is new

- **CLICK LEVEL** on CLIP SETTING: LOW, MID or HIGH for the internal click, each twice as loud as the one before. A
  song that was never set is on MID, which is four times the level of tabby-v04.13; HIGH is about a note's level.
- **K1 CONTROLLER to K4 CONTROLLER** on CLIP SETTING: the controller number each of K1 to K4 sends on the CLIPS page,
  0 to 127, saved with the song. Unchanged songs keep 74, 71, 1 and 11.
- **CLIP SETTING has two pages**: 1/2 the clip's lines (LENGTH to COPY TO PAD), 2/2 the song's lines (COUNT-IN to
  K4 CONTROLLER). K5 walks through all eighteen lines.

## Unchanged, by decision

- Click settings stay in each song.
- Clip chains run on tracks you launched; tracks that follow the scenes ignore them.

## Validation

A release under the new flow exists only if its candidate passed every step on the device (SPEC 17.13). The figures of
the run are in docs/BUILD.md 50.3 and are added to these notes after the release.
