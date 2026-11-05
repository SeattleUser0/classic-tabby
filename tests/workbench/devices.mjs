// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/devices.mjs — every device definition validates; numbering is right
//
// Purpose
//   Task 04 workbench tests: (1) every web/devices/*.json passes the tabby-device/1 schema
//   of web/rig/device-library.js and lists sources; (2) preset names map to the right MIDI
//   numbers, including 0-based against 1-based display and the bank schemes:
//     Proteus/2 XR  0-based "007" = PC 7 "Arco Violas", "191" = "Default", no bank select;
//     Blofeld       "B001" = bank 1 (CC 32 = 1) PC 0, "H128" = bank 7 PC 127, names from the
//                   2012 SysEx set ("A001" = "Start Up");
//     Pulse 2       "102" = bank 1 (CC 32 = 1) PC 1, "001" = "TECH STAB RL", "500" = RANDOM;
//     H90           1-based "12" = PC 11, no banks, no presets;
//     Zoom          "001" = PC 0 (displayBase 1, marked unverified) = "C-D-R+";
//     M8            hex "0A" = PC 10;
//     volca fm2 / Melodee / Seashell: program change not supported (or unverified);
//     (Task 09) NightSky  "200" = bank 1 (CC 0 = 1) PC 72, "299" = bank 2 PC 43, 300 out of range,
//                         bank 0 PC 127 (Manual mode) still "in range" by number (the guide warns);
//               Brothers  wire = shown: "5" = PC 5, PC 122 the last, PC 123 out of range;
//               Royalist  "7" = PC 7; Orange Cat / Melodee / FM6 internal: no program change;
//               kinds: effects are the H90, Zoom, Brothers, NightSky, Royalist; FM6 is internal;
//   (3) a broken definition is refused with a reason; (Task 09) a bad kind / midiIn / clock too.
//
//   Run:  /usr/bin/node tests/workbench/devices.mjs      (or: make workbench-test)
//
// Version: 0.2
//
// Revision log
//   v0.2  2026-11-05  Task 09: fifteen definitions, the four new ones, kinds, programInRange, the
//                     optional-field validation.
//   v0.1  2026-11-02  Initial version (Task 04, workbench part).

import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const D = require(join(root, 'web/rig/device-library.js'));
let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

const dir = join(root, 'web/devices');
const files = readdirSync(dir).filter(n => n.endsWith('.json')).sort();
const defs = files.map(n => JSON.parse(readFileSync(join(dir, n), 'utf8')));
check(files.length === 15, 'fifteen device definitions', files.join(', '));
for (let i = 0; i < files.length; i++) {
  const v = D.validateDevice(defs[i]);
  check(v.ok && defs[i].id + '.json' === files[i], files[i] + ' validates and is named after its id', v.errors.join('; '));
  check(defs[i].sources.length > 0 && defs[i].sources.every(s => s.url || /Orange Cat/.test(s.title)), files[i] + ' cites its sources');
}
const lib = D.load(defs);
if (lib.problems.length) console.log('     problems:', JSON.stringify(lib.problems));
check(lib.problems.length === 0 && lib.list.length === 15, 'library loads all fifteen', JSON.stringify(lib.problems));

const proteus = lib.get('emu-proteus-2-xr'), blofeld = lib.get('waldorf-blofeld'), pulse = lib.get('waldorf-pulse-2'), h90 = lib.get('eventide-h90');
const zoom = lib.get('zoom-ms-70cdr-plus'), m8 = lib.get('dirtywave-m8'), volca = lib.get('korg-volca-fm2'), melodee = lib.get('mvave-fm1-melodee'), seashell = lib.get('instruo-seashell');

check(proteus.presets.length === 192 && D.programLabel(proteus, null, 7) === '007' && D.presetName(proteus, null, 7) === 'Arco Violas' && D.presetName(proteus, null, 0) === 'Solo Cello' && proteus.presets.filter(x => x.program === null).length === 64 && proteus.presets.find(x => x.number === 191).name === 'Default',
  'Proteus/2: 192 names, 0-based display, "007" = Arco Violas, 128..191 only through the program map', `${proteus.presets.length} presets, 7 = ${D.presetName(proteus, null, 7)}`);
