# Classic Tabby — Specification

Version: 0.65
Revision log:
- v0.65, 2026-11-19: 17.18 the user's order of 2026-11-19 (the screen must be readable); 19.30 tabby-v1.1.
- v0.64, 2026-11-18: 19.29 tabby-v1.0.2 (EVENT LEAD, a song setting; OFF by default).
- v0.63, 2026-11-18: 19.28 tabby-v1.0.1 (row events at every entry of a scene in a two-scene loop).
- v0.62, 2026-11-18: 17.17 the user's answers of 2026-11-18 (evening): pad rows confirmed, the timing question first, tabby-v1.0 without new features; 19.27 tabby-v1.0.
- v0.61, 2026-11-18: 19.26 tabby-v04.23 (the step loop while held).
- v0.60, 2026-11-18: 19.25 tabby-v04.22 (NOTE REPEAT repeats; the focus switch on KNOB BANK + NOTE REPEAT).
- v0.59, 2026-11-18: 17.16 the user's answers of 2026-11-18 (pad rows, stickers of 6 point that cover the dead strip, the order of the rest, NOTE REPEAT); 19.24 tabby-v04.21.
- v0.58, 2026-11-18: 19.23 tabby-v04.20 (DIRECTION per clip).
- v0.57, 2026-11-17: 19.22 tabby-v04.19 (STEP SIZE per clip).
- v0.56, 2026-11-17: 17.4 rewritten: every control by its printed word (the user's rule; the photograph of the unit); 17.15 the photograph arrived; 19.21 tabby-v04.18.
- v0.55, 2026-11-17: 19.20 tabby-v04.17 (SHUFFLE and PLAY QUANTIZE per clip; CLIP SETTING in three pages).
- v0.54, 2026-11-17: 17.15 the flash reserve (15 KB) and the user's answers of 2026-11-17 evening; 19.19 tabby-v04.16 (a scene deleted and moved, a stop takes an armed take off, the printable manual).
- v0.53, 2026-11-17: 19.18 tabby-v04.15 (TRANSPOSE per clip, DELETE CLIP); docs/MC707-PARITY.md v0.2 is the worked list.
- v0.52, 2026-11-17: 17.4 the words printed on the buttons, from the manufacturer's drawing; docs/STICKERS.md.
- v0.51, 2026-11-17: 17.12 one session releases; 17.13 the release flow (release candidate on the device, then
  promote); 17.14 songs saved on tabby-v04.10 or later and older firmware; 19.17 tabby-v04.14 (the backup names a
  song it cannot read, clip lengths and chains survive the workbench, CLICK LEVEL, the controller numbers).
- v0.46, 2026-11-16: 19.12 tabby-v04.9.3 (the flash part page, command 25 request 11; report only).
- v0.45, 2026-11-16 (Goal 6, second step): 19.11 tabby-v04.9 (real-time recording); 14.2 amended: the cap is 512 events,
  because a block must fit one 4096-byte storage sector.
- v0.44, 2026-11-16 (Goal 6, first step): 19.10 tabby-v04.8 (the clip editor and the STEP page); 14.2 note on the cap as built.
- v0.43, 2026-11-16: 19.9 tabby-v04.7.1 (clips reserved while stopped, the two mutes; the user's answers of 2026-11-16).
- v0.42, 2026-11-14 (Task 17 Goal 4): 19.8 tabby-v04.7 (the CLIPS page, clip launching by place, song mute; the control
  map is docs/CONTROL-MAP.md).
- v0.41, 2026-11-14 (Task 17 Goal 3): 19.7 tabby-v04.6 (song record version 3, scenes, the master cycle).
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

> **Amended 2026-11-16 (tabby-v04.9): the cap is 512 events, not 768.** A clip is one block record in song storage, and
> a block record must fit one 4096-byte sector (20 bytes of sector header, 6 of record header: 4070 bytes of payload at
> most, 678 events). 768 events are 4624 bytes and cannot be stored without blocks that span sectors, a change to the
> storage format that is not planned. The clip format was released in tabby-v04.5 with 512 (3088 bytes). Everything
> below applies with 512 in place of 768; the screen says `CLIP FULL - 512 EVENTS - REC STOPPED`. The 768 reasoning is
> kept as written for the record. In practice: eight bars of four-note chords on every 16th fill a clip with no room
> for a controller; real material is far below that (the densest fixture track has about 52 notes per 8 bars).

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

### 17.4 Control names: every control by the word printed on it (the user's rule of 2026-11-17; tabby-v04.18)

Rule: all screen text, Help, the guide, docs/CONTROL-MAP.md, docs/STICKERS.md, the READMEs and the workbench's panel
drawing call a control by the word printed on the SMK-37. The printed words were read from the user's photograph of
the unit (2026-11-17, ~/Documents/Classic Tabby/panel.jpg) and agree with the user's own reading and with the drawing
in M-VAVE's manual. The firmware's source, the remote protocol and the test tools keep the firmware's names; this
table is the bridge. Earlier rule (2026-11-10, replaced): a button whose printed label was not confirmed was described
by its position ("the 4th button in the left group").

Sections of this document and of docs/BUILD.md written before 2026-11-17 use the firmware's names; they are history
and are not rewritten.

Knobs (`fm1_controls.encoders[]` index; physical id from app/smk37_controls.c `encoder_map`); printed K1 to K8:

| Firmware name | Index | Physical id | Printed, and used everywhere |
| --- | ---: | ---: | --- |
| K1 | 2 | 0 | K1 |
| K2 | 3 | 1 | K2 |
| K3 | 4 | 2 | K3 |
| K4 | 5 | 3 | K4 |
| SELECT | 0 | 4 | K5 |
| PAGE | 1 | 5 | K6 |
| PRESETS | 6 | 6 | K7 |
| MASTER | (ADC) | 7 | K8 |

Buttons (physical id = position in sdk/Simulator.js's panel map; left group = ids 0-5 under the screen, headed PAD
BANK on the panel; right group = ids 6-17, two rows of six; firmware name = the FM1 button app/screen.c tests, through
`button_map`; tool name = tools/linux/hw/tabby_link.py PANEL):

| Physical id | Firmware name | Tool name | Names used before tabby-v04.18 | Printed, and used everywhere |
| ---: | --- | --- | --- | --- |
| 0 | (SHIFT, panel code) | SHIFT | SHIFT | **KNOB BANK** |
| 1 | (FADER BANK, panel code) | FADER_BANK | FADER BANK | **FADER BANK** |
| 2 | HOME | HOME | HOME | **<** |
| 3 | SAVE | (refused by the device on purpose) | the 4th button in the left group, the 4th left button, 4TH LEFT BTN, BTN 4 | **>** |
| 4 | OCT_DOWN | OCT_DOWN | OCT - | **OCTAVE-** |
| 5 | OCT_UP | OCT_UP | OCT + | **OCTAVE+** |
| 6 | ARP | ARP | ARP | **ARP** |
| 7 | (PAD / STEP, panel code) | PAD_STEP | PAD / STEP | **NOTE REPEAT** (from tabby-v04.22 it repeats notes; the focus switch is KNOB BANK + NOTE REPEAT, 19.25) |
| 8 | SCL | SCL | SCL | **SCALE** |
| 9 | ENV | ENV | ENV, ENV / LFO | **CHORD** |
| 10 | GLO | GLO | MIX | **GLOBE** |
| 11 | (BT, panel code) | BLUETOOTH | BT | **BT** |
| 12 | HOME (with the shift button: the source page) | SRC | HOME / SRC | **PATCH** |
| 13 | EDIT | EDIT | EDIT | **PARA** |
| 14 | FX | FX | FX | **FX** |
| 15 | SEQ | SEQ | SEQ | **SEQ** |
| 16 | PLAY | PLAY | PLAY | **SEQ PLAY** |
| 17 | REC | REC | REC | **SEQ REC** |

- `<` and PATCH are both the firmware's HOME. Texts say PATCH; `<` does the same when pressed alone, but only PATCH
  opens the sound source page with KNOB BANK.
- The firmware's LFO button (FM1 id 5) has no physical button on the SMK-37 (KNOB BANK + CHORD reaches its action on
  the song pages).
- On the LCD `>` and `<` are the characters themselves ("> SAVES (STOPPED)"). In HTML they are written &gt; and &lt;.
- Words that are not button names keep their meaning and spelling: the pages (OVERVIEW, SONG, CLIPS, STEP, SETTING,
  the mixer), the states REC ARMED, RECORDING, REC STOPPED, REC OFF, PLAYING, the mode names KEY PLAY and PAD PLAY,
  the clip line PLAY QUANTIZE, and SAVE as what `>` does (SAVE PROJECT, STOP TO SAVE, SAVED).
- The printed word SCALE is the button that switches CLIPS and SCENES. The MC-707's clip setting of that name (the
  step size of a clip) is therefore called STEP SIZE here when it is built (docs/MC707-PARITY.md 0.2, item 3).
