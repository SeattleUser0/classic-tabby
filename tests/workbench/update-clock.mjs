// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/update-clock.mjs — an update is armed only when the device's update replies arrive
//
// Purpose
//   Measured on the device (BUILD.md 36.3): the SDK sends the last message written to the USB port only
//   when another write follows. With CLOCK on INT and SEQ OUT on, the MIDI clock is that write; with CLOCK
//   on MIDI or SEQ OUT off the update protocol's replies stay in the device. sdk/WebUpdate.js
//   (Updater.prepareReplies) checks this before it arms an update. The fake device here models exactly
//   that: a held SDK reply leaves when the next write follows; replies of the app leave by themselves on
//   firmware with the USB pusher (tabby-v04.3.1 and later). Scenarios:
//     A  CLOCK INT, SEQ OUT on: nothing is changed, the update runs
//     B  tabby-v04.4 (push hold), CLOCK MIDI: the hold is switched on, no setting changes, the update
//        runs, the hold is used again for the check after the restart and switched off
//     C  tabby-v04.4, CLOCK INT, SEQ OUT off: as B
//     D  tabby-v04.3.1 (remote keys, no hold), CLOCK MIDI: CLOCK is set to INT through SEQ and K1, the
//        update runs, CLOCK is set back to MIDI on the new firmware (remote op 9)
//     E  tabby-v04.3.1, CLOCK INT, SEQ OUT off: refused (REPLIES_HELD), nothing armed, no setting changed
//     F  tabby-v04.3.1, CLOCK MIDI and SEQ OUT off: CLOCK is set to INT, the replies are still held,
//        CLOCK is set back to MIDI, refused, nothing armed
//     G  tabby-v04.2 (remote keys, no pusher: a reply arrives only with the next write, so with the retry),
//        CLOCK MIDI: as D
//     G2 tabby-v04.1 (no remote control), CLOCK MIDI: refused, nothing armed
//     H  tabby-v04.3.1, CLOCK MIDI, the device rejects the package (command 50): CLOCK is set back
//
//   Run:  /usr/bin/node tests/workbench/update-clock.mjs   (part of make workbench-test)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-13  Initial version (Task 17).

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

const OLD = '71df5724063bc0cb'.padEnd(64, '0');
const NEW = 'b6e9590223446363dff53a2190bd80eb020233c63dd2d90cfa778e361ce0f708';
const PRODUCT = 'SMK-37 Pro_8000001';
const pkg = () => ({ model: 'pro', family: 8, build_id: NEW, kind: 'open', product: PRODUCT, display_version: 'tabby-v04.4',
  loaderIdentity: 'ota-FM-1_015', image: Uint8Array.from({ length: 4096 }, (_, i) => i & 255) });
const FAST = { reconnect: 3000, settle: 20, idle: 1500, writeIdle: 1500, flush: 10, save: 20 };
const WRITE = [240, 34, 36, 53, 127, 247];
const ascii27 = t => { const b = new Uint8Array(27); for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i); return b; };
const le = (n, k) => Array.from({ length: k }, (_, i) => (n >>> (8 * i)) & 255);
function capReply(build) {
  const d = new Uint8Array(47); d.set([70, 77, 67, 49], 0); d[4] = 1; d[5] = 8; d[7] = 1; d[9] = 2; d[12] = 16;
  for (let i = 0; i < 32; i++) d[14 + i] = parseInt(build.slice(i * 2, i * 2 + 2), 16);
  return d;
}

