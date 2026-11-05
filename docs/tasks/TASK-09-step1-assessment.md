# Task 09, Step 1: assessment and device research (read only)

Version 0.1, 2026-11-05. Branch `classic-tabby/linux-build`, head 3892ce0 (the task text v0.2). No
tracked file other than this one and the task text was changed. Nothing was pushed.

Revision log
- v0.1 2026-11-05: first assessment. The RE-2 correction (task v0.2) is applied throughout: the
  RE-2 has no MIDI and appears only as audio gear in the guide's rig section.

The manufacturer documents were read this day; local copies of the PDFs and the extracted text are in
the session's scratch directory (`dl/`), not in the repository. Every fact below carries its source;
"secondary" marks a non-manufacturer source; "unverified" marks what no document settles.

## 1. The plan, device by device

The proposal, with what the research found. Channel numbers are 1-based as the gear shows them; the
file and the song carry the wire value (channel − 1, program 0..127).

| Ch | Proposed | Verdict | What decides it |
| --- | --- | --- | --- |
| 1 | Seashell | **ok** | channel set in the Controller app; TRS type A in |
| 2 | FM-1 A | **ok on Skiff 2.2; conflict on Melodee / Orange Cat** (section 3) | Skiff: per-track channel with OFF for the rest; Melodee and Orange Cat: four-channel blocks or all channels |
| 3 | FM-1 B | same as 2 | |
| 4 | M8 | **ok for one M8 part**; a second and third part need their own channels (section 4) | the M8 is one channel per track |
| 5–8 | Proteus/2 XR, my parts | **ok**, with every other channel's MIDI ENABLE off on the Proteus (section 6) | Multi mode, per-channel enable |
| 9 | FM6 internal | **ok as a convention**, nothing listens; the FM6 part is pinned to one Tabby track whose SEQ is LOCAL (section 5) | |
| 10 | spare | proposed use: M8 part 2, or one of your wife's Proteus channels (section 4, 6) | |
| 11 | Royalist | **ok only after its channel is set in the Synergy editor**: it ships in OMNI and would take every program change on the chain | editor-only setting |
| 12 | Brothers | **ok**: channel learnt from the first PC after a both-switch power-up; needs a ring-active TRS feed | Chase Bliss MIDIbox or a ring-active output |
| 13 | spare (RE-2 has no MIDI) | proposed use: M8 part 3 | |
| 14 | NightSky | **ok**: DIN in; channel 14 set in power-up mode by sending a PC on 14 | one caveat on the DIN path (section 2) |
| 15 | H90 | **ok** | 1-based program numbers; the CC-after-PC bug still open |
| 16 | Zoom | **ok**: USB MIDI CH = 16 (set it; the default is not documented, OMNI would take every PC) | USB device behind the H4MIDI host port |

Changes I propose to the plan (section 9 has the full table): the M8 gets channel 4 plus the two
spares 10 and 13 for a second and third M8 part; the Proteus sits on its own filtered H4MIDI output so
your wife's channels never meet mine; an FM-1 running Melodee or Orange Cat sits behind a channel
filter too (or runs Skiff); the Royalist's channel is set to 11 in the editor before it joins the chain.

## 2. Each device: how it receives MIDI, what it needs

Sources are the manufacturer's unless marked secondary. Full tables (every CC with its range) are in
the research notes appended as section 12; the device JSON files of Step 2 will carry them verbatim.

### 2.1 Instruo Seashell (channel 1)
- Receive: 3.5 mm TRS **type A** MIDI in (the included adaptor) and class-compliant USB-C audio + MIDI
  (manual p. 11). Input only.
- Channel: Seashell Controller app, Settings > MIDI Channel Menu (p. 50); saved automatically since
  firmware 1.0.3. Channel 1 is possible. Default and omni: unverified.
- Program change: **none in 1.0.3** (presets are files of the Controller app). Firmware 2.0 (secondary:
  SonicState, Oct 2026, "close to release") adds 120 hardware preset slots selected by program change;
  numbering unknown until Instruo publishes it.
- CCs: no fixed map; MIDI Learn only (p. 49); any CC 0..127 as a modulation source (p. 45); since 1.0.3
  a learnt CC at value 63 quantises to 0. Pitch bend ±2 default.
- Clock: **none** (no arpeggiator, no MIDI clock; the only sync is the analogue Gate/Trig input, p. 50).
- Odd: monophonic; a factory reset clears the MIDI map; 1.0.3 "revised the MIDI stack".
- Sources: https://instruomodular.com/wp-content/uploads/manuals/Seashell%20Manual.pdf,
  https://www.instruomodular.com/firmware/ (1.0.3), https://sonicstate.com/news/2026/10/26/beijing-26-instruo-seashell-v20/ (secondary).
- Unverified: default channel, omni, note range, whether USB MIDI feeds MIDI Learn, firmware 2.0's
  program numbering and date.

### 2.2 M-VAVE FM-1, three firmwares (channels 2 and 3)
**Skiff 2.2** (released 2026-11-03; supersedes the 2.1.1 of the Task 04 research):
- Receive: USB class-compliant MIDI in/out and a TRS MIDI in on the FM-1 (type unverified). MENU >
  MIDI: CLOCK, CLOCK OUT, MIDI IN, AUTO CHANNEL, T1–T6 CHANNEL, NOTES OUT, CC OUT, THRU, REMOTE, MIDI
  LEARN, LEARN CLEAR.
