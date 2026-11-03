/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/rig/rig-ui.js — rig setup and the row event editor (workbench panels)
 *
 * Purpose
 *   Task 04. Two DOM components mounted by the workbench song editor
 *   (sdk/Update.html.in), both English like the MIDI importer panel:
 *
 *     rig setup      a 16-row table (MIDI channel → device from the library, a display
 *                    name, a gap override in ms, named programs for devices without a
 *                    published list), saved to the browser as the global profile, with
 *                    export / import as JSON and a reset;
 *     row events     for the song in the editor: a row selector, the row's event list
 *                    (device and preset names from the rig, raw numbers always shown,
 *                    gaps greyed), move / delete buttons, and an "add event" form whose
 *                    choices come from the device on the chosen channel (preset list,
 *                    bank list, named controllers with value meanings), with raw number
 *                    fields for anything not in a definition. A checkbox gives the song
 *                    its own copy of the rig (the per-song override, stored in the
 *                    `.tabby` trailer).
 *
 *   The components edit `song.events` (the model of sdk/WebUpdate.js songRecordParse:
 *   {row, channel, type, d0, d1, d2}) in place and call `onChange`; the editor's write
 *   and export paths call `prepareEvents(song)` to get the list with the rig's gaps
 *   applied (TabbyRig.applyGaps) and `trailer(song)` for the override.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-02  Initial version (Task 04, workbench part).
 */
