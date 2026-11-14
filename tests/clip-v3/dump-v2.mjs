// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/clip-v3/dump-v2.mjs — the v2 block payloads the importer makes for every fixture, as one binary file
//
// Purpose
//   tests/host/clip_v3_test.c migrates real v2 blocks, not only random ones. This script runs the importer
//   (web/import/*.js, as the browser loads them) over every .mid in tests/midi-import/fixtures/, tests/fixtures/ and
//   the generated fixtures of make-fixtures.mjs, and writes every block's v2 payload to the file named by argv[2]
//   (default build/clip-v3/fixtures-v2.bin) as u16 length + payload, repeated. It prints the counts.
//
//   Run: node tests/clip-v3/dump-v2.mjs [out.bin]
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-12  Initial version (Task 16 Goal 5).

import { createRequire } from 'node:module';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fixtures } from '../midi-import/make-fixtures.mjs';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..', '..');
const Midi = require(join(root, 'web/import/midi-parse.js'));
const Format = require(join(root, 'web/import/song-format.js'));
const Song = require(join(root, 'web/import/midi-song.js'));

const sources = fixtures().map(f => ({ name: f.name, bytes: f.bytes }));
for (const dir of ['tests/midi-import/fixtures', 'tests/fixtures']) {
  const d = join(root, dir);
  if (existsSync(d)) for (const f of readdirSync(d)) if (/\.mid$/i.test(f)) sources.push({ name: dir + '/' + f, bytes: new Uint8Array(readFileSync(join(d, f))) });
}
const out = [];
let songs = 0, blocks = 0, skipped = 0;
for (const s of sources) {
  let result;
  try { result = Song.convert(Song.analyze(Midi.parse(s.bytes)), { fileName: s.name, clipFormat: 'v2' }); } catch (e) { skipped++; continue; }
  songs++;
  for (const b of result.song.blocks) {
    const p = Format.encodeBlock(b, 'block ' + b.id);
    out.push(Uint8Array.of(p.length & 255, p.length >> 8), p); blocks++;
  }
}
const file = process.argv[2] || join(root, 'build/clip-v3/fixtures-v2.bin');
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, Buffer.concat(out));
console.log(`dump-v2: ${songs} songs, ${blocks} blocks, ${skipped} sources skipped, written to ${file}`);
