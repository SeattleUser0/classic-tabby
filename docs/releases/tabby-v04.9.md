REC records what you play into a clip, from the keys or from MIDI in; reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.9: real-time recording

- Firmware package build ID: `d1191dd33942c3c3` (first 16 hex digits). App image 471044 bytes (measured), margin 48413 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 29). From tabby-v04.8 (`6238066d230eee73`): +3456 bytes. Runtime heap
  144844 bytes.
- Installing over tabby-v04.2 to tabby-v04.8 keeps storage as it is. Take a Full backup first anyway.

## What is new

- **REC** on the CLIPS and STEP pages starts a take into the track's selected clip while it loops (docs/CONTROL-MAP.md
  section 13). With the song stopped REC arms and PLAY starts the song and the take; with the song playing the clip is
  launched if it is not looping and the take starts on the next master cycle. REC again stops. The REC lamp shows it.
- **What is recorded:** the keys and pads, and notes, controllers below 120, pitch bend and channel pressure arriving at
  MIDI in on the track's input channel. What was in the clip stays (overdub). You hear a note from the clip's next loop.
- **Input quantize** is on at power-up: notes go to the nearest step with the length played. SHIFT + REC switches it off
  (a note keeps its time, to 1/480 of a step) and on.
- **Controllers are thinned:** a moving controller is recorded once per 1/32 note, and its last value when it stops.
- **Undo:** a take is one undo level (FX on the STEP page); FX does nothing during a take.
- **A full clip** (512 events) stops the take by itself: CLIP FULL - 512 EVENTS - REC STOPPED, the REC lamp goes out, the
  clip's pad shows red once. Nothing recorded is lost.
- The control map lists how recording differs from the MC-707's, and why.

## Changed behaviour to know about

- REC no longer says NO REC IN THIS VERSION. On pages other than CLIPS and STEP it says where it works.
- The event cap of a clip is 512, not the 768 an earlier design note gave: a clip must fit one storage sector
  (docs/SPEC.md 14.2).

## Known limits

- No count-in and no click. Recording goes into an existing clip, not an empty pad. The clip's length cannot be changed.
- Polyphonic aftertouch and program changes are not recorded.

## Hardware validation

See the release page's "Hardware validation" text (added after the install) and docs/BUILD.md 42.3.
