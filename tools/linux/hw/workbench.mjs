// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tools/linux/hw/workbench.mjs — drive the real Classic Tabby workbench page with Playwright
//
// Purpose
//   Task 11B runs the Task 11 hardware checklist (docs/BUILD.md 24.6) with no one at the device.
//   Every install, backup, restore and verify goes through the workbench page itself (the
//   published page, or the same files served from localhost), opened in the installed Google
//   Chrome by playwright-core with the midi and midi-sysex permissions granted. The script clicks
//   the page's own buttons and reads its own messages; it adds no flashing code. Song and settings
//   setup for the measurements uses the page's own FM1Web.Library and importer modules in the
//   page context (the commands the workbench already sends).
//
//   Safety: before every install the device identity the page reads after "Connect device" must be
//   SMK-37 Pro_8000001 (Open) or SMK-37 Pro_016 (factory V16); anything else stops the script
//   before "Start update" is pressed. Nothing retries an install.
//
//   Usage (playwright-core lives outside the repository, in ~/Documents/Classic Tabby/hw-tools):
//     node tools/linux/hw/workbench.mjs <command> --url URL [options]
//       install   [--expect VERSION] [--force]       Device update: connect, check identity, update
//       stock     (factory V16)                      Device update: Restore factory V16, connect, restore
//       resume    [--expect VERSION]                 Device update from the update loader (the page's
//                                                    loader resume path; the identity must be ota-...)
//     install, stock and resume take --port NAME: if the page lists ports to pick from (code
//     CHOOSE_PORT, Task 11B), pick the one whose name starts with NAME and connect once more.
//       backup    --file OUT.json                    Projects & sounds > Full backup
//       restore   --file IN.json                     Full restore (ends with the page's verify)
//       verify    --file IN.json                     Verify against file
//       diag      [--reset]                          Diagnostics: Read (or Reset) counters
//       song      --mid FILE.mid --slot N            import a MIDI file and write it to song slot N
//       settings  --patch JSON                       change bytes of transfer kind 8 (diag builds)
//       workspace --steps16 TRACK                    the workspace with 16 steps on one track (L.6)
//       info                                         capability and identity readout
//   Every command prints one JSON line ({ok, ...}) and appends the page's messages to --log.
//
// Version: 0.4
//
// Revision log
//   v0.4  2026-11-08  one dialog handler (v0.3's second handler crashed the resume before it started).
//   v0.3  2026-11-08  Task 11B port fix: resume command (loader resume, model confirm dialog
//                     accepted only for "SMK-37 Pro"); --port picks from the page's port list.
//   v0.2  2026-11-08  stock: wait for the page to settle after switching to V16 before Connect.
//   v0.1  2026-11-07  Task 11B: first version.

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, appendFileSync, copyFileSync } from 'node:fs';
import { basename } from 'node:path';

const require = createRequire(process.env.TABBY_HW_TOOLS || '/home/userzero/Documents/Classic Tabby/hw-tools/');
const { chromium } = require('playwright-core');
/* v0.1: the page translates its messages to English in this Chrome, so every wait accepts both. */

const argv = process.argv.slice(2), command = argv[0];
const opt = name => { const i = argv.indexOf('--' + name); return i > 0 ? argv[i + 1] : undefined; };
const flag = name => argv.includes('--' + name);
const url = opt('url'), logFile = opt('log') || '/dev/null';
const ALLOWED = ['SMK-37 Pro_8000001', 'SMK-37 Pro_016'];
const log = text => appendFileSync(logFile, new Date().toISOString() + ' ' + text + '\n');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ locale: 'zh-CN', acceptDownloads: true });
  await context.grantPermissions(['midi', 'midi-sysex'], { origin: new URL(url).origin });
  const page = await context.newPage();
  /* v0.4: the one dialog handler. The loader's model question (resume) is accepted only when it
     names "SMK-37 Pro"; every other page dialog (restore confirmations) is accepted as before.
     v0.3 added a second handler for the model question; both accepted the same dialog and the
     second accept threw, which ended the script before the update started (2026-11-08 19:05Z). */
  page.on('dialog', async d => {
    const m = d.message(); log('dialog: ' + m.replace(/\n/g, ' | '));
    const model = /hardware model is:|确认机身型号为/.test(m);
    try { if (model && !/SMK-37 Pro\?$/.test(m)) await d.dismiss(); else await d.accept(); }
    catch (e) { log('dialog handling failed: ' + e.message); }
  });
  page.on('console', m => { if (m.type() === 'error') log('console error: ' + m.text()); });
  page.on('pageerror', e => log('page error: ' + e.message));
  await page.goto(url, { waitUntil: 'load' });
  return { browser, page };
}
const text = (page, id) => page.$eval('#' + id, e => e.textContent.trim()).catch(() => '');
async function waitText(page, id, re, ms, also = []) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const t = await text(page, id);
    if (re.test(t)) return t;
    for (const [other, ore] of also) { const o = await text(page, other); if (o && ore.test(o)) throw new Error(other + ': ' + o); }
    await sleep(250);
  }
  throw new Error('timeout waiting for #' + id + ' ' + re + ' (now: ' + (await text(page, id)) + ')');
}

