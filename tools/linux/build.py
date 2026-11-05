#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/build.py — Linux port of sdk/Build.ps1 for SMK37 Open V01 (Classic Tabby)

Purpose
    Reproduce sdk/Build.ps1 step by step on Linux so the official, unmodified firmware
    source can be compiled without Windows or PowerShell:

      * same compiler flags, same source order, same per-file -fno-lto / -fno-pic / -Oz
        overrides, same generated build_identity.c, same link line;
      * the same input checks (sdk/manifest.json hashes, synth.json contract, SDK file
        set) and the same post-link Test-Firmware checks, ported function by function;
      * the same .fwsc packaging (sdk/Package.cs ported to tools/linux/package.py, with an
        optional pwsh Add-Type path for equivalence testing);
      * the same -Package distribution path (v0.3): build/official-web/<model>/
        SMK37-Open-Source.html with the firmware and the stock V16 restore image
        embedded, assembled by tools/linux/build-web.py.

    Two toolchain "tracks" are supported:

      Track A (--toolchain-kind wine, the reference): the exact JieLi Windows 2.5.3
          toolchain (PI32v2 clang 4.0.1 r3) run through Wine. All 22 external_toolchain
          hashes in sdk/manifest.json are enforced, and the synth.json compiler hash too.
      Track B (--toolchain-kind native): JieLi's native Linux toolchain. The Windows
          toolchain hashes cannot apply, so they are replaced by the separate pinned
          manifest tools/linux/toolchain-linux.json. Every SDK file check and every
          synth.json check except the installed-compiler hash stays enabled.

    Everything is written under build/<model>/ (or --build-root). Nothing here touches
    device flash. Factory calibration and protected flash regions are never written.

    Line references below ("Build.ps1 L123") point at the upstream script so a reviewer
    can diff behaviour. Where PowerShell semantics are subtle (culture-sensitive
    Sort-Object, $null comparisons) the choice made here is called out inline.

Usage (from the repository root)
    python3 tools/linux/build.py --model pro --firmware-only \
        --toolchain-kind wine --toolchain ~/Documents/Classic\\ Tabby/toolchains/jieli-2.5.3/C\\$/JL/pi32
    python3 tools/linux/build.py --model pro --firmware-only --toolchain-kind native --toolchain /opt/jieli
    python3 tools/linux/build.py --verify-only [--toolchain-kind ... --toolchain ...]
    FM1_SOURCE_URL=https://github.com/<owner>/<repo>/archive/refs/tags/<tag>.zip \
        python3 tools/linux/build.py --model pro --package --toolchain-kind native --toolchain ...
    python3 tools/linux/build.py --model pro --check-only --toolchain-kind native --toolchain ...   (make check, v0.6)

Version: 0.6

