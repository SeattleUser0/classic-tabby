#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/build-web.py — Linux port of tools/Build-Web.ps1 (SMK37 Open web workbench)

Purpose
    Build the browser workbench exactly as tools/Build-Web.ps1 does on Windows, but with
    the Linux x86_64 WASI SDK 27 instead of the Windows one, and without PowerShell,
    curl.exe or tar.exe:

      * the simulator (web/engine, web/synth, third_party/synth and the app sources
        without app/board) is compiled to build/web/simulator.wasm with the same clang
        options, defines (-DFM1_HOST_TEST -DFM1_OPEN_WEB), warnings-as-errors and
        wasm-ld settings (reactor model, 128 KiB stack, 4 MiB initial / 32 MiB max memory);
      * the same build cache (build/web/simulator.json, schema 2) keyed on the source
        hash and a toolchain stamp;
      * the same HTML assembly from sdk/Update.html.in with the seven /*FM1_*/
        placeholders, giving build/preview/index.html for -LocalPreview, or
        build/official-web/<model>/SMK37-Open-Source.html when a package JSON is given.

    Differences from Build-Web.ps1, all on the tool side, none in the inputs:
      * WASI SDK: wasi-sdk-27.0-x86_64-linux.tar.gz (SHA-256 pinned below) instead of
        wasi-sdk-27.0-x86_64-windows.tar.gz. Both carry clang 20.1.8-wasi-sdk and the same
        wasi-sysroot. Set FM1_WASI_SDK (or --wasi-sdk) to an extracted copy; otherwise the
        archive is fetched with curl into build/tools/, hash-checked and extracted with tar
        (replacing the curl.exe / tar.exe calls, L51-L55).
      * The toolchain stamp (cache key only, L67-L68) uses file size and mtime in
        nanoseconds instead of .NET LastWriteTimeUtc ticks.
      * HtmlEncode (L128, L141) is re-implemented to .NET WebUtility rules (& < > " ' and
        U+00A0..U+00FF as numeric entities).
      * The source hash includes 'tools/Build-Web.ps1' exactly as upstream does (L33), so
        the simulator source_sha256 stays comparable with the official release; this
        script is deliberately NOT part of that hash.

    Line references ("Build-Web.ps1 L51") point at the upstream script.

Usage (from the repository root)
    python3 tools/linux/build-web.py --local-preview            # build/preview/index.html
    FM1_WASI_SDK=/path/to/wasi-sdk-27.0-x86_64-linux python3 tools/linux/build-web.py --local-preview
    python3 tools/linux/build-web.py --package-json build/pro/web-package.json --source-url https://...

Version: 0.2

Revision log
    v0.2  2026-11-04  Classic Tabby Task 08 (version display): --display-version (else
                      tools/linux/display_version.py: the git tag) is passed to the simulator
                      compile as -DFM1_DISPLAY_VERSION (the simulated boot screen draws it),
                      keyed into the wasm cache (simulator.json schema 3), written as
                      display_version into FM1_SIMULATOR and web-report.json, and required
                      to equal the package's display_version. release_version is unchanged.
    v0.1  2026-11-01  Initial port of tools/Build-Web.ps1 (Task 01, Step 6). Local preview
                      and package modes; Linux WASI SDK 27 pinned.
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

# v0.2: the display version module next to this script (python -I keeps the directory off sys.path).
sys.path.insert(0, str(Path(__file__).resolve().parent))
from display_version import display_version as compute_display_version, DisplayVersionError  # noqa: E402

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent

# Pinned Linux WASI SDK 27 (Build-Web.ps1 L48 pins the Windows archive 4a576c13…).
WASI_SDK_URL = "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-27/wasi-sdk-27.0-x86_64-linux.tar.gz"
WASI_SDK_SHA256 = "b7d4d944c88503e4f21d84af07ac293e3440b1b6210bfd7fe78e0afd92c23bc2"
WASI_SDK_DIRNAME = "wasi-sdk-27.0-x86_64-linux"


class WebBuildError(Exception):
    """Equivalent of a PowerShell `throw` in Build-Web.ps1."""


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def digest(items):
    """Digest (L16-L20): SHA-256 of the items joined with LF, UTF-8."""
    return hashlib.sha256("\n".join(items).encode("utf-8")).hexdigest()


def html_encode(text):
    """System.Net.WebUtility.HtmlEncode: & < > " ' plus U+00A0..U+00FF as &#N;."""
    out = []
    for ch in text:
        o = ord(ch)
        if ch == "&": out.append("&amp;")
        elif ch == "<": out.append("&lt;")
        elif ch == ">": out.append("&gt;")
        elif ch == '"': out.append("&quot;")
        elif ch == "'": out.append("&#39;")
        elif 160 <= o <= 255: out.append("&#%d;" % o)
        else: out.append(ch)
    return "".join(out)