/* ---- Device update tab ----------------------------------------------------------------- */
async function updateTab(page) {
  await page.click('#mode-update');
  await waitText(page, 'status', /固件校验通过|等待连接|Firmware verified/, 60000, [['error', /./]]);
}
const PORT = (() => { const i = process.argv.indexOf('--port'); return i > 0 ? process.argv[i + 1] : null; })();
async function connectAndCheck(page, picked = false) {
  await page.click('#connect');
  const end = Date.now() + 60000;
  for (;;) {
    const id = await text(page, 'device-identity'), err = await text(page, 'error'), st = await text(page, 'status');
    if (id) { log('identity: ' + id + ' / status: ' + st); return { identity: id, status: st }; }
    if (err && PORT && !picked && await page.isVisible('#port-pick')) {
      /* v0.3: the page asks for a port (CHOOSE_PORT); pick the named one, once. */
      const value = await page.$$eval('#update-port option', (o, n) => (o.find(x => x.value && x.textContent.startsWith(n)) || {}).value || '', PORT);
      log('port list shown (' + err + '); picking ' + (value ? PORT : 'nothing: no match'));
      if (!value) throw new Error('connect failed: ' + err);
      await page.selectOption('#update-port', value);
      return connectAndCheck(page, true);
    }
    if (err) throw new Error('connect failed: ' + err);
    if (Date.now() > end) throw new Error('connect timeout: ' + st);
    await sleep(250);
  }
}
async function install(page, { expect, force }) {
  await updateTab(page);
  const shown = await text(page, 'firmware-version');
  if (expect && shown !== expect) throw new Error('page carries ' + shown + ', expected ' + expect);
  if (force) { await page.check('#force-update'); }
  let c = await connectAndCheck(page);
  if (!ALLOWED.includes(c.identity)) throw new Error('STOP: device identifies as "' + c.identity + '", not an SMK-37 Pro; nothing sent');
  if (/迁移|To migrate/.test(c.status) && force) {
    await page.click('#force-activate'); await sleep(1500);
    if (!(await page.isChecked('#force-update'))) await page.check('#force-update');
    c = await connectAndCheck(page);
    if (!ALLOWED.includes(c.identity)) throw new Error('STOP: device identifies as "' + c.identity + '"');
  }
  if (/已是当前版本|already installed/.test(c.status)) return { identity: c.identity, installed: false, status: c.status, version: shown };
  await page.check('#backup');
  const started = Date.now();
  await page.click('#install');
  const done = await waitText(page, 'status', /固件已就绪|原厂固件与资源已恢复|Firmware ready|Factory firmware and resources restored/, 8 * 60000, [['error', /./]]);
  return { identity: c.identity, installed: true, status: done, version: shown, seconds: (Date.now() - started) / 1000 };
}
async function stock(page) {
  await updateTab(page);
  await page.click('#update-options summary');
  await page.click('#stock-restore');
  await waitText(page, 'firmware-version', /V16/, 20000);
  /* v0.2: switching the page to V16 settles before Connect (an immediate Connect timed out). */
  await waitText(page, 'status', /./, 20000); await sleep(3000);
  const c = await connectAndCheck(page);
  if (!ALLOWED.includes(c.identity)) throw new Error('STOP: device identifies as "' + c.identity + '"');
  await page.check('#backup');
  const started = Date.now();
  await page.click('#install');
  const done = await waitText(page, 'status', /原厂固件与资源已恢复|Factory firmware and resources restored/, 8 * 60000, [['error', /./]]);
  return { identity: c.identity, status: done, seconds: (Date.now() - started) / 1000 };
}

/* v0.3: resume an update the device's loader is waiting for (the page's loader path). The
   loader cannot name the hardware model, so the page asks the user to confirm it; the script
   accepts only the "SMK-37 Pro" question, and only after the identity is a loader identity. */
async function resume(page, { expect }) {
  await updateTab(page);
  const shown = await text(page, 'firmware-version');
  if (expect && shown !== expect) throw new Error('page carries ' + shown + ', expected ' + expect);
  const c = await connectAndCheck(page);
  if (!/^ota-/.test(c.identity) || !/升级程序|[Ll]oader/.test(c.status))
    throw new Error('STOP: not the update loader ("' + c.identity + '" / ' + c.status + '); nothing sent');
  await page.check('#backup');
  const started = Date.now();
  await page.click('#install');
  const done = await waitText(page, 'status', /固件已就绪|Firmware ready/, 8 * 60000, [['error', /./]]);
  return { identity: c.identity, installed: true, status: done, version: shown, seconds: (Date.now() - started) / 1000 };
}

/* ---- Projects & sounds tab ------------------------------------------------------------- */
async function library(page) {
  await page.click('#mode-library');
  await page.click('#library-connect');
  await waitText(page, 'library-status', /项目库已连接|Project library connected/i, 60000);
  /* The backup and diagnostics groups are collapsed <details>: open them as a user would. */
  await page.$$eval('#backup-group, #diag-group', l => l.forEach(d => { d.open = true; }));
}
async function backupMessage(page, re, ms) {
  return waitText(page, 'backup-message', re, ms, [['library-status', /失败|无效|Stop|refus|error|未响应|不一致/i]]);
}
const notes = page => page.$$eval('#backup-notes li', l => l.map(e => e.textContent));

