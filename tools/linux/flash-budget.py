#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/flash-budget.py — flash use breakdown of a linked SMK37 Open image (read only)

Purpose
    Answer "where do the bytes go" for build/<model>/sdk.elf using the two artefacts the
    build already produces: the GNU-ld style link map (sdk.map) and `nm --print-size`.
    Flash use means everything the package stores: .text (code + rodata), .data,
    .ram0_data (SRAM code/data copied from flash at boot) and .cache_ram_data — the same
    four sections Package-Firmware concatenates into app.bin.

    Output is Markdown (tables) written to build/<model>/flash-budget.md, which
    docs/FLASH-BUDGET.md quotes. The tool never modifies sources or the build.

    Attribution rules
      * Objects compiled with -fno-lto (screen.c, transfer.c, midi_router.c, panel.c,
        scan.c) keep their identity in the map, so their totals and per-function sizes are
        exact (the map lists every .text.<function> input section).
      * The other app units are merged by the LTO plugin into one /tmp/lto-llvm-*.o, so the
        map only shows the merged total. Their per-file split comes from `nm --print-size`
        on sdk.elf plus a symbol→file map produced by an analysis-only -fno-lto compile of
        each app file (tools/linux/flash-budget.py --nolto-map build/.../nolto.json, written
        by --make-nolto-map). Symbols that LTO inlined away or renamed are reported as
        "unattributed"; the per-file numbers for LTO units are therefore lower bounds.
      * libfm1_engine.a is a single object (engine_startup.S.o) linked with
        --whole-archive; it is reported as a whole and, for orientation, by the section
        family the vendor used (.bt_stack_code, .volatile_ram_code, ...).

Usage
    python3 tools/linux/flash-budget.py --build-dir build/pro \
        --nm "wine /path/pi32/bin/llvm-nm.exe" [--nolto-map build/pro/nolto.json] [--top 30]
    python3 tools/linux/flash-budget.py --make-nolto-map build/pro/nolto.json \
        --clang /opt/jieli/pi32v2/bin/clang --objdump ... --nm-native ...

Version: 0.1

Revision log
    v0.1  2026-11-01  Initial version: map parser (handles wrapped input-section lines),
                      flash-only symbol filter via firmware-report.json section ranges,
                      grouping by input, LTO attribution via nm + analysis map, top-N
                      app symbols, screen.c per-page grouping, engine section families.