Revision log
    v0.6  2026-11-04  Task 07 (dev checks). --check-only: the same input checks and the same
                      per-unit compiler options, but every unit goes through the compiler with
                      -fsyntax-only (parsed and type-checked, no code, no depfile) into
                      build/check/<model>/, so build/<model>/ keeps its outputs; no identity unit,
                      no link, no Test-Firmware, no package. Both modes also write the compile
                      database twice: compile_commands.json as before (the target compiler's real
                      commands) and compile_commands.host.json with the pi32v2-only flags removed
                      and a host compiler named, for cppcheck, clang-tidy and clangd; a copy of
                      the host one goes to build/compile_commands.json (the editors' place) when
                      the build root is the default. The default build path, its order and its
                      outputs are unchanged (Step 2 gate: identical sdk.elf, .fwsc, app-image.bin).
    v0.7  2026-11-04  Classic Tabby Task 08 (version display): --display-version /
                      FM1_DISPLAY_VERSION, else tools/linux/display_version.py (the git tag,
                      or the export-subst VERSION file of a source archive). The value is
                      passed as -DFM1_DISPLAY_VERSION to every unit (the boot screen draws
                      it), folded into the build identity when it differs from the Open
                      label FM1_RELEASE_VERSION (so a re-tag of unchanged sources is a new
                      build id, while the gate build with the label keeps the old id), and
                      written as display_version into build-identity.json, the package
                      JSON (FM1_PACKAGE) and web-package-report.json; build-web.py gets
                      --display-version. FM1_RELEASE_VERSION and the update identity are
                      untouched.
    v0.5  2026-11-04  Classic Tabby Task 06 (b): app/song.c, app/song_storage.c and
                      app/timed_note.c compile at -Oz like the other control-task units.
    v0.4  2026-11-04  Classic Tabby Task 06 (a): the device's BLE page is gone, so the SDK's
                      BLE client wrappers (fm1_ble_scan / connect / disconnect / get_device)
                      and fm1_bluetooth_get_status are unreferenced and dropped by the
                      linker; they left the required-symbol list. The discovery
                      implementation check (sdp / gatt client) is unchanged.
    v0.3  2026-11-02  --package ported (Build.ps1 -Package, L282-L288 and L439-L463, Task 02):
                      the .fwsc is packaged, the pinned stock V16 restore image is embedded
                      next to it in build/<model>/web-package.json (same key order as the
                      upstream ConvertTo-Json -Compress output), tools/linux/build-web.py
                      is run with --package-json and --source-url (FM1_SOURCE_URL), and
                      build/<model>/web-package-report.json is written. The package JSON
                      goes through a file instead of the command line because its base64
                      payloads are about 1.5 MB, well past a safe argv size.
    v0.2  2026-11-01  --source-root: build a different checkout (e.g. the official source
                      kit tree) with this script, so the official package can be reproduced
                      byte for byte without copying tools/linux into that tree (Step 4).
    v0.1  2026-11-01  Initial port of sdk/Build.ps1 (build, -FirmwareOnly packaging,
                      Test-Firmware). -Package (web integration) is not ported yet; the
                      web workbench is built by tools/linux/build-web.py instead.
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import struct
import subprocess
import sys
from pathlib import Path

# v0.7: the display version lives in its own module (shared with build-web.py). python -I
# leaves the script directory off sys.path, so add it explicitly.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from display_version import display_version as compute_display_version, DisplayVersionError  # noqa: E402

# The repository root is two levels above tools/linux/.  (Build.ps1 L13-L14 derive $root
# from $PSScriptRoot = sdk/; here the script lives in tools/linux/ so we go up twice.)
# v0.2: --source-root replaces ROOT/SDK at start-up (set_source_root) so another checkout,
# such as the official source kit, can be built with this script unchanged.
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SDK = ROOT / "sdk"


def set_source_root(path):
    """Point the build at a different source tree (must contain app/ and sdk/)."""
    global ROOT, SDK
    ROOT = Path(path).resolve()
    SDK = ROOT / "sdk"
    for required in ("app/version.h", "sdk/manifest.json", "sdk/Build.ps1"):
        if not (ROOT / required).is_file():
            raise BuildError("--source-root %s does not look like an SMK37 Open tree (missing %s)" % (ROOT, required))

sys.path.insert(0, str(HERE))
import package as fm1_package  # noqa: E402  (tools/linux/package.py, port of sdk/Package.cs)


# Stock (factory) V16 restore images embedded by -Package (Build.ps1 L444-L453). The
# SHA-256 doubles as the stock build_id in the workbench metadata. The loader hash is the
# shared vendor loader (sdk/tools/pack/ota.bin) that both production boards use.
STOCK_V16 = {
    "pro": {"name": "Pro", "sha256": "2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0"},
    "elite": {"name": "Elite", "sha256": "b2ee38abfef3ae922e4eecdb8a551e14345300ae6f270265feacd33b6ef99cb6"},
}
STOCK_LOADER_SHA256 = "ef1f2db89b011fa53e71df363f0122de0ea896618c53fb53e8da676322004541"


def validate_source_url(url):
    """Build.ps1 L282-L288 / Build-Web.ps1 L105-L109: absolute https URL, no credentials,
    no line breaks. Returns the URL unchanged or raises."""
    if not url or not url.strip():
        raise BuildError("Set FM1_SOURCE_URL or --source-url to the HTTPS URL of the matching source archive, without credentials.")
    if re.search(r"[\r\n]", url) or not re.match(r"^https://([^/@\s]+)(/.*)?$", url):
        raise BuildError("Set FM1_SOURCE_URL or --source-url to the HTTPS URL of the matching source archive, without credentials.")
    return url


class BuildError(Exception):
    """Equivalent of a PowerShell `throw` in Build.ps1: the build stops with this message."""


# ---- Small helpers (Build.ps1 L17-L30) ----------------------------------------------------
def write_text(path, text):
    """Write-Text: UTF-8 without BOM, no newline translation."""
    Path(path).write_bytes(text.encode("utf-8"))


def sha256_file(path):
    """Hash: lower-case hex SHA-256 of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def sha256_text(text):
    """Hash-Text: SHA-256 of the UTF-8 encoding of a string."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def to_json(value, indent=4):
    """ConvertTo-Json stand-in. Key order and values match the PowerShell objects; the
    whitespace layout differs (PowerShell uses two spaces after the colon), which does
    not affect any consumer in this repository."""
    return json.dumps(value, indent=indent, ensure_ascii=False)


def culture_sort_key(text):
    """Approximation of the culture-sensitive, case-insensitive comparison Windows
    PowerShell's Sort-Object uses (NLS / ICU style): punctuation sorts before digits and
    letters, in DUCET order, and case is ignored. Only the characters that occur in this
    repository's paths need a defined order. Ordinal order differs for exactly one pair
    under app/ (factory_dx7.inc vs factory_dx7_packed.inc: '.' < '_' ordinally, '_' < '.'
    in DUCET). Which one the official build used is decided by comparing build_id with the
    release (see docs/BUILD.md, Checkpoint B)."""
    punctuation = "_-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$"
    key = []
    for ch in text:
        if ch in punctuation:
            key.append((1, punctuation.index(ch)))
        elif ch.isdigit():
            key.append((2, ord(ch)))
        else:
            key.append((3, ord(ch.lower())))
    return key


def sorted_paths(paths, mode):
    """Sort-Object FullName equivalent. mode: 'ordinal' or 'culture' (see above)."""
    if mode == "culture":
        return sorted(paths, key=lambda p: culture_sort_key(str(p)))
    return sorted(paths, key=str)


# ---- Toolchain abstraction ------------------------------------------------------------------
class Toolchain:
    """Locates the five tools Build.ps1 needs and runs them, through Wine for the Windows
    toolchain (Track A) or directly for the native Linux toolchain (Track B)."""

    # Build.ps1 uses these fixed Windows names (L36, L241, L307, L394, L422, L436).
    WINE_TOOLS = {"clang": "bin/clang.exe", "ld": "bin/pi32v2-ld.exe", "plugin": "bin/LLVMgold.dll",
                  "nm": "bin/llvm-nm.exe", "objcopy": "bin/llvm-objcopy.exe"}

    def __init__(self, kind, root, wine="wine", wine_prefix=None, native_manifest=None):
        self.kind = kind
        self.wine = wine
        self.wine_prefix = wine_prefix
        root = Path(os.path.expanduser(root)).resolve()
        if kind == "wine":
            # Build.ps1 L304-L307: accept either the pi32 directory or its bin directory.
            if (root / "clang.exe").is_file():
                root = root.parent
            self.root = root
            self.tools = dict(self.WINE_TOOLS)
            if not (root / self.tools["clang"]).is_file():
                raise BuildError("Install JieLi Windows toolchain 2.5.3 (PI32v2 clang 4.0.1, r3 target) and set "
                                 "FM1_PI32_TOOLCHAIN (or --toolchain) to its pi32 directory containing bin/clang.exe.")
        elif kind == "native":
            self.root = root
            if not native_manifest or not native_manifest.get("tools"):
                raise BuildError("Native toolchain manifest (tools/linux/toolchain-linux.json) lacks a 'tools' map.")
            self.tools = dict(native_manifest["tools"])
            for key in ("clang", "ld", "plugin", "nm", "objcopy"):
                if key not in self.tools:
                    raise BuildError("Native toolchain manifest is missing the '%s' tool." % key)
            if not (root / self.tools["clang"]).is_file():
                raise BuildError("Install the JieLi Linux toolchain and set --toolchain to the directory that "
                                 "contains %s (JieLi documents /opt/jieli)." % self.tools["clang"])
        else:
            raise BuildError("Unknown toolchain kind: " + kind)

    def path(self, key):
        return str(self.root / self.tools[key])

    def raise_file_limit(self):
        """JieLi's Linux README: raise `ulimit -n` to 8192 or the LTO link fails with
        'error adding symbols: File format not recognized'. Soft limit only, bounded by
        the hard limit; a no-op for the Wine toolchain."""
        if self.kind != "native":
            return
        import resource
        soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE)
        wanted = 8192 if hard == resource.RLIM_INFINITY else min(8192, hard)
        if soft < wanted:
            resource.setrlimit(resource.RLIMIT_NOFILE, (wanted, hard))

    def env(self):
        env = dict(os.environ)
        if self.kind == "wine":
            if self.wine_prefix:
                env["WINEPREFIX"] = str(Path(os.path.expanduser(self.wine_prefix)).resolve())
            env.setdefault("WINEDEBUG", "-all")  # keep fixme: chatter out of the build log
        return env

    def command(self, key, arguments):
        if self.kind == "wine":
            return [self.wine, self.path(key)] + list(arguments)
        return [self.path(key)] + list(arguments)

    def run(self, key, arguments, cwd, capture=False):
        """Run($program, $arguments): raise on a non-zero exit code (Build.ps1 L19-L24)."""
        cmd = self.command(key, arguments)
        self.raise_file_limit()
        result = subprocess.run(cmd, cwd=str(cwd), env=self.env(),
                                stdout=subprocess.PIPE if capture else None,
                                stderr=subprocess.PIPE if capture else None)
        if result.returncode != 0:
            if capture and result.stderr:
                sys.stderr.write(result.stderr.decode("utf-8", "replace"))
            raise BuildError("%s failed (%d)" % (Path(self.tools[key]).name, result.returncode))
        if capture:
            return result.stdout.decode("utf-8", "replace")
        return None


# ---- Input verification (Build.ps1 L303-L352) -----------------------------------------------
def load_json(path):
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)


def verify_toolchain_files(root, files, what):
    """Check every pinned file of a toolchain manifest (Build.ps1 L316-L321, also used for
    tools/linux/toolchain-linux.json)."""
    for name, digest in files.items():
        if (not re.fullmatch(r"(bin|lib|common|pi32v2|pi32|q32s)/[A-Za-z0-9_./-]+", name)
                or ".." in name.split("/") or not re.fullmatch(r"[a-f0-9]{64}", digest)):
            raise BuildError("Invalid external toolchain entry: " + name)
        file = Path(root) / name
        if not file.is_file() or sha256_file(file) != digest:
            raise BuildError("External toolchain does not match the SDK: %s. %s" % (name, what))


