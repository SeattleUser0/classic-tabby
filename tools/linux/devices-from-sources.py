#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/devices-from-sources.py — write the device definitions under web/devices/

Purpose
    Task 04 (row events and device library). The facts in every definition come from the
    manufacturer documents cited in docs/tasks/TASK-04-step1-assessment.md section 4; the
    preset name lists are parsed from the manufacturers' own files rather than typed in:

        --proteus  <text>   E-mu "Proteus operation manual" text layer (archive.org item
                            synthmanual-e-mu-proteus-owners-manual), pages 92-93 (PDF 94-95)
        --blofeld  <dir>    Waldorf "Blofeld Factory 2012 A-H/Sysex" (eight bank .syx files;
                            the 16-character name sits at data bytes 363..378 of each SNDD)
        --pulse2   <text>   Waldorf "Pulse_2_Preset_List.pdf" text layer (pages 1-2, by number)
        --zoom     <text>   Zoom "E_MS-70CDRplus_Patchlist.pdf" text layer

    Everything else (channel behaviour, bank scheme, controllers, setup steps, sources and
    the list of unverified fields) is written here by hand from the cited pages. A field
    listed under "unverified" could not be confirmed in a manufacturer document; the
    workbench shows it as such. Run with no list arguments to rewrite only the hand-written
    parts and keep the preset lists already in the files.

    The output format is "tabby-device/1", validated by web/rig/device-library.js
    (`validateDevice`) and by tests/workbench/devices.mjs.

Usage
    python3 -I tools/linux/devices-from-sources.py [--proteus manual.txt] [--blofeld dir]
                                                   [--pulse2 list.txt] [--zoom list.txt]
Version: 0.1
Revision log
    v0.1  2026-11-02  Initial version (Task 04, workbench part).
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "web", "devices")


def read_existing_presets(device_id):
    path = os.path.join(OUT, device_id + ".json")
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f).get("presets", [])


# ---- list parsers -------------------------------------------------------------------------
def proteus_presets(text_path):
    """Pages 92-93: cells like "7. Thunder Bass †" in three columns separated by 2+ spaces.
    Markers: † (limited range), * / ** (linked), E (ersatz), + ; bold (user preset) is lost in
    the text layer. Returns 192 entries 0..191 (191 = "Default")."""
    with open(text_path, encoding="utf-8", errors="replace") as f:
        lines = f.read().split("\n")
    start = next(i for i, l in enumerate(lines) if l.strip() == "PROTEUS/2 FACTORY PRESETS")
    end = next(i for i, l in enumerate(lines) if i > start and l.strip() == "PROTEUS/2 INSTRUMENTS")
    found = {}
    cell = re.compile(r"^(\d{1,3})\. (.+?)\s*(?:\*\*|\*|†|E|\+)?\s*$")
    for line in lines[start:end]:
        for part in re.split(r"\s{2,}", line.strip()):
            m = cell.match(part)
            if not m:
                continue
            n, name = int(m.group(1)), m.group(2).strip()
            name = re.sub(r"\s*(?:\*\*|\*|†|\+)$", "", name).strip()
            if name.endswith(" E"):
                name = name[:-2].strip()
            if 0 <= n <= 191 and n not in found:
                found[n] = name
    missing = [n for n in range(192) if n not in found]
    if missing:
        print("proteus: missing", missing, file=sys.stderr)
    # Presets 128..191 have no MIDI program number: they are reached through the Proteus's
    # own MIDI PROG>PRESET map (an incoming program 0..127 mapped to the preset). They keep
    # their device number in "number" and program = null.
    return [{"bank": None, "program": n if n < 128 else None, "number": n, "name": found[n]} for n in sorted(found)]


def blofeld_presets(syx_dir):
    """Eight bank files; each SNDD message F0 3E 13 dev 10 BB NN data[383] chk F7, name at
    data 363..378 (16 ASCII characters, space padded). Waldorf stores the programmer's code
    inside the 16 characters ("Start Up       T", "TearsFromCombSCD"); that is what the
    Blofeld displays, so the names are kept verbatim (trailing spaces removed)."""
    out = []
    for bank in range(8):
        letter = "ABCDEFGH"[bank]
        path = next(os.path.join(syx_dir, n) for n in sorted(os.listdir(syx_dir)) if n.endswith(letter + ".syx"))
        with open(path, "rb") as f:
            d = f.read()
        at = 0
        while True:
            at = d.find(b"\xf0\x3e\x13", at)
            if at < 0:
                break
            end = d.find(b"\xf7", at)
            msg = d[at:end + 1]
            if msg[4] == 0x10 and len(msg) == 392:
                bb, nn = msg[5], msg[6]
                name = msg[7 + 363:7 + 379].decode("ascii", "replace").rstrip()
                out.append({"bank": bb, "program": nn, "name": name})
            at = end + 1
    if len(out) != 1024:
        print("blofeld: parsed", len(out), "names", file=sys.stderr)
    return out


