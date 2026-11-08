// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/backup.mjs — the workbench's full backup, restore and verify, end to end
//
// Purpose
//   Task 11 Step 2: Library.fullBackup / fullRestore / fullVerify (sdk/WebUpdate.js) drive the
//   real device code (app/transfer.c, app/project.c, app/song_storage.c) compiled into the
//   simulator wasm, through a fake MIDI link that feeds the workbench's own SysEx frames to
//   sim_midi and parses the replies with demoParse. Three simulators:
//     NORMAL  build/web/simulator.wasm            stock layout, no kind 8 (as tabby-v03.2)
//     DIAG    build/web-diag/simulator.wasm       stock layout, diagnostic build (kind 8)
//     PROBE   build/web-probe64/simulator.wasm    USER 471040, diagnostic build (the probe)
//   Checks:
//     1. DIAG: projects in slots 1, 4 and 16 (slot 16 carries the device settings), changed
//        device and session settings, an unsaved workspace, two songs with blocks; backup,
//        wipe (erase the simulated flash and reboot), restore, verify passes; a second backup
//        is identical to the first apart from the creation time (byte-identical contents);
//     2. a truncated file, a file with a flipped payload byte, a wrong version and missing
//        counts are refused before anything is written (the flash revision does not move);
//     3. the DIAG file (USER 536576) restores into a clean PROBE simulator (USER 471040) and
//        verifies;
//     4. the move itself: the PROBE simulator boots on the DIAG simulator's flash as the probe
//        firmware will see the real device's flash (the same bytes, the base 64 KiB higher),
//        reports its song storage, the old data is erased as ACTIONS > ERASE OLD would, and the
//        file restores and verifies;
//     5. NORMAL: backup / wipe / restore / verify round trip without kind 8, with the note that
//        settings are not in the file; the capability reply keeps bits 6 and 7 clear;
//     6. DIAG: command 25 reads and resets the counters (loop count and mean after a reset).
//
//   Run:  /usr/bin/node tests/workbench/backup.mjs NORMAL.wasm DIAG.wasm PROBE.wasm
//         (or: make backup-test, which builds the three)
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-07  Initial version (Task 11 Step 2).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [normalPath, diagPath, probePath] = [2, 3, 4].map((i, k) => process.argv[i] ||
  join(root, ['build/web/simulator.wasm', 'build/web-diag/simulator.wasm', 'build/web-probe64/simulator.wasm'][k]));

Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', requestMIDIAccess: () => Promise.reject(new Error('no midi')) }, configurable: true });
globalThis.window = globalThis;
globalThis.document = { addEventListener() {}, querySelector() { return null; }, getElementById() { return null; } };
globalThis.location = { search: '' };
(0, eval)(readFileSync(join(root, 'web/timed-note/timed-note.js'), 'utf8'));
(0, eval)(readFileSync(join(root, 'sdk/WebUpdate.js'), 'utf8'));
const W = globalThis.FM1Web;

let failed = 0, passed = 0;
function check(cond, what, detail) {
  if (cond) { passed++; console.log('ok   ' + what); }
  else { failed++; console.log('FAIL ' + what + (detail === undefined ? '' : ' — ' + detail)); }
}
async function refused(promise, what, pattern) {
  try { await promise; check(false, what, 'not refused'); }
  catch (error) { check(!pattern || pattern.test(error.message), what, error.message); }
}

