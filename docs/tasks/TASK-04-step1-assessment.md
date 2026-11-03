# Task 04, Step 1 — read-only assessment: row events and the device library

Version: 0.1
Revision log:
- v0.1, 2026-11-02: first assessment against commit 5ca3095 (checkpoint (f) state plus the
  task document). No code changed. Figures from docs/FLASH-BUDGET.md section 9 and the
  (f) build; device research from manufacturer documents, with sources, in section 4.

Task text: docs/tasks/TASK-04-row-events-device-library.md. Everything below is a proposal
for approval; the fixed decisions of the task are taken as given and not reopened.

## 1. Song sector: free bytes and event capacity

The song record (section 9.5 of docs/tasks/TASK-03-step1-assessment.md, v0.5.1) uses bytes
0..2623 of its 4096-byte sector: a 64-byte header and 128 rows × 20 bytes. Bytes 2624..4095
are 0xFF today (1472 bytes). The staging transaction (9.6) programs the record image into
the staging sector and writes its commit word at **4092..4095**, so a record's CRC range can
never include those four bytes. Usable tail: **2624..4091 = 1468 bytes**.

### 1.1 Proposed layout (section 9.5, v0.6: "song record version 2")

Record header byte 20 (`version`) becomes **2** for a record that carries an event table;
**1 stays valid** and means "no events" (every song written so far). The CRC at offset 12
covers **20..2623 for version 1** (unchanged) and **20..4091 for version 2** (the whole body
including the event table and the 0xFF between the last event and 4091). Nothing else in
the header or the rows moves.

Event table (version 2 only), at offset 2624:

| Offset | Size | Field |
| ---: | ---: | --- |
| 2624 | 2 | event count N, 0..292 |
| 2626 | 1 | table version = 1 |
| 2627 | 1 | flags, reserved 0 |
| 2628 | 4 | reserved 0 |
| 2632 | 5 × N | events, in firing order (sorted by row, stream order inside a row) |
| 2632 + 5N .. 4091 | | 0xFF |

Event (5 bytes):

| Offset | Size | Field |
| ---: | ---: | --- |
| 0 | 1 | row index 0..127 (must be < the record's row count) |
| 1 | 1 | bits 0-3: MIDI channel 0..15 (channel 1..16); bits 4-7: type |
| 2 | 1 | d0 |
| 3 | 1 | d1 |
| 4 | 1 | d2 |

Types:

| Type | Name | d0 | d1 | d2 | Sent as |
| ---: | --- | --- | --- | --- | --- |
| 0 | program change | program 0..127 | 0 | 0 | Cn d0 |
| 1 | program change with bank select | bank MSB 0..127, or 0xFF = none | bank LSB 0..127, or 0xFF = none | program 0..127 | Bn 00 d0 (if MSB), Bn 20 d1 (if LSB), then Cn d2 |
| 2 | control change | controller 0..127 | value 0..127 | 0 | Bn d0 d1 |
| 3 | gap | milliseconds 1..255 | 0 | 0 | nothing; the next event waits d0 ms (rounded up to whole audio blocks of 2.9 ms); the channel bits are ignored |

Capacity: (4092 − 2632) / 5 = **292 events per song**, a bank+program counting as one.
Per row the device keeps at most **32 events** in RAM (1.2); the validator enforces both
limits, the sort order, the row index, the channel, the type and the data ranges, and the
version-2 CRC. A table that fails any check makes the record invalid (`SONG_INVALID`), the
same way a bad channel or step-length byte does; the song then shows as "NO SONG HERE" with
the error and is never played partially.

Gaps are how the per-device delay reaches the device: the workbench inserts a type-3 event
after a bank select (or after any event) for the channels whose device definition asks for
one, when it writes the song. Firmware stays device-agnostic (fixed decision).

Why 5 bytes and not 4: bank+program needs three data bytes to keep "CC 0 and/or CC 32" as one
event; a 4-byte layout would split it into three stream events, which the editor would have
to keep together. Why one table and not a per-row index: 128 rows × 2 bytes of index would
cost 256 of the 1468 bytes for no gain; the device sorts nothing, it reads the table once at
load and keeps per-row pointers in RAM.

RAM cost: the two row buffers each gain 32 × 4 bytes of decoded events (channel/type/d0/d1
packed as the message bytes plus a gap count) and a count, about 264 bytes; the loaded
record already holds the whole 2624-byte body and would hold 4092 instead (+1468 bytes).
Total about 1.7 KB of static SRAM from a heap of 223 KB. No flash region changes; no
existing project or song is affected (version-1 records are read exactly as today).

### 1.2 What the device validates and what the workbench validates

Device (`song_record_valid`): version 1 or 2; for 2: N ≤ 292, every event's row < rows,
type ≤ 3, channel bits any, data ranges per type, events sorted by row (non-decreasing),
at most 32 events per row, bytes after the last event 0xFF, CRC over 20..4091. Workbench
(`songRecordParse`) and importer (`decodeRecord`) apply the same rules so a bad file is
refused before an upload starts.

## 2. Where events fire and how they interleave with notes

### 2.1 The audio-thread sequencer today (app/song.c)

`song_tick` runs once per 128-frame block from the router's clock hook. When the step
phase crosses a step, `advance()` (song.c:114) does, in this order: release notes whose
length ended, count the step, detect bar and row end, **switch the row buffer** when a
queued jump lands (`jump_mode ? row_end : bar`) or the row's repeats are done
(`switch_row()`, song.c:101), then `play_step()` (song.c:75) starts the step's notes through
`groove_midi_song_note` → `enqueue(track & 1, SONG_OWNER + track, ports, …)` into router
lane 0 or 1 (app/midi_router.c:150). The control task decodes the next row one row ahead
(`decode_row`, song.c:175) into the buffer the audio thread is not reading.

### 2.2 Proposed firing

Events of a row belong to the row buffer: `decode_row` copies the row's events (from the
loaded record's table, via a per-row start index built at `song_load`) into the buffer,
already in message form (status | channel, d1, d2) plus the gap counts in blocks. Firing
point: in `advance()`, **after `switch_row()` and before `play_step()`**, the tick enqueues
the new row's events into **lane 0**. `groove_midi_poll` drains lane 0 completely before
lane 1, and lane 0's notes (even tracks) were enqueued after the events, so every event of
the row leaves every port before the row's first note, on all three ports. A queued jump
lands through the same `switch_row()` call, so the target row's events fire at the jump
with no extra code path. Events fire once when a row is entered (not again on its repeats);
re-entering a row through a loop or a jump fires them again.

Router entry: `groove_midi_song_event(channel, status, d1, d2)` enqueues under owner
`THRU_OWNER + channel` (24..39). Those owners already resolve their channel from the owner
number (`owner_channel`, midi_router.c:218), exactly what an event that targets a channel
and not a track needs, and `send_event` (midi_router.c:261) then sends it unchanged on every
port whose link is ready. Program change and controller messages do not touch the held-note
maps, so the thru owners' note state is not disturbed; the existing sustain tracking in
`send_event` (CC 64 / 121) applies to event CCs as it does to thru CCs, which is right. Ports:
all three (USB, DIN, BLE) regardless of any track's port setting, as the fixed decision says;
`enqueue` already accepts events for owners ≥ SONG_OWNER without ports, and the thru range
needs the same exception (one condition). No local-engine copy: events target external gear.

### 2.3 Per-device gaps without blocking the audio thread

The tick is the scheduler: a row's events are a stream with gap counts in blocks (2.9 ms
each); the tick sends the stream's leading events in one block and resumes after each gap
on a later block. Nothing waits; the audio thread spends a few microseconds per block.

