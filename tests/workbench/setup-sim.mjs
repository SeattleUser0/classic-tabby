// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/setup-sim.mjs — the CLIP SETTING page, the click and the count-in, a stored scene (tabby-v04.10)
//
// Purpose
//   docs/CONTROL-MAP.md sections 14 to 16 on the simulator wasm, through the panel alone (sim_smk37: buttons, pads,
//   knobs) on the song of clips-sim.mjs: FX on CLIPS opens CLIP SETTING on the selected clip; K5 chooses the row,
//   K1 the value; LENGTH changes the clip and is heard; COPY TO PAD makes a new clip; the song's click and count-in
//   are set, heard on MIDI out and stored with the song; a scene pad held on an empty pad stores what plays; the
//   4th left button saves while stopped.
//
//   Run:  /usr/bin/node tests/workbench/setup-sim.mjs build/web/simulator.wasm   (make midi-import-sim)
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

c.sim_midi_drain(1); c.sim_midi_capture(1); for (;;) if (!(c.sim_midi_output() >>> 0)) break;

/* ---- stopped: open the page, colours, select ------------------------------------------- */

const ENCODER = 4, FX = 14, SAVE = 3, REC = 17, EDIT = 13, KEY = 1;
const knob = (id, delta) => { c.sim_smk37(ENCODER, id, delta); step(6); };            /* the panel's knobs: K1..K4 = 0..3, K5 = 4, K6 = 5 */
const K1 = 0, K2 = 1, K5 = 4;
const setup = () => { const n = c.sim_setup_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n));
  return { page: d[0], row: d[1], track: d[2], place: d[3], steps: d[4], to: d[5], countIn: d[6], click: d[7], out: d[8], ch: d[9], note: d[10], unsaved: d[11], rows: d[12], scenes: d[20], hold: d[21], counting: d[22] }; };
const stored = () => { c.sim_song_record_read(0); return mem().slice(c.sim_file(), c.sim_file() + 4096); };