/* ---- a simulator instance and a MIDI link into it ------------------------------------------ */
function simulator(path, flash) {
  const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(path)), {}).exports;
  c._initialize();
  if (flash) { new Uint8Array(c.memory.buffer, c.sim_flash(), c.sim_flash_size()).set(flash); c.sim_boot(0); }
  else c.sim_boot(1);
  c.sim_midi_capture(1);
  for (let i = 0; i < 50; i++) c.sim_render();   // the project restore at boot runs in the control poll
  return c;
}
class SimLink {
  constructor(c) { this.c = c; this.queue = []; this.lost = false; this.closed = false; }
  mem() { return new Uint8Array(this.c.memory.buffer); }
  pump() {
    for (;;) {
      const w = this.c.sim_midi_output() >>> 0; if (!w) break;
      const n = w & 255, port = w >>> 8, d = this.mem().slice(this.c.sim_file(), this.c.sim_file() + n);
      if (port !== 1 || d[0] !== 0xf0) continue;
      const r = W.demoParse(d); if (r) this.queue.push(r);
    }
  }
  send(frame) { this.mem().set(frame, this.c.sim_file()); if (this.c.sim_midi(frame.length) !== 0) throw new Error('sim_midi refused'); }
  async read(ms) {
    const blocks = Math.max(1, Math.ceil(ms / 2.9));
    for (let i = 0; i < blocks; i++) { this.pump(); if (this.queue.length) return this.queue.shift(); this.c.sim_render(); }
    this.pump(); return this.queue.shift() || null;
  }
  async close() { this.closed = true; }
}
async function library(c) {
  const lib = new W.Library(null);
  lib.link = new SimLink(c);
  const info = await lib.query(0);
  lib.projectBytes = info[3] | info[4] << 8;
  await lib.extensions();
  return lib;
}
/* sim_boot clears the MIDI capture switch: every reboot turns it on again. */
function reboot(c, clear) { c.sim_boot(clear); c.sim_midi_capture(1); for (let i = 0; i < 100; i++) c.sim_render(); }
const settle = (c, ms = 2000) => { for (let i = 0; i < ms / 2.9; i++) c.sim_render(); };   // the device stores settings 1.5 s after a change
const flashImage = c => new Uint8Array(c.memory.buffer, c.sim_flash(), c.sim_flash_size()).slice();

/* ---- content -------------------------------------------------------------------------------- */
function project(base, name, tempo) {
  const p = base.slice();
  const text = name.padEnd(12, ' ');
  for (let i = 0; i < 12; i++) p[3836 + i] = text.charCodeAt(i);
  p[3832] = tempo & 255; p[3833] = tempo >> 8;
  return p;
}
function steps(seed) {
  return Array.from({ length: 64 }, (_, s) => ({
    probability: 0, alt: false,
    notes: s % 4 === 0 ? Array.from({ length: 1 + (seed + s) % 4 }, (_, k) => ({
      pitch: 36 + (seed * 7 + s + k * 4) % 48, velocity: 40 + (s * 3 + k) % 80, retrigger: false,
      offset: ((seed + s) % 9) * 20 - 80, length: 120 + ((seed + s) % 5) * 240 })) : []
  }));
}
function song(name, ids, events = []) {
  const s = W.songEmpty(); s.name = name; s.tempo = 0;
  s.rows = ids.map(row => ({ block: row, repeat: 2, loopHere: false, steps: 64 }));
  s.events = events;
  return W.songRecordBuild(s);
}
async function populate(lib, c) {
  const base = await lib.download(0);
  await lib.saveProject(0, project(base, 'ALPHA', 101));
  await lib.saveProject(3, project(base, 'DELTA', 133));
  await lib.saveProject(15, project(base, 'SETTINGS16', 97));   // slot 16 also carries the device settings
  if (lib.settingsTransfer) {
    const k = await lib.download(8);
    k[16 + 1] = 1;            /* track 2: LIVE */
    k[24 + 2] = 4;            /* track 3: input channel 5 */
    k[8] = (k[8] & 0xf0) | 6; /* track 1 output channel 7 (config.channel[0] low nibble) */
    k[36] = 0; k[37] = 0; k[38] = 0; k[39] = 0;
    const crc = W.crc32(k.subarray(0, 36)); k[36] = crc & 255; k[37] = crc >>> 8 & 255; k[38] = crc >>> 16 & 255; k[39] = crc >>> 24;
    await lib.upload(8, 0, k);
  }
  await lib.query(8, [3]);
  await lib.upload(0, 0, project(base, 'UNSAVED', 120));   // an unsaved workspace on top of slot 4
  const blocksA = new Map([[1, W.songPayloadBuild(steps(1))], [2, W.songPayloadBuild(steps(2))], [7, W.songPayloadBuild(steps(3))]]);
  await lib.songWrite(2, song('FIRST SONG', [[1, 2, 0, 0, 0, 0, 0, 7], [2, 1, 7, 0, 0, 0, 0, 0]]), blocksA);
  const blocksB = new Map(Array.from({ length: 12 }, (_, i) => [100 + i, W.songPayloadBuild(steps(10 + i))]));
  await lib.songWrite(9, song('SECOND', [[100, 101, 102, 103, 104, 105, 106, 107], [108, 109, 110, 111, 0, 0, 0, 0]],
    [{ row: 0, type: 0, channel: 4, d0: 12 }, { row: 1, type: 2, channel: 1, d0: 74, d1: 99 }]), blocksB);
  settle(c);
}
const bodyOf = file => { const f = JSON.parse(JSON.stringify(file)); delete f.created; return JSON.stringify(f); };