- Faders are printed FADER1 to FADER4, the wheels PITCH and MOD. The pads carry no numbers: which row is pads 1 to 8
  is not confirmed (the workbench drawing puts them in the upper row).
- Also printed, and not used by Classic Tabby: under the lower pad row the transport symbols (play, pause, record,
  rewind, fast forward, <, >, UNDO); above the keys a strip of M-VAVE's key functions (ARP: UP, DOWN, INCL, EXCL,
  RAND, ORDER, REPEAT, OCT+, LATCH, GATE+, GATE-, TAP, SWING+, SWING-, TEMPO+, TEMPO-, SYNC; GLOB: CHN 1 to 16, PRE 1
  to 8; RATE 1/4 to 1/32T with note names; RESET). From docs/STICKERS.md v0.4 the stickers cover the strip on purpose
  (17.16); the transport symbols stay visible.
- The screen messages that changed are listed old to new in docs/BUILD.md 54.

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

### 17.12 One session releases (2026-11-17; the user's rule)

Exactly one session releases: it alone publishes pages, pushes tags, makes GitHub releases and moves worktrees that
another session made. Any other session (research, a side task) stops at a pushed branch and reports what it wants
released; the release session takes it from there. Reason: on 2026-11-16 a second session released tabby-v04.9.3 while
the release session was preparing tabby-v04.10 on the same branch. Enforced as far as a tool can:
tools/linux/publish-pages.py commits nothing unless `TABBY_RELEASE_SESSION=1`, which only tools/linux/release-flow.sh
sets. docs/DEV_CHECKS.md, "Releasing".

### 17.13 The release flow: a release candidate on the device first (2026-11-17; the user's rule)

1. A new build is published only at `builds/<tag>-rc<N>/` (git tag `<tag>-rc<N>`; `make rc`). Its display version is
   the release's, so the firmware is the one that will be released, byte for byte. The page carries a banner:
   release candidate, not a release.
2. It is installed on the device from that page (the normal update path, identity checked, a full backup first, one
   attempt) and run through the full device test set, tools/linux/hw/rc-validate.py: every device test, then a full
   backup, a restore of that backup and a verify.
3. Only when all of that passed is it promoted: `make promote` publishes the main page and `builds/<tag>/` and makes
   the GitHub release (git tag `<tag>` on the same commit). tools/linux/device-gate.py refuses a promotion whose
   commit or firmware build id is not the one that passed (build/device-gate.json, written by rc-validate.py).
4. A build that fails stays a release candidate page with a note line (tools/linux/builds-notes.json). The fix is a
   new commit and the next candidate number. 17.11 holds for candidate tags and pages as for any other.

Hard limit 5 (the suite on the exact commit) comes before step 1 as before. Reason for the rule: tabby-v04.11 and
tabby-v04.11.1 were on the main page before anything had been tried on the device, and tabby-v04.11.1's page fix was
incomplete. Adding the candidate banner to a `-rc` page, and changing its text when the candidate is released or
fails, counts as the note line of 17.11. Candidates published before 2026-11-17 are left as they are.

### 17.14 Songs saved on tabby-v04.10 or later, and older firmware (2026-11-17)

A song that is saved on the device by tabby-v04.10 or later is stored in the scenes format (record version 3) with
fields older builds do not know: firmware before tabby-v04.6 cannot read it at all, and tabby-v04.6 to v04.9.3 refuse
a song that holds a scene stored on the panel. To go back to an older build, restore a full backup made before
tabby-v04.10 after installing it. This is said in the release notes of tabby-v04.10 and every later release, in the
testing guide and in Help. Pages: a page older than the firmware may refuse such a song; from tabby-v04.14 the Full
backup then names the song and stops (19.17).

### 17.15 The flash reserve, and the user's answers of 2026-11-17 (evening)

