Diagnostics shows the flash chip (JEDEC ID and size, a report only); otherwise tabby-v04.9.2. Reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.9.3: the flash part line

- Firmware package build ID: `85d3dd36e7d4288e` (first 16 hex digits). App image 471172 bytes (measured), margin 48285 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 32). From tabby-v04.9.2 (`25b19e683786f068`): +64 bytes.
- Installing over tabby-v04.2 to tabby-v04.9.2 keeps storage as it is. Take a Full backup first anyway.

## What changed

- **Diagnostics names the flash chip.** The Diagnostics panel has a new line: "flash part (read by the SDK at boot):
  JEDEC 0x..., 1024 KiB; USER 471040 bytes". It is the chip ID and size the device read when it started (command 25
  request 11). It copies them from memory and sends nothing to the chip. **It is a report only.** Classic Tabby works the
  same with any 1 MiB flash chip, and nothing checks this line (docs/FLASH-CHIP.md says why: newer M-VAVE units can come
  with another chip, and firmwares that accepted only known IDs refused saves and updates on them).

Everything else is tabby-v04.9.2: recording with REC, step editing, clip launching.

## Hardware validation

Installed on the SMK-37 Pro on 2026-11-16 through the published page (Full backup first through the tabby-v04.9.2 page;
identity checked; one attempt; "Firmware ready." after 11.1 s). Diagnostics on the page reads
`flash part (read by the SDK at boot): JEDEC 0x856014, 1024 KiB; USER 471040 bytes` (the Puya P25Q80), and a second
tool reading command 25 request 11 directly gives the same. Full backup after the install verified identical: 41 items, PASS
(docs/BUILD.md 45.1, docs/FLASH-CHIP.md 6).

