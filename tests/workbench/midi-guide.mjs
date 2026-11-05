// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/midi-guide.mjs — the committed guide equals the one generated from the profile
//
// Purpose
//   Task 09: docs/MIDI-GUIDE.md is generated (tools/linux/midi-guide.mjs, web/rig/guide.js) from
//   the built-in Wrong Room profile, the device definitions and the template. This test fails
//   when the committed guide and a fresh build differ apart from the version line (a stale
//   guide, an edited generated section, a changed profile or definition without `make
//   midi-guide`), when a rig channel has no section, when a device section's named CCs or
//   numbering differ from the definition, when the channel map does not list every channel,
//   when the checker's RIG dict disagrees with the profile, or when a template placeholder is
//   left unfilled. It also runs Appendix B's checker when the harness Python with mido exists
//   (skipped otherwise): wrong-room-all.mid passes with no warning, wrong-room-wrong.mid shows
//   the effects, range and CC warnings, and the no-device warning once channel 13 is removed
//   from the RIG dict; Appendix A's template writes a file the checker passes.
//
//   Run:  /usr/bin/node tests/workbench/midi-guide.mjs      (or: make workbench-test)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-05  Initial version (Task 09, checkpoint c).

import { readFileSync, existsSync, writeFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { buildGuide } from '../../tools/linux/midi-guide.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };
const normalize = t => t.replace(/Written for Classic Tabby [^ ]+ and/, 'Written for Classic Tabby VERSION and');

const { text, rig, library } = buildGuide({ version: 'test' });
const committed = readFileSync(join(root, 'docs/MIDI-GUIDE.md'), 'utf8');
check(normalize(committed) === normalize(text), 'docs/MIDI-GUIDE.md equals a fresh build from the profile (run make midi-guide after changing the profile, a definition or the template)',
  committed.length + ' vs ' + text.length + ' bytes');
check(!/\{\{[A-Z0-9_]+\}\}/.test(text), 'every template placeholder is filled');
for (let i = 0; i < 16; i++) {
  const c = rig.channels[i], d = c.device ? library.get(c.device) : null;
  check(d && text.includes('### Channel ' + (i + 1) + ': ' + (c.name || d.name) + ' (' + d.name + ')'), 'channel ' + (i + 1) + ' has its device section');
  check(text.includes('\n| ' + (i + 1) + ' | ' + d.name.replace(/\|/g, '\\|')), 'channel ' + (i + 1) + ' is in the channel map');
  for (const x of d.controllers.filter(x => x.cc >= 0)) if (!text.includes('  | ' + x.cc + ' | ' + x.name.replace(/\|/g, '\\|') + ' | ')) { check(false, 'channel ' + (i + 1) + ': CC ' + x.cc + ' row present'); break; }
}
check(text.includes('bank select by CC 0 before the PC: bank 0..127 = CC 0 = 0; bank 128..255 = CC 0 = 1; bank 256..299 = CC 0 = 2') && text.includes('shown 0..299'), 'NightSky numbering: CC 0 banks and the 0..299 range');
check(text.includes('wire PC 0 = shown 0, PC 1 = 1; PC 0..122 = 0..122; no bank select'), 'Brothers numbering: wire = shown, 0..122');
check(text.includes('wire PC 0 = shown 000, PC 1 = 001') && text.includes('wire PC 0 = shown 1, PC 1 = 2'), 'Proteus 0-based three digits; H90 1-based');
check(text.includes('Tabby track | pinned to track 8') === false && text.includes('| pinned to track 8 |'), 'the FM6 channel is pinned to track 8 in the map');
const rigDict = text.slice(text.indexOf('RIG = {'), text.indexOf('\n}\n', text.indexOf('RIG = {')) + 2);
check(rigDict.split('\n').filter(l => /^    \d+: /.test(l)).length === 16 && rigDict.includes('9: {"name": "FM6 internal", "kind": "internal", "pc": None') && rigDict.includes('14: {"name": "NightSky", "kind": "effect", "pc": 127, "banks": [(0, None), (1, None), (2, None)], "stride": 128, "total": 300'),
  'the checker RIG dict lists the 16 channels with the FM6 pin and the NightSky banks');
check(text.includes('Events for effects pedals that have no part of their own (Royalist on channel 11, Brothers on channel 12, NightSky on channel 14, H90 on channel 15, Zoom on channel 16)'), 'section 6 names the effects channels from the rig');
check(text.includes("track('Seashell', 0, pulse)") && text.includes("track('FM-1 A', 1, bass, pcs=[(0, 0), (4 * BAR, 1)])") && text.includes("track('FM-1 B', 2, pad)"), 'Appendix A uses the rig\'s first three instrument channels');

/* Appendix B's checker on the fixtures, with the harness Python that has mido. */
const py = '/home/userzero/fm1-hw/hwvenv/bin/python3';
if (existsSync(py)) {
  const m = text.match(/## Appendix B[\s\S]*?```python\n([\s\S]*?)```/);
  const dir = mkdtempSync(join(tmpdir(), 'tabby-guide-'));
  writeFileSync(join(dir, 'tabby_check.py'), m[1]);
  const run = f => spawnSync(py, ['-I', join(dir, 'tabby_check.py'), join(root, 'tests/midi-import/fixtures', f)], { encoding: 'utf-8' });
  const all = run('wrong-room-all.mid'), wrong = run('wrong-room-wrong.mid');
  check(all.status === 0 && /RESULT: PASS/.test(all.stdout) && !/WARNING/.test(all.stdout), 'checker: wrong-room-all.mid passes with no warning', (all.stdout.split('\n').filter(l => /WARNING|ERROR/.test(l)).join(' | ') || all.stderr).slice(0, 300));
  const w = wrong.stdout.split('\n').filter(l => l.startsWith('WARNING'));
  /* With the full Wrong Room (channel 13 = M8 part 3) the pad on 13 is in the rig: three of the four warnings. */
  check(wrong.status === 0 && w.length === 3 && !w.some(l => /no device on that channel/.test(l)) && w.some(l => /effects pedal/.test(l)) && w.some(l => /outside the range/.test(l)) && w.some(l => /is not a CC that/.test(l)),
    'checker: wrong-room-wrong.mid shows the effects, range and CC warnings (channel 13 is in the full rig)', w.join(' | ') || wrong.stderr.slice(0, 300));
  const edited = m[1].replace(/\n    13: \{[^\n]*\n/, '\n');
  writeFileSync(join(dir, 'tabby_check13.py'), edited);
  const w13 = spawnSync(py, ['-I', join(dir, 'tabby_check13.py'), join(root, 'tests/midi-import/fixtures/wrong-room-wrong.mid')], { encoding: 'utf-8' }).stdout.split('\n').filter(l => l.startsWith('WARNING'));
  check(w13.length === 4 && w13.some(l => /no device on that channel/.test(l)), 'checker: with channel 13 removed from RIG the fourth warning (no device) appears', w13.join(' | '));
  const a = text.match(/## Appendix A[\s\S]*?```python\n([\s\S]*?)```/);
  writeFileSync(join(dir, 'example.py'), a[1]);
  const ex = spawnSync(py, ['-I', join(dir, 'example.py')], { cwd: dir, encoding: 'utf-8' });
  const exCheck = spawnSync(py, ['-I', join(dir, 'tabby_check.py'), join(dir, 'example.mid')], { encoding: 'utf-8' });
  check(ex.status === 0 && exCheck.status === 0 && /RESULT: PASS/.test(exCheck.stdout) && !/WARNING/.test(exCheck.stdout), 'Appendix A writes example.mid and the checker passes it with no warning', (exCheck.stdout.split('\n').filter(l => /WARNING|ERROR/.test(l)).join(' | ') || ex.stderr).slice(0, 300));
} else console.log('skip the Python checker (no mido interpreter)');

console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
