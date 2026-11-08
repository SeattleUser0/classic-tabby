// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/midi-import/simulator.mjs — an imported song played through the WASM simulator
//
// Purpose
//   Task 02 Step 4 simulator check, Task 05 timing: import tests/fixtures/renoise-export.mid
//   with the importer modules exactly as the workbench does (exact timing, no quantizing),
//   write the song into the simulator's song storage the way the workbench's simulator
//   target does (song record first, then the blocks as kind-7 batches cut at the device's
//   packing boundaries), switch every track to FM6 (the DX7 engine), play the song to its
//   end with MIDI capture on, and compare what left on MIDI out with the time computed from
//   the .mid file:
//     1. every note of every row (repeats and row step lengths included) produced one
//        Note On on the track's output channel, with the model's pitch and velocity;
//     2. with the simulator draining the MIDI lanes every block (sim_midi_drain(1)), every
//        Note On and every Note Off is in the block that holds its exact time
//        (block_of(u) = ceil((u + 1) × 11025 / (tempo × 1024)) − 1 for a time of u units,
//        1 unit = 1/480 step; the song position advances tempo × 1024 / 11025 units a block,
//        exactly), tolerance one block; the largest error is reported. Where the importer
//        clipped a same-pitch overlap (a reported change), the Note Off follows the model;
//     3. the same run with the simulator's stock 10 ms control poll (the device's control
//        loop is modelled by that poll): the band is reported, not checked;
//     4. nothing left on another channel; the device channel is used where the song says
//        "device setting"; FM6 produced audio while the song played.
//
//   Run:  /usr/bin/node tests/midi-import/simulator.mjs [build/web/simulator.wasm] [file.mid]
//         (or: make midi-import-sim, after make web)
//   Exit status 0 on success; every check prints "ok" or "FAIL".
//
// Version: 0.3
//
// Revision log
//   v0.3  2026-11-07  Task 11: the empty pool size comes from the simulator's layout (sim_flash_size).
//   v0.2  2026-11-04  Task 05: exact times from the file in units, the per-block drain, note-offs
//                     checked to one block, the 10 ms-poll band reported.
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
const SLOT = 2, FM6 = 0, U = 480;                          /* GROOVE_DX7 in app/instrument.h; units a step */
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
const tempo = song.tempo || 120;
console.log(`     ${midPath.split('/').pop()}: ${song.rows.length} rows, ${song.blocks.length} blocks, ${totalSteps} steps, tempo ${tempo}, ${result.stats.offsets} notes with offsets, ${result.stats.fractionalLengths} fractional lengths`);

/* ---- 2. the expected messages: times in units from the song model (= the file, section 12 of run.mjs) */
const byId = new Map(song.blocks.map(b => [b.id, b]));
const expected = [];                                      /* { track, time (units), pitch, velocity, length (units) } */
let step0 = 0;
for (const row of song.rows) for (let rep = 0; rep < row.repeat; rep++) {
  row.blocks.forEach((id, t) => { if (!id) return; for (const n of byId.get(id).notes) if (n.step < row.steps) expected.push({ track: t, time: (step0 + n.step) * U + n.offset, pitch: n.pitch, velocity: n.velocity, length: n.length }); });
  step0 += row.steps;
}
const songEndUnits = step0 * U;
const blockOf = u => Math.ceil((u + 1) * 11025 / (tempo * 1024)) - 1;   /* the block whose window holds unit position u */
const clips = (result.warnings.find(w => w.kind === 'overlapClipped') || { count: 0 }).count;

