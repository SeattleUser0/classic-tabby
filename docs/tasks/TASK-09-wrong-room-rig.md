Start Task 09. First save this whole message as docs/tasks/TASK-09-wrong-room-rig.md and commit it. Then do Step 1 only (read-only assessment and device research) and stop with the report. No code changes until I approve it. Follow docs/DEV_CHECKS.md.

Classic Tabby, Task 09: The Wrong Room rig: one channel plan for the firmware, the workbench and the MIDI guide
Revision log:
- v0.1 2026-11-05: first draft.
- v0.2 2026-11-05: the delay is a Boss RE-2 Space Echo (the compact pedal), not an RE-202. The
  RE-2 has no MIDI: it is removed from the MIDI plan (no device definition, no channel, no
  program changes, no clock). Channel 13 becomes spare. The guide's rig section lists the RE-2
  as audio only, with its delay time set by hand or tap. (Two corrections from the user during
  Step 1; the text below is the v0.1 wording and still names the RE-202.)

GOAL
An LLM writes a .mid file using the MIDI authoring guide. I import it in the workbench. Every part lands on the right Tabby track with the right output channel, every program change and CC reaches the right device, and I change nothing by hand. The channel plan, the device profiles, the importer and the guide must all come from one source so they never disagree.

CONTEXT
Read docs/SPEC.md (sections 7 to 12), BUILD.md, section 9 of docs/tasks/TASK-03-step1-assessment.md, docs/tasks/TASK-04-step1-assessment.md (the earlier device research), web/devices/*.json, web/rig/*.js, web/import/*.js, and the current MIDI authoring guide. The guide is in the Classic Tabby project as claude/Classic-Tabby-MIDI-Guide.md; I will paste it if you cannot find it. Add it to the repo as docs/MIDI-GUIDE.md as part of this task.

THE RIG (Wrong Room)
Sound sources:
- M-VAVE SMK-37 Pro running Classic Tabby: master controller, sequencer and MIDI clock master.
- SMK-37 internal FM6 engine: internal, not a MIDI device.
- M-VAVE FM-1, two units, called FM-1 A and FM-1 B. Each runs Orange Cat, Skiff or Melodee; each unit's firmware is chosen separately in the rig.
- Dirtywave M8 Model:02: jungle breaks, samples, synth voices.
- Instruo Seashell: analog synth, mostly bass.
- E-MU Proteus/2 XR: multitimbral sound module, shared with my wife. Several Tabby tracks may play different Proteus parts on different channels.
MIDI-controlled effects:
- Zoom MS-70CDR+: program changes over USB MIDI only (no notes, CCs or clock), behind the CME H4MIDI WC's USB host port.
- Chase Bliss Audio Brothers (gain stage): program changes and CCs through its TAP/MIDI jack. Defaults to channel 2.
- Boss RE-202 Space Echo: program changes, CCs, MIDI clock, over 1/8 inch TRS MIDI.
- Strymon NightSky: 300 presets, program changes, CCs, MIDI clock.
- Eventide H90: program changes, CCs, MIDI clock. My wife's; I use one input.
- Tone King Royalist preamp: MIDI preset control, 5-pin DIN. Optional for performances.
Routing:
- CME H4MIDI WC: routing, filtering, USB host. CME MIDI Thru5 WC: DIN splitter. A powered USB hub for USB MIDI devices.

PROPOSED CHANNEL PLAN (my default; verify every device can receive on it and report conflicts)
Classic Tabby sends notes, events and clock on all its MIDI out ports, so channels are global from Tabby's side. Use one unique channel per device and do not rely on channel reuse across physical outputs, except where a device cannot be set to its planned channel.
- 1 Seashell
- 2 FM-1 A
- 3 FM-1 B
- 4 M8 (see the M8 research item below)
- 5, 6, 7, 8 Proteus/2 XR, my parts
- 9 FM6 internal (no external device listens; see the FM6 item below)
- 10 spare
- 11 Royalist
- 12 Brothers (moved from its default 2)
- 13 RE-202
- 14 NightSky
- 15 H90
- 16 Zoom
My wife's Proteus parts must not use channels 5 to 8. Put a note about that in the guide and the rig, not a channel of hers.

FIXED DECISIONS (mine, do not reopen)
- One source of truth: a built-in "Wrong Room" rig profile in the workbench (web/rig/), built from the device JSON files. The guide's channel map, device sections and CC and PC tables are generated from that profile and the device JSON by a tool in tools/, never typed by hand. A test fails when the guide and the profile disagree.
- Device library: add definitions for Chase Bliss Brothers, Boss RE-202, Strymon NightSky and Tone King Royalist in the existing tabby-device/1 format, from manufacturer documents, with sources cited and unverified fields marked, as Task 04 did. Recheck the existing Proteus, H90, Zoom, M8, Seashell and the three FM-1 definitions against the current manufacturer documents and firmware releases.
- Two FM-1 entries in the rig, A and B, each with its own firmware choice (Orange Cat, Skiff, Melodee) and channel.
- The rig profile is selectable in the rig setup panel and stays editable. My edits save as my profile; the built-in one stays as shipped. Existing rig profiles keep working.
- Importer auto-mapping: each part's MIDI channel in the file sets that Tabby track's OUT CH in the song (no more "device setting" default for imported parts). Parts take Tabby tracks 1 to 8 in file order unless the file's track names name a rig device, in which case show that device in the preview. Warn when a part's channel is not in the active rig, when notes go to an effects-only channel, when a program number is outside a device's range, and when a CC is not one the device definition names.
- Program and CC numbering: the file always carries MIDI wire values (program 0 to 127, bank select as CC 0 and CC 32). The guide and the workbench show each device's own display numbering beside the wire value. For devices with more than 128 presets (NightSky has 300, Proteus 384), document and implement the bank select each one needs.
- Clock: Classic Tabby stays the master. The guide says which devices sync delay times to MIDI clock (verify: RE-202, NightSky, H90; Zoom does not) and which settings on each device turn clock receive on.
- Track launching (Task 06): a track's row events are the events on its OUT CH. Effects pedal events fire only on scene changes. The guide explains how to lay out a file so this works: pedal events in a notes-free track on the pedal's channel, instrument presets on the instrument's channel at row starts.
- The workbench offers the current guide as a download from the Import MIDI panel, so the guide always matches the installed firmware and workbench.

STEP 1. Read-only assessment and device research. STOP AND REPORT.
- For each device: how it receives MIDI (DIN, TRS type A or B, USB device, the Brothers' TAP/MIDI jack and what interface it needs), whether it can be set to the planned channel and how, program numbering and bank scheme, preset count, the CCs worth naming with ranges, clock receive, anything odd (responds on all channels, needs a setting to receive PC, slow preset changes and the gap it needs). Cite sources. List what you could not verify.
- M8: how the M8 maps incoming MIDI channels to its tracks and instruments, and the cleanest way to drive several M8 tracks from Classic Tabby. Propose whether the M8 needs one channel or a block of channels, and the plan change that follows.
- FM6: how a Tabby track plays the internal FM6 today (LOCAL / BOTH / MIDI, input channels), and the cleanest way for an imported part to land on FM6 automatically. Propose whether channel 9 should mean "FM6" in the importer, and what that costs.
- Proteus/2 XR: how its multitimbral parts map to channels, how to set parts 5 to 8 from the front panel, and its program map for presets above 127.
- Check the full plan for conflicts: any device that cannot use its channel, any device that listens on all channels (like the Zoom), and whether the H4MIDI WC must filter anything besides the Zoom. Propose the H4MIDI WC routing and filter settings for the plan.
- Firmware: whether anything in the firmware needs to change for this task (the design says device knowledge lives in the workbench only). Report the flash cost of any change against the current margin (2525 bytes; the floor stays at 2 KB).
- Propose the generated guide's layout: which sections are generated, which stay hand-written, and the generator tool and its test.

STEP 2. Implement after I approve.
- New and rechecked device definitions, the Wrong Room rig profile, rig panel selection.
- Importer auto-mapping and the new warnings.
- The guide generator, docs/MIDI-GUIDE.md generated from it, the consistency test, and the download link in the import panel.
- Any approved firmware change.

STEP 3. Tests.
- Device schema and numbering tests for every new definition, including NightSky and Proteus bank select for presets above 128.
- Importer: a fixture .mid written per the generated guide with all instruments and pedals imports with every OUT CH set from the file, every event on the right channel, zero warnings; a fixture with a wrong channel, a note on a pedal channel, an out-of-range program and an unnamed CC produces each warning once.
- Guide consistency test fails if the guide and the profile disagree.
- Simulator check: the all-devices fixture plays, and MIDI out shows each part on its planned channel and each row's events before its notes.

STEP 4. Hardware checklist for me.
- The device settings to make on each unit (channels, clock receive, PC receive, Proteus part channels, H4MIDI WC routing), as one list. Then import the all-devices fixture, SEND SETUP, play it, and confirm on each device.

RULES
- Stop and ask before any change to data layouts that affects existing projects or songs.
- Never write factory calibration or any region outside USER.
- Update SPEC.md, BUILD.md and FLASH-BUDGET.md at each checkpoint.
- Comment heavily. Top of every new file: purpose, version, revision log. Note revision changes inline by version.
- Commit at each checkpoint with clear messages. Do not push.

FINAL REPORT
What was built, the final channel plan with every change from my proposal and why, the device definitions with what is verified and what is not, test results, the generated guide, and the hardware checklist.
