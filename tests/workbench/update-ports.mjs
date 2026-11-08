// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/update-ports.mjs — which MIDI ports the updater talks to
//
// Purpose
//   Task 11B step 2. On the NUC the SMK-37 Pro shares the computer with an iConnectivity AUDIO4c,
//   which adds 10 MIDI ports. Before this fix, force flash and the factory V16 restore (which
//   turns force flash on) opened every MIDI input and sent the identity query (command 17) to
//   all of them; the connect timer ran out and an unrelated device received SysEx. The fix
//   (sdk/WebUpdate.js, UPDATE_PORT / pairs / Updater.discover / connect / waitFor): only ports
//   named like the SMK-37 or its Jieli loader are opened, in every flow; when none matches, or
//   several answer, connect() fails with code CHOOSE_PORT and the user picks one input.
//
//   Every scenario has 12 fake ports: the AUDIO4c's 10 (DIN, USB2, HST1..HST8), which must
//   never receive a byte, plus two more (the SMK-37, its loader, MIDI Through, an FM-1, or a
//   device with an unexpected name). Each fake port records every byte the updater sends it.
//     A  normal update: SMK37 Open + MIDI Through          -> connects, only SMK37 sent to
//     B  force flash, same ports                           -> connects, only SMK37 sent to
//     C  factory V16 (stock package, force), SINCO-MIDI    -> connects (legacy), only it sent to
//     D  SMK37 Open + the loader both answer               -> CHOOSE_PORT, then the pick only
//     E  no port named like the SMK-37 (force)             -> CHOOSE_PORT, nothing sent at all;
//                                                              the pick connects
//     F  re-enumeration: waitFor finds the loader          -> only SMK/loader ports sent to
//     G  an FM-1 ("Felucca") next to the SMK-37            -> the FM-1 is never sent to
//
//   Run:  /usr/bin/node tests/workbench/update-ports.mjs   (part of make workbench-test)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-08  Initial version (Task 11B, workbench port fix).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node' }, configurable: true });
globalThis.window = globalThis;
globalThis.document = { addEventListener() {}, querySelector() { return null; }, getElementById() { return null; } };
globalThis.location = { search: '' };
(0, eval)(readFileSync(join(root, 'sdk/WebUpdate.js'), 'utf8'));
const W = globalThis.FM1Web;

let failed = 0, passed = 0;
function check(cond, what, detail) {
  if (cond) { passed++; console.log('ok   ' + what); }
  else { failed++; console.log('FAIL ' + what + (detail === undefined ? '' : ' — ' + detail)); }
}

/* ---- fake Web MIDI ------------------------------------------------------------------------ */
const AUDIO4C = ['DIN', 'USB2', 'HST1', 'HST2', 'HST3', 'HST4', 'HST5', 'HST6', 'HST7', 'HST8'].map(n => 'AUDIO4c ' + n);
const ascii27 = text => { const b = new Uint8Array(27); for (let i = 0; i < text.length; i++) b[i] = text.charCodeAt(i); return b; };
const PKG = { model: 'pro', family: 9, build_id: 'ab'.repeat(32), kind: 'open', product: 'SMK-37 Pro_8000001',
  loaderIdentity: 'ota-SMK37' + 'ab'.repeat(8) };
const STOCK = { ...PKG, kind: 'stock', product: 'SMK-37 Pro_016' };

let nextId = 1;
/* One fake device port: an input and an output with the same name. `identity` set means the
   device answers command 17 (and command 49 for Open identities); null means it never answers. */
function device(name, identity = null, manufacturer = 'x') {
  const id = 'p' + nextId++;
  const listeners = new Set();
  const port = { name, identity, sent: [], connected: true };
  const state = () => port.connected ? 'connected' : 'disconnected';
  port.input = { id, name, manufacturer, get state() { return state(); }, async open() {}, async close() {},
    addEventListener(_t, f) { listeners.add(f); }, removeEventListener(_t, f) { listeners.delete(f); } };
  port.output = { id: 'o' + id, name, manufacturer, get state() { return state(); }, async open() {}, async close() {},
    send(bytes) {
      port.sent.push(Array.from(bytes));
      if (!port.identity) return;
      const msg = W.parse(Uint8Array.from(bytes)); if (!msg) return;
      let reply = null;
      if (msg.command === 17) reply = ascii27(port.identity);
      else if (msg.command === 49 && /_8\d{6}$/.test(port.identity)) {
        reply = new Uint8Array(47); reply.set([70, 77, 67, 49, 1, PKG.family, 0, 1], 0);
        reply[8] = 0; reply[9] = 2; reply.set([0, 0, 16, 0], 10);       // 512, 1048576
        for (let i = 0; i < 32; i++) reply[14 + i] = 0xcd;
      }
      if (reply) setTimeout(() => { const ev = { data: W.frame(msg.command, Array.from(reply)) };
        for (const f of listeners) f(ev); }, 2);
    } };
  return port;
}
function access(ports) {
  return { inputs: new Map(ports.map(p => [p.input.id, p.input])), outputs: new Map(ports.map(p => [p.output.id, p.output])), ports };
}
const rig = (...extra) => { const a4 = AUDIO4C.map(n => device(n)); return { a4, all: [...a4, ...extra] }; };
const quiet = ports => ports.every(p => p.sent.length === 0);
const FAST = { reconnect: 3000, settle: 20 };

/* ---- scenarios ---------------------------------------------------------------------------- */
async function scenario(label, fn) {
  try { await fn(); } catch (e) { check(false, label + ': no exception', e.stack); }
}