- **Flash reserve (the user's rule):** at least 15 KB (15360 bytes) of flash stays free for fixes. No parity feature
  is added when the margin after it would be below that; what is then left on the list is reported. The margin is
  reported in every release (docs/FLASH-BUDGET.md).
- The parity list is built in the order of docs/MC707-PARITY.md 0.2.
- TRANSPOSE is not locked out on drum tracks.
- The manual is published as one printable PDF with each release (tools/linux/manual-pdf.py, guide/classic-tabby-manual.pdf).
- Stopping the song takes an armed take off (19.19).
- Stickers stay black on white, under the controls.
- The photograph of the panel arrived later on 2026-11-17: the printed names are confirmed and used everywhere (17.4),
  and the stickers were checked against it and redesigned (docs/STICKERS.md v0.3).

### 17.16 The user's answers of 2026-11-18

- **Pad rows** (confirmed on the device the same evening, 17.17)**:** to be worked out from the upstream firmware and M-VAVE's manual, not asked. Result: the columns and
  the left-to-right order are certain (the LED chain, `rgb_map`); that the upper row is pads 1 to 8 rests on M-VAVE's
  panel model in the kit alone and is an **assumption**, marked so in docs/STICKERS.md 5.1 and docs/CONTROL-MAP.md 1.2.
- **Stickers:** no type below 6 point. A printed function of the strip above the keys that is dead in Classic Tabby
  may be covered on purpose; one that still works stays visible or goes onto the sticker. Result: every function of
  the strip is dead (a key only ever plays its note); stickers A, B, C and the optional E cover it; STICKERS.md 2
  lists what each covers and why.
- **Order of the remaining parity work:** clear notes during a take (FX + key), NEW SONG in ACTIONS, shift a clip
  (KNOB BANK + OCTAVE-/+) (all three: tabby-v04.21, 19.24); then the rest; the step loop last.
- **NOTE REPEAT** gets its printed meaning (note repeat). The keys / pads focus switch moves to KNOB BANK + NOTE
  REPEAT, and every text that names the old gesture is changed with it.
- Unchanged: candidate page, the full device run, then the promotion (17.13); 15 KB of flash stay free (17.15).

### 17.17 The user's answers of 2026-11-18 (evening), and tabby-v1.0

- **Pad rows confirmed on the device:** KNOB BANK and the upper left pad select track 1. The assumption marks are gone
  (docs/STICKERS.md 5.1, docs/CONTROL-MAP.md 1.2).
- **TRACK SELECTED was never seen:** the firmware meant to show it, and wrote it on a line the KNOB BANK list covers
  while the button is held. Fixed in tabby-v1.0 (19.27); the texts describe what the screen shows.
- No chord note repeat, no scene program change, no step-events edit for now.
- **Timing first:** nothing is released until the 9.9 ms run of tabby-v04.23-rc1 is answered. Answered in
  docs/BUILD.md 60: the measuring computer's clock; every device tool now times against the raw clock
  (tools/linux/hw/tabby_link.py v0.23) and the timing tests keep every note's error.
- **tabby-v1.0:** no new features; the full regression on the device with a two-hour soak of a multi-track song with
  the Wrong Room rig profile; only what the regression finds is fixed; a one-page stage checklist
  (docs/STAGE-CHECKLIST.md, section 9 of the manual); released through the candidate flow.
- A rule that follows from BUILD 60: a timing figure counts only when it was taken on a clock the measuring computer
  does not correct, and a failed timing check is judged from the per-note errors and the clock record of the run.

### 17.18 The user's order of 2026-11-19: the screen must be readable

In force from tabby-v1.1, for every page that exists and every page added later:

- Nothing on any page smaller than scale 2 (10 x 14 pixels a character).
- Stage-critical information at scale 3 or larger: the current scene and song, play / stop / record state, tempo,
  the selected track, queued launches, and any warning (STOP TO SAVE, errors, OLD DATA).
- Pages are designed for the large text: fewer items, paging, abbreviations; not content shrunk to fit. CLIPS,
  SCENES and HOME come first.
- A better font is allowed if it fits and keeps the 15 KB reserve; the cost is reported (docs/FLASH-BUDGET.md 50).
- Timing must not suffer: drawing stays sliced so MIDI sends go first; one line stays under 2 ms, proven with the
  one-line and eight-line runs on several pages (rc-validate.py step timing-pages, from v0.11 in every release run).
- The layouts are written into docs/CONTROL-MAP.md (section 20) before a page is built or changed.
- It is a fix, not a feature: it overrode "no new features until I have played a set".

Enforced in the build: `text()` refuses a scale below 2 and traps in host and simulator builds (the simulator's
tour of every page, tools/linux/screens.mjs --check, runs in make workbench-test); tools/linux/notice-wrap.py wraps
every message as the firmware does and fails on a fourth line or a word over 13 characters.

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

### 19.7 tabby-v04.6 (2026-11-14): song record version 3, scenes

- docs/SCENES.md is the format and the behaviour. In short: a clip table of 8 x 64 block ids and up to 128 scenes of
  {a place per track, repeat, loop here, steps}, a master cycle of 2 to 128 steps in header byte 43, the version-2 event table.
- The firmware reads versions 1, 2 and 3, rewrites none, and expands every loaded record into rows (the scheduler) and a clip
  table (the clip launcher). A version-3 song plays byte-identical MIDI to the same song as rows.
- Launch quantize is the master cycle (16 steps for versions 1 and 2).
- Capability flag bit 4; remote ops 9, 10, 11 (track launch, stop, back to song).
- The workbench writes scenes when the song says so and the device has flag bit 4; the importer's scenes form makes clips of
  up to 8 bars and sets the cycle to the file's bar.

### 19.8 tabby-v04.7 (2026-11-14): clip launching (Task 17 Goal 4)

The control map is docs/CONTROL-MAP.md: what every control does on the CLIPS and SCENES pages. This section fixes the
behaviour the firmware and its tests hold to.

- **Pages.** Page 20 is the CLIPS page (it was TRACK LAUNCH); page 19, the SONG page, is the SCENES page of the control
  map (its title on the screen stays SONG). BT (physical button 11) opens CLIPS from any page and returns to the page it was
  opened from (the overview, SYNC / MIDI, the mixer or SONG; otherwise the overview). SCL switches between the two.
- **Pads on CLIPS** are the selected track's clip places `bank * 16 + pad` of the song's clip table (`struct song_model`,
  19.7), four banks. A press queues the clip (`song_clip_launch`), queues a stop when it is the playing clip, or takes the
  queue back when the pad is the queued one (`song_track_unqueue`); the pad becomes the track's selected clip. The queue is
  placed at the press, not at the release. A pad still held after 500 ms keeps the selection and takes back what its press
  queued. With the song stopped a press selects only.
- **Clip launch by place.** A clip that a scene uses is launched as that scene's pattern (row): its length is the scene's
  and the scene's row events for the track's channel go out as for any launch. A clip no scene uses plays as a "place row"
  (`SONG_ROWS + place` in the track status): its length is the v3 clip header's steps, 64 steps for a v2 or v1 block, and
  it has no row events. Launches, stops, returns and scene recalls land on the master cycle (19.7).
- **Pad states and colours** (`clips_pad_state`, `smk37_screen_launch_color`): 0 empty (off), 1 stopped (0x080808),
  2 playing (0x083008), 3 queued (0x083008 / off, blinking), 4 stop queued (0x300808 / off); + 8 selected (0x303030, or
  0x103c10 when playing); + 16 the track is muted (0x0c0600 stopped, 0x301808 playing; queued pads still blink). The blink
  phase is the master clock's eighth note while the song plays, 4 Hz otherwise. SCENES page: 0 no such scene, 1 a scene,
  2 the scene that plays, 3 the queued scene, same colours.
- **Mute.** SHIFT + pad 9 to 16 toggles the mixer's mute as before and sets the track's song-mute bit to the same state;
  for a track whose source is OFF it toggles the bit alone. While the bit is set the scheduler sends no note-on of the
  track (`song_mute_set`; note-offs of sounding notes, controller and program events still go out; the clip's position
  runs on). A mixer mute made any other way (the MIX page, a project's stored mutes, the default mute of tracks 6 and 7)
  does not set the bit: songs that play those tracks on MIDI out are unchanged.
- **Remote** (command 29): op 12 reads the page (page, track, clip bank, scene bank, selected place, notice flag, per pad
  the state code and the LED colour in 15 bits), op 13 `{13, track, place}` is `song_clip_launch`, op 14 `{14, track}`
  is `song_track_unqueue`. Panel keys go through op 6 as before; BT is physical button 11.
- **Tests.** Host: tests/host/smoke.c section 22. Simulator, through panel events only: tests/workbench/clips-sim.mjs
  (in `make midi-import-sim`). Device: tools/linux/hw/run-launch.py with the song of tools/linux/hw/clips-song.mjs.

### 19.9 tabby-v04.7.1 (2026-11-16): the MC-707's stopped pad, the two mutes

The user's answers to the questions of the tabby-v04.7 report: BT stays the CLIPS button; clip pads follow the MC-707
(Roland's Reference Manual eng02 and Update manual eng09 were read; docs/CONTROL-MAP.md section 11 lists every deliberate
difference and is kept current); MIX-page mutes stay internal only but must look different; the tabby-v04.5 page gets its
note line.

- **A clip pad pressed while the song is stopped reserves the clip** (`song_clip_launch` with the transport stopped; the
  status shows it as a queued launch, so the pad blinks and a second press takes it back). `song_play` starts a track with
  a reservation launched on that clip at master time 0; the other tracks follow scene 1. Reservations are cleared by PLAY
  and by loading a song. With CLOCK = MIDI they are not used.
- **Pressing the playing clip stops the track**, unchanged: the reading of "play/stop clips" (Reference Manual p. 21).
- **Two mutes, two looks** (19.8 Mute still holds). Pad state bit 16 = muted altogether (the song-mute bit: orange
  0x301808 / 0x0c0600), bit 32 = the mixer's mute alone (blue 0x081830 / 0x02060c). With SHIFT held pads 9 to 16 are
  orange, blue (0x081030) or dim green. CLIPS page: MUTED ALL (amber) or MUTED INT (blue), and the track's clip number in
  that colour; overview: M-ALL or M-INT. A track unmuted in the mixer loses its song-mute bit too, so the song-mute bit
  never stands without the mixer's mute on a track that has a source.

### 19.10 tabby-v04.8 (2026-11-16): step editing (Goal 6, first step)

The controls are docs/CONTROL-MAP.md section 12. This section fixes what the firmware and its tests hold to.

- **One clip is open for editing at a time** (`song_edit_open(track, place)`), as a v3 event list in RAM (3088 bytes). A
  grid block (v1, v2) is converted when it is opened: each step's modifier, then its notes with their offsets. The steps
  the editor offers are the clip's playing length: its scene's steps, else its own.
- **Edits** (`song_edit_note_toggle`, `_step_clear`, `_note_adjust`, `_undo`, `_redo`): a note is identified by its anchor
  step and pitch (docs/CLIP-V3.md: no two notes of a pitch on a step), so entering a pitch that is there removes it. A
  start is moved inside its step only (-239 .. +240 units; step 1 from -240). Every edit leaves a valid v3 payload
  (tests/host/clip_v3_test.c: 40000 random edits).
- **The event cap is 512 events** (14.2 as amended; docs/CLIP-V3.md). An insert into a full clip is refused with CLIP FULL
  and changes nothing (14.2's rule for step entry).
- **Undo: four levels** (14.1 decision 8), a copy of the clip each; redo until the next change; one level per knob
  gesture (the same step, note and field); cleared when another clip is opened.
- **Hearing an edit without a flash write.** While the open clip is unsaved, the decoder takes it instead of the stored
  block (`decode_track`). A clip launched on its track is decoded again into the track's free buffer after each change
  and the audio thread takes that buffer at the loop's next pass (`fresh`). A track that follows the scenes gets the
  change at its next decode.
- **Saving** (`song_edit_save`): `song_block_append` under the clip's block id, format 2 (v3), then the directory is
  rebuilt. Only while no transport runs (15.4); otherwise SONG_BUSY and the page says STOP TO SAVE. `song_edit_poll` saves
  an unsaved clip ten seconds after its last change once the song is stopped; `song_load` saves it before another song
  is loaded. The song record is not rewritten: the block id stays.
- **Limits.** One unsaved clip at a time (`SONG_BUSY` from `song_edit_open`); a block that another track's clip table
  also names is refused (`SONG_EDIT_SHARED`: saving it would change both tracks); the clip's length is not changed.
- **Keys.** `smk37_screen_key(note, velocity)` is called for every keyboard key after it has been played; only the STEP
  page uses it.
- **Remote** (command 29): op 15 reads the STEP page (55 bytes: page, track, place, bar, selected step, unsaved, undo,
  redo, events, current note, steps, playing step, pad mode, 16 pad states, the selected step's notes); op 16 `{16, 1}`
  saves (code 76 while a transport runs), `{16, 2}` discards, `{16, 3, track, place}` opens the page on a clip. Page 21.
- **Tests.** tests/host/clip_v3_test.c (edit primitives), tests/host/smoke.c section 23 (the editor), tests/workbench/
  steps-sim.mjs (the page through panel events, 48 checks), tools/linux/hw/run-steps.py (the device).

### 19.11 tabby-v04.9 (2026-11-16): real-time recording (Goal 6, second step)

The controls are docs/CONTROL-MAP.md section 13. The rules are 14.2 (the cap, controller thinning) and 14.1 decision 8
(undo); this section says how they are built.

- **A take goes into the open clip** (19.10) while that clip loops on its track as a launched clip. `song_record_start`
  launches it when it does not (a reservation when the song is stopped) and arms; the take begins when the track plays
  the clip, and ends on REC, when the song stops or when the track leaves the clip.
- **Sources.** Queue 0: everything the panel sends as MIDI (`send()` in app/smk37_controls.c: keys, pads, wheels, pedal,
  pad pressure). Queue 1: channel voice messages at MIDI in (`midi_received_body`). Only messages on the recording
  track's input channel are taken. One writer per queue; the control task drains both.
- **Time.** Each message is stamped with TIMER4 (24 MHz) where it arrives. The audio thread publishes, per block, the
  master position at the block's start, its TIMER4 time and its advance; the control task turns a stamp into master
  units from that. The clip time is the master time less the loop's start, modulo the loop.
- **Notes.** A note-on takes a place among 16 held notes with its clip time (rounded to the nearest step when input
  quantize is on) and velocity; the note is written at its note-off with the length played (1 to 65535 units). A note of
  a pitch that is already anchored at that step replaces it. The same key struck again before its note-off ends the
  first note there.
- **The cap (14.2).** A note-on or controller value is accepted only while the clip's events plus the held notes are
  below 512. Otherwise the take stops: the held notes are written at once into their reserved places, nothing else is
  taken, the screen shows `CLIP FULL - 512 EVENTS - REC STOPPED` for 2 s, the REC lamp goes out and the clip's pad on
  the CLIPS page shows red for 0.4 s. Playback continues. Step entry into a full clip is refused with CLIP FULL.
- **Controller thinning (14.2).** Per controller (a CC number below 120, pitch bend, channel pressure; eight at a time):
  a value is written if 240 units have passed since the last written one, else it becomes the one pending value; a
  pending value is written, at the time it arrived, when the controller has been still for 480 units or the take ends;
  a value equal to the last written one is not written. Polyphonic aftertouch has no event kind in the v3 clip and is
  not recorded.
- **Undo.** The take is one level, pushed when the take begins; `song_edit_undo` and `_redo` return SONG_BUSY during a
  take; a take that wrote nothing gives its level back.
- **Hearing the take.** As any edit (19.10): the looping clip plays what was recorded from its next pass.
- **Not built:** a count-in, a metronome (14.1 decision 7), recording into an empty place, poly aftertouch.
- **Remote.** REC is physical button 17 (op 6). Op 15's reply is 57 bytes: [55] the recorder (0 off, 1 armed,
  2 recording), [56] input quantize.
- **Tests.** tests/host/smoke.c section 24 (the cap), tests/workbench/record-sim.mjs (28 checks: keys, MIDI in, quantize
  on and off, thinning, undo), tools/linux/hw/run-record.py (the device; it measures playback against the live note).

### 19.12 tabby-v04.9.3 (2026-11-16): the flash part page

- Command 25 request 11, in every build (16 bytes, little-endian u32): the flash chip's JEDEC ID and the capacity the SDK
  worked out from it, as the SDK's norflash driver read them at boot (`flash_info` +28 and +24), then `fm1_flash_size()`,
  then the source (1 = the device, 0 = the simulator). It copies two words from RAM: no SPI command, no flash access.
- The workbench shows it as one line of the Diagnostics panel. **It is a report only. Nothing in the firmware, the
  workbench or the tools may depend on the ID**: no list of accepted chips, no refusal, no warning. docs/FLASH-CHIP.md
  explains why (the community FM-1 firmwares that refused the UC25HQ80). tests/linux/flash-part-guard.py enforces it.
- `flash_info` is local to libfm1_engine.a. tools/linux/build.py v0.12 links twice and gives its address to the app as
  `ct_sdk_flash_info` (`--defsym`). The build stops if the address moves between the two links. The SDK is not modified.

### 19.13 tabby-v04.10 (2026-11-16): the clip workflow on the panel

The user's answers of 2026-11-16 (REC on an empty pad makes a clip of one master cycle; takes one audio block earlier;
512 events accepted) and the first step of the clip workflow: count-in and click (14.1 decision 7), a clip's length, a
copy, a stored scene. docs/CONTROL-MAP.md sections 13 to 16 are the user's side of it.

- **Lengths.** A v3 clip loops at its header's length wherever it plays; a track that follows the scenes loops its
  clip inside the scene and takes the next scene's clip where the scene (steps x repeats) ends. A repeat of a scene no
  longer restarts the tracks. A v2 block has no length: in a scene of the song as imported it plays the scene's steps
  (unchanged: the same block may sit in scenes of different lengths); in a place row and in a scene stored on the
  device (row flag bit 1, `SONG_ROW_FLAG_OWN`) it plays the steps of the first imported scene that uses it, 64 when
  none does. A v2 block opened in the editor becomes a v3 clip of that length.
- **The song record is written by the device** (`song_record_write_model`): always as version 3, from the row form
  and the model, when the song was changed on the device (a new clip, a copy, a stored scene, a setting); only while
  stopped (15.4), after the clip's block. Scene flags bit 1 is new; header bytes 44 to 46 hold the click settings
  (byte 44: bits 0-1 click off / when recording / always, bits 2-3 output internal / MIDI / both, bits 4-5 count-in
  0, 1, 2, 4 cycles; byte 45 channel + 1; byte 46 note; all 0 = never set). Firmware before tabby-v04.10 refuses a
  record with scene flag bit 1 and ignores bytes 44 to 46.
- **A staged version-3 record is recovered.** `staged_target` took the CRC range of a version-1 record for version 3,
  so a version-3 record interrupted between the staging commit and the write of its sector was dropped at the next
  boot instead of being finished (present since tabby-v04.6; found by reading, not seen on a device). Fixed.
- **New clips.** `song_clip_new` (an empty v3 clip of one master cycle in an empty place, the next free block id) and
  `song_clip_copy` (a copy in an empty place of the same track). The new clip is the editor's open clip with
  `created` set; the decoder plays it from the editor like any unsaved clip; a discard takes it out of the clip table
  and out of any scene stored with it.
- **The clip chain** (docs/CLIP-V3.md 2.1): header bytes 8 to 11. The engine plays chains from this release (a launched
  clip's chain: stop, or the next clip, decoded ahead into the track's free buffer); the panel sets them in the next.
- **The click** (decision 7, as built): on every quarter note of the master cycle, the first of a cycle louder. The
  MIDI click is a note through the song's event lane (every port, due time as a song note, released 240 units
  later). The internal click is a 300-frame square burst added to the output block in `fm1_output_mix`
  (app/audio_output.c), before the master gain. Decision 7 named the 808 through the preview path; that path is inside
  the prebuilt engine and cannot be triggered from the app, so the click is generated by the app instead.
- **The count-in.** PLAY with a take armed (internal clock) runs `count` master cycles of clicks before the start
  request is taken: the song, its Start and its first notes begin with the block after the count-in's last unit (at
  most one block, 2.9 ms, after the exact beat).
