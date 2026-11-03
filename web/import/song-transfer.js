/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/song-transfer.js — the one interface through which a song reaches the device
 *
 * Purpose
 *   Task 02 keeps the device write behind a single interface so the importer, the UI and
 *   the tests do not care whether a real SMK-37 is attached. Two implementations:
 *
 *     stub   (this file, v0.1)  validates the song, serialises it exactly as the device
 *            transfer would (Task 03 section 9.9 v0.4: kind 5 = 4096-byte song record, kind 6 =
 *            one block payload per transfer with target (song << 16) | id) and reports what
 *            it would send: byte counts, number of 64-byte protocol queries and a time
 *            estimate. It never opens a MIDI port. Used until Task 03 Step 2 is merged.
 *     backend (Task 02 Step 4, v0.3)  same interface on top of the workbench's song
 *            backend (the `songBackend()` object of sdk/Update.html.in: read / write /
 *            remove / status / exists, backed either by the Library class, i.e. a device,
 *            or by the browser simulator). The write is the workbench's own path and no
 *            transfer code lives here: song record first (kind 5), then the blocks as
 *            kind-7 batches cut at the device's packing boundaries (section 9.6 v0.5), then
 *            the record is read back and compared (Library.songWrite). When the slot
 *            already holds a song it is deleted first (Library.songDelete) so every old
 *            block becomes garbage for compaction instead of staying live under an id the
 *            new song no longer uses.
 *
 *   Interface (every method returns a Promise):
 *     name                         'stub' | 'device'
 *     real                         false for the stub
 *     describe()                   limits and pool sizes
 *     validate(song)               { ok, errors, warnings } from song-format.js
 *     plan(song, slot)             { record:{kind:5,target,bytes}, blocks:[{kind:6,target,bytes}],
 *                                    batches:[{kind:7,blocks,bytes}], totalBytes, queries,
 *                                    seconds, warnings }
 *     exists(slot)                 { empty: true | false | 'unknown', name, rows, blocks }
 *     write(slot, song, {progress, signal})   stub: validate + plan, returns the plan with
 *                                             sent:false; backend: deletes an occupied slot,
 *                                             writes (record, batches, read-back), returns the
 *                                             plan with sent:true, replaced and seconds
 *     read(slot)                   stub: rejects; backend: the slot's song as a model, or null
 *
 *   Protocol cost model (for the estimate): the existing transfer path sends 64 payload
 *   bytes per query (WebUpdate.js upload: one command 4 per 64 bytes) plus begin, finish
 *   and cancel; about 10 ms per query on USB MIDI.
 *
 *   Loading: classic script (globalThis.TabbySongTransfer) and CommonJS.
 *
 * Version: 0.3
 *
 * Revision log
 *   v0.3  2026-11-02  Step 4: createBackend() on the workbench song backend (device or
 *                     simulator), kind-7 batch plan, delete-before-replace, read().
 *   v0.2  2026-11-02  Kind 6 target (song << 16) | id (section 9 v0.4, 16-bit block ids).
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2): interface and stub.
 */