def verify_inputs(toolchain, native_manifest, log):
    """Everything Build.ps1 checks before compiling. Returns (manifest, synth)."""
    manifest = load_json(SDK / "manifest.json")
    if manifest.get("abi") != 131072:
        raise BuildError("This application requires the matching 128-frame SDK.")
    external = manifest.get("external_toolchain")
    if external:
        if external.get("schema") != 1 or not external.get("files"):
            raise BuildError("Invalid external toolchain manifest.")
        for required in ("bin/clang.exe", "bin/pi32v2-ld.exe", "bin/LLVMgold.dll", "bin/llvm-nm.exe", "bin/llvm-objcopy.exe"):
            if required not in external["files"]:
                raise BuildError("Missing toolchain contract: " + required)
        if toolchain.kind == "wine":
            # Track A: the 22 Windows toolchain hashes stay ON (Build.ps1 L316-L321).
            verify_toolchain_files(toolchain.root, external["files"],
                                   "This SDK revision requires JieLi Windows toolchain 2.5.3. Set FM1_PI32_TOOLCHAIN to its pi32 directory.")
            log("Toolchain: %d Windows toolchain files match sdk/manifest.json" % len(external["files"]))
        else:
            # Track B: replaced (not deleted) by the separate pinned Linux manifest.
            if native_manifest.get("schema") != 1 or not native_manifest.get("files"):
                raise BuildError("Invalid native toolchain manifest (tools/linux/toolchain-linux.json).")
            verify_toolchain_files(toolchain.root, native_manifest["files"],
                                   "This build requires the pinned JieLi Linux toolchain named in tools/linux/toolchain-linux.json.")
            log("Toolchain: %d Linux toolchain files match tools/linux/toolchain-linux.json" % len(native_manifest["files"]))
    synth = load_json(SDK / "synth.json")
    # Build.ps1 L323-L329. The installed-compiler hash (pi32_compiler_sha256 == clang.exe)
    # is a statement about the Windows binary; in native mode it cannot hold for the Linux
    # clang, so only that comparison is skipped. The two SDK files are still required to
    # agree with each other, and every other synth.json check is kept.
    compiler_ok = synth.get("pi32_compiler_sha256") == external["files"]["bin/clang.exe"]
    if (synth.get("schema") != 4 or synth.get("api") != 8 or synth.get("kernel_abi") != 3
            or synth.get("block_frames") != 128 or synth.get("sample_rate") != 44100
            or not compiler_ok
            or synth.get("sdk_block_sha256") != sha256_file(SDK / "include/fm1_block.h")
            or synth.get("native_sha256") != sha256_file(SDK / "lib/libfm1_engine.a")):
        raise BuildError("Native DSP kernels and SDK audio contracts do not match. Install a matching SDK package.")
    if toolchain.kind == "wine":
        if sha256_file(toolchain.path("clang")) != synth["pi32_compiler_sha256"]:
            raise BuildError("Installed clang.exe does not match synth.json pi32_compiler_sha256.")
    engine_h = (ROOT / "app/synth/engine.h").read_text(encoding="utf-8")
    if not re.search(r"(?m)^#define FM1_DSP_ABI 3U\s*$", engine_h):
        raise BuildError("Unsupported native DSP ABI.")
    for name, digest in (synth.get("portable_contracts") or {}).items():
        if not re.fullmatch(r"[A-Za-z0-9_]+\.inc", name) or digest != sha256_file(ROOT / "app/synth" / name):
            raise BuildError("Fixed DSP coefficients differ from the native kernels. Matching kernels are required for this coefficient change.")
    if not synth.get("sram_required") or not synth.get("sram_optional"):
        raise BuildError("Native DSP SRAM contract is missing.")
    for name in list(synth["sram_required"]) + list(synth["sram_optional"]):
        if not re.fullmatch(r"[A-Za-z_][\w.$]*", name):
            raise BuildError("Invalid DSP SRAM symbol.")
    # Build.ps1 L340-L344: every manifest file must live under sdk/ and match its hash.
    # (This is one of the Windows-only path checks: StartsWith($sdk + '\').)
    sdk_prefix = str(SDK) + os.sep
    for name, digest in manifest["files"].items():
        full = (ROOT / name).resolve()
        if not str(full).startswith(sdk_prefix) or sha256_file(full) != digest:
            raise BuildError("SDK payload changed: " + name)
    # Build.ps1 L345-L352: no unexpected files under sdk/.
    expected = set(manifest["files"])
    for path in SDK.rglob("*"):
        if path.is_file():
            relative = path.relative_to(ROOT).as_posix()
            if relative != "sdk/manifest.json" and relative not in expected:
                raise BuildError("Unexpected SDK file: " + relative)
    log("SDK: %d manifest files verified, no unexpected files" % len(manifest["files"]))
    return manifest, synth


# ---- Test-Firmware (Build.ps1 L31-L225) -----------------------------------------------------
NM_LINE = re.compile(r"^([0-9a-fA-F]+)[ \t]+(([0-9a-fA-F]+)[ \t]+)?([A-Za-z])[ \t]+([^\r]+)")
SRAM_BEGIN, SRAM_END = 0x01C00000, 0x01C80000