The question is **when** to start the stream so that it still ends before the row's first
notes. Proposal: **pre-fire**. The next row is decoded a full row ahead, so its stream and
its total gap are known early. The tick starts the stream `total gap blocks` before the
boundary (for a stream without gaps that is the boundary tick itself, before `play_step`);
the last message therefore leaves in the boundary tick, before the notes. For a queued jump
the landing point (next bar or row end) is known from `pos` and the phase, so the same rule
applies once the target row is decoded. When the lead is not available (a jump queued with
less time to the bar than the stream's gaps, or SEND SETUP), the stream starts at once and
its tail lands after the boundary; the device counts these in a `late` status field shown
on the SONG page, so the checklist can see it. The cost of pre-firing is one more state in
the tick (stream position and countdown) and the arithmetic for "blocks to the boundary".

Without pre-firing (simpler, 200 bytes less): the stream starts in the boundary tick; a
device whose definition asks for a gap after bank select gets its program change after the
first notes by that gap. I propose pre-firing, since the H90 and the Zoom are exactly the
devices where a bank-select gap and a program load time matter at a bar line.

### 2.4 SEND SETUP

An ACTIONS entry "SEND SETUP" on the SONG page (and reachable while stopped only): the
control task decodes row 0 into the idle buffer and raises a request flag; the tick emits
row 0's stream (with its gaps) from the audio thread, through the same lane and owner path.
The audio thread is the only writer of the lanes, so the control task must not enqueue
directly; the request flag keeps that rule. While a song plays the action is refused with a
notice (the playing row's events are what the gear already has).

## 3. Flash cost

Baseline after checkpoint (f): app image 447588 bytes, margin **6333** (docs/FLASH-BUDGET.md
section 9). Estimate, by analogy with the (d)/(e) attribution (song_storage.c 5348 bytes for
records, batches, directory, compaction; song.c 1886 for the whole sequencer):

| Piece | Estimate (bytes) |
| --- | ---: |
| song_storage.c: version-2 validation (table walk, per-type ranges, sort, per-row cap), CRC range by version in write / read / recovery | 300 |
| song.c: per-row event index at load, decode of events into the row buffers, stream scheduler with gaps and pre-fire, SEND SETUP request, late counter, status | 600 |
| midi_router.c: `groove_midi_song_event`, the ports exception for thru owners, poll (no local copy) | 120 |
| screen.c: ACTIONS "SEND SETUP", SONG page line "EVENTS n / LATE n", refusal notices | 220 |
| transfer.c | 0 (the record stays 4096 bytes; kinds 5/6/7 unchanged) |
| **Total** | **≈ 1250 (range 1000..1500)** |

Expected margin after Task 04: **≈ 5100 bytes** (4800..5300), above the 2 KB floor by about
3 KB. No removal candidates are needed; the list in FLASH-BUDGET.md 8.1 (NAME page 326,
EFFECTS page 680, BLE page 1770, step editor pages 3620, factory DX7 bank 10239) still
applies if a later task needs it.

## 4. The rig: MIDI implementation per device

Sources are the manufacturer's documents unless marked *secondary*. Fields marked
**unverified** could not be confirmed in a manufacturer document and will be marked as such
in the JSON definitions; nothing is guessed. Summary table first, then one subsection per
device with the sources.

| Device | PC | Numbering as displayed | Bank select | Programs | Names published | Gap need | Odd |
| --- | --- | --- | --- | ---: | --- | --- | --- |
| Instruo Seashell | not in fw 1.0.x; fw 2.0 announced with 120 slots (secondary) | unverified | none documented | unverified | no | none documented | MIDI Learn only, no fixed CC map |
| Korg volca fm2 | **no** (chart: X) | n/a | none | 64 (SysEx only) | no | n/a | sound change only via SysEx or panel |
| E-MU Proteus/2 XR | yes | **0-based** 000..383 | **none**; program map 0..127 → any preset | 384 (256 RAM + 128 ROM) | yes, manual pp. 92–93 | "send setup before the song" | per-channel Preset Change enable; Multi mode |
| Eventide H90 | yes | 1-based P1..P99 (PC Offset setting) | none; Bank Up/Down via CC | 99 per list, lists are user-arranged | no (user playlist) | CC with PC ignored on fw ≤ 1.9.x | no default CC map; Omni option |
| Zoom MS-70CDR+ | yes, **USB MIDI only** (needs a USB host) | patches 001..100; chart says PC 0..100, 0/1-base **unverified** | none (CC not recognised) | 100 (80 factory) | yes, Zoom patch list (80) | none documented | "USB MIDI CH" 1..16 or OMNI, default unverified; no CC, no SysEx |
| Dirtywave M8 Model:02 | yes: selects the track's **instrument** | hex INST 00..7F; 0-based **unverified** | not documented on receive | 128 per song (user) | n/a (user names) | none documented | "PG CHANGE" setting must be on; per-track channel |
| Waldorf Pulse 2 | yes | 1-based 001..500 (PC 0 = 001, secondary) | **CC 32 only** = bank 0..4 (×100), CC 0 ignored; PC clamped 0..99 | 500 | yes, Waldorf PDF (410 named) | none documented; bank LSB latches | program 500 = random; no PC enable switch |
| Waldorf Blofeld | yes | A001..H128 (PC 0 = 001) | **CC 32** = 0..7 → A..H (CC 0 "not used"; interchangeable per 1.15 notes, secondary) | 1024 + 128 Multis | yes, Waldorf factory 2012 text (1024) | secondary: slow down PCs; ~800 ms after a Multi change | Ctrl Receive must be on for CCs; per-part PC filter in Multi |
| "M-VAVE FM-1" = Orange Cat FM-1 | **no** (not handled in the source) | n/a | none | n/a | n/a | none | this is your own groovebox firmware, not an M-VAVE product |

### 4.1 Instruo Seashell

Sources: user manual, 10 Jun 2025, firmware / controller 1.0.0, 55 pages
(https://instruomodular.com/wp-content/uploads/manuals/Seashell%20Manual.pdf); product page
(https://www.instruomodular.com/product/seashell/); firmware page, latest 1.0.3
(https://www.instruomodular.com/firmware/). No MIDI implementation chart exists. Secondary:
SonicState and Matrixsynth reports of a firmware 2.0 demo (Oct 2026), an Electra One user
preset (github.com/kiwigrass-byte/Instruo-Seashell).

- Receive: 3.5 mm TRS MIDI in (type A) and class-compliant USB-C audio + MIDI (manual
  p. 11). The receive channel is set in the Seashell Controller software (Settings, "MIDI
  Channel Menu", p. 50); default and Omni: **unverified**.
- Program change: **not supported in the published firmware** (1.0.x): presets are files
  of the Controller software (p. 49). Firmware 2.0 (secondary, not on Instruo's site on
  2026-11-02) is said to add 120 hardware preset slots selected by program change;
  numbering, bank scheme, enable setting: **unverified**.
- Names: none published.
- CCs: no fixed map; every parameter is assigned by MIDI Learn (p. 49); any CC 0..127 can
  be a modulation-matrix source (p. 45). A user-made default map exists (secondary, 94
  parameters, the author's own numbering); it is not a factory assignment and will not be
  put in the definition as verified.
- Timing: nothing documented.
- Odd (secondary): with fw 2.0 the USB port takes 14-bit CC pairs on channels 14/15.
- Definition consequence: a "raw" device (channel, PC pass-through flagged unverified, no
  named presets, no named CCs) until Instruo publishes the 2.0 manual.

### 4.2 Korg volca fm2

Sources: MIDI Implementation Chart, 27 Oct 2021, v1.0
(https://cdn.korg.com/us/support/download/files/38bf877e063858210403554ec502efac.pdf);
MIDI Implementation text, rev 1.00, 17 Nov 2022
(https://cdn.korg.com/us/support/download/files/b0ec4b721695a217d1ecaa248a93ab78.txt);
owner's manual 2024-11-07 (https://cdn.korg.com/us/support/download/files/fd37180c39c87b20df510643347ee119.pdf);
system updater 1.12 notes (https://www.korg.com/us/support/download/software/0/892/4964/).

- Receive: basic channel 1..16, memorised, set by holding MEMORY at power-on and pressing
  key 1..16 (manual p. 3); mode 3 (Omni off, Poly). Ports: TRS type A MIDI in/out, **no USB**.
  Factory default channel: **unverified** (the manual only says how to set it).
- Program change: **not recognised and not transmitted** (chart). 64 programs, reachable
  only from the panel or by SysEx dump (addresses 0..63). Panel numbering 0..63 or 1..64:
  **unverified**.
- Names: not published by Korg; the 10-character voice names live in the SysEx dump only.
- CCs (received, require global parameter 7 "MIDI ShortMessage" on, the factory default):
  40 octave/transpose, 41 velocity, 42 modulator attack, 43 modulator decay, 44 carrier
  attack, 45 carrier decay, 46 LFO rate, 47 LFO pitch depth, 48 algorithm (0..127 → 0..32),
  49 arp type, 50 arp division, 91 reverb depth, 93 chorus depth; 64 sustain since firmware
  1.10 (release note only, semantics unverified); 123..127 all notes off; pitch bend;
  clock / start / stop / song position. Value tables are in the TXT footnotes and go into
  the definition verbatim.
- Timing: nothing documented.
- Odd: receives Yamaha DX7 voice SysEx; firmware updates arrive as audio.
- Definition consequence: CC-only device; a PC event targeted at it does nothing (the editor
  will say so).

### 4.3 E-MU Proteus/2 XR

Source: E-mu "Proteus operation manual" (family manual for /1, /2, /3 and XR, 132 pages,
with the 3 Mar 1992 MIDI addendum; E-mu re-typeset 2000),
https://archive.org/download/synthmanual-e-mu-proteus-owners-manual/e-muproteusownersmanual.pdf
(also manualslib.com/manual/895817). Page references are printed pages (PDF page = printed
+ 2). Secondary: synthmania.com/proteus-2.htm (text preset list 000..190).

- Receive: MIDI modes Omni / Poly / Multi / Mono (p. 18). Multi mode with per-channel "MIDI
  ENABLE" gives 16 parts, each with its own preset, volume and pan (pp. 15, 19). Basic
  channel on the main screen (p. 14).
- Program change: **0-based display**, presets 000..191 on a /2 and **000..383 on the XR**
  (p. 14). XR: 0..255 RAM, 256..383 ROM; ROM 256..319 are duplicated in RAM 0..63 (p. 92).
  **No CC 0 / CC 32 bank select**: MIDI selects presets 0..127 directly; the Master menu
  "MIDI PROG>PRESET" map sends any incoming program 0..127 to any preset 0..383 (pp. 19,
  21, 118). The map defaults to identity ("normally correspond"); there is no off switch.
  Per-channel "PRESET CHANGE On/Off" enables program changes (p. 19); program changes are
  ignored while the Edit menu is open (p. 41).
- Names: the factory list is in the manual, **pp. 92–93 (PDF 94–95)**, 192 entries for the
  /2 (XR ROM 256..383 = the same 128 ROM presets); synthmania has a text version of
  000..190. More than 64, so it is transcribed into the JSON at Step 2 from the manual's
  text layer, with the source noted.
- CCs (p. 118, p. 20): 7 volume, 10 pan; CC 0..31 are the four realtime controllers A..D
  routed by "MIDI CONTROLLER ASSIGN", defaults **A = 1, B = 2, C = 3, D = 4**; CC 64..79 as
  footswitches 1..3, defaults **64, 65, 66** (value ≥ 64 = on; sustain is footswitch 1 only
  if the preset routes it); 121 reset all controllers; 123 all notes off; 124..127 mode
  messages when "MIDI MODE CHANGE" is enabled.
- Timing: "send setup information before the song starts … do not send setup information
  just before the first beat or MIDI timing errors could result" (p. 69). No figure. That
  is the case for SEND SETUP and for the pre-firing in 2.3.
- Odd: presets above 127 need the map (the XR's extra banks are not reachable by bank
  select); 32 voices with "MIDI OVERFLOW" to the MIDI out.
- Not verified: an XR-specific manual edition; the factory state of the map on a reset unit.
- Definition consequence: numbering 0-based, programs 0..127 direct, 128..383 only through
  the device's own map (the editor shows the preset names for 0..127 and lets the user
  enter a raw number with a note about the map).

### 4.4 Eventide H90

Sources: H90 user manual v1.9.7, section 7.4 MIDI
(https://cdn.eventideaudio.com/manuals/h90/1.9.7/content/system-menu/midi.html), appendix C
global mapping chart (…/content/appendix/global.html), section 5.1 select mode, PDF
https://cdn.eventideaudio.com/manuals/h90/1.9.7/_static/141385_EventideH90Manual_v1.9.7.pdf
(MIDI pp. 94–96, appendix C pp. 253–256, bank select p. 40). No MIDI implementation chart in
the manual. Eventide staff forum answers (manufacturer, informal): eventideaudio.com/?p=189216,
?p=187986, ?p=194425, ?p=193014.

- Receive: one channel 1..16 for receive and transmit; "Receive Omni" option; DIN in and
  USB-C both carry MIDI (p. 19, p. 94). Default channel value: **unverified** (you say 15).
- Program change: selects a Program in the current **Playlist** (a User List of up to 99
  Programs, p. 35). "PC Offset" (p. 95): by default PC numbers 1..100 map to Programs as
  displayed (**1-based**: PC n → Program n); with PC Offset = 1, PC 0 → Program 1. **No bank
  select**, no program map: order the Playlist instead (staff). Banks of three (33 banks) are
  only reachable through the Bank Up / Down CC functions. Presets A/B inside a Program are
  not selectable by MIDI. Factory Programs: "hundreds", in Factory Lists that cannot be the
  Playlist.
- Names: none published; the Playlist is user-arranged, so names are per user. The rig
  setup will let you name the 99 slots yourself (stored in the rig profile).
- CCs: "no default MIDI CC mappings"; every function is assigned a CC number in System >
  MIDI > Global Control (p. 96, appendix C): program Load / Increment / Decrement, Bank
  Up / Down, Bank / Select / Perform mode, Tuner, Tap Tempo, P / A / B active-bypass
  (toggle at ≥ 64, or momentary < 64 bypass, ≥ 64 active), Insert 1 / 2, HotSwitch 1..3,
  Perform 1..6, Quick Knobs 1..6, HotKnob, In / Out gain, Mix. The definition lists the
  functions; the CC numbers are yours to enter in the rig setup (per device "user CC map").
- Timing: manual says nothing. Staff: on firmware 1.8.6 up to 1.9.x a CC sent together
  with a PC is ignored; fixed in beta 1.13.2 ("PC first, then CC, no delay"). A user reports
  needing about 300 ms after a PC before a CC on older firmware (secondary). So: a gap
  **after the PC** (not after bank select) is what the H90 needs on old firmware; the gap
  setting is per device and the editor can place it after the PC.
- Odd: Output Mode Off / Transmit / Thru (DIN only, p. 94); the manual's "1-100" against
  99-Program lists; a PC loads the whole Program (A and B).
- Not verified: default channel; whether USB carries PC/CC (manual: "receive MIDI over
  USB"); official 1.13.2 release notes; load time.

### 4.5 Zoom MS-70CDR+

Sources: operation manual (HTML https://zoomcorp.com/manuals/ms-70cdrplus-en/; PDF
https://zoomcorp.com/media/documents/E_MS-70CDRplus.pdf, 70 pages: USB MIDI channel p. 59,
MIDI implementation chart p. 69, "Model: MS-70CDR+, Date: Mar. 1, 2024, Version: 1.00");
patch memory list, preset version 1.00
(https://zoomcorp.com/media/documents/E_MS-70CDRplus_Patchlist.pdf); product page
(https://zoomcorp.com/ms70cdr+); support page with firmware 1.20. No separate MIDI document
exists; the chart is the whole implementation. Secondary: Morningstar help page, TalkBass
threads on the MS-60B+ (same family), the unofficial original-MS-series protocol document
(does not cover the + models).

- Receive: **USB only**, no DIN (pp. 9, 67–68); the pedal is a USB MIDI *device*, so it needs
  a USB host (your CME H4MIDI WC). Channel: MENU > "USB MIDI CH" 1..16 or OMNI, memorised
  (pp. 59, 69). Factory default channel: **unverified**. Zoom does not say "class
  compliant"; users report generic USB hosts work (secondary).
- Program change: recognised, chart says "0–100, true number 0–100" for **100 patches
  displayed 001..100** (p. 7). Zoom states no PC → patch mapping, so 0-based or 1-based is
  **unverified** (the chart's 101 values for 100 patches is the oddity; the original MS
  series was 0-based, which must not be assumed). No bank select: control change is not
  recognised at all.
- Names: **yes**, 80 factory patches 001..080 in the patch list (081..100 are empty user
  slots); transcribed into the JSON at Step 2 with the source noted.
- CCs: **none** (chart: CC "x", SysEx "x"). No bypass, tuner, tap or parameter control by
  MIDI on this model per Zoom; the CC 74 tuner of the original series is unconfirmed for
  the +.
- Timing: nothing documented. Secondary: an MS-60B+ user saw repeated program changes
  from one press through a USB host; unresolved.
- Odd: on batteries a "USB CONNECT" prompt appears when USB is plugged (p. 55); with the
  adapter a USB connection powers the unit on (p. 54). The channel-16 setup behind the
  H4MIDI filter is consistent with the manual (any channel 1..16) but no source covers
  that combination.
- Not verified: default channel, PC base, class compliance and bus power behind a host,
  firmware 1.10 / 1.20 changes (no version history published).
- Definition consequence: PC-only device, "pcBase" flagged unverified with both readings
  offered in the editor until your hardware check settles it (checklist item: send PC 0
  and PC 1, read the patch number the pedal shows).

### 4.6 Dirtywave M8 Tracker Model:02

Sources: M8 operation manual v6.5.2, 21 Apr 2026
(https://cdn.shopify.com/s/files/1/0455/0485/6229/files/m8_operation_manual_v20260421.pdf?v=1776791699,
linked from https://dirtywave.com/pages/resources-downloads, which lists firmware 6.6.3C);
firmware changelog (https://raw.githubusercontent.com/Dirtywave/M8Firmware/main/changelog.txt);
product page (https://dirtywave.com/products/m8-tracker-model-02). Secondary: Sound On Sound
review (Sep 2024).

- Receive: TRS type A MIDI in and out, USB-C class-compliant audio + MIDI, "USB MIDI behaves
  the same way as the physical TRS" (manual pp. 2, 65, 91). MIDI Settings view (pp. 44–45):
  per track 1..8 a channel and an instrument number, a global **PG CHANGE on/off**, a mode
  MONO / LEGATO / POLY; separate RECORD NOTE, CONTROL MAP (default 10) and SONG ROW CUE
  (default 11) channels. Defaults track n → channel n (screenshot). All of it is stored in
  the song. No omni.
- Program change: with PG CHANGE on, a PC on a track's channel **selects that track's
  instrument** (p. 45; changelog 2.7.3 and 6.5.2). Instruments are numbered **in hex**
  00..7F, up to 128 per song (pp. 5, 8). PC 0 → INST 00 is the natural reading but
  **unverified**. Bank select on receive: not documented (on send, CC 0 precedes the PC,
  changelog 2.7.0).
- Names: user content (instrument names in the song); the definition offers "INST 00..7F"
  and lets the rig profile rename them.
- CCs: no fixed list; up to 128 per-song MIDI mappings on the control-map channel (any CC
  to instrument / mixer / effect / tempo / transpose parameters, p. 43); CC 64 sustain on
  track input (changelog 2.5.0); pitch bend. Mute / solo by notes on the control channel
  (changelog 2.7.0). No CC transport.
- Timing: nothing documented.
- Odd: hex display; internal MIDI loopback port; the manual lags the firmware by a minor
  version.
- Not verified: 0/1-base of PC against INST#, bank select on receive, omni.

### 4.7 Waldorf Pulse 2

Sources: user manual revision 1.0, September 2013, 73 pages
(https://downloads.waldorfmusic.com/cloud/index.php/s/kfHqRdr7Jd4FQoj, from the FAQ page
https://waldorfmusic.com/faq-pulse-2-en/); factory preset list PDF, 26 Jul 2016
(https://downloads.waldorfmusic.com/cloud/index.php/s/egSEKaiSn4jk8Lq); firmware bundle
with the cumulative readme up to 1.21 (https://downloads.waldorfmusic.com/cloud/index.php/s/n6mxaCwWFZ2yeB2).
Secondary: KVR changelog reposts, Elektronauts and Audiofanzine user tests.

- Receive: global MIDI Channel omni / 1..16 (manual pp. 40–41; omni receives all, sends on
  1); DIN in/out and USB (MIDI only, p. 13); MIDI Thru switch.
- Program change: display **001..500**, one flat range (p. 14); program 500 generates a
  random patch on every selection. The manual says only "programs 1 through 128 can be
  changed via program change" (p. 67) and has no bank select. The scheme is in the official
  firmware readme (v1.14 entry): **only bank LSB (CC 32) is interpreted**, banks 0..4
  (= 001..100, 101..200, …, 401..500), **CC 0 ignored**, the program number is clamped to
  0..99 inside the bank, the bank is latched until Reset All Controllers. 0/1-base: not
  stated by Waldorf; user tests (secondary) give PC 0 = 001 and CC 32 = 1 + PC 1 = 102. No
  PC enable switch exists.
- Names: **yes**, the Waldorf preset list (500 entries: 001..410 named with categories,
  411..499 INIT, 500 RANDOM); too long for this file, transcribed into the JSON at Step 2
  with the source noted.
- CCs (manual pp. 61–63, full table, ranges 0..127): 1 mod wheel, 5 glide rate, 10 VCA pan,
  14–17 filter envelope ADSR, 18–21 amp envelope ADSR, 24/25 LFO 1 speed / shape, 26/27
  LFO 2 speed / delay, 29/31 envelope triggers, 35–48 oscillator 1–3 and noise parameters,
  49–53 and 56 filter type / cutoff / keytrack / env amount / velocity / resonance, 57/58 VCA
  volume / velocity, 62 glide mode, 64 sustain, 70–77 oscillator 1 and 3 extras, drive, 79–88
  arpeggiator, 90–101 and 108–119 modulation slots 1–8, 102–106 unison / fade / bend ranges,
  120 / 121 / 123. Plus CC 2 breath as a mod source and the global "Control X" assignment.
  A secondary changelog says CC 59 = preset panning, against the manual's CC 10: left
  unresolved and marked.
- Timing: none documented ("the output is not interrupted when you change programs",
  p. 58); the latched bank LSB means CC 32 need not immediately precede the PC.
- Odd: "P1 Legacy" global switches to the original Pulse CC map; TX Parameter filters what
  the panel sends; the manual's "CCs 32–43 reserved" (p. 43) contradicts its own table.
- Not verified: the 0/1-base and the exact CC 0 handling on 1.21 (readme only), SysEx
  layout, any manual update for 1.21.

### 4.8 Waldorf Blofeld

Sources: Blofeld user's manual revision 1.1, January 2009, 128 pages, Desktop and Keyboard
(https://downloads.waldorfmusic.com/cloud/index.php/s/32zdTsdYcRSX9eE, from the FAQ page
https://waldorfmusic.com/?p=28069); SysEx specification for release 1.04
(https://downloads.waldorfmusic.com/cloud/index.php/s/ybExJgT4TzqT8ir); factory sound sets
2012 and 2008 with name lists (https://downloads.waldorfmusic.com/cloud/index.php/s/fi4DWR7G2aXnWQ3,
https://downloads.waldorfmusic.com/cloud/index.php/s/rSmWXA3nEMMLqFL); firmware 1.25 zip
(no changelog inside). Secondary: Waldorf's OS 1.15 notes as re-posted on Elektronauts and
in the Edisyn editor source; KVR thread on Multi selection.

- Receive: global MIDI Channel omni / 1..16 (p. 82). **Multi mode, 16 parts** (pp. 24–28),
  each with its own channel (global / omni / 1..16) and receive filters for MIDI, USB, local,
  bend, wheel, pressure, sustain, edits and **program change**. Desktop: MIDI in + USB only
  (no MIDI out); Keyboard adds MIDI out (pp. 8, 10).
- Program change: display **bank letter A..H plus 001..128** (p. 18); 1024 sounds; PC
  0..127 → 001..128 in the current bank (glossary p. 122). Bank select per the controller
  table (pp. 113–114): **CC 0 "not used", CC 32 = 0..7 → bank A..H**. Waldorf's 1.15 notes
  (secondary) say CC 0 and CC 32 are "currently interchangeable". 128 **Multi** programs:
  not in the manual; secondary (1.15 notes, user tests) select them with CC 0 = 127 then PC
  on the global channel, only when already in Multi mode, and an extra CC 32 can break it.
  No global PC enable; per-part "Prg Change receive / ignore" in Multi.
- Names: **yes**, "Blo Factory 2012.txt" in the 2012 set, 1024 entries A001..H128; also a
  2008 set. Transcribed into the JSON at Step 2 with the source noted.
- CCs (manual pp. 113–117, full table): 1 mod wheel, 2 breath, 4 foot, 5 glide rate, 7
  volume, 10 pan, 12–14 arpeggiator range / length / active, 15–26 LFO 1–3 shape / speed /
  sync / delay, 27–31 and 33–48 oscillators 1–3 (octave, semitone, detune, FM, shape, PW,
  PWM), 49 sync, 50 pitch mod, 51 glide mode, 52–62 mixer levels and balances, noise colour,
  64 sustain, 65 glide active, 66 sostenuto, 67 routing, 68–78 filter 1 (type, cutoff,
  resonance, drive, keytrack, env amount, env velocity, cutoff mod, FM, pan, pan mod), 79–89
  filter 2 likewise, 90–92 amp volume / velocity / mod, 93/94 FX 1/2 mix, 95–118 the four
  envelopes (attack, decay, sustain, decay 2, sustain 2, release each), 120–123 channel
  mode, 122 local control. Value meanings (shape names, octave steps, signed ranges) are in
  the table and go into the JSON.
- Timing: nothing in the manual. Secondary (1.15 notes): "some controllers send program
  changes faster than the Blofeld can fetch them"; after switching a Multi, wait before
  selecting the parts' programs; the Edisyn editor pauses 800 ms after a patch change.
  The definition will carry a suggested gap after the PC, marked secondary.
- Odd: **Ctrl Receive** (global, p. 84) must be on for CCs to change parameters; Control
  W..Z assignments disable the same CC's parameter; channel 10 in Multi mode "can cause
  crashes" (Waldorf FAQ).
- Not verified: OS 1.25 release notes, CC 0 acceptance on 1.25, Multi selection, any
  manufacturer timing figure, Keyboard-version differences in CC handling.

### 4.9 "M-VAVE FM-1"

There is no M-VAVE product called FM-1 in any manufacturer material, and this repository's
"FM1" is only the SDK/engine name (sdk/include/fm1.h; docs/SPEC.md:37 names "Orange Cat
(FM-1 groovebox)" as a separate project). The device that enumerates as "Orange Cat FM-1"
(USB 1209:0001, docs/BUILD.md:441–446) is your own groovebox firmware (checkout ~/oc-ui,
version 0.16.0 on 2026-11-02; read-only here). From its source, not from a published
chart, so **unverified on hardware**:

- Program change: **not handled** (firmware/src/midi_control.c dispatches note, CC, bend
  and channel pressure; no 0xC0 branch). Bank select: no.
- CCs per track (midi_control.c:255–262): 5 glide, 7 level, 10 pan, 72 release, 73 attack,
  75 decay, 74 / 71 engine macros (cutoff / resonance, timbre / morph by engine), 12..18 DUB
  TAPE feedback / send / tone / space / throw / cut / kick, 91 reverb, 93 chorus, 94 delay,
  104 distortion; per channel (:299–345): 1 wheel, 64 sustain, 120 all sound off, 121 reset,
  123 all notes off, RPN 0 bend range.
- If you meant the SMK-37 Pro itself as a MIDI receiver (looped back from the MIDI out): its
  input handles no program change per the help texts (sdk/I18n.js:268–276: 0-based program
  numbers cycle 16 FM voices, 303 / PSG waves; bank select ignored) and CCs 7, 10, 11, 91, 64,
  and engine-specific 5 / 71 / 74 / 75 / 72, 120 / 121 / 123.
- Definition consequence: tell me which one you meant; both would be CC-only definitions.

## 5. Importer rule: what counts as "at or near a row start"

Events in a `.mid` are placed on the 16th grid like notes (`step = tick × 4 / division`,
nearest step, ties earlier). A program change, bank select or control change becomes a row
event of row R when its position lies in the window **[start(R) − pre-roll, start(R) + ½
step)**, i.e. it snaps to the row's first step or sits in the pre-roll before it. Default
pre-roll: **one beat (4 steps)**, because sequencers and DAWs commonly send a program change
a beat before the bar it is meant for; selectable 0 / 1 beat / 1 bar in the import options.
Bank-select CC 0 / CC 32 on a channel immediately followed by a program change on the same
channel inside the same window merge into one bank+program event. Everything else (CC
automation inside a row, program changes mid-row, bank select without a program change)
is listed under "Dropped or changed" with kind, channel and position, exactly like today's
`programChanges` list. Channel 10 is treated like any other channel. The row-1 window also
covers events at tick 0 (the usual "setup" block at the start of an export).

## 6. Proposed workbench UI

### 6.1 Rig setup (Library tab, new group "Rig" next to "Song mode")

A 16-row table, one per MIDI channel: channel, **device** (select from the library, plus
"none" and "custom"), name shown, **gap** in ms (prefilled from the definition's delay
needs, editable), program numbering as the device displays it (read-only note from the
definition, e.g. "1..128" or "A1..H128"). The table is the **global rig profile**, saved in
the browser automatically (localStorage) with "Export rig (.json)" / "Import rig" buttons
so it survives a browser reset and can move between computers. A song may carry an
**override**: a checkbox in the song editor "this song uses its own rig" copies the table
into the song's sidecar (6.3) and the row event editor then uses that copy. Definitions
come from `web/devices/*.json`, inlined into the workbench by build-web.py like the
importer scripts (the single-file workbench cannot fetch at run time from `file://`).

### 6.2 Row event editor (song editor, Library tab)

The row table gains an **Events** column showing a count per row (and "SETUP" on row 1).
Selecting a row opens its event list under the table:

```
Row 3 events  (sent at the row start, before its notes; row 1 = SEND SETUP)
 #  Channel / device          Event                         Value
 1  5  Proteus/2 XR           Program + bank                Bank 1 (CC 32 = 1) · 17 "Arco Strings"   [▲][▼][✕]
 2  15 H90                    Program                       12 (as displayed: P12)                   [▲][▼][✕]
    gap 20 ms (H90 after bank select — from the rig)
 3  16 MS-70CDR+              Program                       7 (patch 8)                               [▲][▼][✕]
 4  1  Blofeld                CC 74 "Filter 1 Cutoff"       96                                        [▲][▼][✕]
 [+ add event]   channel ▾  type ▾ (Program / Program + bank / CC)
```

Adding an event: pick the channel (shown with the rig's device name), the type, then the
value with the device's vocabulary: a searchable preset list (name and number as the device
displays it, with the MIDI number next to it), a bank list from the definition's scheme, a
CC list of named controllers with the value's meaning when the definition has one. Raw
number fields stay visible for every choice, so any device, defined or not, can be driven.
Gaps are generated from the rig when the song is written and shown as grey rows, not edited
per event; an explicit "gap" type is available for the odd case. Validation inline: more
than 32 events in a row, more than 292 in the song, a channel without a device (raw mode).
Export/import: the `.tabby` record carries the events (version 2); the sidecar carries the
rig override (6.3). Old `.tabby` files (version 1) import unchanged.

### 6.3 Sidecar for workbench-only data

The device knows channels and numbers only. The rig override (and nothing else so far) is
workbench data; proposal: an optional trailer in the `.tabby` file after the block records,
introduced by a 0xFF byte (the file reader already stops at 0xFF, 9.9) followed by `TRIG`,
a length and JSON. The upload path never sends it. Alternative: a separate `.rig.json`
next to the `.tabby`; the trailer keeps one file per song, which the importer and the editor
already exchange.

### 6.4 Device side

SONG page: one more line, `EVENTS 12  LATE 0` (events in the loaded song, late sends since
play). ACTIONS: "SEND SETUP" (refused while playing: "STOP THE SONG FIRST"; without a loaded
song: "NO SONG LOADED"). No other device UI; events are edited in the workbench only.

## 7. Open points for the approval

1. Events fire once per row entry, not on each repeat of the row (2.2). Say if you want
   them on every repeat.
2. Pre-firing (2.3) against the simpler boundary-tick start: I propose pre-firing.
3. Record version 2 with the CRC over 20..4091 (1.1): version-1 songs stay valid; the
   staging recovery reads the version to pick the CRC range. This is the "change to app/
   data layouts" the rules ask me to stop for: no existing song changes, new songs get
   version 2 only when they carry events (the workbench writes version 1 for a song without
   events, so an old firmware still reads them).
4. The `.tabby` trailer for the rig override (6.3), or a separate file.
5. Importer pre-roll default of one beat (5).
