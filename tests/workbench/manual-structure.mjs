// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/manual-structure.mjs: the manual tab's structure (was manual-i18n.mjs)
//
// Purpose
//   The workbench is English only (Task 14, 2026-11-10; SPEC 17.7), so the old check that every
//   Chinese text of the manual has a translation is gone (tests/workbench/help-banned.mjs now fails
//   on any CJK character in a user-facing string). What stays is the manual's shape: 22 chapters
//   (00 to 21), one index link per chapter and every link pointing at an existing chapter id, the
//   chapter numbers in order, and no em dash in the Classic Tabby chapters before chapter 13.
//
//   Run: /usr/bin/node tests/workbench/manual-structure.mjs      (make workbench-test runs it)
//
// Version: 1.0
//
// Revision log
//   v1.0  2026-11-10  Task 14: renamed from manual-i18n.mjs (v0.3); the translation checks removed;
//                     structure checks added (ids, order, links).
//   v0.3  2026-11-10  Task 14: the manual has 22 chapters (chapter 00 "What changed in tabby-v04").
//   v0.2  2026-11-08  Task 12 A2: the removed step-editor texts must be absent too.
//   v0.1  2026-11-04  Initial version (Task 08, the manual rewrite).

import { readFileSync } from 'node:fs';

let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

const html = readFileSync('sdk/Update.html.in', 'utf-8');
const start = html.indexOf('<section id="tab-manual"'), end = html.indexOf('</section>', start);
check(start >= 0 && end > start, 'manual section found');
const section = html.slice(start, end);

const articles = [...section.matchAll(/<article id="([^"]+)" class="manual-chapter[^"]*"[^>]*>\s*<h3>([^<]*)<\/h3>/g)].map(m => ({ id: m[1], title: m[2] }));
const links = [...section.matchAll(/<li><a href="#(manual-[^"]+)">([^<]*)<\/a><\/li>/g)].map(m => ({ id: m[1], title: m[2] }));
check(articles.length === 22 && links.length === 22, 'manual has 22 chapters and 22 index links', `${articles.length} / ${links.length}`);
check(new Set(articles.map(a => a.id)).size === articles.length, 'chapter ids are unique');
check(links.every((l, i) => articles[i] && l.id === articles[i].id && l.title === articles[i].title), 'index links match the chapters, in order, with the same titles');
check(articles.every((a, i) => a.title.startsWith(String(i).padStart(2, '0') + ' ')), 'chapters are numbered 00 to 21 in order', articles.map(a => a.title.slice(0, 2)).join(' '));
check(!/—/.test(section.slice(0, section.indexOf('<article id="manual-start"'))), 'Classic Tabby chapters contain no em dash');
check(!/id="language"|language-picker/.test(html), 'no language selector in the page');
check(/<html lang="en">/.test(html), 'the page language is en');

console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
