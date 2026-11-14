// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tools/linux/hw/expected-events.mjs — what a MIDI file must sound like after the importer
//
// Purpose
//   Task 17 Goal 2: the device validation of v2 and v3 songs compares the MIDI the SMK-37 sends against the events
//   the song holds. This script runs the repository's importer (web/import, the code the workbench page runs) on a
//   MIDI file with the given options and prints the song as a flat list: every note-on with its time from the
//   song's start (ms at the song's tempo), track, pitch and velocity, every clip controller event, and the block
//   formats. tools/linux/hw/run-clips.py reads it.
//
//   node tools/linux/hw/expected-events.mjs FILE.mid [--options JSON] > expected.json
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-14  First version (Task 17).

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const require = createRequire(import.meta.url);
const Midi = require(join(root, 'web/import/midi-parse.js')), Song = require(join(root, 'web/import/midi-song.js')), Format = require(join(root, 'web/import/song-format.js'));
const argv = process.argv.slice(2), file = argv[0];
const oi = argv.indexOf('--options'), options = oi > 0 ? JSON.parse(argv[oi + 1]) : {};
const analysis = Song.analyze(Midi.parse(new Uint8Array(readFileSync(file))));
const result = Song.convert(analysis, { fileName: basename(file), ...options }), song = result.song;
const U = 480, msPerUnit = 60000 / (song.tempo * 4 * U);
const byId = new Map(song.blocks.map(b => [b.id, b]));
const notes = [], controls = [], programs = [];
let start = 0;
const last = new Array(8).fill(0);
for (const row of song.rows) {
  for (let pass = 0; pass < row.repeat; pass++) {
    row.blocks.forEach((id, track) => {
      const b = id ? byId.get(id) : null;
      if (!b) { last[track] = 0; return; }
      if (last[track] !== id && Format.needsV3(b)) {
        if (Number.isInteger(b.bankMsb)) programs.push({ ms: start * msPerUnit, track, bankMsb: b.bankMsb, bankLsb: b.bankLsb | 0 });
        if (Number.isInteger(b.program)) programs.push({ ms: start * msPerUnit, track, program: b.program });
      }
      last[track] = id;
      for (const n of b.notes) {
        if (n.step >= row.steps) continue;
        notes.push({ ms: Math.max(0, start + n.step * U + (n.offset | 0)) * msPerUnit, track, pitch: n.pitch, velocity: n.velocity, lengthMs: n.length * msPerUnit });
      }
      for (const c of b.controls || []) if (c.time < row.steps * U) controls.push({ ms: Math.max(0, start + c.time) * msPerUnit, track, kind: c.kind, a: c.a, b: c.b });
    });
    start += row.steps * U;
  }
}
notes.sort((x, y) => x.ms - y.ms || x.track - y.track || x.pitch - y.pitch);
controls.sort((x, y) => x.ms - y.ms);
const formats = song.blocks.map(b => Format.payloadOf(b).format);
console.log(JSON.stringify({ file: basename(file), options, name: song.name, tempo: song.tempo, lengthMs: start * msPerUnit, rows: song.rows.length, rowSteps: song.rows[0].steps,
  blocks: song.blocks.length, v2Blocks: formats.filter(f => f === 1).length, v3Blocks: formats.filter(f => f === 2).length, rowEvents: song.events.length,
  outChannels: song.outChannels, notes, controls, programs, warnings: result.warnings.map(w => w.kind + ' x' + w.count) }));
