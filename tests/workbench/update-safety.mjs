// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/update-safety.mjs — no force flash after a timeout; the zero-tag loader resumes
//
// Purpose
//   The 2026-11-09 install (BUILD.md 26.8): the capability query timed out on an Open identity, the
//   page offered "Enable force flash and reconnect", the forced write skipped command 50, and the
//   loader came up as ota-SMK37 + 16 zeros, which the page then refused. sdk/WebUpdate.js and
//   sdk/Update.html.in now (1) retry the queries and, without force ticked by hand, end a
//   capability timeout with code NO_REPLY ("did not answer; power-cycle"), never migration; and
//   (2) put a zero-tag loader into the model-confirmed resume. Scenarios, on sdk/WebUpdate.js:
//     X  zero tag: Connect -> resume / modelUnverified, only the identity query sent; Start update
//        refused without the model confirmation and for Elite; with "pro" the image is written
//        without command 50 and the build id is checked after the restart (pass and fail)
//     X2 a nonzero tag that is not this build is still LOADER_MISMATCH; this build's tag resumes
//     Y  capability never answers on an Open identity: 4 queries, NO_REPLY, mode not migration or
//        legacy, nothing written; one timeout then a reply connects; force ticked by hand keeps the
//        legacy path; a factory V16 identity still gets migration (force stays a manual choice);
//        the identity query is tried 4 times when a port opens
//     Y2 waitFor takes the zero tag while waiting for a loader, never for the firmware
//     Z  sdk/Update.html.in (static): the force button is gone from the page (Task 14; it was hidden
//        with no click handler before),
//        an error never sets forceSuggested, Connect and Start update read the checkbox (the only
//        way to turn force on), and the migration text points to the section, not a button;
//        the migration messages are English and say "by hand" (Task 14: no translation table any more)
//
//   Run:  /usr/bin/node tests/workbench/update-safety.mjs   (part of make workbench-test)
//
// Version: 0.2
//
// Revision log
//   v0.2  2026-11-10  Task 14: Z expects no force button element at all (the page dropped it).
//   v0.1  2026-11-09  Initial version (Task 12, the 2026-11-09 install incident).

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
async function scenario(label, fn) { try { await fn(); } catch (e) { check(false, label + ': no exception', e.stack); } }

const OWN = 'b6e9590223446363dff53a2190bd80eb020233c63dd2d90cfa778e361ce0f708';
const OTHER = '8b7dff801f1b08768bb95855ed11b92e894a65cd284caff07bbf204da06f9449';
const ZERO = 'ota-SMK37' + '0'.repeat(16);
const PRODUCT = 'SMK-37 Pro_8000001';
const pkg = () => ({ model: 'pro', family: 8, build_id: OWN, kind: 'open', product: PRODUCT, display_version: 'tabby-v04.1',
  loaderIdentity: 'ota-FM-1_015', image: Uint8Array.from({ length: 4096 }, (_, i) => i & 255) });
const INDEX = { schema: 1, builds: [{ tag: 'tabby-v03.3-diag-r2', build: OTHER, loader: 'ota-SMK37' + OTHER.slice(0, 16), page: 'builds/tabby-v03.3-diag-r2/' }] };
const lookup = W.buildsLookupFromIndex(INDEX, 'https://seattleuser0.github.io/classic-tabby/builds/index.json');
const FAST = { reconnect: 3000, settle: 20, idle: 2000, writeIdle: 2000 };
const WRITE = [240, 34, 36, 53, 127, 247];
const ascii27 = t => { const b = new Uint8Array(27); for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i); return b; };
const le = (n, k) => Array.from({ length: k }, (_, i) => (n >>> (8 * i)) & 255);
function capReply(build, family = 8) {
  const d = new Uint8Array(47); d.set([70, 77, 67, 49], 0); d[4] = 1; d[5] = family; d[7] = 1; d[9] = 2; d[12] = 16;
  for (let i = 0; i < 32; i++) d[14 + i] = parseInt(build.slice(i * 2, i * 2 + 2), 16);
  return d;
}

