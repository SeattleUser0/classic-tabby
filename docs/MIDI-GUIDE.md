# Writing MIDI files for Classic Tabby

<!-- docs/MIDI-GUIDE.template.md: the hand-written part of the guide. tools/linux/midi-guide.mjs
     (web/rig/guide.js) fills every placeholder token (double braces) from the rig profile and the device library and
     writes docs/MIDI-GUIDE.md; the workbench's Import MIDI panel generates the same file for the
     active rig. Edit this template, never the generated file. Version 0.1, 2026-11-05 (Task 09),
     from the hand-written guide of 2026-11-05 (tabby-v03.1). -->

Instructions for an AI model (Claude, ChatGPT or another) that writes Standard MIDI files to be imported into Classic Tabby, the custom firmware on an M-VAVE SMK-37 Pro. Read all of it before writing a file. Rules marked MUST are hard limits of the importer or the device. Breaking them loses notes or gets the file refused.

Written for Classic Tabby tabby-v04.0 and the rig profile "Wrong Room" (generated from the committed profile and definitions by web/rig/guide.js from 16 rig channels and the device library). The rules come from the importer source (web/import/midi-song.js) and the spec (docs/SPEC.md sections 7 to 13) at https://github.com/SeattleUser0/classic-tabby. Sections 8, 9 and 11 and the rig tables in Appendix B are generated from the rig profile (web/rig/profiles/) and the device definitions (web/devices/); do not edit them by hand.

## 1. What Classic Tabby does with the file

- The workbench web page reads the .mid file and turns it into one song. A song has up to 8 tracks and up to 128 rows.
- A row is a slice of the song, normally 4 bars of 4/4 (64 sixteenth-note steps). Each track's notes in a row form a block. Blocks that are byte for byte identical are stored once and reused.
- Timing is kept exactly as written. The importer does not quantize. A note keeps its offset from the 16th grid and its exact length, at a resolution of 1/480 of a 16th note.
- Each row is also a performance unit. On stage the player jumps the whole song to a row (a scene change), or launches one track's block from any row on its own (track launching). So rows should start where musical sections start, and each track's part in a row should make sense when it loops by itself.
- The SMK-37 is the MIDI clock master and sends notes out over MIDI to external synths. Each Tabby track sends on one MIDI channel: the channel of the part you wrote (section 8).

## 2. File format (MUST)

- Standard MIDI File, binary, format 1. Format 0 is accepted, but use format 1.
- Time division in ticks per quarter note (PPQ). Use 480. 960 is also fine. Any PPQ that divides 1920 is exact (96, 120, 192, 240, 384, 480, 960, 1920). Other values get rounded. SMPTE time division is refused.
- Track 0 is the conductor track: one set_tempo and one time_signature, both at tick 0, then end_of_track. No notes.
- One MIDI track per instrument part, each with a track_name, all its events on one MIDI channel, and an end_of_track. Never put two channels in one track.
- At most 8 parts with notes. A part is one MIDI track on one channel. Parts beyond 8 are not imported unless the user reassigns them by hand.
- Every note_on with velocity 1 to 127 has a matching note_off on the same channel and pitch. A note_on with velocity 0 counts as a note_off.
- File name: short ASCII. The first 12 characters, upper-cased, become the song name.

## 3. Tempo and meter

- One tempo for the whole song. A whole number of BPM from 30 to 300. Fractions are rounded. Tempo changes after the first are ignored.
- One time signature for the whole song. Later changes are ignored. 4/4 is the default and the best choice.
- Row length follows the meter: 4/4 gives 64-step rows (4 bars), 3/4 and 6/8 give 48 (4 bars), 2/4 gives 32, 12/8 gives 48 (2 bars), 1/4 gives 16.
- Avoid 5/4, 7/8, 9/8, 7/4 and other meters not listed above. Rows then fall back to 64 steps and stop lining up with bar lines.

## 4. Timing

- Units: 1 quarter note = 4 steps = 1920 units. units = ticks x 1920 / PPQ. At PPQ 480, 1 tick = 4 units and one 16th step = 120 ticks.
- Every note belongs to the 16th step nearest its start (its anchor). A start exactly half a step late stays with the earlier step. In units: anchor = floor((start_units + 239) / 480). The offset from the anchor is -239 to +240 units.
- Deliberate timing is preserved. Nudge a kick a few ticks ahead of a bass note, strum a chord, swing a hi-hat by hand. All of it plays back exactly as written.
- Nothing can start before tick 0. The first downbeat is tick 0. Don't write a pickup bar before it. If the music needs a pickup, start the song one bar earlier with silence.
- Note length: at least 1 tick. Lengths up to about 8.5 bars are exact. Longer notes, up to about 1092 bars, keep their length to within about a quarter of a 16th.
- The project's swing setting is off for imported songs. If you want swing, write it into the note positions.

## 5. Notes (MUST)

- At most 4 notes may anchor on the same 16th step in one part. A 5th note is dropped (the 4 loudest are kept). Count notes by anchor, not by exact tick, so a strum spread across a step still counts against that step. Split bigger chords across two parts or two steps.
- Never give one part the same pitch twice on the same step. Only the louder note is kept.
- Never let a pitch overlap itself in one part (a new note on a pitch that is still sounding). The earlier note is cut short where the new one starts. End the old note first.
- Velocity 1 to 127. Use velocity for dynamics. There is no other expression.
- Write real note lengths. Sustain pedal (CC 64) is ignored, so a held pad must be a long note, not a short note plus a pedal.
- Pitch bend, aftertouch, polyphonic pressure and SysEx are ignored. Don't rely on them.
- Drums: one part on one channel, with all drum sounds as different pitches in that part. The 4-per-step rule applies, so kick, snare, hat and one more is the most that can land on one step. In this rig the drum machine is the M8 (section 8); channel 10 is an ordinary M8 part here, not a General MIDI drum channel.

## 6. Program changes and CCs (row events)

- Program change, bank select and CC messages are imported only near a row start. The window runs from one beat before the row start up to half a step after it. Anything outside that window is dropped. Don't write automation sweeps; they are lost.
- Put each part's program change at its row start tick, on that part's channel. Bank select (CC 0 and/or CC 32) goes immediately before its program change, on the same channel, at the same tick or just before.
- At most 32 events per row and 292 per song. A bank select plus its program change counts as one event.
- Send events on the real MIDI channel of the device they are for. Events for an instrument part go on that part's channel. When the player launches that track on stage, its row events go with it. Events for effects pedals that have no part of their own (Royalist on channel 11, Brothers on channel 12, NightSky on channel 14, H90 on channel 15, Zoom on channel 16) fire only on whole-song scene changes. Put them in a track of their own with no notes.
- Program numbers in the file are 0 to 127 (MIDI wire values). Section 9 gives each device's own numbering beside the wire value, and the bank select the device needs for presets above 127. Use those; do not guess.
- Only send a program change to a device that receives one, and only a CC the device names (section 9). The importer warns about the rest; the checker in Appendix B does too.
- Before the first row the player can press SEND SETUP to send row 1's events to every device. So put every device's starting preset in row 1.

## 7. Song shape and storage

- Make the song a whole number of rows. In 4/4, that means a multiple of 4 bars. The last row may be partly silent.
- At most 128 rows. In 4/4 that is 512 bars.
- Start each section (intro, verse, drop, breakdown) on a row boundary.
- Storage is shared by all 16 songs on the device (about 318 KB). Identical blocks are stored once. A drum or bass loop that repeats bar-for-bar identically costs almost nothing. The same loop with randomized velocities or timing on every repeat stores a new copy each time. Keep repeats identical unless the variation is musically intended.
- Consecutive rows whose 8 blocks are all identical merge into one row with a repeat count (up to 64), unless the later row has row events.

## 8. Channels: the rig "Wrong Room"

Every device has one channel. Write each part on its device's channel and the importer sets that Tabby track's output channel from the file; nothing is set by hand. The table is generated from the rig profile.

| Ch | Device (rig name) | Kind | Tabby track | Program numbering | Clock |
| --- | --- | --- | --- | --- | --- |
| 1 | Instruo Seashell (Seashell) | instrument | by file order | unverified | no |
| 2 | M-VAVE FM-1 (Skiff firmware) (FM-1 A) | instrument | by file order | PC 0..127 = shown 0..127 | yes |
| 3 | M-VAVE FM-1 (Skiff firmware) (FM-1 B) | instrument | by file order | PC 0..127 = shown 0..127 | yes |
| 4 | Dirtywave M8 Tracker Model:02 (M8 part 1 (M8 track 1)) | instrument | by file order | PC 0..127 = shown 00..7F | yes |
| 5 | E-MU Proteus/2 XR (Proteus part 1) | instrument | by file order | PC 0..127 = shown 000..127 | no |
| 6 | E-MU Proteus/2 XR (Proteus part 2) | instrument | by file order | PC 0..127 = shown 000..127 | no |
| 7 | E-MU Proteus/2 XR (Proteus part 3) | instrument | by file order | PC 0..127 = shown 000..127 | no |
| 8 | E-MU Proteus/2 XR (Proteus part 4) | instrument | by file order | PC 0..127 = shown 000..127 | no |
| 9 | SMK-37 FM6 internal engine (FM6 internal) | internal | pinned to track 8 | no program change | no |
| 10 | Dirtywave M8 Tracker Model:02 (M8 part 2 (M8 track 2)) | instrument | by file order | PC 0..127 = shown 00..7F | yes |
| 11 | Tone King Royalist Preamp (Royalist) | effect | none (no notes) | PC 0..127 = shown 0..127 | no |
| 12 | Chase Bliss Audio Brothers (Brothers) | effect | none (no notes) | PC 0..122 = shown 0..122 | no |
| 13 | Dirtywave M8 Tracker Model:02 (M8 part 3 (M8 track 3)) | instrument | by file order | PC 0..127 = shown 00..7F | yes |
| 14 | Strymon NightSky (NightSky) | effect | none (no notes) | bank select + PC, shown 0..299 | yes |
| 15 | Eventide H90 Harmonizer (H90) | effect | none (no notes) | PC 0..98 = shown 1..99 | yes |
| 16 | Zoom MS-70CDR+ (Zoom) | effect | none (no notes) | PC 0..99 = shown 001..100 | no |

