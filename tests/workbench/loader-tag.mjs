// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/loader-tag.mjs — safe resume for a stale Jieli loader (Task 12 A5)
//
// Purpose
//   After an interrupted install the SMK-37's update loader stays in USB with the name
//   ota-SMK37 + the first 16 hex digits of the build it was receiving, and accepts only that build
//   (BUILD.md 25.3: the page of another build waited for its own tag until the timeout, then a
//   resume with the right image was the only way out). sdk/WebUpdate.js now names the build the
//   loader waits for, through builds/index.json (tools/linux/builds-index.py), and never treats a
//   mismatched loader as its own. Scenarios (12 fake ports each, as in update-ports.mjs):
//     P  the loader with this page's own tag                  -> resume, as before
//     Q  a loader with a tag the index knows                  -> LOADER_MISMATCH at Connect: the entry's
//                                                                tag, its page URL resolved against the
//                                                                index, state 'found'; only the identity
//                                                                query was sent; the port is closed
//     R  a tag the index does not know                        -> LOADER_MISMATCH, state 'unknown', no link
//     S  no index can be read (fetch fails / none given)      -> LOADER_MISMATCH, state 'unavailable';
//                                                                the message still names the tag
//     T  waitFor meets a mismatched loader                    -> LOADER_MISMATCH at once (well before the
//                                                                reconnect timeout), nothing written
//     U  matchBuild / buildsLookup: case, prefix on the build id, URL resolution, candidates in order,
//        a 404 then a good index, a malformed index skipped
//     V  every message translates to English (sdk/I18n.js patterns) and names the tag
//     W  the page wires it: #loader-hint exists, the Updater gets {builds}, both catch blocks call
//        showLoaderHint (static check of sdk/Update.html.in)
//
//   Run:  /usr/bin/node tests/workbench/loader-tag.mjs   (part of make workbench-test)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-08  Initial version (Task 12 A5).

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
// sdk/I18n.js in a bare scope (as tests/workbench/manual-i18n.mjs does): FM1I18n.t for scenario V.
const i18nScope = { globalThis: {} };
new Function('globalThis', 'document', 'localStorage', 'location', readFileSync(join(root, 'sdk/I18n.js'), 'utf8'))(i18nScope.globalThis, undefined, undefined, { search: '' });
const I18N = i18nScope.globalThis.FM1I18n;

let failed = 0, passed = 0;
function check(cond, what, detail) {
  if (cond) { passed++; console.log('ok   ' + what); }
  else { failed++; console.log('FAIL ' + what + (detail === undefined ? '' : ' — ' + detail)); }
}

/* ---- fake Web MIDI (as update-ports.mjs) ------------------------------------------------- */
const AUDIO4C = ['DIN', 'USB2', 'HST1', 'HST2', 'HST3', 'HST4', 'HST5', 'HST6', 'HST7', 'HST8'].map(n => 'AUDIO4c ' + n);
const ascii27 = text => { const b = new Uint8Array(27); for (let i = 0; i < text.length; i++) b[i] = text.charCodeAt(i); return b; };
const OWN = '0123456789abcdef' + 'ab'.repeat(24);                 // this page's build id
const PKG = { model: 'pro', family: 9, build_id: OWN, kind: 'open', product: 'SMK-37 Pro_8000001',
  display_version: 'tabby-v04.0', loaderIdentity: 'ota-SMK37' + OWN.slice(0, 16) };
const R2 = '8b7dff801f1b08768bb95855ed11b92e894a65cd284caff07bbf204da06f9449';   // the diag-r2 build (BUILD.md 25.3)
const V032 = 'd842d29d3243' + 'c'.repeat(52);
const INDEX_URL = 'https://seattleuser0.github.io/classic-tabby/builds/index.json';
const INDEX = { schema: 1, updated: '2026-11-08T00:00:00Z', builds: [
  { tag: 'tabby-v03.2', build: V032, loader: 'ota-SMK37' + V032.slice(0, 16), version: 'tabby-v03.2', page: 'builds/tabby-v03.2/', published: '2026-11-05' },
  { tag: 'tabby-v03.3-diag-r2', build: R2, loader: 'ota-SMK37' + R2.slice(0, 16), version: 'tabby-v03.3-diag-r2', page: 'builds/tabby-v03.3-diag-r2/', published: '2026-11-08' },
  { tag: 'tabby-v04.0', build: OWN, loader: 'ota-SMK37' + OWN.slice(0, 16), version: 'tabby-v04.0', page: 'builds/tabby-v04.0/', published: '2026-11-08' } ] };

