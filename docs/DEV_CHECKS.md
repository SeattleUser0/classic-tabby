# Development checks (Task 07)

Version 0.5, 2026-11-12. The opt-in checks between builds, what each catches, how long it takes, and
the standing rules for every Classic Tabby session on this machine. The default build is unchanged:
`make firmware`, `make package` and `make hosted` produce the same bytes as before Task 07 (the gate at
the end). The measurement series that led here is docs/tasks/TASK-07-step1-assessment.md. The shape of
this page and of `tools/linux/lint.sh` follows Orange Cat's `docs/DEV_CHECKS.md` and `tools/lint.sh`
(dev-tools branch, GPL-3.0-only, Kerem Kilic / Ellic Studio), reworked for this layout: Classic Tabby
compiles 16 firmware units and 36 host units separately, its whole test cycle is seconds, and nothing
here needed Orange Cat's per-compile profile, dependency database or `--changed` tier.

Revision log
- v0.4 2026-11-12: rule 0a: pushed tags and builds/ pages are never moved or deleted.
- v0.3 2026-11-11: Task 16: rule 0, the standing testing rule (unattended, remote commands).
- v0.2 2026-11-04: Task 08: the display version (DISPLAY_VERSION, tests/display-version.mjs in web-smoke);
  web-smoke and midi-import-sim depend on `web` (the stale-wasm trap below is closed).
- v0.1 2026-11-04: first version, Task 07 Steps 2 and 3.

## The standing rules

0. **Tests are run by the agent, unattended** (Task 16, 2026-11-11; SPEC 17.10). Hardware tests go over USB and the
   H4MIDI WC from this machine; the user is never asked to be present or to press a button. When a test needs a device
   action, build a remote command for it first: transfer command 29 (SPEC 19.2, tools/linux/hw/tabby_link.py v0.8)
   starts and stops songs, jumps, switches A2 and presses panel controls without writing flash.
0a. **Never move or delete a pushed tag or a published builds/ page** (2026-11-12; SPEC 17.11). No `git push -f` of a tag, no
   `git push origin :refs/tags/...`, no republish into an existing `builds/<tag>/`. A fix gets a new tag (v04.3 -> v04.3.1); a
   build for a device test gets its own `-rcN` tag and page. The one exception is a warning line the user asks for on a faulty
   build's page and index entry.

0b. **Nothing is published or installed unless `make suite` passed on the exact commit** (Task 17, 2026-11-14, after
   tabby-v04.4-rc4 went out with a failed suite). `make suite DISPLAY_VERSION=<tag>` writes build/suite-gate.json (the commit, the
   display version) only when every part passed, HEAD did not move and the tree was clean from start to end. `make publish`,
   `make release-assets` and tools/linux/publish-pages.py itself (`--commit`, `--push`) refuse when HEAD, the display version or
   a clean tree do not match (tools/linux/suite-gate.py; tests/linux/suite-gate-test.py). So: commit everything, release notes
   included, run the suite, tag, publish; results measured after the install go into a later commit. Batch scripts check the
   exit status of every step (`set -e` does not act inside an `&&` list).
0c. **Before a device fault is reported, it is confirmed with a second, independent tool** (Task 17: amidi, the browser
   workbench, or another reader). The "no replies with CLOCK = MIDI" of Task 16 was a bug in tools/linux/hw/tabby_link.py.
1. **Before any firmware build**: `make check` and `make lint`. A unit that would fail the build fails
   here in about two seconds, through the same compiler with the same options; the lint shows what the
   build's own warning flags keep quiet. Read the counts; they are a report, not a gate.
2. **While working**: `make test-fast` after every change, only the tests, no sanitizers, no lock.
   About 20 s on an empty build/, 3 s when little changed. A header edit now rebuilds exactly the host
   units that include it (depfiles), so a warm run tests the code you edited.
3. **Before any flash or release build**: `make suite` green. It is the full run through the lock:
   crosscheck (both toolchain tracks, byte for byte), the whole `make test`, midi-import-sim and
   host-sanitize (the host tests under AddressSanitizer and UndefinedBehaviorSanitizer). It writes
   build/suite-passed.txt with the head and the three firmware hashes; `make test-fast` never does.
