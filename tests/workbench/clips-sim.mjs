// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/clips-sim.mjs — the CLIPS and SCENES pages played through the panel (Task 17 Goal 4)
//
// Purpose
//   docs/CONTROL-MAP.md, tested on the simulator wasm with nobody at the panel: every action is a panel
//   event (sim_smk37: buttons, pads), every check reads the page state the firmware reports
//   (sim_clips_state: page, track, banks, selected clip, per pad its state code and LED colour) and the
//   MIDI out (drained every block). Checked: BT opens and leaves the page; pad colours for empty,
//   stopped, playing, queued, stop queued, selected and muted; a launch and a stop land on the next
//   master cycle (the first note of the launched clip within one block of the boundary, nothing of the
//   old clip after it); taking a queue back; the long press (select only); a clip no scene uses; mute
//   holds the track's notes back and the clip runs on; ENV sends the track back; a scene recall from the
//   SCENES page; every note-on has its note-off.
//
//   The song (record version 3, 120 BPM, loop on, master cycle 16 steps; channels 10 / 2 for T1 / T2):
//     T1 place 1 = block 1: 42 on steps 0 4 8 12      T1 place 2 = block 5: 44 on steps 0 8
//     T2 place 1 = block 2: 36 on step 0, 38 on 8     T2 place 3 = block 6: 50 on steps 0 16 32 48 (in no scene)
//     scene 1: T1 place 1, T2 place 1 (16 steps)      scene 2: T1 place 2, T2 place 1 (16 steps)
//
//   Run:  /usr/bin/node tests/workbench/clips-sim.mjs build/web/simulator.wasm   (make midi-import-sim)
//
// Version: 0.3
//
// Revision log
//   v0.3  2026-11-16  After a stop nothing plays and nothing is launched (tabby-v04.9.2).
//   v0.2  2026-11-16  A pad pressed while stopped reserves its clip and PLAY starts it; the mixer's mute shows blue.
//   v0.1  2026-11-14  Initial version.

import '../../scripts/oc_guard.mjs';   // OC-GUARD: the Orange Cat soak rule, before anything else
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
const shiftPad = (i, blocks = i >= 8 ? 80 : 8) => { c.sim_smk37(BUTTON, SHIFT, 1); step(4); c.sim_smk37(PAD, i, 100); step(blocks); c.sim_smk37(PAD, i, 0); step(4); c.sim_smk37(BUTTON, SHIFT, 0); step(4); };   /* tabby-v1.5: a mute under KNOB BANK needs its pad held 150 ms */
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
step(20);
press(BT);
let s = state();
check(s.page === 20, 'BT opens the CLIPS page (page ' + s.page + ')');
shiftPad(0); s = state();
check(s.track === 0, 'SHIFT + pad 1 selects track 1');
check(s.pads[0].code === 1 && s.pads[1].code === 1 && s.pads[2].code === 0, 'T1 stopped: pads 1 and 2 hold clips (stopped), pad 3 is empty (' + s.pads.slice(0, 3).map(p => p.code) + ')');
check(s.pads[0].rgb === 0x080808 && s.pads[2].rgb === 0, 'colours: stopped dim white, empty off (' + hex(s.pads[0].rgb) + ', ' + hex(s.pads[2].rgb) + ')');
pad(0); s = state();
check(s.selected === 0 && s.pads[0].code === (3 | 8) && (trackStatus(0) >> 2 & 3) === 1, 'a pad pressed while stopped reserves its clip (MC-707: "reserves playback"): queued, selected (code ' + s.pads[0].code + ')');
pad(0); s = state();
check(s.pads[0].code === 9 && s.pads[0].rgb === 0x303030 && (trackStatus(0) >> 2 & 3) === 0, 'pressed again: the reservation is taken back; the clip stays selected, bright white (' + hex(s.pads[0].rgb) + ')');
pad(2); s = state();
check(s.selected === 2 && s.pads[2].code === 8 && s.pads[2].rgb === 0x020810 && (trackStatus(0) >> 2 & 3) === 0, 'tabby-v04.10: an empty pad is selected (dim cyan; REC or EDIT makes a clip there) and nothing is queued (code ' + s.pads[2].code + ', ' + hex(s.pads[2].rgb) + ')');
pad(0); pad(0); s = state();
check(s.selected === 0 && s.pads[0].code === 9 && s.pads[2].code === 0, 'pad 1 pressed twice: selected again, nothing reserved');

