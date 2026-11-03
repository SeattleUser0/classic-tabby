# Classic Tabby — Linux build of SMK37 Open V01

Version: 0.16
Revision log:
- v0.16, 2026-11-02 (Task 04, workbench part): section 17: device library, rig setup, row
  event editor, importer conversion, tests, the Task 04 hardware checklist.
- v0.15, 2026-11-02 (Task 04, firmware part): section 16: row events in firmware, measured
  figures, host tests, and the device setup list for the hardware checklist.
- v0.14, 2026-11-02 (Task 03 checkpoint f): section 15: factory scenes out, delete-before-
  replace in the shared song write, tempo range, liveness by reference; 13.4 step 12 (timing
  against the stock sequencer); 14.5 step 5 wording.
- v0.13, 2026-11-02 (Task 02 Step 4): section 14: MIDI import build notes folded from
  docs/tasks/TASK-02-notes.md, the Step 4 changes, the simulator check and the hardware
  checklist for the importer.
- v0.12, 2026-11-02 (Task 03 checkpoint e): section 13: batched block upload (transfer
  kind 7), measured figures, upload time estimate, hardware checklist for the first flash.
- v0.11, 2026-11-02 (Task 03 checkpoint d): section 12: song mode (storage, sequencer,
  transfer, SONG page, workbench editor); measured figures; host test v0.3.
- v0.10, 2026-11-02 (Task 03 checkpoint b): section 11: DX7 operator editor pages and the
  tone editor removed from app/screen.c and the workbench simulator; measured figures.
- v0.9, 2026-11-02 (Task 03 checkpoint a): section 10: sampler and DX7 user library removal,
  migration prompt, workbench changes, manifest re-pin tool (tools/linux/pin-sdk-files.py),
  measured flash/RAM. `make test` now has 35 host checks.
- v0.8.1, 2026-11-02: section 9.3a, verification of the live site, archive and release.
- v0.8, 2026-11-02 (Task 02): publication. `build.py` v0.3 ports `-Package`; `make package`,
  `hosted`, `release-assets`, `publish`, `release` (Makefile v0.4); `tools/linux/publish-pages.py`
  v0.1 (Build-Hosted.cjs + gh-pages); section 9 with the published hashes, Pages URL and the
  tag rule for the GPL source link. Section 7 rows for Build-Web.ps1 and Build-Hosted.cjs updated.
- v0.7, 2026-11-01 (Step 8, end of Task 01): hardware readiness recorded read-only
  (section 8); no udev rule needed for Chrome WebMIDI/SysEx; the plugged-in device
  enumerates as "Orange Cat FM-1", not as an M-VAVE SMK-37 (open question).
- v0.6, 2026-11-01 (Step 7): host smoke tests (`tests/host/smoke.c`, native gcc build of
  the app + simulator sources with FM1_HOST_TEST) and `make test`; Makefile v0.3.
- v0.5, 2026-11-01 (Step 6): web workbench preview built with the Linux WASI SDK 27
  (`tools/linux/build-web.py`); simulator wasm byte-identical to the official release;
  preview verified in Chrome; Node check of the wasm; Makefile v0.2 (web, web-smoke).
- v0.4, 2026-11-01 (Step 5, Checkpoint C): Track B built from the toolchains folder (no
  /opt/jieli); A/B comparison: byte-identical; Track B is the default `make firmware`;
  top-level Makefile v0.1 (verify, firmware, firmware-native, firmware-ref, crosscheck,
  flash-budget, package-equivalence, clean).
- v0.3, 2026-11-01 (Step 4): official package reproduced byte for byte from the official
  source kit (`build.py --source-root`, v0.2); second-directory determinism result recorded;
  fork keeps LF line endings, so its build_id differs from official for that reason only.
- v0.2, 2026-11-01 (Checkpoint A): Wine installed, ~/.wine-jieli created, Track A build
  done and deterministic; package versions updated; flash/RAM baseline now from Track A.
- v0.1.2, 2026-11-01: PowerShell unavailable from Microsoft's repo for Ubuntu 26.04; pwsh
  equivalence test deferred (left to test); tar.gz alternative noted; install script v0.2.
- v0.1.1, 2026-11-01: added docs/FLASH-BUDGET.md reference and tools/linux/flash-budget.py.
- v0.1, 2026-11-01: created during Task 01. Steps 1 (repo) and 2 (host packages, partly
  blocked on sudo) done; Track A port written and verified against the native toolchain in
  a scratch build; official V01 release metadata captured; Track B toolchain pinned.

This file tracks what is done, what is left to build, what is left to test, exact package
versions, toolchain hashes, and the commands to reproduce the build from a clean Ubuntu
install. It is updated at every checkpoint. Scope and acceptance criteria: docs/SPEC.md.

Nothing in Task 01 touches device flash. Factory calibration and protected flash regions
are never written.

## 1. Status

### Done

- Step 1: upstream cloned to `firmware/` (remote `upstream`, tag `upstream-v01` =
  b2d6bcb "SMK37 OPEN V01"), branch `classic-tabby/linux-build`. `.gitattributes` intact.
  All 67 hashes in the `files` section of `sdk/manifest.json` verified against disk.
- Step 7 (**done**): `make test` = `host-smoke` + `web-smoke`. `host-smoke` compiles the 33
  app/web/third_party C units (the simulator's source set, `-DFM1_HOST_TEST -DFM1_OPEN_WEB`)
  natively with gcc 15.2 in 7 s together with `tests/host/smoke.c`, and runs it: it builds,
  the simulator initializes with cleared storage, SMK37 key 12 gives Note On 60 velocity
  100 on MIDI channel 1 (the default for keyboard track 0) on ports 0-2 and Note Off on
  release, the track's output channel moved to 3 through the MIDI settings makes the note
  follow (after the firmware's controller reset on the old channel), and audio renders.
  21 checks, all pass. The Makefile (v0.3) has verify, firmware, firmware-native,
  firmware-ref, crosscheck, web, web-smoke, host-smoke, test, flash-budget,
  package-equivalence, clean.
- Step 8 (**done, read only**): USB and ALSA enumeration recorded in section 8. Nothing
  was sent to or written on any device. Resolved 2026-11-02: the user confirmed the
  plugged-in device is the Orange Cat FM-1; the SMK-37 Pro was not connected.
- Task 02 (**done**, 2026-11-02): `make package` builds the distribution workbench with the
  firmware and stock V16 embedded, `make publish` puts the static site on GitHub Pages, and
  the tabby-v01.0 release carries the files. Section 9.
- Task 03 checkpoint (a) (**done**, 2026-11-02): sampler and DX7 user library removed, song
  region migration prompt. Section 10. Checkpoints (b)-(d) open.
- Step 2 (partial): versions recorded below. Packages that need root are not installed yet
  (sudo requires an interactive password); `tools/linux/install-host-packages.sh` is the
  reproducible installer for a clean host.
- Step 3 (Track A, **Checkpoint A reached**): JieLi Windows toolchain 2.5.3 unpacked with
  innoextract (no Wine needed to extract); all 22 `external_toolchain` hashes match.
  Wine 10.0 (wine64 + wine32:i386) with a dedicated prefix `~/.wine-jieli` runs
  `clang.exe --version` (clang 4.0.1, target i686-pc-windows-msvc build), `pi32v2-ld.exe`
  (GNU ld 2.26.51.20160621), `llvm-nm.exe` and `llvm-objcopy.exe` (LLVM 4.0.1), and accepts
  Unix absolute paths as arguments (resolved through the `Z:` drive), so no path shim is
  needed. Option (b) chosen: `tools/linux/build.py` is a faithful Python port of
  `sdk/Build.ps1`; `tools/linux/package.py` ports `sdk/Package.cs`. Build time 12.6 s.
  Every Test-Firmware check passes; outputs in `build/pro/` (log: `build/track-a.log`).
  A second build in the same directory is bit-identical (sdk.elf e697dd67…, .fwsc b5bb4026…).
  The Track A ELF is also byte-identical to the native Linux toolchain build (Track B
  preview), which makes the A/B comparison in Step 5 trivial.
- Step 4 (**done**): official V01 Pro release fetched from open.m-vave.com (metadata,
  `.fwsc`, simulator, official source kit). Building the official source kit tree with
  Track A (`build.py --source-root <kit>`) reproduces the official package
  `SMK37_PRO_OPEN.fwsc` **byte for byte** (SHA-256 09fc9346…, 492084 bytes, build_id
  4c9e0084…). A build of the fork in a second, different directory gives a byte-identical
  `.fwsc` and `app-image.bin`; only the ELF symbol-table strings differ (section 5).
- Step 5 (**done, Checkpoint C**): JieLi Linux toolchain 20260730.1 downloaded, extracted
  and pinned in `tools/linux/toolchain-linux.json` (24 files). Used in place from
  `~/Documents/Classic Tabby/toolchains/` (not `/opt/jieli`, which would need sudo). Track B
  build: 4.0 s, every Test-Firmware check passes, and `sdk.elf`, `app-image.bin` and the
  `.fwsc` are **byte-identical to Track A** (section 5a). Track B is therefore the default
  `make firmware` target; Track A stays as `make firmware-ref` (output in `build/ref/`) and
  `make crosscheck` builds both and compares SHA-256.
- Step 6 (**done**): `tools/linux/build-web.py` ports `tools/Build-Web.ps1`; with the
  pinned Linux WASI SDK 27 (`FM1_WASI_SDK`, SHA-256 below) it builds
  `build/web/simulator.wasm` in 10 s and `build/preview/index.html` (1031406 bytes).
  The wasm is **byte-identical to the official V01 simulator** (b8b4a463…, 315420
  bytes). The preview loads in Google Chrome 156 (headless check: no console errors, the
  loading placeholder is hidden, the simulator generated 149 LCD targets and shows
  "Eight-track overview 01" with status "Browser preview · no device"; also opened in the
  desktop Chrome). `tests/simulator-wasm-smoke.mjs` run by `/usr/bin/node` (v22.23.3)
  boots the same wasm, presses key 12 and sees Note On 60 / Note Off 60 on MIDI channel 1
  on all three ports (section 5b).

### Left to build

- Package equivalence proof (`package.py` vs `sdk/Package.cs` through `pwsh`); deferred:
  PowerShell 7 is not installable from Microsoft's apt repository on Ubuntu 26.04 yet (the
  repo config .deb exists but carries no `powershell` package for this release). See
  "PowerShell without the apt repo" below. The Python packager is validated meanwhile by
  reproducing the official package byte for byte (Step 4), which exercises every code path
  of Package.cs on the real image.
- (nothing; Steps 1-7 complete)

### Left to test

- First flash of the Track B package on the SMK-37 Pro through the workbench (the user
  does this; see section 8 for the device question first).
- **pwsh packaging equivalence** (`make package-equivalence`: `tools/linux/package-pwsh.ps1`
  drives the original sdk/Package.cs via Add-Type on `build/pro/generated/app-image.bin`,
  compared byte for byte with `tools/linux/package.py`). Skipped until PowerShell 7 is
  available on this host.


## 2. Host packages (Ubuntu 26.04.1 LTS "resolute", kernel 7.0.0-42-generic)

| Package | Version | Source | State |
| --- | --- | --- | --- |
| git | 1:2.53.0-1ubuntu1.1 | Ubuntu | installed |
| build-essential | 12.12ubuntu2.26.04.2 (gcc 15.2.0) | Ubuntu | installed |
| python3 | 3.14.3-0ubuntu2 | Ubuntu | installed |
| nodejs (Node LTS) | 22.23.3-1nodesource1 (`/usr/bin/node`, v22.23.3) | nodesource repo (pre-existing) | installed; Homebrew node 25.6.1 shadows it in PATH, so the Makefile calls `/usr/bin/node` explicitly (`NODE=`) |
| powershell | — | Microsoft apt repo | **not available for Ubuntu 26.04** (repo config exists, no package); see below |
| wine64, wine32:i386, libwine | 10.0~repack-12ubuntu1 | Ubuntu | installed; prefix `~/.wine-jieli` |
| innoextract | 1.9-3 (apt); Homebrew 1.9_14 also present and first in PATH | Ubuntu / Homebrew | installed |
| p7zip-full (7zip) | 26.00+dfsg-1 | Ubuntu | installed; not needed (innoextract handles 2.5.3.exe) |
| alsa-utils | 1.2.15.2-1ubuntu1 | Ubuntu | installed |
| google-chrome-stable | 156.0.8078.73-1 | Google apt repo (pre-existing) | installed (not snap) |
| usbutils (lsusb) | 1:019-1 | Ubuntu | installed |

Install everything missing with:

```sh
sudo bash tools/linux/install-host-packages.sh
```

The PowerShell step is optional since script v0.2: a failure prints a warning and the
script continues with Wine and Chrome.

**PowerShell without the apt repo (not done yet).** Microsoft publishes a self-contained
build per release on GitHub: `https://github.com/PowerShell/PowerShell/releases` →
`powershell-<version>-linux-x64.tar.gz` (plus a `.sha256` file to verify). Install is:

```sh
sudo mkdir -p /opt/microsoft/powershell/7
sudo tar -xzf powershell-<version>-linux-x64.tar.gz -C /opt/microsoft/powershell/7
sudo chmod +x /opt/microsoft/powershell/7/pwsh
sudo ln -s /opt/microsoft/powershell/7/pwsh /usr/bin/pwsh
```

It needs only libicu (already present on Ubuntu desktop) and runs Add-Type (Roslyn)
normally, which is all `package-pwsh.ps1` requires. Record the version and SHA-256 here
when it is installed.

## 3. Toolchains and downloads

All archives live outside the repository in `~/Documents/Classic Tabby/toolchains/`.

| Item | URL | SHA-256 | Size |
| --- | --- | --- | --- |
| JieLi Windows toolchain 2.5.3 installer (Inno Setup 5.5.7) | https://jl-update.oss-cn-shenzhen.aliyuncs.com/2.5.3.exe | 399bd518a28e47a7a0394506cebd5bf658748a58cd6b7c02512e24b4b88c5a5e | 52860672 |
| JieLi Linux toolchain 20260730.1 | https://pkgman.jieliapp.com/s/linux-toolchain → jieli-linux-toolchains-20260730.1.tar.xz | a1545cddbc451a06bac43eb5cd96d831470c42a97c5c0b1f98879a20fc7647bd | 26027508 |
| WASI SDK 27 (Linux x86_64) | https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-27/wasi-sdk-27.0-x86_64-linux.tar.gz | b7d4d944c88503e4f21d84af07ac293e3440b1b6210bfd7fe78e0afd92c23bc2 | 124790235 |

Layout after extraction:

- `toolchains/jieli-2.5.3/C$/JL/pi32` — the `pi32` directory with `bin/clang.exe`
  (`innoextract --extract --output-dir toolchains/jieli-2.5.3 2.5.3.exe`). All 22
  `external_toolchain` hashes from `sdk/manifest.json` match. clang.exe, pi32v2-ld.exe,
  llvm-nm.exe, llvm-objcopy.exe and LLVMgold.dll are PE32 (i386), so Wine needs 32-bit
  support.
- `toolchains/jieli-linux/jieli-linux-toolchains-20260730.1` — JieLi documents extracting it
  to `/opt/jieli` so that `/opt/jieli/common/bin/clang` exists. Pinned in
  `tools/linux/toolchain-linux.json` (generated by `tools/linux/pin-toolchain.py`):
  clang 4.0.1 (`common/bin/clang`, c45189ee…), `LLVMgold.so` (2ca8dafd…),
  `pi32v2/bin/ld` = GNU ld 2.26.51.20160621 with elf32-pi32v2 target (fd61aff1…),
  `pi32v2/bin/nm` = GNU nm 2.26.51 (32bee027…), `common/bin/objcopy` = LLVM 4.0.1 objcopy
  (29515122…), plus the 16 clang resource headers. The headers are the Windows ones with
  LF instead of CRLF line endings (identical after stripping `\r`).
- `toolchains/wasi-sdk-27.0-x86_64-linux` — clang 20.1.8-wasi-sdk, `share/wasi-sysroot`.

## 4. Commands

From the repository root (`~/Documents/Classic Tabby/firmware`). The Makefile (v0.1) wraps
the commands below; every path variable can be overridden on the command line
(`make firmware JIELI_LINUX=/opt/jieli`):

```sh
make verify           # manifest / synth.json / toolchain pin checks, both tracks
make firmware         # default: Track B (native) -> build/pro/
make firmware-ref     # Track A (Wine)            -> build/ref/pro/
make crosscheck       # both, then compare SHA-256 of sdk.elf, .fwsc, app-image.bin
make web              # build/web/simulator.wasm + build/preview/index.html (Linux WASI SDK 27)
make web-smoke        # /usr/bin/node tests/simulator-wasm-smoke.mjs build/web/simulator.wasm
make host-smoke       # gcc build of app + simulator sources with FM1_HOST_TEST, runs tests/host/smoke.c
make test             # host-smoke + web-smoke
make flash-budget     # build/pro/flash-budget.md (read only)
make package          # Task 02: firmware + build/official-web/pro/SMK37-Open-Source.html (FM1_SOURCE_URL = archive of TAG)
make hosted           # static site from it with tools/Build-Hosted.cjs -> build/hosted/pro/
make release-assets   # build/release/<TAG>/: .fwsc, offline HTML, SHA256SUMS.txt
make publish          # package + hosted + commit/push the site to gh-pages (HEAD must carry TAG)
make release          # gh release create TAG with docs/releases/<TAG>.md and the release assets
make clean
```

The underlying commands:

```sh
# Input checks only (SDK manifest, synth.json, toolchain pins)
python3 tools/linux/build.py --verify-only --toolchain-kind wine \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-2.5.3/C\$/JL/pi32"

# Track A: reference build, Windows toolchain under Wine (= sdk\Build.ps1 -Model pro -FirmwareOnly)
python3 tools/linux/build.py --model pro --firmware-only --toolchain-kind wine \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-2.5.3/C\$/JL/pi32" \
    --wine-prefix ~/.wine-jieli

# Track B: native Linux toolchain, pinned by tools/linux/toolchain-linux.json
python3 tools/linux/build.py --model pro --firmware-only --toolchain-kind native \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-linux/jieli-linux-toolchains-20260730.1"

# Step 6: web workbench local preview (= tools\Build-Web.ps1 -LocalPreview)
FM1_WASI_SDK="$HOME/Documents/Classic Tabby/toolchains/wasi-sdk-27.0-x86_64-linux" \
    python3 tools/linux/build-web.py --local-preview
google-chrome "file://$PWD/build/preview/index.html"

# Step 4: build another checkout (here: the official source kit, copied to a scratch dir)
# with this script and its own build directory. build.py v0.2.
python3 tools/linux/build.py --model pro --firmware-only --toolchain-kind wine \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-2.5.3/C\$/JL/pi32" \
    --wine-prefix ~/.wine-jieli --source-root /path/to/kit-copy --build-root /path/to/kit-build
```

Outputs: `build/pro/sdk.elf`, `sdk.map`, `firmware-report.json`, `package-report.json`,
`build-identity.json`, `compile_commands.json`, `link-arguments.json`,
`generated/SMK37_PRO_OPEN.fwsc` and `generated/app-image.bin` (raw image kept for the
package equivalence test).

## 5. Official V01 release (for Step 4)

Fetched 2026-11-01 from https://open.m-vave.com/smk37-workbench (static selector page
linking `releases/smk37/V01-fa2b726-07f2269d67d5/`). Saved under
`~/Documents/Classic Tabby/official-release/`.

