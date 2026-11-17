Full backup works again on songs with a scene stored on the panel; otherwise tabby-v04.11 (clip chains). Use this page instead of tabby-v04.10 and tabby-v04.11.

# Classic Tabby tabby-v04.11.1: the page reads what the panel stores

- Firmware package build ID: `ea12999a89238727` (first 16 hex digits). App image 479236 bytes (measured), margin 40221 bytes below the
  519457-byte limit. The firmware's code is tabby-v04.11's; only the page changed.
- Installing over tabby-v04.2 to tabby-v04.11 keeps storage as it is. Take a Full backup first, with this page.

## Fixed

- **Full backup, verify and restore stopped on a song with a scene stored on the panel** (hold an empty pad on SCENES,
  new in tabby-v04.10). The page's song reader refused the mark such a scene carries, and the backup stood still at
  about 66 %. Found on the test device before the tabby-v04.11 install, which was therefore not made. The pages of
  tabby-v04.10 and tabby-v04.11 keep this fault and carry a note; the firmware was not at fault and no data was lost.
- The page also keeps a song's click and count-in settings when it reads and writes the song.

## What tabby-v04.11 brought (not installed anywhere before this build)

- Clip chains on CLIP SETTING: NEXT CLIP (STAY, STOP or a clip), AFTER (the clip's end, or 1 to 512 steps), TIMES.
- The count-in ends exactly on the beat.
