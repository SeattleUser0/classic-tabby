/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/midi-parse.js — Standard MIDI File (SMF) parser for the Classic Tabby importer
 *
 * Purpose
 *   Turn the bytes of a .mid file (type 0 or type 1) into plain JavaScript event lists so
 *   midi-song.js can map them onto Task 03 songs. Own code, no library (Task 02 decision 5):
 *   nothing to add to THIRD_PARTY.md, and the file is small enough to inline into the
 *   workbench HTML at merge time (Task 02 Step 4).
 *
 *   What it handles
 *     - header chunk MThd: format 0 and 1; format 2 (independent sequences) is rejected;
 *       SMPTE time division (negative division) is rejected: the importer works in ticks per
 *       quarter note and the files this project cares about (Renoise exports) use PPQ;
 *     - unknown chunks between tracks are skipped (the SMF rule);
 *     - variable-length quantities, running status, note-on with velocity 0 = note-off;
 *     - channel events (note on/off, poly and channel pressure, control change, program
 *       change, pitch bend), meta events (track name 0x03, tempo 0x51, time signature 0x58,
 *       end of track 0x2F; others kept by type number), SysEx F0/F7 (skipped, counted);
 *     - a truncated last track is tolerated: events read so far are kept and a warning is
 *       added, so a slightly damaged export still imports;
 *     - note pairing per (track, channel, pitch): note-off closes the oldest open note of
 *       that pitch; notes still open at the end of the track end at the track's last tick
 *       (counted as "unterminated").
 *
 *   Loading: classic script in the browser (publishes globalThis.TabbyMidi) and CommonJS in
 *   Node (module.exports) so the host tests under tests/midi-import run the same file.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2).
 */
