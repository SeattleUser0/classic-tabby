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
//
//   Task 11C (v0.2): port names as macOS CoreMIDI and Linux ALSA report them. On the MacBook the
//   SMK-37 enumerated as "SMK37 Open" followed by 3 or 4 spaces (the USB string descriptor is
//   space padded; the input and output endpoints need not carry the same padding), and the
//   page then connected to nothing without saying why. Names are now normalized (Unicode NFKC,
//   control characters and NUL padding to spaces, runs of white space to one space, trimmed,
//   lower case) before they are matched or an input is paired with its output.
//     H  macOS Open firmware: input/output "SMK37 Open" + 3 / 4 spaces       -> connects
//     I  Linux and mixed case: "smk37 OPEN midi 1 ", NUL padding, NBSP       -> connects
//     J  macOS loader "USB Composite Device" + spaces, Jieli                  -> loader (resume)
//     K  factory V16 names, macOS ("SINCO-MIDI  ", "USB MIDI   ") and Linux   -> legacy connects
//     L  the project library (pairs, not loader) on the macOS and Linux names -> one pair each
//     M  no match at all: CHOOSE_PORT lists every input; a picked input whose
//        output has a different name fails with a message, never silently
//     N  waitFor timeout: the error carries code NO_DEVICE and the port list
//     O  the project library with no matching port: code NO_PORT and the port list
//
//   Run:  /usr/bin/node tests/workbench/update-ports.mjs   (part of make workbench-test)
//
// Version: 0.2
//
// Revision log
//   v0.2  2026-11-08  Task 11C: scenarios H..O (macOS / Linux port names, trailing spaces,
//                     mixed case, no silent failure); device() takes a separate output name.
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
/* outName (Task 11C): the output endpoint's name when it differs from the input's (CoreMIDI may
   pad the two endpoints differently). */
