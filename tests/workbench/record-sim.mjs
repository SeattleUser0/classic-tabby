// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/record-sim.mjs — real-time recording into a clip through the panel and MIDI in (Goal 6, tabby-v04.9)
//
// Purpose
//   docs/CONTROL-MAP.md section 13 and SPEC 19.11, on the simulator wasm with nobody at the panel: REC, PLAY and the
//   keys are panel events (sim_smk37), incoming MIDI goes in through sim_midi, and the checks read the recorder's
//   state (sim_steps_state), the clip (sim_edit_clip) and the MIDI out. Checked: REC while stopped arms and
//   reserves the clip, PLAY starts the take; a key is recorded on the nearest step with its length (input
//   quantize on) and plays from the clip's next loop; a note from MIDI in is recorded; quantize off keeps the
//   time played; a controller sweep is thinned as SPEC 14.2 says (one value per 240 units, the last value of the
//   gesture kept, an equal value not written); pitch bend; REC stops; the take is one undo level; no undo during a
//   take; an empty take leaves no undo level; stopping the song ends the take.
//
//   The song is the one of clips-sim.mjs: T1 place 2 = block 5: 44 on steps 0 and 8.
//
//   Run:  /usr/bin/node tests/workbench/record-sim.mjs build/web/simulator.wasm   (make midi-import-sim)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-16  Initial version.

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

/* ---- the song ---------------------------------------------------------------------------- */
const blocks = { 1: [[0, 42], [4, 42], [8, 42], [12, 42]], 5: [[0, 44], [8, 44]], 2: [[0, 36], [8, 38]], 6: [[0, 50], [16, 50], [32, 50], [48, 50]] };
function encodeBlock(notes) {
  const steps = Array.from({ length: 64 }, () => []);
  for (const [s, p] of notes) steps[s].push(TN.encode({ pitch: p, velocity: 100, retrigger: false, offset: 0, length: 240 }));
  const out = []; for (const list of steps) { out.push(list.length); for (const n of list) out.push(...n); }
  return Uint8Array.from(out);
}
function record() {
  const f = new Uint8Array(4096).fill(0xff); f.fill(0, 0, 2632); f[2626] = 1;   /* an empty event table (version byte 1) */
  f.set([0x46, 0x4d, 0x31, 0x47], 0); f[20] = 3; f.set(Array.from('CLIPS SIM   ', c => c.charCodeAt(0)), 24);
  f[37] = 1; f[38] = TEMPO; f[40] = 2; f[42] = 0; f[43] = 0;
  f[48] = 10; f[49] = 2;
  const clip = (t, place, id) => { f[64 + 2 * (64 * t + place)] = id & 255; f[65 + 2 * (64 * t + place)] = id >> 8; };
  clip(0, 0, 1); clip(0, 1, 5); clip(1, 0, 2); clip(1, 2, 6);
  const scene = (i, clips) => { const at = 1088 + 12 * i; clips.forEach((p, t) => { f[at + t] = p; }); f[at + 8] = 1; f[at + 9] = 0; f[at + 10] = 16; f[at + 11] = 0; };
  scene(0, [1, 1]); scene(1, [2, 1]);
  return f;
}

/* ---- the simulator ----------------------------------------------------------------------- */
const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(wasmPath)), {}).exports;
c._initialize(); c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
for (const [id, notes] of Object.entries(blocks)) { const b = encodeBlock(notes); mem().set(b, c.sim_file()); check(c.sim_block_write2(0, Number(id), 1, b.length) === 0, 'block ' + id + ' stored'); }
mem().set(record(), c.sim_file());
check(c.sim_song_record_write(0) === 0 && c.sim_song_load(0) === 0, 'the scenes song (record version 3) is written and loaded');

const BUTTON = 0, PAD = 3, SHIFT = 0, SCL = 8, ENV = 9, BT = 11, PLAY = 16;
const log = []; let block = 0, origin = -1;   /* origin: the block of the song's first note (master time 0) */
const drain = () => { for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n);
  if (port === 0 && d[0] !== 0xf8) { log.push([d[0], n > 1 ? d[1] : 0, n > 2 ? d[2] : 0, block]); if (origin < 0 && (d[0] & 0xf0) === 0x90 && d[2]) origin = block; } } };
