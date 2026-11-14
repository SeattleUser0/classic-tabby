Song notes leave at their due times: one line within 1.9 ms, eight lines within 3 ms, on every screen page; reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.4: timed MIDI out (a 0.5 ms timer and a look-ahead of one audio block)

- Firmware package build ID: `4b9196357ae5ba07` (first 16 hex digits; the full ID is in the Device update tab's
  firmware details). App image 453412 bytes (measured), margin 66045 bytes below the 519457-byte limit
  (docs/FLASH-BUDGET.md 23). From tabby-v04.3.1 (`71df5724063bc0cb`): +1376 bytes.
- Installing over tabby-v04.2 or tabby-v04.3.1 keeps storage as it is (USER 471040, no move). Take a Full backup first anyway.

## What is new

- **Timed MIDI out (options F + G, docs/BUILD.md 36, docs/SPEC.md 19.5).** Every note, row event and MIDI clock byte the
  audio engine queues now carries the time it is due. A hardware timer (TIMER5, every 0.5 ms) asks for the control pass
  when the next event is due, and the pass sends only what is due. MIDI out is one audio block (2.9 ms) later than before,
  by the same amount for every event, and no longer quantized to audio blocks.
- **Notes due together leave as one burst** per port (one call to the SDK instead of one per note).
- **The screen no longer delays a note.** A band is not started while a note is due within the band's time, and the
  ACTIONS page's storage lines are worked out twice a second instead of on every pass.
- **Clock follow** (CLOCK on MIDI): the song is kept one block ahead of the master's pulses, so its notes still leave at
  their pulses; band 2.7 to 3.1 ms against the master's pulse (5.1 to 5.9 ms on tabby-v04.3.1).
- A2 FAST MIDI on ACTIONS still switches all of it off and on for the session.

## What is removed, and a correction

- tabby-v04.3.1 added 0xF9 bytes after a USB write "so replies leave when CLOCK is on MIDI". **The device never held its
  replies.** The fault was in the developer's measuring tool on the NUC (it read one 16-byte piece of a reply per wake-up
  and left the rest in the ALSA library until more MIDI arrived; docs/BUILD.md 36.5). A browser always got every reply.
  The 0xF9 bytes are gone in tabby-v04.4. tabby-v04.2 and tabby-v04.3 had no such fault either.
- Firmware Update and the workbench work with CLOCK on INT or on MIDI (tested both ways through the published pages).

## Hardware validation

On one SMK-37 Pro, from the NUC, nobody at the panel (docs/BUILD.md 36.6), 125 s per run, A2 on, band per line in ms:

| | OVERVIEW DIN / USB | STEPS DIN / USB | ACTIONS DIN / USB |
| --- | --- | --- | --- |
| tabby-v04.3.1, one line | 4.62 / 4.63 | 5.10 / 5.08 | 5.70 / 5.73 |
| tabby-v04.3.1, eight lines (worst line) | 5.61 / 6.78 | 6.18 / 6.88 | 6.43 / 7.49 |
| tabby-v04.4 (rc4 firmware), one line | 1.79 / 1.72 | 1.89 / 1.81 | 1.76 / 1.62 |
| tabby-v04.4 (rc4 firmware), eight lines (worst line, worst of three runs on OVERVIEW) | 2.95 / 2.26 | 2.22 / 2.13 | 2.25 / 2.15 |

0 engine underruns and 0 DMA overruns in every run; CPU GUARD as on tabby-v04.3.1 (0 with one line; the eight-voice song
trips it about once a second, as before). Clock follow: every state passes with A2 off and on. Remote checks 27 of 27.
Updates through the published pages with CLOCK on INT and on MIDI: 10 to 12 s each.


## Known limits

- MIDI out is 2.9 ms later than on tabby-v04.3.1 (the look-ahead), the same for every note and for the MIDI clock.
- On DIN eight notes at the same step still take 9 ms to pass the wire one after the other (0.96 ms a note).
- With CLOCK on MIDI, key and pad notes leave with the 10 ms pass, as before.
- The device-test builds tabby-v04.4-rc1 to rc4 stay on the builds page; they are not releases.
