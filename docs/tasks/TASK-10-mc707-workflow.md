Classic Tabby, Task 10: MC-707 workflow port, Step 1 assessment (read only)

Version 0.2
Revision log:
- v0.2, 2026-11-07: priority order revised (timing and external clock first); the event-list clip format is the preferred direction, to be proven or rejected on cost; a capacity table for each USER boundary option; every update and recovery path checked against a moved boundary; MC-707 limits are conventions, not ceilings; chorus decided out.
- v0.1, 2026-11-07: first version.

Save this task text to docs/tasks/TASK-10-mc707-workflow.md and commit it before you start. If you already started from v0.1, replace the saved text with this version and carry on from where you are.

ROLES
You are the implementing agent. I review your work with Claude in the desktop app, which acts as the orchestrator. This task is Step 1 only: research, measurement and design. Change no firmware, workbench or storage code. Do not flash or send anything to the device. Stop at the end with the assessment and wait for review.

GOAL
Classic Tabby moves from "song player with track launching" to an eight-track MIDI groovebox whose sequencing and performance workflow is modeled on the Roland MC-707: tracks, clips, step editing, real-time recording, clip launching, clip chains, scenes, scene chains and projects, all usable on the SMK-37 itself. It stays an external-MIDI orchestrator first. The MC-707 is the reference for how it should feel to operate. It is not a ZEN-Core synth, sampler workstation, audio looper or effects box. Do not copy Roland code, content or branding.

Priorities when they conflict, highest first:
1. Accurate eight-track MIDI playback with the existing exact timing (480 units per step, timed notes), and external clock sync. No regression to 16th-note timing.
2. Clip creation, editing, launching and quantized switching on the device.
3. Real-time recording and overdub with unquantized timing kept.
4. Clip chains, scenes, scene chains and song arrangements.
5. MIDI PC, bank and CC automation for external instruments and effects (device library, rig profiles and the importer stay).
6. FM6 (the DX7 engine) and basic drums.
7. The existing reverb and delay controls, only if cheap to expose.
8. Anything else, only if resources remain.

The MC-707 is the workflow reference, not a spec to copy. Its limits (16 clips per track, 128-step clips, 8 scenes per bank) are interface conventions. Exceed them wherever that costs little and helps external MIDI work, and say where you would.

FACTS YOU MUST WORK FROM (check each against the current source; tell me if any is wrong)

1. The stock pattern sequencer, all six synth engines, the reverb and the delay live in the closed SDK, sdk/lib/libfm1_engine.a. It is linked whole-archive, and Test-Firmware requires the SRAM entry points of the sequencer and the engines. None of it can be removed or edited, and removing app-side engine glue does not shrink the SDK. web/engine/sequencer.c is the browser simulator's copy of the stock sequencer, not firmware. So "unifying the two sequencers" means making app/song.c the only sequencer Classic Tabby uses and retiring every app-side path that drives the stock pattern sequencer. It does not mean deleting the stock sequencer. Measure what retiring those paths frees in app/.

2. The flash margin at tabby-v03.2 was 2525 bytes (app image 451396). Measure it on the current head. Nothing in this task fits in that margin. The only large lever is moving the USER boundary: Package.cs/package.py place USER at 0xFF000 minus user_bytes, and the SDK reads fm1_layout.user_bytes at boot, so the size is ours to set. The sample bank is already gone and its space is song storage (song region 462848 bytes: staging sector, 16 song records, 96 block sectors). docs/FLASH-BUDGET.md section 3.4 already lists what breaks when USER moves. Redo that analysis for today's layout. "The SDK reads the size at boot" is not proof that a move is safe. Check every path that touches flash outside the code image against a moved boundary, and say for each whether it is safe, needs a change, or is a blocker: the SDK's boot-time check, the update loader (ota.bin) and force-flash migration, the workbench update flow and its firmware and sample checks, "Check / initialize samples" and any other workbench path that writes USER at fixed offsets, Restore factory V16, switching back to official Open V01, BTIF and the Bluetooth pairing store, and what an interrupted update leaves behind. If any of these cannot be verified without hardware, say so and add it to section L.

3. Much of the MC-707 model already exists in song mode. Map it before designing anything new: a song row is close to an MC-707 scene (one block per track), a block is close to a clip, per-track launch at the next bar is close to clip launch at the master clock, row order plus repeat plus loop-here is close to a scene chain with LENGTH, and row events are close to the MC-707's per-clip program change. State where each mapping holds and where it breaks. Prefer evolving song.c and song_storage.c over a parallel system, and keep one transport.