Rules that follow from the table:

- Parts take Tabby tracks 1 to 8 in file order, except a part on a channel with a pinned track, which lands on that track whatever its order (FM6 internal on channel 9 → track 8). Put the parts in the order you want on the tracks.
- Name each track after its device (for example "Seashell"): the importer shows the device it finds on the part's channel and the device the name mentions, so a mismatch is visible before anything is written.
- Channels marked "effect" take program changes and CCs only. Never write notes on them.
- Channels marked "internal" sound inside the SMK-37. Nothing external listens; program changes and CCs on them are ignored.
- A channel not in the table has no device. The importer warns and the song still sends on it.
- Several M8 parts: each M8 channel drives one M8 track (the table says which). Each part needs its own Tabby track.

- Classic Tabby (SMK-37 Pro) is the clock master and sends on every port; one channel per device.
- Channels 5 to 8 are Classic Tabby's Proteus/2 XR parts 1 to 4. The second controller's Proteus parts use any other channel; the Proteus hears Classic Tabby through H4MIDI WC MIDI OUT 2 filtered to channels 5 to 8.
- Channel 9 is the FM6 internal engine, pinned to Tabby track 8 (SEQ = LOCAL on the device). Nothing external listens on it.
- M8 parts: channel 4 = M8 track 1, 10 = track 2, 13 = track 3 (PG CHANGE on, SYNC IN clock+transport+SPP).
- FM-1 A (channel 2) and FM-1 B (channel 3): each on its own H4MIDI WC USB host port behind the hub, the port filtered to its channel; a Skiff 2.2 unit needs no filter (T1 CHANNEL = its channel, the rest OFF).
- H4MIDI WC: DIN IN 1 = Classic Tabby (3.5 mm MIDI OUT adapter), DIN IN 2 = the second controller, OUT 1 = Thru5 WC (unfiltered), OUT 2 = Proteus (filter: pass channels 5-8 from IN 1; IN 2 unfiltered), USB host 1 = FM-1 A (filter: channel 2), host 2 = FM-1 B (filter: channel 3), host 3 = Zoom (filter: channel 16, program change only). DIN IN does not route to DIN OUT by default: build this preset in
- Audio-only gear with no MIDI: Boss RE-2 Space Echo (delay time by hand or tap).

## 9. The devices

Generated from the device definitions: how each device is connected and set, how it numbers programs (wire value and shown number), the CCs it names, and clock. "Unverified" marks what no manufacturer document settles; the hardware checklist in BUILD.md settles it.

### Channel 1: Seashell (Instruo Seashell), instrument

