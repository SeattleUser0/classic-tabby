# Classic Tabby control map: clips and scenes on the SMK-37

Version: 0.12 (2026-11-17). Applies from tabby-v04.17 (section 14: SHUFFLE, PLAY QUANTIZE, three pages). v0.11 was for tabby-v04.16 (section 5: a scene deleted and moved; 13.2: a stop takes an armed take off). v0.10 was for tabby-v04.15 (section 14: TRANSPOSE and DELETE CLIP). v0.9 was for tabby-v04.14 (section 14: CLIP SETTING has two pages; CLICK LEVEL; the controller numbers of K1 to K4 are the song's). v0.8 was for tabby-v04.13 (section 19: a clip's program and bank, the controller knobs). v0.7 was for tabby-v04.12 (section 18, the scene chain); v0.6 was for tabby-v04.11 (section 17, clip chains); v0.5 was for tabby-v04.10 (sections 14 to 16: CLIP SETTING, click and count-in, clip lengths; new clips; stored scenes). v0.4 was for tabby-v04.9 (section 13, recording); v0.3 was for tabby-v04.8 (section 12, the STEP page); v0.2 was for tabby-v04.7.1, v0.1 for tabby-v04.7.

This is the complete control map for the clip workflow: what every button, pad, knob and fader does on the
two pages you play a song from, CLIPS and SCENES, on the STEP page, where you edit a clip, and when you record. Control names are the ones in SPEC.md 17.4: knobs K1 to K8
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
| Press an empty pad | The pad is selected (dim cyan) and nothing is queued. Screen: EMPTY PAD - REC OR EDIT MAKES A CLIP. REC then records a new clip there (section 13), EDIT opens a new empty clip on the STEP page. |
| Press while the song is stopped | Reserves the clip: the pad blinks, the screen says RESERVED - PLAY STARTS IT. PLAY then starts the song with that track on the reserved clip; tracks with nothing reserved follow scene 1. Press the blinking pad again to take the reservation back. (With CLOCK = MIDI a reservation is not used: the song starts on its scenes.) |
| SHIFT + pad 1 to 8 | Selects track 1 to 8. |
| SHIFT + pad 9 to 16 | Mutes or unmutes track 1 to 8. |

### 4.2 Pad colours

| Colour | Meaning |
| --- | --- |
| Off | Empty: no clip in this place. |
| Dim cyan | An empty pad that is selected: REC or EDIT makes a clip there. |
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
| REC | Starts a take into the track's selected clip, or stops it (section 13). | Input quantize on / off. |
| EDIT | Opens the STEP page on the selected clip of the track (section 12); on a selected empty pad, on a new clip. | same |
| FX | Opens CLIP SETTING on the selected clip (section 14). | same |
| 4th left button | Saves the song: the unsaved clip and what was changed in the song (stopped only; STOP TO SAVE otherwise). | same |
| ARP, SEQ, PAD / STEP | As on every page (SPEC.md); they leave CLIPS. | |

No button on these two pages has a long-press action. The only long press is a pad on CLIPS (4.1).

### 4.4 Knobs

| Knob | Turn |
| --- | --- |
| K5 | Selects the track. |
| K6 | Selects the clip bank (same as OCT - / OCT +). |
| K8 | Master volume, as everywhere. |
| K1 to K4 | Send controllers 74, 71, 1 and 11 on the selected track (section 19). A take records them. |
| K7 | Nothing on this page. |

## 5. SCENES page

The screen shows the song, the current scene and its repeat count, the bar, what comes next, and the clip
each track plays in the scene.

