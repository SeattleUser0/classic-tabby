/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
#ifndef FM1_VERSION_H
#define FM1_VERSION_H

#define FM1_RELEASE_VERSION "V01"
#define FM1_UPDATE_PRODUCT_PRO "SMK-37 Pro_8000001"
#define FM1_UPDATE_PRODUCT_ELITE "SMK-37 Elite_8000001"

/* Classic Tabby (Task 08, 2026-11-04): the version shown to the user, set by the build as
 * -DFM1_DISPLAY_VERSION from tools/linux/display_version.py (the git tag, e.g. "tabby-v03.1").
 * Without the flag (sdk/Build.ps1, the host test build) it falls back to the Open label
 * above. FM1_RELEASE_VERSION and the update identities are the firmware's identity: the
 * loader, the workbench's update checks and the factory restore depend on them, and they
 * do not change with a Classic Tabby release. */
#ifndef FM1_DISPLAY_VERSION
#define FM1_DISPLAY_VERSION FM1_RELEASE_VERSION
#endif

#endif
