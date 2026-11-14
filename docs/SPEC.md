# Classic Tabby — Specification

Version: 0.40
Revision log:
- v0.40, 2026-11-14 (Task 17 Goal 2): 19.6 tabby-v04.5 (v3 clips, rows to 128 steps, transfer kind 9); 17.11 note lines
  are tracked in tools/linux/builds-notes.json.
- v0.39, 2026-11-14 (Task 17): 19.5 tabby-v04.4 (F + G; 19.4 withdrawn).
- v0.38, 2026-11-12 (Task 16, day 2): 17.11 pushed tags and builds/ pages are never moved or deleted; 19.4 tabby-v04.3.1
  (the USB pusher, the flash guard; tabby-v04.3 marked faulty).
- v0.37, 2026-11-12 (Task 16 Goal 3): 19.3 external clock follow in song mode (decision 10).
- v0.36, 2026-11-11 (Task 16 Goal 1): 17.10 the standing testing rule; section 19: the overnight hard limits,
  A2 on by default, F + G not now, command 29 (remote control).
- v0.35, 2026-11-11 (tabby-v04.2 merge): Task 14 and v04.1.1 entries below (v0.30-v0.33 of the guide line) are
  this file's 17.5-17.9; the Task 15 entries are 18.x.
- v0.34, 2026-11-11 (Task 15 Step 5): 18.2: the soak, the transfer and the save.
- v0.33, 2026-11-11 (Task 15 Step 5): 18.2: option A2 measured (one line 3.67 ms on DIN).
- v0.32, 2026-11-10 (Task 15 Step 4): 18.1: option A2 in the diag build (the switch, the request rule,
  the counters, the stop rule); 17.3 marked superseded.
- v0.31, 2026-11-10 (Task 15 Step 3): section 18: the recommended next step.
- v0.30, 2026-11-10 (Task 15 Step 2): section 18: the timing research; 17.3's finding is superseded
  (the rule stays until a diag build is measured).
- v0.33, 2026-11-10 (tabby-v04.1.1): 17.8 ACTIONS opens with SEQ + EDIT only (holding SEQ does nothing); HOME / SRC,
  not the left HOME, is the source-page button; 17.9 the testing guide and the v04.1.1 release rule.
- v0.32, 2026-11-10 (Task 14, English only): 17.7, the workbench and the docs are English only; 17.5 no longer
  speaks of two languages.
- v0.31, 2026-11-10 (Task 14, second pass): 16.1 what a factory V16 restore overwrites in the v04 layout;
  17.6 the TRS jack is output only (CLK IN DIN receives nothing).
- v0.30, 2026-11-10 (Task 14): 17.5, the Help and panel text is held to the removed-features list
  (banned phrases and a test); K1-K4 on HOME; the song block limits re-checked.
- v0.29, 2026-11-10 (Task 13 Step 4): 17.4, the control-name table (firmware name -> printed name or
  position), the start of the sticker map.
