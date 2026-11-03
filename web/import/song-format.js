/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/song-format.js — Task 03 song and block format: model, encoding, validation
 *
 * Purpose
 *   One place that knows the bytes of the Classic Tabby song format, so the importer
 *   (midi-song.js), the transfer layer (song-transfer.js), the UI and the tests share it.
 *   The byte layouts follow docs/tasks/TASK-03-step1-assessment.md section 9 ("final"):
 *     9.3 block payload: 64 step headers, 0..4 notes of 3 bytes each, 64..832 bytes;
 *     9.4 block record: song, block id, length (u16 LE), payload, padded to 4 bytes;
 *     9.5 song record: 4096 bytes, header + 128 rows × 10 bytes;
 *     9.9 .tabby file: song record image (generation 0, target 0, commit 0, CRC valid)
 *         followed by block records with song byte 0, 4-byte aligned, to end of file.
 *
 *   The JavaScript song model (what the importer builds and the UI shows):
 *     { schema: 'tabby-song/1', name, projectSlot, tempo (0 = project tempo), loop,
 *       jumpMode: 'bar' | 'row', loopRow,
 *       rowSteps: 16 | 32 | 48 | 64,            // PENDING LAYOUT, see below
 *       outChannels: [8 × (null | 0..15)],     // PENDING LAYOUT, see below
 *       rows:   [{ blocks: [8 × id], repeat: 1..64, loopHere: false }],
 *       blocks: [{ id: 1..255, notes: [{ step, pitch, velocity, length, retrigger }],
 *                  stepFlags: { step: { probability, alt } } (optional) }] }
 *
 *   PENDING LAYOUT (v0.1): the Task 02 approval (2026-11-02) states that Task 03 added a
 *   per-row step length (16/32/48/64) and eight per-track output channels (with a "use the
 *   device setting" value) to the song header. The committed section 9 at
 *   classic-tabby/linux-build 7c1cdc2 does not contain either field (9.5: "every block is
 *   64 steps", row = 8 ids + repeat + flags, header reserved bytes 43..47 = 0). This file
 *   therefore carries both values in the model and in the JSON save file, but does NOT
 *   write them into the binary record; validate() reports them as "pending layout" and
 *   encodeRecord() leaves the reserved bytes untouched. When the offsets are confirmed,
 *   only PENDING.encode / PENDING.decode below change (plus the revision log).
 *
 *   Loading: classic script (globalThis.TabbySongFormat) and CommonJS (module.exports).
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2): model, block/record/file encoding
 *                     and decoding, validation rules, pool usage, JSON save/load, CRC-32.
 */
(() => {
  'use strict';

  const fail = text => { throw new Error(text); };

  /* Limits and constants from section 9. */
  const LIMITS = Object.freeze({
    steps: 64, notesPerStep: 4, noteBytes: 3,
    blockMin: 64, blockMax: 832,
    blocksPerSong: 255, rowsPerSong: 128, songs: 16, tracks: 8,
    repeatMin: 1, repeatMax: 64, lengthMin: 1, lengthMax: 255,
    tempoMin: 30, tempoMax: 300, nameLength: 12,
    recordArea: 4076, blockSectors: 96, poolBytes: 96 * 4076,   /* 391296 */
    recordBytes: 4096, rowBytes: 10, rowsOffset: 48, bodyEnd: 1328,
    rowStepsAllowed: [16, 32, 48, 64],
    magicRecord: 0x47314d46, /* FM1G */ magicBlocks: 0x42314d46, /* FM1B */
    version: 1,
  });

  /* ---- CRC-32 (reflected, 0xEDB88320, init/final 0xFFFFFFFF = groove_crc32) ---------- */
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
  function crc32(bytes, previous = 0) {
    let crc = ~previous >>> 0;
    for (let i = 0; i < bytes.length; i++) crc = table[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
    return (~crc) >>> 0;
  }

  /* ---- model helpers ------------------------------------------------------------------- */
  function emptySong(name = 'IMPORTED') {
    return { schema: 'tabby-song/1', name: padName(name), projectSlot: 0, tempo: 0, loop: false, jumpMode: 'bar', loopRow: 0,
      rowSteps: 64, outChannels: [null, null, null, null, null, null, null, null], rows: [], blocks: [] };
  }
  /* 12 printable ASCII characters, space padded, upper case like the device shows names. */
  function padName(text) {
    const clean = String(text || '').toUpperCase().replace(/[^\x20-\x7e]/g, '_').slice(0, LIMITS.nameLength);
    return (clean + ' '.repeat(LIMITS.nameLength)).slice(0, LIMITS.nameLength);
  }
  const sortNotes = notes => notes.slice().sort((a, b) => a.step - b.step || a.pitch - b.pitch || a.velocity - b.velocity || a.length - b.length);

  /* ---- block payload (9.3) ------------------------------------------------------------- */
  /* Group a block's notes by step and check every rule the device checks. Returns
   * an array of 64 note arrays (sorted by pitch) or throws. */
  function stepsOf(block, where = 'block') {
    const steps = Array.from({ length: LIMITS.steps }, () => []);
    for (const n of block.notes || []) {
      if (!Number.isInteger(n.step) || n.step < 0 || n.step >= LIMITS.steps) fail(where + ': note step ' + n.step + ' outside 0..63');
      if (!Number.isInteger(n.pitch) || n.pitch < 0 || n.pitch > 127) fail(where + ': pitch ' + n.pitch + ' outside 0..127');
      if (!Number.isInteger(n.velocity) || n.velocity < 1 || n.velocity > 127) fail(where + ': velocity ' + n.velocity + ' outside 1..127');
      if (!Number.isInteger(n.length) || n.length < LIMITS.lengthMin || n.length > LIMITS.lengthMax) fail(where + ': length ' + n.length + ' outside 1..255');
      steps[n.step].push(n);
    }
    steps.forEach((list, s) => {
      if (list.length > LIMITS.notesPerStep) fail(where + ': step ' + s + ' holds ' + list.length + ' notes (max 4)');
      list.sort((a, b) => a.pitch - b.pitch);
      for (let i = 1; i < list.length; i++) if (list[i].pitch === list[i - 1].pitch) fail(where + ': step ' + s + ' holds pitch ' + list[i].pitch + ' twice');
      const flags = (block.stepFlags || {})[s];
      if (flags) {
        if (!Number.isInteger(flags.probability || 0) || (flags.probability || 0) < 0 || (flags.probability || 0) > 7) fail(where + ': step ' + s + ' probability outside 0..7');
      }
    });
    return steps;
  }
  function encodeBlock(block, where) {
    const steps = stepsOf(block, where), out = [];
    steps.forEach((list, s) => {
      const flags = (block.stepFlags || {})[s] || {};
      out.push(list.length | ((flags.probability || 0) << 3) | (flags.alt ? 64 : 0));
      for (const n of list) out.push(n.pitch, n.velocity | (n.retrigger ? 128 : 0), n.length);
    });
    return Uint8Array.from(out);
  }
  function decodeBlock(bytes, id = 0) {
    const notes = [], stepFlags = {};
    let at = 0;
    for (let s = 0; s < LIMITS.steps; s++) {
      if (at >= bytes.length) fail('block payload ends inside step ' + s);
      const h = bytes[at++], count = h & 7;
      if (count > 4 || (h & 128)) fail('block payload step ' + s + ' header invalid');
      if (h & 0x78) stepFlags[s] = { probability: (h >> 3) & 7, alt: !!(h & 64) };
      for (let i = 0; i < count; i++) {
        if (at + 3 > bytes.length) fail('block payload ends inside a note');
        notes.push({ step: s, pitch: bytes[at] & 127, velocity: bytes[at + 1] & 127, length: bytes[at + 2], retrigger: !!(bytes[at + 1] & 128) });
        at += 3;
      }
    }
    if (at !== bytes.length) fail('block payload has ' + (bytes.length - at) + ' trailing byte(s)');
    const block = { id, notes: sortNotes(notes) };
    if (Object.keys(stepFlags).length) block.stepFlags = stepFlags;
    stepsOf(block, 'block ' + id);                     /* re-check ranges and duplicates */
    return block;
  }
  /* Deduplication key: the exact payload bytes as a string (identical bytes = same block). */
  function blockKey(notes) { return String.fromCharCode(...encodeBlock({ notes })); }

  /* ---- block record (9.4) and .tabby file (9.9) --------------------------------------- */
  const align4 = n => (n + 3) & ~3;
  function encodeBlockRecord(block, song = 0) {
    const payload = encodeBlock(block, 'block ' + block.id);
    const out = new Uint8Array(align4(4 + payload.length)).fill(0xff);
    out[0] = song; out[1] = block.id; out[2] = payload.length & 255; out[3] = payload.length >> 8;
    out.set(payload, 4);
    return out;
  }

  /* ---- song record (9.5) --------------------------------------------------------------- */
  /* The pending fields (see the file header). Both functions are deliberately no-ops. */
  const PENDING = {
    encode(/* record, song */) { /* row step length and per-track OUT CH: offsets not in section 9 yet */ },
    decode(/* record, song */) { /* leave model defaults: rowSteps 64, outChannels all null */ },
  };
  function encodeRecord(song, { generation = 0, target = 0 } = {}) {
    checkSong(song);
    const r = new Uint8Array(LIMITS.recordBytes), v = new DataView(r.buffer);
    r.fill(0xff, LIMITS.bodyEnd);                       /* 1328..4095 reserved 0xFF */
    v.setUint32(0, LIMITS.magicRecord, true);
    v.setUint32(4, generation >>> 0, true);
    v.setUint32(8, target >>> 0, true);
    v.setUint32(16, 0, true);                           /* commit = complete */
    v.setUint32(20, LIMITS.version, true);
    const name = padName(song.name);
    for (let i = 0; i < LIMITS.nameLength; i++) r[24 + i] = name.charCodeAt(i);
    r[36] = song.projectSlot;
    r[37] = (song.loop ? 1 : 0) | (song.jumpMode === 'row' ? 2 : 0);
    v.setUint16(38, song.tempo, true);
    r[40] = song.rows.length;
    r[41] = song.blocks.reduce((m, b) => Math.max(m, b.id), 0);
    r[42] = song.loopRow;
    song.rows.forEach((row, i) => {
      const at = LIMITS.rowsOffset + i * LIMITS.rowBytes;
      for (let t = 0; t < 8; t++) r[at + t] = row.blocks[t];
      r[at + 8] = row.repeat; r[at + 9] = row.loopHere ? 1 : 0;
    });
    PENDING.encode(r, song);
    v.setUint32(12, crc32(r.subarray(20, LIMITS.bodyEnd)), true);
    return r;
  }
  function decodeRecord(r) {
    if (!(r instanceof Uint8Array) || r.length !== LIMITS.recordBytes) fail('song record must be 4096 bytes');
    const v = new DataView(r.buffer, r.byteOffset, r.byteLength);
    if (v.getUint32(0, true) !== LIMITS.magicRecord) fail('song record magic is not FM1G');
    if (v.getUint32(12, true) !== crc32(r.subarray(20, LIMITS.bodyEnd))) fail('song record CRC mismatch');
    if (v.getUint32(20, true) !== LIMITS.version) fail('song record version ' + v.getUint32(20, true) + ' unsupported');
    const song = emptySong('');
    song.name = String.fromCharCode(...r.subarray(24, 36));
    song.projectSlot = r[36]; song.loop = !!(r[37] & 1); song.jumpMode = r[37] & 2 ? 'row' : 'bar';
    song.tempo = v.getUint16(38, true); song.loopRow = r[42];
    const rowCount = r[40];
    for (let i = 0; i < rowCount; i++) {
      const at = LIMITS.rowsOffset + i * LIMITS.rowBytes;
      song.rows.push({ blocks: Array.from(r.subarray(at, at + 8)), repeat: r[at + 8], loopHere: !!(r[at + 9] & 1) });
    }
    song.generation = v.getUint32(4, true); song.commit = v.getUint32(16, true);
    PENDING.decode(r, song);
    return song;
  }
  function encodeFile(song) {
    const record = encodeRecord(song);
    const parts = [record, ...song.blocks.slice().sort((a, b) => a.id - b.id).map(b => encodeBlockRecord(b, 0))];
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let at = 0; for (const p of parts) { out.set(p, at); at += p.length; }
    return out;
  }
  function decodeFile(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length < LIMITS.recordBytes) fail('.tabby file is shorter than one song record');
    const song = decodeRecord(bytes.subarray(0, LIMITS.recordBytes));
    let at = LIMITS.recordBytes;
    while (at < bytes.length) {
      if (bytes[at] === 0xff) break;                      /* erased filler */
      if (at + 4 > bytes.length) fail('.tabby block record header truncated');
      const songByte = bytes[at], id = bytes[at + 1], length = bytes[at + 2] | bytes[at + 3] << 8;
      if (songByte !== 0) fail('.tabby block record song byte must be 0');
      if (!id) fail('.tabby block record id 0 is invalid');
      if (length < LIMITS.blockMin || length > LIMITS.blockMax || at + 4 + length > bytes.length) fail('.tabby block record ' + id + ' length invalid');
      song.blocks.push(decodeBlock(bytes.subarray(at + 4, at + 4 + length), id));
      at = align4(at + 4 + length);
    }
    checkSong(song);
    return song;
  }

  /* ---- validation (the rule list from the Task 02 Step 1 report, 1.4 item 6) ----------- */
  function validate(song) {
    const errors = [], warnings = [];
    const err = text => errors.push(text), warn = text => warnings.push(text);
    if (!song || song.schema !== 'tabby-song/1') err('not a tabby-song/1 model');
    if (!song) return { errors, warnings, ok: false };
    if (typeof song.name !== 'string' || song.name.length !== LIMITS.nameLength || /[^\x20-\x7e]/.test(song.name)) err('name must be 12 printable ASCII characters');
    if (!Number.isInteger(song.projectSlot) || song.projectSlot < 0 || song.projectSlot > 15) err('project slot outside 0..15');
    if (!Number.isInteger(song.tempo) || (song.tempo !== 0 && (song.tempo < LIMITS.tempoMin || song.tempo > LIMITS.tempoMax))) err('tempo must be 0 or 30..300');
    if (!['bar', 'row'].includes(song.jumpMode)) err('jump mode must be bar or row');
    if (!Array.isArray(song.rows) || song.rows.length < 1) err('song needs at least one row');
    else if (song.rows.length > LIMITS.rowsPerSong) err('song has ' + song.rows.length + ' rows (max 128)');
    if (!Number.isInteger(song.loopRow) || song.loopRow < 0 || song.loopRow >= Math.max(1, (song.rows || []).length)) err('loop row outside the row list');
    const ids = new Map();
    for (const b of song.blocks || []) {
      if (!Number.isInteger(b.id) || b.id < 1 || b.id > 255) err('block id ' + b.id + ' outside 1..255');
      if (ids.has(b.id)) err('block id ' + b.id + ' used twice');
      ids.set(b.id, b);
      try { const bytes = encodeBlock(b, 'block ' + b.id); if (bytes.length < LIMITS.blockMin || bytes.length > LIMITS.blockMax) err('block ' + b.id + ' payload ' + bytes.length + ' bytes'); }
      catch (e) { err(e.message); }
    }
    if ((song.blocks || []).length > LIMITS.blocksPerSong) err('song has ' + song.blocks.length + ' blocks (max 255)');
    const used = new Set();
    (song.rows || []).forEach((row, i) => {
      if (!Array.isArray(row.blocks) || row.blocks.length !== 8) { err('row ' + (i + 1) + ' needs 8 block ids'); return; }
      row.blocks.forEach((id, t) => {
        if (!Number.isInteger(id) || id < 0 || id > 255) err('row ' + (i + 1) + ' track ' + (t + 1) + ' block id invalid');
        else if (id) { used.add(id); if (!ids.has(id)) err('row ' + (i + 1) + ' track ' + (t + 1) + ' references missing block ' + id); }
      });
      if (!Number.isInteger(row.repeat) || row.repeat < LIMITS.repeatMin || row.repeat > LIMITS.repeatMax) err('row ' + (i + 1) + ' repeat outside 1..64');
    });
    for (const id of ids.keys()) if (!used.has(id)) warn('block ' + id + ' is stored but no row uses it');
    const u = errors.length ? null : usage(song);
    if (u && u.recordBytes > LIMITS.poolBytes) err('blocks need ' + u.recordBytes + ' bytes, the pool holds ' + LIMITS.poolBytes);
    /* Pending-layout fields (see the file header). */
    if (!LIMITS.rowStepsAllowed.includes(song.rowSteps)) err('row steps must be 16, 32, 48 or 64');
    else if (song.rowSteps !== 64) warn('row length ' + song.rowSteps + ' steps: the row step-length field is not in the committed section 9 yet (pending layout); the binary record carries 64-step rows');
    if (!Array.isArray(song.outChannels) || song.outChannels.length !== 8 || song.outChannels.some(c => c !== null && !(Number.isInteger(c) && c >= 0 && c <= 15))) err('outChannels must be 8 entries of null or 0..15');
    else if (song.outChannels.some(c => c !== null)) warn('per-track OUT CH assigned: the song-header channel field is not in the committed section 9 yet (pending layout); set the channels on the device until it lands');
    return { errors, warnings, ok: !errors.length };
  }
  function checkSong(song) { const r = validate(song); if (!r.ok) fail(r.errors[0]); }

  /* ---- pool usage ---------------------------------------------------------------------- */
  /* Bytes as stored on the device (record header + payload, 4-byte aligned), and the number
   * of 4076-byte sector areas a first-fit-decreasing packing needs. */
  function usage(song) {
    const sizes = song.blocks.map(b => align4(4 + encodeBlock(b).length));
    const payloadBytes = song.blocks.reduce((n, b) => n + encodeBlock(b).length, 0);
    const recordBytes = sizes.reduce((n, s) => n + s, 0);
    const bins = [];
    for (const s of sizes.slice().sort((a, b) => b - a)) {
      const bin = bins.find(free => free >= s);
      if (bin !== undefined) bins[bins.indexOf(bin)] -= s; else bins.push(LIMITS.recordArea - s);
    }
    const cells = song.rows.reduce((n, r) => n + r.blocks.filter(Boolean).length, 0);
    return { blocks: song.blocks.length, idPercent: song.blocks.length / LIMITS.blocksPerSong * 100, payloadBytes, recordBytes,
      sectors: bins.length, poolPercent: recordBytes / LIMITS.poolBytes * 100, rows: song.rows.length,
      repeats: song.rows.reduce((n, r) => n + r.repeat, 0), cells, fileBytes: LIMITS.recordBytes + recordBytes };
  }

  /* ---- JSON save / load (browser round trip, Task 02 Step 3) --------------------------- */
  function toJSON(song, extra = {}) {
    checkSong(song);
    const data = { ...song, ...extra, blocks: song.blocks.map(b => ({ id: b.id, ...(b.stepFlags ? { stepFlags: b.stepFlags } : {}),
      notes: sortNotes(b.notes).map(n => n.retrigger ? [n.step, n.pitch, n.velocity, n.length, 1] : [n.step, n.pitch, n.velocity, n.length]) })) };
    return JSON.stringify(data, null, 1);
  }
  function fromJSON(text) {
    const data = typeof text === 'string' ? JSON.parse(text) : text;
    if (!data || data.schema !== 'tabby-song/1') fail('not a tabby-song/1 JSON file');
    const song = { ...emptySong(''), ...data };
    song.blocks = (data.blocks || []).map(b => ({ id: b.id, ...(b.stepFlags ? { stepFlags: b.stepFlags } : {}),
      notes: (b.notes || []).map(n => Array.isArray(n) ? { step: n[0], pitch: n[1], velocity: n[2], length: n[3], retrigger: !!n[4] } : { ...n, retrigger: !!n.retrigger }) }));
    song.rows = (data.rows || []).map(r => ({ blocks: Array.from(r.blocks || []), repeat: r.repeat, loopHere: !!r.loopHere }));
    checkSong(song);
    return song;
  }

  /* Expand a song back to its cell grid (row × track → notes) for the deduplication tests
   * and for views: repeats are not unrolled, rows are the stored rows. */
  function grid(song) {
    const byId = new Map(song.blocks.map(b => [b.id, b]));
    return song.rows.map(r => r.blocks.map(id => id ? sortNotes(byId.get(id).notes) : []));
  }

  const TabbySongFormat = { LIMITS, crc32, emptySong, padName, sortNotes, encodeBlock, decodeBlock, blockKey, encodeBlockRecord,
    encodeRecord, decodeRecord, encodeFile, decodeFile, validate, usage, toJSON, fromJSON, grid, PENDING, version: '0.1' };
  globalThis.TabbySongFormat = TabbySongFormat;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbySongFormat;
})();
