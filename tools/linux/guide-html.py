#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/guide-html.py — docs/TESTING-GUIDE.md as one plain readable HTML page

Purpose
    The testing and user guide (docs/TESTING-GUIDE.md) is written as plain text that is also
    valid enough Markdown. The hosted site shows it at <site>/guide/ (and at
    builds/<tag>/guide/). This script turns the text into a self-contained page: no script, no
    external file, light and dark colours, readable at phone width, printable (the checklist is
    meant to be printed and filled in).

    The text uses only these shapes, and the converter knows only these:
      Title line + "====" line          -> the page title (h1), once, first
      "N. NAME" line + "====" line      -> a section (h2)
      Line + "----" line                -> a sub-section (h3), including the test groups
      "T12. Title" line                 -> one test (h4, anchor t12)
      "- text" / "  - text"             -> bullets (one level of nesting)
      "N. text"                         -> numbered steps
      "Label: text" for Set up / You should see / You should hear / Result
                                        -> a labelled paragraph (Result gets a writing line)
      anything else                     -> a paragraph (consecutive lines join)
    A step that ends in "[not checked in simulator]" gets a small tag.

    Run: python3 -I tools/linux/guide-html.py [--in docs/TESTING-GUIDE.md] --out <file>
    publish-pages.py calls it for every site it stages.

Version: 1.0

Revision log
    v1.0  2026-11-10  Initial version (testing guide, tabby-v04.1.1).
