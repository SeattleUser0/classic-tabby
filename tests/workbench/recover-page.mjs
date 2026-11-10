// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/recover-page.mjs — the tabby-v04.0 recovery page (tools/linux/recover-page.py)
//
// Purpose
//   The recovery page (builds/tabby-v04.0-recover/) carries the published tabby-v04.0 package and
//   a patched copy of sdk/WebUpdate.js. This test runs that patched copy (made by
//   `recover-page.py webupdate`, the same text the build step puts in the page) on fake Web MIDI:
//     A  a loader named ota-SMK37 + 16 zeros -> the model-confirmed resume: Connect returns
//        resume / modelUnverified; Start update without the model confirmation is refused; with
//        "pro" confirmed the write runs (no command 50), and the build id check after the
//        restart passes for the right build and fails for another
//     B  a nonzero tag that is not this build -> still LOADER_MISMATCH (known and unknown tags,
//        with and without force), only the identity query sent
//     C  force flash is never on: connect({force:true}) leaves force false; a capability timeout
//        is retried (4 queries) and ends in an error that says not to force, never migration or
//        legacy; one timeout then a reply connects normally; a factory V16 identity is refused
//     D  waitFor accepts the zero-tag loader while waiting for a loader and never refuses it
//     E  the built page (build/recover/SMK37-Open-Source.html, when it exists): it carries the
//        patched WebUpdate.js verbatim, the published FM1_PACKAGE, and no path that sets force
//
//   Run:  /usr/bin/node tests/workbench/recover-page.mjs   (part of make workbench-test)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-09  Initial version (the 2026-11-09 install incident).

import { readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tmp = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'recover-page-'));
const patchedPath = join(tmp, 'WebUpdate.js');
execFileSync('python3', ['-I', join(root, 'tools/linux/recover-page.py'), 'webupdate', '--out', patchedPath]);
const patched = readFileSync(patchedPath, 'utf8');
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node' }, configurable: true });
globalThis.window = globalThis;
globalThis.document = { addEventListener() {}, querySelector() { return null; }, getElementById() { return null; } };
globalThis.location = { search: '' };
(0, eval)(patched);
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
const pkg = () => ({ model: 'pro', family: 8, build_id: OWN, kind: 'open', product: PRODUCT, display_version: 'tabby-v04.0',
  loaderIdentity: 'ota-FM-1_015', image: Uint8Array.from({ length: 4096 }, (_, i) => i & 255) });
const INDEX_URL = 'https://seattleuser0.github.io/classic-tabby/builds/index.json';
const INDEX = { schema: 1, builds: [
  { tag: 'tabby-v03.3-diag-r2', build: OTHER, loader: 'ota-SMK37' + OTHER.slice(0, 16), page: 'builds/tabby-v03.3-diag-r2/' },
  { tag: 'tabby-v04.0', build: OWN, loader: 'ota-SMK37' + OWN.slice(0, 16), page: 'builds/tabby-v04.0/' } ] };
const lookup = W.buildsLookupFromIndex(INDEX, INDEX_URL);
const FAST = { reconnect: 3000, settle: 20, idle: 2000, writeIdle: 2000 };
const WRITE = [240, 34, 36, 53, 127, 247];

const ascii27 = t => { const b = new Uint8Array(27); for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i); return b; };
function capReply(build, family = 8) {
  const d = new Uint8Array(47); d.set([70, 77, 67, 49], 0); d[4] = 1; d[5] = family; d[6] = 0; d[7] = 1;
  d[8] = 0; d[9] = 2; d[10] = 0; d[11] = 0; d[12] = 16; d[13] = 0;
  for (let i = 0; i < 32; i++) d[14 + i] = parseInt(build.slice(i * 2, i * 2 + 2), 16);
  return d;
}
const le = (n, k) => Array.from({ length: k }, (_, i) => (n >>> (8 * i)) & 255);

