#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/pin-sdk-files.py — update sdk/manifest.json hashes for edited SDK files

Purpose
    sdk/manifest.json pins the SHA-256 of every SDK file (67 entries) and build.py refuses
    to build when one differs, which is the integrity check Task 01 kept enabled. Classic
    Tabby edits a few of the pinned *workbench* files (sdk/WebUpdate.js, sdk/Simulator.js,
    sdk/Samples.js, sdk/Update.html.in) on purpose (Task 03). This tool rewrites only the
    entries named on the command line with the current file hashes, keeps every other
    entry and the file's formatting, and prints old/new hashes so the change is visible
    in review. The binary SDK entries (libfm1_engine.a, tools/pack/*, firmware/*) are never
    re-pinned by accident: they must be named explicitly, and the tool refuses them unless
    --allow-binary is given.

Usage
    python3 -I tools/linux/pin-sdk-files.py sdk/WebUpdate.js sdk/Simulator.js ...

Version: 0.1

Revision log
    v0.1  2026-11-02  Initial version (Task 03 checkpoint a).
"""
import hashlib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
BINARY = (".a", ".bin", ".boot", ".fwsc")

def main(argv):
    allow_binary = "--allow-binary" in argv
    paths = [a for a in argv if not a.startswith("--")]
    if not paths:
        print(__doc__); return 2
    manifest = ROOT / "sdk/manifest.json"
    text = manifest.read_text(encoding="utf-8")
    data = json.loads(text)
    for rel in paths:
        rel = rel.replace("\\", "/")
        if rel not in data["files"]:
            print("not a manifest entry: " + rel); return 1
        if rel.endswith(BINARY) and not allow_binary:
            print("refusing to re-pin a binary SDK file without --allow-binary: " + rel); return 1
        new = hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()
        old = data["files"][rel]
        # Replace the hash in place to keep the file's spacing and key order.
        pattern = re.compile(r'("%s":\s*")%s(")' % (re.escape(rel), old))
        text, n = pattern.subn(r"\g<1>%s\g<2>" % new, text)
        if n != 1:
            print("could not locate the entry text for " + rel); return 1
        print("%s  %s -> %s" % (rel, old[:12], new[:12]))
    manifest.write_text(text, encoding="utf-8")
    json.loads(manifest.read_text(encoding="utf-8"))  # still valid JSON
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
