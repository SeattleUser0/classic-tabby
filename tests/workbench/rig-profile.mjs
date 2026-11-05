// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/rig-profile.mjs — the built-in Wrong Room rig profile (Task 09)
//
// Purpose
//   web/rig/profiles/wrong-room.json is the one source of the channel plan: this test checks that
//   it normalises as a tabby-rig/1 profile, that every channel's device exists in the library,
//   that the plan is the approved one (1 Seashell, 2 and 3 FM-1 A / B, 4 / 10 / 13 M8 parts,
//   5..8 Proteus, 9 FM6 internal pinned to track 8, 11 Royalist, 12 Brothers, 14 NightSky,
//   15 H90, 16 Zoom), that the built-in list keeps `builtin` only in memory (export and clone
//   drop it), that an old profile without port / track / notes still loads, that the H90 gap
//   becomes a gap event after its program change, and that the importer helpers find the
//   internal and effects channels.
//
//   Run:  /usr/bin/node tests/workbench/rig-profile.mjs      (or: make workbench-test)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-05  Initial version (Task 09, checkpoint a).

import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const D = require(join(root, 'web/rig/device-library.js'));
const Rig = require(join(root, 'web/rig/rig.js'));
let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

const dir = join(root, 'web/devices');
const lib = D.load(readdirSync(dir).filter(n => n.endsWith('.json')).sort().map(n => JSON.parse(readFileSync(join(dir, n), 'utf8'))));
const raw = JSON.parse(readFileSync(join(root, 'web/rig/profiles/wrong-room.json'), 'utf8'));
const [rig] = Rig.rigBuiltins([raw]);
check(!!rig && rig.builtin === true && rig.name === 'Wrong Room' && rig.channels.length === 16, 'the Wrong Room profile normalises as a built-in');
check(rig.channels.every(c => c.device && lib.get(c.device)), 'every channel names a device of the library', rig.channels.map(c => c.device).join(' '));
const plan = ['instruo-seashell', 'mvave-fm1-skiff', 'mvave-fm1-skiff', 'dirtywave-m8', 'emu-proteus-2-xr', 'emu-proteus-2-xr', 'emu-proteus-2-xr', 'emu-proteus-2-xr', 'smk37-fm6-internal', 'dirtywave-m8', 'tone-king-royalist', 'chase-bliss-brothers', 'dirtywave-m8', 'strymon-nightsky', 'eventide-h90', 'zoom-ms-70cdr-plus'];
check(rig.channels.map(c => c.device).join() === plan.join(), 'the approved channel plan (section 9 of the Step 1 assessment)');
check(Rig.trackFor(rig, 8) === 8 && rig.channels.filter(c => c.track).length === 1, 'channel 9 (FM6) is pinned to Tabby track 8 and nothing else is pinned');
check(rig.channels.every(c => c.port.length > 0) && rig.notes.length >= 5 && rig.notes.some(t => /5 to 8/.test(t)), 'every channel has a port note; the profile notes name the Proteus reservation');
check(JSON.stringify(Rig.channelsOfKind(rig, lib, 'internal')) === '[8]' && JSON.stringify(Rig.channelsOfKind(rig, lib, 'effect')) === '[10,11,13,14,15]', 'internal channel 9; effects on 11, 12, 14, 15, 16', JSON.stringify(Rig.channelsOfKind(rig, lib, 'effect')));
const copy = Rig.rigClone(rig), exported = JSON.parse(Rig.rigExport(rig));
check(copy.builtin === undefined && exported.builtin === undefined && copy.channels[8].track === 8 && copy.channels[0].port === rig.channels[0].port, 'a copy or export drops the built-in flag and keeps port and track');
copy.channels[0].name = 'Bass synth'; check(rig.channels[0].name === 'Seashell', 'editing the copy leaves the built-in untouched');
const old = { schema: 'tabby-rig/1', name: 'old', channels: Array.from({ length: 16 }, (_, i) => ({ device: i === 0 ? 'waldorf-blofeld' : null, name: '', gapMs: null, programs: {} })) };
const o = Rig.rigNormalize(old);
check(o.channels.every(c => c.port === '' && c.track === null) && o.notes.length === 0 && o.channels[0].device === 'waldorf-blofeld', 'a profile written before Task 09 loads with empty port, no track, no notes');
check(Rig.rigBuiltins([{ schema: 'wrong' }, raw]).length === 1, 'a broken built-in is skipped, the good one kept');
const events = Rig.applyGaps([{ row: 0, channel: 14, type: 0, d0: 12, d1: 0, d2: 0 }, { row: 0, channel: 14, type: 2, d0: 20, d1: 64, d2: 0 }], rig, lib);
check(events.length === 3 && events[1].type === 3 && events[1].d0 === 255 && events[1].channel === 14, 'the H90 gap (255 ms, the field maximum) follows its program change before a CC', JSON.stringify(events));
const ns = Rig.applyGaps([{ row: 0, channel: 13, type: 1, d0: 1, d1: 255, d2: 72 }], rig, lib);
check(ns.length === 1 && ns[0].type === 1 && ns[0].d0 === 1 && ns[0].d2 === 72, 'a NightSky bank+program event keeps CC 0 = 1 and PC 72 (no gap needed)');
console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
