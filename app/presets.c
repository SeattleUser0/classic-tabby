/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/presets.c — the 808 default kit (what is left of the factory scenes)
 *
 * Purpose
 *   Task 03 checkpoint (f) removed the sixteen factory scenes ("NEON KEYS" .. "AFTERGLOW")
 *   and everything that only served them: the scene recipes, the pattern generator, the
 *   sixteen demo DX7 voices, groove_factory_name / groove_factory_build / groove_factory_load
 *   and the FACTORY bank of the HOME preset browser (HOME lists USER projects only). The
 *   scenes live on as project files in web/scenes/ (exported from the checkpoint (e) build),
 *   importable through the workbench like any backup.
 *
 *   What stays is groove_preset_drum_default(): the 808 kit a sampler track becomes when a
 *   V01 project (or an old backup) is loaded on Classic Tabby (app/project.c, checkpoint a).
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-02  Checkpoint (f): factory scenes removed; only the 808 default kit.
 *   v0.1  2026-11-02  Checkpoint (a): sampler parts of the scenes play on the 808.
 */
#include "instrument.h"
#include "drum808.h"
#include <string.h>

/* Fill an 808 preset: the public D8_PRESET_BYTES format (selectors, then two parameter
 * sets) with the balanced default kit levels, pans and sends. Volume and the track's
 * reverb/delay sends byte (data[209]) are kept from the preset being converted. */
void groove_preset_drum_default(struct groove_preset *p)
{
    uint8_t volume = p->volume, sends = p->data[209];
    p->type = GROOVE_808; p->volume = volume; p->modified = 1; p->program = 0;
    p->sampler_pads = 0;   /* (f) fix: a converted sampler preset kept its 8 pads and failed validation */
    p->controls.envelope[2] = 100;
    {
        /* Public D8_PRESET_BYTES format: selectors, then two parameter sets.
         * Sound selectors must match each set for a lossless store/load. */
        unsigned at = D8_NUM;
        for (unsigned variant = 0; variant < 2; ++variant)
            for (unsigned part = 0; part <= D8_NUM; ++part)
                for (int i = 0; i < drum808_nparams((int)part); ++i) {
                    const fm1_param_t *d = drum808_param((int)part, i);
                    static const uint8_t levels[D8_NUM] = {70,52,46,42,38,36,46,28,25,30,29};
                    static const uint8_t pans[D8_NUM] = {64,64,49,64,79,54,72,80,47,77,72};
                    unsigned value = d->def;
                    if (!strcmp(d->name, "Sound")) value = variant;
                    if (part < D8_NUM) {
                        if (!strcmp(d->name, "Level")) value = levels[part];
                        else if (!strcmp(d->name, "Pan")) value = pans[part];
                        else if (!strcmp(d->name, "Rev")) value = part == D8_SD || part == D8_CP ? 24 : 9;
                        else if (!strcmp(d->name, "Dly")) value = part == D8_RS ? 12 : 0;
                        else if (!strcmp(d->name, "Decay") && part == D8_SD) value = 84;
                    }
                    p->data[at++] = (uint8_t)value;
                }
    }
    p->data[209] = sends;
}