| Field | Value |
| --- | --- |
| product / release | SMK-37 Pro_8000001 / V01, family 8 |
| build_id | 4c9e008431b7489f4595879e0885bb5cc0faa25b5e2909f7f3e19a0877370977 |
| package sha256 | 09fc934630d9a3565966f533abeda6330abc4b6ed6801d746753383946cbb44b |
| package bytes | 492084 |
| loader (ota.bin) sha256 | ef1f2db89b011fa53e71df363f0122de0ea896618c53fb53e8da676322004541 (matches sdk/tools/pack/ota.bin) |
| stock V16 sha256 / bytes | 2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0 / 705252 |
| simulator wasm sha256 / bytes / source_sha256 | b8b4a463e3149f9ea46e8e460a211e391a9a14c668221903a8f510d3aca98743 / 315420 / 0f8ffc3a51a5b7477914296111f8a90db9be9a9721a1057ef61047a8df8a766a |
| source kit | SMK37-Open-V01-Development-Kit-07f2269d67d5.zip, sha256 07f2269d67d5c4a5b130af72f4b7bc5308aa6fc7d7a75442618364f8107a4c3c |

Checkpoint A result: Track A `.fwsc` is 492084 bytes (same as official), SHA-256
b5bb4026b9c8f501cf97c6f7eea36925bb9220100295cfe06fe34b1d4f294afa, `cmp -l` against the
official package reports 46 differing bytes (the 32-byte `fm1_build_id` plus the CRC /
cipher bytes that depend on it).

### Step 4 result: official package reproduced

The official source kit (zip above, extracted to a scratch copy) built with Track A and
`build.py --source-root` gives:

| Output | Value |
| --- | --- |
| `generated/SMK37_PRO_OPEN.fwsc` | SHA-256 **09fc934630d9a3565966f533abeda6330abc4b6ed6801d746753383946cbb44b**, 492084 bytes — `cmp` against the official package: identical |
| `build-identity.json` | build_id 4c9e0084… (ordinal sort) — identical to the official metadata |
| `sdk.elf` | 6e5edc68e6222d64f6a71433ff20524367367dab981b1f1eeb5ddc9d9eb52c43 (loaded sections identical to the fork's build; only the identity bytes and the symbol-table path strings differ) |

So the whole Linux chain (Wine + JieLi 2.5.3 clang/ld, the Build.ps1 port and the
Package.cs port) is proven against M-VAVE's own release: the bytes they ship are the bytes
this chain produces.

**Why our fork's build_id differs from the official one, and only for that reason.** The
fork keeps the GitHub tree, where `.gitattributes` normalizes all SDK files to LF. The
official kit carries CRLF in `app/fm_factory.c` and `app/fm_library.c`. The build identity
hashes the raw bytes of every file under `app/`, so the fork's identity is
e3344029ab696c7395093fdddc5c3f949bbd47d8b605a78e6f691af664e0d12e instead of 4c9e0084….
The compiled code is identical (the ELF's `.text`, `.ram0_data` and every other loaded
section match byte for byte between the kit build and the fork build); only the 32
`fm1_build_id` bytes in the image and the package CRC/cipher bytes that depend on them
differ (46 bytes of 492084). The fork deliberately keeps LF.

### Step 4 result: determinism in a second directory

A fresh `git clone` of the fork in a different directory
(`/tmp/claude-1000/…/scratchpad/det-clone`) built with the same Track A command:

| Output | Result |
| --- | --- |
| `generated/SMK37_PRO_OPEN.fwsc` | byte-identical (b5bb4026…) |
| `generated/app-image.bin` | byte-identical |
| `build-identity.json`, `package-report.json`, `link-arguments.json` | identical |
| `sdk.elf` | differs only in `.strtab` / `.symtab`: the five `-fno-lto` objects (screen.c, transfer.c, midi_router.c, panel.c, scan.c) carry a `FILE` symbol with the absolute source path; `.text`, `.ram0_data`, `.boot_info`, `.cache_ram_data` and `.shstrtab` are identical |
| `sdk.map`, `compile_commands.json` | differ in paths only (the map also names the random `lto-llvm-xxxxxx.o` temp object) |

Source of the ELF nondeterminism: the compiler is given absolute source paths, exactly as
`sdk/Build.ps1` does on Windows (`C:\…\app\screen.c` in the official build). The
flashed image does not contain them. This is accepted as-is; the deterministic artefact is
the package, and `firmware-report.json` reports the ELF hash for information only.

Build identity finding: the identity is SHA-256 over `pro`, the manifest hash, and
`path:sha256` of every file under `app/` (sorted). From the GitHub checkout it comes out as
e3344029ab696c7395093fdddc5c3f949bbd47d8b605a78e6f691af664e0d12e, which does not match.
From the official source kit it comes out as 4c9e0084… — an exact match, with ordinal sort
order. The kit differs from GitHub only in line endings: `app/fm_factory.c` and
`app/fm_library.c` (and several web/third_party files) carry CRLF in the kit and LF in git
(`.gitattributes` normalizes to LF). The compiled code is unaffected; only the 32
`fm1_build_id` bytes in the image (and the package CRCs) differ. A byte-identical
reproduction of the official package therefore needs the kit's CRLF versions of those two
files; the GitHub tree gives the same machine code with a different identity.

### 5a. Checkpoint C: Track B toolchain and the A/B comparison

JieLi Linux toolchain `jieli-linux-toolchains-20260730.1` (archive SHA-256 a1545cdd…):

| Tool | Path in the archive | Version |
| --- | --- | --- |
| clang | `common/bin/clang` (symlinked from `pi32v2/bin/clang`) | clang 4.0.1, host x86_64-linux; accepts `-target pi32v2 -mcpu=r3` (same PI32v2 clang 4.0.1 r3 target as the Windows 2.5.3 build) |
| ld | `pi32v2/bin/ld` | GNU ld 2.26.51.20160621, targets elf32-pi32v2 / elf32-pi32v2fdpic (= pi32v2-ld.exe) |
| LTO plugin | `common/bin/LLVMgold.so` | LLVM 4.0.1 gold plugin (= LLVMgold.dll) |
| nm | `pi32v2/bin/nm` | GNU nm 2.26.51 (Track A uses llvm-nm 4.0.1; same symbol output for the checks) |
| objcopy | `common/bin/objcopy` | LLVM objcopy 4.0.1 (= llvm-objcopy.exe) |

File limit: JieLi's README asks for `ulimit -n 8192` or more for linking; build.py raises
`RLIMIT_NOFILE` itself for native builds (the host default here is 524288 anyway).

Comparison, same source, same flags (`make crosscheck`):

| Output | Track A (Wine, reference) | Track B (native) |
| --- | --- | --- |
| `sdk.elf` | e697dd67a0e1bac86bc2256675bfe7c184f1a30853dd75a2c8fb8f8e07b6f697 | identical |
| `generated/SMK37_PRO_OPEN.fwsc` | b5bb4026b9c8f501cf97c6f7eea36925bb9220100295cfe06fe34b1d4f294afa | identical |
| `generated/app-image.bin` | 5a1a46825af608e352f30bd8ddba9c2c3d3bb09f3ef463d95fbbb44261af7301 | identical |
| section sizes / symbol placement / Test-Firmware | .text 377920, .ram0_data 75940, .ram0_bss 191356, .boot_info 52, .cache_ram_data 32; all checks pass | identical (same ELF) |
| build time | 12.6 s | 4.0 s |

The two toolchains are the same LLVM 4.0.1 / binutils 2.26.51 sources built for Windows
and Linux, so byte identity is plausible and was confirmed. Track B is the default
`make firmware`; Track A remains the reference and `make crosscheck` re-verifies identity
after any change to the build script or toolchain pins.

### 5b. Step 6: web workbench preview and the official simulator

| Output | Value |
| --- | --- |
| `build/web/simulator.wasm` | SHA-256 **b8b4a463e3149f9ea46e8e460a211e391a9a14c668221903a8f510d3aca98743**, 315420 bytes: identical to the official V01 simulator (`official-metadata.json` and the extracted `simulator-official.wasm`) |
| simulator `source_sha256` (fork, LF) | 78bda82981a96b36bb5de10a2c4febe6ffc5308e21fa827ebf10fef8e7589d9a |
| simulator `source_sha256` (official kit) | 0f8ffc3a51a5b7477914296111f8a90db9be9a9721a1057ef61047a8df8a766a — reproduced from the kit tree; the difference to the fork is CRLF in 10 of the 84 hashed inputs (`app/fm_factory.c`, `app/fm_library.c`, `third_party/synth/pluck.c`, `third_party/synth/voices.h`, `web/engine/sound.c`, `web/synth/adsr.c`, …), the same cause as the firmware build_id |
| `build/preview/index.html` | 1031406 bytes; source link replaced by "(local preview)" as upstream does |
| Chrome 156 headless (`--dump-dom`, 8 s virtual time) | no console errors; `#sim-placeholder` hidden; 149 `.lcd-target` elements generated by the simulator; `.sim-details` = "Eight-track overview 01"; `.device-status` = "Browser preview · no device" |
| Node 22.23.3 (`/usr/bin/node`) smoke | `_initialize`, `sim_boot(1)`, key 12 pressed: Note On 60 velocity 100 on channel 1, ports 0-2; release: Note Off 60; render output finite |

The Linux WASI SDK produces the same wasm as the Windows one (both clang 20.1.8-wasi-sdk
with the same sysroot), so the browser workbench is reproducible on Linux byte for byte.
Node is not needed to build the preview; upstream uses it only in `tools/Build-Hosted.cjs`
(static-site packaging of a distribution build, not part of Task 01).

### 5c. Step 7: host tests

`make host-smoke` compiles exactly the simulator's source set (every `.c` under `app/`,
`web/` and `third_party/synth/` except `app/board/`, with `-DFM1_HOST_TEST -DFM1_OPEN_WEB`
and the same include order as Build-Web.ps1 L82) with the host compiler (`CC`, default
gcc; clang works when installed) and links `tests/host/smoke.c` against it. `-Werror` is
not used in the host build because gcc rejects clang's `minsize` attribute and warns about
indentation in third_party; both are warnings only and the wasm build keeps `-Werror`.