step(20);
press(BT); shiftPad(0); pad(0); pad(0);                       /* CLIPS, track 1, pad 1 selected (reserved and taken back) */
let s = state();
check(s.page === 20 && s.selected === 0, 'CLIPS: track 1, clip 1 selected');
press(FX); let u = setup();
check(u.page === 22 && u.track === 0 && u.place === 0 && u.steps === 16 && u.row === 0 && u.rows === 10, 'FX opens CLIP SETTING on the selected clip: 16 steps, the first row (page ' + u.page + ', ' + u.steps + ' steps)');
/* LENGTH */
knob(K1, 1); knob(K2, 1); u = setup();
check(u.steps === 33 && u.unsaved === 1, 'K1 +1 and K2 +16: the clip is 33 steps long, unsaved (' + u.steps + ')');
knob(K1, -1); knob(K2, -1); u = setup();
check(u.steps === 16, 'back to 16 steps');
knob(K1, -8); u = setup();
check(u.steps === 8, 'K1 -8: 8 steps (the notes on steps 9 and 13 are removed)');
/* the shorter clip is heard: launched, it plays 42 on steps 1 and 5 of its 8, twice a bar */
press(FX); pad(0); origin = -1;
press(PLAY); while (origin < 0 && block < 4000) step();
toBar(2, 0);
check(pitches(0, 9) === '42 42 42 42' && onsIn(...barBlocks(1), 9).length === 4, 'the 8-step clip loops twice a bar (bar 2: ' + pitches(1, 9) + ')');
{ const o = onsIn(...barBlocks(1), 9).map(m => m[3] - (origin + blockOf(BARU))); check(Math.abs(o[2] - blockOf(8 * 480)) <= 1, 'its second pass starts on step 9 of the bar (block ' + o[2] + ')'); }
press(PLAY); step(60);
/* COPY TO PAD */
press(FX); knob(K5, 4); u = setup();
check(u.row === 4 && u.to === 2, 'K5: the COPY TO PAD row; the first empty pad of the track is offered (pad ' + (u.to + 1) + ')');
press(SAVE); u = setup();
check(u.unsaved === 1 && u.place === 0, 'the 4th left button with the clip unsaved: THE CLIP IS UNSAVED: SAVE IT FIRST');
knob(K5, 1); press(SAVE); u = setup();
check(u.unsaved === 0, 'on another row the 4th left button saves (stopped)');
knob(K5, -1); press(SAVE); u = setup(); press(FX); s = state();
check(u.place === 2 && u.unsaved === 1 && u.steps === 8 && s.selected === 2 && (s.pads[2].code & 7) === 1, 'COPY: pad 3 holds the copy (8 steps), open, selected and unsaved');
/* the song settings */
press(FX); knob(K5, 5); knob(K1, 1); knob(K5, 1); knob(K1, 2); knob(K5, 1); knob(K1, 1); knob(K5, 1); knob(K1, -6); knob(K5, 1); knob(K1, 3); u = setup();
check(u.row === 9 && u.countIn === 1 && u.click === 2 && u.out === 1 && u.ch === 3 && u.note === 40, 'COUNT-IN 1 cycle, CLICK ALWAYS, as a MIDI NOTE, channel 4, note 40 (' + [u.countIn, u.click, u.out, u.ch, u.note] + ')');
press(SAVE); u = setup();
check(u.unsaved === 0, 'saved');
{ const r = stored(); check(r[20] === 3 && r[44] === (2 | 1 << 2 | 1 << 4) && r[45] === 4 && r[46] === 40 && (r[64 + 4] | r[65 + 4] << 8) > 0, 'the stored record (version 3) holds the settings and the copy in place 3 (bytes ' + [r[44], r[45], r[46]] + ')'); }
/* the click on MIDI out; the count-in before a take */
press(FX); pad(2); pad(2);                                     /* CLIPS; the copy stays selected, nothing reserved */
const mark = log.length; origin = -1;
press(REC); step(10);
press(PLAY); step(30); u = setup();
check(u.counting >= 3, 'REC, then PLAY: the count-in runs (' + u.counting + ' beats left)');
/* the song's first note (the clicks are note-ons too, on channel 4) */
const songStart = () => log.slice(mark).find(m => (m[0] & 0xf0) === 0x90 && m[2] && (m[0] & 15) !== 3);
while (!songStart() && block < 400000) step();
origin = songStart()[3];
toBar(1, 0);
{ const clicks = log.slice(mark).filter(m => m[0] === 0x93 && m[1] === 40 && m[2]);
  const before = clicks.filter(m => m[3] < origin - 1), start = log.slice(mark).find(m => m[0] === 0xfa);
  check(before.length === 4 && before[0][2] === 127 && before[1][2] === 90 && Math.abs((origin - before[0][3]) - blockOf(BARU)) <= 2, 'four clicks on channel 4 note 40, the first louder, one cycle before the song\'s first note (' + before.length + ', ' + (origin - (before[0] || [0, 0, 0, 0])[3]) + ' blocks)');
  check(start && Math.abs(start[3] - origin) <= 2, 'MIDI Start goes out with the song, after the count-in');
  check(clicks.length - before.length >= 4, 'CLICK ALWAYS: it clicks on while the song plays (' + (clicks.length - before.length) + ' in the first bar)'); }
press(REC); step(10);
/* a stored scene */
press(SCL); s = state();
check(s.page === 19 && (s.pads[2].code & 7) === 0, 'SCENES: pads 1 and 2 hold scenes, pad 3 is empty');
pad(2, 20); u = setup();
check(u.scenes === 2, 'a short press on the empty pad stores nothing');
pad(2, 220); u = setup(); s = state();
check(u.scenes === 3 && u.unsaved === 1 && (s.pads[2].code & 7) === 1, 'held half a second: what plays is stored as scene 3 (' + u.scenes + ' scenes)');
pad(0, 220); u = setup();
check(u.scenes === 3, 'holding a pad that holds a scene stores nothing (it recalls the scene)');
toBar(4, 0);
pad(2); toBar(7, 0);
check((c.sim_song_status(0) >>> 16 & 255) === 2 && pitches(6, 9) === '42 42 42 42', 'scene 3 recalled: track 1 plays the copy it was stored with (bar 7 T1: ' + pitches(6, 9) + ')');
press(PLAY); step(60);
press(SAVE); u = setup();
check(u.unsaved === 0, 'stopped: the 4th left button on SCENES saves the song');
{ const r = stored(), q = 1088 + 2 * 12; check(r[40] === 3 && r[q] === 3 && r[q + 8] === 1 && r[q + 9] === 3 && r[q + 10] === 16, 'the stored record has scene 3: T1 place 3, once, looping, keeping its clips\' lengths, 16 steps (' + [r[q], r[q + 8], r[q + 9], r[q + 10]] + ')'); }
check(c.sim_song_load(0) === 0 && setup().scenes === 3, 'loaded again: three scenes');
/* The workbench must read what the device wrote: the Full backup of the tabby-v04.10 page stalled on a song with a
 * stored scene (its reader refused the scene's flag; found on the device before the tabby-v04.11 install). */
{ const { createRequire } = await import('node:module'); const Format = createRequire(import.meta.url)(join(root, 'web/import/song-format.js'));
  let song = null, why = ''; const bytes = stored();
  try { song = Format.decodeRecord(bytes); } catch (e) { why = e.message; }
  check(song && song.rows.length === 3 && song.rows[2].own === true && !song.rows[0].own && song.click && song.click[0] === bytes[44], 'the workbench reads the device-written record: the stored scene and the click settings (' + why + ')');
  let again = null; try { again = Format.encodeRecord({ ...song, blocks: [...new Set([...song.rows.flatMap(r => r.blocks), ...song.clips.flat()].filter(Boolean))].map(id => ({ id, notes: [] })) }); } catch (e) { why = e.message; }
  check(again && again[1088 + 2 * 12 + 9] === 3 && again[44] === bytes[44] && again[45] === bytes[45] && again[46] === bytes[46], 'and writes them back unchanged (' + why + ')'); }

