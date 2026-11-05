// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/midi-import/run.mjs — host tests for the MIDI importer (Task 02, Step 3)
//
// Purpose
//   Run the importer modules (web/import/*.js, loaded exactly as the browser page loads
//   them, as classic scripts) against the fixtures from make-fixtures.mjs and check rows,
//   blocks and notes against values known by construction:
//     1. parser: header, division, names, note pairing, running status, type 0 channel split,
//        rejection of SMPTE division and format 2, truncated files tolerated; the mf2t text
//        form (header, events, note names, unknown lines, refused time formats);
//     2. bass line: one row, one block, exact notes;
//     3. 64-bar multitrack: deduplication gives 6 blocks and the expected rows/repeats, and
//        expanding the song again reproduces the pre-deduplication grid;
//     4. pad under melody on one track: overlapping notes with different lengths;
//     5. six notes on one step: the 4 loudest / highest / lowest survive, 2 warnings;
//     6. off-grid notes: snapping, half-step ties, the three length rules;
//     7. 3/4: 12-step bars, 48-step rows, one merged row;
//     8. tempo / CC / program file: first tempo used, everything else counted and ignored;
//     9. long notes: 255 clip, same-pitch overlap clip, same-step duplicate;
//    10. round trip: JSON save → load and .tabby encode → decode give identical songs; the
//        section 9 v0.4 offsets (channels at 48, rows of 20 bytes at 64 with 16-bit ids and
//        repeat/flags/step length at 16/17/18, CRC over 20..2623, 6-byte block record
//        headers) are checked byte by byte; invalid channel and step-length bytes are
//        rejected on decode; ids above 255 round-trip;
//    10b. loose deduplication: off → distinct blocks; tolerance 4 / 8 / 16 merge the sections
//        whose velocities differ by 6 and 12; the stored block keeps the first velocities;
//        every merge is listed;
//    11. format check: every produced song passes validate(); block size limits; the stub
//        transfer plans every song; 11c: the workbench backend transfer on a fake backend;
//    12. Renoise exports: every .mid in tests/fixtures/ (and renoise*.mid in
//        tests/midi-import/fixtures/): parses, converts, validates, JSON round trip, and the
//        file's division, track layout and warnings are printed; SKIPPED when none exists.
//    15. (Task 09) the Wrong Room rig: wrong-room-all.mid converts with every OUT CH set from
//        the file, the FM6 part pinned to track 8 whatever its order, every event on its
//        channel, no warning of warn severity and none of the four rig kinds; without a rig the
//        v0.5 behaviour (OUT CH null, file order); wrong-room-wrong.mid produces each of the
//        four rig warnings exactly once (channel 13 cleared in the test rig); partDevice names
//        the rig device and a device a track name mentions.
//
//   Run:  /usr/bin/node tests/midi-import/run.mjs      (or: make midi-import-test)
//   Exit status 0 on success; every check prints "ok" or "FAIL".
//
// Version: 0.6
//
// Revision log
//   v0.6  2026-11-05  Task 09: section 15, the Wrong Room rig fixtures and warnings.
//   v0.5  2026-11-02  Task 04: section 13, row events (fixture row-events.mid, pre-roll, version-2
//                     records, decode rejection, the .tabby trailer).
//   v0.4  2026-11-02  Step 4: 11c backend transfer (delete-before-replace, record first, kind-7
//                     batch plan, read-back decode).
//   v0.3  2026-11-02  Section 9 v0.4 layout (16-bit ids, 20-byte rows); loose deduplication
//                     tests; Renoise files also run at tolerances 4, 8 and 16.
//   v0.2  2026-11-02  Section 9 v0.3 layout (row.steps, output channels); Renoise test takes
//                     every file in tests/fixtures/.
//   v0.1  2026-11-02  Initial version.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fixtures } from './make-fixtures.mjs';
import { write, note } from './smf-write.mjs';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..', '..');
const Midi = require(join(root, 'web/import/midi-parse.js'));
const Format = require(join(root, 'web/import/song-format.js'));
const Song = require(join(root, 'web/import/midi-song.js'));
const Transfer = require(join(root, 'web/import/song-transfer.js'));

let failures = 0, checks = 0;
const check = (ok, what, detail = '') => { checks++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const throws = (fn, pattern) => { try { fn(); return false; } catch (e) { return pattern ? pattern.test(e.message) : true; } };
const fx = Object.fromEntries(fixtures().map(f => [f.name, f]));
const importFile = (name, options = {}) => { const a = Song.analyze(Midi.parse(fx[name].bytes)); return { a, ...Song.convert(a, { fileName: name, ...options }) }; };
const warning = (r, kind) => r.warnings.find(w => w.kind === kind);
const produced = [];

// ---- 1. parser --------------------------------------------------------------------------
{
  const p = Midi.parse(fx['bassline-4bar.mid'].bytes);
  check(p.format === 0 && p.division === 480 && p.tracks.length === 1, 'parser: header of bassline-4bar.mid', `format ${p.format}, division ${p.division}`);
  check(p.tracks[0].name === 'Bass' && p.tracks[0].notes.length === 16, 'parser: track name and 16 paired notes');
  const m = Midi.parse(fx['type0-multichannel.mid'].bytes);
  check(same(m.tracks[0].channels, [0, 1, 9]) && m.tracks[0].notes.length === 24, 'parser: running status, three channels in one type 0 track');
  check(throws(() => Midi.parse(Uint8Array.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, 1, 0xe7, 0x28])), /SMPTE/), 'parser: SMPTE division rejected');
  check(throws(() => Midi.parse(Uint8Array.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 2, 0, 1, 1, 0xe0])), /format 2/), 'parser: format 2 rejected');
  check(throws(() => Midi.parse(Uint8Array.from([1, 2, 3])), /MThd/), 'parser: non-MIDI bytes rejected');
  const cut = fx['bassline-4bar.mid'].bytes.slice(0, fx['bassline-4bar.mid'].bytes.length - 20);
  const t = Midi.parse(cut);
  check(t.tracks[0].notes.length > 0 && t.warnings.some(w => w.kind === 'truncated'), 'parser: truncated file keeps the notes read and warns', `${t.tracks[0].notes.length} notes`);
  const vel0 = write({ format: 0, division: 96, tracks: [[{ tick: 0, type: 'noteOn', channel: 0, pitch: 60, velocity: 100 }, { tick: 48, type: 'noteOff', channel: 0, pitch: 60, asNoteOnZero: true }]] });
  check(Midi.parse(vel0).tracks[0].notes[0].endTick === 48, 'parser: note-on velocity 0 closes the note');
  // mf2t text form (what the Renoise tool chain produces before t2mf).
  const mf2t = 'MFile 1 2 96\nMTrk\n0 TimeSig 3/4 24 8\n0 Tempo 500000\n0 Meta TrkEnd\nTrkEnd\nMTrk\n0 Meta TrkName "Lead (00: Felt Piano)"\n0 Meta InstrName "00: Felt Piano / Lead"\n' +
    '0 On ch=1 n=60 v=100\n1 On ch=1 n=c#4 v=90\n96 Off ch=1 n=60 v=0\n96 On ch=1 n=61 v=0\n100 Par ch=1 c=64 v=127\n110 PrCh ch=1 p=5\n120 Pb ch=1 v=9000\n130 Meta Marker "m"\n140 Wobble ch=1\n192 Meta TrkEnd\nTrkEnd\n';
  const tx = Midi.parse(new TextEncoder().encode(mf2t));
  check(tx.text === true && tx.format === 1 && tx.division === 96 && tx.tracks.length === 2 && tx.tracks[1].name === 'Lead (00: Felt Piano)', 'parser: mf2t text header, tracks and names');
  check(same(tx.tracks[1].notes.map(n => [n.tick, n.endTick, n.pitch, n.velocity]), [[0, 96, 60, 100], [1, 96, 61, 90]]), 'parser: mf2t On/Off pairing, note names (c#4 = 61), On v=0 as note-off', JSON.stringify(tx.tracks[1].notes));
  check(same(tx.tracks[1].events.filter(e => /controlChange|programChange|pitchBend|marker/.test(e.type)).map(e => e.type), ['controlChange', 'programChange', 'pitchBend', 'marker']) && tx.tracks[0].events[0].numerator === 3, 'parser: mf2t Par/PrCh/Pb/Marker/TimeSig');
  check(tx.warnings.some(w => w.kind === 'text' && /1 unknown/.test(w.message)), 'parser: unknown mf2t line counted, not fatal');
  check(throws(() => Midi.parse(new TextEncoder().encode('MFile 1 1 96\nMTrk\n1:2:3 On ch=1 n=60 v=1\nTrkEnd\n')), /measure:beat:click/), 'parser: mf2t measure:beat:click times refused');
  check(throws(() => Midi.parse(new TextEncoder().encode('MFile 1 1 -24 40\n')), /SMPTE/), 'parser: mf2t SMPTE division refused');
}

