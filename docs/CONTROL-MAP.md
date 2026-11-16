# Classic Tabby control map: clips and scenes on the SMK-37

Version: 0.3 (2026-11-16). Applies from tabby-v04.8 (section 12, the STEP page). v0.2 was for tabby-v04.7.1, v0.1 for tabby-v04.7.

This is the complete control map for the clip workflow: what every button, pad, knob and fader does on the
two pages you play a song from, CLIPS and SCENES, and on the STEP page, where you edit a clip. Control names are the ones in SPEC.md 17.4: knobs K1 to K8
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
| EDIT | Opens the STEP page on the selected clip of the track (section 12). | same |
| 4th left button, ARP, FX, SEQ, PAD / STEP | As on every page (SPEC.md); they leave CLIPS. | |

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

Recording from the keys and from MIDI in (the next release), changing a clip's length, copying clips between
places, and storing a scene from what plays now. New songs still come from the web workbench (the MIDI importer
or the song editor); the STEP page changes the clips of a song that is on the device.

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
| Step input: where and what | 16 step buttons choose the step, the pads in Note mode enter the notes (RM p. 27). | The 16 pads choose the step, the 37 keys enter the notes. | The SMK-37 has no step buttons, and it has a keyboard. |
| Ending step selection | The selected step button again, or [EXIT]. | The selected pad again. | No EXIT button. |
| Drum tracks (TR-REC) | Choose a pad, then the step buttons toggle it (RM p. 29). | PADS TOGGLE: play a key (or turn K5) for the note, then the pads toggle it. SCL switches the two ways on any track. | Outside drum machines are driven from tracks that are not drum tracks inside the SMK-37, so the choice cannot follow the track type alone. |
| Step edit screen | [SHIFT] + step button; C1 note, C2 velocity, C3 start, C4 length (RM p. 28). | Selecting a step shows its notes at once; K1 chooses the note, K2 velocity, K3 start, K4 length. | One press less; K1 chooses among the notes instead of changing the pitch (replace a pitch with two keys). |
| Deleting a step's notes | [CLEAR] + the step button. | ENV with the step selected. | No CLEAR button. |
| Tie / long note | Hold a pad and press [REST/TIE]. | K4 sets the length. | No TIE button. |
| Undo | 10 levels; cleared when the clip or track changes (UM, Ver. 1.80). | 4 levels; cleared when another clip is opened (SPEC 14.1, decision 8). | Memory: each level is a copy of the clip. |
| Saving | The project lives in memory until you save it. | A clip saves by itself ten seconds after the song stops, or with the 4th left button; never while playing. | Flash writes stop the MIDI out for a moment, so they wait for the stop; saving by itself protects against a forgotten save. |
| Hearing an edit | At once. | A launched clip from its next loop; a track following the scenes from its next scene. | The player reads a prepared copy of the clip; it is swapped only where a loop begins. |
| Clip length (STEP LEN), SCALE, sub steps, motion | On the device. | Not on the device yet. | Later releases. |
| Unsaved clips | Any number. | One at a time. | Memory. |

## 12. STEP page: editing a clip

EDIT on the CLIPS page opens it on the track's selected clip (bright pad; hold a pad half a second to select
without launching), or on the clip the track plays when none is selected. The screen shows the track and clip,
SAVED or UNSAVED, the number of events (512 at most), the bar of 16 steps that is on the pads, and the notes of the
selected step with their velocity, start and length.

As on the MC-707, the step buttons choose where and the keyboard chooses what: there the 16 step buttons and the
pads in Note mode, here the 16 pads and the 37 keys.

### 12.1 Pads and keys

| Action | Result |
| --- | --- |
| Pad (PADS SELECT A STEP) | Selects the step; its notes are listed. The same pad again deselects it. |
| A key, with a step selected | Enters that note on the step, with the velocity you played, one step long. The same key again removes it. Several keys make a chord. The key sounds as always. |
| A key, with no step selected | Sounds, and becomes the current note (NOTE on the screen). |
| SCL | Switches what a pad does: PADS SELECT A STEP, or PADS TOGGLE (the note). The page opens in TOGGLE on a drum track. |
| Pad (PADS TOGGLE) | Puts the current note on that step, or takes it off, and selects the step. One press per drum hit. |
| A pad past the clip's end | Nothing. Screen: PAST THE CLIP'S END. |
| SHIFT + pad 1 to 8 / 9 to 16 | Select track / mute, as everywhere. Selecting another track does not change the clip being edited. |