/* ---- tabby-v04.11: the clip chain on the page: clip 1 (8 steps) twice, then clip 2; clip 2 stops the track after 8 steps ---- */
const chain = () => { const n = c.sim_setup_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n)); return { next: d[13], after: d[14] | d[15] << 8, times: d[16], unsaved: d[11], place: d[3] }; };
press(SCL); s = state(); if (s.page !== 20) press(SCL);
pad(0); pad(0); press(FX); knob(K5, 1); knob(K1, 1); let h = chain();
check(h.place === 0 && h.next === 1, 'NEXT CLIP, K1 once: STOP');
knob(K1, 2); h = chain();
check(h.next === 3, 'twice more: CLIP 1, CLIP 2 (' + h.next + ')');
knob(K1, 5); h = chain();
check(h.next === 4, 'K1 further stops at the last pad that holds a clip (CLIP 3; ' + h.next + ')');
knob(K1, -1); knob(K5, 2); knob(K1, 1); h = chain();
check(h.next === 3 && h.times === 2 && h.after === 0 && h.unsaved === 1, 'NEXT CLIP 2, TIMES 2, AFTER the clip\'s end; unsaved');
knob(K5, 6); press(SAVE); press(FX);
pad(1); pad(1); press(FX); knob(K5, 1); knob(K1, 1); knob(K5, 1); knob(K1, 8); h = chain();
check(h.place === 1 && h.next === 1 && h.after === 8, 'clip 2: NEXT CLIP STOP, AFTER 8 STEPS');
knob(K5, 6); press(SAVE); h = chain(); press(FX);
check(h.unsaved === 0, 'both saved');
pad(0); origin = -1; const mark2 = log.length;
press(PLAY);
const songStart2 = () => log.slice(mark2).find(m => (m[0] & 0xf0) === 0x90 && m[2] && (m[0] & 15) !== 3);
while (!songStart2() && block < 800000) step();
origin = songStart2()[3];
toBar(0, 300);
toBar(4, 0);
check(pitches(0, 9) === '42 42 42 42' && pitches(1, 9) === '44' && pitches(2, 9) === '' && pitches(3, 9) === '' && (trackStatus(0) & 3) === 2,
  'launched, clip 1 (8 steps) plays twice, clip 2 follows on the bar line and the track stops 8 steps into it (bars: ' + [0, 1, 2, 3].map(n => '[' + pitches(n, 9) + ']').join(' ') + ')');
check(Math.abs(firstOn(1, 9)) <= 1 && pitches(1, 1) !== '', 'clip 2 starts within one block of the bar line; track 2 follows the scenes meanwhile');
press(PLAY); step(60);

c.sim_midi_capture(0); c.sim_midi_drain(0);
{ const held = new Map(); let bad = 0;
  for (const m of log) { const st = m[0] & 0xf0, k = (m[0] & 15) + ':' + m[1]; if (st === 0x90 && m[2]) held.set(k, (held.get(k) || 0) + 1); else if (st === 0x80 || (st === 0x90 && !m[2])) { if (!held.get(k)) bad++; else held.set(k, held.get(k) - 1); } }
  for (const v of held.values()) if (v) bad++;
  check(bad === 0, 'every note-on has its note-off, the clicks too (' + log.length + ' messages)'); }
console.log(`\nsetup-sim: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
