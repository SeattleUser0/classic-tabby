// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/page-bundle.mjs — the page's import scripts work the way the page loads them
//
// Purpose
//   tabby-v04.5 was published with a page that could not import a part that needs a v3 clip: web/clip-v3/clip-v3.js
//   was not in the list of scripts tools/linux/build-web.py inlines, and every other test loads the modules through
//   Node's require, where the module is found. This test reads that list out of build-web.py and runs the scripts
//   in its order in a bare context with no require and no module (a browser's classic scripts), then does what the
//   page does: imports MIDI files, among them one whose chord needs a v3 clip and one with controller events, and
//   encodes the songs. With a built page given (argv[2]) it also checks that the page holds every script of the list.
//
//   Run:  /usr/bin/node tests/workbench/page-bundle.mjs [built page .html]   (part of make workbench-test)
//
// Version: 0.1 (2026-11-14, tabby-v04.5.1)

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let failed = 0;
const check = (ok, what, detail = '') => { console.log((ok ? 'ok   ' : 'FAIL ') + what + (detail ? ' — ' + detail : '')); if (!ok) failed++; };

const build = readFileSync(join(root, 'tools/linux/build-web.py'), 'utf8');
const at = build.indexOf('"/*FM1_IMPORT_SCRIPT*/"'), tuple = build.slice(at, build.indexOf(')),', at));
const names = [...tuple.matchAll(/"(web\/[^"]+\.js)"/g)].map(m => m[1]);
check(names.length >= 6 && names.includes('web/clip-v3/clip-v3.js'), 'build-web.py inlines the v3 clip module with the importer', names.join(', '));
check(names.indexOf('web/timed-note/timed-note.js') < names.indexOf('web/clip-v3/clip-v3.js') && names.indexOf('web/clip-v3/clip-v3.js') < names.indexOf('web/import/song-format.js'),
  'load order: timed note, v3 clip, then the song format');

/* A browser-like context: no require, no module; a document only as far as import-ui.js needs at load. */
const sandbox = { console, TextEncoder, TextDecoder, Uint8Array, DataView, Map, Set, JSON, Math, setTimeout };
sandbox.globalThis = sandbox; sandbox.window = sandbox;
sandbox.document = { addEventListener() {}, createElement() { return { style: {}, dataset: {}, append() {}, addEventListener() {}, setAttribute() {} }; }, querySelector() { return null; }, getElementById() { return null; } };
vm.createContext(sandbox);
let loaded = true;
for (const name of names) { try { vm.runInContext(readFileSync(join(root, name), 'utf8'), sandbox, { filename: name }); } catch (e) { loaded = false; check(false, 'script loads without require: ' + name, e.message); } }
check(loaded && sandbox.TabbyClipV3 && sandbox.TabbySongFormat && sandbox.TabbyMidiSong && sandbox.TabbyMidi, 'every script loads in a bare context and defines its global');

const fx = join(root, 'tests/midi-import/fixtures');
const importFile = (name, options = {}) => {
  sandbox.__bytes = new Uint8Array(readFileSync(join(fx, name))); sandbox.__options = { fileName: name, ...options };
  return vm.runInContext('(() => { const a = TabbyMidiSong.analyze(TabbyMidi.parse(__bytes)), r = TabbyMidiSong.convert(a, __options); const file = TabbySongFormat.encodeFile(r.song); return { v3: r.stats.v3Blocks, blocks: r.song.blocks.length, bytes: file.length, format: file[4097], back: TabbySongFormat.decodeFile(file).blocks.length }; })()', sandbox);
};
try {
  const chord = importFile('five-notes.mid');
  check(chord.v3 === 1 && chord.format === 2 && chord.back === chord.blocks, 'in the page\'s context: a six-note chord imports as a v3 clip, encodes and reads back', JSON.stringify(chord));
  const cc = importFile('tempo-cc-program.mid', { controllers: true });
  check(cc.v3 >= 1 && cc.back === cc.blocks, 'in the page\'s context: controller events import into a v3 clip', JSON.stringify(cc));
  const long = importFile('timing-1x16.mid', { rowSteps: 128 });
  check(long.v3 >= 1, 'in the page\'s context: rows of 128 steps import', JSON.stringify(long));
  const plain = importFile('bassline-4bar.mid');
  check(plain.v3 === 0 && plain.format === 1, 'in the page\'s context: a plain part stays a v2 block', JSON.stringify(plain));
} catch (e) { check(false, 'the importer runs in the page\'s context', e.message); }

const page = process.argv[2];
if (page && existsSync(page)) {
  const html = readFileSync(page, 'utf8');
  check(/TabbyClipV3\s*=/.test(html) && /TabbySongFormat\s*=/.test(html) && /TabbyMidiSong\s*=/.test(html), 'the built page holds the v3 clip module, the song format and the importer', page);
} else if (page) check(false, 'the built page exists', page);
console.log(failed ? failed + ' check(s) FAILED' : 'all checks passed (page-bundle)');
process.exit(failed ? 1 : 0);
