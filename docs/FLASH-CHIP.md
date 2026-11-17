# Flash chip identity: would a different SPI NOR chip break Classic Tabby?

Investigation of 2026-11-16 (read only: no firmware change, no device write, no build run).
Question: newer M-VAVE FM-1s carry a UCUN UC25HQ80 (JEDEC 0xB36014) instead of the Puya
P25Q80 (0x856014). Community FM-1 firmwares that accepted only 0x856014 refused saves and
updates. Could a newer SMK-37 with a different chip break Classic Tabby?

**Answer: no ID gate exists anywhere in the path.** The SDK, the update loader and the boot code
read the JEDEC ID and use only its last byte, the capacity code (0x14 = 1 MiB on both chips).
Classic Tabby's own code never reads the ID. Do not add an ID whitelist of our own.

Tools: `pi32v2/bin/objdump -d -r` and `readelf -rW` on `sdk/lib/libfm1_engine.a` (one member,
`engine_startup.S.o`, function sections). The loader blobs were wrapped with `.incbin` into an
object and disassembled the same way. Offsets below are section offsets in the object (engine)
or file offsets (blobs). Linked addresses are from `build/pro/sdk.elf` of tabby-v04.9 (8711092).

## 1. SDK engine (`libfm1_engine.a`)

There is no `fm1_read_flash_id`. The ID code is the Jieli norflash driver inside the engine:

| Symbol (section) | Linked at | What it does with the ID |
|---|---|---|
| `read_flash_id` (`.spi_code.fm1_read_flash_id`) | 0x01c00970 | `spi_writebyte(0x9F)` (+0x1a), three `spi_readbyte` into `flash_info+28` (loop +0x2a..+0x3a; `>>= 8` at +0x96 leaves the 24-bit ID). Then `0x4B` + 4 dummy bytes and 16 `spi_readbyte` into `flash_info[0..15]` (the unique ID, loop +0x76..+0x82). No compare. |
| `sdfile_init` (`.text.sdfile_init`) | 0x0201d02a | At boot: if `flash_info+24` (capacity) is 0, calls `read_flash_id` (+0xec), then capacity = `_pow(2, id_byte0 - 16) << 16` (+0xf2..+0x100), i.e. 2^capacity-code bytes. Then `flash_write_protect_init` and `norflash_ioctl(205)`. No branch on the ID. |
| `norflash_ioctl` (`.text.norflash_ioctl`) | 0x0201a156 | ioctls 402, 100-103 and the capacity query (+0x166) call `read_flash_id` only when the cache is empty and recompute the same `_pow` capacity. The ID word is copied out to the caller (+0xa6), never compared. |
| `get_chip_id` (`.text.get_chip_id`) | – | `h[boot_info+28]`: the AC791N SoC id, not the flash. Used by `_mkey_check` and `os_task_pend`. |
| `fm1_flash_init` (`.text.fm1_flash_init`) | 0x020225e8 | `norflash_ioctl(206)` returns the partition descriptor (`flash_info+32..47`), then `fopen` of the user file, 4 KiB alignment, `fm1_layout` match, `< 0xFF000`, size ≥ 32 KiB. If any check fails, `.L_MergedGlobals.1+296..304` stay 0. **None of the checks involves the ID.** |
| `fm1_flash_size` | – | `return [.L_MergedGlobals.1+300]` (set only by `fm1_flash_init` above). So it returns 0 only for a layout fault, never for an unknown chip. |
| `fm1_flash_write` | – | Range check against +296/+300, `check_access`, `storage_begin`; no ID. `FM1_FLASH_UNAVAILABLE` (-6) is returned only by our `app/project.c` when `fm1_flash_size()` is too small. |

**List of accepted chips: none exists.** A scan of every non-code section for 3-byte IDs of the
known SPI NOR vendors (0x85 Puya, 0xB3 UCUN, 0xEF, 0xC8, 0x5E, 0x0B, 0x20, 0x68, 0xC2, 0x1C,
0xE0, 0xA1, 0x9D, 0xCD) in either byte order found only isolated hits in RF tables, no table and
no 0x856014. No instruction compares a register with 0x85, 0xB3, 0x856014, 0xB36014, 0x6085 or
0x60B3. The three `r0 = 133` loads are a Bluetooth command (`fm1_io_system_event`+0x78) and RF
code (`fm1_dem_filter_dc`+0x6a).

