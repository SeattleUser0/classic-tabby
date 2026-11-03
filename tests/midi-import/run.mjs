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
//
//   Run:  /usr/bin/node tests/midi-import/run.mjs      (or: make midi-import-test)
//   Exit status 0 on success; every check prints "ok" or "FAIL".
//
// Version: 0.4
//
// Revision log
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
  check(r.stats.poolPercent < 1 && r.stats.idPercent < 1, 'multitrack: pool use small', `${r.stats.recordBytes} B, ${r.stats.idPercent.toFixed(2)} % ids`);
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
  check(same(back.outChannels, [9, 0, 1, null, null, null, null, null]) && back.rows.every(x => x.steps === 64) && back.name === 'ROUND TRIP  ', 'round trip: channels, row length and name survive JSON');
  const v1 = JSON.parse(json); delete v1.rows[0].steps; v1.rowSteps = 48;
  check(Format.fromJSON(JSON.stringify(v1)).rows[0].steps === 48 && Format.fromJSON(JSON.stringify(v1)).rowSteps === undefined, 'round trip: v0.1 JSON (song.rowSteps) loads into row.steps');
  const file = Format.encodeFile(r.song), decoded = Format.decodeFile(file);
  const strip = s => ({ name: s.name, projectSlot: s.projectSlot, tempo: s.tempo, loop: s.loop, jumpMode: s.jumpMode, loopRow: s.loopRow, outChannels: s.outChannels, rows: s.rows, blocks: s.blocks.map(b => ({ id: b.id, notes: Format.sortNotes(b.notes) })) });
  check(same(strip(decoded), strip(r.song)), 'round trip: .tabby encode → decode reproduces rows and blocks', `${file.length} bytes`);
  check(file.length === 4096 + r.stats.recordBytes && same(Array.from(file.subarray(4096, 4102)), [0, 0, 1, 0, file[4100], file[4101]]), 'round trip: .tabby size = record + aligned block records; 6-byte record header (song 0, reserved, id u16, length u16)');
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
      write: async (slot, record, blocks) => { log.push('write ' + slot + ' record then ' + blocks.size + ' blocks'); store.set(slot, { record, blocks }); progress?.(1); },
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
    check(second.replaced && same(log, ['remove 3', 'write 3 record then ' + song.blocks.length + ' blocks']) && /deleted first/.test(second.message), 'backend: rewrite deletes the slot first, then writes', log.join('; '));
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
    } catch (error) { check(false, `renoise ${name}: ${error.message}`); }
  }
}

console.log(failures ? `${failures} of ${checks} check(s) FAILED` : `all ${checks} checks passed`);
process.exit(failures ? 1 : 0);
