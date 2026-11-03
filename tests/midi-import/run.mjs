// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/midi-import/run.mjs — host tests for the MIDI importer (Task 02, Step 3)
//
// Purpose
//   Run the importer modules (web/import/*.js, loaded exactly as the browser page loads
//   them, as classic scripts) against the fixtures from make-fixtures.mjs and check rows,
//   blocks and notes against values known by construction:
//     1. parser: header, division, names, note pairing, running status, type 0 channel split,
//        rejection of SMPTE division and format 2, truncated files tolerated;
//     2. bass line: one row, one block, exact notes;
//     3. 64-bar multitrack: deduplication gives 6 blocks and the expected rows/repeats, and
//        expanding the song again reproduces the pre-deduplication grid;
//     4. pad under melody on one track: overlapping notes with different lengths;
//     5. six notes on one step: the 4 loudest / highest / lowest survive, 2 warnings;
//     6. off-grid notes: snapping, half-step ties, the three length rules;
//     7. 3/4: 12-step bars, 48-step rows, one merged row;
//     8. tempo / CC / program file: first tempo used, everything else counted and ignored;
//     9. long notes: 255 clip, same-pitch overlap clip, same-step duplicate;
//    10. round trip: JSON save → load and .tabby encode → decode give identical songs;
//    11. format check: every produced song passes validate(); block size limits; the stub
//        transfer plans every song;
//    12. Renoise export (tests/fixtures/renoise-export.mid or tests/midi-import/fixtures/
//        renoise-export.mid): parses, converts, validates; SKIPPED when the file is absent.
//
//   Run:  /usr/bin/node tests/midi-import/run.mjs      (or: make midi-import-test)
//   Exit status 0 on success; every check prints "ok" or "FAIL".
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-02  Initial version.

import { readFileSync, existsSync } from 'node:fs';
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
}

// ---- 2. bass line -----------------------------------------------------------------------
{
  const r = importFile('bassline-4bar.mid'), e = fx['bassline-4bar.mid'].expect;
  produced.push(r.song);
  check(r.a.totalBars === e.bars && r.a.parts.length === 1, 'bassline: 4 bars, one part', `${r.a.totalBars} bars`);
  check(r.song.rows.length === 1 && r.song.blocks.length === 1 && r.song.rows[0].repeat === 1, 'bassline: one row, one block');
  const got = r.song.blocks[0].notes.map(n => ({ step: n.step, pitch: n.pitch, velocity: n.velocity, length: n.length }));
  check(same(got, e.notes), 'bassline: notes exact (step, pitch, velocity, length)');
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
  check(r.stats.poolPercent < 1 && r.stats.idPercent < 3, 'multitrack: pool use small', `${r.stats.recordBytes} B, ${r.stats.idPercent.toFixed(1)} % ids`);
}

