Full backup works on songs with a scene stored on the panel; otherwise tabby-v04.11 (clip chains). Use this page instead of tabby-v04.10, tabby-v04.11 and tabby-v04.11.1.

# Classic Tabby tabby-v04.11.2: the page reads what the panel stores

- Firmware package build ID: `5132d1244cb66781` (first 16 hex digits). App image 479236 bytes (measured), margin 40221 bytes
  below the 519457-byte limit. The firmware's code is tabby-v04.11's; only the page changed.
- Installing over tabby-v04.2 to tabby-v04.10 keeps storage as it is. Take a Full backup first, with this page.

## Fixed

- **Full backup, verify and restore stopped on a song with a scene stored on the panel** (hold an empty pad on SCENES,
  new in tabby-v04.10): the status line said "Scene n is invalid" and the backup stood still at about 66 %. The page has
  two readers for a song record and both refused the mark such a scene carries. tabby-v04.11.1 corrected one of them and
  was published before the second was found; its backup still stopped. This build corrects both, and the corrected page
  was run against the test device before it was published: the backup of the device that the other pages could not
  read went through (30 blocks).
- The firmware was not at fault and nothing on the device was lost. tabby-v04.11 and tabby-v04.11.1 were never
  installed, because the backup that must come first did not finish.
- The page keeps a song's click and count-in settings when it reads and writes the song.

## What tabby-v04.11 brought

- Clip chains on CLIP SETTING: NEXT CLIP (STAY, STOP or a clip), AFTER (the clip's end, or 1 to 512 steps), TIMES.
- The count-in ends exactly on the beat.
