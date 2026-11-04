# Task 05, Step 1: timed notes, read-only assessment

Version: 0.1 (2026-11-03). Read-only: nothing in app/, web/ or sdk/ changed. Task text:
docs/tasks/TASK-05-timed-notes.md. Numbers come from the tabby-v02.0 tree (73d54e0), the
four Renoise exports in tests/fixtures/ run through a scratch script against
web/import/midi-parse.js and midi-song.js, the post-LTO `nm` of build/pro/sdk.elf, and a
read of app/song.c, app/midi_router.c, app/song_storage.c, web/engine/Simulator.c and
tests/midi-import/simulator.mjs.

Revision log
- v0.1 2026-11-03: first assessment, for approval before Step 2.

## 1. Orange Cat: what carries over, what does not

Read (clone of SeattleUser0/OrangeCat, branch linux-hw, in the session scratch directory;
not a remote, nothing copied): firmware/src/core.h (`recorded_note_t`, `step_t.nudge`),
firmware/src/recording.c (`recording_raw_on`, `recording_shape`, `recording_snapshot`,
`recording_valid`), firmware/src/step_snapshot.h, firmware/src/project.c
(`proj_record_pack`), firmware/src/oc_pool.c (the phrase pack). PROJECT_FORMAT_R3.md on
linux-hw has no section 8.2b; it exists on branch r3-format (v0.8, control notes), and that
is the text read: it also states how timed notes are stored (10 B in the phrase pack, 8 B
bit-packed in the project record) and edited (NOTES: move, lengthen, nudge, delete,
quantize).

Carried over (as design, written fresh):

| Orange Cat | Classic Tabby | Why |
| --- | --- | --- |
| A note is its own object: onset inside its step, duration, note, velocity, flags, one struct, one validator (`recording_valid`), one pack (`proj_record_pack`) | One module, C and JS, encode / decode / validate, shared vectors (section 2) | The task's fixed decision; it is what makes the format liftable |
| Duration as a 16-bit mantissa with a 3-bit exponent in spare bits (`recording_snapshot`: shift right until it fits, count the shifts; `recording_shape`: `duration << exponent`) | The same: 16-bit mantissa, 3-bit exponent, canonical encoding | Exact where it matters (short and medium notes), bounded loss on very long ones, no 32-bit length field |
| Playback time derived once from the stored fields and the step (`recording_raw_on`), never stored | The same: due time = anchor step × 480 + offset, computed in the tick | No second copy of timing to keep consistent |
| The step snapshot: fixed bytes, put / get functions, exact for every field (`step_snapshot_put/get`) | The 6-byte wire form with `timed_note_encode/decode`; validators refuse non-canonical bytes | Same idea, stricter: one encoding per value so C and JS bytes agree |
| Quantize as an option that moves copies, never the recording (`recording_quant_on`) | Importer and editor quantize are options, off by default, applied to the model | The fixed decision |

Done differently, and why:

- **Onset as a signed offset from the nearest step, not an unsigned fraction of the step.**
  Orange Cat keeps `on` in 0..65535 within the step the note was played in; a note early by
  5 ms belongs to the previous step with `on` near 65535. The task fixes the anchor as the
  nearest step with a signed offset, so a kick nudged early stays in the step it is heard
  against, and the editor shows "−10 u" not "+470 u on the step before". Range ±240 units.
- **Resolution 1/480 step (integer), not 1/65536 step.** The task's decision; it holds the
  listed PPQ values exactly and needs 9 bits instead of 16, which is what gets the note into
  6 bytes.
- **No per-step NUDGE field.** Orange Cat has `step_t.nudge` (64ths of a step, moving every
  note on the step) besides the note's own onset. Here the offset is per note; a whole-step
  nudge is the editor adding the same offset to each note. One field, no interaction rules.
- **Length in the note, not a release event, and no live-recording state.** Orange Cat's
  `recording_run` (held, left) and the release queue exist for live capture; Classic Tabby
  never records on the device, so the note is the complete record.
- **Fixed 6-byte wire form, no owner / bank / step bytes.** The container (the block's step
  header) names the step; song and track come from the block record. Orange Cat needs the
  owner because its store is shared by 32 banks.
