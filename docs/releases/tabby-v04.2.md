Fast MIDI on by default, remote control over USB; reinstall to get it (Full backup first; storage does not move).

**Correction, 2026-11-14 (docs/BUILD.md 36.5):** the fault described here did not exist in the device. The NUC's measuring tool (tools/linux/hw/tabby_link.py before v0.11) read one 16-byte piece of a reply per wake-up and left the rest in the ALSA library until more MIDI arrived; with CLOCK on MIDI no clock bytes arrived, so the tool saw no reply. A browser always got every reply. There is no such issue in tabby-v04.2.

**Known issue, fixed in tabby-v04.3.1:** with CLOCK set to MIDI (or clock out switched off) the device sends no replies over
USB, so the workbench and Firmware Update cannot reach it; the device itself keeps working. Turn K1 on the SYNC / MIDI page
(SEQ) back to INT, or install tabby-v04.3.1. (An earlier note here blamed fast MIDI and a settings save; that was wrong.)

# Classic Tabby tabby-v04.2: fast MIDI by default, remote control, stale texts fixed

- Firmware package build ID: `b926f5556483ee65` (first 16 hex digits; the full ID is in the Device update tab's
  firmware details). App image 449700 bytes (measured), margin 69757 bytes below the 519457-byte limit
  (docs/FLASH-BUDGET.md 20). From tabby-v04.1.1 (`1249d59746334fcf`): +1280 bytes.
- Installing over tabby-v04.1 or v04.1.1 keeps storage as it is (USER 471040, no move). Take a Full backup first anyway.

## What is new

- **Fast MIDI (option A2) is on at power-up.** Song notes used to wait for the next 10 ms control pass; the audio
  engine now asks for that pass at once. One line on DIN leaves 3.67 ms after it is due instead of 12.34 ms
  (measured, tabby-v04.2-diagA2, BUILD.md 28.6). ACTIONS has a last entry, A2 FAST MIDI: ON / OFF, that switches it
  for the session (RAM only). Diagnostics shows its counters. F + G (the direct DIN writer) was considered and is
  not built: one line is already under 4 ms, and the eight-line worst case is mostly the DIN cable's own byte time.
- **Remote control over USB** (transfer command 29, every build): status (screen page, song state, A2), select a
  song, PLAY, STOP, jump to a row, A2 on / off, and press, hold or release a named panel control, so tests run with
  nobody at the panel. It writes nothing to flash; the 4th button in the left group (SAVE) is refused. Held controls
  are released by themselves after 5 s.
- **Stale screen texts fixed** (no behaviour change): "K2 CLK IN AUTO USB BLE", "ERASE OLD DATA", "SEQ+EDIT: ACTIONS",
  "PAD/STEP KEY-PAD". Two out-of-bound lint findings in the song storage closed by explicit range tests.
- Help chapter 00 and the testing guide are updated for all of this.

Hardware validation: BUILD.md 32.
