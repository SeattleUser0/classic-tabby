/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/rig/rig.js — the rig profile: which device sits on which MIDI channel
 *
 * Purpose
 *   Task 04. A rig profile ("tabby-rig/1") maps the 16 MIDI channels to device
 *   definitions from the device library (web/rig/device-library.js), with a per-channel
 *   display name, a gap override (ms, or null = the definition's own delay need) and
 *   user-named programs for devices without a published list (H90 Programs, M8
 *   instruments, Skiff sounds). The global profile is kept in the browser (localStorage)
 *   and can be exported / imported as JSON; a song may carry its own copy as an override
 *   (the `.tabby` trailer, section 9.11 v0.6), which the row event editor then uses.
 *
 *   Gaps: the firmware knows nothing about devices; a device's delay need becomes type-3
 *   gap events in the record (9.11). `applyGaps(events, rig, library)` rewrites a song's
 *   event list for writing: it drops the gap events it finds and inserts, per channel
 *   whose device asks for one, a gap after the program change (gapAfter "program") or
 *   between the bank select and the program change (gapAfter "bank": a bank+program
 *   event is split into control-change events, the gap, then the program change). Reading
 *   a record back keeps whatever gaps it holds; the editor shows them greyed and
 *   regenerates them at the next write.
 *
 *   Lead before the bar (Task 06, 9.13): a channel's `leadMs` (default 0) is how long before
 *   the bar its program change must have left, for slow devices. It becomes a trailing gap
 *   event on that channel after the channel's last program event of the row: the firmware
 *   starts a row's stream (or a track's launch stream) `lead` blocks early, where lead is the
 *   sum of the gaps, so the program change leaves that long before the downbeat. The trailing
 *   gap is max(leadMs, the device's gap after the program); gaps carry the channel of the
 *   event they belong to, which the firmware's per-track slices use.
 *
 *   Loading: classic script (globalThis.TabbyRig) and CommonJS.
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-04  Task 06: per-channel leadMs, the trailing gap kept for a lead.
 *   v0.1  2026-11-02  Initial version (Task 04, workbench part).
 */
(() => {
  'use strict';

  const SCHEMA = 'tabby-rig/1', STORAGE_KEY = 'classic-tabby-rig';
  const devices = () => globalThis.TabbyDevices || (typeof require === 'function' ? require('./device-library.js') : null);

  function rigEmpty() {
    return { schema: SCHEMA, name: 'My rig', channels: Array.from({ length: 16 }, () => ({ device: null, name: '', gapMs: null, leadMs: 0, programs: {} })) };
  }
  /* Validate and normalise a profile object (from storage, a file or a trailer). */
  function rigNormalize(data) {
    if (!data || data.schema !== SCHEMA || !Array.isArray(data.channels) || data.channels.length !== 16) throw new Error('not a tabby-rig/1 profile');
    const rig = rigEmpty();
    rig.name = typeof data.name === 'string' ? data.name.slice(0, 40) : rig.name;
    data.channels.forEach((c, i) => {
      const ch = rig.channels[i];
      if (c && typeof c === 'object') {
        ch.device = typeof c.device === 'string' && c.device ? c.device : null;
        ch.name = typeof c.name === 'string' ? c.name.slice(0, 40) : '';
        ch.gapMs = Number.isInteger(c.gapMs) && c.gapMs >= 0 && c.gapMs <= 255 ? c.gapMs : null;
        ch.leadMs = Number.isInteger(c.leadMs) && c.leadMs >= 0 && c.leadMs <= 255 ? c.leadMs : 0;   /* Task 06: lead before the bar */
        ch.programs = {};
        for (const [k, v] of Object.entries(c.programs || {})) if (/^\d{1,3}$/.test(k) && Number(k) <= 127 && typeof v === 'string') ch.programs[k] = v.slice(0, 40);
      }
    });
    return rig;
  }
  function rigLoad() {
    try { const text = globalThis.localStorage && localStorage.getItem(STORAGE_KEY); if (text) return rigNormalize(JSON.parse(text)); } catch (_) { /* fall through */ }
    return rigEmpty();
  }
  function rigSave(rig) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rigNormalize(rig))); } catch (_) { /* private mode: keep in memory */ } }
  function rigExport(rig) { return JSON.stringify(rigNormalize(rig), null, 1); }
  function rigImport(text) { return rigNormalize(typeof text === 'string' ? JSON.parse(text) : text); }
  function rigClone(rig) { return rigNormalize(JSON.parse(JSON.stringify(rig))); }

  /* The definition on a channel (0..15), or null. */
  function deviceOn(rig, library, channel) {
    const id = rig.channels[channel] && rig.channels[channel].device;
    return id && library ? library.get(id) : null;
  }
  function channelLabel(rig, library, channel) {
    const d = deviceOn(rig, library, channel), c = rig.channels[channel];
    return (channel + 1) + (c.name ? ' ' + c.name : d ? ' ' + d.name : '');
  }
  function gapFor(rig, library, channel) {
    const c = rig.channels[channel], d = deviceOn(rig, library, channel);
    if (c.gapMs !== null) return c.gapMs;
    return d ? d.programChange.gapMs : 0;
  }
  /* Task 06: the channel's lead before the bar in ms (0 = none). */
  function leadFor(rig, channel) { const c = rig.channels[channel]; return c && c.leadMs ? c.leadMs : 0; }
  /* Program name for the editor: the rig's own name first, then the definition's list. */
  function programName(rig, library, channel, bank, program) {
    const c = rig.channels[channel], own = c.programs[String(program)];
    if (own) return own;
    const d = deviceOn(rig, library, channel);
    return d ? devices().presetName(d, bank, program) : null;
  }

  /* Rewrite the event list for writing: gaps from the rig (see the header). Events keep
   * their row order; within a row, the stream order is kept and gaps are inserted after
   * the program events that need them. */
  function applyGaps(events, rig, library) {
    const out = [];
    for (const e of events) {
      if (e.type === 3) continue;                       /* regenerated below */
      const d = deviceOn(rig, library, e.channel), gap = gapFor(rig, library, e.channel);
      const after = d ? d.programChange.gapAfter : 'program';
      if (!gap || (e.type !== 0 && e.type !== 1)) { out.push({ ...e }); continue; }
      if (e.type === 1 && after === 'bank' && (e.d0 !== 255 || e.d1 !== 255)) {
        if (e.d0 !== 255) out.push({ row: e.row, channel: e.channel, type: 2, d0: 0, d1: e.d0, d2: 0 });
        if (e.d1 !== 255) out.push({ row: e.row, channel: e.channel, type: 2, d0: 32, d1: e.d1, d2: 0 });
        out.push({ row: e.row, channel: e.channel, type: 3, d0: gap, d1: 0, d2: 0 });
        out.push({ row: e.row, channel: e.channel, type: 0, d0: e.d2, d1: 0, d2: 0 });
      } else {
        out.push({ ...e });
        out.push({ row: e.row, channel: e.channel, type: 3, d0: gap, d1: 0, d2: 0 });
      }
    }
    /* Task 06: a channel with a lead ends its events of a row with a gap of at least the lead
     * (after its last program event), kept even when it ends the row's stream. */
    const kept = new Set();
    for (let i = 0; i < out.length; i++) {
      const e = out[i];
      if (e.type !== 0 && e.type !== 1) continue;
      const lead = leadFor(rig, e.channel);
      if (!lead) continue;
      let last = i;
      for (let j = i + 1; j < out.length && out[j].row === e.row; j++) if (out[j].channel === e.channel) last = j;
      if (last !== i && out.slice(i + 1, last + 1).some(x => x.channel === e.channel && (x.type === 0 || x.type === 1))) continue;   /* a later program event of the channel carries the lead */
      if (out[last].type === 3) { out[last].d0 = Math.max(out[last].d0, lead); kept.add(out[last]); }
      else { const g = { row: e.row, channel: e.channel, type: 3, d0: lead, d1: 0, d2: 0 }; out.splice(last + 1, 0, g); kept.add(g); }
    }
    /* A gap that ends a row's stream waits for nothing unless it is a lead: drop the others. */
    return out.filter((e, i) => kept.has(e) || !(e.type === 3 && (i === out.length - 1 || out[i + 1].row !== e.row)));
  }
  /* Human text for one event, with the rig's vocabulary. */
  function describe(e, rig, library) {
    const d = deviceOn(rig, library, e.channel), D = devices();
    if (e.type === 3) return 'gap ' + e.d0 + ' ms';
    if (e.type === 2) {
      const c = d ? D.controller(d, e.d0) : null, v = d ? D.valueName(d, e.d0, e.d1) : null;
      return 'CC ' + e.d0 + (c ? ' ' + c.name : '') + ' = ' + e.d1 + (v ? ' (' + v + ')' : '');
    }
    const bank = e.type === 1 ? (d ? D.bankFromBytes(d, e.d0 === 255 ? null : e.d0, e.d1 === 255 ? null : e.d1) : null) : null;
    const program = e.type === 1 ? e.d2 : e.d0;
    const label = d ? D.programLabel(d, bank, program) : String(program), name = programName(rig, library, e.channel, bank, program);
    const bankText = e.type === 1 ? ' (bank' + (e.d0 !== 255 ? ' MSB ' + e.d0 : '') + (e.d1 !== 255 ? ' LSB ' + e.d1 : '') + ')' : '';
    return 'program ' + label + (name ? ' "' + name + '"' : '') + ' [PC ' + program + ']' + bankText;
  }

  const TabbyRig = { SCHEMA, STORAGE_KEY, rigEmpty, rigNormalize, rigLoad, rigSave, rigExport, rigImport, rigClone, deviceOn, channelLabel, gapFor, leadFor, programName, applyGaps, describe, version: '0.2' };
  globalThis.TabbyRig = TabbyRig;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyRig;
})();