| Control | Result |
| --- | --- |
| Pad 1 to 16 | Recalls that scene of the bank. Every track goes back to following and plays the scene's clips. It lands by the jump mode. |
| An empty pad held half a second, while the song plays | Stores what plays now as a new scene after the last one (STORED AS A NEW SCENE): per track the clip it plays, nothing for a stopped track. The new scene repeats until another is recalled. A short press on an empty pad says HOLD TO STORE WHAT PLAYS AS A SCENE and stores nothing. A pad that holds a scene is never written over. |
| 4th left button | Saves the song (stopped only). |
| K1, K2, K3 | The scene chain (section 18): how many times the scene plays, what follows it, and the hold. |
| FX, twice within two seconds, song stopped (tabby-v04.16) | Deletes the selected scene: the one reserved (its pad blinks), else scene 1. The first press asks: FX AGAIN DELETES SCENE nnn. Then SCENE DELETED - SAVE THE SONG; the later scenes move one pad earlier, the scene's row events go with it, its clips stay. The last scene of a song stays (THE LAST SCENE STAYS). There is no undo: the change is saved with the song (the 4th left button, ten seconds after the change, or on leaving the song). |
| EDIT held + K1, song stopped (tabby-v04.16) | Moves the selected scene one pad earlier (left) or later (right): SCENE MOVED - SAVE THE SONG. Its row events and the song's loop scene move with it; it stays the selected scene. EDIT alone says HOLD EDIT, TURN K1: MOVE THE SCENE. |
| FX or EDIT while the song plays | STOP TO DELETE OR MOVE A SCENE. Nothing changes. |
| K4 | Jump mode: NEXT CYCLE (the next master cycle) or SCENE END (when the current scene has played out). |
| Pad while the song is stopped | Reserves the scene: it blinks, the screen says RESERVED - PLAY STARTS AT THIS SCENE, and PLAY starts the song there. The same pad again takes it back (PLAY starts at scene 1). |
| OCT - / OCT + | Previous / next bank of 16 scenes (8 banks). |
| K5 or K7 | Selects the song (only while stopped). |
| PLAY | Starts the song at scene 1; stops it. |
| SCL | To the CLIPS page. |
| ENV / SHIFT + ENV | Selected track / every track back to the scenes. |
| SHIFT + pad 1 to 8, SHIFT + pad 9 to 16 | Select track, mute track, as on CLIPS. |

Pad colours: off = no such scene, dim white = a scene, green = the scene that plays, blinking green = the
scene that is queued.

A clip that came from an imported song as a grid block has no length of its own: it plays as long as the first
imported scene that uses it. A delete or a move that would change that length is refused (NOT DELETED: SETS A
CLIP'S LENGTH, NOT MOVED: SETS A CLIP'S LENGTH). Changing the clip's LENGTH once on CLIP SETTING and saving stores
the clip with its own length; the scene is then free. Deleting or moving scenes drops a clip or scene reserved
while stopped. While stopped the bottom line of the page reads FX X2 DELETE  EDIT+K1 MOVE.

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
| PLAY, song stopped | The song starts at scene 1, or at the scene reserved on the SCENES page; every track follows, except tracks with a reserved clip (4.1), which start on that clip. |
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

