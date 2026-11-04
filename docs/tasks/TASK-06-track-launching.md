Classic Tabby, Task 06: Independent track launching
Revision log:
- v0.1 2026-11-03: first draft.

PROBLEM
Song mode only jumps all eight tracks together. Live, I need to keep drums and bass going and bring in a different melody on the next bar, drop a part out, and bring it back, without building a row for every combination. Without independent track launching the song mode is not much use on stage.

CONTEXT
Classic Tabby (~/Documents/Classic Tabby/firmware, branch classic-tabby/linux-build). Read PROJECT-BRIEF.md, docs/SPEC.md, docs/BUILD.md, docs/FLASH-BUDGET.md, section 9 of docs/tasks/TASK-03-step1-assessment.md, and the Task 04 and Task 05 docs first. Song mode has 16 songs, up to 128 rows, a block per track per row, row events (PC, bank, CC) with pre-firing and per-device gaps, queued whole-song row jumps on the pads, and (after Task 05) timed notes with offsets and exact lengths.

TWO PERFORMANCE MODES, BOTH KEPT
1. Scene changes: the existing whole-song row jump. Unchanged in behavior.
2. Track launching: new. Each track launches, loops and stops on its own.

FIXED DECISIONS (mine, do not reopen)
- A track's patterns are its blocks in the current song's rows. "Pattern N" for track T is T's block in row N. Its loop length is row N's step length. No new pattern storage.
- Independent queues: pressing a pad queues a new pattern for one track only. The other seven tracks are not touched.
- Next-bar launch: a queued pattern starts on beat 1 of the next bar (16 steps of the global clock), in sync with the master clock. A newer press on the same track before the bar replaces the queued one.
- Independent looping: a launched track loops its pattern until I queue a replacement or stop it. Tracks with different loop lengths run independently (polymeter is fine).
- Quantized stop: stopping a track takes effect at the next bar. Every sounding note on that track gets its Note Off on the channel it was sent on. No hanging notes, ever.
- Launch replacing a playing pattern: notes from the old pattern that are still sounding at the bar get their Note Off at the bar. The new pattern starts at its step 0.
- Master transport runs continuously. Launching resets only that track's playhead. It never resets the global clock, the bar count, MIDI clock out, Song Position Pointer, or any other track's playhead.
- Timed notes: notes with negative offsets on step 0 of the new pattern pre-fire before the bar, using the same decode-ahead as rows. If the press comes too late for that, the note plays at the bar and counts in the LATE counter.
- Program changes for a launch: when track T launches pattern N, send row N's events whose channel is track T's output channel (song override or device setting), ahead of the bar, before the pattern's first note. Use the rig's per-device gaps, and add a per-device "lead before bar" setting in the rig (default 0) for slow devices like the Blofeld. If the press leaves less time than the lead, send at once and count it late. Events on channels that belong to no track (the effects pedals) fire only on scene changes, as now.
- Scene versus tracks: a queued scene jump overrides all per-track queues. When it lands, every track plays that row's block, and a block id of 0 means that track is stopped. Between scene changes, a launched or stopped track is detached: it ignores automatic row advances and keeps looping or stays stopped. A track that was never touched since the last scene change keeps following the song rows as now. Add a per-track "back to song" action that re-attaches a track at the next bar.
- Visual feedback: pad colors distinguish playing, queued (flashing), stopped, and empty (no block). A pending stop flashes too, in a different color. The screen shows all eight tracks' states and pattern numbers at once. Check what the SMK-37 Pro pad LEDs can do (color, brightness, flashing) from app/board and report it before proposing colors.
- MIDI clock: Classic Tabby stays the clock master. Following external clock is out of scope here.
- Deferred, do not build now, but add them to BUILD.md's left-to-build list: following external MIDI clock in song mode, and CC automation inside a row (importing Renoise automation that does not fall at a row start).

STEP 1. Read-only assessment. STOP AND REPORT.
- How the song sequencer holds playheads, row buffers and decode-ahead after Task 05, and what changes to give each track its own playhead, its own queue and its own decode-ahead. Worst case: eight tracks each launching a different row at the same bar.
- RAM: decode buffers for up to eight different rows at once, versus decoding per track. Propose the cheapest design that never makes the audio thread wait on flash.
- Pad LED capabilities, and the control layout. My default unless you find a better fit: a TRACK LAUNCH page. SHIFT plus pads 1 to 8 selects the track. Pads 1 to 16 then show that track's patterns (rows 1 to 16, with a page control for rows above 16). Pressing a pattern pad queues it; pressing the playing pattern's pad queues a stop. One pad combination for "back to song". The scene-jump page stays as it is, and one button switches between the two pages. Propose changes if the hardware or the existing controls make this awkward.
- How row events map to tracks by channel, including a track on the "use device setting" channel.
- Flash cost estimate against the margin after Task 05. I want at least 2 KB left after this task. If that will not happen, list removal candidates with sizes (the BLE page, EFFECTS page and NAME page were candidates before).
- Workbench changes, if any (for example the lead-before-bar rig setting, and showing per-track pattern numbers in the song editor).

STEP 2. Implement after I approve.
- Per-track playheads, queues, decode-ahead, quantized launch and stop, Note Off handling, detach and back-to-song, per-track events with lead time.
- TRACK LAUNCH page, pad LEDs, screen overview.
- Workbench rig setting for lead before bar.

STEP 3. Tests.
- Host and simulator: a launch on one track starts at the next bar and leaves the other seven playheads, the bar count and MIDI clock untouched; two presses before the bar keep only the last; stop at the next bar sends a Note Off for every sounding note, including notes started with negative offsets and notes ringing past the bar; a 16-step pattern on one track and a 48-step pattern on another loop independently for 64 bars with no drift; all eight tracks launching different rows at the same bar play every note on time; a scene jump overrides pending track queues and re-attaches all tracks; a detached track ignores row advances and back-to-song re-attaches it at the next bar; per-track PC goes out before the pattern's first note with its lead time and gaps; a late press counts late; no stuck notes across any of this.
- Simulator check: a scripted performance of 32 bars with launches, stops and a scene jump; every MIDI out note lands within one block of its expected time, and every Note On has a matching Note Off.

STEP 4. Hardware checklist for me.
- On the device with the M8 and a timestamped MIDI monitor: launch a new melody on one track while drums and bass play on, stop and restart a track, launch on all eight tracks at once, mix in a scene jump, and confirm pad colors and flashing match what is queued. Confirm no hanging notes on any synth, and that the M8 stays locked to clock throughout.

RULES
- Stop and ask before any change to data layouts that affects existing projects or songs.
- Never write factory calibration or any region outside USER.
- Update SPEC.md, BUILD.md, FLASH-BUDGET.md and section 9 at each checkpoint.
- Comment heavily. Top of every new file: purpose, version, revision log. Note revision changes inline by version.
- Commit at each checkpoint with clear messages. Do not push.

FINAL REPORT
What was built, the control layout, flash and RAM cost and margin, measured timing, test results, and the hardware checklist.
