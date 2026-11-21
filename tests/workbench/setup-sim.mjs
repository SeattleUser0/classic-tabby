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
// Version: 0.7
//
// Revision log
//   v0.7  2026-11-18  tabby-v04.20: DIRECTION (24 lines).
//   v0.6  2026-11-17  tabby-v04.19: STEP SIZE (23 lines).
//   v0.5  2026-11-17  tabby-v04.17: SHUFFLE and PLAY QUANTIZE; CLIP SETTING has three pages (22 lines).
//   v0.4  2026-11-17  tabby-v04.16: a scene moved (EDIT + K1) and deleted (FX twice) on SCENES.
//   v0.3  2026-11-17  tabby-v04.15: TRANSPOSE and DELETE CLIP.
//   v0.2  2026-11-17  tabby-v04.14: CLICK LEVEL and the controller numbers of K1 to K4 (the second page); every record and
//                     clip the device wrote goes through both of the page's readers and back unchanged; the clip chain
//                     survives the workbench; the Full backup names a song it cannot read.
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
check(u.page === 22 && u.track === 0 && u.place === 0 && u.steps === 16 && u.row === 0 && u.rows === 25, 'FX opens CLIP SETTING on the selected clip: 16 steps, the first row (page ' + u.page + ', ' + u.steps + ' steps)');
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
press(FX); knob(K5, 7); u = setup();
check(u.row === 7 && u.to === 2, 'K5: the COPY TO PAD row; the first empty pad of the track is offered (pad ' + (u.to + 1) + ')');
press(SAVE); u = setup();
check(u.unsaved === 1 && u.place === 2, 'the 4th left button with the clip unsaved: the copy is made all the same and is the open clip (tabby-v1.3; before: THE CLIP IS UNSAVED: SAVE IT FIRST)');
knob(K5, 1); press(SAVE); u = setup();
check(u.unsaved === 0, 'on another row the 4th left button saves (stopped)');
knob(K5, -1); press(SAVE); u = setup(); press(FX); s = state();
check(u.place === 2 && u.unsaved === 1 && u.steps === 8 && s.selected === 2 && (s.pads[2].code & 7) === 1, 'COPY: pad 3 holds the copy (8 steps), open, selected and unsaved');
/* the song settings */
press(FX); knob(K5, 14); knob(K1, 1); knob(K5, 1); knob(K1, 2); knob(K5, 1); knob(K1, 1); knob(K5, 1); knob(K1, -6); knob(K5, 1); knob(K1, 3); u = setup();
check(u.row === 18 && u.countIn === 1 && u.click === 2 && u.out === 1 && u.ch === 3 && u.note === 40, 'COUNT-IN 1 cycle, CLICK ALWAYS, as a MIDI NOTE, channel 4, note 40 (' + [u.countIn, u.click, u.out, u.ch, u.note] + ')');
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
  /* the page's own reader (sdk/WebUpdate.js: the Full backup goes through it; it said "Scene 5 is invalid") */
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', requestMIDIAccess: () => Promise.reject(new Error('no midi')) }, configurable: true });
  globalThis.window = globalThis; globalThis.document = { addEventListener() {}, querySelector() { return null; }, getElementById() { return null; } }; globalThis.location = { search: '' };
  (0, eval)(readFileSync(join(root, 'sdk/WebUpdate.js'), 'utf8'));
  let page = null, built = null; try { page = globalThis.FM1Web.songRecordParse(bytes); built = globalThis.FM1Web.songRecordBuild(page); } catch (e) { why = 'page: ' + e.message; }
  check(page && page.rows.length === 3 && page.rows[2].own === true && built && built[1088 + 2 * 12 + 9] === 3 && built[44] === bytes[44] && built[46] === bytes[46], 'the page\'s reader takes the stored scene too, and its writer keeps it and the click settings (' + why + ')');
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
knob(K5, 5); press(SAVE); press(FX);
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

/* ---- tabby-v04.13: a clip's program and bank on the page; K1 to K4 on CLIPS send controllers ---- */
s = state(); if (s.page !== 20) { press(SCL); }
pad(0); pad(0); press(FX); knob(K5, 4); knob(K1, 6); knob(K5, 1); knob(K1, 3); knob(K5, 1); knob(K1, 7);
{ const n = c.sim_setup_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n));
  check(d[1] === 6 && d[17] === 5 && d[18] === 2 && d[19] === 7 && d[11] === 1, 'PROGRAM 6, BANK MSB 2, BANK LSB 7 on the clip (stored 0-based: ' + [d[17], d[18], d[19]] + '); unsaved'); }