- **Takes one block earlier.** While the MIDI out runs with the one-block look-ahead (F + G), what the player hears is
  one block behind the master position; the recorder subtracts one block's advance from every stamp.
- **The scene hold** (`song_scene_hold_set`, RAM only): the scene that plays repeats until the hold is taken off or a
  scene is recalled. In the engine from this release; on the panel with the scene chain.
- Remote: command 29 op 17 reads the CLIP SETTING page; op 16 sub 4 is that page's 4th left button.

### 19.14 tabby-v04.11 (2026-11-16): clip chains on the panel

- CLIP SETTING gets NEXT CLIP, AFTER and TIMES after LENGTH (`song_edit_chain`: header bytes 8 to 11 of the open clip,
  one undo level per setting). NEXT steps through STAY, STOP and the places of the track that hold a clip.
- The engine is tabby-v04.10's (19.13): the chain acts on a launched track, exactly TIMES x AFTER (or TIMES x the
  clip's length) after the clip was entered; the next clip is decoded ahead into the track's free buffer; a note that
  sounds runs out its length across the step; STOP releases the track.
- Status: `track_chain[8]` (the row the chain leads to, 254 = stop, none); the CLIPS page shows it per track.
- Differences from the MC-707 (NEXT CLIP / LENGTH, Update manual version 1.30): docs/CONTROL-MAP.md section 11.

