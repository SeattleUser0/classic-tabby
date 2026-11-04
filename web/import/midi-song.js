/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/midi-song.js — map a parsed MIDI file onto a Classic Tabby song
 *
 * Purpose
 *   Two stages, both pure functions (no DOM, no device):
 *
 *   analyze(parsed)  — from the output of midi-parse.js: the first tempo and time signature,
 *       later changes (ignored at conversion), the "parts" (one per MIDI track × channel
 *       that holds notes) with name, note count, pitch range and bar span, everything the
 *       format cannot hold (CCs, bends, pressure, program changes, SysEx) counted, the bar
 *       length in 16th steps, the total length in bars and the row lengths that stay on bar
 *       lines (16, 32, 48 or 64 steps).
 *
 *   convert(analysis, options) — the mapping rules approved after the Task 02 Step 1 report,
 *   with the Task 05 timing rules (section 9.12):
 *       * time is kept exactly, in units of 1/480 step (1/1920 quarter): a note belongs to
 *         the 16th step nearest its start (a start exactly half a step late belongs to the
 *         earlier step) and carries the signed offset from it; its length is end − start in
 *         units (at least 1). PPQ values that divide 1920 convert exactly; others are rounded
 *         to the nearest unit and reported (kind ppqRounded);
 *       * quantize (option, off by default): 'starts' moves every start to its step (offset
 *         0, length kept), 'startsEnds' also rounds lengths to whole steps with the length
 *         rule 'nearest' (default), 'up' (never shorter) or 'down' (never longer); the
 *         'moved' and 'lengthRounded' warnings then list what changed;
 *       * notes outside the chosen bar range are dropped, notes ending past it are clipped;
 *       * same pitch overlapping on one track: the earlier note is clipped to end where the
 *         next one starts; two same-pitch notes anchored on one step keep the louder
 *         (retrigger bit never set);
 *       * more than 4 notes starting on one step on one track: keep the 4 'loudest' (default,
 *         tie → higher pitch), 'highest' or 'lowest';
 *       * tempo: the file's first tempo, rounded to an integer BPM and clamped to 30..300,
 *         becomes the song tempo override; later tempo events are listed and ignored;
 *       * rows: one row per `rowSteps` steps from the start of the bar range (4 bars of 4/4 =
 *         64; 3/4 → 48; see analyze().rowSteps); every row gets that step length (section 9.5
 *         v0.3 row byte 10); blocks are 64 steps and steps beyond rowSteps stay empty;
 *       * deduplication: identical block payloads share one id (0 = silent cell, never
 *         stored); consecutive identical rows merge into one row with a repeat count ≤ 64;
 *       * loose deduplication (option, off by default): a cell whose notes match an existing
 *         block in step, pitch and length, with every velocity within ±tolerance (default 8)
 *         of that block's, reuses the block; the stored block keeps the first cell's
 *         velocities. Every such merge is listed in the warnings (kind looseMerged);
 *       * limits: more than 128 rows or 2048 blocks is an error (narrow the bar range).
 *       Everything dropped or changed goes into a warning list with counts and positions.
 *
 *   Loading: classic script (globalThis.TabbyMidiSong) and CommonJS; needs song-format.js
 *   (globalThis.TabbySongFormat or require) for block encoding, keys and usage.
 *
 * Version: 0.5
 *
 * Revision log
 *   v0.5  2026-11-03  Task 05: exact timing (offsets and unit lengths), quantize as an option,
 *                     PPQ rounding report, warnings only for real changes.
 *   v0.4  2026-11-02  Task 04: controls collected with their file order, row events.
 *   v0.3  2026-11-02  Loose deduplication option (velocity tolerance); block limit 2048
 *                     (section 9 v0.4).
 *   v0.2  2026-11-02  Row step length stored per row (row.steps) instead of song.rowSteps,
 *                     following section 9 v0.3.
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2).
 */