// One fake SMK-37 port pair. opts.cap49 (null: never answers), opts.capTimeouts (first N 49s unanswered),
// opts.idTimeouts (first N 17s unanswered), opts.loader (serve one block, finish, come back as PRODUCT/afterBuild).
function smk(identity, opts = {}) {
  const listeners = new Set();
  const port = { identity, commands: [], wrote: 0, capSeen: 0, idSeen: 0, connected: true };
  const emit = bytes => setTimeout(() => { for (const f of listeners) f({ data: bytes }); }, 2);
  const st = () => port.connected ? 'connected' : 'disconnected';
  port.input = { id: 'in' + Math.random(), name: 'USB Composite Device', manufacturer: 'Jieli Technology', get state() { return st(); },
    async open() {}, async close() {}, addEventListener(_t, f) { listeners.add(f); }, removeEventListener(_t, f) { listeners.delete(f); } };
  port.output = { id: 'out' + Math.random(), name: 'USB Composite Device', manufacturer: 'Jieli Technology', get state() { return st(); },
    async open() {}, async close() {},
    send(bytes) {
      const a = Array.from(bytes);
      if (a.length === 6 && a.every((v, i) => v === WRITE[i])) { port.commands.push('write'); if (opts.loader) emit(W.frame(48, [1, ...le(0, 4), ...le(512, 3)])); return; }
      const m = W.parse(Uint8Array.from(a)); if (!m) return;
      port.commands.push(m.command);
      if (m.command === 17) { port.idSeen++; if (port.idSeen > (opts.idTimeouts || 0)) emit(W.frame(17, Array.from(ascii27(port.identity)))); }
      else if (m.command === 49) { port.capSeen++; if (opts.cap49 && port.capSeen > (opts.capTimeouts || 0)) emit(W.frame(49, Array.from(opts.cap49))); }
      else if (m.command === 50) emit(W.frame(50, [0]));
      else if (m.command === 48 && opts.loader) {
        const success = String.fromCharCode(...m.data.slice(8, 15)) === 'success';
        if (!success && m.data.length > 8) { port.wrote += m.data.length - 8; emit(W.frame(48, [2, ...le(0xf0000000, 4), ...le(8, 3)])); }
        else if (success && !port.finished) {
          port.finished = true;
          setTimeout(() => { port.identity = PRODUCT; opts.cap49 = capReply(opts.afterBuild); opts.capTimeouts = 0; port.capSeen = 0; }, 30);
        }
      }
    } };
  return port;
}
const access = ports => ({ inputs: new Map(ports.map(p => [p.input.id, p.input])), outputs: new Map(ports.map(p => [p.output.id, p.output])) });
const writes = p => p.commands.filter(c => c !== 17);

await scenario('X', async () => {
  for (const [afterBuild, ok] of [[OWN, true], [OTHER, false]]) {
    const dev = smk(ZERO, { loader: true, afterBuild });
    const u = new W.Updater(access([dev]), pkg(), () => {}, FAST, { builds: lookup });
    const r = await u.connect({ force: false });
    check(r.resume === true && r.modelUnverified === true && u.mode === 'loader', 'X: the zero tag connects into the model-confirmed resume', JSON.stringify(r));
    check(writes(dev).length === 0, 'X: Connect sent only the identity query');
    if (ok) {
      let e = null; try { await u.install({ force: false }); } catch (x) { e = x; }
      check(e && writes(dev).length === 0, 'X: no model confirmation -> refused, nothing written', e?.message);
      e = null; try { await u.install({ force: false, confirmedModel: 'elite' }); } catch (x) { e = x; }
      check(e && writes(dev).length === 0, 'X: an Elite confirmation is refused for the Pro package', e?.message);
      await u.connect({ force: false });
    }
    let e = null; try { await u.install({ force: false, confirmedModel: 'pro' }); } catch (x) { e = x; }
    check(dev.commands.includes('write') && !dev.commands.includes(50) && dev.wrote === 512, 'X: "pro" confirmed -> written without command 50', JSON.stringify(writes(dev)));
    check(ok ? e === null : /Firmware verification failed after restart/.test(e?.message || ''),
      ok ? 'X: the restart check passes for this build' : 'X: the restart check fails for another build id', e?.message);
  }
});

await scenario('X2', async () => {
  for (const tag of [OTHER.slice(0, 16), 'fedcba9876543210', '0000000000000001']) {
    const dev = smk('ota-SMK37' + tag);
    const u = new W.Updater(access([dev]), pkg(), () => {}, FAST, { builds: lookup });
    let e = null; try { await u.connect({ force: true }); } catch (x) { e = x; }
    check(e?.code === 'LOADER_MISMATCH' && writes(dev).length === 0, 'X2: tag ' + tag + ' is still refused (force asked too)', e?.code);
  }
  const dev = smk('ota-SMK37' + OWN.slice(0, 16));
  const u = new W.Updater(access([dev]), pkg(), () => {}, FAST, { builds: lookup });
  check((await u.connect({})).resume === true, 'X2: this build\'s own tag still resumes');
});

