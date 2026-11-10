# SMK37 OPEN V01

English · [简体中文](README.zh-CN.md)

**SDK included:** this development kit contains the matching native binary SDK.

[Workbench and development kit](https://open.m-vave.com/smk37-workbench) · [Official forum](https://forum.m-vave.com)

For M-VAVE SMK-37 Pro and SMK-37 Elite, with 37 keys, 16 pads, eight encoders and four faders. The SMK37 OPEN workbench provides firmware updates, browser playback and project, song and DX7 voice management. Select **Source and SDK** for the development kit matching that release.

## V01 features

- Eight tracks with DX7 FM, 303, 808, PSG and plucked string engines (five; the sampler was removed); 16–64-step sequences (played from the project; the device's step editor was removed in tabby-v04.0), arpeggiators, effects and 16 project slots.
- **DX7 voices:** 128 presets in four groups of 32 (A–D). The workbench imports a standard single-voice or 32-voice DX7 SysEx file into a track; extension parameters are not handled. The device has no user voice library.
- **Track modes:** SHIFT + HOME, K2 selects PROJECT, LIVE or OFF. LIVE retains sound and held notes across project changes; export its timbre separately. PROJECT and LIVE have separate solo groups.
- **Recording:** none on the device since tabby-v04.0 (Task 12 removed step and live recording, the count-in and the metronome; they return in a later phase). Songs are written in the web workbench or imported from MIDI files.
- **Tempo:** 30–300 BPM. Tap with the workbench TAP button or HOME + SEQ on any page (Task 12: SEQ alone always opens SYNC / MIDI). Delay supports tempo sync or fixed times of about 30–2040 ms.

## SMK37 controls

- **PAD / STEP** enters or leaves the Pad instrument (tabby-v04.0 has no pad-step mode). K5 chooses the focused instrument's track. KEY and PAD assignments are independent, initially track 1 / channel 1 and track 8 / channel 10. SHIFT + Pads 1–8 selects tracks; SHIFT + Pads 9–16 toggles mute.
- **SHIFT + HOME / SRC** opens source selection: Pads 1–6 or K1 chooses, the 4th button in the left group (after SHIFT, FADER BANK, HOME) applies, HOME cancels. EDIT, ENV, LFO, FX and OCT follow the focused instrument. K1–K4 edit screen parameters; K6 changes pages; K7 selects the current page's preset or voice (KEY OUT on SYNC / MIDI).
- **FADER BANK** assigns the faders to tracks 1–4 or 5–8. Move through the displayed target to take control after switching banks or loading a project. Pitch/modulation wheels and the pedal follow KEY; return the wheels to rest before powering on.
- **Pad pressure** sends channel aftertouch on the original Pad note channel; the final release resets it to zero. DX7 responds with vibrato. Other engines and external instruments determine their own response. Browser Pads support upward dragging or a pressure-sensitive pen.
- **The 4th button in the left group (after SHIFT, FADER BANK, HOME)** opens the project save page and confirms on-screen actions; HOME + that button undoes the last change. Knobs are K1 to K8 from the left (the firmware calls K5 SELECT, K6 PAGE, K7 PRESETS and K8 MASTER).

See the workbench **Help** tab for page controls. Browser and device storage are separate; write browser edits to the device explicitly.

## MIDI and Bluetooth

USB/BLE MIDI input; DIN/USB/BLE MIDI output. Pro and Elite have no DIN MIDI input. Input channels default to 1–7 for tracks 1–7 and 10 for track 8. Shared input channels layer tracks.

- **SYNC / MIDI (SEQ from any page; Task 12):** K1 CLOCK (INT / MIDI), K2 CLK IN (AUTO / USB / BLE / DIN), K3 SWING, K4 SEQ OUT (OFF, ON, or CLOCK for clock/transport only), K7 KEY OUT (keyboard/Pad output on or off). BPM is set on HOME K4 only (HOME + SEQ taps it).
- **MIDI TRACK (SHIFT + SEQ):** K1 IN CH, K2 OUT CH, K3 SEQ (LOCAL / BOTH / MIDI), K4 OUT PORT (ALL / OFF). IN CH and OUT CH are independent; assign OUT CH on each track for multitrack output.
- SEQ settings do not control ARP: ARP always uses BOTH, following the track's OUT CH and the shared OUT PORT. For clock-only output, also turn KEY OUT off and disable ARP.
- tabby-v04.0 has no step editing or recording on the device (STEPS 1/7, 2/7, 4/7, STEP DETAILS, RHYTHM, REC, count-in and the metronome were removed); songs come from the web workbench.

Defaults are SEQ BOTH, KEY OUT ON, OUT PORT ALL and SEQ OUT ON. Upgrades retain saved choices; preferences are independent of projects. Local playing stays enabled and MIDI Thru is disabled. MIDI Clock, Start, Continue, Stop and Song Position Pointer are supported; external-clock loss stops synchronized playback. The browser previews settings without sending performance MIDI to external devices.

In Bluetooth **DEVICE** mode, use `SMK37 Pro Open_BLE` or `SMK37 Elite Open_BLE` for MIDI with a compatible computer application/driver. For audio, enable BLUETOOTH and BT AUDIO, then pair `SMK37 Pro Open` or `SMK37 Elite Open`. DEVICE/HOST selects the MIDI role only. If an old MIDI pairing fails, use **FORGET MIDI PAIRS** and remove the old computer entry before pairing again.

## Updates and recovery

Choose the workbench matching the physical Pro or Elite. Use desktop Chrome/Edge with USB and MIDI/SysEx permission. Back up projects, songs and voices (a **Full backup**), then follow **Device update**. Updating from one Classic Tabby build to another never needs force flash. Only a first migration from production firmware uses the **Force flash** checkbox, which you tick by hand; a loader connection requires physical-model confirmation. Keep power and USB connected until the update and the version check finish.

Classic Tabby keeps a permanent page for every published build at `https://seattleuser0.github.io/classic-tabby/builds/<tag>/` (the list is at [builds/](https://seattleuser0.github.io/classic-tabby/builds/)). If an install is interrupted, the device's update loader keeps the name of the build it was receiving and accepts only that build; the workbench then says which build that is and links to its page. Finish the install from that page (close the other tab and power-cycle the device first if it does not answer). Never force flash. Since tabby-v04.0 the storage layout moved: make a **Full backup** before installing it over v03.x, and read the release notes.

If the device shows OLD DATA IN SONG STORAGE after an install, hold SEQ, choose ERASE OLD DATA in ACTIONS and confirm with the 4th button in the left group; projects, tunings and settings are not touched. The Help chapter **What changed in tabby-v04** lists the storage move, the removed step editor, SYNC / MIDI, STOP TO SAVE, the timing counters and the recovery pages.

**Restore factory V16** uses the unmodified, matching V016 package from [M-VAVE Downloads](https://www.m-vave.com/download), dated 2026-08-12. Back up Open data first; power-cycle after resource verification succeeds. **Switch to Open firmware** returns to the Open update flow. Pro and Elite firmware are model-specific; the loader name alone does not identify the model.

Firmware switching does not make data formats interchangeable. Export projects, songs and voices separately; a project does not contain songs. Keep backups for rollback; compatibility with every third-party firmware is not established.

## Build

Requires Windows x64, PowerShell, `curl.exe` and `tar.exe`. This SMK37 SDK uses the [JieLi 2.5.3 Windows toolchain](https://jl-update.oss-cn-shenzhen.aliyuncs.com/2.5.3.exe), containing PI32v2 clang 4.0.1 for the `r3` target; see the [installation guide](https://doc.zh-jieli.com/Tools/zh-cn/dev_tools/dev_env/jl_toolchain.html). `sdk/manifest.json` verifies all 22 toolchain files and the SDK. Update the complete source and SDK kit together, keeping the manifest checks enabled.

For a local web preview:

```powershell
.\tools\Build-Web.ps1 -LocalPreview
```

For distribution, set `FM1_SOURCE_URL` to the HTTPS URL of the matching source archive, including changes, licenses and build/install scripts. A moving repository page is not a matching source archive. Then run:

```powershell
$env:FM1_PI32_TOOLCHAIN = 'C:\JL\pi32'
.\build.bat pro --package
.\build.bat elite --package
```

For firmware alone, use `.\sdk\Build.ps1 -Model pro -FirmwareOnly -Toolchain 'C:\JL\pi32'` (or `-Model elite`). The web build downloads WASI SDK 27 on first use; set `FM1_WASI_SDK` to reuse it. Environment variable names are shared with FM1.

Outputs: `build/preview/index.html`, `build/<model>/generated/` and `build/official-web/<model>/SMK37-Open-Source.html`. See [HOSTING.md](HOSTING.md) for static hosting. Both models share the APP; hardware drivers are in `app/board/`. The [per-track tuning API](app/instrument.h) is available without a dedicated tuning editor.

## License

APP and web application sources: [GPLv3 with the SDK linking exception](LICENSE.md), except files with their own license notices. The native SDK and factory recovery firmware are supplied as binaries under separate terms. Retain the applicable [SDK terms, third-party licenses and contributor notices](THIRD_PARTY.md) when redistributing.