knob(K5, 6); press(SAVE); press(FX);
{ const before = log.length; knob(K1, 1); knob(2, -3);
  const cc = log.slice(before).filter(m => (m[0] & 0xf0) === 0xb0);
  check(cc.length === 1 && (cc[0][0] & 0xf0) === 0xb0 && cc[0][1] === 74 && cc[0][2] === 66, 'on CLIPS K1 sends controller 74 on the channel the track\'s keys use, two per click (' + cc.map(m => m.slice(0, 3)).join(' | ') + '); K3 at 0 sends nothing going down'); }

/* ---- tabby-v04.12: the scene chain on SCENES: a start scene reserved while stopped; K1 times, K2 then, K3 hold ---- */
const scene = () => { const n = c.sim_setup_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n)); return { row: d[23], times: d[24], flags: d[25], steps: d[26], cycle: d[27], hold: d[21], unsaved: d[11] }; };
const K3 = 2;
s = state(); if (s.page !== 19) { press(SCL); s = state(); }
pad(1); s = state(); let q = scene();
check(s.page === 19 && q.row === 1 && (s.pads[1].code & 7) === 3, 'stopped, pad 2 on SCENES: scene 2 is reserved (blinking) and is the scene the knobs work on');
const times0 = q.times;
knob(K1, 1); knob(K2, 1); q = scene();
check(q.times === times0 + 1 && (q.flags & 1) === 1 && q.unsaved === 1, 'K1: one more time; K2 right: THEN STAY; the song is unsaved (' + q.times + ', flags ' + q.flags + ')');
knob(K2, -1); q = scene();
check((q.flags & 1) === 0, 'K2 left: THEN NEXT');
origin = -1; const mark3 = log.length;
press(PLAY);
const songStart3 = () => log.slice(mark3).find(m => (m[0] & 0xf0) === 0x90 && m[2] && (m[0] & 15) !== 3);
while (!songStart3() && block < 1200000) step();
origin = songStart3()[3];
toBar(0, 100);
check((c.sim_song_status(0) >>> 16 & 255) === 1, 'PLAY starts at the reserved scene 2');
toBar(times0, 100);
check((c.sim_song_status(0) >>> 16 & 255) === 1, 'scene 2 plays one time more than before (still scene 2 in bar ' + (times0 + 1) + ')');
knob(K3, 1); q = scene();
toBar(times0 + 3, 100);
check(q.hold === 1 && (c.sim_song_status(0) >>> 16 & 255) === 1, 'K3 right: CHAIN HELD: scene 2 repeats past its end');
knob(K3, -1); q = scene();
toBar(times0 + 5, 100);
check(q.hold === 0 && (c.sim_song_status(0) >>> 16 & 255) !== 1, 'K3 left: CHAIN RUNS: the song goes on (scene ' + ((c.sim_song_status(0) >>> 16 & 255) + 1) + ')');
press(PLAY); step(60);

/* ---- tabby-v04.14: the second page: CLICK LEVEL and the controller numbers of K1 to K4 ---- */
if (c.sim_song_status(0) >>> 8 & 255) { press(PLAY); step(200); }
check(!(c.sim_song_status(0) >>> 8 & 255), 'stopped');
s = state(); if (s.page !== 20) { press(BT); s = state(); }
pad(0); pad(0); press(FX); knob(K5, 30);
{ const n = c.sim_setup_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n));
  check(n === 39 && d[1] === 24 && d[38] === 0, 'tabby-v1.0.2: the last line is EVENT LEAD; a song never set: OFF (' + [n, d[1], d[38]] + ')'); }
