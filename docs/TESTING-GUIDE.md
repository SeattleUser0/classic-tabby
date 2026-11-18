CLASSIC TABBY TESTING AND USER GUIDE
====================================

Version 4.0, 2026-11-18. For tabby-v04.22 on the M-VAVE SMK-37 Pro.
The user manual and the test checklist in one, for the person who plays and tests the device. No programming needed.
Sections 3 to 5 are the manual: setting up, every page of the device in the order you use it, and the workbench. Section 6 is the checklist.

This guide is for tabby-v04.22. If an older firmware is on your SMK-37, install tabby-v04.22 (section 3.2); section 2.2 lists what each release added. The guide is also one printable file: https://seattleuser0.github.io/classic-tabby/guide/classic-tabby-manual.pdf. New in tabby-v04.22: NOTE REPEAT repeats a held key or pad, and the switch between keys and pads is now KNOB BANK and NOTE REPEAT together (section 4.1). New in tabby-v04.21: FX with a key clears notes during a take (4.10), KNOB BANK with OCTAVE- or OCTAVE+ shifts a clip by a step (4.9), and NEW SONG in ACTIONS starts an empty song on the panel (4.11). New in tabby-v04.20: DIRECTION for each clip (section 4.11). New in tabby-v04.19: STEP SIZE for each clip (section 4.11). New in tabby-v04.18: the screen and this guide call every button by the word printed on it (see How to read this guide); nothing else changed. New in tabby-v04.17: SHUFFLE and PLAY QUANTIZE for each clip, and CLIP SETTING in three pages (section 4.11). New in tabby-v04.16: a scene can be deleted and moved on the SCENES page (section 4.11), and stopping the song takes an armed take off (4.10). New in tabby-v04.15: TRANSPOSE for each clip and DELETE CLIP (section 4.11). New in tabby-v04.14: CLICK LEVEL, your own controller numbers for K1 to K4 (sections 4.11 and 4.14), a Full backup that names a song it cannot read (5.5), and the workbench no longer drops a clip's chain or length when it rewrites a song.

Where to find what: playing a song from the pads is 4.7 and 4.8. Building and changing a song on the panel is 4.9 to 4.14. Projects, sounds and housekeeping are 4.1 to 4.6 and 4.15 to 4.18. The workbench is section 5.

How to read this guide
----------------------

- K1 to K8 are the eight knobs, counted from the left.
- The firmware calls K5 SELECT, K6 PAGE, K7 PRESETS and K8 MASTER. This guide uses K5, K6, K7 and K8.
- Buttons are called by the words printed on them. Left group, under the screen: KNOB BANK, FADER BANK, <, >, OCTAVE- and OCTAVE+. Right group: ARP, NOTE REPEAT, SCALE, CHORD, GLOBE and BT in the upper row, PATCH, PARA, FX, SEQ, SEQ PLAY and SEQ REC in the lower row. The device screen uses the same words.
- "<" and ">" are the two arrow buttons of the left group. ">" is the button that saves and confirms. "<" does what PATCH does when pressed alone.
- The printed words come from M-VAVE's own firmware and often say little about what a button does here: KNOB BANK is the shift button (hold it for a second function), CHORD sends a track back to the scenes, PARA opens the STEP page, GLOBE the mixer. Guides before version 3.6 and firmware before tabby-v04.18 used other names: SHIFT for KNOB BANK, HOME for PATCH and <, "the 4th button in the left group" for >, OCT - and OCT + for OCTAVE- and OCTAVE+, PAD / STEP for NOTE REPEAT, SCL for SCALE, ENV for CHORD, MIX for GLOBE, HOME / SRC for PATCH, EDIT for PARA, PLAY for SEQ PLAY and REC for SEQ REC.
- "Press" means a short tap. "Turn K5 right" means clockwise.
- Text in capitals, like SONG MODE, is what the device screen shows.
- Every device step was run in the simulator against the current source. A step that could not be run there ends with the words "not checked in simulator" in square brackets. The simulator has no USB, no real synths and no flashing, so those steps are always marked.


1. WHAT CLASSIC TABBY IS TODAY
==============================

Classic Tabby is a performance MIDI sequencer firmware for the SMK-37 Pro. It started as M-VAVE's open firmware, SMK37 Open V01, and is built and changed by you on Linux.

It works like a Roland MC-707 that plays outside gear over MIDI. A song has 8 tracks. Each track has clips: short patterns of notes and controller moves, up to 64 per track, each 1 to 128 steps long. A scene is one clip for each track. The scenes of a song play in order, or you call them from the pads. Everything you launch waits for the next master cycle (one bar unless the song says otherwise), so it always lands in time. The device holds 16 songs.

You can start a song two ways. Import a MIDI file in the workbench, which is a web page in Chrome, and send it to the SMK-37 over USB. Or build it on the panel: make a clip on an empty pad, record into it or enter notes step by step, copy it, change its length, chain clips, store what plays as a scene. Both ways give the same kind of song, and you can mix them.

On stage you play it from the pads. The CLIPS page launches and stops clips on a track. The SCENES page recalls scenes. KNOB BANK and a pad select or mute a track. Four knobs send controllers to your gear, and a take records them.

The SMK-37 is the clock master. It sends MIDI Clock, Start, Stop and Song Position to your gear, and each note leaves within about 2 ms of its time. It can also follow a clock from USB or Bluetooth. A clip can send a program change and a bank select when its track enters it; a scene can send program changes and controller values to your synths and effects when it starts.

The SMK-37 still has its own sounds: DX7 FM (called FM6 here), BASS 303, DRUM 808, PSG and PLUCK. In a song they let you hear a part before you give it to outside gear. The keys and pads also play live.

This guide and the device screen call every button by the word printed on it (from tabby-v04.18). docs/STICKERS.md in the source has a printable sticker sheet that says what each button, knob and fader does in Classic Tabby.

2. WHAT CHANGED
===============

2.1 Changed from M-VAVE's stock Open V01
----------------------------------------

Added:
- Songs made of clips and scenes: 16 songs, 8 tracks, up to 64 clips per track and 128 scenes per song. A clip holds up to 512 events and 128 steps.
- The CLIPS page: launch, stop and select clips from the pads, in time with the master cycle. The SCENES page: recall, store and chain scenes.
- The STEP page: edit a clip's notes on the pads and keys, with undo. Recording into a clip from the keys or from outside gear, with input quantize, a click and a count-in.
- CLIP SETTING: a clip's length, its chain (what follows it), its program and bank, copies; the song's click, count-in and the controller numbers of the four knobs.
- MIDI file import in the workbench.
- Exact note timing, to 1/480 of a step, sent within about 2 ms of the due time.
- The song follows an outside MIDI clock (Start, Stop, Continue, Song Position).
- Scene events: program changes, bank selects and control changes sent when a scene starts.
- A rig setup and a device library in the workbench for your gear.
- Full backup and restore of the whole device from the workbench.
- A SYNC / MIDI page on the SEQ button.
- A Diagnostics panel with timing counters.
- STOP TO SAVE: no flash writes while something plays.
- The version name on the boot screen and in the workbench.
- Remote control over USB, so tests run with nobody at the panel.

Removed:
- The sampler and its sample bank.
- The DX7 user voice library on the device.
- The stock pattern sequencer and its pages (STEP DETAILS, LOCKS, RHYTHM, pad-step mode). Clips are edited on the STEP page and recorded with SEQ REC instead.
- DX7 operator editing on the device. The DX7 quick page stays.
- The Bluetooth page and the project NAME page on the device. Both moved to the workbench.
- The factory scenes. PATCH on the overview lists your 16 project slots.
- The old Enable force flash button on the update page.

2.2 What each Classic Tabby release changed
-------------------------------------------

Oldest first. The last line is the release this guide is for.

