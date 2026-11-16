# Classic Tabby control map: clips and scenes on the SMK-37

Version: 0.2 (2026-11-16). Applies from tabby-v04.7.1. v0.1 (2026-11-14) was for tabby-v04.7.

This is the complete control map for the clip workflow: what every button, pad, knob and fader does on the
two pages you play a song from, CLIPS and SCENES. Control names are the ones in SPEC.md 17.4: knobs K1 to K8
from the left, buttons by their printed label, and "4th left button" for the one whose label is not confirmed.

The model is the Roland MC-707's: a song has eight tracks, each track has clips, a scene is one clip per track,
and everything you launch waits for the next master cycle so it always lands in time.

## 1. Words

| Word | Meaning |
| --- | --- |
| Clip | One pattern of one track, 1 to 8 bars. A track holds up to 64, shown 16 at a time (4 banks). |
| Scene | One row of the song: one clip (or nothing) for each of the 8 tracks. Up to 128, shown 16 at a time (8 banks). |
| Master cycle | The launch grid, set per song (1 bar unless the song says otherwise). Launches, stops and "back to scenes" land on its next boundary. |
| Following | A track that plays whatever the current scene gives it. Every track follows after PLAY. |
| Launched | A track that loops a clip you chose by hand. It ignores scene changes made by the song running on, until you send it back. |
| Stopped | A track you silenced by hand. It stays silent until you launch a clip on it or send it back. |

## 2. Getting there (any page)

| Press | Result |
| --- | --- |
| BT | Opens CLIPS. Press BT again to return to the page you came from (the overview, SYNC / MIDI, the mixer or SCENES; from any other page, the overview). |
| SCL (on CLIPS or SCENES) | Switches between CLIPS and SCENES. |
| HOME | Leaves to the overview. The song keeps playing. |
| SEQ + EDIT, then SONG MODE | The older way into SCENES (the SONG page); still works. |

The Bluetooth notice that BT used to show is gone; Bluetooth is set in the web workbench.

## 3. Stage actions

| I want to | Press | Presses |
| --- | --- | ---: |
| Start or stop the song | PLAY | 1 |
| Launch a clip on the selected track | its pad (CLIPS) | 1 |
| Stop the selected track | the pad of its playing clip (CLIPS) | 1 |
| Take back a launch or stop that has not landed yet | the blinking pad again | 1 |
| Recall a scene | its pad (SCENES) | 1 |
| Choose another track | SHIFT + pad 1 to 8, or turn K5 | 2 |
| Mute or unmute a track | SHIFT + pad 9 to 16 (tracks 1 to 8) | 2 |
| Send the selected track back to the scenes | ENV | 1 |
| Send every track back to the scenes | SHIFT + ENV | 2 |
| Next or previous 16 clips or scenes | OCT + / OCT - | 1 |
| Stop everything at once | HOME + PLAY | 2 |

From any other page add one press: BT first.

## 4. CLIPS page

The screen shows the selected track, the bar count, one column per track (the clip it plays, and what is
queued for it), the 16 clips of the pad bank, and the selected clip's length.

### 4.1 Pads

| Action | Result |
| --- | --- |
| Short press, clip not playing | Queues the clip for the selected track; it starts at the next master cycle. The clip becomes the selected clip. |
| Short press, the playing clip | Queues a stop for the track at the next master cycle. |
| Short press, a blinking (queued) pad | Takes the queued launch or stop back. |
| Long press (half a second) | Selects the clip without launching it: the launch or stop the press queued is taken back if it has not landed. |
| Press an empty pad | Nothing is queued. Screen: NO CLIP ON THIS PAD. |
| Press while the song is stopped | Reserves the clip: the pad blinks, the screen says RESERVED - PLAY STARTS IT. PLAY then starts the song with that track on the reserved clip; tracks with nothing reserved follow scene 1. Press the blinking pad again to take the reservation back. (With CLOCK = MIDI a reservation is not used: the song starts on its scenes.) |
| SHIFT + pad 1 to 8 | Selects track 1 to 8. |
| SHIFT + pad 9 to 16 | Mutes or unmutes track 1 to 8. |

### 4.2 Pad colours

| Colour | Meaning |
| --- | --- |
| Off | Empty: no clip in this place. |
| Dim white | Stopped: a clip that is not playing. |
| Green | Playing. |
| Blinking green | Queued: starts at the next master cycle. |
| Blinking red | The playing clip, with a stop queued. |
| Bright white | Selected and not playing. A selected clip that plays is bright green. |
| Orange (dim: not playing, bright: playing) | The track is muted altogether: its sound and its song notes on MIDI out. Queued pads still blink. |
| Blue (dim: not playing, bright: playing) | Only the track's internal sound is muted (a mixer mute). The song still plays it on MIDI out. |

Blinking follows the song: on for an eighth note, off for an eighth note. While the song is stopped it blinks
four times a second.

With SHIFT held the pads show tracks instead: pads 1 to 8 in the track colours (bright: playing, dim: silent,
blinking: something queued, brightest: the selected track), pads 9 to 16 the mutes (orange: muted altogether,
blue: internal sound only, dim green: not muted).

