# Writing MIDI files for Classic Tabby

Instructions for an AI model (Claude, ChatGPT or another) that writes Standard MIDI files to be imported into Classic Tabby, the custom firmware on an M-VAVE SMK-37 Pro. Read all of it before writing a file. Rules marked MUST are hard limits of the importer or the device. Breaking them loses notes or gets the file refused.

Written for Classic Tabby tabby-v03.1 (November 2026). The rules come from the importer source (web/import/midi-song.js) and the spec (docs/SPEC.md sections 7 to 10) at https://github.com/SeattleUser0/classic-tabby.

## 1. What Classic Tabby does with the file

- The workbench web page reads the .mid file and turns it into one song. A song has up to 8 tracks and up to 128 rows.
- A row is a slice of the song, normally 4 bars of 4/4 (64 sixteenth-note steps). Each track's notes in a row form a block. Blocks that are byte for byte identical are stored once and reused.
- Timing is kept exactly as written. The importer does not quantize. A note keeps its offset from the 16th grid and its exact length, at a resolution of 1/480 of a 16th note.
- Each row is also a performance unit. On stage the player jumps the whole song to a row (a scene change), or launches one track's block from any row on its own (track launching). So rows should start where musical sections start, and each track's part in a row should make sense when it loops by itself.
- The SMK-37 is the MIDI clock master and sends notes out over MIDI to external synths. Each Tabby track sends on one MIDI channel.

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
- Drums: one part on one channel (for example channel 10), with all drum sounds as different pitches in that part. The 4-per-step rule applies, so kick, snare, hat and one more is the most that can land on one step.

## 6. Program changes and CCs (row events)

- Program change, bank select and CC messages are imported only near a row start. The window runs from one beat before the row start up to half a step after it. Anything outside that window is dropped. Don't write automation sweeps; they are lost.
- Put each part's program change at its row start tick, on that part's channel. Bank select (CC 0 and/or CC 32) goes immediately before its program change, on the same channel, at the same tick or just before.
- At most 32 events per row and 292 per song. A bank select plus its program change counts as one event.
- Send events on the real MIDI channel of the device they are for. Events for an instrument part go on that part's channel. When the player launches that track on stage, its row events go with it. Events for effects pedals that have no part of their own (in this rig the Eventide H90 on channel 15 and the Zoom MS-70CDR+ on channel 16) fire only on whole-song scene changes. Put them in a track of their own with no notes.
- Program numbers in the file are 0 to 127 (MIDI wire values). If the user names a preset by its display number, ask whether the device counts from 0 or 1, or use the number they give and say which convention you assumed.
- Before the first row the player can press SEND SETUP to send row 1's events to every device. So put every device's starting preset in row 1.

## 7. Song shape and storage

- Make the song a whole number of rows. In 4/4, that means a multiple of 4 bars. The last row may be partly silent.
- At most 128 rows. In 4/4 that is 512 bars.
- Start each section (intro, verse, drop, breakdown) on a row boundary.
- Storage is shared by all 16 songs on the device (about 382 KB). Identical blocks are stored once. A drum or bass loop that repeats bar-for-bar identically costs almost nothing. The same loop with randomized velocities or timing on every repeat stores a new copy each time. Keep repeats identical unless the variation is musically intended.
- Consecutive rows whose 8 blocks are all identical merge into one row with a repeat count (up to 64), unless the later row has row events.

## 8. Channels

- Ask the user which MIDI channel each instrument is on, unless they already said. Don't guess. Known in this rig: Eventide H90 receives on channel 15 and Zoom MS-70CDR+ on channel 16, both for program changes only.
- The importer assigns the first 8 parts to Tabby tracks 1 to 8 in file order, and the user can reassign them. Put the parts in the order the user wants them on the tracks.

## 9. How to produce the file

1. Plan first: tempo, meter, row length, number of rows, sections and which row each starts on, parts and channels, each device's starting preset.
2. Write the file with code, never by typing bytes by hand. Python with the mido library is the reference (pip install mido). Appendix A is a working template.
3. Run the checker in Appendix B on the file. Fix every ERROR. Fix every WARNING unless it is intended (for example a dropped CC the user accepted). Repeat until it prints RESULT: PASS.
4. Give the user the file and a short summary: tempo, meter, rows, parts with names and channels, row events per row, and the checker's last lines.

