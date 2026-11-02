// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/simulator-wasm-smoke.mjs — smoke test of build/web/simulator.wasm under Node
//
// Purpose
//   Confirm that the simulator compiled by tools/linux/build-web.py (the same wasm the
//   browser workbench embeds) initializes and behaves outside Chrome, using only Node's
//   built-in WebAssembly. The page instantiates the module with no imports and calls
//   _initialize() (sdk/Simulator.js L19-L28); this test does the same, then:
//     1. boots with cleared storage (sim_boot(1)) and reads the panel snapshot;
//     2. enables MIDI capture and presses one SMK37 key (sim_smk37(SMK37_KEY, id, velocity));
//     3. runs audio blocks (sim_render) so queued MIDI is delivered;
//     4. checks that a Note On for note 48 + id + 12*octave left on the keyboard track's
//        configured output channel on every ready port, and that the release sends Note Off.
//   The expected channel is read back from the simulator (sim_midi_setting(track, 1)) and
//   is also asserted to be the product default for track 0: MIDI channel 1 (status 0x90).
//
//   Run with the nodesource Node (22 LTS), not Homebrew's:
//       /usr/bin/node tests/simulator-wasm-smoke.mjs [build/web/simulator.wasm]
//   Exit status 0 on success; every check prints "ok" or "FAIL" and the reason.
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-01  Initial version (Task 01, Steps 6-7).

import { readFileSync } from 'node:fs';

const SMK37_KEY = 1;                    // app/smk37_controls.h enum order: BUTTON, KEY, ...
const path = process.argv[2] ?? 'build/web/simulator.wasm';
let failures = 0;
const check = (ok, what, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

const bytes = readFileSync(path);
const instance = new WebAssembly.Instance(new WebAssembly.Module(bytes), {});
const c = instance.exports;
check(typeof c._initialize === 'function', 'reactor exports _initialize');
c._initialize();
check(c.memory.buffer.byteLength >= 4194304, 'initial memory >= 4 MiB', `${c.memory.buffer.byteLength} bytes`);

// 1. Boot with cleared storage; the panel snapshot must be readable.
c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
const state = mem().subarray(c.sim_state(), c.sim_state() + 225);
check(state.length === 225, 'sim_state snapshot readable');
check(c.sim_lcd_count() >= 0 && c.sim_lcd_targets() > 0, 'LCD target table readable', `${c.sim_lcd_count()} targets on the start page`);
check(c.sim_block_frames() > 0, 'audio block frames', `${c.sim_block_frames()}`);

// 2. Keyboard note. Track for the keys = bits 0..2 of sim_smk37_instruments(); octave = bits 14..16 - 2.
const inst = c.sim_smk37_instruments() >>> 0;
const track = inst & 7, octave = ((inst >>> 14) & 7) - 2;
const channel = c.sim_midi_setting(track, 1) >>> 0;       // output channel of that track
const ports = c.sim_midi_setting(track, 2) >>> 0;         // destination port mask
check(track === 0 && channel === 0, 'default keyboard track 0 on MIDI channel 1', `track ${track}, channel ${channel + 1}, octave ${octave}`);
check(ports === 7, 'default destinations: all three ports', `mask ${ports}`);

c.sim_midi_capture(1);
const id = 12, velocity = 100, expectNote = 48 + id + 12 * octave;
check(c.sim_smk37(SMK37_KEY, id, velocity) === 0, 'key press accepted');
for (let i = 0; i < 8; i++) c.sim_render();                // 3. deliver queued MIDI (10 ms polls)

const drain = () => {
  const out = [];
  for (;;) {
    const r = c.sim_midi_output() >>> 0; if (!r) break;
    const n = r & 255, port = r >>> 8;
    out.push({ port, data: Array.from(mem().subarray(c.sim_file(), c.sim_file() + n)) });
  }
  return out;
};
const on = drain();
const noteOn = on.filter(m => m.data[0] === (0x90 | channel) && m.data[1] === expectNote && m.data[2] === velocity);
check(noteOn.length > 0, `Note On ${expectNote} velocity ${velocity} on channel ${channel + 1}`, JSON.stringify(on));
check(new Set(noteOn.map(m => m.port)).size === 3, 'Note On delivered to ports 0, 1 and 2', `ports ${[...new Set(noteOn.map(m => m.port))]}`);
// System real-time bytes (0xF8 clock) carry no channel and are expected alongside the note.
check(on.every(m => m.data[0] >= 0xf0 || (m.data[0] & 0x0f) === channel), 'no channel message on another channel');

// 4. Release: Note Off (0x80, or Note On with velocity 0) for the same note and channel.
check(c.sim_smk37(SMK37_KEY, id, 0) === 0, 'key release accepted');
for (let i = 0; i < 8; i++) c.sim_render();
const off = drain();
const noteOff = off.filter(m => (m.data[0] === (0x80 | channel) || (m.data[0] === (0x90 | channel) && m.data[2] === 0)) && m.data[1] === expectNote);
check(noteOff.length > 0, `Note Off ${expectNote} on channel ${channel + 1}`, JSON.stringify(off));

// Audio keeps rendering after the note: one block of float output, finite values.
const out = new Float32Array(c.memory.buffer, c.sim_render(), c.sim_block_frames() * 2);
check(out.every(Number.isFinite), 'render output finite');

console.log(failures ? `${failures} check(s) FAILED` : 'all checks passed');
process.exit(failures ? 1 : 0);
