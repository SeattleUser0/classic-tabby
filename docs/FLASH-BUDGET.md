# Classic Tabby — Flash budget of SMK37 Open V01 (Pro)

Version: 0.20
Revision log:
- v0.20, 2026-11-08 (Task 12 A6): section 17: the tabby-v04.0 release build measured, 447716 bytes,
  margin 71741 (A5 changed no firmware; the tag's display version string changes the alignment).
- v0.19, 2026-11-08 (Task 12 A3, A4): section 17: write blocking during play and the counters plus the
  loop profile in the normal build, +4352 bytes together (measured), heap 198636.
- v0.18, 2026-11-08 (Task 12 A2): section 17: the step editor removed, -8224 bytes (measured).
- v0.17, 2026-11-08 (Task 12 A1): section 3.5: the 471040 layout is the normal one from tabby-v04.0
  (the hard app limit is 519457 bytes); measured margins follow in section 17 (A2-A6).
- v0.16, 2026-11-07 (Task 11): section 3.5: the USER size as one build setting, today's layout
  and the 471040 probe layout, what moves and what does not; section 16: the diagnostic build
  (+1888 bytes, margin 637) and the probe (margin 66173); the normal build unchanged.
- v0.15, 2026-11-05 (Task 09): no firmware change; the app image stays 451396 bytes, margin 2525.
- v0.14, 2026-11-04 (Task 08): section 15: the display version costs 0 bytes for a tag
  (alignment), 32 for the development string; Appendix A not regenerated (no change for a
  release build).
- v0.13, 2026-11-04 (Task 06 checkpoint c): section 14 added: the TRACK LAUNCH page (+2368
  bytes with a sequencer fix, margin 2525); Appendix A regenerated.
- v0.12, 2026-11-04 (Task 06 checkpoint b): section 13 added: per-track playheads (+1888
  bytes, margin 4893; the sequencer units at -Oz); Appendix A regenerated.
- v0.11, 2026-11-04 (Task 06 checkpoint a): section 12 added: BLE and NAME pages removed
  (−4224 bytes, margin 6781); Appendix A regenerated.
- v0.10, 2026-11-04 (Task 05): section 11 added: timed notes in firmware (+2112 bytes,
  margin 2557; static SRAM +16672); Appendix A regenerated with a fresh no-LTO map.
- v0.9, 2026-11-02 (Task 04, firmware part): section 10 added: row events in firmware
  (+1664 bytes, margin 4669); Appendix A regenerated.
- v0.8, 2026-11-02 (Task 03 checkpoint f): section 9 added: factory scenes removed (−3392
  bytes net, margin 6333, the 4 KB target met again); Appendix A regenerated.
- v0.7, 2026-11-02 (Task 03 checkpoint e): section 8 added with the measured cost of the
  batched block upload (+1408 bytes, margin 2941, 1155 below the 4 KB target) and the
  candidates to recover it; Appendix A regenerated.
- v0.6, 2026-11-02 (Task 03 checkpoint d): section 7 added with the measured cost of song
  mode (+9760 bytes, margin 4349) and the RAM figures; flash-budget.py v0.2 attributes the
  two new units.
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

### 3.5 Task 11: the USER size as one setting, and the 471040 probe layout (measured 2026-11-07)

Since Task 11 the USER size is one build option (BUILD.md 24.1: `USER_BYTES=N`, build.py
`--user-bytes`). It feeds `fm1_layout.user_bytes`, both packagers (sdk/Package.cs v0.2 and
tools/linux/package.py v0.2 no longer refuse a size other than 536576; they check a multiple of
4096 from 90112 to 536576, build.py accepts 405504 to 536576), the app constants (app/ct_layout.h:
`GROOVE_SAMPLE_BYTES = CT_USER_BYTES - 69632`, the song region `(CT_USER_BYTES - 73728) / 4096`
sectors) and the simulator. The capability reply 21 reports the song region, so the workbench
reads the layout from the device.

Today's layout (the Task 03 song region replaced the sample bank and the DX7 library; section 3.3
describes V01) and the probe's, from build/pro/package-report.json:

| | Stock (every release) | Probe (tabby-p0-probe64) |
| --- | ---: | ---: |
| user_bytes | 536576 | 471040 |
| image (PRCT) | 0x00000–0x72FFF (471040) | 0x00000–0x72FFF (471040, unchanged) |
| VM | 0x73000–0x7AFFF (32768) | 0x73000–0x8AFFF (98304) |
| BTIF | 0x7B000 | 0x8B000 |
| USER | 0x7C000–0xFEFFF | 0x8C000–0xFEFFF |
| projects 1–16 (16 sectors), project staging | 0x7C000–0x8CFFF | 0x8C000–0x9CFFF |
| song region | 0x8D000–0xFDFFF: 113 sectors (staging, 16 records, 96 block sectors) | 0x9D000–0xFDFFF: 97 sectors (staging, 16 records, 80 block sectors) |
| tuning and session sector | 0xFE000 | 0xFE000 (same place) |
| key_mac | 0xFF000, never written | same |
| hard app limit | 453921 | 519457 |