- **Swing by stretching the step's own time base**, as Orange Cat's "fraction of the swung
  step", but only when the song enables swing (section 4.4).

Nothing needs to be copied. Everything above is arithmetic and layout; the Classic Tabby
code is written from this document.

## 2. The timed note encoding (proposal)

**Units.** 1 unit = 1/480 of a 16th step = 1/1920 quarter note. Ticks per quarter note
that divide 1920 are exact: 96 (20 units per tick), 120 (16), 192 (10), 240 (8), 384 (5),
480 (4), 960 (2), 1920 (1). Other PPQ values round to the nearest unit (the importer
reports the count and the largest rounding). At 120 BPM a unit is 0.26 ms, a step 125 ms.

**Fields (the object, C `struct timed_note` and the JS object):**

| Field | Range | Meaning |
| --- | --- | --- |
| pitch | 0..127 | MIDI note number |
| velocity | 1..127 | note-on velocity |
| retrigger | 0 / 1 | as 9.3 today: 1 = note-off then note-on if the pitch still sounds, 0 = legato |
| offset | −240..+240 units | signed distance from the anchor step's grid time; negative = early |
| length | 1 .. 65535 × 128 units | from the note's own start to its note-off, in units |

**Wire form: 6 bytes, little-endian fields.**

| Byte | Bits | Field |
| --- | --- | --- |
| 0 | 0..6 | pitch |
| 0 | 7 | retrigger |
| 1 | 0..6 | velocity (never 0) |
| 1 | 7 | reserved, 0 |
| 2..3 (u16) | 0..8 | offset, 9-bit two's complement (−256..255 representable, −240..+240 valid) |
| 2..3 | 9..11 | length exponent e, 0..7 |
| 2..3 | 12..15 | reserved, 0 |
| 4..5 (u16) | 0..15 | length mantissa m, 1..65535; length = m << e units |

**Canonical rule (makes bytes unique and equality byte-wise):** e = 0 unless the length
does not fit 16 bits; when e > 0, m ≥ 32768. `timed_note_encode` rounds a length to the
nearest representable value (ties up) and returns the canonical bytes; `timed_note_decode`
refuses a non-canonical pair, a reserved bit set, velocity 0, or an offset outside
±240. The validator is the decoder's rule set applied to the struct.

**Length range, exactly:**

| e | exact to (units) | in 16th steps | in 4/4 bars | resolution |
| ---: | ---: | ---: | ---: | --- |
| 0 | 65535 | 136.53 | 8.53 | 1 unit (1/480 step) |
| 1 | 131070 | 273.06 | 17.07 | 2 units (1/240 step) |
| 2 | 262140 | 546.1 | 34.1 | 4 units |
| 3 | 524280 | 1092.3 | 68.3 | 8 units |
| 4 | 1048560 | 2184.5 | 136.5 | 16 units |
| 5 | 2097120 | 4369 | 273 | 32 units |
| 6 | 4194240 | 8738 | 546 | 64 units |
| 7 | 8388480 | 17476 | 1092 | 128 units (0.27 step) |

Exact up to 8.53 bars of 4/4 (the task asked for at least 8). Every whole-step length up
to 273 steps is exact (480·L is even), so every length a v1 block can hold (1..255 steps)
converts without loss. The longest note in the four Renoise files is 232 steps
(renoise-export.mid): e = 1, exact. A length past e = 7 is clipped by the encoder and the
importer reports it (no real file comes near: 1092 bars).

**Why 6 bytes and not 5.** Pitch 7 + velocity 7 + retrigger 1 + offset 9 = 24 bits. A
5-byte note leaves 16 bits for the length: no exponent means 136 steps maximum (the files
hold 232), and a 2-bit exponent with a 14-bit mantissa is exact only to 34 steps (2 bars),
which fails the "exact to 8 bars" decision. 6 bytes gives 16 + 3 and 5 reserved bits.

**Test vectors.** One text file, tests/timed-note/vectors.txt, read by both the C host test
and the JS test: one line per vector, `ok pitch vel retrig offset length -> 12 hex digits`
for values that must encode to exactly those bytes and decode back identically, `bad ->
12 hex digits` for encodings that must be refused (reserved bits, velocity 0, offset ±241
and −256, e > 0 with m < 32768, m = 0), and `round length -> stored` for the rounding of
lengths beyond 16 bits. Range limits (offset ±240, every exponent 0..7 at both ends of its
mantissa) are in the file. The host test (`tests/host/timed_note_test.c`, in `make test`)
and `tests/timed-note/run.mjs` fail if a single byte differs.

