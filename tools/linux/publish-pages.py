#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/publish-pages.py — static site from the packaged workbench, published to gh-pages

Purpose
    The last two steps of HOSTING.md on Linux, for Classic Tabby (Task 02):

      1. run tools/Build-Hosted.cjs on build/official-web/<model>/SMK37-Open-Source.html
         (the complete workbench with the firmware and the stock V16 image embedded, made
         by `python3 tools/linux/build.py --package`, i.e. `make package`) to get a static
         site in a fresh staging directory (default build/hosted/<model>);
      2. optionally copy that site into the gh-pages branch of this repository through a
         git worktree, commit it, and push it to the GitHub remote, from where GitHub
         Pages serves it. The firmware is never built on GitHub: the toolchains stay on
         this machine and only prebuilt files are uploaded (the user's requirement for
         Task 02).

    Safety checks before anything is committed:
      * the HTML's source link ("源码与 SDK") must be an https URL and, when --source-url
        is given, exactly that URL. The GPL source offer in the page has to point at the
        archive of the tag that was built;
      * with --tag, HEAD must carry that tag and the working tree must be clean (ignored
        files such as build/ do not count), so the archive GitHub serves for the tag is
        the tree that produced the firmware. With --push the tag must also already exist on
        the remote with the same commit id, otherwise the source link would be dead;
      * the staging directory and the worktree are only ever created under build/.

    Nothing here touches a device. The site only becomes active when a browser opens it.

    Git identity: this repository has no user.name/user.email configured. When neither
    git config nor GIT_AUTHOR_NAME/GIT_COMMITTER_NAME are set, the author of HEAD is used
    for the gh-pages commit. Pushing uses the GitHub CLI's credential helper
    (`gh auth git-credential`) for this one command, so no global git config is changed.

Usage (from the repository root)
    python3 -I tools/linux/publish-pages.py --model pro                 # static site only
    python3 -I tools/linux/publish-pages.py --model pro --tag tabby-v01.0 \
        --source-url https://github.com/<owner>/<repo>/archive/refs/tags/tabby-v01.0.zip \
        --commit --push                                                   # + gh-pages

Version: 0.4