// The fake SMK-37. fw: 'v04.1' (no remote, no pusher), 'v04.2' (remote, no pusher), 'v04.3.1' (pusher, remote keys),
// 'v04.4' (push hold, op 9).
// After the update it runs v04.4 with the same settings. state: clock (0 INT, 1 MIDI), seqOut, page, hold.
function smk(fw, clock, seqOut, opts = {}) {
  const listeners = new Set();
  const d = { fw, clock, seqOut, page: 0, hold: false, loader: false, build: OLD, held: null, log: [], armed: 0, wrote: 0, keys: [], connected: true };
  const emit = bytes => setTimeout(() => { for (const f of listeners) f({ data: bytes }); }, 1);
  const flowing = () => d.loader || (d.clock === 0 && d.seqOut) || d.hold;
  const sdkWrite = bytes => { if (flowing()) { emit(bytes); return; } if (d.held) emit(d.held); d.held = bytes; };
  const appWrite = bytes => {
    if ((d.fw === 'v04.2' || d.fw === 'v04.1') && !flowing()) { sdkWrite(bytes); return; }   // no pusher: an app reply is held like any other
    if (d.held) { emit(d.held); d.held = null; }
    emit(bytes);
  };
  let lastToken = -1, lastReply = null;   // the firmware answers a repeated token from its cache and does not run the command again
  const reply = (cmd, token, code, payload = []) => { lastToken = token; lastReply = W.demoFrame(cmd | 64, token, [code, ...payload]); appWrite(lastReply); };
  const status = () => [1, d.page, 0, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, ...(d.fw === 'v04.4' ? [d.clock, d.hold ? 1 : 0] : [])];
  const app = m => {
    const p = Array.from(m.data);
    if (m.token === lastToken && lastReply) { appWrite(lastReply); return; }
    d.log.push('app' + m.command + (p.length ? ':' + p.join(',') : ''));
    if (m.command === 27) return reply(27, m.token, 0, [1, d.fw === 'v04.4' ? 15 : d.fw === 'v04.1' ? 3 : 7, 0, ...le(471040, 4), 0]);
    if (m.command === 0) return reply(0, m.token, 0, [4, 16, 0, ...le(4064, 2), d.clock, 0, 0, 0, 0, 0, 0, 0, 0]);
    if (m.command === 29 && d.fw !== 'v04.1') {
      if (!p.length || p[0] === 0) return reply(29, m.token, 0, status());
      if (p[0] === 6 && p.length === 4) {
        const [, kind, id, v] = p; d.keys.push([kind, id, v]);
        if (kind === 0 && id === 15 && v) d.page = 1;                    // SEQ: SYNC / MIDI
        if (kind === 0 && id === 2 && v) d.page = d.page === 0 ? 16 : 0; // HOME: the project list from the overview
        if (kind === 4 && id === 0 && d.page === 1) d.clock = v === 255 ? 0 : 1;
        return reply(29, m.token, 0, status());
      }
      if (p[0] === 8 && p.length === 2 && d.fw === 'v04.4') { d.hold = !!p[1]; return reply(29, m.token, 0, status()); }
      if (p[0] === 9 && p.length === 2 && d.fw === 'v04.4') { d.clock = p[1]; return reply(29, m.token, 0, status()); }
      return reply(29, m.token, 71);
    }
    reply(m.command, m.token, 71);
  };
  const st = () => d.connected ? 'connected' : 'disconnected';
  d.input = { id: 'in' + Math.random(), name: 'SMK37 Open MIDI 1', manufacturer: 'x', get state() { return st(); },
    async open() {}, async close() {}, addEventListener(_t, f) { listeners.add(f); }, removeEventListener(_t, f) { listeners.delete(f); } };
  d.output = { id: 'out' + Math.random(), name: 'SMK37 Open MIDI 1', manufacturer: 'x', get state() { return st(); },
    async open() {}, async close() {},
    send(bytes) {
      const a = Array.from(bytes);
      if (a.length === 6 && a.every((v, i) => v === WRITE[i])) {
        d.log.push('write'); d.armed++;
        // the first block request: an SDK write (held when nothing flows: the update would stall here)
        sdkWrite(W.frame(48, d.loader ? [2, ...le(0, 4), ...le(512, 3)] : [1, ...le(0, 4), ...le(512, 3)]));
        return;
      }
      const am = W.demoParse(Uint8Array.from(a));
      if (am) { if (!d.loader) app(am); return; }
      const m = W.parse(Uint8Array.from(a)); if (!m) return;
      d.log.push(m.command);
      if (m.command === 17) sdkWrite(W.frame(17, Array.from(ascii27(d.loader ? 'ota-SMK37' + NEW.slice(0, 16) : PRODUCT))));
      else if (m.command === 49 && !d.loader) sdkWrite(W.frame(49, Array.from(capReply(d.build))));
      else if (m.command === 50) sdkWrite(W.frame(50, [opts.reject ? 1 : 0]));
      else if (m.command === 48) {
        const success = String.fromCharCode(...m.data.slice(8, 15)) === 'success';
        if (!success && m.data.length > 8) { d.wrote += m.data.length - 8; sdkWrite(W.frame(48, [3, ...le(d.loader ? 0xf0000000 : 0xe0000000, 4), ...le(8, 3)])); }
        else if (success) {
          if (!d.loader) setTimeout(() => { d.loader = true; d.held = null; d.hold = false; }, 5);          // restart into the loader
          else setTimeout(() => { d.loader = false; d.fw = 'v04.4'; d.build = NEW; d.page = 0; d.hold = false; d.held = null; }, 5);   // the new firmware, settings kept
        }
      }
    } };
  return d;
}
const access = dev => ({ inputs: new Map([[dev.input.id, dev.input]]), outputs: new Map([[dev.output.id, dev.output]]) });
async function run(dev) {
  const notes = [];
  const u = new W.Updater(access(dev), pkg(), (text) => { notes.push(text); }, FAST);
  let error = null;
  try { await u.connect({}); await u.install({}); } catch (e) { error = e; }
  return { u, error, last: notes[notes.length - 1], notes };
}
const keysText = dev => dev.keys.map(k => k.join('/')).join(' ');

{ const dev = smk('v04.3.1', 0, true); const r = await run(dev);
  check(!r.error && dev.build === NEW && dev.keys.length === 0 && !dev.log.some(x => String(x).startsWith('app29')), 'A: CLOCK INT, SEQ OUT on: updated, no key sent, no remote command', r.error?.message + ' ' + dev.log.join(' '));
  check(r.last === 'Update complete.', 'A: status "Update complete."', r.last); }