**Task 12 A1 (2026-11-08): the 471040 column is the normal layout from tabby-v04.0** (app/ct_layout.h
default); 536576 is built only with `USER_BYTES=536576`. The hard app limit of every normal build is
519457 bytes from then on.

The probe moves only USER; the code image stays where it is, so the extra 64 KiB go to VM until a
later build needs them for code. What the move does to data already on the device (the probe sees
the old bytes 64 KiB further on):

- The old VM, BTIF and the first 15 project sectors become the new VM, and the old slot-16 sector
  the new BTIF: the vendor runtime owns them now (it may format them), so treat the old projects
  1–16 and the old device settings as gone (the backup has them).
  Bluetooth pairings are lost once.
- The new project sectors hold the old project staging sector and the old song staging and song
  records 1–14: none has a project magic, so every slot reads empty.
- The new song region starts at the old song record 16 and then the old block sectors 1–96 (all
  song-formatted), so song storage scans READY with no song (the records sit at block positions)
  and old blocks as garbage. The probe's first boot may erase the new song staging sector (old song
  16's record) as a stale journal. The simulator's emulated move (tests/workbench/backup.mjs)
  shows exactly this and then restores and verifies.
- The tuning and session sector does not move: track roles, input channels and panel preferences
  survive (and the backup has them too).

Going back to the stock layout (BUILD.md 24.5) the stock firmware sees the probe's data 64 KiB
earlier: its project area holds the probe's VM, its song region starts with the probe's project
sectors, which have no song magic, so song storage reports OLD DATA until ACTIONS > ERASE OLD
SAMPLE/DX7 runs; then the full restore.

The paths of the Task 10 assessment's H.4, after Task 11: packagers, build.py, the app
constants, the capability reply, WebUpdate.js (the region check) and Simulator.js now follow the
setting (were "needs change"); the SDK boot check and BTIF/VM rebuilding stay unverified until the
hardware checklist (BUILD.md 24.6 step 5); restore of factory V16 writes 0xF4000–0xFDFFF in either
layout, inside the song region (24.6 step 6 checks the probe boots after it).

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

## 7. Task 03 checkpoint (d): song mode (measured)

Built with Track B (`make firmware`), byte-identical to Track A (`make crosscheck`):
sdk.elf 311365d6…, .fwsc a36467a7….

| Quantity | After (b) | After (d) | Change |
| --- | ---: | ---: | ---: |
| App image | 439812 | **449572** | +9760 |
| Margin to the 453921-byte packaging limit | 14109 | **4349** | −9760 |
| .text | 364000 | 372608 | +8608 |
| .ram0_data | 75780 | 76932 | +1152 |
| .ram0_bss | 190524 | 223356 | +32832 |
| Static SRAM (data + bss + boot_info) | 266356 | 300340 | +33984 |
| Runtime heap (minimum 49152) | 257260 | 223276 | −33984 |

The 4 KB post-song-mode requirement (decision 1) is met with 253 bytes to spare. Where the
flash went (post-LTO attribution, `make flash-budget` with a regenerated
`build/pro/nolto.json`; flash-budget.py v0.2 lists the two new units):

| Unit | After (b) | After (d) | Note |
| --- | ---: | ---: | --- |
| app/song_storage.c | — | 3850 | transactions, recovery, directory, compaction, status (`song_storage_prepare` 570, `song_directory_build` 430) |
| app/song.c | — | 1886 | row decode, audio tick, play / stop / jump; most of it inlined into `groove_samples_poll` and the tick |
| app/samples.c | 36 | 1282 | `groove_samples_poll` now carries the inlined song poll and the storage poll |
| app/screen.c | 32401 | 34566 | +2165: SONG page draw and controls, two ACTIONS entries, PLAY ownership |
| app/transfer.c | 2458 | 3060 | +602: kinds 5 / 6, command 23 |
| app/midi_router.c | 3835 | 4229 | +394: song owner, channel override, delivery-time channel, tick hook |
| libfm1_engine.a | 364647 | 364647 | unchanged |
| other units | | | within ±20 B |

RAM: the sequencer's two row buffers (2 × 6670 B), the directory (2048 × 5 B), the 4 KB
transaction image, the loaded record (2624 B), a payload buffer (832 B) and the router's
wider held-note maps account for the 33 KB of static SRAM; the heap stays 4.5× the minimum.

### 7.1 If more flash is needed later

The margin is above the requirement but small. The candidates of section 6.1 still apply
(factory DX7 bank 10239, step editor pages 3620, factory scenes 2664, BLE page 1770,
EFFECTS page 680, NAME page 326). Inside the new code the cheapest cuts would be the SONG
page's per-track block-id columns and error texts (≈ 400 B) and the compaction pass
(≈ 500 B, keeping only the append-time compaction).

## 8. Task 03 checkpoint (e): batched block upload (measured)

Built with Track B (`make firmware`), byte-identical to Track A (`make crosscheck`):
sdk.elf 114461b2…, .fwsc ef0a6f43….

