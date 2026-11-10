CLASSIC TABBY TESTING AND USER GUIDE
====================================

Version 1.0, 2026-11-10. For tabby-v04.1.1 on the M-VAVE SMK-37 Pro.
Written for the person who plays and tests the device. No programming needed.

tabby-v04.1.1 has the same firmware code as tabby-v04.1. What is new is the
workbench page: English only, corrected Help, and this guide. If tabby-v04.1 is
already on your SMK-37, you do not have to install again.

How to read this guide
----------------------

- K1 to K8 are the eight knobs, counted from the left.
- The firmware calls K5 SELECT, K6 PAGE, K7 PRESETS and K8 MASTER. This guide uses K5, K6, K7 and K8.
- "The 4th button in the left group" is the button after SHIFT, FADER BANK and HOME. The firmware calls it SAVE. It is not printed SAVE. On the device screen it shows as 4TH LEFT BTN.
- "Press" means a short tap. "Turn K5 right" means clockwise.
- Text in capitals, like SONG MODE, is what the device screen shows.
- Every device step was run in the simulator against the current source. A step that could not be run there ends with the words "not checked in simulator" in square brackets. The simulator has no USB, no real synths and no flashing, so those steps are always marked.


1. WHAT CLASSIC TABBY IS TODAY
==============================

Classic Tabby is a performance MIDI sequencer firmware for the SMK-37 Pro. It started as M-VAVE's open firmware, SMK37 Open V01, and is built and changed by you on Linux.

You write songs on the computer. You import a MIDI file or type notes in the workbench, which is a web page in Chrome. You send the song to the SMK-37 over USB. Then you play it from the panel.

A song is a list of rows. Each row gives each of the 8 tracks one pattern of up to 64 steps. A step holds up to 4 notes. The device holds 16 songs, each with up to 128 rows.

The SMK-37 is the clock master. It sends MIDI Clock, Start, Stop and Song Position to your gear. It changes scenes on the bar. It can launch a pattern on one track while the others follow the song. It sends program changes and control changes to your synths and effects when a row starts.

The SMK-37 still has its own sounds: DX7 FM (called FM6 here), BASS 303, DRUM 808, PSG and PLUCK. In a song they let you hear a part before you give it to outside gear.

The SMK-37 keys and pads play live. There is no step editing and no recording on the device. Songs come from the workbench.


2. WHAT CHANGED
===============

2.1 Changed from M-VAVE's stock Open V01
----------------------------------------

Added:
- Song mode: 16 songs, up to 128 rows, 8 tracks, up to 4 notes per step.
- MIDI file import in the workbench.
- Exact note timing, to 1/480 of a step.
- Scene changes: jump to any row on the next bar.
- Track launching: one track loops its own pattern while the others follow the song.
- Row events: program changes, bank selects and control changes sent when a row starts.
- A rig setup and a device library in the workbench for your gear.
- Full backup and restore of the whole device from the workbench.
- A SYNC / MIDI page on the SEQ button.
- A Diagnostics panel with timing counters.
- STOP TO SAVE: no flash writes while something plays.
- The version name on the boot screen and in the workbench.

Removed:
- The sampler and its sample bank.
- The DX7 user voice library on the device.
- Editing steps on the device, and recording. The STEP DETAILS, LOCKS and RHYTHM pages, REC, the count-in, the metronome, pad-step mode, and copy, paste, clear and repeat are gone.
- DX7 operator editing on the device. The DX7 quick page stays.
- The Bluetooth page and the project NAME page on the device. Both moved to the workbench.
- The factory scenes. HOME lists your 16 project slots.
- The old Enable force flash button on the update page.

2.2 What each Classic Tabby release changed
-------------------------------------------

- tabby-v01.0: Stock Open V01, built on Linux, nothing changed.
- tabby-v02.0: Song mode, MIDI file import, row events and the device library. The sampler and the DX7 user library are removed.
- tabby-v03.0: Exact note timing, track launching, lead time per channel in the rig, Bluetooth settings in the workbench.
- tabby-v03.1: A new manual in the Help tab. The version shows on the boot screen and in the workbench.
- tabby-v03.2: The Wrong Room rig profile, four new device profiles, the importer sets the output channel from the file, the MIDI writing guide.
- tabby-v03.3-diag: Full backup and restore, the timing counters, the Diagnostics panel. A test build.
- tabby-v04.0: Storage moved (back up first). Step editing and recording removed. The SYNC / MIDI page. STOP TO SAVE. ERASE OLD DATA. A permanent recovery page for every build.
- tabby-v04.1: Timing fixes: the screen and workbench work wait their turn so MIDI goes out first. Knob and button names fixed. The update page is safer: no force flash button.
- tabby-v04.1.1: Same firmware as v04.1. English-only workbench, corrected Help, this guide.


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

