# Classic Tabby — Flash budget of SMK37 Open V01 (Pro)

Version: 0.5
Revision log:
- v0.5, 2026-11-02 (Task 03 checkpoint b): section 6 added with the measured result of
  removing the DX7 operator editor pages and the tone editor (−11008 bytes, margin 14109),
  the post-song-mode headroom projection and the further removal candidates with sizes.
- v0.4, 2026-11-02 (Task 03 checkpoint a): section 5 added with the measured result of
  removing the sampler and the DX7 user library: app image 450820 bytes (−3072), margin
  3101 bytes. Sections 1-4 keep the V01 figures as the baseline they were measured on.
- v0.3.1, 2026-11-01 (Steps 4-8): no figure changed. The same `sdk.elf` is now produced by
  the default Track B build (`make firmware`, native toolchain) and by Track A, and the
  official V01 package was reproduced byte for byte from the official kit, so these
  numbers are the official firmware's numbers. `make flash-budget` regenerates
  `build/pro/flash-budget.md` (Appendix A) from the current build with GNU nm.
- v0.3, 2026-11-01 (Checkpoint A): numbers confirmed from the Track A `sdk.elf` (Windows
  JieLi 2.5.3 toolchain under Wine). The Track A ELF is byte-identical to the native
  Linux toolchain build used for v0.1/v0.2, so every figure stands; Appendix A regenerated
  with llvm-nm.exe (only difference: it prints SRAM functions as `n`, GNU nm as `t`).
  "Preliminary" marks removed.
- v0.2, 2026-11-01: section 4 added: Phase 1 re-estimate under the SPEC v0.2 decision
  (DX7 stays, played from a LIVE track; operator editor UI goes; other engines' editor,
  sequencer and most effects pages are candidates; factory bank and sampler glue kept).
  Dependency list of app code the DX7 engine, LIVE mode and the remaining pages need.
- v0.1, 2026-11-01: first analysis, from the Python build port linked with the native
  JieLi Linux toolchain in a scratch directory (Track A was still blocked on host
  packages). Read only: no source was changed for this analysis.

Tools: `tools/linux/flash-budget.py` (parses `sdk.map` and `nm --print-size`; the
generated tables in Appendix A are its output). Method notes are in the script header.

## 1. Totals and the hard limits

| Quantity | Bytes | Note |
| --- | ---: | --- |
| App image (.text + .data + .ram0_data + .cache_ram_data) | 453892 | `firmware-report.json` app_image_bytes; this is what `app.bin` holds |
| Hard app limit from Package.cs | 453921 | 0xff000 − USER 536576 − BTIF 4096 − VM min 32768 − area 0x4000 − header 0x120 − cfg_tool 383 − 64 |
| Margin to the hard limit | 29 | |
| FLASH_BIN_SIZE (image rounded to 4 KiB) | 471040 | 0x73000; VM starts here |
| VM region | 32768 | exactly the minimum; vm_extra_gap_bytes = 0 |

Two limits bind at once and they are the same thing seen twice: Package.cs rejects an app
longer than 453921 bytes, and the 4 KiB rounding of the image must leave 32768 bytes of VM
before BTIF. V01 uses the last page completely. Any Phase 1 code growth has to be paid for
by removing something first, or by moving the USER boundary (section 3.4).

### Where the bytes go

| Input | Flash bytes | Share |
| --- | ---: | ---: |
| libfm1_engine.a (vendor SDK: RTOS, Bluetooth, USB, DSP engines, sequencer, update) | 366556 | 80.8 % |
| app/screen.c (UI, linked without LTO) | 41714 | 9.2 % |
| other app units merged by LTO (audio_output, board/audio, fm_factory, fm_library, presets, project, samples, smk37_controls, build_identity) | 26768 | 5.9 % |
| app/board/scan.c | 5405 | 1.2 % |
| app/midi_router.c | 3835 | 0.8 % |
| libcompiler_rt.a (soft double) | 3212 | 0.7 % |
| app/transfer.c | 2780 | 0.6 % |
| app/board/panel.c | 2705 | 0.6 % |
| libc.a (memcpy, str*) | 744 | 0.2 % |
| alignment / fill | 173 | |

The SDK is one object, `engine_startup.S.o`, linked with `--whole-archive`. `--gc-sections`
still drops 86 of its unreferenced sections (66881 bytes); the rest is either referenced
from the SDK's own tables or pinned by the linker script. Everything the application can
influence is the ~87 KiB in app/ plus the libc/compiler-rt pulls.

The full per-input, per-unit and top-30 symbol tables are in Appendix A.

## 2. What removing things would free (estimates, nothing removed)

All sizes are post-link flash bytes from this image. "Frees" means bytes that leave the
app image; the usable gain is the same because Package.cs only rounds at the end.

### 2.1 Factory DX7 bank (factory_dx7_packed.inc + fm_factory.c)

| Item | Bytes |
| --- | ---: |
| `factory_tokens[9399]` | 9399 |
| `factory_offsets[129]` (uint16) | 258 |
| `factory_pairs[256]` | 256 |
| `groove_fm_factory` decoder | ~150 |
| **fm_factory.c total (exact, nm)** | **10063** |

Frees about 10.0 KiB directly. Dependents: `fm_library.c` falls back to
`groove_fm_factory` for programs that have no user bank (L118, L149), so removing the bank
also removes that fallback path (a few hundred bytes more) but keeps the four user banks
working. `presets.c` does not use the factory bank (it builds demo voices itself). The
device capability reply in transfer.c advertises 128 programs (`out[1]=128`) and the
workbench requires exactly that (WebUpdate.js L659), so the reply must keep saying 128 or
the web side must change with it. The WASM simulator shares fm_factory.c, so the web
preview would also lose the factory sounds. Total realistic gain: **about 10.3 KiB**.

### 2.2 UI pages in screen.c

