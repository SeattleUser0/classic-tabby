# MC-707 parity matrix for Classic Tabby

Version 0.1, 2026-11-07 (Task 10, Step 1). Companion to docs/tasks/TASK-10-step1-assessment.md.

Revision log
- v0.1 2026-11-07: first matrix, written against head 11bb153 and Roland's MC-707 Reference
  Manual eng02 (RM) and Update manual eng08 (UM). Page numbers are the printed ones. The MC-101
  Reference Manual eng01 (MC-101 RM) is cited where its 16-pad layout is the closer example.

How to read it. "Status" is one of: **implemented** (works on the device today), **partial**
(part of it exists, the rest is listed), **missing** (nothing yet), **n/a** (not applicable to a
MIDI orchestrator), **excluded** (decided out by the task). "Today" names what Classic Tabby does
now, with the files involved. Roland's limits are conventions; the "Tabby target" column says
where this plan exceeds them. Nothing here is a commitment; the roadmap is in the assessment,
section K.

## 1. Excluded once

Sound engines (ZEN-Core tones, drum kits, the tone/drum parameter lists RM pp. 61–121), the
looper track, sampling, audio import, scatter, the multi-effects and total effects, the audio
mixer (except track level), the SD card, Roland Cloud content. The task excludes them: Classic
Tabby is an external-MIDI orchestrator with FM6 and the 808 for previews. Chorus is excluded by
decision (task fact 7).

## 2. Structure

| Feature | MC-707 | Today | Status | Tabby target |
| --- | --- | --- | --- | --- |
| 8 tracks | 8 tracks play at once (RM p. 9) | 8 song tracks, each a MIDI channel (app/song.c, app/midi_router.c) | implemented | same |
| Clips per track | up to 16, switchable while playing (RM p. 9) | a track's "patterns" are its blocks in the song's rows: as many as there are rows (app/song.c, Task 06) | partial: no clip identity apart from the row | 16 per bank on the pads, up to 64 stored (assessment C.1) |
| Clip = phrase + settings + sound | RM p. 10 | a block = 64 steps of up to 4 timed notes; no settings of its own (app/song_storage.h, app/timed_note.h) | partial | clip v3: header with length, scale, direction, shuffle, transpose, chain, PC/bank, then an event list (C.3) |
| Project = one song | RM pp. 10, 17 | 16 song records in flash, each tied to a project slot (app/song_storage.c, app/project.c) | implemented | same (a song record is the project of the MC-707) |
| Clip line (same slot across tracks) | RM p. 14, UM p. 18 | a song row (one block per track) | implemented | row = scene (section 4) |
| Project settings: level, master tune, first scene, key/scale | RM p. 18, UM p. 3 | none of these; tempo override per song | partial (tempo only) | first scene; key/scale not planned |
| Save / load / reload / delete clip | RM pp. 14–16 | blocks are written by the workbench; no clip operations on the device | missing | copy, clear, delete on the device (phase 4) |

## 3. Clip settings

| Feature | MC-707 | Today | Status | Tabby target |
| --- | --- | --- | --- | --- |
| STEP LEN 1–128 | RM p. 50 | 16, 32, 48 or 64 steps per row (app/song_storage.h `steps`) | partial | 1–128 per clip |
| SCALE 1/8 … 1/16T | RM p. 50 | 16ths only; swing per block | missing | 1/8, 1/16, 1/32 and triplets per clip (units stay 480 per 16th) |
| Direction FWD / REV / FWD+REV / INV / RND | RM p. 50 | forward only | missing | FWD, REV, RND (phase 4); INV and FWD+REV later |
| Shuffle −50…+50 per clip | RM p. 50 | swing per block (v2 flag) and per project (app/song.c `warp`) | partial | per clip in the header |
| Transpose ±12 per clip | RM p. 50 | none | missing | per clip header |
| First / last step | RM p. 31 | row step length only | partial | last step = clip length; first step not planned |
| Triplet cap 96 steps | UM p. 20 | n/a | n/a | not needed (units are exact) |
| Temporary reverse / random / step loop while held | UM p. 20 | none | missing | later, if cheap |

