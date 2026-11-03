// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/midi-import/simulator.mjs — an imported song played through the WASM simulator
//
// Purpose
//   Task 02 Step 4 simulator check: import tests/fixtures/renoise-export.mid with the
//   importer modules exactly as the workbench does, write the song into the simulator's
//   song storage the way the workbench's simulator target does (song record first, then
//   the blocks as kind-7 batches cut at the device's packing boundaries), switch every
//   track to FM6 (the DX7 engine), play the song to its end with MIDI capture on, and
//   compare what left on MIDI out with the song model:
//     1. every note of every row (repeats and row step lengths included) produced one
//        Note On on the track's output channel, with the model's pitch and velocity;
//     2. its Note Off came `length` steps later, or at the end of the song;
//        tolerance for both: 3.5 blocks (the tick runs once per block, so a step boundary
//        lands inside a block, and the lane drain delivers one block later: ± 3 blocks,
//        about 9 ms, measured on renoise-export.mid with no drift over 216 s);
//     3. nothing left on another channel; the device channel is used where the song says
//        "device setting";
//     4. FM6 produced audio while the song played (RMS over the rendered blocks).
//   Timing is measured in audio blocks (128 frames at 44.1 kHz; a 16th at the song's BPM is
//   44100 × 60 / (BPM × 4 × 128) blocks).
//
//   Run:  /usr/bin/node tests/midi-import/simulator.mjs [build/web/simulator.wasm] [file.mid]
//         (or: make midi-import-sim, after make web)
//   Exit status 0 on success; every check prints "ok" or "FAIL".
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-02  Initial version (Task 02, Step 4).

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..', '..');
const Midi = require(join(root, 'web/import/midi-parse.js'));
const Format = require(join(root, 'web/import/song-format.js'));
const Song = require(join(root, 'web/import/midi-song.js'));

const wasmPath = process.argv[2] ?? join(root, 'build/web/simulator.wasm');
const midPath = process.argv[3] ?? join(root, 'tests/fixtures/renoise-export.mid');
const SLOT = 2, FM6 = 0;                                   /* GROOVE_DX7 in app/instrument.h */
let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

/* ---- 1. import the file as the workbench panel would (default assignments) ------------ */
const parsed = Midi.parse(new Uint8Array(readFileSync(midPath)));
const analysis = Song.analyze(parsed);
/* Output channels: tracks 1..4 on song channels 3, 5, 7, 9; tracks 5..8 on the device setting. */
const outChannels = [2, 4, 6, 8, null, null, null, null];
const result = Song.convert(analysis, { fileName: midPath.split('/').pop(), assignments: Song.defaultAssignments(analysis), outChannels, name: 'SIM CHECK', projectSlot: 0 });
const song = result.song;
const v = Format.validate(song);
check(v.ok, 'imported song validates', v.errors[0]);
const totalSteps = song.rows.reduce((n, r) => n + r.repeat * r.steps, 0);
console.log(`     ${midPath.split('/').pop()}: ${song.rows.length} rows, ${song.blocks.length} blocks, ${totalSteps} steps, tempo ${song.tempo}`);

/* ---- 2. the simulator ---------------------------------------------------------------- */
const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(wasmPath)), {}).exports;
c._initialize(); c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
check((c.sim_song_storage_state() & 255) === 1, 'song storage READY after boot');
for (let t = 0; t < 8; t++) check(c.sim_select(t, FM6) === 0, `track ${t + 1} switched to FM6`);
const deviceChannel = Array.from({ length: 8 }, (_, t) => c.sim_midi_setting(t, 1) >>> 0);

/* Write as sdk/Simulator.js 'song-write' does: record first, then kind-7 batches. */
const record = Format.encodeRecord(song);
mem().set(record, c.sim_file());
let r = c.sim_song_record_write(SLOT);
check(r === 0, 'song record written to slot ' + (SLOT + 1), 'result ' + r);
const batches = []; { let parts = [], total = 0, fill = 0, sectors = 1;
  for (const b of song.blocks.slice().sort((a, b) => a.id - b.id)) {
    const rec = Format.encodeBlockRecord(b, 0), size = rec.length;
    if (fill + size > 4076) { if (sectors === 8) { batches.push([parts, total]); parts = []; total = 0; sectors = 0; } sectors++; fill = 0; }
    parts.push(rec); total += size; fill += size;
  }
  if (parts.length) batches.push([parts, total]); }
let stored = 0;
for (const [parts, total] of batches) {
  let at = c.sim_batch_buffer(); for (const p of parts) { mem().set(p, at); at += p.length; }
  r = c.sim_block_batch(SLOT, total); if (r !== 0) break; stored += parts.length;
}
check(r === 0 && stored === song.blocks.length, `${song.blocks.length} blocks stored in ${batches.length} batch(es)`, 'result ' + r);
check(c.sim_song_free() === 391296 - song.blocks.reduce((n, b) => n + Format.encodeBlockRecord(b, 0).length, 0), 'free space fell by the block records', c.sim_song_free() + ' free');

