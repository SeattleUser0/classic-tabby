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

Candidate 3 (builds/tabby-v1.2.1-rc3/) on the device, unattended, before the promotion. The test computer was kept
awake while it measured. "Own" is the device's own figure: the latest a timed event left after its due time. The DIN
figure is the band without each line's first note at SEQ PLAY, which stands behind MIDI Start and Song Position on
the cable and is given beside it.

- **The device's pixels: 46 of 46 pictures identical to the simulator's**, 24 at rest and 22 while the song played;
  among them a message with PLAY or STOP at its left end, and the page half a second after a key: no message.
- **The CPU guard**, Wrong Room song: as it is 0.00 actions a second, a block of sound 0.63 ms of 2.90, 62 voices
  (tabby-v1.2: 1.06 a second, 0.86 ms, 59 voices). Every internal sound muted: 0.00 a second, 0.10 ms.

| One line, 960 notes | DIN ms | first note | USB ms | own ms |
| --- | ---: | ---: | ---: | ---: |
| Overview (three runs) | 1.71, 1.67, 1.67 | +1.12, +1.36, +1.41 | 1.71, 1.71, 1.68 | 1.55, 1.51, 1.44 |
| CLIPS | 1.65 | | 1.66 | 1.51 |
| SCENES | 1.71 | | 1.81 | 1.47 |
| SYNC / MIDI | 1.63 | | 1.64 | 1.46 |
| ACTIONS | 1.67 | | 1.64 | 3.50 |
| Mixer | 1.63 | | 1.69 | 1.49 |

- **One line stays under 2 ms on every page.** Eight lines: 2.57 to 2.88 ms on DIN, about 1.9 on USB. On ACTIONS the
  device's own figure is 3 to 4 ms as in every version (reported, not judged).
- **Soak with EVENT LEAD OFF**, 40 minutes, 19 segments on six pages, none bad: every scene entry sent its events; USB
  band 1.30 to 2.33 ms; on the one DIN cable 14.70 to 15.13 ms, as before.
- **Soak with EVENT LEAD 1/16**, 40 minutes, 19 segments, none bad: DIN band 1.57 to 1.84 ms, USB 1.31 to 1.64 ms.
- CLIP SETTING 40 of 40, take edit 26 of 26, note repeat and step loop 20 of 20, program and knobs 10 of 10, clip
  chains 11 of 11, scene chain 13 of 13, scene edit 16 of 16, recording 25 of 25, STEP page 18 of 18, CLIPS page 40
  of 40 twice, the timing song 960 of 960 notes (worst 1.16 ms).
- Full backup, restore of that backup, verify: PASS (41 items). The panel was left as it was found; no command went
  unanswered; the only thing a test left was the CLIPS page after the screen tour (put back).
- Still not looked at by a person: the glass itself (test T97 of the guide).
