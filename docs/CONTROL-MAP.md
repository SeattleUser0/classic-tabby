# Classic Tabby control map: clips and scenes on the SMK-37

Version: 0.28 (2026-11-24). Sections 3, 4, 7: a mute under KNOB BANK needs its pad HELD (tabby-v1.5); 4: a grace landing cuts the old notes. v0.27: Section 4 and 5: the grace after the bar line (tabby-v1.4). v0.26: Section 5: a scene is stored with SEQ REC + an empty pad (tabby-v1.4); 13.2: a control that wiggles at rest is not recorded. v0.25: 12.5, 13.2: eight clips can be unsaved at a time (tabby-v1.3). v0.24: 20.3: the play state at the left end of a message, any press clears it (tabby-v1.2.1); section 7: a muted internal sound is not rendered. v0.23: 20.3: the message box is at the top (tabby-v1.2); 20.13: how the screen is proven on the device. v0.22: Section 20: the screen of tabby-v1.1, as built (v0.21 was the design, written before the build); sections 4, 5, 7, 9, 12, 14, 17 and 18 say what the new screen shows. v0.20 applied from tabby-v1.0.2 (section 14: EVENT LEAD). v0.19 was for tabby-v1.0 (1.2: the pad rows confirmed on the device; where a KNOB BANK shortcut's message is shown). v0.18 was for tabby-v04.23 (3.2: the step loop). v0.17 was for tabby-v04.22 (3.1: NOTE REPEAT repeats; the focus switch is KNOB BANK + NOTE REPEAT). v0.16 was for tabby-v04.21 (12.4: shift a clip; 13.2: clear notes in a take; 2.1: NEW SONG; 1.2: the pad rows). v0.15 was for tabby-v04.20 (section 14: DIRECTION). v0.14 was for tabby-v04.19 (section 14: STEP SIZE). v0.13 was for tabby-v04.18 (every button by its printed word; section 1.1 is the name table). v0.12 was for tabby-v04.17 (section 14: SHUFFLE, PLAY QUANTIZE, three pages). v0.11 was for tabby-v04.16 (section 5: a scene deleted and moved; 13.2: a stop takes an armed take off). v0.10 was for tabby-v04.15 (section 14: TRANSPOSE and DELETE CLIP). v0.9 was for tabby-v04.14 (section 14: CLIP SETTING has two pages; CLICK LEVEL; the controller numbers of K1 to K4 are the song's). v0.8 was for tabby-v04.13 (section 19: a clip's program and bank, the controller knobs). v0.7 was for tabby-v04.12 (section 18, the scene chain); v0.6 was for tabby-v04.11 (section 17, clip chains); v0.5 was for tabby-v04.10 (sections 14 to 16: CLIP SETTING, click and count-in, clip lengths; new clips; stored scenes). v0.4 was for tabby-v04.9 (section 13, recording); v0.3 was for tabby-v04.8 (section 12, the STEP page); v0.2 was for tabby-v04.7.1, v0.1 for tabby-v04.7.

This is the complete control map for the clip workflow: what every button, pad, knob and fader does on the
two pages you play a song from, CLIPS and SCENES, on the STEP page, where you edit a clip, and when you record. Control names are the ones in SPEC.md 17.4: knobs K1 to K8
from the left, and every button by the word printed on it (read from a photograph of the unit, 2026-11-17).
Section 1.1 lists the names the firmware and earlier versions of this document used.

The model is the Roland MC-707's: a song has eight tracks, each track has clips, a scene is one clip per track,
and everything you launch waits for the next master cycle so it always lands in time.

## 1. Words

| Word | Meaning |
| --- | --- |
| Clip | One pattern of one track, 1 to 8 bars. A track holds up to 64, shown 16 at a time (4 banks). |
| Scene | One row of the song: one clip (or nothing) for each of the 8 tracks. Up to 128, shown 16 at a time (8 banks). |
| Master cycle | The launch grid, set per song (1 bar unless the song says otherwise). Launches, stops and "back to scenes" land on its next boundary. |
| Following | A track that plays whatever the current scene gives it. Every track follows after SEQ PLAY. |
| Launched | A track that loops a clip you chose by hand. It ignores scene changes made by the song running on, until you send it back. |
| Stopped | A track you silenced by hand. It stays silent until you launch a clip on it or send it back. |

### 1.1 Button names: printed on the SMK-37, and what the firmware calls them

From tabby-v04.18 the screen, Help, the guide and this document use the printed word. The firmware's source and the
test tools keep their own names; this table is the bridge.

| Printed (used everywhere) | Where | Firmware name; earlier documents | What it does in Classic Tabby |
| --- | --- | --- | --- |
| KNOB BANK | left, row 1 | SHIFT | Held: second functions (pads select and mute tracks; + SEQ REC input quantize; + CHORD every track) |
| FADER BANK | left, row 1 | FADER BANK | Faders on tracks 1 to 4 or 5 to 8 |
| < | left, row 2 | HOME | As PATCH pressed alone |
| > | left, row 2 | SAVE; "the 4th left button", 4TH LEFT BTN, BTN 4 | Saves (the song, the clip, the project) and confirms |
| OCTAVE-, OCTAVE+ | left, row 3 | OCT_DOWN, OCT_UP; OCT -, OCT + | Octave of the keys; pad bank on CLIPS and SCENES; bar on STEP (with KNOB BANK: shift the clip a step); line on CLIP SETTING |
| ARP | right, upper | ARP | Arpeggiator on / off; held: its settings |
| NOTE REPEAT | right, upper | PAD / STEP | Held: note repeat (a held key or pad repeats at the ARP rate; K1 sets the rate). With KNOB BANK: the playing focus, keys or pads (tabby-v04.22; before, the button alone) |
| SCALE | right, upper | SCL | CLIPS <> SCENES; pad mode on STEP |
| CHORD | right, upper | ENV (ENV / LFO) | Selected track back to the scenes (with KNOB BANK: every track); clears a step on STEP |
| GLOBE | right, upper | GLO; MIX | The mixer |
| BT | right, upper | BT | To the CLIPS page |
| PATCH | right, lower | HOME; HOME / SRC | The overview and the preset list; with KNOB BANK the sound source page |
| PARA | right, lower | EDIT | The STEP page of the selected clip; on SCENES held with K1: move a scene |
| FX | right, lower | FX | CLIP SETTING; undo on STEP; twice on SCENES: delete a scene; held with a key during a take: clear that key's notes |
| SEQ | right, lower | SEQ | SYNC / MIDI; with PARA the ACTIONS menu; with KNOB BANK the MIDI TRACK page |
| SEQ PLAY | right, lower | PLAY | Starts and stops the song |
| SEQ REC | right, lower | REC | Starts and stops a take |

Knobs are printed K1 to K8 and faders FADER1 to FADER4; the firmware calls K5 SELECT, K6 PAGE, K7 PRESETS and K8 MASTER.
The pads carry no numbers. Under the lower pad row the panel prints transport symbols (play, pause, record, rewind,
fast forward, <, >, UNDO) and above the keys a strip of M-VAVE's own key functions (ARP, CHN 1 to 16, PRE 1 to 8,
rates, RESET): Classic Tabby uses neither (docs/STICKERS.md 2 goes through the strip function by function).

### 1.2 The pad rows (confirmed on the device)

Pads 1 to 8 are the upper row (next to the knobs), left to right, and pads 9 to 16 the lower row, pad n + 8 under
pad n. Confirmed on the user's unit on 2026-11-18: KNOB BANK held and the upper left pad pressed selects track 1.
The firmware agrees: the pads' LED chain (app/board/panel.c, `rgb_map`) runs along one row and back along the
other in that order, and M-VAVE's own panel model in the Open V01 kit puts pads 1 to 8 on top.

What the screen shows for KNOB BANK + a pad: on the overview the selected track's number gets a blue box in the list
of eight tracks; on CLIPS the top line names the track. The message (TRACK SELECTED; TRACK MUTED - SOUND + MIDI;
TRACK UNMUTED; MIDI TRACK MUTED / UNMUTED) is written in the first line of the KNOB BANK list for 1.2 seconds from
tabby-v1.0. Before, it was written on the line the list covers and was seen only if KNOB BANK was let go at once.

## 2. Getting there (any page)

| Press | Result |
| --- | --- |
| BT | Opens CLIPS. Press BT again to return to the page you came from (the overview, SYNC / MIDI, the mixer or SCENES; from any other page, the overview). |
| SCALE (on CLIPS or SCENES) | Switches between CLIPS and SCENES. |
| PATCH | Leaves to the overview. The song keeps playing. |
| SEQ + PARA, then SONG MODE | The older way into SCENES (the SONG page); still works. |

The Bluetooth notice that BT used to show is gone; Bluetooth is set in the web workbench.

### 2.1 ACTIONS: NEW SONG (tabby-v04.21)

| Step | Press | Result |
| --- | --- | --- |
| 1 | On SCENES, song stopped: K5 to an empty slot | NO SONG. |
| 2 | SEQ + PARA, K1 to NEW SONG, the > button | NEW SONG IN SLOT nn? (PATCH cancels). |
| 3 | The > button again | The song is made and stored: named NEW SONG, the loaded project, its tempo, looping, master cycle 16 steps, one empty scene of 16 steps, no clips. CLIPS opens: NEW SONG - HOLD A PAD, SEQ REC. |

A slot that holds a song is never replaced: SLOT HOLDS A SONG - K5 ON SCENES. While the song plays: STOP THE SONG
FIRST. Unsaved changes of the song being left are saved first, as when another song is chosen. The first scene stays
empty until it is deleted (section 5; FX twice) after a scene of your own is stored.

## 3. Stage actions

