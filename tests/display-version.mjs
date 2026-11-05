// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/display-version.mjs — the display version reaches the simulator and the page (Task 08)
//
// Purpose
//   The version the user sees (boot screen, workbench badge, update tab) is the git tag,
//   computed by tools/linux/display_version.py and compiled in as FM1_DISPLAY_VERSION. This
//   test checks, after `make web`:
//     1. build/web/simulator.json (the wasm cache record) names the expected version;
//     2. the wasm bytes contain the string (the simulated boot screen draws it);
//     3. build/preview/index.html, when present, carries it in FM1_SIMULATOR.display_version
//        and its badge script reads that field.
//   The expected version is argv[2] when given (the Makefile passes DISPLAY_VERSION, the
//   forced label of the release gate), else the module's own answer for this tree.
//
//   Run: /usr/bin/node tests/display-version.mjs [expected]      (make web-smoke runs it)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-04  Initial version (Task 08).

import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

let failures = 0;
const check = (ok, what, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

let expected = process.argv[2];
if (!expected) {
  const r = spawnSync('python3', ['-I', 'tools/linux/display_version.py'], { encoding: 'utf-8' });
  check(r.status === 0, 'display_version.py answers', (r.stderr || '').trim());
  expected = (r.stdout || '').trim();
}
check(/^[A-Za-z0-9][A-Za-z0-9._+-]{0,39}$/.test(expected), 'expected version is a plain string', expected);

const record = JSON.parse(readFileSync('build/web/simulator.json', 'utf-8'));
check(record.display_version === expected, 'simulator.json display_version', `${record.display_version} vs ${expected}`);

const wasm = readFileSync('build/web/simulator.wasm');
check(wasm.includes(Buffer.from(expected + '\0', 'latin1')), 'wasm carries the version string');

const preview = 'build/preview/index.html';
if (existsSync(preview)) {
  const html = readFileSync(preview, 'utf-8');
  const m = html.match(/const FM1_SIMULATOR = (\{.*?\});\n/s);
  check(!!m, 'preview has FM1_SIMULATOR');
  if (m) {
    const sim = JSON.parse(m[1]);
    check(sim.display_version === expected, 'preview FM1_SIMULATOR.display_version', `${sim.display_version} vs ${expected}`);
    check(/^V\d{2,3}$/.test(sim.release_version), 'preview keeps the Open label in release_version', sim.release_version);
  }
  check(html.includes("$('release-version').textContent=FM1_SIMULATOR.display_version||"), 'badge script reads display_version');
} else {
  console.log('skip build/preview/index.html (not built)');
}

console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
