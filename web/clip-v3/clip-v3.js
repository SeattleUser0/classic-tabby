/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/clip-v3/clip-v3.js — the v3 clip, JavaScript twin of app/clip_v3.h
 *
 * Purpose
 *   The same bytes and rules as the C module (docs/CLIP-V3.md), for the workbench reader and writer, the MIDI
 *   importer and the tests. Operates on Uint8Array payloads and plain objects:
 *     validate(bytes)  -> 0 or a negative code (the C codes)
 *     fromV2(bytes)    -> { bytes, report } (v2 payload -> v3 payload), throws on a bad source
 *     toV2(bytes)      -> v2 payload, or throws with code -2 when a v2 grid cannot hold the clip
 *     events(bytes)    -> [{ time, kind, a, b, retrigger, length }]
 *     anchor(time), warp(time, swing)
 *   tests/clip-v3/run.mjs checks fromV2 / toV2 / validate byte for byte against the C module's output on the
 *   importer's blocks. Loading: classic script (globalThis.TabbyClipV3) and CommonJS. Needs TabbyTimedNote (loaded
 *   first, or required) for the 6-byte note of v2.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-12  Initial version (Task 16 Goal 5; not released).
 */
(() => {
  'use strict';
  const TN = (typeof module !== 'undefined' && module.exports) ? require('../timed-note/timed-note.js') : globalThis.TabbyTimedNote;
  const HEADER = 16, EVENT = 6, EVENTS_MAX = 512, STEPS_MAX = 128, BIAS = 240, UNITS = 480, PAIR = 960, LENGTH_MAX = 65535;
  const NOTE = 0, CC = 1, PC = 2, BEND = 3, PRESSURE = 4, STEPMOD = 8;
  const OK = 0, BAD_SIZE = -1, NOT_V2_SHAPED = -2, BAD_HEADER = -3, BAD_EVENT = -4, BAD_ORDER = -5, DUPLICATE = -6, NO_ROOM = -7, BAD_SOURCE = -8;
  const get16 = (p, i) => p[i] | p[i + 1] << 8;
  const put16 = (p, i, v) => { p[i] = v & 255; p[i + 1] = (v >> 8) & 255; };
  const fail = (code, text) => { const e = new Error(text + ' (clip v3 code ' + code + ')'); e.code = code; throw e; };

  const anchor = time => { const s = Math.trunc((time + 239) / UNITS); return time + 239 < 0 ? 0 : Math.max(0, s); };
  const warp = (t, s) => {
    if (!s) return t;
    if (t < 0) return Math.trunc(t * (100 - s) / 100);
    const pair = Math.trunc(t / PAIR), x = t % PAIR;
    const w = x < UNITS ? Math.trunc(x * (100 + s) / 100) : Math.trunc(UNITS * (100 + s) / 100) + Math.trunc((x - UNITS) * (100 - s) / 100);
    return pair * PAIR + w;
  };
  function event(p, i) {
    const e = p.subarray(HEADER + EVENT * i, HEADER + EVENT * (i + 1)), time = get16(e, 0) - BIAS;
    if (!(e[3] & 0x80)) return { time, kind: NOTE, a: e[2] & 127, b: e[3] & 127, retrigger: e[2] >> 7, length: get16(e, 4) };
    return { time, kind: e[2], a: e[4], b: e[5], retrigger: 0, length: 0 };
  }
  const events = p => { const out = []; for (let i = 0; i < get16(p, 6); i++) out.push(event(p, i)); return out; };

  function validate(p) {
    if (p.length < HEADER) return BAD_SIZE;
    const steps = p[0], flags = p[1], count = get16(p, 6);
    if (count > EVENTS_MAX || p.length !== HEADER + EVENT * count) return BAD_SIZE;
    if (steps < 1 || steps > STEPS_MAX || (flags & ~3) || p[2] > 127 || p[3] > 127 || p[4] > 127 || p[5]) return BAD_HEADER;
    if (!(flags & 1) && p[2]) return BAD_HEADER;
    if (!(flags & 2) && (p[3] || p[4])) return BAD_HEADER;
    for (let i = 8; i < HEADER; i++) if (p[i]) return BAD_HEADER;
    let last = -BIAS - 1, groupAnchor = -1, groupStart = 0;
    const maxTime = steps * UNITS - BIAS;
    for (let i = 0; i < count; i++) {
      const e = p.subarray(HEADER + EVENT * i), time = get16(e, 0) - BIAS;
      if (time < -BIAS || time > maxTime) return BAD_EVENT;
      if (time < last) return BAD_ORDER;
      last = time;
      if (!(e[3] & 0x80)) {
        if (!(e[3] & 127) || !get16(e, 4)) return BAD_EVENT;
        const a = anchor(time);
        if (a !== groupAnchor) { groupAnchor = a; groupStart = i; }
        for (let k = groupStart; k < i; k++) {
          const q = p.subarray(HEADER + EVENT * k);
          if (!(q[3] & 0x80) && (q[2] & 127) === (e[2] & 127) && anchor(get16(q, 0) - BIAS) === a) return DUPLICATE;
        }
      } else {
        const type = e[2];
        if (e[3] & 127) return BAD_EVENT;
        if (type === CC || type === BEND) { if (e[4] > 127 || e[5] > 127) return BAD_EVENT; }
        else if (type === PC || type === PRESSURE) { if (e[4] > 127 || e[5]) return BAD_EVENT; }
        else if (type === STEPMOD) { if (e[4] > 15 || e[5] >= steps || time !== e[5] * UNITS - BIAS) return BAD_EVENT; }
        else return BAD_EVENT;
      }
    }
    return OK;
  }

  function fromV2(v2) {
    const report = { clampedLengths: 0, retied: 0, reordered: 0, stepModifiers: 0 };
    const w = []; let at = 0;
    for (let step = 0; step < 64; step++) {
      if (at >= v2.length) fail(BAD_SOURCE, 'v2 payload ends early');
      const head = v2[at++], count = head & 7, prob = (head >> 3) & 7, tune = (head >> 6) & 1;
      if (count > 4 || (head & 0x80) || at + 6 * count > v2.length) fail(BAD_SOURCE, 'bad v2 step header');
      if (prob || tune) { w.push({ time: step * UNITS - BIAS, step, kind: STEPMOD, a: prob | tune << 3, b: step, retrigger: 0, length: 0 }); report.stepModifiers++; }
      for (let i = 0; i < count; i++, at += 6) {
        const n = TN.decode(v2.subarray(at, at + 6));
        if (step > 0 && n.offset === -BIAS) report.retied++;
        let length = n.length;
        if (length > LENGTH_MAX) { length = LENGTH_MAX; report.clampedLengths++; }
        w.push({ time: step * UNITS + n.offset, step, kind: NOTE, a: n.pitch, b: n.velocity, retrigger: n.retrigger ? 1 : 0, length });
      }
    }
    if (at !== v2.length) fail(BAD_SOURCE, 'v2 payload has trailing bytes');
    if (w.length > EVENTS_MAX) fail(NO_ROOM, 'more than 512 events');
    const moved = new Set();
    for (let i = 1; i < w.length; i++) {          /* the same stable insertion sort as the C module */
      const x = w[i]; let j = i;
      while (j > 0 && w[j - 1].time > x.time) {
        if (w[j - 1].kind === NOTE && x.kind === NOTE && w[j - 1].step === x.step) moved.add(x.step);
        w[j] = w[j - 1]; j--;
      }
      w[j] = x;
    }
    report.reordered = moved.size;
    const out = new Uint8Array(HEADER + EVENT * w.length);
    out[0] = 64; put16(out, 6, w.length);
    w.forEach((x, i) => {
      const o = HEADER + EVENT * i;
      put16(out, o, x.time + BIAS);
      if (x.kind === NOTE) { out[o + 2] = x.a | x.retrigger << 7; out[o + 3] = x.b; put16(out, o + 4, x.length); }
      else { out[o + 2] = x.kind; out[o + 3] = 0x80; out[o + 4] = x.a; out[o + 5] = x.b; }
    });
    return { bytes: out, report };
  }

  function toV2(p) {
    const r = validate(p);
    if (r) fail(r, 'invalid v3 clip');
    const steps = p[0], list = events(p);
    if (steps > 64 || p[1]) fail(NOT_V2_SHAPED, 'a v2 block holds at most 64 steps and no header program or bank');
    const perStep = new Array(64).fill(0), head = new Array(64).fill(0);
    for (const e of list) {
      if (e.kind === NOTE) { const a = anchor(e.time); if (a >= 64 || perStep[a] >= 4) fail(NOT_V2_SHAPED, 'more than four notes in a step'); perStep[a]++; }
      else if (e.kind === STEPMOD) head[e.b] = (e.a & 7) << 3 | ((e.a >> 3) & 1) << 6;
      else fail(NOT_V2_SHAPED, 'controller events have no v2 form');
    }
    const out = []; 
    for (let s = 0; s < 64; s++) {
      out.push(perStep[s] | head[s]);
      for (const e of list) if (e.kind === NOTE && anchor(e.time) === s)
        out.push(...TN.encode({ pitch: e.a, velocity: e.b, retrigger: !!e.retrigger, offset: e.time - s * UNITS, length: e.length }));
    }
    return Uint8Array.from(out);
  }

  const TabbyClipV3 = { HEADER, EVENT, EVENTS_MAX, STEPS_MAX, BIAS, NOTE, CC, PC, BEND, PRESSURE, STEPMOD,
    codes: { OK, BAD_SIZE, NOT_V2_SHAPED, BAD_HEADER, BAD_EVENT, BAD_ORDER, DUPLICATE, NO_ROOM, BAD_SOURCE },
    validate, fromV2, toV2, events, anchor, warp, version: '0.1' };
  globalThis.TabbyClipV3 = TabbyClipV3;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyClipV3;
})();
