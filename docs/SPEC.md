# Classic Tabby — Specification

Version: 0.4
Revision log:
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