4. MC-707 reference points (from Roland's Reference Manual eng02 and the update manual eng08; verify them yourself and add what matters):
   - 8 tracks, up to 16 clips per track, one project holds one song.
   - Clip settings: STEP LEN 1 to 128, SCALE 1/8, 1/16, 1/32, 1/4T, 1/8T, 1/16T, direction modes, shuffle, transpose.
   - Clip launch, stop and scene recall land on the master clock (the "12 o'clock" point). The master clock cycle is set by its own SCALE and STEP LEN (2 to 128).
   - Clip chain (v1.30): NEXT CLIP is STAY, STOP or CLIP 1 to 16, plus a LENGTH of OFF or 1 to 512 steps. There is no repeat count; repeats come from LENGTH. A repeat count is an allowed improvement for us.
   - Scenes store the combination of playing clips. Long press stores, press recalls at the master clock. v1.50: up to 128 scenes (16 banks of 8, or 8 banks of 16). v1.71: scene chain plays scenes in order, each with a LENGTH counted in master clocks.
   - Recording: real-time REC and overdub into a clip, step input, TR-REC style drum entry with pads as steps, input quantize, playback quantize per clip and master, count-in 1 to 128 steps, metronome.
   - Per-clip program change with bank MSB/LSB (v1.50, v1.80). Motion records up to four parameters plus pitch bend per clip (v1.80). Undo up to 10 levels.
   - Pad modes include MUTE (pads 1 to 8 play or stop tracks, 9 to 16 mute) and CLIP.
   Reference manual: https://static.roland.com/assets/media/pdf/MC-707_Reference_eng02_W.pdf
   Update manual: https://static.roland.com/assets/media/pdf/MC-707_update_eng08_W.pdf
   I also own an MC-101 now and will have an MC-707 soon, so I can check behavior on the real units during acceptance testing.

5. Hardware: SMK-37 Pro, 37 keys, 16 pads with pressure, 8 encoders, 4 faders, a 240 x 240 color LCD, the existing function and transport buttons, USB and BLE MIDI in, DIN/USB/BLE MIDI out, no DIN MIDI in. Button labels are not constraints; I will make custom stickers once the map is final.

6. Earlier decisions on record that this task may revisit, but only by asking me: Classic Tabby does not play samples (the sample bank was given to song storage); FM6 stays, mainly for previewing parts on the device; blocks hold up to 4 notes per step with exact offsets and lengths; the importer keeps exact .mid timing.

7. Decided 2026-11-07: no chorus. The rig's external effects cover it. Do not cost it.

WHAT TO PRODUCE
Write docs/tasks/TASK-10-step1-assessment.md (version header and revision log, like earlier assessments) and docs/MC707-PARITY.md. Cover:

A. Current architecture: what song.c, song_storage.c, timed_note.c, screen.c, midi_router.c, project.c and transfer.c do today, and every app-side path that still drives the stock pattern sequencer.

B. Parity matrix in docs/MC707-PARITY.md: every MC-707 sequencing, clip, scene, recording, performance and MIDI feature, each marked implemented, partial, missing, not applicable or excluded, with the source files involved. Sound engines, ZEN-Core, looper, sampling and audio effects are excluded; list them once and move on.

C. Data model: clip, clip chain, scene, scene chain, project. Answer specifically:
   - Clips per track. MC-707 has 16. Imported songs can use more distinct blocks per track than that. Propose how imported arrangements fit (clip banks, longer clips, or a conversion rule) and count distinct blocks per track in the test fixtures.
   - 128-step clips: payload size, decode buffers, RAM per playing track, edit buffer, against the measured heap and static SRAM.
   - Clip format. This is the biggest decision in the task; settle it before anything else in C. My preferred direction is an event list: a clip is a sorted list of timestamped MIDI events (note on with length or matching note off, CC, PC, bank), and the 16-pad step grid is only a view that displays and edits those events. It should give chords with no 4-note ceiling, notes that start and end between steps, overlapping notes with their own lengths, unquantized performances, and CC at any time. Prove or reject it on cost. Compare it with keeping the 4-notes-per-step grid on: flash for the scheduler, editor and recorder; RAM per playing clip and for the edit buffer; bytes per note and per CC event in storage; worst-case scheduling work per 128-frame block with 8 dense clips; how step editing works when a step holds many events (what the pads and encoders select); how the importer, row events and v2 blocks migrate; and what the existing host tests and the v1 reference replay need. Recommend one.
   - Per-clip PC/bank/CC and CC automation lanes, and how row events migrate.
   - A versioned format (block v3, record v3 or similar) with a migration from today's songs, rows, blocks and .tabby files, and nothing erased without my confirmation.

D. Timing and transport: one master clock; clip launch quantize (next bar, next master-clock cycle, end of clip); independent chains with different lengths staying in sync; scene recall; count-in and metronome (say what the click sounds through); external clock follow over USB/BLE with Start, Stop, Continue and Song Position Pointer, and loss of clock. Note that the MIDI send call is control-task only and untimestamped (SPEC 9.6).

E. Recording: where note timestamps would be taken (key scan ISR, router input, control task) and the jitter of each; overdub merging; input quantize; undo depth and its RAM cost.

F. Storage while performing: when flash writes and sector erases may happen, what they do to audio and MIDI timing (the SDK runs audio and scan code from SRAM, so measure or find out what an erase does to the control task), and a proposal: edit in RAM, commit by explicit save or when stopped, with staging and crash recovery as today.

G. Control map: a complete first draft for the SMK-37: short press, long press, SHIFT combinations, encoders, faders (tracks 1 to 4 and 5 to 8 with pickup), pad colors for playing, queued, selected, being edited, stopped, muted and empty clips, the screen pages, transport, error feedback. Cover the common stage actions in one or two presses: launch a clip, stop a track, recall a scene, mute, record, step-edit. Use the MC-707 conventions where they fit, and the MC-101's 16-pad clip grid as the closest example for 16 pads.

H. Resource budget: flash, static SRAM, heap and CPU for each proposed phase, measured where possible and marked as estimates where not. State plainly which features cannot fit without moving USER, and which cannot fit at all.

   Then a capacity table for each USER boundary option: no move, 64 KiB, 96 KiB and 128 KiB. Use the clip format you recommend in C, and define a "realistic song" from the test fixtures and the imported Wrong Room material (say how many tracks, clips, notes and CC events it holds). One row per option, with these columns:
   - Application space: added code bytes, and which roadmap phases that buys.
   - Song storage: bytes, sectors, and how many realistic songs fit.
   - Clips: how many clips one song can hold, and per track.
   - MIDI events: how many notes and how many CC events fit in total and per song.
   - Drum samples: what is left for one user drum-sample slot if it comes out of song storage, in seconds at the codec rate, and what that leaves for songs.
   - Recovery: safe, needs changes, or blocked, from the path check in fact 2.

I. Drums and effects:
   - Drums: compare (1) the existing 808 engine in the SDK, which needs no sample storage, with (2) a user drum-sample region, giving capacity in seconds at the SEA codec rate for 32, 64 and 128 KiB, voices and what it takes from song storage. The SDK sampler code is still linked, so check what app glue and transfer support a region would need back.
   - Effects: reverb and delay are already in the SDK; say what UI glue they need and what they apply to (internal FM6 and drums only). No chorus.

J. Removals and simplifications, each with bytes freed and what depends on it: app-side stock sequencer paths and pages, the factory DX7 bank, project-pattern UI, anything else.

K. Phased roadmap. Phase 0 must be "make room" (the USER decision and the removals) because nothing fits today. After that, follow the priority order above: timing and external clock, the clip format and migration, the clip grid with launching and quantized switching, step editing, recording and overdub, clip chains, scenes and scene chains, PC/CC automation, FM6 and drums, then reverb and delay controls. Give each phase its acceptance tests, split into host/simulator tests and hardware tests, and say what the MC-707 behavior check is for it.

L. Hardware measurements needed before Phase 1: list what must be measured on the real SMK-37 (control loop period under load, MIDI out jitter, flash erase stall during playback, key scan to router latency, and anything else the design depends on), with a procedure for each. If a measurement needs an instrumented build, describe the build; do not publish or flash it. Note which items from the open hardware checklists in BUILD.md 19.5 (Task 06) and 23.5 (Task 09) overlap.

M. Risks, fallbacks, and the decisions you need from me, written as short questions with your recommendation for each.

RULES
- Read only. No changes outside docs/tasks/ and docs/MC707-PARITY.md. Commit them; do not push and do not tag.
- Check the current source and build, not release notes. Measure with make firmware and tools/linux/flash-budget.py.
- Mark every number as measured or estimated.
- Plain language in the documents. Short sentences.
- When done, give me a summary of no more than 40 lines: the clip format recommendation with its main costs, the five biggest findings, the capacity table, and the decision questions.
