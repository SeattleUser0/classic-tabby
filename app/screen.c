/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/screen.c — the SMK-37's pages, panel controls and LCD painter
 *
 * Classic Tabby revision log (the upstream file had no header; earlier Classic Tabby changes are
 * marked "Task NN" where they are)
 *   v0.11 2026-11-17  tabby-v04.18: every text on the LCD names a button by the word printed on it (SPEC 17.4: KNOB BANK,
 *                     <, >, OCTAVE-/+, NOTE REPEAT, SCALE, CHORD, GLOBE, PATCH, PARA, SEQ PLAY, SEQ REC). The code keeps
 *                     the firmware's names (SHIFT, HOME, SAVE, SCL, ENV, GLO, EDIT, PLAY, REC).
 *   v0.10 2026-11-12  Task 16 Goal 3: the SONG page shows the follow state (ARMED: START?, WAIT PULSE, FOLLOWING, HOLD: NO
 *                     CLOCK, LOST - CONTINUE, STOP BY MASTER) when CLOCK = MIDI; PLAY arms instead of refusing.
 *   v0.9  2026-11-11  Task 16 Goal 4: stale screen texts: "K2 CLK IN AUTO USB BLE" (DIN receives nothing), "ERASE OLD DATA"
 *                     (was ERASE OLD SAMPLE DATA), "SEQ+PARA: ACTIONS" (was HOLD SEQ: ACTIONS), the SHIFT
 *                     list's "PAD/STEP KEY-PAD", the unused STEP knob label. No behaviour changes.
 *   v0.8  2026-11-11  Task 16 Goal 1: ct_screen_page / ct_screen_action / ct_screen_song_select (the remote
 *                     status and the remote song select); the A2 switch is ON at boot, so the ACTIONS
 *                     entry reads "A2 FAST MIDI: ON" and the switch turns it off.
 *   v0.7  2026-11-10  Task 15 Step 4: CT_A2 diag builds only: the ACTIONS entry "A2 FAST MIDI",
 *                     the run-time switch of option A2 (off at boot). The normal build has no such entry.
 *   v0.6  2026-11-10  Task 13 Step 4: the panel wording: knobs by their printed numbers (the
 *                     firmware's SELECT = K5, PAGE = K6, PRESETS = K7, MASTER = K8; K1-K4 were right),
 *                     the firmware's SAVE button by position ("4TH LEFT BTN" on the LCD: the 4th
 *                     button of the left group, after SHIFT, FADER BANK, HOME; the full phrase does
 *                     not fit a line), the SONG page's song knob (K5/K7, it said K1), SHIFT+HOME/SRC
 *                     for sources, ARP's OUT PORT hint (SHIFT+SEQ; SEQ 6/7 is gone). SPEC 17.4.
 *   v0.5  2026-11-10  Task 13 Step 1 (option B): the LCD work keeps to the pass budget
 *                     (app/diag.h ct_pass_*): the page compose (draw) is deferred to a later pass
 *                     once the pass is over budget (at most CT_PASS_STARVE_MS * 2 late); each band
 *                     paint starts only if its estimated time still fits (one band per
 *                     CT_PASS_STARVE_MS always goes); the router is flushed after every band, so
 *                     notes the audio thread queued meanwhile leave at once; the end of the screen
 *                     hook marks the pass's busy time (profile page 6).
 *   v0.4  2026-11-08  Task 12 A4: the ACTIONS storage lines (USER size, song storage state, free
 *                     and reclaimable) and the screen and paint timing are in every build; the
 *                     screen control call is the SCREEN section of the loop profile.
 *   v0.3  2026-11-08  Task 12 A3: SAVE while the transport runs shows STOP TO SAVE (project.c
 *                     refuses); ERASE OLD DATA and COMPACT say STOP TO ERASE / COMPACT.
 *   v0.2  2026-11-08  Task 12 A2: the stock step editor is gone: STEPS 1/7 BASIC, 2/7 STEP DETAILS,
 *                     4/7 LOCKS, STEP_EDIT, RHYTHM, REC (step and live recording, count-in, CLICK),
 *                     pad-step mode (SHIFT+PAD), HOME K3 STEP, the step-editing ACTIONS (step
 *                     details, copy / paste / clear / repeat, undo). The stock pattern still loads,
 *                     saves and plays with the project. Page STEPS (number 1, frozen) is now SYNC /
 *                     MIDI: K1 CLOCK, K2 CLK IN, K3 SWING, K4 SEQ OUT, PRESETS KEY OUT; SEQ opens it
 *                     from any page. SHIFT+SEQ opens MIDI TRACK (IN CH, OUT CH, SEQ, OUT PORT) as
 *                     before; HOME K4 stays the one BPM control. SEQ alone no longer taps tempo on
 *                     EFFECTS 3/3 (HOME+SEQ taps everywhere).
 *   v0.1  2026-11-08  Task 12 A1: ERASE OLD DATA (was ERASE OLD SAMPLE/DX7) asks for confirmation
 *                     (before, it ran on the first SAVE and the prompt showed on COMPACT); the
 *                     OLD DATA texts on boot, SONG and ACTIONS say what to do.
 */
#include "instrument.h"
#include "song_storage.h"
#include "song.h"
#include "fm_patch.h"
#include "version.h"
#include "fm1_engine_control.h"
#include "smk37_controls.h"
#include "diag.h"   /* Classic Tabby Task 11: the ACTIONS storage lines, diagnostic build only */
#include "clip_v3.h"   /* Goal 6: the STEP page reads the clip being edited */
#include <stdlib.h>
#include <string.h>
enum {
    BACK = 0x0000,
    PANEL = 0x18e3,
    TEXT = 0xef5d,
    ACCENT = 0x07ff,
    DIM = 0x738e,
    GREEN = 0x07e0,
    AMBER = 0xfd20,
    RED = 0xf9a6,   /* tabby-v1.1: REC in the top line */
    BLUE = 0x3c9f   /* Task 17: a track whose internal sound alone is muted (docs/CONTROL-MAP.md 7) */
};
/* Five columns per glyph, bit 0 at the top. Digits followed by uppercase. */
static const uint8_t font[36][5] = {
    {0x3e, 0x51, 0x49, 0x45, 0x3e}, {0, 0x42, 0x7f, 0x40, 0},       {0x42, 0x61, 0x51, 0x49, 0x46},
    {0x21, 0x41, 0x45, 0x4b, 0x31}, {0x18, 0x14, 0x12, 0x7f, 0x10}, {0x27, 0x45, 0x45, 0x45, 0x39},
    {0x3c, 0x4a, 0x49, 0x49, 0x30}, {0x01, 0x71, 0x09, 0x05, 0x03}, {0x36, 0x49, 0x49, 0x49, 0x36},
    {0x06, 0x49, 0x49, 0x29, 0x1e}, {0x7e, 0x11, 0x11, 0x11, 0x7e}, {0x7f, 0x49, 0x49, 0x49, 0x36},
    {0x3e, 0x41, 0x41, 0x41, 0x22}, {0x7f, 0x41, 0x41, 0x22, 0x1c}, {0x7f, 0x49, 0x49, 0x49, 0x41},
    {0x7f, 0x09, 0x09, 0x09, 0x01}, {0x3e, 0x41, 0x49, 0x49, 0x7a}, {0x7f, 0x08, 0x08, 0x08, 0x7f},
    {0, 0x41, 0x7f, 0x41, 0},       {0x20, 0x40, 0x41, 0x3f, 0x01}, {0x7f, 0x08, 0x14, 0x22, 0x41},
    {0x7f, 0x40, 0x40, 0x40, 0x40}, {0x7f, 0x02, 0x0c, 0x02, 0x7f}, {0x7f, 0x04, 0x08, 0x10, 0x7f},
    {0x3e, 0x41, 0x41, 0x41, 0x3e}, {0x7f, 0x09, 0x09, 0x09, 0x06}, {0x3e, 0x41, 0x51, 0x21, 0x5e},
    {0x7f, 0x09, 0x19, 0x29, 0x46}, {0x46, 0x49, 0x49, 0x49, 0x31}, {0x01, 0x01, 0x7f, 0x01, 0x01},
    {0x3f, 0x40, 0x40, 0x40, 0x3f}, {0x1f, 0x20, 0x40, 0x20, 0x1f}, {0x3f, 0x40, 0x38, 0x40, 0x3f},
    {0x63, 0x14, 0x08, 0x14, 0x63}, {0x07, 0x08, 0x70, 0x08, 0x07}, {0x61, 0x51, 0x49, 0x45, 0x43}};
/* Compose the final pixels before touching the LCD. Sixteen rows cost 7,680
 * bytes; unchanged bands and unchanged horizontal margins are not transferred.
 * A page change never exposes the temporary background clear on the panel. */
enum { PAINT_ROWS = 16, PAINT_BANDS = FM1_SCREEN_HEIGHT / PAINT_ROWS };
_Static_assert(FM1_SCREEN_WIDTH * PAINT_ROWS <= FM1_SCREEN_DMA_PIXELS, "LCD band capacity");
static uint16_t paint_pixels[FM1_SCREEN_WIDTH * PAINT_ROWS];
static uint8_t paint_left[PAINT_BANDS], paint_right[PAINT_BANDS];
static unsigned paint_rendering, paint_top, paint_next, paint_x, paint_end;
static uint32_t paint_priority;
static struct fm1_ble_status frame_ble; /* Task 06 (a): stays zero; no page reads it since the BLE page went */
/* tabby-v1.2.1: since when each band has waited to be painted (set when a clean band is marked). A band that has
 * waited four starvation periods goes even when a MIDI event is due: see paint_flush. */
static uint32_t paint_since[PAINT_BANDS];
static void paint_mark(unsigned x, unsigned y, unsigned w, unsigned h)
{
    for (unsigned b = y / PAINT_ROWS; b <= (y + h - 1) / PAINT_ROWS; ++b) {
        if (paint_left[b] >= paint_right[b]) paint_since[b] = fm1_millis();
        paint_priority |= 1U << b;
        if (x < paint_left[b]) paint_left[b] = (uint8_t)x;
        if (x + w > paint_right[b]) paint_right[b] = (uint8_t)(x + w);
    }
}
/* Many LCD pages share this bounded fill; keep a single native copy. */
static __attribute__((noinline)) void paint_fill(unsigned x, unsigned y, unsigned w, unsigned h, uint16_t color)
{
    if (!w || !h || x >= FM1_SCREEN_WIDTH || y >= FM1_SCREEN_HEIGHT) return;
    if (w > FM1_SCREEN_WIDTH - x) w = FM1_SCREEN_WIDTH - x;
    if (h > FM1_SCREEN_HEIGHT - y) h = FM1_SCREEN_HEIGHT - y;
    if (!paint_rendering) { paint_mark(x, y, w, h); return; }
    if (x >= paint_end || x + w <= paint_x) return;
    unsigned right = x + w < paint_end ? x + w : paint_end;
    if (x < paint_x) x = paint_x;
    unsigned first = y < paint_top ? paint_top : y;
    unsigned end = y + h < paint_top + PAINT_ROWS ? y + h : paint_top + PAINT_ROWS;
    for (unsigned row = first; row < end; ++row)
        for (unsigned col = x; col < right; ++col)
            paint_pixels[(row - paint_top) * (paint_end - paint_x) + col - paint_x] = color;
}
/* ASCII punctuation in its four contiguous ranges. Direct indexing avoids
 * searching up to 32 glyphs and stores no redundant character-code column. */
static const uint8_t punctuation[32][5] = {
    {0,0,0x5f,0,0}, {0,7,0,7,0}, {0x14,0x7f,0x14,0x7f,0x14},
    {0x24,0x2a,0x7f,0x2a,0x12}, {0x63,0x13,8,0x64,0x63},
    {0x36,0x49,0x55,0x22,0x50}, {0,5,3,0,0}, {0,0x1c,0x22,0x41,0},
    {0,0x41,0x22,0x1c,0}, {0x14,8,0x3e,8,0x14}, {8,8,0x3e,8,8},
    {0,0x50,0x30,0,0}, {8,8,8,8,8}, {0,0x60,0x60,0,0}, {0x60,0x18,6,1,0},
    {0,0x36,0x36,0,0}, {0,0x56,0x36,0,0}, {8,0x14,0x22,0x41,0},
    {0x14,0x14,0x14,0x14,0x14}, {0x41,0x22,0x14,8,0}, {2,1,0x51,9,6},
    {0x32,0x49,0x79,0x41,0x3e}, {0,0x7f,0x41,0x41,0},
    {1,6,0x18,0x60,0}, {0,0x41,0x41,0x7f,0}, {4,2,1,2,4},
    {0x40,0x40,0x40,0x40,0x40}, {0,1,2,4,0}, {0,8,0x36,0x41,0},
    {0,0,0x7f,0,0}, {0,0x41,0x36,8,0}, {8,4,8,0x10,8}
};
static void text(unsigned x, unsigned y, const char *s, unsigned scale, uint16_t color,
                 uint16_t background)
{
#ifdef FM1_HOST_TEST
    if (scale < 2) __builtin_trap();   /* tabby-v1.1: nothing is drawn below scale 2; the simulator's page tour (tools/linux/screens.mjs --check) and the host tests stop here */
#endif
    if (!s || scale < 2 || scale > 4 ||   /* tabby-v1.1: no scale 1 */ x >= FM1_SCREEN_WIDTH ||
        y >= FM1_SCREEN_HEIGHT || 7U * scale > FM1_SCREEN_HEIGHT - y) return;
    unsigned w = 6U * scale, h = 7U * scale;
    if (paint_rendering && (y >= paint_top + PAINT_ROWS || y + h <= paint_top)) return;
    if (!paint_rendering) {
        unsigned n = (unsigned)strlen(s), available = (FM1_SCREEN_WIDTH - x) / w;
        if (n > available) n = available;
        if (n) paint_mark(x, y, n * w, h);
        return;
    }
    for (; *s && x + w <= FM1_SCREEN_WIDTH; ++s, x += w) {
        if (x >= paint_end) break;
        if (x + w <= paint_x) continue;
        char letter = *s >= 'a' && *s <= 'z' ? (char)(*s - 'a' + 'A') : *s;
        static const uint8_t blank[5] = {0};
        const uint8_t *shape = blank;
        if (*s >= '0' && *s <= '9')
            shape = font[*s - '0'];
        else if (letter >= 'A' && letter <= 'Z')
            shape = font[10 + letter - 'A'];
        else if ((unsigned char)*s >= '!' && (unsigned char)*s <= '~') {
            unsigned c = (unsigned char)*s;
            shape = punctuation[c - (c < ':' ? 33U : c < '[' ? 43U : c < '{' ? 69U : 95U)];
        }
        unsigned first_row = y < paint_top ? paint_top : y;
        unsigned end_row = y + h < paint_top + PAINT_ROWS ? y + h : paint_top + PAINT_ROWS;
        unsigned first_col = x < paint_x ? paint_x : x;
        unsigned end_col = x + w < paint_end ? x + w : paint_end;
        unsigned stride = paint_end - paint_x;
        for (unsigned row = first_row; row < end_row; ++row) {
            unsigned mask = 1U << ((row - y) / scale);
            uint16_t *pixel = paint_pixels + (row - paint_top) * stride + first_col - paint_x;
            for (unsigned col = first_col; col < end_col; ++col) {
                unsigned column = (col - x) / scale;
                *pixel++ = column < 5U && (shape[column] & mask) ? color : background;
            }
        }
    }
}
/* Eight tracks stay visible on HOME. SEQ maps the sixteen white keys to one
 * quarter of the 64-step pattern. All drawing and edits run on app_control. */
/* Classic Tabby (Task 03 b): FM_EDIT, FM_ENV, FM_LFO and TONE_EDIT (the DX7 operator
 * editor and the per-engine tone editor) are no longer reachable; voice editing lives
 * in the web workbench. Their numbers stay so the workbench simulator's page ids
 * (sdk/Simulator.js state[1], data-sim-page) do not shift. groove_screen_open rejects
 * them. FM_QUICK (DX7 preset select + ALG/FEEDBACK/TRANSPOSE/LEVEL macros) stays. */
/* Task 06 (a): BLE (7) and NAME (9) are gone too; their numbers stay for the same reason. */
enum { OVERVIEW, STEPS, FM_EDIT, FM_ENV, FM_LFO, TONE_EDIT, MIX, BLE, PROJECT, NAME, EFFECTS, SOURCE, ACTIONS, STEP_EDIT, RHYTHM, FM_QUICK, PRESET_BROWSER, ARP_EDIT, STARTUP,
       SONG, /* Task 03 d: song mode, page 19 (ACTIONS "SONG MODE", web shortcut 19) */
       TRACK_LAUNCH /* Task 06 c: per-track launching, page 20 (SCL from the SONG page, web shortcut 20) */,
       CLIP_STEPS /* Goal 6: the STEP page, page 21: the steps of the clip being edited (EDIT from the CLIPS page) */,
       CLIP_SETUP /* tabby-v04.10: the CLIP SETTING page, page 22 (FX from the CLIPS page): the selected clip's and the song's settings */ };
enum { OCT_DOWN, OCT_UP, FX, SCL, ENV, LFO, EDIT, GLO, HOME, SAVE, ARP, SEQ, PLAY, REC };
#define BUTTON(b) (1U << (b))
static const uint16_t colors[8] = {0x3c9f, 0x07bf, 0x4eae, 0x06d4, 0xac9f, 0xed18, 0xff06, 0xfba5};
static const uint8_t white_keys[16] = {0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19, 21, 23, 24, 26};
/* Classic Tabby (Task 03 a): the sampler is not selectable; SOURCE_CHOICES excludes it.
 * The sixth name stays so a GROOVE_SAMPLE view (never produced by the app) still prints. */
static const char *const source_names[] = {"DX7 FM", "BASS 303", "DRUM 808", "PSG", "PLUCK", "SAMPLER"};
enum { SOURCE_CHOICES = GROOVE_SAMPLE };
/* Task 12 A2: the step-editing entries (STEP DETAILS, RHYTHM / RECORD, COPY / PASTE / CLEAR
 * STEP / PAGE / TRACK, REPEAT TO 32 / 48 / 64, UNDO / REDO) left with the step editor. The
 * entries keep their order; ACT_* names them. (Task 06 (a): "DX7 PATCH NAME" and "BLUETOOTH /
 * CLOCK" left with their pages; the clock source is on SYNC / MIDI, Bluetooth in the workbench.) */
static const char *const actions[] = {"COPY TIMBRE", "PASTE TIMBRE", "STOP ALL / REWIND",
    "ERASE OLD DATA", /* Task 12 A1: was ERASE OLD SAMPLE/DX7 */
    "SONG MODE", "COMPACT SONG STORAGE", "SEND SETUP", "NEW SONG" /* tabby-v04.21 */
#ifdef CT_A2
    /* Task 15 Step 4 (CT_A2 diag builds only): the run-time switch of option A2, the control
     * pass on demand (app/midi_router.c). Off at boot; the entry's text shows the state. */
    , "A2 FAST MIDI: ON"
#endif
    };
enum { ACT_COPY_TIMBRE, ACT_PASTE_TIMBRE, ACT_STOP_ALL, ACT_ERASE_OLD, ACT_SONG_MODE, ACT_COMPACT, ACT_SEND_SETUP, ACT_NEW_SONG, ACT_A2 };
enum { ACTION_COUNT = sizeof actions / sizeof actions[0] };
static unsigned source_preview, action, action_confirm, tone_clip_ready;
/* Task 12 A1: the question the ACTIONS page asks before a destructive entry runs. */
static unsigned song_select;   /* defined with the SONG page's state below */
static const char *confirm_prompt(void)
{
    static char ask[] = "NEW SONG IN SLOT 00? - > CONFIRMS";
    ask[17] = (char)('0' + (song_select + 1U) / 10); ask[18] = (char)('0' + (song_select + 1U) % 10);
    return action == ACT_ERASE_OLD ? "ERASE OLD DATA? - > CONFIRMS" : action == ACT_COMPACT ? "COMPACT SONG STORAGE? - > CONFIRMS" : action == ACT_NEW_SONG ? ask : "REPLACE TIMBRE? - > CONFIRMS";
}
static struct groove_preset tone_clip;
static uint32_t midi_seen[8], midi_until[8];
static uint8_t midi_active[8];
static unsigned track, cursor, selected_note = 60, drum, page;
static unsigned music_page, subpage_return, project_return, effects_page;
static unsigned seq_page, arp_page;
static unsigned song_select, song_row_page; /* SONG page: selected song, pads = rows 1-16 + 16 * page */
/* Task 16 Goal 1 (remote control, transfer command 29, app/transfer.c): what the screen state is, and
 * the SONG page's selected song, so a remote select leaves the page and the song loaded together
 * (the page then shows what the song state says). The page numbers are this file's enum. */
/* Task 17 Goal 4 (docs/CONTROL-MAP.md): the CLIPS page (TRACK_LAUNCH): the pad bank of 16 clip places, the selected
 * clip per track (SONG_NONE: none), the pad being held (long press = select only) and the page BT returns to. */
static unsigned clip_bank, clips_return;
static uint8_t clip_select[8] = {SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE, SONG_NONE};
static uint8_t clip_hold_pad = 255, clip_hold_queued, clip_hold_track;
static uint8_t loop_pad = 255;   /* tabby-v04.23: the pad that holds the step loop (255: none) */
static uint32_t clip_hold_ms;
/* Goal 6 (docs/CONTROL-MAP.md 12): the STEP page: the bar of 16 steps on the pads, the selected step (255: none), the
 * note the knobs work on, the note the pads toggle (the last key played), what a pad press does (0 selects the step,
 * 1 toggles that note on it), the length a new note gets. */
static uint8_t step_bar, step_sel = 255, step_cursor, step_pitch = 60, step_velocity = 100, step_pads_toggle;
static uint16_t step_length = 480;
static uint8_t rec_lamp;   /* the recorder's state as the control pass last read it */
/* tabby-v04.10 (docs/CONTROL-MAP.md 14): the CLIP SETTING page: a list; K5 chooses the row, K1 changes its value (K2 in
 * steps of 16), the 4th left button does a row that is an action (COPY) and saves on the others. The scene pad that is
 * being held on the SCENES page (until tabby-v1.3 a long press on an empty pad stored a scene). */
enum { SET_LENGTH, SET_NEXT, SET_AFTER, SET_TIMES, SET_PROGRAM, SET_BANK_MSB, SET_BANK_LSB, SET_COPY, SET_TRANSPOSE, SET_SHUFFLE, SET_QUANTIZE, SET_SCALE /* tabby-v04.19 */, SET_DIRECTION /* tabby-v04.20 */ /* tabby-v04.17; the second page starts at SET_TRANSPOSE */, SET_DELETE /* tabby-v04.15 */, SET_COUNT_IN, SET_CLICK, SET_CLICK_OUT, SET_CLICK_CH, SET_CLICK_NOTE,
       SET_CLICK_LEVEL, SET_KNOB1, SET_KNOB2, SET_KNOB3, SET_KNOB4 /* tabby-v04.14: the song's page starts at SET_COUNT_IN */, SET_EVENT_LEAD /* tabby-v1.0.2 */, SETUP_ROWS };   /* tabby-v04.11: the chain's three lines */
static uint8_t setup_row, setup_to;
static uint8_t rec_full_seen;
static unsigned song_record_full_seen(void) { unsigned f = rec_full_seen; rec_full_seen = 0; return f; }
enum { REC_ARMED_NOW = 1, REC_ON_NOW = 2 };   /* song_record_start */
static uint32_t rec_full_until;   /* the clip's pad shows red until then: the event cap stopped a take (SPEC 14.2) */
/* Mute for the song (docs/CONTROL-MAP.md 7): SHIFT + pad 9-16 toggles the mixer's mute as before and sets the
 * track's bit here to match; the bit holds the track's song notes back. A mute made on the MIX page, or one a
 * project comes with (tracks 6 and 7 of a new project), silences the internal sound only, as it always did: a song
 * still plays those tracks on MIDI out. A track that is OFF has no mixer mute; its bit alone is toggled. */
static uint8_t song_mute_bits;
static struct groove_view frame_views[GROOVE_TRACKS];
static unsigned track_muted(unsigned t) { return (song_mute_bits >> t) & 1U; }
/* The two mutes (docs/CONTROL-MAP.md 7): 0 none, 1 internal sound only (the mixer's mute; the song still plays the
 * track on MIDI out), 2 all (SHIFT + pad: internal sound and song notes). */
static unsigned mute_kind(unsigned t)
{ return track_muted(t) ? 2U : groove_track_role(t) != GROOVE_TRACK_OFF && frame_views[t].muted ? 1U : 0U; }
unsigned ct_screen_mute_kind(unsigned t) { return t < 8 ? mute_kind(t) : 0; }
unsigned ct_screen_track_muted(unsigned t) { return t < 8 ? track_muted(t) : 0; }
unsigned ct_screen_page(void) { return page; }
unsigned ct_screen_action(void) { return action; }
void ct_screen_song_select(unsigned song) { if (song < SONG_SONGS && song != song_select) { song_select = song; memset(clip_select, SONG_NONE, sizeof clip_select); clip_bank = 0; } }
static unsigned shift_visible;
static unsigned panel_modes_seen;
static uint32_t fader_feedback_seen;
static unsigned boot_active, boot_phase;
static uint32_t boot_started;
/* Task 12 A2: page STEPS has two views: seq_page 0 = SYNC / MIDI (SEQ), 1 = MIDI TRACK (SHIFT+SEQ). */
enum { SEQ_SYNC = 0, SEQ_MIDI_TRACK = 1 };
static const char *const seq_pages[] = {"SYNC / MIDI", "MIDI TRACK"};
/* MIDI TRACK: K1 IN CH (10, the input-channel preference), K2 OUT CH (1), K3 SEQ (0), K4 OUT PORT (2).
 * SYNC / MIDI uses the global output switches 9 (SEQ OUT, 0..2) and 4 (KEY OUT, 0..1). */
static const uint8_t seq_midi_parameters[4] = {10,1,0,2};
static const uint8_t seq_midi_limits[4] = {15,15,2,7};
static const char *const track_modes[] = {"PROJECT", "LIVE", "OFF"};
static const char *const midi_modes[] = {"LOCAL", "BOTH", "MIDI"};
static const char *const seq_outputs[] = {"OFF", "ON", "CLOCK"};
static int octave;
/* Editing focus never redirects the other physical instrument. */
static uint8_t instrument_track[2];
static int8_t instrument_octave[2];
static unsigned pad_focus;
/* Task 12 A2: the overview's 16-step window follows the playhead (the step editor that could pin
 * it is gone); cursor is the window when stopped. */
static unsigned step_follow = 1, transport_seen;
static const char *notice;
static uint32_t notice_until;
static char master_notice[24];
static char control_notice[40];
static __attribute__((unused)) unsigned step_first(const struct groove_view *v)   /* tabby-v1.1: only the simulator still asks (no step cells on HOME) */
{
    return ((step_follow && v->playing ? v->play_step : cursor) % v->sequence_length) & ~15U;
}
/* Selected drum part per track, restored on track change. Task 03 b
 * removed the operator/tone editor state that used to sit next to it. */
static uint8_t drum_parts[GROOVE_TRACKS];
static uint8_t key_note[27], key_track[27], retry_reset;
static uint32_t previous_buttons, previous_keys, blocked_keys, frame_ms, glo_ms;
static uint32_t project_keys; /* Held Play pitches across a project remapping. */
static uint32_t encoder_time[7];
static int8_t encoder_direction[7];
static uint8_t encoder_speed[7];
/* Task 06 (a): the BLE page and the NAME page are gone (docs/tasks/TASK-06-step1-assessment.md
 * section 7; Bluetooth settings are set from the workbench through transfer command 24).
 * Only the link-loss watch (ble_was_linked) remains of the BLE page state. */