4. **Every full run through the lock.** `make suite`, `make crosscheck`, `make firmware-ref` (the Wine
   build) and `make host-sanitize` queue on Classic Tabby's own lock and run in a memory-capped scope:

   ```
   flock /tmp/tabby-suite.lock systemd-run --user --scope -p MemoryMax=4G -- <command>
   ```

   The Makefile does this itself (LOCKED, below); type the plain target. The Orange Cat sessions use
   /tmp/oc-suite.lock, a different file, so Classic Tabby never waits behind their hour-long suites
   (Step 1 measured 103 minutes of waiting for 4 minutes of work on the shared lock). Everything else
   (`make firmware`, `make web`, `make check`, `make lint`, `make test`, `make test-fast`) runs under
   `nice -n 19` and never waits. At most 2 compiles at once (`JOBS=2`). No background wait loops: run the
   locked target in the foreground, or start it and come back when it reports.

## The targets

| target | what it does | what it catches | time (quiet machine; with an Orange Cat suite running beside) |
|---|---|---|---|
| `make check` | tools/linux/build.py `--check-only`: the same input checks, the 16 app units (`app/**/*.c` minus `app/synth`) through the native JieLi clang with the build's exact per-unit options and `-fsyntax-only`, into build/check/pro/; no identity unit, no link, no package; build/<model>/ untouched | every error the firmware build would stop on: syntax, types, missing declarations, the build's own `-Wuninitialized`; writes the compile databases (below) | 2 s; 3 s |
| `make lint` | tools/linux/lint.sh after `make check`. Pass 1: host gcc `-fsyntax-only -Wall -Wextra` on the 36 host test sources one file at a time, with the Makefile's include paths and defines but without its `-Wno-*` suppressions (except `-Wno-attributes`: the clang-only `minsize` attribute alone is 69 lines of noise). Pass 2: the target clang with `-Wall -Wextra` added to the build's options over the 16 units. Counts by file and by kind, the lines in build/host/lint.txt and build/host/lint-target.txt. Exit 1 only when a file does not compile | unused variables, missing field initializers, misleading indentation, mismatched array parameters, everything `-Wall -Wextra` knows, from both compilers | 2.5 s; 4 s |
| `make lint LINT="--cppcheck --tidy"` | plus cppcheck (warning and portability checks) and clang-tidy (bugprone-* and clang-analyzer-* minus the style checks) over build/check/pro/compile_commands.host.json, 2 at once; build/host/cppcheck.txt, build/host/tidy.txt | out-of-bounds indices, uninitialised reads, null dereferences, suspicious shifts and comparisons; a finding is a report to read, never a gate | cppcheck 15 s; clang-tidy 55 s quiet, 90 s loaded |
| `make test-fast` | timed-note-test, host-smoke, web-smoke, workbench-test, midi-import-test; no sanitizers, no lock | the host checks (140), the timed note vectors (804, C and JS), the wasm smoke, the workbench song write and device library, the MIDI importer | 20 s cold, 3 s warm; 30 s cold loaded |
| `make test` | as before: timed-note-test, host-smoke, web-smoke, workbench-test; since Task 08 web-smoke first runs `make web` (a 0.6 s cache check when nothing changed) and then tests/display-version.mjs (the display version in the wasm cache record, the wasm bytes and the preview page) | | 19 s cold, 1.2 s warm |
| `make host-sanitize` | the host suite and timed_note built again in build/host-san/ with `-fsanitize=address,undefined -fno-sanitize-recover=all -fno-omit-frame-pointer`, run; through the lock | heap and stack overruns, use after free, leaks, signed overflow, shifts of negative values, misaligned or null access, in the app code the simulator exercises | 27 s cold, 1 s warm; 85 s cold loaded |
| `make crosscheck` | both tracks built (native and Wine) and sdk.elf, the .fwsc and app-image.bin compared by SHA-256 (tools/linux/crosscheck-compare.sh); through the lock | a native-toolchain result that the reference Windows toolchain would not produce | 17 s quiet; the Wine build alone is 13 s quiet and 70 to 130 s with an Orange Cat suite running |
| `make suite` | crosscheck, test, midi-import-sim, host-sanitize, through the lock; build/suite-passed.txt | everything above, the run before a flash or a release | about 75 s cold quiet; 3 min 24 s loaded (load 5 to 7) |
| `make profile` | the last lines of build/profile.txt and the seconds per target | where the time goes | 0 s |

