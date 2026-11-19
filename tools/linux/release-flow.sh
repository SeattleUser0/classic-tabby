#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
#
# tools/linux/release-flow.sh — the whole release flow of SPEC 17.13, unattended
#
# Purpose
#   release-flow.sh TAG RC OUT [BACKUP_URL]
#     1. the tree must be clean and docs/releases/TAG.md must exist
#     2. make suite DISPLAY_VERSION=TAG                      (the suite gate, hard limit 5)
#     3. tag TAG-rcRC on HEAD, push the branch and the tag; fetch gh-pages
#     4. make rc                                             (only builds/TAG-rcRC/ is published)
#     5. tools/linux/hw/rc-validate.py                       (backup, ONE install from the candidate's page, every
#                                                             device test, full backup, restore, verify; marks the
#                                                             device gate when all of it passed)
#     6. only then: tag TAG on the same commit, push it, make promote (main page, builds/TAG/, GitHub release),
#        fast-forward the main worktree
#   A failure in 2 to 5 stops here: the candidate's page stays, nothing reaches the main page. Give the failed
#   candidate a note line in tools/linux/builds-notes.json with the next commit.
#
#   Only the release session runs this (SPEC 17.12): it sets TABBY_RELEASE_SESSION=1, without which
#   tools/linux/publish-pages.py commits nothing.
#
# Version: 0.2
#
# Revision log
#   v0.2  2026-11-19  TABBY_NO_PROMOTE=1 (tabby-v1.2: candidate 1 makes the device's screen pictures, candidate 2 carries them).
#   v0.1  2026-11-17  First version (the user's release-flow rule).
T=$1; RC=$2; O=$3; BK=$4
[ -n "$T" ] && [ -n "$RC" ] && [ -n "$O" ] || { echo "usage: release-flow.sh TAG RC OUT [BACKUP_URL]"; exit 2; }
cd "$(dirname "$0")/../.." || exit 1
[ -f ~/gitenv.sh ] && . ~/gitenv.sh
export TABBY_RELEASE_SESSION=1
BRANCH=$(git rev-parse --abbrev-ref HEAD)
PY=${TABBY_HW_PYTHON:-$HOME/fm1-hw/hwvenv/bin/python3}
mkdir -p "$O"
[ -z "$(git status --porcelain)" ] || { echo "release-flow: the tree is not clean"; exit 1; }
[ -f "docs/releases/$T.md" ] || { echo "release-flow: write docs/releases/$T.md first"; exit 1; }
if git rev-parse -q --verify "refs/tags/$T" > /dev/null; then echo "release-flow: tag $T exists already (tags are never moved)"; exit 1; fi
if git rev-parse -q --verify "refs/tags/$T-rc$RC" > /dev/null; then echo "release-flow: tag $T-rc$RC exists already: use the next candidate number"; exit 1; fi
if ! python3 -I tools/linux/suite-gate.py check --display "$T" > /dev/null; then
  make suite DISPLAY_VERSION="$T" > "$O/suite-$T-rc$RC.log" 2>&1 || { echo "SUITE FAILED"; grep -i "fail" "$O/suite-$T-rc$RC.log" | grep -v "0 failed" | head -20; tail -5 "$O/suite-$T-rc$RC.log"; exit 1; }
fi
python3 -I tools/linux/suite-gate.py check --display "$T" || exit 1
git fetch -q origin gh-pages || exit 1
git tag -a "$T-rc$RC" -m "$T release candidate $RC" || exit 1
git push -q origin "$BRANCH" "$BRANCH:classic-tabby/linux-build" "$T-rc$RC" || exit 1
make rc TAG="$T" RC="$RC" DISPLAY_VERSION="$T" > "$O/rc-$T-rc$RC.log" 2>&1 || { echo "make rc FAILED"; tail -8 "$O/rc-$T-rc$RC.log"; exit 1; }
tail -1 "$O/rc-$T-rc$RC.log"
"$PY" tools/linux/hw/rc-validate.py --tag "$T" --rc "$RC" --out "$O" ${BK:+--backup-url "$BK"} ${TABBY_RC_ARGS:-} || { echo "release-flow: $T-rc$RC did NOT pass on the device; nothing promoted"; exit 1; }
python3 -I tools/linux/device-gate.py check --tag "$T" || exit 1
# v0.2: TABBY_NO_PROMOTE=1 stops here: a candidate whose device run makes something the release itself needs (the
# device's own screen pictures for the manual) is followed by the next candidate, which is the one promoted.
[ -z "$TABBY_NO_PROMOTE" ] || { echo "release-flow: $T-rc$RC passed on the device; NOT promoted (TABBY_NO_PROMOTE)"; exit 0; }
git fetch -q origin gh-pages || exit 1
git tag -a "$T" -m "$T" || exit 1
git push -q origin "$T" || exit 1
make promote TAG="$T" DISPLAY_VERSION="$T" > "$O/promote-$T.log" 2>&1 || { echo "make promote FAILED"; tail -8 "$O/promote-$T.log"; exit 1; }
tail -2 "$O/promote-$T.log"
[ -d ../firmware ] && git -C ../firmware merge -q --ff-only "$BRANCH"
echo "RELEASED $T (candidate $RC)"
