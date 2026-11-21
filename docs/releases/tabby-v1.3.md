Record or edit one clip after another while the song plays on: eight clips can be unsaved at once (one before). The firmware keeps a record of its latest timed MIDI send with what it was doing. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.3: take after take without stopping

- Firmware package build ID: `BUILDID` (first 16 hex digits). App image 490308 bytes (measured), margin 29149 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 53). From tabby-v1.2.1 (`9e858b3b5fa9f1b1`): +1632 bytes. At least
  15360 bytes stay free for fixes. Free RAM 121388 bytes (21792 less: the places for seven waiting clips).
- Installing over tabby-v04.2 to tabby-v1.2.1 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow, with the per-page timing check, the comparison of the device's own screen
  pixels and the soaks. CANDIDATES

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
  SMK-37 was doing: the page, the last remote command and the last panel action with their age, how long ago flash
  was written and the song was started or stopped. The test tools read it after every test and every soak; the
  release run fails when anything left 10 ms or more late while a song ran.
- **The release run soaks one of the user's own songs**: Meridian Fault (tests/fixtures/meridian_fault.mid), every
  note of every pass against the file.

## Validation

VALIDATION