**Module layout.** `app/timed_note.h` / `app/timed_note.c` (no includes beyond stdint; no
SMK-37, SDK or song-storage symbol), `web/timed-note/timed-note.js` (classic script and
CommonJS, like web/import/song-format.js), `docs/TIMED-NOTE.md` (the format, the
semantics, the vectors, how to lift it). The device links only decode + validate (encode
is dead code there; LTO drops it).

## 3. Block format version (section 9 proposal, v0.7)

Nothing in the CRC or packing rules changes. The one byte that changes meaning is block
record byte 1, reserved 0 since 9.4 v0.4:

**9.4 block record, byte 1: payload format.** 0 = notes v1 (9.3: 3-byte notes, 64..832
bytes), 1 = timed notes v2 (below, 64..1600 bytes). Other values invalid. The sector
header version stays 1; a sector may hold records of both formats (a song rewritten after
the update keeps old v1 records until compaction or a rewrite replaces them). The `.tabby`
file carries the same byte in its block records; the batch stream (9.6 v0.5) too.

**9.3 block payload v2 (timed notes).** 64 steps in order, each: 1 byte step header
exactly as today (count N 0..4, probability, alt bit, bit 7 = 0), then N timed notes of 6
bytes (section 2) in ascending pitch order. Minimum 64, maximum 64 + 64 × 24 = 1600 bytes.
Rules as 9.3 (same pitch twice in a step invalid; a note runs past the row end into the
next row; released at a jump or stop) plus:

- A note's time is `anchor step × 480 + offset` units on the straight grid of the row's
  steps; steps N..63 of a row shorter than 64 are still never started, but a note on step
  0 of the row that follows may sound before the boundary (its negative offset).
- `SONG_PAYLOAD_MAX` becomes 1600; the `.tabby` reader's 832 limit becomes 1600 for format
  1 records. Worst-case packing per 4076-byte sector: 2 records (1606 → 1608 aligned),
  192 blocks guaranteed for the pool (was 384); realistic content below.

**9.5 song record, header flags bit 2: swing.** 0 = the song plays on the straight grid
whatever the project's swing (new default; today's songs follow the project swing); 1 =
the project's swing setting applies (section 4.4). Bits 3..7 stay reserved. Record
versions 1 and 2 are unchanged otherwise, so every existing record reads with swing off.

**Transfer protocol (9.9):** no change; kinds 5, 6, 7 carry the records; command 23 is
unchanged. Status byte: none added.

This is a change to a FINAL format (record byte 1, payload v2, flags bit 2). It is proposed
here for the approval the task asks for; nothing is written until then.

## 4. Playback: where the 3-block spread comes from, how to get to one block

### 4.1 The path today

Audio thread, once per 128-frame block: the binary engine calls `groove_midi_clock(0,
tempo)` (app/midi_router.c), which calls `song_tick`. `song_tick` adds `tempo × 512` to a
phase and, when the phase passes the step period, calls `advance()` → `play_step()`, which
enqueues note-ons for the whole step into the router's lanes (`enqueue`, lane = track & 1,
song owner). Nothing leaves the device here.

Control task: `groove_midi_poll` drains the three lanes round-robin and calls
`fm1_midi_send_port` (control task only, no timestamp). On the device the poll runs from
the SDK's control loop (`groove_screen_control` and friends, cadence inside the binary) and
from `smk37_controls_snapshot` (the SDK's panel read). In the simulator (web/engine/
Simulator.c `sim_render`) it runs from `fm1_web_control`, which is called **once every
10 ms of rendered audio** (every 3.45 blocks). The host smoke test uses the same
Simulator.c.

### 4.2 The spread, term by term (simulator measurement of 14.2: max 3.0 blocks, mean −0.8)

