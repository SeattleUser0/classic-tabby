# Writing MIDI files for Classic Tabby

<!-- docs/MIDI-GUIDE.template.md: the hand-written part of the guide. tools/linux/midi-guide.mjs
     (web/rig/guide.js) fills every placeholder token (double braces) from the rig profile and the device library and
     writes docs/MIDI-GUIDE.md; the workbench's Import MIDI panel generates the same file for the
     active rig. Edit this template, never the generated file. Version 0.4, 2026-11-12.
     Revision log: v0.4 2026-11-12 (Task 16): section 14, song notes no longer wait for the 10 ms pass (fast MIDI, tabby-v04.2);
     a song follows an external clock over USB or Bluetooth (tabby-v04.3). v0.3 2026-11-10 (Task 14): section 14, the TRS jack is output only; external clock
     over USB through the H4MIDI WC. v0.2 2026-11-10 (Task 13 Step 3): section 14, the recommended live wiring (one DIN
     cable per device through the H4MIDI WC). v0.1 2026-11-05 (Task 09), from the hand-written guide
     of 2026-11-05 (tabby-v03.1). -->

Instructions for an AI model (Claude, ChatGPT or another) that writes Standard MIDI files to be imported into Classic Tabby, the custom firmware on an M-VAVE SMK-37 Pro. Read all of it before writing a file. Rules marked MUST are hard limits of the importer or the device. Breaking them loses notes or gets the file refused.

Written for Classic Tabby {{VERSION}} and the rig profile "{{RIG_NAME}}" ({{GENERATED}}). The rules come from the importer source (web/import/midi-song.js) and the spec (docs/SPEC.md sections 7 to 13) at https://github.com/SeattleUser0/classic-tabby. Sections 8, 9 and 11 and the rig tables in Appendix B are generated from the rig profile (web/rig/profiles/) and the device definitions (web/devices/); do not edit them by hand.

## 1. What Classic Tabby does with the file

- The workbench web page reads the .mid file and turns it into one song. A song has up to {{TRACKS}} tracks and up to {{ROWS_MAX}} rows.
- A row is a slice of the song, normally 4 bars of 4/4 (64 sixteenth-note steps). Each track's notes in a row form a block. Blocks that are byte for byte identical are stored once and reused.
- Timing is kept exactly as written. The importer does not quantize. A note keeps its offset from the 16th grid and its exact length, at a resolution of 1/{{UNITS}} of a 16th note.
- Each row is also a performance unit. On stage the player jumps the whole song to a row (a scene change), or launches one track's block from any row on its own (track launching). So rows should start where musical sections start, and each track's part in a row should make sense when it loops by itself.
- The SMK-37 is the MIDI clock master and sends notes out over MIDI to external synths. Each Tabby track sends on one MIDI channel: the channel of the part you wrote (section 8).

## 2. File format (MUST)

- Standard MIDI File, binary, format 1. Format 0 is accepted, but use format 1.
- Time division in ticks per quarter note (PPQ). Use 480. 960 is also fine. Any PPQ that divides 1920 is exact (96, 120, 192, 240, 384, 480, 960, 1920). Other values get rounded. SMPTE time division is refused.
- Track 0 is the conductor track: one set_tempo and one time_signature, both at tick 0, then end_of_track. No notes.
- One MIDI track per instrument part, each with a track_name, all its events on one MIDI channel, and an end_of_track. Never put two channels in one track.
- At most {{TRACKS}} parts with notes. A part is one MIDI track on one channel. Parts beyond {{TRACKS}} are not imported unless the user reassigns them by hand.
- Every note_on with velocity 1 to 127 has a matching note_off on the same channel and pitch. A note_on with velocity 0 counts as a note_off.
- File name: short ASCII. The first {{NAME_LENGTH}} characters, upper-cased, become the song name.

## 3. Tempo and meter

- One tempo for the whole song. A whole number of BPM from {{TEMPO_MIN}} to {{TEMPO_MAX}}. Fractions are rounded. Tempo changes after the first are ignored.
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