def test_firmware(toolchain, build, variant, synth, extra, log):
    """Inspect the linked image. Keep these checks independent of feature flags."""
    elf = build / "sdk.elf"
    report = build / "firmware-report.json"
    write_text(report, '{"passed":false}')
    symbols = toolchain.run("nm", ["--print-size", str(elf)], cwd=build, capture=True)
    info = {}
    heap = {}
    usb_midi = False
    for line in symbols.splitlines():
        m = NM_LINE.match(line)
        if not m:
            continue
        name = m.group(5)
        address = int(m.group(1), 16)
        size = int(m.group(3), 16) if m.group(3) else None
        kind = m.group(4)
        info[name] = {"address": address, "size": size, "kind": kind}
        if re.match(r"^(__fat_|fat_sdfile_fat_ops$|jl_fat_vfs_ops$|nor_sdfile_vfs_ops$|sdfile_ext_vfs_ops$)", name):
            raise BuildError("Unused filesystem entered the fixed Flash runtime: " + name)
        if "HEAP" in name or ("heap" in name and kind == "A"):
            heap[name] = address
        if name.startswith("lv_"):
            raise BuildError("Unexpected LVGL runtime: " + name)
        if re.search(r"usb.*midi|midi.*usb", name):
            usb_midi = True

    def size_of(name):
        # PowerShell treats a $null size as 0 in numeric comparisons.
        return info[name]["size"] or 0

    # Table entries are discovered by ranges, so native archives must retain them.
    registrations = [("initcall", 4, 4), ("early_initcall", 16, 4), ("late_initcall", 4, 4),
                     ("platform_initcall", 4, 4), ("module_initcall", 4, 4), ("sys_event_handler", 12, 12),
                     ("syscfg_ops", 84, 28), ("lp_target", 72, 8), ("sys_cpu_timer", 16, 16),
                     ("clock_critical_handler", 16, 8), ("vfs_ops", 120, 120),
                     ("audio_decoder", 56, 56), ("audio_hwaccel", 32, 32)]
    for name, minimum, stride in registrations:
        begin, end = "_%s_begin" % name, "_%s_end" % name
        if begin not in info or end not in info:
            begin, end = "%s_begin" % name, "%s_end" % name
        if begin not in info or end not in info:
            raise BuildError("Runtime registration range missing: " + name)
        size = info[end]["address"] - info[begin]["address"]
        if size < minimum or size % stride:
            raise BuildError("Runtime registration table invalid: " + name)
        if name == "vfs_ops" and size != 120:
            raise BuildError("Expected only the internal Flash filesystem registration.")
    required = ["fm1_r_7919135c9963", "fm1_r_1f449c2c7b8f", "vSoftwareInterruptISR", "fm1_r_e7d3da61dac2", "fm1_r_1993f9b103e3", "fm1_r_05431712fb7b",
                "fm1_update_init", "fm1_update_message", "fm1_update_busy", "fm1_build_id", "fm1_flash_init",
                "sdfile_vfs_ops", "sdfile_init", "syscfg_vm_init", "syscfg_btif_init",
                "wifi_get_xosc", "wifi_get_mcs_dgain", "wifi_get_pa_trim_data",
                "connectivity_wl82_bluetooth_start", "ble_profile_init", "att_server_init",
                # Classic Tabby Task 06 (a): the BLE page is gone, so the SDK's BLE client wrappers
                # (fm1_ble_scan / connect / disconnect / get_device) are unreferenced and dropped by
                # the linker; the real discovery implementation below is still required.
                "fm1_ble_set_role", "fm1_ble_get_status",
                "audio_app_usb_microphone_enable", "audio_app_usb_speaker_enable",
                "connectivity_audio_usb_microphone_enable", "connectivity_audio_usb_speaker_enable",
                "audio_app_bluetooth_open", "sbc_decoder", "sbc_hwaccel", "avdtp_packet_handler", "bt_get_local_name", "bt_get_mac_addr",
                "fm1_bluetooth_configure",   # fm1_bluetooth_get_status went with the BLE page (Task 06 a)
                "groove_tuning_capture", "groove_tuning_apply", "groove_project_apply_edit"]
    for name in required:
        if name not in info:
            raise BuildError("Required runtime symbol absent: " + name)
    # Incoming connections also work with inert client stubs. Require the
    # fixed SDK's real discovery paths for A2DP reconnect and BLE HOST.
    for name in ("sdp_send_cmd_iotl", "sdp_master_packet_handler", "gatt_client_discover_primary_services_by_uuid128"):
        if name not in info or info[name]["kind"] not in ("T", "t", "N", "n") or size_of(name) <= 16:
            raise BuildError("Bluetooth discovery implementation missing or stubbed: " + name)
    # The instrument and UI must retain their real callbacks.
    for name in ("fm1_r_dee1ea411566", "fm1_r_d16405f329ed", "fm1_r_f03cc16d330d", "fm1_r_1993f9b103e3",
                 "fm1_io_trs_midi_enabled", "fm1_r_05431712fb7b", "fm1_r_0aa010fe1de1", "fm1_r_33d5e5b63b6b", "fm1_app_sysex"):
        # This vendor nm prints SRAM-section functions as N, Flash text as T.
        if name not in info or info[name]["kind"] not in ("T", "N", "t", "n") or not size_of(name):
            raise BuildError("Application callback was lost or replaced by a weak default: " + name)
    if size_of("fm1_build_id") != 32:
        raise BuildError("Browser update build identity must be exactly 32 bytes.")
    if "fm1_update_identity" not in info or size_of("fm1_update_identity") != 27:
        raise BuildError("SMK37 update identity must be exactly 27 bytes.")
    if not usb_midi:
        raise BuildError("USB MIDI runtime is missing.")
    # Check the fixed platform ABI.
    for name in ("CurrentTCB", "highCurrentTCB", "xIdleTaskHandle"):
        if name not in info or size_of(name) != 4:
            raise BuildError("Platform RTOS ABI is invalid: " + name)
    for name in ("__rt_local_irq_disable", "__rt_local_irq_enable", "bt_lock_cnt",
                 "fm1_r_83b2de623a96", "fm1_r_c327ea18da09", "cpuSuspend", "audio_app_worker", "edr_name", "ble_name",
                 "a2dp_source_event_handler", "a2dp_source_sbc_codec", "hfp_profile_init", "hfp_ag_profile_init",
                 "spp_user_send_data", "avrcp_player_event", "hid_diy_regiest_callback", "obex_connection_req",
                 "pan_cmd_io_ctrl", "gatt_client_discover_primary_services", "ancs_client_init", "ams_client_init",
                 "sdio_host_init", "wl30_sdio_claim_irq", "wl30_sdio_release_irq", "wifi_on", "wifi_off",
                 "wifi_rx_task", "wifi_tx_task", "ui_yuv420_to_rgb565_pairs", "ui_tiny_ttf_pack_scanline"):
        if name in info:
            raise BuildError("Unsupported platform runtime entered SMK37: " + name)
    link_map = (build / "sdk.map").read_text(encoding="utf-8", errors="replace")
    if variant["frozen"] + "(" not in link_map:
        raise BuildError("Fixed native SDK archive missing.")
    if "libfm1_runtime.a(" in link_map:
        raise BuildError("Only the fixed music/BLE SDK may be linked.")
    for name in ("/system.a(", "audio_server.a(", "media_app.a(", "btstack.a(", "lib_ui.a(", "libjpeg_decode_only.a("):
        if name in link_map:
            raise BuildError("Unsupported SMK37 link input: " + name)
    for member in ("a2dp_source", "ams_client", "ancs_client", "avctp", "avrcp", "bip", "bnep", "bt_audio",
                   "client_user", "hfp_ag_profile", "hfp_profile", "hid", "iap_profile", "obex", "opp", "pan",
                   "pbg_profile", "rfcomm", "spp_profile", "spp_update_profile", "spp_user", "vCard"):
        if ".a(%s.c.o)" % member in link_map:
            raise BuildError("Unsupported SMK37 link member: " + member)
    acl = {}
    for direction in ("tx", "rx"):
        begin = "acl_%s_pool" % direction
        end = begin + "_end"
        if begin not in info or end not in info:
            raise BuildError("Required controller pool missing: " + begin)
        acl[direction] = info[end]["address"] - info[begin]["address"]
    if acl["tx"] < 1024 or acl["rx"] < 4096:
        raise BuildError("Classic ACL pools too small; need 1024/4096 bytes.")
    m = re.search(r"0x([0-9a-fA-F]+)[^\r\n]*_MALLOC_SIZE[ ]*=", link_map)
    if not m:
        raise BuildError("Cannot find runtime heap in link map.")
    heap_bytes = int(m.group(1), 16)
    if heap_bytes < 49152:
        raise BuildError("SMK37 runtime heap is %d bytes; need at least 49152." % heap_bytes)
    callbacks = ["fm1_r_e7d3da61dac2", "fm1_r_1993f9b103e3", "fm1_r_05431712fb7b", "fm1_r_ffe3f82683f6", "fm1_audio_irq", "fm1_flash_worker_prepare",
                 "fm1_r_7e12ed19990d", "fm1_r_74310ca1fed9",
                 "fm1_engine_render", "fm1_engine_output_level", "fm1_audio_copy", "fm1_output_mix",
                 "fm1_usb_audio_read", "fm1_bluetooth_audio_read", "fm1_usb_audio_write", "connectivity_audio_get_speaker_volume",
                 "connectivity_audio_get_mic_volume"] + list(extra)
    for name in list(synth.get("sram_optional") or []) + list(synth.get("native_sram_optional") or []):
        if name in info:
            callbacks.append(name)
    callbacks += ["cpu_enter_sfc_critical", "cpu_exit_sfc_critical", "enter_spi_code", "exit_spi_code", "fm1_r_da3931a5b7a8", "sfc_drop_cache"]
    # Optional retained transport helpers also have to reside in SRAM.
    # emu2149 helpers can inline into the mandatory psg_* SRAM callbacks.
    for name in ("audio_app_usb_mix", "audio_app_usb_record", "audio_app_usb_replace_input",
                 "render_stereo", "effects_render", "effects_sample", "sequence_event", "clock_publish",
                 "groove_arp_event", "groove_arp_running", "engine_note"):
        if name in info:
            callbacks.append(name)
    engine_ready = "fm1_r_0aa010fe1de1" in info and info["fm1_r_0aa010fe1de1"]["address"] > 0
    if engine_ready:
        callbacks.append("fm1_r_0aa010fe1de1")
        if "fm1_r_33d5e5b63b6b" in info and info["fm1_r_33d5e5b63b6b"]["address"] > 0:
            callbacks.append("fm1_r_33d5e5b63b6b")
    for name in callbacks:
        if name not in info:
            raise BuildError("Audio callback absent: " + name)
        if info[name]["address"] < SRAM_BEGIN or info[name]["address"] >= SRAM_END:
            raise BuildError("Audio callback is outside internal SRAM: " + name)
    for name in ("scan_isr", "scan_soft_isr", "smk37_adc_irq", "key_scan", "encoder_scan", "pad_prc", "keymap", "encodermap",
                 "encoder_delta", "pad_velocity", "smk37_pad_history_step"):
        if name not in info or info[name]["address"] < SRAM_BEGIN or info[name]["address"] >= SRAM_END:
            raise BuildError("Panel scan code or wiring table is outside internal SRAM: " + name)
    # ---- ELF section walk (Build.ps1 L170-L213) ----
    data = elf.read_bytes()

    def check_range(offset, count):
        if offset < 0 or count < 0 or offset > len(data) or count > len(data) - offset:
            raise BuildError("Truncated ELF.")

    def read_u16(offset):
        check_range(offset, 2)
        return struct.unpack_from("<H", data, offset)[0]

    def read_u32(offset):
        check_range(offset, 4)
        return struct.unpack_from("<I", data, offset)[0]

    check_range(0, 52)
    if data[0:6] != b"\x7fELF\x01\x01":
        raise BuildError("Expected ELF32 little endian.")
    entry = read_u32(24)
    if (entry != 0x02000120 or "_start" not in info or info["_start"]["address"] != entry
            or "_text_rodata_begin" not in info or info["_text_rodata_begin"]["address"] != entry):
        raise BuildError("Firmware startup must match the fixed ROM entry and the first packaged instruction.")
    table, stride, count, strings_index = read_u32(32), read_u16(46), read_u16(48), read_u16(50)
    if stride < 40 or not count or strings_index >= count:
        raise BuildError("Invalid ELF section table.")
    check_range(table, stride * count)
    strings_header = table + strings_index * stride
    strings_offset, strings_bytes = read_u32(strings_header + 16), read_u32(strings_header + 20)
    check_range(strings_offset, strings_bytes)
    sections = []
    payload = 0
    app_image = 0
    for i in range(count):
        header = table + i * stride
        name_offset, sh_type, flags = read_u32(header), read_u32(header + 4), read_u32(header + 8)
        address, offset, size = read_u32(header + 12), read_u32(header + 16), read_u32(header + 20)
        if sh_type != 8:
            check_range(offset, size)
        if not (flags & 2) or not size:
            continue
        if name_offset >= strings_bytes:
            raise BuildError("ELF section name is outside string table.")
        start = strings_offset + name_offset
        end = start
        while end < strings_offset + strings_bytes and data[end]:
            end += 1
        if end >= strings_offset + strings_bytes:
            raise BuildError("Unterminated ELF section name.")
        name = data[start:end].decode("ascii")
        if not re.fullmatch(r"\.(text|data|bss|ram0_data|ram0_bss|boot_info|cache_ram_data|cache_ram_bss)", name):
            raise BuildError("Unsupported allocated section: " + name)
        nobits = sh_type == 8
        if not nobits:
            payload += size
            if re.fullmatch(r"\.(text|data|ram0_data|cache_ram_data)", name):
                app_image += size
            elif name != ".boot_info":
                raise BuildError("Allocated section is not covered by SMK37 packaging: " + name)
        sections.append({"name": name, "address": address, "bytes": size, "nobits": nobits})
    result = {"passed": True, "elf_sha256": sha256_file(elf), "allocated_image_bytes": payload, "app_image_bytes": app_image,
              "startup_entry_verified": True, "startup_entry": entry,
              "instrument_ready": engine_ready,
              "image_definition": "Sum of ELF allocated non-NOBITS sections; excludes bootloader/filesystem packaging",
              "sections": sections, "heap_symbols": heap, "runtime_heap_bytes": heap_bytes, "minimum_runtime_heap_bytes": 49152,
              "classic_acl_tx_bytes": acl["tx"], "classic_acl_rx_bytes": acl["rx"], "registration_tables_verified": True,
              "rtos_abi_verified": True,
              "audio_callbacks_in_sram": True, "extra_audio_symbols_in_sram": list(extra), "bluetooth_and_usb_midi_linked": True,
              "usb_audio_playback_and_capture_linked": True, "bluetooth_audio_absent": False, "ble_roles": "peripheral/central",
              "lvgl_absent": True,
              "active_bluetooth_discovery_linked": True,
              "application_callbacks_verified": True, "board_validation": "not performed"}
    write_text(report, to_json(result))
    log("FM1: %d bytes app image; SRAM/BLE/USB checks passed" % app_image)
    return result


