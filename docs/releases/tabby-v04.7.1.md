A clip pad pressed while stopped reserves its clip for PLAY, and the two mutes look different; reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.7.1: the stopped pad as on the MC-707, two mutes told apart

- Firmware package build ID: `35cc4d303068d66f` (first 16 hex digits). App image 459620 bytes (measured), margin 59837 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 27). From tabby-v04.7 (`0d191b58095bef25`): +576 bytes. Runtime heap
  161420 bytes.
- Installing over tabby-v04.2 to tabby-v04.7 keeps storage as it is. Take a Full backup first anyway.

## What changed

- **A clip pad pressed while the song is stopped reserves its clip**, as on the MC-707: the pad blinks, the screen says
  RESERVED - PLAY STARTS IT, and PLAY starts the song with that track on the reserved clip while the other tracks follow
  scene 1. Press the blinking pad again to take it back. With CLOCK on MIDI the song starts on its scenes.
- **The two mutes look different.** SHIFT + pad 9 to 16 (sound and song notes on MIDI out): orange pads, MUTED ALL on the
  CLIPS page, M-ALL on the overview, TRACK MUTED: SOUND AND MIDI when set. A mute from the MIX page (the SMK-37's own sound
  only): blue pads, MUTED INT, M-INT.
- docs/CONTROL-MAP.md has a section "Differences from the MC-707" with the reason for each.
- The tabby-v04.5 builds page says to use tabby-v04.5.1 or later.

## Hardware validation

See the release page's "Hardware validation" text (added after the install) and docs/BUILD.md 40.3.