If you cannot run code, say so. Then give the user the Python script that writes the file and the checker, and tell them to run both before importing.

## 10. Common mistakes

- Notes in a track with no matching note_off, or a missing end_of_track.
- Note-off and note-on for the same pitch at the same tick written in the wrong order. Write the note-off first.
- Five-note chords, or a chord plus a melody note on the same step in one part.
- Long pad notes held with the sustain pedal instead of real lengths.
- Filter sweeps or volume fades written as CC streams. They are dropped.
- Program changes in the middle of a row. They are dropped.
- Tempo ramps, meter changes, or a pickup before tick 0.
- More than 8 parts, or two channels mixed in one track.
- Humanizing every repeat of a loop, which multiplies storage and makes launching a "loop" sound different each time.
- PPQ 100 or other values that don't divide 1920.

## Appendix A. Template: write a song with mido

Writes example.mid: 8 bars at 120 BPM in 4/4, two rows, with a kick nudged 12 ticks early, a bass part with a program change at each row start, and a pad. Change the parts, keep the structure.

```python
#!/usr/bin/env python3
"""Example: write an 8-bar Classic Tabby song (two rows of 4 bars) with mido."""
import mido

PPQ = 480
STEP = PPQ // 4              # one 16th note in ticks
BAR = 16 * STEP

def track(name, channel, notes, pcs=()):
    """notes: (start_tick, length_ticks, pitch, velocity); pcs: (tick, program)."""
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
kick = [(b * BAR + q * 4 * STEP - 12, STEP, 36, 110) for b in range(8) for q in range(4)]  # 12 ticks (12.5 ms) early
kick[0] = (0, STEP, 36, 110)                                     # nothing before tick 0
bass = [(b * BAR + q * 4 * STEP, 3 * STEP, 36 + (b // 4) * 5, 100) for b in range(8) for q in range(4)]
pad = []
for r, root in enumerate((60, 65)):
    pad += [(r * 4 * BAR, 4 * BAR - STEP // 2, root + i, 70) for i in (0, 4, 7)]
mid.tracks.append(track('Kick', 9, kick))
mid.tracks.append(track('Bass', 0, bass, pcs=[(0, 5), (4 * BAR, 6)]))
mid.tracks.append(track('Pad', 1, pad))
mid.save('example.mid')
print('wrote example.mid')
```

## Appendix B. Checker

Save as tabby_check.py and run: python3 tabby_check.py song.mid. Exit code 0 means no errors.

```python
#!/usr/bin/env python3
"""tabby_check.py: check a .mid file against the Classic Tabby importer rules.
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
POOL_BYTES = 96 * 4076
PREROLL_STEPS = 4            # importer default: one quarter note

errors, warnings = [], []
def err(m): errors.append(m)
def warn(m): warnings.append(m)

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
    tick_bar = None
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
        err(f"{len(parts)} parts (track, channel pairs with notes); Classic Tabby has 8 tracks")
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
    # row events
    per_row = defaultdict(int)
    for t, ti, ch, kind, data in ctrl:
        st = to_units(t) / U
        R = round(st / row); d = st - R * row
        if -PREROLL_STEPS <= d < 0.5 and R >= 0:
            if kind == 'cc' and data[0] in (0, 32): continue   # merges into the next PC
            per_row[R] += 1
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
    print(f"parts: {len(parts)}  " + ", ".join(f"T{p[0]}:{names.get(p[0],'')!r} ch{p[1]+1}" for p in parts))
    print(f"rows: {rows} of {row} steps, unique blocks: {len(blocks)}, pool bytes about {pool} ({100*pool/POOL_BYTES:.1f}% of all song storage)")
    print(f"row events: {sum(per_row.values())}")
    for w in warnings: print("WARNING:", w)
    for e in errors: print("ERROR:", e)
    print("RESULT:", "FAIL" if errors else "PASS")

if __name__ == '__main__':
    main(sys.argv[1])
    sys.exit(1 if errors else 0)
```