knob(K5, -1);
const more = () => { const n = c.sim_setup_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n)); return { n, row: d[1], unsaved: d[11], level: d[28], knobs: d.slice(29, 33) }; };
let w = more();
check(w.n === 39 && w.row === 23 && w.level === 1 && w.knobs.join() === '74,71,1,11', 'the line before it is K4 CONTROLLER; a song never set: CLICK LEVEL MID, controllers 74, 71, 1, 11 (' + [w.row, w.level, w.knobs] + ')');
knob(K5, -3); knob(K2, -4); knob(K1, -3); knob(K5, -1); knob(K1, -5); w = more();
check(w.row === 19 && w.knobs.join() === '7,71,1,11' && w.level === 0 && w.unsaved === 1, 'K1 CONTROLLER 7 (K2 moves by 16); CLICK LEVEL LOW, the lowest; unsaved (' + [w.level, w.knobs] + ')');
knob(K1, 5); w = more();
check(w.level === 2, 'CLICK LEVEL HIGH, the highest');
knob(K5, 4); knob(K2, 8); w = more();
check(w.row === 23 && w.knobs[3] === 127, 'K4 CONTROLLER stops at 127');
knob(K2, -7); knob(K1, -4); press(SAVE); w = more();
check(w.unsaved === 0 && w.knobs[3] === 11, 'saved');
{ const r = stored(); check(r[44] >> 6 === 2 && r[56] === 8 && r[57] === 0 && r[59] === 12, 'the record: header byte 44 bits 6-7 = 2 (HIGH), byte 56 = 8 (controller 7), byte 57 = 0 (never set), byte 59 = 12 (set to 11) (' + [r[44] >> 6, r[56], r[57], r[59]] + ')'); }
press(FX);
{ const before = log.length; knob(K1, 1); const cc = log.slice(before).filter(m => (m[0] & 0xf0) === 0xb0);
  check(cc.length === 1 && cc[0][1] === 7, 'on CLIPS K1 now sends controller 7 (' + cc.map(m => m.slice(0, 3)).join(' | ') + ')'); }
check(c.sim_song_load(0) === 0 && more().level === 2 && more().knobs[0] === 7, 'loaded again: the level and the controller are the song\'s');