| I want to | Press | Presses |
| --- | --- | ---: |
| Start or stop the song | SEQ PLAY | 1 |
| Launch a clip on the selected track | its pad (CLIPS) | 1 |
| Stop the selected track | the pad of its playing clip (CLIPS) | 1 |
| Take back a launch or stop that has not landed yet | the blinking pad again | 1 |
| Recall a scene | its pad (SCENES) | 1 |
| Choose another track | KNOB BANK + pad 1 to 8, or turn K5 | 2 |
| Mute or unmute a track | KNOB BANK + pad 9 to 16 (tracks 1 to 8), the pad HELD a moment (0.15 s; tabby-v1.5). Or one press on the mixer page | 2 |
| Send the selected track back to the scenes | CHORD | 1 |
| Send every track back to the scenes | KNOB BANK + CHORD | 2 |
| Next or previous 16 clips or scenes | OCTAVE+ / OCTAVE- | 1 |
| Stop everything at once | PATCH + SEQ PLAY | 2 |

From any other page add one press: BT first.

### 3.1 Note repeat (tabby-v04.22)

| Press | Result |
| --- | --- |
| NOTE REPEAT, held | NOTE REPEAT 1/16 (the rate is the track's). The NOTE REPEAT lamp is lit. The arpeggiator of the key track and of the pad track is on for as long as the button is down. The page does not change. |
| + a key, or a pad where pads play notes | The note repeats at that rate, with the velocity played, until the key or NOTE REPEAT is let go. |
| + K1 | The rate: 1/4, 1/8, 1/16, 1/32 (the ARP rate of those tracks; it stays). Nothing else reads the knobs in that moment. |
| NOTE REPEAT let go | The repeats end; the tracks' ARP switches are as before. |
| KNOB BANK + NOTE REPEAT | The playing focus: keys or pads (PAD READY / KEY READY - PARA / FX), as NOTE REPEAT alone did before tabby-v04.22. Leaves to the overview. |

It is the track's arpeggiator, not a generator of its own: one held note repeats; several held notes take turns in
the ARP's DIRECTION; RANGE above 1 OCT adds octaves; GATE and SWING apply. A track whose ARP is on already is left
alone (ARP IS ON - IT REPEATS). A key that is down when NOTE REPEAT is pressed is cut off: press NOTE REPEAT
first. A take records the held key as one note, not the repeats. Because the ARP switch belongs to the project, the
project counts as changed afterwards.

### 3.2 The step loop (tabby-v04.23)

| Press (CLIPS page, the song playing) | Result |
| --- | --- |
| NOTE REPEAT, held | The lower pad row shows the loop pads: 9 to 12 amber, 13 to 16 dark. No pad launches a clip while it is down. (The keys repeat as in 3.1.) |
| + pad 9, 10, 11 or 12, held | STEP LOOP: LAST 1 / 2 / 4 / 8 STEPS. Every track that plays repeats that many 16ths of what it plays, ending with the step it is in. The pad is white. |
| The pad let go | STEP LOOP OFF. Every track is where it would have been without the loop. NOTE REPEAT may be let go before the pad. |
| + another pad | STEP LOOP - NOTE REPEAT + PAD 9-12. Nothing is launched. |

The clips' clocks run on underneath the loop (launches, chains, scene changes and stops land as always; what they
bring is heard when the loop ends or, for a new clip, looped in its turn). A loop is not longer than the clip that
plays. With a STEP SIZE other than 1/16 the loop is still counted in 16ths of what is heard. A note longer than the
loop is played again each round. Refused: the song stopped (STEP LOOP - PLAY FIRST); a take running (NOT
DURING A TAKE; the take would be written where the clip really is). Stopping the song ends the loop.

## 4. CLIPS page

The screen shows the bar count, the song and scene, one cell per track (the clip it plays, and what is
queued for it), and the 16 clips of the pad bank; the selected track is in the top line. Section 20.5 has the
layout.

### 4.1 Pads