{ const dev = smk('v04.4', 1, true); const r = await run(dev);
  check(!r.error && dev.build === NEW, 'B: tabby-v04.4, CLOCK MIDI: updated', r.error?.message + ' ' + dev.log.join(' '));
  check(dev.keys.length === 0 && dev.clock === 1 && !dev.log.includes('app29:9,1'), 'B: no panel key, CLOCK never changed', keysText(dev));
  check(dev.log.filter(x => x === 'app29:8,1').length === 2 && dev.log.indexOf('app29:8,1') < dev.log.indexOf(50) && dev.log[dev.log.length - 1] === 'app29:8,0' && dev.hold === false,
    'B: the push hold is switched on before command 50, on again after the restart, and off at the end', dev.log.join(' '));
  check(r.last === 'Update complete.', 'B: status', r.last); }

{ const dev = smk('v04.4', 0, false); const r = await run(dev);
  check(!r.error && dev.build === NEW && dev.keys.length === 0 && dev.clock === 0 && dev.hold === false, 'C: tabby-v04.4, SEQ OUT off: updated with the push hold, nothing changed', r.error?.message + ' ' + dev.log.join(' ')); }

{ const dev = smk('v04.3.1', 1, true); const r = await run(dev);
  check(!r.error && dev.build === NEW, 'D: tabby-v04.3.1, CLOCK MIDI: updated', r.error?.message + ' ' + dev.log.join(' '));
  check(keysText(dev) === '0/15/1 0/15/0 4/0/255 0/2/1 0/2/0', 'D: SEQ, K1 one detent down, HOME', keysText(dev));
  const k1 = dev.log.indexOf('app29:6,4,0,255');
  check(k1 > 0 && k1 < dev.log.indexOf(50) && dev.log.indexOf(50) < dev.log.indexOf('write'), 'D: CLOCK was INT before command 50 and before anything was armed');
  check(dev.clock === 1 && dev.log.includes('app29:9,1') && r.last === 'Update complete. CLOCK is back on MIDI.', 'D: CLOCK is back on MIDI on the new firmware (remote op 9)', r.last + ' clock ' + dev.clock); }

{ const dev = smk('v04.3.1', 0, false); const r = await run(dev);
  check(r.error?.code === 'REPLIES_HELD' && /SEQ OUT/.test(r.error.message) && dev.armed === 0 && !dev.log.includes(50) && dev.keys.length === 0 && dev.build === OLD,
    'E: tabby-v04.3.1, SEQ OUT off: refused with the reason, nothing armed, no key sent', r.error?.message + ' ' + dev.log.join(' ')); }

{ const dev = smk('v04.3.1', 1, false); const r = await run(dev);
  check(r.error?.code === 'REPLIES_HELD' && /SEQ OUT/.test(r.error.message) && dev.armed === 0 && !dev.log.includes(50) && dev.build === OLD, 'F: tabby-v04.3.1, CLOCK MIDI and SEQ OUT off: refused, nothing armed', r.error?.message);
  check(dev.clock === 1 && dev.page === 0 && !/still on INT/.test(r.error?.message || ''), 'F: CLOCK was set back to MIDI and the page left', keysText(dev) + ' | ' + r.error?.message); }

{ const dev = smk('v04.2', 1, true); const r = await run(dev);
  check(!r.error && dev.build === NEW && dev.clock === 1 && keysText(dev) === '0/15/1 0/15/0 4/0/255 0/2/1 0/2/0' && r.last === 'Update complete. CLOCK is back on MIDI.',
    'G: tabby-v04.2 (no pusher: every reply arrives with the retry), CLOCK MIDI: CLOCK to INT, updated, CLOCK back on MIDI', r.error?.message + ' ' + keysText(dev) + ' ' + r.last); }

{ const dev = smk('v04.1', 1, true); const r = await run(dev);
  check(r.error?.code === 'REPLIES_HELD' && /too old/.test(r.error.message) && dev.armed === 0 && !dev.log.includes(50) && dev.keys.length === 0 && dev.build === OLD,
    'G2: tabby-v04.1 (no remote control), CLOCK MIDI: refused with the reason, nothing armed', r.error?.code + ' ' + r.error?.message + ' ' + dev.log.join(' ')); }

{ const dev = smk('v04.3.1', 1, true, { reject: true }); const r = await run(dev);
  check(r.error && /rejected/.test(r.error.message) && dev.armed === 0 && dev.build === OLD, 'H: the device rejects the package: not armed', r.error?.message);
  check(dev.clock === 1 && !/still on INT/.test(r.error?.message || ''), 'H: CLOCK was set back to MIDI', keysText(dev) + ' | ' + r.error?.message); }

console.log(failed ? failed + ' check(s) FAILED' : 'all ' + passed + ' checks passed');
process.exit(failed ? 1 : 0);
