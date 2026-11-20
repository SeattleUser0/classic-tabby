// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tools/linux/screens.mjs — every screen page as the simulator draws it, and the comparison with the device
//
// Purpose
//   Drives the simulator (build/web/simulator.wasm: the firmware's own screen code) through the tour of
//   tools/linux/hw/screen-tour.json: every page of docs/CONTROL-MAP.md section 20, at rest and while the song plays.
//   A picture is read through the screen copy (remote command 29 {19}, app/screen.c ct_screen_shot: what the firmware
//   handed to the LCD), exactly as tools/linux/hw/run-screen.py reads it from the device, and is also compared with
//   the simulator's whole framebuffer: the copy must be the picture.
//
//   node tools/linux/screens.mjs OUT            write OUT/<page>.png and OUT/screens.json (after make web)
//   node tools/linux/screens.mjs --check DIR    exit 1 unless DIR/screens.json holds the SHA-256 of what the
//                                               simulator draws now for every page (make workbench-test)
//   node tools/linux/screens.mjs --match DEV    DEV holds a device tour (run-screen.py: device-shots.json, one
//                                               <page>.rgb565 per picture, the song it wrote). The simulator runs the
//                                               same tour with the same song, is brought to the same place in the song
//                                               before every picture, and every pixel is compared (outside the masks
//                                               the tour names, each with its reason). Writes DEV/<page>.png (the
//                                               device's picture), <page>-sim.png and <page>-diff.png where they
//                                               differ, and DEV/screen-compare.json. Exit 1 when a picture differs.
//   node tools/linux/screens.mjs --adopt DEV DIR  after a --match that passed: DIR gets the device's pictures and
//                                               device.json (which build, which simulator frame each was compared
//                                               with, what was left out). --check DIR then also fails when the
//                                               simulator's frame is no longer the one a device picture was proven
//                                               against, or when a picture file was changed.
//   node tools/linux/screens.mjs --pretend DEV  the simulator plays the device (it waits as the device does and
//                                               lets the song run on while a picture is "read"), for testing --match
//                                               without a device (tests/workbench: make workbench-test).
//
// Version: 0.3
//
// Revision log
//   v0.3  2026-11-19  tabby-v1.2: the tour is a file both the simulator and the device run; pictures come through
//                     the screen copy; --match compares the device's pixels with the simulator's.
//   v0.2  2026-11-19  --check and screens.json; the question on ACTIONS, SAVE PROJECT, the fourth SETTING page, a
//                     step with notes; no start screen (it shows the build's version).
//   v0.1  2026-11-19  First version (tabby-v1.1: the readable screen).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { deflateSync, crc32 } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);
const Midi = require(join(root, 'web/import/midi-parse.js')), Song = require(join(root, 'web/import/midi-song.js')), Format = require(join(root, 'web/import/song-format.js'));
const D = require(join(root, 'web/rig/device-library.js')), Rig = require(join(root, 'web/rig/rig.js')), Transfer = require(join(root, 'web/import/song-transfer.js'));
const mode = { '--check': 'check', '--match': 'match', '--adopt': 'adopt', '--pretend': 'pretend' }[process.argv[2]] || 'write';
const out = mode === 'write' ? process.argv[2] : process.argv[3];
if (mode === 'adopt') {
  const dir = process.argv[4], cmp = JSON.parse(readFileSync(join(out, 'screen-compare.json'), 'utf8'));
  if (!dir || cmp.identical !== cmp.pictures) { console.log('FAIL --adopt needs a comparison in which every picture was identical (' + cmp.identical + ' of ' + cmp.pictures + ')'); process.exit(1); }
  mkdirSync(dir, { recursive: true });
  const pages = {}, sim = {};
  for (const [n, r] of Object.entries(cmp.pages)) { const bytes = readFileSync(join(out, n + '.png')); writeFileSync(join(dir, n + '.png'), bytes);
    pages[n] = { from: r.simulator_only ? 'the simulator (the > button cannot be pressed by remote command)' : 'the device', png_sha256: createHash('sha256').update(bytes).digest('hex'), sim_sha256: r.sim_sha256, playing: r.playing, compared: r.compared, left_out: r.masked, why: [...new Set(r.masks)] }; sim[n] = r.sim_sha256; }
  writeFileSync(join(dir, 'device.json'), JSON.stringify({ what: 'These pictures are the device\'s: the pixels the firmware handed to its LCD, read back over USB (remote command 29 {19}) and compared with the simulator\'s, pixel for pixel.', tool: 'tools/linux/screens.mjs v0.3', build: cmp.build, tour: cmp.tour, levels: cmp.levels, tracks_shown_as_edited: cmp.tracks_shown_as_edited, pages }, null, 1) + '\n');
  writeFileSync(join(dir, 'device-shots.json'), readFileSync(join(out, 'device-shots.json')));   /* where in the song each picture was taken: --check follows it */
  writeFileSync(join(dir, 'screens.json'), JSON.stringify({ tool: 'tools/linux/screens.mjs v0.3', size: '240 x 240 shown twice the size', pages: sim }, null, 1) + '\n');
  console.log('ok   ' + Object.values(pages).filter(p => p.from === 'the device').length + ' device pictures and ' + Object.values(pages).filter(p => p.from !== 'the device').length + ' of the simulator (build ' + String(cmp.build).slice(0, 16) + ') are in ' + dir); process.exit(0);
}
if (!out) { console.error('usage: node tools/linux/screens.mjs OUT | --check DIR | --match DEV'); process.exit(2); }
if (mode === 'write' || mode === 'pretend') mkdirSync(out, { recursive: true });
const pretend = mode === 'pretend', fakeLog = [];
const tour = JSON.parse(readFileSync(join(root, 'tools/linux/hw/screen-tour.json'), 'utf8'));
/* --check on a folder of device pictures follows the device's tour as --match does (the same places in the song), so
 * that the simulator's frames are the ones the device's pictures were proven against; no pixels are compared then. */
