// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/manual-i18n.mjs — every Chinese text in the manual tab has an English translation
//
// Purpose
//   The workbench translates its Chinese source strings through sdk/I18n.js (`messages`, keyed by
//   the trimmed text node; a few regex patterns). A manual paragraph edited in Chinese without its
//   key updated would show Chinese in the English UI. This test walks the static HTML of
//   #tab-manual in sdk/Update.html.in: every text node and aria-label / title / placeholder
//   attribute that contains CJK characters must be a key of `messages` or match the chapter-count
//   pattern. The Classic Tabby chapters (01-12) are English and carry no CJK, so they pass by
//   construction; the kept SMK37 OPEN chapters (13-21) are what this guards.
//
//   Run: /usr/bin/node tests/workbench/manual-i18n.mjs      (make workbench-test runs it)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-04  Initial version (Task 08, the manual rewrite).

import { readFileSync } from 'node:fs';

let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

const html = readFileSync('sdk/Update.html.in', 'utf-8');
const start = html.indexOf('<section id="tab-manual"'), end = html.indexOf('</section>', start);
check(start >= 0 && end > start, 'manual section found');
const section = html.slice(start, end);

/* The messages object: evaluate sdk/I18n.js in a bare scope and read FM1I18n.messages. */
const source = readFileSync('sdk/I18n.js', 'utf-8');
const scope = { globalThis: {}, document: undefined, localStorage: undefined, location: { search: '' } };
new Function('globalThis', 'document', 'localStorage', 'location', source)(scope.globalThis, undefined, undefined, scope.location);
const i18n = scope.globalThis.FM1I18n;
check(!!i18n && !!i18n.messages, 'FM1I18n loaded');
const messages = i18n.messages;

const unescape = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
const cjk = /[㐀-鿿]/;
const nodes = section.split(/<[^>]+>/).map(t => unescape(t).trim()).filter(t => cjk.test(t));
const attrs = [...section.matchAll(/(?:aria-label|title|placeholder)="([^"]*)"/g)].map(m => unescape(m[1])).filter(t => cjk.test(t));
const missing = [...new Set([...nodes, ...attrs])].filter(t => !Object.hasOwn(messages, t) && !/^共 \d+ 章$/.test(t));
check(missing.length === 0, `every CJK text of the manual has a translation (${new Set([...nodes, ...attrs]).size} texts)`, missing.slice(0, 5).join(' | '));
const chapters = (section.match(/class="manual-chapter/g) || []).length, links = (section.match(/<li><a href="#manual-/g) || []).length;
check(chapters === 21 && links === 21, 'manual has 21 chapters and 21 index links', `${chapters} / ${links}`);
check(!/—/.test(section.slice(0, section.indexOf('<article id="manual-start"'))), 'Classic Tabby chapters contain no em dash');
for (const w of ['SAMPLER · 采样', '.fm1s', 'OP1–OP6', 'EDIT＋REC', 'FACTORY（16 个内置工程）']) check(!section.includes(w), `removed feature text absent: ${w}`);

console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
