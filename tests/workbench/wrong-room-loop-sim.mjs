// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/wrong-room-loop-sim.mjs — the Wrong Room song looping: every scene entry sends its events (tabby-v1.0.1)
//
// Purpose
//   The two-hour soak of tabby-v1.0 showed that a song of two scenes that loops sometimes entered a scene without
//   sending the scene's row events (program changes, bank select, controllers): 136 program changes in one 125 s
//   segment, 68 in another. The audio thread took a scene buffer for "already streamed" when the control task had
//   decoded the same scene into it again before the next audio tick looked (app/song.c, song_switch / prefire).
//   This plays tests/midi-import/fixtures/wrong-room-all.mid with the Wrong Room profile, looping, for LOOPS passes
//   of the song and checks on MIDI out that EVERY entry of scene 1 sends its 17 event messages and every entry of
//   scene 2 its 6, before the scene's first note. It fails on tabby-v1.0 and earlier (from the second loop on).
//
//   Run:  /usr/bin/node tests/workbench/wrong-room-loop-sim.mjs [build/web/simulator.wasm]   (make midi-import-sim)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-18  First version (tabby-v1.0.1).

import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const Midi = require(join(root, 'web/import/midi-parse.js'));
const Format = require(join(root, 'web/import/song-format.js'));
const Song = require(join(root, 'web/import/midi-song.js'));
const D = require(join(root, 'web/rig/device-library.js'));
const Rig = require(join(root, 'web/rig/rig.js'));
const wasmPath = process.argv[2] ?? join(root, 'build/web/simulator.wasm');
const SLOT = 3, FM6 = 0;
let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

/* ---- 1. import with the rig, as the workbench does ------------------------------------------ */
const ddir = join(root, 'web/devices');
const library = D.load(readdirSync(ddir).filter(n => n.endsWith('.json')).sort().map(n => JSON.parse(readFileSync(join(ddir, n), 'utf8'))));
const [rig] = Rig.rigBuiltins([JSON.parse(readFileSync(join(root, 'web/rig/profiles/wrong-room.json'), 'utf8'))]);
const analysis = Song.analyze(Midi.parse(new Uint8Array(readFileSync(join(root, 'tests/midi-import/fixtures/wrong-room-all.mid')))));
const LOOPS = 6;
const result = Song.convert(analysis, { fileName: 'wrong-room-all.mid', rig, library, name: 'WRONG ROOM', projectSlot: 0, loop: true });
const song = { ...result.song, events: Rig.applyGaps(result.song.events, rig, library) };   /* the editor's write path applies the gaps */
check(Format.validate(song).ok && song.outChannels.join() === '0,1,2,3,4,5,9,8' && !result.warnings.some(w => w.severity === 'warn'), 'the fixture imports with every OUT CH from the file and no warning');
const gaps = song.events.filter(e => e.type === 3);
check(gaps.length === 0 && song.events.filter(e => e.channel === 14).length === 2, 'the H90 is last in each row\'s stream, so its gap ends the stream and is dropped (nothing waits on it)', JSON.stringify(gaps));
const tempo = song.tempo, U = 480, blockOf = u => Math.ceil((u + 1) * 11025 / (tempo * 1024)) - 1;
const rowStart = [0, 64 * U];   /* two rows of 64 steps, repeat 1 each (events in both rows) */
check(song.rows.length === 2 && song.rows.every(r => r.repeat === 1 && r.steps === 64), 'two rows of 64 steps, repeat 1');
/* pitches per part (channel 0-based): the fixture plays pitch and pitch + 3 alternately */
const pitches = { 0: [36, 39], 1: [60, 63], 2: [67, 70], 3: [48, 51], 4: [55, 58], 5: [59, 62], 9: [40, 43], 8: [64, 67] };

/* ---- 2. play --------------------------------------------------------------------------------- */
const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(wasmPath)), {}).exports;
c._initialize(); c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
for (let t = 0; t < 8; t++) c.sim_select(t, FM6);
mem().set(Format.encodeRecord(song), c.sim_file());
check(c.sim_song_record_write(SLOT) === 0, 'song record written');
{ let parts = [], total = 0, fill = 0, sectors = 1; const batches = [];
  for (const b of song.blocks.slice().sort((a, b) => a.id - b.id)) {
    const rec = Format.encodeBlockRecord(b, 0), size = rec.length;
    if (fill + size > 4076) { if (sectors === 8) { batches.push([parts, total]); parts = []; total = 0; sectors = 0; } sectors++; fill = 0; }
    parts.push(rec); total += size; fill += size;
  }
  if (parts.length) batches.push([parts, total]);
  let rc = 0; for (const [ps, total] of batches) { let at = c.sim_batch_buffer(); for (const p of ps) { mem().set(p, at); at += p.length; } rc |= c.sim_block_batch(SLOT, total); }
  check(rc === 0, 'blocks written in ' + batches.length + ' batch(es)'); }
/* One ready port: the capture holds 64 messages a block and every message would be captured once per
 * ready port (three by default); the firmware treats a full capture as a busy port and resets. */
c.sim_midi_ports(1, 0);
c.sim_midi_drain(1); c.sim_midi_capture(1);
check(c.sim_song_load(SLOT) === 0 && c.sim_song_play() === 0, 'song loaded and started');
const events = [];
let block = 0, started = false;
const limit = blockOf(LOOPS * 128 * U) + 20;
for (; block < limit; block++) {
  c.sim_render();
  for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) events.push({ index: events.length, block, status: d[0], d1: d[1], d2: d[2] }); }
  const playing = (c.sim_song_status(0) >>> 8) & 255;
  if (playing) started = true; else if (started) { for (let k = 0; k < 4; k++) { c.sim_render(); for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) events.push({ index: events.length, block, status: d[0], d1: d[1], d2: d[2] }); } } break; }
}
check(started, 'the song played for ' + LOOPS + ' passes', block + ' blocks');
const late = (c.sim_song_status(2) >>> 16) & 0xffff;


/* ---- 3. every scene entry sends its events before its first note ------------------------------- */
const ons = events.filter(e => (e.status & 0xf0) === 0x90 && e.d2 > 0);
const isEvent = e => (e.status & 0xf0) === 0xc0 || (e.status & 0xf0) === 0xb0;
const counts = [];
for (let n = 0; n < 2 * LOOPS; n++) {                       /* entry n: scene 1 when n is even, scene 2 when odd; 64 steps each */
  const first = ons.find(e => e.block >= blockOf(n * 64 * U) - 1);
  const before = n ? ons.find(e => e.block >= blockOf((n - 1) * 64 * U) - 1) : null;
  const lastOfPrev = before ? ons.filter(e => e.block < blockOf(n * 64 * U) - 1).pop() : null;
  counts.push(first ? events.filter(e => isEvent(e) && e.index < first.index && (!lastOfPrev || e.index > lastOfPrev.index)).length : -1);
}
check(counts.every((c, n) => c === (n % 2 ? 6 : 17)), 'every entry of scene 1 sends its 17 event messages and every entry of scene 2 its 6, before the scene\'s first note (' + LOOPS + ' passes)', counts.join(' '));
check(ons.length >= LOOPS * 256 - 8, 'the notes of every pass are there', String(ons.length));
check(late === 0, 'no late row', String(late));
console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