/* ---- tabby-v04.15: TRANSPOSE and DELETE CLIP on the first page ---- */
{ const tr = () => { const n = c.sim_setup_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n)); return { row: d[1], place: d[3], unsaved: d[11], transpose: d[33] << 24 >> 24 }; };
  s = state(); if (s.page !== 20) press(BT);
  pad(0); pad(0); press(FX); knob(K5, 7); const to = setup().to; press(SAVE);            /* a fresh copy of clip 1 in the first empty pad */
  knob(K5, 1); knob(K1, 5); let x = tr();
  check(x.row === 8 && x.place === to && x.transpose === 5 && x.unsaved === 1, 'TRANSPOSE (line 9) +5 on a new copy of clip 1 in pad ' + (to + 1) + ' (' + [x.row, x.place, x.transpose] + ')');
  knob(K1, 20); x = tr(); check(x.transpose === 12, 'it stops at +12');
  knob(K1, -30); x = tr(); check(x.transpose === -12, 'and at -12');
  /* tabby-v04.17: SHUFFLE and PLAY QUANTIZE follow TRANSPOSE on page 2/3 */
  { const feel = () => { const n = c.sim_setup_state(), d = Array.from(mem().subarray(c.sim_file(), c.sim_file() + n)); return { row: d[1], steps: d[4], shuffle: d[34], quantize: d[35], scale: d[36] & 15, direction: d[36] >> 4, unsaved: d[11] }; };
    knob(K5, 1); knob(K1, 60); let f = feel();
    check(f.row === 9 && f.shuffle === 51, 'SHUFFLE (line 10): K1 right to the end: 50 PERCENT (byte ' + f.shuffle + ')');
    knob(K1, -50); f = feel(); check(f.shuffle === 1, 'K1 left: 0 PERCENT of its own (byte 1)');
    knob(K1, -1); f = feel(); check(f.shuffle === 0, 'one more: SONG (the clip follows the song\'s swing)');
    knob(K5, 1); knob(K1, 2); f = feel(); check(f.row === 10 && f.quantize === 2, 'PLAY QUANTIZE (line 11): 1/8');
    knob(K1, 9); f = feel(); check(f.quantize === 3, 'it stops at 1/4');
    knob(K1, -9); f = feel(); check(f.quantize === 0, 'and at OFF');
    /* tabby-v04.19: STEP SIZE (line 12): only sizes that give whole 16ths for the clip's length */
    knob(K5, 1); knob(K1, 1); f = feel(); check(f.row === 11 && f.scale === 1 && f.steps === 8, 'STEP SIZE (line 12): 1/8 (the 8-step copy plays 16 sixteenths)');
    knob(K1, 1); f = feel(); check(f.scale === 2, 'K1 right again: 1/32');
    knob(K1, 1); f = feel(); check(f.scale === 2, 'the triplet sizes do not fit 8 steps: K1 stays on 1/32');
    knob(K1, -5); f = feel(); check(f.scale === 1, 'K1 moves one size at a time, however far it is turned');
    knob(K1, -1); f = feel(); check(f.scale === 0, 'back to 1/16');
    /* tabby-v04.20: DIRECTION (line 13) */
    knob(K5, 1); knob(K1, 1); f = feel(); check(f.row === 12 && f.direction === 1 && f.scale === 0, 'DIRECTION (line 13): REVERSE; the step size beside it in the same byte is untouched');
    knob(K1, 5); f = feel(); check(f.direction === 2, 'K1 right: it stops at FWD THEN REV');
    knob(K1, -5); f = feel(); check(f.direction === 0, 'K1 left: FORWARD');
    knob(K5, -4); check(feel().row === 8, 'back on TRANSPOSE'); }
  knob(K1, 15); press(FX); pad(to); const markT = log.length;
  press(PLAY); const firstT = () => log.slice(markT).find(m => (m[0] & 0xf0) === 0x90 && m[2] && (m[0] & 15) === 9);
  while (!firstT() && block < 3000000) step();
  const t0 = firstT()[3]; step(300);
  const heard = [...new Set(log.slice(markT).filter(m => (m[0] & 0xf0) === 0x90 && m[2] && (m[0] & 15) === 9 && m[3] < t0 + 250).map(m => m[1]))];
  check(heard.length === 1 && heard[0] === 45, 'TRANSPOSE +3: the copy of clip 1 (note 42) plays note 45 and nothing else in its first loops (' + heard + ')');
  press(PLAY); step(400);
  press(FX); knob(K5, 30); knob(K5, -30); knob(K5, 13); press(SAVE); x = tr(); s = (press(FX), state());
  check(x.row === 13 && (s.pads[to].code & 7) !== 0, 'DELETE CLIP (line 14, the last of page 2/3): one press asks, the clip is still there');
  press(FX); knob(K5, 13); step(900); press(SAVE); step(900); press(SAVE); s = (press(FX), state());
  check((s.pads[to].code & 7) !== 0, 'presses more than two seconds apart only ask again');
  step(900); press(FX); knob(K5, 13); press(SAVE); press(SAVE); s = (press(FX), state());
  check((s.pads[to].code & 7) === 0 && tr().unsaved === 1, 'two presses delete the copy: the pad is empty, the song is unsaved (code ' + s.pads[to].code + ')');
  pad(0); pad(0); press(FX); knob(K5, 30); knob(K5, -30); knob(K5, 13); press(SAVE); press(SAVE); s = (press(FX), state());
  check((s.pads[0].code & 7) !== 0, 'clip 1 is used by a scene: it is not deleted');
  press(FX); knob(K5, 1); press(SAVE); x = tr(); press(FX);
  check(x.unsaved === 0 && c.sim_song_load(0) === 0, 'saved, and the song loads again without the copy');
  s = state(); check((s.pads[to].code & 7) === 0 && (s.pads[0].code & 7) !== 0, 'after loading: the copy\'s pad is empty, clip 1 is there'); }

