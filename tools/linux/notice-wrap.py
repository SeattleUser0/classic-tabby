#!/usr/bin/env python3
"""Classic Tabby: every message the screen can show in its amber box, wrapped as the firmware wraps it
(app/screen.c banner_wrap: scale 3, 13 characters a line, " - " starts a new line).

    python3 -I tools/linux/notice-wrap.py [--max-lines N] [--list]

Reads the string literals of app/screen.c and app/smk37_controls.c that reach announce() or the notice
variable (the statements that name them), wraps each, and fails when one needs more than N lines (default 3)
or holds a word longer than 13 characters (9 for its first word). Version history:
    v0.2  2026-11-20  tabby-v1.2.1: the first line is 9 characters (the play state stands at the left end of the box).
    v0.1  2026-11-19  tabby-v1.1 (the readable screen).
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import re, sys, pathlib

def wrap(s):
    """As banner_wrap of app/screen.c: 9 characters on the first line (the play state stands before it), 13 on the others."""
    lines, cur = [], ""
    room = lambda: 13 if lines else 9
    for w in s.split():
        if w == "-":
            if cur: lines.append(cur); cur = ""
            continue
        if cur and len(cur) + 1 + len(w) > room():
            lines.append(cur); cur = ""
        while len(w) > room():
            lines.append(w[:room()]); w = w[room():]
        if w: cur = (cur + " " if cur else "") + w
    if cur: lines.append(cur)
    return lines

def messages(root):
    out = set()
    for name in ("app/screen.c", "app/smk37_controls.c"):
        text = (root / name).read_text()
        # statements: from "announce(" / "notice =" / "return" inside the functions that produce notices, to the ";"
        for m in re.finditer(r'(announce\(|notice\s*=|say\[\]\s*=|static const char \*const (?:said|msgs?|why)\w*\[\]\s*=)([^;]*);', text):
            for lit in re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(2)): out.add(lit)
        for fn in ("setup_do", "setup_edit", "confirm_prompt", "banner_text"):
            m = re.search(r'\n(?:static )?(?:const )?char \*%s\([^)]*\)\n\{(.*?)\n\}\n' % fn, text, re.S)
            if m:
                for lit in re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1)): out.add(lit)
    return sorted(s for s in out if s.strip())

def main():
    root = pathlib.Path(__file__).resolve().parents[2]
    limit = int(sys.argv[sys.argv.index("--max-lines") + 1]) if "--max-lines" in sys.argv else 3
    bad = 0
    for s in messages(root):
        lines = wrap(s)
        long_word = any(len(w) > 13 for w in s.split()) or len(s.split()[0]) > 9
        if "--list" in sys.argv or len(lines) > limit or long_word:
            print("%d  %-40s %s" % (len(lines), s, " | ".join(lines)))
        if len(lines) > limit or long_word: bad += 1
    print("notice-wrap: %d messages, %d over %d lines or with a word over 13 characters" % (len(messages(root)), bad, limit))
    return 1 if bad else 0

if __name__ == "__main__":
    sys.exit(main())
