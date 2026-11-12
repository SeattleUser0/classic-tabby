/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * sdk/I18n.js: the workbench's text helpers (Classic Tabby; no translation any more)
 *
 * Purpose
 *   Classic Tabby is English only (SPEC 17.7, Task 14, 2026-11-10). This file used to hold the
 *   Chinese-to-English translation table (about 760 entries), its pattern list, the language
 *   selector and the stored language preference. All of that is gone: the page's own text is
 *   English. What stays is the three-function surface the page code already calls, so that the
 *   build (tools/linux/build-web.py inlines this module first) and the call sites do not change:
 *     FM1I18n.t(value)             the value as a string
 *     FM1I18n.text(node, value)    node.textContent = value
 *     FM1I18n.attr(node, name, v)  node.setAttribute(name, value)
 *   A later cleanup can replace the calls by plain DOM code and delete this file.
 *   Upstream merges: new workbench text must be written in English at the source, never added
 *   through a table (BUILD.md 30.5).
 *
 * Version: 1.0
 *
 * Revision log
 *   v1.0  2026-11-10  Task 14: English only; the translation table, patterns, language selector and
 *                     the fm1-language preference removed (the table had 763 entries; the page
 *                     now carries the English text itself).
 *   v0.x             Classic Tabby / upstream: the Chinese-to-English table (history in git).
 */
(() => {
  'use strict';
  const t = value => String(value ?? '');
  globalThis.FM1I18n = {
    t,
    text(node, value) { node.textContent = t(value); },
    attr(node, name, value) { node.setAttribute(name, t(value)); }
  };
})();