/* ---- play ------------------------------------------------------------------------------ */
press(PLAY);
while (origin < 0 && block < 4000) step();
check(origin >= 0, 'PLAY on the CLIPS page starts the song (first note at block ' + origin + ')');
toBar(0, 30); s = state();
check(s.pads[0].code === 10 && s.pads[0].rgb === 0x103c10 && s.pads[1].code === 1, 'scene 1 plays: pad 1 playing and selected (bright green), pad 2 stopped (' + s.pads[0].code + ' ' + hex(s.pads[0].rgb) + ')');
toBar(1, 30); s = state();
check(s.pads[1].code === 2 && s.pads[1].rgb === 0x083008 && s.pads[0].code === 9, 'scene 2 plays: pad 2 green, pad 1 back to selected / stopped (' + s.pads[1].code + ' ' + hex(s.pads[1].rgb) + ')');

/* ---- launch: lands on the master cycle ------------------------------------------------- */
toBar(2, 200);                                /* scene 1 again (T1 plays place 1); a third of the bar in */
pad(1); s = state();
check(s.pads[1].code === (3 | 8) && (trackStatus(0) >> 2 & 3) === 1, 'pad 2 pressed: its clip is queued and selected (code ' + s.pads[1].code + ')');
{ const seen = new Set(); for (let i = 0; i < 180; i++) { step(); seen.add(state().pads[1].rgb); }
  check(seen.has(0x083008) && seen.has(0) && seen.size === 2, 'the queued pad blinks green (' + [...seen].map(hex) + ')'); }
toBar(3, 30); s = state();
check(pitches(2, 9) === '42 42 42 42', 'the old clip plays to the end of its bar (' + pitches(2, 9) + ')');
check((trackStatus(0) & 3) === 1 && s.pads[1].code === (2 | 8) && s.pads[1].rgb === 0x103c10, 'at the next cycle T1 is launched on place 2: pad 2 playing (' + s.pads[1].code + ')');
toBar(5, 0);
check(pitches(3, 9) === '44 44' && pitches(4, 9) === '44 44', 'the launched clip loops over the scene changes (bar 4: ' + pitches(3, 9) + '; bar 5: ' + pitches(4, 9) + ')');
check(Math.abs(firstOn(3, 9)) <= 1, 'its first note is within one block of the cycle boundary (' + firstOn(3, 9) + ')');

/* ---- stop -------------------------------------------------------------------------------- */
toBar(5, 100);
pad(1); s = state();
check(s.pads[1].code === (4 | 8) && (trackStatus(0) >> 2 & 3) === 2, 'the playing pad pressed: a stop is queued (code ' + s.pads[1].code + ')');
{ const seen = new Set(); for (let i = 0; i < 180; i++) { step(); seen.add(state().pads[1].rgb); }
  check(seen.has(0x300808) && seen.has(0) && seen.size === 2, 'the pad with a stop queued blinks red (' + [...seen].map(hex) + ')'); }
toBar(7, 0); s = state();
check((trackStatus(0) & 3) === 2 && pitches(5, 9) === '44 44' && pitches(6, 9) === '', 'the stop lands on the cycle: bar 6 played, bar 7 is silent on T1');
check(s.pads[1].code === (1 | 8), 'pad 2 is stopped (selected) again');

/* ---- take a queue back; the long press ---------------------------------------------------- */
toBar(7, 100);
pad(0); check(state().pads[0].code === (3 | 8), 'pad 1 queued');
pad(0); s = state();
check(s.pads[0].code === (1 | 8) && (trackStatus(0) >> 2 & 3) === 0, 'the blinking pad pressed again: the launch is taken back');
toBar(8, 60);
check((trackStatus(0) & 3) === 2, 'nothing was launched at the cycle');
c.sim_smk37(PAD, 1, 100); step(40);
check(state().pads[1].code === (3 | 8), 'a held pad queues at once (so a short press never loses a cycle)');
step(200); s = state();                                              /* 240 blocks = 0.70 s held */
check(s.pads[1].code === (1 | 8) && (trackStatus(0) >> 2 & 3) === 0 && s.selected === 1, 'held half a second: selected only, the launch is taken back');
c.sim_smk37(PAD, 1, 0); step(4);
toBar(10, 0);
check((trackStatus(0) & 3) === 2 && pitches(9, 9) === '', 'T1 stays stopped after the long press');