static unsigned glo_down, glo_used, ble_was_linked;
static int source_result;
static uint32_t health_output;
static uint32_t health_at, health_underruns, health_dropped, health_adapted, health_dma;
static int project_result;
static unsigned project_reload, project_operation;
static unsigned project_slot, name_cursor;
static unsigned preset_slot, preset_loaded;   /* Task 03 f: USER slots only, no factory bank */
static unsigned preset_current_slot;
static uint32_t preset_project_revision;
static unsigned seq_down;
static uint32_t seq_ms;
static unsigned arp_down, arp_long;
static uint32_t arp_ms;
static char project_stored[13];
static int project_stored_result;
static uint32_t project_drawn_revision;
static void project_refresh(void)
{
    project_stored_result = groove_project_info(project_slot, project_stored);
    project_drawn_revision = groove_project_revision();
}
static void preset_refresh(void)
{
    project_slot = preset_slot;
    project_refresh();
}
static char edit_character(char old, int delta)
{
    static const char alphabet[] = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
    unsigned at = 0;
    if (old >= 'a' && old <= 'z')
        old = (char)(old - 'a' + 'A');
    for (unsigned i = 0; i < sizeof alphabet - 1; ++i)
        if (alphabet[i] == old)
            at = i;
    int n = (int)sizeof alphabet - 1;
    return alphabet[((int)at + delta % n + n) % n];
}
struct draw_cache {
    unsigned shown_page;
    uint32_t header_cache, title_cache, middle_cache, hint_cache, hold_cache, shortcut_cache, banner_cache, hold_step;
    uint32_t foot_cache[4], row_cache[8], tile_cache[16];   /* tabby-v1.1: the step cells of HOME went (cell_cache: 512 bytes in each of the two caches) */
    unsigned meter_cache[8];
};
static struct draw_cache saved_cache, band_cache, *cache = &saved_cache;
static uint32_t led_cache;
static uint16_t button_led_cache;
static uint8_t frame_effects[4];
static uint8_t frame_patch[156];
static char frame_fm_names[GROOVE_TRACKS][8];
static struct groove_fm_controls frame_controls;
static uint32_t frame_time;

/* Share frequently used control helpers instead of repeating their bodies
 * in every editor. These run at panel rate, outside the audio/scan paths. */
static __attribute__((noinline)) int clamp(int value, int low, int high)
{
    return value < low ? low : value > high ? high : value;
}
static unsigned navigation_mode(void)
{
    return page == PROJECT || page == PRESET_BROWSER || page == MIX ||
        (page >= SOURCE && page <= RHYTHM) || page == SONG || page == TRACK_LAUNCH || page == CLIP_STEPS || page == STEPS || glo_down;
}
static unsigned encoder_active(const int16_t values[7])
{
    for (unsigned i = 0; i < 7; ++i)
        if (values[i])
            return 1;
    return 0;
}
static void read_encoders(const struct fm1_controls *controls, uint32_t now, unsigned boundary)
{
    /* Apply the first detent immediately. A continuing fast turn accelerates
     * only continuous parameters; page/option selectors retain raw detents.
     * Reversal, a pause or a new control context returns to fine adjustment. */
    if (boundary) memset(encoder_direction, 0, sizeof encoder_direction);
    for (unsigned i = 0; i < 7; ++i) {
        int direction = (controls->encoders[i] > 0) - (controls->encoders[i] < 0);
        if (!direction) continue;
        encoder_speed[i] = direction == encoder_direction[i] && now - encoder_time[i] <= 40U
            ? (uint8_t)clamp(encoder_speed[i] + 1, 1, 4) : 1;
        encoder_direction[i] = (int8_t)direction;
        encoder_time[i] = now;
    }
}
#ifdef FM1_HOST_TEST
static unsigned web_fine;
void groove_screen_web_fine(unsigned fine) { web_fine = fine; }
#endif
static int fm_encoder_delta(unsigned encoder, int16_t value)
{
#ifdef FM1_HOST_TEST
    if (web_fine) return value;
#endif
    int amount = value < 0 ? -(int)value : value;
    int gain = amount < 2 ? 1 : amount < 4 ? 2 : amount == 4 ? 3 : 4;
    if (gain < encoder_speed[encoder]) gain = encoder_speed[encoder];
    return value * gain;
}
static unsigned parameter_page(unsigned value)
{
    return value == EFFECTS;
}
static void open_subpage(unsigned target)
{
    if (page == target) page = subpage_return;
    else {
        if (!parameter_page(page)) subpage_return = page;
        page = target;
    }
}
static int post(uint8_t command, uint8_t a, uint8_t b, unsigned bytes)
{
    const uint8_t message[3] = {command, a, b};
    if (!groove_midi_local(message, bytes))
        return 1;
    retry_reset = 1;
    return 0;
}
/* Reuse the formatter across panel fields instead of duplicating it at every call. */
/* Common small labels share native call setup across LCD pages. */
static __attribute__((noinline)) void announce(const char *message, uint32_t until)
{ notice=message;notice_until=until; }
/* tabby-v1.1 (docs/CONTROL-MAP.md 20): nothing is drawn below scale 2 (10 x 14 pixels a character, 20 on a line);
 * stage information is scale 3 (13 on a line). These wrappers were the scale 1 styles. */
static __attribute__((noinline)) void dim_text(unsigned x, unsigned y, const char *s)
{
    text(x, y, s, 2, DIM, BACK);
}
static __attribute__((noinline)) void plain_text(unsigned x, unsigned y, const char *s)
{
    text(x, y, s, 2, TEXT, BACK);
}
static __attribute__((noinline)) void accent_text(unsigned x, unsigned y, const char *s)
{
    text(x, y, s, 2, ACCENT, BACK);
}
static __attribute__((noinline)) void big_text(unsigned x, unsigned y, const char *s, uint16_t color)
{
    text(x, y, s, 3, color, BACK);
}
static __attribute__((noinline)) void decimal(char out[12], int value, unsigned digits)
{
    unsigned n = value < 0 ? (unsigned)-value : (unsigned)value, length;
    /* All displayed values are within -24..300; minimum width is optional. */
    length = 1;
    for (unsigned v = n; v >= 10; v /= 10)
        ++length;
    if (length < digits)
        length = digits;
    unsigned start = value < 0;
    if (start)
        out[0] = '-';
    out[start + length] = 0;
    while (length) {
        out[start + --length] = (char)('0' + n % 10);
        n /= 10;
    }
}
/* Share numeric painting across pages instead of expanding it at every call. */
static __attribute__((noinline)) void number(unsigned x, unsigned y, int value, unsigned digits, unsigned scale,
                   uint16_t foreground, uint16_t background)
{
    char out[12];
    decimal(out, value, digits);
    text(x, y, out, scale, foreground, background);
}
/* Common LCD styles avoid repeating native call arguments at each field. */
static __attribute__((noinline)) void small_number(unsigned x,unsigned y,int value,unsigned digits,uint16_t color)
{ number(x,y,value,digits,2,color,BACK); }
static __attribute__((noinline)) void big_number(unsigned x,unsigned y,int value,unsigned digits,uint16_t color)
{ number(x,y,value,digits,3,color,BACK); }
static __attribute__((noinline)) void color_text(unsigned x,unsigned y,const char *s,uint16_t color)
{ text(x,y,s,2,color,BACK); }
static __attribute__((noinline)) void erase(unsigned x,unsigned y,unsigned w,unsigned h)
{ paint_fill(x,y,w,h,BACK); }
/* tabby-v04.10: the CLIP SETTING page's functions (docs/CONTROL-MAP.md 14) */
static void setup_open(unsigned place)
{
    const struct song_model *mdl = song_model_current();
    setup_row = 0; setup_to = 0;
    for (unsigned c = 0; mdl && c < SONG_CLIPS; ++c) if (!mdl->clip[track][c]) { setup_to = (uint8_t)c; break; }
    (void)place;
    page = CLIP_SETUP; cache->shown_page = ~0U;
}
/* The row's action (the 4th left button; remote op 16 sub 4): COPY copies the clip, any other row saves the song.
 * Returns the text for the notice line. */
/* tabby-v1.3: a clip could not be opened, made, copied or recorded into: eight unsaved clips are held (they are
 * written when the song stops), or a take is armed or runs on the open one. */
static const char *busy_text(void) { return song_unsaved_clips() >= 8U ? "8 UNSAVED - STOP TO SAVE" : "END THE TAKE FIRST"; }
static const char *setup_do(void)
{
    struct song_edit_info ei; song_edit_info(&ei);
    if (setup_row == SET_DELETE) {
        /* tabby-v04.15: DELETE CLIP asks once: the second press within two seconds deletes */
        static uint32_t asked_at; static uint8_t asked_track, asked_place, asked;
        uint32_t t_now = fm1_millis();
        if (!ei.active) return "SELECT A CLIP FIRST";
        if (!asked || asked_track != ei.track || asked_place != ei.place || t_now - asked_at > 2000U) {
            asked = 1; asked_track = ei.track; asked_place = ei.place; asked_at = t_now;
            return "> AGAIN - DELETES THE CLIP";
        }
        asked = 0;
        int r = song_clip_delete(ei.track, ei.place);
        if (r == SONG_EDIT_SHARED) {
            static char used[] = "USED BY SCENE 000 - NOT DELETED";
            unsigned sc = (unsigned)song_clip_scene(ei.track, ei.place) + 1U;
            used[14] = (char)('0' + sc / 100); used[15] = (char)('0' + sc / 10 % 10); used[16] = (char)('0' + sc % 10);
            return used;
        }
        return r == SONG_BUSY ? "STOP TO DELETE" : r ? "NOT DELETED" : "CLIP DELETED - SAVE THE SONG";
    }
    if (setup_row == SET_COPY) {
        if (!ei.active) return "SELECT A CLIP FIRST";
        int r = song_clip_copy(ei.track, ei.place, setup_to);
        if (!r) clip_select[ei.track] = setup_to;
        return r == SONG_BUSY ? busy_text() : r == SONG_INVALID ? "THAT PAD HOLDS A CLIP" : r == SONG_EDIT_SHARED ? "CLIP SHARED BY ANOTHER TRACK" : r ? "COPY FAILED" : "COPIED - THE COPY IS OPEN";
    }
    unsigned had = song_unsaved(); int r = song_edit_save();
    return r == SONG_BUSY ? "STOP TO SAVE" : r == SONG_FULL ? "SONG STORAGE FULL" : r ? "SAVE FAILED" : had ? "SAVED" : "NOTHING TO SAVE";
}
static const char *setup_edit(int d)
{
    struct song_edit_info ei; song_edit_info(&ei);
    if (setup_row == SET_LENGTH) {
        if (!ei.active) return "SELECT A CLIP FIRST";
        int r = song_edit_length(d);
        return r == SONG_BUSY ? "NOT DURING A TAKE" : r > 0 ? "NOTES PAST THE END REMOVED" : NULL;
    }
    if (setup_row >= SET_NEXT && setup_row <= SET_TIMES) {
        if (!ei.active) return "SELECT A CLIP FIRST";
        return song_edit_chain(setup_row - SET_NEXT, d) == SONG_BUSY ? "NOT DURING A TAKE" : NULL;
    }
    if (setup_row >= SET_PROGRAM && setup_row <= SET_BANK_LSB) {
        if (!ei.active) return "SELECT A CLIP FIRST";
        int r = song_edit_program(setup_row - SET_PROGRAM, d);
        return r == SONG_BUSY ? "NOT DURING A TAKE" : r == SONG_EMPTY ? "SET BANK MSB FIRST" : NULL;
    }
    if (setup_row == SET_COPY) { setup_to = (uint8_t)clamp((int)setup_to + d, 0, SONG_CLIPS - 1); return NULL; }
    if (setup_row == SET_TRANSPOSE) {
        if (!ei.active) return "SELECT A CLIP FIRST";
        return song_edit_transpose(d) == SONG_BUSY ? "NOT DURING A TAKE" : NULL;
    }
    if (setup_row == SET_SHUFFLE || setup_row == SET_QUANTIZE) {
        if (!ei.active) return "SELECT A CLIP FIRST";
        return song_edit_feel(setup_row - SET_SHUFFLE, d) == SONG_BUSY ? "NOT DURING A TAKE" : NULL;
    }
    if (setup_row == SET_SCALE) {
        if (!ei.active) return "SELECT A CLIP FIRST";
        return song_edit_scale(d) == SONG_BUSY ? "NOT DURING A TAKE" : NULL;
    }
    if (setup_row == SET_DIRECTION) {
        if (!ei.active) return "SELECT A CLIP FIRST";
        return song_edit_direction(d) == SONG_BUSY ? "NOT DURING A TAKE" : NULL;
    }
    if (setup_row == SET_DELETE) return NULL;
    (void)song_setting_edit(setup_row - SET_COUNT_IN, d);
    return NULL;
}
unsigned ct_screen_setup_read(uint8_t *out)
{
    struct song_edit_info ei; song_edit_info(&ei);
    const struct song_record *rec = song_current();
    const uint8_t *clip = song_edit_clip();
    out[0] = (uint8_t)page; out[1] = setup_row; out[2] = ei.active ? ei.track : 255; out[3] = ei.active ? ei.place : 255;
    out[4] = ei.active ? ei.steps : 0; out[5] = setup_to;
    for (unsigned i = 0; i < 5; ++i) out[6 + i] = (uint8_t)song_setting(i);
    for (unsigned i = 5; i <= SONG_SET_KNOB4; ++i) out[23 + i] = (uint8_t)song_setting(i);   /* tabby-v04.14: 28 the click level, 29..32 the controllers of K1 to K4 */
    out[11] = (uint8_t)song_unsaved(); out[12] = SETUP_ROWS;
    out[13] = clip ? (uint8_t)clip_v3_next(clip) : 0; out[14] = clip ? (uint8_t)clip_v3_after(clip) : 0; out[15] = clip ? (uint8_t)(clip_v3_after(clip) >> 8) : 0;
    out[16] = clip ? (uint8_t)clip_v3_times(clip) : 1;
    out[17] = clip && (clip[1] & CLIP_V3_FLAG_PROGRAM) ? clip[2] : 255; out[18] = clip && (clip[1] & CLIP_V3_FLAG_BANK) ? clip[3] : 255; out[19] = clip ? clip[4] : 0;
    out[20] = rec ? rec->rows : 0; out[21] = (uint8_t)song_scene_hold();
    { struct song_status st; song_status_read(&st); out[22] = st.count_in;
      /* tabby-v04.12: the scene the SCENES page's knobs work on: its index, times, flags, steps; the master cycle */
      unsigned er = st.playing ? st.row : song_scene_reserved();
      const struct song_model *mdl = song_model_current();
      out[23] = (uint8_t)er; out[24] = rec && er < rec->rows ? rec->row[er].repeat : 0; out[25] = rec && er < rec->rows ? rec->row[er].flags : 0;
      out[26] = rec && er < rec->rows ? rec->row[er].steps : 0; out[27] = mdl ? mdl->cycle : 16; }
    out[33] = clip ? clip[12] : 0;   /* tabby-v04.15: the open clip's transpose, a signed byte */
    out[34] = clip ? clip[13] : 0; out[35] = clip ? clip[15] : 0;   /* tabby-v04.17: the open clip's shuffle (0 the song's, 1..51 its own 0..50) and playback quantize (0..3) */
    out[36] = clip ? clip[14] : 0;   /* tabby-v04.19: the open clip's scale (0 a 16th, 1 an 8th, 2 a 32nd, 3 a 16th triplet, 4 an 8th triplet) */
    out[37] = 21;   /* the reply's revision: 20 (tabby-v04.20): byte 36 carries the direction in its high four bits; 21 (tabby-v1.0.2): byte 38 */
    out[38] = (uint8_t)song_setting(SONG_SET_EVENT_LEAD);   /* tabby-v1.0.2: the song's event lead: 0 OFF, 1 a 32nd, 2 a 16th, 3 an 8th, 4 a quarter */
    return 39;
}
/* tabby-v04.21: command 29 op 16 {16, 5}: what the > button does on the ACTIONS page while NEW SONG is the selected
 * entry (that button cannot be injected): the next control pass takes it as a press. */
static uint8_t remote_action_do;
int ct_screen_action_do(void)
{
    if (page != ACTIONS || action != ACT_NEW_SONG) return SONG_INVALID;
    remote_action_do = 1;
    return 0;
}
int ct_screen_setup_do(void)
{
    if (page != CLIP_SETUP) return SONG_INVALID;
    notice = setup_do(); notice_until = fm1_millis() + 2000U; cache->middle_cache = ~0U;
    return 0;
}
static void note_name(unsigned note, char out[12])
{
    static const char names[] = "CCDDEFFGGAAB";
    static const uint16_t sharps = (1U << 1) | (1U << 3) | (1U << 6) | (1U << 8) | (1U << 10);
    unsigned pitch = note % 12, n = 1;
    out[0] = names[pitch];
    if (sharps & (1U << pitch))
        out[n++] = '#';
    char oct[12];
    decimal(oct, (int)(note / 12) - 1, 1);
    strcpy(out + n, oct);
}
static uint32_t signature(uint32_t seed, const void *bytes, unsigned n)
{
    const uint8_t *p = bytes;
    for (unsigned i = 0; i < n; ++i)
        seed = seed * 33U + p[i];
    return seed;
}
static void frame(unsigned x, unsigned y, unsigned w, unsigned h, uint16_t color)
{
    paint_fill(x, y, w, 1, color);
    paint_fill(x, y + h - 1, w, 1, color);
    paint_fill(x, y, 1, h, color);
    paint_fill(x + w - 1, y, 1, h, color);
}
#ifdef FM1_HOST_TEST
static char web_knobs[4][2][16];
static int16_t web_knob_rect[4][4];   /* tabby-v1.1: where the knob's line is on the screen (x, y, w, h), w 0: not shown */
#endif
static void knob_note(unsigned col, const char *label, const char *value, unsigned x, unsigned y, unsigned w, unsigned h)
{
#ifdef FM1_HOST_TEST
    if (col < 4) {
        memset(web_knobs[col], 0, sizeof web_knobs[col]);
        unsigned n = (unsigned)strlen(label); if (n > 15) n = 15;
        memcpy(web_knobs[col][0], label, n);
        n = (unsigned)strlen(value); if (n > 15) n = 15;
        memcpy(web_knobs[col][1], value, n);
        web_knob_rect[col][0] = (int16_t)x; web_knob_rect[col][1] = (int16_t)y; web_knob_rect[col][2] = (int16_t)w; web_knob_rect[col][3] = (int16_t)h;
    }
#else
    (void)col; (void)label; (void)value; (void)x; (void)y; (void)w; (void)h;
#endif
}
/* tabby-v1.1 (docs/CONTROL-MAP.md 20.9): one line per knob: a bar in the knob's colour, the knob, its full name at
 * scale 2, the value at scale 3 on the right (scale 2 when it has more than four characters). */
static void param_row(unsigned y, const char *key, const char *label, const char *value, uint16_t color)
{
    unsigned n = (unsigned)strlen(value);
    erase(0, y, 240, 24);
    if (!*label) return;
    paint_fill(0, y + 1, 3, 21, color);
    dim_text(6, y + 4, key);
    plain_text(42, y + 4, label);
    if (n <= 4) text(238 - 18 * n, y + 1, value, 3, color, BACK);
    else text(n > 8 ? 142 : 238 - 12 * n, y + 4, value, 2, color, BACK);
}
static unsigned knob_top = 62;
static void knob(unsigned col, const char *label, const char *value, uint16_t color)
{
    unsigned y = knob_top + 26 * col;
    knob_note(col, label, value, 0, y, 240, 24);
    if (paint_rendering && (paint_top >= y + 24 || paint_top + PAINT_ROWS <= y)) return;
    uint32_t sig =
        signature(signature(color + y, label, (unsigned)strlen(label)), value, (unsigned)strlen(value));
    if (cache->foot_cache[col] == sig)
        return;
    cache->foot_cache[col] = sig;
    static const char *const keys[] = {"K1", "K2", "K3", "K4"};
    param_row(y, keys[col], label, value, color);
}
/* The compact knob line of SCENES, STEP and MIX: four columns, the name and the value at scale 2. */
static void strip(unsigned col, const char *label, const char *value, uint16_t color)
{
    unsigned x = 2 + 60 * col;
    knob_note(col, label, value, x, 198, 56, 40);
    if (paint_rendering && paint_top + PAINT_ROWS <= 198) return;
    uint32_t sig =
        signature(signature(color, label, (unsigned)strlen(label)), value, (unsigned)strlen(value));
    if (cache->foot_cache[col] == sig)
        return;
    cache->foot_cache[col] = sig;
    erase(x, 198, 58, 40);
    paint_fill(x, 198, 54, 2, color);
    dim_text(x, 203, label);
    color_text(x, 221, value, color);
}
/* tabby-v1.1 (docs/CONTROL-MAP.md 20.2): the top line: tempo, play state, the selected track at scale 3; ARP and
 * what waits for a save at scale 2. The state follows the song when one plays, else the pattern sequencer. */
/* The play state of the top line (and, from tabby-v1.2.1, of the left end of a message box): the song's when a
 * song plays, counts in or records, else the pattern sequencer's. *count: the count-in's quarter notes left. */
static const char *const state_words[] = {"STOP", "PLAY", "PAUS", "ARMD", "REC", "CNT", "LOST"};
static const uint16_t state_tints[] = {DIM, GREEN, AMBER, AMBER, RED, AMBER, AMBER};
static unsigned play_state(const struct groove_view *v, unsigned *count)
{
    struct song_status st; song_status_read(&st);
    struct song_edit_info ei; song_edit_info(&ei);
    unsigned paused = !v->playing && !groove_sequence_rewound();
    *count = st.count_in > 9 ? 9U : st.count_in;
    return v->clock_mode && v->clock_state == GROOVE_CLOCK_LOST ? 6U : st.count_in ? 5U : ei.recording == 2 ? 4U : ei.recording ? 3U
         : st.playing || v->playing ? 1U : paused ? 2U : 0U;
}
static void state_word(unsigned x, unsigned y, unsigned state, unsigned count, uint16_t bg)
{
    text(x, y, state_words[state], 3, state_tints[state], bg);
    if (state == 5) number(x + 54, y, (int)count, 1, 3, AMBER, bg);
}
static uint32_t cpu_guard_until;
static unsigned cpu_guard_shown(void) { return cpu_guard_until && (int32_t)(cpu_guard_until - fm1_millis()) > 0; }
static __attribute__((noinline)) void header(const struct groove_view *v)
{
    if (paint_rendering && paint_top >= 30) return;
    unsigned count, state = play_state(v, &count);
    unsigned unsaved = (song_unsaved() ? 1U : 0U) | (groove_project_dirty() ? 2U : 0U), silent = !fm1_engine_output_level();
    uint32_t sig = v->tempo | (state << 10) | ((uint32_t)count << 13) | ((uint32_t)track << 17) |
        (groove_arp_enabled(track) << 20) | (unsaved << 21) | ((uint32_t)v->clock_mode << 23) | (silent << 24) | (cpu_guard_shown() << 25);
    if (sig == cache->header_cache)
        return;
    cache->header_cache = sig;
    erase(0, 0, 240, 30);
    if (v->clock_mode && !v->tempo) big_text(4, 5, "---", DIM);
    else big_number(4, 5, v->tempo, 3, v->clock_mode ? ACCENT : TEXT);
    state_word(66, 5, state, count, BACK);
    big_text(144, 5, "T", colors[track]); big_number(162, 5, (int)track + 1, 1, colors[track]);
    /* K8 at zero: no sound at all. It stays here in amber for as long as it is so (a rig that plays outside gear
     * only may leave it there: a box over every page would be in the way). */
    if (silent) color_text(190, 0, "K8=0", AMBER);
    else if (cpu_guard_shown()) color_text(190, 0, "CPU!", AMBER);   /* the CPU guard took voices back within the last two seconds */
    else if (groove_arp_enabled(track)) plain_text(190, 0, "ARP");
    if (unsaved) color_text(190, 15, unsaved == 3 ? "*S+P" : unsaved == 2 ? "*PRJ" : "*SNG", AMBER);
}
/* tabby-v1.1 (docs/CONTROL-MAP.md 20.4): HOME: eight rows: the track's number at scale 3, K / P where the keys and
 * the pads play, the sound, the state, the level. */
static __attribute__((noinline)) void overview(const struct groove_view v[8])
{
    if (paint_rendering && paint_top + PAINT_ROWS <= 34) return;
    char project_name[13]; groove_project_name(project_name);
    uint32_t title = signature(pad_focus | ((unsigned)v[track].type << 1) | (groove_pad_count(track) ? 16U : 0U), project_name, 12);
    if (title != cache->title_cache) {
        cache->title_cache = title;
        erase(0, 34, 240, 17);
        accent_text(0, 35, project_name);
        color_text(144, 35, pad_focus ? groove_pad_count(track)?"PAD DRUM":"PAD NOTE":"KEY PLAY", pad_focus?ACCENT:DIM);
    }
    static const char *const chip_names[] = {"PSG YM", "PSG AY", "PSG NOIS", "PSG MIX"};
    unsigned key_track = smk37_performance_track(0), pad_track = smk37_performance_track(1);
    for (unsigned t = 0; t < 8; ++t) {
        unsigned y = 53 + 23 * t;
        if (paint_rendering && (y >= paint_top + PAINT_ROWS || y + 22 <= paint_top)) continue;
        unsigned mark = t == (pad_focus ? pad_track : key_track) ? 1U + pad_focus : t == key_track ? 3U : t == pad_track ? 4U : 0U;
        uint32_t meta = v[t].program | ((uint32_t)v[t].volume << 7) | ((t == track) << 14) |
                        ((uint32_t)v[t].modified << 15) | ((uint32_t)v[t].muted << 16) |
                        ((uint32_t)v[t].solo << 17) | ((uint32_t)v[t].ready << 18) |
                        ((uint32_t)v[t].type << 19) | ((uint32_t)midi_active[t] << 22) |
                        ((uint32_t)groove_track_role(t) << 23) | ((uint32_t)track_muted(t) << 27) | (mark << 28);
        if (v[t].type == GROOVE_DX7)
            meta = signature(meta, frame_fm_names[t], 7);
        if (meta != cache->row_cache[t]) {
            cache->row_cache[t] = meta;
            cache->meter_cache[t] = ~0U;
            erase(0, y, 240, 22);
            uint16_t bg = t == track ? colors[t] : PANEL;
            paint_fill(0, y, 22, 22, bg);
            number(2, y + 1, (int)t + 1, 1, 3, t == track ? BACK : colors[t], bg);
            if (midi_active[t]) paint_fill(0, y + 18, 4, 4, GREEN);
            if (mark) color_text(26, y + 1, mark & 1U ? "K" : "P", mark < 3 ? TEXT : DIM);
            color_text(40, y + 1, !v[t].ready                  ? "ERROR"
                 : v[t].type == GROOVE_DX7    ? frame_fm_names[t]
                 : v[t].type == GROOVE_303    ? (v[t].program ? "303 SQR" : "303 SAW")
                 : v[t].type == GROOVE_PSG    ? chip_names[v[t].program & 3U]
                 : v[t].type == GROOVE_PLUCK  ? "PLUCK"
                 : v[t].type == GROOVE_SAMPLE ? "SAMPLER"
                                              : "808 KIT", colors[t]);
            unsigned role = groove_track_role(t);
            color_text(142, y + 1, role == GROOVE_TRACK_OFF ? "OFF"
                 : track_muted(t)  ? "MUTE"
                 : v[t].muted      ? "INT"
                 : v[t].solo       ? "SOLO"
                 : role == GROOVE_TRACK_PLAY ? "LIVE"
                 : v[t].modified   ? "EDIT"
                                   : "", role == GROOVE_TRACK_OFF ? DIM : track_muted(t) ? AMBER : v[t].muted ? BLUE : DIM);
            small_number(198, y + 1, v[t].volume, 3, t == track ? TEXT : DIM);
        }
        unsigned meter = v[t].audible ? (v[t].level * 96U + 63U) / 127U : 0;
        unsigned meter_signature = meter | (v[t].level >= 124 ? 128U : 0U);
        if (meter_signature != cache->meter_cache[t]) {
            cache->meter_cache[t] = meter_signature;
            paint_fill(40, y + 17, 96, 3, PANEL);
            if (meter)
                paint_fill(40, y + 17, meter, 3, v[t].level >= 124 ? AMBER : colors[t]);
        }
    }
}
/* Task 12 A2: the SYNC / MIDI and MIDI TRACK views of page STEPS. tabby-v1.1 (docs/CONTROL-MAP.md 20.9): the title,
 * K7's line and the shortcuts; K1 to K4 are drawn as lines by draw_page_body. */