def run(command, log):
    log("  " + " ".join(command[:1]) + " ... (%d arguments)" % (len(command) - 1))
    result = subprocess.run(command)
    if result.returncode != 0:
        raise WebBuildError("Command failed: %s (%d)" % (command[0], result.returncode))


def ensure_wasi_sdk(explicit, log):
    """L42-L62: locate or fetch the WASI SDK; returns its root directory."""
    if not explicit:
        cache = ROOT / "build/tools"
        sdk = cache / WASI_SDK_DIRNAME
        if not (sdk / "bin/clang").exists():
            cache.mkdir(parents=True, exist_ok=True)
            archive = cache / (WASI_SDK_DIRNAME + ".tar.gz")
            if not archive.exists() or sha256_file(archive) != WASI_SDK_SHA256:
                log("Downloading WASI SDK 27 (Linux x86_64, 119 MiB). Set FM1_WASI_SDK to reuse an extracted compiler.")
                run(["curl", "--fail", "--location", "--retry", "2", "--output", str(archive), WASI_SDK_URL], log)
            if sha256_file(archive) != WASI_SDK_SHA256:
                raise WebBuildError("WASI SDK archive SHA-256 mismatch.")
            run(["tar", "-xzf", str(archive), "-C", str(cache)], log)
        explicit = sdk
    sdk = Path(explicit).resolve()
    if not (sdk / "bin/clang").exists() or not (sdk / "share/wasi-sysroot").is_dir():
        raise WebBuildError("Set FM1_WASI_SDK to an extracted WASI SDK 27 directory (bin/clang, share/wasi-sysroot).")
    return sdk


