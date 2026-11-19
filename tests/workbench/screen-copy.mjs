// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/screen-copy.mjs — the device-against-simulator screen comparison, tested without a device
//
// Purpose
//   tools/linux/screens.mjs --match compares the pictures tools/linux/hw/run-screen.py reads from the device (the
//   screen copy, remote command 29 {19}) with the simulator's. Here the simulator plays the device (--pretend: it
//   waits as the device does and lets the song run on while a picture is read), so that the comparison itself is
//   tested on every suite run:
//     1. every picture of the tour is found again by the simulator, at rest and while playing, pixel for pixel;
//     2. one changed pixel outside the masks makes the comparison fail and names the page;
//     3. a changed pixel inside a mask (a level meter) does not.
//
//   node tests/workbench/screen-copy.mjs        (after make web)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-19  First version (tabby-v1.2).
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' - ' + detail : ''}`); if (!ok) failures++; };
const dir = 'build/screen-copy-test';
rmSync(dir, { recursive: true, force: true });
const run = (...a) => spawnSync('node', ['tools/linux/screens.mjs', ...a], { encoding: 'utf8' });
let r = run('--pretend', dir);
check(r.status === 0, 'the simulator gives the tour\'s pictures as a device would', (r.stdout + r.stderr).trim().split('\n').pop());
r = run('--match', dir);
const last = r.stdout.trim().split('\n').pop();
const m = /PASS screen: (\d+) of (\d+) pictures.*\((\d+) while playing\)/.exec(last) || [];
check(r.status === 0 && m[1] === m[2] && Number(m[2]) >= 40 && Number(m[3]) >= 20, 'every picture is found again pixel for pixel, at rest and while playing', last);
const poke = (name, x, y) => { const f = `${dir}/${name}.rgb565`, b = readFileSync(f), o = 2 * (y * 240 + x); const old = [b[o], b[o + 1]]; b[o] ^= 0x1f; writeFileSync(f, b); return () => { const c = readFileSync(f); c[o] = old[0]; c[o + 1] = old[1]; writeFileSync(f, c); }; };
let undo = poke('clips-playing', 200, 150);
r = run('--match', dir);
check(r.status === 1 && /FAIL clips-playing: 1 of 57600 pixels differ/.test(r.stdout), 'one changed pixel fails the comparison and names the page', (r.stdout.match(/FAIL clips-playing[^\n]*/) || [''])[0]);
undo();
undo = poke('home-playing', 60, 71);   /* inside track 1's level meter */
r = run('--match', dir);
check(r.status === 0 && /ok   home-playing: 0 of \d+ pixels differ \(\d+ left out/.test(r.stdout), 'a changed pixel inside a named mask (a level meter) is left out, and the line says what was left out', (r.stdout.match(/ok   home-playing[^\n]*/) || [''])[0].slice(0, 150));
undo();
console.log(failures ? `${failures} FAILED` : 'all checks passed');
process.exit(failures ? 1 : 0);
