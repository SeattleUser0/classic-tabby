#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/builds-index.py — permanent build pages (gh-pages builds/<tag>/) and builds/index.json

Purpose
    Classic Tabby Task 12 A5. Every published build keeps a page of its own at
    https://seattleuser0.github.io/classic-tabby/builds/<tag>/ that is never removed, and
    builds/index.json lists every build (tag, build id, loader tag, page path). The workbench
    reads that index when it meets a Jieli update loader whose tag (ota-SMK37 + the first 16 hex
    digits of the build id) is not its own build: it then names the build the loader waits for
    and links to that build's page instead of refusing silently or timing out (the 2026-11-08
    loader incident, BUILD.md 25.3; sdk/WebUpdate.js loaderMismatch). The main page and the
    probe page keep their places; builds/ is one more top-level directory of gh-pages.

    Nothing here touches a device or pushes anything: the tool only edits a checkout of the
    gh-pages branch (normally the worktree build/gh-pages). tools/linux/publish-pages.py (v0.4)
    calls add_site() and write_index() on every tagged publish, so `make publish TAG=...` adds
    the new build to builds/ and to the index by itself. The historic builds (tabby-v03.2,
    tabby-v03.3-diag, tabby-p0-probe64 and the diag-r2 resume page) were imported once with the
    commands in BUILD.md 26.5.

Commands (from the repository root)
    python3 -I tools/linux/builds-index.py add --tag <tag> --site <dir> [--published YYYY-MM-DD]
        [--note "..."] [--source <url>] [--replace] [--worktree build/gh-pages]
        copy a static site (a Build-Hosted.cjs staging directory, or a directory holding one
        standalone index.html) to builds/<tag>/ and rewrite the index. An existing builds/<tag>/
        with a different build id is refused unless --replace is given; the same build id is
        replaced quietly (a republish of the same package).
    python3 -I tools/linux/builds-index.py index [--worktree build/gh-pages]
        rewrite builds/index.json and builds/index.html from the directories present. Dates
        and notes already in the index are kept; a directory without an index entry gets today.
    python3 -I tools/linux/builds-index.py redirect --path recover --to builds/tabby-v03.3-diag-r2/
        write a small redirect page at <worktree>/<path>/index.html (the old /recover/ address
        keeps working after the page moved under builds/).

builds/index.json (schema 1)
    {"schema": 1, "updated": "<UTC time>", "builds": [
       {"tag": "tabby-v04.0", "build": "<64 hex, the firmware build id>",
        "loader": "ota-SMK37<first 16 hex of build>", "version": "<display version>",
        "page": "builds/tabby-v04.0/", "published": "2026-11-08", "source": "<archive URL>",
        "note": "..."}, ...]}
    "page" is relative to the site root (the gh-pages root); the workbench resolves it against
    the URL it loaded the index from. Entries are ordered by published date, then tag.

Version: 0.2

Revision log
    v0.2  2026-11-14  Task 17: note lines tracked in tools/linux/builds-notes.json are applied to the index and to a page's
                      existing note banner on every rewrite (the correction of the tabby-v04.3 note).
    v0.1  2026-11-08  Initial version (Task 12 A5).
