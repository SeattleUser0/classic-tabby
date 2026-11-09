// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/workbench/backup.mjs — the workbench's full backup, restore and verify, end to end
//
// Purpose
//   Task 11 Step 2: Library.fullBackup / fullRestore / fullVerify (sdk/WebUpdate.js) drive the
//   real device code (app/transfer.c, app/project.c, app/song_storage.c) compiled into the
//   simulator wasm, through a fake MIDI link that feeds the workbench's own SysEx frames to
//   sim_midi and parses the replies with demoParse. Three simulators:
//     NORMAL  build/web-normal/simulator.wasm     the normal build (Task 12 A1: USER 471040)
//     DIAG    build/web-old536/simulator.wasm     the old 536576 layout, diagnostic build (kind 8):
//                                                 the tabby-v03.3-diag device a backup comes from
//     PROBE   build/web-diag/simulator.wasm       USER 471040, diagnostic build: since Task 12 A1
//                                                 the normal layout (it was tabby-p0-probe64)
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
//     6. DIAG: command 25 reads and resets the counters (loop count and mean after a reset);
//     7. DIAG: command 26 (Task 11B): ACTIONS status, play / stop, COMPACT refused while playing,
//        ERASE OLD refused without old data.
//
//   Run:  /usr/bin/node tests/workbench/backup.mjs NORMAL.wasm DIAG.wasm PROBE.wasm
//         (or: make backup-test, which builds the three)
//
// Version: 0.5
//
// Revision log
//   v0.5  2026-11-08  Task 12 A4: section 5, the normal build has the counters and kind 8 (no
//                     command 26); the loop profile adds up and counts the hooks.
//   v0.4  2026-11-08  Task 12 A3: section 8, every flash write refused while the transport runs
//                     (workbench guard and device reply 76), reads allowed, deferred settings save.
//   v0.3  2026-11-08  Task 12 A1: commands 27 and 28 (the move test erases through command 28);
//                     471040 is the normal layout; the "DIAG" role (the device before
//                     the move) is played by the old-layout simulator build/web-old536, "PROBE" by
//                     the normal-layout diagnostic simulator build/web-diag.
//   v0.2  2026-11-07  Task 11B: command 26 checks.
//   v0.1  2026-11-07  Initial version (Task 11 Step 2).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [normalPath, diagPath, probePath] = [2, 3, 4].map((i, k) => process.argv[i] ||
  join(root, ['build/web-normal/simulator.wasm', 'build/web-old536/simulator.wasm', 'build/web-diag/simulator.wasm'][k]));

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
/* Task 12 A1: command 27 (Classic Tabby capability) and 28 (ERASE OLD DATA). */
check(plib.tabbyUserBytes === 471040 && (plib.tabbyFlags & 2), 'command 27 reports USER 471040 and command 28', plib.tabbyUserBytes + ' flags ' + plib.tabbyFlags);
check(dlib.tabbyUserBytes === 536576, 'command 27 on the old layout reports USER 536576', dlib.tabbyUserBytes);
await refused(plib.eraseOldData(), 'ERASE OLD DATA (command 28) is refused when there is no old data', /71|无效|invalid/i);
await refused(plib.query(28, [69, 82, 65, 83]), 'command 28 without the full confirm bytes is refused', /71|无效|invalid/i);
await plib.fullRestore(text, () => {}, { settleMs: 0 });
settle(probe);
const pverify = await plib.fullVerify(text);
check(pverify.pass, 'the 536576 file restores into the 471040 layout and verifies', pverify.difference);
check(pverify.notes.some(n => /USER 536576/.test(n)), 'verify notes the layout change', JSON.stringify(pverify.notes));

