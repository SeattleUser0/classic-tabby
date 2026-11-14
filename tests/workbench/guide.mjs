// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/guide.mjs — the testing and user guide keeps its shape (tabby-v04.1.1)
//
// Purpose
//   docs/TESTING-GUIDE.md is the musician's guide and checklist; the site shows it at guide/
//   (tools/linux/guide-html.py). This test keeps the promises the user asked for:
//     1. plain text only: ASCII, no tab, no HTML, no code fence;
//     2. the eight sections exist, in order;
//     3. the checklist is numbered T1..Tn without gaps, and every test has "Set up:", at least
//        one numbered step, a "You should" line and a "Result: PASS / FAIL" line;
//     4. control names follow SPEC 17.4: no "SAVE button", no bare "press SAVE", and "hold SEQ"
//        only in a sentence that says it does not open ACTIONS (SPEC 17.8);
//     5. a step that was not run in the simulator carries the marker, and the marker count is
//        printed (the report quotes it);
//     6. the rendered page has the same number of tests and the eight sections, and Help links to
//        it from chapter 00 and from the top of the Help tab.
//
//   Run: /usr/bin/node tests/workbench/guide.mjs      (make workbench-test runs it)
//
// Version: 0.3
//
// Revision log
//   v0.6  2026-11-14  Chapter 00 names tabby-v04.5 (the check now reads the sentence that names the page's version).
//   v0.5  2026-11-14  Chapter 00 names tabby-v04.4.
//   v0.4  2026-11-12  Chapter 00 names tabby-v04.3.1.
//   v0.3  2026-11-12  Chapter 00 names tabby-v04.3.
//   v0.2  2026-11-11  Chapter 00 names tabby-v04.2 (was tabby-v04.1.1).
//   v0.1  2026-11-10  Initial version (testing guide, tabby-v04.1.1).

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

let failures = 0;
const check = (ok, what, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' - ' + detail : ''}`);
  if (!ok) failures++;
};

const md = readFileSync('docs/TESTING-GUIDE.md', 'utf8');
const lines = md.split('\n');

check(!/[^\x00-\x7f]/.test(md), 'plain ASCII text');
check(!/\t|```|<[a-z/][^>]*>/.test(md), 'no tab, code fence or HTML');

const sections = [...md.matchAll(/^(\d)\. ([A-Z][A-Z ,]+)\n=+$/gm)].map(m => Number(m[1]));
check(sections.join() === '1,2,3,4,5,6,7,8', 'sections 1 to 8 in order', sections.join());

// ---- the checklist
const starts = [];
lines.forEach((l, i) => { const m = /^T(\d+)\. /.exec(l); if (m) starts.push([Number(m[1]), i]); });
check(starts.length > 0 && starts.every(([n], i) => n === i + 1), 'tests numbered T1..T' + starts.length + ' without gaps');
let incomplete = [];
starts.forEach(([n, at], k) => {
  const end = k + 1 < starts.length ? starts[k + 1][1] : lines.length;
  const block = lines.slice(at, end).join('\n').replace(/\n[A-Z ,]+\n=+\n[\s\S]*$/, '');
  const ok = /^Set up: /m.test(block) && /^1\. /m.test(block) && /^You should (see|hear)/m.test(block) && /^Result: PASS \/ FAIL/m.test(block);
  if (!ok) incomplete.push('T' + n);
});
check(incomplete.length === 0, 'every test has Set up, a numbered step, You should see/hear and Result', incomplete.join(' '));

// ---- control names and the removed gesture
const bad = [];
lines.forEach((l, i) => {
  if (/\bSAVE button\b|\bpress SAVE\b|\bpress the SAVE\b/i.test(l)) bad.push(`line ${i + 1}: SAVE used as a button name`);
  if (/\bhold(ing)? SEQ\b/i.test(l) && !/alone|does not open|Do not|HOLD SEQ: ACTIONS/.test(l)) bad.push(`line ${i + 1}: hold SEQ`);
  if (/\bSHIFT\b[^.]*\bpress(es)? HOME\b(?! \/ SRC)(?!.*left group)/i.test(l) && /SOURCE|TRACK role|role/i.test(l)) bad.push(`line ${i + 1}: SHIFT + HOME for the source page`);
});
check(bad.length === 0, 'control names follow SPEC 17.4 and 17.8', bad.join('; '));

// ---- the "not checked" marker
const marked = (md.match(/\[not checked in simulator\]/g) || []).length;
check(marked > 0, 'steps that were not run in the simulator carry the marker', `${marked} marked`);
console.log(`info  tests: ${starts.length}; marked "not checked in simulator": ${marked}`);

// ---- the page
const r = spawnSync('python3', ['-I', 'tools/linux/guide-html.py', '--out', 'build/guide-test/index.html'], { encoding: 'utf8' });
check(r.status === 0, 'guide-html.py renders the page', (r.stderr || '').trim());
if (r.status === 0) {
  const html = readFileSync('build/guide-test/index.html', 'utf8');
  check((html.match(/<h4 id="t\d+"/g) || []).length === starts.length, 'the page has every test');
  check((html.match(/<h2 id="s\d"/g) || []).length === 8, 'the page has the eight sections');
  check(!/<script/i.test(html), 'the page has no script');
  check((html.match(/class="tag"/g) || []).length === marked, 'the page tags every marked step', `${(html.match(/class="tag"/g) || []).length}`);
}

// ---- Help links to it
const help = readFileSync('sdk/Update.html.in', 'utf8');
const links = (help.match(/https:\/\/seattleuser0\.github\.io\/classic-tabby\/guide\//g) || []).length;
check(links >= 2, 'Help links to the guide from the Help heading and from chapter 00', `${links} links`);
check(/manual-guide-link/.test(help) && /The page you are on is tabby-v04\.5\./.test(help), 'chapter 00 names the page version');

if (failures) { console.log('FAILED'); process.exit(1); }
console.log('all checks passed');