A new song from nothing and SCALE (step sizes other than a
16th): next on the list in docs/MC707-PARITY.md section 0. New songs still come from the web workbench (the MIDI importer or the song editor).

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
| Scenes | SCENE buttons: press recalls; long press stores the playing combination; eight scenes (RM p. 35). | Pads on the SCENES page: press recalls; a long press on an empty pad stores the playing combination as a new scene; 128 scenes in banks of 16. | More scenes than buttons: imported songs are made of scenes. |
| Long press on a scene that exists | Writes it over with what plays (RM p. 35). | Recalls it, like a short press. Nothing is written over. | Unsafe on stage: a press held a little long would destroy a scene of the song. A new scene is always added at the end. |
| A stored scene's length | Scenes have no length: clips loop until you choose again. | The scene is as long as its longest clip and repeats until another scene is recalled; its clips keep their own lengths. | Scenes here are also the steps of a song that plays through; a stored one waits like an MC-707 scene. |
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
| Clip length (STEP LEN) | 1 to 128 steps, in the clip settings (RM, "STEP LEN 1-128"). | The same: LENGTH on CLIP SETTING, 1 to 128 steps. | Same. |
| Shortening a clip | Not described in either manual. | The notes past the new end are removed; undo (FX on the STEP page) brings them back. | The clip's event list holds only what plays; one undo level covers a slip of the knob. |
| SCALE, sub steps | On the device. | Not on the device. | Not planned yet. |
| Copying a clip | COPY and PASTE from the clip menu, onto any clip slot of the same track type (RM p. 15). | COPY TO PAD on CLIP SETTING, into an empty pad of the same track only. | No cursor buttons; writing over a clip is not offered because nothing on the panel brings a clip back. |
| Clips of different lengths | Each clip loops at its own length. | The same from tabby-v04.10. In scenes of an imported song an old-format (grid) block still plays the scene's length, as it always did. | Imported songs must sound as before. |
| REC while stopped | Recording is reserved; START begins it (RM p. 31: "If playback is stopped, press the [START/STOP] button"). | The same: REC arms, PLAY starts the song and the take. | Same. |
| What REC records into | A new clip in an empty place, or the selected clip (overdub). | The same: REC on a selected empty pad makes a new clip, one master cycle long. | Same. The MC-707 sets the new clip's length with the MEASURE buttons before recording; here LENGTH on CLIP SETTING changes it. |
| The clip must be playing | Yes: recording runs with the sequencer. | REC launches the clip on its track if it is not looping already, and the take starts when it does. | A take needs one fixed loop to place notes in; a track that follows the scenes changes clips under it. |
| Input quantize | [QUANTIZE] on / off; SHIFT + [QUANTIZE] for the settings (RM p. 32). | SHIFT + REC on / off, to the nearest step. | No QUANTIZE button; grid sizes other than a step come with SCALE. |
| Knob movements (motion) | The knobs' own parameters (filter, mod, effect), up to four per clip, as steps. | K1 to K4 on CLIPS send four controllers to the track (74, 71, 1 and 11, or the numbers set in the song); a take records them as events, thinned (one value per 1/32 note and the last value of a move), with pitch bend and channel pressure. | The sound is mostly outside gear here, so the knobs speak MIDI; clips hold timed events, not per-step lanes; thinning keeps a sweep from filling the clip. |
| A clip's sound | The clip holds its tone. | The clip holds a program change and a bank select, sent on the track's channel when the track enters the clip. | The tone lives in the outside gear; the SMK-37's own sounds belong to the project. |
| Outside controllers | CC 1, 2 and 4 can be recorded as motion (UM, Ver. 1.80). | Every controller below 120, pitch bend and channel pressure on the track's channel. | Outside gear is the main use here. |
| Undo of a take | UNDO takes the recording back; no undo while recording (UM, Ver. 1.80). | The same: a take is one undo level; FX does nothing during a take. | Same. |
| When the clip is full | Not described. | The take stops: CLIP FULL - 512 EVENTS - REC STOPPED, the REC lamp goes out, the clip's pad shows red once; nothing is lost and undo still holds the clip before the take. | SPEC 14.2. |
| Count-in | Count-In Step, OFF or 1 to 128 steps; MIDI Start goes out after it (UM, Ver. 1.20 and its fixes). | COUNT-IN, OFF or 1, 2 or 4 master cycles; MIDI Start after it. Only before a take that starts the song (REC, then PLAY). | Whole cycles keep the take's first bar on the grid. With the song already running there is nothing to count in. |
| Metronome | ON or OFF with the master clock; type and level; sounds on the audio outputs (UM, Ver. 1.10 and 1.50). | CLICK: OFF, WHEN RECORDING or ALWAYS; output INTERNAL, MIDI NOTE (a channel and note you choose) or BOTH; CLICK LEVEL LOW, MID or HIGH for the internal click; one click sound. | The SMK-37's audio may feed the house mix, so the click for the stage is a MIDI note (SPEC 14.1, decision 7). |
| Where the click settings live | In the system settings. | In each song. | The device's settings sector has no room without a format change; a song's click note belongs to that song's rig anyway. |
| Transpose | Per clip, -12 to +12 (RM p. 50). | TRANSPOSE per clip, -12 to +12; applied when the clip plays, the stored notes stay. | Same. Applied at play time so that 0 always restores the clip. |
| Deleting a clip | Delete in the clip operations (RM pp. 14 to 16). | DELETE CLIP on CLIP SETTING, the 4th left button twice within two seconds; only while stopped; never a clip a scene uses. | Stage safety: one wrong press must not take a clip out of a running set, and a scene must not lose its clip. |
| Unsaved clips | Any number. | One at a time. A copy or a new clip counts. | Memory. |
| Shuffle | Per clip, -50 to +50 (RM p. 50, as the parity matrix records it). | SHUFFLE per clip: SONG or 0 to 50 percent. | No negative values: the engine's swing delays the off-beat step and cannot bring it early. SONG keeps old songs as they were. |
| Quantize at playback | Per clip and for the whole machine; the larger grid wins (RM p. 33). | PLAY QUANTIZE per clip only: OFF, 1/16, 1/8, 1/4. | No machine-wide setting: a clip keeps the feel it was given. |
| Deleting and ordering scenes | Storing and recalling are described (RM p. 36); the parity matrix of 2026-11-07 found no delete or reorder. | FX twice deletes the selected scene, EDIT + K1 moves it; both only while stopped. | Our scenes are a chain that plays in order, so their order matters; stopped only, because every track's position is counted in scenes while the song plays. |
| An armed take when the sequencer stops | Not described. | A take armed while the song played is taken off by the stop; a take armed while stopped waits for PLAY. | A lit REC lamp after a stop is easy to miss, and the next PLAY would record. The user's decision of 2026-11-17. |
| A scene pad while stopped | Reserves the scene; START plays it (RM p. 35 with p. 12). | The same from tabby-v04.12; the pad again takes the reservation back. | Same; taking back as for clips. |
| Scenes in order | None: a scene stays until you press another. | The scene chain: each scene plays TIMES times and the next one follows; THEN STAY makes a scene wait like an MC-707 scene; K3 holds the whole chain. | Imported songs play through by themselves; the hold and the pads are the manual override. |
| Clip chain: what follows | NEXT CLIP: STAY, STOP or CLIP 1 to 16 (UM, Ver. 1.30). | NEXT CLIP: STAY, STOP or a clip of the same track, 1 to 64; K1 steps through the pads that hold a clip. | 64 clips per track. |
| Clip chain: when | LENGTH: OFF (when the clip has played to its end) or 1 to 512 steps. | AFTER: CLIP END or 1 to 512 steps. | The same setting. It is called AFTER because LENGTH on the same page is the clip's length. |
| Clip chain: repeats | None: to play a clip four times before the next, set LENGTH to four times the clip. | TIMES, 1 to 64: the chain is due after TIMES x AFTER (or TIMES x the clip). | Our addition: the count stays right when the clip's length changes. |
| Which tracks a chain moves | Every track: there is no song. | A track that plays the clip launched: from its pad, reserved before PLAY, or reached through a chain. A track that follows the scenes takes its clips from the scenes; the chain waits. | One rule decides what a track plays next: the scenes, or its own chain. Launch the first clip of a chain by hand. |
| Chain timing | At the LENGTH, counted from the clip's start. | The same, to the unit: no extra wait for the master cycle. A chain whose times are whole cycles stays on the cycle because the launch landed on one. | Fill-ins shorter than a cycle must work, as on the MC-707. |
| Notes across a chain step | Cut (a fixed fault in Ver. 1.50 mentions it). | A note that sounds when the next clip starts plays out its length; STOP releases everything. | A held bass note should not be chopped by a clip change. |

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
- A saved clip is stored in the new clip format (v3) with its own length: the steps it played with. It loops at that
  length wherever it plays (section 16).