(() => {
  'use strict';

  const fail = (text, code) => { const e = new Error(text); if (code) e.code = code; throw e; };
  const format = () => globalThis.TabbySongFormat || (typeof require === 'function' ? require('./song-format.js') : fail('song-format.js not loaded'));

  const EPS = 1e-6;
  /* Nearest step with ties toward the earlier step (2.5 → 2). */
  const nearest = x => { const s = Math.floor(x); return s + (x - s > 0.5 + EPS ? 1 : 0); };
  const roundEnd = { nearest, up: x => Math.ceil(x - EPS), down: x => Math.floor(x + EPS) };

  /* 1-based bar / beat / sixteenth of an absolute step for messages. */
  function position(step, barSteps) {
    const inBar = ((step % barSteps) + barSteps) % barSteps;
    return { bar: Math.floor(step / barSteps) + 1, beat: Math.floor(inBar / 4) + 1, sixteenth: inBar % 4 + 1 };
  }
  const where = (step, barSteps) => { const p = position(step, barSteps); return 'bar ' + p.bar + ', beat ' + p.beat + '.' + p.sixteenth; };

  /* Warning collector: one entry per kind with a count and the first items. */
  const MAX_ITEMS = 200;
  class Warnings {
    constructor() { this.map = new Map(); }
    add(kind, severity, message, item) {
      let w = this.map.get(kind);
      if (!w) { w = { kind, severity, message, count: 0, items: [] }; this.map.set(kind, w); }
      w.count++;
      if (item !== undefined && w.items.length < MAX_ITEMS) w.items.push(item);
      return w;
    }
    list() { return [...this.map.values()].sort((a, b) => (a.severity === 'warn' ? 0 : 1) - (b.severity === 'warn' ? 0 : 1) || b.count - a.count); }
  }

  /* Row lengths (steps) that are whole bars and that the row format allows; the default is
   * the one closest to 4 bars (ties → longer). */
  function rowStepsFor(barSteps) {
    const allowed = format().LIMITS.rowStepsAllowed;
    const candidates = allowed.filter(n => barSteps > 0 && n % barSteps === 0).map(n => ({ steps: n, bars: n / barSteps }));
    if (!candidates.length) return { candidates: [{ steps: 64, bars: 64 / barSteps }], default: 64, aligned: false };
    const best = candidates.slice().sort((a, b) => Math.abs(a.bars - 4) - Math.abs(b.bars - 4) || b.bars - a.bars)[0];
    return { candidates, default: best.steps, aligned: true };
  }

  /* ---- stage 1: analyze --------------------------------------------------------------- */
  function analyze(parsed) {
    const division = parsed.division;
    const toStep = tick => tick * 4 / division;                  /* exact position in 16ths */
    /* Task 05: positions in units (1/1920 quarter). Exact when the PPQ divides 1920; else
     * rounded to the nearest unit, counted for the ppqRounded warning. */
    const exactPpq = 1920 % division === 0;
    const toUnits = tick => Math.round(tick * 1920 / division);
    const unitError = tick => Math.abs(tick * 1920 / division - toUnits(tick));
    const tempos = [], meters = [], ignored = { controlChange: 0, sustain: 0, pitchBend: 0, polyPressure: 0, channelPressure: 0, programChange: [], sysex: 0, meta: 0, markers: [] };
    const programs = new Map();                                  /* "track:channel" → [programs] */
    const controls = [];                                         /* every CC, for row events (Task 04) */
    let seq = 0;                                                 /* file order across the two lists */
    parsed.tracks.forEach((track, ti) => {
      for (const e of track.events) {
        switch (e.type) {
          case 'tempo': tempos.push({ tick: e.tick, track: ti, bpm: e.bpm }); break;
          case 'timeSignature': meters.push({ tick: e.tick, track: ti, numerator: e.numerator, denominator: e.denominator }); break;
          case 'controlChange': ignored.controlChange++; if (e.controller === 64) ignored.sustain++;
            controls.push({ track: ti, channel: e.channel, controller: e.controller, value: e.value, tick: e.tick, seq: seq++ }); break;   /* Task 04 */
          case 'pitchBend': ignored.pitchBend++; break;
          case 'polyPressure': ignored.polyPressure++; break;
          case 'channelPressure': ignored.channelPressure++; break;
          case 'programChange': { ignored.programChange.push({ track: ti, channel: e.channel, program: e.program, tick: e.tick, seq: seq++ });
            const k = ti + ':' + e.channel; if (!programs.has(k)) programs.set(k, []); programs.get(k).push(e.program); break; }
          case 'sysex': ignored.sysex++; break;
          case 'marker': ignored.markers.push({ tick: e.tick, text: e.text }); break;
          case 'meta': case 'lyric': case 'keySignature': case 'instrumentName': ignored.meta++; break;
          default: break;
        }
      }
    });
    tempos.sort((a, b) => a.tick - b.tick || a.track - b.track);
    meters.sort((a, b) => a.tick - b.tick || a.track - b.track);
    const L = format().LIMITS;
    const firstTempo = tempos[0] || null;
    const bpmExact = firstTempo ? firstTempo.bpm : 120;
    const bpmRounded = Math.round(bpmExact), bpm = Math.min(L.tempoMax, Math.max(L.tempoMin, bpmRounded));
    /* Only real changes count: Renoise and others repeat the same tempo at pattern starts. */
    const tempoChanges = [];
    let lastBpm = bpmExact;
    for (const t of tempos.slice(1)) if (Math.abs(t.bpm - lastBpm) > 0.005) { tempoChanges.push(t); lastBpm = t.bpm; }
    const meter = meters[0] ? { numerator: meters[0].numerator, denominator: meters[0].denominator } : { numerator: 4, denominator: 4 };
    const meterChanges = [];
    let lastMeter = meter;
    for (const m of meters.slice(1)) if (m.numerator !== lastMeter.numerator || m.denominator !== lastMeter.denominator) { meterChanges.push(m); lastMeter = m; }
    const barStepsExact = 16 * meter.numerator / meter.denominator;
    const barSteps = Number.isInteger(barStepsExact) && barStepsExact >= 1 && barStepsExact <= 64 ? barStepsExact : 0;
    const errors = [];
    if (!barSteps) errors.push('time signature ' + meter.numerator + '/' + meter.denominator + ' gives ' + barStepsExact + ' 16th steps per bar; only whole bars of 1..64 steps are supported');
    const bs = barSteps || 16;
    /* Parts: one per (track, channel) with notes. */
    const parts = [];
    parsed.tracks.forEach((track, ti) => {
      for (const channel of track.channels) {
        const notes = track.notes.filter(n => n.channel === channel);
        if (!notes.length) continue;
        let low = 127, high = 0, first = Infinity, lastEnd = 0;
        for (const n of notes) { low = Math.min(low, n.pitch); high = Math.max(high, n.pitch); first = Math.min(first, n.tick); lastEnd = Math.max(lastEnd, n.endTick); }
        const baseName = track.name || ('Track ' + (ti + 1));
        parts.push({ key: ti + ':' + channel, trackIndex: ti, channel, drums: channel === 9,
          name: track.channels.length > 1 ? baseName + ' ch' + (channel + 1) : baseName,
          noteCount: notes.length, low, high, firstBar: position(nearest(toStep(first)), bs).bar,
          lastBar: Math.max(1, Math.ceil((toStep(lastEnd) - EPS) / bs)), programs: programs.get(ti + ':' + channel) || [], notes });
      }
    });
    const totalStepsExact = Math.max(0, ...parts.map(p => toStep(Math.max(...p.notes.map(n => n.endTick)))));
    const totalBars = Math.max(1, Math.ceil((totalStepsExact - EPS) / bs));
    const steps = s => ({ step: nearest(toStep(s)), ...position(nearest(toStep(s)), bs) });
    return { format: parsed.format, division, trackCount: parsed.tracks.length, fileWarnings: parsed.warnings,
      tempo: { exact: bpmExact, rounded: bpmRounded, bpm, present: !!firstTempo, changes: tempoChanges.map(t => ({ ...t, ...steps(t.tick) })) },
      meter: { ...meter, barSteps, changes: meterChanges.map(m => ({ ...m, ...steps(m.tick) })) },
      barSteps, totalBars, totalSteps: Math.ceil(totalStepsExact - EPS), parts, ignored, controls,
      rowSteps: rowStepsFor(bs), errors, toStep, toUnits, exactPpq, unitError };
  }

  /* ---- stage 2: convert ---------------------------------------------------------------- */
  const overflowOrder = {
    loudest: (a, b) => b.velocity - a.velocity || b.pitch - a.pitch,
    highest: (a, b) => b.pitch - a.pitch || b.velocity - a.velocity,
    lowest: (a, b) => a.pitch - b.pitch || b.velocity - a.velocity,
  };

  function defaultAssignments(analysis) {
    const a = {};
    analysis.parts.forEach((p, i) => { a[p.key] = i < 8 ? i : null; });
    return a;
  }

  function convert(analysis, options = {}) {
    const F = format(), L = F.LIMITS;
    if (analysis.errors.length) fail(analysis.errors[0], 'meter');
    const barSteps = analysis.barSteps, w = new Warnings();
    const barFrom = Math.max(1, Math.floor(options.barFrom || 1));
    const barTo = Math.min(Math.max(barFrom, Math.floor(options.barTo || analysis.totalBars)), 100000);
    const rowSteps = options.rowSteps || analysis.rowSteps.default;
    if (!L.rowStepsAllowed.includes(rowSteps)) fail('row length must be 16, 32, 48 or 64 steps', 'options');
    const lengthRule = options.lengthRule || 'nearest', overflowRule = options.overflowRule || 'loudest';
    const quantize = options.quantize || 'off';                   /* Task 05: 'off' (exact), 'starts', 'startsEnds' */
    if (!['off', 'starts', 'startsEnds'].includes(quantize)) fail('unknown quantize mode ' + quantize, 'options');
    const loose = !!options.looseDedup, tolerance = Number.isInteger(options.velocityTolerance) ? options.velocityTolerance : 8;
    if (loose && (tolerance < 0 || tolerance > 126)) fail('velocity tolerance must be 0..126', 'options');
    if (!roundEnd[lengthRule]) fail('unknown length rule ' + lengthRule, 'options');
    if (!overflowOrder[overflowRule]) fail('unknown overflow rule ' + overflowRule, 'options');
    const assignments = options.assignments || defaultAssignments(analysis);
    const rangeStart = (barFrom - 1) * barSteps, rangeEnd = barTo * barSteps;
    const toStep = analysis.toStep, toUnits = analysis.toUnits, U = L.unitsPerStep, HALF = L.offsetMax;
    const TN = globalThis.TabbyTimedNote || (typeof require === 'function' ? require('../timed-note/timed-note.js') : fail('timed-note.js not loaded'));
    const msPerUnit = 60000 / (analysis.tempo.bpm * 4 * U);
    /* Row events (Task 04, 9.11): pre-roll window before a row start, in steps. */
    const preRoll = options.preRoll === 'none' ? 0 : options.preRoll === 'bar' ? barSteps : 4;
    if (!['none', 'beat', 'bar', undefined].includes(options.preRoll)) fail('unknown pre-roll ' + options.preRoll, 'options');

    /* Row events (Task 04): a program change, bank select or control change in the window
     * [start(R) − preRoll, start(R) + ½ step) of an expanded row R becomes an event of that
     * row; CC 0 / CC 32 right before a program change on the same channel inside the window
     * merge into one bank+program event. Row indices are expanded rows here and mapped to
     * the merged rows below (a row with events is never merged into a repeat). */
    const rowStepsExact = rowSteps, eventTaken = new Set();
    let eventTakenCC = 0;
    const rowOf = step => { const rel = step - rangeStart; const R = Math.round(rel / rowStepsExact); const d = rel - R * rowStepsExact; return (d >= -preRoll && d < 0.5 && R >= 0 && R * rowStepsExact < rangeEnd - rangeStart) ? R : -1; };
    const byRow = new Map();
    const pending = new Map();                                       /* channel → { msb, lsb } seen before a PC */
    const everything = [...analysis.ignored.programChange.map(p => ({ ...p, kind: 'pc' })), ...(analysis.controls || []).map(c => ({ ...c, kind: 'cc' }))].sort((a, b) => a.tick - b.tick || a.seq - b.seq);   /* file order inside a tick */
    for (const ev of everything) {
      const R = rowOf(toStep(ev.tick));
      if (R < 0) continue;
      if (ev.kind === 'cc' && (ev.controller === 0 || ev.controller === 32)) {
        const p = pending.get(ev.channel) || { row: R, msb: 255, lsb: 255, items: [] };
        if (p.row !== R) { p.row = R; p.msb = 255; p.lsb = 255; p.items = []; }
        if (ev.controller === 0) p.msb = ev.value; else p.lsb = ev.value;
        p.items.push(ev); pending.set(ev.channel, p); continue;
      }
      if (!byRow.has(R)) byRow.set(R, []);
      if (ev.kind === 'pc') {
        const p = pending.get(ev.channel);
        if (p && p.row === R && (p.msb !== 255 || p.lsb !== 255)) { byRow.get(R).push({ channel: ev.channel, type: 1, d0: p.msb, d1: p.lsb, d2: ev.program, tick: ev.tick }); p.items.forEach(x => eventTaken.add(x)); eventTakenCC += p.items.length; pending.delete(ev.channel); }
        else byRow.get(R).push({ channel: ev.channel, type: 0, d0: ev.program, d1: 0, d2: 0, tick: ev.tick });
        eventTaken.add(ev);
      } else { byRow.get(R).push({ channel: ev.channel, type: 2, d0: ev.controller, d1: ev.value, d2: 0, tick: ev.tick }); eventTaken.add(ev); eventTakenCC++; }
    }
    for (const [R, list] of byRow) if (list.length > L.rowEventsMax) { w.add('eventsOverflow', 'warn', 'More than 32 events at one row start; the extra ones were dropped', { text: 'row ' + (R + 1) }); list.length = L.rowEventsMax; }

    /* Non-conversion warnings first: file-level things that are ignored. */
    if (!analysis.tempo.present) w.add('noTempo', 'info', 'The file has no tempo event; 120 BPM is used');
    if (analysis.tempo.present && Math.abs(analysis.tempo.exact - analysis.tempo.rounded) > 0.005) w.add('tempoRounded', 'info', 'Tempo ' + analysis.tempo.exact.toFixed(3) + ' BPM rounded to ' + analysis.tempo.rounded);
    if (analysis.tempo.bpm !== analysis.tempo.rounded) w.add('tempoClamped', 'warn', 'Tempo ' + analysis.tempo.rounded + ' BPM is outside 30..300 and was clamped to ' + analysis.tempo.bpm);
    for (const t of analysis.tempo.changes) w.add('tempoChangesIgnored', 'warn', 'Tempo changes ignored (the song keeps the first tempo)', { text: t.bpm.toFixed(2) + ' BPM at ' + where(t.step, barSteps) });
    for (const m of analysis.meter.changes) w.add('meterChangesIgnored', 'warn', 'Time signature changes ignored (rows follow the first signature)', { text: m.numerator + '/' + m.denominator + ' at ' + where(m.step, barSteps) });
    if (!analysis.rowSteps.aligned) w.add('meterUnaligned', 'warn', 'No row length of 16/32/48/64 steps holds whole bars of ' + barSteps + ' steps; rows do not start on bar lines');
    const ig = analysis.ignored;
    if (ig.controlChange - eventTakenCC) w.add('ccIgnored', 'info', (ig.controlChange - eventTakenCC) + ' control change event(s) away from a row start dropped' + (ig.sustain ? ' (' + ig.sustain + ' sustain pedal)' : ''));
    if (ig.pitchBend) w.add('pitchBendIgnored', 'info', ig.pitchBend + ' pitch bend event(s) ignored');
    if (ig.polyPressure + ig.channelPressure) w.add('pressureIgnored', 'info', (ig.polyPressure + ig.channelPressure) + ' aftertouch event(s) ignored');
    for (const p of ig.programChange) if (!eventTaken.has(p)) w.add('programIgnored', 'info', 'Program changes away from a row start dropped (only events at or just before a row start become row events)', { text: 'track ' + (p.track + 1) + ' ch' + (p.channel + 1) + ' program ' + (p.program + 1) + ' at ' + where(nearest(toStep(p.tick)), barSteps) });
    if (ig.sysex) w.add('sysexIgnored', 'info', ig.sysex + ' SysEx event(s) ignored');
    if (ig.meta) w.add('metaIgnored', 'info', ig.meta + ' other meta event(s) ignored');
    for (const f of analysis.fileWarnings || []) w.add('file:' + f.kind, 'warn', f.message);

    /* Gather notes per Tabby track, in units (Task 05). */
    const perTrack = Array.from({ length: 8 }, () => []);
    const usedParts = [];
    let notesIn = 0, ppqRounded = 0, ppqWorst = 0;
    const timeOf = n => n.start * U + n.offset;                          /* a note's start in units from bar 1 */
    for (const part of analysis.parts) {
      const t = assignments[part.key];
      if (t === null || t === undefined || t === '' || t === 'skip') { w.add('partsSkipped', 'info', 'MIDI parts not assigned to a track were skipped', { text: part.name + ' (' + part.noteCount + ' notes)' }); continue; }
      if (!Number.isInteger(Number(t)) || t < 0 || t > 7) fail('part ' + part.name + ' assigned to an invalid track', 'options');
      usedParts.push({ part, track: Number(t) });
      for (const n of part.notes) {
        notesIn++;
        if (!analysis.exactPpq) { const e = Math.max(analysis.unitError(n.tick), analysis.unitError(n.endTick)); if (e > 1e-9) { ppqRounded++; ppqWorst = Math.max(ppqWorst, e); } }
        const su = toUnits(n.tick), eu = toUnits(n.endTick);
        /* Anchor: the nearest step; exactly half a step late stays with the earlier step (+240). */
        const anchor = Math.floor((su + HALF - 1) / U);
        let offset = su - anchor * U, length = Math.max(1, eu - su);
        const xs = toStep(n.tick), xe = toStep(n.endTick);
        if (quantize !== 'off' && offset) { w.add('moved', 'info', 'Note starts moved to the 16th grid', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) + ' moved ' + ((anchor - xs) * 0.25).toFixed(3) + ' beats' }); offset = 0; }
        if (quantize === 'startsEnds') {
          let end = roundEnd[lengthRule](xe), steps = end - anchor;
          if (steps < 1) { steps = 1; if (xe - xs > EPS) w.add('lengthMin', 'info', 'Notes shorter than a step got length 1', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) }); }
          else if (Math.abs((xe - xs) - steps) > EPS) w.add('lengthRounded', 'info', 'Note lengths rounded to whole steps (' + lengthRule + ')', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) + ': ' + ((xe - xs) * 0.25).toFixed(3) + ' → ' + (steps * 0.25).toFixed(2) + ' beats' });
          length = steps * U;
        }
        if (anchor < rangeStart || anchor >= rangeEnd) { w.add('droppedRange', 'info', 'Notes outside bars ' + barFrom + '..' + barTo + ' dropped', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) }); continue; }
        if (anchor * U + offset + length > rangeEnd * U) { length = Math.max(1, rangeEnd * U - anchor * U - offset); w.add('clippedRange', 'info', 'Notes ending after bar ' + barTo + ' clipped', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) }); }
        if (length > L.lengthMax) { w.add('lengthClipped', 'warn', 'Notes longer than ' + (L.lengthMax / U).toFixed(0) + ' steps clipped', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) + ': ' + (length / U).toFixed(2) + ' steps' }); length = L.lengthMax; }
        const stored = TN.lengthStored(length);
        if (stored !== length) w.add('lengthScaled', 'info', 'Notes longer than 136 steps are stored to within the exponent scale (2..128 units)', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) + ': ' + length + ' → ' + stored + ' units' });
        perTrack[t].push({ start: anchor, offset, length: stored, pitch: n.pitch, velocity: n.velocity, part: part.name });
      }
    }
    if (!usedParts.length) fail('No MIDI part is assigned to a track', 'empty');
    if (!analysis.exactPpq) w.add('ppqRounded', ppqRounded ? 'warn' : 'info', 'The file\'s ' + analysis.division + ' ticks per quarter note do not divide 1920: note times were rounded to the nearest 1/480 step' + (ppqRounded ? ' (' + ppqRounded + ' note(s), at most ' + ppqWorst.toFixed(2) + ' units = ' + (ppqWorst * msPerUnit).toFixed(2) + ' ms)' : ' (no note was affected)'));

    /* Per track: same-pitch overlaps (in units), then the 4-per-step limit (per anchor step). */
    for (let t = 0; t < 8; t++) {
      const notes = perTrack[t];
      notes.sort((a, b) => timeOf(a) - timeOf(b) || a.pitch - b.pitch || b.velocity - a.velocity);
      const byPitch = new Map();
      for (const n of notes) { if (!byPitch.has(n.pitch)) byPitch.set(n.pitch, []); byPitch.get(n.pitch).push(n); }
      const drop = new Set();
      for (const list of byPitch.values()) {
        let prev = null;
        for (const cur of list) {
          if (prev && cur.start === prev.start) {           /* same anchor step, same pitch: keep the louder (9.12 forbids both) */
            const loser = cur.velocity > prev.velocity ? prev : cur;
            drop.add(loser); w.add('duplicateDropped', 'warn', 'Same pitch twice on one step on one track; the quieter note was dropped', { track: t + 1, text: loser.part + ' pitch ' + loser.pitch + ' at ' + where(loser.start, barSteps) });
            if (loser === prev) prev = cur; continue;
          }
          if (prev && timeOf(prev) + prev.length > timeOf(cur)) {
            const clipped = Math.max(1, timeOf(cur) - timeOf(prev));
            w.add('overlapClipped', 'info', 'Same pitch overlapping on one track; the earlier note was shortened', { track: t + 1, text: prev.part + ' pitch ' + prev.pitch + ' at ' + where(prev.start, barSteps) + ': ' + (prev.length / U).toFixed(3) + ' → ' + (clipped / U).toFixed(3) + ' steps' });
            prev.length = clipped;
          }
          prev = cur;
        }
      }
      let kept = notes.filter(n => !drop.has(n));
      const byStep = new Map();
      for (const n of kept) { if (!byStep.has(n.start)) byStep.set(n.start, []); byStep.get(n.start).push(n); }
      for (const [step, list] of byStep) {
        if (list.length <= L.notesPerStep) continue;
        list.sort(overflowOrder[overflowRule]);
        for (const n of list.slice(L.notesPerStep)) { drop.add(n); w.add('overflowDropped', 'warn', 'More than 4 notes on one step on one track; kept the 4 ' + overflowRule + ' notes', { track: t + 1, text: n.part + ' pitch ' + n.pitch + ' velocity ' + n.velocity + ' at ' + where(step, barSteps) }); }
      }
      perTrack[t] = notes.filter(n => !drop.has(n));
    }
    const notesOut = perTrack.reduce((n, l) => n + l.length, 0);
    if (!notesOut) fail('No notes fall inside bars ' + barFrom + '..' + barTo, 'empty');

    /* Grid: rows × tracks → note lists in block coordinates. */
    const rowCount = Math.ceil((rangeEnd - rangeStart) / rowSteps);
    const grid = Array.from({ length: rowCount }, () => Array.from({ length: 8 }, () => []));
    for (let t = 0; t < 8; t++) for (const n of perTrack[t]) {
      const rel = n.start - rangeStart, row = Math.floor(rel / rowSteps);
      grid[row][t].push({ step: rel % rowSteps, pitch: n.pitch, velocity: n.velocity, offset: n.offset, length: n.length, retrigger: false });
    }
    /* Deduplicate blocks and build rows. Exact first (identical bytes); then, in loose mode,
     * a block with the same notes whose velocities are all within the tolerance. */
    const pool = new Map(), byShape = new Map(), blocks = [];
    let looseMerges = 0;
    const rowsExpanded = grid.map((cells, rowIndex) => cells.map((notes, t) => {
      if (!notes.length) return 0;
      const sorted = F.sortNotes(notes), key = F.blockKey(sorted);
      let id = pool.get(key);
      if (!id && loose) {
        const shape = F.structuralKey(sorted);
        for (const candidate of byShape.get(shape) || []) {
          let worst = 0;
          for (let i = 0; i < sorted.length; i++) worst = Math.max(worst, Math.abs(sorted[i].velocity - candidate.notes[i].velocity));
          if (worst <= tolerance) {
            id = candidate.id; looseMerges++;
            w.add('looseMerged', 'warn', 'Blocks merged by loose matching (same notes, velocities within ±' + tolerance + '); the shared block keeps the first block\'s velocities',
              { track: t + 1, text: 'row ' + (rowIndex + 1) + ' (bars ' + (barFrom + rowIndex * rowSteps / barSteps) + '..' + (barFrom + (rowIndex + 1) * rowSteps / barSteps - 1) + ') uses block ' + id + ', largest velocity difference ' + worst });
            break;
          }
        }
      }
      if (!id) {
        id = blocks.length + 1; pool.set(key, id);
        const block = { id, notes: sorted }; blocks.push(block);
        if (loose) { const shape = F.structuralKey(sorted); if (!byShape.has(shape)) byShape.set(shape, []); byShape.get(shape).push(block); }
      }
      return id;
    }));
    const rows = [], events = [];
    rowsExpanded.forEach((ids, expanded) => {
      const last = rows[rows.length - 1], hasEvents = byRow.has(expanded) && byRow.get(expanded).length > 0;
      if (last && !hasEvents && last.repeat < L.repeatMax && last.blocks.every((id, t) => id === ids[t])) { last.repeat++; return; }
      rows.push({ blocks: ids, repeat: 1, loopHere: false, steps: rowSteps });
      if (hasEvents) for (const e of byRow.get(expanded)) events.push({ row: rows.length - 1, channel: e.channel, type: e.type, d0: e.d0, d1: e.d1, d2: e.d2 });
    });
    if (events.length > L.eventsMax) fail('The song needs ' + events.length + ' row events; a song holds ' + L.eventsMax + '. Narrow the bar range.', 'events');
    for (const e of events) w.add('rowEvents', 'info', 'Program / bank / control change event(s) at row starts became row events (pre-roll ' + (preRoll ? preRoll + ' steps' : 'none') + ')',
      { text: 'row ' + (e.row + 1) + ' channel ' + (e.channel + 1) + ': ' + (e.type === 0 ? 'program ' + e.d0 : e.type === 1 ? 'bank ' + (e.d0 === 255 ? '-' : e.d0) + '/' + (e.d1 === 255 ? '-' : e.d1) + ' program ' + e.d2 : 'CC ' + e.d0 + ' = ' + e.d1) });
    for (const [, p] of pending) if (p.items.some(x => !eventTaken.has(x))) w.add('bankWithoutProgram', 'info', 'Bank select without a following program change dropped', { text: 'row ' + (p.row + 1) + ' channel ' + (p.items[0].channel + 1) });
    if (blocks.length > L.blocksPerSong) fail('The song needs ' + blocks.length + ' distinct blocks; a song holds ' + L.blocksPerSong + '. Narrow the bar range or import fewer tracks.', 'blocks');
    if (rows.length > L.rowsPerSong) fail('The song needs ' + rows.length + ' rows after merging repeats; a song holds 128. Narrow the bar range.', 'rows');

    const song = F.emptySong(options.name || 'IMPORTED');
    song.projectSlot = Number.isInteger(options.projectSlot) ? options.projectSlot : 0;
    song.tempo = analysis.tempo.bpm;
    song.loop = !!options.loop; song.jumpMode = options.jumpMode === 'row' ? 'row' : 'bar'; song.loopRow = 0;
    song.outChannels = Array.from({ length: 8 }, (_, t) => { const c = (options.outChannels || [])[t]; return Number.isInteger(c) && c >= 0 && c <= 15 ? c : null; });
    song.rows = rows; song.blocks = blocks; song.events = events;
    song.source = { fileName: options.fileName || '', format: analysis.format, division: analysis.division, tempoExact: analysis.tempo.exact,
      meter: analysis.meter.numerator + '/' + analysis.meter.denominator, barSteps, barFrom, barTo, rowSteps, quantize, lengthRule, overflowRule, exactPpq: analysis.exactPpq,
      looseDedup: loose, velocityTolerance: loose ? tolerance : null, preRoll: options.preRoll || 'beat',
      parts: usedParts.map(u => ({ key: u.part.key, name: u.part.name, track: u.track + 1 })) };
    const usage = F.usage(song);
    const allNotes = perTrack.flat();
    const stats = { ...usage, rowsBeforeMerge: rowsExpanded.length, cellsBeforeDedup: rowsExpanded.reduce((n, r) => n + r.filter(Boolean).length, 0),
      notesIn, notesOut, bars: barTo - barFrom + 1, barsPerRow: rowSteps / barSteps, rowSteps, looseMerges, events: events.length,
      offsets: allNotes.filter(n => n.offset).length, fractionalLengths: allNotes.filter(n => n.length % U).length,   /* Task 05 */
      maxOffsetUnits: allNotes.reduce((m, n) => Math.max(m, Math.abs(n.offset)), 0), ppqRounded, exactPpq: analysis.exactPpq, quantize };
    const result = { song, stats, warnings: w.list(), grid, rowsExpanded };
    song.warnings = result.warnings.map(x => ({ kind: x.kind, severity: x.severity, message: x.message, count: x.count }));
    F.validate(song).errors.forEach(e => fail('internal: produced an invalid song: ' + e, 'internal'));
    return result;
  }

  const TabbyMidiSong = { analyze, convert, defaultAssignments, rowStepsFor, position, where, nearest, version: '0.5' };
  globalThis.TabbyMidiSong = TabbyMidiSong;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyMidiSong;
})();
