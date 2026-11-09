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

    backup-read  one read-only pass over what the device can hand out without loading a slot:
               the workspace (kind 0, or 3 with tuning), device settings (kind 8), the 8 track
               timbres (kind 2), the 8 tracks' FM patches (kind 1), the 16 slot names (command 9)
               and the 16 song records (kind 5), each through commands 1 (begin: a copy into a RAM
               buffer, transfer_writing = 0), 2 (read 64 bytes) and 6 (cancel). Unlike the
               workbench's full backup it never sends command 8 (load slot) or an upload.
    condition  --tag T [--audio]: the Task 11C test of one cable/audio condition: the soak
               (--rounds, default 2000) and backup-read twice (compared byte for byte), with the
               AUDIO4c capturing 8 channels at 48 kHz (arecord on hw:AUDIO4c) for the whole run
               when --audio is given. Kernel USB lines over the whole window; JSON report.
    midi-watch --seconds N: sends nothing. Listens on every AUDIO4c MIDI input and the SMK-37's
               USB output at once (ALSA sequencer, so it works while Chrome holds the ports) and
               reports, per port, the messages that arrived (note on / off / other) and the
               kernel's receive byte counters for the AUDIO4c inputs before and after. Answers
               "does the SMK-37's TRS MIDI out reach the AUDIO4c while USB carries the notes".

    Backends. The default opens the ALSA raw MIDI port, which is exclusive: it fails with "Device
    or resource busy" while Chrome has a Web MIDI page open. --seq goes through the ALSA
    sequencer with python-rtmidi instead (run it with ~/fm1-hw/hwvenv/bin/python3), which shares
    the port with Chrome; an open workbench tab then also sees the replies and ignores them.

    Run:  python3 tools/linux/hw/usb-readback.py identity [--port SMK37] [--out DIR]
          ~/fm1-hw/hwvenv/bin/python3 tools/linux/hw/usb-readback.py identity --seq [--out DIR]
          python3 tools/linux/hw/usb-readback.py soak --rounds 200 [--seq] [--port SMK37] [--out DIR]

Version: 0.4

Revision log
    v0.4  2026-11-08  midi-watch (passive TRS MIDI out check, Task 11C item 2).
    v0.3  2026-11-08  backup-read and condition (Task 11C shared-controller test).
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


def backup_read(link):
    """One read-only pass (see the docstring). Returns ({name: bytes}, stats)."""
    st = {"queries": 0, "bytes": 0, "empty": 0}
    out = {}

    def q(cmd, payload=b""):
        st["queries"] += 1
        return link.query(cmd, bytes(payload))

    def download(name, kind, target=0):
        try:
            head = q(1, [kind, target])
        except tabby_link.DeviceError as e:          # empty slot / record, or not a DX7 track
            st["empty"] += 1; out[name] = ("device code %d" % e.code).encode(); return
        size = head[0] | head[1] << 8
        data = bytearray()
        try:
            for at in range(0, size, 64):
                n = min(64, size - at)
                part = q(2, [at & 255, at >> 8, n])
                if len(part) != n:
                    raise ValueError("%s: short part at %d" % (name, at))
                data += part
        finally:
            try: q(6)                               # cancel: frees the RAM copy
            except Exception: pass
        st["bytes"] += len(data); out[name] = bytes(data)

    t0 = time.monotonic()
    caps = link.capabilities(); st["queries"] += 2
    download("workspace", 3 if caps["tuning"] else 0)
    if caps["settings_kind8"]:
        download("settings", 8)
    for t in range(8):
        download("timbre%d" % t, 2, t)
        download("fm%d" % t, 1, t)
    for slot in range(16):
        try:
            out["name%d" % slot] = bytes(q(9, [slot]))
        except tabby_link.DeviceError as e:
            out["name%d" % slot] = ("device code %d" % e.code).encode()
    for slot in range(16):
        download("song%d" % slot, 5, slot)
    st["seconds"] = time.monotonic() - t0
    return out, st