# ---- Package-Firmware (Build.ps1 L227-L261) -------------------------------------------------
def package_firmware(toolchain, build, model, variant, firmware_product, packager, log):
    generated = build / "generated"
    elf = build / "sdk.elf"
    before = sha256_file(elf)
    output = generated / ("SMK37_%s_OPEN.fwsc" % model.upper())
    complete = False
    try:
        if struct.unpack_from("<I", elf.read_bytes(), 24)[0] != 0x02000120:
            raise BuildError("Package entry must match the verified SMK37 firmware entry.")
        image = bytearray()
        for section in ("text", "data", "ram0_data", "cache_ram_data"):
            toolchain.run("objcopy", ["-O", "binary", "-j", "." + section, str(elf), "%s.bin" % section], cwd=generated)
            image += (generated / ("%s.bin" % section)).read_bytes()
        image_file = generated / "app-image.bin"   # kept for the package equivalence test
        image_file.write_bytes(image)
        if packager == "pwsh":
            # Drive the original sdk/Package.cs through PowerShell Add-Type (equivalence path).
            report_file = generated / "package-report-pwsh.json"
            cmd = ["pwsh", "-NoProfile", "-File", str(HERE / "package-pwsh.ps1"), "-Image", str(image_file),
                   "-Resources", str(SDK / "tools/pack"), "-Output", str(output), "-UserBytes", str(variant["user_bytes"]),
                   "-Product", firmware_product, "-Report", str(report_file)]
            subprocess.run(cmd, check=True, cwd=str(generated))
            layout = load_json(report_file)
        else:
            layout = fm1_package.create(bytes(image), str(SDK / "tools/pack"), str(output), variant["user_bytes"], firmware_product)
        if not output.is_file() or sha256_file(elf) != before:
            raise BuildError("Firmware packaging did not produce a matching image.")
        write_text(build / "package-report.json", to_json(layout))
        log("Offline package fits 1 MiB: image %d, VM %d, user %d bytes" % (layout["FLASH_BIN_SIZE"], layout["VM_REAL_SIZE"], layout["user_bytes"]))
        complete = True
    finally:
        for name in ("text.bin", "data.bin", "ram0_data.bin", "cache_ram_data.bin"):
            path = generated / name
            if path.exists():
                path.unlink()
        if not complete and output.exists():
            output.unlink()


# ---- Main build (Build.ps1 L262-L465) -------------------------------------------------------
def invalidate_outputs(build, official, model):
    """Build.ps1 L262-L281: remove the previous build's successful outputs before anything is
    verified or compiled (v0.6: moved out of build_firmware unchanged, so --check-only can skip it)."""
    write_text(build / "firmware-report.json", '{"passed":false}')
    write_text(build / "package-report.json", '{"board_access":false,"fits":false}')
    write_text(build / "web-package-report.json", '{"integrated":false,"board_access":false}')
    for name in ("sdk.elf", "sdk.map", "build-identity.json", "compile_commands.json", "link-arguments.json"):
        if (build / name).exists():
            (build / name).unlink()
    if (official / "SHA256SUMS.txt").exists():
        (official / "SHA256SUMS.txt").unlink()
    old_web = official / "SMK37-Open-Source.html"
    if old_web.exists():
        write_text(old_web, '<!doctype html><meta charset="utf-8"><title>SMK37 OPEN</title><p>Build incomplete. Run build.bat --package successfully before distributing this page.</p>')
    for name in ("SMK37_%s_OPEN.fwsc" % model.upper(), "SMK37_%s_OPEN.fw" % model.upper()):
        if (build / "generated" / name).exists():
            (build / "generated" / name).unlink()


# ---- v0.6: the compile database for host tools (make check, make lint) ---------------------
# Options only the pi32v2 compiler knows or that mean nothing to a syntax pass on the host. The
# flag after "-target" and after "-mllvm" goes with it. Everything else (-D, -I, -O, -W, -f...) stays.
TARGET_ONLY_FLAGS = {"-integrated-as", "-mcpu=r3", "-mfprev1", "-fallow-pointer-null", "-fprefer-gnu-section",
                     "-femulated-tls", "-cl-single-precision-constant", "-flto"}
