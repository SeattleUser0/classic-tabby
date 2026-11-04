// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/host/make-v1-reference.mjs — capture how tabby-v02.0 plays a v1 song (reference)
//
// Purpose
//   Task 05 keeps v1 blocks (3-byte notes) playing exactly as on tabby-v02.0, project swing
//   included. This script plays a fixed v1 song through the simulator wasm built from the
//   tabby-v02.0 tag (commit ad73b97) and writes tests/host/v1_reference.inc: the song's
//   bytes and, for swing 0 and swing 25, every MIDI message on port 1 (clock excluded) with
//   the audio block it was enqueued in. tests/host/smoke.c section 12 replays the same bytes
//   on the current build and compares message for message, each within one block.
//
//   The reference wasm is the tag's tree with two lines added to web/engine/Simulator.c
//   (nothing in app/): `groove_midi_poll()` after the engine render in sim_render, so a
//   message is logged in the block that enqueued it (the stock 10 ms control poll would
//   blur the time by up to 3 blocks), and an export of groove_sequence_setting_edit to set
//   the project swing. The sequencer code of the tag is untouched.
//
//   Procedure (done once; the .inc is committed):
//     git worktree add /tmp/v020 tabby-v02.0
//     (apply the two Simulator.c lines above in /tmp/v020)
//     make -C /tmp/v020 web
//     /usr/bin/node tests/host/make-v1-reference.mjs /tmp/v020/build/web/simulator.wasm tests/host/v1_reference.inc
//
//   The song (tempo override 120, 3 rows, loop off):
//     row 1  16 steps x2   T1 block 1 (chords, a retrigger), T2 block 2 (bass: legato, retrigger,
//                          a note running into the next row), T3 block 3 (hats, every step)
//     row 2  32 steps x1   T1 block 4 (a 40-step note crossing the row end), T2 block 2,
//                          T4 block 5 (a note on step 0 and one on step 31)
//     row 3  16 steps x1   T1 block 1, T4 block 5
//   Output channels: T1 1, T2 2, T3 10, T4 4. No probability (the roll is random).
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-03  Initial version (Task 05, checkpoint b).

import { readFileSync, writeFileSync } from 'node:fs';

const [wasmPath, outPath] = process.argv.slice(2);
if (!wasmPath || !outPath) { console.error('usage: make-v1-reference.mjs <simulator.wasm> <out.inc>'); process.exit(2); }

/* ---- the song, v1 bytes ------------------------------------------------------------- */
function v1block(notes) {                                   /* notes: [step, pitch, velocity, length, retrigger] */
  const steps = Array.from({ length: 64 }, () => []);
  for (const [s, p, v, l, r] of notes) steps[s].push([p, v | (r ? 128 : 0), l]);
  const out = [];
  for (const list of steps) { out.push(list.length); for (const n of list.sort((a, b) => a[0] - b[0])) out.push(...n); }
  return Uint8Array.from(out);
}
export const blocks = {
  1: v1block([[0, 60, 100, 2, 0], [0, 64, 90, 2, 0], [0, 67, 80, 2, 0], [4, 62, 110, 1, 0], [6, 62, 100, 2, 1], [8, 60, 100, 4, 0], [10, 60, 70, 1, 0], [12, 65, 100, 3, 0], [15, 64, 100, 1, 0]]),
  2: v1block([[0, 36, 120, 4, 0], [2, 36, 100, 2, 0], [6, 36, 100, 1, 1], [8, 38, 100, 16, 0], [12, 41, 90, 2, 0]]),
  3: v1block(Array.from({ length: 16 }, (_, s) => [s, 42, s % 4 ? 60 : 100, 1, 0])),
  4: v1block([[0, 60, 100, 40, 0], [16, 67, 100, 8, 0], [24, 72, 100, 8, 1]]),
  5: v1block([[0, 48, 100, 1, 0], [31, 50, 100, 1, 0], [20, 52, 100, 6, 0]]),
};
export function record() {
  const f = new Uint8Array(4096).fill(0xff); f.fill(0, 0, 2624);
  f.set([0x46, 0x4d, 0x31, 0x47], 0);                        /* FM1G */
  f[20] = 1; f.set(Array.from('V1 REFERENCE', c => c.charCodeAt(0)), 24);
  f[36] = 0; f[37] = 0; f[38] = 120; f[39] = 0; f[40] = 3; f[42] = 0;
  f.set([1, 2, 10, 4, 0, 0, 0, 0], 48);
  const row = (r, ids, repeat, steps) => { const at = 64 + 20 * r; ids.forEach((id, t) => { f[at + 2 * t] = id & 255; f[at + 2 * t + 1] = id >> 8; }); f[at + 16] = repeat; f[at + 17] = 0; f[at + 18] = steps; };
  row(0, [1, 2, 3, 0, 0, 0, 0, 0], 2, 16);
  row(1, [4, 2, 0, 5, 0, 0, 0, 0], 1, 32);
  row(2, [1, 0, 0, 5, 0, 0, 0, 0], 1, 16);
  return f;                                                  /* generation, target, CRC and commit are set by the device */
}