/* ---- track 2: a clip no scene uses, mute, back to the scenes ---------------------------- */
shiftPad(1); s = state();
check(s.track === 1 && s.pads[0].code === 2 && s.pads[1].code === 0 && s.pads[2].code === 1, 'SHIFT + pad 2: track 2: pad 1 plays (following), pad 2 empty, pad 3 a clip (' + s.pads.slice(0, 3).map(p => p.code) + ')');
toBar(10, 100);
pad(2);
toBar(11, 30); s = state();
check((trackStatus(1) & 3) === 1 && ((trackStatus(1) >> 8) & 255) === 128 + 2 && s.pads[2].code === (2 | 8), 'the clip in no scene is launched as a place row (row ' + ((trackStatus(1) >> 8) & 255) + ')');
toBar(13, 0);
check(pitches(11, 1) === '50' && pitches(12, 1) === '50' && Math.abs(firstOn(11, 1)) <= 1, 'it plays on the cycle with its own length (bar 12: ' + pitches(11, 1) + '; bar 13: ' + pitches(12, 1) + ')');
toBar(13, 100);
shiftPad(9, 8); step(8); s = state();
check(!(s.pads[2].code & 16), 'tabby-v1.5: SHIFT + pad 10 only brushed (23 ms): nothing is muted');
c.sim_smk37(BUTTON, SHIFT, 1); step(4); c.sim_smk37(PAD, 9, 100); step(20); c.sim_smk37(PAD, 1, 100); step(60); c.sim_smk37(PAD, 9, 0); c.sim_smk37(PAD, 1, 0); step(4); c.sim_smk37(BUTTON, SHIFT, 0); step(8); s = state();
check(!(s.pads[2].code & 16) && s.track === 1, 'the lower pad caught on the way to the upper one (pad 10, then pad 2 within 60 ms): track 2 is selected and not muted');
shiftPad(9); step(8); s = state();
check(s.pads[2].code === (2 | 8 | 16) && s.pads[2].rgb === 0x301808 && s.pads[0].rgb === 0x0c0600, 'SHIFT + pad 10 mutes track 2: playing pad orange, stopped pad dim orange (' + hex(s.pads[2].rgb) + ', ' + hex(s.pads[0].rgb) + ')');
toBar(15, 0);
check(pitches(14, 1) === '' && (trackStatus(1) & 3) === 1, 'muted: no note of T2 goes out in bar 15, the clip runs on');
toBar(15, 100);
shiftPad(9);
toBar(17, 0);
check(pitches(16, 1) === '50' && Math.abs(firstOn(16, 1)) <= 1, 'unmuted: the clip is back in time (bar 17: ' + pitches(16, 1) + ')');
/* the mixer's own mute (as the MIX page sets it): the internal sound only; the song still plays the track; blue pads */
toBar(17, 20);
c.sim_mix_toggle(1, 0); step(80); s = state();
check(s.pads[2].code === (2 | 8 | 32) && s.pads[2].rgb === 0x081830 && s.pads[0].rgb === 0x02060c, 'a mute set in the mixer: pads blue, not orange (' + s.pads[2].code + ' ' + hex(s.pads[2].rgb) + ', ' + hex(s.pads[0].rgb) + ')');
c.sim_mix_toggle(1, 0); step(80); s = state();
check(s.pads[2].code === (2 | 8), 'mixer mute off: the pads are green and white again');
toBar(17, 100);
press(ENV);
check((trackStatus(1) >> 2 & 3) === 3, 'ENV queues track 2 back to the scenes');
toBar(19, 0); s = state();
check((trackStatus(1) & 3) === 0 && pitches(18, 1) === '36 38' && s.pads[0].code === 2, 'at the cycle T2 follows the scenes again (bar 19: ' + pitches(18, 1) + ')');

/* ---- the SCENES page: recall ------------------------------------------------------------- */
press(SCL); s = state();
check(s.page === 19, 'SCL switches to the SCENES page');
check(s.pads[2].code === 0 && s.pads[2].rgb === 0 && s.pads.slice(0, 2).every(p => p.code === 1 || p.code === 2) && s.pads.filter(p => p.code === 2).length === 1,
  'scene pads: two scenes, one of them playing, pad 3 off (' + s.pads.slice(0, 3).map(p => p.code) + ')');