## 4. Master clock, launching, scenes

| Feature | MC-707 | Today | Status | Tabby target |
| --- | --- | --- | --- | --- |
| Launch / stop at the master clock ("12 o'clock") | RM pp. 14, 22, 52 | per-track launch, stop and "back to song" land on the next bar of the master clock (app/song.c queues, Task 06) | implemented for "next bar" | master cycle 2–128 steps as a setting; "end of clip" as a second option (D.2) |
| Master clock SCALE and STEP LEN 2–128 | RM p. 52 | fixed 16 steps (one bar) | partial | setting in the song record |
| Reservation shown on screen | RM p. 14 | "Q n" column and a blinking pad (TRACK LAUNCH page) | implemented | keep, add a master-clock phase arc |
| Pad MUTE mode: pads 1–8 play/stop, 9–16 mute | RM p. 22 | pads launch patterns of one track; no mute pads | partial | SHIFT view: pads 1–8 select/launch track, 9–16 mute (G) |
| Pad CLIP mode (2 lines × 8 tracks; SINGLE 16 clips) | RM p. 22, UM p. 13; MC-101 RM p. 17 | TRACK LAUNCH page: 16 pads = patterns of the selected track | implemented (SINGLE form) | same, plus clip banks |
| Scenes: store (long press), recall at the master clock | RM p. 36 | a row is a scene; row jumps land at the next bar or row end; no "store current combination" | partial | long press stores the playing combination into a row (phase 6) |
| 128 scenes, 16×8 or 8×16 | UM pp. 10–11 | 128 rows per song | implemented in storage | 8 banks × 16 pads |
| Scene chain with LENGTH in master clocks | UM p. 5 | row order, repeat 1–64, loop-here, song end (app/song.c) | implemented (richer: repeat count) | keep; LENGTH = repeat × row length |
| First scene on load; [FUNC]+START recalls it | RM p. 18, UM p. 6 | song starts at row 0 | partial | same |
| Scene stores mutes/levels | not documented | n/a | n/a | not planned |

## 5. Clip chains

| Feature | MC-707 | Today | Status | Tabby target |
| --- | --- | --- | --- | --- |
| NEXT CLIP: STAY / STOP / 1–16 | UM p. 12 | a launched pattern loops forever; the song playhead advances rows | missing for launched tracks | per clip: next = stay, stop, clip n, back to song (D.3) |
| LENGTH OFF / 1–512 steps | UM p. 12 | row repeat 1–64 (song playhead only) | partial | clip header: length in steps, plus a repeat count (allowed improvement) |

## 6. Recording and editing

| Feature | MC-707 | Today | Status | Tabby target |
| --- | --- | --- | --- | --- |
| Real-time REC into a clip | RM p. 32 | the stock pattern sequencer records (SDK, app/screen.c REC); song mode has no recording | missing in song mode | phase 5, timestamps at the key scan (E) |
| Overdub | RM p. 32 | SDK sequencer only | missing in song mode | phase 5 |
| Step recording, quick input, tie / rest, step input mode | RM p. 28 | STEPS pages of the stock sequencer (app/screen.c) | missing in song mode | phase 4 |
| TR-REC drum entry | RM p. 30 | stock sequencer RHYTHM page | missing in song mode | phase 4 (pads = steps, keys = drum) |
| Step edit: note, velocity, start, length | RM p. 29 | STEP_EDIT page for stock steps; song notes carry offset and length already (app/timed_note.h) | partial (data yes, editor no) | phase 4 event page |
| Edit all events of a step together | UM p. 19 | none | missing | SHIFT + encoder |
| Sub steps / flam | UM p. 9 | none; offsets allow it | missing | later |
| Input quantize on/off, AREA | RM p. 33, UM p. 18 | none | missing | phase 5 |
| Playback quantize per clip and master, larger wins | RM p. 33 | none | missing | phase 5, header field |
| Count-in 1–128 steps, metronome forced | UM p. 5 | stock sequencer count-in (SDK `groove_sequence_count_in`) | missing in song mode | phase 5 (click through the internal 808, D.5) |
| Metronome types / position | UM pp. 17, 19 | SDK click, OFF/REC/ON | partial | one click sound, level |
| Undo / redo, 10 levels | UM p. 1 | SDK project undo, one snapshot (`groove_edit_undo`) | missing in song mode | 4 levels per clip (E.4) |
| Clear phrase / clear notes while REC | RM pp. 35, 57 | none in song mode | missing | phase 4 |
| Note utility: shift, after-quantize | UM p. 14 | none | missing | later |
| Motion: 3 knobs per step, designer, drawer | RM pp. 34–35 | none | missing | CC lanes in the clip (C.4); no designer |
| External MIDI as motion: 4 parameters + pitch bend per clip | UM p. 3 | none | missing | CC events, any count within the clip cap |
| Multitrack note mode | UM p. 2 | n/a | n/a | not planned |