Install is only needed when you want a new firmware. For tabby-v04.1.1 it is optional.

1. Open https://seattleuser0.github.io/classic-tabby/ in Chrome.
2. Make a Full backup first (section 5.5). Keep the file.
3. Click the Device update tab. Check the Version line.
4. Click Connect device. Allow MIDI with SysEx when Chrome asks.
5. Read the identity line. It must say SMK-37 Pro_8000001. Anything else: stop.
6. Tick the box saying you have made a backup.
7. Click Start update. Keep the tab open. Keep power and USB connected. It takes one to two minutes.
8. When the page says done, the SMK-37 restarts. The boot screen shows SMK37, OFFICIAL OPEN and the version.

Never tick Force flash for a Classic Tabby update. It is only for the first move from the factory firmware.

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

At start, the keys play track 1 on MIDI channel 1. The pads play track 8 on channel 10. The bottom line of HOME says KEY T1 CH01 and PAD T8 CH10.

1. Press HOME until the overview shows eight tracks.
2. Press a key. You hear track 1. MIDI goes out on channel 1. The lowest key is note 48 (C3).
3. Press pad 1. You hear the 808 kick on track 8. MIDI goes out on channel 10, note 36.
4. Press OCT+ to move the keys up one octave each press. Press OCT- to move down.
5. Tap PAD / STEP to move the playing focus to the pads. The top shows PAD DRUM and the bottom says PAD READY - EDIT / FX. Tap PAD / STEP again to go back to the keys.
6. Hold SHIFT. The screen lists the shortcuts. Pads 1 to 8 select a track. Pads 9 to 16 mute or unmute a track.

On the SHIFT list, the line PAD/STEP STEP EDIT is an old screen text. There is no step editing.

4.2 Choosing an FM6 (DX7) sound and its quick page
--------------------------------------------------

1. On HOME, turn K5 to select the track you want.
2. Hold SHIFT and press the button marked HOME / SRC. It is the 7th button in the right group, after ARP, PAD / STEP, SCL, ENV, MIX and BT. Do not use the HOME button in the left group: it does not open this page. The SOUND SOURCE page opens.
3. Turn K1 until DX7 FM is lit. Or press pad 1.
4. Press the 4th button in the left group. The page says SOUND SOURCE APPLIED.
5. Press EDIT. The DX7 QUICK EDIT page opens. It shows the voice number out of 128 and the voice name.
6. Turn K7 to choose the voice. Turn K6 to change the bank, A to D.
7. Turn K1 for ALGORITHM, K2 for FEEDBACK, K3 for TRANSPOSE and K4 for LEVEL.
8. Press EDIT again to go back. A star near the top means the track has unsaved changes.

On any other sound, pressing EDIT only says VOICE EDIT MOVED TO WORKBENCH. Other sounds are edited in the workbench.

4.3 Track roles: PROJECT, LIVE, OFF
-----------------------------------

- PROJECT: the track follows the project you load.
- LIVE: the track keeps its sound and held notes when you load another project.
- OFF: the track is switched off and frees its memory.

1. Hold SHIFT and press HOME / SRC (the 7th button in the right group). The SOUND SOURCE page opens for the selected track.
2. Turn K2 right. TRACK goes PROJECT, then LIVE, then OFF. Turn K2 left to go back.
3. The screen explains each choice under the line. Press HOME to leave.

4.4 MIDI channels and output per track
--------------------------------------

Each track has its own input channel, output channel, local or MIDI choice and port.