/* ---- 3b. Task 12 A1: OLD DATA in a block sector; the workbench erases it (command 28) ---------- */
{
  const image = flashImage(simulator(probePath));
  const at = 69632 + 17 * 4096 + 5 * 4096;              // a block sector of the 471040 song region
  image.set([0x46, 0x4d, 0x31, 0x53], at); image.fill(0x11, at + 4, at + 32);   // a V01-style header
  const old = simulator(probePath, image);
  check((old.sim_song_storage_state() & 255) === 2, 'planted old data: song storage reports OLD DATA');
  const olib = await library(old);
  check((await olib.songStatus()).state === 2, 'the workbench sees state 2 (OLD DATA)');
  await olib.eraseOldData();
  for (let i = 0; i < 400 && (old.sim_song_storage_state() & 255) !== 1; i++) old.sim_render();
  const after = flashImage(old);
  check((old.sim_song_storage_state() & 255) === 1 && after.subarray(at, at + 4096).every(b => b === 0xff),
    'Erase old data (command 28) erases the old sector and leaves READY');
}

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
  await mlib.eraseOldData();   /* Task 12 A1: the workbench's Erase old data (command 28) */
  for (let i = 0; i < 400 && (moved.sim_song_storage_state() & 255) !== 1; i++) moved.sim_render();
  check((moved.sim_song_storage_state() & 255) === 1, 'Erase old data (command 28) leaves song storage READY');
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
  const p3 = await rebooted.query(25, [3]);   /* Task 11B: the screen page */
  check(p3.length === 28 && (p3[0] | p3[1] << 8) > 0, 'command 25 page 3 counts screen control calls', p3.length);
}

/* ---- 7. Task 11B: command 26 (ACTIONS status, play, stop, compact, erase old) on DIAG ---------- */
{
  const st = await rebooted.query(26);
  const size = st[0] | st[1] << 8 | st[2] << 16 | st[3] * 16777216;
  check(st.length === 15 && size === 536576 && st[4] === 1 && st[5] === 0, 'command 26 reports USER 536576, storage READY, stopped', Array.from(st.slice(0, 7)).join(','));
  check((await rebooted.query(26, [1, 2])).length === 0, 'command 26 {1, 2} plays song 3');
  for (let i = 0; i < 200; i++) diag.sim_render();
  const playing = await rebooted.query(26);
  check(playing[5] === 1 && playing[6] === 2, 'song 3 is loaded and playing', playing[5] + ',' + playing[6]);
  await refused(rebooted.query(26, [2]), 'COMPACT is refused while the song plays, as on the panel (Task 12 A3: code 76)', /76|正在播放|71|无效|invalid/i);
  await rebooted.query(26, [0]);
  for (let i = 0; i < 400; i++) diag.sim_render();
  check((await rebooted.query(26))[5] === 0, 'command 26 {0} stops it');
  check((await rebooted.query(26, [2])).length === 0, 'COMPACT starts when stopped');
  await refused(rebooted.query(26, [3]), 'ERASE OLD is refused when there is no old data', /71|无效|invalid/i);
}