check(JSON.stringify(D.programFromLabel(proteus, '007')) === '{"bank":null,"program":7}' && D.bankBytes(proteus, null).msb === null, 'Proteus/2: "007" parses to PC 7, no bank bytes');

check(blofeld.presets.length === 1024 && D.programLabel(blofeld, 1, 0) === 'B001' && D.programLabel(blofeld, 7, 127) === 'H128' && D.presetName(blofeld, 0, 0).startsWith('Start Up'),
  'Blofeld: 1024 names, "B001" = bank 1 PC 0, "A001" = Start Up (the 16-character name keeps Waldorf\'s programmer code)', `${blofeld.presets.length}, ${D.presetName(blofeld, 0, 0)}`);
check(JSON.stringify(D.programFromLabel(blofeld, 'b001')) === '{"bank":1,"program":0}' && D.bankBytes(blofeld, 1).lsb === 1 && D.bankBytes(blofeld, 1).msb === null && D.bankFromBytes(blofeld, null, 7) === 7,
  'Blofeld: "B001" parses to bank 1 PC 0; bank select is CC 32 only');
check(D.presetName(blofeld, 7, 127) !== null && D.presetName(blofeld, 2, 5) !== null, 'Blofeld: every bank has names', `H128 = ${D.presetName(blofeld, 7, 127)}`);

check(pulse.presets.length === 500 && D.programLabel(pulse, 1, 1) === '102' && D.programLabel(pulse, 0, 0) === '001' && D.presetName(pulse, 0, 0) === 'TECH STAB RL' && D.presetName(pulse, 4, 99) === 'RANDOM',
  'Pulse 2: 500 names, "102" = bank 1 PC 1, 001 = TECH STAB RL, 500 = RANDOM', `${pulse.presets.length}, ${D.presetName(pulse, 0, 0)}, ${D.presetName(pulse, 4, 99)}`);
check(JSON.stringify(D.programFromLabel(pulse, '102')) === '{"bank":1,"program":1}' && D.bankBytes(pulse, 1).lsb === 1 && D.programFromLabel(pulse, '500').bank === 4 && D.programFromLabel(pulse, '500').program === 99,
  'Pulse 2: "102" parses to bank 1 PC 1 (CC 32 = 1), "500" to bank 4 PC 99');

check(h90.programChange.displayBase === 1 && D.programLabel(h90, null, 11) === '12' && D.programFromLabel(h90, 'P12').program === 11 && h90.presets.length === 0 && h90.programChange.bankSelect.scheme === 'none',
  'H90: 1-based, "12" = PC 11, no banks, no factory names');
check(zoom.presets.length === 80 && D.programLabel(zoom, null, 0) === '001' && D.presetName(zoom, null, 0) === 'C-D-R+' && zoom.unverified.some(u => /displayBase/.test(u)),
  'Zoom: 80 names, "001" = PC 0 with the base marked unverified', `${zoom.presets.length}, ${D.presetName(zoom, null, 0)}`);
