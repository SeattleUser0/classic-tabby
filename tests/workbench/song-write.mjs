// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/song-write.mjs — the workbench's shared song write path against a fake device
//
// Purpose
//   Task 03 checkpoint (f): Library.songWrite (sdk/WebUpdate.js) is the one path through which
//   the song editor and the MIDI importer write a song to a device. This test loads
//   WebUpdate.js under Node, gives a Library instance a fake `query` that models the device's
//   transfer protocol (commands 1..6, kinds 5 and 7, command 23) and checks the command
//   sequence and the device state:
//     1. a write into an empty slot: kind-5 download begin (empty), no delete, the record
//        (kind 5), the blocks as kind-7 batches, the record read back; result.replaced false;
//     2. a write into the occupied slot: the existing song is deleted first (kind 5 upload of
//        an all-0xFF image), then record, batches, read-back; result.replaced true; only the
//        new song's blocks remain on the fake device;
//     3. songRecordParse rejects a tempo override outside 30..300 (0 stays valid), as the
//        device does since (f);
//     4. songDelete sends the all-0xFF record.
//
//   Run:  /usr/bin/node tests/workbench/song-write.mjs      (or: make workbench-test)
//   Exit status 0 on success; every check prints "ok" or "FAIL".
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-02  Initial version (Task 03 checkpoint f).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let failures = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failures++; };

/* WebUpdate.js is a classic script: give it the browser globals it touches at load. */
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', requestMIDIAccess: () => Promise.reject(new Error('no midi')) }, configurable: true });
globalThis.window = globalThis;
globalThis.document = { addEventListener() {}, querySelector() { return null; }, getElementById() { return null; } };
globalThis.location = { search: '' };
(0, eval)(readFileSync(join(root, 'web/timed-note/timed-note.js'), 'utf8'));   /* Task 05: WebUpdate.js uses TabbyTimedNote */
(0, eval)(readFileSync(join(root, 'sdk/WebUpdate.js'), 'utf8'));
const W = globalThis.FM1Web;

/* ---- the fake device: records and blocks per slot, one transfer session ---------------- */
const device = { records: new Map(), blocks: new Map(), session: null, log: [] };
const deviceError = code => Object.assign(new Error('device code ' + code), { deviceCode: code });
const le16 = (b, at) => b[at] | b[at + 1] << 8;
async function query(cmd, payload = []) {
  const d = device, p = Uint8Array.from(payload);
  if (cmd === 23) return Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0]);
  if (cmd === 1) {                                         /* download begin */
    if (p[0] !== 5) throw deviceError(71);
    const rec = d.records.get(p[1]); d.log.push('read-begin 5/' + p[1] + (rec ? '' : ' (empty)'));
    if (!rec) throw deviceError(1);
    d.session = { kind: 5, buf: rec, writing: false }; return Uint8Array.from([0, 16]);
  }
  if (cmd === 2) { const at = le16(p, 0), n = p[2]; return d.session.buf.slice(at, at + n); }
  if (cmd === 3) {                                         /* upload begin */
    const kind = p[0], target = p[1], size = le16(p, 2);
    if (kind !== 5 && kind !== 7) throw deviceError(71);
    d.session = { kind, target, size, buf: new Uint8Array(size), at: 0, writing: true }; d.log.push('upload-begin ' + kind + '/' + target + ' ' + size); return new Uint8Array(0);
  }
  if (cmd === 4) { const at = le16(p, 0); d.session.buf.set(p.subarray(2), at); d.session.at = at + p.length - 2; return new Uint8Array(0); }
  if (cmd === 5) {                                         /* finish */
    const s = d.session; if (!s || !s.writing || s.at !== s.size) throw deviceError(71);
    if (s.kind === 5) {
      if (String.fromCharCode(...s.buf.subarray(0, 4)) === 'FM1G') { d.records.set(s.target, s.buf); d.log.push('record stored ' + s.target); }
      else { d.records.delete(s.target); d.blocks.delete(s.target); d.log.push('record deleted ' + s.target); }
    } else {
      const map = d.blocks.get(s.target) ?? new Map(); d.blocks.set(s.target, map); let at = 0, n = 0;
      while (at < s.size) { const id = le16(s.buf, at + 2), len = le16(s.buf, at + 4); map.set(id, s.buf.slice(at + 6, at + 6 + len)); at = (at + 6 + len + 3) & ~3; n++; }
      d.log.push('batch stored ' + s.target + ' ' + n + ' blocks');
    }
    d.session = null; return new Uint8Array(0);
  }
  if (cmd === 6) { d.session = null; return new Uint8Array(0); }
  throw deviceError(71);
}
const lib = Object.create(W.Library.prototype);
lib.songStorage = true; lib.songBatch = true; lib.timedNotes = true; lib.link = { lost: false }; lib.query = query;

/* ---- songs A (blocks 1, 2) and B (block 3) ---------------------------------------------- */
const song = (name, ids) => Object.assign(W.songEmpty(), { name, rows: [{ block: [...ids, ...Array(8 - ids.length).fill(0)], repeat: 1, loopHere: false, steps: 64 }] });
const empty = new Uint8Array(64);                           /* 64 empty steps = a valid block */
const A = W.songRecordBuild(song('SONG A', [1, 2])), B = W.songRecordBuild(song('SONG B', [3]));

const r1 = await lib.songWrite(2, A, new Map([[1, empty], [2, empty]]));
check(r1.replaced === false && device.log.join(' | ') === 'read-begin 5/2 (empty) | upload-begin 5/2 4096 | record stored 2 | upload-begin 7/2 144 | batch stored 2 2 blocks | read-begin 5/2',
  'empty slot: no delete; record first, one kind-7 batch, record read back', device.log.join(' | '));
check(device.records.has(2) && [...device.blocks.get(2).keys()].join(',') === '1,2', 'fake device holds A with blocks 1 and 2');
device.log.length = 0;
const r2 = await lib.songWrite(2, B, new Map([[3, empty]]));
check(r2.replaced === true && device.log.join(' | ') === 'read-begin 5/2 | upload-begin 5/2 4096 | record deleted 2 | upload-begin 5/2 4096 | record stored 2 | upload-begin 7/2 72 | batch stored 2 1 blocks | read-begin 5/2',
  'occupied slot: deleted first (all-0xFF record), then record, batch, read back', device.log.join(' | '));
check([...device.blocks.get(2).keys()].join(',') === '3' && W.songRecordParse(device.records.get(2)).name === 'SONG B', 'fake device holds B only (A\'s blocks gone with the delete)');
check(r2.record instanceof Uint8Array && r2.record.subarray(20, 2624).every((v, i) => v === B[20 + i]), 'the read-back record is returned');
device.log.length = 0;
await lib.songDelete(2);
check(device.log.join(' | ') === 'upload-begin 5/2 4096 | record deleted 2' && !device.records.has(2), 'songDelete sends the all-0xFF record');
const t = W.songRecordBuild(song('TEMPO', [1])); t[38] = 20; t[39] = 0; new DataView(t.buffer).setUint32(12, W.crc32(t.subarray(20, 2624)), true);
let threw = ''; try { W.songRecordParse(t); } catch (e) { threw = e.message; }
check(/30/.test(threw), 'songRecordParse rejects a tempo override of 20', threw);
let okTempo = true; try { W.songRecordParse(W.songRecordBuild(Object.assign(song('T300', [1]), { tempo: 300 }))); } catch (e) { okTempo = false; }
check(okTempo, 'songRecordParse accepts a tempo override of 300');
console.log(failures ? `${failures} check(s) FAILED` : 'all checks passed');
process.exit(failures ? 1 : 0);
