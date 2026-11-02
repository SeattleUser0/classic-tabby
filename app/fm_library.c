/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/fm_library.c — DX7 program source without the user library (Classic Tabby, Task 03)
 *
 * Purpose
 *   V01 stored four user banks of 32 packed DX7 voices in the last flash sectors before
 *   the tuning sector and served MIDI programs 0..127 from them, falling back to the
 *   factory bank. Classic Tabby removes the user library (checkpoint (a)): those sectors
 *   are song storage. What remains here is the VMEM unpacker used by the factory bank
 *   and by SysEx voice import, and groove_fm_program, which now always answers from the
 *   factory bank. groove_fm_library_init stays because the binary SDK imports it.
 *
 * Version: 0.1 (Classic Tabby; replaces the V01 file)
 *
 * Revision log
 *   v0.1  2026-11-02  Library banks, staging recovery, pack7 and the sample-bank
 *                     conflict check removed.
 */
#include "instrument.h"
#include "fm_patch.h"
#include <string.h>

FM1_DSP_CODE void groove_fm_unpack(uint8_t p[156], const uint8_t b[128])
{
    for (unsigned op=0;op<6;++op) {
        const uint8_t *v=b+op*17; uint8_t *q=p+op*21;
        memcpy(q,v,11); q[11]=v[11]&3U; q[12]=(v[11]>>2)&3U;
        q[13]=v[12]&7U; q[20]=(v[12]>>3)&15U;
        q[14]=v[13]&3U; q[15]=(v[13]>>2)&7U; q[16]=v[14];
        q[17]=v[15]&1U; q[18]=(v[15]>>1)&31U; q[19]=v[16];
    }
    memcpy(p+126,b+102,8); p[134]=b[110]&31U;
    p[135]=b[111]&7U; p[136]=(b[111]>>3)&1U;
    memcpy(p+137,b+112,4); p[141]=b[116]&1U;
    p[142]=(b[116]>>1)&7U; p[143]=(b[116]>>4)&7U;
    memcpy(p+144,b+117,11); p[155]=63;
}
void groove_fm_library_init(void) {}
FM1_DSP_CODE void groove_fm_program(uint8_t p[156], unsigned program)
{
    groove_fm_factory(p, program % FM1_FM_PROGRAMS);
}
