Classic Tabby, Task 04: Row events (program change, bank select, CC) and device library
Revision log:
- v0.1 2026-11-02: first draft.

CONTEXT
Classic Tabby (~/Documents/Classic Tabby/firmware, branch classic-tabby/linux-build) has song mode (Task 03) and MIDI import (Task 02). Read PROJECT-BRIEF.md, docs/SPEC.md, docs/BUILD.md, docs/FLASH-BUDGET.md and section 9 of docs/tasks/TASK-03-step1-assessment.md first. Songs send polyphonic notes but no program changes or CCs. I need songs to switch synth presets and effects pedal programs, and set CCs, at row changes. The browser workbench should know my gear so I pick presets by name.

MY RIG (edit as needed; each entry needs its MIDI channel confirmed in the workbench rig setup)
- Instruo Seashell (bass synth)
- Korg volca fm2
- E-MU Proteus/2 XR (multitimbral sound module)
- Eventide H90 Harmonizer (effects pedal, receive channel 15)
- Zoom MS-70CDR+ (effects pedal over USB, channel 16, filtered by a CME H4MIDI WC)
- Dirtywave M8 Model:02
- Waldorf Pulse 2
- Waldorf Blofeld
- M-VAVE FM-1

FIXED DECISIONS (mine, do not reopen)
- Events fire at row start, before that row's first notes, on all MIDI out ports. A queued jump fires the target row's events at the jump. Events target a MIDI channel 1 to 16, not a track.
- Event types: program change, program change with bank select (CC 0 and/or CC 32, sent before the PC), and CC. Note the order and any delay some devices need between bank select and PC; make the delay a per-device setting in the workbench, sent as a gap in the event stream if the firmware can do it cheaply, otherwise report the limit.
- Storage: in the unused tail of the song sector. Extend section 9 with a versioned layout (row index, channel, type, data bytes), extend the CRC to cover it, and keep old songs without events valid.
- A "SEND SETUP" action on the SONG page sends row 1's events immediately, for use before a set or after power-up.
- The device library lives only in the workbench. No device knowledge in firmware.
- Device definitions are JSON files under web/devices/, one per device: name, maker, default channel, program numbering (0-based or 1-based as the device displays it), bank select scheme, program count, named presets where known, named CCs with ranges and value meanings, and inter-message delay needs. Every definition lists the sources it was built from (manufacturer MIDI implementation chart, manual page, URL). Mark any field you could not verify as unverified. Do not guess.
- Rig setup in the workbench: which device is on which channel, saved as a global rig profile, with an optional per-song override. The row event editor shows device and preset names from the library; raw numbers stay available for anything not in a definition.
- Importer: PC, bank select and CC events in a .mid that land at or near a row start become row events (report how near counts). Others are listed in the warnings as dropped.
- Not in this task: CC automation inside a row, SysEx, and patch dumps.

STEP 1. Read-only assessment, plus device research. STOP AND REPORT.
- Free bytes in the song sector and the event capacity per song under your proposed layout.
- Where events fire in song.c and the router, how they interleave with notes at a row boundary, and whether a per-device gap is possible without blocking the audio thread.
- Estimated flash cost. Current margin after checkpoint (f) is the baseline. I want at least 2 KB left after this task. If that will not happen, list removal candidates with sizes.
- For each device in MY RIG: find its MIDI implementation from the manufacturer (chart or manual), and report program numbering, bank scheme, program count, preset names available or not, the CCs worth naming, timing needs, and anything odd (for example a device that responds on all channels, or needs a setting changed to receive PC). Cite sources. List what you could not verify.
- Propose the event editor UI for the row list and the rig setup page.

STEP 2. Implement after I approve.
- Firmware: event storage, firing at row start and on jumps, SEND SETUP, validation.
- Workbench: device library loader, the device JSON files, rig setup, row event editor, .tabby export and import including events.
- Importer: PC, bank and CC to row events.

STEP 3. Tests.
- Host tests: events fire once at row start before notes; jump fires target row's events; bank select precedes PC; per-device gap (if built); events on the right channels; old songs without events still load; storage round trip; corrupted event table rejected.
- Workbench tests: every device JSON validates against a schema; preset names map to the right numbers including 0-based versus 1-based display.
- Importer tests: a fixture .mid with PC and CC at row starts and mid-row.
- Simulator check: a 3-row song with a PC and a CC on each row; MIDI out shows them in order before each row's notes.

STEP 4. Hardware checklist for me.
- SEND SETUP changes every device to its row-1 preset. Each row change switches the Proteus/2 part, the H90 program and the Zoom patch at the bar line. Confirm the Zoom only reacts on channel 16. Confirm nothing glitches or drops notes at the change.

RULES
- Stop and ask before any change to app/ data layouts that affects existing projects or songs.
- Never write factory calibration or any region outside USER.
- Update SPEC.md, BUILD.md, FLASH-BUDGET.md and section 9 at each checkpoint.
- Comment heavily. Top of every new file: purpose, version, revision log. Note revision changes inline by version.
- Commit at each checkpoint with clear messages. Do not push.

FINAL REPORT
What was built, the event layout, flash cost and margin, the device definitions with what is verified and what is not, test results, and the hardware checklist.