/* ---- tabby-v04.14: everything the device wrote goes through both of the page's readers and back unchanged ---- */
{ const { createRequire } = await import('node:module'); const req = createRequire(import.meta.url);
  const Format = req(join(root, 'web/import/song-format.js')), V3 = req(join(root, 'web/clip-v3/clip-v3.js')), W = globalThis.FM1Web;
  const bytes = stored(); let why = '';
  let a = null, b = null, a2 = null, b2 = null;
  try { a = W.songRecordParse(bytes); a2 = W.songRecordBuild(a); } catch (e) { why += ' page: ' + e.message; }
  try { b = Format.decodeRecord(bytes); } catch (e) { why += ' workbench: ' + e.message; }
  const same = (x, y, from, to) => { for (let i = from; i < to; i++) if (x[i] !== y[i]) return i; return -1; };
  check(a && a2 && same(a2, bytes, 20, 2624) < 0, 'the page reads the saved record and builds the same bytes 20 to 2623 (first difference at ' + (a2 ? same(a2, bytes, 20, 2624) : '-') + why + ')');
  check(b && b.knobs && b.knobs[0] === 8 && b.click && b.click[0] === bytes[44], 'the workbench reader keeps the controller numbers and the click level (' + why + ')');
  const ids = [...new Set(b ? b.clips.flat().filter(Boolean) : [])]; let clips = 0, chains = 0, bad = [];
  for (const id of ids) {
    const n = c.sim_block_read(0, id); if (n <= 0) { bad.push(id + ': not read'); continue; }
    const payload = mem().slice(c.sim_file(), c.sim_file() + n), v3 = V3.validate(payload) === 0;
    if (!v3) continue;
    clips++; if (payload[8]) chains++;
    try { const back = Format.payloadOf(Format.decodeBlock(payload, id, Format.LIMITS.formatV3));
      if (back.format !== Format.LIMITS.formatV3 || back.bytes.length !== payload.length || same(back.bytes, payload, 0, payload.length) >= 0) bad.push(id + ': differs at byte ' + (back.bytes.length !== payload.length ? 'length' : same(back.bytes, payload, 0, payload.length))); }
    catch (e) { bad.push(id + ': ' + e.message); }
  }
  { /* tabby-v04.15: a transposed clip comes back with its transpose */
    const n = c.sim_block_read(0, ids.find(id => { const k = c.sim_block_read(0, id); return k > 0 && V3.validate(mem().slice(c.sim_file(), c.sim_file() + k)) === 0; }));
    const q = mem().slice(c.sim_file(), c.sim_file() + n); q[12] = 0xfe;
    let back = null, why2 = ''; try { back = Format.payloadOf(Format.decodeBlock(q, 9, Format.LIMITS.formatV3)); } catch (e) { why2 = e.message; }
    q[12] = 13; const refused = V3.validate(q) !== 0;
    q[12] = 0; q[13] = 21; q[15] = 2; let back17 = null; try { back17 = Format.payloadOf(Format.decodeBlock(q, 9, Format.LIMITS.formatV3)); } catch (e) { why2 += e.message; }
    q[13] = 52; const refused17 = V3.validate(q) !== 0; q[13] = 0; q[15] = 4; const refused17b = V3.validate(q) !== 0; q[15] = 0; q[14] = 5; const refused17c = V3.validate(q) !== 0;
    q[14] = 2; let back19 = null; try { back19 = Format.payloadOf(Format.decodeBlock(q, 9, Format.LIMITS.formatV3)); } catch (e) { why2 += e.message; } q[14] = 0;
    check(back19 && back19.bytes[14] === 2 && back19.bytes.length === q.length, 'a clip with STEP SIZE 1/32 comes back from the workbench with it (' + why2 + ')');
    q[14] = 0x21; let back20 = null; try { back20 = Format.payloadOf(Format.decodeBlock(q, 9, Format.LIMITS.formatV3)); } catch (e) { why2 += e.message; } q[14] = 0x30; const refused20 = V3.validate(q) !== 0; q[14] = 0;
    check(back20 && back20.bytes[14] === 0x21 && refused20, 'a clip with DIRECTION FWD THEN REV and STEP SIZE 1/8 comes back with both; direction 3 is refused (' + why2 + ')');
    check(back17 && back17.bytes[13] === 21 && back17.bytes[15] === 2 && back17.bytes.length === q.length && refused17 && refused17b && refused17c, 'a clip with SHUFFLE 20 and PLAY QUANTIZE 1/8 comes back from the workbench with them; shuffle 52, quantize 4 and step size 5 are refused (' + why2 + ')');
    check(back && back.bytes[12] === 0xfe && back.bytes.length === q.length && refused, 'a clip with TRANSPOSE -2 comes back from the workbench with it; +13 is refused (' + why2 + ')'); }
  check(clips >= 2 && chains >= 2 && !bad.length, clips + ' clips made on the device (' + chains + ' with a chain) come back from the workbench byte for byte: length, chain, program and bank (' + bad.join('; ') + ')');
  /* the Full backup names the song it cannot read and stops (the tabby-v04.10 page stood at 66 %) */
  const lib = Object.create(W.Library.prototype);
  Object.assign(lib, { link: { lost: false }, songStorage: true, settingsTransfer: false, radioSettings: false,
    songStoragePlaying: async () => false, query: async cmd => { if (cmd === 0) return new Uint8Array(14); if (cmd === 9) throw Object.assign(new Error('empty'), { deviceCode: 1 }); return new Uint8Array(0); },
    download: async () => new Uint8Array(8), upload: async () => {},
    songRead: async slot => { if (slot === 6) throw new Error('Scene 5 is invalid'); return null; } });
  let said = '', seen = 0; try { await lib.fullRead(p => { seen = p; }); } catch (e) { said = e.message; }
  check(/^STOPPED at song 7: this page cannot read it \(Scene 5 is invalid\)\. No backup file was made/.test(said) && /delete song 7/.test(said), 'the Full backup stops at a song the page cannot read and names it (' + said.slice(0, 90) + '…)');
  lib.songRead = async slot => { if (slot === 2) throw Object.assign(new Error('The device does not respond'), { code: 'NO_REPLY' }); return null; };
  said = ''; try { await lib.fullRead(); } catch (e) { said = e.message; }
  check(said === 'The device does not respond', 'a lost link is reported as it is, not as an unreadable song'); }

