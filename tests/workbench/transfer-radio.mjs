// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/transfer-radio.mjs — transfer command 24 (Bluetooth settings) end to end
//
// Purpose
//   Task 06 checkpoint (a) removed the device's BLE page; its settings travel through transfer
//   command 24 instead (section 9.9 v0.7.2). This test drives the real transfer code in the
//   simulator wasm (web/engine/Simulator.c: sim_midi feeds a SysEx frame to fm1_app_sysex,
//   the reply comes back through the MIDI capture) with frames built by the workbench's own
//   demoFrame / demoParse (sdk/WebUpdate.js), so the wire form the workbench sends is the one
//   the device parses:
//     1. command 22 reports capability bit 5 (reply byte 8 = 63);
//     2. command 24 with no data reads {flags 7, role 0} (the simulator's defaults);
//     3. command 24 with {5, 1} writes radio on + MIDI, audio off, HOST, and reads back;
//     4. command 24 with {7, 0} restores the defaults;
//     5. command 24 with 0x7f (forget pairs) answers the simulator stub's "not ready" (-3,
//        reply code 67) instead of a protocol error, and a 3-byte payload is refused (71).
//
//   Run:  /usr/bin/node tests/workbench/transfer-radio.mjs build/web/simulator.wasm
//         (or: make workbench-test, after make web)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-04  Initial version (Task 06, checkpoint a).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const wasmPath = process.argv[2] || join(root, 'build/web/simulator.wasm');

/* WebUpdate.js is a classic script: give it the browser globals it touches at load. */
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', requestMIDIAccess: () => Promise.reject(new Error('no midi')) }, configurable: true });
globalThis.window = globalThis;
globalThis.document = { addEventListener() {}, querySelector() { return null; }, getElementById() { return null; } };
globalThis.location = { search: '' };
(0, eval)(readFileSync(join(root, 'web/timed-note/timed-note.js'), 'utf8'));
(0, eval)(readFileSync(join(root, 'sdk/WebUpdate.js'), 'utf8'));
const W = globalThis.FM1Web;

let failed = 0, passed = 0;
function check(cond, what, detail) {
  if (cond) { passed++; console.log('ok   ' + what); }
  else { failed++; console.log('FAIL ' + what + (detail === undefined ? '' : ' — ' + detail)); }
}

const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(wasmPath)), {}).exports;
c._initialize(); c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
c.sim_midi_capture(1);
let token = 100;
/* Send one command frame, run the control poll until its reply arrives, return the data
 * bytes (data[0] is the reply code, the rest the command's out bytes). */
function send(cmd, payload = []) {
  const frame = W.demoFrame(cmd, ++token, payload);
  mem().set(frame, c.sim_file());
  if (c.sim_midi(frame.length) !== 0) throw new Error('sim_midi refused the frame');
  for (let tick = 0; tick < 50; tick++) {
    for (;;) {
      const w = c.sim_midi_output() >>> 0; if (!w) break;
      const n = w & 255, port = w >>> 8, d = mem().slice(c.sim_file(), c.sim_file() + n);
      if (port !== 1 || d[0] !== 0xf0) continue;   /* replies leave on the port the frame came in on: USB = port 1 */
      const r = W.demoParse(d);
      if (r && r.command === (cmd | 64) && r.token === token) return r.data;
    }
    c.sim_render();
  }
  throw new Error('no reply to command ' + cmd);
}

const caps = send(22);
check(caps[0] === 0 && caps.length === 10, 'command 22 answers with 9 bytes', Array.from(caps).join(','));
check(caps[9] === 63, 'capability byte 8 = 63 (bit 5: Bluetooth settings)', caps[9]);

let r = send(24);
check(r[0] === 0 && r.length === 3, 'command 24 read answers {flags, role}', Array.from(r).join(','));
check(r[1] === 7 && r[2] === 0, 'defaults: radio on, audio on, MIDI on (7), role DEVICE (0)', r[1] + ',' + r[2]);

r = send(24, [5, 1]);
check(r[0] === 0, 'write {5, 1} (audio off, HOST) accepted', r[0]);
r = send(24);
check(r[1] === 5 && r[2] === 1, 'read back {5, 1}', r[1] + ',' + r[2]);
r = send(24, [1, 0]);
check(r[0] === 0, 'write {1, 0}: MIDI bit is forced on by the device', r[0]);
r = send(24);
check(r[1] === 5 && r[2] === 0, 'read back {5, 0}: flags 1 became 5', r[1] + ',' + r[2]);
r = send(24, [7, 0]);
check(r[0] === 0, 'defaults restored', r[0]);

r = send(24, [0x7f]);
check(r[0] === 67, 'forget pairs: the simulator stub answers "not ready" (code 67 = 64 - (-3))', r[0]);
r = send(24, [1, 2, 3]);
check(r[0] === 71, 'a 3-byte payload is refused (71)', r[0]);
r = send(24, [8, 0]);
check(r[0] === 71, 'a flag outside bits 0..2 is refused (71)', r[0]);

console.log(`${passed} ok, ${failed} failed`);
if (failed) { console.log('FAILED'); process.exit(1); }
console.log('all checks passed');