### 19.15 tabby-v04.12 (2026-11-16): the scene chain on the panel

- The scene chain is the row sequence the song always had (rows with repeats, loop-here rows, the loop point): from
  this release its two settings are on the SCENES page. `song_scene_edit`: TIMES (the row's repeat, 1 to 64; the
  scene's length is its steps x that, shown in master cycles) and THEN (the loop-here flag: NEXT or STAY). A change
  to the scene that plays is copied into the audio thread's row at once. Saved with the song (19.13).
- The manual override: the pads (a recall, as before) and the hold (`song_scene_hold_set`, K3; RAM only).
- A scene pad pressed while stopped reserves the start scene (`reserve_scene`; `song_queue_jump` while stopped);
  `song_play` starts there on the internal clock and uses the reservation up. As the MC-707's reserved scene.
- Remote: op 17's reply grows to 28 bytes (the scene the knobs work on, its times, flags, steps; the master cycle).

### 19.16 tabby-v04.13 (2026-11-16): a clip's program and bank on the panel; the controller knobs

- CLIP SETTING gets PROGRAM, BANK MSB and BANK LSB (`song_edit_program`: the v3 clip header's flags and bytes 2 to 4,
  docs/CLIP-V3.md 2). The engine has sent them since tabby-v04.5 when a track enters the clip; new: a buffer carries
  the header's program word (`prog`), and when an edit changes it the loop's next pass sends it again.
- K1 to K4 on the CLIPS page send controllers 74, 71, 1 and 11 on the selected track's input channel through the
  panel's send path (`smk37_send_controller`): to the engine, to MIDI out by the track's settings, and to the
  recorder's panel queue, where the thinning rule of 14.2 applies as to any controller. Values per track, RAM only.
- This is "CC automation recording" of the user's list: controllers from MIDI in and the wheels were recorded since
  tabby-v04.9; the knobs had nothing to send until now. The numbers are fixed; making them a setting is open.

### 19.17 tabby-v04.14 (2026-11-17): two fixes on the page, CLICK LEVEL, the controller numbers

- The Full backup and Verify name a song the page cannot read and stop: "STOPPED at song 7: this page cannot read it
  (...). No backup file was made and nothing on the device was changed." with what to do (the page of the firmware on
  the device, or delete the song). Before, the reader's own words went to the library status line and the backup line
  stood at its last percentage (the tabby-v04.10 page and a stored scene). A lost link or a device error is reported as
  it is. sdk/WebUpdate.js `fullRead`, sdk/Update.html.in.
- Data loss fixed in the workbench importer path (web/import/song-format.js v0.9, web/clip-v3/clip-v3.js v0.4): a v3
  clip read from a song and written again lost its chain (NEXT CLIP, AFTER, TIMES), and a clip whose own length was
  not 64 steps came back as 64. A clip read from a song is now written as a clip of the same length with its chain.
  The page's own reader (WebUpdate.js) always kept clips byte for byte.
- CLICK LEVEL (the user's answer 1): LOW, MID, HIGH for the internal click; record header byte 44 bits 6-7 (0 MID,
  1 LOW, 2 HIGH). The click's sample value is `n * (2000 << level)`: LOW is twice the level of tabby-v04.13, MID four
  times, HIGH eight times. A song never set is on MID.
- The controller numbers of K1 to K4 on CLIPS (answer 3): record header bytes 56 to 59, number + 1, 0 = the defaults
  74, 71, 1, 11. `song_setting` / `song_setting_edit` settings 5 to 9.
- CLIP SETTING is two pages: the clip's eight lines, the song's ten. K5 walks through both.
- Click settings stay in the song (answer 2); clip chains stay on launched tracks only (answer 4).
- Remote: op 17's reply grows to 33 bytes (28 the click level, 29 to 32 the controller numbers).
- Both page readers keep the new bytes; pages before tabby-v04.14 drop them when they rewrite a song.
- First release under 17.13.

### 19.18 tabby-v04.15 (2026-11-17): TRANSPOSE per clip, DELETE CLIP (the first two items of the parity list)

