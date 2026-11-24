#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tests/linux/flash-part-guard.py — nothing in Classic Tabby may depend on the flash chip's ID

The flash part page (command 25 request 11, app/diag.c v0.8, docs/FLASH-CHIP.md 4) reports the JEDEC ID and size
the SDK read at boot. It is a report only: a list of accepted IDs is what broke community FM-1 firmwares when
newer units came with the UC25HQ80. This test fails when the ID reaches anything else:

  1. ct_sdk_flash_info (the SDK's flash_info, given by tools/linux/build.py) is named in app/ only by app/diag.c,
     and in tools/ only by tools/linux/build.py.
  2. ct_flash_part_read is named in app/ only by app/diag.c and app/diag.h.
  3. The workbench (sdk/WebUpdate.js) uses the decoded page (flash_part) only in diagRead (where it is decoded),
     diagText and flashPartText (where it is printed). Nothing in sdk/Update.html.in, sdk/Simulator.js or web/
     names it.
  4. No JEDEC ID constant (0xMMTTCC with a SPI NOR type byte 0x40/0x60/0x70 and a capacity code 0x11..0x19)
     appears in the code of app/, web/, sdk/*.js or sdk/Update.html.in.

Run: python3 -I tests/linux/flash-part-guard.py   (part of make workbench-test)
Version: 0.1 (2026-11-16)
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
failed = 0


def check(ok, what):
    global failed
    print(("ok   " if ok else "FAIL ") + what)
    failed += 0 if ok else 1


def files(*globs):
    out = []
    for g in globs:
        out += [p for p in ROOT.glob(g) if p.is_file()]
    return sorted(set(out))


def naming(word, paths):
    rx = re.compile(r"\b%s\b" % re.escape(word))
    return sorted(p.relative_to(ROOT).as_posix() for p in paths if rx.search(p.read_text(errors="replace")))


app = files("app/**/*.c", "app/**/*.h")
tools = files("tools/**/*.py", "tools/**/*.mjs", "tools/**/*.js", "tools/**/*.sh")
web = files("web/**/*.js", "web/**/*.mjs", "web/**/*.c", "web/**/*.h", "web/**/*.html")

who = naming("ct_sdk_flash_info", app)
check(who == ["app/diag.c"], "ct_sdk_flash_info in app/: only app/diag.c (%s)" % who)
who = naming("ct_sdk_flash_info", tools)
check(who == ["tools/linux/build.py"], "ct_sdk_flash_info in tools/: only tools/linux/build.py (%s)" % who)
who = naming("ct_flash_part_read", app)
check(who == ["app/diag.c", "app/diag.h"], "ct_flash_part_read in app/: only app/diag.c and app/diag.h (%s)" % who)

# 3. The workbench: every line naming flash_part lies inside diagRead, diagText or flashPartText.
js = (ROOT / "sdk/WebUpdate.js").read_text().split("\n")
spans, start = [], None
for i, line in enumerate(js):
    if start is None and re.match(r"\s*(Library\.prototype\.diagRead=|function diagText\(|function flashPartText\()", line):
        start = i
    elif start is not None and re.match(r"  \}?;?$", line) and line.strip() in ("}", "};"):
        spans.append((start, i)); start = None
uses = [i for i, line in enumerate(js) if re.search(r"\bflash_part\b", line)]
outside = [i + 1 for i in uses if not any(a <= i <= b for a, b in spans)]
check(len(spans) == 3 and uses and not outside,
      "sdk/WebUpdate.js: flash_part only in diagRead, diagText, flashPartText (%d spans, %d uses, outside: %s)" % (len(spans), len(uses), outside))
others = naming("flash_part", [ROOT / "sdk/Update.html.in", ROOT / "sdk/Simulator.js"] + web)
check(not others, "flash_part is not named by the page, the simulator or web/ (%s)" % others)

# 4. No JEDEC ID constants in code (comments are code too here: an ID has no business in the sources).
JEDEC = re.compile(r"0x[0-9a-f]{2}[467]01[1-9](?![0-9a-f])|(?<![0-9a-f])(856014|b36014|eb6014)(?![0-9a-f])", re.I)
code = app + web + files("sdk/*.js") + [ROOT / "sdk/Update.html.in"]
hits = []
for p in code:
    for n, line in enumerate(p.read_text(errors="replace").split("\n"), 1):
        if JEDEC.search(line):
            hits.append("%s:%d" % (p.relative_to(ROOT).as_posix(), n))
check(not hits, "no JEDEC ID constant in app/, web/, sdk/*.js, sdk/Update.html.in (%s)" % hits[:8])

print("flash part guard: " + ("FAILED" if failed else "passed"))
sys.exit(1 if failed else 0)