- From tabby-v04.10 the 4th left button also saves what was changed in the song itself (new clips, copies, stored
  scenes, the click settings); the screen says SAVED.

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

## 13. Recording

REC records what you play into a clip while it loops: notes from the keys and pads, and notes, controllers, pitch
bend and channel pressure arriving at MIDI in on the track's channel. What was in the clip stays (overdub).

### 13.1 Making a take

| Step | Press | Result |
| --- | --- | --- |
| 1 | On CLIPS select the clip (hold its pad, or launch it), or press an empty pad to record a new clip there. Or open a clip on the STEP page. | |
| 2 | REC | The song playing and the clip looping on its track: RECORDING at once, the REC lamp lights. The song playing but the clip not looping: the clip is launched, REC WHEN THE CLIP LOOPS, and the take starts on the next master cycle. The song stopped: REC ARMED - PLAY STARTS IT. |
| 3 | PLAY (only if the song was stopped) | With COUNT-IN set (section 15) the click counts in first. Then the song starts with the clip looping on its track, and the take runs. |
| 4 | Play. | Each note is written when you let its key go, and the clip plays it from its next loop. |
| 5 | REC | REC STOPPED. The clip is UNSAVED; it is saved as on the STEP page (12.5). |

The take also stops when the song stops, when another clip is launched on the track, when a scene is recalled, or
when ENV sends the track back to the scenes.