let nextId = 1;
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
const onlyIdentityQueries = port => port.sent.length > 0 && port.sent.every(bytes => W.parse(Uint8Array.from(bytes))?.command === 17);
const FAST = { reconnect: 3000, settle: 20 };
const lookup = W.buildsLookupFromIndex(INDEX, INDEX_URL);

async function scenario(label, fn) {
  try { await fn(); } catch (e) { check(false, label + ': no exception', e.stack); }
}

await scenario('P', async () => {
  const loader = device('USB Composite Device MIDI 1', PKG.loaderIdentity, 'Jieli Technology');
  const { a4, all } = rig(loader, device('Midi Through Port-0'));
  const u = new W.Updater(access(all), PKG, () => {}, FAST, { builds: lookup });
  const r = await u.connect({ force: false });
  check(r.resume === true && r.identity === PKG.loaderIdentity, 'P: the loader with this page\'s tag resumes as before', JSON.stringify(r));
  check(quiet(a4), 'P: nothing sent to the AUDIO4c ports');
  await u.disconnect();
});

await scenario('Q', async () => {
  const loader = device('USB Composite Device MIDI 1', 'ota-SMK37' + R2.slice(0, 16), 'Jieli Technology');
  const { a4, all } = rig(loader, device('Midi Through Port-0'));
  const u = new W.Updater(access(all), PKG, () => {}, FAST, { builds: lookup });
  let error = null;
  try { await u.connect({ force: false }); } catch (e) { error = e; }
  check(error?.code === 'LOADER_MISMATCH', 'Q: a known other tag -> LOADER_MISMATCH', error?.code + ' ' + error?.message);
  check(error?.loaderTag === R2.slice(0, 16) && error?.identity === 'ota-SMK37' + R2.slice(0, 16), 'Q: the error carries the tag and the identity', JSON.stringify([error?.loaderTag, error?.identity]));
  check(error?.indexState === 'found' && error?.build?.tag === 'tabby-v03.3-diag-r2', 'Q: state found, the entry\'s tag', JSON.stringify(error?.build));
  check(error?.build?.url === 'https://seattleuser0.github.io/classic-tabby/builds/tabby-v03.3-diag-r2/', 'Q: the page URL resolved against the index URL', error?.build?.url);
  check(error?.message.includes(R2.slice(0, 16)) && error?.message.includes('tabby-v03.3-diag-r2') && error?.message.includes('tabby-v04.0'), 'Q: the message names the tag, that build and this page\'s version', error?.message);
  check(onlyIdentityQueries(loader), 'Q: only the identity query reached the loader', JSON.stringify(loader.sent.map(b => W.parse(Uint8Array.from(b))?.command)));
  check(u.link === null && u.identity === null, 'Q: the port was closed (no link kept)');
  check(quiet(a4), 'Q: nothing sent to the AUDIO4c ports');
  // force flash does not change the answer: the loader accepts only its build.
  error = null;
  try { await u.connect({ force: true }); } catch (e) { error = e; }
  check(error?.code === 'LOADER_MISMATCH', 'Q: with force flash on, still LOADER_MISMATCH', error?.code);
});

await scenario('R', async () => {
  const tag = 'fedcba9876543210';
  const loader = device('USB Composite Device MIDI 1', 'ota-SMK37' + tag, 'Jieli Technology');
  const { all } = rig(loader, device('Midi Through Port-0'));
  const u = new W.Updater(access(all), PKG, () => {}, FAST, { builds: lookup });
  let error = null;
  try { await u.connect({ force: false }); } catch (e) { error = e; }
  check(error?.code === 'LOADER_MISMATCH' && error.indexState === 'unknown' && error.build === null, 'R: an unknown tag -> LOADER_MISMATCH, state unknown, no build', error?.code + ' ' + error?.indexState);
  check(error?.indexUrl === INDEX_URL, 'R: the index that was read is named (the page links its builds/ list)', error?.indexUrl);
  check(error?.message.includes(tag) && error?.message.includes('tabby-v04.0'), 'R: the message names the tag and this page\'s version', error?.message);
  check(onlyIdentityQueries(loader), 'R: only the identity query was sent');
});

