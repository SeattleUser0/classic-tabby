#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
# Copyright (c) 2023 Andrey Grigoryev (kagaimiq), 2026 M-VAVE, 2026 Classic Tabby.
# Port of sdk/Package.cs (JieLi formats and ciphers: jl-misctools 0a5b12d. FM1 layout and
# writer: M-VAVE). Full MIT terms and source links: THIRD_PARTY.md.
"""
tools/linux/package.py — Python port of sdk/Package.cs (SMK37 .fwsc package writer)

Purpose
    sdk/Build.ps1 loads sdk/Package.cs with Add-Type (C#) and calls FM1.Package.Create to
    turn the concatenated firmware image (.text + .data + .ram0_data + .cache_ram_data)
    into a JieLi AC791N "ufw" update package (.fwsc). This file is a line-for-line port so
    the Linux build (tools/linux/build.py) does not need PowerShell or .NET.

    Equivalence proof: tools/linux/package-pwsh.ps1 drives the original Package.cs through
    pwsh Add-Type on the same image; the Makefile target `package-equivalence` compares the
    two .fwsc outputs byte for byte. See docs/BUILD.md for the recorded result.

    Nothing here touches device flash. The package is a file on disk only.

Version: 0.2

Revision log
    v0.2  2026-11-07  Classic Tabby Task 11 Step 4: the USER size is the build variant's setting
                      (build.py --user-bytes; 536576 by default) instead of a fixed constant
                      that every other value was refused against. create() checks it (a
                      multiple of 4096 between USER_MINIMUM and USER_SIZE) and uses it for the
                      fit formula, the BTIF/VM placement and the USER record in EXT_RESERVED.
                      sdk/Package.cs v0.2 does the same. At 536576 the package is byte for
                      byte the v0.1 output.
    v0.1  2026-11-01  Initial port of Package.cs. Constants, CRC-16/XMODEM table, cipher,
                      Image helper, EncodeBoot, BuildFlash, Wrap and Create reproduced in
                      the same order and with the same integer widths as the C# original.
                      Layout dictionary keys and values match Package.Create.
"""

import re
import sys
from pathlib import Path

# ---- Constants from Package.cs (v0.1) ----------------------------------------------------
AREA = 0x4000            # start of the app area inside flash.bin
ENTRY_POINT = 0x02000120  # fixed ROM entry; Build.ps1 also checks the ELF entry equals this
APP_DATA = 0x120         # app.bin offset inside the app area (after the area directory)
FLASH_LIMIT = 0xFF000    # usable flash for the package (1 MiB minus the key_mac sector)
USER_SIZE = 536576       # the stock USER region (projects/samples/settings) at the top, and the largest allowed
USER_MINIMUM = 90112     # v0.2: smallest USER that keeps 16 projects + staging + the tuning sector (FLASH-BUDGET 3.4)
BT_SIZE = 4096           # BTIF region
MINIMUM_VM = 32768       # minimum VM (settings) region between image end and BTIF
PUBLIC_CODE = 0x980F     # jl-misctools public chip key used by the deterministic cipher


class PackageError(Exception):
    """Equivalent of the C# InvalidDataException throws in Package.cs."""


# ---- CRC-16 (poly 0x1021, init 0, no reflection) — Package.cs MakeCrcTable/Crc (v0.1) ----
def _make_crc_table():
    table = [0] * 256
    for i in range(256):
        value = i << 8
        for _ in range(8):
            value = ((value << 1) ^ (0 if (value & 32768) == 0 else 0x1021)) & 0xFFFF
        table[i] = value
    return table


_CRC_TABLE = _make_crc_table()


def crc(data, begin, length):
    """ushort Crc(byte[] bytes, int begin, int length)."""
    value = 0
    for n in range(begin, begin + length):
        value = ((value << 8) ^ _CRC_TABLE[((value >> 8) ^ data[n]) & 0xFF]) & 0xFFFF
    return value


def cipher(data, begin, length, state):
    """void Cipher(byte[] bytes, int begin, int length, int state) — in-place XOR stream."""
    for n in range(begin, begin + length):
        data[n] ^= state & 0xFF
        state = ((state << 1) ^ (0 if (state & 32768) == 0 else 0x1021)) & 65535