/* ---- 3. play it through with capture on ---------------------------------------------- */
const blocksPerStep = 44100 * 60 / ((song.tempo || 120) * 4 * 128);
c.sim_midi_capture(1);
check(c.sim_song_load(SLOT) === 0, 'song loads');
check(c.sim_song_play() === 0, 'song starts');
const events = [];                                        /* { block, port, status, d1, d2 } */
let block = 0, started = false, rmsSum = 0, rmsBlocks = 0;
const frames = c.sim_block_frames();
const limit = Math.ceil((totalSteps + 64) * blocksPerStep) + 400;
for (; block < limit; block++) {
  const out = c.sim_render();
  if (block % 50 === 0) { const f = new Float32Array(c.memory.buffer, out, frames * 2); let s = 0; for (const x of f) s += x * x; rmsSum += Math.sqrt(s / f.length); rmsBlocks++; }
  for (;;) {
    const w = c.sim_midi_output() >>> 0; if (!w) break;
    const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n);
    if (port === 0) events.push({ index: events.length, block, status: d[0], d1: d[1], d2: d[2] });
  }
  const playing = (c.sim_song_status(0) >>> 8) & 255;
  if (playing) started = true; else if (started) break;
}
check(started && block < limit, 'song played to its end and stopped by itself', `${block} blocks, ~${(block / blocksPerStep).toFixed(1)} steps`);
check((c.sim_song_status(2) >>> 0) === 0, 'no row underruns', `${c.sim_song_status(2)}`);
check(rmsSum / rmsBlocks > 0.001, 'FM6 produced audio', `mean RMS ${(rmsSum / rmsBlocks).toFixed(4)}`);

/* ---- 4. compare with the model --------------------------------------------------------- */
const byId = new Map(song.blocks.map(b => [b.id, b]));
const expected = [];                                      /* { track, channel, step, pitch, velocity, length } */
let step0 = 0;
for (const row of song.rows) for (let rep = 0; rep < row.repeat; rep++) {
  row.blocks.forEach((id, t) => { if (!id) return; for (const n of byId.get(id).notes) if (n.step < row.steps) expected.push({ track: t, step: step0 + n.step, pitch: n.pitch, velocity: n.velocity, length: n.length }); });
  step0 += row.steps;
}
const channelOf = t => outChannels[t] === null ? deviceChannel[t] : outChannels[t];
const ons = events.filter(e => (e.status & 0xf0) === 0x90 && e.d2 > 0), offs = events.filter(e => (e.status & 0xf0) === 0x80 || ((e.status & 0xf0) === 0x90 && e.d2 === 0));
const start0 = events.find(e => e.status === 0xfa)?.block ?? 0;
check(start0 > 0 || events.some(e => e.status === 0xfa), 'MIDI Start was sent');
check(ons.length === expected.length, 'note-on count equals the model', `${ons.length} sent, ${expected.length} expected`);
const used = new Set();
const timeErrs = [];
let matched = 0, badChannel = 0, badVelocity = 0, badTime = 0, badLength = 0, maxTimeErr = 0, missing = [];
const endBlock = events.find(e => e.status === 0xfc)?.block ?? block;
for (const x of expected) {
  const want = start0 + x.step * blocksPerStep;
  let best = -1, bestErr = 1e9;
  ons.forEach((e, i) => { if (used.has(i) || e.d1 !== x.pitch || (e.status & 15) !== channelOf(x.track)) return; const err = Math.abs(e.block - want); if (err < bestErr) { bestErr = err; best = i; } });
  if (best < 0 || bestErr > 2 * blocksPerStep) { missing.push(x); continue; }
  used.add(best); matched++;
  const on = ons[best];
  if (bestErr > 3.5) badTime++; maxTimeErr = Math.max(maxTimeErr, bestErr);
  if (on.d2 !== x.velocity) badVelocity++;
  const off = offs.find(e => e.index > on.index && e.d1 === x.pitch && (e.status & 15) === (on.status & 15) && !e.used);
  if (!off) { badLength++; continue; }
  off.used = true;
  const wantOff = Math.min(on.block + x.length * blocksPerStep, endBlock);
  if (Math.abs(off.block - wantOff) > 3.5) { badLength++; if (process.env.DEBUG && badLength <= 15) console.log('     length mismatch: track', x.track + 1, 'step', x.step, 'pitch', x.pitch, 'len', x.length, 'measured', ((off.block - on.block) / blocksPerStep).toFixed(2), 'steps'); }
  if (process.env.DEBUG) timeErrs.push([x.step, on.block - want]);
}
check(missing.length === 0, 'every model note was sent on its track channel at its step', missing.length ? `${missing.length} missing, first: track ${missing[0].track + 1} step ${missing[0].step} pitch ${missing[0].pitch}` : `${matched} matched`);
check(badVelocity === 0, 'velocities match', `${badVelocity} differ`);
check(badTime === 0, 'note-on timing within one tick block of the step', `max error ${maxTimeErr.toFixed(1)} blocks`);
check(badLength === 0, 'note lengths match (Note Off at start + length, or at the song end)', `${badLength} differ`);
const stray = ons.filter(e => !Array.from({ length: 8 }, (_, t) => channelOf(t)).includes(e.status & 15)).length;
check(stray === 0, 'no note left on a channel the song does not use', `${stray} stray`);
for (let t = 0; t < 4; t++) check(ons.some(e => (e.status & 15) === outChannels[t]), `track ${t + 1} notes on song channel ${outChannels[t] + 1}`);
check(ons.some(e => (e.status & 15) === deviceChannel[4]), 'track 5 notes on the device channel ' + (deviceChannel[4] + 1));
if (process.env.DEBUG) { const n = timeErrs.length; const m = a => (a.reduce((s, e) => s + e[1], 0) / a.length).toFixed(2); console.log('     timing error (blocks): first 100 mean', m(timeErrs.slice(0, 100)), 'last 100 mean', m(timeErrs.slice(n - 100)), 'max', Math.max(...timeErrs.map(e => Math.abs(e[1]))).toFixed(1)); }
console.log(`     ${events.length} events on port 1, song ran ${block} blocks (${(block * frames / 44100).toFixed(1)} s of audio)`);
console.log(failures ? `${failures} check(s) FAILED` : 'all checks passed');
process.exit(failures ? 1 : 0);
