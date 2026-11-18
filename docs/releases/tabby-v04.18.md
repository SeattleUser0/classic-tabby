The screen, Help and the guide now call every button by the word printed on it. No function changed. Reinstall to get the new screen texts (Full backup first; storage does not move).

# Classic Tabby tabby-v04.18: the printed button names

- Firmware package build ID: `1046c8ec5c0c7c0a` (first 16 hex digits). App image 485188 bytes (measured), margin 34269 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 41). From tabby-v04.17 (`748004a45cce48bd`): no change in size.
  At least 15360 bytes stay free for fixes, so 18909 bytes can still go to features.
- Installing over tabby-v04.2 to tabby-v04.17 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip with a TRANSPOSE other than 0 is refused by firmware before tabby-v04.15, and a clip with a SHUFFLE or a
  PLAY QUANTIZE by firmware before tabby-v04.17 (the track is silent there).
- Released through the candidate flow: published as builds/tabby-v04.18-rcN/, installed and tested on the device
  (every device test, full backup, restore, verify) before it reached the main page.

## What is new

Every button is now called by the word printed on the SMK-37, on the device screen, in Help, in the guide and its
PDF, and in the workbench's panel drawing. The words were read from a photograph of the unit.

| Printed on the button (used now) | Called before |
| --- | --- |
| KNOB BANK | SHIFT |
| < | HOME (the one in the left group) |
| > | "the 4th button in the left group", 4TH LEFT BTN on the screen |
| OCTAVE-, OCTAVE+ | OCT -, OCT + |
| NOTE REPEAT | PAD / STEP |
| SCALE | SCL |
| CHORD | ENV |
| GLOBE | MIX |
| PATCH | HOME, HOME / SRC |
| PARA | EDIT |
| SEQ PLAY | PLAY |
| SEQ REC | REC |

FADER BANK, ARP, BT, FX and SEQ were already called by their printed words. No button does anything it did not do
before. Messages that name a button changed with it: for example REC ARMED - PLAY STARTS IT is now REC ARMED - SEQ
PLAY STARTS IT, and 4TH LEFT BTN SAVES (STOPPED) is now > SAVES (STOPPED). docs/BUILD.md 54 lists all 61.

**Stickers.** docs/STICKERS.md and its PDF were checked against the photograph and redesigned: the earlier sheet
would have covered the strip of functions printed above the keys. The stickers are now 7/32 inch high, sit in the
clear gap between the transport symbols and that strip, cover no printing, and say what each button does.

## Validation

Filled in after the candidate ran on the device.