def round_up(size, alignment):
    """int RoundUp(int size, int alignment) {return (size + alignment - 1) & -alignment;}"""
    return (size + alignment - 1) & -alignment


class Image:
    """sealed class Image — a fixed-size byte buffer with little-endian field writers."""

    def __init__(self, size, fill):
        self.bytes = bytearray([fill]) * size

    def number(self, offset, value, width):
        for n in range(width):
            self.bytes[offset + n] = (value >> (8 * n)) & 0xFF

    def copy(self, offset, data):
        self.bytes[offset:offset + len(data)] = data

    def text(self, offset, value):
        self.copy(offset, value.encode("ascii"))

    def checksum(self, field, offset, size):
        self.number(field, crc(self.bytes, offset, size), 2)

    def record(self, offset, name, crc_value, address, size, attributes, last, extra):
        """A 32-byte JieLi directory record: crc, address, size, attributes, last, name,
        optional extra word at +28, then the record's own CRC over bytes +2..+31."""
        self.bytes[offset:offset + 32] = bytes(32)
        self.number(offset + 2, crc_value, 2)
        self.number(offset + 4, address & 0xFFFFFFFF, 4)
        self.number(offset + 8, size & 0xFFFFFFFF, 4)
        self.number(offset + 12, attributes, 2)
        self.number(offset + 14, last, 2)
        for n in range(16, 32):
            self.bytes[offset + n] = 255
        self.text(offset + 16, name)
        self.bytes[offset + 16 + len(name)] = 0
        if extra is not None:
            self.number(offset + 28, extra & 0xFFFFFFFF, 4)
        self.checksum(offset, offset + 2, 30)


def read_resource(directory, name, size):
    """static byte[] ReadResource(string directory, string name, int size)."""
    data = Path(directory, name).read_bytes()
    if len(data) != size:
        raise PackageError("Unexpected FM1 resource: " + name)
    return data


def encode_boot(plain):
    """static byte[] EncodeBoot(byte[] plain) — validate and cipher the uboot bank table."""
    result = bytearray(plain)
    banks = int.from_bytes(plain[0:2], "little")
    if banks < 1 or banks > len(plain) // 16:
        raise PackageError("Invalid boot directory.")
    previous_end = banks * 16
    for i in range(banks):
        header = i * 16
        length = int.from_bytes(plain[header + 2:header + 4], "little")
        start = int.from_bytes(plain[header + 8:header + 12], "little", signed=True)
        if (length == 0 or start < previous_end or start > len(plain) - length
                or crc(plain, header, 14) != int.from_bytes(plain[header + 14:header + 16], "little")
                or crc(plain, start, length) != int.from_bytes(plain[header + 12:header + 14], "little")):
            raise PackageError("Invalid boot bank.")
        cipher(result, header, 16, 65535)
        cipher(result, start, length, 65535)
        previous_end = start + length
    return bytes(result)


