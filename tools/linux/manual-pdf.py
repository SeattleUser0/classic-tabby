#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/manual-pdf.py — the testing and user guide as one printable PDF (the manual)

Purpose
    docs/TESTING-GUIDE.md is the manual. This prints the page tools/linux/guide-html.py makes of it to
    docs/manual/classic-tabby-manual.pdf (US Letter, headless Chrome), and writes docs/manual/manual.json with the
    SHA-256 of the guide text the PDF was made from. The PDF is committed; tools/linux/publish-pages.py puts it
    beside the guide (guide/classic-tabby-manual.pdf) and refuses a PDF made from another text, and
    tests/workbench/guide.mjs (make workbench-test, so the suite) fails when the guide changed without a new PDF.

    Run from the repository root:
      python3 -I tools/linux/manual-pdf.py            make the PDF and manual.json (make manual)
      python3 -I tools/linux/manual-pdf.py --check    exit 1 unless the committed PDF belongs to the guide text

Version: 0.2

Revision log
    v0.2  2026-11-19  tabby-v1.1: the guide's pictures (docs/manual/screens/, "Pictures:" lines) are in the PDF, and
                      manual.json records their SHA-256 too: --check fails when a picture changed without a new PDF.
    v0.1  2026-11-17  First version (the user's answer 6: one printable PDF of the full manual).
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import argparse, hashlib, json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
GUIDE = ROOT / "docs/TESTING-GUIDE.md"
OUT = ROOT / "docs/manual"
PDF = OUT / "classic-tabby-manual.pdf"
META = OUT / "manual.json"
PRINT_CSS = """
@page { size: letter; margin: 0.65in 0.7in; }
@media print {
  html, body { background: #fff !important; color: #000 !important; font-size: 10.5pt; }
  main { max-width: none !important; margin: 0 !important; padding: 0 !important; }
  nav.top { display: none !important; }
  nav.toc { display: block !important; }
  h2 { break-before: page; }
  h3, h4 { break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  p.result { break-inside: avoid; }
  figure.screens img { max-width: 1.9in !important; }
  a { color: #000 !important; text-decoration: none !important; }
}
"""


SCREENS = OUT / "screens"


def guide_hash():
    return hashlib.sha256(GUIDE.read_bytes()).hexdigest()


def picture_names():
    names = []
    for line in GUIDE.read_text(encoding="utf-8").split("\n"):
        if line.startswith("Pictures: "):
            for n in line[len("Pictures: "):].partition(" | ")[0].split():
                if n not in names: names.append(n)
    return names


def pictures_hash():
    """SHA-256 over the pictures the guide names (name and bytes, in the guide's order); a missing one raises."""
    h = hashlib.sha256()
    for n in picture_names():
        h.update(n.encode() + b"\0" + (SCREENS / (n + ".png")).read_bytes())
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--chrome", default=shutil.which("google-chrome") or shutil.which("chromium") or "google-chrome")
    a = ap.parse_args()
    if a.check:
        if not PDF.is_file() or not META.is_file():
            sys.stderr.write("manual-pdf: docs/manual/ has no PDF. Run `make manual`.\n"); return 1
        meta = json.loads(META.read_text())
        try:
            pics = pictures_hash()
        except OSError as e:
            sys.stderr.write("manual-pdf: a picture the guide names is missing: %s\n" % e); return 1
        if meta.get("pictures_sha256") != pics:
            sys.stderr.write("manual-pdf: the pictures in docs/manual/screens/ changed since the PDF was made. Run `make manual` and commit docs/manual/.\n"); return 1
        if meta.get("guide_sha256") != guide_hash():
            sys.stderr.write("manual-pdf: docs/TESTING-GUIDE.md changed since the PDF was made. Run `make manual` and commit docs/manual/.\n"); return 1
        if PDF.read_bytes()[:5] != b"%PDF-" or PDF.stat().st_size != meta.get("bytes"):
            sys.stderr.write("manual-pdf: the PDF is not the one manual.json describes. Run `make manual`.\n"); return 1
        print("manual-pdf: the PDF belongs to the guide text (%d bytes, %s pages)" % (meta["bytes"], meta.get("pages")))
        return 0
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "manual.html"
        r = subprocess.run([sys.executable, "-I", str(ROOT / "tools/linux/guide-html.py"), "--out", str(page), "--image-base", SCREENS.resolve().as_uri() + "/"], cwd=str(ROOT), capture_output=True, text=True)
        if r.returncode != 0 or not page.is_file():
            sys.stderr.write("guide-html.py failed: %s\n" % (r.stdout + r.stderr)[-400:]); return 1
        text = page.read_text(encoding="utf-8")
        if text.count("</style>") != 1:
            sys.stderr.write("manual-pdf: the guide page has no single style block\n"); return 1
        text = text.replace("</style>", PRINT_CSS + "</style>").replace("<title>Classic Tabby testing guide</title>", "<title>Classic Tabby manual</title>")
        page.write_text(text, encoding="utf-8")
        oc_guard.check("a browser (manual-pdf.py)")   # OC-GUARD: right before the browser is launched
        r = subprocess.run([a.chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--allow-file-access-from-files", "--print-to-pdf=%s" % PDF.resolve(), page.resolve().as_uri()],
                           capture_output=True, text=True, timeout=180)
        if r.returncode != 0 or not PDF.is_file() or PDF.read_bytes()[:5] != b"%PDF-":
            sys.stderr.write("chrome failed: %s\n" % r.stderr[-400:]); return 1
    data = PDF.read_bytes()
    pages = len(re.findall(rb"/Type\s*/Page[^s]", data))
    version = re.search(r"For (tabby-v[0-9.]+[0-9])", GUIDE.read_text(encoding="utf-8"))
    META.write_text(json.dumps({"guide_sha256": guide_hash(), "pictures_sha256": pictures_hash(), "pictures": len(picture_names()), "bytes": len(data), "pages": pages, "paper": "US Letter",
                                "for": version.group(1) if version else None, "tool": "tools/linux/manual-pdf.py v0.2"}, indent=1) + "\n")
    print("manual-pdf: %s, %d bytes, %d pages" % (PDF.relative_to(ROOT), len(data), pages))
    return 0


if __name__ == "__main__":
    sys.exit(main())
