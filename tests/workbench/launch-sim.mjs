// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/launch-sim.mjs — a scripted 32-bar performance with track launches (Task 06)
//
// Purpose
//   Step 3 of docs/tasks/TASK-06-track-launching.md: play a song on the simulator wasm with
//   launches, stops, a scene jump and "back to song" at scripted bars, and check that every
//   MIDI note-on lands within one block of the time a model of the performance predicts, that
//   nothing the model does not predict is sent, and that every note-on has its note-off by the
//   end. The MIDI lanes are drained every block (sim_midi_drain), so the check measures the
//   sequencer and not the simulator's 10 ms control poll. The bar count of the master clock
//   and the per-track status words are checked at a few points. The pad colours of the TRACK
//   LAUNCH page are read once through sim_pad_color.
//
//   The song (120 BPM, loop on, channels 10 / 2 / 3 for T1..T3):
//     block 1  hats: pitch 42 on every one of 64 steps, 240 units long
//     block 2  bass: 36 on step 0, 38 on step 8 (480 units)
//     block 3  melody A: 60 / 64 / 67 on steps 0 / 4 / 8
//     block 4  melody B: 72 on step 0, 76 on step 15 for 1920 units (rings past the bar)
//     row 0 (16 steps, x2): T1 1, T2 2, T3 3   row 1 (16): T1 1, T2 2, T3 4   row 2 (32): T1 1, T3 3
//   The script (each action ten blocks into the bar named, landing at the next bar):
//     bar 1  launch T3 pattern 1          bar 3  stop T2           bar 5  launch T2 pattern 0
//     bar 7  launch T3 pattern 2 (32 steps)   bar 11 scene jump to row 1 (lands at bar 12)
//     bar 14 launch T3 pattern 0          bar 17 T3 back to song   bar 20 stop T1
//     bar 22 launch T1 pattern 0          bar 32 stop
//
//   Run:  /usr/bin/node tests/workbench/launch-sim.mjs build/web/simulator.wasm
//         (or: make midi-import-sim, after make web)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-04  Initial version (Task 06, checkpoint d).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const wasmPath = process.argv[2] || join(root, 'build/web/simulator.wasm');
(0, eval)(readFileSync(join(root, 'web/timed-note/timed-note.js'), 'utf8'));
const TN = globalThis.TabbyTimedNote;

let failed = 0, passed = 0;
function check(cond, what, detail) {
  if (cond) { passed++; console.log('ok   ' + what); }
  else { failed++; console.log('FAIL ' + what + (detail === undefined ? '' : ' — ' + detail)); }
}
const TEMPO = 120, U = 480, BARU = 16 * U;
const blockOf = u => Math.ceil((u + 1) * 11025 / (TEMPO * 1024)) - 1;

/* ---- the song -------------------------------------------------------------------- */
const blocks = {
  1: Array.from({ length: 64 }, (_, s) => [s, 42, 240]),
  2: [[0, 36, 480], [8, 38, 480]],
  3: [[0, 60, 480], [4, 64, 480], [8, 67, 480]],
  4: [[0, 72, 480], [15, 76, 1920]],
};
const rows = [
  { block: [1, 2, 3, 0, 0, 0, 0, 0], repeat: 2, steps: 16 },
  { block: [1, 2, 4, 0, 0, 0, 0, 0], repeat: 1, steps: 16 },
  { block: [1, 0, 3, 0, 0, 0, 0, 0], repeat: 1, steps: 32 },
];
const channel = [10, 2, 3, 0, 0, 0, 0, 0];
function encodeBlock(notes) {
  const steps = Array.from({ length: 64 }, () => []);
  for (const [s, p, l] of notes) steps[s].push(TN.encode({ pitch: p, velocity: 100, retrigger: false, offset: 0, length: l }));
  const out = []; for (const list of steps) { out.push(list.length); for (const n of list) out.push(...n); }
  return Uint8Array.from(out);
}
function record() {
  const f = new Uint8Array(4096).fill(0xff); f.fill(0, 0, 2624);
  f.set([0x46, 0x4d, 0x31, 0x47], 0); f[20] = 1; f.set(Array.from('LAUNCH SIM  ', c => c.charCodeAt(0)), 24);
  f[37] = 1; f[38] = TEMPO; f[40] = rows.length; f[42] = 0;
  channel.forEach((c, t) => { f[48 + t] = c; });
  rows.forEach((r, i) => { const at = 64 + 20 * i; r.block.forEach((id, t) => { f[at + 2 * t] = id & 255; f[at + 2 * t + 1] = id >> 8; }); f[at + 16] = r.repeat; f[at + 17] = 0; f[at + 18] = r.steps; });
  return f;
}