def build_flash(application, directory, end, vm_end, user_bytes=USER_SIZE):
    """static Image BuildFlash(byte[] application, string directory, int end, int vmEnd, int userBytes).
    v0.2: user_bytes sizes the USER record (it was the constant USER_SIZE)."""
    boot = read_resource(directory, "uboot.boot", 14488)
    config = read_resource(directory, "boot-config.bin", 721)
    tool = read_resource(directory, "cfg_tool.bin", 383)
    image = Image(end, 255)
    settings = Image(34 + len(config), 0)
    # Deterministic jl-misctools chipkeybin descriptor for the public image.
    for bit in range(16):
        settings.bytes[bit] = 16
        settings.bytes[16 + bit] = 16 ^ (255 if ((PUBLIC_CODE >> bit) & 1) == 0 else 0)
    settings.checksum(32, 0, 32)
    settings.copy(34, config)
    # AC791N boot header fields from the verified FM1 boot resources.
    image.copy(0, bytes([0, 0, 0x20, 2, 0x2F, 0x10, 0x4C, 0xC9, 0, 0xF0, 0x0F, 0, 0x10, 0x10, 0xA4, 0xFF,
                         0x4E, 0x5D, 0x0B, 0x41, 0xE0, 0xCD, 0x78, 0x1D, 0xC8, 0x56, 0x41, 0x7F, 0xB3, 0x67, 0xCF, 0x9F]))
    image.checksum(0, 2, 30)
    config_at = 160 + len(boot)
    image.record(32, "uboot.boot", crc(boot, 0, len(boot)), 160, len(boot), 0, 0, None)
    image.record(64, "isd_config.ini", crc(settings.bytes, 0, len(settings.bytes)), config_at, len(settings.bytes), 0x8002, 0, None)
    image.record(96, "app_dir_head", 65535, AREA, 0xFFFFFFFF, 0xFF81, 0, None)
    image.record(128, "key_mac", 65535, FLASH_LIMIT, 4096, 0x0112, 65535, None)
    for p in range(0, 160, 32):
        cipher(image.bytes, p, 32, 65535)
    image.copy(160, encode_boot(boot))
    image.copy(config_at, settings.bytes)
    payload_size = APP_DATA + len(application) + len(tool)
    app = AREA + APP_DATA
    image.copy(app, application)
    image.copy(app + len(application), tool)
    image.record(AREA + 32, "app.bin", crc(application, 0, len(application)), APP_DATA, len(application), 0xFF82, 0, None)
    image.record(AREA + 64, "cfg_tool.bin", crc(tool, 0, len(tool)), APP_DATA + len(application), len(tool), 0xFF82, 0, None)
    image.record(AREA + 96, "VM", 65535, end, vm_end - end, 0x8112, 0, MINIMUM_VM)
    image.record(AREA + 128, "PRCT", 65535, 0, end, 0x8292, 0, 0x45444F43)
    image.record(AREA + 160, "BTIF", 65535, vm_end, BT_SIZE, 0x8192, 1, 0x4F545541)
    image.record(AREA, "app_area_head", crc(image.bytes, AREA + 32, payload_size - 32), ENTRY_POINT, payload_size, 0xFF83, 0, None)
    reserved = AREA + payload_size
    image.record(reserved + 32, "USER", 65535, FLASH_LIMIT - user_bytes, user_bytes, 0x8192, 1, 0x4F545541)   # v0.2
    image.record(reserved, "EXT_RESERVED", crc(image.bytes, reserved + 32, 32), 32, 64, 0xFF93, 1, None)
    for p in range(0, payload_size + 64, 32):
        cipher(image.bytes, AREA + p, min(32, payload_size + 64 - p), PUBLIC_CODE ^ (p >> 2))
    return image


def wrap(flash, loader, product):
    """static byte[] Wrap(Image flash, byte[] loader, string product) — the ufw container
    plus the 20 interleaved product-identity bytes the SMK37 updater expects."""
    if len(loader) < 1 or len(loader) >= 32768:
        raise PackageError("Invalid FM1 update loader.")
    loader_at = 1024 + round_up(len(flash.bytes), 32)
    total = loader_at + round_up(len(loader), 32)
    ufw = Image(total, 255)
    ufw.bytes[0:224] = bytes(224)
    files = [bytes(flash.bytes), loader]
    names = ["flash.bin", "ota.bin"]
    for i in range(len(files)):
        record = 64 + i * 80
        ufw.number(record, 0 if i == 0 else 100, 2)
        ufw.number(record + 2, i, 2)
        ufw.number(record + 4, crc(files[i], 0, len(files[i])), 2)
        ufw.number(record + 8, 1024 if i == 0 else loader_at, 4)
        ufw.number(record + 12, len(files[i]), 4)
        ufw.number(record + 16, round_up(len(files[i]), 32), 4)
        ufw.text(record + 64, names[i])
        cipher(ufw.bytes, record, 80, 65535)
    ufw.number(4, total, 4)
    ufw.number(8, 2, 2)
    ufw.number(10, 4, 2)
    ufw.number(12, 512, 4)
    ufw.text(16, "AC791N")
    ufw.checksum(2, 64, 160)
    ufw.checksum(0, 2, 62)
    cipher(ufw.bytes, 0, 64, 65535)
    ufw.copy(1024, flash.bytes)
    ufw.copy(loader_at, loader)
    output = bytearray(total + 20)
    destination = 0
    for source in range(total):
        output[destination] = ufw.bytes[source]
        if source < 940 and (source + 1) % 47 == 0:
            index = source // 47
            destination += 1
            # C#: (byte)(product[index] + index + 1) — char arithmetic truncated to a byte.
            output[destination] = ((ord(product[index]) + index + 1) & 0xFF) if index < len(product) else 125
        destination += 1
    return bytes(output)


