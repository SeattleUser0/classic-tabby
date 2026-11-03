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
 *     device (Task 02 Step 4)   same interface, built on the workbench Library class
 *            (sdk/WebUpdate.js upload/download with kinds 5 and 6, capability bit 2 of
 *            command 22 reply byte 8, command 23 for free space).
 *
 *   Interface (every method returns a Promise):
 *     name                         'stub' | 'device'
 *     real                         false for the stub
 *     describe()                   limits and pool sizes
 *     validate(song)               { ok, errors, warnings } from song-format.js
 *     plan(song, slot)             { record:{kind:5,target,bytes}, blocks:[{kind:6,target,bytes}],
 *                                    totalBytes, queries, seconds, warnings }
 *     exists(slot)                 { empty: true | false | 'unknown', name, rows, blocks }
 *     write(slot, song, {progress, signal})   stub: validate + plan, returns the plan with
 *                                             sent:false; device: uploads, reads back, compares
 *     read(slot)                   stub: rejects (nothing to read)
 *
 *   Protocol cost model (for the estimate): the existing transfer path sends 64 payload
 *   bytes per query (WebUpdate.js upload: one command 4 per 64 bytes) plus begin, finish
 *   and cancel; about 10 ms per query on USB MIDI.
 *
 *   Loading: classic script (globalThis.TabbySongTransfer) and CommonJS.
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-02  Kind 6 target (song << 16) | id (section 9 v0.4, 16-bit block ids).
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2): interface and stub.
 */
(() => {
  'use strict';

  const format = () => globalThis.TabbySongFormat || (typeof require === 'function' ? require('./song-format.js') : (() => { throw new Error('song-format.js not loaded'); })());
  const CHUNK = 64, SECONDS_PER_QUERY = 0.01, OVERHEAD_QUERIES = 3;   /* begin, finish, cancel */

  function createStub() {
    const F = format(), L = F.LIMITS;
    const self = {
      name: 'stub', real: false,
      async describe() {
        return { songs: L.songs, rows: L.rowsPerSong, blocks: L.blocksPerSong, blockSectors: L.blockSectors, poolBytes: L.poolBytes,
          real: false, note: 'Stub: validates and reports what would be sent; no device is written.' };
      },
      async validate(song) { return F.validate(song); },
      async plan(song, slot) {
        if (!Number.isInteger(slot) || slot < 0 || slot >= L.songs) throw new Error('song slot must be 0..15');
        const v = F.validate(song);
        if (!v.ok) throw new Error('song is invalid: ' + v.errors[0]);
        const record = F.encodeRecord(song);
        const blocks = song.blocks.slice().sort((a, b) => a.id - b.id).map(b => {
          const payload = F.encodeBlock(b, 'block ' + b.id);
          return { kind: 6, target: (slot << 16) | b.id, id: b.id, bytes: payload.length, payload };
        });
        const items = [{ kind: 5, target: slot, bytes: record.length }, ...blocks];
        const queries = items.reduce((n, i) => n + Math.ceil(i.bytes / CHUNK) + OVERHEAD_QUERIES, 0);
        return { record: { kind: 5, target: slot, bytes: record.length, image: record }, blocks, totalBytes: items.reduce((n, i) => n + i.bytes, 0),
          transfers: items.length, queries, seconds: queries * SECONDS_PER_QUERY, warnings: v.warnings, usage: F.usage(song) };
      },
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

  /* Pick the implementation. Until Step 4 only the stub exists; `capability` is the
   * command 22 reply (Uint8Array) when a device is connected. */
  function select({ capability } = {}) {
    void capability;
    return createStub();
  }

  const TabbySongTransfer = { createStub, select, CHUNK, SECONDS_PER_QUERY, version: '0.2' };
  globalThis.TabbySongTransfer = TabbySongTransfer;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbySongTransfer;
})();