1. Hold SHIFT and press SEQ. The MIDI TRACK page opens.
2. Turn K5 to choose the track. The top line shows T1 to T8.
3. K1 IN CH is the channel the track listens to from USB or Bluetooth.
4. K2 OUT CH is the channel the track sends on. When it changes, the screen says MIDI SETTING - NOTES RELEASED.
5. K3 SEQ: LOCAL plays the built-in sound only. BOTH plays the built-in sound and sends MIDI. MIDI sends MIDI only.
6. K4 OUT PORT: ALL sends on USB, Bluetooth and the TRS jack. OFF sends nothing from this track. Turn K4 left for OFF.
7. Press HOME to leave.

The port setting is the same for all tracks. A song's own output channel for a track wins while the song plays. When the song stops, the device setting is back.

4.5 The SYNC / MIDI page: clock source, tempo, swing
----------------------------------------------------

1. Press SEQ on any page. The SYNC / MIDI page opens.
2. K1 CLOCK: INT uses the SMK-37's own clock. MIDI waits for an outside clock. Turn K1 right for MIDI, left for INT.
3. K2 CLK IN: AUTO, USB, BLE or DIN. Choose USB or BLE for a clock from outside. Do not choose DIN: the TRS jack receives nothing.
4. K3 SWING: 0 to 50 percent. It is saved in the project.
5. K4 SEQ OUT: OFF sends no notes and no clock. ON sends notes and clock. CLOCK sends clock and Start and Stop only.
6. K7 KEY OUT: ON or OFF. It switches the MIDI out of the keys and pads.
7. The tempo is not on this page. It says BPM: SET ON HOME K4.

With CLOCK on MIDI, the screen says WAIT MIDI CLOCK until a clock arrives. Songs cannot start then. Keep CLOCK on INT for songs.

Tempo: on HOME turn K4. Or tap the tempo: hold HOME and tap SEQ. The first tap says TAP AGAIN / HOME+SEQ.

4.6 The ACTIONS menu
--------------------

1. Press SEQ and EDIT together. The ACTIONS menu opens.
2. Do not hold SEQ alone. It does not open ACTIONS in this firmware, even though the SYNC / MIDI page says HOLD SEQ: ACTIONS.
3. The first line shows the storage: USER 471040 SONG READY. FREE and RECLAIM show at the bottom.
4. Turn K1 or K5 to choose an entry. Press the 4th button in the left group to run it. HOME leaves.
5. The entries are: COPY TIMBRE, PASTE TIMBRE, STOP ALL / REWIND, ERASE OLD DATA, SONG MODE, COMPACT SONG STORAGE and SEND SETUP.
6. STOP ALL / REWIND stops all sound and rewinds. It is in the list; on its own it shows DONE.

4.7 Song mode: choose a song, play, jump to a row
-------------------------------------------------

You need a song on the device first (section 5.3).

1. Press SEQ and EDIT together to open ACTIONS.
2. Turn K5 until SONG MODE is lit. Press the 4th button in the left group. The SONG page opens.
3. Turn K5 or K7 to choose song 1 to 16. An empty slot says NO SONG HERE - UPLOAD FROM THE WEB WORKBENCH.
4. Make sure the project you want is loaded. The song uses whatever project is loaded. It does not load one for you.
5. Press PLAY. The page says PLAYING. ROW, X (the pass of the repeat) and BAR show where it is. NEXT ROW shows what follows. Press PLAY again to stop.
6. To jump: press a pad. The pad number is the row on the pad page. The page shows JUMP TO ROW n in amber. The jump lands on the next bar. Then the page shows the new ROW.
7. K4 switches JUMP: NEXT BAR and JUMP: ROW END. [not checked in simulator]
8. OCT+ and OCT- move the pad page by 16 rows. [not checked in simulator]
9. A pad with no row, or a press while the song is stopped, says NO SUCH ROW / NOT PLAYING.
10. Press HOME to leave the page. The song keeps playing.

A song needs the internal clock. With CLOCK on MIDI, the SONG page shows SONG NEEDS INTERNAL CLOCK and does not start. [not checked in simulator]

4.8 Track launching
-------------------

Track launching lets one track loop one of its patterns while the others follow the song. A track's pattern 5 is the block that track has in row 5.