(() => {
  'use strict';

  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null) el[k] = v;
    }
    for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return el;
  }
  const option = (value, text, selected = false) => h('option', { value: String(value), textContent: text, selected });
  const download = (text, name) => {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })), a = h('a', { href: url, download: name });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  function mount({ setup, events, library, onChange = () => {}, message = () => {} }) {
    const Rig = globalThis.TabbyRig, D = globalThis.TabbyDevices;
    const state = { rig: Rig.rigLoad(), song: null, row: 0 };
    const rigInUse = () => (state.song && state.song.rig) ? state.song.rig : state.rig;

    /* ---- rig setup ---------------------------------------------------------------------- */
    const setupBody = h('tbody'), rigName = h('input', { type: 'text', maxLength: 40 }), programsBox = h('div', { class: 'ti-muted' });
    function renderSetup() {
      const rig = state.rig;
      rigName.value = rig.name;
      setupBody.replaceChildren(...rig.channels.map((c, i) => {
        const dev = h('select', {}, option('', '— none —', !c.device), ...library.list.map(d => option(d.id, d.name, c.device === d.id)));
        dev.addEventListener('change', () => { c.device = dev.value || null; save(); });
        const name = h('input', { type: 'text', maxLength: 40, value: c.name, placeholder: c.device ? (library.get(c.device) || {}).name || '' : '' });
        name.addEventListener('change', () => { c.name = name.value; save(); });
        const d = c.device ? library.get(c.device) : null;
        const gap = h('input', { type: 'number', min: 0, max: 255, step: 1, value: c.gapMs === null ? '' : String(c.gapMs), placeholder: d ? String(d.programChange.gapMs) : '0' });
        gap.addEventListener('change', () => { c.gapMs = gap.value === '' ? null : Math.max(0, Math.min(255, Math.round(Number(gap.value)))); save(); });
        const numbering = d ? (d.programChange.supported === true ? 'programs ' + D.programLabel(d, d.programChange.bankSelect.banks.length ? 0 : null, 0) + '..' +
          D.programLabel(d, d.programChange.bankSelect.banks.length ? d.programChange.bankSelect.banks.length - 1 : null, Math.min(127, Math.max(0, (d.programChange.programs || 128) - 1))) +
          (d.programChange.bankSelect.scheme !== 'none' ? ', bank by ' + d.programChange.bankSelect.scheme.toUpperCase().replace('CC0CC32', 'CC 0 + CC 32').replace('CC', 'CC ') : '') +
          (d.unverified.some(u => /displayBase/.test(u)) ? ' (base unverified)' : '')
          : d.programChange.supported === false ? 'no program change' : 'program change unverified') : '';
        const names = h('button', { type: 'button', textContent: 'Names…', disabled: !d, onclick: () => editPrograms(i) });
        return h('tr', {}, h('td', {}, i + 1), h('td', {}, dev), h('td', {}, name), h('td', {}, gap), h('td', { class: 'ti-muted' }, numbering), h('td', {}, names));
      }));
      renderEvents();
    }
    function editPrograms(channel) {
      const c = state.rig.channels[channel], d = library.get(c.device);
      const numberField = h('input', { type: 'text', value: d ? D.programLabel(d, d.programChange.bankSelect.banks.length ? 0 : null, 0) : '0', size: 6 });
      const nameField = h('input', { type: 'text', maxLength: 40, placeholder: 'your name for it' });
      const list = h('ul', { class: 'ti-list' });
      const show = () => list.replaceChildren(...Object.entries(c.programs).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => h('li', {}, 'PC ' + k + ': ' + v + ' ', h('button', { type: 'button', textContent: '✕', onclick: () => { delete c.programs[k]; save(); show(); } }))));
      programsBox.replaceChildren(h('p', {}, h('strong', {}, 'Channel ' + (channel + 1) + ' program names'), ' (' + (d ? d.name : 'no device') + '): the device shows ',
        h('label', {}, 'program ', numberField), ' ', h('label', {}, 'call it ', nameField), ' ',
        h('button', { type: 'button', textContent: 'Add', onclick: () => {
          const p = d ? D.programFromLabel(d, numberField.value) : { program: Number(numberField.value) };
          if (!p || !Number.isInteger(p.program)) { message('Not a program number this device shows.'); return; }
          c.programs[String(p.program)] = nameField.value.trim() || ('Program ' + numberField.value); save(); show(); } })),
        list, h('p', { class: 'ti-muted' }, 'Names are stored by MIDI program number (0..127) in the rig profile; a device bank is chosen in the event itself.'));
      show();
    }
    function save() { Rig.rigSave(state.rig); renderSetup(); }
    rigName.addEventListener('change', () => { state.rig.name = rigName.value; save(); });
    const importFile = h('input', { type: 'file', accept: '.json,application/json' });
    importFile.addEventListener('change', async () => {
      const f = importFile.files[0]; importFile.value = ''; if (!f) return;
      try { state.rig = Rig.rigImport(await f.text()); save(); message('Rig profile imported.'); } catch (e) { message('Cannot import rig: ' + e.message); }
    });
    setup.replaceChildren(
      h('p', {}, h('label', {}, 'Profile name ', rigName), ' ',
        h('button', { type: 'button', textContent: 'Export rig (.json)', onclick: () => download(Rig.rigExport(state.rig), (state.rig.name || 'rig').replace(/[^\w-]+/g, '_') + '.rig.json') }), ' ',
        h('label', {}, 'Import rig ', importFile), ' ',
        h('button', { type: 'button', textContent: 'Reset', onclick: () => { if (confirm('Clear the rig profile?')) { state.rig = Rig.rigEmpty(); save(); } } })),
      h('table', { class: 'ti-table' }, h('thead', {}, h('tr', {}, ...['Ch', 'Device', 'Name', 'Gap ms', 'Numbering', ''].map(t => h('th', {}, t)))), setupBody),
      h('p', { class: 'ti-muted' }, 'The profile is saved in this browser. Gap: blank = the definition\'s delay need; it becomes gap events in the song when it is written. Device setup steps (what to set on the gear) are in each definition\'s notes: see BUILD.md section 16.3.'),
      programsBox);

    /* ---- row events ---------------------------------------------------------------------- */
    const rowSelect = h('select'), summary = h('p', { class: 'ti-status' }), list = h('tbody'), override = h('input', { type: 'checkbox' });
    const addChannel = h('select'), addType = h('select', {}, option('program', 'Program'), option('cc', 'Control change'), option('gap', 'Gap'));
    const fields = h('span'), deviceNote = h('p', { class: 'ti-muted' });
    function rowEvents(song, row) { return song.events.filter(e => e.row === row); }
    function renderEvents() {
      const song = state.song;
      events.hidden = !song;
      if (!song) return;
      if (!Array.isArray(song.events)) song.events = [];
      const rig = rigInUse();
      override.checked = !!song.rig;
      if (state.row >= song.rows.length) state.row = 0;
      rowSelect.replaceChildren(...song.rows.map((_, i) => option(i, 'Row ' + (i + 1) + (i === 0 ? ' (SEND SETUP)' : '') + ' — ' + rowEvents(song, i).length + ' event' + (rowEvents(song, i).length === 1 ? '' : 's'), i === state.row)));
      const perRow = song.rows.map((_, i) => rowEvents(song, i).length), over = perRow.some(n => n > 32);
      summary.textContent = 'Events in the song: ' + song.events.length + ' of 292' + (song.events.length > 292 ? ' — too many' : '') + (over ? ' — a row has more than 32' : '') +
        (song.rig ? ' · this song uses its own rig' : ' · using the global rig "' + state.rig.name + '"') + '.';
      const mine = song.events.map((e, i) => ({ e, i })).filter(x => x.e.row === state.row);
      list.replaceChildren(...mine.map((x, k) => h('tr', { class: x.e.type === 3 ? 'ti-muted' : '' },
        h('td', {}, k + 1), h('td', {}, x.e.type === 3 ? '—' : Rig.channelLabel(rig, library, x.e.channel)), h('td', {}, Rig.describe(x.e, rig, library)),
        h('td', {}, h('button', { type: 'button', textContent: '▲', disabled: k === 0, onclick: () => move(x.i, mine[k - 1].i) }), ' ',
          h('button', { type: 'button', textContent: '▼', disabled: k === mine.length - 1, onclick: () => move(x.i, mine[k + 1].i) }), ' ',
          h('button', { type: 'button', textContent: '✕', onclick: () => { song.events.splice(x.i, 1); changed(); } })))));
      addChannel.replaceChildren(...Array.from({ length: 16 }, (_, c) => option(c, Rig.channelLabel(rig, library, c), c === Number(addChannel.value || 0))));
      renderAddFields();
    }
    function move(a, b) { const s = state.song.events; [s[a], s[b]] = [s[b], s[a]]; changed(); }
    function changed() { state.song.events.sort((a, b) => a.row - b.row); onChange(); renderEvents(); }
    function renderAddFields() {
      const rig = rigInUse(), channel = Number(addChannel.value || 0), d = Rig.deviceOn(rig, library, channel), type = addType.value;
      fields.replaceChildren();
      deviceNote.textContent = d ? (d.programChange.supported === true ? '' : d.programChange.supported === false ? d.name + ' does not receive program changes.' : d.name + ': program change support is unverified.') +
        (d.unverified.length ? ' Unverified in its definition: ' + d.unverified.join('; ') + '.' : '') : 'No device on this channel in the rig: raw numbers only.';
      if (type === 'gap') {
        const ms = h('input', { type: 'number', min: 1, max: 255, step: 1, value: 20 });
        fields.append(h('label', {}, 'gap ', ms, ' ms'), ' ', h('button', { type: 'button', textContent: 'Add', onclick: () => add({ type: 3, d0: Number(ms.value) || 1, d1: 0, d2: 0 }) }));
        return;
      }
      if (type === 'cc') {
        const named = d ? d.controllers.filter(c => c.cc >= 0) : [];
        const ccSel = h('select', {}, option('', 'raw CC'), ...named.map(c => option(c.cc, 'CC ' + c.cc + ' ' + c.name)));
        const cc = h('input', { type: 'number', min: 0, max: 127, step: 1, value: 74, size: 4 }), value = h('input', { type: 'number', min: 0, max: 127, step: 1, value: 64, size: 4 });
        const meaning = h('span', { class: 'ti-muted' });
        const update = () => { const m = d ? D.valueName(d, Number(cc.value), Number(value.value)) : null; meaning.textContent = m ? ' = ' + m : ''; };
        ccSel.addEventListener('change', () => { if (ccSel.value !== '') cc.value = ccSel.value; update(); });
        cc.addEventListener('input', update); value.addEventListener('input', update);
        fields.append(ccSel, ' ', h('label', {}, 'CC ', cc), ' ', h('label', {}, 'value ', value), meaning, ' ',
          h('button', { type: 'button', textContent: 'Add', onclick: () => add({ type: 2, d0: Number(cc.value), d1: Number(value.value), d2: 0 }) }));
        update();
        return;
      }
      /* program: preset list (names from the definition and the rig), bank, raw number */
      const banks = d ? d.programChange.bankSelect.banks : [];
      const bankSel = banks.length ? h('select', {}, ...banks.map(b => option(b.index, 'bank ' + b.name))) : null;
      const program = h('input', { type: 'number', min: 0, max: 127, step: 1, value: 0, size: 4 });
      const shown = h('span', { class: 'ti-muted' });
      const presets = d ? d.presets.filter(p => p.program !== null) : [];
      const presetSel = h('select', {}, option('', presets.length ? 'choose a preset…' : 'no preset list'),
        ...presets.map(p => option((p.bank === null ? '' : p.bank) + ':' + p.program, D.programLabel(d, p.bank, p.program) + '  ' + p.name)));
      const own = Object.entries(rig.channels[channel].programs);
      if (own.length) presetSel.append(...own.map(([k, v]) => option(':' + k, (d ? D.programLabel(d, bankSel ? Number(bankSel.value) : null, Number(k)) : k) + '  ' + v + ' (rig)')));
      const update = () => {
        const bank = bankSel ? Number(bankSel.value) : null, p = Number(program.value);
        shown.textContent = d ? ' shows ' + D.programLabel(d, bank, p) + (Rig.programName(rig, library, channel, bank, p) ? ' "' + Rig.programName(rig, library, channel, bank, p) + '"' : '') : '';
      };
      presetSel.addEventListener('change', () => { if (presetSel.value === '') return; const [b, p] = presetSel.value.split(':'); if (bankSel && b !== '') bankSel.value = b; program.value = p; update(); });
      if (bankSel) bankSel.addEventListener('change', update);
      program.addEventListener('input', update);
      fields.append(presetSel, ' ', bankSel || '', bankSel ? ' ' : '', h('label', {}, 'PC ', program), shown, ' ',
        h('button', { type: 'button', textContent: 'Add', onclick: () => {
          const bank = bankSel ? Number(bankSel.value) : null, p = Number(program.value);
          if (d && bank !== null) { const bytes = D.bankBytes(d, bank); add({ type: 1, d0: bytes.msb === null ? 255 : bytes.msb, d1: bytes.lsb === null ? 255 : bytes.lsb, d2: p }); }
          else add({ type: 0, d0: p, d1: 0, d2: 0 });
        } }));
      update();
      if (d && d.presets.some(p => p.program === null)) fields.append(h('p', { class: 'ti-muted' }, d.presets.filter(p => p.program === null).length + ' presets of this device have no direct program number (reached through the device\'s own program map): enter the mapped program number.'));
    }
    function add(partial) {
      const song = state.song, channel = Number(addChannel.value || 0);
      const e = { row: state.row, channel, ...partial };
      if (rowEvents(song, state.row).length >= 32) { message('Row ' + (state.row + 1) + ' already has 32 events.'); return; }
      if (song.events.length >= 292) { message('The song already has 292 events.'); return; }
      const after = song.events.map((x, i) => x.row <= state.row ? i : -1).filter(i => i >= 0).pop();
      song.events.splice(after === undefined ? 0 : after + 1, 0, e);
      changed();
    }
    rowSelect.addEventListener('change', () => { state.row = Number(rowSelect.value); renderEvents(); });
    addChannel.addEventListener('change', renderAddFields); addType.addEventListener('change', renderAddFields);
    override.addEventListener('change', () => { if (!state.song) return; state.song.rig = override.checked ? Rig.rigClone(state.rig) : null; onChange(); renderEvents(); });
    events.replaceChildren(
      summary,
      h('p', {}, h('label', {}, 'Row ', rowSelect), ' ', h('label', {}, override, ' this song uses its own copy of the rig (stored in the .tabby, not on the device)')),
      h('table', { class: 'ti-table' }, h('thead', {}, h('tr', {}, ...['#', 'Channel / device', 'Event', ''].map(t => h('th', {}, t)))), list),
      h('p', {}, h('label', {}, 'Add on channel ', addChannel), ' ', h('label', {}, 'type ', addType), ' ', fields),
      deviceNote,
      h('p', { class: 'ti-muted' }, 'Events fire when the row is entered, before its first notes, on all MIDI out ports. Gaps are generated from the rig when the song is written; gaps read back from a device are shown greyed and regenerated.'));

    renderSetup();
    return {
      setSong(song) { state.song = song; state.row = 0; renderEvents(); },
      refresh() { renderEvents(); },
      rig() { return rigInUse(); },
      /* The event list to store: the rig's gaps applied (sorted by row). */
      prepareEvents(song) { return Rig.applyGaps(song.events || [], song.rig || state.rig, library).sort((a, b) => a.row - b.row); },
      trailer(song) { return song.rig ? { rig: song.rig } : null; },
    };
  }

  const TabbyRigUI = { mount, version: '0.1' };
  globalThis.TabbyRigUI = TabbyRigUI;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyRigUI;
})();