def build_simulator(wasi_sdk, display, log):
    """Build-Simulator (L13-L95). v0.2: `display` is compiled in as FM1_DISPLAY_VERSION."""
    out = ROOT / "build/web"
    out.mkdir(parents=True, exist_ok=True)
    if not (ROOT / "web/engine/Simulator.c").exists():
        raise WebBuildError("Missing browser sources. Download the complete source tree.")
    # Inputs (L28-L36): .c/.h/.inc under app/, web/, third_party/synth (not app/board/),
    # plus tools/Build-Web.ps1 and the top-level sdk/include/*.h (non-recursive, as
    # Get-ChildItem without -Recurse).
    inputs = {}
    for top in ("app", "web", "third_party/synth"):
        for path in (ROOT / top).rglob("*"):
            if not path.is_file():
                continue
            name = path.relative_to(ROOT).as_posix()
            if not name.startswith("app/board/") and path.suffix in (".c", ".h", ".inc"):
                inputs[name] = sha256_file(path)
    for name in ["tools/Build-Web.ps1"] + sorted("sdk/include/" + p.name for p in (ROOT / "sdk/include").iterdir()
                                                 if p.is_file() and p.suffix == ".h"):
        inputs[name] = sha256_file(ROOT / name)
    names = sorted(inputs, key=lambda n: n.encode("utf-8"))  # StringComparer.Ordinal (L38)
    source_hash = digest([n + ":" + inputs[n] for n in names])
    wasm = out / "simulator.wasm"
    metadata = out / "simulator.json"
    # Toolchain stamp (L63-L68): any change to the SDK files invalidates the cache.
    stamp_items = [str(wasi_sdk)]
    for path in sorted(p for p in wasi_sdk.rglob("*") if p.is_file()):
        st = path.stat()
        stamp_items.append("%s:%d:%d" % (path, st.st_size, st.st_mtime_ns))
    tool_stamp = digest(stamp_items)
    if wasm.exists() and metadata.exists():
        try:
            cached = json.loads(metadata.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            cached = None
        if cached and cached.get("schema") == 3 and cached.get("toolchain_stamp") == tool_stamp and \
                cached.get("source_sha256") == source_hash and cached.get("display_version") == display and \
                cached.get("wasm_sha256") == sha256_file(wasm):
            return {"file": wasm, "source_sha256": source_hash, "cache_hit": True}
    for path in (wasm, metadata):
        if path.exists():
            path.unlink()
    # Compiler options (L78-L84), verbatim.
    options = ["--sysroot=" + str(wasi_sdk / "share/wasi-sysroot"),
               "-std=c11", "-O2", "-fwrapv", "-fno-fast-math", "-ffp-contract=off",
               "-DFM1_HOST_TEST", "-DFM1_OPEN_WEB", "-Wall", "-Wextra", "-Werror",
               "-Wno-unused-function", "-Wno-array-parameter", "-mexec-model=reactor",
               '-DFM1_DISPLAY_VERSION="%s"' % display]   # v0.2: the simulated boot screen draws it
    for name in ("web/engine", "web/synth", "third_party/synth", "sdk/include", "app/synth", "app"):
        options.append("-I" + str(ROOT / name))
    for name in names:
        if name.endswith(".c") and not name.startswith("sdk/"):
            options.append(str(ROOT / name))
    options += ["-Wl,--strip-all", "-Wl,-z,stack-size=131072", "-Wl,--initial-memory=4194304",
                "-Wl,--max-memory=33554432", "-o", str(wasm)]
    log("Compile the browser application")
    try:
        run([str(wasi_sdk / "bin/clang")] + options, log)
        record = {"schema": 3, "source_sha256": source_hash, "display_version": display,
                  "toolchain_stamp": tool_stamp, "wasm_sha256": sha256_file(wasm)}
        metadata.write_bytes(json.dumps(record, indent=2).encode("utf-8"))
    except Exception:
        for path in (wasm, metadata):
            if path.exists():
                path.unlink()
        raise
    return {"file": wasm, "source_sha256": source_hash, "cache_hit": False}


def build(args, log):
    """Main body (L96-L152)."""
    package = json.loads(Path(args.package_json).read_text(encoding="utf-8")) if args.package_json else None
    package_text = Path(args.package_json).read_text(encoding="utf-8") if args.package_json else None
    if package:
        output = ROOT / "build/official-web" / package["model"] / "SMK37-Open-Source.html"
    else:
        output = ROOT / "build/preview/index.html"
    for path in (output, output.parent / "SHA256SUMS.txt"):
        if path.exists():
            path.unlink()
    if args.local_preview and package:
        raise WebBuildError("LocalPreview cannot produce a firmware distribution.")
    source_url = args.source_url or ""
    if not source_url.strip() and not args.local_preview:
        raise WebBuildError("Set FM1_SOURCE_URL or --source-url to the HTTPS URL of the matching source archive.")
    if not args.local_preview:
        m = re.match(r"^https://([^/@\s]+)(/.*)?$", source_url)
        if not m or re.search(r"[\r\n]", source_url):
            raise WebBuildError("FM1_SOURCE_URL must be an HTTPS source URL without credentials.")
    version_header = (ROOT / "app/version.h").read_text(encoding="utf-8")
    vm = re.search(r'(?m)^#define FM1_RELEASE_VERSION "(V(?:0[1-9]|[1-9][0-9]{1,2}))"\s*$', version_header)
    if not vm:
        raise WebBuildError("Set FM1_RELEASE_VERSION in app/version.h.")
    release_version = vm.group(1)
    try:   # v0.2: the Classic Tabby display version, separate from the Open label above
        display = compute_display_version(ROOT, args.display_version)
    except DisplayVersionError as error:
        raise WebBuildError(str(error))
    log("Display version " + display)
    notices = ["APP: GPLv3 with the SMK37 SDK linking exception. SDK and resource terms: THIRD_PARTY.md. Source: " + source_url]
    if package:
        if package.get("schema") != 1 or package.get("release_version") != release_version:
            raise WebBuildError("Firmware and web release versions differ.")
        if package.get("display_version") != display:   # v0.2
            raise WebBuildError("Firmware and web display versions differ (%r vs %r)." % (package.get("display_version"), display))
        if not re.fullmatch(r"[0-9a-f]{64}", str(package.get("build_id", ""))):
            raise WebBuildError("Firmware source identifier is invalid.")
    compiled = build_simulator(args.wasi_sdk, display, log)
    wasm_bytes = compiled["file"].read_bytes()
    import base64
    simulation = json.dumps({"schema": 1, "release_version": release_version, "display_version": display,
                             "sha256": sha256_file(compiled["file"]), "source_sha256": compiled["source_sha256"],
                             "sample_bank": "synthesized-demo",
                             "data": base64.b64encode(wasm_bytes).decode("ascii")}, separators=(",", ":"))
    web = (ROOT / "sdk/Update.html.in").read_text(encoding="utf-8")
    if args.local_preview:
        web = re.sub(r'<a\b[^>]*href="/\*FM1_SOURCE_URL\*/"[^>]*>(.*?)</a>', r"<span>\1 (local preview)</span>", web)
    replacements = {
        "/*FM1_SOURCE_URL*/": html_encode(source_url),
        "/*FM1_PAYLOAD*/": "const FM1_PACKAGE = " + (package_text if package_text else "null") + ";",
        "/*FM1_SIMULATOR*/": "const FM1_SIMULATOR = " + simulation + ";",
        "/*FM1_I18N*/": (ROOT / "sdk/I18n.js").read_text(encoding="utf-8"),
        "/*FM1_SCRIPT*/": (ROOT / "sdk/WebUpdate.js").read_text(encoding="utf-8"),
        "/*FM1_SIM_SCRIPT*/": (ROOT / "sdk/Simulator.js").read_text(encoding="utf-8"),
        "/*FM1_SAMPLE_SCRIPT*/": (ROOT / "sdk/Samples.js").read_text(encoding="utf-8"),
        # Task 04: the device library (web/devices/*.json as one array) and the rig scripts.
        "/*FM1_DEVICES*/": "globalThis.FM1_DEVICES = [" + ",".join(
            json.dumps(json.loads((ROOT / "web/devices" / name).read_text(encoding="utf-8")), separators=(",", ":"), ensure_ascii=False)
            for name in sorted(p.name for p in (ROOT / "web/devices").glob("*.json"))) + "];",
        "/*FM1_RIG_SCRIPT*/": "\n".join((ROOT / "web/rig" / name).read_text(encoding="utf-8")
                                        for name in ("device-library.js", "rig.js", "rig-ui.js")),
        # Task 02 Step 4: the MIDI importer (web/import/, classic scripts) inlined in load order.
        # Task 05: the timed note module first (the song editor and the importer both use it).
        "/*FM1_IMPORT_SCRIPT*/": "\n".join((ROOT / name).read_text(encoding="utf-8")
                                           for name in ("web/timed-note/timed-note.js", "web/import/midi-parse.js", "web/import/song-format.js", "web/import/midi-song.js", "web/import/song-transfer.js", "web/import/import-ui.js")),
    }
    for name in ("THIRD_PARTY.md", "LICENSE.md"):
        notice = (ROOT / name).read_text(encoding="utf-8")
        if name == "THIRD_PARTY.md" and not notice.startswith("# Third-party notices"):
            raise WebBuildError("Use the public distribution notices.")
        notices.append("\n===== %s =====\n" % name + notice)
    replacements["/*FM1_NOTICES*/"] = html_encode("\n".join(notices))
    for key, value in replacements.items():
        web = web.replace(key, value)
    if re.search(r"/\*FM1_[A-Z_]+\*/", web):
        raise WebBuildError("Unexpanded HTML placeholder.")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(web.encode("utf-8"))
    report = {"file": str(output), "simulator_sha256": sha256_file(compiled["file"]),
              "simulator_source_sha256": compiled["source_sha256"], "simulator_bytes": len(wasm_bytes),
              "display_version": display, "cache_hit": compiled["cache_hit"]}
    if package:
        h = sha256_file(output)
        (output.parent / "SHA256SUMS.txt").write_bytes(("%s  %s\n" % (h, output.name)).encode("utf-8"))
        report["sha256"] = h
        log("Integrated SMK37 workbench: %s" % output)
    else:
        log("Preview: build/preview/index.html")
    (ROOT / "build/web/web-report.json").write_bytes(json.dumps(report, indent=2).encode("utf-8"))
    log(json.dumps(report, indent=2))


def main(argv=None):
    parser = argparse.ArgumentParser(description="Linux port of tools/Build-Web.ps1.")
    parser.add_argument("--wasi-sdk", default=os.environ.get("FM1_WASI_SDK") or None,
                        help="extracted WASI SDK 27 directory (FM1_WASI_SDK); fetched into build/tools if unset")
    parser.add_argument("--package-json", help="path to the firmware package JSON (Build.ps1 -Package output)")
    parser.add_argument("--source-url", default=os.environ.get("FM1_SOURCE_URL"), help="HTTPS URL of the source archive")
    parser.add_argument("--local-preview", action="store_true", help="build/preview/index.html without a source URL")
    parser.add_argument("--display-version", default=os.environ.get("FM1_DISPLAY_VERSION") or None,
                        help="the version shown to the user (default: the git tag via tools/linux/display_version.py); v0.2")
    args = parser.parse_args(argv)

    def log(message):
        print(message, flush=True)

    try:
        args.wasi_sdk = ensure_wasi_sdk(args.wasi_sdk, log)
        log("WASI SDK: %s" % args.wasi_sdk)
        build(args, log)
        return 0
    except WebBuildError as error:
        sys.stderr.write("error: %s\n" % error)
        return 1


if __name__ == "__main__":
    sys.exit(main())
