// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tools/linux/hw/clips-song.mjs — the MIDI file of the clip page's device test (Task 17 Goal 4)
//
// Purpose
//   run-launch.py needs a song whose clips can be told apart on the MIDI out. This writes it as a MIDI
//   file (the importer then makes the song, as for any other): 4 bars, 120 BPM, two tracks.
//     channel 1: bars 1 and 3: pitch 60 on every beat; bars 2 and 4: pitch 72 on beats 1 and 3
//     channel 2: every bar: pitch 36 on beat 1, 38 on beat 3
//   Imported with {"record":"scenes","loop":true,"rowSteps":16}: track 1 gets two clips (places 1 and 2),
//   track 2 one, and two scenes that alternate.
//
//   Usage: node tools/linux/hw/clips-song.mjs OUT.mid
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-14  First version.
import { writeFileSync } from 'node:fs';
import { write, note } from '../../../tests/midi-import/smf-write.mjs';

const ppq = 480, bar = 4 * ppq;
const a = [{ tick: 0, type: 'trackName', text: 'Lead' }, { tick: 0, type: 'tempo', bpm: 120 }, { tick: 0, type: 'timeSignature', numerator: 4, denominator: 4 }];
const b = [{ tick: 0, type: 'trackName', text: 'Bass' }];
for (let i = 0; i < 4; i++) {
  if (i % 2 === 0) for (let q = 0; q < 4; q++) note(a, i * bar + q * ppq, ppq / 2, 60, 100, 0);
  else for (const q of [0, 2]) note(a, i * bar + q * ppq, ppq / 2, 72, 100, 0);
  note(b, i * bar, ppq / 2, 36, 100, 1); note(b, i * bar + 2 * ppq, ppq / 2, 38, 100, 1);
}
writeFileSync(process.argv[2], write({ format: 1, division: ppq, tracks: [a, b] }));
