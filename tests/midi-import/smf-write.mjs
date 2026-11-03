// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tests/midi-import/smf-write.mjs — tiny Standard MIDI File writer for the importer tests
//
// Purpose
//   Build deterministic .mid fixtures (type 0 and type 1) from absolute-tick event lists so
//   tests/midi-import/run.mjs can check the parser and the song conversion against known
//   inputs without depending on a DAW export. The writer is independent of the parser under
//   test (it does not share code with web/import/midi-parse.js).
//
//   Events: { tick, type, ... } with types
//     noteOn/noteOff {channel, pitch, velocity}, controlChange {channel, controller, value},
//     programChange {channel, program}, pitchBend {channel, value -8192..8191},
//     channelPressure {channel, value}, tempo {bpm} or {microsecondsPerQuarter},
//     timeSignature {numerator, denominator}, trackName {text}, marker {text}, sysex {data}.
//   note(events, tick, duration, pitch, velocity, channel) pushes a note-on/off pair.
//   write({format, division, tracks:[events...], runningStatus}) returns a Uint8Array.
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-02  Initial version (Task 02, Step 2).

export function note(events, tick, duration, pitch, velocity = 100, channel = 0) {
  events.push({ tick, type: 'noteOn', channel, pitch, velocity });
  events.push({ tick: tick + duration, type: 'noteOff', channel, pitch, velocity: 0, order: 1 });
}

function vlq(value) {
  const out = [value & 127];
  while ((value >>= 7) > 0) out.unshift((value & 127) | 128);
  return out;
}
const text = s => Array.from(s, c => c.charCodeAt(0) & 255);

function encodeTrack(events, runningStatus) {
  // Stable sort by tick; at equal ticks note-offs (order 1) go after note-ons of the same
  // tick only when the caller asks (order), otherwise file order is kept.
  const sorted = events.map((e, i) => ({ e, i })).sort((a, b) => a.e.tick - b.e.tick || (a.e.order || 0) - (b.e.order || 0) || a.i - b.i).map(x => x.e);
  const out = [];
  let last = 0, status = -1;
  for (const e of sorted) {
    out.push(...vlq(e.tick - last)); last = e.tick;
    let bytes;
    switch (e.type) {
      case 'noteOn': bytes = [0x90 | e.channel, e.pitch, e.velocity]; break;
      case 'noteOff': bytes = e.asNoteOnZero ? [0x90 | e.channel, e.pitch, 0] : [0x80 | e.channel, e.pitch, e.velocity || 0]; break;
      case 'controlChange': bytes = [0xb0 | e.channel, e.controller, e.value]; break;
      case 'programChange': bytes = [0xc0 | e.channel, e.program]; break;
      case 'channelPressure': bytes = [0xd0 | e.channel, e.value]; break;
      case 'pitchBend': { const v = e.value + 8192; bytes = [0xe0 | e.channel, v & 127, v >> 7]; break; }
      case 'tempo': { const mpq = e.microsecondsPerQuarter ?? Math.round(60000000 / e.bpm); out.push(0xff, 0x51, 3, mpq >> 16 & 255, mpq >> 8 & 255, mpq & 255); status = -1; continue; }
      case 'timeSignature': out.push(0xff, 0x58, 4, e.numerator, Math.log2(e.denominator), 24, 8); status = -1; continue;
      case 'trackName': out.push(0xff, 0x03, ...vlq(e.text.length), ...text(e.text)); status = -1; continue;
      case 'marker': out.push(0xff, 0x06, ...vlq(e.text.length), ...text(e.text)); status = -1; continue;
      case 'sysex': out.push(0xf0, ...vlq(e.data.length + 1), ...e.data, 0xf7); status = -1; continue;
      default: throw new Error('smf-write: unknown event ' + e.type);
    }
    if (runningStatus && bytes[0] === status) out.push(...bytes.slice(1)); else { out.push(...bytes); status = bytes[0]; }
  }
  out.push(0, 0xff, 0x2f, 0);
  return out;
}

export function write({ format = 1, division = 480, tracks, runningStatus = false }) {
  const be32 = n => [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255];
  const out = [...text('MThd'), ...be32(6), format >> 8, format & 255, tracks.length >> 8, tracks.length & 255, division >> 8, division & 255];
  for (const events of tracks) { const body = encodeTrack(events, runningStatus); out.push(...text('MTrk'), ...be32(body.length), ...body); }
  return Uint8Array.from(out);
}
