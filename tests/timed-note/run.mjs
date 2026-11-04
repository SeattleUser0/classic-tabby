// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/timed-note/run.mjs — the JavaScript timed note against the shared vectors
//
// Purpose
//   Every line of tests/timed-note/vectors.txt (written by make-vectors.py from the format
//   document, not from this code) is checked against web/timed-note/timed-note.js:
//     ok        encode(fields) === bytes and decode(bytes) deep-equals fields;
//     bad       decode(bytes) throws;
//     badfields encode(fields) throws (and valid() is false);
//     round     lengthStored(length) === stored, and encode/decode of a note with that length
//               round-trips to the stored value.
//   Then a few properties beyond the file: every offset −240..240 round-trips; every exponent
//   0..7 at both mantissa ends round-trips; byte equality means value equality (two
//   different values never share bytes across the file's ok vectors).
//   tests/host/timed_note_test.c runs the same file against the C module.
//
//   Run:  /usr/bin/node tests/timed-note/run.mjs      (or: make timed-note-test)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-03  Initial version (Task 05, checkpoint a).

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const T = require(join(here, '..', '..', 'web/timed-note/timed-note.js'));
let failures = 0, checks = 0;
const check = (ok, what) => { checks++; if (!ok) { failures++; console.log('FAIL ' + what); } };
const hex = b => Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
const fromHex = s => Uint8Array.from(s.match(/../g), x => parseInt(x, 16));

const lines = readFileSync(join(here, 'vectors.txt'), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
let counts = { ok: 0, bad: 0, badfields: 0, round: 0 };
const seen = new Map();
for (const line of lines) {
  const f = line.split(/\s+/);
  if (f[0] === 'ok') {
    const n = { pitch: +f[1], velocity: +f[2], retrigger: !!+f[3], offset: +f[4], length: +f[5] }, want = f[7];
    let got = null; try { got = hex(T.encode(n)); } catch (e) { got = 'throw: ' + e.message; }
    check(got === want, `ok ${line}: encode gave ${got}`);
    let back = null; try { back = T.decode(fromHex(want)); } catch (e) { back = { error: e.message }; }
    check(JSON.stringify(back) === JSON.stringify(n), `ok ${line}: decode gave ${JSON.stringify(back)}`);
    check(T.valid(n), `ok ${line}: valid()`);
    const key = JSON.stringify(n);
    check(!seen.has(want) || seen.get(want) === key, `ok ${line}: bytes ${want} already stand for ${seen.get(want)}`);
    seen.set(want, key);
    counts.ok++;
  } else if (f[0] === 'bad') {
    let threw = false; try { T.decode(fromHex(f[1])); } catch (_) { threw = true; }
    check(threw, `bad ${f[1]}: decode accepted it`);
    counts.bad++;
  } else if (f[0] === 'badfields') {
    const n = { pitch: +f[1], velocity: +f[2], retrigger: +f[3], offset: +f[4], length: +f[5] };
    let threw = false; try { T.encode(n); } catch (_) { threw = true; }
    check(threw && !T.valid(n), `badfields ${line}: accepted`);
    counts.badfields++;
  } else if (f[0] === 'round') {
    const length = +f[1], want = +f[3];
    check(T.lengthStored(length) === want, `round ${line}: lengthStored gave ${T.lengthStored(length)}`);
    if (length <= T.LENGTH_MAX) {                       /* above the maximum the encoder refuses (the importer clips first) */
      const back = T.decode(T.encode({ pitch: 60, velocity: 100, retrigger: false, offset: 0, length }));
      check(back.length === want, `round ${line}: encode/decode gave ${back.length}`);
    } else { let threw = false; try { T.encode({ pitch: 60, velocity: 100, retrigger: false, offset: 0, length }); } catch (_) { threw = true; } check(threw, `round ${line}: a length above the maximum must be refused`); }
    counts.round++;
  } else check(false, 'unknown vector line: ' + line);
}
/* Properties beyond the file. */
for (let o = -240; o <= 240; o++) check(T.decode(T.encode({ pitch: 1, velocity: 1, retrigger: false, offset: o, length: 1 })).offset === o, 'offset ' + o + ' round trip');
for (let e = 0; e <= 7; e++) for (const m of [e ? 32768 : 1, 65535]) {
  const length = m * 2 ** e, back = T.decode(T.encode({ pitch: 1, velocity: 1, retrigger: true, offset: 0, length }));
  check(back.length === length && back.retrigger === true, `exponent ${e} mantissa ${m} round trip`);
}
check(T.lengthStored(0) === 0 && T.lengthStored(T.LENGTH_MAX + 5) === T.LENGTH_MAX, 'lengthStored at the ends');
check(T.offsetFraction(20) === '+1/24' && T.offsetFraction(-240) === '-1/2' && T.offsetFraction(0) === '0', 'offsetFraction');
check(Math.abs(T.unitMs(120) - 0.2604) < 0.001, 'unitMs(120)');
console.log(`timed-note (JS): ${counts.ok} ok, ${counts.bad} bad, ${counts.badfields} badfields, ${counts.round} round vectors; ${checks} checks, ${failures} failed`);
process.exit(failures ? 1 : 0);
