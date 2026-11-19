# Classic Tabby stage checklist

Version 1.2 (2026-11-19). For tabby-v1.1 and tabby-v1.2 (v1.2: the words of the new screen; v1.1: EVENT LEAD under "If the timing feels off"). One page: print it and keep it with the SMK-37. The same text is section 9 of
the manual (docs/TESTING-GUIDE.md, the manual PDF); tests/workbench/guide.mjs fails when the two differ. Section
numbers in brackets are the manual's.

## Before the show day

- Never install firmware on a show day. Install days before, play the whole set once on that firmware, and take a Full backup (5.5) afterwards. Keep the backup file on the laptop you bring.
- Stop the song and press the > button after the last change to a song. Unsaved changes are lost at power-off.


## Power-up order

1. The synths, pedals and the H4MIDI first. Wait until each one has finished starting.
2. Then the SMK-37. If it gets its power from the H4MIDI's USB host port, it starts with the H4MIDI: wait for its screen.
3. Audio last: mixer or interface up when everything is on.


## What to check on the screen

1. The boot screen shows SMK37, OFFICIAL OPEN and the version you rehearsed with.
2. No OLD DATA or STORAGE ERROR in large amber letters on the SCENES or CLIPS page. If one shows, do not erase anything at the venue: the songs may not load; use the backup plan you rehearsed.
3. Press SEQ: CLOCK says INT (K1), SEQ OUT says ON (K4). Press PATCH.
4. Press BT, then SCALE: the SCENES page shows your song's number. Turn K5 if it is another song.
5. Press SEQ and PARA together, choose SEND SETUP, press the > button: SETUP SENT - ROW 1 EVENTS. Every synth is now on its first sound.
6. Play one key on each track (KNOB BANK and pad 1 to 8 choose the track): every synth answers.


## If a synth does not respond

1. Hold KNOB BANK and look at the lower pad row: an orange pad is a muted track. Press it to unmute.
2. Hold KNOB BANK and press SEQ: the track's OUT CH (K2) is the synth's channel, SEQ (K3) is BOTH or MIDI, OUT PORT (K4) is ALL.
3. Press SEQ: SEQ OUT is ON. KEY OUT (K7) is ON if the keys should reach it.
4. The cable, and the H4MIDI's route for that channel (MIDI guide, section 14). Swap the cable before anything else.
5. Wrong sound but it plays: SEND SETUP again (song stopped).
6. A note hangs: PATCH and SEQ PLAY together stop all sound.


## If the timing feels off

1. Press SEQ: CLOCK must say INT, unless you mean to follow another clock. With CLOCK on MIDI the SMK-37 waits for that clock.
2. Use cables. Bluetooth MIDI adds delay.
3. The SCENES page shows LT and a number (LATE on CLIPS) when a scene's program changes did not finish before its bar. Give that scene fewer changes, or a pre-roll (5.2).
4. On one DIN cable a scene's program changes pass ahead of its first notes. EVENT LEAD on CLIP SETTING (4.11) sends them before the downbeat; the sound then changes that much early. Decide this at rehearsal, not at the show.
5. Many notes on one step leave a DIN cable one after the other, about 1 ms each. The H4MIDI on USB, one DIN output per synth, keeps them apart.
6. Still off: switch the SMK-37 off and on. That puts every run-time switch back (A2 FAST MIDI is ON after power-up). Then SEND SETUP.


## After the show

- If something went wrong, write down what the screen said before you switch off (section 8).