- Channel: **T1–T6 CHANNEL = 1..16, OFF, or CH n EXT** per track (2.2). "MIDI IN = CH1-6" means the
  per-track channels; a channel no track is on is ignored entirely; two tracks on one channel: the
  first plays it. So one unit on one channel: T1 CHANNEL = 2 (or 3), T2..T6 = OFF.
- Program change: a PC on a track's channel loads that track's engine's factory sound number n,
  counted from 0; past the last: ignored. 148 factory sounds over 14 engines; no bank select.
- CCs (track's channel): 5 glide, 7 level, 10 pan, 71 engine resonance, 72 release, 73 attack, 74
  engine brightness, 75 decay, 91 reverb send, 93 chorus send, 94 delay send; 1 mod wheel, 11
  expression, 64 sustain, 120/121/123, RPN 0 bend range. REMOTE (own channel): CC 102–115 press the
  14 panel buttons. MIDI LEARN: 10 CCs.
- Clock: CLOCK = INT / USB / TRS; follows Clock, Start, Continue, Stop and (2.2) Song Position from the
  chosen input; CLOCK OUT (2.2) sends 24 ppqn + Start/Stop when INT.
- Sources: https://github.com/illuminus5/skiff/releases/tag/v2.2, the README's MIDI implementation,
  firmware/src/midi_control.c, seq.c, ui.c (midi_pc_load), midi_clock.c; the online manual lags (1.3-era).
- Unverified: TRS type; the 2.2 items the author lists as "not yet tried on a unit".

**Melodee 1.6.1** (2026-11-02, no newer tag):
- No program change handler (midi_control.c dispatches notes, bend, CC, channel pressure only).
- Input routing: GLO > SYSTEM > ROUT = **CH1-4 / CH5-8 / CH9-12 / CH13-16** (the four channels of the
  block play tracks 1..4 in order; other channels ignored) **or SEL** (every channel plays the selected
  track). DRUM channel (default 10) redirects its channel to the first DRUM track within the block.
  **No per-track input channel.** MIDI Track engine tracks have an output channel only.
- CCs: 5, 7, 10, 71, 74, 72, 73, 75; 1, 11, aftertouch as mod sources; 64; 120, 121, 123; RPN. CC 91
  does nothing; 93 only with the MINILAB knob profile.
- Clock: GLO > GLOBAL > CLK = INT / USB / TRS / BLE, a device setting; follows clock, Start, Continue,
  Stop, Song Position from that input; 1.6.1 adds clock out on USB and BLE when INT (not tried with gear).
- USB class-compliant MIDI in/out; BLE MIDI in/out; TRS is input only.
- Sources: https://github.com/keremimo/melodee/releases/tag/v1.6.1, README, firmware/src/params.c
  (N_ROUTE), midi_control.c, docs/RELEASE_1.5.0-rc.1.md.

**Orange Cat** (your firmware, read in ~/oc-ui at 7e7bf40; the docs there name releases up to
1.4.0-rc.2 and the memory notes 0.16.0 on 2026-11-02; no version string in the sources):
- Same routing model as Melodee: `midi_track()` in seq.c maps a block of four channels to tracks 1..4
  (`route − 1) × 4` first channel), SEL to the selected track, with the DRUM channel override. No
  program change (no 0xC0 branch). CCs 5, 7, 10, 72, 73, 75, 12–18 (DUB TAPE), 91, 93, 94, 104, 74/71
  macros; 1, 64, 120, 121, 123, RPN 0.
- Read from the source only; unverified on hardware. Orange Cat code stays uncopied; only these facts
  enter the definition.

### 2.3 Dirtywave M8 Tracker Model:02 (channel 4, proposed also 10 and 13)
- Receive: 3.5 mm TRS **type A** in and out, USB class-compliant; USB MIDI behaves like TRS (manual
  v6.5.2 pp. 2, 64; specifications). Firmware 6.6.3 F (changelog 2026-10-20); manual 6.5.2 (2026-04-21).
- Channel to track: MIDI Settings > Track MIDI Input, per track: CHAN, INST#, PG CHANGE, MODE
  (MONO / LEGATO / POLY). **Defaults: track n = channel n (1..8), INST# 00, PG CHANGE ON, LEGATO**;
  REC NOTE channel 9, CONTROL MAP channel 10 (or ALL), SONG ROW CUE 11. All stored in the song.
  Several tracks on one channel play together: MONO in unison, LEGATO likewise without retrigger,
  **POLY round-robin** across those tracks (manual p. 45; changelog 2.5.0).
- Program change: with PG CHANGE on, a PC on the track's channel selects that track's instrument
  (INST# 00..7F hex); PC n = INST# n is the natural reading, unverified; bank select on receive:
  not documented.
- CCs: user-made mappings (up to 128 per song) on the CONTROL MAP channel; CC 64 sustain and pitch
  bend on the track input; no fixed table. Mute/solo by notes on the control channel.
- Clock: MIDI Settings SYNC IN = CLOCK / TRANSPORT / CLOCK+TRANSP. / TRANSPORT+SPP / CLK+TRANSP+SPP
  (manual p. 44); SPP fixed in 6.6.3 D; "WAITING FOR SYNC" when none.
- Sources: https://cdn.shopify.com/s/files/1/0455/0485/6229/files/m8_operation_manual_v20260421.pdf,
  https://raw.githubusercontent.com/Dirtywave/M8Firmware/main/changelog.txt (the 2023 manual for the
  settings screenshot).
- Unverified: PC n = INST n; bank select; whether a track's CHAN can be "off" (the manual lists 1..16
  and the control channel's ALL); CCs on the track channel beyond 64 and bend.

### 2.4 E-MU Proteus/2 XR (channels 5 to 8)
- Receive: 5-pin DIN in, out, thru (thru is an exact copy of in). Multi mode: any set of the 16
  channels, each with its own preset, volume and pan; per channel **MIDI ENABLE** on/off ("when you
  have other MIDI devices connected and do not want the Proteus to respond to the MIDI channels
  reserved for the other devices") and **PRESET CHANGE** on/off (manual pp. 14–19).
- Setting parts 5–8 from the panel: Master > screen title > MIDI MODE = Multi; Master > MIDI ENABLE:
  channel 05..08 On, every other channel Off (except your wife's); Master > PRESET CHANGE: 05..08 On;
  exit; on the main screen cursor to the channel number, dial C05, cursor to the preset number, dial
  it; repeat for C06..C08. Master menu navigation: cursor to the title, data knob to the screen.
- Program change: presets displayed 000..383 on the XR (0-based). MIDI selects 000..127 directly;
  **no bank select** (the received-commands table lists no CC 0 / 32); presets 128..383 only through
  the global **MIDI PROG>PRESET** map (Master menu, 128 entries, one per incoming program; SysEx
  parameters 512..639; dumped as "Program/Preset Map"). XR banks of 64: 0..63, 64..127, 128..191,
  192..255, 256..319, 320..383; ROM 256..319 duplicated in RAM 0..63; the Edit menu saves to 0..255.
- Controllers: CC 7 volume, 10 pan; CC 1..31 as the four realtime controllers A..D (Master > MIDI
  CONTROLLER ASSIGN, defaults A 1, B 2, C 3, D 4; 7 or 10 there overrides volume/pan), routed per
  preset in the Edit menu; footswitches 1..3 on CC 64..79 (defaults 64, 65, 66; value ≥ 64 = on;
  sustain only if the preset routes it); 121 reset, 123 all notes off; mode messages 124..127 when
  MIDI MODE CHANGE is on; pitch bend with a global or per-preset range.
- Clock: **none** (the manual has no clock, no realtime messages; the demo is play-only).
- Odd: program changes are ignored while the Edit menu is open; "send setup information before the
  song starts, not just before the first beat"; MIDI OVERFLOW beyond 32 voices to MIDI out.
- Sources: https://archive.org/details/synthmanual-e-mu-proteus-owners-manual (the family manual with
  the 1992 MIDI addendum), ManualsLib 895817.
- Unverified: preset change latency; XR names above 191 beyond "ROM repeats".

### 2.5 Tone King Royalist Preamp (channel 11)
- Which product: the **Royalist Preamp pedal** (toneking.com/shop/pedals/tone-king-royalist-preamp/;
  the Royalist MKIII head and combo have no MIDI). Manual "FINAL 01 19 2026" (uploads of Feb and Nov
  2026, same text).
- Receive: 5-pin DIN **in only** (no out/thru); USB-C for the Synergy Editor App 8.9.6, firmware and
  USB audio.
- Channel: **default OMNI** ("receives messages on all channels"); set **only in the editor** ("MIDI
  CHANNEL programs the MIDI INPUT channel"); no panel procedure; the range is not printed (1..16 plus
  OMNI presumed).
- Program change: 128 presets, "0-127" per the sibling Imperial manual (the Royalist manual says
  "128 storable MIDI PROGRAM CHANGES"); stored from the pedal by long-pressing REVERB + CHANNEL on the
  active preset number; presets hold channel, master bypass, IR selection and bypass, loop bypass,
  reverb bypass and tails. No bank select; nothing to enable.
- CCs: "listed in the MIDI CC LIST" tab of the editor; **not printed in the manual**. Same-platform
  guess (Synergy SYN-20IR, secondary): 24 channel (0/1/2), 25 structure, 27 IR bypass (0 off, 127 on,
  other toggle), 28 IR select (0..3), 29 low-pass level, 30 high-pass level. To be read from the
  editor on your unit at Step 4.
- Clock: none. No MIDI thru: last in the chain or on its own port.
- Sources: https://www.toneking.com/wp-content/uploads/2026/11/TONE-KING-ROYALIST-PREAMP-INSTRUCTION-MANUAL-BOOKLET-FINAL-01-19-2026.pdf,
  https://www.toneking.com/shop/pedals/tone-king-royalist-preamp/, Imperial and SYN-20IR manuals (secondary).
- Unverified: the CC table, the channel range, 0- or 1-based display, latency, firmware version.

### 2.6 Chase Bliss Audio Brothers (channel 12)
- Receive: the 1/4" TRS jack "EXT(A) / MIDI" (the "TAP/MIDI jack" of the MIDI manual). MIDI arrives on
  the **ring**, tip floating ("ring active"); the prescribed interface is the powered **Chase Bliss
  MIDIbox** (DIN in, TRS out, jumper in RING, USD 59). A ring-active TRS MIDI output (Morningstar
  Omniport "MIDI Ring Active") also works per Chase Bliss support (secondary). A standard TRS type A
  cable does not. No DIN, no USB, no thru.
- Channel: default 2. Set by holding both stomp switches at power-up, releasing, then sending a PC on
  the wanted channel: the first PC seen sets the channel permanently. Channel 12 is possible. No
  factory reset exists. Omni: not documented.
- Program change: PC 0 = live mode; **PC 1..122 = presets 1..122** (slots 1 and 2 are the toggle's);
  saved by sending a PC while holding both switches. No bank select, nothing to enable.
- CCs: 14 gain A, 15 master, 16 gain B, 17 tone A, 18 mix/stack, 19 tone B (0..127); 21 channel A
  type (1 boost, 2 drive, 3 fuzz); 22 order (1 PARA, 2 A>B, 3 B>A); 23 channel B type (1 fuzz, 2 drive,
  3 boost); 100 expression (0..127); 102 bypass (127 = last saved channels, 0 = both bypassed); 103
  bypass states (127 both on, 85 A only, 45 B only, 0 both off). Brothers AM (2025) has a different map.
- Clock: none.
- Sources: https://cb2k22.squarespace.com/s/Brothers_MIDI-Manual_Pedal_Chase-Bliss.pdf,
  https://cb2k22.squarespace.com/s/Brothers_Manual_Pedal_Chase-Bliss.pdf, https://www.chasebliss.com/support,
  https://chasebliss.com/shoputility/p/midibox.
- Unverified: the electrical level of the ring input, PC 123..127, latency, learn-state timeout.

### 2.7 Strymon NightSky (channel 14)
- Receive: **5-pin DIN MIDI IN and OUT** plus USB (mini) and, optionally, the 1/4" TRS EXP jack in MIDI
  mode (Strymon MIDI EXP cable: tip-active with an opto-isolator in the cable; third-party TRS cables
  do not work). Use the DIN input. When only receiving, set TRS MIDI Output to OFF.
- Channel: default 1; range 1..16; power-up mode: hold INFINITE while powering, release when the
  footswitch LEDs light, SPEED knob to blue, then **send a PC on channel 14** while the LED blinks;
  press INFINITE to store (manual p. 29). One FAQ says the 4..16 option "requires a 1/4" MIDI
  connection to set"; the manual does not say so: unresolved, so set it once over the EXP jack if the
  DIN path does not latch.
- Program change: 300 presets 0..299 in three banks: **CC 0 = preset div 128, PC = preset mod 128**;
  the pedal powers up in bank 0, so send CC 0 before every PC; bank 0 PC 127 = Manual mode (not a
  preset); the 16 front-panel presets 1..16 = bank 0 PC 0..15. Nothing to enable. CC 32 is not
  mentioned (assume ignored).
- CCs (manual pp. 37–39, full table in section 12): 0 bank; 11 reverb level, 12 dry, 13 mod speed, 14
  mod target (0..2), 15 mod depth, 16 mod shape (0..5), 17 pre-delay, 18 decay length, 19 texture
  (0..2), 20 size/pitch, 21 quantize (0..2), 22 low cut, 23 high cut, 24 filter (0..1), 25 lowpass Q,
  26 voice interval (0..25), 27 scale (0..7), 28 shimmer (0..1), 29 shimmer level, 30 glimmer (0..2), 31
  glimmer gain, 33 drive (0..2), 34 drive level, 35 freeze, 36 morph, 37 morph speed, 41 sequence
  mode, 42..49 step on/off, 50..57 step size, 58 glide, 60 MIDI expression on/off, 63 MIDI clock
  on/off, 80 footswitch ON, 81 FAVORITE, 82 INFINITE, 83 persist, 93 sequence tap, 100 expression,
  102 bypass/on. On/off: 0 off, 1..127 on. MIDI notes C-2..C0 play SIZE/PITCH.
- Clock: receives on DIN, USB or EXP; syncs **only the sequencer tempo**, enabled per preset (Live Edit
  RESPOND TO MIDI CLOCK, or CC 63 = on, saved in the preset). No delay-time sync. Start/Stop: not
  documented.
- Odd: DIN MIDI Thru default "On" means only the pedal's own messages leave MIDI OUT; "Through" echoes
  input. Firmware 1.07 (March 2021). Manual Rev F.
- Sources: https://www.strymon.net/manuals/Nightsky_UserManual_RevF.pdf,
  https://www.strymon.net/faq/how-can-i-control-nightsky-with-midi/,
  https://www.strymon.net/faq/how-do-you-save-and-recall-presets-on-nightsky/,
  https://www.strymon.net/faq/how-to-sync-the-nightsky-sequencer-to-midi-clock/,
  https://www.strymon.net/faq/nightsky-firmware-revision-release-notes/, https://www.strymon.net/midi-control-sunset-riverside/.
- Unverified: USB class compliance, Start/Stop handling, preset load time, the DIN-path channel latch,
  the TRS output default (sources contradict).

### 2.8 Eventide H90 (channel 15)
- Receive: 5-pin DIN in, DIN out/thru, USB-C (MIDI over USB). No TRS MIDI (the TRS jacks are EXP/CTL).
  Firmware 1.12.5 (2025-12-18) is the latest found; manual v1.12.5.
- Channel: System > MIDI > Channel 1..16 (receive and transmit) or Receive Omni. Channel 15 is possible.
  Default not stated.
- Program change: addresses the active **Playlist** (a User List of 99 Programs); **PC Offset off
  (default): wire PC n = Program n, 1-based, wire 0 unused; PC Offset on: wire 0 = Program 1**. No bank
  select of any kind (Bank Up / Down only as CC functions; 33 banks of three); Lists are not selectable
  by MIDI; a PC always loads at once with spillover.
- CCs: no defaults; every function gets its number in System > MIDI > Global Control (Load, Inc, Dec,
  Bank Up/Down, Tuner, Tap Tempo, mode changes, P/A/B Act/Byp and momentary variants, Insert 1/2,
  HotSwitch 1..3, Perform 1..6, Quick Knobs 1..6, HotKnobs, gains, mix); toggles act at ≥ 64. Any
  algorithm parameter can be mapped to a CC per Program.
- Clock: Tempo Menu > Tempo Source = MIDI Clock; System > MIDI > Clock Source = DIN or USB. Start/Stop:
  not documented.
- Odd: **CC immediately after PC ignored**: present in 1.9.11 per Eventide staff (March 2025, "not
  addressed", use 1.8.6 if needed); not mentioned as fixed in 1.12.5. Keep the gap after the PC. Output
  Mode Off / Transmit / Thru.
- Sources: https://cdn.eventideaudio.com/manuals/h90/1.12.5/content/system-menu/midi.html,
  .../appendix/global.html, .../tempo-menu.html, .../appendix/specifications.html,
  https://www.eventideaudio.com/forums/topic/v1-9-11-release-notes/, https://www.eventideaudio.com/?p=189216,
  https://www.eventideaudio.com/forums/topic/h90-software-latest-h90-release-1-12-5/.
- Unverified: default channel, wire 99/100 with offset off, factory list counts, Start/Stop, whether
  the CC-after-PC bug is fixed in 1.12.5.

### 2.9 Zoom MS-70CDR+ (channel 16)
- Receive: **USB-C only**, a USB device (bus-powered); no DIN, no TRS. Needs a USB host: the H4MIDI
  WC's USB-A port (1 A, class-compliant devices). Firmware 1.20 (Jan 2025: a fix for the M-VAVE
  Chocolate Plus controller); MIDI chart 1.00.
- Channel: MENU > USB MIDI CH = 1..16 or OMNI, memorised. Default not documented: **set 16 explicitly**.
- Messages: **program change only**, "0–100" per the chart for patches displayed 001..100 (PC 0 or 1 =
  patch 001 unverified, bench test); no CC, no clock, no SysEx, nothing transmitted. 100 patches, 80
  factory.
- Sources: https://zoomcorp.com/media/documents/E_MS-70CDRplus.pdf (chart p. 69),
  https://zoomcorp.com/documents/3421/MS-70CDRplus_VersionHistory_120_en.pdf.
- Unverified: PC base, default channel, patch-change delay, hosting by the H4MIDI (compatible on paper,
  not in CME's list).

### 2.10 Boss RE-2 Space Echo
No MIDI: the owner's manual (https://static.roland.com/assets/media/pdf/RE-2_eng01_W.pdf) and the
specification page list INPUT A/B, OUTPUT A/B, CTL/EXP and DC IN only. Audio only in the guide's rig
section; delay time by hand or tap.

### 2.11 The SMK-37 Pro and the CME boxes
- SMK-37 Pro: **3.5 mm MIDI OUT jack ("use a 3.5 mm to MIDI adapter"), no MIDI IN, USB-C MIDI, BLE MIDI**
  (M-VAVE manual, PDF of 2026-05-07; products-data.js). TRS type: M-VAVE never says; secondary sources
  (heise, genkigenki's hardware notes) say type A. The firmware sends on three ports (USB, BLE, DIN =
  the TRS jack) when a track's OUT PORT is ALL. The TRS link runs at 31250 baud, about three bytes per
  millisecond: a 16th at 120 BPM has room for about 130 three-byte messages, so eight tracks with
  events and clock fit with margin, but a scene change that sends 32 events plus chords in one block
  lands over a few milliseconds.
- CME H4MIDI WC (manual v05c, HxMIDI Tools v06b): **DIN only** (2 in, 2 out, no TRS) plus USB-A host
  (class-compliant devices, 1 A, a hub gives up to 8 host ports) and USB-C client (4 virtual ports to a
  computer). Default routing: MIDI IN 1 → USB-A OUT 1, USB-C OUT 1 (and BLE); MIDI IN 2 → USB-A OUT 2;
  USB-A IN 1/2 → both DIN outs; **DIN IN is not routed to DIN OUT by default**. Everything is set in
  HxMIDI Tools over USB-C and stored in the unit (4 presets): a routing matrix (any input to any outputs),
  **filters per port** (by channel 1..16, or by message type: note on/off, PC, CC, pressure, bend,
  SysEx, MTC, SPP, song select, tune, clock, start, continue, stop, active sense, reset), 16 mappers
  (channel remap, filter one message type on one channel). The Thru5 WC is a plain 1-in 5-thru DIN
  splitter (USB-C power only, optocoupled, no filtering).
- Sources: https://www.cme-pro.com/wp-content/uploads/2025/02/H4MIDI-WC-user-manual_English_v05c.pdf,
  https://www.cme-pro.com/wp-content/uploads/2025/02/HxMIDI-Tools-user-manual_English_v06b.pdf,
  https://www.cme-pro.com/wp-content/uploads/2025/02/MIDI-Thru5-WC-user-manual_English_v07.pdf,
  https://manualf.oss-cn-hongkong.aliyuncs.com/manual/MIDI-KEYBOARD/SMK-37PRO.pdf.
- Unverified: the SMK-37 jack's TRS type; the H4MIDI hosting the Zoom and two FM-1s on one hub.

## 3. The FM-1 units: the conflict and the ways out

Skiff 2.2 can be a single-channel instrument: T1 CHANNEL = the planned channel, T2..T6 = OFF. Melodee
1.6.1 and Orange Cat cannot: their input is a block of four consecutive channels (CH1-4, 5-8, 9-12,
13-16) or every channel (SEL). With the plan as proposed:

- an FM-1 on CH1-4 hears the Seashell (1), the other FM-1 (3 or 2) and the M8 (4) besides its own
  channel: not usable;
- CH5-8 is the Proteus; CH9-12 would hear the FM6 convention channel (9, harmless only if that Tabby
  track's SEQ is LOCAL), the spare 10, the Royalist (11, PC only, CCs unknown) and the Brothers (12,
  CCs 14..23, 100, 102, 103: 100 is RPN LSB on the FM-1, the rest unmapped); CH13-16 hears the
  NightSky (CC 11..102, most of which Melodee / Orange Cat map to glide, level, pan, release and
  envelopes) and the H90: not acceptable.

Three ways out, in the order I recommend:

1. **Filter at the H4MIDI WC.** Feed each Melodee / Orange Cat unit from its own H4MIDI port (USB host
   through the hub, or a DIN out) with a per-port channel filter that passes only its channel; set the
   unit to ROUT = CH1-4. Channel 2 then plays the unit's track 2, channel 3 its track 3 (the block maps
   channel n to track n). The plan keeps channels 2 and 3. Costs an H4MIDI port per unit and the filter
   setup; CME's filters are per port, so this is exactly what they are for.
2. **Run Skiff on the units that must sit on one channel.** No filter, T1 CHANNEL = 2 or 3, the rest OFF.
3. **Add a per-track input channel to Orange Cat** (your own firmware; Skiff's T1–T6 CHANNEL with OFF is
   the model). Out of this task's scope, but it would make the rig firmware-agnostic.

The rig profile records the firmware per unit (three definitions exist; the Orange Cat one is a
placeholder to fill from the source facts above), and the guide's device section says which of the
three applies to the unit's channel.

## 4. The M8: one channel or a block

The M8 is one channel per track, set per song in MIDI Settings (default track n = channel n). On one
channel, tracks sharing it play in MONO, LEGATO or POLY (round-robin). A program change on the channel
sets the instrument of the track(s) on it. So:

- **One M8 part** (a break, or one synth voice): channel 4 on M8 track 1 (CHAN 4, PG CHANGE on, INST#
  as the song's PC says); set M8 tracks 2..8 to channels nothing sends on, or to channel 4 in POLY if
  you want polyphony on that part. Whether a track's CHAN can be "off" is unverified; the manual lists
  1..16.
- **Several independent M8 parts** (breaks plus bass plus a synth voice, each with its own instrument
  and program changes): each needs its own channel and its own Tabby track. Proposal: **M8 part 1 on
  4, part 2 on 10, part 3 on 13** (the two spares; 13 freed by the RE-2 correction), M8 tracks 1..3
  on CHAN 4, 10, 13. The channels need not be consecutive. Tabby's eight tracks then hold at most
  Seashell, FM-1 A, FM-1 B, three M8 parts and two Proteus parts, or any other mix; the file decides.
- Plan change that follows: 10 and 13 stop being spare. If you would rather keep spares, the M8 stays
  one channel and the guide says "one M8 part per song".

## 5. FM6: how a Tabby track plays it, and channel 9

Today: a Tabby track plays the internal engine when its SEQ setting (SEQ page 6/7 MIDI TRACK, K3) is
LOCAL or BOTH; MIDI sends on its OUT CH (or the song's override) when BOTH or MIDI; OUT PORT ALL or
OFF. These are device preferences per track, not project or song data, and the workbench cannot set
them (the simulator previews them). Song notes follow the same rules as pattern notes
(app/midi_router.c). The engine is per track, so "FM6" is not a channel: any track with SEQ LOCAL or
BOTH sounds inside, whatever its channel.

The cleanest automatic landing: an **"FM6 internal" pseudo-device in the device library** (kind
"internal", no program change, the SMK-37's own CCs as named controllers: 7, 10, 11, 91, 64, 120,
121, 123 and the engine CCs per the help texts) on channel 9 in the Wrong Room profile, **pinned to one
Tabby track** (a `track` field on the rig channel; proposal: track 8). The importer sends a channel-9
part to that track with OUT CH 9 and warns if two parts claim it. On the device, once: track 8 SEQ =
LOCAL, so nothing leaves on 9 (BOTH would also send on 9: harmless unless an FM-1 sits on a CH9-12
block). Cost: importer and rig changes only; **no firmware change**. A firmware alternative (a song
flag that forces a track local) would cost flash and a record-layout change; not proposed.

## 6. The Proteus and your wife's parts

The Proteus hears the whole DIN chain. With channels 1..16 nearly all assigned, her parts have no
channel that is not also one of mine unless the Proteus hears a filtered copy. Proposal: the Proteus
on **H4MIDI MIDI OUT 2 with a port filter passing channels 5..8 only** from MIDI IN 1 (Tabby), merged
with her controller on MIDI IN 2 (unfiltered, routed to OUT 2). Then her channels can be anything but
5..8, her MIDI ENABLE stays as she likes, and on the Proteus only 5..8 need MIDI ENABLE and PRESET
CHANGE on for my parts. Without the filter, the Proteus must have MIDI ENABLE off on every channel of
mine she does not use, and her parts can only take channels nothing of mine sends on: with the M8
block, none remain. The guide carries the note "channels 5 to 8 are reserved for Classic Tabby's Proteus
parts" and the rig shows them as Proteus parts 1..4.

Presets above 127: only through the Proteus's own MIDI PROG>PRESET map (global, 128 entries). The
definition already models this (`program: null, number`); the guide will show "preset 300 = program
map entry you assign, send PC n" and the importer warns on programs the device cannot reach directly.

## 7. Conflicts across the plan, and the H4MIDI WC settings

- **Omni and all-channel listeners:** the Royalist (OMNI by default, editor-only setting), the Zoom (OMNI
  is an option; default unknown), Melodee / Orange Cat FM-1s in SEL, the Proteus in Omni/Poly mode.
  Each must be set to its channel or sit behind a filter; the checklist does both where possible.
- **Program changes reach every device on the chain** that listens on the channel: with every device on
  its own channel nothing crosses; the Royalist in OMNI would take the NightSky's, the H90's and the
  Brothers' program changes.
- **Clock** goes to all ports. Receivers that sync: H90 (Tempo Source), NightSky (its sequencer, per
  preset), M8 (SYNC IN), FM-1 (Skiff / Melodee CLOCK = USB or TRS). Not receivers: Zoom, Brothers,
  Royalist, Seashell, Proteus. Clock to a non-receiver is ignored, no filter needed; filtering it off
  the Zoom's port is tidy, not necessary.
- **Bandwidth on the TRS out**: the one physical line carries all channels; see 2.11.
- **Proposed H4MIDI WC routing** (HxMIDI Tools, one preset):
  - Tabby 3.5 mm MIDI OUT → adapter → **MIDI IN 1**.
  - MIDI IN 1 → **MIDI OUT 1** (no filter) → Thru5 WC → NightSky DIN in, H90 DIN in, Royalist DIN in,
    MIDIbox → Brothers, Seashell (DIN-to-TRS type A), M8 (DIN-to-TRS type A), FM-1 on Skiff (DIN-to-TRS
    adapter; its TRS type unverified).
  - MIDI IN 1 → **MIDI OUT 2**, port filter on OUT 2: block channels 1..4 and 9..16 (pass 5..8); her
    controller on **MIDI IN 2** → MIDI OUT 2 (no filter) → Proteus.
  - MIDI IN 1 → **USB-A host ports** through the powered hub: the Zoom (filter on its port: block
    channels 1..15, and block everything but Program Change), each Melodee / Orange Cat FM-1 (filter:
    pass only its channel). "USB Host Ports reservation" keeps the port order across power cycles.
  - Nothing routed back to MIDI IN; USB-C to the computer only for HxMIDI Tools.

## 8. Firmware: nothing needs to change

Every item of this task lives in the workbench: device definitions, the built-in profile, the importer
mapping and warnings, the guide generator and its download. The firmware already does what the
design needs: a song carries one OUT CH per track (the importer sets it), row events carry a channel,
a launched or returning track sends only the events on its OUT CH (Task 06), a scene change sends the
row's events on every channel. Effects pedal channels have no Tabby track, so their events fire on
scene changes only, as the decision says. **Flash cost: 0 bytes; the margin stays 2525 bytes.** The
only firmware items touched by the research are the two hint texts and the ACTIONS index already in
the left-to-build list (BUILD.md 22.1), unrelated to this task.

## 9. The channel plan I propose

| Ch | Device | Tabby track | Kind | Program numbering (wire → shown) | Clock |
| --- | --- | --- | --- | --- | --- |
| 1 | Instruo Seashell | by file order | instrument | none (fw 1.0.3) | no |
| 2 | FM-1 A (firmware chosen in the rig) | by file order | instrument | Skiff: PC n = engine sound n (0-based); Melodee / Orange Cat: none | yes (CLOCK USB/TRS) |
| 3 | FM-1 B (firmware chosen in the rig) | by file order | instrument | as 2 | yes |
| 4 | M8 part 1 (M8 track 1) | by file order | instrument | PC n = INST n (hex, unverified) | yes (SYNC IN) |
| 5–8 | Proteus/2 XR parts 1–4 | by file order | instrument | 0-based 000..127 direct; 128..383 by the device map | no |
| 9 | FM6 internal | **track 8 (pinned)** | internal | none | n/a |
| 10 | M8 part 2 (M8 track 2) | by file order | instrument | as 4 | yes |
| 11 | Tone King Royalist Preamp | none | effect | PC 0..127 = presets 0..127 (editor numbering unverified) | no |
| 12 | Chase Bliss Brothers | none | effect | PC 1..122 = presets 1..122, PC 0 = live | no |
| 13 | M8 part 3 (M8 track 3) | by file order | instrument | as 4 | yes |
| 14 | Strymon NightSky | none | effect | preset p: CC 0 = p div 128, PC = p mod 128; shown 0..299 | sequencer only, per preset |
| 15 | Eventide H90 | none | effect | 1-based: PC n = Program n (offset off) | yes (Tempo Source) |
| 16 | Zoom MS-70CDR+ | none | effect | patches 001..100 (base unverified) | no |

Changes from your proposal: 10 and 13 become M8 parts 2 and 3 (drop them if you want spares); the FM6
part is pinned to track 8; the Proteus is fed through a filtered port; the Royalist's channel is set
in the editor; the RE-2 is out. Everything else stands. Your wife's Proteus parts: any channel but
5..8 on the filtered port (section 6).

## 10. The generated guide: layout, tool, test

**Generated from the profile and the device JSON** (never typed): the channel map table of section 9
(channel, device, kind, Tabby track rule, numbering, clock); one section per rig channel with the
device's connection, how to set its channel, program numbering with the wire value beside the shown
number and the bank select it needs, the named CC table with ranges and value meanings, clock
receive and its setting, the gap and lead the rig gives it, and its unverified fields; the effects
channel list the layout rules refer to; the limits (32 events per row, 292 per song, 4 notes per step,
128 rows, 1/480 units); the version line (workbench display version, device library version, profile
name and hash).

**Hand-written** (a Markdown template with placeholders): what the guide is for, how to write the file
(type 0 or 1, PPQ, one track per part, the track name convention `Device name` or `ch12 Brothers`,
tempo and meter once, bar and row alignment, the 16/32/48/64-step rows, pre-roll for events), the
track-launching layout (pedal events in a notes-free track on the pedal's channel, instrument presets
on the instrument's channel at row starts, why a launched track only carries its own channel's
events), the FM6 convention, worked examples, what the importer warns about and how to fix each one,
and the RE-2 and other audio-only gear in the rig description.

**Tool**: `web/rig/guide.js` (classic script + CommonJS, like rig.js) builds the Markdown from a profile,
the library and the template; `tools/linux/midi-guide.mjs` (Node, `make midi-guide`) writes
`docs/MIDI-GUIDE.md` from `web/rig/profiles/wrong-room.json`, `web/devices/*.json` and
`docs/MIDI-GUIDE.template.md`. The same builder runs in the workbench behind a "Download the MIDI
guide" button in the Import MIDI panel, from the active profile, so the download always matches the
installed page. **Test**: `tests/workbench/midi-guide.mjs` regenerates the guide in memory and fails
when `docs/MIDI-GUIDE.md` differs (the committed file is stale), when a channel of the profile has no
section, when a device section's numbering or CC table differs from the definition, or when the
template references a channel or device the profile does not have. `make workbench-test` runs it.

## 11. Step 2 design notes (for the approval, not yet built)

- **Device library**: four new definitions (chase-bliss-brothers, strymon-nightsky, tone-king-royalist,
  smk37-fm6-internal) and rechecks of the existing nine (M8 firmware 6.6.3, Skiff 2.2 with OFF / EXT /
  AUTO CHANNEL / clock out, H90 1.12.5 and the open CC-after-PC bug, NightSky-style facts). The
  `tabby-device/1` schema gains optional fields the validator tolerates today: `kind` (instrument /
  effect / internal), `midiIn` (connector, TRS type, adapter note), `clock` (receives, what syncs, the
  setting), `channelSetting` (how to set the channel), `firmware` (version and date read). A definition
  without them stays valid; existing tests keep passing.
- **Rig profile**: `web/rig/profiles/wrong-room.json` (tabby-rig/1 plus an optional `track` per channel
  for the FM6 pin and `kind` overrides), inlined by build-web.py as `FM1_RIG_PROFILES`; rig.js gains
  `rigBuiltins()` and the panel a "Profile" select (built-in profiles read-only, "Copy to my rig"
  makes the editable copy; "My rig" is what is saved, as today). Old profiles load unchanged.
- **Importer**: OUT CH from the part's channel; part names matched against the rig's device names and
  ids (shown in the parts table); the FM6 pin; warnings `channelNotInRig`, `notesOnEffectsChannel`,
  `programOutOfRange` (per the device's programs and banks; Proteus above 127 "through the map"),
  `ccNotNamed`; the existing `rowEvents` warning gains the device name.
- **Tests** (Step 3 of the task): the all-devices fixture written per the guide, the four-warning
  fixture, device numbering tests (NightSky banks: preset 200 → CC 0 = 1, PC 72; Proteus 300 → map
  entry), the guide consistency test, the simulator check of the fixture.
- **Hardware checklist** (Step 4): one list per device from the setup fields, plus the H4MIDI WC preset.

## 12. What could not be verified (collected)

Seashell: default channel, omni, firmware 2.0 numbering. FM-1 Skiff / Melodee: TRS jack type; Skiff
2.2 items untested on hardware by its author; Orange Cat: everything on hardware. M8: PC n = INST n,
bank select, a track CHAN "off", CCs on the track channel. Proteus: latency, XR names above 191.
Royalist: the CC table (editor only), channel range, 0/1-based display, latency, firmware. Brothers:
ring input electrical level, PC above 122, latency. NightSky: USB class compliance, Start/Stop, load
time, DIN-path channel latch, TRS output default. H90: default channel, wire 99/100, Start/Stop, the
CC-after-PC fix status in 1.12.5. Zoom: PC base, default channel, delay, hosting by the H4MIDI.
SMK-37: TRS type (secondary says A). The guide marks each of these next to the fact.

The MIDI authoring guide named in the task (`claude/Classic-Tabby-MIDI-Guide.md`) is not on this
machine (searched the Classic Tabby folders and the home directory); paste it and it becomes the
hand-written template's starting point at Step 2.
