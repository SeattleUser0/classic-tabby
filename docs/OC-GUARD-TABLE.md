# The Orange Cat soak guard: every entry point and where it calls the guard

Written by `python3 -I tests/linux/oc-guard-test.py --table` (make test-oc-guard checks that it is current). The rule:
docs/DEV_CHECKS.md. 52 Makefile targets, 111 scripts.

## Makefile targets

Every target, present and future: `Makefile:174` asks the guard when make READS the Makefile, before any target
(and again in every sub-make). Inside a recipe: `tools/linux/timed.sh:28` (the `$(T)` in front of the commands) and
`Makefile:211` (`$(NICE)` = scripts/oc_nice.sh, in front of compilers and builders) ask before each command.

| Target | Guard |
| --- | --- |
| `make help` | Makefile:174 |
| `make verify` | Makefile:174 |
| `make firmware` | Makefile:174 |
| `make firmware-native` | Makefile:174 |
| `make firmware-ref` | Makefile:174 |
| `make firmware-ref-run` | Makefile:174 |
| `make crosscheck` | Makefile:174 |
| `make crosscheck-run` | Makefile:174 |
| `make web` | Makefile:174 |
| `make build/web/simulator.wasm` | Makefile:174 |
| `make web-diag` | Makefile:174 |
| `make web-old536` | Makefile:174 |
| `make web-normal` | Makefile:174 |
| `make backup-test` | Makefile:174 |
| `make web-smoke` | Makefile:174 |
| `make build/host/smoke` | Makefile:174 |
| `make build/host-san/smoke` | Makefile:174 |
| `make build/host/timed_note` | Makefile:174 |
| `make build/host-san/timed_note` | Makefile:174 |
| `make build/host-san/clip_v3` | Makefile:174 |
| `make build/host/clip_v3` | Makefile:174 |
| `make clip-v3-test` | Makefile:174 |
| `make timed-note-test` | Makefile:174 |
| `make host-smoke` | Makefile:174 |
| `make host-sanitize` | Makefile:174 |
| `make host-sanitize-run` | Makefile:174 |
| `make workbench-test` | Makefile:174 |
| `make test` | Makefile:174 |
| `make test-fast` | Makefile:174 |
| `make suite` | Makefile:174 |
| `make suite-begin` | Makefile:174 |
| `make suite-run` | Makefile:174 |
| `make check` | Makefile:174 |
| `make lint` | Makefile:174 |
| `make manual` | Makefile:174 |
| `make profile` | Makefile:174 |
| `make midi-import-test` | Makefile:174 |
| `make midi-import-sim` | Makefile:174 |
| `make flash-budget` | Makefile:174 |
| `make package-equivalence` | Makefile:174 |
| `make midi-guide` | Makefile:174 |
| `make package` | Makefile:174 |
| `make hosted` | Makefile:174 |
| `make release-assets` | Makefile:174 |
| `make suite-gate` | Makefile:174 |
| `make publish` | Makefile:174 |
| `make rc` | Makefile:174 |
| `make device-gate` | Makefile:174 |
| `make promote` | Makefile:174 |
| `make release` | Makefile:174 |
| `make test-oc-guard` | Makefile:174 |
| `make clean` | Makefile:174 |

## Scripts