def run_backups(link, n=2):
    """n backup reads; every pass compared with the first, item by item."""
    passes, res = [], []
    for i in range(n):
        try:
            data, st = backup_read(link)
        except (TimeoutError, ValueError, tabby_link.DeviceError) as e:
            res.append({"pass": i, "error": str(e)}); continue
        passes.append(data)
        diff = [k for k in data if passes[0].get(k) != data[k]] if len(passes) > 1 else []
        res.append({"pass": i, **st, "differing_items": diff[:20]})
    return res, len(passes) == n and all(not r.get("differing_items") and "error" not in r for r in res)


def soak(link, rounds):
    first, rtt, timeouts, malformed, differ = {}, [], 0, 0, 0
    t0 = time.monotonic()
    for i in range(rounds):
        for c in (17, 49):
            try:
                d, t, bad = uquery(link, c)
            except TimeoutError:
                timeouts += 1; continue
            malformed += bad; rtt.append(t * 1000)
            if c not in first:
                first[c] = d
            elif d != first[c]:
                differ += 1
    q = sorted(rtt)
    pct = lambda p: q[min(len(q) - 1, int(p * len(q)))] if q else None
    return {"rounds": rounds, "queries": 2 * rounds, "replies": len(rtt), "timeouts": timeouts, "malformed": malformed,
            "differing": differ, "seconds": round(time.monotonic() - t0, 2),
            "rtt_ms": {"min": q[0], "median": pct(0.5), "p99": pct(0.99), "max": q[-1]} if q else None,
            "build_id": capability(first[49])["build_id"][:16] if 49 in first else None}


def usb_path():
    """Where the SMK-37 is now: its USB port, bus and the PCI controller (from sysfs)."""
    for d in os.listdir("/sys/bus/usb/devices"):
        f = "/sys/bus/usb/devices/%s/idVendor" % d
        if os.path.exists(f) and open(f).read().strip() in ("3654", "4d4a"):
            real = os.path.realpath("/sys/bus/usb/devices/" + d)
            return {"port": d, "sysfs": real.replace("/sys/devices/", ""),
                    "speed_mbps": open("/sys/bus/usb/devices/%s/speed" % d).read().strip()}
    return None


def cmd_condition(a):
    since = time.strftime("%Y-%m-%d %H:%M:%S")
    rec, rec_err = None, ""
    if a.audio:                                     # the AUDIO4c streams its 8 inputs into /dev/null
        rec = subprocess.Popen(["arecord", "-D", "hw:AUDIO4c", "-c", "8", "-r", "48000", "-f", "S32_LE", "-t", "raw",
                                "-q", "/dev/null"], stderr=subprocess.PIPE, text=True)
        time.sleep(2)
        if rec.poll() is not None:
            raise SystemExit("arecord did not start: " + rec.stderr.read())
    st = "/proc/asound/AUDIO4c/pcm0c/sub0/status"
    pcm = open(st).read().split("\n")[0] if os.path.exists(st) else "?"
    link = open_link(a)
    try:
        sk = soak(link, a.rounds)
        bk, bk_ok = run_backups(link, 2)
    finally:
        link.close()
        pcm_end = open(st).read().split("\n")[0] if os.path.exists(st) else "?"
        if rec:
            rec.terminate()
            try: rec_err = rec.communicate(timeout=5)[1]
            except Exception: pass
    time.sleep(1)
    rep = {"tag": a.tag, "audio": bool(a.audio), "audio4c_capture": [pcm, pcm_end], "arecord_stderr": (rec_err or "").strip(),
           "usb": usb_path(), "port": link.name, "soak": sk, "backup_reads": bk, "backups_identical": bk_ok,
           "kernel": kernel_lines(since)}
    rep["pass"] = (not sk["timeouts"] and not sk["malformed"] and not sk["differing"] and bk_ok and not rep["kernel"])
    save(a.out, "condition-%s.json" % a.tag, rep)
    print(json.dumps(rep, indent=1))


