// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/row-events-sim.mjs — a song with row events played through the WASM simulator
//
// Purpose
//   Task 04 simulator check: build a three-row song in the workbench's own model
//   (sdk/WebUpdate.js songRecordBuild, a version-2 record) with a program change and a
//   control change on every row, write it into the simulator's song storage the way the
//   simulator target does, play it to the end with MIDI capture on, and check on MIDI out:
//     1. before each row's first note the row's two events arrive, program change then
//        control change, on their own channels (rows 1..3 on channels 1, 2, 3);
//     2. every event exactly once, nothing on another channel, Start first, Stop last;
//     3. the status reply reports 6 events and 0 late rows;
//     4. the rig's gap generation (web/rig/rig.js applyGaps) and the record round trip.
//
//   Run:  /usr/bin/node tests/workbench/row-events-sim.mjs [build/web/simulator.wasm]
//         (or: make midi-import-sim, after make web)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-02  Initial version (Task 04, workbench part).

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const wasmPath = process.argv[2] ?? join(root, 'build/web/simulator.wasm');
let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

/* WebUpdate.js under Node (classic script). */
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', requestMIDIAccess: () => Promise.reject(new Error('no midi')) }, configurable: true });
globalThis.window = globalThis;
globalThis.document = { addEventListener() {}, querySelector() { return null; }, getElementById() { return null; } };
globalThis.location = { search: '' };
(0, eval)(readFileSync(join(root, 'web/timed-note/timed-note.js'), 'utf8'));   /* Task 05: WebUpdate.js uses TabbyTimedNote */
(0, eval)(readFileSync(join(root, 'sdk/WebUpdate.js'), 'utf8'));
const W = globalThis.FM1Web;
const D = require(join(root, 'web/rig/device-library.js')), R = require(join(root, 'web/rig/rig.js'));

/* ---- the song: three rows of 16 steps, block 1 (a C4 at step 0) on track 1 ------------ */
const block = new Uint8Array(67); block[0] = 1; block[1] = 60; block[2] = 100; block[3] = 1;
const song = Object.assign(W.songEmpty(), { name: 'EVENT SIM', rows: [0, 1, 2].map(() => ({ block: [1, 0, 0, 0, 0, 0, 0, 0], repeat: 1, loopHere: false, steps: 16 })),
  events: [{ row: 0, channel: 0, type: 0, d0: 5, d1: 0, d2: 0 }, { row: 0, channel: 0, type: 2, d0: 74, d1: 100, d2: 0 },
           { row: 1, channel: 1, type: 1, d0: 255, d1: 1, d2: 9 }, { row: 1, channel: 1, type: 2, d0: 7, d1: 90, d2: 0 },
           { row: 2, channel: 2, type: 0, d0: 12, d1: 0, d2: 0 }, { row: 2, channel: 2, type: 2, d0: 1, d1: 64, d2: 0 }] });
const record = W.songRecordBuild(song);
check(new DataView(record.buffer).getUint32(20, true) === 2 && W.songRecordParse(record).events.length === 6, 'workbench builds a version-2 record with six events and parses it back');