static __attribute__((noinline)) void sync_draw(const struct groove_view *v)
{
    (void)v;
    if (paint_rendering && paint_top + PAINT_ROWS <= 34) return;
    uint32_t sig = seq_page | ((uint32_t)groove_midi_setting(track, 4) << 8);
    if (sig == cache->title_cache) return;
    cache->title_cache = sig;
    erase(0, 34, 240, 27);
    erase(0, 166, 240, 74);
    big_text(4, 35, seq_pages[seq_page], ACCENT);
    if (seq_page == SEQ_MIDI_TRACK) {
        dim_text(4, 172, "IN: RECEIVE CHANNEL");
        dim_text(4, 190, "OUT: SEND CHANNEL");
        dim_text(4, 218, "K5 TRACK  SEQ: SYNC");
        return;
    }
    param_row(166, "K7", "KEY OUT", groove_midi_setting(track, 4) ? "ON" : "OFF", TEXT);
    dim_text(0, 200, "KNOB BANK+SEQ: TRACK");
    dim_text(4, 218, "SEQ+PARA: ACTIONS");
}
/* tabby-v1.1 (docs/CONTROL-MAP.md 20.10): mute and solo in two rows of eight like the pads, eight level bars. */
static __attribute__((noinline)) void mix_draw(const struct groove_view v[8])
{
    if (paint_rendering && paint_top + PAINT_ROWS <= 34) return;
    unsigned banks = track / 4 | (smk37_fader_bank() << 1);
    if (cache->title_cache != banks) {
        cache->title_cache = banks;
        erase(0, 34, 240, 26);
        big_text(4, 35, "MIX", TEXT);
        accent_text(84, 39, banks & 1U ? "K T5-8" : "K T1-4");
        accent_text(168, 39, banks & 2U ? "F T5-8" : "F T1-4");
    }
    for (unsigned i = 0; i < 16; ++i) {
        unsigned t = i & 7U, on = i < 8 ? v[t].muted : v[t].solo;
        uint32_t sig = on | ((t == track) << 1);
        if (sig == cache->tile_cache[i])
            continue;
        cache->tile_cache[i] = sig;
        unsigned x = 1 + t * 30, y = i < 8 ? 62 : 94;
        uint16_t bg = on ? colors[t] : PANEL;
        paint_fill(x, y, 28, 28, bg);
        if (t == track)
            frame(x, y, 28, 28, TEXT);
        text(x + 2, y + 7, i < 8 ? "M" : "S", 2, on ? BACK : DIM, bg);
        number(x + 14, y + 7, (int)t + 1, 1, 2, on ? BACK : colors[t], bg);
    }
    for (unsigned t = 0; t < 8; ++t) {
        unsigned level = (v[t].volume * 60U + 63U) / 127U;
        if (level == cache->meter_cache[t]) continue;
        cache->meter_cache[t] = level;
        paint_fill(5 + t * 30, 130, 20, 60, PANEL);
        paint_fill(5 + t * 30, 190 - level, 20, level, colors[t]);
    }
}
static __attribute__((noinline)) void project_draw(void)
{
    if (project_drawn_revision != groove_project_revision())
        project_refresh();
    char name[13];
    groove_project_name(name);
    uint32_t sig = signature(project_slot, project_stored, 12);
    sig = signature(sig, &project_stored_result, sizeof project_stored_result);
    if (cache->title_cache != sig) {
        cache->title_cache = sig;
        erase(0, 36, 240, 34);
        dim_text(4, 36, "SLOT");
        small_number(64, 36, project_slot + 1, 2, ACCENT);
        dim_text(88, 36, "/16");
        dim_text(148, 36, "HOLDS:");
        plain_text(4, 54, project_stored_result < 0 ? "READ ERROR" : project_stored);
    }
    sig = signature(name_cursor, name, 12);
    if (cache->middle_cache != sig) {
        cache->middle_cache = sig;
        erase(0, 94, 240, 26);
        big_text(4, 94, name, ACCENT);
        paint_fill(4 + name_cursor * 18, 117, 15, 2, ACCENT);
    }
    sig = project_reload;
    if (cache->row_cache[0] != sig) {
        cache->row_cache[0] = sig;
        erase(0, 146, 240, 42);
        if (project_reload) { big_text(4, 146, "OVERWRITE?", AMBER); plain_text(4, 172, "> YES  PATCH NO"); }
        else plain_text(4, 150, ">: WRITE PROJECT");
    }
    if (cache->hint_cache != 1U) {
        cache->hint_cache = 1U;
        dim_text(4, 76, "K1 CURSOR K2 LETTER");
        dim_text(4, 126, "K5/K7 CHOOSE SLOT");
        dim_text(4, 222, "PATCH BACK");
    }
    sig = (unsigned)(project_result + 16) | (project_operation << 16);
    if (cache->row_cache[1] == sig) return;
    cache->row_cache[1] = sig;
    /* tabby-v1.1: thirteen characters at scale 3 */
    const char *status = project_result == GROOVE_PROJECT_EMPTY     ? "NO VALID SAVE"
                         : project_result == GROOVE_PROJECT_TUNING_SPACE ? "OLD DATA"   /* ACTIONS: ERASE OLD DATA */
                         : project_result == GROOVE_PROJECT_PLAYING ? "STOP TO SAVE"   /* Task 12 A3 */
                         : project_result == GROOVE_PROJECT_MEMORY  ? "NO MEMORY"
                         : project_result == GROOVE_PROJECT_INVALID ? "BAD PROJECT"
                         : project_result == FM1_FLASH_BUSY         ? "FLASH BUSY"
                         : project_result == FM1_FLASH_UNAVAILABLE  ? "NO FLASH"
                         : project_result                           ? "FLASH ERROR"
                         : project_operation == 1                   ? "SAVED"
                         : project_operation == 3                   ? "SAVING"
                                                                    : "READY";
    erase(0, 194, 240, 22);
    big_text(4, 194, status, project_result ? AMBER : GREEN);
}
static __attribute__((noinline)) void preset_draw(void)
{
    uint32_t sig = signature(preset_slot, project_stored, 12);
    sig = signature(sig, &project_result, sizeof project_result);
    if (cache->middle_cache == sig) return;
    cache->middle_cache = sig;
    erase(0, 30, 240, 210);
    dim_text(4, 38, "USER PROJECTS");   /* Task 03 f: no factory bank */
    big_number(4, 58, preset_slot + 1, 2, ACCENT);
    big_text(40, 58, "/16", DIM);
    big_text(4, 86, project_stored_result < 0 ? "READ ERROR" : project_stored, TEXT);
    plain_text(4, 116, "K5/K7 CHOOSE SLOT");
    plain_text(4, 134, "SEQ PLAY: LOAD+RUN");
    plain_text(4, 152, "> SAVE");
    dim_text(4, 170, "PADS 1-16: LOAD");
    if (project_result) big_text(4, 198, project_result == GROOVE_PROJECT_EMPTY ? "EMPTY SLOT" : "LOAD FAILED", AMBER);
    else { dim_text(4, 200, "PATCH BACK"); dim_text(4, 218, "PATCH + >: UNDO"); }
}
static __attribute__((noinline)) void effects_draw(void)
{
    const uint8_t *values = frame_effects;
    unsigned title = 1U + track + effects_page * 8U + ((unsigned)frame_views[track].type << 6);
    if (cache->title_cache != title) {
        cache->title_cache = title;
        erase(0, 34, 240, 26);
        erase(0, 168, 240, 72);
        big_text(4, 35, effects_page == 2 ? "FX DELAY" : effects_page ? "FX SHARED" : "FX TRACK", ACCENT);
        plain_text(4, 172, effects_page == 2 ? "SEQ: TAP TEMPO" : effects_page ? "ALL TRACKS" : source_names[frame_views[track].type]);
        dim_text(0, 196, "K6: TRACK/SHARED/DLY");
        dim_text(4, 214, "K5 TRACK");
    }
    static const char *const shared[4] = {"REV TIME", "DLY TIME", "FEEDBACK", "RETURN"};
    static const char *const local[4] = {"REV SEND", "DLY SEND", "TRK VOL", "ALL RET"};
    static const char *const delay[4] = {"SYNC", "TIME MS", "BPM", "FEEDBACK"};
    static const char *const division[] = {"1/32T", "1/32", "1/16T", "1/16", "1/8T", "1/16D", "1/8", "1/8D", "1/4"};
    const char *const *labels = effects_page == 2 ? delay : effects_page ? shared : local;
    knob_top = 62;
    for (unsigned i = 0; i < 4; ++i) {
        unsigned value = effects_page == 2 && !i ? values[1] : values[i], synced = groove_delay_synced(values[1]);
        const char *label = labels[i];
        char display[12];
        if (effects_page == 2 && !i) strcpy(display, synced ? "ON" : "OFF");
        else if (effects_page && i == 1 && synced) {
            label = "DIVISION"; strcpy(display, division[values[1] - GROOVE_DELAY_SYNC]);
        } else if (effects_page == 2 && i == 2 && frame_views[track].clock_mode) {
            strcpy(display, "MIDI");
        } else {
            if (effects_page && i == 1) { value = (groove_delay_ticks() * 80U + 220U) / 441U; label = "DLY MS"; }
            else if (effects_page == 2) value = i == 2 ? frame_views[track].tempo : values[2];
            decimal(display, (int)value, 1);
            if (!effects_page && i < 2 && value < 100) strcat(display, "%");
        }
        knob(i, label, display, colors[i]);
    }
}
static void leds(const struct groove_view *v, unsigned visible)
{
    uint32_t bits = 0;
    /* Task 12 A2: the pads no longer light a step lane (no step editor). */
    if (visible == PRESET_BROWSER) {
        bits = 1U << white_keys[preset_slot];
    } else if (visible == MIX) {
        for (unsigned t = 0; t < 8; ++t) {
            if (frame_views[t].muted)
                bits |= 1U << white_keys[t];
            if (frame_views[t].solo)
                bits |= 1U << white_keys[t + 8];
        }
    } else
        for (unsigned key = 0; key < 27; ++key)
            if (key_note[key] != 0xff)
                bits |= 1U << key;
    uint32_t changed = bits ^ led_cache;
    for (unsigned key = 0; key < 27; ++key)
        if (changed & (1U << key))
            fm1_led_set(key + 14, (bits >> key) & 1U);
    led_cache = bits;
    bits = ((octave < 0) << OCT_DOWN) | ((octave > 0) << OCT_UP)
        | ((visible == OVERVIEW) << HOME) | ((visible == EFFECTS) << FX)
        | ((groove_arp_enabled(track) != 0) << ARP)
        | ((visible == STEPS || visible == ACTIONS) << SEQ)
        | ((v->playing != 0 || song_playing()) << PLAY) | ((visible == MIX) << GLO)
        | ((visible == FM_QUICK) << EDIT) | ((visible == TRACK_LAUNCH) << SCL)
        | ((visible == PROJECT || visible == SOURCE || (visible == ACTIONS && action_confirm)) << SAVE)
        | ((unsigned)(rec_lamp != 0) << REC);   /* Goal 6: lit while a take is armed or running */
    changed = bits ^ button_led_cache;
    for (unsigned key = 0; key < 14; ++key)
        if (changed & (1U << key)) fm1_led_set(key, (bits >> key) & 1U);
    button_led_cache = (uint16_t)bits;
}
static unsigned mdl_holds(unsigned t, unsigned place)
{
    const struct song_model *mdl = song_model_current();
    return mdl && t < SONG_TRACKS && place < SONG_CLIPS && mdl->clip[t][place];
}
static __attribute__((noinline)) void edit_page_draw(unsigned visible)
{
    if (paint_rendering && paint_top + PAINT_ROWS <= 32) return;
    if (!paint_rendering) {
        uint32_t running = 0;
        uint32_t sig = visible * 33U + action + (action_confirm << 8);
        sig = sig * 33U + cursor;
        sig = sig * 33U + source_preview;
        sig = sig * 33U + (unsigned)source_result;
        if (visible == SOURCE) sig = sig * 33U + groove_track_role(track);
        sig = sig * 33U + tone_clip_ready;   /* Task 12 A2: the step / count-in state left with the editor */
        sig = sig * 33U + frame_views[track].volume;
        if (visible == ACTIONS) {   /* Task 11: redraw when the storage lines change */
            char a[40], b[40]; ct_diag_storage_lines(a, b);
            sig = signature(sig, a, (unsigned)strlen(a)); sig = signature(sig, b, (unsigned)strlen(b));
#ifdef CT_A2
            sig = sig * 33U + ct_a2_get();   /* Task 15: redraw when A2 is switched (also by command 25) */
#endif
        }
        if (visible == FM_QUICK) {
            sig = signature(sig, frame_patch, 156);
            sig = sig * 33U + frame_views[track].program;
            sig = sig * 33U + frame_views[track].modified;
        }
        if (visible == SONG || visible == TRACK_LAUNCH) {
            struct song_status st; song_status_read(&st);
            /* tabby-v1.2: only what the pages show. With the step and the step in the bar in it, the whole page was
             * painted again on every 16th while the song played: 120 bands a second asked of a painter that manages 84
             * beside the MIDI sends, so a picture was never finished (found by the screen copy: the device never
             * stood still) and every note met a band. SCENES shows the bar in the scene, CLIPS the bar count. */
            /* The bar count (CLIPS) and the bar in the scene (SCENES) change at every bar line, where the bar's first
             * notes are due: only their own digits are painted again (edit_page_draw, below), not the page. */
            running = st.bar | ((uint32_t)(st.step >> 4) << 16);
            st.step = 0; st.bar_step = 0; st.bar = 0;
            sig = signature(sig, &st, sizeof st);
            /* what the pad cells and the scene's clip line show of the song itself (a clip made or deleted, a scene
             * stored): it used to ride on the repaint of every step */
            { const struct song_model *sm = song_model_current(); const struct song_record *sr = song_current();
              if (sm && sr) { unsigned row = st.playing ? st.row : song_scene_reserved() < sr->rows ? song_scene_reserved() : 0;
                  for (unsigned i = 0; i < 16 && clip_bank * 16U + i < SONG_CLIPS; ++i) sig = sig * 33U + (sm->clip[track][clip_bank * 16U + i] != 0);
                  sig = signature(sig, sm->scene_clip[row], SONG_TRACKS); sig = sig * 33U + sr->rows + ((unsigned)sr->tempo << 8); } }
            sig = sig * 33U + song_select + (song_row_page << 8) + (song_storage_state() << 12) + (track << 20) + (song_follow_state() << 27);   /* tabby-v1.2: without the pads' blink phase: nothing on the screen blinks, and it repainted the page on every eighth note */
            sig = sig * 33U + clip_bank + ((unsigned)clip_select[track] << 3) + (track_muted(track) << 12) + ((unsigned)rec_lamp << 13);
            for (unsigned t = 0; t < 8; ++t) sig = sig * 33U + mute_kind(t);   /* Task 16: the follow state */
            sig = sig * 33U + song_unsaved() + (song_scene_hold() << 1) + (song_scene_reserved() << 2);
            { const struct song_record *sr = song_current(); if (sr) for (unsigned i = 0; i < sr->rows; ++i) sig = sig * 33U + sr->row[i].repeat + ((unsigned)sr->row[i].flags << 7); }
        }
        if (visible == CLIP_SETUP) {
            uint8_t v[40]; unsigned n = ct_screen_setup_read(v);
            sig = signature(sig, v, n);
            struct song_edit_info ei; song_edit_info(&ei); sig = sig * 33U + ei.dirty + ((unsigned)ei.undo << 1);
            struct song_status st; song_status_read(&st); sig = sig * 33U + st.playing;
        }
        if (visible == CLIP_STEPS) {
            struct song_edit_info ei; song_edit_info(&ei);
            struct song_status st; song_status_read(&st);
            /* tabby-v1.2: the running step moves only the cells: when nothing else changed, only their rows are
             * painted again (not the whole page on every 16th) */
            running = ei.play_step; ei.play_step = 0;
            sig = signature(sig, &ei, sizeof ei);
            sig = sig * 33U + step_bar + ((unsigned)step_sel << 4) + ((unsigned)step_cursor << 12) + ((unsigned)step_pitch << 16) + ((unsigned)step_pads_toggle << 23) + ((unsigned)st.playing << 24);
        }
        if (visible == ARP_EDIT) {
            sig = sig * 33U + track + (groove_arp_enabled(track) << 8) + (arp_page << 9);
            for (unsigned i = 0; i < 6; ++i) sig = sig * 33U + groove_arp_setting(track, i);
            for (unsigned i = 0; i < 2; ++i) sig = sig * 33U + groove_midi_setting(track, i);
        }
        if (cache->middle_cache == sig) {
            if (cache->hold_step != running) {
                cache->hold_step = running;
                if (visible == CLIP_STEPS) paint_mark(0, 95, 240, 39);
                else if (visible == TRACK_LAUNCH) paint_mark(180, 39, 48, 14);
                else if (visible == SONG) paint_mark(134, 126, 12, 14);
            }
            return;
        }
        cache->middle_cache = sig; cache->hold_step = running;
    }
    erase(0, 33, 240, 207);
    cache->hint_cache = ~0U;
    memset(cache->foot_cache, 0xff, sizeof cache->foot_cache);
    if (visible == SOURCE) {
        /* tabby-v1.1 (docs/CONTROL-MAP.md 20.11) */
        big_text(4, 35, source_names[source_preview], ACCENT);
        dim_text(4, 60, "SOUND SOURCE");
        for (unsigned i = 0; i < SOURCE_CHOICES; ++i) {
            unsigned x = 1 + (i & 1U) * 120, y = 78 + (i / 2U) * 18;
            uint16_t bg = i == source_preview ? PANEL : BACK;
            paint_fill(x, y, 118, 17, bg);
            number(x + 2, y + 1, (int)i + 1, 1, 2, i == source_preview ? ACCENT : DIM, bg);
            text(x + 20, y + 1, source_names[i], 2, i == source_preview ? TEXT : DIM, bg);
        }
        accent_text(4, 136, source_preview == groove_source_type(track) ? "CURRENT SOUND" : "NEW: RESETS TIMBRE");
        unsigned role = groove_track_role(track);
        plain_text(4, 154, "K2 TRACK:"); accent_text(124, 154, track_modes[role]);
        static const char *const hints[] = {"FOLLOWS THE PROJECT", "KEEPS SOUND ON LOAD", "K2 LEFT: ENABLE"};
        dim_text(4, 172, source_preview == groove_source_type(track) ? hints[role] : "CHANGE CLEARS STEPS");
        plain_text(4, 200, "K1 / PADS CHOOSE");
        dim_text(0, 218, role == GROOVE_TRACK_OFF ? "K2 ENABLES  PATCH BK" : "> APPLY  PATCH BACK");
    } else if (visible == ACTIONS) {
        /* Task 11: the USER size the SDK validated, the song storage state and the free / reclaimable storage, so
         * the probe's result can be read on the device without a monitor. tabby-v1.1: the entries at scale 2, a
         * question as the amber box (banner_text). */
        char diag_user[40], diag_song[40];
        ct_diag_storage_lines(diag_user, diag_song);
        for (unsigned i = 0; i < ACTION_COUNT; ++i) {
            unsigned y = 34 + i * 17;
            uint16_t bg = i == action ? PANEL : BACK;
            paint_fill(0, y, 240, 16, bg);
            const char *label = actions[i];
#ifdef CT_A2
            if (i == ACT_A2 && !ct_a2_get()) label = "A2 FAST MIDI: OFF";   /* Task 15; v0.8: on at boot */
#endif
            text(0, y + 1, label, 2, i == action ? ACCENT : DIM, bg);
        }
        plain_text(0, 191, diag_song);
        accent_text(0, 208, diag_user);
        dim_text(0, 225, "K1/K5 PICK > DOES IT");
    } else if (visible == SONG) {
        /* Task 03 d: song mode. tabby-v1.1 (docs/CONTROL-MAP.md 20.6): song, scene and what comes next at scale 3. */
        struct song_status st; song_status_read(&st);
        const struct song_record *rec = song_current();
        const struct song_model *mdl = song_model_current();
        unsigned storage = song_storage_state();
        big_text(4, 35, "SONG", ACCENT);
        big_number(94, 35, (int)song_select + 1, 2, TEXT);
        if (storage != SONG_STORAGE_READY) {
            big_text(3, 78, storage == SONG_STORAGE_OLD_DATA ? "OLD DATA" :   /* Task 12 A1 */
                            storage == SONG_STORAGE_ERROR ? "STORAGE ERROR" :
                            storage == SONG_STORAGE_COMPACTING ? "COMPACTING" : "SCANNING", AMBER);
            if (storage == SONG_STORAGE_OLD_DATA) dim_text(4, 104, "ACTIONS: ERASE OLD");
        } else if (rec && st.song == song_select) {
            unsigned reserved = song_scene_reserved() < rec->rows ? song_scene_reserved() : 0;
            unsigned row = st.playing ? st.row : reserved;
            const struct song_row *r = &rec->row[row];
            char name[13]; memcpy(name, rec->name, 12); name[12] = 0;
            plain_text(4, 60, name);
            if (rec->tempo) { dim_text(156, 60, "BPM"); small_number(198, 60, rec->tempo, 3, TEXT); }
            big_text(3, 78, "SCENE", TEXT); big_number(111, 78, (int)row + 1, 3, ACCENT);
            big_text(165, 78, "/", DIM); big_number(183, 78, rec->rows, 3, TEXT);
            /* What comes next, at scale 3: a queued scene first, then what is wrong, then the chain. */
            if (st.queued != SONG_NONE) { big_text(3, 102, "TO", AMBER); big_number(57, 102, st.queued + 1, 3, AMBER); }
            else if (st.error) big_text(3, 102, st.error == (unsigned)(SONG_FULL & 255) ? "TOO MANY BLKS" : "BLOCK RD ERROR", AMBER);
            else if (st.underruns) big_text(3, 102, "DECODE LATE", AMBER);
            else if (st.playing == 1 && st.follow && st.follow != 4) {
                /* Task 16 Goal 3: CLOCK = MIDI: the song follows the master (SPEC 19.3). */
                static const char *const fol[] = {"", "ARMED: START?", "PREPARING", "WAIT PULSE", "FOLLOWING", "HOLD:NO CLOCK", "LOST-CONTINUE", "STOP BY MASTR"};
                big_text(3, 102, fol[st.follow < 8 ? st.follow : 0], st.follow == 5 || st.follow == 6 ? AMBER : DIM);
            } else if (st.playing == 2) big_text(3, 102, "STOPPING", DIM);
            else if (st.playing && st.next_row != SONG_NONE) { big_text(3, 102, "NEXT", GREEN); big_number(93, 102, st.next_row + 1, 3, TEXT); }
            else if (st.playing) big_text(3, 102, r->flags & SONG_ROW_FLAG_LOOP_HERE ? "LOOPING" : "LAST SCENE", GREEN);
            else if (song_scene_reserved()) { big_text(3, 102, "AT", AMBER); big_number(57, 102, song_scene_reserved() + 1, 3, AMBER); }
            else big_text(3, 102, "STOPPED", DIM);
            dim_text(4, 126, "X"); small_number(16, 126, st.playing ? st.repeat + 1U : 1, 2, TEXT);
            dim_text(40, 126, "/"); small_number(52, 126, r->repeat, 2, TEXT);
            dim_text(92, 126, "BAR"); small_number(134, 126, st.step / 16U + 1U, 1, TEXT);
            dim_text(146, 126, "/"); small_number(158, 126, (r->steps ? r->steps : 64U) / 16U, 1, TEXT);
            if (st.late) { color_text(180, 126, "LT", AMBER); small_number(204, 126, st.late > 999 ? 999 : st.late, 3, AMBER); }
            /* The scene's clip for each track, then the sixteen scenes of the pad bank in two rows like the pads. */
            for (unsigned t = 0; t < SONG_TRACKS; ++t) {
                unsigned x = 4 + t * 30, c = mdl ? mdl->scene_clip[row][t] : 0;
                if (c) small_number(x, 143, (int)c, 2, colors[t]); else dim_text(x, 143, "--");
            }
            for (unsigned i = 0; i < 16; ++i) {
                unsigned s = song_row_page * 16U + i, x = 1 + (i & 7U) * 30, y = i < 8 ? 160 : 179, exists = s < rec->rows;
                uint16_t c = !exists ? PANEL : st.playing && st.row == s ? GREEN
                           : st.queued == s || (!st.playing && song_scene_reserved() && reserved == s) ? AMBER : DIM;
                paint_fill(x, y, 28, 18, c);
                if (exists) number(x + 2, y + 2, (int)((s + 1U) % 100U), 2, 2, BACK, c);
            }
            /* tabby-v04.12: the scene chain: the scene the knobs work on, how often, what follows, the hold */
            { char times[12]; decimal(times, r->repeat, 2);
              strip(0, "TIME", times, colors[0]);
              strip(1, "THEN", r->flags & SONG_ROW_FLAG_LOOP_HERE ? "STAY" : row + 1U < rec->rows ? "NEXT" : rec->flags & SONG_FLAG_LOOP ? "LOOP" : "END", colors[1]);
              strip(2, "HOLD", song_scene_hold() ? "HELD" : "RUN", song_scene_hold() ? AMBER : colors[2]);
              strip(3, "JUMP", st.jump_mode ? "END" : "CYC", colors[3]); }
        } else {
            big_text(3, 78, st.error == (unsigned)(SONG_FULL & 255) ? "TOO MANY BLKS" : "NO SONG HERE", AMBER);
            dim_text(4, 104, "UPLOAD: WORKBENCH");
            dim_text(4, 122, "OR ACTIONS: NEW SONG");
        }
    } else if (visible == TRACK_LAUNCH) {
        /* Task 17 Goal 4. tabby-v1.1 (docs/CONTROL-MAP.md 20.5): song and scene at scale 3; a cell per track in two
         * rows of four: its clip and what is queued for it at scale 3; the selected track's sixteen pads of the bank
         * in two rows of eight like the pads. Count-in and recording are in the top line. */
        struct song_status st; song_status_read(&st);
        const struct song_record *rec = song_current();
        const struct song_model *mdl = song_model_current();
        unsigned have = rec && st.song == song_select, storage = song_storage_state();
        big_text(4, 35, "CLIPS", ACCENT);
        dim_text(132, 39, "BAR"); small_number(180, 39, st.playing ? st.bar + 1U : 0, 4, TEXT);
        if (storage != SONG_STORAGE_READY)
            big_text(3, 60, storage == SONG_STORAGE_OLD_DATA ? "OLD DATA" : storage == SONG_STORAGE_ERROR ? "STORAGE ERROR"
                          : storage == SONG_STORAGE_COMPACTING ? "COMPACTING" : "SCANNING", AMBER);
        else if (!have) big_text(3, 60, "NO SONG HERE", AMBER);
        else {
            unsigned row = st.playing ? st.row : song_scene_reserved() < rec->rows ? song_scene_reserved() : 0;
            big_text(3, 60, "S", DIM); big_number(21, 60, (int)song_select + 1, 2, TEXT);
            big_text(75, 60, "SCENE", DIM); big_number(183, 60, (int)row + 1, 3, st.playing ? ACCENT : DIM);
        }
        for (unsigned t = 0; t < SONG_TRACKS; ++t) {
            unsigned x = 1 + (t & 3U) * 60, y = t < 4 ? 86 : 132, state = st.track_state[t] & 3U, queue = (st.track_state[t] >> 2) & 3U;
            unsigned now_place = song_row_place(t, st.track_row[t]), mk = mute_kind(t);
            uint16_t tag = t == track ? colors[t] : BACK, shade = mk == 2 ? AMBER : mk ? BLUE : state == 1 ? GREEN : TEXT;
            paint_fill(x, y + 2, 14, 18, tag);
            number(x + 1, y + 4, (int)t + 1, 1, 2, t == track ? BACK : colors[t], tag);
            if (now_place != SONG_NONE) big_number(x + 18, y + 1, now_place + 1U, 2, shade); else big_text(x + 18, y + 1, "--", DIM);
            if (queue == SONG_QUEUE_LAUNCH) { big_text(x, y + 24, ">", AMBER); big_number(x + 18, y + 24, song_row_place(t, st.track_queued[t]) + 1U, 2, AMBER); }
            else if (queue == SONG_QUEUE_STOP) big_text(x, y + 24, ">ST", AMBER);
            else if (queue == SONG_QUEUE_ATTACH) big_text(x, y + 24, ">SC", AMBER);
            else if (st.track_chain[t] != SONG_NONE) {   /* tabby-v04.11: the launched clip's chain: the clip that follows, or a stop */
                big_text(x, y + 24, "+", GREEN);
                if (st.track_chain[t] == 254) big_text(x + 18, y + 24, "ST", GREEN); else big_number(x + 18, y + 24, song_row_place(t, st.track_chain[t]) + 1U, 2, GREEN);
            } else if (mk) big_text(x, y + 24, mk == 2 ? "MUT" : "INT", mk == 2 ? AMBER : BLUE);
        }
        unsigned playing_place = song_row_place(track, st.track_row[track]), queue = (st.track_state[track] >> 2) & 3U;
        unsigned queued_place = queue == SONG_QUEUE_LAUNCH ? song_row_place(track, st.track_queued[track]) : SONG_NONE;
        for (unsigned i = 0; i < 16; ++i) {
            unsigned place = clip_bank * 16U + i, x = 1 + (i & 7U) * 30, y = i < 8 ? 181 : 201;
            unsigned has = have && mdl && mdl->clip[track][place] != 0;
            uint16_t c = !has ? PANEL : queued_place == place || (queue == SONG_QUEUE_STOP && playing_place == place) ? AMBER
                       : playing_place == place ? GREEN : DIM;
            paint_fill(x, y, 28, 19, c);
            if (has) number(x + 2, y + 3, (int)place + 1, 2, 2, BACK, c);
            if (have && clip_select[track] == place) { frame(x, y, 28, 19, TEXT); frame(x + 1, y + 1, 26, 17, TEXT); }
        }
        if (st.playing && st.song_over) dim_text(4, 224, "SONG OVER");
        if (st.late) { color_text(132, 224, "LATE", AMBER); small_number(192, 224, st.late > 999 ? 999 : st.late, 3, AMBER); }
    } else if (visible == CLIP_SETUP) {
        /* tabby-v04.10 (docs/CONTROL-MAP.md 14): the settings of the open clip and of the song, one per line.
         * tabby-v1.1 (20.8): eight lines a page at scale 2, four pages: the clip (1/4), more of the clip from TRANSPOSE
         * (2/4), the song (3/4, 4/4); K5 walks through all of them. */
        struct song_edit_info ei; song_edit_info(&ei);
        static const char *const labels[SETUP_ROWS] = {"LENGTH", "NEXT CLIP", "AFTER", "TIMES", "PROGRAM", "BANK MSB", "BANK LSB", "COPY TO PAD", "TRANSPOSE", "SHUFFLE", "PLAY QUANT", "STEP SIZE", "DIRECTION", "DELETE CLIP", "COUNT-IN", "CLICK", "CLICK OUT", "CLICK CH", "CLICK NOTE",
                                                       "CLICK LEVEL", "K1 CC", "K2 CC", "K3 CC", "K4 CC", "EVENT LEAD"};
        const uint8_t *sclip = song_edit_clip();
        static const char *const modes[] = {"OFF", "REC ONLY", "ALWAYS"}, *const outs[] = {"INTERNAL", "MIDI", "BOTH"}, *const counts[] = {"OFF", "1 CYCLE", "2 CYCLES", "", "4 CYCLES"},
                          *const levels[] = {"LOW", "MID", "HIGH"};
        unsigned from, to, pg;
        if (setup_row < SET_TRANSPOSE) { from = 0; to = SET_TRANSPOSE; pg = 1; }
        else if (setup_row < SET_COUNT_IN) { from = SET_TRANSPOSE; to = SET_COUNT_IN; pg = 2; }
        else if (setup_row < SET_COUNT_IN + 8U) { from = SET_COUNT_IN; to = SET_COUNT_IN + 8U; pg = 3; }
        else { from = SET_COUNT_IN + 8U; to = SETUP_ROWS; pg = 4; }
        big_text(4, 35, "SETTING", ACCENT);
        if (pg > 2) dim_text(140, 39, "SONG");
        else if (ei.active) { dim_text(140, 39, "C"); small_number(152, 39, ei.place + 1U, 2, TEXT); }
        else dim_text(140, 39, "C--");
        small_number(204, 39, (int)pg, 1, TEXT); dim_text(216, 39, "/4");
        for (unsigned i = from; i < to; ++i) {
            unsigned y = 60 + (i - from) * 17, sel = i == setup_row, clip_row = i < SET_COUNT_IN;
            uint16_t bg = sel ? PANEL : BACK, shade = sel ? ACCENT : TEXT;
            char val[24] = "";
            paint_fill(0, y - 1, 240, 16, bg);
            text(4, y, labels[i], 2, sel ? TEXT : DIM, bg);
            if (clip_row && !ei.active) strcpy(val, "-");
            else if (i == SET_LENGTH) decimal(val, (int)ei.steps, 3);
            else if (i == SET_NEXT) { unsigned nx = sclip ? clip_v3_next(sclip) : 0;
                                      if (nx < CLIP_V3_NEXT_CLIP) strcpy(val, nx ? "STOP" : "STAY"); else { strcpy(val, "CLIP "); decimal(val + 5, (int)(nx - CLIP_V3_NEXT_CLIP + 1U), 2); } }
            else if (i == SET_AFTER) { unsigned af = sclip ? clip_v3_after(sclip) : 0;
                                       if (!af) strcpy(val, "CLIP END"); else { decimal(val, (int)af, 3); strcat(val, " ST"); } }
            else if (i == SET_TIMES) decimal(val, sclip ? (int)clip_v3_times(sclip) : 1, 2);
            else if (i == SET_PROGRAM) { if (sclip && (sclip[1] & CLIP_V3_FLAG_PROGRAM)) decimal(val, sclip[2] + 1, 3); else strcpy(val, "OFF"); }
            else if (i == SET_BANK_MSB) { if (sclip && (sclip[1] & CLIP_V3_FLAG_BANK)) decimal(val, sclip[3], 3); else strcpy(val, "OFF"); }
            else if (i == SET_BANK_LSB) { if (sclip && (sclip[1] & CLIP_V3_FLAG_BANK)) decimal(val, sclip[4], 3); else strcpy(val, "-"); }
            else if (i == SET_COPY) { decimal(val, (int)setup_to + 1, 2); strcat(val, mdl_holds(ei.track, setup_to) ? " USED" : " EMPTY"); }
            else if (i == SET_TRANSPOSE) { int tr = sclip ? clip_v3_transpose(sclip) : 0;
                                           val[0] = tr < 0 ? '-' : '+'; decimal(val + 1, tr < 0 ? -tr : tr, 2); if (!tr) strcpy(val, "0"); }
            else if (i == SET_SHUFFLE) { unsigned sh = sclip ? clip_v3_shuffle(sclip) : 0;
                                         if (!sh) strcpy(val, "SONG"); else { decimal(val, (int)sh - 1, 2); strcat(val, "%"); } }
            else if (i == SET_QUANTIZE) { static const char *const grids[] = {"OFF", "1/16", "1/8", "1/4"};
                                          strcpy(val, grids[(sclip ? clip_v3_quantize(sclip) : 0U) & 3U]); }
            else if (i == SET_SCALE) { static const char *const scales[] = {"1/16", "1/8", "1/32", "16T", "8T"};
                                       unsigned sc = sclip ? clip_v3_scale(sclip) : 0U, ps = sclip ? clip_v3_scale_steps(clip_v3_steps(sclip), sc) : 0U;
                                       strcpy(val, scales[sc <= CLIP_V3_SCALE_MAX ? sc : 0U]);
                                       if (sc && ps) { strcat(val, "="); decimal(val + strlen(val), (int)ps, 3); }   /* its length in 16ths */
                                       else if (sc) { strcat(val, " !"); shade = AMBER; } }                              /* not with this length */
            else if (i == SET_DIRECTION) { static const char *const dirs[] = {"FORWARD", "REVERSE", "FWD+REV"};
                                           unsigned dr = sclip ? clip_v3_direction(sclip) : 0U;
                                           strcpy(val, dirs[dr <= CLIP_V3_DIRECTION_MAX ? dr : 0U]);
                                           if (dr == CLIP_V3_DIRECTION_BOTH && sclip) { unsigned ps = clip_v3_scale_steps(clip_v3_steps(sclip), clip_v3_scale(sclip)); if (!ps) ps = clip_v3_steps(sclip);
                                               if (ps > CLIP_V3_STEPS_MAX / 2U || clip_v3_count(sclip) > CLIP_V3_EVENTS_MAX / 2U) { strcat(val, "!"); shade = AMBER; } } }   /* too long for both ways */
            else if (i == SET_DELETE) strcpy(val, "> TWICE");
            else if (i == SET_COUNT_IN) strcpy(val, counts[song_setting(SONG_SET_COUNT_IN)]);
            else if (i == SET_CLICK) strcpy(val, modes[song_setting(SONG_SET_CLICK)]);
            else if (i == SET_CLICK_OUT) strcpy(val, outs[song_setting(SONG_SET_CLICK_OUT)]);
            else if (i == SET_CLICK_CH) decimal(val, (int)song_setting(SONG_SET_CLICK_CH) + 1, 2);
            else if (i == SET_CLICK_NOTE) { char nn[12]; note_name(song_setting(SONG_SET_CLICK_NOTE), nn); decimal(val, (int)song_setting(SONG_SET_CLICK_NOTE), 3); strcat(val, " "); strcat(val, nn); }
            else if (i == SET_CLICK_LEVEL) strcpy(val, levels[song_setting(SONG_SET_CLICK_LEVEL)]);
            else if (i == SET_EVENT_LEAD) { static const char *const leads[] = {"OFF", "1/32", "1/16", "1/8", "1/4"}; strcpy(val, leads[song_setting(SONG_SET_EVENT_LEAD)]); }
            else decimal(val, (int)song_setting(SONG_SET_KNOB1 + i - SET_KNOB1), 3);
            val[8] = 0;
            text(142, y, val, 2, shade, bg);
        }
        plain_text(0, 200, "K5 LINE  K1/K2 VALUE");
        dim_text(4, 218, setup_row == SET_COPY ? "> COPIES THE CLIP" : setup_row == SET_DELETE ? "> TWICE DELETES" : "> SAVES (STOPPED)");
    } else if (visible == CLIP_STEPS) {
        /* Goal 6 (docs/CONTROL-MAP.md 12). tabby-v1.1 (20.7): the bar's sixteen steps in two rows of eight like the
         * pads, the selected step's notes on one line, the chosen note's values in the knob line. */
        struct song_edit_info ei; song_edit_info(&ei);
        const uint8_t *clip = song_edit_clip();
        big_text(3, 35, "STEP CLIP", ACCENT); big_number(183, 35, ei.place + 1, 2, TEXT);
        unsigned bars = (ei.steps + 15U) / 16U;
        dim_text(4, 60, "BAR"); small_number(46, 60, step_bar + 1U, 1, ACCENT); dim_text(58, 60, "/"); small_number(70, 60, (int)bars, 1, TEXT);
        dim_text(96, 60, "LEN"); small_number(138, 60, ei.steps, 3, TEXT);
        dim_text(192, 60, ei.quantize ? "Q ON" : "QOFF");
        dim_text(4, 77, "EV"); small_number(34, 77, ei.events, 3, ei.events >= CLIP_V3_EVENTS_MAX ? AMBER : TEXT); dim_text(70, 77, "/512");
        dim_text(132, 77, "UN"); small_number(158, 77, ei.undo, 1, TEXT); dim_text(184, 77, "RE"); small_number(210, 77, ei.redo, 1, TEXT);
        for (unsigned i = 0; clip && i < 16; ++i) {
            unsigned step = step_bar * 16U + i, x = 1 + (i & 7U) * 30, y = i < 8 ? 95 : 115;
            unsigned inside = step < ei.steps, n = inside ? clip_v3_step_notes(clip, step, NULL, 0) : 0;
            uint16_t c = !inside ? BACK : ei.play_step == step ? GREEN : n ? (clip_v3_note_find(clip, step, step_pitch) >= 0 ? AMBER : TEXT) : i % 4U == 0 ? DIM : PANEL;
            paint_fill(x, y, 28, 19, c);
            if (n) number(x + 8, y + 3, n > 9 ? 9 : (int)n, 1, 2, BACK, c);
            if (inside && step_sel == step) { frame(x, y, 28, 19, ACCENT); frame(x + 1, y + 1, 26, 17, ACCENT); }
        }
        char name[12]; note_name(step_pitch, name); name[4] = 0;
        dim_text(4, 138, step_pads_toggle ? "PADS TOGGLE" : "PADS SELECT"); color_text(156, 138, name, step_pads_toggle ? AMBER : TEXT);
        unsigned shown = 0;
        if (clip && step_sel != 255 && step_sel < ei.steps) {
            uint16_t idx[6]; unsigned n = clip_v3_step_notes(clip, step_sel, idx, 6), mod = clip_v3_step_mod(clip, step_sel) & 7U;
            for (unsigned k = 0; k < n && k < 6; ++k) {
                struct clip_v3_event e; clip_v3_event(clip, idx[k], &e);
                char nn[12]; note_name(e.a, nn); nn[3] = 0;
                color_text(4 + k * 39, 155, nn, k == step_cursor ? TEXT : DIM);
                if (k != step_cursor) continue;
                paint_fill(4 + k * 39, 170, 34, 2, ACCENT);
                int start = e.time - (int)step_sel * 480;
                char vel[12], st[12], len[12];
                decimal(vel, e.b, 1);
                st[0] = start < 0 ? '-' : '+'; decimal(st + 1, start < 0 ? -start : start, 3);
                if (e.length < 10000) decimal(len, (int)e.length, 1); else { decimal(len, (int)(e.length / 480U), 1); strcat(len, "S"); }
                note_name(e.a, nn); nn[4] = 0;
                strip(0, "NOTE", nn, colors[0]); strip(1, "VEL", vel, colors[1]); strip(2, "STRT", st, colors[2]); strip(3, "LEN", len, colors[3]);
                shown = 1;
            }
            if (!n) dim_text(4, 155, "EMPTY: PLAY A KEY");
            dim_text(4, 176, "STEP"); small_number(58, 176, step_sel + 1U, 3, ACCENT);
            dim_text(106, 176, "PROB"); if (mod) small_number(160, 176, (int)mod, 1, TEXT); else dim_text(160, 176, "ALWAYS");
        } else { dim_text(4, 155, step_pads_toggle ? "A PAD PUTS THE NOTE" : "PRESS A PAD, THEN"); dim_text(4, 176, step_pads_toggle ? "ON ITS STEP" : "PLAY KEYS"); }
        if (!shown) { strip(0, "NOTE", "--", DIM); strip(1, "VEL", "--", DIM); strip(2, "STRT", "--", DIM); strip(3, "LEN", "--", DIM); }
    } else if (visible == ARP_EDIT) {
        /* tabby-v1.1 (docs/CONTROL-MAP.md 20.9) */
        unsigned on = groove_arp_enabled(track);
        big_text(4, 35, !on ? "ARP OFF" : groove_arp_setting(track, 5) ? "ARP ON HOLD" : "ARP ON", on ? GREEN : DIM);
        accent_text(4, 170, arp_page ? "2/2 HOLD/MIDI K6" : "1/2 NOTES  K6 PAGE");
        dim_text(0, 188, arp_page ? "NEW CHORD: RELEASE" : groove_pad_count(track) ? "DRUMS: NO RANGE/GATE" : "RATE FOLLOWS THE BPM");
        dim_text(4, 206, "TAP ARP: ON/OFF");
        dim_text(0, 223, "K5 TRACK  PATCH BACK");
        static const char *const rates[] = {"1/4", "1/8", "1/16", "1/32"};
        static const char *const modes[] = {"UP", "DOWN", "UP-DN", "RANDOM"};
        char range[12], gate[12];
        decimal(range, groove_arp_setting(track, 2) + 1, 1); strcat(range, " OCT");
        decimal(gate, (groove_arp_setting(track, 3) + 1) * 25, 1); if (strlen(gate) < 3) strcat(gate, "%");
        knob_top = 62;
        if (!arp_page) {
            knob(0, "RATE", rates[groove_arp_setting(track, 0)], colors[0]);
            knob(1, "DIRECTION", modes[groove_arp_setting(track, 1)], colors[1]);
            knob(2, "RANGE", groove_pad_count(track) ? "--" : range, colors[2]);
            knob(3, "GATE", groove_pad_count(track) ? "--" : gate, colors[3]);
        } else {
            char swing[12]; decimal(swing, groove_arp_setting(track, 4), 1); strcat(swing, "%");
            knob(0, "SWING", swing, colors[0]);
            knob(1, "HOLD", groove_arp_setting(track, 5) ? "ON" : "OFF", colors[1]);
            knob(2, "", "", 0);
            char channel[12]; decimal(channel, groove_midi_setting(track, 1) + 1, 1);
            knob(3, "OUT CH", channel, colors[3]);
        }
    } else {
        /* PARA: DX7 QUICK EDIT. tabby-v1.1 (docs/CONTROL-MAP.md 20.9): the voice's name at scale 3. */
        dim_text(4, 35, "DX7 QUICK EDIT");
        small_number(184, 35, frame_views[track].program + 1, 3, ACCENT);
        if (frame_views[track].modified) color_text(224, 35, "*", AMBER);
        char name[11]; memcpy(name, frame_patch + 145, 10); name[10] = 0;
        big_text(4, 52, name, TEXT);
        plain_text(4, 188, "K7 VOICE  K6 BANK");
        dim_text(4, 206, "EDIT: WEB WORKBENCH");
        dim_text(4, 223, "PARA BACK  K5 TRACK");
        static const char *const labels[] = {"ALGORITHM", "FEEDBACK", "TRANSPOSE", "LEVEL"};
        int values[] = {frame_patch[134] + 1, frame_patch[135], (int)frame_patch[144] - 24, frame_views[track].volume};
        knob_top = 78;
        for (unsigned i = 0; i < 4; ++i) { char value[12]; decimal(value, values[i], 1); knob(i, labels[i], value, colors[i]); }
    }
}
/* Task 08: the boot screen shows the Classic Tabby display version (FM1_DISPLAY_VERSION, set
 * by the build from the git tag; app/version.h falls back to the Open label). tabby-v1.1: always at
 * scale 2: a tag such as "tabby-v1.1" on one line, a longer development string
 * (tag-count-hash-dirty) on two lines of 20 characters. */
