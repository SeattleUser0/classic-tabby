#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/hw/usb-readback.py — read-only checks of the SMK-37 over this computer's USB MIDI

Purpose
    Task 11C. Installs from the NUC are stopped until its USB problem is understood (BUILD.md
    25.4: 125 MB sent for a 492 KB image, the loader re-requesting the same data, kernel
    "urb status -115"). This tool only READS from the device: it never sends an install, a
    restore, an erase, a save, a delete, a counter reset or a song command. It is the NUC side
    of the read-only USB link test proposed in BUILD.md 25.4.

    Every command it sends is a query the workbench already sends on Connect:
      update protocol (sdk/WebUpdate.js frame/parse, F0 <7-bit packed 00 59 cmd len ...> F7):
        17  identity (27 ASCII bytes)        49  capability: family, state, the 32-byte build id
      project-library protocol (tools/linux/hw/tabby_link.py, app/transfer.c):
        0  device info    21 / 22  capabilities (USER size, flags)    23  song storage status
    Command 25 is NOT sent (its request 1 resets the counters) and command 26 is not sent.

Subcommands
    identity   one read of 17, 49, 0, 21, 22, 23; prints identity, build id and USER size; JSON.
    soak       --rounds N: N rounds of 17 + 49 back to back. Every reply must be byte-identical
               to the first; counts timeouts, malformed and differing replies, the round-trip time
               (min / median / max), and the kernel log lines (urb, reset, disconnect) that appear
               on this device's USB path during the run. Read-only; the device's state is unchanged.

    Backends. The default opens the ALSA raw MIDI port, which is exclusive: it fails with "Device
    or resource busy" while Chrome has a Web MIDI page open. --seq goes through the ALSA
    sequencer with python-rtmidi instead (run it with ~/fm1-hw/hwvenv/bin/python3), which shares
    the port with Chrome; an open workbench tab then also sees the replies and ignores them.

    Run:  python3 tools/linux/hw/usb-readback.py identity [--port SMK37] [--out DIR]
          ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/usb-readback.py identity --seq [--out DIR]
          python3 tools/linux/hw/usb-readback.py soak --rounds 200 [--seq] [--port SMK37] [--out DIR]

Version: 0.2

Revision log
    v0.2  2026-11-08  --seq backend (ALSA sequencer via python-rtmidi; shares the port with Chrome).
    v0.1  2026-11-08  Task 11C: first version (identity, soak).
"""

import argparse
import json
import os
import statistics
import struct
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import tabby_link  # noqa: E402  (the ALSA raw MIDI link and the project-library framing)


class SeqLink(tabby_link.Link):
    """v0.2: the same send / messages / query interface as tabby_link.Link, over the ALSA
    sequencer (python-rtmidi), so the port can stay open in Chrome. Only send(), messages() and
    close() differ; query() and the project-library commands come from tabby_link.Link."""

    def __init__(self, port="SMK37"):           # deliberately not calling Link.__init__ (rawmidi)
        import rtmidi
        self.mi, self.mo = rtmidi.MidiIn(rtmidi.API_LINUX_ALSA), rtmidi.MidiOut(rtmidi.API_LINUX_ALSA)
        self.mi.ignore_types(sysex=False, timing=True, active_sense=True)
        pick = lambda names: [i for i, n in enumerate(names) if port.lower() in tabby_link.monitor_name(n)]
        ins, outs = pick(self.mi.get_ports()), pick(self.mo.get_ports())
        if len(ins) != 1 or len(outs) != 1:
            raise OSError("sequencer port %r: %d inputs, %d outputs match (%s)" % (port, len(ins), len(outs), self.mi.get_ports()))
        self.name = "seq:" + self.mi.get_ports()[ins[0]]
        self.mi.open_port(ins[0], "usb-readback in"); self.mo.open_port(outs[0], "usb-readback out")
        self.token, self.other, self.kernel_time, self.pending = 1000, [], False, b""

    def close(self):
        self.mi.close_port(); self.mo.close_port()

    def send(self, data):
        t = time.monotonic_ns(); self.mo.send_message(list(data)); return t

    def messages(self, timeout_ms):
        end, out = time.monotonic() + timeout_ms / 1000, []
        while time.monotonic() < end and not out:
            m = self.mi.get_message()
            if m:
                out.append((time.monotonic_ns(), bytes(m[0])))
            else:
                time.sleep(0.001)
        return out


tabby_link.monitor_name = lambda n: " ".join(str(n).split()).lower()   # same folding as portName()


# ---- the update protocol's framing, ported from sdk/WebUpdate.js frame() / parse() ---------------
def pack7(data):
    return tabby_link.pack7(data)


def uframe(command, payload=b""):
    """F0, then 7-bit packed [0x00, 0x59, cmd, len lo, len hi, 0, payload..., ~sum], F7."""
    s = sum(payload) & 255
    raw = [0, 89, command, len(payload) & 255, len(payload) >> 8, 0, *payload, (~s) & 255]
    return bytes([0xF0, *pack7(raw), 0xF7])


def uparse(msg):
    """The reply's {command, data}, or None when the frame is not a valid update-protocol frame."""
    if len(msg) < 10 or len(msg) > 608 or msg[0] != 0xF0 or msg[-1] != 0xF7:
        return None
    raw, value, bits = [], 0, 0
    for b in msg[1:-1]:
        if b > 127:
            return None
        value |= b << bits; bits += 7
        if bits >= 8:
            raw.append(value & 255); value >>= 8; bits -= 8
    if bits >= 7 or value or len(raw) < 7 or raw[0] != 0 or raw[1] != 89:
        return None
    if raw[3] | raw[4] << 8 | raw[5] << 16 != len(raw) - 7 or sum(raw[6:]) & 255 != 255:
        return None
    return {"command": raw[2], "data": bytes(raw[6:-1])}