const step = (n = 1) => { for (let i = 0; i < n; i++) { c.sim_render(); drain(); block++; } };
const press = (id, blocks = 8) => { c.sim_smk37(BUTTON, id, 1); step(blocks); c.sim_smk37(BUTTON, id, 0); step(4); };
const pad = (i, blocks = 8) => { c.sim_smk37(PAD, i, 100); step(blocks); c.sim_smk37(PAD, i, 0); step(4); };
const shiftPad = i => { c.sim_smk37(BUTTON, SHIFT, 1); step(4); c.sim_smk37(PAD, i, 100); step(8); c.sim_smk37(PAD, i, 0); step(4); c.sim_smk37(BUTTON, SHIFT, 0); step(4); };
const state = () => { const n = c.sim_clips_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n));
  const pads = Array.from({ length: 16 }, (_, i) => { const p = d[7 + 3 * i] | d[8 + 3 * i] << 7; return { code: d[6 + 3 * i], rgb: ((p >> 10) & 31) << 17 | ((p >> 5) & 31) << 9 | (p & 31) << 1 }; });
  return { page: d[0], track: d[1], bank: d[2], sceneBank: d[3], selected: d[4], pads }; };
const hex = v => v.toString(16).padStart(6, '0');
const trackStatus = t => c.sim_song_track_status(t) >>> 0;
const bar = () => c.sim_song_status(4) & 0xffff;
/* Run to `blocks` after the start of master bar n (bars count from 0 at the song's first note). */
const toBar = (n, blocks = 0) => { const target = origin + blockOf(n * BARU) + blocks; while (block < target) step(); };
const onsIn = (from, to, ch) => log.filter(m => (m[0] & 0xf0) === 0x90 && m[2] && (m[0] & 15) === ch && m[3] >= from && m[3] < to);
const barBlocks = n => [origin + blockOf(n * BARU) - 1, origin + blockOf((n + 1) * BARU) - 1];
const pitches = (n, ch) => onsIn(...barBlocks(n), ch).map(m => m[1]).join(' ');
const firstOn = (n, ch) => { const [a, b] = barBlocks(n); const m = onsIn(a, b, ch)[0]; return m ? m[3] - (origin + blockOf(n * BARU)) : null; };


const KEY = 1, ENCODER = 4, EDIT = 13, FX = 14, SAVE = 3;
const key = (id, vel = 100) => { c.sim_smk37(KEY, id, vel); step(6); c.sim_smk37(KEY, id, 0); step(4); };       /* key id 12 = note 60 */
const knob = (id, delta) => { c.sim_smk37(ENCODER, id, delta); step(6); };                                       /* K1..K4 = ids 0..3 */
const sstate = () => { const n = c.sim_steps_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n));
  const notes = Array.from({ length: Math.min(d[30], 4) }, (_, k) => { const q = d.slice(31 + 6 * k, 37 + 6 * k); return { pitch: q[0], velocity: q[1], start: (q[2] | q[3] << 8) - 240, length: q[4] | q[5] << 8 }; });
  return { page: d[0], track: d[1], place: d[2], bar: d[3], selected: d[4], dirty: d[5], undo: d[6], redo: d[7], events: d[8] | d[9] << 8, note: d[10], steps: d[11], playStep: d[12], toggle: d[13], pads: d.slice(14, 30), count: d[30], notes }; };
const clipNotes = () => { const n = c.sim_edit_clip(), d = mem().subarray(c.sim_file(), c.sim_file() + n), out = [];
  for (let i = 0; i < (d[6] | d[7] << 8); i++) { const e = d.subarray(16 + 6 * i, 22 + 6 * i); if (!(e[3] & 0x80)) out.push([(e[0] | e[1] << 8) - 240, e[2] & 127, e[3], e[4] | e[5] << 8]); }
  return out; };