The harness drives `web/engine/Simulator.c`'s `sim_*` entry points, the same ones the
browser calls, so the app code under test (`smk37_controls.c`, `midi_router.c`,
`project.c`, `screen.c`, …) runs unchanged. Checks (21, all pass):

| Area | Check |
| --- | --- |
| builds | 33 units + harness compile and link natively (7 s) |
| initializes | `sim_boot(1)`; panel snapshot readable; 128-frame blocks; LCD target table; keyboard track 0 on channel 1; destinations = ports 0-2; KEY OUT on |
| keyboard note | key 12 velocity 100 → `90 3C 64` on ports 0, 1, 2; nothing on another channel; release → `80 3C 00` |
| expected channel | `sim_midi_edit(0, 1, +2)` moves track 0 to channel 3; the firmware first sends its controller reset on channel 1 (`B0 78 00` all sound off, sustain/mod/bend/pressure neutral, stop); then key 12 → `92 3C 64` / `82 3C 00` |
| audio | one rendered block, all values finite |

Finding worth knowing for Phase 1: a MIDI settings change resets the previous channel
and releases held notes on the next 10 ms poll. The test waits for that, as a player would.

## 6. Flash / RAM baseline (Track A and Track B, identical)

From `build/pro/firmware-report.json` and `package-report.json` of the Track A build
(identical to the native-toolchain build):

| Quantity | Value |
| --- | --- |
| app image (.text 377920 + .ram0_data 75940 + .cache_ram_data 32) | 453892 bytes |
| hard app limit from Package.cs (0xff000 − USER − BTIF − min VM − area − header − cfg − 64) | 453921 bytes (margin 29 bytes) |
| FLASH_BIN_SIZE / VM_START | 471040 (0x73000) |
| VM region | 471040–503808 = 32768 bytes (exactly the 32768 minimum; vm_extra_gap 0) |
| BTIF | 503808–507904 (4096) |
| USER region | 507904–1044480 (536576 bytes, untouched by the package) |
| runtime heap (_MALLOC_SIZE) | 256268 bytes (minimum 49152) |
| internal SRAM 0x01c00000–0x01c80000 | sections 267348 bytes (.ram0_data 75940 + .ram0_bss 191356 + .boot_info 52); heap 256268 bytes follows the bss up to _HEAP_END; 524288 − 267348 = 256940 bytes not statically allocated, of which the heap takes 256268 |

The V01 image sits at the very top of the flash layout: one more 4 KiB page of code would
fail `Insufficient FM1 settings space` in Package.cs. This is the single most important
constraint for Phase 1 work. The per-input breakdown, savings estimates and the USER-region
layout are in [FLASH-BUDGET.md](FLASH-BUDGET.md) (generated tables:
`tools/linux/flash-budget.py`).

## 8. Hardware readiness (Step 8, read only, 2026-11-01)

Commands run: `lsusb`, `amidi -l`, `aconnect -l`, `cat /proc/asound/cards`, and reads of
`/sys/bus/usb/devices/1-1/*`. No MIDI message (not even an identity request) was sent, and
nothing was written to any device.