Vendor-sensitive code that remains (not ID-gated):

- **Write protect.** `flash_write_protect_init` saves `SR & 0x41FC` (BP bits of SR1 plus SR2
  bit 6) in `flash_info+68`. `norflash_protect_suspend` writes 0 through `flash_write_protect`
  (16-bit `0x01` status write, or `0x50` / separate `0x31` by flag bits) and
  `norflash_protect_resume` restores the saved value. It retries 3 times and returns -1 on a
  mismatch; `norflash_protect_suspend` ignores the result. This assumes Winbond-style status
  registers. That is a functional assumption, not an ID check. The Puya and the UC25HQ80 are
  reported to share it.
- **OTP security registers.** `norflash_read_otp` (0x48, address `(n<<4)+16 << 8` = 0x1000 /
  0x2000 / 0x3000), `norflash_write_otp`, `norflash_eraser_otp` (0x44 at 0x1000/0x2000/0x3000) and
  `norflash_read_otp_general` exist in the object, but **no relocation refers to them** (readelf:
  only their own `.rela` sections mention "otp"), and they are not in the linked `sdk.elf`
  (`--gc-sections` dropped them). Nothing uses the OTP, so the 512-byte against 256-byte difference
  does not matter.
- **Unique ID (0x4B).** `flash_info[0..15]` feeds `get_iserialnumber_str` (0x020166e4: the USB
  serial = the first 8 bytes in hex; this unit reports `4150353439333112`) and
  `fm1_bt_identity_uuid` (→ `fm1_bluetooth_mac`). If a chip returned a different UID, only the USB
  serial and the BT identity would change. Nothing refuses anything.

## 2. Update loader and boot code (`sdk/tools/pack`)

The blobs are plaintext in the SDK (`tools/linux/package.py` ciphers only the uboot bank table at
packaging). `boot-config.bin` and `cfg_tool.bin` are key/value text (`SPI 4_1_0_0`, `OSC_FREQ`,
`UPDATE_JUMP`, …) with no ID field.

| Blob | Offset | Code |
|---|---|---|
| `uboot.boot` | 0x5ac | Sends `9F 00 00 00`, reads 8 bytes, returns the first two ID bytes as a halfword. |
| `uboot.boot` | 0x620..0x68c (called from 0x25c0) | Loops sending 0x35 or 0xF5 while that halfword equals **0x5D0D**. This is a bus-mode probe. 0x5D0D is no vendor (Puya would give 0x6085, UCUN 0x60B3); both chips leave the loop at once. |
| `uboot.boot` | 0xd42..0xdd8 | 0x9F → 3 bytes; 0x4B + 4 dummy → 16 bytes; capacity = `1 << (byte2 - 16) << 16` (0xd9c..0xdae); above 16 MiB sends 0xB7 (4-byte mode, 0xdb8). No compare. |
| `ota.bin` (loader, sha256 ef1f2db8…) | 0x45a2..0x45f6 | 0x9F → 3 bytes, assembled `b0<<16 | b1<<8 | b2`, stored; size from the capacity byte by a shift loop (0x45ea); 16 MiB check (0x45f6). No compare. |

The same ID-constant scan (raw bytes, both orders, 16- and 24-bit forms) of the four blobs found
no table. The only `85 60` / `60 85` / `b3 60` / `60 b3` pairs (ota 0xf45, 0x2d86, 0x31a1;
uboot 0xe9d) decode as unrelated instructions. Not covered: the AC791N mask ROM, which is in the
silicon and identical for stock and Classic Tabby.

The workbench's loader check (`sdk/WebUpdate.js` `capability()`, L333) requires the FMC1 reply's
bytes 10..13 to be 1048576. That field is a **constant** written by the engine
(`connectivity_event_handle` +0x184..+0x18e: `00 00 10 00`). The chip does not supply it.

## 3. Classic Tabby's own code

