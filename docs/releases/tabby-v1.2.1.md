A message goes away at once when you press anything, and PLAY / STOP stays readable while it is up. A muted internal sound no longer loads the sound engine. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.2.1: a message goes when you press anything

- Firmware package build ID: `9e858b3b5fa9f1b1` (first 16 hex digits). App image 488676 bytes (measured), margin 30781 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 52). From tabby-v1.2 (`fef558ab16e275b4`): +128 bytes. At least
  15360 bytes stay free for fixes. Free RAM 143180 bytes.
- Installing over tabby-v04.2 to tabby-v1.2 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow, with the per-page timing check and the comparison of the device's own
  screen pixels, as candidate 3. Candidate 1 was held back: the pixel comparison again found a row of the page
  before left on HOME (fixed, below). Candidate 2 has that fixed, was installed and tested, and made the device's
  screen pictures; its first run stopped because this computer could not load the candidate's page for a moment
  (the device was never at fault), and was run again. Candidate 3 is the same firmware with those pictures in the
  manual, tested in full, and promoted. docs/BUILD.md 66.5 and 66.6.

## What changed

- **Any press takes a message away at once**: a button, a pad, a key of the keyboard, a knob. Untouched it stays
  about a second and a half, as before. (Buttons and knobs did this already; pads and keys did not.)
- **PLAY / STOP / REC stays readable while a message is up**: the word stands at the left end of the message, in
  its own colour on black. The first line of a message therefore holds 9 characters and the others 13; thirteen
  messages were reworded to fit in three lines (FADER 1-4 / MOVE TO MATCH, PARA + K1 / MOVES A SCENE, > AGAIN /
  DELETES THE CLIP ...). Help and the guide quote the new words.
- **A band of the page before no longer stays on the screen.** Seen again in the device's own pixels, on HOME
  after a page change while a song plays: the fix in tabby-v1.2 was not enough. The painter is called just before
  a note is due, so a band that takes long to paint (a title row) found a note due every time, while the short
  bands of the level meters went through. Each band now has its own limit: after a quarter of a second it is
  painted whatever is due.
- **An internal sound that cannot be heard is not played.** A track muted on the mixer (blue, INT), or silenced
  by another track's solo, no longer starts its song notes on the SMK-37's sound engine. Until now the engine
  rendered such a track in full and threw the result away. A song whose parts go to outside gear only now costs
  the engine nothing. Unmuted, the track sounds from its next note. MIDI out is not touched by any of this.

## Why CPU! is on for the whole Wrong Room song (your question)

- **Which parts trip it:** track 1 (the DX7 piano), track 3 (the PSG) and track 8 (the 808 kit) together. Take any
  one of the three away and the guard does not act once in 16 seconds; take away track 2, 4, 5, 6 or 7 and it
  still acts once a second.
- **What it acts on:** not a shortage. A block of sound took 0.6 to 1.0 ms to make, of the 2.9 ms it may take;
  the largest ever seen is 1.29 ms. The guard, which is inside the SDK's sound library (not ours to change), acts
  when a block comes in somewhere between 1.16 and 1.29 ms, under half of what is allowed.
- **What it changes:** it lowers the number of voices the engine may sound at once from 62 to 59. No audio block
  was late or lost (0 underruns, 0 DMA overruns, 0 overloads in every run), and nothing changes on MIDI out (every
  soak: all notes on both cables, on time). The Wrong Room song plays eight parts of one note each, so three
  voices fewer of 62 take nothing from it. NOT MEASURED: the audio itself, voice by voice.
- **Was it counting load that is not real?** In your project as it is: no. The three parts that trip it are parts
  whose internal sound is on. But a muted sound was counted in full: with every internal sound muted on the mixer
  the guard acted exactly as often and a block took as long. That is the cause fixed above; the release run now
  measures it (step guard).

## Validation

VALIDATION