function device(name, identity = null, manufacturer = 'x', outName = name) {
  const id = 'p' + nextId++;
  const listeners = new Set();
  const port = { name, identity, sent: [], connected: true };
  const state = () => port.connected ? 'connected' : 'disconnected';
  port.input = { id, name, manufacturer, get state() { return state(); }, async open() {}, async close() {},
    addEventListener(_t, f) { listeners.add(f); }, removeEventListener(_t, f) { listeners.delete(f); } };
  port.output = { id: 'o' + id, name: outName, manufacturer, get state() { return state(); }, async open() {}, async close() {},
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

/* ---- Task 11C: macOS / Linux names ------------------------------------------------------- */
const SP3 = '   ', SP4 = '    ';
await scenario('H', async () => {
  const smk = device('SMK37 Open' + SP3, 'SMK-37 Pro_8000001', 'Jieli Technology', 'SMK37 Open' + SP4);
  const { a4, all } = rig(smk, device('IAC Driver Bus 1'));
  const u = new W.Updater(access(all), PKG, () => {}, FAST);
  const r = await u.connect({ force: false });
  check(r.identity === 'SMK-37 Pro_8000001', 'H: macOS "SMK37 Open" + 3/4 trailing spaces connects', JSON.stringify(r));
  check(quiet(a4), 'H: nothing sent to the AUDIO4c ports');
  await u.disconnect();
  const same = device('SMK37 Open' + SP4, 'SMK-37 Pro_8000001', 'Jieli Technology');
  const u2 = new W.Updater(access(rig(same, device('Network Session 1')).all), PKG, () => {}, FAST);
  check((await u2.connect({ force: false })).identity === 'SMK-37 Pro_8000001', 'H: macOS "SMK37 Open" + 4 spaces on both endpoints connects');
  await u2.disconnect();
});

await scenario('I', async () => {
  for (const [label, inName, outName] of [
    ['Linux mixed case + trailing space', 'smk37 OPEN midi 1 ', 'SMK37 Open MIDI 1'],
    ['NUL padding', 'SMK37 Open\0\0\0', 'SMK37 Open'],
    ['no-break space and tab', 'SMK37 Open\t', 'SMK37 Open'],
    ['upper case', 'SMK37 OPEN', 'smk37 open  ']]) {
    const smk = device(inName, 'SMK-37 Pro_8000001', 'x', outName);
    const { a4, all } = rig(smk, device('Midi Through Port-0'));
    const u = new W.Updater(access(all), PKG, () => {}, FAST);
    let r = null; try { r = await u.connect({ force: false }); } catch (e) { r = { error: e.message }; }
    check(r?.identity === 'SMK-37 Pro_8000001' && quiet(a4), 'I: ' + label + ' connects', JSON.stringify(r));
    await u.disconnect();
  }
});

await scenario('J', async () => {
  for (const [label, inName, outName] of [
    ['macOS', 'USB Composite Device' + SP3, 'USB Composite Device' + SP4],
    ['Linux', 'USB Composite Device MIDI 1', 'USB Composite Device MIDI 1'],
    ['mixed case', 'usb composite DEVICE ', 'USB Composite Device']]) {
    const loader = device(inName, PKG.loaderIdentity, 'Jieli Technology', outName);
    const { a4, all } = rig(loader, device('Midi Through Port-0'));
    const u = new W.Updater(access(all), PKG, () => {}, FAST);
    let r = null; try { r = await u.connect({ force: false }); } catch (e) { r = { error: e.message }; }
    check(r?.resume === true && r.identity === PKG.loaderIdentity && quiet(a4), 'J: loader, ' + label + ' -> resume', JSON.stringify(r));
    await u.disconnect();
  }
});

await scenario('K', async () => {
  for (const [label, inName, outName] of [
    ['macOS SINCO-MIDI', 'SINCO-MIDI  ', 'SINCO-MIDI   '],
    ['macOS USB MIDI', 'USB MIDI' + SP3, 'USB MIDI' + SP4],
    ['Linux SINCO-MIDI', 'SINCO-MIDI MIDI 1', 'SINCO-MIDI MIDI 1'],
    ['Linux USB MIDI', 'USB MIDI MIDI 1', 'USB MIDI MIDI 1'],
    ['macOS SMK-37 Pro', 'SMK-37 Pro' + SP3, 'SMK-37 Pro' + SP4]]) {
    const smk = device(inName, 'SMK-37 Pro_016', 'x', outName);
    const { a4, all } = rig(smk, device('Midi Through Port-0'));
    const u = new W.Updater(access(all), STOCK, () => {}, FAST);
    let r = null; try { r = await u.connect({ force: true }); } catch (e) { r = { error: e.message }; }
    check(r?.legacy && r.identity === 'SMK-37 Pro_016' && quiet(a4), 'K: factory V16, ' + label + ' -> legacy', JSON.stringify(r));
    await u.disconnect();
  }
});

await scenario('L', async () => {
  for (const [inName, outName] of [['SMK37 Open' + SP3, 'SMK37 Open' + SP4], ['SMK37 Open MIDI 1', 'SMK37 Open MIDI 1'],
    ['smk37 open midi 1  ', 'SMK37 Open MIDI 1'], ['USB MIDI' + SP3, 'USB MIDI' + SP4], ['SINCO-MIDI MIDI 1 ', 'SINCO-MIDI MIDI 1']]) {
    const smk = device(inName, 'SMK-37 Pro_8000001', 'x', outName);
    const found = W.pairs(access(rig(smk, device('Midi Through Port-0')).all));
    check(found.length === 1 && found[0].input === smk.input && found[0].output === smk.output,
      'L: project library pairs ' + JSON.stringify(inName) + ' with ' + JSON.stringify(outName), found.length);
  }
});

await scenario('M', async () => {
  const odd = device('Keyboard', 'SMK-37 Pro_8000001', 'x', 'Keyboard Out');
  const { a4, all } = rig(odd, device('Midi Through Port-0'));
  const u = new W.Updater(access(all), PKG, () => {}, FAST);
  let error = null;
  try { await u.connect({ force: false }); } catch (e) { error = e; }
  check(error?.code === 'CHOOSE_PORT' && error.choices.length === 12 && error.message.length > 0,
    'M: no match -> CHOOSE_PORT with a message and all 12 inputs', error?.message);
  check(u.diagnostics?.inputs?.length === 12 && u.diagnostics?.outputs?.length === 12, 'M: diagnostics list every input and output');
  error = null;
  try { await u.connect({ force: false, pick: odd.input.id }); } catch (e) { error = e; }
  check(error?.code === 'CHOOSE_PORT' && /output/.test(error.message) && error.choices.length === 12,
    'M: picked input with no same-name output -> CHOOSE_PORT naming the output problem', error?.code + ' ' + error?.message);
  check(quiet(all), 'M: nothing sent to any port');
});

await scenario('N', async () => {
  const { a4, all } = rig(device('Midi Through Port-0'), device('IAC Driver Bus 1'));
  const u = new W.Updater(access(all), PKG, () => {}, { reconnect: 200, settle: 20 });
  let error = null;
  try { await u.waitFor(PKG.loaderIdentity, [], PKG.model); } catch (e) { error = e; }
  check(error?.code === 'NO_DEVICE' && error.ports?.inputs?.length === 12 && u.diagnostics?.inputs?.length === 12,
    'N: waitFor timeout -> NO_DEVICE with the 12 ports listed', error?.code + ' ' + JSON.stringify(error?.ports));
  check(quiet(all), 'N: nothing sent while waiting');
});

await scenario('O', async () => {
  const { a4, all } = rig(device('Midi Through Port-0'), device('IAC Driver Bus 1'));
  const lib = new W.Library(access(all));
  let error = null;
  try { await lib.connect({}); } catch (e) { error = e; }
  check(error?.code === 'NO_PORT' && error.ports?.inputs?.length === 12 && error.message.length > 0,
    'O: project library with no matching port -> NO_PORT with a message and the port list', error?.code + ' ' + error?.message);
  check(quiet(all), 'O: nothing sent');
});

console.log((failed ? 'FAILED' : 'passed') + ': ' + passed + ' ok, ' + failed + ' failed (update-ports)');
process.exit(failed ? 1 : 0);