### 13.2 Rules

| | |
| --- | --- |
| Input quantize | On at power-up: a note is recorded on the nearest step. Its length is what you played. SHIFT + REC switches it off (the note keeps the time you played it, to 1/480 of a step) and on. The STEP page shows Q ON or Q OFF. |
| The same note twice on a step | The later one replaces the earlier one. |
| Channel | Only messages on the track's input channel (SYNC / MIDI page, K1 IN CH) are recorded from MIDI in. |
| Controllers | A moving controller is recorded once per 1/32 note (240 units); when it stops moving for a 16th, its last value is recorded too. A value it already has is not recorded again. Up to eight controllers can move at once. |
| Not recorded | Polyphonic aftertouch, channel mode messages (controllers 120 to 127), program changes, more than 16 keys held at once. |
| Undo | A whole take is one undo level (FX on the STEP page). FX does nothing during a take. A take in which nothing was played leaves no undo level. |
| Full | A clip holds 512 events. Held keys have their places reserved. When the clip is full the take stops by itself: CLIP FULL - 512 EVENTS - REC STOPPED for two seconds, the REC lamp goes out, the clip's pad on CLIPS shows red once. Nothing already recorded is lost. |
| The song stops (tabby-v04.16) | A take that was armed while the song played and has not started (REC WHEN THE CLIP LOOPS) is taken off: SONG STOPPED - REC OFF, the REC lamp goes out. A take armed while the song is stopped waits for PLAY as before. A running take ends with the song, as it always did. |
| One clip | The take goes into the one open clip. With another clip unsaved, REC says ANOTHER CLIP IS UNSAVED. |
| A new clip | REC on a selected empty pad makes a clip one master cycle long and records into it. It is UNSAVED, and part of the song once saved; SHIFT + ENV on the STEP page takes it out again before that. |
| Where a note lands | Where you heard it: the take is placed one audio block (3 ms) earlier than the device's clock says, because what you hear is one block behind it. Before tabby-v04.10 a take without input quantize played back 3 ms late (measured); BUILD.md 46 has the figure measured after the change. |

### 13.3 Messages

| Message | Reason |
| --- | --- |
| RECORDING / REC STOPPED | A take started / ended. |
| REC WHEN THE CLIP LOOPS | REC was pressed while the clip was not looping on its track; it has been launched. |
| REC ARMED - PLAY STARTS IT | REC was pressed while the song is stopped. |
| INPUT QUANTIZE ON / OFF | SHIFT + REC. |
| CLIP FULL - 512 EVENTS - REC STOPPED | The event cap. |
| REC: ON THE CLIPS OR STEP PAGE | REC on another page. |
| ANOTHER CLIP IS UNSAVED / CLIP SHARED BY ANOTHER TRACK / HOLD A PAD TO SELECT A CLIP FIRST | As for EDIT (12.6). |

## 14. CLIP SETTING page

FX on the CLIPS page opens it on the track's selected clip (or the clip the track plays). The screen lists one
setting per line, on three pages (tabby-v04.17): page 1/3 holds the clip's first eight lines (LENGTH to COPY TO PAD),
page 2/3 four more of the clip (TRANSPOSE, SHUFFLE, PLAY QUANTIZE, DELETE CLIP), page 3/3 the song's ten lines
(COUNT-IN to K4 CONTROLLER). K5 walks through all twenty-two; the screen changes page by itself.
Without a selected clip the clip's lines show a dash and the song's lines still work.

