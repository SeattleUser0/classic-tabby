# Classic Tabby tabby-v04.2-diagA2 — TEST BUILD: option A2, the control pass on demand

Version 1.0, 2026-11-10 (Task 15 Step 4).

**A diagnostic build for one timing measurement. Not a release; not on the main page.** Its only
page is https://seattleuser0.github.io/classic-tabby/builds/tabby-v04.2-diagA2/ . Install steps:
~/Documents/Classic Tabby/INSTALL-tabby-v04.2-diagA2.txt and docs/BUILD.md 28.5.

- Firmware package build ID: `49b872869fdda9f1218e8041639a1ab9dbd55271337127cdd1f06d46a67e0c3d`.
  The Device update tab shows build number **49b872869fdda9f1**; while an install is in progress the
  update loader is named `ota-SMK3749b872869fdda9f1`.
- Boot screen and workbench badge: **tabby-v04.2-diagA2**; the device still identifies as
  `SMK-37 Pro_8000001`. Same storage layout as tabby-v04.0 and tabby-v04.1 (USER 471040): a normal
  update from either, nothing moves.
- App image 448868 bytes (+448 against tabby-v04.1); margin 70589 bytes (docs/FLASH-BUDGET.md 19).
- Built with `A2=1` from the tagged tree; both toolchain tracks give identical output
  (`make suite A2=1`). **Hardware validation: none yet.** This build exists to be measured.

## What is different from tabby-v04.1

Everything of tabby-v04.1, plus **option A2**, which is **off at boot**. While it is off the build
behaves as tabby-v04.1 does.

With A2 on, the audio interrupt asks the SDK for a control pass whenever a MIDI event (a song note,
a row event, the MIDI clock byte) is waiting to be sent, instead of leaving it for the next 10 ms
pass: at most one request per audio block (2.9 ms). Expected: the note-to-wire spread falls from
about 10 ms to about 3 to 4.5 ms on DIN and USB (an estimate; that is what this build measures).

**Switching A2:** ACTIONS (hold SEQ about 0.6 s), the last entry, "A2 FAST MIDI: OFF". Turn K1 or K5
to it and press the 4th button in the left group (after SHIFT, FADER BANK, HOME). The entry then
reads "A2 FAST MIDI: ON". The same press switches it off. A power cycle switches it off.
The measuring script on the NUC switches it by itself (transfer command 25, requests 8 and 9).

**Counters:** command 25 request 7: the number of requests, requests per second, the mean and the
longest time of the request inside the audio interrupt, retries.

**Why this is believed safe, and what is not known:** docs/BUILD.md 28.4. The SDK's own interrupt
handlers make the same kind of request; Task 13's "not safe" verdict used stock FreeRTOS rules that
this kernel does not follow. Not known until measured: the cost of the request inside the audio
interrupt and whether extra passes disturb audio or raise CPU GUARD. If you hear a dropout, see
CPU GUARD more often than before, get a stuck note, or lose USB MIDI with A2 on: switch A2 off (or
power-cycle) and report.
