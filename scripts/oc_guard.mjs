// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// scripts/oc_guard.mjs — the Orange Cat soak guard for ES modules: `import '<path>/scripts/oc_guard.mjs';` as the
// FIRST import of a script is the check (imports run in order). The guard itself is scripts/oc_guard.cjs.
//
// Version: 0.1 (2026-11-24, docs/BUILD.md 69)
import { createRequire } from 'node:module';
const guard = createRequire(import.meta.url)('./oc_guard.cjs');
export const blocked = guard.blocked, recheck = guard.recheck;
