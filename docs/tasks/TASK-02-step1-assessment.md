# Task 02, Step 1 — read-only assessment (MIDI file import into songs)

Version: 0.1
Revision log:
- v0.1, 2026-11-02: first assessment on branch classic-tabby/task02-midi-import (worktree
  firmware-task02, based on classic-tabby/linux-build at 95b024c). Nothing but this file and
  docs/tasks/TASK-02-midi-import.md was added. Sources: docs/tasks/TASK-03-step1-assessment.md
  v0.1 (the approved format spec), docs/tasks/TASK-03-song-mode.md v0.3, sdk/Update.html.in,
  sdk/WebUpdate.js, sdk/Simulator.js, sdk/Samples.js, sdk/I18n.js, tools/linux/build-web.py,
  tests/, app/instrument.h, app/project.c, app/midi_router.c.

Shorthand: "spec" = the approved Task 03 Step 1 report, section 6; "step" = one 16th note.

## 1. The song and block format, restated from the spec

### 1.1 Block (spec 6.1)

| Item | Value |
| --- | --- |
| Block | one track, **64 steps** at 16th resolution (4 bars of 4/4) |
| Step header, 1 byte | bits 0-2 note count 0..4; bits 3-5 probability (0 = always, 1..7 = 1/8..7/8); bit 6 alt tuning; bit 7 reserved |
| Note, 3 bytes, 0..4 per step | byte 0 pitch 0..127 (bit 7 reserved); byte 1 velocity 1..127, bit 7 = retrigger if the same pitch is still sounding (0 = legato continue); byte 2 length 1..255 steps |
| Chords | several notes on one step; no chord table |
| Same pitch overlapping on one track | collapsed (MIDI cannot express it); with the retrigger bit the sequencer sends off then on |
| Notes running past the block end | stored only once, in their start step, by their length (up to 255 steps, about four rows). The sequencer's active-note table releases them at the stored length; a jump releases them cleanly |
| Size | empty step 1 B, full step 13 B, worst-case block 64 + 768 = 832 B; typical 120–400 B |
| Storage | packed variable-length records in 4 KiB sectors: 16 B sector header (magic, version, generation, CRC-32 `groove_crc32`), each record = song id 4 bits + block id 8 bits + length 12 bits, then the bytes. 96 block sectors = 393216 B. Guaranteed 384 full blocks; about 960 "dense" blocks (400 B); about 3450 mono-line blocks (112 B) |

### 1.2 Song record (spec 6.2)

| Item | Value |
| --- | --- |
| One sector per song | **16 songs** (song 0..15), 4096 B each |
| Header | magic, version 1, generation, CRC, commit word (project.c `struct header` pattern) |
| Fields | name 12 chars; **project slot 0..15** (timbres, effects, tempo, channels come from that project; a song pairs 1:1 with its slot by default but may point at any slot); flags: loop row, jump mode BAR/ROW, **tempo override, 0 = project tempo**; row count |
| Row, 10 B, up to **128 rows** | block id per track × 8 (0 = empty, 1..255), repeat count **1..64**, flags (loop here) |
| Limits per song | 128 rows, **255 blocks** (ids 1..255 are per song: the 4-bit song id in each block record means blocks are not shared across songs), 8 tracks, 4 notes per step |
| Writes | staging sector → destination, commit word last, readback; one transaction at a time, shared by song and block writes |

### 1.3 Transfer (spec 6.4)

New transfer kinds 5 (song record, 4096 B, target = song 0..15) and 6 (block sector image,
4096 B, target = sector 0..95) through the existing begin/write/finish/cancel commands 3/4/5/6,
plus capability bit 2 ("song storage") in command 22 reply byte 8, with the sample limit
field becoming 0. The workbench's `===446464` check becomes "0 or 446464".

### 1.4 What the spec leaves open (importer view)

These are questions for you / the Task 03 session, not changes I will make.

1. **Row length other than 64 steps.** The row record has no step-length field, yet the
   Task 03 test list asks for "row advance timing at 16, 32, 48 and 64 step lengths" and
   the stock project has `sequence_pages` (16/32/48/64). The importer needs **48-step rows
   for 3/4** (section 4). Ask: is there a per-row (preferred) or per-song row length in
   steps, 1..64? If not, 3/4 songs import with 64-step rows: playback stays correct (steps
   are absolute) but rows do not land on bar lines and deduplication suffers.
