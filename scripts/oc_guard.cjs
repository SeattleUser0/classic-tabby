// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// scripts/oc_guard.cjs — the Orange Cat soak guard (node; scripts/oc_guard.mjs is its ES-module door)
//
// Purpose
//   THE RULE (the user, 2026-11-24): while /tmp/oc-soak-running exists, nothing of Classic Tabby starts: no build, no
//   test, no browser, no publish or promote, no install, no read or write to the SMK-37 or the H4MIDI. The file is
//   what counts, not the clock; no override. Loading this module IS the check: it ends the process with exit code 75
//   and "Orange Cat soak running (/tmp/oc-soak-running). Refusing to start NAME." (NAME: the script node was started
//   with). blocked() gives the blocking file or null, recheck(what) throws: for the moment right before a browser is
//   launched and between the steps of a long run.
//   For make test-oc-guard only: OC_GUARD_TEST_FLAG=path (a SECOND file that blocks), OC_GUARD_TEST_STOP=1 (when
//   nothing blocks, say "oc-guard: passed NAME" and exit 0 there).
//
// Version: 0.1
//
// Revision log
//   v0.1  2026-11-24  First version (docs/BUILD.md 69).
'use strict';
const fs = require('fs');
const path = require('path');
const FLAG = '/tmp/oc-soak-running';
function blocked() {
  if (fs.existsSync(FLAG)) return FLAG;
  const extra = process.env.OC_GUARD_TEST_FLAG;
  if (extra && fs.existsSync(extra)) return extra;
  return null;
}
const message = (name, p) => `Orange Cat soak running (${p}). Refusing to start ${name}.`;
function check() {
  const name = path.basename(process.argv[1] || 'node');
  const p = blocked();
  if (p) { fs.writeSync(2, message(name, p) + '\n'); process.exit(75); }
  if (process.env.OC_GUARD_TEST_STOP === '1') { fs.writeSync(2, `oc-guard: passed ${name}\n`); process.exit(0); }
}
function recheck(what) {
  const p = blocked();
  if (p) { const e = new Error(message(what, p)); e.ocInterrupted = true; throw e; }
}
check();
module.exports = { blocked, recheck, message, FLAG };