/* ---- 8. Task 12 A3: every flash write is refused while the transport runs ------------------- */
{
  const c = simulator(probePath);                      // the normal 471040 layout, diagnostic build
  const lib = await library(c);
  check(lib.tabbyFlags & 1, 'command 27 flag bit 0: writes are refused while playing');
  const transport = async () => (await lib.query(27))[7];
  const press = i => { c.sim_control(0, i, 1); for (let k = 0; k < 20; k++) c.sim_render(); c.sim_control(0, i, 0); for (let k = 0; k < 20; k++) c.sim_render(); };
  check(await transport() === 0, 'stopped: command 27 reports the transport stopped');
  const slot0 = await lib.download(0);
  press(12);                                           // PLAY: the stock transport
  check(await transport() === 1, 'PLAY: command 27 reports the transport running');
  const PLAYING = /正在播放|playing/i, CODE76 = /76|正在播放/;
  // the workbench refuses before sending (writeGuard) ...
  await refused(lib.saveProject(2, slot0), 'playing: project save refused by the workbench', PLAYING);
  await refused(lib.songWrite(3, song('PLAYTEST', [[1, 0, 0, 0, 0, 0, 0, 0]]), new Map([[1, W.songPayloadBuild(Array.from({ length: 64 }, () => ({ probability: 0, alt: false, notes: [] })))]])), 'playing: song upload refused by the workbench', PLAYING);
  await refused(lib.songDelete(3), 'playing: song delete refused by the workbench', PLAYING);
  await refused(lib.upload(8, 0, await lib.download(8)), 'playing: settings write (kind 8) refused by the workbench', PLAYING);
  await refused(lib.radioWrite({ on: true, audio: true, host: false }), 'playing: Bluetooth settings write refused by the workbench', PLAYING);
  await refused(lib.radioForget(), 'playing: forget Bluetooth pairs refused by the workbench', PLAYING);
  await refused(lib.eraseOldData(), 'playing: ERASE OLD DATA refused by the workbench', PLAYING);
  press(12); const fileForRestore = JSON.stringify(await lib.fullBackup()); settle(c, 3000); press(12);
  check(await transport() === 1, 'playing again after a backup taken while stopped', await transport());
  await refused(lib.fullRestore(fileForRestore, () => {}, { settleMs: 0 }), 'playing: full restore refused by the workbench', PLAYING);
  // ... and the device refuses the raw commands on its own (reply code 76)
  await refused(lib.query(7, [2]), 'playing: command 7 (save slot) answers 76', CODE76);
  await refused(lib.query(3, [5, 3, 0, 16]), 'playing: song record upload begin answers 76', CODE76);
  await refused(lib.query(3, [7, 3, 64, 0]), 'playing: block batch upload begin answers 76', CODE76);
  await refused(lib.query(3, [8, 0, 40, 0]), 'playing: settings upload begin answers 76', CODE76);
  await refused(lib.query(24, [5, 0]), 'playing: command 24 write answers 76', CODE76);
  await refused(lib.query(24, [0x7f]), 'playing: command 24 forget answers 76', CODE76);
  await refused(lib.query(28, [69, 82, 65, 83, 69]), 'playing: command 28 answers 76', CODE76);
  await refused(lib.query(26, [2]), 'playing: diag COMPACT (26 {2}) answers 76', CODE76);
  await refused(lib.query(26, [3]), 'playing: diag ERASE OLD (26 {3}) answers 76', CODE76);
  // reads stay allowed
  check((await lib.download(0)).length > 0 && (await lib.songStatus()).state === 0 && (await lib.query(9, [0], true)) !== undefined, 'playing: reads (workspace, song status, slot name) still work');
  // a saved preference changed while playing (OCT+, a session setting) is applied at once and
  // saved only after the stop. (A MIDI setting change stops the transport by itself.)
  settle(c, 3000);
  const rev = c.sim_flash_revision();
  press(1);                                            // OCT+
  settle(c, 3000);
  check(await transport() === 1, 'playing: OCT+ keeps the transport running');
  check(c.sim_flash_revision() === rev, 'playing: nothing reached flash (the preference save waits for the stop)');
  press(12);                                           // stop
  check(await transport() === 0, 'PLAY again stops the transport');
  settle(c, 3000);
  check(c.sim_flash_revision() !== rev, 'stopped: the deferred settings save runs');
  // and every write works again when stopped
  const saved = await lib.saveProject(2, slot0);
  check(saved.length === slot0.length, 'stopped: project save works');
  await lib.radioWrite({ on: true, audio: true, host: false });
  check(true, 'stopped: Bluetooth settings write works');
  await refused(lib.eraseOldData(), 'stopped: ERASE OLD DATA is refused only for having no old data (71)', /71|无效|invalid/i);
  check((await lib.query(26, [2])).length === 0, 'stopped: diag COMPACT starts');
  press(0); settle(c, 3000);                           // OCT- back
}
{
  /* Task 12 A3: a confirmed erase started while stopped pauses when the transport starts and
   * finishes after the stop. 30 planted old sectors, one erased per 10 ms poll. */
  const image = flashImage(simulator(probePath));
  for (let k = 0; k < 30; k++) { const at = 69632 + 17 * 4096 + (10 + k) * 4096; image.set([0x46, 0x4d, 0x31, 0x53], at); image.fill(0x11, at + 4, at + 32); }
  const c = simulator(probePath, image);
  const lib = await library(c);
  check((c.sim_song_storage_state() & 255) === 2, 'erase pause: 30 old sectors planted (OLD DATA)');
  await lib.eraseOldData();
  c.sim_control(0, 12, 1); c.sim_render(); c.sim_control(0, 12, 0);   // PLAY right after the erase starts
  for (let k = 0; k < 10; k++) c.sim_render();
  const rev = c.sim_flash_revision();
  for (let k = 0; k < 700; k++) c.sim_render();                        // 2 s of play
  check((c.sim_song_storage_state() & 255) === 3 && c.sim_flash_revision() === rev, 'erase pause: ERASING waits while playing (no flash write)', (c.sim_song_storage_state() & 255) + ' rev ' + rev + '->' + c.sim_flash_revision());
  c.sim_control(0, 12, 1); for (let k = 0; k < 20; k++) c.sim_render(); c.sim_control(0, 12, 0);
  for (let k = 0; k < 700; k++) c.sim_render();
  check((c.sim_song_storage_state() & 255) === 1, 'erase pause: the erase finishes after the stop (READY)');
}