// A fake SMK-37 on one port pair. opts: cap49 (null = never answers), capTimeouts (first N 49s unanswered),
// loader: on the write trigger, request one block, then finish, then come back as PRODUCT with afterBuild.
function smk(identity, opts = {}) {
  const listeners = new Set();
  const port = { identity, sent: [], connected: true, commands: [], wrote: 0, capSeen: 0 };
  const emit = bytes => setTimeout(() => { for (const f of listeners) f({ data: bytes }); }, 2);
  const st = () => port.connected ? 'connected' : 'disconnected';
  port.input = { id: 'in' + Math.random(), name: 'USB Composite Device', manufacturer: 'Jieli Technology', get state() { return st(); },
    async open() {}, async close() {}, addEventListener(_t, f) { listeners.add(f); }, removeEventListener(_t, f) { listeners.delete(f); } };
  port.output = { id: 'out' + Math.random(), name: 'USB Composite Device', manufacturer: 'Jieli Technology', get state() { return st(); },
    async open() {}, async close() {},
    send(bytes) {
      const a = Array.from(bytes); port.sent.push(a);
      if (a.length === 6 && a.every((v, i) => v === WRITE[i])) {
        port.commands.push('write');
        if (opts.loader) emit(W.frame(48, [1, ...le(0, 4), ...le(512, 3)]));
        return;
      }
      const m = W.parse(Uint8Array.from(a)); if (!m) return;
      port.commands.push(m.command);
      if (m.command === 17) emit(W.frame(17, Array.from(ascii27(port.identity))));
      else if (m.command === 49) {
        port.capSeen++;
        if (opts.cap49 && port.capSeen > (opts.capTimeouts || 0)) emit(W.frame(49, Array.from(opts.cap49)));
      } else if (m.command === 48 && opts.loader) {
        const success = String.fromCharCode(...m.data.slice(8, 15)) === 'success';
        if (!success && m.data.length > 8) { port.wrote += m.data.length - 8; emit(W.frame(48, [2, ...le(0xf0000000, 4), ...le(8, 3)])); }
        else if (success && !port.finished) {          // the page's "success" answer to the finish request
          port.finished = true;
          setTimeout(() => { port.identity = PRODUCT; opts.cap49 = capReply(opts.afterBuild); opts.capTimeouts = 0; port.capSeen = 0; }, 30);
        }
      }
    } };
  return port;
}
const access = ports => ({ inputs: new Map(ports.map(p => [p.input.id, p.input])), outputs: new Map(ports.map(p => [p.output.id, p.output])) });
const cmds = p => p.commands.filter(c => c !== 17);

await scenario('A', async () => {
  for (const [afterBuild, ok] of [[OWN, true], [OTHER, false]]) {
    const dev = smk(ZERO, { loader: true, afterBuild });
    const u = new W.Updater(access([dev]), pkg(), () => {}, FAST, { builds: lookup });
    const r = await u.connect({ force: false });
    check(r.resume === true && r.modelUnverified === true && r.identity === ZERO && u.mode === 'loader',
      'A: the zero tag connects as an unidentified loader (model-confirmed resume)', JSON.stringify(r));
    check(cmds(dev).length === 0, 'A: Connect sent only the identity query', JSON.stringify(dev.commands));
    if (ok) {
      let e = null; try { await u.install({ force: false }); } catch (x) { e = x; }
      check(e && /model|机型/i.test(e.message)   /* the recovery page is the published tabby-v04.0 page, whose messages are Chinese; Task 14 */ && cmds(dev).length === 0, 'A: Start update without the model confirmation is refused, nothing written', e?.message);
      e = null; try { await u.install({ force: false, confirmedModel: 'elite' }); } catch (x) { e = x; }
      check(e && cmds(dev).length === 0, 'A: an Elite confirmation is refused for the Pro package', e?.message);
      await u.connect({ force: false });
    }
    let e = null; try { await u.install({ force: false, confirmedModel: 'pro' }); } catch (x) { e = x; }
    check(!dev.commands.includes(50) && dev.commands.includes('write') && dev.wrote === 512,
      'A: with "pro" confirmed the image is served, no command 50 (build ' + afterBuild.slice(0, 8) + ')', JSON.stringify(dev.commands));
    if (ok) check(e === null, 'A: the restart check passes for build b6e9590223446363', e?.message);
    else check(e && /Firmware verification failed after restart/.test(e.message), 'A: the restart check fails for another build id', e?.message);
  }
});

await scenario('B', async () => {
  for (const tag of [OTHER.slice(0, 16), 'fedcba9876543210']) {
    for (const force of [false, true]) {
      const dev = smk('ota-SMK37' + tag);
      const u = new W.Updater(access([dev]), pkg(), () => {}, FAST, { builds: lookup });
      let e = null; try { await u.connect({ force }); } catch (x) { e = x; }
      check(e?.code === 'LOADER_MISMATCH' && e.loaderTag === tag && cmds(dev).length === 0 && u.link === null,
        'B: tag ' + tag + (force ? ' (force asked)' : '') + ' is still refused, only the identity query sent', e?.code + ' ' + JSON.stringify(dev.commands));
    }
  }
  const dev = smk('ota-SMK37' + OWN.slice(0, 16));
  const u = new W.Updater(access([dev]), pkg(), () => {}, FAST, { builds: lookup });
  const r = await u.connect({});
  check(r.resume === true && u.mode === 'loader', 'B: this build\'s own tag still resumes');
});