1. Start a song on the SONG page. Press SCL. The page says LAUNCH and shows the track, for example T1.
2. Hold SHIFT and press a pad from 1 to 8 to choose a track. The screen says TRACK SELECTED.
3. Press a pad. The pad shows the pattern. The screen says LAUNCH AT NEXT BAR. The column for the track shows Q and a number. On the next bar it shows PLAY.
4. To stop the track: press the green pad. The screen says STOP AT NEXT BAR. The column shows >STOP, then STOP.
5. To bring the track back to the song: press ENV. The screen says TRACK BACK TO SONG AT NEXT BAR. The column shows >SONG, then FOLLOW. SHIFT and ENV together bring every track back.
6. OCT+ and OCT- move the pattern page by 16 rows. The page then shows PATTERNS 017 - 032.
7. Press SCL to go back to the SONG page. Press PLAY to stop the song.

A jump on the SONG page cancels every launch and brings all tracks back to the song.

4.9 Saving a project, and the STOP TO SAVE rule
-----------------------------------------------

Your sounds, mixer and MIDI settings live in a project. There are 16 project slots.

1. Press the 4th button in the left group. The SAVE PROJECT page opens. It shows USER 01/16 and a working name.
2. Turn K5 or K7 to choose the slot. K1 moves the cursor in the name and K2 changes the letter.
3. Press the 4th button again. The screen says PROJECT SAVED and goes back to the overview.
4. HOME cancels without saving.

STOP TO SAVE: while a song or pattern plays, the device writes nothing to flash. If you press the 4th button a second time while something plays, the page says STOP TO SAVE in orange. Stop the song, then save. Changes you made while playing are kept and can be saved after the stop.

The same rule holds for ERASE and COMPACT in ACTIONS and for any write from the workbench.

4.10 Loading a project
----------------------

1. On the overview, press HOME. The PRESETS list opens.
2. Turn K5 or K7 to pick a project, or press a pad from 1 to 16 to load it directly.
3. Press PLAY to load and run. An empty slot says EMPTY SLOT - CHOOSE ANOTHER.
4. HOME goes back. HOME with the 4th button undoes the last change.

4.11 Erasing old data
---------------------

After a storage move, the device can announce OLD DATA IN SONG STORAGE - SEE ACTIONS for six seconds. Then the SONG page cannot write or play songs. The ACTIONS first line says SONG OLD DATA.

1. Press SEQ and EDIT together. Turn K1 or K5 to ERASE OLD DATA.
2. Press the 4th button in the left group. The screen says ERASE OLD DATA? and, at the bottom, 4TH LEFT BTN CONFIRM and HOME CANCEL.
3. Press the 4th button again. The page says DONE and the first line changes to SONG READY.
4. Nothing is erased without the second press. Projects, tunings and settings are never touched.

4.12 Other useful controls
--------------------------

- MIX: tap to open the mixer. Pads 1 to 8 mute. Pads 9 to 16 solo. Tap MIX again to leave.
- FADER BANK: moves the four faders between tracks 1 to 4 and 5 to 8. Move a fader through its shown level to take over.
- ARP: tap to switch the arpeggiator on or off for the track. Hold about 0.6 seconds for its settings.
- FX: reverb and delay sends for the selected track.
- BT: only says BLUETOOTH: SET IN WORKBENCH.
- REC: only says NO REC IN THIS VERSION.
- HOME and PLAY together: stop all sound and rewind. [not checked in simulator]


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

A factory restore overwrites the last 40 KB of song storage. Export your songs as .tabby files first.

[not checked in simulator]

5.6 The Diagnostics panel
-------------------------

1. In Projects & sounds, open Diagnostics (timing counters and control-loop profile).
2. Click Reset counters. Play a song for the time you want to measure.
3. Click Read counters. Click Copy as text to paste the numbers into a message.
4. The counters show the control loop period, the longest flash erase and write, the time from a key press to MIDI, and busy time and lost ticks.

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
You should see: SMK37, OFFICIAL OPEN and the version line. Then the HOME overview.
Result: PASS / FAIL   Notes: ________________________________

T2. HOME overview
Set up: T1 done.
1. Look at the overview.
You should see: 8 tracks listed, BPM 120 or your project's tempo, and at the bottom KEY T1 CH01 PAD T8 CH10.
Result: PASS / FAIL   Notes: ________________________________

T3. Storage state
Set up: T2 done.
1. Press SEQ and EDIT together.
You should see: ACTIONS with the first line USER 471040 SONG READY. FREE and RECLAIM at the bottom. Press HOME to leave.
Result: PASS / FAIL   Notes: ________________________________