# What the host tools need in addition: the SDK's libc headers choose their byte order from the
# target's predefined macros (sdk/include/libc/machine/ieeefp.h: "#error Endianess not declared"
# under cppcheck, which predefines nothing), and app/board's interrupt handlers carry the target's
# __attribute__((interrupt(""))), which the x86 clang rejects; on the host it becomes "unused".
HOST_EXTRA_FLAGS = ["-D__IEEE_LITTLE_ENDIAN", "-Dinterrupt(x)=unused"]


def host_compiler():
    """A host clang if there is one (clang-tidy wants a clang driver line), else cc."""
    import glob
    found = shutil.which("clang")
    if found:
        return found
    candidates = sorted(glob.glob("/usr/lib/llvm-*/bin/clang"), reverse=True)
    return candidates[0] if candidates else (shutil.which("cc") or "cc")


def host_compile_commands(commands):
    """The build's compile_commands entries with the target-only flags removed and the host
    compiler named. The source, output, defines, include paths and warning flags are the build's."""
    cc = host_compiler()
    out = []
    for entry in commands:
        arguments = [cc]
        skip = False
        for flag in entry["arguments"][1:]:
            if skip:
                skip = False
                continue
            if flag in ("-target", "-mllvm"):
                skip = True
                continue
            if flag in TARGET_ONLY_FLAGS:
                continue
            arguments.append(flag)
        out.append({"directory": entry["directory"], "file": entry["file"], "output": entry["output"],
                    "arguments": arguments + HOST_EXTRA_FLAGS})
    return out


def write_compile_databases(commands, build, args, log):
    """compile_commands.json (the real commands, as before v0.6) and compile_commands.host.json next
    to it; the host one also at build/compile_commands.json when the build root is the default."""
    write_text(build / "compile_commands.json", to_json(commands))
    host = to_json(host_compile_commands(commands))
    write_text(build / "compile_commands.host.json", host)
    if not args.build_root:
        write_text(ROOT / "build/compile_commands.json", host)
    log("Compile database: %s (+ .host.json for cppcheck, clang-tidy, clangd)" % (build / "compile_commands.json"))


