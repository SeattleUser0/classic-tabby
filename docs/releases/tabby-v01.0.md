# Classic Tabby tabby-v01.0 — SMK37 Open V01, unmodified, built on Linux

This release is the **unmodified SMK37 Open V01 firmware** for the M-VAVE SMK-37 Pro,
built on Ubuntu Linux with the project's reproducible build environment (Task 01). No
firmware behaviour has been changed. It is the starting point for the Classic Tabby fork.

- Firmware build ID: `e3344029ab696c7395093fdddc5c3f949bbd47d8b605a78e6f691af664e0d12e`
- It differs from M-VAVE's official V01 release (build ID `4c9e0084…`) **only in the build
  identity**: the official source kit stores two app files with CRLF line endings, this
  repository stores them with LF, and the build ID hashes the source bytes. Building the
  official kit tree with these same tools reproduces the official package byte for byte
  (SHA-256 `09fc9346…`), and the Linux native toolchain and the Windows toolchain under Wine
  produce byte-identical output. See docs/BUILD.md sections 5 and 9.
- **Not hardware-validated yet.** This build has not been flashed to a device. The first
  flash is a manual step through the workbench with a backup made first.

## Files

| File | Purpose |
| --- | --- |
| `SMK37_PRO_OPEN.fwsc` | Firmware package for the SMK-37 Pro (the workbench writes it; it is not a file to copy onto the device) |
| `SMK37-Open-Source.html` | Offline workbench with this firmware and the stock V16 restore image embedded; open in desktop Chrome or Edge |
| `SHA256SUMS.txt` | SHA-256 of the two files above |

Hosted workbench (same content, served over HTTPS for WebMIDI):
https://seattleuser0.github.io/classic-tabby/

## Source

The page's "Source and SDK" link and this release point at the archive of this tag,
https://github.com/SeattleUser0/classic-tabby/archive/refs/tags/tabby-v01.0.zip, which is
the exact tree the firmware was built from (GPLv3 with the SMK37 SDK linking exception;
SDK and resource terms in THIRD_PARTY.md). Build instructions: docs/BUILD.md.

## Before pressing anything

In the workbench's Device update tab the page should show Firmware **SMK37 Pro Open**,
version **V01**, build number **e3344029ab696c73** and size **480.6 KiB**. After
Connect device, the device identity line must read `SMK-37 Pro_016` (factory V16) or
`SMK-37 Pro_8000001` (an Open V01 already installed). Any other identity, in particular an
Orange Cat FM-1, is the wrong device: do not continue.
