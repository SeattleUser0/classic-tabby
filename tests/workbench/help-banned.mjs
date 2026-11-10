// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/help-banned.mjs: no Help, panel, tooltip, status or release-facing string names a
// removed page, mode, action or flow, in English or Chinese
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
//   3. sdk/I18n.js: every key (Chinese) and value (English) of the translation table.
//   4. README.md, README.zh-CN.md, docs/MIDI-GUIDE.template.md, docs/releases/INSTALL.template.txt:
//      every paragraph.
//   A string is exempt when it sits inside an element marked data-removed-ok in sdk/Update.html.in
//   (the "What changed in tabby-v04" chapter and the removed-features paragraph), when its
//   Chinese key is the key of such a text, or when it contains a fragment of the "allow" list (the
//   sentences that say a feature was removed).
//
// Also checks that the "What changed in tabby-v04" chapter exists and covers storage, step editing,
// SYNC / MIDI, STOP TO SAVE, the timing counters and the recovery pages, in both languages, and that
// the self-test strings are caught.
//
//   Run: /usr/bin/node tests/workbench/help-banned.mjs      (make workbench-test runs it)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-10  Task 14: first version.

import { readFileSync } from 'node:fs';

let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

const lists = JSON.parse(readFileSync('tests/workbench/help-banned-phrases.json', 'utf-8'));
const banned = [...lists.en, ...lists.zh];
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
check(hit('SEQ 基础页打击垫开关当前页的步；K3 选音高或鼓声部。') !== null, 'self-test: the old Chinese SEQ page text is caught');
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

/* The translation table. */
const scope = { globalThis: {}, location: { search: '' } };
new Function('globalThis', 'document', 'localStorage', 'location', readFileSync('sdk/I18n.js', 'utf-8'))(scope.globalThis, undefined, undefined, scope.location);
const messages = scope.globalThis.FM1I18n.messages;
for (const [k, v] of Object.entries(messages)) {
  if (exemptTexts.has(k)) continue;
  found.push({ where: 'I18n key', text: k });
  found.push({ where: 'I18n value', text: v, key: k });
}

/* Release-facing documents, by paragraph. */
for (const f of ['README.md', 'README.zh-CN.md', 'docs/MIDI-GUIDE.template.md', 'docs/releases/INSTALL.template.txt'])
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
  const zh = textsOf(m0[1]).join(' ');
  const en = textsOf(m0[1]).map(t => messages[t] || '').join(' ');
  check(html.indexOf('id="manual-tabby-changes"') < html.indexOf('id="manual-tabby-about"'), 'it is the first chapter of the Help');
  for (const [topic, zhRe, enRe] of [
    ['storage move', /存储搬家/, /storage move/i], ['step editing removed', /没有步进编辑和录音/, /no step editing or recording/],
    ['SYNC / MIDI', /SYNC \/ MIDI/, /SYNC \/ MIDI/], ['STOP TO SAVE', /STOP TO SAVE/, /STOP TO SAVE/],
    ['timing counters', /计时计数器/, /timing counters/i], ['recovery pages', /builds\//, /builds\//]]) {
    check(zhRe.test(zh), `chapter 00 (Chinese): ${topic}`);
    check(enRe.test(en), `chapter 00 (English): ${topic}`);
  }
}

console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