### 12.2 Pad colours

| Colour | Meaning |
| --- | --- |
| Off | An empty step, or past the clip's end. |
| Dim white | An empty step on a beat (steps 1, 5, 9, 13 of the bar). |
| Green | The step holds notes. |
| Amber | The step holds the current note. |
| Cyan (bright when the step holds notes) | The selected step. |
| White | The step that plays now. |

### 12.3 Knobs

| Knob | Turn |
| --- | --- |
| K1 | Chooses the note of the selected step that K2 to K4 change (the > on the screen). |
| K2 | Velocity, 1 to 127. |
| K3 | Start: earlier or later than the grid line, in steps of 10 units (480 units = one step), up to half a step each way. |
| K4 | Length, in steps of 60 units (an eighth of a step). |
| K5 | The current note, a semitone per click (for PADS TOGGLE without touching the keys). |
| K6 | The bar on the pads (same as OCT - / OCT +). |
| K7 | The selected step's probability: ALWAYS, or 1 to 7 (as stored in the song). |
| K8 | Master volume. |

### 12.4 Buttons

| Button | Press | With SHIFT |
| --- | --- | --- |
| OCT - / OCT + | Previous / next bar of 16 steps. | same |
| ENV | Clears the selected step. | Discards every unsaved change of the clip and returns to CLIPS. |
| FX | Undo, four levels. | Redo. |
| 4th left button | Saves the clip into the song (only while the song is stopped; otherwise STOP TO SAVE). | same |
| PLAY | Starts and stops the song. | same |
| EDIT | Back to CLIPS. The clip stays open and unsaved changes are kept. | same |
| BT | To CLIPS. | same |
| HOME | To the overview. Unsaved changes are kept. | SRC: the source page. |

### 12.5 Hearing and saving

- Nothing is written to flash while a song plays (the rule of every page). An edit lives in memory, marked
  UNSAVED, until it is saved: with the 4th left button while stopped, or by itself ten seconds after the last
  change once the song is stopped (the screen says CLIP SAVED), or when you choose another song.
- An unsaved edit is what the song plays. A clip that is launched on its track (CLIPS: press its pad) plays each
  change from its next loop. A track that follows the scenes plays the changed clip the next time a scene brings it.
- One clip can be unsaved at a time. EDIT on another clip while one is unsaved opens the unsaved one and says so:
  save it (stop, 4th left button) or discard it (SHIFT + ENV).
- Unsaved changes are lost when the power goes off.
- A clip holds 512 events. The 513th is refused: CLIP FULL, and nothing changes.
- A clip that two tracks share (two tracks with the very same notes in an imported song) cannot be edited on the
  device: CLIP SHARED BY ANOTHER TRACK.
- A saved clip is stored in the new clip format (v3). It plays the same.

### 12.6 Messages

| Message | Reason |
| --- | --- |
| HOLD A PAD TO SELECT A CLIP FIRST | EDIT on CLIPS with no clip selected and none playing on the track. |
| ANOTHER CLIP IS UNSAVED: THIS ONE | EDIT while another clip has unsaved changes; the page shows that clip. |
| CLIP SHARED BY ANOTHER TRACK | The clip's block is used by another track too. |
| NOTE ENTERED / NOTE REMOVED | A key changed the selected step. |
| NOTE ON THE STEP / NOTE OFF THE STEP | A pad changed its step (PADS TOGGLE). |
| CLIP FULL | The clip holds 512 events. |
| SELECT A STEP FIRST / STEP IS EMPTY / STEP CLEARED | ENV. |
| UNDO / REDO / NOTHING TO UNDO / NOTHING TO REDO | FX, SHIFT + FX. |
| STOP TO SAVE / CLIP SAVED / NOTHING TO SAVE / SONG STORAGE FULL | The 4th left button. |
| EDITS DISCARDED | SHIFT + ENV. |
| PAST THE CLIP'S END | A pad beyond the clip's last step. |