2. **Tempo override field**: width and range are not stated. I assume the stock `uint16`
   BPM, 30..300, integer. MIDI tempos are fractional (microseconds per quarter); the
   importer rounds to the nearest integer BPM and warns when it rounded or clamped.
3. **Per-track OUT CH is not in the project or the song.** `struct groove_project`
   (instrument.h:176) holds no MIDI channels; output channels live in `groove_midi_config`
   (device preferences in the settings sector, midi_router.c:44, 4 bits per track). The
   Task 03 fixed decision says "project slots keep holding ... MIDI channels", which the
   code does not do. Task 02 Step 2 asks the importer to "set that track's OUT CH". Today the
   workbench has no command that writes device MIDI settings. Options: (a) the importer
   records the chosen OUT CH per track in its browser-side song metadata and the preview
   plus hardware checklist tell you what to set on the device (SEQ 6/7 page); (b) Task 03
   adds an optional per-track OUT CH override to the song header (8 × 4 bits = 4 B, there is
   room); (c) a new settings transfer kind. I recommend (a) now and (b) as a question to the
   Task 03 session. Decide before Step 2.
4. **Note length semantics**: I assume length 1 = the note's own step only (release at the
   start of the next step), so a note from step s to step e exclusive has length e − s.
5. **Byte layout of the song sector** (field offsets, endianness) is not in the spec, only
   the field list. The importer keeps a JavaScript song model and serialises to bytes with a
   single encoder file; exact offsets are filled in at Step 4 from the merged code. Not
   blocking.
6. **Validation rules** for Step 3 "format check": the spec gives ranges, not a rule list. I
   will write the list down in TASK-02-notes.md (pitch 0..127; velocity 1..127; length
   1..255; ≤4 notes per step; block ≤ 832 B; block ids 0..255 and every referenced id
   present; rows 1..128; repeat 1..64; project slot 0..15; tempo 0 or 30..300; name 12
   printable ASCII; total block bytes + record headers fit the pool). The merged Task 03
   validator becomes authoritative at Step 4.
7. **Retrigger bit for imports**: see section 3, "same pitch overlap". I propose the
   importer never sets it and clips instead; confirm.
8. **Loop flags**: the importer sets no loop by default (song plays once and stops) with
   a checkbox "loop whole song" that sets the last row's loop flag. Confirm that is how
   "loop row" is meant.

## 2. Workbench code the importer builds on

**Where the workbench lives.** The browser workbench is one HTML file assembled by
tools/linux/build-web.py (port of tools/Build-Web.ps1) from `sdk/Update.html.in` with seven
`/*FM1_*/` placeholders; `sdk/I18n.js`, `sdk/WebUpdate.js`, `sdk/Simulator.js` and
`sdk/Samples.js` are pasted in verbatim. `web/` holds only the C sources of the simulator
(web/engine, web/synth); non-C files under web/ are ignored by the wasm source hash
(build-web.py only hashes .c/.h/.inc), so new JavaScript there does not change the
simulator identity. There is no module system: each script is an IIFE that publishes one
object on `globalThis` (`FM1Web`, `FM1Samples`, `FM1Workbench`, `FM1SimulatorCore`,
`FM1I18n`). Every UI string is a Chinese key translated through `FM1I18n.text(element,
key)` with the English in sdk/I18n.js.

**Consequence for the parallel-work rules:** everything the task calls "the workbench" is
under sdk/, which I may not touch, and Task 03 Step 2 will edit exactly those files
(Update.html.in, Simulator.js, WebUpdate.js, Samples.js, I18n.js). Proposal in section 8.

**How it loads files** (pattern to copy): `<input type="file" accept=...>` → `onchange` →
`file.arrayBuffer()` → `Uint8Array` → a pure validator that throws `Error(message)` →
status text. Examples: project backup (Update.html.in:791-797, `FM1Web.readProjectFile`,
'FM1P' header + length + CRC-32), simulator import (Simulator.js:1023-1033, keeps a
`selectedFile` until "apply" is clicked and confirmed), WAV import (Samples.js `sample-wav`
handler, `wavInfo`). Wrappers `perform()` / `action()` serialise operations on a `busy`
flag and show `error.message`.