def create(app, resources, output, user_bytes, product):
    """public static Dictionary<string,object> Create(byte[] app, string resources,
    string output, int userBytes, string product) — writes the .fwsc and returns the
    layout dictionary that Build.ps1 stores as package-report.json."""
    if product is None or not re.fullmatch(r"SMK-37 (?:Pro|Elite)_8[0-9]{6}", product):
        raise PackageError("Invalid SMK37 Open update identity.")
    # v0.2: the USER size is a setting, checked here (it was refused unless it equalled USER_SIZE).
    if (not isinstance(user_bytes, int) or isinstance(user_bytes, bool) or user_bytes % 4096
            or user_bytes < USER_MINIMUM or user_bytes > USER_SIZE):
        raise PackageError("Invalid FM1 user region size.")
    if (app is None or len(app) == 0
            or len(app) > FLASH_LIMIT - user_bytes - BT_SIZE - MINIMUM_VM - AREA - APP_DATA - 383 - 64):
        raise PackageError("Application does not fit the FM1 layout.")
    image_size = round_up(AREA + APP_DATA + len(app) + 383 + 64, 4096)
    user_at = FLASH_LIMIT - user_bytes
    vm_end = user_at - BT_SIZE
    if image_size > vm_end - MINIMUM_VM:
        raise PackageError("Insufficient FM1 settings space.")
    image = build_flash(app, resources, image_size, vm_end, user_bytes)
    package = wrap(image, Path(resources, "ota.bin").read_bytes(), product)
    Path(output).write_bytes(package)
    # Same keys, same order as the C# dictionary initializer.
    return {
        "flash_bytes": 1048576, "board_access": False, "fits": True, "packager": "source",
        "FLASH_BIN_SIZE": image_size, "FLASH_NEED_SIZE": FLASH_LIMIT, "VM_START_ADDR": image_size, "VM_END_ADDR": vm_end,
        "VM_REAL_SIZE": vm_end - image_size, "BTIF_RESERVED_START": vm_end, "BTIF_RESERVED_END": user_at,
        "USER_RESERVED_START": user_at, "USER_RESERVED_END": FLASH_LIMIT, "vm_minimum_bytes": MINIMUM_VM,
        "vm_extra_gap_bytes": vm_end - image_size - MINIMUM_VM, "btif_bytes": BT_SIZE, "user_bytes": user_bytes,
    }


def main(argv):
    """Standalone use (also what the equivalence test calls):
        package.py <image.bin> <resources dir> <output.fwsc> <product> [--report file.json]
    """
    import argparse
    import json
    parser = argparse.ArgumentParser(description="Write an SMK37 .fwsc package from a raw app image.")
    parser.add_argument("image", help="concatenated .text+.data+.ram0_data+.cache_ram_data bytes")
    parser.add_argument("resources", help="sdk/tools/pack directory")
    parser.add_argument("output", help=".fwsc path to write")
    parser.add_argument("product", help='update identity, e.g. "SMK-37 Pro_8000001"')
    parser.add_argument("--user-bytes", type=int, default=USER_SIZE)
    parser.add_argument("--report", help="write the layout dictionary as JSON")
    args = parser.parse_args(argv)
    layout = create(Path(args.image).read_bytes(), args.resources, args.output, args.user_bytes, args.product)
    if args.report:
        Path(args.report).write_text(json.dumps(layout, indent=4) + "\n", encoding="utf-8")
    print(json.dumps(layout))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
