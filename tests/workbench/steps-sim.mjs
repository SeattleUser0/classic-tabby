// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/steps-sim.mjs — the STEP page: editing a clip through the panel (Goal 6, tabby-v04.8)
//
// Purpose
//   docs/CONTROL-MAP.md section 12, tested on the simulator wasm with nobody at the panel: every edit is a panel
//   event (sim_smk37: buttons, pads, keys, knobs), every check reads the STEP page state the firmware reports
//   (sim_steps_state), the clip being edited (sim_edit_clip), the MIDI out, and song storage after a save.
//   Checked: EDIT opens the page on the selected clip; a pad selects a step; a key enters and removes a note; undo
//   and redo (four levels); the knobs (velocity, start, length); toggle mode; the edit is heard without a save
//   (a track following the scenes at its next scene, a launched clip at its next loop); the playing step; saving is
//   refused while playing and works when stopped; the stored block is what was edited; clear step; discard; the
//   save by itself ten seconds after the stop.
//
//   The song is the one of clips-sim.mjs: T1 place 2 = block 5: 44 on steps 0 and 8, in scene 2 (odd bars).
//
//   Run:  /usr/bin/node tests/workbench/steps-sim.mjs build/web/simulator.wasm   (make midi-import-sim)
//
// Version: 0.2
//
// Revision log
//   v0.2  2026-11-16  HOME on the STEP page (tabby-v04.9.1).
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
c.sim_midi_drain(1); c.sim_midi_capture(1); for (;;) if (!(c.sim_midi_output() >>> 0)) break;
step(20);

/* ---- open ------------------------------------------------------------------------------- */
press(BT); shiftPad(0); pad(1); pad(1);                       /* CLIPS, track 1, clip 2 selected (reserved, taken back) */
check(state().selected === 1, 'clip 2 of track 1 is selected on the CLIPS page');
press(EDIT);
let e = sstate();
check(e.page === 21 && e.track === 0 && e.place === 1 && e.steps === 16 && e.events === 2 && e.dirty === 0, 'EDIT opens the STEP page on it: 16 steps, 2 events, saved (page ' + e.page + ', ' + e.events + ' events)');
check(e.pads[0] === 1 && e.pads[8] === 1 && e.pads[4] === 0 && e.selected === 255, 'pads: steps 1 and 9 hold notes, step 5 is empty, nothing selected (' + e.pads + ')');
check((c.sim_pad_color(0) >>> 0) === 0x083008 && (c.sim_pad_color(1) >>> 0) === 0 && (c.sim_pad_color(4) >>> 0) === 0x040404, 'colours: a step with notes green, an empty step off, an empty beat dim');

/* ---- enter, remove, undo, redo -------------------------------------------------------------- */
pad(4); e = sstate();
check(e.selected === 4 && e.pads[4] === 4 && (c.sim_pad_color(4) >>> 0) === 0x041818, 'a pad selects its step (cyan)');
key(12); e = sstate();
check(e.events === 3 && e.count === 1 && e.notes[0].pitch === 60 && e.notes[0].velocity === 100 && e.notes[0].start === 0 && e.notes[0].length === 480 && e.dirty === 1 && e.undo === 1,
  'a key enters its note on the selected step: C4, velocity 100, on the grid, one step long; the clip is unsaved (' + JSON.stringify(e.notes) + ')');