const following = mode === 'check' && existsSync(join(out, 'device.json')) && existsSync(join(out, 'device-shots.json'));
const device = mode === 'match' || following ? JSON.parse(readFileSync(join(out, 'device-shots.json'), 'utf8')) : null;
const c = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(join(root, 'build/web/simulator.wasm'))), {}).exports;
c._initialize(); c.sim_boot(1);
const mem = () => new Uint8Array(c.memory.buffer);
const step = n => { for (let i = 0; i < n; i++) c.sim_render(); };
const W = 240, H = 240, Z = 2, SLOT = 5;
const fail = why => { console.log('FAIL ' + why); process.exit(1); };

function png(file, frame) {
  const raw = Buffer.alloc((W * Z * 3 + 1) * H * Z);
  for (let y = 0; y < H * Z; y++) { const row = y * (W * Z * 3 + 1); raw[row] = 0;
    for (let x = 0; x < W * Z; x++) { const v = frame[(y / Z | 0) * W + (x / Z | 0)], o = row + 1 + 3 * x; raw[o] = (v >> 11 & 31) * 255 / 31; raw[o + 1] = (v >> 5 & 63) * 255 / 63; raw[o + 2] = (v & 31) * 255 / 31; } }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W * Z, 0); ihdr.writeUInt32BE(H * Z, 4); ihdr[8] = 8; ihdr[9] = 2;
  writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
}
const sha = frame => createHash('sha256').update(Buffer.from(frame.buffer, frame.byteOffset, frame.byteLength)).digest('hex');

/* ---- the screen copy, read as the device tool reads it ---- */
const shot = (what, offset = 0) => { const n = c.sim_shot(what, offset); return n < 0 ? null : mem().slice(c.sim_shot_buffer(), c.sim_shot_buffer() + n); };
const status = () => { const s = shot(0); return { state: s[0], colors: s[1], errors: s[2] | s[3] << 8, info: Array.from(s.slice(4, 20)) }; };
function readCopy() {
  const pals = []; for (let band = 0; band < 15; band++) { const p = shot(4, band), pal = []; for (let i = 0; i + 1 < p.length; i += 2) pal.push(p[i] | p[i + 1] << 8); pals.push(pal); }
  const frame = new Uint16Array(W * H); let at = 0, unpainted = 0;
  while (at < W * H) {
    const r = shot(3, at); if (!r || !r.length) fail('the screen copy stopped at pixel ' + at);
    for (let i = 0; i < r.length;) { let run = r[i] >> 5, v = r[i] & 31; i++; if (!run) run = r[i++] + 1;
      const pal = pals[at / 3840 | 0];
      if (v >= pal.length) unpainted += run;   /* a sixteenth colour in one band, or never painted */
      frame.fill(v < pal.length ? pal[v] : 0xf81f, at, at + run); at += run; }
  }
  return { frame, unpainted };
}