await scenario('Y', async () => {
  let dev = smk(PRODUCT, { cap49: null });
  let u = new W.Updater(access([dev]), pkg(), () => {}, FAST);
  let e = null; try { await u.connect({ force: false }); } catch (x) { e = x; }
  check(e?.code === 'NO_REPLY' && dev.capSeen === 4 && u.mode !== 'migration' && u.mode !== 'legacy' && writes(dev).every(c => c === 49),
    'Y: capability never answers -> 4 queries, NO_REPLY, no migration, nothing written', `${e?.code} ${dev.capSeen} ${u.mode}`);
  check(/did not answer/.test(e?.message || '') && /Power-cycle/.test(e?.message || '') && !/force/i.test(e?.message || ''), 'Y: the message says to power-cycle and does not mention force', e?.message);

  dev = smk(PRODUCT, { cap49: capReply(OTHER), capTimeouts: 2 });
  u = new W.Updater(access([dev]), pkg(), () => {}, FAST);
  const r = await u.connect({ force: false });
  check(u.mode === 'tagged' && dev.capSeen === 3 && r.current === OTHER, 'Y: two timeouts then a reply -> a normal tagged connection', `${u.mode} ${dev.capSeen}`);

  dev = smk(PRODUCT, { cap49: null });
  u = new W.Updater(access([dev]), pkg(), () => {}, FAST);
  const rf = await u.connect({ force: true });
  check(rf.legacy === true && u.mode === 'legacy' && dev.capSeen === 4, 'Y: force ticked by hand beforehand keeps the legacy path (after the 4 tries)', JSON.stringify(rf));

  dev = smk('SMK-37 Pro_016');
  u = new W.Updater(access([dev]), pkg(), () => {}, FAST);
  const rs = await u.connect({ force: false });
  check(rs.migration === true && u.mode === 'migration' && writes(dev).length === 0, 'Y: a factory V16 identity still reports migration (force stays manual)', JSON.stringify(rs));

  dev = smk(PRODUCT, { cap49: capReply(OTHER), idTimeouts: 3 });
  u = new W.Updater(access([dev]), pkg(), () => {}, FAST);
  await u.connect({ force: false });
  check(u.mode === 'tagged' && dev.idSeen === 4, 'Y: three unanswered identity queries, the fourth answered -> connected', `${u.mode} ${dev.idSeen}`);
});

await scenario('Y2', async () => {
  const dev = smk(ZERO);
  const u = new W.Updater(access([dev]), pkg(), () => {}, FAST, { builds: lookup });
  await u.waitFor('ota-FM-1_015', [], 'pro');
  check(u.identity === ZERO, 'Y2: waiting for a loader takes the zero tag');
  await u.disconnect();
  const u2 = new W.Updater(access([dev]), pkg(), () => {}, { reconnect: 300, settle: 20 }, { builds: lookup });
  let e = null; try { await u2.waitFor(PRODUCT); } catch (x) { e = x; }
  check(e?.code === 'NO_DEVICE', 'Y2: waiting for the firmware, the zero tag is not taken (timeout, not a mismatch)', e?.code);
});

await scenario('Z', async () => {
  const page = readFileSync(join(root, 'sdk/Update.html.in'), 'utf8');
  check(!page.includes('id="force-activate"') && !/\$\('force-activate'\)/.test(page), 'Z: the force button is gone: no element and no handler');
  check(!/setForceMode\(true/.test(page), 'Z: nothing calls setForceMode(true, ...)');
  check(!/forceSuggested=error/.test(page) && /forceSuggested=false;\s*\/\* Task 12/.test(page), 'Z: an error never sets forceSuggested');
  const sets = [...page.matchAll(/\$\('force-update'\)\.checked=([^;]+);/g)].map(m => m[1]);
  check(sets.every(v => ['value', 'stock'].includes(v)), 'Z: the checkbox is set only by setForceMode (its own change event) and by the factory-restore choice', JSON.stringify(sets));
  check(!/click Enable force flash and reconnect/i.test(page) && page.includes('tick Force flash by hand'),
    'Z: the migration texts point to the checkbox in the section, not to a button');
  for (const k of ['Device and current firmware recognized (not Open firmware). To migrate, open Migration, factory restore and forced updates, tick Force flash by hand',
    'Different firmware detected. To migrate, tick Force flash by hand under Migration, factory restore and forced updates.'])
    check(page.includes(k) || readFileSync(join(root, 'sdk/WebUpdate.js'), 'utf8').includes(k), 'Z: English, by hand: ' + k.slice(0, 50));
});

console.log(`\nupdate-safety: ${passed} ok, ${failed} failed`);
process.exit(failed ? 1 : 0);