screen.c is linked without LTO, so every function is an input section with an exact size.
Grouped by the page enum in screen.c L126 (page-only functions; shared drawing primitives
excluded):

| Page group | Bytes | Needed by a scene controller? |
| --- | ---: | --- |
| FM_EDIT / FM_ENV / FM_LFO / FM_QUICK (DX7 editor: fm_draw, fm_control, algorithm table, fm_pages, track_lfo_draw) | 3890 | no |
| STEPS / STEP_EDIT / RHYTHM / ARP_EDIT (sequencer editing: steps, edit_page_draw, step helpers) | 3578 | no |
| OVERVIEW / MIX (overview, header, mix_draw, hints) | 3202 | replaced by the scene page |
| TONE_EDIT (engine tone editor) | 1894 | no |
| BLE page (draw_ble, ble_control, radio_line) | 1764 | keep for Bluetooth MIDI setup |
| PROJECT / NAME / PRESET_BROWSER | 1734 | partly (song select, naming) |
| EFFECTS | 676 | no |
| STARTUP (boot_draw) | 192 | keep |
| Shared: `apply_controls` 6884, string table 6480, `draw_page_body` 3424, `groove_screen_control` 1550, paint/text/font primitives ~3000, web targets, init | 24776 | partly: the two big functions are per-page `switch` bodies, roughly proportional to the pages they serve |

Dropping the four "no" groups frees **about 10.0 KiB** outright. Their branches inside
`apply_controls` and `draw_page_body` and their strings add an estimated **5–8 KiB** more
(these two functions plus the string table are 16.8 KiB and most of it is page-specific).
A screen.c rewritten around one scene page, one song/setlist page, BLE and startup would
plausibly land at 12–16 KiB, i.e. **25–30 KiB freed** from today's 41.7 KiB. The RAM side
goes with it: screen.c also owns 10973 bytes of .bss (7680 of it the paint buffer).

### 2.3 Synth engines

The six DSP engines, the effects and the sequencer are inside `libfm1_engine.a`. The
archive is a single object linked with `--whole-archive`, and Build.ps1's Test-Firmware
requires their SRAM entry points to exist (synth.json `sram_required`: bass303_render,
drum808_kit_render_st, pluck_render, fm1_fx_*, dx7_compute_*_asm, psg_*_asm, sampledrum_*,
...), so **no engine can be removed from the image without a vendor rebuild of the SDK and
a change to the official checks**. Sizes below are what each engine's visible symbols
occupy, for orientation; many SDK symbols are obfuscated (`fm1_r_*`) so these are lower
bounds.

| Engine | In libfm1_engine.a (not removable) | Glue in app/ (removable) | What the glue is |
| --- | ---: | ---: | --- |
| DX7 FM | ≥ 8752 | ~15600 | fm_factory.c 10063, fm_library.c 1618 (user banks, pack/unpack), FM editor pages 3890 |
| 303 bass | ≥ 4780 | 0 dedicated | tone editor and presets are generic across engines |
| 808 drums | ≥ 1908 | 0 dedicated | as above |
| PSG (emu2149) | ≥ 4458 | 0 dedicated | as above |
| Pluck | ≥ 1918 | 0 dedicated | as above |
| Sample drums | ≥ 1856 | ~1500 + transfer share | samples.c 1468 (bank validation/write), sample protocol in transfer.c (part of 2780) |
| Effects | ≥ 698 | effects page 676 | |
| Sequencer (groove_*) | ≥ 20258 | sequencer pages 3578 | |

Also in the SDK: an unnamed 18596-byte `.volatile_ram_code` block (DSP kernels in SRAM) and
the per-engine render functions in `.volatile_ram_code.fm1_*_render`. These are copied
from flash to SRAM at boot, so they cost flash and RAM.

### 2.4 Sum of the realistic app-side savings

| Change | Frees (approx.) |
| --- | ---: |
| Factory DX7 bank | 10.3 KiB |
| UI pages a scene controller does not need (2.2, outright) | 10.0 KiB |
| Their share of the shared control/draw switches and strings | 5–8 KiB |
| DX7 user library (fm_library.c) if DX7 is not played from Tabby | 1.6 KiB |
| Sample bank glue if the sampled drum machine is dropped | 1.5–2.5 KiB |
| **Total within reach without touching the SDK** | **≈ 28–32 KiB** |

That is the whole budget for Phase 1 features unless the USER boundary moves.

## 3. Flash layout: Package.cs, the loader and the user region

### 3.1 What Package.cs writes (Pro, V01 numbers)

`FM1.Package.Create` (sdk/Package.cs) builds a 1 MiB-addressed `flash.bin` that is only as
long as the code needs, then wraps it with the vendor loader into the `.fwsc`:

| Offset (abs.) | Length | Content |
| --- | ---: | --- |
| 0x00000 | 32 | AC791N boot header (fixed bytes, CRC) |
| 0x00020 … 0x0009F | 4 × 32 | Directory records: `uboot.boot`, `isd_config.ini`, `app_dir_head` (→ 0x4000), `key_mac` (→ 0xFF000, 4096) |
| 0x000A0 | 14488 | `uboot.boot` (bank table ciphered) |
| 0x03938 | 755 | `isd_config.ini` = 34-byte public chip-key descriptor + boot-config.bin (721) |
| … | | 0xFF fill to 0x4000 |
| 0x04000 | 32 | `app_area_head` record (entry 0x02000120, payload size) |
| 0x04020 … 0x040BF | 5 × 32 | `app.bin`, `cfg_tool.bin`, `VM`, `PRCT`, `BTIF` records |
| 0x04120 | 453892 | **app.bin** = .text + .data + .ram0_data + .cache_ram_data, in that order |
| 0x72E24 | 383 | `cfg_tool.bin` |
| 0x72FA3 | 2 × 32 | `EXT_RESERVED` record, then the `USER` record |
| 0x72FE3 … 0x72FFF | | 0xFF fill; image length rounded up to 4096 → **FLASH_BIN_SIZE 0x73000 (471040)** |

