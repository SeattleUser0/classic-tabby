// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/wrong-room-loop-sim.mjs — the Wrong Room song looping: every scene entry sends its events; the event lead
//
// Purpose
//   The two-hour soak of tabby-v1.0 showed that a song of two scenes that loops sometimes entered a scene without
//   sending the scene's row events (program changes, bank select, controllers): 136 program changes in one 125 s
//   segment, 68 in another. The audio thread took a scene buffer for "already streamed" when the control task had
//   decoded the same scene into it again before the next audio tick looked (app/song.c, song_switch / prefire).
//   This plays tests/midi-import/fixtures/wrong-room-all.mid with the Wrong Room profile, looping, for LOOPS passes
//   of the song and checks on MIDI out that EVERY entry of scene 1 sends its 17 event messages and every entry of
//   scene 2 its 6, before the scene's first note. It fails on tabby-v1.0 and earlier (from the second loop on).
//
//   Run:  /usr/bin/node tests/workbench/wrong-room-loop-sim.mjs [build/web/simulator.wasm]   (make midi-import-sim)
//
//   tabby-v1.0.2, EVENT LEAD (a song setting, OFF when never set): a scene's events go out that long before its
//   downbeat, so that its first notes do not wait behind them on a shared DIN cable. Checked here:
//     - EVENT LEAD OFF: everything the simulator sends in six passes (every byte of every message, the clock bytes
//       too, with the audio block it left in) is identical to what tabby-v1.0.1 sent: the SHA-256 of that stream is
//       compared with tests/workbench/fixtures/wrong-room-loop-v1.0.1.json, which was made by running this script
//       with --reference against a simulator built from the tag tabby-v1.0.1;
//     - EVENT LEAD 1/16, set on the CLIP SETTING page's last line: every scene entry after the first sends all its
//       events a 16th before the scene's first note (43 blocks at 120 BPM) and the notes are where they were;
//     - a device gap: with the H90's program change moved to the front of scene 2's events and its 255 ms gap
//       behind it, the next message leaves 255 ms after that program change and the last one still a 16th before
//       the first note: the gap is counted from the message it follows, the lead is added in front.
//
//   Run:  /usr/bin/node tests/workbench/wrong-room-loop-sim.mjs [build/web/simulator.wasm] [--reference]
//
// Version: 0.2
//
// Revision log
//   v0.2  2026-11-18  tabby-v1.0.2: EVENT LEAD (OFF identical to tabby-v1.0.1; 1/16; with a gap).
//   v0.1  2026-11-18  First version (tabby-v1.0.1).

import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const Midi = require(join(root, 'web/import/midi-parse.js'));
const Format = require(join(root, 'web/import/song-format.js'));
const Song = require(join(root, 'web/import/midi-song.js'));
const D = require(join(root, 'web/rig/device-library.js'));
const Rig = require(join(root, 'web/rig/rig.js'));
const wasmPath = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : join(root, 'build/web/simulator.wasm');
const REFERENCE = process.argv.includes('--reference');
const SLOT = 3, FM6 = 0;
let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

/* ---- 1. import with the rig, as the workbench does ------------------------------------------ */
const ddir = join(root, 'web/devices');
const library = D.load(readdirSync(ddir).filter(n => n.endsWith('.json')).sort().map(n => JSON.parse(readFileSync(join(ddir, n), 'utf8'))));
const [rig] = Rig.rigBuiltins([JSON.parse(readFileSync(join(root, 'web/rig/profiles/wrong-room.json'), 'utf8'))]);
const analysis = Song.analyze(Midi.parse(new Uint8Array(readFileSync(join(root, 'tests/midi-import/fixtures/wrong-room-all.mid')))));
const LOOPS = 6;
const result = Song.convert(analysis, { fileName: 'wrong-room-all.mid', rig, library, name: 'WRONG ROOM', projectSlot: 0, loop: true });
const song = { ...result.song, events: Rig.applyGaps(result.song.events, rig, library) };   /* the editor's write path applies the gaps */
check(Format.validate(song).ok && song.outChannels.join() === '0,1,2,3,4,5,9,8' && !result.warnings.some(w => w.severity === 'warn'), 'the fixture imports with every OUT CH from the file and no warning');
const gaps = song.events.filter(e => e.type === 3);
check(gaps.length === 0 && song.events.filter(e => e.channel === 14).length === 2, 'the H90 is last in each row\'s stream, so its gap ends the stream and is dropped (nothing waits on it)', JSON.stringify(gaps));
const tempo = song.tempo, U = 480, blockOf = u => Math.ceil((u + 1) * 11025 / (tempo * 1024)) - 1;
const rowStart = [0, 64 * U];   /* two rows of 64 steps, repeat 1 each (events in both rows) */
check(song.rows.length === 2 && song.rows.every(r => r.repeat === 1 && r.steps === 64), 'two rows of 64 steps, repeat 1');
/* pitches per part (channel 0-based): the fixture plays pitch and pitch + 3 alternately */
const pitches = { 0: [36, 39], 1: [60, 63], 2: [67, 70], 3: [48, 51], 4: [55, 58], 5: [59, 62], 9: [40, 43], 8: [64, 67] };