### 4.3 Buttons

| Button | Short press | With SHIFT |
| --- | --- | --- |
| PLAY | Starts the song at scene 1; stops it. | same |
| OCT - / OCT + | Previous / next bank of 16 clips (4 banks). | same |
| SCL | To the SCENES page. | same |
| ENV | Selected track back to the scenes at the next master cycle. | Every track back. |
| BT | Back to the page you came from. | same |
| HOME | To the overview. | SRC: the source page. |
| FADER BANK | Faders work tracks 1 to 4 / 5 to 8. | same |
| MIX | The mixer page (levels, mute, solo); MIX again returns. | same |
| REC | Not used yet. Screen: NO REC IN THIS VERSION. | same |
| 4th left button, ARP, EDIT, FX, SEQ, PAD / STEP | As on every page (SPEC.md); they leave CLIPS. | |

No button on these two pages has a long-press action. The only long press is a pad on CLIPS (4.1).

### 4.4 Knobs

| Knob | Turn |
| --- | --- |
| K5 | Selects the track. |
| K6 | Selects the clip bank (same as OCT - / OCT +). |
| K8 | Master volume, as everywhere. |
| K1 to K4, K7 | Nothing on this page. |

## 5. SCENES page

The screen shows the song, the current scene and its repeat count, the bar, what comes next, and the clip
each track plays in the scene.

| Control | Result |
| --- | --- |
| Pad 1 to 16 | Recalls that scene of the bank. Every track goes back to following and plays the scene's clips. It lands by the jump mode. |
| K4 | Jump mode: NEXT CYCLE (the next master cycle) or SCENE END (when the current scene has played out). |
| OCT - / OCT + | Previous / next bank of 16 scenes (8 banks). |
| K5 or K7 | Selects the song (only while stopped). |
| PLAY | Starts the song at scene 1; stops it. |
| SCL | To the CLIPS page. |
| ENV / SHIFT + ENV | Selected track / every track back to the scenes. |
| SHIFT + pad 1 to 8, SHIFT + pad 9 to 16 | Select track, mute track, as on CLIPS. |

Pad colours: off = no such scene, dim white = a scene, green = the scene that plays, blinking green = the
scene that is queued.

## 6. Faders

The four faders set track levels: tracks 1 to 4, or 5 to 8 after FADER BANK. After a bank change, or when a
level was changed from elsewhere, a fader does nothing until you move it through the track's current level
(pickup); the screen shows the fader's value and the level it has to cross. A fader sends controller 7 on the
track's MIDI channel when LIVE OUT is on, and sets the internal level when the track's fader setting is on.

## 7. Mute

There are two mutes, and they look different everywhere.

| | Muted altogether | Internal sound only |
| --- | --- | --- |
| Set with | SHIFT + pad 9 to 16 (tracks 1 to 8), on any page | The MIX page; also how tracks 6 and 7 of a new project start |
| Silences | The SMK-37's own sound of the track and its song notes on MIDI out | The SMK-37's own sound only; the song still plays the track on MIDI out |
| Pads on CLIPS | Orange | Blue |
| SHIFT held, pads 9 to 16 | Orange | Blue |
| CLIPS screen | MUTED ALL in amber; the track's clip number in amber | MUTED INT in blue; the track's clip number in blue |
| Overview | M-ALL | M-INT |
| Screen when set | TRACK MUTED: SOUND AND MIDI | (the MIX page shows it) |

- While a track is muted altogether its clip keeps running, so unmuting brings it back in time. Notes already
  sounding end at their normal length. Controller and program events of a clip are still sent.
- SHIFT + pad on a track that is not muted mutes it altogether. SHIFT + pad on a muted track, of either kind,
  unmutes it. So a blue track takes two presses to turn orange.
- Unmuting a track on the MIX page unmutes it altogether.
- A track whose source is OFF has no internal sound; SHIFT + pad mutes its song notes (MIDI TRACK MUTED).

## 8. Transport and clock

| Situation | Behaviour |
| --- | --- |
| PLAY, song stopped | The song starts at scene 1; every track follows, except tracks with a reserved clip (4.1), which start on that clip. |
| PLAY, song playing | The song stops; every note is released. Launches and stops are forgotten. |
| CLOCK = MIDI | The song waits for the master's Start and follows its clock. PLAY arms and disarms. Launching works the same; the master cycle is counted from the master's Start. |
| End of the song with launched tracks | The launched tracks keep looping; the screen says SONG OVER. A scene recall or PLAY ends it. |

## 9. What the screen says when something cannot be done