// ---- 2. bass line -----------------------------------------------------------------------
{
  const r = importFile('bassline-4bar.mid'), e = fx['bassline-4bar.mid'].expect;
  produced.push(r.song);
  check(r.a.totalBars === e.bars && r.a.parts.length === 1, 'bassline: 4 bars, one part', `${r.a.totalBars} bars`);
  check(r.song.rows.length === 1 && r.song.blocks.length === 1 && r.song.rows[0].repeat === 1, 'bassline: one row, one block');
  const got = r.song.blocks[0].notes.map(n => ({ step: n.step, pitch: n.pitch, velocity: n.velocity, length: n.length / 480 }));
  check(same(got, e.notes) && r.song.blocks[0].notes.every(n => n.offset === 0), 'bassline: notes exact (step, pitch, velocity, length in whole steps, offset 0)');
  check(r.song.tempo === 120 && r.warnings.length === 0, 'bassline: tempo 120, no warnings', JSON.stringify(r.warnings.map(w => w.kind)));
}

// ---- 3. 64-bar multitrack, deduplication ------------------------------------------------
{
  const r = importFile('multitrack-64bar.mid'), e = fx['multitrack-64bar.mid'].expect;
  produced.push(r.song);
  check(r.a.format === 1 && r.a.totalBars === 64 && r.a.parts.length === 3, 'multitrack: type 1, 64 bars, 3 parts', `${r.a.totalBars} bars, ${r.a.parts.length} parts`);
  check(r.a.parts[0].drums && r.a.parts[0].name === 'Drums' && r.a.parts[2].name === 'Chords', 'multitrack: part names and drum flag');
  check(r.stats.rowsBeforeMerge === e.rowsBeforeMerge && r.stats.cellsBeforeDedup === e.cells, 'multitrack: 16 rows × 3 cells before deduplication');
  check(r.song.blocks.length === e.blocks, 'multitrack: 6 distinct blocks after deduplication', `${r.song.blocks.length}`);
  check(r.song.rows.length === e.rows && same(r.song.rows.map(x => x.repeat), e.repeats), 'multitrack: rows merged ' + e.order + ' → ' + e.repeats.join(','), JSON.stringify(r.song.rows.map(x => x.repeat)));
  // Lossless: expand the song and compare with the pre-deduplication grid.
  const expanded = []; for (const row of Format.grid(r.song)) for (let i = 0; i < 0; i++) expanded.push(row);
  const byId = new Map(r.song.blocks.map(b => [b.id, b.notes]));
  const unrolled = r.song.rows.flatMap(row => Array.from({ length: row.repeat }, () => row.blocks.map(id => id ? byId.get(id) : [])));
  check(same(unrolled, r.grid.map(cells => cells.map(Format.sortNotes))), 'multitrack: unrolling rows reproduces the original grid');
  check(r.song.rows.every(row => row.blocks[0] && row.blocks[1] && row.blocks[2] && !row.blocks[3]), 'multitrack: tracks 1-3 filled, 4-8 silent');
  check(r.stats.poolPercent < 1 && r.stats.idPercent < 1, 'multitrack: pool use small', `${r.stats.recordBytes} B, ${r.stats.idPercent.toFixed(2)} % ids`);
}

// ---- 4. pad under melody ----------------------------------------------------------------
{
  const r = importFile('pad-melody.mid'), e = fx['pad-melody.mid'].expect;
  produced.push(r.song);
  check(r.song.rows.length === e.rows && r.song.rows[0].repeat === 2 && r.song.blocks.length === 1, 'pad-melody: 8 identical bars → one row ×2, one block');
  const b = r.song.blocks[0].notes, step0 = b.filter(n => n.step === 0);
  check(step0.length === e.notesPerStep0, 'pad-melody: 4 notes on step 0 (3 pad + melody)', `${step0.length}`);
  check(step0.filter(n => n.length === 16 * 480).length === 3 && step0.filter(n => n.length === 2 * 480).length === 1, 'pad-melody: pad notes 16 steps, melody 2 steps on the same step');
  check(b.filter(n => n.step === 16 && n.length === 16 * 480).length === 3, 'pad-melody: pad re-struck each bar while the melody runs');
  check(!warning(r, 'overflowDropped') && !warning(r, 'overlapClipped'), 'pad-melody: nothing dropped or clipped');
}

// ---- 5. six notes on one step -----------------------------------------------------------
{
  const e = fx['five-notes.mid'].expect;
  for (const [rule, kept] of [['loudest', e.keptLoudest], ['highest', e.keptHighest], ['lowest', e.keptLowest]]) {
    const r = importFile('five-notes.mid', { overflowRule: rule });
    if (rule === 'loudest') produced.push(r.song);
    const pitches = r.song.blocks[0].notes.filter(n => n.step === 0).map(n => n.pitch).sort((a, b) => a - b);
    check(same(pitches, kept), `five-notes: rule ${rule} keeps ${kept.join(' ')}`, pitches.join(' '));
    check(warning(r, 'overflowDropped')?.count === e.dropped, `five-notes: ${e.dropped} drops reported (${rule})`);
  }
}