| Action | Result |
| --- | --- |
| Short press, clip not playing | Queues the clip for the selected track; it starts at the next master cycle. The clip becomes the selected clip. |
| Short press, the playing clip | Queues a stop for the track at the next master cycle. |
| Short press, a blinking (queued) pad | Takes the queued launch or stop back. |
| Long press (half a second) | Selects the clip without launching it: the launch or stop the press queued is taken back if it has not landed. |
| Press an empty pad | The pad is selected (dim cyan) and nothing is queued. Screen: EMPTY PAD - REC OR PARA. SEQ REC then records a new clip there (section 13), PARA opens a new empty clip on the STEP page. |
| Press while the song is stopped | Reserves the clip: the pad blinks, the screen says RESERVED FOR SEQ PLAY. SEQ PLAY then starts the song with that track on the reserved clip; tracks with nothing reserved follow scene 1. Press the blinking pad again to take the reservation back. (With CLOCK = MIDI a reservation is not used: the song starts on its scenes.) |
| KNOB BANK + pad 1 to 8 | Selects track 1 to 8. |
| KNOB BANK + pad 9 to 16, held 0.15 s | Mutes or unmutes track 1 to 8. A pad that is only brushed does nothing (HOLD THE PAD TO MUTE), and a pad of the upper row pressed in that moment takes the mute back: the two rows lie one above the other, and a hand going for KNOB BANK + pad 1 (select track 1) that caught pad 9 used to mute track 1 (tabby-v1.5; the user's order of 2026-11-24). The mixer page mutes with one press, as before. |

**The bar line (tabby-v1.4).** A launch, a stop and a scene recall land on the next master cycle. A press that
reaches the SMK-37 up to about 20 ms after a line still lands on that line (a clip launch and a scene recall; what
the new clip holds up to that moment sounds at once, so its first note is up to 20 ms late and never missing; from tabby-v1.5 what the old clip or scene still sounds on those tracks is cut at that moment, so the two overlap for the grace only and do not ring on together).
Before tabby-v1.4 a press in the last 10 to 20 ms before the line waited a whole cycle, or landed without its first
note. A stop and "back to the scenes" (CHORD) have no grace.

### 4.2 Pad colours

| Colour | Meaning |
| --- | --- |
| Off | Empty: no clip in this place. |
| Dim cyan | An empty pad that is selected: SEQ REC or PARA makes a clip there. |
| Dim white | Stopped: a clip that is not playing. |
| Green | Playing. |
| Blinking green | Queued: starts at the next master cycle. |
| Blinking red | The playing clip, with a stop queued. |
| Bright white | Selected and not playing. A selected clip that plays is bright green. |
| Orange (dim: not playing, bright: playing) | The track is muted altogether: its sound and its song notes on MIDI out. Queued pads still blink. |
| Blue (dim: not playing, bright: playing) | Only the track's internal sound is muted (a mixer mute). The song still plays it on MIDI out. |

Blinking follows the song: on for an eighth note, off for an eighth note. While the song is stopped it blinks
four times a second.

With KNOB BANK held the pads show tracks instead: pads 1 to 8 in the track colours (bright: playing, dim: silent,
blinking: something queued, brightest: the selected track), pads 9 to 16 the mutes (orange: muted altogether,
blue: internal sound only, dim green: not muted).

### 4.3 Buttons

| Button | Short press | With KNOB BANK |
| --- | --- | --- |
| SEQ PLAY | Starts the song at scene 1; stops it. | same |
| OCTAVE- / OCTAVE+ | Previous / next bank of 16 clips (4 banks). | same |
| SCALE | To the SCENES page. | same |
| CHORD | Selected track back to the scenes at the next master cycle. | Every track back. |
| BT | Back to the page you came from. | same |
| PATCH | To the overview. | SRC: the source page. |
| FADER BANK | Faders work tracks 1 to 4 / 5 to 8. | same |
| GLOBE | The mixer page (levels, mute, solo); GLOBE again returns. | same |
| SEQ REC | Starts a take into the track's selected clip, or stops it (section 13). | Input quantize on / off. |
| PARA | Opens the STEP page on the selected clip of the track (section 12); on a selected empty pad, on a new clip. | same |
| FX | Opens CLIP SETTING on the selected clip (section 14). | same |
| > button | Saves the song: the unsaved clip and what was changed in the song (stopped only; STOP TO SAVE otherwise). | same |
| ARP, SEQ | As on every page (SPEC.md); they leave CLIPS. | |
| NOTE REPEAT | Held: note repeat for the keys (3.1); the page stays. | The focus switch; it leaves to the overview. |

No button on these two pages has a long-press action. The only long press is a pad on CLIPS (4.1).

### 4.4 Knobs

| Knob | Turn |
| --- | --- |
| K5 | Selects the track. |
| K6 | Selects the clip bank (same as OCTAVE- / OCTAVE+). |
| K8 | Master volume, as everywhere. |
| K1 to K4 | Send controllers 74, 71, 1 and 11 on the selected track (section 19). A take records them. |
| K7 | Nothing on this page. |

## 5. SCENES page

The screen shows the song, the current scene, what comes next, its repeat count, the bar, the clip
each track plays in the scene, and the 16 scenes of the pad bank. Section 20.6 has the layout.

| Control | Result |
| --- | --- |
| Pad 1 to 16 | Recalls that scene of the bank. Every track goes back to following and plays the scene's clips. It lands by the jump mode. |
| SEQ REC held and an empty pad pressed, while the song plays (tabby-v1.4) | Stores what plays now as a new scene after the last one (STORED AS A NEW SCENE): per track the clip it plays, nothing for a stopped track. The new scene repeats until another is recalled. An empty pad alone, however long it is held, stores nothing and says SEQ REC + PAD - NEW SCENE; so does SEQ REC alone. Until tabby-v1.3 an empty pad held half a second stored: one pad that read as held could do that by itself, and once did. A pad that holds a scene is never written over: it recalls its scene, with or without SEQ REC. |
| > button | Saves the song (stopped only). |
| K1, K2, K3 | The scene chain (section 18): how many times the scene plays, what follows it, and the hold. |
| FX, twice within two seconds, song stopped (tabby-v04.16) | Deletes the selected scene: the one reserved (its pad blinks), else scene 1. The first press asks: FX AGAIN DELETES SCENE nnn. Then SCENE DELETED - SAVE THE SONG; the later scenes move one pad earlier, the scene's row events go with it, its clips stay. The last scene of a song stays (THE LAST SCENE STAYS). There is no undo: the change is saved with the song (the > button, ten seconds after the change, or on leaving the song). |
| PARA held + K1, song stopped (tabby-v04.16) | Moves the selected scene one pad earlier (left) or later (right): SCENE MOVED - SAVE THE SONG. Its row events and the song's loop scene move with it; it stays the selected scene. PARA alone says PARA + K1 - MOVES A SCENE. |
| FX or PARA while the song plays | STOP THE SONG FIRST. Nothing changes. |
| K4 | Jump mode: NEXT CYCLE (the next master cycle) or SCENE END (when the current scene has played out). |
| Pad while the song is stopped | Reserves the scene: it blinks, the screen says RESERVED FOR SEQ PLAY, and SEQ PLAY starts the song there. The same pad again takes it back (SEQ PLAY starts at scene 1). |
| OCTAVE- / OCTAVE+ | Previous / next bank of 16 scenes (8 banks). |
| K5 or K7 | Selects the song (only while stopped). |
| SEQ PLAY | Starts the song at scene 1; stops it. |
| SCALE | To the CLIPS page. |
| CHORD / KNOB BANK + CHORD | Selected track / every track back to the scenes. |
| KNOB BANK + pad 1 to 8, KNOB BANK + pad 9 to 16 | Select track, mute track, as on CLIPS. |

Pad colours: off = no such scene, dim white = a scene, green = the scene that plays, blinking green = the
scene that is queued.

A clip that came from an imported song as a grid block has no length of its own: it plays as long as the first
imported scene that uses it. A delete or a move that would change that length is refused (NOT DELETED: SETS A
CLIP'S LENGTH, NOT MOVED: SETS A CLIP'S LENGTH). Changing the clip's LENGTH once on CLIP SETTING and saving stores
the clip with its own length; the scene is then free. Deleting or moving scenes drops a clip or scene reserved
while stopped.

## 6. Faders

The four faders set track levels: tracks 1 to 4, or 5 to 8 after FADER BANK. After a bank change, or when a
level was changed from elsewhere, a fader does nothing until you move it through the track's current level
(pickup); the screen shows the fader's value and the level it has to cross. A fader sends controller 7 on the
track's MIDI channel when LIVE OUT is on, and sets the internal level when the track's fader setting is on.

## 7. Mute

There are two mutes, and they look different everywhere.

| | Muted altogether | Internal sound only |
| --- | --- | --- |
| Set with | KNOB BANK + pad 9 to 16 (tracks 1 to 8), on any page | The mixer page; also how tracks 6 and 7 of a new project start |
| Silences | The SMK-37's own sound of the track and its song notes on MIDI out | The SMK-37's own sound only; the song still plays the track on MIDI out |
| Pads on CLIPS | Orange | Blue |
| KNOB BANK held, pads 9 to 16 | Orange | Blue |
| CLIPS screen | MUT in amber under the track; the track's clip number in amber | INT in blue under the track; the track's clip number in blue |
| Overview | MUTE in amber | INT in blue |
| Screen when set | TRACK MUTED - SOUND + MIDI | (the mixer page shows it) |
| The sound engine (tabby-v1.2.1) | The track's notes are held back before the engine | The track's song notes are not started on the engine: a muted sound costs it nothing. Unmuted, the track sounds from its next note (not in the middle of one). The same for a track silenced by another track's solo |

- While a track is muted altogether its clip keeps running, so unmuting brings it back in time. Notes already
  sounding end at their normal length. Controller and program events of a clip are still sent.
- KNOB BANK + pad on a track that is not muted mutes it altogether. KNOB BANK + pad on a muted track, of either kind,
  unmutes it. So a blue track takes two presses to turn orange.
- Unmuting a track on the mixer page unmutes it altogether.
- A track whose source is OFF has no internal sound; KNOB BANK + pad mutes its song notes (MIDI TRACK MUTED).

## 8. Transport and clock

| Situation | Behaviour |
| --- | --- |
| SEQ PLAY, song stopped | The song starts at scene 1, or at the scene reserved on the SCENES page; every track follows, except tracks with a reserved clip (4.1), which start on that clip. |
| SEQ PLAY, song playing | The song stops; every note is released. Launches and stops are forgotten. |
| CLOCK = MIDI | The song waits for the master's Start and follows its clock. SEQ PLAY arms and disarms. Launching works the same; the master cycle is counted from the master's Start. |
| End of the song with launched tracks | The launched tracks keep looping; the screen says SONG OVER. A scene recall or SEQ PLAY ends it. |

## 9. What the screen says when something cannot be done

| Message | Reason |
| --- | --- |
| RESERVED FOR SEQ PLAY | A clip pad was pressed while the song is stopped (information). |
| NO CLIP ON THIS PAD | The place is empty. |
| NO SUCH SCENE / NOT PLAYING | The scene pad has no scene, or the song is stopped. |
| NOT PLAYING | CHORD was pressed while the song is stopped. |
| TO SCENES AT CYCLE / ALL TO SCENES AT CYCLE | CHORD / KNOB BANK + CHORD was taken (information). |
| LAUNCH AT NEXT CYCLE / STOP AT NEXT CYCLE | The queue was taken (information, not an error). |
| TAKEN BACK | A queued launch or stop, or a reservation, was withdrawn. |
| SELECTED ONLY - TAKEN BACK | A pad was held for half a second: its clip is selected, its launch or stop withdrawn. |
| NO SONG - UPLOAD FROM WORKBENCH | SEQ PLAY with an empty song slot. |
| SONG STORAGE BUSY | SEQ PLAY while the storage is being scanned or compacted. |
| BLOCK READ ERROR / TOO MANY BLOCKS | A clip could not be read; the track plays silent. |
| ROW DECODE LATE | A clip was not ready at its boundary; it starts as soon as it is (counted as late). |

A message stays for one and a half seconds in an amber box across the top of the screen (section 20.3). Where a
message is written here with a dash (TAKEN BACK - FROM SCENE 1), the dash is a new line on the screen.

## 10. Not on the panel yet

Note repeat that repeats a whole chord (3.1 repeats one note and arpeggiates a chord). A song made on the panel (2.1) gets its name in the web workbench.

## 11. Differences from the MC-707

Checked against Roland's MC-707 Reference Manual (eng02) and the MC-707 Update manual (eng09, up to version 1.80).
"RM" and "UM" are those two; page numbers are the printed ones. This list is kept current: a deliberate difference
is added here in the same change that makes it.

Where the two agree:

- A clip pad pressed while the sequencer is stopped reserves the clip, and START / SEQ PLAY starts it (RM p. 12:
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
| Tracks follow the song | No song: every track plays the clip you chose until you choose another. | A track follows the scenes until you launch a clip on it, and CHORD sends it back. | The songs come from MIDI files as scenes that play through by themselves; hands are free for the keys. |
| Clips per track | 16. | 64 in four banks of 16. | Imported songs often have more than 16 different parts per track (SPEC 14.1 decision 4). |
| A blinking pad pressed again | Not described in either manual. | Takes the queued launch, stop or reservation back. | A wrong press before the bar line must be undoable without a second wrong sound. |
| Long press on a clip pad | No function. | Selects the clip without launching it. | The SMK-37 has no cursor buttons to select a clip for editing. |
| Selecting a track | [SEL] buttons, one per track. | KNOB BANK + pad 1 to 8, or K5. | No per-track buttons on the SMK-37. |
| Track play / stop pads | Mute mode: pads 1 to 8 start and stop tracks. | Press the playing clip to stop a track; CHORD to bring it back. Pads 1 to 8 under KNOB BANK select tracks instead. | The pads are needed for track selection. |
| Mute | One mute per track. | Two: altogether (orange) and internal sound only (blue). | The SMK-37 both makes sound and drives outside gear; a mixer mute must not silence the outside gear of existing songs. |
| Mute pads | Mute mode: pads 9 to 16, no KNOB BANK. | KNOB BANK + pad 9 to 16, on every page. | No separate pad-mode buttons; KNOB BANK keeps one gesture for all pages. |
| Scenes | SCENE buttons: press recalls; long press stores the playing combination; eight scenes (RM p. 35). | Pads on the SCENES page: press recalls; SEQ REC held with an empty pad (tabby-v1.4; before, a long press on an empty pad) stores the playing combination as a new scene; 128 scenes in banks of 16. | More scenes than buttons: imported songs are made of scenes. |
| Long press on a scene that exists | Writes it over with what plays (RM p. 35). | Recalls it, like a short press. Nothing is written over. | Unsafe on stage: a press held a little long would destroy a scene of the song. A new scene is always added at the end. |
| A stored scene's length | Scenes have no length: clips loop until you choose again. | The scene is as long as its longest clip and repeats until another scene is recalled; its clips keep their own lengths. | Scenes here are also the steps of a song that plays through; a stored one waits like an MC-707 scene. |
| Scene recall timing | On the master clock. | On the master clock, or at the end of the scene that plays (K4). | The older "row end" jump of songs made before scenes is kept. |
| Master clock length | SCALE and STEP LENGTH of the project (RM p. 51). | A number of steps stored in the song (16 unless the song says otherwise); set in the workbench. | One number per song is enough and an imported 3/4 song sets it by itself. |
| Pad colours | Chosen per project (RM, project settings). | Fixed. | No settings page for it; fixed colours can be learnt once. |
| START with CLOCK = MIDI | START/STOP still starts locally. | SEQ PLAY arms the song and the master's Start runs it; reservations are not used. | The song must stay in step with the master's position (SPEC 19.3). |
| [KNOB BANK] + START: back to the beginning | Yes (RM, shortcut list). | No. SEQ PLAY twice does it. | KNOB BANK + SEQ PLAY is not wired on the panel yet. |
| Step input: where and what | 16 step buttons choose the step, the pads in Note mode enter the notes (RM p. 27). | The 16 pads choose the step, the 37 keys enter the notes. | The SMK-37 has no step buttons, and it has a keyboard. |
| Ending step selection | The selected step button again, or [EXIT]. | The selected pad again. | No EXIT button. |
| Drum tracks (TR-SEQ REC) | Choose a pad, then the step buttons toggle it (RM p. 29). | PADS TOGGLE: play a key (or turn K5) for the note, then the pads toggle it. SCALE switches the two ways on any track. | Outside drum machines are driven from tracks that are not drum tracks inside the SMK-37, so the choice cannot follow the track type alone. |
| Step edit screen | [KNOB BANK] + step button; C1 note, C2 velocity, C3 start, C4 length (RM p. 28). | Selecting a step shows its notes at once; K1 chooses the note, K2 velocity, K3 start, K4 length. | One press less; K1 chooses among the notes instead of changing the pitch (replace a pitch with two keys). |
| Deleting a step's notes | [CLEAR] + the step button. | CHORD with the step selected. | No CLEAR button. |
| Tie / long note | Hold a pad and press [REST/TIE]. | K4 sets the length. | No TIE button. |
| Undo | 10 levels; cleared when the clip or track changes (UM, Ver. 1.80). | 4 levels; cleared when another clip is opened (SPEC 14.1, decision 8). | Memory: each level is a copy of the clip. |
| Saving | The project lives in memory until you save it. | A clip saves by itself ten seconds after the song stops, or with the > button; never while playing. | Flash writes stop the MIDI out for a moment, so they wait for the stop; saving by itself protects against a forgotten save. |
| Hearing an edit | At once. | A launched clip: at once (tabby-v1.4; until tabby-v1.3 from its next loop), when the edit is to notes, velocities, starts, lengths or controllers. A change of the clip's length, step size, direction, shuffle, chain or program waits for the loop's end; so does everything in the last two steps of the loop and during a take (a take's notes play from the next loop), and the rare edit that changes how the clip is held in memory (the fifth note on one step, the first controller event). A track following the scenes: from its next scene. | The player reads a prepared copy of the clip; it is swapped in mid-loop when the clip's shape is unchanged. A note just recorded and moved to the grid would sound twice if the take were heard at once. |
| Clip length (STEP LEN) | 1 to 128 steps, in the clip settings (RM, "STEP LEN 1-128"). | The same: LENGTH on CLIP SETTING, 1 to 128 steps. | Same. |
| Shortening a clip | Not described in either manual. | The notes past the new end are removed; undo (FX on the STEP page) brings them back. | The clip's event list holds only what plays; one undo level covers a slip of the knob. |
| SCALE, sub steps | On the device. | Not on the device. | Not planned yet. |
| Copying a clip | COPY and PASTE from the clip menu, onto any clip slot of the same track type (RM p. 15). | COPY TO PAD on CLIP SETTING, into an empty pad of the same track only. | No cursor buttons; writing over a clip is not offered because nothing on the panel brings a clip back. |
| Clips of different lengths | Each clip loops at its own length. | The same from tabby-v04.10. In scenes of an imported song an old-format (grid) block still plays the scene's length, as it always did. | Imported songs must sound as before. |
| SEQ REC while stopped | Recording is reserved; START begins it (RM p. 31: "If playback is stopped, press the [START/STOP] button"). | The same: SEQ REC arms, SEQ PLAY starts the song and the take. | Same. |
| What SEQ REC records into | A new clip in an empty place, or the selected clip (overdub). | The same: SEQ REC on a selected empty pad makes a new clip, one master cycle long. | Same. The MC-707 sets the new clip's length with the MEASURE buttons before recording; here LENGTH on CLIP SETTING changes it. |
| The clip must be playing | Yes: recording runs with the sequencer. | SEQ REC launches the clip on its track if it is not looping already, and the take starts when it does. | A take needs one fixed loop to place notes in; a track that follows the scenes changes clips under it. |
| Input quantize | [QUANTIZE] on / off; KNOB BANK + [QUANTIZE] for the settings (RM p. 32). | KNOB BANK + SEQ REC on / off, to the nearest step. | No QUANTIZE button; grid sizes other than a step come with SCALE. |
| Knob movements (motion) | The knobs' own parameters (filter, mod, effect), up to four per clip, as steps. | K1 to K4 on CLIPS send four controllers to the track (74, 71, 1 and 11, or the numbers set in the song); a take records them as events, thinned (one value per 1/32 note and the last value of a move), with pitch bend and channel pressure. | The sound is mostly outside gear here, so the knobs speak MIDI; clips hold timed events, not per-step lanes; thinning keeps a sweep from filling the clip. |
| A clip's sound | The clip holds its tone. | The clip holds a program change and a bank select, sent on the track's channel when the track enters the clip. | The tone lives in the outside gear; the SMK-37's own sounds belong to the project. |
| Outside controllers | CC 1, 2 and 4 can be recorded as motion (UM, Ver. 1.80). | Every controller below 120, pitch bend and channel pressure on the track's channel. | Outside gear is the main use here. |
| Undo of a take | UNDO takes the recording back; no undo while recording (UM, Ver. 1.80). | The same: a take is one undo level; no undo during a take. | Same. |
| Erasing during a take | Hold [ERASE] and a pad or key: that note is erased while held (RM p. 35). | FX held with a key (tabby-v04.21): that key's notes go as the clip passes them. | No ERASE button; FX is free during a take because undo is not allowed then. The key sounds. |
| A new project / song | A new project from the menu. | ACTIONS, NEW SONG, in an empty slot (tabby-v04.21). | The song is the unit here; the project holds the SMK-37's own sounds. |
| Step loop | Hold step buttons in step loop mode: those steps loop while held; playback goes on underneath (UM p. 20). | NOTE REPEAT + pad 9 to 12 on CLIPS: the last 1, 2, 4 or 8 steps of every playing track (tabby-v04.23). | The pads are clips here, not steps: the loop takes the steps just played. All tracks at once. |
| Note repeat | None (the MC-707 has SCATTER and the step loop instead). | NOTE REPEAT held: the track's arpeggiator while the button is down (tabby-v04.22). | The button is printed on the SMK-37; M-VAVE's firmware does it the same way. |
| Shifting a clip | Clip edit: shift the steps left or right. | KNOB BANK + OCTAVE- / OCTAVE+ on the STEP page, one step at a time (tabby-v04.21). | No edit menu on a small screen. |
| When the clip is full | Not described. | The take stops: CLIP FULL - REC STOPPED, the SEQ REC lamp goes out, the clip's pad shows red once; nothing is lost and undo still holds the clip before the take. | SPEC 14.2. |
| Count-in | Count-In Step, OFF or 1 to 128 steps; MIDI Start goes out after it (UM, Ver. 1.20 and its fixes). | COUNT-IN, OFF or 1, 2 or 4 master cycles; MIDI Start after it. Only before a take that starts the song (SEQ REC, then SEQ PLAY). | Whole cycles keep the take's first bar on the grid. With the song already running there is nothing to count in. |
| Metronome | ON or OFF with the master clock; type and level; sounds on the audio outputs (UM, Ver. 1.10 and 1.50). | CLICK: OFF, WHEN RECORDING or ALWAYS; output INTERNAL, MIDI NOTE (a channel and note you choose) or BOTH; CLICK LEVEL LOW, MID or HIGH for the internal click; one click sound. | The SMK-37's audio may feed the house mix, so the click for the stage is a MIDI note (SPEC 14.1, decision 7). |
| Where the click settings live | In the system settings. | In each song. | The device's settings sector has no room without a format change; a song's click note belongs to that song's rig anyway. |
| Transpose | Per clip, -12 to +12 (RM p. 50). | TRANSPOSE per clip, -12 to +12; applied when the clip plays, the stored notes stay. | Same. Applied at play time so that 0 always restores the clip. |
| Deleting a clip | Delete in the clip operations (RM pp. 14 to 16). | DELETE CLIP on CLIP SETTING, the > button twice within two seconds; only while stopped; never a clip a scene uses. | Stage safety: one wrong press must not take a clip out of a running set, and a scene must not lose its clip. |
| Unsaved clips | Any number. | Eight at a time (tabby-v1.3; one before). A copy or a new clip counts. Only the open clip has undo levels. | Memory: each waiting clip is a copy of its notes. |
| Shuffle | Per clip, -50 to +50 (RM p. 50, as the parity matrix records it). | SHUFFLE per clip: SONG or 0 to 50 percent. | No negative values: the engine's swing delays the off-beat step and cannot bring it early. SONG keeps old songs as they were. |
| Quantize at playback | Per clip and for the whole machine; the larger grid wins (RM p. 33). | PLAY QUANTIZE per clip only: OFF, 1/16, 1/8, 1/4. | No machine-wide setting: a clip keeps the feel it was given. |
| Step size of a clip | SCALE: 1/8, 1/16, 1/32 and triplet sizes (RM p. 50, as the parity matrix records it). | STEP SIZE: 1/16, 1/8, 1/32, 1/16T, 1/8T; only sizes that give the clip a whole number of 16ths. | Named STEP SIZE because SCALE is the printed name of a button. Whole 16ths keep every clip on the engine's step grid, so chains, the master cycle and recording work as before. |
| Direction of a clip | FWD, REV, FWD+REV, RND and more (RM p. 50, as the parity matrix records it). | DIRECTION: FORWARD, REVERSE, FWD THEN REV. | No random order: the clip is prepared once when the track enters it, and a new order for every pass would need the audio thread to do it. |
| Deleting and ordering scenes | Storing and recalling are described (RM p. 36); the parity matrix of 2026-11-07 found no delete or reorder. | FX twice deletes the selected scene, PARA + K1 moves it; both only while stopped. | Our scenes are a chain that plays in order, so their order matters; stopped only, because every track's position is counted in scenes while the song plays. |
| An armed take when the sequencer stops | Not described. | A take armed while the song played is taken off by the stop; a take armed while stopped waits for SEQ PLAY. | A lit SEQ REC lamp after a stop is easy to miss, and the next SEQ PLAY would record. The user's decision of 2026-11-17. |
| A scene pad while stopped | Reserves the scene; START plays it (RM p. 35 with p. 12). | The same from tabby-v04.12; the pad again takes the reservation back. | Same; taking back as for clips. |
| Scenes in order | None: a scene stays until you press another. | The scene chain: each scene plays TIMES times and the next one follows; THEN STAY makes a scene wait like an MC-707 scene; K3 holds the whole chain. | Imported songs play through by themselves; the hold and the pads are the manual override. |
| Clip chain: what follows | NEXT CLIP: STAY, STOP or CLIP 1 to 16 (UM, Ver. 1.30). | NEXT CLIP: STAY, STOP or a clip of the same track, 1 to 64; K1 steps through the pads that hold a clip. | 64 clips per track. |
| Clip chain: when | LENGTH: OFF (when the clip has played to its end) or 1 to 512 steps. | AFTER: CLIP END or 1 to 512 steps. | The same setting. It is called AFTER because LENGTH on the same page is the clip's length. |
| Clip chain: repeats | None: to play a clip four times before the next, set LENGTH to four times the clip. | TIMES, 1 to 64: the chain is due after TIMES x AFTER (or TIMES x the clip). | Our addition: the count stays right when the clip's length changes. |
| Which tracks a chain moves | Every track: there is no song. | A track that plays the clip launched: from its pad, reserved before SEQ PLAY, or reached through a chain. A track that follows the scenes takes its clips from the scenes; the chain waits. | One rule decides what a track plays next: the scenes, or its own chain. Launch the first clip of a chain by hand. |
| Chain timing | At the LENGTH, counted from the clip's start. | The same, to the unit: no extra wait for the master cycle. A chain whose times are whole cycles stays on the cycle because the launch landed on one. | Fill-ins shorter than a cycle must work, as on the MC-707. |
| Notes across a chain step | Cut (a fixed fault in Ver. 1.50 mentions it). | A note that sounds when the next clip starts plays out its length; STOP releases everything. | A held bass note should not be chopped by a clip change. |

## 12. STEP page: editing a clip

PARA on the CLIPS page opens it on the track's selected clip (bright pad; hold a pad half a second to select
without launching), or on the clip the track plays when none is selected. The screen shows the clip, the number of events (512 at most), the bar of 16 steps that is on the pads in two rows of
eight, the notes of the selected step, and the chosen note's velocity, start and length in the knob line (section
20.7). While the clip is unsaved the top line shows *SNG.

As on the MC-707, the step buttons choose where and the keyboard chooses what: there the 16 step buttons and the
pads in Note mode, here the 16 pads and the 37 keys.

### 12.1 Pads and keys

| Action | Result |
| --- | --- |
| Pad (PADS SELECT A STEP) | Selects the step; its notes are listed. The same pad again deselects it. |
| A key, with a step selected | Enters that note on the step, with the velocity you played, one step long. The same key again removes it. Several keys make a chord. The key sounds as always. |
| A key, with no step selected | Sounds, and becomes the current note (NOTE on the screen). |
| SCALE | Switches what a pad does: PADS SELECT A STEP, or PADS TOGGLE (the note). The page opens in TOGGLE on a drum track. |
| Pad (PADS TOGGLE) | Puts the current note on that step, or takes it off, and selects the step. One press per drum hit. |
| A pad past the clip's end | Nothing. Screen: PAST THE CLIP'S END. |
| KNOB BANK + pad 1 to 8 / 9 to 16 | Select track / mute, as everywhere. Selecting another track does not change the clip being edited. |

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
| K6 | The bar on the pads (same as OCTAVE- / OCTAVE+). |
| K7 | The selected step's probability: ALWAYS, or 1 to 7 (as stored in the song). |
| K8 | Master volume. |

### 12.4 Buttons

| Button | Press | With KNOB BANK |
| --- | --- | --- |
| OCTAVE- / OCTAVE+ | Previous / next bar of 16 steps. | tabby-v04.21: shifts the clip one step earlier / later. Every event moves (notes, controllers, step probabilities); what leaves one end comes in at the other; a note keeps its place inside its step. A run of shifts is one undo level. Not during a take. |
| CHORD | Clears the selected step. | Discards every unsaved change of the clip and returns to CLIPS. |
| FX | Undo, four levels. | Redo. |
| > button | Saves the clip into the song (only while the song is stopped; otherwise STOP TO SAVE). | same |
| SEQ PLAY | Starts and stops the song. | same |
| PARA | Back to CLIPS. The clip stays open and unsaved changes are kept. | same |
| BT | To CLIPS. | same |
| PATCH | To the overview. Unsaved changes are kept. | SRC: the source page. |

### 12.5 Hearing and saving

- Nothing is written to flash while a song plays (the rule of every page). An edit lives in memory, marked
  unsaved (*SNG in the top line), until it is saved: with the > button while stopped, or by itself ten seconds after the last
  change once the song is stopped (the screen says CLIP SAVED), or when you choose another song.
- An unsaved edit is what the song plays. A clip that is launched on its track (CLIPS: press its pad) plays each
  change at once (tabby-v1.4: a note put on a step that is still ahead sounds in this pass; a change of the clip's
  length or other settings, and a take, from its next loop). A track that follows the scenes plays the changed clip the next time a scene brings it.
- Eight clips can be unsaved at a time (tabby-v1.3; before, one). Opening, recording or making another clip while one is
  unsaved lets the first wait: it keeps playing as edited, loses its undo levels, and is written with the others at the
  next save. Opened again it is as you left it. With eight unsaved the ninth is refused (8 UNSAVED - STOP TO SAVE); before tabby-v1.3:
  save it (stop, > button) or discard it (KNOB BANK + CHORD).
- Unsaved changes are lost when the power goes off.
- A clip holds 512 events. The 513th is refused: CLIP FULL, and nothing changes.
- A clip that two tracks share (two tracks with the very same notes in an imported song) cannot be edited on the
  device: CLIP SHARED BY ANOTHER TRACK.
- A saved clip is stored in the new clip format (v3) with its own length: the steps it played with. It loops at that
  length wherever it plays (section 16).
- From tabby-v04.10 the > button also saves what was changed in the song itself (new clips, copies, stored
  scenes, the click settings); the screen says SAVED.

### 12.6 Messages

| Message | Reason |
| --- | --- |
| SELECT A CLIP FIRST | PARA on CLIPS with no clip selected and none playing on the track. |
| 8 UNSAVED - STOP TO SAVE | Eight clips are unsaved already; the page shows the open one. Stop the song: they are saved. |
| END THE TAKE FIRST | Another clip was asked for while a take is armed or runs. |
| CLIP SHARED BY ANOTHER TRACK | The clip's block is used by another track too. |
| NOTE ENTERED / NOTE REMOVED | A key changed the selected step. |
| NOTE ON THE STEP / NOTE OFF THE STEP | A pad changed its step (PADS TOGGLE). |
| CLIP FULL | The clip holds 512 events. |
| SELECT A STEP FIRST / STEP IS EMPTY / STEP CLEARED | CHORD. |
| UNDO / REDO / NOTHING TO UNDO / NOTHING TO REDO | FX, KNOB BANK + FX. |
| STOP TO SAVE / CLIP SAVED / NOTHING TO SAVE / SONG STORAGE FULL | the > button. |
| EDITS DISCARDED | KNOB BANK + CHORD. |
| PAST THE CLIP'S END | A pad beyond the clip's last step. |
| CLIP SHIFTED ONE STEP LATER / EARLIER / NO NOTES TO SHIFT / NOT DURING A TAKE | KNOB BANK + OCTAVE+ / OCTAVE- (tabby-v04.21). |

## 13. Recording

SEQ REC records what you play into a clip while it loops: notes from the keys and pads, and notes, controllers, pitch
bend and channel pressure arriving at MIDI in on the track's channel. What was in the clip stays (overdub).

### 13.1 Making a take

| Step | Press | Result |
| --- | --- | --- |
| 1 | On CLIPS select the clip (hold its pad, or launch it), or press an empty pad to record a new clip there. Or open a clip on the STEP page. | |
| 2 | SEQ REC | The song playing and the clip looping on its track: RECORDING at once, the SEQ REC lamp lights. The song playing but the clip not looping: the clip is launched, REC WHEN THE CLIP LOOPS, and the take starts on the next master cycle. The song stopped: REC ARMED - SEQ PLAY: GO. |
| 3 | SEQ PLAY (only if the song was stopped) | With COUNT-IN set (section 15) the click counts in first. Then the song starts with the clip looping on its track, and the take runs. |
| 4 | Play. | Each note is written when you let its key go, and the clip plays it from its next loop. |
| 5 | SEQ REC | REC STOPPED. The clip is unsaved (*SNG in the top line); it is saved as on the STEP page (12.5). |

The take also stops when the song stops, when another clip is launched on the track, when a scene is recalled, or
when CHORD sends the track back to the scenes.

### 13.2 Rules

| | |
| --- | --- |
| Input quantize | On at power-up: a note is recorded on the nearest step. Its length is what you played. KNOB BANK + SEQ REC switches it off (the note keeps the time you played it, to 1/480 of a step) and on. The STEP page shows Q ON or Q OFF. |
| The same note twice on a step | The later one replaces the earlier one. |
| Channel | Only messages on the track's input channel (SYNC / MIDI page, K1 IN CH) are recorded from MIDI in. |
| Controllers | A moving controller is recorded once per 1/32 note (240 units); when it stops moving for a 16th, its last value is recorded too. A value it already has is not recorded again. Up to eight controllers can move at once. |
| Not recorded | Polyphonic aftertouch, channel mode messages (controllers 120 to 127), program changes, more than 16 keys held at once. |
| Undo | A whole take is one undo level (FX on the STEP page, after the take). There is no undo during a take. A take in which nothing was played or cleared leaves no undo level. |
| Clearing notes (tabby-v04.21) | While a take runs FX is the clear button on every page. FX held and a key held (or a note held at MIDI in on the track's channel): each note of that pitch is taken out of the clip as the clip passes its start. One pass clears them all; a shorter hold clears only what was passed. The key sounds and is not recorded. Several keys at once. Works with any STEP SIZE and DIRECTION: what is cleared is what you hear go by. FX alone: HOLD FX + A KEY: CLEARS ITS NOTES. Cleared notes come back with the undo of the take. |
| Full | A clip holds 512 events. Held keys have their places reserved. When the clip is full the take stops by itself: CLIP FULL - REC STOPPED for two seconds, the SEQ REC lamp goes out, the clip's pad on CLIPS shows red once. Nothing already recorded is lost. |
| The song stops (tabby-v04.16) | A take that was armed while the song played and has not started (REC WHEN THE CLIP LOOPS) is taken off: SONG STOPPED - REC OFF, the SEQ REC lamp goes out. A take armed while the song is stopped waits for SEQ PLAY as before. A running take ends with the song, as it always did. |
| One take at a time | The take goes into the one open clip. Another clip being unsaved does not matter from tabby-v1.3: take after take, clip after clip, while the song plays on; up to eight unsaved clips (12.5). |
| A new clip | SEQ REC on a selected empty pad makes a clip one master cycle long and records into it. It is unsaved, and part of the song once saved; KNOB BANK + CHORD on the STEP page takes it out again before that. |
| Where a note lands | Where you heard it: the take is placed one audio block (3 ms) earlier than the device's clock says, because what you hear is one block behind it. Before tabby-v04.10 a take without input quantize played back 3 ms late (measured); BUILD.md 46 has the figure measured after the change. |

### 13.3 Messages

| Message | Reason |
| --- | --- |
| RECORDING / REC STOPPED | A take started / ended. |
| REC WHEN THE CLIP LOOPS | SEQ REC was pressed while the clip was not looping on its track; it has been launched. |
| REC ARMED - SEQ PLAY: GO | SEQ REC was pressed while the song is stopped. |
| INPUT QUANTIZE ON / OFF | KNOB BANK + SEQ REC. |
| HOLD FX + A KEY: CLEARS ITS NOTES | FX pressed during a take (tabby-v04.21). |
| CLIP FULL - REC STOPPED | The event cap. |
| SEQ REC: ON THE CLIPS OR STEP PAGE | SEQ REC on another page. |
| 8 UNSAVED - STOP TO SAVE / END THE TAKE FIRST / CLIP SHARED BY ANOTHER TRACK / SELECT A CLIP FIRST | As for PARA (12.6). |

## 14. CLIP SETTING page

FX on the CLIPS page opens it on the track's selected clip (or the clip the track plays). The screen lists one
setting per line, on four pages of at most eight lines (tabby-v1.1; three pages before): page 1/4 holds the clip's first
eight lines (LENGTH to COPY TO PAD), page 2/4 six more of the clip (TRANSPOSE, SHUFFLE, PLAY QUANT, STEP SIZE, DIRECTION,
DELETE CLIP), pages 3/4 and 4/4 the song's eleven lines (COUNT-IN to K2 CC, then K3 CC to EVENT LEAD). K5 walks through all twenty-five; the screen changes page by itself.
Without a selected clip the clip's lines show a dash and the song's lines still work.

| Control | Result |
| --- | --- |
| K5, OCTAVE- / OCTAVE+ | Chooses the line. |
| K1 | Changes the line's value by one. |
| K2 | Changes it by 16 (a bar of LENGTH). |
| > button | On COPY TO PAD: makes the copy. On DELETE CLIP: pressed twice within two seconds, deletes the clip. On every other line: saves the song (stopped only). |
| FX, PARA, BT | Back to CLIPS. |
| SEQ PLAY | Starts and stops the song. |
| PATCH | To the overview. |

| Line | Values | What it does |
| --- | --- | --- |
| NEXT CLIP, AFTER, TIMES | | The clip chain, section 17. They follow LENGTH on the page. |
| PROGRAM, BANK MSB, BANK LSB | | The clip's program change and bank, section 19. They follow TIMES. |
| LENGTH | 1 to 128 steps | The clip's length. It loops at this length wherever it plays. Shorter: the notes past the new end are removed (NOTES PAST THE END REMOVED; FX on the STEP page undoes). Longer: empty steps are added. Heard from the clip's next loop. Not during a take. |
| COPY TO PAD | a pad of the same track, 1 to 64 | the > button copies the clip to that pad if it is empty (the page offers the first empty one and says EMPTY or USED). The copy becomes the open clip, UNSAVED. A clip with unsaved changes must be saved first. |
| TRANSPOSE | -12 to +12 semitones | Moves every note of the clip when it plays; the notes stored in the clip are not changed, so 0 brings the clip back as it was. Heard from the clip's next loop. A note that would leave the MIDI range stays at its edge. Saved with the clip; FX on the STEP page undoes. Not during a take. For a drum clip leave it at 0. |
| SHUFFLE | SONG, 0% to 50% | SONG: the clip follows the song's swing, as every clip did before. A number: the clip's own shuffle; every second 16th step comes that much of a step late (50: a triplet feel), whatever the song does. Heard from the clip's next loop. One undo level per run of turns. (tabby-v04.17) |
| PLAY QUANT (play quantize) | OFF, 1/16, 1/8, 1/4 | When the clip plays, every note starts on the nearest line of that grid; a note exactly halfway goes to the earlier line, a note nearest the clip's end starts the clip. The stored notes keep their timing (the STEP page shows it), controllers are not moved, and of two notes of one pitch that land on one step the first plays. (tabby-v04.17) |
| STEP SIZE | 1/16, 1/8, 1/32, 16T, 8T (the triplets 1/16T, 1/8T); after it `=` and the clip's length in 16ths | What one step of the clip lasts: a 16th (as before), an 8th, a 32nd, a 16th triplet (two thirds of a 16th) or an 8th triplet (four thirds). K1 moves one size at a time and passes over a size that would not give the clip a whole number of 16ths from 1 to 128; the line shows what the clip plays (= nn 16THS). If LENGTH is changed afterwards so that the size no longer fits, the line says NOT THIS LENGTH and the clip plays as 16ths. The stored notes are not changed; the STEP page shows the clip's own steps, the play cursor and a take count in them; AFTER of a clip chain counts 16ths. A step's probability goes to the step where that step begins after the change. (tabby-v04.19) |
| DIRECTION | FORWARD, REVERSE, FWD+REV | REVERSE: the clip's steps play from the last to the first; a note keeps its place inside its step and its length. FWD+REV: forwards, then backwards: twice the length (with a step size: twice the played length); when that would be more than 128 steps or 512 events the line shows LONG and the clip plays forwards. The stored notes are not changed. The STEP page shows the clip's own steps: the play cursor walks backwards, and a take is recorded at the clip step that sounds. A step's probability stays with its step. (tabby-v04.20) |
| DELETE CLIP | | Press the > button: > AGAIN - DELETES THE CLIP. Press it again within two seconds: CLIP DELETED - SAVE THE SONG, and the pad is empty. Only while the song is stopped (STOP TO DELETE). A clip that a scene uses is not deleted: USED BY SCENE n - NOT DELETED. Chains that led to the clip do nothing afterwards. The song is UNSAVED until you save it; loading the song again before saving brings the clip back. |
| COUNT-IN | OFF, 1 CYCLE, 2 CYCLES, 4 CYCLES | Section 15. |
| CLICK | OFF, REC ONLY, ALWAYS | Section 15. |
| CLICK OUT | INTERNAL, MIDI, BOTH | Section 15. |
| CLICK CH | 1 to 16 | The MIDI click's channel (10 unless changed). |
| CLICK NOTE | 1 to 127 | The MIDI click's note (37 unless changed). |
| CLICK LEVEL | LOW, MID, HIGH | The internal click's level (MID unless changed). Each step is twice the one before. Section 15. |
| K1 CC to K4 CC | 0 to 127 | The controller number each of K1 to K4 sends on the CLIPS page (74, 71, 1 and 11 unless changed). Section 19.2. |
| EVENT LEAD (tabby-v1.0.2) | OFF, 1/32, 1/16, 1/8, 1/4 | How long before a scene's downbeat its row events (program changes, bank select, controllers) are sent. OFF (every song that never set it): at the downbeat, exactly as before. With a lead the scene's first notes do not wait behind the events on a shared DIN cable (about 0.8 ms a message). **The synth then changes its sound that much before the downbeat: the tail of the previous scene's last notes is heard on the new sound.** A device's gap from the rig profile counts from its own program change as before; the lead is added in front. It also leads the events of a track's queued launch or return to the scenes. Not at SEQ PLAY (SEND SETUP is for that), and not when a scene is recalled later than the lead before the bar (the events then go at once). Heard from the scene after the next. |

Messages: SELECT A CLIP FIRST, NOTES PAST THE END REMOVED, NOT DURING A TAKE, 8 UNSAVED - STOP TO SAVE,
THAT PAD HOLDS A CLIP, COPIED - THE COPY IS OPEN, CLIP SHARED BY ANOTHER TRACK, STOP TO SAVE, SAVED, NOTHING TO SAVE,
> AGAIN - DELETES THE CLIP, CLIP DELETED - SAVE THE SONG, USED BY SCENE n - NOT DELETED, STOP TO DELETE.

## 15. Click and count-in

The settings are part of the song and are saved with it. A song that was never set has no click and no count-in.

| | |
| --- | --- |
| The click | One on every quarter note of the master cycle; the first of a cycle is louder (MIDI velocity 127, the others 90; the internal click is higher in pitch). |
| CLICK | OFF: none. REC ONLY: while a take is armed or runs. ALWAYS: whenever the song plays. |
| CLICK LEVEL | The internal click only: LOW, MID or HIGH, each twice as loud as the one before. A song that was never set is on MID. HIGH is about as loud as a note of the built-in sounds; before tabby-v04.14 the click had half the level of LOW. |
| CLICK OUT | INTERNAL: a short click mixed into the SMK-37's audio output, after the master volume (K8). MIDI: a note on the chosen channel and note, on every MIDI output, sent in time like a song note and released a 32nd note later. BOTH. |
| COUNT-IN | With a take armed while the song is stopped (SEQ REC, section 13), SEQ PLAY first clicks for 1, 2 or 4 master cycles; then the song starts. The CLIPS page shows COUNT-IN and the quarter notes left. The count-in clicks whatever CLICK says, on the output CLICK OUT names. |
| MIDI Start | Goes out when the song starts, after the count-in. |
| SEQ PLAY during the count-in | Stops it; nothing was played. |
| CLOCK = MIDI | No count-in: the master starts the song. The click follows the song. |
| On stage | If the audio output feeds the house mix, use MIDI and point it at a click sound in your monitor mix. |

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

- The chain runs on a track that plays the clip launched: you pressed its pad, or reserved it and pressed SEQ PLAY, or
  another clip's chain led to it. A track that follows the scenes ignores chains.
- The step happens exactly TIMES x AFTER after the clip started. Launches land on the master cycle, so chains made of
  whole cycles stay on it; a fill-in of 4 steps is possible too.
- The next clip starts from its beginning and its own chain counts from there. A clip may name itself (it starts
  again) or lead back to an earlier clip (a loop of clips).
- Notes that sound when the next clip starts play out their length. STOP releases everything.
- The CLIPS page shows where a launched clip's chain leads, under the track's clip: +05 for clip 5, +ST for a stop.
- A press on a pad, CHORD or a scene recall takes the track out of the chain like out of any launched clip.
- A chain is heard from the clip's next loop when you change it while the clip plays; counted from where the clip
  was entered, and due at the end of the pass if that moment has passed.
- NEXT CLIP naming a pad whose clip is gone is read as STAY.
- Not during a take: NOT DURING A TAKE.

## 18. The scene chain

The scenes of a song play in order: scene 1, then 2, and so on. Each has a length and says what follows it. Both are
set on the SCENES page for the scene that plays; while the song is stopped, for the reserved scene (press its pad).

| Knob | Line on the screen | Meaning |
| --- | --- | --- |
| K1 | TIME nn | How many times the scene plays before the next one: 1 to 64 times its own steps. |
| K2 | THEN: NEXT / STAY | NEXT: the following scene comes when this one has played its length (after the last scene: the song's loop point, or the end; the screen says LOOP or END). STAY: the scene repeats until you recall another. |
| K3 | HOLD: RUN / HELD | The manual override. HELD: the scene that plays repeats, whatever its settings say, until you turn K3 back or recall a scene. Not stored; it is off after another song is loaded. |
| K4 | JUMP | When a recalled scene lands (section 5). |

- A pad always wins: recalling a scene jumps there (by the jump mode) and the chain goes on from that scene.
- TIMES and THEN are part of the song: unsaved (*SNG) until saved (stopped, > button, or by itself after ten
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
- The four controller numbers belong to the song (from tabby-v04.14): K1 CC to K4 CC on pages 3/4 and 4/4 of
  CLIP SETTING, 0 to 127 each, saved with the song. A song that was never set uses 74, 71, 1 and 11. The values the
  knobs start at stay as in the table whatever the number.

## 20. The screen: what every page shows, and at what size (tabby-v1.1)

Written before the pages were rebuilt, as the design to review (commit 418ba30), and corrected to what was built:
K / P marks on HOME instead of KEY1 PAD8, K8=0 in the top line instead of a standing MASTER MUTED box, messages on
at most three lines. The screen is 240 x 240 pixels. Up to tabby-v1.0.2
almost everything was drawn with the 5x7 font at scale 1 (5 x 7 pixels a character). From tabby-v1.1 nothing is.

### 20.1 Sizes and rules

| Size | One character | Fits on a line | Used for |
| --- | --- | --- | --- |
| Scale 2 | 10 x 14 px, 12 px apart | 20 characters | The smallest text on any page: labels, lists, hints. |
| Scale 3 | 15 x 21 px, 18 px apart | 13 characters | Stage information: song, scene, play / stop / record, tempo, the selected track, queued launches, every message and warning. |
| Scale 4 | 20 x 28 px | 10 characters | The start screen's name. |

- The font stays the 5x7 one, enlarged: at scale 2 and 3 its strokes are 2 and 3 pixels thick, which reads better at
  arm's length in the dark than a finer 8x16 font with 1-pixel strokes, and it costs no flash. No lowercase.
- Fewer things on a page. What went: the help lines at the bottom of every page (they are in Help and the guide),
  the song's block numbers, the pattern step cells and the pad pressure figure on HOME, the EVENTS count on SCENES.
- Numbers on small graphic cells (pads, steps, scenes) are scale 2 too; the cells are larger and stand in two rows
  of eight, like the pads (upper row = pads 1 to 8).
- Colours as before: a track's colour, green = plays, amber = queued / warning / muted altogether, blue = internal
  sound muted, grey = idle.

### 20.2 The top line (every page except PRESETS, SAVE PROJECT and the start screen)

```
120 PLAY T1  ARP
             *SNG
```

| What | Size | Detail |
| --- | --- | --- |
| Tempo | 3 | `120`; `---` while an outside clock is awaited. |
| State | 3 | `PLAY` green, `STOP` grey, `PAUS` amber, `REC` amber (a take runs), `ARMD` amber (record armed), `CNT4` amber (count-in, quarter notes left), `WAIT` / `LOST` amber (outside clock). It follows the song when a song plays, else the pattern sequencer. |
| Selected track | 3 | `T1` to `T8` in the track's colour. |
| ARP | 2 | Shown while the selected track's arpeggiator is on. `K8=0` in amber takes its place while the master volume (K8) is at zero: no sound at all. It is here and not a box, because a rig that plays outside gear only may leave K8 down. `CPU!` in amber (tabby-v1.2) while the CPU guard takes voices back (the last two seconds): with many parts on the internal sounds it does so about once a second for a whole song, and its message (CPU GUARD - VOICES ADAPTED) stood over the page all that time; nothing is lost when it works, so it is a mark and not a box. |
| Unsaved | 2 | Amber: `*SNG` a clip or the song waits for a save, `*PRJ` the project does, `*S+P` both. |

Gone from here: the pattern's step counter and its four page marks, the word LIVE, the word BPM.

### 20.3 Messages and warnings (every page)

A message (STOP TO SAVE, TRACK MUTED, STOP THE SONG FIRST ...) is a box across the top of the screen. From
tabby-v1.2.1 (the user's answers of 2026-11-20) PLAY / STOP / REC stands at the left end of its first line, in its own
colour on black, so the first line holds 9 characters and the others 13; and any press on the panel (a button, a pad,
a key, a knob) takes the message away at once. It lies over the top line
(tabby-v1.2, the user's answer of 2026-11-19; across the bottom in tabby-v1.1, where it covered the pads' cells): 33
pixels high for one line (the top line), 58 for two (and the title row), 82 for three (and the row under it), so that
no half letters stand under it: amber, black
letters at scale 3, one to three lines of 13 characters, broken between words (a build check wraps every message
the firmware can show and fails on a fourth line: tools/linux/notice-wrap.py). It covers what is under it for as long
as the message lasts (as before, about 1.5 seconds), then the page is drawn again. A question on ACTIONS (NEW SONG IN
SLOT 03?, ERASE OLD DATA?) is the same box and stays until answered. Messages that needed more lines were shortened;
the ones you meet while playing take two: TO SCENES AT CYCLE, EMPTY PAD / REC OR PARA, TRACK MUTED / SOUND + MIDI,
RESERVED FOR SEQ PLAY, TAKEN BACK / FROM SCENE 1, NOTE REPEAT 1/16, REC ARMED / SEQ PLAY: GO, CLIP FULL / REC STOPPED.

The standing explanations the bottom line used to carry (TRACK MUTED - GLOBE / PAD TO UNMUTE, OTHER TRACK SOLO,
TRACK LEVEL 0, TRACK OFF, KEY/PAD SAME CH) are gone: HOME shows each of these states in the track's own row, and
the top line shows K8=0 for a muted master.

KNOB BANK held: a grey box over the lower third, five lines at scale 2:

```
KNOB BANK +
PADS 1-8    TRACK
PADS 9-16   MUTE
PATCH SRC  SEQ MIDI
NOTE REPEAT KEY/PAD
```

A shortcut's message (TRACK SELECTED ...) appears as the amber box at the top; the list stays readable under it.

### 20.4 HOME

```
120 STOP T1
UNTITLED    KEY PLAY            scale 2: project name; what the focus plays (KEY PLAY, PAD NOTE, PAD DRUM)
[1]K PIANO 1  MUTE 100          eight rows, 23 px apart
[2]  303 SAW       100
...
[8]P 808 KIT  INT  100
```

| What | Size | Detail |
| --- | --- | --- |
| Track number | 3 | In a box; the selected track's box is filled with its colour. A green corner while MIDI arrives. |
| K / P | 2 | K on the track the keys play, P on the track the pads play; white for the one that has the focus. |
| Sound | 2 | 8 characters, the track's colour. |
| State | 2 | `MUTE` amber (altogether), `INT` blue (internal sound only), `SOLO`, `OFF`, `LIVE`, `EDIT`. |
| Level | 2 | The track's level, and a meter under the sound's name. |

No knob line: K1 changes the selected row's level, K4 the tempo in the top line; K2 (source) opens SOURCE as before.

### 20.5 CLIPS

```
CLIPS      BAR 0003             title scale 3, bar scale 2
S01 SCENE 002                   scale 3: song and scene (amber: NO SONG HERE, OLD DATA, STORAGE ERROR)
1 02   2 01   3 --   4 01       scale 3: the clip each track plays (number scale 2 in its colour)
  >05                 MUT       scale 3: what is queued or chained for it
5 01   6 01   7 01   8 01
              INT
[01][02][  ][  ][  ][  ][  ][  ]   the selected track's 16 pads of the bank, scale 2 numbers
[  ][  ][  ][  ][  ][  ][  ][  ]
SONG OVER   LATE 003            scale 2, only when there is something to say
```

| What | Size | Detail |
| --- | --- | --- |
| Track cell (8, in two rows of four) | 2 + 3 | Track number: scale 2, its colour, in a filled box when selected. Clip: scale 3; white = from the scene, green = launched by hand, `--` grey = silent; amber / blue when muted. |
| Second line of a cell | 3 | `>05` amber: queued launch. `>ST` amber: queued stop. `>SC` amber: goes back to the scenes. `+03` / `+ST` green: the clip's chain. Else `MUT` amber or `INT` blue for a muted track, else empty. |
| Pad cells | 2 | The place's number (01 to 64) when it holds a clip. Green = plays, amber = queued or stopping, grey = holds a clip, dark = empty; a white frame = selected. |
| Count-in, record | 3 | In the top line (CNT4, ARMD, REC). |

Gone: the per-track words SCENE / CLIP / STOP (the colour says it), SELECTED / STEPS / BLK (LENGTH is on CLIP
SETTING), the pad-range line (the cells carry their numbers).

### 20.6 SCENES

```
SONG 01                         scale 3
WRONG ROOM   BPM 120            scale 2: the song's name and its tempo
SCENE 001/002                   scale 3 (amber: OLD DATA, STORAGE ERROR, NO SONG HERE)
NEXT 002                        scale 3: NEXT nnn, TO nnn (amber, queued), AT nnn (amber, reserved while stopped),
                                LOOPING, LAST SCENE; with an outside clock ARMED: START?, WAIT PULSE, FOLLOWING ...;
                                amber: TOO MANY BLKS, BLOCK RD ERROR, DECODE LATE
X01/01 BAR 1/4 LT003            scale 2: pass / passes, bar / bars, the late count (LT) when not zero
01 01 -- 01 01 01 01 01         scale 2: the scene's clip for tracks 1 to 8, each in its colour
[01][02][  ][  ][  ][  ][  ][  ]   the 16 scenes of the pad bank, scale 2 numbers (last two digits)
[  ][  ][  ][  ][  ][  ][  ][  ]   green = plays, amber = queued or reserved, grey = exists, dark = none
TIME THEN HOLD JUMP             scale 2: K1 to K4
01   NEXT RUN  CYC              scale 2: STAY / NEXT / LOOP / END; RUN / HELD; CYC (next cycle) / END (scene end)
```

Gone: the block numbers, the LEN line, EVENTS, the three help lines.

### 20.7 STEP

```
STEP CLIP 02                    scale 3
BAR 1/1 LEN 016 Q ON            scale 2
EV 000/512 UN 0 RE 0            scale 2: events, undo and redo steps
[1][ ][ ][ ][2][ ][ ][ ]        the bar's 16 steps, scale 2: how many notes; green = plays now, amber = holds the
[1][ ][ ][ ][1][ ][ ][ ]        pad note, white = notes, a blue frame = selected
PADS SELECT  C4                 scale 2: what the pads do (SELECT / TOGGLE) and the note the last key gave
C4  E4  G4                      scale 2: the step's notes (up to 6), the chosen one white and underlined
STEP 001 PROB ALWAYS            scale 2
NOTE VEL  STRT LEN              scale 2: K1 to K4 for the chosen note
C4   100  +000 480
```

One line of note names replaces the six-line table; the chosen note's velocity, start and length are in the knob
line. A length of 10000 units or more shows in steps (`21S`).

### 20.8 CLIP SETTING

```
SETTING     C02 1/4             title scale 3; the clip (or SONG) and the page, scale 2
 LENGTH      016                eight lines a page, scale 2, 17 px apart; the chosen line on a grey bar
 NEXT CLIP   STAY
 ...
K5 LINE  K1/K2 VALUE            scale 2
> SAVES (STOPPED)
```

Four pages instead of three: 1/4 LENGTH to COPY TO PAD, 2/4 TRANSPOSE to DELETE CLIP, 3/4 COUNT-IN to K2 CC,
4/4 K3 CC to EVENT LEAD. Shortened: PLAY QUANT, CLICK CH, K1 CC to K4 CC; values: 016 (no word STEPS), 016 ST,
03 EMPTY / 03 USED, REC ONLY, MIDI, FWD+REV, `8T=024` (step size and its length in 16ths; amber with `!` when the
length does not allow it).

### 20.9 Pages with four knobs: SYNC / MIDI, MIDI TRACK, PARA (DX7 QUICK EDIT), FX, ARP

One line per knob instead of the small strip: the knob and its full name at scale 2, the value at scale 3 on the
right (scale 2 when it has more than four characters), 26 px apart, a bar in the knob's colour on the left.

```
SYNC / MIDI                     scale 3
K1 CLOCK        INT
K2 CLK IN      AUTO
K3 SWING         0%
K4 SEQ OUT       ON
K7 KEY OUT       ON
KNOB BANK+SEQ: TRACK            scale 2
SEQ+PARA: ACTIONS
```

| Page | Title (scale 3) | Lines | Scale 2 under them |
| --- | --- | --- | --- |
| SYNC / MIDI | SYNC / MIDI | K1 CLOCK, K2 CLK IN, K3 SWING, K4 SEQ OUT, K7 KEY OUT | the two shortcuts |
| MIDI TRACK | MIDI TRACK | K1 IN CH, K2 OUT CH, K3 SEQ, K4 OUT PORT | K5 TRACK, SEQ: SYNC |
| PARA | the voice's name; DX7 QUICK EDIT and 001/128 at scale 2 above | K1 ALGORITHM, K2 FEEDBACK, K3 TRANSPOSE, K4 LEVEL | K7 VOICE K6 BANK |
| FX | FX TRACK / FX SHARED / FX DELAY | the page's four | K6: TRACK/SHARED/DLY |
| ARP | ARP OFF / ARP ON / ARP ON HOLD | K1 RATE, K2 DIRECTION, K3 RANGE, K4 GATE (page 2: SWING, HOLD, OUT CH) | 1/2 NOTES K6 PAGE; TAP ARP: ON/OFF |

### 20.10 MIX (also while GLOBE is held)

```
MIX     K T1-4 F T1-4           title scale 3; which tracks the knobs and the faders move, scale 2
[M1][M2][M3][M4][M5][M6][M7][M8]   mute, scale 2, filled with the track's colour when on (upper pad row)
[S1][S2][S3][S4][S5][S6][S7][S8]   solo (lower pad row)
 |   |   |   |   |   |   |   |     eight level bars in the tracks' colours
T1   T2   T3   T4               scale 2: K1 to K4
100  100  100  100
```

### 20.11 ACTIONS, SOURCE, PRESETS, SAVE PROJECT, start screen

| Page | What shows |
| --- | --- |
| ACTIONS | The nine entries at scale 2, 17 px apart, the chosen one on a grey bar. Below, scale 2: `FREE 317K RECL 0K`, `USER 471040 READY` (or SCAN, OLD DATA, ERASING, ERROR, COMPACT), `K1/K5 PICK > DOES IT`. A question is the amber box (`NEW SONG IN SLOT 03?` / `> CONFIRMS`). |
| SOURCE | The chosen source at scale 3; SOUND SOURCE; the five sources in two columns at scale 2; CURRENT SOUND or NEW: RESETS TIMBRE; K2 TRACK: PROJECT / LIVE / OFF; K1 / PADS CHOOSE; > APPLY PATCH BACK. |
| PRESETS | PRESETS, the slot (01/16) and the stored name at scale 3; K5/K7 CHOOSE SLOT, SEQ PLAY: LOAD+RUN, > SAVE, PADS 1-16: LOAD at scale 2; EMPTY SLOT / LOAD FAILED amber at scale 3. |
| SAVE PROJECT | SAVE PROJECT at scale 3; SLOT 01/16 and what it holds at scale 2; the name being written at scale 3 with its cursor; K1 CURSOR K2 LETTER, K5/K7 CHOOSE SLOT, >: WRITE PROJECT at scale 2; OVERWRITE? amber at scale 3; the result at scale 3: READY, SAVING, SAVED green; STOP TO SAVE, NO VALID SAVE, OLD DATA, NO MEMORY, BAD PROJECT, FLASH BUSY, NO FLASH, FLASH ERROR amber. |
| Start screen | SMK37 at scale 4; OFFICIAL OPEN, the version and M-VAVE at scale 2. |

### 20.12 Drawing and timing

Unchanged in kind: a page is composed in bands of 16 rows, one band per pass, and a band waits when a MIDI event is
due (BUILD.md 36.6). A message appearing or leaving redraws the whole page, in bands like any page change.

### 20.13 Proof on the device (tabby-v1.2)

The LCD itself cannot be read back: it hangs on one data line that the SoC only drives (app/board/fm1_lcd_hw.h), so
no command can return what the glass shows. The nearest proof, built in tabby-v1.2:

- The firmware can keep a copy of every rectangle of pixels it hands to the LCD (after the start screen there is one
  place that does: the band painter). Remote command 29 {19} switches the copy on (29 KB of memory in fifteen small
  blocks, taken only while it is on), freezes it when no band is waiting, reads it, and gives the memory back. It only reads: nothing a
  player sees or hears changes.
- tools/linux/hw/screen-tour.json is one tour of every page of this section, at rest and while the song plays (44
  pictures: 22 and 22). tools/linux/hw/run-screen.py runs it on the device with remote panel keys and reads the copy
  for each picture; tools/linux/screens.mjs --match runs the simulator through the same tour with the same song,
  brings it to the same place in the song (bar, step, queued and launched clips, recording, message) and compares
  every pixel. It is a step of every release run (rc-validate.py: screen).
- Left out of the comparison, each named in the result: the eight level meters and MIDI-in marks on HOME (they follow
  the audio), FREE / RECL on ACTIONS and the stored project's name on PRESETS (the device holds the user's data; the
  simulator starts empty), the name of the last played note on STEP (the tests before played the keys), and in the
  top line the unsaved-project mark and CPU! where device and simulator differ in them (the device's project may
  wait for a save from before; the simulator has no CPU limit). The device's eight track levels are read and given
  to the simulator, so levels are compared. A track whose sound was edited by the tests before shows EDIT on HOME:
  which tracks is read off the device's HOME picture, the simulator is given the same, and the result names them.
- Not taken on the device: SAVE PROJECT and the message STOP TO SAVE. Both need the > button, and the device refuses
  a remote press of it by design (nothing is written to flash by a remote key). The simulator alone takes these
  two, and the manual says so under them.
- Not covered: the start screen (it is gone before a command can ask), PRESETS while playing, and
  the last step from the LCD's input to the glass: colours, contrast, viewing angle, a dead pixel. Test T97 of the
  guide is that look, by a person.
- The manual's pictures are these device pictures (docs/manual/screens/device.json says which build, and against
  which simulator frame each was proven). make workbench-test follows the device's tour (device-shots.json: where
  in the song each picture was taken) and fails when the simulator no longer draws that frame.