| Message | Reason |
| --- | --- |
| RESERVED - PLAY STARTS IT | A clip pad was pressed while the song is stopped (information). |
| NO CLIP ON THIS PAD | The place is empty. |
| NO SUCH SCENE / NOT PLAYING | The scene pad has no scene, or the song is stopped. |
| NOT PLAYING | ENV was pressed while the song is stopped. |
| TRACK TO SCENES AT CYCLE / ALL TRACKS TO SCENES AT CYCLE | ENV / SHIFT + ENV was taken (information). |
| LAUNCH AT NEXT CYCLE / STOP AT NEXT CYCLE | The queue was taken (information, not an error). |
| TAKEN BACK | A queued launch or stop, or a reservation, was withdrawn. |
| SELECTED ONLY - TAKEN BACK | A pad was held for half a second: its clip is selected, its launch or stop withdrawn. |
| NO SONG - UPLOAD FROM WORKBENCH | PLAY with an empty song slot. |
| SONG STORAGE BUSY | PLAY while the storage is being scanned or compacted. |
| BLOCK READ ERROR / TOO MANY BLOCKS | A clip could not be read; the track plays silent. |
| ROW DECODE LATE | A clip was not ready at its boundary; it starts as soon as it is (counted as late). |

A message stays for one and a half seconds on the line above the key hints.

## 10. Not on the panel yet

Editing clips (steps on the pads, recording from the keys), copying clips between places, and storing a
scene from what plays now. Songs, clips and scenes come from the web workbench (the MIDI importer or the
song editor).

## 11. Differences from the MC-707

Checked against Roland's MC-707 Reference Manual (eng02) and the MC-707 Update manual (eng09, up to version 1.80).
"RM" and "UM" are those two; page numbers are the printed ones. This list is kept current: a deliberate difference
is added here in the same change that makes it.

Where the two agree:

- A clip pad pressed while the sequencer is stopped reserves the clip, and START / PLAY starts it (RM p. 12:
  "Reserves playback for the clip. If the sequencer is playing, playback starts when the master clock points to
  12 o'clock. Use the [START/STOP] button to play/stop.").
- Clip mode plays and stops clips from the pads (RM p. 21: "This mode lets you use the pads to play/stop clips").
  Pressing the playing clip's pad stops the track here. The manual does not say in so many words which press
  stops; this is how the MC-707 behaves and it is the reading taken. (My report of 2026-11-14 said the MC-707
  restarts the clip. That was wrong; neither manual says so.)
- Clip changes, starts and stops happen on the master clock (RM p. 51).
- Sixteen clips of the current track on the pads is the MC-707's SINGLE view (UM, "Display Method Added for Clip
  Mode").
- Muting a track with pads 9 to 16 (RM p. 21, Mute mode).

Deliberate differences:

| What | MC-707 | Classic Tabby | Why |
| --- | --- | --- | --- |
| Tracks follow the song | No song: every track plays the clip you chose until you choose another. | A track follows the scenes until you launch a clip on it, and ENV sends it back. | The songs come from MIDI files as scenes that play through by themselves; hands are free for the keys. |
| Clips per track | 16. | 64 in four banks of 16. | Imported songs often have more than 16 different parts per track (SPEC 14.1 decision 4). |
| A blinking pad pressed again | Not described in either manual. | Takes the queued launch, stop or reservation back. | A wrong press before the bar line must be undoable without a second wrong sound. |
| Long press on a clip pad | No function. | Selects the clip without launching it. | The SMK-37 has no cursor buttons to select a clip for editing. |
| Selecting a track | [SEL] buttons, one per track. | SHIFT + pad 1 to 8, or K5. | No per-track buttons on the SMK-37. |
| Track play / stop pads | Mute mode: pads 1 to 8 start and stop tracks. | Press the playing clip to stop a track; ENV to bring it back. Pads 1 to 8 under SHIFT select tracks instead. | The pads are needed for track selection. |
| Mute | One mute per track. | Two: altogether (orange) and internal sound only (blue). | The SMK-37 both makes sound and drives outside gear; a mixer mute must not silence the outside gear of existing songs. |
| Mute pads | Mute mode: pads 9 to 16, no SHIFT. | SHIFT + pad 9 to 16, on every page. | No separate pad-mode buttons; SHIFT keeps one gesture for all pages. |
| Scenes | SCENE buttons: press recalls; long press stores the playing combination; eight scenes (RM p. 35). | Pads on the SONG page: press recalls; 128 scenes in banks of 16. Nothing is stored from the panel yet. | Storing writes the song; panel editing of songs comes with clip editing (section 10). |
| Scene recall timing | On the master clock. | On the master clock, or at the end of the scene that plays (K4). | The older "row end" jump of songs made before scenes is kept. |
| Master clock length | SCALE and STEP LENGTH of the project (RM p. 51). | A number of steps stored in the song (16 unless the song says otherwise); set in the workbench. | One number per song is enough and an imported 3/4 song sets it by itself. |
| Pad colours | Chosen per project (RM, project settings). | Fixed. | No settings page for it; fixed colours can be learnt once. |
| START with CLOCK = MIDI | START/STOP still starts locally. | PLAY arms the song and the master's Start runs it; reservations are not used. | The song must stay in step with the master's position (SPEC 19.3). |
| [SHIFT] + START: back to the beginning | Yes (RM, shortcut list). | No. PLAY twice does it. | SHIFT + PLAY is not wired on the panel yet. |

