// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/midi-import/make-fixtures.mjs — deterministic .mid fixtures for the importer tests
//
// Purpose
//   Generate the fixture files listed in Task 02 Step 3 into tests/midi-import/fixtures/
//   (committed, so they can be opened in a DAW or the standalone import page) and return
//   the expectations the tests check. Everything here is built from first principles with
//   smf-write.mjs, so the expected rows, blocks and notes are known by construction.
//
//   Fixtures
//     bassline-4bar.mid        type 0, 480 PPQ, 120 BPM: 16 notes, one row, one block
//     multitrack-64bar.mid     type 1, 96 PPQ, 3 tracks (drums ch10, bass, chords), 64 bars
//                              made of 4-bar sections in the order AABAAABBAAAABBBA
//     pad-melody.mid           one track: 3-note pad chords held a whole bar under an 8th-note
//                              melody, 8 bars
//     five-notes.mid           6 notes starting on one step with distinct velocities
//     offgrid.mid              notes pushed off the grid, including exact half-step ties
//     waltz-3-4.mid            3/4, 8 bars → 48-step rows
//     tempo-cc-program.mid     tempo changes, CCs, pitch bend, program changes, SysEx, marker
//     type0-multichannel.mid   type 0, three channels interleaved, running status
//     long-notes.mid           a 300-step note, same-pitch overlaps, same-pitch duplicates
//     row-events.mid           program changes, bank selects and CCs at and near row starts
//     kick-nudge.mid           (Task 05) a kick 3 ticks (3.1 ms at 120 BPM, 480 PPQ) ahead of a bass
//                              note on the same step, plus a bass note nudged late
//     ppq-120.mid, ppq-480.mid, ppq-960.mid   (Task 05) the same off-grid phrase at exact PPQs
//     ppq-100.mid              (Task 05) 100 PPQ: 1920/100 is not whole, times round to units
//     wrong-room-all.mid       (Task 09) the Wrong Room rig: 8 bars, eight instrument parts on
//                              channels 1, 2, 3, 4, 5, 6, 10 and 9 (the FM6 part third in file
//                              order, pinned to track 8), program changes and CCs each device
//                              accepts, and notes-free pedal tracks on 11, 12, 14, 15 and 16
//     wrong-room-wrong.mid     (Task 09) one of each rig fault: a part on a channel the rig has no
//                              device on (13, with that channel cleared in the test rig), notes on
//                              the Brothers' channel 12, PC 123 to the Brothers, CC 70 to the NightSky
//
//   Run:  /usr/bin/node tests/midi-import/make-fixtures.mjs   (writes the files)
//   Import: `fixtures()` returns [{name, bytes, expect}] without writing.
//
// Version: 0.2
//
// Revision log
//   v0.3  2026-11-05  Task 09: wrong-room-all and wrong-room-wrong fixtures.
//   v0.2  2026-11-03  Task 05: kick-nudge, ppq-120/480/960 and ppq-100 fixtures.
//   v0.1  2026-11-02  Initial version (Task 02, Step 2).

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { write, note } from './smf-write.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const FIXTURE_DIR = join(here, 'fixtures');

const head = (name, bpm = 120, num = 4, den = 4) => [{ tick: 0, type: 'trackName', text: name }, { tick: 0, type: 'tempo', bpm }, { tick: 0, type: 'timeSignature', numerator: num, denominator: den }];