(() => {
  'use strict';

  const fail = text => { throw new Error(text); };

  /* Read one variable-length quantity at `at`; returns [value, nextIndex]. */
  function vlq(bytes, at, end) {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      if (at >= end) fail('MIDI file is truncated inside a delta time or length');
      const b = bytes[at++];
      value = (value * 128) + (b & 127);
      if (!(b & 128)) return [value, at];
    }
    fail('MIDI file has an invalid variable-length quantity');
  }

  const ascii = (bytes, from, to) => {
    let text = '';
    for (let i = from; i < to; i++) text += String.fromCharCode(bytes[i]);
    return text;
  };
  const be32 = (b, at) => ((b[at] << 24) >>> 0) + (b[at + 1] << 16) + (b[at + 2] << 8) + b[at + 3];
  const be16 = (b, at) => (b[at] << 8) + b[at + 1];

  /* Decode text meta events: Latin-1 is what trackers and most DAWs write; control bytes
   * are replaced so names are safe to show. */
  const metaText = (bytes, from, to) => ascii(bytes, from, to).replace(/[\x00-\x1f\x7f]/g, ' ').trim();

  /* Parse one MTrk chunk body (bytes[from..to)) into events. */
  function parseTrack(bytes, from, to, index, warnings) {
    const events = [];
    let at = from, tick = 0, status = 0, ended = false;
    try {
      while (at < to && !ended) {
        let delta;
        [delta, at] = vlq(bytes, at, to);
        tick += delta;
        if (at >= to) fail('MIDI track ' + index + ' ends after a delta time');
        let b = bytes[at];
        if (b === 0xff) {                                   /* meta event */
          if (at + 2 > to) fail('MIDI track ' + index + ' is truncated inside a meta event');
          const type = bytes[at + 1];
          let length; [length, at] = vlq(bytes, at + 2, to);
          if (at + length > to) fail('MIDI track ' + index + ' is truncated inside a meta event');
          const data = bytes.subarray(at, at + length);
          at += length;
          if (type === 0x2f) { ended = true; events.push({ tick, type: 'endOfTrack' }); }
          else if (type === 0x51 && length === 3) {
            const mpq = (data[0] << 16) + (data[1] << 8) + data[2];
            events.push({ tick, type: 'tempo', microsecondsPerQuarter: mpq, bpm: mpq ? 60000000 / mpq : 0 });
          } else if (type === 0x58 && length >= 2) {
            events.push({ tick, type: 'timeSignature', numerator: data[0], denominator: 2 ** data[1], metronome: data[2], thirtySeconds: data[3] });
          } else if (type === 0x03) events.push({ tick, type: 'trackName', text: metaText(bytes, at - length, at) });
          else if (type === 0x04) events.push({ tick, type: 'instrumentName', text: metaText(bytes, at - length, at) });
          else if (type === 0x06) events.push({ tick, type: 'marker', text: metaText(bytes, at - length, at) });
          else if (type === 0x05) events.push({ tick, type: 'lyric', text: metaText(bytes, at - length, at) });
          else if (type === 0x59 && length === 2) events.push({ tick, type: 'keySignature', sharps: (data[0] << 24) >> 24, minor: data[1] === 1 });
          else events.push({ tick, type: 'meta', metaType: type, length });
          status = 0;                                        /* meta events cancel running status */
        } else if (b === 0xf0 || b === 0xf7) {              /* SysEx / escape */
          let length; [length, at] = vlq(bytes, at + 1, to);
          if (at + length > to) fail('MIDI track ' + index + ' is truncated inside a SysEx event');
          events.push({ tick, type: 'sysex', length: length + 1 });
          at += length;
          status = 0;
        } else {                                             /* channel event */
          if (b & 0x80) { status = b; at++; }
          else if (!status) fail('MIDI track ' + index + ' uses running status before any status byte');
          const kind = status & 0xf0, channel = status & 15;
          const two = kind !== 0xc0 && kind !== 0xd0;
          if (at + (two ? 2 : 1) > to) fail('MIDI track ' + index + ' is truncated inside a channel event');
          const d1 = bytes[at] & 127, d2 = two ? bytes[at + 1] & 127 : 0;
          at += two ? 2 : 1;
          if (kind === 0x90 && d2 > 0) events.push({ tick, type: 'noteOn', channel, pitch: d1, velocity: d2 });
          else if (kind === 0x90 || kind === 0x80) events.push({ tick, type: 'noteOff', channel, pitch: d1, velocity: d2 });
          else if (kind === 0xb0) events.push({ tick, type: 'controlChange', channel, controller: d1, value: d2 });
          else if (kind === 0xc0) events.push({ tick, type: 'programChange', channel, program: d1 });
          else if (kind === 0xe0) events.push({ tick, type: 'pitchBend', channel, value: (d2 << 7 | d1) - 8192 });
          else if (kind === 0xa0) events.push({ tick, type: 'polyPressure', channel, pitch: d1, value: d2 });
          else if (kind === 0xd0) events.push({ tick, type: 'channelPressure', channel, value: d1 });
          else fail('MIDI track ' + index + ' has an unexpected status byte ' + status.toString(16));
        }
      }
    } catch (error) {
      /* Keep what was read; the importer shows the warning next to the file summary. */
      warnings.push({ kind: 'truncated', message: error.message + ' (events read so far were kept)' });
    }
    if (!ended) warnings.push({ kind: 'noEndOfTrack', message: 'MIDI track ' + index + ' has no end-of-track event' });
    return { index, events, lastTick: tick };
  }

  /* Pair note-on / note-off events of one track into notes. Each note: {tick, endTick,
   * channel, pitch, velocity}. Overlapping same-pitch notes are closed oldest first. */
  function pairNotes(track, warnings) {
    const open = new Map(), notes = [];
    const key = e => e.channel * 128 + e.pitch;
    for (const e of track.events) {
      if (e.type === 'noteOn') {
        const note = { tick: e.tick, endTick: -1, channel: e.channel, pitch: e.pitch, velocity: e.velocity };
        notes.push(note);
        const k = key(e); if (!open.has(k)) open.set(k, []);
        open.get(k).push(note);
      } else if (e.type === 'noteOff') {
        const list = open.get(key(e));
        if (list && list.length) list.shift().endTick = e.tick;
      }
    }
    let unterminated = 0;
    for (const list of open.values()) for (const note of list) { note.endTick = Math.max(note.tick, track.lastTick); unterminated++; }
    if (unterminated) warnings.push({ kind: 'unterminated', message: unterminated + ' note(s) on MIDI track ' + track.index + ' had no note-off and end at the end of the track' });
    /* Zero-length notes (note-off at the same tick) are kept; midi-song.js gives them one step. */
    notes.sort((a, b) => a.tick - b.tick || a.channel - b.channel || a.pitch - b.pitch);
    return notes;
  }

  /* Public entry point. Returns
   *   { format, division, trackCount, tracks:[{index, name, events, notes, lastTick, channels:[...]}],
   *     lastTick, warnings:[{kind, message}] } */
  function parse(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.length < 14 || ascii(bytes, 0, 4) !== 'MThd') fail('Not a Standard MIDI File (missing MThd header)');
    const headerLength = be32(bytes, 4);
    if (headerLength < 6 || 8 + headerLength > bytes.length) fail('MIDI header length is invalid');
    const format = be16(bytes, 8), trackCount = be16(bytes, 10), divisionRaw = be16(bytes, 12);
    if (format === 2) fail('MIDI format 2 (independent sequences) is not supported; export format 0 or 1');
    if (format > 2) fail('Unknown MIDI format ' + format);
    if (divisionRaw & 0x8000) fail('SMPTE time division is not supported; export with ticks per quarter note (PPQ)');
    const division = divisionRaw;
    if (!division) fail('MIDI division (ticks per quarter note) is zero');
    const warnings = [], tracks = [];
    let at = 8 + headerLength;
    while (at + 8 <= bytes.length && tracks.length < trackCount) {
      const id = ascii(bytes, at, at + 4), length = be32(bytes, at + 4);
      const from = at + 8, to = Math.min(bytes.length, from + length);
      if (from + length > bytes.length) warnings.push({ kind: 'truncated', message: 'Chunk ' + id + ' claims ' + length + ' bytes but the file ends early' });
      if (id === 'MTrk') {
        const track = parseTrack(bytes, from, to, tracks.length, warnings);
        track.notes = pairNotes(track, warnings);
        track.name = (track.events.find(e => e.type === 'trackName') || {}).text || '';
        track.channels = [...new Set(track.notes.map(n => n.channel))].sort((a, b) => a - b);
        tracks.push(track);
      } else warnings.push({ kind: 'unknownChunk', message: 'Skipped unknown chunk ' + JSON.stringify(id) });
      at = to;
    }
    if (tracks.length !== trackCount) warnings.push({ kind: 'trackCount', message: 'Header announces ' + trackCount + ' track(s), file holds ' + tracks.length });
    if (!tracks.length) fail('MIDI file holds no track');
    if (format === 0 && tracks.length > 1) warnings.push({ kind: 'format0', message: 'Format 0 file with more than one track; all tracks are read' });
    const lastTick = Math.max(0, ...tracks.map(t => t.lastTick), ...tracks.flatMap(t => t.notes.map(n => n.endTick)));
    return { format, division, trackCount, tracks, lastTick, warnings };
  }

  const TabbyMidi = { parse, pairNotes, vlq, version: '0.1' };
  globalThis.TabbyMidi = TabbyMidi;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyMidi;
})();