- docs/MC707-PARITY.md section 0 is the list worked from: what is done and what is left, ranked for live MIDI use.
- TRANSPOSE: v3 clip header byte 12, a signed byte, -12 to 12 (docs/CLIP-V3.md 2). `clip_v3_transpose_apply` moves
  the notes of the copy that `decode_track` plays and clears the byte in that copy; the stored clip keeps its notes.
  `song_edit_transpose` (one undo level per run). A clip with a transpose is refused by firmware before tabby-v04.15
  (its validator wants byte 12 = 0): 17.14 applies.
- DELETE CLIP: `song_clip_delete` (stopped; not a clip a scene uses, `song_clip_scene`); the place is emptied in the
  model and the record is written at the next save. The clip's bytes stay in storage until COMPACT SONG STORAGE.
  The page asks twice (two presses of the 4th left button within two seconds). Difference from the MC-707 with its
  reason: docs/CONTROL-MAP.md 11.
- CLIP SETTING: page 1/2 has ten lines (TRANSPOSE and DELETE CLIP follow COPY TO PAD); twenty lines in all.
- Remote: op 17's reply grows to 34 bytes (33: the open clip's transpose).
- Page: both song readers keep byte 12 (web/clip-v3/clip-v3.js v0.5, web/import/song-format.js v0.10; the page's own
  reader keeps a clip byte for byte).

### 19.19 tabby-v04.16 (2026-11-17): a scene deleted and moved; a stop takes an armed take off; the printable manual

- Parity list item 1. `song_scene_delete(row)` and `song_scene_move(row, delta)` (app/song.c), stopped only
  (SONG_BUSY): the playing engine counts every track's position in scene indices (rowset, the queues, the buffers),
  so the order does not change under it. Delete: the rows and `model.scene_clip` close up, the scene's row events
  are removed and later events renumbered, the loop row follows, the last scene stays (SONG_EMPTY). Move: the scene
  changes places with its neighbour; the two scenes' event runs change places in the table (three reversals), the
  loop row follows; the moved scene stays the reserved (selected) one. Both drop reservations made while stopped.
- "Insert a scene after the one that plays" is built as store (as before: after the last scene, while playing) plus
  move (stopped). A true insert while playing would renumber scenes under the audio thread; not done.
- The grid-block rule: a block without a length of its own (formats 0 and 1) plays as long as the first imported
  scene that uses it (`v2_steps`). A delete or move that would change that value for a grid block is refused
  (SONG_EDIT_SHARED); v3 clips carry their length and are never a reason to refuse.
- Panel (docs/CONTROL-MAP.md 5): on SCENES, FX twice within two seconds deletes the selected scene; EDIT held + K1
  moves it. FX and EDIT open no other page from SCENES any more (they opened the effects page and the DX7 quick
  page of the track, neither of which belongs to song mode).
- A stop takes an armed take off: `song_record_poll` notes that the take was armed while the song played
  (`rec.armed_playing`); when the song is then stopped (by PLAY, the song's end, or the master's Stop) the take is
  taken off and the screen says SONG STOPPED - REC OFF (`song_record_disarmed`). A take armed while stopped waits
  for PLAY as before (count-in included).
- No format change: records and clips are as in tabby-v04.15.
- The manual: tools/linux/manual-pdf.py prints the guide page to docs/manual/classic-tabby-manual.pdf (US Letter);
  publish-pages.py v0.8 puts it at guide/classic-tabby-manual.pdf and refuses a PDF not made from the guide text;
  tests/workbench/guide.mjs checks the same in the suite.
- Device test: tools/linux/hw/run-sceneedit.py (step `sceneedit` of rc-validate.py v0.3).

### 19.20 tabby-v04.17 (2026-11-17): SHUFFLE and PLAY QUANTIZE per clip; CLIP SETTING in three pages

- Parity list items 2 and 6. Both are settings in the v3 clip header that change the copy `decode_track` plays and
  never the stored events, like TRANSPOSE.
- SHUFFLE: header byte 13. 0 = the clip follows the song's swing (what every clip did; old clips are unchanged);
  1 to 51 = the clip's own shuffle of 0 to 50 percent, which replaces the song's swing for this clip (`b->swing`).
  The engine's warp delays the second step of each pair; negative values (the MC-707's -50 to -1) are not built.
- PLAY QUANTIZE: header byte 15. 0 off, 1 a 16th, 2 an 8th, 3 a quarter. `clip_v3_quantize_apply`: each note to the
  nearest grid line (halfway to the earlier line, as the anchor rule), a note that lands on the clip's end at the
  start, the list back in time order, the later of two notes of one pitch on one step dropped; controllers and step
  modifiers stay. Full strength only. The quantize runs before the shuffle, so a quantized clip still swings.
- `song_edit_feel(field, delta)`, one undo level per run. Byte 14 stays 0 (reserved for SCALE and direction).
- A clip with byte 13 or 15 set is refused by firmware before tabby-v04.17 (17.14 applies) and is not v2-shaped.
- CLIP SETTING: 22 lines on three pages: 1/3 LENGTH to COPY TO PAD (8 lines, as before), 2/3 TRANSPOSE, SHUFFLE,
  PLAY QUANTIZE, DELETE CLIP, 3/3 the song's ten lines. New clip lines go on page 2/3 before DELETE CLIP, so the
  first eight keep their places; the device tests find DELETE CLIP and the song's lines from the number of lines.
- Remote: op 17's reply grows to 36 bytes (34 the open clip's shuffle byte, 35 its play quantize).
- Page: web/clip-v3/clip-v3.js v0.6 and web/import/song-format.js v0.11 keep both bytes.

### 19.21 tabby-v04.18 (2026-11-17): the printed names on the screen and in every text; the stickers checked

- 17.4 is the rule and the table. app/screen.c: 61 string literals changed (docs/BUILD.md 54 lists them); nothing but
  text. No line is longer than 38 characters. Some hints were reworded to fit ("PADS: SCENE  OCTAVE-/+: BANK  K5: SONG").
- Help, the guide (v3.6, with its PDF), docs/CONTROL-MAP.md (v0.13, section 1.1: the name table), the README, the MIDI
  guide and the workbench's panel drawing and tips follow. The conversion was scripted (rules for each word, a map of
  the screen messages applied first so that quoted messages match the screen) and the name tables were written by hand.
- docs/STICKERS.md v0.3: the photograph showed that the band v0.1 and v0.2 used for stickers A, B and C carries the
  function strip. They are now 7/32 inch high and sit in the 11/32 gap between the transport symbols and the strip;
  nothing printed is covered; they carry functions, not names.

### 19.22 tabby-v04.19 (2026-11-17): STEP SIZE per clip (the MC-707's SCALE)

- Parity list item 3. Header byte 14, low four bits: 0 a 16th, 1 an 8th (x 2), 2 a 32nd (x 1/2), 3 a 16th triplet
  (x 2/3), 4 an 8th triplet (x 4/3). Named STEP SIZE on the panel (17.4: SCALE is a button).
- Like TRANSPOSE and PLAY QUANTIZE it changes the copy `decode_track` plays: `clip_v3_scale_apply` scales every time
  and note length, sets the played length (steps x ratio), wraps what crosses the clip's end (the last 240 units of
  a clip are "just before its start"), moves a step's probability to the step where it begins, puts the list back
  in order and drops the later of two notes of one pitch that land on one step. The result is an ordinary clip of
  16th steps, so the grid and the cursor, chains, the master cycle and the scenes work on it unchanged. The order
  in decode: step size, then PLAY QUANTIZE (its grid is real 16ths), then TRANSPOSE; the shuffle works at play time.
- Only sizes that give a whole number of 16ths from 1 to 128 (`clip_v3_scale_steps`): `song_edit_scale` passes the
  others over, one size per call. A clip whose length was changed afterwards so that its size no longer fits plays
  as 16ths and the page says NOT THIS LENGTH.
- The clip's own steps stay what the editor and the recorder work in: `rec_clip_time` and a recorded note's length
  go through `clip_v3_scale_back` (played units to clip units), and `song_edit_info.play_step` too. `b->scale`
  holds what was applied to a buffer.