check(D.programLabel(m8, null, 10) === '0A' && D.programFromLabel(m8, 'INST 0a').program === 10 && m8.programChange.displayHex === true, 'M8: hex display "0A" = PC 10');
check(volca.programChange.supported === false && melodee.programChange.supported === false && seashell.programChange.supported === 'unverified', 'volca fm2 and Melodee: no program change; Seashell: unverified');
check(D.valueName(blofeld, 14, 2) === 'one shot' && D.valueName(volca, 50, 30) === '1/4' && D.controller(blofeld, 69).name === 'Filter 1 Cutoff', 'controller value meanings resolve', `${D.valueName(blofeld, 14, 2)}, ${D.valueName(volca, 50, 30)}`);
check(defs.every(d => d.setup.length > 0), 'every device lists its setup steps');
// ---- Task 09: the Wrong Room additions ------------------------------------------------------
{
  const ns = lib.get('strymon-nightsky'), br = lib.get('chase-bliss-brothers'), ro = lib.get('tone-king-royalist'), fm6 = lib.get('smk37-fm6-internal'), oc = lib.get('mvave-fm1-orange-cat');
  check(ns && D.programLabel(ns, 1, 72) === '200' && JSON.stringify(D.programFromLabel(ns, '200')) === '{"bank":1,"program":72}' && D.bankBytes(ns, 1).msb === 1 && D.bankBytes(ns, 1).lsb === null,
    'NightSky: preset 200 = CC 0 = 1 then PC 72; the label parses back', ns && D.programLabel(ns, 1, 72));
  check(ns && D.programLabel(ns, 2, 43) === '299' && D.programInRange(ns, 2, 43) && !D.programInRange(ns, 2, 44) && D.programInRange(ns, 0, 127) && !D.programInRange(ns, 3, 0),
    'NightSky: 299 is the last preset (bank 2 PC 43); 300 and bank 3 are out of range');
  check(br && D.programLabel(br, null, 5) === '5' && D.programFromLabel(br, '5').program === 5 && D.programInRange(br, null, 122) && !D.programInRange(br, null, 123) && D.programInRange(br, null, 0),
    'Brothers: wire value = shown number, PC 1..122 presets, PC 0 live, 123 out of range');
  check(ro && ro.programChange.displayBase === 0 && D.programInRange(ro, null, 127) && ro.unverified.some(u => /CC/.test(u)), 'Royalist: PC 0..127, CC map marked unverified');
  check(fm6 && D.kind(fm6) === 'internal' && fm6.programChange.supported === false && !D.programInRange(fm6, null, 0), 'FM6 internal: kind internal, no program change');
  check(oc && oc.programChange.supported === false && oc.controllers.some(c => c.cc === 74) && oc.channel.note.includes('ROUT'), 'Orange Cat: no program change, named CCs, the ROUT block routing');
  check(['eventide-h90', 'zoom-ms-70cdr-plus', 'chase-bliss-brothers', 'strymon-nightsky', 'tone-king-royalist'].every(id => D.isEffect(lib.get(id))) && ['instruo-seashell', 'dirtywave-m8', 'emu-proteus-2-xr', 'mvave-fm1-skiff'].every(id => D.kind(lib.get(id)) === 'instrument'),
    'kinds: the pedals are effects, the synths instruments');
  check(defs.every(d => d.midiIn && d.clock && typeof d.firmware === 'string' || !['chase-bliss-brothers', 'strymon-nightsky', 'tone-king-royalist', 'smk37-fm6-internal', 'dirtywave-m8', 'eventide-h90', 'zoom-ms-70cdr-plus', 'instruo-seashell', 'mvave-fm1-skiff', 'mvave-fm1-melodee', 'mvave-fm1-orange-cat', 'emu-proteus-2-xr'].includes(d.id)),
    'the Wrong Room devices carry midiIn, clock and firmware');
  const skiff = lib.get('mvave-fm1-skiff');
  check(skiff.firmware.includes('2.2') && skiff.channel.note.includes('OFF') && skiff.clock.receives === true, 'Skiff rechecked at 2.2: per-track channel with OFF, clock receive');
  check(D.programInRange(lib.get('emu-proteus-2-xr'), null, 127) && D.programInRange(lib.get('mvave-fm1-skiff'), null, 127) && !D.programInRange(lib.get('korg-volca-fm2'), null, 0), 'programInRange: Proteus and Skiff take any PC 0..127, the volca none');
  const badKind = D.validateDevice({ ...ns, kind: 'pedal' }), badIn = D.validateDevice({ ...ns, midiIn: { connector: 'x', trs: 'C', note: '' } }), badClock = D.validateDevice({ ...ns, clock: { receives: 'yes', syncs: '', setting: '' } });
  check(!badKind.ok && /kind/.test(badKind.errors[0]) && !badIn.ok && /midiIn/.test(badIn.errors[0]) && !badClock.ok && /clock/.test(badClock.errors[0]), 'a bad kind, midiIn or clock is refused');
}

const broken = JSON.parse(JSON.stringify(blofeld)); broken.presets[3].bank = 9; broken.programChange.gapMs = 300; delete broken.sources;
const v = D.validateDevice(broken);
check(!v.ok && v.errors.length === 3 && v.errors.some(e => /not in bankSelect/.test(e)) && v.errors.some(e => /gapMs/.test(e)) && v.errors.some(e => /sources/.test(e)), 'a broken definition is refused with three reasons', v.errors.join('; '));
console.log(failures ? `${failures} check(s) FAILED` : 'all checks passed');
process.exit(failures ? 1 : 0);
