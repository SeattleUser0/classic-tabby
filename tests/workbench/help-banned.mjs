// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/help-banned.mjs: no Help, panel, tooltip, status or release-facing string names a
// removed page, mode, action or flow, and none contains a CJK character (the workbench is English only)
//
// Purpose
//   tabby-v04.0 removed the stock step editor (STEP DETAILS, LOCKS, RHYTHM/REC, REC, count-in,
//   metronome, copy / paste, pad-step mode), the sampler, the 7-page SEQ and the "Enable force flash
//   and reconnect" button (SPEC 16.2, 17.4, Task 12). The published tabby-v04.1 page still carried
//   the old words in its Help, tooltips and translation table (Task 14). This test reads every
//   user-facing string and fails when one contains a phrase of tests/workbench/help-banned-phrases.json.
//
// What it scans
//   1. sdk/Update.html.in: every text node and title / aria-label / placeholder / value attribute of
//      the HTML, and every string literal of its scripts (comments are skipped).
//   2. sdk/Simulator.js, sdk/WebUpdate.js, sdk/Samples.js: every string literal (comments skipped).
//   3. (the translation table is gone: Task 14, English only)
//   4. README.md, docs/MIDI-GUIDE.template.md, docs/releases/INSTALL.template.txt:
//      every paragraph.
//   A string is exempt when it sits inside an element marked data-removed-ok in sdk/Update.html.in
//   (the "What changed in tabby-v04" chapter and the removed-features paragraph), when its
//   Chinese key is the key of such a text, or when it contains a fragment of the "allow" list (the
//   sentences that say a feature was removed).
//
// The CJK check (Task 14): every string above, and every whole source file of the workbench (sdk/*.js,
// sdk/Update.html.in, web/**/*.js, comments included), the READMEs, the MIDI guide and the install
// template, must be free of CJK and fullwidth characters. LICENSE.md, THIRD_PARTY.md and the other
// upstream notices are not scanned: they stay as upstream wrote them.
//
// Also checks that the "What changed in tabby-v04" chapter exists and covers storage, step editing,
// SYNC / MIDI, STOP TO SAVE, the timing counters and the recovery pages, and that the self-test
// strings are caught.
//
//   Run: /usr/bin/node tests/workbench/help-banned.mjs      (make workbench-test runs it)
//
// Version: 0.3
//
// Revision log
//   v0.3  2026-11-10  Task 14: English only: the Chinese phrases, the translation-table scan and the
//                     Chinese chapter checks are gone; a CJK check is added.
//   v0.2  2026-11-10  Task 14 second pass: more phrases (restore sectors, CLK IN DIN).
//   v0.1  2026-11-10  Task 14: first version.

import { readFileSync } from 'node:fs';

let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

const lists = JSON.parse(readFileSync('tests/workbench/help-banned-phrases.json', 'utf-8'));
const banned = lists.en;
const allow = lists.allow;
const unescape = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
const allowExact = new Set(lists.allow_exact || []);
/* A phrase that starts with a letter must start a word: "LOCKS" is not a hit inside "BLOCKS". */
const contains = (text, phrase) => {
  for (let at = text.indexOf(phrase); at >= 0; at = text.indexOf(phrase, at + 1))
    if (!/^[A-Za-z]/.test(phrase) || at === 0 || !/[A-Za-z]/.test(text[at - 1])) return true;
  return false;
};
const hit = text => {
  if (allowExact.has(text.trim()) || allow.some(a => text.includes(a))) return null;
  return banned.find(b => contains(text, b)) || null;
};

/* Self-test: the list catches what it must and lets the removal sentences through. */
check(hit('SEQ: Tap for steps; tap again for BASIC and playback follow.') !== null, 'self-test: the old SEQ tooltip is caught');
check(hit('Make a beat: SHIFT + PAD / STEP switches step editing.') !== null, 'self-test: the old quick-start line is caught');
check(hit('Enable force flash and reconnect') !== null, 'self-test: the removed update button is caught');
check(hit('This version has no recording and no step editing on the device') === null, 'self-test: a removal sentence passes');

/* ---- gather the strings ------------------------------------------------------------------ */
const found = [];   // {where, text}
const html = readFileSync('sdk/Update.html.in', 'utf-8');

/* Regions marked data-removed-ok: the texts inside them are exempt. */
const exemptTexts = new Set();
const textsOf = fragment => fragment.split(/<[^>]+>/).map(t => unescape(t).trim()).filter(Boolean);
for (const m of html.matchAll(/<article[^>]*data-removed-ok[^>]*>[\s\S]*?<\/article>/g)) textsOf(m[0]).forEach(t => exemptTexts.add(t));
for (const m of html.matchAll(/<(h4|p)[^>]*data-removed-ok[^>]*>([\s\S]*?)<\/\1>/g)) textsOf(m[2]).forEach(t => exemptTexts.add(t));
check(exemptTexts.size > 0, 'the exempt regions exist', `${exemptTexts.size} texts`);