toBar(19, 100);                                /* bar 20 is scene 1 (even bars play scene 1); recall scene 2 instead */
{ const playingNow = state().pads.findIndex(p => p.code === 2), want = playingNow;   /* the scene that plays now would not be next: recall it again */
  pad(want); s = state();
  check(s.pads[want].code === 3, 'a scene pad pressed: scene ' + (want + 1) + ' is queued');
  toBar(20, 30); s = state();
  check(s.pads[want].code === 2 && s.pads[want].rgb === 0x083008 && [0, 1].every(t => (trackStatus(t) & 3) === 0), 'the recall lands on the cycle: scene ' + (want + 1) + ' plays again, every track follows');
  toBar(21, 0);
  check(pitches(20, 9) === (want ? '44 44' : '42 42 42 42'), 'T1, stopped before, plays the recalled scene\'s clip (' + pitches(20, 9) + ')'); }
press(BT); check(state().page === 20, 'BT from SCENES opens CLIPS');
press(BT); check(state().page === 19, 'BT again returns to the page it came from (SCENES)');

/* ---- stop ---------------------------------------------------------------------------------- */
press(PLAY); step(40);
check(((c.sim_song_status(0) >>> 8) & 255) === 0, 'PLAY stops the song');
/* ---- stopped after a performance: nothing plays, nothing is launched (tabby-v04.9.2) ---------------------------- */
{ press(BT); shiftPad(0); press(PLAY); step(100); pad(1); step(800);          /* play; in the first bar (scene 1) launch clip 2 on track 1; let it land */
  check((trackStatus(0) & 3) === 1 && state().pads[1].code === (2 | 8), 'a clip is launched and plays');
  press(PLAY); step(60); s = state();
  check((trackStatus(0) & 3) === 0 && s.pads[1].code === (1 | 8) && s.pads[1].rgb === 0x303030 && s.pads[0].code === 1, 'the song stopped: no pad is green, no track is launched (' + s.pads.slice(0, 2).map(p => p.code) + ')');
  pad(1); s = state();
  check(s.pads[1].code === (3 | 8), 'the clip that was launched before the stop can be reserved like any other');
  pad(1); press(BT); }
/* ---- a clip reserved while stopped starts with PLAY (MC-707 Reference Manual p. 12) ---------------------------- */
{ press(BT); shiftPad(0); pad(1); s = state();
  check(s.page === 20 && s.pads[1].code === (3 | 8), 'stopped: pad 2 of track 1 reserved (code ' + s.pads[1].code + ')');
  const before = log.length; origin = -1;
  press(PLAY); while (origin < 0 && block < 400000) step();
  toBar(2, 0);
  check((trackStatus(0) & 3) === 1 && (trackStatus(1) & 3) === 0 && pitches(0, 9) === '44 44' && pitches(1, 9) === '44 44' && pitches(0, 1) === '36 38',
    'PLAY: track 1 starts on the reserved clip and loops it, track 2 follows the scenes (bar 1 T1: ' + pitches(0, 9) + '; T2: ' + pitches(0, 1) + ')');
  check(Math.abs(firstOn(0, 9)) <= 1 && state().pads[1].code === (2 | 8), 'its first note is the song\'s first note; its pad is green');
  press(PLAY); step(40); void before; }
c.sim_midi_capture(0); c.sim_midi_drain(0);
{ const held = new Map(); let bad = 0;
  for (const m of log) { const st = m[0] & 0xf0, k = (m[0] & 15) + ':' + m[1]; if (st === 0x90 && m[2]) held.set(k, (held.get(k) || 0) + 1); else if (st === 0x80 || (st === 0x90 && !m[2])) { if (!held.get(k)) bad++; else held.set(k, held.get(k) - 1); } }
  for (const v of held.values()) if (v) bad++;
  check(bad === 0, 'every note-on has its note-off, nothing stuck (' + log.length + ' messages)'); }
check(log.filter(m => m[0] === 0xfa).length === 3 && log.filter(m => m[0] === 0xfc).length === 3, 'Start and Stop three times, for the three PLAY presses each: nothing else on the page touched the transport');

console.log(`\nclips-sim: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