The app area (0x4000 to the end of the payload + 64) is ciphered 32 bytes at a time with
the public key 0x980F; the records carry CRC-16s. The `.fwsc` is: 1 KiB ufw header with two
entries (`flash.bin` at 1024, `ota.bin` at 1024 + 471040), the two payloads, and 20
product-identity bytes interleaved every 47 bytes of the first 940. Result: 492084 bytes.

Region records (what the JieLi runtime reads at boot, through `syscfg_vm_init` and
`syscfg_btif_init`, both required by Test-Firmware):

| Record | Address | Size | Attributes / extra | Meaning |
| --- | ---: | ---: | --- | --- |
| `PRCT` | 0 | 0x73000 | 0x8292, "CODE" | protected code image |
| `VM` | 0x73000 | 0x8000 | 0x8112, extra = MinimumVm 32768 | vendor settings store (syscfg VM: Bluetooth link keys, vendor config) |
| `BTIF` | 0x7B000 | 0x1000 | 0x8192, "AUTO" | Bluetooth interface info |
| `USER` | 0x7C000 | 0x83000 (536576) | 0x8192, "AUTO" | the application's user region |
| `key_mac` | 0xFF000 | 0x1000 | 0x0112 | factory key / MAC / calibration — never written |

Derivation (Package.cs L141-L144): `userAt = 0xFF000 − 536576 = 0x7C000`,
`vmEnd = userAt − 4096 = 0x7B000`, `imageSize = roundup4096(0x4000 + 0x120 + app + 383 + 64)`,
and the build fails if `imageSize > vmEnd − 32768`. VM is therefore whatever is left between
the code and BTIF; it shrinks as the code grows and is at its 32 KiB floor in V01.

### 3.2 What the update loader assumes

The `.fwsc` is streamed over USB MIDI SysEx by the workbench (WebUpdate.js) to the vendor
loader `ota.bin` (hash-pinned ef1f2db8…, shared with the FM-1 and both SMK-37 models). The
workbench checks that the package has exactly one `flash.bin` entry of 16384..1044480 bytes,
a multiple of 4096, and one loader under 32 KiB (L106-L107); the loader writes `flash.bin`
from address 0 for its length. Only `[0, FLASH_BIN_SIZE)` is written. VM, BTIF, USER and
`key_mac` are not part of the image, so they survive an update as long as the new
FLASH_BIN_SIZE does not grow into them, which Package.cs guarantees by refusing to build
otherwise. A grown image eats VM first; the vendor runtime re-initialises VM when its
record moves.

The binary SDK validates the layout at start (`fm1_flash_init`, from its disassembly): it
takes `fm1_layout.user_bytes` from the generated `build_identity.c`, requires a non-zero
multiple of 4096 no larger than 0xFF000, computes the base as `0xFF000 − user_bytes`,
and checks that at least 32768 bytes of VM remain; otherwise the user flash API reports
unavailable (`fm1_flash_size()` is then 0 and every app storage path returns
`FM1_FLASH_UNAVAILABLE`). `fm1_flash_*` offsets are relative to that base.

The workbench never addresses USER directly. Projects, settings, tuning, DX7 banks and
samples move through the device protocol (transfer.c: command 1/2 downloads of kinds
0 project 4048/4064 B, 2 settings 223 B, 3 tuned project 4264 B, 4 DX7 bank 4096 B; sample
bank upload with a size ≤ 466944). The one absolute address it uses is in
`restoreFactory`: stock V16 keeps a factory "USR" resource at 0xF4000..0xFDFFF and the
workbench rewrites that range (40960 bytes) when returning to V16. That range lies inside
Open's USER region (it overlaps the sample-bank tail and the DX7 library sectors), which
is why switching firmware families is documented as destroying data.

### 3.3 What is inside USER (offsets relative to the USER base 0x7C000)

| USER offset | Absolute | Bytes | Content | Source |
| ---: | ---: | ---: | --- | --- |
| 0 … 61439 | 0x7C000 … 0x8AFFF | 15 × 4096 | Project slots 0–14, one sector each: header (magic, generation, target, CRC, commit) + settings copy + project 4064 B | project.c `write_record`, instrument.h `GROOVE_PROJECT_SLOTS = 16`, `GROOVE_PROJECT_BYTES = 4064` |
| 61440 | 0x8B000 | 4096 | Slot 15, which is also the **device settings sector** (`SETTINGS_SECTOR = 15`): the record carries MIDI/radio/role/clock settings | project.c L21, L570 |
| 65536 | 0x8C000 | 4096 | **Staging / journal sector** (`STAGING_SECTOR = 16`): every project, settings, tuning and DX7-bank write is staged here with a CRC and a commit word before the target sector is erased, so an interrupted write never loses the last good copy | project.c `recover_staging`, `tuning_commit`; fm_library.c `STAGE` |
| 69632 | 0x8D000 | 446464 | **Sample bank**, new writes limited to `GROOVE_SAMPLE_LIMIT` = 436 KiB ≈ 19.55 s of the 32 kHz SEA codec (228 B per 320 frames); header 512 B at the start; 8 slots share it | samples.c, instrument.h L332-L339, Samples.js |
| 516096 | 0xFA000 | 4 × 4096 | **DX7 user library** banks 0–3: 32 voices × 112 B packed + magic/version/index/CRC/commit header per sector | fm_library.c (`GROOVE_LIBRARY_OFFSET = TUNING − 4 × 4096`) |
| 532480 | 0xFE000 | 4096 | **Tuning sector**: magic/version, 16 × 200 B tuning entries keyed to each slot's contents, then session settings (track roles/channels) and panel preferences | project.c L156-L178 (`GROOVE_TUNING_OFFSET = user_bytes − 4096`) |