| Quantity | After (d) | After (e) | Change |
| --- | ---: | ---: | ---: |
| App image | 449572 | **450980** | +1408 |
| Margin to the 453921-byte packaging limit | 4349 | **2941** | −1408 |
| .text | 372608 | 374016 | +1408 |
| .ram0_data | 76932 | 76932 | 0 |
| .ram0_bss | 223356 | 223356 | 0 |
| Static SRAM (data + bss + boot_info) | 300340 | 300340 | 0 |
| Runtime heap (minimum 49152) | 223276 | 223276 | 0 |

**The 4 KB post-song-mode requirement (decision 1) is no longer met: the margin is 1155
bytes short.** The batch transaction and its recovery are what the importer's 98..137-block
songs need; the shortfall is the user's call (section 8.1). Where the flash went (post-LTO
attribution, regenerated `build/pro/nolto.json`):

| Unit | After (d) | After (e) | Note |
| --- | ---: | ---: | --- |
| app/song_storage.c | 3850 | 5136 | +1286: `song_block_batch` 826 (validation, packing, programming, journal), `song_storage_prepare` 570 → 652 (journal finish, pending erase), `batch_finalize`, the plain-erase branch of `song_storage_compact_sector` |
| app/samples.c | 1282 | 1356 | +74 (the inlined storage poll's pending check) |
| app/transfer.c | 3060 | 3102 | +42: kind 7 begin and finish |
| other units | | | unchanged (screen.c 34566, midi_router.c 4229, song.c 1886, libfm1_engine.a 364647) |

RAM: none. The batch stream lives in the transfer buffer that every upload already
allocates (up to 32 KB from the heap during an upload, freed at the finish), the sector
image and the liveness table are the ones from checkpoint (d).

### 8.1 Getting back to 4 KB of headroom

1155 bytes are needed. Candidates, smallest change first; each is a decision, none is
taken here:

| Candidate | Saves (bytes) | Cost |
| --- | ---: | --- |
| SONG page: drop the per-track block-id columns and the error texts (keep ROW / BAR / state) | ≈ 400 | less diagnostics on the device; the workbench shows the same |
| Full compaction pass (ACTIONS "COMPACT SONG STORAGE"), keep only the append-time compaction of the fullest sector and the batch's free-sector choice | ≈ 500 | stale copies are reclaimed only when the pool is full or a song is deleted |
| NAME page (project naming on the device; the workbench renames) | 326 | rename in the workbench only |
| EFFECTS page | 680 | effects set in the workbench or by CC only |
| BLE page (pairing from the device; BLE itself stays) | 1770 | pair from the workbench |
| Factory scenes (app/presets.c) | 2664 | no factory projects on a blank device; the workbench has them |
| Step editor pages (STEP DETAILS / RHYTHM) | 3620 | pattern editing in the workbench |
| Factory DX7 bank (app/fm_factory.c) | 10239 | DX7 presets loaded from the workbench |

The first two together (≈ 900) do not reach 1155; the first three do (≈ 1226). The
section 6.1 numbers for the larger candidates still hold (screen.c is linked without LTO,
one input section per function, so page removals are exact).

## 9. Task 03 checkpoint (f): factory scenes removed (measured)

Built with Track B (`make firmware`), byte-identical to Track A (`make crosscheck`):
sdk.elf 099162a9…, .fwsc 2321722b….

| Quantity | After (e) | After (f) | Change |
| --- | ---: | ---: | ---: |
| App image | 450980 | **447588** | −3392 |
| Margin to the 453921-byte packaging limit | 2941 | **6333** | +3392 |
| .text | 374016 | 371296 | −2720 |
| .ram0_data | 76932 | 76260 | −672 |
| .ram0_bss | 223356 | 223612 | +256 |
| Static SRAM (data + bss + boot_info) | 300340 | 299924 | −416 |
| Runtime heap (minimum 49152) | 223276 | 223692 | +416 |

**The 4 KB post-song-mode requirement (decision 1) is met again, with 2237 bytes to
spare.** The candidate taken was the factory scenes (section 8.1 listed it at 2664); the
net saving is larger because `groove_factory_load` and the HOME bank handling went with
them, and smaller than the sum because checkpoint (f) also added the liveness-by-reference
scan and the tempo check:

| Unit | After (e) | After (f) | Note |
| --- | ---: | ---: | --- |
| app/presets.c | 2664 | 22 | scene recipes, pattern generator, demo voices gone; the 808 default kit is inlined into project.c |
| app/project.c | 6580 | 5844 | −736: `groove_factory_load` gone, the 808 kit builder inlined |
| app/screen.c | 34566 | 34368 | −198: no FACTORY bank in the HOME browser |
| app/song_storage.c | 5136 | 5348 | +212: liveness by reference (rows read, 256-byte bitmap in .bss), tempo range |
| other units | | | within ±20 B |

RAM: the 256-byte `referenced` bitmap is the only addition; the removed scene tables were
in .ram0_data (−672).

## 10. Task 04, firmware part: row events (measured)

Built with Track B (`make firmware`), byte-identical to Track A (`make crosscheck`):
sdk.elf 832f395b…, .fwsc 544cacc2….

| Quantity | After (f) | After Task 04 fw | Change |
| --- | ---: | ---: | ---: |
| App image | 447588 | **449252** | +1664 |
| Margin to the 453921-byte packaging limit | 6333 | **4669** | −1664 |
| .text | 371296 | 372064 | +768 |
| .ram0_data | 76260 | 77156 | +896 |
| .ram0_bss | 223612 | 225372 | +1760 |
| Static SRAM (data + bss + boot_info) | 299924 | 302580 | +2656 |
| Runtime heap (minimum 49152) | 223692 | 221036 | −2656 |

The task's floor of 2 KB after Task 04 holds with 2.6 KB to spare before the workbench
part, which adds no firmware. Attribution (post-LTO, regenerated `build/pro/nolto.json`):

| Unit | After (f) | After Task 04 fw | Note |
| --- | ---: | ---: | --- |
| app/song.c | 1886 | 3106 | +1220: event decode per row, stream scheduler (gaps, pre-firing, late counter), SEND SETUP |
| app/song_storage.c | 5348 | 5540 | +192: version-2 table validation (`song_record_valid` 524), CRC range by version |
| app/screen.c | 34368 | 34570 | +202: ACTIONS "SEND SETUP", SONG page EVENTS / LATE line |
| app/midi_router.c | 4229 | 4259 | +30: `groove_midi_song_event` |
| app/samples.c | 1356 | 1384 | +28 (inlined poll) |
| app/transfer.c | 3102 | 3118 | +16: command 23 bytes 13..14 |
| other units | | | unchanged |

RAM: the loaded record now keeps its 1472-byte tail, the two row buffers hold 32 four-byte
events each plus a count and lead, and the stream state is a few bytes; the ram0_data
growth is the sequencer's initialised state moving with the larger structures.

## 11. Task 05: timed notes (measured)

Built with Track B (`make firmware`), byte-identical to Track A under the machine lock
(`make crosscheck`): sdk.elf 9586ac20…, .fwsc aca56284…, app-image.bin 9b5b9466….

| Quantity | After Task 04 fw | After Task 05 | Change |
| --- | ---: | ---: | ---: |
| App image | 449252 | **451364** | +2112 |
| Margin to the 453921-byte packaging limit | 4669 | **2557** | −2112 |
| .text | 372064 | 372672 | +608 |
| .ram0_data | 77156 | 78660 | +1504 |
| .ram0_bss | 225372 | 240540 | +15168 |
| Static SRAM (data + bss + boot_info) | 302580 | 319252 | +16672 |
| Runtime heap (minimum 49152) | 221036 | 204364 | −16672 |

The task's floor of 2 KB holds with 509 bytes to spare. The first song.c rewrite left
1629 bytes; merging the look-ahead into the window scan and replacing the 64-bit
probability masks with a one-entry cache per track brought it back (section 9.12 of
docs/tasks/TASK-03-step1-assessment.md records the decision). The sequencer's tick path
is `FM1_AUDIO_CODE` (SRAM, counted in .ram0_data), which is where most of the growth
lands; the flash-resident part is the payload upgrade and the per-format validators in
song_storage.c. Attribution (post-LTO, `build/pro/nolto.json` regenerated for this
source state):

| Unit | After Task 04 fw | After Task 05 | Note |
| --- | ---: | ---: | --- |
| app/song.c | 3106 | 4662 | +1556: position in units with the exact block advance, window scan with sorted actions (`scan` 380, `tick` 648), swing warp, look-ahead for negative offsets, probability cache, `decode_row` 426 with the in-place v1 upgrade |
| app/song_storage.c | 5540 | 5972 | +432: `song_payload_upgrade` 186, `song_payload_valid` 276 (v1 and v2 validators through the timed-note decoder), record byte 1 as payload format, 1600-byte payload limit |
| app/transfer.c | 3118 | 3164 | +46: kind 6 carries the format byte, downloads upgrade, capability bit 4 |
| app/smk37_controls.c | 2577 | 2605 | +28 (inlined song calls) |
| app/samples.c | 1384 | 1396 | +12 (inlined poll) |
| app/project.c | 5834 | 5844 | +10 |
| app/midi_router.c | 4259 | 4257 | −2: song notes use lane 0 only |
| app/timed_note.c | — | 0 | no symbol survives LTO: `timed_note_decode` is inlined into the validators and `decode_row` and counted there |
| app/screen.c | 34570 | 34570 | unchanged |
| alignment / linker fill | 148 | 178 | +30 |
| unattributed (LTO) | 748 | 748 | unchanged |

RAM (+16672, against the +14 KB estimate of the Step 1 assessment): the two row buffers
now hold 25-byte step cells for four 6-byte notes plus the per-track swing, the payload
buffer grew from 640 to 1600 bytes, the sounding table keeps note-off times in units,
and the action list and probability cache are new; song.c's standalone .bss went from
18860 to 34016 bytes. The runtime heap keeps 155 KB above its 48 KB minimum.

Removal candidates for the next task are unchanged from section 2: the BLE page
(1768), EFFECTS (680) and NAME (parts of 1582) in screen.c are the cheapest 2-4 KB.

## 12. Task 06 checkpoint (a): BLE and NAME pages removed (measured)

Built with Track B, byte-identical to Track A under the machine lock (`make crosscheck`).

| Quantity | After Task 05 | After (a) | Change |
| --- | ---: | ---: | ---: |
| App image | 451364 | **447140** | −4224 |
| Margin to the 453921-byte packaging limit | 2557 | **6781** | +4224 |
| .text | 372672 | 368448 | −4224 |
| .ram0_data | 78660 | 78660 | 0 |
| .ram0_bss | 240540 | 240220 | −320 |
| Static SRAM (data + bss + boot_info) | 319252 | 318932 | −320 |
| Runtime heap (minimum 49152) | 204364 | 204684 | +320 |

Attribution (post-LTO, `build/pro/nolto.json` regenerated):

| Unit | After Task 05 | After (a) | Note |
| --- | ---: | ---: | --- |
| app/screen.c | 34570 | 30896 | −3674: `draw_ble` 1288, `ble_control` 400, `radio_line` 80 and their tables 104, `name_draw` 244 (−2116 of page functions, `apply_controls` 6366 → 6102, `draw_page_body` 2632 → 2576, `header` / `overview` / `mix_draw` a few bytes each from the shorter page list, the string pool 5990 → 5218) |
| libfm1_engine.a | 364647 | 364060 | −587: `fm1_ble_scan` 94, `fm1_ble_connect` 174, `fm1_ble_disconnect` 30, `fm1_ble_get_device` 74, `fm1_bluetooth_get_status` and their callees, no longer referenced |
| app/transfer.c | 3164 | 3252 | +88: command 24, capability bit 5 |
| app/project.c | 5844 | 5794 | −50 |
| alignment / linker fill | 178 | 177 | −1 |
| unattributed (LTO) | 748 | 748 | unchanged |

The assessment's estimate for the two pages was ≈ 2850 (section 7.2 there); the SDK's
client wrappers and the string pool account for the rest. The Task 06 code (estimate
+3100, range 2500..3900) fits with ≈ 3.7 KB to spare at the mid point; the EFFECTS page
(≈ 1400) stays the reserve, taken only if the measured margin after the code is under 2 KB.

## 13. Task 06 checkpoint (b): per-track playheads (measured)

Built with Track B, byte-identical to Track A under the machine lock (`make crosscheck`).

| Quantity | After (a) | After (b) | Change |
| --- | ---: | ---: | ---: |
| App image | 447140 | **449028** | +1888 |
| Margin to the 453921-byte packaging limit | 6781 | **4893** | −1888 |
| .text | 368448 | 368064 | −384 |
| .ram0_data | 78660 | 80932 | +2272 |
| .ram0_bss | 240220 | 242780 | +2560 |
| Static SRAM (data + bss + boot_info) | 318932 | 323764 | +4832 |
| Runtime heap (minimum 49152) | 204684 | 199852 | −4832 |

The first build of the new app/song.c at -O2 cost +4000 bytes (image 451140, margin 2781):
the compiler unrolled the eight-track loops of the tick and the switches. The sequencer
units (app/song.c, app/song_storage.c, app/timed_note.c) now compile at -Oz like the other
control-task units (build.py v0.5); the audio tick is a few hundred instructions per block
and the host timing checks are unchanged. Attribution (post-LTO, `build/pro/nolto.json`
regenerated):

| Unit | After (a) | After (b) | Note |
| --- | ---: | ---: | --- |
| app/song.c | 4662 | 7396 | +2734: `tick` 1854 (the per-track plan, scans, look-ahead and the action loop), `song_switch` 594, `scan` 382, `song_tick` 358, `enter_frame` 308, `track_switch` 302, `song_play` 364, `song_status_read` 332, `decode_track` 264, `release_track` 250, `stream_run_one` 202, `song_next` 194, `prefire` 182, `prefire_track` 154; all of it except the control-task functions in SRAM |
| app/song_storage.c | 5972 | 5206 | −766: -Oz (`song_block_batch` 818 → 704, `song_storage_prepare` 610 → 494, `song_record_valid` 524 → 346) |
| app/transfer.c | 3252 | 3288 | +36: command 23 bytes 15..30 |
| app/midi_router.c | 4257 | 4271 | +14: `groove_midi_song_track_channel` |
| app/samples.c | 1396 | 1226 | −170 (-Oz inlining) |
| app/smk37_controls.c | 2605 | 2615 | +10 |
| app/project.c | 5794 | 5796 | +2 |
| alignment / linker fill | 177 | 171 | −6 |
| unattributed (LTO) | 748 | 782 | +34 |

RAM: `tbuf[8][2]` 27872 bytes against the two row buffers' 25896 (the per-track event
slices, 128 bytes per buffer, are the difference), `rowset[2]` 276, the action list 1280
(160 entries against 128), `plan` 64, `tr` 128, nine streams 54; the rest is the audio code
in .ram0_data. The heap keeps 150 KB above its minimum.