/* ---- the song: the Wrong Room fixture with its rig, looping, in slot 6, written as the workbench writes it ---- */
let song;
if (device && !following) song = JSON.parse(readFileSync(join(out, device.song), 'utf8'));
else { const ddir = join(root, 'web/devices');
  const library = D.load(readdirSync(ddir).filter(n => n.endsWith('.json')).sort().map(n => JSON.parse(readFileSync(join(ddir, n), 'utf8'))));
  const [rig] = Rig.rigBuiltins([JSON.parse(readFileSync(join(root, 'web/rig/profiles/wrong-room.json'), 'utf8'))]);
  const r = Song.convert(Song.analyze(Midi.parse(new Uint8Array(readFileSync(join(root, 'tests/midi-import/fixtures/wrong-room-all.mid'))))), { fileName: 'wrong-room-all.mid', rig, library, name: 'WRONG ROOM', projectSlot: 0, loop: true });
  song = { ...r.song, events: Rig.applyGaps(r.song.events, rig, library) }; }
{ const plan = await Transfer.createStub().plan(song, SLOT);
  for (const b of plan.blocks) { mem().set(b.payload, c.sim_file()); if (c.sim_block_write2(SLOT, b.id, b.format, b.payload.length)) fail('block ' + b.id + ' was not stored in the simulator'); }
  mem().set(plan.record.image, c.sim_file());
  if (c.sim_song_record_write(SLOT) || c.sim_song_select(SLOT)) fail('the song was not written to the simulator'); }

/* ---- the tour ---- */
const BUTTON = 0, PAD = 3, KNOB = 4;
const B = { KB: 0, FADER: 1, LEFT: 2, SAVE: 3, OCTM: 4, OCTP: 5, ARP: 6, NR: 7, SCALE: 8, CHORD: 9, GLOBE: 10, BT: 11, PATCH: 12, PARA: 13, FX: 14, SEQ: 15, PLAY: 16, REC: 17 };
const down = id => { c.sim_smk37(BUTTON, id, 1); step(8); }, up = id => { c.sim_smk37(BUTTON, id, 0); step(8); };
const press = id => { down(id); up(id); if (pretend) step(55); };   /* the device's remote keys take about 0.2 s */
const playing = () => status().info[1] !== 0;
const ms = n => step(Math.ceil(n / 2.9));
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const position = i => [i[5] | i[6] << 8, i[4]];
step(1560);
if (!shot(1)) fail('the simulator could not switch the screen copy on');
step(40);
/* The device's project may wait for a save from before the tour (*PRJ in the top line); the simulator's does not, and
 * the tour does not touch the project. That mark is the device's own data, like the stored names: where the two
 * differ in it, the mark's place is left out of the comparison and the result says so. */
/* The same for CPU! in the top line (the device's CPU guard took voices back; the simulator has no such limit). */
const sameShown = (a, b) => a.length === b.length && a.every((v, i) => i === 15 ? (v & ~10) === (b[i] & ~10) : v === b[i]);
if (device && device.levels) for (let t = 0; t < 8; t++) if (c.sim_track_level(t, device.levels[t]) !== device.levels[t]) fail('the simulator could not be given the device\'s level of track ' + (t + 1));
/* A track whose sound was edited (by the device tests before the tour) shows EDIT on HOME. The firmware does not
 * say which tracks; it is read off the device's first picture: where the state word of a track differs from the
 * simulator's, the comparison starts again with that track marked as edited in the simulator. If that is not what
 * the device shows, the page still differs and fails as any other. */