await scenario('A', async () => {
  const smk = device('SMK37 Open MIDI 1', 'SMK-37 Pro_8000001'), thru = device('Midi Through Port-0');
  const { a4, all } = rig(smk, thru);
  check(all.length === 12, 'A: 12 ports');
  const u = new W.Updater(access(all), PKG, () => {}, FAST);
  const r = await u.connect({ force: false });
  check(r.identity === 'SMK-37 Pro_8000001', 'A: normal update connects to the SMK-37', JSON.stringify(r));
  check(quiet(a4) && quiet([thru]), 'A: nothing sent to the 10 AUDIO4c ports or MIDI Through');
  check(smk.sent.length > 0, 'A: the SMK-37 port was queried');
  await u.disconnect();
});

await scenario('B', async () => {
  const smk = device('SMK37 Open MIDI 1', 'SMK-37 Pro_8000001'), thru = device('Midi Through Port-0');
  const { a4, all } = rig(smk, thru);
  const u = new W.Updater(access(all), PKG, () => {}, FAST);
  const r = await u.connect({ force: true });
  check(r.identity === 'SMK-37 Pro_8000001', 'B: force flash connects to the SMK-37');
  check(quiet(a4) && quiet([thru]), 'B: force flash sends nothing to the other 11 ports');
  await u.disconnect();
});

await scenario('C', async () => {
  const smk = device('SINCO-MIDI MIDI 1', 'SMK-37 Pro_016'), thru = device('Midi Through Port-0');
  const { a4, all } = rig(smk, thru);
  const u = new W.Updater(access(all), STOCK, () => {}, FAST);
  const r = await u.connect({ force: true });           // the page turns force on for V16
  check(r.identity === 'SMK-37 Pro_016' && r.legacy, 'C: factory V16 restore connects (legacy handshake)', JSON.stringify(r));
  check(quiet(a4) && quiet([thru]), 'C: V16 restore sends nothing to the other 11 ports');
  await u.disconnect();
});

await scenario('D', async () => {
  const smk = device('SMK37 Open MIDI 1', 'SMK-37 Pro_8000001'), loader = device('USB Composite Device MIDI 1', PKG.loaderIdentity, 'Jieli Technology');
  const { a4, all } = rig(smk, loader);
  const u = new W.Updater(access(all), PKG, () => {}, FAST);
  let error = null;
  try { await u.connect({ force: true }); } catch (e) { error = e; }
  check(error?.code === 'CHOOSE_PORT' && error.choices.length === 2, 'D: two answering devices -> CHOOSE_PORT with 2 choices', error?.message);
  check(quiet(a4), 'D: nothing sent to the AUDIO4c ports');
  const before = loader.sent.length;
  const r = await u.connect({ force: true, pick: smk.input.id });
  check(r.identity === 'SMK-37 Pro_8000001', 'D: the picked port connects');
  check(loader.sent.length === before && quiet(a4), 'D: after the pick, only the picked port is sent to');
  await u.disconnect();
});

await scenario('E', async () => {
  const odd = device('Some Other Name', 'SMK-37 Pro_8000001'), thru = device('Midi Through Port-0');
  const { a4, all } = rig(odd, thru);
  const u = new W.Updater(access(all), PKG, () => {}, FAST);
  let error = null;
  try { await u.connect({ force: true }); } catch (e) { error = e; }
  check(error?.code === 'CHOOSE_PORT' && error.choices.length === 12, 'E: no matching name -> CHOOSE_PORT listing all 12 inputs', error?.message);
  check(quiet(all), 'E: nothing sent to any of the 12 ports before the user picks');
  const r = await u.connect({ force: true, pick: odd.input.id });
  check(r.identity === 'SMK-37 Pro_8000001' && quiet(a4) && quiet([thru]), 'E: the picked port connects; the others stay untouched');
  await u.disconnect();
});

await scenario('F', async () => {
  const smk = device('SMK37 Open MIDI 1', 'SMK-37 Pro_8000001'), thru = device('Midi Through Port-0');
  const { a4, all } = rig(smk, thru);
  const acc = access(all);
  const u = new W.Updater(acc, PKG, () => {}, FAST);
  await u.connect({ force: true });
  await u.disconnect();
  // The device reboots into its loader: the old port goes, the loader's port appears.
  smk.connected = false;
  const loader = device('USB Composite Device MIDI 1', PKG.loaderIdentity, 'Jieli Technology');
  setTimeout(() => { acc.inputs.set(loader.input.id, loader.input); acc.outputs.set(loader.output.id, loader.output); }, 100);
  await u.waitFor(PKG.loaderIdentity, [], PKG.model);
  check(u.identity === PKG.loaderIdentity, 'F: waitFor finds the loader after re-enumeration');
  check(quiet(a4) && quiet([thru]), 'F: waiting for the loader sends nothing to the other ports');
  await u.disconnect();
});

await scenario('G', async () => {
  const smk = device('SMK37 Open MIDI 1', 'SMK-37 Pro_8000001'), fm1 = device('Felucca MIDI 1', 'FM-1_015');
  const { a4, all } = rig(smk, fm1);
  const u = new W.Updater(access(all), PKG, () => {}, FAST);
  const r = await u.connect({ force: true });
  check(r.identity === 'SMK-37 Pro_8000001' && quiet([fm1]) && quiet(a4), 'G: an FM-1 next to the SMK-37 is never sent to');
  await u.disconnect();
});

console.log((failed ? 'FAILED' : 'passed') + ': ' + passed + ' ok, ' + failed + ' failed (update-ports)');
process.exit(failed ? 1 : 0);
