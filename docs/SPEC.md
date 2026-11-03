# Classic Tabby — Specification

Version: 0.7
Revision log:
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

Formats: section 9 of the assessment, **v0.4** (2d4ef83): 16-bit block ids, 20-byte rows
at offset 64, song body CRC over bytes 20..2623, 6-byte block record headers, 2048 live
blocks per song, transfer kind 6 target = (song << 16) | id.

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
- Blocks upload one at a time, each through a staging transaction (three sector erases),
  so a song with hundreds of blocks takes a few minutes to write; audio pauses briefly on
  every erase. A batched upload command is a candidate for later.
- Note editing is in the workbench only (decision 5); the device shows the row's block ids
  and plays, it does not edit songs.
- The SEQ page "OUT CH" readout shows the device setting while a song override is active
  (no marker in v1; the SONG page shows the song's channels only through the record).