def pulse2_presets(text_path):
    """Pages 1-2 ("By Number"): three entries per line, each "NNN   name(16)  CATEGORY"."""
    with open(text_path, encoding="utf-8", errors="replace") as f:
        text = f.read()
    cut = text.find("By Category")
    names = {}
    cats = "ARP|ATMO|BASS|DRUM|FX|KEYS|LEAD|MONO|PAD|PERC|POLY|NONE"
    for m in re.finditer(r"(\d{3})   (.{1,18}?)\s+(" + cats + r")(?=\s|$)", text[:cut] if cut > 0 else text):
        n = int(m.group(1))
        if 1 <= n <= 500 and n not in names:
            names[n] = (re.sub(r"\s+", " ", m.group(2)).strip(), m.group(3))   # programmer initials stay in the name
    missing = [n for n in range(1, 501) if n not in names]
    if missing:
        print("pulse2: missing", missing[:10], "...", len(missing), file=sys.stderr)
    out = []
    for n in sorted(names):
        name, category = names[n]
        out.append({"bank": (n - 1) // 100, "program": (n - 1) % 100, "name": name, "category": category})
    return out


def zoom_presets(text_path):
    """Lines "   001 : C-D-R+" (80 factory patches)."""
    with open(text_path, encoding="utf-8", errors="replace") as f:
        text = f.read()
    out = []
    for m in re.finditer(r"^\s*(\d{3}) : (.+?)\s*$", text, re.M):
        n = int(m.group(1))
        if 1 <= n <= 100:
            out.append({"bank": None, "program": n - 1, "name": m.group(2).strip()})
    if len(out) != 80:
        print("zoom: parsed", len(out), "names", file=sys.stderr)
    return out


# ---- hand-written definitions -------------------------------------------------------------
def banks_letters(n):
    return [{"index": i, "name": "ABCDEFGH"[i], "msb": None, "lsb": i} for i in range(n)]


DEVICES = [
    {
        "id": "emu-proteus-2-xr", "name": "E-MU Proteus/2 XR", "maker": "E-mu Systems",
        "channel": {"default": None, "note": "Multi mode: each of the 16 channels has its own preset; set MIDI ENABLE and PRESET CHANGE on per channel."},
        "programChange": {"supported": True, "displayBase": 0, "programs": 128, "bankFormat": "none", "pad": 3,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Presets are shown 000..383 (XR). MIDI reaches 0..127 directly; presets 128..383 only through the device's MIDI PROG>PRESET map, which maps an incoming program 0..127 to any preset. Enter such presets as the mapped program number."},
        "controllers": [
            {"cc": 7, "name": "Volume", "min": 0, "max": 127},
            {"cc": 10, "name": "Pan", "min": 0, "max": 127, "values": {"0": "hard left", "64": "centre", "127": "hard right"}},
            {"cc": 1, "name": "Realtime controller A (default assignment)", "min": 0, "max": 127},
            {"cc": 2, "name": "Realtime controller B (default assignment)", "min": 0, "max": 127},
            {"cc": 3, "name": "Realtime controller C (default assignment)", "min": 0, "max": 127},
            {"cc": 4, "name": "Realtime controller D (default assignment)", "min": 0, "max": 127},
            {"cc": 64, "name": "Footswitch 1 (default; sustain if the preset routes it)", "min": 0, "max": 127, "values": {"0": "off", "64": "on"}},
            {"cc": 65, "name": "Footswitch 2 (default)", "min": 0, "max": 127, "values": {"0": "off", "64": "on"}},
            {"cc": 66, "name": "Footswitch 3 (default)", "min": 0, "max": 127, "values": {"0": "off", "64": "on"}},
            {"cc": 121, "name": "Reset all controllers", "min": 0, "max": 0},
            {"cc": 123, "name": "All notes off", "min": 0, "max": 0}],
        "setup": ["Master menu: MIDI MODE = Multi.",
                  "Per channel the song addresses: MIDI ENABLE on and PRESET CHANGE on.",
                  "Master menu MIDI PROG>PRESET: identity for presets 0..127; map a program number to each preset above 127 the song needs (no bank select exists).",
                  "Leave the Edit menu before playing: program changes are ignored inside it.",
                  "Run SEND SETUP before PLAY: the manual asks for setup messages before the song starts."],
        "notes": ["Factory list from the operation manual pp. 92-93 (192 presets 0..191; XR ROM 256..383 repeats the ROM set). User presets 64..127 (and XR RAM 0..255) carry whatever you stored; names here are the factory ones.",
                  "The manual: do not send setup information just before the first beat (timing errors)."],
        "sources": [{"title": "E-mu Proteus operation manual (family manual with the 1992 MIDI addendum)", "url": "https://archive.org/download/synthmanual-e-mu-proteus-owners-manual/e-muproteusownersmanual.pdf", "detail": "pp. 14, 18-21, 69, 92-93, 118-124 (PDF page = printed + 2)"},
                    {"title": "synthmania Proteus/2 page (secondary, text preset list)", "url": "https://www.synthmania.com/proteus-2.htm", "detail": "cross-check of names 000..190"}],
        "unverified": ["channel.default", "programChange.note:factory state of the program map on a reset unit"],
        "presets": "proteus",
    },
    {
        "id": "eventide-h90", "name": "Eventide H90 Harmonizer", "maker": "Eventide",
        "channel": {"default": 15, "note": "One channel for receive and transmit, or Receive Omni (System > MIDI). The default value is not stated in the manual; 15 is this rig's setting."},
        "programChange": {"supported": True, "displayBase": 1, "programs": 99, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "PC selects a Program in the current Playlist (a User List of up to 99). With PC Offset 0 (default) PC n loads Program n as displayed (1-based; PC 0 is not used); with PC Offset 1, PC 0 loads Program 1: set this definition's displayBase to 0 then. No bank select; banks of three are reached only by Bank Up / Down CC functions."},
        "controllers": [
            {"cc": -1, "name": "No default CC map: assign CC numbers per function in System > MIDI > Global Control (Load, Increment, Decrement, Bank Up/Down, Tuner, Tap Tempo, P/A/B active-bypass toggle or momentary, Insert 1/2, HotSwitch 1-3, Perform 1-6, Quick Knobs 1-6, HotKnob, In/Out gain, Mix) and enter them in the rig profile", "min": 0, "max": 127}],
        "setup": ["System > MIDI: channel 15 (or Receive Omni).",
                  "System > MIDI: PC Offset 0 keeps PC n = Program n as displayed; if you use PC Offset 1, set displayBase 0 in the rig.",
                  "Make the User List you play from the Playlist: program numbers in the song refer to its order.",
                  "Assign CC numbers for bypass / HotSwitch / tap in Global Control and enter them in the rig profile.",
                  "Firmware 1.8.6..1.9.x ignores a CC sent together with a PC: keep this device's gap (after the program change) until you run 1.13.2 or later."],
        "notes": ["Program names are per user (the Playlist is user-arranged): name the 99 slots in the rig profile.",
                  "A PC loads the whole Program (both A and B); presets A/B are not selectable by MIDI."],
        "sources": [{"title": "H90 User Manual v1.9.7, 7.4 MIDI", "url": "https://cdn.eventideaudio.com/manuals/h90/1.9.7/content/system-menu/midi.html", "detail": "PDF pp. 94-96"},
                    {"title": "H90 User Manual v1.9.7, Appendix C global mapping chart", "url": "https://cdn.eventideaudio.com/manuals/h90/1.9.7/content/appendix/global.html", "detail": "PDF pp. 253-256"},
                    {"title": "Eventide staff forum answers (manufacturer, informal): PC/CC timing, no bank select", "url": "https://www.eventideaudio.com/?p=189216", "detail": "also ?p=187986, ?p=194425"}],
        "unverified": ["channel.default", "programChange.gapMs:older firmware needs ~300 ms after a PC before a CC (user report)", "USB carries PC/CC (manual says only 'receive MIDI over USB')"],
        "presets": [],
    },
    {
        "id": "zoom-ms-70cdr-plus", "name": "Zoom MS-70CDR+", "maker": "Zoom",
        "channel": {"default": 16, "note": "MENU > USB MIDI CH = 1..16 or OMNI (memorised). USB MIDI only: the pedal is a USB device and needs a USB host (CME H4MIDI WC in this rig). Factory default not stated; 16 is this rig's setting."},
        "programChange": {"supported": True, "displayBase": 1, "programs": 100, "bankFormat": "none", "pad": 3,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Patches are displayed 001..100; the chart lists PC 0-100 'true number 0-100' without a mapping, so whether PC 0 or PC 1 is patch 001 is unverified (displayBase 1 assumed; change it after the hardware check)."},
        "controllers": [],
        "setup": ["MENU > USB MIDI CH = 16 (or OMNI).",
                  "Connect the USB host before the set; the pedal shows a USB CONNECT prompt on batteries.",
                  "Hardware check: send PC 0 and PC 1 and note which patch the display shows; set displayBase accordingly."],
        "notes": ["No control change and no SysEx are recognised (chart); patch selection is the only MIDI function.",
                  "Factory patches 001..080 from Zoom's patch list; 081..100 are empty user slots."],
        "sources": [{"title": "MS-70CDR+ Operation Manual (chart p. 69, USB MIDI CH p. 59)", "url": "https://zoomcorp.com/media/documents/E_MS-70CDRplus.pdf", "detail": "chart dated Mar. 1, 2024, version 1.00"},
                    {"title": "MS-70CDR+ Patch Memory List, preset ver. 1.00", "url": "https://zoomcorp.com/media/documents/E_MS-70CDRplus_Patchlist.pdf", "detail": "80 factory patches"}],
        "unverified": ["channel.default", "programChange.displayBase", "class compliance behind a USB host"],
        "presets": "zoom",
    },
    {
        "id": "waldorf-blofeld", "name": "Waldorf Blofeld", "maker": "Waldorf",
        "channel": {"default": None, "note": "Global MIDI Channel (omni, 1..16). In Multi mode each of 16 parts has its own channel and a 'Prg Change' receive filter."},
        "programChange": {"supported": True, "displayBase": 1, "programs": 128, "bankFormat": "letter", "pad": 3,
                          "bankSelect": {"scheme": "cc32", "banks": banks_letters(8)}, "gapMs": 0, "gapAfter": "program",
                          "note": "Display A001..H128. CC 32 = 0..7 selects bank A..H (manual table; CC 0 'not used'; the OS 1.15 notes say CC 0 and CC 32 are interchangeable). 128 Multi programs are selected with CC 0 = 127 then PC on the global channel, only when already in Multi mode (secondary)."},
        "controllers": [
            {"cc": 1, "name": "Modulation Wheel", "min": 0, "max": 127}, {"cc": 2, "name": "Breath Control", "min": 0, "max": 127},
            {"cc": 4, "name": "Foot Control", "min": 0, "max": 127}, {"cc": 5, "name": "Glide Rate", "min": 0, "max": 127},
            {"cc": 7, "name": "Channel Volume", "min": 0, "max": 127}, {"cc": 10, "name": "Pan", "min": 0, "max": 127, "values": {"0": "L64", "64": "centre", "127": "R63"}},
            {"cc": 12, "name": "Arp Range", "min": 0, "max": 9, "values": {"0": "1 octave", "9": "10 octaves"}}, {"cc": 13, "name": "Arp Length", "min": 0, "max": 15, "values": {"0": "1 step", "15": "16 steps"}},
            {"cc": 14, "name": "Arp Active", "min": 0, "max": 3, "values": {"0": "off", "1": "on", "2": "one shot", "3": "hold"}},
            {"cc": 15, "name": "LFO 1 Shape", "min": 0, "max": 5, "values": {"0": "sine", "1": "triangle", "2": "square", "3": "sawtooth", "4": "random", "5": "S&H"}},
            {"cc": 16, "name": "LFO 1 Speed", "min": 0, "max": 127}, {"cc": 17, "name": "LFO 1 Sync", "min": 0, "max": 1, "values": {"0": "off", "1": "on"}}, {"cc": 18, "name": "LFO 1 Delay", "min": 0, "max": 127},
            {"cc": 19, "name": "LFO 2 Shape", "min": 0, "max": 5}, {"cc": 20, "name": "LFO 2 Speed", "min": 0, "max": 127}, {"cc": 21, "name": "LFO 2 Sync", "min": 0, "max": 1}, {"cc": 22, "name": "LFO 2 Delay", "min": 0, "max": 127},
            {"cc": 23, "name": "LFO 3 Shape", "min": 0, "max": 5}, {"cc": 24, "name": "LFO 3 Speed", "min": 0, "max": 127}, {"cc": 25, "name": "LFO 3 Sync", "min": 0, "max": 1}, {"cc": 26, "name": "LFO 3 Delay", "min": 0, "max": 127},
            {"cc": 27, "name": "Osc 1 Octave", "min": 16, "max": 112, "values": {"16": "128'", "112": "1/2'"}}, {"cc": 28, "name": "Osc 1 Semitone", "min": 52, "max": 76, "values": {"52": "-12", "64": "0", "76": "+12"}},
            {"cc": 29, "name": "Osc 1 Detune", "min": 0, "max": 127}, {"cc": 30, "name": "Osc 1 FM", "min": 0, "max": 127},
            {"cc": 31, "name": "Osc 1 Shape", "min": 0, "max": 5, "values": {"0": "pulse", "1": "saw", "2": "triangle", "3": "sine", "4": "alt 1", "5": "alt 2"}},
            {"cc": 33, "name": "Osc 1 PW", "min": 0, "max": 127}, {"cc": 34, "name": "Osc 1 PWM", "min": 0, "max": 127},
            {"cc": 35, "name": "Osc 2 Octave", "min": 16, "max": 112}, {"cc": 36, "name": "Osc 2 Semitone", "min": 52, "max": 76}, {"cc": 37, "name": "Osc 2 Detune", "min": 0, "max": 127}, {"cc": 38, "name": "Osc 2 FM", "min": 0, "max": 127},
            {"cc": 39, "name": "Osc 2 Shape", "min": 0, "max": 5}, {"cc": 40, "name": "Osc 2 PW", "min": 0, "max": 127}, {"cc": 41, "name": "Osc 2 PWM", "min": 0, "max": 127},
            {"cc": 42, "name": "Osc 3 Octave", "min": 16, "max": 112}, {"cc": 43, "name": "Osc 3 Semitone", "min": 52, "max": 76}, {"cc": 44, "name": "Osc 3 Detune", "min": 0, "max": 127}, {"cc": 45, "name": "Osc 3 FM", "min": 0, "max": 127},
            {"cc": 46, "name": "Osc 3 Shape", "min": 0, "max": 5}, {"cc": 47, "name": "Osc 3 PW", "min": 0, "max": 127}, {"cc": 48, "name": "Osc 3 PWM", "min": 0, "max": 127},
            {"cc": 49, "name": "Sync", "min": 0, "max": 1}, {"cc": 50, "name": "Pitchmod", "min": 0, "max": 127}, {"cc": 51, "name": "Glide Mode", "min": 0, "max": 9},
            {"cc": 52, "name": "Osc 1 Level", "min": 0, "max": 127}, {"cc": 53, "name": "Osc 1 Balance", "min": 0, "max": 127}, {"cc": 54, "name": "Ringmod Level", "min": 0, "max": 127}, {"cc": 55, "name": "Ringmod Balance", "min": 0, "max": 127},
            {"cc": 56, "name": "Osc 2 Level", "min": 0, "max": 127}, {"cc": 57, "name": "Osc 2 Balance", "min": 0, "max": 127}, {"cc": 58, "name": "Osc 3 Level", "min": 0, "max": 127}, {"cc": 59, "name": "Osc 3 Balance", "min": 0, "max": 127},
            {"cc": 60, "name": "Noise Level", "min": 0, "max": 127}, {"cc": 61, "name": "Noise Balance", "min": 0, "max": 127}, {"cc": 62, "name": "Noise Colour", "min": 0, "max": 127},
            {"cc": 64, "name": "Sustain Pedal", "min": 0, "max": 127, "values": {"0": "off", "64": "on"}}, {"cc": 65, "name": "Glide Active", "min": 0, "max": 127}, {"cc": 66, "name": "Sostenuto", "min": 0, "max": 127},
            {"cc": 67, "name": "Routing", "min": 0, "max": 1, "values": {"0": "serial", "1": "parallel"}},
            {"cc": 68, "name": "Filter 1 Type", "min": 0, "max": 10}, {"cc": 69, "name": "Filter 1 Cutoff", "min": 0, "max": 127}, {"cc": 70, "name": "Filter 1 Resonance", "min": 0, "max": 127}, {"cc": 71, "name": "Filter 1 Drive", "min": 0, "max": 127},
            {"cc": 72, "name": "Filter 1 Keytrack", "min": 0, "max": 127}, {"cc": 73, "name": "Filter 1 Env Amount", "min": 0, "max": 127}, {"cc": 74, "name": "Filter 1 Env Velocity", "min": 0, "max": 127}, {"cc": 75, "name": "Filter 1 Cutoff Mod", "min": 0, "max": 127},
            {"cc": 76, "name": "Filter 1 FM", "min": 0, "max": 127}, {"cc": 77, "name": "Filter 1 Pan", "min": 0, "max": 127}, {"cc": 78, "name": "Filter 1 Pan Mod", "min": 0, "max": 127},
            {"cc": 79, "name": "Filter 2 Type", "min": 0, "max": 10}, {"cc": 80, "name": "Filter 2 Cutoff", "min": 0, "max": 127}, {"cc": 81, "name": "Filter 2 Resonance", "min": 0, "max": 127}, {"cc": 82, "name": "Filter 2 Drive", "min": 0, "max": 127},
            {"cc": 83, "name": "Filter 2 Keytrack", "min": 0, "max": 127}, {"cc": 84, "name": "Filter 2 Env Amount", "min": 0, "max": 127}, {"cc": 85, "name": "Filter 2 Env Velocity", "min": 0, "max": 127}, {"cc": 86, "name": "Filter 2 Cutoff Mod", "min": 0, "max": 127},
            {"cc": 87, "name": "Filter 2 FM", "min": 0, "max": 127}, {"cc": 88, "name": "Filter 2 Pan", "min": 0, "max": 127}, {"cc": 89, "name": "Filter 2 Pan Mod", "min": 0, "max": 127},
            {"cc": 90, "name": "Amp Volume", "min": 0, "max": 127}, {"cc": 91, "name": "Amp Velocity", "min": 0, "max": 127}, {"cc": 92, "name": "Amp Mod", "min": 0, "max": 127},
            {"cc": 93, "name": "FX 1 Mix", "min": 0, "max": 127}, {"cc": 94, "name": "FX 2 Mix", "min": 0, "max": 127},
            {"cc": 95, "name": "Filter Env Attack", "min": 0, "max": 127}, {"cc": 96, "name": "Filter Env Decay", "min": 0, "max": 127}, {"cc": 97, "name": "Filter Env Sustain", "min": 0, "max": 127}, {"cc": 98, "name": "Filter Env Decay 2", "min": 0, "max": 127}, {"cc": 99, "name": "Filter Env Sustain 2", "min": 0, "max": 127}, {"cc": 100, "name": "Filter Env Release", "min": 0, "max": 127},
            {"cc": 101, "name": "Amp Env Attack", "min": 0, "max": 127}, {"cc": 102, "name": "Amp Env Decay", "min": 0, "max": 127}, {"cc": 103, "name": "Amp Env Sustain", "min": 0, "max": 127}, {"cc": 104, "name": "Amp Env Decay 2", "min": 0, "max": 127}, {"cc": 105, "name": "Amp Env Sustain 2", "min": 0, "max": 127}, {"cc": 106, "name": "Amp Env Release", "min": 0, "max": 127},
            {"cc": 107, "name": "Env 3 Attack", "min": 0, "max": 127}, {"cc": 108, "name": "Env 3 Decay", "min": 0, "max": 127}, {"cc": 109, "name": "Env 3 Sustain", "min": 0, "max": 127}, {"cc": 110, "name": "Env 3 Decay 2", "min": 0, "max": 127}, {"cc": 111, "name": "Env 3 Sustain 2", "min": 0, "max": 127}, {"cc": 112, "name": "Env 3 Release", "min": 0, "max": 127},
            {"cc": 113, "name": "Env 4 Attack", "min": 0, "max": 127}, {"cc": 114, "name": "Env 4 Decay", "min": 0, "max": 127}, {"cc": 115, "name": "Env 4 Sustain", "min": 0, "max": 127}, {"cc": 116, "name": "Env 4 Decay 2", "min": 0, "max": 127}, {"cc": 117, "name": "Env 4 Sustain 2", "min": 0, "max": 127}, {"cc": 118, "name": "Env 4 Release", "min": 0, "max": 127},
            {"cc": 120, "name": "All Sound Off", "min": 0, "max": 0}, {"cc": 121, "name": "Reset All Controllers", "min": 0, "max": 0}, {"cc": 122, "name": "Local Control", "min": 0, "max": 127}, {"cc": 123, "name": "All Notes Off", "min": 0, "max": 0}],
        "setup": ["Global: MIDI Channel (or per-part channel in Multi mode with the part's Prg Change filter set to receive).",
                  "Global: Ctrl Receive = on, or no control change changes a parameter.",
                  "Avoid channel 10 in Multi mode (Waldorf FAQ: can cause crashes).",
                  "Allow a gap after a program change (OS notes: fast program changes can be missed)."],
        "notes": ["Factory names from Waldorf's 2012 factory sound set (SNDD dumps, 16-character names); 2008 set differs.",
                  "Secondary: after switching a Multi, wait before selecting the parts' programs; an editor uses 800 ms."],
        "sources": [{"title": "Blofeld User's Manual, revision 1.1 (January 2009)", "url": "https://downloads.waldorfmusic.com/cloud/index.php/s/32zdTsdYcRSX9eE", "detail": "pp. 18, 24-28, 82-85, 113-117, 122"},
                    {"title": "Blofeld factory sounds 2012 (name list and SNDD dumps)", "url": "https://downloads.waldorfmusic.com/cloud/index.php/s/fi4DWR7G2aXnWQ3", "detail": "Blo Factory 2012.txt, Sysex/factory 2012 A..H.syx"},
                    {"title": "Blofeld SysEx specification, release 1.04", "url": "https://downloads.waldorfmusic.com/cloud/index.php/s/ybExJgT4TzqT8ir", "detail": "SNDD layout, name at 363..378"},
                    {"title": "Waldorf OS 1.15 notes as re-posted (secondary)", "url": "https://www.elektronauts.com/t/digitakt-blofeld-multi-mode-midi/51291/20", "detail": "CC 0 / CC 32 interchangeable, Multi selection, timing"}],
        "unverified": ["channel.default", "programChange.gapMs:no manufacturer figure", "Multi selection by CC 0 = 127", "CC 0 acceptance on OS 1.25"],
        "presets": "blofeld",
    },
    {
        "id": "waldorf-pulse-2", "name": "Waldorf Pulse 2", "maker": "Waldorf",
        "channel": {"default": None, "note": "Global MIDI Channel: OMNI or 1..16 (omni receives all, sends on 1)."},
        "programChange": {"supported": True, "displayBase": 1, "programs": 100, "bankFormat": "hundreds", "pad": 3,
                          "bankSelect": {"scheme": "cc32", "banks": [{"index": i, "name": str(i * 100 + 1) + ".." + str(i * 100 + 100), "msb": None, "lsb": i} for i in range(5)]}, "gapMs": 0, "gapAfter": "program",
                          "note": "Display 001..500 as one range. Firmware readme (v1.14): only bank LSB (CC 32) is read, banks 0..4 = 001..100, 101..200, 201..300, 301..400, 401..500; CC 0 ignored; the program number is clamped to 0..99 inside the bank; the bank stays latched until Reset All Controllers. PC 0 = 001 per user tests (not stated by Waldorf). Program 500 generates a random patch."},
        "controllers": [
            {"cc": 1, "name": "Modulation Wheel", "min": 0, "max": 127}, {"cc": 5, "name": "Glide Rate", "min": 0, "max": 127}, {"cc": 10, "name": "VCA Panning", "min": 0, "max": 127},
            {"cc": 14, "name": "Filter Env Attack", "min": 0, "max": 127}, {"cc": 15, "name": "Filter Env Decay", "min": 0, "max": 127}, {"cc": 16, "name": "Filter Env Sustain", "min": 0, "max": 127}, {"cc": 17, "name": "Filter Env Release", "min": 0, "max": 127},
            {"cc": 18, "name": "Amp Env Attack", "min": 0, "max": 127}, {"cc": 19, "name": "Amp Env Decay", "min": 0, "max": 127}, {"cc": 20, "name": "Amp Env Sustain", "min": 0, "max": 127}, {"cc": 21, "name": "Amp Env Release", "min": 0, "max": 127},
            {"cc": 24, "name": "LFO 1 Speed", "min": 0, "max": 127}, {"cc": 25, "name": "LFO 1 Shape", "min": 0, "max": 127}, {"cc": 26, "name": "LFO 2 Speed", "min": 0, "max": 127}, {"cc": 27, "name": "LFO 2 Delay", "min": 0, "max": 127},
            {"cc": 29, "name": "Filter Env Trigger", "min": 0, "max": 127}, {"cc": 31, "name": "Amp Env Trigger", "min": 0, "max": 127},
            {"cc": 35, "name": "Osc 1 Pulsewidth", "min": 0, "max": 127}, {"cc": 36, "name": "Osc 2 Semitone", "min": 0, "max": 127}, {"cc": 37, "name": "Osc 2 Detune", "min": 0, "max": 127}, {"cc": 38, "name": "Osc 2 Shape", "min": 0, "max": 127}, {"cc": 39, "name": "Osc 2 Pulsewidth", "min": 0, "max": 127}, {"cc": 40, "name": "Osc 2 Keytrack", "min": 0, "max": 127},
            {"cc": 41, "name": "Osc 3 Sync", "min": 0, "max": 127}, {"cc": 42, "name": "Osc 3 Semitone", "min": 0, "max": 127}, {"cc": 43, "name": "Osc 3 Detune", "min": 0, "max": 127}, {"cc": 44, "name": "Osc 3 Shape", "min": 0, "max": 127},
            {"cc": 45, "name": "Osc 1 Level", "min": 0, "max": 127}, {"cc": 46, "name": "Osc 2 Level", "min": 0, "max": 127}, {"cc": 47, "name": "Osc 3 Level", "min": 0, "max": 127}, {"cc": 48, "name": "Noise Level", "min": 0, "max": 127},
            {"cc": 49, "name": "VCF Type", "min": 0, "max": 127}, {"cc": 50, "name": "VCF Cutoff", "min": 0, "max": 127}, {"cc": 51, "name": "VCF Keytrack", "min": 0, "max": 127}, {"cc": 52, "name": "VCF Env Amount", "min": 0, "max": 127}, {"cc": 53, "name": "VCF Velocity", "min": 0, "max": 127}, {"cc": 56, "name": "VCF Resonance", "min": 0, "max": 127},
            {"cc": 57, "name": "VCA Volume", "min": 0, "max": 127}, {"cc": 58, "name": "VCA Velocity", "min": 0, "max": 127}, {"cc": 62, "name": "Glide Mode", "min": 0, "max": 127}, {"cc": 64, "name": "Sustain Pedal", "min": 0, "max": 127},
            {"cc": 70, "name": "Osc 1 Semitone", "min": 0, "max": 127}, {"cc": 71, "name": "Osc 1 Detune", "min": 0, "max": 127}, {"cc": 72, "name": "Osc 3 Routing", "min": 0, "max": 127}, {"cc": 73, "name": "Osc 1 Keytrack", "min": 0, "max": 127}, {"cc": 74, "name": "Filter Env Loop", "min": 0, "max": 127}, {"cc": 75, "name": "Amp Env Loop", "min": 0, "max": 127},
            {"cc": 76, "name": "VCA Drive", "min": 0, "max": 127}, {"cc": 77, "name": "VCA Drive Curve", "min": 0, "max": 127},
            {"cc": 79, "name": "Arp Active", "min": 0, "max": 127}, {"cc": 80, "name": "Arp Range", "min": 0, "max": 127}, {"cc": 81, "name": "Arp Tempo", "min": 0, "max": 127}, {"cc": 82, "name": "Arp Clock", "min": 0, "max": 127}, {"cc": 83, "name": "Arp Mode", "min": 0, "max": 127}, {"cc": 84, "name": "Step Duration", "min": 0, "max": 127}, {"cc": 85, "name": "Arp Swing", "min": 0, "max": 127}, {"cc": 86, "name": "Arp Delay", "min": 0, "max": 127}, {"cc": 87, "name": "Pattern Length", "min": 0, "max": 127}, {"cc": 88, "name": "Accent Control", "min": 0, "max": 127},
            {"cc": 90, "name": "Mod 5 Source", "min": 0, "max": 127}, {"cc": 91, "name": "Mod 5 Amount", "min": 0, "max": 127}, {"cc": 92, "name": "Mod 5 Target", "min": 0, "max": 127}, {"cc": 93, "name": "Mod 6 Source", "min": 0, "max": 127}, {"cc": 94, "name": "Mod 6 Amount", "min": 0, "max": 127}, {"cc": 95, "name": "Mod 6 Target", "min": 0, "max": 127},
            {"cc": 96, "name": "Mod 7 Source", "min": 0, "max": 127}, {"cc": 97, "name": "Mod 7 Amount", "min": 0, "max": 127}, {"cc": 98, "name": "Mod 7 Target", "min": 0, "max": 127}, {"cc": 99, "name": "Mod 8 Source", "min": 0, "max": 127}, {"cc": 100, "name": "Mod 8 Amount", "min": 0, "max": 127}, {"cc": 101, "name": "Mod 8 Target", "min": 0, "max": 127},
            {"cc": 102, "name": "Unison Detune", "min": 0, "max": 127}, {"cc": 103, "name": "Osc 1 Amp Env Fade", "min": 0, "max": 127}, {"cc": 104, "name": "Osc 2 Amp Env Fade", "min": 0, "max": 127}, {"cc": 105, "name": "Bend Upwards", "min": 0, "max": 127}, {"cc": 106, "name": "Bend Down", "min": 0, "max": 127},
            {"cc": 108, "name": "Mod 1 Source", "min": 0, "max": 127}, {"cc": 109, "name": "Mod 1 Amount", "min": 0, "max": 127}, {"cc": 110, "name": "Mod 1 Target", "min": 0, "max": 127}, {"cc": 111, "name": "Mod 2 Source", "min": 0, "max": 127}, {"cc": 112, "name": "Mod 2 Amount", "min": 0, "max": 127}, {"cc": 113, "name": "Mod 2 Target", "min": 0, "max": 127},
            {"cc": 114, "name": "Mod 3 Source", "min": 0, "max": 127}, {"cc": 115, "name": "Mod 3 Amount", "min": 0, "max": 127}, {"cc": 116, "name": "Mod 3 Target", "min": 0, "max": 127}, {"cc": 117, "name": "Mod 4 Source", "min": 0, "max": 127}, {"cc": 118, "name": "Mod 4 Amount", "min": 0, "max": 127}, {"cc": 119, "name": "Mod 4 Target", "min": 0, "max": 127},
            {"cc": 120, "name": "All Sound Off", "min": 0, "max": 0}, {"cc": 121, "name": "Reset All Controllers", "min": 0, "max": 0}, {"cc": 123, "name": "All Notes Off", "min": 0, "max": 0}],
        "setup": ["Global: MIDI Channel.", "No program-change enable exists; bank LSB (CC 32) 0..4 selects the hundred, latched until Reset All Controllers.", "Program 500 is the random patch generator."],
        "notes": ["Factory names from Waldorf's preset list (2016-07-26): 001..410 named, 411..499 INIT, 500 RANDOM.",
                  "A secondary changelog says CC 59 = preset panning against the manual's CC 10; left as the manual says."],
        "sources": [{"title": "Pulse 2 user manual, revision 1.0 (September 2013)", "url": "https://downloads.waldorfmusic.com/cloud/index.php/s/kfHqRdr7Jd4FQoj", "detail": "pp. 13-14, 40-45, 58, 61-63, 67"},
                    {"title": "Pulse 2 factory preset list (2016-07-26)", "url": "https://downloads.waldorfmusic.com/cloud/index.php/s/egSEKaiSn4jk8Lq", "detail": "pages 1-2, by number"},
                    {"title": "Pulse 2 firmware bundle with the cumulative readme (bank select in the v1.14 entry)", "url": "https://downloads.waldorfmusic.com/cloud/index.php/s/n6mxaCwWFZ2yeB2", "detail": "Pulse_2_Firmware_V1.21/readme.txt"},
                    {"title": "Elektronauts user test of bank/PC numbering (secondary)", "url": "https://www.elektronauts.com/t/switching-programs-on-the-pulse-2/3361?page=2", "detail": "PC 0 = 001"}],
        "unverified": ["channel.default", "programChange.displayBase (user tests only)", "CC 0 handling on firmware 1.21", "CC 10 vs CC 59 panning"],
        "presets": "pulse2",
    },
    {
        "id": "dirtywave-m8", "name": "Dirtywave M8 Tracker Model:02", "maker": "Dirtywave",
        "channel": {"default": None, "note": "MIDI Settings view: a channel per track 1..8 (default track n = channel n), stored in the song; separate record, control-map (10) and song-row-cue (11) channels."},
        "programChange": {"supported": True, "displayBase": 0, "programs": 128, "bankFormat": "none", "pad": 2, "displayHex": True,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "With PG CHANGE on, a PC on a track's channel selects that track's instrument INST 00..7F (hex). PC 0 = INST 00 is the natural reading; unverified. Bank select on receive is not documented."},
        "controllers": [{"cc": -1, "name": "No fixed CC list: per-song MIDI mappings (any CC on the control-map channel to instrument / mixer / effect / tempo / transpose parameters); CC 64 sustain on track input", "min": 0, "max": 127}],
        "setup": ["MIDI Settings: track channels (default track n = channel n).", "MIDI Settings: PG CHANGE = on.", "Name the instruments in the song; the rig profile can name INST 00..7F for the editor."],
        "notes": ["Instruments are per-song user content (00..7F hex); no factory names.", "Firmware 6.6.3C at research time; manual v6.5.2."],
        "sources": [{"title": "M8 Operation Manual v6.5.2 (2026-04-21)", "url": "https://cdn.shopify.com/s/files/1/0455/0485/6229/files/m8_operation_manual_v20260421.pdf?v=1776791699", "detail": "pp. 2, 5, 8, 43-45, 62-65, 91"},
                    {"title": "M8 firmware changelog", "url": "https://raw.githubusercontent.com/Dirtywave/M8Firmware/main/changelog.txt", "detail": "2.5.0 sustain, 2.7.0 bank MSB on send, 2.7.3 and 6.5.2 program change"}],
        "unverified": ["channel.default", "programChange.displayBase", "bank select on receive", "omni"],
        "presets": [],
    },
    {
        "id": "korg-volca-fm2", "name": "Korg volca fm2", "maker": "Korg",
        "channel": {"default": None, "note": "Hold MEMORY at power-on and press key 1..16; memorised. Mode 3 (omni off). TRS MIDI in/out, no USB. Factory default not stated."},
        "programChange": {"supported": False, "displayBase": 0, "programs": 64, "bankFormat": "none", "pad": 2,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Program change is neither received nor transmitted (chart); the 64 programs are selected on the panel or by SysEx dump. A program event targeted at this device does nothing."},
        "controllers": [
            {"cc": 40, "name": "Octave (TRANSPS NOTE off) / Transpose (on)", "min": 0, "max": 127, "values": {"0": "-3 oct", "55": "0", "110": "+3 oct"}},
            {"cc": 41, "name": "Velocity", "min": 0, "max": 127}, {"cc": 42, "name": "Modulator Attack", "min": 0, "max": 127, "values": {"64": "0"}}, {"cc": 43, "name": "Modulator Decay", "min": 0, "max": 127, "values": {"64": "0"}},
            {"cc": 44, "name": "Carrier Attack", "min": 0, "max": 127, "values": {"64": "0"}}, {"cc": 45, "name": "Carrier Decay", "min": 0, "max": 127, "values": {"64": "0"}},
            {"cc": 46, "name": "LFO Rate", "min": 0, "max": 127}, {"cc": 47, "name": "LFO Pitch Depth", "min": 0, "max": 127}, {"cc": 48, "name": "Algorithm", "min": 0, "max": 127, "values": {"0": "1", "127": "32"}},
            {"cc": 49, "name": "Arp Type", "min": 0, "max": 127, "values": {"0": "off", "13": "rise 1", "26": "rise 2", "39": "rise 3", "52": "fall 1", "58": "fall 2", "74": "fall 3", "90": "random 1", "103": "random 2", "116": "random 3"}},
            {"cc": 50, "name": "Arp Division", "min": 0, "max": 127, "values": {"0": "1/12", "12": "1/8", "24": "1/4", "36": "1/3", "47": "1/2", "59": "2/3", "70": "1/1", "82": "3/2", "94": "2/1", "105": "3/1", "117": "4/1"}},
            {"cc": 64, "name": "Sustain (firmware 1.10+)", "min": 0, "max": 127}, {"cc": 91, "name": "Reverb Depth", "min": 0, "max": 127}, {"cc": 93, "name": "Chorus Depth", "min": 0, "max": 127}, {"cc": 123, "name": "All Notes Off", "min": 0, "max": 0}],
        "setup": ["Set the MIDI channel (hold MEMORY at power-on, key 1..16).", "Global parameter 7 MIDI ShortMessage = on (factory default), or no channel message is received.", "Program change is not received: only CC events reach this device."],
        "notes": ["No factory program names are published; names live in the SysEx dump only."],
        "sources": [{"title": "volca fm2 MIDI Implementation Chart (2021-10-27, v1.0)", "url": "https://cdn.korg.com/us/support/download/files/38bf877e063858210403554ec502efac.pdf", "detail": "Program Change: not recognised"},
                    {"title": "volca fm2 MIDI Implementation (text, rev 1.00, 2022-11-17)", "url": "https://cdn.korg.com/us/support/download/files/b0ec4b721695a217d1ecaa248a93ab78.txt", "detail": "2-1 channel messages and footnotes"},
                    {"title": "volca fm2 owner's manual (2024-11-07)", "url": "https://cdn.korg.com/us/support/download/files/fd37180c39c87b20df510643347ee119.pdf", "detail": "p. 3 MIDI channel, global parameters"},
                    {"title": "volca fm2 system updater 1.12 release notes (CC 64 in 1.10)", "url": "https://www.korg.com/us/support/download/software/0/892/4964/", "detail": ""}],
        "unverified": ["channel.default", "panel program numbering (0..63 or 1..64)", "CC 64 semantics"],
        "presets": [],
    },
    {
        "id": "instruo-seashell", "name": "Instruo Seashell", "maker": "Instruo",
        "channel": {"default": None, "note": "Set in the Seashell Controller software (Settings > MIDI Channel). TRS type A MIDI in and class-compliant USB-C. Default and omni not documented."},
        "programChange": {"supported": "unverified", "displayBase": 0, "programs": 0, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Not supported in the published firmware 1.0.x (presets are files of the Controller app). Firmware 2.0 (announced, not on Instruo's site) is said to add 120 preset slots selected by program change; numbering and bank scheme unknown."},
        "controllers": [{"cc": -1, "name": "No fixed CC map: parameters are assigned by MIDI Learn in the Controller app; any CC 0..127 can be a modulation-matrix source", "min": 0, "max": 127}],
        "setup": ["Seashell Controller: Settings > MIDI Channel.", "Map the parameters you want to drive with MIDI Learn (the mapping is yours; enter the CC numbers in the rig profile)."],
        "notes": ["No preset names published.", "Secondary: a user-made default CC map exists (Electra One preset); not a factory assignment."],
        "sources": [{"title": "Seashell user manual (2025-06-10, firmware 1.0.0)", "url": "https://instruomodular.com/wp-content/uploads/manuals/Seashell%20Manual.pdf", "detail": "pp. 11, 45, 49-50, 55"},
                    {"title": "Instruo firmware page (1.0.3 notes)", "url": "https://www.instruomodular.com/firmware/", "detail": ""},
                    {"title": "SonicState report on firmware 2.0 (secondary)", "url": "https://sonicstate.com/news/2026/10/26/beijing-26-instruo-seashell-v20/", "detail": "120 slots, program change"}],
        "unverified": ["channel.default", "programChange.supported", "programChange.programs", "any CC assignment", "timing"],
        "presets": [],
    },
    {
        "id": "mvave-fm1-skiff", "name": "M-VAVE FM-1 (Skiff firmware)", "maker": "M-VAVE (firmware: Skiff by illuminus5, GPL-3.0)",
        "channel": {"default": None, "note": "MENU > MIDI: MIDI IN = CH1-6 (channels 1..6 play tracks 1..6; other channels are ignored entirely) or SEL (every channel plays the selected track); T1..T6 CHANNEL 1..16 per track (default 1..6). USB MIDI in/out and TRS in."},
        "programChange": {"supported": True, "displayBase": 0, "programs": 148, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Skiff 1.3+: a PC on a track's channel loads that track's engine's factory sound number n, counted from 0 (0 on an FM6 track = TINE EP); a program past the engine's last preset is ignored, not wrapped; user sounds are not reachable. No bank select (CC 0 / CC 32 ignored). The number means a different sound per engine, so name presets per engine in the rig profile."},
        "controllers": [
            {"cc": 1, "name": "Mod wheel (MOD source)", "min": 0, "max": 127}, {"cc": 5, "name": "Glide", "min": 0, "max": 127}, {"cc": 7, "name": "Level", "min": 0, "max": 127},
            {"cc": 10, "name": "Pan", "min": 0, "max": 127}, {"cc": 11, "name": "Expression (MOD source)", "min": 0, "max": 127}, {"cc": 64, "name": "Sustain", "min": 0, "max": 127, "values": {"0": "off", "64": "on"}},
            {"cc": 71, "name": "Engine resonance (ANALOG / TRIO / NOISE)", "min": 0, "max": 127}, {"cc": 72, "name": "Release", "min": 0, "max": 127}, {"cc": 73, "name": "Attack", "min": 0, "max": 127},
            {"cc": 74, "name": "Engine brightness (cutoff / DCW / tone / FM6 modulator level)", "min": 0, "max": 127}, {"cc": 75, "name": "Decay", "min": 0, "max": 127},
            {"cc": 91, "name": "Reverb send", "min": 0, "max": 127}, {"cc": 93, "name": "Chorus send", "min": 0, "max": 127}, {"cc": 94, "name": "Delay send", "min": 0, "max": 127},
            {"cc": 120, "name": "All Sound Off", "min": 0, "max": 0}, {"cc": 121, "name": "Reset All Controllers", "min": 0, "max": 0}, {"cc": 123, "name": "All Notes Off", "min": 0, "max": 0}],
        "setup": ["Load Skiff (web installer); MENU > MIDI: MIDI IN = CH1-6 and the track channels, or SEL.",
                  "Program numbers count the track's engine's factory presets from 0: set each track's engine first.",
                  "A PC is applied by the main loop after the message: keep a small gap before the notes (no published figure)."],
        "notes": ["148 factory sounds over 14 engines (per-engine order in firmware/src/engines.c); no complete published name list, so presets are named in the rig profile.", "Skiff v2.1.1 (2026-10-31) at research time."],
        "sources": [{"title": "Skiff repository (README: MIDI, CC map)", "url": "https://github.com/illuminus5/skiff", "detail": "v2.1.1"},
                    {"title": "Skiff manual, chapter 19 MIDI and the web editor", "url": "https://illuminus5.github.io/skiff/learn/", "detail": "program change counted from 0, CC table, MIDI LEARN"},
                    {"title": "Skiff source: firmware/src/midi_control.c, ui.c (midi_pc_load)", "url": "https://github.com/illuminus5/skiff/blob/main/firmware/src/midi_control.c", "detail": "PC per track, no bank select"}],
        "unverified": ["channel.default", "per-engine preset order and names", "PC latency on hardware", "TRS jack polarity"],
        "presets": [],
    },
    {
        "id": "mvave-fm1-melodee", "name": "M-VAVE FM-1 (Melodee firmware)", "maker": "M-VAVE (firmware: Melodee by keremimo, GPL-3.0)",
        "channel": {"default": None, "note": "GLO > SYSTEM > ROUT = CH1-4 / CH5-8 / CH9-12 / CH13-16 (four consecutive channels on tracks 1..4) or SEL (every channel plays the selected track); DRUM channel OFF / 1..16 (default 10); MIDI tracks have their own channel 1..16. USB class-compliant, TRS input, BLE MIDI."},
        "programChange": {"supported": False, "displayBase": 0, "programs": 0, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Melodee 1.6.1 has no program change handler (0xCn is only forwarded to MIDI-only tracks for output); sounds are selected on the panel. The optional MIDI KNOBS profile turns the PRESETS encoder with CC 18 (GENERAL) or CC 76 (MINILAB), a knob emulation, not a PC. A program event targeted at this device does nothing."},
        "controllers": [
            {"cc": 1, "name": "Mod wheel (selected track)", "min": 0, "max": 127}, {"cc": 5, "name": "Glide", "min": 0, "max": 127}, {"cc": 7, "name": "Track level", "min": 0, "max": 127},
            {"cc": 10, "name": "Pan", "min": 0, "max": 127}, {"cc": 64, "name": "Sustain", "min": 0, "max": 127, "values": {"0": "off", "64": "on"}},
            {"cc": 71, "name": "Engine macro (resonance)", "min": 0, "max": 127}, {"cc": 72, "name": "Release", "min": 0, "max": 127}, {"cc": 73, "name": "Attack", "min": 0, "max": 127},
            {"cc": 74, "name": "Engine macro (brightness / cutoff)", "min": 0, "max": 127}, {"cc": 75, "name": "Decay", "min": 0, "max": 127},
            {"cc": 120, "name": "All Sound Off", "min": 0, "max": 0}, {"cc": 121, "name": "Reset All Controllers", "min": 0, "max": 0}, {"cc": 123, "name": "All Notes Off", "min": 0, "max": 0}],
        "setup": ["Load Melodee (web installer); GLO > SYSTEM > ROUT to put the tracks on the channels the song uses (or SEL).", "No program change: only CC events reach this device."],
        "notes": ["Melodee 1.6.1 (2026-11-02) at research time; a modified Felucca. FM6 ROM voices: TINE EP, BRASS SECT, SOLID BASS, BELLS, MARIMBA, CLAVINET, DRAWBARS, STRINGS, GLASS PAD, SYNC LEAD, HARP, KALIMBA, FLUTE, STEEL DRUM, SAW BASS, TUBULAR (not selectable by MIDI)."],
        "sources": [{"title": "Melodee repository", "url": "https://github.com/keremimo/melodee", "detail": "v1.6.1"},
                    {"title": "Melodee manual, MIDI section", "url": "https://keremimo.github.io/melodee/webapp/manual/", "detail": "ROUT, DRUM channel, CC list, MIDI KNOBS, MIDI LEARN"},
                    {"title": "Melodee source: firmware/src/midi_control.c (midi_event: no 0xCn handler)", "url": "https://github.com/keremimo/melodee/blob/main/firmware/src/midi_control.c", "detail": "code read, not hardware-verified"}],
        "unverified": ["channel.default", "behaviour on hardware (code read only)", "whether a nightly adds program change"],
        "presets": [],
    },
    {
        "id": "mvave-fm1-orange-cat", "name": "M-VAVE FM-1 (Orange Cat firmware)", "maker": "M-VAVE (firmware: Orange Cat, in development)",
        "channel": {"default": None, "note": "Placeholder: Orange Cat's MIDI implementation is not settled. Channel and notes only."},
        "programChange": {"supported": "unverified", "displayBase": 0, "programs": 0, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Placeholder to fill in when Orange Cat's MIDI implementation is settled."},
        "controllers": [],
        "setup": ["Load the Orange Cat firmware; set its MIDI channel per its own documentation."],
        "notes": ["Placeholder definition (Task 04): no program change, no named CCs until the firmware's MIDI implementation is settled."],
        "sources": [{"title": "Orange Cat FM-1 firmware (separate project, in development)", "url": "", "detail": "no published MIDI implementation yet"}],
        "unverified": ["everything beyond channel and notes"],
        "presets": [],
    },
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--proteus"); ap.add_argument("--blofeld"); ap.add_argument("--pulse2"); ap.add_argument("--zoom")
    args = ap.parse_args()
    lists = {}
    if args.proteus: lists["proteus"] = proteus_presets(args.proteus)
    if args.blofeld: lists["blofeld"] = blofeld_presets(args.blofeld)
    if args.pulse2: lists["pulse2"] = pulse2_presets(args.pulse2)
    if args.zoom: lists["zoom"] = zoom_presets(args.zoom)
    os.makedirs(OUT, exist_ok=True)
    for d in DEVICES:
        dev = {"schema": "tabby-device/1", "version": "0.1", **{k: v for k, v in d.items() if k != "presets"}}
        p = d["presets"]
        dev["presets"] = lists.get(p, read_existing_presets(d["id"])) if isinstance(p, str) else p
        path = os.path.join(OUT, d["id"] + ".json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(dev, f, ensure_ascii=False, indent=1)
            f.write("\n")
        print(path, len(dev["presets"]), "presets")


if __name__ == "__main__":
    main()
