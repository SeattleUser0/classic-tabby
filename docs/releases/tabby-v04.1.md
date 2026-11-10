# Classic Tabby tabby-v04.1 — timing fixes (option B), panel wording, safer update page

A normal update from tabby-v04.0: **no storage move, no backup or restore needed**. Projects,
songs and settings stay where they are (USER 471040, the same layout). Install steps:
~/Documents/Classic Tabby/INSTALL-tabby-v04.1.txt (written from docs/releases/INSTALL.template.txt)
and docs/BUILD.md 27.5.

Classic Tabby is a performance fork of SMK37 Open V01 for the M-VAVE SMK-37 Pro. Everything below
is built from the tagged tree with the project's reproducible Linux toolchain; the native toolchain
and the Windows toolchain under Wine produce byte-identical output (`make crosscheck`).

- Firmware package build ID: `013976a54777bb5fa25ae42738aac840e2016584245a663296f7aee396a03d27`.
  The Device update tab shows build number **013976a54777bb5f**; while an install of this build is in
  progress the device's update loader is named `ota-SMK37013976a54777bb5f`.
- The boot screen and the workbench badge show **tabby-v04.1**; the Open base version stays **V01**;
  the device still identifies as `SMK-37 Pro_8000001`.
- App image 448420 bytes; margin **71037 bytes** to the packaging limit of 519457 bytes
  (docs/FLASH-BUDGET.md 18).
- **Hardware validation:** not installed on a device yet. The timing result is measured after the
  install (Task 13 Step 6) against the tabby-v04.0 numbers of docs/BUILD.md 26.9.

## What is new (Task 13)

**No control pass over the 10 ms tick (option B).** The SDK runs the app's control pass from a
fixed 10 ms timer and drops a tick while a pass is still running, which turned a 0-10 ms MIDI wait
into 10-20 ms (docs/BUILD.md 26.9). The pass now keeps a 6 ms budget: the LCD compose, each LCD band
and a new workbench request wait for a later pass once the budget is used (each with a guard so the
picture and the workbench still progress); MIDI sends and song scheduling always run first and are
never deferred; the router is flushed after every LCD band, so notes queued while the screen paints
leave at once. The command 25 diagnostics gain page 6 (busy time per pass, lost ticks, deferrals).
Expected: the 20 ms tail goes; the 10 ms step of the SDK timer stays (one line about 10-11 ms).

**Option A was checked and not built.** Asking the SDK for extra passes from the song tick is not
safe: the song tick runs inside the audio interrupt, and the SDK's pass request suspends the
scheduler and may yield (docs/BUILD.md 27.2). The 4 ms target needs an SDK change.

**Panel wording.** Knobs are named by their printed numbers K1-K8 (the firmware's SELECT is K5,
PAGE K6, PRESETS K7, MASTER K8); the button the firmware called SAVE is named by its position, the
4th button in the left group (after SHIFT, FADER BANK, HOME), "4TH LEFT BTN" on the screen. The SONG
page now says K5/K7 SONG (it said K1). Screen text, Help, the panel shortcuts and the READMEs follow
docs/SPEC.md 17.4, the table that starts the sticker map.

**Safer update page** (from the 2026-11-09 install incident, docs/BUILD.md 26.8): a query timeout
is retried (4 tries) and then says the device did not answer and to power-cycle it; force flash is
never turned on or suggested automatically (it stays a manual choice in the migration section); a
loader reporting the all-zero tag `ota-SMK370000000000000000` takes the model-confirmed resume.

**MIDI guide:** section 14, the recommended live wiring (SMK-37 USB into the CME H4MIDI WC, one DIN
cable per device) and what running status does on DIN (the SDK uses it; it saves nothing when the
eight notes of a step are on eight channels).

CPU GUARD (the SDK's audio render budget, which takes voices away from a heavy track) is described
in docs/SPEC.md 17.2 and unchanged.
