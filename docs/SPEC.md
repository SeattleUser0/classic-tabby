# Classic Tabby — Specification

Version: 0.14.2
Revision log:
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
"导入 MIDI 文件（Classic Tabby）" / "Import MIDI file (Classic Tabby)", next to the song
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
  source (SEQ page 5/7); the BT button announces "BLUETOOTH: SET IN WORKBENCH". The
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
  workbench simulator has the page as shortcut 20 ("轨道启动"); `sim_pad_color(pad)` reads
  a pad's colour. The scripted 32-bar performance check (tests/workbench/launch-sim.mjs:
  launches, stops, a scene jump, back to song) found one sequencer fault, fixed here: a
  track rejoining the song on a bar where the song also changes rows took the old row; it
  now takes the new one, and a following track whose buffer is not the song's row adopts
  the right one as soon as it is decoded (counted late). App image 451396 bytes, **margin
  2525** (+2368): the 2 KB floor holds without the EFFECTS page; checkpoint (d) adds no
  firmware.
- (d) workbench: rig lead before bar, song editor pattern view, simulator check. Pending.

Deferred (BUILD.md left-to-build list): following external MIDI clock in song mode; CC
automation inside a row.