- CLIP SETTING: 23 lines; STEP SIZE follows PLAY QUANTIZE on page 2/3. Remote: op 17 replies 37 bytes (36: byte 14).
- Page: web/clip-v3/clip-v3.js v0.7, web/import/song-format.js v0.12 keep the byte. Firmware before tabby-v04.19
  refuses a clip with it (17.14).

### 19.23 tabby-v04.20 (2026-11-18): DIRECTION per clip

- Parity list item 5, without the random order. Header byte 14, high four bits: 0 forwards, 1 backwards, 2 forwards
  then backwards.
- `clip_v3_direction_apply` changes the copy `decode_track` plays, after the step size: backwards, an event of step s
  goes to step (steps - 1 - s) and keeps its offset inside the step (`clip_v3_reverse_time`); note lengths stay; a
  step's probability goes with its step. Forwards then backwards appends the backward copy: twice the steps and
  events; when that would pass 128 steps or 512 events the clip plays forwards (the page shows LONG).
- The order in decode: step size, direction, PLAY QUANTIZE, TRANSPOSE. The shuffle works at play time on the result.
- `played_to_clip(b, p)` (app/song.c) is the one mapping from a position in what a buffer plays to the clip's own
  steps: direction back, then step size. The play cursor (`song_edit_info.play_step`) and the recorder
  (`rec_clip_time`) use it with the buffer that plays (`b->dir`, `b->scale`, `b->steps`), not with the header of the
  clip being edited, so a take is placed by what was heard.
- Random order per pass is not built: the clip is prepared when the track enters it (control task); a new order for
  each pass would have to be made in the audio thread.