Notes: the nominal sample region `GROOVE_SAMPLE_BYTES` is 466944 (to the end of USER); only
legacy FM-1 banks may extend over the last 20 KiB, and when one does, the tuning sector is
treated as occupied (`tuning_blocked`). The three app checks that pin the size: project.c
requires `fm1_flash_size() ≥ 69632`, samples.c requires `fm1_flash_size() == 536576`
exactly, and project.c tuning requires `≥ 536576`.

### 3.4 What breaks if USER shrinks by 64, 128 or 256 KiB

Shrinking USER means raising `fm1_layout.user_bytes`'s complement: the base moves up
(`0xFF000 − user_bytes`), BTIF and the VM ceiling move up with it, and the code may grow by
the same amount. The last 20 KiB (DX7 library + tuning) are addressed from the end of USER,
so they stay at 0xFA000–0xFEFFF; everything addressed from the start moves.

| Shrink | user_bytes | USER base | BTIF | VM ceiling | New hard app limit | Sample capacity | ≈ seconds |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 (V01) | 536576 | 0x7C000 | 0x7B000 | 0x7B000 | 453921 | 446464 | 19.6 |
| 64 KiB | 471040 | 0x8C000 | 0x8B000 | 0x8B000 | 519457 | 380928 | 16.7 |
| 128 KiB | 405504 | 0x9C000 | 0x9B000 | 0x9B000 | 584993 | 315392 | 13.8 |
| 256 KiB | 274432 | 0xBC000 | 0xBB000 | 0xBB000 | 716065 | 184320 | 8.1 |

The smallest USER that keeps every current feature with an empty sample bank is
69632 + 20480 = 90112 bytes (88 KiB). What has to change, for any of the three:

1. **Package.cs** `UserSize` and the fit formula; **Build.ps1 / build.py** `$variant.user_bytes`
   (it is compiled into `fm1_layout` and checked by the SDK at boot). The official
   Test-Firmware/packaging checks still pass as long as VM ≥ 32768 remains.
2. **instrument.h**: `GROOVE_SAMPLE_BYTES` so that `GROOVE_FLASH_BYTES == user_bytes`
   (samples.c compares for equality; project.c requires ≥). `GROOVE_SAMPLE_LIMIT` follows.
3. **Workbench**: WebUpdate.js L659 requires the capability reply to say sample capacity
   446464 exactly; Samples.js `REGION_BYTES`/`CAPACITY`; Simulator.js hard-codes 536576,
   69632 and 466944 for the simulated flash; the help text says 436 KiB / 19.55 s. Phase 3
   builds its own configurator anyway, but the stock workbench stops accepting the device
   until these move.
4. **Existing device data**: on a device coming from V01 (or from a previous Tabby layout),
   projects, the settings sector, the staging sector and the sample bank are now read from
   the new base and look blank or invalid. They are not erased, but the first save, settings
   write or sample upload overwrites the old area. Tabby's first boot should therefore either
   migrate (read at the old base, write at the new) or deliberately re-initialise. The
   DX7 library and tuning sectors are unaffected because they sit at the fixed end.
5. **BTIF moves**: the Bluetooth interface sector moves with the base, so pairings are lost
   once and the vendor runtime rebuilds it. VM is re-initialised by the runtime when its
   record moves (Open keeps its own settings in USER, not in VM).
6. **Stock V16 restore** still works: the workbench writes the V16 USR resource at the
   absolute range 0xF4000–0xFDFFF, which stays inside any of the three shrunken USER
   regions and never touches code, VM, BTIF or key_mac.
7. **The sample-based drum machine** (Phase 2 option) loses proportionally: 64 KiB costs
   about 3 seconds of sample time, 256 KiB leaves about 8 seconds.

Nothing above touches `key_mac` (0xFF000–0xFFFFF, factory calibration/MAC) or the boot
area; neither Package.cs nor the loader ever writes them.

## 4. Phase 1 re-estimate under the SPEC v0.2 decision (Track A numbers, Checkpoint A)

Decision (docs/SPEC.md 1.1): external-synth orchestrator; only the DX7 engine stays
playable, from a LIVE track; on-device DX7 preset select plus a few macros; voice editing
moves to the workbench and SysEx import; keep the factory DX7 bank and the sampler glue for
now; no USER-region change in Phase 1. All sizes are post-link flash bytes of this image
(screen.c functions are exact; "branch share" figures are estimates of the page-specific
parts of the shared `apply_controls` / `draw_page_body` switches and the string table).

### 4.1 What is kept, and why (do not cut)