Margin for the rest of Task 06: 4893 bytes for the TRACK LAUNCH page, the pad colours and
the SCL / ENV routing (assessment estimate ≈ 1450); the 2 KB floor holds with the EFFECTS
page untouched if the page costs less than ≈ 2.8 KB.

## 14. Task 06 checkpoint (c): the TRACK LAUNCH page (measured)

Built with Track B, byte-identical to Track A under the machine lock (`make crosscheck`).

| Quantity | After (b) | After (c) | Change |
| --- | ---: | ---: | ---: |
| App image | 449028 | **451396** | +2368 |
| Margin to the 453921-byte packaging limit | 4893 | **2525** | −2368 |
| .text | 368064 | 370432 | +2368 |
| .ram0_data | 80932 | 80932 | 0 |
| .ram0_bss | 242780 | 242812 | +32 |
| Static SRAM (data + bss + boot_info) | 323764 | 323796 | +32 |
| Runtime heap (minimum 49152) | 199852 | 199820 | −32 |

| Unit | After (b) | After (c) | Note |
| --- | ---: | ---: | --- |
| app/screen.c | 30896 | 32975 | +2079: `apply_controls` +398 (the page's control block and the SCL / ENV intercept), `smk37_screen_launch_color` 340, the draw block (in `draw_page_body`, cold and minsize) and its strings, `launch_phase` |
| app/song.c | 7396 | 7604 | +208: the launch API is referenced now (it was dead code in the device build at (b)); the back-to-song row fix (BUILD.md 19.3) |
| app/samples.c | 1226 | 1298 | +72: inlining |
| app/smk37_controls.c | 2615 | 2629 | +14: the colour hook |
| alignment / linker fill | 171 | 166 | −5 |

The assessment's estimate for this part was ≈ 1450. The page is the last firmware of Task
06 (checkpoint (d) is workbench only), so the 2 KB floor holds at 2525 with the EFFECTS
page untouched. If a later task needs room, EFFECTS (≈ 1400, section 7.2 of the
assessment) is still the reserve, and the launch page's text could be shortened.

Checkpoint (d) (2026-11-04) changed no firmware: the figures above are Task 06's final ones
(app image 451396, margin 2525, static SRAM 323796).

## 15. Task 08: the display version (measured)

The boot screen draws `FM1_DISPLAY_VERSION` (the git tag) instead of the 3-character Open
label; the identity constants are unchanged. Measured with Track B at the Task 08 tree:

| Display string | App image | Delta |
| --- | ---: | ---: |
| "V01" (forced label, the release gate) | 451396 | 0 |
| "TABBY-V03.0" (11 characters, a scratch copy of the tabby-v03.0 tree) | 451396 | 0 |
| "tabby-v03.0-6-g0c32d69-dirty" (28 characters, a development build) | 451428 | +32 |

The 8 extra bytes of a tag fall inside .text alignment; a release build keeps the margin at
2525 bytes. Appendix A is not regenerated: the release build's section sizes are those of
section 14.

## 16. Task 11: the diagnostic build and the probe (measured)

All three built from the same tree on 2026-11-07 with DISPLAY_VERSION=tabby-v03.3-diag
(the published builds use their own tags; a 16- and a 17-character string give the same image
size after alignment):

| Build | Options | App image | .ram0_data | .ram0_bss | Heap | Hard limit | Margin |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| normal | none | 451396 | 80932 | 242812 | 199820 | 453921 | 2525 |
| tabby-v03.3-diag | DIAG=1 | 453284 | 80996 | 243900 | 198668 | 453921 | **637** |
| tabby-p0-probe64 | DIAG=1 USER_BYTES=471040 | 453284 | 80996 | 243740 | 198828 | 519457 | **66173** |

The diagnostic code is 1888 bytes of flash (counters, command 25, transfer kind 8 with its
validation, the ACTIONS lines) and 1152 bytes of static RAM (the 1 KB stamp ring beside the scan
queue, the counters). The probe's .bss is 160 bytes smaller (16 fewer song-region sectors in the
storage tables). The normal build is the same code as before Task 11 (BUILD.md 24.1 gate).

