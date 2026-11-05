// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/wrong-room-sim.mjs — the all-devices fixture played through the WASM simulator
//
// Purpose
//   Task 09 Step 3: import tests/midi-import/fixtures/wrong-room-all.mid with the Wrong Room
//   profile exactly as the workbench does (OUT CH from the file, the FM6 part pinned to track 8,
//   the rig's gaps applied to the events), write the song into the simulator's song storage the
//   way the simulator target does, play it to the end with MIDI capture on, and check on MIDI out:
//     1. every note-on leaves on its part's planned channel (1, 2, 3, 4, 5, 6, 10 and 9) with that
//        part's pitches, 256 note-ons in all, nothing on another channel;
//     2. every row's events (program changes, the NightSky bank select, CCs on the pedal channels)
//        arrive before the row's first note-on, each exactly once per row, on its channel; row 1 at
//        PLAY included, because the fixture puts the H90 (the one device with a rig gap) last, so
//        its gap stalls nothing; row 2's stream is pre-fired by the gap;
//     3. Song Position and Start before any channel message, Stop last, 0 late rows; the H90's rig
//        gap is dropped because the H90 is last in each row's stream (nothing waits on it).
//
//   Run:  /usr/bin/node tests/workbench/wrong-room-sim.mjs [build/web/simulator.wasm]
//         (or: make midi-import-sim, after make web)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-05  Initial version (Task 09, checkpoint d).

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
const result = Song.convert(analysis, { fileName: 'wrong-room-all.mid', rig, library, name: 'WRONG ROOM', projectSlot: 0 });
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
const limit = blockOf(128 * U) + 400;
for (; block < limit; block++) {
  c.sim_render();
  for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) events.push({ index: events.length, block, status: d[0], d1: d[1], d2: d[2] }); }
  const playing = (c.sim_song_status(0) >>> 8) & 255;
  if (playing) started = true; else if (started) { for (let k = 0; k < 4; k++) { c.sim_render(); for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) events.push({ index: events.length, block, status: d[0], d1: d[1], d2: d[2] }); } } break; }
}
check(started && block < limit, 'played to the end', block + ' blocks');
const late = (c.sim_song_status(2) >>> 16) & 0xffff;

/* ---- 3. notes on their channels -------------------------------------------------------------- */
const ons = events.filter(e => (e.status & 0xf0) === 0x90 && e.d2 > 0);
const byCh = {}; for (const e of ons) (byCh[e.status & 15] ||= []).push(e);
check(ons.length === 256, '256 note-ons (8 parts × 32 notes)', String(ons.length));
check(Object.keys(byCh).sort().join() === Object.keys(pitches).sort().join(), 'note-ons on channels 1, 2, 3, 4, 5, 6, 9 and 10 only', Object.keys(byCh).map(k => Number(k) + 1).join());
check(Object.entries(pitches).every(([ch, ps]) => (byCh[ch] || []).length === 32 && byCh[ch].every(e => ps.includes(e.d1))), 'each channel carries its part\'s 32 notes with its pitches (the FM6 part on channel 9 from track 8)');

/* ---- 4. events before each row's first note ----------------------------------------------------- */
const firstNoteIndex = row => ons.find(e => e.block >= blockOf(rowStart[row]) - 1).index;
const pcs = events.filter(e => (e.status & 0xf0) === 0xc0), ccs = events.filter(e => (e.status & 0xf0) === 0xb0);
const expectRow = [
  [['cc', 0, 74, 90], ['pc', 1, 3], ['cc', 1, 74, 100], ['pc', 2, 1], ['pc', 3, 5], ['pc', 4, 7], ['pc', 5, 12], ['pc', 9, 2], ['pc', 10, 7], ['cc', 10, 24, 1], ['pc', 11, 3], ['cc', 11, 102, 127], ['cc', 13, 0, 1], ['pc', 13, 72], ['cc', 13, 63, 127], ['pc', 14, 12], ['pc', 15, 0]],
  [['pc', 1, 4], ['pc', 3, 6], ['pc', 5, 13], ['pc', 11, 4], ['pc', 14, 13], ['pc', 15, 1]]];
let allBefore = true, allOnce = true, detail = [];
expectRow.forEach((list, row) => {
  const lo = row ? firstNoteIndex(row - 1) : -1, hi = firstNoteIndex(row);
  for (const [kind, ch, a, b] of list) {
    const hits = (kind === 'pc' ? pcs : ccs).filter(e => (e.status & 15) === ch && e.d1 === a && (kind === 'pc' || e.d2 === b) && e.index > lo && e.index < hi);
    if (hits.length !== 1) { allOnce = false; detail.push(`row ${row + 1} ${kind} ch ${ch + 1} ${a}${kind === 'cc' ? '=' + b : ''}: ${hits.length}`); }
  }
  const stray = events.filter(e => e.index > lo && e.index < hi && ((e.status & 0xf0) === 0xc0 || (e.status & 0xf0) === 0xb0)).length;
  if (stray !== list.length) { allBefore = false; detail.push(`row ${row + 1}: ${stray} event messages before its first note, ${list.length} expected`); }
});
check(allOnce && allBefore, 'every row event arrives once, on its channel, before the row\'s first note (17 in row 1, 6 in row 2)', detail.join('; '));
const bank = ccs.find(e => (e.status & 15) === 13 && e.d1 === 0), pc72 = pcs.find(e => (e.status & 15) === 13 && e.d1 === 72);
check(bank && pc72 && bank.index < pc72.index, 'the NightSky bank select (CC 0 = 1) precedes its program change (PC 72 = preset 200)');
const h90 = pcs.filter(e => (e.status & 15) === 14), h90ccs = ccs.filter(e => (e.status & 15) === 14);
check(h90.length === 2 && h90ccs.length === 0, 'the H90 gets its two program changes and no CC (the gap is silent)');
const firstChannelMessage = events.findIndex(e => e.status < 0xf0), startIndex = events.findIndex(e => e.status === 0xfa);
check(startIndex >= 0 && startIndex < firstChannelMessage && events.slice(0, startIndex).every(e => e.status === 0xf2) && events[events.length - 1].status === 0xfc, 'Song Position then Start before any channel message, Stop last', events.slice(0, 3).map(e => e.status.toString(16)).join(' '));
check(late === 0, 'no late row', String(late));
console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