await scenario('C', async () => {
  let dev = smk(PRODUCT, { cap49: capReply(OTHER) });
  let u = new W.Updater(access([dev]), pkg(), () => {}, FAST);
  let r = await u.connect({ force: true });
  check(u.force === false && u.mode === 'tagged' && r.current === OTHER, 'C: connect({force:true}) leaves force off; normal tagged update', JSON.stringify([u.force, u.mode]));
  let e = null; try { await u.install({ force: true }); } catch (x) { e = x; }
  check(dev.commands.includes(50), 'C: the install on Open firmware arms the loader with command 50 (tagged path, never legacy)', JSON.stringify(dev.commands));

  dev = smk(PRODUCT, { cap49: null });
  u = new W.Updater(access([dev]), pkg(), () => {}, FAST);
  e = null; try { await u.connect({ force: true }); } catch (x) { e = x; }
  check(e && /Do not use force flash/.test(e.message) && dev.capSeen === 4 && u.mode !== 'migration' && u.mode !== 'legacy' && u.force === false,
    'C: a capability that never answers is queried 4 times, then an error that says not to force', `${dev.capSeen} ${u.mode} ${e?.message}`);
  check(!dev.commands.includes(50) && !dev.commands.includes('write'), 'C: nothing written after the timeouts');

  dev = smk(PRODUCT, { cap49: capReply(OTHER), capTimeouts: 1 });
  u = new W.Updater(access([dev]), pkg(), () => {}, FAST);
  r = await u.connect({ force: false });
  check(u.mode === 'tagged' && dev.capSeen === 2, 'C: one timeout, then a reply: Connect retries and succeeds', `${u.mode} ${dev.capSeen}`);

  dev = smk('SMK-37 Pro_016');
  u = new W.Updater(access([dev]), pkg(), () => {}, FAST);
  e = null; try { await u.connect({ force: true }); } catch (x) { e = x; }
  check(e && /Do not use force flash/.test(e.message) && cmds(dev).length === 0 && u.link === null,
    'C: a factory V16 identity is refused even with force asked; no migration mode', e?.message);
});

await scenario('D', async () => {
  const dev = smk(ZERO);
  const u = new W.Updater(access([dev]), pkg(), () => {}, FAST, { builds: lookup });
  await u.waitFor('ota-FM-1_015', [], 'pro');
  check(u.identity === ZERO, 'D: waitFor for a loader accepts the zero tag');
  await u.disconnect();
  const u2 = new W.Updater(access([dev]), pkg(), () => {}, { reconnect: 300, settle: 20 }, { builds: lookup });
  let e = null; try { await u2.waitFor(PRODUCT); } catch (x) { e = x; }
  check(e?.code === 'NO_DEVICE', 'D: waiting for the firmware, the zero tag is never taken for it (timeout, not a mismatch)', e?.code);
});

await scenario('E', async () => {
  const built = join(root, 'build/recover/SMK37-Open-Source.html');
  if (!existsSync(built)) { console.log('skip E: build/recover/SMK37-Open-Source.html not built (recover-page.py build)'); return; }
  const html = readFileSync(built, 'utf8');
  const published = readFileSync(join(root, 'build/gh-pages/builds/tabby-v04.0/SMK37-Open-Source.html'), 'utf8');
  check(html.split(patched).length === 2, 'E: the page carries the tested WebUpdate.js verbatim, once');
  const pk = t => t.match(/const FM1_PACKAGE = .*;/)[0];
  check(pk(html) === pk(published), 'E: FM1_PACKAGE is the published tabby-v04.0 one, byte for byte');
  const sets = [...html.matchAll(/\$\('force-update'\)\.checked=([^;]+);/g)].map(m => m[1]);
  check(sets.length >= 3 && sets.every(v => v === 'false'), 'E: every assignment to the force checkbox sets false', JSON.stringify(sets));
  check(!/setForceMode\(true/.test(html) && !/forceSuggested=(?!false)[^;]*;/.test(html.replace(/forceSuggested=false/g, '')),
    'E: no setForceMode(true), forceSuggested is only ever false');
  check(html.includes("updater.connect({force:false,") && html.includes('const force=false;') && html.includes("$('force-activate').hidden=true;"),
    'E: Connect and Start update pass force false; the force button stays hidden');
  check(html.includes('<details id="update-options" class="library-group" hidden>') && html.includes('id="recover-note"'),
    'E: the migration/force group is hidden; the recovery notice is shown');
});

console.log(`\nrecover-page: ${passed} ok, ${failed} failed`);
process.exit(failed ? 1 : 0);