| Control | Result |
| --- | --- |
| K5, OCT - / OCT + | Chooses the line. |
| K1 | Changes the line's value by one. |
| K2 | Changes it by 16 (a bar of LENGTH). |
| 4th left button | On COPY TO PAD: makes the copy. On DELETE CLIP: pressed twice within two seconds, deletes the clip. On every other line: saves the song (stopped only). |
| FX, EDIT, BT | Back to CLIPS. |
| PLAY | Starts and stops the song. |
| HOME | To the overview. |

| Line | Values | What it does |
| --- | --- | --- |
| NEXT CLIP, AFTER, TIMES | | The clip chain, section 17. They follow LENGTH on the page. |
| PROGRAM, BANK MSB, BANK LSB | | The clip's program change and bank, section 19. They follow TIMES. |
| LENGTH | 1 to 128 steps | The clip's length. It loops at this length wherever it plays. Shorter: the notes past the new end are removed (NOTES PAST THE END REMOVED; FX on the STEP page undoes). Longer: empty steps are added. Heard from the clip's next loop. Not during a take. |
| COPY TO PAD | a pad of the same track, 1 to 64 | The 4th left button copies the clip to that pad if it is empty (the page offers the first empty one and says EMPTY or HOLDS A CLIP). The copy becomes the open clip, UNSAVED. A clip with unsaved changes must be saved first. |
| TRANSPOSE | -12 to +12 semitones | Moves every note of the clip when it plays; the notes stored in the clip are not changed, so 0 brings the clip back as it was. Heard from the clip's next loop. A note that would leave the MIDI range stays at its edge. Saved with the clip; FX on the STEP page undoes. Not during a take. For a drum clip leave it at 0. |
| SHUFFLE | SONG, 0 to 50 PERCENT | SONG: the clip follows the song's swing, as every clip did before. A number: the clip's own shuffle; every second 16th step comes that much of a step late (50: a triplet feel), whatever the song does. Heard from the clip's next loop. One undo level per run of turns. (tabby-v04.17) |
| PLAY QUANTIZE | OFF, 1/16, 1/8, 1/4 | When the clip plays, every note starts on the nearest line of that grid; a note exactly halfway goes to the earlier line, a note nearest the clip's end starts the clip. The stored notes keep their timing (the STEP page shows it), controllers are not moved, and of two notes of one pitch that land on one step the first plays. (tabby-v04.17) |
| DELETE CLIP | | Press the 4th left button: PRESS AGAIN TO DELETE THE CLIP. Press it again within two seconds: CLIP DELETED - SAVE THE SONG, and the pad is empty. Only while the song is stopped (STOP TO DELETE). A clip that a scene uses is not deleted: USED BY SCENE n - NOT DELETED. Chains that led to the clip do nothing afterwards. The song is UNSAVED until you save it; loading the song again before saving brings the clip back. |
| COUNT-IN | OFF, 1 CYCLE, 2 CYCLES, 4 CYCLES | Section 15. |
| CLICK | OFF, WHEN RECORDING, ALWAYS | Section 15. |
| CLICK OUT | INTERNAL, MIDI NOTE, BOTH | Section 15. |
| CLICK CHANNEL | 1 to 16 | The MIDI click's channel (10 unless changed). |
| CLICK NOTE | 1 to 127 | The MIDI click's note (37 unless changed). |
| CLICK LEVEL | LOW, MID, HIGH | The internal click's level (MID unless changed). Each step is twice the one before. Section 15. |
| K1 CONTROLLER to K4 CONTROLLER | 0 to 127 | The controller number each of K1 to K4 sends on the CLIPS page (74, 71, 1 and 11 unless changed). Section 19.2. |

Messages: SELECT A CLIP FIRST, NOTES PAST THE END REMOVED, NOT DURING A TAKE, THE CLIP IS UNSAVED: SAVE IT FIRST,
THAT PAD HOLDS A CLIP, COPIED - THE COPY IS OPEN, CLIP SHARED BY ANOTHER TRACK, STOP TO SAVE, SAVED, NOTHING TO SAVE,
PRESS AGAIN TO DELETE THE CLIP, CLIP DELETED - SAVE THE SONG, USED BY SCENE n - NOT DELETED, STOP TO DELETE.

