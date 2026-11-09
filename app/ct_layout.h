/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/ct_layout.h — Classic Tabby: the USER region size, the one layout setting
 *
 * Purpose
 *   Every USER-relative constant of the app (app/instrument.h: the old sample-bank span and the
 *   tuning sector; app/song_storage.h: the song region's sector count) is derived from
 *   CT_USER_BYTES, the size of the USER partition the packagers reserve at the top of flash
 *   (0xFF000 - CT_USER_BYTES .. 0xFF000) and that fm1_layout.user_bytes reports to the SDK.
 *
 *   The build sets it (tools/linux/build.py --user-bytes N, Makefile USER_BYTES=N): the same
 *   value goes into fm1_layout, into both packagers (sdk/Package.cs, tools/linux/package.py)
 *   and into the simulator (tools/linux/build-web.py), so the four can never disagree. The
 *   define reaches the compiler only when N is not the default (471040 since Task 12; it was the
 *   stock 536576 before), so the normal build needs no define.
 *
 *   What moves with it (docs/FLASH-BUDGET.md 3.5): the USER base, hence the absolute address
 *   of everything addressed from the start of USER (the 16 project sectors, the settings in
 *   slot 15, the project staging sector, the song region). What does not move: the tuning
 *   sector (the last USER sector, at 0xFE000 for every size) and key_mac at 0xFF000.
 *
 *   Known sizes: 471040 (the normal layout from tabby-v04.0, Task 12 A1; first tested as
 *   tabby-p0-probe64: USER 64 KiB smaller, base 0x8C000, song region 97 sectors = 80 block
 *   sectors) and 536576 (the stock layout of V01, V16 and every release up to tabby-v03.3;
 *   still built with USER_BYTES=536576 for tests and the way back).
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-08  Task 12 A1: the default is 471040 (the storage move becomes the normal
 *                     layout); 536576 stays buildable.
 *   v0.1  2026-11-07  Task 11 Step 4: the layout setting (was the constant 466944 in
 *                     instrument.h and 113 sectors in song_storage.h).
 */
#ifndef CT_LAYOUT_H
#define CT_LAYOUT_H
#ifndef CT_USER_BYTES
#define CT_USER_BYTES 471040          /* Task 12 A1: the normal layout (536576 = the old stock layout) */
#endif
/* Projects (16 sectors), project staging (1), at least 17 + 16 song-region sectors and the
 * tuning sector: 69632 + 33 * 4096 + 4096 = 208896 is the hard floor; the build accepts
 * 405504 (a 128 KiB move) and up. */
#if (CT_USER_BYTES % 4096) || CT_USER_BYTES < 208896 || CT_USER_BYTES > 536576
#error "CT_USER_BYTES must be a multiple of 4096 from 208896 to 536576"
#endif
#endif
