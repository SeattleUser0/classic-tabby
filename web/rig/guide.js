/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/rig/guide.js — the MIDI authoring guide, generated from a rig profile and the device library
 *
 * Purpose
 *   Task 09. The guide an LLM reads before writing a .mid file for Classic Tabby has one source
 *   of truth: the rig profile (web/rig/profiles/*.json or the user's own) and the device
 *   definitions (web/devices/*.json). This module fills the hand-written template
 *   (docs/MIDI-GUIDE.template.md) with everything that must never be typed by hand:
 *
 *     {{CHANNEL_MAP}}        the channel table (channel, device, kind, pinned track, numbering, clock)
 *     {{DEVICE_SECTIONS}}    one section per rig channel: connection and port, channel setting,
 *                            program numbering with the wire value beside the shown number and the
 *                            bank select, the named CC table with ranges and value meanings, clock,
 *                            the rig's gap and lead, the unverified fields, the firmware read
 *     {{EFFECTS_LIST}}       the effects channels for section 6's sentence
 *     {{PINNED_LIST}}, {{INTERNAL_CHANNEL_LIST}}, {{INTERNAL_TRACK_LIST}}, {{EXAMPLE_TRACK_NAME}}
 *     {{RIG_NOTES}}          the profile's notes (the H4MIDI preset, reservations, audio-only gear)
 *     {{LIMITS}}             the song limits from web/import/song-format.js LIMITS
 *     {{EX1_*}} .. {{EX3_*}} the three instrument channels Appendix A's example uses
 *     {{CHECKER_RIG}}        the RIG dict of Appendix B's checker (Python source)
 *     {{VERSION}}, {{RIG_NAME}}, {{GENERATED}}, and the scalar limits ({{TRACKS}} ...)
 *
 *   build({ rig, library, template, version, date }) returns the Markdown. In the workbench the
 *   template arrives as globalThis.FM1_GUIDE_TEMPLATE (inlined by tools/linux/build-web.py) and
 *   the version from FM1_SIMULATOR.display_version; under Node the tool tools/linux/midi-guide.mjs
 *   reads the files and writes docs/MIDI-GUIDE.md, and tests/workbench/midi-guide.mjs regenerates
 *   it and fails when the committed guide, the profile or a definition disagree. The output is
 *   deterministic for a given input (the date is passed in, not read from the clock).
 *
 *   Loading: classic script (globalThis.TabbyGuide) and CommonJS.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-05  Initial version (Task 09, checkpoint c).
 */
(() => {
  'use strict';

  const devices = () => globalThis.TabbyDevices || (typeof require === 'function' ? require('./device-library.js') : null);
  const rigModule = () => globalThis.TabbyRig || (typeof require === 'function' ? require('./rig.js') : null);
  const formatModule = () => globalThis.TabbySongFormat || (typeof require === 'function' ? require('../import/song-format.js') : null);

  const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  const list = a => a.length ? a.join(', ') : 'none';

  /* Program numbering in words: the wire value beside what the device shows, and the bank select. */
  function numberingText(d) {
    const D = devices(), p = d.programChange;
    if (p.supported === false) return 'does not receive program changes';
    if (p.supported === 'unverified') return 'program change support unverified; ' + p.note;
    const banks = p.bankSelect.banks, scheme = p.bankSelect.scheme;
    const first = D.programLabel(d, banks.length ? 0 : null, 0), second = D.programLabel(d, banks.length ? 0 : null, 1);
    let out = 'wire PC 0 = shown ' + first + ', PC 1 = ' + second + (p.displayHex ? ' (hex)' : '') + '; ';
    if (!banks.length) {
      const last = p.programs && p.programs <= 128 ? p.programs - 1 : 127;
      out += 'PC 0..' + last + ' = ' + D.programLabel(d, null, 0) + '..' + D.programLabel(d, null, last) + '; no bank select';
    } else {
      const cc = scheme === 'cc0' ? 'CC 0' : scheme === 'cc32' ? 'CC 32' : 'CC 0 and CC 32';
      out += 'bank select by ' + cc + ' before the PC: ' + banks.map(b => { const bb = D.bankBytes(d, b.index); return 'bank ' + b.name + ' = ' + [bb.msb !== null ? 'CC 0 = ' + bb.msb : null, bb.lsb !== null ? 'CC 32 = ' + bb.lsb : null].filter(Boolean).join(', '); }).join('; ');
      out += '; shown ' + D.programLabel(d, 0, 0) + '..' + D.programLabel(d, banks.length - 1, (p.programsTotal ? (p.programsTotal - 1) % (p.programs || 128) : (p.programs || 128) - 1));
    }
    return out;
  }
  function clockText(d) {
    const c = d.clock;
    if (!c) return 'not researched';
    if (c.receives === false) return 'no (' + c.syncs + ')';
    return (c.receives === true ? 'yes: ' : 'unverified: ') + c.syncs + (c.setting ? '. Setting: ' + c.setting : '');
  }
  function shortKind(d) { return devices().kind(d); }

  function channelMap(rig, library) {
    const D = devices(), rows = ['| Ch | Device (rig name) | Kind | Tabby track | Program numbering | Clock |', '| --- | --- | --- | --- | --- | --- |'];
    rig.channels.forEach((c, i) => {
      const d = c.device ? library.get(c.device) : null;
      if (!d) { rows.push('| ' + (i + 1) + ' | (no device) | — | — | — | — |'); return; }
      const kind = shortKind(d), track = c.track ? 'pinned to track ' + c.track : kind === 'effect' ? 'none (no notes)' : 'by file order';
      const p = d.programChange, banks = p.bankSelect.banks, last = !banks.length && p.programs && p.programs <= 128 ? p.programs - 1 : 127;
      const pc = p.supported === true ? (banks.length ? 'bank select + PC, shown ' + D.programLabel(d, 0, 0) + '..' + D.programLabel(d, banks.length - 1, (p.programsTotal ? (p.programsTotal - 1) % (p.programs || 128) : (p.programs || 128) - 1)) : 'PC 0..' + last + ' = shown ' + D.programLabel(d, null, 0) + '..' + D.programLabel(d, null, last)) : p.supported === false ? 'no program change' : 'unverified';
      rows.push('| ' + (i + 1) + ' | ' + esc(d.name) + (c.name && c.name !== d.name ? ' (' + esc(c.name) + ')' : '') + ' | ' + kind + ' | ' + track + ' | ' + pc + ' | ' + (d.clock ? (d.clock.receives === true ? 'yes' : d.clock.receives === false ? 'no' : 'unverified') : '?') + ' |');
    });
    return rows.join('\n');
  }

  function deviceSection(rig, library, i) {
    const D = devices(), Rig = rigModule(), c = rig.channels[i], d = c.device ? library.get(c.device) : null;
    if (!d) return '### Channel ' + (i + 1) + ': no device\n\nNothing in the rig listens here. A part on it is imported with OUT CH ' + (i + 1) + ' and a warning.';
    const out = [];
    out.push('### Channel ' + (i + 1) + ': ' + (c.name || d.name) + ' (' + d.name + '), ' + shortKind(d));
    out.push('');
    out.push('- Connection: ' + esc(d.midiIn ? d.midiIn.connector + (d.midiIn.trs ? ' (TRS ' + d.midiIn.trs + ')' : '') + '. ' + d.midiIn.note : d.channel.note) + (c.port ? ' Port in this rig: ' + esc(c.port) + '.' : ''));
    out.push('- Channel setting: ' + esc(d.channelSetting || d.channel.note));
    out.push('- Program changes: ' + esc(numberingText(d)) + '.');
    if (d.programChange.supported === true && d.programChange.note) out.push('  - ' + esc(d.programChange.note));
    if (d.presets.length) out.push('- Named presets: ' + d.presets.length + ' in the definition (the workbench shows them by name).');
    const named = d.controllers.filter(x => x.cc >= 0), free = d.controllers.find(x => x.cc === -1);
    if (named.length) {
      out.push('- Named CCs (any other CC is warned about):');
      out.push('');
      out.push('  | CC | Name | Range | Values |');
      out.push('  | --- | --- | --- | --- |');
      for (const x of named) out.push('  | ' + x.cc + ' | ' + esc(x.name) + ' | ' + x.min + '..' + x.max + ' | ' + esc(x.values ? Object.entries(x.values).map(([k, v]) => k + ' = ' + v).join('; ') : '') + ' |');
      out.push('');
    } else if (free) out.push('- CCs: ' + esc(free.name) + '. Any CC number passes the checker; what it does is the device\'s mapping.');
    else out.push('- CCs: none received.');
    out.push('- Clock: ' + esc(clockText(d)) + '.');
    const gap = Rig.gapFor(rig, library, i), lead = Rig.leadFor(rig, i);
    out.push('- Timing from the rig: ' + (gap ? 'a gap of ' + gap + ' ms after ' + (d.programChange.gapAfter === 'bank' ? 'the bank select' : 'a program change') : 'no gap') + '; ' + (lead ? 'the program change leaves ' + lead + ' ms before the bar' : 'no lead before the bar') + '.');
    if (d.setup.length) out.push('- Set on the device: ' + d.setup.map(esc).join(' '));
    if (d.unverified.length) out.push('- Unverified: ' + list(d.unverified.map(esc)) + '.');
    if (d.firmware) out.push('- Documents read: ' + esc(d.firmware) + '.');
    return out.join('\n');
  }

  function checkerRig(rig, library) {
    const D = devices(), lines = ['RIG = {'];
    rig.channels.forEach((c, i) => {
      const d = c.device ? library.get(c.device) : null;
      if (!d) return;
      const p = d.programChange, banks = p.bankSelect.banks;
      const pc = p.supported === true ? (banks.length ? 127 : Math.min(127, (p.programs && p.programs <= 128 ? p.programs : 128) - 1)) : null;
      const bankList = banks.length ? '[' + banks.map(b => { const bb = D.bankBytes(d, b.index); return '(' + (bb.msb === null ? 'None' : bb.msb) + ', ' + (bb.lsb === null ? 'None' : bb.lsb) + ')'; }).join(', ') + ']' : 'None';
      const named = d.controllers.filter(x => x.cc >= 0), free = d.controllers.some(x => x.cc === -1);
      const ccs = free || !named.length && p.supported !== true ? 'None' : '{' + named.map(x => x.cc).join(', ') + '}';
      lines.push('    ' + (i + 1) + ': {"name": ' + JSON.stringify(c.name || d.name) + ', "kind": ' + JSON.stringify(shortKind(d)) + ', "pc": ' + (pc === null ? 'None' : pc) + ', "banks": ' + bankList + ', "stride": ' + (p.programs || 128) + ', "total": ' + (p.programsTotal ? p.programsTotal : 'None') + ', "ccs": ' + (d.controllers.length === 0 && p.supported === true ? 'set()' : ccs) + ', "track": ' + (c.track ? c.track : 'None') + '},');
    });
    lines.push('}');
    return lines.join('\n');
  }

  function limitsText() {
    const L = formatModule().LIMITS;
    return ['| Limit | Value |', '| --- | --- |',
      '| Tabby tracks | ' + L.tracks + ' |', '| Rows per song | ' + L.rowsPerSong + ' |', '| Steps per block | ' + L.steps + ' |',
      '| Notes per step per track | ' + L.notesPerStep + ' |', '| Row lengths | ' + L.rowStepsAllowed.join(', ') + ' steps |', '| Repeat count per row | ' + L.repeatMin + '..' + L.repeatMax + ' |',
      '| Timing unit | 1/' + L.unitsPerStep + ' of a 16th step; offset −' + (L.offsetMax - 1) + '..+' + L.offsetMax + ' |',
      '| Row events per row / per song | ' + L.rowEventsMax + ' / ' + L.eventsMax + ' |', '| Tempo | ' + L.tempoMin + '..' + L.tempoMax + ' BPM, whole numbers |',
      '| Songs on the device | ' + L.songs + ' |', '| Block pool | ' + L.blockSectors + ' sectors, ' + L.poolBytes + ' bytes shared by all songs |',
      '| Distinct blocks per song | ' + L.blocksPerSong + ' |', '| Song name | ' + L.nameLength + ' characters |'].join('\n');
  }

  function build({ rig, library, template, version, date } = {}) {
    const D = devices(), Rig = rigModule(), L = formatModule().LIMITS;
    if (!rig || !library) throw new Error('build needs a rig profile and the device library');
    template = template || globalThis.FM1_GUIDE_TEMPLATE;
    if (typeof template !== 'string' || !template.includes('{{CHANNEL_MAP}}')) throw new Error('the guide template is missing');
    version = version || (globalThis.FM1_SIMULATOR && globalThis.FM1_SIMULATOR.display_version) || 'development';
    const deviceOn = i => rig.channels[i].device ? library.get(rig.channels[i].device) : null;
    const effects = [], internal = [], pinned = [], instruments = [];
    rig.channels.forEach((c, i) => {
      const d = deviceOn(i); if (!d) return;
      const k = D.kind(d), label = (c.name || d.name) + ' on channel ' + (i + 1);
      if (k === 'effect') effects.push(label);
      if (k === 'internal') internal.push({ channel: i + 1, track: c.track });
      if (c.track) pinned.push(label + ' → track ' + c.track);
      if (k === 'instrument') instruments.push({ channel: i + 1, name: c.name || d.name, device: d });
    });
    const ex = [0, 1, 2].map(k => instruments[k] || instruments[0] || { channel: 1, name: 'Part', device: null });
    const exPcs = ex[1].device && ex[1].device.programChange.supported === true ? '[(0, 0), (4 * BAR, 1)]' : '[]';
    const firstName = rig.channels.find(c => c.device) ? (rig.channels.find(c => c.device).name || library.get(rig.channels.find(c => c.device).device).name) : 'Device';
    const values = {
      VERSION: version, RIG_NAME: rig.name, GENERATED: 'generated ' + (date || 'at build time') + ' by web/rig/guide.js from ' + rig.channels.filter(c => c.device).length + ' rig channels and the device library',
      TRACKS: L.tracks, ROWS_MAX: L.rowsPerSong, UNITS: L.unitsPerStep, NAME_LENGTH: L.nameLength, TEMPO_MIN: L.tempoMin, TEMPO_MAX: L.tempoMax,
      NOTES_PER_STEP: L.notesPerStep, EVENTS_ROW: L.rowEventsMax, EVENTS_SONG: L.eventsMax, SONGS: L.songs, POOL_KB: Math.round(L.poolBytes / 1024), POOL_BYTES: L.poolBytes, REPEAT_MAX: L.repeatMax,
      EFFECTS_LIST: list(effects), PINNED_LIST: list(pinned), EXAMPLE_TRACK_NAME: firstName,
      GAP_DEVICES: list(rig.channels.map((c, i) => c.device && Rig.gapFor(rig, library, i) ? (c.name || library.get(c.device).name) + ' on channel ' + (i + 1) + ', ' + Rig.gapFor(rig, library, i) + ' ms' : null).filter(Boolean)),
      INTERNAL_CHANNEL_LIST: list(internal.map(x => String(x.channel))), INTERNAL_TRACK_LIST: list(internal.map(x => String(x.track || '—'))),
      CHANNEL_MAP: channelMap(rig, library), DEVICE_SECTIONS: rig.channels.map((_, i) => deviceSection(rig, library, i)).join('\n\n'),
      RIG_NOTES: (rig.notes || []).map(t => '- ' + t).join('\n'), LIMITS: limitsText(), CHECKER_RIG: checkerRig(rig, library),
      EX1_NAME: ex[0].name, EX1_CH: ex[0].channel, EX1_CH0: ex[0].channel - 1, EX2_NAME: ex[1].name, EX2_CH: ex[1].channel, EX2_CH0: ex[1].channel - 1, EX2_PCS: exPcs,
      EX3_NAME: ex[2].name, EX3_CH: ex[2].channel, EX3_CH0: ex[2].channel - 1,
    };
    const out = template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => { if (!(k in values)) throw new Error('template placeholder without a value: ' + k); return String(values[k]); });
    return out;
  }

  const TabbyGuide = { build, channelMap, deviceSection, checkerRig, limitsText, numberingText, version: '0.1' };
  globalThis.TabbyGuide = TabbyGuide;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyGuide;
})();
