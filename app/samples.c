/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/samples.c — sampler removed (Classic Tabby, Task 03 checkpoint (a))
 *
 * Purpose
 *   SMK37 Open V01 kept an 8-slot sample bank in user flash and bound it to the
 *   sampler engine from this file. Classic Tabby does not play samples (the M8 does),
 *   so the bank validation, flash mapping, transfer and binding code is gone and the
 *   region is song storage (app/song_storage.c).
 *
 *   The binary SDK (sdk/lib/libfm1_engine.a) still imports groove_samples_init and
 *   groove_samples_poll from the app and calls them from the control task, so both stay
 *   as entry points: init starts the song-region scan, poll drives it. The sampler engine
 *   code inside the SDK cannot be removed (single object, linked whole; its SRAM
 *   routines are in sdk/synth.json); it is only never bound and never selected
 *   (app/project.c converts GROOVE_SAMPLE presets to the 808, app/screen.c hides it).
 *
 * Version: 0.4 (Classic Tabby; replaces the V01 file)
 *
 * Revision log
 *   v0.4  2026-11-10  Task 13 Step 1: song scheduling (song_poll) runs before the storage poll,
 *                     so the pass's song work comes right after the router flush (groove_midi_poll,
 *                     the first hook) and a storage sector step never delays it.
 *   v0.3  2026-11-08  Task 12 A4: the two polls are the STORAGE and SONG sections of the loop
 *                     profile (app/diag.h).
 *   v0.2  2026-11-02  Checkpoint (d): the song sequencer (app/song.c) is initialized and
 *                     polled from the same SDK entry points.
 *   v0.1  2026-11-02  Sampler removed; SDK entry points kept; song storage poll.
 */
#include "instrument.h"
#include "song_storage.h"
#include "song.h"
#include "diag.h"

void groove_samples_init(void) { song_storage_init(); song_init(); }
void groove_samples_poll(void)
{
    /* Task 13: song first, then storage (the SDK calls this hook second, after the router flush). */
    ct_prof_enter(CT_PROF_SONG); song_poll(); ct_prof_leave();
    ct_prof_enter(CT_PROF_STORAGE); song_storage_poll(); ct_prof_leave();
}
/* V01 status codes were 0 empty, 1 validating, 2 ready, 3 receiving, 4 error.
 * The bank no longer exists: always "empty". Kept for the engine-stats reply. */
unsigned groove_samples_status(void) { return 0; }