static __attribute__((noinline, cold, minsize)) void boot_draw(void)
{
    if (cache->title_cache != 0) {
        cache->title_cache = 0;
        text(60, 40, "SMK37", 4, TEXT, BACK);
        accent_text(42, 78, "OFFICIAL OPEN");
        static const char version[] = FM1_DISPLAY_VERSION;
        unsigned n = sizeof version - 1;
        if (n <= 20) plain_text((240 - 12 * n) / 2, 102, version);
        else { char first[21]; memcpy(first, version, 20); first[20] = 0; plain_text(0, 98, first); plain_text(0, 114, version + 20); }
        dim_text(84, 216, "M-VAVE");
    }
    if (cache->middle_cache == boot_phase) return;
    cache->middle_cache = boot_phase;
    static const uint8_t height[8] = {8, 18, 30, 42, 42, 30, 18, 8};
    for (unsigned i = 0; i < 8; ++i)
        paint_fill(58 + 16 * i, 170 - height[i] / 2, 12, height[i],
                   i < boot_phase ? colors[i] : PANEL);
}
static __attribute__((noinline, cold, minsize)) void draw_page_body(const struct fm1_ble_status *ble)
{
    (void)ble; /* Task 06 (a): the BLE page is gone */
    unsigned visible = boot_active ? STARTUP : glo_down && glo_used ? MIX : page;
    if (visible != cache->shown_page) {
        memset(cache, 0xff, sizeof *cache);
        cache->shown_page = visible;
#ifdef FM1_HOST_TEST
        if (!paint_rendering) memset(web_knob_rect, 0, sizeof web_knob_rect);
#endif
        erase(0, 0, 240, 240);
        if (visible != STARTUP) paint_fill(0, 32, 240, 1, PANEL);
        if (visible == PROJECT || visible == PRESET_BROWSER)
            big_text(4, 5, visible == PROJECT ? "SAVE PROJECT" : "PRESETS", ACCENT);
    }
    if (visible == STARTUP) { boot_draw(); return; }
    const struct groove_view *views = frame_views, *v = &views[track];
    if (!paint_rendering) leds(v, visible);
    if (visible == PRESET_BROWSER) {
        preset_draw();
        return;
    }
    if (visible == PROJECT) {
        project_draw();
        return;
    }
    header(v);
    if (visible >= SOURCE) {
        edit_page_draw(visible);
        return;
    }
    if (visible == EFFECTS) {
        effects_draw();
        return;
    }
    /* Only OVERVIEW, STEPS and MIX reach this point (Task 03 b removed the
     * FM_EDIT / FM_ENV / FM_LFO / TONE_EDIT draws that used to follow). */
    if (visible == OVERVIEW)
        overview(views);
    else if (visible == STEPS)
        sync_draw(v);   /* Task 12 A2 */
    else
        mix_draw(views);
    knob_top = 62;
    for (unsigned col = 0; col < 4; ++col) {
        char value[12];
        const char *label;
        uint16_t color = colors[col];
        if (visible == STEPS && seq_page == SEQ_SYNC) {
            /* Task 12 A2: SYNC / MIDI. K1 CLOCK (was 5/7 K1), K2 CLK IN (5/7 K4), K3 SWING (3/7 K1),
             * K4 SEQ OUT (7/7 K1). KEY OUT (7/7 K2) is on K7 and in its own line. */
            static const char *const labels[] = {"CLOCK", "CLK IN", "SWING", "SEQ OUT"};
            static const char *const sources[] = {"AUTO", "USB", "BLE", "DIN"};
            label = labels[col];
            if (!col) strcpy(value, v->clock_mode ? "MIDI" : "INT");
            else if (col == 1) strcpy(value, sources[groove_midi_setting(track,6) & 3U]);
            else if (col == 2) { decimal(value, groove_sequence_setting(0), 1); strcat(value, "%"); }
            else strcpy(value, seq_outputs[groove_midi_setting(track,9)]);
        } else if (visible == STEPS) {
            /* MIDI TRACK (SHIFT+SEQ, was 6/7). */
            static const char *const labels[4] = {"IN CH", "OUT CH", "SEQ", "OUT PORT"};
            unsigned parameter = seq_midi_parameters[col], setting = groove_midi_setting(track,parameter);
            label = labels[col];
            if (!parameter) strcpy(value,midi_modes[setting]);
            else if (parameter == 1) decimal(value,setting + 1,1);
            else if (parameter == 2) strcpy(value,setting ? "ALL" : "OFF");
            else decimal(value,groove_midi_input_channel(track)+1,1);
        } else if (visible == MIX) {
            unsigned t = (track & ~3U) + col;
            static const char *const labels[8] = {"T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"};
            label = labels[t];
            color = colors[t];
            decimal(value, views[t].volume, 1);
        } else {
            /* HOME: K1 level, K2 source, K4 tempo. tabby-v1.1: no knob line: the level is in the selected row and
             * the tempo in the top line; the names stay for the workbench's simulator. */
            static const char *const labels[4] = {"LEVEL", "SOURCE", "-", "BPM"};
            label = labels[col];
            if (col == 0)
                decimal(value, v->volume, 1);
            else if (col == 1)
                strcpy(value, source_names[v->type]);
            else if (col == 2)
                strcpy(value, "--");
            else if (v->clock_mode) {
                label = "MIDI";
                if (!v->tempo)
                    strcpy(value, v->clock_state == GROOVE_CLOCK_LOST ? "LOST" : "WAIT");
                else
                    decimal(value, v->tempo, 1);
            } else
                decimal(value, v->tempo, 1);
        }
        if (visible == OVERVIEW) knob_note(col, label, value, 0, 0, 0, 0);
        else if (visible == MIX) strip(col, label, value, color);
        else knob(col, label, value, color);
    }
}
/* tabby-v1.1 (docs/CONTROL-MAP.md 20.3): a message is an amber box (across the top from tabby-v1.2), black letters at scale 3, one
 * to four lines of 13 characters broken between words; " - " in a message starts a new line. */
static unsigned banner_wrap(const char *s, char out[4][14])
{
    /* tabby-v1.2.1: the first line is 9 characters: the play state keeps its place at the left end of the box */
    unsigned lines = 0, n = 0;
#define BANNER_ROOM (lines ? 13U : 9U)
    while (*s && lines < 4) {
        while (*s == ' ') ++s;
        unsigned w = 0;
        while (s[w] && s[w] != ' ') ++w;
        if (!w) break;
        if (w == 1 && *s == '-') { if (n) { out[lines++][n] = 0; n = 0; } ++s; continue; }
        if (n && n + 1U + w > BANNER_ROOM) { out[lines++][n] = 0; n = 0; if (lines == 4) break; }
        if (n) out[lines][n++] = ' ';
        if (w > BANNER_ROOM - n) w = BANNER_ROOM - n;
        memcpy(out[lines] + n, s, w); n += w; s += w;
    }
    if (n && lines < 4) out[lines++][n] = 0;
    return lines;
#undef BANNER_ROOM
}
/* What the box says: a message while it lasts; else a question that waits for its answer. */
static const char *banner_text(void)
{
    if (boot_active) return NULL;
    if (notice) return notice;
    if (glo_down && glo_used) return NULL;
    if (page == ACTIONS && action_confirm) return confirm_prompt();
    if (page == SOURCE && source_result) return "NOT ENOUGH MEMORY - RETRY";
    return NULL;
}
static unsigned banner_lines;
static void draw_page(const struct fm1_ble_status *ble)
{
    draw_page_body(ble);
    /* KNOB BANK held: the shortcuts, five lines at scale 2 on a grey box over the lower third. */
    uint32_t shortcut_sig = track;
    if (shift_visible && !boot_active && (paint_rendering || cache->shortcut_cache != shortcut_sig)) {
        cache->shortcut_cache = shortcut_sig;
        paint_fill(0, 156, 240, 84, PANEL);
        text(4, 159, "KNOB BANK +", 2, ACCENT, PANEL);
        text(4, 175, "PADS 1-8    TRACK", 2, TEXT, PANEL);
        text(4, 191, "PADS 9-16   MUTE", 2, TEXT, PANEL);
        text(4, 207, "PATCH SRC  SEQ MIDI", 2, TEXT, PANEL);
        text(4, 223, "NOTE REPEAT KEY/PAD", 2, TEXT, PANEL);   /* tabby-v04.22: it is a KNOB BANK shortcut */
    }
    /* tabby-v1.0: what a KNOB BANK shortcut says (TRACK SELECTED, TRACK MUTED ...) must be seen while the button is
     * down: the box is drawn over the list. */
    const char *say = banner_text();
    if (say) {
        char line[4][14];
        unsigned n = banner_wrap(say, line);
        /* tabby-v1.2.1 (the user's answer of 2026-11-20): PLAY / STOP / REC stays readable while the box is up: its
         * word, in its own colour on black, at the left end of the box's first line */
        unsigned count, state = play_state(&frame_views[track], &count);
        uint32_t sig = signature(n | (state << 4) | (count << 8), say, (unsigned)strlen(say));
        if (n && (paint_rendering || cache->banner_cache != sig)) {
            cache->banner_cache = sig;
            /* tabby-v1.2 (the user's answer of 2026-11-19): at the top, over the top line, so that it never covers
             * the pads' cells; as long as before */
            /* its height ends where a row of the page ends (the top line, the title row, the row under it), so no
             * half letters stand under it */
            static const uint8_t height[] = {33, 58, 82};
            unsigned h = height[n - 1U < 3U ? n - 1U : 2U], first = (h - n * 23U) / 2U + 1U;
            paint_fill(0, 0, 240, h, AMBER);
            paint_fill(0, 0, 76, first + 23U, BACK);
            state_word(2, first, state, count, BACK);
            for (unsigned i = 0; i < n && i < 3; ++i) text(i ? 3 : 78, first + i * 23U, line[i], 3, BACK, AMBER);
        }
        return;   /* the hold bar's rows are under the box */
    } else cache->banner_cache = 0;
    if (boot_active || (paint_rendering && paint_top >= 32)) return;
    uint32_t since = 0;
    unsigned active = 1;
    if (glo_down && !glo_used) since = glo_ms;
    else if (arp_down && !arp_long) since = arp_ms;
    else if (seq_down) since = seq_ms;
    else active = 0;
    unsigned width = active ? (unsigned)clamp((int)(frame_time - since), 0, 600) * 224U / 600U : 0;
    if (cache->hold_cache == width) return;
    cache->hold_cache = width;
    erase(8, 30, 224, 2);
    if (width) paint_fill(8, 30, width, 2, ACCENT);
}
/* tabby-v1.2 (docs/SPEC.md 19.31): the screen copy. The LCD cannot be read back (one data line, driven by the SoC
 * only: app/board/fm1_lcd_hw.h), so the nearest proof of what is on the glass is a copy of every rectangle of pixels
 * the firmware hands to the LCD's DMA: paint_flush is the only writer after the start screen. Remote command {19}
 * (read only: it changes nothing a player can see or hear) switches the copy on, freezes it, reads it run-length
 * coded and gives the memory back. The copy is fifteen blocks from the heap, one per band of 16 rows: four bits a
 * pixel, an index into the band's own fifteen colours (15: a sixteenth colour, or never painted). One block of
 * 57600 bytes was refused by the device's heap at run time (tabby-v1.2-rc1); fifteen of 1952 bytes are 29 KB.
 * State: 0 off, 1 copying, 2 freeze when no band is waiting, 3 frozen. Control task only. */