| Term | Size | Where |
| --- | ---: | --- |
| Step boundary quantized to the tick: a step starts at the first tick whose phase passes the period | 0..1 block late | song.c `song_tick` / `advance` |
| Lane drain cadence: the enqueued note waits for the next control poll | 0..3.45 blocks (simulator); device: the SDK control loop's period, unknown | Simulator.c `sim_render`; the binary SDK on the device |
| Reference: the measurement takes block 0 from the Start message, which is enqueued in the same tick and drained by the same poll | shifts the mean (−0.8) | tests/midi-import/simulator.mjs |
| Lane round-robin: notes of even and odd tracks enqueued in one tick leave interleaved, one per lane per round | reorders inside one drain, no delay | midi_router.c `groove_midi_poll` |
| MIDI wire: 3 bytes at 31.25 kbit/s on DIN | 0.96 ms per message, 3.8 ms for a 4-note chord | inherent (USB: µs) |
| FM6 preview: the local copy is posted at the drain and consumed by the engine at its next block | drain + 0..1 block | `song_local` → `fm1_midi_post` |

So the band is the simulator's drain cadence (3 blocks) plus the tick quantization (1
block). On the device the second term is whatever the SDK's control loop does; BUILD.md
13.4 step 12 measures it against the stock sequencer, which uses the identical path
(`groove_midi_note` → lanes → poll).

### 4.3 Proposal to get to one block (firmware side)

1. **Position in units, exact rational accumulator.** Replace the phase/period pair with a
   song position in units. Per block the straight grid advances `tempo × 1024 / 11025`
   units (= tempo × 4 × 480 × 128 / (44100 × 60)); keep `acc += tempo × 1024; units =
   acc / 11025; acc %= 11025`. 32-bit, no rounding, no drift over any run length (the
   10-minute test is zero drift by construction). At 80 BPM a block is 7.43 units, at 120
   11.15, at 300 27.86.
2. **Window scheduling.** Each tick owns the window [p0, p1) of positions it advances
   through. A note is due at `anchor × 480 + offset`; every note whose due time falls in
   the window is enqueued in this tick, in due-time order. Candidates are the notes of the
   step containing p0, the step after it (negative offsets) and, when the window crosses a
   step boundary, the step before (late positive offsets): at most 8 tracks × 3 steps × 4
   notes = 96 comparisons per block, sorted by due time with an insertion sort over the
   handful that match. Each due time is in exactly one window, so no "fired" marks are
   needed. Error from this term: the note is enqueued at the start of the block that
   contains its time: 0..1 block early, never late.
3. **One lane for song notes.** Enqueue every song note into lane 0 (where row events
   already go) instead of lane `track & 1`, so the drain's FIFO order is the tick's due-time
   order and two notes 3 ms apart on different tracks never swap inside one drain. Row
   events keep their place (enqueued before the notes of the same tick). One line in
   `groove_midi_song_note`.
4. **Note-offs in units.** `sounding[].remaining` becomes a 32-bit unit count decremented
   by the tick's advance; a release lands in the block that contains it (same accuracy as
   note-ons; today it is step-quantized, measured within 3.5 blocks).
5. **Negative offsets across a row boundary.** The window near the end of a row reaches
   into step 0 of the row that will follow: known when `buffers[cur ^ 1].ready` and its row
   is the natural next or the queued jump target by the same landing rules `prefire()` uses
   for events. Notes found there are enqueued and marked on that buffer (a per-buffer
   "step 0 negative offsets done" flag, reset when the buffer is decoded) so `switch_row`
   does not fire them again. When the next row is not known in time (a jump queued inside
   the last half step, a loop-here row waiting, the first row at PLAY), `switch_row` fires
   the remaining negative-offset notes of step 0 at the boundary and adds one to
   `late_count` per such row entry (the existing LATE counter; SONG page and status byte
   13 unchanged in meaning: "late sends").
6. **Probability per step.** Rolled once per (track, step) when that step's first note is
   considered, kept in a 64-bit mask per track per buffer, so a chord with an offset spread
   still rolls as one step.