/* ---- 3. play it through, with the per-block drain and with the stock 10 ms poll ------------ */
function play(drainEveryBlock) {
  const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(wasmPath)), {}).exports;
  c._initialize(); c.sim_boot(1);
  const mem = () => new Uint8Array(c.memory.buffer);
  const out = { ready: (c.sim_song_storage_state() & 255) === 1, fm6: true, deviceChannel: [] };
  for (let t = 0; t < 8; t++) if (c.sim_select(t, FM6) !== 0) out.fm6 = false;
  out.deviceChannel = Array.from({ length: 8 }, (_, t) => c.sim_midi_setting(t, 1) >>> 0);
  /* Write as sdk/Simulator.js 'song-write' does: record first, then kind-7 batches. */
  mem().set(Format.encodeRecord(song), c.sim_file());
  out.recordResult = c.sim_song_record_write(SLOT);
  const batches = []; { let parts = [], total = 0, fill = 0, sectors = 1;
    for (const b of song.blocks.slice().sort((a, b) => a.id - b.id)) {
      const rec = Format.encodeBlockRecord(b, 0), size = rec.length;
      if (fill + size > 4076) { if (sectors === 8) { batches.push([parts, total]); parts = []; total = 0; sectors = 0; } sectors++; fill = 0; }
      parts.push(rec); total += size; fill += size;
    }
    if (parts.length) batches.push([parts, total]); }
  out.batches = batches.length; out.stored = 0; out.batchResult = 0;
  for (const [parts, total] of batches) {
    let at = c.sim_batch_buffer(); for (const p of parts) { mem().set(p, at); at += p.length; }
    out.batchResult = c.sim_block_batch(SLOT, total); if (out.batchResult !== 0) break; out.stored += parts.length;
  }
  out.free = c.sim_song_free() >>> 0;
  /* v0.3 (Task 11): the empty pool follows the layout: (block sectors) x 4076 bytes, 96 x 4076 = 391296 stock. */
  out.pool = ((c.sim_flash_size ? c.sim_flash_size() : 536576) - 73728) / 4096 - 17;
  out.pool *= 4076;
  c.sim_midi_drain(drainEveryBlock ? 1 : 0);
  c.sim_midi_capture(1);
  out.loaded = c.sim_song_load(SLOT) === 0; out.started = c.sim_song_play() === 0;
  const events = [];                                      /* { block, status, d1, d2 } on port 1 */
  let block = 0, started = false, rmsSum = 0, rmsBlocks = 0;
  const frames = c.sim_block_frames(), limit = blockOf(songEndUnits) + 400;
  for (; block < limit; block++) {
    const buf = c.sim_render();
    if (block % 50 === 0) { const f = new Float32Array(c.memory.buffer, buf, frames * 2); let s = 0; for (const x of f) s += x * x; rmsSum += Math.sqrt(s / f.length); rmsBlocks++; }
    for (;;) {
      const w = c.sim_midi_output() >>> 0; if (!w) break;
      const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n);
      if (port === 0 && d[0] !== 0xf8) events.push({ index: events.length, block, status: d[0], d1: d[1], d2: d[2] });
    }
    const playing = (c.sim_song_status(0) >>> 8) & 255;
    if (playing) started = true; else if (started) { for (let k = 0; k < 4; k++) { c.sim_render(); for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) events.push({ index: events.length, block, status: d[0], d1: d[1], d2: d[2] }); } } break; }
  }
  out.playedToEnd = started && block < limit; out.blocks = block; out.frames = frames;
  out.underruns = c.sim_song_status(2) & 0xffff; out.late = (c.sim_song_status(2) >>> 16) & 0xffff;
  out.rms = rmsSum / rmsBlocks; out.events = events;
  return out;
}

/* Match the captured messages with the model; errors in blocks relative to blockOf(time). */
function compare(run) {
  const channelOf = t => outChannels[t] === null ? run.deviceChannel[t] : outChannels[t];
  const ons = run.events.filter(e => (e.status & 0xf0) === 0x90 && e.d2 > 0), offs = run.events.filter(e => (e.status & 0xf0) === 0x80 || ((e.status & 0xf0) === 0x90 && e.d2 === 0));
  const stopBlock = run.events.find(e => e.status === 0xfc)?.block ?? run.blocks;
  const used = new Set(), r = { matched: 0, missing: [], badVelocity: 0, onErrs: [], offErrs: [], noOff: 0, stray: 0 };
  for (const x of expected) {
    const want = blockOf(x.time), ch = channelOf(x.track);
    let best = -1, bestErr = 1e9;
    ons.forEach((e, i) => { if (used.has(i) || e.d1 !== x.pitch || (e.status & 15) !== ch) return; const err = Math.abs(e.block - want); if (err < bestErr) { bestErr = err; best = i; } });
    if (best < 0 || bestErr > 40) { r.missing.push(x); continue; }
    used.add(best); r.matched++;
    const on = ons[best];
    r.onErrs.push(on.block - want);
    if (process.env.DEBUG && r.onErrs.length <= 12) console.log('     debug: time', x.time, 'units, pitch', x.pitch, 'expected block', want, 'got', on.block);
    if (on.d2 !== x.velocity) r.badVelocity++;
    const off = offs.find(e => e.index > on.index && e.d1 === x.pitch && (e.status & 15) === (on.status & 15) && !e.used);
    if (!off) { r.noOff++; continue; }
    off.used = true;
    r.offErrs.push(off.block - Math.min(blockOf(x.time + x.length), stopBlock));
  }
  r.stray = ons.filter(e => !Array.from({ length: 8 }, (_, t) => channelOf(t)).includes(e.status & 15)).length;
  r.ons = ons.length; r.channelOf = channelOf; r.onsByChannel = ch => ons.some(e => (e.status & 15) === ch);
  const stats = a => ({ max: a.reduce((m, e) => Math.max(m, Math.abs(e)), 0), min: Math.min(...a), maxPos: Math.max(...a), mean: a.reduce((s, e) => s + e, 0) / a.length });
  r.on = stats(r.onErrs); r.off = stats(r.offErrs);
  return r;
}