## 15. Click and count-in

The settings are part of the song and are saved with it. A song that was never set has no click and no count-in.

| | |
| --- | --- |
| The click | One on every quarter note of the master cycle; the first of a cycle is louder (MIDI velocity 127, the others 90; the internal click is higher in pitch). |
| CLICK | OFF: none. WHEN RECORDING: while a take is armed or runs. ALWAYS: whenever the song plays. |
| CLICK LEVEL | The internal click only: LOW, MID or HIGH, each twice as loud as the one before. A song that was never set is on MID. HIGH is about as loud as a note of the built-in sounds; before tabby-v04.14 the click had half the level of LOW. |
| CLICK OUT | INTERNAL: a short click mixed into the SMK-37's audio output, after the master volume (K8). MIDI NOTE: a note on the chosen channel and note, on every MIDI output, sent in time like a song note and released a 32nd note later. BOTH. |
| COUNT-IN | With a take armed while the song is stopped (REC, section 13), PLAY first clicks for 1, 2 or 4 master cycles; then the song starts. The CLIPS page shows COUNT-IN and the quarter notes left. The count-in clicks whatever CLICK says, on the output CLICK OUT names. |
| MIDI Start | Goes out when the song starts, after the count-in. |
| PLAY during the count-in | Stops it; nothing was played. |
| CLOCK = MIDI | No count-in: the master starts the song. The click follows the song. |
| On stage | If the audio output feeds the house mix, use MIDI NOTE and point it at a click sound in your monitor mix. |

## 16. How long a clip plays

- Every clip has its own length and loops at it, on a launched track and on a track that follows the scenes. A
  1-bar clip in a 4-bar scene plays four times; a 4-bar clip in a scene of 1 bar, repeated four times, plays through.
- A scene lasts its steps times its repeats, whatever its clips' lengths are. When the next scene comes, every
  following track starts that scene's clip from its beginning.
- A clip in the new format (every clip that was edited, recorded, copied or made on the device, and long clips
  from the importer) carries its length. An old-format (grid) block has none: in the scenes of an imported song it
  plays the scene's length, as it always did; launched from a pad no scene uses, or in a scene stored on the
  device, it plays the length of the first imported scene that uses it.
- A clip edited on tabby-v04.8 to tabby-v04.9.3 was stored as 64 steps. If its scene is shorter it now loops at 64:
  set LENGTH once (section 14).

## 17. Clip chains

A chain tells a track what to do when a clip has played: stay on it, stop, or go on with another clip of the same
track. It is set per clip on CLIP SETTING (section 14) and saved with the clip.

| Line | Values | Meaning |
| --- | --- | --- |
| NEXT CLIP | STAY, STOP, CLIP 1 to 64 | STAY: no chain; the clip loops until you choose again. STOP: the track stops. CLIP n: the track goes on with that clip. K1 steps through STAY, STOP and the pads of the track that hold a clip. |
| AFTER | CLIP END, 1 to 512 STEPS | When. CLIP END: when the clip has played to its end. A number: after that many steps, whether the clip is shorter (it loops meanwhile) or longer (it is cut). K2 changes it by 16. |
| TIMES | 1 to 64 | How many times AFTER (or the clip) plays before the chain is due. |

- The chain runs on a track that plays the clip launched: you pressed its pad, or reserved it and pressed PLAY, or
  another clip's chain led to it. A track that follows the scenes ignores chains.
- The step happens exactly TIMES x AFTER after the clip started. Launches land on the master cycle, so chains made of
  whole cycles stay on it; a fill-in of 4 steps is possible too.
- The next clip starts from its beginning and its own chain counts from there. A clip may name itself (it starts
  again) or lead back to an earlier clip (a loop of clips).