/* ---- the model: which pattern each track plays from which bar ----------------------- */
/* The song playhead by bar: a row sequence with repeats, loop on, and the scene jump at bar 12. */
const END = 33;
const songRowAt = [], songRowStart = [];
{ let bar = 0, row = 0, rep = 0, start = 0;
  while (bar < END + 4) {
    if (bar === 12) { row = 1; rep = 0; start = 12; }
    const len = rows[row].steps / 16;
    for (let b = 0; b < len; b++) { songRowAt[bar + b] = row; songRowStart[bar + b] = start; }
    bar += len; start = bar;
    if (++rep >= rows[row].repeat) { rep = 0; row = (row + 1) % rows.length; }
  } }
/* Per track: segments {from, to, kind: 'follow' | 'launch' | 'stop', pattern (row) for launches}. */
const script = [
  { bar: 2, track: 2, kind: 'launch', row: 1 }, { bar: 4, track: 1, kind: 'stop' }, { bar: 6, track: 1, kind: 'launch', row: 0 },
  { bar: 8, track: 2, kind: 'launch', row: 2 }, { bar: 12, kind: 'jump' }, { bar: 15, track: 2, kind: 'launch', row: 0 },
  { bar: 18, track: 2, kind: 'attach' }, { bar: 21, track: 0, kind: 'stop' }, { bar: 23, track: 0, kind: 'launch', row: 0 },
];
function expectedNotes() {
  const notes = [];   /* [channel, pitch, units] */
  for (let t = 0; t < 3; t++) {
    let mode = 'follow', pattern = 0, pstart = 0;
    for (let bar = 0; bar < END; bar++) {
      for (const a of script) if (a.bar === bar && (a.track === t || a.kind === 'jump')) {
        if (a.kind === 'jump') { mode = 'follow'; }
        else if (a.kind === 'launch') { mode = 'launch'; pattern = a.row; pstart = bar; }
        else if (a.kind === 'stop') mode = 'stop';
        else if (a.kind === 'attach') mode = 'follow';
      }
      let id = 0, origin = 0, len = 16;
      if (mode === 'follow') { const r = songRowAt[bar]; id = rows[r].block[t]; origin = songRowStart[bar]; len = rows[r].steps; }
      else if (mode === 'launch') { id = rows[pattern].block[t]; len = rows[pattern].steps; origin = pstart + Math.floor((bar - pstart) / (len / 16)) * (len / 16); }
      if (!id) continue;
      const first = (bar - origin) * 16, last = first + 16;   /* this bar's steps of the frame */
      for (const [s, p] of blocks[id]) if (s >= first && s < last && s < len) notes.push([channel[t] - 1, p, bar * BARU + (s - first) * U]);
    }
  }
  return notes;
}

/* ---- play it -------------------------------------------------------------------- */
const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(wasmPath)), {}).exports;
c._initialize(); c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
for (const [id, notes] of Object.entries(blocks)) { const b = encodeBlock(notes); mem().set(b, c.sim_file()); check(c.sim_block_write2(0, Number(id), 1, b.length) === 0, 'block ' + id + ' stored'); }
mem().set(record(), c.sim_file());
check(c.sim_song_record_write(0) === 0 && c.sim_song_load(0) === 0, 'song written and loaded');
check(c.sim_open(20) === 0, 'the TRACK LAUNCH page opens (page 20)');
c.sim_midi_drain(1); c.sim_midi_capture(1); for (;;) if (!(c.sim_midi_output() >>> 0)) break;
check(c.sim_song_play() === 0, 'song plays');
const log = []; let block = 0;
const drainTo = () => { for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) log.push([d[0], n > 1 ? d[1] : 0, n > 2 ? d[2] : 0, block]); } };
const runTo = target => { while (block < target) { c.sim_render(); drainTo(); block++; } };
const status = t => c.sim_song_track_status(t) >>> 0;
const bars = () => c.sim_song_status(4) & 0xffff;
let padsSeen = null;
for (const a of script) {
  runTo(blockOf((a.bar - 1) * BARU) + 10);
  if (a.kind === 'jump') check(c.sim_song_jump(1) === 0, 'bar ' + (a.bar - 1) + ': scene jump to row 1 queued');
  else if (a.kind === 'launch') check(c.sim_song_track(0, a.track, a.row) === 0, 'bar ' + (a.bar - 1) + ': T' + (a.track + 1) + ' pattern ' + (a.row + 1) + ' queued');
  else if (a.kind === 'stop') check(c.sim_song_track(1, a.track, 0) === 0, 'bar ' + (a.bar - 1) + ': T' + (a.track + 1) + ' stop queued');
  else check(c.sim_song_track(2, a.track, 0) === 0, 'bar ' + (a.bar - 1) + ': T' + (a.track + 1) + ' back to song queued');
  if (a.kind === 'launch' && !padsSeen) { c.sim_render(); drainTo(); block++; padsSeen = Array.from({ length: 16 }, (_, i) => c.sim_pad_color(i) >>> 0); }
  runTo(blockOf(a.bar * BARU) + 10);
  if (a.kind === 'launch') check((status(a.track) & 3) === 1 && ((status(a.track) >> 8) & 255) === a.row, 'bar ' + a.bar + ': T' + (a.track + 1) + ' launched on pattern ' + (a.row + 1) + ' (' + status(a.track).toString(16) + ')');
  else if (a.kind === 'stop') check((status(a.track) & 3) === 2, 'bar ' + a.bar + ': T' + (a.track + 1) + ' stopped');
  else if (a.kind === 'attach') check((status(a.track) & 3) === 0, 'bar ' + a.bar + ': T' + (a.track + 1) + ' follows the song again');
  else check([0, 1, 2].every(t => (status(t) & 3) === 0) && ((c.sim_song_status(0) >>> 16) & 255) === 1, 'bar ' + a.bar + ': every track follows row 2 after the scene jump');
}
check(bars() === 23, 'the master clock counts bar 23 after the last action (' + bars() + ')');
runTo(blockOf(32 * BARU) + 2);
check(bars() === 32, 'bar 32 reached (' + bars() + ')');
c.sim_song_stop(); for (let i = 0; i < 12; i++) { c.sim_render(); drainTo(); block++; }
c.sim_midi_capture(0); c.sim_midi_drain(0);

