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
Version: 0.2
Revision log
    v0.2  2026-11-05  Task 09 (the Wrong Room rig): four new definitions (Chase Bliss Brothers,
                      Strymon NightSky, Tone King Royalist Preamp, the SMK-37's own FM6 as an
                      internal pseudo-device); every existing definition rechecked against the
                      current manufacturer documents and releases (Skiff 2.2, Melodee 1.6.1,
                      Orange Cat read from its source, M8 firmware 6.6.3 / manual 6.5.2, H90
                      1.12.5, Zoom 1.20, Seashell 1.0.3); the optional fields `kind`
                      (instrument / effect / internal), `midiIn`, `clock`, `channelSetting` and
                      `firmware` that the Wrong Room profile and the generated guide use
                      (web/rig/device-library.js v0.2 validates them when present).
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
        "id": "emu-proteus-2-xr", "name": "E-MU Proteus/2 XR", "maker": "E-mu Systems", "kind": "instrument",
        "firmware": "Proteus operation manual with the 1992 MIDI addendum (revision 4, 1992-03-04); no later document",
        "midiIn": {"connector": "5-pin DIN in, out and thru (thru is an exact copy of in)", "trs": None, "note": "Standard DIN cable. In this rig: H4MIDI WC MIDI OUT 2 with a filter passing channels 5..8 only, merged with the second controller from MIDI IN 2."},
        "clock": {"receives": False, "syncs": "nothing: the manual has no MIDI clock and no realtime messages", "setting": ""},
        "channelSetting": "Master > MIDI MODE = Multi; Master > MIDI ENABLE channel 05..08 On and every channel you do not use Off; Master > PRESET CHANGE 05..08 On; on the main screen cursor to the channel number, dial C05..C08 and the preset for each.",
        "channel": {"default": None, "note": "Multi mode: each of the 16 channels has its own preset; set MIDI ENABLE and PRESET CHANGE on per channel. Wrong Room: channels 5..8 are Classic Tabby's parts 1..4; every other channel the Proteus hears belongs to the second controller."},
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
                  "Per channel the song addresses (5..8): MIDI ENABLE on and PRESET CHANGE on; MIDI ENABLE off on every channel that is neither yours nor the second controller's.",
                  "Feed the Proteus from H4MIDI WC MIDI OUT 2 (filter: channels 5..8 only from MIDI IN 1; MIDI IN 2 unfiltered), so the second controller's channels never meet Classic Tabby's.",
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
        "id": "eventide-h90", "name": "Eventide H90 Harmonizer", "maker": "Eventide", "kind": "effect",
        "firmware": "H90 1.12.5 (2025-12-18) and its manual v1.12.5; no newer release found on 2026-11-05",
        "midiIn": {"connector": "5-pin DIN in, DIN out/thru, USB-C (MIDI over USB); the TRS jacks are EXP/CTL only", "trs": None, "note": "Standard DIN cable from the Thru5 WC."},
        "clock": {"receives": True, "syncs": "the tempo (delays, modulation rates): Tempo Menu > Tempo Source = MIDI Clock", "setting": "Tempo Menu (hold Presets + Parameters) > Tempo Source = MIDI Clock; System > MIDI > Clock Source = DIN or USB"},
        "channelSetting": "System Menu (hold Programs + Routing) > MIDI > Channel = 15 (receive and transmit) or Receive Omni.",
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
                  "Tempo Menu > Tempo Source = MIDI Clock and System > MIDI > Clock Source = DIN, so delays follow Classic Tabby's clock.",
                  "A CC sent right after a PC is ignored on 1.9.x (Eventide staff, March 2025: 'not addressed'; no later release note says fixed, 1.12.5 included): keep this device's gap after the program change."],
        "notes": ["Program names are per user (the Playlist is user-arranged): name the 99 slots in the rig profile.",
                  "A PC loads the whole Program (both A and B); presets A/B are not selectable by MIDI."],
        "sources": [{"title": "H90 User Guide v1.12.5, 7.4 MIDI (channel, Receive Omni, PC Offset, Output Mode, Clock Source)", "url": "https://cdn.eventideaudio.com/manuals/h90/1.12.5/content/system-menu/midi.html", "detail": "read 2026-11-05"},
                    {"title": "H90 User Guide v1.12.5, Appendix C global mapping chart (no default CC map; toggle at >= 64)", "url": "https://cdn.eventideaudio.com/manuals/h90/1.12.5/content/appendix/global.html", "detail": ""},
                    {"title": "H90 User Guide v1.12.5, Tempo Menu (Tempo Source = MIDI Clock) and Tech Specs (DIN in, DIN out/thru, USB-C)", "url": "https://cdn.eventideaudio.com/manuals/h90/1.12.5/content/tempo-menu.html", "detail": "also .../appendix/specifications.html"},
                    {"title": "Eventide staff: PC n loads Program n, no bank select, Lists not selectable by MIDI", "url": "https://www.eventideaudio.com/?p=189216", "detail": "March 2025"},
                    {"title": "Eventide staff on the CC-after-PC bug: not addressed in 1.9.11", "url": "https://www.eventideaudio.com/forums/topic/v1-9-11-release-notes/", "detail": "March 2025; 1.12.5 notes do not mention it"},
                    {"title": "H90 release 1.12.5 announcement", "url": "https://www.eventideaudio.com/forums/topic/h90-software-latest-h90-release-1-12-5/", "detail": "2025-12-18"}],
        "unverified": ["channel.default (the manual gives none)", "programChange.gapMs:no manufacturer figure; the CC-after-PC bug's fix status in 1.12.5", "wire PC 99 / 100 with PC Offset off", "MIDI Start / Stop handling", "USB carries PC/CC (manual says only 'receive MIDI over USB')"],
        "presets": [],
    },
    {
        "id": "zoom-ms-70cdr-plus", "name": "Zoom MS-70CDR+", "maker": "Zoom", "kind": "effect",
        "firmware": "MS-70CDR+ system software 1.20 (January 2025); MIDI implementation chart 1.00 (2024-03-01)",
        "midiIn": {"connector": "USB-C only (a USB MIDI device, bus-powered); no DIN, no TRS", "trs": None, "note": "Needs a USB host: H4MIDI WC USB-A through the powered hub, port filter: channel 16 only, program change only."},
        "clock": {"receives": False, "syncs": "nothing (chart: clock x)", "setting": ""},
        "channelSetting": "MENU > USB MIDI CH = 16 (not OMNI: in OMNI every program change on the chain would switch patches).",
        "channel": {"default": 16, "note": "MENU > USB MIDI CH = 1..16 or OMNI (memorised). USB MIDI only: the pedal is a USB device and needs a USB host (CME H4MIDI WC in this rig). Factory default not stated; 16 is this rig's setting."},
        "programChange": {"supported": True, "displayBase": 1, "programs": 100, "bankFormat": "none", "pad": 3,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Patches are displayed 001..100; the chart lists PC 0-100 'true number 0-100' without a mapping, so whether PC 0 or PC 1 is patch 001 is unverified (displayBase 1 assumed; change it after the hardware check)."},
        "controllers": [],
        "setup": ["MENU > USB MIDI CH = 16 (set it: the factory default is not documented and OMNI would take every program change).",
                  "H4MIDI WC: the pedal on a USB host port behind the powered hub, that port filtered to channel 16 and program change only.",
                  "Connect the USB host before the set; the pedal shows a USB CONNECT prompt on batteries.",
                  "Hardware check: send PC 0 and PC 1 and note which patch the display shows; set displayBase accordingly."],
        "notes": ["No control change and no SysEx are recognised (chart); patch selection is the only MIDI function.",
                  "Factory patches 001..080 from Zoom's patch list; 081..100 are empty user slots."],
        "sources": [{"title": "MS-70CDR+ Operation Manual (chart p. 69, USB MIDI CH p. 59)", "url": "https://zoomcorp.com/media/documents/E_MS-70CDRplus.pdf", "detail": "chart dated Mar. 1, 2024, version 1.00"},
                    {"title": "MS-70CDR+ Patch Memory List, preset ver. 1.00", "url": "https://zoomcorp.com/media/documents/E_MS-70CDRplus_Patchlist.pdf", "detail": "80 factory patches"}],
        "unverified": ["channel.default", "programChange.displayBase", "class compliance behind a USB host (not in CME's list)", "patch change delay"],
        "presets": "zoom",
    },
    {
        "id": "waldorf-blofeld", "name": "Waldorf Blofeld", "maker": "Waldorf", "kind": "instrument",
        "midiIn": {"connector": "5-pin DIN in and USB (Desktop: no MIDI out)", "trs": None, "note": ""},
        "clock": {"receives": "unverified", "syncs": "arpeggiator and LFO sync per the manual's sync settings (not researched for this rig)", "setting": ""},
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
        "id": "waldorf-pulse-2", "name": "Waldorf Pulse 2", "maker": "Waldorf", "kind": "instrument",
        "midiIn": {"connector": "5-pin DIN in/out and USB (MIDI only)", "trs": None, "note": ""},
        "clock": {"receives": "unverified", "syncs": "arpeggiator clock per the manual (not researched for this rig)", "setting": ""},
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
        "id": "dirtywave-m8", "name": "Dirtywave M8 Tracker Model:02", "maker": "Dirtywave", "kind": "instrument",
        "firmware": "M8 firmware 6.6.3 F (changelog 2026-10-20); operation manual v6.5.2 (2026-04-21)",
        "midiIn": {"connector": "3.5 mm TRS type A in and out; USB-C class-compliant MIDI (behaves like the TRS input)", "trs": "A", "note": "DIN-to-TRS type A adapter from the Thru5 WC, or USB from a host."},
        "clock": {"receives": True, "syncs": "the song tempo and transport: SYNC IN = CLOCK, TRANSPORT, CLOCK+TRANSP., TRANSPORT+SPP or CLK+TRANSP+SPP", "setting": "MIDI Settings > SYNC IN = CLK+TRANSP+SPP (per song)"},
        "channelSetting": "MIDI Settings > Track MIDI Input: each M8 track has its own CHAN (default track n = channel n), INST#, PG CHANGE and MODE; stored in the song. Wrong Room: M8 track 1 CHAN 4, track 2 CHAN 10, track 3 CHAN 13, PG CHANGE on; tracks 4..8 on a channel nothing sends on, or on 13 in POLY.",
        "channel": {"default": None, "note": "MIDI Settings view: a channel per track 1..8 (default track n = channel n), stored in the song; separate record (9), control-map (10 or ALL) and song-row-cue (11) channels. Tracks on one channel play together: MONO, LEGATO or POLY (round-robin). Wrong Room: three M8 parts on channels 4, 10 and 13 = M8 tracks 1, 2 and 3."},
        "programChange": {"supported": True, "displayBase": 0, "programs": 128, "bankFormat": "none", "pad": 2, "displayHex": True,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "With PG CHANGE on, a PC on a track's channel selects that track's instrument INST 00..7F (hex). PC 0 = INST 00 is the natural reading; unverified. Bank select on receive is not documented."},
        "controllers": [{"cc": -1, "name": "No fixed CC list: per-song MIDI mappings (any CC on the control-map channel to instrument / mixer / effect / tempo / transpose parameters); CC 64 sustain on track input", "min": 0, "max": 127}],
        "setup": ["MIDI Settings (per song): track 1 CHAN 04, track 2 CHAN 10, track 3 CHAN 13; tracks 4..8 on a channel nothing sends on (or on 13 in POLY to add voices to part 3).",
                  "MIDI Settings: PG CHANGE = ON on tracks 1..3 (a PC on the channel selects that track's INST#).",
                  "MIDI Settings: SYNC IN = CLK+TRANSP+SPP so the M8 follows Classic Tabby's clock, Start, Stop and Song Position.",
                  "Save the song's MIDI settings as the default configuration (MIDI Settings page) so a new M8 song keeps them.",
                  "Name the instruments in the song; the rig profile can name INST 00..7F for the editor."],
        "notes": ["Instruments are per-song user content (00..7F hex); no factory names.", "Firmware 6.6.3 F (2026-10-20) at research time; manual v6.5.2 (2026-04-21). The 2023 manual's screenshot gives the defaults (track n = channel n, PG CHANGE ON, LEGATO)."],
        "sources": [{"title": "M8 Operation Manual v6.5.2 (2026-04-21)", "url": "https://cdn.shopify.com/s/files/1/0455/0485/6229/files/m8_operation_manual_v20260421.pdf?v=1776791699", "detail": "pp. 2, 5, 8, 43-45, 62-65, 91"},
                    {"title": "M8 firmware changelog", "url": "https://raw.githubusercontent.com/Dirtywave/M8Firmware/main/changelog.txt", "detail": "2.5.0 sustain, 2.7.0 bank MSB on send, 2.7.3 and 6.5.2 program change"}],
        "unverified": ["channel.default", "programChange.displayBase (PC n = INST n is not spelled out)", "bank select on receive", "whether a track's CHAN can be off (the manual lists 1..16)", "CCs on the track channel beyond CC 64 and pitch bend"],
        "presets": [],
    },
    {
        "id": "korg-volca-fm2", "name": "Korg volca fm2", "maker": "Korg", "kind": "instrument",
        "midiIn": {"connector": "3.5 mm TRS type A in and out, no USB", "trs": "A", "note": ""},
        "clock": {"receives": True, "syncs": "the sequencer and arpeggiator (chart: clock, start, stop, song position)", "setting": "none needed"},
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
        "id": "instruo-seashell", "name": "Instruo Seashell", "maker": "Instruo", "kind": "instrument",
        "firmware": "Seashell firmware 1.0.3 (the firmware page's latest; no date given); Seashell Controller 1.0.0; firmware 2.0 announced (secondary), not released",
        "midiIn": {"connector": "3.5 mm TRS type A MIDI in (the included adaptor) and class-compliant USB-C audio + MIDI; input only", "trs": "A", "note": "DIN-to-TRS type A adapter from the Thru5 WC."},
        "clock": {"receives": False, "syncs": "nothing: no MIDI clock; the only sync is the analogue Gate/Trig input (Tap Tempo menu)", "setting": ""},
        "channelSetting": "Seashell Controller app > Settings > MIDI Channel Menu = 1 (saved automatically since 1.0.3).",
        "channel": {"default": None, "note": "Set in the Seashell Controller software (Settings > MIDI Channel). TRS type A MIDI in and class-compliant USB-C. Default and omni not documented. Wrong Room: channel 1."},
        "programChange": {"supported": "unverified", "displayBase": 0, "programs": 0, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Not supported in the published firmware 1.0.x (presets are files of the Controller app). Firmware 2.0 (announced, not on Instruo's site) is said to add 120 preset slots selected by program change; numbering and bank scheme unknown."},
        "controllers": [{"cc": -1, "name": "No fixed CC map: parameters are assigned by MIDI Learn in the Controller app; any CC 0..127 can be a modulation-matrix source", "min": 0, "max": 127}],
        "setup": ["Seashell Controller: Settings > MIDI Channel = 1.", "Map the parameters you want to drive with MIDI Learn (the mapping is yours; enter the CC numbers in the rig profile).", "No program change in firmware 1.0.3: a song can only send CCs you learnt; keep an eye on firmware 2.0 (120 preset slots by program change, announced)."],
        "notes": ["No preset names published.", "Secondary: a user-made default CC map exists (Electra One preset); not a factory assignment."],
        "sources": [{"title": "Seashell user manual (2025, firmware 1.0.0): TRS type A in, USB-C, MIDI Channel Menu, MIDI Learn, no clock", "url": "https://instruomodular.com/wp-content/uploads/manuals/Seashell%20Manual.pdf", "detail": "pp. 4, 11, 45, 49-50, 55; reread 2026-11-05"},
                    {"title": "Instruo firmware page (1.0.3 notes: revised MIDI stack, channel saved automatically)", "url": "https://www.instruomodular.com/firmware/", "detail": ""},
                    {"title": "SonicState report on firmware 2.0 (secondary)", "url": "https://sonicstate.com/news/2026/10/26/beijing-26-instruo-seashell-v20/", "detail": "120 slots, program change"}],
        "unverified": ["channel.default", "programChange.supported", "programChange.programs", "any CC assignment", "timing"],
        "presets": [],
    },
    {
        "id": "mvave-fm1-skiff", "name": "M-VAVE FM-1 (Skiff firmware)", "maker": "M-VAVE (firmware: Skiff by illuminus5, GPL-3.0)", "kind": "instrument",
        "firmware": "Skiff 2.2 (2026-11-03); the online manual still describes the 1.3-era MIDI menu",
        "midiIn": {"connector": "USB class-compliant MIDI in/out and a 3.5 mm TRS MIDI in on the FM-1", "trs": None, "note": "TRS type not stated by Skiff or M-VAVE. In this rig a Skiff unit can take its channel directly (T1 CHANNEL = its channel, T2..T6 OFF) on any port; the H4MIDI filter is not needed but harmless."},
        "clock": {"receives": True, "syncs": "the sequencer: Clock, Start, Continue, Stop and (2.2) Song Position from the chosen input", "setting": "MENU > MIDI > CLOCK = USB or TRS (the port Classic Tabby arrives on); CLOCK OUT off"},
        "channelSetting": "MENU > MIDI > T1 CHANNEL = the unit's channel (2 for FM-1 A, 3 for FM-1 B), T2..T6 CHANNEL = OFF (2.2); MIDI IN shows TRACK. Older firmware: give T2..T6 channels nothing sends on.",
        "channel": {"default": None, "note": "MENU > MIDI: T1..T6 CHANNEL = 1..16, OFF or CH n EXT per track (2.2); a channel no track is on is ignored entirely; two tracks on one channel: the first plays it; MIDI IN = SEL makes every channel play the selected track; AUTO CHANNEL (2.2) plays the selected track from one extra channel. Wrong Room: FM-1 A channel 2, FM-1 B channel 3."},
        "programChange": {"supported": True, "displayBase": 0, "programs": 148, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Skiff 1.3+ (2.2 unchanged): a PC on a track's channel loads that track's engine's factory sound number n, counted from 0 (the PRESETS list order, aliases skipped; 0 on an FM6 track = TINE EP); a program past the engine's last preset is ignored, not wrapped; user sounds are not reachable; the load happens in the main loop after the message. No bank select (CC 0 / CC 32 ignored). The number means a different sound per engine, so name presets per engine in the rig profile."},
        "controllers": [
            {"cc": 1, "name": "Mod wheel (MOD source)", "min": 0, "max": 127}, {"cc": 5, "name": "Glide", "min": 0, "max": 127}, {"cc": 7, "name": "Level", "min": 0, "max": 127},
            {"cc": 10, "name": "Pan", "min": 0, "max": 127}, {"cc": 11, "name": "Expression (MOD source)", "min": 0, "max": 127}, {"cc": 64, "name": "Sustain", "min": 0, "max": 127, "values": {"0": "off", "64": "on"}},
            {"cc": 71, "name": "Engine resonance (ANALOG / TRIO / NOISE)", "min": 0, "max": 127}, {"cc": 72, "name": "Release", "min": 0, "max": 127}, {"cc": 73, "name": "Attack", "min": 0, "max": 127},
            {"cc": 74, "name": "Engine brightness (cutoff / DCW / tone / FM6 modulator level)", "min": 0, "max": 127}, {"cc": 75, "name": "Decay", "min": 0, "max": 127},
            {"cc": 91, "name": "Reverb send", "min": 0, "max": 127}, {"cc": 93, "name": "Chorus send", "min": 0, "max": 127}, {"cc": 94, "name": "Delay send", "min": 0, "max": 127},
            {"cc": 120, "name": "All Sound Off", "min": 0, "max": 0}, {"cc": 121, "name": "Reset All Controllers", "min": 0, "max": 0}, {"cc": 123, "name": "All Notes Off", "min": 0, "max": 0}],
        "setup": ["Load Skiff 2.2 (web installer); MENU > MIDI > T1 CHANNEL = the unit's channel (2 or 3), T2..T6 CHANNEL = OFF.",
                  "MENU > MIDI > CLOCK = USB or TRS (where Classic Tabby arrives) so the unit follows clock, Start and Stop; CLOCK OUT = off (Classic Tabby is the master).",
                  "Program numbers count the track's engine's factory presets from 0: set track 1's engine first.",
                  "A PC is applied by the main loop after the message: keep a small gap before the notes (no published figure).",
                  "No H4MIDI filter is needed for a Skiff unit; one is harmless."],
        "notes": ["148 factory sounds over 14 engines (per-engine order in firmware/src/engines.c); no complete published name list, so presets are named in the rig profile.",
                  "Skiff 2.2 (2026-11-03) at research time: adds T CHANNEL OFF and CH n EXT, AUTO CHANNEL, NOTES OUT, CC OUT, THRU, REMOTE (CC 102..115 on its own channel press the panel buttons), CLOCK OUT, Song Position in."],
        "sources": [{"title": "Skiff release 2.2 (2026-11-03): release notes", "url": "https://github.com/illuminus5/skiff/releases/tag/v2.2", "detail": "OFF / EXT, AUTO CHANNEL, CLOCK OUT, REMOTE, Song Position"},
                    {"title": "Skiff README: MENU > MIDI and the MIDI implementation (CC map, clock, program change)", "url": "https://github.com/illuminus5/skiff#readme", "detail": "commit db2ce89, read 2026-11-05"},
                    {"title": "Skiff manual, chapter 19 MIDI (1.3-era text)", "url": "https://illuminus5.github.io/skiff/learn/", "detail": "program change counted from 0, CC table, MIDI LEARN"},
                    {"title": "Skiff source: firmware/src/midi_control.c (midi_event drops unmapped channels), seq.c (midi_slot), ui.c (midi_pc_load), midi_clock.c", "url": "https://github.com/illuminus5/skiff/blob/main/firmware/src/midi_control.c", "detail": "PC per track, no bank select"}],
        "unverified": ["channel.default", "per-engine preset order and names", "PC latency on hardware", "TRS jack type (A or B)", "the 2.2 items the author lists as not yet tried on a unit"],
        "presets": [],
    },
    {
        "id": "mvave-fm1-melodee", "name": "M-VAVE FM-1 (Melodee firmware)", "maker": "M-VAVE (firmware: Melodee by keremimo, GPL-3.0)", "kind": "instrument",
        "firmware": "Melodee 1.6.1 (2026-11-02); no newer tag on 2026-11-05",
        "midiIn": {"connector": "USB class-compliant MIDI in/out, a 3.5 mm TRS MIDI in (input only) and BLE MIDI", "trs": None, "note": "TRS type not stated. In this rig the unit sits on its own H4MIDI WC port (USB host through the hub) with a filter passing only its channel, because Melodee listens on a block of four channels."},
        "clock": {"receives": True, "syncs": "the sequencer: clock, Start, Continue, Stop and Song Position from the chosen input", "setting": "GLO > GLOBAL > CLK = USB or TRS (the port Classic Tabby arrives on)"},
        "channelSetting": "GLO > SYSTEM > ROUT = CH1-4 behind an H4MIDI WC port filter that passes only the unit's channel: channel 2 then plays the unit's track 2 (FM-1 A), channel 3 its track 3 (FM-1 B). There is no per-track input channel.",
        "channel": {"default": None, "note": "GLO > SYSTEM > ROUT = CH1-4 / CH5-8 / CH9-12 / CH13-16 (four consecutive channels on tracks 1..4) or SEL (every channel plays the selected track); DRUM channel OFF / 1..16 (default 10); MIDI-track engines have an output channel only. USB class-compliant, TRS input, BLE MIDI. Wrong Room: behind an H4MIDI channel filter, ROUT = CH1-4."},
        "programChange": {"supported": False, "displayBase": 0, "programs": 0, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Melodee 1.6.1 has no program change handler (0xCn is only forwarded to MIDI-only tracks for output); sounds are selected on the panel. The optional MIDI KNOBS profile turns the PRESETS encoder with CC 18 (GENERAL) or CC 76 (MINILAB), a knob emulation, not a PC. A program event targeted at this device does nothing."},
        "controllers": [
            {"cc": 1, "name": "Mod wheel (selected track)", "min": 0, "max": 127}, {"cc": 5, "name": "Glide", "min": 0, "max": 127}, {"cc": 7, "name": "Track level", "min": 0, "max": 127},
            {"cc": 10, "name": "Pan", "min": 0, "max": 127}, {"cc": 64, "name": "Sustain", "min": 0, "max": 127, "values": {"0": "off", "64": "on"}},
            {"cc": 71, "name": "Engine macro (resonance)", "min": 0, "max": 127}, {"cc": 72, "name": "Release", "min": 0, "max": 127}, {"cc": 73, "name": "Attack", "min": 0, "max": 127},
            {"cc": 74, "name": "Engine macro (brightness / cutoff)", "min": 0, "max": 127}, {"cc": 75, "name": "Decay", "min": 0, "max": 127},
            {"cc": 120, "name": "All Sound Off", "min": 0, "max": 0}, {"cc": 121, "name": "Reset All Controllers", "min": 0, "max": 0}, {"cc": 123, "name": "All Notes Off", "min": 0, "max": 0}],
        "setup": ["Load Melodee (web installer); GLO > SYSTEM > ROUT = CH1-4; the unit's H4MIDI WC port filtered to its channel (2 or 3), so only that channel reaches it and plays its track 2 or 3.",
                  "GLO > GLOBAL > CLK = USB (or TRS) so the unit follows Classic Tabby's clock, Start and Stop; its own clock out is silent then.",
                  "No program change: only CC events reach this device."],
        "notes": ["Melodee 1.6.1 (2026-11-02) at research time; a modified Felucca. FM6 ROM voices: TINE EP, BRASS SECT, SOLID BASS, BELLS, MARIMBA, CLAVINET, DRAWBARS, STRINGS, GLASS PAD, SYNC LEAD, HARP, KALIMBA, FLUTE, STEEL DRUM, SAW BASS, TUBULAR (not selectable by MIDI).",
                  "1.6.1 adds clock out on USB and BLE with CLK = INT (not tried with gear by its author); irrelevant here, Classic Tabby is the master."],
        "sources": [{"title": "Melodee release 1.6.1 (2026-11-02)", "url": "https://github.com/keremimo/melodee/releases/tag/v1.6.1", "detail": "clock and transport, MIDI tracks"},
                    {"title": "Melodee repository README (ROUT, DRUM, clock, USB)", "url": "https://github.com/keremimo/melodee", "detail": "HEAD 165d177, read 2026-11-05"},
                    {"title": "Melodee manual, MIDI section", "url": "https://keremimo.github.io/melodee/webapp/manual/", "detail": "ROUT, DRUM channel, CC list, MIDI KNOBS, MIDI LEARN"},
                    {"title": "Melodee source: firmware/src/midi_control.c (midi_event: no 0xCn handler)", "url": "https://github.com/keremimo/melodee/blob/main/firmware/src/midi_control.c", "detail": "code read, not hardware-verified"}],
        "unverified": ["channel.default", "behaviour on hardware (code read only)", "TRS jack type", "whether a nightly adds program change"],
        "presets": [],
    },
    {
        "id": "mvave-fm1-orange-cat", "name": "M-VAVE FM-1 (Orange Cat firmware)", "maker": "M-VAVE (firmware: Orange Cat, in development)", "kind": "instrument",
        "firmware": "Orange Cat source read at ~/oc-ui 7e7bf40 (2026-11-05); no version string in the sources, no published MIDI document",
        "midiIn": {"connector": "USB class-compliant MIDI (the device enumerates as 'Orange Cat FM-1') and the FM-1's 3.5 mm TRS MIDI in", "trs": None, "note": "TRS type not stated. In this rig the unit sits on its own H4MIDI WC port (USB host through the hub) with a filter passing only its channel, because Orange Cat listens on a block of four channels."},
        "clock": {"receives": "unverified", "syncs": "the sequencer when CLOCK is USB or TRS (settings list INT / USB / TRS; behaviour read from the source only)", "setting": "GLO > CLOCK = USB or TRS"},
        "channelSetting": "GLO > SYSTEM > ROUT = CH1-4 behind an H4MIDI WC port filter that passes only the unit's channel: channel 2 then plays the unit's track 2 (FM-1 A), channel 3 its track 3 (FM-1 B). No per-track input channel exists (a cross-project item for Orange Cat, BUILD.md left-to-build).",
        "channel": {"default": None, "note": "GLO > SYSTEM > ROUT = CH1-4 / SEL / CH5-8 / CH9-12 / CH13-16: a block of four consecutive channels plays tracks 1..4 in order (the DRUM channel, default 10, overrides within the block), SEL makes every channel play the selected track. Read from the source (seq.c midi_track). Wrong Room: behind an H4MIDI channel filter, ROUT = CH1-4."},
        "programChange": {"supported": False, "displayBase": 0, "programs": 0, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "No program change handler in the source (midi_event dispatches notes, bend, CC and channel pressure only). A program event targeted at this device does nothing."},
        "controllers": [
            {"cc": 1, "name": "Mod wheel", "min": 0, "max": 127}, {"cc": 5, "name": "Glide", "min": 0, "max": 127}, {"cc": 7, "name": "Level", "min": 0, "max": 127}, {"cc": 10, "name": "Pan", "min": 0, "max": 127},
            {"cc": 12, "name": "DUB TAPE feedback", "min": 0, "max": 127}, {"cc": 13, "name": "DUB TAPE send", "min": 0, "max": 127}, {"cc": 14, "name": "DUB TAPE tone", "min": 0, "max": 127}, {"cc": 15, "name": "DUB TAPE space", "min": 0, "max": 127},
            {"cc": 16, "name": "DUB TAPE throw", "min": 0, "max": 127}, {"cc": 17, "name": "DUB TAPE cut", "min": 0, "max": 127}, {"cc": 18, "name": "DUB TAPE kick", "min": 0, "max": 127},
            {"cc": 64, "name": "Sustain", "min": 0, "max": 127, "values": {"0": "off", "64": "on"}},
            {"cc": 71, "name": "Engine macro (resonance / morph by engine)", "min": 0, "max": 127}, {"cc": 72, "name": "Release", "min": 0, "max": 127}, {"cc": 73, "name": "Attack", "min": 0, "max": 127},
            {"cc": 74, "name": "Engine macro (cutoff / timbre by engine)", "min": 0, "max": 127}, {"cc": 75, "name": "Decay", "min": 0, "max": 127},
            {"cc": 91, "name": "Reverb send", "min": 0, "max": 127}, {"cc": 93, "name": "Chorus send", "min": 0, "max": 127}, {"cc": 94, "name": "Delay send", "min": 0, "max": 127}, {"cc": 104, "name": "Distortion", "min": 0, "max": 127},
            {"cc": 120, "name": "All Sound Off", "min": 0, "max": 0}, {"cc": 121, "name": "Reset All Controllers", "min": 0, "max": 0}, {"cc": 123, "name": "All Notes Off", "min": 0, "max": 0}],
        "setup": ["Load the Orange Cat firmware; GLO > SYSTEM > ROUT = CH1-4; the unit's H4MIDI WC port filtered to its channel (2 or 3), so only that channel reaches it and plays its track 2 or 3.",
                  "GLO > CLOCK = USB (or TRS) if the unit should follow Classic Tabby's clock (behaviour read from the source only).",
                  "No program change: only CC events reach this device."],
        "notes": ["Facts read from the Orange Cat source (firmware/src/midi_control.c, seq.c midi_track, params.c N_ROUTE / N_CLOCK) at ~/oc-ui 7e7bf40 on 2026-11-05; nothing is copied from it. Not verified on hardware.",
                  "Cross-project item (BUILD.md left-to-build): a per-track input channel with OFF, as Skiff 2.2 has, would let an Orange Cat unit take one channel without a filter."],
        "sources": [{"title": "Orange Cat FM-1 firmware source (local checkout ~/oc-ui, 7e7bf40): firmware/src/midi_control.c, seq.c, params.c", "url": "", "detail": "read 2026-11-05; the project publishes no MIDI implementation document"}],
        "unverified": ["everything on hardware (code read only)", "clock receive", "TRS jack type", "the firmware version string"],
        "presets": [],
    },
    # ---- Task 09: the Wrong Room additions --------------------------------------------------
    {
        "id": "chase-bliss-brothers", "name": "Chase Bliss Audio Brothers", "maker": "Chase Bliss Audio", "kind": "effect",
        "firmware": "no firmware versions or updates published (MIDI manual PDF 2018-04-05, pedal manual 2017-03-11)",
        "midiIn": {"connector": "1/4 inch TRS jack EXT(A)/MIDI: MIDI on the ring, tip floating ('ring active'); no DIN, no USB, no thru", "trs": "ring",
                   "note": "Needs a powered Chase Bliss MIDIbox (DIN in, jumper in RING, TRS patch cable to the jack) or another ring-active TRS MIDI output. A plain TRS type A cable will not drive it. In this rig: Thru5 WC > MIDIbox (RING) > Brothers."},
        "clock": {"receives": False, "syncs": "nothing (a gain pedal: no tempo, no tap, no ramping)", "setting": ""},
        "channelSetting": "Hold both stomp switches while powering up, release, then send any program change on channel 12: the first PC seen sets the channel permanently (default 2). No factory reset exists.",
        "channel": {"default": 2, "note": "Default 2. Learnt from the first program change after a both-switch power-up; any channel 1..16. Wrong Room: 12 (learn it by sending a PC on channel 12, for example SEND SETUP with row 1 holding the Brothers' preset)."},
        "programChange": {"supported": True, "displayBase": 0, "programs": 123, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "PC 0 = live mode (the preset toggle's middle position); PC 1..122 = presets 1..122 (slot 1 = the toggle's right position, slot 2 = left; 3..122 are MIDI-only and empty until saved). Wire value = displayed number. Save: send the PC while holding both stomp switches. No bank select, nothing to enable. PC 123..127: not documented."},
        "controllers": [
            {"cc": 14, "name": "Gain A", "min": 0, "max": 127}, {"cc": 15, "name": "Master", "min": 0, "max": 127}, {"cc": 16, "name": "Gain B", "min": 0, "max": 127},
            {"cc": 17, "name": "Tone A", "min": 0, "max": 127}, {"cc": 18, "name": "Mix / Stack", "min": 0, "max": 127}, {"cc": 19, "name": "Tone B", "min": 0, "max": 127},
            {"cc": 21, "name": "Channel A effect", "min": 1, "max": 3, "values": {"1": "Boost", "2": "Drive", "3": "Fuzz"}},
            {"cc": 22, "name": "Order", "min": 1, "max": 3, "values": {"1": "PARA", "2": "A>>B", "3": "B>>A"}},
            {"cc": 23, "name": "Channel B effect", "min": 1, "max": 3, "values": {"1": "Fuzz", "2": "Drive", "3": "Boost"}},
            {"cc": 100, "name": "Expression", "min": 0, "max": 127, "values": {"0": "pedal up", "127": "fully depressed"}},
            {"cc": 102, "name": "Bypass switch", "min": 0, "max": 127, "values": {"0": "both channels bypassed", "127": "last saved channels engaged"}},
            {"cc": 103, "name": "Bypass states", "min": 0, "max": 127, "values": {"0": "both bypassed", "45": "B on, A bypassed", "85": "A on, B bypassed", "127": "both on"}}],
        "setup": ["Chase Bliss MIDIbox: power it, jumper in RING, DIN from the Thru5 WC, TRS patch cable to the Brothers' EXT(A)/MIDI jack (a plain TRS type A cable from a DIN out does not work).",
                  "Set channel 12: power up holding both stomp switches, release, send a program change on channel 12 (SEND SETUP with the Brothers' preset in row 1 does it).",
                  "Save the presets the song calls: hold both stomp switches and send PC n (1..122).",
                  "PC 0 in a song means live mode (the toggle's middle position), not a preset."],
        "notes": ["Original Brothers (2017, with Resonant Electronic Design). The Brothers AM (2025) is a different pedal with another CC map (14..19 renamed, 27/29 presence, 102/103 as per-channel bypass, 111 preset save, dip switches 61..77).",
                  "CC 102 at 127 restores the last saved channels; CC 103 gives deterministic A / B states.",
                  "No MIDI thru or out; no notes, no SysEx documented; sending clock to it is harmless and useless."],
        "sources": [{"title": "Brothers MIDI manual (MIDI CONFIGURATION, 2018-04-05)", "url": "https://cb2k22.squarespace.com/s/Brothers_MIDI-Manual_Pedal_Chase-Bliss.pdf", "detail": "channel learn, PC 0..122, CC table, MIDIbox"},
                    {"title": "Brothers instructions (2017-03-11): the EXT(A)/MIDI jack, dip switches", "url": "https://cb2k22.squarespace.com/s/Brothers_Manual_Pedal_Chase-Bliss.pdf", "detail": ""},
                    {"title": "Chase Bliss support page: ring-active TRS wiring, no factory reset, MIDIbox needs power", "url": "https://www.chasebliss.com/support", "detail": ""},
                    {"title": "Chase Bliss MIDIbox product page", "url": "https://chasebliss.com/shoputility/p/midibox", "detail": "jumpers ring active for Chase Bliss"},
                    {"title": "Morningstar help and forum (secondary): a ring-active Omniport drives Chase Bliss pedals; tip left floating", "url": "https://help.morningstar.io/en/article/connecting-chase-bliss-devices-to-the-morningstar-omniports-8c8wqd/", "detail": "secondary"}],
        "unverified": ["electrical level of the ring input (no pinout published)", "PC 123..127", "preset change latency", "learn-state timeout", "omni"],
        "presets": [],
    },
    {
        "id": "strymon-nightsky", "name": "Strymon NightSky", "maker": "Strymon", "kind": "effect",
        "firmware": "NightSky firmware 1.07 (March 2021); user manual Rev F (2021-09-17)",
        "midiIn": {"connector": "5-pin DIN MIDI IN and OUT, USB mini; optionally the 1/4 inch EXP jack in MIDI mode (Strymon MIDI EXP cable, tip active with an opto-isolator in the cable)", "trs": None,
                   "note": "Use the DIN MIDI IN from the Thru5 WC: no EXP-jack setting needed. Third-party DIN-to-TRS cables do not work on the EXP jack. Set TRS MIDI Output to OFF when only receiving."},
        "clock": {"receives": True, "syncs": "the sequencer tempo only (no delay or pre-delay sync), enabled per preset", "setting": "Live Edit: hold PRESET BUTTONS 1 and 4, turn SPEED to green (RESPOND TO MIDI CLOCK), or CC 63 = 127; save the preset"},
        "channelSetting": "Power-up mode: hold INFINITE while connecting power, release when the footswitch LEDs light, turn SPEED until the ON LED blinks blue, send a program change on channel 14, press INFINITE to store. One FAQ says the 4..16 option needs a 1/4 inch MIDI connection to set; the manual does not: if the DIN path does not latch it, set it once over the EXP jack.",
        "channel": {"default": 1, "note": "Default 1; 1..16 (1..3 by LED colour, 4..16 by the next program change received while blinking blue). Wrong Room: 14."},
        "programChange": {"supported": True, "displayBase": 0, "programs": 128, "bankFormat": "hundreds", "pad": 0, "programsTotal": 300,
                          "bankSelect": {"scheme": "cc0", "banks": [{"index": 0, "name": "0..127", "msb": 0, "lsb": None}, {"index": 1, "name": "128..255", "msb": 1, "lsb": None}, {"index": 2, "name": "256..299", "msb": 2, "lsb": None}]},
                          "gapMs": 0, "gapAfter": "program",
                          "note": "300 presets shown 0..299: CC 0 (bank select MSB) = preset div 128, PC = preset mod 128. The pedal powers up in bank 0, so send CC 0 before every program change. Bank 0 PC 127 is Manual mode, not a preset (bank 2 holds 256..299 only). The 16 front-panel presets 1..16 are bank 0 PC 0..15. Nothing to enable. CC 32 is not mentioned by Strymon."},
        "controllers": [
            {"cc": 0, "name": "Bank select", "min": 0, "max": 2},
            {"cc": 11, "name": "Mix: reverb level", "min": 0, "max": 127}, {"cc": 12, "name": "Mix: dry level", "min": 0, "max": 127},
            {"cc": 13, "name": "Mod speed", "min": 0, "max": 127}, {"cc": 14, "name": "Mod target", "min": 0, "max": 2, "values": {"0": "verb", "1": "pitch", "2": "filter"}},
            {"cc": 15, "name": "Mod depth", "min": 0, "max": 127}, {"cc": 16, "name": "Mod shape", "min": 0, "max": 5, "values": {"0": "triangle", "1": "square", "2": "ramp", "3": "saw", "4": "random", "5": "envelope"}},
            {"cc": 17, "name": "Decay: pre-delay", "min": 0, "max": 127}, {"cc": 18, "name": "Decay: length", "min": 0, "max": 127},
            {"cc": 19, "name": "Decay: texture", "min": 0, "max": 2, "values": {"0": "sparse", "1": "dense", "2": "diffuse"}}, {"cc": 20, "name": "Decay: size / pitch", "min": 0, "max": 127},
            {"cc": 21, "name": "Decay: quantize", "min": 0, "max": 2, "values": {"0": "smooth", "1": "half step", "2": "scale"}},
            {"cc": 22, "name": "Tone: low cut", "min": 0, "max": 127}, {"cc": 23, "name": "Tone: high cut", "min": 0, "max": 127},
            {"cc": 24, "name": "Tone: filter", "min": 0, "max": 1, "values": {"0": "regen", "1": "lowpass"}}, {"cc": 25, "name": "Tone: lowpass Q", "min": 0, "max": 127},
            {"cc": 26, "name": "Voice: interval", "min": 0, "max": 25, "values": {"0": "-octave", "5": "-P5", "7": "-P4", "12": "-detune", "13": "+detune", "18": "+P4", "20": "+P5", "25": "+octave"}},
            {"cc": 27, "name": "Voice: scale", "min": 0, "max": 7, "values": {"0": "minor pentatonic", "1": "major pentatonic", "2": "major", "3": "dorian", "4": "minor blues", "5": "harmonic minor", "6": "whole tone", "7": "diminished"}},
            {"cc": 28, "name": "Voice: shimmer source", "min": 0, "max": 1, "values": {"0": "input", "1": "regen"}}, {"cc": 29, "name": "Voice: shimmer level", "min": 0, "max": 127},
            {"cc": 30, "name": "Voice: glimmer", "min": 0, "max": 2, "values": {"0": "off", "1": "high", "2": "low"}}, {"cc": 31, "name": "Voice: glimmer gain", "min": 0, "max": 127},
            {"cc": 33, "name": "Voice: drive", "min": 0, "max": 2, "values": {"0": "off", "1": "pre", "2": "post"}}, {"cc": 34, "name": "Voice: drive level", "min": 0, "max": 127},
            {"cc": 35, "name": "Freeze", "min": 0, "max": 127, "values": {"0": "off", "1": "on"}}, {"cc": 36, "name": "Morph", "min": 0, "max": 127, "values": {"0": "off", "1": "on"}}, {"cc": 37, "name": "Morph speed", "min": 0, "max": 127},
            {"cc": 41, "name": "Sequence mode", "min": 0, "max": 127, "values": {"0": "preset", "1": "sequence"}},
            {"cc": 42, "name": "Sequencer step 1 on", "min": 0, "max": 127, "values": {"0": "off", "1": "on"}}, {"cc": 43, "name": "Sequencer step 2 on", "min": 0, "max": 127}, {"cc": 44, "name": "Sequencer step 3 on", "min": 0, "max": 127}, {"cc": 45, "name": "Sequencer step 4 on", "min": 0, "max": 127},
            {"cc": 46, "name": "Sequencer step 5 on", "min": 0, "max": 127}, {"cc": 47, "name": "Sequencer step 6 on", "min": 0, "max": 127}, {"cc": 48, "name": "Sequencer step 7 on", "min": 0, "max": 127}, {"cc": 49, "name": "Sequencer step 8 on", "min": 0, "max": 127},
            {"cc": 50, "name": "Sequencer step 1 size", "min": 0, "max": 127}, {"cc": 51, "name": "Sequencer step 2 size", "min": 0, "max": 127}, {"cc": 52, "name": "Sequencer step 3 size", "min": 0, "max": 127}, {"cc": 53, "name": "Sequencer step 4 size", "min": 0, "max": 127},
            {"cc": 54, "name": "Sequencer step 5 size", "min": 0, "max": 127}, {"cc": 55, "name": "Sequencer step 6 size", "min": 0, "max": 127}, {"cc": 56, "name": "Sequencer step 7 size", "min": 0, "max": 127}, {"cc": 57, "name": "Sequencer step 8 size", "min": 0, "max": 127},
            {"cc": 58, "name": "Sequence glide", "min": 0, "max": 127},
            {"cc": 60, "name": "MIDI expression on/off", "min": 0, "max": 127, "values": {"0": "off", "1": "on"}}, {"cc": 63, "name": "MIDI clock on/off", "min": 0, "max": 127, "values": {"0": "off", "1": "on"}},
            {"cc": 80, "name": "Footswitch ON", "min": 0, "max": 127, "values": {"0": "release", "1": "press"}}, {"cc": 81, "name": "Footswitch FAVORITE", "min": 0, "max": 127, "values": {"0": "release", "1": "press"}},
            {"cc": 82, "name": "Footswitch INFINITE", "min": 0, "max": 127, "values": {"0": "release", "1": "press"}}, {"cc": 83, "name": "Persist", "min": 0, "max": 127, "values": {"0": "off", "1": "on"}},
            {"cc": 93, "name": "Sequence tap", "min": 0, "max": 127}, {"cc": 100, "name": "Expression pedal (MIDI expression on)", "min": 0, "max": 127},
            {"cc": 102, "name": "Bypass / on", "min": 0, "max": 127, "values": {"0": "bypass", "1": "on"}}],
        "setup": ["DIN cable from the Thru5 WC into MIDI IN; leave the EXP jack in its default (expression) mode; TRS MIDI Output = OFF; DIN MIDI Thru at its default.",
                  "Channel 14: hold INFINITE while powering, release when the footswitch LEDs light, turn SPEED until the ON LED blinks blue, send a program change on channel 14 (SEND SETUP works), press INFINITE to store. If the DIN path does not latch it, do it once over the EXP jack in MIDI mode.",
                  "Presets: the song sends CC 0 = bank then PC; the pedal powers up in bank 0. Never call bank 0 PC 127 (Manual mode).",
                  "Clock: for each preset that should sync its sequencer, hold PRESET BUTTONS 1 and 4, turn SPEED to green, and save the preset (or CC 63 = 127 in the song's row events)."],
        "notes": ["Only the sequencer syncs to clock; delay and pre-delay times do not. Start/Stop handling is not documented.",
                  "Firmware 1.07 (March 2021) is current; updated over USB with Strymon Update.",
                  "The TRS MIDI Output default and its knob name differ between the manual and the FAQs; set it to OFF explicitly."],
        "sources": [{"title": "NightSky User Manual Rev F (2021-09-17): rear panel, MIDI channel, presets and banks, CC table, clock, power-up modes", "url": "https://www.strymon.net/manuals/Nightsky_UserManual_RevF.pdf", "detail": "pp. 14-15, 19, 26, 28-31, 36-39, 41"},
                    {"title": "Strymon FAQ: How can I control NightSky with MIDI?", "url": "https://www.strymon.net/faq/how-can-i-control-nightsky-with-midi/", "detail": "DIN, USB, EXP jack, channel 4..16 by the next PC"},
                    {"title": "Strymon FAQ: Save and recall presets (CC 0 banks 0..2, PC 0..127, Manual mode at 127)", "url": "https://www.strymon.net/faq/how-do-you-save-and-recall-presets-on-nightsky/", "detail": ""},
                    {"title": "Strymon FAQ: sync the sequencer to MIDI clock (per preset; only the sequencer)", "url": "https://www.strymon.net/faq/how-to-sync-the-nightsky-sequencer-to-midi-clock/", "detail": ""},
                    {"title": "Strymon firmware release notes (1.07)", "url": "https://www.strymon.net/faq/nightsky-firmware-revision-release-notes/", "detail": ""},
                    {"title": "Strymon staff on the TRS MIDI scheme (tip in, ring out, opto in the cable)", "url": "https://www.strymon.net/midi-control-sunset-riverside/", "detail": "2018-2025 comments"}],
        "unverified": ["USB class compliance", "MIDI Start / Stop handling", "preset load time", "whether the DIN path latches channels 4..16 (FAQ against manual)", "TRS MIDI Output default", "CC 32"],
        "presets": [],
    },
    {
        "id": "tone-king-royalist", "name": "Tone King Royalist Preamp", "maker": "Tone King (Synergy platform)", "kind": "effect",
        "firmware": "manual FINAL 01 19 2026 (uploads of 2026-02 and 2026-11); Synergy Editor App 8.9.6; no firmware version published",
        "midiIn": {"connector": "5-pin DIN MIDI IN only (no out, no thru); USB-C for the Synergy Editor App, firmware updates and USB audio", "trs": None, "note": "Standard DIN cable from the Thru5 WC; last in a chain or on its own Thru5 port."},
        "clock": {"receives": False, "syncs": "nothing (a preamp)", "setting": ""},
        "channelSetting": "Synergy Editor App over USB-C: MIDI CHANNEL = 11 (default OMNI). No panel procedure exists. In OMNI the pedal takes every program change on the chain.",
        "channel": {"default": None, "note": "Default OMNI (all channels); set only in the Synergy Editor App. Wrong Room: 11, set in the editor before the pedal joins the chain. The range is not printed (1..16 plus OMNI presumed)."},
        "programChange": {"supported": True, "displayBase": 0, "programs": 128, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "128 presets; the sibling Imperial manual numbers them 0..127, the Royalist manual says '128 storable MIDI PROGRAM CHANGES' (0- or 1-based display unverified). A preset stores channel, master bypass, IR selection and bypass, loop bypass, reverb bypass and tails. Store from the pedal: select the preset by PC, set the state, long-press REVERB + CHANNEL. No bank select, nothing to enable."},
        "controllers": [
            {"cc": 24, "name": "Select channel (SYN-20IR map, unverified for the Royalist)", "min": 0, "max": 2},
            {"cc": 25, "name": "Select structure (SYN-20IR map, unverified)", "min": 0, "max": 2},
            {"cc": 27, "name": "IR bypass (SYN-20IR map, unverified)", "min": 0, "max": 127, "values": {"0": "off", "1": "toggle", "127": "on"}},
            {"cc": 28, "name": "Select IR (SYN-20IR map, unverified)", "min": 0, "max": 3},
            {"cc": 29, "name": "Lowpass level (SYN-20IR map, unverified)", "min": 0, "max": 2},
            {"cc": 30, "name": "Highpass level (SYN-20IR map, unverified)", "min": 0, "max": 2}],
        "setup": ["Synergy Editor App (USB-C): MIDI CHANNEL = 11; STORE.",
                  "Synergy Editor App: open the MIDI CC LIST tab, read the Royalist's own CC numbers and correct this definition (the numbers here are the SYN-20IR sibling's, unverified).",
                  "Store the presets the song calls: send PC n, set channel / IR / loop / reverb, long-press REVERB + CHANNEL.",
                  "DIN cable from the Thru5 WC into MIDI IN; the pedal has no thru."],
        "notes": ["The Royalist MKIII head and combo have no MIDI; this is the Royalist Preamp pedal (Synergy platform, sibling of the Imperial Preamp and the SYN-20IR).",
                  "The CC list is published only inside the editor's MIDI CC LIST tab; the manual does not print it.",
                  "Firmware updates run automatically from the Synergy Editor App; old editors can no longer connect."],
        "sources": [{"title": "Tone King Royalist Preamp instruction manual (FINAL 01 19 2026): connections, MIDI IN OMNI default, editor MIDI CHANNEL, 128 program changes, MIDI STORE, MIDI CC LIST", "url": "https://www.toneking.com/wp-content/uploads/2026/11/TONE-KING-ROYALIST-PREAMP-INSTRUCTION-MANUAL-BOOKLET-FINAL-01-19-2026.pdf", "detail": "pp. 4, 6, 7, 9, 10"},
                    {"title": "Tone King Royalist Preamp product page (128 presets via MIDI, Synergy Editor App 8.9.6, firmware update notes)", "url": "https://www.toneking.com/shop/pedals/tone-king-royalist-preamp/", "detail": ""},
                    {"title": "Tone King Imperial Preamp manual (sibling, secondary): program changes 0-127", "url": "https://www.toneking.com/wp-content/uploads/2026/11/TONE-KING-IMPERIAL-PREAMP-WEB.pdf", "detail": "secondary"},
                    {"title": "Synergy SYN-20IR manual (same platform, secondary): CC 24, 25, 27, 28, 29, 30", "url": "https://www.synergyamps.com/wp-content/uploads/2025/02/SYNERGY-SYN-20IR-MANUAL-FINAL-2-13-2025.pdf", "detail": "secondary; the Royalist's own list is in the editor"}],
        "unverified": ["every CC number (SYN-20IR sibling map until read from the editor's MIDI CC LIST)", "MIDI channel range and whether 11 is selectable", "0- or 1-based preset display", "preset change latency", "CC acceptance in OMNI", "firmware version"],
        "presets": [],
    },
    {
        "id": "smk37-fm6-internal", "name": "SMK-37 FM6 internal engine", "maker": "M-VAVE SMK-37 Pro running Classic Tabby", "kind": "internal",
        "firmware": "Classic Tabby (this workbench's version)",
        "midiIn": {"connector": "none: the internal engine of the SMK-37 itself, not a MIDI device", "trs": None, "note": "A Tabby track plays the engine when its SEQ setting (SEQ page 6/7 MIDI TRACK, K3) is LOCAL or BOTH. Set the pinned track to LOCAL so nothing leaves on this channel."},
        "clock": {"receives": False, "syncs": "the SMK-37 is the clock master", "setting": ""},
        "channelSetting": "A convention: channel 9 parts land on the pinned Tabby track (track 8 in the Wrong Room profile); on the device, once, SEQ page 6/7: track 8 K3 SEQ = LOCAL.",
        "channel": {"default": 9, "note": "Convention only: no external device listens on it. The importer puts a part on this channel on the pinned Tabby track whatever its file order and writes OUT CH 9; with SEQ = LOCAL on that track nothing is sent."},
        "programChange": {"supported": False, "displayBase": 0, "programs": 0, "bankFormat": "none", "pad": 0,
                          "bankSelect": {"scheme": "none", "banks": []}, "gapMs": 0, "gapAfter": "program",
                          "note": "Row events never reach the internal engine (SPEC 8): the sound of the pinned track is the project's. A program event on this channel does nothing inside and, with SEQ = LOCAL, leaves on no port."},
        "controllers": [],
        "setup": ["On the device, once: SEQ page 6/7 MIDI TRACK, select track 8, K3 SEQ = LOCAL (BOTH would also send the part on channel 9 to every port).",
                  "Give track 8 the sound you want in the project (SHIFT + HOME, SAVE) and save the project.",
                  "In the file, the FM6 part is the track on channel 9; its program changes and CCs are ignored."],
        "notes": ["The engine is per Tabby track, not per channel: any track with SEQ LOCAL or BOTH sounds inside. The channel-9 convention and the track pin make an imported part land on the FM6 without hand work.",
                  "FM6 preview timing is one audio block looser than MIDI out (SPEC 9.6)."],
        "sources": [{"title": "Classic Tabby SPEC.md sections 6, 8 and 9 (song notes follow the SEQ setting; events never reach the internal engine)", "url": "https://github.com/SeattleUser0/classic-tabby/blob/classic-tabby/linux-build/docs/SPEC.md", "detail": "app/midi_router.c groove_midi_song_note"}],
        "unverified": [],
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
        dev = {"schema": "tabby-device/1", "version": "0.2", **{k: v for k, v in d.items() if k != "presets"}}   # v0.2: Task 09
        p = d["presets"]
        dev["presets"] = lists.get(p, read_existing_presets(d["id"])) if isinstance(p, str) else p
        path = os.path.join(OUT, d["id"] + ".json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(dev, f, ensure_ascii=False, indent=1)
            f.write("\n")
        print(path, len(dev["presets"]), "presets")


if __name__ == "__main__":
    main()
