/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/timed-note/timed-note.js — the timed note, JavaScript twin of app/timed_note.h
 *
 * Purpose
 *   The same object, the same 6 bytes and the same rules as the C module, for the
 *   workbench (song editor, .tabby files), the MIDI importer and the tests:
 *     { pitch 0..127, velocity 1..127, retrigger true|false, offset -240..240 (units),
 *       length 1..8388480 (units) }
 *   1 unit = 1/480 of a 16th step. The byte layout, the canonical mantissa/exponent rule
 *   and the validation are in docs/TIMED-NOTE.md; tests/timed-note/vectors.txt pins this
 *   file and the C file to identical bytes (tests/timed-note/run.mjs and
 *   tests/host/timed_note_test.c).
 *
 *   Loading: classic script (globalThis.TabbyTimedNote) and CommonJS (module.exports). No
 *   dependency.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-03  Initial version (Task 05, checkpoint a).
 */
(() => {
  'use strict';

  const BYTES = 6, UNITS_PER_STEP = 480, UNITS_PER_QUARTER = 1920, OFFSET_MAX = 240;
  const MANTISSA_MAX = 65535, EXPONENT_MAX = 7, LENGTH_MAX = 65535 * 128;   /* 8388480 */

  const fail = text => { throw new Error(text); };

  /* 1 when every field is inside its range; the length need not be representable. */
  function valid(n) {
    return !!n && Number.isInteger(n.pitch) && n.pitch >= 0 && n.pitch <= 127 &&
      Number.isInteger(n.velocity) && n.velocity >= 1 && n.velocity <= 127 &&
      (n.retrigger === true || n.retrigger === false || n.retrigger === 0 || n.retrigger === 1 || n.retrigger === undefined) &&
      Number.isInteger(n.offset) && n.offset >= -OFFSET_MAX && n.offset <= OFFSET_MAX &&
      Number.isInteger(n.length) && n.length >= 1 && n.length <= LENGTH_MAX;
  }
  /* Mantissa and exponent: the smallest exponent whose mantissa fits 16 bits after
   * rounding to the nearest multiple of 2^e (ties up); a rounded 65536 moves to the next
   * exponent as 32768. */
  function split(length) {
    for (let e = 0; ; e++) {
      const half = e ? 2 ** (e - 1) : 0, m = Math.floor((length + half) / 2 ** e);
      if (m <= MANTISSA_MAX || e === EXPONENT_MAX) return { m: Math.min(m, MANTISSA_MAX), e };
    }
  }
  /* The length the encoder stores: itself up to 65535, else the nearest representable
   * value; 0 stays 0 (invalid), values above the maximum come back as the maximum. */
  function lengthStored(length) {
    if (!(length >= 1)) return 0;
    if (length >= LENGTH_MAX) return LENGTH_MAX;
    const { m, e } = split(Math.round(length));
    return m * 2 ** e;
  }
  /* Canonical 6 bytes for a valid note (length rounded as above); throws when invalid. */
  function encode(n) {
    if (!valid(n)) fail('invalid timed note');
    const { m, e } = split(n.length);
    const w = (n.offset & 0x1ff) | (e << 9);
    return Uint8Array.from([n.pitch | (n.retrigger ? 128 : 0), n.velocity, w & 255, w >> 8, m & 255, m >> 8]);
  }
  /* The note from 6 bytes (any array-like of 6 numbers); throws for a reserved bit set,
   * velocity 0, mantissa 0, a non-canonical exponent or an offset outside the range. */
  function decode(b) {
    if (!b || b.length < BYTES) fail('timed note needs 6 bytes');
    const w = b[2] | (b[3] << 8), e = (w >> 9) & 7, m = b[4] | (b[5] << 8), raw = w & 0x1ff;
    if ((b[1] & 128) || (w & 0xf000)) fail('timed note: reserved bit set');
    if (!(b[1] & 127) || !m || (e && m < 32768)) fail('timed note: velocity 0, mantissa 0 or non-canonical exponent');
    const offset = raw >= 256 ? raw - 512 : raw;
    if (offset < -OFFSET_MAX || offset > OFFSET_MAX) fail('timed note: offset outside ±240');
    return { pitch: b[0] & 127, velocity: b[1] & 127, retrigger: !!(b[0] & 128), offset, length: m * 2 ** e };
  }
  /* Readable forms for the editor: a reduced fraction of a step and milliseconds at a tempo. */
  function offsetFraction(units) {
    if (!units) return '0';
    const g = (a, b) => b ? g(b, a % b) : a, d = g(Math.abs(units), UNITS_PER_STEP);
    return (units < 0 ? '-' : '+') + (Math.abs(units) / d) + '/' + (UNITS_PER_STEP / d);
  }
  const unitMs = bpm => 60000 / (bpm * 4 * UNITS_PER_STEP);

  const TabbyTimedNote = { BYTES, UNITS_PER_STEP, UNITS_PER_QUARTER, OFFSET_MAX, MANTISSA_MAX, EXPONENT_MAX, LENGTH_MAX,
    valid, lengthStored, encode, decode, offsetFraction, unitMs, version: '0.1' };
  globalThis.TabbyTimedNote = TabbyTimedNote;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyTimedNote;
})();