const REC = 17;
const rstate = () => { const n = c.sim_steps_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n)); return { recording: d[55], quantize: d[56], undo: d[6], redo: d[7], events: d[8] | d[9] << 8, dirty: d[5], page: d[0] }; };
const midiIn = bytes => { mem().set(bytes, c.sim_file()); return c.sim_midi(bytes.length); };
const clipAll = () => { const n = c.sim_edit_clip(), d = mem().subarray(c.sim_file(), c.sim_file() + n), out = [];
  for (let i = 0; i < (d[6] | d[7] << 8); i++) { const e = d.subarray(16 + 6 * i, 22 + 6 * i), t = (e[0] | e[1] << 8) - 240;
    out.push(e[3] & 0x80 ? { time: t, kind: e[2], a: e[4], b: e[5] } : { time: t, kind: 0, pitch: e[2] & 127, velocity: e[3], length: e[4] | e[5] << 8 }); }
  return out; };
const note = p => clipAll().find(e => e.kind === 0 && e.pitch === p);
const UPB = 120 * 1024 / 11025;                    /* units per block at 120 BPM */
const toStep = (bar, steps) => { const target = origin + blockOf(Math.round((bar * 16 + steps) * 480)); while (block < target) step(); };
c.sim_midi_drain(1); c.sim_midi_capture(1); for (;;) if (!(c.sim_midi_output() >>> 0)) break;
step(20);

/* ---- REC while stopped arms; PLAY starts the take ------------------------------------------- */
press(BT); shiftPad(0); pad(1); pad(1);                         /* CLIPS, track 1, clip 2 selected */
press(REC);
let r = rstate();
check(r.recording === 1 && (trackStatus(0) >> 2 & 3) === 1, 'REC while stopped: armed, and the clip is reserved for PLAY (state ' + r.recording + ')');
origin = -1; press(PLAY);
while (origin < 0 && block < 400000) step();
step(30); r = rstate();
check(r.recording === 2 && (trackStatus(0) & 3) === 1 && r.undo === 1, 'PLAY: the clip loops on its track and the take runs; the clip before it is one undo level');

/* ---- a key, input quantize on ----------------------------------------------------------------- */
toStep(1, 4.7);
c.sim_smk37(KEY, 12, 96); step(100); c.sim_smk37(KEY, 12, 0); step(8);
{ const n = note(60);
  check(n && n.time === 5 * 480 && n.velocity === 96 && Math.abs(n.length - 100 * UPB) <= 40, 'a key played a little before step 6 is recorded on step 6, with the velocity and the length played (' + JSON.stringify(n) + ')'); }
toBar(4, 0);
check(pitches(2, 9) === '44 60 44' && pitches(3, 9) === '44 60 44', 'the clip plays it from its next loop (bar 3: ' + pitches(2, 9) + ')');
{ const [a] = barBlocks(2), m = onsIn(a, a + 800, 9).find(x => x[1] === 60);
  check(m && Math.abs((m[3] - (origin + blockOf(2 * BARU + 5 * 480)))) <= 1, 'on step 6 of the bar'); }

/* ---- a note from MIDI in ------------------------------------------------------------------------ */
toStep(4, 10.3);
check(midiIn([0x90, 62, 80]) >= 0, 'a note-on arrives at MIDI in on the track\'s channel');
step(60); midiIn([0x80, 62, 0]); step(8);
{ const n = note(62);
  check(n && n.time === 10 * 480 && n.velocity === 80 && Math.abs(n.length - 60 * UPB) <= 40, 'it is recorded on step 11 (' + JSON.stringify(n) + ')'); }
midiIn([0x91, 70, 80]); step(20); midiIn([0x81, 70, 0]); step(8);
check(!note(70), 'a note on another channel is not recorded');