enum { SHOT_BYTES = FM1_SCREEN_WIDTH * FM1_SCREEN_HEIGHT, SHOT_BAND = FM1_SCREEN_WIDTH * PAINT_ROWS, SHOT_COLORS = 15, SHOT_INFO = 16 };
struct shot_store { uint16_t color[SHOT_COLORS]; uint8_t colors, pad; uint8_t nibble[SHOT_BAND / 2]; };
static struct shot_store *shot[PAINT_BANDS];
static uint8_t shot_state, shot_info[SHOT_INFO], shot_frozen_info[SHOT_INFO];
static uint16_t shot_errors;
static unsigned cpu_guard_shown(void);
static void shot_free(void)
{
    for (unsigned b = 0; b < PAINT_BANDS; ++b) { free(shot[b]); shot[b] = NULL; }
    shot_state = 0;
}
static unsigned shot_get(unsigned offset)
{
    const struct shot_store *st = shot[offset / SHOT_BAND];
    unsigned i = offset % SHOT_BAND;
    return (st->nibble[i >> 1] >> ((i & 1U) * 4U)) & 15U;
}
static void shot_band(unsigned left, unsigned top, unsigned width)
{
    struct shot_store *st = shot[top / PAINT_ROWS];
    unsigned last = 0;
    for (unsigned r = 0; r < PAINT_ROWS; ++r) {
        const uint16_t *px = paint_pixels + r * width;
        unsigned at = r * FM1_SCREEN_WIDTH + left;
        for (unsigned c = 0; c < width; ++c, ++at) {
            uint16_t v = px[c];
            if (last >= st->colors || st->color[last] != v) {
                for (last = 0; last < st->colors && st->color[last] != v; ++last) { }
                if (last == st->colors && st->colors < SHOT_COLORS) st->color[st->colors++] = v;
            }
            unsigned shift = (at & 1U) * 4U;
            st->nibble[at >> 1] = (uint8_t)((st->nibble[at >> 1] & ~(15U << shift)) | (last << shift));
        }
    }
}
/* What the frame shows that moves with the song: the simulator is brought to the same values before its picture is
 * compared (tools/linux/hw/run-screen.py). */
static void shot_note(unsigned visible)
{
    struct song_status st; song_status_read(&st);
    struct song_edit_info ei; song_edit_info(&ei);
    uint32_t h = 2166136261U;
    h = signature(h, st.track_state, 8); h = signature(h, st.track_row, 8); h = signature(h, st.track_queued, 8); h = signature(h, st.track_chain, 8);
    uint8_t *o = shot_info;
    o[0] = (uint8_t)visible; o[1] = st.playing; o[2] = st.playing ? st.row : 255; o[3] = st.playing ? st.repeat : 0; o[4] = st.playing ? st.step : 0;
    o[5] = (uint8_t)(st.playing ? st.bar : 0); o[6] = (uint8_t)(st.playing ? st.bar >> 8 : 0); o[7] = ei.active ? ei.play_step : 255;
    o[8] = st.queued; o[9] = st.count_in; o[10] = ei.recording; o[11] = (uint8_t)h; o[12] = (uint8_t)(h >> 8); o[13] = st.song; o[14] = (uint8_t)track;
    o[15] = (uint8_t)((notice ? 1U : 0U) | (groove_project_dirty() ? 2U : 0U) | (song_unsaved() ? 4U : 0U) | (cpu_guard_shown() ? 8U : 0U));
}
int ct_screen_shot(unsigned what, unsigned offset, uint8_t *out)
{
    unsigned on = shot[0] != NULL;
    if (what == 1) {                                   /* on (again: copy from a fresh picture) */
        for (unsigned b = 0; b < PAINT_BANDS; ++b) {
            if (!shot[b]) shot[b] = malloc(sizeof *shot[b]);
            if (!shot[b]) { shot_free(); return -1; }
            memset(shot[b], 0, sizeof *shot[b]); memset(shot[b]->nibble, 255, sizeof shot[b]->nibble);
        }
        shot_errors = 0; shot_state = 1;
        saved_cache.shown_page = ~0U;
    } else if (what == 2 || what == 6) {               /* freeze: when no band waits / now */
        if (!on) return -1;
        if (shot_state != 3) { shot_state = what == 2 ? 2 : 3; if (shot_state == 3) memcpy(shot_frozen_info, shot_info, SHOT_INFO); }
    } else if (what == 5) {                            /* off */
        shot_free();
    } else if (what == 7) {                            /* a freeze that was asked for is taken back */
        if (shot_state == 2) shot_state = 1;
    } else if (what == 3) {                            /* the frozen picture from pixel `offset`: bytes (length << 5) | colour, length 1 to 7; length 0: the next byte is the length - 1. A run ends with its band (the colours are the band's) */
        if (!on || shot_state != 3) return -1;
        unsigned n = 0;
        while (offset < SHOT_BYTES && n + 2U <= 60U) {
            unsigned v = shot_get(offset), run = 1, end = (offset / SHOT_BAND + 1U) * SHOT_BAND;
            while (offset + run < end && run < 256U && shot_get(offset + run) == v) ++run;
            if (run < 8U) out[n++] = (uint8_t)((run << 5) | v);
            else { out[n++] = (uint8_t)v; out[n++] = (uint8_t)(run - 1U); }
            offset += run;
        }
        return (int)n;
    } else if (what == 4) {                            /* the colours of band `offset`, RGB565 low byte first */
        if (!on || offset >= PAINT_BANDS) return -1;
        const struct shot_store *st = shot[offset];
        for (unsigned i = 0; i < st->colors; ++i) { out[2 * i] = (uint8_t)st->color[i]; out[2 * i + 1] = (uint8_t)(st->color[i] >> 8); }
        return 2 * st->colors;
    } else if (what == 9) {                            /* the eight tracks' levels: the device's own project; the simulator is given the same before its pictures are compared */
        for (unsigned t = 0; t < 8; ++t) { struct groove_view v; groove_get_view(t, cursor, &v); out[t] = v.volume; }
        return 8;
    } else if (what == 8) {                            /* how large a single block the heap gives now, in units of 256 bytes (tried from 64 KB down; nothing is kept) */
        unsigned got = 0;
        for (unsigned size = 65536U; size >= 1024U && !got; size -= size > 8192U ? 4096U : 1024U) { void *p = malloc(size); if (p) { free(p); got = size; } }
        out[0] = (uint8_t)(got >> 8); out[1] = (uint8_t)(got >> 16);
        return 2;
    } else if (what) return -1;
    out[0] = shot_state; out[1] = (uint8_t)(on ? PAINT_BANDS : 0); out[2] = (uint8_t)shot_errors; out[3] = (uint8_t)(shot_errors >> 8);
    memcpy(out + 4, shot_state == 3 ? shot_frozen_info : shot_info, SHOT_INFO);
    return 4 + SHOT_INFO;
}
static void draw(const struct fm1_ble_status *ble)
{
    unsigned visible = glo_down && glo_used ? MIX : page;
    frame_time = fm1_millis();
    if (boot_active) {
        boot_phase = (frame_time - boot_started) / 120U;
        if (boot_phase > 8) boot_phase = 8;
    }
    if (notice && (int32_t)(frame_time - notice_until) >= 0) notice = NULL;
    for (unsigned t = 0; t < 8; ++t) {
        unsigned n = groove_midi_activity(t);
        if (n != midi_seen[t]) { midi_seen[t] = n; midi_until[t] = frame_time + 120U; }
        midi_active[t] = (int32_t)(midi_until[t] - frame_time) > 0;
    }
    (void)ble; /* Task 06 (a): no page shows the BLE status any more */
    /* Bands consume stable names; rasterizing a split row never stops audio.
     * The eighth byte stays NUL in this static buffer. Failed sources show ERROR. */
    unsigned song_mutes = 0;   /* Task 17 Goal 4: a muted track's song notes stay in (song_mute_set) */
    for (unsigned t = 0; t < GROOVE_TRACKS; ++t) {
        groove_get_view(t, cursor, &frame_views[t]);
        /* a track unmuted on the MIX page is unmuted altogether: the two mutes never part the other way round */
        if (track_muted(t) && groove_track_role(t) != GROOVE_TRACK_OFF && !frame_views[t].muted) song_mute_bits &= (uint8_t)~(1U << t);
        if (track_muted(t)) song_mutes |= 1U << t;
        if (visible == OVERVIEW && frame_views[t].type == GROOVE_DX7 && !groove_fm_copy(t, frame_patch, NULL))
            memcpy(frame_fm_names[t], frame_patch + 145, 7);
    }
    song_mute_set(song_mutes);
    { unsigned quiet = 0;   /* tabby-v1.2.1: internal sounds that cannot be heard are not rendered for the song (app/midi_router.c) */
      for (unsigned t = 0; t < GROOVE_TRACKS && t < 8; ++t) if (frame_views[t].muted || !frame_views[t].audible) quiet |= 1U << t;
      groove_midi_song_quiet(quiet); }
    if (visible == EFFECTS) {
        groove_effects_get(frame_effects);
        if (!effects_page) {
            uint8_t sends[2]; groove_sends_get(track, sends);
            frame_effects[0] = (uint8_t)((sends[0] * 100U + 7U) / 15U);
            frame_effects[1] = (uint8_t)((sends[1] * 100U + 7U) / 15U);
            frame_effects[2] = frame_views[track].volume;
        }
    }
    memset(frame_patch, 0, sizeof frame_patch);
    memset(&frame_controls, 0, sizeof frame_controls);
    if (visible == FM_QUICK)
        groove_fm_copy(track, frame_patch, &frame_controls);
    /* Merge new damage with unfinished bands. Input can replace a pending
     * frame; no stale queue of old encoder positions needs to be displayed. */
    paint_priority = 0;
    cache = &saved_cache;
    if (shot_state == 1 || shot_state == 2) shot_note(boot_active ? STARTUP : visible);
    /* tabby-v1.1: a message box that shrinks or leaves uncovers the page: draw the page again */
    { const char *say = banner_text(); char line[4][14]; unsigned n = say ? banner_wrap(say, line) : 0;
      if (n < banner_lines) saved_cache.shown_page = ~0U;
      banner_lines = n; }
    draw_page(&frame_ble);
}
/* Task 13 Step 1: the last band's paint time (24 MHz ticks), the estimate for the next band, and
 * when a band last went out (the starvation guard). */
static uint32_t band_ticks_last = 24000U, band_sent_ms;
/* tabby-v1.2: what each band took when it was last painted. With large text the bands differ more (an empty band
 * 0.6 ms, a band of scale 3 text 2.5 ms): the wait before a due MIDI event counts the band's own time, not only
 * the time of whichever band went before it. */
static uint32_t band_cost[PAINT_BANDS];
static void paint_flush(void)
{
    uint32_t started = fm1_millis();
    uint32_t diag_start = ct_diag_ticks(); unsigned diag_bands = 0;   /* Task 11B: paint timing */
    paint_rendering = 1;
    cache = &band_cache;
    for (unsigned visited = 0; visited < PAINT_BANDS; ++visited) {
        int pending = fm1_screen_pending();
        if (pending) {
            if (pending < 0) saved_cache.shown_page = ~0U;
            break;
        }
        unsigned band = paint_next;
        /* Task 13 Step 1: over the budget only the starvation guard's band goes, and it goes in
         * plain rotation: a page that marks the same priority band on every compose would
         * otherwise take every guard band and never finish the rest of the picture. */
        unsigned starving = ct_pass_over(band_ticks_last);
        /* Fresh knob/key feedback goes ahead of the rest of a page repaint.
         * Rotate within that set so continuous motion cannot starve its text. */
        /* tabby-v1.2: every second band goes in plain rotation, whatever is fresh. On HOME the level meters mark their
         * bands on every compose while a song plays; served first every time, they left a band of the page before
         * (after a page change) unpainted for seconds: found by the screen copy: the name row still showed pieces of
         * CLIPS 2.4 s after PATCH. */
        static unsigned paint_turn;
        if (paint_priority && !starving && (++paint_turn & 1U))
            for (unsigned i = 0; i < PAINT_BANDS; ++i) {
                unsigned candidate = (paint_next + i) % PAINT_BANDS;
                if (paint_priority & (1U << candidate)) { band = candidate; break; }
            }
        unsigned left = paint_left[band], width = paint_right[band] - left;
        if (left >= paint_right[band]) { paint_next = (band + 1U) % PAINT_BANDS; continue; }
        /* Task 13 Step 1: start this band only if it still fits in the pass budget. A band that
         * does not fit waits for the next pass (paint_next stays on it); one band per
         * CT_PASS_STARVE_MS always goes, so a pass that is always late still repaints. */
        if (starving && fm1_millis() - band_sent_ms < CT_PASS_STARVE_MS) {
            ct_pass_defer(CT_DEFER_BAND);
            break;
        }
#ifdef CT_A2
        /* Task 17 (F + G): a band cannot be interrupted, so one that would run over a MIDI event's due time
         * (the last band's time plus 1.5 ms for an audio interrupt in between) waits for the pass after the
         * event; the same starvation guard as above. Measured before this: eight lines on ACTIONS 4.1 to
         * 4.5 ms, the late notes being the ones that met a band (BUILD 36.6). */
        /* tabby-v1.2.1: ... and no band waits for ever. A pass is asked for just before an event is due, so a band
         * that takes long (a title row at scale 3) found an event due at every pass, while short bands (the meters of
         * HOME) went through and kept `band_sent_ms` fresh: the long band of the page before stayed on the screen
         * (seen twice in the device's own pixels, 2.4 s after the page change). Its own waiting time bounds it now. */
        if (ct_midi_due_within((band_cost[band] > band_ticks_last ? band_cost[band] : band_ticks_last) + 36000U) && fm1_millis() - band_sent_ms < CT_PASS_STARVE_MS
            && fm1_millis() - paint_since[band] < 4U * CT_PASS_STARVE_MS) {
            ct_pass_defer(CT_DEFER_BAND);
            break;
        }
#endif
        paint_next = (band + 1U) % PAINT_BANDS;
        uint32_t band_start = ct_diag_ticks();
        paint_top = band * PAINT_ROWS;
        paint_x = left;
        paint_end = left + width;
        /* draw_page_body invalidates the entire cache once on a new page. */
        cache->shown_page = ~0U;
        draw_page(&frame_ble);
        /* Rasterize directly into the tightly packed DMA rectangle. */
        if (shot_state == 1 || shot_state == 2) shot_band(left, paint_top, width);   /* before the submit: it swaps the bytes in place */
        if (fm1_screen_submit(left, paint_top, width, PAINT_ROWS,
                            paint_pixels, width * PAINT_ROWS)) {
            saved_cache.shown_page = ~0U; /* Retry the whole page after a transport error. */
            if ((shot_state == 1 || shot_state == 2) && shot_errors < 65535U) ++shot_errors;   /* the copy is ahead of the LCD until the retry */
            break;
        }
        paint_left[band] = FM1_SCREEN_WIDTH;
        paint_right[band] = 0;
        paint_priority &= ~(1U << band);
        ++diag_bands;
        band_ticks_last = ct_diag_ticks() - band_start;
        band_cost[band] = band_ticks_last;
        band_sent_ms = fm1_millis();
        /* Task 13 Step 1: notes the audio thread queued while this band was composed go out now,
         * not at the next pass (the router flush is cheap when lane 0 is empty). */
        ct_midi_flush();
        /* The DMA borrows paint_pixels. The next iteration/poll must observe
         * completion before composing another band into that same buffer. */
        if (fm1_millis() - started >= 4U) break;
    }
    paint_rendering = 0;
    cache = &saved_cache;
    if (shot_state == 2 && !fm1_screen_pending()) {    /* freeze when the picture is whole: no band waits */
        unsigned waiting = 0;
        for (unsigned b = 0; b < PAINT_BANDS; ++b) waiting |= paint_left[b] < paint_right[b];
        if (!waiting) { shot_state = 3; memcpy(shot_frozen_info, shot_info, SHOT_INFO); }
    }
    ct_diag_paint(ct_diag_ticks() - diag_start, diag_bands);
}
static int release_keys_except(uint32_t keep)
{
    for (unsigned key = 0; key < 27; ++key)
        if (key_note[key] != 0xff && !(keep & (1U << key))) {
            if (!post((uint8_t)(0x80 + groove_midi_input_channel(key_track[key])), key_note[key], 0, 3))
                return 0;
            key_note[key] = 0xff;
            project_keys &= ~(1U << key);
        }
    return 1;
}
static int release_keys(void) { return release_keys_except(0); }
/* HOME and the list load immediately, including over unsaved edits.
 * Selecting a preset replaces the workspace without writing a project slot. */