| Item | Result |
| --- | --- |
| USB devices (besides hubs) | 046d:c52b Logitech Unifying Receiver; 2321:0022 iConnectivity AUDIO4c; 8087:0a2b Intel Bluetooth; **1209:0001 "Generic pid.codes Test PID"** (bus 1, device 37, full speed, bus-powered 100 mA) |
| 1209:0001 descriptors | manufacturer "Orange Cat", product **"Orange Cat FM-1"**, no serial, bcdDevice 3.30, 5 interfaces: Audio Control, MIDI Streaming, Audio Control, 2 × Audio Streaming; all bound to `snd-usb-audio` |
| ALSA card | card 1 `FM1` "Orange Cat FM-1" (USB-Audio); `amidi -l`: `hw:1,0,0` "Orange Cat FM-1 MIDI 1" (IO); `aconnect -l`: client 20 "Orange Cat FM-1", port 0 |
| other MIDI | AUDIO4c client 24 with DIN, USB2, HST1-8 ports; PipeWire sequencer clients 142/143 |
| device permissions | `/dev/snd/seq` and `/dev/snd/midiC1D0` are `root:audio 0660` with a logind ACL `user:userzero:rw-` (seat session), so Chrome can open them without group membership changes; `/dev/bus/usb/001/037` is `root:root 0664` (not needed) |
| udev rule | **not needed.** The workbench uses WebMIDI (`navigator.requestMIDIAccess({sysex:true})` in `sdk/Update.html.in`), which Chrome on Linux serves through the ALSA sequencer, not WebUSB/WebHID. Chrome will show its own per-site SysEx permission prompt. Nothing was added under `/etc/udev/rules.d/` |
| firmware version | **not visible from descriptors as an M-VAVE version.** The only candidate device identifies itself as "Orange Cat FM-1" with USB VID/PID 1209:0001 (pid.codes test ID) and bcdDevice 3.30. The stock V16 and the Open V01 images carry the strings "M-VAVE" and "SMK-37 Pro_8000001" (found in `build/pro/generated/app-image.bin`); no such strings exist in the enumerated device. Either the SMK-37 Pro currently runs the Orange Cat firmware (the user's other project), or the plugged-in unit is the Orange Cat FM-1 and the SMK-37 Pro is not connected. Reading the version through the workbench would require sending SysEx to the device, which Step 8 forbids, so this is left as an open question for the user |

## 7. Windows-specific items found in the upstream build and how they are handled

| Item | Where | Handling |
| --- | --- | --- |
| PowerShell 5.1 host (`powershell` in build.bat) | build.bat, sdk/Build.ps1, tools/Build-Web.ps1 | Build.ps1 ported to `tools/linux/build.py` (including `-Package` since v0.3); Build-Web.ps1 ported to `tools/linux/build-web.py`; top-level Makefile replaces build.bat |
| `/opt/jieli` install location and `ulimit -n` | JieLi Linux toolchain README | used in place from the toolchains folder (`--toolchain`), RLIMIT_NOFILE raised by build.py |
| C# packager loaded with Add-Type | sdk/Package.cs | Ported to `tools/linux/package.py`; `tools/linux/package-pwsh.ps1` runs the original under pwsh for the equivalence test |
| `.exe` tool names and `LLVMgold.dll` plugin | Build.ps1 L36, L241, L307, L422, L436 | Track A keeps the names and runs them through Wine; Track B maps them in toolchain-linux.json |
| `StartsWith($sdk + '\')` manifest path check | Build.ps1 L342 | `os.sep` prefix check |
| `StartsWith($root + '\build\')` object directory guard | Build.ps1 L364 | `os.sep` prefix check, honouring `--build-root` |
| `app/synth` exclusion with `'\'` suffix | Build.ps1 L357 | `os.sep` prefix check |
| `Sort-Object FullName` (culture-sensitive) | Build.ps1 L357, L401 | ordinal sort; proven correct by reproducing the official build_id (`--identity-sort culture` kept for reference) |
| 22 Windows toolchain hashes | sdk/manifest.json, sdk/synth.json | Track A: enforced unchanged. Track B: replaced by `tools/linux/toolchain-linux.json`; every SDK file check and every synth.json check except the installed-compiler hash remains |
| `curl.exe`, `tar.exe`, Windows WASI SDK (`wasi-sdk-27.0-x86_64-windows.tar.gz`, `bin/clang.exe`) | Build-Web.ps1 L42-L62 | `tools/linux/build-web.py`: Linux archive pinned (b7d4d944…), `curl` / `tar` from the Ubuntu archive, `bin/clang`; set `FM1_WASI_SDK` to skip the download |
| .NET `LastWriteTimeUtc.Ticks` in the wasm cache stamp; `\\?\` long-path prefix | Build-Web.ps1 L64-L68 | size + mtime_ns stamp; no prefix needed |
| `[Net.WebUtility]::HtmlEncode` | Build-Web.ps1 L128, L141 | re-implemented with the same rules in build-web.py |
| `tools/Build-Hosted.cjs` run by Node | hosting step (HOSTING.md) | unchanged; run by `tools/linux/publish-pages.py` with `/usr/bin/node` v22.23.3 (section 9) |
| `ConvertTo-Json -Depth 4 -Compress` package metadata passed as a command-line argument | Build.ps1 L454-L458 | build.py writes the same compact JSON, same key order, to `build/<model>/web-package.json` and passes the path (1.6 MB of base64 would exceed a safe argv) |
| CRLF in the official kit's app files | official source zip | Documented in section 5; the fork keeps LF and therefore a different build_id; no change to app/ |
| Absolute source paths in the ELF symbol table | Build.ps1 L360-L370 (compile command) | Same behaviour on Linux; package unaffected (section 5, determinism) |

## 9. Publication (Task 02, 2026-11-02)

### 9.1 What is published

| Item | Where | Value |
| --- | --- | --- |
| Repository | https://github.com/SeattleUser0/classic-tabby (public) | branch `classic-tabby/linux-build`, tags `upstream-v01` (= b2d6bcb, M-VAVE's V01) and `tabby-v01.0`; remote `upstream` stays m-vave/smk37_open |
| Source archive (GPL offer) | https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v01.0.zip | the tree of the tagged commit; embedded in the workbench as the "Source and SDK" link |
| Firmware package | `build/pro/generated/SMK37_PRO_OPEN.fwsc` | SHA-256 b5bb4026b9c8f501cf97c6f7eea36925bb9220100295cfe06fe34b1d4f294afa, 492084 bytes, build_id e3344029ab696c7395093fdddc5c3f949bbd47d8b605a78e6f691af664e0d12e (same as Task 01) |
| Offline workbench | `build/official-web/pro/SMK37-Open-Source.html` | SHA-256 462de137213a338662bc1ef77a1c89e4eaee6350bbc050b7daf5f0ffcaa7ff36, 2628842 bytes; embeds the firmware above and the stock `SMK37-Pro-V16.fwsc` (2d98ce72…, 705252 bytes, loader ef1f2db8…); simulator b8b4a463… (official) |
| Static site | `build/hosted/pro/` → branch `gh-pages` → https://seattleuser0.github.io/classic-tabby/ | `index.html` = `smk37-workbench.html` (291993 bytes), 9 assets under `assets/smk37/` named by SHA-256 (3 scripts with SRI, firmware .bin, stock .bin, simulator .wasm), `SMK37-Open-Source.html` as the offline download, `assets.json`, `.nojekyll`; initial load 928312 bytes |
| GitHub release | https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v01.0 | `SMK37_PRO_OPEN.fwsc`, `SMK37-Open-Source.html`, `SHA256SUMS.txt`; notes in `docs/releases/tabby-v01.0.md` |

The package build is deterministic in the same way as the firmware: the HTML embeds only
the source URL, the compact package JSON, the simulator and the notice files, none of which
depend on the commit id, so a rebuild from the tagged commit gives the same SHA-256.

### 9.2 Procedure for a new version (`make publish`)

1. Commit everything. Tag the commit that will be built: `git tag -a tabby-v01.1 -m ...`
   and push the tag first (`git push origin tabby-v01.1`), so the archive URL exists.
2. `make publish TAG=tabby-v01.1`. This runs, in order:
   - `make package`: `build.py --package` (v0.3) compiles with Track B, packages the `.fwsc`,
     checks the stock V16 image against its pinned SHA-256, writes
     `build/pro/web-package.json` (the exact `const FM1_PACKAGE` text, same key order as
     Build.ps1's `ConvertTo-Json -Compress`), runs `build-web.py --package-json` with
     `FM1_SOURCE_URL = https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/<TAG>.zip`,
     and writes `build/pro/web-package-report.json`. Build.ps1 L282-L288 and L439-L463.
   - `make hosted`: `publish-pages.py` checks the page's source link, runs
     `tools/Build-Hosted.cjs` into a fresh `build/hosted/pro/` and adds `.nojekyll`.
   - `publish-pages.py --tag <TAG> --push`: refuses unless HEAD carries the tag, the tree is
     clean and the tag is on origin with the same id; then checks out `gh-pages` in the
     worktree `build/gh-pages/` (created as an orphan branch the first time), replaces the
     site, commits ("Pages: <TAG> (build …)") and pushes with `gh auth git-credential` as a
     one-command credential helper (no global git config is changed). Without a git
     identity configured, the author of HEAD is used.
3. `make release TAG=tabby-v01.1` after writing `docs/releases/tabby-v01.1.md`: gathers
   `build/release/<TAG>/` (`.fwsc`, offline HTML, `SHA256SUMS.txt`) and runs
   `gh release create --verify-tag`.
4. GitHub Pages serves the `gh-pages` branch root (enabled once with
   `gh api -X POST repos/SeattleUser0/classic-tabby/pages -f build_type=legacy -f source[branch]=gh-pages -f source[path]=/`).
   Nothing is built on GitHub; the toolchains stay local.

Only the Pro model is published, at the site root. An Elite site would go in a
subdirectory (`--site-dir elite`), as HOSTING.md asks for separate directories.

### 9.3 Checks made before publishing

- Repository content: every path ever committed is under app/, docs/, sdk/, tests/,
  third_party/, tools/, web/ or the top-level files; no toolchains/, official-release/ or
  build/ entry in any commit (`git log --all --name-only`); every blob in the history
  scanned for token/key patterns (GitHub, AWS, Slack, PEM) and secret-looking file names:
  none.
- Static site in headless Chrome 156 from a local HTTP server: no console errors, the
  simulator placeholder hidden, scripts and wasm fetched from `assets/smk37/`, source link
  `https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v01.0.zip`.
- `file://` opening of `index.html` redirects to the offline `SMK37-Open-Source.html`
  (Build-Hosted.cjs entry loader), as HOSTING.md describes.

### 9.3a Verification after publishing (2026-11-02)

- Pushed: `classic-tabby/linux-build` = ff723d2, tags `upstream-v01` (b2d6bcb) and
  `tabby-v01.0` (annotated, → ff723d2), `gh-pages` = 43f4c2b. GitHub enabled Pages by
  itself on the first gh-pages push (legacy build, branch root); the first build took 54 s.
- The archive https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v01.0.zip
  (302 → codeload.github.com, `classic-tabby-tabby-v01.0.zip`, 2606964 bytes, SHA-256
  45c0cd15…) unpacks to 179 files whose SHA-256 all equal `git archive tabby-v01.0`. The
  same URL fetched through the live page's source link gives the same bytes. GitHub does
  not promise archive bytes stay stable forever, so the release carries no hash of the zip.
- Live site https://seattleuser0.github.io/classic-tabby/: `index.html` byte-identical to
  `build/hosted/pro/index.html`; scripts served as `application/javascript`, the simulator
  as `application/wasm`, the two firmware images as `application/octet-stream`, the offline
  HTML as `text/html` (2628842 bytes). Headless Chrome 156: no console errors, placeholder
  hidden, 149 LCD targets, "Eight-track overview", status "Firmware loads when Device
  Update is opened" (the firmware details in 9.4 are filled when that tab is opened).
- Release https://github.com/SeattleUser0/classic-tabby/releases/tag/tabby-v01.0: the
  three assets downloaded back and `sha256sum -c SHA256SUMS.txt` passes.
- This commit is a documentation follow-up on the branch; the tag stays on ff723d2, the
  commit the firmware was built from. app/, sdk/, web/ and third_party/ are unchanged.

### 9.4 What the install screen shows for the SMK-37 Pro

Device update tab, before connecting: Firmware **SMK37 Pro Open**, Version **V01**,
Firmware details: size **480.6 KiB**, build number **e3344029ab696c73** (the full build_id
is the tooltip). After "Connect device" the identity line shows the device's own name:
`SMK-37 Pro_016` for factory V16 (status "Device and current firmware recognized. To
migrate, click Enable force flash and reconnect."), or `SMK-37 Pro_8000001` for an
installed Open V01 (status "SMK37 OPEN connected. Ready to update", or "This version is
already installed" when the device reports the same build_id). An `Orange Cat FM-1` or any
other identity is not the target device.

## 10. Task 03 — song mode, checkpoint (a) (2026-11-02)

### 10.1 What changed

Firmware (app/, the first functional change to the fork):

- `app/samples.c` v0.1: the V01 sample bank code is gone. The binary SDK still imports
  `groove_samples_init` / `groove_samples_poll`; they now start and drive the song-region
  scan. `groove_samples_status` always returns 0.
- `app/song_storage.c` / `.h` v0.1: region constants (USER 69632, 113 sectors, up to the
  tuning sector), boot scan (first 32 bytes of each sector, four per control poll),
  classification (FM1G / FM1B / FM1Q song magics, erased, or old data such as the V01
  `FM1S` bank and `FMB1` DX7 banks), and the user-confirmed erase of only the old sectors.
  Nothing below 69632 and nothing at or above 532480 is touched.
- `app/fm_library.c` v0.1 and `app/fm_patch.h`: library banks, staging recovery and the
  sample-bank conflict check removed; `groove_fm_program` serves the factory bank only;
  `groove_fm_library_init` stays as an SDK entry point (no-op).
- `app/transfer.c`: commands 11-16 and transfer kind 4 removed; command 22 reports 0 DX7
  library banks (unavailable) and a sample limit of 0; the "sample transfer in progress"
  session checks are gone. Command 21 is unchanged (the workbench checks its exact bytes).
- `app/project.c`: projects, imports and factory scenes with a GROOVE_SAMPLE track are
  converted to the 808 default kit (volume and sends kept, step masks kept) before they
  are applied; the SDK's power-on sampler track is moved to the 808 on the first poll;
  the DX7 library staging recovery call is gone. The legacy `tuning_blocked()` check stays
  as protection for the tuning sector until the old bank is erased.
- `app/presets.c`: the seven factory scenes that used the sampler play their beat on the
  808; `groove_preset_drum_default()` added for project.c.
- `app/screen.c`: the sampler is not offered on the SOURCE page (`SOURCE_CHOICES`), its
  knob map, pad hints and labels are gone; new ACTIONS entry 21 "ERASE OLD SAMPLE/DX7"
  (destructive, SAVE to confirm, "ERASE OLD FLASH DATA?"); a one-time notice "OLD
  SAMPLE/DX7 DATA - SEE ACTIONS TO ERASE" at boot when the scan finds old data.
- `app/smk37_controls.c`: the sampler slot keys are gone; every track plays pitches.
- `web/engine/Simulator.c`: sim_factory*, sim_sample_* and sim_library_* exports removed;
  `sim_song_storage_state` / `sim_song_storage_initialize` added; the cleared simulator
  flash no longer carries a factory sample bank.

Workbench (sdk/, pinned files re-hashed with `tools/linux/pin-sdk-files.py`):

- `sdk/WebUpdate.js`: the capability check accepts 0 DX7 banks and a sample limit of 0
  (`sampleCapacity` follows the reply; `bankAvailable` needs 4 banks).
- `sdk/Update.html.in`: the "8-slot sample bank" and "128 DX7 standalone voices" sections,
  the simulator's standalone-library controls, the post-update sample check button and
  the sample manual chapter are removed; the post-update check reports the firmware as
  ready without touching samples.
- `sdk/Simulator.js`: worker cases samples / library-read / library-load / library-write
  and the library UI handlers removed.
- `sdk/Samples.js`: reduced to two globals the shared code still references.
- `sdk/manifest.json`: hashes of those four files updated. Every other entry, including
  the binary SDK files, is unchanged; `make verify` still enforces all 67.

### 10.2 Measured

| Quantity | V01 | After (a) |
| --- | ---: | ---: |
| App image (limit 453921) | 453892 | **450820** (margin 3101) |
| Static SRAM | 267348 | 266676 |
| Runtime heap (min 49152) | 256268 | 256940 |

Track A and Track B stay byte-identical (`make crosscheck`: sdk.elf 44adf5d3…, .fwsc
d9e0c577…). `make test`: 35 host checks (migration scan, detection of planted FM1S/FMB1
sectors, confirmed erase of exactly those sectors, staging and tuning sectors untouched,
factory scene 0 loads with no sampler track) and the wasm smoke test all pass. The web
preview rebuilt with the edited workbench loads in headless Chrome 156 with no console
errors and the simulator running. Details in docs/FLASH-BUDGET.md section 5.

### 10.3 Before flashing a V01 device with this firmware

Back up the sample bank (`.fm1s`) and the four DX7 library banks (`.syx`) with the V01
workbench first. On the first boot the screen shows "OLD SAMPLE/DX7 DATA - SEE ACTIONS TO
ERASE"; song mode (checkpoint d) stays disabled until ACTIONS → "ERASE OLD SAMPLE/DX7" →
SAVE is confirmed. Projects, settings and tuning are untouched either way. The workbench's
"Restore factory V16" writes the factory resources back over 0xF4000-0xFDFFF of the
device, which is inside the song region; that warning is added with checkpoint (d).

## 11. Task 03 — song mode, checkpoint (b) (2026-11-02)

### 11.1 What changed

Firmware, `app/screen.c` only (no data layout, no project format, no flash write changed):

- The DX7 operator editor pages FM_EDIT / FM_ENV / FM_LFO and the per-engine tone editor
  TONE_EDIT are gone: `fm_draw`, `tone_draw`, `track_lfo_draw`, `fm_control`,
  `tone_control`, the algorithm diagram, the `fm_pages` parameter table, the EDIT black-key
  map, the operator / tone / LFO page state and the hold-EDIT (600 ms) gesture.
- The page numbers stay in the enum so the workbench simulator's page ids do not shift;
  `groove_screen_open` rejects the four removed targets (the workbench shows its existing
  "not supported for this source" message) and `groove_screen_snapshot` reports operator
  and FM page as 0.
- Buttons: EDIT on a DX7 track toggles FM_QUICK (voice / bank select, ALGORITHM, FEEDBACK,
  TRANSPOSE, LEVEL) as before; EDIT on any other source, SCL, ENV and LFO show
  "VOICE EDIT MOVED TO WORKBENCH". EDIT+REC (DX7 patch name), SEQ+EDIT (ACTIONS) and the
  other chords are unchanged. The shift-shortcut strip no longer lists ENV / LFO.
- The selected drum part per track is still remembered for STEPS editing (`drum_parts`).
- Kept: on-device DX7 preset select and the existing macros (FM_QUICK), the NAME page,
  PROJECT / PRESET_BROWSER, EFFECTS, MIX, BLE, STEPS, ARP_EDIT, SOURCE, ACTIONS.

Workbench (`sdk/`, re-pinned with `tools/linux/pin-sdk-files.py`):

- `sdk/Update.html.in`: the simulator shortcut buttons for the envelope, LFO and full
  voice editor pages (page ids 3, 4, 2) are removed.
- `sdk/Simulator.js`: the page tips and PRESETS-knob hints for pages 2-5 are removed; the
  FM quick-page tip no longer mentions the hold-EDIT editor.
- `sdk/manifest.json`: those two hashes updated; all 67 entries still enforced.

Not changed: the SDK's DX7 voice editing API (`groove_fm_edit` etc.) is still linked and
used by the FM_QUICK knobs and the workbench import paths; the web workbench's own DX7
editor is unaffected.

### 11.2 Measured

| Quantity | After (a) | After (b) |
| --- | ---: | ---: |
| App image (limit 453921) | 450820 | **439812** (margin 14109) |
| Static SRAM | 266676 | 266356 |
| Runtime heap (min 49152) | 256940 | 257260 |

Track A and Track B stay byte-identical (`make crosscheck`: sdk.elf 7ffed3da…, .fwsc
c3cc41ac…). `make test`: the 35 host checks and the wasm smoke test pass unchanged; the
host build compiles app/screen.c with no warnings. The rebuilt preview (`make web`) loads
in headless Chrome 156 with no console errors, the placeholder hidden and 149 LCD targets.
Details and the post-song-mode headroom projection in docs/FLASH-BUDGET.md section 6.

## 12. Task 03 — song mode, checkpoint (d) (2026-11-02)

### 12.1 What changed

Firmware (formats: docs/tasks/TASK-03-step1-assessment.md section 9 v0.4, binding):

- `app/song_storage.c` / `.h` v0.2: song records (one sector per song, CRC over bytes
  20..2623), block sectors (packed records, 6-byte header with a 16-bit id), the staging
  transactions of 9.6 with recovery at boot and before every write, the sorted per-song
  directory (2048 entries), free / reclaimable accounting, compaction of one sector or of
  the whole region (poll driven, one sector per poll). Payloads and records are validated
  before any flash write.
- `app/song.c` / `.h` v0.1: the sequencer. Two RAM row buffers (8 × 64 × 13 bytes); the
  control task decodes the next row (natural next, loop row, or the queued jump target)
  while the current one plays; the audio tick runs from `groove_midi_clock` once per
  block, counts 16ths from the tempo (or the song's BPM override), applies swing,
  probability, legato / retrigger and note lengths, swaps rows at row ends, lands jumps at
  the next bar (mode 0) or row end (mode 1), replays a row if the next one is not decoded
  in time (counted as an underrun), stops at the end of the last row unless the song loops.
- `app/midi_router.c`: song owners 40..47 (`OWNERS` 48), `groove_midi_song_note` (SEQ
  mode rules as for pattern notes; the local engine copy is posted on the track's input
  channel when the lane drains), `groove_midi_song_channels` (per-track override, notes
  released on the old channel first), channel resolved at delivery from the owner, the
  song tick hooked at the top of the clock callback.
- `app/transfer.c`: kinds 5 (song record, 4096) and 6 (block, target song << 16 | id,
  begin commands `[6, song, id lo, id hi]` / `[6, song, id lo, id hi, size lo, size hi]`),
  command 23 (free, reclaimable, state, loaded song, playing, row, error), capability bit
  2 set in command 22. An uploaded record whose magic is not `FM1G` deletes the song.
- `app/screen.c`: page 19 SONG (ACTIONS entry 21 "SONG MODE", web shortcut 19): song
  select on K1 / PRESETS, row / repeat / bar readout, block id per track, queued jump,
  storage state, errors; pads 1-16 queue jumps (OCT pages the pads), K4 jump mode, PLAY
  starts / stops the song (PLAY anywhere stops a playing song, starting a song stops the
  stock transport); ACTIONS entry 22 "COMPACT SONG STORAGE".
- `app/samples.c` v0.2: initializes and polls the sequencer from the SDK entry points.
- `web/engine/Simulator.c`: `sim_song_*` / `sim_block_*` exports (records, blocks,
  status, compaction, load / play / stop / jump) for the tests and the simulator target.
- `tools/linux/flash-budget.py` v0.2: the two new units in the attribution lists.

Workbench (`sdk/`, re-pinned; all 67 manifest entries still enforced):

- `sdk/WebUpdate.js`: `songRecordParse` / `songRecordBuild` (v0.4 layout, CRC),
  `songPayloadParse` / `songPayloadBuild`, step text syntax, `.tabby` writer / reader,
  `Library.songStatus / downloadBlock / uploadBlock / songRead / songWrite / songDelete`,
  kind 5 in `download` / `upload`, capability bit 2 → `songStorage`, error 74 text.
- `sdk/Update.html.in`: library group "Song mode" (target device or browser simulator,
  song slot, read / new / write / delete / export / import / status, header fields,
  channels, rows table, block step editor), the factory-V16 confirmation now warns that
  the restore overwrites the last 40 KB of song storage (block sectors 86..95), simulator
  shortcut button for page 19.
- `sdk/Simulator.js`: worker cases song-read / song-write / song-delete / song-status,
  `FM1Simulator.request` for the editor, page tip 19.
- `sdk/I18n.js`: English strings for the song section.

### 12.2 Measured

| Quantity | After (b) | After (d) |
| --- | ---: | ---: |
| App image (limit 453921) | 439812 | **449572** (margin 4349) |
| Static SRAM | 266356 | 300340 |
| Runtime heap (min 49152) | 257260 | 223276 |

Track A and Track B byte-identical (`make crosscheck`, hashes in docs/FLASH-BUDGET.md
section 7). `make test`: 70 host checks (35 from Task 01 / checkpoint a plus 35 for song
storage and playback) and the wasm smoke test pass; no compiler warnings. The rebuilt
preview (`make web`) loads in headless Chrome 156 with no console errors, the placeholder
hidden, 149 LCD targets and the page-19 shortcut present.

### 12.3 Using song mode

1. Workbench → Projects & sounds → Song mode: choose the device (project library
   connected) or the browser simulator, pick a song slot, "New song" or "Import .tabby",
   fill the rows (block id per track, repeat, steps, loop here), store blocks (step text
   `pitch:velocity:length[r]`, `@n` probability, `!` alt tuning), "Write song".
2. Device: ACTIONS → SONG MODE, K1 selects the song, PLAY starts; pads 1-16 queue a jump to
   that row (OCT pages rows 17..128), PLAY stops. The song's output channels apply while it
   plays and the device channels return afterwards.
3. "COMPACT SONG STORAGE" (ACTIONS) reclaims stale block copies after rewrites.

## 13. Task 03 — song mode, checkpoint (e): batched block upload (2026-11-02)

### 13.1 What changed

Formats: docs/tasks/TASK-03-step1-assessment.md section 9 **v0.5** (96c9058, doc commit on
its own): transfer kind 7, the batch journal, the pending marker, capability bit 3, the
record-first upload order. Block, row, song record and `.tabby` layouts unchanged.

- `app/song_storage.c` / `.h` v0.3: `song_block_batch(song, stream, bytes)`. The stream
  (block records as in the `.tabby` file, up to 32768 bytes) is validated in full, packed
  in order into whole block sectors (a record never splits; at most 10 sectors), the
  sectors are chosen among the free ones (erased, or holding no live record; lowest
  first), each is erased once and programmed with header byte 5 = 0xFF ("pending"), then
  the journal (`FM1Q`: version, sector count, song, first generation, CRC, sector list)
  goes into the staging sector with the commit word, and byte 5 of every batch sector is
  programmed to 0 (a one-byte 1→0 write). `song_storage_prepare` finishes a committed
  journal and erases pending sectors nobody committed, at boot and before every write;
  the boot scan marks pending sectors and keeps them invisible. A failed batch leaves its
  sectors marked pending in the cache and the next prepare erases them (no separate
  cleanup path). Compacting a sector with no live record is now a plain erase.
- `app/transfer.c`: kind 7 in `transfer_begin` (upload only, target = song, size 70..32768),
  the finish calls `song_block_batch` (all or nothing), capability reply out[8] = 15.
- `web/engine/Simulator.c`: `sim_batch_buffer` (32 KB) and `sim_block_batch`.
- `tests/host/smoke.c` v0.4: section 8 (39 checks): a 10 × 832-byte batch packs into
  three sectors and reads back, free space falls by exactly the stream, a second batch
  supersedes a block and may omit its final padding, bad streams store nothing, a power
  cut before the commit (planted pending sector, reboot) erases the pending sector and
  keeps everything else, a power cut after the commit (planted pending sector + committed
  journal, reboot) finalizes it and the block is live, a song plays from batch blocks,
  compaction after a delete erases every garbage-only sector.
- `sdk/WebUpdate.js`: `Library.uploadBatch`, `songBatches` (records cut at the device's
  packing boundaries, 8 sectors = at most 32608 bytes per batch), `songWrite` = record,
  batches (or kind 6 one by one on firmware without bit 3), read-back check;
  `this.songBatch` from capability bit 3. `sdk/Simulator.js`: the simulator target writes
  the record first and uses `sim_block_batch` with the same cutting rule.
  `sdk/Update.html.in` + `sdk/I18n.js`: the song editor help text describes the order and
  the audio pauses. `sdk/manifest.json` re-pinned for the four files.

### 13.2 Measured

| Quantity | After (d) | After (e) |
| --- | ---: | ---: |
| App image (limit 453921) | 449572 | **450980** (margin **2941**) |
| Static SRAM | 300340 | 300340 |
| Runtime heap (min 49152) | 223276 | 223276 |

Checkpoint (e) costs 1408 bytes of flash and no static RAM (the batch uses the transfer
buffer and the existing sector image). **The margin is 1155 bytes below the 4 KB target
of decision 1**; candidates in docs/FLASH-BUDGET.md section 8.1. Track A and Track B are
byte-identical (`make crosscheck`: sdk.elf 114461b2…, .fwsc ef0a6f43…). `make test`: 109
host checks (70 + 39) and the wasm smoke test pass, no compiler warnings. The rebuilt
preview loads in headless Chrome with no console errors, the placeholder hidden, 149 LCD
targets and the page-19 shortcut present.

### 13.3 Upload time, single-block against batched (estimate; measure on hardware)

Nothing here was timed on a device. Assumptions, to be replaced by the stopwatch figures
of checklist step 11: one SysEx exchange (request + reply, 64 payload bytes per chunk)
takes 5 ms (fast) to 20 ms (slow); a 4 KB sector erase 60 ms (typical for 25Q-class
SPI NOR; the datasheet maximum is 400 ms); a 4 KB program 12 ms. Two 137-block songs:
"sparse" (average payload 202 bytes, record 208, stream 28496 bytes) and "dense" (every
payload 832 bytes, record 840, stream 115080 bytes). The song record (4096 bytes, 67
exchanges, one 3-erase transaction) adds 0.5–1.5 s to every row.

| | Flash operations | Exchanges | Fast link | Slow link |
| --- | ---: | ---: | ---: | ---: |
| Sparse, kind 6 (one block per transaction) | 411 erases, 411 programs | 959 | ≈ 31 s | ≈ 46 s |
| Sparse, kind 7 (1 batch of 8 sectors) | 10 erases, 9 programs, 8 byte writes | 449 | ≈ 3.5 s | ≈ 11 s |
| Dense, kind 6 | 411 erases, 411 programs | 2192 | ≈ 38 s | ≈ 71 s |
| Dense, kind 7 (5 batches, 35 sectors) | 45 erases, 40 programs, 35 byte writes | 1814 | ≈ 13 s | ≈ 41 s |

Per block, kind 6 spends about 190 ms in flash (three erases) plus 7–16 exchanges; kind 7
spends about 90 ms of flash per sector and is then limited by the 64-byte chunk rate of
the stock protocol, which is the next lever if the batched figure is still too slow.

Audio during an upload: the flash API silences audio briefly on every erase and every
write (sdk/include/fm1.h), so the device still dips. Kind 6 dips about seven times per
block (three erases, three programs, the commit word), spread over the whole upload;
kind 7 dips about 2N + 12 times per batch of N sectors (N erases, N programs, N byte
writes, the journal's two erases, one program and one commit word), all inside the few
hundred milliseconds after the batch's last chunk, and not at all while chunks arrive.
Uploads are not done during a performance; the dips are reported, not avoided.

### 13.4 Hardware checklist for the first flash (in order)

Nothing of Task 03 has run on hardware yet. Preparation: back up with the V01 workbench
(sample bank, DX7 user library, projects): the migration erases the first two. Flash the
Classic Tabby package. In the workbench song editor build and export (keep the `.tabby`
files) three songs: **TICK** (1 row, 16 steps, repeat 1, loop on; track 1 = a block with
`60:100:1` on every step), **THREE** (3 rows × 16 steps, repeat 1, loop off; row 1 block A =
C4 on steps 1, 5, 9, 13; row 2 block B = E4 on every other step; row 3 block C = G4 on
every step; the same block ids on track 1 and track 2), and the importer's 137-block song.
Project: tempo 120, swing 0, clock source internal; track 1 source FM6 with SEQ on; track
2 with MIDI out to the M8 (USB or DIN), OUT CH 1, the M8 listening on channel 1 and its own
sequencer stopped. A MIDI monitor on the same port helps for steps 1, 4 and 7.

On a device that still holds V01 sample or DX7 data the SONG page shows "OLD SAMPLE/DX7
DATA IN FLASH" and song storage stays disabled: run step 2 before step 1 there.

1. **Song ticks and sends MIDI with the stock sequencer stopped.** Write TICK to slot 1
   (workbench, device target). Check the stock transport is stopped (SEQ page shows STOP).
   ACTIONS → SONG MODE, K1 to song 1, PLAY. See: "PLAYING", "ROW 1", "BAR" counting 1..4
   and wrapping, PLAY LED on. Hear: FM6 plays the note on every 16th at 120 BPM, eight
   notes per second, evenly. Monitor: Start (FA) once, Clock (F8) 24 per beat, note on /
   off on channel 1, no pattern notes. PLAY again: "STOPPED - PLAY STARTS", Stop (FC)
   once, nothing hangs, LED off. If BAR stays at 1 and nothing sounds, the per-block clock
   hook is not called while the transport is stopped on the real engine (it was verified
   against the web engine only): stop here and report.
2. **Migration prompt and erase of old sample / DX7 data.** Boot a device with V01 data.
   See: the SONG page says "OLD SAMPLE/DX7 DATA IN FLASH" and "ACTIONS: ERASE OLD
   SAMPLE/DX7"; song slots cannot be used. ACTIONS → "ERASE OLD SAMPLE/DX7" → "ERASE OLD
   FLASH DATA?" → SAVE confirms (HOME cancels). The erase runs one sector per control
   poll; if audio is playing it dips briefly per sector. Afterwards the SONG page shows
   "NO SONG HERE - UPLOAD FROM WORKBENCH", the workbench "Storage status" says 391296
   bytes free, 0 reclaimable, no "old data" suffix. Projects, tunings and settings are
   unchanged (load a project; play a tuned scale).
3. **Three-row song on FM6 and on MIDI out to the M8.** Write THREE to slot 2, K1 to song
   2, PLAY. See: "ROW 1", then "ROW 2" exactly when BAR wraps, then "ROW 3"; "NEXT ROW 2"
   / "NEXT ROW 3" during rows 1 and 2, "LAST ROW" during row 3, then "STOPPED - PLAY
   STARTS" with Stop sent once. Hear: FM6 plays C4 four times in bar 1, E4 eight times in
   bar 2, G4 sixteen times in bar 3; the M8 plays the same rhythm on channel 1, in step
   with FM6 for all three bars, and goes silent with it (no hanging note).
4. **Per-track channel override and release on leaving the song.** In THREE set the
   song's channel for track 2 to 5 (device OUT CH stays 1), set the M8 to channel 5,
   write, PLAY. See on the monitor: track 2 notes as 94 / 84 (channel 5), none on channel
   1. Hold a key on track 2 while the song plays: it sounds on channel 5 too. Keep holding
   it and press PLAY to stop: the key's note-off arrives on channel 5 (the channel its
   note-on used), the M8 shows no stuck note. Release, press the key again: channel 1.
5. **Queued jump at the next bar.** Set every row of THREE to repeat 4 and loop on; PLAY.
   During row 1, bar 2, press pad 3. See: "JUMP TO ROW 3" in amber at once; when BAR
   wraps from 4 to 1 the page shows "ROW 3" and "X 1": the change lands on beat 1 of the
   next bar, never mid-bar, with no stutter. Hear: row 1 finishes its bar, then G4 on
   every step. K4 → "JUMP: ROW END"; press pad 1: the jump waits for row 3's four repeats
   to end, then "ROW 1".
6. **Rapid jumps.** While playing, press pads 1, 2, 3 within one bar: only the last one
   shows ("JUMP TO ROW 3") and only it lands, at the next bar. Press pad 2 ten times
   inside one bar: one jump. Press pad 4 (no such row): a short "NO SUCH ROW / NOT
   PLAYING" notice, nothing queued. Throughout: no "ROW DECODE LATE" and no "BLOCK READ
   ERROR" on the page, audio continuous, one row change per bar at most.
7. **Tempo extremes.** Project tempo 30, THREE with repeat 1: a bar takes 8 s (BAR
   advances every 2 s), row 3's notes come every 0.5 s, Clock at 12 per second, the M8's
   tempo display (if slaved) reads 30. Project tempo 300: a bar takes 0.8 s, "ROW"
   changes every 0.8 s, row 3 plays 20 notes per second with none missing, no "ROW
   DECODE LATE", clean stop with no hanging note. Then set the song's BPM override to 300
   with the project at 120: the song and the Clock out run at 300; after the stop, the
   project's own pattern sequencer still runs at 120.
8. **Power cut during a song write, then recovery.** Write the 137-block song to slot 3
   and pull the USB cable (or power) while the workbench shows "Writing song NN%" between
   20 % and 80 % (the block batches). Power up. See: no old-data prompt; slot 3 shows the
   song's name (the record went first); PLAY starts it, and a row whose blocks were still
   missing shows "BLOCK READ ERROR" and plays silent for those tracks. "Storage status"
   answers (no "SONG STORAGE ERROR" on the device): batches that reached their commit are
   complete, a batch cut before its commit is absent entirely (its sectors were erased at
   boot). Write the song again: it completes and every row plays. Variant: pull power in
   the first second (the record write): afterwards slot 3 holds either the old content or
   the new record, never an error.
9. **Compaction.** Write the 137-block song to slot 3 twice. "Storage status": reclaimable
   ≈ the song's block bytes (one stale copy per block). ACTIONS → "COMPACT SONG STORAGE".
   See: "COMPACTING STORAGE..." on the SONG page for a few seconds (one sector per
   control poll, an audio dip per sector if something plays), then reclaimable 0 and free
   up by the same amount; the song still plays every row. With a song playing the action
   is refused.
10. **Factory-V16 restore warning.** Workbench firmware tab, choose the stock V16 package,
    click "Restore factory V16". See: the confirm dialog ends with "Restoring V16 also
    overwrites the last 40 KB of Classic Tabby song storage (block sectors 86-95). Export
    your songs first in Projects & sounds > Song mode." (Chinese UI: 恢复 V16 还会覆盖
    Classic Tabby 歌曲存储的最后 40 KB…). Cancel.
11. **Upload timing (for the (e) estimate).** Hold a long FM6 note (or play a pattern) and
    write the 137-block song: stopwatch from the click to "Song written and verified by
    read-back"; note where the audio dips (expected: only in the moment after each batch's
    last chunk, none while chunks stream). Record the time against section 13.3.
12. **Timing: song mode against the stock pattern sequencer.** Same material both ways: a
    one-track pattern of a C4 on every 16th at 120 BPM in the stock sequencer (SEQ page,
    track 1, MIDI out on), and the same thing as a song (TICK from step 1 with repeat 8).
    Record each on a MIDI monitor with millisecond timestamps (MIDI-OX, Pocket MIDI,
    Protokol or the like) for at least 32 bars, through the same cable. For each
    recording, take the note-on timestamps, subtract the first, and compute each note's
    deviation from n × 125 ms. Report, for each: the mean deviation (a fixed offset), the
    spread (max − min), and whether the deviation walks (drift) or stays within a band.
    What the simulator predicts for song mode: a band of about 3 blocks (8.7 ms), no drift
    over minutes, the mean about one block early relative to the ideal grid. The question
    for you: is the stock sequencer's band the same (both run from the same per-block
    clock, so it should be), and is song mode's deviation a fixed offset note to note or
    does it vary within the band? Write both numbers down; if song mode's band is wider
    than the stock sequencer's, tell me.

## 14. Task 02 — MIDI file import (folded from docs/tasks/TASK-02-notes.md at Step 4)

Spec side (scope, mapping rules, layout, differences found at the rebase): SPEC.md section 7.

### 14.1 Step 4 (2026-11-02): rebase, real transfer, workbench mount, simulator check

- Rebase of classic-tabby/task02-midi-import onto classic-tabby/linux-build (659422b,
  checkpoint e): clean, no conflicts; the only shared file both sides had touched was the
  Makefile (different hunks).
- `web/import/song-transfer.js` v0.3: `createBackend()` on the workbench song backend
  (device or simulator), `select({backend, name})`, kind-7 batch plan (same cut as
  `FM1Web.songBatches`: 4076-byte record areas, 8 sectors per batch), delete-before-replace,
  `read()` decoding the slot into the song model. The stub stays for the standalone page.
- `web/import/import-ui.js` v0.4: target name (device / simulator) in the confirm and the
  messages, batch plan shown, elapsed time reported, "Write song…" button.
- Shared files touched (kept small): `tools/linux/build-web.py` (+3 lines: the
  `/*FM1_IMPORT_SCRIPT*/` placeholder inlining the five web/import scripts in load order),
  `sdk/Update.html.in` (+1 `<details>` group with the mount point, +1 script placeholder,
  `songBackend()` gains an optional progress callback and `exists(slot)`, +3 lines mounting
  the panel), `sdk/I18n.js` (+2 entries: the group title and its help line),
  `sdk/manifest.json` (re-pinned for those two), `Makefile` (+`midi-import-sim` target).
- `tests/midi-import/run.mjs` v0.4: section 11c on a fake backend: first write = record +
  blocks with no delete, occupied slot reported with name / rows / distinct blocks, rewrite
  deletes first, read() gives identical `.tabby` bytes, batch plan within 8 sectors / 32608
  bytes, unconnected target reports "unknown" with the reason. 127 checks.
- `tests/midi-import/simulator.mjs` v0.1 (`make midi-import-sim`): renoise-export.mid
  through the wasm simulator, below.
- docs/tasks/TASK-02-notes.md folded into SPEC.md section 7 and this section, then removed.

### 14.2 Simulator check (renoise-export.mid, 2026-11-02)

tests/midi-import/simulator.mjs imports the file with the default assignments, output
channels 3 / 5 / 7 / 9 on tracks 1–4 and "device setting" on tracks 5–8, writes it to the
simulator's slot 3 as the workbench's simulator target does (record first, one kind-7
batch of 112 blocks, 10 772 bytes), switches all eight tracks to FM6, plays it to the end
with MIDI capture on and compares MIDI out with the model:

| Check | Result |
| --- | --- |
| Song: rows / blocks / steps / tempo | 18 / 112 / 1152 / 80 BPM |
| Played to its end and stopped by itself | 74 422 blocks = 216.0 s of audio, 0 underruns |
| FM6 audible | mean RMS 0.135 over the run |
| Note-ons on MIDI out | 1002 sent = 1002 in the model, every one matched by pitch, channel and step |
| Velocities | all equal |
| Note-on timing | within one tick block of the step: max error 3.0 blocks (8.7 ms), mean −0.8 blocks first and last 100 notes (no drift) |
| Note lengths | every Note Off at start + length (or the song end) within 3.5 blocks |
| Channels | tracks 1–4 on 3 / 5 / 7 / 9, track 5 on the device channel, nothing on any other channel |

Run time about 23 s in Node 22. The check is not part of `make test` because it needs the
wasm from `make web`.

### 14.3 Done (Steps 2 and 3, 2026-11-02)
- SMF parser with note pairing, running status, type 0 channel split, SMPTE and format 2
  refusal, tolerant of truncated tracks.
- Analysis and conversion with the mapping rules in section 2, warnings grouped by kind
  with positions (bar, beat.sixteenth) and per-Tabby-track labels, statistics (rows before
  and after merging, cells vs distinct blocks, notes in vs out, block bytes, sectors, pool %,
  id %).
- Song format module: block encoding/decoding, block records, song record with the 9.5
  offsets and CRC, .tabby file (9.9) encode/decode, validation rule list, pool usage
  (first-fit-decreasing into 4076-byte areas), JSON save/load.
- Transfer interface and stub (plan: kind 5 record + kind 6 per block, targets
  `(song << 8) | id`, query and time estimate; write: validate, plan, report, send nothing).
- Standalone page with the full flow (file → parts and assignment → options → result →
  save/load/export → write with the replace warning and the stub report).
- Host tests (`make midi-import-test`): parser, every fixture scenario, deduplication,
  JSON and .tabby round trips with byte-level checks of the v0.3 offsets, decode rejection
  of bad channel and step-length bytes, validation rules, stub transfer, limits, and the four
  Renoise files in tests/fixtures/. Headless Chrome run of the page: multitrack fixture
  imported, OUT CH and bar range changed, stub write reported, no script errors.
- Makefile: `midi-import-test` target (the only shared file touched; approved).
- v0.2: encoder and decoder write and read the row step length and the output channels;
  tests updated; Renoise fixtures run (section 6).
- v0.3: 16-bit block ids, 20-byte rows, 6-byte block record header, CRC over 20..2623,
  2048-block limit, kind 6 target (song << 16) | id; loose deduplication option in the
  converter and the page (checkbox + tolerance); tests: byte checks of the new offsets, id
  300 round trip, 256 distinct blocks accepted, 2049 rejected, loose mode at ±4/8/16 on a
  synthetic file and on the four Renoise files (119 checks).

### 14.4 Renoise fixtures: what the files hold (2026-11-02)

The four files in tests/fixtures/ (renoise-export.mid, Glass Relay.mid, meridian_fault.mid,
the_space_between_wires.mid) are **mf2t text**, not binary SMF: first line `MFile 1 N 96`
(format 1, N tracks, 96 ticks per quarter = 24 ticks per 16th), then `MTrk` … `TrkEnd`
blocks of `<tick> On|Off ch=1 n=… v=…` lines. Track 0 holds only `TimeSig 4/4 24 8` and
`Tempo`; every other track is one Renoise instrument, named "Track name (NN: Instrument)"
with an InstrName meta, all on channel 1. No CC, program change, pitch bend, SysEx or
tempo/meter change in any file. The importer reads the text form directly (midi-parse.js
v0.2).

| File | Tracks / parts | Bars | BPM | Rows | Blocks exact (cells) | Bytes (pool %) | Changed | Dropped |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| renoise-export.mid | 9 / 8 | 69 | 80 | 18 | 112 (112) | 10772 (2.75) | 193 starts moved, 139 lengths rounded, 10 overlaps clipped | none |
| Glass Relay.mid | 9 / 8 | 66 | 110 | 17 | 98 (119) | 10672 (2.73) | 126 moved, 165 rounded, 1 overlap | none |
| meridian_fault.mid | 12 / 11 | 85 | 104 | 22 | 137 (157) | 13420 (3.43) | 91 moved, 182 rounded, 1 overlap | 3 parts unassigned by default (11 parts > 8 tracks) |
| the_space_between_wires.mid | 10 / 9 | 64 | 104 | 16 | 117 (117) | 11924 (3.05) | 250 moved, 130 rounded, 44 overlaps | 1 part unassigned by default (9 parts) |

- **Moved starts** are chord strums and humanisation: offsets of 1–3 ticks (up to 8 in
  meridian_fault) inside a 24-tick 16th, so every note snaps back to its own step; nothing
  moves by a whole step.
- **Rounded lengths** are note-offs a tick or two early or late (3.969 → 4.00 beats and
  the like).
- **Overlaps clipped** are sustained pad and string notes re-struck on the same pitch
  before the previous one ended (16 → 8 steps); MIDI would have cut them the same way.
- **Nothing was dropped**: every note of every assigned part survives, no step has more
  than 4 notes on one track, and the only unassigned parts are the ones beyond eight,
  which the user assigns or merges in the preview.
- **Exact deduplication finds almost nothing** in these files (blocks ≈ cells, no merged
  rows): the material is through-composed and humanised, so no two 4-bar cells are
  byte-identical. With 16-bit ids (v0.4) the songs use 5–7 % of the 2048 ids per song and
  2.7–3.4 % of the pool, so capacity is no longer a concern for files of this size.
- **Loose deduplication** (same notes, velocities within the tolerance) recovers a little,
  because the humanisation is mostly in the strums (timing) rather than in velocities, and
  strums that cross a step boundary change the notes themselves:

| File | exact | ±4 | ±8 | ±16 |
| --- | ---: | ---: | ---: | ---: |
| renoise-export.mid | 112 | 111 (1 merge) | 110 (2) | 110 (2) |
| Glass Relay.mid | 98 | 97 (3) | 95 (6) | 91 (10) |
| meridian_fault.mid | 137 | 137 (0) | 135 (6) | 132 (13) |
| the_space_between_wires.mid | 117 | 110 (7) | 106 (11) | 104 (13) |

  Rows never merge in these files even in loose mode (a merged block in one track rarely
  lines up with identical blocks in all eight). Every merge is listed in the warnings with
  the row, bar range, block id and the largest velocity difference.

### 14.5 Hardware checklist (Task 02 Step 5, done by the user)

Do this after the Task 03 checklist of section 13.4 (song mode itself works on the device).
Preparation: workbench connected to the device with the project library open (Projects &
sounds); the song editor's target set to "device"; a project with tracks 1–8 on FM6 and SEQ
on; the M8 (or a MIDI monitor) on the device's MIDI out; the four files from tests/fixtures/
at hand: renoise-export.mid (69 bars, 80 BPM, 112 blocks), Glass Relay.mid (66 bars, 110
BPM, 98 blocks), meridian_fault.mid (85 bars, 104 BPM, 137 blocks, 11 parts), and
the_space_between_wires.mid (64 bars, 104 BPM, 117 blocks, 9 parts). Use spare song slots
(for example 13–16) so nothing of yours is replaced.

1. **Import each Renoise file.** Library tab → "Import MIDI file (Classic Tabby)" → choose
   the file. See: the summary line (format 1, 96 ticks per quarter, N tracks, parts, bars,
   tempo), the parts table with every Renoise instrument on channel 1 and its note count and
   range, and in step 4 the row table and the "Dropped or changed" list with only
   `moved`, `lengthRounded` and `overlapClipped` entries (the counts of section 14.4) and,
   for meridian_fault and the_space_between_wires, the parts beyond eight marked "skip".
   Assign the skipped parts to a track or leave them. Nothing is written yet.
2. **Write it to a spare song slot and time the upload.** Step 6: pick the slot, confirm
   the dialog ("Write … to device song N? Existing content … deleted and replaced."), start
   a stopwatch at OK. See: "Writing… NN %" climbing, then the message "Written to device
   song N: record + K block(s) in B batch(es), X bytes, T s; record read back and verified."
   and the plan box listing kind 5 then the kind-7 batches. Expected T (section 13.3
   estimate): about 3.5–11 s for these songs (one or two batches of 10–13 KB plus the
   record); write the measured T next to the file name. Audio dips only in the moment after
   each batch's last chunk.
3. **Audition on FM6.** Device: ACTIONS → SONG MODE, K1 to the slot, PLAY. See: the song's
   name, ROW advancing every 4 bars (64-step rows; the last row shorter), the tempo of the
   file (80 / 110 / 104 BPM) on MIDI clock out. Hear: the Renoise arrangement on FM6, every
   part on its track, chords intact (up to 4 notes per step), sustained pads holding across
   row changes, the song stopping by itself after the last bar with "STOPPED - PLAY STARTS".
4. **Switch the tracks to MIDI out and confirm on the M8.** Set the song's OUT CH per track
   in the importer (step 2 of the panel, for example T1 ch 1 … T8 ch 8), write again (the
   slot is deleted and replaced; time it again), and set the M8 to receive those channels.
   PLAY. See on the M8 / monitor: each track's notes on its channel only, note lengths as
   in Renoise (a 4-step note is 4 sixteenths at the song tempo), velocities as exported,
   Start at the beginning and Stop at the end, no hanging note after the stop. Compare one
   bar against Renoise's pattern editor: the same pitches on the same 16th positions
   (strums snapped to their step, as the warning list said).
5. **Re-import one file to the same slot and check free space after compaction.** Note
   "Storage status" (song editor) before: free F0, reclaimable R0. Write the same file to
   the same slot again. See: the song editor's confirm (or the importer's) warns that the
   old song is deleted first and suggests a `.tabby` export; the message afterwards says
   "(replaced "NAME", deleted first by the workbench)"; status now shows reclaimable ≈ R0 +
   the song's block bytes (the first copy is garbage) and free lower by the second copy. ACTIONS → COMPACT SONG STORAGE on the device, wait for
   "COMPACTING STORAGE..." to clear. See: reclaimable back to R0 and free = F0 (one copy of
   the song in the pool, no leak), and the song still plays through.

