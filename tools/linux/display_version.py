#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/display_version.py — the Classic Tabby version shown to the user (Task 08)

Purpose
    One source for the display version: the string the device draws on its boot screen,
    the workbench shows in its header badge and on the update tab, and the hosted site
    records in assets.json. It is separate from FM1_RELEASE_VERSION in app/version.h,
    which stays "V01": that label is the Open firmware identity (SMK-37 Pro_8000001), the
    loader and the workbench's update and factory-restore checks depend on it, and it does
    not change with a Classic Tabby release.

    The display version comes from git at build time:
      * HEAD exactly on a tag:          the tag, e.g. "tabby-v03.1" ("-dirty" appended when
                                        tracked files are modified);
      * HEAD after a tag:               git describe --tags --long --dirty, e.g.
                                        "tabby-v03.0-4-g0c32d69";
      * no git (a source archive):      the VERSION file at the repository root, which git
                                        archive expands through the export-subst attribute
                                        ($Format:%(describe:tags)$); an unexpanded file is
                                        refused, so a build from a plain copy of the tree
                                        must pass the version explicitly;
      * --display-version / FM1_DISPLAY_VERSION: an explicit value wins over all of the
                                        above (the release gate builds with the old label
                                        this way).

    Used by tools/linux/build.py (-DFM1_DISPLAY_VERSION for every firmware unit, the build
    identity, the package JSON) and tools/linux/build-web.py (the same define for the
    simulator, the FM1_SIMULATOR JSON). Run directly it prints the version, for the Makefile
    and the tests.

Version: 0.1

Revision log
    v0.1  2026-11-04  Initial version (Task 08, version display).
"""

import re
import subprocess
import sys
from pathlib import Path

PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._+-]{0,39}$")
PLACEHOLDER = "$Format"


class DisplayVersionError(Exception):
    pass


def validate(value, origin):
    value = value.strip()
    if not PATTERN.match(value):
        raise DisplayVersionError("Display version from %s is not a plain version string: %r" % (origin, value))
    return value


def git(root, args):
    try:
        result = subprocess.run(["git", "-C", str(root)] + args, capture_output=True, text=True)
    except OSError:
        return None
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def display_version(root, explicit=None):
    """Return the display version for the tree at `root` (see the module docstring)."""
    if explicit:
        return validate(explicit, "the command line")
    root = Path(root)
    inside = git(root, ["rev-parse", "--is-inside-work-tree"])
    if inside == "true":
        dirty = bool(git(root, ["status", "--porcelain", "--untracked-files=no"]))
        exact = git(root, ["describe", "--tags", "--exact-match", "HEAD"])
        if exact:
            return validate(exact + ("-dirty" if dirty else ""), "git describe")
        described = git(root, ["describe", "--tags", "--long", "--dirty", "--always"])
        if described:
            return validate(described, "git describe")
        raise DisplayVersionError("git describe failed; pass --display-version.")
    version_file = root / "VERSION"
    if not version_file.is_file():
        raise DisplayVersionError("No git repository and no VERSION file; pass --display-version.")
    text = version_file.read_text(encoding="utf-8")
    if PLACEHOLDER in text:
        raise DisplayVersionError("VERSION holds an unexpanded placeholder (this tree is not a git archive); "
                                  "pass --display-version or FM1_DISPLAY_VERSION.")
    return validate(text, "the VERSION file")


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    root = Path(__file__).resolve().parent.parent.parent
    explicit = argv[0] if argv else None
    try:
        print(display_version(root, explicit))
        return 0
    except DisplayVersionError as error:
        sys.stderr.write("error: %s\n" % error)
        return 1


if __name__ == "__main__":
    sys.exit(main())