## 17. Task 12: Phase 0, make room (measured, normal build, USER 471040, hard limit 519457)

| Step | App image | Change | Margin |
| --- | ---: | ---: | ---: |
| tabby-v03.3 normal build on the 536576 layout (section 16) | 451396 | | 2525 (limit 453921) |
| A1: 471040 layout, commands 27 / 28, ERASE confirm | 451620 | +224 | 67837 |
| A2: step editor removed, SYNC / MIDI page added | 443396 | **-8224** | 76061 |
| A3 + A4: no flash write during play; the counters, kind 8, the ACTIONS storage lines and the loop profile in the normal build (built together, not measured apart) | 447748 | +4352 | **71709** |
| A5 (workbench and pages only) + the release build with DISPLAY_VERSION=tabby-v04.0 (build id b6e9590223446363…) | 447716 | -32 (alignment of the version string) | **71741** |

Runtime heap after A4: 198636 bytes (the Task 11 diagnostic build had 198668; the 1 KB key-stamp
ring and the counters are now in every build). The counters cost 1888 bytes in Task 11; A4 adds the
profile (about 0.9 KB: the per-hook wrappers and pages 4 and 5) and drops command 26 from the normal
build.

A2 against the Task 10 assessment (section J): removing STEPS 1-7, STEP_EDIT, RHYTHM and the REC
logic outright was estimated at about 8 KB (5920 bytes of page code measured plus about 2 KB of
apply_controls and strings estimated). Keeping swing, clock, clock input and the output switches on
the new SYNC / MIDI page and keeping MIDI TRACK, as the user chose, still freed 8224 bytes: the
removal also took the pad-step mode, the step-cursor and REC states of the header and overview, the
step-editing ACTIONS entries and the web step grid's handlers, which the estimate did not count.

