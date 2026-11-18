// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tools/linux/hw/rig-song.mjs — a MIDI file imported with a rig profile, as a song the workbench can write
//
// Purpose
//   The tabby-v1.0 soak plays a multi-track song with the Wrong Room rig profile on the device. The workbench page
//   applies a rig in its import dialog; this script does the same with the repository's own importer and rig code
//   (web/import, web/rig: what the page runs, and what tests/workbench/wrong-room-sim.mjs checks in the simulator):
//   OUT CH from the file, the rig's programs and gaps in the row events. It prints the song as JSON for
//   tools/linux/hw/workbench.mjs song --song-json FILE, with a summary on stderr.
//
//   node tools/linux/hw/rig-song.mjs FILE.mid [--profile web/rig/profiles/wrong-room.json] [--loop] [--name NAME] > song.json
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-18  First version (tabby-v1.0).
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const require = createRequire(import.meta.url);
const Midi = require(join(root, 'web/import/midi-parse.js')), Song = require(join(root, 'web/import/midi-song.js')), Format = require(join(root, 'web/import/song-format.js'));
const D = require(join(root, 'web/rig/device-library.js')), Rig = require(join(root, 'web/rig/rig.js'));
const argv = process.argv.slice(2), file = argv[0];
const opt = n => { const i = argv.indexOf('--' + n); return i > 0 ? argv[i + 1] : null; };
const ddir = join(root, 'web/devices');
const library = D.load(readdirSync(ddir).filter(n => n.endsWith('.json')).sort().map(n => JSON.parse(readFileSync(join(ddir, n), 'utf8'))));
const [rig] = Rig.rigBuiltins([JSON.parse(readFileSync(opt('profile') || join(root, 'web/rig/profiles/wrong-room.json'), 'utf8'))]);
const analysis = Song.analyze(Midi.parse(new Uint8Array(readFileSync(file))));
const result = Song.convert(analysis, { fileName: basename(file), rig, library, name: opt('name') || 'WRONG ROOM', projectSlot: 0, loop: argv.includes('--loop') });
const song = { ...result.song, events: Rig.applyGaps(result.song.events, rig, library) };
const v = Format.validate(song);
if (!v.ok) { console.error('the song is not valid: ' + JSON.stringify(v)); process.exit(1); }
const kinds = ['program change', 'bank + program', 'controller', 'gap'];
console.error(JSON.stringify({ file: basename(file), rig: rig.name, rows: song.rows.length, rowSteps: song.rows.map(r => r.steps), blocks: song.blocks.length, loop: song.loop, tempo: song.tempo,
  outChannels: song.outChannels.map(c => c + 1), notes: song.blocks.reduce((n, b) => n + b.notes.length, 0),
  events: song.events.length, eventKinds: Object.fromEntries(kinds.map((k, i) => [k, song.events.filter(e => e.type === i).length])), warnings: result.warnings.filter(w => w.severity === 'warn').map(w => w.text || w.message) }));
console.log(JSON.stringify(song));