Every command of every target leaves a line in build/profile.txt (tools/linux/timed.sh): UTC time, target,
seconds, exit status, the 1-minute load, the command's head. The load column is how to read a slow line.

## The compile databases

tools/linux/build.py (v0.6) writes, on every firmware build and on every `make check`:

- `build/<model>/compile_commands.json` (and `build/check/<model>/...`): the real commands, the pi32v2 clang
  with its flags, one entry per unit; unchanged from before Task 07 for the real build.
- `compile_commands.host.json` next to it: the same entries with the target-only flags removed (`-target
  pi32v2`, `-mcpu=r3`, `-mfprev1`, `-fallow-pointer-null`, `-fprefer-gnu-section`, `-femulated-tls`,
  `-cl-single-precision-constant`, `-mllvm -pi32v2-large-program=true`, `-flto`, `-integrated-as`), a host
  clang named (`/usr/lib/llvm-21/bin/clang` here), plus `-D__IEEE_LITTLE_ENDIAN` (the SDK's libc headers
  choose their byte order from the target's predefined macros; cppcheck predefines none and stops on
  `ieeefp.h: #error Endianess not declared` without it) and `-Dinterrupt(x)=unused` (app/board's
  `__attribute__((interrupt("")))` is a target attribute the x86 clang rejects).
- `build/compile_commands.json`: a copy of the host one at the place editors and clangd look, when the
  build root is the default.

## Warnings at the start (linux-build 8114114, 2026-11-04)

The builds themselves show none: the firmware build runs with `-Wuninitialized` only, the host test build
silences `-Wunused-function -Warray-parameter -Wattributes -Wmisleading-indentation`, the wasm build has
`-Werror`. What the lint shows:

- Pass 1, host gcc, 11 distinct warnings, none in app/: `web/synth/dx7synth.c` 3 (`-Warray-parameter`),
  `third_party/synth/dsp_math.h` 3, `third_party/synth/drum808.c` 3, `third_party/synth/pluck.c` 1,
  `third_party/synth/bass303.c` 1 (all `-Wmisleading-indentation`). The 4 `minsize` attribute lines in
  app/ (midi_router.c:92, screen.c:1131, 1176, 2439) are correct for the target compiler and stay hidden.
- Pass 2, the target clang with `-Wall -Wextra`, 3 warnings: `app/board/scan.c:369` unused variable
  `adc_con`; `app/screen.c:1481` and `app/screen.c:2225` missing field `state` initializer.
- cppcheck, 2 findings: `app/screen.c:107` arrayIndexOutOfBoundsCond (the punctuation glyph table, 32
  rows, index 93 reachable when `*s <= '~'` holds; Session A is reading it) and `app/project.c:750`
  uninitvar (`c->magic`).