/* The rig: Blofeld on channel 2 asks for no gap by definition; give it 20 ms in the profile. */
const lib = D.load(['waldorf-blofeld', 'eventide-h90'].map(id => JSON.parse(readFileSync(join(root, 'web/devices', id + '.json'), 'utf8'))));
const rig = R.rigEmpty(); rig.channels[1].device = 'waldorf-blofeld'; rig.channels[1].gapMs = 20;
const withGaps = R.applyGaps(song.events, rig, lib);
check(withGaps.length === 7 && withGaps[3].type === 3 && withGaps[3].d0 === 20 && withGaps[2].type === 1, 'rig gaps: a 20 ms gap after the Blofeld program change, nothing else changed', withGaps.map(e => e.type).join(''));
check(/program B010 "/.test(R.describe(song.events[2], rig, lib)) && /CC 7 Channel Volume = 90/.test(R.describe(song.events[3], rig, lib)), 'rig vocabulary: B010 with its factory name, CC 7 = Channel Volume', R.describe(song.events[2], rig, lib));

/* ---- the simulator ---------------------------------------------------------------------- */
const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(wasmPath)), {}).exports;
c._initialize(); c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
const SLOT = 4;
mem().set(block, c.sim_file());
check(c.sim_block_write(SLOT, 1, block.length) === 0, 'block stored');
mem().set(record, c.sim_file());
check(c.sim_song_record_write(SLOT) === 0, 'version-2 record stored in the simulator');
check(c.sim_song_load(SLOT) === 0 && (c.sim_song_status(3) >>> 0) === 6, 'song loads, status reports 6 events', `${c.sim_song_status(3)}`);
c.sim_midi_capture(1);
check(c.sim_song_play() === 0, 'song plays');
const log = [];
let started = false;
for (let i = 0; i < 6000; i++) {
  c.sim_render();
  for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) log.push({ s: d[0], a: d[1] | 0, b: d[2] | 0, i: log.length }); }
  const playing = (c.sim_song_status(0) >>> 8) & 255;
  if (playing) started = true; else if (started && i > 40) { for (let k = 0; k < 8; k++) { c.sim_render(); for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n); if (port === 0 && d[0] !== 0xf8) log.push({ s: d[0], a: d[1] | 0, b: d[2] | 0, i: log.length }); } } break; }
}
const find = (s, a, b, from = 0) => log.findIndex((m, i) => i >= from && m.s === s && m.a === a && (b === null || m.b === b));
const ch = c.sim_midi_setting(0, 1) >>> 0, on = 0x90 | ch;
const notes = []; for (let from = 0; ;) { const k = find(on, 60, 100, from); if (k < 0) break; notes.push(k); from = k + 1; }
check(notes.length === 3, 'three rows played their note', `${notes.length}`);
const pc1 = find(0xc0, 5, null), cc1 = find(0xb0, 74, 100), msb = find(0xb1, 32, 1), pc2 = find(0xc1, 9, null), cc2 = find(0xb1, 7, 90), pc3 = find(0xc2, 12, null), cc3 = find(0xb2, 1, 64);
check(find(0xfa, 0, 0) >= 0 && find(0xfa, 0, 0) < pc1, 'Start precedes the first event');
check(pc1 >= 0 && cc1 === pc1 + 1 && cc1 < notes[0], 'row 1: PC 5 then CC 74 on channel 1, before the first note', `${pc1} ${cc1} ${notes[0]}`);
check(msb > notes[0] && pc2 === msb + 1 && cc2 === pc2 + 1 && cc2 < notes[1], 'row 2: bank LSB 1, PC 9, CC 7 on channel 2, in order, before row 2\'s note', `${msb} ${pc2} ${cc2} ${notes[1]}`);
check(pc3 > notes[1] && cc3 === pc3 + 1 && cc3 < notes[2], 'row 3: PC 12 then CC 1 on channel 3, before row 3\'s note', `${pc3} ${cc3} ${notes[2]}`);
const once = [[0xc0, 5], [0xb0, 74], [0xb1, 32], [0xc1, 9], [0xb1, 7], [0xc2, 12], [0xb2, 1]].every(([s, a]) => log.filter(m => m.s === s && m.a === a).length === 1);
const stray = log.filter(m => m.s < 0xf0 && ![0xc0, 0xb0, 0xc1, 0xb1, 0xc2, 0xb2, on, 0x80 | ch].includes(m.s)).length;
check(once && stray === 0, 'every event exactly once, nothing on another channel', `stray ${stray}`);
check(find(0xfc, 0, 0) > cc3 && ((c.sim_song_status(2) >>> 16) & 0xffff) === 0, 'Stop last, 0 late rows', `late ${(c.sim_song_status(2) >>> 16) & 0xffff}`);
console.log(failures ? `${failures} check(s) FAILED` : 'all checks passed');
process.exit(failures ? 1 : 0);