"""

import argparse
import collections
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FLASH_SECTIONS = (".text", ".data", ".ram0_data", ".cache_ram_data")

# screen.c page grouping (Build.ps1 keeps screen.c out of LTO so these are exact).
# Keys are the page names from the enum in app/screen.c L126; values are the
# function-section names that only serve that page. Shared drawing/controls go to "shared".
SCREEN_PAGES = {
    "FM_EDIT / FM_ENV / FM_LFO / FM_QUICK (DX7 editor)": ["fm_draw", "fm_control", "algorithm_draw", "fm_parameter", "fm_encoder_delta",
                                                          "rodata.fm_pages", "rodata.algorithms", "track_lfo_draw", "parameter_page"],
    "TONE_EDIT (engine tone editor)": ["tone_draw", "tone_control", "tone_parameter", "tone_label", "tone_part", "tone_slot"],
    "BLE (Bluetooth page)": ["draw_ble", "ble_control", "radio_line"],
    "PROJECT / NAME / PRESET_BROWSER": ["project_draw", "name_draw", "preset_draw", "preset_load", "edit_character", "project_refresh", "preset_refresh"],
    "EFFECTS": ["effects_draw"],
    "STEPS / STEP_EDIT / RHYTHM / ARP_EDIT (sequencer editing)": ["steps", "step_knob", "step_adjust", "sequence_length_adjust", "move_step",
                                                                  "toggle_step", "step_first", "edit_page_draw"],
    "OVERVIEW / MIX": ["overview", "mix_draw", "header", "leds", "performance_hint", "hint_draw"],
    "STARTUP": ["boot_draw"],
}


def sh(cmd, cwd=None):
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, errors="replace")
    if result.returncode != 0:
        raise SystemExit("command failed (%d): %s\n%s" % (result.returncode, " ".join(cmd), result.stderr[:500]))
    return result.stdout


# ---- link map --------------------------------------------------------------------------------
def parse_map(path):
    """Return a list of (output_section, input_section, address, size, source) from the
    'Linker script and memory map' part of a GNU ld map. ld wraps long input-section
    names onto their own line; the following line then carries address/size/source."""
    lines = Path(path).read_text(encoding="utf-8", errors="replace").splitlines()
    start = next(i for i, l in enumerate(lines) if l.startswith("Linker script and memory map"))
    records = []
    pending = None
    out = None
    for line in lines[start:]:
        if line and not line.startswith(" ") and not line.startswith(("LOAD", "OUTPUT", "START", "Linker")):
            out = line.split()[0]
            continue
        m = re.match(r"^ (\S+)\s+0x([0-9a-f]+)\s+0x([0-9a-f]+)\s+(.+)$", line)
        if m:
            records.append((out, m.group(1), int(m.group(2), 16), int(m.group(3), 16), m.group(4)))
            pending = None
            continue
        m = re.match(r"^ (\S+)$", line)
        if m and not m.group(1).startswith("*"):
            pending = m.group(1)
            continue
        m = re.match(r"^\s+0x([0-9a-f]+)\s+0x([0-9a-f]+)\s+(.+)$", line)
        if m and pending:
            records.append((out, pending, int(m.group(1), 16), int(m.group(2), 16), m.group(3)))
            pending = None
            continue
        if not line.strip():
            pending = None
    return records


def input_key(source):
    """Collapse a map source path to a short input name."""
    if "lto-llvm" in source:
        return "app (LTO-merged units)"
    m = re.search(r"(libfm1_engine\.a|libc\.a|libcompiler_rt\.a)\(", source)
    if m:
        return m.group(1)
    m = re.search(r"obj/\d+_(app_[A-Za-z0-9_.]+)\.obj", source)
    if m:
        return m.group(1).replace("app_board_", "app/board/").replace("app_", "app/", 1)
    if "build_identity" in source:
        return "generated/build_identity.c"
    return source


# ---- nm ----------------------------------------------------------------------------------------
NM_LINE = re.compile(r"^([0-9a-fA-F]+)[ \t]+(([0-9a-fA-F]+)[ \t]+)?([A-Za-z])[ \t]+([^\r]+)")


def read_nm(nm_cmd, elf):
    symbols = {}
    for line in sh(nm_cmd + ["--print-size", str(elf)]).splitlines():
        m = NM_LINE.match(line)
        if m and m.group(3):
            symbols[m.group(5)] = {"address": int(m.group(1), 16), "size": int(m.group(3), 16), "kind": m.group(4)}
    return symbols


# ---- analysis-only non-LTO compile for the symbol -> file map ---------------------------------
APP_SOURCES = ["app/audio_output.c", "app/board/audio.c", "app/board/panel.c", "app/board/scan.c", "app/fm_factory.c",
               "app/fm_library.c", "app/midi_router.c", "app/presets.c", "app/project.c", "app/samples.c", "app/screen.c",
               "app/smk37_controls.c", "app/transfer.c"]
OZ = {"app/project.c", "app/transfer.c", "app/samples.c", "app/screen.c", "app/presets.c", "app/midi_router.c",
      "app/smk37_controls.c", "app/fm_library.c", "app/fm_factory.c"}


def make_nolto_map(output, clang, nm_native, objdump, model, workdir):
    """Compile each app unit with the production flags but -fno-lto (analysis only, into
    workdir) and record defined symbols per file plus each unit's standalone flash-like
    size. Mirrors the flag list in tools/linux/build.py / Build.ps1 L366-L391."""
    workdir = Path(workdir)
    workdir.mkdir(parents=True, exist_ok=True)
    flags = ["-target", "pi32v2", "-integrated-as", "-mcpu=r3", "-mfprev1", "-Wuninitialized", "-Wno-invalid-noreturn",
             "-fno-common", "-fno-lto", "-fallow-pointer-null", "-fprefer-gnu-section", "-femulated-tls",
             "-Wno-shift-negative-value", "-Wframe-larger-than=2560", "-fms-extensions", "-fno-unwind-tables",
             "-ffunction-sections", "-fdata-sections", "-fmessage-length=0", "-cl-single-precision-constant", "-mllvm",
             "-pi32v2-large-program=true", "-D__GCC_PI32V2__", "-O2", "-DSMK37_MODEL_%s=1" % model.upper()]
    flags += ["-I" + str(ROOT / d) for d in ("sdk/include", "sdk/include/libc", "app/synth", "sdk/config", "app", "app/board")]
    flags += ["-fwrapv", "-fno-fast-math", "-ffp-contract=off"]
    symbols = {}
    totals = {}
    for source in APP_SOURCES:
        obj = workdir / (source.replace("/", "_") + ".o")
        extra = (["-Oz"] if source in OZ else []) + (["-fno-pic"] if source in ("app/board/panel.c", "app/board/scan.c") else [])
        sh(clang + flags + extra + ["-c", str(ROOT / source), "-o", str(obj)])
        sizes = {}
        for line in sh(objdump + ["-h", str(obj)]).splitlines():
            m = re.match(r"\s*\d+\s+(\S+)\s+([0-9a-f]+)\s", line)
            if m:
                sizes[m.group(1)] = int(m.group(2), 16)
        totals[source] = {
            "flash_like": sum(v for k, v in sizes.items() if re.match(r"\.(text|rodata|data|volatile_ram|ram0|cache_ram|boot)", k) and "bss" not in k),
            "bss": sum(v for k, v in sizes.items() if "bss" in k)}
        for line in sh(nm_native + ["--print-size", "--defined-only", str(obj)]).splitlines():
            parts = line.split()
            if len(parts) == 4:
                symbols.setdefault(parts[3], []).append([source, int(parts[1], 16), parts[2]])
    Path(output).write_text(json.dumps({"totals": totals, "symbols": symbols}, indent=1))
    print("wrote", output, "with", len(symbols), "symbols")


# ---- report ------------------------------------------------------------------------------------
def kib(n):
    return "%d (%.1f KiB)" % (n, n / 1024.0)


def report(build_dir, nm_cmd, nolto_map, top):
    build_dir = Path(build_dir)
    elf = build_dir / "sdk.elf"
    records = parse_map(build_dir / "sdk.map")
    fw = json.loads((build_dir / "firmware-report.json").read_text())
    pkg = json.loads((build_dir / "package-report.json").read_text())
    nm = read_nm(nm_cmd, elf)
    # Only symbols that live in a flash-backed (non-NOBITS) section count; .bss/.ram0_bss
    # symbols are RAM only. Ranges come from firmware-report.json (v0.1 fix).
    flash_ranges = [(s["address"], s["address"] + s["bytes"]) for s in fw["sections"] if not s["nobits"]]

    def in_flash(address):
        return any(lo <= address < hi for lo, hi in flash_ranges)

    nm = {name: info for name, info in nm.items() if in_flash(info["address"])}
    lines = []
    w = lines.append

    # 1. Flash by input and output section.
    by_input = collections.defaultdict(lambda: collections.defaultdict(int))
    for out, _inp, _addr, size, source in records:
        if out in FLASH_SECTIONS:
            by_input[input_key(source)][out] += size
    w("### Flash use by input (from sdk.map; .text includes rodata)")
    w("")
    w("| Input | .text | .data | .ram0_data | .cache_ram_data | Total |")
    w("| --- | ---: | ---: | ---: | ---: | ---: |")
    grand = 0
    for key, secs in sorted(by_input.items(), key=lambda kv: -sum(kv[1].values())):
        total = sum(secs.values())
        grand += total
        w("| %s | %d | %d | %d | %d | %s |" % (key, secs[".text"], secs[".data"], secs[".ram0_data"], secs[".cache_ram_data"], kib(total)))
    w("| **input sections total** | | | | | **%s** |" % kib(grand))
    w("| alignment / linker-script fill (app image − inputs) | | | | | %d |" % (fw["app_image_bytes"] - grand))
    w("| **app image (firmware-report.json)** | | | | | **%s** |" % kib(fw["app_image_bytes"]))
    w("")

    # 2. Per app file after LTO.
    nolto = json.loads(Path(nolto_map).read_text()) if nolto_map else None
    w("### App units after LTO")
    w("")
    w("Exact for the -fno-lto units (map input sections). For LTO units the post-LTO size is the sum of "
      "`nm` sizes of symbols traced back to the unit (lower bound: inlined code is unattributed); the "
      "standalone column is the unit compiled alone with -fno-lto, for scale.")
    w("")
    w("| Unit | post-LTO flash bytes | method | standalone -fno-lto (text+rodata+data) | standalone .bss |")
    w("| --- | ---: | --- | ---: | ---: |")
    attributed = collections.defaultdict(int)
    unattributed = 0
    app_symbols = {}
    if nolto:
        sym_to_file = {name: entries[0][0] for name, entries in nolto["symbols"].items() if len({e[0] for e in entries}) == 1}
        for name, info in nm.items():
            if name in sym_to_file:
                app_symbols[name] = (sym_to_file[name], info["size"])
    exact = {k: sum(v.values()) for k, v in by_input.items() if k.startswith("app/")}
    merged_total = sum(by_input["app (LTO-merged units)"].values()) if "app (LTO-merged units)" in by_input else 0
    for source in APP_SOURCES + ["generated/build_identity.c"]:
        if source in exact:
            post, method = exact[source], "map (-fno-lto)"
        elif nolto:
            post = sum(size for s, (f, size) in app_symbols.items() if f == source)
            method = "nm symbols (LTO)"
            attributed[source] = post
        else:
            post, method = 0, "unknown"
        t = nolto["totals"].get(source, {}) if nolto else {}
        w("| %s | %d | %s | %s | %s |" % (source, post, method, t.get("flash_like", "—"), t.get("bss", "—")))
    if merged_total:
        w("| LTO-merged units, map total | %d | map | | |" % merged_total)
        w("| of which traced to a unit above | %d | | | |" % sum(attributed.values()))
        w("| of which unattributed (inlined/merged/renamed by LTO) | %d | | | |" % (merged_total - sum(attributed.values())))
    w("")

    # 3. Top app symbols.
    w("### Top %d app symbols by size (post-LTO, from nm --print-size)" % top)
    w("")
    w("| Size | Symbol | Unit | Kind |")
    w("| ---: | --- | --- | --- |")
    rows = sorted(((size, name, f, nm[name]["kind"]) for name, (f, size) in app_symbols.items()), reverse=True)
    for size, name, f, kind in rows[:top]:
        w("| %d | `%s` | %s | %s |" % (size, name, f, kind))
    w("")

    # 4. screen.c by page.
    screen = {inp: size for out, inp, _a, size, source in records if "app_screen" in source and out == ".text"}
    w("### screen.c by page (exact: screen.c is linked without LTO, one input section per function)")
    w("")
    w("| Page group | Bytes | Functions |")
    w("| --- | ---: | --- |")
    assigned = set()
    for page, names in SCREEN_PAGES.items():
        total = 0
        found = []
        for inp, size in screen.items():
            base = re.sub(r"^\.(text\.cold|text|rodata)\.", "", inp)
            if base in names or inp.replace(".", "", 1) in names:
                total += size
                found.append("%s %d" % (base, size))
                assigned.add(inp)
        w("| %s | %d | %s |" % (page, total, ", ".join(sorted(found))))
    shared = sum(size for inp, size in screen.items() if inp not in assigned)
    w("| shared (paint, text, fonts, strings, controls dispatch, web targets, init) | %d | %s |" % (
        shared, ", ".join("%s %d" % (re.sub(r"^\.(text\.cold|text|rodata)\.", "", i), s)
                          for i, s in sorted(screen.items(), key=lambda kv: -kv[1]) if i not in assigned)[:600]))
    w("| **screen.c .text total** | **%d** | |" % sum(screen.values()))
    w("")

    # 5. Engine by section family.
    fam = collections.Counter()
    for out, inp, _a, size, source in records:
        if "libfm1_engine" in source and out in FLASH_SECTIONS:
            fam[re.sub(r"\.[^.]*$", "", inp) if inp.count(".") > 1 else inp] += size
    w("### libfm1_engine.a by vendor section family (single object, --whole-archive; not removable piecewise)")
    w("")
    w("| Bytes | Section family |")
    w("| ---: | --- |")
    for name, size in fam.most_common(30):
        w("| %d | `%s` |" % (size, name))
    w("")

    # 6. Engine-specific symbols inside the SDK (orientation only).
    w("### Synth-engine code inside libfm1_engine.a (from nm; informational)")
    w("")
    w("| Engine | Bytes | Symbols |")
    w("| --- | ---: | ---: |")
    engines = {"DX7 (dx7*, synth_dx7*)": r"^(fm1_)?(synth_)?dx7", "303 bass (bass303*)": r"^(fm1_)?bass303",
               "808 drums (drum808*)": r"^(fm1_)?drum808", "PSG (psg*, emu2149)": r"^(fm1_)?(psg|emu2149)",
               "Pluck (pluck*)": r"^(fm1_)?pluck", "Sample drums (sampledrum*)": r"^(fm1_)?sampledrum",
               "Effects (fm1_fx*)": r"^fm1_fx", "Groove sequencer (groove_*) in SDK": r"^groove_"}
    for label, pattern in engines.items():
        hits = [(n, i["size"]) for n, i in nm.items() if re.match(pattern, n) and n not in app_symbols]
        w("| %s | %d | %d |" % (label, sum(s for _, s in hits), len(hits)))
    w("")
    w("Package layout: FLASH_BIN_SIZE %d, VM %d..%d (%d bytes, minimum %d), BTIF %d..%d, USER %d..%d (%d bytes)." % (
        pkg["FLASH_BIN_SIZE"], pkg["VM_START_ADDR"], pkg["VM_END_ADDR"], pkg["VM_REAL_SIZE"], pkg["vm_minimum_bytes"],
        pkg["BTIF_RESERVED_START"], pkg["BTIF_RESERVED_END"], pkg["USER_RESERVED_START"], pkg["USER_RESERVED_END"], pkg["user_bytes"]))
    text = "\n".join(lines) + "\n"
    (build_dir / "flash-budget.md").write_text(text)
    return text


def command(text):
    """A tool argument is either one executable path (may contain spaces) or a shell-style
    command line such as "wine /path/llvm-nm.exe"."""
    return [text] if Path(text).exists() else shlex.split(text)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Flash use breakdown for a linked SMK37 Open image.")
    parser.add_argument("--build-dir", default=str(ROOT / "build/pro"))
    parser.add_argument("--nm", help='nm command for the ELF, e.g. "wine /path/llvm-nm.exe" or /opt/jieli/pi32v2/bin/nm')
    parser.add_argument("--nolto-map", help="symbol->file JSON from --make-nolto-map")
    parser.add_argument("--top", type=int, default=30)
    parser.add_argument("--make-nolto-map", metavar="JSON", help="write the analysis symbol map and exit")
    parser.add_argument("--clang", help="(make-nolto-map) clang command")
    parser.add_argument("--nm-native", help="(make-nolto-map) nm for ELF objects")
    parser.add_argument("--objdump", help="(make-nolto-map) objdump -h capable tool")
    parser.add_argument("--model", default="pro")
    parser.add_argument("--workdir", default=str(ROOT / "build/analysis-nolto"))
    args = parser.parse_args(argv)
    if args.make_nolto_map:
        if not (args.clang and args.nm_native and args.objdump):
            parser.error("--make-nolto-map needs --clang, --nm-native and --objdump")
        make_nolto_map(args.make_nolto_map, command(args.clang), command(args.nm_native), command(args.objdump),
                       args.model, args.workdir)
        return 0
    if not args.nm:
        parser.error("--nm is required")
    print(report(args.build_dir, command(args.nm), args.nolto_map, args.top))
    return 0


if __name__ == "__main__":
    sys.exit(main())
