Song mode follows an external MIDI clock, and the workbench works with CLOCK on MIDI; reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.3.1: external clock follow in song mode; USB replies with CLOCK = MIDI

- Firmware package build ID: `71df5724063bc0cb` (first 16 hex digits; the full ID is in the Device update tab's
  firmware details). App image 452036 bytes (measured), margin 67421 bytes below the 519457-byte limit
  (docs/FLASH-BUDGET.md 22). From tabby-v04.2 (`b926f5556483ee65`): +2336 bytes.
- Installing over tabby-v04.2 keeps storage as it is (USER 471040, no move). Take a Full backup first anyway.
- tabby-v04.3 was never released (it was wrongly called faulty; see the correction below). Its tag and its page
  builds/tabby-v04.3/ stay.

**Correction, 2026-11-14 (docs/BUILD.md 36.5):** the fault described here did not exist in the device. The NUC's measuring tool (tools/linux/hw/tabby_link.py before v0.11) read one 16-byte piece of a reply per wake-up and left the rest in the ALSA library until more MIDI arrived; with CLOCK on MIDI no clock bytes arrived, so the tool saw no reply. A browser always got every reply. The 0xF9 bytes this release adds after a USB write are removed again in tabby-v04.4. tabby-v04.3 was therefore not faulty either.

## What is fixed

- **With CLOCK = MIDI the device sent no replies over USB.** The workbench, Firmware Update and every tool saw a device
  that did not answer, although it played and its panel worked; turning K1 on the SYNC / MIDI page back to INT brought
  the replies back. This is in every release up to tabby-v04.2 (and with clock out switched off). Cause: the SDK
  transmits the last message written to the USB port only when another write follows, and only the outgoing MIDI clock
  provided one. Now, when no clock goes out on USB, the four control passes after a USB write each send one undefined
  real-time byte (0xF9), which receivers ignore (docs/BUILD.md 35, docs/SPEC.md 19.4). Measured on the device: 1700
  status replies in a row with CLOCK = MIDI, none lost, 7 to 22 ms each.
- A guard: the fast MIDI request is not made while the app erases or writes flash (the request path is flash code,
  docs/BUILD.md 34). It has not been seen to trigger on the device.

## What is new

- **External clock follow in song mode** (decision 10, SPEC 19.3). With CLOCK = MIDI (SEQ, K1) PLAY arms the song
  (the SONG page shows ARMED: START?) and the master takes the transport: Start from the first pulse, Continue from
  the held position, Stop at once with every note released (Stop always wins), Song Position Pointer while stopped
  and while running. If the pulses stop for about three, the song holds and releases its notes (HOLD: NO CLOCK); if
  they return within 2 s it carries on from where it held; after 2 s it shows LOST - CONTINUE and only Continue or
  Start restarts it, never the pulses alone. At the song end it arms again. The clock comes in over USB or Bluetooth;
  the TRS jack is output only.
- Everything of tabby-v04.2 stays: fast MIDI on by default (A2), remote control (command 29), the corrected screen texts.

## Hardware validation

On one SMK-37 Pro, from the NUC, nobody at the panel (docs/BUILD.md 35.3 and 35.5): both clock-follow runs (A2 off, A2 on)
pass every state (armed, lock, tempo changes, hold, relock, lost, Stop, Continue, Start, SPP) with 0 underruns and 0 DMA
overruns; lock time after Start 4 ms (A2 on); note offset against the master's pulse 3.5 ms mean, 1.8 ms standard deviation
(A2 on; 7.4 / 3.3 ms with A2 off). Remote checks 26 of 26.

## Known limits

- With CLOCK = MIDI, key and pad notes do not get the fast MIDI path (they leave with the 10 ms pass, as before v04.2).
- One line with fast MIDI on: 5.0 to 5.9 ms band (largest minus smallest), standard deviation 0.9 ms; 3 to 16 notes of 960
  are up to 4.3 ms late, depending on the page the screen is painting (docs/BUILD.md 35.4).
