// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tools/linux/midi-guide.mjs — write docs/MIDI-GUIDE.md from the rig profile and the device library
//
// Purpose
//   Task 09. The guide's channel map, device sections, rig tables and Appendix B's RIG dict are
//   generated, never typed: this tool runs web/rig/guide.js under Node on the built-in profile
//   (web/rig/profiles/wrong-room.json by default), the device definitions (web/devices/*.json)
//   and the hand-written template (docs/MIDI-GUIDE.template.md), and writes docs/MIDI-GUIDE.md.
//   The version line comes from tools/linux/display_version.py unless --version is given (the
//   release build passes the tag, as it does for the firmware); the test compares the committed
//   file with a fresh build ignoring that line.
//
//   Usage: /usr/bin/node tools/linux/midi-guide.mjs [--profile web/rig/profiles/wrong-room.json]
//            [--version tabby-v03.2] [--out docs/MIDI-GUIDE.md] [--print]
//          (or: make midi-guide)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-05  Initial version (Task 09, checkpoint c).

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : dflt; };

export function buildGuide({ profile = join(root, 'web/rig/profiles/wrong-room.json'), version, date } = {}) {
  const D = require(join(root, 'web/rig/device-library.js'));
  const Rig = require(join(root, 'web/rig/rig.js'));
  require(join(root, 'web/import/song-format.js'));
  const G = require(join(root, 'web/rig/guide.js'));
  const dir = join(root, 'web/devices');
  const library = D.load(readdirSync(dir).filter(n => n.endsWith('.json')).sort().map(n => JSON.parse(readFileSync(join(dir, n), 'utf8'))));
  if (library.problems.length) throw new Error('device library: ' + JSON.stringify(library.problems));
  const [rig] = Rig.rigBuiltins([JSON.parse(readFileSync(profile, 'utf8'))]);
  if (!rig) throw new Error('not a tabby-rig/1 profile: ' + profile);
  const template = readFileSync(join(root, 'docs/MIDI-GUIDE.template.md'), 'utf8');
  if (!version) {
    const r = spawnSync('python3', ['-I', join(root, 'tools/linux/display_version.py')], { encoding: 'utf-8' });
    version = r.status === 0 ? r.stdout.trim() : 'development';
  }
  return { text: G.build({ rig, library, template, version, date: date || 'from the committed profile and definitions' }), rig, library, version };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = opt('--out', join(root, 'docs/MIDI-GUIDE.md'));
  const { text, rig, version } = buildGuide({ profile: opt('--profile', undefined), version: opt('--version', undefined) });
  if (args.includes('--print')) process.stdout.write(text);
  else { writeFileSync(out, text); console.log('wrote', out, 'for rig "' + rig.name + '", version', version, '(' + text.length + ' bytes)'); }
}