// ---- 6. off-grid: exact by default (Task 05), quantize as an option -----------------------
{
  const e = fx['offgrid.mid'].expect, parsed = Midi.parse(fx['offgrid.mid'].bytes), src = parsed.tracks[0].notes;   /* 480 PPQ: 4 units a tick */
  const r = importFile('offgrid.mid');
  produced.push(r.song);
  const notes = r.song.blocks[0].notes;
  check(same(notes.map(n => n.step), e.starts), 'offgrid: anchored to the nearest step, the exact half-step tie to the earlier step', notes.map(n => n.step).join(' '));
  check(same(notes.map(n => n.step * 480 + n.offset), src.map(n => n.tick * 4)) && same(notes.map(n => n.length), src.map(n => (n.endTick - n.tick) * 4)), 'offgrid: every start and length exact in units (no quantizing by default)', notes.map(n => n.offset + '/' + n.length).join(' '));
  check(same(notes.map(n => n.offset), [-160, 120, 240, -236, 0, 0]), 'offgrid: offsets -160, +120, +240 (tie), -236, 0, 0 units', notes.map(n => n.offset).join(' '));
  check(!warning(r, 'moved') && !warning(r, 'lengthMin') && !warning(r, 'lengthRounded') && r.stats.offsets === 4 && r.stats.fractionalLengths === 2, 'offgrid: nothing reported as moved or rounded; stats count 4 offsets and 2 fractional lengths', JSON.stringify(r.warnings.map(w => [w.kind, w.count])));
  for (const rule of ['nearest', 'up', 'down']) {
    const q = importFile('offgrid.mid', { quantize: 'startsEnds', lengthRule: rule });
    const qn = q.song.blocks[0].notes;
    check(same(qn.map(n => n.step), e.starts) && qn.every(n => n.offset === 0), `offgrid: quantize starts+ends, rule ${rule}: starts on the grid`);
    check(same(qn.map(n => n.length / 480), e.lengths[rule]), `offgrid: quantize starts+ends, lengths with rule ${rule}`, qn.map(n => n.length / 480).join(' '));
  }
  const q = importFile('offgrid.mid', { quantize: 'startsEnds' });
  check(warning(q, 'moved')?.count === e.moved && warning(q, 'lengthMin')?.count === 1, 'offgrid: quantize reports 4 moved starts and 1 minimum length', JSON.stringify(q.warnings.map(w => [w.kind, w.count])));
  const qs = importFile('offgrid.mid', { quantize: 'starts' });
  check(qs.song.blocks[0].notes.every(n => n.offset === 0) && same(qs.song.blocks[0].notes.map(n => n.length), src.map(n => (n.endTick - n.tick) * 4)) && warning(qs, 'moved')?.count === e.moved && !warning(qs, 'lengthRounded'), 'offgrid: quantize starts only keeps the exact lengths');
  check(throws(() => importFile('offgrid.mid', { quantize: 'ends' }), /quantize/), 'offgrid: an unknown quantize mode is refused');
}

// ---- 7. waltz 3/4 -----------------------------------------------------------------------
{
  const r = importFile('waltz-3-4.mid'), e = fx['waltz-3-4.mid'].expect;
  produced.push(r.song);
  check(r.a.barSteps === e.barSteps && r.a.rowSteps.default === e.rowSteps && r.a.rowSteps.aligned, 'waltz: 12-step bars, default row 48 steps', `${r.a.barSteps}, ${r.a.rowSteps.default}`);
  check(same(r.a.rowSteps.candidates.map(c => c.steps), [48]), 'waltz: 48 is the only aligned row length');
  check(r.song.rows.every(x => x.steps === 48) && r.stats.rowsBeforeMerge === e.rowsBeforeMerge && r.song.rows.length === 1 && r.song.rows[0].repeat === 2, 'waltz: 8 bars → 2 rows of 4 bars (48 steps each) → one row ×2');
  check(r.song.blocks[0].notes.every(n => n.step < 48) && r.song.blocks[0].notes.filter(n => n.step % 12 === 0).length === 4, 'waltz: notes inside 48 steps, one bass note per bar');
  check(r.song.tempo === e.tempo, 'waltz: tempo 140');
  const v = Format.validate(r.song);
  check(v.ok && v.warnings.length === 0, 'waltz: valid without warnings', JSON.stringify(v.warnings));
  const file = Format.encodeFile(r.song), back = Format.decodeFile(file);
  check(file[64 + 18] === 48 && back.rows[0].steps === 48 && back.rows[0].repeat === 2, 'waltz: step length 48 written at row byte 18 and read back');
  const r64 = importFile('waltz-3-4.mid', { rowSteps: 64 });
  check(r64.song.rows.length === 2 && r64.song.rows.every(x => x.steps === 64), 'waltz: forcing 64-step rows gives 2 unequal rows (96 steps)');
}

// ---- 8. tempo / CC / program ------------------------------------------------------------
{
  const r = importFile('tempo-cc-program.mid'), e = fx['tempo-cc-program.mid'].expect;
  produced.push(r.song);
  check(r.song.tempo === e.tempo && Math.abs(r.a.tempo.exact - e.tempoExact) < 0.01, 'events: first tempo 127.5 → 128', `${r.a.tempo.exact} → ${r.song.tempo}`);
  check(warning(r, 'tempoRounded') && warning(r, 'tempoChangesIgnored')?.count === e.tempoChanges, 'events: rounding and 2 real tempo changes reported (repeat of the same tempo not counted)');
  check(warning(r, 'ccIgnored') && r.a.ignored.controlChange === e.cc && r.a.ignored.sustain === e.sustain, 'events: 8 CCs counted, 1 sustain');
  /* v0.6 (Task 09): the PC at tick 0 is a row event; only the mid-row PC 81 is listed as dropped (the
   * earlier expectation of two listed PCs rested on a bookkeeping bug, fixed in midi-song.js v0.6). */
  check(r.a.ignored.programChange.length === e.programs && warning(r, 'programIgnored')?.count === 1 && /program 82/.test(warning(r, 'programIgnored').items[0].text) && r.song.events.some(x => x.type === 0 && x.d0 === 33),
    'events: 2 program changes in the file; the one at the row start became an event, the mid-row one is listed as dropped with its 1-based number', JSON.stringify(warning(r, 'programIgnored') && warning(r, 'programIgnored').items));
  check(r.a.ignored.pitchBend === e.bend && r.a.ignored.channelPressure === e.pressure && r.a.ignored.sysex === e.sysex, 'events: bend, pressure, SysEx counted');
  check(r.stats.notesOut === e.notes && r.song.blocks.length === 1, 'events: all 16 notes kept in one block');
}

// ---- 9. long notes ----------------------------------------------------------------------
{
  const r = importFile('long-notes.mid'), e = fx['long-notes.mid'].expect;
  produced.push(r.song);
  const notes = r.song.blocks[0].notes.map(n => ({ step: n.step, pitch: n.pitch, length: n.length / 480, velocity: n.velocity }));
  /* Task 05: a 300-step note is no longer clipped to 255 (lengths reach 17476 steps; 144000 units is exact at exponent 2). */
  const want = e.notes.map(n => [n.step, n.pitch, n.length === 255 ? 300 : n.length]);
  check(same(notes.map(n => [n.step, n.pitch, n.length]), want), 'long: the 300-step note kept, overlap clipped, duplicate removed', JSON.stringify(notes));
  check(notes[3].velocity === 110, 'long: the louder duplicate survives');
  check(!warning(r, 'lengthClipped') && !warning(r, 'lengthScaled') && warning(r, 'overlapClipped')?.count === e.overlap && warning(r, 'duplicateDropped')?.count === e.duplicate, 'long: overlap and duplicate warnings with count 1, no length clip', JSON.stringify(r.warnings.map(w => [w.kind, w.count])));
  check(r.a.totalBars === e.bars && r.song.rows.length === 2 && r.song.rows[0].repeat === 1 && r.song.rows[1].repeat === 4 && r.song.rows[1].blocks.every(id => id === 0), 'long: 19 bars = 5 rows; the 4 silent rows (the 255-step note rings on) merge into one empty row ×4', `${r.song.rows.length} rows: ${r.song.rows.map(x => x.repeat + '×' + x.blocks[0]).join(' ')}`);
}