GROUP B. PLAYING
----------------

T4. Keys
Set up: HOME overview.
1. Press the lowest key, then a key in the middle.
You should hear: track 1's sound. The outside MIDI shows channel 1, lowest key note 48. (Check the MIDI note on a monitor if you have one.) [not checked in simulator] (the monitor)
Result: PASS / FAIL   Notes: ________________________________

T5. Pads
Set up: HOME overview.
1. Press pad 1, then pad 2.
You should hear: the 808 drum sounds on track 8. MIDI goes out on channel 10, pad 1 is note 36.
Result: PASS / FAIL   Notes: ________________________________

T6. Octave buttons
Set up: HOME overview.
1. Press OCT+ twice. Press a key.
2. Press OCT- four times. Press the same key.
You should hear: two octaves higher, then two octaves lower than the start. MIDI notes: start 60, then 84, then 36 for the same key.
Result: PASS / FAIL   Notes: ________________________________

T7. Keys and pads focus
Set up: HOME overview.
1. Tap PAD / STEP.
2. Press pad 1.
3. Tap PAD / STEP again.
You should see: PAD DRUM at the top and PAD READY - EDIT / FX at the bottom after step 1. Pad 1 still plays the kick. After step 3 the top shows KEY PLAY again.
Result: PASS / FAIL   Notes: ________________________________

T8. Mute with SHIFT and a pad
Set up: HOME overview.
1. Hold SHIFT. Press pad 9. Release SHIFT.
2. Hold SHIFT. Press pad 9 again.
You should see: track 1 shows MUTE, then the mute goes away. The screen says TRACK MUTE CHANGED.
Result: PASS / FAIL   Notes: ________________________________

T9. Mixer
Set up: HOME overview.
1. Tap MIX.
2. Press pad 1.
3. Tap MIX again.
You should see: the mixer with MUTE and SOLO cells. Pad 1 mutes track 1. The overview comes back after step 3.
Result: PASS / FAIL   Notes: ________________________________

GROUP C. SOUNDS AND TRACKS
--------------------------

T10. Choose the FM6 sound
Set up: HOME overview.
1. Turn K5 to select track 3 (PSG).
2. Hold SHIFT, press HOME / SRC (the 7th button in the right group). Turn K1 left to DX7 FM. Press the 4th button in the left group.
You should see: SOUND SOURCE page with DX7 FM lit, then SOUND SOURCE APPLIED on the overview. Track 3 now says DX7 FM. To hear it, select track 3 and play the keys.
Result: PASS / FAIL   Notes: ________________________________

T11. FM6 quick page
Set up: T10 done, track 3 selected.
1. Press EDIT.
2. Turn K7 three clicks. Turn K6 one click. Turn K1 two clicks.
3. Press EDIT.
You should see: DX7 QUICK EDIT. The voice number changes with K7. The bank changes with K6. ALGORITHM changes with K1. A star shows at the top. Back on the overview, the track shows EDITED.
Result: PASS / FAIL   Notes: ________________________________

T12. Other sounds say "moved to workbench"
Set up: HOME overview, track 2 (BASS 303) selected.
1. Press EDIT.
You should see: VOICE EDIT MOVED TO WORKBENCH.
Result: PASS / FAIL   Notes: ________________________________

T13. Track roles
Set up: HOME overview.
1. Hold SHIFT, press HOME / SRC. Turn K2 right once, then once more.
You should see: PROJECT, then LIVE with KEEP SOUND ON PROJECT LOAD, then OFF with TURN K2 LEFT TO ENABLE. Turn K2 left twice to get back to PROJECT.
Result: PASS / FAIL   Notes: ________________________________

T14. Input and output channels per track
Set up: HOME overview.
1. Hold SHIFT, press SEQ. Turn K5 to track 4.
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
Set up: HOME overview.
1. Press SEQ.
You should see: SYNC / MIDI with CLOCK, CLK IN, SWING, SEQ OUT, KEY OUT and the line BPM: 120 SET ON HOME K4.
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
Set up: HOME overview.
1. Turn K4 five clicks right.
2. Hold HOME and tap SEQ twice.
You should see: BPM goes up by five. The first tap says TAP AGAIN / HOME+SEQ. The second tap sets a tempo from your tapping.
Result: PASS / FAIL   Notes: ________________________________