Revision log
    v0.4  2026-11-08  Task 12 A5: every tagged publish also lands in builds/<tag>/ and in builds/index.json
                      (tools/linux/builds-index.py), the permanent build pages the workbench's stale-loader
                      message links to; a root publish keeps builds/ and recover/ too (--keep default).
                      --no-builds skips that step.
    v0.3  2026-11-07  Task 11: a site can live in a subdirectory of gh-pages (--site-dir probe64:
                      the probe's own page); publishing the root site keeps the subdirectories
                      named by --keep (default: probe64), so the main page never deletes, links
                      to or offers the probe, and the probe never replaces the main page.
    v0.2  2026-11-04  Task 08: the log line and the gh-pages commit body carry the display
                      version (assets.json "version", from Build-Hosted.cjs).
    v0.1  2026-11-02  Initial version (Task 02, Steps 3 and 5). Static site via
                      tools/Build-Hosted.cjs, gh-pages worktree update, push with the gh
                      credential helper, .nojekyll, tag/clean-tree/source-link checks.
"""

import argparse
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent


def builds_index():
    """tools/linux/builds-index.py as a module (its file name has a hyphen, so importlib loads it)."""
    spec = importlib.util.spec_from_file_location("builds_index", HERE / "builds-index.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
SITE_LINK = re.compile(r'<a href="([^"]+)"[^>]*>(?:源码与 SDK|Source \+ SDK)</a>')   # same pattern as Build-Hosted.cjs; Task 14: English since tabby-v04.2, the older pages say 源码与 SDK


class PublishError(Exception):
    pass


def git(args, cwd=ROOT, check=True, capture=True, env=None):
    """Run git in the repository (or a worktree) and return stdout stripped."""
    result = subprocess.run(["git"] + args, cwd=str(cwd), text=True, env=env,
                            stdout=subprocess.PIPE if capture else None, stderr=subprocess.PIPE if capture else None)
    if check and result.returncode != 0:
        raise PublishError("git %s failed: %s" % (" ".join(args), (result.stderr or "").strip()))
    return (result.stdout or "").strip()


def under_build(path):
    """Refuse to delete anything that is not inside <repo>/build/."""
    resolved = Path(path).resolve()
    build = (ROOT / "build").resolve()
    if resolved == build or build not in resolved.parents:
        raise PublishError("%s is not under %s; refusing to touch it." % (resolved, build))
    return resolved


# ---- Step 1: static site --------------------------------------------------------------------
def build_site(html, staging, node, source_url, log):
    html = Path(html).resolve()
    if not html.is_file():
        raise PublishError("%s is missing; run `make package` first." % html)
    text = html.read_text(encoding="utf-8")
    link = SITE_LINK.search(text)
    if not link:
        raise PublishError("The workbench has no source archive link; it was not built with --package.")
    if not link.group(1).startswith("https://"):
        raise PublishError("The source archive link is not https: %s" % link.group(1))
    if source_url and link.group(1) != source_url:
        raise PublishError("The workbench links to %s, expected %s. Rebuild with `make package FM1_SOURCE_URL=...`."
                           % (link.group(1), source_url))
    staging = under_build(staging)
    if staging.exists():
        shutil.rmtree(staging)              # Build-Hosted.cjs insists on a new directory
    staging.parent.mkdir(parents=True, exist_ok=True)
    log("Build-Hosted.cjs -> %s" % staging)
    result = subprocess.run([node, str(ROOT / "tools/Build-Hosted.cjs"), str(html), str(staging)], cwd=str(ROOT))
    if result.returncode != 0:
        raise PublishError("tools/Build-Hosted.cjs failed (exit %d)." % result.returncode)
    for name in ("index.html", "smk37-workbench.html", "SMK37-Open-Source.html", "assets.json"):
        if not (staging / name).is_file():
            raise PublishError("Build-Hosted.cjs did not write %s." % name)
    report = json.loads((staging / "assets.json").read_text(encoding="utf-8"))
    # GitHub Pages runs Jekyll unless told not to; Jekyll would skip nothing here but it
    # is slower and ignores underscore paths, so opt out explicitly.
    (staging / ".nojekyll").write_bytes(b"")
    log("Site: build %s, release %s, version %s, %d assets, entry %d bytes, standalone %d bytes"
        % (report.get("build"), report.get("release"), report.get("version"), len(report.get("assets", [])),
           report.get("entryBytes", 0), report.get("standaloneBytes", 0)))
    return staging, report, link.group(1)


# ---- Step 2: gh-pages branch ----------------------------------------------------------------
def check_tag(tag, push, remote, log):
    head = git(["rev-parse", "HEAD"])
    tags = git(["tag", "--points-at", "HEAD"]).split()
    if tag not in tags:
        raise PublishError("HEAD (%s) does not carry tag %s; the source link would not match the firmware."
                           % (head[:12], tag))
    dirty = git(["status", "--porcelain", "--untracked-files=no"])
    if dirty:
        raise PublishError("The working tree has uncommitted changes:\n%s" % dirty)
    if push:
        remote_ref = git(["ls-remote", "--tags", remote, "refs/tags/%s" % tag])
        if not remote_ref:
            raise PublishError("Tag %s is not on %s yet; push it first (git push %s %s)." % (tag, remote, remote, tag))
        # ls-remote lists the tag object for an annotated tag, the commit for a lightweight one.
        remote_sha = remote_ref.split()[0]
        local_sha = git(["rev-parse", tag])
        if remote_sha != local_sha:
            raise PublishError("Tag %s on %s (%s) differs from the local tag (%s)." % (tag, remote, remote_sha[:12], local_sha[:12]))
    log("Tag %s is on HEAD %s; working tree clean." % (tag, head[:12]))
    return head


def commit_env():
    """Author/committer identity for the gh-pages commit (see module docstring)."""
    env = dict(os.environ)
    have_config = git(["config", "user.name"], check=False) and git(["config", "user.email"], check=False)
    if not have_config and not env.get("GIT_AUTHOR_NAME"):
        name, email = git(["log", "-1", "--format=%an%n%ae"]).split("\n")
        env.setdefault("GIT_AUTHOR_NAME", name)
        env.setdefault("GIT_AUTHOR_EMAIL", email)
    env.setdefault("GIT_COMMITTER_NAME", env.get("GIT_AUTHOR_NAME", ""))
    env.setdefault("GIT_COMMITTER_EMAIL", env.get("GIT_AUTHOR_EMAIL", ""))
    return env


def update_branch(staging, report, source_url, args, log):
    branch, remote = args.branch, args.remote
    worktree = under_build(args.worktree)
    git(["worktree", "prune"])
    if worktree.exists():
        git(["worktree", "remove", "--force", str(worktree)], check=False)
        if worktree.exists():
            shutil.rmtree(worktree)
    env = commit_env()
    local = subprocess.run(["git", "show-ref", "--verify", "--quiet", "refs/heads/%s" % branch],
                           cwd=str(ROOT)).returncode == 0
    if args.push or args.fetch:
        # Start from what GitHub currently serves so the history continues.
        fetched = subprocess.run(["git", "fetch", remote, branch], cwd=str(ROOT), stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if fetched.returncode == 0:
            if local:
                git(["branch", "-f", branch, "%s/%s" % (remote, branch)])
            else:
                git(["branch", "--track", branch, "%s/%s" % (remote, branch)])
            local = True
            log("Fetched %s/%s." % (remote, branch))
        else:
            log("%s has no %s branch yet; it will be created." % (remote, branch))
    if local:
        git(["worktree", "add", str(worktree), branch])
    else:
        git(["worktree", "add", "--detach", str(worktree), "HEAD"])
        git(["checkout", "--orphan", branch], cwd=worktree)
        git(["rm", "-rfq", "."], cwd=worktree, check=False)
        for child in list(worktree.iterdir()):
            if child.name != ".git":
                shutil.rmtree(child) if child.is_dir() else child.unlink()
    site_dir = (worktree / args.site_dir).resolve()
    if worktree not in site_dir.parents and site_dir != worktree:
        raise PublishError("--site-dir must stay inside the worktree.")
    keep = set(args.keep or []) if site_dir == worktree else set()   # v0.3: other sites under the root
    if site_dir.exists():
        for child in list(site_dir.iterdir()):
            if child.name == ".git" or child.name in keep:
                continue
            shutil.rmtree(child) if child.is_dir() else child.unlink()
    shutil.copytree(staging, site_dir, dirs_exist_ok=True)
    (worktree / ".nojekyll").write_bytes(b"")
    # v0.4 (Task 12 A5): the permanent page of this build and the index the workbench reads.
    permanent = ""
    if args.tag and not args.no_builds:
        builds_index().add_site(worktree, args.tag, staging, note=args.note, log=log)
        permanent = "Permanent page: builds/%s/ (builds/index.json updated)\n" % args.tag
    git(["add", "-A"], cwd=worktree)
    if not git(["status", "--porcelain"], cwd=worktree):
        log("gh-pages already holds this site; nothing to commit.")
        return None
    where = "" if site_dir == worktree else " in %s/" % args.site_dir.strip("/")   # v0.3
    subject = "Pages: %s%s (build %s, release %s)" % (args.tag or "untagged", where, (report.get("build") or "")[:12], report.get("release"))
    body = ("Static site from build/official-web/%s/SMK37-Open-Source.html via tools/Build-Hosted.cjs.\n"
            "Source archive link: %s\nFirmware build_id: %s\nDisplay version: %s\nSource commit: %s\n%s"
            % (args.model, source_url, report.get("build"), report.get("version"), git(["rev-parse", "HEAD"]), permanent))
    git(["commit", "-q", "-m", subject, "-m", body], cwd=worktree, env=env)
    sha = git(["rev-parse", "HEAD"], cwd=worktree)
    log("Committed %s on %s: %s" % (sha[:12], branch, subject))
    if args.push:
        cmd = ["-c", "credential.helper=!gh auth git-credential", "push", remote, "%s:%s" % (branch, branch)]
        git(cmd, cwd=worktree, capture=False)
        log("Pushed %s to %s." % (branch, remote))
    return sha


def main(argv=None):
    parser = argparse.ArgumentParser(description="Static SMK37 workbench site and gh-pages publication.")
    parser.add_argument("--model", choices=("pro", "elite"), default="pro")
    parser.add_argument("--html", help="complete workbench (default build/official-web/<model>/SMK37-Open-Source.html)")
    parser.add_argument("--staging", help="new output directory for Build-Hosted.cjs (default build/hosted/<model>)")
    parser.add_argument("--node", default=os.environ.get("NODE", "/usr/bin/node"), help="Node binary (default /usr/bin/node)")
    parser.add_argument("--source-url", default=os.environ.get("FM1_SOURCE_URL"),
                        help="the source archive URL the page must link to (FM1_SOURCE_URL)")
    parser.add_argument("--tag", help="git tag that must be on HEAD (and on the remote with --push)")
    parser.add_argument("--commit", action="store_true", help="copy the site into the gh-pages worktree and commit")
    parser.add_argument("--push", action="store_true", help="also push gh-pages to the remote (implies --commit)")
    parser.add_argument("--fetch", action="store_true", help="start from the remote gh-pages even without --push")
    parser.add_argument("--remote", default="origin")
    parser.add_argument("--branch", default="gh-pages")
    parser.add_argument("--worktree", default=str(ROOT / "build/gh-pages"), help="worktree path (must be under build/)")
    parser.add_argument("--site-dir", default=".", help="directory inside the branch that receives the site (default root)")
    parser.add_argument("--keep", action="append", default=None,
                        help="v0.3: a top-level directory a root publish leaves alone (repeatable; default probe64, builds, recover)")
    parser.add_argument("--no-builds", action="store_true", help="v0.4: do not add the build to builds/<tag>/ and builds/index.json")
    parser.add_argument("--note", help="v0.4: a short note for the build's index entry")
    args = parser.parse_args(argv)
    if args.keep is None:
        args.keep = ["probe64", "builds", "recover"]
    if args.push:
        args.commit = True
    html = args.html or str(ROOT / "build/official-web" / args.model / "SMK37-Open-Source.html")
    staging = args.staging or str(ROOT / "build/hosted" / args.model)

    def log(message):
        print(message, flush=True)

    try:
        if args.tag:
            check_tag(args.tag, args.push, args.remote, log)
        elif args.commit:
            log("WARNING: no --tag given; the gh-pages commit will not be tied to a tagged source archive.")
        staging, report, source_url = build_site(html, staging, args.node, args.source_url, log)
        if args.commit:
            update_branch(staging, report, source_url, args, log)
        else:
            log("Static site ready in %s (not committed; add --commit/--push)." % staging)
        return 0
    except PublishError as error:
        sys.stderr.write("error: %s\n" % error)
        return 1


if __name__ == "__main__":
    sys.exit(main())
