#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/pin-toolchain.py — generate tools/linux/toolchain-linux.json (Track B pins)

Purpose
    sdk/manifest.json pins SHA-256 hashes for 22 files of the JieLi *Windows* 2.5.3
    toolchain. Those checks cannot apply to JieLi's native Linux toolchain, so Track B
    (tools/linux/build.py --toolchain-kind native) verifies a separate pinned manifest
    instead of deleting the checks. This script writes that manifest from an extracted
    Linux toolchain so the pins are reproducible and reviewable:

      * the five tools build.py needs, by the path build.py invokes
        (pi32v2/bin/clang, ld, LLVMgold.so, nm, objcopy — hashed through their symlinks);
      * the same 16 clang resource headers the Windows manifest pins
        (common/lib/clang/4.0.1/include/*.h);
      * the download archive name and SHA-256 and the toolchain's reported version,
        as metadata.

    Re-running this on a different toolchain changes the pins, which is the point: a
    build with any other toolchain must fail until the new pins are reviewed.

Usage
    python3 tools/linux/pin-toolchain.py <toolchain root> [--archive <tar.xz>] [--output tools/linux/toolchain-linux.json]

Version: 0.1

Revision log
    v0.1  2026-11-01  Initial version (jieli-linux-toolchains-20260730.1).
"""

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TOOLS = {"clang": "pi32v2/bin/clang", "ld": "pi32v2/bin/ld", "plugin": "pi32v2/bin/LLVMgold.so",
         "nm": "pi32v2/bin/nm", "objcopy": "pi32v2/bin/objcopy"}
HEADERS = ["__stddef_max_align_t.h", "float.h", "inttypes.h", "iso646.h", "limits.h", "stdalign.h", "stdarg.h",
           "stdatomic.h", "stdbool.h", "stddef.h", "stdint.h", "stdnoreturn.h", "tgmath.h", "unwind.h", "vadefs.h",
           "varargs.h"]
HEADER_DIR = "common/lib/clang/4.0.1/include"


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("root", help="extracted toolchain root (contains common/, pi32v2/)")
    parser.add_argument("--archive", help="downloaded archive, recorded by name and SHA-256")
    parser.add_argument("--archive-url", default="https://pkgman.jieliapp.com/s/linux-toolchain")
    parser.add_argument("--output", default=str(HERE / "toolchain-linux.json"))
    args = parser.parse_args(argv)
    root = Path(args.root).resolve()
    files = {}
    for rel in TOOLS.values():
        if not (root / rel).is_file():
            sys.exit("missing tool: " + rel)
        files[rel] = sha256_file(root / rel)
        target = (root / rel).resolve()
        if target != (root / rel):
            # Pin the symlink target too, so swapping the file behind the link is caught.
            files[target.relative_to(root).as_posix()] = sha256_file(target)
    for name in HEADERS:
        rel = HEADER_DIR + "/" + name
        if not (root / rel).is_file():
            sys.exit("missing header: " + rel)
        files[rel] = sha256_file(root / rel)
    version = subprocess.run([str(root / TOOLS["clang"]), "--version"], capture_output=True, text=True).stdout.strip().splitlines()
    ld_version = subprocess.run([str(root / TOOLS["ld"]), "--version"], capture_output=True, text=True).stdout.strip().splitlines()
    manifest = {
        "schema": 1,
        "name": "JieLi Linux toolchain " + root.name + " (PI32v2 clang 4.0.1)",
        "environment": "FM1_PI32_TOOLCHAIN",
        "install_hint": "Extract so that <root>/common/bin/clang exists (JieLi documents /opt/jieli); raise ulimit -n to 8192 for linking.",
        "archive": {"url": args.archive_url, "name": Path(args.archive).name if args.archive else None,
                    "sha256": sha256_file(args.archive) if args.archive else None},
        "clang_version": version[0] if version else None,
        "ld_version": ld_version[0] if ld_version else None,
        "tools": TOOLS,
        "files": dict(sorted(files.items())),
    }
    Path(args.output).write_text(json.dumps(manifest, indent=4) + "\n", encoding="utf-8")
    print("wrote %s with %d pinned files" % (args.output, len(files)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