| Code | Bytes | Needed by |
| --- | ---: | --- |
| `app/fm_factory.c` (factory DX7 bank + decoder) | 10063 | Decision: kept for now; first cut candidate. `groove_fm_program` in fm_library.c falls back to it for programs without a user bank. |
| `app/fm_library.c` (`groove_fm_program`, four user banks, pack/unpack, journaling) | 1618 | **DX7 preset select**: this is the program loader for voices 1–128 (user bank or factory). Bank read/write for the workbench (transfer kinds 4). |
| `app/transfer.c`: Yamaha SysEx single-voice import (`message[1]==0x43` → `groove_fm_import`, L270-L290), transfer kinds 1 (patch) and 4 (bank), capability reply | part of 2780 | **DX7 SysEx import and workbench voice editing**. The capability reply must keep saying 128 programs and 446464 sample bytes or the stock workbench rejects the device. |
| `app/project.c`: project records (`struct groove_preset` = patch + controls per track), session settings in the tuning sector (`session_settings_load/save`, L740-L805, track roles + input channels, restored *before* a project load), staging/journal recovery | 7934 (LTO) | **LIVE track mode persistence**: the LIVE role is stored in session settings, not in the project, and is re-applied before each load so the DX7 keeps sounding. Also scene/project loading itself. |
| `app/midi_router.c`: input-channel → track routing honours `groove_track_role != OFF` (L330); LIVE_OUT/owner handling | 3835 | LIVE track receives keys/MIDI; external routing is Tabby's core feature. |
| screen.c `preset_load` 372, `preset_draw` 316, `release_keys_except` 100, PRESET_BROWSER/PROJECT branches | ~1200 | Project/scene loading from the panel. `preset_load` deliberately keeps keys held on LIVE tracks across a load (L1783-L1818). |
| screen.c SOURCE page branch (in `draw_page_body` L1302-L1319, `apply_controls` L2307-L2330), `track_modes` strings | ~900 (est.) | **This is where a track is set to LIVE** (K2: PROJECT / LIVE / OFF) and where the engine is chosen. Keep the track-mode part, or set roles programmatically from the scene config and drop the engine chooser. |
| screen.c FM_QUICK page branches (`draw_page_body` L1286-L1290, L1457-L1459; `apply_controls` L2506-L2509; web targets L3033-L3035) | ~600 (est.) | **DX7 preset select + macros already exist here**: VOICE/BANK select, encoders → ALG (134), FEEDBACK (135), TRANSPOSE (144) and `groove_control_edit` (level). Attack/release macros can reuse `groove_adsr_edit` (SDK) that FM_ENV uses today; brightness would be new (operator output levels via `groove_fm_edit`). |
| screen.c BLE page (`draw_ble` 1284, `ble_control` 400, `radio_line` 80) | 1764 | Bluetooth MIDI setup. |
| screen.c shared primitives: `paint_*`, `text`, `font`, `knob`, `line`, `frame`, `header`, `leds`, `announce`, `groove_screen_init`, `groove_screen_control`, web target reporting | ~8000 | Any page. |
| `app/samples.c` + sample transfer paths + `samples_*` in transfer.c | 1468 + part of transfer.c | Decision: sampler glue kept (drum machine undecided). |
| `app/board/*`, `smk37_controls.c`, `audio_output.c` | ~11000 | Hardware: panel scan, LCD, audio path, control events. Test-Firmware requires the scan/wiring symbols in SRAM. |
| SDK-required app callbacks: `fm1_app_sysex` (transfer.c), `fm1_io_trs_midi_enabled` (board), `groove_tuning_*`, `fm1_build_id`, `fm1_update_identity` | — | Build.ps1 Test-Firmware fails without them. |

### 4.2 What the decision frees, page by page

| Page / code | Exact page-only bytes | Branch share (est.) | Notes |
| --- | ---: | ---: | --- |
| **DX7 operator editor** FM_EDIT / FM_ENV / FM_LFO: `fm_draw` 2132 (algorithm diagram inlined), `fm_control` 440, `fm_parameter` 54, `fm_pages` table 308, `algorithms` table 384 | 3318 | 1000–1500 | `draw_page_body` columns for FM_EDIT/FM_ENV/FM_LFO (L1561-L1600), `apply_controls` FM branches (L2040-L2056, L2578-L2585), labels. Keep `fm_encoder_delta` (48, shared) and `groove_adsr_edit` calls if attack/release macros move to FM_QUICK. |
| **NAME page** (on-device DX7 patch naming): `name_draw` 240 + NAME branch | 240 | ~200 | Naming moves to the workbench. `edit_character` (82) stays: the PROJECT page uses it for project names. |
| **Other engines' editors**: TONE_EDIT (`tone_draw` 1016, `tone_control` 500, `tone_parameter` 218, `tone_label` 86, `tone_part`/`tone_slot` 74) and the non-DX7 LFO page (`track_lfo_draw` 524) | 2418 | 500–800 | Only reachable for 303/808/PSG/pluck/sampler tracks. The `GROOVE_TONE_PARAMS` API stays in the SDK. |
| **Sequencer editing**: STEPS (`steps` 946), STEP_EDIT/RHYTHM (`edit_page_draw` 2290), step helpers (342), ACTIONS page (`actions` table 80 + branches), `seq_pages`/`seq_midi_*` tables | 3658 | 2500–3500 | The largest share of `apply_controls` (6884) and `draw_page_body` (3424) serves these pages, plus most of the 6480-byte string table. ARP_EDIT is listed under "sequencer" in the enum but the arpeggiator is a *live* feature (instrument.h L98); decide separately. |
| **Effects pages** (`effects_draw` 676 + EFFECTS branch L2510-L2525) | 676 | 300–400 | "Most" effects pages: the shared FX / delay pages go; a track send/level control may survive as a macro. |
| **MIX page** (`mix_draw` 424) | 424 | ~100 | Eight-track internal mixer; with one LIVE DX7 track it has nothing to mix. |
| **OVERVIEW** (`overview` 1470, `header` 1062, hints 246) | 2778 | ~500 | Not freed: *replaced* by the scene page. Net effect depends on the new page. |
| **SOURCE page engine chooser** (`source_names`, preview loop) | — | ~400 | Only if engines are fixed to DX7 in code; the LIVE/OFF track-mode control must stay (4.1). |

Totals, excluding the OVERVIEW replacement:

| | Bytes |
| --- | ---: |
| Exact page-only functions and tables removed (DX7 editor, NAME, other-engine editors, sequencer pages, effects, mix) | 10734 (10.5 KiB) |
| Estimated branch share in `apply_controls` / `draw_page_body` / strings | 4.5–6.5 KiB |
| **Freed by the decision** | **15–17 KiB** |
| Cost of the new scene page, song/setlist page and DX7 macro page (estimate, OVERVIEW-sized UI with less text) | 5–9 KiB |
| **Net Phase 1 headroom** | **≈ 7–12 KiB** on top of today's 29 bytes |
| Reserve if space runs short: factory DX7 bank | +10.3 KiB (first cut per SPEC 1.1) |
| Further reserve, not in the decision: factory demo projects (`presets.c` 1742 + `groove_factory_load` 2050) | +3.8 KiB (the PRESET_BROWSER "FACTORY" bank; unrelated to the DX7 voice bank) |