## 15. Task 03 — song mode, checkpoint (f) (2026-11-02)

### 15.1 What changed

1. **Factory scenes out.** `app/presets.c` v0.2 keeps only `groove_preset_drum_default()`
   (the 808 kit a sampler track becomes); the sixteen scene recipes, the pattern generator,
   the sixteen demo DX7 voices, `groove_factory_name` / `groove_factory_build` /
   `groove_factory_load` (app/instrument.h, app/project.c) and the FACTORY bank of the HOME
   preset browser (app/screen.c: no bank encoder, "USER PROJECTS" only, the position word's
   bank bit is gone) are removed; `web/engine/Simulator.c` loses `sim_factory_*`; the
   workbench simulator (sdk/Simulator.js, sdk/Update.html.in, sdk/I18n.js) loses the
   factory picker and "export selected preset"; prev / next step through the USER slots of
   the simulated flash. The scenes were exported from the checkpoint (e) build as
   `web/scenes/NN-NAME.fm1` (16 project files, importable through the workbench's project
   import). Found on the way and fixed: a V01 project with a sampler track failed
   validation after the (a) conversion to the 808 kit because the preset kept its "8
   sampler pads" byte; `groove_preset_drum_default` now clears it (host test 6 imports such
   a project for real; the old test built a scene that no longer had a sampler part).
