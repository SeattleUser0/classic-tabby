# Task 07, Step 1: measurements and assessment (read only)

Version 0.1, 2026-11-04. Branch `classic-tabby/dev-checks` (worktree `firmware-devchecks`), head
6f4b3fc = linux-build 56b09d3 + the task text. No tracked file other than the two task docs was changed.
Raw logs, hash snapshots and the driver script are in the session's scratch directory, not in the repo.

Revision log
- v0.1 2026-11-04: first measurement series.

## 1. How the measurements were taken

One driver script, run through `flock /tmp/oc-suite.lock systemd-run --user --scope -p MemoryMax=12G`,
on a tree with `build/` removed first. It timed every target in order, twice (run 1 cold, run 2 warm
on the same tree with nothing changed), hashed every file under `build/` after each run, recorded the
files each target wrote and `git status` after each target, then built and ran the host suite under
ASan+UBSan into a scratch directory. The script was queued at 08:06:52 UTC and got the lock at
09:49:33 UTC: an Orange Cat suite held it for **1 h 43 min**. The whole Classic Tabby series then
took **3 min 53 s** (load average 2 to 3 throughout: Session A and the Orange Cat sessions kept working).

## 2. Timings (seconds, wall clock)

| target | run 1 (cold) | run 2 (warm) | what it does |
|---|---|---|---|
| `make test` on an empty build/ | 19.2 | | host-smoke + timed-note + web (wasm) + web-smoke + workbench-test |
| verify | 1.0 | 1.0 | manifest, synth.json, toolchain pins |
| firmware-native | 4.3 | 4.0 | 16 compiles + LTO link + package, Track B. **Never incremental**: obj/ is wiped every run |
| firmware-ref | 13.4 | 12.9 | the same under Wine (Track A) |
| crosscheck | 16.9 | 17.1 | rebuilds both tracks, compares 3 hashes |
| web | 10.4 | 0.6 | wasm compile; warm run is a cache hit on the source hash |
| web-smoke | 0.1 | 0.1 | Node |
| host-smoke | 8.8 | 0.1 | one gcc command over 36 .c files (cold), then the run (140 checks) |
| timed-note-test | 0.3 | 0.1 | C + JS, 804 checks |
| workbench-test | 0.2 | 0.2 | Node (song-write, devices) |
| midi-import-test | 1.6 | 1.1 | regenerates the fixtures, runs the importer tests |
| midi-import-sim | 7.5 | 7.6 | plays the Renoise export and the row-events song through the wasm; **never cached** |
| test | 0.4 | 0.4 | the four sub-targets, all warm |
| flash-budget | 2.6 | 0.2 | the -fno-lto map is built once |
| package | 4.6 | 4.6 | firmware + the distribution page |
| hosted | 0.3 | 0.3 | Build-Hosted.cjs into build/hosted/pro (no git worktree without --commit) |
| package-equivalence | 0.0 | 0.0 | skipped, no pwsh |

What a session runs before saying "suites pass" (`make crosscheck`, `make test`, `make midi-import-test`,
`make midi-import-sim`): **about 45 s cold, 27 s warm.** The dominant items are the Wine build (13 s, in
crosscheck), the cold wasm compile (10 s), the cold host-suite compile (9 s) and midi-import-sim (7.5 s
every time). Everything else is under 2 s. The dominant cost on this machine by far is not any target
but the **lock wait**: 103 minutes for 4 minutes of work.

All runs passed: crosscheck IDENTICAL on sdk.elf, .fwsc and app-image.bin; host 140 checks; timed note
804 checks; the Node suites all "passed".

## 3. Warnings, by file

