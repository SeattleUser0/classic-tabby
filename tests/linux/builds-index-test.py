#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tests/linux/builds-index-test.py — tools/linux/builds-index.py on fake sites in a temporary directory

Purpose
    Task 12 A5. The permanent build pages and builds/index.json are what the workbench's stale-loader
    message depends on, so the tool is checked without git or the network:
      1. add: a Build-Hosted.cjs site (assets.json) lands in builds/<tag>/, the index entry carries the
         build id, the loader tag (ota-SMK37 + 16 hex), the version, the page path and the source link;
      2. add: a standalone single-file page (no assets.json; the package inline) is read the same way;
      3. permanence: a second add of the same tag with a different build id is refused and changes
         nothing; the same build id is replaced quietly; --replace overwrites;
      4. index: dates and notes survive a rewrite; a directory without an entry gets today; the entries
         are ordered by date then tag; builds/index.html lists every tag;
      5. redirect: <path>/index.html points at the target and the old files are gone.

    Run:  python3 -I tests/linux/builds-index-test.py     (or: make workbench-test)

Version: 0.1

Revision log
    v0.1  2026-11-08  Initial version (Task 12 A5).
"""
import importlib.util
import json
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("builds_index", ROOT / "tools/linux/builds-index.py")
bi = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bi)

failed = passed = 0


def check(ok, what, detail=""):
    global failed, passed
    if ok:
        passed += 1
        print("ok   " + what)
    else:
        failed += 1
        print("FAIL " + what + (" — " + str(detail) if detail != "" else ""))


LINK = '<a href="%s" target="_blank" rel="noopener noreferrer">Source + SDK</a>'


def hosted_site(where, build, version, source):
    """A Build-Hosted.cjs-shaped site: index.html with the source link, assets.json with build and version."""
    where.mkdir(parents=True)
    (where / "index.html").write_text("<!doctype html><title>x</title>" + LINK % source + "<script src='a.js'></script>", encoding="utf-8")
    (where / "assets.json").write_text(json.dumps({"build": build, "release": "V01", "version": version, "assets": []}), encoding="utf-8")
    (where / "assets").mkdir()
    (where / "assets" / "a.js").write_text("// asset", encoding="utf-8")


def standalone_site(where, build, version, source):
    """One standalone page (as recover/index.html was): the package inline, no assets.json."""
    where.mkdir(parents=True)
    package = {"build_id": build, "display_version": version, "release_version": "V01", "stock": {"sha256": "2d98ce72" + "0" * 56}, "data": "QUJD"}
    (where / "index.html").write_text("<!doctype html>" + LINK % source + "<script>const FM1_PACKAGE = " + json.dumps(package)
                                      + ";\nconst FM1_SIMULATOR = {\"display_version\":\"" + version + "\"};</script>", encoding="utf-8")


B1 = "d842d29d3243" + "a" * 52
B2 = "8b7dff801f1b0876" + "b" * 48
B3 = "6ada22150430" + "c" * 52
quiet = lambda *_: None

with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    wt, sites = tmp / "gh-pages", tmp / "sites"
    wt.mkdir()
    hosted_site(sites / "v032", B1, "tabby-v03.2", "https://example.invalid/archive/refs/tags/tabby-v03.2.zip")
    standalone_site(sites / "r2", B2, "tabby-v03.3-diag-r2", "https://example.invalid/archive/refs/heads/linux-build.zip")
    hosted_site(sites / "diag", B3, "tabby-v03.3-diag", "https://example.invalid/archive/refs/tags/tabby-v03.3-diag.zip")

    # 1. a hosted site
    bi.add_site(wt, "tabby-v03.2", sites / "v032", published="2026-11-05", note="last release on the 536576 layout", log=quiet)
    index = json.loads((wt / "builds/index.json").read_text())
    e = index["builds"][0]
    check(index["schema"] == 1 and len(index["builds"]) == 1, "1: one entry after the first add", index)
    check(e["tag"] == "tabby-v03.2" and e["build"] == B1 and e["loader"] == "ota-SMK37d842d29d3243aaaa", "1: tag, build id and loader tag", e)
    check(e["version"] == "tabby-v03.2" and e["page"] == "builds/tabby-v03.2/" and e["published"] == "2026-11-05", "1: version, page path, date", e)
    check(e["source"].endswith("tabby-v03.2.zip") and e["note"].startswith("last release"), "1: source link from the page, note kept", e)
    check((wt / "builds/tabby-v03.2/index.html").is_file() and (wt / "builds/tabby-v03.2/assets/a.js").is_file(), "1: the site files were copied")

    # 2. a standalone page
    bi.add_site(wt, "tabby-v03.3-diag-r2", sites / "r2", published="2026-11-08",
                source="https://example.invalid/archive/d9e83f0.zip", log=quiet)
    index = json.loads((wt / "builds/index.json").read_text())
    e = next(x for x in index["builds"] if x["tag"] == "tabby-v03.3-diag-r2")
    check(e["build"] == B2 and e["loader"] == "ota-SMK378b7dff801f1b0876" and e["version"] == "tabby-v03.3-diag-r2", "2: standalone page read from FM1_PACKAGE", e)
    check(e["source"] == "https://example.invalid/archive/d9e83f0.zip", "2: --source overrides the page's link", e["source"])

    # 3. permanence
    hosted_site(sites / "other", B3, "tabby-v03.2-other", "https://example.invalid/x.zip")
    refused = False
    try:
        bi.add_site(wt, "tabby-v03.2", sites / "other", log=quiet)
    except bi.BuildsError as error:
        refused = "permanent" in str(error)
    index = json.loads((wt / "builds/index.json").read_text())
    check(refused, "3: a different build under an existing tag is refused")
    check(next(x for x in index["builds"] if x["tag"] == "tabby-v03.2")["build"] == B1, "3: the refused add changed nothing")
    hosted_site(sites / "v032again", B1, "tabby-v03.2", "https://example.invalid/archive/refs/tags/tabby-v03.2.zip")
    (sites / "v032again" / "assets" / "b.js").write_text("// republished", encoding="utf-8")
    bi.add_site(wt, "tabby-v03.2", sites / "v032again", log=quiet)
    check((wt / "builds/tabby-v03.2/assets/b.js").is_file(), "3: the same build id replaces the directory quietly")
    e = next(x for x in index["builds"] if x["tag"] == "tabby-v03.2")
    index = json.loads((wt / "builds/index.json").read_text())
    e2 = next(x for x in index["builds"] if x["tag"] == "tabby-v03.2")
    check(e2["published"] == "2026-11-05" and e2["note"] == e["note"], "3: date and note survive the republish", e2)
    bi.add_site(wt, "tabby-v03.2", sites / "other", replace=True, log=quiet)
    index = json.loads((wt / "builds/index.json").read_text())
    check(next(x for x in index["builds"] if x["tag"] == "tabby-v03.2")["build"] == B3, "3: --replace overwrites")
    bi.add_site(wt, "tabby-v03.2", sites / "v032again", replace=True, log=quiet)   # back to the real one

    # 4. index rewrite
    hosted_site(wt / "builds" / "tabby-v03.3-diag", B3, "tabby-v03.3-diag", "https://example.invalid/archive/refs/tags/tabby-v03.3-diag.zip")
    (wt / "builds" / "not-a-build").mkdir()                     # no index.html: ignored
    bi.write_index(wt, log=quiet)
    index = json.loads((wt / "builds/index.json").read_text())
    tags = [x["tag"] for x in index["builds"]]
    check(tags == ["tabby-v03.2", "tabby-v03.3-diag-r2", "tabby-v03.3-diag"] or tags == ["tabby-v03.2", "tabby-v03.3-diag", "tabby-v03.3-diag-r2"],
          "4: three builds listed, ordered by date then tag; the empty directory ignored", tags)
    e = next(x for x in index["builds"] if x["tag"] == "tabby-v03.3-diag")
    check(e["published"] == bi.today() and e["loader"] == "ota-SMK376ada22150430cccc", "4: a directory without an entry gets today's date", e)
    check(next(x for x in index["builds"] if x["tag"] == "tabby-v03.2")["published"] == "2026-11-05", "4: dates kept across a rewrite")
    page = (wt / "builds/index.html").read_text()
    check(all(t in page for t in tags) and "ota-SMK378b7dff801f1b0876" in page and "<script" not in page, "4: builds/index.html lists every tag and loader tag, no scripts")
    check("updated" in index and index["updated"].endswith("Z"), "4: the index carries its update time")

    # 5. redirect
    (wt / "recover").mkdir()
    (wt / "recover" / "index.html").write_text("old page", encoding="utf-8")
    (wt / "recover" / "junk.bin").write_bytes(b"\0")
    bi.write_redirect(wt, "recover", "builds/tabby-v03.3-diag-r2/", log=quiet)
    text = (wt / "recover/index.html").read_text()
    check('url=../builds/tabby-v03.3-diag-r2/' in text and 'href="../builds/tabby-v03.3-diag-r2/"' in text, "5: the redirect points one level up into builds/", text)
    check(not (wt / "recover/junk.bin").exists(), "5: the old files are gone")

    # the command line
    import subprocess
    r = subprocess.run([sys.executable, "-I", str(ROOT / "tools/linux/builds-index.py"), "--worktree", str(wt), "add", "--tag", "bad tag", "--site", str(sites / "v032again")],
                       capture_output=True, text=True)
    check(r.returncode == 1 and "plain directory name" in r.stderr, "cli: a tag with a space is refused", r.stderr)
    r = subprocess.run([sys.executable, "-I", str(ROOT / "tools/linux/builds-index.py"), "--worktree", str(wt), "index"], capture_output=True, text=True)
    check(r.returncode == 0 and "3 builds" in r.stdout, "cli: index reports the count", r.stdout + r.stderr)

print(("FAILED" if failed else "passed") + ": %d ok, %d failed (builds-index)" % (passed, failed))
sys.exit(1 if failed else 0)