/* ---- 1. DIAG round trip --------------------------------------------------------------------- */
const diag = simulator(diagPath);
const dlib = await library(diag);
check(dlib.settingsTransfer && dlib.diagCounters, 'DIAG simulator reports capability bits 6 and 7');
check(dlib.userBytes === 536576 && dlib.songRegion === 462848, 'DIAG simulator: layout 536576 / region 462848', dlib.userBytes + '/' + dlib.songRegion);
await populate(dlib, diag);
const before = await dlib.fullBackup(() => {}, { workbench: 'test', rig: { schema: 'tabby-rig/1', name: 'test rig' } });
const text = JSON.stringify(before);
check(before.counts.projects === 3 && before.counts.songs === 2 && before.counts.blocks === 15, 'backup holds 3 projects, 2 songs, 15 blocks', JSON.stringify(before.counts));
check(before.settings.kind8 && before.current_slot === 3, 'backup holds the device settings (kind 8) and current slot 4');
const parsed = W.backupParse(text);
check(parsed.workspace.length === 4264 && W.crc32(parsed.workspace) !== W.crc32(parsed.projects[3].bytes), 'the unsaved workspace is kept apart from slot 4');
const diagFlashBefore = flashImage(diag);

reboot(diag, 1);     // wipe: erased flash, fresh boot
const wiped = await library(diag);
const empty = await wiped.fullBackup();
check(empty.counts.projects === 0 && empty.counts.songs === 0, 'after the wipe the device is empty');
const restored = await wiped.fullRestore(text, () => {}, { settleMs: 0 });
settle(diag);
const verify = await wiped.fullVerify(text);
check(verify.pass, 'DIAG: verify after restore passes', verify.difference);
const again = await wiped.fullBackup(() => {}, { workbench: 'test', rig: { schema: 'tabby-rig/1', name: 'test rig' } });
check(bodyOf(again) === bodyOf(before), 'a second backup equals the first (byte-identical contents)');
check(Array.isArray(restored.notes), 'restore returns its notes', JSON.stringify(restored.notes));
// The settings survive a power cycle: reboot without clearing, read kind 8 again.
reboot(diag, 0);
const rebooted = await library(diag);
const k8 = await rebooted.download(8);
check(Buffer.from(k8).equals(Buffer.from(parsed.settings.kind8)), 'device settings are stored (identical after a reboot)');

/* ---- 2. damaged files are refused before anything is written -------------------------------- */
const revision = diag.sim_flash_revision();
await refused(rebooted.fullRestore(text.slice(0, text.length - 200), () => {}, { settleMs: 0 }), 'a truncated file is refused', /not complete JSON|incomplete/);
const flipped = JSON.parse(text); { const b = W.backupParse(text).projects[0].bytes.slice(); b[100] ^= 1; flipped.projects[0].data = Buffer.from(b).toString('base64'); }
await refused(rebooted.fullRestore(JSON.stringify(flipped), () => {}, { settleMs: 0 }), 'a flipped payload byte is refused', /checksum/);
await refused(rebooted.fullRestore(JSON.stringify({ ...JSON.parse(text), version: 2 }), () => {}, { settleMs: 0 }), 'an unknown version is refused', /version 2/);
await refused(rebooted.fullRestore(JSON.stringify({ ...JSON.parse(text), counts: { projects: 3, songs: 2, blocks: 14 } }), () => {}, { settleMs: 0 }), 'mismatched counts are refused', /counts/);
const noEnd = JSON.parse(text); delete noEnd.end;
await refused(rebooted.fullRestore(JSON.stringify(noEnd), () => {}, { settleMs: 0 }), 'a file without its end marker is refused', /incomplete/);
check(diag.sim_flash_revision() === revision, 'no refused file wrote anything (flash revision unchanged)');