/* ---- input quantize off ---------------------------------------------------------------------------- */
c.sim_smk37(BUTTON, SHIFT, 1); step(4); press(REC); c.sim_smk37(BUTTON, SHIFT, 0); step(4);
check(rstate().quantize === 0 && rstate().recording === 2, 'SHIFT + REC: input quantize off; the take goes on');
toStep(6, 2.5);
c.sim_smk37(KEY, 16, 100); step(30); c.sim_smk37(KEY, 16, 0); step(8);
{ const n = note(64);
  check(n && Math.abs(n.time - 2.5 * 480) <= 45 && n.time !== 2 * 480 && n.time !== 3 * 480, 'a key played between two steps keeps its time (' + (n && n.time) + ' units; 1200 played)'); }

/* ---- controller thinning (SPEC 14.2) ------------------------------------------------------------- */
toStep(7, 1);
for (let v = 0; v <= 60; v++) { midiIn([0xb0, 74, v]); step(1); }       /* 61 values in 61 blocks = 680 units */
step(60);                                                                 /* still for more than one step: the gesture ends */
{ const cc = clipAll().filter(e => e.kind === 1 && e.a === 74);
  const gaps = cc.slice(1).map((e, i) => e.time - cc[i].time);
  check(cc.length === 4 && cc[0].b === 0 && cc[3].b === 60 && gaps[0] >= 240 && gaps[1] >= 240 && gaps[2] < 240 && cc[1].b > 15 && cc[1].b < 30,
    'a sweep of 61 values over 680 units is recorded as 4: one per 240 units and the last value of the gesture (' + cc.map(e => e.time + ':' + e.b).join(' ') + ')');
  midiIn([0xb0, 74, 60]); step(60);
  check(clipAll().filter(e => e.kind === 1 && e.a === 74).length === 4, 'the value it already has is not written again'); }
midiIn([0xe0, 0, 80]); step(60);
{ const bend = clipAll().filter(e => e.kind === 3);
  check(bend.length === 1 && bend[0].a === 0 && bend[0].b === 80, 'a pitch bend is recorded'); }
midiIn([0xb0, 123, 0]); step(30);
check(!clipAll().some(e => e.kind === 1 && e.a === 123), 'a channel mode message is not recorded');

/* ---- stop; the take is one undo level ---------------------------------------------------------------- */
const eventsAfter = rstate().events;
press(REC); r = rstate();
check(r.recording === 0 && r.undo === 1 && r.dirty === 1 && eventsAfter === 2 + 3 + 4 + 1, 'REC stops the take: ' + eventsAfter + ' events (2 before, 3 notes, 4 controller values, 1 bend), unsaved, one undo level');
press(EDIT); check(rstate().page === 21, 'EDIT: the STEP page on the recorded clip');
press(FX); r = rstate();
check(r.events === 2 && r.undo === 0 && r.redo === 1, 'FX undoes the whole take');
c.sim_smk37(BUTTON, SHIFT, 1); step(4); press(FX); c.sim_smk37(BUTTON, SHIFT, 0); step(4);
check(rstate().events === eventsAfter, 'SHIFT + FX brings it back');

/* ---- no undo during a take; an empty take ------------------------------------------------------------- */
press(REC); step(30); r = rstate();
check(r.recording === 2 && r.undo === 2, 'REC on the STEP page: recording at once (the clip loops already)');
press(FX);
check(rstate().events === eventsAfter && rstate().undo === 2, 'FX during a take changes nothing');
press(REC); r = rstate();
check(r.recording === 0 && r.undo === 1, 'a take with nothing played leaves no undo level');

/* ---- stopping the song ends the take ------------------------------------------------------------------ */
press(REC); step(30);
c.sim_smk37(KEY, 19, 100); step(20);                              /* a key held when the song stops */
press(PLAY); step(60); r = rstate();
c.sim_smk37(KEY, 19, 0); step(8);
check(r.recording === 0 && note(67) && note(67).length >= 1, 'PLAY (stop) ends the take; the held note is written with the length it had');
check(((c.sim_song_status(2) >>> 16) & 0xffff) === 0, 'nothing came late during the takes');
c.sim_edit(2, 0, 0);

c.sim_midi_capture(0); c.sim_midi_drain(0);
console.log(`\nrecord-sim: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