GROUP E. ACTIONS, PROJECTS AND SAVING
-------------------------------------

T21. The ACTIONS menu
Set up: HOME overview.
1. Press SEQ and EDIT together.
2. Turn K5 right until you have seen all seven entries.
You should see: COPY TIMBRE, PASTE TIMBRE, STOP ALL / REWIND, ERASE OLD DATA, SONG MODE, COMPACT SONG STORAGE, SEND SETUP. The bottom line says K1/K5 ACTION 4TH LEFT BTN DOES IT.
Result: PASS / FAIL   Notes: ________________________________

T22. Holding SEQ alone
Set up: HOME overview.
1. Hold SEQ alone for two seconds.
You should see: SYNC / MIDI opens, not ACTIONS. This is expected. The page text HOLD SEQ: ACTIONS is wrong.
Result: PASS / FAIL   Notes: ________________________________

T23. Save a project
Set up: HOME overview. Nothing playing.
1. Press the 4th button in the left group.
2. Turn K7 two clicks.
3. Press the 4th button again.
You should see: SAVE PROJECT with USER 01/16 and a name. Slot 03 after step 2. PROJECT SAVED after step 3.
Result: PASS / FAIL   Notes: ________________________________

T24. STOP TO SAVE
Set up: a song loaded and playing (T29).
1. Press the 4th button. Press it again.
You should see: SAVE PROJECT, then STOP TO SAVE in orange. Nothing is written. Stop the song and save again: PROJECT SAVED.
Result: PASS / FAIL   Notes: ________________________________

T25. Load a project
Set up: T23 done. HOME overview.
1. Press HOME. Press pad 3.
You should see: the PRESETS list, then your saved project loaded.
Result: PASS / FAIL   Notes: ________________________________

T26. Erase old data
Set up: only if the device says OLD DATA IN SONG STORAGE. If it does not, write "not needed".
1. Press SEQ and EDIT together. Turn K1 or K5 to ERASE OLD DATA. Press the 4th button.
2. Check the screen. Press the 4th button again.
You should see: ERASE OLD DATA? and 4TH LEFT BTN CONFIRM. After the second press, DONE and SONG READY.
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
Set up: T28 done. Device on HOME. CLOCK on INT.
1. Press SEQ and EDIT together. Turn K5 to SONG MODE. Press the 4th button.
2. Turn K5 right to song 2, then left to song 1.
3. Press PLAY.
You should see: SONG 01 and the name. Song 2 empty says NO SONG HERE - UPLOAD FROM THE WEB WORKBENCH. After PLAY: PLAYING, ROW, X, BAR and NEXT ROW change as it goes.
Result: PASS / FAIL   Notes: ________________________________

T30. Jump to a row
Set up: T29 playing, a song with at least 3 rows.
1. Press pad 3.
You should see: JUMP TO ROW 003 in amber, then ROW 003 on the next bar. All tracks change together.
Result: PASS / FAIL   Notes: ________________________________

T31. Stop the song
Set up: T29 playing.
1. Press PLAY.
You should see: the page says STOPPED - PLAY STARTS. Every note is released. MIDI Stop is sent once.
Result: PASS / FAIL   Notes: ________________________________

T32. Song needs the internal clock
Set up: SYNC / MIDI with CLOCK on MIDI. Song selected.
1. Press PLAY on the SONG page.
You should see: SONG NEEDS INTERNAL CLOCK and no playing. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T33. Launch a pattern on one track
Set up: T29 playing.
1. Press SCL. Hold SHIFT and press pad 1. Release SHIFT.
2. Press pad 2.
3. Wait for the next bar.
You should see: LAUNCH T1, TRACK SELECTED, then LAUNCH AT NEXT BAR with a Q and a number. After the bar the column says PLAY. The other tracks go on with the song.
Result: PASS / FAIL   Notes: ________________________________

T34. Stop and bring a track back
Set up: T33 done.
1. Press the green pad.
2. Wait a bar. Press ENV.
3. Wait a bar.
You should see: STOP AT NEXT BAR and >STOP, then STOP. TRACK BACK TO SONG AT NEXT BAR and >SONG, then FOLLOW.
Result: PASS / FAIL   Notes: ________________________________