// ---- 10. round trips ----------------------------------------------------------------------
{
  const r = importFile('multitrack-64bar.mid', { outChannels: [9, 0, 1, null, null, null, null, null], name: 'Round Trip', projectSlot: 3, loop: true });
  const json = Format.toJSON(r.song), back = Format.fromJSON(json);
  check(Format.toJSON(back) === json, 'round trip: JSON save → load → save is byte-identical');
  check(same(back.outChannels, [9, 0, 1, null, null, null, null, null]) && back.rows.every(x => x.steps === 64) && back.name === 'ROUND TRIP  ', 'round trip: channels, row length and name survive JSON');
  const v1 = JSON.parse(json); delete v1.rows[0].steps; v1.rowSteps = 48;
  check(Format.fromJSON(JSON.stringify(v1)).rows[0].steps === 48 && Format.fromJSON(JSON.stringify(v1)).rowSteps === undefined, 'round trip: v0.1 JSON (song.rowSteps) loads into row.steps');
  const file = Format.encodeFile(r.song), decoded = Format.decodeFile(file);
  const strip = s => ({ name: s.name, projectSlot: s.projectSlot, tempo: s.tempo, loop: s.loop, jumpMode: s.jumpMode, loopRow: s.loopRow, outChannels: s.outChannels, rows: s.rows, blocks: s.blocks.map(b => ({ id: b.id, notes: Format.sortNotes(b.notes) })) });
  check(same(strip(decoded), strip(r.song)), 'round trip: .tabby encode → decode reproduces rows and blocks', `${file.length} bytes`);
  check(file.length === 4096 + r.stats.recordBytes && same(Array.from(file.subarray(4096, 4102)), [0, 1, 1, 0, file[4100], file[4101]]), 'round trip: .tabby size = record + aligned block records; 6-byte record header (song 0, format 1, id u16, length u16)');
  /* Task 05: a tabby-song/1 JSON (lengths in steps, no offsets) upgrades on load. */
  const old = { schema: 'tabby-song/1', name: 'OLD JSON    ', projectSlot: 0, tempo: 0, loop: false, jumpMode: 'bar', loopRow: 0, outChannels: [null, null, null, null, null, null, null, null],
    rows: [{ blocks: [1, 0, 0, 0, 0, 0, 0, 0], repeat: 1, loopHere: false, steps: 64 }], blocks: [{ id: 1, notes: [[0, 60, 100, 2], [4, 62, 90, 1, 1]] }], events: [] };
  const up = Format.fromJSON(JSON.stringify(old));
  check(up.schema === 'tabby-song/2' && up.swing === false && same(up.blocks[0].notes.map(n => [n.step, n.pitch, n.offset, n.length, n.retrigger]), [[0, 60, 0, 960, false], [4, 62, 0, 480, true]]), 'round trip: tabby-song/1 JSON upgrades to units (offset 0, length × 480) and swing off');
  /* Task 05: a v1 .tabby (format-0 block records) decodes to the same notes; swing flag bit 2 round-trips. */
  const v1file = Format.encodeFile(up);
  const v1payload = Uint8Array.from([1, 60, 100, 2, 0, 0, 0, 1, 62, 90 | 128, 1, ...new Array(59).fill(0)]);
  const v1full = new Uint8Array(4096 + ((6 + v1payload.length + 3) & ~3)).fill(0xff); v1full.set(v1file.subarray(0, 4096)); v1full.set([0, 0, 1, 0, v1payload.length & 255, v1payload.length >> 8], 4096); v1full.set(v1payload, 4102);
  const fromV1 = Format.decodeFile(v1full);
  check(same(Format.sortNotes(fromV1.blocks[0].notes), Format.sortNotes(up.blocks[0].notes)), 'round trip: a .tabby with format-0 block records reads as timed notes (offset 0, whole steps)');
  const sw = Format.fromJSON(JSON.stringify(old)); sw.swing = true;
  const swFile = Format.encodeFile(sw);
  check((swFile[37] & 4) === 4 && Format.decodeFile(swFile).swing === true && Format.decodeFile(Format.encodeFile(up)).swing === false, 'round trip: song swing flag is record flags bit 2');
  const v = new DataView(file.buffer);
  check(v.getUint32(0, true) === 0x47314d46 && v.getUint32(16, true) === 0 && file[36] === 3 && (file[37] & 1) === 1 && v.getUint16(38, true) === 120 && file[40] === r.song.rows.length && file[41] === 0, 'round trip: record header fields at the section 9.5 offsets (byte 41 reserved 0)');
  check(same(Array.from(file.subarray(48, 64)), [10, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 'round trip: output channels at offset 48 as 1..16 (0 = device), reserved 56..63 zero', Array.from(file.subarray(48, 64)).join(' '));
  const row0 = Array.from(file.subarray(64, 84));
  const ids16 = Array.from({ length: 8 }, (_, t) => row0[2 * t] | row0[2 * t + 1] << 8);
  check(same(ids16, r.song.rows[0].blocks) && row0[16] === r.song.rows[0].repeat && row0[17] === 0 && row0[18] === 64 && row0[19] === 0, 'round trip: row 0 at offset 64 is 20 bytes: 8 × u16 ids, repeat, flags, step length 64, reserved', row0.join(' '));
  check(file.subarray(64 + 20 * r.song.rows.length, 2624).every(b => b === 0) && file.subarray(2624, 4096).every(b => b === 0xff), 'round trip: unused rows zero, 2624..4095 is 0xFF');
  check(v.getUint32(12, true) === Format.crc32(file.subarray(20, 2624)), 'round trip: record CRC over bytes 20..2623');
  const reseal = img => { new DataView(img.buffer).setUint32(12, Format.crc32(img.subarray(20, 2624)), true); return img; };
  const badCh = reseal(file.slice(0, 4096)); badCh[48] = 17; reseal(badCh);
  check(throws(() => Format.decodeRecord(badCh), /output channel byte 17/), 'round trip: channel byte 17 rejected on decode');
  const zeroSteps = file.slice(0, 4096); zeroSteps[64 + 18] = 0; reseal(zeroSteps);
  check(Format.decodeRecord(zeroSteps).rows[0].steps === 64, 'round trip: step-length byte 0 reads as 64');
  const badSteps = file.slice(0, 4096); badSteps[64 + 18] = 20; reseal(badSteps);
  check(throws(() => Format.decodeRecord(badSteps), /step length 20/), 'round trip: step-length byte 20 rejected on decode');
  // 16-bit ids: renumber a block to 300 and round-trip through the record and the file.
  const wide = Format.fromJSON(json); const oldId = wide.blocks[0].id; wide.blocks[0].id = 300;
  wide.rows.forEach(row => { row.blocks = row.blocks.map(id => id === oldId ? 300 : id); });
  const wideFile = Format.encodeFile(wide), wideBack = Format.decodeFile(wideFile);
  const firstRowWith300 = wide.rows.findIndex(row => row.blocks.includes(300)), tr = wide.rows[firstRowWith300].blocks.indexOf(300);
  check(wideFile[64 + 20 * firstRowWith300 + 2 * tr] === 44 && wideFile[64 + 20 * firstRowWith300 + 2 * tr + 1] === 1 && same(wideBack.rows, wide.rows) && wideBack.blocks.some(b => b.id === 300), 'round trip: block id 300 stored as 2C 01 in the row and in the 6-byte record header');
  const odd = Format.fromJSON(json); odd.rows[0].steps = 16;
  check(!Format.validate(odd).ok === false && Format.validate(odd).warnings.some(w => /never plays/.test(w)), 'validate: a 16-step row over a block with later notes warns');
  odd.rows[0].steps = 20;
  check(!Format.validate(odd).ok && /16, 32, 48 or 64/.test(Format.validate(odd).errors[0]), 'validate: step length 20 rejected');
  const corrupt = file.slice(); corrupt[100] ^= 1;
  check(throws(() => Format.decodeFile(corrupt), /CRC/), 'round trip: corrupted record rejected');
}

// ---- 11. format check and the stub transfer ----------------------------------------------
{
  check(produced.every(s => Format.validate(s).ok), 'format: every produced song passes validate()', `${produced.length} songs`);
  check(Format.encodeBlock({ notes: [] }).length === 64, 'format: empty block is 64 bytes');
  const full = { notes: Array.from({ length: 256 }, (_, i) => ({ step: i >> 2, pitch: (i & 3) * 20 + 1, velocity: 100, offset: (i % 5) - 2, length: 1 + i })) };
  check(Format.encodeBlock(full).length === 1600 && Format.decodeBlock(Format.encodeBlock(full)).notes.length === 256 && same(Format.sortNotes(Format.decodeBlock(Format.encodeBlock(full)).notes).map(n => [n.offset, n.length]), Format.sortNotes(full.notes.map(n => ({ ...n, retrigger: false }))).map(n => [n.offset, n.length])), 'format: full block is 1600 bytes and decodes with its offsets and lengths');
  check(throws(() => Format.encodeBlock({ notes: [{ step: 0, pitch: 60, velocity: 100, length: 1 }, { step: 0, pitch: 60, velocity: 90, length: 2 }] }), /twice/), 'format: same pitch twice on a step rejected');
  check(throws(() => Format.encodeBlock({ notes: Array.from({ length: 5 }, (_, i) => ({ step: 0, pitch: 60 + i, velocity: 100, length: 1 })) }), /max 4/), 'format: 5 notes on a step rejected');
  check(throws(() => Format.encodeBlock({ notes: [{ step: 0, pitch: 60, velocity: 0, length: 1 }] }), /velocity/) && throws(() => Format.encodeBlock({ notes: [{ step: 0, pitch: 60, velocity: 1, length: 0 }] }), /length/) && throws(() => Format.encodeBlock({ notes: [{ step: 0, pitch: 60, velocity: 1, length: 1, offset: 241 }] }), /offset/), 'format: velocity 0, length 0 and offset 241 rejected');
  const bad = Format.emptySong('x'); bad.rows = [{ blocks: [7, 0, 0, 0, 0, 0, 0, 0], repeat: 1 }];
  check(!Format.validate(bad).ok && /missing block 7/.test(Format.validate(bad).errors[0]), 'format: row referencing a missing block rejected');
  const stub = Transfer.select({});
  const plans = await Promise.all(produced.map(s => stub.plan(s, 0)));
  check(stub.name === 'stub' && !stub.real && plans.every(p => p.record.bytes === 4096 && p.blocks.length > 0), 'transfer: stub plans every song (record + blocks)');
  const w = await stub.write(2, produced[1], {});
  check(w.sent === false && /Nothing was written/.test(w.message) && w.blocks.every(b => b.target >> 16 === 2 && (b.target & 0xffff) === b.id), 'transfer: stub write reports and sends nothing; targets (song<<16)|id', w.message);
  check((await stub.exists(0)).empty === 'unknown', 'transfer: stub cannot tell whether a slot is used');
  // ---- 10b. loose deduplication --------------------------------------------------------
  {
    // Three 4-bar sections with identical notes; velocities 100 / 106 / 112 (steps of 6).
    const t = [{ tick: 0, type: 'tempo', bpm: 120 }];
    for (let section = 0; section < 3; section++) for (let s = 0; s < 64; s += 4) note(t, (section * 64 + s) * 24, 24, 48 + (s / 4) % 8, 100 + section * 6, 0);
    note(t, 3 * 64 * 24, 24, 48, 100, 0);          // a 4th section that differs in notes: never merged
    const a = Song.analyze(Midi.parse(write({ format: 0, division: 96, tracks: [t] })));
    const off = Song.convert(a, {});
    check(off.song.blocks.length === 4 && !warning(off, 'looseMerged'), 'loose off: 4 distinct blocks', `${off.song.blocks.length}`);
    const t4 = Song.convert(a, { looseDedup: true, velocityTolerance: 4 });
    check(t4.song.blocks.length === 4 && !warning(t4, 'looseMerged'), 'loose ±4: velocities 6 apart stay separate');
    const t8 = Song.convert(a, { looseDedup: true, velocityTolerance: 8 });
    check(t8.song.blocks.length === 3 && warning(t8, 'looseMerged')?.count === 1 && same(t8.song.rows.map(x => x.blocks[0]), [1, 2, 3]) && t8.song.rows.length === 3, 'loose ±8: section 2 (diff 6) merges into block 1; section 3 (diff 12 from block 1) stays', `${t8.song.blocks.length} blocks, rows ${t8.song.rows.map(x => x.repeat + '×' + x.blocks[0]).join(' ')}`);
    check(t8.song.blocks[0].notes.every(n => n.velocity === 100) && t8.song.rows[0].repeat === 2, 'loose ±8: shared block keeps the first section\'s velocities; rows 1-2 merge into one row ×2');
    check(/row 2 .*block 1, largest velocity difference 6/.test(warning(t8, 'looseMerged').items[0].text), 'loose ±8: the merge is listed with row, block and difference', warning(t8, 'looseMerged').items[0].text);
    const t16 = Song.convert(a, { looseDedup: true, velocityTolerance: 16 });
    check(t16.song.blocks.length === 2 && warning(t16, 'looseMerged')?.count === 2 && t16.song.rows.length === 2 && t16.song.rows[0].repeat === 3 && t16.stats.looseMerges === 2, 'loose ±16: sections 1-3 share block 1 (row ×3), section 4 separate');
    check(Format.validate(t16.song).ok && t16.song.source.velocityTolerance === 16, 'loose: result valid and the tolerance is recorded in song.source');
  }
  // Limits: 129 distinct rows must be refused; 256 distinct blocks are fine (16-bit ids);
  // more than 2048 blocks is refused by validate().
  const many = [{ tick: 0, type: 'tempo', bpm: 120 }];
  for (let bar = 0; bar < 129 * 4; bar++) note(many, bar * 16 * 96 / 4, 96 / 4, 36 + (bar % 60), 100, 0);
  check(throws(() => Song.convert(Song.analyze(Midi.parse(write({ format: 0, division: 96, tracks: [many] })))), /128/), 'limits: more than 128 rows refused with a message');
  const big = [{ tick: 0, type: 'tempo', bpm: 120 }];
  for (let row = 0; row < 64; row++) for (let t = 0; t < 4; t++) note(big, row * 64 * 24 + t * 24, 24, 24 + row + t * 20, 100, t);
  const bigSong = Song.convert(Song.analyze(Midi.parse(write({ format: 0, division: 96, tracks: [big] })))).song;
  check(bigSong.blocks.length === 256 && Format.validate(bigSong).ok && Format.decodeFile(Format.encodeFile(bigSong)).blocks.length === 256, 'limits: 256 distinct blocks accepted and round-trip with 16-bit ids');
  const tooMany = Format.emptySong('x'); tooMany.blocks = Array.from({ length: 2049 }, (_, i) => ({ id: i + 1, notes: [{ step: 0, pitch: 60, velocity: 100, length: 1 }] })); tooMany.rows = [{ blocks: [1, 0, 0, 0, 0, 0, 0, 0], repeat: 1, steps: 64 }];
  check(!Format.validate(tooMany).ok && /max 2048/.test(Format.validate(tooMany).errors[0]), 'limits: 2049 blocks rejected by validate()');
  // ---- 11c. the workbench backend transfer (Step 4): delete-before-replace, record first,
  // kind-7 batches cut like sdk/WebUpdate.js songBatches(), read() decodes the slot ---------
  {
    const log = [], store = new Map();
    const fake = progress => ({
      exists: async slot => store.get(slot)?.record ?? null,
      remove: async slot => { log.push('remove ' + slot); store.delete(slot); },
      write: async (slot, record, blocks) => { const replaced = store.has(slot); log.push('write ' + slot + ' record then ' + blocks.size + ' blocks'); store.set(slot, { record, blocks }); progress?.(1); return { replaced }; },
      read: async slot => store.get(slot) ?? null,
      status: async () => ({ free: 391296, reclaimable: 0, state: 0 }),
    });
    const dev = Transfer.select({ backend: fake, name: () => 'device' });
    check(dev.real && dev.name === 'device' && (await dev.describe()).real, 'backend: selected when a backend is given');
    check((await dev.exists(3)).empty === true, 'backend: empty slot reported empty');
    const song = produced[1], first = await dev.write(3, song, { progress: () => {} });
    check(first.sent && !first.replaced && same(log, ['write 3 record then ' + song.blocks.length + ' blocks']), 'backend: first write = record + blocks through the workbench path, no delete', log.join('; '));
    const e = await dev.exists(3);
    check(e.empty === false && e.rows === song.rows.length && e.blocks === new Set(song.rows.flatMap(r => r.blocks).filter(Boolean)).size && e.name === song.name.trim(), 'backend: occupied slot reports name, rows, distinct blocks', JSON.stringify(e));
    log.length = 0;
    const second = await dev.write(3, song, {});
    check(second.replaced && same(log, ['write 3 record then ' + song.blocks.length + ' blocks']) && /deleted first by the workbench/.test(second.message), 'backend: rewrite goes through the workbench write only (which deletes first); no delete of its own', log.join('; '));
    const img = Format.encodeRecord(song); img[38] = 20; img[39] = 0; new DataView(img.buffer).setUint32(12, Format.crc32(img.subarray(20, 2624)), true);
    check(throws(() => Format.decodeRecord(img), /tempo override 20/), 'format: tempo override 20 rejected on decode (as the device does)');
    const back = await dev.read(3);
    check(back && same(Format.encodeFile(back), Format.encodeFile(song)), 'backend: read() returns the written song (identical .tabby bytes)');
    const plan = await dev.plan(bigSong, 0);
    const sizes = plan.batches.map(b => b.bytes), fits = plan.batches.every(b => { let fill = 0, sectors = 1; for (const id of b.blocks) { const sz = (6 + plan.blocks.find(x => x.id === id).bytes + 3) & ~3; if (fill + sz > 4076) { sectors++; fill = 0; } fill += sz; } return sectors <= 8 && b.bytes <= 32608; });
    check(plan.batches.length >= 1 && fits && plan.batches.reduce((n, b) => n + b.blocks.length, 0) === bigSong.blocks.length && sizes.every(x => x % 4 === 0), 'backend: plan cuts kind-7 batches of at most 8 sectors / 32608 bytes covering every block', `${plan.batches.length} batch(es): ${sizes.join(', ')} bytes`);
    const none = Transfer.select({ backend: () => { throw new Error('not connected'); } });
    check((await none.exists(0)).empty === 'unknown' && /not connected/.test((await none.exists(0)).reason), 'backend: unconnected target reports unknown with the reason');
  }
}

// ---- 12. Renoise exports -----------------------------------------------------------------
{
  const dirs = [join(root, 'tests/fixtures'), join(here, 'fixtures')];
  const files = dirs.flatMap(d => existsSync(d) ? readdirSync(d).filter(n => /\.midi?$/i.test(n) && (d.endsWith('tests/fixtures') || /renoise/i.test(n))).map(n => join(d, n)) : []);
  if (!files.length) console.log('SKIP renoise: no .mid in tests/fixtures/');
  for (const path of files) {
    const name = path.replace(root + '/', '');
    try {
      const p = Midi.parse(readFileSync(path)), a = Song.analyze(p);
      console.log(`     ${name}: format ${p.format}, division ${p.division}, ${p.tracks.length} tracks, ${a.parts.length} parts, ${a.totalBars} bars of ${a.meter.numerator}/${a.meter.denominator}, tempo ${a.tempo.exact.toFixed(3)} → ${a.tempo.bpm}` +
        (a.tempo.changes.length ? `, ${a.tempo.changes.length} tempo change(s)` : '') + (a.meter.changes.length ? `, ${a.meter.changes.length} meter change(s)` : '') + (p.warnings.length ? `, file warnings: ${p.warnings.map(w => w.kind).join(',')}` : ''));
      for (const part of a.parts) console.log(`       part ${part.key} "${part.name}" ${part.noteCount} notes ${part.low}-${part.high} bars ${part.firstBar}-${part.lastBar}${part.programs.length ? ' programs ' + part.programs.map(x => x + 1).join(',') : ''}`);
      const ig = a.ignored; console.log(`       ignored: cc ${ig.controlChange} (sustain ${ig.sustain}), bend ${ig.pitchBend}, pressure ${ig.polyPressure + ig.channelPressure}, program ${ig.programChange.length}, sysex ${ig.sysex}, meta ${ig.meta}, markers ${ig.markers.length}`);
      check(a.parts.length > 0 && !a.errors.length, `renoise ${name}: parses into parts`);
      const r = Song.convert(a, { fileName: name });
      produced.push(r.song);
      check(Format.validate(r.song).ok, `renoise ${name}: converted song is valid`, `${r.song.rows.length} rows (from ${r.stats.rowsBeforeMerge}), ${r.song.blocks.length} blocks from ${r.stats.cellsBeforeDedup} cells, ${r.stats.notesOut}/${r.stats.notesIn} notes, ${r.stats.recordBytes} B`);
      console.log('       warnings: ' + (r.warnings.map(w => w.kind + '×' + w.count).join(', ') || 'none'));
      for (const w of r.warnings.filter(w => w.severity === 'warn' && w.items.length)) console.log('         ' + w.kind + ': ' + w.items.slice(0, 3).map(it => (it.track ? 'T' + it.track + ' ' : '') + it.text).join(' | '));
      const counts = [4, 8, 16].map(tol => { const x = Song.convert(a, { fileName: name, looseDedup: true, velocityTolerance: tol }); return { tol, blocks: x.song.blocks.length, merges: x.stats.looseMerges, rows: x.song.rows.length, ok: Format.validate(x.song).ok }; });
      console.log(`       blocks: loose off ${r.song.blocks.length}; ` + counts.map(c => `±${c.tol} → ${c.blocks} (${c.merges} merges, ${c.rows} rows)`).join('; '));
      check(counts.every(c => c.ok && c.blocks <= r.song.blocks.length) && counts[0].blocks >= counts[1].blocks && counts[1].blocks >= counts[2].blocks, `renoise ${name}: loose mode valid and monotonic in the tolerance`);
      check(Format.toJSON(Format.fromJSON(Format.toJSON(r.song))) === Format.toJSON(r.song), `renoise ${name}: JSON round trip`);
      const file = Format.encodeFile(r.song);
      check(same(Format.decodeFile(file).rows, r.song.rows), `renoise ${name}: .tabby round trip`, `${file.length} bytes`);
      /* Task 05: zero timing changes. Every note of the file (96 PPQ: 20 units a tick) is in
       * the song at exactly its start and length, found by (track, time, pitch). */
      const upt = 1920 / p.division, byId = new Map(r.song.blocks.map(b => [b.id, b]));
      const got = new Map(); let rowStart = 0;
      for (const row of r.song.rows) for (let rep = 0; rep < row.repeat; rep++) { row.blocks.forEach((id, t) => { if (!id) return; for (const n of byId.get(id).notes) if (n.step < row.steps) got.set(t + ':' + ((rowStart + n.step) * 480 + n.offset) + ':' + n.pitch, n.length); }); rowStart += row.steps; }
      let mismatched = 0, total = 0;
      a.parts.slice(0, 8).forEach((part, t) => { for (const n of part.notes) { total++; const L = got.get(t + ':' + n.tick * upt + ':' + n.pitch); if (L === undefined || L !== (n.endTick - n.tick) * upt) mismatched++; } });
      /* The only timing changes allowed are the reported ones: same-pitch overlaps clipped
       * (a file bug Renoise exports: a note held into its own retrigger), duplicates, overflow. */
      const allowed = (warning(r, 'overlapClipped')?.count || 0) + (warning(r, 'duplicateDropped')?.count || 0) + (warning(r, 'overflowDropped')?.count || 0);
      check(p.division === 96 && mismatched === allowed && total === r.stats.notesOut + (warning(r, 'duplicateDropped')?.count || 0) + (warning(r, 'overflowDropped')?.count || 0), `renoise ${name}: every note start and length exact (96 PPQ) apart from the reported overlap clips`, `${total} notes, ${mismatched} changed = ${allowed} reported, ${r.stats.offsets} with offsets, ${r.stats.fractionalLengths} fractional lengths, largest offset ${r.stats.maxOffsetUnits} units`);
      check(!warning(r, 'moved') && !warning(r, 'lengthRounded') && !warning(r, 'ppqRounded'), `renoise ${name}: no timing warning`);
    } catch (error) { check(false, `renoise ${name}: ${error.message}`); }
  }
}

// ---- 13. row events (Task 04, section 9.11 v0.6) --------------------------------------------
{
  const bytes = readFileSync(join(here, 'fixtures', 'row-events.mid'));
  const a = Song.analyze(Midi.parse(new Uint8Array(bytes)));
  const r = Song.convert(a, { name: 'EVENTS' }), ev = r.song.events;
  const sig = ev.map(e => [e.row, e.channel, e.type, e.d0, e.d1, e.d2].join('/')).join(' ');
  check(ev.length === 5 && sig === '0/0/0/5/0/0 0/1/2/7/100/0 0/2/1/1/2/9 1/0/0/6/0/0 1/0/0/7/0/0',
    'events: PC, CC and bank+PC at row 1; the pre-rolled PC 6 and PC 7 at row 2; mid-row CC dropped', sig);
  check(warning(r, 'ccIgnored')?.count === 1 && warning(r, 'bankWithoutProgram')?.count === 1 && warning(r, 'rowEvents')?.count === 5, 'events: the mid-row CC and the lone bank select are listed as dropped');
  check(r.song.rows.length === 2 && r.song.rows.every(x => x.repeat === 1), 'events: rows with events are not merged into repeats');
  const none = Song.convert(a, { name: 'EVENTS', preRoll: 'none' }).song.events;
  check(none.length === 4 && !none.some(e => e.d0 === 6 && e.type === 0), 'events: pre-roll none drops the PC a beat before row 2', none.length + ' events');
  const bar = Song.convert(a, { name: 'EVENTS', preRoll: 'bar' }).song.events;
  check(bar.length === 5, 'events: pre-roll bar keeps the same five');
  const img = Format.encodeRecord(r.song);
  check(new DataView(img.buffer).getUint32(20, true) === 2 && img[2624] === 5 && img[2626] === 1 && img[2632] === 0 && img[2633] === 0x00 && img[2634] === 5 && img[2643] === 0x12 && img[4091] === 0xff,
    'events: version-2 record, table at 2624, first event {0, ch1 type0, 5}, third event channel|type = 0x12', Array.from(img.subarray(2624, 2650)).map(x => x.toString(16).padStart(2, '0')).join(' '));
  const back = Format.decodeRecord(img);
  check(same(back.events, ev) && Format.validate({ ...r.song, blocks: r.song.blocks }).ok, 'events: decodeRecord returns the same events');
  const plain = Format.encodeRecord({ ...r.song, events: [] });
  check(new DataView(plain.buffer).getUint32(20, true) === 1 && Array.from(plain.subarray(2624, 4096)).every(x => x === 0xff), 'events: a song without events stays a version-1 record');
  const bad = img.slice(); bad[2632] = 1; new DataView(bad.buffer).setUint32(12, Format.crc32(bad.subarray(20, 4092)), true);
  check(throws(() => Format.decodeRecord(bad), /row order/), 'events: unsorted table rejected on decode');
  const bad2 = img.slice(); bad2[2632 + 1] = 0x40; new DataView(bad2.buffer).setUint32(12, Format.crc32(bad2.subarray(20, 4092)), true);
  check(throws(() => Format.decodeRecord(bad2), /type invalid/), 'events: type 4 rejected on decode');
  const rig = { schema: 'tabby-rig/1', name: 'test', channels: Array.from({ length: 16 }, (_, i) => ({ device: i === 0 ? 'waldorf-blofeld' : null, name: '', gapMs: null, programs: {} })) };
  const withRig = { ...r.song, rig };
  const file = Format.encodeFile(withRig), got = Format.decodeFile(file);
  check(file.length > Format.encodeFile(r.song).length + 9 && got.rig && got.rig.channels[0].device === 'waldorf-blofeld' && same(got.events, ev), 'events: .tabby trailer carries the rig override and reads back');
  check(same(Format.fromJSON(Format.toJSON(withRig)).events, ev), 'events: JSON round trip keeps the events');
}

// ---- 13. Task 05: nudges, exact PPQs, a rounding PPQ ------------------------------------------
{
  const r = importFile('kick-nudge.mid'), e = fx['kick-nudge.mid'].expect;
  produced.push(r.song);
  const drums = r.song.blocks.find(b => b.notes.some(n => n.pitch === 36)), bass = r.song.blocks.find(b => b.notes.some(n => n.pitch === 43));
  const kicks = drums.notes.filter(n => n.pitch === 36), kick = kicks[0], bass0 = bass.notes.find(n => n.step === kick.step && n.pitch === 40), late = bass.notes.find(n => n.pitch === 43);
  check(kicks.length === 4 && kicks.every(n => n.offset === e.kickOffset) && bass0 && bass0.offset === 0, 'kick-nudge: every kick keeps its -12 units (3 ticks) on the same step as the bass note', `kicks ${kicks.map(n => n.step + '/' + n.offset).join(' ')}, bass ${bass0?.offset}`);
  check(late && late.step === kick.step + 2 && late.offset === e.bassLateOffset && late.length === e.bassLateLength, 'kick-nudge: the late bass note keeps +20 units and its 2-step-7-tick length', `${late?.step} ${late?.offset} ${late?.length}`);
  check(r.warnings.length === 0 && r.stats.offsets === 6, 'kick-nudge: no warnings, 6 notes with offsets (4 kicks, 2 late bass notes)', JSON.stringify(r.warnings.map(w => w.kind)) + ' ' + r.stats.offsets);
  for (const ppq of [120, 480, 960]) {
    const q = importFile('ppq-' + ppq + '.mid'), x = fx['ppq-' + ppq + '.mid'].expect;
    produced.push(q.song);
    check(q.a.exactPpq && same(q.song.blocks[0].notes.map(n => [n.step, n.offset, n.length]), x.notes.map(n => [n.step, n.offset, n.length])) && x.notes[1].offset === 80 && x.notes[1].length === 720 && !warning(q, 'ppqRounded'), `ppq-${ppq}: exact offsets of 80 units and 1.5-step lengths`, q.song.blocks[0].notes.map(n => n.offset + '/' + n.length).join(' '));
  }
  const q = importFile('ppq-100.mid'), x = fx['ppq-100.mid'].expect;
  check(!q.a.exactPpq && warning(q, 'ppqRounded') && /100 ticks per quarter/.test(warning(q, 'ppqRounded').message), 'ppq-100: the rounding is reported', warning(q, 'ppqRounded')?.message);
  /* Start and end round separately, so a length can be one unit off its own rounding. */
  check(q.song.blocks[0].notes.every((n, i) => Math.abs(n.offset - x.notes[i].exactOffset) <= 0.5 && Math.abs(n.length - x.notes[i].exactLength) <= 1), 'ppq-100: every start within half a unit and every length within one unit of the exact value (76.8 → 77, 729.6 → 729..730)', q.song.blocks[0].notes.map(n => n.offset + '/' + n.length).join(' '));
  /* Quantize helper on a song model: starts only, then starts and ends. */
  const m = Format.fromJSON(Format.toJSON(r.song));
  check(Format.quantize(m, 'starts') === 6 && m.blocks.every(b => b.notes.every(n => n.offset === 0)) && m.blocks.some(b => b.notes.some(n => n.length % 480)), 'quantize starts: 6 offsets cleared, lengths kept');
  check(Format.quantize(m, 'startsEnds', 'nearest') > 0 && m.blocks.every(b => b.notes.every(n => n.length % 480 === 0 && n.length >= 480)) && Format.validate(m).ok, 'quantize starts and ends: lengths on whole steps, song valid');
}

// ---- 15. the Wrong Room rig (Task 09) --------------------------------------------------------
{
  const D = require(join(root, 'web/rig/device-library.js')), Rig = require(join(root, 'web/rig/rig.js'));
  const ddir = join(root, 'web/devices');
  const library = D.load(readdirSync(ddir).filter(n => n.endsWith('.json')).sort().map(n => JSON.parse(readFileSync(join(ddir, n), 'utf8'))));
  const [rig] = Rig.rigBuiltins([JSON.parse(readFileSync(join(root, 'web/rig/profiles/wrong-room.json'), 'utf8'))]);
  const all = fx['wrong-room-all.mid'], a = Song.analyze(Midi.parse(all.bytes));
  check(a.parts.length === 8 && a.parts.map(p => p.channel).join() === '0,1,8,2,3,4,5,9', 'wrong-room-all: eight parts in file order, the FM6 part third', a.parts.map(p => p.channel).join());
  const asg = Song.defaultAssignments(a, rig);
  check(asg['3:8'] === 7 && asg['1:0'] === 0 && asg['2:1'] === 1 && asg['4:2'] === 2 && asg['5:3'] === 3 && asg['6:4'] === 4 && asg['7:5'] === 5 && asg['8:9'] === 6, 'wrong-room-all: the FM6 part is pinned to track 8, the others fill 1..7 in file order', JSON.stringify(asg));
  const r = Song.convert(a, { fileName: 'wrong-room-all.mid', rig, library });
  check(r.song.outChannels.join() === all.expect.outChannels.join(), 'wrong-room-all: every OUT CH is the part\'s own channel (0-based 0,1,2,3,4,5,9,8)', r.song.outChannels.join());
  const kinds = new Set(r.warnings.map(w => w.kind)), warnLevel = r.warnings.filter(w => w.severity === 'warn');
  check(warnLevel.length === 0 && !['channelNotInRig', 'notesOnEffectsChannel', 'programOutOfRange', 'ccNotNamed'].some(k => kinds.has(k)), 'wrong-room-all: no warning of warn severity and none of the four rig kinds', [...kinds].join(' ') + ' / ' + warnLevel.map(w => w.message).join('; '));
  const ev = r.song.events, chans = ch => ev.filter(e => e.channel === ch);
  check(ev.length === all.expect.events && r.song.rows.length === 2 && !warning(r, 'programIgnored'), 'wrong-room-all: 22 row events over two rows, no program change dropped', ev.length + ' events, ' + r.song.rows.length + ' rows; ' + JSON.stringify(warning(r, 'programIgnored') && warning(r, 'programIgnored').items));
  check(chans(13).length === 2 && chans(13)[0].type === 1 && chans(13)[0].d0 === 1 && chans(13)[0].d2 === 72 && chans(11).length === 3 && chans(10).length === 2 && chans(15).length === 2 && chans(14).length === 2,
    'wrong-room-all: the NightSky bank+program (CC 0 = 1, PC 72 = preset 200), the Brothers\' three, the Royalist\'s two, the Zoom\'s and the H90\'s two, each on its own channel');
  check(r.song.source.parts.find(p => p.key === '3:8').track === 8 && r.song.source.parts.find(p => p.key === '3:8').rigDevice === 'SMK-37 FM6 internal engine' && r.song.source.rig === 'Wrong Room', 'wrong-room-all: the source record names the rig and the pinned part\'s device');
  const plain = Song.convert(a, { fileName: 'wrong-room-all.mid' });
  check(plain.song.outChannels.every(c => c === null) && Song.defaultAssignments(a)['3:8'] === 2, 'without a rig: OUT CH stays "device" and parts take file order (v0.5 behaviour)');
  const pd = Song.partDevice(a.parts[2], rig, library), pdName = Song.partDevice({ name: 'Brothers riff', channel: 0 }, rig, library);
  check(pd.device && pd.device.id === 'smk37-fm6-internal' && pd.track === 8 && pd.kind === 'internal' && pdName.byName && pdName.byName.channel === 11 && pdName.device.id === 'instruo-seashell', 'partDevice: the rig device on the channel, the pinned track, and a device the name mentions');
  const over = Song.convert(a, { fileName: 'x', rig, library, outChannels: [null, 15] });
  check(over.song.outChannels[0] === null && over.song.outChannels[1] === 15 && over.song.outChannels[2] === 2, 'an explicit OUT CH (null = device, or a channel) overrides the file\'s channel per track');
  /* the faults, with channel 13 cleared so a part there is "not in the rig" */
  const testRig = Rig.rigClone(rig); testRig.channels[12].device = null;
  const wrong = fx['wrong-room-wrong.mid'], wa = Song.analyze(Midi.parse(wrong.bytes)), wr = Song.convert(wa, { fileName: 'wrong-room-wrong.mid', rig: testRig, library });
  for (const k of wrong.expect.warnings) check(warning(wr, k)?.count === 1, 'wrong-room-wrong: ' + k + ' exactly once', JSON.stringify(warning(wr, k) && warning(wr, k).items));
  check(wr.song.outChannels[0] === 12 && wr.song.outChannels[1] === 11, 'wrong-room-wrong: the faulty parts still get their channels as OUT CH');
  const okRig = Song.convert(wa, { fileName: 'wrong-room-wrong.mid', rig, library });
  check(!warning(okRig, 'channelNotInRig') && warning(okRig, 'notesOnEffectsChannel')?.count === 1, 'with the full Wrong Room (channel 13 = M8 part 3) the pad is in the rig and only the three other faults remain');
}

console.log(failures ? `${failures} of ${checks} check(s) FAILED` : `all ${checks} checks passed`);
process.exit(failures ? 1 : 0);