2. **Delete-before-replace in the shared write path.** `Library.songWrite` (sdk/WebUpdate.js)
   checks the slot with a kind-5 download begin and cancel, deletes an occupied slot
   (`songDelete`), then record, batches, read-back; it returns `{record, replaced}`. The
   simulator target (sdk/Simulator.js `song-write`) does the same. The song editor's confirm
   says the old song is deleted first and suggests exporting a `.tabby`; the importer's
   confirm and warning say the same, and its transfer wrapper (web/import/song-transfer.js
   v0.4) no longer deletes on its own. Tests: tests/workbench/song-write.mjs (`make
   workbench-test`, part of `make test`) runs the real `Library.songWrite` against a fake
   device: command sequence for an empty and for an occupied slot, device state after the
   replace, `songDelete`, tempo parse; the importer suite (128 checks) keeps passing with
   its 11c expectations updated; host test 9 covers the device side (a replaced song's old
   blocks reclaimable, one compaction back to one copy).
3. **Tempo range.** `song_record_valid` rejects a tempo override outside 30..300 (0 stays
   the project tempo), like a bad channel or step-length byte; `songRecordParse` (workbench)
   and `decodeRecord` (importer) do the same. Host test 9: 29 and 301 rejected, 30, 300 and
   0 accepted.