/* ---- 3. the 536576 file into a clean 471040 simulator --------------------------------------- */
const probe = simulator(probePath);
const plib = await library(probe);
check(plib.userBytes === 471040 && plib.songRegion === 397312, 'PROBE simulator: layout 471040 / region 397312', plib.userBytes + '/' + plib.songRegion);
await plib.fullRestore(text, () => {}, { settleMs: 0 });
settle(probe);
const pverify = await plib.fullVerify(text);
check(pverify.pass, 'the 536576 file restores into the 471040 layout and verifies', pverify.difference);
check(pverify.notes.some(n => /USER 536576/.test(n)), 'verify notes the layout change', JSON.stringify(pverify.notes));

/* ---- 4. the move: the probe on the old layout's flash --------------------------------------- */
// The probe firmware sees the device's flash with its USER base 64 KiB higher: its USER offset 0
// is the stock layout's offset 65536 (the project staging sector).
const moved = simulator(probePath, diagFlashBefore.subarray(65536, 65536 + 471040));
const st = moved.sim_song_storage_state();
console.log('     moved flash: song storage state ' + (st & 255) + ', old sectors ' + (st >> 8));
const mlib = await library(moved);
const seen = await mlib.fullBackup();
check(seen.counts.projects === 0, 'after the move no old project is visible as a project', JSON.stringify(seen.counts));
if ((st & 255) === 2) {   // OLD_DATA: the probe's ACTIONS > ERASE OLD SAMPLE/DX7, then the restore
  await refused(mlib.fullRestore(text, () => {}, { settleMs: 0 }), 'restore refuses while the song region holds old data', /old data/i);
  check(moved.sim_song_storage_initialize() === 0, 'ERASE OLD (song_storage_initialize) runs');
}
await mlib.fullRestore(text, () => {}, { settleMs: 0 });
settle(moved);
const mverify = await mlib.fullVerify(text);
check(mverify.pass, 'after the move the file restores and verifies', mverify.difference);

/* ---- 6. the diagnostic counters read and reset through command 25 (DIAG) --------------------- */
{
  const d1 = await rebooted.diagRead(true);
  for (let i = 0; i < 400; i++) diag.sim_render();
  const d2 = await rebooted.diagRead(false);
  check(d2.loop.count > 0 && d2.loop.mean_ms > 0 && d2.seconds > 0, 'diagnostic counters count control loops after a reset', W.diagText(d2).split('\n')[1]);
  check(d1.flash.erases === 0 && d2.keys.count === 0, 'the reset clears the counters');
  check(/L\.5 matrix scan/.test(W.diagText(d2)), 'the counter text names the L items');
}

/* ---- 5. NORMAL: no kind 8 ------------------------------------------------------------------- */
const normal = simulator(normalPath);
const nlib = await library(normal);
check(!nlib.settingsTransfer && !nlib.diagCounters, 'NORMAL simulator: capability bits 6 and 7 clear');
await populate(nlib, normal);
const nfile = JSON.stringify(await nlib.fullBackup());
check(JSON.parse(nfile).settings.kind8 === null && JSON.parse(nfile).not_included.some(t => /kind 8/.test(t)), 'NORMAL backup says the settings are not in it');
reboot(normal, 1);
const nwiped = await library(normal);
const nres = await nwiped.fullRestore(nfile, () => {}, { settleMs: 0 });
settle(normal);
check(nres.notes.some(t => /no device MIDI settings/.test(t)), 'NORMAL restore notes the missing settings', JSON.stringify(nres.notes));
const nverify = await nwiped.fullVerify(nfile);
check(nverify.pass, 'NORMAL: verify after restore passes', nverify.difference);

console.log(`${passed} ok, ${failed} failed`);
if (failed) { console.log('FAILED'); process.exit(1); }
console.log('all checks passed');
