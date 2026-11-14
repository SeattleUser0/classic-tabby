# Classic Tabby control map: clips and scenes on the SMK-37

Version: 0.1 (2026-11-14, Task 17 Goal 4). Applies from tabby-v04.7.

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
| Press while the song is stopped | Selects the clip only. Screen: PLAY STARTS THE SONG FIRST. |
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
| Orange (dim: not playing, bright: playing) | The track is muted. Queued pads still blink. |

Blinking follows the song: on for an eighth note, off for an eighth note. While the song is stopped it blinks
four times a second.

With SHIFT held the pads show tracks instead: pads 1 to 8 in the track colours (bright: playing, dim: silent,
blinking: something queued, brightest: the selected track), pads 9 to 16 the mutes (orange: muted).

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

SHIFT + pad 9 to 16 mutes a track: its internal sound is silenced (the mixer's mute) and its song notes are held
back on MIDI out. The clip keeps running, so unmuting brings it back in time. Notes already sounding when you
mute end at their normal length. Controller and program events of a clip are still sent while muted. The screen
says TRACK MUTED or TRACK UNMUTED; for a track with no internal sound (source OFF) it says MIDI TRACK MUTED or
MIDI TRACK UNMUTED.

Two things stay as they were before tabby-v04.7, so that no existing song goes quiet:

- A mute set on the MIX page silences the internal sound only. The song still plays the track on MIDI out.
- Tracks 6 and 7 of a new project start muted in the mixer. A song still plays them on MIDI out. The first
  SHIFT + pad on such a track unmutes its internal sound; the next one mutes both.

On the CLIPS page the orange pads and the word MUTED show the mute that holds the song notes back.

## 8. Transport and clock

| Situation | Behaviour |
| --- | --- |
| PLAY, song stopped | The song starts at scene 1; every track follows. |
| PLAY, song playing | The song stops; every note is released. Launches and stops are forgotten. |
| CLOCK = MIDI | The song waits for the master's Start and follows its clock. PLAY arms and disarms. Launching works the same; the master cycle is counted from the master's Start. |
| End of the song with launched tracks | The launched tracks keep looping; the screen says SONG OVER. A scene recall or PLAY ends it. |

## 9. What the screen says when something cannot be done

| Message | Reason |
| --- | --- |
| PLAY STARTS THE SONG FIRST | A pad was pressed while the song is stopped. |
| NO CLIP ON THIS PAD | The place is empty. |
| NO SUCH SCENE / NOT PLAYING | The scene pad has no scene, or the song is stopped. |
| NOT PLAYING | ENV was pressed while the song is stopped. |
| TRACK TO SCENES AT CYCLE / ALL TRACKS TO SCENES AT CYCLE | ENV / SHIFT + ENV was taken (information). |
| LAUNCH AT NEXT CYCLE / STOP AT NEXT CYCLE | The queue was taken (information, not an error). |
| TAKEN BACK | A queued launch or stop was withdrawn. |
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