def build_firmware(args, log):
    model = args.model
    profile = model
    check = bool(getattr(args, "check_only", False))
    # v0.6: --check-only works in build/check/<model>/ (or under --build-root) so that build/<model>/
    # keeps the last real build's outputs; it only ever writes the compile databases there.
    if args.build_root:
        build = Path(args.build_root).resolve() / profile
    elif check:
        build = ROOT / "build/check" / profile
    else:
        build = ROOT / "build" / profile
    official = ROOT / "build/official-web" / model
    native_manifest = load_json(args.toolchain_manifest) if args.toolchain_kind == "native" else None
    toolchain = Toolchain(args.toolchain_kind, args.toolchain, wine=args.wine, wine_prefix=args.wine_prefix,
                          native_manifest=native_manifest)

    # Invalidate stale successful output before validating build inputs (L262-L281).
    # v0.6: not in --check-only mode, which produces no output to invalidate and must leave the
    # distribution page alone. (Note for sessions: a real build rewrites build/official-web/<model>/
    # SMK37-Open-Source.html with a placeholder, as Build.ps1 does, so `make firmware` after
    # `make package` invalidates the page until the next `make package`; docs/DEV_CHECKS.md.)
    build.mkdir(parents=True, exist_ok=True)
    if check:
        log("Check only: %s" % build)
    else:
        invalidate_outputs(build, official, model)
    if args.package:
        validate_source_url(args.source_url)   # L282-L288: fail before compiling anything

    # Release identity from app/version.h (L290-L302).
    version_header = (ROOT / "app/version.h").read_text(encoding="utf-8")
    m = re.search(r'(?m)^#define FM1_RELEASE_VERSION "(V(?:0[1-9]|[1-9][0-9]{1,2}))"\s*$', version_header)
    if not m:
        raise BuildError("Set FM1_RELEASE_VERSION in app/version.h.")
    release_version = m.group(1)
    product_prefix = "SMK-37 Pro_" if model == "pro" else "SMK-37 Elite_"
    product_macro = "FM1_UPDATE_PRODUCT_" + model.upper()
    m = re.search(r'(?m)^#define %s "(%s8[0-9]{6})"\s*$' % (product_macro, re.escape(product_prefix)), version_header)
    if not m:
        raise BuildError("Set a compatible %s in app/version.h." % product_macro)
    firmware_product = m.group(1)
    if firmware_product != product_prefix + str(8000000 + int(release_version[1:])):
        raise BuildError("The model update identity and FM1_RELEASE_VERSION must name the same release.")
    log("Build SMK37 Open " + release_version)
    # v0.7: the Classic Tabby display version (the git tag), separate from the identity above.
    try:
        display = compute_display_version(ROOT, args.display_version)
    except DisplayVersionError as error:
        raise BuildError(str(error))
    log("Display version " + display)

    manifest, synth = verify_inputs(toolchain, native_manifest, log)

    variant_name = "release"
    variant = {"user_bytes": 536576, "frozen": "sdk/lib/libfm1_engine.a", "update_family": 8 if model == "pro" else 9}
    include = ["sdk/include", "sdk/include/libc", "app/synth", "sdk/config", "app", "app/board"]
    # Sources: app/**/*.c and *.S, excluding app/synth/ (L356-L357; the exclusion is another
    # Windows-only '\' path check upstream). Sorted by full name.
    synth_dir = str((ROOT / "app/synth").resolve()) + os.sep
    candidates = [p for p in (ROOT / "app").rglob("*") if p.is_file() and p.suffix in (".c", ".S")
                  and not str(p.resolve()).startswith(synth_dir)]
    sources = [p.relative_to(ROOT).as_posix() for p in sorted_paths(candidates, args.identity_sort)]
    extra = ["groove_sequence_render", "groove_sequence_clock", "groove_sequence_position", "groove_sequence_transport",
             "fm1_sea_decode_groups", "fm1_codec_sea_mono_s16_run"] + list(synth["sram_required"]) + [
        "synth_dx7_render", "synth_dx7_midi", "synth_dx7_key", "fm1_dx7_panic", "fm_exp2_fixed", "bass303_bank_render",
        "bass303_bank_key", "bass303_bank_set", "drum808_kit_render", "drum808_kit_trigger", "psg_render", "psg_key", "psg_midi",
        "psg_panic", "psg_set", "psg_get", "pluck_render", "pluck_key", "pluck_midi", "pluck_panic", "pluck_set", "pluck_get",
        "fm1_mix128", "fm1_mix_mono_stereo128", "fm1_bus_output128", "fm1_master_mix128", "fm1_master_gain", "fm1_declick128",
        "fm1_render_begin", "fm1_render_end", "synth_dx7_active", "bass303_bank_active", "drum808_kit_active", "psg_active",
        "pluck_active", "sampledrum_active", "synth_dx7_limit", "psg_limit", "pluck_limit", "sampledrum_limit",
        "bass303_advance_idle", "fm1_send128", "fm1_fx_render", "fm1_fx_clear", "fm1_fx_active", "sampledrum_render",
        "sampledrum_trigger", "sampledrum_panic", "psg_active_chips"]
    if not check:   # v0.6: a check writes no objects, so it makes and clears no object directory
        (build / "obj").mkdir(parents=True, exist_ok=True)
        (build / "generated").mkdir(parents=True, exist_ok=True)
        # All application units are rebuilt. Remove objects for deleted/renamed sources (L363-L365;
        # the StartsWith($root + '\build\') guard is the third Windows-only path check).
        object_directory = (build / "obj").resolve()
        allowed_parent = (Path(args.build_root).resolve() if args.build_root else ROOT / "build")
        if not str(object_directory).startswith(str(allowed_parent) + os.sep):
            raise BuildError("Invalid object directory.")
        for path in object_directory.iterdir():
            if path.is_file():
                path.unlink()
    flags = ["-target", "pi32v2", "-integrated-as", "-mcpu=r3", "-mfprev1", "-Wuninitialized",
             "-Wno-invalid-noreturn", "-fno-common", "-flto", "-fallow-pointer-null", "-fprefer-gnu-section",
             "-femulated-tls", "-Wno-shift-negative-value", "-Wframe-larger-than=2560", "-fms-extensions",
             "-fno-unwind-tables", "-ffunction-sections", "-fdata-sections", "-fmessage-length=0",
             "-cl-single-precision-constant", "-mllvm", "-pi32v2-large-program=true", "-D__GCC_PI32V2__", "-O2"]
    flags.append("-DSMK37_MODEL_%s=1" % model.upper())
    flags.append('-DFM1_DISPLAY_VERSION="%s"' % display)   # v0.7: the boot screen draws it
    for d in include:
        flags.append("-I" + str(ROOT / d))
    objects = []
    commands = []
    object_index = 0
    for source in sources:
        input_file = str(ROOT / source)
        # The index keeps nested paths and non-ASCII names from colliding after sanitising.
        output = "obj/%d_%s.obj" % (object_index, re.sub(r"[^a-zA-Z0-9._-]", "_", source))
        object_index += 1
        options = list(flags)
        # This PI32 LTO plugin can discard application definitions when a
        # native SDK object has weak defaults. Keep user entry units native.
        if source in ("app/screen.c", "app/transfer.c", "app/midi_router.c"):
            options.append("-fno-lto")
        if source in ("app/board/panel.c", "app/board/scan.c"):
            options += ["-fno-lto", "-fno-pic"]
        options += ["-fwrapv", "-fno-fast-math", "-ffp-contract=off"]
        # Storage and screen run only from control; keep audio DSP on O2.
        if source in ("app/project.c", "app/transfer.c", "app/samples.c", "app/screen.c", "app/presets.c", "app/midi_router.c",
                      "app/smk37_controls.c", "app/fm_library.c", "app/fm_factory.c",
                      # Classic Tabby Task 06 (b): the song sequencer and its storage. Its audio tick is a
                      # few hundred instructions per block; at -O2 the eight-track loops were unrolled
                      # into 4 KB more flash and SRAM than the same code at -Oz.
                      "app/song.c", "app/song_storage.c", "app/timed_note.c"):
            options.append("-Oz")
        arguments = options + ["-MMD", "-MF", output + ".d", "-c", input_file, "-o", output]
        if check:
            # v0.6: the same options, the unit parsed and type-checked only (no object, no depfile, no IR).
            log("Check " + source)
            toolchain.run("clang", options + ["-fsyntax-only", input_file], cwd=build)
        else:
            log("Compile " + source)
            toolchain.run("clang", arguments, cwd=build)
        objects.append(output)
        commands.append({"directory": str(build), "file": input_file, "output": str(build / output),
                         "arguments": [toolchain.path("clang")] + arguments})
    if check:
        # v0.6: the databases record the real build commands (not the -fsyntax-only ones), so the
        # host tools see what the build sees. Nothing else is written.
        write_compile_databases(commands, build, args, log)
        log("Check passed: %d units through %s -fsyntax-only (no identity unit, no link, no package)"
            % (len(sources), Path(toolchain.path("clang")).name))
        return {"checked": len(sources)}
    # The device reports this source/SDK build identity after a browser update.
    # It is distinct from the final package SHA-256 (which covers every byte). (L398-L416)
    identity_inputs = [profile, sha256_file(SDK / "manifest.json")]
    app_files = [p for p in (ROOT / "app").rglob("*") if p.is_file()]
    for path in sorted_paths(app_files, args.identity_sort):
        identity_inputs.append(path.relative_to(ROOT).as_posix() + ":" + sha256_file(path))
    if display != release_version:   # v0.7: a re-tag of unchanged sources is a new build id
        identity_inputs.append("display_version:" + display)
    build_identity = sha256_text("\n".join(identity_inputs))
    id_bytes = ["0x" + build_identity[i:i + 2] for i in range(0, 64, 2)]
    if variant["update_family"] not in (8, 9) or variant["user_bytes"] < 4096 or variant["user_bytes"] % 4096:
        raise BuildError("Invalid fixed firmware layout.")
    identity_source = ('#include "layout.h"\n'
                       + "const struct fm1_firmware_layout fm1_layout = {%dU,%dU};\n" % (variant["user_bytes"], variant["update_family"])
                       + "const unsigned char fm1_build_id[32] = {%s};\n" % ",".join(id_bytes)
                       + 'const unsigned char fm1_update_identity[27] = "%s";\n' % firmware_product)
    write_text(build / "generated/build_identity.c", identity_source)
    toolchain.run("clang", flags + ["-c", "generated/build_identity.c", "-o", "obj/build_identity.obj"], cwd=build)
    objects.append("obj/build_identity.obj")
    write_text(build / "build-identity.json", to_json({"profile": profile, "family": variant_name,
                                                        "release_version": release_version, "display_version": display,
                                                        "build_id": build_identity, "identity_sort": args.identity_sort}))
    # Linker script instantiation (L417-L421).
    sbc_root = "sbc_decoder" + "\n"
    linker = (SDK / "config/linker.ld.in").read_bytes().decode("utf-8")
    linker = linker.replace("@SBC_DECODER@", sbc_root).replace("@ACL_TX_EXTRA@", " + 1024").replace("@ACL_RX_EXTRA@", " + 4096")
    write_text(build / "generated/linker", linker)
    # Link line (L422-L432). Upstream refers to the SDK archives as ../../sdk/... relative
    # to build/<model>/. Keep that exact spelling when the build directory is in its default
    # place (it appears in sdk.map), otherwise use the equivalent relative path.
    sdk_rel = os.path.relpath(ROOT, build).replace(os.sep, "/")
    link = ["--plugin", toolchain.path("plugin"), "-o", "sdk.elf"] + objects + [
        "-flto", "--plugin-opt=-pi32v2-always-use-itblock=false", "--plugin-opt=-enable-ipra=true",
        "--plugin-opt=-pi32v2-merge-max-offset=4096", "--plugin-opt=-pi32v2-enable-simd=true", "--plugin-opt=mcpu=r3",
        "--plugin-opt=-global-merge-on-const", "--plugin-opt=-inline-threshold=5", "--plugin-opt=-inline-max-allocated-size=32",
        "--plugin-opt=-inline-normal-into-special-section=true", "--plugin-opt=-dont-used-symbol-list=malloc,free,sprintf,printf,puts,putchar",
        "--plugin-opt=-pi32v2-enable-rep-memop", "--plugin-opt=-emulated-tls", "--sort-common",
        "--plugin-opt=-pi32v2-large-program=true", "--plugin-opt=-pi32v2-csync-before-rti=true", "--start-group",
        "--whole-archive", sdk_rel + "/" + variant["frozen"], "--no-whole-archive",
        sdk_rel + "/sdk/lib/libc.a", sdk_rel + "/sdk/lib/libcompiler_rt.a",
        "--end-group", "--gc-sections", "-Tgenerated/linker", "-M=sdk.map", "--undefined=connectivity_wl82_bluetooth_start",
        "--undefined=audio_app_bluetooth_open", "--undefined=bt_get_local_name", "--undefined=bt_get_mac_addr"]
    write_compile_databases(commands, build, args, log)   # v0.6: was write_text(compile_commands.json) alone
    write_text(build / "link-arguments.json", to_json(link))
    log("Link %s using prebuilt SMK37 SDK" % profile)
    toolchain.run("ld", link, cwd=build)
    report = test_firmware(toolchain, build, variant, synth, extra, log)
    if args.firmware_only:
        package_firmware(toolchain, build, model, variant, firmware_product, args.packager, log)
    if args.package:
        package_firmware(toolchain, build, model, variant, firmware_product, args.packager, log)
        package_web(build, model, variant, profile, release_version, display, firmware_product, build_identity, args, log)
    log("Firmware: %s" % (build / "sdk.elf"))
    return report