const editedArg = process.argv.indexOf('--edited');
let adopted = null; if (mode === 'check') try { adopted = JSON.parse(readFileSync(join(out, 'device.json'), 'utf8')); } catch (e) { /* the pictures are the simulator's */ }
if (adopted && adopted.levels) for (let t = 0; t < 8; t++) c.sim_track_level(t, adopted.levels[t]);   /* the frames the device's pictures were proven against had the device's levels */
const edited = editedArg > 0 ? JSON.parse(process.argv[editedArg + 1]) : adopted ? adopted.tracks_shown_as_edited : device ? device.edited : null;
if (edited) for (let t = 0; t < 8; t++) if (edited[t] && !c.sim_track_edited(t)) fail('the simulator could not mark track ' + (t + 1) + ' as edited');
const results = {}, hashes = {}, names = [];
let logAt = 0;
let simOnly = false;
const next = (op, name) => { if (!device || simOnly) return null; const e = device.log[logAt++]; if (!e || e.op !== op || (name && e.name !== name)) fail('the device tour and the tour file differ at ' + op + ' ' + (name || '') + ' (the device ran ' + JSON.stringify(e) + ')'); return e; };
const only = new Set();
for (const s of tour.steps.concat([['simulator_only']], tour.simulator_only || [])) {
  const [op, a, b] = s;
  if (op === 'simulator_only') { if (pretend) break; if (device && logAt !== device.log.length) fail('the device ran ' + device.log.length + ' steps with a picture or a place in the song, the tour has ' + logAt); simOnly = true; continue; }
  if (op === 'do_action') { press(B.SAVE); continue; }
  if (op === 'press') press(B[a]);
  else if (op === 'down') down(B[a]);
  else if (op === 'up') up(B[a]);
  else if (op === 'pad') { c.sim_smk37(PAD, a, 100); ms(b || 50); c.sim_smk37(PAD, a, 0); step(8); }
  else if (op === 'pad_down') { c.sim_smk37(PAD, a, 100); step(8); }
  else if (op === 'pad_up') { c.sim_smk37(PAD, a, 0); step(8); }
  else if (op === 'knob') { c.sim_smk37(KNOB, a, b); step(8); }
  else if (op === 'home') { let n = 0; while (status().info[0] !== 0) { if (n++ > 6) fail('PATCH did not lead to the overview'); press(B.PATCH); step(60); } }
  /* While the song plays the simulator never waits on its own: the device's waits are longer in the song's time
   * (it also reads its pictures), and the next "at" or picture brings the simulator to the device's place. */
  else if (op === 'settle') { if (!playing() || !device || simOnly) step(pretend ? 830 : 900); }
  else if (op === 'wait_ms') ms(a);   /* part of a gesture (a held button), or shorter than the device's own wait */
  else if (op === 'at') {
    const t = next('at'); let n = 0;
    for (;; n++) { const i = status().info, [bar, st] = position(i);
      if (t ? same(position(t.info), [bar, st]) : (i[1] === 1 && bar % a === b && st % 16 <= 3)) { if (pretend) { fakeLog.push({ op: 'at', info: i }); step(7); } break; }
      if (n > 60000) fail('the simulator never reached ' + (t ? 'bar ' + position(t.info)[0] + ' step ' + position(t.info)[1] : 'a bar ' + b + ' of ' + a));
      step(1); }
  } else if (op === 'shot') {
    const opt = s[2] || {}, t = next('shot', a); let masks = typeof opt.masks === 'string' ? tour.masks[opt.masks] : opt.masks || [];
    let got = null;
    for (let n = 0; n < 60000 && !got; n++) {
      const now = status();
      if (!t || sameShown(now.info, t.info)) {
        c.sim_shot(opt.now ? 6 : 2, 0);
        for (let k = 0; k < 80 && status().state !== 3; k++) step(1);
        const f = status();
        if (f.state === 3 && (!t || sameShown(f.info, t.info))) got = f; else { c.sim_shot(f.state === 3 ? 1 : 7, 0); }
      }
      if (!got) step(1);
    }
    if (!got && device) {   /* the pictures so far are still reported; the rest of the tour cannot be followed from here */
      names.push(a); results[a] = { differ: -1, compared: 0, masked: 0, masks: [], playing: t.info[1] !== 0, info: t.info, error: 'the simulator never showed the state of the device\'s picture ' + JSON.stringify(t.info) + ' (it is at ' + JSON.stringify(status().info) + ')' };
      break;
    }
    if (!got) fail(a + ': the simulator never reached a whole picture');
    if (t && ((t.info[15] ^ got.info[15]) & 8)) masks = masks.concat([[188, 0, 52, 15, 'CPU! in the top line: the device\'s CPU guard was at work']]);
    if (t && ((t.info[15] ^ got.info[15]) & 2)) masks = masks.concat([[188, 15, 52, 15, 'the unsaved mark: the device\'s project waited for a save before the tour']]);
    const { frame, unpainted } = readCopy();
    const real = new Uint16Array(c.memory.buffer, c.sim_pixels(), W * H);
    let off = 0; for (let i = 0; i < W * H; i++) off += frame[i] !== real[i];
    if (off || unpainted || got.errors) fail(a + ': the screen copy is not the simulator\'s framebuffer (' + off + ' pixels differ, ' + unpainted + ' never painted, ' + got.errors + ' errors)');
    hashes[a] = sha(frame); names.push(a);
    if (mode === 'write') png(join(out, a + '.png'), frame);
    if (pretend) { writeFileSync(join(out, a + '.rgb565'), Buffer.from(frame.buffer, frame.byteOffset, frame.byteLength)); fakeLog.push({ op: 'shot', name: a, info: got.info, unpainted: 0, errors: 0 }); step(Number(process.argv[4] || 1100)); /* the device reads a picture for a while: the song runs on (the test tries several lengths) */ }
    if (following) { /* the frame's hash is what is checked */ }
    else if (simOnly) { only.add(a); if (device) { png(join(out, a + '.png'), frame); results[a] = { simulator_only: true, differ: 0, compared: 0, masked: 0, masks: [], playing: got.info[1] !== 0, sim_sha256: hashes[a] }; } }
    else if (device) {
      const dev = new Uint16Array(new Uint8Array(readFileSync(join(out, a + '.rgb565'))).buffer);
      if (a === 'home' && !edited) {
        const guess = []; let any = 0;
        for (let t = 0; t < 8; t++) { let d = 0; for (let y = 54 + 23 * t; y < 68 + 23 * t; y++) for (let x = 142; x < 190; x++) d += dev[y * W + x] !== frame[y * W + x]; guess.push(d ? 1 : 0); any += d; }
        if (any) { const { spawnSync } = await import('node:child_process');
          const r = spawnSync(process.argv[0], [process.argv[1], '--match', out, '--edited', JSON.stringify(guess)], { stdio: 'inherit' }); process.exit(r.status === null ? 1 : r.status); }
      }
      const masked = new Uint8Array(W * H); for (const [x, y, w, h] of masks) for (let yy = y; yy < y + h && yy < H; yy++) masked.fill(1, yy * W + x, yy * W + Math.min(W, x + w));
      let differ = 0, hidden = 0, inMask = 0; const diff = new Uint16Array(W * H);
      for (let i = 0; i < W * H; i++) { if (masked[i]) { hidden++; inMask += dev[i] !== frame[i]; diff[i] = 0x2104; } else if (dev[i] !== frame[i]) { differ++; diff[i] = 0xf800; } else diff[i] = dev[i] ? 0x4208 : 0; }
      png(join(out, a + '.png'), dev);
      if (differ) { png(join(out, a + '-sim.png'), frame); png(join(out, a + '-diff.png'), diff); }
      results[a] = { differ, compared: W * H - hidden, masked: hidden, differ_inside_masks: inMask, masks: masks.map(m => m[4]), device_unpainted: t.unpainted, device_errors: t.errors, frozen: opt.now ? 'at once' : 'when the picture was whole', playing: t.info[1] !== 0, info: t.info, sim_sha256: hashes[a] };
    }
    if (!c.sim_shot(1, 0)) fail('the screen copy could not be switched on again');
    step(40);
  } else fail('unknown tour step ' + JSON.stringify(s));
}
c.sim_shot(5, 0);