await scenario('S', async () => {
  const loader = device('USB Composite Device MIDI 1', 'ota-SMK37' + R2.slice(0, 16), 'Jieli Technology');
  const { all } = rig(loader, device('Midi Through Port-0'));
  // (a) no lookup at all
  let u = new W.Updater(access(all), PKG, () => {}, FAST);
  let error = null;
  try { await u.connect({ force: false }); } catch (e) { error = e; }
  check(error?.code === 'LOADER_MISMATCH' && error.indexState === 'unavailable' && error.build === null && error.message.includes(R2.slice(0, 16)),
    'S: no index given -> LOADER_MISMATCH, state unavailable, the tag in the message', error?.code + ' ' + error?.indexState);
  // (b) a lookup whose fetch fails everywhere (file:// page, no network)
  const failing = W.buildsLookup(['file:///x/builds/index.json', 'file:///index.json'], async () => { throw new TypeError('Failed to fetch'); });
  u = new W.Updater(access(all), PKG, () => {}, FAST, { builds: failing });
  error = null;
  try { await u.connect({ force: false }); } catch (e) { error = e; }
  check(error?.code === 'LOADER_MISMATCH' && error.indexState === 'unavailable' && error.indexUrl === null, 'S: every fetch failing -> state unavailable, no index URL', error?.indexState);
  // (c) a lookup that throws
  u = new W.Updater(access(all), PKG, () => {}, FAST, { builds: async () => { throw new Error('boom'); } });
  error = null;
  try { await u.connect({ force: false }); } catch (e) { error = e; }
  check(error?.code === 'LOADER_MISMATCH' && error.indexState === 'unavailable', 'S: a throwing lookup still gives the message', error?.code);
});

await scenario('T', async () => {
  const { a4, all } = rig(device('Midi Through Port-0'), device('IAC Driver Bus 1'));
  const acc = access(all);
  const u = new W.Updater(acc, PKG, () => {}, { reconnect: 5000, settle: 20 }, { builds: lookup });
  const loader = device('USB Composite Device MIDI 1', 'ota-SMK37' + V032.slice(0, 16), 'Jieli Technology');
  setTimeout(() => { acc.inputs.set(loader.input.id, loader.input); acc.outputs.set(loader.output.id, loader.output); }, 60);
  const started = Date.now();
  let error = null;
  try { await u.waitFor(PKG.loaderIdentity, [], PKG.model); } catch (e) { error = e; }
  const took = Date.now() - started;
  check(error?.code === 'LOADER_MISMATCH' && error.build?.tag === 'tabby-v03.2', 'T: waitFor meets a mismatched loader -> LOADER_MISMATCH naming tabby-v03.2', error?.code + ' ' + JSON.stringify(error?.build));
  check(took < 2500, 'T: the wait ended at once, not at the 5 s timeout', took + ' ms');
  check(onlyIdentityQueries(loader) && quiet(a4), 'T: only the identity query was sent; nothing written');
  check(u.diagnostics?.identities?.includes('ota-SMK37' + V032.slice(0, 16)) && u.diagnostics?.expected?.includes(PKG.loaderIdentity), 'T: the connection details show the identity seen and the one expected', JSON.stringify(u.diagnostics));
  // The own tag in the expected list still wins over the mismatch check (a stock-style 'ota-'+identity is not a tag at all).
  const own = device('USB Composite Device MIDI 2', PKG.loaderIdentity, 'Jieli Technology');
  const acc2 = access(rig(own).all);
  const u2 = new W.Updater(acc2, PKG, () => {}, FAST, { builds: lookup });
  await u2.waitFor(PKG.loaderIdentity, [], PKG.model);
  check(u2.identity === PKG.loaderIdentity, 'T: the own tag is still found by waitFor');
  await u2.disconnect();
});