const exact = play(true);
check(exact.ready && exact.fm6 && exact.recordResult === 0 && exact.batchResult === 0 && exact.stored === song.blocks.length, `song written: record and ${song.blocks.length} blocks in ${exact.batches} batch(es) (format 1)`, `results ${exact.recordResult}/${exact.batchResult}, stored ${exact.stored}`);
check(exact.free === exact.pool - song.blocks.reduce((n, b) => n + Format.encodeBlockRecord(b, 0).length, 0), 'free space fell by the block records', exact.free + ' free');
check(exact.loaded && exact.started && exact.playedToEnd, 'song loads, plays to its end and stops by itself', `${exact.blocks} blocks = ${(exact.blocks * exact.frames / 44100).toFixed(1)} s of audio`);
check(exact.underruns === 0 && exact.late === 0, 'no row underruns, nothing late', `${exact.underruns} underruns, ${exact.late} late`);
check(exact.rms > 0.001, 'FM6 produced audio', `mean RMS ${exact.rms.toFixed(4)}`);
const cx = compare(exact);
check(cx.ons === expected.length && cx.missing.length === 0, 'every model note was sent once on its track channel', cx.missing.length ? `${cx.missing.length} missing, first: track ${cx.missing[0].track + 1} time ${cx.missing[0].time} pitch ${cx.missing[0].pitch}` : `${cx.matched} matched, ${cx.ons} sent`);
check(cx.badVelocity === 0, 'velocities match', `${cx.badVelocity} differ`);
check(cx.on.max <= 1, 'per-block drain: every Note On within one block of the time computed from the file', `largest error ${cx.on.max} block(s) (range ${cx.on.min}..${cx.on.maxPos}, mean ${cx.on.mean.toFixed(2)}; a tick fires in the block that holds the time, so 0 or −1 is exact)`);
check(cx.noOff === 0 && cx.off.max <= 1, 'per-block drain: every Note Off within one block of start + length (model = file apart from the reported overlap clips)', `largest error ${cx.off.max} block(s), ${cx.noOff} without a Note Off, ${clips} overlap clip(s) reported by the importer`);
check(cx.stray === 0, 'no note left on a channel the song does not use', `${cx.stray} stray`);
for (let t = 0; t < 4; t++) check(cx.onsByChannel(outChannels[t]), `track ${t + 1} notes on song channel ${outChannels[t] + 1}`);
check(cx.onsByChannel(exact.deviceChannel[4]), 'track 5 notes on the device channel ' + (exact.deviceChannel[4] + 1));
console.log(`     per-block drain: ${exact.events.length} events on port 1, song ran ${exact.blocks} blocks; Note On error range ${cx.on.min}..${cx.on.maxPos} blocks, Note Off ${cx.off.min}..${cx.off.maxPos}`);

/* ---- 4. the same song under the stock 10 ms control poll: reported, not checked ---------- */
const poll = play(false);
const cp = compare(poll);
console.log(`     10 ms control poll (reported only): Note On error range ${cp.on.min}..${cp.on.maxPos} blocks (largest ${cp.on.max}, mean ${cp.on.mean.toFixed(2)}), Note Off ${cp.off.min}..${cp.off.maxPos}; ${cp.missing.length} missing`);
check(cp.missing.length === 0 && cp.on.max <= 5, '10 ms poll: every note still arrives within the poll period (reported band above)', `largest ${cp.on.max} blocks`);
console.log(failures ? `${failures} check(s) FAILED` : 'all checks passed');
process.exit(failures ? 1 : 0);