def uquery(link, command, timeout=1.5):
    """Send one update-protocol query; return (reply data, round trip s) or raise TimeoutError.
    bad counts frames that looked like ours but failed the checks (malformed on the wire)."""
    t0 = time.monotonic()
    link.send(uframe(command))
    bad = 0
    while time.monotonic() - t0 < timeout:
        for _t, m in link.messages(20):
            if m[0] != 0xF0:
                continue
            r = uparse(m)
            if r is None:
                bad += 1
                continue
            if r["command"] == command:
                return r["data"], time.monotonic() - t0, bad
    raise TimeoutError("no reply to update command %d (%d malformed frames)" % (command, bad))


def capability(d):
    """sdk/WebUpdate.js capability(): 'FMC1', version 1, family, state, loader kind, build id."""
    if len(d) != 47 or d[:4] != b"FMC1":
        raise ValueError("capability reply not FMC1 (%d bytes)" % len(d))
    return {"family": d[5], "state": d[6], "loader": d[7], "block": d[8] | d[9] << 8,
            "flash": struct.unpack_from("<I", d, 10)[0], "build_id": d[14:46].hex(), "error": d[46]}


def kernel_lines(since):
    """Kernel log lines since `since` (a journalctl time) that mention USB trouble."""
    try:
        out = subprocess.run(["journalctl", "-k", "--since", since, "--no-pager", "-o", "short-iso"],
                             capture_output=True, text=True, timeout=20).stdout
    except Exception as e:                       # no journal access: say so, do not guess
        return ["(journalctl unavailable: %s)" % e]
    keys = ("urb", "reset", "disconnect", "error", "-71", "-110", "-115")
    return [l for l in out.splitlines() if "usb" in l.lower() and any(k in l.lower() for k in keys)]


def save(out, name, obj):
    if out:
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, name), "w") as f:
            json.dump(obj, f, indent=1)


def open_link(a):
    return SeqLink(a.port) if a.seq else tabby_link.Link(a.port)


def cmd_identity(a):
    link = open_link(a)
    try:
        ident, _, _ = uquery(link, 17)
        cap = capability(uquery(link, 49)[0])
        rep = {"port": link.name, "identity": ident.rstrip(b"\0").decode("ascii", "replace"),
               "capability": cap, "build_id_short": cap["build_id"][:16]}
        for key, fn in (("info", link.info), ("capabilities", link.capabilities), ("song_status", link.song_status)):
            try:
                rep[key] = fn()
            except Exception as e:               # stock firmware has no project library
                rep[key] = {"error": str(e)}
    finally:
        link.close()
    save(a.out, "usb-readback-identity.json", rep)
    print(json.dumps(rep, indent=1))


def cmd_soak(a):
    since = time.strftime("%Y-%m-%d %H:%M:%S")
    link = open_link(a)
    first, rtt, timeouts, malformed, differ = {}, [], 0, 0, []
    try:
        for i in range(a.rounds):
            for c in (17, 49):
                try:
                    d, t, bad = uquery(link, c)
                except TimeoutError:
                    timeouts += 1
                    continue
                malformed += bad
                rtt.append(t * 1000)
                if c not in first:
                    first[c] = d
                elif d != first[c]:
                    differ.append({"round": i, "command": c})
    finally:
        link.close()
    time.sleep(1)
    rep = {"port": link.name, "rounds": a.rounds, "queries": 2 * a.rounds, "timeouts": timeouts,
           "malformed": malformed, "differing": differ[:20], "differing_count": len(differ),
           "rtt_ms": {"min": min(rtt), "median": statistics.median(rtt), "max": max(rtt)} if rtt else None,
           "build_id": capability(first[49])["build_id"] if 49 in first else None,
           "kernel": kernel_lines(since)}
    rep["pass"] = not timeouts and not malformed and not differ and not rep["kernel"]
    save(a.out, "usb-readback-soak.json", rep)
    print(json.dumps(rep, indent=1))


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[1].strip())
    p.add_argument("cmd", choices=["identity", "soak"])
    p.add_argument("--port", default="SMK37", help="ALSA raw MIDI port name (substring)")
    p.add_argument("--rounds", type=int, default=200, help="soak: rounds of 17 + 49")
    p.add_argument("--seq", action="store_true", help="use the ALSA sequencer (python-rtmidi), shared with Chrome")
    p.add_argument("--out", help="directory for the JSON report")
    a = p.parse_args()
    {"identity": cmd_identity, "soak": cmd_soak}[a.cmd](a)


if __name__ == "__main__":
    main()