- v0.28, 2026-11-10 (Task 13 Step 2): 17.3: option A is not built (the song tick runs in the audio
  interrupt; the SDK's pass request is not interrupt-safe).
- v0.27, 2026-11-10 (Task 13 Step 1): section 17.1: the control-pass budget (option B), CPU GUARD
  described (17.2).
- v0.26, 2026-11-09 (Task 12, install incident): 16.5 items 4 and 5: the all-zero loader tag resumes
  after the model confirmation; a query timeout never leads to force flash.
- v0.25, 2026-11-08 (Task 12 A5): section 16.5: permanent build pages, builds/index.json, and the
  rule for a loader that waits for another build.
- v0.24, 2026-11-08 (Task 12 A4): section 16.4: the counters and the loop profile in every build.
- v0.23, 2026-11-08 (Task 12 A3): section 16.3: no flash write while the transport runs.
- v0.22, 2026-11-08 (Task 12 A2): section 16.2: the step editor removed; SYNC / MIDI and MIDI TRACK;
  where every remaining setting lives (one place each).
- v0.21, 2026-11-08 (Task 12 A1): section 16: the storage move is the normal layout (USER 471040),
  OLD DATA on first boot, commands 27 and 28.
- v0.20, 2026-11-08 (Task 11C): section 15: device rules after the loader incident (no unattended
  installs or device writes; no flashing from the NUC until its USB problem is understood).
- v0.19.1, 2026-11-07 (Task 11 Steps 2-4): section 14.4: the backup, the diagnostic build and the
  probe as built.
- v0.19, 2026-11-07 (Task 11 Step 1): section 14: the Task 10 decisions recorded, the event cap
  rule (768 events per clip, CC thinning) and the MIDI-out timing rule.
- v0.18.3, 2026-11-05 (Task 09 checkpoint d): section 13: the simulator check; Task 09 complete pending the hardware checklist.
- v0.18.2, 2026-11-05 (Task 09 checkpoint c): section 13: the generated guide.
- v0.18.1, 2026-11-05 (Task 09 checkpoint b): section 13: the importer maps by the rig.
- v0.18, 2026-11-05 (Task 09 checkpoint a): section 13: the Wrong Room rig.
- v0.17, 2026-11-04 (Task 08, manual): section 12: the manual tab.
- v0.16, 2026-11-04 (Task 08): section 11: the display version.
- v0.15, 2026-11-04: section 10: Task 06 checkpoint (d) done (workbench: lead before the bar,
  pattern view, per-track status; the scripted performance check); Task 06 complete pending
  the hardware checklist.
- v0.14.2, 2026-11-04: section 10: Task 06 checkpoint (c) done (TRACK LAUNCH page, pad
  colours, SCL / ENV routing).
- v0.14.1, 2026-11-04: section 10: Task 06 checkpoint (b) done (per-track playheads in
  firmware, section 9.13).
- v0.14, 2026-11-04: section 10 added: Task 06 independent track launching; checkpoint (a)
  done (BLE and NAME pages removed, Bluetooth settings moved to the workbench through
  transfer command 24).
- v0.13, 2026-11-04: section 9 added: Task 05 timed notes (exact start offsets and lengths):
  the timed note module, block payload format v2, the sequencer's unit clock and window
  scheduling, per-block swing, the importer's exact conversion with quantize as an option,
  the editor's offset and length controls, old-format songs; section 7 importer rules
  point to it.
- v0.12, 2026-11-02: section 8: Task 04 workbench part done (device library, rig setup, row
  event editor, .tabby events and trailer, importer conversion, simulator check); section 7
  importer rules extended with row events.
- v0.11, 2026-11-02: section 8 added: Task 04 row events and device library; firmware part
  done (event storage, firing, SEND SETUP), workbench part pending.
- v0.10, 2026-11-02: section 6: checkpoint (f) done (factory scenes out, delete-before-replace
  in the shared song write, tempo range enforced, liveness by reference); section 7 updated
  to the shared write path; known limits updated.
- v0.9, 2026-11-02: section 7 added: Task 02 MIDI import (scope, workbench write path,
  mapping rules, layout, differences found at the Step 4 rebase, known limits), folded from
  docs/tasks/TASK-02-notes.md.
- v0.8, 2026-11-02: section 6: checkpoint (e) done (batched block upload, transfer kind 7,
  assessment v0.5), upload order record-first, flash margin below the 4 KB target noted,
  known limits updated; hardware checklist for the first flash in BUILD.md section 13.4.
- v0.7, 2026-11-02: section 6: checkpoint (d) done (song mode in firmware and workbench),
  format v0.4 (16-bit block ids) recorded, known limits listed.
- v0.6, 2026-11-02: section 6: checkpoint (b) done (DX7 operator editor and tone editor
  out); the two format additions of assessment v0.3 (row step length, per-track song
  output channels) recorded.
- v0.5, 2026-11-02: section 6 added: Task 03 (song mode) decisions and checkpoint status;
  checkpoint (a) done (sampler and DX7 user library removed, migration prompt).
- v0.4, 2026-11-02: section 5 added: Task 02 (publication to GitHub, GitHub Pages and a
  GitHub release) with its acceptance criteria. No firmware change.
- v0.3, 2026-11-01: acceptance criteria 2, 5 and 8 updated to the plan change approved
  after Checkpoint A: Track A and Track B are byte-identical, so Track B (native Linux
  toolchain) is the default `make firmware` target and Track A stays available as
  `make firmware-ref` (output in build/ref/) with `make crosscheck` comparing both.
- v0.2, 2026-11-01: design decision recorded (section 1.1): external-synth orchestrator;
  only the DX7 engine stays playable, from a LIVE track; on-device DX7 preset select plus
  macro controls, voice editing moves to the workbench / SysEx import; factory DX7 bank kept
  for now; removal candidates listed; USER region unchanged in Phase 1.
- v0.1, 2026-11-01: created from PROJECT-BRIEF.md during Task 01 (Linux build environment).
  Scope, priorities and acceptance criteria copied from the brief. No functional firmware
  changes are specified yet; Task 01 covers the build environment only.

Classic Tabby is a performance-oriented fork of M-VAVE's SMK37 Open V01 firmware for the
M-VAVE SMK-37 Pro. It is a dedicated MIDI scene controller, live keyboard and performance
orchestrator for Wrong Room. It is a separate project from Orange Cat (FM-1 groovebox).

## 1. Scope

- Fork the official, unmodified SMK37 Open V01 firmware (upstream commit b2d6bcb, tagged
  `upstream-v01` in this repository).
- Reuse existing SMK37 Open capabilities. Avoid synthesis-engine development.
- The Dirtywave M8 Model 2 performs sequencing and arrangement. Classic Tabby performs scene
  selection, live playing, MIDI routing and performance controls.
- Audio stays separate from MIDI control. Synthesizers feed the mixer through their own
  effects chains.
- Keep the firmware modular; keep the performance interface simple and fast; minimize
  dependence on computers on stage; support computer-based preparation and configuration.
- Preserve the SMK-37's factory calibration and protected flash regions at all times.

### 1.1 Design decision (2026-11-01): internal engines and on-device editing

- Classic Tabby is primarily an orchestrator for external synthesizers. The internal
  engines are not needed, **except the DX7 (6-operator FM) engine, which must stay
  playable**.
- The DX7 is played from a **LIVE track** (upstream track role `GROOVE_TRACK_PLAY`, shown
  as "LIVE"), so it keeps sounding across scene and project changes.
- On device: **DX7 preset select plus a few macro controls** (level, brightness, attack,
  release or similar). Full voice editing moves to the workbench and to DX7 SysEx import.
  The on-device operator editor pages (FM_EDIT / FM_ENV / FM_LFO) can go.
- **Keep the factory DX7 bank for now.** It is the first candidate to cut if space runs
  short.
- Candidates for removal: the sequencer editing pages, the tone/editor pages for the other
  five engines, and most effects pages. **Keep the sampler glue for now**; the internal
  drum machine is still an open question.
- **No change to the USER region in Phase 1.**

The flash consequences of this decision are estimated in docs/FLASH-BUDGET.md section 4.

### Phase 1 — Minimum viable performance firmware

- Sixteen pads configurable as scene selectors.
- MIDI note transmission to cue M8 song rows.
- Per-song controller configurations.
- Keyboard routing to selectable external MIDI channels.
- Assignable faders, encoders and pads.
- MIDI CC and Program Change transmission.
- Scene names and status displayed on the SMK-37.
- Reliable save/load functionality.

### Phase 2 — Performance enhancements

- Named setlists and songs.
- Scene banks exceeding sixteen scenes.
- Configurable Bank Select / Program Change / CC messages on scene changes.
- Per-song MIDI destination profiles.
- Optional internal sampled drum machine.
- MIDI clock synchronization and transport controls.
- Foot-controller assignments.
- Quantized scene transitions where necessary.

### Phase 3 — Web configurator

Extend M-VAVE's browser workbench into one configuration interface for the whole
performance: create/select song, define MIDI devices, assign channels, define scenes and M8
song rows, configure presets and effects, assign controls, save, and transfer to the SMK-37.

## 2. Development priorities

1. Reproducible Linux compilation of official SMK37 Open. (Task 01, this document's v0.1.)
2. Verify SMK-37 → M8 MIDI scene cueing using existing firmware.
3. Implement a dedicated scene-selector interface.
4. Add configurable MIDI routing and per-song controller mappings.
5. Develop the browser-based configuration workflow.
6. Add optional sampled drums and expanded orchestration features.

Each phase has explicit acceptance tests before the next begins. Functional modifications do
not begin until the Linux build is reproducible and hardware operation is verified.

## 3. Acceptance criteria for Priority 1 (Task 01)

Task 01 changes no firmware behaviour. It is complete when all of the following hold:

1. The official, unmodified source builds on Ubuntu Linux from a documented clean-install
   procedure (docs/BUILD.md), with every SDK manifest hash check and every synth.json check
   still enforced.
2. Track A (reference): the exact JieLi Windows 2.5.3 toolchain, run under Wine, produces
   `sdk.elf`, `sdk.map`, `firmware-report.json`, `package-report.json`,
   `build-identity.json` and `generated/SMK37_PRO_OPEN.fwsc` (in `build/ref/pro/` since
   v0.3; `build/pro/` holds the default Track B build), and every Test-Firmware check
   passes.
3. The Track A build identity (`build_id`) equals the official V01 release's build identity
   embedded in the hosted workbench, and the package SHA-256 / byte size either match or the
   difference is explained.
4. Two builds in two different directories produce identical output (determinism), or the
   source of nondeterminism is identified.
5. Track B (native Linux JieLi toolchain): the same source builds with a separate pinned
   toolchain manifest (tools/linux/toolchain-linux.json). Every Test-Firmware check passes,
   SRAM placement rules hold, and code size is in the same range as Track A. (v0.3: the two
   tracks produce byte-identical `sdk.elf` and `.fwsc`; Track B is the default build and
   Track A the reference that `make crosscheck` compares against.)
6. The web workbench local preview builds with the Linux WASI SDK 27 (pinned SHA-256) and
   loads in Chrome with the simulator running.
7. A native host test target compiles the app code with FM1_HOST_TEST and passes smoke
   tests (builds, simulator initializes, keyboard note produces the expected MIDI output on
   the expected channel).
8. A top-level Makefile provides: verify, firmware (= firmware-native, Track B),
   firmware-ref (Track A), crosscheck, web, test, clean.
9. Hardware readiness is reported read-only (lsusb, amidi -l, aconnect -l, firmware version
   if visible). Nothing is flashed and no device data is written in Task 01.
10. A flash/RAM baseline is recorded: app image bytes against the 0xff000 flash limit, the
    536576-byte user region, VM size, runtime heap against the 49152-byte minimum, and
    internal SRAM (0x01c00000–0x01c80000) used/remaining.

## 4. Open items carried from the brief (not part of Task 01)

- MIDI routing / merging between SMK-37 live MIDI and M8 sequenced MIDI.
- Clock architecture (SMK-37 has no physical MIDI input).
- M8 note-to-song-row mapping and cue behaviour.
- Transitions between separate M8 projects.
- Memory headroom before UI expansion (baseline from Task 01 feeds this).
- External effects MIDI capabilities and device definitions.
- Reuse of the M-VAVE web communication and project-transfer protocol.
- Hardware reliability tests (stuck notes, rapid scene changes, clock sync, interrupted
  transfers).

## 5. Task 02 — publication (acceptance criteria)

Task 02 publishes the unmodified Task 01 build so the firmware can be installed from
Chrome. It changes no firmware behaviour. It is complete when:

1. The repository is public at github.com/SeattleUser0/classic-tabby with the
   `classic-tabby/linux-build` branch and the `upstream-v01` tag pushed; `upstream` still
   points at m-vave/smk37_open. No file from toolchains/, official-release/ or build/ and no
   key or token is in the history.
2. `make package` ports `build.bat pro --package`: `build/official-web/pro/
   SMK37-Open-Source.html` with the firmware and the pinned stock V16 image embedded, and
   its source link is the GitHub archive of a tag placed on the exact commit that was built.
3. `make hosted` / `make publish` run tools/Build-Hosted.cjs and publish the static site to
   GitHub Pages from the gh-pages branch; nothing is built in CI. The page opens at
   https://seattleuser0.github.io/classic-tabby/, identifies the SMK-37 Pro, and its source
   link downloads the tagged archive.
4. A GitHub release for the tag carries SMK37_PRO_OPEN.fwsc, the offline
   SMK37-Open-Source.html and SHA256SUMS.txt, with notes stating the build ID, the
   build-identity-only difference from the official V01, and that the build is not
   hardware-validated.
5. `make publish` repeats package, hosted and the gh-pages update for future versions, and
   docs/BUILD.md section 9 documents it. Nothing is flashed or sent to any device.

## 6. Task 03 — song mode (chained sequences)

Task text: docs/tasks/TASK-03-song-mode.md. Assessment and the **final** block, row and song
formats: docs/tasks/TASK-03-step1-assessment.md (section 9 is binding for the MIDI
importer built in another session).

Fixed decisions (v0.2/v0.3 of the task): the sampler and the DX7 user library are removed;
their flash region (USER 69632..532480, 113 sectors) becomes song storage; the FM6 (DX7)
engine, the factory DX7 bank and voices inside projects stay; FM6 previews sequences
through the per-track SEQ setting; step resolution stays 16ths; song blocks use the
4-notes-per-step format; Classic Tabby's own app-side sequencer plays song blocks; the
stock project sequencer keeps working for normal projects.

Checkpoints and status:

- **(a) done, 2026-11-02:** sampler and DX7 user library removed from app/, transfer
  protocol (commands 11-16, kind 4; capability reply reports 0 banks and sample limit 0),
  screen, controls, factory scenes (sampler beats play on the 808) and the workbench
  (sample section, library section and simulator library controls removed; capability
  check accepts the new reply). First-boot migration: the song region is scanned, old
  V01 sample/DX7 data is reported on screen and erased only after the user confirms
  "ERASE OLD SAMPLE/DX7" on the ACTIONS page. Projects with sampler tracks load on the
  808. App image 450820 bytes, margin 3101 bytes. Host tests cover the migration and the
  conversion (tests/host/smoke.c v0.2).
- **(b) done, 2026-11-02:** DX7 operator editor pages (FM_EDIT / FM_ENV / FM_LFO) and the
  tone editor (TONE_EDIT) removed from app/screen.c and from the workbench simulator's
  shortcuts; on-device DX7 preset select and the ALGORITHM / FEEDBACK / TRANSPOSE / LEVEL
  macros (FM_QUICK) stay; EDIT on other sources, SCL, ENV and LFO announce that voice
  editing moved to the workbench. App image 439812 bytes, margin 14109 bytes. No data
  layout changed.
- (c) skipped by decision after (b): its measurement is the (b) report (margin 14109).
- **(d) done, 2026-11-02:** song storage (app/song_storage.c: records, block sectors,
  staging transactions with power-cut recovery, per-song directory, compaction, status),
  the app-side song sequencer (app/song.c: rows decoded one ahead on the control task,
  audio-thread step tick from the per-block clock hook, swing, probability, legato /
  retrigger, note lengths across rows, queued jumps at the next bar or row end, loop
  rows, end-of-song stop), the router's song owner and per-track output-channel
  override (app/midi_router.c), transfer kinds 5 and 6 and command 23 (app/transfer.c),
  the SONG page (page 19, ACTIONS "SONG MODE", pads queue row jumps, PLAY starts and
  stops, "COMPACT SONG STORAGE" action) and the workbench song editor (library tab:
  read / write / delete / .tabby export and import / storage status, device or browser
  simulator as target) with the factory-V16 warning. App image 449572 bytes, margin
  4349 bytes. Host tests cover storage, rewrite, compaction, playback timing, the
  channel override and queued jumps (tests/host/smoke.c v0.3).
- **(e) done, 2026-11-02:** batched block upload. Transfer kind 7 stores a stream of block
  records in whole block sectors: one erase per sector, header byte 5 = 0xFF while
  pending, one journal (`FM1Q` in the staging sector) and one commit word for the whole
  batch, byte-5 writes to finalize; recovery at boot and before every write finishes a
  committed batch or erases an uncommitted one (assessment 9.6 v0.5). Kind 6 keeps
  working. The workbench writes the song record first, then the blocks in batches cut at
  the device's packing boundaries (8 sectors, at most 32608 bytes each), then verifies the
  record; the browser simulator target does the same. Compacting a sector without live
  records is a plain erase. App image 450980 bytes, **margin 2941 bytes: below the 4 KB
  target of decision 1 by 1155 bytes**; candidates in FLASH-BUDGET.md section 8.1, the
  choice is open. Host tests cover packing, superseding, rejected streams, both power-cut
  recoveries and playback from batch blocks (tests/host/smoke.c v0.4, 109 checks).
- **(f) done, 2026-11-02:** the sixteen factory scenes and everything that only served
  them are out (app/presets.c keeps the 808 default kit; HOME lists USER projects only;
  the workbench simulator's factory picker and export are gone, prev / next step through
  the USER slots). The scenes survive as project files in web/scenes/ (exported from the
  checkpoint (e) build, importable like any backup). Delete-before-replace moved into the
  workbench's shared song write (Library.songWrite and the simulator target): the song
  editor and the MIDI importer both delete an occupied slot first and warn beforehand,
  suggesting a `.tabby` export. The device rejects a song record whose tempo override is
  outside 30..300 (0 = project tempo), the workbench parser and the importer decoder too.
  Liveness is now by reference (assessment 9.4 v0.5.1): a block no row uses is garbage for
  compaction, so a replaced song never leaks pool space. A latent (a) bug fixed on the
  way: a V01 project with a sampler track failed validation after its conversion to the
  808 kit (the sampler-pad count stayed 8). App image 447588 bytes, **margin 6333 bytes**,
  the 4 KB target met again. Host tests: 112 checks (section 9: tempo range, replace via
  delete, compaction back to one copy); workbench test (tests/workbench/song-write.mjs)
  for the shared write path.

Formats: section 9 of the assessment, **v0.5** (96c9058): v0.4 (2d4ef83: 16-bit block ids,
20-byte rows at offset 64, song body CRC over bytes 20..2623, 6-byte block record headers,
2048 live blocks per song, transfer kind 6 target = (song << 16) | id) plus the batch
upload (kind 7, the `FM1Q` batch journal, block-sector byte 5 = 0xFF pending, capability
bit 3, record-first upload order). The block, row, song record and `.tabby` layouts are
unchanged since v0.4; the importer needs no change.

Format additions approved after checkpoint (a) (assessment v0.3, section 9): each row has
a step length of 16, 32, 48 or 64 steps (default 64; a shorter row plays the first N steps
of its blocks and advances, notes past the row end follow the block-end release rules);
the song header carries eight per-track output channels (1..16, or 0 = device OUT CH) that
override the device setting while the song plays and are withdrawn when playback leaves
the song, hanging notes being released on the old channel first.

Known limits (v1):

- Decision 4: song mode runs from the internal clock only; PLAY on the SONG page refuses
  to start in MIDI clock mode ("SONG NEEDS INTERNAL CLOCK").
- The alt-tuning bit of a step (9.3, bit 6) is stored and transferred but not applied by
  the device sequencer (tuning hold is a control-task call; MIDI out has no tuning).
- Uploads still pause audio briefly: the flash API silences audio on every erase and
  write (sdk/include/fm1.h). A batch of N sectors costs N + 2 erases and about as many
  programs instead of 3 erases and 3 programs per block, so the pauses are fewer and
  clustered at the end of each batch; the chunk phase touches no flash. Uploads are not
  a performance-time operation. Estimated times: BUILD.md section 13.3.
- A block no row of its song references is garbage (9.4 v0.5.1) but keeps its bytes until
  the next compaction ("COMPACT SONG STORAGE", or the compaction a full pool triggers), so
  "free" in the status reply rises only after that.
- The device does not check the 2048-live-blocks-per-song limit at upload time; a song
  over it loads with "TOO MANY BLOCKS" and never plays partially.
- Note editing is in the workbench only (decision 5); the device shows the row's block ids
  and plays, it does not edit songs.
- The SEQ page "OUT CH" readout shows the device setting while a song override is active
  (no marker in v1; the SONG page shows the song's channels only through the record).

## 7. Task 02 — MIDI file import (folded from docs/tasks/TASK-02-notes.md at Step 4)

Task text: docs/tasks/TASK-02-midi-import.md. Assessment: docs/tasks/TASK-02-step1-assessment.md.
Build notes, test results and the hardware checklist: BUILD.md section 14.

### 7.1 Scope

Import Standard MIDI Files (type 0 and type 1, PPQ time division; binary SMF or the mf2t
text form that the Renoise/XRNS2MIDI tool chain writes) in the browser workbench and turn
them into Task 03 songs: rows of 64-step blocks shared through a per-song pool, up to 4
independent notes per step (pitch, velocity, length) at 16th resolution. Everything runs in
the browser (web/import/); the device write goes through one transfer interface whose
workbench implementation (Step 4) is the song editor's own write path. No firmware change.
The approved Task 03 Step 1 report, section 9, is the binding format (v0.5, commit 96c9058;
the block, row, song record and `.tabby` layouts are those of v0.4).

Files (all new, Task 02):

| File | Role |
| --- | --- |
| web/import/midi-parse.js | SMF parser (binary MThd/MTrk and mf2t text "MFile …"): header, tracks, running status, meta, SysEx, note pairing |
| web/import/midi-song.js | analyze() the file into parts; convert() to a song with the mapping rules |
| web/import/song-format.js | song model, block/record/.tabby encoding and decoding, validation rules, pool usage, JSON save/load |
| web/import/song-transfer.js | transfer interface: stub (standalone page) and the workbench backend (Step 4) |
| web/import/import-ui.js | the Import MIDI panel as a DOM component (`TabbyImportUI.mount`) |
| web/import/index.html | standalone development page (open from disk; stub transfer) |
| tests/midi-import/smf-write.mjs | SMF writer for fixtures |
| tests/midi-import/make-fixtures.mjs | generates tests/midi-import/fixtures/*.mid deterministically |
| tests/midi-import/run.mjs | the host tests (`make midi-import-test`) |
| tests/midi-import/simulator.mjs | the simulator check (`make midi-import-sim`, after `make web`) |
| tests/fixtures/*.mid | four Renoise exports (mf2t text) used by the tests |

The scripts are classic scripts publishing `globalThis.TabbyMidi`, `TabbyMidiSong`,
`TabbySongFormat`, `TabbySongTransfer`, `TabbyImportUI`, with a CommonJS export guard so
Node loads the same files. No library is used (the parser is about 200 lines), so
THIRD_PARTY.md is unchanged. In the workbench they are inlined by tools/linux/build-web.py
(placeholder `/*FM1_IMPORT_SCRIPT*/`) and the panel is mounted in the Library tab, group
"Import MIDI file (Classic Tabby)", next to the song
editor. The panel's own strings are English in both UI languages (decision at Step 4: no
80-string addition to the shared sdk/I18n.js; only the group title and its help line are
translated).

### 7.2 Writing to the device (Step 4)

The importer never sends a transfer itself. Its transfer object wraps the song editor's
backend (`songBackend()` in sdk/Update.html.in), which is the Library class for a connected
device or the browser simulator, following the editor's "target" choice:

1. the slot is checked (kind 5 download of the record only, no blocks);
2. the song is written by `Library.songWrite`, which since checkpoint (f) deletes an
   occupied slot first (the same rule for the song editor), then uploads the song record,
   then the blocks in kind-7 batches cut at the device's packing boundaries (section 9.6
   v0.5), then reads the record back and compares; the importer's wrapper only reports
   the replacement;
3. the replace warning (song editor and importer) says the old song is deleted first and
   suggests exporting a `.tabby` of it;
4. the panel shows the elapsed time, the batch plan and the replace note.

With firmware before checkpoint (e) (capability bit 3 clear) the Library class falls back
to kind 6, one block per transaction; the importer does not care.

### 7.3 Mapping rules (as implemented)

Positions: `step = tick × 4 / division` in 16ths from the start of the file; starts snap to
the nearest step, ties toward the earlier step (2.5 → 2).

| MIDI content | Handling |
| --- | --- |
| Note ends | rounded to whole steps by the chosen rule: nearest (default, ties earlier), never shorter (round up), never longer (round down); stored length = max(1, end − start) |
| Notes shorter than a step | length 1 (counted: lengthMin) |
| Notes longer than 255 steps | clipped to 255 (lengthClipped) |
| Notes outside the chosen bar range | dropped (droppedRange); notes ending past it clipped (clippedRange) |
| Same pitch overlapping on one track | the earlier note is shortened to end where the next starts (overlapClipped); two same-pitch notes on one step keep the louder (duplicateDropped); the retrigger bit is never set |
| More than 4 notes starting on one step on one track | keep the 4 loudest (tie → higher pitch), or highest, or lowest (overflowDropped) |
| Velocity 0 note-on | note-off (MIDI rule) |
| Tempo | first set-tempo event, rounded to an integer BPM (tempoRounded), clamped 30..300 (tempoClamped); becomes the song's tempo override; no tempo → 120 (noTempo); later tempo events that differ from the previous one are listed and ignored (tempoChangesIgnored) |
| Time signature | first one sets the bar length `16 × numerator / denominator` steps (must be a whole number 1..64, else the file is refused); later changes listed and ignored (meterChangesIgnored) |
| Control changes, pitch bend, aftertouch, SysEx, other meta | ignored, counted per type; sustain (CC 64) counted separately |
| Program changes | ignored, listed with track, channel, program (1-based) and position |
| Several channels in one MIDI track | split into parts keyed (track, channel); the part name gets " chN" |
| More than 8 parts | the first 8 non-empty parts are pre-assigned to tracks 1..8, the rest are "skip"; any part may be assigned to any track; several parts may share a track |
| Truncated file / missing end-of-track | events read so far are kept; warning shown |
| SMPTE division, format 2 | refused with a message |
| mf2t text files | read like binary files; measure:beat:click times are refused (re-run mf2t without -t); unknown lines are counted, not fatal |

Rows: one row per `rowSteps` steps from the start of the bar range. `rowSteps` is one of 16,
32, 48, 64 (the allowed row lengths) and must hold whole bars; the default is the candidate
closest to 4 bars (ties → longer): 4/4 → 64, 3/4 and 6/8 → 48, 2/4 → 32, 12/8 → 48 (2
bars), 1/4 → 16. Meters with no aligned candidate (5/4, 7/8, 9/8, 7/4 …) use 64 with the
warning meterUnaligned. A note is stored in the row and step where it starts with its full
length; steps ≥ rowSteps inside a block stay empty. Trailing silent rows inside the bar
range are kept (a long note may ring through them).

Deduplication: the cell (row, track) is encoded with the section 9.3 block encoding; the
byte string is the pool key; an empty cell is block id 0 and is never stored; identical
cells share one id (1..65535 in order of first appearance). Consecutive rows with identical 8
ids merge into one row with repeat + 1, up to 64. The merge is lossless (test 3 unrolls the
rows and compares with the pre-deduplication grid).

Loose deduplication (option, **off by default**, tolerance default ±8): when a cell has no
exact match, it is compared with every stored block that has the same notes (step, pitch,
length, position for position); if every velocity differs by at most the tolerance, the
cell reuses that block and the stored block keeps the first cell's velocities (no drift:
later cells are always compared with the stored velocities, never with each other). Each
merge is listed in the warnings as kind `looseMerged` with track, row, bar range, block id
and the largest velocity difference; the count is in the statistics. The tolerance (0..126)
and the mode are recorded in `song.source`.

Song fields set by the importer: name (file name, 12 upper-case ASCII, editable), project
slot (user choice, default 1), tempo override (first tempo), loop flag (checkbox, off),
jump mode bar, loop row 0, every row's step length (above; row byte 10), OUT CH per track
(user choice, default "device setting" = header byte 0; channel n is written as n, 1..16). `song.source` records file name, format, division, exact tempo, meter,
bar range, rules and the part-to-track assignment; `song.warnings` records the warning
kinds and counts.

Limits, checked after deduplication: 128 rows, 2048 blocks per song (16-bit ids; the
importer can produce at most 128 × 8 = 1024 anyway), block payload 64..832 bytes, pool
96 × 4076 bytes. The import is refused with a message (narrow the bar range) when a
limit is exceeded.

### 7.4 Layout as written (section 9 v0.4 layouts, unchanged in v0.5)

Song record: header 64 bytes (magic FM1G, generation, target, **CRC over 20..2623**, commit,
version 1, name at 24, project slot 36, flags 37, tempo 38, row count 40, byte 41 reserved
0 (v0.4; was the block count), loop row 42, reserved 43..47, **output channels 48..55** as
0 = device setting or 1..16, reserved 56..63), then **128 rows × 20 bytes at offset 64**:
**8 × uint16 LE block ids** (0 = silent, 1..65535), repeat at 16, flags at 17, **step length
at 18** (16/32/48/64; 0 reads as 64), reserved 19; 2624..4095 0xFF. Block record (file and
device): song byte, reserved 0, **id uint16 LE**, length uint16 LE, payload, padded to 4
bytes (6-byte header). Transfer kind 6 target = **(song << 16) | id**. The importer writes
the step length explicitly in every used row and leaves unused rows zero. Decoding rejects
channel bytes above 16 and step lengths other than 0/16/32/48/64, as the device does.
`validate()` warns when a row shorter than 64 steps points at a block with notes beyond the
row's end (the device never starts them); the importer never produces that. v0.1 JSON
files with `song.rowSteps` still load (the value moves into each row). The v0.2 and v0.3
record layouts were never written to a device and are not read.

### 7.5 Merged code against the spec the importer was built on

The importer was built against section 9 v0.4; the merged firmware implements v0.5. Found
at the rebase (Step 4), none of them a byte-layout difference:

- Transfer: the merged workbench writes the record first and the blocks as kind-7 batches
  (v0.5); the importer's stub planned the v0.4 order (record then kind-6 blocks). The
  importer now uses the workbench path and only plans the batch cut for its estimate.
- Liveness (9.4): at the rebase a block stayed live while its song's record was valid,
  whether or not a row referenced it. Checkpoint (f) changed the rule to liveness by
  reference (9.4 v0.5.1) and moved delete-before-replace into the shared workbench write.
- Capability reply bit 3 and command 23 bytes 9..12 are new; the importer reads neither
  (the Library class does).
- Validation: the device does not range-check the tempo override (any 16-bit value); the
  importer's 30..300 is stricter. The device requires name bytes 32..126; the importer's
  padName produces upper-case ASCII. Unused rows may be zero (the device validates only the
  first `rows` rows), as the importer writes them.
- Timing granularity (measured in the simulator, not in the spec): the sequencer ticks once
  per 128-frame block and events leave on the next block, so note-ons and note-offs land
  within ±3 blocks (about 9 ms at 44.1 kHz) of their step, with no drift over a 216-second
  song.

### 7.6 Known limits

- Sustain pedal (CC 64) is counted, not applied; tempo and meter changes after the first
  are ignored; program changes are listed and ignored (rules in 7.3).
- One file becomes one song; splitting into several songs and transposed-block detection
  are not planned for v1.
- Legato is not produced: the importer clips same-pitch overlaps instead of setting the
  retrigger bit, so the device never extends a note (9.3 legato rule) for imported material.
- The panel is English only (7.1).
- Row events (Task 04): a program change, bank select or control change in a `.mid` becomes
  a row event when its position lies in [row start − pre-roll, row start + ½ step); the
  pre-roll is one beat by default, 0 or one bar selectable; CC 0 / CC 32 directly before a
  program change on the same channel merge into one bank+program event; a row with events
  is never merged into a repeat of the previous row; everything else is listed as dropped.
  Events are addressed to the file's MIDI channel, not to a Tabby track.

## 8. Task 04 — Row events (program change, bank select, CC) and the device library

Task text: docs/tasks/TASK-04-row-events-device-library.md. Assessment and device research:
docs/tasks/TASK-04-step1-assessment.md (approved 2026-11-02). Format: section 9.11 of
docs/tasks/TASK-03-step1-assessment.md, v0.6 (5542841).

Fixed decisions (the task's): events fire at row start before the row's first notes, on all
MIDI out ports, targeting a MIDI channel, not a track; a queued jump fires the target
row's events; types are program change, program change with bank select (CC 0 and/or
CC 32 before the PC) and control change, with a per-device gap sent as a gap event;
storage in the song sector tail with a versioned layout and an extended CRC, old songs
staying valid; "SEND SETUP" on the SONG page sends row 1's events; the device library
lives in the workbench only (`web/devices/*.json`, with sources and unverified fields
marked); rig setup with a global profile and a per-song override; importer converts
events at or near a row start. Approved at Step 1: once per row entry, pre-firing with a
late counter, record version 2, the `.tabby` trailer for the rig override, a one-beat
pre-roll default (0 and one bar selectable).

Status:

- **Firmware part done, 2026-11-02:** song record version 2 with the event table (storage
  validation and version-dependent CRC and transaction length, recovery included), the
  event stream in the sequencer tick (events of a row enqueued into router lane 0 before
  the row's first notes, under the channel owners, on all ports; bank select before the
  program; gaps in whole audio blocks; pre-firing so a gapped stream ends in the boundary
  tick; the late counter), SEND SETUP (ACTIONS, stopped only), SONG page "EVENTS n / LATE
  m", command 23 bytes 13..14. Host tests: section 10 (36 checks). Measured figures:
  BUILD.md section 16.
- **Workbench part done, 2026-11-02:** the device library (`web/devices/*.json`, eleven
  definitions in the `tabby-device/1` format written by tools/linux/devices-from-sources.py
  from the manufacturer documents of the Step 1 research, preset lists parsed from the
  manufacturers' own files: Proteus/2 192, Blofeld 1024, Pulse 2 500, Zoom 80; every
  definition cites its sources and lists its unverified fields; three FM-1 definitions, one
  per firmware: Skiff, Melodee and an Orange Cat placeholder), `web/rig/device-library.js`
  (schema validation, display numbering, bank bytes, preset and controller names),
  `web/rig/rig.js` (the rig profile: channel → device, name, gap override, user program
  names; browser storage, export / import; gap generation for writing) and
  `web/rig/rig-ui.js` (rig setup table and the row event editor, mounted in the Library
  tab next to the song editor; English like the importer panel). The shared parser reads
  and writes version-2 records (`song.events`) and the `.tabby` trailer; the song editor's
  write and export paths apply the rig's gaps; the per-song rig override is a checkbox.
  The importer converts program change, bank select and control change events at or near
  a row start (one-beat pre-roll by default, 0 or one bar selectable) into row events and
  lists the rest as dropped. Tests: device schema and numbering (38 checks), importer suite
  140 checks (row-events fixture, version-2 round trips, trailer), a simulator check with a
  three-row song (events in order before each row's notes, on their channels, 0 late).
  Hardware checklist: BUILD.md section 17.3.

Known limits (firmware part):

- Events never reach the internal engine (they target external gear); a song that must
  change the SMK-37's own presets does that with its project, not with events.
- A row's stream is pre-fired only when the next row is known: the natural next row, or
  a queued jump's target once decoded. A jump queued with less time to its landing than the
  stream's gaps, or PLAY itself on a row with gaps, sends the gapped tail after the
  boundary (counted as late; use SEND SETUP before PLAY).
- At most 32 events per row and 292 per song; a bank-select gap is three events (CC 0 /
  CC 32 as control changes, a gap, the program change).
- A version-2 record on firmware before Task 04 reads as invalid (different CRC range);
  the workbench writes version 1 for songs without events.

## 9. Task 05 — Timed notes: exact start offsets and lengths (2026-11-04)

Task text: docs/tasks/TASK-05-timed-notes.md; Step 1 assessment: docs/tasks/
TASK-05-step1-assessment.md (approved with the decisions recorded there); formats:
docs/tasks/TASK-03-step1-assessment.md section 9 v0.7 (9.12) and docs/TIMED-NOTE.md; build
notes and measurements: BUILD.md section 18; flash and RAM: FLASH-BUDGET.md section 11.

### 9.1 What it is

The MIDI importer used to snap every note start to the nearest 16th and round every
length to whole steps. Since Task 05 a song keeps the timing of its source: every note
carries a signed **start offset** from the 16th step it belongs to and an exact **length**,
both in **units of 1/480 step** (1/1920 quarter note; musical, so they scale with tempo),
and the song sequencer plays each note-on and note-off in the audio block that contains
its time.

**The timed note** (app/timed_note.h, app/timed_note.c; web/timed-note/timed-note.js;
docs/TIMED-NOTE.md): pitch 0..127, velocity 1..127, retrigger flag, offset −240..+240
units, length 1..8388480 units, in 6 bytes with a 16-bit mantissa and 3-bit exponent for
the length (exact up to 65535 units = 8.5 bars of 4/4, then to 2..128 units) and a
canonical rule that gives every value one byte pattern. Encode, decode and validate exist
once in C and once in JavaScript; tests/timed-note/vectors.txt (generated by an
independent Python reference) pins both to the same bytes (`make timed-note-test`, part of
`make test`). The module has no dependency and can be lifted into another project.

**Anchor rule.** A note belongs to the 16th step nearest its start; a start exactly half a
step after a grid line belongs to the earlier step with offset +240. A note nudged early
therefore stays in the step it is heard against.

### 9.2 Formats (section 9 v0.7)

- **Block payload format v2** (9.12): the same step header as v1 (count, probability, alt
  bit), then 6-byte timed notes; 64..1600 bytes. **Block record byte 1** (9.4) names the
  payload format: 0 = v1 (9.3, 3-byte notes), 1 = v2. Every record written before Task 05
  has byte 1 = 0 and reads as v1. CRC ranges, record alignment, sector headers, the staging
  journal, the batch stream and the transfer commands are unchanged.
- **Song header flags bit 2 = swing** (9.5): 0 (default) plays v2 blocks on the straight
  grid; 1 applies the project's swing to them. v1 blocks always follow the project swing,
  exactly as on tabby-v02.0.
- Transfer kind 6 carries format-1 payloads both ways (the device upgrades a stored v1
  block on download); kind 7 streams carry the record's own format byte. Command 22's
  capability byte gains bit 4 (timed notes); the workbench refuses to write songs to a
  firmware without it.
- Workbench model `tabby-song/2` (offset and length in units, `swing`); `tabby-song/1`
  JSON loads and is upgraded. `.tabby` files from tabby-v02.0 (format-0 records) load and
  are written back as format 1.

### 9.3 Sequencer (app/song.c v0.3)

- **Clock.** The song position is kept in units with an exact rational advance per 128-frame
  block (tempo × 1024 / 11025 units, remainder carried): no drift over any run; the first
  block after PLAY already advances at the song's tempo override.
- **Window scheduling.** Each tick owns [p0, p1) of the position; every note-on and note-off
  due inside the window becomes an action, sorted by time (note-offs before note-ons at
  equal times), and plays in that order into router lane 0 (all song notes share the lane,
  so the drain keeps the tick's order; the stock sequencer's lanes are untouched). A note
  therefore leaves in the block that holds its exact time; note-offs likewise, from a
  32-bit unit countdown.
- **Swing per block.** warp(t): inside each pair of steps the first 480 units scale by
  (100 + s)/100 and the next 480 by (100 − s)/100; a negative time (−240..−1, a step-0 note
  before its frame) scales by (100 − s)/100. s is the project swing for a v1 block and, for
  a v2 block, the project swing when the song's flag is set, else 0. A note with an offset
  keeps its fraction of the step its time falls in; lengths span the warped time.
- **Negative offsets across a boundary.** While the window approaches a boundary whose next
  frame is known (the natural next row or repeat, or a queued jump whose row is decoded),
  step-0 notes of that frame with negative offsets are fired ahead of it. When the next
  frame became known too late (a jump queued inside the last half step, a loop-here row
  waiting for a jump, the first row at PLAY), they play at the boundary and the entry adds
  one to the LATE counter (shared with late event streams; SONG page "LATE", status byte
  13). The look-ahead fires the notes of the frame it expects; a jump queued after that
  lands elsewhere and those notes play anyway, with their note-offs.
- **Probability** is rolled once per track, step and pass, shared by the step's notes
  whatever their offsets.
- **Row events** keep 9.11; their pre-fire starts one block earlier so the last gapped
  message leaves in the block that holds the boundary, before the row's first note.
- **Old songs.** A v1 block is upgraded at decode (offset 0, length L × 480, exact) and
  plays with the project swing; tests/host/smoke.c section 12 replays a v1 song against a
  capture from the tabby-v02.0 simulator (tests/host/v1_reference.inc): the same messages,
  each within one block, with swing 0 and 25.

### 9.4 Importer (web/import/midi-song.js v0.5)

- Exact by default: offset and length in units from the file's ticks; PPQ values dividing
  1920 (96, 120, 192, 240, 384, 480, 960, 1920) convert exactly, others round to the nearest
  unit and are reported (kind `ppqRounded`, with the count and the largest rounding in
  units and ms).
- Quantize is an option, off by default: `starts` (offset 0, length kept) or `startsEnds`
  (also whole-step lengths with the length rule nearest / up / down); only then do the
  `moved` and `lengthRounded` warnings appear.
- Warnings list only real changes: same-pitch overlaps clipped (in units), more than 4
  notes anchored on a step (the overflow rule), same pitch twice on a step (the louder
  kept), range clips, lengths beyond 136 steps stored to the exponent scale.
- Statistics report notes with offsets, the largest offset and fractional lengths. Blocks
  deduplicate on exact bytes, offsets and lengths included.
- Row events: unchanged (Task 04 window rule on the straight grid).

### 9.5 Workbench song editor (sdk/Update.html.in, sdk/WebUpdate.js)

- Step text `pitch:velocity:length/offset[r]`: length in steps with decimals (stored to
  1/480 step), offset in signed units; the old form without a slash reads unchanged.
- Steps holding an offset or a fractional length carry an orange mark; clicking a step opens
  the note inspector: per note pitch, velocity, retrigger, offset (units, with the reduced
  fraction of a step and the milliseconds at the song's tempo), length (steps + units, with
  the decimal steps and ms).
- "Quantize starts to 16ths" and "Quantize starts and ends to 16ths" act on the block in the
  editor; a "swing follows the project setting" checkbox sets the song's flag bit 2.
- The importer panel's Quantize select (off / starts / starts and ends) and the
  statistics line (offsets, fractional lengths).

### 9.6 Known limits

- MIDI out cannot be timed inside a block: the send call is control-task only without a
  timestamp. The firmware queues each note in the block that holds its time; the message
  leaves at the control task's next poll (the device's control loop, measured by BUILD.md
  13.4 step 12; the simulator's 10 ms poll adds 0..3 blocks, its per-block test switch
  none). DIN MIDI itself takes 0.96 ms per 3-byte message.
- FM6 preview (the local engine copy) is one block looser than MIDI out.
- A song note cannot be longer than 17476 steps; the importer clips and reports.
- Transfer kind 6 uploads are format 1 only; v1 payloads reach the device only inside a
  kind-7 stream (the workbench never sends them).

## 10. Task 06 — Independent track launching (2026-11-04)

Task text: docs/tasks/TASK-06-track-launching.md. Assessment: docs/tasks/TASK-06-step1-assessment.md
(approved 2026-11-04 with the decisions listed in its section 10 and the user's additions:
the master transport runs until PLAY; stopping every track never stops the transport, MIDI
clock or Song Position Pointer; song end with detached tracks silences the attached ones and
keeps the transport running).

Fixed decisions (the task's): a track's patterns are its blocks in the song's rows (pattern N
of track T = T's block in row N, loop length = row N's step length, no new storage);
independent per-track queues landing on beat 1 of the next bar (16 steps of the global
clock); independent looping with polymeter; quantized stop with every sounding note released
on the channel it was sent on; launch replacing a playing pattern releases its notes at the
bar; the master transport is never reset by a launch; negative-offset notes of a launched
pattern pre-fire like a row's; per-track program changes with the rig's gaps and a
per-device lead before the bar; a scene jump overrides all per-track queues and re-attaches
every track; detached tracks ignore row advances until "back to song"; pad colours for
playing / queued / stopped / empty / pending stop; Classic Tabby stays the clock master.

Checkpoints and status:

- **(a) done, 2026-11-04: BLE and NAME pages removed** (the approved removals of the
  assessment's section 7). The device keeps BLE MIDI, the saved radio settings and the clock
  source (SEQ page 5/7 until tabby-v04.0; since then the SYNC / MIDI page, 16.2); the BT button announces "BLUETOOTH: SET IN WORKBENCH". The
  Bluetooth settings moved to the workbench: transfer **command 24** (read {flags, role},
  write them, forget BLE MIDI pairs; capability bit 5 of command 22, reply byte 8 = 63) and a
  "Bluetooth settings" group in the Library tab (radio on, Bluetooth audio, DEVICE / HOST
  role, forget MIDI pairs; every change is written and saved at once). The HOST-mode device
  scan list is gone with the page. DX7 patch names come with the .syx voices imported in the
  workbench. ACTIONS lost "DX7 PATCH NAME" and "BLUETOOTH / CLOCK" (the later entries moved
  up two). The build tool no longer requires the SDK's BLE client wrappers, which the linker
  drops now that nothing calls them. A Task 05 workbench bug fixed on the way: the
  capability check masked reply byte 8 with ~15, so a Task 05 device (31) would have been
  refused at connect; the mask is ~63. App image 447140 bytes, **margin 6781** (−4224).
- **(b) done, 2026-11-04: per-track playheads in firmware** (app/song.c v0.4, section 9.13
  of the assessment): one master clock in units with bars of 16 steps, a frame (start,
  length, buffer) per track, two buffers per track decoded ahead by the control task (next
  row, queued pattern, current row for back-to-song, the jump's row for every track while
  a scene jump is queued), queues per track landing on the next bar with every sounding
  note released on its channel, launched patterns looping independently (polymeter),
  scene jumps clearing the queues and re-attaching every track, the song end with detached
  tracks (following tracks silent, transport on until PLAY), late entry in phase when a
  buffer is not ready, per-track event streams from the row's events on the track's
  channel (gaps by their channel bits, a trailing gap as the lead before the bar), per-track
  status, command 23 bytes 15..30, simulator exports. Host tests: section 13 (65 checks:
  launch at the next bar with the other tracks, the bar count and the clock untouched; the
  program change `lead` blocks before the note; two presses keep the last; a detached track
  ignores row advances; quantized stops release the two-bar note and the pre-fired note;
  back to song; a scene jump over queued launches; a late press counted late; nothing
  stuck; a 48-step pattern against 16-step rows for 64 bars with no drift; the song end
  with a launched track, the clock running on, PLAY stopping; eight tracks launching eight
  rows at one bar). App image 449028 bytes, **margin 4893** (+1888); static SRAM 323764
  (+4832). Crosscheck IDENTICAL.
- **(c) done, 2026-11-04: the TRACK LAUNCH page** (page 20, app/screen.c): SCL switches
  between the SONG page (scene changes, unchanged) and TRACK LAUNCH, and its lamp is lit on
  the launch page. On the launch page pads 1-16 are the selected track's patterns of the
  pad page (OCT pages rows 1-16, 17-32, …; SHIFT + pads 1-8 selects the track as on every
  page): a pad launches its pattern at the next bar, the pad of the pattern the track plays
  queues a stop, an empty pad or a stopped song says so. ENV sends the selected track back
  to the song at the next bar, SHIFT+ENV every track. PLAY starts and stops the song as on
  the SONG page; HOME returns to the overview. The screen shows the master bar, all eight
  tracks with the pattern they play and their state (FOLLOW / PLAY / STOP, or the pending Q
  n / >STOP / >SONG in amber), the pad page's pattern cells (filled where the row has a
  block, green playing, amber queued), the song row, SONG OVER and LATE. Pad colours
  (assessment 5.3): green playing, flashing green queued, flashing red a pending stop, dim
  white a pattern, off empty; under SHIFT pads 1-8 show the eight tracks in their colours
  (bright playing or following, dim stopped or silent, flashing queued, the selected track
  brighter). Flashing follows the master clock's eighth notes while the song plays. The
  workbench simulator has the page as shortcut 20 ("Track launch"); `sim_pad_color(pad)` reads
  a pad's colour. The scripted 32-bar performance check (tests/workbench/launch-sim.mjs:
  launches, stops, a scene jump, back to song) found one sequencer fault, fixed here: a
  track rejoining the song on a bar where the song also changes rows took the old row; it
  now takes the new one, and a following track whose buffer is not the song's row adopts
  the right one as soon as it is decoded (counted late). App image 451396 bytes, **margin
  2525** (+2368): the 2 KB floor holds without the EFFECTS page; checkpoint (d) adds no
  firmware.
- **(d) done, 2026-11-04: workbench.** The rig profile gains a per-channel **Lead ms**
  (web/rig/rig.js v0.2, rig-ui.js v0.2; `tabby-rig/1` with an optional field, old profiles
  read as 0): when a song is written the channel's last program event of a row is followed
  by a gap of at least the lead (the larger of the lead and the device's gap after the
  program), kept even when it ends the row, so the firmware's stream starts that early and
  the program change leaves before the bar for launches and scene changes alike; gaps carry
  their event's channel (9.11 v0.8.1). The song editor labels rows as patterns and lists,
  per track, the pattern numbers the TRACK LAUNCH page offers; the storage status shows
  every track's state, pattern and pending queue (command 23's 31-byte reply, the same from
  the browser simulator). The simulator shortcut 20 opens the page. Tests:
  tests/workbench/rig-lead.mjs (9 checks), tests/workbench/launch-sim.mjs (the scripted
  32-bar performance, 32 checks: 591 of 591 predicted note-ons within one block, worst
  error 0, nothing beyond the model, every note-on with its note-off, Start and Stop once);
  importer suite 167, host 258. No firmware change: app image 451396 bytes, margin 2525.

Known limits (v1 of track launching):

- A press inside the last control poll before the bar (10 ms in the simulator, the device's
  control-loop period) enters the pattern in phase at the next poll with its downbeat
  skipped and counts late; the LATE readout on the page shows it.
- Two tracks on one channel each send their own launch slice; two launches at the same bar
  send the program change twice, last wins.
- "Back to song" joins the song's row where it stands; a negative-offset note on the row's
  step 0 is not pre-fired for that entry.
- The hardware pad colours and flashing are judged on the device (BUILD.md 19.5).

Deferred (BUILD.md left-to-build list): following external MIDI clock in song mode; CC
automation inside a row.


## 11. Task 08 — The display version (2026-11-04)

The installed Classic Tabby version is shown wherever the user sees a version: the boot
screen ("SMK37 / OFFICIAL OPEN / <version> / M-VAVE"), the workbench's header badge, and the
update tab's Version line. The value is the git tag of the build (`tabby-v03.1`), computed at
build time by tools/linux/display_version.py and compiled in as `FM1_DISPLAY_VERSION`; a build
from a source archive reads the export-subst `VERSION` file; a development build shows
tag-count-hash with `-dirty` when the tree is modified.

The firmware identity does not change: `FM1_RELEASE_VERSION` stays "V01", the update product
stays `SMK-37 Pro_8000001`, query 17, the loader handshake, the workbench's Open-firmware
checks and the factory V16 restore are untouched. The update tab's firmware details keep the
label as "Open base version". The display version is part of the build id only when it
differs from the label, so a re-tag of unchanged sources is a new build id (not refused as
already installed) while a build forced to the label (`DISPLAY_VERSION=V01`) keeps the old
id. Cost: 0 bytes for a tag (alignment), 32 bytes for the 28-character development string.
Details and the measured gate: BUILD.md section 21.

## 12. Task 08 — The manual (2026-11-04)

The workbench manual tab documents Classic Tabby in twelve English chapters shown in both UI
languages, followed by the corrected SMK37 OPEN chapters in Chinese with their translations.
The source of truth is the code on the linux-build head; the disagreements between the code
and the earlier sections of this document are listed in BUILD.md 22.1 (the SONG page's song
knob is SELECT / PRESETS, not K1; the ACTIONS confirmation sits on COMPACT SONG STORAGE
instead of ERASE OLD SAMPLE/DX7 since Task 06 (a); the song's project slot is not loaded by
the device). tests/workbench/manual-i18n.mjs guards the translation coverage of the manual.

## 13. Task 09 — The Wrong Room rig (2026-11-05)

Task text: docs/tasks/TASK-09-wrong-room-rig.md; research and the approved plan:
docs/tasks/TASK-09-step1-assessment.md. One source of truth for the channel plan: the built-in
rig profile `web/rig/profiles/wrong-room.json`, built on the device definitions in
`web/devices/`; the importer's channel mapping, the generated guide and the hardware checklist
derive from it. Firmware unchanged.

Checkpoints and status:

- **(a) done, 2026-11-05: device library and profile.** Fifteen definitions (four new: Chase
  Bliss Brothers, Strymon NightSky, Tone King Royalist Preamp, the FM6 internal pseudo-device;
  the rest rechecked against the current manufacturer documents), the optional definition fields
  `kind` / `midiIn` / `clock` / `channelSetting` / `firmware` / `programsTotal`, the Wrong Room
  profile with a port note and an optional pinned Tabby track per channel (channel 9 = FM6 on
  track 8), the profile selector in the rig panel (built-ins read-only, Copy to my rig; "My rig"
  stays the stored, editable profile songs use). The plan: see BUILD.md 23.1.
- **(b) done, 2026-11-05: the importer maps by the rig.** Each part's MIDI channel becomes its
  track's OUT CH (no "device setting" default for imported parts; an explicit choice still
  overrides); a part on a pinned channel takes its track whatever its file order (channel 9 →
  track 8); the preview names the rig device on each part's channel and a device the track name
  mentions; warnings when a part's channel is not in the rig, when notes go to an effects
  channel, when a program number is outside the device's range (or the device takes none), and
  when a CC is not one the definition names. Fixtures and tests: BUILD.md 23.2.
- **(c) done, 2026-11-05: the generated guide.** docs/MIDI-GUIDE.md is built by
  tools/linux/midi-guide.mjs (web/rig/guide.js) from the Wrong Room profile, the device
  definitions and the hand-written template docs/MIDI-GUIDE.template.md: the channel map, one
  section per channel (connection and port, channel setting, program numbering with the wire
  value beside the shown number and the bank select, named CCs with ranges, clock, gap and lead,
  unverified fields), the limits, Appendix A's example channels and Appendix B's checker with the
  rig's channel, program-range and named-CC checks. The Import MIDI panel downloads the same
  guide for the active rig. tests/workbench/midi-guide.mjs fails when the committed guide and the
  profile disagree. BUILD.md 23.3.
- **(d) done, 2026-11-05: the simulator check.** tests/workbench/wrong-room-sim.mjs plays the
  all-devices fixture: every part on its planned channel, every row's events before its notes,
  no late row. Learnt: a rig gap stalls the events that follow it in a row's stream (events leave
  in file order), so a gapped device's track goes last in the file; the guide says so. Hardware
  checklist: BUILD.md 23.5. Firmware unchanged (margin 2525).

Known limits (Task 09): the rig is one profile per workbench ("My rig") plus the built-ins; a
song's own copy still overrides it; the importer matches device names in track names by
substring; the H90 gap is the 255 ms field maximum (users report about 300 ms on the buggy
firmware); the Royalist's CC numbers and the Zoom's PC base are unverified until the checklist.

## 14. Task 10 / Task 11 — MC-707 workflow port: decisions and design rules (2026-11-07)

Task texts: docs/tasks/TASK-10-mc707-workflow.md (assessment:
docs/tasks/TASK-10-step1-assessment.md, parity matrix docs/MC707-PARITY.md) and
docs/tasks/TASK-11-phase0-prep.md. Section and item numbers below refer to the Task 10
assessment.

### 14.1 Decisions (the assessment's section M, decided 2026-11-07)

1. **Clip format: the event list v3** (C.3): a 16-byte clip header and sorted 6-byte events
   (note with its length, CC, PC, bank, pitch bend). The 16-pad step grid is a view of it.
2. **USER move: 64 KiB** (user_bytes 471040, USER base 0x8C000), and only after the probe build
   (tabby-p0-probe64, Task 11 Step 4) passes on the user's device. 96 KiB is held in reserve.
3. **Migration: a full workbench backup before the move and a full restore after**, through the
   transfer kinds only (Task 11 Step 2, docs/BACKUP-FORMAT.md). No relocating build.
4. **Clips per track: 16 per bank on the pads, 64 stored per track**; the importer groups an
   arrangement into clips of up to 8 bars (C.1).
5. **The factory DX7 bank stays** unless Phase 4 or 5 overruns the flash budget.
6. **Drums: the 808 engine only.** No sample region.
7. **Metronome: two clicks, selectable.** An internal 808 click through the preview path, which
   can be turned off, and a MIDI-note click: a note on a chosen channel and note number, sent on
   MIDI out like any song note. Either, both or none. The SMK-37's audio out may feed the house
   mix, so the MIDI click is the one for the stage.
8. **Undo: 4 levels** per clip being edited.
9. **Scenes: rows become scenes**, 128 per song, shown as 8 banks of 16 pads.
10. **External clock follow in Phase 1**: Start, Stop, Continue and Song Position Pointer, and
    clock loss (D.4).
11. **The probe runs on the user's device after a full backup**, before any Phase 0 code
    depends on the move.
12. **The arpeggiator page stays.**
13. **The 4-notes-per-step limit is superseded** by the event list's per-clip event cap (14.2).
    The importer keeps exact timing.

### 14.2 Design rule: the event cap

A clip holds at most **768 events** (notes, CC, PC, bank, pitch bend, aftertouch together;
raised from the assessment's 512).

Why 768. Eight bars of four-note chords on every 16th are 128 × 4 = 512 note events, which
fills a 512 cap with no room for a single CC. One controller swept without a break for eight
bars, thinned as below, adds at most 128 × 2 = 256 events. 512 + 256 = 768. Real material is far
below that: the densest fixture track (tests/fixtures/meridian_fault.mid, track 10) has 516
notes in 80 bars, about 52 per 8 bars. RAM at 768 (6 bytes per event, 16-byte header, 4624 bytes
per clip buffer), against C.2: two decode buffers per track × 8 tracks = 73984 B, the edit copy
4624 B, 4 undo levels 18496 B; total 97104 B of the 150668 B measured headroom (heap 199820 B
less the SDK minimum 49152 B), leaving 53564 B. 1024 events would take 129360 B (86 % of the
headroom) and is not taken.

When real-time recording or overdub reaches the cap:

- The recorder counts the events in the clip plus the notes being held (each held note has a
  reserved entry for the note it will become at its note-off). A new note-on, CC or other event
  is accepted only while that sum is below 768.
- When the sum reaches 768, recording into that clip stops: no further events are taken from
  the keys, pads, encoders or MIDI in for that clip. Notes already held keep their reserved
  entries; each is written to the clip at its note-off with its length, and its note-off is
  sent on MIDI out as usual. Playback continues.
- The screen shows `CLIP FULL - 768 EVENTS - REC STOPPED` for 2 s, the REC lamp goes out, and
  the clip's pad flashes red once. Nothing already in the clip is changed or lost; undo still
  holds the state before the take.
- Step entry and the event editor refuse an insert into a full clip with `CLIP FULL` and change
  nothing.

Controller thinning while recording (CC from the encoders and from MIDI in, pitch bend, channel
pressure, polyphonic aftertouch per note). Per controller and per clip, with 1 unit = 1/480 of a
16th:

- A value is written only if at least **240 units** (a 1/32 step) have passed since the last
  written event of the same controller. Values that arrive inside the window replace a single
  pending value.
- A gesture ends when no new value of that controller arrives for **480 units** (one 16th), or
  when the encoder is released, recording stops or the transport stops. At the end of a gesture
  the pending value is written at the time it arrived, even inside the 240-unit window: the
  last value of a gesture is never lost.
- A value equal to the last written value of that controller is not written.

So one controller cannot add more than two events per 16th in a continuous sweep (one per 1/32),
and a sweep's final value always lands.

### 14.3 Design rule: MIDI out timing first

MIDI out timing is the top priority. The control loop sends MIDI (SPEC 9.6: the send call is
control-task only and untimestamped), so the control loop's period sets the output jitter during
playback, not only the timestamp error while recording. The Task 11 diagnostic build measures
the period on the device (BUILD.md 24, the hardware checklist). If those numbers show a band
wider than about **2 ms** (the spread of MIDI out against the song's grid, or the control loop's
maximum period under load), reducing it becomes the first item of Phase 1, ahead of external
clock follow.

### 14.4 Task 11 as built (Phase 0 preparation, no feature code)

- **Full backup and restore** in the workbench (docs/BACKUP-FORMAT.md, format version 1; BUILD.md
  24.2): one file, transfer commands only, validated before any write, verified after.
- **The diagnostic build** (`DIAG=1`, tabby-v03.3-diag; BUILD.md 24.3): counters for the
  assessment's L.1, L.3, L.4 and L.5 read over USB (command 25), transfer kind 8 for the device
  and session settings, the storage lines on ACTIONS. 1888 bytes; margin 637.
- **The layout setting and the probe** (`USER_BYTES=N`, tabby-p0-probe64 = DIAG=1 +
  USER_BYTES=471040; BUILD.md 24.5, FLASH-BUDGET 3.5): the USER size comes from one build option for
  the packagers, the SDK layout record, the app and the simulator. The normal build keeps 536576
  and the same code.
- **tools/linux/midi-monitor.py** and the timing test songs (BUILD.md 24.4).
- The hardware checklist that decides Phase 0: BUILD.md 24.6.

## 15. Device rules (2026-11-08, Task 11C; in force until the user changes them)

After the 2026-11-08 loader incident (BUILD.md 25.3a–c and 25.5) the user set these rules. They
override the Task 11B permission to install unattended.

1. **No unattended installs or device writes.** The agent may build, test in the simulator and
   on the host, and read from the device (identity, capability, device info, capabilities, song
   storage status, backups, the diagnostic counters without reset). Every install, restore,
   erase, save, delete, counter reset or song-storage change on the device is done by the user, or
   with the user present at the device.
2. **No flashing from the NUC** until its USB problem is understood (BUILD.md 25.5). Installs are
   done from the user's MacBook. Read-only checks from the NUC are allowed
   (tools/linux/hw/usb-readback.py).
3. The workbench never fails without saying why: when no MIDI port matches, it shows the
   ports the browser sees and a message, and sends nothing (BUILD.md 25.5, item 1).

## 16. Task 12 — Phase 0: make room (tabby-v04.0, 2026-11-08)

### 16.1 The storage move is the normal layout (A1)

- **Layout.** USER is 471040 bytes from tabby-v04.0 (base 0x8C000): 16 project sectors and the
  project staging sector, then the song region of 97 sectors (staging, 16 song records, **80 block
  sectors**, 326080 bytes of block pool), then the tuning and session sector at 0xFE000. The old
  536576 layout (V01, V16, tabby-v03.x) is still built with `USER_BYTES=536576` for tests and the
  way back. The code image does not move; the hard app limit grows from 453921 to 519457 bytes.
- **What the move costs once** (installing tabby-v04.0 over 536576 firmware): every project slot,
  the device and session settings in slot 16, and the songs are gone until restored from a full
  backup; Bluetooth pairings are lost (BTIF moves 64 KiB up); the tuning sector is kept. The full
  backup (docs/BACKUP-FORMAT.md) restores onto the new layout through transfer kinds only.
- **OLD DATA.** If the boot scan finds song-region sectors that are not song-formatted or erased,
  song storage reports OLD DATA: songs cannot be written or played. The device says so on boot (six
  seconds) and on the SONG page, and ACTIONS offers ERASE OLD DATA, which asks ERASE OLD DATA? and
  runs only on a second SAVE. The workbench shows the same state after it connects the project
  library and offers "Erase old data…" behind a confirmation dialog (command 28). Nothing is erased
  without confirmation; projects, tunings and settings are never touched by it.
- **Commands (transfer protocol, app/transfer.c).** 27: the Classic Tabby capability reply
  `{version 1, flags u16, USER size u32}`; flags bit 0 = flash writes refused while the transport
  runs (16.3), bit 1 = command 28. 28 `"ERASE"`: ERASE OLD DATA, refused unless OLD DATA and while
  the transport runs. Reply code 76 (`GROOVE_PROJECT_PLAYING`, -12) = refused because the transport
  runs. New commands, so pages older than tabby-v04.0 never see them.
- **What a factory V16 restore overwrites.** `restoreFactory` (sdk/WebUpdate.js) writes 40960 bytes (10
  sectors) at the fixed flash range 0xF4000..0xFDFFF, the V16 "USR" resource. In the 471040 layout USER
  starts at 0xFF000 - 471040 = 0x8C000; the project sectors and the project staging sector take 17 sectors
  (0x11000), so the song region starts at 0x9D000 and has 97 sectors, ending at 0xFE000 where the tuning
  sector begins (not touched: the range ends at 0xFDFFF). Region sector n is at 0x9D000 + n * 0x1000, so the
  range is region sectors 87..96. Region sector 0 is the staging journal, 1..16 the song records and 17..96
  the 80 block sectors (SONG_FIRST_BLOCK_SECTOR 17), so the restore overwrites **block sectors 70..79, the
  last 10 of 80**, and nothing else of the song region. In the old 536576 layout the same range is region
  sectors 103..112 of 113, block sectors 86..95 of 96 (the text before Task 14). Any song whose blocks lie
  there is damaged: export songs first.
- **Workbench.** The library defaults to the 471040 layout until command 21 answers; the importer's
  storage estimate uses the 80-sector pool; the update tab tells the user that this release moves
  storage (and that a 536576 build moves it back).

### 16.2 Removals: the stock step editor (A2)

Removed from the device (decision: Task 10 assessment section J, with the user's choice of
2026-11-08 to keep the settings that are not pattern data): STEPS 1/7 BASIC, 2/7 STEP DETAILS,
4/7 LOCKS, the STEP_EDIT and RHYTHM pages, REC (step entry while stopped, recording while playing,
the REC+K1 seek, the MMC record strobe as a record start), the count-in and CLICK (metronome; they
return in Phase 5 under decision 7), pad-step mode (SHIFT + PAD / STEP), HOME K3 STEP, and the
ACTIONS entries STEP DETAILS, RHYTHM / RECORD, COPY / PASTE / CLEAR STEP / PAGE / TRACK, REPEAT TO
32 / 48 / 64 and UNDO / REDO. Kept: the ARP_EDIT page and the arpeggiator, the factory DX7 bank,
the stock pattern as project data (it loads, saves and plays with the project; drum / melody swaps
still clear incompatible steps and HOME + SAVE still undoes), and every page number (STEP_EDIT 13
and RHYTHM 14 are refused like the other removed pages).

**Where each remaining setting lives (the only documented place for each):**

| Setting | Control | Page |
| --- | --- | --- |
| BPM | K4 | HOME (overview); HOME + SEQ taps it on any page |
| CLOCK (INT / MIDI) | K1 | SYNC / MIDI (SEQ on any page) |
| CLK IN (AUTO / USB / BLE; DIN receives nothing, 17.6) | K2 | SYNC / MIDI |
| SWING (project) | K3 | SYNC / MIDI |
| SEQ OUT (OFF / ON / CLOCK) | K4 | SYNC / MIDI |
| KEY OUT (ON / OFF) | PRESETS | SYNC / MIDI |
| IN CH, OUT CH, SEQ (LOCAL / BOTH / MIDI), OUT PORT | K1 to K4 | MIDI TRACK (SHIFT + SEQ on any page), per selected track |

SEQ always opens SYNC / MIDI (it no longer taps the tempo on EFFECTS 3/3); SEQ + EDIT pressed together open
ACTIONS (holding SEQ alone does not, 17.8), whose entries are COPY TIMBRE, PASTE TIMBRE, STOP ALL / REWIND, ERASE OLD DATA, SONG MODE,
COMPACT SONG STORAGE and SEND SETUP. REC shows NO REC IN THIS VERSION. The web simulator's step grid
and its step-details / rhythm shortcuts are gone (sim_step refuses every edit). Bytes freed:
FLASH-BUDGET 17.

### 16.3 No flash write while the transport runs (A3)

"Transport running" = a song plays or is stopping, or the stock pattern sequencer runs (internal
or external clock): `ct_transport_running()` in app/song.c, the one test every path uses. While it
is true:

| Write | Device | Workbench (writeGuard, command 27 out[7]) | Device reply if sent anyway |
| --- | --- | --- | --- |
| project SAVE / save slot | STOP TO SAVE (project.c refuses) | "The device is playing; nothing was written" | command 7: 76 |
| song upload, song delete (kinds 5, 6, 7) | - | refused before the first byte | command 3 begin and command 5 finish: 76 |
| device settings (kind 8) | - | refused | 76 |
| Bluetooth settings, forget pairs (command 24) | - | refused | 76 |
| ERASE OLD DATA | STOP TO ERASE / COMPACT | refused | command 28: 76 |
| COMPACT SONG STORAGE | STOP TO ERASE / COMPACT | (no workbench button) | diag command 26 {2} / {3}: 76 |
| full restore | - | refused before anything is written | (its parts answer 76) |
| deferred settings and session saves (panel, track, clock, output changes) | applied at once, saved after the stop | - | - |
| an erase or compaction already running | pauses, resumes after the stop | - | - |

Reads stay allowed (downloads, song status, slot names, capability replies, counters). Uploads of
the RAM kinds 0-3 (workspace, FM patch, timbre) stay allowed: they reach flash only through command
7. Tests: tests/workbench/backup.mjs v0.4 section 8 (every row above while playing and while
stopped, reads while playing, the deferred save, the erase pause).

### 16.4 Timing counters and the control-loop profile in every build (A4)

The Task 11 counters (L.1 control loop, L.3 flash erase and write, L.4 key-to-router latency, L.5
scan ISR, the screen timing of Task 11B), the workbench's Diagnostics panel (command 25), transfer
kind 8 (device settings in the full backup) and the ACTIONS storage lines are in every build from
tabby-v04.0. The diagnostic build (`DIAG=1`) adds only command 26 (remote ACTIONS and song commands
for unattended runs).

**Control-loop profile (command 25 requests 4 and 5).** One control pass = from one SDK call of
`groove_midi_poll()` to the next. Each app hook the SDK calls is a section, timed exclusive of
the hooks it calls, summed per pass, kept as mean and longest per pass, with its call count:

| Section | Hook | What it is |
| --- | --- | --- |
| router | `groove_midi_poll` / `ct_midi_flush` | the MIDI router's sends to the SDK's output queues (also the app's own flushes) |
| song | `song_poll` | song scheduling in the control task (decode ahead, stops); notes are clocked by the audio thread and sent by the router |
| storage | `song_storage_poll` | the boot scan, a confirmed erase, a compaction |
| screen | `groove_screen_control` | panel input handling, pages, the LCD painter |
| panel | `fm1_controls_read` | the scan queue (keys, pads, encoders), button and pad LEDs |
| transfer | `groove_transfer_poll` | the workbench protocol |
| project | `groove_project_poll` | restores, deferred settings saves |
| SDK | (the rest of the pass) | the SDK's own work between the hooks, including its MIDI input processing |

MIDI input arrives in the SDK's routing task (`fm1_app_midi_received`), outside the pass; it is
counted apart (calls, mean, longest). L.1 keeps its Task 11 meaning (the period between any two
router flushes) so the old numbers stay comparable; the pass period is the profile's.

### 16.5 Permanent build pages and the stale-loader rule (A5)

1. Every published build has a page at `https://seattleuser0.github.io/classic-tabby/builds/<tag>/`
   that is never removed, and `builds/index.json` lists every build: tag, build id, loader tag
   (`ota-SMK37` + the first 16 hex digits of the build id, the USB name of the update loader while
   it waits for that build), page path, date, source archive, note. `make publish` adds the new
   build by itself (BUILD.md 26.5; tool tools/linux/builds-index.py).
2. The workbench never accepts a loader whose tag is not its own build, with or without force
   flash, and never lets such a loader run into the reconnect timeout. At Connect, and while
   waiting for the device to re-enumerate during an install, it reads the tag, looks it up in
   `builds/index.json` (relative to its own address) and tells the user which build the loader is
   waiting for, with a link to that build's page (`LOADER_MISMATCH`: tag known, tag unknown, or
   the list unreadable, each with its own message). Nothing but the identity query is sent to
   that loader, and its port is closed.
3. The install page of a build is therefore the way to finish that build's interrupted install:
   close the other tab, power-cycle the device if the loader does not answer, open the page the
   message links to, Connect, Start update (BUILD.md 26.6, the install steps).
4. A loader reporting `ota-SMK37` + 16 zeros (entered without command 50, e.g. by a forced
   write) names no build. Every page from the next release on treats it as the vendor's
   unidentified loader: the model-confirmed resume ("SMK-37 Pro" asked before writing), then the
   build id check after the restart. Any nonzero tag that is not the page's build is still rule 2.
   tabby-v04.0's own page predates this; `builds/tabby-v04.0-recover/` is its recovery page
   (BUILD.md 26.7).
5. Force flash is only ever turned on by the user, with the checkbox inside "Migration, factory
   restore and forced updates". The page never offers it after a timeout: the identity and
   capability queries are retried (4 tries) and, on an Open identity that still does not answer,
   Connect says the device did not answer and to power-cycle it (`NO_REPLY`). Migration is
   offered only for a non-Open identity (factory V16), and then as that checkbox, not a button
   (BUILD.md 26.8).

## 17. Task 13 — Timing fixes (2026-11-10)

### 17.1 The control-pass budget (option B, every build from tabby-v04.1)

- The SDK runs one control pass per 10 ms timer tick and drops a tick while a pass still runs or
  waits (BUILD.md 26.9 B2). A pass must therefore end before the next tick.
- Order in a pass: the router flush (groove_midi_poll, the SDK's first hook), then song scheduling
  (song_poll), then song storage, then the rest. MIDI sends and song work are never deferred.
- Budget: CT_PASS_BUDGET_TICKS = 6 ms of wall time since the pass began (app/diag.h). Wall time
  includes the audio thread's share of the CPU, which is what decides a missed tick.
- Deferrable work asks the budget first: the LCD page compose (at most 2 x 60 ms late past its 33 ms
  frame), each LCD band (started only if the last band's time still fits; one band per 60 ms always
  goes, in plain rotation, so a pass that is always late still repaints the whole page), and a new
  workbench request (at most 4 passes in a row; cached retries and MMC are never deferred).
- The router is flushed after every LCD band, so a note the audio thread queues while the screen
  paints leaves at once instead of at the next pass.
- Panel input is never deferred (apply_controls runs every pass); only the picture can be late.
- Measured on the device through command 25 page 6: busy time per pass (start to the end of the
  screen hook), passes busy over 10 ms, lost ticks (pass periods over 15 ms), deferrals per kind.

### 17.2 CPU GUARD (SDK, read from the disassembly; not changed by Task 13)

- What it is: the SDK engine's per-audio-block render budget (`audio_budget`, functions
  `audio_track_begin`, `audio_track_end`, `audio_finish` in libfm1_engine.a). Each block (128 frames,
  2.90 ms) has a render budget in timer ticks (52244 or 59210 per render group); each track's render
  gets a deadline (`fm1_render_begin` / `fm1_render_end`).
- When it trips: a track whose render passes its deadline, or a block whose total render time passes
  its budget (and then the heaviest track).
- What it does: lowers that track's voice limit by one (not below 1), steals the extra voices at
  once (`voice_limit`), declicks the block (`fm1_declick128`) and counts one "adapted". After 344
  blocks in a row under 3/4 of the budget (about 1 s) it gives one voice back, up to the track's
  capacity. The screen shows CPU GUARD - VOICES ADAPTED when the count rises (app/screen.c, checked
  every 500 ms).
- During play: yes, it changes behaviour, but only the internal sound: fewer voices on the heavy
  tracks (stolen notes, shorter tails) until the load drops. It does not touch MIDI out, the song
  timing or the control pass directly; its indirect effect is that a loaded audio thread leaves
  less CPU to the control task, so passes run longer (12.5 ms mean with eight lines in 26.9 B1).

### 17.3 No extra control passes from the audio interrupt (Step 2)

**Superseded 2026-11-10 (Task 15, section 18; evidence in BUILD.md 28.4).** The rule below stays in
force for the normal build until the diag build tabby-v04.2-diagA2 has been measured.

- The song tick runs inside the audio interrupt (`fm1_audio_irq`, IRQ 11). App code there must not
  call `fm1_control_request` or any other SDK call that posts to a task queue: the post looks the
  task up by name under `vTaskSuspendAll` and may yield directly (BUILD.md 27.2).
- Consequence: notes leave at the next control pass (10 ms timer) or at an in-pass flush (after each
  LCD band, 17.1). The 4 ms target needs an SDK change; option A stays unbuilt.

### 17.4 Control names: firmware name -> printed name or position (Task 13 Step 4; sticker map starts here)

Rules (the user's, 2026-11-10): knobs by their printed numbers K1-K8 from the left; a button whose
printed label is not confirmed is described by its position, never by a guessed name. All screen
text, Help (the workbench manual and its translations), the panel shortcut texts, the READMEs and
the install-file template (docs/releases/INSTALL.template.txt) follow this table. On the LCD the
4th left button is "4TH LEFT BTN" (the full phrase does not fit a 38-character line).

Knobs (`fm1_controls.encoders[]` index; physical id from app/smk37_controls.c `encoder_map`):

| Firmware name | Index | Physical id | Printed / to use | Status |
| --- | ---: | ---: | --- | --- |
| K1 | 2 | 0 | K1 | confirmed by the user |
| K2 | 3 | 1 | K2 | confirmed by the user |
| K3 | 4 | 2 | K3 | confirmed by the user |
| K4 | 5 | 3 | K4 | confirmed by the user |
| SELECT | 0 | 4 | K5 | confirmed by the user (used for the song on 2026-11-09) |
| PAGE | 1 | 5 | K6 | confirmed by the user |
| PRESETS | 6 | 6 | K7 | confirmed by the user |
| MASTER | (ADC) | 7 | K8 | confirmed by the user |

Buttons (physical id = position in sdk/Simulator.js's panel map; left group = ids 0-5, right group =
ids 6-17; firmware name = the FM1 button app/screen.c tests, through `button_map`):

| Physical id | Firmware name | Printed / to use | Status |
| ---: | --- | --- | --- |
| 0 | (SHIFT, panel code) | SHIFT | confirmed by the user |
| 1 | (FADER BANK, panel code) | FADER BANK | confirmed by the user |
| 2 | HOME | HOME | confirmed by the user |
| 3 | SAVE | **the 4th button in the left group (after SHIFT, FADER BANK, HOME)**; LCD "4TH LEFT BTN"; workbench panel "BTN 4" | not SAVE (user, 2026-11-09); printed label unknown |
| 4 | OCT_DOWN | OCT - | from the workbench panel map, not confirmed |
| 5 | OCT_UP | OCT + | from the workbench panel map, not confirmed |
| 6 | ARP | ARP | from the workbench panel map, not confirmed |
| 7 | (PAD / STEP, panel code) | PAD / STEP | from the workbench panel map, not confirmed |
| 8 | SCL | SCL | from the workbench panel map, not confirmed |
| 9 | ENV | ENV / LFO (text says ENV) | from the workbench panel map, not confirmed |
| 10 | GLO | MIX | from the workbench panel map, not confirmed |
| 11 | (BT, panel code) | BT | from the workbench panel map, not confirmed |
| 12 | HOME (SHIFT: source page) | HOME / SRC | from the workbench panel map, not confirmed |
| 13 | EDIT | EDIT | from the workbench panel map, not confirmed |
| 14 | FX | FX | from the workbench panel map, not confirmed |
| 15 | SEQ | SEQ | confirmed by use (the user opened ACTIONS with it) |
| 16 | PLAY | PLAY | confirmed by use |
| 17 | REC | REC | from the workbench panel map, not confirmed |

The firmware's LFO button (FM1 id 5) has no physical button on the SMK-37.

### 17.5 The Help and panel text is held to the removed-features list (Task 14, 2026-11-10)

The workbench's Help (the manual tab), the simulator's panel tooltips and status lines, the device
update help, the READMEs, the MIDI guide and the install template
may not name a page, mode, action, flow or control name that tabby-v04.1 does not have. The list of
banned phrases is tests/workbench/help-banned-phrases.json; the test is
tests/workbench/help-banned.mjs (in `make workbench-test`). A phrase is added there whenever a feature is
removed (16.2 is the list so far: STEP DETAILS, LOCKS, RHYTHM/REC, SYNC / LOOP, REC and its count-in and
metronome, pad-step mode, copy / paste / clear / repeat, the sampler and its bank, "Enable force flash and
reconnect"). A sentence that says a thing was removed is allowed by an `allow` fragment of that file, or
sits in a region marked `data-removed-ok` (the Help chapter 00, "What changed in tabby-v04", and the
removed-features paragraph of chapter 15). (The translation table that once needed this care is gone: 17.7.)

What is checked against the firmware when text changes: the control names against 17.4; K1-K4 on HOME are
K1 level, K2 engine, K4 tempo (K3 does nothing); SEQ opens SYNC / MIDI on every page and HOME + SEQ taps
the tempo everywhere (no tap on FX DELAY); SEQ + EDIT opens ACTIONS (a long SEQ press does not, 17.8); HOME + the
4th left button undoes the last change; a song block is 64 steps with up to 4 notes starting on a step
(app/song_storage.h `SONG_BLOCK_STEPS`, `SONG_NOTES_PER_STEP`; v2 blocks add a start offset and a length
to each note but not more notes per step), so the song help's "64 steps, at most 4 notes per step" stays.

### 17.6 The TRS jack is output only; CLK IN DIN receives nothing (Task 14, 2026-11-10)

Evidence (read from the source and from the disassembly of build/pro/sdk.elf, nothing tried on hardware):
- `fm1_midi_input_ports` (0x2024f82) is `r0 = 6`: input ports USB (bit 1) and BLE (bit 2); the DIN bit is not set.
- `fm1_io_trs_midi_enabled` (app/board/panel.c, 0x2006058) returns 0 and says "PH8 is an encoder input on both
  boards, with no fitted TRS MIDI RX". The SDK's `fm1_io_start` stores that byte and the SDK header
  (sdk/include/fm1_device.h) names it "the fitted TRS MIDI receiver".
- `smk37_uart_start` (0x2024f90) calls `smk37_gpio_set_uart1(-1)` (UART1 receive pin mapping off), maps the
  transmit function and installs only `midi_tx_irq`; the SDK has smk37_uart_start / write / stop / ready and
  no receive path (the uart_midi_rx buffers have no reader).
- app/midi_router.c: CLK IN DIN (config.thru bits 5..6 = 3) accepts clock only from source FM1_MIDI_DIN, which
  the SDK never delivers. With CLOCK = MIDI and CLK IN = DIN the device waits for a clock that cannot come.
So the TRS jack cannot be a MIDI input by cable or by setting; it is not switched at all. A DIN device's
clock reaches the SMK-37 only over USB or Bluetooth (MIDI guide section 14, not tried on this rig).
The firmware's own screen line "K2 CLK IN  AUTO USB BLE DIN" is in the left-to-build list (BUILD 30.3).

### 17.7 English only (Task 14, 2026-11-10; the user's decision)

Classic Tabby is English only. The workbench (sdk/Update.html.in, sdk/Simulator.js, sdk/WebUpdate.js,
sdk/Samples.js) carries its text in English at the source. There is no translation table, no language
selector and no stored language preference (`fm1-language`, `?lang=`); sdk/I18n.js is a pass-through
(`t`, `text`, `attr`) kept so that the build and the call sites do not change. The Chinese Help chapters
and README.zh-CN.md are deleted; the manual's chapters 13 to 21 (upstream's) are the converted English text.
The firmware's screen text was already English capitals (app/ untouched).
- Kept as upstream wrote them, whatever their language: LICENSE.md, THIRD_PARTY.md and the notices that the
  page embeds from them (the built page therefore still contains CJK characters in its licence texts).
- Kept Chinese on purpose, because they match pages that were published in Chinese: the anchors of
  tools/linux/recover-page.py (the tabby-v04.0 recovery page is made from the published v04.0 page), the
  "源码与 SDK" alternative of the source-link patterns (tools/Build-Hosted.cjs, publish-pages.py,
  builds-index.py: pages up to tabby-v04.1 carry that link text) and the Chinese alternatives in
  tools/linux/hw/workbench.mjs (it also drives the older published pages).
- Guard: tests/workbench/help-banned.mjs fails on any CJK or fullwidth character in a user-facing string
  and in the workbench, web and release-facing source files, comments included; tests/workbench/
  manual-structure.mjs keeps the manual's shape (22 chapters, links, order, no language selector).
- A new user-facing string is written in English where it is used. Nothing goes into a table.

### 17.8 ACTIONS opens with SEQ + EDIT only; holding SEQ does nothing (found 2026-11-10 while writing the testing guide)

app/screen.c: the long-press test is `if (seq_down && page == STEPS && now - seq_ms >= 600U)`. The STEPS page no longer
exists (SEQ opens SYNC / MIDI), so holding SEQ never opens ACTIONS in tabby-v04.0 or v04.1; the other route,
`SEQ + EDIT` pressed together (either order), does. The simulator confirms it (hold SEQ 0.9 s: stays on SYNC / MIDI;
SEQ + EDIT: ACTIONS). Help, the install template, the README and the simulator tooltip said "hold SEQ about 0.6 s";
they now say "press SEQ and EDIT together", and `hold SEQ` and its variants are banned phrases. The firmware's own
line "HOLD SEQ: ACTIONS" on SYNC / MIDI (screen.c:1125) is wrong and is in the left-to-build list (BUILD 30.3).

HOME / SRC. With SHIFT held, the source page opens from the button the panel map calls HOME / SRC (physical id 12,
the 7th button of the right group after ARP, PAD / STEP, SCL, ENV, MIX, BT), not from the HOME in the left group
(id 2), which only opens the PRESETS list. Help, the README and the guide now say "SHIFT + HOME / SRC" and give the
position. The same button carries the SHIFT + K2 track-role choice (PROJECT / LIVE / OFF) on that page.

### 17.9 The testing guide and the tabby-v04.1.1 release (2026-11-10)

docs/TESTING-GUIDE.md (also kept as ~/Documents/Classic Tabby/TESTING-GUIDE.txt) is the musician's guide and numbered
checklist (T1 onward). Every device step was driven in the simulator build of the current source; a step that cannot
be (USB, flashing, outside gear, the workbench against a real device) carries "[not checked in simulator]".
tests/workbench/guide.mjs keeps its shape (sections, numbering, control names, no "hold SEQ"); the site shows it at
<site>/guide/ (tools/linux/guide-html.py, staged by publish-pages.py for the main page and every builds/<tag>/).
tabby-v04.1.1 carries the tabby-v04.1 firmware: app/ has no change since the tag and the app image differs only in
the build identity bytes (BUILD 31). The firmware is built with the display version forced to tabby-v04.1, so the boot
screen and the page badge keep saying tabby-v04.1; the page release is named by the tag and by Help chapter 00.

### 17.10 Standing testing rule (Task 16, 2026-11-11; the user's rule, in force until the user changes it)

Tests are run by the agent, unattended, over USB and the H4MIDI WC. The user never has to be present at
set times or press a button for a test. If a test needs a device action, a remote command is built for it
first (section 19.2: command 29). Installs from the NUC follow the hard limits of Task 16 (19.1), and only
then.

### 17.11 Pushed tags and builds/ pages are permanent (2026-11-12; the user's rule)

A tag that has been pushed is never moved and never deleted, and a `builds/<tag>/` page that has been published is never
replaced or removed: a build that was installed on a device needs its page as the recovery path. A fix gets a new tag
(the case that set this rule: tabby-v04.3 was thought faulty and tabby-v04.3.1 followed; the fault turned out to be a measuring error, 19.5). The only change allowed to a published builds/ page or its entry in
`builds/index.json` is a note line the user asks for (as on builds/tabby-v04.3/). Note lines are kept in
tools/linux/builds-notes.json and applied by tools/linux/builds-index.py on every publish (Task 17), never by hand in the
gh-pages checkout. A pre-release for a device test gets its own tag and page (`-rcN`).

## 18. Task 15 — Timing research (2026-11-10; nothing built)

- **17.3 is superseded as a finding, and stays in force as a rule until a diag build proves
  otherwise.** The reading in BUILD.md 28.2: this SDK's kernel masks all interrupts in its critical
  sections, defers the task switch to a soft interrupt, and its own interrupt handlers (the DIN
  transmit interrupt among them) post to task queues with the same call. A pass request from the song
  tick is therefore expected to be safe. No normal build calls it from the audio interrupt until the
  user approves Step 4 and the diag build has been measured.
- The app cannot create tasks or use OS signals (none exported). It can attach interrupts below 64,
  and TIMER5 (IRQ 63) is free.
- The SDK library is not modified (THIRD_PARTY.md grants copy, link and binary redistribution only).

- Recommended next step (BUILD.md 28.3, waiting for approval): the pass request from the song tick
  in a diag build behind a build flag, off in the normal build; goal 4 ms or less on one line (DIN).


### 18.1 Option A2 in the diag build tabby-v04.2-diagA2 (Step 4, 2026-11-10)

- Built only with `A2=1` (`-DCT_A2`). The normal build has no A2 code; its image equals tabby-v04.1
  except the build id.
- A2 is **off at boot** and lives in RAM. Switch: ACTIONS, last entry "A2 FAST MIDI: OFF / ON" (K1
  or K5 to choose, the 4th left button switches), or transfer command 25 request 8 (off) / 9 (on).
- With A2 on, the audio interrupt asks the SDK for a control pass (`fm1_control_request`) at the end
  of every audio block in which a MIDI event still waits in lane 0 or 1: at most one request per
  block, never a loop; a request the SDK drops is repeated by the next block.
- Counters, command 25 request 7 (48 bytes): on, audio blocks, calls, mean and longest call time
  inside the audio interrupt, retries, a six-bin histogram of the call time.
- Stop rule for the hardware run (the user's condition 6): any audio dropout, a rise in CPU GUARD
  trips, a stuck note or a USB MIDI error with A2 on ends the run and is reported.
- F + G (the TIMER5 release and the look-ahead) only after A2 is measured, and only if it is over
  4 ms.

### 18.2 Option A2 measured (Step 5, 2026-11-11; all figures measured, BUILD.md 28.6)

- One line (song 16), DIN: 12.34 ms spread with A2 off (option B alone), **3.67 ms with A2 on**;
  USB 12.29 and 3.68 ms. The remaining spread is one audio block (2.9 ms), the song tick's period.
- Eight lines (song 15), DIN, per line: 14.4..15.5 ms off, 3.8..6.5 ms on; all lines on one grid
  21.5 ms off, 12.4 ms on (USB 17.3 and 6.6 ms).
- Cost: 18 to 24 us per call inside the audio interrupt, longest 53 us; 49 to 64 calls a second;
  retries under 1 percent of calls. The control pass runs every 6.6 to 7.7 ms instead of 11.6 to
  12.7 ms.
- Audio: no engine underrun, no DMA overrun, no silent gap in the AUDIO4c recording, off or on.
  CPU GUARD trips about once a second on song 15 with A2 off (+97 in 100 s) and the same with A2 on
  (+100): the stop rule's "rise" is read against that baseline.
- No stuck note; USB and DIN carry the same notes.
- Soak with A2 on: about 13 hours in all, mostly idle on MIDI clock (1.9 million calls overnight,
  longest 55 us), no underrun, no DMA overrun. A song transfer and a project save while stopped
  behave the same with A2 on and off (the pass is held 100 and 217 ms by the flash writes either
  way); the device's content was equal before and after (full backups compared).
- Not covered: an hour of continuous song play with panel use (this build has no remote PLAY).
- A2 stays a diag-build option until the user decides; the normal build has no A2 code.


## 19. Task 16 — tabby-v04.2: fast MIDI by default and remote control (2026-11-11)

### 19.1 The overnight hard limits (the user's, Task 16)

- Installs from the NUC are allowed, one attempt per build, only through the normal update path of the
  build's published page (driven in Chrome), after a read-only USB soak of at least 2000 rounds with no
  error or timeout, and after the device identity is confirmed. Never force flash, never a factory
  restore, never the official Open V01, never the bootloader, key_mac or calibration. If an install stalls
  or fails: no more device writes that night, the device is left as it is, and the report says what
  happened and which recovery page is needed.
- Never modify the SDK binary; never send anything to M-VAVE or post outside our own GitHub repository.
- Never delete or overwrite a page under builds/; fetch gh-pages before every publish; every build gets its
  permanent builds/<tag>/ page and an entry in builds/index.json.
- A full backup before any release that is installed, kept. A storage format change (the v3 clip format)
  is built and tested on the host and in the simulator only; it is not released or installed without the
  user's review.

### 19.2 Option A2 is the normal build's default; remote control

- **A2 on at power-up** (app/midi_router.c). The ACTIONS entry "A2 FAST MIDI: ON / OFF" switches it for the
  session (RAM only); command 25 requests 7 (the page), 8 (off) and 9 (on) are in every build, and the
  workbench Diagnostics shows the counters (requests, calls per second, call cost, longest call, retries,
  histogram). tools/linux/build.py --no-a2 (Makefile A2=0) builds the tabby-v04.1 firmware.
- **F + G: not now** (decision, recorded on the user's instruction): option A2 alone brings one line to
  3.67 ms (measured, BUILD.md 28.6), under the 4 ms goal; the eight-line worst case (up to 6.5 ms) is mostly
  the DIN cable's own byte time and is fixed by the H4MIDI fan-out wiring, not by more firmware.
- **Command 29, remote control, in every build** (app/transfer.c; capability flag bit 2 of command 27).
  Data byte 0 is the operation; the reply is the status (12 bytes after the status code): version 1, screen
  page (app/screen.c enum), song state (0 stopped, 1 playing, 2 stopping), loaded song (255 none), playing
  row, queued jump row (255 none), A2 on, SHIFT held, a transport runs, bar (u16), ACTIONS entry selected.
  - {} / {0}: status. {1, song}: select (load) a song and show it on the SONG page; refused while playing.
  - {2} / {2, song}: PLAY the loaded song (or load and play); {3}: STOP; {4, row}: queue a jump (playing only).
  - {5, 0|1}: A2 off / on. {7}: release everything the command holds.
  - {6, kind, id, value}: inject a panel event: kind 0 button (physical id 0..17), 1 key (0..36), 3 pad
    (0..15), 4 encoder (0..7, signed detents). Value 0 releases; 1..127 presses. Press, hold and release are
    separate calls. A held control is released by itself 5 s after the last remote call.
  - **No operation writes flash.** The firmware's SAVE button (physical id 3, the 4th button in the left
    group) is refused with code 71, because it saves projects and confirms ACTIONS erase and compaction. A
    song select or play only reads flash. Other refused values also answer code 71.
- The simulator-level host tests (tests/host/smoke.c section 17) drive every operation through the real
  SysEx path and check the reported page, song state, A2 switch, MIDI output, the refusals, the SHIFT +
  HOME / SRC and SEQ + EDIT flows and the 5 s watchdog.
- tools/linux/hw/tabby_link.py v0.8: remote_status, select_song, play_song, stop_song, jump, set_a2, key,
  press, hold, release_all.

### 19.3 External clock follow in song mode (Task 16 Goal 3, decision 10; tabby-v04.3)

With CLOCK = MIDI (SYNC / MIDI, K1) the song no longer refuses to start: PLAY on the SONG page (or remote PLAY)
**arms** it (row 0 decoded, "ARMED: START?") and the master's transport takes over. The engine's own pattern
sequencer does not see the clock messages while a song is armed or following.

- **Pulses.** Each MIDI clock pulse (24 per quarter note) moves the song 80 units (1/6 of a 16th step). Between
  pulses the song moves at the pulse period estimated from the last pulses (smoothed over 8 pulses) and is nudged
  by a quarter of its phase error per audio block, capped at 28 units a block; so one block of arrival jitter is
  not note jitter, and a tempo change is followed within about 8 pulses.
- **Start (FA)**: from the beginning, at the first pulse after it (that pulse is position 0). **Continue (FB)**: from
  the held or stopped position at the next pulse; on an armed song from its position (the last SPP, or 0).
  **Stop (FC)**: note-offs for everything that sounds, the position is kept, the state is STOP BY MASTER; Stop always
  wins, in every state. Pulses after a Stop do nothing.
- **Song Position Pointer (F2)**, in 16th notes (steps, 480 units), accepted stopped and running: the control task
  decodes the row that holds the position (rows with their repeats and loops; a position past the end of a song
  that does not loop clamps to its last step), the audio thread restarts the frames there with note-offs first. A
  running song goes on at the next pulse; a stopped one waits for Continue. A start in the middle of a row sends no
  row events.
- **Clock loss.** No pulse for 3.5 pulse periods (about 3 missed pulses): the song stops advancing and sends
  note-offs (HOLD: NO CLOCK). Pulses back within 2 s without a Stop: it relocks and goes on from the held position.
  A gap of 2 s or more: LOST - CONTINUE; clock pulses alone never restart a LOST song, only Continue or Start do.
- **End of song.** At the last row the song stops and arms again, ready for the next Start. PLAY stops following.
  Switching CLOCK back to INT stops a following song.
- **Sources.** Over USB (CLK IN AUTO or USB) and Bluetooth. The TRS jack is output only (17.6); no DIN input exists
  (the CLK IN line no longer lists DIN). The song sends no Start, Stop or clock of its own while following.
- **Status.** The remote status (command 29) carries the follow state (byte 12: 0 off, 1 armed, 4 running, 5 held,
  6 lost, 7 stopped); song_status.follow in the firmware; the SONG page prints it.
- Rules kept from the other tasks: nothing here writes flash; a following song counts as a running transport
  (STOP TO SAVE applies). Every internal-clock path is unchanged (tests/host/smoke.c sections 7 to 15).
- Tests: tests/host/smoke.c section 18 (arm, start, first pulse, the step-4 note on its pulse, 120 -> 90 -> 150 BPM,
  hold, relock, LOST, pulses alone, Continue, Stop, SPP stopped and running, Start from the middle, song end arms
  again, PLAY leaves follow); tools/linux/hw/run-follow.py drives the device (BUILD.md 33).

### 19.4 tabby-v04.3.1 (2026-11-12): replies over USB with CLOCK = MIDI (withdrawn: 19.5)

**Withdrawn 2026-11-14 (19.5, BUILD 36.5):** the finding below was a fault of the measuring tool on the NUC, not of the
device. The pusher rule is removed in tabby-v04.4; the text stays as the record of what tabby-v04.3.1 contains.

- Found on the device (BUILD 35): the SDK transmits the last message written to the USB port only when a later write to
  that port follows. With CLOCK = MIDI (or clock out off) no clock follows, so SysEx replies never left: the workbench,
  the tools and Firmware Update saw a dead device, in every release up to tabby-v04.3.
- Rule: every app write to a MIDI port goes through `ct_midi_send_port`; when no clock is being sent on USB, each of the
  four control passes after a USB write sends one 0xF9 (undefined real time) to USB. Nothing is added while the clock runs.
- Rule: no A2 request while an app flash erase or write is in progress (`ct_flash_busy`; the request path is flash code,
  BUILD 34). Not seen to trigger on the device; kept as a guard.
- tabby-v04.3 (tag and builds/tabby-v04.3/) stays as it is, marked "do not install" (17.11).

### 19.5 tabby-v04.4 (2026-11-14): MIDI out at due times (F + G); the USB pusher withdrawn

- Every event the audio thread queues for MIDI out (song notes, row events, the MIDI clock, pattern and arpeggio notes) carries
  a due time on the 24 MHz counter: the start of its audio block + one block + its place in the block. TIMER5 interrupts every
  0.5 ms and asks for a control pass when the next event is due within 0.25 ms; a pass sends what is due and nothing else.
  MIDI out is therefore one audio block (2.9 ms) later than the engine's block, the same for every event (BUILD 36.1).
- What a pass sends to one port goes to the SDK in one call (one burst).
- The screen does not start a band while an event is due within that band's time; at least one band goes every 60 ms.
- A follow song (19.3) runs one block ahead of the master's pulses while this is live; the block that begins a run sends at once.
- "A2 FAST MIDI" (ACTIONS, remote op 5) switches all of it. If the timer does not tick, a block falls back to A2 as in 19.2.
- Command 25 request 10: the F + G page (56 bytes). The remote status is 14 bytes ([13] CLOCK).
- 19.4 is withdrawn: the device never held its replies (BUILD 36.5). `ct_midi_send_port` stays the one way to a port; nothing is
  added to the stream. The `ct_flash_busy` test stays (one load); the SDK masks every interrupt during flash operations anyway
  (BUILD 36.2).
- Target and result (BUILD 36.6): one line under 2 ms, eight lines under 3 ms per line, DIN and USB, on OVERVIEW, STEPS and ACTIONS.

### 19.6 tabby-v04.5 (2026-11-14): v3 clips play from their event lists; rows to 128 steps

- Block payload format 2 is the v3 clip (docs/CLIP-V3.md): a 16-byte header and up to 512 events of 6 bytes sorted by time
  (notes with 16-bit length, CC, program, bend, pressure, step modifiers), 1 to 128 steps, an optional program and bank.
- A v3 clip the v2 grid can hold plays through the grid, byte-identical to v2. Any other plays from its event list (the
  scheduler cursor, `scan_v3`): a binary search to the block's window, events of one time in list order, controller events
  on the track's channel without a copy to the internal engine, probability per anchor step from the step modifiers.
- The clip header's bank and program go out once when a track enters the clip, before its first events.
- A row is 16 to 128 steps (multiples of 16). The firmware reads v1, v2 and v3 blocks and never rewrites a song.
- Transfer kind 9 (download only): one block as stored, format byte first. Kind 6 is unchanged (decision B). Capability flag
  bit 3 announces all of this; the workbench refuses to write v3 clips or long rows to firmware without it.
- The importer writes a v3 clip only when a block needs one; the full backup, the .tabby file and the song read carry v3
  clips (the block's `format: 2`).
- RAM: a decode buffer is the larger of the grid and the event list (3088 bytes): the runtime heap is 166220 bytes against
  194956 in tabby-v04.4 (measured on the device build; the build's minimum is 49152).