/* ---- tabby-v04.16: on SCENES, stopped: EDIT held + K1 moves the selected scene, FX twice deletes it ---- */
{ if (c.sim_song_status(0) >>> 8 & 255) { press(PLAY); step(200); }
  s = state(); if (s.page !== 20 && s.page !== 19) press(BT);
  s = state(); if (s.page !== 19) press(SCL);
  s = state(); let n0 = setup().scenes;
  if (scene().row !== 1) pad(1);
  let q = scene(); const t1 = q.times;
  knob(K1, 2); q = scene();
  check(s.page === 19 && n0 >= 2 && q.row === 1 && q.times === t1 + 2, 'SCENES, stopped, scene 2 selected of ' + n0 + '; its TIMES set to ' + (t1 + 2));
  const editKnob = d => { c.sim_smk37(BUTTON, EDIT, 1); step(8); knob(K1, d); c.sim_smk37(BUTTON, EDIT, 0); step(4); };
  editKnob(-1); q = scene();
  check(q.row === 0 && q.times === t1 + 2 && q.unsaved === 1 && setup().scenes === n0, 'EDIT held + K1 left: the scene is now scene 1 and still the selected one (scene ' + (q.row + 1) + ', times ' + q.times + ')');
  editKnob(-1); q = scene();
  check(q.row === 0 && q.times === t1 + 2, 'the first scene moves no earlier');
  editKnob(1); q = scene();
  check(q.row === 1 && q.times === t1 + 2, 'EDIT held + K1 right: back to scene 2');
  press(FX); check(setup().scenes === n0, 'FX once asks (FX AGAIN DELETES SCENE 002): nothing is deleted');
  step(900); press(FX); check(setup().scenes === n0, 'a second press more than two seconds later only asks again');
  step(900); press(FX); press(FX); q = scene();
  check(setup().scenes === n0 - 1 && q.row === 0 && q.times !== t1 + 2 && q.unsaved === 1, 'FX twice: the scene is deleted; ' + (n0 - 1) + ' left, scene 1 is selected, the song is unsaved');
  s = state(); check(s.page === 19, 'still on SCENES (FX and EDIT open no other page here)');
  press(PLAY); step(300); press(FX); press(FX); editKnob(1);
  check(setup().scenes === n0 - 1, 'while the song plays nothing is deleted or moved (STOP TO DELETE OR MOVE A SCENE)');
  press(PLAY); step(200);
  press(SAVE); step(20);
  const r = stored(); let why = '';
  try { globalThis.FM1Web.songRecordParse(r); } catch (e) { why = e.message; }
  check(r[40] === n0 - 1 && !why && c.sim_song_load(0) === 0 && setup().scenes === n0 - 1, 'saved: the record has ' + (n0 - 1) + ' scene(s), the page reads it, and it loads again ' + why); }

c.sim_midi_capture(0); c.sim_midi_drain(0);
{ const held = new Map(); let bad = 0;
  for (const m of log) { const st = m[0] & 0xf0, k = (m[0] & 15) + ':' + m[1]; if (st === 0x90 && m[2]) held.set(k, (held.get(k) || 0) + 1); else if (st === 0x80 || (st === 0x90 && !m[2])) { if (!held.get(k)) bad++; else held.set(k, held.get(k) - 1); } }
  for (const v of held.values()) if (v) bad++;
  check(bad === 0, 'every note-on has its note-off, the clicks too (' + log.length + ' messages)'); }
console.log(`\nsetup-sim: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
