A screen you can read at arm's length on a dark stage: nothing smaller than 10 x 14 pixels a character, stage information larger still, fewer things on a page. No new function; songs, projects and timing as on tabby-v1.0.2. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v1.1: the readable screen

- Firmware package build ID: `f0bd5047ca742907` (first 16 hex digits). App image 486724 bytes (measured), margin 32733 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 50). From tabby-v1.0.2 (`9b00a12fd0346a65`): 4032 bytes smaller
  (shorter texts; the font is the same one, drawn larger, so it costs nothing). At least 15360 bytes stay free for
  fixes. Free RAM 143436 bytes (1024 more).
- Installing over tabby-v04.2 to tabby-v1.0.2 keeps storage as it is. Take a Full backup first anyway.
- **Going back to older firmware:** songs saved on tabby-v04.10 or later cannot be read by older firmware. Go back to
  an older build only with a Full backup made before tabby-v04.10: install the older build, then restore that backup.
  A clip is refused (its track is silent) by firmware that does not know one of its settings: TRANSPOSE before
  tabby-v04.15, SHUFFLE and PLAY QUANTIZE before tabby-v04.17, STEP SIZE before tabby-v04.19, DIRECTION before
  tabby-v04.20. A song with EVENT LEAD set plays on older firmware, without the lead.
- Released through the candidate flow: published as builds/tabby-v1.1-rcN/, installed and tested on the device
  (every device test, the timing runs on eight page and song combinations, both soaks, full backup, restore, verify)
  before it reached the main page.

## What changed: the screen, and only the screen

Up to tabby-v1.0.2 almost all text was the 5x7 font at scale 1 (5 x 7 pixels a character, about 3 point). Now:

- **Nothing is smaller than scale 2** (10 x 14 pixels, 20 characters on a line).
- **Scale 3** (15 x 21 pixels, 13 on a line) for what you need while playing: the tempo, PLAY / STOP / REC, the
  selected track, the song and the scene, what comes next, queued launches, and every message and warning.
- The font is still the 5x7 one, enlarged: its strokes are 2 and 3 pixels thick, which reads better in the dark
  than a finer 8x16 font with 1-pixel strokes would, and it costs no flash. No lowercase.
- The layouts are in docs/CONTROL-MAP.md section 20, page by page; the manual has a picture of every page, made
  from the simulator (the firmware's own screen code).

| Page | What it shows now |
| --- | --- |
| Top line (every page) | `120 PLAY T1`, large: tempo; PLAY, STOP, PAUS, REC (red), ARMD, CNT4 (count-in), LOST; the selected track in its colour. Small: ARP; `K8=0` while the master volume is at zero; in amber `*SNG` / `*PRJ` / `*S+P` for what waits for a save. It follows the song (before, it said STOP while a song played). Gone: the pattern step counter, LIVE. |
| Messages | An amber box across the bottom, black letters at scale 3, one to three lines; a question on ACTIONS stays until answered. The messages you meet while playing were shortened to two lines (TO SCENES AT CYCLE, EMPTY PAD / REC OR PARA, TRACK MUTED / SOUND + MIDI, RESERVED FOR SEQ PLAY ...). |
| KNOB BANK held | The shortcut list at scale 2 on a grey box; a shortcut's message as the amber box over it. |
| HOME | Eight rows: the track number at scale 3 (filled box: selected), K / P where the keys and the pads play, the sound, MUTE / INT / SOLO / LIVE / OFF, the level and a meter. Gone: the pattern step cells, the knob strip (K1 moves the row's level, K4 the tempo in the top line), the pad pressure figure, the standing explanations (the row shows the state). |
| CLIPS | `S01 SCENE 002` at scale 3. A cell per track in two rows of four: the clip it plays at scale 3 (white from the scene, green launched, `--` silent; amber / blue when muted) and under it at scale 3 what is queued (`>05`, `>ST`, `>SC`), where a chain leads (`+05`, `+ST`), or `MUT` / `INT`. The 16 pads of the bank in two rows of eight like the pads, with the clip numbers. Gone: SELECTED / STEPS / BLK, the help lines. |
| SCENES | `SONG 01`, `SCENE 001/002` and what comes next (`NEXT 002`, `TO 002` queued, `AT 003` reserved, LOOPING, LAST SCENE; errors in amber) at scale 3. The pass and bar, the scene's clip per track, the 16 scenes of the pad bank in two rows of eight, and K1 to K4 as TIME / THEN / HOLD / JUMP. Gone: block numbers, the LEN line, EVENTS, the help lines. |
| STEP | `STEP CLIP 02` at scale 3; the bar's 16 steps in two rows of eight with their note counts; the step's notes by name on one line; the chosen note's NOTE / VEL / STRT / LEN over K1 to K4 (before: a six-line table at scale 1). |
| CLIP SETTING | Eight lines a page at scale 2, **four pages instead of three** (1/4 and 2/4 the clip, 3/4 and 4/4 the song). Shorter: PLAY QUANT, CLICK CH, K1 CC to K4 CC; values 016, 016 ST, 03 EMPTY / 03 USED, REC ONLY, MIDI, FWD+REV, `1/8=032`. |
| SYNC / MIDI, MIDI TRACK, PARA, FX, ARP | One line per knob: K1 to K4 with the full name at scale 2 and the value at scale 3 (before: a strip of four small boxes and a list of what the knobs do). |
| MIX | Mute and solo in two rows of eight like the pads, eight level bars, K1 to K4. |
| ACTIONS, SOURCE, PRESETS, SAVE PROJECT, start screen | Scale 2 lists; names, slot numbers, results and errors at scale 3. ACTIONS shows `FREE 317K RECL 0K` and `USER 471040 READY`. |

- The workbench's simulator draws the same pages (it runs the same code), and its click areas moved with them.
- Timing: the drawing is sliced as before (bands of 16 rows, a band waits for a due MIDI event). Measured below.

## Validation

The device run's results are added here after the promotion.