## 7. MIDI

| Feature | MC-707 | Today | Status | Tabby target |
| --- | --- | --- | --- | --- |
| Track channel per track (system) | RM p. 54 | device OUT CH per track plus a per-song override (app/midi_router.c `song_channel`) | implemented | same |
| Tx note / CC / PC per track | UM p. 17 | always on | partial | not planned |
| Per-clip program change, default = clip number, fixed, or OFF; bank MSB/LSB | UM pp. 4, 11 | row events: PC, bank+PC, CC, gap, per row with a lead time (app/song_storage.h events) | implemented at row level | per-clip PC/bank in the header; row events stay as scene events (C.4) |
| Scene PC on a control channel | UM p. 9, MIDI chart | none | missing | later, if asked |
| Knob CCs 80–83 | MIDI chart | none | n/a | encoders send CC only when mapped (later) |
| MIDI sync AUTO / INT / MIDI / USB | RM p. 54 | device setting INT / MIDI with auto source over USB, BLE, DIN-in-less (app/midi_router.c `groove_midi_clock_accept`) | implemented for the stock sequencer; song mode refuses MIDI clock (app/song.c line 793) | song mode follows the clock (D.4) |
| Clock, Start, Stop out | RM p. 54 | clock out, Start/Stop/Continue, SPP (app/midi_router.c `groove_midi_transport`) | implemented | same |
| Continue recognized, SPP not supported | MIDI chart | SPP is sent on Start; not received | partial | receive SPP, Continue (exceeds the MC-707) |
| Clock loss behaviour | not documented | SDK: WAIT / LOCKED / LOST after 2 s | implemented (stock) | song mode: notes off, position held (D.4) |
| Soft thru / USB thru | RM p. 54 | Thru per source with channel owners | implemented | same |
| Rx auto channel to the selected track | UM p. 12 | input channel per track role (app/project.c) | partial | same |

## 8. Pads, buttons, feedback

| Feature | MC-707 | Today | Status | Tabby target |
| --- | --- | --- | --- | --- |
| Pad colours by role, 19-colour palette | RM pp. 18, 22 | fixed colours per state (Task 06 assessment 5.3) | partial | fixed set in G.6, no user palette |
| Step buttons: selected blinks, data lit, loop region green | RM pp. 28, 31 | stock STEPS page on the 16 pads | partial | STEP page in G |
| Next-scene blink | UM p. 4 | "Q n" on the page | partial | blinking scene pad |
| Chord pads (4 notes each) | RM p. 24 | none; the keyboard plays chords | n/a | not planned (37 keys) |
| Arpeggiator (v1.60) | UM p. 7 | SDK arpeggiator with an ARP_EDIT page | implemented | keep |
| Note repeat on drum tracks | UM p. 13 | none | missing | later |
| LED glow (dim level) | RM p. 54 | fixed dim | n/a | — |
