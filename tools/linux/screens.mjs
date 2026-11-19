// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tools/linux/screens.mjs — pictures of every screen page, taken from the simulator
//
// Purpose
//   Drives the simulator (build/web/simulator.wasm: the firmware's own screen code) through the panel to every page
//   and writes what the 240 x 240 screen shows as PNG files, twice the size (480 x 480), into OUT. The manual's
//   pictures (docs/manual/screens/, tools/linux/guide-html.py) are made with this, so a picture in the manual is
//   what the firmware draws. A song with clips, scenes and row events is put into the simulator's song storage first
//   (tests/midi-import/fixtures/wrong-room-all.mid with the Wrong Room profile, as tools/linux/hw/rig-song.mjs).
//
//   node tools/linux/screens.mjs OUT [--list]        (after make web)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-19  First version (tabby-v1.1: the readable screen).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { deflateSync, crc32 } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);
const Midi = require(join(root, 'web/import/midi-parse.js')), Song = require(join(root, 'web/import/midi-song.js')), Format = require(join(root, 'web/import/song-format.js'));
const D = require(join(root, 'web/rig/device-library.js')), Rig = require(join(root, 'web/rig/rig.js'));
const out = process.argv[2];
if (!out) { console.error('usage: node tools/linux/screens.mjs OUT'); process.exit(2); }
mkdirSync(out, { recursive: true });
const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(join(root, 'build/web/simulator.wasm'))), {}).exports;
c._initialize(); c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
const step = n => { for (let i = 0; i < n; i++) c.sim_render(); };
const W = 240, H = 240, Z = 2;
function png(name) {
  const p = new Uint16Array(c.memory.buffer, c.sim_pixels(), W * H), raw = Buffer.alloc((W * Z * 3 + 1) * H * Z);
  for (let y = 0; y < H * Z; y++) { const row = y * (W * Z * 3 + 1); raw[row] = 0;
    for (let x = 0; x < W * Z; x++) { const v = p[(y / Z | 0) * W + (x / Z | 0)], o = row + 1 + 3 * x; raw[o] = (v >> 11 & 31) * 255 / 31; raw[o + 1] = (v >> 5 & 63) * 255 / 63; raw[o + 2] = (v & 31) * 255 / 31; } }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W * Z, 0); ihdr.writeUInt32BE(H * Z, 4); ihdr[8] = 8; ihdr[9] = 2;
  writeFileSync(join(out, name + '.png'), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
  names.push(name);
}
const names = [];
const BUTTON = 0, PAD = 3, KNOB = 4;
const B = { KB: 0, FADER: 1, LEFT: 2, SAVE: 3, OCTM: 4, OCTP: 5, ARP: 6, NR: 7, SCALE: 8, CHORD: 9, GLOBE: 10, BT: 11, PATCH: 12, PARA: 13, FX: 14, SEQ: 15, PLAY: 16, REC: 17 };
const down = id => { c.sim_smk37(BUTTON, id, 1); step(8); }, up = id => { c.sim_smk37(BUTTON, id, 0); step(8); };
const press = id => { down(id); up(id); };
const pad = (i, hold = 8) => { c.sim_smk37(PAD, i, 100); step(hold); c.sim_smk37(PAD, i, 0); step(8); };
const knob = (k, d) => { c.sim_smk37(KNOB, k, d); step(8); };
const settle = () => step(900);          /* notices gone (they last up to two seconds) */
const home = () => { for (let i = 0; i < 3; i++) press(B.PATCH); c.sim_release(); step(20); press(B.LEFT); step(20); };

/* ---- the song: the Wrong Room fixture with its rig, looping, in slot 1 ---- */
{ const ddir = join(root, 'web/devices');
  const library = D.load(readdirSync(ddir).filter(n => n.endsWith('.json')).sort().map(n => JSON.parse(readFileSync(join(ddir, n), 'utf8'))));
  const [rig] = Rig.rigBuiltins([JSON.parse(readFileSync(join(root, 'web/rig/profiles/wrong-room.json'), 'utf8'))]);
  const r = Song.convert(Song.analyze(Midi.parse(new Uint8Array(readFileSync(join(root, 'tests/midi-import/fixtures/wrong-room-all.mid'))))), { fileName: 'wrong-room-all.mid', rig, library, name: 'WRONG ROOM', projectSlot: 0, loop: true });
  const song = { ...r.song, events: Rig.applyGaps(r.song.events, rig, library) };
  mem().set(Format.encodeRecord(song), c.sim_file()); c.sim_song_record_write(0);
  let at = c.sim_batch_buffer(), total = 0;
  for (const b of song.blocks.slice().sort((a, b) => a.id - b.id)) { const rec = Format.encodeBlockRecord(b, 0); mem().set(rec, at); at += rec.length; total += rec.length; }
  c.sim_block_batch(0, total); c.sim_song_load(0); }

step(60); png('boot');
step(1500);
png('home');
down(B.KB); step(200); png('knob-bank'); c.sim_smk37(PAD, 2, 100); step(40); png('knob-bank-track'); c.sim_smk37(PAD, 2, 0); up(B.KB); settle();
down(B.KB); c.sim_smk37(PAD, 0, 100); step(20); c.sim_smk37(PAD, 0, 0); up(B.KB); settle();
press(B.SEQ); settle(); png('sync-midi');
down(B.KB); press(B.SEQ); up(B.KB); settle(); png('midi-track'); press(B.PATCH); settle();
press(B.PARA); settle(); png('para'); press(B.PATCH); settle();
press(B.FX); settle(); png('fx'); press(B.PATCH); settle();
press(B.GLOBE); settle(); png('mixer'); press(B.GLOBE); settle(); press(B.PATCH); settle();
down(B.ARP); step(400); png('arp'); up(B.ARP); press(B.PATCH); settle();
down(B.KB); press(B.PATCH); up(B.KB); settle(); png('source'); press(B.PATCH); settle();
down(B.SEQ); press(B.PARA); up(B.SEQ); settle(); png('actions'); press(B.SAVE); step(20); press(B.PATCH); settle(); knob(0, 3); press(B.SAVE); step(30); png('actions-confirm'); press(B.PATCH); settle();
home(); settle();
press(B.PATCH); settle(); png('projects'); press(B.PATCH); settle();
home(); settle();
press(B.BT); settle(); png('clips-stopped');
press(B.SCALE); settle(); png('scenes-stopped');
press(B.PLAY); step(600); png('scenes-playing'); pad(1); step(120); png('scenes-queued');
press(B.SCALE); step(700); png('clips-playing');
pad(1); step(60); png('clips-queued'); step(1500);
pad(1, 250); settle(); press(B.PARA); settle(); png('step'); pad(0); step(40); png('step-selected'); pad(0); press(B.PARA); settle();
press(B.FX); settle(); png('setting-1'); knob(4, 9); settle(); png('setting-2'); knob(4, 8); settle(); png('setting-3'); press(B.FX); settle();
press(B.REC); step(200); png('clips-recording'); press(B.REC); settle();
press(B.SAVE); step(40); png('clips-stop-to-save'); settle();
press(B.PLAY); settle();
console.log(names.join(' '));