7. **Simulator and tests.** `sim_render` keeps its 10 ms control cadence (it models the
   device's whole control loop), and gains `sim_midi_drain(1)`: a per-block
   `groove_midi_poll()` for the timing tests, so they measure the sequencer and not the
   simulator's poll period. The 14.2 check is rerun both ways and reported both ways.

Expected result with the per-block drain: every note-on and note-off within one block of
its exact time (0..1 block early at the tick, plus the drain inside the same block), order
and gaps correct to ±1 block, no drift. FM6 preview: one block looser (the engine consumes
posted MIDI at its next block): within 2 blocks in the simulator with the per-block drain.

### 4.4 Swing

Default off: `flags` bit 2 = 0 plays the straight grid; `song_play` no longer reads the
project swing unless the bit is set. With the bit set, the project's swing (0..50 %)
stretches even steps by that share and shrinks odd steps by the same share, as today, by
scaling the per-block advance (`acc += tempo × 102400; units = acc / (11025 × (100 ±
swing))`, divisor by step parity). The consequence for a note with an offset: **the offset
keeps its fraction of the step whose time it falls in.** A note anchored on an even (long)
step with +120 units sounds a quarter of that longer step after its boundary; a note on
an odd step with −120 units sounds a quarter of the preceding (even, long) step before
its boundary; the boundaries themselves are the swung ones. Lengths are warped the same
way (a note of 480 units from an even step's start lasts that step's stretched time).
Documented in SPEC.md and section 9 with this wording.

### 4.5 What limits it

- `fm1_midi_send_port` is control-task only and has no timestamp; the audio tick cannot
  send. The floor is one block of tick quantization plus the control task's latency after
  the tick. Sub-block timing on the wire is not possible with this SDK.
- The device's control-loop period is inside the binary SDK and not documented in
  sdk/include. If step 12 of BUILD.md 13.4 shows a wider band than one block for both the
  stock sequencer and song mode, the only app-side lever left is `fm1_control_request()`
  from the tick after it enqueues; fm1.h does not state whether it is interrupt-safe (it
  is used from the routing task). That would be a flagged hardware experiment, off by
  default, and is not part of this proposal.
- DIN bandwidth: 0.96 ms per message; a 4-note chord spans 3.8 ms on DIN regardless of
  firmware timing. USB and BLE do not have this limit.

## 5. Pool capacity: the four Renoise fixtures through the new format

Same parts-to-tracks assignment, same rows (64 steps) and exact-content deduplication as
the importer today; exact timing (offsets and unit lengths) kept. Pool = 96 × 4076 =
391296 bytes.

| File | Blocks today | Bytes today | % | Blocks v2 | Bytes v2 (6 B/note) | % |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Glass Relay.mid | 98 | 10944 | 2.80 | 98 | 14868 | 3.80 |
| meridian_fault.mid | 137 | 13724 | 3.51 | 137 | 17584 | 4.49 |
| renoise-export.mid | 112 | 11024 | 2.82 | 112 | 13972 | 3.57 |
| the_space_between_wires.mid | 117 | 12300 | 3.14 | 117 | 16180 | 4.13 |

Deduplication is unchanged (Renoise repeats patterns with identical delay columns), so
the block count does not grow; bytes grow by the note count × 3. A song of 1000 notes costs
about 3 KB more. The pool still holds roughly twenty songs of this size at once (16 slots).

What the files actually contain (all four are 96 PPQ, exact):

| File | Notes | Off-grid starts | Largest offset | Fractional lengths | Longest note | Max notes per step |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Glass Relay (110 BPM) | 1617 | 126 (7.8 %) | 40 u = 11.4 ms | 165 (10.2 %) | 176 steps | 4 |
| meridian_fault (104) | 1532 | 91 (5.9 %) | 100 u = 30.0 ms | 182 (11.9 %) | 146 steps | 3 |
| renoise-export (80) | 1002 | 193 (19.3 %) | 60 u = 23.4 ms | 139 (13.9 %) | 232 steps | 4 |
| the_space_between_wires (104) | 1300 | 250 (19.2 %) | 100 u = 30.0 ms | 130 (10.0 %) | 184 steps | 3 |

Every offset is a multiple of 20 units (one 96-PPQ tick = 1/24 step), all are late (Renoise's
delay column), none exceeds 100 units; today's importer discards all of them (nearest-step
snap) and rounds 10..14 % of the lengths. **Notes per step: no step in the four files holds
more than 4 notes under nearest-step anchoring, so the limit of 4 stays.** No file has a
negative offset on a row's first step (the feature is still needed for nudged-early kicks on
bar 1 of a row, which Renoise can produce only through a negative delay on the previous
line's note; the test fixture will be built with make-fixtures).