/* ---- play it on the reference wasm -------------------------------------------------- */
const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(wasmPath)), {}).exports;
c._initialize(); c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
for (const [id, bytes] of Object.entries(blocks)) { mem().set(bytes, c.sim_file()); if (c.sim_block_write(0, Number(id), bytes.length) !== 0) throw new Error('block ' + id); }
mem().set(record(), c.sim_file());
if (c.sim_song_record_write(0) !== 0) throw new Error('record');
const logs = {};
for (const swing of [0, 25]) {
  c.sim_sequence_setting_edit(0, -60); if (swing) c.sim_sequence_setting_edit(0, swing);
  if (c.sim_song_load(0) !== 0) throw new Error('load');
  c.sim_midi_capture(1); for (;;) if (!(c.sim_midi_output() >>> 0)) break;
  if (c.sim_song_play() !== 0) throw new Error('play');
  const log = []; let started = false;
  for (let block = 0; block < 20000; block++) {
    c.sim_render();
    for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) log.push([d[0], n > 1 ? d[1] : 0, n > 2 ? d[2] : 0, block]); }
    const playing = (c.sim_song_status(0) >>> 8) & 255;
    if (playing) started = true; else if (started) { for (let k = 0; k < 4; k++) { c.sim_render(); for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) log.push([d[0], n > 1 ? d[1] : 0, n > 2 ? d[2] : 0, block]); } } break; }
  }
  c.sim_midi_capture(0);
  logs[swing] = log;
  console.log(`swing ${swing}: ${log.length} messages, last at block ${log[log.length - 1][3]}`);
}

/* ---- the .inc ----------------------------------------------------------------------- */
const hex = a => Array.from(a, x => '0x' + x.toString(16).padStart(2, '0'));
let out = `/* tests/host/v1_reference.inc: generated by tests/host/make-v1-reference.mjs from the tabby-v02.0
 * simulator (commit ad73b97, Simulator.c patched to drain MIDI every block). Do not edit. */
`;
for (const [id, bytes] of Object.entries(blocks)) out += `static const uint8_t v1ref_block${id}[${bytes.length}] = {${hex(bytes).join(',')}};\n`;
out += `static const struct { uint8_t id; const uint8_t *bytes; unsigned length; } v1ref_blocks[] = {${Object.entries(blocks).map(([id, b]) => `{${id}, v1ref_block${id}, ${b.length}}`).join(', ')}};\n`;
const rec = record();
out += `static const uint8_t v1ref_record[2624] = {${hex(rec.subarray(0, 2624)).join(',')}};\n`;
out += `struct v1ref_msg { uint8_t s, d1, d2; uint32_t block; };\n`;
for (const swing of [0, 25]) out += `static const struct v1ref_msg v1ref_swing${swing}[${logs[swing].length}] = {${logs[swing].map(m => `{${m[0]},${m[1]},${m[2]},${m[3]}}`).join(',')}};\n`;
writeFileSync(outPath, out);
console.log('wrote ' + outPath);
