/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/* Classic Tabby, Task 03 checkpoint (a): the DX7 user library (four flash banks) is
 * removed. Programs 0..127 come from the factory bank only; voices saved inside
 * projects and DX7 SysEx import into a project track are unchanged. */
#ifndef FM1_FM_PATCH_H
#define FM1_FM_PATCH_H
#include "engine.h"
enum { FM1_FM_PROGRAMS = 128, FM1_FM_FACTORY_PROGRAMS = 16 };
/* Expanded DX7 voices; MIDI programs 0..127, panel positions 1..128. */
FM1_DSP_CODE void groove_fm_program(uint8_t patch[156], unsigned program);
/* Built-in DX7 bank. Demo projects keep their separate recipe patches. */
FM1_DSP_CODE void groove_fm_factory(uint8_t patch[156], unsigned program);
FM1_DSP_CODE void groove_fm_unpack(uint8_t patch[156], const uint8_t vmem[128]);
/* SDK entry point (imported by libfm1_engine.a); nothing to initialize any more. */
void groove_fm_library_init(void);
#endif