4. **Liveness by reference** (assessment 9.4 v0.5.1). Without it, deleting before replacing
   changed nothing for a song whose new blocks use other ids: the moment the new record was
   valid, every old record of that song counted as live again (host test 9 showed exactly
   that before the change). The storage's liveness scan now reads the record's rows after
   building the song's directory and counts only referenced entries (a 256-byte bitmap of
   directory entries). Compaction, the status reply and the batch's free-sector choice use
   it; the directory and playback are unchanged.
5. Hardware checklist 13.4 gains step 12 (timing against the stock sequencer); 14.5 step 5
   wording follows the new confirm and message.

### 15.2 Measured

| Quantity | After (e) | After (f) |
| --- | ---: | ---: |
| App image (limit 453921) | 450980 | **447588** (margin **6333**) |
| Static SRAM | 300340 | 299924 |
| Runtime heap (min 49152) | 223276 | 223692 |

The factory scenes gave back 3392 bytes net (presets.c 2664 → 22, project.c −736, screen.c
−198, song_storage.c +212 for the liveness references and the tempo check); the 4 KB target
of decision 1 is met again with 2237 bytes to spare. Track A and Track B byte-identical
(`make crosscheck`: sdk.elf 099162a9…, .fwsc 2321722b…). `make test`: 112 host checks, the
wasm smoke test and the workbench song-write test pass, no compiler warnings;
`make midi-import-test` 128 checks; `make midi-import-sim` passes on the new wasm. The
rebuilt preview loads in headless Chrome with no console errors, the factory picker gone,
prev / next present, the import panel mounted.

## 16. Task 04 — row events, firmware part (2026-11-02)

### 16.1 What changed

Format: section 9.11 v0.6 (commit 5542841, doc only, committed first).

- `app/song_storage.h` / `.c` v0.5: `struct song_record` now covers the whole 4096-byte
  image (`tail` from 2624); event constants, `song_event_count` / `song_event` accessors;
  `song_record_valid` accepts version 1 or 2 and validates a version-2 table (count,
  table version, reserved bytes, row index and order, per-row cap of 32, data ranges per
  type, 0xFF after the last event); read, write and the staging recovery use the CRC range
  and transaction length of the record's version (20..2623 or 20..4091).
- `app/song.c` / `.h` v0.2: each row buffer carries the row's events (up to 32, gaps
  already converted to blocks) and the stream's lead; the tick streams events under the
  channel owners into router lane 0 and pre-fires the next row's stream `lead` blocks
  before the boundary (by the same landing rules as the row switch: natural next, queued
  jump at the next bar or row end); a row entered with events still pending after the
  boundary tick increments `late`; `song_send_setup` decodes row 0 into buffer 0 while
  stopped and the tick streams it; status gains `late` and `events`.
- `app/midi_router.c`: `groove_midi_song_event(channel, status, a, b)` enqueues a channel
  message under `THRU_OWNER + channel` on all three ports (lane 0).
- `app/screen.c`: ACTIONS "SEND SETUP" (refused while playing: "STOP THE SONG FIRST";
  without a song: "NO SONG LOADED"; else "SETUP SENT - ROW 1 EVENTS"); SONG page line
  "EVENTS n" with "LATE m" in amber when nonzero.
- `app/transfer.c`: command 23 bytes 13 (late, low byte) and 14 (event count, low byte).
- `web/engine/Simulator.c`: `sim_song_send_setup`; `sim_song_status(2)` carries late in its
  high half, `sim_song_status(3)` the event count.
- `tests/host/smoke.c` v0.6, section 10 (36 checks): a three-row song with PC, CC,
  bank+PC, two 250 ms gaps and a CC: every event once per row entry, in order, before the
  row's first note and on its own channel; bank MSB immediately before the PC; the gapped
  events pre-fired so they land at or just before the boundary (87 blocks between bank
  select and the gapped PC); a queued jump fires the target row's events and skips the
  other row's; a jump queued one step before the bar into a gapped row counts as late and
  its gapped event lands after the note; SEND SETUP sends row 1's events while stopped
  with no Start and no notes, and is refused while playing; a version-1 record loads with
  0 events; 293 events, a row index past the row count, unsorted rows, a 0 ms gap, type 4,
  33 events in a row, a stray byte after the table and table version 2 are rejected at the
  write; a flipped byte in the stored table fails the version-2 CRC on load.