- Notes that sound when the next clip starts play out their length. STOP releases everything.
- The CLIPS page shows where a launched clip's chain leads, under the track's column: +05 for clip 5, +STP for a stop.
- A press on a pad, ENV or a scene recall takes the track out of the chain like out of any launched clip.
- A chain is heard from the clip's next loop when you change it while the clip plays; counted from where the clip
  was entered, and due at the end of the pass if that moment has passed.
- NEXT CLIP naming a pad whose clip is gone is read as STAY.
- Not during a take: NOT DURING A TAKE.

## 18. The scene chain

The scenes of a song play in order: scene 1, then 2, and so on. Each has a length and says what follows it. Both are
set on the SCENES page for the scene that plays; while the song is stopped, for the reserved scene (press its pad).

| Knob | Line on the screen | Meaning |
| --- | --- | --- |
| K1 | LEN n CYCLES | How many times the scene plays before the next one: 1 to 64 times its own steps. The screen shows the result in master cycles (in steps when it is not a whole number of cycles). |
| K2 | THEN NEXT / STAY | NEXT: the following scene comes when this one has played its length (after the last scene: the song's loop point, or the end; the screen says LOOP or END). STAY: the scene repeats until you recall another. |
| K3 | CHAIN RUNS / CHAIN HELD | The manual override. HELD: the scene that plays repeats, whatever its settings say, until you turn K3 back or recall a scene. Not stored; it is off after another song is loaded. |
| K4 | JUMP | When a recalled scene lands (section 5). |

- A pad always wins: recalling a scene jumps there (by the jump mode) and the chain goes on from that scene.
- TIMES and THEN are part of the song: UNSAVED until saved (stopped, 4th left button, or by itself after ten
  seconds). A change to the scene that plays is taken at once.
- A scene stored from the panel (section 5) starts as THEN STAY, 1 time. Give it a length and THEN NEXT to make it a
  step of the chain.
- Each track that follows the scenes takes the new scene's clip from its beginning when the scene changes; launched
  tracks stay on their clips (and their clip chains) until you send them back.
- With CLOCK = MIDI the song starts at scene 1 (a reservation is not used) and the master's song position moves
  through the chain.

## 19. A clip's program and bank; the controller knobs

### 19.1 PROGRAM, BANK MSB, BANK LSB (CLIP SETTING)

| Line | Values | Meaning |
| --- | --- | --- |
| PROGRAM | OFF, 1 to 128 | A program change sent on the track's channel when the track enters the clip. |
| BANK MSB | OFF, 0 to 127 | With a value: bank select (controllers 0 and 32) is sent before the program change. |
| BANK LSB | 0 to 127 | The bank's second number; a dash while BANK MSB is OFF (SET BANK MSB FIRST). |

- They go out when the track enters the clip: launched, reached through a chain, or brought by a scene; not on every
  loop. Order: bank MSB, bank LSB, program, then the clip's first notes, all at the clip's start. Gear that needs time
  to change sounds wants a scene's row event with a pre-roll instead (the workbench's song editor).
- Changed while the clip loops, the new values go out once at the clip's next loop.
- They go to MIDI out only; the SMK-37's own sound of the track does not change.
- Saved with the clip. One undo level per line.

### 19.2 K1 to K4 on CLIPS

| Knob | Controller unless changed | Starts at |
| --- | --- | --- |
| K1 | 74 (brightness, filter cutoff on most gear) | 64 |
| K2 | 71 (resonance) | 64 |
| K3 | 1 (modulation) | 0 |
| K4 | 11 (expression) | 127 |

- A click changes the value by 2; the screen shows K1 CONTROLLER 074 = 070. The message goes where the selected track's
  keys go: to the track's own sound and, with KEY OUT on, to MIDI out on the track's output channel.
- Each track keeps its four values while the power is on.
- During a take the movements are recorded into the clip like controllers from outside gear (section 13.2: once per
  1/32 note while moving, and the last value), and the clip plays them back on the song's channel for the track.
- The four controller numbers belong to the song (from tabby-v04.14): K1 CONTROLLER to K4 CONTROLLER on page 3/3 of
  CLIP SETTING, 0 to 127 each, saved with the song. A song that was never set uses 74, 71, 1 and 11. The values the
  knobs start at stay as in the table whatever the number.
