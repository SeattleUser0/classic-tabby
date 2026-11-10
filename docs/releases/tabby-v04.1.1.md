Same firmware as v04.1, updated Help and testing guide; reinstalling is optional.

# Classic Tabby tabby-v04.1.1: English-only workbench, corrected Help, testing guide

If tabby-v04.1 is on your SMK-37, you do not need to install again. This release changes the workbench page
and the documents; the device firmware is the tabby-v04.1 firmware. No storage change, no backup needed.

- Firmware package build ID: `1249d59746334fcf` (the first 16 hex digits; the full 64-digit ID is in the Device
  update tab's firmware details). It differs from tabby-v04.1 (`013976a54777bb5f`) only in the 32-byte build
  identity and the package checksums (46 bytes of the .fwsc, checked with `cmp -l`); `git diff tabby-v04.1 -- app`
  is empty and the app image is the same 448420 bytes (margin 71037 bytes, docs/FLASH-BUDGET.md 18).
- The boot screen and the page badge keep saying **tabby-v04.1**, because the firmware is that version. The page
  release is named by this tag and by Help chapter 00.
- Hardware validation: none needed beyond tabby-v04.1; this release adds no firmware code.

## What is new

- **English only.** The workbench no longer has a language selector or a Chinese layer; the page is about 8.5 percent
  smaller (127 KB). The Chinese Help chapters and README.zh-CN.md are gone. Upstream's licence texts are unchanged.
- **Help corrected against tabby-v04.1.** Removed features are gone from the chapters, the panel tips and the
  update help. Chapter 00, "What changed in tabby-v04", is new. A test (`tests/workbench/help-banned.mjs`) keeps
  removed features out.
- **Two errors found while checking the device steps in the simulator.** Holding SEQ does not open ACTIONS; press
  SEQ and EDIT together (the device's own "HOLD SEQ: ACTIONS" line is wrong and is listed to be fixed in the
  firmware). The source page opens with SHIFT + HOME / SRC (the 7th button in the right group), not with the HOME in
  the left group.
- **Testing and user guide**: https://seattleuser0.github.io/classic-tabby/guide/ (also docs/TESTING-GUIDE.md): what
  Classic Tabby is, what changed, set-up, every device task step by step, the workbench, 48 numbered tests, known
  limits and how to report a problem. Linked from the Help heading and from chapter 00.

## Files

| File | Purpose |
| --- | --- |
| `SMK37_PRO_OPEN.fwsc` | Firmware package for the SMK-37 Pro (the workbench writes it) |
| `SMK37-Open-Source.html` | Offline workbench with this firmware and the stock V16 restore image embedded; desktop Chrome or Edge |
| `SHA256SUMS.txt` | SHA-256 of the two files above |

Hosted: https://seattleuser0.github.io/classic-tabby/ and the permanent page
https://seattleuser0.github.io/classic-tabby/builds/tabby-v04.1.1/. The test build
builds/tabby-v04.2-diagA2/ from the timing session is untouched.