async function run() {
  const { browser, page } = await open();
  try {
    let result;
    if (command === 'install') result = await install(page, { expect: opt('expect'), force: flag('force') });
    else if (command === 'stock') result = await stock(page);
    else if (command === 'resume') result = await resume(page, { expect: opt('expect') });
    else if (command === 'backup') {
      await library(page);
      const [download] = await Promise.all([page.waitForEvent('download', { timeout: 15 * 60000 }), page.click('#backup-make')]);
      await download.saveAs(opt('file'));
      result = { file: opt('file'), message: await backupMessage(page, /Full backup saved/, 60000), notes: await notes(page) };
    } else if (command === 'restore' || command === 'verify') {
      await library(page);
      await page.setInputFiles('#backup-file', opt('file'));
      const checked = await backupMessage(page, /File checked|Refused/, 30000);
      if (/Refused/.test(checked)) throw new Error(checked);
      await page.click(command === 'restore' ? '#backup-restore' : '#backup-verify');
      const end = Date.now() + 20 * 60000;
      let m = '';
      while (Date.now() < end) {
        m = await text(page, 'backup-message');
        const lib = await text(page, 'library-status');
        if (/Verify (PASS|FAIL)/.test(m)) break;
        if (/Stop|refus|Nothing was changed|old data|not ready|失败|未响应|不一致|无效/i.test(lib) && !/Restoring|Verifying/.test(m)) { m = 'ERROR: ' + lib; break; }
        await sleep(500);
      }
      result = { checked, message: m, notes: await notes(page), pass: /Verify PASS/.test(m) };
    } else if (command === 'diag') {
      await library(page);
      await page.click(flag('reset') ? '#diag-reset' : '#diag-read');
      await waitText(page, 'diag-output', /Classic Tabby diagnostic/, 20000);
      result = { text: await text(page, 'diag-output') };
    } else {
      /* In-page work with the page's own Library and importer modules. */
      const args = { mid: opt('mid') ? Array.from(readFileSync(opt('mid'))) : null, name: opt('mid') ? basename(opt('mid')) : '',
        slot: Number(opt('slot')), patch: opt('patch') ? JSON.parse(opt('patch')) : null, track: Number(opt('steps16') ?? 0), command };
      result = await page.evaluate(async a => {
        const lib = new FM1Web.Library(await navigator.requestMIDIAccess({ sysex: true }));
        await lib.connect();
        try {
          if (a.command === 'info') return { userBytes: lib.userBytes, region: lib.songRegion, diag: lib.diagCounters, kind8: lib.settingsTransfer, identity: await lib.firmwareIdentity(), info: Array.from(await lib.query(0)) };
          if (a.command === 'song') {
            const analysis = TabbyMidiSong.analyze(TabbyMidi.parse(Uint8Array.from(a.mid)));
            const conv = TabbyMidiSong.convert(analysis, { fileName: a.name });
            const plan = await TabbySongTransfer.createStub().plan(conv.song, a.slot);
            const done = await lib.songWrite(a.slot, plan.record.image, new Map(plan.blocks.map(b => [b.id, b.payload])));
            return { slot: a.slot, blocks: plan.blocks.length, rows: conv.song.rows.length, replaced: done.replaced, outChannels: conv.song.outChannels };
          }
          if (a.command === 'settings') {
            const k = await lib.download(8);
            for (const [at, v] of Object.entries(a.patch)) k[Number(at)] = v;
            const c = FM1Web.crc32(k.subarray(0, 36)); k[36] = c & 255; k[37] = c >>> 8 & 255; k[38] = c >>> 16 & 255; k[39] = c >>> 24;
            await lib.upload(8, 0, k);
            return { kind8: Array.from(await lib.download(8)) };
          }
          if (a.command === 'workspace') {
            /* 16 steps on one track of the workspace: note 60, velocity 100, length 16 steps. */
            const p = await lib.download(0), t = a.track;
            for (let s = 0; s < 64; s++) { const at = (t * 64 + s) * 4; p[at] = s < 16 ? 60 : 0; p[at + 1] = s < 16 ? 100 : 0; p[at + 2] = 0; p[at + 3] = 0; }
            p[2048 + t * 223 + 221] = 1;   /* preset.sequence_pages = 1: a 16-step loop */
            await lib.upload(0, 0, p);
            return { ok: true };
          }
          throw new Error('unknown command ' + a.command);
        } finally { await lib.disconnect(); }
      }, args);
    }
    console.log(JSON.stringify({ ok: true, command, ...result }));
    log(command + ' ok: ' + JSON.stringify(result).slice(0, 2000));
  } catch (error) {
    console.log(JSON.stringify({ ok: false, command, error: error.message }));
    log(command + ' FAILED: ' + error.message);
    process.exitCode = 1;
  } finally { await browser.close(); }
}
await run();