Every tracked file outside `sdk/lib` and `sdk/tools/pack` was searched (376 files: app/, web/,
tools/, tests/, docs/, sdk/*.js, sdk/include) for `jedec`, `flash id`, `0x9F`, `856014`, `b36014`,
`P25Q`, `UC25`, `Puya`, `UCUN`, `norflash`, `otp`, `unique id` and `chip id`. Found: none in code
paths. `WebUpdate.js` L187 checks the package's **SoC** type `AC791N`; `scan.c` 0x9f bytes are
bitmap data; `package.py` L173 / `Package.cs` L95 are boot header bytes. The app uses only
`fm1_flash_size()` (project.c L160, L316, L485; transfer.c L322; diag.c L213), which depends
on the layout and not on the chip. **Nothing we own reads or checks the flash ID** (as of tabby-v04.9.2; from tabby-v04.9.3 the
flash part page of section 4 *reads* it for a report, and the guard test keeps it from being checked).

## 4. Reading this unit's ID

- **No existing command reports the JEDEC ID.** The app cannot call `read_flash_id` or
  `norflash_ioctl` (local symbols), and no transfer/diag command returns them. The USB serial gives
  only the unique ID (above). This unit's JEDEC ID is therefore **not read**.
- **Skiff 2.2** (v2.2 tag, `firmware/hal/fm1_flash.h` `fl_jedec_ram`) is bare metal: from RAM with
  IRQs off it drives the SFC itself (`fl_cs(0); fl_tx(0x9F)`, three `fl_rx`). Its SMK-37 list is
  `FL_JEDEC_OK(id) = 0xEB6014 || 0x856014 || 0xB36014` (`fm1_flash_map.h` L17), and the
  comment says 0xEB6014 is "the SMK-37's part (read on a unit)". **So the SMK-37 apparently
  never used the Puya.** Skiff issue #96 names the other read-only route: the chip's UBOOT1.00
  mode (hold OCT- and OCT+ for 5 s) plus jl-uboot-tool. That needs hands on the unit, and
  jl-uboot-tool lists the AC791N as unknown.
- **M-Flasher:** no copy and no documentation found; its method is not known.
- **Built in tabby-v04.9.3: command 25 request 11** (app/diag.c v0.8, SPEC 19.12, BUILD 45), in every build.
  The reply is 16 bytes, little-endian u32: the JEDEC ID (`flash_info+28`), the capacity the SDK derived from it
  (`flash_info+24`), `fm1_flash_size()`, and the source (1 = device, 0 = simulator). These are the values the SDK
  cached at boot in `sdfile_init`. The page makes **no SPI traffic and no write**, and **nothing is gated on it**. The
  workbench Diagnostics panel prints any value as it is, unknown ones too: `flash part (read by the SDK at boot): JEDEC
  0x......, 1024 KiB; USER 471040 bytes`. `flash_info` is local to the engine, so `tools/linux/build.py` v0.12 links twice
  (`--defsym ct_sdk_flash_info=<addr>`) and stops if the address moves (0x01c5c268). The SDK is not modified.
  `tests/linux/flash-part-guard.py` fails the tests if the ID reaches anything but this report, or if a JEDEC constant
  appears in app/, web/ or the page.
- **This unit:** read after the tabby-v04.9.3 install; see section 6.

## 5. Conclusion

- **Classic Tabby: not at risk from a different flash ID.** Saves (`fm1_flash_*`), the
  workbench update path and the boot code all treat any JEDEC ID alike and take only the
  capacity byte. Both chips report 0x14 (1 MiB). A chip with a different capacity byte would
  still be handled, and `fm1_layout` bounds `fm1_flash_init` to 0xFF000.
- **M-VAVE stock firmware:** its loader and boot code are the same `ota.bin` / `uboot.boot`
  (shared with the FM-1 and both SMK-37s, FLASH-BUDGET 3.2), and they have no gate. The stock
  application image is ciphered and was not disassembled. Its update path is the loader above.
- **What remains is functional, not an ID check:** the write-protect status-register layout
  (`SR & 0x41FC`, 16-bit 0x01 write) and the 0x4B unique ID. Both behave the same on
  Winbond-compatible parts, as the Puya and the UC25HQ80 are said to be. A real test on a new
  unit would be a full backup, a save, a power cycle and a verify (the user present, SPEC 15).
- **No GitHub issue for m-vave/smk37_open is needed**, since neither the SDK nor the loader gates
  on the ID. Do not add a whitelist to Classic Tabby.

Sources: Skiff v2.2 (github.com/illuminus5/skiff, tag v2.2), Skiff issue #96;
github.com/kagaimiq/jl-uboot-tool (capacity code = log2 size; AC791N unknown).