def audio4c_counters():
    """Kernel Rx byte counter of each AUDIO4c MIDI input (/proc/asound/cardN/midi0)."""
    import glob, re
    for path in glob.glob("/proc/asound/card*/midi0"):
        text = open(path).read()
        if text.startswith("AUDIO4c"):
            return [int(x) for x in re.findall(r"Rx bytes\s*:\s*(\d+)", text)]
    return []


def cmd_watch(a):
    import rtmidi
    probe = rtmidi.MidiIn(rtmidi.API_LINUX_ALSA)
    names = [n for n in probe.get_ports() if "audio4c" in n.lower() or "smk37" in n.lower().replace(" ", "")]
    del probe
    log, ins = [], []
    for n in names:                                  # one MidiIn per port; the callback tags the port
        mi = rtmidi.MidiIn(rtmidi.API_LINUX_ALSA)
        mi.ignore_types(sysex=False, timing=False, active_sense=True)
        idx = mi.get_ports().index(n)
        mi.open_port(idx, "midi-watch")
        mi.set_callback(lambda ev, _d, n=n: log.append((time.monotonic(), n, ev[0])))
        ins.append(mi)
    before = audio4c_counters()
    t0 = time.monotonic()
    print("LISTENING %d s on %d ports: play keys now" % (a.seconds, len(names)), flush=True)
    time.sleep(a.seconds)
    for mi in ins:
        mi.close_port()
    after = audio4c_counters()
    per = {}
    for _t, n, m in log:
        k = "clock" if m[0] == 0xF8 else {0x90: "note_on" if len(m) > 2 and m[2] else "note_off", 0x80: "note_off"}.get(m[0] & 0xF0, "other")
        d = per.setdefault(n, {"note_on": 0, "note_off": 0, "clock": 0, "other": 0, "channels": set()})
        d[k] += 1
        if m[0] < 0xF0:
            d["channels"].add((m[0] & 15) + 1)
    for d in per.values():
        d["channels"] = sorted(d["channels"])
    rep = {"seconds": a.seconds, "ports": names, "arrived": per,
           "audio4c_rx_bytes_before": before, "audio4c_rx_bytes_after": after,
           "audio4c_rx_delta": [y - x for x, y in zip(before, after)]}
    if a.out:
        os.makedirs(a.out, exist_ok=True)
        with open(os.path.join(a.out, "midi-watch-%s.csv" % a.tag), "w") as f:
            f.write("t_s,port,bytes\n")
            for t, n, m in log:
                f.write("%.6f,%s,%s\n" % (t - t0, n, " ".join("%02X" % b for b in m)))
    save(a.out, "midi-watch-%s.json" % a.tag, rep)
    print(json.dumps(rep, indent=1))


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[1].strip())
    p.add_argument("cmd", choices=["identity", "soak", "backup-read", "condition", "midi-watch"])
    p.add_argument("--seconds", type=float, default=90, help="midi-watch: listening time")
    p.add_argument("--tag", default="x", help="condition: name of the condition (a, b, c, d)")
    p.add_argument("--audio", action="store_true", help="condition: AUDIO4c capture runs throughout")
    p.add_argument("--port", default="SMK37", help="ALSA raw MIDI port name (substring)")
    p.add_argument("--rounds", type=int, default=200, help="soak: rounds of 17 + 49")
    p.add_argument("--seq", action="store_true", help="use the ALSA sequencer (python-rtmidi), shared with Chrome")
    p.add_argument("--out", help="directory for the JSON report")
    a = p.parse_args()
    def cmd_backup(a):
        link = open_link(a)
        try:
            r, _ = run_backups(link, 1)
        finally:
            link.close()
        print(json.dumps(r, indent=1))
    {"midi-watch": cmd_watch, "identity": cmd_identity, "soak": cmd_soak, "backup-read": cmd_backup, "condition": cmd_condition}[a.cmd](a)


if __name__ == "__main__":
    main()