static int preset_load(unsigned start, uint32_t now)
{
    project_result = groove_project_load_slot(preset_slot);
    if (project_result) { page = PRESET_BROWSER; return project_result; }
    unsigned channels = 0; uint32_t keep = 0;
    for (unsigned t = 0; t < GROOVE_TRACKS; ++t)
        if (groove_track_role(t) == GROOVE_TRACK_PLAY) channels |= 1U << groove_midi_input_channel(t);
    for (unsigned key = 0; key < 27; ++key)
        if (key_note[key] != 0xff && (channels & (1U << groove_midi_input_channel(key_track[key]))))
            keep |= 1U << key;
    /* A physical key can feed Normal and Play together. The project has
     * retired Normal voices; retain its original pitch until key release. */
    if (!release_keys_except(keep)) return -1;
    project_keys = keep;
    blocked_keys |= previous_keys & ~keep;
    preset_loaded = 1;
    preset_project_revision = groove_project_revision();
    preset_current_slot = preset_slot;
    cursor = drum = 0; step_follow = 1;
    memset(drum_parts, 0, sizeof drum_parts);
    selected_note = groove_pad_count(track) ? groove_pad_note(track, 0) : 60;
    page = music_page = OVERVIEW;
    announce(start ? "PRESET LOADED - PLAYING" : "LOADED - SEQ PLAY STARTS", now + 2000U);
    if (start) {
        struct groove_view view; groove_get_view(track, cursor, &view);
        /* A live Play session keeps its transport during project replacement.
         * Sending Start again would rewind that clock and restart its ARP. */
        if (!view.playing && !post(0xfa, 0, 0, 1)) return -1;
    }
    return 0;
}
void groove_screen_init(void)
{
    smk37_controls_reset();
    track = cursor = drum = page = 0;
    music_page = subpage_return = project_return = OVERVIEW;
    selected_note = 60;
    step_follow = 1;
    transport_seen = 0;
    notice = NULL;
    octave = 0;
    instrument_track[0]=0; instrument_track[1]=7;
    instrument_octave[0]=instrument_octave[1]=0; pad_focus=0;
    source_preview = action = action_confirm = tone_clip_ready = 0;
    seq_page = arp_page = 0;
    shift_visible = 0;
    panel_modes_seen = 0; fader_feedback_seen = 0;
    memset(midi_seen, 0, sizeof midi_seen);
    memset(midi_until, 0, sizeof midi_until);
    previous_buttons = previous_keys = blocked_keys = retry_reset = 0;
    glo_down = glo_used = ble_was_linked = 0;
    source_result = 0;
    struct fm1_engine_stats health;
    fm1_engine_stats_read(&health);
    health_output = groove_midi_dropped();
    health_at = fm1_millis(); health_underruns = health.underruns; health_dropped = health.midi_dropped;
    struct fm1_audio_stats dma;
    fm1_audio_stats_read(&dma);
    health_dma = dma.overruns; health_adapted = 0;
    project_result = 0;
    project_reload = project_operation = 0;
    project_slot = name_cursor = 0;
    preset_slot = preset_loaded = 0;
    preset_current_slot = 0;
    seq_down = 0;
    arp_down = arp_long = 0;
    song_select = song_row_page = 0;
    memset(project_stored, 0, sizeof project_stored);
    cache->shown_page = ~0U;
    led_cache = button_led_cache = 0;
    memset(key_note, 0xff, sizeof key_note); project_keys = 0;
    memset(drum_parts, 0, sizeof drum_parts);
    memset(paint_left, FM1_SCREEN_WIDTH, sizeof paint_left);
    memset(paint_right, 0, sizeof paint_right);
    paint_next = paint_rendering = paint_priority = 0;
    memset(encoder_direction, 0, sizeof encoder_direction);
    memset(encoder_speed, 0, sizeof encoder_speed);
    fm1_controls_init();
    for (unsigned key = 0; key < 41; ++key) fm1_led_set(key, 0);
    fm1_screen_init();
    boot_started = fm1_millis();
    boot_active = 1;
    struct fm1_ble_status ble = {0};
    fm1_ble_get_status(&ble);
    draw(&ble);
    paint_flush();
    frame_ms = fm1_millis();
}
static void select_track(int delta)
{
    unsigned before = track;
    track = (unsigned)clamp((int)track + delta, 0, 7);
    unsigned type = groove_source_type(track), pads = groove_pad_count(track);
    /* Only PAD / STEP changes instrument focus. Selecting the Pad track with
     * KEY may audition the same sound, but must not reassign Pad or pin KEY. */
    /* The DX7 quick page has no counterpart for other sources (Task 03 b). */
    if (page == FM_QUICK && type != GROOVE_DX7) page = music_page;
    if (before != track) {
        if(track!=instrument_track[pad_focus]) {
            instrument_track[pad_focus]=(uint8_t)track;
            groove_settings_panel_changed();
        }
        cursor %= groove_sequence_length(track);
        cache->middle_cache = ~0U; source_result = 0;
        drum = drum_parts[track] < pads ? drum_parts[track] : 0;
        if (!pads && groove_pad_count(before)) selected_note = 60;
    }
    if (pads) {
        drum %= pads;
        selected_note = groove_pad_note(track, drum);
    }
}
void groove_screen_tap(uint32_t now)
{
    int bpm = groove_tempo_tap(now);
    announce(bpm < 0 ? "TAP: EXTERNAL MIDI CLOCK" : bpm ? "TAP TEMPO APPLIED" : "TAP AGAIN / PATCH+SEQ", now + 1500U);
}
/* Keep modal editors out of the common key/transport control frame. */
static int apply_controls(const struct fm1_controls *controls, uint32_t now,
                          const struct fm1_ble_status *ble)
{
    (void)ble; /* Task 06 (a): the BLE page is gone */
    uint32_t pressed = controls->buttons & ~previous_buttons;
    uint32_t old_keys = previous_keys, key_down = controls->keys & ~old_keys;
    unsigned play_handled = 0;
    previous_buttons = controls->buttons;
    previous_keys = controls->keys;
    blocked_keys &= controls->keys;
    /* tabby-v1.2.1 (the user's answer of 2026-11-20): any press on the panel takes the message box away at once: a
     * button, a knob, and now a pad or a key too. What the press itself has to say comes after this line. */
    if (pressed || key_down || encoder_active(controls->encoders)) notice = NULL;
#ifdef CT_A2
    /* tabby-v1.3: the worst-lateness record names the last panel action (app/midi_router.c) */
    if (pressed) ct_late_panel(1, (unsigned)__builtin_ctz(pressed));
    else if (key_down) ct_late_panel(3, (unsigned)__builtin_ctz(key_down));
    else if (encoder_active(controls->encoders)) ct_late_panel(4, 0);
#endif
    if (retry_reset) {
        blocked_keys = controls->keys;
        if (!post(0xff, 0, 0, 1))
            return 0;
        retry_reset = 0;
        memset(key_note, 0xff, sizeof key_note); project_keys = 0;
    }
    unsigned old_page = page, old_mode = navigation_mode();
    unsigned arp_tap = arp_down && !(controls->buttons & BUTTON(ARP)) && !arp_long;
    if (!(controls->buttons & BUTTON(ARP))) arp_down = arp_long = 0;
    if (pressed & BUTTON(ARP)) {
        arp_down = 1; arp_long = 0; arp_ms = now;
    }
    if (!(controls->buttons & BUTTON(SEQ))) seq_down = 0;
    if (pressed & BUTTON(SEQ)) {
        seq_down = 1; seq_ms = now;
    }
    if (page == OVERVIEW || page == STEPS) music_page = page;
    /* Task 12 A2: REC (step and live recording, the REC+K1 seek) left with the step editor;
     * REC only says so (handled below). */
    /* Emergency stop has the same meaning in every modal page. */
    if ((controls->buttons & (BUTTON(HOME) | BUTTON(PLAY))) ==
            (BUTTON(HOME) | BUTTON(PLAY)) && (pressed & (BUTTON(HOME) | BUTTON(PLAY)))) {
        blocked_keys |= controls->keys;
        if (!post(0xff, 0, 0, 1)) return 0;
        memset(key_note, 0xff, sizeof key_note); project_keys = 0;
        page = music_page = OVERVIEW;
        glo_down = glo_used = project_reload = 0;
        arp_down = arp_long = seq_down = 0;
        return 1;
    }
    /* A project received over MIDI can replace the current instrument while
     * its editor is open. Leave editors that cannot apply to the new source. */
    if ((controls->buttons & (BUTTON(HOME) | BUTTON(SAVE))) == (BUTTON(HOME) | BUTTON(SAVE)) &&
        (pressed & (BUTTON(HOME) | BUTTON(SAVE)))) {
        int r = groove_edit_undo();
        announce(r ? "NOTHING TO UNDO" : "UNDO / REDO APPLIED", now + 2000U);   /* Task 12 A2: no REC to stop */
        page = music_page;
        goto controls_done;
    }
    /* Task 12 A2: HOME+SEQ taps tempo on every page; SEQ alone always opens SYNC / MIDI (it
     * used to tap on EFFECTS 3/3 too). */
    if ((pressed & BUTTON(SEQ)) && (controls->buttons & BUTTON(HOME))) {
        groove_screen_tap(now);
        seq_down = 0;
        if (controls->buttons & BUTTON(HOME)) page = music_page;
        goto controls_done;
    }
    /* Keep the original HOME+PRESETS shortcut, including after HOME opens
     * the browser. A source replacement still requires an explicit SAVE. */
    if ((controls->buttons & BUTTON(HOME)) && controls->encoders[6] &&
        !(controls->buttons & BUTTON(PLAY))) {
        source_preview = (unsigned)((int)groove_source_type(track) +
            controls->encoders[6] % SOURCE_CHOICES + SOURCE_CHOICES) % SOURCE_CHOICES;
        page = SOURCE; source_result = 0;
        goto controls_done;
    }
    if ((controls->buttons & (BUTTON(SEQ) | BUTTON(EDIT))) == (BUTTON(SEQ) | BUTTON(EDIT)) &&
        (pressed & (BUTTON(SEQ) | BUTTON(EDIT)))) {
        if (!release_keys()) return 0;
        blocked_keys |= controls->keys;
        page = ACTIONS; action_confirm = 0; seq_down = 0;
        goto controls_done;
    }
    if (seq_down && page == STEPS && now - seq_ms >= 600U) {
        page = ACTIONS; action_confirm = 0; seq_down = 0;
        goto controls_done;
    }
    if (arp_down && !arp_long && now - arp_ms >= 600U) {
        arp_long = 1; if (page != ARP_EDIT) arp_page = 0; page = ARP_EDIT;
        goto controls_done;
    }
    /* Panel shortcuts precede modal editors. A menu must not swallow a
     * navigation key, transport control or the release of a held gesture. */
    if (glo_down && !(controls->buttons & BUTTON(GLO))) {
        unsigned tapped = !glo_used && now - glo_ms < 600U;
        glo_down = 0;
        blocked_keys |= controls->keys;
        if (tapped) page = page == MIX ? music_page : MIX;
    }
    /* Goal 6 (docs/CONTROL-MAP.md 12): EDIT on the CLIPS page opens the STEP page on the track's selected clip (or the
     * one it plays). One clip can be unsaved at a time: with another one unsaved the page opens on that one. */
    if (page == TRACK_LAUNCH && (pressed & BUTTON(EDIT))) {
        struct song_status st; song_status_read(&st);
        unsigned place = clip_select[track] < SONG_CLIPS ? clip_select[track] : song_row_place(track, st.track_row[track]);
        int r = place < SONG_CLIPS ? song_edit_open(track, place) : SONG_EMPTY;
        /* tabby-v04.10: on a selected empty pad EDIT makes a new clip (one master cycle long) and opens it */
        if (r == SONG_EMPTY && place < SONG_CLIPS && st.song == song_select) { r = song_clip_new(track, place); if (!r) announce("NEW CLIP", now + 1500U); }
        if (r == SONG_BUSY) { announce(busy_text(), now + 2500U); r = 0; }
        if (r == SONG_EDIT_SHARED) announce("CLIP SHARED BY ANOTHER TRACK", now + 2000U);
        else if (r) announce(r == SONG_EMPTY ? "SELECT A CLIP FIRST" : "BLOCK READ ERROR", now + 2000U);
        else { page = CLIP_STEPS; step_bar = 0; step_sel = 255; step_cursor = 0; step_pads_toggle = groove_pad_count(track) != 0; cache->shown_page = ~0U; }
        goto controls_done;
    }
    /* tabby-v04.23 (docs/CONTROL-MAP.md 3.2): the step loop lasts as long as its pad is down, on whatever page. */
    if (loop_pad != 255 && (!(controls->keys & (1U << white_keys[loop_pad])) || !song_step_looping())) {
        (void)song_step_loop(0); loop_pad = 255;
        announce("STEP LOOP OFF", now + 1000U);
    }
    /* tabby-v04.22 (docs/CONTROL-MAP.md 3.1): NOTE REPEAT held and K1 turned: the repeat's rate (the ARP rate of the
     * repeating tracks). Nothing else reads the knobs in that pass. */
    if (smk37_note_repeat() && controls->encoders[2]) {
        for (unsigned t = 0; t < 8; ++t) if (smk37_note_repeat() & (1U << t)) groove_arp_edit(t, 0, controls->encoders[2]);
        smk37_screen_note_repeat(smk37_note_repeat());
        goto controls_done;
    }
    if (remote_action_do) { remote_action_do = 0; if (page == ACTIONS && action == ACT_NEW_SONG) pressed |= BUTTON(SAVE); }
    /* tabby-v04.21 (docs/CONTROL-MAP.md 13): while a take runs FX is the clear button: held, a key that is played takes
     * its notes out of the clip as the clip passes them (the MC-707's ERASE). FX does nothing else during a take. */
    if (song_record_erase((controls->buttons >> FX) & 1U) && (pressed & BUTTON(FX))) {
        announce("HOLD FX + A KEY: CLEARS ITS NOTES", now + 2000U);
        pressed &= ~BUTTON(FX);
    }
    /* tabby-v04.16 (docs/CONTROL-MAP.md 5): on SCENES, stopped: FX twice within two seconds takes the selected scene
     * (the reserved one, else scene 1) out of the song; EDIT held with K1 moves it (below). */
    if (page == SONG && (pressed & (BUTTON(FX) | BUTTON(EDIT)))) {
        static uint32_t asked_at; static uint8_t asked_row, asked;
        struct song_status st; song_status_read(&st);
        unsigned row = song_scene_reserved();
        if (st.song != song_select) announce("NO SONG", now + 1500U);
        else if (st.playing) announce("STOP THE SONG FIRST", now + 2000U);
        else if (pressed & BUTTON(EDIT)) announce("PARA + K1 - MOVES A SCENE", now + 2000U);
        else if (!asked || asked_row != row || now - asked_at > 2000U) {
            static char ask[] = "FX AGAIN DELETES SCENE 000";
            asked = 1; asked_row = (uint8_t)row; asked_at = now;
            ask[23] = (char)('0' + (row + 1U) / 100); ask[24] = (char)('0' + (row + 1U) / 10 % 10); ask[25] = (char)('0' + (row + 1U) % 10);
            announce(ask, now + 2000U);
        } else {
            asked = 0;
            int r = song_scene_delete(row);
            announce(r == SONG_EMPTY ? "THE LAST SCENE STAYS" : r == SONG_EDIT_SHARED ? "KEPT - IT SETS A CLIP'S LENGTH" : r ? "NOT DELETED" : "SCENE DELETED - SAVE THE SONG", now + 2000U);
        }
        cache->shown_page = ~0U;
        goto controls_done;
    }
    /* tabby-v04.10 (docs/CONTROL-MAP.md 14): FX on the CLIPS page opens CLIP SETTING on the track's selected clip (or
     * the one it plays); without a clip the page shows the song's settings alone. */
    if (page == TRACK_LAUNCH && (pressed & BUTTON(FX))) {
        struct song_status st; song_status_read(&st);
        unsigned place = clip_select[track] < SONG_CLIPS ? clip_select[track] : song_row_place(track, st.track_row[track]);
        int r = place < SONG_CLIPS && st.song == song_select ? song_edit_open(track, place) : SONG_EMPTY;
        if (r == SONG_BUSY) announce(busy_text(), now + 2500U);
        else if (r == SONG_EDIT_SHARED) announce("CLIP SHARED BY ANOTHER TRACK", now + 2000U);
        setup_open(place);
        goto controls_done;
    }
    if (page == CLIP_SETUP) {
        play_handled = 1;
        if (pressed & (BUTTON(FX) | BUTTON(EDIT))) { page = TRACK_LAUNCH; goto controls_done; }
        if (pressed & BUTTON(HOME)) { page = music_page = OVERVIEW; goto controls_done; }
        int move = controls->encoders[0] + !!(pressed & BUTTON(OCT_UP)) - !!(pressed & BUTTON(OCT_DOWN));
        if (move) { setup_row = (uint8_t)clamp((int)setup_row + move, 0, SETUP_ROWS - 1); cache->middle_cache = ~0U; }
        int d = controls->encoders[2] + 16 * controls->encoders[3];
        if (d) { const char *m = setup_edit(d); if (m) announce(m, now + 2000U); cache->middle_cache = ~0U; }
        if (pressed & BUTTON(SAVE)) { announce(setup_do(), now + 2000U); cache->middle_cache = ~0U; }
        if (pressed & BUTTON(PLAY)) {
            struct song_status st; song_status_read(&st);
            if (st.playing) song_stop();
            else {
                int r = song_play();
                if (r) announce(r == SONG_EMPTY ? "NO SONG - UPLOAD FROM WORKBENCH" : "SONG CANNOT START", now + 2000U);
                else { struct groove_view view; groove_get_view(track, cursor, &view);
                       if (view.playing && !post(0xfc, 0, 0, 1)) return 0; }
            }
        }
        goto controls_done;
    }
    if (page == CLIP_STEPS) {
        play_handled = 1;
        struct song_edit_info ei; song_edit_info(&ei);
        if (!ei.active) { page = TRACK_LAUNCH; goto controls_done; }
        unsigned bars = (ei.steps + 15U) / 16U;
        int paging = !!(pressed & BUTTON(OCT_UP)) - !!(pressed & BUTTON(OCT_DOWN)) + controls->encoders[1];
        if (paging && smk37_shift() && !controls->encoders[1]) {   /* tabby-v04.21: KNOB BANK + OCTAVE-/+ shifts the clip by a step */
            int r = song_edit_shift(paging);
            announce(r == SONG_BUSY ? "NOT DURING A TAKE" : r ? "NO NOTES TO SHIFT" : paging > 0 ? "CLIP SHIFTED ONE STEP LATER" : "CLIP SHIFTED ONE STEP EARLIER", now + 1500U);
            paging = 0; step_cursor = 0; cache->middle_cache = ~0U;
        }
        if (paging) { unsigned was = step_bar; step_bar = (uint8_t)clamp((int)step_bar + paging, 0, (int)bars - 1); if (was != step_bar) step_sel = 255; }
        if (pressed & BUTTON(EDIT)) { page = TRACK_LAUNCH; goto controls_done; }
        /* tabby-v04.9.1: HOME leaves to the overview, as the control map says; the clip stays open (v04.8 and v04.9 took no
         * notice of HOME here while a clip was open: found by the device tests) */
        if (pressed & BUTTON(HOME)) { page = music_page = OVERVIEW; goto controls_done; }
        if (pressed & BUTTON(REC)) {   /* docs/CONTROL-MAP.md 13: a take into this clip; SHIFT + REC: input quantize */
            if (smk37_shift()) { song_record_quantize(!ei.quantize); announce(ei.quantize ? "INPUT QUANTIZE OFF" : "INPUT QUANTIZE ON", now + 1500U); }
            else if (ei.recording) { song_record_stop(); announce("REC STOPPED", now + 1500U); }
            else { int r = song_record_start(); announce(r == REC_ON_NOW || r == REC_ARMED_NOW ? (song_playing() ? "REC WHEN THE CLIP LOOPS" : "REC ARMED - SEQ PLAY: GO") : "CANNOT RECORD HERE", now + 2000U); }
            cache->middle_cache = ~0U;
        }
        if (pressed & BUTTON(SCL)) { step_pads_toggle = !step_pads_toggle; announce(step_pads_toggle ? "PADS TOGGLE THE NOTE" : "PADS SELECT A STEP", now + 1500U); }
        if (pressed & BUTTON(FX)) {
            unsigned re = smk37_shift(); int r = re ? song_edit_redo() : song_edit_undo();
            announce(r ? (re ? "NOTHING TO REDO" : "NOTHING TO UNDO") : re ? "REDO" : "UNDO", now + 1500U);
        }
        if (pressed & BUTTON(LFO)) { song_edit_discard(); announce("EDITS DISCARDED", now + 2000U); page = TRACK_LAUNCH; goto controls_done; }
        if (pressed & BUTTON(ENV)) {
            if (step_sel == 255) announce("SELECT A STEP FIRST", now + 1500U);
            else announce(song_edit_step_clear(step_sel) ? "STEP IS EMPTY" : "STEP CLEARED", now + 1500U);
            step_cursor = 0;
        }
        if (pressed & BUTTON(SAVE)) {
            unsigned had = song_unsaved(); int r = song_edit_save();
            announce(r == SONG_BUSY ? "STOP TO SAVE" : r == SONG_FULL ? "SONG STORAGE FULL" : r ? "SAVE FAILED" : had ? "SAVED" : "NOTHING TO SAVE", now + 2000U);
        }
        for (unsigned i = 0; i < 16; ++i)
            if ((key_down & ~blocked_keys) & (1U << white_keys[i])) {
                unsigned step = step_bar * 16U + i;
                if (step >= ei.steps) { announce("PAST THE CLIP'S END", now + 1500U); continue; }
                if (step_pads_toggle) {
                    int r = song_edit_note_toggle(step, step_pitch, step_velocity, step_length);
                    step_sel = (uint8_t)step; step_cursor = 0;
                    announce(r == SONG_FULL ? "CLIP FULL" : r == 1 ? "NOTE ON THE STEP" : r == 0 ? "NOTE OFF THE STEP" : "CANNOT ENTER", now + 1200U);
                } else { step_sel = step_sel == step ? 255 : (uint8_t)step; step_cursor = 0; cache->middle_cache = ~0U; }
            }
        if (controls->encoders[0]) { step_pitch = (uint8_t)clamp((int)step_pitch + controls->encoders[0], 0, 127); cache->middle_cache = ~0U; }
        if (step_sel != 255) {
            const uint8_t *clip = song_edit_clip();
            unsigned n = clip ? clip_v3_step_notes(clip, step_sel, NULL, 0) : 0;
            if (controls->encoders[2] && n) { step_cursor = (uint8_t)clamp((int)step_cursor + controls->encoders[2], 0, (int)(n > 6 ? 6 : n) - 1); cache->middle_cache = ~0U; }
            if (step_cursor >= n) step_cursor = 0;
            if (controls->encoders[3]) (void)song_edit_note_adjust(step_sel, step_cursor, 0, controls->encoders[3]);
            if (controls->encoders[4]) (void)song_edit_note_adjust(step_sel, step_cursor, 1, controls->encoders[4] * 10);
            if (controls->encoders[5]) (void)song_edit_note_adjust(step_sel, step_cursor, 2, controls->encoders[5] * 60);
            if (controls->encoders[6] && song_edit_note_adjust(step_sel, 0, 3, controls->encoders[6]) == SONG_FULL) announce("CLIP FULL", now + 1500U);
        }
        if (pressed & BUTTON(PLAY)) {
            struct song_status st; song_status_read(&st);
            if (st.playing) song_stop();
            else {
                int r = song_play();
                if (r) announce(r == SONG_EMPTY ? "NO SONG - UPLOAD FROM WORKBENCH" : "SONG CANNOT START", now + 2000U);
                else { struct groove_view view; groove_get_view(track, cursor, &view);
                       if (view.playing && !post(0xfc, 0, 0, 1)) return 0; }
            }
        }
        goto controls_done;
    }
    /* Task 06 (c): on the song pages SCL switches SONG and TRACK LAUNCH, ENV sends the
     * selected track back to the song at the next bar, SHIFT+ENV (LFO) every track. */
    if ((page == SONG || page == TRACK_LAUNCH) && (pressed & (BUTTON(SCL) | BUTTON(ENV) | BUTTON(LFO)))) {
        if (pressed & BUTTON(SCL)) { page = page == SONG ? TRACK_LAUNCH : SONG; cache->shown_page = ~0U; }
        else if (pressed & BUTTON(LFO)) { song_track_attach_all(); announce("ALL TO SCENES AT CYCLE", now + 1500U); }
        else { announce(song_track_attach(track) ? "NOT PLAYING" : "TO SCENES AT CYCLE", now + 1500U); }
        goto controls_done;
    }
    if (pressed & (BUTTON(HOME) | BUTTON(SEQ) | BUTTON(FX) | BUTTON(SCL) |
                   BUTTON(EDIT) | BUTTON(ENV) | BUTTON(LFO))) {
        glo_down = glo_used = 0;
        if (pressed & BUTTON(HOME)) {
            if (page == ACTIONS && action_confirm) action_confirm = 0;
            else if (page == OVERVIEW) {
                preset_refresh(); project_result = 0; page = PRESET_BROWSER;
            } else page = OVERVIEW;
        } else if (pressed & BUTTON(SEQ)) {
            page = STEPS; seq_page = SEQ_SYNC; cache->shown_page = ~0U;   /* Task 12 A2: SYNC / MIDI */
        } else if (pressed & BUTTON(FX)) {
            if (page != EFFECTS) effects_page = 0;
            open_subpage(EFFECTS);
        } else if ((pressed & BUTTON(EDIT)) && groove_source_type(track) == GROOVE_DX7) {
            /* Classic Tabby (Task 03 b): EDIT toggles the DX7 quick page (preset
             * select and the ALG / FEEDBACK / TRANSPOSE / LEVEL macros). Holding
             * EDIT no longer opens the operator editor. */
            page = page == FM_QUICK ? music_page : FM_QUICK;
        } else {
            /* EDIT on other sources, SCL, ENV and LFO opened the removed operator
             * and tone editor pages. Say where editing went instead. */
            announce("VOICE EDIT MOVED TO WORKBENCH", now + 2000U);
        }
        goto controls_done;
    }
    if (arp_tap) {
        if (!release_keys()) return 0;
        blocked_keys |= controls->keys;
        groove_arp_set(track, !groove_arp_enabled(track));
        announce(groove_arp_enabled(track) ? "ARP ON / HOLD ARP FOR SETTINGS" : "ARP OFF / LIVE KEYS", now + 2000U);
    }
    if (pressed & BUTTON(REC)) {
        /* Goal 6 (docs/CONTROL-MAP.md 13): REC on the CLIPS and STEP pages records into the track's clip: the one open on
         * the STEP page, else the selected one, else the one the track plays. SHIFT + REC switches input quantize.
         * Elsewhere REC says where it works. */
        glo_down = 0;
        struct song_edit_info ei; song_edit_info(&ei);
        if (page == SONG) { announce("SEQ REC + PAD - NEW SCENE", now + 2000U); }   /* tabby-v1.4: on SCENES, SEQ REC held with an empty pad stores a scene */
        else if (page != TRACK_LAUNCH && page != CLIP_STEPS) announce("SEQ REC: ON THE CLIPS OR STEP PAGE", now + 2000U);
        else if (smk37_shift()) { song_record_quantize(!ei.quantize); announce(ei.quantize ? "INPUT QUANTIZE OFF" : "INPUT QUANTIZE ON", now + 1500U); }
        else if (ei.recording) { song_record_stop(); announce("REC STOPPED", now + 1500U); }
        else {
            int r = 0;
            if (page == TRACK_LAUNCH) {
                struct song_status st; song_status_read(&st);
                unsigned place = clip_select[track] < SONG_CLIPS ? clip_select[track] : song_row_place(track, st.track_row[track]);
                r = place < SONG_CLIPS ? song_edit_open(track, place) : SONG_EMPTY;
                /* tabby-v04.10: REC on a selected empty pad records a new clip, one master cycle long */
                if (r == SONG_EMPTY && place < SONG_CLIPS && st.song == song_select) r = song_clip_new(track, place);
            }
            if (!r) r = song_record_start();
            announce(r == REC_ON_NOW ? "RECORDING" : r == REC_ARMED_NOW ? (song_playing() ? "REC WHEN THE CLIP LOOPS" : "REC ARMED - SEQ PLAY: GO")
                     : r == SONG_BUSY ? busy_text() : r == SONG_EDIT_SHARED ? "CLIP SHARED BY ANOTHER TRACK" : r == SONG_EMPTY ? "SELECT A CLIP FIRST" : "CANNOT RECORD HERE", now + 2000U);
        }
        cache->middle_cache = ~0U;
        goto controls_done;
    }
    if (page != ACTIONS)
        {
            int next=clamp(octave + !!(pressed & BUTTON(OCT_UP)) - !!(pressed & BUTTON(OCT_DOWN)), -2, 2);
            if(next!=octave) {octave=next;groove_settings_panel_changed();}
        }
    if ((pressed & BUTTON(SAVE)) && (page == TRACK_LAUNCH || page == SONG)) {
        /* tabby-v04.10: on CLIPS and SCENES the 4th left button saves the song: the unsaved clip and what was changed
         * in the song on the device (stopped only) */
        unsigned had = song_unsaved(); int r = song_edit_save();
        announce(r == SONG_BUSY ? "STOP TO SAVE" : r == SONG_FULL ? "SONG STORAGE FULL" : r ? "SAVE FAILED" : had ? "SAVED" : "NOTHING TO SAVE", now + 2000U);
        goto controls_done;
    }
    if ((pressed & BUTTON(SAVE)) && page != PROJECT &&
        page != SOURCE && page != ACTIONS) {
        project_return = page; page = PROJECT; project_result = 0;
        project_reload = project_operation = 0;
        project_slot = groove_project_slot(); name_cursor = 0;
        glo_down = 0; project_refresh();
        goto controls_done;
    }
    if (pressed & BUTTON(GLO)) {
        glo_down = 1; glo_used = 0; glo_ms = now; blocked_keys |= old_keys;
    }
    if (glo_down || page == MIX) {
        if (glo_down && (now - glo_ms >= 600U || key_down || encoder_active(controls->encoders)))
            glo_used = 1;
        select_track(controls->encoders[0]);
        for (unsigned i = 0; i < 4; ++i)
            if (controls->encoders[2 + i])
                groove_control_edit((track & ~3U) + i, 0, controls->encoders[2 + i], 0);
        for (unsigned i = 0; i < 16; ++i)
            if ((key_down & ~blocked_keys) & (1U << white_keys[i]))
                groove_mix_toggle(i & 7U, i >= 8);
        goto controls_done;
    }
    if (page == OVERVIEW && !glo_down && controls->encoders[6]) {
        int current = preset_loaded ? (int)preset_current_slot : controls->encoders[6] > 0 ? -1 : GROOVE_PROJECT_SLOTS;
        unsigned slot = (unsigned)clamp(current + controls->encoders[6],
                                        0, GROOVE_PROJECT_SLOTS - 1);
        if (!preset_loaded || slot != preset_current_slot) {
            struct groove_view view; groove_get_view(track, cursor, &view);
            preset_slot = slot; preset_refresh();
            preset_load(view.playing, now);
        }
        goto controls_done;
    }
    if (page == PRESET_BROWSER) {
        play_handled = 1;
        int delta = controls->encoders[0] + controls->encoders[6];
        unsigned slot = (unsigned)clamp((int)preset_slot + delta, 0, GROOVE_PROJECT_SLOTS - 1);
        unsigned load = 0, start = 0;
        for (unsigned i = 0; i < 16; ++i)
            if ((key_down & ~blocked_keys) & (1U << white_keys[i])) {
                struct groove_view view; groove_get_view(track, cursor, &view);
                slot = i; load = 1; start = view.playing;
            }
        if (slot != preset_slot) {
            preset_slot = slot; project_result = 0;
            preset_refresh();
            struct groove_view view; groove_get_view(track, cursor, &view);
            load = 1; start = view.playing;
        }
        if (pressed & BUTTON(PLAY)) { load = 1; start = 1; }
        if (load) {
            preset_load(start, now);
            if (!(pressed & BUTTON(PLAY)) && !key_down) page = PRESET_BROWSER;
        }
        goto controls_done;
    }
    if (page == SONG) {
        /* Task 03 d: song mode owns PLAY here. K5 / K7 (firmware SELECT / PRESETS) select the song (stopped
         * only), pads queue a row jump, OCT pages the pads, K4 toggles the jump mode. */
        play_handled = 1;
        struct song_status st; song_status_read(&st);
        int delta = controls->encoders[0] + controls->encoders[6];
        if (delta && !st.playing) {
            song_select = (unsigned)clamp((int)song_select + delta, 0, SONG_SONGS - 1);
            memset(clip_select, SONG_NONE, sizeof clip_select); clip_bank = 0;   /* another song: no clip of it is selected yet */
            int r = song_load(song_select);
            if (r == SONG_EMPTY) notice = NULL;
        }
        int paging = !!(pressed & BUTTON(OCT_UP)) - !!(pressed & BUTTON(OCT_DOWN));
        if (paging) song_row_page = (unsigned)clamp((int)song_row_page + paging, 0, SONG_ROWS / 16 - 1);
        if (controls->encoders[5]) song_jump_mode_set(controls->encoders[5] > 0);
        /* tabby-v04.12 (docs/CONTROL-MAP.md 18): the scene chain: K1 how many times the scene plays (its length), K2
         * what follows it, K3 holds the chain. They work on the scene that plays; stopped, on the reserved scene. */
        { unsigned er = st.playing ? st.row : song_scene_reserved();
          if (controls->encoders[2] && st.song == song_select && (controls->buttons & BUTTON(EDIT))) {   /* tabby-v04.16: EDIT + K1 moves the scene */
              int r = song_scene_move(er, controls->encoders[2]);
              if (r >= 0) song_row_page = (unsigned)r / 16U;
              announce(r == SONG_BUSY ? "STOP THE SONG FIRST" : r == SONG_EDIT_SHARED ? "NOT MOVED: SETS A CLIP'S LENGTH" : r < 0 ? "NOT MOVED" : "SCENE MOVED - SAVE THE SONG", now + 2000U);
              cache->shown_page = ~0U;
          } else
          if (controls->encoders[2] && st.song == song_select) (void)song_scene_edit(er, 0, controls->encoders[2]);
          if (controls->encoders[3] && st.song == song_select) (void)song_scene_edit(er, 1, controls->encoders[3]);
          if (controls->encoders[4]) { song_scene_hold_set(controls->encoders[4] > 0); announce(song_scene_hold() ? "CHAIN HELD - SCENE REPEATS" : "CHAIN RUNS", now + 1500U); } }
        for (unsigned i = 0; i < 16; ++i)
            if ((key_down & ~blocked_keys) & (1U << white_keys[i])) {
                const struct song_record *rec = song_current();
                /* tabby-v04.10: an empty scene pad stores what plays now as a new scene (an existing scene is never
                 * written over). tabby-v1.4 (the user's order of 2026-11-22, after a scene that nobody stored): no longer
                 * by holding the pad half a second, which one pad that reads as held can do by itself, but by SEQ REC held
                 * and the pad pressed: two controls at once. The pad alone says how. */
                if (rec && st.song == song_select && st.playing && song_row_page * 16U + i >= rec->rows) {
                    if (controls->buttons & BUTTON(REC)) {
                        int r = song_scene_store();
                        announce(r >= 0 ? "STORED AS A NEW SCENE" : r == SONG_FULL ? "128 SCENES: NO ROOM" : "SEQ PLAY FIRST", now + 2000U);
                        if (r >= 0) song_row_page = (unsigned)r / 16U;
                    } else announce("SEQ REC + PAD - NEW SCENE", now + 2000U);
                    continue;
                }
                { int jr = song_queue_jump(song_row_page * 16U + i);
                  if (!st.playing && jr >= 0) announce(jr ? "TAKEN BACK - FROM SCENE 1" : "RESERVED FOR SEQ PLAY", now + 1500U);
                  else if (jr) announce("NO SUCH SCENE / NOT PLAYING", now + 1500U); }
            }
        if (pressed & BUTTON(PLAY)) {
            if (st.playing) song_stop();
            else {
                if (song_loaded() != song_select) (void)song_load(song_select);
                int r = song_play();
                if (r == SONG_EMPTY) announce("NO SONG - UPLOAD FROM WORKBENCH", now + 2000U);
                else if (r == SONG_INVALID) announce("SONG CANNOT START", now + 2000U);
                else if (r) announce("SONG STORAGE BUSY", now + 2000U);
                else { struct groove_view view; groove_get_view(track, cursor, &view);
                       if (view.playing && !post(0xfc, 0, 0, 1)) return 0; } /* stock patterns stop */
            }
        }
        goto controls_done;
    }
    if (page == TRACK_LAUNCH) {
        /* Task 17 Goal 4 (docs/CONTROL-MAP.md 4): a pad queues its clip for the selected track (the playing clip queues a
         * stop, a queued pad takes its queue back) and selects it; held half a second it stays selected and what the
         * press queued is taken back. K5 selects the track, OCT / K6 the pad bank; PLAY as on the SCENES page. */
        play_handled = 1;
        struct song_status st; song_status_read(&st);
        const struct song_model *mdl = song_model_current();
        if (controls->encoders[0]) select_track(controls->encoders[0]);
        int paging = !!(pressed & BUTTON(OCT_UP)) - !!(pressed & BUTTON(OCT_DOWN)) + controls->encoders[1];
        if (paging) clip_bank = (unsigned)clamp((int)clip_bank + paging, 0, SONG_CLIPS / 16 - 1);
        /* tabby-v04.13 (docs/CONTROL-MAP.md 19): K1 to K4 send controllers 74, 71, 1 and 11 on the selected track, two
         * per click; a take records them (thinned). Each track keeps its four values while the power is on. */
        for (unsigned kb = 0; kb < 4; ++kb)
            if (controls->encoders[2 + kb]) {
                static const uint8_t first[4] = {64, 64, 0, 127};
                static uint8_t value[8][4], set[8];
                uint8_t cc[4]; for (unsigned q = 0; q < 4; ++q) cc[q] = (uint8_t)song_setting(SONG_SET_KNOB1 + q);   /* tabby-v04.14: the song's controller numbers */
                if (!set[track]) { memcpy(value[track], first, 4); set[track] = 1; }
                int v = clamp((int)value[track][kb] + 2 * controls->encoders[2 + kb], 0, 127);
                if (v != value[track][kb]) { value[track][kb] = (uint8_t)v; (void)smk37_send_controller(track, cc[kb], (unsigned)v); }
                memcpy(control_notice, "K1 CONTROLLER 000 = 000", 24);
                control_notice[1] = (char)('1' + kb);
                control_notice[14] = (char)('0' + cc[kb] / 100); control_notice[15] = (char)('0' + cc[kb] / 10 % 10); control_notice[16] = (char)('0' + cc[kb] % 10);
                control_notice[20] = (char)('0' + v / 100); control_notice[21] = (char)('0' + v / 10 % 10); control_notice[22] = (char)('0' + v % 10);
                announce(control_notice, now + 1200U);
            }
        unsigned queue = (st.track_state[track] >> 2) & 3U, playing_place = song_row_place(track, st.track_row[track]);
        unsigned queued_place = queue == SONG_QUEUE_LAUNCH ? song_row_place(track, st.track_queued[track]) : SONG_NONE;
        /* tabby-v04.23 (docs/CONTROL-MAP.md 3.2): NOTE REPEAT held: pads 9 to 12 loop the last 1, 2, 4 or 8 steps of every
         * track that plays, for as long as the pad is down; no pad launches anything meanwhile. */
        if (smk37_note_repeat_down() && (key_down & ~blocked_keys)) {
            for (unsigned i = 8; i < 12; ++i)
                if ((key_down & ~blocked_keys) & (1U << white_keys[i])) {
                    static char say[] = "STEP LOOP: LAST 0 STEPS";
                    int r = song_step_loop(1U << (i - 8U));
                    say[16] = (char)('0' + (1U << (i - 8U)));
                    if (!r) loop_pad = (uint8_t)i;
                    announce(r == SONG_BUSY ? "NOT DURING A TAKE" : r ? "STEP LOOP - PLAY FIRST" : say, now + 60000U);
                }
            if (loop_pad == 255 && !notice) announce("STEP LOOP - NOTE REPEAT + PAD 9-12", now + 1500U);
            blocked_keys |= controls->keys;
            goto controls_done;
        }
        for (unsigned i = 0; i < 16; ++i)
            if ((key_down & ~blocked_keys) & (1U << white_keys[i])) {
                unsigned place = clip_bank * 16U + i;
                if (st.song != song_select || !mdl) { announce("NO SONG HERE", now + 1500U); continue; }
                if (!mdl->clip[track][place]) {   /* tabby-v04.10: an empty pad is selected: REC or EDIT makes a clip there */
                    clip_select[track] = (uint8_t)place; cache->middle_cache = ~0U;
                    announce("EMPTY PAD - REC OR PARA", now + 2000U); continue;
                }
                clip_select[track] = (uint8_t)place; cache->middle_cache = ~0U;
                clip_hold_pad = (uint8_t)i; clip_hold_ms = now; clip_hold_queued = 0; clip_hold_track = (uint8_t)track;
                if ((queue == SONG_QUEUE_LAUNCH && (queued_place == place || playing_place == place)) || (queue == SONG_QUEUE_STOP && playing_place == place)) {
                    if (!song_track_unqueue(track)) announce("TAKEN BACK", now + 1500U);
                } else if (playing_place == place) {
                    if (!song_track_stop(track)) { clip_hold_queued = 1; announce("STOP AT NEXT CYCLE", now + 1500U); }
                } else if (!song_clip_launch(track, place)) { clip_hold_queued = 1; announce(st.playing ? "LAUNCH AT NEXT CYCLE" : "RESERVED FOR SEQ PLAY", now + 1500U); }
                else announce("BLOCK READ ERROR", now + 1500U);
            }
        if (clip_hold_pad != 255) {
            if (!(controls->keys & (1U << white_keys[clip_hold_pad]))) clip_hold_pad = 255;
            else if (now - clip_hold_ms >= 500U) {
                if (clip_hold_queued && !song_track_unqueue(clip_hold_track)) announce("SELECTED ONLY - TAKEN BACK", now + 1500U);
                clip_hold_pad = 255;
            }
        }
        if (pressed & BUTTON(PLAY)) {
            if (st.playing) song_stop();
            else {
                if (song_loaded() != song_select) (void)song_load(song_select);
                int r = song_play();
                if (r == SONG_EMPTY) announce("NO SONG - UPLOAD FROM WORKBENCH", now + 2000U);
                else if (r == SONG_INVALID) announce("SONG CANNOT START", now + 2000U);
                else if (r) announce("SONG STORAGE BUSY", now + 2000U);
                else { struct groove_view view; groove_get_view(track, cursor, &view);
                       if (view.playing && !post(0xfc, 0, 0, 1)) return 0; }
            }
        }
        goto controls_done;
    }
    if (page == SOURCE) {
        unsigned before_preview = source_preview;
        int delta = controls->encoders[0] + controls->encoders[1] + controls->encoders[2] + controls->encoders[6];
        source_preview = (unsigned)((int)source_preview + delta % SOURCE_CHOICES + SOURCE_CHOICES) % SOURCE_CHOICES;
        for (unsigned i = 0; i < GROOVE_SOURCES; ++i)
            if ((key_down & ~blocked_keys) & (1U << white_keys[i])) source_preview = i;
        if (source_preview != before_preview) source_result = 0;
        if (controls->encoders[3]) {
            blocked_keys |= controls->keys; if (!release_keys()) return 0;
            source_result = groove_settings_track(track,0,controls->encoders[3]);
        }
        if ((pressed & BUTTON(SAVE)) && groove_track_role(track) != GROOVE_TRACK_OFF) {
            source_result = groove_source_set(track, source_preview);
            if (!source_result) {
                drum_parts[track] = drum = 0;
                selected_note = groove_pad_count(track) ? groove_pad_note(track, 0) : 60;
                page = music_page;
                announce("SOUND SOURCE APPLIED", now + 1500U);
            }
        }
        goto controls_done;
    }
    if (page == ACTIONS) {
        /* Task 12 A2: no step cursor here any more; K1 / SELECT choose the entry. */
        if (controls->encoders[0] || controls->encoders[2]) {
            action = (unsigned)clamp((int)action + controls->encoders[0] + controls->encoders[2], 0, ACTION_COUNT - 1);
            action_confirm = 0;
        }
        if (pressed & BUTTON(SAVE)) {
            int r = 0;
            /* Task 12 A1: ERASE OLD DATA asks first, as COMPACT does; PASTE TIMBRE too. */
            unsigned destructive = action == ACT_PASTE_TIMBRE || action == ACT_ERASE_OLD || action == ACT_COMPACT || action == ACT_NEW_SONG;
            if (destructive && !action_confirm) { action_confirm = 1; goto controls_done; }
            action_confirm = 0;
            /* Task 12 A3: no flash write while the transport runs. */
            if ((action == ACT_ERASE_OLD || action == ACT_COMPACT) && ct_transport_running()) {
                announce("STOP TO ERASE / COMPACT", now + 2000U);
                cache->middle_cache = ~0U;
                goto controls_done;
            }
            if (action == ACT_COPY_TIMBRE) { r = groove_timbre_export(track, (uint8_t *)&tone_clip, sizeof tone_clip); tone_clip_ready = !r; }
            else if (action == ACT_PASTE_TIMBRE) r = tone_clip_ready ? groove_timbre_import(track, (uint8_t *)&tone_clip, sizeof tone_clip) : -1;
            else if (action == ACT_ERASE_OLD) {
                /* Task 03 a: user-confirmed erase of the old-data sectors so the region can be
                 * song storage (app/song_storage.c). */
                r = song_storage_initialize();
            } else if (action == ACT_SONG_MODE) {
                page = SONG;
                if (song_loaded() == SONG_NONE) (void)song_load(song_select);
            } else if (action == ACT_COMPACT) {
                /* Task 03 d: full compaction pass, one block sector per poll (9.6). */
                r = song_storage_compact();
            } else if (action == ACT_NEW_SONG) {
                /* tabby-v04.21: an empty song in the slot selected on SCENES, if it is empty; then the CLIPS page */
                int e = song_new(song_select);
                announce(e == SONG_BUSY ? "STOP THE SONG FIRST" : e == SONG_NEW_EXISTS ? "SLOT HOLDS A SONG - K5 ON SCENES" : e ? "SONG STORAGE NOT READY" : "NEW SONG - HOLD A PAD, SEQ REC", now + 3000U);
                if (!e) { memset(clip_select, SONG_NONE, sizeof clip_select); clip_bank = 0; page = TRACK_LAUNCH; }
                cache->middle_cache = ~0U; cache->shown_page = ~0U;
                goto controls_done;
            } else if (action == ACT_SEND_SETUP) {
                /* Task 04 (9.11): send row 1's events now, for a set or after power-up. */
                int e = song_send_setup();
                announce(e == SONG_BUSY ? "STOP THE SONG FIRST" : e ? "NO SONG LOADED" : "SETUP SENT - ROW 1 EVENTS", now + 2000U);
                cache->middle_cache = ~0U;
                goto controls_done;
            }
#ifdef CT_A2
            else if (action == ACT_A2) {
                /* Task 15 Step 4: switch A2 (RAM only; a power cycle is off again). */
                ct_a2_set(!ct_a2_get());
                announce(ct_a2_get() ? "A2 ON - PASS ON DEMAND" : "A2 OFF - 10 MS PASSES", now + 2000U);
                cache->middle_cache = ~0U;
                goto controls_done;
            }
#endif
            else {
                if (!post(0xff, 0, 0, 1)) return 0;
                memset(key_note, 0xff, sizeof key_note); project_keys = 0; page = OVERVIEW;
            }
            announce(r ? "NOT POSSIBLE HERE" : action == ACT_COPY_TIMBRE ? "TIMBRE COPIED" : "DONE", now + 2000U);
            cache->middle_cache = ~0U;
        }
        goto controls_done;
    }
    if (page == PROJECT) {
        if (old_page == PROJECT) {
            if (controls->encoders[0] || controls->encoders[6]) {
                project_slot = (unsigned)clamp((int)project_slot + controls->encoders[0] + controls->encoders[6], 0, GROOVE_PROJECT_SLOTS - 1);
                project_reload = project_operation = 0;
                project_refresh();
            }
            name_cursor = (unsigned)clamp((int)name_cursor + controls->encoders[2], 0, 11);
            if (controls->encoders[3]) {
                char name[13];
                groove_project_name(name);
                groove_project_rename(name_cursor, edit_character(name[name_cursor], controls->encoders[3]));
                project_reload = 0;
            }
            if (pressed & BUTTON(SAVE)) {
                unsigned overwrite = project_slot != groove_project_slot() && !project_stored_result;
                project_reload = overwrite && !project_reload ? 2 : 0;
                project_result = 0;
                if (!project_reload) {
                    project_operation = 3;
                    draw(ble);
                    paint_next = 180U / PAINT_ROWS;
                    paint_flush();
                    project_result = groove_project_save_slot(project_slot);
                    project_operation = 1;
                    project_refresh();
                }
            }
        }
        if (!project_result && !project_reload && project_operation == 1) {
            page = project_return;
            if (page == PRESET_BROWSER) preset_refresh();
            announce("PROJECT SAVED", now + 2000U);
            project_operation = 0;
        }
    } else {
        {
            unsigned tracks = page == OVERVIEW || page == STEPS || page == FM_QUICK || page == ARP_EDIT ||
                page == EFFECTS;
            select_track(tracks ? controls->encoders[0] : 0);
            {
                if (page == OVERVIEW && (controls->encoders[1] || controls->encoders[3])) {
                    /* Type and timbre are separate controls. Finish old note-offs
                     * before replacing the instance; held keys wait for release. */
                    blocked_keys |= controls->keys;
                    if (!release_keys())
                        return 0;
                    int type = (int)groove_source_type(track);
                    type = (type + (controls->encoders[1] + controls->encoders[3]) % GROOVE_SOURCES + GROOVE_SOURCES) %
                           GROOVE_SOURCES;
                    source_preview = (unsigned)type;
                    source_result = 0;
                    page = SOURCE;
                    cache->shown_page = ~0U;
                    goto controls_done;
                }
                if (page == STEPS && seq_page == SEQ_SYNC) {
                    /* Task 12 A2: SYNC / MIDI. K1 CLOCK, K2 CLK IN, K3 SWING, K4 SEQ OUT, PRESETS KEY OUT;
                     * the same setting calls the removed 3/7, 5/7 and 7/7 used. */
                    if (controls->encoders[2]) groove_settings_clock(controls->encoders[2] > 0
                        ? GROOVE_CLOCK_MIDI : GROOVE_CLOCK_INTERNAL);
                    groove_settings_midi(track, 6, controls->encoders[3]);
                    groove_sequence_setting_edit(0, controls->encoders[4]);
                    static const uint8_t outputs[2] = {9, 4}, limits[2] = {2, 1};
                    const int deltas[2] = {controls->encoders[5], controls->encoders[6]};
                    for (unsigned i = 0; i < 2; ++i) if (deltas[i]) {
                        unsigned old = groove_midi_setting(track, outputs[i]);
                        if ((deltas[i] < 0 && !old) || (deltas[i] > 0 && old == limits[i])) continue;
                        groove_settings_midi(track, outputs[i], deltas[i]);
                        announce(i ? "KEY OUTPUT UPDATED" : "SEQ OUTPUT UPDATED", now + 1500U);
                    }
                } else if (page == STEPS) {
                    /* MIDI TRACK (SHIFT+SEQ): K1 IN CH, K2 OUT CH, K3 SEQ, K4 OUT PORT for the selected track. */
                    for (unsigned i = 0; i < 4; ++i) if (controls->encoders[2+i]) {
                        int r = 0;
                        unsigned parameter = seq_midi_parameters[i];
                        int delta = controls->encoders[2+i];
                        unsigned old = parameter == 10 ? groove_midi_input_channel(track) : groove_midi_setting(track,parameter);
                        if ((delta < 0 && !old) || (delta > 0 && old == seq_midi_limits[i])) continue;
                        if (parameter == 2) delta = delta > 0 ? 7 : -7;
                        if (parameter == 10) {
                            blocked_keys |= controls->keys; if (!release_keys()) return 0;
                            r=groove_settings_track(track,1,delta);
                        }
                        else groove_settings_midi(track,parameter,delta);
                        announce(r ? "TRACK SETTING FAILED" : parameter == 0 ? "SEQ OUTPUT UPDATED" : "MIDI SET - NOTES RELEASED", now + 1500U);
                    }
                }
                if (page == ARP_EDIT) {
                    arp_page = (unsigned)clamp((int)arp_page + controls->encoders[1], 0, 1);
                    for (unsigned i = 0; i < 4; ++i) if (controls->encoders[2 + i]) {
                        if (arp_page && i == 3) {
                            groove_settings_midi(track, 1, controls->encoders[2 + i]);
                            announce("MIDI SET - NOTES RELEASED", now + 1500U);
                        } else if (arp_page) { if (i < 2) groove_arp_edit(track, i + 4, controls->encoders[2 + i]); }
                        else if (groove_pad_count(track) && i >= 2) {
                            announce("NOT FOR DRUMS - RANGE / GATE", now + 2000U);
                        } else groove_arp_edit(track, i, controls->encoders[2 + i]);
                    }
                } else if (page == FM_QUICK) {
                    static const uint8_t parameters[] = {134, 135, 144};
                    for (unsigned i = 0; i < 3; ++i) groove_fm_edit(track, parameters[i], controls->encoders[2 + i]);
                    groove_control_edit(track, controls->encoders[6] + controls->encoders[1] * 32, controls->encoders[5], 0);
                } else if (page == EFFECTS) {
                    unsigned next = (unsigned)clamp((int)effects_page + controls->encoders[1] + controls->encoders[6], 0, 2);
                    if (next != effects_page) { effects_page = next; cache->shown_page = ~0U; }
                    if (effects_page == 2) {
                        groove_effects_edit(4, controls->encoders[2]);
                        groove_effects_edit(1, controls->encoders[3]);
                        groove_tempo_edit(controls->encoders[4]);
                        groove_effects_edit(2, controls->encoders[5]);
                    } else if (effects_page) {
                        for (unsigned i = 0; i < 4; ++i)
                            groove_effects_edit(i, controls->encoders[2 + i]);
                    } else {
                        for (unsigned i = 0; i < 2; ++i)
                            groove_sends_edit(track, i, controls->encoders[2 + i]);
                        groove_control_edit(track, 0, controls->encoders[4], 0);
                        groove_effects_edit(3, controls->encoders[5]);
                    }
                } else if (page != STEPS) {
                    /* Task 12 A2: HOME K3 (the step cursor) and the STEPS note edit are gone. */
                    if (page == OVERVIEW) {
                    } else if (groove_pad_count(track) != 0) {
                        drum = (unsigned)clamp((int)drum + controls->encoders[4], 0,
                                               (int)groove_pad_count(track) - 1);
                        selected_note = groove_pad_note(track, drum);
                    }
                    if (controls->encoders[2])
                        groove_control_edit(track, 0, controls->encoders[2], 0);
                    if (controls->encoders[5]) {
                        groove_tempo_edit(controls->encoders[5]);
                        if (groove_clock_mode() == GROOVE_CLOCK_MIDI) {
                            announce("EXT CLOCK - INT FOR BPM", now + 2000U);
                        }
                    }
                }
                if (controls->encoders[6] && page != FM_QUICK && page != ARP_EDIT && page != STEPS && page != EFFECTS)
                    groove_control_edit(track, controls->encoders[6], 0, 0);
                if (controls->encoders[1] && page != FM_QUICK && page != STEPS && page != ARP_EDIT && page != EFFECTS) {
                    if (groove_source_type(track) == GROOVE_DX7)
                        groove_fm_edit(track, 134, fm_encoder_delta(1, controls->encoders[1]));
                    else
                        groove_control_edit(track, 0, 0, controls->encoders[1]);
                }
            }
        }
    }
controls_done:
    if (page != old_page) {
        glo_down = glo_used = action_confirm = project_reload = 0;
        if (page != STEPS) seq_down = 0;
    }
    if (page != old_page && page != ARP_EDIT) arp_down = arp_long = 0;
    if ((pressed & BUTTON(PLAY)) && !play_handled) {
        struct groove_view view;
        groove_get_view(track, cursor, &view);
        uint8_t command = view.playing ? 0xfc : 0xfb;   /* Task 12 A2: no count-in start (0xfa) */
        if (song_playing()) song_stop(); /* Task 03 d: PLAY anywhere stops a playing song */
        else if (!post(command, 0, 0, 1)) return 0;
    }
    unsigned mode = navigation_mode();
    if (mode != old_mode || page != old_page) {
        blocked_keys |= old_keys;
        if (!release_keys())
            return 0;
    }
    if (retry_reset) {
        blocked_keys |= controls->keys;
        if (!post(0xff, 0, 0, 1))
            return 0;
        retry_reset = 0;
        memset(key_note, 0xff, sizeof key_note); project_keys = 0;
    }
    uint32_t keys = controls->keys & ~blocked_keys;
    for (unsigned key = 0; key < 27; ++key) {
        /* Unused keys have no pitch to map or release on this control poll. */
        if (key_note[key] == 0xff && !(keys & (1U << key))) continue;
        unsigned note = groove_key_note(track, key, octave);
        if (key_note[key] != 0xff &&
            (mode || !(keys & (1U << key)) ||
             (key_note[key] != note && !(project_keys & (1U << key))) || key_track[key] != track)) {
            if (!post((uint8_t)(0x80 + groove_midi_input_channel(key_track[key])), key_note[key], 0, 3))
                return 0;
            key_note[key] = 0xff;
            project_keys &= ~(1U << key);
        }
        if (!mode && note < 128 && (keys & (1U << key)) && key_note[key] == 0xff) {
            if (!post((uint8_t)(0x90 + groove_midi_input_channel(track)), (uint8_t)note, 100, 3))
                return 0;
            key_note[key] = (uint8_t)note;
            key_track[key] = (uint8_t)track;
            selected_note = note;
            if (groove_pad_count(track) != 0)
                drum = (unsigned)groove_pad_index(track, note);

        }
    }
    if (groove_pad_count(track)) drum_parts[track] = (uint8_t)drum;
    return 1;
}