## 6. Flash cost estimate (post-LTO bytes; margin 4669 after Task 04)

| Change | Estimate | Basis |
| --- | ---: | --- |
| app/timed_note.c: decode + validate (encode dropped by LTO on the device) | +180 | `song_payload_valid` is 162 B for simpler rules |
| app/song_storage.c: payload format byte in `next_record`, batch and append validation by format, v2 validator calling the decoder, `SONG_PAYLOAD_MAX` 1600, flags bit 2 allowed | +160 | current validator 162, `song_record_valid` 524 |
| app/song.c: unit position and accumulator, window scheduler replacing `play_step` (312) and the step logic of `advance` (296), due-time ordering, lane 0 | +350 | the scheduler is the same loops over 3 steps instead of 1 plus a sort over ≤ 96 |
| app/song.c: note-offs in units, 32-bit remaining | +40 | |
| app/song.c: negative offsets across the boundary, per-buffer done flag, late count | +180 | `prefire` for events is 332 |
| app/song.c: probability mask per step, v1 normalisation in `decode_row` (offset 0, length × 480, exact), swing flag | +130 | `decode_row` is 392 |
| app/midi_router.c, app/screen.c, app/transfer.c | 0 | lane constant; no new page text; lengths already u16 |
| **Total** | **+1040 (range +900 .. +1400)** | |
| **Margin after** | **≈ 3630 (worst case ≈ 3270)** | above the 2 KB floor |

The floor holds with about 1.2 KB to spare in the worst case. Removal candidates, in
case the measurement lands above the estimate (not proposed now):

| Candidate | Bytes | Note |
| --- | ---: | --- |
| Transfer kind 6 (single-block upload) and `song_block_append` | ≈ 420 | the workbench writes only kind-7 batches since checkpoint (e); kind 6 stays in the protocol table as "unsupported" |
| SONG page EVENTS / LATE line | ≈ 120 | the status byte still reports both to the workbench |
| `song_storage_status` reclaimable scan | ≈ 100 | "Storage status" would show free bytes only |

## 7. RAM cost

| Item | Today | After | Change |
| --- | ---: | ---: | ---: |
| Two row buffers, 8 tracks × 64 steps × cell (1 + 4 × note bytes) | 2 × 8 × 64 × 13 = 13312 | 2 × 8 × 64 × 25 = 25600 | +12288 |
| Decode payload buffer (`SONG_PAYLOAD_MAX`) | 832 | 1600 | +768 |
| Sounding table, 8 × 16 entries, remaining u8 → u32 | 256 | 640 | +384 |
| Tick candidate list (≤ 96 × 4 B), probability masks (2 × 8 × 8 B), position state | 0 | ≈ 560 | +560 |
| **Static SRAM** | 302580 | ≈ 316580 | **+14.0 KB** |
| Runtime heap (minimum 49152) | 221036 | ≈ 207036 | −14.0 KB |

The row buffer is the worst-case payload (64 steps of 4 notes) and the cell grows with the
note; a 5-byte RAM cell is not possible (43 bits of fields). Capping notes per block below
256 would shrink it but would refuse valid blocks, so it is not proposed. The heap keeps
4.2 × its minimum.

## 8. Editor UI for offset and length (workbench song editor, Library tab)

Today a step is one text input: `60:100:2 64:100:2r @3 !` (pitch:velocity:length, r =
retrigger, @n = probability, ! = alt). Proposal, two levels:

1. **Step text, extended, stays the fast path.** A note token becomes
   `pitch:velocity:length[/offset][r]` with length in steps as a decimal (`2`, `2.5`,
   `0.25`, three decimals shown when needed; stored as the nearest unit) and the offset as
   signed units after a slash: `36:120:1/-10`, `38:90:0.5/+20r`. No slash = offset 0, so
   every existing step text parses unchanged. A unit is small (0.26 ms at 120 BPM), so the
   token also accepts `ms` with the song's tempo: `36:120:1/-3ms` is converted and shown
   back as units. Inputs holding any offset or fractional length get a left-border tint so
   nudged steps are visible at a glance across the 64-step grid.