- CLIP SETTING: 24 lines; DIRECTION follows STEP SIZE on page 2/3. Remote: op 17 replies 38 bytes (36: byte 14 with
  both fields; 37: 20, the reply's revision).
- Page: clip-v3.js v0.8, song-format.js v0.13. Firmware before tabby-v04.20 refuses a clip with a direction (17.14).


### 19.24 tabby-v04.21 (2026-11-18): clear notes in a take, NEW SONG, shift a clip

- **Clear notes in a take** (the MC-707's ERASE). While a take runs (`REC_ON`) FX is the clear button on every page:
  the screen calls `song_record_erase(held)` every pass; a press of FX during a take does nothing else (HOLD FX + A KEY:
  CLEARS ITS NOTES). With FX held, a note-on on the track's input channel (keys, pads, MIDI in) is not recorded: its
  pitch joins a set (`rec.erasing`, 128 bits) until its note-off. Every control pass `rec_erase` removes the notes of
  those pitches whose start lies between the clip position of the last pass and this one (`rec_clip_pos`, the same
  mapping as the recorder: what is heard, through step size and direction); a window wider than half the clip means
  the clip went round its end. Letting FX go empties the set. A take that only cleared counts as a take (one undo level).
- **NEW SONG** (ACTIONS, eighth entry; asks once more). `song_new(slot)`: refused while a transport runs; `song_load`
  of the slot first (which saves what is unsaved in the song being left); a slot that holds a song is refused
  (`SONG_NEW_EXISTS`); else a version-3 record is written: the name NEW SONG, the loaded project, tempo 0 (the
  project's), loop, master cycle 16, one scene of 16 steps without clips, an empty event table; then loaded. The
  screen shows CLIPS. The slot is the one selected on SCENES (K5). Blocks left in storage by a song deleted from that
  slot are not part of the new song (its clip table is empty); new clips take ids from 1.
- **Shift a clip** (STEP page, KNOB BANK + OCTAVE- / OCTAVE+). `clip_v3_shift(p, by)`: every event `by` steps later,
  round the end; a stored time 1..loop stays in that range (the anchor step moves by `by`), a step modifier moves
  with its step; then the list is put back in order. `song_edit_shift`: one undo level per run; not during a take;
  SONG_EMPTY for a clip without events. An edit of the stored clip (unlike TRANSPOSE, STEP SIZE, DIRECTION).
- Remote: command 29 {16, 5} does what the > button does on ACTIONS while NEW SONG is selected (the button cannot
  be injected); {1, slot} now selects an empty slot too (the reply is still the error). Device test:
  tools/linux/hw/run-takeedit.py (the step `takeedit` of rc-validate.py v0.4).
- Measured: +1600 bytes, margin 30269; heap 142700 (-64).

### 19.25 tabby-v04.22 (2026-11-18): NOTE REPEAT repeats; the focus switch on KNOB BANK + NOTE REPEAT

- The user's answer 4 of 2026-11-18 (17.16). Physical button 7 (app/smk37_controls.c): pressed with KNOB BANK it is
  the focus switch (`smk37_screen_pad_mode`, unchanged); pressed alone it switches the arpeggiator of the key track
  and of the pad track on (`groove_arp_set`) and remembers which it switched (`repeat_tracks`); released, it switches
  those off again. A track whose arpeggiator is on is not in the set. `smk37_note_repeat()` returns the set.
- Why the arpeggiator: the note generator is the SDK's (`groove_arp_render`, in the audio thread, in the SDK binary,
  which is never modified); it is clocked with the engine, so the repeats are as even as an arpeggio. A generator of
  our own that repeats a whole chord would run in the audio thread next to the song (about 2 KB): not built; it is
  a question for the user.
- Consequences, all documented in docs/CONTROL-MAP.md 3.1: one held note repeats, several take turns; the ARP's
  GATE, SWING, DIRECTION and RANGE apply; `groove_arp_set` retires the track's held keys (a key down before NOTE
  REPEAT is cut), makes an undo checkpoint and marks the project changed; a take records the held key, not the
  repeats (the recorder takes the panel's and MIDI in's messages, not the arpeggiator's).
- K1 while NOTE REPEAT is held edits the ARP rate of the repeating tracks (`groove_arp_edit(t, 0, ...)`); that
  control pass does nothing else. The notice names the rate. The NOTE REPEAT lamp (LED 7) is lit for pad focus, as
  before, and while notes repeat.
- Remote: command 29 {18} reads the panel's playing state (focus, repeating tracks, ARP switches, key and pad
  track, the key track's ARP rate), 9 bytes with the type byte 5. The status reply stays 14 bytes.
- Texts changed with the gesture: the guide (4.1, T7), Help (the quick start, chapter 06), the workbench panel's
  hint, the README, CONTROL-MAP 1.1, 3.1 and 4.3, the stickers (C: NOTE REPEAT).

### 19.26 tabby-v04.23 (2026-11-18): the step loop while held

- Parity list item 4, the last of the user's order. Gesture: on CLIPS, NOTE REPEAT held and pad 9, 10, 11 or 12 held:
  the last 1, 2, 4 or 8 steps (the report of 2026-11-18, question d, as answered).
- Audio thread (app/song.c `tick`): one change. `loop_steps` (control to audio, one byte) is taken at the start of a
  tick. While it is not 0 the note scan of every active track goes through `loop_scan`: the block's window
  [p0, p0 + adv) is turned back into the track's window [`loop_from[t]`, + n steps) (modulo), in up to two pieces, and
  the scans of the next frame (the crossing scan and the look-ahead) are left out. `scan` is stateless (binary search
  by time), so nothing else in the tick changes: frames, chains, queues, scene switches, the master position, the
  click and the recorder's stamps run on as before, which is what makes the song continue where it would have been.
  The window is taken per track in the first tick that sees the loop: it ends with the step the track is in, and is
  not longer than the track's frame.
- Cost in the audio thread while not looping: one byte compare per tick and one test per track.
- Control: `song_step_loop(steps)` (SONG_INVALID stopped, SONG_BUSY during a take, 0 ends it), ended by `song_stop`.
  The screen keeps the pad that holds the loop (`loop_pad`) and ends the loop on any page when that pad is up.
- Not done: a loop of chosen steps (the pads are clips on CLIPS); a loop per track; a loop length other than 1, 2, 4, 8.

### 19.27 tabby-v1.0 (2026-11-18): the release for the stage

- No new function. One fix, found by the user on the unit: a KNOB BANK shortcut's notice (TRACK SELECTED, TRACK MUTED:
  SOUND AND MIDI, TRACK UNMUTED, MIDI TRACK MUTED / UNMUTED) is drawn in the first line of the KNOB BANK list while
  it lasts (`draw_page`: the list's cache key carries the notice). Before, `smk37_screen_shortcut` set the notice
  and the list, drawn over y 195 to 240, covered the line every page writes its notice on.
- The version name has no leading zero from here on: tabby-v1.0. The builds index orders by date, then name.
- The candidate validation has the step `soak` (tools/linux/hw/rc-validate.py --soak-minutes; release-flow.sh passes
  TABBY_RC_ARGS): the Wrong Room song (tests/midi-import/fixtures/wrong-room-all.mid with web/rig/profiles/wrong-room.json,
  looping: 8 parts on channels 1 to 6, 10 and 9, 16 program changes, a bank select and 5 controllers in its two
  scenes) in song slot 6, played in segments of 125 s on six pages, every note measured on USB and on one DIN cable.
- Known and documented, not changed: on one DIN cable a scene's row events pass ahead of its first notes (14 ms for
  the 17 messages at this song's loop point); USB carries them at once.

### 19.28 tabby-v1.0.1 (2026-11-18): row events at every entry of a scene in a two-scene loop

- The fault (measured on tabby-v1.0 and tabby-v04.23; the code is older): the song playhead keeps two row buffers. A row's
  events are streamed once per entry; "this buffer holds a row that was not streamed yet" was recognised by
  `prefire` seeing the buffer not ready (`armed[idx] = 0`) or holding another row number. In a loop of two scenes the
  same row comes back into the same buffer. When the control task had decoded it again before the next audio tick
  looked, the tick saw a ready buffer with the old row number: armed and streamed stayed set, and the entry sent
  nothing. How often depended on how soon the control pass ran, so on the page shown.
- The fix (app/song.c, `song_switch`): the audio thread itself disarms the buffer it leaves (`armed[cur] = 0`) in the
  tick that releases it. `prefire` then arms the buffer again when it is ready, whatever row it holds.
- Not affected: three or more scenes in a row (the buffer gets another row number each time); a scene that repeats
  (its events are sent once, when it is entered: unchanged); the first pass.
- Tests: tests/workbench/wrong-room-loop-sim.mjs (six passes: 17 and 6 event messages at every entry; on the old
  code "17 6 0 0 0 6 0 0 0 6 0 0"); the device soak requires every entry's burst (run-soak.py v0.3 --row-events).

### 19.29 tabby-v1.0.2 (2026-11-18): EVENT LEAD

- The user's order of 2026-11-18 (night), as changed while it was being built: a scene's row events are sent before
  the downbeat by a lead that is a song setting, 0 to a quarter note; **default 0 (OFF)**, so that every existing song
  behaves exactly as on tabby-v1.0.1; a device's gap from the rig profile stays counted from when its program change
  goes out. Reason for OFF as the default (the user's): a program change sent early switches the synth's sound
  before the downbeat, and the tail of the previous scene's last notes plays on the new patch. The manual says so
  next to the setting.
- Song setting 10, `SONG_SET_EVENT_LEAD`: 0 OFF, 1 a 32nd, 2 a 16th, 3 an 8th, 4 a quarter note; header byte 47
  (`reserved[4]`), read in a record of any version; a byte above 4 reads as OFF. web/import/song-format.js v0.14
  keeps it (`song.eventLead`). Firmware before tabby-v1.0.2 ignores the byte.
- Mechanism: none new in the audio thread. A row's stream already starts `lead + 1` ticks before the boundary, where
  `lead` was the sum of the row's gap events in blocks (9.11, 9.13). `decode_rowinfo` and `decode_track` (control
  task) now add `event_lead_blocks()`: the setting in units, in blocks at the tempo the song plays at. So the last
  message of the stream leaves the setting before the downbeat, and each gap still follows its own message. With
  the setting OFF the sum is what it was, and so is every byte sent (the test compares with tabby-v1.0.1).
- Consequences: no lead at PLAY (row 0's events go with the start, as before); a jump or launch queued later than
  the lead before its bar sends at once; a change of the setting acts when the next row is decoded (the scene
  after the next); the tempo is read at decode time (a tempo change shifts the lead of one scene).
- CLIP SETTING: 25 lines; EVENT LEAD is the last line of page 3/3. Remote: op 17 replies 39 bytes (38: the lead;
  37: 21, the reply's revision).
- Tests: tests/workbench/wrong-room-loop-sim.mjs v0.2 (OFF: the SHA-256 of every message with its block equals
  tabby-v1.0.1's, tests/workbench/fixtures/wrong-room-loop-v1.0.1.json; 1/16: every entry's events 43 blocks before
  its first note, the notes unmoved; a gap of 255 ms inside the stream: 88 blocks after its program change, the
  last message still 43 blocks before the note); setup-sim.mjs; on the device run-setup.py v0.13 and two soaks
  (rc-validate.py: `soak` with the lead OFF, `soak-lead` with 1/16).

### 19.30 tabby-v1.1 (2026-11-19): the readable screen

- The user's order (17.18). Only app/screen.c's drawing changed, and two status strings in app/diag.c. No setting,
  no storage format, no remote command and nothing in the audio or MIDI path changed.
- Sizes: scale 2 = 12 x 14 pixels a cell (20 characters a line), scale 3 = 18 x 21 (13 a line). The styles that
  were scale 1 (`dim_text`, `plain_text`, `accent_text`, `color_text`, `small_number`) are scale 2; `big_text` and
  `big_number` are scale 3. The 5x7 font stays (FLASH-BUDGET 50 says why).
- The top line (`header`): tempo, state, selected track at scale 3; ARP / K8=0 and the unsaved mark at scale 2. The
  state is the song's when a song plays or counts in or a take runs (`song_status`, `song_edit_info`), else the
  pattern sequencer's. The hold bar moved to rows 30 and 31, the rule to row 32; page bodies start at row 34.
- Messages (`banner_text`, `banner_wrap`, drawn last in `draw_page`): an amber box anchored at the bottom, one to
  three lines of 13 characters at scale 3, greedy word wrap, " - " in the text forces a new line. A box that gets
  shorter or leaves invalidates the page (one full repaint in bands). The edit pages' signature no longer holds the
  notice. Standing texts: the question on ACTIONS, NOT ENOUGH MEMORY on SOURCE. The bottom hint line and
  `performance_hint` are gone; a muted master shows as K8=0 in the top line.
- Knobs: `knob()` draws one line per knob (`param_row`: bar, K-number, name at scale 2, value at scale 3 or 2) from
  `knob_top`, 26 rows apart; `strip()` is the compact four-column line of SCENES, STEP and MIX. Both record the
  name, the value and the rectangle for the simulator (`knob_note`); HOME records them without drawing. The
  simulator page takes the rectangles from the firmware (action 0 targets) instead of a fixed strip.
- Pages: docs/CONTROL-MAP.md section 20 is the specification of each layout. CLIP SETTING has four pages (the song's
  lines split 8 + 3); `setup_row` and remote op 17 are unchanged.
- 18 messages were shortened so that those met while playing take two lines (the list: CONTROL-MAP 20.3; Help and
  the guide quote the new texts). `ct_diag_storage_lines` gives `USER n READY` and `FREE nK RECL nK`.
- Repaint cost is unchanged in kind: bands of 16 rows, one per pass, deferred when a MIDI event is due.