/* JavaScript: drop comments, then take the string literals. */
function literals(source) {
  const noBlock = source.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const noLine = noBlock.split('\n').map(l => l.replace(/(^|[\s;{}),])\/\/.*$/, '$1')).join('\n');
  const out = [];
  for (const m of noLine.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

/* HTML: scripts and styles apart, then text nodes and attributes. */
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const body = html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, ' ').replace(/<style[^>]*>[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
for (const t of textsOf(body)) found.push({ where: 'Update.html.in text', text: t });
for (const m of body.matchAll(/(?:title|aria-label|placeholder|value|alt)="([^"]*)"/g)) found.push({ where: 'Update.html.in attribute', text: unescape(m[1]) });
for (const s of scripts) for (const l of literals(s)) found.push({ where: 'Update.html.in script', text: l });
for (const f of ['sdk/Simulator.js', 'sdk/WebUpdate.js', 'sdk/Samples.js']) for (const l of literals(readFileSync(f, 'utf-8'))) found.push({ where: f, text: l });

/* Release-facing documents, by paragraph. */
for (const f of ['README.md', 'docs/MIDI-GUIDE.template.md', 'docs/releases/INSTALL.template.txt'])
  for (const p of readFileSync(f, 'utf-8').split(/\n\s*\n/)) found.push({ where: f, text: p });

/* ---- check -------------------------------------------------------------------------------- */
const bad = [];
for (const f of found) {
  if (exemptTexts.has(f.text)) continue;
  const b = hit(f.text);
  if (b) bad.push(`[${f.where}] "${b}" in: ${f.text.replace(/\s+/g, ' ').slice(0, 110)}`);
}
check(found.length > 1000, 'strings scanned', String(found.length));
check(bad.length === 0, 'no string names a removed page, mode, action or flow', bad.length ? `\n  ${bad.slice(0, 25).join('\n  ')}${bad.length > 25 ? `\n  ... and ${bad.length - 25} more` : ''}` : '');

/* ---- the "What changed in tabby-v04" chapter ---------------------------------------------- */
const m0 = html.match(/<article id="manual-tabby-changes"[^>]*>([\s\S]*?)<\/article>/);
check(!!m0, 'the chapter "What changed in tabby-v04" exists');
if (m0) {
  const en = textsOf(m0[1]).join(' ');
  check(html.indexOf('id="manual-tabby-changes"') < html.indexOf('id="manual-tabby-about"'), 'it is the first chapter of the Help');
  for (const [topic, re] of [['storage move', /storage move/i], ['step editing removed', /no step editing or recording/],
    ['SYNC / MIDI', /SYNC \/ MIDI/], ['STOP TO SAVE', /STOP TO SAVE/], ['timing counters', /timing counters/i], ['recovery pages', /builds\//]])
    check(re.test(en), `chapter 00: ${topic}`);
}

/* ---- no CJK in any user-facing text (Task 14) ----------------------------------------------- */
const cjk = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
const cjkFound = found.filter(f => cjk.test(f.text)).map(f => `[${f.where}] ${f.text.replace(/\s+/g, ' ').slice(0, 80)}`);
check(cjkFound.length === 0, 'no user-facing string contains a CJK character', cjkFound.slice(0, 10).join('\n  '));
import { readdirSync, statSync } from 'node:fs';
function walk(dir, out = []) { for (const n of readdirSync(dir)) { const p = dir + '/' + n; if (statSync(p).isDirectory()) walk(p, out); else out.push(p); } return out; }
const rawFiles = [...readdirSync('sdk').filter(n => n.endsWith('.js') || n === 'Update.html.in').map(n => 'sdk/' + n),
  ...walk('web').filter(p => /\.(js|json|html)$/.test(p)),
  'README.md', 'docs/MIDI-GUIDE.template.md', 'docs/MIDI-GUIDE.md', 'docs/releases/INSTALL.template.txt'];
const rawBad = rawFiles.filter(f => cjk.test(readFileSync(f, 'utf-8')));
check(rawBad.length === 0, `no CJK in ${rawFiles.length} workbench, web and release-facing files (comments included)`, rawBad.join(', '));
check(!/README\.zh-CN|id="language"/.test(readFileSync('README.md', 'utf-8') + html), 'no Chinese README link and no language selector');

console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