// ---- 4. pad under melody ----------------------------------------------------------------
{
  const r = importFile('pad-melody.mid'), e = fx['pad-melody.mid'].expect;
  produced.push(r.song);
  check(r.song.rows.length === e.rows && r.song.rows[0].repeat === 2 && r.song.blocks.length === 1, 'pad-melody: 8 identical bars → one row ×2, one block');
  const b = r.song.blocks[0].notes, step0 = b.filter(n => n.step === 0);
  check(step0.length === e.notesPerStep0, 'pad-melody: 4 notes on step 0 (3 pad + melody)', `${step0.length}`);
  check(step0.filter(n => n.length === 16).length === 3 && step0.filter(n => n.length === 2).length === 1, 'pad-melody: pad notes 16 steps, melody 2 steps on the same step');
  check(b.filter(n => n.step === 16 && n.length === 16).length === 3, 'pad-melody: pad re-struck each bar while the melody runs');
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

// ---- 6. off-grid ------------------------------------------------------------------------
{
  const e = fx['offgrid.mid'].expect;
  for (const rule of ['nearest', 'up', 'down']) {
    const r = importFile('offgrid.mid', { lengthRule: rule });
    if (rule === 'nearest') produced.push(r.song);
    const notes = r.song.blocks[0].notes;
    check(same(notes.map(n => n.step), e.starts), `offgrid: starts snapped (${rule})`, notes.map(n => n.step).join(' '));
    check(same(notes.map(n => n.length), e.lengths[rule]), `offgrid: lengths with rule ${rule}`, notes.map(n => n.length).join(' '));
  }
  const r = importFile('offgrid.mid');
  check(warning(r, 'moved')?.count === e.moved && warning(r, 'lengthMin')?.count === 1, 'offgrid: 4 moved starts and 1 minimum length reported', JSON.stringify(r.warnings.map(w => [w.kind, w.count])));
}

// ---- 7. waltz 3/4 -----------------------------------------------------------------------
{
  const r = importFile('waltz-3-4.mid'), e = fx['waltz-3-4.mid'].expect;
  produced.push(r.song);
  check(r.a.barSteps === e.barSteps && r.a.rowSteps.default === e.rowSteps && r.a.rowSteps.aligned, 'waltz: 12-step bars, default row 48 steps', `${r.a.barSteps}, ${r.a.rowSteps.default}`);
  check(same(r.a.rowSteps.candidates.map(c => c.steps), [48]), 'waltz: 48 is the only aligned row length');
  check(r.song.rowSteps === 48 && r.stats.rowsBeforeMerge === e.rowsBeforeMerge && r.song.rows.length === 1 && r.song.rows[0].repeat === 2, 'waltz: 8 bars → 2 rows of 4 bars → one row ×2');
  check(r.song.blocks[0].notes.every(n => n.step < 48) && r.song.blocks[0].notes.filter(n => n.step % 12 === 0).length === 4, 'waltz: notes inside 48 steps, one bass note per bar');
  check(r.song.tempo === e.tempo, 'waltz: tempo 140');
  const v = Format.validate(r.song);
  check(v.ok && v.warnings.some(w => /pending layout/.test(w)), 'waltz: valid, with the pending row-length layout warning');
  const r64 = importFile('waltz-3-4.mid', { rowSteps: 64 });
  check(r64.song.rows.length === 2 && r64.song.rowSteps === 64, 'waltz: forcing 64-step rows gives 2 unequal rows (96 steps)');
}

// ---- 8. tempo / CC / program ------------------------------------------------------------
{
  const r = importFile('tempo-cc-program.mid'), e = fx['tempo-cc-program.mid'].expect;
  produced.push(r.song);
  check(r.song.tempo === e.tempo && Math.abs(r.a.tempo.exact - e.tempoExact) < 0.01, 'events: first tempo 127.5 → 128', `${r.a.tempo.exact} → ${r.song.tempo}`);
  check(warning(r, 'tempoRounded') && warning(r, 'tempoChangesIgnored')?.count === e.tempoChanges, 'events: rounding and 2 real tempo changes reported (repeat of the same tempo not counted)');
  check(warning(r, 'ccIgnored') && r.a.ignored.controlChange === e.cc && r.a.ignored.sustain === e.sustain, 'events: 8 CCs counted, 1 sustain');
  check(warning(r, 'programIgnored')?.count === e.programs && /program 34/.test(warning(r, 'programIgnored').items[0].text), 'events: 2 program changes listed with numbers');
  check(r.a.ignored.pitchBend === e.bend && r.a.ignored.channelPressure === e.pressure && r.a.ignored.sysex === e.sysex, 'events: bend, pressure, SysEx counted');
  check(r.stats.notesOut === e.notes && r.song.blocks.length === 1, 'events: all 16 notes kept in one block');
}

// ---- 9. long notes ----------------------------------------------------------------------
{
  const r = importFile('long-notes.mid'), e = fx['long-notes.mid'].expect;
  produced.push(r.song);
  const notes = r.song.blocks[0].notes.map(n => ({ step: n.step, pitch: n.pitch, length: n.length, velocity: n.velocity }));
  check(same(notes.map(n => [n.step, n.pitch, n.length]), e.notes.map(n => [n.step, n.pitch, n.length])), 'long: 255 clip, overlap clip, duplicate removed', JSON.stringify(notes));
  check(notes[3].velocity === 110, 'long: the louder duplicate survives');
  check(warning(r, 'lengthClipped')?.count === e.clipped && warning(r, 'overlapClipped')?.count === e.overlap && warning(r, 'duplicateDropped')?.count === e.duplicate, 'long: three warnings with count 1');
  check(r.a.totalBars === e.bars && r.song.rows.length === 2 && r.song.rows[0].repeat === 1 && r.song.rows[1].repeat === 4 && r.song.rows[1].blocks.every(id => id === 0), 'long: 19 bars = 5 rows; the 4 silent rows (the 255-step note rings on) merge into one empty row ×4', `${r.song.rows.length} rows: ${r.song.rows.map(x => x.repeat + '×' + x.blocks[0]).join(' ')}`);
}

// ---- 10. round trips ----------------------------------------------------------------------
{
  const r = importFile('multitrack-64bar.mid', { outChannels: [9, 0, 1, null, null, null, null, null], name: 'Round Trip', projectSlot: 3, loop: true });
  const json = Format.toJSON(r.song), back = Format.fromJSON(json);
  check(Format.toJSON(back) === json, 'round trip: JSON save → load → save is byte-identical');
  check(same(back.outChannels, [9, 0, 1, null, null, null, null, null]) && back.rowSteps === 64 && back.name === 'ROUND TRIP  ', 'round trip: channels, row length and name survive JSON');
  const file = Format.encodeFile(r.song), decoded = Format.decodeFile(file);
  const strip = s => ({ name: s.name, projectSlot: s.projectSlot, tempo: s.tempo, loop: s.loop, jumpMode: s.jumpMode, loopRow: s.loopRow, rows: s.rows, blocks: s.blocks.map(b => ({ id: b.id, notes: Format.sortNotes(b.notes) })) });
  check(same(strip(decoded), strip(r.song)), 'round trip: .tabby encode → decode reproduces rows and blocks', `${file.length} bytes`);
  check(file.length === 4096 + r.stats.recordBytes, 'round trip: .tabby size = record + aligned block records');
  const v = new DataView(file.buffer);
  check(v.getUint32(0, true) === 0x47314d46 && v.getUint32(16, true) === 0 && file[36] === 3 && (file[37] & 1) === 1 && v.getUint16(38, true) === 120 && file[40] === r.song.rows.length, 'round trip: record header fields at the section 9.5 offsets');
  check(v.getUint32(12, true) === Format.crc32(file.subarray(20, 1328)), 'round trip: record CRC over bytes 20..1327');
  const corrupt = file.slice(); corrupt[100] ^= 1;
  check(throws(() => Format.decodeFile(corrupt), /CRC/), 'round trip: corrupted record rejected');
}

// ---- 11. format check and the stub transfer ----------------------------------------------
{
  check(produced.every(s => Format.validate(s).ok), 'format: every produced song passes validate()', `${produced.length} songs`);
  check(Format.encodeBlock({ notes: [] }).length === 64, 'format: empty block is 64 bytes');
  const full = { notes: Array.from({ length: 256 }, (_, i) => ({ step: i >> 2, pitch: (i & 3) * 20 + 1, velocity: 100, length: 1 })) };
  check(Format.encodeBlock(full).length === 832 && Format.decodeBlock(Format.encodeBlock(full)).notes.length === 256, 'format: full block is 832 bytes and decodes');
  check(throws(() => Format.encodeBlock({ notes: [{ step: 0, pitch: 60, velocity: 100, length: 1 }, { step: 0, pitch: 60, velocity: 90, length: 2 }] }), /twice/), 'format: same pitch twice on a step rejected');
  check(throws(() => Format.encodeBlock({ notes: Array.from({ length: 5 }, (_, i) => ({ step: 0, pitch: 60 + i, velocity: 100, length: 1 })) }), /max 4/), 'format: 5 notes on a step rejected');
  check(throws(() => Format.encodeBlock({ notes: [{ step: 0, pitch: 60, velocity: 0, length: 1 }] }), /velocity/) && throws(() => Format.encodeBlock({ notes: [{ step: 0, pitch: 60, velocity: 1, length: 256 }] }), /length/), 'format: velocity 0 and length 256 rejected');
  const bad = Format.emptySong('x'); bad.rows = [{ blocks: [7, 0, 0, 0, 0, 0, 0, 0], repeat: 1 }];
  check(!Format.validate(bad).ok && /missing block 7/.test(Format.validate(bad).errors[0]), 'format: row referencing a missing block rejected');
  const stub = Transfer.select({});
  const plans = await Promise.all(produced.map(s => stub.plan(s, 0)));
  check(stub.name === 'stub' && !stub.real && plans.every(p => p.record.bytes === 4096 && p.blocks.length > 0), 'transfer: stub plans every song (record + blocks)');
  const w = await stub.write(2, produced[1], {});
  check(w.sent === false && /Nothing was written/.test(w.message) && w.blocks.every(b => b.target >> 8 === 2 && (b.target & 255) === b.id), 'transfer: stub write reports and sends nothing; targets (song<<8)|id', w.message);
  check((await stub.exists(0)).empty === 'unknown', 'transfer: stub cannot tell whether a slot is used');
  // Limits: 129 distinct rows must be refused, 256 distinct blocks must be refused.
  const many = [{ tick: 0, type: 'tempo', bpm: 120 }];
  for (let bar = 0; bar < 129 * 4; bar++) note(many, bar * 16 * 96 / 4, 96 / 4, 36 + (bar % 60), 100, 0);
  check(throws(() => Song.convert(Song.analyze(Midi.parse(write({ format: 0, division: 96, tracks: [many] })))), /128/), 'limits: more than 128 rows refused with a message');
  const big = [{ tick: 0, type: 'tempo', bpm: 120 }];
  for (let row = 0; row < 64; row++) for (let t = 0; t < 4; t++) note(big, row * 64 * 24 + t * 24, 24, 24 + row + t * 20, 100, t);
  check(throws(() => Song.convert(Song.analyze(Midi.parse(write({ format: 0, division: 96, tracks: [big] })))), /255/), 'limits: more than 255 distinct blocks refused with a message');
}

// ---- 12. Renoise export -------------------------------------------------------------------
{
  const candidates = [join(root, 'tests/fixtures/renoise-export.mid'), join(here, 'fixtures/renoise-export.mid')];
  const path = candidates.find(p => existsSync(p));
  if (!path) console.log('SKIP renoise: no renoise-export.mid at ' + candidates.map(p => p.replace(root + '/', '')).join(' or '));
  else {
    const p = Midi.parse(readFileSync(path)), a = Song.analyze(p);
    console.log(`     renoise: format ${p.format}, division ${p.division}, ${p.tracks.length} tracks, ${a.parts.length} parts, ${a.totalBars} bars, tempo ${a.tempo.exact}, meter ${a.meter.numerator}/${a.meter.denominator}`);
    for (const part of a.parts) console.log(`       part ${part.key} "${part.name}" ${part.noteCount} notes ${part.low}-${part.high} bars ${part.firstBar}-${part.lastBar}`);
    check(a.parts.length > 0 && !a.errors.length, 'renoise: parses into parts');
    const r = Song.convert(a, { fileName: 'renoise-export.mid' });
    produced.push(r.song);
    check(Format.validate(r.song).ok, 'renoise: converted song is valid', `${r.song.rows.length} rows, ${r.song.blocks.length} blocks, ${r.stats.notesOut}/${r.stats.notesIn} notes`);
    console.log('     renoise warnings: ' + r.warnings.map(w => w.kind + '×' + w.count).join(', '));
    check(Format.toJSON(Format.fromJSON(Format.toJSON(r.song))) === Format.toJSON(r.song), 'renoise: JSON round trip');
  }
}

console.log(failures ? `${failures} of ${checks} check(s) FAILED` : `all ${checks} checks passed`);
process.exit(failures ? 1 : 0);
