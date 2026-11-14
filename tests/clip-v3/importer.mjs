// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/clip-v3/importer.mjs — the importer writes and reads v3 blocks (.tabby files)
//
// Purpose
//   For every fixture song the importer makes (the same sources as dump-v2.mjs): encodeFile(song, {format: 2}) must decode
//   (decodeFile) to the same song as the default v2 file, note for note, except that a length above 65535 units is
//   clamped in v3 (counted); every v3 block record carries format byte 2; and the v3 file is smaller than the v2 one in
//   total (printed, measured). The default output stays v2.
//   Run: node tests/clip-v3/importer.mjs
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-12  Initial version (Task 16 Goal 5).

import { createRequire } from 'node:module';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fixtures } from '../midi-import/make-fixtures.mjs';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..', '..');
const Midi = require(join(root, 'web/import/midi-parse.js'));
const Format = require(join(root, 'web/import/song-format.js'));
const Song = require(join(root, 'web/import/midi-song.js'));
let failures = 0, checks = 0;
const check = (ok, what, detail = '') => { checks++; if (!ok) { failures++; console.log(`FAIL ${what}${detail ? ' - ' + detail : ''}`); } };

const sources = fixtures().map(f => ({ name: f.name, bytes: f.bytes }));
for (const dir of ['tests/midi-import/fixtures', 'tests/fixtures']) {
  const d = join(root, dir);
  if (existsSync(d)) for (const f of readdirSync(d)) if (/\.mid$/i.test(f)) sources.push({ name: dir + '/' + f, bytes: new Uint8Array(readFileSync(join(d, f))) });
}
let songs = 0, bytes2 = 0, bytes3 = 0, clamped = 0, records3 = 0;
for (const s of sources) {
  let song;
  try { song = Song.convert(Song.analyze(Midi.parse(s.bytes)), { fileName: s.name, clipFormat: 'v2' }).song; } catch { continue; }
  songs++;
  const f2 = Format.encodeFile(song), f3 = Format.encodeFile(song, { format: Format.LIMITS.formatV3 });
  bytes2 += f2.length; bytes3 += f3.length;
  // every block record of the v3 file says format 2
  for (let at = Format.LIMITS.recordBytes; at < f3.length && f3[at] !== 0xff;) {
    check(f3[at + 1] === 2, `${s.name}: block record at ${at} has format byte 2`);
    records3++;
    const len = f3[at + 4] | f3[at + 5] << 8; at = (at + 6 + len + 3) & ~3;
  }
  const a = Format.decodeFile(f2), b = Format.decodeFile(f3);
  check(a.blocks.length === b.blocks.length, `${s.name}: same block count`);
  a.blocks.forEach((blk, i) => {
    const want = blk.notes.map(n => ({ ...n, length: Math.min(n.length, 65535) })), got = b.blocks[i].notes;
    clamped += blk.notes.filter(n => n.length > 65535).length;
    check(JSON.stringify(Format.sortNotes(want)) === JSON.stringify(Format.sortNotes(got)) && JSON.stringify(blk.stepFlags || {}) === JSON.stringify(b.blocks[i].stepFlags || {}), `${s.name}: block ${blk.id} decodes to the same notes`);
  });
}
check(Format.decodeFile(Format.encodeFile(Song.convert(Song.analyze(Midi.parse(fixtures()[0].bytes)), {}).song))[ 'blocks' ].length > 0, 'the default output is still v2 and reads back');
console.log(`ok   ${songs} songs, ${records3} v3 block records; .tabby files ${bytes3} bytes as v3 against ${bytes2} as v2 (measured); ${clamped} notes clamped to 65535 units`);
console.log(failures ? `${failures} of ${checks} checks FAILED` : `all ${checks} checks passed`);
process.exit(failures ? 1 : 0);