"""

import argparse
import datetime
import hashlib
import html
import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SITE_LINK = re.compile(r'<a href="([^"]+)"[^>]*>(?:源码与 SDK|Source \+ SDK)</a>')       # Build-Hosted.cjs / publish-pages.py; both texts (Task 14)
PACKAGE_LINE = re.compile(r'const FM1_PACKAGE = (\{.*?\});', re.S)   # the standalone page's embedded package
INDEX_NAME = "index.json"
BUILDS_DIR = "builds"


class BuildsError(Exception):
    pass


def today():
    return datetime.datetime.now(datetime.timezone.utc).date().isoformat()


def loader_tag(build_id):
    """The identity the Jieli loader reports while it waits for this build (WebUpdate.js taggedLoader)."""
    return "ota-SMK37" + build_id[:16].lower()


def inspect_site(directory):
    """Build id, display version and source link of one static site directory.

    A Build-Hosted.cjs site carries assets.json (build, version). A single standalone page
    (index.html = SMK37-Open-Source.html, as the recover/ page was) carries the package inline:
    its FM1_PACKAGE object has build_id and display_version."""
    directory = Path(directory)
    page = directory / "index.html"
    if not page.is_file():
        raise BuildsError("%s has no index.html" % directory)
    report_file = directory / "assets.json"
    build = version = None
    if report_file.is_file():
        report = json.loads(report_file.read_text(encoding="utf-8"))
        build, version = report.get("build"), report.get("version") or report.get("release")
    text = page.read_text(encoding="utf-8", errors="replace")
    if not build:
        match = PACKAGE_LINE.search(text)
        if not match:
            raise BuildsError("%s: neither assets.json nor an embedded FM1_PACKAGE" % directory)
        package = json.loads(match.group(1))
        build, version = package.get("build_id"), package.get("display_version") or package.get("release_version")
    if not re.fullmatch(r"[0-9a-f]{64}", build or ""):
        raise BuildsError("%s: build id %r is not 64 hex digits" % (directory, build))
    link = SITE_LINK.search(text)
    return {"build": build, "version": version or "", "source": link.group(1) if link else ""}


def read_index(worktree):
    path = Path(worktree) / BUILDS_DIR / INDEX_NAME
    if not path.is_file():
        return {"schema": 1, "builds": []}
    index = json.loads(path.read_text(encoding="utf-8"))
    if index.get("schema") != 1 or not isinstance(index.get("builds"), list):
        raise BuildsError("%s is not a schema 1 builds index" % path)
    return index


def scan_builds(worktree):
    """One entry per builds/<tag>/ directory with a page in it (sorted by name)."""
    builds = Path(worktree) / BUILDS_DIR
    if not builds.is_dir():
        return []
    entries = []
    for child in sorted(builds.iterdir()):
        if child.is_dir() and (child / "index.html").is_file():
            info = inspect_site(child)
            entries.append({"tag": child.name, "build": info["build"], "loader": loader_tag(info["build"]),
                            "version": info["version"], "page": "%s/%s/" % (BUILDS_DIR, child.name),
                            "published": "", "source": info["source"], "note": ""})
    return entries


NOTES_FILE = ROOT / "tools/linux/builds-notes.json"
BANNER = re.compile(r'(<p style="margin:0;padding:10px 14px;background:#b00020;color:#fff;font:600 15px/1\.4 system-ui,sans-serif">)(.*?)(</p>)', re.S)


def tracked_notes(path=None):
    """v0.2: {tag: {"text", "link"}} from tools/linux/builds-notes.json (the note lines kept in the repository)."""
    path = Path(path or NOTES_FILE)
    if not path.is_file():
        return {}
    notes = json.loads(path.read_text(encoding="utf-8")).get("notes") or {}
    for tag, note in notes.items():
        if not isinstance(note, dict) or not isinstance(note.get("text"), str) or "<" in note["text"] or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", note.get("link") or "x"):
            raise BuildsError("builds-notes.json: the note of %s must be {\"text\": plain text, \"link\": a tag or nothing}" % tag)
    return notes


def apply_note_banner(worktree, tag, note, log=print):
    """v0.2: a builds/<tag>/ page that already carries a note banner gets the tracked text (and link); assets.json
    follows. A page without a banner is left alone: this never adds or removes anything else."""
    page = Path(worktree) / BUILDS_DIR / tag / "index.html"
    if not page.is_file():
        return False
    text = page.read_text(encoding="utf-8")
    inner = html.escape(note["text"]) + ((' <a style="color:#fff" href="../%s/">builds/%s/</a>' % (note["link"], note["link"])) if note.get("link") else "")
    found = BANNER.search(text)
    if not found or found.group(2) == inner:
        return False
    old = page.read_bytes()
    page.write_text(text[:found.start(2)] + inner + text[found.end(2):], encoding="utf-8")
    new = page.read_bytes()
    assets = page.parent / "assets.json"
    if assets.is_file():
        raw = assets.read_text(encoding="utf-8")
        before = '"bytes": %d,\n      "sha256": "%s"' % (len(old), hashlib.sha256(old).hexdigest())
        if before in raw:
            assets.write_text(raw.replace(before, '"bytes": %d,\n      "sha256": "%s"' % (len(new), hashlib.sha256(new).hexdigest())), encoding="utf-8")
    log("builds/%s/: note line set to: %s" % (tag, note["text"]))
    return True


def write_index(worktree, log=print, notes=None):
    """Rewrite builds/index.json (keeping dates, notes and source overrides already there) and builds/index.html."""
    worktree = Path(worktree)
    notes = tracked_notes() if notes is None else notes
    previous = {entry.get("tag"): entry for entry in read_index(worktree)["builds"]}
    entries = scan_builds(worktree)
    for entry in entries:
        old = previous.get(entry["tag"]) or {}
        entry["published"] = old.get("published") or today()
        entry["note"] = old.get("note") or ""
        if entry["tag"] in notes:             # v0.2: a note line tracked in the repository wins, and the page's banner follows
            entry["note"] = notes[entry["tag"]]["text"]
            apply_note_banner(worktree, entry["tag"], notes[entry["tag"]], log)
        if old.get("source"):                 # an explicit source (commit archive) beats the page's link
            entry["source"] = old["source"]
        if old.get("version") and not entry["version"]:
            entry["version"] = old["version"]
    entries.sort(key=lambda e: (e["published"], e["tag"]))
    index = {"schema": 1, "updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
             "builds": entries}
    builds = worktree / BUILDS_DIR
    builds.mkdir(parents=True, exist_ok=True)
    (builds / INDEX_NAME).write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (builds / "index.html").write_text(index_page(entries), encoding="utf-8")
    log("builds/index.json: %d builds (%s)" % (len(entries), ", ".join(e["tag"] for e in entries)))
    return index


def index_page(entries):
    """A static list of the builds (no scripts, no external resources): the human-readable side of index.json."""
    rows = []
    for e in entries:
        source = ('<a href="%s">source</a>' % html.escape(e["source"])) if e.get("source") else ""
        rows.append("<tr><td><a href=\"../%s\">%s</a></td><td><code>%s</code></td><td><code>%s</code></td>"
                    "<td>%s</td><td>%s</td><td>%s</td></tr>"
                    % (html.escape(e["page"]), html.escape(e["tag"]), html.escape(e["build"][:16]),
                       html.escape(e["loader"]), html.escape(e["published"]), source, html.escape(e.get("note") or "")))
    return ("<!doctype html>\n<!-- SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception -->\n"
            "<!-- Generated by tools/linux/builds-index.py; the data is index.json next to this file. -->\n"
            "<html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n"
            "<title>Classic Tabby builds</title>\n"
            "<style>body{font:15px/1.5 system-ui,sans-serif;max-width:60em;margin:2em auto;padding:0 1em;color:#eee;background:#0e0c1a}"
            "a{color:#8fe8ee}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #393148;padding:.4em .6em;text-align:left;vertical-align:top}"
            "code{font-size:13px}</style>\n"
            "<h1>Classic Tabby builds</h1>\n"
            "<p>Every published build keeps its page here; nothing is removed. If the device's update loader waits for a build "
            "(its USB MIDI name reads <code>ota-SMK37</code> + 16 hex digits), open the page whose loader tag matches and continue "
            "the install from there. Back up before installing a build that moves the storage (tabby-v04.0 and later over v03.x).</p>\n"
            "<table><tr><th>Build</th><th>Build id</th><th>Loader tag</th><th>Published</th><th>Source</th><th>Note</th></tr>\n"
            + "\n".join(rows) + "\n</table>\n<p><a href=\"index.json\">index.json</a> · <a href=\"../\">main page</a></p>\n")


def add_site(worktree, tag, site, published=None, note=None, source=None, replace=False, log=print):
    """Copy a site directory to builds/<tag>/ (refusing to overwrite a different build) and rewrite the index."""
    worktree, site = Path(worktree), Path(site)
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", tag):
        raise BuildsError("tag %r is not a plain directory name" % tag)
    info = inspect_site(site)
    target = worktree / BUILDS_DIR / tag
    if target.exists():
        existing = inspect_site(target)
        if existing["build"] != info["build"] and not replace:
            raise BuildsError("builds/%s/ already holds build %s (new: %s); pages are permanent. Use another tag, or --replace to overwrite."
                              % (tag, existing["build"][:16], info["build"][:16]))
        shutil.rmtree(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(site, target, ignore=shutil.ignore_patterns(".git", ".nojekyll"))
    index = read_index(worktree)
    entries = [e for e in index["builds"] if e.get("tag") != tag]
    old = next((e for e in index["builds"] if e.get("tag") == tag), {})
    entries.append({"tag": tag, "build": info["build"], "loader": loader_tag(info["build"]), "version": info["version"],
                    "page": "%s/%s/" % (BUILDS_DIR, tag), "published": published or old.get("published") or today(),
                    "source": source or old.get("source") or info["source"], "note": note if note is not None else old.get("note", "")})
    index["builds"] = entries
    (worktree / BUILDS_DIR).mkdir(parents=True, exist_ok=True)
    (worktree / BUILDS_DIR / INDEX_NAME).write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    log("builds/%s/: build %s, version %s, loader %s" % (tag, info["build"][:16], info["version"], loader_tag(info["build"])))
    return write_index(worktree, log)


def write_redirect(worktree, path, to, log=print):
    """A redirect page (meta refresh plus a link) at <worktree>/<path>/index.html pointing at <to> (site-root relative)."""
    worktree = Path(worktree)
    target_dir = worktree / path.strip("/")
    depth = len([p for p in path.strip("/").split("/") if p])
    relative = "../" * depth + to.lstrip("/")
    target_dir.mkdir(parents=True, exist_ok=True)
    for child in list(target_dir.iterdir()):          # the old page's files go; the address stays
        shutil.rmtree(child) if child.is_dir() else child.unlink()
    (target_dir / "index.html").write_text(
        "<!doctype html>\n<!-- SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception -->\n"
        "<!-- Generated by tools/linux/builds-index.py redirect: this page moved to %s -->\n"
        "<html lang=\"en\"><meta charset=\"utf-8\"><meta http-equiv=\"refresh\" content=\"0; url=%s\">\n"
        "<title>Moved</title><p>This page moved to <a href=\"%s\">%s</a>.</p>\n"
        % (html.escape(to), html.escape(relative), html.escape(relative), html.escape(to)), encoding="utf-8")
    log("%s/index.html -> %s" % (path.strip("/"), to))


def main(argv=None):
    parser = argparse.ArgumentParser(description="Permanent build pages under gh-pages builds/ and builds/index.json.")
    parser.add_argument("--worktree", default=str(ROOT / "build/gh-pages"), help="a checkout of gh-pages (default build/gh-pages)")
    sub = parser.add_subparsers(dest="command", required=True)
    add = sub.add_parser("add", help="copy a site to builds/<tag>/ and rewrite the index")
    add.add_argument("--tag", required=True)
    add.add_argument("--site", required=True, help="a Build-Hosted.cjs staging directory, or a directory with one standalone index.html")
    add.add_argument("--published", help="YYYY-MM-DD (default: kept from the index, else today)")
    add.add_argument("--note", help="a short note shown in the list")
    add.add_argument("--source", help="the source archive URL (default: the page's own link)")
    add.add_argument("--replace", action="store_true", help="overwrite builds/<tag>/ even when it holds a different build")
    sub.add_parser("index", help="rewrite builds/index.json and builds/index.html from the directories")
    redirect = sub.add_parser("redirect", help="write a redirect page at <path>/index.html")
    redirect.add_argument("--path", required=True, help="directory inside the worktree, e.g. recover")
    redirect.add_argument("--to", required=True, help="site-root-relative target, e.g. builds/tabby-v03.3-diag-r2/")
    args = parser.parse_args(argv)
    try:
        if args.command == "add":
            add_site(args.worktree, args.tag, args.site, args.published, args.note, args.source, args.replace)
        elif args.command == "index":
            write_index(args.worktree)
        else:
            write_redirect(args.worktree, args.path, args.to)
        return 0
    except (BuildsError, OSError, ValueError) as error:
        sys.stderr.write("error: %s\n" % error)
        return 1


if __name__ == "__main__":
    sys.exit(main())