The RAM side follows the same pattern: screen.c holds 10973 bytes of .bss, of which the
7680-byte paint buffer and the band caches are needed by any page; the sequencer and
editor state (operator/lfo/tone page arrays, clipboards) is roughly 1 KiB.

### 4.3 Risks in cutting

- `apply_controls` is one 6884-byte function with every page's key handling interleaved;
  the savings there only materialise if the page branches are actually deleted, not just
  made unreachable (the compiler cannot prove a page unreachable while `page` is a runtime
  variable set from SysEx/web targets too: `groove_screen_open` L2926 and
  `smk37_screen_page` L2884 accept page numbers from the workbench).
- The workbench's simulator shares screen.c (`FM1_HOST_TEST` build). Removing pages on the
  device removes them from the preview too, and the web-target table
  (`groove_screen_web_*`) must stay consistent with the remaining pages.
- Test-Firmware does not care about any of this UI code, so none of the official checks
  constrain the cuts; the SRAM-placement rules only concern the board scan code and the
  SDK's DSP callbacks.

## 5. Task 03 checkpoint (a): sampler and DX7 user library removed (measured)

Built with Track B (`make firmware`), byte-identical to Track A (`make crosscheck`).

| Quantity | V01 baseline | After (a) | Change |
| --- | ---: | ---: | ---: |
| App image | 453892 | 450820 | −3072 |
| Margin to the 453921-byte packaging limit | 29 | 3101 | +3072 |
| .text | 377920 | 374976 | −2944 |
| .ram0_data | 75940 | 75812 | −128 |
| .ram0_bss | 191356 | 190812 | −544 |
| Static SRAM (data + bss + boot_info) | 267348 | 266676 | −672 |
| Runtime heap | 256268 | 256940 | +672 |

Where it came from (post-LTO attribution, `make flash-budget` with a refreshed
`build/pro/nolto.json`):

| Unit | Before | After | Note |
| --- | ---: | ---: | --- |
| app/samples.c | 1468 | 502 | bank validation, mapping, transfer paths gone; the 502 bytes are the SDK entry points plus the song-region scan that now lives in app/song_storage.c (attributed here by the LTO map) |
| app/fm_library.c | 1618 | 14 | library banks, staging recovery, pack7 and the sample-bank conflict check gone; `groove_fm_unpack` and `groove_fm_program` are inlined into their callers |
| app/transfer.c | 2780 | 2458 | commands 11-16 and transfer kind 4 gone |
| app/screen.c | 41714 | 41780 | sampler branches gone, "ERASE OLD SAMPLE/DX7" action and the boot notice added |
| app/smk37_controls.c | 2630 | 2565 | sampler slot keys gone |
| app/presets.c | 1742 | 2664 | attribution change only: the 808 default-kit builder is now a separate exported function used by project.c |
| libfm1_engine.a | 366556 | 366256 | −300: the linker dropped engine sections that only the removed app code referenced |

Not recoverable (binary SDK): `sampledrum_*` 1856 B, SEA decoder ≈ 2.3 KB, GROOVE_SAMPLE
branches inside the engine; `sampledrum_lpf20_asm` / `sampledrum_mix_asm` stay in SRAM
because sdk/synth.json requires them.

Next: checkpoint (b) removes the DX7 operator editor pages (3890 B per section 2.2) and the
tone editor (1894 B), expected to bring the margin to roughly 8.5 KB before song mode.

## 6. Task 03 checkpoint (b): DX7 operator editor and tone editor removed (measured)

Built with Track B (`make firmware`), byte-identical to Track A (`make crosscheck`).

| Quantity | V01 baseline | After (a) | After (b) | (b) − (a) |
| --- | ---: | ---: | ---: | ---: |
| App image | 453892 | 450820 | **439812** | −11008 |
| Margin to the 453921-byte packaging limit | 29 | 3101 | **14109** | +11008 |
| .text | 377920 | 374976 | 364000 | −10976 |
| .ram0_data | 75940 | 75812 | 75780 | −32 |
| .ram0_bss | 191356 | 190812 | 190524 | −288 |
| Static SRAM (data + bss + boot_info) | 267348 | 266676 | 266356 | −320 |
| Runtime heap | 256268 | 256940 | 257260 | +320 |

The section 2.2 estimate (3890 + 1894 = 5784 B) counted only the page functions. The
measured drop is almost twice that because the pages' callers and tables went too:

| Unit | After (a) | After (b) | Note |
| --- | ---: | ---: | --- |
| app/screen.c | 41780 | 32401 | −9379: fm_draw, tone_draw, track_lfo_draw, fm_control, tone_control, the algorithm diagram (table + `line` primitive), fm_pages, edit_keys and the FM/tone branches of apply_controls (6884 → 6018), draw_page_body (3424 → 2618), the LED map, the web targets and 1051 B of strings |
| libfm1_engine.a | 366256 | 364647 | −1609: the linker dropped the engine's tone / LFO / ADSR / operator-toggle / mono editing sections that only the removed pages called (groove_* sequencer family 20258 → 18652 B, 141 → 131 symbols) |
| every other unit | | | unchanged within ±20 B |

What stays on the device for the DX7: FM_QUICK (voice 1..128 and bank select, ALGORITHM /
FEEDBACK / TRANSPOSE / LEVEL encoders), the NAME page and the project / preset browser.
Full voice editing is the workbench's job (and SysEx import). The DX7 ADSR macro page went
with FM_ENV, as approved; bringing ATTACK / RELEASE back as two FM_QUICK knobs would cost
about 300 B if wanted later.

### 6.1 Headroom projection for song mode (decision 1 of the assessment)

Song mode (checkpoint d) was estimated at 6–10 KB in the assessment (section 5): sequencer
with clock and note table, storage with staging and CRC, directory, SONG page, transfer
kinds 5/6 and command 23. Against the 14109-byte margin:

