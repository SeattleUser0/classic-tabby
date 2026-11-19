#!/usr/bin/env python3
"""Classic Tabby: every message the screen can show in its amber box, wrapped as the firmware wraps it
(app/screen.c banner_wrap: scale 3, 13 characters a line, " - " starts a new line).

    python3 -I tools/linux/notice-wrap.py [--max-lines N] [--list]

Reads the string literals of app/screen.c and app/smk37_controls.c that reach announce() or the notice
variable (the statements that name them), wraps each, and fails when one needs more than N lines (default 3)
or holds a word longer than 13 characters. Version history:
    v0.1  2026-11-19  tabby-v1.1 (the readable screen).
"""
import re, sys, pathlib

def wrap(s):
    lines, cur = [], ""
    for w in s.split():
        if w == "-":
            if cur: lines.append(cur); cur = ""
            continue
        if cur and len(cur) + 1 + len(w) > 13:
            lines.append(cur); cur = ""
        while len(w) > 13 - (len(cur) + 1 if cur else 0):
            room = 13 - (len(cur) + 1 if cur else 0)
            cur = (cur + " " if cur else "") + w[:room]; w = w[room:]; lines.append(cur); cur = ""
        if w: cur = (cur + " " if cur else "") + w
    if cur: lines.append(cur)
    return lines

def messages(root):
    out = set()
    for name in ("app/screen.c", "app/smk37_controls.c"):
        text = (root / name).read_text()
        # statements: from "announce(" / "notice =" / "return" inside the functions that produce notices, to the ";"
        for m in re.finditer(r'(announce\(|notice\s*=|say\[\]\s*=|static const char \*const (?:fol|said|msgs?|why)\w*\[\]\s*=)([^;]*);', text):
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
        long_word = any(len(w) > 13 for w in s.split())
        if "--list" in sys.argv or len(lines) > limit or long_word:
            print("%d  %-40s %s" % (len(lines), s, " | ".join(lines)))
        if len(lines) > limit or long_word: bad += 1
    print("notice-wrap: %d messages, %d over %d lines or with a word over 13 characters" % (len(messages(root)), bad, limit))
    return 1 if bad else 0

if __name__ == "__main__":
    sys.exit(main())