(() => {
  'use strict';

  const format = () => globalThis.TabbySongFormat || (typeof require === 'function' ? require('./song-format.js') : (() => { throw new Error('song-format.js not loaded'); })());
  const CHUNK = 64, SECONDS_PER_QUERY = 0.01, OVERHEAD_QUERIES = 3;   /* begin, finish, cancel */
  /* Kind-7 batches as sdk/WebUpdate.js songBatches() cuts them (section 9.9 v0.5): records in
   * id order, greedy first fit into 4076-byte record areas, a record never splits, at most 8
   * sectors (32608 bytes) per batch. Only the plan and the estimate use this; the workbench
   * does its own cutting when it writes. */
  const BATCH_AREA = 4076, BATCH_SECTORS = 8;
  function batchesOf(blocks) {
    const batches = []; let list = [], bytes = 0, fill = 0, sectors = 1;
    for (const b of blocks) {
      const size = (6 + b.bytes + 3) & ~3;
      if (fill + size > BATCH_AREA) { if (sectors === BATCH_SECTORS) { batches.push({ kind: 7, blocks: list, bytes }); list = []; bytes = 0; sectors = 0; } sectors++; fill = 0; }
      list.push(b.id); bytes += size; fill += size;
    }
    if (list.length) batches.push({ kind: 7, blocks: list, bytes });
    return batches;
  }
  /* The common part of plan(): the record image, the block payloads in id order, the batch
   * cut, the byte and query counts. `batched` selects kind 7 (device path) or kind 6. */
  function planSong(F, song, slot, batched) {
    const L = F.LIMITS;
    if (!Number.isInteger(slot) || slot < 0 || slot >= L.songs) throw new Error('song slot must be 0..15');
    const v = F.validate(song);
    if (!v.ok) throw new Error('song is invalid: ' + v.errors[0]);
    const record = F.encodeRecord(song);
    const blocks = song.blocks.slice().sort((a, b) => a.id - b.id).map(b => {
      const payload = F.encodeBlock(b, 'block ' + b.id);
      return { kind: 6, target: (slot << 16) | b.id, id: b.id, bytes: payload.length, payload };
    });
    const batches = batched ? batchesOf(blocks) : [];
    const items = [{ bytes: record.length }, ...(batched ? batches : blocks)];
    const queries = items.reduce((n, i) => n + Math.ceil(i.bytes / CHUNK) + OVERHEAD_QUERIES, 0);
    return { record: { kind: 5, target: slot, bytes: record.length, image: record }, blocks, batches,
      totalBytes: items.reduce((n, i) => n + i.bytes, 0), transfers: items.length, queries, seconds: queries * SECONDS_PER_QUERY, warnings: v.warnings, usage: F.usage(song) };
  }

  function createStub() {
    const F = format(), L = F.LIMITS;
    const self = {
      name: 'stub', real: false,
      async describe() {
        return { songs: L.songs, rows: L.rowsPerSong, blocks: L.blocksPerSong, blockSectors: L.blockSectors, poolBytes: L.poolBytes,
          real: false, note: 'Stub: validates and reports what would be sent; no device is written.' };
      },
      async validate(song) { return F.validate(song); },
      async plan(song, slot) { return planSong(F, song, slot, false); },
      async exists(slot) {
        if (!Number.isInteger(slot) || slot < 0 || slot >= L.songs) throw new Error('song slot must be 0..15');
        return { empty: 'unknown', name: '', rows: 0, blocks: 0 };
      },
      async write(slot, song, { progress = () => {}, signal } = {}) {
        signal?.throwIfAborted();
        const plan = await self.plan(song, slot);
        progress(1);
        return { ...plan, sent: false, slot,
          message: 'Stub: would send song record (' + plan.record.bytes + ' B) to song ' + (slot + 1) + ' and ' + plan.blocks.length + ' block(s), ' +
            plan.totalBytes + ' bytes in ' + plan.queries + ' queries (about ' + plan.seconds.toFixed(1) + ' s). Nothing was written.' };
      },
      async read() { throw new Error('Stub transfer: nothing to read until Task 03 Step 2 is merged'); },
    };
    return self;
  }

  /* The workbench implementation (Step 4). `getBackend(progress)` returns the workbench's
   * song backend for the current target (device through the Library class, or the browser
   * simulator) and throws when that target is not connected; it is called at the moment of
   * each operation, so the panel can be mounted before anything is connected. `name()`
   * returns the current target's name for messages. The backend contract (sdk/Update.html.in,
   * songBackend()):
   *   read(slot)                        → { record: Uint8Array(4096), blocks: Map(id → payload) } | null
   *   write(slot, record, blocks)       → the workbench song write: record, batches, read-back
   *   remove(slot)                      → deletes the song
   *   exists(slot)                      → the 4096-byte record image, or null when empty
   *   status()                          → { free, reclaimable, state } */
  function createBackend(getBackend, { name = () => 'device' } = {}) {
    const F = format(), L = F.LIMITS;
    const self = {
      get name() { return typeof name === 'function' ? name() : name; }, real: true,
      async describe() {
        return { songs: L.songs, rows: L.rowsPerSong, blocks: L.blocksPerSong, blockSectors: L.blockSectors, poolBytes: L.poolBytes, real: true,
          note: 'Writes through the workbench song path: record first, then the blocks in kind-7 batches, then the record is read back; an occupied slot is deleted first.' };
      },
      async validate(song) { return F.validate(song); },
      async plan(song, slot) { return planSong(F, song, slot, true); },
      async exists(slot) {
        if (!Number.isInteger(slot) || slot < 0 || slot >= L.songs) throw new Error('song slot must be 0..15');
        let backend;
        try { backend = getBackend(); } catch (error) { return { empty: 'unknown', name: '', rows: 0, blocks: 0, reason: error.message }; }
        const image = await backend.exists(slot);
        if (!image) return { empty: true, name: '', rows: 0, blocks: 0 };
        const song = F.decodeRecord(image);
        return { empty: false, name: song.name.trim(), rows: song.rows.length, blocks: new Set(song.rows.flatMap(r => r.blocks).filter(Boolean)).size };
      },
      async write(slot, song, { progress = () => {}, signal } = {}) {
        signal?.throwIfAborted();
        const plan = await self.plan(song, slot);
        const backend = getBackend(p => progress(0.05 + 0.9 * p));
        const was = await self.exists(slot);
        if (was.empty === false) await backend.remove(slot);            /* delete before replace */
        signal?.throwIfAborted(); progress(0.05);
        const started = Date.now();
        await backend.write(slot, plan.record.image, new Map(plan.blocks.map(b => [b.id, b.payload])));
        const seconds = (Date.now() - started) / 1000;
        progress(1);
        return { ...plan, sent: true, slot, replaced: was.empty === false, seconds,
          message: 'Written to ' + self.name + ' song ' + (slot + 1) + (was.empty === false ? ' (previous "' + was.name + '" deleted first)' : '') + ': record + ' +
            plan.blocks.length + ' block(s) in ' + plan.batches.length + ' batch(es), ' + plan.totalBytes + ' bytes, ' + seconds.toFixed(1) + ' s' +
            (self.name === 'device' ? '; record read back and verified.' : '.') };
      },
      async read(slot) {
        const got = await getBackend().read(slot);
        if (!got) return null;
        /* Rebuild the .tabby byte stream (record + block records) and decode it. */
        const records = [...got.blocks].sort((a, b) => a[0] - b[0]).map(([id, payload]) => {
          const out = new Uint8Array((6 + payload.length + 3) & ~3).fill(0xff);
          out[0] = 0; out[1] = 0; out[2] = id & 255; out[3] = id >> 8; out[4] = payload.length & 255; out[5] = payload.length >> 8; out.set(payload, 6); return out;
        });
        const file = new Uint8Array(4096 + records.reduce((n, r) => n + r.length, 0));
        file.set(got.record, 0); let at = 4096; for (const r of records) { file.set(r, at); at += r.length; }
        return F.decodeFile(file);
      },
    };
    return self;
  }

  /* Pick the implementation: the workbench backend when one is given, else the stub. */
  function select({ backend, name } = {}) {
    return backend ? createBackend(backend, { name }) : createStub();
  }

  const TabbySongTransfer = { createStub, createBackend, select, batchesOf, CHUNK, SECONDS_PER_QUERY, version: '0.3' };
  globalThis.TabbySongTransfer = TabbySongTransfer;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbySongTransfer;
})();