key(16); e = sstate();
check(e.count === 2 && e.events === 4 && e.undo === 2, 'a second key adds a second note to the step (a chord)');
key(16); e = sstate();
check(e.count === 1 && e.events === 3 && e.undo === 3, 'the same key again removes its note');
press(FX); e = sstate();
check(e.count === 2 && e.undo === 2 && e.redo === 1, 'FX undoes: the note is back');
c.sim_smk37(BUTTON, SHIFT, 1); step(4); press(FX); c.sim_smk37(BUTTON, SHIFT, 0); step(4); e = sstate();
check(e.count === 1 && e.undo === 3 && e.redo === 0, 'SHIFT + FX redoes: it is gone again');
press(FX); press(FX); press(FX); e = sstate();
check(e.events === 2 && e.undo === 0 && e.redo === 3, 'three more undos: the clip as it was opened');
press(FX); check(sstate().undo === 0 && sstate().events === 2, 'a fourth undo finds nothing');
c.sim_smk37(BUTTON, SHIFT, 1); step(4); press(FX); c.sim_smk37(BUTTON, SHIFT, 0); step(4); e = sstate();
check(e.events === 3 && e.count === 1 && e.notes[0].pitch === 60, 'redo once: C4 on step 5 again');

/* ---- the knobs --------------------------------------------------------------------------------- */
knob(1, 5); knob(1, 3); e = sstate();
check(e.notes[0].velocity === 108 && e.undo === 2, 'K2 changes the velocity (108); two turns of one knob are one undo level');
knob(2, 3); e = sstate();
check(e.notes[0].start === 30 && e.undo === 3, 'K3 moves the start (+30 units of 480)');
knob(3, 2); e = sstate();
check(e.notes[0].length === 600 && e.undo === 4, 'K4 changes the length (600 units)');
knob(2, 40); e = sstate();
check(e.notes[0].start === 240 && e.selected === 4, 'the start stops half a step late: the note stays on its step');
knob(2, -21); e = sstate();
check(e.notes[0].start === 30, 'and comes back');

/* ---- HOME leaves, the clip stays open (tabby-v04.9.1) ---------------------------------------------- */
press(2); check(sstate().page === 0 && sstate().dirty === 1, 'HOME goes to the overview; the unsaved clip stays open');
press(BT); press(EDIT); e = sstate();
check(e.page === 21 && e.events === 3 && e.dirty === 1 && e.selected === 255, 'BT and EDIT: back on the STEP page, the clip as it was left, no step selected');
pad(4);                                        /* select step 5 again for what follows */

/* ---- toggle mode --------------------------------------------------------------------------------- */
pad(4); key(14); e = sstate();
check(e.selected === 255 && e.note === 62 && e.events === 3, 'with no step selected a key only becomes the current note (D4)');
press(SCL); pad(6); e = sstate();
check(e.toggle === 1 && e.pads[6] === (1 | 2 | 4) && e.events === 4, 'SCL: pads toggle; pad 7 puts D4 on step 7');
pad(6); check(sstate().events === 3, 'pad 7 again takes it off');
pad(6); check(sstate().events === 4 && (c.sim_pad_color(5) >>> 0) === 0, 'and on again');
press(SCL);
{ const want = [[0, 44], [4 * 480 + 30, 60], [6 * 480, 62], [8 * 480, 44]], got = clipNotes().map(n => [n[0], n[1]]);
  check(JSON.stringify(got) === JSON.stringify(want), 'the clip now: 44, C4 (30 late), D4, 44 in time order (' + JSON.stringify(got) + ')'); }

/* ---- heard without a save ------------------------------------------------------------------------- */
origin = -1;                                   /* the keys played so far are in the log too: the song's first note is the origin */
press(PLAY);
while (origin < 0 && block < 400000) step();
toBar(2, 0);
check(pitches(1, 9) === '44 60 62 44', 'the song plays the unsaved edit when the track reaches the clip (scene 2: ' + pitches(1, 9) + ')');
press(EDIT); pad(1); toBar(3, 30);
check((trackStatus(0) & 3) === 1, 'the clip is launched on its track and loops');
press(EDIT); e = sstate();
check(e.page === 21 && e.playStep < 16 && e.pads.filter(p => p & 8).length === 1, 'back on the STEP page: one pad shows the step that plays (' + e.playStep + ')');
toBar(3, 250); pad(12); key(19); e = sstate();                       /* G4 on step 13, in the first half of the bar */
check(e.count === 1 && e.notes[0].pitch === 67, 'G4 entered on step 13 while the clip loops');
toBar(6, 0);
check(pitches(3, 9) === '44 60 62 67 44 67', 'tabby-v1.4: the note is heard in the pass in which it was entered: the key itself, then the clip on step 13, which was still ahead (bar 4: ' + pitches(3, 9) + '; until tabby-v1.3 only from the next pass)');
check(pitches(4, 9) === '44 60 62 44 67' && pitches(5, 9) === '44 60 62 44 67', 'and in every pass after it, once each (bar 5: ' + pitches(4, 9) + ')');
check(((c.sim_song_status(2) >>> 16) & 0xffff) === 0, 'nothing came late');