2. **Note inspector for the focused step.** Below the grid, a small table for the step the
   cursor is on: one row per note with pitch, velocity, retrigger, **offset** (number input
   in units, next to it the read-outs `−1/48 step` and `−2.6 ms @ 120 BPM`, recomputed when
   the song tempo field changes; the fraction is reduced, 20 u = 1/24, 240 u = 1/2) and
   **length** (steps and remainder: `2 steps + 240 u`, read-out `2.500 steps`, `312.5 ms`).
   Arrow keys on the offset field step by 1 unit, with Shift by 20 (one 96-PPQ tick), with
   Alt by one millisecond at the song tempo. Edits write back to the step text and vice
   versa.
3. **Block actions:** "Quantize starts" and "Quantize starts and ends" to the 16th grid for
   the block in the editor (the same functions the importer's option uses), with the
   change count shown in the message line. Undo is the existing block reload.
4. **Importer panel:** a "Quantize" select, default "Off (exact)", options "Starts to
   16ths", "Starts and ends to 16ths"; the warning list shows only real changes
   (section 9). The importer's summary line adds "n notes with offsets, m fractional
   lengths" so the user sees what was kept.

Display at a glance is the tint plus the inspector's fraction and ms read-outs; the task's
"signed fraction of a step and ms" is item 2.

## 9. Importer changes (for Step 2)

- Convert exactly: anchor = nearest step (ties to the earlier step, offset +240), offset =
  start units − anchor × 480, length = end − start in units (minimum 1). PPQ not dividing
  1920: every tick is scaled by 1920 / PPQ and rounded to the nearest unit; one warning
  with the note count and the largest rounding in units and ms.
- Same-pitch overlap on a track: the earlier note's length is clipped to the next start,
  in units (warning as today). More than 4 notes anchored on one step: the overflow rule
  as today (warning). Both are "real changes" and stay.
- `moved` and `lengthRounded` warnings appear only with the quantize option on; `lengthMin`
  only when a note is shorter than one unit (never for the listed PPQ values).
- Row events are untouched (Task 04 window rule stays on the straight grid).
- Dedup keys include offsets and lengths (exact bytes, as today).

## 10. Old-format songs: proposal and cost

**Proposal: the firmware reads v1 blocks as offset 0 and whole-step lengths (option A).**
`decode_row` normalises a format-0 record into the same RAM cell as a v2 note (offset 0,
length L × 480 units, exact for every L); the v1 validator stays for stored and uploaded
v1 records; playback has one code path. The workbench reads both formats, shows v1 blocks
with offset 0 and whole-step lengths, and **always writes format 1**, so a song is
converted the next time it is written; `.tabby` files from tabby-v02.0 import unchanged.
A v1 song's timing is identical to today except swing, which is now off unless the song
flag is set (the task's decision; noted in the release note and SPEC.md as the one
audible difference for an old song played with a non-zero project swing).

Cost: option A keeps the 162-byte v1 validator and adds the ≈ 70-byte normalisation
(+70 net, included in section 6). Option B (refuse with a screen message "OLD BLOCK
FORMAT: REWRITE SONG IN WORKBENCH", no v1 decode) would drop the v1 validator and add
the check and message (≈ −162 + 130 = −30 net), about 100 bytes cheaper than A, and
would leave every song written by tabby-v02.0 unplayable until rewritten. A is proposed:
100 bytes is inside the margin and the device keeps playing what is on it.

## 11. Open points for the approval

1. Section 3's format changes (record byte 1, payload v2, flags bit 2) as the v0.7 text of
   section 9.
2. The anchoring tie rule: a note exactly half a step after a grid line belongs to the
   earlier step with +240 (consistent with the importer's existing "ties toward the earlier
   step"); −240 is then only produced by hand.
3. Song notes in one lane (section 4.3 item 3): it changes nothing audible except the order
   inside one drain; the stock sequencer's lanes are untouched.
4. The simulator's per-block drain as a test switch, not the default (section 4.3 item 7).
5. The `fm1_control_request` experiment (section 4.5) stays out unless the hardware
   measurement asks for it.