**How it shows previews and warnings:** one status line per tab (`#library-status`,
`#sample-status`, `#sim-status`, `role="status" aria-live="polite"`), `<small role="status">`
warnings (`#sim-storage-warning`), `confirm()` before anything is replaced ("用备份替换当前未保存
的工作区？", Update.html.in:795), a `<progress>` for long transfers (`#sample-progress`), and
the sample section's capacity text (`#sample-space`, `#sample-limit`: "used x / y KiB,
remaining z s") which is the model for the song pool readout. Device saves go through the
modal `#device-save-dialog` (Update.html.in:154, 665-700): it connects, lists the 16 device
slots with their names, states "existing content will be overwritten", and only then
enables Confirm. The importer's "write song" step should reuse that dialog's structure
(and at merge, the dialog itself).

**How it holds a browser copy of a project:** the simulator wasm (`FM1SimulatorCore`,
Simulator.js:19-153) owns the project in C memory (the real app code compiled with
FM1_HOST_TEST); JavaScript only moves opaque validated byte blobs: `request('export')`
returns the 4264-byte project, `request('import',{data})` replaces it, and the simulated
536576-byte flash (16 project slots) is persisted in `localStorage` (Simulator.js:509, 637,
base64). There is no JavaScript-side project model, no song model yet, and the workbench
never edits project bytes except small fix-ups (`projectPayload`, WebUpdate.js:664). A
device snapshot is remembered to warn when the device and the browser diverge
(`rememberDeviceSnapshot` / `compareDeviceSnapshot`, Simulator.js:258-277).

**How it writes to the device today:** `globalThis.FM1Workbench` (Update.html.in:706) wraps
the `Library` class (WebUpdate.js:616-790): `read()` = `download(0)` (current workspace),
`write(bytes)` = `upload(0,0,bytes)` into the device RAM workspace, `save(bytes)` = the save
dialog → `saveProject(slot, bytes)` = upload, readback compare, command 7 (save slot),
command 8 (reload slot), readback compare again. The wire protocol is a SysEx frame
`F0 7D 46 4D 02 cmd token payload(7-bit packed) checksum F7` (`demoFrame`), 64-byte payload
chunks, one request/reply per chunk with retries; transfer commands 3 begin (kind, target,
length), 4 write, 5 finish (CRC-32), 6 cancel; kinds 0 project, 1 voice, 2 timbre, 3 tuned
project, 4 DX7 bank; 21/22 capabilities. A 4096-byte record is 64 round trips. Task 03 adds
kinds 5 and 6 on this same path, so the real song transfer is `upload(5, song, record)`
plus `upload(6, sector, image)` per touched sector.

**Tests:** `make test` = `host-smoke` (tests/host/smoke.c, gcc build of the app + simulator
sources) + `web-smoke` (tests/simulator-wasm-smoke.mjs under /usr/bin/node v22.23.3, plain
`ok`/`FAIL` lines, no framework). Importer tests follow the Node style.

## 3. What a .mid can hold that the format cannot, and the proposed handling

Positions are converted first: `step = round(tick × 4 / division)` in absolute 16ths from
the start of the file (SMPTE time division and format 2 files are rejected with a clear
message). Every change below is counted and listed in the warning list with track, bar and
beat.

| MIDI content | Handling (default) | Options / notes |
| --- | --- | --- |
| Note off the 16th grid | start snapped to the nearest step (ties toward the earlier step); count and maximum displacement reported | the grid is 16ths only, as the spec fixes step resolution; a "strength" setting makes no sense because the format cannot hold the residue |
| Note ends | the format stores integer step lengths, so **ends are always on the grid**. The Step 2 text's "quantize ends as well as starts" becomes a **length rounding rule**: nearest step (default), never shorter (round up), never longer (round down, minimum 1) | flag: please confirm this reading |
| Note shorter than a step | length 1 | counted as "length changed" |
| Note longer than 255 steps (about 16 bars of 4/4) | clipped to 255 | counted as "length clipped"; same for notes running past the selected bar range |
| More than 4 notes starting on one step on one track | keep the **4 loudest** (velocity, tie → higher pitch), drop the rest | selectable rule: loudest / highest / lowest; the rule applies after merging several MIDI parts into one Tabby track |
| Same pitch overlapping on one track (legato repeats) | the earlier note's length is clipped to end where the next one starts; two same-pitch notes on the same step keep the louder | the retrigger bit is never set by the importer; clipping reproduces what MIDI actually does |
| Velocity 0 note-on | treated as note-off (MIDI rule) | velocity 1..127 fits as is |
| Tempo changes | the **first set-tempo** event is the song tempo (rounded to integer BPM, clamped 30..300); later changes ignored and listed with bar positions; no tempo event → 120 | later tempo events do not move notes: positions are in ticks, not seconds |
| Time signature other than 4/4 | the first time signature sets the bar length in steps (16 × numerator / denominator; denominators 2, 4, 8, 16); rows per section 4; later signature changes ignored and listed | bar length not integral in 16ths (e.g. x/32) → rejected with a message |
| Control changes, pitch bend, aftertouch, SysEx, lyrics, markers | ignored, counted per type | CC 64 (sustain) could later lengthen notes; off by default, listed as ignored |
| Program and bank changes | ignored, but listed with track and program number as a hint for timbre choice | |
| Several channels inside one MIDI track (type 0 files, multi-channel tracks) | split into **parts** keyed by (MIDI track, channel); each part is a row in the preview with its name (track name meta, else "Track n ch c"), note count, pitch range, bar span, channel 10 marked as drums | |
| More than 8 parts | you assign up to 8 parts to Tabby tracks 1..8; the rest are "skip". Default assignment: the first 8 non-empty parts in file order. Several parts may map to one Tabby track (merge); the 4-note rule then applies to the merged result | |
| Notes outside the selected bar range | dropped and counted; a note starting inside and ending outside is clipped at the range end | |
| More than 128 rows or 255 distinct blocks after deduplication | import refused with the row/block count and a suggestion to narrow the bar range | 128 rows × 4 bars = 512 bars ≈ 17 min at 120 BPM |
| Running status, zero-length tracks, missing end-of-track | handled / tolerated by the parser | |

## 4. Bars to rows

Rows start on bar lines. With bar length B in steps (4/4: 16, 3/4: 12, 6/8: 12, 7/8: 14,
5/4: 20) the default row holds the largest power-of-two number of bars ≤ 4 whose length
fits in 64 steps:

| Meter | B | Bars per row | Row length |
| --- | ---: | ---: | ---: |
| 4/4 | 16 | 4 | 64 (the default you named) |
| 3/4, 6/8 | 12 | 4 | 48 (your example) |
| 7/8 | 14 | 4 | 56 |
| 5/4 | 20 | 2 | 40 |
| 7/4 | 28 | 2 | 56 |
| 9/8 | 18 | 2 | 36 |
| 15/8 | 30 | 2 | 60 |
| bar > 64 steps (e.g. 9/2) | | | rejected |

The preview lets you override bars per row (1, 2, 4 where it fits) because phrase length is
musical, not derivable. Row r covers steps `start + r·R … start + (r+1)·R − 1`; a note is
stored in the row and step where it starts, with its full length, even when it rings into
later rows (the format allows up to 255). This mapping depends on open point 1 (row length
field). If rows are fixed at 64 steps, every meter gets 64-step rows and the table above
becomes "bars per row = 64 / B" with non-integral values; correct playback, unaligned rows.

## 5. Deduplication

1. After quantization, every (row, track) cell is a list of (step, pitch, velocity, length).
   Canonical form: steps ascending, notes within a step by pitch, then velocity, then length.
2. Encode the cell with the spec's block encoding; the byte string is the pool key. Empty
   cell → block id 0, nothing stored. Otherwise look the key up in a `Map`; a hit reuses the
   id, a miss appends the block (next free id 1..255).
3. **Row merge:** consecutive rows with identical 8 block ids collapse into one row with
   repeat + 1, up to 64, then a new row starts. Notes ringing across the boundary between
   two identical rows behave identically whether or not the rows are merged, because the
   length is stored in the note, so the merge is lossless.
4. Not deduplicated: transposed or shifted copies (no transpose field), blocks across
   songs (ids are per song).
5. Report: cells with content vs distinct blocks, rows before and after merging, block bytes,
   estimated sectors, percentage of the per-song id space (255) and of the pool (393216 B).
   Test: expand the deduplicated song back to the cell grid and compare with the
   pre-deduplication grid (byte equality).

## 6. Pool estimate, 5-minute song at 120 BPM in 4/4

5 min × 120 BPM = 600 beats = **150 bars = 2400 steps = 38 rows** (the last one partial).
Assumed arrangement (typical Renoise electronic track), block bytes = 64 headers + 3 per note:

| Track | Content per 4 bars | Notes | Block bytes |
| --- | --- | ---: | ---: |
| 1 bass | 16th-ish mono line | 16 | 112 |
| 2 chords | 4-note chord each beat | 64 | 256 |
| 3 lead | melody | 20 | 124 |
| 4 pad | two 4-note chords | 8 | 88 |
| 5 arp | 16ths | 64 | 256 |
| 6, 7 | sparse (fx, second lead), often silent | 8 | 88 |
| 8 drums | kick, snare, 16th hats | 40 | 184 |

| Case | Blocks stored | Block bytes (+3 B record header each) | Sectors of 96 | Rows |
| --- | ---: | ---: | ---: | ---: |
| No deduplication, 6 of 8 tracks active in every row | 38 × 6 = **228** | ≈ 38 × 1020 ≈ **39 KB** (10 %) | ≈ 10 | 38 |
| No deduplication, all 8 tracks dense (worst realistic) | 38 × 8 = **304 → exceeds 255 ids, import refused** | ≈ 122 KB (31 %) | ≈ 30 | 38 |
| With deduplication, usual song structure (4-bar loops, intro/verse/chorus/break repeated; 25–40 % distinct) | **60–90** | **10–16 KB** (3–4 %) | 3–4 | 15–25 after merging |
| With deduplication, through-composed, nothing repeats | same as no dedup | | | |

Conclusions: pool **bytes** are not the constraint for one song (even the dense case is a
third of the pool); the **255 block ids per song** and the **128 rows** are, and a 5-minute
song without deduplication sits at or above the id limit. Deduplication is therefore
required, not an optimisation. Sixteen songs share the 96 sectors (24 KB each on average),
which fits the deduplicated case comfortably and the undeduplicated dense case for only
three or four songs.

## 7. Transfer interface and stub

One interface, two implementations, selected by capability:

```js
// web/import/song-transfer.js — every call returns a Promise; `song` is the browser model
TabbySongTransfer = {
  name,                       // 'stub' or 'device'
  describe(),                 // {songs:16, rows:128, blocks:255, blockSectors:96, poolBytes:393216, real:false}
  validate(song),             // [] or a list of {rule, where, message}; never touches a device
  plan(song, slot),           // {record:{kind:5,target:slot,bytes}, sectors:[{kind:6,target,bytes}], bytes, queries, seconds}
  exists(slot),               // {empty:true|false|'unknown', name, rows, blocks}  → the replace warning
  write(slot, song, {progress, signal}),   // runs plan(), uploads, reads back, compares
  read(slot)                  // song model from the device (Step 4)
}
```

- **Stub (until Task 03 Step 2 is merged):** `validate` applies the section 1.4 rule list;
  `plan` serialises with the spec encoding (block records packed into 4 KiB sector images
  with the 16 B header, song record with the field list) and reports byte counts, sector
  count, number of 64-byte queries and an estimated time (about 10 ms per query on the
  existing protocol: a 10-sector song ≈ 700 queries ≈ 7 s); `exists` returns `'unknown'`, so
  the UI always shows the replace warning; `write` performs validate + plan, then shows
  "would send …" and offers the plan as a downloadable JSON. No MIDI port is opened.
- **Device (Step 4):** `exists` reads the song record with `download(5, slot)`; `write`
  uses `upload(5, …)` and `upload(6, …)` through `FM1Workbench`'s `deviceProject` wrapper
  so busy state, connection and the save dialog behave like project saves; readback and
  byte compare as `saveProject` does. Selected only when capability bit 2 is present.
- The write step is a separate button after the song is loaded into the browser; the
  browser model is also saved and reloaded as a versioned JSON file
  (`<name>.tabby-song.json`: tempo, project slot, mapping, rows, blocks, warnings) for the
  Step 3 round trip, and converted to the Task 03 binary song file once that exists.

## 8. Where the code goes, given the parallel-work rules (needs your decision)

The task says "new code goes in web/" and "do not touch sdk/", but the workbench UI and all
its JavaScript are in sdk/ and Task 03 is editing those files. Proposal:

- `web/import/midi-parse.js` — SMF type 0/1 parser (own code, about 200 lines: header,
  variable-length quantities, running status, channel events, meta 0x03/0x51/0x58/0x2F,
  SysEx skipping). I recommend writing it rather than adding a library: nothing to add to
  THIRD_PARTY.md, nothing to inline. Alternatives if you prefer a library: `midi-file` (MIT,
  small) or `@tonejs/midi` (MIT, larger); both are compatible with GPLv3 + exception.
- `web/import/midi-song.js` — parts, quantization, mapping, deduplication, warnings, stats.
- `web/import/song-format.js` — the spec encoding, validation rules, pool estimate, JSON
  save/load.
- `web/import/song-transfer.js` — the interface, stub now, device later.
- `web/import/import-ui.js` — the Import MIDI panel as a self-contained DOM component
  (`mount(container, {transfer, workbench})`), English strings for now.
- `web/import/index.html` — a standalone development page that loads the files above as
  classic scripts (works from `file://`, no build step) so the importer can be used and
  reviewed before merge.
- `tests/midi-import/*.mjs` and `tests/midi-import/fixtures/` — Node tests; fixtures are
  generated deterministically by a script (bass line, 64-bar multitrack with repeats, pad
  under melody, 5+ notes per step, off-grid, 3/4, tempo/CC/program changes) plus **one real
  Renoise export from you** (please drop a .mid into the worktree or tell me where one is;
  I could not confirm Renoise's division and track layout from public sources and will not
  guess).
- `docs/tasks/TASK-02-notes.md` — scope, mapping rules, limits, done, left to build, left
  to test.
- **Step 4 integration** (after merge, about 15 lines in shared files): two placeholders in
  build-web.py and Update.html.in to inline the scripts, a `<details class="library-group">`
  "Import MIDI" entry in the Library tab that calls `mount()`, I18n.js entries for the
  strings, and the real transfer. Until then the only shared file I would like to touch is
  the Makefile (a 3-line `midi-import-test` target); say no and I document the command in
  the notes instead.

Files written as classic scripts (`globalThis.TabbyMidi…` plus a CommonJS export guard) so
the same file runs in the page and in Node.

## 9. Step 2 inputs I will treat as decided unless you say otherwise

- Grid 16ths only; starts snap to nearest; lengths round to nearest step, minimum 1.
- Over 4 notes per step: keep the 4 loudest.
- Same-pitch overlap: clip the earlier note; retrigger bit never set.
- Tempo: first set-tempo, integer, clamped 30..300; song tempo written as the song's tempo
  override, project tempo untouched.
- Rows: 4 bars per row for 4/4 (64 steps); other meters per section 4, pending open point 1.
- OUT CH: recorded in the browser song metadata and shown in the preview and checklist,
  not written to the device (open point 3).
- Target project slot: defaults to the song slot; selectable.
- No loop flags by default.

## 10. Risks

- Task 03 Step 2 may change the encoding (packed records vs fixed slots was open point 3
  of the Task 03 report). Everything encoding-specific is isolated in song-format.js.
- The row-length question (1.4 item 1) changes the bar-to-row table; the rest of the
  importer is unaffected.
- A long Renoise export with many instruments produces more than 8 parts; the assignment UI
  handles it, but the result may need two songs. Not in scope: splitting one file into
  several songs automatically.
