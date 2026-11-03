# Classic Tabby — Linux build of SMK37 Open V01

Version: 0.12
Revision log:
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
