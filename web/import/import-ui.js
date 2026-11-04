/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/import-ui.js — the "Import MIDI" panel of the Classic Tabby workbench
 *
 * Purpose
 *   A self-contained DOM component: TabbyImportUI.mount(container, {transfer}) renders the
 *   whole import flow into `container` and returns a small controller. Until Task 03 Step 2
 *   is merged it lives on the standalone page web/import/index.html; at Task 02 Step 4 the
 *   same call is made from a <details> entry in the workbench Library tab, so nothing here
 *   depends on the workbench except the transfer object passed in.
 *
 *   Flow (Task 02 Step 2):
 *     1. choose a .mid file → summary (format, division, tempo, meter, bars, warnings);
 *     2. parts table: every MIDI track × channel with name, notes, range and bars; assign
 *        each part to a Classic Tabby track 1..8 or skip it; per-track OUT CH 1..16 or
 *        "device setting";
 *     3. options: bar range, bars per row (only lengths that stay on bar lines), quantize
 *        (off = exact timing, the default; starts; starts and ends) with the note length
 *        rounding rule (nearest / never shorter / never longer) for the latter, rule for
 *        more than 4 notes on a step (loudest / highest / lowest), song name, project slot,
 *        loop;
 *     4. result: rows with repeats and block ids, counts, pool use, and the warning list of
 *        everything dropped or changed, grouped by kind with the positions;
 *     5. browser song: save / load the JSON model, export the .tabby file (Task 03 9.9);
 *     6. device: choose a song slot, see the replace warning, write through the transfer
 *        interface (the stub only validates and reports what it would send).
 *
 *   Every change in steps 2 and 3 re-converts immediately; the result shown is always the
 *   song that "Save" / "Write" would use. Nothing touches a device until step 6 is confirmed.
 *
 *   Strings are English on purpose: the workbench translates its own Chinese strings
 *   through FM1I18n; this panel is Classic Tabby only and is shown in English in both
 *   languages (Step 4 decision: no 80-string addition to the shared sdk/I18n.js).
 *
 * Version: 0.7
 *
 * Revision log
 *   v0.7  2026-11-03  Task 05: quantize option (off by default), offsets and fractional lengths
 *                     in the statistics, the grid note reworded.
 *   v0.6  2026-11-02  Task 04: row events: pre-roll option, event column in the row table,
 *                     event count in the statistics.
 *   v0.5  2026-11-02  Task 03 (f): the replace warning says the old song is deleted first and
 *                     suggests exporting a .tabby; the delete itself moved to the workbench.
 *   v0.4  2026-11-02  Step 4: mounted in the workbench Library tab; the transfer may be the
 *                     workbench backend (device or simulator): target name in the confirm
 *                     and the messages, batch plan shown, elapsed time reported.
 *   v0.3  2026-11-02  Loose block matching option with velocity tolerance (default 8, off);
 *                     block count shown against 2048 (section 9 v0.4).
 *   v0.2  2026-11-02  Row step length shown per row; OUT CH note updated (field now in the
 *                     song header, section 9 v0.3).
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2).
 */