/* Task 11B: the whole screen control call is timed; the body is groove_screen_control_body.
 * Task 12 A4: in every build, and it is the SCREEN section of the loop profile. */
static void groove_screen_control_body(void);
void groove_screen_control(void)
{
    uint32_t t = ct_diag_ticks();
    ct_prof_enter(CT_PROF_SCREEN);
    groove_screen_control_body();
    ct_prof_leave();
    ct_diag_screen(ct_diag_ticks() - t);
    ct_pass_busy_end();   /* Task 13: the last app hook of the pass has ended */
}
static void groove_screen_control_body(void)
{
    struct fm1_controls controls;
    fm1_controls_read(&controls);
    if (shift_visible != smk37_shift()) {
        shift_visible = smk37_shift();
        saved_cache.shown_page = ~0U;
    }
    uint32_t now = fm1_millis(), key_down = controls.keys & ~previous_keys;
    if (song_edit_poll()) announce("SAVED", now + 2000U);   /* Goal 6: an unsaved clip, ten seconds after the song stopped */
    { struct song_edit_info ei; song_edit_info(&ei);
      if (rec_lamp == 1 && ei.recording == 2) announce("RECORDING", now + 1500U);
      else if (rec_lamp == 2 && !ei.recording && !song_record_full_seen()) announce("REC STOPPED", now + 1500U);
      rec_lamp = ei.recording;
      if (song_record_disarmed()) announce("SONG STOPPED - REC OFF", now + 2000U);   /* tabby-v04.16 */
      /* SPEC 14.2: the cap stops the take: the message for 2 s, the REC lamp out, the clip's pad red once */
      if (song_record_full()) { announce("CLIP FULL - REC STOPPED", now + 2000U); rec_full_until = now + 400U; rec_full_seen = 1; } }
    if (notice && (int32_t)(now - notice_until) >= 0) notice = NULL;
    /* Task 03 a: first boot on the song-storage layout with V01 data still in the region. */
    static unsigned migration_seen;
    if (!migration_seen && song_storage_state() == SONG_STORAGE_OLD_DATA) {
        migration_seen = 1;
        announce("OLD DATA - SEE ACTIONS", now + 6000U);   /* Task 12 A1 */
    }
    unsigned modes = smk37_fader_bank() | (smk37_pad_steps() << 1);
    if (modes != panel_modes_seen) {
        announce((modes ^ panel_modes_seen) & 2U
            ? modes & 2U ? "PAD STEP MODE" : "PAD PLAY MODE"
            : modes & 1U ? "FADER 5-8 - MOVE TO MATCH" : "FADER 1-4 - MOVE TO MATCH", now + 1800U); panel_modes_seen = modes;
    }
    uint32_t feedback = smk37_fader_feedback();
    if (feedback != fader_feedback_seen && (feedback & (1U << 23))) {
        unsigned value = (feedback >> 5) & 127U, target = (feedback >> 12) & 127U;
        const char *action = feedback & (1U << 19) ? value < target ? "UP TO " : "DOWN TO "
            : feedback & (1U << 20) ? "LEVEL " : "MIDI OUT ";
        memcpy(control_notice, "F1 T1 ", 6);
        control_notice[1] = (char)('1' + (feedback & 3U));
        control_notice[4] = (char)('1' + ((feedback >> 2) & 7U));
        strcpy(control_notice + 6, action);
        decimal(control_notice + strlen(control_notice), feedback & (1U << 19) ? target : value, 1);
        announce(control_notice, now + 1600U);
    }
    fader_feedback_seen = feedback;
    unsigned master_changed = groove_master_update(controls.knob);
    if (master_changed && (!notice || notice == master_notice || (int32_t)(now - notice_until) >= 0)) {
        unsigned level = fm1_engine_output_level();
        if (level) {
            memcpy(master_notice, "MASTER ", 7);
            decimal(master_notice + 7, (int)((level * 100U + 63U) / 127U), 1);
            memcpy(master_notice + strlen(master_notice), " / 100", sizeof " / 100");
        }
        else memcpy(master_notice, "MASTER MUTED", sizeof "MASTER MUTED");
        announce(master_notice, now + 1200U);
    }
    if (now - health_at >= 500U) {
        struct fm1_engine_stats health;
        fm1_engine_stats_read(&health);
        struct fm1_render_stats audio;
        groove_audio_stats(&audio);
        struct fm1_audio_stats dma;
        fm1_audio_stats_read(&dma);
        unsigned adapted = audio.adapted;
        if (health.underruns != health_underruns || dma.overruns != health_dma) {
            announce("AUDIO OVERLOAD - REDUCE VOICES", now + 2500U);
        } else if (health.midi_dropped != health_dropped) {
            announce("MIDI FULL - NOTES RESET", now + 2500U);
        } else if (groove_midi_dropped() != health_output) {
            announce("MIDI OUT FULL - NOTES RESET", now + 2500U);
        } else if (adapted > health_adapted) {
            /* tabby-v1.2: no message box. With eight parts on the internal sounds the guard takes voices back about
             * once a second for as long as the song plays (125 times in every 125 s of every Wrong Room soak since
             * tabby-v1.0): the box stood for the whole song, over the top line (seen in the device's own screen
             * pictures). It is the guard doing its work, with nothing lost: CPU! in the top line while it does. */
            cpu_guard_until = now + 2000U;
        }
        health_output = groove_midi_dropped();
        health_adapted = adapted;
        health_dma = dma.overruns;
        health_at = now; health_underruns = health.underruns; health_dropped = health.midi_dropped;
    }
    unsigned input_changed = master_changed || controls.buttons != previous_buttons || controls.keys != previous_keys ||
                             encoder_active(controls.encoders);
    /* The logo never blocks control/audio or consumes the first gesture.
     * Ignore the initial MASTER ADC pickup when deciding whether to skip. */
    if (boot_active && (now - boot_started >= 1200U || controls.buttons || controls.keys ||
        encoder_active(controls.encoders) || (master_changed && now - boot_started >= 150U))) {
        boot_active = 0;
        input_changed = 1;
    }
    struct fm1_ble_status ble = {0};
    fm1_ble_get_status(&ble);
    unsigned linked = ble.state == FM1_BLE_CONNECTED || ble.state == FM1_BLE_READY ||
                      ble.state == FM1_BLE_DISCOVERING;
    if (ble_was_linked && !linked)
        retry_reset = 1;
    ble_was_linked = linked;
    struct groove_view transport;
    groove_get_view(track, cursor, &transport);
    cursor %= transport.sequence_length;
    if (transport.playing && !transport_seen) step_follow = 1;
    if (!transport.playing && transport_seen && step_follow)
        cursor = transport.play_step;
    transport_seen = transport.playing;
    unsigned old_page = page;
    unsigned boundary =
        controls.buttons != previous_buttons || controls.encoders[0] || controls.encoders[6];
    if (page == OVERVIEW || page == STEPS || glo_down)
        boundary |= key_down != 0;
    if (boundary) {
        if (glo_down && !(controls.buttons & BUTTON(GLO))) {
            /* The encoder count includes motion before this release. Route
             * that motion through the held layer before closing it. */
            struct fm1_controls prior = controls;
            prior.keys = previous_keys;
            prior.buttons = previous_buttons;
            for (unsigned i = 0; i < 7; ++i) {
                controls.encoders[i] = 0;
            }
            if (encoder_active(prior.encoders) && !apply_controls(&prior, now, &ble))
                return;
        }
    }
    read_encoders(&controls, now, boundary);
    if (!apply_controls(&controls, now, &ble))
        return;
    /* Input changes do not wait for the animation timer. LCD work is bounded
     * separately and continues on later polls, even between animation frames. */
    if (now - frame_ms >= 33U || page != old_page || input_changed || saved_cache.shown_page == ~0U) {
        /* Task 13 Step 1: the compose walks the whole page; once this pass is over its budget it
         * waits for a later pass (frame_ms stays, so the next pass asks again). Input is never
         * lost by this: apply_controls above already ran; only the picture is late. The guard
         * keeps the delay under 2 x CT_PASS_STARVE_MS past the 33 ms frame. */
        /* tabby-v1.2: nor does it start when a MIDI event is due before it would end (its own last time plus 1.5 ms,
         * as for a band): a page that changes with the song (a new scene on SCENES) is composed at the very moment
         * the scene's first notes are due. The same bound on the delay. */
        static uint32_t compose_ticks = 24000U;
        unsigned wait = ct_pass_over(0);
#ifdef CT_A2
        wait |= ct_midi_due_within(compose_ticks + 36000U);
#endif
        if (wait && now - frame_ms < 33U + 2U * CT_PASS_STARVE_MS) ct_pass_defer(CT_DEFER_DRAW);
        else {
            uint32_t t0 = ct_diag_ticks();
            frame_ms = now;
            draw(&ble);
            compose_ticks = ct_diag_ticks() - t0;
        }
    }
    paint_flush();
}