| Song mode cost | Headroom after it | Meets the 4 KB requirement |
| ---: | ---: | --- |
| 6 KB (6144) | 7965 | yes |
| 8 KB (8192) | 5917 | yes |
| 10 KB (10240) | 3869 | **no, 227 B short** |

The requirement is met for anything under 9.8 KB. The worst case of the estimate is at
risk, so checkpoint (c) measures the song-mode skeleton early (storage + sequencer without
the page) before the page is built, and these are the further removal candidates, with
sizes from this build (`build/pro/flash-budget.md`), should they be needed:

| Candidate | Bytes | Comment |
| --- | ---: | --- |
| Stock step editor pages (STEPS / STEP_EDIT / RHYTHM / ARP_EDIT: edit_page_draw, steps, toggle_step, …) | 3620 | the M8 sequences; the stock pattern sequencer stays usable from the workbench. ARP_EDIT is inside edit_page_draw and would have to be kept (≈ 600 B) |
| Factory DX7 bank (`factory_tokens` 9399 + fm_factory.c code, unit total 10239) | 10239 | SPEC 1.1 names it first to cut; on-device preset select then works only on voices stored in projects (the workbench can still import SysEx). Largest single item |
| Factory scenes (app/presets.c: `preset`, `scenes`, the 808 kit builder) | 2664 | the 16 demo scenes; projects on the device replace them |
| EFFECTS page | 680 | sends and the shared effects stay editable from the workbench |
| NAME page (DX7 patch naming) | 326 | naming moves to the workbench with the rest of voice editing |
| BLE page | 1770 | screen only; the BLE stack itself is inside the binary SDK and cannot be removed |

Not recoverable: everything inside libfm1_engine.a (section 2.3), including the
sampler, the SEA decoder and the unused engines' SRAM entry points that sdk/synth.json
requires.

## Appendix A — generated tables (tools/linux/flash-budget.py on the Track A build/pro/sdk.elf)

### Flash use by input (from sdk.map; .text includes rodata)

| Input | .text | .data | .ram0_data | .cache_ram_data | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| libfm1_engine.a | 296758 | 0 | 69766 | 32 | 366556 (358.0 KiB) |
| app/screen.c | 41706 | 0 | 8 | 0 | 41714 (40.7 KiB) |
| app (LTO-merged units) | 24978 | 0 | 1790 | 0 | 26768 (26.1 KiB) |
| app/board/scan.c | 1649 | 0 | 3756 | 0 | 5405 (5.3 KiB) |
| app/midi_router.c | 3295 | 0 | 540 | 0 | 3835 (3.7 KiB) |
| libcompiler_rt.a | 3212 | 0 | 0 | 0 | 3212 (3.1 KiB) |
| app/transfer.c | 2780 | 0 | 0 | 0 | 2780 (2.7 KiB) |
| app/board/panel.c | 2697 | 0 | 8 | 0 | 2705 (2.6 KiB) |
| libc.a | 744 | 0 | 0 | 0 | 744 (0.7 KiB) |
| **input sections total** | | | | | **453719 (443.1 KiB)** |
| alignment / linker-script fill (app image − inputs) | | | | | 173 |
| **app image (firmware-report.json)** | | | | | **453892 (443.3 KiB)** |

### App units after LTO

Exact for the -fno-lto units (map input sections). For LTO units the post-LTO size is the sum of `nm` sizes of symbols traced back to the unit (lower bound: inlined code is unattributed); the standalone column is the unit compiled alone with -fno-lto, for scale.

| Unit | post-LTO flash bytes | method | standalone -fno-lto (text+rodata+data) | standalone .bss |
| --- | ---: | --- | ---: | ---: |
| app/audio_output.c | 290 | nm symbols (LTO) | 302 | 1540 |
| app/board/audio.c | 724 | nm symbols (LTO) | 718 | 5156 |
| app/board/panel.c | 2705 | map (-fno-lto) | 3435 | 984 |
| app/board/scan.c | 5405 | map (-fno-lto) | 5471 | 2844 |
| app/fm_factory.c | 10063 | nm symbols (LTO) | 10063 | 0 |
| app/fm_library.c | 1618 | nm symbols (LTO) | 1868 | 20 |
| app/midi_router.c | 3835 | map (-fno-lto) | 3835 | 3622 |
| app/presets.c | 1742 | nm symbols (LTO) | 3772 | 0 |
| app/project.c | 7934 | nm symbols (LTO) | 6310 | 4140 |
| app/samples.c | 1468 | nm symbols (LTO) | 1420 | 532 |
| app/screen.c | 41714 | map (-fno-lto) | 42134 | 10973 |
| app/smk37_controls.c | 2630 | nm symbols (LTO) | 2902 | 230 |
| app/transfer.c | 2780 | map (-fno-lto) | 2780 | 1144 |
| generated/build_identity.c | 0 | nm symbols (LTO) | — | — |
| LTO-merged units, map total | 26768 | map | | |
| of which traced to a unit above | 26469 | | | |
| of which unattributed (inlined/merged/renamed by LTO) | 299 | | | |

### Top 30 app symbols by size (post-LTO, from nm --print-size)