(() => {
  'use strict';

  /* Tiny DOM helper: h(tag, attributes, ...children); attributes starting with "on" bind
   * handlers, `class` sets className, `dataset` merges, everything else is a property. */
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (v !== undefined && v !== null) el[k] = v;
    }
    for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return el;
  }
  const option = (value, text, selected = false) => h('option', { value: String(value), textContent: text, selected });
  const noteName = p => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][p % 12] + (Math.floor(p / 12) - 1);
  const kb = n => (n / 1024).toFixed(1) + ' KiB';
  const download = (bytes, name, type = 'application/octet-stream') => {
    const url = URL.createObjectURL(new Blob([bytes], { type })), a = h('a', { href: url, download: name });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  function mount(container, { transfer } = {}) {
    const Midi = globalThis.TabbyMidi, Song = globalThis.TabbyMidiSong, Format = globalThis.TabbySongFormat;
    transfer = transfer || globalThis.TabbySongTransfer.select({});
    const state = { fileName: '', parsed: null, analysis: null, assignments: {}, outChannels: Array(8).fill(null), result: null, song: null, busy: false };

    /* ---- static skeleton ------------------------------------------------------------- */
    const ui = {
      file: h('input', { type: 'file', accept: '.mid,.midi,audio/midi' }),
      fileSummary: h('div', { class: 'ti-summary' }),
      fileWarnings: h('ul', { class: 'ti-list' }),
      parts: h('tbody'),
      channels: h('div', { class: 'ti-channels' }),
      barFrom: h('input', { type: 'number', min: 1, step: 1, value: 1 }),
      barTo: h('input', { type: 'number', min: 1, step: 1, value: 1 }),
      rowSteps: h('select'),
      preRoll: h('select', {}, option('beat', 'one beat before (default)'), option('none', 'at the row start only'), option('bar', 'up to one bar before')),
      quantize: h('select', {}, option('off', 'off: exact timing (default)'), option('starts', 'note starts to 16ths'), option('startsEnds', 'starts and ends to 16ths')),
      lengthRule: h('select', {}, option('nearest', 'nearest step (default)'), option('up', 'never shorter (round up)'), option('down', 'never longer (round down)')),
      overflowRule: h('select', {}, option('loudest', 'keep the 4 loudest'), option('highest', 'keep the 4 highest'), option('lowest', 'keep the 4 lowest')),
      name: h('input', { type: 'text', maxLength: 12, value: 'IMPORTED', spellcheck: false }),
      projectSlot: h('select', {}, ...Array.from({ length: 16 }, (_, i) => option(i, 'project ' + (i + 1)))),
      loop: h('input', { type: 'checkbox' }),
      loose: h('input', { type: 'checkbox' }),
      tolerance: h('input', { type: 'number', min: 0, max: 126, step: 1, value: 8 }),
      status: h('p', { class: 'ti-status', role: 'status' }),
      stats: h('div', { class: 'ti-stats' }),
      rows: h('tbody'),
      warnings: h('div', { class: 'ti-warnings' }),
      saveJson: h('button', { type: 'button', textContent: 'Save song (JSON)' }),
      loadJson: h('input', { type: 'file', accept: '.json,application/json' }),
      exportTabby: h('button', { type: 'button', textContent: 'Export .tabby file' }),
      slot: h('select', {}, ...Array.from({ length: 16 }, (_, i) => option(i, 'song ' + (i + 1)))),
      slotInfo: h('span', { class: 'ti-slot-info' }),
      write: h('button', { type: 'button', textContent: 'Write song…' }),
      transferInfo: h('p', { class: 'ti-muted' }),
      plan: h('pre', { class: 'ti-plan', hidden: true }),
    };
    for (let t = 0; t < 8; t++) {
      const sel = h('select', { dataset: { track: t } }, option('', 'device'), ...Array.from({ length: 16 }, (_, c) => option(c, 'ch ' + (c + 1))));
      sel.addEventListener('change', () => { state.outChannels[t] = sel.value === '' ? null : Number(sel.value); reconvert(); });
      ui.channels.append(h('label', {}, 'T' + (t + 1) + ' ', sel));
    }
    container.replaceChildren(
      h('section', { class: 'ti-step' }, h('h3', {}, '1. MIDI file'),
        h('p', {}, ui.file), ui.fileSummary, ui.fileWarnings),
      h('section', { class: 'ti-step' }, h('h3', {}, '2. Parts → Classic Tabby tracks'),
        h('table', { class: 'ti-table' }, h('thead', {}, h('tr', {}, ...['MIDI part', 'Channel', 'Notes', 'Range', 'Bars', 'Programs', 'Tabby track'].map(x => h('th', {}, x)))), ui.parts),
        h('p', { class: 'ti-muted' }, 'Several parts may share one track; the 4-notes-per-step limit then applies to the mix. Drum parts (channel 10) are marked ♩.'),
        h('div', {}, h('strong', {}, 'OUT CH per track '), h('span', { class: 'ti-muted' }, '(written into the song header; "device" keeps the device OUT CH for that track) '), ui.channels)),
      h('section', { class: 'ti-step' }, h('h3', {}, '3. Options'),
        h('div', { class: 'ti-grid' },
          h('label', {}, 'Bars from ', ui.barFrom), h('label', {}, 'to ', ui.barTo),
          h('label', {}, 'Bars per row ', ui.rowSteps),
          h('label', {}, 'Row events: PC / bank / CC ', ui.preRoll),
          h('label', {}, 'Quantize ', ui.quantize),
          h('label', {}, 'Note ends (quantized) ', ui.lengthRule),
          h('label', {}, 'More than 4 notes on a step ', ui.overflowRule),
          h('label', {}, 'Song name ', ui.name), h('label', {}, 'Project slot ', ui.projectSlot),
          h('label', {}, ui.loop, ' loop the whole song'),
          h('label', {}, ui.loose, ' loose block matching, velocity tolerance ±', ui.tolerance)),
        h('p', { class: 'ti-muted' }, 'Timing is kept exactly (1/480 of a 16th step; 96, 120, 192, 240, 384, 480, 960 and 1920 PPQ are exact, others round and are reported): each note belongs to the nearest step and keeps its offset and length. Quantize is off unless chosen. The first tempo of the file becomes the song tempo. Loose matching shares a block when the notes are the same and only velocities differ, within the tolerance; the first block\'s velocities are kept and every merge is listed below.')),
      h('section', { class: 'ti-step' }, h('h3', {}, '4. Resulting song'), ui.status, ui.stats,
        h('div', { class: 'ti-scroll' }, h('table', { class: 'ti-table ti-rows' }, h('thead', {}, h('tr', {}, h('th', {}, 'Row'), h('th', {}, 'Repeat'), h('th', {}, 'Steps'), h('th', {}, 'Events'), ...Array.from({ length: 8 }, (_, t) => h('th', {}, 'T' + (t + 1))))), ui.rows)),
        h('h4', {}, 'Dropped or changed'), ui.warnings),
      h('section', { class: 'ti-step' }, h('h3', {}, '5. Browser song'),
        h('p', {}, ui.saveJson, ' ', ui.exportTabby, ' ', h('label', {}, 'Load song JSON ', ui.loadJson)),
        h('p', { class: 'ti-muted' }, 'The song lives in this page until you write it. Save the JSON to keep it; the .tabby file is the Task 03 device/file format (song record + block records).')),
      h('section', { class: 'ti-step' }, h('h3', {}, '6. Write to the device or the simulator'),
        ui.transferInfo,
        h('p', {}, h('label', {}, 'Song slot ', ui.slot), ' ', ui.slotInfo),
        h('p', { class: 'ti-warn' }, 'Writing deletes whatever that song slot holds before the new song is written (its blocks are reclaimed at the next compaction); export a .tabby of the old song first if you want to keep it. Projects are not changed. The target follows the song editor\'s "target" choice above: device (project library connected) or browser simulator.'),
        h('p', {}, ui.write), ui.plan));

    /* ---- helpers ---------------------------------------------------------------------- */
    const say = text => { ui.status.textContent = text; };
    const enable = () => {
      const have = !!state.song;
      ui.saveJson.disabled = ui.exportTabby.disabled = ui.write.disabled = !have || state.busy;
      for (const el of [ui.barFrom, ui.barTo, ui.rowSteps, ui.quantize, ui.overflowRule]) el.disabled = !state.analysis || state.busy;
      ui.lengthRule.disabled = !state.analysis || state.busy || ui.quantize.value !== 'startsEnds';
    };
    transfer.describe().then(d => { ui.transferInfo.textContent = 'Transfer: ' + (d.real ? d.note : 'stub (validates and reports what it would send; no device is written)') + ' · ' + d.songs + ' songs · ' + d.rows + ' rows · ' + d.blocks + ' blocks per song · pool ' + kb(d.poolBytes) + '.'; });
    const slotInfo = async () => {
      try { const e = await transfer.exists(Number(ui.slot.value)); ui.slotInfo.textContent = e.empty === 'unknown' ? 'Contents unknown until the target is connected' + (e.reason ? ' (' + e.reason + ')' : '') + '.' : e.empty ? 'Slot is empty on the ' + transfer.name + '.' : 'Slot holds "' + e.name + '" (' + e.rows + ' rows, ' + e.blocks + ' blocks) on the ' + transfer.name + ' — it will be deleted and replaced.'; }
      catch (error) { ui.slotInfo.textContent = error.message; }
    };
    ui.slot.addEventListener('change', slotInfo); slotInfo();

    function showFile() {
      const a = state.analysis, p = state.parsed;
      ui.fileSummary.replaceChildren(h('p', {}, h('strong', {}, state.fileName), ' — format ' + p.format + ', ' + p.division + ' ticks per quarter, ' + p.tracks.length + ' track(s), ' +
        a.parts.length + ' part(s), ' + a.totalBars + ' bar(s) of ' + a.meter.numerator + '/' + a.meter.denominator + ', tempo ' + a.tempo.exact.toFixed(2) + ' BPM → ' + a.tempo.bpm +
        (a.tempo.changes.length ? ' (' + a.tempo.changes.length + ' change(s) ignored)' : '') + '.'));
      ui.fileWarnings.replaceChildren(...a.errors.map(e => h('li', { class: 'ti-error' }, e)), ...(p.warnings || []).map(w => h('li', {}, w.message)));
      ui.parts.replaceChildren(...a.parts.map(part => {
        const sel = h('select', {}, option('', 'skip'), ...Array.from({ length: 8 }, (_, t) => option(t, 'track ' + (t + 1))));
        sel.value = state.assignments[part.key] === null || state.assignments[part.key] === undefined ? '' : String(state.assignments[part.key]);
        sel.addEventListener('change', () => { state.assignments[part.key] = sel.value === '' ? null : Number(sel.value); reconvert(); });
        return h('tr', {}, h('td', {}, (part.drums ? '♩ ' : '') + part.name), h('td', {}, part.channel + 1), h('td', {}, part.noteCount),
          h('td', {}, noteName(part.low) + '–' + noteName(part.high)), h('td', {}, part.firstBar + '–' + part.lastBar),
          h('td', {}, part.programs.length ? part.programs.map(x => x + 1).join(', ') : '—'), h('td', {}, sel));
      }));
      ui.barFrom.max = ui.barTo.max = a.totalBars; ui.barFrom.value = 1; ui.barTo.value = a.totalBars;
      ui.rowSteps.replaceChildren(...a.rowSteps.candidates.map(c => option(c.steps, c.bars + (c.bars === 1 ? ' bar' : ' bars') + ' (' + c.steps + ' steps)' + (a.rowSteps.aligned ? '' : ', not on bar lines'), c.steps === a.rowSteps.default)));
    }

    function showSong(result, song) {
      const F = Format, usage = result ? result.stats : F.usage(song);
      const v = F.validate(song);
      ui.stats.replaceChildren(h('p', {}, h('strong', {}, song.name.trim() || '(unnamed)'), ' · tempo ' + (song.tempo || 'project') + ' · project ' + (song.projectSlot + 1) + ' · rows ' + song.rows.length +
        (result ? ' (from ' + result.stats.rowsBeforeMerge + ')' : '') + ', ' + usage.repeats + ' with repeats · row ' + [...new Set(song.rows.map(r => r.steps))].join('/') + ' steps · blocks ' + usage.blocks + ' of 2048 (' + usage.idPercent.toFixed(1) + ' %)' +
        (result ? ' from ' + result.stats.cellsBeforeDedup + ' cells' + (result.stats.looseMerges ? ', ' + result.stats.looseMerges + ' loose merge(s)' : '') : '') + ' · block bytes ' + usage.recordBytes + ' (' + usage.poolPercent.toFixed(2) + ' % of the pool, ' + usage.sectors + ' sector(s))' +
        (result ? ' · notes ' + result.stats.notesOut + ' of ' + result.stats.notesIn + ' (' + result.stats.offsets + ' with offsets, largest ' + result.stats.maxOffsetUnits + ' units; ' + result.stats.fractionalLengths + ' fractional lengths)' : '') + ' · row events ' + (song.events || []).length + ' of 292' + ' · .tabby ' + kb(usage.fileBytes) + '.'),
        ...v.warnings.map(w => h('p', { class: 'ti-muted' }, '⚑ ' + w)), ...v.errors.map(e => h('p', { class: 'ti-error' }, e)));
      ui.rows.replaceChildren(...song.rows.map((row, i) => h('tr', {}, h('td', {}, i + 1), h('td', {}, '×' + row.repeat + (row.loopHere ? ' ⟲' : '')), h('td', {}, row.steps),
        h('td', { class: 'ti-muted' }, (song.events || []).filter(e => e.row === i).map(e => e.type === 0 ? 'PC' + e.d0 : e.type === 1 ? 'B/PC' + e.d2 : e.type === 2 ? 'CC' + e.d0 : 'gap').join(' ') || '·'),
        ...row.blocks.map(id => h('td', { class: id ? 'ti-block' : 'ti-empty' }, id || '·')))));
      const list = result ? result.warnings : (song.warnings || []);
      ui.warnings.replaceChildren(list.length ? h('ul', { class: 'ti-list' }, ...list.map(w => h('li', { class: w.severity === 'warn' ? 'ti-warn' : '' },
        h('span', { class: 'ti-badge' }, w.severity === 'warn' ? 'changed' : 'info'), ' ', w.message, w.count > 1 || (w.items && w.items.length) ? ' (' + w.count + ')' : '',
        w.items && w.items.length ? h('details', {}, h('summary', {}, 'positions'), h('ul', {}, ...w.items.map(it => h('li', {}, (it.track ? 'T' + it.track + ': ' : '') + it.text)), w.count > w.items.length ? h('li', {}, '… ' + (w.count - w.items.length) + ' more') : null)) : null))) : h('p', { class: 'ti-muted' }, 'Nothing was dropped or changed.'));
    }

    function reconvert() {
      if (!state.analysis) return;
      try {
        const options = { fileName: state.fileName, assignments: state.assignments, outChannels: state.outChannels,
          barFrom: Number(ui.barFrom.value) || 1, barTo: Number(ui.barTo.value) || state.analysis.totalBars, rowSteps: Number(ui.rowSteps.value) || undefined,
          quantize: ui.quantize.value, lengthRule: ui.lengthRule.value, overflowRule: ui.overflowRule.value, name: ui.name.value, projectSlot: Number(ui.projectSlot.value), loop: ui.loop.checked, preRoll: ui.preRoll.value,
          looseDedup: ui.loose.checked, velocityTolerance: Math.max(0, Math.min(126, Math.round(Number(ui.tolerance.value) || 0))) };
        state.result = Song.convert(state.analysis, options); state.song = state.result.song;
        showSong(state.result, state.song);
        say('Converted. Nothing is written until step 6.');
      } catch (error) {
        state.result = null; state.song = null; ui.stats.replaceChildren(); ui.rows.replaceChildren(); ui.warnings.replaceChildren();
        say('Cannot convert: ' + error.message);
      }
      enable();
    }
    for (const el of [ui.barFrom, ui.barTo, ui.rowSteps, ui.quantize, ui.lengthRule, ui.overflowRule, ui.projectSlot, ui.loop, ui.loose, ui.tolerance, ui.preRoll]) el.addEventListener('change', reconvert);
    ui.name.addEventListener('input', () => { if (state.song) { state.song.name = Format.padName(ui.name.value); showSong(state.result, state.song); } });

    ui.file.addEventListener('change', async () => {
      const file = ui.file.files[0]; ui.file.value = ''; if (!file) return;
      try {
        if (file.size > 16 * 1024 * 1024) throw new Error('MIDI file larger than 16 MiB');
        const bytes = new Uint8Array(await file.arrayBuffer());
        state.parsed = Midi.parse(bytes); state.analysis = Song.analyze(state.parsed); state.fileName = file.name;
        state.assignments = Song.defaultAssignments(state.analysis);
        ui.name.value = Format.padName(file.name.replace(/\.[^.]+$/, '')).trim();
        showFile();
        if (state.analysis.errors.length) { state.result = state.song = null; say('Cannot import: ' + state.analysis.errors[0]); enable(); return; }
        reconvert();
      } catch (error) { state.parsed = state.analysis = state.result = state.song = null; ui.fileSummary.replaceChildren(); ui.parts.replaceChildren(); say(error.message); enable(); }
    });

    ui.saveJson.addEventListener('click', () => { if (state.song) download(Format.toJSON(state.song), (state.song.name.trim() || 'song').replace(/[^\w-]+/g, '_') + '.tabby-song.json', 'application/json'); });
    ui.exportTabby.addEventListener('click', () => { if (state.song) download(Format.encodeFile(state.song), (state.song.name.trim() || 'song').replace(/[^\w-]+/g, '_') + '.tabby'); });
    ui.loadJson.addEventListener('change', async () => {
      const file = ui.loadJson.files[0]; ui.loadJson.value = ''; if (!file) return;
      try {
        state.song = Format.fromJSON(await file.text()); state.result = null; state.analysis = null; state.parsed = null;
        ui.fileSummary.replaceChildren(h('p', {}, 'Loaded song JSON ', h('strong', {}, file.name), state.song.source?.fileName ? ' (imported from ' + state.song.source.fileName + ')' : '')); ui.parts.replaceChildren(); ui.fileWarnings.replaceChildren();
        ui.name.value = state.song.name.trim(); ui.projectSlot.value = String(state.song.projectSlot); ui.loop.checked = !!state.song.loop;
        state.song.outChannels.forEach((c, t) => { ui.channels.querySelector('select[data-track="' + t + '"]').value = c === null ? '' : String(c); });
        showSong(null, state.song); say('Song loaded from JSON. Options above apply to new MIDI imports only.');
      } catch (error) { say('Cannot load: ' + error.message); }
      enable();
    });

    ui.write.addEventListener('click', async () => {
      if (!state.song || state.busy) return;
      const slot = Number(ui.slot.value);
      if (!confirm('Write "' + state.song.name.trim() + '" to ' + transfer.name + ' song ' + (slot + 1) + '? A song already in that slot is deleted first; export a .tabby of it beforehand if you want to keep it.' + (transfer.real ? '' : '\n\n(Stub transfer: nothing is written; the plan is shown instead.)'))) return;
      state.busy = true; enable(); ui.plan.hidden = true; say('Writing…');
      try {
        const report = await transfer.write(slot, state.song, { progress: v => say('Writing… ' + Math.round(v * 100) + ' %') });
        say(report.message || ('Written to song ' + (slot + 1) + '.'));
        ui.plan.hidden = false;
        ui.plan.textContent = [`transfer: ${transfer.name}  sent: ${report.sent !== false}` + (report.replaced ? '  (previous song deleted first by the workbench)' : ''), `kind 5  target ${report.record.target}  ${report.record.bytes} bytes (song record, written first)`,
          ...(report.batches && report.batches.length
            ? report.batches.map((b, i) => `kind 7  batch ${i + 1}  ${b.blocks.length} block(s) ${b.blocks[0]}..${b.blocks[b.blocks.length - 1]}  ${b.bytes} bytes`)
            : report.blocks.map(b => `kind 6  target 0x${b.target.toString(16).padStart(6, '0')}  block ${b.id}  ${b.bytes} bytes`)),
          `total ${report.totalBytes} bytes, ${report.queries} queries, ` + (report.sent !== false ? `${report.seconds.toFixed(1)} s` : `about ${report.seconds.toFixed(1)} s`)].join('\n');
      } catch (error) { say('Write failed: ' + error.message); }
      state.busy = false; enable(); slotInfo();
    });

    enable();
    return { state, reconvert, ui };
  }

  const TabbyImportUI = { mount, h, version: '0.7' };
  globalThis.TabbyImportUI = TabbyImportUI;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyImportUI;
})();