- tabby-v01.0: Stock Open V01, built on Linux, nothing changed.
- tabby-v02.0: Song mode, MIDI file import, row events and the device library. The sampler and the DX7 user library are removed.
- tabby-v03.0: Exact note timing, track launching, lead time per channel in the rig, Bluetooth settings in the workbench.
- tabby-v03.1: A new manual in the Help tab. The version shows on the boot screen and in the workbench.
- tabby-v03.2: The Wrong Room rig profile, four new device profiles, the importer sets the output channel from the file, the MIDI writing guide.
- tabby-v03.3-diag: Full backup and restore, the timing counters, the Diagnostics panel. A test build.
- tabby-v04.0: Storage moved (back up first). Step editing and recording removed. The SYNC / MIDI page. STOP TO SAVE. ERASE OLD DATA. A permanent recovery page for every build.
- tabby-v04.1: Timing fixes: the screen and workbench work wait their turn so MIDI goes out first. Knob and button names fixed. The update page is safer: no force flash button.
- tabby-v04.1.1: Same firmware as v04.1. English-only workbench, corrected Help, this guide.
- tabby-v04.2: Fast MIDI on by default: one line leaves about 3.7 ms after it is due instead of about 12 ms. Remote control over USB for tests. Stale screen texts fixed. The ACTIONS list has a new last entry, A2 FAST MIDI.
- tabby-v04.3.1: External clock follow in song mode (Start, Stop, Continue, Song Position Pointer, clock loss). (tabby-v04.3 was never released.)
- tabby-v04.4: Timed MIDI. A song's notes, row events and clock bytes are sent at their due times by a 0.5 ms timer: one line stays within about 1.9 ms and eight lines within about 3 ms on DIN and USB, on every screen page (before: about 5 to 7.5 ms, depending on the page). Earlier notes said the device sent no replies over USB with CLOCK on MIDI: that was a fault of the developer's measuring tool, not of the device; the workbench and Firmware Update work with CLOCK on INT or MIDI on every version.
- tabby-v04.5: Larger clips. A track's part in a row can now hold any number of notes on a step (it was four), controller, pitch bend and aftertouch events from the MIDI file, a program and bank of its own, and rows can be up to 128 steps (8 bars of 4/4; it was 64). The importer uses the new clip form only where a part needs it. Old songs play as before.
- tabby-v04.5.1: The page of tabby-v04.5 could not import a part that needs the new clip form (it said "clip-v3.js not loaded"); fixed. The firmware is the same.
- tabby-v04.6: Scenes and clips. A song can be stored as scenes: each track has up to 64 clips, a scene names one clip per track, and the song has a master cycle that launches and stops land on (one bar of the file's metre; 12 steps for a waltz). The importer writes scenes with clips of up to 8 bars. Old songs play as before and are not changed. A controller at a row start is no longer sent twice.
- tabby-v04.7: Clip launching. BT opens the CLIPS page: the pads show the selected track's clips (off empty, white stopped, green playing, blinking queued, orange muted), a pad launches or stops its clip on the next bar line, a held pad selects it. The pads of the SONG page light up and recall scenes. KNOB BANK and pad 9 to 16 now also holds the track's song notes back on MIDI out. See 4.8.
- tabby-v04.7.1: A clip pad pressed while the song is stopped reserves its clip; SEQ PLAY starts it (as on the MC-707). The two mutes look different: orange pads and MUTED ALL for KNOB BANK and pad (sound and MIDI), blue pads and MUTED INT for a mixer mute (the SMK-37's own sound only).
- tabby-v04.8: The STEP page. PARA on the CLIPS page opens the selected clip: the pads are the 16 steps of a bar, a pad selects a step, keys enter and remove notes on it, K1 to K4 set a note's velocity, start and length, FX undoes. You hear the change without saving; the clip is saved when the song is stopped. See 4.9.
- tabby-v04.9: Recording. SEQ REC on the CLIPS or STEP page records what you play, on the keys or from outside gear at MIDI in, into the selected clip while it loops. Notes land on the nearest step unless you switch input quantize off (KNOB BANK and SEQ REC). FX undoes a whole take. See 4.10.
- tabby-v04.9.1: PATCH works on the STEP page while a clip is open (in tabby-v04.8 and tabby-v04.9 it did nothing there; PARA or BT were the way out).
- tabby-v04.9.2: After you stop the song, no pad on the CLIPS page stays green, and the clip you had launched can be reserved for the next SEQ PLAY like any other (before, its pad stayed green and a press did nothing).
- tabby-v04.9.3: Diagnostics shows the flash chip: its JEDEC ID and size, as the device read them at start-up (5.6). A report only; nothing depends on it.
- tabby-v04.10: SEQ REC or PARA on an empty pad makes a new clip. FX on CLIPS opens CLIP SETTING: LENGTH, COPY TO PAD, and the song's COUNT-IN and CLICK. Holding an empty pad on SCENES stores what plays as a new scene. Every clip loops at its own length. A take is placed 3 ms earlier, where you heard it (4.11).
- tabby-v04.11: clip chains: CLIP SETTING has NEXT CLIP, AFTER and TIMES, so a launched clip leads to the next one by itself (4.12).
- tabby-v04.11.2: Full backup, verify and restore work on a song that has a scene stored on the panel. On the pages of tabby-v04.10, tabby-v04.11 and tabby-v04.11.1 the backup stopped at about 66 % for such a song, with "Scene n is invalid" in the status line. The firmware is tabby-v04.11's.
- tabby-v04.12: the scene chain: on SCENES K1 sets how many times a scene plays, K2 what follows it, K3 holds the chain; a scene pad pressed while stopped is where SEQ PLAY starts (4.13).
- tabby-v04.13: CLIP SETTING has PROGRAM, BANK MSB and BANK LSB for each clip; on CLIPS K1 to K4 send controllers 74, 71, 1 and 11, and a take records them (4.14).
- tabby-v04.14: CLICK LEVEL (LOW, MID, HIGH) for the internal click; K1 CONTROLLER to K4 CONTROLLER choose what the four knobs on CLIPS send, per song; CLIP SETTING is two pages. The Full backup names a song the page cannot read and stops. The workbench importer keeps a clip's own length and its chain when it rewrites a song (before, it dropped them).
- tabby-v04.15: TRANSPOSE on CLIP SETTING moves a clip's notes by up to 12 semitones either way when it plays. DELETE CLIP takes a clip out of the song (two presses, stopped, never a clip a scene uses).
- tabby-v04.16: on SCENES, with the song stopped, FX twice deletes the selected scene and PARA held with K1 moves it earlier or later. Stopping the song takes an armed take off (SONG STOPPED - REC OFF). The guide as one printable PDF.
- tabby-v04.17: SHUFFLE (the clip's own swing, 0 to 50 percent, or the song's) and PLAY QUANTIZE (OFF, 1/16, 1/8, 1/4) on CLIP SETTING; they change how the clip plays, not the notes in it. CLIP SETTING has three pages.
- tabby-v04.18: the screen, Help and this guide call every button by the word printed on it (KNOB BANK, <, >, OCTAVE-, OCTAVE+, NOTE REPEAT, SCALE, CHORD, GLOBE, PATCH, PARA, SEQ PLAY, SEQ REC). No function changed.
- tabby-v04.19: STEP SIZE on CLIP SETTING: what one step of the clip lasts: 1/16, 1/8, 1/32, or the triplet sizes 1/16T and 1/8T. The MC-707 calls it SCALE.
- tabby-v04.20: DIRECTION on CLIP SETTING: a clip plays FORWARD, in REVERSE, or FWD THEN REV (forwards, then backwards).
- tabby-v04.21: during a take, FX held with a key clears that key's notes as the clip passes them. On the STEP page KNOB BANK with OCTAVE+ or OCTAVE- shifts the whole clip one step later or earlier. NEW SONG in ACTIONS makes an empty song in an empty slot.
- tabby-v04.22: NOTE REPEAT does what is printed on it: held, a key or pad you hold repeats at the ARP rate. The switch between keys and pads, which was a tap on NOTE REPEAT, is now KNOB BANK and NOTE REPEAT together.


3. SETUP
========

3.1 Wiring
----------

Use this wiring for testing.

1. USB: plug the SMK-37 Pro straight into the MacBook with its USB cable. No hub. Do not plug in the FM-1 or the AUDIO4c while you update.
2. MIDI out to your gear, the simple way: use the TRS jack on the SMK-37 and a Type A TRS-to-DIN adapter. Plug the DIN end into the H4MIDI WC, DIN IN 1. [not checked in simulator]
3. MIDI out, the better way for timing: plug the SMK-37 USB cable into the USB host port of the H4MIDI WC. The H4MIDI sends each channel to its own DIN output. One DIN cable per device. [not checked in simulator]
4. The TRS jack only sends. It cannot receive MIDI. A clock from a DIN cable cannot come in through it. Clock must come in over USB or Bluetooth.
5. Audio: take the SMK-37 audio out to your mixer or interface as usual.

Your H4MIDI settings for the Wrong Room rig are in the MIDI guide, section 14. Keep that guide next to you.

3.2 Installing from the MacBook in Chrome
-----------------------------------------

Use desktop Chrome on the MacBook. Close other MIDI programs and other workbench tabs first. The SMK-37 must be plugged in, powered and idle.

Install is only needed when you want a new firmware. Install tabby-v04.22 to get everything in this guide. With older firmware the screen still shows the old button names (the list is in How to read this guide). Take a Full backup first (Projects and sounds tab). Storage does not move.

1. Open https://seattleuser0.github.io/classic-tabby/ in Chrome.
2. Make a Full backup first (section 5.5). Keep the file.
3. Click the Device update tab. Check the Version line.
4. Click Connect device. Allow MIDI with SysEx when Chrome asks.
5. Read the identity line. It must say SMK-37 Pro_8000001. Anything else: stop.
6. Tick the box saying you have made a backup.
7. Click Start update. Keep the tab open. Keep power and USB connected. It takes one to two minutes.
8. When the page says done, the SMK-37 restarts. The boot screen shows SMK37, OFFICIAL OPEN and the version.

Never tick Force flash for a Classic Tabby update. It is only for the first move from the factory firmware.

Going back to an older build: songs saved on the device by tabby-v04.10 or later cannot be read by older firmware. Go back to an older build only with a Full backup made before tabby-v04.10: install the older build from its page in the builds list, then restore that backup. Songs made since then stay in your newer backup files; they play again when you return to the newer build and restore it.

Release candidates: a page whose address ends in -rc1, -rc2 and so on, with a red line at the top, is a build under test. Use the main page unless you were asked to try one.

[not checked in simulator] (the whole of 3.1 and 3.2: the simulator has no USB)

3.3 If an install stalls
------------------------

An install has stalled when the progress bar stops for more than two minutes, or the page says the device stopped asking for data.

1. Do not click Start update again in that tab. Close the tab.
2. Switch the SMK-37 off. Wait five seconds. Switch it on. Keep the USB cable.
3. Open the main page again, or the permanent page of the build: https://seattleuser0.github.io/classic-tabby/builds/ . The list there has one page for every build.
4. If you open a different build's page, it tells you which build the SMK-37 is waiting for and gives you a link. Open that page.
5. Click Connect device, then Start update. Confirm the model SMK-37 Pro when asked. The write carries on.
6. If the SMK-37 shows nothing and does not appear as a USB MIDI device after the power cycle, stop. Do not try again. Report it.

[not checked in simulator]


4. USING THE DEVICE
===================

4.1 Playing keys and pads
-------------------------

At start, the keys play track 1 on MIDI channel 1. The pads play track 8 on channel 10. The bottom line of the overview says KEY T1 CH01 and PAD T8 CH10.

1. Press PATCH until the overview shows eight tracks.
2. Press a key. You hear track 1. MIDI goes out on channel 1. The lowest key is note 48 (C3).
3. Press pad 1. You hear the 808 kick on track 8. MIDI goes out on channel 10, note 36.
4. Press OCTAVE+ to move the keys up one octave each press. Press OCTAVE- to move down.
5. Hold KNOB BANK and tap NOTE REPEAT to move the playing focus to the pads (tabby-v04.22; before that a tap on NOTE REPEAT alone). The top shows PAD DRUM and the bottom says PAD READY - PARA / FX. Do it again to go back to the keys.
6. Hold KNOB BANK. The screen lists the shortcuts. Pads 1 to 8 select a track. Pads 9 to 16 mute or unmute a track.

On the KNOB BANK list, the line NOTE REPEAT KEY-PAD is this switch.

Note repeat (tabby-v04.22)
1. Hold NOTE REPEAT. The screen says NOTE REPEAT 1/16 - HOLD A KEY OR PAD and the button lights.
2. Hold a key, or a pad on a page where the pads play (the overview). The note comes again and again, as loud as you played it, for as long as you hold both. Let NOTE REPEAT go and it stops.
3. While you hold NOTE REPEAT, turn K1 for the rate: 1/4, 1/8, 1/16 or 1/32.
4. It works on every page, also on CLIPS and STEP, where the keys play. The page does not change.
5. Note repeat is the track's arpeggiator, switched on for as long as you hold the button. So it uses the ARP settings of the track (hold ARP to see them): RATE is the rate you set with K1, GATE the length of each note, SWING its swing. One held key repeats. Several held keys take turns, in the ARP's DIRECTION, and with RANGE above 1 OCT a key also climbs octaves: set RANGE to 1 OCT for plain repeats. A track whose ARP is already on is not changed (ARP IS ON: IT REPEATS ALREADY).
6. Press NOTE REPEAT first, then the key: a key that is already down when you press NOTE REPEAT is cut off. A take records the key you hold as one long note, not the repeats. The project shows as changed after a note repeat, because the ARP switch belongs to the project.

4.2 Choosing an FM6 (DX7) sound and its quick page
--------------------------------------------------

1. On the overview, turn K5 to select the track you want.
2. Hold KNOB BANK and press PATCH. (The < button does not open this page.) The SOUND SOURCE page opens.
3. Turn K1 until DX7 FM is lit. Or press pad 1.
4. Press the > button. The page says SOUND SOURCE APPLIED.
5. Press PARA. The DX7 QUICK EDIT page opens. It shows the voice number out of 128 and the voice name.
6. Turn K7 to choose the voice. Turn K6 to change the bank, A to D.
7. Turn K1 for ALGORITHM, K2 for FEEDBACK, K3 for TRANSPOSE and K4 for LEVEL.
8. Press PARA again to go back. A star near the top means the track has unsaved changes.

On any other sound, pressing PARA only says VOICE EDIT MOVED TO WORKBENCH. Other sounds are edited in the workbench.

4.3 Track roles: PROJECT, LIVE, OFF
-----------------------------------

- PROJECT: the track follows the project you load.
- LIVE: the track keeps its sound and held notes when you load another project.
- OFF: the track is switched off and frees its memory.

1. Hold KNOB BANK and press PATCH. The SOUND SOURCE page opens for the selected track.
2. Turn K2 right. TRACK goes PROJECT, then LIVE, then OFF. Turn K2 left to go back.
3. The screen explains each choice under the line. Press PATCH to leave.

4.4 MIDI channels and output per track
--------------------------------------

Each track has its own input channel, output channel, local or MIDI choice and port.

1. Hold KNOB BANK and press SEQ. The MIDI TRACK page opens.
2. Turn K5 to choose the track. The top line shows T1 to T8.
3. K1 IN CH is the channel the track listens to from USB or Bluetooth.
4. K2 OUT CH is the channel the track sends on. When it changes, the screen says MIDI SETTING - NOTES RELEASED.
5. K3 SEQ: LOCAL plays the built-in sound only. BOTH plays the built-in sound and sends MIDI. MIDI sends MIDI only.
6. K4 OUT PORT: ALL sends on USB, Bluetooth and the TRS jack. OFF sends nothing from this track. Turn K4 left for OFF.
7. Press PATCH to leave.

The port setting is the same for all tracks. A song's own output channel for a track wins while the song plays. When the song stops, the device setting is back.

4.5 The SYNC / MIDI page: clock source, tempo, swing
----------------------------------------------------

1. Press SEQ on any page. The SYNC / MIDI page opens.
2. K1 CLOCK: INT uses the SMK-37's own clock. MIDI waits for an outside clock. Turn K1 right for MIDI, left for INT.
3. K2 CLK IN: AUTO, USB, BLE or DIN. Choose USB or BLE for a clock from outside. Do not choose DIN: the TRS jack receives nothing.
4. K3 SWING: 0 to 50 percent. It is saved in the project.
5. K4 SEQ OUT: OFF sends no notes and no clock. ON sends notes and clock. CLOCK sends clock and Start and Stop only.
6. K7 KEY OUT: ON or OFF. It switches the MIDI out of the keys and pads.
7. The tempo is not on this page. It says BPM: SET ON OVERVIEW K4.

With CLOCK on MIDI, the screen says WAIT MIDI CLOCK until a clock arrives. Songs cannot start then. Keep CLOCK on INT for songs.

Tempo: on the overview turn K4. Or tap the tempo: hold PATCH and tap SEQ. The first tap says TAP AGAIN / PATCH+SEQ.

4.6 The ACTIONS menu
--------------------

1. Press SEQ and PARA together. The ACTIONS menu opens.
2. Do not hold SEQ alone. It does not open ACTIONS. The SYNC / MIDI page of tabby-v04.2 says SEQ+PARA: ACTIONS (older firmware said HOLD SEQ: ACTIONS, which was wrong).
3. The first line shows the storage: USER 471040 SONG READY. FREE and RECLAIM show at the bottom.
4. Turn K1 or K5 to choose an entry. Press the > button to run it. PATCH leaves.
5. The entries are: COPY TIMBRE, PASTE TIMBRE, STOP ALL / REWIND, ERASE OLD DATA, SONG MODE, COMPACT SONG STORAGE, SEND SETUP, NEW SONG (tabby-v04.21; section 4.11) and A2 FAST MIDI: ON (or OFF). The last one switches fast MIDI for this session only.
6. STOP ALL / REWIND stops all sound and rewinds. It is in the list; on its own it shows DONE.

4.7 Song mode: choose a song, play, recall a scene
--------------------------------------------------

You need a song on the device first (section 5.3).

1. Press SEQ and PARA together to open ACTIONS.
2. Turn K5 until SONG MODE is lit. Press the > button. The SONG page opens.
3. Turn K5 or K7 to choose song 1 to 16. An empty slot says NO SONG HERE - UPLOAD FROM THE WEB WORKBENCH.
4. Make sure the project you want is loaded. The song uses whatever project is loaded. It does not load one for you.
5. Press SEQ PLAY. The page says PLAYING. SCENE, X (the pass of the repeat) and BAR show where it is. NEXT shows what follows. Press SEQ PLAY again to stop. A scene is one row of the song: one clip for each track.
6. To recall a scene: press a pad. The pad number is the scene on the pad page. The page shows TO SCENE n in amber and the pad blinks green. The scene starts on the next bar. Then the page shows the new SCENE and its pad is green.
7. K4 switches JUMP: NEXT CYCLE and JUMP: SCENE END. [not checked in simulator]
8. OCTAVE+ and OCTAVE- move the pad page by 16 scenes. [not checked in simulator]
9. A pad with no scene, or a press while the song is stopped, says NO SUCH SCENE / NOT PLAYING.
10. Press PATCH to leave the page. The song keeps playing.

With CLOCK on MIDI (tabby-v04.3.1 and later) SEQ PLAY arms the song and the master runs it: Start, Continue, Stop and Song Position Pointer, over USB or Bluetooth. See test T32. [not checked in simulator]

4.8 Clip launching (tabby-v04.7)
--------------------------------

Clip launching lets one track loop one of its clips while the others follow the song. A clip is one pattern of one track. Each track has its own clips, numbered from 1. The pads show 16 of them at a time.

1. Press BT. The CLIPS page opens, from any page. BT again goes back where you were. (On the SONG page SCALE opens it too.)
2. Hold KNOB BANK and press a pad from 1 to 8 to choose a track, or turn K5. The screen says TRACK SELECTED.
3. Look at the pads. Off: no clip. Dim white: a clip. Green: the clip that plays.
4. Press SEQ PLAY if the song is not running. (Or press a pad first: it blinks, the screen says RESERVED - SEQ PLAY STARTS IT, and SEQ PLAY starts the song with that clip on the track.) Then press a white pad. It blinks green and the screen says LAUNCH AT NEXT CYCLE. On the next bar line the clip starts and the pad is green. The column for the track shows CLIP.
5. To stop the track: press the green pad. It blinks red and the screen says STOP AT NEXT CYCLE. On the next bar line the track is silent. The column shows STOP.
6. Changed your mind? Press the blinking pad again before the bar line. The screen says TAKEN BACK.
7. To look at a clip without launching it: hold its pad for half a second. The screen says SELECTED ONLY - TAKEN BACK. The pad is bright white, and the SELECTED line shows its length.
8. To bring the track back to the song: press CHORD. The screen says TRACK TO SCENES AT CYCLE. The column shows >SCN, then SCENE. KNOB BANK and CHORD together bring every track back.
9. To mute a track: hold KNOB BANK and press pad 9 to 16 for track 1 to 8. The track's pads turn orange and the screen says MUTED ALL. Its notes stop on MIDI out too, and the clip keeps running, so unmuting brings it back in time. Blue pads and MUTED INT mean the other mute: the one from the mixer page, which silences only the SMK-37's own sound of the track and lets its MIDI notes go out.
10. OCTAVE+ and OCTAVE- (or K6) show the next 16 clips. The page then shows PADS 17 - 32.
11. Press SCALE for the SONG page, where the pads recall scenes. Press SEQ PLAY to stop the song.

"The next cycle" is the next bar line. A song imported from a 3/4 file uses 3/4 bars. The complete list of what every control does on these pages is in docs/CONTROL-MAP.md.

A jump on the SONG page cancels every launch and brings all tracks back to the song.

4.9 Editing a clip: the STEP page (tabby-v04.8)
----------------------------------------------

Here you change the notes of a clip on the SMK-37 itself. The pads say where, the keys say what.

1. On the CLIPS page select a clip: hold its pad for half a second (it turns bright white), or launch it. Press PARA. The STEP page opens: STEP, the track, CLIP and its number, SAVED.
2. The 16 pads are the 16 steps of one bar. Green pads hold notes. OCTAVE+ and OCTAVE- show the next and the previous bar.
3. Press a pad. It turns cyan and the screen lists the notes on that step.
4. Play a key. Its note is entered on the step, as loud as you played it, one step long. The screen says NOTE ENTERED and UNSAVED. Play the same key again to remove it. Play more keys for a chord.
5. Turn K2 for the velocity, K3 to move the note a little early or late, K4 for its length. With several notes on the step, K1 chooses which one (the > mark).
6. Press the pad again to let go of the step. Now a key only sets the NOTE shown on the screen.
7. For drums: press SCALE. The screen says PADS TOGGLE and the note. Now each pad press puts that note on its step or takes it off. Amber pads hold that note. SCALE again goes back.
8. CHORD clears the selected step. FX undoes the last change, up to four. KNOB BANK and FX redo.
9. To hear it: press SEQ PLAY. The song plays your change even though it is not saved. If the clip is launched and looping (go back with PARA, press its pad, come back with PARA), each change is heard from the clip's next loop, and a white pad runs along with the music.
10. To save: stop the song. Press the > button: CLIP SAVED. If you forget, the clip is saved by itself ten seconds after the song stopped. While the song plays the button says STOP TO SAVE.
11. To throw the changes away: KNOB BANK and CHORD. The screen says EDITS DISCARDED.
12. PARA goes back to the CLIPS page.
13. To shift the whole clip (tabby-v04.21): hold KNOB BANK and press OCTAVE+. Every note moves one step later: CLIP SHIFTED ONE STEP LATER. The notes of the last step come round to step 1. KNOB BANK and OCTAVE- moves them one step earlier. Each note keeps its place inside its step. Several presses in a row are one undo: FX takes them all back. Without KNOB BANK the two buttons still change the bar.

Only one clip can be unsaved at a time. Unsaved changes are lost when you switch the SMK-37 off. Take a Full backup of a song before you edit it on the device if you want the old version back later.

4.10 Recording into a clip (tabby-v04.9)
---------------------------------------

SEQ REC records what you play into a clip while the clip loops. What is already in the clip stays; you add to it.

1. On the CLIPS page choose the track (KNOB BANK and pad 1 to 8) and select the clip: hold its pad for half a second.
2. Press SEQ REC. If the song is stopped the screen says REC ARMED - SEQ PLAY STARTS IT: press SEQ PLAY. If the song is playing, the clip starts looping at the next bar line and the screen says RECORDING. The SEQ REC lamp is lit.
3. Play. Each note appears in the clip when you let the key go, and you hear it from the clip's next time round.
4. Notes land on the nearest step (input quantize). To keep your own timing, hold KNOB BANK and press SEQ REC: INPUT QUANTIZE OFF. Do it again to switch it back on.
5. Outside gear can record too: send notes to the SMK-37 over USB on the track's channel. Mod wheel, pitch bend and other controllers are recorded as well; a long sweep is thinned so it does not fill the clip.
6. Press SEQ REC again: REC STOPPED. The clip is UNSAVED. It is saved like a step edit: stop the song, and press the > button or wait ten seconds.
7. Not happy with the take? Stop it with SEQ REC, press PARA for the STEP page and press FX: the whole take is gone. KNOB BANK and FX bring it back.
8. To clear notes without stopping (tabby-v04.21): while the take runs, hold FX and hold a key. As the clip passes a note of that key, the note is taken out of the clip. Hold both for one pass of the clip to clear every note of that key; hold them over one beat to clear only what lies there. The key sounds while you hold it but is not recorded. Several keys can be held. Let FX go and you record again. During a take FX does nothing else: pressed alone it says HOLD FX + A KEY: CLEARS ITS NOTES. Cleared notes come back with the undo of the take (step 7).

A clip holds 512 events. If it fills up, recording stops by itself and the screen says CLIP FULL - 512 EVENTS - REC STOPPED. Nothing you recorded is lost.

Stopping the song (tabby-v04.16): if you pressed SEQ REC while the song played and the take had not started yet (REC WHEN THE CLIP LOOPS), stopping the song takes it off. The screen says SONG STOPPED - REC OFF and the SEQ REC lamp goes out. A take you arm while the song is stopped still waits for SEQ PLAY.

- ARP: tap to switch the arpeggiator on or off for the track. Hold about 0.6 seconds for its settings.
- FX: reverb and delay sends for the selected track.
- BT: opens the CLIPS page (4.8). BT again goes back.
- SEQ REC: records into a clip on the CLIPS and STEP pages (4.10). Elsewhere it says SEQ REC: ON THE CLIPS OR STEP PAGE.
- PATCH and SEQ PLAY together: stop all sound and rewind. [not checked in simulator]


4.11 New clips, CLIP SETTING, click and count-in, storing a scene (tabby-v04.10)

A new clip
1. On CLIPS press an empty pad. It lights dim cyan and the screen says EMPTY PAD - SEQ REC OR PARA: NEW CLIP.
2. Press SEQ REC to record into a new clip there (4.10), or PARA to enter notes on the STEP page (4.9). The new clip is one bar long (one master cycle).
3. The CLIPS page shows UNSAVED. Stop the song and press the > button, or wait ten seconds: SAVED. The new clip is now part of the song.

A new song (tabby-v04.21)
1. Go to SCENES (BT, then SCALE) with the song stopped. Turn K5 to a slot that says NO SONG.
2. Press SEQ and PARA together. Turn K1 to NEW SONG and press the > button. The screen asks NEW SONG IN SLOT nn? Press the > button again. PATCH cancels.
3. The screen says NEW SONG - HOLD A PAD, SEQ REC and shows CLIPS. The song is named NEW SONG, uses the project that is loaded and its tempo, and has one empty scene of 16 steps. It is stored at once.
4. Make the first clip as above: hold an empty pad, press SEQ REC or PARA. Launch your clips and store them as scenes (below). Scene 1 stays empty; when you have stored a scene of your own, stop the song and delete scene 1 (FX twice on SCENES) if you do not want a silent start.
5. A slot that holds a song is never replaced: SLOT HOLDS A SONG - K5 ON SCENES. While a song plays: STOP THE SONG FIRST. To name the song, read it in the workbench's song editor.

CLIP SETTING
1. On CLIPS select a clip (hold its pad) and press FX. The SETTING page has three pages (tabby-v04.17). Page 1/3 is the clip: LENGTH, NEXT CLIP, AFTER, TIMES, PROGRAM, BANK MSB, BANK LSB and COPY TO PAD. Page 2/3 is more of the clip: TRANSPOSE, SHUFFLE, PLAY QUANTIZE, STEP SIZE, DIRECTION and DELETE CLIP. Page 3/3 is the song: COUNT-IN, CLICK, CLICK OUT, CLICK CHANNEL, CLICK NOTE, CLICK LEVEL and K1 CONTROLLER to K4 CONTROLLER. K5 walks through all the lines; the page changes by itself.
2. Turn K5 to choose a line. Turn K1 to change it; K2 changes it by 16.
3. LENGTH is the clip's length, 1 to 128 steps. Making it shorter removes the notes past the new end; FX on the STEP page brings them back.
4. COPY TO PAD: turn K1 to an empty pad and press the > button. The copy is open and UNSAVED. A clip you changed must be saved before you copy it.
5. TRANSPOSE (tabby-v04.15): K1 moves the clip's notes up or down, 12 semitones at most. The clip itself is not changed: 0 plays it as it was. You hear it from the clip's next loop.
6. SHUFFLE (tabby-v04.17): SONG means the clip swings as the song does (the SWING of the SYNC / MIDI page, when the song follows it). Turn K1 right for the clip's own shuffle, 0 to 50 PERCENT: every second 16th step comes that much of a step late. 0 PERCENT plays this clip straight even in a song that swings. You hear it from the clip's next loop.
7. PLAY QUANTIZE (tabby-v04.17): OFF, 1/16, 1/8 or 1/4. When the clip plays, every note starts on the nearest line of that grid. The notes in the clip are not moved: OFF plays your own timing again. Controllers are not moved. Use it to tighten a loose take without losing it.
8. STEP SIZE (tabby-v04.19): what one step of the clip lasts. 1/16 is what every clip had until now. 1/8 plays the clip at half speed: a clip of 16 steps then lasts two bars. 1/32 plays it at double speed. 1/16T and 1/8T are triplet steps: a clip of 12 steps at 1/16T lasts half a bar, three steps to each 8th note. K1 only stops at sizes that give the clip a whole number of 16ths, from 1 to 128; if a size is passed over, change LENGTH first (triplets need a length that divides by 3). The line shows what the clip then plays, for example = 32 16THS. On the STEP page the pads are still the clip's own steps, and a take is recorded in them.
9. DIRECTION (tabby-v04.20): FORWARD, REVERSE or FWD THEN REV. REVERSE plays the clip's steps from the last to the first; each note keeps its place inside its step and its length. FWD THEN REV plays the clip forwards and then backwards, so it lasts twice as long; if that would be more than 128 steps or 512 events the line shows LONG and the clip plays forwards. The clip itself is not changed: FORWARD plays it as before. On the STEP page the pads are still the clip's own steps: the running light walks backwards, and a take is recorded where you hear it in the clip.
10. DELETE CLIP (tabby-v04.15): stop the song, turn K5 to DELETE CLIP and press the > button. The screen says PRESS AGAIN TO DELETE THE CLIP. Press it again within two seconds: CLIP DELETED - SAVE THE SONG. A clip that a scene uses is not deleted; the screen names the scene.
11. FX goes back to CLIPS.
Every clip loops at its own length: a 1-bar clip in a 4-bar scene plays four times. Songs you imported play as before.

Click and count-in
1. On the SETTING page turn K5 to CLICK. K1 chooses OFF, WHEN RECORDING or ALWAYS.
2. CLICK OUT: INTERNAL is a click on the SMK-37's audio output. MIDI NOTE sends a note on CLICK CHANNEL and CLICK NOTE (channel 10, note 37 unless you change them). BOTH does both. If your audio goes to the house mix, use MIDI NOTE.
3. COUNT-IN: OFF, 1, 2 or 4 CYCLES. Arm a take with SEQ REC while the song is stopped, then press SEQ PLAY: the click counts in, the screen shows COUNT-IN and the beats left, then the song starts.
4. CLICK LEVEL (tabby-v04.14): LOW, MID or HIGH for the internal click. Each step is twice as loud. A song you never set is on MID; HIGH is about as loud as a note.
5. These settings belong to the song and are saved with it. A song you never set has no click.

Storing a scene
1. Let the song play. Launch the clips you want on their tracks.
2. Go to SCENES (SCALE). Hold an empty pad for half a second. The screen says STORED AS A NEW SCENE. The new scene is added after the last one.
3. Press its pad to recall it later. It repeats until you recall another scene.
4. A pad that already holds a scene is never written over. Save the song when stopped (> button).

Deleting and moving a scene (tabby-v04.16)
1. Stop the song. On SCENES press the pad of the scene: it blinks. That is the selected scene. With no pad blinking, scene 1 is selected.
2. To delete it: press FX. The screen says FX AGAIN DELETES SCENE and its number. Press FX again within two seconds: SCENE DELETED - SAVE THE SONG. The scenes after it move one pad earlier. Its clips stay in the song.
3. To move it: hold PARA and turn K1. One click left moves the scene one pad earlier, one click right one pad later: SCENE MOVED - SAVE THE SONG. It stays selected, so you can keep turning.
4. A scene you stored while playing sits after the last one. Stop, select it and move it to where it belongs in the song.
5. The change is saved with the song: when you press the > button, by itself ten seconds after the last change while stopped, or when you choose another song. There is no undo for a deleted scene. Its clips are still in the song, so you can build it again: play, launch its clips, store them as a new scene and move it back.
6. The song keeps at least one scene: THE LAST SCENE STAYS. While the song plays: STOP TO DELETE OR MOVE A SCENE.
7. In a song imported from a MIDI file a clip can take its length from the first scene that uses it. If deleting or moving a scene would change that, the screen says NOT DELETED: SETS A CLIP'S LENGTH (or NOT MOVED). Open that clip's CLIP SETTING, turn LENGTH one step and back, and save: the clip then keeps its own length and the scene is free.


4.12 Clip chains (tabby-v04.11)

1. On CLIPS select a clip and press FX. After LENGTH the SETTING page has NEXT CLIP, AFTER and TIMES.
2. NEXT CLIP: turn K1. STAY means no chain. STOP stops the track. CLIP n goes on with that clip of the same track; K1 only stops at pads that hold a clip.
3. AFTER: CLIP END, or a number of steps (K2 changes it by 16). TIMES: how many times before the chain is due.
4. Save (stop, > button). Launch the clip from its pad. Under the track's column the CLIPS page shows +05 (clip 5 is next) or +STP.
5. The chain only runs on a track you launched by hand. A track that follows the scenes ignores it. A pad press, CHORD or a scene recall ends it.


4.13 The scene chain (tabby-v04.12)

1. Open SCENES (SCALE from CLIPS). The line LEN shows the length of the scene that plays, in master cycles, then THEN and CHAIN.
2. K1 changes how many times the scene plays before the next one. K2 chooses THEN NEXT (the next scene follows by itself) or THEN STAY (it repeats until you recall another).
3. K3 right: CHAIN HELD. The scene that plays repeats until you turn K3 left again (CHAIN RUNS) or press a scene pad.
4. While the song is stopped, press a scene pad: RESERVED - SEQ PLAY STARTS HERE. SEQ PLAY starts there. The knobs then work on that scene.
5. A pad always wins: the song jumps to its scene and goes on from there. Save the song when stopped.


4.14 A clip's program and bank; the controller knobs (tabby-v04.13)

1. On CLIPS select a clip and press FX. After TIMES the page has PROGRAM, BANK MSB and BANK LSB.
2. PROGRAM: OFF or 1 to 128. BANK MSB: OFF or 0 to 127; BANK LSB works once BANK MSB has a value. Save.
3. When the track enters the clip (its pad, a chain, a scene), the bank select and the program change go out on the track's channel, just before the clip's first notes. They go to MIDI out only.
4. On the CLIPS page turn K1 to K4: they send controllers 74, 71, 1 and 11 for the selected track. The screen shows the value.
5. Press SEQ REC and turn a knob: the movement is recorded into the clip and plays back in the loop.
6. To send other controllers (tabby-v04.14): press FX, turn K5 to K1 CONTROLLER (page 3/3) and choose a number from 0 to 127 with K1 (K2 moves by 16). The same for K2, K3 and K4 CONTROLLER. Save. The numbers belong to the song.


4.15 Saving a project, and the STOP TO SAVE rule
------------------------------------------------

Your sounds, mixer and MIDI settings live in a project. There are 16 project slots.

1. Press the > button. The SAVE PROJECT page opens. It shows USER 01/16 and a working name.
2. Turn K5 or K7 to choose the slot. K1 moves the cursor in the name and K2 changes the letter.
3. Press the > button again. The screen says PROJECT SAVED and goes back to the overview.
4. PATCH cancels without saving.

STOP TO SAVE: while a song or pattern plays, the device writes nothing to flash. If you press the > button a second time while something plays, the page says STOP TO SAVE in orange. Stop the song, then save. Changes you made while playing are kept and can be saved after the stop.

The same rule holds for ERASE and COMPACT in ACTIONS and for any write from the workbench.

4.16 Loading a project
----------------------

1. On the overview, press PATCH. The PRESETS list opens.
2. Turn K5 or K7 to pick a project, or press a pad from 1 to 16 to load it directly.
3. Press SEQ PLAY to load and run. An empty slot says EMPTY SLOT - CHOOSE ANOTHER.
4. PATCH goes back. PATCH with the > button undoes the last change.

4.17 Erasing old data
---------------------

After a storage move, the device can announce OLD DATA IN SONG STORAGE - SEE ACTIONS for six seconds. Then the SONG page cannot write or play songs. The ACTIONS first line says SONG OLD DATA.

1. Press SEQ and PARA together. Turn K1 or K5 to ERASE OLD DATA.
2. Press the > button. The screen says ERASE OLD DATA? and, at the bottom, > CONFIRM and PATCH CANCEL.
3. Press the > button again. The page says DONE and the first line changes to SONG READY.
4. Nothing is erased without the second press. Projects, tunings and settings are never touched.

4.18 Other useful controls
--------------------------

- GLOBE: tap to open the mixer. Pads 1 to 8 mute. Pads 9 to 16 solo. Tap GLOBE again to leave.
- FADER BANK: moves the four faders between tracks 1 to 4 and 5 to 8. Move a fader through its shown level to take over.


5. USING THE WORKBENCH
======================

Open https://seattleuser0.github.io/classic-tabby/ in desktop Chrome. The tabs are Play & edit, Projects & sounds, Device update and Help. Help has 22 chapters. Chapter 00 says what changed in tabby-v04.

The Play & edit tab is a simulator of the device. It runs the same firmware code in the browser. Use it to try things safely.

5.1 Connecting
--------------

1. Plug in the SMK-37 and close other MIDI programs.
2. Open the Projects & sounds tab.
3. Click Connect project library. Allow MIDI with SysEx when Chrome asks.
4. The page reads what the device can do. The Song mode group and the Bluetooth settings group become usable.

[not checked in simulator]

5.2 Importing a MIDI file into a song
-------------------------------------

1. In Projects & sounds, open Import MIDI file (Classic Tabby).
2. Choose the .mid file. The summary shows format, tempo, tracks and bars. Warnings show under it.
3. Assign each part to a track from 1 to 8, or skip it. Set OUT CH per track to the channel of the gear that should play it.
4. Check the options. Quantize is off by default, which keeps the timing exact. Bars per row offers lengths that stay on bar lines.
5. Check the resulting song and the list called Dropped or changed.
6. Choose the Song slot. Click Write song and confirm. The panel shows the plan and the time taken.
7. If the slot already has a song, the page deletes it first and says so. Click Export .tabby first if you want to keep it.
9. Scenes (tabby-v04.6): with the box "write the song as scenes and clips" ticked (it is ticked at the start) the song is stored as scenes with clips of up to 8 bars and the master cycle set to one bar of the file. Untick it to write rows, which older firmware can play.
8. Chords of more than four notes, controller events and long rows (tabby-v04.5): the importer keeps every note of a chord. With the box "keep controller, pitch bend and aftertouch events in the clips" ticked (it is ticked at the start) it also keeps the mod wheel, sustain pedal, pitch bend and aftertouch of each part, thinned to one value per 1/8 step. Bars per row offers up to 128 steps. A part that needs any of this is stored as a "v3 clip"; the summary says how many. The step editor in Song mode cannot show a v3 clip, but it keeps it when you write or export the song. A song with v3 clips or long rows needs tabby-v04.5 on the SMK-37; the page refuses to write it to older firmware and says why.

The target is chosen in the Song mode group: Device (project library) or Browser simulator. The simulator is safe to try first.

5.3 Writing a song to the device
--------------------------------

1. Connect the project library (5.1). Stop anything playing on the device.
2. Open Song mode (Classic Tabby). Set Target to Device.
3. Choose the Song slot. Click Read song to see what is there.
4. Click Write song. The page writes the record, then every block, then reads it back and compares. Audio pauses a little at the end of each batch. Write songs before a set, not during one.
5. On the device, open SONG MODE (4.7) and play it.
6. Storage status tells you how much room is left. After many rewrites, run COMPACT SONG STORAGE in ACTIONS to reclaim old blocks.

[not checked in simulator] (writing to a real device). Writing to the Browser simulator target is the same path.

5.4 Rig profiles and row events
-------------------------------

The rig tells the workbench which device is on each MIDI channel. Then the row event editor shows preset names instead of numbers.

1. Open Rig setup (Classic Tabby). The built-in Wrong Room profile is read-only. Click Copy to my rig to get one you can change.
2. Each line is one MIDI channel: Device, Name, Gap ms, Lead ms, Numbering and Names. Gap ms is the pause a device needs after a program change. Lead ms sends the program change that long before the bar.
3. Export rig (.json) and Import rig save and load your rig. It is kept in this browser.
4. In Song mode, under the row table, choose a Row. Use Add on channel and the type: Program, Control change or Gap in ms.
5. A row holds up to 32 events. A song holds up to 292. Row 1 is marked SEND SETUP.
6. Events go to outside gear only. They do not change the SMK-37's own sounds.
7. On the device, SEND SETUP in ACTIONS sends row 1's events at once. With the song stopped and loaded, the notice says SETUP SENT - ROW 1 EVENTS. [not checked in simulator] With the song playing it says STOP THE SONG FIRST. With no song loaded it says NO SONG LOADED.

5.5 Full backup and restore
---------------------------

Make a Full backup before every firmware update.

1. In Projects & sounds, open Full backup and restore (Classic Tabby). Stop any song first.
2. Click Full backup. A file is saved on the computer. It holds the 16 project slots, device settings, every song, and your My rig profile. It does not hold Bluetooth pairings.
3. To restore: choose the Backup file, click Full restore, and confirm. It checks the whole file before it writes anything.
4. At the end it reads everything back. It shows PASS or the first difference. Click Verify against file any time to check again.
5. If the page cannot read a song, the backup stops and says so: STOPPED at song 7: this page cannot read it. No file was made and nothing on the device changed. This happens when the song was saved by newer firmware than the page you opened. Open the page of the firmware that is on the device (the builds list has every page) and make the backup there.

A factory restore overwrites the last 40 KB of song storage. Export your songs as .tabby files first.

[not checked in simulator]

5.6 The Diagnostics panel
-------------------------

1. In Projects & sounds, open Diagnostics (timing counters and control-loop profile).
2. Click Reset counters. Play a song for the time you want to measure.
3. Click Read counters. Click Copy as text to paste the numbers into a message.
4. The counters show the control loop period, the longest flash erase and write, the time from a key press to MIDI, and busy time and lost ticks.
5. One line starts with "flash part". It names the flash chip inside the SMK-37: its JEDEC ID, like 0xEB6014, and its size, 1024 KiB. The device read them when it started. The line is a report for problem reports. The device works the same with any chip, and nothing checks this line. The simulator shows "flash part: none (simulator)".

[not checked in simulator]

5.7 Bluetooth settings
----------------------

In Projects & sounds, the Bluetooth settings group has Bluetooth on, Bluetooth audio, the BLE MIDI role (DEVICE or HOST) and Forget MIDI pairs. Each change is written at once. Cables are better than Bluetooth for notes and clock.

[not checked in simulator]


6. TEST CHECKLIST
=================

Mark each test PASS or FAIL. Write what you saw. Run a test only when its set-up is ready. The tests are grouped by area.

Tests with real gear are in group G.

GROUP A. START UP
-----------------

T1. Boot screen and version
Set up: SMK-37 Pro on USB power, nothing else.
1. Switch on. [not checked in simulator]
2. Watch the boot screen.
You should see: SMK37, OFFICIAL OPEN and the version line. Then the the overview.
Result: PASS / FAIL   Notes: ________________________________

T2. The overview
Set up: T1 done.
1. Look at the overview.
You should see: 8 tracks listed, BPM 120 or your project's tempo, and at the bottom KEY T1 CH01 PAD T8 CH10.
Result: PASS / FAIL   Notes: ________________________________

T3. Storage state
Set up: T2 done.
1. Press SEQ and PARA together.
You should see: ACTIONS with the first line USER 471040 SONG READY. FREE and RECLAIM at the bottom. Press PATCH to leave.
Result: PASS / FAIL   Notes: ________________________________

GROUP B. PLAYING
----------------

T4. Keys
Set up: the overview.
1. Press the lowest key, then a key in the middle.
You should hear: track 1's sound. The outside MIDI shows channel 1, lowest key note 48. (Check the MIDI note on a monitor if you have one.) [not checked in simulator] (the monitor)
Result: PASS / FAIL   Notes: ________________________________

T5. Pads
Set up: the overview.
1. Press pad 1, then pad 2.
You should hear: the 808 drum sounds on track 8. MIDI goes out on channel 10, pad 1 is note 36.
Result: PASS / FAIL   Notes: ________________________________

T6. Octave buttons
Set up: the overview.
1. Press OCTAVE+ twice. Press a key.
2. Press OCTAVE- four times. Press the same key.
You should hear: two octaves higher, then two octaves lower than the start. MIDI notes: start 60, then 84, then 36 for the same key.
Result: PASS / FAIL   Notes: ________________________________

T7. Keys and pads focus
Set up: the overview.
1. Hold KNOB BANK and tap NOTE REPEAT.
2. Press pad 1.
3. Hold KNOB BANK and tap NOTE REPEAT again.
You should see: PAD DRUM at the top and PAD READY - PARA / FX at the bottom after step 1. Pad 1 still plays the kick. After step 3 the top shows KEY PLAY again.
Result: PASS / FAIL   Notes: ________________________________

T8. Mute with KNOB BANK and a pad
Set up: the overview.
1. Hold KNOB BANK. Press pad 9. Release KNOB BANK.
2. Hold KNOB BANK. Press pad 9 again.
You should see: track 1 shows M-ALL, then the mute goes away. The screen says TRACK MUTED: SOUND AND MIDI, then TRACK UNMUTED. The overview shows M-ALL for this mute and M-INT for a mute set on the mixer page.
Result: PASS / FAIL   Notes: ________________________________

T9. Mixer
Set up: the overview.
1. Tap GLOBE.
2. Press pad 1.
3. Tap GLOBE again.
You should see: the mixer with MUTE and SOLO cells. Pad 1 mutes track 1. The overview comes back after step 3.
Result: PASS / FAIL   Notes: ________________________________

GROUP C. SOUNDS AND TRACKS
--------------------------

T10. Choose the FM6 sound
Set up: the overview.
1. Turn K5 to select track 3 (PSG).
2. Hold KNOB BANK, press PATCH. Turn K1 left to DX7 FM. Press the > button.
You should see: SOUND SOURCE page with DX7 FM lit, then SOUND SOURCE APPLIED on the overview. Track 3 now says DX7 FM. To hear it, select track 3 and play the keys.
Result: PASS / FAIL   Notes: ________________________________

T11. FM6 quick page
Set up: T10 done, track 3 selected.
1. Press PARA.
2. Turn K7 three clicks. Turn K6 one click. Turn K1 two clicks.
3. Press PARA.
You should see: DX7 QUICK EDIT. The voice number changes with K7. The bank changes with K6. ALGORITHM changes with K1. A star shows at the top. Back on the overview, the track shows EDITED.
Result: PASS / FAIL   Notes: ________________________________

T12. Other sounds say "moved to workbench"
Set up: the overview, track 2 (BASS 303) selected.
1. Press PARA.
You should see: VOICE EDIT MOVED TO WORKBENCH.
Result: PASS / FAIL   Notes: ________________________________

T13. Track roles
Set up: the overview.
1. Hold KNOB BANK, press PATCH. Turn K2 right once, then once more.
You should see: PROJECT, then LIVE with KEEP SOUND ON PROJECT LOAD, then OFF with TURN K2 LEFT TO ENABLE. Turn K2 left twice to get back to PROJECT.
Result: PASS / FAIL   Notes: ________________________________

T14. Input and output channels per track
Set up: the overview.
1. Hold KNOB BANK, press SEQ. Turn K5 to track 4.
2. Turn K2 three clicks.
3. Turn K1 two clicks.
You should see: the MIDI TRACK page. OUT CH changes by three. IN CH changes by two. The screen says MIDI SETTING - NOTES RELEASED after a change. A key played on track 4 now goes out on the new channel. [not checked in simulator] (the outside gear)
Result: PASS / FAIL   Notes: ________________________________

T15. LOCAL, BOTH, MIDI
Set up: T14 done. Track 4 on the MIDI TRACK page.
1. Turn K3 right once.
You should see: SEQ changes from BOTH to MIDI. The screen says SEQ OUTPUT UPDATED. The track makes no sound inside any more but still sends MIDI.
Result: PASS / FAIL   Notes: ________________________________

T16. Output port off
Set up: MIDI TRACK page.
1. Turn K4 left once.
You should see: OUT PORT shows OFF. Nothing is sent from this track.
Result: PASS / FAIL   Notes: ________________________________

GROUP D. SYNC / MIDI PAGE AND TEMPO
-----------------------------------

T17. The SYNC / MIDI page
Set up: the overview.
1. Press SEQ.
You should see: SYNC / MIDI with CLOCK, CLK IN, SWING, SEQ OUT, KEY OUT and the line BPM: 120 SET ON OVERVIEW K4.
Result: PASS / FAIL   Notes: ________________________________

T18. Clock source
Set up: T17 done.
1. Turn K1 right once.
2. Turn K2 right once.
3. Turn K1 left once.
You should see: CLOCK MIDI and BPM WAIT after step 1. CLK IN USB after step 2. CLOCK INT after step 3 and the tempo back.
Result: PASS / FAIL   Notes: ________________________________

T19. Swing and SEQ OUT
Set up: SYNC / MIDI page.
1. Turn K3 five clicks right.
2. Turn K4 right once.
You should see: SWING 5%. SEQ OUT CLOCK. Set SEQ OUT back to ON.
Result: PASS / FAIL   Notes: ________________________________

T20. Tempo
Set up: the overview.
1. Turn K4 five clicks right.
2. Hold PATCH and tap SEQ twice.
You should see: BPM goes up by five. The first tap says TAP AGAIN / PATCH+SEQ. The second tap sets a tempo from your tapping.
Result: PASS / FAIL   Notes: ________________________________

GROUP E. ACTIONS, PROJECTS AND SAVING
-------------------------------------

T21. The ACTIONS menu
Set up: the overview.
1. Press SEQ and PARA together.
2. Turn K5 right until you have seen all nine entries.
You should see: COPY TIMBRE, PASTE TIMBRE, STOP ALL / REWIND, ERASE OLD DATA, SONG MODE, COMPACT SONG STORAGE, SEND SETUP, NEW SONG, A2 FAST MIDI: ON. The bottom line says K1/K5 ACTION > DOES IT.
Result: PASS / FAIL   Notes: ________________________________

T22. Holding SEQ alone
Set up: the overview.
1. Hold SEQ alone for two seconds.
You should see: SYNC / MIDI opens, not ACTIONS. This is expected. Older firmware showed the wrong text HOLD SEQ: ACTIONS; tabby-v04.2 shows SEQ+PARA: ACTIONS.
Result: PASS / FAIL   Notes: ________________________________

T23. Save a project
Set up: the overview. Nothing playing.
1. Press the > button.
2. Turn K7 two clicks.
3. Press the > button again.
You should see: SAVE PROJECT with USER 01/16 and a name. Slot 03 after step 2. PROJECT SAVED after step 3.
Result: PASS / FAIL   Notes: ________________________________

T24. STOP TO SAVE
Set up: a song loaded and playing (T29).
1. Press the > button. Press it again.
You should see: SAVE PROJECT, then STOP TO SAVE in orange. Nothing is written. Stop the song and save again: PROJECT SAVED.
Result: PASS / FAIL   Notes: ________________________________

T25. Load a project
Set up: T23 done. The overview.
1. Press PATCH. Press pad 3.
You should see: the PRESETS list, then your saved project loaded.
Result: PASS / FAIL   Notes: ________________________________

T26. Erase old data
Set up: only if the device says OLD DATA IN SONG STORAGE. If it does not, write "not needed".
1. Press SEQ and PARA together. Turn K1 or K5 to ERASE OLD DATA. Press the > button.
2. Check the screen. Press the > button again.
You should see: ERASE OLD DATA? and > CONFIRM. After the second press, DONE and SONG READY.
Result: PASS / FAIL / NOT NEEDED   Notes: ________________________________

GROUP F. SONGS
--------------

T27. Import a MIDI file and write it to the browser simulator
Set up: Chrome, the workbench, and any .mid file of your own.
1. Projects & sounds, Song mode, Target: Browser simulator.
2. Import MIDI file. Assign parts. Write song to slot 1.
3. On the Play & edit tab, press the Song mode shortcut.
You should see: the plan and a read-back check with no difference. Then the SONG page with the song name. [not checked in simulator] (the import screens; the SONG page itself was checked)
Result: PASS / FAIL   Notes: ________________________________

T28. Write the song to the device
Set up: device connected (5.1), nothing playing.
1. Target: Device. Write song to slot 1.
You should see: the page writes the record and the blocks, then reads back and says it matches. A short audio pause is normal.
Result: PASS / FAIL   Notes: ________________________________

T29. Choose a song and play it
Set up: T28 done. Device on the overview. CLOCK on INT.
1. Press SEQ and PARA together. Turn K5 to SONG MODE. Press the > button.
2. Turn K5 right to song 2, then left to song 1.
3. Press SEQ PLAY.
You should see: SONG 01 and the name. Song 2 empty says NO SONG HERE - UPLOAD FROM THE WEB WORKBENCH. After SEQ PLAY: PLAYING, SCENE, X, BAR and NEXT change as it goes.
Result: PASS / FAIL   Notes: ________________________________

T30. Recall a scene
Set up: T29 playing, a song with at least 3 scenes (rows).
1. Press pad 3.
You should see: TO SCENE 003 in amber and pad 3 blinking green, then SCENE 003 on the next bar with pad 3 green. All tracks change together.
Result: PASS / FAIL   Notes: ________________________________

T31. Stop the song
Set up: T29 playing.
1. Press SEQ PLAY.
You should see: the page says STOPPED - SEQ PLAY STARTS. Every note is released. MIDI Stop is sent once.
Result: PASS / FAIL   Notes: ________________________________

T32. Song follows an external clock (tabby-v04.3.1)
Set up: a DAW or MIDI app on the MacBook sends MIDI clock, Start, Stop and Continue to the SMK-37 over USB. SYNC / MIDI with CLOCK on MIDI (K1). Song selected on the SONG page.
1. Press SEQ PLAY on the SONG page. The page says ARMED: START?
2. Press play in the DAW. At its first clock pulse the song starts and the page says FOLLOWING. The notes stay with the DAW's beat.
3. Change the DAW's tempo. The song keeps up.
4. Press stop in the DAW. The page says STOP BY MASTER and every note is released. Press continue: it goes on from where it stopped.
5. Pause the clock for one second (or unplug USB for one second and plug it back). The page says HOLD: NO CLOCK and the notes stop; when the clock returns, it carries on from the same place.
6. Pause the clock for five seconds. The page says LOST - CONTINUE. When the clock returns, the song stays silent until you press continue or start.
You should see and hear: the song following the DAW as described. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T33. Launch a clip on one track
Set up: T29 playing, a song where track 1 has at least two clips (the pads on the CLIPS page show two white or green pads).
1. Press BT. Hold KNOB BANK and press pad 1. Release KNOB BANK.
2. Press a white pad.
3. Wait for the next bar.
You should see: CLIPS T1, TRACK SELECTED, then LAUNCH AT NEXT CYCLE and the pad blinking green. After the bar line the pad is green and the column says CLIP. The other tracks go on with the song.
Result: PASS / FAIL   Notes: ________________________________

T34. Stop and bring a track back
Set up: T33 done.
1. Press the green pad.
2. Wait a bar. Press CHORD.
3. Wait a bar.
You should see: STOP AT NEXT CYCLE, the pad blinking red and >STP, then STOP. TRACK TO SCENES AT CYCLE and >SCN, then SCENE.
Result: PASS / FAIL   Notes: ________________________________

T35. A jump cancels launches
Set up: T33 done, track 1 launched.
1. Press SCALE to go to the SONG page. Press a pad.
You should see: after the landing, every track follows the song again. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T36. Compact the storage
Set up: song storage with some old blocks (Storage status shows RECLAIM above zero), nothing playing.
1. Press SEQ and PARA together. Turn K5 to COMPACT SONG STORAGE. Press the > button. Press it again.
You should see: COMPACT SONG STORAGE? and then COMPACTING STORAGE... for a few seconds. RECLAIM goes to 0. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

GROUP G. WORKBENCH
------------------

T37. Connect the project library
Set up: device on USB, close other MIDI programs.
1. Projects & sounds, Connect project library.
You should see: the page connects, reads the capabilities and shows the Song mode and Bluetooth settings groups. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T38. Full backup
Set up: T37 done. Nothing playing.
1. Full backup.
You should see: a backup file saved on the computer. Keep it. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T39. Full restore and verify
Set up: T38 done. Nothing playing.
1. Choose the file. Full restore. Confirm.
2. Click Verify against file.
You should see: PASS at the end of the restore and after Verify. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T40. Rig copy
Set up: workbench Rig setup.
1. Click Copy to my rig. Change the Name of channel 5.
2. Reload the page.
You should see: your copy with the changed name is still there. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T41. Row events in the editor
Set up: Song mode, a song read from slot 1.
1. Choose Row 2. Add on channel 5: type Program, choose a preset.
2. Write song.
You should see: the event in the list with its channel, the device and the words. After the write, the read-back matches. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T42. Diagnostics
Set up: T37 done.
1. Reset counters. Play a song for one minute. Read counters.
You should see: numbers for the control loop, longest flash erase and write, and key-to-MIDI. Lost ticks is the number to watch. A line "flash part (read by the SDK at boot): JEDEC 0x..., 1024 KiB; USER 471040 bytes". Write the JEDEC ID in Notes. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

GROUP H. REAL GEAR
------------------

These tests need your gear. Use the Wrong Room rig channels from the MIDI guide, section 8, or your own. Cable the SMK-37 as in 3.1.

T43. An outside synth on its own channel
Set up: Proteus on channel 5 behind the H4MIDI (the H4MIDI sends channels 5 to 8 to the Proteus). Track 3 set to OUT CH 5, SEQ MIDI, OUT PORT ALL.
1. On the overview turn K5 to track 3. The bottom line shows KEY T3 and the channel. Press a key. Or play a song with a part on track 3.
You should hear: the Proteus, not the SMK-37. Nothing from the other synths. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T44. A program change to an effects pedal
Set up: Zoom MS-70CDR+ on channel 16 (set USB MIDI CH 16, see the Help chapter 08 checklist). A song with a Program event in row 2 for channel 16.
1. Send the song to the device. Press SEND SETUP if row 1 has events. Press SEQ PLAY.
2. Jump to row 2 or let it arrive.
You should see: the pedal changes patch when row 2 starts, on the bar. If it changes late, the SONG page shows LATE. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T45. Two tracks to two devices through the H4MIDI
Set up: SMK-37 USB into the H4MIDI WC. Output 2 to the Proteus with channels 5 to 8. Another output to a second device, for example the M8 on channel 4. One part on track 3 (channel 5) and one on track 4 (channel 4).
1. Play a song with both parts.
You should hear: each device plays only its own part. If a device plays the other part too, the H4MIDI filter is wrong. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T46. Clock out
Set up: M8 on its own DIN from the H4MIDI, set to follow MIDI clock. SEQ OUT ON. CLOCK on INT.
1. Press SEQ PLAY on the SONG page.
You should see: the M8 starts with the SMK-37 and follows its tempo. Stop: it stops. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T47. Timing by ear
Set up: a song with the same hit on two devices, for example kick on the SMK-37 and a drum on the Proteus.
1. Play it for one minute.
You should hear: the hits close together. A small drift of 10 to 14 ms between channels is the known limit (section 7). Write down anything you can hear as a flam or a stumble. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T48. No stuck notes
Set up: T43 or T45 playing.
1. Press SEQ PLAY to stop in the middle of a long note.
You should hear: every note stops. MIDI Stop is sent once. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________


T49. A chord of more than four notes (tabby-v04.5)
Set up: a MIDI file with a chord of five or more notes on one track. Gear or a MIDI monitor on that track's channel.
1. Import the file (5.2). The warnings list says the block is stored as a v3 clip. Nothing says "More than 4 notes ... kept the 4".
2. Write the song to a slot. Select it on the SONG page and press SEQ PLAY.
You should hear: every note of the chord, together.
Result: PASS / FAIL   Notes: ________________________________

T50. Controller events from the MIDI file (tabby-v04.5)
Set up: a MIDI file with a mod wheel or filter sweep (control changes) or pitch bend on a part. Gear that reacts to it.
1. Import it with the box "keep controller, pitch bend and aftertouch events in the clips" ticked. The summary says how many were kept.
2. Write the song and play it.
You should hear: the sweep or bend, in time with the notes. With the box unticked and the song written again, the notes play without it.
Result: PASS / FAIL   Notes: ________________________________

T51. A row of 8 bars (tabby-v04.5)
Set up: a MIDI file of at least 8 bars of 4/4 with different notes in bars 5 to 8.
1. Import it with Bars per row set to 8 bars (128 steps). Write it and play it.
You should hear: all 8 bars before the row repeats or the next row starts. The SONG page shows the row with 128 steps.
Result: PASS / FAIL   Notes: ________________________________

T52. A song as scenes, and the master cycle (tabby-v04.6)
Set up: a MIDI file in 3/4 or 4/4 with a few bars. Gear or a MIDI monitor.
1. Import it with the box "write the song as scenes and clips" ticked. The warnings list says how many scenes and clips, and the master cycle (16 steps for 4/4, 12 for 3/4).
2. Write the song. On the SMK-37 select it on the SONG page and press SEQ PLAY: it plays as the file does.
3. Press BT for the CLIPS page. Press a white pad, a little after a bar line.
You should hear: the launched clip start exactly on the next bar line of the song (the next multiple of the master cycle), not earlier. In a 3/4 song it starts on a 3/4 bar line.
Result: PASS / FAIL   Notes: ________________________________

T53. Take a launch back, and the long press (tabby-v04.7)
Set up: T33 done, the song playing, the CLIPS page open.
1. Press a white pad just after a bar line. While it blinks, press it again.
2. Press and hold a white pad for a full second.
You should see: after step 1 TAKEN BACK, and nothing changes at the bar line. After step 2 SELECTED ONLY - TAKEN BACK; the pad is bright white and nothing changes at the bar line.
Result: PASS / FAIL   Notes: ________________________________

T54. Mute from the pads (tabby-v04.7)
Set up: a song playing with a part on track 2 that goes to outside gear (or a MIDI monitor). The CLIPS page open.
1. Hold KNOB BANK and press pad 10. Release KNOB BANK. Wait two bars.
2. Hold KNOB BANK and press pad 10 again.
You should hear: after step 1 track 2 falls silent, on the SMK-37 and on the outside gear. After step 2 it is back, in time with the rest. With track 2 selected its pads are orange while it is muted, and the page says MUTED ALL.
Result: PASS / FAIL   Notes: ________________________________

T55. Scene recall with pad lights (tabby-v04.7)
Set up: a song with at least two scenes, playing. The SONG page open (SCALE from CLIPS).
1. Press the pad of a scene that is not playing.
You should see: that pad blinks green, then turns green on the next bar line; the pad of the scene before goes dim white. Tracks you had launched or stopped follow the scene again.
Result: PASS / FAIL   Notes: ________________________________

T56. BT from anywhere (tabby-v04.7)
Set up: any page, for example the mixer (GLOBE).
1. Press BT. Press BT again.
You should see: the CLIPS page, then the page you were on.
Result: PASS / FAIL   Notes: ________________________________

T57. Reserve a clip, then SEQ PLAY (tabby-v04.7.1)
Set up: the song stopped, the CLIPS page open, track 1 selected, a track with at least two clips.
1. Press the pad of the clip that the song does not start with. It blinks. The screen says RESERVED - SEQ PLAY STARTS IT.
2. Press SEQ PLAY.
You should hear: track 1 plays the reserved clip from the first beat and keeps looping it. The other tracks play the song as usual. CHORD brings track 1 back to the song.
Result: PASS / FAIL   Notes: ________________________________

T58. The two mutes look different (tabby-v04.7.1)
Set up: a song playing with a part on track 2 that goes to outside gear. The CLIPS page open, track 2 selected.
1. Press GLOBE. On the mixer page mute track 2. Press GLOBE again to return.
2. Unmute it on the mixer page the same way. Then hold KNOB BANK and press pad 10.
You should see and hear: after step 1 the pads of track 2 are blue and the page says MUTED INT; the SMK-37's own sound of track 2 is silent but the outside gear still plays. After step 2 the pads are orange, the page says MUTED ALL, and the outside gear is silent too. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T59. Enter and remove a note (tabby-v04.8)
Set up: a song on the device, stopped. CLIPS page, a clip selected (bright pad).
1. Press PARA. Press a pad that is off. Play a key.
2. Play the same key again. Play it once more.
You should see: the STEP page; the pad cyan; after the key NOTE ENTERED, the note in the list, UNSAVED, the pad bright cyan. After the second press NOTE REMOVED, after the third it is back.
Result: PASS / FAIL   Notes: ________________________________

T60. Hear the change while the clip loops (tabby-v04.8)
Set up: T59 done. Gear or the SMK-37's own sound on that track.
1. Press PARA (back to CLIPS). Press SEQ PLAY. Press the clip's pad so that it loops. Press PARA again.
2. Select another empty step and play a key.
You should hear: the new note in the loop from its next time round, on the step you chose. A white pad runs along the steps.
Result: PASS / FAIL   Notes: ________________________________

T61. Velocity, start and length (tabby-v04.8)
Set up: T60 running, a step with one note selected.
1. Turn K2 fully left, then right. Turn K3 a few clicks right. Turn K4 right.
You should hear: the note softer, then louder; then a little late; then longer. The screen shows VEL, ST+ and LEN change.
Result: PASS / FAIL   Notes: ________________________________

T62. Undo and redo (tabby-v04.8)
Set up: T61 done.
1. Press FX four times. Press FX once more. Hold KNOB BANK and press FX.
You should see: UNDO four times, each taking one change back; then NOTHING TO UNDO; then REDO.
Result: PASS / FAIL   Notes: ________________________________

T63. Save, and saving by itself (tabby-v04.8)
Set up: an UNSAVED clip, the song playing.
1. Press the > button.
2. Press SEQ PLAY to stop. Wait ten seconds without touching anything.
3. Switch the SMK-37 off and on. Play the song.
You should see: STOP TO SAVE while playing. After the stop, CLIP SAVED by itself and the page says SAVED. After the power cycle the song plays your changed clip.
Result: PASS / FAIL   Notes: ________________________________

T64. Drums with the pads (tabby-v04.8)
Set up: the STEP page on a drum clip. Nothing selected.
1. Play the key of the drum you want. Press SCALE (PADS TOGGLE).
2. Press pads 1, 5, 9 and 13. Press pad 5 again.
You should see and hear: the pads turn amber as the hits go on; pad 5 goes off again. Playing, the hits are on beats 1, 3 and 4.
Result: PASS / FAIL   Notes: ________________________________

T65. Record from the keys (tabby-v04.9)
Set up: a song on the device, stopped. CLIPS page, a clip selected (bright pad).
1. Press SEQ REC. Press SEQ PLAY.
2. Play four notes in time with the music. Listen to the next time round.
3. Press SEQ REC.
You should see and hear: REC ARMED - SEQ PLAY STARTS IT, then RECORDING and the SEQ REC lamp. Your notes come back in the loop, on the beat. REC STOPPED, and the lamp goes out. The STEP page shows the clip UNSAVED.
Result: PASS / FAIL   Notes: ________________________________

T66. Your own timing (tabby-v04.9)
Set up: T65 done, the song playing, the clip looping.
1. Hold KNOB BANK and press SEQ REC (INPUT QUANTIZE OFF). Press SEQ REC.
2. Play a few notes deliberately late, between the beats. Press SEQ REC.
You should hear: the notes come back exactly as late as you played them.
Result: PASS / FAIL   Notes: ________________________________

T67. Undo a take (tabby-v04.9)
Set up: T66 done.
1. Press PARA. Press FX. Hold KNOB BANK and press FX.
You should see and hear: UNDO, and the last take is gone from the loop at its next time round. REDO, and it is back.
Result: PASS / FAIL   Notes: ________________________________

T68. Record from outside gear, with a controller (tabby-v04.9)
Set up: a keyboard or a DAW sends to the SMK-37 over USB on the channel of the selected track (SYNC / MIDI page, K1 IN CH). A clip looping, SEQ REC on.
1. Play notes on the outside keyboard. Move its mod wheel slowly up and down once.
2. Press SEQ REC. Listen.
You should hear: the notes and the wheel movement come back in the loop. On the STEP page EVENTS has grown by a few dozen for the wheel, not by hundreds. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________


T69. A new clip from an empty pad (tabby-v04.10)
Set up: a song loaded and stopped, CLIPS page, a track with an empty pad.
1. Press the empty pad. Press SEQ REC. Press SEQ PLAY.
2. Play a few notes over one bar. Press SEQ REC, then SEQ PLAY to stop. Wait ten seconds.
You should see and hear: the pad dim cyan after step 1; REC ARMED, then the take; your notes loop from the second bar; UNSAVED on the page, then SAVED. After switching the SMK-37 off and on, the pad still holds the clip. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T70. A clip's length (tabby-v04.10)
Set up: a 1-bar clip selected on CLIPS and launched, the song playing.
1. Press FX. On LENGTH turn K1 left 8 clicks: 8 STEPS.
2. Listen for two bars. Turn K1 right 8 clicks.
You should hear: with 8 steps the first half of the clip twice a bar; back at 16 the second half is empty (NOTES PAST THE END REMOVED was shown). FX on the STEP page brings the notes back. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T71. Copy a clip (tabby-v04.10)
Set up: the song stopped and saved, a clip selected on CLIPS.
1. Press FX. Turn K5 to COPY TO PAD. The line shows an empty pad.
2. Press the > button. Press FX.
You should see: COPIED - THE COPY IS OPEN; the pad you copied to holds a clip and is selected; UNSAVED until you save. Launch it: it plays the same notes. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T72. The click as a MIDI note, and the count-in (tabby-v04.10)
Set up: a drum machine or a DAW on MIDI out, listening on channel 10. The song stopped.
1. Press FX on CLIPS. Set COUNT-IN to 1 CYCLE, CLICK to ALWAYS, CLICK OUT to MIDI NOTE. Press FX.
2. Select a clip. Press SEQ REC, then SEQ PLAY.
You should hear: four clicks (note 37 on channel 10), the first louder, then the song starts on the next beat and the click goes on with it. The screen shows COUNT-IN 4, 3, 2, 1. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T73. The internal click (tabby-v04.10)
Set up: T72 done. Headphones or speakers on the SMK-37.
1. Set CLICK OUT to INTERNAL. Press SEQ REC, then SEQ PLAY.
2. Turn K8 down and up.
You should hear: the click from the SMK-37 itself, higher on the first beat of the bar; K8 changes its level with everything else. Set CLICK to OFF and COUNT-IN to OFF when you are done, and save. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T74. Store a scene (tabby-v04.10)
Set up: the song playing, a clip launched by hand on one track.
1. Press SCALE for SCENES. Press an empty pad short: HOLD TO STORE WHAT PLAYS AS A SCENE.
2. Hold the same pad for half a second.
3. Recall scene 1, then the new scene.
You should see and hear: STORED AS A NEW SCENE; the scene count goes up by one; recalling the new scene brings back the clips that played when you stored it. A pad that holds a scene only recalls it when held. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________


T75. A clip chain (tabby-v04.11)
Set up: a track with two clips that sound different, the song stopped.
1. Select the first clip, press FX. Set NEXT CLIP to the second clip and TIMES to 2. Press the > button (SAVED). Press FX.
2. Select the second clip, press FX. Set NEXT CLIP to STOP. Save. Press FX.
3. Press the first clip's pad, then SEQ PLAY.
You should hear: the first clip twice, then the second clip once, then the track is silent while the others play on. The CLIPS page shows +02 and later +STP under the track. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T76. A fill-in with AFTER (tabby-v04.11)
Set up: T75 done. A third clip as a fill.
1. On the fill clip set NEXT CLIP to the first clip and AFTER to 4 STEPS. Save.
2. With the song playing, press the fill's pad.
You should hear: the fill starts on the next bar, plays 4 steps, and the first clip takes over from its beginning. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________


T77. The scene chain (tabby-v04.12)
Set up: a song with at least three scenes, stopped, SCENES page.
1. Press pad 2: RESERVED - SEQ PLAY STARTS HERE. Turn K1 one click right. Press SEQ PLAY.
2. Watch the SCENE number. When scene 3 plays, turn K3 right (CHAIN HELD). After a while turn it left.
3. Press pad 1.
You should see and hear: the song starts at scene 2, which plays one time more than before; scene 3 follows by itself and repeats while the chain is held; pad 1 jumps to scene 1 and the song goes on from there. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________


T78. A clip's program change (tabby-v04.13)
Set up: a synth on MIDI out that shows its program number, on the track's channel. The song stopped.
1. Select a clip, press FX, set PROGRAM to 6. Save. Press FX.
2. Press the clip's pad, then SEQ PLAY. Later launch another clip of the track, then this one again.
You should see: the synth goes to program 6 each time the track enters the clip, not on every loop. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T79. Record a knob (tabby-v04.13)
Set up: a clip launched and looping, a synth on MIDI out that reacts to controller 74 (filter).
1. Turn K1 on the CLIPS page. The screen shows K1 CONTROLLER 074 and a value; the synth's filter moves.
2. Press SEQ REC. Turn K1 slowly down and up over one bar. Press SEQ REC.
You should hear: the filter movement comes back in every loop. On the STEP page EVENTS has grown by a dozen or so, not by hundreds. FX on the STEP page takes the take back. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T80. The click level (tabby-v04.14)
Set up: headphones or speakers on the SMK-37's audio output. A song loaded, stopped. CLICK on ALWAYS and CLICK OUT on INTERNAL (4.11).
1. Press FX on CLIPS. Turn K5 to CLICK LEVEL on page 3/3. It says MID.
2. Press SEQ PLAY. Turn K1 left to LOW, then right to HIGH.
You should hear: the click gets clearly quieter on LOW and louder on HIGH, without a crackle. HIGH is about as loud as a note you play. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T81. Choose a knob's controller (tabby-v04.14)
Set up: a synth or a MIDI monitor on MIDI out. A song loaded, stopped.
1. Press FX on CLIPS. Turn K5 to K1 CONTROLLER. Turn K1 until it says 7. Press the > button: SAVED.
2. Press FX. Turn K1.
You should see: the screen says K1 CONTROLLER 007 and a value, and the monitor shows controller 7 (volume on most gear). Load another song and come back: it is still 7. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T82. A backup the page cannot read (tabby-v04.14)
Set up: only if you have a song saved by firmware newer than the page you open. Otherwise skip.
1. Open the older page. In Projects & sounds click Full backup.
You should see: the backup line says STOPPED at song n: this page cannot read it, and what to do. No file is downloaded. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T83. Transpose a clip (tabby-v04.15)
Set up: a clip with notes, launched and looping. A synth on MIDI out, or the track's own sound.
1. Press FX on CLIPS. Turn K5 to TRANSPOSE. Turn K1 to +3.
2. Listen for two loops. Turn K1 back to 0.
You should hear: from the next loop every note is three semitones higher; at 0 the clip sounds as before. The screen shows UNSAVED until you save. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T84. Delete a clip (tabby-v04.15)
Set up: the song stopped. Make a copy of a clip first (COPY TO PAD), so nothing you need is lost.
1. Select the copy, press FX, turn K5 to DELETE CLIP. Press the > button once.
2. Wait three seconds. Press it once more. Then press it twice quickly.
3. Select a clip that a scene plays and try the same.
You should see: one press, and presses three seconds apart, only ask (PRESS AGAIN TO DELETE THE CLIP). Two quick presses: CLIP DELETED - SAVE THE SONG and the pad goes dark. The scene's clip stays: USED BY SCENE n - NOT DELETED. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T85. Delete and move a scene (tabby-v04.16)
Set up: a song with three or more scenes, stopped. Use a copy of a song you need, or do not save at the end.
1. On SCENES press pad 2. Hold PARA and turn K1 one click left, then one click right.
2. Press FX once. Wait three seconds. Press FX twice quickly.
3. Press SEQ PLAY. Press FX twice. Press SEQ PLAY to stop.
You should see: SCENE MOVED - SAVE THE SONG twice; pad 1 blinks after the first move and pad 2 after the second. One FX press only asks (FX AGAIN DELETES SCENE 002). Two quick presses: SCENE DELETED - SAVE THE SONG and the song has one scene less. While playing: STOP TO DELETE OR MOVE A SCENE and nothing changes. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T86. A stop takes an armed take off (tabby-v04.16)
Set up: a song playing, track 1 following the scenes. On CLIPS select a clip of track 1 that is not playing now (hold its pad for half a second).
1. Press SEQ REC. Before the next bar line press SEQ PLAY to stop the song.
2. With the song stopped press SEQ REC. Wait five seconds. Press SEQ REC again.
You should see: REC WHEN THE CLIP LOOPS and the SEQ REC lamp; after the stop SONG STOPPED - REC OFF and the lamp out. Stopped: REC ARMED - SEQ PLAY STARTS IT, and the lamp stays lit until the second press. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T87. Shuffle a clip (tabby-v04.17)
Set up: a clip with notes on every 16th step (a hi-hat line is best), launched and looping. A synth on MIDI out, or the track's own sound.
1. Press FX on CLIPS. Turn K5 to SHUFFLE (page 2/3). It says SONG.
2. Turn K1 right to 50 PERCENT. Listen for two loops. Turn K1 left to 0 PERCENT, then one more click to SONG.
You should hear: at 50 PERCENT every second 16th comes late, a triplet feel; at 0 PERCENT and at SONG (in a song without swing) the line is even again. UNSAVED shows until you save. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T88. Play quantize (tabby-v04.17)
Set up: a clip you recorded with input quantize off (KNOB BANK and SEQ REC before the take), played a little loose, launched and looping.
1. Press FX on CLIPS. Turn K5 to PLAY QUANTIZE (page 2/3). It says OFF.
2. Turn K1 to 1/16. Listen for two loops. Turn K1 back to OFF.
3. Press PARA on CLIPS and look at a note's START on the STEP page (K3).
You should hear and see: at 1/16 every note is on its step; at OFF your own timing is back. The START values on the STEP page never changed. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T89. Step size (tabby-v04.19)
Set up: a clip of 16 steps with notes, launched and looping, on a track that follows no scene (launch it from its pad).
1. Press FX on CLIPS. Turn K5 to STEP SIZE (page 2/3). It says 1/16.
2. Turn K1 one click right: 1/8. Listen. One click more: 1/32. Listen. One click more.
3. Turn K1 back to 1/16. Turn K5 to LENGTH, set 12 steps. Turn K5 to STEP SIZE and turn K1 right until it says 1/16T.
You should hear and see: at 1/8 the clip plays at half speed and the line says = 32 16THS; at 1/32 double speed, = 8 16THS; the third click changes nothing (triplet sizes do not fit 16 steps). With 12 steps, 1/16T plays three steps to each 8th note and says = 8 16THS. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T90. Direction (tabby-v04.20)
Set up: a clip of 16 steps with a melody you know, launched and looping.
1. Press FX on CLIPS. Turn K5 to DIRECTION (page 2/3). It says FORWARD.
2. Turn K1 one click right: REVERSE. Listen for two loops. One click more: FWD THEN REV. Listen for one long loop.
3. Press PARA on CLIPS while it plays in REVERSE and watch the pads. Turn DIRECTION back to FORWARD.
You should hear and see: REVERSE plays the melody backwards, in the same time; FWD THEN REV plays it forwards and then backwards, twice as long. On the STEP page the running light walks from the last pad to the first. FORWARD plays the clip as before. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T91. Shift a clip by a step (tabby-v04.21)
Set up: the song stopped, a clip with notes you can see on the pads open on the STEP page.
1. Note which pads are green. Hold KNOB BANK and press OCTAVE+.
2. Hold KNOB BANK and press OCTAVE- twice.
3. Press FX.
You should see: after step 1 every green pad is one pad further right, and a note on pad 16 is on pad 1: CLIP SHIFTED ONE STEP LATER. After step 2 they are one pad left of where they began: CLIP SHIFTED ONE STEP EARLIER. FX puts them back where they began. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T92. Clear notes during a take (tabby-v04.21)
Set up: a clip that plays one note on every beat, selected on CLIPS. The song stopped.
1. Press SEQ REC, then SEQ PLAY. Wait for RECORDING.
2. Press FX once and let go.
3. Hold FX, then hold the key of that note for one whole pass of the clip. Let both go.
4. Play another key once. Press SEQ PLAY to stop. Press PARA, then FX.
You should hear and see: step 2 changes nothing and says HOLD FX + A KEY: CLEARS ITS NOTES. In step 3 the clip's notes fall away one by one as the clip reaches them; after the pass the clip is silent. The key in step 4 is recorded. FX on the STEP page brings the old notes back. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T93. A new song on the panel (tabby-v04.21)
Set up: the song stopped. You need one empty song slot.
1. BT, then SCALE. Turn K5 to a slot that says NO SONG.
2. Press SEQ and PARA together. Turn K1 to NEW SONG. Press the > button twice.
3. Hold pad 1 for half a second. Press SEQ REC, then SEQ PLAY. Play a few keys. Press SEQ PLAY.
4. Press the > button.
5. Open ACTIONS again and try NEW SONG on the same slot.
You should see: NEW SONG IN SLOT nn?, then NEW SONG - HOLD A PAD, SEQ REC and the CLIPS page with every pad dark. After step 3 pad 1 holds your clip; after step 4 it is saved. Step 5 says SLOT HOLDS A SONG - K5 ON SCENES and changes nothing. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T94. Note repeat (tabby-v04.22)
Set up: the overview, the song stopped, the ARP of track 1 off (the top line says LIVE). Something that plays track 1's MIDI, or the SMK-37's own sound.
1. Hold NOTE REPEAT. Hold a key for two seconds. Let the key go, then NOTE REPEAT.
2. Hold NOTE REPEAT, hold a key, and turn K1 one click right, then one click left. Let both go.
3. Tap NOTE REPEAT without a key. Then hold KNOB BANK and tap NOTE REPEAT twice.
You should hear and see: in step 1 the note repeats in 16ths and stops when NOTE REPEAT is let go; the screen says NOTE REPEAT 1/16 - HOLD A KEY OR PAD and the NOTE REPEAT lamp is lit while you hold it. In step 2 it repeats twice as fast (1/32) and then as before. In step 3 the tap alone changes nothing; KNOB BANK with NOTE REPEAT shows PAD READY - PARA / FX, then KEY READY - PARA / FX. [checked in simulator]
Result: PASS / FAIL   Notes: ________________________________


7. KNOWN LIMITS AND WHAT IS NOT BUILT YET
=========================================

Do not spend time testing these. They are known.

- MIDI timing (tabby-v04.4 and later): one line stays within about 2 ms and eight lines within about 3 ms of their times, on DIN and USB. On DIN eight notes at the same step still take 9 ms to pass the cable one after the other.
- A new song made on the panel (4.11, tabby-v04.21) is always called NEW SONG; its name is changed in the workbench. Note repeat (4.1) is the track's arpeggiator: one held note repeats, a held chord is played as an arpeggio, not as a repeated chord. Not built: a step loop while a pad is held. The click and count-in settings are stored in each song, not once for the device.
- One clip can be unsaved at a time, and a clip two tracks share cannot be edited on the device.
- External clock in song mode (tabby-v04.3.1): the clock must come over USB or Bluetooth; the TRS jack cannot receive it. Song Position Pointer moves the song through its rows and repeats; a position past the end of a song that does not loop goes to its last step. The song sends no clock of its own while it follows.
- The TRS jack is output only. A DIN clock cannot come in through it. Use USB or Bluetooth for clock in.
- The MC-707 workflow: clip launching, scenes and mute are on the panel from tabby-v04.7 (4.8). Step editing (4.9), recording (4.10), new clips, lengths, copies, the click and stored scenes (4.11) followed. Clip chains (4.12), the scene chain (4.13) and a clip's program and the controller knobs (4.14) followed.
- A mute set on the mixer page, and the mute tracks 6 and 7 of a new project start with, silence the SMK-37's own sound only; the song still plays those tracks on MIDI out. KNOB BANK and pad 9 to 16 mutes both.
- OUT PORT is one setting for all tracks. You cannot send track 1 on the TRS jack and track 2 on USB.
- A clip holds up to 512 events (notes and controller events together) and up to 128 steps. A song holds up to 128 rows and 2048 blocks. The device holds 16 songs. The step editor in the workbench still shows 64 steps and four notes per step; larger clips come from the importer.
- A clip's own program change goes out together with its first note. If your gear needs time to change sounds, use a row event with a pre-roll (5.2) instead.
- Bluetooth MIDI adds delay. Use cables for notes and clock.
- The factory restore overwrites the last 10 sectors of song storage.
- Some old screen texts are still wrong in the firmware and will be fixed in a later firmware release:
  - The SYNC / MIDI page and the KNOB BANK list now say SEQ+PARA: ACTIONS and NOTE REPEAT KEY-PAD, and the erase message says ERASE OLD DATA (fixed in tabby-v04.2).
  - K2 CLK IN can still be turned to DIN in the choices, though the line no longer lists it. It receives nothing.
  - SAMPLER is still in the sound list inside the firmware but cannot be chosen.
- The page badge and the boot screen show tabby-v04.22.


8. HOW TO REPORT A PROBLEM
==========================

Send these five lines.

1. Test number: for example T30.
2. What I did: the buttons I pressed in order.
3. What happened: what I saw or heard.
4. What the screen said: the exact words. Take a photo if you can.
5. The version: from the boot screen, and the page version in the workbench.

If a write or an install failed, also say which page you used and what the page said. Do not try the install a second time before you report.