- clang-tidy, 13 findings (a fixed-address dereference, every memory-mapped register of app/board, is
  excluded as in Orange Cat's check set): `memcmp` used as a boolean (`bugprone-suspicious-string-compare`,
  the code's idiom) at app/project.c:132, :416, :515 and app/song_storage.c:188, :200; `memcpy` into a
  name field without a terminator (`bugprone-not-null-terminated-result`, fixed-width fields) at
  app/project.c:822, app/screen.c:2175, :2187; `signed char` promoted to `int` at app/screen.c:2347,
  :2359; "out of bound access to memory after the end of `sectors`" (`clang-analyzer-security.ArrayBound`)
  at app/song_storage.c:263 and :595, the two to read first; a decrement inside a condition at
  app/board/audio.c:79.
- Sanitizers: 0 findings in the host suite and the timed note test (every check passes under
  ASan+UBSan, leaks included).

Fixing any of these is separate work with the same gate as Task 07 (identical sdk.elf, .fwsc and
app-image.bin before and after); BUILD.md's left-to-build list carries them.

## The display version (Task 08)

Every firmware build, check and web build carries `-DFM1_DISPLAY_VERSION="…"` from
tools/linux/display_version.py: the git tag when HEAD is tagged, else tag-count-hash with `-dirty` when
tracked files are modified, else the export-subst VERSION file of a source archive. `make <target>
DISPLAY_VERSION=V01` forces the Open label (the release gate: the firmware then differs from the previous
release only in the build id when app/ changed, or not at all when it did not). The value is part of the
build id only when it differs from the label, so a tagged rebuild of unchanged sources is a new build id
and a forced-label build keeps the old one. A dirty tree therefore gives a different firmware from a clean
one by the string alone; `make suite` before a release runs on a clean, tagged tree as 9.2 requires.

## Known traps

- **`make firmware` after `make package` invalidates the distribution page.** Every firmware build first
  rewrites build/official-web/<model>/SMK37-Open-Source.html with a "Build incomplete" placeholder
  (tools/linux/build.py `invalidate_outputs`, the port of Build.ps1 L262-L281), and only `make package`
  writes the page again. So `make hosted` after a plain `make firmware` fails on the placeholder. This is
  upstream's protection against distributing a page whose embedded firmware is stale, kept as it is:
  run `make package` (then `make hosted`) when you want the page.
- **An existing simulator.wasm was never refreshed by `make test`** before Task 08 (web-smoke depended on
  the file, which has no prerequisites); web-smoke and midi-import-sim now depend on the phony `web`
  target, whose cache makes an unchanged rebuild a hash check.
- **`make midi-import-test` rewrites the tracked fixtures** tests/midi-import/fixtures/*.mid on every run,
  byte-identical as long as the generator is unchanged; a generator change dirties the tree by design.
- **The Wine build is load-sensitive**: 13 s on a quiet machine, 70 to 130 s with an Orange Cat suite
  running beside, lock or no lock. The lock keeps Classic Tabby's own runs from overlapping; it cannot
  make the other project's suite quieter.
- **sdk.map differs between two identical builds** (the LTO object's random /tmp name is recorded in it);
  it is not a shipped output. sdk.elf, the .fwsc, app-image.bin and the pages are deterministic.
- **sdk.elf depends on the checkout's path.** The compile commands name the sources by absolute path
  and the non-LTO units of app/board keep them in the ELF, so a build in another directory gives a
  different sdk.elf with an identical app image and package. Compare sdk.elf only between builds made
  at one path (crosscheck compares build/ref against build/ in one tree; the Task 07 gate rebuilt the
  base in the same worktree).
- **Two scopes, one wineserver.** The Wine build in a scope leaves wineserver running a few seconds
  after the build; a second Wine build that starts in that window joins it. Harmless in sequence; it is
  the reason not to run two Wine builds at once, which the lock prevents.
- **`make check` reads but never writes build/<model>/**: it works in build/check/<model>/. The sanitizer
  objects live in build/host-san/, the plain host objects in build/host/obj/.

## The gate

The firmware package and the hosted page before and after Task 07, built from the same source
(linux-build 56b09d3 with and without the Task 07 changes to the Makefile and tools/linux/build.py):

```
b35aff61587afe9477188bf4b200a7335ef4fc6f180e81bf583c173201dbf4e5  build/pro/sdk.elf
0fb5c158c213bdd71645d2d9bac9c50543fcb4987391df227d4da8babfa088bf  build/pro/generated/SMK37_PRO_OPEN.fwsc
3436a996b11cf18912c355ed2db3960e0ca865464a81f4ed7ebc181dafd4ce8d  build/pro/generated/app-image.bin
33fb077ba86378d56f3cbf986d4afe61ca5991d1b2fa39b40c8209adc60c538a  build/official-web/pro/SMK37-Open-Source.html
206306e2269a925d4c7a78799fe45cdb4af1f2bd0d6c6b4a5d1d1db7b9526005  build/hosted/pro/index.html
```

identical, 2026-11-04. After the rebase onto linux-build 8114114 (tabby-v03.0), the base and the
dev-checks head built at the same path (sdk.elf carries the checkout's path, see the traps):

```
dcc903fe02bd9506a469ad193abf7166eceb978b842d502ae1860f7ded2ab600  build/pro/sdk.elf
2cb180caab27f4ac5301658244c33f4eb59394e831d7c6319729f486e4ea5bcd  build/pro/generated/SMK37_PRO_OPEN.fwsc
1cdf1e64c5470d990b42dc39494c8b98942e2d7ea001de94f07f11fc7d281552  build/pro/generated/app-image.bin
30c8b2ca4c38bbbfaf3a59a13b069b489a0935e46c306337d8d6045db00332c9  build/official-web/pro/SMK37-Open-Source.html
970fd36c8e2e3a4748213fc7effe6641d788d341eddccca02dda344ca43f7ea8  build/hosted/pro/index.html
```

identical for both, and `make suite` green on the rebased head.