- **Host suite build** (gcc 15.2, the Makefile's `-Wall -Wextra -Wno-unused-function -Wno-array-parameter
  -Wno-attributes -Wno-misleading-indentation`): **0 warnings.**
- **Native firmware build** (JieLi clang 4.0.1 with the build's flags: `-Wuninitialized`,
  `-Wno-invalid-noreturn`, `-Wno-shift-negative-value`, `-Wframe-larger-than=2560`, no `-Wall`): **0 warnings.**
  The compiler's stderr is not captured by build.py, so a warning would have shown.
- **wasm build** (`-Wall -Wextra -Werror`): 0.

What the suppressions hide (host gcc `-Wall -Wextra` per file, no `-Wno-*`): 95 warnings, none in a
condition that fails on the target:

| count | file | kind |
|---|---|---|
| 39 | web/engine/sound.c | attributes (`minsize`, a clang attribute gcc ignores), misleading-indentation |
| 19 | web/engine/sequencer.c | attributes, misleading-indentation |
| 18 | third_party/synth/dsp_math.h | attributes, misleading-indentation |
| 7 | web/engine/edit.c | attributes |
| 3 each | web/synth/dx7synth.c, third_party/synth/drum808.c, app/screen.c | array-parameter, misleading-indentation, attributes |
| 1 each | third_party/synth/pluck.c, bass303.c, app/midi_router.c | misleading-indentation, attributes |

By kind: 69 `-Wattributes` (all the `minsize` attribute), 23 `-Wmisleading-indentation` (web/engine and
third_party/synth only), 3 `-Warray-parameter=`. In app/ only the 4 `minsize` attribute lines
(midi_router.c:92, screen.c:1131, 1176, 2439), which are correct for the target compiler.

The target compiler with `-Wall -Wextra` added (`-fsyntax-only`, 0.6 s for the 16 units): **3 warnings**:
`app/board/scan.c:369` unused variable `adc_con`; `app/screen.c:1570` and `:2346` missing field `state`
initializer. These are the ones a `make lint` should show first; they do not appear in any current build.

Analyzer samples (not part of any target today): cppcheck 2.19 on app/screen.c alone (5 s) reports
`app/screen.c:109:32 arrayIndexOutOfBoundsCond` (the punctuation glyph table, index 93 of 32 when the
condition `*s <= '~'` holds; to be read, not fixed here). Over the whole compile database cppcheck stops
at once on `sdk/include/libc/machine/ieeefp.h:436 #error Endianess not declared` because it does not know
the target's predefined macros; `-D__IEEE_LITTLE_ENDIAN` (or `-D__LITTLE_ENDIAN__`) fixes that. clang-tidy 21
(bugprone-*, clang-analyzer-*) over a host-stripped database: 55 s, 0 findings, but two units fail to parse
on the host (`app/board/scan.c:754`, `app/board/audio.c:27`: `__attribute__((interrupt("")))` is a target
attribute the x86 clang rejects), so a lint target must define `___interrupt` away or skip app/board for
the host analyzers.

## 4. Sanitizers

Host suite (same 36 sources, same flags as host-smoke) with `-fsanitize=address,undefined
-fno-omit-frame-pointer`, built into a scratch directory, run from the repository root as `make host-smoke`
runs it. Build 26 s (22 s strict), run 0.4 s.

- Recoverable run (`halt_on_error=0`, leak detection on, every finding printed): **0 findings**, exit 0,
  "all checks passed" (140 checks).
- Strict run (`-fno-sanitize-recover=all`): passes.
- timed_note test under the same sanitizers: 804 checks, 0 failed, no findings.

So `make host-sanitize` would be green from the first day; there is nothing to fix.

## 5. Does any test write over build outputs? (run 1 against run 2)

No. Of the 300 files under `build/` only `build/pro/sdk.map` and `build/ref/pro/sdk.map` differ between
the runs, because the LTO object is named `/tmp/lto-llvm-XXXXXX.o` (random) and the map records that
name; the map is not a shipped output. Every other file, including the five gate files, is byte-identical:

```
b35aff61587afe9477188bf4b200a7335ef4fc6f180e81bf583c173201dbf4e5  build/pro/sdk.elf
0fb5c158c213bdd71645d2d9bac9c50543fcb4987391df227d4da8babfa088bf  build/pro/generated/SMK37_PRO_OPEN.fwsc
3436a996b11cf18912c355ed2db3960e0ca865464a81f4ed7ebc181dafd4ce8d  build/pro/generated/app-image.bin
33fb077ba86378d56f3cbf986d4afe61ca5991d1b2fa39b40c8209adc60c538a  build/official-web/pro/SMK37-Open-Source.html
206306e2269a925d4c7a78799fe45cdb4af1f2bd0d6c6b4a5d1d1db7b9526005  build/hosted/pro/index.html
```

These are the Step 2 gate baseline for head 56b09d3 (source URL = the Makefile's default TAG).

Observations on the way, none a test overwriting a build:
- `git status` was clean after every target. `make midi-import-test` rewrites the ten tracked fixture
  files `tests/midi-import/fixtures/*.mid` on every run, byte-identical today; a generator change dirties the
  tree by design (Session A's checkout shows this with its ppq-*.mid work).
- The Node tests, web-smoke and midi-import-sim only read `build/web/simulator.wasm`; the host tests write
  nothing (storage is simulated in memory).
- Every firmware target (`firmware-native`, `firmware-ref`, `crosscheck`, `package`) first overwrites
  `build/official-web/pro/SMK37-Open-Source.html` with a "Build incomplete" placeholder (build.py's port of
  Build.ps1's invalidation) and `firmware-native` leaves it that way. So `make firmware` after `make package`
  invalidates the hosted page's input until the next `make package`; `make hosted` then fails on the
  placeholder (no source link). Upstream behaviour, worth one line in DEV_CHECKS.md, not a change.
- The Makefile's `build/host/smoke` rule depends on the `.c` files only: a header edit (app/*.h, web/engine/*.h)
  does not rebuild the host suite. Not an overwrite, but the reason a "warm" host-smoke can test stale code.
  A `-MMD` depfile include would fix it (proposed below as an optional item; not in the task list).

## 6. Toolchain and WASI SDK paths in the login shell

`bash -lc env` shows `FM1_TOOLS`, `JIELI_TOOLCHAIN=~/fm1-toolchain/jieli/toolchain` and `AC79_SDK` (Orange
Cat's exports from `~/.profile`, 2026-11-03). None of Classic Tabby's variables is set: `FM1_PI32_TOOLCHAIN`,
`FM1_TOOLCHAIN_KIND`, `FM1_WASI_SDK`, `WINEPREFIX`. Fallbacks:

- **Through make**: nothing is needed. The Makefile defaults `TOOLCHAINS` to `~/Documents/Classic Tabby/toolchains`
  and passes `--toolchain`, `--toolchain-kind`, `--wine-prefix` and `FM1_WASI_SDK` explicitly. Every target
  above ran from a shell with none of the variables.
- **build.py called directly**: `--toolchain-kind` defaults to `wine` (FM1_TOOLCHAIN_KIND), and without
  `--toolchain`/`FM1_PI32_TOOLCHAIN` it stops with "--toolchain (or FM1_PI32_TOOLCHAIN) is required". No
  silent fallback.
- **build-web.py called directly** without `FM1_WASI_SDK`: it **downloads the 119 MiB WASI SDK 27** into
  `build/tools/` (SHA-256 checked) and uses that. Through `make web`/`make package` the pinned copy is passed.
- The Orange Cat toolchain the login shell names is the same binary as the pinned one
  (`pi32v2/bin/clang` SHA-256 c45189ee… in both), but Classic Tabby never reads `JIELI_TOOLCHAIN`.
- Host tools present: gcc 15.2, clang-tidy 21 (and `/usr/lib/llvm-21/bin/clang`, not on PATH), cppcheck 2.19,
  ccache 4.14, flock, systemd-run (works with `--user --scope`), Node 22, Python 3.14, Wine 10. No pwsh.

## 7. The task's assumptions, verified

| assumption | result |
|---|---|
| not a unity build | **true**: 16 units (`app/**/*.c` minus `app/synth`, incl. 3 in app/board; no .S files), each its own clang call; the host suite is one gcc command but 36 separate translation units |
| build.py, two tracks, crosscheck | true |
| host suite = one binary, tests/host/smoke.c + app/web/synth sources, -Wall -Wextra, no sanitizers, no -Werror | true; plus a second small binary (timed_note) since Task 05 |
| Node suites for workbench, devices, importer, wasm smoke | true; also row-events-sim, midi-import simulator, timed-note JS |
| no compile-only target | true |
| no compile_commands.json | **false**: build.py already writes `build/pro/compile_commands.json` (16 entries, the pi32v2 clang's real commands) on every firmware build, and the same under build/ref. What is missing is the host-readable copy with the target flags stripped |

## 8. Orange Cat's dev-tools, piece by piece

Read from a scratch clone of the local `dev-tools` branch (62d30ea5; the branch is not on GitHub).

| Orange Cat piece | here |
|---|---|
| `OC_CHECK=1` / `check_only()` in tools/build.py (JieLi clang -fsyntax-only, 12 s) | **ports as an idea, reworked**: build.py here has the compile loop with the real per-file flags; a `--check-only` flag (or `FM1_CHECK=1`) that appends `-fsyntax-only`, skips the identity unit, link, Test-Firmware and package. Measured: 0.6 s for the 16 units. Default path untouched |
| `tools/lint.sh` (host gcc -Wall -Wextra over test units that include the firmware) | **reworked**: no unit includes sources here; each of the 36 host sources is compiled on its own with `-fsyntax-only` and the full warning set (keep `-Wno-attributes` for the clang `minsize` noise, drop the other suppressions), counted by file, 0.5 s at 4 jobs; plus the target clang `-Wall -Wextra` pass (0.6 s, the 3 warnings above). Its `hostdb()` strip step ports with a different drop list (`-target pi32v2`, `-integrated-as`, `-mcpu`, `-mfprev1`, `-flto`, `-fallow-pointer-null`, `-fprefer-gnu-section`, `-femulated-tls`, `-cl-single-precision-constant`, `-mllvm -pi32v2-large-program=true`, `-fms-extensions`), plus `-D__IEEE_LITTLE_ENDIAN` for cppcheck and the `___interrupt` macro for clang-tidy. Its cppcheck and clang-tidy check sets port as they are; the header filter becomes `app/` |
| `tests/cc_wrap.sh` (every compile timed, depfile per compile) | **does not apply**: the suite has one compile command (plus one for timed_note); the profile that matters is per make target |
| `tests/suite_profile.py` (job profile, dependency database, `--affected`) | **does not apply**: 5 Node jobs and 2 C jobs, 20 s cold; make already skips the warm ones. A per-target timing line (what the driver did) is the whole profile |
| `run_tests.sh --fast` (SAN=0, -O1, 4 jobs) | **does not apply as such**: nothing runs with sanitizers today, nothing is slow. `make test-fast` becomes a target list (section 9) |
| `run_tests.sh --changed REF` | **does not apply**: the whole fast tier is about 2 s warm, 20 s cold |
| the 205-compile problem, the one-compile-per-flag-set study, the serial-job split | **do not apply**: unity build and per-test compiles are Orange Cat's; here 16 + 36 compiles total |
| ccache findings (`OC_CCACHE`) | **does not apply**: the firmware build is 4 s and deterministic (fixed obj names, wiped each run, so ccache would hit but save at most 3 s); the host build is incremental through make |
| `module_build_test.py` overwriting build/module | **no counterpart**: nothing here overwrites a build output (section 5) |
| the shared lock + systemd scope + MemoryMax | **ports as is**, and is already the standing rule for Classic Tabby since 2026-11-04. Measured cost: 103 min wait for 4 min of work when an Orange Cat suite holds it |
| `build.sh` defaults, `~/.profile` exports | **not needed**: the Makefile carries the defaults (section 6) |
| DEV_CHECKS.md structure (rule, table of checks, timings, warnings by file, gate hashes) | ports as the shape of docs/DEV_CHECKS.md |
| licence headers (GPL-3.0-only, Kerem Kilic / Ellic Studio) | anything copied keeps them with a revision line naming the source; given the table above, little code will be copied beyond `hostdb()` and the check sets |

## 9. Proposal for Step 2

Every target opt-in, default build output unchanged (gate: the five hashes in section 5).

| target | what | expected time |
|---|---|---|
| `make check` | build.py `--check-only`: the 16 app units through the native JieLi clang with the build's exact flags and `-fsyntax-only`, no identity unit, no link, no package; `nice -n 19` | **about 1 s** (measured 0.6 s; target was 20 s) |
| `make lint` | tools/linux/lint.sh: host gcc `-fsyntax-only -Wall -Wextra` (minus `-Wno-attributes` only) on the 36 host sources, 4 jobs, counted by file and by kind into build/host/lint.txt; then the target clang with `-Wall -Wextra` over the same 16 units (the real compiler's view); `--cppcheck` and `--tidy` optional, over build/host/compile_commands.json | about 1.5 s; cppcheck about 1 min (estimated from 5 s/file); clang-tidy 55 s |
| compile_commands.json | build.py already writes build/pro/compile_commands.json; `make check` and `make lint` write the stripped build/host/compile_commands.json and a copy at build/compile_commands.json for editors and clangd | 0 s |
| `make host-sanitize` | the host suite and timed_note with `-fsanitize=address,undefined -fno-sanitize-recover=all -fno-omit-frame-pointer` into build/host-san/, run; through the lock | 27 s cold, 1 s warm |
| `make test-fast` | timed-note-test, host-smoke, web-smoke, workbench-test, midi-import-test; no sanitizers, `nice -n 19`, no lock (one gcc, one wasm compile, Node) | 21 s cold, 2.5 s warm |
| `make suite` (name open) | the full run before a flash or release: crosscheck, test, midi-import-sim, host-sanitize; through `flock /tmp/oc-suite.lock systemd-run --user --scope -p MemoryMax=12G`; writes build/suite-passed.txt with the head and the hashes | about 75 s cold, 50 s warm, plus the lock wait |
| profile | a small wrapper (tools/linux/timed.sh) around every target's recipe appending `target  seconds  rc  load  date` to build/profile.txt; `make profile` prints the last run | 0 s |
| lock | a `LOCKED` make variable prefix for crosscheck, firmware-ref, host-sanitize, suite; `nice -n 19` for firmware-native, web, host-smoke, check, lint; no background loops | |
| optional, needs a yes | `-MMD` depfiles for build/host/smoke so a header edit rebuilds it (section 5); a `make check`-style `-Wall -Wextra` pass is report only, no `-Werror` anywhere | |

Open point for the user: the lock rule as stated covers "every full suite". The measured wait (103 min) is
25 times the full Classic Tabby run. The proposal above keeps the lock for the Wine build, crosscheck, the
sanitizer run and the full suite, and lets `check`, `lint`, `test-fast` and `firmware-native` run under
`nice -n 19` without it, which is what the task's "while working" tier describes. Say if the full `make test`
should also queue.
