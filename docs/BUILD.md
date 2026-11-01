# Classic Tabby — Linux build of SMK37 Open V01

Version: 0.1
Revision log:
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
- Step 2 (partial): versions recorded below. Packages that need root are not installed yet
  (sudo requires an interactive password); `tools/linux/install-host-packages.sh` is the
  reproducible installer for a clean host.
- Step 3 (preparation): JieLi Windows toolchain 2.5.3 downloaded and unpacked with
  innoextract (no Wine needed to extract). All 22 `external_toolchain` hashes match.
  `tools/linux/build.py` (Python port of `sdk/Build.ps1`, option (b)) and
  `tools/linux/package.py` (port of `sdk/Package.cs`) written. The port was exercised end
  to end with the native Linux toolchain in a scratch directory: every Test-Firmware check
  passes and the package writer produces a 492084-byte `.fwsc` (same size as the official
  release). The Track A build itself waits for Wine.
- Step 4 (preparation): official V01 Pro release fetched from open.m-vave.com (metadata,
  `.fwsc`, simulator, official source kit). The official `build_id` is reproduced exactly
  from the official kit's `app/` files (see section 5).
- Step 5 (preparation): JieLi Linux toolchain 20260730.1 downloaded, extracted and pinned in
  `tools/linux/toolchain-linux.json` (24 files).
- Step 6 (preparation): WASI SDK 27 (Linux x86_64) downloaded and extracted; SHA-256 below.

### Left to build

- Track A reference build under Wine (needs `wine64` + `wine32:i386`; the JieLi tools are
  32-bit PE). Then Checkpoint A.
- Package equivalence proof (`package.py` vs `sdk/Package.cs` through `pwsh`); needs
  PowerShell 7.
- Determinism build in a second directory; official-kit build for byte comparison.
- Track B build in its final location (`/opt/jieli`) and the A/B comparison.
- Web workbench local preview with the Linux WASI SDK (`tools/linux/build-web.py`).
- Host test target and top-level Makefile.

### Left to test

- Wine runs `clang.exe --version`, `pi32v2-ld.exe --version`, `llvm-nm.exe`, `llvm-objcopy.exe`.
- Unix-style absolute paths passed to the Windows tools under Wine (expected to resolve
  through the `Z:` drive; fall back to `winepath -w` if not).
- Preview loads in Chrome and the simulator runs.
- Hardware enumeration (read only).

## 2. Host packages (Ubuntu 26.04.1 LTS "resolute", kernel 7.0.0-42-generic)

| Package | Version | Source | State |
| --- | --- | --- | --- |
| git | 1:2.53.0-1ubuntu1.1 | Ubuntu | installed |
| build-essential | 12.12ubuntu2.26.04.2 (gcc 15.2.0) | Ubuntu | installed |
| python3 | 3.14.3-0ubuntu2 | Ubuntu | installed |
| nodejs (Node LTS) | 22.23.3-1nodesource1 (`/usr/bin/node`) | nodesource repo (pre-existing) | installed; Homebrew node 25.6.1 shadows it in PATH |
| powershell | — | Microsoft apt repo | **not installed (needs sudo)** |
| wine64, wine32:i386 | candidate 10.0~repack-12ubuntu1 | Ubuntu | **not installed (needs sudo)** |
| innoextract | 1.9_14 (Homebrew bottle, temporary) | Homebrew | installed via brew to unblock extraction; apt version to be installed |
| p7zip-full | — | Ubuntu | **not installed (needs sudo)**; not needed so far |
| alsa-utils | 1.2.15.2-1ubuntu1 | Ubuntu | installed |
| google-chrome-stable | 156.0.8078.73-1 | Google apt repo (pre-existing) | installed (not snap) |
| usbutils (lsusb) | 1:019-1 | Ubuntu | installed |

Install everything missing with:

```sh
sudo bash tools/linux/install-host-packages.sh
```

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

From the repository root (`~/Documents/Classic Tabby/firmware`):

```sh
# Input checks only (SDK manifest, synth.json, toolchain pins)
python3 tools/linux/build.py --verify-only --toolchain-kind wine \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-2.5.3/C\$/JL/pi32"

# Track A: reference build, Windows toolchain under Wine (= sdk\Build.ps1 -Model pro -FirmwareOnly)
python3 tools/linux/build.py --model pro --firmware-only --toolchain-kind wine \
    --toolchain "$HOME/Documents/Classic Tabby/toolchains/jieli-2.5.3/C\$/JL/pi32" \
    --wine-prefix ~/.wine-jieli

# Track B: native Linux toolchain, pinned by tools/linux/toolchain-linux.json
python3 tools/linux/build.py --model pro --firmware-only --toolchain-kind native --toolchain /opt/jieli
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

## 6. Flash / RAM baseline (preliminary, native toolchain scratch build)

Final numbers come from Track A at Checkpoint A. From the port's native-toolchain smoke
build (`firmware-report.json`, `package-report.json`):

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
constraint for Phase 1 work.

## 7. Windows-specific items found in the upstream build and how they are handled

| Item | Where | Handling |
| --- | --- | --- |
| PowerShell 5.1 host (`powershell` in build.bat) | build.bat, sdk/Build.ps1, tools/Build-Web.ps1 | Build.ps1 ported to `tools/linux/build.py`; Build-Web.ps1 port pending (Step 6) |
| C# packager loaded with Add-Type | sdk/Package.cs | Ported to `tools/linux/package.py`; `tools/linux/package-pwsh.ps1` runs the original under pwsh for the equivalence test |
| `.exe` tool names and `LLVMgold.dll` plugin | Build.ps1 L36, L241, L307, L422, L436 | Track A keeps the names and runs them through Wine; Track B maps them in toolchain-linux.json |
| `StartsWith($sdk + '\')` manifest path check | Build.ps1 L342 | `os.sep` prefix check |
| `StartsWith($root + '\build\')` object directory guard | Build.ps1 L364 | `os.sep` prefix check, honouring `--build-root` |
| `app/synth` exclusion with `'\'` suffix | Build.ps1 L357 | `os.sep` prefix check |
| `Sort-Object FullName` (culture-sensitive) | Build.ps1 L357, L401 | ordinal sort; proven correct by reproducing the official build_id (`--identity-sort culture` kept for reference) |
| 22 Windows toolchain hashes | sdk/manifest.json, sdk/synth.json | Track A: enforced unchanged. Track B: replaced by `tools/linux/toolchain-linux.json`; every SDK file check and every synth.json check except the installed-compiler hash remains |
| `curl.exe`, `tar.exe`, Windows WASI SDK | Build-Web.ps1 L51-L55 | Linux WASI SDK 27 pinned (Step 6) |
| CRLF in the official kit's app files | official source zip | Documented in section 5; no change to app/ |
