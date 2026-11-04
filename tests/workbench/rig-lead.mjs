// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/rig-lead.mjs — the rig's lead before the bar becomes a trailing gap (Task 06)
//
// Purpose
//   web/rig/rig.js v0.2 (section 9.13): a channel's leadMs becomes a gap event after the
//   channel's last program event of a row, kept even when it ends the row's stream (the
//   firmware starts the stream `lead` blocks early, so the program change leaves that long
//   before the bar). Checks: the profile round-trips leadMs (0 by default, old profiles read
//   as 0); a program change on a channel with lead 40 gets a trailing gap of 40 on that
//   channel; with a gap override on the channel (a Blofeld, gap after the program) the
//   trailing gap is the larger of the gap and the lead, either way round; a channel without
//   lead loses its trailing gap as
//   before; a lead gap placed before another channel's events stays where it is; events of
//   other rows are untouched.
//
//   Run:  /usr/bin/node tests/workbench/rig-lead.mjs      (or: make workbench-test)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-04  Initial version (Task 06, checkpoint d).

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
const blofeld = lib.get('waldorf-blofeld');
check(blofeld && blofeld.programChange.gapAfter === 'program', 'the Blofeld definition places its gap after the program change', JSON.stringify(blofeld && blofeld.programChange.gapAfter));

const rig = Rig.rigEmpty();
check(rig.channels.every(c => c.leadMs === 0), 'a new profile has lead 0 on every channel');
const old = JSON.parse(Rig.rigExport(rig)); for (const c of old.channels) delete c.leadMs;
check(Rig.rigNormalize(old).channels.every(c => c.leadMs === 0), 'a profile written before Task 06 reads as lead 0');
rig.channels[2].leadMs = 40;                      /* channel 3: no device, lead 40 */
rig.channels[4].device = 'waldorf-blofeld'; rig.channels[4].gapMs = 25; rig.channels[4].leadMs = 5;    /* channel 5: Blofeld, gap 25 after the program, lead smaller */
rig.channels[5].device = 'waldorf-blofeld'; rig.channels[5].gapMs = 10; rig.channels[5].leadMs = 40;   /* channel 6: gap 10, lead larger */
rig.channels[6].leadMs = 300;                     /* out of range: clamped by normalize */
const r2 = Rig.rigNormalize(JSON.parse(Rig.rigExport(rig)));
check(r2.channels[2].leadMs === 40 && r2.channels[4].leadMs === 5 && r2.channels[6].leadMs === 0, 'lead round-trips and an out-of-range value reads as 0', JSON.stringify(r2.channels.map(c => c.leadMs)));

const events = [
  { row: 0, channel: 2, type: 0, d0: 10, d1: 0, d2: 0 },     /* PC on channel 3 (lead 40) */
  { row: 0, channel: 1, type: 2, d0: 7, d1: 100, d2: 0 },    /* CC on channel 2 after it */
  { row: 1, channel: 4, type: 1, d0: 255, d1: 1, d2: 3 },    /* bank + PC on the Blofeld (gap 25, lead 5) */
  { row: 1, channel: 5, type: 0, d0: 9, d1: 0, d2: 0 },      /* PC on the other Blofeld (gap 10, lead 40) */
  { row: 1, channel: 2, type: 0, d0: 11, d1: 0, d2: 0 },     /* PC on channel 3 ends row 1 */
  { row: 2, channel: 1, type: 0, d0: 12, d1: 0, d2: 0 },     /* PC on channel 2 (no lead) ends row 2 */
];
const out = Rig.applyGaps(events, r2, lib);
const text = out.map(e => e.row + ':' + e.channel + ':' + e.type + ':' + e.d0).join(' ');
const row0 = out.filter(e => e.row === 0), row1 = out.filter(e => e.row === 1), row2 = out.filter(e => e.row === 2);
check(row0.length === 3 && row0[0].type === 0 && row0[1].type === 3 && row0[1].channel === 2 && row0[1].d0 === 40 && row0[2].type === 2,
  'row 0: the lead gap (40 ms, channel 3) follows the program change and precedes the other channel\'s CC', text);
const bl = row1.filter(e => e.channel === 4), bl2 = row1.filter(e => e.channel === 5);
check(bl.length === 2 && bl[0].type === 1 && bl[1].type === 3 && bl[1].d0 === 25, 'row 1: the Blofeld keeps its bank + program event and gets the larger of its gap (25) and the lead (5)', text);
check(bl2.length === 2 && bl2[0].type === 0 && bl2[1].type === 3 && bl2[1].d0 === 40, 'row 1: the other channel gets the larger of its gap (10) and the lead (40)', text);
check(row1[row1.length - 1].type === 3 && row1[row1.length - 1].channel === 2 && row1[row1.length - 1].d0 === 40,
  'row 1: the trailing lead gap of channel 3 is kept at the end of the row', text);
check(row2.length === 1 && row2[0].type === 0, 'row 2: a channel without lead loses its trailing gap as before', text);
check(Rig.leadFor(r2, 2) === 40 && Rig.leadFor(r2, 0) === 0, 'leadFor reads the channel\'s lead');

console.log(failures ? `${failures} check(s) FAILED` : 'all checks passed');
process.exit(failures ? 1 : 0);
