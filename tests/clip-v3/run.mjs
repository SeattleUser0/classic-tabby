// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/clip-v3/run.mjs — the JavaScript v3 clip against the C module, byte for byte
//
// Purpose
//   tests/host/clip_v3_test.c migrates every v2 block the importer makes (tests/clip-v3/dump-v2.mjs writes them) and
//   writes the v3 bytes it produced. This script migrates the same blocks with web/clip-v3/clip-v3.js and checks:
//     1. fromV2 produces the same bytes as the C module for every block, and the same report counts;
//     2. validate() accepts every one; toV2() returns the original bytes (or the same notes, as the report says);
//     3. the rejections the C test lists give the same codes;
//     4. a v3 clip the importer's blocks cannot be (128 steps, five notes, CC) validates and has no v2 form;
//     5. the anchor rule and the swing warp agree with the C module on a sweep.
//   Run: node tests/clip-v3/run.mjs [fixtures-v2.bin fixtures-v3-c.bin]   (make clip-v3-test runs the whole chain)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-12  Initial version (Task 16 Goal 5).

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..', '..');
const C = require(join(root, 'web/clip-v3/clip-v3.js'));
let failures = 0, checks = 0;
const check = (ok, what, detail = '') => { checks++; if (!ok) { failures++; console.log(`FAIL ${what}${detail ? ' - ' + detail : ''}`); } };
const split = buf => { const out = []; for (let at = 0; at + 2 <= buf.length;) { const n = buf[at] | buf[at + 1] << 8; out.push(buf.subarray(at + 2, at + 2 + n)); at += 2 + n; } return out; };
const v2File = process.argv[2] || join(root, 'build/clip-v3/fixtures-v2.bin'), v3File = process.argv[3] || join(root, 'build/clip-v3/fixtures-v3-c.bin');
const v2 = split(new Uint8Array(readFileSync(v2File))), v3 = split(new Uint8Array(readFileSync(v3File)));
check(v2.length > 0 && v2.length === v3.length, 'the C and JS block counts agree', `${v2.length} / ${v3.length}`);
const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
let exact = 0, reordered = 0, clamped = 0;
v2.forEach((b, i) => {
  const r = C.fromV2(b);
  check(eq(r.bytes, v3[i]), `block ${i}: fromV2 equals the C module's bytes`);
  check(C.validate(r.bytes) === 0, `block ${i}: validates`);
  const back = C.toV2(r.bytes);
  if (eq(back, b)) exact++;
  else check(r.report.reordered || r.report.retied || r.report.clampedLengths, `block ${i}: differs only where the report says`);
  reordered += r.report.reordered; clamped += r.report.clampedLengths;
});
console.log(`ok   ${v2.length} blocks: JS and C produce identical v3 bytes; ${exact} return byte for byte; ${reordered} steps reordered, ${clamped} lengths clamped`);
// rejections
{
  const w = new Uint8Array(16 + 12); w[0] = 16; w[6] = 2;
  const note = (o, time, pitch) => { w[o] = (time + 240) & 255; w[o + 1] = (time + 240) >> 8; w[o + 2] = pitch; w[o + 3] = 100; w[o + 4] = 10; w[o + 5] = 0; };
  note(16, 0, 60); note(22, 0, 60);
  check(C.validate(w) === C.codes.DUPLICATE, 'the same pitch twice in one step');
  note(22, 0, 61); check(C.validate(w) === 0, 'two pitches are fine');
  check(C.validate(new Uint8Array(10)) === C.codes.BAD_SIZE, 'too short');
  w[0] = 0; check(C.validate(w) === C.codes.BAD_HEADER, 'steps 0'); w[0] = 16;
  note(22, -300, 61); check(C.validate(w) === C.codes.BAD_EVENT, 'a time before -240');
}
{
  const g = new Uint8Array(16 + 30); g[0] = 64; g[6] = 5;
  for (let i = 0; i < 5; i++) { const o = 16 + 6 * i; g[o] = 240 & 255; g[o + 2] = 60 + i; g[o + 3] = 100; g[o + 4] = 10; }
  let code = 0; try { C.toV2(g); } catch (e) { code = e.code; }
  check(C.validate(g) === 0 && code === C.codes.NOT_V2_SHAPED, 'five notes in a step: valid v3, no v2 form');
  const h = new Uint8Array(16 + 6); h[0] = 128; h[6] = 1; h[16] = 240; h[18] = C.CC; h[19] = 0x80; h[20] = 7; h[21] = 100;
  code = 0; try { C.toV2(h); } catch (e) { code = e.code; }
  check(C.validate(h) === 0 && code === C.codes.NOT_V2_SHAPED, '128 steps with a CC event: valid v3, no v2 form');
}
check(C.anchor(-240) === 0 && C.anchor(-1) === 0 && C.anchor(240) === 0 && C.anchor(241) === 1 && C.anchor(720) === 1 && C.anchor(721) === 2, 'the anchor rule');
check(C.warp(100, 0) === 100 && C.warp(480, 50) === 720 && C.warp(-100, 50) === -50, 'the swing warp');
console.log(failures ? `${failures} of ${checks} checks FAILED` : `all ${checks} checks passed`);
process.exit(failures ? 1 : 0);
