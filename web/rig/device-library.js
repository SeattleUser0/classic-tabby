/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/rig/device-library.js — the device library: definitions, validation, numbering
 *
 * Purpose
 *   Task 04 keeps all device knowledge in the workbench. A definition is a JSON document
 *   ("tabby-device/1", one per device under web/devices/, written by
 *   tools/linux/devices-from-sources.py from manufacturer documents) that says how a
 *   device numbers its programs, how it selects banks, which controllers it names, what
 *   must be set on the device, where every fact comes from, and which fields could not be
 *   verified. This module validates definitions against the schema below and turns them
 *   into the vocabulary the row event editor shows: display numbers, bank values, preset
 *   and controller names.
 *
 *   Definition (tabby-device/1):
 *     schema "tabby-device/1", version, id (file name), name, maker,
 *     channel: { default: null | 1..16, note },
 *     programChange: { supported: true | false | "unverified", displayBase: 0 | 1,
 *                      programs (per bank), bankFormat: "none" | "letter" | "hundreds",
 *                      pad (display digits), displayHex (optional),
 *                      bankSelect: { scheme: "none" | "cc0" | "cc32" | "cc0cc32",
 *                                    banks: [{ index, name, msb: null | 0..127, lsb: null | 0..127 }] },
 *                      gapMs: 0..255, gapAfter: "bank" | "program", note },
 *     presets: [{ bank: null | bank index, program: 0..127 (MIDI number) or null when the
 *                 preset has no direct MIDI number (Proteus 128..383: only through its
 *                 program map), number? (the device's own number), name, category? }],
 *     controllers: [{ cc: 0..127 (or -1 = "no fixed map" note), name, min, max, values? }],
 *     setup: [text], notes: [text], sources: [{ title, url, detail }], unverified: [text]
 *
 *   Display numbering: the device shows a program as
 *     bankLabel + pad(displayBase + program + bankIndex × stride)
 *   where bankFormat "letter" gives the bank's name as label (Blofeld "A001"), "hundreds"
 *   folds the bank into the number with stride 100 (Pulse 2 "102" = bank 1 program 1) and
 *   "none" shows the number alone ("000" Proteus, "12" H90, "001" Zoom); displayHex shows
 *   two hex digits (M8 "INST 0A").
 *
 *   Loading: classic script (globalThis.TabbyDevices) and CommonJS (module.exports). In the
 *   workbench the definitions arrive inlined by tools/linux/build-web.py as
 *   `globalThis.FM1_DEVICES` (an array) and in Node from the files.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-02  Initial version (Task 04, workbench part).
 */
(() => {
  'use strict';

  const SCHEMA = 'tabby-device/1';
  const BANK_SCHEMES = ['none', 'cc0', 'cc32', 'cc0cc32'], BANK_FORMATS = ['none', 'letter', 'hundreds'];

  const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const isText = v => typeof v === 'string';

  /* Validate one definition. Returns { ok, errors } with every problem listed. */
  function validateDevice(d) {
    const errors = [], err = t => errors.push(t);
    if (!d || typeof d !== 'object') return { ok: false, errors: ['not an object'] };
    if (d.schema !== SCHEMA) err('schema must be ' + SCHEMA);
    for (const k of ['id', 'name', 'maker', 'version']) if (!isText(d[k]) || !d[k]) err(k + ' must be a non-empty string');
    if (isText(d.id) && !/^[a-z0-9-]+$/.test(d.id)) err('id must be lower-case letters, digits and dashes');
    if (!d.channel || typeof d.channel !== 'object') err('channel missing');
    else {
      if (d.channel.default !== null && !isInt(d.channel.default, 1, 16)) err('channel.default must be null or 1..16');
      if (!isText(d.channel.note)) err('channel.note must be text');
    }
    const p = d.programChange;
    if (!p || typeof p !== 'object') err('programChange missing');
    else {
      if (![true, false, 'unverified'].includes(p.supported)) err('programChange.supported must be true, false or "unverified"');
      if (![0, 1].includes(p.displayBase)) err('programChange.displayBase must be 0 or 1');
      if (!isInt(p.programs, 0, 65535)) err('programChange.programs must be 0..65535');
      if (!BANK_FORMATS.includes(p.bankFormat)) err('programChange.bankFormat invalid');
      if (!isInt(p.pad, 0, 4)) err('programChange.pad must be 0..4');
      if (p.displayHex !== undefined && typeof p.displayHex !== 'boolean') err('programChange.displayHex must be boolean');
      if (!isInt(p.gapMs, 0, 255)) err('programChange.gapMs must be 0..255');
      if (!['bank', 'program'].includes(p.gapAfter)) err('programChange.gapAfter must be bank or program');
      if (!isText(p.note)) err('programChange.note must be text');
      const b = p.bankSelect;
      if (!b || !BANK_SCHEMES.includes(b.scheme) || !Array.isArray(b.banks)) err('programChange.bankSelect invalid');
      else {
        if (b.scheme === 'none' && b.banks.length) err('bank scheme none must have no banks');
        if (b.scheme !== 'none' && !b.banks.length) err('bank scheme ' + b.scheme + ' needs banks');
        b.banks.forEach((bank, i) => {
          if (bank.index !== i) err('bank ' + i + ' index must be ' + i);
          if (!isText(bank.name) || !bank.name) err('bank ' + i + ' needs a name');
          if (bank.msb !== null && !isInt(bank.msb, 0, 127)) err('bank ' + i + ' msb must be null or 0..127');
          if (bank.lsb !== null && !isInt(bank.lsb, 0, 127)) err('bank ' + i + ' lsb must be null or 0..127');
          if ((b.scheme === 'cc0' || b.scheme === 'cc0cc32') && bank.msb === null) err('bank ' + i + ' needs msb for scheme ' + b.scheme);
          if ((b.scheme === 'cc32' || b.scheme === 'cc0cc32') && bank.lsb === null) err('bank ' + i + ' needs lsb for scheme ' + b.scheme);
        });
        if (p.bankFormat === 'letter' && b.scheme === 'none') err('bankFormat letter needs banks');
      }
    }
    if (!Array.isArray(d.presets)) err('presets must be an array');
    else {
      const seen = new Set();
      d.presets.forEach((x, i) => {
        if (!x || typeof x !== 'object') { err('preset ' + i + ' invalid'); return; }
        const banks = (p && p.bankSelect && p.bankSelect.banks) || [];
        if (x.bank !== null && !(isInt(x.bank, 0, banks.length - 1))) err('preset ' + i + ' bank ' + x.bank + ' not in bankSelect.banks');
        if (x.program === null ? !isInt(x.number, 0, 65535) : !isInt(x.program, 0, 127)) err('preset ' + i + ' program must be 0..127, or null with a device number');
        if (!isText(x.name) || !x.name) err('preset ' + i + ' needs a name');
        const key = x.bank + ':' + (x.program === null ? 'n' + x.number : x.program);
        if (seen.has(key)) err('preset ' + i + ' duplicates ' + key);
        seen.add(key);
      });
    }
    if (!Array.isArray(d.controllers)) err('controllers must be an array');
    else d.controllers.forEach((c, i) => {
      if (!c || !isInt(c.cc, -1, 127)) err('controller ' + i + ' cc must be -1..127');
      if (!isText(c.name) || !c.name) err('controller ' + i + ' needs a name');
      if (!isInt(c.min, 0, 127) || !isInt(c.max, 0, 127) || c.min > c.max) err('controller ' + i + ' min/max invalid');
      if (c.values !== undefined) {
        if (!c.values || typeof c.values !== 'object') err('controller ' + i + ' values must be an object');
        else for (const k of Object.keys(c.values)) if (!/^\d{1,3}$/.test(k) || !isInt(Number(k), 0, 127) || !isText(c.values[k])) err('controller ' + i + ' value ' + k + ' invalid');
      }
    });
    for (const k of ['setup', 'notes', 'unverified']) {
      if (!Array.isArray(d[k]) || d[k].some(t => !isText(t))) err(k + ' must be an array of text');
    }
    if (!Array.isArray(d.sources) || !d.sources.length) err('sources must list at least one source');
    else d.sources.forEach((s, i) => { if (!s || !isText(s.title) || !isText(s.url) || !isText(s.detail)) err('source ' + i + ' needs title, url, detail'); });
    return { ok: !errors.length, errors };
  }

  /* ---- numbering ----------------------------------------------------------------------- */
  const pad = (n, width) => String(n).padStart(width, '0');
  /* What the device shows for MIDI program `program` in bank `bank` (index or null). */
  function programLabel(d, bank, program) {
    const p = d.programChange, banks = p.bankSelect.banks;
    if (p.displayHex) return pad(program.toString(16).toUpperCase(), Math.max(2, p.pad));
    if (p.bankFormat === 'letter') return (bank !== null && banks[bank] ? banks[bank].name : '') + pad(p.displayBase + program, p.pad);
    if (p.bankFormat === 'hundreds') return pad(p.displayBase + program + (bank !== null ? bank : 0) * (p.programs || 100), p.pad);
    return pad(p.displayBase + program, p.pad);
  }
  /* The MIDI number a displayed program number means (bankFormat none / hundreds). */
  function programFromLabel(d, label) {
    const p = d.programChange, text = String(label).trim().toUpperCase();
    if (p.displayHex) { const n = parseInt(text.replace(/^INST\s*/, ''), 16); return Number.isInteger(n) && n >= 0 && n <= 127 ? { bank: null, program: n } : null; }
    if (p.bankFormat === 'letter') {
      const m = text.match(/^([A-Z])\s*(\d+)$/); if (!m) return null;
      const bank = p.bankSelect.banks.findIndex(b => b.name.toUpperCase() === m[1]), program = Number(m[2]) - p.displayBase;
      return bank >= 0 && program >= 0 && program <= 127 ? { bank, program } : null;
    }
    const n = Number(text.replace(/^P/, '')); if (!Number.isInteger(n)) return null;
    if (p.bankFormat === 'hundreds') {
      const stride = p.programs || 100, rel = n - p.displayBase, bank = Math.floor(rel / stride), program = rel - bank * stride;
      return rel >= 0 && bank < p.bankSelect.banks.length && program <= 127 ? { bank, program } : null;
    }
    const program = n - p.displayBase;
    return program >= 0 && program <= 127 ? { bank: null, program } : null;
  }
  /* Bank select bytes for a bank index: { msb, lsb } with null for "not sent". */
  function bankBytes(d, bank) {
    const b = d.programChange.bankSelect;
    if (b.scheme === 'none' || bank === null || !b.banks[bank]) return { msb: null, lsb: null };
    return { msb: b.scheme === 'cc32' ? null : b.banks[bank].msb, lsb: b.scheme === 'cc0' ? null : b.banks[bank].lsb };
  }
  /* The bank index a pair of bank bytes selects, or null. */
  function bankFromBytes(d, msb, lsb) {
    const b = d.programChange.bankSelect;
    if (b.scheme === 'none') return null;
    const i = b.banks.findIndex(x => (b.scheme === 'cc32' || x.msb === null || msb === null || x.msb === msb) && (b.scheme === 'cc0' || x.lsb === null || lsb === null || x.lsb === lsb));
    return i >= 0 ? i : null;
  }
  function presetName(d, bank, program) {
    const x = d.presets.find(p => p.program === program && (p.bank === null ? bank === null || bank === 0 || d.programChange.bankSelect.scheme === 'none' : p.bank === bank));
    return x ? x.name : null;
  }
  function controller(d, cc) { return d.controllers.find(c => c.cc === cc) || null; }
  function valueName(d, cc, value) {
    const c = controller(d, cc); if (!c || !c.values) return null;
    const keys = Object.keys(c.values).map(Number).sort((a, b) => a - b);
    let best = null; for (const k of keys) if (k <= value) best = k;
    return best === null ? null : c.values[String(best)];
  }

  /* The library: definitions by id, validated. `defs` is an array of definition objects. */
  function load(defs) {
    const byId = new Map(), problems = [];
    for (const d of defs || []) {
      const v = validateDevice(d);
      if (!v.ok) { problems.push({ id: d && d.id, errors: v.errors }); continue; }
      if (byId.has(d.id)) { problems.push({ id: d.id, errors: ['duplicate id'] }); continue; }
      byId.set(d.id, d);
    }
    return { byId, list: [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)), problems,
      get(id) { return byId.get(id) || null; } };
  }

  const TabbyDevices = { SCHEMA, validateDevice, load, programLabel, programFromLabel, bankBytes, bankFromBytes, presetName, controller, valueName, version: '0.1' };
  globalThis.TabbyDevices = TabbyDevices;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyDevices;
})();