/* ---- 5. NORMAL (Task 12 A4): the counters and kind 8 are in the normal build; no command 26 ------ */
const normal = simulator(normalPath);
const nlib = await library(normal);
check(nlib.settingsTransfer && nlib.diagCounters, 'NORMAL simulator: capability bits 6 and 7 set (Task 12 A4)');
await refused(nlib.query(26), 'NORMAL: command 26 (diagnostic build only) is unknown', /71|无效|invalid/i);
await populate(nlib, normal);
const nfile = JSON.stringify(await nlib.fullBackup());
check(JSON.parse(nfile).settings.kind8 !== null, 'NORMAL backup holds the device settings (kind 8)');
reboot(normal, 1);
const nwiped = await library(normal);
await nwiped.fullRestore(nfile, () => {}, { settleMs: 0 });
settle(normal);
const nverify = await nwiped.fullVerify(nfile);
check(nverify.pass, 'NORMAL: verify after restore passes', nverify.difference);
{
  /* Task 12 A4: the loop profile (command 25 pages 4 and 5) on the normal build. */
  await nwiped.diagRead(true);
  for (let i = 0; i < 700; i++) normal.sim_render();     // about 2 s
  const d = await nwiped.diagRead(false), p = d.profile;
  check(p && p.passes > 50, 'NORMAL: the profile counts control passes', p && p.passes);
  const sum = p ? Object.values(p.sections).reduce((t, s) => t + s.mean_ms, 0) : 0;
  check(p && Math.abs(sum - p.pass_mean_ms) < 0.01 + p.pass_mean_ms * 0.02, 'NORMAL: the sections add up to the pass (incl. SDK)', p && sum.toFixed(3) + ' vs ' + p.pass_mean_ms.toFixed(3));
  check(p && p.sections.screen.calls > 0 && p.sections.router.calls >= p.passes && p.sections.transfer.calls > 0, 'NORMAL: the screen, router and transfer hooks are counted', p && JSON.stringify(p.sections).slice(0, 160));
  check(/control pass/.test(W.diagText(d)) && /SDK between the hooks/.test(W.diagText(d)), 'NORMAL: the counter text names the profile sections');
}

console.log(`${passed} ok, ${failed} failed`);
if (failed) { console.log('FAILED'); process.exit(1); }
console.log('all checks passed');