| Size | Symbol | Unit | Kind |
| ---: | --- | --- | --- |
| 9399 | `factory_tokens` | app/fm_factory.c | t |
| 6884 | `apply_controls` | app/screen.c | t |
| 3424 | `draw_page_body` | app/screen.c | t |
| 2324 | `groove_transfer_poll` | app/transfer.c | T |
| 2290 | `edit_page_draw` | app/screen.c | t |
| 2132 | `fm_draw` | app/screen.c | t |
| 2050 | `groove_factory_load` | app/project.c | T |
| 1550 | `groove_screen_control` | app/screen.c | T |
| 1470 | `overview` | app/screen.c | t |
| 1414 | `smk37_control_event` | app/smk37_controls.c | T |
| 1284 | `draw_ble` | app/screen.c | t |
| 1280 | `pad_velocity` | app/board/scan.c | n |
| 1016 | `tone_draw` | app/screen.c | t |
| 946 | `steps` | app/screen.c | t |
| 768 | `groove_project_poll` | app/project.c | T |
| 704 | `scenes` | app/presets.c | t |
| 686 | `draw` | app/screen.c | t |
| 676 | `effects_draw` | app/screen.c | t |
| 638 | `fm1_screen_fill` | app/board/panel.c | T |
| 636 | `fm1_screen_submit` | app/board/panel.c | T |
| 610 | `smk37_scan_read` | app/board/scan.c | T |
| 594 | `project_draw` | app/screen.c | t |
| 578 | `deliver` | app/midi_router.c | t |
| 572 | `groove_screen_init` | app/screen.c | T |
| 552 | `groove_midi_poll` | app/midi_router.c | T |
| 544 | `fm1_screen_init` | app/board/panel.c | T |
| 524 | `track_lfo_draw` | app/screen.c | t |
| 524 | `read_sector` | app/project.c | t |
| 504 | `groove_fm_library_write` | app/fm_library.c | T |
| 500 | `tone_control` | app/screen.c | t |

### screen.c by page (exact: screen.c is linked without LTO, one input section per function)

| Page group | Bytes | Functions |
| --- | ---: | --- |
| FM_EDIT / FM_ENV / FM_LFO / FM_QUICK (DX7 editor) | 3890 | algorithms 384, fm_control 440, fm_draw 2132, fm_encoder_delta 48, fm_pages 308, fm_parameter 54, track_lfo_draw 524 |
| TONE_EDIT (engine tone editor) | 1894 | tone_control 500, tone_draw 1016, tone_label 86, tone_parameter 218, tone_part 36, tone_slot 38 |
| BLE (Bluetooth page) | 1764 | ble_control 400, draw_ble 1284, radio_line 80 |
| PROJECT / NAME / PRESET_BROWSER | 1734 | edit_character 82, name_draw 240, preset_draw 316, preset_load 372, preset_refresh 24, project_draw 594, project_refresh 106 |
| EFFECTS | 676 | effects_draw 676 |
| STEPS / STEP_EDIT / RHYTHM / ARP_EDIT (sequencer editing) | 3578 | edit_page_draw 2290, move_step 86, sequence_length_adjust 80, step_first 38, steps 946, toggle_step 138 |
| OVERVIEW / MIX | 3202 | header 1062, hint_draw 68, mix_draw 424, overview 1470, performance_hint 178 |
| STARTUP | 192 | boot_draw 192 |
| shared (paint, text, fonts, strings, controls dispatch, web targets, init) | 24776 | apply_controls 6884, str1.1 6480, draw_page_body 3424, groove_screen_control 1550, draw 686, groove_screen_init 572, text 484, draw_page 382, paint_flush 304, select_track 264, smk37_screen_pad_mode 230, line 224, knob 202, font 180, paint_fill 162, punctuation 160, smk37_screen_page 154, smk37_screen_shortcut 152, smk37_screen_pad 132, groove_screen_mmc 114, release_keys_except 100, navigation_mode 82, frame 80, note_name 80, actions 80, decimal 78, smk37_panel_preferences_apply 76, smk37_screen_note 72, paint_mark 62, smk37_screen_pad_key 56, groove_screen_tap 50, post 50, number 48, smk37_p |
| **screen.c .text total** | **41706** | |

### libfm1_engine.a by vendor section family (single object, --whole-archive; not removable piecewise)

| Bytes | Section family |
| ---: | --- |
| 86356 | `.text` |
| 57708 | `.volatile_ram_code` |
| 37560 | `.bt_stack_code` |
| 26458 | `.classic_lmp_code` |
| 21684 | `.classic_rf_code` |
| 14488 | `.ble_rf_code` |
| 14392 | `.text.cold` |
| 12602 | `.ble_ll_code` |
| 10060 | `.os_code` |
| 8748 | `.ble_sm_code` |
| 7786 | `.rodata` |
| 6108 | `.ble_gatt_code` |
| 5920 | `.dlmalloc_code` |
| 5690 | `.bt_rf_code` |
| 4835 | `.volatile_ram` |
| 4462 | `.update_code` |
| 4022 | `.rf.text.cache.L2.rf_trim` |
| 3230 | `.uECC_code` |
| 2580 | `.spi_code` |
| 2096 | `.link_task_code` |
| 1954 | `.ble_att_code` |
| 1912 | `.ble_hci_code` |
| 1849 | `.classic_rf_const` |
| 1790 | `.hci_controller_code` |
| 1698 | `.classic_lmp_auth_code` |
| 1575 | `.rodata.str1` |
| 1264 | `.classic_lmp_auth_const` |
| 1248 | `.link_bulk_code` |
| 1112 | `.crypto_code` |
| 1080 | `.crypto_bigint_code` |

### Synth-engine code inside libfm1_engine.a (from nm; informational)

| Engine | Bytes | Symbols |
| --- | ---: | ---: |
| DX7 (dx7*, synth_dx7*) | 8752 | 35 |
| 303 bass (bass303*) | 4780 | 20 |
| 808 drums (drum808*) | 1908 | 21 |
| PSG (psg*, emu2149) | 4458 | 14 |
| Pluck (pluck*) | 1918 | 10 |
| Sample drums (sampledrum*) | 1856 | 19 |
| Effects (fm1_fx*) | 698 | 6 |
| Groove sequencer (groove_*) in SDK | 20258 | 141 |

Package layout: FLASH_BIN_SIZE 471040, VM 471040..503808 (32768 bytes, minimum 32768), BTIF 503808..507904, USER 507904..1044480 (536576 bytes).