await scenario('U', async () => {
  const hit = W.matchBuild(INDEX, R2.slice(0, 16).toUpperCase(), INDEX_URL);
  check(hit?.tag === 'tabby-v03.3-diag-r2' && hit.url.endsWith('/builds/tabby-v03.3-diag-r2/'), 'U: matchBuild ignores case and resolves the page URL', JSON.stringify(hit));
  const noLoaderField = W.matchBuild({ schema: 1, builds: [{ tag: 'x', build: V032, page: 'builds/x/' }] }, V032.slice(0, 16), 'https://h/site/builds/index.json');
  check(noLoaderField?.tag === 'x' && noLoaderField.url === 'https://h/site/builds/x/', 'U: an entry without a loader field matches on the build id prefix', JSON.stringify(noLoaderField));
  check(W.matchBuild(INDEX, 'ffffffffffffffff', INDEX_URL) === null && W.matchBuild({ schema: 2, builds: [] }, R2.slice(0, 16), INDEX_URL) === null, 'U: no match and a wrong schema give null');
  check(W.loaderTag('ota-SMK378b7dff801f1b0876') === '8b7dff801f1b0876' && W.loaderTag('ota-SMK-37 Pro_8000001') === null && W.loaderTag('SMK-37 Pro_8000001') === null && W.loaderTag('ota-SMK378b7dff801f1b087') === null,
    'U: loaderTag reads only ota-SMK37 + 16 hex digits');
  // buildsLookup over candidate URLs: a 404, then a malformed index, then the good one.
  const calls = [];
  const fetcher = async (url) => { calls.push(url);
    if (url.endsWith('/a/index.json')) return { ok: false, status: 404, json: async () => ({}) };
    if (url.endsWith('/b/index.json')) return { ok: true, json: async () => ({ schema: 1, builds: 'nope' }) };
    return { ok: true, json: async () => INDEX }; };
  const l = W.buildsLookup(['https://h/a/index.json', 'https://h/b/index.json', 'https://h/site/builds/index.json'], fetcher);
  const r = await l(R2.slice(0, 16));
  check(r.state === 'found' && r.indexUrl === 'https://h/site/builds/index.json' && r.entry.url === 'https://h/site/builds/tabby-v03.3-diag-r2/' && calls.length === 3,
    'U: buildsLookup skips a 404 and a malformed index, resolves against the index it read', JSON.stringify(r) + ' ' + calls.length);
  const r2 = await l('0000000000000000');
  check(r2.state === 'unknown' && r2.entry === null && r2.indexUrl === 'https://h/site/builds/index.json', 'U: an unknown tag through buildsLookup -> unknown with the index URL');
  const none = await W.buildsLookup(['https://h/x.json'], null)('abc');
  check(none.state === 'unavailable', 'U: no fetch function -> unavailable');
});

await scenario('V', async () => {
  const loader = device('USB Composite Device MIDI 1', 'ota-SMK37' + R2.slice(0, 16), 'Jieli Technology');
  const u = new W.Updater(access(rig(loader).all), PKG, () => {}, FAST);
  const samples = [];
  samples.push((await (new W.Updater(access(rig(loader).all), PKG, () => {}, FAST, { builds: lookup })).loaderMismatch(R2.slice(0, 16), 'x')).message);
  samples.push((await (new W.Updater(access(rig(loader).all), PKG, () => {}, FAST, { builds: lookup })).loaderMismatch('fedcba9876543210', 'x')).message);
  samples.push((await u.loaderMismatch(R2.slice(0, 16), 'x')).message);
  for (const [i, zh] of samples.entries()) {
    const en = I18N.t(zh, 'en');
    check(en !== zh && /^The update loader is waiting for/.test(en) && en.includes(i === 1 ? 'fedcba9876543210' : R2.slice(0, 16)) && en.includes('tabby-v04.0'),
      'V: message ' + (i + 1) + ' translates to English and keeps the tag and version', en);
  }
  for (const key of ['该固件的页面：', '已发布固件列表：', '连接前请先断开其他 SMK-37。'])
    check(I18N.t(key, 'en') !== key, 'V: page string translated: ' + key, I18N.t(key, 'en'));
});

await scenario('W', async () => {
  const html = readFileSync(join(root, 'sdk/Update.html.in'), 'utf8');
  check(html.includes('<p id="loader-hint" hidden></p>'), 'W: the page has #loader-hint');
  check(/new FM1Web\.Updater\([\s\S]{0,400}?\{builds:buildsLookup\}\)/.test(html), 'W: the Updater is created with {builds: buildsLookup}');
  check((html.match(/showLoaderHint\(error\)/g) || []).length >= 2, 'W: both the connect and the install catch blocks call showLoaderHint');
  check(html.includes("FM1Web.buildsLookup(['./builds/index.json','../index.json','../builds/index.json']"), 'W: the index candidates cover the root, builds/<tag>/ and probe64/ or recover/ pages');
});

console.log((failed ? 'FAILED' : 'passed') + ': ' + passed + ' ok, ' + failed + ' failed (loader-tag)');
process.exit(failed ? 1 : 0);