| Script | Guard called at | Asked again |
| --- | --- | --- |
| `scripts/oc_guard.cjs` | the guard itself | |
| `scripts/oc_guard.mjs` | the guard itself | |
| `scripts/oc_guard.py` | the guard itself | |
| `scripts/oc_guard.sh` | the guard itself | |
| `scripts/oc_hook.py` | the hook: it must run during a soak, to say no (it reads the flag at its line 58) | |
| `scripts/oc_hook_user.py` | the user-level hook, for Classic Tabby's commands only: it must run during a soak, to say no (it uses the flag test of scripts/oc_hook.py) | |
| `scripts/oc_nice.sh` | scripts/oc_nice.sh:8 |  |
| `tests/clip-v3/dump-v2.mjs` | tests/clip-v3/dump-v2.mjs:18 |  |
| `tests/clip-v3/importer.mjs` | tests/clip-v3/importer.mjs:17 |  |
| `tests/clip-v3/run.mjs` | tests/clip-v3/run.mjs:20 |  |
| `tests/display-version.mjs` | tests/display-version.mjs:23 |  |
| `tests/host/make-v1-reference.mjs` | tests/host/make-v1-reference.mjs:38 |  |
| `tests/linux/builds-index-test.py` | tests/linux/builds-index-test.py:25 |  |
| `tests/linux/device-gate-test.py` | tests/linux/device-gate-test.py:14 |  |
| `tests/linux/flash-part-guard.py` | tests/linux/flash-part-guard.py:22 |  |
| `tests/linux/midi-monitor-test.py` | tests/linux/midi-monitor-test.py:28 |  |
| `tests/linux/oc-guard-test.py` | tests/linux/oc-guard-test.py:37 | 223 |
| `tests/linux/suite-gate-test.py` | tests/linux/suite-gate-test.py:13 |  |
| `tests/midi-import/make-fixtures.mjs` | tests/midi-import/make-fixtures.mjs:53 |  |
| `tests/midi-import/run.mjs` | tests/midi-import/run.mjs:58 |  |
| `tests/midi-import/simulator.mjs` | tests/midi-import/simulator.mjs:38 |  |
| `tests/midi-import/smf-write.mjs` | tests/midi-import/smf-write.mjs:24 |  |
| `tests/simulator-wasm-smoke.mjs` | tests/simulator-wasm-smoke.mjs:27 |  |
| `tests/timed-note/make-vectors.py` | tests/timed-note/make-vectors.py:32 |  |
| `tests/timed-note/run.mjs` | tests/timed-note/run.mjs:25 |  |
| `tests/workbench/backup.mjs` | tests/workbench/backup.mjs:52 |  |
| `tests/workbench/clips-sim.mjs` | tests/workbench/clips-sim.mjs:30 |  |
| `tests/workbench/devices.mjs` | tests/workbench/devices.mjs:33 |  |
| `tests/workbench/guide.mjs` | tests/workbench/guide.mjs:31 |  |
| `tests/workbench/help-banned.mjs` | tests/workbench/help-banned.mjs:46 |  |
| `tests/workbench/launch-sim.mjs` | tests/workbench/launch-sim.mjs:36 |  |
| `tests/workbench/loader-tag.mjs` | tests/workbench/loader-tag.mjs:35 |  |
| `tests/workbench/manual-structure.mjs` | tests/workbench/manual-structure.mjs:23 |  |
| `tests/workbench/midi-guide.mjs` | tests/workbench/midi-guide.mjs:25 |  |
| `tests/workbench/page-bundle.mjs` | tests/workbench/page-bundle.mjs:17 |  |
| `tests/workbench/record-sim.mjs` | tests/workbench/record-sim.mjs:29 |  |
| `tests/workbench/recover-page.mjs` | tests/workbench/recover-page.mjs:29 |  |
| `tests/workbench/rig-lead.mjs` | tests/workbench/rig-lead.mjs:24 |  |
| `tests/workbench/rig-profile.mjs` | tests/workbench/rig-profile.mjs:22 |  |
| `tests/workbench/row-events-sim.mjs` | tests/workbench/row-events-sim.mjs:24 |  |
| `tests/workbench/screen-copy.mjs` | tests/workbench/screen-copy.mjs:20 |  |
| `tests/workbench/setup-sim.mjs` | tests/workbench/setup-sim.mjs:27 |  |
| `tests/workbench/song-write.mjs` | tests/workbench/song-write.mjs:28 |  |
| `tests/workbench/steps-sim.mjs` | tests/workbench/steps-sim.mjs:25 |  |
| `tests/workbench/transfer-radio.mjs` | tests/workbench/transfer-radio.mjs:28 |  |
| `tests/workbench/update-ports.mjs` | tests/workbench/update-ports.mjs:52 |  |
| `tests/workbench/update-safety.mjs` | tests/workbench/update-safety.mjs:35 |  |
| `tests/workbench/wrong-room-loop-sim.mjs` | tests/workbench/wrong-room-loop-sim.mjs:36 |  |
| `tests/workbench/wrong-room-sim.mjs` | tests/workbench/wrong-room-sim.mjs:27 |  |
| `tools/Build-Hosted.cjs` | tools/Build-Hosted.cjs:5 |  |
| `tools/Build-Web.ps1` | tools/Build-Web.ps1:9 |  |
| `tools/Pack-Factory.py` | tools/Pack-Factory.py:3 |  |
| `tools/linux/anglicize-workbench.mjs` | tools/linux/anglicize-workbench.mjs:29 |  |
| `tools/linux/build-web.py` | tools/linux/build-web.py:68 |  |
| `tools/linux/build.py` | tools/linux/build.py:125 |  |
| `tools/linux/builds-index.py` | tools/linux/builds-index.py:56 |  |
| `tools/linux/crosscheck-compare.sh` | tools/linux/crosscheck-compare.sh:19 |  |
| `tools/linux/device-gate.py` | tools/linux/device-gate.py:31 |  |
| `tools/linux/devices-from-sources.py` | tools/linux/devices-from-sources.py:43 |  |
| `tools/linux/display_version.py` | tools/linux/display_version.py:38 |  |
| `tools/linux/flash-budget.py` | tools/linux/flash-budget.py:45 |  |
| `tools/linux/guide-html.py` | tools/linux/guide-html.py:38 |  |
| `tools/linux/hw/clips-song.mjs` | tools/linux/hw/clips-song.mjs:19 |  |
| `tools/linux/hw/expected-events.mjs` | tools/linux/hw/expected-events.mjs:20 |  |
| `tools/linux/hw/panel-state.py` | tools/linux/hw/panel-state.py:30 |  |
| `tools/linux/hw/rc-validate.py` | tools/linux/hw/rc-validate.py:74 | 96 |
| `tools/linux/hw/rig-song.mjs` | tools/linux/hw/rig-song.mjs:19 |  |
| `tools/linux/hw/run-11b.py` | tools/linux/hw/run-11b.py:49 |  |
| `tools/linux/hw/run-12b.py` | tools/linux/hw/run-12b.py:33 |  |
| `tools/linux/hw/run-15.py` | tools/linux/hw/run-15.py:103 |  |
| `tools/linux/hw/run-barline.py` | tools/linux/hw/run-barline.py:35 |  |
| `tools/linux/hw/run-chain.py` | tools/linux/hw/run-chain.py:28 |  |
| `tools/linux/hw/run-clips.py` | tools/linux/hw/run-clips.py:37 |  |
| `tools/linux/hw/run-follow.py` | tools/linux/hw/run-follow.py:44 |  |
| `tools/linux/hw/run-guard.py` | tools/linux/hw/run-guard.py:23 |  |
| `tools/linux/hw/run-launch.py` | tools/linux/hw/run-launch.py:42 |  |
| `tools/linux/hw/run-phantom.py` | tools/linux/hw/run-phantom.py:27 |  |
| `tools/linux/hw/run-program.py` | tools/linux/hw/run-program.py:24 |  |
| `tools/linux/hw/run-record.py` | tools/linux/hw/run-record.py:39 |  |
| `tools/linux/hw/run-remote.py` | tools/linux/hw/run-remote.py:26 |  |
| `tools/linux/hw/run-repeat.py` | tools/linux/hw/run-repeat.py:37 |  |
| `tools/linux/hw/run-scenechain.py` | tools/linux/hw/run-scenechain.py:23 |  |
| `tools/linux/hw/run-sceneedit.py` | tools/linux/hw/run-sceneedit.py:26 |  |
| `tools/linux/hw/run-scenes.py` | tools/linux/hw/run-scenes.py:25 |  |
| `tools/linux/hw/run-screen.py` | tools/linux/hw/run-screen.py:25 |  |
| `tools/linux/hw/run-setup.py` | tools/linux/hw/run-setup.py:55 |  |
| `tools/linux/hw/run-soak.py` | tools/linux/hw/run-soak.py:40 | 74, 75 |
| `tools/linux/hw/run-songsoak.py` | tools/linux/hw/run-songsoak.py:24 | 55 |
| `tools/linux/hw/run-steps.py` | tools/linux/hw/run-steps.py:28 |  |
| `tools/linux/hw/run-stop.py` | tools/linux/hw/run-stop.py:36 |  |
| `tools/linux/hw/run-takeedit.py` | tools/linux/hw/run-takeedit.py:31 |  |
| `tools/linux/hw/tabby_link.py` | tools/linux/hw/tabby_link.py:84 | 244, 294, 307, 308, 917 |
| `tools/linux/hw/usb-readback.py` | tools/linux/hw/usb-readback.py:61 |  |
| `tools/linux/hw/workbench.mjs` | tools/linux/hw/workbench.mjs:51 | 69 |
| `tools/linux/install-host-packages.sh` | tools/linux/install-host-packages.sh:30 |  |
| `tools/linux/lint.sh` | tools/linux/lint.sh:47 |  |
| `tools/linux/manual-pdf.py` | tools/linux/manual-pdf.py:24 | 106 |
| `tools/linux/midi-guide.mjs` | tools/linux/midi-guide.mjs:23 |  |
| `tools/linux/midi-monitor.py` | tools/linux/midi-monitor.py:63 |  |
| `tools/linux/notice-wrap.py` | tools/linux/notice-wrap.py:13 |  |
| `tools/linux/package-pwsh.ps1` | tools/linux/package-pwsh.ps1:2 |  |
| `tools/linux/package.py` | tools/linux/package.py:36 |  |
| `tools/linux/pin-sdk-files.py` | tools/linux/pin-sdk-files.py:25 |  |
| `tools/linux/pin-toolchain.py` | tools/linux/pin-toolchain.py:31 |  |
| `tools/linux/publish-pages.py` | tools/linux/publish-pages.py:72 | 277 |
| `tools/linux/recover-page.py` | tools/linux/recover-page.py:63 |  |
| `tools/linux/release-flow.sh` | tools/linux/release-flow.sh:29 | 45, 50, 56, 64, 68 |
| `tools/linux/screens.mjs` | tools/linux/screens.mjs:39 |  |
| `tools/linux/stickers.py` | tools/linux/stickers.py:44 | 467 |
| `tools/linux/suite-gate.py` | tools/linux/suite-gate.py:26 |  |
| `tools/linux/timed.sh` | tools/linux/timed.sh:28 |  |