export function fixtures() {
  const list = [];

  // 1. Bass line: 4 bars, a note on every 16th of beats 1 and 3, pitch walking up.
  {
    const ppq = 480, step = ppq / 4, t = head('Bass');
    const expected = [];
    for (let i = 0; i < 16; i++) {
      const s = i * 4 + (i % 2 ? 2 : 0);                   // steps 0,6,8,14,... inside 64
      note(t, s * step, step * 2, 36 + i, 64 + i, 0);
      expected.push({ step: s, pitch: 36 + i, velocity: 64 + i, length: 2 });
    }
    list.push({ name: 'bassline-4bar.mid', bytes: write({ format: 0, division: ppq, tracks: [t] }),
      expect: { format: 0, division: ppq, bars: 4, parts: 1, rows: 1, blocks: 1, notes: expected } });
  }

  // 2. 64-bar multitrack with repeated 4-bar sections.
  {
    const ppq = 96, step = ppq / 4, order = 'AABAAABBAAAABBBA';
    const drums = head('Drums'), bass = [{ tick: 0, type: 'trackName', text: 'Bass' }], chords = [{ tick: 0, type: 'trackName', text: 'Chords' }];
    const section = (kind, base) => {
      for (let bar = 0; bar < 4; bar++) {
        const b = base + bar * 16;
        for (let s = 0; s < 16; s++) {
          if (s % 4 === 0) note(drums, (b + s) * step, step, 36, 110, 9);                   // kick on beats
          if (kind === 'A' ? s % 2 === 0 : s % 2 === 1) note(drums, (b + s) * step, step, 42, 70, 9); // hats differ by section
          if (s === 4 || s === 12) note(drums, (b + s) * step, step, 38, 100, 9);           // snare
        }
        const root = kind === 'A' ? 36 : 41;
        for (let s = 0; s < 16; s += 2) note(bass, (b + s) * step, step * 2, root + (s % 8 === 6 ? 7 : 0), 90, 0);
        for (const off of [0, 4, 7]) note(chords, b * step, 16 * step, 60 + off + (kind === 'A' ? 0 : 5), 80, 1); // one chord per bar
      }
    };
    [...order].forEach((kind, i) => section(kind, i * 64));
    const rows = []; let last = null;
    for (const k of order) { if (last && last.k === k) last.n++; else { last = { k, n: 1 }; rows.push(last); } }
    list.push({ name: 'multitrack-64bar.mid', bytes: write({ format: 1, division: ppq, tracks: [drums, bass, chords], runningStatus: true }),
      expect: { format: 1, bars: 64, parts: 3, rowsBeforeMerge: 16, blocks: 6, rows: rows.length, repeats: rows.map(r => r.n), order, cells: 48 } });
  }

  // 3. Pad under melody on one track: chord of 3 notes held 16 steps each bar, melody in 8ths
  //    (3 + the melody note = 4 notes on the bar's first step, the format's maximum).
  {
    const ppq = 480, step = ppq / 4, t = head('PadMelody');
    for (let bar = 0; bar < 8; bar++) {
      for (const p of [48, 52, 55]) note(t, bar * 16 * step, 16 * step, p, 70, 0);
      for (let s = 0; s < 16; s += 2) note(t, (bar * 16 + s) * step, step * 2, 72 + (s / 2) % 5, 100, 0);
    }
    list.push({ name: 'pad-melody.mid', bytes: write({ format: 1, division: ppq, tracks: [t] }),
      expect: { bars: 8, parts: 1, rows: 1, repeats: [2], blocks: 1, notesPerStep0: 4, padLength: 16, melodyLength: 2 } });
  }

  // 4. Six notes on one step with distinct velocities; the 4 loudest must survive.
  {
    const ppq = 480, step = ppq / 4, t = head('Stack');
    const vel = [60, 90, 75, 120, 45, 100];
    vel.forEach((v, i) => note(t, 0, step * 4, 60 + i * 2, v, 0));
    note(t, 32 * step, step, 40, 100, 0);
    list.push({ name: 'five-notes.mid', bytes: write({ format: 0, division: ppq, tracks: [t] }),
      expect: { keptLoudest: [66, 70, 62, 64].sort((a, b) => a - b), keptHighest: [64, 66, 68, 70], keptLowest: [60, 62, 64, 66], dropped: 2 } });
  }

  // 5. Off-grid: shifts of -40, +30, +60 (exact half: tie → earlier), +61 ticks at 480 PPQ (step = 120).
  {
    const ppq = 480, step = ppq / 4, t = head('OffGrid');
    note(t, 4 * step - 40, step, 60, 100, 0);   // 3.667 → 4
    note(t, 8 * step + 30, step, 62, 100, 0);   // 8.25 → 8
    note(t, 12 * step + 60, step, 64, 100, 0);  // 12.5 → 12 (tie earlier)
    note(t, 16 * step + 61, step, 65, 100, 0);  // 16.508 → 17 (ends 17.508: up → 18, length 1)
    // 'up' never shortens: notes 2 and 3 end at 9.25 and 13.5 → 10 and 14 → length 2.
    note(t, 20 * step, 50, 67, 100, 0);         // shorter than a step → length 1
    note(t, 24 * step, step * 2.5, 69, 100, 0); // 2.5 steps: nearest → 2 (tie earlier), up → 3, down → 2
    list.push({ name: 'offgrid.mid', bytes: write({ format: 0, division: ppq, tracks: [t] }),
      expect: { starts: [4, 8, 12, 17, 20, 24], lengths: { nearest: [1, 1, 1, 1, 1, 2], up: [1, 2, 2, 1, 1, 3], down: [1, 1, 1, 1, 1, 2] }, moved: 4 } });
  }

  // 6. Waltz: 3/4, 8 bars, a bass note on beat 1 and chords on beats 2 and 3; bars 1-4 == bars 5-8.
  {
    const ppq = 240, step = ppq / 4, t = head('Waltz', 140, 3, 4);
    for (let bar = 0; bar < 8; bar++) {
      const b = bar * 12;
      note(t, b * step, 4 * step, 43, 100, 0);
      for (const beat of [4, 8]) for (const p of [59, 62, 67]) note(t, (b + beat) * step, 3 * step, p, 70, 0);
    }
    list.push({ name: 'waltz-3-4.mid', bytes: write({ format: 0, division: ppq, tracks: [t] }),
      expect: { barSteps: 12, rowSteps: 48, bars: 8, rowsBeforeMerge: 2, rows: 1, repeats: [2], blocks: 1, tempo: 140 } });
  }

  // 7. Tempo changes, CCs, pitch bend, program changes, SysEx, marker; first tempo 127.5 → 128.
  {
    const ppq = 480, step = ppq / 4, t = head('Events', 127.5);
    t.push({ tick: 0, type: 'programChange', channel: 0, program: 33 }, { tick: 0, type: 'marker', text: 'intro' });
    t.push({ tick: 16 * step, type: 'tempo', bpm: 127.5 });                 // same tempo again: not a change
    t.push({ tick: 32 * step, type: 'tempo', bpm: 140 }, { tick: 48 * step, type: 'tempo', bpm: 90 });
    for (let i = 0; i < 8; i++) t.push({ tick: i * 4 * step, type: 'controlChange', channel: 0, controller: i === 3 ? 64 : 74, value: i * 10 });
    t.push({ tick: 10 * step, type: 'pitchBend', channel: 0, value: 2000 }, { tick: 11 * step, type: 'channelPressure', channel: 0, value: 50 });
    t.push({ tick: 20 * step, type: 'programChange', channel: 0, program: 81 }, { tick: 5, type: 'sysex', data: [0x7e, 0x7f, 0x09, 0x01] });
    for (let s = 0; s < 64; s += 4) note(t, s * step, step * 2, 60 + (s / 4) % 7, 100, 0);
    list.push({ name: 'tempo-cc-program.mid', bytes: write({ format: 1, division: ppq, tracks: [t] }),
      expect: { tempo: 128, tempoExact: 127.5, tempoChanges: 2, cc: 8, sustain: 1, programs: 2, bend: 1, pressure: 1, sysex: 1, notes: 16 } });
  }

  // 8. Type 0 with three channels interleaved and running status: parts split per channel.
  {
    const ppq = 480, step = ppq / 4, t = head('Mixed');
    for (let s = 0; s < 32; s += 4) { note(t, s * step, step, 36, 100, 9); note(t, s * step, 2 * step, 48, 90, 0); note(t, (s + 2) * step, step, 72, 80, 1); }
    list.push({ name: 'type0-multichannel.mid', bytes: write({ format: 0, division: ppq, tracks: [t], runningStatus: true }),
      expect: { parts: 3, channels: [0, 1, 9], counts: [8, 8, 8], drums: [false, false, true] } });
  }

  // 9. Long and overlapping notes: 300-step note (clipped to 255), same-pitch overlap, same-step duplicate.
  {
    const ppq = 480, step = ppq / 4, t = head('Long');
    note(t, 0, 300 * step, 40, 100, 0);           // → length 255
    note(t, 0, 8 * step, 60, 100, 0);             // overlapped by the next same-pitch note
    note(t, 4 * step, 4 * step, 60, 100, 0);      // → earlier note clipped to 4
    note(t, 16 * step, 2 * step, 64, 50, 0);      // duplicate pair: quieter dropped
    note(t, 16 * step, 2 * step, 64, 110, 0);
    list.push({ name: 'long-notes.mid', bytes: write({ format: 0, division: ppq, tracks: [t] }),
      expect: { bars: 19, notes: [{ step: 0, pitch: 40, length: 255 }, { step: 0, pitch: 60, length: 4 }, { step: 4, pitch: 60, length: 4 }, { step: 16, pitch: 64, velocity: 110, length: 2 }], clipped: 1, overlap: 1, duplicate: 1 } });
  }
  // 10. Row events (Task 04): 8 bars of 4/4 = two 64-step rows. Row 1 start: PC 5 on ch 1,
  // CC 7 = 100 on ch 2, bank MSB 1 + LSB 2 + PC 9 on ch 3. One beat before row 2: PC 6 on
  // ch 1 (pre-roll). At row 2's start: PC 7 on ch 1. Mid-row: CC 74 = 50 on ch 2 (dropped).
  // A bank LSB without a program on ch 4 at row 2's start (dropped). Notes on ch 1, one per bar.
  {
    const ppq = 480, step = ppq / 4, t = head('Events');
    t.push({ tick: 0, type: 'programChange', channel: 0, program: 5 }, { tick: 0, type: 'controlChange', channel: 1, controller: 7, value: 100 },
      { tick: 0, type: 'controlChange', channel: 2, controller: 0, value: 1 }, { tick: 0, type: 'controlChange', channel: 2, controller: 32, value: 2 }, { tick: 0, type: 'programChange', channel: 2, program: 9 });
    t.push({ tick: 10 * step, type: 'controlChange', channel: 1, controller: 74, value: 50 });
    t.push({ tick: 60 * step, type: 'programChange', channel: 0, program: 6 });
    t.push({ tick: 64 * step, type: 'programChange', channel: 0, program: 7 }, { tick: 64 * step, type: 'controlChange', channel: 3, controller: 32, value: 3 });
    for (let bar = 0; bar < 8; bar++) note(t, bar * 16 * step, 4 * step, 48 + bar, 100, 0);
    list.push({ name: 'row-events.mid', bytes: write({ format: 1, division: ppq, tracks: [t] }), expect: { events: 5, droppedMidRow: 1, bankWithoutProgram: 1 } });
  }

  // 11. (Task 05) Kick nudged 3 ticks early against a bass note on the same step (480 PPQ,
  // 120 BPM: a tick is 1.04 ms, 4 units), and a bass note 5 ticks late two steps on.
  {
    const ppq = 480, step = ppq / 4, drums = head('Drums'), bass = [{ tick: 0, type: 'trackName', text: 'Bass' }];
    for (let bar = 1; bar < 3; bar++) {                           // from bar 2: the first kick must not fall before tick 0
      const b = bar * 16 * step;
      note(drums, b + 0 * step - 3, step, 36, 120, 9);            // kick 3 ticks early (-12 units)
      note(drums, b + 8 * step - 3, step, 36, 120, 9);
      note(bass, b + 0 * step, 2 * step, 40, 100, 0);              // bass on the grid
      note(bass, b + 2 * step + 5, 2 * step + 7, 43, 100, 0);      // bass 5 ticks late (+20 units), 2 steps + 7 ticks long
      note(bass, b + 8 * step, 4 * step, 40, 100, 0);
    }
    list.push({ name: 'kick-nudge.mid', bytes: write({ format: 1, division: ppq, tracks: [drums, bass] }),
      expect: { kickOffset: -12, bassLateOffset: 20, bassLateLength: 2 * 480 + 28, unitsPerTick: 4 } });
  }
  // 12. (Task 05) The same phrase at 120, 480, 960 and 100 PPQ: a note every other step, the
  // odd ones delayed by ppq/24 ticks (1/6 step = 80 units at an exact PPQ), 1.5 steps long
  // (whole ticks at 120/480/960; at 100 PPQ 4 and 38 ticks, which round to units).
  for (const ppq of [120, 480, 960, 100]) {
    const t = head('PPQ ' + ppq), step = ppq / 4, delay = Math.round(ppq / 24), length = Math.round(step * 1.5);
    const units = ticks => Math.round(ticks * 1920 / ppq);
    const expected = [];
    for (let s = 0; s < 16; s += 2) {
      const delayTicks = s % 4 ? delay : 0;
      note(t, s * step + delayTicks, length, 60 + s, 100, 0);
      expected.push({ step: s, offset: units(delayTicks), length: units(length), exactOffset: delayTicks * 1920 / ppq, exactLength: length * 1920 / ppq });
    }
    list.push({ name: 'ppq-' + ppq + '.mid', bytes: write({ format: 0, division: ppq, tracks: [t] }), expect: { ppq, exact: 1920 % ppq === 0, notes: expected } });
  }
  // 13. (Task 09) The Wrong Room: 8 bars of 4/4 at 120 BPM (two 64-step rows), written as the guide
  // asks: a conductor track, one track per part on its device's channel, program changes and
  // CCs at row starts, pedal events in notes-free tracks. Channels are 0-based here.
  {
    const ppq = 480, step = ppq / 4, bar = 16 * step, row = 4 * bar;
    const conductor = [{ tick: 0, type: 'trackName', text: 'Wrong Room' }, { tick: 0, type: 'tempo', bpm: 120 }, { tick: 0, type: 'timeSignature', numerator: 4, denominator: 4 }];
    const part = (name, ch, pitch, events = []) => {
      const t = [{ tick: 0, type: 'trackName', text: name }, ...events.map(e => ({ ...e, channel: ch }))];
      for (let b = 0; b < 8; b++) for (let q = 0; q < 4; q++) note(t, b * bar + q * 4 * step, 2 * step, pitch + (q % 2) * 3, 100, ch);
      return t;
    };
    const pc = (tick, program) => ({ tick, type: 'programChange', program }), cc = (tick, controller, value) => ({ tick, type: 'controlChange', controller, value });
    const tracks = [conductor,
      part('Seashell bass', 0, 36, [cc(0, 74, 90)]),                                           /* ch 1: notes, a learnt CC (no fixed map: not warned) */
      part('FM-1 A lead', 1, 60, [pc(0, 3), cc(0, 74, 100), pc(row, 4)]),                      /* ch 2: Skiff sound 3 then 4, brightness */
      part('FM6 internal pad', 8, 64, []),                                                     /* ch 9: pinned to track 8 although third in the file */
      part('FM-1 B keys', 2, 67, [pc(0, 1)]),                                                  /* ch 3 */
      part('M8 breaks', 3, 48, [pc(0, 5), pc(row, 6)]),                                        /* ch 4: M8 track 1, INST 05 then 06 */
      part('Proteus strings', 4, 55, [pc(0, 7)]),                                              /* ch 5: Proteus part 1, preset 007 */
      part('Proteus brass', 5, 59, [pc(0, 12), pc(row, 13)]),                                  /* ch 6: Proteus part 2 */
      part('M8 bass', 9, 40, [pc(0, 2)]),                                                      /* ch 10: M8 track 2 (the drum channel of the file, a part all the same) */
      [{ tick: 0, type: 'trackName', text: 'Royalist' }, { ...pc(0, 7), channel: 10 }, { ...cc(0, 24, 1), channel: 10 }],
      [{ tick: 0, type: 'trackName', text: 'Brothers' }, { ...pc(0, 3), channel: 11 }, { ...cc(0, 102, 127), channel: 11 }, { ...pc(row, 4), channel: 11 }],
      [{ tick: 0, type: 'trackName', text: 'NightSky' }, { ...cc(0, 0, 1), channel: 13 }, { ...pc(0, 72), channel: 13 }, { ...cc(0, 63, 127), channel: 13 }],
      [{ tick: 0, type: 'trackName', text: 'H90' }, { ...pc(0, 12), channel: 14 }, { ...pc(row, 13), channel: 14 }],
      [{ tick: 0, type: 'trackName', text: 'Zoom' }, { ...pc(0, 0), channel: 15 }, { ...pc(row, 1), channel: 15 }]];
    list.push({ name: 'wrong-room-all.mid', bytes: write({ format: 1, division: ppq, tracks }),
      expect: { parts: 8, outChannels: [0, 1, 2, 3, 4, 5, 9, 8], pinned: { key: '3:8', track: 7 }, events: 22, rows: 2 } });
  }
  // 14. (Task 09) One of each rig fault, once: a part on channel 13 (cleared in the test rig), notes on
  // the Brothers' channel 12, PC 123 to the Brothers (its last preset is 122), CC 70 to the NightSky.
  {
    const ppq = 480, step = ppq / 4, bar = 16 * step;
    const conductor = [{ tick: 0, type: 'trackName', text: 'Wrong' }, { tick: 0, type: 'tempo', bpm: 120 }, { tick: 0, type: 'timeSignature', numerator: 4, denominator: 4 }];
    const pad = [{ tick: 0, type: 'trackName', text: 'Pad on 13' }], guitar = [{ tick: 0, type: 'trackName', text: 'Guitar on the Brothers' }];
    for (let b = 0; b < 4; b++) { note(pad, b * bar, 4 * step, 60, 90, 12); note(guitar, b * bar, 2 * step, 52, 90, 11); }
    guitar.push({ tick: 0, type: 'programChange', channel: 11, program: 123 });
    const sky = [{ tick: 0, type: 'trackName', text: 'NightSky' }, { tick: 0, type: 'controlChange', channel: 13, controller: 70, value: 64 }];   /* CC 70 is not in the NightSky's table */
    list.push({ name: 'wrong-room-wrong.mid', bytes: write({ format: 1, division: ppq, tracks: [conductor, pad, guitar, sky] }),
      expect: { warnings: ['channelNotInRig', 'notesOnEffectsChannel', 'programOutOfRange', 'ccNotNamed'] } });
  }
  return list;
}

export function writeFixtures(dir = FIXTURE_DIR) {
  mkdirSync(dir, { recursive: true });
  for (const f of fixtures()) writeFileSync(join(dir, f.name), f.bytes);
  return fixtures().map(f => f.name);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const name of writeFixtures()) console.log('wrote', join(FIXTURE_DIR, name));
}