/* ---- compare ---------------------------------------------------------------------- */
const want = expectedNotes().filter(n => n[2] < 32 * BARU);
const ons = log.filter(m => (m[0] & 0xf0) === 0x90 && m[2] > 0 && m[3] < blockOf(32 * BARU));   /* up to, not including, bar 32's downbeat */
const used = new Set(); let matched = 0, worst = 0, missing = [];
for (const [ch, p, u] of want) {
  const b = blockOf(u);
  let hit = -1;
  for (let i = 0; i < ons.length; i++) if (!used.has(i) && (ons[i][0] & 15) === ch && ons[i][1] === p && Math.abs(ons[i][3] - b) <= 1) { hit = i; break; }
  if (hit < 0) { missing.push([ch + 1, p, u / BARU, b]); continue; }
  used.add(hit); matched++; worst = Math.max(worst, Math.abs(ons[hit][3] - b));
}
const extra = ons.filter((_, i) => !used.has(i));
check(missing.length === 0, 'every one of the ' + want.length + ' predicted note-ons was sent within one block (' + matched + ' matched, worst error ' + worst + ')', missing.slice(0, 6).map(m => 'ch' + m[0] + ' ' + m[1] + ' bar ' + m[2].toFixed(2) + ' block ' + m[3]).join('; '));
check(extra.length === 0, 'nothing beyond the model was sent (' + extra.length + ' extra)', extra.slice(0, 6).map(m => 'ch' + ((m[0] & 15) + 1) + ' ' + m[1] + ' block ' + m[3]).join('; '));
{ const held = new Map(); let bad = 0;
  for (const m of log) { const st = m[0] & 0xf0, k = (m[0] & 15) + ':' + m[1]; if (st === 0x90 && m[2]) held.set(k, (held.get(k) || 0) + 1); else if (st === 0x80 || (st === 0x90 && !m[2])) { if (!held.get(k)) bad++; else held.set(k, held.get(k) - 1); } }
  for (const v of held.values()) if (v) bad++;
  check(bad === 0, 'every note-on has its note-off, nothing stuck after the stop (' + log.length + ' messages)'); }
check(log.filter(m => m[0] === 0xfa).length === 1 && log.filter(m => m[0] === 0xfc).length === 1, 'Start once at PLAY, Stop once at the end: launches and stops never touched the transport');
check(padsSeen && padsSeen[0] === 0x083008 && padsSeen[1] === 0x080808 && padsSeen[3] === 0, 'TRACK LAUNCH pads for T1 while following row 1: pad 1 green, pad 2 a pattern, pad 4 empty (' + (padsSeen || []).slice(0, 4).map(v => v.toString(16)).join(' ') + ')');

console.log(`${passed} ok, ${failed} failed`);
if (failed) { console.log('FAILED'); process.exit(1); }
console.log('all checks passed');