- At most {{NOTES_PER_STEP}} notes may anchor on the same 16th step in one part. A 5th note is dropped (the 4 loudest are kept). Count notes by anchor, not by exact tick, so a strum spread across a step still counts against that step. Split bigger chords across two parts or two steps.
- Never give one part the same pitch twice on the same step. Only the louder note is kept.
- Never let a pitch overlap itself in one part (a new note on a pitch that is still sounding). The earlier note is cut short where the new one starts. End the old note first.
- Velocity 1 to 127. Use velocity for dynamics. There is no other expression.
- Write real note lengths. Sustain pedal (CC 64) is ignored, so a held pad must be a long note, not a short note plus a pedal.
- Pitch bend, aftertouch, polyphonic pressure and SysEx are ignored. Don't rely on them.
- Drums: one part on one channel, with all drum sounds as different pitches in that part. The 4-per-step rule applies, so kick, snare, hat and one more is the most that can land on one step. In this rig the drum machine is the M8 (section 8); channel 10 is an ordinary M8 part here, not a General MIDI drum channel.

## 6. Program changes and CCs (row events)

- Program change, bank select and CC messages are imported only near a row start. The window runs from one beat before the row start up to half a step after it. Anything outside that window is dropped. Don't write automation sweeps; they are lost.
- Put each part's program change at its row start tick, on that part's channel. Bank select (CC 0 and/or CC 32) goes immediately before its program change, on the same channel, at the same tick or just before.
- At most {{EVENTS_ROW}} events per row and {{EVENTS_SONG}} per song. A bank select plus its program change counts as one event.
- Send events on the real MIDI channel of the device they are for. Events for an instrument part go on that part's channel. When the player launches that track on stage, its row events go with it. Events for effects pedals that have no part of their own ({{EFFECTS_LIST}}) fire only on whole-song scene changes. Put them in a track of their own with no notes.
- Program numbers in the file are 0 to 127 (MIDI wire values). Section 9 gives each device's own numbering beside the wire value, and the bank select the device needs for presets above 127. Use those; do not guess.
- Only send a program change to a device that receives one, and only a CC the device names (section 9). The importer warns about the rest; the checker in Appendix B does too.
- Before the first row the player can press SEND SETUP to send row 1's events to every device. So put every device's starting preset in row 1.

## 7. Song shape and storage

- Make the song a whole number of rows. In 4/4, that means a multiple of 4 bars. The last row may be partly silent.
- At most {{ROWS_MAX}} rows. In 4/4 that is 512 bars.
- Start each section (intro, verse, drop, breakdown) on a row boundary.
- Storage is shared by all {{SONGS}} songs on the device (about {{POOL_KB}} KB). Identical blocks are stored once. A drum or bass loop that repeats bar-for-bar identically costs almost nothing. The same loop with randomized velocities or timing on every repeat stores a new copy each time. Keep repeats identical unless the variation is musically intended.
- Consecutive rows whose 8 blocks are all identical merge into one row with a repeat count (up to {{REPEAT_MAX}}), unless the later row has row events.

## 8. Channels: the rig "{{RIG_NAME}}"

Every device has one channel. Write each part on its device's channel and the importer sets that Tabby track's output channel from the file; nothing is set by hand. The table is generated from the rig profile.

{{CHANNEL_MAP}}

Rules that follow from the table:

- Parts take Tabby tracks 1 to {{TRACKS}} in file order, except a part on a channel with a pinned track, which lands on that track whatever its order ({{PINNED_LIST}}). Put the parts in the order you want on the tracks.
- Name each track after its device (for example "{{EXAMPLE_TRACK_NAME}}"): the importer shows the device it finds on the part's channel and the device the name mentions, so a mismatch is visible before anything is written.
- Channels marked "effect" take program changes and CCs only. Never write notes on them.
- Channels marked "internal" sound inside the SMK-37. Nothing external listens; program changes and CCs on them are ignored.
- A channel not in the table has no device. The importer warns and the song still sends on it.
- Several M8 parts: each M8 channel drives one M8 track (the table says which). Each part needs its own Tabby track.

{{RIG_NOTES}}

## 9. The devices

Generated from the device definitions: how each device is connected and set, how it numbers programs (wire value and shown number), the CCs it names, and clock. "Unverified" marks what no manufacturer document settles; the hardware checklist in BUILD.md settles it.

{{DEVICE_SECTIONS}}