if (pretend) {
  writeFileSync(join(out, 'wrong-room-song.json'), JSON.stringify(song));
  writeFileSync(join(out, 'device-shots.json'), JSON.stringify({ tool: 'tools/linux/screens.mjs --pretend', tour: tour.version, build: 'the simulator, pretending', song: 'wrong-room-song.json', log: fakeLog }, null, 1) + '\n');
  console.log('ok   ' + names.length + ' pictures written as a device would give them');
} else if (mode === 'match') {
  const bad = names.filter(n => results[n].differ || results[n].device_unpainted || results[n].device_errors);
  const devs = names.filter(n => !results[n].simulator_only);
  writeFileSync(join(out, 'screen-compare.json'), JSON.stringify({ tool: 'tools/linux/screens.mjs v0.3', tour: tour.version, build: device.build, pictures: devs.length,
    at_rest: devs.filter(n => !results[n].playing).length, playing: devs.filter(n => results[n].playing).length, identical: devs.length - bad.length, simulator_only: [...only], tracks_shown_as_edited: edited || [0, 0, 0, 0, 0, 0, 0, 0], levels: device.levels, heap: device.largest_heap_block_with_the_copy_on, pages: results }, null, 1) + '\n');
  for (const n of devs) { const r = results[n]; if (r.error) { console.log('FAIL ' + n + ': ' + r.error + '; the pictures after it were not compared'); continue; } console.log((bad.includes(n) ? 'FAIL ' : 'ok   ') + n + ': ' + r.differ + ' of ' + r.compared + ' pixels differ' + (r.masked ? ' (' + r.masked + ' left out: ' + [...new Set(r.masks.map(m => m.replace(/ of track \d| \d$/, '')))].join('; ') + ')' : '') + (r.playing ? ', playing' : '')); }
  console.log((bad.length ? 'FAIL ' : 'PASS ') + 'screen: ' + (devs.length - bad.length) + ' of ' + devs.length + ' pictures of the device are pixel for pixel the simulator\'s (' + devs.filter(n => results[n].playing).length + ' while playing); not taken on the device: ' + [...only].join(', '));
  process.exit(bad.length ? 1 : 0);
} else if (mode === 'check') {
  let want = {}; try { want = JSON.parse(readFileSync(join(out, 'screens.json'), 'utf8')).pages || {}; } catch (e) { /* none yet */ }
  const off = names.filter(n => want[n] !== hashes[n]).concat(Object.keys(want).filter(n => !(n in hashes)));
  if (off.length) fail('the pictures in ' + out + ' are not what the simulator draws now: ' + off.join(' ') + ' (make web, then node tools/linux/screens.mjs ' + out + ', then make manual; device pictures: a new device tour, docs/BUILD.md 65)');
  let dev = null; try { dev = JSON.parse(readFileSync(join(out, 'device.json'), 'utf8')); } catch (e) { /* the pictures are the simulator's */ }
  if (dev) {
    const stale = Object.entries(dev.pages).filter(([n, p]) => p.sim_sha256 !== hashes[n] || createHash('sha256').update(readFileSync(join(out, n + '.png'))).digest('hex') !== p.png_sha256).map(([n]) => n);
    if (stale.length || Object.keys(dev.pages).length !== names.length) fail('device pictures in ' + out + ' were not proven against what the simulator draws now, or a file changed: ' + stale.join(' '));
    console.log('ok   ' + names.length + ' pictures in ' + out + ' are the device\'s (build ' + String(dev.build).slice(0, 16) + '), each proven pixel for pixel against the frame the simulator draws now');
  } else console.log('ok   ' + names.length + ' pictures in ' + out + ' are what the simulator draws; the screen copy was the framebuffer in every one');
} else {
  if (existsSync(join(out, 'device.json'))) { console.log('note: ' + out + ' held device pictures; they are replaced by the simulator\'s (device.json is deleted)'); (await import('node:fs')).rmSync(join(out, 'device.json')); }
  writeFileSync(join(out, 'screens.json'), JSON.stringify({ tool: 'tools/linux/screens.mjs v0.3', size: '240 x 240 shown twice the size', pages: hashes }, null, 1) + '\n');
  console.log(names.join(' '));
}