"""

import argparse
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MARK = "[not checked in simulator]"
LABELS = ("Set up:", "You should see:", "You should hear:", "You should see or hear:", "Result:")

CSS = """
:root{--bg:#fbfaf7;--fg:#1d1d1b;--muted:#5d5b55;--line:#d9d5ca;--card:#fff;--accent:#0b5cad;--tag:#7a4b00;--tagbg:#fff1d6}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#16171a;--fg:#ecebe6;--muted:#a3a198;--line:#3a3b3f;--card:#1e2024;--accent:#7db4f0;--tag:#ffd58a;--tagbg:#3a2d12}}
:root[data-theme=dark]{--bg:#16171a;--fg:#ecebe6;--muted:#a3a198;--line:#3a3b3f;--card:#1e2024;--accent:#7db4f0;--tag:#ffd58a;--tagbg:#3a2d12}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:46rem;margin:0 auto;padding:24px 16px 80px}
h1{font-size:1.9rem;line-height:1.2;margin:.4em 0 .2em}
h2{font-size:1.4rem;margin:2.2em 0 .5em;padding-top:.6em;border-top:2px solid var(--line)}
h3{font-size:1.12rem;margin:1.8em 0 .4em}
h4{font-size:1.02rem;margin:1.6em 0 .3em;padding:.35em .6em;background:var(--card);border:1px solid var(--line);border-radius:6px}
p{margin:.5em 0}
ul,ol{margin:.4em 0 .6em;padding-left:1.4em}
li{margin:.25em 0}
a{color:var(--accent)}
nav.top{font-size:.92rem;color:var(--muted);margin-bottom:.5rem}
nav.toc{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:.6em 1em;margin:1em 0}
nav.toc ol{margin:.2em 0;columns:2;column-gap:2em}
nav.toc li{break-inside:avoid}
.lab{font-weight:600}
.tag{display:inline-block;font-size:.75rem;line-height:1.3;padding:0 .45em;margin-left:.4em;border-radius:4px;color:var(--tag);background:var(--tagbg);white-space:nowrap}
.result{margin:.5em 0 1em;padding-bottom:.2em;border-bottom:1px dashed var(--muted);min-height:2.4em}
.meta{color:var(--muted);font-size:.92rem}
@media (max-width:560px){body{font-size:16px}nav.toc ol{columns:1}}
@media print{body{background:#fff;color:#000;font-size:11pt}nav.top,nav.toc{display:none}h2{break-before:auto}h4{break-after:avoid}.result{break-inside:avoid}}
"""


def inline(text):
    """Escape and mark the 'not checked' tag."""
    tagged = text.endswith(MARK) or MARK in text
    text = text.replace(MARK, "").rstrip()
    out = html.escape(text, quote=False)
    out = re.sub(r"(https://[^\s<>)]+[^\s<>).,;:])", r'<a href="\1">\1</a>', out)
    if tagged:
        out += ' <span class="tag">not checked in simulator</span>'
    return out


def render(md):
    lines = md.replace("\r\n", "\n").split("\n")
    body, toc = [], []
    i, n = 0, len(lines)
    state = {"list": None}       # 'ul' / 'ol' while a list is open

    def close_list():
        if state["list"]:
            body.append("</%s>" % state["list"])
            state["list"] = None

    def para(buf):
        if buf:
            body.append("<p>%s</p>" % " ".join(inline(b) for b in buf))
            buf.clear()

    buf = []
    title = "Classic Tabby testing and user guide"
    seen_title = False
    while i < n:
        line = lines[i].rstrip()
        nxt = lines[i + 1].rstrip() if i + 1 < n else ""
        if line and re.fullmatch(r"=+", nxt) and len(nxt) >= 3:
            para(buf); close_list()
            if not seen_title:
                title = line
                body.append("<h1>%s</h1>" % html.escape(line))
                seen_title = True
            else:
                m = re.match(r"(\d+)\.\s", line)
                anchor = "s%s" % m.group(1) if m else re.sub(r"\W+", "-", line.lower()).strip("-")
                body.append('<h2 id="%s">%s</h2>' % (anchor, html.escape(line)))
                toc.append((anchor, line))
            i += 2
            continue
        if line and re.fullmatch(r"-+", nxt) and len(nxt) >= 3:
            para(buf); close_list()
            anchor = re.sub(r"\W+", "-", line.lower()).strip("-")
            body.append('<h3 id="%s">%s</h3>' % (anchor, html.escape(line)))
            i += 2
            continue
        m = re.match(r"(T\d+)\.\s+(.*)", line)
        if m:
            para(buf); close_list()
            body.append('<h4 id="%s">%s. %s</h4>' % (m.group(1).lower(), m.group(1), html.escape(m.group(2))))
            i += 1
            continue
        if not line.strip():
            para(buf); close_list()
            i += 1
            continue
        m = re.match(r"(\s*)- (.*)", line)
        if m:
            para(buf)
            if state["list"] != "ul":
                close_list(); body.append("<ul>"); state["list"] = "ul"
            body.append('<li%s>%s</li>' % (' style="margin-left:1.2em"' if m.group(1) else "", inline(m.group(2))))
            i += 1
            continue
        m = re.match(r"(\d+)\.\s+(.*)", line)
        if m:
            para(buf)
            if state["list"] != "ol":
                close_list(); body.append('<ol start="%s">' % m.group(1)); state["list"] = "ol"
            body.append("<li>%s</li>" % inline(m.group(2)))
            i += 1
            continue
        lab = next((l for l in LABELS if line.startswith(l)), None)
        if lab:
            para(buf); close_list()
            rest = line[len(lab):].strip()
            if lab == "Result:":
                body.append('<p class="result"><span class="lab">Result:</span> PASS / FAIL &nbsp; <span class="lab">Notes:</span></p>')
            else:
                body.append('<p><span class="lab">%s</span> %s</p>' % (html.escape(lab), inline(rest)))
            i += 1
            continue
        if state["list"]:
            close_list()
        buf.append(line.strip())
        i += 1
    para(buf); close_list()

    nav = ""
    if toc:
        items = "".join('<li><a href="#%s">%s</a></li>' % (a, html.escape(re.sub(r"^\d+\.\s*", "", t).capitalize())) for a, t in toc)
        nav = '<nav class="toc" aria-label="Contents"><strong>Contents</strong><ol>%s</ol></nav>' % items
    page = ("<!doctype html>\n<!-- SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception -->\n"
            "<!-- Generated by tools/linux/guide-html.py from docs/TESTING-GUIDE.md; edit the text, not this page. -->\n"
            '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            "<title>Classic Tabby testing guide</title><style>%s</style></head><body><main>"
            '<nav class="top"><a href="../">Classic Tabby workbench</a> &middot; <a href="../builds/">All builds</a></nav>'
            "%s</main></body></html>\n") % (CSS, "".join(body[:1]) + nav + "".join(body[1:]))
    return page


def main(argv):
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument("--in", dest="src", default=str(ROOT / "docs/TESTING-GUIDE.md"))
    parser.add_argument("--out", required=True)
    args = parser.parse_args(argv)
    text = Path(args.src).read_text(encoding="utf-8")
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render(text), encoding="utf-8")
    print("guide page: %s (%d bytes)" % (out, out.stat().st_size))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