## 10. Laying out a file for scene changes and track launching

- A scene change (the player jumps to a row) sends the new row's events on every channel, pedals included, before the row's first notes. So a row that starts a section carries every device's preset for that section.
- A track launch (the player loops one track's block from a row) sends only the events on that track's own channel. So an instrument's program change must be on the instrument's channel, in the same row as the notes it belongs to. Pedal events never travel with a launch; they fire on scene changes only.
- Therefore: pedal events go in a notes-free track on the pedal's channel; instrument presets go on the instrument's channel at row starts; row 1 holds every device's starting state (SEND SETUP sends row 1).
- A row's events leave in file order (track after track). A device whose rig entry has a gap ({{GAP_DEVICES}}) stalls every event that follows it in that row for the gap's length, so put such a device's track last in the file. The device then still gets its program change before the bar, because the whole stream is sent early by the sum of its gaps; only at PLAY itself (row 1 with nothing sent early) does the tail after a gap come late, which is why the player runs SEND SETUP before PLAY.
- A launched block loops with its row's length, independently of the song. Make each track's part in a row a loop that stands on its own: no note hanging over from the previous row, no fill that only makes sense before the next row.
- The FM6 part (channel {{INTERNAL_CHANNEL_LIST}}) is pinned to Tabby track {{INTERNAL_TRACK_LIST}} and sounds inside the SMK-37 only. It is the part to audition or to keep when no external synth is free.

## 11. Limits

{{LIMITS}}

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
- More than {{TRACKS}} parts, or two channels mixed in one track.
- Notes on a pedal's channel, a program change to a device that takes none, a program number the device cannot reach, a CC the device does not name.
- A preset above 127 without its bank select, or a bank select the device does not use.
- Humanizing every repeat of a loop, which multiplies storage and makes launching a "loop" sound different each time.
- PPQ 100 or other values that don't divide 1920.

## 14. Live wiring: one DIN cable per device (recommended)

This section is for the player, not for the file. It changes nothing in how you write a song.

- DIN MIDI is serial: one 3-byte note takes 0.96 ms on the cable. On the SMK-37's own TRS DIN out, every track shares one cable, so the 8 notes of a step on 8 tracks leave one after another over about 7.7 ms; the last device plays its note about 7 ms after the first (measured 7.3 ms mean, Task 12 B1).
- The SDK's DIN output uses running status by itself (a message with the same status byte as the one before it in the same burst is sent without it). That only helps notes on the same channel. The 8 notes of a step on 8 channels have 8 different status bytes, so it saves nothing there; a 4-note chord on one channel saves 3 bytes (about 1 ms).
- Recommended live wiring: SMK-37 USB into the USB host port of the CME H4MIDI WC; the H4MIDI WC routes each MIDI channel to its own DIN out (HxMIDI Tools: one channel filter per DIN out), one DIN cable per device. Each cable then carries only its own device's notes: with two devices per DIN out a step costs about 1.9 ms on that cable instead of 7.7 ms, and with one device about 1 ms.
- What the SMK-37 needs for it, and has today: each track sends on its own channel (MIDI TRACK, SHIFT + SEQ, K2 OUT CH; the importer sets it from the file, section 8), and the song goes out on USB (OUT PORT ALL sends it on USB, DIN and Bluetooth together; the USB copy is the one the H4MIDI routes). Nothing on the SMK-37 has to change.
- What it does not have: a per-track port choice. OUT PORT is one setting for all tracks (ALL or OFF). A rig that puts one device on the SMK-37's own TRS DIN out and the rest on USB therefore still sends every track on that DIN cable as well; the device on it simply ignores the other channels, but the burst on that cable is still all tracks' notes. Leave the SMK-37's TRS out unconnected in the recommended wiring.
- External clock or notes INTO the SMK-37: the SMK-37's TRS jack cannot be a MIDI input. The SDK reports its input ports as USB and Bluetooth only (`fm1_midi_input_ports` returns 6), the board hook `fm1_io_trs_midi_enabled` returns 0 (app/board/panel.c: that pin is an encoder input on both boards, no TRS receiver is fitted), and `smk37_uart_start` sets up transmit only. No cable and no setting changes that; the SYNC / MIDI page's CLK IN choice DIN receives nothing, so leave CLK IN on AUTO or USB. To give the SMK-37 a clock from a DIN device, plug that device's MIDI OUT into a DIN input of the H4MIDI WC and route it (HxMIDI Tools) to the H4MIDI's USB host port that the SMK-37 is plugged into, the same cable that already carries the song out; on the SMK-37 set CLOCK to MIDI and CLK IN to AUTO or USB. The master must send Start or Continue and Clock, and a song cannot follow it (song mode needs the INT clock). This routing is from the H4MIDI's documented function and the SMK-37's USB input; it has not been tried on this rig. Since tabby-v04.3 a song follows that clock: with CLOCK = MIDI, PLAY arms the song and the master's Start, Continue, Stop and Song Position Pointer run it (docs/SPEC.md 19.3).
- The H4MIDI WC adds its own small delay (USB to DIN) and the USB burst of a step (about 2.4 ms for 8 notes, Task 12 B1) still comes first. Since tabby-v04.2 the firmware asks for the control pass at once when a song note is due (fast MIDI, docs/SPEC.md 19.2), so the old 10 ms step no longer delays song notes: measured on the device, one line leaves within a 4.9 ms band against 14.3 ms with it off (Task 16 night run, BUILD.md 32.4); with it switched off (ACTIONS, A2 FAST MIDI) the 10 to 14 ms band is back.

## Appendix A. Template: write a song with mido

Writes example.mid for this rig: 8 bars at 120 BPM in 4/4, two rows, with {{EX1_NAME}} (channel {{EX1_CH}}) playing a nudged kick-like pulse, {{EX2_NAME}} (channel {{EX2_CH}}) a bass line with a program change at each row start, and {{EX3_NAME}} (channel {{EX3_CH}}) a pad. Change the parts, keep the structure. Channels in mido are 0-based: channel 1 is 0.

```python
#!/usr/bin/env python3
"""Example: write an 8-bar Classic Tabby song (two rows of 4 bars) with mido, for the rig "{{RIG_NAME}}"."""
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
mid.tracks.append(track('{{EX1_NAME}}', {{EX1_CH0}}, pulse))
mid.tracks.append(track('{{EX2_NAME}}', {{EX2_CH0}}, bass, pcs={{EX2_PCS}}))
mid.tracks.append(track('{{EX3_NAME}}', {{EX3_CH0}}, pad))
mid.save('example.mid')
print('wrote example.mid')
```

## Appendix B. Checker

Save as tabby_check.py and run: python3 tabby_check.py song.mid. Exit code 0 means no errors. The RIG table at the top is generated from the rig profile: channel, device, kind, whether it takes program changes and up to which number, its bank select, and the CCs it names (None = no fixed map, any CC passes).

```python
#!/usr/bin/env python3
"""tabby_check.py: check a .mid file against the Classic Tabby importer rules and the rig "{{RIG_NAME}}".
Usage: python3 tabby_check.py song.mid
Needs: pip install mido
Exit code 0 = no errors (warnings may remain), 1 = errors found."""
import sys
from collections import defaultdict
import mido

U = 480                      # units per 16th step
HALF = 240
EXACT_PPQ = {96, 120, 192, 240, 384, 480, 960, 1920}
MAX_NOTES_PER_STEP = {{NOTES_PER_STEP}}
MAX_PARTS = {{TRACKS}}
MAX_ROWS = {{ROWS_MAX}}
MAX_LEN_STEPS = 17476
MAX_EVENTS_ROW = {{EVENTS_ROW}}
MAX_EVENTS_SONG = {{EVENTS_SONG}}
POOL_BYTES = {{POOL_BYTES}}
PREROLL_STEPS = 4            # importer default: one quarter note

# The rig (generated): 1-based channel -> name, kind, program change (None = not received, else the
# highest wire value accepted in bank 0), banks (CC 0 / CC 32 values per bank index, or None), named CCs
# (set, or None for a device without a fixed map), pinned Tabby track (or None).
{{CHECKER_RIG}}

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
        if not {{TEMPO_MIN}} <= round(bpm) <= {{TEMPO_MAX}}: err(f"tempo {bpm:.1f} outside {{TEMPO_MIN}}..{{TEMPO_MAX}}")
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