## Appendix A — generated tables (tools/linux/flash-budget.py on the Track A build/pro/sdk.elf)

### Flash use by input (from sdk.map; .text includes rodata)

| Input | .text | .data | .ram0_data | .cache_ram_data | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| libfm1_engine.a | 294314 | 0 | 69714 | 32 | 364060 (355.5 KiB) |
| app (LTO-merged units) | 27880 | 0 | 6714 | 0 | 34594 (33.8 KiB) |
| app/screen.c | 32967 | 0 | 8 | 0 | 32975 (32.2 KiB) |
| app/board/scan.c | 1649 | 0 | 3756 | 0 | 5405 (5.3 KiB) |
| app/midi_router.c | 3613 | 0 | 658 | 0 | 4271 (4.2 KiB) |
| app/transfer.c | 3288 | 0 | 0 | 0 | 3288 (3.2 KiB) |
| libcompiler_rt.a | 3212 | 0 | 0 | 0 | 3212 (3.1 KiB) |
| app/board/panel.c | 2697 | 0 | 8 | 0 | 2705 (2.6 KiB) |
| libc.a | 720 | 0 | 0 | 0 | 720 (0.7 KiB) |
| **input sections total** | | | | | **451230 (440.7 KiB)** |
| alignment / linker-script fill (app image − inputs) | | | | | 166 |
| **app image (firmware-report.json)** | | | | | **451396 (440.8 KiB)** |

