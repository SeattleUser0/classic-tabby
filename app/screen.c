/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * app/screen.c — the SMK-37's pages, panel controls and LCD painter
 *
 * Classic Tabby revision log (the upstream file had no header; earlier Classic Tabby changes are
 * marked "Task NN" where they are)
 *   v0.10 2026-11-12  Task 16 Goal 3: the SONG page shows the follow state (ARMED: START?, WAIT PULSE, FOLLOWING, HOLD: NO
 *                     CLOCK, LOST - CONTINUE, STOP BY MASTER) when CLOCK = MIDI; PLAY arms instead of refusing.
 *   v0.9  2026-11-11  Task 16 Goal 4: stale screen texts: "K2 CLK IN AUTO USB BLE" (DIN receives nothing), "ERASE OLD DATA"
 *                     (was ERASE OLD SAMPLE DATA), "SEQ+EDIT: ACTIONS" (was HOLD SEQ: ACTIONS), the SHIFT
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
#include <string.h>
enum {
    BACK = 0x0000,
    PANEL = 0x18e3,
    TEXT = 0xef5d,
    ACCENT = 0x07ff,
    DIM = 0x738e,
    GREEN = 0x07e0,
    AMBER = 0xfd20
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
static void paint_mark(unsigned x, unsigned y, unsigned w, unsigned h)
{
    for (unsigned b = y / PAINT_ROWS; b <= (y + h - 1) / PAINT_ROWS; ++b) {
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
    if (!s || !scale || scale > 4 || x >= FM1_SCREEN_WIDTH ||
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
       TRACK_LAUNCH /* Task 06 c: per-track launching, page 20 (SCL from the SONG page, web shortcut 20) */ };
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
    "SONG MODE", "COMPACT SONG STORAGE", "SEND SETUP"
#ifdef CT_A2
    /* Task 15 Step 4 (CT_A2 diag builds only): the run-time switch of option A2, the control
     * pass on demand (app/midi_router.c). Off at boot; the entry's text shows the state. */
    , "A2 FAST MIDI: ON"
#endif
    };
enum { ACT_COPY_TIMBRE, ACT_PASTE_TIMBRE, ACT_STOP_ALL, ACT_ERASE_OLD, ACT_SONG_MODE, ACT_COMPACT, ACT_SEND_SETUP, ACT_A2 };
enum { ACTION_COUNT = sizeof actions / sizeof actions[0] };
static unsigned source_preview, action, action_confirm, tone_clip_ready;
/* Task 12 A1: the question the ACTIONS page asks before a destructive entry runs. */
static const char *confirm_prompt(void)
{
    return action == ACT_ERASE_OLD ? "ERASE OLD DATA?" : action == ACT_COMPACT ? "COMPACT SONG STORAGE?" : "REPLACE TIMBRE?";
}
static struct groove_preset tone_clip;
static uint32_t midi_seen[8], midi_until[8];
static uint8_t midi_active[8];
static unsigned track, cursor, selected_note = 60, drum, page;
static unsigned music_page, subpage_return, project_return, effects_page;
static unsigned seq_page, arp_page;
static unsigned song_select, song_row_page; /* SONG page: selected song, pads = rows 1-16 + 16 * page */
static unsigned launch_phase(void);         /* Task 06 (c): the TRACK LAUNCH page's flash phase */
/* Task 16 Goal 1 (remote control, transfer command 29, app/transfer.c): what the screen state is, and
 * the SONG page's selected song, so a remote select leaves the page and the song loaded together
 * (the page then shows what the song state says). The page numbers are this file's enum. */
unsigned ct_screen_page(void) { return page; }
unsigned ct_screen_action(void) { return action; }
void ct_screen_song_select(unsigned song) { if (song < SONG_SONGS) song_select = song; }
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
static unsigned step_first(const struct groove_view *v)
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
    uint32_t header_cache, title_cache, middle_cache, hint_cache, hold_cache, seq_cache, shortcut_cache;
    uint32_t foot_cache[4], row_cache[8], middle_shape, cell_cache[8][16], tile_cache[16];
    unsigned meter_cache[8];
};
static struct draw_cache saved_cache, band_cache, *cache = &saved_cache;
static uint32_t led_cache;
static uint16_t button_led_cache;
static struct groove_view frame_views[GROOVE_TRACKS];
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
        (page >= SOURCE && page <= RHYTHM) || page == SONG || page == TRACK_LAUNCH || page == STEPS || glo_down;
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
static __attribute__((noinline)) void dim_text(unsigned x, unsigned y, const char *s)
{
    text(x, y, s, 1, DIM, BACK);
}
static __attribute__((noinline)) void plain_text(unsigned x, unsigned y, const char *s)
{
    text(x, y, s, 1, TEXT, BACK);
}
static __attribute__((noinline)) void accent_text(unsigned x, unsigned y, const char *s)
{
    text(x, y, s, 1, ACCENT, BACK);
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
{ number(x,y,value,digits,1,color,BACK); }
static __attribute__((noinline)) void color_text(unsigned x,unsigned y,const char *s,uint16_t color)
{ text(x,y,s,1,color,BACK); }
static __attribute__((noinline)) void erase(unsigned x,unsigned y,unsigned w,unsigned h)
{ paint_fill(x,y,w,h,BACK); }
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
#endif
static void knob(unsigned col, const char *label, const char *value, uint16_t color)
{
#ifdef FM1_HOST_TEST
    if (col < 4) {
        memset(web_knobs[col], 0, sizeof web_knobs[col]);
        unsigned n = (unsigned)strlen(label); if (n > 15) n = 15;
        memcpy(web_knobs[col][0], label, n);
        n = (unsigned)strlen(value); if (n > 15) n = 15;
        memcpy(web_knobs[col][1], value, n);
    }
#endif
    if (paint_rendering && (paint_top >= 227 || paint_top + PAINT_ROWS <= 195)) return;
    uint32_t sig =
        signature(signature(color, label, (unsigned)strlen(label)), value, (unsigned)strlen(value));
    if (cache->foot_cache[col] == sig)
        return;
    cache->foot_cache[col] = sig;
    unsigned x = 6 + 59 * col;
    erase(x, 195, 54, 32);
    paint_fill(x, 195, 54, 2, color);
    plain_text(x, 200, label);
    text(x, 212, value, strlen(value) <= 4 ? 2 : 1, color, BACK);
}
static __attribute__((noinline)) void header(const struct groove_view *v)
{
    if (paint_rendering && paint_top >= 30) return;
    unsigned paused = !v->playing && !groove_sequence_rewound();
    uint32_t sig = v->tempo | ((uint32_t)v->play_step << 10) |
        ((uint32_t)v->playing << 16) |
        ((uint32_t)v->clock_mode << 18) | ((uint32_t)v->clock_state << 19) | (groove_arp_enabled(track) << 23) |
        ((uint32_t)(v->sequence_length >> 4) << 24) | (groove_project_dirty() << 27) | (paused << 28);
    if (sig == cache->header_cache)
        return;
    uint32_t previous = cache->header_cache, changed = sig ^ previous;
    unsigned first = previous == ~0U;
    cache->header_cache = sig;
    if (first) {
        erase(0, 0, 240, 30);
        dim_text(122, 7, "/");
    }
    if (first || (changed & (1U << 27)))
        color_text(165, 19, groove_project_dirty() ? "*" : " ", AMBER);
    if (first || (changed & (7U << 24)))
        small_number(128, 7, v->sequence_length, 2, DIM);
    /* Fixed-width glyphs replace their own background; a moving playhead
     * only updates its two digits and, at a page boundary, two indicators. */
    if (first || (changed & 1023U)) {
        if (v->clock_mode && !v->tempo)
            text(8, 8, "---", 2, DIM, BACK);
        else
            number(8, 8, v->tempo, 3, 2, TEXT, BACK);
    }
    if (first || (changed & (7U << 18))) {
        erase(45, 15, 32, 7);
        color_text(45, 15, !v->clock_mode ? "BPM" : v->clock_state == GROOVE_CLOCK_LOST
            ? "LOST" : v->clock_state == GROOVE_CLOCK_LOCKED ? (groove_midi_setting(track,6) == 1 ? "USB" : groove_midi_setting(track,6) == 2 ? "BLE" : groove_midi_setting(track,6) == 3 ? "DIN" : "EXT") : "WAIT", v->clock_state == GROOVE_CLOCK_LOST ? AMBER : DIM);
    }
    if (first || (changed & ((1U << 16) | (1U << 28))))
        color_text(80, 7, v->playing ? "PLAY " : paused ? "PAUSE" : "STOP ", v->playing ? GREEN : paused ? AMBER : DIM);
    if (first || (changed & (63U << 10)))
        small_number(110, 7, v->play_step + 1, 2, TEXT);
    for (unsigned i = 0; i < 4; ++i) {
        unsigned active = v->playing && i == v->play_step / 16;
        unsigned was_active = (previous & (1U << 16)) && i == ((previous >> 14) & 3U);
        if (first || active != was_active || (changed & (7U << 24)))
            paint_fill(80 + i * 16, 20, 12, 3, active ? GREEN : i * 16 < v->sequence_length ? PANEL : BACK);
    }
    /* Task 12 A2: no REC / STEP / CNT / FOLLOW-EDIT states any more; the box shows ARP or LIVE. */
    if (first || (changed & ((1U << 16) | (1U << 23)))) {
        paint_fill(181, 7, 51, 16, PANEL);
        text(192, 12, groove_arp_enabled(track) ? "ARP" : "LIVE", 1, TEXT, PANEL);
    }
}
static __attribute__((noinline)) void overview(const struct groove_view v[8])
{
    if (paint_rendering && (paint_top >= 190 || paint_top + PAINT_ROWS <= 32)) return;
    unsigned first = step_first(&v[track]);
    char project_name[13]; groove_project_name(project_name);
    uint32_t title = signature(first / 16 | ((unsigned)v[track].sequence_length << 10) |
        (pad_focus << 18) | ((unsigned)v[track].type << 19), project_name, 12);
    if (title != cache->title_cache) {
        cache->title_cache = title;
        erase(0, 32, 240, 13);
        accent_text(8, 35, project_name);
        color_text(86, 35, pad_focus ? groove_pad_count(track)?"PAD DRUM":"PAD NOTE":"KEY PLAY", pad_focus?ACCENT:DIM);
        dim_text(146, 35, "PAGE");
        small_number(178, 35, first + 1, 2, TEXT);
        dim_text(190, 35, "-");
        small_number(196, 35, first + 16, 2, TEXT);
    }
    static const char *const chip_names[] = {"PSG YM", "PSG AY", "PSG NOIS", "PSG MIX"};
    for (unsigned t = 0; t < 8; ++t) {
        unsigned y = 48 + 18 * t;
        if (paint_rendering && (y >= paint_top + PAINT_ROWS || y + 16 <= paint_top)) continue;
        uint32_t meta = v[t].program | ((uint32_t)v[t].volume << 7) | ((t == track) << 14) |
                        ((uint32_t)v[t].modified << 15) | ((uint32_t)v[t].muted << 16) |
                        ((uint32_t)v[t].solo << 17) | ((uint32_t)v[t].ready << 18) |
                        ((uint32_t)v[t].type << 19) | ((uint32_t)midi_active[t] << 22) |
                        ((uint32_t)groove_track_role(t) << 23);
        if (v[t].type == GROOVE_DX7)
            meta = signature(meta, frame_fm_names[t], 7);
        if (meta != cache->row_cache[t]) {
            cache->row_cache[t] = meta;
            erase(5, y, 71, 16);
            uint16_t bg = t == track ? colors[t] : PANEL;
            paint_fill(6, y, 18, 16, bg);
            number(12, y + 5, t + 1, 1, 1, t == track ? BACK : colors[t], bg);
            paint_fill(7, y + 12, 3, 3, midi_active[t] ? GREEN : bg);
            color_text(29, y + 1, !v[t].ready                  ? "ERROR"
                 : v[t].type == GROOVE_DX7    ? frame_fm_names[t]
                 : v[t].type == GROOVE_303    ? (v[t].program ? "303 SQR" : "303 SAW")
                 : v[t].type == GROOVE_PSG    ? chip_names[v[t].program & 3U]
                 : v[t].type == GROOVE_PLUCK  ? "PLUCK"
                 : v[t].type == GROOVE_SAMPLE ? "SAMPLER"
                                              : "808 KIT", colors[t]);
            color_text(29, y + 9, groove_track_role(t) == GROOVE_TRACK_OFF ? "OFF"
                 : groove_track_role(t) == GROOVE_TRACK_PLAY ? (v[t].muted ? "L MUT" : v[t].solo ? "L SOLO" : "LIVE")
                 : v[t].muted      ? "MUTE"
                 : v[t].solo     ? "SOLO"
                 : v[t].modified ? "EDITED"
                                 : "", DIM);
            small_number(214, y + 1, v[t].volume, 3, t == track ? TEXT : DIM);
        }
        for (unsigned i = 0; i < 16; ++i) {
            unsigned step = first + i;
            unsigned enabled = step < v[t].sequence_length;
            unsigned on = enabled && (unsigned)((v[t].active_steps >> step) & 1U);
            unsigned head = v[t].playing && v[t].play_step == step;
            unsigned selected = 0;   /* Task 12 A2: no step cursor to show */
            uint32_t sig = on | (head << 1) | ((uint32_t)v[t].audible << 3) | (enabled << 4);
            if (sig == cache->cell_cache[t][i])
                continue;
            cache->cell_cache[t][i] = sig;
            unsigned x = 80 + i * 8;
            paint_fill(x, y + 3, 6, 11, selected ? TEXT : BACK);
            paint_fill(x + 1, y + 5, 4, 8, on ? (v[t].audible ? colors[t] : DIM) : enabled ? PANEL : BACK);
            if (head)
                paint_fill(x, y + 3, 6, 2, GREEN);
        }
        unsigned meter = v[t].audible ? (v[t].level * 14 + 63) / 127 : 0;
        unsigned meter_signature = meter | (v[t].level >= 124 ? 16U : 0U);
        if (meter_signature != cache->meter_cache[t]) {
            cache->meter_cache[t] = meter_signature;
            paint_fill(216, y + 11, 14, 3, PANEL);
            if (meter)
                paint_fill(216, y + 11, meter, 3, v[t].level >= 124 ? AMBER : colors[t]);
        }
    }
}
/* Task 12 A2: the SYNC / MIDI and MIDI TRACK views of page STEPS (the step grid that was here left
 * with the step editor). The body lists every setting with the control that changes it; the knob
 * strip below shows K1-K4. BPM is set on HOME K4 and only shown here. */
static __attribute__((noinline)) void sync_draw(const struct groove_view *v)
{
    if (paint_rendering && (paint_top >= 184 || paint_top + PAINT_ROWS <= 32)) return;
    uint32_t sig = seq_page | (track << 2) | ((uint32_t)v->clock_mode << 5) | ((uint32_t)v->clock_state << 6) |
        ((uint32_t)groove_midi_setting(track, 4) << 8) | ((uint32_t)v->tempo << 10);
    if (sig == cache->title_cache) return;
    cache->title_cache = sig;
    erase(0, 32, 240, 150);
    accent_text(8, 35, seq_pages[seq_page]);
    if (seq_page == SEQ_MIDI_TRACK) {
        color_text(8, 55, "T", colors[track]); small_number(14, 55, track + 1, 1, colors[track]);
        plain_text(30, 55, "MIDI FOR THIS TRACK");
        dim_text(8, 75, "K1 IN CH   RECEIVE CHANNEL");
        dim_text(8, 89, "K2 OUT CH  SEND CHANNEL");
        dim_text(8, 103, "K3 SEQ     LOCAL / BOTH / MIDI");
        dim_text(8, 117, "K4 OUT PORT ALL / OFF");
        dim_text(8, 137, "K5: TRACK  SEQ: SYNC / MIDI");
        return;
    }
    dim_text(8, 55, "K1 CLOCK   INT / MIDI");
    dim_text(8, 69, "K2 CLK IN  AUTO USB BLE");   /* Task 16 Goal 4: DIN receives nothing (SPEC 17.6) */
    dim_text(8, 83, "K3 SWING");
    dim_text(8, 97, "K4 SEQ OUT OFF / ON / CLOCK");
    plain_text(8, 115, "K7 KEY OUT:");
    accent_text(116, 115, groove_midi_setting(track, 4) ? "ON" : "OFF");
    dim_text(8, 135, "BPM:");
    if (v->clock_mode && !v->tempo) color_text(40, 135, v->clock_state == GROOVE_CLOCK_LOST ? "LOST" : "WAIT", AMBER);
    else small_number(40, 135, v->tempo, 3, TEXT);
    dim_text(72, 135, v->clock_mode ? "FROM MIDI CLOCK" : "SET ON HOME K4");
    dim_text(8, 153, "SHIFT+SEQ: MIDI TRACK");
}
static __attribute__((noinline)) void mix_draw(const struct groove_view v[8])
{
    if (paint_rendering && (paint_top >= 195 || paint_top + PAINT_ROWS <= 32)) return;
    unsigned banks = track / 4 | (smk37_fader_bank() << 1);
    if (cache->title_cache != banks) {
        cache->title_cache = banks;
        erase(0, 32, 240, 33);
        plain_text(8, 35, "MIX  8 TRACKS");
        dim_text(8, 51, "PADS 1-8 MUTE  9-16 SOLO");
        erase(0, 184, 240, 11);
        accent_text(8, 186, banks & 1U ? "K1-4: T5-8" : "K1-4: T1-4");
        accent_text(116, 186, banks & 2U ? "F1-4: T5-8" : "F1-4: T1-4");
    }
    for (unsigned i = 0; i < 16; ++i) {
        unsigned t = i & 7U, on = i < 8 ? v[t].muted : v[t].solo;
        uint32_t sig = on | ((t == track) << 1);
        if (sig == cache->tile_cache[i])
            continue;
        cache->tile_cache[i] = sig;
        unsigned x = 8 + (i % 4) * 57, y = 72 + (i / 4) * 29;
        uint16_t bg = on ? colors[t] : PANEL;
        paint_fill(x, y, 53, 25, bg);
        if (t == track)
            frame(x, y, 53, 25, TEXT);
        text(x + 7, y + 5, i < 8 ? "MUTE" : "SOLO", 1, on ? BACK : DIM, bg);
        number(x + 37, y + 5, t + 1, 1, 1, on ? BACK : colors[t], bg);
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
        erase(8, 40, 224, 7);
        dim_text(8, 40, "USER");
        small_number(38, 40, project_slot + 1, 2, ACCENT);
        dim_text(52, 40, "/16");
        plain_text(78, 40, project_stored_result < 0 ? "READ ERROR" : project_stored);
    }
    sig = signature(name_cursor, name, 12);
    if (cache->middle_cache != sig) {
        cache->middle_cache = sig;
        erase(8, 77, 144, 18);
        text(8, 77, name, 2, ACCENT, BACK);
        paint_fill(8 + name_cursor * 12, 93, 10, 2, ACCENT);
    }
    sig = project_reload;
    if (cache->row_cache[0] != sig) {
        cache->row_cache[0] = sig;
        erase(8, 126, 224, 26);
        plain_text(8, 126, project_reload ? "OVERWRITE SELECTED SLOT?" : "4TH LEFT BTN: WRITE PROJECT");
        dim_text(8, 145, project_reload ? "4TH LEFT BTN CONFIRM  HOME CANCEL" : "K1 CURSOR  K2 LETTER");
    }
    if (cache->hint_cache != 1U) {
        cache->hint_cache = 1U;
        dim_text(8, 59, "WORKING NAME");
        dim_text(8, 105, "K5 / K7 CHOOSE SLOT");
        dim_text(8, 224, "HOME CANCEL  EDIT SOUND");
    }
    sig = (unsigned)(project_result + 16) | (project_operation << 16);
    if (cache->row_cache[1] == sig) return;
    cache->row_cache[1] = sig;
    const char *status = project_result == GROOVE_PROJECT_EMPTY     ? "NO VALID SAVE"
                         : project_result == GROOVE_PROJECT_TUNING_SPACE ? "ERASE OLD DATA"   /* Task 16 Goal 4: the action's name since Task 12 A1 */
                         : project_result == GROOVE_PROJECT_PLAYING ? "STOP TO SAVE"   /* Task 12 A3 */
                         : project_result == GROOVE_PROJECT_MEMORY  ? "NOT ENOUGH MEMORY"
                         : project_result == GROOVE_PROJECT_INVALID ? "INVALID PROJECT"
                         : project_result == FM1_FLASH_BUSY         ? "FLASH BUSY - RETRY"
                         : project_result == FM1_FLASH_UNAVAILABLE  ? "FLASH NOT READY"
                         : project_result                           ? "FLASH ERROR - RETRY"
                         : project_operation == 1                   ? "SAVED"
                         : project_operation == 3                   ? "SAVING"
                                                                    : "READY";
    erase(8, 180, 224, 7);
    color_text(8, 180, status, project_result ? AMBER : GREEN);
}
static __attribute__((noinline)) void preset_draw(void)
{
    uint32_t sig = signature(preset_slot, project_stored, 12);
    sig = signature(sig, &project_result, sizeof project_result);
    if (cache->middle_cache == sig) return;
    cache->middle_cache = sig;
    erase(0, 30, 240, 210);
    dim_text(8, 42, "USER PROJECTS");   /* Task 03 f: no factory bank */
    number(8, 65, preset_slot + 1, 2, 2, ACCENT, BACK);
    text(38, 65, "/16", 2, DIM, BACK);
    text(8, 97, project_stored_result < 0 ? "READ ERROR" : project_stored, 2, TEXT, BACK);
    plain_text(8, 127, "K5 / K7 LOAD");
    plain_text(8, 148, "PLAY LOAD+RUN  4TH LEFT BTN SAVE");
    dim_text(8, 170, "PADS 1-16 LOAD DIRECTLY");
    color_text(8, 213, project_result == GROOVE_PROJECT_EMPTY ? "EMPTY SLOT - CHOOSE ANOTHER" :
         project_result ? "LOAD FAILED - CURRENT KEPT" : "HOME BACK  HOME+4TH LEFT BTN UNDO", project_result ? AMBER : DIM);
}
static __attribute__((noinline)) void effects_draw(void)
{
    const uint8_t *values = frame_effects;
    unsigned title = 1U + track + effects_page * 8U;
    if (cache->title_cache != title) {
        cache->title_cache = title;
        erase(8, 40, 224, 36);
        if (effects_page) plain_text(8, 40, effects_page == 2 ? "DELAY / SEQ TAP" : "SHARED FX / ALL TRACKS");
        else {
            plain_text(8, 40, "TRACK");
            small_number(44, 40, track + 1U, 1, ACCENT);
            plain_text(60, 40, source_names[frame_views[track].type]);
        }
        dim_text(8, 64, "K6: TRACK / SHARED / DELAY");
    }
    static const char *const shared[4] = {"REV TIME", "DLY TIME", "FEEDBACK", "RETURN"};
    static const char *const local[4] = {"REV SEND", "DLY SEND", "TRK VOL", "ALL RET"};
    static const char *const delay[4] = {"SYNC", "TIME MS", "BPM", "FEEDBACK"};
    static const char *const division[] = {"1/32T", "1/32", "1/16T", "1/16", "1/8T", "1/16D", "1/8", "1/8D", "1/4"};
    const char *const *labels = effects_page == 2 ? delay : effects_page ? shared : local;
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
            if (effects_page && i == 1) value = (groove_delay_ticks() * 80U + 220U) / 441U;
            else if (effects_page == 2) value = i == 2 ? frame_views[track].tempo : values[2];
            decimal(display, (int)value, 1);
        }
        /* Knob cache covers labels as well as values when FREE/SYNC changes. */
        if (cache->row_cache[i] != (value | (synced << 16) | ((unsigned)frame_views[track].clock_mode << 17))) {
            cache->row_cache[i] = (value | (synced << 16) | ((unsigned)frame_views[track].clock_mode << 17));
            erase(8, 88 + i * 22, 224, 18);
            plain_text(8, 91 + i * 22, label);
            accent_text(164, 91 + i * 22, display);
            if (effects_page && i == 1 && !synced) dim_text(190, 91 + i * 22, "MS");
            if (!effects_page && i < 2) dim_text(190, 91 + i * 22, "%");
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
        | ((visible == PROJECT || visible == SOURCE || (visible == ACTIONS && action_confirm)) << SAVE);
    changed = bits ^ button_led_cache;
    for (unsigned key = 0; key < 14; ++key)
        if (changed & (1U << key)) fm1_led_set(key, (bits >> key) & 1U);
    button_led_cache = (uint16_t)bits;
}
static __attribute__((noinline)) void edit_page_draw(unsigned visible)
{
    if (paint_rendering && paint_top + PAINT_ROWS <= 32) return;
    if (!paint_rendering) {
        uint32_t sig = visible * 33U + action + (action_confirm << 8);
        sig = sig * 33U + cursor;
        sig = sig * 33U + source_preview;
        sig = sig * 33U + (unsigned)source_result;
        if (visible == SOURCE) sig = sig * 33U + groove_track_role(track);
        sig = sig * 33U + tone_clip_ready;   /* Task 12 A2: the step / count-in state left with the editor */
        sig = sig * 33U + frame_views[track].volume;
        if (notice) sig = signature(sig, notice, (unsigned)strlen(notice));
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
            sig = signature(sig, &st, sizeof st);
            sig = sig * 33U + song_select + (song_row_page << 8) + (song_storage_state() << 12) + (track << 20) + (launch_phase() << 24) + (song_follow_state() << 27);   /* Task 16: the follow state */
        }
        if (visible == ARP_EDIT) {
            sig = sig * 33U + track + (groove_arp_enabled(track) << 8) + (arp_page << 9);
            for (unsigned i = 0; i < 6; ++i) sig = sig * 33U + groove_arp_setting(track, i);
            for (unsigned i = 0; i < 2; ++i) sig = sig * 33U + groove_midi_setting(track, i);
        }
        if (cache->middle_cache == sig) return;
        cache->middle_cache = sig;
    }
    erase(0, 32, 240, 208);
    cache->hint_cache = ~0U;
    memset(cache->foot_cache, 0xff, sizeof cache->foot_cache);
    if (visible == SOURCE) {
        plain_text(8, 42, "SOUND SOURCE");
        dim_text(166, 42, "TRACK"); small_number(202, 42, track + 1, 1, colors[track]);
        text(8, 64, source_names[source_preview], 2, ACCENT, BACK);
        for (unsigned i = 0; i < SOURCE_CHOICES; ++i) {
            unsigned x = 8 + (i & 1U) * 116, y = 94 + (i / 2U) * 22;
            uint16_t bg = i == source_preview ? PANEL : BACK;
            paint_fill(x, y, 108, 19, bg);
            number(x + 4, y + 6, i + 1, 1, 1, i == source_preview ? ACCENT : DIM, bg);
            text(x + 18, y + 6, source_names[i], 1, i == source_preview ? TEXT : DIM, bg);
        }
        accent_text(8, 166, source_preview == groove_source_type(track) ? "CURRENT SOUND" : "NEW SOURCE RESETS TIMBRE");
        unsigned role = groove_track_role(track);
        plain_text(8, 184, "K2 TRACK:"); accent_text(80, 184, track_modes[role]);
        static const char *const hints[] = {"PROJECT: FOLLOWS PROJECT", "LIVE: KEEP SOUND ON PROJECT LOAD", "OFF: TURN K2 LEFT TO ENABLE"};
        dim_text(8, 198, source_preview == groove_source_type(track) ? hints[role] : "DRUM / PITCH CHANGE CLEARS STEPS");
        color_text(8, 216, source_result ? "NOT ENOUGH MEMORY - RETRY" : "K1 / PADS 1-6 CHOOSE", source_result ? AMBER : TEXT);
        dim_text(8, 231, role == GROOVE_TRACK_OFF ? "K2 ENABLE TRACK   HOME BACK" : "4TH LEFT BTN APPLY  HOME BACK");
    } else if (visible == ACTIONS) {
        /* Task 11 (diagnostic and probe builds): the USER size the SDK validated and the song
         * storage state replace the clipboard line; free / reclaimable storage replaces the
         * hint, so the probe's result can be read on the device without a monitor. */
        char diag_user[40], diag_song[40];
        ct_diag_storage_lines(diag_user, diag_song);
        if (action_confirm) color_text(8, 38, confirm_prompt(), AMBER);
        else color_text(8, 38, diag_user, ACCENT);
        if (0) {
            /* Task 12 A2: the step / page / clipboard line left with the step editor. */
            dim_text(8, 38, "T"); small_number(16, 38, track + 1, 1, TEXT);
            dim_text(36, 38, tone_clip_ready ? "TIMBRE COPIED" : "NO TIMBRE COPIED");
        }
        unsigned first = 0;   /* Task 12 A2: the seven entries fit on one screen */
        for (unsigned i = 0; i < ACTION_COUNT; ++i) {
            unsigned at = first + i, y = 57 + i * 19;
            uint16_t bg = at == action ? PANEL : BACK;
            paint_fill(6, y, 228, 17, bg);
            const char *label = actions[at];
#ifdef CT_A2
            if (at == ACT_A2 && !ct_a2_get()) label = "A2 FAST MIDI: OFF";   /* Task 15; v0.8: on at boot */
#endif
            text(10, y + 5, label, 1, at == action ? ACCENT : DIM, bg);
        }
        plain_text(8, 213, notice ? notice : diag_song);
        dim_text(8, 231, action_confirm ? "4TH LEFT BTN CONFIRM  HOME CANCEL" : "K1/K5 ACTION  4TH LEFT BTN DOES IT");
    } else if (visible == SONG) {
        /* Task 03 d: song mode. Row = song record row, pads queue jumps. */
        struct song_status st; song_status_read(&st);
        const struct song_record *rec = song_current();
        unsigned storage = song_storage_state();
        text(8, 40, "SONG", 2, ACCENT, BACK);
        number(72, 40, (int)song_select + 1, 2, 2, TEXT, BACK);
        if (rec && st.song == song_select) {
            char name[13]; memcpy(name, rec->name, 12); name[12] = 0;
            text(104, 40, name, 1, TEXT, BACK);
        } else dim_text(104, 40, storage == SONG_STORAGE_READY ? "(EMPTY)" : "");
        if (storage != SONG_STORAGE_READY) {
            color_text(8, 70, storage == SONG_STORAGE_OLD_DATA ? "OLD DATA IN SONG STORAGE" :   /* Task 12 A1 */
                              storage == SONG_STORAGE_ERROR ? "SONG STORAGE ERROR" :
                              storage == SONG_STORAGE_COMPACTING ? "COMPACTING STORAGE..." : "SCANNING STORAGE...", AMBER);
            if (storage == SONG_STORAGE_OLD_DATA) dim_text(8, 88, "ACTIONS: ERASE OLD DATA (CONFIRM)");
        } else if (rec && st.song == song_select) {
            unsigned row = st.playing ? st.row : 0;
            const struct song_row *r = &rec->row[row];
            dim_text(8, 70, "ROW"); small_number(32, 70, row + 1, 3, ACCENT);
            dim_text(58, 70, "/"); small_number(64, 70, rec->rows, 3, TEXT);
            dim_text(96, 70, "X"); small_number(104, 70, st.playing ? st.repeat + 1U : 1, 2, TEXT);
            dim_text(118, 70, "/"); small_number(124, 70, r->repeat, 2, TEXT);
            dim_text(150, 70, "BAR"); small_number(174, 70, st.step / 16U + 1U, 1, TEXT);
            dim_text(186, 70, "/"); small_number(192, 70, (r->steps ? r->steps : 64U) / 16U, 1, TEXT);
            if (st.playing == 1 && st.follow) {
                /* Task 16 Goal 3: CLOCK = MIDI: the song follows the master (SPEC 19.3). */
                static const char *const fol[] = {"", "ARMED: START?", "PREPARING", "WAIT PULSE", "FOLLOWING", "HOLD: NO CLOCK", "LOST - CONTINUE", "STOP BY MASTER"};
                color_text(8, 88, fol[st.follow < 8 ? st.follow : 0], st.follow == 4 ? GREEN : st.follow == 5 || st.follow == 6 ? AMBER : DIM);
            } else
            color_text(8, 88, st.playing == 2 ? "STOPPING" : st.playing ? "PLAYING" : "STOPPED - PLAY STARTS", st.playing ? GREEN : DIM);
            if (st.queued != SONG_NONE) { dim_text(104, 88, "JUMP TO ROW"); small_number(176, 88, st.queued + 1U, 3, AMBER); }
            else if (st.playing && st.next_row != SONG_NONE) { dim_text(104, 88, "NEXT ROW"); small_number(158, 88, st.next_row + 1U, 3, TEXT); }
            else if (st.playing) dim_text(104, 88, r->flags & SONG_ROW_FLAG_LOOP_HERE ? "LOOPING ROW" : "LAST ROW");
            /* Block id per track of the shown row, one column per track. */
            for (unsigned t = 0; t < SONG_TRACKS; ++t) {
                unsigned x = 8 + t * 29;
                color_text(x, 108, "T", colors[t]); small_number(x + 6, 108, t + 1, 1, colors[t]);
                if (r->block[t]) small_number(x, 120, r->block[t], 5, TEXT); else dim_text(x, 120, "-");
            }
            /* Row pads: pads 1-16 = rows 1-16 of the pad page. */
            dim_text(8, 140, "PADS ROW"); small_number(64, 140, song_row_page * 16U + 1U, 3, TEXT);
            dim_text(86, 140, "-"); small_number(94, 140, song_row_page * 16U + 16U, 3, TEXT);
            dim_text(130, 140, st.jump_mode ? "JUMP: ROW END" : "JUMP: NEXT BAR");
            if (st.error) { color_text(8, 158, st.error == (unsigned)(SONG_FULL & 255) ? "TOO MANY BLOCKS" : "BLOCK READ ERROR", AMBER); }
            else if (st.underruns) color_text(8, 158, "ROW DECODE LATE", AMBER);
            if (rec->tempo) { dim_text(130, 158, "BPM"); small_number(154, 158, rec->tempo, 3, TEXT); }
            /* Task 04 (9.11): the song's row events and the late count since PLAY. */
            if (st.events) {
                dim_text(8, 176, "EVENTS"); small_number(56, 176, st.events, 3, TEXT);
                if (st.late) { color_text(104, 176, "LATE", AMBER); small_number(140, 176, st.late, 3, AMBER); }
            }
        } else {
            dim_text(8, 70, st.error == (unsigned)(SONG_FULL & 255) ? "TOO MANY BLOCKS IN SONG" : "NO SONG HERE - UPLOAD FROM");
            dim_text(8, 88, "THE WEB WORKBENCH");
        }
        plain_text(8, 198, notice ? notice : "K5/K7 SONG  PADS JUMP  OCT PAD PAGE");
        dim_text(8, 213, "PLAY START/STOP  K4 JUMP MODE");
        dim_text(8, 231, "SCL TRACK LAUNCH   HOME BACK");
    } else if (visible == TRACK_LAUNCH) {
        /* Task 06 (c): every track's state and pattern, the selected track's patterns of the
         * pad page (pads launch / stop), the master clock (9.13). */
        struct song_status st; song_status_read(&st);
        const struct song_record *rec = song_current();
        text(8, 40, "LAUNCH", 2, ACCENT, BACK);
        text(104, 40, "T", 2, colors[track], BACK); number(118, 40, track + 1, 1, 2, colors[track], BACK);
        dim_text(150, 40, "BAR"); small_number(174, 40, st.playing ? st.bar + 1U : 0, 4, TEXT);
        static const char *const words[] = {"FOLLOW", "PLAY", "STOP"};
        for (unsigned t = 0; t < SONG_TRACKS; ++t) {
            unsigned x = 8 + t * 29, state = st.track_state[t] & 3U, queue = (st.track_state[t] >> 2) & 3U;
            color_text(x, 66, "T", colors[t]); small_number(x + 6, 66, t + 1, 1, colors[t]);
            if (st.track_row[t] != SONG_NONE) small_number(x, 78, st.track_row[t] + 1U, 3, t == track ? ACCENT : TEXT); else dim_text(x, 78, "-");
            if (queue == SONG_QUEUE_LAUNCH) { color_text(x, 90, "Q", AMBER); small_number(x + 6, 90, st.track_queued[t] + 1U, 3, AMBER); }
            else if (queue == SONG_QUEUE_STOP) color_text(x, 90, ">STOP", AMBER);
            else if (queue == SONG_QUEUE_ATTACH) color_text(x, 90, ">SONG", AMBER);
            else color_text(x, 90, words[state], state == 1 ? GREEN : state == 2 ? DIM : TEXT);
        }
        /* The selected track's patterns on this pad page: a cell per pad, filled when the row
         * has a block for the track, bright when it plays, amber when queued. */
        dim_text(8, 112, "PATTERNS"); small_number(64, 112, song_row_page * 16U + 1U, 3, TEXT);
        dim_text(86, 112, "-"); small_number(94, 112, song_row_page * 16U + 16U, 3, TEXT);
        dim_text(130, 112, "OCT PAGE");
        for (unsigned i = 0; i < 16; ++i) {
            unsigned r = song_row_page * 16U + i, x = 8 + i * 14;
            unsigned has = rec && r < rec->rows && rec->row[r].block[track] != 0;
            uint16_t c = !has ? PANEL : st.track_queued[track] == r && ((st.track_state[track] >> 2) & 3U) == SONG_QUEUE_LAUNCH ? AMBER
                       : st.track_row[track] == r ? GREEN : DIM;
            paint_fill(x, 126, 12, 12, c);
            if (has) small_number(x + 1, 129, i + 1, 2, BACK);
        }
        if (st.playing) {
            dim_text(8, 150, "ROW"); small_number(32, 150, st.row + 1U, 3, ACCENT);
            dim_text(58, 150, st.song_over ? "SONG OVER" : "");
            if (st.late) { color_text(130, 150, "LATE", AMBER); small_number(166, 150, st.late, 3, AMBER); }
        } else dim_text(8, 150, "STOPPED - PLAY STARTS THE SONG");
        plain_text(8, 198, notice ? notice : "PADS LAUNCH/STOP  SHIFT+PAD TRACK");
        dim_text(8, 213, "ENV BACK TO SONG  SHIFT+ENV ALL");
        dim_text(8, 231, "SCL SONG PAGE  HOME BACK");
    } else if (visible == ARP_EDIT) {
        text(8, 40, "ARPEGGIATOR", 2, ACCENT, BACK);
        text(184, 40, "T", 2, colors[track], BACK);
        number(198, 40, track + 1, 1, 2, colors[track], BACK);
        plain_text(8, 72, !groove_arp_enabled(track) ? "OFF - TAP ARP TO ENABLE" : groove_arp_setting(track, 5) ? "ON - HOLD LATCHES YOUR CHORD" : "ON - HOLD KEYS TO PLAY");
        dim_text(8, 96, "K5 TRACK  K1-K4 ADJUST");
        dim_text(8, 118, "RATE FOLLOWS BPM / MIDI CLOCK");
        dim_text(8, 140, arp_page ? "RELEASE ALL KEYS FOR A NEW CHORD" : groove_pad_count(track) ? "DRUMS: RANGE / GATE UNAVAILABLE" : "UP / DOWN / UP-DOWN / RANDOM");
        dim_text(8, 162, "ARP BOTH - SHIFT+SEQ: OUT PORT");
        accent_text(8, 180, arp_page ? "2/2 HOLD / MIDI  K6 TURN" : "1/2 NOTES  K6 TURN");
        static const char *const rates[] = {"1/4", "1/8", "1/16", "1/32"};
        static const char *const modes[] = {"UP", "DOWN", "UP-DN", "RANDOM"};
        char range[12], gate[12];
        decimal(range, groove_arp_setting(track, 2) + 1, 1); strcat(range, " OCT");
        decimal(gate, (groove_arp_setting(track, 3) + 1) * 25, 1); strcat(gate, "%");
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
        text(8, 40, "DX7 QUICK EDIT", 2, ACCENT, BACK);
        char name[11]; memcpy(name, frame_patch + 145, 10); name[10] = 0;
        small_number(8, 76, frame_views[track].program + 1, 3, ACCENT);
        dim_text(28, 76, "/128");
        color_text(56, 76, frame_views[track].modified ? "*" : " ", AMBER);
        text(72, 72, name, 2, TEXT, BACK);
        plain_text(8, 102, "K7 VOICE  K6 BANK");
        dim_text(8, 126, "VOICE EDIT: WEB WORKBENCH");
        dim_text(8, 148, "EDIT BACK");
        dim_text(8, 170, "KEYS PLAY  K5 TRACK");
        static const char *const labels[] = {"ALGORITHM", "FEEDBACK", "TRANSPOSE", "LEVEL"};
        int values[] = {frame_patch[134] + 1, frame_patch[135], (int)frame_patch[144] - 24, frame_views[track].volume};
        for (unsigned i = 0; i < 4; ++i) { char value[12]; decimal(value, values[i], 1); knob(i, labels[i], value, colors[i]); }
    }
}
/* Task 08: the boot screen shows the Classic Tabby display version (FM1_DISPLAY_VERSION, set
 * by the build from the git tag; app/version.h falls back to the Open label). A tag such as
 * "tabby-v03.1" draws at scale 2 (12 pixels a character, up to 20 characters on the 240-pixel
 * screen); a longer development string (tag-count-hash-dirty) draws at scale 1. */
#define BOOT_VERSION_SCALE (sizeof FM1_DISPLAY_VERSION - 1 <= 20 ? 2 : 1)
static __attribute__((noinline, cold, minsize)) void boot_draw(void)
{
    if (cache->title_cache != 0) {
        cache->title_cache = 0;
        text(60, 48, "SMK37", 4, TEXT, BACK);
        accent_text(81, 98, "OFFICIAL OPEN");
        text((240 - 6 * BOOT_VERSION_SCALE * (sizeof FM1_DISPLAY_VERSION - 1)) / 2, 120,
             FM1_DISPLAY_VERSION, BOOT_VERSION_SCALE, TEXT, BACK);
        dim_text(102, 208, "M-VAVE");
    }
    if (cache->middle_cache == boot_phase) return;
    cache->middle_cache = boot_phase;
    static const uint8_t height[8] = {8, 18, 30, 42, 42, 30, 18, 8};
    for (unsigned i = 0; i < 8; ++i)
        paint_fill(58 + 16 * i, 166 - height[i] / 2, 12, height[i],
                   i < boot_phase ? colors[i] : PANEL);
}
/* Explain intentional silence without changing performance or MIDI routing.
 * REC remains global: external MIDI may record other NORMAL tracks while
 * the selected PLAY track is used for a live performance. */
static __attribute__((noinline)) const char *performance_hint(unsigned visible, const struct groove_view views[8])
{
    const struct groove_view *v = &views[track];
    unsigned role = groove_track_role(track);
    if (visible == STEPS && seq_page == SEQ_MIDI_TRACK) return "K1 IN: RECEIVE  K2 OUT: SEND";
    if (role == GROOVE_TRACK_OFF) return "TRACK OFF - SHIFT+HOME K2 TO ENABLE";
    if (!fm1_engine_output_level()) return "MASTER MUTED - TURN K8 UP";
    if (v->muted) return "TRACK MUTED - MIX / PAD TO UNMUTE";
    /* The engine already resolves the independent NORMAL / PLAY solo groups. */
    if (!v->audible) return "OTHER TRACK SOLO - MIX TO CHECK";
    if (!v->volume) return "TRACK LEVEL 0 - USE MIX / FADER";
    if (groove_midi_input_channel(smk37_performance_track(0))==
        groove_midi_input_channel(smk37_performance_track(1)))
        return "KEY/PAD SAME CH - SHIFT+SEQ TO SET";
    return NULL;
}
static void hint_draw(const char *hint)
{
    uint32_t sig = signature(0, hint, (unsigned)strlen(hint));
    if (sig == cache->hint_cache) return;
    cache->hint_cache = sig;
    erase(6, 231, 228, 7);
    dim_text(6, 231, hint);
}
static __attribute__((noinline, cold, minsize)) void draw_page_body(const struct fm1_ble_status *ble)
{
    (void)ble; /* Task 06 (a): the BLE page is gone */
    unsigned visible = boot_active ? STARTUP : glo_down && glo_used ? MIX : page;
    if (visible != cache->shown_page) {
        memset(cache, 0xff, sizeof *cache);
        cache->shown_page = visible;
        erase(0, 0, 240, 240);
        if (visible != STARTUP) paint_fill(0, 29, 240, 1, PANEL);
        if (visible == PROJECT || visible == PRESET_BROWSER)
            text(8, 8, visible == PROJECT ? "SAVE PROJECT" : "PRESETS", 2, ACCENT, BACK);
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
    const char *state_hint = notice ? notice : performance_hint(visible, views);
    if (visible >= SOURCE) {
        edit_page_draw(visible);
        if (visible == FM_QUICK || visible == ARP_EDIT)
            hint_draw(state_hint ? state_hint : visible == FM_QUICK
                ? "EDIT BACK  K5 TRACK" : "ARP ON/OFF   HOME BACK");
        return;
    }
    if (visible == EFFECTS) {
        effects_draw();
        hint_draw(state_hint ? state_hint : "K6 EFFECTS  K5 TRACK");
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
    /* Lower controls cannot intersect an upper LCD band. Avoid formatting
     * their labels and querying the engine once for every unrelated band. */
    if (paint_rendering && paint_top + PAINT_ROWS <= 184) return;
    if (visible == STEPS) {
        uint32_t strip = seq_page << 10;
        if (cache->seq_cache != strip) {
            cache->seq_cache = strip;
            erase(0, 184, 240, 11);
            accent_text(8, 186, seq_pages[seq_page]);
            dim_text(150, 186, seq_page == SEQ_SYNC ? "SEQ+EDIT: ACTIONS" : "K5: TRACK");
        }
    }
    for (unsigned col = 0; col < 4; ++col) {
        char value[12];
        const char *label;
        uint16_t color = colors[col];
        if (visible == STEPS && seq_page == SEQ_SYNC) {
            /* Task 12 A2: SYNC / MIDI. K1 CLOCK (was 5/7 K1), K2 CLK IN (5/7 K4), K3 SWING (3/7 K1),
             * K4 SEQ OUT (7/7 K1). KEY OUT (7/7 K2) is on PRESETS and in the body. */
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
            static const char *const labels[8] = {"TRACK 1", "TRACK 2", "TRACK 3", "TRACK 4",
                                                  "TRACK 5", "TRACK 6", "TRACK 7", "TRACK 8"};
            label = labels[t];
            color = colors[t];
            decimal(value, views[t].volume, 1);
        } else {
            static const char *const labels[4] = {"LEVEL", "-", "NOTE", "BPM"};
            label = labels[col];
            if (col == 0)
                decimal(value, v->volume, 1);
            else if (col == 1 && visible == OVERVIEW) {
                label = "SOURCE";
                strcpy(value, source_names[v->type]);
            } else if (col == 1 || (col == 2 && visible == OVERVIEW)) {
                /* Task 12 A2: no STEP control any more (HOME K3, K2 elsewhere). */
                label = "-"; strcpy(value, "--"); color = DIM;
            } else if (col == 2 && groove_pad_count(track) != 0) {
                label = "DRUM";
                decimal(value, drum + 1, 2);
            } else if (col == 2)
                note_name(selected_note, value);
            else if (v->clock_mode) {
                label = "MIDI";
                if (!v->tempo)
                    strcpy(value, v->clock_state == GROOVE_CLOCK_LOST ? "LOST" : "WAIT");
                else
                    decimal(value, v->tempo, 1);
            } else
                decimal(value, v->tempo, 1);
        }
        knob(col, label, value, color);
    }
    char routing[]="KEY T1 CH01  PAD T8 CH10  AT000";
    if(visible==OVERVIEW) {
        for(unsigned i=0;i<2;++i) {
            unsigned at=i?13:0,t=smk37_performance_track(i),ch=groove_midi_input_channel(t)+1;
            routing[at+5]=(char)('1'+t);
            routing[at+9]=(char)('0'+ch/10);routing[at+10]=(char)('0'+ch%10);
        }
        char pressure[12];decimal(pressure,smk37_pad_aftertouch(),3);
        memcpy(routing+28,pressure,3);
    }
    const char *hint = state_hint ? state_hint
                       : v->clock_mode && v->clock_state != GROOVE_CLOCK_LOCKED
                           ? "WAIT MIDI CLOCK - SEQ SYNC: INT/MIDI"
                       : visible == OVERVIEW && (previous_buttons & BUTTON(HOME))
                           ? "K7 SOURCE  EDIT PARAMETERS"
                       : visible == OVERVIEW ? routing
                       : visible == STEPS    ? seq_page == SEQ_SYNC ? "K7 KEY OUT  SHIFT+SEQ MIDI TRACK" : "SEQ: SYNC / MIDI  HOME BACK"
                       : visible == MIX      ? "PADS MUTE/SOLO  MIX / HOME BACK"
                       : "K5 TRACK  HOME TRACKS";
    hint_draw(hint);
}
static void draw_page(const struct fm1_ble_status *ble)
{
    draw_page_body(ble);
    if (shift_visible && !boot_active && (paint_rendering || cache->shortcut_cache != track)) {
        cache->shortcut_cache = track;
        paint_fill(0, 195, 240, 45, PANEL);
        text(8, 198, "SHIFT SHORTCUTS", 1, ACCENT, PANEL);
        text(8, 209, "PADS 1-8 TRACK   PADS 9-16 MUTE", 1, TEXT, PANEL);
        text(8, 220, "HOME/SRC SOURCE  SEQ MIDI", 1, TEXT, PANEL);
        text(8, 231, "PAD/STEP KEY-PAD  RELEASE TO RETURN", 1, DIM, PANEL);
    }
    if (boot_active || (paint_rendering && paint_top >= 30)) return;
    uint32_t since = 0;
    unsigned active = 1;
    if (glo_down && !glo_used) since = glo_ms;
    else if (arp_down && !arp_long) since = arp_ms;
    else if (seq_down) since = seq_ms;
    else active = 0;
    unsigned width = active ? (unsigned)clamp((int)(frame_time - since), 0, 600) * 224U / 600U : 0;
    if (cache->hold_cache == width) return;
    cache->hold_cache = width;
    erase(8, 27, 224, 2);
    if (width) paint_fill(8, 27, width, 2, ACCENT);
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
    for (unsigned t = 0; t < GROOVE_TRACKS; ++t) {
        groove_get_view(t, cursor, &frame_views[t]);
        if (visible == OVERVIEW && frame_views[t].type == GROOVE_DX7 && !groove_fm_copy(t, frame_patch, NULL))
            memcpy(frame_fm_names[t], frame_patch + 145, 7);
    }
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
    draw_page(&frame_ble);
}
/* Task 13 Step 1: the last band's paint time (24 MHz ticks), the estimate for the next band, and
 * when a band last went out (the starvation guard). */
static uint32_t band_ticks_last = 24000U, band_sent_ms;
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
        if (paint_priority && !starving)
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
        if (ct_midi_due_within(band_ticks_last + 36000U) && fm1_millis() - band_sent_ms < CT_PASS_STARVE_MS) {
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
        if (fm1_screen_submit(left, paint_top, width, PAINT_ROWS,
                            paint_pixels, width * PAINT_ROWS)) {
            saved_cache.shown_page = ~0U; /* Retry the whole page after a transport error. */
            break;
        }
        paint_left[band] = FM1_SCREEN_WIDTH;
        paint_right[band] = 0;
        paint_priority &= ~(1U << band);
        ++diag_bands;
        band_ticks_last = ct_diag_ticks() - band_start;
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
    announce(start ? "PRESET LOADED - PLAYING" : "PRESET LOADED - PLAY TO START", now + 2000U);
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
    announce(bpm < 0 ? "TAP: EXTERNAL MIDI CLOCK" : bpm ? "TAP TEMPO APPLIED" : "TAP AGAIN / HOME+SEQ", now + 1500U);
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
    if (pressed || encoder_active(controls->encoders)) notice = NULL;
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
    /* Task 06 (c): on the song pages SCL switches SONG and TRACK LAUNCH, ENV sends the
     * selected track back to the song at the next bar, SHIFT+ENV (LFO) every track. */
    if ((page == SONG || page == TRACK_LAUNCH) && (pressed & (BUTTON(SCL) | BUTTON(ENV) | BUTTON(LFO)))) {
        if (pressed & BUTTON(SCL)) { page = page == SONG ? TRACK_LAUNCH : SONG; cache->shown_page = ~0U; }
        else if (pressed & BUTTON(LFO)) { song_track_attach_all(); announce("ALL TRACKS BACK TO SONG AT BAR", now + 1500U); }
        else { announce(song_track_attach(track) ? "NOT PLAYING" : "TRACK BACK TO SONG AT BAR", now + 1500U); }
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
        /* Task 12 A2: no recording on the device in this version (Phase 5 brings it back). */
        glo_down = 0;
        announce("NO REC IN THIS VERSION", now + 1500U);
        goto controls_done;
    }
    if (page != ACTIONS)
        {
            int next=clamp(octave + !!(pressed & BUTTON(OCT_UP)) - !!(pressed & BUTTON(OCT_DOWN)), -2, 2);
            if(next!=octave) {octave=next;groove_settings_panel_changed();}
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
            int r = song_load(song_select);
            if (r == SONG_EMPTY) notice = NULL;
        }
        int paging = !!(pressed & BUTTON(OCT_UP)) - !!(pressed & BUTTON(OCT_DOWN));
        if (paging) song_row_page = (unsigned)clamp((int)song_row_page + paging, 0, SONG_ROWS / 16 - 1);
        if (controls->encoders[5]) song_jump_mode_set(controls->encoders[5] > 0);
        for (unsigned i = 0; i < 16; ++i)
            if ((key_down & ~blocked_keys) & (1U << white_keys[i])) {
                if (song_queue_jump(song_row_page * 16U + i)) announce("NO SUCH ROW / NOT PLAYING", now + 1500U);
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
        /* Task 06 (c): pads queue the selected track's patterns (the playing one queues a
         * stop), OCT pages the pads, PLAY starts and stops the song as on the SONG page. */
        play_handled = 1;
        struct song_status st; song_status_read(&st);
        const struct song_record *rec = song_current();
        int paging = !!(pressed & BUTTON(OCT_UP)) - !!(pressed & BUTTON(OCT_DOWN));
        if (paging) song_row_page = (unsigned)clamp((int)song_row_page + paging, 0, SONG_ROWS / 16 - 1);
        for (unsigned i = 0; i < 16; ++i)
            if ((key_down & ~blocked_keys) & (1U << white_keys[i])) {
                unsigned r = song_row_page * 16U + i;
                if (!st.playing) announce("PLAY STARTS THE SONG FIRST", now + 1500U);
                else if (!rec || r >= rec->rows || !rec->row[r].block[track]) announce("NO PATTERN ON THIS PAD", now + 1500U);
                else if (st.track_row[track] == r && ((st.track_state[track] >> 2) & 3U) != SONG_QUEUE_LAUNCH) {
                    if (!song_track_stop(track)) announce("STOP AT NEXT BAR", now + 1500U);
                } else if (!song_track_launch(track, r)) announce("LAUNCH AT NEXT BAR", now + 1500U);
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
            unsigned destructive = action == ACT_PASTE_TIMBRE || action == ACT_ERASE_OLD || action == ACT_COMPACT;
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
            announce(r ? "UNAVAILABLE / INCOMPATIBLE" : action == ACT_COPY_TIMBRE ? "TIMBRE COPIED" : "DONE", now + 2000U);
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
                        announce(r ? "TRACK SETTING FAILED" : parameter == 0 ? "SEQ OUTPUT UPDATED" : "MIDI SETTING - NOTES RELEASED", now + 1500U);
                    }
                }
                if (page == ARP_EDIT) {
                    arp_page = (unsigned)clamp((int)arp_page + controls->encoders[1], 0, 1);
                    for (unsigned i = 0; i < 4; ++i) if (controls->encoders[2 + i]) {
                        if (arp_page && i == 3) {
                            groove_settings_midi(track, 1, controls->encoders[2 + i]);
                            announce("MIDI SETTING - NOTES RELEASED", now + 1500U);
                        } else if (arp_page) { if (i < 2) groove_arp_edit(track, i + 4, controls->encoders[2 + i]); }
                        else if (groove_pad_count(track) && i >= 2) {
                            announce("RANGE / GATE FOR MELODIC TRACKS", now + 2000U);
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
                            announce("EXTERNAL CLOCK - USE INT FOR BPM", now + 2000U);
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
    if (notice && (int32_t)(now - notice_until) >= 0) notice = NULL;
    /* Task 03 a: first boot on the song-storage layout with V01 data still in the region. */
    static unsigned migration_seen;
    if (!migration_seen && song_storage_state() == SONG_STORAGE_OLD_DATA) {
        migration_seen = 1;
        announce("OLD DATA IN SONG STORAGE - SEE ACTIONS", now + 6000U);   /* Task 12 A1 */
    }
    unsigned modes = smk37_fader_bank() | (smk37_pad_steps() << 1);
    if (modes != panel_modes_seen) {
        announce((modes ^ panel_modes_seen) & 2U
            ? modes & 2U ? "PAD STEPS - SHIFT+PAD TO PLAY" : "PAD PLAY - SHIFT+PAD TO EDIT STEPS"
            : modes & 1U ? "FADERS 5-8 - MOVE TO MATCH LEVEL" : "FADERS 1-4 - MOVE TO MATCH LEVEL", now + 1800U); panel_modes_seen = modes;
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
            announce("CPU GUARD - VOICES ADAPTED", now + 2500U);
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
        if (ct_pass_over(0) && now - frame_ms < 33U + 2U * CT_PASS_STARVE_MS) ct_pass_defer(CT_DEFER_DRAW);
        else {
            frame_ms = now;
            draw(&ble);
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
static unsigned launch_phase(void)
{
    struct song_status st; song_status_read(&st);
    return st.playing ? (st.bar_step >> 1) & 1U : (fm1_millis() / 250U) & 1U;
}
/* The pad colours of the TRACK LAUNCH page (assessment 5.3), or 0 = not this page. Pads
 * 1-16 are the selected track's patterns of the pad page: green playing, flashing green
 * queued, flashing red a pending stop, dim white a pattern, off empty; under SHIFT pads 1-8
 * show the eight tracks in their colours: bright playing or following with a block, dim
 * stopped or silent, flashing queued; the selected track brighter still. Pads 9-16 under
 * SHIFT keep their mute view. One status snapshot per control read (pad 0 refreshes it). */
int smk37_screen_launch_color(unsigned pad, uint32_t *rgb)
{
    static struct song_status st; static unsigned phase;
    if (page != TRACK_LAUNCH || pad >= 16) return 0;
    if (pad == 0) { song_status_read(&st); phase = st.playing ? (st.bar_step >> 1) & 1U : (fm1_millis() / 250U) & 1U; }
    if (smk37_shift()) {
        if (pad >= 8) return 0;
        unsigned c = colors[pad], state = st.track_state[pad] & 3U, queue = (st.track_state[pad] >> 2) & 3U;
        const struct song_record *r = song_current();
        unsigned on = st.track_row[pad] != SONG_NONE && state != SONG_TRACK_STOPPED && r && r->row[st.track_row[pad]].block[pad] != 0;
        unsigned level = queue ? (phase ? 2U : 0U) : on ? 2U : 1U;
        if (pad == track && level) ++level;
        *rgb = level ? ((c >> 11) & 31U) << (15 + level) | ((c >> 5) & 63U) << (6 + level) | (c & 31U) << level : 0;
        return 1;
    }
    const struct song_record *rec = song_current();
    unsigned r = song_row_page * 16U + pad, queue = (st.track_state[track] >> 2) & 3U;
    if (!rec || r >= rec->rows || !rec->row[r].block[track]) { *rgb = 0; return 1; }
    if (queue == SONG_QUEUE_LAUNCH && st.track_queued[track] == r) *rgb = phase ? 0x083008 : 0;
    else if (queue == SONG_QUEUE_STOP && st.track_row[track] == r) *rgb = phase ? 0x300808 : 0;
    else if (st.track_row[track] == r) *rgb = 0x083008;
    else *rgb = 0x080808;
    return 1;
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
    notice=pad_focus?"PAD READY - EDIT / FX":"KEY READY - EDIT / FX";
    notice_until=fm1_millis()+2000U;
    boot_active=0;cache->shown_page=~0U;
}
unsigned smk37_screen_pad_key(unsigned pad)
{
    if(pad>=16)return 255;
    return navigation_mode()?white_keys[pad]:255;
}
/* Task 12 A2: pad-step mode is gone (smk37_controls.c never sets it); pads always play. */
int smk37_screen_pad(unsigned pad,unsigned velocity,unsigned steps)
{
    (void)pad; (void)velocity; (void)steps;
    return 0;
}
void smk37_screen_page(unsigned target)
{
    if(!release_keys())return;
    blocked_keys|=previous_keys;
    glo_down=glo_used=seq_down=arp_down=arp_long=0;
    /* Task 06 (a): the BT button has no page any more; Bluetooth is set from the workbench. */
    if(target==SMK37_PAGE_BLUETOOTH) {announce("BLUETOOTH: SET IN WORKBENCH",fm1_millis()+2000U);boot_active=0;return;}
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
        notice="TRACK OFF - SHIFT+HOME K2";
    } else {
        groove_mix_toggle(pad-8,0);
        notice="TRACK MUTE CHANGED";
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
    if ((target > ARP_EDIT && target != SONG && target != TRACK_LAUNCH) || target == PROJECT) return -1;
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
        web_target(6, 4, 65, 23, 1, 0, track, "BPM", v.tempo, NULL);
    if (page == OVERVIEW) {
        for (unsigned t = 0; t < 8; ++t) {
            struct groove_view row; groove_get_view(t, cursor, &row);
            char label[16] = "T1 LEVEL"; label[1] += t;
            web_target(210, 48 + t * 18, 27, 16, 2, 0, t, label, row.volume, NULL);
        }
    } else if (page == SOURCE) {
        web_target(6, 178, 228, 18, 6, 3, track, "TRACK MODE", groove_track_role(track), track_modes[groove_track_role(track)]);
    } else if (page == FM_QUICK) {
        web_target(6, 66, 228, 26, 6, 6, track, "VOICE", v.program + 1, NULL);
        web_target(6, 98, 228, 18, 6, 1, track, "BANK", v.program / 32 + 1, NULL);
    } else if (page == ARP_EDIT) {
        web_target(6, 176, 222, 16, 6, 1, track, "ARP PAGE", arp_page + 1, arp_page ? "HOLD / MIDI" : "NOTES");
    } else if (page == EFFECTS) {
        for (unsigned col = 0; col < 4; ++col) web_alias(6, 86 + col * 22, 204, 20, col);
        web_target(6, 59, 228, 18, 6, 6, track, "FX PAGE", effects_page, effects_page == 2 ? "DELAY" : effects_page ? "SHARED" : "TRACK");
    } else if (page == MIX) {
        for (unsigned i = 0; i < 16; ++i) {
            struct groove_view row; groove_get_view(i & 7U, cursor, &row);
            unsigned on = i < 8 ? row.muted : row.solo;
            char label[16] = "T1 MUTE"; label[1] += i & 7U;
            if (i >= 8) memcpy(label + 3, "SOLO", 4);
            web_target(8 + i % 4 * 57, 72 + i / 4 * 29, 53, 25, 7, i >= 8, i & 7U, label, on, on ? "ON" : "OFF");
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
