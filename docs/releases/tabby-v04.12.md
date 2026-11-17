The scene chain: each scene's length and what follows it, set on the SCENES page, with a hold. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.12: the scene chain

- Firmware package build ID: `568ffa35e8faa236` (first 16 hex digits). App image 480420 bytes (measured), margin 39037 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 35). From tabby-v04.11.2 (`5132d1244cb66781`): +1184 bytes.
- Installing over tabby-v04.2 to tabby-v04.11.2 keeps storage as it is. Take a Full backup first anyway.

## What is new

- **The scene chain on the SCENES page.** The scenes of a song play in order. For the scene that plays:
  - K1: how many times it plays before the next one (1 to 64). The LEN line shows the scene's length in master cycles.
  - K2: THEN NEXT (the following scene comes by itself) or THEN STAY (it repeats until you recall another).
  - K3: CHAIN HELD keeps the scene that plays whatever its settings say; CHAIN RUNS lets the song go on.
- **A pad always wins**: the song jumps to that scene and goes on from there.
- **Start anywhere.** A scene pad pressed while the song is stopped reserves that scene; PLAY starts there (as on the
  MC-707). The pad again takes it back.
- The settings are part of the song and are saved with it.