T35. A jump cancels launches
Set up: T33 done, track 1 launched.
1. Press SCL to go to the SONG page. Press a pad.
You should see: after the landing, every track follows the song again. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T36. Compact the storage
Set up: song storage with some old blocks (Storage status shows RECLAIM above zero), nothing playing.
1. Press SEQ and EDIT together. Turn K5 to COMPACT SONG STORAGE. Press the 4th button. Press it again.
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
You should see: numbers for the control loop, longest flash erase and write, and key-to-MIDI. Lost ticks is the number to watch. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

GROUP H. REAL GEAR
------------------

These tests need your gear. Use the Wrong Room rig channels from the MIDI guide, section 8, or your own. Cable the SMK-37 as in 3.1.

T43. An outside synth on its own channel
Set up: Proteus on channel 5 behind the H4MIDI (the H4MIDI sends channels 5 to 8 to the Proteus). Track 3 set to OUT CH 5, SEQ MIDI, OUT PORT ALL.
1. On HOME turn K5 to track 3. The bottom line shows KEY T3 and the channel. Press a key. Or play a song with a part on track 3.
You should hear: the Proteus, not the SMK-37. Nothing from the other synths. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T44. A program change to an effects pedal
Set up: Zoom MS-70CDR+ on channel 16 (set USB MIDI CH 16, see the Help chapter 08 checklist). A song with a Program event in row 2 for channel 16.
1. Send the song to the device. Press SEND SETUP if row 1 has events. Press PLAY.
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
1. Press PLAY on the SONG page.
You should see: the M8 starts with the SMK-37 and follows its tempo. Stop: it stops. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T47. Timing by ear
Set up: a song with the same hit on two devices, for example kick on the SMK-37 and a drum on the Proteus.
1. Play it for one minute.
You should hear: the hits close together. A small drift of 10 to 14 ms between channels is the known limit (section 7). Write down anything you can hear as a flam or a stumble. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________

T48. No stuck notes
Set up: T43 or T45 playing.
1. Press PLAY to stop in the middle of a long note.
You should hear: every note stops. MIDI Stop is sent once. [not checked in simulator]
Result: PASS / FAIL   Notes: ________________________________


7. KNOWN LIMITS AND WHAT IS NOT BUILT YET
=========================================

Do not spend time testing these. They are known.

- MIDI timing spread: about 10 to 14 milliseconds between notes. It comes from the SDK's 10 ms control timer. The planned A2 fix (the test build tabby-v04.2-diagA2) aims to bring it under 4 ms. It is not in tabby-v04.1.1.
- No step editing and no recording on the device. Songs come from the workbench. The metronome and count-in are planned for a later version.
- No external clock in song mode. A song runs on the internal clock. With CLOCK on MIDI the song does not start.
- The TRS jack is output only. A DIN clock cannot come in through it. Use USB or Bluetooth for clock in.
- The MC-707 workflow is still to come. It is the next big part of the plan.
- OUT PORT is one setting for all tracks. You cannot send track 1 on the TRS jack and track 2 on USB.
- A step holds up to 4 notes. A song holds up to 128 rows and 2048 blocks. The device holds 16 songs.
- Bluetooth MIDI adds delay. Use cables for notes and clock.
- The factory restore overwrites the last 10 sectors of song storage.
- Some old screen texts are still wrong in the firmware and will be fixed in a later firmware release:
  - HOLD SEQ: ACTIONS on the SYNC / MIDI page. Press SEQ and EDIT together instead.
  - PAD/STEP STEP EDIT on the SHIFT list. There is no step editing.
  - K2 CLK IN shows DIN as a choice. It receives nothing.
  - SAMPLER is still in the sound list inside the firmware but cannot be chosen.
  - ERASE OLD SAMPLE DATA on one rare message. It means ERASE OLD DATA.
- The page badge shows tabby-v04.1. That is correct: the firmware in this release is the tabby-v04.1 firmware. The page is v04.1.1.


8. HOW TO REPORT A PROBLEM
==========================

Send these five lines.

1. Test number: for example T30.
2. What I did: the buttons I pressed in order.
3. What happened: what I saw or heard.
4. What the screen said: the exact words. Take a photo if you can.
5. The version: from the boot screen, and the page version in the workbench.

If a write or an install failed, also say which page you used and what the page said. Do not try the install a second time before you report.