### 16.2 Measured

| Quantity | After (f) | After Task 04 firmware |
| --- | ---: | ---: |
| App image (limit 453921) | 447588 | **449252** (margin **4669**) |
| Static SRAM | 299924 | 302580 |
| Runtime heap (min 49152) | 223692 | 221036 |

The firmware part costs 1664 bytes of flash (the Step 1 estimate was 1250: song.c took 1220
instead of 600, the stream scheduler with pre-firing and the per-row decode being larger
than guessed) and 2656 bytes of static SRAM (the record's 1472-byte tail now held in RAM,
the two row buffers' 32-event tables, the stream state). The margin stays above the 2 KB
floor of the task by 2.6 KB and above the 4 KB target of Task 03 as well. Track A and
Track B byte-identical (`make crosscheck`: sdk.elf 832f395b…, .fwsc 544cacc2…). `make test`:
148 host checks (112 + 36), the wasm smoke test and the workbench song-write test pass, no
compiler warnings; `make midi-import-test` 128 checks and `make midi-import-sim` pass on
the new wasm (the importer's version-1 songs are unaffected).

### 16.3 Device setup list for the hardware checklist (from the Step 1 research)

Settings on the gear itself, without which row events do nothing; each device JSON carries
the same text in its `notes`. Sources: docs/tasks/TASK-04-step1-assessment.md section 4.

| Device | Set on the device |
| --- | --- |
| E-MU Proteus/2 XR | Master menu MIDI MODE = Multi; per channel "MIDI ENABLE" on and "PRESET CHANGE" on for every channel a song addresses; "MIDI PROG>PRESET" map: identity for presets 0..127, and an explicit mapping (program → preset 128..383) for any preset above 127, because the Proteus has no bank select; leave the Edit menu (program changes are ignored inside it). The manual asks for setup messages before the song starts, so run SEND SETUP before PLAY. |
| Eventide H90 | System > MIDI: channel (15) or Receive Omni; PC Offset 0 (PC n = Program n as displayed, 1-based) or 1 (PC 0 = Program 1) and the rig profile set to match; the Playlist is the User List the song's program numbers refer to (no bank select exists); CC numbers for bypass / HotSwitch / tap assigned in Global Control and entered in the rig profile; on firmware 1.8.6..1.9.x put the device gap after the program change (a CC with a PC is ignored). |
| Zoom MS-70CDR+ | MENU > USB MIDI CH = 16 (or OMNI) behind the H4MIDI WC filter; USB host powered and connected before the set; patches 001..100 by program change only (no CC, no bank). Checklist item: send PC 0 and PC 1 and note which patch the display shows, to settle the PC base. |
| Waldorf Blofeld | Global: MIDI Channel (or per-part channel in Multi mode with the part's "Prg Change" filter on receive); **Ctrl Receive = on** or no CC changes anything; banks by CC 32 = 0..7 (A..H); Multi selection by CC 0 = 127 + PC only when already in Multi mode (secondary); avoid channel 10 in Multi mode (Waldorf FAQ: crashes). Allow a gap after a program change (secondary: slow program changes). |
| Waldorf Pulse 2 | Global: MIDI Channel; banks by CC 32 = 0..4 (×100 programs; CC 0 ignored; PC clamped to 0..99 inside the bank); no enable switch; program 500 is the random patch. |
| Dirtywave M8 Model:02 | MIDI Settings: track channels (default track n = channel n), **PG CHANGE = on**; program change selects the track's instrument (INST 00..7F, hex); these settings are stored in the song file. |
| Korg volca fm2 | MIDI channel (hold MEMORY at power-on, key 1..16); global 7 "MIDI ShortMessage" = on (factory default). No program change at all: a song can only send its CCs (40..50, 91, 93, 64). |
| Instruo Seashell | MIDI channel in the Seashell Controller app (Settings); no program change in firmware 1.0.x, parameters by MIDI Learn only. |
| M-VAVE FM-1 (Skiff / Melodee / Orange Cat) | Per the firmware loaded; definitions pending (workbench part). |

## 17. Task 04 — row events, workbench part (2026-11-02)

### 17.1 What changed

- `web/devices/*.json` (11): `emu-proteus-2-xr`, `eventide-h90`, `zoom-ms-70cdr-plus`,
  `waldorf-blofeld`, `waldorf-pulse-2`, `dirtywave-m8`, `korg-volca-fm2`,
  `instruo-seashell`, `mvave-fm1-skiff`, `mvave-fm1-melodee`, `mvave-fm1-orange-cat`
  (placeholder). Written by `tools/linux/devices-from-sources.py`: the hand-written facts
  come from the cited manufacturer pages (assessment section 4 plus the Skiff and Melodee
  research: Skiff v2.1.1 receives program changes counted from 0 per engine, no bank
  select, a fixed CC map; Melodee 1.6.1 has no program change handler, CCs only), the
  preset lists are parsed from the manufacturers' own files (Proteus manual text layer
  pp. 92–93: 192 names, 128..191 marked as reachable only through the program map;
  Blofeld 2012 SNDD dumps: 1024 sixteen-character names, Waldorf's programmer code
  included as the device shows it; Pulse 2 preset list: 500 with categories; Zoom patch
  list: 80). Each file lists `sources`, `setup` (what to set on the device) and
  `unverified`.
- `web/rig/device-library.js` v0.1: the `tabby-device/1` validator, `programLabel` /
  `programFromLabel` (0- or 1-based display, letter banks, hundreds, hex), `bankBytes` /
  `bankFromBytes` (CC 0 / CC 32 schemes), preset, controller and value-meaning lookups.
- `web/rig/rig.js` v0.1: the `tabby-rig/1` profile (16 channels: device, name, gap
  override, user program names), localStorage persistence, export / import, `applyGaps`
  (type-3 gap events after a program change, or between bank select and program change
  with the bank+program event split into CC 0 / CC 32 events), `describe` for the editor.
- `web/rig/rig-ui.js` v0.1: the rig setup table (device select from the library, name, gap,
  numbering note, "Names…" for user-named programs, export / import / reset) and the row
  event editor (row selector with counts, the row's events with device and preset names
  and raw numbers, move / delete, an add form driven by the device on the chosen channel:
  preset list, bank list, named controllers with value meanings, raw fields always; a
  checkbox for the per-song rig copy).
- `sdk/WebUpdate.js`: `songRecordParse` / `songRecordBuild` read and write version-2
  records (`song.events`, validated as the device does; a song without events stays
  version 1), `tabbyFile` / `readTabbyFile` carry the `TRIG` trailer, `songStatus` reads
  bytes 13..14 (late, events). `sdk/Simulator.js`: the simulator's status carries late and
  events. `sdk/Update.html.in`: the rig group before the song mode group, the events panel
  under the row table, the mount, the write / export paths applying the rig's gaps, the
  import path reading the trailer, the status message. `sdk/I18n.js`: 3 entries.
  `tools/linux/build-web.py`: placeholders `/*FM1_DEVICES*/` (the JSON files as one array)
  and `/*FM1_RIG_SCRIPT*/`. `sdk/manifest.json` re-pinned.
- Importer: `web/import/song-format.js` v0.4 (events in the model, version-2 encode and
  decode with the device's rules, `validateEvents`, the `.tabby` trailer with `song.rig`,
  JSON round trip), `web/import/midi-song.js` v0.4 (every CC and PC collected in file
  order; the window rule with the pre-roll option; bank CCs merged into a bank+program
  event; rows with events never merged into repeats; `rowEvents`, `bankWithoutProgram` and
  the reworded `programIgnored` / `ccIgnored` warnings), `web/import/import-ui.js` v0.6
  (pre-roll select, an Events column in the row table, the count in the statistics).
- Tests: `tests/workbench/devices.mjs` (38 checks: every file validates and cites sources;
  Proteus 0-based "007" = Arco Violas and the map-only presets; Blofeld "B001" = bank 1 PC
  0 by CC 32; Pulse 2 "102" = bank 1 PC 1 and "500" = RANDOM; H90 1-based; Zoom base marked
  unverified; M8 hex; value meanings; a broken definition refused), part of
  `make workbench-test`; `tests/midi-import/run.mjs` v0.5 section 13 (the `row-events.mid`
  fixture: PC, CC and bank+PC at row 1, a pre-rolled PC and a PC at row 2, a mid-row CC and
  a lone bank select dropped; pre-roll none / bar; the version-2 record bytes; decode
  rejection of an unsorted table and of type 4; the trailer and JSON round trips; 140
  checks in all); `tests/workbench/row-events-sim.mjs` (`make midi-import-sim`): a
  three-row song with a program change and a control change per row, built with the
  workbench's own record builder, played through the wasm: Start, then each row's PC and
  CC on its channel immediately before the row's note, bank LSB before the PC, every
  event once, nothing stray, Stop last, 0 late; plus the rig's gap generation and the
  Blofeld vocabulary ("B010" with its factory name, "CC 7 Channel Volume").

### 17.2 Measured

No firmware change in this part (margin stays 4669, section 16.2). `make test` (148 host
checks, wasm smoke, workbench song-write and device tests), `make midi-import-test` (140)
and `make midi-import-sim` (Renoise song and row-event song) pass. The rebuilt preview
loads in headless Chrome with no console errors, the rig table with the eleven devices,
the events panel (hidden until a song is in the editor), the importer's pre-roll option
and the eleven definitions inlined.

### 17.3 Hardware checklist for Task 04

Do the device setup list of section 16.3 first (Proteus/2 XR MIDI mode Multi, per-channel
MIDI ENABLE and PRESET CHANGE, the program map for presets above 127; H90 channel 15 and
PC Offset; Zoom USB MIDI CH 16 behind the H4MIDI WC; Blofeld Ctrl Receive on; M8 PG CHANGE
on; Pulse 2 channel; volca fm2 ShortMessage on; Seashell channel in its app). Then, in the
workbench, Library tab → "Rig setup": put each device on its channel, set the gaps you want
(H90: after the program change if its firmware is below 1.13.2), export the profile once.

1. **SEND SETUP changes every device to its row-1 preset.** Build a song (song editor or
   the importer) with row 1 events: a Proteus/2 XR program (name from the list), an H90
   Program number, a Zoom patch, a Blofeld "A001"-style program (bank by CC 32), a Pulse 2
   program 101..200 (bank 1), an M8 instrument, and a CC for the volca fm2 (for example CC
   48 algorithm). Write it to a spare slot. Device: ACTIONS → SEND SETUP. See on the SONG
   page "SETUP SENT - ROW 1 EVENTS" and the line "EVENTS n". See on the gear: every device
   shows the preset you named, the volca's algorithm changed, the Zoom shows the patch
   number (note which PC base matched: the definition assumes PC 0 = patch 001, marked
   unverified; if patch 002 appears, set displayBase 0 in web/devices/zoom-ms-70cdr-plus.json
   or correct the event numbers). Nothing on channels the song does not address.
2. **Row changes switch the Proteus/2 part, the H90 program and the Zoom patch at the bar
   line.** Three rows of 16 steps with notes on tracks routed to the Proteus (channel per
   part), the H90's channel and the Zoom's channel, and a different program for each on
   every row. PLAY. See: each device changes at the row boundary; on a MIDI monitor the
   program changes (and the H90's CC, if any) arrive before the row's first note-on, in the
   row's event order, bank select before the program change; "LATE" stays absent on the
   SONG page. Hear: the new sound from the first note of the row, no note of the previous
   row cut short, no glitch at the change (a Blofeld program change on a sustained note
   may retrigger: that is the device, not the sequencer).
3. **The Zoom reacts on channel 16 only.** Add a row event with the same program number on
   channel 15 (the H90's) and on channel 16: at the row change the Zoom changes only once
   (the channel-16 event). Send a program change on channel 1 from the workbench song
   (a row event addressed to channel 1): the Zoom does not react. If USB MIDI CH is OMNI it
   reacts to all: set it to 16.
4. **Nothing glitches or drops notes at the change.** The three-row song with dense
   chords on FM6 and on the external synths at 120 BPM and again at 240 BPM: every note of
   the row after a change sounds (count the first bar on the monitor against the block),
   FM6 does not click, the device's audio continues, and "ROW DECODE LATE" never shows.
   Then with gaps: set a 50 ms gap on the Blofeld's channel in the rig, write again: on
   the monitor the Blofeld's program change arrives about 50 ms before the row's first
   note (pre-fired), the note-on still on the bar line; "LATE" stays 0. Queue a jump to a
   row with gaps one step before the bar: "LATE 1" appears once and the gapped program
   change lands just after the bar (the known limit).
5. **Importer round trip.** Export a `.mid` from Renoise with program changes at bar starts
   (one bar before the section where possible) and a CC at a bar start, import it: the
   "Dropped or changed" list shows "rowEvents" with each converted event and lists the
   mid-bar ones as dropped; the row table's Events column shows them; write the song and
   confirm the gear changes as in step 2.