void groove_screen_mmc(unsigned command)
{
    unsigned transport = command == 1 || command == 9 ? 0xfc :
                         command == 2 || command == 3 || command == 6 ? 0xfb : 0;
    if (!transport && command != 7) return;
    /* Task 12 A2: MMC record strobe (6) only starts the transport; there is no recording. */
    if (transport) (void)post((uint8_t)transport, 0, 0, 1);
}
unsigned smk37_screen_track(void) { return track; }
/* Task 06 (c): the pads' flash phase: eighth notes of the master clock while the song plays,
 * 4 Hz otherwise. */
/* Task 17 Goal 4: the state of pad `pad` on the CLIPS page for the selected track (docs/CONTROL-MAP.md 4.2):
 * 0 empty, 1 stopped, 2 playing, 3 queued (launch), 4 the playing clip with a stop queued; + 8 selected, + 16 the
 * track is muted (sound and song notes), + 32 its internal sound alone is muted. On the SCENES page: 0 no such scene, 1 a scene, 2 the scene that plays, 3 the queued scene. */
static unsigned clips_pad_state(const struct song_status *st, unsigned pad)
{
    const struct song_record *rec = song_current();
    if (page == SONG) {
        unsigned r = song_row_page * 16U + pad;
        if (!rec || st->song != song_select || r >= rec->rows) return 0;
        return st->queued == r ? 3U : st->playing && !st->song_over && st->row == r ? 2U : 1U;
    }
    const struct song_model *mdl = song_model_current();
    unsigned place = clip_bank * 16U + pad, queue = (st->track_state[track] >> 2) & 3U;
    if (!rec || !mdl || st->song != song_select) return 0;
    if (!mdl->clip[track][place]) return clip_select[track] == place ? 8U : 0U;   /* tabby-v04.10: an empty pad can be selected */
    unsigned playing_place = song_row_place(track, st->track_row[track]);
    unsigned code = queue == SONG_QUEUE_LAUNCH && song_row_place(track, st->track_queued[track]) == place ? 3U
                  : playing_place == place ? (queue == SONG_QUEUE_STOP ? 4U : 2U) : 1U;
    return code | (clip_select[track] == place ? 8U : 0U) | (mute_kind(track) == 2 ? 16U : mute_kind(track) ? 32U : 0U);
}
/* The pad colours of the CLIPS and SCENES pages (docs/CONTROL-MAP.md 4.2, 5), or 0 = not these pages. CLIPS: off
 * empty, dim white stopped, green playing, blinking green queued, blinking red a pending stop, bright white selected
 * (bright green selected and playing), orange when the track is muted (dim stopped, bright playing). Under SHIFT pads
 * 1-8 show the eight tracks in their colours: bright playing or following with a block, dim stopped or silent,
 * blinking queued; the selected track brighter still; pads 9-16 keep their mute view. One status snapshot per
 * control read (pad 0 refreshes it). */
/* Goal 6: the state of pad `pad` on the STEP page: bit 0 the step holds notes, bit 1 it holds the current note
 * (step_pitch), bit 2 selected, bit 3 the track plays this step now, bit 4 past the clip's end. */
static unsigned steps_pad_state(const struct song_edit_info *ei, unsigned pad)
{
    const uint8_t *clip = song_edit_clip();
    unsigned step = step_bar * 16U + pad;
    if (!clip || step >= ei->steps) return 16U;
    return (clip_v3_step_notes(clip, step, NULL, 0) ? 1U : 0U) | (clip_v3_note_find(clip, step, step_pitch) >= 0 ? 2U : 0U) |
           (step_sel == step ? 4U : 0U) | (ei->play_step == step ? 8U : 0U);
}
/* The remote read of the STEP page (command 29 op 15; tests): [0] page, [1] track, [2] clip place, [3] bar, [4] the
 * selected step (255 none), [5] unsaved, [6] undo levels, [7] redo levels, [8..9] events, [10] the current note,
 * [11] steps, [12] the step that plays (255 none), [13] pad mode (1 toggle), [14..29] the pad states, [30] the notes on
 * the selected step, then up to four of them, 6 bytes each: pitch, velocity, start + 240 (u16), length (u16). */
unsigned ct_screen_steps_read(uint8_t *out)
{
    struct song_edit_info ei; song_edit_info(&ei);
    const uint8_t *clip = song_edit_clip();
    memset(out, 0, 57);
    out[0] = (uint8_t)page; out[1] = ei.track; out[2] = ei.place; out[3] = step_bar; out[4] = step_sel; out[5] = ei.dirty; out[6] = ei.undo; out[7] = ei.redo;
    out[8] = (uint8_t)ei.events; out[9] = (uint8_t)(ei.events >> 8); out[10] = step_pitch; out[11] = ei.steps; out[12] = ei.play_step; out[13] = step_pads_toggle;
    for (unsigned i = 0; i < 16; ++i) out[14 + i] = (uint8_t)(ei.active ? steps_pad_state(&ei, i) : 16U);
    if (clip && step_sel != 255 && step_sel < ei.steps) {
        uint16_t idx[4]; unsigned n = clip_v3_step_notes(clip, step_sel, idx, 4);
        out[30] = (uint8_t)n;
        for (unsigned k = 0; k < n && k < 4; ++k) {
            struct clip_v3_event e; clip_v3_event(clip, idx[k], &e);
            unsigned start = (unsigned)(e.time - (int)step_sel * 480 + 240); uint8_t *q = out + 31 + 6 * k;
            q[0] = e.a; q[1] = e.b; q[2] = (uint8_t)start; q[3] = (uint8_t)(start >> 8); q[4] = (uint8_t)e.length; q[5] = (uint8_t)(e.length >> 8);
        }
    }
    out[55] = ei.recording; out[56] = ei.quantize;   /* tabby-v04.9: the recorder (0 off, 1 armed, 2 recording), input quantize */
    return 57;
}
/* Goal 6: open the STEP page on a clip by remote command (as EDIT on the CLIPS page does). */
int ct_screen_steps_open(unsigned t, unsigned place)
{
    if (t >= 8) return SONG_INVALID;
    if (song_loaded() == SONG_NONE) (void)song_load(song_select);
    int r = song_edit_open(t, place);
    if (r) return r;
    select_track((int)t - (int)track);
    clip_select[t] = (uint8_t)place;
    page = CLIP_STEPS; step_bar = 0; step_sel = 255; step_cursor = 0; step_pads_toggle = groove_pad_count(t) != 0; boot_active = 0; cache->shown_page = ~0U;
    return 0;
}
/* Goal 6: a key of the keyboard was played (it sounds as always). On the STEP page it is the current note, and with a
 * step selected it is put on that step, or taken off it. */
unsigned ct_screen_page_now(void) { return page; }
void smk37_screen_key(unsigned note, unsigned velocity)
{
    notice = NULL;   /* tabby-v1.2.1: any press takes a message away at once: a key of the keyboard too (they do not come through apply_controls) */
#ifdef CT_A2
    if (velocity) ct_late_panel(3, note);
#endif
    if (page != CLIP_STEPS || note > 127) return;
    step_pitch = (uint8_t)note; step_velocity = (uint8_t)(velocity < 1 ? 1 : velocity > 127 ? 127 : velocity);
    cache->middle_cache = ~0U;
    if (step_sel == 255) return;
    int r = song_edit_note_toggle(step_sel, note, step_velocity, step_length);
    notice = r == SONG_FULL ? "CLIP FULL" : r == 1 ? "NOTE ENTERED" : r == 0 ? "NOTE REMOVED" : "CANNOT ENTER";
    notice_until = fm1_millis() + 1200U;
    if (r == 1) { const uint8_t *clip = song_edit_clip(); uint16_t idx[6]; unsigned n = clip_v3_step_notes(clip, step_sel, idx, 6);
                  for (unsigned k = 0; k < n && k < 6; ++k) { struct clip_v3_event e; clip_v3_event(clip, idx[k], &e); if (e.a == note) step_cursor = (uint8_t)k; } }
    else step_cursor = 0;
}
int smk37_screen_launch_color(unsigned pad, uint32_t *rgb)
{
    static struct song_status st; static unsigned phase;
    if (page == CLIP_STEPS && pad < 16) {
        /* docs/CONTROL-MAP.md 12.2: past the end off; the step that plays white; the selected step cyan; a step with the
         * current note amber; with other notes green; empty: the beats dim, the rest off. */
        static struct song_edit_info ei;
        if (smk37_shift()) return 0;
        if (pad == 0) song_edit_info(&ei);
        unsigned code = steps_pad_state(&ei, pad);
        *rgb = code & 16U ? 0 : code & 8U ? 0x303030 : code & 4U ? (code & 1U ? 0x103838 : 0x041818) : code & 2U ? 0x302008 : code & 1U ? 0x083008 : pad % 4U == 0 ? 0x040404 : 0;
        return 1;
    }
    if ((page != TRACK_LAUNCH && page != SONG) || pad >= 16) return 0;
    if (pad == 0) { song_status_read(&st); phase = st.playing ? (st.bar_step >> 1) & 1U : (fm1_millis() / 250U) & 1U; }
    if (smk37_shift()) {
        if (pad >= 8) return 0;
        unsigned c = colors[pad], state = st.track_state[pad] & 3U, queue = (st.track_state[pad] >> 2) & 3U;
        const struct song_record *r = song_current();
        unsigned on = st.track_row[pad] != SONG_NONE && state != SONG_TRACK_STOPPED && r && (st.track_row[pad] >= SONG_ROWS || r->row[st.track_row[pad]].block[pad] != 0);
        unsigned level = queue ? (phase ? 2U : 0U) : on ? 2U : 1U;
        if (pad == track && level) ++level;
        *rgb = level ? ((c >> 11) & 31U) << (15 + level) | ((c >> 5) & 63U) << (6 + level) | (c & 31U) << level : 0;
        return 1;
    }
    if (page == TRACK_LAUNCH && pad >= 8 && (smk37_note_repeat_down() || loop_pad != 255)) {   /* tabby-v04.23: the lower row shows the step loop's four pads */
        *rgb = pad == loop_pad ? 0x383838 : pad < 12 ? 0x181008 : 0;
        return 1;
    }
    unsigned code = clips_pad_state(&st, pad), kind = code & 7U, selected = code & 8U, muted = code & 16U, internal = code & 32U;
    if (page == SONG) selected = muted = internal = 0;
    if (page == TRACK_LAUNCH && kind && (int32_t)(rec_full_until - fm1_millis()) > 0) {
        struct song_edit_info ei; song_edit_info(&ei);
        if (ei.active && ei.track == track && ei.place == clip_bank * 16U + pad) { *rgb = 0x300808; return 1; }   /* CLIP FULL: red once */
    }
    if (kind == 0) *rgb = selected ? 0x020810 : 0;   /* a selected empty pad: dim cyan */
    else if (kind == 3) *rgb = phase ? 0x083008 : 0;
    else if (kind == 4) *rgb = phase ? 0x300808 : 0;
    else if (muted) *rgb = kind == 2 ? 0x301808 : 0x0c0600;
    else if (internal) *rgb = kind == 2 ? 0x081830 : 0x02060c;   /* blue: the song still plays the track on MIDI out */
    else if (kind == 2) *rgb = selected ? 0x103c10 : 0x083008;
    else *rgb = selected ? 0x303030 : 0x080808;
    return 1;
}
/* The remote read of these pages (command 29 op 12; tests): out[0] page, [1] selected track, [2] clip bank, [3] scene
 * bank, [4] the selected track's selected clip place (255 none), [5] 1 while a notice shows, then per pad 3 bytes:
 * the state code (clips_pad_state) and the LED colour as 15 bits (5 per channel, each channel >> 1), low 7 bits first. */
unsigned ct_screen_clips_read(uint8_t *out)
{
    struct song_status st; song_status_read(&st);
    out[0] = (uint8_t)page; out[1] = (uint8_t)track; out[2] = (uint8_t)clip_bank; out[3] = (uint8_t)song_row_page;
    out[4] = clip_select[track]; out[5] = notice != NULL;
    for (unsigned i = 0; i < 16; ++i) {
        uint32_t c = smk37_pad_color(i, 0);
        unsigned packed = ((c >> 17) & 31U) << 10 | ((c >> 9) & 31U) << 5 | ((c >> 1) & 31U);
        out[6 + 3 * i] = (uint8_t)((page == TRACK_LAUNCH || page == SONG) ? clips_pad_state(&st, i) : 0);
        out[7 + 3 * i] = (uint8_t)(packed & 127U); out[8 + 3 * i] = (uint8_t)(packed >> 7);
    }
    return 54;
}
/* BT (docs/CONTROL-MAP.md 2): opens the CLIPS page from anywhere; from CLIPS back to the page it was opened from. */
static void clips_toggle(void)
{
    if (page == TRACK_LAUNCH) page = clips_return == TRACK_LAUNCH ? OVERVIEW : clips_return;
    else {
        clips_return = page == SONG || page <= STEPS || page == MIX ? page : OVERVIEW;
        page = TRACK_LAUNCH;
        if (song_loaded() == SONG_NONE) (void)song_load(song_select);
    }
}
int smk37_screen_octave(void) { return octave; }
unsigned smk37_performance_track(unsigned pad)
{ return pad==pad_focus?track:instrument_track[pad]; }
int smk37_performance_octave(unsigned pad)
{ return pad==pad_focus?octave:instrument_octave[pad]; }
unsigned smk37_pad_focus(void) { return pad_focus; }
void smk37_screen_note(unsigned owner,unsigned note)
{
    /* V01 followed the sounding drum part here on the ENV / tone editor pages.
     * Task 03 b removed those pages; nothing on the remaining pages follows notes. */
    (void)owner;(void)note;
}
void smk37_panel_preferences_read(uint8_t data[4])
{
    for(unsigned i=0;i<2;++i) {
        data[i]=(uint8_t)smk37_performance_track(i);
        data[i+2]=(uint8_t)(smk37_performance_octave(i)+2);
    }
}
void smk37_panel_preferences_apply(const uint8_t data[4])
{
    for(unsigned i=0;i<2;++i) {
        instrument_track[i]=data[i]; instrument_octave[i]=(int)data[i+2]-2;
    }
    track=instrument_track[pad_focus];octave=instrument_octave[pad_focus];
    cache->shown_page=~0U;
}
__attribute__((noinline, cold, minsize)) void smk37_screen_pad_mode(unsigned steps,unsigned instrument)
{
    if(!release_keys())return;
    blocked_keys|=previous_keys;
    if(instrument) {
        instrument_track[pad_focus]=(uint8_t)track;
        instrument_octave[pad_focus]=(int8_t)octave;
        pad_focus=page==OVERVIEW?!pad_focus:1;
        select_track((int)instrument_track[pad_focus]-(int)track);
        octave=instrument_octave[pad_focus];
    }
    glo_down=glo_used=seq_down=arp_down=arp_long=0;
    action_confirm=project_reload=0;
    (void)steps;   /* Task 12 A2: always 0 (no pad-step mode) */
    page=music_page=OVERVIEW;
    notice=pad_focus?"PAD READY - PARA / FX":"KEY READY - PARA / FX";
    notice_until=fm1_millis()+2000U;
    boot_active=0;cache->shown_page=~0U;
}
/* tabby-v04.22: NOTE REPEAT went down. `tracks`: the tracks it switched to repeating (0: their ARP is on already, or
 * the tracks are off). */
void smk37_screen_note_repeat(unsigned tracks)
{
    static const char *const say[] = { "NOTE REPEAT 1/4", "NOTE REPEAT 1/8", "NOTE REPEAT 1/16", "NOTE REPEAT 1/32" };
    notice = tracks ? say[groove_arp_setting(smk37_performance_track(pad_focus), 0) & 3U] : "ARP IS ON - IT REPEATS";
    notice_until = fm1_millis() + 2000U;
}
unsigned smk37_screen_pad_key(unsigned pad)
{
    if(pad>=16)return 255;
    return navigation_mode()?white_keys[pad]:255;
}
/* Task 12 A2: pad-step mode is gone (smk37_controls.c never sets it); pads always play. */
int smk37_screen_pad(unsigned pad,unsigned velocity,unsigned steps)
{
    (void)pad; (void)steps;
    if (velocity) notice = NULL;   /* tabby-v1.2.1: ... and a pad that plays */
#ifdef CT_A2
    if (velocity) ct_late_panel(2, pad);
#endif
    return 0;
}
void smk37_screen_page(unsigned target)
{
    if(!release_keys())return;
    blocked_keys|=previous_keys;
    glo_down=glo_used=seq_down=arp_down=arp_long=0;
    /* Task 06 (a): the BT button has no page any more; Bluetooth is set from the workbench. */
    if(target==SMK37_PAGE_BLUETOOTH) {clips_toggle();boot_active=0;cache->shown_page=~0U;return;}   /* Task 17 Goal 4: BT is the CLIPS button */
    page=target==SMK37_PAGE_MIDI?STEPS:SOURCE;
    if(page==STEPS) {music_page=STEPS;seq_page=SEQ_MIDI_TRACK;}   /* Task 12 A2: SHIFT+SEQ = MIDI TRACK */
    else {source_preview=groove_source_type(track);source_result=0;}
    boot_active=0;cache->shown_page=~0U;
}
void smk37_screen_shortcut(unsigned pad)
{
    if(pad<8) {
        if(!release_keys())return;
        blocked_keys|=previous_keys;
        if(page==PROJECT || page==SOURCE || page==PRESET_BROWSER)
            page=music_page=OVERVIEW;
        select_track((int)pad-(int)track);
        notice="TRACK SELECTED";
    } else if(groove_track_role(pad-8)==GROOVE_TRACK_OFF) {
        /* Task 17 Goal 4: a track without a source can still play a song on MIDI out; its mute holds those notes back. */
        song_mute_bits^=(uint8_t)(1U<<(pad-8));
        notice=track_muted(pad-8)?"MIDI TRACK MUTED":"MIDI TRACK UNMUTED";
    } else {
        struct groove_view view;
        groove_mix_toggle(pad-8,0);
        groove_get_view(pad-8,0,&view);
        song_mute_bits=(uint8_t)((song_mute_bits&~(1U<<(pad-8)))|((unsigned)(view.muted!=0)<<(pad-8)));
        notice=view.muted?"TRACK MUTED - SOUND + MIDI":"TRACK UNMUTED";
    }
    notice_until=fm1_millis()+1200U;boot_active=0;cache->shown_page=~0U;
}
#ifdef FM1_HOST_TEST
int groove_screen_preset(unsigned slot)
{
    if (slot >= GROOVE_PROJECT_SLOTS) return GROOVE_PROJECT_INVALID;
    struct groove_view view; groove_get_view(track, cursor, &view);
    preset_slot = slot; preset_refresh();
    return preset_load(view.playing, fm1_millis());
}
unsigned groove_screen_preset_position(void)
{
    unsigned current = preset_loaded && preset_project_revision == groove_project_revision();
    return preset_current_slot | (current << 9);   /* bit 8 (factory bank) is gone (Task 03 f) */
}
/* Web shortcuts enter the same editor and use the same parameter handlers. */
int groove_screen_open(unsigned target)
{
    if ((target > ARP_EDIT && target != SONG && target != TRACK_LAUNCH) || target == PROJECT) return -1;   /* the STEP page opens from CLIPS only */
    boot_active = 0;
    /* Task 03 b: the operator and tone editor pages are gone; the DX7 pages need a DX7. */
    if (target == FM_EDIT || target == FM_ENV || target == FM_LFO || target == TONE_EDIT) return -1;
    if (target == BLE || target == NAME) return -1;   /* Task 06 (a): pages removed */
    if (target == STEP_EDIT || target == RHYTHM) return -1;   /* Task 12 A2: pages removed */
    if (target == FM_QUICK && groove_source_type(track) != GROOVE_DX7) return -1;
    if (!release_keys()) return -1;
    blocked_keys |= previous_keys;
    glo_down = glo_used = seq_down = arp_down = arp_long = 0;
    if (parameter_page(target)) {
        if (!parameter_page(page)) subpage_return = page;
    }
    page = target;
    if (page == STEPS) seq_page = SEQ_SYNC;   /* Task 12 A2: STEP_EDIT and RHYTHM are rejected above */
    if (page == ARP_EDIT) arp_page = 0;
    action_confirm = name_cursor = 0;
    if (page == OVERVIEW || page == STEPS) music_page = page;
    if (page == SOURCE) { source_preview = groove_source_type(track); source_result = 0; }
    if (page == PRESET_BROWSER) { project_result = 0; preset_refresh(); }
    if ((page == SONG || page == TRACK_LAUNCH) && song_loaded() == SONG_NONE) (void)song_load(song_select);
    cache->shown_page = ~0U;
    return 0;
}
/* Browser hit targets use the same cursor, record and step-edit handlers. */
/* Browser-only targets describe the real display, not an independent copy of
 * the synthesizer. Stale messages are rejected after a control-context change. */
struct web_target { int32_t x, y, w, h, action, index, owner, raw; char label[16], value[16]; };
static struct web_target web_targets[32];
static unsigned web_target_count;
unsigned groove_screen_web_context(void)
{
    unsigned context[] = {page, track, groove_source_type(track), effects_page,
        0, glo_down && glo_used,
        0, seq_page, arp_page};
    return signature(2166136261U, context, sizeof context);
}
unsigned groove_screen_web_mask(void)
{
    unsigned mask = 0;
    if (shift_visible) return 0;
    if (glo_down && glo_used) return 0;
    if (page == OVERVIEW || page == STEPS || page == MIX || page == EFFECTS ||
        page == FM_QUICK || page == ARP_EDIT) {
        for (unsigned i = 0; i < 4; ++i)
            if (web_knobs[i][0][0] && strcmp(web_knobs[i][0], "-") &&
                web_knobs[i][1][0] && strcmp(web_knobs[i][1], "--")) mask |= 1U << i;
    }
    if (page == OVERVIEW && groove_clock_mode()) mask &= ~8U;
    if (page == EFFECTS && effects_page == 2 && groove_clock_mode()) mask &= ~4U;
    return mask;
}
static void web_target(unsigned x, unsigned y, unsigned w, unsigned h, unsigned action,
                       unsigned index, unsigned owner, const char *label, int value, const char *display)
{
    if (web_target_count >= 32) return;
    struct web_target *t = &web_targets[web_target_count++];
    memset(t, 0, sizeof *t);
    t->x = x; t->y = y; t->w = w; t->h = h; t->action = action;
    t->index = index; t->owner = owner; t->raw = value;
    unsigned n = (unsigned)strlen(label); if (n > 15) n = 15;
    memcpy(t->label, label, n);
    if (display) { n = (unsigned)strlen(display); if (n > 15) n = 15; memcpy(t->value, display, n); }
    else decimal(t->value, value, 1);
}
static void web_alias(unsigned x, unsigned y, unsigned w, unsigned h, unsigned col)
{
    if (groove_screen_web_mask() & (1U << col))
        web_target(x, y, w, h, 0, col, track, web_knobs[col][0], 0, web_knobs[col][1]);
}
const void *groove_screen_web_targets(void)
{
    /* Browser navigation can change page before the next 33 ms paint tick.
     * Refresh the shared draw metadata before exposing its edit targets. */
    struct fm1_ble_status status = {0}; fm1_ble_get_status(&status); draw(&status);
    web_target_count = 0;
    if (shift_visible || (glo_down && glo_used)) return web_targets;
    struct groove_view v; groove_get_view(track, cursor, &v);
    if (page != PROJECT && page != PRESET_BROWSER && !v.clock_mode)
        web_target(2, 2, 60, 27, 1, 0, track, "BPM", v.tempo, NULL);
    /* tabby-v1.1: the knobs' lines are wherever the page drew them (knob_note): the simulator no longer assumes a strip */
    for (unsigned col = 0; col < 4; ++col)
        if (web_knob_rect[col][2] && page != EFFECTS)
            web_alias((unsigned)web_knob_rect[col][0], (unsigned)web_knob_rect[col][1], (unsigned)web_knob_rect[col][2], (unsigned)web_knob_rect[col][3], col);
    if (page == OVERVIEW) {
        for (unsigned t = 0; t < 8; ++t) {
            struct groove_view row; groove_get_view(t, cursor, &row);
            char label[16] = "T1 LEVEL"; label[1] += t;
            web_target(194, 53 + t * 23, 46, 22, 2, 0, t, label, row.volume, NULL);
        }
    } else if (page == SOURCE) {
        web_target(0, 152, 240, 18, 6, 3, track, "TRACK MODE", groove_track_role(track), track_modes[groove_track_role(track)]);
    } else if (page == FM_QUICK) {
        web_target(0, 50, 240, 26, 6, 6, track, "VOICE", v.program + 1, NULL);
        web_target(0, 186, 240, 18, 6, 1, track, "BANK", v.program / 32 + 1, NULL);
    } else if (page == ARP_EDIT) {
        web_target(0, 168, 240, 18, 6, 1, track, "ARP PAGE", arp_page + 1, arp_page ? "HOLD / MIDI" : "NOTES");
    } else if (page == EFFECTS) {
        for (unsigned col = 0; col < 4; ++col) web_alias(0, 62 + col * 26, 240, 24, col);
        web_target(0, 34, 240, 26, 6, 6, track, "FX PAGE", effects_page, effects_page == 2 ? "DELAY" : effects_page ? "SHARED" : "TRACK");
    } else if (page == MIX) {
        for (unsigned i = 0; i < 16; ++i) {
            struct groove_view row; groove_get_view(i & 7U, cursor, &row);
            unsigned on = i < 8 ? row.muted : row.solo;
            char label[16] = "T1 MUTE"; label[1] += i & 7U;
            if (i >= 8) memcpy(label + 3, "SOLO", 4);
            web_target(1 + (i & 7U) * 30, i < 8 ? 62 : 94, 28, 28, 7, i >= 8, i & 7U, label, on, on ? "ON" : "OFF");
        }
    }
    return web_targets;
}
unsigned groove_screen_web_target_count(void) { return web_target_count; }
int groove_screen_web_adjust(unsigned context, unsigned action, unsigned index, unsigned owner, int delta)
{
    if (context != groove_screen_web_context()) return 0;
    if (!delta || delta < -127 || delta > 127) return -1;
    unsigned valid = action == 0 && owner == track && index < 4 &&
        (groove_screen_web_mask() & (1U << index));
    groove_screen_web_targets();
    for (unsigned i = 0; i < web_target_count; ++i) {
        struct web_target *t = &web_targets[i];
        if (t->action == (int)action && t->index == (int)index && t->owner == (int)owner) valid = 1;
    }
    if (!valid) return -1;
    if (!action) return (int)index + 3; /* Encoder index + 1. */
    if (action == 6) return (int)index + 1;
    if (action == 1) groove_tempo_edit(delta);
    else if (action == 2) groove_control_edit(owner, 0, delta, 0);
    else if (action == 7) {
        struct groove_view v; groove_get_view(owner, cursor, &v);
        if ((index ? v.solo : v.muted) != (unsigned)(delta > 0)) groove_mix_toggle(owner, index);
    }
    return 0;   /* Task 12 A2: action 8 (loop length) left with the step editor */
}
const char *groove_screen_web_knobs(void) { return &web_knobs[0][0][0]; }
/* Task 12 A2: the browser's step grid is gone with the step editor; the entry points stay so the
 * simulator wasm keeps its exports: the window start, and a step edit that is always refused. */
unsigned groove_screen_web_first(void)
{
    struct groove_view v; groove_get_view(track, cursor, &v); return step_first(&v);
}
int groove_screen_web_step(unsigned step, unsigned toggle)
{
    (void)step; (void)toggle;
    return -1;
}
/* Read-only panel state for the browser simulator. */
void groove_screen_snapshot(uint8_t state[8])
{
    state[0] = (uint8_t)track;
    state[1] = (uint8_t)page;
    state[2] = (uint8_t)cursor;
    state[3] = (uint8_t)drum;
    state[4] = 0; /* Task 12 A2: never recording */
    state[5] = 0; /* Task 03 b: no selected operator / FM page any more. */
    state[6] = 0;
    state[7] = (uint8_t)(octave + 24);
}
#endif
