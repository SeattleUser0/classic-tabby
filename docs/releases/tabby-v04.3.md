**Faulty, never released: do not install. Use tabby-v04.3.1.** With CLOCK = MIDI this build sends no replies over USB (it looks hung to the workbench).

Song mode follows an external MIDI clock; reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.3: external clock follow in song mode

- Firmware package build ID: `b136b74165821a3a` (first 16 hex digits; the full ID is in the Device update tab's
  firmware details). App image 451812 bytes (measured), margin 67645 bytes below the 519457-byte limit
  (docs/FLASH-BUDGET.md 21). From tabby-v04.2 (`b926f5556483ee65`): +2112 bytes.
- Installing over tabby-v04.2 keeps storage as it is (USER 471040, no move). Take a Full backup first anyway.

## What is new

- **External clock follow in song mode** (decision 10, SPEC 19.3). With CLOCK = MIDI (SEQ, K1) PLAY arms the song
  (the SONG page shows ARMED: START?) and the master takes the transport: Start from the first pulse, Continue from
  the held position, Stop at once with every note released (Stop always wins), Song Position Pointer while stopped
  and while running (through rows and repeats). Each clock pulse moves the song 80 units; a tempo change is followed
  within about 8 pulses. If the pulses stop for about three, the song holds and releases its notes (HOLD: NO CLOCK);
  if they return within 2 s it carries on from where it held; after 2 s it shows LOST - CONTINUE and only Continue or
  Start restarts it, never the pulses alone. At the song end it arms again. The clock comes in over USB or Bluetooth;
  the TRS jack is output only (SPEC 17.6).
- The remote status (transfer command 29) carries the follow state; the workbench Help, the testing guide (test T32)
  and SPEC 19.3 describe it.
- Everything of tabby-v04.2 stays: fast MIDI on by default (A2), remote control, the corrected screen texts.

**Hardware validation: INCOMPLETE. Not released on the main page.** Installed from the permanent page builds/tabby-v04.3/ on one
device; the first follow test hung the device after the CLOCK change (BUILD.md 33.3). Host and simulator tests all pass.