/* ---- saving ------------------------------------------------------------------------------------------ */
press(SAVE); e = sstate();
check(e.dirty === 1 && e.page === 21, 'the 4th left button while playing: STOP TO SAVE, still unsaved');
press(PLAY); step(40);
press(SAVE); e = sstate();
check(e.dirty === 0, 'stopped: the clip is saved');
{ const n = c.sim_block_read(0, 5), d = mem().subarray(c.sim_file(), c.sim_file() + n);
  check(n === 16 + 6 * 5 && d[0] === e.steps && (d[6] | d[7] << 8) === 5, 'song storage holds the edited clip as block 5 (a v3 clip of its own ' + d[0] + ' steps, 5 events; ' + n + ' bytes)'); }
c.sim_edit(2, 0, 0);
check(c.sim_song_load(0) === 0, 'the song loads again');
{ origin = -1; c.sim_song_play(); while (origin < 0 && block < 400000) step(); toBar(2, 0);
  check(pitches(1, 9) === '44 60 62 44 67', 'and plays the saved clip (' + pitches(1, 9) + ')');
  c.sim_song_stop(); step(40); }

/* ---- clear, discard, the save by itself ---------------------------------------------------------- */
check(c.sim_edit(3, 0, 1) === 0 && sstate().page === 21 && sstate().events === 5, 'the editor opens on the saved clip');
pad(12); press(ENV); e = sstate();
check(e.events === 4 && e.count === 0 && e.dirty === 1, 'ENV clears the selected step');
c.sim_smk37(BUTTON, SHIFT, 1); step(4); press(ENV); c.sim_smk37(BUTTON, SHIFT, 0); step(4);
check(state().page === 20 && c.sim_edit(3, 0, 1) === 0 && sstate().events === 5 && sstate().dirty === 0, 'SHIFT + ENV discards the edit: the stored clip is back');
pad(12); press(ENV);
check(sstate().dirty === 1, 'cleared again, unsaved');
step(3100); check(sstate().dirty === 1, 'nine seconds after the change it is still unsaved');
step(600); check(sstate().dirty === 0, 'ten seconds after the change, with the song stopped, it is saved by itself');
check(c.sim_edit(3, 1, 0) === 0 && sstate().track === 1, 'another clip can be opened once the first is saved');
pad(2); key(12);
check(sstate().dirty === 1 && c.sim_edit(3, 0, 1) === 0 && sstate().track === 0 && c.sim_edit(3, 1, 0) === 0 && sstate().dirty === 1, 'with that one unsaved, a third clip opens all the same (tabby-v1.3: unsaved clips wait); opened again, the second is still unsaved');
c.sim_edit(2, 0, 0);

c.sim_midi_capture(0); c.sim_midi_drain(0);
{ const held = new Map(); let bad = 0;
  for (const m of log) { const st = m[0] & 0xf0, k = (m[0] & 15) + ':' + m[1]; if (st === 0x90 && m[2]) held.set(k, (held.get(k) || 0) + 1); else if (st === 0x80 || (st === 0x90 && !m[2])) { if (!held.get(k)) bad++; else held.set(k, held.get(k) - 1); } }
  for (const v of held.values()) if (v) bad++;
  check(bad === 0, 'every note-on has its note-off (' + log.length + ' messages)'); }

console.log(`\nsteps-sim: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
