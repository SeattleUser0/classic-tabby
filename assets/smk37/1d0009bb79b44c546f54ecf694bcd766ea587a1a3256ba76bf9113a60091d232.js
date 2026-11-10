/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/* Classic Tabby, Task 03 checkpoint (a): the 8-slot sample bank is removed. The device
 * reports a sample limit of 0 (command 22) and has no sample commands; the workbench
 * keeps these two globals so the shared update code still loads. */
(() => {
  'use strict';
  globalThis.FM1Samples={read(){throw Error('This firmware has no sample bank');},status(){},capacity:0,slots:0};
  globalThis.FM1EnsureSamples=async()=>{};
})();