- Connection: 3.5 mm TRS type A MIDI in (the included adaptor) and class-compliant USB-C audio + MIDI; input only (TRS A). DIN-to-TRS type A adapter from the Thru5 WC. Port in this rig: Thru5 WC, DIN to TRS type A.
- Channel setting: Seashell Controller app > Settings > MIDI Channel Menu = 1 (saved automatically since 1.0.3).
- Program changes: program change support unverified; Not supported in the published firmware 1.0.x (presets are files of the Controller app). Firmware 2.0 (announced, not on Instruo's site) is said to add 120 preset slots selected by program change; numbering and bank scheme unknown..
- CCs: No fixed CC map: parameters are assigned by MIDI Learn in the Controller app; any CC 0..127 can be a modulation-matrix source. Any CC number passes the checker; what it does is the device's mapping.
- Clock: no (nothing: no MIDI clock; the only sync is the analogue Gate/Trig input (Tap Tempo menu)).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: Seashell Controller: Settings > MIDI Channel = 1. Map the parameters you want to drive with MIDI Learn (the mapping is yours; enter the CC numbers in the rig profile). No program change in firmware 1.0.3: a song can only send CCs you learnt; keep an eye on firmware 2.0 (120 preset slots by program change, announced).
- Unverified: channel.default, programChange.supported, programChange.programs, any CC assignment, timing.
- Documents read: Seashell firmware 1.0.3 (the firmware page's latest; no date given); Seashell Controller 1.0.0; firmware 2.0 announced (secondary), not released.

### Channel 2: FM-1 A (M-VAVE FM-1 (Skiff firmware)), instrument

- Connection: USB class-compliant MIDI in/out and a 3.5 mm TRS MIDI in on the FM-1. TRS type not stated by Skiff or M-VAVE. In this rig a Skiff unit can take its channel directly (T1 CHANNEL = its channel, T2..T6 OFF) on any port; the H4MIDI filter is not needed but harmless. Port in this rig: H4MIDI USB host 1 (hub), filter: channel 2 only; firmware chosen by the device field.
- Channel setting: MENU > MIDI > T1 CHANNEL = the unit's channel (2 for FM-1 A, 3 for FM-1 B), T2..T6 CHANNEL = OFF (2.2); MIDI IN shows TRACK. Older firmware: give T2..T6 channels nothing sends on.
- Program changes: wire PC 0 = shown 0, PC 1 = 1; PC 0..127 = 0..127; no bank select.
  - Skiff 1.3+ (2.2 unchanged): a PC on a track's channel loads that track's engine's factory sound number n, counted from 0 (the PRESETS list order, aliases skipped; 0 on an FM6 track = TINE EP); a program past the engine's last preset is ignored, not wrapped; user sounds are not reachable; the load happens in the main loop after the message. No bank select (CC 0 / CC 32 ignored). The number means a different sound per engine, so name presets per engine in the rig profile.
- Named CCs (any other CC is warned about):

  | CC | Name | Range | Values |
  | --- | --- | --- | --- |
  | 1 | Mod wheel (MOD source) | 0..127 |  |
  | 5 | Glide | 0..127 |  |
  | 7 | Level | 0..127 |  |
  | 10 | Pan | 0..127 |  |
  | 11 | Expression (MOD source) | 0..127 |  |
  | 64 | Sustain | 0..127 | 0 = off; 64 = on |
  | 71 | Engine resonance (ANALOG / TRIO / NOISE) | 0..127 |  |
  | 72 | Release | 0..127 |  |
  | 73 | Attack | 0..127 |  |
  | 74 | Engine brightness (cutoff / DCW / tone / FM6 modulator level) | 0..127 |  |
  | 75 | Decay | 0..127 |  |
  | 91 | Reverb send | 0..127 |  |
  | 93 | Chorus send | 0..127 |  |
  | 94 | Delay send | 0..127 |  |
  | 120 | All Sound Off | 0..0 |  |
  | 121 | Reset All Controllers | 0..0 |  |
  | 123 | All Notes Off | 0..0 |  |

- Clock: yes: the sequencer: Clock, Start, Continue, Stop and (2.2) Song Position from the chosen input. Setting: MENU > MIDI > CLOCK = USB or TRS (the port Classic Tabby arrives on); CLOCK OUT off.
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: Load Skiff 2.2 (web installer); MENU > MIDI > T1 CHANNEL = the unit's channel (2 or 3), T2..T6 CHANNEL = OFF. MENU > MIDI > CLOCK = USB or TRS (where Classic Tabby arrives) so the unit follows clock, Start and Stop; CLOCK OUT = off (Classic Tabby is the master). Program numbers count the track's engine's factory presets from 0: set track 1's engine first. A PC is applied by the main loop after the message: keep a small gap before the notes (no published figure). No H4MIDI filter is needed for a Skiff unit; one is harmless.
- Unverified: channel.default, per-engine preset order and names, PC latency on hardware, TRS jack type (A or B), the 2.2 items the author lists as not yet tried on a unit.
- Documents read: Skiff 2.2 (2026-11-03); the online manual still describes the 1.3-era MIDI menu.

### Channel 3: FM-1 B (M-VAVE FM-1 (Skiff firmware)), instrument

- Connection: USB class-compliant MIDI in/out and a 3.5 mm TRS MIDI in on the FM-1. TRS type not stated by Skiff or M-VAVE. In this rig a Skiff unit can take its channel directly (T1 CHANNEL = its channel, T2..T6 OFF) on any port; the H4MIDI filter is not needed but harmless. Port in this rig: H4MIDI USB host 2 (hub), filter: channel 3 only; firmware chosen by the device field.
- Channel setting: MENU > MIDI > T1 CHANNEL = the unit's channel (2 for FM-1 A, 3 for FM-1 B), T2..T6 CHANNEL = OFF (2.2); MIDI IN shows TRACK. Older firmware: give T2..T6 channels nothing sends on.
- Program changes: wire PC 0 = shown 0, PC 1 = 1; PC 0..127 = 0..127; no bank select.
  - Skiff 1.3+ (2.2 unchanged): a PC on a track's channel loads that track's engine's factory sound number n, counted from 0 (the PRESETS list order, aliases skipped; 0 on an FM6 track = TINE EP); a program past the engine's last preset is ignored, not wrapped; user sounds are not reachable; the load happens in the main loop after the message. No bank select (CC 0 / CC 32 ignored). The number means a different sound per engine, so name presets per engine in the rig profile.
- Named CCs (any other CC is warned about):

  | CC | Name | Range | Values |
  | --- | --- | --- | --- |
  | 1 | Mod wheel (MOD source) | 0..127 |  |
  | 5 | Glide | 0..127 |  |
  | 7 | Level | 0..127 |  |
  | 10 | Pan | 0..127 |  |
  | 11 | Expression (MOD source) | 0..127 |  |
  | 64 | Sustain | 0..127 | 0 = off; 64 = on |
  | 71 | Engine resonance (ANALOG / TRIO / NOISE) | 0..127 |  |
  | 72 | Release | 0..127 |  |
  | 73 | Attack | 0..127 |  |
  | 74 | Engine brightness (cutoff / DCW / tone / FM6 modulator level) | 0..127 |  |
  | 75 | Decay | 0..127 |  |
  | 91 | Reverb send | 0..127 |  |
  | 93 | Chorus send | 0..127 |  |
  | 94 | Delay send | 0..127 |  |
  | 120 | All Sound Off | 0..0 |  |
  | 121 | Reset All Controllers | 0..0 |  |
  | 123 | All Notes Off | 0..0 |  |

- Clock: yes: the sequencer: Clock, Start, Continue, Stop and (2.2) Song Position from the chosen input. Setting: MENU > MIDI > CLOCK = USB or TRS (the port Classic Tabby arrives on); CLOCK OUT off.
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: Load Skiff 2.2 (web installer); MENU > MIDI > T1 CHANNEL = the unit's channel (2 or 3), T2..T6 CHANNEL = OFF. MENU > MIDI > CLOCK = USB or TRS (where Classic Tabby arrives) so the unit follows clock, Start and Stop; CLOCK OUT = off (Classic Tabby is the master). Program numbers count the track's engine's factory presets from 0: set track 1's engine first. A PC is applied by the main loop after the message: keep a small gap before the notes (no published figure). No H4MIDI filter is needed for a Skiff unit; one is harmless.
- Unverified: channel.default, per-engine preset order and names, PC latency on hardware, TRS jack type (A or B), the 2.2 items the author lists as not yet tried on a unit.
- Documents read: Skiff 2.2 (2026-11-03); the online manual still describes the 1.3-era MIDI menu.

### Channel 4: M8 part 1 (M8 track 1) (Dirtywave M8 Tracker Model:02), instrument

- Connection: 3.5 mm TRS type A in and out; USB-C class-compliant MIDI (behaves like the TRS input) (TRS A). DIN-to-TRS type A adapter from the Thru5 WC, or USB from a host. Port in this rig: Thru5 WC, DIN to TRS type A.
- Channel setting: MIDI Settings > Track MIDI Input: each M8 track has its own CHAN (default track n = channel n), INST#, PG CHANGE and MODE; stored in the song. Wrong Room: M8 track 1 CHAN 4, track 2 CHAN 10, track 3 CHAN 13, PG CHANGE on; tracks 4..8 on a channel nothing sends on, or on 13 in POLY.
- Program changes: wire PC 0 = shown 00, PC 1 = 01 (hex); PC 0..127 = 00..7F; no bank select.
  - With PG CHANGE on, a PC on a track's channel selects that track's instrument INST 00..7F (hex). PC 0 = INST 00 is the natural reading; unverified. Bank select on receive is not documented.
- CCs: No fixed CC list: per-song MIDI mappings (any CC on the control-map channel to instrument / mixer / effect / tempo / transpose parameters); CC 64 sustain on track input. Any CC number passes the checker; what it does is the device's mapping.
- Clock: yes: the song tempo and transport: SYNC IN = CLOCK, TRANSPORT, CLOCK+TRANSP., TRANSPORT+SPP or CLK+TRANSP+SPP. Setting: MIDI Settings > SYNC IN = CLK+TRANSP+SPP (per song).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: MIDI Settings (per song): track 1 CHAN 04, track 2 CHAN 10, track 3 CHAN 13; tracks 4..8 on a channel nothing sends on (or on 13 in POLY to add voices to part 3). MIDI Settings: PG CHANGE = ON on tracks 1..3 (a PC on the channel selects that track's INST#). MIDI Settings: SYNC IN = CLK+TRANSP+SPP so the M8 follows Classic Tabby's clock, Start, Stop and Song Position. Save the song's MIDI settings as the default configuration (MIDI Settings page) so a new M8 song keeps them. Name the instruments in the song; the rig profile can name INST 00..7F for the editor.
- Unverified: channel.default, programChange.displayBase (PC n = INST n is not spelled out), bank select on receive, whether a track's CHAN can be off (the manual lists 1..16), CCs on the track channel beyond CC 64 and pitch bend.
- Documents read: M8 firmware 6.6.3 F (changelog 2026-10-20); operation manual v6.5.2 (2026-04-21).

### Channel 5: Proteus part 1 (E-MU Proteus/2 XR), instrument

- Connection: 5-pin DIN in, out and thru (thru is an exact copy of in). Standard DIN cable. In this rig: H4MIDI WC MIDI OUT 2 with a filter passing channels 5..8 only, merged with the second controller from MIDI IN 2. Port in this rig: H4MIDI MIDI OUT 2, filter: channels 5-8.
- Channel setting: Master > MIDI MODE = Multi; Master > MIDI ENABLE channel 05..08 On and every channel you do not use Off; Master > PRESET CHANGE 05..08 On; on the main screen cursor to the channel number, dial C05..C08 and the preset for each.
- Program changes: wire PC 0 = shown 000, PC 1 = 001; PC 0..127 = 000..127; no bank select.
  - Presets are shown 000..383 (XR). MIDI reaches 0..127 directly; presets 128..383 only through the device's MIDI PROG>PRESET map, which maps an incoming program 0..127 to any preset. Enter such presets as the mapped program number.
- Named presets: 192 in the definition (the workbench shows them by name).
- Named CCs (any other CC is warned about):

  | CC | Name | Range | Values |
  | --- | --- | --- | --- |
  | 7 | Volume | 0..127 |  |
  | 10 | Pan | 0..127 | 0 = hard left; 64 = centre; 127 = hard right |
  | 1 | Realtime controller A (default assignment) | 0..127 |  |
  | 2 | Realtime controller B (default assignment) | 0..127 |  |
  | 3 | Realtime controller C (default assignment) | 0..127 |  |
  | 4 | Realtime controller D (default assignment) | 0..127 |  |
  | 64 | Footswitch 1 (default; sustain if the preset routes it) | 0..127 | 0 = off; 64 = on |
  | 65 | Footswitch 2 (default) | 0..127 | 0 = off; 64 = on |
  | 66 | Footswitch 3 (default) | 0..127 | 0 = off; 64 = on |
  | 121 | Reset all controllers | 0..0 |  |
  | 123 | All notes off | 0..0 |  |

- Clock: no (nothing: the manual has no MIDI clock and no realtime messages).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: Master menu: MIDI MODE = Multi. Per channel the song addresses (5..8): MIDI ENABLE on and PRESET CHANGE on; MIDI ENABLE off on every channel that is neither yours nor the second controller's. Feed the Proteus from H4MIDI WC MIDI OUT 2 (filter: channels 5..8 only from MIDI IN 1; MIDI IN 2 unfiltered), so the second controller's channels never meet Classic Tabby's. Master menu MIDI PROG>PRESET: identity for presets 0..127; map a program number to each preset above 127 the song needs (no bank select exists). Leave the Edit menu before playing: program changes are ignored inside it. Run SEND SETUP before PLAY: the manual asks for setup messages before the song starts.
- Unverified: channel.default, programChange.note:factory state of the program map on a reset unit.
- Documents read: Proteus operation manual with the 1992 MIDI addendum (revision 4, 1992-03-04); no later document.

### Channel 6: Proteus part 2 (E-MU Proteus/2 XR), instrument

- Connection: 5-pin DIN in, out and thru (thru is an exact copy of in). Standard DIN cable. In this rig: H4MIDI WC MIDI OUT 2 with a filter passing channels 5..8 only, merged with the second controller from MIDI IN 2. Port in this rig: H4MIDI MIDI OUT 2, filter: channels 5-8.
- Channel setting: Master > MIDI MODE = Multi; Master > MIDI ENABLE channel 05..08 On and every channel you do not use Off; Master > PRESET CHANGE 05..08 On; on the main screen cursor to the channel number, dial C05..C08 and the preset for each.
- Program changes: wire PC 0 = shown 000, PC 1 = 001; PC 0..127 = 000..127; no bank select.
  - Presets are shown 000..383 (XR). MIDI reaches 0..127 directly; presets 128..383 only through the device's MIDI PROG>PRESET map, which maps an incoming program 0..127 to any preset. Enter such presets as the mapped program number.
- Named presets: 192 in the definition (the workbench shows them by name).
- Named CCs (any other CC is warned about):

  | CC | Name | Range | Values |
  | --- | --- | --- | --- |
  | 7 | Volume | 0..127 |  |
  | 10 | Pan | 0..127 | 0 = hard left; 64 = centre; 127 = hard right |
  | 1 | Realtime controller A (default assignment) | 0..127 |  |
  | 2 | Realtime controller B (default assignment) | 0..127 |  |
  | 3 | Realtime controller C (default assignment) | 0..127 |  |
  | 4 | Realtime controller D (default assignment) | 0..127 |  |
  | 64 | Footswitch 1 (default; sustain if the preset routes it) | 0..127 | 0 = off; 64 = on |
  | 65 | Footswitch 2 (default) | 0..127 | 0 = off; 64 = on |
  | 66 | Footswitch 3 (default) | 0..127 | 0 = off; 64 = on |
  | 121 | Reset all controllers | 0..0 |  |
  | 123 | All notes off | 0..0 |  |

- Clock: no (nothing: the manual has no MIDI clock and no realtime messages).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: Master menu: MIDI MODE = Multi. Per channel the song addresses (5..8): MIDI ENABLE on and PRESET CHANGE on; MIDI ENABLE off on every channel that is neither yours nor the second controller's. Feed the Proteus from H4MIDI WC MIDI OUT 2 (filter: channels 5..8 only from MIDI IN 1; MIDI IN 2 unfiltered), so the second controller's channels never meet Classic Tabby's. Master menu MIDI PROG>PRESET: identity for presets 0..127; map a program number to each preset above 127 the song needs (no bank select exists). Leave the Edit menu before playing: program changes are ignored inside it. Run SEND SETUP before PLAY: the manual asks for setup messages before the song starts.
- Unverified: channel.default, programChange.note:factory state of the program map on a reset unit.
- Documents read: Proteus operation manual with the 1992 MIDI addendum (revision 4, 1992-03-04); no later document.

### Channel 7: Proteus part 3 (E-MU Proteus/2 XR), instrument

- Connection: 5-pin DIN in, out and thru (thru is an exact copy of in). Standard DIN cable. In this rig: H4MIDI WC MIDI OUT 2 with a filter passing channels 5..8 only, merged with the second controller from MIDI IN 2. Port in this rig: H4MIDI MIDI OUT 2, filter: channels 5-8.
- Channel setting: Master > MIDI MODE = Multi; Master > MIDI ENABLE channel 05..08 On and every channel you do not use Off; Master > PRESET CHANGE 05..08 On; on the main screen cursor to the channel number, dial C05..C08 and the preset for each.
- Program changes: wire PC 0 = shown 000, PC 1 = 001; PC 0..127 = 000..127; no bank select.
  - Presets are shown 000..383 (XR). MIDI reaches 0..127 directly; presets 128..383 only through the device's MIDI PROG>PRESET map, which maps an incoming program 0..127 to any preset. Enter such presets as the mapped program number.
- Named presets: 192 in the definition (the workbench shows them by name).
- Named CCs (any other CC is warned about):

  | CC | Name | Range | Values |
  | --- | --- | --- | --- |
  | 7 | Volume | 0..127 |  |
  | 10 | Pan | 0..127 | 0 = hard left; 64 = centre; 127 = hard right |
  | 1 | Realtime controller A (default assignment) | 0..127 |  |
  | 2 | Realtime controller B (default assignment) | 0..127 |  |
  | 3 | Realtime controller C (default assignment) | 0..127 |  |
  | 4 | Realtime controller D (default assignment) | 0..127 |  |
  | 64 | Footswitch 1 (default; sustain if the preset routes it) | 0..127 | 0 = off; 64 = on |
  | 65 | Footswitch 2 (default) | 0..127 | 0 = off; 64 = on |
  | 66 | Footswitch 3 (default) | 0..127 | 0 = off; 64 = on |
  | 121 | Reset all controllers | 0..0 |  |
  | 123 | All notes off | 0..0 |  |

- Clock: no (nothing: the manual has no MIDI clock and no realtime messages).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: Master menu: MIDI MODE = Multi. Per channel the song addresses (5..8): MIDI ENABLE on and PRESET CHANGE on; MIDI ENABLE off on every channel that is neither yours nor the second controller's. Feed the Proteus from H4MIDI WC MIDI OUT 2 (filter: channels 5..8 only from MIDI IN 1; MIDI IN 2 unfiltered), so the second controller's channels never meet Classic Tabby's. Master menu MIDI PROG>PRESET: identity for presets 0..127; map a program number to each preset above 127 the song needs (no bank select exists). Leave the Edit menu before playing: program changes are ignored inside it. Run SEND SETUP before PLAY: the manual asks for setup messages before the song starts.
- Unverified: channel.default, programChange.note:factory state of the program map on a reset unit.
- Documents read: Proteus operation manual with the 1992 MIDI addendum (revision 4, 1992-03-04); no later document.

### Channel 8: Proteus part 4 (E-MU Proteus/2 XR), instrument

- Connection: 5-pin DIN in, out and thru (thru is an exact copy of in). Standard DIN cable. In this rig: H4MIDI WC MIDI OUT 2 with a filter passing channels 5..8 only, merged with the second controller from MIDI IN 2. Port in this rig: H4MIDI MIDI OUT 2, filter: channels 5-8.
- Channel setting: Master > MIDI MODE = Multi; Master > MIDI ENABLE channel 05..08 On and every channel you do not use Off; Master > PRESET CHANGE 05..08 On; on the main screen cursor to the channel number, dial C05..C08 and the preset for each.
- Program changes: wire PC 0 = shown 000, PC 1 = 001; PC 0..127 = 000..127; no bank select.
  - Presets are shown 000..383 (XR). MIDI reaches 0..127 directly; presets 128..383 only through the device's MIDI PROG>PRESET map, which maps an incoming program 0..127 to any preset. Enter such presets as the mapped program number.
- Named presets: 192 in the definition (the workbench shows them by name).
- Named CCs (any other CC is warned about):

  | CC | Name | Range | Values |
  | --- | --- | --- | --- |
  | 7 | Volume | 0..127 |  |
  | 10 | Pan | 0..127 | 0 = hard left; 64 = centre; 127 = hard right |
  | 1 | Realtime controller A (default assignment) | 0..127 |  |
  | 2 | Realtime controller B (default assignment) | 0..127 |  |
  | 3 | Realtime controller C (default assignment) | 0..127 |  |
  | 4 | Realtime controller D (default assignment) | 0..127 |  |
  | 64 | Footswitch 1 (default; sustain if the preset routes it) | 0..127 | 0 = off; 64 = on |
  | 65 | Footswitch 2 (default) | 0..127 | 0 = off; 64 = on |
  | 66 | Footswitch 3 (default) | 0..127 | 0 = off; 64 = on |
  | 121 | Reset all controllers | 0..0 |  |
  | 123 | All notes off | 0..0 |  |

- Clock: no (nothing: the manual has no MIDI clock and no realtime messages).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: Master menu: MIDI MODE = Multi. Per channel the song addresses (5..8): MIDI ENABLE on and PRESET CHANGE on; MIDI ENABLE off on every channel that is neither yours nor the second controller's. Feed the Proteus from H4MIDI WC MIDI OUT 2 (filter: channels 5..8 only from MIDI IN 1; MIDI IN 2 unfiltered), so the second controller's channels never meet Classic Tabby's. Master menu MIDI PROG>PRESET: identity for presets 0..127; map a program number to each preset above 127 the song needs (no bank select exists). Leave the Edit menu before playing: program changes are ignored inside it. Run SEND SETUP before PLAY: the manual asks for setup messages before the song starts.
- Unverified: channel.default, programChange.note:factory state of the program map on a reset unit.
- Documents read: Proteus operation manual with the 1992 MIDI addendum (revision 4, 1992-03-04); no later document.

### Channel 9: FM6 internal (SMK-37 FM6 internal engine), internal

- Connection: none: the internal engine of the SMK-37 itself, not a MIDI device. A Tabby track plays the engine when its SEQ setting (SEQ page 6/7 MIDI TRACK, K3) is LOCAL or BOTH. Set the pinned track to LOCAL so nothing leaves on this channel. Port in this rig: internal (Tabby track 8, SEQ = LOCAL).
- Channel setting: A convention: channel 9 parts land on the pinned Tabby track (track 8 in the Wrong Room profile); on the device, once, SEQ page 6/7: track 8 K3 SEQ = LOCAL.
- Program changes: does not receive program changes.
- CCs: none received.
- Clock: no (the SMK-37 is the clock master).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: On the device, once: SEQ page 6/7 MIDI TRACK, select track 8, K3 SEQ = LOCAL (BOTH would also send the part on channel 9 to every port). Give track 8 the sound you want in the project (SHIFT + HOME, SAVE) and save the project. In the file, the FM6 part is the track on channel 9; its program changes and CCs are ignored.
- Documents read: Classic Tabby (this workbench's version).

### Channel 10: M8 part 2 (M8 track 2) (Dirtywave M8 Tracker Model:02), instrument

- Connection: 3.5 mm TRS type A in and out; USB-C class-compliant MIDI (behaves like the TRS input) (TRS A). DIN-to-TRS type A adapter from the Thru5 WC, or USB from a host. Port in this rig: Thru5 WC, DIN to TRS type A.
- Channel setting: MIDI Settings > Track MIDI Input: each M8 track has its own CHAN (default track n = channel n), INST#, PG CHANGE and MODE; stored in the song. Wrong Room: M8 track 1 CHAN 4, track 2 CHAN 10, track 3 CHAN 13, PG CHANGE on; tracks 4..8 on a channel nothing sends on, or on 13 in POLY.
- Program changes: wire PC 0 = shown 00, PC 1 = 01 (hex); PC 0..127 = 00..7F; no bank select.
  - With PG CHANGE on, a PC on a track's channel selects that track's instrument INST 00..7F (hex). PC 0 = INST 00 is the natural reading; unverified. Bank select on receive is not documented.
- CCs: No fixed CC list: per-song MIDI mappings (any CC on the control-map channel to instrument / mixer / effect / tempo / transpose parameters); CC 64 sustain on track input. Any CC number passes the checker; what it does is the device's mapping.
- Clock: yes: the song tempo and transport: SYNC IN = CLOCK, TRANSPORT, CLOCK+TRANSP., TRANSPORT+SPP or CLK+TRANSP+SPP. Setting: MIDI Settings > SYNC IN = CLK+TRANSP+SPP (per song).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: MIDI Settings (per song): track 1 CHAN 04, track 2 CHAN 10, track 3 CHAN 13; tracks 4..8 on a channel nothing sends on (or on 13 in POLY to add voices to part 3). MIDI Settings: PG CHANGE = ON on tracks 1..3 (a PC on the channel selects that track's INST#). MIDI Settings: SYNC IN = CLK+TRANSP+SPP so the M8 follows Classic Tabby's clock, Start, Stop and Song Position. Save the song's MIDI settings as the default configuration (MIDI Settings page) so a new M8 song keeps them. Name the instruments in the song; the rig profile can name INST 00..7F for the editor.
- Unverified: channel.default, programChange.displayBase (PC n = INST n is not spelled out), bank select on receive, whether a track's CHAN can be off (the manual lists 1..16), CCs on the track channel beyond CC 64 and pitch bend.
- Documents read: M8 firmware 6.6.3 F (changelog 2026-10-20); operation manual v6.5.2 (2026-04-21).

### Channel 11: Royalist (Tone King Royalist Preamp), effect

- Connection: 5-pin DIN MIDI IN only (no out, no thru); USB-C for the Synergy Editor App, firmware updates and USB audio. Standard DIN cable from the Thru5 WC; last in a chain or on its own Thru5 port. Port in this rig: Thru5 WC, DIN (channel 11 set in the Synergy editor).
- Channel setting: Synergy Editor App over USB-C: MIDI CHANNEL = 11 (default OMNI). No panel procedure exists. In OMNI the pedal takes every program change on the chain.
- Program changes: wire PC 0 = shown 0, PC 1 = 1; PC 0..127 = 0..127; no bank select.
  - 128 presets; the sibling Imperial manual numbers them 0..127, the Royalist manual says '128 storable MIDI PROGRAM CHANGES' (0- or 1-based display unverified). A preset stores channel, master bypass, IR selection and bypass, loop bypass, reverb bypass and tails. Store from the pedal: select the preset by PC, set the state, long-press REVERB + CHANNEL. No bank select, nothing to enable.
- Named CCs (any other CC is warned about):

  | CC | Name | Range | Values |
  | --- | --- | --- | --- |
  | 24 | Select channel (SYN-20IR map, unverified for the Royalist) | 0..2 |  |
  | 25 | Select structure (SYN-20IR map, unverified) | 0..2 |  |
  | 27 | IR bypass (SYN-20IR map, unverified) | 0..127 | 0 = off; 1 = toggle; 127 = on |
  | 28 | Select IR (SYN-20IR map, unverified) | 0..3 |  |
  | 29 | Lowpass level (SYN-20IR map, unverified) | 0..2 |  |
  | 30 | Highpass level (SYN-20IR map, unverified) | 0..2 |  |

- Clock: no (nothing (a preamp)).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: Synergy Editor App (USB-C): MIDI CHANNEL = 11; STORE. Synergy Editor App: open the MIDI CC LIST tab, read the Royalist's own CC numbers and correct this definition (the numbers here are the SYN-20IR sibling's, unverified). Store the presets the song calls: send PC n, set channel / IR / loop / reverb, long-press REVERB + CHANNEL. DIN cable from the Thru5 WC into MIDI IN; the pedal has no thru.
- Unverified: every CC number (SYN-20IR sibling map until read from the editor's MIDI CC LIST), MIDI channel range and whether 11 is selectable, 0- or 1-based preset display, preset change latency, CC acceptance in OMNI, firmware version.
- Documents read: manual FINAL 01 19 2026 (uploads of 2026-02 and 2026-11); Synergy Editor App 8.9.6; no firmware version published.

### Channel 12: Brothers (Chase Bliss Audio Brothers), effect

- Connection: 1/4 inch TRS jack EXT(A)/MIDI: MIDI on the ring, tip floating ('ring active'); no DIN, no USB, no thru (TRS ring). Needs a powered Chase Bliss MIDIbox (DIN in, jumper in RING, TRS patch cable to the jack) or another ring-active TRS MIDI output. A plain TRS type A cable will not drive it. In this rig: Thru5 WC > MIDIbox (RING) > Brothers. Port in this rig: Thru5 WC > Chase Bliss MIDIbox (RING) > TRS.
- Channel setting: Hold both stomp switches while powering up, release, then send any program change on channel 12: the first PC seen sets the channel permanently (default 2). No factory reset exists.
- Program changes: wire PC 0 = shown 0, PC 1 = 1; PC 0..122 = 0..122; no bank select.
  - PC 0 = live mode (the preset toggle's middle position); PC 1..122 = presets 1..122 (slot 1 = the toggle's right position, slot 2 = left; 3..122 are MIDI-only and empty until saved). Wire value = displayed number. Save: send the PC while holding both stomp switches. No bank select, nothing to enable. PC 123..127: not documented.
- Named CCs (any other CC is warned about):

  | CC | Name | Range | Values |
  | --- | --- | --- | --- |
  | 14 | Gain A | 0..127 |  |
  | 15 | Master | 0..127 |  |
  | 16 | Gain B | 0..127 |  |
  | 17 | Tone A | 0..127 |  |
  | 18 | Mix / Stack | 0..127 |  |
  | 19 | Tone B | 0..127 |  |
  | 21 | Channel A effect | 1..3 | 1 = Boost; 2 = Drive; 3 = Fuzz |
  | 22 | Order | 1..3 | 1 = PARA; 2 = A>>B; 3 = B>>A |
  | 23 | Channel B effect | 1..3 | 1 = Fuzz; 2 = Drive; 3 = Boost |
  | 100 | Expression | 0..127 | 0 = pedal up; 127 = fully depressed |
  | 102 | Bypass switch | 0..127 | 0 = both channels bypassed; 127 = last saved channels engaged |
  | 103 | Bypass states | 0..127 | 0 = both bypassed; 45 = B on, A bypassed; 85 = A on, B bypassed; 127 = both on |

- Clock: no (nothing (a gain pedal: no tempo, no tap, no ramping)).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: Chase Bliss MIDIbox: power it, jumper in RING, DIN from the Thru5 WC, TRS patch cable to the Brothers' EXT(A)/MIDI jack (a plain TRS type A cable from a DIN out does not work). Set channel 12: power up holding both stomp switches, release, send a program change on channel 12 (SEND SETUP with the Brothers' preset in row 1 does it). Save the presets the song calls: hold both stomp switches and send PC n (1..122). PC 0 in a song means live mode (the toggle's middle position), not a preset.
- Unverified: electrical level of the ring input (no pinout published), PC 123..127, preset change latency, learn-state timeout, omni.
- Documents read: no firmware versions or updates published (MIDI manual PDF 2018-04-05, pedal manual 2017-03-11).

### Channel 13: M8 part 3 (M8 track 3) (Dirtywave M8 Tracker Model:02), instrument

- Connection: 3.5 mm TRS type A in and out; USB-C class-compliant MIDI (behaves like the TRS input) (TRS A). DIN-to-TRS type A adapter from the Thru5 WC, or USB from a host. Port in this rig: Thru5 WC, DIN to TRS type A.
- Channel setting: MIDI Settings > Track MIDI Input: each M8 track has its own CHAN (default track n = channel n), INST#, PG CHANGE and MODE; stored in the song. Wrong Room: M8 track 1 CHAN 4, track 2 CHAN 10, track 3 CHAN 13, PG CHANGE on; tracks 4..8 on a channel nothing sends on, or on 13 in POLY.
- Program changes: wire PC 0 = shown 00, PC 1 = 01 (hex); PC 0..127 = 00..7F; no bank select.
  - With PG CHANGE on, a PC on a track's channel selects that track's instrument INST 00..7F (hex). PC 0 = INST 00 is the natural reading; unverified. Bank select on receive is not documented.
- CCs: No fixed CC list: per-song MIDI mappings (any CC on the control-map channel to instrument / mixer / effect / tempo / transpose parameters); CC 64 sustain on track input. Any CC number passes the checker; what it does is the device's mapping.
- Clock: yes: the song tempo and transport: SYNC IN = CLOCK, TRANSPORT, CLOCK+TRANSP., TRANSPORT+SPP or CLK+TRANSP+SPP. Setting: MIDI Settings > SYNC IN = CLK+TRANSP+SPP (per song).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: MIDI Settings (per song): track 1 CHAN 04, track 2 CHAN 10, track 3 CHAN 13; tracks 4..8 on a channel nothing sends on (or on 13 in POLY to add voices to part 3). MIDI Settings: PG CHANGE = ON on tracks 1..3 (a PC on the channel selects that track's INST#). MIDI Settings: SYNC IN = CLK+TRANSP+SPP so the M8 follows Classic Tabby's clock, Start, Stop and Song Position. Save the song's MIDI settings as the default configuration (MIDI Settings page) so a new M8 song keeps them. Name the instruments in the song; the rig profile can name INST 00..7F for the editor.
- Unverified: channel.default, programChange.displayBase (PC n = INST n is not spelled out), bank select on receive, whether a track's CHAN can be off (the manual lists 1..16), CCs on the track channel beyond CC 64 and pitch bend.
- Documents read: M8 firmware 6.6.3 F (changelog 2026-10-20); operation manual v6.5.2 (2026-04-21).

### Channel 14: NightSky (Strymon NightSky), effect

- Connection: 5-pin DIN MIDI IN and OUT, USB mini; optionally the 1/4 inch EXP jack in MIDI mode (Strymon MIDI EXP cable, tip active with an opto-isolator in the cable). Use the DIN MIDI IN from the Thru5 WC: no EXP-jack setting needed. Third-party DIN-to-TRS cables do not work on the EXP jack. Set TRS MIDI Output to OFF when only receiving. Port in this rig: Thru5 WC, DIN MIDI IN.
- Channel setting: Power-up mode: hold INFINITE while connecting power, release when the footswitch LEDs light, turn SPEED until the ON LED blinks blue, send a program change on channel 14, press INFINITE to store. One FAQ says the 4..16 option needs a 1/4 inch MIDI connection to set; the manual does not: if the DIN path does not latch it, set it once over the EXP jack.
- Program changes: wire PC 0 = shown 0, PC 1 = 1; bank select by CC 0 before the PC: bank 0..127 = CC 0 = 0; bank 128..255 = CC 0 = 1; bank 256..299 = CC 0 = 2; shown 0..299.
  - 300 presets shown 0..299: CC 0 (bank select MSB) = preset div 128, PC = preset mod 128. The pedal powers up in bank 0, so send CC 0 before every program change. Bank 0 PC 127 is Manual mode, not a preset (bank 2 holds 256..299 only). The 16 front-panel presets 1..16 are bank 0 PC 0..15. Nothing to enable. CC 32 is not mentioned by Strymon.
- Named CCs (any other CC is warned about):

  | CC | Name | Range | Values |
  | --- | --- | --- | --- |
  | 0 | Bank select | 0..2 |  |
  | 11 | Mix: reverb level | 0..127 |  |
  | 12 | Mix: dry level | 0..127 |  |
  | 13 | Mod speed | 0..127 |  |
  | 14 | Mod target | 0..2 | 0 = verb; 1 = pitch; 2 = filter |
  | 15 | Mod depth | 0..127 |  |
  | 16 | Mod shape | 0..5 | 0 = triangle; 1 = square; 2 = ramp; 3 = saw; 4 = random; 5 = envelope |
  | 17 | Decay: pre-delay | 0..127 |  |
  | 18 | Decay: length | 0..127 |  |
  | 19 | Decay: texture | 0..2 | 0 = sparse; 1 = dense; 2 = diffuse |
  | 20 | Decay: size / pitch | 0..127 |  |
  | 21 | Decay: quantize | 0..2 | 0 = smooth; 1 = half step; 2 = scale |
  | 22 | Tone: low cut | 0..127 |  |
  | 23 | Tone: high cut | 0..127 |  |
  | 24 | Tone: filter | 0..1 | 0 = regen; 1 = lowpass |
  | 25 | Tone: lowpass Q | 0..127 |  |
  | 26 | Voice: interval | 0..25 | 0 = -octave; 5 = -P5; 7 = -P4; 12 = -detune; 13 = +detune; 18 = +P4; 20 = +P5; 25 = +octave |
  | 27 | Voice: scale | 0..7 | 0 = minor pentatonic; 1 = major pentatonic; 2 = major; 3 = dorian; 4 = minor blues; 5 = harmonic minor; 6 = whole tone; 7 = diminished |
  | 28 | Voice: shimmer source | 0..1 | 0 = input; 1 = regen |
  | 29 | Voice: shimmer level | 0..127 |  |
  | 30 | Voice: glimmer | 0..2 | 0 = off; 1 = high; 2 = low |
  | 31 | Voice: glimmer gain | 0..127 |  |
  | 33 | Voice: drive | 0..2 | 0 = off; 1 = pre; 2 = post |
  | 34 | Voice: drive level | 0..127 |  |
  | 35 | Freeze | 0..127 | 0 = off; 1 = on |
  | 36 | Morph | 0..127 | 0 = off; 1 = on |
  | 37 | Morph speed | 0..127 |  |
  | 41 | Sequence mode | 0..127 | 0 = preset; 1 = sequence |
  | 42 | Sequencer step 1 on | 0..127 | 0 = off; 1 = on |
  | 43 | Sequencer step 2 on | 0..127 |  |
  | 44 | Sequencer step 3 on | 0..127 |  |
  | 45 | Sequencer step 4 on | 0..127 |  |
  | 46 | Sequencer step 5 on | 0..127 |  |
  | 47 | Sequencer step 6 on | 0..127 |  |
  | 48 | Sequencer step 7 on | 0..127 |  |
  | 49 | Sequencer step 8 on | 0..127 |  |
  | 50 | Sequencer step 1 size | 0..127 |  |
  | 51 | Sequencer step 2 size | 0..127 |  |
  | 52 | Sequencer step 3 size | 0..127 |  |
  | 53 | Sequencer step 4 size | 0..127 |  |
  | 54 | Sequencer step 5 size | 0..127 |  |
  | 55 | Sequencer step 6 size | 0..127 |  |
  | 56 | Sequencer step 7 size | 0..127 |  |
  | 57 | Sequencer step 8 size | 0..127 |  |
  | 58 | Sequence glide | 0..127 |  |
  | 60 | MIDI expression on/off | 0..127 | 0 = off; 1 = on |
  | 63 | MIDI clock on/off | 0..127 | 0 = off; 1 = on |
  | 80 | Footswitch ON | 0..127 | 0 = release; 1 = press |
  | 81 | Footswitch FAVORITE | 0..127 | 0 = release; 1 = press |
  | 82 | Footswitch INFINITE | 0..127 | 0 = release; 1 = press |
  | 83 | Persist | 0..127 | 0 = off; 1 = on |
  | 93 | Sequence tap | 0..127 |  |
  | 100 | Expression pedal (MIDI expression on) | 0..127 |  |
  | 102 | Bypass / on | 0..127 | 0 = bypass; 1 = on |

- Clock: yes: the sequencer tempo only (no delay or pre-delay sync), enabled per preset. Setting: Live Edit: hold PRESET BUTTONS 1 and 4, turn SPEED to green (RESPOND TO MIDI CLOCK), or CC 63 = 127; save the preset.
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: DIN cable from the Thru5 WC into MIDI IN; leave the EXP jack in its default (expression) mode; TRS MIDI Output = OFF; DIN MIDI Thru at its default. Channel 14: hold INFINITE while powering, release when the footswitch LEDs light, turn SPEED until the ON LED blinks blue, send a program change on channel 14 (SEND SETUP works), press INFINITE to store. If the DIN path does not latch it, do it once over the EXP jack in MIDI mode. Presets: the song sends CC 0 = bank then PC; the pedal powers up in bank 0. Never call bank 0 PC 127 (Manual mode). Clock: for each preset that should sync its sequencer, hold PRESET BUTTONS 1 and 4, turn SPEED to green, and save the preset (or CC 63 = 127 in the song's row events).
- Unverified: USB class compliance, MIDI Start / Stop handling, preset load time, whether the DIN path latches channels 4..16 (FAQ against manual), TRS MIDI Output default, CC 32.
- Documents read: NightSky firmware 1.07 (March 2021); user manual Rev F (2021-09-17).

### Channel 15: H90 (Eventide H90 Harmonizer), effect

- Connection: 5-pin DIN in, DIN out/thru, USB-C (MIDI over USB); the TRS jacks are EXP/CTL only. Standard DIN cable from the Thru5 WC. Port in this rig: Thru5 WC, DIN MIDI IN (gap 255 ms after a program change, the field maximum: the CC-after-PC bug, users report about 300 ms).
- Channel setting: System Menu (hold Programs + Routing) > MIDI > Channel = 15 (receive and transmit) or Receive Omni.
- Program changes: wire PC 0 = shown 1, PC 1 = 2; PC 0..98 = 1..99; no bank select.
  - PC selects a Program in the current Playlist (a User List of up to 99). With PC Offset 0 (default) PC n loads Program n as displayed (1-based; PC 0 is not used); with PC Offset 1, PC 0 loads Program 1: set this definition's displayBase to 0 then. No bank select; banks of three are reached only by Bank Up / Down CC functions.
- CCs: No default CC map: assign CC numbers per function in System > MIDI > Global Control (Load, Increment, Decrement, Bank Up/Down, Tuner, Tap Tempo, P/A/B active-bypass toggle or momentary, Insert 1/2, HotSwitch 1-3, Perform 1-6, Quick Knobs 1-6, HotKnob, In/Out gain, Mix) and enter them in the rig profile. Any CC number passes the checker; what it does is the device's mapping.
- Clock: yes: the tempo (delays, modulation rates): Tempo Menu > Tempo Source = MIDI Clock. Setting: Tempo Menu (hold Presets + Parameters) > Tempo Source = MIDI Clock; System > MIDI > Clock Source = DIN or USB.
- Timing from the rig: a gap of 255 ms after a program change; no lead before the bar.
- Set on the device: System > MIDI: channel 15 (or Receive Omni). System > MIDI: PC Offset 0 keeps PC n = Program n as displayed; if you use PC Offset 1, set displayBase 0 in the rig. Make the User List you play from the Playlist: program numbers in the song refer to its order. Assign CC numbers for bypass / HotSwitch / tap in Global Control and enter them in the rig profile. Tempo Menu > Tempo Source = MIDI Clock and System > MIDI > Clock Source = DIN, so delays follow Classic Tabby's clock. A CC sent right after a PC is ignored on 1.9.x (Eventide staff, March 2025: 'not addressed'; no later release note says fixed, 1.12.5 included): keep this device's gap after the program change.
- Unverified: channel.default (the manual gives none), programChange.gapMs:no manufacturer figure; the CC-after-PC bug's fix status in 1.12.5, wire PC 99 / 100 with PC Offset off, MIDI Start / Stop handling, USB carries PC/CC (manual says only 'receive MIDI over USB').
- Documents read: H90 1.12.5 (2025-12-18) and its manual v1.12.5; no newer release found on 2026-11-05.

### Channel 16: Zoom (Zoom MS-70CDR+), effect

- Connection: USB-C only (a USB MIDI device, bus-powered); no DIN, no TRS. Needs a USB host: H4MIDI WC USB-A through the powered hub, port filter: channel 16 only, program change only. Port in this rig: H4MIDI USB host 3 (hub), filter: channel 16, program change only.
- Channel setting: MENU > USB MIDI CH = 16 (not OMNI: in OMNI every program change on the chain would switch patches).
- Program changes: wire PC 0 = shown 001, PC 1 = 002; PC 0..99 = 001..100; no bank select.
  - Patches are displayed 001..100; the chart lists PC 0-100 'true number 0-100' without a mapping, so whether PC 0 or PC 1 is patch 001 is unverified (displayBase 1 assumed; change it after the hardware check).
- Named presets: 80 in the definition (the workbench shows them by name).
- CCs: none received.
- Clock: no (nothing (chart: clock x)).
- Timing from the rig: no gap; no lead before the bar.
- Set on the device: MENU > USB MIDI CH = 16 (set it: the factory default is not documented and OMNI would take every program change). H4MIDI WC: the pedal on a USB host port behind the powered hub, that port filtered to channel 16 and program change only. Connect the USB host before the set; the pedal shows a USB CONNECT prompt on batteries. Hardware check: send PC 0 and PC 1 and note which patch the display shows; set displayBase accordingly.
- Unverified: channel.default, programChange.displayBase, class compliance behind a USB host (not in CME's list), patch change delay.
- Documents read: MS-70CDR+ system software 1.20 (January 2025); MIDI implementation chart 1.00 (2024-03-01).

## 10. Laying out a file for scene changes and track launching

- A scene change (the player jumps to a row) sends the new row's events on every channel, pedals included, before the row's first notes. So a row that starts a section carries every device's preset for that section.
- A track launch (the player loops one track's block from a row) sends only the events on that track's own channel. So an instrument's program change must be on the instrument's channel, in the same row as the notes it belongs to. Pedal events never travel with a launch; they fire on scene changes only.
- Therefore: pedal events go in a notes-free track on the pedal's channel; instrument presets go on the instrument's channel at row starts; row 1 holds every device's starting state (SEND SETUP sends row 1).
- A row's events leave in file order (track after track). A device whose rig entry has a gap (H90 on channel 15, 255 ms) stalls every event that follows it in that row for the gap's length, so put such a device's track last in the file. The device then still gets its program change before the bar, because the whole stream is sent early by the sum of its gaps; only at PLAY itself (row 1 with nothing sent early) does the tail after a gap come late, which is why the player runs SEND SETUP before PLAY.
- A launched block loops with its row's length, independently of the song. Make each track's part in a row a loop that stands on its own: no note hanging over from the previous row, no fill that only makes sense before the next row.
- The FM6 part (channel 9) is pinned to Tabby track 8 and sounds inside the SMK-37 only. It is the part to audition or to keep when no external synth is free.

## 11. Limits

| Limit | Value |
| --- | --- |
| Tabby tracks | 8 |
| Rows per song | 128 |
| Steps per block | 64 |
| Notes per step per track | 4 |
| Row lengths | 16, 32, 48, 64 steps |
| Repeat count per row | 1..64 |
| Timing unit | 1/480 of a 16th step; offset −239..+240 |
| Row events per row / per song | 32 / 292 |
| Tempo | 30..300 BPM, whole numbers |
| Songs on the device | 16 |
| Block pool | 80 sectors, 326080 bytes shared by all songs |
| Distinct blocks per song | 2048 |
| Song name | 12 characters |

## 12. How to produce the file

1. Plan first: tempo, meter, row length, number of rows, sections and which row each starts on, parts and channels (section 8), each device's starting preset (section 9).
2. Write the file with code, never by typing bytes by hand. Python with the mido library is the reference (pip install mido). Appendix A is a working template for this rig.
3. Run the checker in Appendix B on the file. It knows this rig's channels, program ranges and named CCs. Fix every ERROR. Fix every WARNING unless it is intended (for example a dropped CC the user accepted). Repeat until it prints RESULT: PASS.
4. Give the user the file and a short summary: tempo, meter, rows, parts with names and channels, row events per row, and the checker's last lines.

If you cannot run code, say so. Then give the user the Python script that writes the file and the checker, and tell them to run both before importing.

## 13. Common mistakes

- Notes in a track with no matching note_off, or a missing end_of_track.
- Note-off and note-on for the same pitch at the same tick written in the wrong order. Write the note-off first.
- Five-note chords, or a chord plus a melody note on the same step in one part.
- Long pad notes held with the sustain pedal instead of real lengths.
- Filter sweeps or volume fades written as CC streams. They are dropped.
- Program changes in the middle of a row. They are dropped.
- Tempo ramps, meter changes, or a pickup before tick 0.
- More than 8 parts, or two channels mixed in one track.
- Notes on a pedal's channel, a program change to a device that takes none, a program number the device cannot reach, a CC the device does not name.
- A preset above 127 without its bank select, or a bank select the device does not use.
- Humanizing every repeat of a loop, which multiplies storage and makes launching a "loop" sound different each time.
- PPQ 100 or other values that don't divide 1920.

## Appendix A. Template: write a song with mido

Writes example.mid for this rig: 8 bars at 120 BPM in 4/4, two rows, with Seashell (channel 1) playing a nudged kick-like pulse, FM-1 A (channel 2) a bass line with a program change at each row start, and FM-1 B (channel 3) a pad. Change the parts, keep the structure. Channels in mido are 0-based: channel 1 is 0.

```python
#!/usr/bin/env python3
"""Example: write an 8-bar Classic Tabby song (two rows of 4 bars) with mido, for the rig "Wrong Room"."""
import mido

PPQ = 480
STEP = PPQ // 4              # one 16th note in ticks
BAR = 16 * STEP

def track(name, channel, notes, pcs=()):
    """notes: (start_tick, length_ticks, pitch, velocity); pcs: (tick, program). channel is 0-based."""
    ev = [(t, 'pc', p, 0) for t, p in pcs]
    for s, l, p, v in notes:
        ev += [(s, 'on', p, v), (s + l, 'off', p, 0)]
    order = {'off': 0, 'pc': 1, 'on': 2}           # note-offs first at equal ticks
    ev.sort(key=lambda e: (e[0], order[e[1]]))
    tr = mido.MidiTrack([mido.MetaMessage('track_name', name=name, time=0)])
    now = 0
    for t, kind, a, b in ev:
        d = t - now; now = t
        if kind == 'on': tr.append(mido.Message('note_on', channel=channel, note=a, velocity=b, time=d))
        elif kind == 'off': tr.append(mido.Message('note_off', channel=channel, note=a, velocity=0, time=d))
        else: tr.append(mido.Message('program_change', channel=channel, program=a, time=d))
    tr.append(mido.MetaMessage('end_of_track', time=0))
    return tr

mid = mido.MidiFile(type=1, ticks_per_beat=PPQ)
mid.tracks.append(mido.MidiTrack([
    mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(120), time=0),
    mido.MetaMessage('time_signature', numerator=4, denominator=4, time=0),
    mido.MetaMessage('end_of_track', time=0)]))
pulse = [(b * BAR + q * 4 * STEP - 12, STEP, 36, 110) for b in range(8) for q in range(4)]  # 12 ticks (12.5 ms) early
pulse[0] = (0, STEP, 36, 110)                                    # nothing before tick 0
bass = [(b * BAR + q * 4 * STEP, 3 * STEP, 36 + (b // 4) * 5, 100) for b in range(8) for q in range(4)]
pad = []
for r, root in enumerate((60, 65)):
    pad += [(r * 4 * BAR, 4 * BAR - STEP // 2, root + i, 70) for i in (0, 4, 7)]
mid.tracks.append(track('Seashell', 0, pulse))
mid.tracks.append(track('FM-1 A', 1, bass, pcs=[(0, 0), (4 * BAR, 1)]))
mid.tracks.append(track('FM-1 B', 2, pad))
mid.save('example.mid')
print('wrote example.mid')
```

## Appendix B. Checker

Save as tabby_check.py and run: python3 tabby_check.py song.mid. Exit code 0 means no errors. The RIG table at the top is generated from the rig profile: channel, device, kind, whether it takes program changes and up to which number, its bank select, and the CCs it names (None = no fixed map, any CC passes).

```python
#!/usr/bin/env python3
"""tabby_check.py: check a .mid file against the Classic Tabby importer rules and the rig "Wrong Room".
Usage: python3 tabby_check.py song.mid
Needs: pip install mido
Exit code 0 = no errors (warnings may remain), 1 = errors found."""
import sys
from collections import defaultdict
import mido

U = 480                      # units per 16th step
HALF = 240
EXACT_PPQ = {96, 120, 192, 240, 384, 480, 960, 1920}
MAX_NOTES_PER_STEP = 4
MAX_PARTS = 8
MAX_ROWS = 128
MAX_LEN_STEPS = 17476
MAX_EVENTS_ROW = 32
MAX_EVENTS_SONG = 292
POOL_BYTES = 326080
PREROLL_STEPS = 4            # importer default: one quarter note

# The rig (generated): 1-based channel -> name, kind, program change (None = not received, else the
# highest wire value accepted in bank 0), banks (CC 0 / CC 32 values per bank index, or None), named CCs
# (set, or None for a device without a fixed map), pinned Tabby track (or None).
RIG = {
    1: {"name": "Seashell", "kind": "instrument", "pc": None, "banks": None, "stride": 128, "total": None, "ccs": None, "track": None},
    2: {"name": "FM-1 A", "kind": "instrument", "pc": 127, "banks": None, "stride": 148, "total": None, "ccs": {1, 5, 7, 10, 11, 64, 71, 72, 73, 74, 75, 91, 93, 94, 120, 121, 123}, "track": None},
    3: {"name": "FM-1 B", "kind": "instrument", "pc": 127, "banks": None, "stride": 148, "total": None, "ccs": {1, 5, 7, 10, 11, 64, 71, 72, 73, 74, 75, 91, 93, 94, 120, 121, 123}, "track": None},
    4: {"name": "M8 part 1 (M8 track 1)", "kind": "instrument", "pc": 127, "banks": None, "stride": 128, "total": None, "ccs": None, "track": None},
    5: {"name": "Proteus part 1", "kind": "instrument", "pc": 127, "banks": None, "stride": 128, "total": None, "ccs": {7, 10, 1, 2, 3, 4, 64, 65, 66, 121, 123}, "track": None},
    6: {"name": "Proteus part 2", "kind": "instrument", "pc": 127, "banks": None, "stride": 128, "total": None, "ccs": {7, 10, 1, 2, 3, 4, 64, 65, 66, 121, 123}, "track": None},
    7: {"name": "Proteus part 3", "kind": "instrument", "pc": 127, "banks": None, "stride": 128, "total": None, "ccs": {7, 10, 1, 2, 3, 4, 64, 65, 66, 121, 123}, "track": None},
    8: {"name": "Proteus part 4", "kind": "instrument", "pc": 127, "banks": None, "stride": 128, "total": None, "ccs": {7, 10, 1, 2, 3, 4, 64, 65, 66, 121, 123}, "track": None},
    9: {"name": "FM6 internal", "kind": "internal", "pc": None, "banks": None, "stride": 128, "total": None, "ccs": None, "track": 8},
    10: {"name": "M8 part 2 (M8 track 2)", "kind": "instrument", "pc": 127, "banks": None, "stride": 128, "total": None, "ccs": None, "track": None},
    11: {"name": "Royalist", "kind": "effect", "pc": 127, "banks": None, "stride": 128, "total": None, "ccs": {24, 25, 27, 28, 29, 30}, "track": None},
    12: {"name": "Brothers", "kind": "effect", "pc": 122, "banks": None, "stride": 123, "total": None, "ccs": {14, 15, 16, 17, 18, 19, 21, 22, 23, 100, 102, 103}, "track": None},
    13: {"name": "M8 part 3 (M8 track 3)", "kind": "instrument", "pc": 127, "banks": None, "stride": 128, "total": None, "ccs": None, "track": None},
    14: {"name": "NightSky", "kind": "effect", "pc": 127, "banks": [(0, None), (1, None), (2, None)], "stride": 128, "total": 300, "ccs": {0, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 60, 63, 80, 81, 82, 83, 93, 100, 102}, "track": None},
    15: {"name": "H90", "kind": "effect", "pc": 98, "banks": None, "stride": 99, "total": None, "ccs": None, "track": None},
    16: {"name": "Zoom", "kind": "effect", "pc": 99, "banks": None, "stride": 100, "total": None, "ccs": set(), "track": None},
}

errors, warnings = [], []
def err(m): errors.append(m)
def warn(m): warnings.append(m)

def rig_program_ok(ch, program, bank_msb, bank_lsb):
    """True when the device on 1-based channel ch reaches program (wire 0..127) with the bank bytes seen."""
    d = RIG.get(ch)
    if not d or d['pc'] is None: return False
    if d['banks']:
        bank = None
        for i, (msb, lsb) in enumerate(d['banks']):
            if (msb is None or msb == bank_msb) and (lsb is None or lsb == bank_lsb): bank = i; break
        if bank is None: return False
        if d['total'] is not None and bank * d['stride'] + program >= d['total']: return False
        return program < d['stride']
    return program <= d['pc']

def main(path):
    mid = mido.MidiFile(path)
    if mid.type not in (0, 1):
        err(f"format {mid.type}: only format 0 or 1 is accepted")
    ppq = mid.ticks_per_beat
    if ppq <= 0:
        err("SMPTE time division is refused; use PPQ")
        return
    if ppq not in EXACT_PPQ:
        warn(f"PPQ {ppq} does not divide 1920; timing will be rounded. Use 480 or 960.")
    to_units = lambda t: t * 1920 * 1.0 / ppq    # 1920 units per quarter note
    tempos, sigs = [], []
    notes = defaultdict(list)    # (track, ch) -> [(on_tick, off_tick, pitch, vel)]
    names = {}
    ctrl = []                    # (tick, track, ch, kind, data)
    ignored = defaultdict(int)
    for ti, track in enumerate(mid.tracks):
        t = 0
        open_ = defaultdict(list)
        has_eot = False
        for msg in track:
            t += msg.time
            if msg.is_meta:
                if msg.type == 'set_tempo': tempos.append((t, mido.tempo2bpm(msg.tempo)))
                elif msg.type == 'time_signature': sigs.append((t, msg.numerator, msg.denominator))
                elif msg.type == 'track_name': names[ti] = msg.name
                elif msg.type == 'end_of_track': has_eot = True
                continue
            if msg.type == 'note_on' and msg.velocity > 0:
                open_[(msg.channel, msg.note)].append((t, msg.velocity))
            elif msg.type in ('note_off', 'note_on'):
                stack = open_[(msg.channel, msg.note)]
                if not stack:
                    warn(f"track {ti} ch {msg.channel+1}: note-off for {msg.note} at tick {t} with no note-on")
                    continue
                on_t, vel = stack.pop(0)
                notes[(ti, msg.channel)].append((on_t, t, msg.note, vel))
            elif msg.type == 'program_change':
                ctrl.append((t, ti, msg.channel, 'pc', msg.program))
            elif msg.type == 'control_change':
                if msg.control == 64: ignored['sustain CC64 (ignored: write real note lengths)'] += 1
                ctrl.append((t, ti, msg.channel, 'cc', (msg.control, msg.value)))
            else:
                ignored[msg.type] += 1
        if not has_eot: err(f"track {ti}: no end-of-track")
        for (ch, p), stack in open_.items():
            for on_t, _ in stack:
                err(f"track {ti} ch {ch+1}: note {p} at tick {on_t} never ends")
    # tempo and meter
    if not tempos: warn("no tempo event: the importer uses 120 BPM")
    else:
        if tempos[0][0] != 0: warn("first tempo is not at tick 0")
        bpm = tempos[0][1]
        if abs(bpm - round(bpm)) > 1e-3: warn(f"tempo {bpm:.3f} BPM is rounded to {round(bpm)}")
        if not 30 <= round(bpm) <= 300: err(f"tempo {bpm:.1f} outside 30..300")
        if len({round(b, 6) for _, b in tempos}) > 1: warn("tempo changes after the first are ignored")
    num, den = (4, 4) if not sigs else sigs[0][1:]
    if sigs and sigs[0][0] != 0: warn("first time signature is not at tick 0")
    if len({s[1:] for s in sigs}) > 1: warn("meter changes after the first are ignored")
    bar = 16 * num / den
    if bar != int(bar) or not 1 <= bar <= 64:
        err(f"meter {num}/{den} gives {bar} steps per bar; must be a whole number 1..64")
        return
    bar = int(bar)
    cands = [r for r in (16, 32, 48, 64) if r % bar == 0]
    row = min(cands, key=lambda r: (abs(r - 4 * bar), -r)) if cands else 64
    if not cands: warn(f"meter {num}/{den}: no row length holds whole bars; rows of 64 steps will cross bar lines")
    # parts
    parts = [k for k in notes if notes[k]]
    if len(parts) > MAX_PARTS:
        err(f"{len(parts)} parts (track, channel pairs with notes); Classic Tabby has {MAX_PARTS} tracks")
    # the rig: every part's channel, pinned tracks claimed twice
    pinned = defaultdict(list)
    for ti, ch in parts:
        d = RIG.get(ch + 1)
        if not d: warn(f"part {names.get(ti, ti)!r} on channel {ch+1}: no device on that channel in the rig")
        elif d['kind'] == 'effect': warn(f"part {names.get(ti, ti)!r} on channel {ch+1}: notes go to {d['name']}, an effects pedal")
        elif d['track']: pinned[d['track']].append(names.get(ti, ti))
    for tr, ps in pinned.items():
        if len(ps) > 1: warn(f"Tabby track {tr} is pinned for {len(ps)} parts ({', '.join(map(repr, ps))}); only the first lands there")
    # notes
    cells = defaultdict(list)   # (part, row, step_in_row) -> notes
    last_units = 0
    for part in parts:
        by_pitch = defaultdict(list)
        anchors = defaultdict(list)
        for on_t, off_t, p, v in sorted(notes[part]):
            su, eu = to_units(on_t), to_units(off_t)
            if eu <= su: err(f"part {part}: zero-length note {p} at tick {on_t}"); continue
            if (eu - su) / U > MAX_LEN_STEPS: err(f"part {part}: note {p} at tick {on_t} longer than {MAX_LEN_STEPS} steps")
            a = int((round(su) + HALF - 1) // U)
            anchors[a].append((p, v))
            by_pitch[p].append((su, eu))
            r, s = divmod(a, row)
            cells[(part, r)].append((s, p, v, round(su) - a * U, round(eu - su)))
            last_units = max(last_units, eu)
        for a, ns in anchors.items():
            if len(ns) > MAX_NOTES_PER_STEP:
                err(f"part {part}: {len(ns)} notes start on 16th step {a} (bar {a//bar+1}); max {MAX_NOTES_PER_STEP}")
            pitches = [p for p, _ in ns]
            if len(pitches) != len(set(pitches)):
                warn(f"part {part}: same pitch twice on step {a}; only the louder is kept")
        for p, spans in by_pitch.items():
            spans.sort()
            for (s1, e1), (s2, _) in zip(spans, spans[1:]):
                if e1 > s2: warn(f"part {part}: pitch {p} overlaps itself at step {s2/U:.2f}; the earlier note is shortened")
    # rows and blocks
    total_steps = last_units / U
    rows = int(-(-total_steps // row)) if total_steps else 0
    if rows > MAX_ROWS: err(f"{rows} rows of {row} steps; max {MAX_ROWS}. Shorten the song")
    blocks = {}
    for (part, r), ns in cells.items():
        key = (tuple(sorted(ns)))
        blocks.setdefault(key, len(ns))
    pool = sum(-(-(6 + 64 + 6 * n) // 4) * 4 for n in blocks.values())
    # row events, against the rig
    per_row = defaultdict(int)
    bank_seen = {}               # channel -> (msb, lsb) seen before the program change in the window
    for t, ti, ch, kind, data in sorted(ctrl):
        st = to_units(t) / U
        R = round(st / row); d = st - R * row
        if -PREROLL_STEPS <= d < 0.5 and R >= 0:
            if kind == 'cc' and data[0] in (0, 32):
                msb, lsb = bank_seen.get(ch, (None, None))
                bank_seen[ch] = (data[1], lsb) if data[0] == 0 else (msb, data[1])
                continue   # merges into the next PC
            per_row[R] += 1
            dev = RIG.get(ch + 1)
            if not dev:
                warn(f"track {ti} ch {ch+1}: {'PC ' + str(data) if kind == 'pc' else 'CC' + str(data[0])} targets a channel with no device in the rig")
            elif kind == 'pc':
                msb, lsb = bank_seen.pop(ch, (None, None))
                if dev['pc'] is None: warn(f"track {ti} ch {ch+1}: PC {data} to {dev['name']}, which does not receive program changes")
                elif not rig_program_ok(ch + 1, data, msb, lsb): warn(f"track {ti} ch {ch+1}: PC {data} (bank {msb}/{lsb}) is outside the range of {dev['name']}")
            elif dev['ccs'] is not None and data[0] not in dev['ccs']:
                warn(f"track {ti} ch {ch+1}: CC{data[0]} is not a CC that {dev['name']} names")
        else:
            what = f"PC {data}" if kind == 'pc' else f"CC{data[0]}={data[1]}"
            if not (kind == 'cc' and data[0] == 64):
                warn(f"track {ti} ch {ch+1}: {what} at step {st:.2f} is not at a row start; it is dropped")
    for R, n in per_row.items():
        if n > MAX_EVENTS_ROW: err(f"row {R+1}: {n} events, max {MAX_EVENTS_ROW}")
    if sum(per_row.values()) > MAX_EVENTS_SONG: err(f"{sum(per_row.values())} row events, max {MAX_EVENTS_SONG}")
    for k, n in ignored.items(): warn(f"{n} x {k} ignored by the importer")
    print(f"file: {path}")
    print(f"format {mid.type}, PPQ {ppq}, tempo {tempos[0][1] if tempos else 120:.2f} BPM, meter {num}/{den}")
    print(f"parts: {len(parts)}  " + ", ".join(f"T{p[0]}:{names.get(p[0],'')!r} ch{p[1]+1}" + (f" ({RIG[p[1]+1]['name']})" if p[1]+1 in RIG else "") for p in parts))
    print(f"rows: {rows} of {row} steps, unique blocks: {len(blocks)}, pool bytes about {pool} ({100*pool/POOL_BYTES:.1f}% of all song storage)")
    print(f"row events: {sum(per_row.values())}")
    for w in warnings: print("WARNING:", w)
    for e in errors: print("ERROR:", e)
    print("RESULT:", "FAIL" if errors else "PASS")

if __name__ == '__main__':
    main(sys.argv[1])
    sys.exit(1 if errors else 0)
```