/* ---- 2. play: one fresh simulator per run ----------------------------------------------------- */
import { createHash } from 'node:crypto';
const wasm = new WebAssembly.Module(readFileSync(wasmPath));
function play(theSong, lead) {
  const c = new WebAssembly.Instance(wasm, {}).exports;
  c._initialize(); c.sim_boot(1);
  const mem = () => new Uint8Array(c.memory.buffer);
  for (let t = 0; t < 8; t++) c.sim_select(t, FM6);
  mem().set(Format.encodeRecord(theSong), c.sim_file());
  if (c.sim_song_record_write(SLOT) !== 0) return null;
  { let parts = [], total = 0, fill = 0, sectors = 1; const batches = [];
    for (const b of theSong.blocks.slice().sort((a, b) => a.id - b.id)) {
      const rec = Format.encodeBlockRecord(b, 0), size = rec.length;
      if (fill + size > 4076) { if (sectors === 8) { batches.push([parts, total]); parts = []; total = 0; sectors = 0; } sectors++; fill = 0; }
      parts.push(rec); total += size; fill += size;
    }
    if (parts.length) batches.push([parts, total]);
    for (const [ps, total] of batches) { let at = c.sim_batch_buffer(); for (const p of ps) { mem().set(p, at); at += p.length; } if (c.sim_block_batch(SLOT, total)) return null; } }
  c.sim_midi_ports(1, 0);
  if (c.sim_song_load(SLOT) !== 0) return null;
  const step = n => { for (let i = 0; i < n; i++) c.sim_render(); };
  let leadSeen = null;
  if (lead) {                                        /* the panel: BT (CLIPS), FX (CLIP SETTING), K5 to the last line, K1 */
    const press = id => { c.sim_smk37(0, id, 1); step(8); c.sim_smk37(0, id, 0); step(4); };
    step(40); press(11); step(20); press(14); step(10); c.sim_smk37(4, 4, 40); step(8); c.sim_smk37(4, 0, lead); step(8);
    const n = c.sim_setup_state(), d = mem().subarray(c.sim_file(), c.sim_file() + n); leadSeen = n > 38 ? d[38] : -1;
  }
  c.sim_midi_drain(1); c.sim_midi_capture(1);
  if (c.sim_song_play() !== 0) return null;
  const events = [], hash = createHash('sha256');
  const limit = blockOf(LOOPS * 128 * U) + 20;
  for (let block = 0; block < limit; block++) {
    c.sim_render();
    for (;;) { const w = c.sim_midi_output() >>> 0; if (!w) break; const n = w & 255, port = w >>> 8, d = mem().subarray(c.sim_file(), c.sim_file() + n);
      if (port !== 0) continue;
      hash.update(Uint8Array.from([block & 255, block >> 8 & 255, block >> 16 & 255, n, ...d]));
      if (d[0] !== 0xf8) events.push({ index: events.length, block, status: d[0], d1: n > 1 ? d[1] : 0, d2: n > 2 ? d[2] : 0 }); }
  }
  return { events, sha: hash.digest('hex'), late: (c.sim_song_status(2) >>> 16) & 0xffff, leadSeen };
}
const isEvent = e => (e.status & 0xf0) === 0xc0 || (e.status & 0xf0) === 0xb0;
const isOn = e => (e.status & 0xf0) === 0x90 && e.d2 > 0;
/* per scene entry n (scene 1 when n is even): the events sent since the previous entry's first note and before this
 * entry's first note, and how many blocks before that note the last of them left */
function entries(events) {
  const ons = events.filter(isOn), out = [];
  for (let n = 0; n < 2 * LOOPS; n++) {
    const first = ons.find(e => e.block >= blockOf(n * 64 * U) - 1);
    const prevFirst = n ? ons.find(e => e.block >= blockOf((n - 1) * 64 * U) - 1) : null;
    const mine = first ? events.filter(e => isEvent(e) && e.index < first.index && (!prevFirst || e.index > prevFirst.index)) : [];
    out.push({ count: first ? mine.length : -1, ahead: mine.length ? first.block - mine[mine.length - 1].block : 0, firstBlock: first ? first.block : -1, list: mine });
  }
  return out;
}
const refPath = join(root, 'tests/workbench/fixtures/wrong-room-loop-v1.0.1.json');