### App units after LTO

Exact for the -fno-lto units (map input sections). For LTO units the post-LTO size is the sum of `nm` sizes of symbols traced back to the unit (lower bound: inlined code is unattributed); the standalone column is the unit compiled alone with -fno-lto, for scale.

| Unit | post-LTO flash bytes | method | standalone -fno-lto (text+rodata+data) | standalone .bss |
| --- | ---: | --- | ---: | ---: |
| app/audio_output.c | 290 | nm symbols (LTO) | 302 | 1540 |
| app/board/audio.c | 720 | nm symbols (LTO) | 718 | 5156 |
| app/board/panel.c | 2705 | map (-fno-lto) | 3435 | 984 |
| app/board/scan.c | 5405 | map (-fno-lto) | 5471 | 2844 |
| app/fm_factory.c | 10233 | nm symbols (LTO) | 10063 | 0 |
| app/fm_library.c | 14 | nm symbols (LTO) | 312 | 0 |
| app/midi_router.c | 4271 | map (-fno-lto) | 4271 | 4014 |
| app/presets.c | 22 | nm symbols (LTO) | 340 | 0 |
| app/project.c | 5796 | nm symbols (LTO) | 6296 | 4140 |
| app/samples.c | 1298 | nm symbols (LTO) | 36 | 0 |
| app/screen.c | 32975 | map (-fno-lto) | 31192 | 10374 |
| app/smk37_controls.c | 2629 | nm symbols (LTO) | 2849 | 230 |
| app/transfer.c | 3288 | map (-fno-lto) | 3288 | 1144 |
| app/song.c | 7604 | nm symbols (LTO) | 8016 | 36560 |
| app/song_storage.c | 5206 | nm symbols (LTO) | 5944 | 15588 |
| generated/build_identity.c | 0 | nm symbols (LTO) | — | — |
| LTO-merged units, map total | 34594 | map | | |
| of which traced to a unit above | 33812 | | | |
| of which unattributed (inlined/merged/renamed by LTO) | 782 | | | |

### Top 40 app symbols by size (post-LTO, from nm --print-size)