# ---- -Package: workbench with embedded firmware (Build.ps1 L439-L463) ------------------------
def package_web(build, model, variant, profile, release_version, display, firmware_product, build_identity, args, log):
    """Embed the freshly packaged .fwsc and the pinned stock V16 image into the workbench.

    Writes build/<model>/web-package.json (the exact text that becomes `const FM1_PACKAGE`
    in the HTML), runs tools/linux/build-web.py --package-json, and writes
    build/<model>/web-package-report.json like Build.ps1 L459-L463. Key order follows the
    upstream [ordered] hashtables so the embedded JSON matches a Windows build apart from
    the payload itself."""
    import base64
    package_file = build / "generated" / ("SMK37_%s_OPEN.fwsc" % model.upper())
    package_bytes = package_file.read_bytes()
    stock = STOCK_V16[model]
    stock_file = SDK / "firmware" / ("SMK37-%s-V16.fwsc" % stock["name"])
    if not stock_file.is_file() or sha256_file(stock_file) != stock["sha256"]:
        raise BuildError("Factory V016 firmware differs from the official M-VAVE download.")
    stock_bytes = stock_file.read_bytes()
    stock_meta = {"schema": 1, "kind": "stock", "product": "SMK-37 %s_016" % stock["name"], "model": model,
                  "profile": "SMK37 %s Original V16" % stock["name"], "family": variant["update_family"],
                  "release_version": "V16", "build_id": stock["sha256"], "sha256": stock["sha256"],
                  "bytes": len(stock_bytes), "loader_sha256": STOCK_LOADER_SHA256,
                  "data": base64.b64encode(stock_bytes).decode("ascii")}
    web_package = {"schema": 1, "product": firmware_product, "profile": profile, "family": variant["update_family"],
                   "release_version": release_version, "display_version": display,   # v0.7: display_version is Classic Tabby's
                   "build_id": build_identity, "sha256": sha256_file(package_file),
                   "bytes": len(package_bytes), "loader_sha256": sha256_file(SDK / "tools/pack/ota.bin"),
                   "hardware_validated": False, "data": base64.b64encode(package_bytes).decode("ascii"),
                   "model": model, "stock": stock_meta}
    package_json = build / "web-package.json"
    package_json.write_bytes(json.dumps(web_package, separators=(",", ":")).encode("ascii"))
    log("Package metadata: %s (firmware %d bytes, stock V16 %d bytes)" % (package_json, len(package_bytes), len(stock_bytes)))
    # Build-Web.ps1 is invoked as a child script upstream (L458); same here, with -I so the
    # interpreter ignores the environment and the current directory.
    command = [sys.executable, "-I", str(HERE / "build-web.py"), "--package-json", str(package_json),
               "--source-url", args.source_url, "--display-version", display]
    if args.wasi_sdk:
        command += ["--wasi-sdk", args.wasi_sdk]
    log("Run build-web.py --package-json")
    result = subprocess.run(command, cwd=str(ROOT))
    if result.returncode != 0:
        raise BuildError("tools/linux/build-web.py failed (exit %d)." % result.returncode)
    web = load_json(ROOT / "build/web/web-report.json")
    if "sha256" not in web:
        raise BuildError("build-web.py did not report an integrated workbench.")
    write_text(build / "web-package-report.json", to_json({
        "integrated": True, "firmware_sha256": sha256_file(package_file), "web_sha256": web["sha256"],
        "release_version": release_version, "display_version": display, "build_id": build_identity,
        "simulator_sha256": web["simulator_sha256"],
        "simulator_source_sha256": web["simulator_source_sha256"], "simulator_bytes": web["simulator_bytes"],
        "hardware_validated": False, "board_access": False}))
    log("Distribution: %s" % web["file"])


def main(argv=None):
    parser = argparse.ArgumentParser(description="Linux port of sdk/Build.ps1 (SMK37 Open firmware build).")
    parser.add_argument("--model", choices=("pro", "elite"), default="pro")
    parser.add_argument("--firmware-only", action="store_true", help="also write the .fwsc package (Build.ps1 -FirmwareOnly)")
    parser.add_argument("--package", action="store_true",
                        help="Build.ps1 -Package: firmware + workbench with the firmware and stock V16 embedded (v0.3)")
    parser.add_argument("--source-url", default=os.environ.get("FM1_SOURCE_URL"),
                        help="--package: HTTPS URL of the matching source archive (FM1_SOURCE_URL)")
    parser.add_argument("--wasi-sdk", default=os.environ.get("FM1_WASI_SDK") or None,
                        help="--package: extracted WASI SDK 27 for the simulator (FM1_WASI_SDK; see build-web.py)")
    parser.add_argument("--toolchain-kind", choices=("wine", "native"), default=os.environ.get("FM1_TOOLCHAIN_KIND", "wine"))
    parser.add_argument("--toolchain", default=os.environ.get("FM1_PI32_TOOLCHAIN"),
                        help="Track A: pi32 directory with bin/clang.exe (FM1_PI32_TOOLCHAIN). Track B: JieLi Linux toolchain root, e.g. /opt/jieli")
    parser.add_argument("--toolchain-manifest", default=str(HERE / "toolchain-linux.json"),
                        help="Track B pinned manifest (default tools/linux/toolchain-linux.json)")
    parser.add_argument("--wine", default=os.environ.get("FM1_WINE", "wine"), help="Wine launcher for Track A")
    parser.add_argument("--wine-prefix", default=os.environ.get("WINEPREFIX", "~/.wine-jieli"), help="WINEPREFIX for Track A")
    parser.add_argument("--packager", choices=("python", "pwsh"), default="python",
                        help="python: tools/linux/package.py; pwsh: original sdk/Package.cs via PowerShell Add-Type")
    parser.add_argument("--identity-sort", choices=("ordinal", "culture"), default="ordinal",
                        help="file ordering for the source list and the build identity (see culture_sort_key)")
    parser.add_argument("--build-root", help="directory that will contain <model>/ (default: <repo>/build)")
    parser.add_argument("--source-root", help="build this source tree instead of the repository containing this script (v0.2)")
    parser.add_argument("--verify-only", action="store_true", help="run the input checks and exit")
    parser.add_argument("--display-version", default=os.environ.get("FM1_DISPLAY_VERSION") or None,
                        help="the version shown to the user (default: the git tag via tools/linux/display_version.py); v0.7")
    parser.add_argument("--check-only", action="store_true",
                        help="v0.4 (make check): every unit through the compiler with -fsyntax-only into build/check/<model>/; no link, no package")
    args = parser.parse_args(argv)
    if args.firmware_only and args.package:
        parser.error("Choose --firmware-only for local hardware tests or --package for distribution, not both.")
    if args.check_only and (args.firmware_only or args.package):
        parser.error("--check-only compiles nothing to completion; do not combine it with --firmware-only or --package.")
    if not args.toolchain:
        parser.error("--toolchain (or FM1_PI32_TOOLCHAIN) is required.")

    def log(message):
        print(message, flush=True)

    try:
        if args.source_root:
            set_source_root(args.source_root)
        if args.verify_only:
            native_manifest = load_json(args.toolchain_manifest) if args.toolchain_kind == "native" else None
            toolchain = Toolchain(args.toolchain_kind, args.toolchain, wine=args.wine, wine_prefix=args.wine_prefix,
                                  native_manifest=native_manifest)
            verify_inputs(toolchain, native_manifest, log)
            log("Verification passed.")
            return 0
        build_firmware(args, log)
        return 0
    except BuildError as error:
        sys.stderr.write("error: %s\n" % error)
        return 1


if __name__ == "__main__":
    sys.exit(main())