/* ---- 3. EVENT LEAD OFF: every entry sends its events; the output is tabby-v1.0.1's, byte for byte ---- */
const off = play(song, 0);
check(off, 'the song is written and played for ' + LOOPS + ' passes');
if (REFERENCE) {
  const { writeFileSync, mkdirSync } = await import('node:fs');
  mkdirSync(dirname(refPath), { recursive: true });
  writeFileSync(refPath, JSON.stringify({ comment: 'tests/workbench/wrong-room-loop-sim.mjs --reference, on a simulator built from the tag tabby-v1.0.1: the SHA-256 over every message of port 0 in ' + LOOPS + ' passes of the looping Wrong Room song (block number as 3 bytes, length, bytes), and the number of messages without the clock bytes.', passes: LOOPS, sha256: off.sha, messages: off.events.length }, null, 1) + '\n');
  console.log('reference written: ' + off.sha + ' (' + off.events.length + ' messages)'); process.exit(0);
}
const eOff = entries(off.events);
check(eOff.every((e, n) => e.count === (n % 2 ? 6 : 17)), 'EVENT LEAD OFF: every entry of scene 1 sends its 17 event messages and every entry of scene 2 its 6, before the scene\'s first note', eOff.map(e => e.count).join(' '));
check(eOff.slice(1).every(e => e.ahead <= 1), 'EVENT LEAD OFF: they leave at the downbeat, in the block of the scene\'s first note', eOff.map(e => e.ahead).join(' '));
{ let ref = null; try { ref = JSON.parse(readFileSync(refPath, 'utf8')); } catch (e) { ref = null; }
  check(ref && ref.passes === LOOPS && ref.sha256 === off.sha && ref.messages === off.events.length, 'EVENT LEAD OFF: every byte the song sends, in its audio block, is what tabby-v1.0.1 sent (' + off.events.length + ' messages and the clock; SHA-256 ' + off.sha.slice(0, 16) + ')', ref ? ref.sha256.slice(0, 16) + ', ' + ref.messages + ' messages' : 'no reference file'); }
check(off.late === 0, 'no late row', String(off.late));

/* ---- 4. EVENT LEAD 1/16 ------------------------------------------------------------------------- */
const on = play(song, 2);
const eOn = entries(on.events), LEAD = blockOf(U);          /* a 16th in blocks: 43 at 120 BPM */
check(on.leadSeen === 2, 'CLIP SETTING, the last line: K1 two clicks right sets EVENT LEAD 1/16 (the page reports ' + on.leadSeen + ')');
check(eOn.every((e, n) => e.count === (n % 2 ? 6 : 17)), 'EVENT LEAD 1/16: every scene entry still sends all its events before its first note', eOn.map(e => e.count).join(' '));
check(eOn.slice(1).every(e => e.ahead >= LEAD - 2 && e.ahead <= LEAD + 3), 'EVENT LEAD 1/16: from the second entry on the last event leaves a 16th before the scene\'s first note (' + LEAD + ' blocks)', eOn.map(e => e.ahead).join(' '));
check(eOn[0].ahead <= 1, 'the first entry, at SEQ PLAY, has no lead (SEND SETUP is for that)', String(eOn[0].ahead));
{ const a = off.events.filter(e => (e.status & 0xe0) === 0x80).map(e => [e.block, e.status, e.d1, e.d2].join()), b = on.events.filter(e => (e.status & 0xe0) === 0x80).map(e => [e.block, e.status, e.d1, e.d2].join());
  check(a.length === b.length && a.every((x, i) => x === b[i]), 'EVENT LEAD 1/16: every note-on and note-off is in the block it was in with the lead off (' + a.length + ' messages)'); }
check(on.late === 0, 'no late row', String(on.late));

/* ---- 5. a device gap inside the stream: counted from its message; the lead in front ---------------- */
{ const ev = song.events.map(e => ({ ...e })), h90 = ev.find(e => e.row === 1 && e.channel === 14 && (e.type === 0 || e.type === 1));
  const rest = ev.filter(e => e !== h90), at = rest.findIndex(e => e.row === 1);
  rest.splice(at, 0, h90, { row: 1, channel: 14, type: 3, d0: 255, d1: 0, d2: 0 });
  const gapSong = { ...song, events: rest };
  check(h90 && Format.validate(gapSong).ok, 'a variant of the song: the H90\'s program change first in scene 2, its gap of 255 ms behind it');
  const g = play(gapSong, 2), eg = entries(g.events), GAP = Math.ceil(255 * 11025 / (1000 * 32)) ;   /* 255 ms in blocks of 128 frames at 44100 Hz: 88 */
  const ok = eg.filter((e, n) => n % 2 === 1).map(e => { const pc = e.list.findIndex(x => (x.status & 0xf0) === 0xc0 && (x.status & 15) === 14); const next = e.list[pc + 1];
    return { n: e.count, wait: pc === 0 && next ? next.block - e.list[0].block : -1, ahead: e.ahead }; });
  check(ok.length === LOOPS && ok.every(o => o.n === 6 && o.wait >= GAP - 1 && o.wait <= GAP + 2 && o.ahead >= LEAD - 2 && o.ahead <= LEAD + 3),
    'at every entry of scene 2 the H90\'s program change goes first, the next message ' + GAP + ' blocks (255 ms) after it, and the last message a 16th before the first note', ok.map(o => o.n + ':' + o.wait + ':' + o.ahead).join(' '));
  check(g.late === 0, 'no late row', String(g.late)); }
console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