| Size | Symbol | Unit | Kind |
| ---: | --- | --- | --- |
| 9399 | `factory_tokens` | app/fm_factory.c | t |
| 6500 | `apply_controls` | app/screen.c | t |
| 4646 | `edit_page_draw` | app/screen.c | t |
| 2760 | `groove_transfer_poll` | app/transfer.c | T |
| 2584 | `draw_page_body` | app/screen.c | t |
| 1860 | `tick` | app/song.c | t |
| 1442 | `overview` | app/screen.c | t |
| 1398 | `smk37_control_event` | app/smk37_controls.c | T |
| 1388 | `groove_screen_control` | app/screen.c | T |
| 1280 | `pad_velocity` | app/board/scan.c | t |
| 1058 | `header` | app/screen.c | t |
| 1024 | `groove_samples_poll` | app/samples.c | T |
| 938 | `steps` | app/screen.c | t |
| 770 | `groove_project_poll` | app/project.c | T |
| 704 | `song_block_batch` | app/song_storage.c | T |
| 680 | `effects_draw` | app/screen.c | t |
| 656 | `groove_midi_poll` | app/midi_router.c | T |
| 638 | `fm1_screen_fill` | app/board/panel.c | T |
| 636 | `fm1_screen_submit` | app/board/panel.c | T |
| 610 | `smk37_scan_read` | app/board/scan.c | T |
| 594 | `song_switch` | app/song.c | t |
| 594 | `project_draw` | app/screen.c | t |
| 586 | `deliver` | app/midi_router.c | t |
| 544 | `fm1_screen_init` | app/board/panel.c | T |
| 494 | `song_storage_prepare` | app/song_storage.c | t |
| 488 | `draw` | app/screen.c | t |
| 480 | `text` | app/screen.c | t |
| 468 | `groove_screen_init` | app/screen.c | T |
| 466 | `groove_project_save_slot` | app/project.c | T |
| 464 | `scan_live` | app/song_storage.c | t |
| 446 | `groove_midi_config_apply` | app/midi_router.c | T |
| 444 | `groove_settings_midi` | app/project.c | T |
| 424 | `mix_draw` | app/screen.c | t |
| 388 | `pad_prc` | app/board/scan.c | t |
| 382 | `scan` | app/song.c | t |
| 364 | `song_play` | app/song.c | T |
| 358 | `song_tick` | app/song.c | T |
| 352 | `apply_sanitized` | app/project.c | t |
| 348 | `song_directory_build` | app/song_storage.c | t |
| 346 | `song_record_valid` | app/song_storage.c | t |

### screen.c by page (exact: screen.c is linked without LTO, one input section per function)

| Page group | Bytes | Functions |
| --- | ---: | --- |
| FM_EDIT / FM_ENV / FM_LFO / FM_QUICK (DX7 editor) | 0 |  |
| TONE_EDIT (engine tone editor) | 0 |  |
| BLE (Bluetooth page) | 0 |  |
| PROJECT / NAME / PRESET_BROWSER | 1254 | preset_draw 286, preset_load 312, preset_refresh 24, project_draw 594, project_refresh 38 |
| EFFECTS | 680 | effects_draw 680 |
| STEPS / STEP_EDIT / RHYTHM / ARP_EDIT (sequencer editing) | 5920 | edit_page_draw 4646, move_step 86, sequence_length_adjust 80, step_first 38, steps 938, toggle_step 132 |
| OVERVIEW / MIX | 3176 | header 1058, hint_draw 68, mix_draw 424, overview 1442, performance_hint 184 |
| STARTUP | 192 | boot_draw 192 |
| shared (paint, text, fonts, strings, controls dispatch, web targets, init) | 21745 | apply_controls 6500, str1.1 5559, draw_page_body 2584, groove_screen_control 1388, draw 488, text 480, groove_screen_init 468, smk37_screen_launch_color 358, draw_page 342, paint_flush 296, smk37_screen_pad_mode 208, knob 198, select_track 192, font 180, punctuation 160, paint_fill 158, smk37_screen_shortcut 146, smk37_screen_page 142, smk37_screen_pad 128, groove_screen_mmc 114, release_keys_except 102, note_name 90, actions 88, frame 80, decimal 78, smk37_panel_preferences_apply 72, paint_mark 62, navigation_mode 60, groove_screen_tap 50, post 50, number 48, smk37_panel_preferences_read 40,  |
| **screen.c .text total** | **32967** | |

### libfm1_engine.a by vendor section family (single object, --whole-archive; not removable piecewise)

| Bytes | Section family |
| ---: | --- |
| 85518 | `.text` |
| 57656 | `.volatile_ram_code` |
| 37560 | `.bt_stack_code` |
| 26458 | `.classic_lmp_code` |
| 21684 | `.classic_rf_code` |
| 14488 | `.ble_rf_code` |
| 12716 | `.text.cold` |
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
| 1693 | `.rodata.str1` |
| 1264 | `.classic_lmp_auth_const` |
| 1248 | `.link_bulk_code` |
| 1112 | `.crypto_code` |
| 1080 | `.crypto_bigint_code` |

### Synth-engine code inside libfm1_engine.a (from nm; informational)

| Engine | Bytes | Symbols |
| --- | ---: | ---: |
| DX7 (dx7*, synth_dx7*) | 8752 | 35 |
| 303 bass (bass303*) | 4780 | 20 |
| 808 drums (drum808*) | 1856 | 20 |
| PSG (psg*, emu2149) | 4458 | 14 |
| Pluck (pluck*) | 1918 | 10 |
| Sample drums (sampledrum*) | 1670 | 17 |
| Effects (fm1_fx*) | 698 | 6 |
| Groove sequencer (groove_*) in SDK | 18488 | 130 |

Package layout: FLASH_BIN_SIZE 471040, VM 471040..503808 (32768 bytes, minimum 32768), BTIF 503808..507904, USER 507904..1044480 (536576 bytes).
