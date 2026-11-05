/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
(() => {
  'use strict';
  const messages={
  "页面资源不完整，请重新载入。": "Page resources are incomplete. Reload the page.",
  "检查 / 初始化采样": "Check / initialize samples",
  "采样区尚未就绪：可重新检查；若提示校验失败，请在“项目与音色 → 8 槽采样库”恢复备份或确认写入内置库，无需重刷固件。": "Samples are not ready. Retry the check; if verification fails, restore a backup or confirm writing the built-in bank in Projects & sounds > 8-slot sample bank. No firmware reflash is needed.",
  "采样区检查完成；已有有效采样保留，空采样区已补齐内置库。": "Sample check complete. Valid banks were preserved; uninitialized storage received the built-in bank.",
  "已是当前版本；设备显示 EMPTY 时可点击“检查 / 初始化采样”，无需重刷。": "This firmware is already installed. If the device shows EMPTY, click Check / initialize samples without flashing again.",
  "固件已写入，正在检查采样区…": "Firmware written; checking sample storage…",
  "正在检查设备采样区…": "Checking device sample storage…",
  "正在写入并核对采样库，请保持连接…": "Writing and verifying the sample bank; keep the device connected…",
  "采样区已就绪。": "Sample storage is ready.",
  "固件已更新；请按错误提示重新检查，或在“项目与音色 → 8 槽采样库”恢复采样。": "Firmware updated. Follow the error message to retry the check or restore samples in Projects & sounds > 8-slot sample bank.",
  "采样区尚未就绪，可重新检查或从备份恢复。": "Sample storage is not ready. Retry the check or restore a sample bank backup.",
  "连接当前型号，确认备份后点击“刷入原厂 V16”。": "Connect this model, confirm your backup, then click Install factory V16.",
  "SMK37 Pro 原厂 V16": "SMK37 Pro Factory V16",
  "SMK37 Elite 原厂 V16": "SMK37 Elite Factory V16",
  "已连接设备，可恢复原厂 V16。": "Device connected; ready to restore factory V16.",
  "迁移、原厂恢复与强制更新": "Migration, factory restore and forced updates",
  "刷回原厂 V16": "Restore factory V16",
  "切回 Open 固件": "Switch to Open firmware",
  "原厂 V16": "Factory V16",
  "将恢复当前型号的原厂 V16 固件和原厂音色资源。Open 项目与采样不能在原厂固件中使用，恢复可能覆盖这些数据；请先分别备份。完成后请重新开机。": "Restores factory V16 firmware and sound resources for this model. Open projects and samples cannot be used by factory firmware and may be overwritten. Back them up separately first. Power-cycle the device when finished.",
  "原厂固件与资源已恢复，读回校验通过。请重新开机后使用。": "Factory firmware and resources restored; resource read-back passed. Power-cycle the device before use.",
  "下一步：恢复当前型号的原厂 V16，确认后开始写入。": "Next: restore factory V16 for this model. Confirm to start writing.",
  "恢复原厂资源": "Restore factory resources",
  "刷入原厂 V16": "Install factory V16",
  "烧录目标已改变，请核对版本和备份。": "Firmware target changed. Check the version and your backups.",
  "正在加载原厂固件…": "Loading factory firmware…",
  "确认恢复原厂 V16？Open 项目、音色和采样可能被覆盖，请确认已备份。目标：": "Restore factory V16? Open projects, voices and samples may be overwritten. Confirm you have backups. Target:",
  "原厂资源校验失败": "Factory resource validation failed",
  "原厂固件校验失败": "Factory firmware validation failed",
  "恢复资源需要对应型号的原厂 V16": "Restoring resources requires factory V16 for the matching model",
  "原厂资源写入失败": "Factory resource write failed",
  "原厂资源写入超时，请重新连接并重试": "Factory resource write timed out; reconnect and retry",
  "正在恢复原厂资源": "Restoring factory resources",
  "原厂资源读回校验失败": "Factory resource read-back failed",
  "选择“迁移、原厂恢复与强制更新”中的“刷回原厂 V16”，核对型号、备份后确认恢复。固件和原厂资源完成写入、读回校验后，请重新开机。需要返回 Open 时点击“切回 Open 固件”，重新连接并更新；项目与采样再从各自备份恢复。": "Choose Restore factory V16 under Migration, factory restore and forced updates. Check the model, back up your data and confirm. After firmware installation and resource read-back finish, power-cycle the device. To return to Open, choose Switch to Open firmware, reconnect and update, then restore projects and samples from their separate backups.",
  "Sampler：从键盘最左侧起，C、D、E、F、G、A、B、C 八个白键依次触发采样槽 1–8，黑键和其余琴键不触发采样，OCT 不改变槽位。ENV 跟随最后触发的槽位；Pad 1–8 和外部 MIDI 鼓音符映射保持一致。": "Sampler: the first eight white keys from the left (C, D, E, F, G, A, B, C) trigger slots 1–8. Black keys and the remaining keys do not trigger samples. OCT does not change slots. ENV follows the last triggered slot; Pads 1–8 and external MIDI drum notes retain their mappings.",

  "短按 EDIT 进入常用页：PRESETS 选 1–128 音色，PAGE 切换 A–D 组，K1–K4 调算法／反馈／移调／音量。再短按返回；长按 EDIT 进入完整编辑，打击垫选 OP1–OP6、Pitch、Global 或 Mono／Poly，SELECT 翻页，PAGE 调算法。长按 OP 打击垫约半秒开关算子。": "Tap EDIT for common controls: PRESETS selects voices 1–128, PAGE switches banks A–D, and K1–K4 adjust algorithm, feedback, transpose and level. Tap again to return. Hold EDIT for full editing; Pads select OP1–OP6, Pitch, Global or Mono/Poly, SELECT changes parameter pages and PAGE adjusts the algorithm. Hold an OP Pad for about half a second to toggle the operator.",
  "选择本区目标轨道、音色组和位置，点击载入即可使用；文件写入使用上方的 DX7 文件。载入与写入均读回校验。项目保留完整音色，修改音色库不会自动改变已有项目。面板短按 EDIT 后，PRESETS 选音色，PAGE 换组。": "Select the target track, bank and position here, then click Load. File writes use the DX7 file selected above. Loads and writes are verified by reading back. Projects retain complete voices; editing a bank does not automatically change existing projects. On the panel, tap EDIT, turn PRESETS for voices and PAGE for banks.",
  "载入到当前 DX7 轨": "Load into current DX7 track",
  "载入到目标 DX7 轨": "Load into target DX7 track",
  "所选音色已载入当前 DX7 轨。PROJECT 轨请保存项目；LIVE 轨请导出轨道音色。": "Selected voice loaded into the current DX7 track. Save the project for PROJECT tracks; export a timbre for LIVE tracks.",
  "音色已载入目标 DX7 轨，读回校验通过。PROJECT 轨请保存项目；LIVE 轨请导出轨道音色。": "Voice loaded into the target DX7 track and verified by reading it back. Save the project for PROJECT tracks; export a timbre for LIVE tracks.",
  "音色载入后的读回校验不一致，请重新连接并检查": "Voice verification after loading failed. Reconnect and check the track",
  "FM 常用参数：PRESETS 选择 1–128 音色，PAGE 切换 A–D 组；K1 算法、K2 反馈、K3 移调、K4 音量。短按 EDIT 返回，长按进细调。": "Common FM parameters: PRESETS selects voices 1–128; PAGE switches banks A–D. K1 algorithm, K2 feedback, K3 transpose, K4 level. Tap EDIT to return; hold for details.",
  "PAD / STEP：短按进入或退出独立 Pad 乐器；SHIFT + PAD / STEP 切换步进。KEY 与 PAD 保留各自的轨道、通道和八度。": "PAD / STEP: tap to enter or leave the independent Pad instrument; SHIFT + PAD / STEP switches step editing. KEY and PAD retain their own tracks, channels and octaves.",
  "演奏：短按 PAD / STEP 进入或退出 Pad 乐器。默认 KEY 为轨道 1／通道 1，PAD 为轨道 8／通道 10；SELECT 和 OCT 只调整当前操作的乐器。": "Play: tap PAD / STEP to enter or leave the Pad instrument. KEY defaults to track 1 / channel 1 and PAD to track 8 / channel 10. SELECT and OCT adjust only the instrument being edited.",
  "做节奏：SHIFT + PAD / STEP 切换步进编辑，Pad 开关步，PLAY 播放；SAVE 选槽后再按一次保存。": "Make a beat: SHIFT + PAD / STEP switches step editing. Toggle steps with Pads and press PLAY. Press SAVE, select a slot, then press SAVE again.",
  "Pad 触后跟随 Pad 通道；DX7 响应为颤音。网页中按住 Pad 向上拖动可试听触后，支持压力的触控笔可直接按压。": "Pad aftertouch follows the Pad channel; DX7 responds with vibrato. In the browser, hold a Pad and drag upward to preview aftertouch, or press with a pressure-sensitive pen.",
  "推子显示 UP TO／DOWN TO 时，按提示移动到目标值后才接管，不会突然跳变音量。F1–F4 是推子编号，T1–T8 是控制的轨道。": "When a fader shows UP TO / DOWN TO, move it through the target to take control without an abrupt volume jump. F1–F4 identify faders; T1–T8 identify their tracks.",
  "改音色：短按 EDIT，转 K1–K4；换音源用 SHIFT + HOME，Pad 1–6 或 K1 选择，SAVE 应用。": "Shape a sound: tap EDIT and turn K1–K4. For a different engine, use SHIFT + HOME, choose with Pads 1–6 or K1, then SAVE to apply.",
  "先掌握这三步": "Start with these three steps",
  "无": "None",
  "设备回复的身份": "Identity reported by the device",
  "等待的设备身份": "Expected device identity",
  "当前预览的安全策略禁止运行音频引擎。请退出附件预览，用电脑 Chrome／Edge 直接打开工作台网址；也可将完整 HTML 下载到电脑后打开。": "This preview's security policy blocks the audio engine. Leave the attachment preview and open the workbench URL directly in desktop Chrome or Edge, or download the complete HTML and open it on your computer.",
  "支持 DX7 单音色及 32 音色库 SysEx，不处理扩展参数。先将目标轨道设为 DX7。导入后，PROJECT 轨请保存项目；LIVE 轨请导出轨道音色或存入 DX7 独立库。": "Supports DX7 single-voice and 32-voice bank SysEx; extension parameters are not handled. Set the target track to DX7 first. After importing, save the project for PROJECT tracks; for LIVE tracks, export a timbre file or save the voice to the independent DX7 library.",
  "旋律音符、DRUM 808 和 SAMPLER 都在全部按键松开后前进一步；重叠按下的声音录入同一步。": "Melodic notes, DRUM 808 and SAMPLER all advance one step when every played key is released. Overlapping notes are recorded on the same step.",
  "在“项目与音色”备份当前项目与采样库，其他需要保留的项目槽也逐一载入并备份。独立音色库 A–D 四组分别“读取此组”并“导出此组 .syx”；LIVE 轨的音色修改另行导出，DX7 也可存入独立库后再备份。": "In Projects & sounds, back up the current project and sample bank, then load and back up any other project slots you need. For each independent voice group A–D, select Read this group, then Export this group as .syx. Export LIVE timbre edits separately, or save DX7 edits to the independent library before backing it up.",
  "等待重启及版本核对。如果提示采样未就绪，在采样页写入对应的 .fm1s 备份。写入内置采样库会替换全部 8 槽，不能找回原来的自定义采样。": "Wait for restart and version verification. If samples are not ready, write the matching .fm1s backup from the sample page. Writing the built-in bank replaces all 8 slots and cannot recover previous custom samples.",
  "正常完成的同布局更新会保留有效项目槽和采样库；刷写前仍请分别备份工程、音色和采样。设备重启后，未保存的内存编辑不会自动恢复。固件更新也不会自动把网页仿真中的项目传到设备。": "A successfully completed update using the same storage layout preserves valid project slots and the sample bank. Still back up projects, voices and samples separately before flashing. Unsaved memory edits are not restored after restart. Updating firmware does not transfer the browser project to the device automatically.",
  "音色已导入。PROJECT 轨请保存项目；LIVE 轨请导出轨道音色，DX7 也可存入独立库。": "Sound imported. Save the project for PROJECT tracks. For LIVE tracks, export a timbre file, or save DX7 voices to the independent library.",
  "以下录入仅适用于 PROJECT 轨；LIVE 轨用于现场演奏，不参与录入。": "The following recording modes apply only to PROJECT tracks. LIVE tracks are for live performance and do not record notes.",
  "PROJECT 轨的音色修改随项目保存；LIVE 轨的音色修改请导出轨道音色，DX7 也可存入独立库。项目备份不包含独立音色库和采样音频。": "PROJECT timbre edits are saved with projects. For LIVE timbre edits, export a timbre file, or save DX7 voices to the independent library. Project backups do not include the independent voice library or sample audio.",
  "升级模式无法自动识别机型，请先核对机身型号": "The loader cannot identify the hardware model. Check the label on the device first.",
  "已连接升级程序，机型尚未核实；写入前需核对机身型号。": "Loader connected; hardware model unverified. Check the device label before writing.",
  "升级程序名称不能确定机身型号。请核对机身铭牌，仅连接目标设备。确认机身型号为：": "The loader name does not identify the hardware model. Check the device label and connect only the target device. Confirm that the hardware model is:",
  "轨道已关闭": "Track is off",
  "选择轨道": "Select track",
  "静音轨道": "Mute track",
  "替换独立音色库的音色 ": "Replace voice library position ",
  "SHIFT + Pad 1–8 直选轨道，SHIFT + Pad 9–16 切换对应轨道静音；上半区高亮当前轨，下半区橙色表示静音。松开 SHIFT 恢复原来的打击垫功能。": "SHIFT + Pads 1–8 select tracks; SHIFT + Pads 9–16 toggle their mute. The upper half highlights the selected track; orange in the lower half means muted. Release SHIFT to restore the pads.",
  "SHIFT + SEQ 直达 MIDI TRACK：K1 IN CH 选输入通道，K2 OUT CH 选输出通道，K3 SEQ 选 LOCAL／BOTH／MIDI，K4 OUT PORT 选 ALL／OFF。输入、输出通道独立；多个轨道可共用输入通道。": "SHIFT + SEQ opens MIDI TRACK: K1 IN CH selects the input channel, K2 OUT CH selects the output channel, K3 SEQ selects LOCAL / BOTH / MIDI, and K4 OUT PORT selects ALL / OFF. Input and output channels are independent; several tracks can share an input channel.",
  "SHIFT + HOME 音源页的 K2 TRACK 即时选择 PROJECT／LIVE／OFF：PROJECT 跟随项目，LIVE 在换项目时保留音色和按住的音符，OFF 释放音源内存。原来的 NORMAL／PLAY 设置分别对应 PROJECT／LIVE。LIVE 音色请单独导出，DX7 也可存入独立库；项目保存的是原有编曲。模式与输入通道自动记忆；修改前请先停音。K1 仍只预览音源，SAVE 应用音源，HOME 返回。": "K2 TRACK on SHIFT + HOME immediately selects PROJECT / LIVE / OFF: PROJECT follows the project, LIVE retains its sound and held notes across project changes, and OFF frees instrument memory. Existing NORMAL / PLAY preferences map to PROJECT / LIVE. Export LIVE timbres separately, or save DX7 voices to the independent library; projects store the arrangement. Mode and input-channel preferences are remembered. Release notes before changing them. K1 still previews a source, SAVE applies it, and HOME returns.",
  "内置 128 个 DX7 格式预置音色，分为 A–D 四组，每组 32 个。支持标准 DX7 单音色与 32 音色 SysEx，不支持扩展参数。已有用户音色库优先保留。": "The 128 DX7-format presets are arranged in banks A–D of 32 voices each. Standard DX7 single-voice and 32-voice SysEx files are supported; extended parameters are not supported. Saved user banks take precedence.",

  "音色库长度无效": "Invalid voice bank length",
  "已保存到仿真独立音色库的音色 ": "Saved to simulator voice library position ",
  "用文件替换所选位置所在组的全部 32 个仿真音色？": "Replace all 32 simulator voices in this group with the file?",
  "整组音色已写入仿真库。": "The group was saved to the simulator library.",
  "独立音色库": "Independent voice library",
  "保存所选文件音色／当前 DX7 轨到此位置": "Save selected file voice / current DX7 track here",
  "文件替换此组 32 音色": "Replace these 32 voices from file",
  "导出此组": "Export this group",
  "128 个 DX7 独立音色": "128 independent DX7 voices",
  "音色组": "Voice group",
  "库内位置": "Library position",
  "读取此组": "Read this group",
  "导出此组 .syx": "Export this group as .syx",
  "保存所选文件音色到此位置": "Save selected file voice here",
  "保存所选 DX7 轨到此位置": "Save selected DX7 track here",
  "用所选 32 音色文件替换此组": "Replace this group with the selected 32-voice file",
  "8 槽共享约 19.55 秒，可自由分配。项目与采样分别备份。": "Share about 19.55 seconds freely across 8 slots. Back up projects and samples separately.",
  "WAV：PCM 8/16/24/32 位或 32 位浮点，单声道或立体声，8–192 kHz；原文件不超过 32 MiB、120 秒。8 槽共享约 19.55 秒，可自由分配；每段按 10 毫秒向上取整，替换时可复用当前槽空间。": "WAV: PCM 8/16/24/32-bit or 32-bit float, mono or stereo, 8–192 kHz; at most 32 MiB and 120 seconds. Share about 19.55 seconds across 8 slots. Each sample rounds up to 10 ms; replacing a slot reuses its space.",
  "在“项目与音色”的“8 槽采样库”编辑音频。8 槽共用 436 KiB，约 19.55 秒；可自由分配，页面显示剩余容量。先读取设备库，可保留已有采样。": "Edit audio in Projects & sounds > 8-slot sample bank. The slots share 436 KiB, about 19.55 seconds, with remaining capacity shown. Read the device bank first to retain existing samples.",
  "此组 32 个音色已读取。": "All 32 voices in this group were read.",
  "音色组已导出。": "Voice group exported.",
  "请先选择 DX7 文件中的音色或目标 DX7 轨": "First select a voice from a DX7 file or a target DX7 track",
  "替换独立音色库的音色 ": "Replace independent library voice ",
  "音色已写入独立库，读回校验通过。": "Voice saved to the independent library and verified.",
  "替换此组全部 32 个音色？建议先导出此组备份。": "Replace all 32 voices in this group? Export a backup first.",
  "整组音色已写入，读回校验通过。": "Voice group saved and verified.",
  "DX7 音色库长度或通道无效": "Invalid DX7 bank length or channel",
  "请选择包含 32 个音色的 DX7 音色库": "Select a DX7 bank containing 32 voices",
  "设备扩展能力回复无效": "Invalid device extension capability response",
  "请先将延迟切换为旧版支持的 FREE 时间（约 353 毫秒以内），再写入旧固件": "Before writing to older firmware, set delay to a supported FREE time of at most about 353 ms",
  "旧采样库占用了扩展存储空间，请先备份并缩小采样库": "An old sample bank overlaps extension storage. Back it up and reduce its size first",
  "请先更新固件以使用 128 音色库": "Update the firmware to use the 128-voice library",
  "音色库组号无效": "Invalid voice group number",
  "音色库读回不一致，请重新读取检查": "Voice bank verification failed. Read it again to check",
  "音色编号无效": "Invalid voice number",
  "DELAY 页连按 SEQ 或 TAP 设置 BPM；外部 MIDI 时钟下速度只读。": "On DELAY, tap SEQ or TAP to set BPM. External MIDI tempo is read-only.",
  "连按设置 BPM": "Tap to set BPM",
  "Tap Tempo：在 FX 的 DELAY 页直接连按 SEQ，其他页面按住 HOME 连按 SEQ，或点击网页 TAP；连续两拍起生效，最多平均四个间隔，范围 30–300 BPM。FX 用 PRESETS 翻到 DELAY：K1 开关 SYNC，K2 调分频或毫秒，K3 调内部 BPM，K4 调反馈。新建工程默认同步八分音符；关闭 SYNC 后为固定时间 FREE，约 30–2040 毫秒。切换模式选择最接近的时间。T 为三连音，D 为附点；同步延迟跟随内部或外部 MIDI BPM，时钟丢失时保持最后间隔。旧工程保留原来的手动延迟；使用同步分频或扩展固定时间的工程需要新版固件。": "Tap Tempo: tap SEQ on the FX DELAY page without leaving it, hold HOME and tap SEQ elsewhere, or click TAP on the web page. Two taps start detection; up to four intervals are averaged over 30–300 BPM. In FX, turn PRESETS to DELAY: K1 toggles SYNC, K2 sets division or milliseconds, K3 sets internal BPM and K4 sets feedback. New projects default to synchronized eighth notes. With SYNC off, FREE holds a fixed time of about 30–2040 ms. Switching modes selects the nearest available time. T means triplet and D means dotted. Delay follows internal or external MIDI BPM and retains its last interval if clock is lost. Old projects keep their manual delay; projects using synchronized divisions or extended fixed times require updated firmware.",
  "工作台未能启动 / Workbench could not start": "Workbench could not start",
  "重新载入 / Reload": "Reload",
  "37 键力度键盘": "37 velocity-sensitive keys",
  "正常连接已识别其他固件（相同型号的原有固件）时，点击 启用强制烧录并重新连接。这一步只开启模式并重新连接，不会写入固件。页面会说明接下来缺少哪一步；确认已备份后，再点 强制烧录 并确认兼容风险才会开始。也可点击强制烧录勾选行的任意位置开启。设备仍需支持兼容的 USB-MIDI 升级协议。": "When a normal connection identifies earlier firmware for the same model, click Enable forced update and reconnect. This only enables the mode and reconnects. The page explains the remaining steps; writing starts after you confirm the backup and forced update. You can also click the forced-update checkbox row. The device must support the compatible USB-MIDI update protocol.",
  "下载与机身型号对应的 Pro 或 Elite 工作台。连接 USB，先导出项目与采样备份，再在“设备更新”中连接、勾选备份确认并更新。首次从同型号原厂固件迁移时，使用“启用强制烧录并重新连接”。完成后网页会核对型号、版本哈希与采样区。Pro 与 Elite 固件不可混刷。": "Download the workbench for your Pro or Elite model. Connect USB, export project and sample backups, then connect in Device Update, confirm your backup and update. For the first migration from the same model\u2019s factory firmware, choose Enable forced update and reconnect. The page verifies the model, build hash and sample area afterward. Pro and Elite firmware are not interchangeable.",

  "37 个力度琴键始终用于演奏。短按 PAD / STEP 切换 KEY／PAD 编辑焦点；SHIFT + PAD / STEP 切换步进编辑；菜单中打击垫用于选择。8 个编码器依次为 K1–K4、SELECT、PAGE、PRESET、MASTER。4 个推子控制轨道音量，FADER BANK 在 1–4／5–8 轨之间切换，推子经过屏幕当前值后才接管。BT 键提示蓝牙设置已移至网页工作台，SHIFT + HOME / SRC 直达音源页。弯音轮、调制轮和延音踏板跟随 KEY；Pad 触后跟随 PAD。": "The 37 velocity keys always play notes. Tap PAD / STEP to switch KEY/PAD editing focus; SHIFT + PAD / STEP switches step editing. Pads select items in menus. Encoders are K1–K4, SELECT, PAGE, PRESET and MASTER. Four faders control track levels; FADER BANK selects tracks 1–4 or 5–8. A fader takes over after crossing the stored value. BT reminds you that Bluetooth settings moved to the web workbench; SHIFT + HOME / SRC opens sources. Pitch, modulation and sustain follow KEY; Pad aftertouch follows PAD.",
  "ENV 打开当前音源包络；SHIFT + ENV 打开当前轨调制；FX 按轨调混响和延迟，SCL 进入缩放细调。": "ENV opens the source envelope; SHIFT + ENV opens track modulation. FX edits track reverb and delay; SCL opens scaling.",
  "USB MIDI 开机即接收；蓝牙 MIDI 在网页工作台“项目与音色 → 蓝牙设置”中控制，两者使用相同的轨道输入通道设置。当前 Pro／Elite 没有有线 MIDI IN，机身 MIDI OUT 用于输出。": "USB MIDI receives at startup; Bluetooth MIDI is controlled from the workbench (Projects & sounds → Bluetooth settings). Both use the track input-channel settings. The current Pro / Elite boards have no wired MIDI input; the MIDI OUT connector is for output.",

  "正在加载固件…": "Loading firmware…",
  "固件加载失败，请重新打开设备更新页重试。": "Firmware could not be loaded. Reopen Device Update to retry.",
  "打开设备更新页后加载固件。": "Firmware loads when Device Update is opened.",
  "网页试听 · 未连接设备": "Browser preview · no device",
  "正在连接设备…": "Connecting to device…",
  "设备连接失败": "Device connection failed",
  "设备已连接用于更新 · 网页试听独立": "Device connected for update · separate browser preview",
  "设备已连接 · 请读取项目": "Device connected · read a project to edit",
  "网页修改未写入设备": "Browser edits not saved to device",
  "已保存到设备 · 校验通过": "Saved to device · verified",
  "已读取设备项目": "Device project loaded",
  "网页修改需手动保存；实机更改后请重新读取。": "Save browser edits manually. Read again after changes on the device.",
  "已就绪，点琴键或播放即可试听。": "Ready. Press a key or Play to listen.",
  "选择预设后点“播放”试听。“读取与保存”管理设备读取和浏览器存档，“文件与 MIDI”导入、导出项目和音色。": "Choose a preset and press Play. Read & save contains device reading and browser saves. Files & MIDI imports and exports projects and sounds.",
  "常用编辑按钮直接打开音色、步进、混音和效果；其余功能在“更多编辑”。旋钮可拖动或滚轮调节，LCD 数值可点击编辑。电脑键盘 Z、S、X、D…演奏，空格播放，Esc 停音；输入文字和操作菜单时不会演奏。": "The main buttons open sound, sequence, mixer and effects; other controls are in More editing. Drag or scroll knobs, or click LCD values. Play with Z, S, X, D…; Space plays and Esc stops notes. Typing and menu actions do not play notes.",
  "连接 SMK37 OPEN，确认备份后点击“开始更新”。": "Connect SMK37 OPEN, confirm your backup, then click Start update.",
  "管理设备项目、音色和采样。备份文件保存在这台电脑。": "Manage device projects, sounds and samples. Backup files stay on this computer.",
  "设备项目": "Device projects",
  "轨道音色": "Track sounds",
  "8 槽采样库": "8-slot sample bank",
  "先读取设备采样库，再选槽位和 WAV。写入会替换整库，影响所有项目。": "Read the device bank first, then choose a slot and WAV. Writing replaces the whole bank for all projects.",
  "音频格式与容量": "Audio formats & capacity",
  "采样库文件": "Sample bank files",
  "更新固件": "Update firmware",
  "正在校验本页内置固件。请连接 SMK37 OPEN 的 USB-MIDI 接口。": "Checking the included firmware. Connect the SMK37 OPEN USB-MIDI port.",
  "固件详情": "Firmware details",
  "恢复与强制更新": "Recovery & force update",
  "更新期间保持供电和 USB 连接，中断后请用同一版本网页重试。": "Keep power and USB connected. If interrupted, retry with the same version of this page.",
  "更新帮助": "Update help",
  "SMK37 OPEN 工作台": "SMK37 OPEN Workbench",
  "工作台": "Workbench",
  "关于": "About",
  "演奏与编辑": "Play & edit",
  "设备更新": "Device update",
  "使用说明": "Help",
  "读取与保存": "Read & save",
  "切换预设前请保存修改。": "Save your edits before changing presets.",
  "更多编辑": "More editing",
  "旋钮可拖动或滚轮调节，LCD 数值可点击编辑。": "Drag or scroll knobs. Click LCD values to edit.",
  "操作说明": "Controls guide",
  "文件与 MIDI": "Files & MIDI",
  "导出文件可备份到电脑；浏览器存档与设备项目分别保存。": "Export files to back up on your computer. Browser and device projects are saved separately.",
  "此预览使用演示采样；项目文件不包含采样音频。": "This preview uses demo samples. Project files do not contain sample audio.",
  "© 2026 M-VAVE。APP 采用 GPLv3＋SDK 链接例外，可依许可修改和再分发。除法律规定或另有书面约定外，不提供担保。SDK 与第三方条款见下方声明。": "© 2026 M-VAVE. APP: GPLv3 with an SDK linking exception; modification and redistribution are permitted under its terms. No warranty except as required by law or agreed in writing. See below for SDK and third-party terms.",
  "源码与 SDK": "Source + SDK",
  "官方论坛": "Official forum",
  "版权与许可声明": "Copyright and license notices",
  "关闭": "Close",
  "采样库必须包含 8 个槽位": "The sample bank must contain 8 slots",
  "MIX 短按（小于 0.6 秒）进入或退出混音；按住 0.6 秒可临时查看混音，松开回原页。MIX、EDIT、SEQ、ARP 的长按过程中，屏幕顶部显示进度条。": "Tap MIX (less than 0.6 seconds) to enter or leave the mixer. Hold for 0.6 seconds for a momentary mixer view; release to return. A progress bar appears at the top while holding MIX, EDIT, SEQ or ARP.",
  "SEQ 的 SYNC / LOOP 页：K1 选 INT／MIDI，K2 调内部 BPM，K3 调循环长度。切换时钟会停止播放；MIDI 模式需外部 Start／Continue 和 Clock，等待时屏幕提示 WAIT MIDI CLOCK。外部 BPM 只读。": "On SEQ’s SYNC / LOOP page, K1 selects INT / MIDI, K2 sets internal BPM and K3 sets loop length. Switching clocks stops playback. MIDI mode needs external Start / Continue and Clock; WAIT MIDI CLOCK appears while waiting. External BPM is read-only.",
  "录入标记：停止时按 REC 显示 STEP，弹琴逐步写入；播放时显示 REC，按时间录入；启用预备拍后显示 CNT 4→1，下一小节才开始记录。绿色短线表示播放步，白色框表示编辑步；PRESETS 手动选步会结束录入，再按 REC 继续。": "Recording indicators: REC while stopped shows STEP for step entry; during playback it shows REC for live recording. With count-in enabled, CNT 4→1 counts down before recording starts on the next bar. A green line marks playback and a white outline marks the edit step. Selecting a step with PRESETS ends recording; press REC to resume.",
  "顶部状态区区分浏览器试听、设备连接和未写入的网页修改。连接不会自动读取或同步；点常用区“读取设备项目”替换网页工作区，误操作可用 HOME＋SAVE 撤销。保存并读回校验一致后才显示已写入；仅存到浏览器不代表写入设备。实机旋钮修改后，请重新读取。": "The top status bar distinguishes browser preview, device connection and browser edits not yet written. Connecting does not read or sync automatically. Read device project in the main controls replaces the browser workspace; HOME+SAVE can undo it. Written status requires matching read-back; saving in the browser does not write SMK37 OPEN. Read again after editing on the device.",
  "设备操作已完成。": "Device operation completed.",
  "请先更新设备固件，再写入含 ARP 设置的项目": "Update the device firmware before writing a project with ARP settings",
  "等待外部 MIDI 时钟；在 SEQ 的 SYNC / LOOP 页可切回 INT。": "Waiting for external MIDI clock. Choose INT on SEQ’s SYNC / LOOP page to use internal tempo.",
  "实时录音：弹琴录入，REC 结束录音。": "Live recording: play notes; press REC to finish.",
  "所选轨道为 OFF，未启用；SHIFT + HOME 的 K2 TRACK 可开启。其他 PROJECT 轨仍可录入。": "The selected track is OFF. Enable it with K2 TRACK on SHIFT + HOME. Other PROJECT tracks can still record.",
  "所选 LIVE 轨只做现场演奏，不写入编曲；其他 PROJECT 轨仍可录入。REC 结束录入。": "The selected LIVE track is live only and does not record into the arrangement. Other PROJECT tracks can still record. Press REC to finish.",
  "步进录入：每次弹琴写入编辑步，REC 结束录入。": "Step recording: each played note enters the edit step; press REC to finish.",
  "正在播放；绿色是播放位置，选中框是编辑位置。": "Playing: green marks playback; the outline marks the edit position.",
  "已停止；REC 开始步进录入，PLAY 播放。": "Stopped: REC starts step recording; PLAY starts playback.",
  "预备拍：1；下一小节开始录音。": "Count-in: 1. Recording starts on the next bar.",
  "预备拍：2；下一小节开始录音。": "Count-in: 2. Recording starts on the next bar.",
  "预备拍：3；下一小节开始录音。": "Count-in: 3. Recording starts on the next bar.",
  "预备拍：4；下一小节开始录音。": "Count-in: 4. Recording starts on the next bar.",
  "可选：先在网页编辑。": "Optional: edit in the browser first.",
  "点击“编码并替换网页槽位”可先编辑网页库；直接写入设备时会自动完成这一步。": "Use Encode and replace browser slot to edit the browser bank first. Writing to the device performs this step automatically.",
  "选择 WAV 后点“导入选段并写入设备”；已编辑好网页库时点“写入设备采样库”。完成设备读回校验后才会报告成功。写入会替换全部 8 槽，所有项目中的同号采样一起变化。": "After choosing WAV, click Import selection and write to device; for an edited bank, click Write device sample bank. Success is reported only after device read-back matches. Writing replaces all 8 slots and affects matching slots in every project.",
  "写入采样时设备暂停播放和录入。进度前段发送，后段从设备读回核对；保持连接直到显示读回一致。选择 SAMPLER 对应槽重新触发试听，808 是独立合成引擎，不会使用导入的音频。若中断导致采样未就绪，重新写入完整采样库即可恢复。项目槽独立保留。": "Sample writes pause playback and recording. The first part of progress sends data; the second reads it back. Stay connected until verification succeeds. Retrigger the matching SAMPLER slot; 808 is a separate synthesis engine and does not use imported audio. If interrupted, rewrite the full bank to recover. Project slots are separate.",
  "请选择不超过 32 MiB 的标准 WAV 文件": "Choose a standard WAV file no larger than 32 MiB",
  "WAV 文件不完整或格式无效": "The WAV file is incomplete or invalid",
  "不支持此 WAV 编码，请导出 PCM 或 32 位浮点 WAV": "Unsupported WAV encoding. Export PCM or 32-bit float WAV",
  "WAV 仅支持单声道或立体声，采样率 8–192 kHz": "WAV must be mono or stereo at 8–192 kHz",
  "WAV 原文件最长 120 秒，请先裁剪后再导入": "WAV source files can be up to 120 seconds. Trim the file before importing",
  "请选择有效采样槽": "Choose a valid sample slot",
  "导入选段并写入设备": "Import selection and write to device",
  "选段超出采样库总容量，请缩短选段": "The selection exceeds the shared sample-bank capacity. Shorten it",
  "无法解码 WAV，请导出 PCM 或 32 位浮点 WAV 后重试": "Cannot decode WAV. Export PCM or 32-bit float WAV and retry",
  "WAV 已载入，尚未写入设备。可试听、调整选段，再点“导入选段并写入设备”。": "WAV loaded; the device has not changed. Audition or trim it, then click Import selection and write to device.",
  "WAV 包含无效音频数值": "WAV contains invalid audio values",
  "正在写入并读回采样库，请保持供电与 USB 连接…": "Writing and reading back the sample bank. Keep power and USB connected…",
  "采样库已写入，设备读回一致。请选择采样器引擎的对应槽重新触发；808 是独立合成引擎。": "Sample bank written and device read-back matched. Retrigger the matching slot in the Sampler engine; 808 is a separate synthesis engine.",
  "采样库文件已载入网页，尚未写入设备。": "Sample bank loaded in the browser; the device has not changed.",
  "采样读回已取消，尚未确认写入结果": "Sample read-back cancelled; the write has not been verified",
  "设备采样库忙，请稍后重试": "The device sample bank is busy. Retry shortly",
  "设备采样读回不一致，写入未确认成功；请重试": "Device sample read-back differs. Writing was not verified; retry",
  "未找到支持项目库的 SMK37 OPEN USB MIDI": "No SMK37 OPEN USB MIDI device with project-library support was found",
  "EDIT 的 OP RATES／OP LEVELS 显示同一条包络：RATE 越大，对应阶段越短；LEVEL 改变折点高度。L3 保持到松键，随后按 R4 到达 L4。六个算子和 PITCH 包络均会随参数更新。图形为便于编辑的示意，不是毫秒刻度；实际时长还取决于音符、缩放与电平。": "OP RATES and OP LEVELS in EDIT show the same envelope. Higher RATE shortens its stage; LEVEL changes the point height. L3 holds until release, then R4 leads to L4. All six operators and PITCH update with their parameters. The graph is an editing preview, not a millisecond scale; actual timing also depends on the note, scaling and levels.",
  "原厂固件校验失败": "Original firmware verification failed",
  "烧录目标已改变，请核对版本和备份。": "Firmware target changed. Check the version and your backup.",
  "FM ENV 的 A、D、S、R 都会实时改变曲线；横向按实际包络时间比例绘制，保持段只作示意，持续到松键。ADSR 关闭时曲线变灰并标为预览，实际声音使用各算子的 DX7 包络。": "All four FM ENV controls reshape the graph immediately. Horizontal spacing follows envelope timing; the sustain segment is illustrative and lasts until key release. With ADSR off, the graph is a dim preview; sound uses the individual DX7 operator envelopes.",
  "总览直接切换整套工程预设；EDIT 页选当前轨音色；预设列表选工程；SEQ 选步；808／采样编辑页选声部；SAVE 页选存档槽。": "On HOME, change the complete project preset; on EDIT, the track sound; in the preset browser, the project; on SEQ, the step; on drum / sample editing, the part; on SAVE, the slot.",
  "先看当前页面和屏幕底部名称。PRESETS 在总览切整套预设，在 EDIT 选单轨音色或鼓声部，在 SEQ 选步；K1–K4 随底部参数页改变。": "Check the current page and bottom labels. PRESETS changes complete presets on HOME, track sounds or drum parts on EDIT, and steps on SEQ. K1–K4 follow the bottom parameter page.",
  "SEQ：PAGE 翻底部七页，PRESETS 选步，SELECT 选轨，OCT−／OCT+ 换步进页；SHIFT + SEQ 直达输入／输出通道，长按 SEQ 复制与更多。": "SEQ: PAGE changes the seven bottom pages; PRESETS selects a step, SELECT a track, OCT− / OCT+ a step page. SHIFT + SEQ opens input/output channels; hold SEQ for copy and more.",
  "ARP：短按开关，长按调参数；PAGE 翻页，第一页调分频／方向／音域／门长，第二页调 Swing／Hold。SELECT 选轨，开关和参数随项目保存，不保存按住的音符。": "ARP: tap to toggle, hold for settings. PAGE changes pages: rate / direction / range / gate, then Swing / Hold. SELECT chooses a track. Enable and settings are saved with the project; held notes are not.",
  "SEQ：PAGE 翻底部参数页，PRESETS 选步；RHYTHM/REC 页 K4 选循环长度。再按 SEQ 返回基础页并恢复跟随。": "SEQ: PAGE changes bottom parameter pages; PRESETS selects a step. K4 on RHYTHM/REC selects loop length. Press SEQ again for BASIC and playback follow.",
  "SEQ 基础页打击垫开关当前页的步；K3 选音高或鼓声部。PRESETS 在各参数页统一选步，SELECT 选轨，OCT−／OCT+ 每次换 16 步。PAGE 翻底部七页：BASIC、STEP DETAILS、RHYTHM/REC、LOCKS、SYNC / LOOP、MIDI TRACK、MIDI OUTPUT。RHYTHM/REC 的 K4 选本轨 16／32／48／64 步，各轨独立循环。": "On SEQ BASIC, pads toggle steps and K3 selects a pitch or drum part. PRESETS selects steps on every parameter page, SELECT chooses a track, and OCT− / OCT+ moves 16 steps. PAGE changes the seven bottom pages: BASIC, STEP DETAILS, RHYTHM/REC, LOCKS, SYNC / LOOP, MIDI TRACK and MIDI OUTPUT. K4 on RHYTHM/REC sets the track loop to 16 / 32 / 48 / 64 steps; each track loops independently.",
  "短按 ARP 开启后按住音符；长按 ARP 打开参数。PAGE 翻两页：第一页 K1 为 1/4、1/8、1/16、1/32 分频，K2 方向，K3 为 1–4 个八度，K4 为 25%–100% 门长；第二页 K1 为 0%–50% Swing，K2 开关 Hold。Hold 保持松手后的和弦，全部松手后弹新和弦即可替换；关闭 Hold、停止或紧急停音会释放锁住的音符。SELECT 选轨，各轨参数独立。HOME／SEQ 基础页 K4 调 BPM；外部时钟需 Start／Continue 和 Clock，Swing 按 24 PPQN 的精度变化。": "Tap ARP and hold notes; hold ARP to open settings. PAGE switches two pages: page 1 has K1 rate (1/4, 1/8, 1/16, 1/32), K2 direction, K3 range (1–4 octaves), K4 gate (25%–100%); page 2 has K1 Swing (0%–50%) and K2 Hold. Hold keeps a released chord; release all keys and play a new chord to replace it. Turning Hold off, Stop or Panic releases latched notes. SELECT chooses a track; settings are independent per track. K4 on HOME / SEQ BASIC changes BPM. External clock needs Start / Continue and Clock; Swing follows 24 PPQN resolution.",
  "808／SAMPLER 支持分频、方向、Swing 和 Hold；音域与门长显示“--”，不移调鼓声部。ARP 开关与六项参数随项目保存，按住或 Hold 锁住的音符不保存。": "808 / SAMPLER support rate, direction, Swing and Hold. Range and gate show “--”; drum parts are not transposed. ARP enable and all six settings are saved with the project; held or latched notes are not.",
  "在 SEQ 转 PAGE 到 STEP DETAILS，K1–K4 调力度、门长、概率、和弦；LOCKS 页调连音、参数锁及音符。PRESETS 或打击垫只选择要编辑的步，SELECT 仍选轨。进入细节或锁参数页会结束 REC 并保留录入，播放不会拉走手动光标。参数锁只作用于一步，下一步恢复；不相关的 MIDI 控制消息不会取消它，支持的 CC 若控制同一参数则覆盖锁定并更新保存值。全项目共享 16 组和弦和 16 个单步参数锁。": "On SEQ, turn PAGE to STEP DETAILS: K1–K4 edit velocity, gate, probability and chord. LOCKS edits ties, parameter locks and notes. PRESETS or pads select the step; SELECT still chooses a track. Entering details or locks ends REC and keeps recorded notes; playback does not move the edit cursor. A parameter lock applies for one step, then restores the value. Unrelated MIDI controllers leave it active; a supported CC for that same parameter overrides it and updates the saved value. The project shares 16 chords and 16 step locks.",
  "SEQ 的 RHYTHM/REC 页：K1 Swing、K2 节拍器（关闭／录音／常开）、K3 一小节预备拍、K4 循环长度。量化固定为十六分音符。长按 SEQ 仍保留复制、粘贴和更多操作；UNDO / REDO 在当前内容与上次编辑前状态之间切换；音色与音量到达边界后继续拧不会覆盖撤销记录。": "SEQ RHYTHM/REC: K1 Swing, K2 metronome (off / recording / on), K3 one-bar count-in, K4 loop length. Quantization is fixed to sixteenth notes. Hold SEQ for copy, paste and more; UNDO / REDO switches between the current and previous edit state. Turning sound or volume controls beyond their limits leaves the previous edit available to Undo.",
  "按 SEQ，基础页 K3 选音符或鼓声部，打击垫开关步；PRESETS 选步，OCT−／OCT+ 翻页。PAGE 翻底部参数页，细节和节奏直接可调。": "Press SEQ. On BASIC, K3 selects a note or drum part and pads toggle steps. PRESETS selects a step; OCT− / OCT+ changes step pages. PAGE changes the bottom settings page for direct step and rhythm editing.",
  "短按开关当前轨琶音／鼓连奏；长按约 0.6 秒打开参数页。SELECT 选轨，PAGE 翻页：分频／方向／音域／门长，Swing／Hold。": "Tap to toggle the current track arpeggiator / drum repeats; hold for about 0.6 seconds for settings. SELECT chooses a track; PAGE switches between rate / direction / range / gate and Swing / Hold.",
  "并固定页面，再按 SEQ 返回基础页并恢复跟随。": "and keeps the page fixed. Press SEQ again to return to BASIC and follow playback.",
  "琶音：速度、方向、Swing 与 Hold": "Arpeggiator: rate, direction, Swing and Hold",
  "已识别设备时，切换强制烧录会自动重新连接，不会自动写入。等待连接完成，勾选备份确认，再点击强制烧录并确认兼容警告。尚未连接时，请先点击连接设备。": "When a device is already recognized, changing Force flash reconnects automatically without writing. Wait for connection, confirm your backup, then click Force flash and accept the compatibility warning. If not connected yet, click Connect device first.",
  "正在请求 MIDI 访问并初始化端口；若浏览器提示，请允许 MIDI / SysEx。": "Requesting MIDI access and initializing ports. If prompted, allow MIDI / SysEx.",
  "MIDI 权限已允许，正在等待浏览器初始化设备端口…": "MIDI permission is allowed. Waiting for the browser to initialize device ports…",
  "连接详情": "Connection details",
  "以下是浏览器本次检测到的端口；信息仅显示在本页。": "These are the ports detected by this browser for this attempt. This information stays on this page.",
  "浏览器未发现完整的 MIDI 输入和输出。请连接开机的 SMK37 OPEN USB-MIDI 接口，再重新连接。": "The browser could not find both a MIDI input and output. Connect a powered-on SMK37 OPEN through its USB-MIDI port, then reconnect.",
  "已发现 MIDI 端口，但无法匹配 SMK37 OPEN 输入和输出。请查看连接详情，只保留目标 SMK37 OPEN 后重试。": "MIDI ports were found, but the SMK37 OPEN input and output could not be paired. Check Connection details, leave only the target SMK37 OPEN connected and retry.",
  "已找到 MIDI 端口，但设备未回复型号。请关闭其他 MIDI 软件和更新网页，重新开机并插拔 USB 后重试；强制烧录也需要设备先响应。": "MIDI ports were found, but the device did not reply with its identity. Close other MIDI apps and updater tabs, power-cycle the device and reconnect USB, then retry. Force flash also requires a responding device.",
  "连接失败时，展开“连接详情”查看本次浏览器检测到的 MIDI IN／OUT。未发现端口、端口无法配对、设备未回复型号是不同的问题。先关闭其他 MIDI 软件和更新网页，再重新开机、插拔 USB 并连接；强制烧录不能跳过设备握手。": "If connection fails, open Connection details to see the MIDI IN / OUT ports detected for this attempt. Missing ports, unpaired ports and no identity reply are different problems. Close other MIDI apps and updater tabs, then power-cycle, reconnect USB and connect again. Force flash cannot skip the device handshake.",
  "设备采样状态回复无效，未写入采样库": "Invalid sample status reply; the sample bank has not been written.",
  "设备采样区信息不匹配，未写入采样库": "Sample storage information does not match; the sample bank has not been written.",
  "设备采样库正在写入，请等待完成后重试": "The device is writing samples. Wait for completion before retrying.",
  "采样区读取或校验失败；请检查设备后手动恢复采样库": "Sample storage could not be read or verified. Check the device before restoring the sample bank manually.",
  "采样检查发现正在写入、读取或校验错误、回复不完整时，不会自动覆盖采样。请按提示检查连接；需要恢复时，在“项目与音色”中手动写入备份或内置采样库。": "If sample checks find an active write, a read or validation error, or an incomplete reply, samples are not overwritten automatically. Check the connection as prompted. If recovery is needed, manually write a backup or the built-in bank in Projects & sounds.",
  "项目库列表读取失败时，载入、保存和导入按钮保持禁用；点击“刷新列表”重试。只有完整读取成功后才开放操作，重试会保留有效的选中槽位。": "If the project list cannot be read, load, save and import remain disabled. Click Refresh list to retry. Operations become available only after the full list has been read; a valid selected slot is preserved when retrying.",
  "首次用播放按钮、面板 PLAY 或空格播放时，会先开启声音。开启失败会保持停止，处理浏览器声音提示后可再次播放。声音开启过程中点“紧急停音”或切换面板页，会取消等待中的播放。": "The Play button, panel PLAY and Space enable sound before starting playback. If sound cannot start, playback stays stopped; resolve the browser audio issue and try again. Panic / Stop all or changing panel pages cancels pending playback while sound is starting.",
  "更新已完成，可以开始使用 SMK37 OPEN，无需再次烧录。": "Update complete. Your SMK37 OPEN is ready to use; no further flashing is needed.",
  "已切换到网页烧录；使用项目库时请重新连接。": "Switched to firmware update. Reconnect to use the project library.",
  "已切换到项目库；烧录前请重新连接。": "Switched to the project library. Reconnect before updating firmware.",
  "拔插 USB 后重新点击连接即可；页面会清除旧设备信息。烧录与项目库切换时按提示重新连接。固件写入后请等待采样检查完成；“固件已更新”但采样未就绪时，只需检查或恢复采样库，无需重复烧录。": "After reconnecting USB, click Connect again; old device information is cleared. Reconnect when switching between firmware update and the project library. After flashing, wait for the sample check. If firmware is updated but samples are not ready, check or restore the sample bank; do not repeat the firmware update.",
  "网页“静音”只关闭试听，编辑与音序仍继续。要停回起点，请用 HOME＋PLAY 或“紧急停音”。": "Browser Mute silences monitoring while editing and sequencing continue. Use HOME+PLAY or Panic / Stop all to stop and return to the start.",
  "总览转 K3（STEP）选择当前轨的步位置，录入时可移动写入位置。短按 REC 开关录音。": "On HOME, K3 (STEP) selects a step on the current track, including the insertion position while recording. Tap REC to start or stop recording.",
  "同一轨的静音与独奏互斥：开启独奏会取消该轨静音，开启静音会取消该轨独奏；其他轨保持原状态。": "Mute and solo are mutually exclusive on each track: enabling solo clears that track’s mute, and enabling mute clears its solo. Other tracks keep their settings.",
  "通道与接收规则": "Channels and receive rules",
  "默认 CH1–7 对应轨道 1–7，CH10 对应轨道 8。SHIFT + SEQ 后用 K2 为各轨选择输入通道 1–16。音符、弯音、调制和控制器按此设置接收，与屏幕选中轨道无关；多轨可共用一个通道叠奏。未分配给任何轨道的通道消息被忽略。更换音源不改变通道，USB MIDI 与 BLE MIDI 使用相同规则。": "By default, CH1–7 address tracks 1–7 and CH10 addresses track 8. Press SHIFT + SEQ and use K2 to assign each track an input channel from 1 to 16. Notes, pitch bend, modulation and controllers follow these settings regardless of the selected screen track. Several tracks can share a channel to layer sounds. Messages on unassigned channels are ignored. Changing engines does not change channels; USB MIDI and BLE MIDI use the same rules.",
  "接收消息": "Received message",
  "作用与范围": "Action and scope",
  "全部音源接收 Note On／Off 和力度；Note On 力度 0 等同 Note Off。808／SAMPLER 按鼓音符选择声部。": "All engines receive Note On / Off and velocity; zero-velocity Note On is Note Off. The 808 and Sampler use drum notes to select parts.",
  "FM、303、PSG、Pluck 支持 14 位弯音，中心 8192，范围 ±2 半音；作用于已发声及后续音符。808／SAMPLER 的音高使用各声部 TUNE。": "FM, 303, PSG and Pluck receive 14-bit pitch bend, centered at 8192, with a ±2-semitone range. It affects held and subsequent notes. Use each part’s TUNE for 808 / Sampler pitch.",
  "FM：音高颤音，音色 PMS 为 0 时调制轮仍有基础响应；303：EnvMod；PSG、Pluck、808、SAMPLER：轨道 LFO 深度，未设置 LFO 时为音量起伏。": "FM: pitch vibrato, with a basic wheel response even when patch PMS is 0. 303: EnvMod. PSG, Pluck, 808 and Sampler: track LFO depth, defaulting to volume tremolo when no LFO is configured.",
  "全部音源：CC7 轨道音量；CC10 声像（0 左、64 中、127 右）；CC11 表情（0 静音、127 原音量）；CC91 混响发送。": "All engines: CC7 track volume; CC10 pan (0 left, 64 center, 127 right); CC11 expression (0 silent, 127 full level); CC91 reverb send.",
  "FM、303、PSG、Pluck：CC64 延音，64–127 踩下，0–63 松开。FM 另接收通道触后用于颤音，以及 CC2／CC4 的振幅控制，效果取决于音色振幅敏感度。": "FM, 303, PSG and Pluck: CC64 sustain, 64–127 down and 0–63 up. FM also receives channel pressure for vibrato and CC2 / CC4 for amplitude control, subject to patch amplitude sensitivity.",
  "CC120 停止该轨声音；CC123 释放该轨外部音符（延音踏板仍有效）；CC121 复位实时弯音、表情、声像、调制和踏板，不改音色参数。": "CC120 stops the track’s voices; CC123 releases its external notes (sustain still applies); CC121 resets live bend, expression, pan, modulation and sustain without changing sound parameters.",
  "Program Change 使用 SMK37 OPEN 音色：FM 0–15 循环；303 0／1 为锯齿／方波；PSG 0–3 为 YM／AY／NOISE／MIX。其他音源忽略。部分软件显示为 1 起始编号。": "Program Change uses SMK37 OPEN sounds: FM cycles through 0–15; 303 uses 0 / 1 for saw / square; PSG uses 0–3 for YM / AY / NOISE / MIX. Other engines ignore it. Some software displays numbers starting at 1.",
  "303 还接收 CC5 滑音时间、CC71 共振、CC74 截止、CC75 衰减；PSG 接收 CC74 噪声、CC72 释放；Pluck 接收 CC74 亮度、CC75 衰减、CC72 释放。": "303 also receives CC5 slide time, CC71 resonance, CC74 cutoff and CC75 decay. PSG receives CC74 noise and CC72 release. Pluck receives CC74 brightness, CC75 decay and CC72 release.",
  "CC7、CC91、音色切换与音色参数编辑可随项目保存。弯音、表情、声像及实时调制不写入项目；CC121 不撤销已编辑的 303 EnvMod。SMK37 OPEN 保留自己的音色体系，不提供 GM 128 音色表。": "CC7, CC91, program changes and sound parameter edits can be saved in projects. Bend, expression, pan and live modulation are not stored. CC121 does not undo edited 303 EnvMod. SMK37 OPEN retains its own sound system and does not provide the GM 128-program sound set.",
  "同步与走带": "Synchronization and transport",
  "Clock、Start、Continue、Stop、歌曲位置和 MMC 不带 MIDI 通道，控制整机。选择 MIDI 时钟后，外部 Clock 按每四分音符 24 个脉冲同步；仅发送 Clock 不会自行播放。Start 从起点开始，Continue 从当前位置继续，Stop 停止播放并释放音序和琶音音符。": "Clock, Start, Continue, Stop, Song Position and MMC are not MIDI channel messages: they control the whole device. With MIDI clock selected, external Clock synchronizes at 24 pulses per quarter note. Clock alone does not start playback. Start begins from the start, Continue resumes at the current position, and Stop stops playback and releases sequence / arpeggiator notes.",
  "歌曲位置 SPP（F2）在 MIDI 时钟模式下定位，每单位为一个十六分音符，各轨按自身循环长度取余；随后发送 Continue 与 Clock。Start 会重新回到起点。System Reset（FF）停止、回起点并释放全部音符。": "Song Position Pointer (F2) locates in MIDI clock mode. Each unit is one sixteenth note, wrapped to each track’s loop length. Follow it with Continue and Clock. Start returns to the beginning. System Reset (FF) stops, rewinds and releases all notes.",
  "MMC 支持 Stop（01）、Play（02）、Deferred Play（03）、Record Strobe（06）、Record Exit（07）和 Pause（09）；接收设备 ID 00 或广播 7F。Play／Deferred Play 从当前位置继续，Record Strobe 开始录入并续播，Record Exit 只结束录入，Stop／Pause 同时结束录入。在 MIDI 时钟模式仍需外部 Clock。": "MMC supports Stop (01), Play (02), Deferred Play (03), Record Strobe (06), Record Exit (07) and Pause (09), addressed to device ID 00 or broadcast 7F. Play / Deferred Play resume; Record Strobe enables recording and resumes; Record Exit ends recording only; Stop / Pause also end recording. External Clock is still required in MIDI clock mode.",
  "例：F0 7F 7F 06 01 F7 为 MMC Stop；F0 7F 7F 06 02 F7 为 MMC Play。数字均为十六进制。": "Examples: F0 7F 7F 06 01 F7 is MMC Stop; F0 7F 7F 06 02 F7 is MMC Play. Numbers are hexadecimal.",
  "同时连接多台 MIDI 设备时只让一台发送时钟和走带，避免重复脉冲。MTC 时间码、MMC 时间码定位／快进／倒带、RPN／NRPN、复音触后、GM Reset、Bank Select、Active Sensing 超时监控及未列出的控制器目前不实现，收到后忽略。": "When several MIDI devices are connected, use only one clock and transport master to avoid duplicate pulses. MTC time code, MMC time-code locate / fast-forward / rewind, RPN / NRPN, polyphonic pressure, GM Reset, Bank Select, Active Sensing timeout monitoring and unlisted controllers are not implemented and are ignored.",
  "总览：SELECT 选轨，K3（STEP）选步；PRESETS 换预设，PAGE／K2 换音源。": "HOME: SELECT chooses a track; K3 (STEP) selects a step; PRESETS changes projects; PAGE / K2 changes engines.",
  "混音：打击垫 1–8 静音、9–16 独奏，同轨互斥；SELECT 选轨，K1–K4 调当前四轨组音量。": "Mixer: pads 1–8 mute, 9–16 solo; mute / solo are exclusive per track. SELECT chooses a track; K1–K4 adjust the four-track group.",
  "切换轨道发送／共用细调": "switch track sends / shared settings",
  "，检查连接后重新连接并按提示继续。从其他固件迁移时，开启“强制烧录”，重新连接并确认兼容风险。固件不支持 USB-MIDI 升级协议时，请使用该版本配套的恢复工具。跨固件迁移可能清除项目和采样，务必先备份。": ", check the connection, reconnect and follow the prompts. To migrate from other firmware, enable Force flash, reconnect and confirm the compatibility risks. Firmware without the USB-MIDI update protocol requires its matching recovery tool. Migration may erase projects and samples; back up first.",
  "LFO 作用于整个轨道，包括全部鼓／采样声部，也影响轨道效果发送。当前非 FM LFO 不提供音高或滤波目标。FM 保留原有音高／振幅 LFO 和两页参数。效果使用 FX。": "LFO affects the whole track, including drum / sample parts and track effect sends. Non-FM LFO does not offer pitch or filter targets. FM retains its original pitch / amplitude LFO and two parameter pages. Use FX for effects.",
  "实机把 MASTER 放在适中的位置；网页点琴键或播放即可发声，无需额外开关。": "Set device MASTER to a moderate level. In the browser, press a key or Play to hear sound; no extra switch is needed.",
  "轨道效果": "Track effects",
  "按 FX，SELECT 选轨；K1 混响发送、K2 延迟发送，0 即关闭该轨发送，六种音源均可用。K3 轨道音量、K4 共用效果返回量。转 PRESETS 到第二页细调：K1 混响时间、K2 延迟时间、K3 反馈、K4 返回量，由所有轨道共用。808 在 EDIT 中仍可设置每个鼓声部的额外发送量。轨道发送量随项目和轨道音色保存；共用效果参数仅随项目保存。静音停止新发送，已有尾音自然衰减。": "Press FX and select a track with SELECT. K1 sets reverb send, K2 delay send; 0 disables that track send. All six engines are supported. K3 is track volume and K4 is the shared effects return. Turn PRESETS to the second page for shared reverb time, delay time, feedback and return. The 808 EDIT page retains additional per-drum sends. Track sends are saved with projects and sounds. Shared effect settings are saved only with the project. Muting stops new sends while existing tails decay.",
  "效果：PAGE 翻 TRACK／SHARED／DELAY，SELECT 选轨，K1–K4 调屏幕参数。DELAY 页连按 SEQ 或 TAP 打拍；PRESETS 也可翻页。": "Effects: PAGE switches TRACK / SHARED / DELAY, SELECT chooses a track, and K1–K4 edit the displayed parameters. Tap SEQ or TAP on DELAY; PRESETS also changes pages.",
  "FX：SELECT 选轨，K1 混响、K2 延迟，0 关闭发送；PRESETS 切换细调页。": "FX: SELECT chooses a track; K1 reverb, K2 delay, 0 disables sends. PRESETS switches to detailed settings.",
  "强制烧录（其他固件迁移）": "Force flash (migrate from other firmware)",
  "警告：内置固件可能与当前设备不兼容。强制烧录可能清除数据、导致无法开机，并需要专用工具恢复。请只连接目标 SMK37 OPEN；不支持 USB-MIDI 升级协议的固件仍无法通过本页烧录。": "Warning: the bundled firmware may be incompatible with this device. Force flashing may erase data, prevent startup and require a recovery tool. Connect only the target SMK37 OPEN. Firmware without the USB-MIDI update protocol cannot be flashed from this page.",
  "强制烧录": "Force flash",
  "烧录模式已改变，请重新连接设备。": "Flashing mode changed. Reconnect the device.",
  "打开 MIDI 端口超时；请关闭其他 MIDI 软件或网页后重试。": "Opening the MIDI port timed out. Close other MIDI apps or tabs and retry.",
  "关闭 MIDI 端口超时；请重新插拔 USB 后连接。": "Closing the MIDI port timed out. Reconnect USB, then connect again.",
  "已连接；开始强制烧录前将再次确认设备和兼容风险。": "Connected. Confirm the device and compatibility risks before force flashing.",
  "确认强制烧录？当前设备：": "Force flash this device? Current identity: ",
  "警告：可能与设备不兼容，可能丢失数据或无法开机，需要专用工具恢复。仅当确认目标设备为 SMK37 OPEN 并接受风险时继续。": "Warning: incompatibility may cause data loss or prevent startup and require a recovery tool. Continue only if the target is an SMK37 OPEN and you accept these risks.",
  "强制烧录尚未确认": "Force flashing has not been confirmed",
  "请重新连接设备": "Reconnect the device",
  "设备身份已改变，请重新连接": "Device identity changed; reconnect the device",
  "声音暂时中断，编辑仍可使用。点琴键或重新播放以恢复声音。": "Audio was interrupted; editing is still available. Press a key or restart playback to resume sound.",
  "静音": "Mute",
  "取消静音": "Unmute",
  "点琴键即可发声": "Ready to play",
  "LCD 点击编辑": "Click to edit the LCD",
  "滚轮、＋／−或方向键按最小步长调节，网页试听实时生效。工程参数用“保存到设备”写入；MIDI 路由与时钟来源请在机身设置。": "Use the wheel, + / − or arrow keys for the smallest adjustment step. Changes apply to the browser preview immediately. Save to device writes project parameters; configure MIDI routing and clock sources on the instrument.",
  "首次使用时，8 个轨道的 SEQ 默认 BOTH，KEY OUT 默认 ON，同时启用 ALL 和 SEQ OUT ON；已保存的输出模式与 KEY OUT 选择会保留。SEQ 6/7 MIDI TRACK：K1 IN CH 输入通道，K2 OUT CH 发送通道，K3 SEQ 选 LOCAL／BOTH／MIDI，K4 OUT PORT 选 ALL／OFF。SEQ 7/7 MIDI OUTPUT：K1 SEQ OUT 选 OFF（关闭音序音符和主时钟）／ON（音序音符及内部时钟／启停）／CLOCK（仅内部时钟／启停），K2 开关 KEY OUT。SEQ 模式与 SEQ OUT 不影响 ARP；ARP 固定 BOTH（内部发声＋MIDI 输出），按该轨 OUT CH 和公共 OUT PORT 发送。切换 SEQ 设置不打断 ARP，开关 ARP 也不释放 SEQ 音符。ARP 第二页仅保留 SWING、HOLD 和 OUT CH，K3 无功能。只发时钟时，请关闭 KEY OUT 和各轨 ARP。SYNC 页 K4 选时钟来源。USB-C 分轨输出时逐轨设置 OUT CH，启用 BOTH 或 MIDI、ALL 及 SEQ OUT ON；只改 IN CH 不会改变输出通道。升级后本地演奏始终可用，Thru 关闭；旧端口组合只要有输出就转为 ALL，OFF 保留。偏好独立于项目；网页仅预览，实机请通过机身设置。": "On first use, SEQ defaults to BOTH on all eight tracks and KEY OUT defaults to ON, with ALL and SEQ OUT ON enabled; saved output modes and KEY OUT choices are retained. SEQ 6/7 MIDI TRACK: K1 IN CH sets reception, K2 OUT CH sets the sending channel, K3 SEQ selects LOCAL / BOTH / MIDI, and K4 OUT PORT selects ALL / OFF. On SEQ 7/7 MIDI OUTPUT, K1 SEQ OUT selects OFF (no sequencer notes or master clock), ON (sequencer notes and internal clock/transport), or CLOCK (internal clock/transport only); K2 controls KEY OUT. SEQ mode and SEQ OUT do not affect ARP. ARP always uses BOTH (internal sound and MIDI output), following the track OUT CH and shared OUT PORT. SEQ edits leave ARP running; toggling ARP does not release sequencer notes. ARP page 2 keeps only SWING, HOLD and OUT CH; K3 is inactive. For strictly clock-only output, turn KEY OUT off and disable ARP on all tracks. SYNC K4 selects the clock source. For USB-C multitrack output, set OUT CH for each track and enable BOTH or MIDI, ALL, and SEQ OUT ON. IN CH does not change OUT CH. Upgrades enable local playing and disable Thru; any enabled legacy port selection becomes ALL, while OFF stays OFF. Preferences are independent of projects. The browser previews these settings; configure the device on its panel.",
  "LCD 数值直接编辑": "Edit LCD values directly",
  "启用强制烧录并重新连接": "Enable force flash and reconnect",
  "设备已识别；请开启强制烧录并重新连接": "Device recognized. Enable force flash and reconnect before migrating.",
  "已识别设备和当前固件；迁移请点击“启用强制烧录并重新连接”。": "Device and current firmware recognized. To migrate, click Enable force flash and reconnect.",
  "MIDI 端口过多，请断开不相关设备后重试": "Too many MIDI ports. Disconnect unrelated devices and try again.",
  "设备操作进行中，请稍候。": "Device operation in progress. Please wait.",
  "检测到其他固件：可点击“启用强制烧录并重新连接”。": "Different firmware detected. Click Enable force flash and reconnect to migrate.",
  "下一步：连接设备。": "Next: connect the device.",
  "下一步：勾选已备份确认，才能开始烧录。": "Next: confirm that your work is backed up before flashing.",
  "下一步：点击“强制烧录”，阅读并确认兼容风险。": "Next: click Force flash, then read and confirm the compatibility risks.",
  "下一步：点击“开始更新”。": "Next: click Start update.",
  "把鼠标放在 LCD 上的数值，出现高亮即可滚轮调节；每次按参数最小步长变化，不随滚动速度加速。也可点击打开大号数值框，用滚轮、＋／−或方向键细调，Esc 关闭。支持底部参数、顶部 BPM、总览各轨音量、SEQ 循环长度、步进详情的选步数字、音色参数行、效果参数行，以及 FM 的 ALG、FB、MONO／POLY、ADSR 开关、LFO 波形／同步／PM SENS。混音页也可点静音／独奏格子设置。状态、电平、固定量化和当前引擎不支持的参数只显示；外部 MIDI 时钟下 BPM 由外部控制。切换轨道或参数页会关闭旧编辑框，避免改错参数。总览调其他轨的小音量数字不会改变当前选轨。": "Hover over an LCD value: a highlight means it is editable with the mouse wheel. Each step uses the parameter's smallest increment, without scroll-speed acceleration. Click to open a larger value display, then use the wheel, + / − or arrow keys; Esc closes it. Editable values include bottom parameters, top BPM, overview track levels, SEQ loop length, the step-details cursor, sound and effect rows, and FM ALG, FB, MONO / POLY, ADSR enable, LFO waveform / sync / PM SENS. Mixer mute / solo cells are also editable. Status, meters, fixed quantization and unsupported engine parameters remain read-only; external MIDI clock controls BPM. Changing tracks or parameter pages closes the old editor to prevent editing the wrong value. Adjusting another track's small level on the overview does not change your selected track.",
  "LCD 参数编辑": "LCD parameter editor",
  "减少参数": "Decrease parameter",
  "增加参数": "Increase parameter",
  "输出电平": "Output level",
  "音频输出电平": "Audio output level",
  "已送入仿真；请选择采样器轨道演奏。": "Sent to the simulator. Select a sampler track to play.",
  "总览选择合成引擎，SAVE 应用、HOME 取消；SEQ／ARP／FX 翻参数页；音色编辑页调算法或音色参数。": "On HOME, preview a sound engine, then SAVE to apply or HOME to cancel. PAGE changes parameter pages in SEQ / ARP / FX; in sound editors it adjusts the algorithm or sound parameter.",
  "各音源包络与 LFO": "Envelope and LFO for every engine",
  "非 FM 包络：K1–K4 调屏幕列出的真实参数，SELECT 选轨；鼓／采样按琴键或打击垫播放并选中对应声部，也可用 PRESETS 选择。": "Non-FM envelope: K1–K4 edit the supported parameters shown on screen; SELECT chooses a track. For drums / samples, keys and pads play and select the corresponding part. PRESETS also selects parts.",
  "轨道 LFO：K1 速度，K2 深度，K3 音量／声像，K4 波形；深度 0 为关闭，SELECT 选轨。参数随项目和音色保存。": "Track LFO: K1 rate, K2 depth, K3 volume / pan, K4 waveform. Depth 0 is off; SELECT chooses a track. Settings are saved with projects and track sounds.",
  "开关 FM 包络": "toggle the FM envelope",
  "选择鼓／采样声部": "select a drum / sample part",
  "ENV 在所有引擎上可用，显示该音源实际支持的参数。SELECT 选轨；鼓与采样按琴键或打击垫播放并选中对应声部，也可用 PRESETS 选择。未映射的琴键不会改变选择。重新触发音符试听包络变化，空白旋钮表示该音源没有对应参数。": "ENV works with every engine and shows its supported parameters. SELECT chooses a track. For drums and samples, keys and pads play and select the corresponding part; PRESETS also selects parts. Unmapped keys leave the selection unchanged. Retrigger a note to hear envelope changes. Blank knobs mean that the engine has no corresponding parameter.",
  "FM：K1 Attack、K2 Decay、K3 Sustain、K4 Release，调整即启用。303：K1 EnvMod、K2 Decay、K3 AccDec、K4 Cutoff；力度 100 及以上使用重音衰减 AccDec。PSG：K1 Release。Pluck：K1 Decay、K2 Release、K3 Bright。Sampler：K1 Length、K2 Choke。808：K1 Decay、K2 Attack、K3 Tone、K4 Tune，只显示所选鼓声部支持的项目。": "FM: K1 Attack, K2 Decay, K3 Sustain, K4 Release; editing enables the overlay. 303: K1 EnvMod, K2 Decay, K3 AccDec, K4 Cutoff; velocities of 100 or above use accented decay (AccDec). PSG: K1 Release. Pluck: K1 Decay, K2 Release, K3 Bright. Sampler: K1 Length, K2 Choke. 808: K1 Decay, K2 Attack, K3 Tone, K4 Tune; only parameters supported by the selected drum part appear.",
  "非 FM 引擎按 LFO：K1 速度 0.05–20 Hz，K2 深度 0–100%，K3 音量起伏／左右声像，K4 三角波／方波／上升锯齿／下降锯齿。深度 0 即关闭；参数随项目、轨道音色及用户槽保存。SELECT 选轨，再按 LFO 返回。": "For non-FM engines, press LFO: K1 rate 0.05–20 Hz, K2 depth 0–100%, K3 volume tremolo / stereo pan, K4 triangle / square / rising saw / falling saw. Depth 0 is off. Settings are saved with projects, track sounds and user slots. SELECT chooses a track; press LFO again to return.",
  "此页不使用": "unused on this page",
  "琶音参数": "Arpeggiator settings",
  "长按 SEQ 约 0.6 秒打开更多菜单。SELECT 选 COPY STEP 或 COPY PAGE，按 SAVE 复制；菜单自动选中对应 PASTE。用 PRESETS 或 K2 选目标步，OCT−／OCT+ 换目标页，再按一次 SAVE 粘贴。顶部显示当前轨、步、页及剪贴板类型；整轨粘贴、清空与重复仍需第二次 SAVE 确认。": "Hold SEQ about 0.6 seconds for the menu. Use SELECT to choose COPY STEP or COPY PAGE, then SAVE to copy; the matching PASTE command is selected automatically. Choose the target step with PRESETS or K2, or the target page with OCT− / OCT+, then press SAVE once to paste. The top row shows track, step, page and clipboard type. Whole-track paste, clear and repeat still require a second SAVE to confirm.",
  "复制与粘贴：K1 或 SELECT 选操作，SAVE 执行；复制后自动选中 PASTE。PRESETS／K2 选目标步，OCT−／OCT+ 选目标页，再按 SAVE 粘贴。": "Copy/paste: K1 or SELECT chooses an action; SAVE executes it. Copy selects the matching PASTE. PRESETS / K2 chooses the destination step, OCT− / OCT+ the page; press SAVE to paste.",
  "SEQ 基础页：旋律轨 K2 选步，K3 改已有音符；空步只设待输入音高，按打击垫写入。鼓轨 K3 选声部，不移动鼓点。K1 调轨道音量，K4 调速度；外部 MIDI 时钟下速度由外部设备控制。": "On SEQ BASIC, K2 selects a melodic step and K3 edits its existing note. On an empty step, K3 sets the pitch inserted by a pad. On drum tracks, K3 selects a part without moving hits. K1 controls track level and K4 tempo; MIDI clock sets tempo externally.",
  "连接设备": "Connect device",
  "保存到设备": "Save to device",
  "保存位置": "Save location",
  "保存会替换所选槽位，并载入该项目进行校验。完成后重启设备仍可恢复；采样库单独管理。": "Saving replaces the selected slot and loads the project to verify it. The saved project survives a device restart. Sample banks are managed separately.",
  "保存并校验": "Save and verify",
  "取消": "Cancel",
  "项目与音色": "Projects & sounds",
  "网页烧录": "Firmware update",
  "使用说明书": "User manual",
  "开启声音": "Enable sound",
  "紧急停音": "Panic / Stop all",
  "正在载入": "Loading",
  "静音编辑": "Silent editing",
  "试听音量": "Monitor volume",
  "当前工程": "Current project",
  "正在载入…": "Loading…",
  "← 上一个": "← Previous",
  "下一个 →": "Next →",
  "播放": "Play",
  "导出项目文件": "Export project file",
  "存到此浏览器": "Save in this browser",
  "当前轨道": "Current track",
  "音源类型": "Sound engine",
  "总览": "Overview",
  "当前轨音色": "Track sound",
  "步进编曲": "Step sequencer",
  "混音": "Mixer",
  "用户项目列表": "User projects",
  "导出所选预设": "Export selected preset",
  "面板 PRESETS 旋钮：换整套预设。": "Panel PRESETS knob: change the whole project preset.",
  "正在载入面板…": "Loading the panel…",
  "若此提示一直存在，请保存 HTML 后": "If this message stays here, save the HTML and",
  "用电脑 Chrome 或 Edge 打开。": "open it in desktop Chrome or Edge.",
  "浏览器未允许保存本地存档；请导出项目文件保留编辑。": "Browser storage is unavailable. Export your project file to keep your edits.",
  "完整音色编辑": "Full sound editor",
  "包络": "Envelope",
  "步进细节": "Step details",
  "节奏与录入": "Groove & recording",
  "复制与更多": "Copy & more",
  "DX7 音色改名": "Rename DX7 patch",
  "连接设置预览": "Connection preview",
  "八轨状态": "Eight-track overview",
  "导出轨道音色": "Export track sound",
  "导出 DX7 音色": "Export DX7 patch",
  "连接 MIDI 输入": "Connect MIDI input",
  "导入到仿真": "Import into browser",
  "读取设备项目": "Read device project",
  "清空本地仿真存档": "Clear browser saves",
  "固件": "Firmware",
  "正在校验…": "Verifying…",
  "版本": "Version",
  "Open 基础版本": "Open base version",
  "构建编号": "Build ID",
  "文件大小": "File size",
  "已保存需要保留的音色、工程和采样": "I have backed up the sounds, projects and samples I want to keep",
  "开始更新": "Start update",
  "正在检查网页内容…": "Checking page contents…",
  "连接项目库": "Connect project library",
  "刷新列表": "Refresh list",
  "设备项目槽": "Device project slot",
  "当前项目名称（最多 12 个英文字母、数字或符号）": "Current project name (up to 12 ASCII letters, digits or symbols)",
  "修改当前名称": "Rename current project",
  "保存到此槽": "Save to this slot",
  "载入此槽": "Load this slot",
  "备份当前项目": "Back up current project",
  "恢复项目文件": "Restore project file",
  "恢复到工作区": "Restore to workspace",
  "载入与恢复会替换未保存的工作区。恢复文件不会自动写入设备槽，确认后再按保存。": "Loading or restoring replaces the unsaved workspace. Restoring a file does not write a device slot automatically; save it when ready.",
  "目标轨道": "Target track",
  "音色文件": "Sound file",
  "导入轨道音色": "Import track sound",
  "保存音源类型、音色参数和音量，不携带步进。鼓与旋律互换会清空此轨不兼容的步进；导入后可在面板 HOME+SAVE 撤销。": "Includes the engine, sound parameters and level, without steps. Switching between drum and melodic engines clears incompatible steps on this track. HOME+SAVE undoes the import on the panel.",
  "DX7 标准音色": "Standard DX7 patches",
  "文件中的音色": "Patch in file",
  "请先选择 .syx 文件": "Choose a .syx file first",
  "导入到此轨": "Import to this track",
  "导出此轨音色": "Export this track patch",
  "等待连接支持项目库的固件。": "Waiting for a device with project-library support.",
  "读取设备采样库": "Read device sample bank",
  "载入内置采样库": "Load built-in sample bank",
  "采样槽": "Sample slot",
  "WAV 音频": "WAV audio",
  "名称（最多 15 个英文字符）": "Name (up to 15 ASCII characters)",
  "起点（秒）": "Start (seconds)",
  "终点（秒）": "End (seconds)",
  "试听选段": "Audition selection",
  "编码并替换网页槽位": "Encode & replace browser slot",
  "清空网页槽位": "Clear browser slot",
  "送入仿真": "Send to simulator",
  "写入设备采样库": "Write device sample bank",
  "备份网页采样库": "Back up browser sample bank",
  "恢复采样库文件": "Restore sample bank file",
  "取消 / 停止试听": "Cancel / Stop audition",
  "正在载入内置采样…": "Loading built-in samples…",
  "SMK37 OPEN 使用说明书": "SMK37 OPEN User Manual",
  "从第一段节奏，到保存你的作品。适用于 SMK37 OPEN 配套固件与网页编辑器。": "From your first beat to saving your music. For the matching SMK37 OPEN firmware and web editor.",
  "打印 / 存为 PDF": "Print / Save as PDF",
  "查找操作": "Find an operation",
  "共 10 章": "10 chapters",
  "显示全部章节": "Show all chapters",
  "01 · 三分钟上手": "01 · Get started",
  "02 · 面板与快捷键": "02 · Panel & shortcuts",
  "03 · 步进与录入": "03 · Steps & recording",
  "04 · 六种音源": "04 · Six sound engines",
  "05 · 音量与混音": "05 · Volume & mixing",
  "06 · 保存与文件": "06 · Saving & files",
  "07 · 采样库": "07 · Sample bank",
  "08 · MIDI、蓝牙与时钟": "08 · MIDI, Bluetooth & clock",
  "09 · 更新固件": "09 · Firmware updates",
  "10 · 常见问题": "10 · Troubleshooting",
  "没有找到匹配章节。试试“保存”“音量”“MIDI”等关键词，或点击“显示全部章节”。": "No matching chapters. Try “save”, “volume” or “MIDI”, or click “Show all chapters”.",
  "SMK37 OPEN 有": "SMK37 OPEN has ",
  "8 条轨道、6 种音源、16 个内置工程": "8 tracks, 6 engines and 16 factory projects",
  "。每轨支持 16、32、48 或 64 步；常用操作使用单键，完整细调放在长按菜单和网页里。": ". Each track supports 16, 32, 48 or 64 steps. Common tasks use a single button; deeper editing is in hold menus and the web editor.",
  "准备试听。": "Prepare to listen. ",
  "先听一个预设。": "Try a preset. ",
  "在 HOME 总览直接转 PRESETS 切换整套预设，按 PLAY 播放。也可按 HOME 打开列表，转 PRESETS／SELECT 直接载入，PLAY 载入播放。SAVE 打开项目保存，打击垫 1–16 也能直接选对应预设。": "On HOME, turn PRESETS to change the whole project and press PLAY. You can also press HOME for the list, load with PRESETS / SELECT, or press PLAY to load and play. SAVE opens project saving; pads 1–16 select directly.",
  "改声音。": "Shape the sound. ",
  "回总览后 SELECT 选轨，短按 EDIT 进入常用参数；在 EDIT 页转 PRESETS 换当前轨音色，再按 EDIT 返回。想换音源，在总览转 PAGE 或 K2，SAVE 应用。": "On the overview, SELECT chooses a track and a short EDIT press opens common parameters. Turn PRESETS on EDIT to change the track sound; press EDIT again to return. To change engines, turn PAGE or K2 on the overview, then press SAVE.",
  "改节奏。": "Change the rhythm. ",
  "调平衡。": "Balance the mix. ",
  "按 MIX 进入混音，打击垫 1–8 静音、9–16 独奏；SELECT 选轨，K1–K4 调四轨音量。再按 MIX 或 HOME 返回。": "Press MIX. Pads 1–8 mute and 9–16 solo. SELECT chooses a track; K1–K4 adjust four track levels. Press MIX or HOME to return.",
  "保存。": "Save your work. ",
  "按 SAVE，SELECT 选 USER 槽，再按 SAVE 保存；覆盖其他已有槽会提示确认，成功后自动返回。": "Press SAVE, choose a USER slot with SELECT, then press SAVE again. Replacing another occupied slot asks for confirmation. The panel returns after saving.",
  "网页顶部“保存到设备”可直接选槽保存；“存到此浏览器”只存本机浏览器；“导出项目文件”生成电脑备份。实机 SAVE 保存到设备槽。": "“Save to device” at the top writes a chosen device slot. “Save in this browser” stores a browser copy; “Export project file” makes a computer backup. Physical SAVE writes a device slot.",
  "操作": "Control",
  "用途": "What it does",
  "从编辑页回八轨总览；已经在总览时打开预设，再按取消。": "Return from editing to the eight-track overview. From the overview, open the preset list; press again to cancel.",
  "总览、常用音色、步进和混音页选轨；完整细调页翻参数页；菜单选项目。": "Choose a track on overview, common sound, sequencer and mixer pages. Change parameter pages in full editing; select menu items.",
  "总览：音量／音源／步位置／速度。SEQ 基础页：音量／步位置／音高或鼓声部／速度。其他页看屏幕底部标签。": "HOME: level / engine / step / tempo. SEQ BASIC: level / step / pitch or drum part / tempo. On other pages, follow the bottom labels.",
  "EDIT 短按／长按": "EDIT: tap / hold",
  "短按进入或退出常用参数；长按约 0.6 秒进入完整细调。非 FM 音源的常用页只显示第一组参数，细调页用 SELECT 翻页。": "Tap to enter or leave common parameters. Hold for about 0.6 seconds for full editing. Non-FM common pages show the first parameter group; SELECT changes pages in full editing.",
  "SEQ 短按／长按": "SEQ: tap / hold",
  "短按进入步进，再按回 BASIC 并恢复播放跟随。PAGE 翻参数页；长按约 0.6 秒打开复制／粘贴、清空、重复、撤销及其他操作。": "Tap for steps; tap again for BASIC and playback follow. PAGE changes parameter pages. Hold about 0.6 seconds for copy / paste, clear, repeat, undo and other actions.",
  "单按进入／退出混音。打击垫 1–8 静音、9–16 独奏，无需一直按住 MIX。": "Tap to enter or leave the mixer. Pads 1–8 mute and 9–16 solo. You do not need to keep MIX held.",
  "播放／暂停／续播；音乐页开关音符录入。预设页的 PLAY 为载入并播放，切换预设不弹确认。": "Play / pause / resume; toggle note recording on musical pages. On the preset page, PLAY loads and plays. Preset changes do not ask for confirmation.",
  "打开保存页，再按保存；菜单中用于执行／确认。HOME 取消。": "Open the save page, then press again to save. Execute / confirm in menus. HOME cancels.",
  "步进页翻 16 步；演奏时上下移调八度。": "Change 16-step pages in the sequencer; transpose by octaves when playing.",
  "网页操作": "Web controls",
  "组合键": "Button combinations",
  "HOME＋PLAY 紧急停音回起点；HOME＋SAVE 撤销／重做；SEQ＋EDIT 打开更多菜单；EDIT＋REC 改 DX7 音色名。都可以从长按 SEQ 的菜单完成对应操作。网页需要锁住按键时可 Shift 点击或右击，再点释放；日常操作无需使用。": "HOME+PLAY stops all sound and returns to the start; HOME+SAVE toggles undo / redo; SEQ+EDIT opens more actions; EDIT+REC renames a DX7 patch. These actions are also in the SEQ hold menu. In the browser, Shift-click or right-click a button to hold it, then click again to release. These combinations are optional.",
  "16 个打击垫，一页 16 步": "16 pads, 16 steps per page",
  "播放中修改长度会显示": "A length change during playback shows ",
  "，到本轨下一轮起点生效。缩短不会删除后面的音符，再加长即可恢复。屏幕": " and takes effect at this track’s next loop start. Shortening a loop does not erase later notes; extend it to restore them. ",
  "表示跟随播放翻页；手动编辑后显示": " means the display follows playback. Editing manually shows ",
  "两种录入方式": "Two recording modes",
  "停止时按 REC：": "Press REC while stopped: ",
  "播放时按 REC：": "Press REC during playback: ",
  "面板或 MIDI 演奏按最近的十六分音符量化写入，并保留力度。再次按 REC 结束录入。": "Panel or MIDI playing is quantized to the nearest sixteenth note with velocity retained. Press REC again to stop recording.",
  "细节、节奏与复制": "Details, groove & copying",
  "每条轨道都能选择任意一种音源，同类型的多条轨道也各有参数。切换音源后使用新类型的默认参数；鼓与旋律互换会清空不兼容步进，可从长按 SEQ 的菜单选择 UNDO / REDO 撤销。": "Each track can use any engine and has its own parameters, even when several tracks use the same engine. Changing engines loads that engine’s defaults. Switching between drums and melody clears incompatible steps; use UNDO / REDO in the SEQ hold menu to undo.",
  "音源": "Engine",
  "怎样编辑": "How to edit",
  "303 · 酸性贝斯": "303 · Acid bass",
  "短按 EDIT 调第一页；长按 EDIT 后 SELECT 翻三页：Cutoff／Reso／EnvMod／Decay；Accent／Wave／Tune／Volume；Drive／DrvTyp／Slide／AccDec。PRESETS 切换锯齿／方波，编辑页 Mono／Poly 选择单音滑音或 4 复音。": "Tap EDIT for the first page. Hold EDIT, then use SELECT for three pages: Cutoff / Reso / EnvMod / Decay; Accent / Wave / Tune / Volume; Drive / DrvTyp / Slide / AccDec. PRESETS switches saw / square. Mono / Poly selects monophonic slide or four-voice polyphony.",
  "808 · 合成鼓": "808 · Synthesized drums",
  "PRESETS 选择 11 个鼓声部或 KIT，键盘试听也会选中对应声部。长按 EDIT 后 SELECT 翻参数页。各声部可调参数不同；KIT 调整整套鼓组。": "PRESETS selects 11 drum parts or KIT. Playing a key also selects its part. Hold EDIT and use SELECT to change parameter pages. Available parameters depend on the part; KIT adjusts the whole drum kit.",
  "PSG · 芯片音色": "PSG · Chip sounds",
  "K1–K4：MODE（YM／AY／NOISE／MIX）、NOISE、TUNE、RELEASE。纯方波模式下 NOISE 不改变声音。": "K1–K4: MODE (YM / AY / NOISE / MIX), NOISE, TUNE and RELEASE. NOISE has no effect in a pure square-wave mode.",
  "PLUCK · 拨弦": "PLUCK · Plucked strings",
  "K1–K4：DECAY、BRIGHT、TUNE、RELEASE。DECAY 是自然衰减，RELEASE 是松键衰减；按住键仍会自然衰减。亮度在下一次拨弦生效。": "K1–K4: DECAY, BRIGHT, TUNE and RELEASE. DECAY is the natural decay; RELEASE is decay after key release. A held note still decays naturally. Brightness changes apply to the next pluck.",
  "SAMPLER · 采样": "SAMPLER · Samples",
  "前 8 个打击垫选择并试听 8 槽采样，PRESETS 也可选择。第一页 Level／Tune／Length／Choke；长按 EDIT 后 SELECT 翻到第二页 Variation／Vel LPF。Choke 同组新击打会停止旧声，适合开闭镲。": "The first 8 pads select and audition sample slots; PRESETS also selects them. Page one: Level / Tune / Length / Choke. Hold EDIT and use SELECT for Variation / Vel LPF on page two. A new hit in a choke group stops the previous sound, useful for open / closed hi-hats.",
  "FM 包络、调制与命名": "FM envelopes, modulation & naming",
  "ENV 打开总 ADSR 页，K1–K4 为 Attack／Decay／Sustain／Release；转动任一参数会自动启用，重新弹键试听。只浏览页面保留原音色；需要回到原 DX7 包络时，PRESETS 向左关闭覆盖层，向右重新启用。LFO 用 SELECT 翻两页，SCL 进入当前算子的键盘缩放。机身的 DX7 PATCH NAME 页已随 Classic Tabby Task 06 移除；音色名随网页工作台导入的 .syx 音色一起写入，并随项目保存。": "ENV opens the global ADSR page. K1–K4 control Attack / Decay / Sustain / Release; turning any parameter enables it automatically. Play a new note to hear the result. Merely viewing the page preserves the original sound. Turn PRESETS left to bypass the override and return to the original DX7 envelope, or right to enable it again. SELECT changes the two LFO pages; SCL opens the current operator’s keyboard scaling. The device's DX7 PATCH NAME page was removed with Classic Tabby Task 06; patch names arrive with the .syx voices imported in the workbench and are saved with the project.",
  "多数调音和包络参数需重新触发音符试听。切换 DX7 内置音色会替换编辑、打开全部算子并关闭总 ADSR。": "Retrigger notes to hear most tuning and envelope changes. Loading a factory DX7 patch replaces edits, enables all operators and disables global ADSR.",
  "MASTER 是总输出音量。": "MASTER controls the final output level. ",
  "实机旋钮控制合成器、USB 与蓝牙输入的最终输出，也影响 USB 录音。最小位置静音，切换项目沿用旋钮位置；它不随项目保存。转动时屏幕短暂显示 MASTER 百分比或 MASTER MUTED。": "The physical knob controls the final synthesizer, USB and Bluetooth input output, including USB recording. Minimum mutes. Its position remains in effect when changing projects and is not saved per project. Turning it briefly displays a MASTER percentage or MASTER MUTED.",
  "轨道 LEVEL 是项目里的混音音量。": "Track LEVEL is the mix level saved in a project. ",
  "在 HOME／SEQ 基础页用 K1 调当前轨。303 的 Volume、808 的声部 Level 和采样 Level 用于音色内部的平衡。": "On HOME / SEQ BASIC, K1 adjusts track level. The 303 Volume, 808 part Level and sample Level balance sounds within the engine.",
  "按一下 MIX 进入混音，按打击垫 1–8 切换对应轨静音。": "Tap MIX for the mixer; pads 1–8 toggle track mute.",
  "按一下 MIX 进入混音，按打击垫 9–16 切换对应轨独奏。": "Tap MIX for the mixer; pads 9–16 toggle track solo.",
  "混音页中，SELECT 选轨；K1–K4 调当前四轨组（1–4 或 5–8）的音量。": "In the mixer, SELECT chooses a track; K1–K4 adjust its group of four tracks (1–4 or 5–8).",
  "工作区 ≠ 已保存项目。": "The workspace is not a saved project. ",
  "实机未保存的编辑只在内存中，重新开机或载入其他项目会丢失。网页与实机各有自己的存档；“保存到设备”会完成传输、写入槽位和读回校验。": "Unsaved device edits exist only in memory and are lost on restart or when loading another project. Browser and device saves are separate. “Save to device” transfers, writes the slot and reads it back to verify it.",
  "预设与保存分开操作": "Switching presets and saving are separate",
  "直接切换：": "Switch directly: ",
  "在 HOME 总览转 PRESETS 即可切整套预设，屏幕显示当前工程名称；播放中切换会继续播放，停止时切换保持停止。切换直接生效，不提示保存。单轨音色在 EDIT 页用 PRESETS 选择。": "On HOME, turn PRESETS to change the whole preset. The screen shows the current project name. Playback continues if running, or stays stopped. Changes apply immediately without a save prompt. Use PRESETS on EDIT for single-track sounds.",
  "浏览列表：": "Browse the list: ",
  "总览按 HOME 打开预设，K1 向右选 FACTORY（16 个内置工程）、向左选 USER（16 个用户槽）。PRESETS／SELECT 直接载入对应编号，PLAY 载入并播放，SAVE 打开项目保存；打击垫 1–16 直接选编号并沿用之前的播放状态。空 USER 槽会提示，不替换当前项目。": "Press HOME on the overview. Turn K1 right for FACTORY (16 built-in projects) or left for USER (16 user slots). PRESETS / SELECT loads the selected number immediately. PLAY loads and plays; SAVE opens project saving. Pads 1–16 select directly and preserve playback state. An empty USER slot displays a message and keeps the current project.",
  "切换预设会直接替换当前工作区，包括未保存的修改；想保留修改时，先按 SAVE 保存。": "Switching projects replaces the workspace, including unsaved edits. Press SAVE first when you want to keep changes.",
  "保存：": "Save: ",
  "SAVE 打开保存页，SELECT／PRESETS 选 USER 槽，K1 选名称字符、K2 改字符；再按 SAVE 写入。覆盖其他已有槽须再按 SAVE 确认，成功后自动回原页面，HOME 取消。当前槽直接更新。标题星号表示未保存。": "Press SAVE, select a USER slot with SELECT / PRESETS, choose a name character with K1 and change it with K2. Press SAVE to write. Replacing another occupied slot requires a second SAVE. After success, the previous page returns; HOME cancels. The current slot updates directly. An asterisk in the title indicates unsaved changes.",
  "把网页作品放入 SMK37 OPEN": "Put your browser project on SMK37 OPEN",
  "用 USB 数据线连接 SMK37 OPEN；在网页完成编辑，点顶部“保存到设备”。": "Connect SMK37 OPEN with a USB data cable. Finish editing in the browser, then click “Save to device”.",
  "允许浏览器 MIDI／SysEx，选择目标槽位，点击“保存并校验”。已有槽位内容会被替换。": "Allow MIDI / SysEx, choose the target slot and click “Save and verify”. Existing content in that slot will be replaced.",
  "看到“读回校验通过”再断开设备。重启后可在 USER 列表载入对应槽；不需要另外按实机 SAVE。": "Wait for the read-back verification message before disconnecting. After restarting, load the slot from USER. You do not need to press SAVE on the device again.",
  "“读取设备项目”把当前实机工作区带入仿真；“恢复到工作区”也不会自动覆盖设备槽。网页的 SAVE 写入浏览器本地槽，清理浏览器数据会删除这些存档，重要作品请导出。": "“Read device project” brings the device workspace into the browser. “Restore to workspace” does not overwrite a device slot automatically. Panel SAVE in the browser writes a local browser slot. Clearing browser data removes those saves, so export important work.",
  "文件": "File",
  "包含什么": "Contents",
  "完整八轨项目：音源、参数、轨道音量、循环长度、步进等；不含采样音频。": "A complete eight-track project: engines, parameters, track levels, loop lengths, steps and more. Does not include sample audio.",
  "一条轨道的音源类型、音色参数和音量；不携带步进。支持全部六种音源。": "One track’s engine, sound parameters and level, without steps. Supports all six engines.",
  "DX7 标准音色，支持单音色和 32 音色库。设备目标轨须设为 DX7。": "Standard DX7 single patches and 32-patch banks. The target device track must use DX7.",
  "完整 8 槽采样库，所有项目共用。使用自定义采样的作品须另备份此文件。": "The complete 8-slot sample bank shared by all projects. Back it up separately for projects that use custom samples.",
  "先选完整库。": "Start with a complete bank. ",
  "修改现有实机采样时先连接项目库并“读取设备采样库”，再“备份网页采样库”。也可从内置库或 .fm1s 文件开始。": "To edit device samples, connect the library, click “Read device sample bank”, then “Back up browser sample bank”. You can also start with the built-in bank or a .fm1s file.",
  "选择采样槽与 WAV。": "Choose a slot and a WAV file. ",
  "设置名称（最多 15 个英文字符）、起点和终点，用“试听选段”检查裁切。": "Set the name (up to 15 ASCII characters), start and end, then use “Audition selection” to check the trim.",
  "试听仿真。": "Try it in the simulator. ",
  "点“送入仿真”，选择 SAMPLER 轨，用打击垫试听。": "Click “Send to simulator”, select a SAMPLER track and audition with the pads.",
  "写入实机。": "Write to the device. ",
  "分别备份。": "Back up both files. ",
  "保存项目 .fm1，并备份采样库 .fm1s；只备份项目不能保存音频。": "Save the .fm1 project and back up the .fm1s sample bank. A project backup alone does not contain audio.",
  "USB 与网页连接": "USB & browser connection",
  "下载完整 HTML 后可离线试听和编辑；读写设备需要支持 Web MIDI 的电脑 Chrome／Edge 和 USB 数据线，并允许 MIDI／SysEx。不能连接时先关闭占用 MIDI 的其他网页或软件，再重新连接。外部演奏请选择与目标轨相同的输入通道；SHIFT + SEQ 后用 K2 查看或修改。": "Download the complete HTML for offline play and editing. Device transfer needs desktop Chrome / Edge with Web MIDI, a USB data cable and permission for MIDI / SysEx. If connection fails, close other pages or apps using MIDI, then reconnect. For external performance, use the target track's input channel; press SHIFT + SEQ and use K2 to view or change it.",
  "仿真页的“连接 MIDI 输入”用于外部键盘演奏网页。项目库连接用于读写实机项目和音色。USB 音频的输入／输出选择在电脑系统或音乐软件中设置。": "“Connect MIDI input” lets an external keyboard play the browser instrument. The project-library connection transfers projects and sounds to the device. Choose USB audio input / output in your computer or music software settings.",
  "蓝牙设置": "Bluetooth settings",
  "上排功能键在所有页面都有效：FX、SCL、ENV、LFO、EDIT、MIX、SEQ 可直接切页，ARP 短按开关、长按调参数，PLAY 控制播放。菜单或步进细节中按 REC，会进入 SEQ 基础页并开始录入；再按结束。SAVE 打开项目保存页，或执行屏幕内的确认；OCT−／OCT+ 在 SEQ 和复制菜单翻步进页，其他页面调八度。离开确认页不会执行待确认操作。": "The upper panel buttons work on every page. FX, SCL, ENV, LFO, EDIT, MIX and SEQ open their pages directly. Tap ARP to toggle it or hold for settings; PLAY controls playback. REC from a menu or step details opens the SEQ basic page and starts recording; press again to finish. SAVE opens project saving or confirms the action shown on screen. OCT− / OCT+ change step pages in SEQ and the copy menu, and octaves elsewhere. Leaving a confirmation page does not execute the pending action.",
  "机身的蓝牙页已随 Classic Tabby Task 06 移除（为独立轨道启动腾出闪存）。蓝牙设置在网页工作台“项目与音色 → 蓝牙设置”：连接项目库后可打开或关闭蓝牙和蓝牙音频，选择 BLE MIDI 的 DEVICE／HOST 角色，并清除 MIDI 配对；改动立即写入设备并保存。蓝牙打开时 MIDI 服务自动可用；出厂默认蓝牙和音频打开、DEVICE 角色。时钟来源在 SEQ 的 SYNC / LOOP 页选择。HOST 模式的设备扫描与连接列表不再提供。": "The device's Bluetooth page was removed with Classic Tabby Task 06 (to free flash for independent track launching). Bluetooth settings live in the workbench under Projects & sounds → Bluetooth settings: with the library connected you can switch Bluetooth and Bluetooth audio on or off, choose the BLE MIDI DEVICE / HOST role and forget MIDI pairs; every change is written to the device and saved at once. MIDI is available whenever Bluetooth is on. Factory defaults are Bluetooth and audio on, DEVICE role. The clock source is chosen on SEQ's SYNC / LOOP page. The HOST-mode device scan and connection list are no longer offered.",
  "机身蓝牙页已移除；这里的改动立即写入设备并保存。时钟来源仍在机身 SEQ 的 SYNC / LOOP 页。": "The device's Bluetooth page is gone; changes here are written to the device and saved at once. The clock source stays on the device's SEQ SYNC / LOOP page.",
  "轨道启动": "Track launch",
  "独立轨道启动（Task 06）：机身 SONG 页按 SCL 进入 TRACK LAUNCH 页。某轨的“图案 N”就是该轨在第 N 行的块，循环长度为该行的步数；打击垫 1–16 对应当前页的第 1–16 行（OCT 翻页），按下在下一小节启动该图案，再按正在播放的图案则在下一小节停止；SHIFT + 打击垫 1–8 选轨；ENV 让所选轨回到歌曲，SHIFT + ENV 全部回到歌曲；场景跳转（SONG 页）覆盖所有轨道队列。配置设备的“Lead ms”让音色切换提前于小节发出。": "Independent track launching (Task 06): on the device's SONG page, SCL opens the TRACK LAUNCH page. A track's pattern N is its block in row N, looping over that row's step count; pads 1-16 are rows 1-16 of the current page (OCT pages); a pad launches its pattern at the next bar, pressing the playing pattern's pad stops it at the next bar; SHIFT + pads 1-8 select the track; ENV sends the selected track back to the song, SHIFT + ENV every track; a scene jump (SONG page) overrides every track queue. A device's \"Lead ms\" makes its program change leave before the bar.",
  "行 = 图案（轨道启动页的打击垫 N 对应第 N 行；块编号按轨道 1–8；0 = 该轨静音）": "Rows = patterns (pad N of the track launch page is row N; block ids per track 1–8; 0 = that track silent)",
  "各轨图案（行号）：": "Patterns per track (row numbers): ",
  "蓝牙开启": "Bluetooth on",
  "蓝牙音频": "Bluetooth audio",
  "BLE MIDI 角色": "BLE MIDI role",
  "清除 MIDI 配对": "Forget MIDI pairs",
  "蓝牙设置已写入设备。": "Bluetooth settings written to the device.",
  "蓝牙设置回复无效": "Invalid Bluetooth settings reply",
  "清除设备上保存的 BLE MIDI 配对？": "Forget the BLE MIDI pairs stored on the device?",
  "已清除 MIDI 配对；请在电脑或平板上也删除该配对后重新配对。": "MIDI pairs forgotten; remove the pairing on the computer or tablet too, then pair again.",
  "INT 与 MIDI 时钟": "INT & MIDI clock",
  "SMK37 OPEN 使用内部速度，K4 可设 30–300 BPM。": "SMK37 OPEN uses its internal tempo; K4 sets 30–300 BPM. ",
  "跟随外部 MIDI Clock，需外部发送 Start／Continue 才开始或继续。此时旋转速度不会改变外部速度。超过约两秒收不到时钟，屏幕显示 LOST；检查外部设备是否发送时钟，或切回 INT。": "SMK37 OPEN follows external MIDI Clock and waits for Start / Continue. The tempo knob does not change the external tempo. After about two seconds without clock, the screen shows LOST. Check that the external device is sending clock, or return to INT.",
  "勾选“已保存需要保留的音色、工程和采样”，点击“连接设备”，允许 MIDI／SysEx。": "Check “I have backed up the sounds, projects and samples I want to keep”, click “Connect device” and allow MIDI / SysEx.",
  "核对设备提示，点击“开始更新”，保持供电和 USB 连接直到完成。": "Check the device information, click “Start update” and maintain power and USB until completion.",
  "若更新中断或设备停在升级界面，保留": "If the update is interrupted or the device stays in update mode, keep ",
  "同一版本的这张网页": "this same version of the update page",
  "没有声音，或 MASTER 看起来没有变化": "No sound, or MASTER seems unresponsive",
  "PLAY 按了不走": "PLAY does not advance",
  "按 SEQ，转 PAGE 到 SYNC / LOOP，检查 K1 的 INT／MIDI 时钟来源；没有外部时钟时切回 INT。若播放走动但没声音，确认当前轨已写入步进、未静音且音量不为零。": "Press SEQ, turn PAGE to SYNC / LOOP and check the INT / MIDI clock source on K1. If it uses external MIDI clock but no clock source is connected, choose INT. If the sequencer advances silently, check that the track has steps, is unmuted and has a nonzero level.",
  "旋钮功能与预期不同": "A knob does something unexpected",
  "改好后重启丢了，或网页与实机不一致": "Edits disappear after restart, or browser and device differ",
  "工作区编辑需要保存到 USER 槽。网页面板 SAVE 只保存浏览器本地内容；顶部“保存到设备”完成后，设备槽位才有该项目。自定义采样另外写入采样库并备份 .fm1s。": "Save workspace edits to a USER slot. Browser panel SAVE stores only a browser copy. The device receives the project after “Save to device” completes. Write custom samples to the sample bank separately and back up the .fm1s file.",
  "换采样后其他项目的鼓声也变了": "Replacing samples changes drums in other projects",
  "所有项目共用 8 个采样槽。恢复对应的 .fm1s 库可找回原音频；导入 .fm1 项目不会恢复采样。": "All projects share 8 sample slots. Restore the corresponding .fm1s bank to recover the original audio. Importing a .fm1 project does not restore samples.",
  "挂音、组合键没松开": "Stuck notes or held buttons",
  "实机按 HOME＋PLAY。网页按 Esc 或“紧急停音”，并取消锁定按钮。停止演奏后再关闭其他 MIDI 输入来源。": "On the device, press HOME+PLAY. In the browser, press Esc or “Panic / Stop all” and release any latched buttons. Stop playing, then close other MIDI input sources.",
  "网页无法连接或按钮不可用": "The page cannot connect or buttons are unavailable",
  "用电脑 Chrome／Edge 打开网页链接或完整 HTML，避免使用不运行脚本的附件预览。检查 MIDI／SysEx 权限、USB 数据线和设备连接；关闭占用端口的软件。若浏览器提示安全上下文问题，请从 localhost 或 HTTPS 打开页面。": "Open the website link or full HTML in desktop Chrome / Edge, not an attachment preview that blocks scripts. Check MIDI / SysEx permission, the USB data cable and device connection. Close apps using the port. For secure-context errors, open the page over HTTPS or localhost.",
  "保存到哪个设备项目槽": "Device project slot to save into",
  "工作台功能": "Workbench sections",
  "预设与常用操作": "Presets & common actions",
  "上一个用户项目": "Previous user project",
  "下一个用户项目": "Next user project",
  "已载入用户项目 ": "Loaded user project ",
  "仿真轨道": "Simulator track",
  "仿真音源类型": "Simulator sound engine",
  "SMK37 OPEN 面板，窄屏可左右滑动": "SMK37 OPEN panel; scroll sideways on narrow screens",
  "SMK37 OPEN 实机布局": "SMK37 OPEN hardware layout",
  "SMK37 OPEN 设备屏幕仿真": "SMK37 OPEN device display simulation",
  "八轨步进状态": "Eight-track step status",
  "仿真 MIDI 输入": "Simulator MIDI input",
  "导入仿真项目或音色": "Import a project or sound into the simulator",
  "选择音色库中的音色": "Select a patch from the bank",
  "更新进度": "Update progress",
  "采样传输进度": "Sample transfer progress",
  "说明书目录": "Manual contents",
  "如：录音、MASTER、采样": "e.g. recording, MASTER, samples",
  "找到 ": "Found ",
  " 章": " chapters",
  "共 ": "Total: ",
  "请允许浏览器使用 MIDI / SysEx": "Allow MIDI / SysEx in your browser",
  "正在搜索并连接 SMK37 OPEN…": "Searching for SMK37 OPEN and connecting…",
  "设备已断开，请重新连接。": "Device disconnected. Please reconnect.",
  "设备已断开，请重新连接项目库。": "Device disconnected. Reconnect the project library.",
  "已连接 SMK37 OPEN，可开始更新": "SMK37 OPEN connected. Ready to update",
  "尚未连接": "Not connected",
  "设备操作正在进行": "A device operation is already in progress",
  "将网页当前项目写入 SMK37 OPEN，替换设备当前工作区。": "Write the current browser project to SMK37 OPEN, replacing the device workspace.",
  "将 SMK37 OPEN 当前工作区保存到所选设备项目槽。": "Save the current SMK37 OPEN workspace to the selected device project slot.",
  "正在连接并读取设备项目槽…": "Connecting and reading device project slots…",
  "请选择保存位置；已有内容将被覆盖。": "Choose a save location. Its existing content will be replaced.",
  "正在写入并读回校验，请保持设备连接…": "Writing and verifying by reading back. Keep the device connected…",
  "已保存到设备槽 ": "Saved to device slot ",
  "，读回校验通过。": "; read-back verification passed.",
  "完成": "Done",
  "保存未确认完成：": "Save could not be confirmed: ",
  "设备项目库信息无效": "Invalid device project-library information",
  "拨弦": "Pluck",
  "采样器": "Sampler",
  "轨道 ": "Track ",
  "未知": "Unknown",
  "项目库已连接。": "Project library connected.",
  "项目与轨道列表已刷新。": "Project and track lists refreshed.",
  "名称须为 1–12 个可显示的英文字符": "Use 1–12 printable ASCII characters for the name",
  "名称已修改，请保存项目以保留修改。": "Name changed. Save the project to keep it.",
  "项目已载入。": "Project loaded.",
  "当前项目已生成备份文件。": "Current project exported as a backup file.",
  "项目备份文件过大": "Project backup file is too large",
  "备份校验通过，可以恢复到工作区。": "Backup verified. Ready to restore to the workspace.",
  "用备份替换当前未保存的工作区？设备项目槽不会自动覆盖。": "Replace the unsaved workspace with this backup? Device project slots will not be overwritten automatically.",
  "项目已恢复到工作区，请选择槽位保存。": "Project restored to the workspace. Choose a slot and save it.",
  "请选择本版导出的 .fm1t 音色": "Choose a .fm1t sound exported by this version",
  "音色校验通过，可导入到选中的轨道。": "Sound verified. Ready to import to the selected track.",
  "请先选择音色文件": "Choose a sound file first",
  "替换轨道 ": "Replace track ",
  " 的音源和音色？鼓与旋律互换会清空此轨步进。": " engine and sound? Switching between drums and melody clears this track’s steps.",
  "轨道音色已导出。": "Track sound exported.",
  "请选择单音色或 32 音色 DX7 .syx 文件": "Choose a single-patch or 32-patch DX7 .syx file",
  "已校验 ": "Verified ",
  " 个音色，请选择音色与目标 DX7 轨道。": " patches. Choose a patch and target DX7 track.",
  "请选择 DX7 轨道与音色": "Choose a DX7 track and patch",
  " 的音色？该轨道的音符会停止。": " sound? Notes on this track will stop.",
  "请先将一条轨道设为 DX7，再刷新列表": "Set a track to DX7, then refresh the list",
  "音色已导出为 DX7 .syx 文件。": "Patch exported as a DX7 .syx file.",
  "升级未完成；请保留本网页，检查设备连接后重试": "Update incomplete. Keep this page, check the device connection and retry",
  "固件已更新，正在检查采样区…": "Firmware updated. Checking the sample bank…",
  "固件与采样区均已就绪。": "Firmware and sample bank are ready.",
  "请从 HTTPS 网站或 localhost 打开此网页": "Open this page over HTTPS or localhost",
  "本页缺少内置固件，无法烧录。请重新下载完整官方工作台。": "The built-in firmware is missing, so this page cannot update SMK37 OPEN. Download the complete official workbench again.",
  "网页试听与编辑": "Browser play & edit",
  "未附带设备固件": "No device firmware included",
  "内置固件不可用，请重新下载完整官方工作台。": "Built-in firmware is unavailable. Download the complete official workbench again.",
  "当前浏览器不支持 Web MIDI，请使用电脑 Chrome 或 Edge": "This browser does not support Web MIDI. Use desktop Chrome or Edge",
  "固件校验通过，等待连接设备": "Firmware verified. Waiting for device connection",
  "仿真状态无效": "Invalid simulator state",
  "当前音源不支持此编辑页。": "The current engine does not support this editing page.",
  "MIDI 数据无效": "Invalid MIDI data",
  "文件长度无效": "Invalid file length",
  "采样库长度无效": "Invalid sample bank length",
  "未知仿真操作": "Unknown simulator operation",
  "内存不足，当前项目保持不变": "Insufficient memory. The current project is unchanged",
  "当前音源或参数不支持此操作": "The current engine or parameter does not support this operation",
  "正在开启声音…": "Enabling sound…",
  "面板已就绪": "Panel ready",
  "声音已开启": "Sound enabled",
  "仿真尚未载入": "The simulator is not loaded yet",
  "仿真操作超时": "Simulator operation timed out",
  "FM 详细编辑：编辑打击垫选择算子／音高／全局，SELECT 翻参数页，K1–K4 调节；长按 OP 键开关算子。": "Full FM editing: edit pads choose operators / pitch / global. SELECT changes pages; K1–K4 adjust parameters. Hold an OP pad to enable / disable it.",
  "FM 总包络：K1 起音，K2 衰减，K3 保持，K4 释放；各算子包络在 EDIT 详细编辑页调节。": "Global FM envelope: K1 attack, K2 decay, K3 sustain, K4 release. Edit each operator’s envelope in the full EDIT page.",
  "FM LFO：SELECT 翻参数页，K1–K4 调节；SHIFT + ENV 返回演奏。": "FM LFO: SELECT changes parameter pages, K1–K4 adjust them; SHIFT + ENV returns to playing.",
  "音色编辑：K1–K4 调当前四项；短按 EDIT 打开的常用页用 SELECT 选轨，长按后的细调页用 SELECT 翻页。PRESETS 选音色／鼓声部。": "Sound editor: K1–K4 adjust four parameters. SELECT chooses tracks on the common page (tap EDIT) or parameter pages in full editing (hold EDIT). PRESETS selects sounds / drum parts.",
  "蓝牙：K1 总开关，K2 音频，K3 BLE 角色，K4 时钟；PRESETS 选屏幕下方操作，SAVE 执行，清除配对需再次确认。无线连接请在实机操作。": "Bluetooth: K1 master switch, K2 audio, K3 BLE role, K4 clock. PRESETS selects the on-screen action; SAVE executes it. Pairing reset needs a second confirmation. Make wireless connections on the device.",
  "保存项目：SELECT／PRESETS 选 USER 槽，再按 SAVE 保存；覆盖其他已有槽需确认，成功后自动返回。": "Save project: SELECT / PRESETS chooses a USER slot; SAVE writes it. Replacing another occupied slot requires confirmation. The panel returns after saving.",
  "FM 音色命名：SELECT 选字符，K1 改字符；EDIT 返回编辑，HOME 返回轨道。": "FM patch name: SELECT chooses a character, K1 changes it. EDIT returns to editing; HOME returns to tracks.",
  "音源预览：Pad 1–6 或 K1 选择，SAVE 应用，HOME 返回；K2 TRACK 即时选择 PROJECT（跟随项目）／LIVE（换项目保留音色）／OFF（关闭音源）。": "Sound source: choose with Pads 1–6 or K1, SAVE to apply, HOME to return. K2 TRACK immediately selects PROJECT (follow projects), LIVE (keep sound across project changes), or OFF (disable the instrument).",
  "预设列表：PRESETS／SELECT 直接载入，PLAY 载入播放，SAVE 打开项目保存；K1 选 USER／FACTORY。切换直接生效，不提示保存。": "Preset list: PRESETS / SELECT loads immediately, PLAY loads and plays, SAVE opens project saving. K1 chooses USER / FACTORY. Preset changes are immediate, with no save prompt.",
  "换整套预设": "change the whole preset",
  "选循环长度": "choose loop length",
  "换当前轨音色／鼓声部": "change the track sound / drum part",
  "选保存槽位": "choose a save slot",
  "选步进": "choose a step",
  "换当前轨音色": "change the track sound",
  "选整套预设": "choose a whole preset",
  "面板 PRESETS 旋钮：": "Panel PRESETS knob: ",
  "以屏幕下方标签为准": "follow the labels below the screen",
  "工作区有修改": "Workspace has changes",
  "工作区未修改": "Workspace unchanged",
  "暂停": "Pause",
  " 步": " steps",
  " · 下轮 ": " · next loop: ",
  " · 静音": " · muted",
  " · 独奏": " · solo",
  "此预览环境不支持仿真。请保存 HTML 后，用电脑 Chrome 或 Edge 打开。": "This preview cannot run the simulator. Save the HTML and open it in desktop Chrome or Edge.",
  "仿真文件校验失败，请重新下载完整工作台。": "Simulator verification failed. Download the complete workbench again.",
  "载入失败": "Loading failed",
  "浏览器未开启声音，编辑仍可使用。": "The browser did not enable audio. Editing is still available.",
  "声音已开启，可用“试听音量”调节。": "Sound enabled. Adjust the Monitor volume slider.",
  "声音已关闭，面板与编辑继续运行。": "Sound disabled. The panel and editor continue running.",
  "浏览器不支持音频线程，请使用电脑 Chrome 或 Edge；当前面板仍可编辑。": "Audio worklets are unavailable. Use desktop Chrome or Edge; the panel can still be edited.",
  "浏览器未允许播放声音，面板仍可编辑。": "Audio playback was not allowed. The panel can still be edited.",
  "音频模块载入超时，面板仍可编辑。": "Audio module loading timed out. The panel can still be edited.",
  "音频线程启动失败，面板仍可编辑。": "Audio thread failed to start. The panel can still be edited.",
  "音频线程没有响应，面板仍可编辑。": "Audio thread did not respond. The panel can still be edited.",
  "音频线程已停止。请重新载入页面；已保存到本地槽的项目仍在。": "Audio thread stopped. Reload the page; projects saved in local slots are retained.",
  "声音已开启，面板状态和编辑已保留。": "Sound enabled. Your panel state and edits were preserved.",
  "SCL：DX7 算子键盘缩放；其他音源打开音高参数页。": "SCL: DX7 operator keyboard scaling; opens pitch parameters for other engines.",
  "已打开": "Opened ",
  "；用面板旋钮调整，HOME 返回。": "; adjust with the panel knobs. HOME returns.",
  "切换音源将重置此轨的音色；鼓与旋律之间切换还会清空此轨步进。继续吗？": "Changing engines resets this track’s sound. Switching between drums and melody also clears its steps. Continue?",
  "已导出仿真工作区项目。": "Browser workspace project exported.",
  "已载入 ": "Loaded ",
  "已导出当前轨道的音源类型与全部音色参数。": "Current track engine and all sound parameters exported.",
  "已导出当前轨道的 DX7 音色。": "Current track DX7 patch exported.",
  "请选择 .fm1 项目、.fm1t 音色或 DX7 .syx 文件": "Choose a .fm1 project, .fm1t sound or DX7 .syx patch file",
  "音色校验通过，请先选择 DX7 轨道再导入。": "Patch verified. Choose a DX7 track before importing.",
  "文件校验通过，点击“导入到仿真”应用。": "File verified. Click “Import into browser” to apply it.",
  "将替换仿真工作区": "Replace the browser workspace ",
  "当前 DX7 音色": "current DX7 patch",
  "当前轨道音色": "current track sound",
  "项目": "project",
  "，继续吗？": " and continue?",
  "已导入仿真工作区；按面板 SAVE 保存到本地仿真槽。": "Imported into the browser workspace. Press panel SAVE to store it in a browser slot.",
  "请先启动仿真": "Start the simulator first",
  "设备项目已载入仿真工作区。": "Device project loaded into the browser workspace.",
  "清空此浏览器的 16 个仿真项目槽并恢复默认音源？采样库和试听音量保留，设备上的内容不受影响。": "Clear all 16 project slots in this browser and restore default engines? Samples and monitor volume are preserved. Device contents will not change.",
  "本地项目存档已清空，采样库和试听音量已保留。": "Browser project saves cleared. Samples and monitor volume are preserved.",
  "此浏览器不支持 MIDI 输入，请使用电脑 Chrome 或 Edge": "This browser does not support MIDI input. Use desktop Chrome or Edge",
  "MIDI 输入已断开，仿真音符已释放。": "MIDI input disconnected; simulator notes released.",
  "选择 MIDI 输入": "Choose MIDI input",
  "选择一个输入端口；MIDI 通道沿用设备的轨道映射。": "Choose an input port. MIDI channels follow the device’s track mapping.",
  "未发现 MIDI 输入设备。": "No MIDI input devices found.",
  "采样库格式无效": "Invalid sample bank format",
  "采样库校验失败": "Sample bank verification failed",
  "采样库保留字段无效": "Invalid reserved sample bank fields",
  "采样槽 ": "Sample slot ",
  " 无效": " is invalid",
  "SEA5 数据块无效": "Invalid SEA5 block",
  "采样库包含多余数据": "Sample bank contains extra data",
  "采样空间不足，请缩短音频或清空其他槽位": "Not enough sample space. Shorten audio or clear other slots",
  "空槽": "Empty slot",
  " 秒": " seconds",
  "已用 ": "Used ",
  " KiB；余 ": " KiB; remaining: ",
  " 秒（按 SEA5 估算）。": " seconds (SEA5 estimate).",
  "网页音源库校验失败": "Browser engine verification failed",
  "内置采样载入失败": "Built-in sample loading failed",
  "音频太长或内存不足": "Audio is too long or memory is insufficient",
  "SEA5 编码失败": "SEA5 encoding failed",
  "已取消编码，采样库保持不变": "Encoding cancelled. The sample bank is unchanged",
  "编码超时，请缩短音频后重试": "Encoding timed out. Shorten the audio and retry",
  "编码线程失败": "Encoder worker failed",
  "请先选择 WAV 音频": "Choose WAV audio first",
  "裁剪起止时间无效": "Invalid trim start or end time",
  "音频文件不能超过 32 MiB": "Audio files cannot exceed 32 MiB",
  "音频 ": "Audio: ",
  "试听裁剪后的单声道音频。": "Auditioning the trimmed mono audio.",
  "空间不足：请缩短选段或清空其他槽位": "Not enough space. Shorten the selection or clear other slots",
  "已替换网页采样库中的槽 ": "Replaced browser sample slot ",
  "清空网页采样库槽 ": "Clear browser sample slot ",
  "？写入设备前仍不会修改实机。": "? The device will not change until you write the bank.",
  "网页槽位已清空。": "Browser sample slot cleared.",
  "用 8 个内置音色替换网页采样库？设备暂不修改。": "Replace the browser bank with 8 built-in sounds? The device will not change yet.",
  "内置采样已载入网页，可写入设备恢复。": "Built-in samples loaded in the browser. Write them to the device to restore its bank.",
  "正在读取设备完整采样库…": "Reading the complete device sample bank…",
  "设备采样已读取；导出备份后再编辑更方便恢复。": "Device samples read. Export a backup before editing for easy recovery.",
  "写入整个 8 槽采样库？设备播放会暂停。写入中断需重新写入完整采样库；项目槽不变。": "Write the entire 8-slot sample bank? Device playback will pause. If interrupted, rewrite the complete bank. Project slots stay unchanged.",
  "采样库过大": "Sample bank is too large",
  "采样区仍在校验，请稍后在采样页检查": "Sample verification is still running. Check the sampler page shortly",
  "正在初始化内置采样，请保持 USB 与供电…": "Initializing built-in samples. Keep USB and power connected…",
  "内置采样初始化完成。": "Built-in samples initialized.",
  "已载入网页内置采样库。编辑前可先读取设备库，保留已有自定义采样。": "Built-in browser sample bank loaded. Read the device bank before editing to keep existing custom samples.",
  "固件包长度无效": "Invalid firmware package length",
  "固件身份无效": "Invalid firmware identity",
  "固件包头校验失败": "Firmware header verification failed",
  "芯片型号或包目录无效": "Invalid chip type or package directory",
  "固件目录校验失败": "Firmware directory verification failed",
  "固件条目越界": "Firmware entry is out of bounds",
  "固件存储长度无效": "Invalid stored firmware length",
  "固件条目重叠": "Firmware entries overlap",
  "固件内容校验失败：": "Firmware content verification failed: ",
  "固件主镜像或升级程序格式不兼容": "Incompatible main firmware or updater format",
  "Flash 镜像无效": "Invalid flash image",
  "升级程序缺失或无效": "Updater is missing or invalid",
  "协议数据过长": "Protocol data is too long",
  "设备响应过多，已停止升级": "Too many device responses; update stopped",
  "USB 连接已断开": "USB disconnected",
  "设备未响应；当前固件可能尚未支持网页更新": "Device did not respond. Its firmware may not support browser updates yet",
  "设备升级协议不匹配": "Device update protocol does not match",
  "设备使用未知的升级程序": "The device uses an unknown updater",
  "设备身份响应无效": "Invalid device identity response",
  "正在更新": "Updating",
  "设备正在处理另一次升级": "The device is processing another update",
  "检测到多台可能的升级设备，无法确认目标": "Multiple possible update devices found; the target is ambiguous",
  "等待设备重连超时；请保留这个更新网页，重新连接同一台设备后重试": "Timed out waiting for reconnection. Keep this update page, reconnect the same device and retry",
  "升级超过最长等待时间，尚未完成": "Update exceeded the maximum wait time and is incomplete",
  "设备停止请求数据，升级未完成": "The device stopped requesting data; update incomplete",
  "USB 意外断开；重新连接同一设备后用此网页重试": "USB disconnected unexpectedly. Reconnect the same device and retry with this page",
  "设备请求长度无效": "Invalid device request length",
  "设备的升级阶段不匹配": "Device update stage does not match",
  "设备读取超出固件包范围": "Device read exceeds the firmware package",
  "请先连接设备": "Connect the device first",
  "设备状态已改变，请重新连接": "Device state changed. Please reconnect",
  "设备已经是这个版本": "The device already has this version",
  "设备拒绝此固件包": "The device rejected this firmware package",
  "准备升级程序": "Preparing the updater",
  "等待升级设备重新连接": "Waiting for the update device to reconnect",
  "写入固件": "Writing firmware",
  "重启并核对新版本": "Restarting and verifying the new version",
  "更新完成": "Update complete",
  "文件协议参数无效": "Invalid file protocol parameters",
  "DX7 音色长度无效": "Invalid DX7 patch length",
  "DX7 参数越界：": "DX7 parameter out of range: ",
  "请选择 DX7 单音色或 32 音色 .syx 文件": "Choose a single-patch or 32-patch DX7 .syx file",
  "DX7 SysEx 消息无效": "Invalid DX7 SysEx message",
  "DX7 数据类型或长度不匹配": "DX7 data type or length mismatch",
  "DX7 音色校验失败": "DX7 patch verification failed",
  "MIDI 通道无效": "Invalid MIDI channel",
  "项目长度无效": "Invalid project length",
  "项目备份文件长度无效": "Invalid project backup length",
  "项目备份格式无效": "Invalid project backup format",
  "项目备份校验失败": "Project backup verification failed",
  "项目调音数据无效": "Invalid project tuning data",
  "请先更新设备固件，再写入含调音设置的项目": "Update the device firmware before writing a project with tuning settings",
  "音色长度无效": "Invalid sound length",
  "音色文件长度无效": "Invalid sound file length",
  "音色格式无效": "Invalid sound format",
  "音色校验失败": "Sound verification failed",
  "检测到多台支持项目库的设备，请只连接一台 SMK37 OPEN": "Multiple devices responded to the project library. Connect only one SMK37 OPEN",
  "当前固件未支持这个项目库": "The current firmware does not support this project library",
  "请先连接项目库": "Connect the project library first",
  "文件传输正在进行": "A file transfer is in progress",
  "USB 已断开，当前操作未完成": "USB disconnected; the operation is incomplete",
  "设备回复不完整": "Incomplete device response",
  "该项目槽为空": "This project slot is empty",
  "文件或参数无效，当前项目保持不变": "Invalid file or parameters. The current project is unchanged",
  "设备操作失败：": "Device operation failed: ",
  "设备未响应；请检查 USB 或固件是否支持项目库": "Device did not respond. Check USB and project-library firmware support",
  "设备文件长度无效": "Invalid device file length",
  "文件片段不完整": "Incomplete file chunk",
  "请选择设备项目槽": "Choose a device project slot",
  "设备工作区与待保存项目不一致，尚未写入项目槽": "The device workspace differs from the project to save. No project slot was written",
  "保存后的读回校验不一致，请重新连接并检查设备项目槽": "Saved project read-back did not match. Reconnect and check the device slot",
  "设备采样库尚未就绪，可用内置库恢复": "The device sample bank is not ready. Restore it with the built-in bank",
  "采样片段不完整": "Incomplete sample chunk",
  "已取消": "Cancelled",
  "已取消；请重新写入完整采样库恢复": "Cancelled. Write the full sample bank again to recover",
  "网页顶部和实机开机画面显示版本；HOME 显示 Pad 当前是演奏还是步进模式。开机动画约 1 秒，按键或旋钮可跳过；开机不会自动播放。": "The web header and device startup screen show the version. HOME shows whether Pads play notes or edit steps. The startup animation lasts about a second and can be skipped with a key or encoder; startup does not start playback.",
  "多个轨道可以同时独奏；同一轨的静音与独奏互斥。": "Multiple tracks can be soloed; a track cannot be muted and soloed at the same time.",
  "项目保存各轨 ARP 开关与参数；采样音频须另备份采样库。": "Projects save each track’s ARP settings. Back up sample audio separately as a sample bank.",
  "例如在默认设置下，键盘 CH2 控制轨 2；将轨 3 的输入也设为 CH2，即可同时演奏轨 2 和轨 3。": "With the default settings, keyboard CH2 controls track 2. Set track 3's input to CH2 as well to play both tracks together.",
  "打开最新版工作台的“设备更新”，通过 USB 数据线连接 SMK37 OPEN。固件已内置。": "Open Device update in the latest workbench and connect SMK37 OPEN by USB. Firmware is included.",
  "网页检查静音按钮、输出电平和系统音量。实机检查 MASTER、轨道 LEVEL、静音／独奏和输出连接；MASTER 最小位置静音。": "In the browser, check Mute, output level and system volume. On SMK37 OPEN, check MASTER, track LEVEL, mute/solo and output connections. Minimum MASTER mutes the output.",
  "已是当前版本，无需更新。": "This version is already installed. No update is needed.",
  "取消连接": "Cancel connection",
  "已取消连接。": "Connection cancelled.",
  "连接超时，请检查 USB 连接和 MIDI 权限后重试。": "Connection timed out. Check USB and MIDI permissions, then retry.",
  "采样读取已取消": "Sample reading cancelled",
  "歌曲模式（Classic Tabby）": "Song mode (Classic Tabby)",
  "设备配置 Rig（Classic Tabby）": "Rig setup (Classic Tabby)",
  "告诉工作台每个 MIDI 通道上接的是哪台设备（web/devices/ 中的定义：音色编号方式、音色库、命名的 CC、设备需要的间隔）。行事件编辑器据此按名称选择音色。配置保存在本浏览器，可导出/导入 JSON；歌曲可带自己的副本。面板为英文。": "Tells the workbench which device sits on each MIDI channel (definitions in web/devices/: program numbering, banks, named CCs, the gap a device needs). The row event editor then picks presets by name. The profile is saved in this browser, exportable as JSON; a song can carry its own copy. The panel is in English.",
  "行事件（Task 04：行开始时发送的 Program Change / Bank Select / CC，目标为 MIDI 通道；面板为英文）": "Row events (Task 04: Program Change / Bank Select / CC sent at the row start, addressed to a MIDI channel; panel in English)",
  "导入 MIDI 文件（Classic Tabby）": "Import MIDI file (Classic Tabby)",
  "把标准 MIDI 文件（.mid，type 0/1，含 Renoise 导出）转换为歌曲：预览各声部、指定轨道与输出通道、选择小节范围后写入设备或浏览器仿真（写入目标跟随上方“歌曲模式”的目标选择；占用的歌曲槽会先删除再写入）。面板为英文。": "Converts a standard MIDI file (.mid, type 0/1, Renoise exports included) into a song: preview the parts, assign tracks and output channels, pick a bar range, then write to the device or the browser simulator (the target follows the Song mode target above; an occupied song slot is deleted first). The panel is in English.",
  "歌曲 = 行的序列；每行给 8 条轨道各指定一个块（64 步、每步最多 4 个音符）。歌曲存放在设备的歌曲存储区，由面板 ACTIONS → SONG MODE 播放。文件格式见 docs/tasks/TASK-03-step1-assessment.md 第 9 节。": "A song is a sequence of rows; each row assigns one block (64 steps, up to 4 notes per step) to each of the 8 tracks. Songs live in the device's song storage and play from the panel's ACTIONS > SONG MODE. File format: docs/tasks/TASK-03-step1-assessment.md section 9.",
  "目标": "Target",
  "设备（项目库）": "Device (project library)",
  "浏览器仿真": "Browser simulator",
  "歌曲槽": "Song slot",
  "读取歌曲": "Read song",
  "新建歌曲": "New song",
  "写入歌曲": "Write song",
  "删除歌曲": "Delete song",
  "导出 .tabby": "Export .tabby",
  "导入 .tabby": "Import .tabby",
  "存储状态": "Storage status",
  "名称": "Name",
  "项目槽": "Project slot",
  "BPM（0 = 项目速度）": "BPM (0 = project tempo)",
  "整曲循环": "Loop the song",
  "循环起始行": "Loop start row",
  "跳转落点": "Jumps land at",
  "下一小节": "Next bar",
  "行尾": "End of row",
  "输出通道（每轨，0 = 设备设置）": "Output channels (per track, 0 = device setting)",
  "行（块编号按轨道 1–8；0 = 该轨静音）": "Rows (block id per track 1-8; 0 = track silent)",
  "行": "Row",
  "重复": "Repeat",
  "步数": "Steps",
  "行内循环": "Loop here",
  "添加行": "Add row",
  "删除末行": "Remove last row",
  "块编号": "Block id",
  "载入块": "Load block",
  "保存块": "Store block",
  "删除块": "Remove block",
  "每步：音高:力度:长度[r]，多个音符以空格分隔；r = 重触发，@n = 概率 n/8，! = 备用调音（例：60:100:2 64:100:2r @4）。长度以 16 分音符计。": "Per step: pitch:velocity:length[r], several notes separated by spaces; r = retrigger, @n = probability n/8, ! = alt tuning (example: 60:100:2 64:100:2r @4). Lengths are in 16th steps.",
  "写入歌曲会先写入歌曲记录，再把编辑器中的全部块分批写入设备（每批最多 8 个扇区，一次提交；旧副本在设备 ACTIONS → COMPACT SONG STORAGE 时回收），最后读回校验。写入期间设备音频会短暂中断。恢复原厂 V16 会覆盖歌曲存储的最后 40 KB（块扇区 86–95），请先导出歌曲。": "Write song stores the song record first, then every block in the editor in batches (up to 8 sectors per batch, one commit each; old copies are reclaimed by ACTIONS > COMPACT SONG STORAGE on the device), then verifies the record by read-back. Device audio pauses briefly while it writes. Restoring factory V16 overwrites the last 40 KB of song storage (block sectors 86-95): export your songs first.",
  "请先启动仿真": "Start the simulator first",
  "请先连接项目库": "Connect the project library first",
  "请先读取或新建歌曲": "Read or create a song first",
  "已新建空歌曲：填写行与块后点击“写入歌曲”。": "New empty song: fill in rows and blocks, then click Write song.",
  "该歌曲槽为空。": "This song slot is empty.",
  "歌曲已读取。": "Song read.",
  "写入歌曲槽 ": "Write song slot ",
  "该槽已有歌曲：写入前会先删除旧歌曲，其块在下次压缩时回收。如需保留旧歌曲，请先取消并导出 .tabby。": "This slot already holds a song: it is deleted before the write and its blocks are reclaimed at the next compaction. To keep the old song, cancel and export a .tabby first.",
  "旧歌曲已删除，新歌曲已写入并读回校验。": "Old song deleted; new song written and verified by read-back.",
  "歌曲速度须为 0 或 30–300": "Song tempo must be 0 or 30–300",
  "歌曲已写入并读回校验。": "Song written and verified by read-back.",
  "删除歌曲槽 ": "Delete song slot ",
  "歌曲已删除。": "Song deleted.",
  "已导出 .tabby 文件。": "Exported the .tabby file.",
  ".tabby 文件过大": ".tabby file too large",
  "已导入 .tabby 文件到编辑器，点击“写入歌曲”上传。": "Imported the .tabby file into the editor; click Write song to upload it.",
  "最多 128 行": "At most 128 rows",
  "至少保留 1 行": "Keep at least 1 row",
  "块编号须为 1–65535": "Block id must be 1-65535",
  "不是歌曲记录": "Not a song record",
  "歌曲记录校验失败": "Song record checksum failed",
  "歌曲记录版本不受支持": "Unsupported song record version",
  "歌曲记录字段无效": "Invalid song record field",
  "歌曲名称须为英文字符": "The song name must use ASCII characters",
  "项目槽无效": "Invalid project slot",
  "BPM 无效": "Invalid BPM",
  "歌曲须有 1–128 行": "A song needs 1-128 rows",
  "循环起始行无效": "Invalid loop start row",
  "输出通道须为 0–16": "Output channels must be 0-16",
  "块数据不完整": "Block data is incomplete",
  "块步进头无效": "Invalid block step header",
  "块音符无效": "Invalid block note",
  "块长度不符": "Block length mismatch",
  "块须有 64 步": "A block needs 64 steps",
  "每步最多 4 个音符": "At most 4 notes per step",
  "音符须为 音高 0–127、力度 1–127、长度 1–255，且同一步音高不重复": "Notes need pitch 0-127, velocity 1-127, length 1-255, and no repeated pitch within a step",
  "概率须为 @0–@7": "Probability must be @0-@7",
  "不是 .tabby 歌曲文件": "Not a .tabby song file",
  "文件中的块须属于歌曲 0": "Blocks in a file must belong to song 0",
  "块记录无效": "Invalid block record",
  "歌曲存储状态回复无效": "Invalid song storage status reply",
  "块长度无效": "Invalid block length",
  "请先更新固件以使用歌曲模式": "Update the firmware to use song mode",
  "歌曲读回校验不一致，请重试": "Song read-back mismatch; retry",
  "歌曲记录长度无效": "Invalid song record length",
  "歌曲存储已满，请在设备 ACTIONS 中压缩歌曲存储或删除歌曲": "Song storage is full; compact song storage from the device's ACTIONS page or delete a song",
  "歌曲存储已满": "Song storage is full",
  "恢复 V16 还会覆盖 Classic Tabby 歌曲存储的最后 40 KB（块扇区 86–95）。请先在“项目与音色 → 歌曲模式”导出歌曲。": "Restoring V16 also overwrites the last 40 KB of Classic Tabby song storage (block sectors 86-95). Export your songs first in Projects & sounds > Song mode.",
  "歌曲模式": "Song mode",
  "歌曲模式：K1／PRESETS 选歌曲，PLAY 开始／停止，打击垫 1–16 排队跳转到该行，OCT 翻打击垫页，K4 设置跳转落点。歌曲由网页工作台写入。": "Song mode: K1 / PRESETS select the song, PLAY starts and stops, pads 1-16 queue a jump to that row, OCT pages the pads, K4 sets where jumps land. Songs are written from the web workbench.",
  "正在编码采样…": "Encoding sample audio…",
  "摇摆跟随项目设置": "Swing follows the project setting",
  "步进文本：音高:力度:长度/偏移，长度以步为单位（可带小数，精度 1/480 步），偏移为有符号单位（1 单位 = 1/480 步），r = 重触发，@n = 概率 n/8，! = 替代音律。带偏移或非整步长度的步进左侧有橙色标记；点击某一步在下方检查器中按音符编辑。": "Step text: pitch:velocity:length/offset; length in steps (decimals allowed, 1/480 step resolution), offset in signed units (1 unit = 1/480 step), r = retrigger, @n = probability n/8, ! = alt tuning. Steps with an offset or a fractional length carry an orange mark on the left; click a step to edit its notes in the inspector below.",
  "量化起点到 16 分": "Quantize starts to 16ths",
  "量化起点与结束到 16 分": "Quantize starts and ends to 16ths",
  "此步没有音符：在上方文本框中输入，例如 60:100:1/-12": "No note on this step: type one in the box above, for example 60:100:1/-12",
  "timed-note.js 未加载": "timed-note.js is not loaded",
  "音符须为 音高 0–127、力度 1–127、偏移 ±240、长度 ≥ 1 单位，且同一步音高不重复": "Notes need pitch 0-127, velocity 1-127, offset within ±240 units, length of at least 1 unit, and no repeated pitch within a step",
  "设备固件不支持带时值的音符块，请先更新固件": "The device firmware does not accept timed-note blocks; update the firmware first",
  // Classic Tabby (Task 08): the rewritten manual tab, 2026-11-04
  "Classic Tabby 使用说明书": "Classic Tabby manual",
  "第 01–12 章讲 Classic Tabby 的功能，英文；第 13–21 章沿用 SMK37 OPEN 的说明。": "Chapters 01 to 12 cover Classic Tabby's features, in English. Chapters 13 to 21 are the SMK37 OPEN chapters that still apply.",
  "13 · 三分钟上手（合成器）": "13 · Get started (synth)",
  "14 · 面板与快捷键": "14 · Panel & shortcuts",
  "15 · 步进与录入": "15 · Steps & recording",
  "16 · 五种音源": "16 · Five sound engines",
  "17 · 音量与混音": "17 · Volume & mixing",
  "18 · 保存与文件": "18 · Saving & files",
  "19 · MIDI、蓝牙与时钟": "19 · MIDI, Bluetooth & clock",
  "20 · 更新固件": "20 · Firmware updates",
  "21 · 常见问题": "21 · Troubleshooting",
  "没有找到匹配章节。试试“LAUNCH”“保存”“MIDI”等关键词，或点击“显示全部章节”。": "No matching chapters. Try “LAUNCH”, “save” or “MIDI”, or click “Show all chapters”.",
  "Classic Tabby 有": "Classic Tabby has",
  "8 条轨道、5 种音源、16 个用户项目槽": "8 tracks, 5 engines and 16 user project slots",
  "回总览后 SELECT 选轨；DX7 轨短按 EDIT 进入快捷页，转 PRESETS 换音色，PAGE 换 A–D 音色组，K1–K4 调算法／反馈／移调／音量，再按 EDIT 返回。其他音源的音色在网页工作台编辑。想换音源，在总览转 PAGE 或 K2，SAVE 应用。": "On the overview, SELECT chooses a track. On a DX7 track a short EDIT press opens the quick page: turn PRESETS to change the voice, PAGE for banks A–D, K1–K4 for algorithm, feedback, transpose and level; press EDIT again to return. Sounds of the other engines are edited in the workbench. To change engines, turn PAGE or K2 on the overview, then press SAVE.",
  "总览、DX7 快捷页、步进和混音页选轨；菜单选项目；SONG 页选歌曲。": "Choose a track on the overview, the DX7 quick page, the sequencer and mixer pages; select menu items; choose the song on the SONG page.",
  "总览直接切换整套工程预设；DX7 快捷页选当前轨音色；预设列表选工程；SEQ 选步；SAVE 页选存档槽；SONG 页选歌曲。": "On HOME, change the complete project preset; on the DX7 quick page, the track voice; in the preset browser, the project; on SEQ, the step; on SAVE, the slot; on the SONG page, the song.",
  "总览选择合成引擎，SAVE 应用、HOME 取消；SEQ／ARP／FX 翻参数页；DX7 快捷页切换 A–D 音色组。": "On HOME, preview a sound engine, then SAVE to apply or HOME to cancel. PAGE changes parameter pages in SEQ / ARP / FX and switches banks A–D on the DX7 quick page.",
  "DX7 轨短按进入或退出快捷页（PRESETS 选音色，PAGE 换音色组，K1–K4 调算法／反馈／移调／音量）。其他音源按 EDIT 时屏幕提示 VOICE EDIT MOVED TO WORKBENCH，音色在网页工作台编辑。": "On a DX7 track, tap to enter or leave the quick page (PRESETS selects the voice, PAGE the bank, K1–K4 algorithm, feedback, transpose and level). On other engines EDIT shows VOICE EDIT MOVED TO WORKBENCH; those sounds are edited in the workbench.",
  "步进页翻 16 步；演奏时上下移调八度；SONG 与 TRACK LAUNCH 页翻打击垫页。": "Change 16-step pages in the sequencer; transpose by octaves when playing; turn the pad page on the SONG and TRACK LAUNCH pages.",
  "FX 按轨调混响和延迟。SCL 在 SONG 与 TRACK LAUNCH 页之间切换；ENV 让所选轨回到歌曲，SHIFT + ENV 让全部轨道回到歌曲。在其他页面，SCL、ENV 和 SHIFT + ENV 只提示音色编辑已移至网页工作台。": "FX edits track reverb and delay. SCL switches between the SONG and TRACK LAUNCH pages; ENV sends the selected track back to the song, SHIFT + ENV every track. On other pages SCL, ENV and SHIFT + ENV only say that voice editing moved to the workbench.",
  "上排功能键在所有页面都有效：FX、EDIT（DX7 轨）、MIX、SEQ 可直接切页；SCL、ENV、LFO 只在歌曲页有作用（见第 05 章）；ARP 短按开关、长按调参数，PLAY 控制播放。菜单或步进细节中按 REC，会进入 SEQ 基础页并开始录入；再按结束。SAVE 打开项目保存页，或执行屏幕内的确认；OCT−／OCT+ 在 SEQ 和复制菜单翻步进页，其他页面调八度。离开确认页不会执行待确认操作。": "The upper panel buttons work on every page. FX, EDIT (DX7 tracks), MIX and SEQ open their pages directly; SCL, ENV and LFO act on the song pages only (chapter 05). Tap ARP to toggle it or hold for settings; PLAY controls playback. REC from a menu or step details opens the SEQ basic page and starts recording; press again to finish. SAVE opens project saving or confirms the action shown on screen. OCT− / OCT+ change step pages in SEQ and the copy menu, and octaves elsewhere. Leaving a confirmation page does not execute the pending action.",
  "把鼠标放在 LCD 上的数值，出现高亮即可滚轮调节；每次按参数最小步长变化，不随滚动速度加速。也可点击打开大号数值框，用滚轮、＋／−或方向键细调，Esc 关闭。支持底部参数、顶部 BPM、总览各轨音量、SEQ 循环长度、步进详情的选步数字、DX7 快捷页的参数行和效果参数行。混音页也可点静音／独奏格子设置。状态、电平、固定量化和当前引擎不支持的参数只显示；外部 MIDI 时钟下 BPM 由外部控制。切换轨道或参数页会关闭旧编辑框，避免改错参数。总览调其他轨的小音量数字不会改变当前选轨。": "Hover over an LCD value: a highlight means it is editable with the mouse wheel. Each step uses the parameter's smallest increment, without scroll-speed acceleration. Click to open a larger value display, then use the wheel, + / − or arrow keys; Esc closes it. Editable values include bottom parameters, top BPM, overview track levels, SEQ loop length, the step-details cursor, the DX7 quick page's rows and the effect rows. Mixer mute / solo cells are also editable. Status, meters, fixed quantization and unsupported engine parameters remain read-only; external MIDI clock controls BPM. Changing tracks or parameter pages closes the old editor to prevent editing the wrong value. Adjusting another track's small level on the overview does not change your selected track.",
  "SHIFT + HOME 音源页的 K2 TRACK 即时选择 PROJECT／LIVE／OFF：PROJECT 跟随项目，LIVE 在换项目时保留音色和按住的音符，OFF 释放音源内存。原来的 NORMAL／PLAY 设置分别对应 PROJECT／LIVE。LIVE 音色请单独导出；项目保存的是原有编曲。模式与输入通道自动记忆；修改前请先停音。K1 仍只预览音源，SAVE 应用音源，HOME 返回。": "K2 TRACK on SHIFT + HOME immediately selects PROJECT / LIVE / OFF: PROJECT follows the project, LIVE retains its sound and held notes across project changes, and OFF frees instrument memory. Existing NORMAL / PLAY preferences map to PROJECT / LIVE. Export LIVE timbres separately; projects store the arrangement. Mode and input-channel preferences are remembered. Release notes before changing them. K1 still previews a source, SAVE applies it, and HOME returns.",
  "HOME＋PLAY 紧急停音回起点；HOME＋SAVE 撤销／重做；SEQ＋EDIT 打开更多菜单。都可以从长按 SEQ 的菜单完成对应操作。网页需要锁住按键时可 Shift 点击或右击，再点释放；日常操作无需使用。": "HOME+PLAY stops all sound and returns to the start; HOME+SAVE toggles undo / redo; SEQ+EDIT opens more actions. These actions are also in the SEQ hold menu. In the browser, Shift-click or right-click a button to hold it, then click again to release. These combinations are optional.",
  "内置 128 个 DX7 格式预置音色，分为 A–D 四组，每组 32 个。网页工作台可把标准 DX7 单音色或 32 音色 SysEx 导入某一轨，不支持扩展参数。机身不再有 DX7 用户音色库。": "The 128 DX7-format presets are arranged in banks A–D of 32 voices each. The workbench imports a standard DX7 single-voice or 32-voice SysEx file to a track; extended parameters are not supported. The device no longer has a DX7 user library.",
  "808 支持分频、方向、Swing 和 Hold；音域与门长显示“--”，不移调鼓声部。ARP 开关与六项参数随项目保存，按住或 Hold 锁住的音符不保存。": "808 supports rate, direction, Swing and Hold. Range and gate show “--”; drum parts are not transposed. ARP enable and all six settings are saved with the project; held or latched notes are not.",
  "旋律音符和 DRUM 808 都在全部按键松开后前进一步；重叠按下的声音录入同一步。": "Melodic notes and DRUM 808 both advance one step when every played key is released. Overlapping notes are recorded on the same step.",
  "短按 EDIT 进入快捷页：PRESETS 选 1–128 音色，PAGE 切换 A–D 组，K1–K4 调算法／反馈／移调／音量。再短按返回。算子级编辑和 .syx 导入在网页工作台完成。": "Tap EDIT for the quick page: PRESETS selects voices 1–128, PAGE switches banks A–D, and K1–K4 adjust algorithm, feedback, transpose and level. Tap again to return. Operator-level editing and .syx import happen in the workbench.",
  "参数在网页工作台编辑：Cutoff／Reso／EnvMod／Decay；Accent／Wave／Tune／Volume；Drive／DrvTyp／Slide／AccDec；Mono／Poly 选择单音滑音或 4 复音。Program Change 0／1 切换锯齿／方波。": "Parameters are edited in the workbench: Cutoff / Reso / EnvMod / Decay; Accent / Wave / Tune / Volume; Drive / DrvTyp / Slide / AccDec; Mono / Poly selects monophonic slide or four-voice polyphony. Program Change 0 / 1 switches saw / square.",
  "11 个鼓声部与 KIT 的参数在网页工作台编辑；各声部可调参数不同，KIT 调整整套鼓组。机身用琴键或打击垫试听并选中声部。": "The parameters of the 11 drum parts and KIT are edited in the workbench; available parameters depend on the part, and KIT adjusts the whole kit. On the device, a key or pad auditions and selects the part.",
  "网页工作台编辑 MODE（YM／AY／NOISE／MIX）、NOISE、TUNE、RELEASE。纯方波模式下 NOISE 不改变声音。": "Edited in the workbench: MODE (YM / AY / NOISE / MIX), NOISE, TUNE and RELEASE. NOISE has no effect in a pure square-wave mode.",
  "网页工作台编辑 DECAY、BRIGHT、TUNE、RELEASE。DECAY 是自然衰减，RELEASE 是松键衰减；按住键仍会自然衰减。亮度在下一次拨弦生效。": "Edited in the workbench: DECAY, BRIGHT, TUNE and RELEASE. DECAY is the natural decay; RELEASE is decay after key release. A held note still decays naturally. Brightness changes apply to the next pluck.",
  "包络与 LFO": "Envelopes & LFO",
  "机身的 ENV 与 LFO 页已随音色编辑移至网页工作台；各引擎的包络（FM 的 ADSR、303 的 EnvMod／Decay／AccDec、PSG 与 Pluck 的 Release 等）和非 FM 引擎的轨道 LFO（速度、深度、音量起伏／声像、波形）在网页里编辑，随项目与轨道音色保存。LFO 作用于整个轨道，也影响轨道效果发送。效果使用 FX。": "The device's ENV and LFO pages moved to the workbench with voice editing. Each engine's envelope (FM ADSR, 303 EnvMod / Decay / AccDec, PSG and Pluck Release and so on) and the track LFO of the non-FM engines (rate, depth, tremolo / pan, waveform) are edited in the browser and saved with the project and the track sound. The LFO acts on the whole track, including its effect sends. Effects use FX.",
  "DX7 音色名": "DX7 patch names",
  "机身的 DX7 PATCH NAME 页已移除；音色名随网页工作台导入的 .syx 音色一起写入，并随项目保存。切换 DX7 内置音色会替换当前编辑。": "The device's DX7 PATCH NAME page is gone. Patch names come with the .syx voices imported in the workbench and are saved with the project. Switching a built-in DX7 voice replaces the current edit.",
  "按 FX，SELECT 选轨；K1 混响发送、K2 延迟发送，0 即关闭该轨发送，五种音源均可用。K3 轨道音量、K4 共用效果返回量。转 PRESETS 到第二页细调：K1 混响时间、K2 延迟时间、K3 反馈、K4 返回量，由所有轨道共用。轨道发送量随项目和轨道音色保存；共用效果参数仅随项目保存。静音停止新发送，已有尾音自然衰减。": "Press FX and select a track with SELECT. K1 sets reverb send, K2 delay send; 0 disables that track send. All five engines are supported. K3 is track volume and K4 is the shared effects return. Turn PRESETS to the second page for shared reverb time, delay time, feedback and return. Track sends are saved with projects and sounds. Shared effect settings are saved only with the project. Muting stops new sends while existing tails decay.",
  "PROJECT 轨的音色修改随项目保存；LIVE 轨的音色修改请导出轨道音色。项目备份不包含歌曲；歌曲用“导出 .tabby”逐首备份。": "PROJECT timbre edits are saved with projects. For LIVE timbre edits, export a track sound file. Project backups do not include songs; back up each song with Export .tabby.",
  "总览按 HOME 打开用户项目列表（16 个用户槽）。PRESETS／SELECT 直接载入对应编号，PLAY 载入并播放，SAVE 打开项目保存；打击垫 1–16 直接选编号并沿用之前的播放状态。空 USER 槽会提示，不替换当前项目。": "Press HOME on the overview to open the user project list (16 user slots). PRESETS / SELECT loads the selected number immediately. PLAY loads and plays; SAVE opens project saving. Pads 1–16 select directly and preserve playback state. An empty USER slot displays a message and keeps the current project.",
  "项目保存各轨 ARP 开关与参数。": "Projects save each track’s ARP settings.",
  "完整八轨项目：音源、参数、轨道音量、循环长度、步进等；不含歌曲。": "A complete eight-track project: engines, parameters, track levels, loop lengths, steps and more. Does not include songs.",
  "一首歌曲：歌曲记录与全部块，可带该歌曲自己的设备配置副本。见第 11 章。": "One song: the song record and all of its blocks, with the song's own rig copy when it has one. See chapter 11.",
  "下载与机身型号对应的 Pro 工作台。连接 USB，先导出项目与歌曲备份（.tabby），再在“设备更新”中连接、勾选备份确认并更新。首次从同型号原厂固件迁移时，使用“启用强制烧录并重新连接”。完成后网页会核对型号与版本哈希。Pro 与 Elite 固件不可混刷。": "Download the Pro workbench for your device. Connect USB, export project and song (.tabby) backups, then connect in Device update, confirm your backup and update. For the first migration from the same model’s factory firmware, choose Enable force flash and reconnect. The page verifies the model and the build hash afterward. Pro and Elite firmware are not interchangeable.",
  "在“项目与音色”备份当前项目，其他需要保留的项目槽也逐一载入并备份；歌曲用“导出 .tabby”逐首备份。LIVE 轨的音色修改另行导出轨道音色。": "In Projects & sounds, back up the current project, then load and back up any other project slots you need; back up each song with Export .tabby. Export LIVE timbre edits separately as track sounds.",
  "等待重启及版本核对。首次从 V01 迁移时，机身会提示旧的采样／DX7 数据仍在闪存，见第 02 章。": "Wait for restart and version verification. On the first migration from V01 the device reports old sample / DX7 data still in flash; see chapter 02.",
  "正常完成的同布局更新会保留有效项目槽和歌曲存储；刷写前仍请分别备份工程、音色和歌曲。设备重启后，未保存的内存编辑不会自动恢复。固件更新也不会自动把网页仿真中的项目传到设备。": "A successfully completed update using the same storage layout preserves valid project slots and the song storage. Still back up projects, voices and songs separately before flashing. Unsaved memory edits are not restored after restart. Updating firmware does not transfer the browser project to the device automatically.",
  "拔插 USB 后重新点击连接即可；页面会清除旧设备信息。烧录与项目库切换时按提示重新连接。": "After reconnecting USB, click Connect again; old device information is cleared. Reconnect when switching between firmware update and the project library.",
  "工作区编辑需要保存到 USER 槽。网页面板 SAVE 只保存浏览器本地内容；顶部“保存到设备”完成后，设备槽位才有该项目。": "Save workspace edits to a USER slot. Browser panel SAVE stores only a browser copy. The device receives the project after “Save to device” completes.",
  "如：LAUNCH、录音、MASTER": "e.g. LAUNCH, recording, MASTER"
};
  // Only complete UI messages are matched. Captured project, preset and port
  // names are kept verbatim; no blanket replacement of user data is performed.
  const patterns=[
    [/^已保存到仿真独立音色库的音色 (\d+)。$/,m=>`Saved to simulator voice library position ${m[1]}.`],
    [/^已载入 (.+)。$/,m=>`Loaded ${m[1]}.`],
    [/^当前槽最多可放 ([\d.]+) 秒；写入会自动导入当前选段。$/,m=>`This slot can hold up to ${m[1]} seconds. Writing automatically imports the current selection.`],
    [/^已替换网页采样库中的槽 (\d+)。尚未写入设备。$/,m=>`Browser sample slot ${m[1]} replaced. The device has not changed.`],
    [/^设备固件不同；如需迁移，请开启强制烧录并确认风险：(.+)$/,m=>`Different firmware detected. Enable Force flash and confirm the risks to migrate: ${m[1]}`],
    [/^找到 (\d+) \/ (\d+) 章$/,m=>`${m[1]} / ${m[2]} chapters found`],
    [/^共 (\d+) 章$/,m=>`${m[1]} chapters`],
    [/^已保存到设备槽 (\d+)，读回校验通过。$/,m=>`Saved to device slot ${m[1]}; read-back verification passed.`],
    [/^保存未确认完成：([\s\S]+)$/, (m,tr)=>`Save could not be confirmed: ${tr(m[1])}`],
    [/^轨道 (\d+)$/,m=>`Track ${m[1]}`],
    [/^轨道 (\d+) · (DX7|303|808|PSG|拨弦|采样器|未知)$/, (m,tr)=>`Track ${m[1]} · ${tr(m[2])}`],
    [/^替换轨道 (\d+) 的音源和音色？鼓与旋律互换会清空此轨步进。$/,m=>`Replace track ${m[1]} engine and sound? Switching between drums and melody clears this track’s steps.`],
    [/^替换轨道 (\d+) 的音色？该轨道的音符会停止。$/,m=>`Replace track ${m[1]} sound? Notes on this track will stop.`],
    [/^已校验 (\d+) 个音色，请选择音色与目标 DX7 轨道。$/,m=>`Verified ${m[1]} patches. Choose a patch and target DX7 track.`],
    [/^面板 PRESETS 旋钮：(.+)。$/, (m,tr)=>`Panel PRESETS knob: ${tr(m[1])}.`],
    [/^轨道 (\d+) · (\d+) 步(?: · 下轮 (\d+) 步)?( · 静音)?( · 独奏)?$/,m=>`Track ${m[1]} · ${m[2]} steps${m[3]?` · next loop: ${m[3]} steps`:''}${m[4]?' · muted':''}${m[5]?' · solo':''}`],
    [/^(.+)：拖动、滚轮或点击调节$/,m=>`${m[1]}: drag, scroll or click to adjust`],
    [/^(.+) 减少$/,m=>`${m[1]} decrease`],
    [/^(.+) 增加$/,m=>`${m[1]} increase`],
    [/^(.+)（Shift 点击或右击可锁定按住）$/,m=>`${m[1]} (Shift-click or right-click to hold)`],
    [/^音符／步 (\d+)$/,m=>`Note / Step ${m[1]}`],
    [/^已打开(.+)；用面板旋钮调整，HOME 返回。$/, (m,tr)=>`Opened ${tr(m[1])}; adjust with the panel knobs. HOME returns.`],
    [/^已载入 (.+)。播放状态保留；EDIT 调当前轨音色，保存项目保留修改。$/,m=>`Loaded ${m[1]}. Playback state preserved. EDIT changes the track sound; save the project to keep edits.`],
    [/^将替换仿真工作区(当前 DX7 音色|当前轨道音色|项目)，继续吗？$/, (m,tr)=>`Replace the browser workspace ${tr(m[1])} and continue?`],
    [/^采样槽 (\d+) 无效$/,m=>`Sample slot ${m[1]} is invalid`],
    [/^(\d+) · (.+) · ([\d.]+) 秒$/,m=>`${m[1]} · ${m[2]==='空槽'?'Empty slot':m[2]} · ${m[3]} s`],
    [/^已用 ([\d.]+) \/ ([\d.]+) KiB；余 ([\d.]+) 秒（按 SEA5 估算）。$/,m=>`Used ${m[1]} / ${m[2]} KiB; ${m[3]} seconds remaining (SEA5 estimate).`],
    [/^音频 ([\d.]+) 秒，已重采样到 32 kHz。调整起止时间，试听后替换选中槽位。$/,m=>`Audio: ${m[1]} seconds, resampled to 32 kHz. Adjust start / end, audition, then replace the selected slot.`],
    [/^已替换网页采样库中的槽 (\d+)。可送入仿真试听，或写入设备。$/,m=>`Replaced browser sample slot ${m[1]}. Send it to the simulator or write it to the device.`],
    [/^清空网页采样库槽 (\d+)？写入设备前仍不会修改实机。$/,m=>`Clear browser sample slot ${m[1]}? The device will not change until you write the bank.`],
    [/^固件内容校验失败：(.+)$/,m=>`Firmware content verification failed: ${m[1]}`],
    [/^设备不属于此固件包：(.+)$/,m=>`This firmware package does not match the device: ${m[1]}`],
    [/^DX7 参数越界：(\d+)$/,m=>`DX7 parameter out of range: ${m[1]}`],
    [/^设备操作失败：(\d+)$/,m=>`Device operation failed: ${m[1]}`]
  ];
  let language='en';
  function t(value,locale=language,depth=0){
    const source=String(value??'');
    if(locale==='zh-CN')return source;
    if(Object.hasOwn(messages,source))return messages[source];
    if(depth<3)for(const [pattern,format]of patterns){
      const match=source.match(pattern);if(match)return format(match,s=>t(s,locale,depth+1));
    }
    return source;
  }
  const bindings=new Map();
  const scanned=new WeakSet();
  let updates=0;
  function bind(node,property,source){
    // Drop detached options/status text from previous renders periodically.
    // Rendering may bind a whole control before appending it. Wait until that
    // synchronous render finishes before dropping detached bindings.
    if(++updates%128===0)queueMicrotask(()=>{for(const n of bindings.keys())if(!n.isConnected)bindings.delete(n);});
    let fields=bindings.get(node);if(!fields)bindings.set(node,fields=new Map());
    fields.set(property,String(source??''));render(node,property,String(source??''));
  }
  function render(node,property,source){
    if(property==='data'){
      const middle=source.trim(),offset=source.indexOf(middle);
      node.data=source.slice(0,offset)+t(middle)+source.slice(offset+middle.length);
    }else if(property==='textContent')node.textContent=t(source);
    else node.setAttribute(property,t(source));
  }
  function text(node,source){bind(node,'textContent',source);}
  function attr(node,name,source){bind(node,name,source);}
  function scan(root){
    const document=root.ownerDocument||root;
    const walker=document.createTreeWalker(root,4);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(scanned.has(node)||!node.parentElement||node.parentElement.closest('script,style,pre,noscript,.language-picker'))continue;
      scanned.add(node);
      if(/[\u3400-\u9fff]/.test(node.data))bind(node,'data',node.data);
    }
    for(const node of [root,...root.querySelectorAll('*')]){
      if(!node.getAttribute||node.closest('.language-picker'))continue;
      for(const name of ['aria-label','title','placeholder']){
        if(bindings.get(node)?.has(name))continue;
        const source=node.getAttribute(name);
        if(source&&/[\u3400-\u9fff]/.test(source))attr(node,name,source);
      }
    }
  }
  function sourceText(node){
    if(bindings.get(node)?.has('textContent'))return bindings.get(node).get('textContent');
    if(node.nodeType===3)return bindings.get(node)?.get('data')??node.data;
    return [...node.childNodes].map(sourceText).join('');
  }
  function setLanguage(next){
    language=next==='zh-CN'?'zh-CN':'en';
    if(typeof document==='undefined')return;
    document.documentElement.lang=language;
    for(const [node,fields]of bindings){
      if(!node.isConnected){bindings.delete(node);continue;}
      for(const [property,source]of fields)render(node,property,source);
    }
    const select=document.getElementById('language');if(select)select.value=language;
    try{localStorage.setItem('fm1-language',language);}catch(_){}
    document.dispatchEvent(new Event('fm1-language-change'));
  }
  globalThis.FM1I18n={t,text,attr,scan,sourceText,setLanguage,get language(){return language;},messages:Object.freeze(messages)};
  if(typeof document!=='undefined'){
    // English is the first-visit default. An explicit query or saved choice wins.
    let saved;try{saved=localStorage.getItem('fm1-language');}catch(_){}
    const requested=new URLSearchParams(location.search).get('lang');
    language=(requested||saved)==='zh-CN'?'zh-CN':'en';
    scan(document);setLanguage(language);
    // Dynamic LCD targets and device lists replace nodes during normal use.
    // Release detached translation bindings without waiting for a language switch.
    new MutationObserver(records=>{
      if(records.some(record=>record.removedNodes.length))
        for(const node of bindings.keys())if(!node.isConnected)bindings.delete(node);
    }).observe(document,{subtree:true,childList:true});
    document.getElementById('language')?.addEventListener('change',event=>setLanguage(event.target.value));
  }
})();

const FM1_PACKAGE = {"schema":1,"product":"SMK-37 Pro_8000001","profile":"pro","family":8,"release_version":"V01","display_version":"tabby-v03.1","build_id":"e8d7b7ac4f80c45fb393447f3a260b6288ef854afa23fe507e6a520a558e8f07","sha256":"94987db8846ffa30de8db704396f4fa9042aec6f451005af6b40b0be8373b0b2","bytes":492084,"loader_sha256":"ef1f2db89b011fa53e71df363f0122de0ea896618c53fb53e8da676322004541","hardware_validated":false,"model":"pro","stock":{"schema":1,"kind":"stock","product":"SMK-37 Pro_016","model":"pro","profile":"SMK37 Pro Original V16","family":8,"release_version":"V16","build_id":"2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0","sha256":"2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0","bytes":705252,"loader_sha256":"ef1f2db89b011fa53e71df363f0122de0ea896618c53fb53e8da676322004541","url":"./assets/smk37/2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0.bin"},"url":"./assets/smk37/94987db8846ffa30de8db704396f4fa9042aec6f451005af6b40b0be8373b0b2.bin"};
/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/* SMK37 OPEN browser updater.
 * Fixed device protocol: 00 59, 7-bit SysEx packing, USB MIDI only.
 * The bundled vendor loader controls the Flash layout. A successful transfer
 * does not guarantee data preservation or recovery from interrupted power. */
(() => {
  'use strict';
  const fail = text => { throw new Error(text); };
  const check = (ok, text) => { if (!ok) fail(text); };
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function abortable(operation,signal) {
    if(!signal)return operation;
    let cancel;
    try {
      return await Promise.race([operation,new Promise((_,reject)=>{
        cancel=()=>reject(signal.reason);signal.addEventListener('abort',cancel,{once:true});
        if(signal.aborted)cancel();
      })]);
    } finally {signal.removeEventListener('abort',cancel);}
  }
  const openingPorts=new WeakMap();
  async function portOperation(port,method,signal) {
    signal?.throwIfAborted();
    let timer,expired=false;
    const attempt={};if(method==='open')openingPorts.set(port,attempt);
    const operation=Promise.resolve().then(()=>port[method]());
    // A delayed open must not leave a MIDI handle behind after a timeout.
    operation.then(()=>{if(expired&&method==='open'&&openingPorts.get(port)===attempt)Promise.resolve().then(()=>port.close()).catch(()=>{});},()=>{});
    try {
      return await abortable(Promise.race([operation,new Promise((_,reject)=>{
        timer=setTimeout(()=>{expired=true;reject(Object.assign(new Error(method==='open'?
          '打开 MIDI 端口超时；请关闭其他 MIDI 软件或网页后重试。':
          '关闭 MIDI 端口超时；请重新插拔 USB 后连接。'),{code:'PORT_TIMEOUT'}));},method==='open'?5000:3000);
      })]),signal);
    } catch(error){expired=true;throw error;}
    finally {clearTimeout(timer);}
  }
  async function closePorts(input,output) {
    const results=await Promise.allSettled([portOperation(input,'close'),portOperation(output,'close')]);
    // Re-enumeration deliberately removes the old port during an update.
    const failure=results.find((result,index)=>result.status==='rejected'&&[input,output][index].state!=='disconnected');
    if(failure)throw failure.reason;
  }
  const hex = bytes => Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('');
  const le = (p, at, n) => { let v=0; for(let i=0;i<n;i++) v += p[at+i] * 2**(i*8); return v; };
  const crc16Table=new Uint16Array([0,0x1021,0x2042,0x3063,0x4084,0x50a5,0x60c6,0x70e7,
    0x8108,0x9129,0xa14a,0xb16b,0xc18c,0xd1ad,0xe1ce,0xf1ef]);
  const crc16 = bytes => {
    let c=0;
    for(let i=0;i<bytes.length;i++){c^=bytes[i]<<8;c=((c<<4)^crc16Table[c>>>12])&65535;c=((c<<4)^crc16Table[c>>>12])&65535;}
    return c;
  };
  const decodeHeader = (bytes, key=65535) => {
    const p=Uint8Array.from(bytes); let k=key;
    for(let i=0;i<p.length;i++) { p[i]^=k&255; k=((k<<1)^(k&0x8000?0x1021:0))&65535; } return p;
  };
  const ascii = p => String.fromCharCode(...p).replace(/\0.*$/s, '');
  // Use the original model prefix and the same Open version range as FM1.
  // Earlier SMK37 development builds remain valid migration sources.
  const openIdentity = value => /^(SMK-37 (Pro|Elite)_8\d{6}|SMK37[PE]_OPEN_\d{3})$/.test(value);
  const identityModel = value => /^(SMK-37 Pro_\d+|SMK37P_OPEN_\d{3})$/.test(value)?'pro':
    /^(SMK-37 Elite_\d+|SMK37E_OPEN_\d{3})$/.test(value)?'elite':undefined;
  const taggedLoader = pkg => 'ota-SMK37'+pkg.build_id.slice(0,16);
  const modelLoader = (identity,model) => identity.startsWith('ota-') && identityModel(identity.slice(4))===model;
  async function sha256(bytes) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))); }
  // Official M-VAVE V016 downloads (2026-08-12), preserved byte-for-byte.
  const stockHashes={pro:'2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0',
    elite:'b2ee38abfef3ae922e4eecdb8a551e14345300ae6f270265feacd33b6ef99cb6'};
  async function factoryCheck(data) {
    check(data instanceof Uint8Array&&data.length===37382&&await sha256(data)===
      'a5de2548c68a5bb4b7bc17fc0f13d76e9a00b399181cc683715f9e7e162cf44b','原厂资源校验失败');
  }
  function inspectPackage(bytes,markers=20,stock=false) {
    check(bytes instanceof Uint8Array && bytes.length>=1024 && bytes.length<=2097152, '固件包长度无效');
    // Production Pro V16 uses 36 identity slots; Elite and Open use 20.
    // The pinned package selects the format, never an untrusted header hint.
    const image=new Uint8Array(bytes.length-markers); let product='', ended=false;
    for(let i=0;i<markers;i++) {
      image.set(bytes.subarray(i*48,i*48+47),i*47);
      const marker=bytes[i*48+47];
      if(marker===125) ended=true;
      else { const c=(marker-i-1)&255; check(!ended && c>=32 && c<=126,'固件身份无效'); product+=String.fromCharCode(c); }
    }
    image.set(bytes.subarray(markers*48),markers*47);
    const head=decodeHeader(image.subarray(0,64)), count=le(head,8,2);
    check(le(head,0,2)===crc16(head.subarray(2)) && le(head,4,4)===image.length,'固件包头校验失败');
    check(ascii(head.subarray(16,32))==='AC791N' && count>0 && count<=12,'芯片型号或包目录无效');
    const table=image.subarray(64,64+count*80);
    check(crc16(table)===le(head,2,2),'固件目录校验失败');
    const entries=[];
    for(let i=0;i<count;i++) {
      const e=decodeHeader(table.subarray(i*80,i*80+80));
      const type=le(e,0,2), offset=le(e,8,4), size=le(e,12,4), name=ascii(e.subarray(64));
      const stored=le(e,16,4), encrypted=le(e,24,4);
      check(offset>=64+count*80 && offset<=image.length && size<=image.length-offset,'固件条目越界');
      check(stored>=size && stored<=image.length-offset && (!encrypted || encrypted===stored),'固件存储长度无效');
      check(!entries.some(p => stored && p.stored && offset<p.offset+p.stored && p.offset<offset+stored),'固件条目重叠');
      const data=image.subarray(offset,offset+size);
      // Vendor auxiliary metadata has a plaintext CRC but encrypted storage.
      // The outer SHA-256 covers it byte-for-byte; flash/loader must be plain.
      check(encrypted || crc16(data)===le(e,4,2),'固件内容校验失败：'+name);
      check(!encrypted || (type!==0 && type!==100),'固件主镜像或升级程序格式不兼容');
      entries.push({type,offset,size,stored,encrypted,crc:le(e,4,2),name,data});
    }
    const flash=entries.filter(e=>e.type===0), loader=entries.filter(e=>e.type===100);
    check(flash.length===1 && flash[0].size>=16384 && flash[0].size<=1044480 && flash[0].size%4096===0,'Flash 镜像无效');
    check(loader.length===1 && loader[0].size>0 && loader[0].size<32768,'升级程序缺失或无效');
    let factory;
    if(stock) {
      const resources=entries.filter(e=>e.type===50&&e.name==='USR');
      check(resources.length===1&&resources[0].size===37382&&resources[0].encrypted===37408,'原厂资源校验失败');
      const entry=resources[0],decoded=new Uint8Array(entry.stored);
      for(let i=0;i<decoded.length;i+=32)
        decoded.set(decodeHeader(image.subarray(entry.offset+i,entry.offset+i+32),0x980f^((entry.offset+i)>>>2)),i);
      factory=decoded.slice(0,entry.size);
      check(crc16(factory)===entry.crc,'原厂资源校验失败');
    }
    return {product,image,loader:loader[0].data,...(factory?{factory}:{})};
  }

  const assets=new WeakMap();
  async function assetBytes(meta,limit,message) {
    check(meta&&/^[0-9a-f]{64}$/.test(meta.sha256),message);
    let task=assets.get(meta);
    if(!task){
      task=(async()=>{
        let bytes;
        if(typeof meta.data==='string'){
          check(meta.data.length<=Math.ceil(limit/3)*4,message);
          const text=atob(meta.data);bytes=new Uint8Array(text.length);
          for(let i=0;i<text.length;i++)bytes[i]=text.charCodeAt(i);
        }else{
          check(typeof meta.url==='string'&&meta.url.length>0,message);
          const url=new URL(meta.url,location.href);
          check(url.origin===location.origin&&['https:','http:'].includes(url.protocol),message);
          const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
          try{
            const response=await fetch(url,{signal:controller.signal,credentials:'omit',cache:'force-cache'});
            check(response.ok&&Number(response.headers.get('Content-Length')||0)<=limit,message);
            const reader=response.body.getReader(),chunks=[];let size=0;
            try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;check(size<=limit,message);chunks.push(value);}}
            finally{await reader.cancel().catch(()=>{});}
            bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}
          }finally{clearTimeout(timer);}
        }
        check(bytes.length<=limit&&(!meta.bytes||bytes.length===meta.bytes)&&await sha256(bytes)===meta.sha256,message);
        return bytes;
      })();
      assets.set(meta,task);task.catch(()=>{if(assets.get(meta)===task)assets.delete(meta);});
    }
    const bytes=await task;check(bytes.length<=limit,message);return bytes.slice();
  }
  async function prepare(meta) {
    const stock=meta.kind==='stock';
    check(meta.schema===1 && (stock?/^SMK-37 (Pro|Elite)_016$/.test(meta.product):openIdentity(meta.product)) && /^[0-9a-f]{64}$/.test(meta.build_id),'Invalid SMK37 firmware metadata');
    const model=identityModel(meta.product);
    check(meta.model===model && meta.family===(model==='pro'?8:9) && meta.bytes>=1024 && meta.bytes<=2097152,'Firmware model mismatch');
    if(stock)check(meta.sha256===stockHashes[model]&&meta.build_id===meta.sha256,'原厂固件校验失败');
    const bytes=await assetBytes(meta,2097152,'Firmware SHA-256 mismatch');
    const pkg=inspectPackage(bytes,stock&&model==='pro'?36:20,stock);
    check(pkg.product===meta.product && await sha256(pkg.loader)===meta.loader_sha256,'Firmware loader mismatch');
    if(stock)await factoryCheck(pkg.factory);
    // This exact shared vendor loader is also used by both production boards.
    const vendorLoader=meta.loader_sha256==='ef1f2db89b011fa53e71df363f0122de0ea896618c53fb53e8da676322004541';
    return {...meta,...pkg,loaderIdentity:vendorLoader?'ota-FM-1_015':'ota-SMK37'+meta.build_id.slice(0,16)};
  }
  function pack7(bytes) {
    const out=[]; let bits=0, value=0;
    for(const byte of bytes) { value|=byte<<bits; bits+=8; while(bits>=7) {out.push(value&127); value>>>=7; bits-=7;} }
    if(bits) out.push(value&127); return out;
  }
  function frame(command,payload=[]) {
    check(payload.length<=520,'协议数据过长');
    let sum=0; for(const b of payload) sum=(sum+b)&255;
    return Uint8Array.from([240,...pack7([0,89,command,payload.length&255,payload.length>>8,0,...payload,(~sum)&255]),247]);
  }
  function parse(bytes) {
    if(!bytes || bytes.length<10 || bytes.length>608 || bytes[0]!==240 || bytes[bytes.length-1]!==247) return null;
    const raw=[]; let bits=0,value=0;
    for(let i=1;i<bytes.length-1;i++) {
      if(bytes[i]>127) return null;
      value|=bytes[i]<<bits; bits+=7;
      if(bits>=8) {raw.push(value&255); value>>>=8; bits-=8;}
    }
    if(bits>=7 || value!==0 || raw.length<7 || raw[0]!==0 || raw[1]!==89 || le(raw,3,3)!==raw.length-7) return null;
    let sum=0; for(let i=6;i<raw.length;i++) sum=(sum+raw[i])&255;
    return sum===255 ? {command:raw[2],data:Uint8Array.from(raw.slice(6,-1))} : null;
  }
  class Link {
    constructor(input,output,decoder=parse,signal) {
      this.signal=signal;
      this.input=input; this.output=output; this.queue=[]; this.waiter=null; this.closed=false; this.error=null;
      this.receive=ev=>{
        const p=decoder(ev.data); if(!p || this.closed) return;
        if(this.queue.length>=32) this.error=new Error('设备响应过多，已停止升级');
        else this.queue.push(p);
        if(this.waiter) this.waiter();
      };
      input.addEventListener('midimessage',this.receive);
    }
    get lost() { return this.closed || this.input.state==='disconnected' || this.output.state==='disconnected'; }
    send(bytes) { this.signal?.throwIfAborted();check(!this.lost,'USB 连接已断开'); this.output.send(bytes); }
    async read(ms) {
      this.signal?.throwIfAborted();
      if(this.error) throw this.error;
      if(!this.queue.length && !this.lost) await new Promise(resolve=>{
        const signal=this.signal;
        const finish=()=>{clearTimeout(timer);signal?.removeEventListener('abort',finish);this.waiter=null;resolve();};
        const timer=setTimeout(finish,ms); this.waiter=finish;
        signal?.addEventListener('abort',finish,{once:true});
      });
      this.signal?.throwIfAborted();
      if(this.error) throw this.error;
      return this.queue.shift()||null;
    }
    async close() {
      if(this.closed) return; this.closed=true; this.input.removeEventListener('midimessage',this.receive);
      if(this.waiter) this.waiter(); this.queue.length=0;
      await closePorts(this.input,this.output);
    }
    async query(command,payload=[],ms=1500) {
      this.queue.length=0; this.send(frame(command,payload));
      const until=Date.now()+ms;
      while(Date.now()<until) {
        const response=await this.read(Math.min(250,until-Date.now()));
        if(response && response.command===command) return response.data;
        check(!this.lost,'USB 连接已断开');
      }
      const error=new Error('设备未响应；当前固件可能尚未支持网页更新');error.code='TIMEOUT';throw error;
    }
  }
  function capability(data) {
    check(data.length===47 && ascii(data.subarray(0,4))==='FMC1' && data[4]===1 && (data[5]===8||data[5]===9) && le(data,8,2)===512 && le(data,10,4)===1048576,'设备升级协议不匹配');
    check(data[7]===1,'设备使用未知的升级程序');
    return {family:data[5],state:data[6],build:hex(data.subarray(14,46)),error:data[46]};
  }
  function pairs(access,loader=false,force=false) {
    // Windows can retain SINCO-MIDI after the updater re-enumerates. Names
    // only nominate candidates; identity/capability or project replies must
    // still match before a connection can be used.
    const name=loader ? /smk.?37|felucca|sloop|clipper|ota|sinco|usb.?midi|composite/i
                      : /smk.?37|^(?:usb|sinco).?midi(?:\s+\d+)?$/i;
    const connectedInputs=[...access.inputs.values()].filter(p=>p.state==='connected');
    const inputs=connectedInputs.filter(p=>force || name.test(p.name||''));
    const outputs=[...access.outputs.values()].filter(p=>p.state==='connected');
    return inputs.flatMap(input=>{
      const named=outputs.filter(output=>output.name===input.name);
      const exact=named.filter(output=>(output.manufacturer||'')===(input.manufacturer||''));
      const found=exact.length===1?exact:named.length===1?named:
        !named.length&&connectedInputs.length===1&&outputs.length===1?outputs:[];
      return found.length===1 ? [{input,output:found[0]}] : [];
    });
  }
  class Updater {
    constructor(access,pkg,status=()=>{},timing={}) {
      this.access=access; this.pkg=pkg; this.status=status; this.link=null; this.identity=null; this.busy=false;
      this.timing={idle:10000,writeIdle:180000,reconnect:40000,settle:600,pace:0,...timing};
    }
    async open(pair,signal) {
      try { await portOperation(pair.input,'open',signal); await portOperation(pair.output,'open',signal); }
      catch(e) { await closePorts(pair.input,pair.output).catch(()=>{}); throw e; }
      const link=new Link(pair.input,pair.output,parse,signal);
      try {
        let reply;
        for(let attempt=0;attempt<2;attempt++){
          try {reply=await link.query(17,[],750);break;}
          catch(error){if(error.code!=='TIMEOUT'||attempt||link.lost)throw error;}
        }
        check(reply.length===27 && /^[\x20-\x7e]{1,27}$/.test(ascii(reply)),'设备身份响应无效');
        return {link,identity:ascii(reply)};
      }
      catch(e) { await link.close(); throw e; }
    }
    async discover(force=false,signal) {
      signal?.throwIfAborted();
      const ports=pairs(this.access,true,force),found=[];let lastError;
      this.diagnostics={inputs:[...this.access.inputs.values()].filter(p=>p.state==='connected').map(p=>p.name||'?'),
        outputs:[...this.access.outputs.values()].filter(p=>p.state==='connected').map(p=>p.name||'?'),attempts:[]};
      if(ports.length>16)throw Object.assign(Error('MIDI 端口过多，请断开不相关设备后重试'),{code:'AMBIGUOUS'});
      for(const pair of ports){
        try {signal?.throwIfAborted();found.push(await this.open(pair,signal));}
        catch(error){
          if(signal?.aborted){await Promise.allSettled(found.map(device=>device.link.close()));throw signal.reason;}
          lastError=error;this.diagnostics.attempts.push({input:pair.input.name||'?',output:pair.output.name||'?',error:error.message});
        }
      }
      this.diagnostics.identities=found.map(device=>device.identity);
      if(found.length>1){await Promise.allSettled(found.map(device=>device.link.close()));throw Object.assign(Error('检测到多台可能的升级设备，无法确认目标'),{code:'AMBIGUOUS'});}
      if(found.length)return found[0];
      if(lastError&&lastError.code!=='TIMEOUT')throw lastError;
      return null;
    }
    async connect({force=false,signal}={}) {
      check(!this.busy,'正在更新'); await this.disconnect();
      this.force=force;this.mode=null;
      const device=await this.discover(force,signal);
      if(!device){
        const d=this.diagnostics;
        if(!d?.inputs.length||!d.outputs.length)fail('浏览器未发现完整的 MIDI 输入和输出。请连接开机的 SMK37 OPEN USB-MIDI 接口，再重新连接。');
        if(!d.attempts.length)fail('已发现 MIDI 端口，但无法匹配 SMK37 OPEN 输入和输出。请查看连接详情，只保留目标 SMK37 OPEN 后重试。');
        fail('已找到 MIDI 端口，但设备未回复型号。请关闭其他 MIDI 软件和更新网页，重新开机并插拔 USB 后重试；强制烧录也需要设备先响应。');
      }
      this.link=device.link; this.identity=device.identity;
      try {
        if(this.identity===this.pkg.loaderIdentity || this.identity===taggedLoader(this.pkg) ||
           modelLoader(this.identity,this.pkg.model)) {
          // Stock firmware passes ota- plus its current identity to the loader.
          // Resume still needs physical-model confirmation: the shared loader
          // may instead report its fixed name without a hardware model.
          this.mode='loader';return {resume:true,modelUnverified:true,identity:this.identity};
        }
        check(identityModel(this.identity)===this.pkg.model,'Connected hardware does not match this SMK37 model');
        if(!openIdentity(this.identity)) {
          // Production firmware uses the vendor update handshake, like FM1
          // stock V15. Do not wait for an Open-only capability it cannot expose.
          // The V016 name is shared by different builds; it is not proof that
          // the official image is installed. Recovery must write the full image.
          this.mode=force?'legacy':'migration';
          return {identity:this.identity,...(force?{legacy:true}:{migration:true})};
        }
        let cap;
        try {cap=capability(await this.link.query(49));}
        catch(error) {
          // Some third-party identities share Open's numeric prefix. A missing
          // capability reply requires explicit migration, never a silent flash.
          // Malformed replies and disconnected ports remain errors.
          if(error.code!=='TIMEOUT' || this.link.lost)throw error;
          if(!force){this.mode='migration';return {identity:this.identity,migration:true};}
          this.mode='legacy';return {resume:false,identity:this.identity,legacy:true};
        }
        check(cap.family===this.pkg.family,'Firmware family does not match this SMK37 model');
        check(cap.state===0,'设备正在处理另一次升级');
        this.mode='tagged';this.family=cap.family;
        return {resume:false,identity:this.identity,current:cap.build,same:cap.build===this.pkg.build_id};
      } catch(e) { await this.disconnect(); throw e; }
    }
    async disconnect() { if(this.link) await this.link.close(); this.link=null; this.identity=null; }
    async waitFor(identity,alternatives=[],loaderModel) {
      const end=Date.now()+this.timing.reconnect,expected=[...new Set([identity,...alternatives])],observed=new Set();
      while(Date.now()<end) {
        {
          let device;
          try {device=await this.discover(this.force);}
          catch(error){if(error.code==='AMBIGUOUS')throw error;}
          if(device)observed.add(device.identity);
          this.diagnostics={...this.diagnostics,expected,identities:[...observed]};
          if(device) {
            if(expected.includes(device.identity) || (loaderModel && modelLoader(device.identity,loaderModel))) {
              this.link=device.link; this.identity=device.identity; return;
            }
            await device.link.close();
          }
        }
        await sleep(this.timing.settle);
      }
      fail('等待设备重连超时；请保留这个更新网页，重新连接同一台设备后重试');
    }
    async serve(finish,idle,phase) {
      const image=this.pkg.image, covered=new Uint8Array(Math.ceil(image.length/8));
      const started=Date.now(); let last=started,total=0;
      for(;;) {
        check(Date.now()-started<Math.max(idle*3,120000),'升级超过最长等待时间，尚未完成');
        check(Date.now()-last<idle,'设备停止请求数据，升级未完成');
        const packet=await this.link.read(250);
        if(!packet) { check(!this.link.lost,'USB 意外断开；重新连接同一设备后用此网页重试'); check(Date.now()-last<idle,'设备停止请求数据，升级未完成'); continue; }
        if(packet.command!==48 || packet.data.length!==8) continue;
        const p=packet.data, address=le(p,1,4), bytes=le(p,5,3);
        check(bytes>0 && bytes<=512,'设备请求长度无效');
        if(address===0xe0000000 || address===0xf0000000) {
          check(address===finish && bytes===8,'设备的升级阶段不匹配');
          this.link.send(frame(48,[p[0],...p.subarray(1,8),115,117,99,99,101,115,115,0]));
          // Web MIDI send queues bytes; leave the port open for the completion
          // response and bounded duplicate finish requests before disconnecting.
          const end=Date.now()+this.timing.settle;
          while(Date.now()<end && !this.link.lost) {
            const again=await this.link.read(Math.min(100,end-Date.now()));
            if(again && again.command===48 && again.data.length===8 && le(again.data,1,4)===finish && le(again.data,5,3)===8)
              this.link.send(frame(48,[again.data[0],...again.data.subarray(1,8),115,117,99,99,101,115,115,0]));
          }
          return;
        }
        check(address<=image.length && bytes<=image.length-address,'设备读取超出固件包范围');
        // The loader requests the next block only when ready. No fixed delay
        // is needed in addition to that request/response flow control.
        last=Date.now(); if(this.timing.pace>0) await sleep(this.timing.pace);
        this.link.send(frame(48,[p[0],...p.subarray(1,8),...image.subarray(address,address+bytes)]));
        // Partial and overlapping reads count each byte once.
        for(let i=address;i<address+bytes;i++) {
          const index=i>>>3,bit=1<<(i&7);
          if(!(covered[index]&bit)){covered[index]|=bit;total++;}
        }
        this.status(phase,Math.min(99,Math.floor(total/image.length*100)));
      }
    }
    async restoreFactory() {
      check(this.pkg.kind==='stock'&&this.identity===this.pkg.product,'恢复资源需要对应型号的原厂 V16');
      await factoryCheck(this.pkg.factory);
      check(ascii(await this.link.query(17))===this.pkg.product,'恢复资源需要对应型号的原厂 V16');
      // V16 NOR_EXT is 0; its hash-pinned USR resource occupies 0xF4000..0xFDFFF.
      // Never touch calibration, user patterns, VM or Bluetooth addresses.
      const data=new Uint8Array(40960);data.fill(255);data.set(this.pkg.factory);
      const header=(offset,size=0)=>[0,offset&255,(offset>>>8)&255,offset>>>16,0,size&255,size>>>8,0];
      const acknowledge=async(command,payload)=>{
        this.link.queue.length=0;this.link.send(frame(command,payload));
        const end=Date.now()+this.timing.idle;
        while(Date.now()<end){
          const reply=await this.link.read(Math.min(250,end-Date.now()));
          check(!this.link.lost,'USB 连接已断开');
          if(reply?.command===0){check(reply.data.length===1&&reply.data[0]===0,'原厂资源写入失败');return;}
        }
        fail('原厂资源写入超时，请重新连接并重试');
      };
      this.status('正在恢复原厂资源',0);
      for(let offset=0;offset<data.length;offset+=512){
        const address=0xf4000+offset,h=header(address,512),block=data.subarray(offset,offset+512);
        if(!(offset%4096))await acknowledge(33,h.slice(0,5));
        await acknowledge(34,[...h,...block]);
        const read=await this.link.query(35,h);
        check(read.length===520&&h.every((b,i)=>read[i]===b)&&block.every((b,i)=>read[8+i]===b),'原厂资源读回校验失败');
        this.status('正在恢复原厂资源',Math.floor((offset+512)*99/data.length));
      }
      check(ascii(await this.link.query(17))===this.pkg.product,'恢复资源需要对应型号的原厂 V16');
    }
    async install({force=false,confirmedModel}={}) {
      check(this.link && !this.busy,'请先连接设备'); this.busy=true;
      let failure;
      try {
        check(!this.force || force,'强制烧录尚未确认');
        check(this.mode,'请重新连接设备');
        check(this.mode!=='migration','设备已识别；请开启强制烧录并重新连接');
        check(this.mode!=='loader' || confirmedModel===this.pkg.model,
          '升级模式无法自动识别机型，请先核对机身型号');
        const original=this.identity;
        const reply=await this.link.query(17);
        check(reply.length===27 && ascii(reply)===original,'设备身份已改变，请重新连接');
        if(this.pkg.kind==='stock')await factoryCheck(this.pkg.factory);
        if(this.mode!=='loader') {
          // Recheck immediately before arming; a stale Connect result is insufficient.
          if(this.mode==='tagged') {
          const cap=capability(await this.link.query(49));
          check(cap.family===this.family && cap.state===0,'设备状态已改变，请重新连接');
          check(cap.build!==this.pkg.build_id,'设备已经是这个版本');
          const n=this.pkg.image.length, tag=this.pkg.build_id.match(/../g).map(s=>parseInt(s,16));
          const ack=await this.link.query(50,[1,cap.family,n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255,...tag]);
          check(ack.length===1 && ack[0]===0,'设备拒绝此固件包');
          }
          this.status('准备升级程序',0); this.link.send([240,34,36,53,127,247]);
          await this.serve(0xe0000000,this.timing.idle,'准备升级程序');
          await this.disconnect(); this.status('等待升级设备重新连接',null);
          // A migrated board can retain its production loader identity even
          // after running Open. Accept that identity only for this model;
          // the final application still requires an exact identity/build match.
          await this.waitFor(this.pkg.loaderIdentity,['ota-'+original,taggedLoader(this.pkg)],this.pkg.model);
        }
        this.status('写入固件',0); this.link.send([240,34,36,53,127,247]);
        await this.serve(0xf0000000,this.timing.writeIdle,'写入固件');
        await this.disconnect(); this.status('重启并核对新版本',null);
        await this.waitFor(this.pkg.product);
        if(this.pkg.kind==='stock') {
          // V16 has no Open hash capability. Check its exact model/version,
          // then restore and read back the original resource partition.
          await this.restoreFactory();
        } else {
          const after=capability(await this.link.query(49));
          check(after.family===this.pkg.family && after.build===this.pkg.build_id && after.state===0,'Firmware verification failed after restart');
        }
        this.status('更新完成',100);
      } catch(error) {failure=error;throw error;}
      finally {
        this.busy=false;
        try {await this.disconnect();}
        catch(error) {if(!failure)throw error;}
      }
    }
  }
  const crc32Table=new Uint32Array([0,0x1db71064,0x3b6e20c8,0x26d930ac,0x76dc4190,0x6b6b51f4,0x4db26158,0x5005713c,
    0xedb88320,0xf00f9344,0xd6d6a3e8,0xcb61b38c,0x9b64c2b0,0x86d3d2d4,0xa00ae278,0xbdbdf21c]);
  function crc32(bytes,previous=0) {
    let crc=~previous;
    for(let i=0;i<bytes.length;i++){crc^=bytes[i];crc=(crc>>>4)^crc32Table[crc&15];crc=(crc>>>4)^crc32Table[crc&15];}
    return (~crc)>>>0;
  }
  function demoFrame(command,token,payload=[]) {
    check(Number.isInteger(command)&&command>=0&&command<128&&Number.isInteger(token)&&token>=0&&token<16384&&payload.length<=132,'文件协议参数无效');
    const data=[240,125,70,77,2,command,token&127,token>>7,...pack7(payload)];
    data.push((-data.slice(1).reduce((a,b)=>a+b,0))&127,247);
    return Uint8Array.from(data);
  }
  function demoParse(bytes) {
    if(!bytes||bytes.length<10||bytes.length>96||bytes[0]!==240||bytes.at(-1)!==247||bytes[1]!==125||bytes[2]!==70||bytes[3]!==77||bytes[4]!==2)return null;
    if(bytes.slice(1,-1).some(b=>b>127)||bytes.slice(1,-1).reduce((a,b)=>a+b,0)%128)return null;
    let value=0,bits=0;const out=[];
    for(const b of bytes.slice(8,-2)) { value|=b<<bits;bits+=7;if(bits>=8){out.push(value&255);value>>>=8;bits-=8;} }
    if(value||bits>=7)return null;
    return {command:bytes[5],token:bytes[6]|bytes[7]<<7,data:Uint8Array.from(out)};
  }
  function validateVoice(patch) {
    check(patch.length===156,'DX7 音色长度无效');
    const op=[99,99,99,99,99,99,99,99,99,99,99,3,3,7,3,7,99,1,31,99,14];
    const global=[99,99,99,99,99,99,99,99,31,7,1,99,99,99,99,1,5,7,48];
    for(let i=0;i<156;i++)check(patch[i]<=(i<126?op[i%21]:i<145?global[i-126]:i===155?63:127),'DX7 参数越界：'+i);
    return patch;
  }
  function readVoices(bytes) {
    check(bytes instanceof Uint8Array&&(bytes.length===163||bytes.length===4104),'请选择 DX7 单音色或 32 音色 .syx 文件');
    check(bytes[0]===240&&bytes[1]===67&&bytes[2]<16&&bytes.at(-1)===247&&!bytes.slice(1,-1).some(b=>b>127),'DX7 SysEx 消息无效');
    const bank=bytes.length===4104, size=bank?4096:155;
    check(bytes[3]===(bank?9:0)&&((bytes[4]<<7)|bytes[5])===size,'DX7 数据类型或长度不匹配');
    check(bytes.slice(6,-1).reduce((a,b)=>a+b,0)%128===0,'DX7 音色校验失败');
    const voices=[];
    for(let v=0;v<(bank?32:1);v++) {
      const p=new Uint8Array(156);p[155]=63;
      if(!bank)p.set(bytes.slice(6,161));
      else {
        // Yamaha VMEM-to-VCED field mapping.
        // Reference: github.com/asb2m10/dexed/blob/master/Source/PluginData.cpp
        const b=bytes.slice(6+v*128,6+(v+1)*128);
        for(let o=0;o<6;o++) {
          const i=o*17,j=o*21;
          p.set(b.slice(i,i+11),j);
          p[j+11]=b[i+11]&3;p[j+12]=(b[i+11]>>2)&3;
          p[j+13]=b[i+12]&7;p[j+20]=(b[i+12]>>3)&15;
          p[j+14]=b[i+13]&3;p[j+15]=(b[i+13]>>2)&7;
          p[j+16]=b[i+14];p[j+17]=b[i+15]&1;p[j+18]=(b[i+15]>>1)&31;p[j+19]=b[i+16];
        }
        p.set(b.slice(102,110),126);p[134]=b[110]&31;p[135]=b[111]&7;p[136]=(b[111]>>3)&1;
        p.set(b.slice(112,116),137);p[141]=b[116]&1;p[142]=(b[116]>>1)&7;p[143]=(b[116]>>4)&7;
        p.set(b.slice(117,128),144);
      }
      validateVoice(p);voices.push(p);
    }
    return voices;
  }
  function packVoice(patch) {
    validateVoice(patch);const b=new Uint8Array(128);
    for(let op=0;op<6;op++){
      const p=patch.subarray(op*21,op*21+21),i=op*17;
      b.set(p.subarray(0,11),i);b[i+11]=p[11]|p[12]<<2;b[i+12]=p[13]|p[20]<<3;
      b[i+13]=p[14]|p[15]<<2;b[i+14]=p[16];b[i+15]=p[17]|p[18]<<1;b[i+16]=p[19];
    }
    b.set(patch.subarray(126,134),102);b[110]=patch[134];b[111]=patch[135]|patch[136]<<3;
    b.set(patch.subarray(137,141),112);b[116]=patch[141]|patch[142]<<1|patch[143]<<4;
    b.set(patch.subarray(144,155),117);return b;
  }
  function bankFile(raw,channel=0){
    check(raw instanceof Uint8Array&&raw.length===4096&&Number.isInteger(channel)&&channel>=0&&channel<16,'DX7 音色库长度或通道无效');
    const file=Uint8Array.from([240,67,channel,9,32,0,...raw,(-raw.reduce((a,b)=>a+b,0))&127,247]);
    readVoices(file);return file;
  }
  function voiceBank(voices){
    check(voices.length===32,'请选择包含 32 个音色的 DX7 音色库');
    const raw=new Uint8Array(4096);voices.forEach((p,i)=>raw.set(packVoice(p),i*128));return raw;
  }
  function voiceFile(patch,channel=0) {
    validateVoice(patch);check(Number.isInteger(channel)&&channel>=0&&channel<16,'MIDI 通道无效');
    const voice=patch.slice(0,155),sum=voice.reduce((a,b)=>a+b,0);
    return Uint8Array.from([240,67,channel,0,1,27,...voice,(-sum)&127,247]);
  }
  function projectVersion(payload) {
    check(payload instanceof Uint8Array&&[4048,4064,4264].includes(payload.length),'项目长度无效');
    const version=payload.length===4048?3:4;
    if(payload.length===4264){
      const block=payload.subarray(4064),view=new DataView(block.buffer,block.byteOffset,block.byteLength);
      check(view.getUint32(0,true)===0x54314d46&&view.getUint32(196,true)===crc32(block.subarray(0,196))&&
        !block.subarray(4,196).includes(128),'项目调音数据无效');
    }
    check(payload[3852]===version,'项目备份格式无效');return version;
  }
  function upgradeProject(payload) {
    if(projectVersion(payload)===4)return payload;
    const result=new Uint8Array(4064);result.set(payload);result[3852]=4;
    for(let t=0;t<8;t++)result[4048+t*2]=66;
    return result;
  }
  function projectFile(payload) {
    const version=projectVersion(payload);
    const file=new Uint8Array(16+payload.length),view=new DataView(file.buffer);
    file.set([70,77,49,80,version,0,0,0]);
    view.setUint32(8,payload.length,true);view.setUint32(12,crc32(payload),true);file.set(payload,16);return file;
  }
  function tunedProject(payload) {
    payload=upgradeProject(payload);
    if(payload.length===4264)return payload;
    const data=new Uint8Array(4264),view=new DataView(data.buffer);data.set(payload);
    view.setUint32(4064,0x54314d46,true);view.setUint32(4260,crc32(data.subarray(4064,4260)),true);
    return data;
  }
  function readProjectFile(file) {
    check(file instanceof Uint8Array&&[4064,4080,4280].includes(file.length),'项目备份文件长度无效');
    check(ascii(file.slice(0,4))==='FM1P'&&[3,4].includes(file[4])&&file[5]===0&&file[6]===0&&file[7]===0,'项目备份格式无效');
    const payload=file.slice(16),view=new DataView(file.buffer,file.byteOffset,file.byteLength);
    check(file[4]===projectVersion(payload)&&view.getUint32(8,true)===payload.length&&view.getUint32(12,true)===crc32(payload),'项目备份校验失败');
    return payload;
  }
  function timbreFile(payload) {
    check(payload instanceof Uint8Array&&payload.length===223,'音色长度无效');
    const file=new Uint8Array(239),view=new DataView(file.buffer);file.set([70,77,49,84,1,0,0,0]);
    view.setUint32(8,payload.length,true);view.setUint32(12,crc32(payload),true);file.set(payload,16);return file;
  }
  function readTimbreFile(file) {
    check(file instanceof Uint8Array&&file.length===239,'音色文件长度无效');
    check(ascii(file.slice(0,4))==='FM1T'&&file[4]===1&&file[5]===0&&file[6]===0&&file[7]===0,'音色格式无效');
    const p=file.slice(16),v=new DataView(file.buffer,file.byteOffset,file.byteLength);
    check(v.getUint32(8,true)===223&&v.getUint32(12,true)===crc32(p),'音色校验失败');return p;
  }
  function voiceTimbre(timbre,patch,program) {
    check(timbre instanceof Uint8Array&&timbre.length===223&&timbre[0]===0,'请选择 DX7 轨道与音色');
    check(Number.isInteger(program)&&program>=0&&program<128,'音色编号无效');
    validateVoice(patch);
    // Match panel Program Change: reset FM controls, retain volume, sends
    // and loop length. A targeted timbre import also works with shared or
    // remapped MIDI input channels; it never selects another track.
    const next=timbre.slice();next[2]=program;next[3]=0;
    next.fill(0,4,11);next[6]=100;next.set(patch,11);next[166]=63;
    return next;
  }
  class Library {
    constructor(access) {this.access=access;this.link=null;this.token=crypto.getRandomValues(new Uint16Array(1))[0]&16383;this.pending=false;}
    async connect({signal}={}) {
      await this.disconnect();signal?.throwIfAborted();
      const ports=pairs(this.access),found=[];let lastError;
      check(ports.length,'未找到支持项目库的 SMK37 OPEN USB MIDI');
      check(ports.length<=16,'MIDI 端口过多，请断开不相关设备后重试');
      if(ports.length===1)return this.open(ports[0],signal);
      // A BLE or DAW port is only a candidate, not another project device.
      // Probe read-only capabilities before deciding whether the target is ambiguous.
      for(const pair of ports){
        try {await this.open(pair,signal,true);found.push(pair);}
        catch(error){signal?.throwIfAborted();lastError=error;}
        finally {await this.disconnect();}
      }
      signal?.throwIfAborted();
      check(found.length<=1,'检测到多台支持项目库的设备，请只连接一台 SMK37 OPEN');
      if(!found.length)throw lastError;
      return this.open(found[0],signal);
    }
    async open({input,output},signal,probe=false) {
      try {
        await portOperation(input,'open',signal);await portOperation(output,'open',signal);
        this.link=new Link(input,output,demoParse,signal);
        const info=await this.query(0,[],false,probe?{attempts:2,timeout:750}:undefined);
        check(info.length===14&&info[1]===16&&((info[0]===3&&le(info,3,2)===4048)||(info[0]===4&&le(info,3,2)===4064)),'当前固件未支持这个项目库');
        this.projectBytes=le(info,3,2);
        if(!probe)await this.extensions();
        return info;
      }
      catch(e){if(this.link)await this.disconnect().catch(()=>{});else await closePorts(input,output).catch(()=>{});throw e;}
    }
    async disconnect(){if(this.link)await this.link.close();this.link=null;this.projectBytes=0;this.tuningBytes=0;}
    async extensions(){
      this.tuningBytes=0;this.programs=16;this.sampleCapacity=462848;this.trackRoles=false;this.bankAvailable=false;this.extendedDelay=false;this.songStorage=false;this.songBatch=false;this.timedNotes=false;this.radioSettings=false;
      try {
        const info=await this.query(21);
        check(info.length===7&&(info[0]&~1)===0&&le(info,1,2)===4264&&le(info,3,4)===462848,'设备文件长度无效');
        if(info[0]&1)this.tuningBytes=4264;
      } catch(error){if(error.deviceCode!==71)throw error;}
      try {
        const info=await this.query(22);
        // Classic Tabby (Task 03 a): a device may report no DX7 library (0 banks) and no sample bank (limit 0).
        check(info.length===9&&info[0]===1&&info[1]===128&&(info[2]===4||info[2]===0)&&info[3]<=1&&(le(info,4,4)===446464||le(info,4,4)===0)&&(info[8]&~63)===0,'设备扩展能力回复无效');   // Task 06 (a): bit 5 = Bluetooth settings; the mask was ~15 and refused a Task 05 device (bit 4)
        this.programs=128;this.sampleCapacity=le(info,4,4);this.bankAvailable=!!info[3]&&info[2]===4;this.trackRoles=!!(info[8]&1);this.extendedDelay=!!(info[8]&2);this.songStorage=!!(info[8]&4);this.songBatch=!!(info[8]&8);this.timedNotes=!!(info[8]&16);this.radioSettings=!!(info[8]&32);   // Task 05: payload format 1 accepted; Task 06: command 24
      } catch(error){if(error.deviceCode!==71)throw error;}
    }
    projectPayload(bytes){
      projectVersion(bytes);
      if((this.programs||16)<128){
        let copied=false;
        for(let t=0;t<8;t++){const at=2048+t*223;if(bytes[at]===0&&bytes[at+2]>=16){if(!copied){bytes=bytes.slice();copied=true;}bytes[at+2]=0;bytes[at+3]=1;}}
        // The patch is embedded in the project; only its library label changes.
      }
      check(this.extendedDelay||bytes[3849]<=127,'请先将延迟切换为旧版支持的 FREE 时间（约 353 毫秒以内），再写入旧固件');
      if(this.tuningBytes)return tunedProject(bytes);
      if(bytes.length===4264){
        check(bytes.subarray(4068,4260).every(value=>value===0),'请先更新设备固件，再写入含调音设置的项目');
        bytes=bytes.slice(0,4064);
      }
      check(this.projectBytes!==4048||bytes.length===4048,'请先更新设备固件，再写入含 ARP 设置的项目');
      return this.projectBytes===4064?upgradeProject(bytes):bytes;
    }
    async query(command,payload=[],emptyOK=false,{attempts=3,timeout=1000}={}) {
      check(this.link&&!this.link.lost,'请先连接项目库');check(!this.pending,'文件传输正在进行');
      if([5,8,10].includes(command))this.onProjectChange?.();
      const link=this.link,token=this.token=(this.token+1)&16383,packet=demoFrame(command,token,payload);
      this.pending=true;
      try {
        link.queue.length=0;
        for(let attempt=0;attempt<attempts;attempt++) {
          link.send(packet);const until=Date.now()+timeout;
          while(Date.now()<until) {
            const r=await link.read(Math.min(200,until-Date.now()));check(!link.lost,'USB 已断开，当前操作未完成');
            if(!r||r.command!==(command|64)||r.token!==token)continue;
            check(r.data.length>0,'设备回复不完整');const code=r.data[0];
            if(code!==0&&!(emptyOK&&code===1))throw Object.assign(Error(code===1?'该项目槽为空':code===73?'旧采样库占用了扩展存储空间，请先备份并缩小采样库':code===72?'内存不足，当前项目保持不变':code===71?'文件或参数无效，当前项目保持不变':code===74?'歌曲存储已满，请在设备 ACTIONS 中压缩歌曲存储或删除歌曲':'设备操作失败：'+code),{deviceCode:code});
            return r.data.slice(1);
          }
        }
        fail('设备未响应；请检查 USB 或固件是否支持项目库');
      } finally {this.pending=false;}
    }
    async download(kind,target=0) {
      if(kind===0&&this.tuningBytes)kind=3;
      // The device may have begun even if every start ACK was lost.
      try {
        const head=await this.query(1,[kind,target]),size=le(head,0,2);check(head.length===2&&(kind?size===(kind===5?4096:kind===4?4096:kind===3?4264:kind===2?223:156):[4048,4064].includes(size)),'设备文件长度无效');
        const bytes=new Uint8Array(size);
        for(let at=0;at<size;at+=64){const n=Math.min(64,size-at),part=await this.query(2,[at&255,at>>8,n]);check(part.length===n,'文件片段不完整');bytes.set(part,at);}return bytes;
      }
      finally {if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
    }
    // Classic Tabby song mode (Task 03 d): kinds 5 (record) and 6 (block, 16-bit id).
    // Task 06 (a): Bluetooth settings through transfer command 24 (the device's BLE page is gone).
    async radioRead(){const r=await this.query(24);check(r.length===2,'蓝牙设置回复无效');return {on:!!(r[0]&1),audio:!!(r[0]&2),host:r[1]===1};}
    async radioWrite(s){await this.query(24,[(s.on?1:0)|(s.audio?2:0)|4,s.host?1:0]);}
    async radioForget(){await this.query(24,[0x7f]);}
    // Task 06 (9.13): a 31-byte reply adds, per track, the state byte (bits 0-1 follow / launched / stopped,
    // bits 2-3 the pending queue: none / launch / stop / back to song, bit 4 waiting) and the pattern row (255 = none).
    async songStatus(){const s=await this.query(23);check(s.length===13||s.length===15||s.length===31,'歌曲存储状态回复无效');
      const tracks=s.length>=31?Array.from({length:8},(_,t)=>({state:s[15+t]&3,queue:(s[15+t]>>2)&3,waiting:!!(s[15+t]&16),row:s[23+t]})):null;
      return {free:le(s,0,4),reclaimable:le(s,4,4),state:s[8],loaded:s[9],playing:s[10],row:s[11],error:s[12],late:s.length>13?s[13]:0,events:s.length>14?s[14]:0,tracks};}
    async downloadBlock(song,id){
      try {
        const head=await this.query(1,[6,song,id&255,id>>8]),size=le(head,0,2);check(head.length===2&&size>=64&&size<=1600,'块长度无效');   // Task 05: format-1 payloads up to 1600
        const bytes=new Uint8Array(size);
        for(let at=0;at<size;at+=64){const n=Math.min(64,size-at),part=await this.query(2,[at&255,at>>8,n]);check(part.length===n,'文件片段不完整');bytes.set(part,at);}return bytes;
      } finally {if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
    }
    async uploadBlock(song,id,bytes){
      songPayloadParse(bytes);
      try {
        await this.query(3,[6,song,id&255,id>>8,bytes.length&255,bytes.length>>8]);
        for(let at=0;at<bytes.length;at+=64)await this.query(4,[at&255,at>>8,...bytes.slice(at,at+64)]);
        const c=crc32(bytes);await this.query(5,[c&255,(c>>>8)&255,(c>>>16)&255,c>>>24]);
      } finally {if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
    }
    // Batched block upload (Task 03 e, transfer kind 7, 9.9 v0.5): one stream of block records
    // lands in whole block sectors under one journal commit, or not at all.
    async uploadBatch(song,stream){
      try {
        await this.query(3,[7,song,stream.length&255,stream.length>>8]);
        for(let at=0;at<stream.length;at+=64)await this.query(4,[at&255,at>>8,...stream.slice(at,at+64)]);
        const c=crc32(stream);await this.query(5,[c&255,(c>>>8)&255,(c>>>16)&255,c>>>24]);
      } finally {if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
    }
    async songRead(song,progress=()=>{}){
      check(this.songStorage,'请先更新固件以使用歌曲模式');
      let record;try{record=await this.download(5,song);}catch(error){if(error.deviceCode===1)return null;throw error;}
      const parsed=songRecordParse(record),ids=[...songBlockIds(parsed)],blocks=new Map();
      for(let i=0;i<ids.length;i++){blocks.set(ids[i],await this.downloadBlock(song,ids[i]));progress((i+1)/ids.length);}
      return {record,blocks};
    }
    async songWrite(song,record,blocks,progress=()=>{}){
      check(this.songStorage,'请先更新固件以使用歌曲模式');check(this.timedNotes,'设备固件不支持带时值的音符块，请先更新固件');songRecordParse(record);
      // Task 03 (f): an occupied slot is deleted first (the shared rule for the song editor and the
      // MIDI importer): the old song's blocks become garbage for the next compaction whatever ids
      // the new song uses. The check is a kind-5 download begin + cancel (two exchanges).
      let replaced=true;
      try{await this.query(1,[5,song]);}catch(error){if(error.deviceCode!==1)throw error;replaced=false;}
      finally{if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
      if(replaced)await this.songDelete(song);progress(0.03);
      // Section 9.6 v0.5: the record goes first so its blocks are live the moment they land,
      // then the blocks in kind-7 batches (firmware with checkpoint e) or one by one (kind 6).
      await this.upload(5,song,record);progress(0.05);
      if(this.songBatch){const batches=songBatches(blocks);for(let i=0;i<batches.length;i++){await this.uploadBatch(song,batches[i]);progress(0.05+0.9*(i+1)/batches.length);}}
      else {const list=[...blocks];for(let i=0;i<list.length;i++){await this.uploadBlock(song,list[i][0],list[i][1]);progress(0.05+0.9*(i+1)/list.length);}}
      const saved=await this.download(5,song);
      check(saved.subarray(20,SONG_BODY).every((v,i)=>v===record[20+i]),'歌曲读回校验不一致，请重试');
      progress(1);return {record:saved,replaced};
    }
    async songDelete(song){check(this.songStorage,'请先更新固件以使用歌曲模式');await this.upload(5,song,new Uint8Array(SONG_RECORD).fill(255));}
    async saveProject(slot,bytes) {
      check(Number.isInteger(slot)&&slot>=0&&slot<16,'请选择设备项目槽');
      if(bytes){bytes=this.projectPayload(bytes);await this.upload(0,0,bytes);}
      const expected=await this.download(0);
      check(!bytes||(bytes.length===expected.length&&bytes.every((value,i)=>value===expected[i])),
        '设备工作区与待保存项目不一致，尚未写入项目槽');
      await this.query(7,[slot]);
      // Reload from persistent storage before comparing; an upload echo only
      // proves the RAM workspace changed, not that the slot was written.
      await this.query(8,[slot]);
      const saved=await this.download(0);
      check(saved.length===expected.length&&saved.every((value,i)=>value===expected[i]),
        '保存后的读回校验不一致，请重新连接并检查设备项目槽');
      return saved;
    }
    async samplesRead(progress=()=>{},signal) {
      const active=()=>check(!signal?.aborted,'采样读取已取消');active();
      const info=await this.query(11);active();check(info.length===9&&info[0]===2,'设备采样库尚未就绪，可用内置库恢复');
      const size=le(info,1,4);check(size>=512&&size<=466944,'采样库长度无效');
      const data=new Uint8Array(size);
      for(let at=0;at<size;at+=64){
        active();const n=Math.min(64,size-at),p=await this.query(15,[at&255,(at>>>8)&255,(at>>>16)&255,at>>>24,n]);
        active();check(p.length===n,'采样片段不完整');data.set(p,at);progress((at+n)/size);
      }
      return data;
    }
    async samplesWrite(data,progress=()=>{},signal) {
      check(data instanceof Uint8Array&&data.length>=512&&data.length<=(this.sampleCapacity||462848),'采样库长度无效');
      // Validate before erasing the device; every caller uses the same bank format.
      globalThis.FM1Samples.read(data);
      const info=await this.query(11);globalThis.FM1Samples.status(info);
      check(info[0]!==1&&info[0]!==3,'设备采样库忙，请稍后重试');
      const n=data.length;check(!signal?.aborted,'已取消');
      try {
        await this.query(12,[n&255,(n>>>8)&255,(n>>>16)&255,n>>>24]);
        for(let at=0;at<n;at+=128){check(!signal?.aborted,'已取消；请重新写入完整采样库恢复');const part=data.slice(at,at+128);await this.query(13,[at&255,(at>>>8)&255,(at>>>16)&255,at>>>24,...part]);progress((at+part.length)/n*0.6);}
        await this.query(14);
      } finally {if(this.link&&!this.link.lost)await this.query(16).catch(()=>{});}
      let saved;
      try{saved=await this.samplesRead(value=>progress(0.6+value*0.39),signal);}
      catch(error){if(signal?.aborted)fail('采样读回已取消，尚未确认写入结果');throw error;}
      check(saved.length===n&&saved.every((value,i)=>value===data[i]),'设备采样读回不一致，写入未确认成功；请重试');
      progress(1);
    }
    async readBank(index){
      check(this.programs===128&&Number.isInteger(index)&&index>=0&&index<4,'请先更新固件以使用 128 音色库');
      const raw=await this.download(4,index);bankFile(raw);return raw;
    }
    async writeBank(index,raw){
      check(Number.isInteger(index)&&index>=0&&index<4,'音色库组号无效');bankFile(raw);
      await this.upload(4,index,raw);const saved=await this.readBank(index);
      check(saved.every((v,i)=>v===raw[i]),'音色库读回不一致，请重新读取检查');return saved;
    }
    async saveVoice(program,patch){
      check(Number.isInteger(program)&&program>=0&&program<128,'音色编号无效');
      const voice=packVoice(patch),index=program>>5,raw=await this.readBank(index);
      raw.set(voice,(program&31)*128);return this.writeBank(index,raw);
    }
    async loadVoice(track,program){
      check(Number.isInteger(track)&&track>=0&&track<8,'请选择 DX7 轨道与音色');
      check(Number.isInteger(program)&&program>=0&&program<128,'音色编号无效');
      const raw=await this.readBank(program>>5),patch=readVoices(bankFile(raw))[program&31];
      const next=voiceTimbre(await this.download(2,track),patch,program);
      await this.upload(2,track,next);
      const saved=await this.download(2,track);
      check(saved.length===next.length&&saved.every((v,i)=>v===next[i]),'音色载入后的读回校验不一致，请重新连接并检查');
      return saved;
    }
    async upload(kind,target,bytes) {
      if(kind===1)validateVoice(bytes);
      else if(kind===2){
        check(bytes.length===223,'文件长度无效');
        if((this.programs||16)<128&&bytes[0]===0&&bytes[2]>=16){bytes=bytes.slice();bytes[2]=0;bytes[3]=1;}
      }
      else if(kind===4){check(this.programs===128,'请先更新固件以使用 128 音色库');bankFile(bytes);}
      else if(kind===5){check(bytes.length===SONG_RECORD,'歌曲记录长度无效');}
      else {
        bytes=this.projectPayload(bytes);
        if(bytes.length===4264)kind=3;
      }
      try {
        await this.query(3,[kind,target,bytes.length&255,bytes.length>>8]);
        for(let at=0;at<bytes.length;at+=64)await this.query(4,[at&255,at>>8,...bytes.slice(at,at+64)]);
        const c=crc32(bytes);await this.query(5,[c&255,(c>>>8)&255,(c>>>16)&255,c>>>24]);
      } finally {if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
    }
  }

  // ---- Classic Tabby song mode (Task 03 d): docs/tasks/TASK-03-step1-assessment.md section 9 v0.4 ----
  const SONG_MAGIC=0x47314d46,SONG_RECORD=4096,SONG_BODY=2624,SONG_ROW0=64,SONG_ROW=20;
  // Task 04 (section 9.11 v0.6): version-2 records carry a row event table in the sector tail.
  const SONG_EVENTS=2624,SONG_EVENTS_START=2632,SONG_EVENT_BYTES=5,SONG_EVENTS_MAX=292,SONG_ROW_EVENTS_MAX=32,SONG_V2_END=4092;
  // Event model: {row 0..127, channel 0..15, type 0 PC | 1 bank+PC | 2 CC | 3 gap, d0, d1, d2}.
  function songEventsValidate(events,rows){
    check(Array.isArray(events)&&events.length<=SONG_EVENTS_MAX,'歌曲事件须不超过 292 个');
    let last=-1,inRow=0;
    events.forEach((e,i)=>{
      check(Number.isInteger(e.row)&&e.row>=0&&e.row<rows&&e.row>=last,'事件 '+(i+1)+' 的行无效或未按行排序');
      inRow=e.row===last?inRow+1:1;last=e.row;check(inRow<=SONG_ROW_EVENTS_MAX,'第 '+(e.row+1)+' 行事件超过 32 个');
      check(Number.isInteger(e.channel)&&e.channel>=0&&e.channel<=15,'事件 '+(i+1)+' 的通道无效');
      const b=v=>Number.isInteger(v)&&v>=0&&v<=127,bb=v=>b(v)||v===255;
      if(e.type===0)check(b(e.d0)&&!e.d1&&!e.d2,'事件 '+(i+1)+'：音色号须为 0–127');
      else if(e.type===1)check(bb(e.d0)&&bb(e.d1)&&b(e.d2),'事件 '+(i+1)+'：音色库/音色号无效');
      else if(e.type===2)check(b(e.d0)&&b(e.d1)&&!e.d2,'事件 '+(i+1)+'：控制器号与值须为 0–127');
      else if(e.type===3)check(Number.isInteger(e.d0)&&e.d0>=1&&e.d0<=255&&!e.d1&&!e.d2,'事件 '+(i+1)+'：间隔须为 1–255 ms');
      else check(false,'事件 '+(i+1)+' 的类型无效');});
  }
  function songEventsParse(bytes){
    const n=u16(bytes,SONG_EVENTS);check(n<=SONG_EVENTS_MAX&&bytes[SONG_EVENTS+2]===1&&bytes[SONG_EVENTS+3]===0&&u32(bytes,SONG_EVENTS+4)===0,'歌曲事件表无效');
    const events=[];for(let i=0;i<n;i++){const at=SONG_EVENTS_START+i*SONG_EVENT_BYTES;events.push({row:bytes[at],channel:bytes[at+1]&15,type:bytes[at+1]>>4,d0:bytes[at+2],d1:bytes[at+3],d2:bytes[at+4]});}
    for(let i=SONG_EVENTS_START+n*SONG_EVENT_BYTES;i<SONG_V2_END;i++)check(bytes[i]===255,'歌曲事件表之后须为 0xFF');
    return events;
  }
  function songEventsBuild(bytes,events){
    put16(bytes,SONG_EVENTS,events.length);bytes[SONG_EVENTS+2]=1;bytes[SONG_EVENTS+3]=0;put32(bytes,SONG_EVENTS+4,0);
    events.forEach((e,i)=>{const at=SONG_EVENTS_START+i*SONG_EVENT_BYTES;bytes[at]=e.row;bytes[at+1]=(e.channel&15)|(e.type<<4);bytes[at+2]=e.d0|0;bytes[at+3]=e.d1|0;bytes[at+4]=e.d2|0;});
  }
  const u16=(b,at)=>b[at]|b[at+1]<<8,u32=(b,at)=>(u16(b,at)|u16(b,at+2)<<16)>>>0;
  const put16=(b,at,v)=>{b[at]=v&255;b[at+1]=(v>>>8)&255;},put32=(b,at,v)=>{put16(b,at,v&65535);put16(b,at+2,v>>>16);};
  function songEmpty(){return {name:'NEW SONG',project:0,loop:false,jumpRow:false,swing:false,tempo:0,loopRow:0,channel:[0,0,0,0,0,0,0,0],rows:[{block:[0,0,0,0,0,0,0,0],repeat:1,loopHere:false,steps:64}]};}
  // Parse a 4096-byte record image into an editable object (CRC checked, ranges checked).
  function songRecordParse(bytes){
    check(bytes instanceof Uint8Array&&bytes.length===SONG_RECORD&&u32(bytes,0)===SONG_MAGIC,'不是歌曲记录');
    const version=u32(bytes,20);check(version===1||version===2,'歌曲记录版本不受支持');
    check(u32(bytes,12)===crc32(bytes.subarray(20,version===2?SONG_V2_END:SONG_BODY)),'歌曲记录校验失败');   // (Task 04) CRC range by version
    const rows=bytes[40];check(rows>=1&&rows<=128&&bytes[42]<rows&&bytes[36]<16&&!(bytes[37]&~7),'歌曲记录字段无效');   // Task 05: flags bit 2 = swing
    check(u16(bytes,38)===0||(u16(bytes,38)>=30&&u16(bytes,38)<=300),'歌曲速度须为 0 或 30–300');   // (f): as the device checks
    const song={name:String.fromCharCode(...bytes.subarray(24,36)).replace(/\s+$/,''),project:bytes[36],loop:!!(bytes[37]&1),jumpRow:!!(bytes[37]&2),swing:!!(bytes[37]&4),
      tempo:u16(bytes,38),loopRow:bytes[42],channel:Array.from(bytes.subarray(48,56)),rows:[]};
    for(let r=0;r<rows;r++){const at=SONG_ROW0+r*SONG_ROW;const block=[];for(let t=0;t<8;t++)block.push(u16(bytes,at+t*2));
      const steps=bytes[at+18]||64;check(bytes[at+16]>=1&&bytes[at+16]<=64&&steps%16===0&&steps<=64,'第 '+(r+1)+' 行无效');
      song.rows.push({block,repeat:bytes[at+16],loopHere:!!(bytes[at+17]&1),steps});}
    song.events=version===2?songEventsParse(bytes):[];   // Task 04: row events (9.11)
    if(version===2)songEventsValidate(song.events,rows);
    return song;
  }
  // Build the record image (generation 0, target 0, commit 0, CRC valid) from the object.
  function songRecordBuild(song){
    const bytes=new Uint8Array(SONG_RECORD).fill(255);bytes.fill(0,0,SONG_BODY);
    // Task 04: a song with events is a version-2 record (CRC over 20..4091); without, version 1.
    const events=(song.events||[]).slice().sort((a,b)=>a.row-b.row);
    put32(bytes,0,SONG_MAGIC);put32(bytes,20,events.length?2:1);
    const name=String(song.name||'').toUpperCase().slice(0,12);check(/^[\x20-\x7e]{0,12}$/.test(name),'歌曲名称须为英文字符');
    for(let i=0;i<12;i++)bytes[24+i]=name.charCodeAt(i)||32;
    check(Number.isInteger(song.project)&&song.project>=0&&song.project<16,'项目槽无效');bytes[36]=song.project;
    bytes[37]=(song.loop?1:0)|(song.jumpRow?2:0)|(song.swing?4:0);   // Task 05 (9.12): bit 2, swing for v2 blocks
    check(Number.isInteger(song.tempo)&&song.tempo>=0&&song.tempo<=65535,'BPM 无效');put16(bytes,38,song.tempo);
    check(Array.isArray(song.rows)&&song.rows.length>=1&&song.rows.length<=128,'歌曲须有 1–128 行');bytes[40]=song.rows.length;
    check(Number.isInteger(song.loopRow)&&song.loopRow>=0&&song.loopRow<song.rows.length,'循环起始行无效');bytes[42]=song.loopRow;
    for(let t=0;t<8;t++){const c=song.channel[t]|0;check(c>=0&&c<=16,'输出通道须为 0–16');bytes[48+t]=c;}
    song.rows.forEach((row,r)=>{const at=SONG_ROW0+r*SONG_ROW;
      for(let t=0;t<8;t++){const id=row.block[t]|0;check(id>=0&&id<=65535,'第 '+(r+1)+' 行块编号无效');put16(bytes,at+t*2,id);}
      check(row.repeat>=1&&row.repeat<=64,'第 '+(r+1)+' 行重复次数须为 1–64');bytes[at+16]=row.repeat;
      bytes[at+17]=row.loopHere?1:0;check([16,32,48,64].includes(row.steps),'第 '+(r+1)+' 行步数须为 16/32/48/64');bytes[at+18]=row.steps;});
    if(events.length){songEventsValidate(events,song.rows.length);songEventsBuild(bytes,events);}
    put32(bytes,12,crc32(bytes.subarray(20,events.length?SONG_V2_END:SONG_BODY)));
    return bytes;
  }
  // Block payload <-> 64 steps of {probability, alt, notes:[{pitch,velocity,offset,length,retrigger}]}.
  // Task 05 (section 9.12): payloads are format 1 (6-byte timed notes, web/timed-note/timed-note.js:
  // offset -240..240 units of 1/480 step, length in units); format 0 (9.3, 3-byte notes) is read
  // from older .tabby files through songPayloadParseV1 and written back as format 1.
  const timedNote=()=>{const T=globalThis.TabbyTimedNote;check(T,'timed-note.js 未加载');return T;};
  const SONG_UNITS=480;
  function songPayloadParse(bytes){
    const T=timedNote(),steps=[];let at=0;
    for(let s=0;s<64;s++){check(at<bytes.length,'块数据不完整');const head=bytes[at++],count=head&7;check(count<=4&&!(head&128),'块步进头无效');
      const step={probability:(head>>3)&7,alt:!!(head&64),notes:[]};
      for(let n=0;n<count;n++,at+=6){check(at+6<=bytes.length,'块音符无效');let note;try{note=T.decode(bytes.subarray(at,at+6));}catch(e){check(false,'块音符无效：'+e.message);}
        step.notes.push({pitch:note.pitch,velocity:note.velocity,offset:note.offset,length:note.length,retrigger:note.retrigger});}
      steps.push(step);}
    check(at===bytes.length,'块长度不符');return steps;
  }
  function songPayloadParseV1(bytes){
    const steps=[];let at=0;
    for(let s=0;s<64;s++){check(at<bytes.length,'块数据不完整');const head=bytes[at++],count=head&7;check(count<=4&&!(head&128),'块步进头无效');
      const step={probability:(head>>3)&7,alt:!!(head&64),notes:[]};
      for(let n=0;n<count;n++,at+=3){check(at+3<=bytes.length&&bytes[at]<128&&(bytes[at+1]&127)>0&&bytes[at+2]>0,'块音符无效');
        step.notes.push({pitch:bytes[at],velocity:bytes[at+1]&127,offset:0,length:bytes[at+2]*SONG_UNITS,retrigger:!!(bytes[at+1]&128)});}
      steps.push(step);}
    check(at===bytes.length,'块长度不符');return steps;
  }
  function songPayloadBuild(steps){
    const T=timedNote(),out=[];check(steps.length===64,'块须有 64 步');
    for(const step of steps){check(step.notes.length<=4,'每步最多 4 个音符');
      out.push((step.notes.length)|((step.probability&7)<<3)|(step.alt?64:0));
      const seen=new Set();for(const n of step.notes){const note={pitch:n.pitch,velocity:n.velocity,retrigger:!!n.retrigger,offset:n.offset|0,length:n.length};
        check(T.valid(note)&&!seen.has(n.pitch),'音符须为 音高 0–127、力度 1–127、偏移 ±240、长度 ≥ 1 单位，且同一步音高不重复');seen.add(n.pitch);
        out.push(...T.encode(note));}}
    return Uint8Array.from(out);
  }
  // Step text (Task 05): "60:100:2 64:100:2.5/-12r @3 !" — pitch:velocity:length[/offset], length in steps
  // (decimals allowed, stored to 1/480 step), offset in signed units (1/480 step), r = retrigger,
  // @n = probability n/8, ! = alt tuning. The old form without a slash is read unchanged (offset 0).
  const songLengthText=u=>{const s=u/SONG_UNITS;return Number.isInteger(s)?String(s):s.toFixed(3).replace(/0+$/,'');};
  function songStepText(step){
    const parts=step.notes.map(n=>n.pitch+':'+n.velocity+':'+songLengthText(n.length)+(n.offset?'/'+(n.offset>0?'+':'')+n.offset:'')+(n.retrigger?'r':''));
    if(step.probability)parts.push('@'+step.probability);if(step.alt)parts.push('!');return parts.join(' ');
  }
  function songStepParse(text){
    const step={probability:0,alt:false,notes:[]};
    for(const token of String(text).trim().split(/\s+/).filter(Boolean)){
      if(token==='!'){step.alt=true;continue;}
      if(token[0]==='@'){step.probability=Number(token.slice(1));check(Number.isInteger(step.probability)&&step.probability>=0&&step.probability<=7,'概率须为 @0–@7');continue;}
      const m=token.match(/^(\d+)(?::(\d+))?(?::(\d+(?:\.\d+)?))?(?:\/([+-]?\d+)(ms)?)?(r)?$/i);check(m,'无法解析音符 '+token);
      const steps=m[3]===undefined?1:Number(m[3]),length=Math.max(1,Math.round(steps*SONG_UNITS));
      step.notes.push({pitch:Number(m[1]),velocity:m[2]===undefined?100:Number(m[2]),offset:m[4]===undefined?0:Number(m[4]),length,retrigger:!!m[6],offsetMs:!!m[5]});
    }
    return step;
  }
  // .tabby file: the record image followed by block records {0,0,id16,len16,payload} padded to 4 bytes.
  // Task 04 (9.11 v0.6): an optional trailer after the records, 0xFF then "TRIG", a u32 length and
  // UTF-8 JSON (workbench-only data: the song's rig override); the device never receives it.
  function tabbyFile(record,blocks,trailer){
    const parts=[record];for(const [id,payload] of blocks){const head=new Uint8Array(6);head[1]=1;put16(head,2,id);put16(head,4,payload.length);   // byte 1: payload format 1 (Task 05)
      const pad=new Uint8Array((4-(6+payload.length)%4)%4).fill(255);parts.push(head,payload,pad);}
    if(trailer){const json=new TextEncoder().encode(JSON.stringify(trailer)),head=new Uint8Array(9);head[0]=255;head.set([84,82,73,71],1);put32(head,5,json.length);parts.push(head,json);}
    const total=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(total);let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;
  }
  function readTabbyFile(bytes){
    check(bytes.length>=SONG_RECORD,'不是 .tabby 歌曲文件');const record=bytes.slice(0,SONG_RECORD);songRecordParse(record);
    const blocks=new Map();let at=SONG_RECORD;
    while(at+6<=bytes.length&&bytes[at]!==255){check(bytes[at]===0,'文件中的块须属于歌曲 0');const format=bytes[at+1],id=u16(bytes,at+2),len=u16(bytes,at+4);
      check((format===0||format===1)&&id>=1&&len>=64&&len<=(format?1600:832)&&at+6+len<=bytes.length,'块记录无效');let payload=bytes.slice(at+6,at+6+len);
      if(format===0)payload=songPayloadBuild(songPayloadParseV1(payload));else songPayloadParse(payload);   // Task 05: a format-0 block is upgraded on read
      blocks.set(id,payload);at+=6+len;at+=(4-at%4)%4;}
    let trailer=null;
    if(at+9<=bytes.length&&bytes[at]===255&&String.fromCharCode(...bytes.subarray(at+1,at+5))==='TRIG'){const len=u32(bytes,at+5);check(at+9+len<=bytes.length,'.tabby 附加数据无效');
      try{trailer=JSON.parse(new TextDecoder().decode(bytes.subarray(at+9,at+9+len)));}catch(_){check(false,'.tabby 附加数据无效');}}
    return {record,blocks,trailer};
  }
  // Batches for transfer kind 7 (9.9 v0.5): the records cut at the device's packing boundaries
  // (greedy first fit into 4076-byte record areas, a record never splits), at most 8 sectors =
  // 32608 bytes per batch, so the upload packs exactly as one giant batch would.
  const BATCH_AREA=4076,BATCH_SECTORS=8;
  function songBatches(blocks){
    const batches=[],flush=(parts,total)=>{const out=new Uint8Array(total);let at=0;for(const p of parts){out.set(p,at);at+=p.length;}batches.push(out);};
    let parts=[],total=0,fill=0,sectors=1;
    for(const [id,payload] of blocks){
      const size=6+payload.length+(4-(6+payload.length)%4)%4;
      if(fill+size>BATCH_AREA){if(sectors===BATCH_SECTORS){flush(parts,total);parts=[];total=0;sectors=0;}sectors++;fill=0;}
      const rec=new Uint8Array(size).fill(255);rec[0]=0;rec[1]=1;put16(rec,2,id);put16(rec,4,payload.length);rec.set(payload,6);   // byte 1: payload format 1 (Task 05)
      parts.push(rec);total+=size;fill+=size;
    }
    if(parts.length)flush(parts,total);
    return batches;
  }
  function songBlockIds(song){const ids=new Set();for(const row of song.rows)for(const id of row.block)if(id)ids.add(id);return ids;}
  globalThis.FM1Web={abortable,assetBytes,crc16,inspectPackage,prepare,pack7,frame,parse,capability,Link,pairs,Updater,
    songEmpty,songRecordParse,songRecordBuild,songPayloadParse,songPayloadParseV1,songPayloadBuild,songStepText,songStepParse,songLengthText,tabbyFile,readTabbyFile,songBlockIds,songBatches,songEventsValidate,
    crc32,demoFrame,demoParse,validateVoice,readVoices,voiceFile,packVoice,bankFile,voiceBank,projectVersion,upgradeProject,tunedProject,projectFile,readProjectFile,timbreFile,readTimbreFile,voiceTimbre,Library};
})();

globalThis.FM1_DEVICES = [{"schema":"tabby-device/1","version":"0.1","id":"dirtywave-m8","name":"Dirtywave M8 Tracker Model:02","maker":"Dirtywave","channel":{"default":null,"note":"MIDI Settings view: a channel per track 1..8 (default track n = channel n), stored in the song; separate record, control-map (10) and song-row-cue (11) channels."},"programChange":{"supported":true,"displayBase":0,"programs":128,"bankFormat":"none","pad":2,"displayHex":true,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"With PG CHANGE on, a PC on a track's channel selects that track's instrument INST 00..7F (hex). PC 0 = INST 00 is the natural reading; unverified. Bank select on receive is not documented."},"controllers":[{"cc":-1,"name":"No fixed CC list: per-song MIDI mappings (any CC on the control-map channel to instrument / mixer / effect / tempo / transpose parameters); CC 64 sustain on track input","min":0,"max":127}],"setup":["MIDI Settings: track channels (default track n = channel n).","MIDI Settings: PG CHANGE = on.","Name the instruments in the song; the rig profile can name INST 00..7F for the editor."],"notes":["Instruments are per-song user content (00..7F hex); no factory names.","Firmware 6.6.3C at research time; manual v6.5.2."],"sources":[{"title":"M8 Operation Manual v6.5.2 (2026-04-21)","url":"https://cdn.shopify.com/s/files/1/0455/0485/6229/files/m8_operation_manual_v20260421.pdf?v=1776791699","detail":"pp. 2, 5, 8, 43-45, 62-65, 91"},{"title":"M8 firmware changelog","url":"https://raw.githubusercontent.com/Dirtywave/M8Firmware/main/changelog.txt","detail":"2.5.0 sustain, 2.7.0 bank MSB on send, 2.7.3 and 6.5.2 program change"}],"unverified":["channel.default","programChange.displayBase","bank select on receive","omni"],"presets":[]},{"schema":"tabby-device/1","version":"0.1","id":"emu-proteus-2-xr","name":"E-MU Proteus/2 XR","maker":"E-mu Systems","channel":{"default":null,"note":"Multi mode: each of the 16 channels has its own preset; set MIDI ENABLE and PRESET CHANGE on per channel."},"programChange":{"supported":true,"displayBase":0,"programs":128,"bankFormat":"none","pad":3,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Presets are shown 000..383 (XR). MIDI reaches 0..127 directly; presets 128..383 only through the device's MIDI PROG>PRESET map, which maps an incoming program 0..127 to any preset. Enter such presets as the mapped program number."},"controllers":[{"cc":7,"name":"Volume","min":0,"max":127},{"cc":10,"name":"Pan","min":0,"max":127,"values":{"0":"hard left","64":"centre","127":"hard right"}},{"cc":1,"name":"Realtime controller A (default assignment)","min":0,"max":127},{"cc":2,"name":"Realtime controller B (default assignment)","min":0,"max":127},{"cc":3,"name":"Realtime controller C (default assignment)","min":0,"max":127},{"cc":4,"name":"Realtime controller D (default assignment)","min":0,"max":127},{"cc":64,"name":"Footswitch 1 (default; sustain if the preset routes it)","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":65,"name":"Footswitch 2 (default)","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":66,"name":"Footswitch 3 (default)","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":121,"name":"Reset all controllers","min":0,"max":0},{"cc":123,"name":"All notes off","min":0,"max":0}],"setup":["Master menu: MIDI MODE = Multi.","Per channel the song addresses: MIDI ENABLE on and PRESET CHANGE on.","Master menu MIDI PROG>PRESET: identity for presets 0..127; map a program number to each preset above 127 the song needs (no bank select exists).","Leave the Edit menu before playing: program changes are ignored inside it.","Run SEND SETUP before PLAY: the manual asks for setup messages before the song starts."],"notes":["Factory list from the operation manual pp. 92-93 (192 presets 0..191; XR ROM 256..383 repeats the ROM set). User presets 64..127 (and XR RAM 0..255) carry whatever you stored; names here are the factory ones.","The manual: do not send setup information just before the first beat (timing errors)."],"sources":[{"title":"E-mu Proteus operation manual (family manual with the 1992 MIDI addendum)","url":"https://archive.org/download/synthmanual-e-mu-proteus-owners-manual/e-muproteusownersmanual.pdf","detail":"pp. 14, 18-21, 69, 92-93, 118-124 (PDF page = printed + 2)"},{"title":"synthmania Proteus/2 page (secondary, text preset list)","url":"https://www.synthmania.com/proteus-2.htm","detail":"cross-check of names 000..190"}],"unverified":["channel.default","programChange.note:factory state of the program map on a reset unit"],"presets":[{"bank":null,"program":0,"number":0,"name":"Solo Cello"},{"bank":null,"program":1,"number":1,"name":"Solo Viola"},{"bank":null,"program":2,"number":2,"name":"Solo Violin"},{"bank":null,"program":3,"number":3,"name":"Quartet"},{"bank":null,"program":4,"number":4,"name":"Solo Chamber"},{"bank":null,"program":5,"number":5,"name":"Arco Basses"},{"bank":null,"program":6,"number":6,"name":"Arco Celli"},{"bank":null,"program":7,"number":7,"name":"Arco Violas"},{"bank":null,"program":8,"number":8,"name":"Arco Violins"},{"bank":null,"program":9,"number":9,"name":"Marcato 1"},{"bank":null,"program":10,"number":10,"name":"Marcato 2"},{"bank":null,"program":11,"number":11,"name":"Legato Str"},{"bank":null,"program":12,"number":12,"name":"Concerto"},{"bank":null,"program":13,"number":13,"name":"Pizz Basses"},{"bank":null,"program":14,"number":14,"name":"Pizz Celli"},{"bank":null,"program":15,"number":15,"name":"Pizz Violas"},{"bank":null,"program":16,"number":16,"name":"Pizz Violins"},{"bank":null,"program":17,"number":17,"name":"Pizzicato 1"},{"bank":null,"program":18,"number":18,"name":"Pizzicato 2"},{"bank":null,"program":19,"number":19,"name":"Trem Strings"},{"bank":null,"program":20,"number":20,"name":"Tremulus"},{"bank":null,"program":21,"number":21,"name":"Strgs/Flutes"},{"bank":null,"program":22,"number":22,"name":"Resting Pad"},{"bank":null,"program":23,"number":23,"name":"Divertimento"},{"bank":null,"program":24,"number":24,"name":"Flute"},{"bank":null,"program":25,"number":25,"name":"Piccolo"},{"bank":null,"program":26,"number":26,"name":"Oboe"},{"bank":null,"program":27,"number":27,"name":"English Horn"},{"bank":null,"program":28,"number":28,"name":"Clarinet"},{"bank":null,"program":29,"number":29,"name":"Bass Clarinet"},{"bank":null,"program":30,"number":30,"name":"Bassoon"},{"bank":null,"program":31,"number":31,"name":"Contrbassoon"},{"bank":null,"program":32,"number":32,"name":"Chamber Winds"},{"bank":null,"program":33,"number":33,"name":"Section Winds"},{"bank":null,"program":34,"number":34,"name":"Epilogue"},{"bank":null,"program":35,"number":35,"name":"Wind Stack"},{"bank":null,"program":36,"number":36,"name":"French Horn 1"},{"bank":null,"program":37,"number":37,"name":"French Horn 2"},{"bank":null,"program":38,"number":38,"name":"Section Horns"},{"bank":null,"program":39,"number":39,"name":"Trumpet 1"},{"bank":null,"program":40,"number":40,"name":"Trumpet 2"},{"bank":null,"program":41,"number":41,"name":"Two Trumpets"},{"bank":null,"program":42,"number":42,"name":"Harmon Mute"},{"bank":null,"program":43,"number":43,"name":"Trombone 1"},{"bank":null,"program":44,"number":44,"name":"Trombone 2"},{"bank":null,"program":45,"number":45,"name":"Tuba"},{"bank":null,"program":46,"number":46,"name":"Back Brass"},{"bank":null,"program":47,"number":47,"name":"Bright Brass"},{"bank":null,"program":48,"number":48,"name":"Chamber Brass"},{"bank":null,"program":49,"number":49,"name":"BrassStrings"},{"bank":null,"program":50,"number":50,"name":"Timpani"},{"bank":null,"program":51,"number":51,"name":"Gong/Cymbal"},{"bank":null,"program":52,"number":52,"name":"Bass/Snare"},{"bank":null,"program":53,"number":53,"name":"Temple Block"},{"bank":null,"program":54,"number":54,"name":"Xylophone"},{"bank":null,"program":55,"number":55,"name":"Glockenspiel"},{"bank":null,"program":56,"number":56,"name":"Celesta"},{"bank":null,"program":57,"number":57,"name":"Tubular Bells"},{"bank":null,"program":58,"number":58,"name":"Percussion 1"},{"bank":null,"program":59,"number":59,"name":"Percussion 2"},{"bank":null,"program":60,"number":60,"name":"Harp"},{"bank":null,"program":61,"number":61,"name":"Harpstrings"},{"bank":null,"program":62,"number":62,"name":"Harpsikord"},{"bank":null,"program":63,"number":63,"name":"Notre Dame"},{"bank":null,"program":64,"number":64,"name":"Winter Signs"},{"bank":null,"program":65,"number":65,"name":"Deep Pad"},{"bank":null,"program":66,"number":66,"name":"Portamento/F"},{"bank":null,"program":67,"number":67,"name":"Bell Ensemble"},{"bank":null,"program":68,"number":68,"name":"Cyberspace"},{"bank":null,"program":69,"number":69,"name":"PizzMoogBass"},{"bank":null,"program":70,"number":70,"name":"Marimbala"},{"bank":null,"program":71,"number":71,"name":"Grim Reaper"},{"bank":null,"program":72,"number":72,"name":"Tinker Bell"},{"bank":null,"program":73,"number":73,"name":"Carousel"},{"bank":null,"program":74,"number":74,"name":"Exotic Harp"},{"bank":null,"program":75,"number":75,"name":"Darn Saucers"},{"bank":null,"program":76,"number":76,"name":"Bronze Pad"},{"bank":null,"program":77,"number":77,"name":"Vibraphone"},{"bank":null,"program":78,"number":78,"name":"Astral Flute"},{"bank":null,"program":79,"number":79,"name":"Kool Bass"},{"bank":null,"program":80,"number":80,"name":"Sombre Winds"},{"bank":null,"program":81,"number":81,"name":"Space Cowboy"},{"bank":null,"program":82,"number":82,"name":"The Machine"},{"bank":null,"program":83,"number":83,"name":"Early Perc"},{"bank":null,"program":84,"number":84,"name":"Gently Now"},{"bank":null,"program":85,"number":85,"name":"Piccolodeeyo"},{"bank":null,"program":86,"number":86,"name":"Infinite One"},{"bank":null,"program":87,"number":87,"name":"ShimmerWays"},{"bank":null,"program":88,"number":88,"name":"Turbo Bass"},{"bank":null,"program":89,"number":89,"name":"Requiem"},{"bank":null,"program":90,"number":90,"name":"Wrong Room"},{"bank":null,"program":91,"number":91,"name":"Analog Pad"},{"bank":null,"program":92,"number":92,"name":"Chapel Organ"},{"bank":null,"program":93,"number":93,"name":"Electrovocal"},{"bank":null,"program":94,"number":94,"name":"Fat Boy Tuba"},{"bank":null,"program":95,"number":95,"name":"SawBass/Lead"},{"bank":null,"program":96,"number":96,"name":"Vienna Dream"},{"bank":null,"program":97,"number":97,"name":"Vertigo Pad"},{"bank":null,"program":98,"number":98,"name":"Tarkus Twin"},{"bank":null,"program":99,"number":99,"name":"RoomOfStrings"},{"bank":null,"program":100,"number":100,"name":"Magic Bells"},{"bank":null,"program":101,"number":101,"name":"Reginatron"},{"bank":null,"program":102,"number":102,"name":"Sub It!"},{"bank":null,"program":103,"number":103,"name":"Psychlotron"},{"bank":null,"program":104,"number":104,"name":"CloudChamber"},{"bank":null,"program":105,"number":105,"name":"Sepulcher"},{"bank":null,"program":106,"number":106,"name":"Lurch Pluck"},{"bank":null,"program":107,"number":107,"name":"Pizz/Piccolo"},{"bank":null,"program":108,"number":108,"name":"Vampirical"},{"bank":null,"program":109,"number":109,"name":"String Thing"},{"bank":null,"program":110,"number":110,"name":"Galapagos"},{"bank":null,"program":111,"number":111,"name":"Square One"},{"bank":null,"program":112,"number":112,"name":"Square Link"},{"bank":null,"program":113,"number":113,"name":"<*>"},{"bank":null,"program":114,"number":114,"name":"Sardonicus"},{"bank":null,"program":115,"number":115,"name":"Master Tron"},{"bank":null,"program":116,"number":116,"name":"Lo Wind Inst"},{"bank":null,"program":117,"number":117,"name":"Sympathetic"},{"bank":null,"program":118,"number":118,"name":"Wind Chimes"},{"bank":null,"program":119,"number":119,"name":"Boat Haus"},{"bank":null,"program":120,"number":120,"name":"Glitter God"},{"bank":null,"program":121,"number":121,"name":"Story Bass"},{"bank":null,"program":122,"number":122,"name":"Nice Night"},{"bank":null,"program":123,"number":123,"name":"Prophet Lead"},{"bank":null,"program":124,"number":124,"name":"Prophet Link"},{"bank":null,"program":125,"number":125,"name":"Whistl'n Joe"},{"bank":null,"program":126,"number":126,"name":"Link2Shimmer"},{"bank":null,"program":127,"number":127,"name":"Ascending"},{"bank":null,"program":null,"number":128,"name":"Harpsomatic"},{"bank":null,"program":null,"number":129,"name":"Phaedra"},{"bank":null,"program":null,"number":130,"name":"Cimbalon"},{"bank":null,"program":null,"number":131,"name":"Recorder"},{"bank":null,"program":null,"number":132,"name":"Koto"},{"bank":null,"program":null,"number":133,"name":"Dream Garden"},{"bank":null,"program":null,"number":134,"name":"Amplify Bass"},{"bank":null,"program":null,"number":135,"name":"Asian Reed"},{"bank":null,"program":null,"number":136,"name":"Soft Harp"},{"bank":null,"program":null,"number":137,"name":"Jazz Bass"},{"bank":null,"program":null,"number":138,"name":"Grandfather"},{"bank":null,"program":null,"number":139,"name":"Classic Gtr"},{"bank":null,"program":null,"number":140,"name":"Temple Bell"},{"bank":null,"program":null,"number":141,"name":"StrHarmonic"},{"bank":null,"program":null,"number":142,"name":"Cellophane"},{"bank":null,"program":null,"number":143,"name":"Gamba Musik"},{"bank":null,"program":null,"number":144,"name":"Quintoctave"},{"bank":null,"program":null,"number":145,"name":"Basses&Vios"},{"bank":null,"program":null,"number":146,"name":"Violin&Celli"},{"bank":null,"program":null,"number":147,"name":"ArcoViolins"},{"bank":null,"program":null,"number":148,"name":"Arco Duet"},{"bank":null,"program":null,"number":149,"name":"Str Section"},{"bank":null,"program":null,"number":150,"name":"Arco Strings"},{"bank":null,"program":null,"number":151,"name":"In The Pit"},{"bank":null,"program":null,"number":152,"name":"<<InThePit<<"},{"bank":null,"program":null,"number":153,"name":"Rotary Chmbr"},{"bank":null,"program":null,"number":154,"name":"Krummhorns"},{"bank":null,"program":null,"number":155,"name":"C.Bsn/Dbl Bs"},{"bank":null,"program":null,"number":156,"name":"Soft Flute"},{"bank":null,"program":null,"number":157,"name":"Hi Wind Solo"},{"bank":null,"program":null,"number":158,"name":"Verb Clarinet"},{"bank":null,"program":null,"number":159,"name":"PiccoloPeace"},{"bank":null,"program":null,"number":160,"name":"Flute/Oboe"},{"bank":null,"program":null,"number":161,"name":"Clar./Flute"},{"bank":null,"program":null,"number":162,"name":"Clar/Bassoon"},{"bank":null,"program":null,"number":163,"name":"Double Reeds"},{"bank":null,"program":null,"number":164,"name":"Bassoon/Horn"},{"bank":null,"program":null,"number":165,"name":"Alto Flute"},{"bank":null,"program":null,"number":166,"name":"WindEnsemble"},{"bank":null,"program":null,"number":167,"name":"DblReeds/Hrn"},{"bank":null,"program":null,"number":168,"name":"Verb Horn"},{"bank":null,"program":null,"number":169,"name":"Xprsv Cornet"},{"bank":null,"program":null,"number":170,"name":"Bone&Trumpet"},{"bank":null,"program":null,"number":171,"name":"Bone&Tuba"},{"bank":null,"program":null,"number":172,"name":"Trombones"},{"bank":null,"program":null,"number":173,"name":"Sfz Brass"},{"bank":null,"program":null,"number":174,"name":"Horn Vel+Wh"},{"bank":null,"program":null,"number":175,"name":"Afroblocks"},{"bank":null,"program":null,"number":176,"name":"Timba Mallet"},{"bank":null,"program":null,"number":177,"name":"Timp w/Tone"},{"bank":null,"program":null,"number":178,"name":"Bass Drum"},{"bank":null,"program":null,"number":179,"name":"TimpLowBlock"},{"bank":null,"program":null,"number":180,"name":"Deep Drum"},{"bank":null,"program":null,"number":181,"name":"Triangle"},{"bank":null,"program":null,"number":182,"name":"Big Log"},{"bank":null,"program":null,"number":183,"name":"Gamelan"},{"bank":null,"program":null,"number":184,"name":"Clarinet/Bb"},{"bank":null,"program":null,"number":185,"name":"Clarinet/A"},{"bank":null,"program":null,"number":186,"name":"BassClar/Bb"},{"bank":null,"program":null,"number":187,"name":"EngHorn/F"},{"bank":null,"program":null,"number":188,"name":"FrenchHorn/F"},{"bank":null,"program":null,"number":189,"name":"Trumpet/Bb"},{"bank":null,"program":null,"number":190,"name":"Trumpet/D"},{"bank":null,"program":null,"number":191,"name":"Default"}]},{"schema":"tabby-device/1","version":"0.1","id":"eventide-h90","name":"Eventide H90 Harmonizer","maker":"Eventide","channel":{"default":15,"note":"One channel for receive and transmit, or Receive Omni (System > MIDI). The default value is not stated in the manual; 15 is this rig's setting."},"programChange":{"supported":true,"displayBase":1,"programs":99,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"PC selects a Program in the current Playlist (a User List of up to 99). With PC Offset 0 (default) PC n loads Program n as displayed (1-based; PC 0 is not used); with PC Offset 1, PC 0 loads Program 1: set this definition's displayBase to 0 then. No bank select; banks of three are reached only by Bank Up / Down CC functions."},"controllers":[{"cc":-1,"name":"No default CC map: assign CC numbers per function in System > MIDI > Global Control (Load, Increment, Decrement, Bank Up/Down, Tuner, Tap Tempo, P/A/B active-bypass toggle or momentary, Insert 1/2, HotSwitch 1-3, Perform 1-6, Quick Knobs 1-6, HotKnob, In/Out gain, Mix) and enter them in the rig profile","min":0,"max":127}],"setup":["System > MIDI: channel 15 (or Receive Omni).","System > MIDI: PC Offset 0 keeps PC n = Program n as displayed; if you use PC Offset 1, set displayBase 0 in the rig.","Make the User List you play from the Playlist: program numbers in the song refer to its order.","Assign CC numbers for bypass / HotSwitch / tap in Global Control and enter them in the rig profile.","Firmware 1.8.6..1.9.x ignores a CC sent together with a PC: keep this device's gap (after the program change) until you run 1.13.2 or later."],"notes":["Program names are per user (the Playlist is user-arranged): name the 99 slots in the rig profile.","A PC loads the whole Program (both A and B); presets A/B are not selectable by MIDI."],"sources":[{"title":"H90 User Manual v1.9.7, 7.4 MIDI","url":"https://cdn.eventideaudio.com/manuals/h90/1.9.7/content/system-menu/midi.html","detail":"PDF pp. 94-96"},{"title":"H90 User Manual v1.9.7, Appendix C global mapping chart","url":"https://cdn.eventideaudio.com/manuals/h90/1.9.7/content/appendix/global.html","detail":"PDF pp. 253-256"},{"title":"Eventide staff forum answers (manufacturer, informal): PC/CC timing, no bank select","url":"https://www.eventideaudio.com/?p=189216","detail":"also ?p=187986, ?p=194425"}],"unverified":["channel.default","programChange.gapMs:older firmware needs ~300 ms after a PC before a CC (user report)","USB carries PC/CC (manual says only 'receive MIDI over USB')"],"presets":[]},{"schema":"tabby-device/1","version":"0.1","id":"instruo-seashell","name":"Instruo Seashell","maker":"Instruo","channel":{"default":null,"note":"Set in the Seashell Controller software (Settings > MIDI Channel). TRS type A MIDI in and class-compliant USB-C. Default and omni not documented."},"programChange":{"supported":"unverified","displayBase":0,"programs":0,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Not supported in the published firmware 1.0.x (presets are files of the Controller app). Firmware 2.0 (announced, not on Instruo's site) is said to add 120 preset slots selected by program change; numbering and bank scheme unknown."},"controllers":[{"cc":-1,"name":"No fixed CC map: parameters are assigned by MIDI Learn in the Controller app; any CC 0..127 can be a modulation-matrix source","min":0,"max":127}],"setup":["Seashell Controller: Settings > MIDI Channel.","Map the parameters you want to drive with MIDI Learn (the mapping is yours; enter the CC numbers in the rig profile)."],"notes":["No preset names published.","Secondary: a user-made default CC map exists (Electra One preset); not a factory assignment."],"sources":[{"title":"Seashell user manual (2025-06-10, firmware 1.0.0)","url":"https://instruomodular.com/wp-content/uploads/manuals/Seashell%20Manual.pdf","detail":"pp. 11, 45, 49-50, 55"},{"title":"Instruo firmware page (1.0.3 notes)","url":"https://www.instruomodular.com/firmware/","detail":""},{"title":"SonicState report on firmware 2.0 (secondary)","url":"https://sonicstate.com/news/2026/10/26/beijing-26-instruo-seashell-v20/","detail":"120 slots, program change"}],"unverified":["channel.default","programChange.supported","programChange.programs","any CC assignment","timing"],"presets":[]},{"schema":"tabby-device/1","version":"0.1","id":"korg-volca-fm2","name":"Korg volca fm2","maker":"Korg","channel":{"default":null,"note":"Hold MEMORY at power-on and press key 1..16; memorised. Mode 3 (omni off). TRS MIDI in/out, no USB. Factory default not stated."},"programChange":{"supported":false,"displayBase":0,"programs":64,"bankFormat":"none","pad":2,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Program change is neither received nor transmitted (chart); the 64 programs are selected on the panel or by SysEx dump. A program event targeted at this device does nothing."},"controllers":[{"cc":40,"name":"Octave (TRANSPS NOTE off) / Transpose (on)","min":0,"max":127,"values":{"0":"-3 oct","55":"0","110":"+3 oct"}},{"cc":41,"name":"Velocity","min":0,"max":127},{"cc":42,"name":"Modulator Attack","min":0,"max":127,"values":{"64":"0"}},{"cc":43,"name":"Modulator Decay","min":0,"max":127,"values":{"64":"0"}},{"cc":44,"name":"Carrier Attack","min":0,"max":127,"values":{"64":"0"}},{"cc":45,"name":"Carrier Decay","min":0,"max":127,"values":{"64":"0"}},{"cc":46,"name":"LFO Rate","min":0,"max":127},{"cc":47,"name":"LFO Pitch Depth","min":0,"max":127},{"cc":48,"name":"Algorithm","min":0,"max":127,"values":{"0":"1","127":"32"}},{"cc":49,"name":"Arp Type","min":0,"max":127,"values":{"0":"off","13":"rise 1","26":"rise 2","39":"rise 3","52":"fall 1","58":"fall 2","74":"fall 3","90":"random 1","103":"random 2","116":"random 3"}},{"cc":50,"name":"Arp Division","min":0,"max":127,"values":{"0":"1/12","12":"1/8","24":"1/4","36":"1/3","47":"1/2","59":"2/3","70":"1/1","82":"3/2","94":"2/1","105":"3/1","117":"4/1"}},{"cc":64,"name":"Sustain (firmware 1.10+)","min":0,"max":127},{"cc":91,"name":"Reverb Depth","min":0,"max":127},{"cc":93,"name":"Chorus Depth","min":0,"max":127},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Set the MIDI channel (hold MEMORY at power-on, key 1..16).","Global parameter 7 MIDI ShortMessage = on (factory default), or no channel message is received.","Program change is not received: only CC events reach this device."],"notes":["No factory program names are published; names live in the SysEx dump only."],"sources":[{"title":"volca fm2 MIDI Implementation Chart (2021-10-27, v1.0)","url":"https://cdn.korg.com/us/support/download/files/38bf877e063858210403554ec502efac.pdf","detail":"Program Change: not recognised"},{"title":"volca fm2 MIDI Implementation (text, rev 1.00, 2022-11-17)","url":"https://cdn.korg.com/us/support/download/files/b0ec4b721695a217d1ecaa248a93ab78.txt","detail":"2-1 channel messages and footnotes"},{"title":"volca fm2 owner's manual (2024-11-07)","url":"https://cdn.korg.com/us/support/download/files/fd37180c39c87b20df510643347ee119.pdf","detail":"p. 3 MIDI channel, global parameters"},{"title":"volca fm2 system updater 1.12 release notes (CC 64 in 1.10)","url":"https://www.korg.com/us/support/download/software/0/892/4964/","detail":""}],"unverified":["channel.default","panel program numbering (0..63 or 1..64)","CC 64 semantics"],"presets":[]},{"schema":"tabby-device/1","version":"0.1","id":"mvave-fm1-melodee","name":"M-VAVE FM-1 (Melodee firmware)","maker":"M-VAVE (firmware: Melodee by keremimo, GPL-3.0)","channel":{"default":null,"note":"GLO > SYSTEM > ROUT = CH1-4 / CH5-8 / CH9-12 / CH13-16 (four consecutive channels on tracks 1..4) or SEL (every channel plays the selected track); DRUM channel OFF / 1..16 (default 10); MIDI tracks have their own channel 1..16. USB class-compliant, TRS input, BLE MIDI."},"programChange":{"supported":false,"displayBase":0,"programs":0,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Melodee 1.6.1 has no program change handler (0xCn is only forwarded to MIDI-only tracks for output); sounds are selected on the panel. The optional MIDI KNOBS profile turns the PRESETS encoder with CC 18 (GENERAL) or CC 76 (MINILAB), a knob emulation, not a PC. A program event targeted at this device does nothing."},"controllers":[{"cc":1,"name":"Mod wheel (selected track)","min":0,"max":127},{"cc":5,"name":"Glide","min":0,"max":127},{"cc":7,"name":"Track level","min":0,"max":127},{"cc":10,"name":"Pan","min":0,"max":127},{"cc":64,"name":"Sustain","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":71,"name":"Engine macro (resonance)","min":0,"max":127},{"cc":72,"name":"Release","min":0,"max":127},{"cc":73,"name":"Attack","min":0,"max":127},{"cc":74,"name":"Engine macro (brightness / cutoff)","min":0,"max":127},{"cc":75,"name":"Decay","min":0,"max":127},{"cc":120,"name":"All Sound Off","min":0,"max":0},{"cc":121,"name":"Reset All Controllers","min":0,"max":0},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Load Melodee (web installer); GLO > SYSTEM > ROUT to put the tracks on the channels the song uses (or SEL).","No program change: only CC events reach this device."],"notes":["Melodee 1.6.1 (2026-11-02) at research time; a modified Felucca. FM6 ROM voices: TINE EP, BRASS SECT, SOLID BASS, BELLS, MARIMBA, CLAVINET, DRAWBARS, STRINGS, GLASS PAD, SYNC LEAD, HARP, KALIMBA, FLUTE, STEEL DRUM, SAW BASS, TUBULAR (not selectable by MIDI)."],"sources":[{"title":"Melodee repository","url":"https://github.com/keremimo/melodee","detail":"v1.6.1"},{"title":"Melodee manual, MIDI section","url":"https://keremimo.github.io/melodee/webapp/manual/","detail":"ROUT, DRUM channel, CC list, MIDI KNOBS, MIDI LEARN"},{"title":"Melodee source: firmware/src/midi_control.c (midi_event: no 0xCn handler)","url":"https://github.com/keremimo/melodee/blob/main/firmware/src/midi_control.c","detail":"code read, not hardware-verified"}],"unverified":["channel.default","behaviour on hardware (code read only)","whether a nightly adds program change"],"presets":[]},{"schema":"tabby-device/1","version":"0.1","id":"mvave-fm1-orange-cat","name":"M-VAVE FM-1 (Orange Cat firmware)","maker":"M-VAVE (firmware: Orange Cat, in development)","channel":{"default":null,"note":"Placeholder: Orange Cat's MIDI implementation is not settled. Channel and notes only."},"programChange":{"supported":"unverified","displayBase":0,"programs":0,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Placeholder to fill in when Orange Cat's MIDI implementation is settled."},"controllers":[],"setup":["Load the Orange Cat firmware; set its MIDI channel per its own documentation."],"notes":["Placeholder definition (Task 04): no program change, no named CCs until the firmware's MIDI implementation is settled."],"sources":[{"title":"Orange Cat FM-1 firmware (separate project, in development)","url":"","detail":"no published MIDI implementation yet"}],"unverified":["everything beyond channel and notes"],"presets":[]},{"schema":"tabby-device/1","version":"0.1","id":"mvave-fm1-skiff","name":"M-VAVE FM-1 (Skiff firmware)","maker":"M-VAVE (firmware: Skiff by illuminus5, GPL-3.0)","channel":{"default":null,"note":"MENU > MIDI: MIDI IN = CH1-6 (channels 1..6 play tracks 1..6; other channels are ignored entirely) or SEL (every channel plays the selected track); T1..T6 CHANNEL 1..16 per track (default 1..6). USB MIDI in/out and TRS in."},"programChange":{"supported":true,"displayBase":0,"programs":148,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Skiff 1.3+: a PC on a track's channel loads that track's engine's factory sound number n, counted from 0 (0 on an FM6 track = TINE EP); a program past the engine's last preset is ignored, not wrapped; user sounds are not reachable. No bank select (CC 0 / CC 32 ignored). The number means a different sound per engine, so name presets per engine in the rig profile."},"controllers":[{"cc":1,"name":"Mod wheel (MOD source)","min":0,"max":127},{"cc":5,"name":"Glide","min":0,"max":127},{"cc":7,"name":"Level","min":0,"max":127},{"cc":10,"name":"Pan","min":0,"max":127},{"cc":11,"name":"Expression (MOD source)","min":0,"max":127},{"cc":64,"name":"Sustain","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":71,"name":"Engine resonance (ANALOG / TRIO / NOISE)","min":0,"max":127},{"cc":72,"name":"Release","min":0,"max":127},{"cc":73,"name":"Attack","min":0,"max":127},{"cc":74,"name":"Engine brightness (cutoff / DCW / tone / FM6 modulator level)","min":0,"max":127},{"cc":75,"name":"Decay","min":0,"max":127},{"cc":91,"name":"Reverb send","min":0,"max":127},{"cc":93,"name":"Chorus send","min":0,"max":127},{"cc":94,"name":"Delay send","min":0,"max":127},{"cc":120,"name":"All Sound Off","min":0,"max":0},{"cc":121,"name":"Reset All Controllers","min":0,"max":0},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Load Skiff (web installer); MENU > MIDI: MIDI IN = CH1-6 and the track channels, or SEL.","Program numbers count the track's engine's factory presets from 0: set each track's engine first.","A PC is applied by the main loop after the message: keep a small gap before the notes (no published figure)."],"notes":["148 factory sounds over 14 engines (per-engine order in firmware/src/engines.c); no complete published name list, so presets are named in the rig profile.","Skiff v2.1.1 (2026-10-31) at research time."],"sources":[{"title":"Skiff repository (README: MIDI, CC map)","url":"https://github.com/illuminus5/skiff","detail":"v2.1.1"},{"title":"Skiff manual, chapter 19 MIDI and the web editor","url":"https://illuminus5.github.io/skiff/learn/","detail":"program change counted from 0, CC table, MIDI LEARN"},{"title":"Skiff source: firmware/src/midi_control.c, ui.c (midi_pc_load)","url":"https://github.com/illuminus5/skiff/blob/main/firmware/src/midi_control.c","detail":"PC per track, no bank select"}],"unverified":["channel.default","per-engine preset order and names","PC latency on hardware","TRS jack polarity"],"presets":[]},{"schema":"tabby-device/1","version":"0.1","id":"waldorf-blofeld","name":"Waldorf Blofeld","maker":"Waldorf","channel":{"default":null,"note":"Global MIDI Channel (omni, 1..16). In Multi mode each of 16 parts has its own channel and a 'Prg Change' receive filter."},"programChange":{"supported":true,"displayBase":1,"programs":128,"bankFormat":"letter","pad":3,"bankSelect":{"scheme":"cc32","banks":[{"index":0,"name":"A","msb":null,"lsb":0},{"index":1,"name":"B","msb":null,"lsb":1},{"index":2,"name":"C","msb":null,"lsb":2},{"index":3,"name":"D","msb":null,"lsb":3},{"index":4,"name":"E","msb":null,"lsb":4},{"index":5,"name":"F","msb":null,"lsb":5},{"index":6,"name":"G","msb":null,"lsb":6},{"index":7,"name":"H","msb":null,"lsb":7}]},"gapMs":0,"gapAfter":"program","note":"Display A001..H128. CC 32 = 0..7 selects bank A..H (manual table; CC 0 'not used'; the OS 1.15 notes say CC 0 and CC 32 are interchangeable). 128 Multi programs are selected with CC 0 = 127 then PC on the global channel, only when already in Multi mode (secondary)."},"controllers":[{"cc":1,"name":"Modulation Wheel","min":0,"max":127},{"cc":2,"name":"Breath Control","min":0,"max":127},{"cc":4,"name":"Foot Control","min":0,"max":127},{"cc":5,"name":"Glide Rate","min":0,"max":127},{"cc":7,"name":"Channel Volume","min":0,"max":127},{"cc":10,"name":"Pan","min":0,"max":127,"values":{"0":"L64","64":"centre","127":"R63"}},{"cc":12,"name":"Arp Range","min":0,"max":9,"values":{"0":"1 octave","9":"10 octaves"}},{"cc":13,"name":"Arp Length","min":0,"max":15,"values":{"0":"1 step","15":"16 steps"}},{"cc":14,"name":"Arp Active","min":0,"max":3,"values":{"0":"off","1":"on","2":"one shot","3":"hold"}},{"cc":15,"name":"LFO 1 Shape","min":0,"max":5,"values":{"0":"sine","1":"triangle","2":"square","3":"sawtooth","4":"random","5":"S&H"}},{"cc":16,"name":"LFO 1 Speed","min":0,"max":127},{"cc":17,"name":"LFO 1 Sync","min":0,"max":1,"values":{"0":"off","1":"on"}},{"cc":18,"name":"LFO 1 Delay","min":0,"max":127},{"cc":19,"name":"LFO 2 Shape","min":0,"max":5},{"cc":20,"name":"LFO 2 Speed","min":0,"max":127},{"cc":21,"name":"LFO 2 Sync","min":0,"max":1},{"cc":22,"name":"LFO 2 Delay","min":0,"max":127},{"cc":23,"name":"LFO 3 Shape","min":0,"max":5},{"cc":24,"name":"LFO 3 Speed","min":0,"max":127},{"cc":25,"name":"LFO 3 Sync","min":0,"max":1},{"cc":26,"name":"LFO 3 Delay","min":0,"max":127},{"cc":27,"name":"Osc 1 Octave","min":16,"max":112,"values":{"16":"128'","112":"1/2'"}},{"cc":28,"name":"Osc 1 Semitone","min":52,"max":76,"values":{"52":"-12","64":"0","76":"+12"}},{"cc":29,"name":"Osc 1 Detune","min":0,"max":127},{"cc":30,"name":"Osc 1 FM","min":0,"max":127},{"cc":31,"name":"Osc 1 Shape","min":0,"max":5,"values":{"0":"pulse","1":"saw","2":"triangle","3":"sine","4":"alt 1","5":"alt 2"}},{"cc":33,"name":"Osc 1 PW","min":0,"max":127},{"cc":34,"name":"Osc 1 PWM","min":0,"max":127},{"cc":35,"name":"Osc 2 Octave","min":16,"max":112},{"cc":36,"name":"Osc 2 Semitone","min":52,"max":76},{"cc":37,"name":"Osc 2 Detune","min":0,"max":127},{"cc":38,"name":"Osc 2 FM","min":0,"max":127},{"cc":39,"name":"Osc 2 Shape","min":0,"max":5},{"cc":40,"name":"Osc 2 PW","min":0,"max":127},{"cc":41,"name":"Osc 2 PWM","min":0,"max":127},{"cc":42,"name":"Osc 3 Octave","min":16,"max":112},{"cc":43,"name":"Osc 3 Semitone","min":52,"max":76},{"cc":44,"name":"Osc 3 Detune","min":0,"max":127},{"cc":45,"name":"Osc 3 FM","min":0,"max":127},{"cc":46,"name":"Osc 3 Shape","min":0,"max":5},{"cc":47,"name":"Osc 3 PW","min":0,"max":127},{"cc":48,"name":"Osc 3 PWM","min":0,"max":127},{"cc":49,"name":"Sync","min":0,"max":1},{"cc":50,"name":"Pitchmod","min":0,"max":127},{"cc":51,"name":"Glide Mode","min":0,"max":9},{"cc":52,"name":"Osc 1 Level","min":0,"max":127},{"cc":53,"name":"Osc 1 Balance","min":0,"max":127},{"cc":54,"name":"Ringmod Level","min":0,"max":127},{"cc":55,"name":"Ringmod Balance","min":0,"max":127},{"cc":56,"name":"Osc 2 Level","min":0,"max":127},{"cc":57,"name":"Osc 2 Balance","min":0,"max":127},{"cc":58,"name":"Osc 3 Level","min":0,"max":127},{"cc":59,"name":"Osc 3 Balance","min":0,"max":127},{"cc":60,"name":"Noise Level","min":0,"max":127},{"cc":61,"name":"Noise Balance","min":0,"max":127},{"cc":62,"name":"Noise Colour","min":0,"max":127},{"cc":64,"name":"Sustain Pedal","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":65,"name":"Glide Active","min":0,"max":127},{"cc":66,"name":"Sostenuto","min":0,"max":127},{"cc":67,"name":"Routing","min":0,"max":1,"values":{"0":"serial","1":"parallel"}},{"cc":68,"name":"Filter 1 Type","min":0,"max":10},{"cc":69,"name":"Filter 1 Cutoff","min":0,"max":127},{"cc":70,"name":"Filter 1 Resonance","min":0,"max":127},{"cc":71,"name":"Filter 1 Drive","min":0,"max":127},{"cc":72,"name":"Filter 1 Keytrack","min":0,"max":127},{"cc":73,"name":"Filter 1 Env Amount","min":0,"max":127},{"cc":74,"name":"Filter 1 Env Velocity","min":0,"max":127},{"cc":75,"name":"Filter 1 Cutoff Mod","min":0,"max":127},{"cc":76,"name":"Filter 1 FM","min":0,"max":127},{"cc":77,"name":"Filter 1 Pan","min":0,"max":127},{"cc":78,"name":"Filter 1 Pan Mod","min":0,"max":127},{"cc":79,"name":"Filter 2 Type","min":0,"max":10},{"cc":80,"name":"Filter 2 Cutoff","min":0,"max":127},{"cc":81,"name":"Filter 2 Resonance","min":0,"max":127},{"cc":82,"name":"Filter 2 Drive","min":0,"max":127},{"cc":83,"name":"Filter 2 Keytrack","min":0,"max":127},{"cc":84,"name":"Filter 2 Env Amount","min":0,"max":127},{"cc":85,"name":"Filter 2 Env Velocity","min":0,"max":127},{"cc":86,"name":"Filter 2 Cutoff Mod","min":0,"max":127},{"cc":87,"name":"Filter 2 FM","min":0,"max":127},{"cc":88,"name":"Filter 2 Pan","min":0,"max":127},{"cc":89,"name":"Filter 2 Pan Mod","min":0,"max":127},{"cc":90,"name":"Amp Volume","min":0,"max":127},{"cc":91,"name":"Amp Velocity","min":0,"max":127},{"cc":92,"name":"Amp Mod","min":0,"max":127},{"cc":93,"name":"FX 1 Mix","min":0,"max":127},{"cc":94,"name":"FX 2 Mix","min":0,"max":127},{"cc":95,"name":"Filter Env Attack","min":0,"max":127},{"cc":96,"name":"Filter Env Decay","min":0,"max":127},{"cc":97,"name":"Filter Env Sustain","min":0,"max":127},{"cc":98,"name":"Filter Env Decay 2","min":0,"max":127},{"cc":99,"name":"Filter Env Sustain 2","min":0,"max":127},{"cc":100,"name":"Filter Env Release","min":0,"max":127},{"cc":101,"name":"Amp Env Attack","min":0,"max":127},{"cc":102,"name":"Amp Env Decay","min":0,"max":127},{"cc":103,"name":"Amp Env Sustain","min":0,"max":127},{"cc":104,"name":"Amp Env Decay 2","min":0,"max":127},{"cc":105,"name":"Amp Env Sustain 2","min":0,"max":127},{"cc":106,"name":"Amp Env Release","min":0,"max":127},{"cc":107,"name":"Env 3 Attack","min":0,"max":127},{"cc":108,"name":"Env 3 Decay","min":0,"max":127},{"cc":109,"name":"Env 3 Sustain","min":0,"max":127},{"cc":110,"name":"Env 3 Decay 2","min":0,"max":127},{"cc":111,"name":"Env 3 Sustain 2","min":0,"max":127},{"cc":112,"name":"Env 3 Release","min":0,"max":127},{"cc":113,"name":"Env 4 Attack","min":0,"max":127},{"cc":114,"name":"Env 4 Decay","min":0,"max":127},{"cc":115,"name":"Env 4 Sustain","min":0,"max":127},{"cc":116,"name":"Env 4 Decay 2","min":0,"max":127},{"cc":117,"name":"Env 4 Sustain 2","min":0,"max":127},{"cc":118,"name":"Env 4 Release","min":0,"max":127},{"cc":120,"name":"All Sound Off","min":0,"max":0},{"cc":121,"name":"Reset All Controllers","min":0,"max":0},{"cc":122,"name":"Local Control","min":0,"max":127},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Global: MIDI Channel (or per-part channel in Multi mode with the part's Prg Change filter set to receive).","Global: Ctrl Receive = on, or no control change changes a parameter.","Avoid channel 10 in Multi mode (Waldorf FAQ: can cause crashes).","Allow a gap after a program change (OS notes: fast program changes can be missed)."],"notes":["Factory names from Waldorf's 2012 factory sound set (SNDD dumps, 16-character names); 2008 set differs.","Secondary: after switching a Multi, wait before selecting the parts' programs; an editor uses 800 ms."],"sources":[{"title":"Blofeld User's Manual, revision 1.1 (January 2009)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/32zdTsdYcRSX9eE","detail":"pp. 18, 24-28, 82-85, 113-117, 122"},{"title":"Blofeld factory sounds 2012 (name list and SNDD dumps)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/fi4DWR7G2aXnWQ3","detail":"Blo Factory 2012.txt, Sysex/factory 2012 A..H.syx"},{"title":"Blofeld SysEx specification, release 1.04","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/ybExJgT4TzqT8ir","detail":"SNDD layout, name at 363..378"},{"title":"Waldorf OS 1.15 notes as re-posted (secondary)","url":"https://www.elektronauts.com/t/digitakt-blofeld-multi-mode-midi/51291/20","detail":"CC 0 / CC 32 interchangeable, Multi selection, timing"}],"unverified":["channel.default","programChange.gapMs:no manufacturer figure","Multi selection by CC 0 = 127","CC 0 acceptance on OS 1.25"],"presets":[{"bank":0,"program":0,"name":"Start Up       T"},{"bank":0,"program":1,"name":"70s Pad        T"},{"bank":0,"program":2,"name":"Tschingeling SCD"},{"bank":0,"program":3,"name":"XT Close     SCD"},{"bank":0,"program":4,"name":"Digital JP4  SCD"},{"bank":0,"program":5,"name":"BloChoir       T"},{"bank":0,"program":6,"name":"Sync Different T"},{"bank":0,"program":7,"name":"TearsFromCombSCD"},{"bank":0,"program":8,"name":"Click Bass     T"},{"bank":0,"program":9,"name":"Myst 6         T"},{"bank":0,"program":10,"name":"Sander Lead    T"},{"bank":0,"program":11,"name":"Bladerunner    T"},{"bank":0,"program":12,"name":"BloStrings     T"},{"bank":0,"program":13,"name":"ArpDelayLFO? SCD"},{"bank":0,"program":14,"name":"Dahlbeck Bass  T"},{"bank":0,"program":15,"name":"CopiedByLargo  T"},{"bank":0,"program":16,"name":"JustResonanceSCD"},{"bank":0,"program":17,"name":"IntensiveCareSCD"},{"bank":0,"program":18,"name":"Planet Ice     T"},{"bank":0,"program":19,"name":"Pad Brown      T"},{"bank":0,"program":20,"name":"Rasenflaeche   T"},{"bank":0,"program":21,"name":"PWM<->SWM    SCD"},{"bank":0,"program":22,"name":"SuperPulse   SCD"},{"bank":0,"program":23,"name":"Eyes Wide Open T"},{"bank":0,"program":24,"name":"BriteWhitePad  T"},{"bank":0,"program":25,"name":"Chronos        T"},{"bank":0,"program":26,"name":"Ambientity     T"},{"bank":0,"program":27,"name":"Lothlorien     T"},{"bank":0,"program":28,"name":"Boelissimo     T"},{"bank":0,"program":29,"name":"Inglorious Pad T"},{"bank":0,"program":30,"name":"PitchShifter SCD"},{"bank":0,"program":31,"name":"X-File Pad     T"},{"bank":0,"program":32,"name":"AmbienTable    T"},{"bank":0,"program":33,"name":"ShortWave      T"},{"bank":0,"program":34,"name":"CS100          T"},{"bank":0,"program":35,"name":"Slightly Pad   T"},{"bank":0,"program":36,"name":"FlyingDutchman T"},{"bank":0,"program":37,"name":"BoelesBrass SCD"},{"bank":0,"program":38,"name":"Phase 5        T"},{"bank":0,"program":39,"name":"RingCon        T"},{"bank":0,"program":40,"name":"LeadING        T"},{"bank":0,"program":41,"name":"Chord Hose     T"},{"bank":0,"program":42,"name":"Chordalis      T"},{"bank":0,"program":43,"name":"Deadmau5 Chord T"},{"bank":0,"program":44,"name":"JigSaw         T"},{"bank":0,"program":45,"name":"Fat Pig        T"},{"bank":0,"program":46,"name":"Leadgut        T"},{"bank":0,"program":47,"name":"Crying Lead    T"},{"bank":0,"program":48,"name":"AggLead        T"},{"bank":0,"program":49,"name":"Overdrive      T"},{"bank":0,"program":50,"name":"Lead Keen      T"},{"bank":0,"program":51,"name":"Van Doorn      T"},{"bank":0,"program":52,"name":"Gummi Lead     T"},{"bank":0,"program":53,"name":"Static Leads   T"},{"bank":0,"program":54,"name":"Sync By FM   SCD"},{"bank":0,"program":55,"name":"Enganged       T"},{"bank":0,"program":56,"name":"Hummer         T"},{"bank":0,"program":57,"name":"Old School     T"},{"bank":0,"program":58,"name":"Handjob        T"},{"bank":0,"program":59,"name":"Slipping Lead  T"},{"bank":0,"program":60,"name":"Glidelis     SCD"},{"bank":0,"program":61,"name":"Rave On        T"},{"bank":0,"program":62,"name":"SynChaos       T"},{"bank":0,"program":63,"name":"Airy Lead      T"},{"bank":0,"program":64,"name":"Airy Lead 2    T"},{"bank":0,"program":65,"name":"Tiestofeld   SCD"},{"bank":0,"program":66,"name":"ARPollinaris   T"},{"bank":0,"program":67,"name":"Driving Line   T"},{"bank":0,"program":68,"name":"TD 2010      SCD"},{"bank":0,"program":69,"name":"SawmodulationSCD"},{"bank":0,"program":70,"name":"Bram A.      SCD"},{"bank":0,"program":71,"name":"Laidback     SCD"},{"bank":0,"program":72,"name":"Reseq        SCD"},{"bank":0,"program":73,"name":"S&H Drive    SCD"},{"bank":0,"program":74,"name":"Mouth Arp    SCD"},{"bank":0,"program":75,"name":"ADHD         SCD"},{"bank":0,"program":76,"name":"mARPledust     T"},{"bank":0,"program":77,"name":"305 Bassline   T"},{"bank":0,"program":78,"name":"WArpeggiator   T"},{"bank":0,"program":79,"name":"ARPower        T"},{"bank":0,"program":80,"name":"Drumloop       T"},{"bank":0,"program":81,"name":"OnTheRun       T"},{"bank":0,"program":82,"name":"LFO Delay 2  SCD"},{"bank":0,"program":83,"name":"LFOWahDelay  SCD"},{"bank":0,"program":84,"name":"The End      SCD"},{"bank":0,"program":85,"name":"Deadmau5 Bass  T"},{"bank":0,"program":86,"name":"Pulse Drive    T"},{"bank":0,"program":87,"name":"FM Bass        T"},{"bank":0,"program":88,"name":"Oizo Bass      T"},{"bank":0,"program":89,"name":"Pickup Bass    T"},{"bank":0,"program":90,"name":"BassTrap     SCD"},{"bank":0,"program":91,"name":"Wide Bass      T"},{"bank":0,"program":92,"name":"Dirty Bass     T"},{"bank":0,"program":93,"name":"Rev Pulse Bass T"},{"bank":0,"program":94,"name":"C64 Bass       T"},{"bank":0,"program":95,"name":"Tranceptor     T"},{"bank":0,"program":96,"name":"Short Trance   T"},{"bank":0,"program":97,"name":"Sauron Pad     T"},{"bank":0,"program":98,"name":"Ghost On Mars  T"},{"bank":0,"program":99,"name":"ImpulseResp. SCD"},{"bank":0,"program":100,"name":"CombDeBoele  SCD"},{"bank":0,"program":101,"name":"SpaceDigde     T"},{"bank":0,"program":102,"name":"The 1980s      T"},{"bank":0,"program":103,"name":"Pulse3+      SCD"},{"bank":0,"program":104,"name":"Dig. Modular SCD"},{"bank":0,"program":105,"name":"VA*FM        SCD"},{"bank":0,"program":106,"name":"PPGenious    SCD"},{"bank":0,"program":107,"name":"TriangleDanceSCD"},{"bank":0,"program":108,"name":"Wave Voices  SCD"},{"bank":0,"program":109,"name":"Piano E      SCD"},{"bank":0,"program":110,"name":"SimpleSeq    SCD"},{"bank":0,"program":111,"name":"Chopshop3.0  SCD"},{"bank":0,"program":112,"name":"OrganClav      T"},{"bank":0,"program":113,"name":"Wit Licht    SCD"},{"bank":0,"program":114,"name":"Morphorgan     T"},{"bank":0,"program":115,"name":"My Keys      SCD"},{"bank":0,"program":116,"name":"Warning      SCD"},{"bank":0,"program":117,"name":"InYourRoom   SCD"},{"bank":0,"program":118,"name":"Bad Highpass SCD"},{"bank":0,"program":119,"name":"ChildOfMine  SCD"},{"bank":0,"program":120,"name":"2 Cats       SCD"},{"bank":0,"program":121,"name":"PPG 2        SCD"},{"bank":0,"program":122,"name":"FlangerSaw   SCD"},{"bank":0,"program":123,"name":"ChainSaw     SCD"},{"bank":0,"program":124,"name":"BloAttack    SCD"},{"bank":0,"program":125,"name":"Sines        SCD"},{"bank":0,"program":126,"name":"BloodLife    SCD"},{"bank":0,"program":127,"name":"Delerium       T"},{"bank":1,"program":0,"name":"RisePad RL"},{"bank":1,"program":1,"name":"AmbientNodes RL"},{"bank":1,"program":2,"name":"JunoStack RL"},{"bank":1,"program":3,"name":"LayeredBass RL"},{"bank":1,"program":4,"name":"FirstContact RL"},{"bank":1,"program":5,"name":"ElectroKitty RL"},{"bank":1,"program":6,"name":"AnoDomini RL"},{"bank":1,"program":7,"name":"ClubbyOrgan RL"},{"bank":1,"program":8,"name":"DanceChord95 RL"},{"bank":1,"program":9,"name":"RioLargo RL"},{"bank":1,"program":10,"name":"FunkyDisco RL"},{"bank":1,"program":11,"name":"UtopianPad RL"},{"bank":1,"program":12,"name":"HardTrancer RL"},{"bank":1,"program":13,"name":"TechnoChords RL"},{"bank":1,"program":14,"name":"SquareWaver RL"},{"bank":1,"program":15,"name":"ArpBells RL"},{"bank":1,"program":16,"name":"FakeGuitar RL"},{"bank":1,"program":17,"name":"Trance2K RL"},{"bank":1,"program":18,"name":"Hacienda RL"},{"bank":1,"program":19,"name":"BloChoir RL"},{"bank":1,"program":20,"name":"BassNation RL"},{"bank":1,"program":21,"name":"MellowKeys RL"},{"bank":1,"program":22,"name":"TotalTrance RL"},{"bank":1,"program":23,"name":"PianoMan RL"},{"bank":1,"program":24,"name":"FloorBass RL"},{"bank":1,"program":25,"name":"AnotherWorld RL"},{"bank":1,"program":26,"name":"ClockWork RL"},{"bank":1,"program":27,"name":"SuperMario RL"},{"bank":1,"program":28,"name":"ClubDelays RL"},{"bank":1,"program":29,"name":"TronicLead RL"},{"bank":1,"program":30,"name":"FireWire RL"},{"bank":1,"program":31,"name":"DirtyRamirez RL"},{"bank":1,"program":32,"name":"MerlinsPad RL"},{"bank":1,"program":33,"name":"DreamSaw RL"},{"bank":1,"program":34,"name":"CosmicGates RL"},{"bank":1,"program":35,"name":"ElectroPulse RL"},{"bank":1,"program":36,"name":"SquelchBass RL"},{"bank":1,"program":37,"name":"TechnoDawn RL"},{"bank":1,"program":38,"name":"Orchestral RL"},{"bank":1,"program":39,"name":"StarGazer RL"},{"bank":1,"program":40,"name":"PartyLikeAlex RL"},{"bank":1,"program":41,"name":"DanceMaster RL"},{"bank":1,"program":42,"name":"HeavenlyVox RL"},{"bank":1,"program":43,"name":"PartyLead RL"},{"bank":1,"program":44,"name":"HouseClassic RL"},{"bank":1,"program":45,"name":"ClubUK RL"},{"bank":1,"program":46,"name":"TrashBass RL"},{"bank":1,"program":47,"name":"SadStrings RL"},{"bank":1,"program":48,"name":"RezzoPoly RL"},{"bank":1,"program":49,"name":"MrMiles RL"},{"bank":1,"program":50,"name":"SamplerVox RL"},{"bank":1,"program":51,"name":"TunnelPad RL"},{"bank":1,"program":52,"name":"ElectroSaw RL"},{"bank":1,"program":53,"name":"TranceMelody RL"},{"bank":1,"program":54,"name":"DancePizz RL"},{"bank":1,"program":55,"name":"DigitalDance RL"},{"bank":1,"program":56,"name":"SlowingDown RL"},{"bank":1,"program":57,"name":"303AutoGlide RL"},{"bank":1,"program":58,"name":"PhazedOut RL"},{"bank":1,"program":59,"name":"MiniLead RL"},{"bank":1,"program":60,"name":"Neptune RL"},{"bank":1,"program":61,"name":"Back2Detroit RL"},{"bank":1,"program":62,"name":"RetroKeys RL"},{"bank":1,"program":63,"name":"PowerCore RL"},{"bank":1,"program":64,"name":"Infected RL"},{"bank":1,"program":65,"name":"Pikey RL"},{"bank":1,"program":66,"name":"TechnoFX RL"},{"bank":1,"program":67,"name":"AfterDark RL"},{"bank":1,"program":68,"name":"FlangePad RL"},{"bank":1,"program":69,"name":"EuroClassic RL"},{"bank":1,"program":70,"name":"HouseMeUp RL"},{"bank":1,"program":71,"name":"Motivator RL"},{"bank":1,"program":72,"name":"TuffBass RL"},{"bank":1,"program":73,"name":"DarkSweeper RL"},{"bank":1,"program":74,"name":"DeepBlue RL"},{"bank":1,"program":75,"name":"NuElectro RL"},{"bank":1,"program":76,"name":"NiteCrawler RL"},{"bank":1,"program":77,"name":"Time2Groove RL"},{"bank":1,"program":78,"name":"Planetarium RL"},{"bank":1,"program":79,"name":"DiscoBass RL"},{"bank":1,"program":80,"name":"NoseBleeder RL"},{"bank":1,"program":81,"name":"OldSkool RL"},{"bank":1,"program":82,"name":"Slither RL"},{"bank":1,"program":83,"name":"SuperSquare RL"},{"bank":1,"program":84,"name":"RemixKeys RL"},{"bank":1,"program":85,"name":"DangerZone RL"},{"bank":1,"program":86,"name":"SnapAttack RL"},{"bank":1,"program":87,"name":"Pitch&Slide RL"},{"bank":1,"program":88,"name":"LiquidSaws RL"},{"bank":1,"program":89,"name":"Icelandic RL"},{"bank":1,"program":90,"name":"Avatar RL"},{"bank":1,"program":91,"name":"Seduction RL"},{"bank":1,"program":92,"name":"FollowMe RL"},{"bank":1,"program":93,"name":"DutchLead RL"},{"bank":1,"program":94,"name":"ElectricPiano RL"},{"bank":1,"program":95,"name":"WetElectro RL"},{"bank":1,"program":96,"name":"Airwave RL"},{"bank":1,"program":97,"name":"RaveGenerator RL"},{"bank":1,"program":98,"name":"Amnesia RL"},{"bank":1,"program":99,"name":"PlayedLive RL"},{"bank":1,"program":100,"name":"AcidHouse RL"},{"bank":1,"program":101,"name":"TechnoBoy RL"},{"bank":1,"program":102,"name":"ClubRiffer RL"},{"bank":1,"program":103,"name":"TechnoBells RL"},{"bank":1,"program":104,"name":"Evolution  RL"},{"bank":1,"program":105,"name":"DelMar RL"},{"bank":1,"program":106,"name":"HardEdge RL"},{"bank":1,"program":107,"name":"FatPulse RL"},{"bank":1,"program":108,"name":"KnockDelays RL"},{"bank":1,"program":109,"name":"Siberia RL"},{"bank":1,"program":110,"name":"TechnoEric RL"},{"bank":1,"program":111,"name":"DanceClassic RL"},{"bank":1,"program":112,"name":"OffShore44 RL"},{"bank":1,"program":113,"name":"Parisien RL"},{"bank":1,"program":114,"name":"DeepHouse RL"},{"bank":1,"program":115,"name":"MonstaBass RL"},{"bank":1,"program":116,"name":"Ambience RL"},{"bank":1,"program":117,"name":"XTBass RL"},{"bank":1,"program":118,"name":"ModularFX RL"},{"bank":1,"program":119,"name":"Organesque RL"},{"bank":1,"program":120,"name":"PearlDrops RL"},{"bank":1,"program":121,"name":"BattleStar RL"},{"bank":1,"program":122,"name":"AlienBass RL"},{"bank":1,"program":123,"name":"SuperWaves RL"},{"bank":1,"program":124,"name":"Unchartered RL"},{"bank":1,"program":125,"name":"PlanetZod RL"},{"bank":1,"program":126,"name":"Elevation RL"},{"bank":1,"program":127,"name":"BassTrap RL"},{"bank":2,"program":0,"name":"The 1980s      T"},{"bank":2,"program":1,"name":"S1l4g3        CA"},{"bank":2,"program":2,"name":"Dig. Modular SCD"},{"bank":2,"program":3,"name":"Shy T3ddy     CA"},{"bank":2,"program":4,"name":"PPGenious    SCD"},{"bank":2,"program":5,"name":"Torreblanca   CA"},{"bank":2,"program":6,"name":"Wave Voices  SCD"},{"bank":2,"program":7,"name":"Channel 1337  CA"},{"bank":2,"program":8,"name":"SimpleSeq    SCD"},{"bank":2,"program":9,"name":"404 Found  CA"},{"bank":2,"program":10,"name":"OrganClav      T"},{"bank":2,"program":11,"name":"Encinarejo    CA"},{"bank":2,"program":12,"name":"Morphorgan     T"},{"bank":2,"program":13,"name":"Vic 20        CA"},{"bank":2,"program":14,"name":"Warning      SCD"},{"bank":2,"program":15,"name":"Jaws    CitCA y"},{"bank":2,"program":16,"name":"Bad Highpass SCD"},{"bank":2,"program":17,"name":"Bottle        CA"},{"bank":2,"program":18,"name":"2 Cats       SCD"},{"bank":2,"program":19,"name":"Sa Calobra    CA"},{"bank":2,"program":20,"name":"FlangerSaw   SCD"},{"bank":2,"program":21,"name":"Graja         CA"},{"bank":2,"program":22,"name":"BloAttack    SCD"},{"bank":2,"program":23,"name":"Table FM     SCD"},{"bank":2,"program":24,"name":"Glockenklang   T"},{"bank":2,"program":25,"name":"Flowinx       CA"},{"bank":2,"program":26,"name":"BloodLife    SCD"},{"bank":2,"program":27,"name":"2Osc Sync    SCD"},{"bank":2,"program":28,"name":"Latmo          T"},{"bank":2,"program":29,"name":"Halloween      T"},{"bank":2,"program":30,"name":"Down to 5kHz   T"},{"bank":2,"program":31,"name":"Filter FM    SCD"},{"bank":2,"program":32,"name":"Comb-at       CA"},{"bank":2,"program":33,"name":"Borg Cubus     T"},{"bank":2,"program":34,"name":"Relax3       SCD"},{"bank":2,"program":35,"name":"Mahlstrom      T"},{"bank":2,"program":36,"name":"AM on Sinus  SCD"},{"bank":2,"program":37,"name":"19/20          T"},{"bank":2,"program":38,"name":"What?        SCD"},{"bank":2,"program":39,"name":"StefanIsMad  SCD"},{"bank":2,"program":40,"name":"ReverseWhoosch T"},{"bank":2,"program":41,"name":"50s Pad        T"},{"bank":2,"program":42,"name":"Deepspace 9   ST"},{"bank":2,"program":43,"name":"Chorus       WMF"},{"bank":2,"program":44,"name":"HP PPG       SCD"},{"bank":2,"program":45,"name":"Hmm, lecker  WMF"},{"bank":2,"program":46,"name":"Angel Pad     HS"},{"bank":2,"program":47,"name":"Heaven        JL"},{"bank":2,"program":48,"name":"Blovachord   SCD"},{"bank":2,"program":49,"name":"MeetInTheSky SCD"},{"bank":2,"program":50,"name":"Padings       HM"},{"bank":2,"program":51,"name":"Om mani padme HM"},{"bank":2,"program":52,"name":"Raising Sun    T"},{"bank":2,"program":53,"name":"Slow Wavetrip  T"},{"bank":2,"program":54,"name":"Brightseite    T"},{"bank":2,"program":55,"name":"LateNightPad   T"},{"bank":2,"program":56,"name":"Angels Cry    JL"},{"bank":2,"program":57,"name":"Phalanx       ST"},{"bank":2,"program":58,"name":"The Bridge    SK"},{"bank":2,"program":59,"name":"ObiWahnPad    SK"},{"bank":2,"program":60,"name":"Sonnenaufgang  T"},{"bank":2,"program":61,"name":"Queen-mom     HM"},{"bank":2,"program":62,"name":"DarkQuietPad   T"},{"bank":2,"program":63,"name":"Geiler Lurch   T"},{"bank":2,"program":64,"name":"Zeitlos        T"},{"bank":2,"program":65,"name":"MI5 Pad      ugh"},{"bank":2,"program":66,"name":"Octopussy Pad  T"},{"bank":2,"program":67,"name":"Like Wool     HM"},{"bank":2,"program":68,"name":"di-Fusion      T"},{"bank":2,"program":69,"name":"Go to Pad      T"},{"bank":2,"program":70,"name":"Kiddings      HM"},{"bank":2,"program":71,"name":"Harsh Pad      T"},{"bank":2,"program":72,"name":"Broadway     ugh"},{"bank":2,"program":73,"name":"Neocrest      ST"},{"bank":2,"program":74,"name":"BandSpass      T"},{"bank":2,"program":75,"name":"Event Horizon  T"},{"bank":2,"program":76,"name":"Long Sweep     T"},{"bank":2,"program":77,"name":"DisharmonicPad T"},{"bank":2,"program":78,"name":"Goldfinger Pad T"},{"bank":2,"program":79,"name":"Wartofsky 2.0  T"},{"bank":2,"program":80,"name":"S&H&Pad&Nice WMF"},{"bank":2,"program":81,"name":"Attacke      WMF"},{"bank":2,"program":82,"name":"Moving       SCD"},{"bank":2,"program":83,"name":"Q-rious?     WMF"},{"bank":2,"program":84,"name":"Bioshock      JL"},{"bank":2,"program":85,"name":"With Love    WMF"},{"bank":2,"program":86,"name":"Mellow Tron   TK"},{"bank":2,"program":87,"name":"JV HardBass"},{"bank":2,"program":88,"name":"PredictaBass WMF"},{"bank":2,"program":89,"name":"Phalanx Bass"},{"bank":2,"program":90,"name":"BassterKeaton  T"},{"bank":2,"program":91,"name":"Narrow"},{"bank":2,"program":92,"name":"Drum'n'Bass 1"},{"bank":2,"program":93,"name":"Mars Mouse"},{"bank":2,"program":94,"name":"Fonky Fonky"},{"bank":2,"program":95,"name":"Frittenlos"},{"bank":2,"program":96,"name":"Mo'Grass"},{"bank":2,"program":97,"name":"Bassanova"},{"bank":2,"program":98,"name":"2Step Bass"},{"bank":2,"program":99,"name":"TockTock"},{"bank":2,"program":100,"name":"Silicon Base"},{"bank":2,"program":101,"name":"Ultra Sub 1"},{"bank":2,"program":102,"name":"Ultra Sub 2"},{"bank":2,"program":103,"name":"WhopWhop"},{"bank":2,"program":104,"name":"Acrylic Bass"},{"bank":2,"program":105,"name":"Ringmono"},{"bank":2,"program":106,"name":"CascadeVCF"},{"bank":2,"program":107,"name":"303 Wanna Be"},{"bank":2,"program":108,"name":"Morph Bass    ST"},{"bank":2,"program":109,"name":"Q-Timps"},{"bank":2,"program":110,"name":"DeepHouse     SK"},{"bank":2,"program":111,"name":"FM Roads      HS"},{"bank":2,"program":112,"name":"DX-ClassiQ    HS"},{"bank":2,"program":113,"name":"Hippy Freuds  HS"},{"bank":2,"program":114,"name":"Shed          HM"},{"bank":2,"program":115,"name":"Harpsi        HS"},{"bank":2,"program":116,"name":"Easy Piano    HS"},{"bank":2,"program":117,"name":"Lounge Morph  HS"},{"bank":2,"program":118,"name":"BloodyFeld   SCD"},{"bank":2,"program":119,"name":"ModWheelOrganSCD"},{"bank":2,"program":120,"name":"Minor Chords   T"},{"bank":2,"program":121,"name":"Ice Bells     SK"},{"bank":2,"program":122,"name":"Bone Soup"},{"bank":2,"program":123,"name":"DCS3 Bubbles"},{"bank":2,"program":124,"name":"Flying Teapot"},{"bank":2,"program":125,"name":"Gastrology"},{"bank":2,"program":126,"name":"Into Mouth"},{"bank":2,"program":127,"name":"Whoosch        T"},{"bank":3,"program":0,"name":"UltraFatPoly WMF"},{"bank":3,"program":1,"name":"Brass Comp    HM"},{"bank":3,"program":2,"name":"Pussy Galore   T"},{"bank":3,"program":3,"name":"Euro-Zeichen  HS"},{"bank":3,"program":4,"name":"Brassy House  SK"},{"bank":3,"program":5,"name":"BestOfThe80s   T"},{"bank":3,"program":6,"name":"Classic Synth  T"},{"bank":3,"program":7,"name":"WT mess     SCD"},{"bank":3,"program":8,"name":"Leadrunner    HS"},{"bank":3,"program":9,"name":"10VoicePS3100SCD"},{"bank":3,"program":10,"name":"Patagonia     HS"},{"bank":3,"program":11,"name":"Quintage       T"},{"bank":3,"program":12,"name":"RoundTheHorn  HS"},{"bank":3,"program":13,"name":"Net Profit    HS"},{"bank":3,"program":14,"name":"SyncMush    DocT"},{"bank":3,"program":15,"name":"Tron Flutes   HM"},{"bank":3,"program":16,"name":"Qazzio        HS"},{"bank":3,"program":17,"name":"VintageSpringWMF"},{"bank":3,"program":18,"name":"Zawichords    HS"},{"bank":3,"program":19,"name":"Spring Clean  HS"},{"bank":3,"program":20,"name":"Papathanasiou  T"},{"bank":3,"program":21,"name":"FloorFilla    SK"},{"bank":3,"program":22,"name":"Hyper       DocT"},{"bank":3,"program":23,"name":"Dr. Motte      T"},{"bank":3,"program":24,"name":"FilterFM Keys  T"},{"bank":3,"program":25,"name":"80sFM Analog  SK"},{"bank":3,"program":26,"name":"Analog Lute   HS"},{"bank":3,"program":27,"name":"D-NoiZer      SK"},{"bank":3,"program":28,"name":"Crawlers      SK"},{"bank":3,"program":29,"name":"Brownies     WMF"},{"bank":3,"program":30,"name":"Late Ring     HS"},{"bank":3,"program":31,"name":"RingThemBellsSCD"},{"bank":3,"program":32,"name":"TributeTo DX WMF"},{"bank":3,"program":33,"name":"WhatYouSay?  SCD"},{"bank":3,"program":34,"name":"Atlantis       T"},{"bank":3,"program":35,"name":"Atmostrobe     T"},{"bank":3,"program":36,"name":"Background     T"},{"bank":3,"program":37,"name":"Baraka         T"},{"bank":3,"program":38,"name":"Beautiful Sky  T"},{"bank":3,"program":39,"name":"Clink Clash    T"},{"bank":3,"program":40,"name":"Comb Tree      T"},{"bank":3,"program":41,"name":"Drift"},{"bank":3,"program":42,"name":"Fear'n'Loath"},{"bank":3,"program":43,"name":"Flinker"},{"bank":3,"program":44,"name":"Orthanc        T"},{"bank":3,"program":45,"name":"RePression     T"},{"bank":3,"program":46,"name":"Royalties"},{"bank":3,"program":47,"name":"Biosphere      T"},{"bank":3,"program":48,"name":"Spitzbergen    T"},{"bank":3,"program":49,"name":"Stratosphere   T"},{"bank":3,"program":50,"name":"Swiss Atmo     T"},{"bank":3,"program":51,"name":"Upstream       T"},{"bank":3,"program":52,"name":"VeryCompleqs"},{"bank":3,"program":53,"name":"Waterworld     T"},{"bank":3,"program":54,"name":"RingmodFart  SCD"},{"bank":3,"program":55,"name":"Vangelibells SCD"},{"bank":3,"program":56,"name":"PolterBlofeldSCD"},{"bank":3,"program":57,"name":"Ambishous"},{"bank":3,"program":58,"name":"ScaramangAtmo  T"},{"bank":3,"program":59,"name":"CS4O RingMod   T"},{"bank":3,"program":60,"name":"ReSolotion   WMF"},{"bank":3,"program":61,"name":"Anna Powers   HM"},{"bank":3,"program":62,"name":"HardSaw       ST"},{"bank":3,"program":63,"name":"X-Feels"},{"bank":3,"program":64,"name":"Bach Whistler"},{"bank":3,"program":65,"name":"Modulator"},{"bank":3,"program":66,"name":"NoisyLead"},{"bank":3,"program":67,"name":"Pulsar Solo"},{"bank":3,"program":68,"name":"Starweed"},{"bank":3,"program":69,"name":"Saw 1 Osc    WMF"},{"bank":3,"program":70,"name":"Old Squares"},{"bank":3,"program":71,"name":"Crazy Parade"},{"bank":3,"program":72,"name":"Monoguitar"},{"bank":3,"program":73,"name":"Eff Emmd!"},{"bank":3,"program":74,"name":"DiscoPhonic"},{"bank":3,"program":75,"name":"Moany"},{"bank":3,"program":76,"name":"MiniDuke Solo"},{"bank":3,"program":77,"name":"FictionGuitar"},{"bank":3,"program":78,"name":"Autobahn      jh"},{"bank":3,"program":79,"name":"MoogSolo      HS"},{"bank":3,"program":80,"name":"LA-Pipe       HS"},{"bank":3,"program":81,"name":"Clinics      WMF"},{"bank":3,"program":82,"name":"Attacke      WMF"},{"bank":3,"program":83,"name":"Expensive2   WMF"},{"bank":3,"program":84,"name":"ZZ-you"},{"bank":3,"program":85,"name":"Juanita        T"},{"bank":3,"program":86,"name":"Ricochet2008 SCD"},{"bank":3,"program":87,"name":"Spiffing"},{"bank":3,"program":88,"name":"StarSoldiers"},{"bank":3,"program":89,"name":"Slow Pop"},{"bank":3,"program":90,"name":"Space Arp 1"},{"bank":3,"program":91,"name":"Space Arp 2"},{"bank":3,"program":92,"name":"Goonraker   DocT"},{"bank":3,"program":93,"name":"Sierra Velone"},{"bank":3,"program":94,"name":"Selbstlaeufer  T"},{"bank":3,"program":95,"name":"GeeGaGooQ    WMF"},{"bank":3,"program":96,"name":"PassPortament"},{"bank":3,"program":97,"name":"cARPet         T"},{"bank":3,"program":98,"name":"DeluXaflex    RJ"},{"bank":3,"program":99,"name":"E-Motion"},{"bank":3,"program":100,"name":"AthmoDrops"},{"bank":3,"program":101,"name":"1DrunkenStenz"},{"bank":3,"program":102,"name":"Weirdo FX"},{"bank":3,"program":103,"name":"Solaris"},{"bank":3,"program":104,"name":"SoundScapes 1"},{"bank":3,"program":105,"name":"Spektrum Pad"},{"bank":3,"program":106,"name":"Sphere"},{"bank":3,"program":107,"name":"Spitzbergen"},{"bank":3,"program":108,"name":"Stratosphere"},{"bank":3,"program":109,"name":"Swiss Atmo"},{"bank":3,"program":110,"name":"The 5th Atmo"},{"bank":3,"program":111,"name":"The Fog"},{"bank":3,"program":112,"name":"The Year 3000"},{"bank":3,"program":113,"name":"Thin Ice"},{"bank":3,"program":114,"name":"ThrillerOrgan"},{"bank":3,"program":115,"name":"Tire-Guy"},{"bank":3,"program":116,"name":"TschingHisCan"},{"bank":3,"program":117,"name":"Upstream"},{"bank":3,"program":118,"name":"ValeyPad"},{"bank":3,"program":119,"name":"Vanilla Sky"},{"bank":3,"program":120,"name":"Orthanc"},{"bank":3,"program":121,"name":"Lettland"},{"bank":3,"program":122,"name":"Wartofsky      T"},{"bank":3,"program":123,"name":"Wavescapes 1"},{"bank":3,"program":124,"name":"Wavescapes 2"},{"bank":3,"program":125,"name":"Wavescapes 3"},{"bank":3,"program":126,"name":"WideWarmWash WMF"},{"bank":3,"program":127,"name":"The Carpet"},{"bank":4,"program":0,"name":"With Love    WMF"},{"bank":4,"program":1,"name":"ScaramangAtmo  T"},{"bank":4,"program":2,"name":"Handy      H2SCD"},{"bank":4,"program":3,"name":"Angels Cry    JL"},{"bank":4,"program":4,"name":"Chorus       WMF"},{"bank":4,"program":5,"name":"ModWheelOrganSCD"},{"bank":4,"program":6,"name":"SyncMush    DocT"},{"bank":4,"program":7,"name":"Yummi       DocT"},{"bank":4,"program":8,"name":"Pussy Galore   T"},{"bank":4,"program":9,"name":"Clinics      WMF"},{"bank":4,"program":10,"name":"CtrlAltDel  DocT"},{"bank":4,"program":11,"name":"Tines&Bars   WMF"},{"bank":4,"program":12,"name":"Unstable    DocT"},{"bank":4,"program":13,"name":"Deepspace 9   ST"},{"bank":4,"program":14,"name":"DrivingLicnsDocT"},{"bank":4,"program":15,"name":"FlangedHeavenSCD"},{"bank":4,"program":16,"name":"Heaven        JL"},{"bank":4,"program":17,"name":"Hmm, lecker  WMF"},{"bank":4,"program":18,"name":"Horse Trip   SCD"},{"bank":4,"program":19,"name":"Inversion   DocT"},{"bank":4,"program":20,"name":"JMX vs. DeLeon"},{"bank":4,"program":21,"name":"LA Woman   H2SCD"},{"bank":4,"program":22,"name":"Minor Chords"},{"bank":4,"program":23,"name":"MoogSolo 2"},{"bank":4,"program":24,"name":"OhMyLord    DocT"},{"bank":4,"program":25,"name":"PPG Bells    WMF"},{"bank":4,"program":26,"name":"PPGesus      SCD"},{"bank":4,"program":27,"name":"Quadratur   DocT"},{"bank":4,"program":28,"name":"RingmodFart  SCD"},{"bank":4,"program":29,"name":"SchnoerkelosDocT"},{"bank":4,"program":30,"name":"Schulze?     SCD"},{"bank":4,"program":31,"name":"shArp       DocT"},{"bank":4,"program":32,"name":"Space Echo   SCD"},{"bank":4,"program":33,"name":"Synthline     JL"},{"bank":4,"program":34,"name":"Taken!       SCD"},{"bank":4,"program":35,"name":"TouchyBuggerDocT"},{"bank":4,"program":36,"name":"UpperWarp    SCD"},{"bank":4,"program":37,"name":"WhatYouSay?  SCD"},{"bank":4,"program":38,"name":"WT mess     SCD"},{"bank":4,"program":39,"name":"10VoicePS3100SCD"},{"bank":4,"program":40,"name":"ArcoStrings  TEK"},{"bank":4,"program":41,"name":"Blocked      SCD"},{"bank":4,"program":42,"name":"Blolitzer    SCD"},{"bank":4,"program":43,"name":"BloodyFeld   SCD"},{"bank":4,"program":44,"name":"BloSync     DocT"},{"bank":4,"program":45,"name":"Blovachord   SCD"},{"bank":4,"program":46,"name":"Boele Keys   SCD"},{"bank":4,"program":47,"name":"Bonker Bass   ST"},{"bank":4,"program":48,"name":"Camel Saw   DocT"},{"bank":4,"program":49,"name":"Cream S+H    SCD"},{"bank":4,"program":50,"name":"CS4O RingMod"},{"bank":4,"program":51,"name":"DalaiDelayMa SCD"},{"bank":4,"program":52,"name":"Dirty Organ  SCD"},{"bank":4,"program":53,"name":"Dr.Blo      DocT"},{"bank":4,"program":54,"name":"Driven      DocT"},{"bank":4,"program":55,"name":"Euro Clubber  ST"},{"bank":4,"program":56,"name":"Flangelized  SCD"},{"bank":4,"program":57,"name":"Funky Bass    JL"},{"bank":4,"program":58,"name":"Goldfinger Pad T"},{"bank":4,"program":59,"name":"HardSaw       ST"},{"bank":4,"program":60,"name":"Heimweh     DocT"},{"bank":4,"program":61,"name":"Honey House"},{"bank":4,"program":62,"name":"Horny Bass    ST"},{"bank":4,"program":63,"name":"HP PPG       SCD"},{"bank":4,"program":64,"name":"Hyper       DocT"},{"bank":4,"program":65,"name":"I'm Evil     WMF"},{"bank":4,"program":66,"name":"InfinitesimaDocT"},{"bank":4,"program":67,"name":"Jankorgel    SCD"},{"bank":4,"program":68,"name":"Leading      SCD"},{"bank":4,"program":69,"name":"Maximum Zorin  T"},{"bank":4,"program":70,"name":"MeetInTheSky SCD"},{"bank":4,"program":71,"name":"Meridian    DocT"},{"bank":4,"program":72,"name":"Messing     DocT"},{"bank":4,"program":73,"name":"Minimal Bass JL"},{"bank":4,"program":74,"name":"Morph Bass    ST"},{"bank":4,"program":75,"name":"Moving       SCD"},{"bank":4,"program":76,"name":"NearlyInTune SCD"},{"bank":4,"program":77,"name":"Neocrest      ST"},{"bank":4,"program":78,"name":"Octopussy Pad  T"},{"bank":4,"program":79,"name":"Organella"},{"bank":4,"program":80,"name":"Partyhupe     ST"},{"bank":4,"program":81,"name":"Pastry      DocT"},{"bank":4,"program":82,"name":"Persecutor  DocT"},{"bank":4,"program":83,"name":"Phalanx       ST"},{"bank":4,"program":84,"name":"Pick It Up!  SCD"},{"bank":4,"program":85,"name":"Pienzchen   DocT"},{"bank":4,"program":86,"name":"Pigs X-Mod   TEK"},{"bank":4,"program":87,"name":"PlainBass   DocT"},{"bank":4,"program":88,"name":"PolterBlofeldSCD"},{"bank":4,"program":89,"name":"Poly Lead    SCD"},{"bank":4,"program":90,"name":"PPG Piano    SCD"},{"bank":4,"program":91,"name":"PPG T40 like TEK"},{"bank":4,"program":92,"name":"PredictaBass WMF"},{"bank":4,"program":93,"name":"Pressure    DocT"},{"bank":4,"program":94,"name":"Principia   DocT"},{"bank":4,"program":95,"name":"Pure        DocT"},{"bank":4,"program":96,"name":"Reset       DocT"},{"bank":4,"program":97,"name":"Ricochet2008 SCD"},{"bank":4,"program":98,"name":"RingThemBellsSCD"},{"bank":4,"program":99,"name":"Robotic       JL"},{"bank":4,"program":100,"name":"Saw Orgy     SCD"},{"bank":4,"program":101,"name":"Seq 1        SCD"},{"bank":4,"program":102,"name":"Seven Ties   SCD"},{"bank":4,"program":103,"name":"S&Hatmo"},{"bank":4,"program":104,"name":"Sobstuff    DocT"},{"bank":4,"program":105,"name":"Soft Brass 2DocT"},{"bank":4,"program":106,"name":"SpatialDrive1SCD"},{"bank":4,"program":107,"name":"SpatialDrive2SCD"},{"bank":4,"program":108,"name":"Stenzelized  SCD"},{"bank":4,"program":109,"name":"Stop Bass    SCD"},{"bank":4,"program":110,"name":"SunOfTheDogs WMF"},{"bank":4,"program":111,"name":"Supersaw      ST"},{"bank":4,"program":112,"name":"Tabloid     DocT"},{"bank":4,"program":113,"name":"Telenovela  DocT"},{"bank":4,"program":114,"name":"Thrill Arp   SCD"},{"bank":4,"program":115,"name":"Utmost      DocT"},{"bank":4,"program":116,"name":"Variator    DocT"},{"bank":4,"program":117,"name":"Wave Mayhem DocT"},{"bank":4,"program":118,"name":"WavEpiano    SCD"},{"bank":4,"program":119,"name":"West Wave  H2SCD"},{"bank":4,"program":120,"name":"AfterConcert SCD"},{"bank":4,"program":121,"name":"AnalogBass   SCD"},{"bank":4,"program":122,"name":"Barbarie BrassST"},{"bank":4,"program":123,"name":"Basster Keaton"},{"bank":4,"program":124,"name":"Bend Me     DocT"},{"bank":4,"program":125,"name":"Bioshock      JL"},{"bank":4,"program":126,"name":"Blubber      TEK"},{"bank":4,"program":127,"name":"Diving Echos TEK"},{"bank":5,"program":0,"name":"Flups Bass    ST"},{"bank":5,"program":1,"name":"Goonraker   DocT"},{"bank":5,"program":2,"name":"microQ Plus"},{"bank":5,"program":3,"name":"MiniMoogThnd TEK"},{"bank":5,"program":4,"name":"Octa Bass     ST"},{"bank":5,"program":5,"name":"Porno Bass    ST"},{"bank":5,"program":6,"name":"ReSolotion   WMF"},{"bank":5,"program":7,"name":"Roadies Keyb TEK"},{"bank":5,"program":8,"name":"Spynett     DocT"},{"bank":5,"program":9,"name":"Tines       DocT"},{"bank":5,"program":10,"name":"Velo Drive   SCD"},{"bank":5,"program":11,"name":"Vangelibells SCD"},{"bank":5,"program":12,"name":"Bellflutes"},{"bank":5,"program":13,"name":"Bellissimo"},{"bank":5,"program":14,"name":"Bells'E.Piano RZ"},{"bank":5,"program":15,"name":"Cheap Organ"},{"bank":5,"program":16,"name":"Chorgany      SK"},{"bank":5,"program":17,"name":"Combuder Orgs SK"},{"bank":5,"program":18,"name":"Crunge Organ  SK"},{"bank":5,"program":19,"name":"DeepHouse     SK"},{"bank":5,"program":20,"name":"Dirty Organ1 WMF"},{"bank":5,"program":21,"name":"Driven Keys"},{"bank":5,"program":22,"name":"Dull Bells"},{"bank":5,"program":23,"name":"DX-ClassiQ    HS"},{"bank":5,"program":24,"name":"DX-Pipe       HS"},{"bank":5,"program":25,"name":"Easy Piano    HS"},{"bank":5,"program":26,"name":"ElectricOrgan"},{"bank":5,"program":27,"name":"ElectricPiano"},{"bank":5,"program":28,"name":"Fat Sine Keys"},{"bank":5,"program":29,"name":"FM KeysMelody"},{"bank":5,"program":30,"name":"FM Roads"},{"bank":5,"program":31,"name":"Full Organ    HS"},{"bank":5,"program":32,"name":"Glockenspiel"},{"bank":5,"program":33,"name":"GS-Piano      HS"},{"bank":5,"program":34,"name":"Harpsi        HS"},{"bank":5,"program":35,"name":"Hippy Freuds  HS"},{"bank":5,"program":36,"name":"House         HM"},{"bank":5,"program":37,"name":"Jazz Creeper  HS"},{"bank":5,"program":38,"name":"LA-Pipe       HS"},{"bank":5,"program":39,"name":"LoFi Organ    SK"},{"bank":5,"program":40,"name":"Lounge Morph  HS"},{"bank":5,"program":41,"name":"Lower Steam   HS"},{"bank":5,"program":42,"name":"Marimboid     HS"},{"bank":5,"program":43,"name":"Modern House  SK"},{"bank":5,"program":44,"name":"Modern Keys"},{"bank":5,"program":45,"name":"Noise Toys    HS"},{"bank":5,"program":46,"name":"Ode to Joy    HS"},{"bank":5,"program":47,"name":"Oil Well"},{"bank":5,"program":48,"name":"Organ #2       S"},{"bank":5,"program":49,"name":"Quad-Square"},{"bank":5,"program":50,"name":"Reso Organ"},{"bank":5,"program":51,"name":"ResOrgan      SK"},{"bank":5,"program":52,"name":"Rhodos Corso WMF"},{"bank":5,"program":53,"name":"RhodosFlango WMF"},{"bank":5,"program":54,"name":"Rodesque      HS"},{"bank":5,"program":55,"name":"Schwebend     jh"},{"bank":5,"program":56,"name":"Shed          HM"},{"bank":5,"program":57,"name":"Sick FM       SK"},{"bank":5,"program":58,"name":"SpaceChimes   SK"},{"bank":5,"program":59,"name":"The Oily Way  HS"},{"bank":5,"program":60,"name":"Thin Organ    HS"},{"bank":5,"program":61,"name":"Troubadour"},{"bank":5,"program":62,"name":"Wartz Piano1  HM"},{"bank":5,"program":63,"name":"Wooden E     WMF"},{"bank":5,"program":64,"name":"Wurlitzer104b HM"},{"bank":5,"program":65,"name":"Yamlitzer"},{"bank":5,"program":66,"name":"7th Sense     SK"},{"bank":5,"program":67,"name":"80sFM Analog  SK"},{"bank":5,"program":68,"name":"Aggreppo       T"},{"bank":5,"program":69,"name":"Analog Lute   HS"},{"bank":5,"program":70,"name":"Analog Quest  SK"},{"bank":5,"program":71,"name":"Aphazing      SK"},{"bank":5,"program":72,"name":"Bell like     RZ"},{"bank":5,"program":73,"name":"BestOfThe80s   T"},{"bank":5,"program":74,"name":"Blakes 7 Str  AT"},{"bank":5,"program":75,"name":"B-Lead        SK"},{"bank":5,"program":76,"name":"Bounty Synth"},{"bank":5,"program":77,"name":"Brass Comp    HM"},{"bank":5,"program":78,"name":"Brass-lead   SCD"},{"bank":5,"program":79,"name":"Brassy House  SK"},{"bank":5,"program":80,"name":"Bright Sync"},{"bank":5,"program":81,"name":"Brownies     WMF"},{"bank":5,"program":82,"name":"CareFull      RZ"},{"bank":5,"program":83,"name":"Caspoly      WMF"},{"bank":5,"program":84,"name":"Chamber High  HS"},{"bank":5,"program":85,"name":"Chamber Low   HS"},{"bank":5,"program":86,"name":"Chord-Hose     T"},{"bank":5,"program":87,"name":"Chord Revival SK"},{"bank":5,"program":88,"name":"Classic Dance"},{"bank":5,"program":89,"name":"Classic Synth"},{"bank":5,"program":90,"name":"Clavinetro    jh"},{"bank":5,"program":91,"name":"Clock&Bells   RZ"},{"bank":5,"program":92,"name":"Combi Saws    SK"},{"bank":5,"program":93,"name":"Compromise K  HM"},{"bank":5,"program":94,"name":"Concertino   SCD"},{"bank":5,"program":95,"name":"Cool Porta    HM"},{"bank":5,"program":96,"name":"Crawlers      SK"},{"bank":5,"program":97,"name":"Crispy Saw    SK"},{"bank":5,"program":98,"name":"CyberLeader   SK"},{"bank":5,"program":99,"name":"Dawn Organ"},{"bank":5,"program":100,"name":"Deep Synth    DK"},{"bank":5,"program":101,"name":"Delead It!    SK"},{"bank":5,"program":102,"name":"DirtyLead     SK"},{"bank":5,"program":103,"name":"D-NoiZer      SK"},{"bank":5,"program":104,"name":"DollarBells  ugh"},{"bank":5,"program":105,"name":"Dr. Motte      T"},{"bank":5,"program":106,"name":"Energee!      SK"},{"bank":5,"program":107,"name":"Enough Power   T"},{"bank":5,"program":108,"name":"EthnoPerc     SK"},{"bank":5,"program":109,"name":"Euro-Zeichen  HS"},{"bank":5,"program":110,"name":"ExploreChords SK"},{"bank":5,"program":111,"name":"Fat 8-Osc     SK"},{"bank":5,"program":112,"name":"Filigrano     SK"},{"bank":5,"program":113,"name":"FilterFM Keys"},{"bank":5,"program":114,"name":"FloorFilla    SK"},{"bank":5,"program":115,"name":"FM Chords     SK"},{"bank":5,"program":116,"name":"FM Melodies"},{"bank":5,"program":117,"name":"FMod Saws     SK"},{"bank":5,"program":118,"name":"FM-sono Saw"},{"bank":5,"program":119,"name":"French        RZ"},{"bank":5,"program":120,"name":"Fun Man"},{"bank":5,"program":121,"name":"Gated 80's"},{"bank":5,"program":122,"name":"Gattaca       SK"},{"bank":5,"program":123,"name":"Gimme Five!   SK"},{"bank":5,"program":124,"name":"Glitter Power HS"},{"bank":5,"program":125,"name":"Good Air      SK"},{"bank":5,"program":126,"name":"High Sequence jh"},{"bank":5,"program":127,"name":"HitMeQuick!   SK"},{"bank":6,"program":0,"name":"Human Touch   SK"},{"bank":6,"program":1,"name":"Ice Bells     SK"},{"bank":6,"program":2,"name":"Illbient Mind"},{"bank":6,"program":3,"name":"It's Digital"},{"bank":6,"program":4,"name":"Jembala      WMF"},{"bank":6,"program":5,"name":"JMX jun."},{"bank":6,"program":6,"name":"Juno Soul     DK"},{"bank":6,"program":7,"name":"KlingKlang'02 jh"},{"bank":6,"program":8,"name":"La Sirena     SK"},{"bank":6,"program":9,"name":"Late Ring     HS"},{"bank":6,"program":10,"name":"Leadrunner"},{"bank":6,"program":11,"name":"Legal Resins  HS"},{"bank":6,"program":12,"name":"LikeClinics  WMF"},{"bank":6,"program":13,"name":"Liquid Mel   WMF"},{"bank":6,"program":14,"name":"Liquid Var   WMF"},{"bank":6,"program":15,"name":"LoFi 1oscPoly"},{"bank":6,"program":16,"name":"LoFi Lead    WMF"},{"bank":6,"program":17,"name":"Minor Chord   RZ"},{"bank":6,"program":18,"name":"Modulizer     SK"},{"bank":6,"program":19,"name":"Move Sound"},{"bank":6,"program":20,"name":"My Ol' House  SK"},{"bank":6,"program":21,"name":"Net Profit    HS"},{"bank":6,"program":22,"name":"Neu * Utz     HM"},{"bank":6,"program":23,"name":"NewClassicLd  SK"},{"bank":6,"program":24,"name":"No. 5 lives    T"},{"bank":6,"program":25,"name":"OB-One Knobi  HS"},{"bank":6,"program":26,"name":"OBX Purple5 PROX"},{"bank":6,"program":27,"name":"Old * Uck     HM"},{"bank":6,"program":28,"name":"Organistic    SK"},{"bank":6,"program":29,"name":"Papathanasiou"},{"bank":6,"program":30,"name":"Patagonia     HS"},{"bank":6,"program":31,"name":"PEG Horns     HM"},{"bank":6,"program":32,"name":"Phased FM     SK"},{"bank":6,"program":33,"name":"Play It Sam!  jh"},{"bank":6,"program":34,"name":"Poly Flutes   HS"},{"bank":6,"program":35,"name":"PolySequencer"},{"bank":6,"program":36,"name":"PowerLead    WMF"},{"bank":6,"program":37,"name":"Harp"},{"bank":6,"program":38,"name":"PPG Nylons  PROX"},{"bank":6,"program":39,"name":"Pure Keys"},{"bank":6,"program":40,"name":"PWMaster      SK"},{"bank":6,"program":41,"name":"Qazzio        HS"},{"bank":6,"program":42,"name":"Qddicted!     SK"},{"bank":6,"program":43,"name":"Qtronix      ugh"},{"bank":6,"program":44,"name":"Quake FM      SK"},{"bank":6,"program":45,"name":"Quintage       T"},{"bank":6,"program":46,"name":"Quinter 007   SK"},{"bank":6,"program":47,"name":"RaveLover     SK"},{"bank":6,"program":48,"name":"Really Insane"},{"bank":6,"program":49,"name":"Romeo         DK"},{"bank":6,"program":50,"name":"RoundTheHorn  HS"},{"bank":6,"program":51,"name":"SawTheLight   SK"},{"bank":6,"program":52,"name":"Sax And Dregs"},{"bank":6,"program":53,"name":"Schubduese     T"},{"bank":6,"program":54,"name":"ShatterWaves  SK"},{"bank":6,"program":55,"name":"Siegessaeule   T"},{"bank":6,"program":56,"name":"Simple Melo   jh"},{"bank":6,"program":57,"name":"Smash It!     SK"},{"bank":6,"program":58,"name":"Solo Harp"},{"bank":6,"program":59,"name":"Speed"},{"bank":6,"program":60,"name":"Spice         SK"},{"bank":6,"program":61,"name":"Spring Clean"},{"bank":6,"program":62,"name":"Stabs!"},{"bank":6,"program":63,"name":"Stack with you"},{"bank":6,"program":64,"name":"SteaLead      SK"},{"bank":6,"program":65,"name":"String Poly   HS"},{"bank":6,"program":66,"name":"String Thing  HS"},{"bank":6,"program":67,"name":"Stuermer 1   WMF"},{"bank":6,"program":68,"name":"Stylotub      SK"},{"bank":6,"program":69,"name":"SyncCity"},{"bank":6,"program":70,"name":"Synchronic    SK"},{"bank":6,"program":71,"name":"SynthPiano    SK"},{"bank":6,"program":72,"name":"Synth X"},{"bank":6,"program":73,"name":"Tea @ Eight   HS"},{"bank":6,"program":74,"name":"Tech.Lead 1"},{"bank":6,"program":75,"name":"Tech.Lead 2"},{"bank":6,"program":76,"name":"TelephoneSyn ugh"},{"bank":6,"program":77,"name":"Telepromter  ugh"},{"bank":6,"program":78,"name":"The Big 80s"},{"bank":6,"program":79,"name":"The Cutter    SK"},{"bank":6,"program":80,"name":"Titanomania   SK"},{"bank":6,"program":81,"name":"TranceHarp    HM"},{"bank":6,"program":82,"name":"Trance Plant  HS"},{"bank":6,"program":83,"name":"Trancer       SK"},{"bank":6,"program":84,"name":"TrashCan!     SK"},{"bank":6,"program":85,"name":"TributeTo DX WMF"},{"bank":6,"program":86,"name":"Tron Flutes   HM"},{"bank":6,"program":87,"name":"Tsching Lead   T"},{"bank":6,"program":88,"name":"TuBerkel      DK"},{"bank":6,"program":89,"name":"Typ Reso      RZ"},{"bank":6,"program":90,"name":"UltraFatPoly WMF"},{"bank":6,"program":91,"name":"UltraSynC     jh"},{"bank":6,"program":92,"name":"UltraWave     SK"},{"bank":6,"program":93,"name":"Unisono Bass  DK"},{"bank":6,"program":94,"name":"Utopia!       SK"},{"bank":6,"program":95,"name":"VeloFreak     jh"},{"bank":6,"program":96,"name":"Vintage Days  SK"},{"bank":6,"program":97,"name":"VintageSpringWMF"},{"bank":6,"program":98,"name":"Vitalica      SK"},{"bank":6,"program":99,"name":"Wank         WMF"},{"bank":6,"program":100,"name":"Wank Lead    WMF"},{"bank":6,"program":101,"name":"Wanna Noise?? jh"},{"bank":6,"program":102,"name":"Warm PWM Lead SK"},{"bank":6,"program":103,"name":"Warm Verse"},{"bank":6,"program":104,"name":"WaveLayer     SK"},{"bank":6,"program":105,"name":"Wells'Tripod WMF"},{"bank":6,"program":106,"name":"YourChords    SK"},{"bank":6,"program":107,"name":"Zapper        SK"},{"bank":6,"program":108,"name":"Zawichords    HS"},{"bank":6,"program":109,"name":"Zing Thing    HS"},{"bank":6,"program":110,"name":"Zippy 2       HM"},{"bank":6,"program":111,"name":"Zombie Nation  T"},{"bank":6,"program":112,"name":"50s Pad"},{"bank":6,"program":113,"name":"Airpad"},{"bank":6,"program":114,"name":"AirSpacePad   SK"},{"bank":6,"program":115,"name":"AmbientSweep  SK"},{"bank":6,"program":116,"name":"Analog Pad 1"},{"bank":6,"program":117,"name":"Analog Pad 2"},{"bank":6,"program":118,"name":"Analog Pad 3"},{"bank":6,"program":119,"name":"Angel Pad"},{"bank":6,"program":120,"name":"Antarktis Pad jh"},{"bank":6,"program":121,"name":"Archangel"},{"bank":6,"program":122,"name":"Attacke      WMF"},{"bank":6,"program":123,"name":"BackStrings  WMF"},{"bank":6,"program":124,"name":"Bandpad      ugh"},{"bank":6,"program":125,"name":"BandSpass"},{"bank":6,"program":126,"name":"Bend Pad"},{"bank":6,"program":127,"name":"Big Bad Pad"},{"bank":7,"program":0,"name":"Captain Kirk"},{"bank":7,"program":1,"name":"ChopperSweep"},{"bank":7,"program":2,"name":"ComputerGames"},{"bank":7,"program":3,"name":"Cyber Farm"},{"bank":7,"program":4,"name":"DCS3 Bubbles"},{"bank":7,"program":5,"name":"Duck Lambada"},{"bank":7,"program":6,"name":"EffEmmEffIxx"},{"bank":7,"program":7,"name":"Fade FX."},{"bank":7,"program":8,"name":"Final Choice"},{"bank":7,"program":9,"name":"FlangedNoise WMF"},{"bank":7,"program":10,"name":"FlangeplosionWMF"},{"bank":7,"program":11,"name":"Flying Teapot"},{"bank":7,"program":12,"name":"FM Comb FX"},{"bank":7,"program":13,"name":"FM Noises"},{"bank":7,"program":14,"name":"Gastrology"},{"bank":7,"program":15,"name":"HawaiGlider"},{"bank":7,"program":16,"name":"Into Mouth"},{"bank":7,"program":17,"name":"LFO  Speeddwn"},{"bank":7,"program":18,"name":"LFO  Speedup"},{"bank":7,"program":19,"name":"LilaBells"},{"bank":7,"program":20,"name":"Living Water"},{"bank":7,"program":21,"name":"LosAngeles2019"},{"bank":7,"program":22,"name":"Maschinenraum"},{"bank":7,"program":23,"name":"Newtronic"},{"bank":7,"program":24,"name":"Noise Move"},{"bank":7,"program":25,"name":"NoiseSlapper"},{"bank":7,"program":26,"name":"NoRobotsHere"},{"bank":7,"program":27,"name":"Power Down"},{"bank":7,"program":28,"name":"Q Wars"},{"bank":7,"program":29,"name":"Reverse-ecioV"},{"bank":7,"program":30,"name":"RingDaBell"},{"bank":7,"program":31,"name":"Ring Steps"},{"bank":7,"program":32,"name":"Rise&Fall"},{"bank":7,"program":33,"name":"Robotalk =:b"},{"bank":7,"program":34,"name":"Score FX Pad"},{"bank":7,"program":35,"name":"Shoot Goose!"},{"bank":7,"program":36,"name":"Shore"},{"bank":7,"program":37,"name":"Short Moment"},{"bank":7,"program":38,"name":"Shot Tool"},{"bank":7,"program":39,"name":"Sine Down"},{"bank":7,"program":40,"name":"Skywalker"},{"bank":7,"program":41,"name":"SubSineSweep WMF"},{"bank":7,"program":42,"name":"The Assault"},{"bank":7,"program":43,"name":"The BORG"},{"bank":7,"program":44,"name":"Thunderain"},{"bank":7,"program":45,"name":"ThunderDrums"},{"bank":7,"program":46,"name":"Tron Ring Game"},{"bank":7,"program":47,"name":"Tuxedosun"},{"bank":7,"program":48,"name":"Why?"},{"bank":7,"program":49,"name":"Wind Athmo"},{"bank":7,"program":50,"name":"WipeOut"},{"bank":7,"program":51,"name":"ZischDeep"},{"bank":7,"program":52,"name":"Agogo Scrape"},{"bank":7,"program":53,"name":"All Thumbs"},{"bank":7,"program":54,"name":"AnalogBongo 1"},{"bank":7,"program":55,"name":"Analog HH op"},{"bank":7,"program":56,"name":"AnalogStick 1"},{"bank":7,"program":57,"name":"Bass Drum    WMF"},{"bank":7,"program":58,"name":"BD 90ies Drum"},{"bank":7,"program":59,"name":"BD 808 @ 2002"},{"bank":7,"program":60,"name":"BD analg80ies"},{"bank":7,"program":61,"name":"BD analog 02"},{"bank":7,"program":62,"name":"BD analog 03"},{"bank":7,"program":63,"name":"BD AnalogRand"},{"bank":7,"program":64,"name":"BD Club 01"},{"bank":7,"program":65,"name":"BD Deep Zap"},{"bank":7,"program":66,"name":"BD Disto 808"},{"bank":7,"program":67,"name":"BD DoorSlam"},{"bank":7,"program":68,"name":"BD Hardcore"},{"bank":7,"program":69,"name":"BD HighKick"},{"bank":7,"program":70,"name":"BD On Stage"},{"bank":7,"program":71,"name":"BD Plock!"},{"bank":7,"program":72,"name":"BD Smack It!"},{"bank":7,"program":73,"name":"BD SpectroZap"},{"bank":7,"program":74,"name":"BD SubDrum"},{"bank":7,"program":75,"name":"BD Woof&Pock"},{"bank":7,"program":76,"name":"BD ZapDrum"},{"bank":7,"program":77,"name":"Bended Metal"},{"bank":7,"program":78,"name":"Brush HH"},{"bank":7,"program":79,"name":"Clap 01"},{"bank":7,"program":80,"name":"Clap 03"},{"bank":7,"program":81,"name":"Clap 04"},{"bank":7,"program":82,"name":"ClapsMuehle"},{"bank":7,"program":83,"name":"Deep Bell"},{"bank":7,"program":84,"name":"DivX Pad"},{"bank":7,"program":85,"name":"DoubleHHclose"},{"bank":7,"program":86,"name":"Dry BD"},{"bank":7,"program":87,"name":"Dry BD 2"},{"bank":7,"program":88,"name":"FM HHcl"},{"bank":7,"program":89,"name":"FM HHop"},{"bank":7,"program":90,"name":"HammerBell"},{"bank":7,"program":91,"name":"HH closed 01"},{"bank":7,"program":92,"name":"HH closed 02"},{"bank":7,"program":93,"name":"HH closed 03"},{"bank":7,"program":94,"name":"HH closed 04"},{"bank":7,"program":95,"name":"HH closed 05"},{"bank":7,"program":96,"name":"HH closed 06"},{"bank":7,"program":97,"name":"HH closed 08"},{"bank":7,"program":98,"name":"HH closed 09"},{"bank":7,"program":99,"name":"HH open 01"},{"bank":7,"program":100,"name":"HH open 02"},{"bank":7,"program":101,"name":"HH open 03"},{"bank":7,"program":102,"name":"HH open 06"},{"bank":7,"program":103,"name":"HH open 07"},{"bank":7,"program":104,"name":"HH open 08"},{"bank":7,"program":105,"name":"High PulseZap"},{"bank":7,"program":106,"name":"PPG Zaps"},{"bank":7,"program":107,"name":"Punchy SN"},{"bank":7,"program":108,"name":"Q-La Shaker"},{"bank":7,"program":109,"name":"Skellington"},{"bank":7,"program":110,"name":"SN NeoAnalog"},{"bank":7,"program":111,"name":"SN Real Snare"},{"bank":7,"program":112,"name":"SN RimSnare"},{"bank":7,"program":113,"name":"SN SnAir ;-)"},{"bank":7,"program":114,"name":"SN Thinny"},{"bank":7,"program":115,"name":"SN Zappada"},{"bank":7,"program":116,"name":"SN ZapSnare"},{"bank":7,"program":117,"name":"Surrr"},{"bank":7,"program":118,"name":"Tombola 1"},{"bank":7,"program":119,"name":"TR66 Hihat   WMF"},{"bank":7,"program":120,"name":"Various Metal"},{"bank":7,"program":121,"name":"Woodpicker"},{"bank":7,"program":122,"name":"Zap 1"},{"bank":7,"program":123,"name":"Zap 2"},{"bank":7,"program":124,"name":"Zap BD"},{"bank":7,"program":125,"name":"Zappy :)"},{"bank":7,"program":126,"name":"Zap Stick"},{"bank":7,"program":127,"name":"Init"}]},{"schema":"tabby-device/1","version":"0.1","id":"waldorf-pulse-2","name":"Waldorf Pulse 2","maker":"Waldorf","channel":{"default":null,"note":"Global MIDI Channel: OMNI or 1..16 (omni receives all, sends on 1)."},"programChange":{"supported":true,"displayBase":1,"programs":100,"bankFormat":"hundreds","pad":3,"bankSelect":{"scheme":"cc32","banks":[{"index":0,"name":"1..100","msb":null,"lsb":0},{"index":1,"name":"101..200","msb":null,"lsb":1},{"index":2,"name":"201..300","msb":null,"lsb":2},{"index":3,"name":"301..400","msb":null,"lsb":3},{"index":4,"name":"401..500","msb":null,"lsb":4}]},"gapMs":0,"gapAfter":"program","note":"Display 001..500 as one range. Firmware readme (v1.14): only bank LSB (CC 32) is read, banks 0..4 = 001..100, 101..200, 201..300, 301..400, 401..500; CC 0 ignored; the program number is clamped to 0..99 inside the bank; the bank stays latched until Reset All Controllers. PC 0 = 001 per user tests (not stated by Waldorf). Program 500 generates a random patch."},"controllers":[{"cc":1,"name":"Modulation Wheel","min":0,"max":127},{"cc":5,"name":"Glide Rate","min":0,"max":127},{"cc":10,"name":"VCA Panning","min":0,"max":127},{"cc":14,"name":"Filter Env Attack","min":0,"max":127},{"cc":15,"name":"Filter Env Decay","min":0,"max":127},{"cc":16,"name":"Filter Env Sustain","min":0,"max":127},{"cc":17,"name":"Filter Env Release","min":0,"max":127},{"cc":18,"name":"Amp Env Attack","min":0,"max":127},{"cc":19,"name":"Amp Env Decay","min":0,"max":127},{"cc":20,"name":"Amp Env Sustain","min":0,"max":127},{"cc":21,"name":"Amp Env Release","min":0,"max":127},{"cc":24,"name":"LFO 1 Speed","min":0,"max":127},{"cc":25,"name":"LFO 1 Shape","min":0,"max":127},{"cc":26,"name":"LFO 2 Speed","min":0,"max":127},{"cc":27,"name":"LFO 2 Delay","min":0,"max":127},{"cc":29,"name":"Filter Env Trigger","min":0,"max":127},{"cc":31,"name":"Amp Env Trigger","min":0,"max":127},{"cc":35,"name":"Osc 1 Pulsewidth","min":0,"max":127},{"cc":36,"name":"Osc 2 Semitone","min":0,"max":127},{"cc":37,"name":"Osc 2 Detune","min":0,"max":127},{"cc":38,"name":"Osc 2 Shape","min":0,"max":127},{"cc":39,"name":"Osc 2 Pulsewidth","min":0,"max":127},{"cc":40,"name":"Osc 2 Keytrack","min":0,"max":127},{"cc":41,"name":"Osc 3 Sync","min":0,"max":127},{"cc":42,"name":"Osc 3 Semitone","min":0,"max":127},{"cc":43,"name":"Osc 3 Detune","min":0,"max":127},{"cc":44,"name":"Osc 3 Shape","min":0,"max":127},{"cc":45,"name":"Osc 1 Level","min":0,"max":127},{"cc":46,"name":"Osc 2 Level","min":0,"max":127},{"cc":47,"name":"Osc 3 Level","min":0,"max":127},{"cc":48,"name":"Noise Level","min":0,"max":127},{"cc":49,"name":"VCF Type","min":0,"max":127},{"cc":50,"name":"VCF Cutoff","min":0,"max":127},{"cc":51,"name":"VCF Keytrack","min":0,"max":127},{"cc":52,"name":"VCF Env Amount","min":0,"max":127},{"cc":53,"name":"VCF Velocity","min":0,"max":127},{"cc":56,"name":"VCF Resonance","min":0,"max":127},{"cc":57,"name":"VCA Volume","min":0,"max":127},{"cc":58,"name":"VCA Velocity","min":0,"max":127},{"cc":62,"name":"Glide Mode","min":0,"max":127},{"cc":64,"name":"Sustain Pedal","min":0,"max":127},{"cc":70,"name":"Osc 1 Semitone","min":0,"max":127},{"cc":71,"name":"Osc 1 Detune","min":0,"max":127},{"cc":72,"name":"Osc 3 Routing","min":0,"max":127},{"cc":73,"name":"Osc 1 Keytrack","min":0,"max":127},{"cc":74,"name":"Filter Env Loop","min":0,"max":127},{"cc":75,"name":"Amp Env Loop","min":0,"max":127},{"cc":76,"name":"VCA Drive","min":0,"max":127},{"cc":77,"name":"VCA Drive Curve","min":0,"max":127},{"cc":79,"name":"Arp Active","min":0,"max":127},{"cc":80,"name":"Arp Range","min":0,"max":127},{"cc":81,"name":"Arp Tempo","min":0,"max":127},{"cc":82,"name":"Arp Clock","min":0,"max":127},{"cc":83,"name":"Arp Mode","min":0,"max":127},{"cc":84,"name":"Step Duration","min":0,"max":127},{"cc":85,"name":"Arp Swing","min":0,"max":127},{"cc":86,"name":"Arp Delay","min":0,"max":127},{"cc":87,"name":"Pattern Length","min":0,"max":127},{"cc":88,"name":"Accent Control","min":0,"max":127},{"cc":90,"name":"Mod 5 Source","min":0,"max":127},{"cc":91,"name":"Mod 5 Amount","min":0,"max":127},{"cc":92,"name":"Mod 5 Target","min":0,"max":127},{"cc":93,"name":"Mod 6 Source","min":0,"max":127},{"cc":94,"name":"Mod 6 Amount","min":0,"max":127},{"cc":95,"name":"Mod 6 Target","min":0,"max":127},{"cc":96,"name":"Mod 7 Source","min":0,"max":127},{"cc":97,"name":"Mod 7 Amount","min":0,"max":127},{"cc":98,"name":"Mod 7 Target","min":0,"max":127},{"cc":99,"name":"Mod 8 Source","min":0,"max":127},{"cc":100,"name":"Mod 8 Amount","min":0,"max":127},{"cc":101,"name":"Mod 8 Target","min":0,"max":127},{"cc":102,"name":"Unison Detune","min":0,"max":127},{"cc":103,"name":"Osc 1 Amp Env Fade","min":0,"max":127},{"cc":104,"name":"Osc 2 Amp Env Fade","min":0,"max":127},{"cc":105,"name":"Bend Upwards","min":0,"max":127},{"cc":106,"name":"Bend Down","min":0,"max":127},{"cc":108,"name":"Mod 1 Source","min":0,"max":127},{"cc":109,"name":"Mod 1 Amount","min":0,"max":127},{"cc":110,"name":"Mod 1 Target","min":0,"max":127},{"cc":111,"name":"Mod 2 Source","min":0,"max":127},{"cc":112,"name":"Mod 2 Amount","min":0,"max":127},{"cc":113,"name":"Mod 2 Target","min":0,"max":127},{"cc":114,"name":"Mod 3 Source","min":0,"max":127},{"cc":115,"name":"Mod 3 Amount","min":0,"max":127},{"cc":116,"name":"Mod 3 Target","min":0,"max":127},{"cc":117,"name":"Mod 4 Source","min":0,"max":127},{"cc":118,"name":"Mod 4 Amount","min":0,"max":127},{"cc":119,"name":"Mod 4 Target","min":0,"max":127},{"cc":120,"name":"All Sound Off","min":0,"max":0},{"cc":121,"name":"Reset All Controllers","min":0,"max":0},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Global: MIDI Channel.","No program-change enable exists; bank LSB (CC 32) 0..4 selects the hundred, latched until Reset All Controllers.","Program 500 is the random patch generator."],"notes":["Factory names from Waldorf's preset list (2016-07-26): 001..410 named, 411..499 INIT, 500 RANDOM.","A secondary changelog says CC 59 = preset panning against the manual's CC 10; left as the manual says."],"sources":[{"title":"Pulse 2 user manual, revision 1.0 (September 2013)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/kfHqRdr7Jd4FQoj","detail":"pp. 13-14, 40-45, 58, 61-63, 67"},{"title":"Pulse 2 factory preset list (2016-07-26)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/egSEKaiSn4jk8Lq","detail":"pages 1-2, by number"},{"title":"Pulse 2 firmware bundle with the cumulative readme (bank select in the v1.14 entry)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/n6mxaCwWFZ2yeB2","detail":"Pulse_2_Firmware_V1.21/readme.txt"},{"title":"Elektronauts user test of bank/PC numbering (secondary)","url":"https://www.elektronauts.com/t/switching-programs-on-the-pulse-2/3361?page=2","detail":"PC 0 = 001"}],"unverified":["channel.default","programChange.displayBase (user tests only)","CC 0 handling on firmware 1.21","CC 10 vs CC 59 panning"],"presets":[{"bank":0,"program":0,"name":"TECH STAB RL","category":"LEAD"},{"bank":0,"program":1,"name":"I","category":"MONO"},{"bank":0,"program":2,"name":"SWIMGER DK","category":"ARP"},{"bank":0,"program":3,"name":"TREIBGUT JD","category":"ARP"},{"bank":0,"program":4,"name":"CATHERINE IW","category":"BASS"},{"bank":0,"program":5,"name":"CHORUS","category":"BASS"},{"bank":0,"program":6,"name":"DER MUSSO DK","category":"BASS"},{"bank":0,"program":7,"name":"BAD ROCKER RL","category":"LEAD"},{"bank":0,"program":8,"name":"WITH DELAY","category":"LEAD"},{"bank":0,"program":9,"name":"SWEEPER","category":"PAD"},{"bank":0,"program":10,"name":"WHITE DOORS","category":"PAD"},{"bank":0,"program":11,"name":"ACIDIZER JD","category":"ARP"},{"bank":0,"program":12,"name":"AUTOBAHN","category":"BASS"},{"bank":0,"program":13,"name":"BITTERSWEET JD","category":"ARP"},{"bank":0,"program":14,"name":"DOPPLER JD","category":"ARP"},{"bank":0,"program":15,"name":"OVERDRIVEN","category":"ARP"},{"bank":0,"program":16,"name":"UNISON","category":"PAD"},{"bank":0,"program":17,"name":"MONOLAKE TD CG","category":"ATMO"},{"bank":0,"program":18,"name":"TIME IS CHNG","category":"ATMO"},{"bank":0,"program":19,"name":"3OSC 101 IW","category":"BASS"},{"bank":0,"program":20,"name":"ARTROCKBASS CG","category":"BASS"},{"bank":0,"program":21,"name":"BASSIC","category":"BASS"},{"bank":0,"program":22,"name":"BLOODPR@SS DK","category":"BASS"},{"bank":0,"program":23,"name":"JMJ SEQBASS CG","category":"BASS"},{"bank":0,"program":24,"name":"LIVELY","category":"BASS"},{"bank":0,"program":25,"name":"REZ SWEEP 1 IW","category":"BASS"},{"bank":0,"program":26,"name":"UNIPULSE DK","category":"BASS"},{"bank":0,"program":27,"name":"KICK","category":"DRUM"},{"bank":0,"program":28,"name":"SIMMONS SD1 CG","category":"DRUM"},{"bank":0,"program":29,"name":"SNAREROLL","category":"DRUM"},{"bank":0,"program":30,"name":"AUTOBAHNEN TEK","category":"FX"},{"bank":0,"program":31,"name":"D-FEKT TEK","category":"FX"},{"bank":0,"program":32,"name":"APW PIANO IW","category":"KEYS"},{"bank":0,"program":33,"name":"FRESH DK","category":"KEYS"},{"bank":0,"program":34,"name":"ORGANICS 1 CG","category":"KEYS"},{"bank":0,"program":35,"name":"PLUCKED","category":"KEYS"},{"bank":0,"program":36,"name":"PLUCKY","category":"KEYS"},{"bank":0,"program":37,"name":"LFO","category":"LEAD"},{"bank":0,"program":38,"name":"NAUGHTY2 DK","category":"LEAD"},{"bank":0,"program":39,"name":"NONSTER PULSE","category":"LEAD"},{"bank":0,"program":40,"name":"SAWTEETH","category":"LEAD"},{"bank":0,"program":41,"name":"SINGLE SAW","category":"LEAD"},{"bank":0,"program":42,"name":"SINGING SAW","category":"MONO"},{"bank":0,"program":43,"name":"STANDARD SYNC","category":"MONO"},{"bank":0,"program":44,"name":"CLASSIC","category":"MONO"},{"bank":0,"program":45,"name":"DRIVE","category":"LEAD"},{"bank":0,"program":46,"name":"THICK AND FAT","category":"LEAD"},{"bank":0,"program":47,"name":"FIFTH PULSE","category":"LEAD"},{"bank":0,"program":48,"name":"MACHINE","category":"MONO"},{"bank":0,"program":49,"name":"WEIRD SCHON","category":"MONO"},{"bank":0,"program":50,"name":"SQUARE SYNC","category":"MONO"},{"bank":0,"program":51,"name":"SQUARED","category":"MONO"},{"bank":0,"program":52,"name":"SYNC ATTACK","category":"MONO"},{"bank":0,"program":53,"name":"SWEET SYNC","category":"MONO"},{"bank":0,"program":54,"name":"SOFT DRIVE","category":"MONO"},{"bank":0,"program":55,"name":"FUZZY FUZZ","category":"FX"},{"bank":0,"program":56,"name":"CROSSMOD","category":"LEAD"},{"bank":0,"program":57,"name":"STEREO SYNC","category":"LEAD"},{"bank":0,"program":58,"name":"GLOBAL WARMING","category":"ATMO"},{"bank":0,"program":59,"name":"MINOR SWEEP","category":"ATMO"},{"bank":0,"program":60,"name":"DOUBLE CHORD","category":"PAD"},{"bank":0,"program":61,"name":"FIFTH","category":"PAD"},{"bank":0,"program":62,"name":"ROB STEREO","category":"FX"},{"bank":0,"program":63,"name":"SOFT 5TH & 7TH","category":"FX"},{"bank":0,"program":64,"name":"CLASSIC","category":"BASS"},{"bank":0,"program":65,"name":"FILTERED","category":"BASS"},{"bank":0,"program":66,"name":"EIGHTIES","category":"BASS"},{"bank":0,"program":67,"name":"NINETIES","category":"BASS"},{"bank":0,"program":68,"name":"DISTORTED","category":"BASS"},{"bank":0,"program":69,"name":"DEEP & BORING","category":"BASS"},{"bank":0,"program":70,"name":"SUBSTANDARD","category":"BASS"},{"bank":0,"program":71,"name":"NOT A CLAVINET","category":"MONO"},{"bank":0,"program":72,"name":"SQUARE","category":"BASS"},{"bank":0,"program":73,"name":"HOLLOW ACID","category":"BASS"},{"bank":0,"program":74,"name":"ANALOG BELL","category":"FX"},{"bank":0,"program":75,"name":"BELLISSIMO","category":"FX"},{"bank":0,"program":76,"name":"HIT ON METAL","category":"FX"},{"bank":0,"program":77,"name":"BASS BY ROB","category":"BASS"},{"bank":0,"program":78,"name":"ANLOG CIRCUIT","category":"BASS"},{"bank":0,"program":79,"name":"MY FAVOURITE","category":"ARP"},{"bank":0,"program":80,"name":"PORTAMENTO","category":"ARP"},{"bank":0,"program":81,"name":"CLICKETY-CLICK","category":"ARP"},{"bank":0,"program":82,"name":"FLUTE","category":"ARP"},{"bank":0,"program":83,"name":"MESMERIZED","category":"ARP"},{"bank":0,"program":84,"name":"JUST FILTER","category":"FX"},{"bank":0,"program":85,"name":"PLAIN","category":"ARP"},{"bank":0,"program":86,"name":"FAST RUN","category":"ARP"},{"bank":0,"program":87,"name":"CROSSMOD","category":"ARP"},{"bank":0,"program":88,"name":"CARIBBEAN JIVE","category":"ARP"},{"bank":0,"program":89,"name":"TOO NORMAL","category":"ARP"},{"bank":0,"program":90,"name":"TOO HARSH","category":"FX"},{"bank":0,"program":91,"name":"UNDER WATER","category":"FX"},{"bank":0,"program":92,"name":"RHYTHM'N","category":"BASS"},{"bank":0,"program":93,"name":"BOTTOM KICK","category":"DRUM"},{"bank":0,"program":94,"name":"ANALOG","category":"DRUM"},{"bank":0,"program":95,"name":"NOISE HIT","category":"DRUM"},{"bank":0,"program":96,"name":"TRIGGER HAPPY","category":"FX"},{"bank":0,"program":97,"name":"SETI SUCCESS","category":"FX"},{"bank":0,"program":98,"name":"ADDTHEKICK RL","category":"ARP"},{"bank":0,"program":99,"name":"ARCADE GAME","category":"ARP"},{"bank":1,"program":0,"name":"CHEAP T-BEE RL","category":"ARP"},{"bank":1,"program":1,"name":"DIGIDI JD","category":"ARP"},{"bank":1,"program":2,"name":"DREAM SEQ CG","category":"ARP"},{"bank":1,"program":3,"name":"ENGINE RUN CG","category":"ARP"},{"bank":1,"program":4,"name":"ION DANCE 1 CG","category":"ARP"},{"bank":1,"program":5,"name":"ION DANCE 2 CG","category":"ARP"},{"bank":1,"program":6,"name":"JMJ ARPBASS CG","category":"ARP"},{"bank":1,"program":7,"name":"JUMP 'N RUN","category":"ARP"},{"bank":1,"program":8,"name":"KRAFT-ARP CG","category":"ARP"},{"bank":1,"program":9,"name":"MAGNETICS 1 CG","category":"ARP"},{"bank":1,"program":10,"name":"MAGNETICS 2 CG","category":"ARP"},{"bank":1,"program":11,"name":"MAGNETICS 3 CG","category":"ARP"},{"bank":1,"program":12,"name":"MAGNETICS 4 CG","category":"ARP"},{"bank":1,"program":13,"name":"MAGNETICS 5 CG","category":"ARP"},{"bank":1,"program":14,"name":"MAGNETICS 6 CG","category":"ARP"},{"bank":1,"program":15,"name":"MAID OF","category":"ARP"},{"bank":1,"program":16,"name":"MEEDLES DK","category":"ARP"},{"bank":1,"program":17,"name":"MOD ZAPS JD","category":"ARP"},{"bank":1,"program":18,"name":"OUT OF SYNC","category":"ARP"},{"bank":1,"program":19,"name":"P2 DANCIMG CG","category":"ARP"},{"bank":1,"program":20,"name":"PARAPHONIC","category":"PAD"},{"bank":1,"program":21,"name":"PLUCKY","category":"ARP"},{"bank":1,"program":22,"name":"PUL5E KRAFT CG","category":"ARP"},{"bank":1,"program":23,"name":"REZOMACHINE RL","category":"ARP"},{"bank":1,"program":24,"name":"ROBOT DANCE CG","category":"ARP"},{"bank":1,"program":25,"name":"ROBOTIC","category":"ARP"},{"bank":1,"program":26,"name":"SHORTING TEK","category":"ARP"},{"bank":1,"program":27,"name":"SINPEGGIO JD","category":"ARP"},{"bank":1,"program":28,"name":"SPIRITUALS CG","category":"ARP"},{"bank":1,"program":29,"name":"SWINGER2 DK","category":"ARP"},{"bank":1,"program":30,"name":"TRASHER DK","category":"ARP"},{"bank":1,"program":31,"name":"ULTRAMOD RL","category":"ARP"},{"bank":1,"program":32,"name":"UNRUHE DK","category":"ARP"},{"bank":1,"program":33,"name":"XTRAKTION 1 CG","category":"ARP"},{"bank":1,"program":34,"name":"XTRAKTION 2 CG","category":"ARP"},{"bank":1,"program":35,"name":"XTRAKTION 3 CG","category":"ARP"},{"bank":1,"program":36,"name":"XTRAKTION 4 CG","category":"ARP"},{"bank":1,"program":37,"name":"DE PROFUNDISCG","category":"ATMO"},{"bank":1,"program":38,"name":"ELDRITCHIAN CG","category":"ATMO"},{"bank":1,"program":39,"name":"HOLD & PRESS","category":"ATMO"},{"bank":1,"program":40,"name":"METAMORPHIC CG","category":"ATMO"},{"bank":1,"program":41,"name":"PRESS&WAIT DK","category":"ATMO"},{"bank":1,"program":42,"name":"SWISS ALPES CG","category":"ATMO"},{"bank":1,"program":43,"name":"3 SAW DK","category":"BASS"},{"bank":1,"program":44,"name":"3OCT","category":"BASS"},{"bank":1,"program":45,"name":"ACIDIC BS 1 IW","category":"BASS"},{"bank":1,"program":46,"name":"ACIDIC BS 2 IW","category":"BASS"},{"bank":1,"program":47,"name":"ACIDIC BS 3 IW","category":"BASS"},{"bank":1,"program":48,"name":"ANALOGIQUE1 CG","category":"BASS"},{"bank":1,"program":49,"name":"ANALOGIQUE2 CG","category":"BASS"},{"bank":1,"program":50,"name":"ANALOGIQUE3 CG","category":"BASS"},{"bank":1,"program":51,"name":"ANALOGIQUE4 CG","category":"BASS"},{"bank":1,"program":52,"name":"ANALOGIQUE5 CG","category":"BASS"},{"bank":1,"program":53,"name":"ANALOGUE","category":"BASS"},{"bank":1,"program":54,"name":"ART OF","category":"BASS"},{"bank":1,"program":55,"name":"ATOMIC","category":"BASS"},{"bank":1,"program":56,"name":"BASSTAR","category":"BASS"},{"bank":1,"program":57,"name":"BLOODPR@SS2 DK","category":"BASS"},{"bank":1,"program":58,"name":"BLOODPR@SS3 DK","category":"BASS"},{"bank":1,"program":59,"name":"BRAIN SALAD IW","category":"BASS"},{"bank":1,"program":60,"name":"BROKEN","category":"BASS"},{"bank":1,"program":61,"name":"BUTTERBASS JD","category":"BASS"},{"bank":1,"program":62,"name":"CRISPY","category":"BASS"},{"bank":1,"program":63,"name":"DEEP","category":"BASS"},{"bank":1,"program":64,"name":"DUBBASS","category":"BASS"},{"bank":1,"program":65,"name":"DUBBY DK","category":"BASS"},{"bank":1,"program":66,"name":"DUBBY2 DK","category":"BASS"},{"bank":1,"program":67,"name":"ECHO","category":"BASS"},{"bank":1,"program":68,"name":"ELECTRO ORG RL","category":"BASS"},{"bank":1,"program":69,"name":"FIFTK","category":"BASS"},{"bank":1,"program":70,"name":"FREQUENCY RL","category":"BASS"},{"bank":1,"program":71,"name":"FUZZ BWZZ","category":"BASS"},{"bank":1,"program":72,"name":"FUZZY SAW IW","category":"BASS"},{"bank":1,"program":73,"name":"GIANT","category":"BASS"},{"bank":1,"program":74,"name":"J.D.BASS DK","category":"BASS"},{"bank":1,"program":75,"name":"JUNAUTICA JD","category":"BASS"},{"bank":1,"program":76,"name":"JUNOPULSE DK","category":"BASS"},{"bank":1,"program":77,"name":"JUNOPULSE2 DK","category":"BASS"},{"bank":1,"program":78,"name":"JUNOPULSE3 DK","category":"BASS"},{"bank":1,"program":79,"name":"KNOCK","category":"BASS"},{"bank":1,"program":80,"name":"LIQUID","category":"BASS"},{"bank":1,"program":81,"name":"MASSIVE JD","category":"BASS"},{"bank":1,"program":82,"name":"MEVER MIND DK","category":"BASS"},{"bank":1,"program":83,"name":"MODERN","category":"BASS"},{"bank":1,"program":84,"name":"MOOGY DK","category":"BASS"},{"bank":1,"program":85,"name":"POOG DK","category":"BASS"},{"bank":1,"program":86,"name":"PULSE XOX DK","category":"BASS"},{"bank":1,"program":87,"name":"PULSER DK","category":"BASS"},{"bank":1,"program":88,"name":"PWM","category":"BASS"},{"bank":1,"program":89,"name":"RESOBASS JD","category":"BASS"},{"bank":1,"program":90,"name":"RETRO","category":"BASS"},{"bank":1,"program":91,"name":"REZ SWEEP 2 IW","category":"BASS"},{"bank":1,"program":92,"name":"SHORT","category":"BASS"},{"bank":1,"program":93,"name":"SINGSANG JD","category":"BASS"},{"bank":1,"program":94,"name":"SNAPPY SAWS IW","category":"BASS"},{"bank":1,"program":95,"name":"SUB","category":"BASS"},{"bank":1,"program":96,"name":"SUB","category":"BASS"},{"bank":1,"program":97,"name":"TB SOLO JD","category":"BASS"},{"bank":1,"program":98,"name":"VAIN JD","category":"BASS"},{"bank":1,"program":99,"name":"WOBBLER 1 IW","category":"BASS"},{"bank":2,"program":0,"name":"WOBBLER 2 IW","category":"BASS"},{"bank":2,"program":1,"name":"AUTOBAHN","category":"DRUM"},{"bank":2,"program":2,"name":"CLAP","category":"DRUM"},{"bank":2,"program":3,"name":"CLAP 2","category":"DRUM"},{"bank":2,"program":4,"name":"KICK LOW","category":"DRUM"},{"bank":2,"program":5,"name":"NOISE TOMS1 CG","category":"DRUM"},{"bank":2,"program":6,"name":"NOISE TOMS2 CG","category":"DRUM"},{"bank":2,"program":7,"name":"SDSV TOMS1 CG","category":"DRUM"},{"bank":2,"program":8,"name":"SMARE","category":"DRUM"},{"bank":2,"program":9,"name":"TOM","category":"DRUM"},{"bank":2,"program":10,"name":"ZAPP! KW TEK","category":"DRUM"},{"bank":2,"program":11,"name":"ANSWER = 42 CG","category":"FX"},{"bank":2,"program":12,"name":"BAD SUBWOOFER","category":"FX"},{"bank":2,"program":13,"name":"BIUUU CG","category":"FX"},{"bank":2,"program":14,"name":"BLACKROCKET JD","category":"FX"},{"bank":2,"program":15,"name":"EURORACK DK","category":"FX"},{"bank":2,"program":16,"name":"FIREBALL CG","category":"FX"},{"bank":2,"program":17,"name":"FLYING OBJ JD","category":"FX"},{"bank":2,"program":18,"name":"HIGH HARLEY CG","category":"FX"},{"bank":2,"program":19,"name":"HUGE STORM CG","category":"FX"},{"bank":2,"program":20,"name":"MO P-CORDS TEK","category":"FX"},{"bank":2,"program":21,"name":"NOISE DROP CG","category":"FX"},{"bank":2,"program":22,"name":"PROZESSOR RL","category":"FX"},{"bank":2,"program":23,"name":"S&H DK","category":"FX"},{"bank":2,"program":24,"name":"SAW & HOLD DK","category":"FX"},{"bank":2,"program":25,"name":"SICK","category":"FX"},{"bank":2,"program":26,"name":"SNOW STORM CG","category":"FX"},{"bank":2,"program":27,"name":"SONAR","category":"FX"},{"bank":2,"program":28,"name":"TANGERINES CG","category":"FX"},{"bank":2,"program":29,"name":"THE PLUMMER DK","category":"FX"},{"bank":2,"program":30,"name":"THEREMIN JD","category":"FX"},{"bank":2,"program":31,"name":"TURBO PROP CG","category":"FX"},{"bank":2,"program":32,"name":"WEIRD WAVE CG","category":"FX"},{"bank":2,"program":33,"name":"A BIT KOTO TEK","category":"KEYS"},{"bank":2,"program":34,"name":"APW","category":"KEYS"},{"bank":2,"program":35,"name":"APW ORGAN IW","category":"KEYS"},{"bank":2,"program":36,"name":"BELLS IW","category":"KEYS"},{"bank":2,"program":37,"name":"CARBOMIC","category":"KEYS"},{"bank":2,"program":38,"name":"DET ORGAN JD","category":"KEYS"},{"bank":2,"program":39,"name":"DST CHORD JD","category":"KEYS"},{"bank":2,"program":40,"name":"E-ORGAN TEK","category":"KEYS"},{"bank":2,"program":41,"name":"E. GRAND 1 IW","category":"KEYS"},{"bank":2,"program":42,"name":"E. GRAND 2 IW","category":"KEYS"},{"bank":2,"program":43,"name":"FLUTE TEK","category":"KEYS"},{"bank":2,"program":44,"name":"HARPSICKEYS IW","category":"KEYS"},{"bank":2,"program":45,"name":"HITCHY JD","category":"KEYS"},{"bank":2,"program":46,"name":"LEGATO-ATO TEK","category":"KEYS"},{"bank":2,"program":47,"name":"MAGIC FLY JD","category":"KEYS"},{"bank":2,"program":48,"name":"NICRO SWEEP JD","category":"KEYS"},{"bank":2,"program":49,"name":"NOVIESTAR JD","category":"KEYS"},{"bank":2,"program":50,"name":"ORGANICS 2 CG","category":"KEYS"},{"bank":2,"program":51,"name":"ORGANICS 3 CG","category":"KEYS"},{"bank":2,"program":52,"name":"PLUCKED 2","category":"KEYS"},{"bank":2,"program":53,"name":"RAVE ORGAN JD","category":"KEYS"},{"bank":2,"program":54,"name":"REVERS ACC JD","category":"KEYS"},{"bank":2,"program":55,"name":"REZZY BP IW","category":"KEYS"},{"bank":2,"program":56,"name":"SILICON 64 JD","category":"KEYS"},{"bank":2,"program":57,"name":"SYNCED KEY","category":"KEYS"},{"bank":2,"program":58,"name":"UNIRAVE DK","category":"KEYS"},{"bank":2,"program":59,"name":"WHABBAWHEEL JD","category":"KEYS"},{"bank":2,"program":60,"name":"XTC ACID JD","category":"KEYS"},{"bank":2,"program":61,"name":"101 BRASS 1 IW","category":"LEAD"},{"bank":2,"program":62,"name":"101 BRASS 2 IW","category":"LEAD"},{"bank":2,"program":63,"name":"12AU7 TUBE TEK","category":"LEAD"},{"bank":2,"program":64,"name":"20 TO 100 IW","category":"LEAD"},{"bank":2,"program":65,"name":"3 SQUARES IW","category":"LEAD"},{"bank":2,"program":66,"name":"3 TUNED BP IW","category":"LEAD"},{"bank":2,"program":67,"name":"3OCT SAW 1 IW","category":"LEAD"},{"bank":2,"program":68,"name":"3OCT SAW 2 IW","category":"LEAD"},{"bank":2,"program":69,"name":"3OCT SQUARE IW","category":"LEAD"},{"bank":2,"program":70,"name":"3OCT TRI IW","category":"LEAD"},{"bank":2,"program":71,"name":"70'S","category":"LEAD"},{"bank":2,"program":72,"name":"70S FUNK LD IW","category":"LEAD"},{"bank":2,"program":73,"name":"ABACAB IW","category":"LEAD"},{"bank":2,"program":74,"name":"AGGRESSOR IW","category":"LEAD"},{"bank":2,"program":75,"name":"ANAZING IW","category":"LEAD"},{"bank":2,"program":76,"name":"AQUATARKUS IW","category":"LEAD"},{"bank":2,"program":77,"name":"BP TRIANGLE IW","category":"LEAD"},{"bank":2,"program":78,"name":"BAAHNPASS IW","category":"LEAD"},{"bank":2,"program":79,"name":"CELLPHONE DK","category":"LEAD"},{"bank":2,"program":80,"name":"CLARINET IW","category":"LEAD"},{"bank":2,"program":81,"name":"CRAZY KNOBS RL","category":"LEAD"},{"bank":2,"program":82,"name":"DRIVE LIGHT DK","category":"LEAD"},{"bank":2,"program":83,"name":"DRIVER SEAT CG","category":"LEAD"},{"bank":2,"program":84,"name":"DRONE LD 1 IW","category":"LEAD"},{"bank":2,"program":85,"name":"DRONE LD 2 IW","category":"LEAD"},{"bank":2,"program":86,"name":"DUCK LD IW","category":"LEAD"},{"bank":2,"program":87,"name":"DUCKY DK","category":"LEAD"},{"bank":2,"program":88,"name":"ELECTRONICA IW","category":"LEAD"},{"bank":2,"program":89,"name":"FAKE DELAYS RL","category":"LEAD"},{"bank":2,"program":90,"name":"FAKE DISTO","category":"LEAD"},{"bank":2,"program":91,"name":"FAT BP REZ IW","category":"LEAD"},{"bank":2,"program":92,"name":"FAT REZ LD IW","category":"LEAD"},{"bank":2,"program":93,"name":"FIFTHS LD IW","category":"LEAD"},{"bank":2,"program":94,"name":"FILTER FM IW","category":"LEAD"},{"bank":2,"program":95,"name":"FLUTE IW","category":"LEAD"},{"bank":2,"program":96,"name":"FUSION IW","category":"LEAD"},{"bank":2,"program":97,"name":"FUZZY BEAR CG","category":"LEAD"},{"bank":2,"program":98,"name":"FUZZYGUITAR IW","category":"LEAD"},{"bank":2,"program":99,"name":"GOOM IW","category":"LEAD"},{"bank":3,"program":0,"name":"GROWLING BP IW","category":"LEAD"},{"bank":3,"program":1,"name":"HARDROON JD","category":"LEAD"},{"bank":3,"program":2,"name":"HARSH","category":"LEAD"},{"bank":3,"program":3,"name":"HIGH SKY IW","category":"LEAD"},{"bank":3,"program":4,"name":"HORN IW","category":"LEAD"},{"bank":3,"program":5,"name":"LD DELIGHT IW","category":"LEAD"},{"bank":3,"program":6,"name":"LESS DTUME TEK","category":"LEAD"},{"bank":3,"program":7,"name":"LITTLEPULSE CG","category":"LEAD"},{"bank":3,"program":8,"name":"LOW BRASS IW","category":"LEAD"},{"bank":3,"program":9,"name":"LYLEISH IW","category":"LEAD"},{"bank":3,"program":10,"name":"MISBEHAVE DK","category":"LEAD"},{"bank":3,"program":11,"name":"MYSTICLEAD CG","category":"LEAD"},{"bank":3,"program":12,"name":"NASAL","category":"LEAD"},{"bank":3,"program":13,"name":"NEG SWEEP IW","category":"LEAD"},{"bank":3,"program":14,"name":"NOISY BP LD IW","category":"LEAD"},{"bank":3,"program":15,"name":"OBOE IW","category":"LEAD"},{"bank":3,"program":16,"name":"P2 SINGING CG","category":"LEAD"},{"bank":3,"program":17,"name":"PARAPHASED CG","category":"LEAD"},{"bank":3,"program":18,"name":"PHAT","category":"LEAD"},{"bank":3,"program":19,"name":"PITCH DOWN IW","category":"LEAD"},{"bank":3,"program":20,"name":"PULSE2","category":"LEAD"},{"bank":3,"program":21,"name":"PULSEWELT DK","category":"LEAD"},{"bank":3,"program":22,"name":"RAVE MATION JD","category":"LEAD"},{"bank":3,"program":23,"name":"RETRO","category":"LEAD"},{"bank":3,"program":24,"name":"REVIVAL LD CG","category":"LEAD"},{"bank":3,"program":25,"name":"RIWER DEEP CG","category":"LEAD"},{"bank":3,"program":26,"name":"S+H BPF IW","category":"LEAD"},{"bank":3,"program":27,"name":"SEVENTH HP IW","category":"LEAD"},{"bank":3,"program":28,"name":"SH-IOLIN IW","category":"LEAD"},{"bank":3,"program":29,"name":"SINGING HPF 1W","category":"LEAD"},{"bank":3,"program":30,"name":"SINOID LD IW","category":"LEAD"},{"bank":3,"program":31,"name":"SIZZLER IW","category":"LEAD"},{"bank":3,"program":32,"name":"SLOW SYNC IW","category":"LEAD"},{"bank":3,"program":33,"name":"STEREO LD 2 CG","category":"LEAD"},{"bank":3,"program":34,"name":"STEREO","category":"LEAD"},{"bank":3,"program":35,"name":"STEVE W. TEK","category":"LEAD"},{"bank":3,"program":36,"name":"SYNC LD 1 IW","category":"LEAD"},{"bank":3,"program":37,"name":"SYNC LD 2 IW","category":"LEAD"},{"bank":3,"program":38,"name":"THE PULSE RL","category":"LEAD"},{"bank":3,"program":39,"name":"UNI SQUARE IW","category":"LEAD"},{"bank":3,"program":40,"name":"URANUS IW","category":"LEAD"},{"bank":3,"program":41,"name":"WHISTLER IW","category":"LEAD"},{"bank":3,"program":42,"name":"WHITE ROCK IW","category":"LEAD"},{"bank":3,"program":43,"name":"ANALOG WARMTH","category":"MONO"},{"bank":3,"program":44,"name":"ART OF SYNT CG","category":"MONO"},{"bank":3,"program":45,"name":"BPPULSE DK","category":"MONO"},{"bank":3,"program":46,"name":"CIRCUIT BENT","category":"MONO"},{"bank":3,"program":47,"name":"CLASSIC MOD CG","category":"MONO"},{"bank":3,"program":48,"name":"DRAFT FUNK CG","category":"MONO"},{"bank":3,"program":49,"name":"ENOLA JD","category":"MONO"},{"bank":3,"program":50,"name":"FUJIYAMA CG","category":"MONO"},{"bank":3,"program":51,"name":"KRAFTMAX CG","category":"MONO"},{"bank":3,"program":52,"name":"MINI MOOD CG","category":"MONO"},{"bank":3,"program":53,"name":"MODERN PAST CG","category":"MONO"},{"bank":3,"program":54,"name":"PANNER DK","category":"MONO"},{"bank":3,"program":55,"name":"POINT OF VIEW","category":"MONO"},{"bank":3,"program":56,"name":"PURE PULSE2 CG","category":"MONO"},{"bank":3,"program":57,"name":"SECRETGARD JD","category":"MONO"},{"bank":3,"program":58,"name":"SHORTY DK","category":"MONO"},{"bank":3,"program":59,"name":"TOKYO TUNE CG","category":"MONO"},{"bank":3,"program":60,"name":"TUCKER DK","category":"MONO"},{"bank":3,"program":61,"name":"TUCKER2 DK","category":"MONO"},{"bank":3,"program":62,"name":"70'S","category":"PAD"},{"bank":3,"program":63,"name":"ABENDROT CG","category":"PAD"},{"bank":3,"program":64,"name":"ABENDSTERN CG","category":"PAD"},{"bank":3,"program":65,"name":"ANTIQUE","category":"PAD"},{"bank":3,"program":66,"name":"APWSTRINGS IW","category":"PAD"},{"bank":3,"program":67,"name":"BP STRINGS IW","category":"PAD"},{"bank":3,"program":68,"name":"BRASSY","category":"PAD"},{"bank":3,"program":69,"name":"BREATHY","category":"PAD"},{"bank":3,"program":70,"name":"FADING","category":"PAD"},{"bank":3,"program":71,"name":"FATTY","category":"PAD"},{"bank":3,"program":72,"name":"GLORIA","category":"PAD"},{"bank":3,"program":73,"name":"HIGHSTRINGS IW","category":"PAD"},{"bank":3,"program":74,"name":"INFLUX IW","category":"PAD"},{"bank":3,"program":75,"name":"LEIT@R DK","category":"PAD"},{"bank":3,"program":76,"name":"OLD HARMONY CG","category":"PAD"},{"bank":3,"program":77,"name":"PAD PANNER JD","category":"PAD"},{"bank":3,"program":78,"name":"PWM","category":"PAD"},{"bank":3,"program":79,"name":"PWM","category":"PAD"},{"bank":3,"program":80,"name":"QUADRO-PAD CG","category":"PAD"},{"bank":3,"program":81,"name":"SOFT PULSE2 CG","category":"PAD"},{"bank":3,"program":82,"name":"SOFTSTRINGS IW","category":"PAD"},{"bank":3,"program":83,"name":"STRINGPULSE CG","category":"PAD"},{"bank":3,"program":84,"name":"WIDE PULSE2 CG","category":"PAD"},{"bank":3,"program":85,"name":"HIHAT","category":"PERC"},{"bank":3,"program":86,"name":"Z@PPA DK","category":"PERC"},{"bank":3,"program":87,"name":"Z@PPER2 DK","category":"PERC"},{"bank":3,"program":88,"name":"ZWITSCHER CG","category":"PERC"},{"bank":3,"program":89,"name":"4-VOICE","category":"PAD"},{"bank":3,"program":90,"name":"8-VOICE PWM","category":"POLY"},{"bank":3,"program":91,"name":"APW","category":"POLY"},{"bank":3,"program":92,"name":"BRASSERERIE DK","category":"POLY"},{"bank":3,"program":93,"name":"DAS MODEL CG","category":"POLY"},{"bank":3,"program":94,"name":"FULL PULSE CG","category":"POLY"},{"bank":3,"program":95,"name":"FUNKADELIC","category":"POLY"},{"bank":3,"program":96,"name":"HARMONICS IW","category":"POLY"},{"bank":3,"program":97,"name":"HOOVER DK","category":"POLY"},{"bank":3,"program":98,"name":"MORPI LFO","category":"POLY"},{"bank":3,"program":99,"name":"NEED PRESSURE","category":"POLY"},{"bank":4,"program":0,"name":"PAD P2 DK","category":"POLY"},{"bank":4,"program":1,"name":"POLI 80IES TEK","category":"POLY"},{"bank":4,"program":2,"name":"POLY CELLO CG","category":"POLY"},{"bank":4,"program":3,"name":"POLY PULSE CG","category":"POLY"},{"bank":4,"program":4,"name":"POLYNOISIA","category":"POLY"},{"bank":4,"program":5,"name":"POLYP2 DK","category":"POLY"},{"bank":4,"program":6,"name":"PULSEWIDTH","category":"POLY"},{"bank":4,"program":7,"name":"STAKKER A CG","category":"POLY"},{"bank":4,"program":8,"name":"UNI GUITAR IW","category":"POLY"},{"bank":4,"program":9,"name":"UNISON SQUARE","category":"POLY"},{"bank":4,"program":10,"name":"INIT","category":"NONE"},{"bank":4,"program":11,"name":"INIT","category":"NONE"},{"bank":4,"program":12,"name":"INIT","category":"NONE"},{"bank":4,"program":13,"name":"INIT","category":"NONE"},{"bank":4,"program":14,"name":"INIT","category":"NONE"},{"bank":4,"program":15,"name":"INIT","category":"NONE"},{"bank":4,"program":16,"name":"INIT","category":"NONE"},{"bank":4,"program":17,"name":"INIT","category":"NONE"},{"bank":4,"program":18,"name":"INIT","category":"NONE"},{"bank":4,"program":19,"name":"INIT","category":"NONE"},{"bank":4,"program":20,"name":"INIT","category":"NONE"},{"bank":4,"program":21,"name":"INIT","category":"NONE"},{"bank":4,"program":22,"name":"INIT","category":"NONE"},{"bank":4,"program":23,"name":"INIT","category":"NONE"},{"bank":4,"program":24,"name":"INIT","category":"NONE"},{"bank":4,"program":25,"name":"INIT","category":"NONE"},{"bank":4,"program":26,"name":"INIT","category":"NONE"},{"bank":4,"program":27,"name":"INIT","category":"NONE"},{"bank":4,"program":28,"name":"INIT","category":"NONE"},{"bank":4,"program":29,"name":"INIT","category":"NONE"},{"bank":4,"program":30,"name":"INIT","category":"NONE"},{"bank":4,"program":31,"name":"INIT","category":"NONE"},{"bank":4,"program":32,"name":"INIT","category":"NONE"},{"bank":4,"program":33,"name":"INIT","category":"NONE"},{"bank":4,"program":34,"name":"INIT","category":"NONE"},{"bank":4,"program":35,"name":"INIT","category":"NONE"},{"bank":4,"program":36,"name":"INIT","category":"NONE"},{"bank":4,"program":37,"name":"INIT","category":"NONE"},{"bank":4,"program":38,"name":"INIT","category":"NONE"},{"bank":4,"program":39,"name":"INIT","category":"NONE"},{"bank":4,"program":40,"name":"INIT","category":"NONE"},{"bank":4,"program":41,"name":"INIT","category":"NONE"},{"bank":4,"program":42,"name":"INIT","category":"NONE"},{"bank":4,"program":43,"name":"INIT","category":"NONE"},{"bank":4,"program":44,"name":"INIT","category":"NONE"},{"bank":4,"program":45,"name":"INIT","category":"NONE"},{"bank":4,"program":46,"name":"INIT","category":"NONE"},{"bank":4,"program":47,"name":"INIT","category":"NONE"},{"bank":4,"program":48,"name":"INIT","category":"NONE"},{"bank":4,"program":49,"name":"INIT","category":"NONE"},{"bank":4,"program":50,"name":"INIT","category":"NONE"},{"bank":4,"program":51,"name":"INIT","category":"NONE"},{"bank":4,"program":52,"name":"INIT","category":"NONE"},{"bank":4,"program":53,"name":"INIT","category":"NONE"},{"bank":4,"program":54,"name":"INIT","category":"NONE"},{"bank":4,"program":55,"name":"INIT","category":"NONE"},{"bank":4,"program":56,"name":"INIT","category":"NONE"},{"bank":4,"program":57,"name":"INIT","category":"NONE"},{"bank":4,"program":58,"name":"INIT","category":"NONE"},{"bank":4,"program":59,"name":"INIT","category":"NONE"},{"bank":4,"program":60,"name":"INIT","category":"NONE"},{"bank":4,"program":61,"name":"INIT","category":"NONE"},{"bank":4,"program":62,"name":"INIT","category":"NONE"},{"bank":4,"program":63,"name":"INIT","category":"NONE"},{"bank":4,"program":64,"name":"INIT","category":"NONE"},{"bank":4,"program":65,"name":"INIT","category":"NONE"},{"bank":4,"program":66,"name":"INIT","category":"NONE"},{"bank":4,"program":67,"name":"INIT","category":"NONE"},{"bank":4,"program":68,"name":"INIT","category":"NONE"},{"bank":4,"program":69,"name":"INIT","category":"NONE"},{"bank":4,"program":70,"name":"INIT","category":"NONE"},{"bank":4,"program":71,"name":"INIT","category":"NONE"},{"bank":4,"program":72,"name":"INIT","category":"NONE"},{"bank":4,"program":73,"name":"INIT","category":"NONE"},{"bank":4,"program":74,"name":"INIT","category":"NONE"},{"bank":4,"program":75,"name":"INIT","category":"NONE"},{"bank":4,"program":76,"name":"INIT","category":"NONE"},{"bank":4,"program":77,"name":"INIT","category":"NONE"},{"bank":4,"program":78,"name":"INIT","category":"NONE"},{"bank":4,"program":79,"name":"INIT","category":"NONE"},{"bank":4,"program":80,"name":"INIT","category":"NONE"},{"bank":4,"program":81,"name":"INIT","category":"NONE"},{"bank":4,"program":82,"name":"INIT","category":"NONE"},{"bank":4,"program":83,"name":"INIT","category":"NONE"},{"bank":4,"program":84,"name":"INIT","category":"NONE"},{"bank":4,"program":85,"name":"INIT","category":"NONE"},{"bank":4,"program":86,"name":"INIT","category":"NONE"},{"bank":4,"program":87,"name":"INIT","category":"NONE"},{"bank":4,"program":88,"name":"INIT","category":"NONE"},{"bank":4,"program":89,"name":"INIT","category":"NONE"},{"bank":4,"program":90,"name":"INIT","category":"NONE"},{"bank":4,"program":91,"name":"INIT","category":"NONE"},{"bank":4,"program":92,"name":"INIT","category":"NONE"},{"bank":4,"program":93,"name":"INIT","category":"NONE"},{"bank":4,"program":94,"name":"INIT","category":"NONE"},{"bank":4,"program":95,"name":"INIT","category":"NONE"},{"bank":4,"program":96,"name":"INIT","category":"NONE"},{"bank":4,"program":97,"name":"INIT","category":"NONE"},{"bank":4,"program":98,"name":"INIT","category":"NONE"},{"bank":4,"program":99,"name":"RANDOM","category":"NONE"}]},{"schema":"tabby-device/1","version":"0.1","id":"zoom-ms-70cdr-plus","name":"Zoom MS-70CDR+","maker":"Zoom","channel":{"default":16,"note":"MENU > USB MIDI CH = 1..16 or OMNI (memorised). USB MIDI only: the pedal is a USB device and needs a USB host (CME H4MIDI WC in this rig). Factory default not stated; 16 is this rig's setting."},"programChange":{"supported":true,"displayBase":1,"programs":100,"bankFormat":"none","pad":3,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Patches are displayed 001..100; the chart lists PC 0-100 'true number 0-100' without a mapping, so whether PC 0 or PC 1 is patch 001 is unverified (displayBase 1 assumed; change it after the hardware check)."},"controllers":[],"setup":["MENU > USB MIDI CH = 16 (or OMNI).","Connect the USB host before the set; the pedal shows a USB CONNECT prompt on batteries.","Hardware check: send PC 0 and PC 1 and note which patch the display shows; set displayBase accordingly."],"notes":["No control change and no SysEx are recognised (chart); patch selection is the only MIDI function.","Factory patches 001..080 from Zoom's patch list; 081..100 are empty user slots."],"sources":[{"title":"MS-70CDR+ Operation Manual (chart p. 69, USB MIDI CH p. 59)","url":"https://zoomcorp.com/media/documents/E_MS-70CDRplus.pdf","detail":"chart dated Mar. 1, 2024, version 1.00"},{"title":"MS-70CDR+ Patch Memory List, preset ver. 1.00","url":"https://zoomcorp.com/media/documents/E_MS-70CDRplus_Patchlist.pdf","detail":"80 factory patches"}],"unverified":["channel.default","programChange.displayBase","class compliance behind a USB host"],"presets":[{"bank":null,"program":0,"name":"C-D-R+"},{"bank":null,"program":1,"name":"63 Spring Reverb"},{"bank":null,"program":2,"name":"Silky Tape Echo"},{"bank":null,"program":3,"name":"Phase Room"},{"bank":null,"program":4,"name":"Shimmer Reverb+"},{"bank":null,"program":5,"name":"Long Echo"},{"bank":null,"program":6,"name":"69s Vibe"},{"bank":null,"program":7,"name":"Mangle Ice"},{"bank":null,"program":8,"name":"LO-FI Noise"},{"bank":null,"program":9,"name":"Small & Smooth"},{"bank":null,"program":10,"name":"Modulation Delay 1&2"},{"bank":null,"program":11,"name":"Pipe Organ"},{"bank":null,"program":12,"name":"Pop Chorus"},{"bank":null,"program":13,"name":"Deep Blue"},{"bank":null,"program":14,"name":"Dual Reverb"},{"bank":null,"program":15,"name":"Rotary"},{"bank":null,"program":16,"name":"Stairway"},{"bank":null,"program":17,"name":"Tape Echo 3"},{"bank":null,"program":18,"name":"Filter Pad"},{"bank":null,"program":19,"name":"BPM Sync Delay"},{"bank":null,"program":20,"name":"Kick Flanger"},{"bank":null,"program":21,"name":"Ambient"},{"bank":null,"program":22,"name":"Chorus One"},{"bank":null,"program":23,"name":"Green Chorus"},{"bank":null,"program":24,"name":"Orange Tremolo"},{"bank":null,"program":25,"name":"Vibrato"},{"bank":null,"program":26,"name":"Swell Vibrato"},{"bank":null,"program":27,"name":"Analog Chorus"},{"bank":null,"program":28,"name":"BF Flanger 2"},{"bank":null,"program":29,"name":"Jet Flanger"},{"bank":null,"program":30,"name":"Clone Chorus"},{"bank":null,"program":31,"name":"Detune"},{"bank":null,"program":32,"name":"Phaser"},{"bank":null,"program":33,"name":"Duo Phaser"},{"bank":null,"program":34,"name":"Tremolo-Pan"},{"bank":null,"program":35,"name":"Slicer"},{"bank":null,"program":36,"name":"Tri Chorus"},{"bank":null,"program":37,"name":"Polyphonic Octaver"},{"bank":null,"program":38,"name":"Bass Analog Octaver"},{"bank":null,"program":39,"name":"Polyphonic Pitch Shifter"},{"bank":null,"program":40,"name":"Geminos Doubler"},{"bank":null,"program":41,"name":"AC Tape Echo"},{"bank":null,"program":42,"name":"Smooth Delay"},{"bank":null,"program":43,"name":"Rockabilly"},{"bank":null,"program":44,"name":"Digital Delay"},{"bank":null,"program":45,"name":"Soft Echo"},{"bank":null,"program":46,"name":"Drive Echo"},{"bank":null,"program":47,"name":"Dual Delay"},{"bank":null,"program":48,"name":"Trigger Hold Delay"},{"bank":null,"program":49,"name":"Drunkship"},{"bank":null,"program":50,"name":"FD Spring Reverb"},{"bank":null,"program":51,"name":"Chamber Reverb"},{"bank":null,"program":52,"name":"Church Reverb"},{"bank":null,"program":53,"name":"Cave Reverb"},{"bank":null,"program":54,"name":"Slap Back Reverb"},{"bank":null,"program":55,"name":"Gate Reverb"},{"bank":null,"program":56,"name":"Long Plate"},{"bank":null,"program":57,"name":"Loop Roll"},{"bank":null,"program":58,"name":"Hold Delay"},{"bank":null,"program":59,"name":"Hold Reverb"},{"bank":null,"program":60,"name":"Higher"},{"bank":null,"program":61,"name":"Guitar Strings"},{"bank":null,"program":62,"name":"Pad Guitar"},{"bank":null,"program":63,"name":"Synchronized"},{"bank":null,"program":64,"name":"Reverse"},{"bank":null,"program":65,"name":"12 Strings"},{"bank":null,"program":66,"name":"Delay & Delay"},{"bank":null,"program":67,"name":"Mono Synth"},{"bank":null,"program":68,"name":"Voice Reverse"},{"bank":null,"program":69,"name":"Sequence Filter"},{"bank":null,"program":70,"name":"Hollywood"},{"bank":null,"program":71,"name":"Monument"},{"bank":null,"program":72,"name":"Robot"},{"bank":null,"program":73,"name":"Magical Warp"},{"bank":null,"program":74,"name":"Adamski"},{"bank":null,"program":75,"name":"Ring Noise"},{"bank":null,"program":76,"name":"Ducking"},{"bank":null,"program":77,"name":"Eraserhead"},{"bank":null,"program":78,"name":"Sound EFX"},{"bank":null,"program":79,"name":"Bomber+"}]}];
/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/rig/device-library.js — the device library: definitions, validation, numbering
 *
 * Purpose
 *   Task 04 keeps all device knowledge in the workbench. A definition is a JSON document
 *   ("tabby-device/1", one per device under web/devices/, written by
 *   tools/linux/devices-from-sources.py from manufacturer documents) that says how a
 *   device numbers its programs, how it selects banks, which controllers it names, what
 *   must be set on the device, where every fact comes from, and which fields could not be
 *   verified. This module validates definitions against the schema below and turns them
 *   into the vocabulary the row event editor shows: display numbers, bank values, preset
 *   and controller names.
 *
 *   Definition (tabby-device/1):
 *     schema "tabby-device/1", version, id (file name), name, maker,
 *     channel: { default: null | 1..16, note },
 *     programChange: { supported: true | false | "unverified", displayBase: 0 | 1,
 *                      programs (per bank), bankFormat: "none" | "letter" | "hundreds",
 *                      pad (display digits), displayHex (optional),
 *                      bankSelect: { scheme: "none" | "cc0" | "cc32" | "cc0cc32",
 *                                    banks: [{ index, name, msb: null | 0..127, lsb: null | 0..127 }] },
 *                      gapMs: 0..255, gapAfter: "bank" | "program", note },
 *     presets: [{ bank: null | bank index, program: 0..127 (MIDI number) or null when the
 *                 preset has no direct MIDI number (Proteus 128..383: only through its
 *                 program map), number? (the device's own number), name, category? }],
 *     controllers: [{ cc: 0..127 (or -1 = "no fixed map" note), name, min, max, values? }],
 *     setup: [text], notes: [text], sources: [{ title, url, detail }], unverified: [text]
 *
 *   Display numbering: the device shows a program as
 *     bankLabel + pad(displayBase + program + bankIndex × stride)
 *   where bankFormat "letter" gives the bank's name as label (Blofeld "A001"), "hundreds"
 *   folds the bank into the number with stride 100 (Pulse 2 "102" = bank 1 program 1) and
 *   "none" shows the number alone ("000" Proteus, "12" H90, "001" Zoom); displayHex shows
 *   two hex digits (M8 "INST 0A").
 *
 *   Loading: classic script (globalThis.TabbyDevices) and CommonJS (module.exports). In the
 *   workbench the definitions arrive inlined by tools/linux/build-web.py as
 *   `globalThis.FM1_DEVICES` (an array) and in Node from the files.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-02  Initial version (Task 04, workbench part).
 */
(() => {
  'use strict';

  const SCHEMA = 'tabby-device/1';
  const BANK_SCHEMES = ['none', 'cc0', 'cc32', 'cc0cc32'], BANK_FORMATS = ['none', 'letter', 'hundreds'];

  const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const isText = v => typeof v === 'string';

  /* Validate one definition. Returns { ok, errors } with every problem listed. */
  function validateDevice(d) {
    const errors = [], err = t => errors.push(t);
    if (!d || typeof d !== 'object') return { ok: false, errors: ['not an object'] };
    if (d.schema !== SCHEMA) err('schema must be ' + SCHEMA);
    for (const k of ['id', 'name', 'maker', 'version']) if (!isText(d[k]) || !d[k]) err(k + ' must be a non-empty string');
    if (isText(d.id) && !/^[a-z0-9-]+$/.test(d.id)) err('id must be lower-case letters, digits and dashes');
    if (!d.channel || typeof d.channel !== 'object') err('channel missing');
    else {
      if (d.channel.default !== null && !isInt(d.channel.default, 1, 16)) err('channel.default must be null or 1..16');
      if (!isText(d.channel.note)) err('channel.note must be text');
    }
    const p = d.programChange;
    if (!p || typeof p !== 'object') err('programChange missing');
    else {
      if (![true, false, 'unverified'].includes(p.supported)) err('programChange.supported must be true, false or "unverified"');
      if (![0, 1].includes(p.displayBase)) err('programChange.displayBase must be 0 or 1');
      if (!isInt(p.programs, 0, 65535)) err('programChange.programs must be 0..65535');
      if (!BANK_FORMATS.includes(p.bankFormat)) err('programChange.bankFormat invalid');
      if (!isInt(p.pad, 0, 4)) err('programChange.pad must be 0..4');
      if (p.displayHex !== undefined && typeof p.displayHex !== 'boolean') err('programChange.displayHex must be boolean');
      if (!isInt(p.gapMs, 0, 255)) err('programChange.gapMs must be 0..255');
      if (!['bank', 'program'].includes(p.gapAfter)) err('programChange.gapAfter must be bank or program');
      if (!isText(p.note)) err('programChange.note must be text');
      const b = p.bankSelect;
      if (!b || !BANK_SCHEMES.includes(b.scheme) || !Array.isArray(b.banks)) err('programChange.bankSelect invalid');
      else {
        if (b.scheme === 'none' && b.banks.length) err('bank scheme none must have no banks');
        if (b.scheme !== 'none' && !b.banks.length) err('bank scheme ' + b.scheme + ' needs banks');
        b.banks.forEach((bank, i) => {
          if (bank.index !== i) err('bank ' + i + ' index must be ' + i);
          if (!isText(bank.name) || !bank.name) err('bank ' + i + ' needs a name');
          if (bank.msb !== null && !isInt(bank.msb, 0, 127)) err('bank ' + i + ' msb must be null or 0..127');
          if (bank.lsb !== null && !isInt(bank.lsb, 0, 127)) err('bank ' + i + ' lsb must be null or 0..127');
          if ((b.scheme === 'cc0' || b.scheme === 'cc0cc32') && bank.msb === null) err('bank ' + i + ' needs msb for scheme ' + b.scheme);
          if ((b.scheme === 'cc32' || b.scheme === 'cc0cc32') && bank.lsb === null) err('bank ' + i + ' needs lsb for scheme ' + b.scheme);
        });
        if (p.bankFormat === 'letter' && b.scheme === 'none') err('bankFormat letter needs banks');
      }
    }
    if (!Array.isArray(d.presets)) err('presets must be an array');
    else {
      const seen = new Set();
      d.presets.forEach((x, i) => {
        if (!x || typeof x !== 'object') { err('preset ' + i + ' invalid'); return; }
        const banks = (p && p.bankSelect && p.bankSelect.banks) || [];
        if (x.bank !== null && !(isInt(x.bank, 0, banks.length - 1))) err('preset ' + i + ' bank ' + x.bank + ' not in bankSelect.banks');
        if (x.program === null ? !isInt(x.number, 0, 65535) : !isInt(x.program, 0, 127)) err('preset ' + i + ' program must be 0..127, or null with a device number');
        if (!isText(x.name) || !x.name) err('preset ' + i + ' needs a name');
        const key = x.bank + ':' + (x.program === null ? 'n' + x.number : x.program);
        if (seen.has(key)) err('preset ' + i + ' duplicates ' + key);
        seen.add(key);
      });
    }
    if (!Array.isArray(d.controllers)) err('controllers must be an array');
    else d.controllers.forEach((c, i) => {
      if (!c || !isInt(c.cc, -1, 127)) err('controller ' + i + ' cc must be -1..127');
      if (!isText(c.name) || !c.name) err('controller ' + i + ' needs a name');
      if (!isInt(c.min, 0, 127) || !isInt(c.max, 0, 127) || c.min > c.max) err('controller ' + i + ' min/max invalid');
      if (c.values !== undefined) {
        if (!c.values || typeof c.values !== 'object') err('controller ' + i + ' values must be an object');
        else for (const k of Object.keys(c.values)) if (!/^\d{1,3}$/.test(k) || !isInt(Number(k), 0, 127) || !isText(c.values[k])) err('controller ' + i + ' value ' + k + ' invalid');
      }
    });
    for (const k of ['setup', 'notes', 'unverified']) {
      if (!Array.isArray(d[k]) || d[k].some(t => !isText(t))) err(k + ' must be an array of text');
    }
    if (!Array.isArray(d.sources) || !d.sources.length) err('sources must list at least one source');
    else d.sources.forEach((s, i) => { if (!s || !isText(s.title) || !isText(s.url) || !isText(s.detail)) err('source ' + i + ' needs title, url, detail'); });
    return { ok: !errors.length, errors };
  }

  /* ---- numbering ----------------------------------------------------------------------- */
  const pad = (n, width) => String(n).padStart(width, '0');
  /* What the device shows for MIDI program `program` in bank `bank` (index or null). */
  function programLabel(d, bank, program) {
    const p = d.programChange, banks = p.bankSelect.banks;
    if (p.displayHex) return pad(program.toString(16).toUpperCase(), Math.max(2, p.pad));
    if (p.bankFormat === 'letter') return (bank !== null && banks[bank] ? banks[bank].name : '') + pad(p.displayBase + program, p.pad);
    if (p.bankFormat === 'hundreds') return pad(p.displayBase + program + (bank !== null ? bank : 0) * (p.programs || 100), p.pad);
    return pad(p.displayBase + program, p.pad);
  }
  /* The MIDI number a displayed program number means (bankFormat none / hundreds). */
  function programFromLabel(d, label) {
    const p = d.programChange, text = String(label).trim().toUpperCase();
    if (p.displayHex) { const n = parseInt(text.replace(/^INST\s*/, ''), 16); return Number.isInteger(n) && n >= 0 && n <= 127 ? { bank: null, program: n } : null; }
    if (p.bankFormat === 'letter') {
      const m = text.match(/^([A-Z])\s*(\d+)$/); if (!m) return null;
      const bank = p.bankSelect.banks.findIndex(b => b.name.toUpperCase() === m[1]), program = Number(m[2]) - p.displayBase;
      return bank >= 0 && program >= 0 && program <= 127 ? { bank, program } : null;
    }
    const n = Number(text.replace(/^P/, '')); if (!Number.isInteger(n)) return null;
    if (p.bankFormat === 'hundreds') {
      const stride = p.programs || 100, rel = n - p.displayBase, bank = Math.floor(rel / stride), program = rel - bank * stride;
      return rel >= 0 && bank < p.bankSelect.banks.length && program <= 127 ? { bank, program } : null;
    }
    const program = n - p.displayBase;
    return program >= 0 && program <= 127 ? { bank: null, program } : null;
  }
  /* Bank select bytes for a bank index: { msb, lsb } with null for "not sent". */
  function bankBytes(d, bank) {
    const b = d.programChange.bankSelect;
    if (b.scheme === 'none' || bank === null || !b.banks[bank]) return { msb: null, lsb: null };
    return { msb: b.scheme === 'cc32' ? null : b.banks[bank].msb, lsb: b.scheme === 'cc0' ? null : b.banks[bank].lsb };
  }
  /* The bank index a pair of bank bytes selects, or null. */
  function bankFromBytes(d, msb, lsb) {
    const b = d.programChange.bankSelect;
    if (b.scheme === 'none') return null;
    const i = b.banks.findIndex(x => (b.scheme === 'cc32' || x.msb === null || msb === null || x.msb === msb) && (b.scheme === 'cc0' || x.lsb === null || lsb === null || x.lsb === lsb));
    return i >= 0 ? i : null;
  }
  function presetName(d, bank, program) {
    const x = d.presets.find(p => p.program === program && (p.bank === null ? bank === null || bank === 0 || d.programChange.bankSelect.scheme === 'none' : p.bank === bank));
    return x ? x.name : null;
  }
  function controller(d, cc) { return d.controllers.find(c => c.cc === cc) || null; }
  function valueName(d, cc, value) {
    const c = controller(d, cc); if (!c || !c.values) return null;
    const keys = Object.keys(c.values).map(Number).sort((a, b) => a - b);
    let best = null; for (const k of keys) if (k <= value) best = k;
    return best === null ? null : c.values[String(best)];
  }

  /* The library: definitions by id, validated. `defs` is an array of definition objects. */
  function load(defs) {
    const byId = new Map(), problems = [];
    for (const d of defs || []) {
      const v = validateDevice(d);
      if (!v.ok) { problems.push({ id: d && d.id, errors: v.errors }); continue; }
      if (byId.has(d.id)) { problems.push({ id: d.id, errors: ['duplicate id'] }); continue; }
      byId.set(d.id, d);
    }
    return { byId, list: [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)), problems,
      get(id) { return byId.get(id) || null; } };
  }

  const TabbyDevices = { SCHEMA, validateDevice, load, programLabel, programFromLabel, bankBytes, bankFromBytes, presetName, controller, valueName, version: '0.1' };
  globalThis.TabbyDevices = TabbyDevices;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyDevices;
})();

/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/rig/rig.js — the rig profile: which device sits on which MIDI channel
 *
 * Purpose
 *   Task 04. A rig profile ("tabby-rig/1") maps the 16 MIDI channels to device
 *   definitions from the device library (web/rig/device-library.js), with a per-channel
 *   display name, a gap override (ms, or null = the definition's own delay need) and
 *   user-named programs for devices without a published list (H90 Programs, M8
 *   instruments, Skiff sounds). The global profile is kept in the browser (localStorage)
 *   and can be exported / imported as JSON; a song may carry its own copy as an override
 *   (the `.tabby` trailer, section 9.11 v0.6), which the row event editor then uses.
 *
 *   Gaps: the firmware knows nothing about devices; a device's delay need becomes type-3
 *   gap events in the record (9.11). `applyGaps(events, rig, library)` rewrites a song's
 *   event list for writing: it drops the gap events it finds and inserts, per channel
 *   whose device asks for one, a gap after the program change (gapAfter "program") or
 *   between the bank select and the program change (gapAfter "bank": a bank+program
 *   event is split into control-change events, the gap, then the program change). Reading
 *   a record back keeps whatever gaps it holds; the editor shows them greyed and
 *   regenerates them at the next write.
 *
 *   Lead before the bar (Task 06, 9.13): a channel's `leadMs` (default 0) is how long before
 *   the bar its program change must have left, for slow devices. It becomes a trailing gap
 *   event on that channel after the channel's last program event of the row: the firmware
 *   starts a row's stream (or a track's launch stream) `lead` blocks early, where lead is the
 *   sum of the gaps, so the program change leaves that long before the downbeat. The trailing
 *   gap is max(leadMs, the device's gap after the program); gaps carry the channel of the
 *   event they belong to, which the firmware's per-track slices use.
 *
 *   Loading: classic script (globalThis.TabbyRig) and CommonJS.
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-04  Task 06: per-channel leadMs, the trailing gap kept for a lead.
 *   v0.1  2026-11-02  Initial version (Task 04, workbench part).
 */
(() => {
  'use strict';

  const SCHEMA = 'tabby-rig/1', STORAGE_KEY = 'classic-tabby-rig';
  const devices = () => globalThis.TabbyDevices || (typeof require === 'function' ? require('./device-library.js') : null);

  function rigEmpty() {
    return { schema: SCHEMA, name: 'My rig', channels: Array.from({ length: 16 }, () => ({ device: null, name: '', gapMs: null, leadMs: 0, programs: {} })) };
  }
  /* Validate and normalise a profile object (from storage, a file or a trailer). */
  function rigNormalize(data) {
    if (!data || data.schema !== SCHEMA || !Array.isArray(data.channels) || data.channels.length !== 16) throw new Error('not a tabby-rig/1 profile');
    const rig = rigEmpty();
    rig.name = typeof data.name === 'string' ? data.name.slice(0, 40) : rig.name;
    data.channels.forEach((c, i) => {
      const ch = rig.channels[i];
      if (c && typeof c === 'object') {
        ch.device = typeof c.device === 'string' && c.device ? c.device : null;
        ch.name = typeof c.name === 'string' ? c.name.slice(0, 40) : '';
        ch.gapMs = Number.isInteger(c.gapMs) && c.gapMs >= 0 && c.gapMs <= 255 ? c.gapMs : null;
        ch.leadMs = Number.isInteger(c.leadMs) && c.leadMs >= 0 && c.leadMs <= 255 ? c.leadMs : 0;   /* Task 06: lead before the bar */
        ch.programs = {};
        for (const [k, v] of Object.entries(c.programs || {})) if (/^\d{1,3}$/.test(k) && Number(k) <= 127 && typeof v === 'string') ch.programs[k] = v.slice(0, 40);
      }
    });
    return rig;
  }
  function rigLoad() {
    try { const text = globalThis.localStorage && localStorage.getItem(STORAGE_KEY); if (text) return rigNormalize(JSON.parse(text)); } catch (_) { /* fall through */ }
    return rigEmpty();
  }
  function rigSave(rig) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rigNormalize(rig))); } catch (_) { /* private mode: keep in memory */ } }
  function rigExport(rig) { return JSON.stringify(rigNormalize(rig), null, 1); }
  function rigImport(text) { return rigNormalize(typeof text === 'string' ? JSON.parse(text) : text); }
  function rigClone(rig) { return rigNormalize(JSON.parse(JSON.stringify(rig))); }

  /* The definition on a channel (0..15), or null. */
  function deviceOn(rig, library, channel) {
    const id = rig.channels[channel] && rig.channels[channel].device;
    return id && library ? library.get(id) : null;
  }
  function channelLabel(rig, library, channel) {
    const d = deviceOn(rig, library, channel), c = rig.channels[channel];
    return (channel + 1) + (c.name ? ' ' + c.name : d ? ' ' + d.name : '');
  }
  function gapFor(rig, library, channel) {
    const c = rig.channels[channel], d = deviceOn(rig, library, channel);
    if (c.gapMs !== null) return c.gapMs;
    return d ? d.programChange.gapMs : 0;
  }
  /* Task 06: the channel's lead before the bar in ms (0 = none). */
  function leadFor(rig, channel) { const c = rig.channels[channel]; return c && c.leadMs ? c.leadMs : 0; }
  /* Program name for the editor: the rig's own name first, then the definition's list. */
  function programName(rig, library, channel, bank, program) {
    const c = rig.channels[channel], own = c.programs[String(program)];
    if (own) return own;
    const d = deviceOn(rig, library, channel);
    return d ? devices().presetName(d, bank, program) : null;
  }

  /* Rewrite the event list for writing: gaps from the rig (see the header). Events keep
   * their row order; within a row, the stream order is kept and gaps are inserted after
   * the program events that need them. */
  function applyGaps(events, rig, library) {
    const out = [];
    for (const e of events) {
      if (e.type === 3) continue;                       /* regenerated below */
      const d = deviceOn(rig, library, e.channel), gap = gapFor(rig, library, e.channel);
      const after = d ? d.programChange.gapAfter : 'program';
      if (!gap || (e.type !== 0 && e.type !== 1)) { out.push({ ...e }); continue; }
      if (e.type === 1 && after === 'bank' && (e.d0 !== 255 || e.d1 !== 255)) {
        if (e.d0 !== 255) out.push({ row: e.row, channel: e.channel, type: 2, d0: 0, d1: e.d0, d2: 0 });
        if (e.d1 !== 255) out.push({ row: e.row, channel: e.channel, type: 2, d0: 32, d1: e.d1, d2: 0 });
        out.push({ row: e.row, channel: e.channel, type: 3, d0: gap, d1: 0, d2: 0 });
        out.push({ row: e.row, channel: e.channel, type: 0, d0: e.d2, d1: 0, d2: 0 });
      } else {
        out.push({ ...e });
        out.push({ row: e.row, channel: e.channel, type: 3, d0: gap, d1: 0, d2: 0 });
      }
    }
    /* Task 06: a channel with a lead ends its events of a row with a gap of at least the lead
     * (after its last program event), kept even when it ends the row's stream. */
    const kept = new Set();
    for (let i = 0; i < out.length; i++) {
      const e = out[i];
      if (e.type !== 0 && e.type !== 1) continue;
      const lead = leadFor(rig, e.channel);
      if (!lead) continue;
      let last = i;
      for (let j = i + 1; j < out.length && out[j].row === e.row; j++) if (out[j].channel === e.channel) last = j;
      if (last !== i && out.slice(i + 1, last + 1).some(x => x.channel === e.channel && (x.type === 0 || x.type === 1))) continue;   /* a later program event of the channel carries the lead */
      if (out[last].type === 3) { out[last].d0 = Math.max(out[last].d0, lead); kept.add(out[last]); }
      else { const g = { row: e.row, channel: e.channel, type: 3, d0: lead, d1: 0, d2: 0 }; out.splice(last + 1, 0, g); kept.add(g); }
    }
    /* A gap that ends a row's stream waits for nothing unless it is a lead: drop the others. */
    return out.filter((e, i) => kept.has(e) || !(e.type === 3 && (i === out.length - 1 || out[i + 1].row !== e.row)));
  }
  /* Human text for one event, with the rig's vocabulary. */
  function describe(e, rig, library) {
    const d = deviceOn(rig, library, e.channel), D = devices();
    if (e.type === 3) return 'gap ' + e.d0 + ' ms';
    if (e.type === 2) {
      const c = d ? D.controller(d, e.d0) : null, v = d ? D.valueName(d, e.d0, e.d1) : null;
      return 'CC ' + e.d0 + (c ? ' ' + c.name : '') + ' = ' + e.d1 + (v ? ' (' + v + ')' : '');
    }
    const bank = e.type === 1 ? (d ? D.bankFromBytes(d, e.d0 === 255 ? null : e.d0, e.d1 === 255 ? null : e.d1) : null) : null;
    const program = e.type === 1 ? e.d2 : e.d0;
    const label = d ? D.programLabel(d, bank, program) : String(program), name = programName(rig, library, e.channel, bank, program);
    const bankText = e.type === 1 ? ' (bank' + (e.d0 !== 255 ? ' MSB ' + e.d0 : '') + (e.d1 !== 255 ? ' LSB ' + e.d1 : '') + ')' : '';
    return 'program ' + label + (name ? ' "' + name + '"' : '') + ' [PC ' + program + ']' + bankText;
  }

  const TabbyRig = { SCHEMA, STORAGE_KEY, rigEmpty, rigNormalize, rigLoad, rigSave, rigExport, rigImport, rigClone, deviceOn, channelLabel, gapFor, leadFor, programName, applyGaps, describe, version: '0.2' };
  globalThis.TabbyRig = TabbyRig;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyRig;
})();

/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/rig/rig-ui.js — rig setup and the row event editor (workbench panels)
 *
 * Purpose
 *   Task 04. Two DOM components mounted by the workbench song editor
 *   (sdk/Update.html.in), both English like the MIDI importer panel:
 *
 *     rig setup      a 16-row table (MIDI channel → device from the library, a display
 *                    name, a gap override in ms, named programs for devices without a
 *                    published list), saved to the browser as the global profile, with
 *                    export / import as JSON and a reset;
 *     row events     for the song in the editor: a row selector, the row's event list
 *                    (device and preset names from the rig, raw numbers always shown,
 *                    gaps greyed), move / delete buttons, and an "add event" form whose
 *                    choices come from the device on the chosen channel (preset list,
 *                    bank list, named controllers with value meanings), with raw number
 *                    fields for anything not in a definition. A checkbox gives the song
 *                    its own copy of the rig (the per-song override, stored in the
 *                    `.tabby` trailer).
 *
 *   The components edit `song.events` (the model of sdk/WebUpdate.js songRecordParse:
 *   {row, channel, type, d0, d1, d2}) in place and call `onChange`; the editor's write
 *   and export paths call `prepareEvents(song)` to get the list with the rig's gaps
 *   applied (TabbyRig.applyGaps) and `trailer(song)` for the override.
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-04  Task 06: the "Lead ms" column (program change this long before the bar).
 *   v0.1  2026-11-02  Initial version (Task 04, workbench part).
 */
(() => {
  'use strict';

  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null) el[k] = v;
    }
    for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return el;
  }
  const option = (value, text, selected = false) => h('option', { value: String(value), textContent: text, selected });
  const download = (text, name) => {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })), a = h('a', { href: url, download: name });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  function mount({ setup, events, library, onChange = () => {}, message = () => {} }) {
    const Rig = globalThis.TabbyRig, D = globalThis.TabbyDevices;
    const state = { rig: Rig.rigLoad(), song: null, row: 0 };
    const rigInUse = () => (state.song && state.song.rig) ? state.song.rig : state.rig;

    /* ---- rig setup ---------------------------------------------------------------------- */
    const setupBody = h('tbody'), rigName = h('input', { type: 'text', maxLength: 40 }), programsBox = h('div', { class: 'ti-muted' });
    function renderSetup() {
      const rig = state.rig;
      rigName.value = rig.name;
      setupBody.replaceChildren(...rig.channels.map((c, i) => {
        const dev = h('select', {}, option('', '— none —', !c.device), ...library.list.map(d => option(d.id, d.name, c.device === d.id)));
        dev.addEventListener('change', () => { c.device = dev.value || null; save(); });
        const name = h('input', { type: 'text', maxLength: 40, value: c.name, placeholder: c.device ? (library.get(c.device) || {}).name || '' : '' });
        name.addEventListener('change', () => { c.name = name.value; save(); });
        const d = c.device ? library.get(c.device) : null;
        const gap = h('input', { type: 'number', min: 0, max: 255, step: 1, value: c.gapMs === null ? '' : String(c.gapMs), placeholder: d ? String(d.programChange.gapMs) : '0' });
        gap.addEventListener('change', () => { c.gapMs = gap.value === '' ? null : Math.max(0, Math.min(255, Math.round(Number(gap.value)))); save(); });
        /* Task 06: lead before the bar, for slow devices: the program change leaves this long before the downbeat. */
        const lead = h('input', { type: 'number', min: 0, max: 255, step: 1, value: String(c.leadMs || 0), title: 'Program change this many ms before the bar (track launches and scene changes)' });
        lead.addEventListener('change', () => { c.leadMs = Math.max(0, Math.min(255, Math.round(Number(lead.value) || 0))); save(); });
        const numbering = d ? (d.programChange.supported === true ? 'programs ' + D.programLabel(d, d.programChange.bankSelect.banks.length ? 0 : null, 0) + '..' +
          D.programLabel(d, d.programChange.bankSelect.banks.length ? d.programChange.bankSelect.banks.length - 1 : null, Math.min(127, Math.max(0, (d.programChange.programs || 128) - 1))) +
          (d.programChange.bankSelect.scheme !== 'none' ? ', bank by ' + d.programChange.bankSelect.scheme.toUpperCase().replace('CC0CC32', 'CC 0 + CC 32').replace('CC', 'CC ') : '') +
          (d.unverified.some(u => /displayBase/.test(u)) ? ' (base unverified)' : '')
          : d.programChange.supported === false ? 'no program change' : 'program change unverified') : '';
        const names = h('button', { type: 'button', textContent: 'Names…', disabled: !d, onclick: () => editPrograms(i) });
        return h('tr', {}, h('td', {}, i + 1), h('td', {}, dev), h('td', {}, name), h('td', {}, gap), h('td', {}, lead), h('td', { class: 'ti-muted' }, numbering), h('td', {}, names));
      }));
      renderEvents();
    }
    function editPrograms(channel) {
      const c = state.rig.channels[channel], d = library.get(c.device);
      const numberField = h('input', { type: 'text', value: d ? D.programLabel(d, d.programChange.bankSelect.banks.length ? 0 : null, 0) : '0', size: 6 });
      const nameField = h('input', { type: 'text', maxLength: 40, placeholder: 'your name for it' });
      const list = h('ul', { class: 'ti-list' });
      const show = () => list.replaceChildren(...Object.entries(c.programs).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => h('li', {}, 'PC ' + k + ': ' + v + ' ', h('button', { type: 'button', textContent: '✕', onclick: () => { delete c.programs[k]; save(); show(); } }))));
      programsBox.replaceChildren(h('p', {}, h('strong', {}, 'Channel ' + (channel + 1) + ' program names'), ' (' + (d ? d.name : 'no device') + '): the device shows ',
        h('label', {}, 'program ', numberField), ' ', h('label', {}, 'call it ', nameField), ' ',
        h('button', { type: 'button', textContent: 'Add', onclick: () => {
          const p = d ? D.programFromLabel(d, numberField.value) : { program: Number(numberField.value) };
          if (!p || !Number.isInteger(p.program)) { message('Not a program number this device shows.'); return; }
          c.programs[String(p.program)] = nameField.value.trim() || ('Program ' + numberField.value); save(); show(); } })),
        list, h('p', { class: 'ti-muted' }, 'Names are stored by MIDI program number (0..127) in the rig profile; a device bank is chosen in the event itself.'));
      show();
    }
    function save() { Rig.rigSave(state.rig); renderSetup(); }
    rigName.addEventListener('change', () => { state.rig.name = rigName.value; save(); });
    const importFile = h('input', { type: 'file', accept: '.json,application/json' });
    importFile.addEventListener('change', async () => {
      const f = importFile.files[0]; importFile.value = ''; if (!f) return;
      try { state.rig = Rig.rigImport(await f.text()); save(); message('Rig profile imported.'); } catch (e) { message('Cannot import rig: ' + e.message); }
    });
    setup.replaceChildren(
      h('p', {}, h('label', {}, 'Profile name ', rigName), ' ',
        h('button', { type: 'button', textContent: 'Export rig (.json)', onclick: () => download(Rig.rigExport(state.rig), (state.rig.name || 'rig').replace(/[^\w-]+/g, '_') + '.rig.json') }), ' ',
        h('label', {}, 'Import rig ', importFile), ' ',
        h('button', { type: 'button', textContent: 'Reset', onclick: () => { if (confirm('Clear the rig profile?')) { state.rig = Rig.rigEmpty(); save(); } } })),
      h('table', { class: 'ti-table' }, h('thead', {}, h('tr', {}, ...['Ch', 'Device', 'Name', 'Gap ms', 'Lead ms', 'Numbering', ''].map(t => h('th', {}, t)))), setupBody),
      h('p', { class: 'ti-muted' }, 'The profile is saved in this browser. Gap: blank = the definition\'s delay need; it becomes gap events in the song when it is written. Lead: the program change leaves this many ms before the bar when a track launches or a scene changes (0 = with the downbeat). Device setup steps (what to set on the gear) are in each definition\'s notes: see BUILD.md section 16.3.'),
      programsBox);

    /* ---- row events ---------------------------------------------------------------------- */
    const rowSelect = h('select'), summary = h('p', { class: 'ti-status' }), list = h('tbody'), override = h('input', { type: 'checkbox' });
    const addChannel = h('select'), addType = h('select', {}, option('program', 'Program'), option('cc', 'Control change'), option('gap', 'Gap'));
    const fields = h('span'), deviceNote = h('p', { class: 'ti-muted' });
    function rowEvents(song, row) { return song.events.filter(e => e.row === row); }
    function renderEvents() {
      const song = state.song;
      events.hidden = !song;
      if (!song) return;
      if (!Array.isArray(song.events)) song.events = [];
      const rig = rigInUse();
      override.checked = !!song.rig;
      if (state.row >= song.rows.length) state.row = 0;
      rowSelect.replaceChildren(...song.rows.map((_, i) => option(i, 'Row ' + (i + 1) + (i === 0 ? ' (SEND SETUP)' : '') + ' — ' + rowEvents(song, i).length + ' event' + (rowEvents(song, i).length === 1 ? '' : 's'), i === state.row)));
      const perRow = song.rows.map((_, i) => rowEvents(song, i).length), over = perRow.some(n => n > 32);
      summary.textContent = 'Events in the song: ' + song.events.length + ' of 292' + (song.events.length > 292 ? ' — too many' : '') + (over ? ' — a row has more than 32' : '') +
        (song.rig ? ' · this song uses its own rig' : ' · using the global rig "' + state.rig.name + '"') + '.';
      const mine = song.events.map((e, i) => ({ e, i })).filter(x => x.e.row === state.row);
      list.replaceChildren(...mine.map((x, k) => h('tr', { class: x.e.type === 3 ? 'ti-muted' : '' },
        h('td', {}, k + 1), h('td', {}, x.e.type === 3 ? '—' : Rig.channelLabel(rig, library, x.e.channel)), h('td', {}, Rig.describe(x.e, rig, library)),
        h('td', {}, h('button', { type: 'button', textContent: '▲', disabled: k === 0, onclick: () => move(x.i, mine[k - 1].i) }), ' ',
          h('button', { type: 'button', textContent: '▼', disabled: k === mine.length - 1, onclick: () => move(x.i, mine[k + 1].i) }), ' ',
          h('button', { type: 'button', textContent: '✕', onclick: () => { song.events.splice(x.i, 1); changed(); } })))));
      addChannel.replaceChildren(...Array.from({ length: 16 }, (_, c) => option(c, Rig.channelLabel(rig, library, c), c === Number(addChannel.value || 0))));
      renderAddFields();
    }
    function move(a, b) { const s = state.song.events; [s[a], s[b]] = [s[b], s[a]]; changed(); }
    function changed() { state.song.events.sort((a, b) => a.row - b.row); onChange(); renderEvents(); }
    function renderAddFields() {
      const rig = rigInUse(), channel = Number(addChannel.value || 0), d = Rig.deviceOn(rig, library, channel), type = addType.value;
      fields.replaceChildren();
      deviceNote.textContent = d ? (d.programChange.supported === true ? '' : d.programChange.supported === false ? d.name + ' does not receive program changes.' : d.name + ': program change support is unverified.') +
        (d.unverified.length ? ' Unverified in its definition: ' + d.unverified.join('; ') + '.' : '') : 'No device on this channel in the rig: raw numbers only.';
      if (type === 'gap') {
        const ms = h('input', { type: 'number', min: 1, max: 255, step: 1, value: 20 });
        fields.append(h('label', {}, 'gap ', ms, ' ms'), ' ', h('button', { type: 'button', textContent: 'Add', onclick: () => add({ type: 3, d0: Number(ms.value) || 1, d1: 0, d2: 0 }) }));
        return;
      }
      if (type === 'cc') {
        const named = d ? d.controllers.filter(c => c.cc >= 0) : [];
        const ccSel = h('select', {}, option('', 'raw CC'), ...named.map(c => option(c.cc, 'CC ' + c.cc + ' ' + c.name)));
        const cc = h('input', { type: 'number', min: 0, max: 127, step: 1, value: 74, size: 4 }), value = h('input', { type: 'number', min: 0, max: 127, step: 1, value: 64, size: 4 });
        const meaning = h('span', { class: 'ti-muted' });
        const update = () => { const m = d ? D.valueName(d, Number(cc.value), Number(value.value)) : null; meaning.textContent = m ? ' = ' + m : ''; };
        ccSel.addEventListener('change', () => { if (ccSel.value !== '') cc.value = ccSel.value; update(); });
        cc.addEventListener('input', update); value.addEventListener('input', update);
        fields.append(ccSel, ' ', h('label', {}, 'CC ', cc), ' ', h('label', {}, 'value ', value), meaning, ' ',
          h('button', { type: 'button', textContent: 'Add', onclick: () => add({ type: 2, d0: Number(cc.value), d1: Number(value.value), d2: 0 }) }));
        update();
        return;
      }
      /* program: preset list (names from the definition and the rig), bank, raw number */
      const banks = d ? d.programChange.bankSelect.banks : [];
      const bankSel = banks.length ? h('select', {}, ...banks.map(b => option(b.index, 'bank ' + b.name))) : null;
      const program = h('input', { type: 'number', min: 0, max: 127, step: 1, value: 0, size: 4 });
      const shown = h('span', { class: 'ti-muted' });
      const presets = d ? d.presets.filter(p => p.program !== null) : [];
      const presetSel = h('select', {}, option('', presets.length ? 'choose a preset…' : 'no preset list'),
        ...presets.map(p => option((p.bank === null ? '' : p.bank) + ':' + p.program, D.programLabel(d, p.bank, p.program) + '  ' + p.name)));
      const own = Object.entries(rig.channels[channel].programs);
      if (own.length) presetSel.append(...own.map(([k, v]) => option(':' + k, (d ? D.programLabel(d, bankSel ? Number(bankSel.value) : null, Number(k)) : k) + '  ' + v + ' (rig)')));
      const update = () => {
        const bank = bankSel ? Number(bankSel.value) : null, p = Number(program.value);
        shown.textContent = d ? ' shows ' + D.programLabel(d, bank, p) + (Rig.programName(rig, library, channel, bank, p) ? ' "' + Rig.programName(rig, library, channel, bank, p) + '"' : '') : '';
      };
      presetSel.addEventListener('change', () => { if (presetSel.value === '') return; const [b, p] = presetSel.value.split(':'); if (bankSel && b !== '') bankSel.value = b; program.value = p; update(); });
      if (bankSel) bankSel.addEventListener('change', update);
      program.addEventListener('input', update);
      fields.append(presetSel, ' ', bankSel || '', bankSel ? ' ' : '', h('label', {}, 'PC ', program), shown, ' ',
        h('button', { type: 'button', textContent: 'Add', onclick: () => {
          const bank = bankSel ? Number(bankSel.value) : null, p = Number(program.value);
          if (d && bank !== null) { const bytes = D.bankBytes(d, bank); add({ type: 1, d0: bytes.msb === null ? 255 : bytes.msb, d1: bytes.lsb === null ? 255 : bytes.lsb, d2: p }); }
          else add({ type: 0, d0: p, d1: 0, d2: 0 });
        } }));
      update();
      if (d && d.presets.some(p => p.program === null)) fields.append(h('p', { class: 'ti-muted' }, d.presets.filter(p => p.program === null).length + ' presets of this device have no direct program number (reached through the device\'s own program map): enter the mapped program number.'));
    }
    function add(partial) {
      const song = state.song, channel = Number(addChannel.value || 0);
      const e = { row: state.row, channel, ...partial };
      if (rowEvents(song, state.row).length >= 32) { message('Row ' + (state.row + 1) + ' already has 32 events.'); return; }
      if (song.events.length >= 292) { message('The song already has 292 events.'); return; }
      const after = song.events.map((x, i) => x.row <= state.row ? i : -1).filter(i => i >= 0).pop();
      song.events.splice(after === undefined ? 0 : after + 1, 0, e);
      changed();
    }
    rowSelect.addEventListener('change', () => { state.row = Number(rowSelect.value); renderEvents(); });
    addChannel.addEventListener('change', renderAddFields); addType.addEventListener('change', renderAddFields);
    override.addEventListener('change', () => { if (!state.song) return; state.song.rig = override.checked ? Rig.rigClone(state.rig) : null; onChange(); renderEvents(); });
    events.replaceChildren(
      summary,
      h('p', {}, h('label', {}, 'Row ', rowSelect), ' ', h('label', {}, override, ' this song uses its own copy of the rig (stored in the .tabby, not on the device)')),
      h('table', { class: 'ti-table' }, h('thead', {}, h('tr', {}, ...['#', 'Channel / device', 'Event', ''].map(t => h('th', {}, t)))), list),
      h('p', {}, h('label', {}, 'Add on channel ', addChannel), ' ', h('label', {}, 'type ', addType), ' ', fields),
      deviceNote,
      h('p', { class: 'ti-muted' }, 'Events fire when the row is entered, before its first notes, on all MIDI out ports. Gaps are generated from the rig when the song is written; gaps read back from a device are shown greyed and regenerated.'));

    renderSetup();
    return {
      setSong(song) { state.song = song; state.row = 0; renderEvents(); },
      refresh() { renderEvents(); },
      rig() { return rigInUse(); },
      /* The event list to store: the rig's gaps applied (sorted by row). */
      prepareEvents(song) { return Rig.applyGaps(song.events || [], song.rig || state.rig, library).sort((a, b) => a.row - b.row); },
      trailer(song) { return song.rig ? { rig: song.rig } : null; },
    };
  }

  const TabbyRigUI = { mount, version: '0.1' };
  globalThis.TabbyRigUI = TabbyRigUI;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyRigUI;
})();

/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/timed-note/timed-note.js — the timed note, JavaScript twin of app/timed_note.h
 *
 * Purpose
 *   The same object, the same 6 bytes and the same rules as the C module, for the
 *   workbench (song editor, .tabby files), the MIDI importer and the tests:
 *     { pitch 0..127, velocity 1..127, retrigger true|false, offset -240..240 (units),
 *       length 1..8388480 (units) }
 *   1 unit = 1/480 of a 16th step. The byte layout, the canonical mantissa/exponent rule
 *   and the validation are in docs/TIMED-NOTE.md; tests/timed-note/vectors.txt pins this
 *   file and the C file to identical bytes (tests/timed-note/run.mjs and
 *   tests/host/timed_note_test.c).
 *
 *   Loading: classic script (globalThis.TabbyTimedNote) and CommonJS (module.exports). No
 *   dependency.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-03  Initial version (Task 05, checkpoint a).
 */
(() => {
  'use strict';

  const BYTES = 6, UNITS_PER_STEP = 480, UNITS_PER_QUARTER = 1920, OFFSET_MAX = 240;
  const MANTISSA_MAX = 65535, EXPONENT_MAX = 7, LENGTH_MAX = 65535 * 128;   /* 8388480 */

  const fail = text => { throw new Error(text); };

  /* 1 when every field is inside its range; the length need not be representable. */
  function valid(n) {
    return !!n && Number.isInteger(n.pitch) && n.pitch >= 0 && n.pitch <= 127 &&
      Number.isInteger(n.velocity) && n.velocity >= 1 && n.velocity <= 127 &&
      (n.retrigger === true || n.retrigger === false || n.retrigger === 0 || n.retrigger === 1 || n.retrigger === undefined) &&
      Number.isInteger(n.offset) && n.offset >= -OFFSET_MAX && n.offset <= OFFSET_MAX &&
      Number.isInteger(n.length) && n.length >= 1 && n.length <= LENGTH_MAX;
  }
  /* Mantissa and exponent: the smallest exponent whose mantissa fits 16 bits after
   * rounding to the nearest multiple of 2^e (ties up); a rounded 65536 moves to the next
   * exponent as 32768. */
  function split(length) {
    for (let e = 0; ; e++) {
      const half = e ? 2 ** (e - 1) : 0, m = Math.floor((length + half) / 2 ** e);
      if (m <= MANTISSA_MAX || e === EXPONENT_MAX) return { m: Math.min(m, MANTISSA_MAX), e };
    }
  }
  /* The length the encoder stores: itself up to 65535, else the nearest representable
   * value; 0 stays 0 (invalid), values above the maximum come back as the maximum. */
  function lengthStored(length) {
    if (!(length >= 1)) return 0;
    if (length >= LENGTH_MAX) return LENGTH_MAX;
    const { m, e } = split(Math.round(length));
    return m * 2 ** e;
  }
  /* Canonical 6 bytes for a valid note (length rounded as above); throws when invalid. */
  function encode(n) {
    if (!valid(n)) fail('invalid timed note');
    const { m, e } = split(n.length);
    const w = (n.offset & 0x1ff) | (e << 9);
    return Uint8Array.from([n.pitch | (n.retrigger ? 128 : 0), n.velocity, w & 255, w >> 8, m & 255, m >> 8]);
  }
  /* The note from 6 bytes (any array-like of 6 numbers); throws for a reserved bit set,
   * velocity 0, mantissa 0, a non-canonical exponent or an offset outside the range. */
  function decode(b) {
    if (!b || b.length < BYTES) fail('timed note needs 6 bytes');
    const w = b[2] | (b[3] << 8), e = (w >> 9) & 7, m = b[4] | (b[5] << 8), raw = w & 0x1ff;
    if ((b[1] & 128) || (w & 0xf000)) fail('timed note: reserved bit set');
    if (!(b[1] & 127) || !m || (e && m < 32768)) fail('timed note: velocity 0, mantissa 0 or non-canonical exponent');
    const offset = raw >= 256 ? raw - 512 : raw;
    if (offset < -OFFSET_MAX || offset > OFFSET_MAX) fail('timed note: offset outside ±240');
    return { pitch: b[0] & 127, velocity: b[1] & 127, retrigger: !!(b[0] & 128), offset, length: m * 2 ** e };
  }
  /* Readable forms for the editor: a reduced fraction of a step and milliseconds at a tempo. */
  function offsetFraction(units) {
    if (!units) return '0';
    const g = (a, b) => b ? g(b, a % b) : a, d = g(Math.abs(units), UNITS_PER_STEP);
    return (units < 0 ? '-' : '+') + (Math.abs(units) / d) + '/' + (UNITS_PER_STEP / d);
  }
  const unitMs = bpm => 60000 / (bpm * 4 * UNITS_PER_STEP);

  const TabbyTimedNote = { BYTES, UNITS_PER_STEP, UNITS_PER_QUARTER, OFFSET_MAX, MANTISSA_MAX, EXPONENT_MAX, LENGTH_MAX,
    valid, lengthStored, encode, decode, offsetFraction, unitMs, version: '0.1' };
  globalThis.TabbyTimedNote = TabbyTimedNote;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyTimedNote;
})();

/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/midi-parse.js — Standard MIDI File (SMF) parser for the Classic Tabby importer
 *
 * Purpose
 *   Turn the bytes of a .mid file (type 0 or type 1) into plain JavaScript event lists so
 *   midi-song.js can map them onto Task 03 songs. Own code, no library (Task 02 decision 5):
 *   nothing to add to THIRD_PARTY.md, and the file is small enough to inline into the
 *   workbench HTML at merge time (Task 02 Step 4).
 *
 *   Two input forms, one output:
 *     - binary SMF (MThd/MTrk chunks), the normal .mid;
 *     - mf2t text (first line "MFile <format> <tracks> <division>", then "MTrk" … "TrkEnd"
 *       blocks of "<ticks> <event> …" lines). The XRNS2MIDI / Renoise tool chain writes this
 *       text form and the user's exports arrive in it (Task 02, 2026-11-02), so it is read
 *       directly: On/Off/PoPr/Par/PrCh/ChPr/Pb/SysEx/Arb/Tempo/TimeSig/KeySig/SMPTE/Seqnr and
 *       Meta TrkName/InstrName/Text/Copyright/Lyric/Marker/Cue/TrkEnd/SeqSpec/0xNN lines, with
 *       absolute tick times (the mf2t default; "measure:beat:click" times are refused), note
 *       numbers or note names (c4 = 60). Unknown lines are counted as warnings, not errors.
 *
 *   What the binary reader handles
 *     - header chunk MThd: format 0 and 1; format 2 (independent sequences) is rejected;
 *       SMPTE time division (negative division) is rejected: the importer works in ticks per
 *       quarter note and the files this project cares about (Renoise exports) use PPQ;
 *     - unknown chunks between tracks are skipped (the SMF rule);
 *     - variable-length quantities, running status, note-on with velocity 0 = note-off;
 *     - channel events (note on/off, poly and channel pressure, control change, program
 *       change, pitch bend), meta events (track name 0x03, tempo 0x51, time signature 0x58,
 *       end of track 0x2F; others kept by type number), SysEx F0/F7 (skipped, counted);
 *     - a truncated last track is tolerated: events read so far are kept and a warning is
 *       added, so a slightly damaged export still imports;
 *     - note pairing per (track, channel, pitch): note-off closes the oldest open note of
 *       that pitch; notes still open at the end of the track end at the track's last tick
 *       (counted as "unterminated").
 *
 *   Loading: classic script in the browser (publishes globalThis.TabbyMidi) and CommonJS in
 *   Node (module.exports) so the host tests under tests/midi-import run the same file.
 *
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-02  mf2t text form accepted (the Renoise fixtures are text, not binary).
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2).
 */
(() => {
  'use strict';

  const fail = text => { throw new Error(text); };

  /* Read one variable-length quantity at `at`; returns [value, nextIndex]. */
  function vlq(bytes, at, end) {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      if (at >= end) fail('MIDI file is truncated inside a delta time or length');
      const b = bytes[at++];
      value = (value * 128) + (b & 127);
      if (!(b & 128)) return [value, at];
    }
    fail('MIDI file has an invalid variable-length quantity');
  }

  const ascii = (bytes, from, to) => {
    let text = '';
    for (let i = from; i < to; i++) text += String.fromCharCode(bytes[i]);
    return text;
  };
  const be32 = (b, at) => ((b[at] << 24) >>> 0) + (b[at + 1] << 16) + (b[at + 2] << 8) + b[at + 3];
  const be16 = (b, at) => (b[at] << 8) + b[at + 1];

  /* Decode text meta events: Latin-1 is what trackers and most DAWs write; control bytes
   * are replaced so names are safe to show. */
  const metaText = (bytes, from, to) => ascii(bytes, from, to).replace(/[\x00-\x1f\x7f]/g, ' ').trim();

  /* Parse one MTrk chunk body (bytes[from..to)) into events. */
  function parseTrack(bytes, from, to, index, warnings) {
    const events = [];
    let at = from, tick = 0, status = 0, ended = false;
    try {
      while (at < to && !ended) {
        let delta;
        [delta, at] = vlq(bytes, at, to);
        tick += delta;
        if (at >= to) fail('MIDI track ' + index + ' ends after a delta time');
        let b = bytes[at];
        if (b === 0xff) {                                   /* meta event */
          if (at + 2 > to) fail('MIDI track ' + index + ' is truncated inside a meta event');
          const type = bytes[at + 1];
          let length; [length, at] = vlq(bytes, at + 2, to);
          if (at + length > to) fail('MIDI track ' + index + ' is truncated inside a meta event');
          const data = bytes.subarray(at, at + length);
          at += length;
          if (type === 0x2f) { ended = true; events.push({ tick, type: 'endOfTrack' }); }
          else if (type === 0x51 && length === 3) {
            const mpq = (data[0] << 16) + (data[1] << 8) + data[2];
            events.push({ tick, type: 'tempo', microsecondsPerQuarter: mpq, bpm: mpq ? 60000000 / mpq : 0 });
          } else if (type === 0x58 && length >= 2) {
            events.push({ tick, type: 'timeSignature', numerator: data[0], denominator: 2 ** data[1], metronome: data[2], thirtySeconds: data[3] });
          } else if (type === 0x03) events.push({ tick, type: 'trackName', text: metaText(bytes, at - length, at) });
          else if (type === 0x04) events.push({ tick, type: 'instrumentName', text: metaText(bytes, at - length, at) });
          else if (type === 0x06) events.push({ tick, type: 'marker', text: metaText(bytes, at - length, at) });
          else if (type === 0x05) events.push({ tick, type: 'lyric', text: metaText(bytes, at - length, at) });
          else if (type === 0x59 && length === 2) events.push({ tick, type: 'keySignature', sharps: (data[0] << 24) >> 24, minor: data[1] === 1 });
          else events.push({ tick, type: 'meta', metaType: type, length });
          status = 0;                                        /* meta events cancel running status */
        } else if (b === 0xf0 || b === 0xf7) {              /* SysEx / escape */
          let length; [length, at] = vlq(bytes, at + 1, to);
          if (at + length > to) fail('MIDI track ' + index + ' is truncated inside a SysEx event');
          events.push({ tick, type: 'sysex', length: length + 1 });
          at += length;
          status = 0;
        } else {                                             /* channel event */
          if (b & 0x80) { status = b; at++; }
          else if (!status) fail('MIDI track ' + index + ' uses running status before any status byte');
          const kind = status & 0xf0, channel = status & 15;
          const two = kind !== 0xc0 && kind !== 0xd0;
          if (at + (two ? 2 : 1) > to) fail('MIDI track ' + index + ' is truncated inside a channel event');
          const d1 = bytes[at] & 127, d2 = two ? bytes[at + 1] & 127 : 0;
          at += two ? 2 : 1;
          if (kind === 0x90 && d2 > 0) events.push({ tick, type: 'noteOn', channel, pitch: d1, velocity: d2 });
          else if (kind === 0x90 || kind === 0x80) events.push({ tick, type: 'noteOff', channel, pitch: d1, velocity: d2 });
          else if (kind === 0xb0) events.push({ tick, type: 'controlChange', channel, controller: d1, value: d2 });
          else if (kind === 0xc0) events.push({ tick, type: 'programChange', channel, program: d1 });
          else if (kind === 0xe0) events.push({ tick, type: 'pitchBend', channel, value: (d2 << 7 | d1) - 8192 });
          else if (kind === 0xa0) events.push({ tick, type: 'polyPressure', channel, pitch: d1, value: d2 });
          else if (kind === 0xd0) events.push({ tick, type: 'channelPressure', channel, value: d1 });
          else fail('MIDI track ' + index + ' has an unexpected status byte ' + status.toString(16));
        }
      }
    } catch (error) {
      /* Keep what was read; the importer shows the warning next to the file summary. */
      warnings.push({ kind: 'truncated', message: error.message + ' (events read so far were kept)' });
    }
    if (!ended) warnings.push({ kind: 'noEndOfTrack', message: 'MIDI track ' + index + ' has no end-of-track event' });
    return { index, events, lastTick: tick };
  }

  /* Pair note-on / note-off events of one track into notes. Each note: {tick, endTick,
   * channel, pitch, velocity}. Overlapping same-pitch notes are closed oldest first. */
  function pairNotes(track, warnings) {
    const open = new Map(), notes = [];
    const key = e => e.channel * 128 + e.pitch;
    for (const e of track.events) {
      if (e.type === 'noteOn') {
        const note = { tick: e.tick, endTick: -1, channel: e.channel, pitch: e.pitch, velocity: e.velocity };
        notes.push(note);
        const k = key(e); if (!open.has(k)) open.set(k, []);
        open.get(k).push(note);
      } else if (e.type === 'noteOff') {
        const list = open.get(key(e));
        if (list && list.length) list.shift().endTick = e.tick;
      }
    }
    let unterminated = 0;
    for (const list of open.values()) for (const note of list) { note.endTick = Math.max(note.tick, track.lastTick); unterminated++; }
    if (unterminated) warnings.push({ kind: 'unterminated', message: unterminated + ' note(s) on MIDI track ' + track.index + ' had no note-off and end at the end of the track' });
    /* Zero-length notes (note-off at the same tick) are kept; midi-song.js gives them one step. */
    notes.sort((a, b) => a.tick - b.tick || a.channel - b.channel || a.pitch - b.pitch);
    return notes;
  }

  /* ---- mf2t text form ------------------------------------------------------------------ */
  const NOTE_NAMES = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  function noteNumber(text) {
    if (/^-?\d+$/.test(text)) return Number(text);
    const m = /^([a-gA-G])([#b]?)(-?\d+)$/.exec(text);         /* mf2t -n form: c4 = 60 */
    if (!m) fail('mf2t: bad note ' + text);
    return (Number(m[3]) + 1) * 12 + NOTE_NAMES[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  /* "ch=1 n=60 v=100" → {ch:1, n:'60', v:'100'}; values stay strings (notes may be names). */
  function fields(parts) { const f = {}; for (const p of parts) { const i = p.indexOf('='); if (i > 0) f[p.slice(0, i)] = p.slice(i + 1); } return f; }
  const quoted = line => { const m = /"((?:[^"\\]|\\.)*)"/.exec(line); return m ? m[1].replace(/\\(.)/g, '$1') : ''; };

  function parseText(text) {
    const lines = text.split(/\r?\n/), warnings = [], tracks = [];
    const head = /^MFile\s+(\d+)\s+(\d+)\s+(-?\d+)(?:\s+(\d+))?/.exec(lines[0] || '');
    if (!head) fail('mf2t text: first line must be "MFile format tracks division"');
    const format = Number(head[1]), trackCount = Number(head[2]);
    if (format === 2) fail('MIDI format 2 (independent sequences) is not supported; export format 0 or 1');
    if (format > 2) fail('Unknown MIDI format ' + format);
    if (head[3].startsWith('-') || head[4]) fail('SMPTE time division is not supported; export with ticks per quarter note (PPQ)');
    const division = Number(head[3]);
    if (!division) fail('MIDI division (ticks per quarter note) is zero');
    let track = null, lastTick = 0, unknown = 0;
    const pushMeta = (tick, type, length) => track.events.push({ tick, type: 'meta', metaType: type, length });
    for (let ln = 1; ln < lines.length; ln++) {
      const line = lines[ln].trim();
      if (!line) continue;
      if (line === 'MTrk') { track = { index: tracks.length, events: [], lastTick: 0, ended: false }; tracks.push(track); continue; }
      if (line === 'TrkEnd') { if (track && !track.ended) warnings.push({ kind: 'noEndOfTrack', message: 'MIDI track ' + track.index + ' has no Meta TrkEnd event' }); track = null; continue; }
      if (!track) { warnings.push({ kind: 'text', message: 'mf2t line ' + (ln + 1) + ' outside a track ignored' }); continue; }
      const parts = line.split(/\s+/);
      if (/:/.test(parts[0])) fail('mf2t text uses measure:beat:click times; re-run mf2t without -t (absolute ticks)');
      if (!/^\d+$/.test(parts[0])) { warnings.push({ kind: 'text', message: 'mf2t line ' + (ln + 1) + ' has no time: ' + line.slice(0, 40) }); continue; }
      const tick = Number(parts[0]), kind = parts[1], f = fields(parts.slice(2));
      track.lastTick = Math.max(track.lastTick, tick); lastTick = Math.max(lastTick, tick);
      const ch = () => { const c = Number(f.ch); if (!(c >= 1 && c <= 16)) fail('mf2t line ' + (ln + 1) + ': channel ' + f.ch + ' outside 1..16'); return c - 1; };
      switch (kind) {
        case 'On': { const v = Number(f.v) & 127, pitch = noteNumber(f.n) & 127, channel = ch();
          track.events.push(v > 0 ? { tick, type: 'noteOn', channel, pitch, velocity: v } : { tick, type: 'noteOff', channel, pitch, velocity: 0 }); break; }
        case 'Off': track.events.push({ tick, type: 'noteOff', channel: ch(), pitch: noteNumber(f.n) & 127, velocity: Number(f.v) & 127 }); break;
        case 'PoPr': track.events.push({ tick, type: 'polyPressure', channel: ch(), pitch: noteNumber(f.n) & 127, value: Number(f.v) & 127 }); break;
        case 'Par': track.events.push({ tick, type: 'controlChange', channel: ch(), controller: Number(f.c) & 127, value: Number(f.v) & 127 }); break;
        case 'PrCh': track.events.push({ tick, type: 'programChange', channel: ch(), program: Number(f.p) & 127 }); break;
        case 'ChPr': track.events.push({ tick, type: 'channelPressure', channel: ch(), value: Number(f.v) & 127 }); break;
        case 'Pb': track.events.push({ tick, type: 'pitchBend', channel: ch(), value: (Number(f.v) & 16383) - 8192 }); break;
        case 'SysEx': case 'Arb': track.events.push({ tick, type: 'sysex', length: parts.length - 2 }); break;
        case 'Tempo': { const mpq = Number(parts[2]); track.events.push({ tick, type: 'tempo', microsecondsPerQuarter: mpq, bpm: mpq ? 60000000 / mpq : 0 }); break; }
        case 'TimeSig': { const m = /^(\d+)\/(\d+)$/.exec(parts[2] || '');
          if (!m) fail('mf2t line ' + (ln + 1) + ': bad TimeSig');
          track.events.push({ tick, type: 'timeSignature', numerator: Number(m[1]), denominator: Number(m[2]), metronome: Number(parts[3]) || 24, thirtySeconds: Number(parts[4]) || 8 }); break; }
        case 'KeySig': track.events.push({ tick, type: 'keySignature', sharps: Number(parts[2]) || 0, minor: parts[3] === 'minor' }); break;
        case 'SMPTE': case 'Seqnr': pushMeta(tick, kind === 'SMPTE' ? 0x54 : 0x00, 0); break;
        case 'Meta': {
          const sub = parts[2];
          if (sub === 'TrkEnd') { track.events.push({ tick, type: 'endOfTrack' }); track.ended = true; }
          else if (sub === 'TrkName') track.events.push({ tick, type: 'trackName', text: quoted(line) });
          else if (sub === 'InstrName') track.events.push({ tick, type: 'instrumentName', text: quoted(line) });
          else if (sub === 'Marker') track.events.push({ tick, type: 'marker', text: quoted(line) });
          else if (sub === 'Lyric') track.events.push({ tick, type: 'lyric', text: quoted(line) });
          else if (sub === 'Text' || sub === 'Copyright' || sub === 'Cue') pushMeta(tick, sub === 'Text' ? 1 : sub === 'Copyright' ? 2 : 7, quoted(line).length);
          else if (sub === 'SeqSpec') pushMeta(tick, 0x7f, parts.length - 3);
          else if (/^0x[0-9a-f]+$/i.test(sub || '')) pushMeta(tick, Number(sub), parts.length - 3);
          else { unknown++; }
          break; }
        default: unknown++;
      }
    }
    if (track) warnings.push({ kind: 'truncated', message: 'mf2t text ends inside track ' + track.index + ' (no TrkEnd)' });
    if (unknown) warnings.push({ kind: 'text', message: unknown + ' unknown mf2t line(s) ignored' });
    for (const t of tracks) delete t.ended;
    return { format, division, trackCount, tracks, lastTick, warnings, text: true };
  }

  /* Public entry point. Returns
   *   { format, division, trackCount, tracks:[{index, name, events, notes, lastTick, channels:[...]}],
   *     lastTick, warnings:[{kind, message}], text: true when the mf2t form was read } */
  function parse(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.length >= 5 && ascii(bytes, 0, 5) === 'MFile') return finish(parseText(new TextDecoder('latin1').decode(bytes)));
    if (bytes.length < 14 || ascii(bytes, 0, 4) !== 'MThd') fail('Not a Standard MIDI File (missing MThd header; mf2t text must start with "MFile")');
    const headerLength = be32(bytes, 4);
    if (headerLength < 6 || 8 + headerLength > bytes.length) fail('MIDI header length is invalid');
    const format = be16(bytes, 8), trackCount = be16(bytes, 10), divisionRaw = be16(bytes, 12);
    if (format === 2) fail('MIDI format 2 (independent sequences) is not supported; export format 0 or 1');
    if (format > 2) fail('Unknown MIDI format ' + format);
    if (divisionRaw & 0x8000) fail('SMPTE time division is not supported; export with ticks per quarter note (PPQ)');
    const division = divisionRaw;
    if (!division) fail('MIDI division (ticks per quarter note) is zero');
    const warnings = [], tracks = [];
    let at = 8 + headerLength;
    while (at + 8 <= bytes.length && tracks.length < trackCount) {
      const id = ascii(bytes, at, at + 4), length = be32(bytes, at + 4);
      const from = at + 8, to = Math.min(bytes.length, from + length);
      if (from + length > bytes.length) warnings.push({ kind: 'truncated', message: 'Chunk ' + id + ' claims ' + length + ' bytes but the file ends early' });
      if (id === 'MTrk') tracks.push(parseTrack(bytes, from, to, tracks.length, warnings));
      else warnings.push({ kind: 'unknownChunk', message: 'Skipped unknown chunk ' + JSON.stringify(id) });
      at = to;
    }
    return finish({ format, division, trackCount, tracks, warnings });
  }

  /* Shared tail of both readers: pair notes, name tracks, list channels, file-level checks. */
  function finish(result) {
    const { format, tracks, warnings } = result;
    for (const track of tracks) {
      track.notes = pairNotes(track, warnings);
      track.name = (track.events.find(e => e.type === 'trackName') || {}).text || '';
      track.channels = [...new Set(track.notes.map(n => n.channel))].sort((a, b) => a - b);
    }
    if (tracks.length !== result.trackCount) warnings.push({ kind: 'trackCount', message: 'Header announces ' + result.trackCount + ' track(s), file holds ' + tracks.length });
    if (!tracks.length) fail('MIDI file holds no track');
    if (format === 0 && tracks.length > 1) warnings.push({ kind: 'format0', message: 'Format 0 file with more than one track; all tracks are read' });
    result.lastTick = Math.max(0, ...tracks.map(t => t.lastTick), ...tracks.flatMap(t => t.notes.map(n => n.endTick)));
    return result;
  }

  const TabbyMidi = { parse, parseText, pairNotes, vlq, noteNumber, version: '0.2' };
  globalThis.TabbyMidi = TabbyMidi;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyMidi;
})();

/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/song-format.js — Task 03 song and block format: model, encoding, validation
 *
 * Purpose
 *   One place that knows the bytes of the Classic Tabby song format, so the importer
 *   (midi-song.js), the transfer layer (song-transfer.js), the UI and the tests share it.
 *   The byte layouts follow docs/tasks/TASK-03-step1-assessment.md section 9 ("final"):
 *     9.3 block payload: 64 step headers, 0..4 notes of 3 bytes each, 64..832 bytes;
 *     9.4 block record (v0.4): song, reserved, block id (u16 LE), length (u16 LE), payload,
 *         padded to 4 bytes;
 *     9.5 song record (v0.4): 4096 bytes, 64-byte header with eight per-track output
 *         channels at offset 48, then 128 rows × 20 bytes at offset 64 (8 × u16 block ids,
 *         repeat, flags, step length 16/32/48/64, reserved), CRC over bytes 20..2623;
 *     9.9 .tabby file: song record image (generation 0, target 0, commit 0, CRC valid)
 *         followed by block records with song byte 0, 4-byte aligned, to end of file.
 *
 *   The JavaScript song model (what the importer builds and the UI shows), since Task 05
 *   schema 'tabby-song/2' (a 'tabby-song/1' file loads and is upgraded: offset 0, length in
 *   steps × 480, swing false):
 *     { schema: 'tabby-song/2', name, projectSlot, tempo (0 = project tempo), loop,
 *       jumpMode: 'bar' | 'row', loopRow, swing (bool: v2 blocks follow the project swing),
 *       outChannels: [8 × (null | 0..15)],     // null = use the device setting (byte 0)
 *       rows:   [{ blocks: [8 × id], repeat: 1..64, loopHere: false, steps: 16|32|48|64 }],
 *       blocks: [{ id: 1..65535, notes: [{ step, pitch, velocity, offset, length, retrigger }],
 *                  stepFlags: { step: { probability, alt } } (optional) }] }
 *   A note's offset is −240..240 units from its step and its length 1..8388480 units
 *   (1 unit = 1/480 step; web/timed-note/timed-note.js, docs/TIMED-NOTE.md). Blocks are
 *   written as payload format 1 (section 9.12, 6-byte timed notes); format 0 (9.3, 3-byte
 *   notes) is read from .tabby files and upgraded.
 *
 *   Row step length and output channels (section 9 v0.3, commit b7abb99): a row plays steps
 *   0..N-1 of each of its blocks per repeat; the byte value 0 reads as 64 so zero-filled
 *   unused rows stay valid. Output channel bytes are 0 (device setting) or 1..16; the model
 *   keeps null or 0..15 (the UI's "ch 1..16" minus one) and converts at the byte boundary.
 *
 *   Loading: classic script (globalThis.TabbySongFormat) and CommonJS (module.exports).
 *
 *   Row events (Task 04, section 9.11 v0.6): `events` [{ row, channel 0..15, type 0 PC |
 *   1 bank+PC | 2 CC | 3 gap, d0, d1, d2 }] in firing order; a song with events encodes as a
 *   version-2 record (event table at 2624, CRC over 20..4091), without as version 1. The
 *   optional `rig` (a tabby-rig/1 profile, the per-song override) travels in the `.tabby`
 *   trailer (0xFF, "TRIG", u32 length, JSON) and never reaches the device.
 *
 * Version: 0.5
 *
 * Revision log
 *   v0.5  2026-11-03  Task 05: timed notes (section 9.12): model schema tabby-song/2 with offset
 *                     and length in units, payload format 1 encode, format 0 and 1 decode,
 *                     block record byte 1, song swing flag, quantize helpers, JSON upgrade.
 *   v0.4  2026-11-02  Task 04: row events (version-2 records), the .tabby trailer.
 *   v0.3  2026-11-02  Section 9 v0.4 (commit 2d4ef83): 16-bit block ids (1..65535, at most
 *                     2048 per song), 6-byte block record header, 20-byte rows, CRC over
 *                     20..2623, header byte 41 reserved. structuralKey() added for the
 *                     importer's loose deduplication.
 *   v0.2  2026-11-02  Section 9 v0.3 layout: per-row step length (row byte 10, rows now 12
 *                     bytes at offset 64) and per-track output channels (header offset 48);
 *                     body CRC over 20..1599. The v0.1 placeholder functions are gone;
 *                     rows carry `steps`; song.rowSteps is no longer a model field.
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2): model, block/record/file encoding
 *                     and decoding, validation rules, pool usage, JSON save/load, CRC-32.
 */
(() => {
  'use strict';

  const fail = text => { throw new Error(text); };
  const T = () => globalThis.TabbyTimedNote || (typeof require === 'function' ? require('../timed-note/timed-note.js') : fail('timed-note.js not loaded'));

  /* Limits and constants from section 9 (v0.7: timed notes). */
  const LIMITS = Object.freeze({
    steps: 64, notesPerStep: 4, noteBytes: 6, noteBytesV1: 3,
    blockMin: 64, blockMax: 1600, blockMaxV1: 832, formatV1: 0, formatV2: 1,
    unitsPerStep: 480, offsetMax: 240,
    blocksPerSong: 2048, idMax: 65535, rowsPerSong: 128, songs: 16, tracks: 8,
    repeatMin: 1, repeatMax: 64, lengthMin: 1, lengthMax: 65535 * 128, lengthStepsV1Max: 255,
    tempoMin: 30, tempoMax: 300, nameLength: 12,
    recordArea: 4076, blockSectors: 96, poolBytes: 96 * 4076,   /* 391296 */
    recordBytes: 4096, rowBytes: 20, rowsOffset: 64, bodyEnd: 2624, channelsOffset: 48, headerBytes: 64, blockHeaderBytes: 6,
    eventsOffset: 2624, eventsStart: 2632, eventBytes: 5, eventsMax: 292, rowEventsMax: 32, recordV2End: 4092,   /* 9.11 v0.6 */
    rowStepsAllowed: [16, 32, 48, 64],
    magicRecord: 0x47314d46, /* FM1G */ magicBlocks: 0x42314d46, /* FM1B */
    version: 1,
  });

  /* ---- CRC-32 (reflected, 0xEDB88320, init/final 0xFFFFFFFF = groove_crc32) ---------- */
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
  function crc32(bytes, previous = 0) {
    let crc = ~previous >>> 0;
    for (let i = 0; i < bytes.length; i++) crc = table[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
    return (~crc) >>> 0;
  }

  /* ---- model helpers ------------------------------------------------------------------- */
  function emptySong(name = 'IMPORTED') {
    return { schema: 'tabby-song/2', name: padName(name), projectSlot: 0, tempo: 0, loop: false, jumpMode: 'bar', loopRow: 0, swing: false,
      outChannels: [null, null, null, null, null, null, null, null], rows: [], blocks: [], events: [] };
  }
  /* 12 printable ASCII characters, space padded, upper case like the device shows names. */
  function padName(text) {
    const clean = String(text || '').toUpperCase().replace(/[^\x20-\x7e]/g, '_').slice(0, LIMITS.nameLength);
    return (clean + ' '.repeat(LIMITS.nameLength)).slice(0, LIMITS.nameLength);
  }
  const sortNotes = notes => notes.slice().sort((a, b) => a.step - b.step || a.pitch - b.pitch || (a.offset | 0) - (b.offset | 0) || a.velocity - b.velocity || a.length - b.length);

  /* ---- block payload (9.3) ------------------------------------------------------------- */
  /* Group a block's notes by step and check every rule the device checks. Returns
   * an array of 64 note arrays (sorted by pitch) or throws. */
  function stepsOf(block, where = 'block') {
    const steps = Array.from({ length: LIMITS.steps }, () => []);
    for (const n of block.notes || []) {
      if (!Number.isInteger(n.step) || n.step < 0 || n.step >= LIMITS.steps) fail(where + ': note step ' + n.step + ' outside 0..63');
      if (!Number.isInteger(n.pitch) || n.pitch < 0 || n.pitch > 127) fail(where + ': pitch ' + n.pitch + ' outside 0..127');
      if (!Number.isInteger(n.velocity) || n.velocity < 1 || n.velocity > 127) fail(where + ': velocity ' + n.velocity + ' outside 1..127');
      if (!Number.isInteger(n.offset | 0) || (n.offset | 0) < -LIMITS.offsetMax || (n.offset | 0) > LIMITS.offsetMax) fail(where + ': offset ' + n.offset + ' outside -240..240 units');
      if (!Number.isInteger(n.length) || n.length < LIMITS.lengthMin || n.length > LIMITS.lengthMax) fail(where + ': length ' + n.length + ' outside 1..' + LIMITS.lengthMax + ' units');
      steps[n.step].push(n);
    }
    steps.forEach((list, s) => {
      if (list.length > LIMITS.notesPerStep) fail(where + ': step ' + s + ' holds ' + list.length + ' notes (max 4)');
      list.sort((a, b) => a.pitch - b.pitch);
      for (let i = 1; i < list.length; i++) if (list[i].pitch === list[i - 1].pitch) fail(where + ': step ' + s + ' holds pitch ' + list[i].pitch + ' twice');
      const flags = (block.stepFlags || {})[s];
      if (flags) {
        if (!Number.isInteger(flags.probability || 0) || (flags.probability || 0) < 0 || (flags.probability || 0) > 7) fail(where + ': step ' + s + ' probability outside 0..7');
      }
    });
    return steps;
  }
  /* Payload format 1 (9.12): step header, then 6-byte timed notes. The length is stored
   * as the module stores it (exact up to 65535 units, then rounded by the exponent). */
  function encodeBlock(block, where) {
    const steps = stepsOf(block, where), out = [], TN = T();
    steps.forEach((list, s) => {
      const flags = (block.stepFlags || {})[s] || {};
      out.push(list.length | ((flags.probability || 0) << 3) | (flags.alt ? 64 : 0));
      for (const n of list) out.push(...TN.encode({ pitch: n.pitch, velocity: n.velocity, retrigger: !!n.retrigger, offset: n.offset | 0, length: n.length }));
    });
    return Uint8Array.from(out);
  }
  /* A payload of either format (format 0: 9.3, 3-byte notes, upgraded to offset 0 and
   * whole-step lengths; format 1: 9.12) back to a block. */
  function decodeBlock(bytes, id = 0, format = LIMITS.formatV2) {
    const notes = [], stepFlags = {}, TN = T(), size = format === LIMITS.formatV1 ? LIMITS.noteBytesV1 : LIMITS.noteBytes;
    if (format !== LIMITS.formatV1 && format !== LIMITS.formatV2) fail('block payload format ' + format + ' unknown');
    let at = 0;
    for (let s = 0; s < LIMITS.steps; s++) {
      if (at >= bytes.length) fail('block payload ends inside step ' + s);
      const h = bytes[at++], count = h & 7;
      if (count > 4 || (h & 128)) fail('block payload step ' + s + ' header invalid');
      if (h & 0x78) stepFlags[s] = { probability: (h >> 3) & 7, alt: !!(h & 64) };
      for (let i = 0; i < count; i++) {
        if (at + size > bytes.length) fail('block payload ends inside a note');
        if (format === LIMITS.formatV1) {
          if (!(bytes[at + 1] & 127) || !bytes[at + 2]) fail('block payload step ' + s + ' note invalid');
          notes.push({ step: s, pitch: bytes[at] & 127, velocity: bytes[at + 1] & 127, offset: 0, length: bytes[at + 2] * LIMITS.unitsPerStep, retrigger: !!(bytes[at + 1] & 128) });
        } else {
          let n; try { n = TN.decode(bytes.subarray(at, at + size)); } catch (e) { fail('block payload step ' + s + ': ' + e.message); }
          notes.push({ step: s, pitch: n.pitch, velocity: n.velocity, offset: n.offset, length: n.length, retrigger: n.retrigger });
        }
        at += size;
      }
    }
    if (at !== bytes.length) fail('block payload has ' + (bytes.length - at) + ' trailing byte(s)');
    const block = { id, notes: sortNotes(notes) };
    if (Object.keys(stepFlags).length) block.stepFlags = stepFlags;
    stepsOf(block, 'block ' + id);                     /* re-check ranges and duplicates */
    return block;
  }
  /* Deduplication key: the exact payload bytes as a string (identical bytes = same block). */
  function blockKey(notes) { return String.fromCharCode(...encodeBlock({ notes })); }
  /* Loose deduplication (importer option): the same notes ignoring velocity. Two blocks with
   * equal structural keys differ only in velocities, position for position. */
  function structuralKey(notes) { return sortNotes(notes).map(n => n.step + ':' + n.pitch + ':' + (n.offset | 0) + ':' + n.length + (n.retrigger ? 'r' : '')).join(','); }

  /* ---- block record (9.4) and .tabby file (9.9) --------------------------------------- */
  const align4 = n => (n + 3) & ~3;
  function encodeBlockRecord(block, song = 0) {
    const payload = encodeBlock(block, 'block ' + block.id);
    const out = new Uint8Array(align4(LIMITS.blockHeaderBytes + payload.length)).fill(0xff);
    out[0] = song; out[1] = LIMITS.formatV2;                             /* 9.4 v0.7: byte 1 = payload format */
    out[2] = block.id & 255; out[3] = block.id >> 8;                     /* 16-bit id */
    out[4] = payload.length & 255; out[5] = payload.length >> 8;
    out.set(payload, LIMITS.blockHeaderBytes);
    return out;
  }

  /* ---- song record (9.5) --------------------------------------------------------------- */
  function encodeRecord(song, { generation = 0, target = 0 } = {}) {
    checkSong(song);
    const r = new Uint8Array(LIMITS.recordBytes), v = new DataView(r.buffer);
    r.fill(0xff, LIMITS.bodyEnd);                       /* 2624..4095 reserved 0xFF */
    v.setUint32(0, LIMITS.magicRecord, true);
    v.setUint32(4, generation >>> 0, true);
    v.setUint32(8, target >>> 0, true);
    v.setUint32(16, 0, true);                           /* commit = complete */
    const events = (song.events || []).slice().sort((a, b) => a.row - b.row);
    v.setUint32(20, events.length ? 2 : LIMITS.version, true);   /* 9.11: version 2 carries events */
    const name = padName(song.name);
    for (let i = 0; i < LIMITS.nameLength; i++) r[24 + i] = name.charCodeAt(i);
    r[36] = song.projectSlot;
    r[37] = (song.loop ? 1 : 0) | (song.jumpMode === 'row' ? 2 : 0) | (song.swing ? 4 : 0);   /* bit 2 (9.12): swing for v2 blocks */
    v.setUint16(38, song.tempo, true);
    r[40] = song.rows.length;
    r[41] = 0;                                          /* v0.4: reserved (was the block count) */
    r[42] = song.loopRow;
    /* v0.3: per-track output channel bytes, 0 = device setting, 1..16 = MIDI channel. */
    for (let t = 0; t < 8; t++) r[LIMITS.channelsOffset + t] = song.outChannels[t] === null ? 0 : song.outChannels[t] + 1;
    song.rows.forEach((row, i) => {
      const at = LIMITS.rowsOffset + i * LIMITS.rowBytes;
      for (let t = 0; t < 8; t++) v.setUint16(at + 2 * t, row.blocks[t], true);   /* v0.4: 16-bit ids */
      r[at + 16] = row.repeat; r[at + 17] = row.loopHere ? 1 : 0;
      r[at + 18] = row.steps;                           /* step length, written explicitly */
      r[at + 19] = 0;
    });
    if (events.length) {
      v.setUint16(LIMITS.eventsOffset, events.length, true); r[LIMITS.eventsOffset + 2] = 1; r[LIMITS.eventsOffset + 3] = 0; v.setUint32(LIMITS.eventsOffset + 4, 0, true);
      events.forEach((e, i) => { const at = LIMITS.eventsStart + i * LIMITS.eventBytes; r[at] = e.row; r[at + 1] = (e.channel & 15) | (e.type << 4); r[at + 2] = e.d0 | 0; r[at + 3] = e.d1 | 0; r[at + 4] = e.d2 | 0; });
    }
    v.setUint32(12, crc32(r.subarray(20, events.length ? LIMITS.recordV2End : LIMITS.bodyEnd)), true);
    return r;
  }
  function decodeRecord(r) {
    if (!(r instanceof Uint8Array) || r.length !== LIMITS.recordBytes) fail('song record must be 4096 bytes');
    const v = new DataView(r.buffer, r.byteOffset, r.byteLength);
    if (v.getUint32(0, true) !== LIMITS.magicRecord) fail('song record magic is not FM1G');
    const version = v.getUint32(20, true);
    if (version !== 1 && version !== 2) fail('song record version ' + version + ' unsupported');
    if (v.getUint32(12, true) !== crc32(r.subarray(20, version === 2 ? LIMITS.recordV2End : LIMITS.bodyEnd))) fail('song record CRC mismatch');
    const song = emptySong('');
    song.name = String.fromCharCode(...r.subarray(24, 36));
    if (r[37] & ~7) fail('song record flags byte ' + r[37] + ' invalid');
    song.projectSlot = r[36]; song.loop = !!(r[37] & 1); song.jumpMode = r[37] & 2 ? 'row' : 'bar'; song.swing = !!(r[37] & 4);
    song.tempo = v.getUint16(38, true); song.loopRow = r[42];
    if (song.tempo && (song.tempo < LIMITS.tempoMin || song.tempo > LIMITS.tempoMax)) fail('song record tempo override ' + song.tempo + ' invalid (0 or 30..300)');   /* (f): as the device */
    song.outChannels = Array.from(r.subarray(LIMITS.channelsOffset, LIMITS.channelsOffset + 8), (c, t) => {
      if (c > 16) fail('song record track ' + (t + 1) + ' output channel byte ' + c + ' invalid (0..16)');
      return c ? c - 1 : null;
    });
    const rowCount = r[40];
    for (let i = 0; i < rowCount; i++) {
      const at = LIMITS.rowsOffset + i * LIMITS.rowBytes;
      const steps = r[at + 18] || 64;                     /* 0 reads as 64 (section 9.5) */
      if (!LIMITS.rowStepsAllowed.includes(steps)) fail('song record row ' + (i + 1) + ' step length ' + r[at + 18] + ' invalid');
      song.rows.push({ blocks: Array.from({ length: 8 }, (_, t) => v.getUint16(at + 2 * t, true)), repeat: r[at + 16], loopHere: !!(r[at + 17] & 1), steps });
    }
    song.events = [];
    if (version === 2) {                                /* 9.11: the event table, validated as the device does */
      const n = v.getUint16(LIMITS.eventsOffset, true);
      if (n > LIMITS.eventsMax || r[LIMITS.eventsOffset + 2] !== 1 || r[LIMITS.eventsOffset + 3] !== 0 || v.getUint32(LIMITS.eventsOffset + 4, true) !== 0) fail('song record event table header invalid');
      for (let i = 0; i < n; i++) { const at = LIMITS.eventsStart + i * LIMITS.eventBytes; song.events.push({ row: r[at], channel: r[at + 1] & 15, type: r[at + 1] >> 4, d0: r[at + 2], d1: r[at + 3], d2: r[at + 4] }); }
      for (let i = LIMITS.eventsStart + n * LIMITS.eventBytes; i < LIMITS.recordV2End; i++) if (r[i] !== 0xff) fail('song record bytes after the event table are not 0xFF');
      const problems = validateEvents(song.events, rowCount); if (problems.length) fail('song record ' + problems[0]);
    }
    song.generation = v.getUint32(4, true); song.commit = v.getUint32(16, true);
    return song;
  }
  /* Event rules of 9.11 (device, workbench and importer agree). Returns a list of errors. */
  function validateEvents(events, rows) {
    const errors = [], b = x => Number.isInteger(x) && x >= 0 && x <= 127, bb = x => b(x) || x === 255;
    if (!Array.isArray(events)) return ['events must be an array'];
    if (events.length > LIMITS.eventsMax) errors.push('has ' + events.length + ' events (max 292)');
    let last = -1, inRow = 0;
    events.forEach((e, i) => {
      if (!e || !Number.isInteger(e.row) || e.row < 0 || e.row >= rows) { errors.push('event ' + (i + 1) + ' row outside the song'); return; }
      if (e.row < last) errors.push('event ' + (i + 1) + ' out of row order');
      inRow = e.row === last ? inRow + 1 : 1; last = e.row;
      if (inRow > LIMITS.rowEventsMax) errors.push('row ' + (e.row + 1) + ' has more than 32 events');
      if (!Number.isInteger(e.channel) || e.channel < 0 || e.channel > 15) errors.push('event ' + (i + 1) + ' channel outside 1..16');
      if (e.type === 0) { if (!b(e.d0) || e.d1 || e.d2) errors.push('event ' + (i + 1) + ' program invalid'); }
      else if (e.type === 1) { if (!bb(e.d0) || !bb(e.d1) || !b(e.d2)) errors.push('event ' + (i + 1) + ' bank/program invalid'); }
      else if (e.type === 2) { if (!b(e.d0) || !b(e.d1) || e.d2) errors.push('event ' + (i + 1) + ' control change invalid'); }
      else if (e.type === 3) { if (!Number.isInteger(e.d0) || e.d0 < 1 || e.d0 > 255 || e.d1 || e.d2) errors.push('event ' + (i + 1) + ' gap must be 1..255 ms'); }
      else errors.push('event ' + (i + 1) + ' type invalid');
    });
    return errors;
  }
  function encodeFile(song) {
    const record = encodeRecord(song);
    const parts = [record, ...song.blocks.slice().sort((a, b) => a.id - b.id).map(b => encodeBlockRecord(b, 0))];
    if (song.rig) {                                     /* 9.11 trailer: workbench-only data */
      const json = new TextEncoder().encode(JSON.stringify({ rig: song.rig })), head = new Uint8Array(9);
      head[0] = 0xff; head.set([84, 82, 73, 71], 1); new DataView(head.buffer).setUint32(5, json.length, true);
      parts.push(head, json);
    }
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let at = 0; for (const p of parts) { out.set(p, at); at += p.length; }
    return out;
  }
  function decodeFile(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length < LIMITS.recordBytes) fail('.tabby file is shorter than one song record');
    const song = decodeRecord(bytes.subarray(0, LIMITS.recordBytes));
    let at = LIMITS.recordBytes;
    while (at < bytes.length) {
      if (bytes[at] === 0xff) break;                      /* erased filler */
      const H = LIMITS.blockHeaderBytes;
      if (at + H > bytes.length) fail('.tabby block record header truncated');
      const songByte = bytes[at], format = bytes[at + 1], id = bytes[at + 2] | bytes[at + 3] << 8, length = bytes[at + 4] | bytes[at + 5] << 8;
      if (songByte !== 0) fail('.tabby block record song byte must be 0');
      if (format !== LIMITS.formatV1 && format !== LIMITS.formatV2) fail('.tabby block record ' + id + ' payload format ' + format + ' unknown');
      if (!id) fail('.tabby block record id 0 is invalid');
      const max = format === LIMITS.formatV1 ? LIMITS.blockMaxV1 : LIMITS.blockMax;
      if (length < LIMITS.blockMin || length > max || at + H + length > bytes.length) fail('.tabby block record ' + id + ' length invalid');
      song.blocks.push(decodeBlock(bytes.subarray(at + H, at + H + length), id, format));
      at = align4(at + H + length);
    }
    if (at + 9 <= bytes.length && bytes[at] === 0xff && String.fromCharCode(...bytes.subarray(at + 1, at + 5)) === 'TRIG') {
      const len = new DataView(bytes.buffer, bytes.byteOffset + at + 5, 4).getUint32(0, true);
      if (at + 9 + len > bytes.length) fail('.tabby trailer truncated');
      let trailer; try { trailer = JSON.parse(new TextDecoder().decode(bytes.subarray(at + 9, at + 9 + len))); } catch (e) { fail('.tabby trailer is not JSON'); }
      if (trailer && trailer.rig) song.rig = trailer.rig;
    }
    checkSong(song);
    return song;
  }

  /* ---- validation (the rule list from the Task 02 Step 1 report, 1.4 item 6) ----------- */
  function validate(song) {
    const errors = [], warnings = [];
    const err = text => errors.push(text), warn = text => warnings.push(text);
    if (!song || song.schema !== 'tabby-song/2') err('not a tabby-song/2 model');
    if (!song) return { errors, warnings, ok: false };
    if (typeof song.name !== 'string' || song.name.length !== LIMITS.nameLength || /[^\x20-\x7e]/.test(song.name)) err('name must be 12 printable ASCII characters');
    if (!Number.isInteger(song.projectSlot) || song.projectSlot < 0 || song.projectSlot > 15) err('project slot outside 0..15');
    if (!Number.isInteger(song.tempo) || (song.tempo !== 0 && (song.tempo < LIMITS.tempoMin || song.tempo > LIMITS.tempoMax))) err('tempo must be 0 or 30..300');
    if (!['bar', 'row'].includes(song.jumpMode)) err('jump mode must be bar or row');
    if (typeof song.swing !== 'boolean') err('swing must be true or false');
    if (!Array.isArray(song.rows) || song.rows.length < 1) err('song needs at least one row');
    else if (song.rows.length > LIMITS.rowsPerSong) err('song has ' + song.rows.length + ' rows (max 128)');
    if (!Number.isInteger(song.loopRow) || song.loopRow < 0 || song.loopRow >= Math.max(1, (song.rows || []).length)) err('loop row outside the row list');
    const ids = new Map();
    for (const b of song.blocks || []) {
      if (!Number.isInteger(b.id) || b.id < 1 || b.id > LIMITS.idMax) err('block id ' + b.id + ' outside 1..65535');
      if (ids.has(b.id)) err('block id ' + b.id + ' used twice');
      ids.set(b.id, b);
      try { const bytes = encodeBlock(b, 'block ' + b.id); if (bytes.length < LIMITS.blockMin || bytes.length > LIMITS.blockMax) err('block ' + b.id + ' payload ' + bytes.length + ' bytes'); }
      catch (e) { err(e.message); }
    }
    if ((song.blocks || []).length > LIMITS.blocksPerSong) err('song has ' + song.blocks.length + ' blocks (max 2048 per song)');
    const used = new Set();
    (song.rows || []).forEach((row, i) => {
      if (!Array.isArray(row.blocks) || row.blocks.length !== 8) { err('row ' + (i + 1) + ' needs 8 block ids'); return; }
      row.blocks.forEach((id, t) => {
        if (!Number.isInteger(id) || id < 0 || id > LIMITS.idMax) err('row ' + (i + 1) + ' track ' + (t + 1) + ' block id invalid');
        else if (id) { used.add(id); if (!ids.has(id)) err('row ' + (i + 1) + ' track ' + (t + 1) + ' references missing block ' + id); }
      });
      if (!Number.isInteger(row.repeat) || row.repeat < LIMITS.repeatMin || row.repeat > LIMITS.repeatMax) err('row ' + (i + 1) + ' repeat outside 1..64');
      if (!LIMITS.rowStepsAllowed.includes(row.steps)) err('row ' + (i + 1) + ' step length must be 16, 32, 48 or 64');
      else if (row.steps < 64) row.blocks.forEach((id, t) => { const b = ids.get(id); if (b && b.notes.some(n => n.step >= row.steps)) warn('row ' + (i + 1) + ' track ' + (t + 1) + ': block ' + id + ' has notes beyond step ' + row.steps + ' that this row never plays'); });
    });
    for (const id of ids.keys()) if (!used.has(id)) warn('block ' + id + ' is stored but no row uses it');
    validateEvents(song.events || [], (song.rows || []).length).forEach(err);   /* 9.11 */
    const u = errors.length ? null : usage(song);
    if (u && u.recordBytes > LIMITS.poolBytes) err('blocks need ' + u.recordBytes + ' bytes, the pool holds ' + LIMITS.poolBytes);
    if (!Array.isArray(song.outChannels) || song.outChannels.length !== 8 || song.outChannels.some(c => c !== null && !(Number.isInteger(c) && c >= 0 && c <= 15))) err('outChannels must be 8 entries of null or 0..15');
    return { errors, warnings, ok: !errors.length };
  }
  function checkSong(song) { const r = validate(song); if (!r.ok) fail(r.errors[0]); }

  /* ---- pool usage ---------------------------------------------------------------------- */
  /* Bytes as stored on the device (record header + payload, 4-byte aligned), and the number
   * of 4076-byte sector areas a first-fit-decreasing packing needs. */
  function usage(song) {
    const sizes = song.blocks.map(b => align4(LIMITS.blockHeaderBytes + encodeBlock(b).length));
    const payloadBytes = song.blocks.reduce((n, b) => n + encodeBlock(b).length, 0);
    const recordBytes = sizes.reduce((n, s) => n + s, 0);
    const bins = [];
    for (const s of sizes.slice().sort((a, b) => b - a)) {
      const bin = bins.find(free => free >= s);
      if (bin !== undefined) bins[bins.indexOf(bin)] -= s; else bins.push(LIMITS.recordArea - s);
    }
    const cells = song.rows.reduce((n, r) => n + r.blocks.filter(Boolean).length, 0);
    return { blocks: song.blocks.length, idPercent: song.blocks.length / LIMITS.blocksPerSong * 100, payloadBytes, recordBytes,
      sectors: bins.length, poolPercent: recordBytes / LIMITS.poolBytes * 100, rows: song.rows.length,
      repeats: song.rows.reduce((n, r) => n + r.repeat, 0), cells, fileBytes: LIMITS.recordBytes + recordBytes };
  }

  /* ---- JSON save / load (browser round trip, Task 02 Step 3) --------------------------- */
  function toJSON(song, extra = {}) {
    checkSong(song);
    /* tabby-song/2: a note is [step, pitch, velocity, length (units), offset, retrigger]. */
    const data = { ...song, ...extra, blocks: song.blocks.map(b => ({ id: b.id, ...(b.stepFlags ? { stepFlags: b.stepFlags } : {}),
      notes: sortNotes(b.notes).map(n => n.retrigger ? [n.step, n.pitch, n.velocity, n.length, n.offset | 0, 1] : [n.step, n.pitch, n.velocity, n.length, n.offset | 0]) })) };
    return JSON.stringify(data, null, 1);
  }
  function fromJSON(text) {
    const data = typeof text === 'string' ? JSON.parse(text) : text;
    if (!data || (data.schema !== 'tabby-song/1' && data.schema !== 'tabby-song/2')) fail('not a tabby-song/1 or tabby-song/2 JSON file');
    const v1 = data.schema === 'tabby-song/1';           /* lengths in steps, no offsets: upgraded here */
    const song = { ...emptySong(''), ...data, schema: 'tabby-song/2', swing: !v1 && !!data.swing };
    song.blocks = (data.blocks || []).map(b => ({ id: b.id, ...(b.stepFlags ? { stepFlags: b.stepFlags } : {}),
      notes: (b.notes || []).map(n => Array.isArray(n)
        ? (v1 ? { step: n[0], pitch: n[1], velocity: n[2], offset: 0, length: n[3] * LIMITS.unitsPerStep, retrigger: !!n[4] }
              : { step: n[0], pitch: n[1], velocity: n[2], length: n[3], offset: n[4] | 0, retrigger: !!n[5] })
        : { ...n, offset: v1 ? 0 : n.offset | 0, length: v1 ? n.length * LIMITS.unitsPerStep : n.length, retrigger: !!n.retrigger }) }));
    song.rows = (data.rows || []).map(r => ({ blocks: Array.from(r.blocks || []), repeat: r.repeat, loopHere: !!r.loopHere, steps: r.steps || data.rowSteps || 64 }));
    song.events = (data.events || []).map(e => ({ row: e.row, channel: e.channel, type: e.type, d0: e.d0 | 0, d1: e.d1 | 0, d2: e.d2 | 0 }));
    delete song.rowSteps;                                 /* v0.1 files: the length now lives in each row */
    checkSong(song);
    return song;
  }

  /* Expand a song back to its cell grid (row × track → notes) for the deduplication tests
   * and for views: repeats are not unrolled, rows are the stored rows. */
  function grid(song) {
    const byId = new Map(song.blocks.map(b => [b.id, b]));
    return song.rows.map(r => r.blocks.map(id => id ? sortNotes(byId.get(id).notes) : []));
  }

  /* ---- quantize (Task 05: an option, never the default) --------------------------------- */
  /* 'starts': every offset becomes 0 (the note moves to its step, the length stays).
   * 'startsEnds': offsets 0 and lengths rounded to whole steps by `rule` ('nearest' with
   * ties up, 'up', 'down'; at least one step). Returns the number of notes changed. */
  function quantizeNotes(notes, mode, rule = 'nearest') {
    let changed = 0;
    const U = LIMITS.unitsPerStep;
    for (const n of notes) {
      let offset = n.offset | 0, length = n.length;
      if (mode === 'starts' || mode === 'startsEnds') offset = 0;
      if (mode === 'startsEnds') {
        const steps = rule === 'up' ? Math.ceil(length / U) : rule === 'down' ? Math.floor(length / U) : Math.floor(length / U + 0.5);
        length = Math.max(1, steps) * U;
      }
      if (offset !== (n.offset | 0) || length !== n.length) { n.offset = offset; n.length = length; changed++; }
    }
    return changed;
  }
  function quantize(song, mode, rule) { return song.blocks.reduce((n, b) => n + quantizeNotes(b.notes, mode, rule), 0); }

  const TabbySongFormat = { LIMITS, crc32, emptySong, padName, sortNotes, encodeBlock, decodeBlock, blockKey, structuralKey, encodeBlockRecord, validateEvents,
    encodeRecord, decodeRecord, encodeFile, decodeFile, validate, usage, toJSON, fromJSON, grid, quantize, quantizeNotes, version: '0.5' };
  globalThis.TabbySongFormat = TabbySongFormat;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbySongFormat;
})();

/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/midi-song.js — map a parsed MIDI file onto a Classic Tabby song
 *
 * Purpose
 *   Two stages, both pure functions (no DOM, no device):
 *
 *   analyze(parsed)  — from the output of midi-parse.js: the first tempo and time signature,
 *       later changes (ignored at conversion), the "parts" (one per MIDI track × channel
 *       that holds notes) with name, note count, pitch range and bar span, everything the
 *       format cannot hold (CCs, bends, pressure, program changes, SysEx) counted, the bar
 *       length in 16th steps, the total length in bars and the row lengths that stay on bar
 *       lines (16, 32, 48 or 64 steps).
 *
 *   convert(analysis, options) — the mapping rules approved after the Task 02 Step 1 report,
 *   with the Task 05 timing rules (section 9.12):
 *       * time is kept exactly, in units of 1/480 step (1/1920 quarter): a note belongs to
 *         the 16th step nearest its start (a start exactly half a step late belongs to the
 *         earlier step) and carries the signed offset from it; its length is end − start in
 *         units (at least 1). PPQ values that divide 1920 convert exactly; others are rounded
 *         to the nearest unit and reported (kind ppqRounded);
 *       * quantize (option, off by default): 'starts' moves every start to its step (offset
 *         0, length kept), 'startsEnds' also rounds lengths to whole steps with the length
 *         rule 'nearest' (default), 'up' (never shorter) or 'down' (never longer); the
 *         'moved' and 'lengthRounded' warnings then list what changed;
 *       * notes outside the chosen bar range are dropped, notes ending past it are clipped;
 *       * same pitch overlapping on one track: the earlier note is clipped to end where the
 *         next one starts; two same-pitch notes anchored on one step keep the louder
 *         (retrigger bit never set);
 *       * more than 4 notes starting on one step on one track: keep the 4 'loudest' (default,
 *         tie → higher pitch), 'highest' or 'lowest';
 *       * tempo: the file's first tempo, rounded to an integer BPM and clamped to 30..300,
 *         becomes the song tempo override; later tempo events are listed and ignored;
 *       * rows: one row per `rowSteps` steps from the start of the bar range (4 bars of 4/4 =
 *         64; 3/4 → 48; see analyze().rowSteps); every row gets that step length (section 9.5
 *         v0.3 row byte 10); blocks are 64 steps and steps beyond rowSteps stay empty;
 *       * deduplication: identical block payloads share one id (0 = silent cell, never
 *         stored); consecutive identical rows merge into one row with a repeat count ≤ 64;
 *       * loose deduplication (option, off by default): a cell whose notes match an existing
 *         block in step, pitch and length, with every velocity within ±tolerance (default 8)
 *         of that block's, reuses the block; the stored block keeps the first cell's
 *         velocities. Every such merge is listed in the warnings (kind looseMerged);
 *       * limits: more than 128 rows or 2048 blocks is an error (narrow the bar range).
 *       Everything dropped or changed goes into a warning list with counts and positions.
 *
 *   Loading: classic script (globalThis.TabbyMidiSong) and CommonJS; needs song-format.js
 *   (globalThis.TabbySongFormat or require) for block encoding, keys and usage.
 *
 * Version: 0.5
 *
 * Revision log
 *   v0.5  2026-11-03  Task 05: exact timing (offsets and unit lengths), quantize as an option,
 *                     PPQ rounding report, warnings only for real changes.
 *   v0.4  2026-11-02  Task 04: controls collected with their file order, row events.
 *   v0.3  2026-11-02  Loose deduplication option (velocity tolerance); block limit 2048
 *                     (section 9 v0.4).
 *   v0.2  2026-11-02  Row step length stored per row (row.steps) instead of song.rowSteps,
 *                     following section 9 v0.3.
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2).
 */
(() => {
  'use strict';

  const fail = (text, code) => { const e = new Error(text); if (code) e.code = code; throw e; };
  const format = () => globalThis.TabbySongFormat || (typeof require === 'function' ? require('./song-format.js') : fail('song-format.js not loaded'));

  const EPS = 1e-6;
  /* Nearest step with ties toward the earlier step (2.5 → 2). */
  const nearest = x => { const s = Math.floor(x); return s + (x - s > 0.5 + EPS ? 1 : 0); };
  const roundEnd = { nearest, up: x => Math.ceil(x - EPS), down: x => Math.floor(x + EPS) };

  /* 1-based bar / beat / sixteenth of an absolute step for messages. */
  function position(step, barSteps) {
    const inBar = ((step % barSteps) + barSteps) % barSteps;
    return { bar: Math.floor(step / barSteps) + 1, beat: Math.floor(inBar / 4) + 1, sixteenth: inBar % 4 + 1 };
  }
  const where = (step, barSteps) => { const p = position(step, barSteps); return 'bar ' + p.bar + ', beat ' + p.beat + '.' + p.sixteenth; };

  /* Warning collector: one entry per kind with a count and the first items. */
  const MAX_ITEMS = 200;
  class Warnings {
    constructor() { this.map = new Map(); }
    add(kind, severity, message, item) {
      let w = this.map.get(kind);
      if (!w) { w = { kind, severity, message, count: 0, items: [] }; this.map.set(kind, w); }
      w.count++;
      if (item !== undefined && w.items.length < MAX_ITEMS) w.items.push(item);
      return w;
    }
    list() { return [...this.map.values()].sort((a, b) => (a.severity === 'warn' ? 0 : 1) - (b.severity === 'warn' ? 0 : 1) || b.count - a.count); }
  }

  /* Row lengths (steps) that are whole bars and that the row format allows; the default is
   * the one closest to 4 bars (ties → longer). */
  function rowStepsFor(barSteps) {
    const allowed = format().LIMITS.rowStepsAllowed;
    const candidates = allowed.filter(n => barSteps > 0 && n % barSteps === 0).map(n => ({ steps: n, bars: n / barSteps }));
    if (!candidates.length) return { candidates: [{ steps: 64, bars: 64 / barSteps }], default: 64, aligned: false };
    const best = candidates.slice().sort((a, b) => Math.abs(a.bars - 4) - Math.abs(b.bars - 4) || b.bars - a.bars)[0];
    return { candidates, default: best.steps, aligned: true };
  }

  /* ---- stage 1: analyze --------------------------------------------------------------- */
  function analyze(parsed) {
    const division = parsed.division;
    const toStep = tick => tick * 4 / division;                  /* exact position in 16ths */
    /* Task 05: positions in units (1/1920 quarter). Exact when the PPQ divides 1920; else
     * rounded to the nearest unit, counted for the ppqRounded warning. */
    const exactPpq = 1920 % division === 0;
    const toUnits = tick => Math.round(tick * 1920 / division);
    const unitError = tick => Math.abs(tick * 1920 / division - toUnits(tick));
    const tempos = [], meters = [], ignored = { controlChange: 0, sustain: 0, pitchBend: 0, polyPressure: 0, channelPressure: 0, programChange: [], sysex: 0, meta: 0, markers: [] };
    const programs = new Map();                                  /* "track:channel" → [programs] */
    const controls = [];                                         /* every CC, for row events (Task 04) */
    let seq = 0;                                                 /* file order across the two lists */
    parsed.tracks.forEach((track, ti) => {
      for (const e of track.events) {
        switch (e.type) {
          case 'tempo': tempos.push({ tick: e.tick, track: ti, bpm: e.bpm }); break;
          case 'timeSignature': meters.push({ tick: e.tick, track: ti, numerator: e.numerator, denominator: e.denominator }); break;
          case 'controlChange': ignored.controlChange++; if (e.controller === 64) ignored.sustain++;
            controls.push({ track: ti, channel: e.channel, controller: e.controller, value: e.value, tick: e.tick, seq: seq++ }); break;   /* Task 04 */
          case 'pitchBend': ignored.pitchBend++; break;
          case 'polyPressure': ignored.polyPressure++; break;
          case 'channelPressure': ignored.channelPressure++; break;
          case 'programChange': { ignored.programChange.push({ track: ti, channel: e.channel, program: e.program, tick: e.tick, seq: seq++ });
            const k = ti + ':' + e.channel; if (!programs.has(k)) programs.set(k, []); programs.get(k).push(e.program); break; }
          case 'sysex': ignored.sysex++; break;
          case 'marker': ignored.markers.push({ tick: e.tick, text: e.text }); break;
          case 'meta': case 'lyric': case 'keySignature': case 'instrumentName': ignored.meta++; break;
          default: break;
        }
      }
    });
    tempos.sort((a, b) => a.tick - b.tick || a.track - b.track);
    meters.sort((a, b) => a.tick - b.tick || a.track - b.track);
    const L = format().LIMITS;
    const firstTempo = tempos[0] || null;
    const bpmExact = firstTempo ? firstTempo.bpm : 120;
    const bpmRounded = Math.round(bpmExact), bpm = Math.min(L.tempoMax, Math.max(L.tempoMin, bpmRounded));
    /* Only real changes count: Renoise and others repeat the same tempo at pattern starts. */
    const tempoChanges = [];
    let lastBpm = bpmExact;
    for (const t of tempos.slice(1)) if (Math.abs(t.bpm - lastBpm) > 0.005) { tempoChanges.push(t); lastBpm = t.bpm; }
    const meter = meters[0] ? { numerator: meters[0].numerator, denominator: meters[0].denominator } : { numerator: 4, denominator: 4 };
    const meterChanges = [];
    let lastMeter = meter;
    for (const m of meters.slice(1)) if (m.numerator !== lastMeter.numerator || m.denominator !== lastMeter.denominator) { meterChanges.push(m); lastMeter = m; }
    const barStepsExact = 16 * meter.numerator / meter.denominator;
    const barSteps = Number.isInteger(barStepsExact) && barStepsExact >= 1 && barStepsExact <= 64 ? barStepsExact : 0;
    const errors = [];
    if (!barSteps) errors.push('time signature ' + meter.numerator + '/' + meter.denominator + ' gives ' + barStepsExact + ' 16th steps per bar; only whole bars of 1..64 steps are supported');
    const bs = barSteps || 16;
    /* Parts: one per (track, channel) with notes. */
    const parts = [];
    parsed.tracks.forEach((track, ti) => {
      for (const channel of track.channels) {
        const notes = track.notes.filter(n => n.channel === channel);
        if (!notes.length) continue;
        let low = 127, high = 0, first = Infinity, lastEnd = 0;
        for (const n of notes) { low = Math.min(low, n.pitch); high = Math.max(high, n.pitch); first = Math.min(first, n.tick); lastEnd = Math.max(lastEnd, n.endTick); }
        const baseName = track.name || ('Track ' + (ti + 1));
        parts.push({ key: ti + ':' + channel, trackIndex: ti, channel, drums: channel === 9,
          name: track.channels.length > 1 ? baseName + ' ch' + (channel + 1) : baseName,
          noteCount: notes.length, low, high, firstBar: position(nearest(toStep(first)), bs).bar,
          lastBar: Math.max(1, Math.ceil((toStep(lastEnd) - EPS) / bs)), programs: programs.get(ti + ':' + channel) || [], notes });
      }
    });
    const totalStepsExact = Math.max(0, ...parts.map(p => toStep(Math.max(...p.notes.map(n => n.endTick)))));
    const totalBars = Math.max(1, Math.ceil((totalStepsExact - EPS) / bs));
    const steps = s => ({ step: nearest(toStep(s)), ...position(nearest(toStep(s)), bs) });
    return { format: parsed.format, division, trackCount: parsed.tracks.length, fileWarnings: parsed.warnings,
      tempo: { exact: bpmExact, rounded: bpmRounded, bpm, present: !!firstTempo, changes: tempoChanges.map(t => ({ ...t, ...steps(t.tick) })) },
      meter: { ...meter, barSteps, changes: meterChanges.map(m => ({ ...m, ...steps(m.tick) })) },
      barSteps, totalBars, totalSteps: Math.ceil(totalStepsExact - EPS), parts, ignored, controls,
      rowSteps: rowStepsFor(bs), errors, toStep, toUnits, exactPpq, unitError };
  }

  /* ---- stage 2: convert ---------------------------------------------------------------- */
  const overflowOrder = {
    loudest: (a, b) => b.velocity - a.velocity || b.pitch - a.pitch,
    highest: (a, b) => b.pitch - a.pitch || b.velocity - a.velocity,
    lowest: (a, b) => a.pitch - b.pitch || b.velocity - a.velocity,
  };

  function defaultAssignments(analysis) {
    const a = {};
    analysis.parts.forEach((p, i) => { a[p.key] = i < 8 ? i : null; });
    return a;
  }

  function convert(analysis, options = {}) {
    const F = format(), L = F.LIMITS;
    if (analysis.errors.length) fail(analysis.errors[0], 'meter');
    const barSteps = analysis.barSteps, w = new Warnings();
    const barFrom = Math.max(1, Math.floor(options.barFrom || 1));
    const barTo = Math.min(Math.max(barFrom, Math.floor(options.barTo || analysis.totalBars)), 100000);
    const rowSteps = options.rowSteps || analysis.rowSteps.default;
    if (!L.rowStepsAllowed.includes(rowSteps)) fail('row length must be 16, 32, 48 or 64 steps', 'options');
    const lengthRule = options.lengthRule || 'nearest', overflowRule = options.overflowRule || 'loudest';
    const quantize = options.quantize || 'off';                   /* Task 05: 'off' (exact), 'starts', 'startsEnds' */
    if (!['off', 'starts', 'startsEnds'].includes(quantize)) fail('unknown quantize mode ' + quantize, 'options');
    const loose = !!options.looseDedup, tolerance = Number.isInteger(options.velocityTolerance) ? options.velocityTolerance : 8;
    if (loose && (tolerance < 0 || tolerance > 126)) fail('velocity tolerance must be 0..126', 'options');
    if (!roundEnd[lengthRule]) fail('unknown length rule ' + lengthRule, 'options');
    if (!overflowOrder[overflowRule]) fail('unknown overflow rule ' + overflowRule, 'options');
    const assignments = options.assignments || defaultAssignments(analysis);
    const rangeStart = (barFrom - 1) * barSteps, rangeEnd = barTo * barSteps;
    const toStep = analysis.toStep, toUnits = analysis.toUnits, U = L.unitsPerStep, HALF = L.offsetMax;
    const TN = globalThis.TabbyTimedNote || (typeof require === 'function' ? require('../timed-note/timed-note.js') : fail('timed-note.js not loaded'));
    const msPerUnit = 60000 / (analysis.tempo.bpm * 4 * U);
    /* Row events (Task 04, 9.11): pre-roll window before a row start, in steps. */
    const preRoll = options.preRoll === 'none' ? 0 : options.preRoll === 'bar' ? barSteps : 4;
    if (!['none', 'beat', 'bar', undefined].includes(options.preRoll)) fail('unknown pre-roll ' + options.preRoll, 'options');

    /* Row events (Task 04): a program change, bank select or control change in the window
     * [start(R) − preRoll, start(R) + ½ step) of an expanded row R becomes an event of that
     * row; CC 0 / CC 32 right before a program change on the same channel inside the window
     * merge into one bank+program event. Row indices are expanded rows here and mapped to
     * the merged rows below (a row with events is never merged into a repeat). */
    const rowStepsExact = rowSteps, eventTaken = new Set();
    let eventTakenCC = 0;
    const rowOf = step => { const rel = step - rangeStart; const R = Math.round(rel / rowStepsExact); const d = rel - R * rowStepsExact; return (d >= -preRoll && d < 0.5 && R >= 0 && R * rowStepsExact < rangeEnd - rangeStart) ? R : -1; };
    const byRow = new Map();
    const pending = new Map();                                       /* channel → { msb, lsb } seen before a PC */
    const everything = [...analysis.ignored.programChange.map(p => ({ ...p, kind: 'pc' })), ...(analysis.controls || []).map(c => ({ ...c, kind: 'cc' }))].sort((a, b) => a.tick - b.tick || a.seq - b.seq);   /* file order inside a tick */
    for (const ev of everything) {
      const R = rowOf(toStep(ev.tick));
      if (R < 0) continue;
      if (ev.kind === 'cc' && (ev.controller === 0 || ev.controller === 32)) {
        const p = pending.get(ev.channel) || { row: R, msb: 255, lsb: 255, items: [] };
        if (p.row !== R) { p.row = R; p.msb = 255; p.lsb = 255; p.items = []; }
        if (ev.controller === 0) p.msb = ev.value; else p.lsb = ev.value;
        p.items.push(ev); pending.set(ev.channel, p); continue;
      }
      if (!byRow.has(R)) byRow.set(R, []);
      if (ev.kind === 'pc') {
        const p = pending.get(ev.channel);
        if (p && p.row === R && (p.msb !== 255 || p.lsb !== 255)) { byRow.get(R).push({ channel: ev.channel, type: 1, d0: p.msb, d1: p.lsb, d2: ev.program, tick: ev.tick }); p.items.forEach(x => eventTaken.add(x)); eventTakenCC += p.items.length; pending.delete(ev.channel); }
        else byRow.get(R).push({ channel: ev.channel, type: 0, d0: ev.program, d1: 0, d2: 0, tick: ev.tick });
        eventTaken.add(ev);
      } else { byRow.get(R).push({ channel: ev.channel, type: 2, d0: ev.controller, d1: ev.value, d2: 0, tick: ev.tick }); eventTaken.add(ev); eventTakenCC++; }
    }
    for (const [R, list] of byRow) if (list.length > L.rowEventsMax) { w.add('eventsOverflow', 'warn', 'More than 32 events at one row start; the extra ones were dropped', { text: 'row ' + (R + 1) }); list.length = L.rowEventsMax; }

    /* Non-conversion warnings first: file-level things that are ignored. */
    if (!analysis.tempo.present) w.add('noTempo', 'info', 'The file has no tempo event; 120 BPM is used');
    if (analysis.tempo.present && Math.abs(analysis.tempo.exact - analysis.tempo.rounded) > 0.005) w.add('tempoRounded', 'info', 'Tempo ' + analysis.tempo.exact.toFixed(3) + ' BPM rounded to ' + analysis.tempo.rounded);
    if (analysis.tempo.bpm !== analysis.tempo.rounded) w.add('tempoClamped', 'warn', 'Tempo ' + analysis.tempo.rounded + ' BPM is outside 30..300 and was clamped to ' + analysis.tempo.bpm);
    for (const t of analysis.tempo.changes) w.add('tempoChangesIgnored', 'warn', 'Tempo changes ignored (the song keeps the first tempo)', { text: t.bpm.toFixed(2) + ' BPM at ' + where(t.step, barSteps) });
    for (const m of analysis.meter.changes) w.add('meterChangesIgnored', 'warn', 'Time signature changes ignored (rows follow the first signature)', { text: m.numerator + '/' + m.denominator + ' at ' + where(m.step, barSteps) });
    if (!analysis.rowSteps.aligned) w.add('meterUnaligned', 'warn', 'No row length of 16/32/48/64 steps holds whole bars of ' + barSteps + ' steps; rows do not start on bar lines');
    const ig = analysis.ignored;
    if (ig.controlChange - eventTakenCC) w.add('ccIgnored', 'info', (ig.controlChange - eventTakenCC) + ' control change event(s) away from a row start dropped' + (ig.sustain ? ' (' + ig.sustain + ' sustain pedal)' : ''));
    if (ig.pitchBend) w.add('pitchBendIgnored', 'info', ig.pitchBend + ' pitch bend event(s) ignored');
    if (ig.polyPressure + ig.channelPressure) w.add('pressureIgnored', 'info', (ig.polyPressure + ig.channelPressure) + ' aftertouch event(s) ignored');
    for (const p of ig.programChange) if (!eventTaken.has(p)) w.add('programIgnored', 'info', 'Program changes away from a row start dropped (only events at or just before a row start become row events)', { text: 'track ' + (p.track + 1) + ' ch' + (p.channel + 1) + ' program ' + (p.program + 1) + ' at ' + where(nearest(toStep(p.tick)), barSteps) });
    if (ig.sysex) w.add('sysexIgnored', 'info', ig.sysex + ' SysEx event(s) ignored');
    if (ig.meta) w.add('metaIgnored', 'info', ig.meta + ' other meta event(s) ignored');
    for (const f of analysis.fileWarnings || []) w.add('file:' + f.kind, 'warn', f.message);

    /* Gather notes per Tabby track, in units (Task 05). */
    const perTrack = Array.from({ length: 8 }, () => []);
    const usedParts = [];
    let notesIn = 0, ppqRounded = 0, ppqWorst = 0;
    const timeOf = n => n.start * U + n.offset;                          /* a note's start in units from bar 1 */
    for (const part of analysis.parts) {
      const t = assignments[part.key];
      if (t === null || t === undefined || t === '' || t === 'skip') { w.add('partsSkipped', 'info', 'MIDI parts not assigned to a track were skipped', { text: part.name + ' (' + part.noteCount + ' notes)' }); continue; }
      if (!Number.isInteger(Number(t)) || t < 0 || t > 7) fail('part ' + part.name + ' assigned to an invalid track', 'options');
      usedParts.push({ part, track: Number(t) });
      for (const n of part.notes) {
        notesIn++;
        if (!analysis.exactPpq) { const e = Math.max(analysis.unitError(n.tick), analysis.unitError(n.endTick)); if (e > 1e-9) { ppqRounded++; ppqWorst = Math.max(ppqWorst, e); } }
        const su = toUnits(n.tick), eu = toUnits(n.endTick);
        /* Anchor: the nearest step; exactly half a step late stays with the earlier step (+240). */
        const anchor = Math.floor((su + HALF - 1) / U);
        let offset = su - anchor * U, length = Math.max(1, eu - su);
        const xs = toStep(n.tick), xe = toStep(n.endTick);
        if (quantize !== 'off' && offset) { w.add('moved', 'info', 'Note starts moved to the 16th grid', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) + ' moved ' + ((anchor - xs) * 0.25).toFixed(3) + ' beats' }); offset = 0; }
        if (quantize === 'startsEnds') {
          let end = roundEnd[lengthRule](xe), steps = end - anchor;
          if (steps < 1) { steps = 1; if (xe - xs > EPS) w.add('lengthMin', 'info', 'Notes shorter than a step got length 1', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) }); }
          else if (Math.abs((xe - xs) - steps) > EPS) w.add('lengthRounded', 'info', 'Note lengths rounded to whole steps (' + lengthRule + ')', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) + ': ' + ((xe - xs) * 0.25).toFixed(3) + ' → ' + (steps * 0.25).toFixed(2) + ' beats' });
          length = steps * U;
        }
        if (anchor < rangeStart || anchor >= rangeEnd) { w.add('droppedRange', 'info', 'Notes outside bars ' + barFrom + '..' + barTo + ' dropped', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) }); continue; }
        if (anchor * U + offset + length > rangeEnd * U) { length = Math.max(1, rangeEnd * U - anchor * U - offset); w.add('clippedRange', 'info', 'Notes ending after bar ' + barTo + ' clipped', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) }); }
        if (length > L.lengthMax) { w.add('lengthClipped', 'warn', 'Notes longer than ' + (L.lengthMax / U).toFixed(0) + ' steps clipped', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) + ': ' + (length / U).toFixed(2) + ' steps' }); length = L.lengthMax; }
        const stored = TN.lengthStored(length);
        if (stored !== length) w.add('lengthScaled', 'info', 'Notes longer than 136 steps are stored to within the exponent scale (2..128 units)', { track: t + 1, text: part.name + ' pitch ' + n.pitch + ' at ' + where(anchor, barSteps) + ': ' + length + ' → ' + stored + ' units' });
        perTrack[t].push({ start: anchor, offset, length: stored, pitch: n.pitch, velocity: n.velocity, part: part.name });
      }
    }
    if (!usedParts.length) fail('No MIDI part is assigned to a track', 'empty');
    if (!analysis.exactPpq) w.add('ppqRounded', ppqRounded ? 'warn' : 'info', 'The file\'s ' + analysis.division + ' ticks per quarter note do not divide 1920: note times were rounded to the nearest 1/480 step' + (ppqRounded ? ' (' + ppqRounded + ' note(s), at most ' + ppqWorst.toFixed(2) + ' units = ' + (ppqWorst * msPerUnit).toFixed(2) + ' ms)' : ' (no note was affected)'));

    /* Per track: same-pitch overlaps (in units), then the 4-per-step limit (per anchor step). */
    for (let t = 0; t < 8; t++) {
      const notes = perTrack[t];
      notes.sort((a, b) => timeOf(a) - timeOf(b) || a.pitch - b.pitch || b.velocity - a.velocity);
      const byPitch = new Map();
      for (const n of notes) { if (!byPitch.has(n.pitch)) byPitch.set(n.pitch, []); byPitch.get(n.pitch).push(n); }
      const drop = new Set();
      for (const list of byPitch.values()) {
        let prev = null;
        for (const cur of list) {
          if (prev && cur.start === prev.start) {           /* same anchor step, same pitch: keep the louder (9.12 forbids both) */
            const loser = cur.velocity > prev.velocity ? prev : cur;
            drop.add(loser); w.add('duplicateDropped', 'warn', 'Same pitch twice on one step on one track; the quieter note was dropped', { track: t + 1, text: loser.part + ' pitch ' + loser.pitch + ' at ' + where(loser.start, barSteps) });
            if (loser === prev) prev = cur; continue;
          }
          if (prev && timeOf(prev) + prev.length > timeOf(cur)) {
            const clipped = Math.max(1, timeOf(cur) - timeOf(prev));
            w.add('overlapClipped', 'info', 'Same pitch overlapping on one track; the earlier note was shortened', { track: t + 1, text: prev.part + ' pitch ' + prev.pitch + ' at ' + where(prev.start, barSteps) + ': ' + (prev.length / U).toFixed(3) + ' → ' + (clipped / U).toFixed(3) + ' steps' });
            prev.length = clipped;
          }
          prev = cur;
        }
      }
      let kept = notes.filter(n => !drop.has(n));
      const byStep = new Map();
      for (const n of kept) { if (!byStep.has(n.start)) byStep.set(n.start, []); byStep.get(n.start).push(n); }
      for (const [step, list] of byStep) {
        if (list.length <= L.notesPerStep) continue;
        list.sort(overflowOrder[overflowRule]);
        for (const n of list.slice(L.notesPerStep)) { drop.add(n); w.add('overflowDropped', 'warn', 'More than 4 notes on one step on one track; kept the 4 ' + overflowRule + ' notes', { track: t + 1, text: n.part + ' pitch ' + n.pitch + ' velocity ' + n.velocity + ' at ' + where(step, barSteps) }); }
      }
      perTrack[t] = notes.filter(n => !drop.has(n));
    }
    const notesOut = perTrack.reduce((n, l) => n + l.length, 0);
    if (!notesOut) fail('No notes fall inside bars ' + barFrom + '..' + barTo, 'empty');

    /* Grid: rows × tracks → note lists in block coordinates. */
    const rowCount = Math.ceil((rangeEnd - rangeStart) / rowSteps);
    const grid = Array.from({ length: rowCount }, () => Array.from({ length: 8 }, () => []));
    for (let t = 0; t < 8; t++) for (const n of perTrack[t]) {
      const rel = n.start - rangeStart, row = Math.floor(rel / rowSteps);
      grid[row][t].push({ step: rel % rowSteps, pitch: n.pitch, velocity: n.velocity, offset: n.offset, length: n.length, retrigger: false });
    }
    /* Deduplicate blocks and build rows. Exact first (identical bytes); then, in loose mode,
     * a block with the same notes whose velocities are all within the tolerance. */
    const pool = new Map(), byShape = new Map(), blocks = [];
    let looseMerges = 0;
    const rowsExpanded = grid.map((cells, rowIndex) => cells.map((notes, t) => {
      if (!notes.length) return 0;
      const sorted = F.sortNotes(notes), key = F.blockKey(sorted);
      let id = pool.get(key);
      if (!id && loose) {
        const shape = F.structuralKey(sorted);
        for (const candidate of byShape.get(shape) || []) {
          let worst = 0;
          for (let i = 0; i < sorted.length; i++) worst = Math.max(worst, Math.abs(sorted[i].velocity - candidate.notes[i].velocity));
          if (worst <= tolerance) {
            id = candidate.id; looseMerges++;
            w.add('looseMerged', 'warn', 'Blocks merged by loose matching (same notes, velocities within ±' + tolerance + '); the shared block keeps the first block\'s velocities',
              { track: t + 1, text: 'row ' + (rowIndex + 1) + ' (bars ' + (barFrom + rowIndex * rowSteps / barSteps) + '..' + (barFrom + (rowIndex + 1) * rowSteps / barSteps - 1) + ') uses block ' + id + ', largest velocity difference ' + worst });
            break;
          }
        }
      }
      if (!id) {
        id = blocks.length + 1; pool.set(key, id);
        const block = { id, notes: sorted }; blocks.push(block);
        if (loose) { const shape = F.structuralKey(sorted); if (!byShape.has(shape)) byShape.set(shape, []); byShape.get(shape).push(block); }
      }
      return id;
    }));
    const rows = [], events = [];
    rowsExpanded.forEach((ids, expanded) => {
      const last = rows[rows.length - 1], hasEvents = byRow.has(expanded) && byRow.get(expanded).length > 0;
      if (last && !hasEvents && last.repeat < L.repeatMax && last.blocks.every((id, t) => id === ids[t])) { last.repeat++; return; }
      rows.push({ blocks: ids, repeat: 1, loopHere: false, steps: rowSteps });
      if (hasEvents) for (const e of byRow.get(expanded)) events.push({ row: rows.length - 1, channel: e.channel, type: e.type, d0: e.d0, d1: e.d1, d2: e.d2 });
    });
    if (events.length > L.eventsMax) fail('The song needs ' + events.length + ' row events; a song holds ' + L.eventsMax + '. Narrow the bar range.', 'events');
    for (const e of events) w.add('rowEvents', 'info', 'Program / bank / control change event(s) at row starts became row events (pre-roll ' + (preRoll ? preRoll + ' steps' : 'none') + ')',
      { text: 'row ' + (e.row + 1) + ' channel ' + (e.channel + 1) + ': ' + (e.type === 0 ? 'program ' + e.d0 : e.type === 1 ? 'bank ' + (e.d0 === 255 ? '-' : e.d0) + '/' + (e.d1 === 255 ? '-' : e.d1) + ' program ' + e.d2 : 'CC ' + e.d0 + ' = ' + e.d1) });
    for (const [, p] of pending) if (p.items.some(x => !eventTaken.has(x))) w.add('bankWithoutProgram', 'info', 'Bank select without a following program change dropped', { text: 'row ' + (p.row + 1) + ' channel ' + (p.items[0].channel + 1) });
    if (blocks.length > L.blocksPerSong) fail('The song needs ' + blocks.length + ' distinct blocks; a song holds ' + L.blocksPerSong + '. Narrow the bar range or import fewer tracks.', 'blocks');
    if (rows.length > L.rowsPerSong) fail('The song needs ' + rows.length + ' rows after merging repeats; a song holds 128. Narrow the bar range.', 'rows');

    const song = F.emptySong(options.name || 'IMPORTED');
    song.projectSlot = Number.isInteger(options.projectSlot) ? options.projectSlot : 0;
    song.tempo = analysis.tempo.bpm;
    song.loop = !!options.loop; song.jumpMode = options.jumpMode === 'row' ? 'row' : 'bar'; song.loopRow = 0;
    song.outChannels = Array.from({ length: 8 }, (_, t) => { const c = (options.outChannels || [])[t]; return Number.isInteger(c) && c >= 0 && c <= 15 ? c : null; });
    song.rows = rows; song.blocks = blocks; song.events = events;
    song.source = { fileName: options.fileName || '', format: analysis.format, division: analysis.division, tempoExact: analysis.tempo.exact,
      meter: analysis.meter.numerator + '/' + analysis.meter.denominator, barSteps, barFrom, barTo, rowSteps, quantize, lengthRule, overflowRule, exactPpq: analysis.exactPpq,
      looseDedup: loose, velocityTolerance: loose ? tolerance : null, preRoll: options.preRoll || 'beat',
      parts: usedParts.map(u => ({ key: u.part.key, name: u.part.name, track: u.track + 1 })) };
    const usage = F.usage(song);
    const allNotes = perTrack.flat();
    const stats = { ...usage, rowsBeforeMerge: rowsExpanded.length, cellsBeforeDedup: rowsExpanded.reduce((n, r) => n + r.filter(Boolean).length, 0),
      notesIn, notesOut, bars: barTo - barFrom + 1, barsPerRow: rowSteps / barSteps, rowSteps, looseMerges, events: events.length,
      offsets: allNotes.filter(n => n.offset).length, fractionalLengths: allNotes.filter(n => n.length % U).length,   /* Task 05 */
      maxOffsetUnits: allNotes.reduce((m, n) => Math.max(m, Math.abs(n.offset)), 0), ppqRounded, exactPpq: analysis.exactPpq, quantize };
    const result = { song, stats, warnings: w.list(), grid, rowsExpanded };
    song.warnings = result.warnings.map(x => ({ kind: x.kind, severity: x.severity, message: x.message, count: x.count }));
    F.validate(song).errors.forEach(e => fail('internal: produced an invalid song: ' + e, 'internal'));
    return result;
  }

  const TabbyMidiSong = { analyze, convert, defaultAssignments, rowStepsFor, position, where, nearest, version: '0.5' };
  globalThis.TabbyMidiSong = TabbyMidiSong;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyMidiSong;
})();

/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/song-transfer.js — the one interface through which a song reaches the device
 *
 * Purpose
 *   Task 02 keeps the device write behind a single interface so the importer, the UI and
 *   the tests do not care whether a real SMK-37 is attached. Two implementations:
 *
 *     stub   (this file, v0.1)  validates the song, serialises it exactly as the device
 *            transfer would (Task 03 section 9.9 v0.4: kind 5 = 4096-byte song record, kind 6 =
 *            one block payload per transfer with target (song << 16) | id) and reports what
 *            it would send: byte counts, number of 64-byte protocol queries and a time
 *            estimate. It never opens a MIDI port. Used until Task 03 Step 2 is merged.
 *     backend (Task 02 Step 4, v0.3)  same interface on top of the workbench's song
 *            backend (the `songBackend()` object of sdk/Update.html.in: read / write /
 *            remove / status / exists, backed either by the Library class, i.e. a device,
 *            or by the browser simulator). The write is the workbench's own path and no
 *            transfer code lives here: song record first (kind 5), then the blocks as
 *            kind-7 batches cut at the device's packing boundaries (section 9.6 v0.5), then
 *            the record is read back and compared (Library.songWrite). Since Task 03 (f)
 *            that shared path deletes an occupied slot first (the song editor and this
 *            importer behave alike); the wrapper only reports it.
 *
 *   Interface (every method returns a Promise):
 *     name                         'stub' | 'device'
 *     real                         false for the stub
 *     describe()                   limits and pool sizes
 *     validate(song)               { ok, errors, warnings } from song-format.js
 *     plan(song, slot)             { record:{kind:5,target,bytes}, blocks:[{kind:6,target,bytes}],
 *                                    batches:[{kind:7,blocks,bytes}], totalBytes, queries,
 *                                    seconds, warnings }
 *     exists(slot)                 { empty: true | false | 'unknown', name, rows, blocks }
 *     write(slot, song, {progress, signal})   stub: validate + plan, returns the plan with
 *                                             sent:false; backend: writes through the workbench
 *                                             path (an occupied slot is deleted there first),
 *                                             returns the plan with sent:true, replaced, seconds
 *     read(slot)                   stub: rejects; backend: the slot's song as a model, or null
 *
 *   Protocol cost model (for the estimate): the existing transfer path sends 64 payload
 *   bytes per query (WebUpdate.js upload: one command 4 per 64 bytes) plus begin, finish
 *   and cancel; about 10 ms per query on USB MIDI.
 *
 *   Loading: classic script (globalThis.TabbySongTransfer) and CommonJS.
 *
 * Version: 0.5
 *
 * Revision log
 *   v0.5  2026-11-03  Task 05: block records rebuilt from a backend carry payload format 1.
 *   v0.4  2026-11-02  Task 03 (f): the delete-before-replace step moved into the workbench's
 *                     song write; the wrapper reports `replaced` from the backend's result.
 *   v0.3  2026-11-02  Step 4: createBackend() on the workbench song backend (device or
 *                     simulator), kind-7 batch plan, delete-before-replace, read().
 *   v0.2  2026-11-02  Kind 6 target (song << 16) | id (section 9 v0.4, 16-bit block ids).
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2): interface and stub.
 */
(() => {
  'use strict';

  const format = () => globalThis.TabbySongFormat || (typeof require === 'function' ? require('./song-format.js') : (() => { throw new Error('song-format.js not loaded'); })());
  const CHUNK = 64, SECONDS_PER_QUERY = 0.01, OVERHEAD_QUERIES = 3;   /* begin, finish, cancel */
  /* Kind-7 batches as sdk/WebUpdate.js songBatches() cuts them (section 9.9 v0.5): records in
   * id order, greedy first fit into 4076-byte record areas, a record never splits, at most 8
   * sectors (32608 bytes) per batch. Only the plan and the estimate use this; the workbench
   * does its own cutting when it writes. */
  const BATCH_AREA = 4076, BATCH_SECTORS = 8;
  function batchesOf(blocks) {
    const batches = []; let list = [], bytes = 0, fill = 0, sectors = 1;
    for (const b of blocks) {
      const size = (6 + b.bytes + 3) & ~3;
      if (fill + size > BATCH_AREA) { if (sectors === BATCH_SECTORS) { batches.push({ kind: 7, blocks: list, bytes }); list = []; bytes = 0; sectors = 0; } sectors++; fill = 0; }
      list.push(b.id); bytes += size; fill += size;
    }
    if (list.length) batches.push({ kind: 7, blocks: list, bytes });
    return batches;
  }
  /* The common part of plan(): the record image, the block payloads in id order, the batch
   * cut, the byte and query counts. `batched` selects kind 7 (device path) or kind 6. */
  function planSong(F, song, slot, batched) {
    const L = F.LIMITS;
    if (!Number.isInteger(slot) || slot < 0 || slot >= L.songs) throw new Error('song slot must be 0..15');
    const v = F.validate(song);
    if (!v.ok) throw new Error('song is invalid: ' + v.errors[0]);
    const record = F.encodeRecord(song);
    const blocks = song.blocks.slice().sort((a, b) => a.id - b.id).map(b => {
      const payload = F.encodeBlock(b, 'block ' + b.id);
      return { kind: 6, target: (slot << 16) | b.id, id: b.id, bytes: payload.length, payload };
    });
    const batches = batched ? batchesOf(blocks) : [];
    const items = [{ bytes: record.length }, ...(batched ? batches : blocks)];
    const queries = items.reduce((n, i) => n + Math.ceil(i.bytes / CHUNK) + OVERHEAD_QUERIES, 0);
    return { record: { kind: 5, target: slot, bytes: record.length, image: record }, blocks, batches,
      totalBytes: items.reduce((n, i) => n + i.bytes, 0), transfers: items.length, queries, seconds: queries * SECONDS_PER_QUERY, warnings: v.warnings, usage: F.usage(song) };
  }

  function createStub() {
    const F = format(), L = F.LIMITS;
    const self = {
      name: 'stub', real: false,
      async describe() {
        return { songs: L.songs, rows: L.rowsPerSong, blocks: L.blocksPerSong, blockSectors: L.blockSectors, poolBytes: L.poolBytes,
          real: false, note: 'Stub: validates and reports what would be sent; no device is written.' };
      },
      async validate(song) { return F.validate(song); },
      async plan(song, slot) { return planSong(F, song, slot, false); },
      async exists(slot) {
        if (!Number.isInteger(slot) || slot < 0 || slot >= L.songs) throw new Error('song slot must be 0..15');
        return { empty: 'unknown', name: '', rows: 0, blocks: 0 };
      },
      async write(slot, song, { progress = () => {}, signal } = {}) {
        signal?.throwIfAborted();
        const plan = await self.plan(song, slot);
        progress(1);
        return { ...plan, sent: false, slot,
          message: 'Stub: would send song record (' + plan.record.bytes + ' B) to song ' + (slot + 1) + ' and ' + plan.blocks.length + ' block(s), ' +
            plan.totalBytes + ' bytes in ' + plan.queries + ' queries (about ' + plan.seconds.toFixed(1) + ' s). Nothing was written.' };
      },
      async read() { throw new Error('Stub transfer: nothing to read until Task 03 Step 2 is merged'); },
    };
    return self;
  }

  /* The workbench implementation (Step 4). `getBackend(progress)` returns the workbench's
   * song backend for the current target (device through the Library class, or the browser
   * simulator) and throws when that target is not connected; it is called at the moment of
   * each operation, so the panel can be mounted before anything is connected. `name()`
   * returns the current target's name for messages. The backend contract (sdk/Update.html.in,
   * songBackend()):
   *   read(slot)                        → { record: Uint8Array(4096), blocks: Map(id → payload) } | null
   *   write(slot, record, blocks)       → the workbench song write: record, batches, read-back
   *   remove(slot)                      → deletes the song
   *   exists(slot)                      → the 4096-byte record image, or null when empty
   *   status()                          → { free, reclaimable, state } */
  function createBackend(getBackend, { name = () => 'device' } = {}) {
    const F = format(), L = F.LIMITS;
    const self = {
      get name() { return typeof name === 'function' ? name() : name; }, real: true,
      async describe() {
        return { songs: L.songs, rows: L.rowsPerSong, blocks: L.blocksPerSong, blockSectors: L.blockSectors, poolBytes: L.poolBytes, real: true,
          note: 'Writes through the workbench song path: an occupied slot is deleted first, then the record, then the blocks in kind-7 batches, then the record is read back.' };
      },
      async validate(song) { return F.validate(song); },
      async plan(song, slot) { return planSong(F, song, slot, true); },
      async exists(slot) {
        if (!Number.isInteger(slot) || slot < 0 || slot >= L.songs) throw new Error('song slot must be 0..15');
        let backend;
        try { backend = getBackend(); } catch (error) { return { empty: 'unknown', name: '', rows: 0, blocks: 0, reason: error.message }; }
        const image = await backend.exists(slot);
        if (!image) return { empty: true, name: '', rows: 0, blocks: 0 };
        const song = F.decodeRecord(image);
        return { empty: false, name: song.name.trim(), rows: song.rows.length, blocks: new Set(song.rows.flatMap(r => r.blocks).filter(Boolean)).size };
      },
      async write(slot, song, { progress = () => {}, signal } = {}) {
        signal?.throwIfAborted();
        const plan = await self.plan(song, slot);
        const backend = getBackend(p => progress(0.05 + 0.9 * p));
        const was = await self.exists(slot);                            /* for the message only */
        signal?.throwIfAborted(); progress(0.05);
        const started = Date.now();
        /* The workbench path deletes an occupied slot first (Task 03 f), then writes. */
        const done = await backend.write(slot, plan.record.image, new Map(plan.blocks.map(b => [b.id, b.payload])));
        const seconds = (Date.now() - started) / 1000;
        const replaced = done && typeof done === 'object' && 'replaced' in done ? !!done.replaced : was.empty === false;
        progress(1);
        return { ...plan, sent: true, slot, replaced, seconds,
          message: 'Written to ' + self.name + ' song ' + (slot + 1) + (replaced ? ' (replaced "' + was.name + '", deleted first by the workbench)' : '') + ': record + ' +
            plan.blocks.length + ' block(s) in ' + plan.batches.length + ' batch(es), ' + plan.totalBytes + ' bytes, ' + seconds.toFixed(1) + ' s' +
            (self.name === 'device' ? '; record read back and verified.' : '.') };
      },
      async read(slot) {
        const got = await getBackend().read(slot);
        if (!got) return null;
        /* Rebuild the .tabby byte stream (record + block records) and decode it. */
        const records = [...got.blocks].sort((a, b) => a[0] - b[0]).map(([id, payload]) => {
          const out = new Uint8Array((6 + payload.length + 3) & ~3).fill(0xff);
          out[0] = 0; out[1] = 1; out[2] = id & 255; out[3] = id >> 8; out[4] = payload.length & 255; out[5] = payload.length >> 8; out.set(payload, 6); return out;   /* Task 05: a backend returns format-1 payloads */
        });
        const file = new Uint8Array(4096 + records.reduce((n, r) => n + r.length, 0));
        file.set(got.record, 0); let at = 4096; for (const r of records) { file.set(r, at); at += r.length; }
        return F.decodeFile(file);
      },
    };
    return self;
  }

  /* Pick the implementation: the workbench backend when one is given, else the stub. */
  function select({ backend, name } = {}) {
    return backend ? createBackend(backend, { name }) : createStub();
  }

  const TabbySongTransfer = { createStub, createBackend, select, batchesOf, CHUNK, SECONDS_PER_QUERY, version: '0.3' };
  globalThis.TabbySongTransfer = TabbySongTransfer;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbySongTransfer;
})();

/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/import/import-ui.js — the "Import MIDI" panel of the Classic Tabby workbench
 *
 * Purpose
 *   A self-contained DOM component: TabbyImportUI.mount(container, {transfer}) renders the
 *   whole import flow into `container` and returns a small controller. Until Task 03 Step 2
 *   is merged it lives on the standalone page web/import/index.html; at Task 02 Step 4 the
 *   same call is made from a <details> entry in the workbench Library tab, so nothing here
 *   depends on the workbench except the transfer object passed in.
 *
 *   Flow (Task 02 Step 2):
 *     1. choose a .mid file → summary (format, division, tempo, meter, bars, warnings);
 *     2. parts table: every MIDI track × channel with name, notes, range and bars; assign
 *        each part to a Classic Tabby track 1..8 or skip it; per-track OUT CH 1..16 or
 *        "device setting";
 *     3. options: bar range, bars per row (only lengths that stay on bar lines), quantize
 *        (off = exact timing, the default; starts; starts and ends) with the note length
 *        rounding rule (nearest / never shorter / never longer) for the latter, rule for
 *        more than 4 notes on a step (loudest / highest / lowest), song name, project slot,
 *        loop;
 *     4. result: rows with repeats and block ids, counts, pool use, and the warning list of
 *        everything dropped or changed, grouped by kind with the positions;
 *     5. browser song: save / load the JSON model, export the .tabby file (Task 03 9.9);
 *     6. device: choose a song slot, see the replace warning, write through the transfer
 *        interface (the stub only validates and reports what it would send).
 *
 *   Every change in steps 2 and 3 re-converts immediately; the result shown is always the
 *   song that "Save" / "Write" would use. Nothing touches a device until step 6 is confirmed.
 *
 *   Strings are English on purpose: the workbench translates its own Chinese strings
 *   through FM1I18n; this panel is Classic Tabby only and is shown in English in both
 *   languages (Step 4 decision: no 80-string addition to the shared sdk/I18n.js).
 *
 * Version: 0.7
 *
 * Revision log
 *   v0.7  2026-11-03  Task 05: quantize option (off by default), offsets and fractional lengths
 *                     in the statistics, the grid note reworded.
 *   v0.6  2026-11-02  Task 04: row events: pre-roll option, event column in the row table,
 *                     event count in the statistics.
 *   v0.5  2026-11-02  Task 03 (f): the replace warning says the old song is deleted first and
 *                     suggests exporting a .tabby; the delete itself moved to the workbench.
 *   v0.4  2026-11-02  Step 4: mounted in the workbench Library tab; the transfer may be the
 *                     workbench backend (device or simulator): target name in the confirm
 *                     and the messages, batch plan shown, elapsed time reported.
 *   v0.3  2026-11-02  Loose block matching option with velocity tolerance (default 8, off);
 *                     block count shown against 2048 (section 9 v0.4).
 *   v0.2  2026-11-02  Row step length shown per row; OUT CH note updated (field now in the
 *                     song header, section 9 v0.3).
 *   v0.1  2026-11-02  Initial version (Task 02, Step 2).
 */
(() => {
  'use strict';

  /* Tiny DOM helper: h(tag, attributes, ...children); attributes starting with "on" bind
   * handlers, `class` sets className, `dataset` merges, everything else is a property. */
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (v !== undefined && v !== null) el[k] = v;
    }
    for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return el;
  }
  const option = (value, text, selected = false) => h('option', { value: String(value), textContent: text, selected });
  const noteName = p => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][p % 12] + (Math.floor(p / 12) - 1);
  const kb = n => (n / 1024).toFixed(1) + ' KiB';
  const download = (bytes, name, type = 'application/octet-stream') => {
    const url = URL.createObjectURL(new Blob([bytes], { type })), a = h('a', { href: url, download: name });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  function mount(container, { transfer } = {}) {
    const Midi = globalThis.TabbyMidi, Song = globalThis.TabbyMidiSong, Format = globalThis.TabbySongFormat;
    transfer = transfer || globalThis.TabbySongTransfer.select({});
    const state = { fileName: '', parsed: null, analysis: null, assignments: {}, outChannels: Array(8).fill(null), result: null, song: null, busy: false };

    /* ---- static skeleton ------------------------------------------------------------- */
    const ui = {
      file: h('input', { type: 'file', accept: '.mid,.midi,audio/midi' }),
      fileSummary: h('div', { class: 'ti-summary' }),
      fileWarnings: h('ul', { class: 'ti-list' }),
      parts: h('tbody'),
      channels: h('div', { class: 'ti-channels' }),
      barFrom: h('input', { type: 'number', min: 1, step: 1, value: 1 }),
      barTo: h('input', { type: 'number', min: 1, step: 1, value: 1 }),
      rowSteps: h('select'),
      preRoll: h('select', {}, option('beat', 'one beat before (default)'), option('none', 'at the row start only'), option('bar', 'up to one bar before')),
      quantize: h('select', {}, option('off', 'off: exact timing (default)'), option('starts', 'note starts to 16ths'), option('startsEnds', 'starts and ends to 16ths')),
      lengthRule: h('select', {}, option('nearest', 'nearest step (default)'), option('up', 'never shorter (round up)'), option('down', 'never longer (round down)')),
      overflowRule: h('select', {}, option('loudest', 'keep the 4 loudest'), option('highest', 'keep the 4 highest'), option('lowest', 'keep the 4 lowest')),
      name: h('input', { type: 'text', maxLength: 12, value: 'IMPORTED', spellcheck: false }),
      projectSlot: h('select', {}, ...Array.from({ length: 16 }, (_, i) => option(i, 'project ' + (i + 1)))),
      loop: h('input', { type: 'checkbox' }),
      loose: h('input', { type: 'checkbox' }),
      tolerance: h('input', { type: 'number', min: 0, max: 126, step: 1, value: 8 }),
      status: h('p', { class: 'ti-status', role: 'status' }),
      stats: h('div', { class: 'ti-stats' }),
      rows: h('tbody'),
      warnings: h('div', { class: 'ti-warnings' }),
      saveJson: h('button', { type: 'button', textContent: 'Save song (JSON)' }),
      loadJson: h('input', { type: 'file', accept: '.json,application/json' }),
      exportTabby: h('button', { type: 'button', textContent: 'Export .tabby file' }),
      slot: h('select', {}, ...Array.from({ length: 16 }, (_, i) => option(i, 'song ' + (i + 1)))),
      slotInfo: h('span', { class: 'ti-slot-info' }),
      write: h('button', { type: 'button', textContent: 'Write song…' }),
      transferInfo: h('p', { class: 'ti-muted' }),
      plan: h('pre', { class: 'ti-plan', hidden: true }),
    };
    for (let t = 0; t < 8; t++) {
      const sel = h('select', { dataset: { track: t } }, option('', 'device'), ...Array.from({ length: 16 }, (_, c) => option(c, 'ch ' + (c + 1))));
      sel.addEventListener('change', () => { state.outChannels[t] = sel.value === '' ? null : Number(sel.value); reconvert(); });
      ui.channels.append(h('label', {}, 'T' + (t + 1) + ' ', sel));
    }
    container.replaceChildren(
      h('section', { class: 'ti-step' }, h('h3', {}, '1. MIDI file'),
        h('p', {}, ui.file), ui.fileSummary, ui.fileWarnings),
      h('section', { class: 'ti-step' }, h('h3', {}, '2. Parts → Classic Tabby tracks'),
        h('table', { class: 'ti-table' }, h('thead', {}, h('tr', {}, ...['MIDI part', 'Channel', 'Notes', 'Range', 'Bars', 'Programs', 'Tabby track'].map(x => h('th', {}, x)))), ui.parts),
        h('p', { class: 'ti-muted' }, 'Several parts may share one track; the 4-notes-per-step limit then applies to the mix. Drum parts (channel 10) are marked ♩.'),
        h('div', {}, h('strong', {}, 'OUT CH per track '), h('span', { class: 'ti-muted' }, '(written into the song header; "device" keeps the device OUT CH for that track) '), ui.channels)),
      h('section', { class: 'ti-step' }, h('h3', {}, '3. Options'),
        h('div', { class: 'ti-grid' },
          h('label', {}, 'Bars from ', ui.barFrom), h('label', {}, 'to ', ui.barTo),
          h('label', {}, 'Bars per row ', ui.rowSteps),
          h('label', {}, 'Row events: PC / bank / CC ', ui.preRoll),
          h('label', {}, 'Quantize ', ui.quantize),
          h('label', {}, 'Note ends (quantized) ', ui.lengthRule),
          h('label', {}, 'More than 4 notes on a step ', ui.overflowRule),
          h('label', {}, 'Song name ', ui.name), h('label', {}, 'Project slot ', ui.projectSlot),
          h('label', {}, ui.loop, ' loop the whole song'),
          h('label', {}, ui.loose, ' loose block matching, velocity tolerance ±', ui.tolerance)),
        h('p', { class: 'ti-muted' }, 'Timing is kept exactly (1/480 of a 16th step; 96, 120, 192, 240, 384, 480, 960 and 1920 PPQ are exact, others round and are reported): each note belongs to the nearest step and keeps its offset and length. Quantize is off unless chosen. The first tempo of the file becomes the song tempo. Loose matching shares a block when the notes are the same and only velocities differ, within the tolerance; the first block\'s velocities are kept and every merge is listed below.')),
      h('section', { class: 'ti-step' }, h('h3', {}, '4. Resulting song'), ui.status, ui.stats,
        h('div', { class: 'ti-scroll' }, h('table', { class: 'ti-table ti-rows' }, h('thead', {}, h('tr', {}, h('th', {}, 'Row'), h('th', {}, 'Repeat'), h('th', {}, 'Steps'), h('th', {}, 'Events'), ...Array.from({ length: 8 }, (_, t) => h('th', {}, 'T' + (t + 1))))), ui.rows)),
        h('h4', {}, 'Dropped or changed'), ui.warnings),
      h('section', { class: 'ti-step' }, h('h3', {}, '5. Browser song'),
        h('p', {}, ui.saveJson, ' ', ui.exportTabby, ' ', h('label', {}, 'Load song JSON ', ui.loadJson)),
        h('p', { class: 'ti-muted' }, 'The song lives in this page until you write it. Save the JSON to keep it; the .tabby file is the Task 03 device/file format (song record + block records).')),
      h('section', { class: 'ti-step' }, h('h3', {}, '6. Write to the device or the simulator'),
        ui.transferInfo,
        h('p', {}, h('label', {}, 'Song slot ', ui.slot), ' ', ui.slotInfo),
        h('p', { class: 'ti-warn' }, 'Writing deletes whatever that song slot holds before the new song is written (its blocks are reclaimed at the next compaction); export a .tabby of the old song first if you want to keep it. Projects are not changed. The target follows the song editor\'s "target" choice above: device (project library connected) or browser simulator.'),
        h('p', {}, ui.write), ui.plan));

    /* ---- helpers ---------------------------------------------------------------------- */
    const say = text => { ui.status.textContent = text; };
    const enable = () => {
      const have = !!state.song;
      ui.saveJson.disabled = ui.exportTabby.disabled = ui.write.disabled = !have || state.busy;
      for (const el of [ui.barFrom, ui.barTo, ui.rowSteps, ui.quantize, ui.overflowRule]) el.disabled = !state.analysis || state.busy;
      ui.lengthRule.disabled = !state.analysis || state.busy || ui.quantize.value !== 'startsEnds';
    };
    transfer.describe().then(d => { ui.transferInfo.textContent = 'Transfer: ' + (d.real ? d.note : 'stub (validates and reports what it would send; no device is written)') + ' · ' + d.songs + ' songs · ' + d.rows + ' rows · ' + d.blocks + ' blocks per song · pool ' + kb(d.poolBytes) + '.'; });
    const slotInfo = async () => {
      try { const e = await transfer.exists(Number(ui.slot.value)); ui.slotInfo.textContent = e.empty === 'unknown' ? 'Contents unknown until the target is connected' + (e.reason ? ' (' + e.reason + ')' : '') + '.' : e.empty ? 'Slot is empty on the ' + transfer.name + '.' : 'Slot holds "' + e.name + '" (' + e.rows + ' rows, ' + e.blocks + ' blocks) on the ' + transfer.name + ' — it will be deleted and replaced.'; }
      catch (error) { ui.slotInfo.textContent = error.message; }
    };
    ui.slot.addEventListener('change', slotInfo); slotInfo();

    function showFile() {
      const a = state.analysis, p = state.parsed;
      ui.fileSummary.replaceChildren(h('p', {}, h('strong', {}, state.fileName), ' — format ' + p.format + ', ' + p.division + ' ticks per quarter, ' + p.tracks.length + ' track(s), ' +
        a.parts.length + ' part(s), ' + a.totalBars + ' bar(s) of ' + a.meter.numerator + '/' + a.meter.denominator + ', tempo ' + a.tempo.exact.toFixed(2) + ' BPM → ' + a.tempo.bpm +
        (a.tempo.changes.length ? ' (' + a.tempo.changes.length + ' change(s) ignored)' : '') + '.'));
      ui.fileWarnings.replaceChildren(...a.errors.map(e => h('li', { class: 'ti-error' }, e)), ...(p.warnings || []).map(w => h('li', {}, w.message)));
      ui.parts.replaceChildren(...a.parts.map(part => {
        const sel = h('select', {}, option('', 'skip'), ...Array.from({ length: 8 }, (_, t) => option(t, 'track ' + (t + 1))));
        sel.value = state.assignments[part.key] === null || state.assignments[part.key] === undefined ? '' : String(state.assignments[part.key]);
        sel.addEventListener('change', () => { state.assignments[part.key] = sel.value === '' ? null : Number(sel.value); reconvert(); });
        return h('tr', {}, h('td', {}, (part.drums ? '♩ ' : '') + part.name), h('td', {}, part.channel + 1), h('td', {}, part.noteCount),
          h('td', {}, noteName(part.low) + '–' + noteName(part.high)), h('td', {}, part.firstBar + '–' + part.lastBar),
          h('td', {}, part.programs.length ? part.programs.map(x => x + 1).join(', ') : '—'), h('td', {}, sel));
      }));
      ui.barFrom.max = ui.barTo.max = a.totalBars; ui.barFrom.value = 1; ui.barTo.value = a.totalBars;
      ui.rowSteps.replaceChildren(...a.rowSteps.candidates.map(c => option(c.steps, c.bars + (c.bars === 1 ? ' bar' : ' bars') + ' (' + c.steps + ' steps)' + (a.rowSteps.aligned ? '' : ', not on bar lines'), c.steps === a.rowSteps.default)));
    }

    function showSong(result, song) {
      const F = Format, usage = result ? result.stats : F.usage(song);
      const v = F.validate(song);
      ui.stats.replaceChildren(h('p', {}, h('strong', {}, song.name.trim() || '(unnamed)'), ' · tempo ' + (song.tempo || 'project') + ' · project ' + (song.projectSlot + 1) + ' · rows ' + song.rows.length +
        (result ? ' (from ' + result.stats.rowsBeforeMerge + ')' : '') + ', ' + usage.repeats + ' with repeats · row ' + [...new Set(song.rows.map(r => r.steps))].join('/') + ' steps · blocks ' + usage.blocks + ' of 2048 (' + usage.idPercent.toFixed(1) + ' %)' +
        (result ? ' from ' + result.stats.cellsBeforeDedup + ' cells' + (result.stats.looseMerges ? ', ' + result.stats.looseMerges + ' loose merge(s)' : '') : '') + ' · block bytes ' + usage.recordBytes + ' (' + usage.poolPercent.toFixed(2) + ' % of the pool, ' + usage.sectors + ' sector(s))' +
        (result ? ' · notes ' + result.stats.notesOut + ' of ' + result.stats.notesIn + ' (' + result.stats.offsets + ' with offsets, largest ' + result.stats.maxOffsetUnits + ' units; ' + result.stats.fractionalLengths + ' fractional lengths)' : '') + ' · row events ' + (song.events || []).length + ' of 292' + ' · .tabby ' + kb(usage.fileBytes) + '.'),
        ...v.warnings.map(w => h('p', { class: 'ti-muted' }, '⚑ ' + w)), ...v.errors.map(e => h('p', { class: 'ti-error' }, e)));
      ui.rows.replaceChildren(...song.rows.map((row, i) => h('tr', {}, h('td', {}, i + 1), h('td', {}, '×' + row.repeat + (row.loopHere ? ' ⟲' : '')), h('td', {}, row.steps),
        h('td', { class: 'ti-muted' }, (song.events || []).filter(e => e.row === i).map(e => e.type === 0 ? 'PC' + e.d0 : e.type === 1 ? 'B/PC' + e.d2 : e.type === 2 ? 'CC' + e.d0 : 'gap').join(' ') || '·'),
        ...row.blocks.map(id => h('td', { class: id ? 'ti-block' : 'ti-empty' }, id || '·')))));
      const list = result ? result.warnings : (song.warnings || []);
      ui.warnings.replaceChildren(list.length ? h('ul', { class: 'ti-list' }, ...list.map(w => h('li', { class: w.severity === 'warn' ? 'ti-warn' : '' },
        h('span', { class: 'ti-badge' }, w.severity === 'warn' ? 'changed' : 'info'), ' ', w.message, w.count > 1 || (w.items && w.items.length) ? ' (' + w.count + ')' : '',
        w.items && w.items.length ? h('details', {}, h('summary', {}, 'positions'), h('ul', {}, ...w.items.map(it => h('li', {}, (it.track ? 'T' + it.track + ': ' : '') + it.text)), w.count > w.items.length ? h('li', {}, '… ' + (w.count - w.items.length) + ' more') : null)) : null))) : h('p', { class: 'ti-muted' }, 'Nothing was dropped or changed.'));
    }

    function reconvert() {
      if (!state.analysis) return;
      try {
        const options = { fileName: state.fileName, assignments: state.assignments, outChannels: state.outChannels,
          barFrom: Number(ui.barFrom.value) || 1, barTo: Number(ui.barTo.value) || state.analysis.totalBars, rowSteps: Number(ui.rowSteps.value) || undefined,
          quantize: ui.quantize.value, lengthRule: ui.lengthRule.value, overflowRule: ui.overflowRule.value, name: ui.name.value, projectSlot: Number(ui.projectSlot.value), loop: ui.loop.checked, preRoll: ui.preRoll.value,
          looseDedup: ui.loose.checked, velocityTolerance: Math.max(0, Math.min(126, Math.round(Number(ui.tolerance.value) || 0))) };
        state.result = Song.convert(state.analysis, options); state.song = state.result.song;
        showSong(state.result, state.song);
        say('Converted. Nothing is written until step 6.');
      } catch (error) {
        state.result = null; state.song = null; ui.stats.replaceChildren(); ui.rows.replaceChildren(); ui.warnings.replaceChildren();
        say('Cannot convert: ' + error.message);
      }
      enable();
    }
    for (const el of [ui.barFrom, ui.barTo, ui.rowSteps, ui.quantize, ui.lengthRule, ui.overflowRule, ui.projectSlot, ui.loop, ui.loose, ui.tolerance, ui.preRoll]) el.addEventListener('change', reconvert);
    ui.name.addEventListener('input', () => { if (state.song) { state.song.name = Format.padName(ui.name.value); showSong(state.result, state.song); } });

    ui.file.addEventListener('change', async () => {
      const file = ui.file.files[0]; ui.file.value = ''; if (!file) return;
      try {
        if (file.size > 16 * 1024 * 1024) throw new Error('MIDI file larger than 16 MiB');
        const bytes = new Uint8Array(await file.arrayBuffer());
        state.parsed = Midi.parse(bytes); state.analysis = Song.analyze(state.parsed); state.fileName = file.name;
        state.assignments = Song.defaultAssignments(state.analysis);
        ui.name.value = Format.padName(file.name.replace(/\.[^.]+$/, '')).trim();
        showFile();
        if (state.analysis.errors.length) { state.result = state.song = null; say('Cannot import: ' + state.analysis.errors[0]); enable(); return; }
        reconvert();
      } catch (error) { state.parsed = state.analysis = state.result = state.song = null; ui.fileSummary.replaceChildren(); ui.parts.replaceChildren(); say(error.message); enable(); }
    });

    ui.saveJson.addEventListener('click', () => { if (state.song) download(Format.toJSON(state.song), (state.song.name.trim() || 'song').replace(/[^\w-]+/g, '_') + '.tabby-song.json', 'application/json'); });
    ui.exportTabby.addEventListener('click', () => { if (state.song) download(Format.encodeFile(state.song), (state.song.name.trim() || 'song').replace(/[^\w-]+/g, '_') + '.tabby'); });
    ui.loadJson.addEventListener('change', async () => {
      const file = ui.loadJson.files[0]; ui.loadJson.value = ''; if (!file) return;
      try {
        state.song = Format.fromJSON(await file.text()); state.result = null; state.analysis = null; state.parsed = null;
        ui.fileSummary.replaceChildren(h('p', {}, 'Loaded song JSON ', h('strong', {}, file.name), state.song.source?.fileName ? ' (imported from ' + state.song.source.fileName + ')' : '')); ui.parts.replaceChildren(); ui.fileWarnings.replaceChildren();
        ui.name.value = state.song.name.trim(); ui.projectSlot.value = String(state.song.projectSlot); ui.loop.checked = !!state.song.loop;
        state.song.outChannels.forEach((c, t) => { ui.channels.querySelector('select[data-track="' + t + '"]').value = c === null ? '' : String(c); });
        showSong(null, state.song); say('Song loaded from JSON. Options above apply to new MIDI imports only.');
      } catch (error) { say('Cannot load: ' + error.message); }
      enable();
    });

    ui.write.addEventListener('click', async () => {
      if (!state.song || state.busy) return;
      const slot = Number(ui.slot.value);
      if (!confirm('Write "' + state.song.name.trim() + '" to ' + transfer.name + ' song ' + (slot + 1) + '? A song already in that slot is deleted first; export a .tabby of it beforehand if you want to keep it.' + (transfer.real ? '' : '\n\n(Stub transfer: nothing is written; the plan is shown instead.)'))) return;
      state.busy = true; enable(); ui.plan.hidden = true; say('Writing…');
      try {
        const report = await transfer.write(slot, state.song, { progress: v => say('Writing… ' + Math.round(v * 100) + ' %') });
        say(report.message || ('Written to song ' + (slot + 1) + '.'));
        ui.plan.hidden = false;
        ui.plan.textContent = [`transfer: ${transfer.name}  sent: ${report.sent !== false}` + (report.replaced ? '  (previous song deleted first by the workbench)' : ''), `kind 5  target ${report.record.target}  ${report.record.bytes} bytes (song record, written first)`,
          ...(report.batches && report.batches.length
            ? report.batches.map((b, i) => `kind 7  batch ${i + 1}  ${b.blocks.length} block(s) ${b.blocks[0]}..${b.blocks[b.blocks.length - 1]}  ${b.bytes} bytes`)
            : report.blocks.map(b => `kind 6  target 0x${b.target.toString(16).padStart(6, '0')}  block ${b.id}  ${b.bytes} bytes`)),
          `total ${report.totalBytes} bytes, ${report.queries} queries, ` + (report.sent !== false ? `${report.seconds.toFixed(1)} s` : `about ${report.seconds.toFixed(1)} s`)].join('\n');
      } catch (error) { say('Write failed: ' + error.message); }
      state.busy = false; enable(); slotInfo();
    });

    enable();
    return { state, reconvert, ui };
  }

  const TabbyImportUI = { mount, h, version: '0.7' };
  globalThis.TabbyImportUI = TabbyImportUI;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyImportUI;
})();

const FM1_SIMULATOR = {"schema":1,"release_version":"V01","display_version":"tabby-v03.1","sha256":"f911d0456f752d78585907a2102b6f4405a6860000ea4b751ac4757290860737","source_sha256":"a261e0e575ed3511b09a2ec92159db6aff3fed028c2b5270e251d097522d56e4","sample_bank":"synthesized-demo","bytes":296562,"url":"./assets/smk37/f911d0456f752d78585907a2102b6f4405a6860000ea4b751ac4757290860737.wasm"};
(() => {
  const $=id=>document.getElementById(id);
  // Task 08: the badge shows the Classic Tabby display version (the git tag); the Open label is the fallback.
  $('release-version').textContent=FM1_SIMULATOR.display_version||FM1_PACKAGE?.display_version||FM1_SIMULATOR.release_version||FM1_PACKAGE?.release_version||'';
  const pages=['sim','library','update','manual'];
  function showPage(name){
    for(const page of pages){const active=page===name;$('tab-'+page).hidden=!active;$('mode-'+page).setAttribute('aria-selected',String(active));$('mode-'+page).tabIndex=active?0:-1;}
    document.dispatchEvent(new Event('fm1-view-change'));
  }
  for(const name of pages){
    $('mode-'+name).addEventListener('click',()=>showPage(name));
    $('mode-'+name).addEventListener('keydown',event=>{
      let i=pages.indexOf(name);
      if(event.key==='ArrowRight')i=(i+1)%pages.length;
      else if(event.key==='ArrowLeft')i=(i+pages.length-1)%pages.length;
      else if(event.key==='Home')i=0;
      else if(event.key==='End')i=pages.length-1;
      else return;
      event.preventDefault();showPage(pages[i]);$('mode-'+pages[i]).focus();
    });
  }
  const chapters=[...document.querySelectorAll('.manual-chapter')];
  const chapterText=chapters.map(node=>FM1I18n.sourceText(node).toLocaleLowerCase());
  const chapterLinks=[...document.querySelectorAll('.manual-index a')];
  function searchManual(){
    const terms=$('manual-search').value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);let count=0;
    chapters.forEach((node,i)=>{const match=terms.every(term=>(chapterText[i]+' '+node.textContent.toLocaleLowerCase()).includes(term));node.hidden=!match;chapterLinks[i].parentElement.hidden=!match;if(match)count++;});
    FM1I18n.text($('manual-count'),terms.length?'找到 '+count+' / '+chapters.length+' 章':'共 '+chapters.length+' 章');
    $('manual-empty').hidden=count!==0;$('manual-clear').hidden=!terms.length;
  }
  document.addEventListener('fm1-language-change',searchManual);
  $('manual-search').addEventListener('input',searchManual);
  $('manual-clear').addEventListener('click',()=>{$('manual-search').value='';searchManual();$('manual-search').focus();});
  $('manual-print').addEventListener('click',()=>window.print());
  function openChapter(id){
    const chapter=chapters.find(node=>node.id===id);if(!chapter)return;
    if(chapter.hidden){$('manual-search').value='';searchManual();}
    showPage('manual');chapter.focus({preventScroll:true});chapter.scrollIntoView({block:'start'});
  }
  document.querySelectorAll('a[href^="#manual-"]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();const id=link.getAttribute('href').slice(1);
    history.replaceState(null,'','#'+id);openChapter(id);
  }));
  window.addEventListener('hashchange',()=>openChapter(location.hash.slice(1)));
  openChapter(location.hash.slice(1));
  let pkg,openPkg,stockPkg,updater,library,voices=[],projectBytes,timbreBytes,libraryReady=false,connected=false,busy=false,writing=false,finishingUpdate=false,same=false,migration=false,forceSuggested=false,updateResult='',watchedAccess,midiRequest;
  let connecting;
  function beginConnection(){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(Error('连接超时，请检查 USB 连接和 MIDI 权限后重试。')),12000);
    connecting={controller,timer};enable();return connecting;
  }
  async function endConnection(attempt){
    clearTimeout(attempt.timer);
    if(attempt.controller.signal.aborted){
      libraryReady=false;connected=false;
      await Promise.allSettled([library?.disconnect(),updater?.disconnect()]);
    }
    if(library?.link)library.link.signal=undefined;
    if(updater?.link)updater.link.signal=undefined;
    if(connecting===attempt)connecting=undefined;
  }
  function cancelConnection(){connecting?.controller.abort(Error('已取消连接。'));}
  async function requestMidiAccess(report=status,signal) {
    signal?.throwIfAborted();
    if(!navigator.requestMIDIAccess)throw Error('当前浏览器不支持 Web MIDI，请使用电脑 Chrome 或 Edge');
    let finished=false;
    report('正在请求 MIDI 访问并初始化端口；若浏览器提示，请允许 MIDI / SysEx。');
    navigator.permissions?.query({name:'midi',sysex:true}).then(result=>{
      if(!finished&&result.state==='granted')report('MIDI 权限已允许，正在等待浏览器初始化设备端口…');
    }).catch(()=>{});
    if(!midiRequest){
      const pending=navigator.requestMIDIAccess({sysex:true}).then(access=>{
        if(!access.sysexEnabled)throw Error('请允许浏览器使用 MIDI / SysEx');return access;
      });
      midiRequest=pending;
      pending.catch(()=>{if(midiRequest===pending)midiRequest=undefined;});
    }
    const request=midiRequest;
    try {
      const access=await FM1Web.abortable(request,signal);
      report('正在搜索并连接 SMK37 OPEN…');return access;
    } catch(error){if(midiRequest===request)midiRequest=undefined;throw error;}
    finally {finished=true;}
  }
  const patchTarget=(id='patch-track')=>{const select=$(id),node=select.selectedOptions[0],track=Number(select.value);return node&&!node.disabled&&select.value!==''&&Number.isInteger(track)&&track>=0&&track<8?track:-1;};
  let deviceState={mode:'offline',epoch:0,busy:false},statusLink,connectionNotice;
  function createLibrary(access){
    const next=new FM1Web.Library(access);
    next.onProjectChange=()=>document.dispatchEvent(new Event('fm1-device-project-change'));
    return next;
  }
  const enable=()=>{
    const locked=busy||finishingUpdate||SMK37Boot.blocked;
    $('connect').disabled=locked||!pkg||!navigator.requestMIDIAccess; $('install').disabled=locked||!connected||migration||!updater?.link||updater.link.lost||same||!$('backup').checked; $('backup').disabled=locked||!pkg;
    $('force-update').disabled=locked||!pkg||pkg.kind==='stock';
    $('stock-restore').disabled=locked||!openPkg||!FM1_PACKAGE?.stock;
    $('stock-restore').hidden=pkg?.kind==='stock';$('open-firmware').hidden=pkg?.kind!=='stock';
    $('open-firmware').disabled=locked;$('stock-warning').hidden=pkg?.kind!=='stock';
    $('force-activate').hidden=!forceSuggested||$('force-update').checked;
    $('force-activate').disabled=locked||!pkg;
    FM1I18n.text($('update-next'),SMK37Boot.blocked?'页面资源不完整，请重新载入。':!pkg?'':finishingUpdate?'固件已更新，正在检查采样区…':busy?'设备操作进行中，请稍候。':updateResult==='stock'?'原厂固件与资源已恢复，读回校验通过。请重新开机后使用。':updateResult==='ready'?
      '更新已完成，可以开始使用 SMK37 OPEN，无需再次烧录。':updateResult==='samples'?
      '采样区尚未就绪：可重新检查；若提示校验失败，请在“项目与音色 → 8 槽采样库”恢复备份或确认写入内置库，无需重刷固件。':updateResult==='checked'?
      '采样区检查完成；已有有效采样保留，空采样区已补齐内置库。':!connected||migration?
      (forceSuggested?'检测到其他固件：可点击“启用强制烧录并重新连接”。':'下一步：连接设备。'):
      same?'已是当前版本；设备显示 EMPTY 时可点击“检查 / 初始化采样”，无需重刷。':!$('backup').checked?'下一步：勾选已备份确认，才能开始烧录。':pkg.kind==='stock'?'下一步：恢复当前型号的原厂 V16，确认后开始写入。':$('force-update').checked?
      '下一步：点击“强制烧录”，阅读并确认兼容风险。':'下一步：点击“开始更新”。');
    FM1I18n.text($('install'),pkg?.kind==='stock'?'刷入原厂 V16':$('force-update').checked?'强制烧录':'开始更新');
    $('library-connect').disabled=locked||!navigator.requestMIDIAccess;
    $('quick-connect').disabled=!connecting&&(locked||!navigator.requestMIDIAccess||(!$('tab-update').hidden&&!pkg));
    FM1I18n.text($('quick-connect'),connecting?'取消连接':'连接设备');
    const disconnected=!library?.link||library.link.lost;
    const unavailable=locked||disconnected||!libraryReady;
    for(const control of document.querySelectorAll('[data-library]'))control.disabled=unavailable;
    $('library-refresh').disabled=locked||disconnected;
    $('patch-import').disabled=unavailable||patchTarget()<0||!voices.length;
    $('patch-export').disabled=unavailable||patchTarget()<0;
    $('project-import').disabled=unavailable||!projectBytes;
    $('timbre-import').disabled=unavailable||!timbreBytes;
    const link=!disconnected?library.link:connected&&!updater?.link?.lost?updater?.link:undefined;
    const mode=!disconnected?'library':link?'update':'offline';
    deviceState={mode,epoch:deviceState.epoch+(statusLink!==link?1:0),busy:locked,connection:connectionNotice};statusLink=link;
    document.dispatchEvent(new CustomEvent('fm1-device-state',{detail:deviceState}));
  };
  document.addEventListener('fm1-view-change',enable);
  document.addEventListener('smk37-script-error',enable);
  const status=(text,progress)=>{ FM1I18n.text($('status'),text); if(progress===null)$('progress').removeAttribute('value');else if(progress!==undefined)$('progress').value=progress; };
  function clearUpdateConnection(text){
    connected=false;same=false;migration=false;forceSuggested=false;updateResult='';
    $('device-identity').textContent='';FM1I18n.text($('error'),'');status(text,0);
  }
  function connectionChanged(){
    if(busy||finishingUpdate)return;
    connectionNotice=undefined;
    if(connected&&updater?.link?.lost)clearUpdateConnection('设备已断开，请重新连接。');
    if(library?.link?.lost){libraryReady=false;message('设备已断开，请重新连接项目库。');}
    enable();
  }
  function watch(access){if(watchedAccess)watchedAccess.removeEventListener('statechange',connectionChanged);watchedAccess=access;access.addEventListener('statechange',connectionChanged);}
  $('backup').addEventListener('change',enable);
  async function setForceMode(value,reconnect=connected||!!(updater?.link&&!updater.link.lost)){
    if(busy||finishingUpdate)return false;
    busy=true;clearUpdateConnection('烧录模式已改变，请重新连接设备。');
    $('force-update').checked=value;$('force-warning').hidden=!value;enable();
    try{
      if(updater)await updater.disconnect();
    }catch(error){FM1I18n.text($('error'),error.message);return false;}
    finally{busy=false;enable();}
    if(reconnect)await connectDevice();
    return true;
  }
  $('force-update').addEventListener('change',()=>setForceMode($('force-update').checked));
  $('patch-track').addEventListener('change',enable);
  window.addEventListener('beforeunload',event=>{if(writing){event.preventDefault();event.returnValue='';}});
  function showConnectionDetails(diagnostics){
    const box=$('connection-details');box.hidden=!diagnostics;box.open=!!diagnostics;
    for(const kind of ['inputs','outputs','identities','expected','attempts']){
      const list=$('connection-'+kind);list.replaceChildren();
      const entries=diagnostics?.[kind]||[];
      if(!entries.length){const item=document.createElement('li');FM1I18n.text(item,'无');list.append(item);}
      for(const entry of entries){
        const item=document.createElement('li');
        if(kind==='attempts'){
          item.append(document.createTextNode(entry.input+' → '+entry.output+': '));
          const reason=document.createElement('span');FM1I18n.text(reason,entry.error);item.append(reason);
        }else item.textContent=entry;
        list.append(item);
      }
    }
  }
  async function connectDevice(){
    if(busy||finishingUpdate||SMK37Boot.blocked||!pkg)return;
    busy=true;clearUpdateConnection('正在搜索并连接 SMK37 OPEN…');showConnectionDetails(null);
    const report=text=>{status(text);connectionNotice={message:text,failed:false};enable();};
    report('正在搜索并连接 SMK37 OPEN…');
    let attemptUpdater;const attempt=beginConnection(),signal=attempt.controller.signal;
    try {
      if(library){libraryReady=false;await library.disconnect();message('已切换到网页烧录；使用项目库时请重新连接。');}
      if(updater)await updater.disconnect();
      const access=await requestMidiAccess(report,signal);
      watch(access);
      updater=new FM1Web.Updater(access,pkg,(text,value)=>status(
        pkg.kind!=='stock'&&value===100?'固件已写入，正在检查采样区…':text,
        pkg.kind!=='stock'&&typeof value==='number'?value*0.8:value));
      attemptUpdater=updater;
      const device=await updater.connect({force:$('force-update').checked,signal}); connected=true;same=!!device.same;migration=!!device.migration;forceSuggested=migration;
      $('device-identity').textContent=device.identity;
      status(migration?'已识别设备和当前固件；迁移请点击“启用强制烧录并重新连接”。':same?'已是当前版本，无需更新。':device.resume?'已连接升级程序，机型尚未核实；写入前需核对机身型号。':pkg.kind==='stock'?'已连接设备，可恢复原厂 V16。':$('force-update').checked?'已连接；开始强制烧录前将再次确认设备和兼容风险。':'已连接 SMK37 OPEN，可开始更新');
      connectionNotice=undefined;
    }catch(error){connectionNotice={message:error.message,failed:true};showConnectionDetails(attemptUpdater?.diagnostics);forceSuggested=error.code==='FIRMWARE_MISMATCH';FM1I18n.text($('error'),error.message);status('尚未连接');if(error.identity)$('device-identity').textContent=error.identity;}
    finally{await endConnection(attempt);busy=false;enable();}
  }
  $('connect').addEventListener('click',connectDevice);
  $('force-activate').addEventListener('click',()=>setForceMode(true,true));
  function packageDetails(){
    FM1I18n.text($('update-intro'),pkg.kind==='stock'?'连接当前型号，确认备份后点击“刷入原厂 V16”。':'连接 SMK37 OPEN，确认备份后点击“开始更新”。');
    FM1I18n.text($('profile'),'SMK37 '+(pkg.model==='elite'?'Elite':'Pro')+(pkg.kind==='stock'?' 原厂 V16':' Open'));
    $('firmware-version').textContent=pkg.display_version||pkg.release_version||'—';   // Task 08: the display version
    $('base-version').textContent=pkg.release_version||'—';                              // the Open label stays in the details
    FM1I18n.text($('version'),pkg.build_id.slice(0,16));$('version').title=pkg.build_id;
    FM1I18n.text($('size'),(pkg.bytes/1024).toFixed(1)+' KiB');
  }
  async function chooseFirmware(stock){
    if(busy||finishingUpdate||!openPkg)return;
    const reconnect=connected;busy=true;clearUpdateConnection('烧录目标已改变，请核对版本和备份。');enable();
    try{
      if(updater)await updater.disconnect();
      if(library){libraryReady=false;await library.disconnect();}
      if(stock&&!stockPkg){status('正在加载原厂固件…');stockPkg=await FM1Web.prepare(FM1_PACKAGE.stock);}
      pkg=stock?stockPkg:openPkg;$('backup').checked=false;$('force-update').checked=stock;
      $('force-warning').hidden=true;packageDetails();status('固件校验通过，等待连接设备');
    }catch(error){FM1I18n.text($('error'),error.message);return;}
    finally{busy=false;enable();}
    if(reconnect)await connectDevice();
  }
  $('stock-restore').onclick=()=>chooseFirmware(true);
  $('open-firmware').onclick=()=>chooseFirmware(false);
  const message=text=>{FM1I18n.text($('library-status'),text);if($('device-save-dialog').open)FM1I18n.text($('device-save-status'),text);};
  const perform=async(action)=>{
    if(busy||finishingUpdate||SMK37Boot.blocked)return;busy=true;connectionNotice=undefined;enable();
    try{await action();}catch(error){message(error.message);}finally{busy=false;enable();}
  };
  const option=(value,text)=>{const node=document.createElement('option');node.value=String(value);FM1I18n.text(node,text);return node;};
  async function deviceProject(action,refresh=false,duringUpdate=false,signal) {
    signal?.throwIfAborted();
    if(SMK37Boot.blocked)throw Error('页面资源不完整，请重新载入。');
    if(busy||(finishingUpdate&&!duringUpdate))throw Error('设备操作正在进行');busy=true;connectionNotice=undefined;enable();
    try {
      if(connected){clearUpdateConnection('已切换到项目库；烧录前请重新连接。');if(updater)await updater.disconnect();}
      if(!library?.link||library.link.lost){
        const attempt=beginConnection(),abort=()=>attempt.controller.abort(signal.reason);
        signal?.addEventListener('abort',abort,{once:true});
        try {
          signal?.throwIfAborted();
          libraryReady=false;if(library)await library.disconnect();const access=await requestMidiAccess(message,attempt.controller.signal);
          watch(access);library=createLibrary(access);await library.connect({signal:attempt.controller.signal});
        } finally {signal?.removeEventListener('abort',abort);await endConnection(attempt);}
      }
      signal?.throwIfAborted();
      const result=await action(library);
      if(refresh)await refreshLibrary(true);
      message('设备操作已完成。');return result;
    } finally {busy=false;enable();}
  }
  const saveDialog=$('device-save-dialog');let saveBytes,saveRunning=false,saveOpening=false,saveReturnFocus;
  function saveStatus(text){FM1I18n.text($('device-save-status'),text);}
  async function openSave(bytes){
    if(busy||finishingUpdate||saveOpening||saveRunning)throw Error('设备操作正在进行');
    saveOpening=true;saveBytes=bytes?.slice();saveReturnFocus=document.activeElement;
    const selected=!bytes?$('project-slot').value:'';
    FM1I18n.text($('device-save-source'),bytes?'将网页当前项目写入 SMK37 OPEN，替换设备当前工作区。':'将 SMK37 OPEN 当前工作区保存到所选设备项目槽。');
    $('device-save-confirm').disabled=true;$('device-save-slot').disabled=true;
    $('device-save-slot').replaceChildren();saveStatus('正在连接并读取设备项目槽…');saveDialog.showModal();
    try{
      await deviceProject(async()=>{},true);
      if(!saveDialog.open)return;
      for(const node of $('project-slot').options)$('device-save-slot').append(option(node.value,node.textContent));
      $('device-save-slot').value=selected||$('project-slot').value;
      $('device-save-confirm').disabled=false;$('device-save-slot').disabled=false;
      saveStatus('请选择保存位置；已有内容将被覆盖。');$('device-save-slot').focus();
    }catch(error){saveStatus(error.message);}finally{saveOpening=false;}
  }
  function closeSave(){if(saveRunning)return;if(saveOpening)cancelConnection();saveDialog.close();saveBytes=undefined;saveReturnFocus?.focus();}
  $('device-save-cancel').onclick=closeSave;
  saveDialog.addEventListener('cancel',event=>{event.preventDefault();closeSave();});
  $('device-save-confirm').onclick=async()=>{
    if(saveRunning||busy||finishingUpdate)return;const slot=Number($('device-save-slot').value);
    saveRunning=true;writing=true;$('device-save-confirm').disabled=true;
    $('device-save-slot').disabled=true;$('device-save-cancel').disabled=true;
    saveStatus('正在写入并读回校验，请保持设备连接…');
    try{
      const saved=await deviceProject(l=>l.saveProject(slot,saveBytes));
      document.dispatchEvent(new CustomEvent('fm1-device-project-saved',{detail:{bytes:saved}}));
      saveStatus('已保存到设备槽 '+(slot+1)+'，读回校验通过。');
      message('已保存到设备槽 '+(slot+1)+'，读回校验通过。');
      saveBytes=undefined;FM1I18n.text($('device-save-cancel'),'完成');
    }catch(error){saveStatus('保存未确认完成：'+error.message);$('device-save-confirm').disabled=false;$('device-save-slot').disabled=false;}
    finally{saveRunning=false;writing=false;$('device-save-cancel').disabled=false;}
  };
  saveDialog.addEventListener('close',()=>{FM1I18n.text($('device-save-cancel'),'取消');});
  $('quick-connect').addEventListener('click',()=>connecting?cancelConnection():$('tab-update').hidden?connectLibrary():connectDevice());
  $('about-open').onclick=()=>$('about-dialog').showModal();
  /* Classic Tabby (Task 03 a): no sample bank on the device. The post-update sample check
     is a no-op that reports the firmware as ready. */
  globalThis.FM1Workbench={state:()=>deviceState,read:()=>deviceProject(l=>l.download(0)),write:bytes=>deviceProject(l=>l.upload(0,0,bytes)),save:openSave};
  async function checkDeviceSamples(afterUpdate=false){
    if(busy||finishingUpdate&&!afterUpdate)return;
    updateResult=afterUpdate?'ready':'checked';
    status(afterUpdate?'固件已就绪。':'设备已就绪。',100);enable();
  }
  async function refreshLibrary(initial=false) {
    libraryReady=false;
    const info=await library.query(0);
    if(info.length!==14||info[1]!==16||info[2]>=16||!((info[0]===3&&info[3]===208&&info[4]===15)||(info[0]===4&&info[3]===224&&info[4]===15))||info.slice(6).some(source=>source>5))throw Error('设备项目库信息无效');
    const previous=Number($('project-slot').value),selected=initial||$('project-slot').value===''||!Number.isInteger(previous)||previous<0||previous>=16?info[2]:previous;
    const slots=[];
    for(let slot=0;slot<info[1];slot++){
      const name=await library.query(9,[slot],true);
      slots.push(option(slot,(slot+1)+' · '+String.fromCharCode(...name).trim()));
    }
    const working=await library.download(0);
    if(working.length!==(library.tuningBytes||(info[3]|info[4]<<8)))throw Error('设备文件长度无效');
    FM1Web.projectVersion(working);
    // Task 06 (a): the Bluetooth settings panel replaces the device's BLE page.
    $('radio-group').hidden=!library.radioSettings;
    if(library.radioSettings){const r=await library.radioRead();$('radio-on').checked=r.on;$('radio-audio').checked=r.audio;$('radio-role').value=r.host?'1':'0';}
    // Publish a complete snapshot only after every query succeeds. A partial
    // list must never enable load/save/import with an empty selection.
    $('project-slot').replaceChildren(...slots);
    $('project-slot').value=String(selected);
    const sources=['DX7','303','808','PSG','拨弦','采样器'];
    const toneTrack=$('timbre-track').value||'0';$('timbre-track').replaceChildren();
    for(let i=0;i<8;i++)$('timbre-track').append(option(i,'轨道 '+(i+1)+' · '+(sources[info[6+i]]||'未知')));
    $('timbre-track').value=toneTrack;
    const first=Array.from(info.slice(6)).findIndex(type=>type===0);
    for(const id of ['patch-track']){
      const track=Number($(id).value||0);$(id).replaceChildren();
      for(let i=0;i<8;i++){
        const node=option(i,'轨道 '+(i+1)+' · '+(sources[info[6+i]]||'未知'));node.disabled=info[6+i]!==0;$(id).append(node);
      }
      $(id).value=String(info[6+track]===0?track:first);
    }
    $('project-name').value=String.fromCharCode(...working.slice(3836,3848)).trimEnd();
    libraryReady=true;
  }
  function saveFile(bytes,name) {
    const url=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'})),a=document.createElement('a');
    a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function connectLibrary(){return perform(async()=>{
    const report=text=>{message(text);connectionNotice={message:text,failed:false};enable();};
    report('正在搜索并连接 SMK37 OPEN…');
    const attempt=beginConnection(),signal=attempt.controller.signal;
    try{
      libraryReady=false;clearUpdateConnection('已切换到项目库；烧录前请重新连接。');if(updater)await updater.disconnect();if(library)await library.disconnect();
      const access=await requestMidiAccess(report,signal);
      watch(access);
      library=createLibrary(access);await library.connect({signal});await refreshLibrary(true);message('项目库已连接。');connectionNotice=undefined;
    }catch(error){connectionNotice={message:error.message,failed:true};throw error;}
    finally{await endConnection(attempt);}
  });}
  $('library-connect').addEventListener('click',connectLibrary);
  // Task 06 (a): Bluetooth settings (transfer command 24). Each change is written at once.
  const radioMessage=text=>{$('radio-message').textContent=text?FM1I18n.t(text):'';};
  const radioWrite=async()=>{try{await library.radioWrite({on:$('radio-on').checked,audio:$('radio-audio').checked,host:$('radio-role').value==='1'});radioMessage('蓝牙设置已写入设备。');}catch(error){radioMessage(error.message);}};
  for(const id of ['radio-on','radio-audio','radio-role'])$(id).addEventListener('change',radioWrite);
  $('radio-forget').addEventListener('click',async()=>{if(!confirm(FM1I18n.t('清除设备上保存的 BLE MIDI 配对？')))return;try{await library.radioForget();radioMessage('已清除 MIDI 配对；请在电脑或平板上也删除该配对后重新配对。');}catch(error){radioMessage(error.message);}});
  $('library-refresh').addEventListener('click',()=>perform(async()=>{await refreshLibrary();message('项目与轨道列表已刷新。');}));
  $('project-rename').addEventListener('click',()=>perform(async()=>{
    const name=$('project-name').value;if(!/^[\x20-\x7e]{1,12}$/.test(name))throw Error('名称须为 1–12 个可显示的英文字符');
    await library.query(10,Array.from(name.padEnd(12),c=>c.charCodeAt(0)));message('名称已修改，请保存项目以保留修改。');
  }));
  $('project-save').addEventListener('click',()=>openSave().catch(error=>message(error.message)));
  $('project-load').addEventListener('click',()=>perform(async()=>{
    const slot=Number($('project-slot').value);
    await library.query(8,[slot]);await refreshLibrary();message('项目已载入。');
  }));
  $('project-export').addEventListener('click',()=>perform(async()=>{
    const data=await library.download(0);saveFile(FM1Web.projectFile(data),'SMK37 OPEN-project.fm1');message('当前项目已生成备份文件。');
  }));
  $('project-file').addEventListener('change',()=>perform(async()=>{
    projectBytes=undefined;const file=$('project-file').files[0];if(!file)return;
    if(file.size>4280)throw Error('项目备份文件过大');projectBytes=FM1Web.readProjectFile(new Uint8Array(await file.arrayBuffer()));message('备份校验通过，可以恢复到工作区。');
  }));
  $('project-import').addEventListener('click',()=>perform(async()=>{
    if(!projectBytes||!confirm(FM1I18n.t('用备份替换当前未保存的工作区？设备项目槽不会自动覆盖。')))return;
    await library.upload(0,0,projectBytes);await refreshLibrary();message('项目已恢复到工作区，请选择槽位保存。');
  }));
  $('timbre-file').addEventListener('change',()=>perform(async()=>{
    timbreBytes=undefined;const file=$('timbre-file').files[0];if(!file)return;
    if(file.size!==239)throw Error('请选择本版导出的 .fm1t 音色');
    timbreBytes=FM1Web.readTimbreFile(new Uint8Array(await file.arrayBuffer()));message('音色校验通过，可导入到选中的轨道。');
  }));
  $('timbre-import').addEventListener('click',()=>perform(async()=>{
    if(!timbreBytes)throw Error('请先选择音色文件');
    const track=Number($('timbre-track').value);
    if(!confirm(FM1I18n.t('替换轨道 '+(track+1)+' 的音源和音色？鼓与旋律互换会清空此轨步进。')))return;
    await library.upload(2,track,timbreBytes);await refreshLibrary();message('音色已导入。PROJECT 轨请保存项目；LIVE 轨请导出轨道音色，DX7 也可存入独立库。');
  }));
  $('timbre-export').addEventListener('click',()=>perform(async()=>{
    const track=Number($('timbre-track').value);
    saveFile(FM1Web.timbreFile(await library.download(2,track)),'SMK37 OPEN-track-'+(track+1)+'.fm1t');message('轨道音色已导出。');
  }));
  $('patch-file').addEventListener('change',()=>perform(async()=>{
    voices=[];$('patch-choice').replaceChildren();const file=$('patch-file').files[0];if(!file)return;
    if(file.size>4104)throw Error('请选择单音色或 32 音色 DX7 .syx 文件');
    voices=FM1Web.readVoices(new Uint8Array(await file.arrayBuffer()));
    voices.forEach((p,i)=>$('patch-choice').append(option(i,(i+1)+' · '+String.fromCharCode(...p.slice(145,155)).replace(/[^\x20-\x7e]/g,'?'))));
    message('已校验 '+voices.length+' 个音色，请选择音色与目标 DX7 轨道。');
  }));
  $('patch-import').addEventListener('click',()=>perform(async()=>{
    const track=patchTarget(),patch=voices[Number($('patch-choice').value)];
    if(!patch||track<0)throw Error('请选择 DX7 轨道与音色');
    if(!confirm(FM1I18n.t('替换轨道 '+(track+1)+' 的音色？该轨道的音符会停止。')))return;
    await library.upload(1,track,patch);message('音色已导入。PROJECT 轨请保存项目；LIVE 轨请导出轨道音色，DX7 也可存入独立库。');
  }));
  $('patch-export').addEventListener('click',()=>perform(async()=>{
    const track=patchTarget();if(track<0)throw Error('请先将一条轨道设为 DX7，再刷新列表');
    const patch=await library.download(1,track);saveFile(FM1Web.voiceFile(patch,track===7?9:track),'SMK37 OPEN-track-'+(track+1)+'.syx');message('音色已导出为 DX7 .syx 文件。');
  }));

  // ---- Classic Tabby song editor (Task 03 d) --------------------------------------------
  const songEd={song:null,blocks:new Map(),slot:0};
  const songMessage=text=>FM1I18n.text($('song-message'),text);
  const songSim=()=>$('song-target').value==='sim';
  // `progress` (Task 02 Step 4) lets the MIDI importer show the write progress in its own
  // panel; `exists` returns the slot's record image (or null) without downloading blocks.
  const songBackend=(progress=p=>songMessage('正在写入歌曲 '+Math.round(p*100)+'%'))=>{
    if(songSim()){const sim=globalThis.FM1Simulator;if(!sim||!sim.ready())throw Error('请先启动仿真');
      return {read:song=>sim.request('song-read',{song}).then(d=>d?{record:d.record,blocks:new Map(d.blocks)}:null),
        write:(song,record,blocks)=>sim.request('song-write',{song,record,blocks:[...blocks]}),
        remove:song=>sim.request('song-delete',{song}),status:()=>sim.request('song-status'),
        exists:song=>sim.request('song-read',{song}).then(d=>d?d.record:null)};}
    if(!library||!libraryReady)throw Error('请先连接项目库');
    return {read:song=>library.songRead(song,p=>songMessage('正在读取歌曲 '+Math.round(p*100)+'%')),write:(song,record,blocks)=>library.songWrite(song,record,blocks,progress),
      remove:song=>library.songDelete(song),status:()=>library.songStatus(),
      exists:song=>library.download(5,song).catch(error=>{if(error.deviceCode===1)return null;throw error;})};
  };
  // Task 02 Step 4: the MIDI importer (web/import/, inlined by build-web.py) mounts next to the
  // editor and writes through the same backend, so device and simulator targets behave alike.
  if(globalThis.TabbyImportUI&&globalThis.TabbySongTransfer&&$('midi-import'))
    TabbyImportUI.mount($('midi-import'),{transfer:TabbySongTransfer.select({backend:songBackend,name:()=>songSim()?'simulator':'device'})});
  // Task 04: the rig setup and the row event editor (web/rig/, inlined by build-web.py) edit
  // song.events in place; the write and export paths take the list with the rig's gaps applied.
  const rigUI=globalThis.TabbyRigUI&&globalThis.TabbyRig&&globalThis.TabbyDevices&&$('rig-setup')&&$('song-events')
    ?TabbyRigUI.mount({setup:$('rig-setup'),events:$('song-events'),library:TabbyDevices.load(globalThis.FM1_DEVICES||[]),onChange:()=>{},message:text=>songMessage(text)}):null;
  for(let i=0;i<16;i++){$('song-slot').append(option(i,String(i+1)));$('song-project').append(option(i,String(i+1)));}
  for(let t=0;t<8;t++){const l=document.createElement('label');l.textContent='T'+(t+1)+' ';const i=document.createElement('input');i.type='number';i.min='0';i.max='16';i.step='1';i.dataset.songChannel=t;l.append(i);$('song-channels').append(l);}
  for(let s=0;s<64;s++){const l=document.createElement('label');l.textContent=(s+1)+' ';const i=document.createElement('input');i.type='text';i.dataset.songStep=s;i.placeholder='-';l.append(i);$('song-steps').append(l);
    i.addEventListener('focus',()=>songInspect(s));i.addEventListener('input',()=>{songMark(i);if(songEd.inspecting===s)songInspect(s);});}
  // Task 05: a step with an offset or a fractional length is marked; the inspector edits the focused step's notes.
  const SONG_UNITS=480;
  function songMark(i){let nudged=false;try{nudged=FM1Web.songStepParse(i.value).notes.some(n=>n.offset||n.length%SONG_UNITS);}catch(_){}i.classList.toggle('nudged',nudged);}
  function songInspect(s){
    const box=$('song-inspector'),input=$('song-steps').querySelector('input[data-song-step="'+s+'"]');songEd.inspecting=s;
    let step;try{step=FM1Web.songStepParse(input.value);}catch(error){box.hidden=false;box.textContent=error.message;return;}
    const bpm=Number($('song-tempo').value)||120,msPerUnit=TabbyTimedNote.unitMs(bpm);
    box.hidden=false;box.replaceChildren();
    const t=document.createElement('table'),head=document.createElement('tr');
    for(const h of ['步 '+(s+1),'音高','力度','重触发','偏移（单位）','','长度（步 + 单位）','']){const th=document.createElement('th');th.textContent=h;head.append(th);}t.append(head);
    const write=()=>{input.value=FM1Web.songStepText(step);songMark(input);songInspect(s);};
    step.notes.forEach((n,k)=>{
      const tr=document.createElement('tr');const cell=el=>{const td=document.createElement('td');td.append(el);tr.append(td);return td;};
      const num=(value,min,max,stepv,on)=>{const i=document.createElement('input');i.type='number';i.min=min;i.max=max;i.step=stepv;i.value=value;i.addEventListener('change',()=>{on(Number(i.value));write();});return i;};
      cell(document.createTextNode(String(k+1)));
      cell(num(n.pitch,0,127,1,v=>{n.pitch=Math.max(0,Math.min(127,Math.round(v)));}));
      cell(num(n.velocity,1,127,1,v=>{n.velocity=Math.max(1,Math.min(127,Math.round(v)));}));
      const r=document.createElement('input');r.type='checkbox';r.checked=!!n.retrigger;r.addEventListener('change',()=>{n.retrigger=r.checked;write();});cell(r);
      cell(num(n.offset,-240,240,1,v=>{n.offset=Math.max(-240,Math.min(240,Math.round(v)));}));
      const ro=document.createElement('span');ro.className='readout';ro.textContent=TabbyTimedNote.offsetFraction(n.offset)+' 步 · '+(n.offset*msPerUnit>=0?'+':'')+(n.offset*msPerUnit).toFixed(2)+' ms @ '+bpm;cell(ro);
      const steps=Math.floor(n.length/SONG_UNITS),rest=n.length%SONG_UNITS,len=document.createElement('span');
      len.append(num(steps,0,17476,1,v=>{n.length=Math.max(1,Math.max(0,Math.round(v))*SONG_UNITS+(n.length%SONG_UNITS));}),' + ',num(rest,0,479,1,v=>{n.length=Math.max(1,Math.floor(n.length/SONG_UNITS)*SONG_UNITS+Math.max(0,Math.min(479,Math.round(v))));}));cell(len);
      const rl=document.createElement('span');rl.className='readout';rl.textContent=FM1Web.songLengthText(n.length)+' 步 · '+(n.length*msPerUnit).toFixed(1)+' ms';cell(rl);
      t.append(tr);});
    box.append(t);
    if(!step.notes.length){const p=document.createElement('p');FM1I18n.text(p,'此步没有音符：在上方文本框中输入，例如 60:100:1/-12');box.append(p);}
  }
  const songQuantize=mode=>{let changed=0;for(const i of $('song-steps').querySelectorAll('input')){if(!i.value.trim())continue;let step;try{step=FM1Web.songStepParse(i.value);}catch(_){continue;}
    for(const n of step.notes){const before=n.offset+':'+n.length;if(n.offset)n.offset=0;if(mode==='ends')n.length=Math.max(1,Math.round(n.length/SONG_UNITS))*SONG_UNITS;if(before!==n.offset+':'+n.length)changed++;}
    i.value=FM1Web.songStepText(step);songMark(i);}
    if(songEd.inspecting!==undefined)songInspect(songEd.inspecting);songMessage('已量化 '+changed+' 个音符（仅编辑器中的本块；点击“保存块”保留）。');};
  $('song-quantize-starts').addEventListener('click',()=>songQuantize('starts'));
  $('song-quantize-ends').addEventListener('click',()=>songQuantize('ends'));
  const songBlockList=()=>FM1I18n.text($('song-blocks'),songEd.blocks.size?'编辑器中的块：'+[...songEd.blocks.keys()].sort((a,b)=>a-b).join(', '):'编辑器中没有块。');
  function songRowsRender(){
    const body=$('song-rows').querySelector('tbody');body.replaceChildren();
    songEd.song.rows.forEach((row,r)=>{const tr=document.createElement('tr');const th=document.createElement('th');th.textContent=String(r+1);tr.append(th);
      const cell=(value,attrs,cls)=>{const td=document.createElement('td'),i=document.createElement('input');Object.assign(i,attrs);i.value=value;i.dataset.songRow=r;i.dataset.songField=cls;td.append(i);tr.append(td);};
      for(let t=0;t<8;t++)cell(row.block[t],{type:'number',min:'0',max:'65535',step:'1'},'b'+t);
      cell(row.repeat,{type:'number',min:'1',max:'64',step:'1'},'repeat');cell(row.steps,{type:'number',min:'16',max:'64',step:'16'},'steps');
      const td=document.createElement('td'),c=document.createElement('input');c.type='checkbox';c.checked=row.loopHere;c.dataset.songRow=r;c.dataset.songField='loop';td.append(c);tr.append(td);
      body.append(tr);});
    // Task 06: per track, the pattern numbers (rows with a block) the TRACK LAUNCH page offers.
    $('song-patterns').textContent=FM1I18n.t('各轨图案（行号）：')+songEd.song.rows.length?Array.from({length:8},(_,t)=>'T'+(t+1)+' '+(songEd.song.rows.map((row,r)=>row.block[t]?String(r+1):'').filter(Boolean).join(' ')||'-')).join('   '):'';
  }
  function songRender(){
    const s=songEd.song;$('song-editor').hidden=!s;if(!s)return;
    $('song-name').value=s.name;$('song-project').value=String(s.project);$('song-tempo').value=String(s.tempo);$('song-loop').checked=s.loop;
    $('song-loop-row').value=String(s.loopRow+1);$('song-jump').value=s.jumpRow?'1':'0';$('song-swing').checked=!!s.swing;
    for(const i of $('song-channels').querySelectorAll('input'))i.value=String(s.channel[Number(i.dataset.songChannel)]);
    songRowsRender();songBlockList();
    if(rigUI)rigUI.setSong(s);
  }
  function songCollect(){
    const s=songEd.song;if(!s)throw Error('请先读取或新建歌曲');
    s.name=$('song-name').value;s.project=Number($('song-project').value);s.tempo=Number($('song-tempo').value)||0;s.loop=$('song-loop').checked;
    s.loopRow=Number($('song-loop-row').value)-1;s.jumpRow=$('song-jump').value==='1';s.swing=$('song-swing').checked;
    for(const i of $('song-channels').querySelectorAll('input'))s.channel[Number(i.dataset.songChannel)]=Number(i.value)||0;
    for(const i of $('song-rows').querySelectorAll('input')){const row=s.rows[Number(i.dataset.songRow)],f=i.dataset.songField;
      if(f==='loop')row.loopHere=i.checked;else if(f==='repeat')row.repeat=Number(i.value);else if(f==='steps')row.steps=Number(i.value);else row.block[Number(f.slice(1))]=Number(i.value)||0;}
    // Task 04: events with the rig's gaps applied; a song with events becomes a version-2 record.
    const record=FM1Web.songRecordBuild({...s,events:rigUI?rigUI.prepareEvents(s):(s.events||[])});
    for(const id of FM1Web.songBlockIds(s))if(!songEd.blocks.has(id))throw Error('行中引用的块 '+id+' 不在编辑器中，请先保存该块');
    return record;
  }
  const songAct=fn=>async()=>{try{await fn();}catch(error){songMessage(error.message);}};
  $('song-target').addEventListener('change',()=>{songEd.song=null;songEd.blocks=new Map();songRender();songMessage('');});
  $('song-new').addEventListener('click',songAct(async()=>{songEd.song=FM1Web.songEmpty();songEd.blocks=new Map();songRender();songMessage('已新建空歌曲：填写行与块后点击“写入歌曲”。');}));
  $('song-read').addEventListener('click',songAct(async()=>{
    const slot=Number($('song-slot').value),got=await songBackend().read(slot);
    if(!got){songEd.song=null;songEd.blocks=new Map();songRender();songMessage('该歌曲槽为空。');return;}
    songEd.song=FM1Web.songRecordParse(got.record);songEd.blocks=got.blocks;songRender();songMessage('歌曲已读取。');
  }));
  $('song-write').addEventListener('click',songAct(async()=>{
    const slot=Number($('song-slot').value),record=songCollect();
    // Task 03 (f): the shared write path deletes an occupied slot first; say so before writing.
    const old=await songBackend().exists(slot);
    if(!confirm(FM1I18n.t('写入歌曲槽 ')+(slot+1)+'?'+(old?'\n\n'+FM1I18n.t('该槽已有歌曲：写入前会先删除旧歌曲，其块在下次压缩时回收。如需保留旧歌曲，请先取消并导出 .tabby。'):'')))return;
    await songBackend().write(slot,record,songEd.blocks);songMessage(old?'旧歌曲已删除，新歌曲已写入并读回校验。':'歌曲已写入并读回校验。');
  }));
  $('song-delete').addEventListener('click',songAct(async()=>{
    const slot=Number($('song-slot').value);if(!confirm(FM1I18n.t('删除歌曲槽 ')+(slot+1)+'?'))return;
    await songBackend().remove(slot);songMessage('歌曲已删除。');
  }));
  $('song-export').addEventListener('click',songAct(async()=>{
    const record=songCollect();saveFile(FM1Web.tabbyFile(record,songEd.blocks,rigUI?rigUI.trailer(songEd.song):null),'SMK37 OPEN-'+(songEd.song.name.trim()||'song').replace(/[^A-Za-z0-9-]+/g,'_')+'.tabby');songMessage('已导出 .tabby 文件。');
  }));
  $('song-file').addEventListener('change',songAct(async()=>{
    const file=$('song-file').files[0];if(!file)return;if(file.size>4096+2048*1608)throw Error('.tabby 文件过大');
    const got=FM1Web.readTabbyFile(new Uint8Array(await file.arrayBuffer()));songEd.song=FM1Web.songRecordParse(got.record);songEd.blocks=got.blocks;
    if(got.trailer&&got.trailer.rig&&globalThis.TabbyRig){try{songEd.song.rig=TabbyRig.rigNormalize(got.trailer.rig);}catch(_){songEd.song.rig=null;}}   // Task 04: per-song rig override
    songRender();
    songMessage('已导入 .tabby 文件到编辑器，点击“写入歌曲”上传。');
  }));
  $('song-status').addEventListener('click',songAct(async()=>{
    const s=await songBackend().status();
    const words=['follow','launched','stopped'],queues=['','queued launch','queued stop','queued back to song'];
    const tracks=s.tracks?'; tracks: '+s.tracks.map((t,i)=>'T'+(i+1)+' '+words[t.state]+(t.row!==255?' r'+(t.row+1):'')+(t.queue?' ('+queues[t.queue]+')':'')+(t.waiting?' waiting':'')).join(', '):'';
    songMessage('Song storage: '+s.free+' bytes free, '+s.reclaimable+' bytes reclaimable'+(s.state===2?' (old sample / DX7 data still present)':s.state===1?' (busy)':'')+(s.events?'; loaded song: '+s.events+' events, '+s.late+' late':'')+tracks+'.');
  }));
  $('song-row-add').addEventListener('click',songAct(async()=>{if(!songEd.song)throw Error('请先读取或新建歌曲');if(songEd.song.rows.length>=128)throw Error('最多 128 行');
    const last=songEd.song.rows[songEd.song.rows.length-1];songEd.song.rows.push({block:last.block.slice(),repeat:last.repeat,loopHere:false,steps:last.steps});songRowsRender();}));
  $('song-row-remove').addEventListener('click',songAct(async()=>{if(!songEd.song||songEd.song.rows.length<=1)throw Error('至少保留 1 行');songEd.song.rows.pop();songRowsRender();}));
  $('song-block-load').addEventListener('click',songAct(async()=>{
    const id=Number($('song-block-id').value),payload=songEd.blocks.get(id);
    const steps=payload?FM1Web.songPayloadParse(payload):Array.from({length:64},()=>({probability:0,alt:false,notes:[]}));
    for(const i of $('song-steps').querySelectorAll('input')){i.value=FM1Web.songStepText(steps[Number(i.dataset.songStep)]);songMark(i);}
    $('song-inspector').hidden=true;songEd.inspecting=undefined;
    songMessage(payload?'块 '+id+' 已载入到步进编辑器。':'块 '+id+' 尚不存在：编辑后点击“保存块”创建。');
  }));
  $('song-block-store').addEventListener('click',songAct(async()=>{
    const id=Number($('song-block-id').value);if(!(id>=1&&id<=65535))throw Error('块编号须为 1–65535');
    const steps=[];for(const i of $('song-steps').querySelectorAll('input'))steps[Number(i.dataset.songStep)]=FM1Web.songStepParse(i.value);
    songEd.blocks.set(id,FM1Web.songPayloadBuild(steps));songBlockList();songMessage('块 '+id+' 已保存到编辑器；写入歌曲时上传。');
  }));
  $('song-block-remove').addEventListener('click',songAct(async()=>{const id=Number($('song-block-id').value);songEd.blocks.delete(id);songBlockList();songMessage('块 '+id+' 已从编辑器移除。');}));
  $('install').addEventListener('click',async()=>{
    if(busy||finishingUpdate||SMK37Boot.blocked||!connected||migration||same||!$('backup').checked)return;
    const force=$('force-update').checked;
    const confirmedModel=updater.mode==='loader'?pkg.model:undefined;
    if(confirmedModel&&!confirm(FM1I18n.t('升级程序名称不能确定机身型号。请核对机身铭牌，仅连接目标设备。确认机身型号为：')+' SMK-37 '+(confirmedModel==='pro'?'Pro':'Elite')+'?'))return;
    if(pkg.kind==='stock'){
      if(!confirm(FM1I18n.t('确认恢复原厂 V16？Open 项目、音色和采样可能被覆盖，请确认已备份。目标：')+' '+pkg.product+'\n\n'+FM1I18n.t('恢复 V16 还会覆盖 Classic Tabby 歌曲存储的最后 40 KB（块扇区 86–95）。请先在“项目与音色 → 歌曲模式”导出歌曲。')))return;
    }else if(force&&!confirm(FM1I18n.t('确认强制烧录？当前设备：')+updater.identity+'\n\n'+FM1I18n.t('警告：可能与设备不兼容，可能丢失数据或无法开机，需要专用工具恢复。仅当确认目标设备为 SMK37 OPEN 并接受风险时继续。')))return;
    busy=true;writing=true;enable();FM1I18n.text($('error'),'');
    let completed=false;
    try{await updater.install({force,confirmedModel});completed=true;}
    catch(error){FM1I18n.text($('error'),error.message);status('升级未完成；请保留本网页，检查设备连接后重试',0);showConnectionDetails(updater.diagnostics);}
    finally{busy=false;writing=false;connected=false;finishingUpdate=completed;if(completed)$('device-identity').textContent=pkg.product;enable();}
    if(completed){
      if(pkg.kind==='stock'){
        updateResult='stock';finishingUpdate=false;status('原厂固件与资源已恢复，读回校验通过。请重新开机后使用。',100);enable();return;
      }
      await checkDeviceSamples(true);
    }
  });
  let firmwareTask;
  function loadFirmware(){
    if(firmwareTask)return firmwareTask;
    firmwareTask=(async()=>{
    try {
      if(!window.isSecureContext||!crypto.subtle)throw Error('请从 HTTPS 网站或 localhost 打开此网页');
      $('sample-bank-note').hidden=FM1_SIMULATOR.sample_bank!=='synthesized-demo';
      if(!FM1_PACKAGE){
        FM1I18n.text($('update-intro'),'本页缺少内置固件，无法烧录。请重新下载完整官方工作台。');
        FM1I18n.text($('profile'),'网页试听与编辑');$('firmware-version').textContent=FM1_SIMULATOR.display_version||FM1_SIMULATOR.release_version||'—';$('base-version').textContent=FM1_SIMULATOR.release_version||'—';FM1I18n.text($('version'),FM1_SIMULATOR.sha256.slice(0,16));FM1I18n.text($('size'),'未附带设备固件');
        status('内置固件不可用，请重新下载完整官方工作台。');
        $('backup').disabled=true;enable();return;
      }
      FM1I18n.text($('error'),'');status('正在加载固件…');
      pkg=openPkg=await FM1Web.prepare(FM1_PACKAGE);
      packageDetails();
      if(!navigator.requestMIDIAccess)throw Error('当前浏览器不支持 Web MIDI，请使用电脑 Chrome 或 Edge');
      status('固件校验通过，等待连接设备');enable();
    }catch(error){firmwareTask=undefined;FM1I18n.text($('error'),error.message);status('固件加载失败，请重新打开设备更新页重试。');}
    finally{enable();}
    })();return firmwareTask;
  }
  document.addEventListener('fm1-view-change',()=>{if(!$('tab-update').hidden)loadFirmware();});
  if(!FM1_PACKAGE||FM1_PACKAGE.data)loadFirmware();
  else {status('打开设备更新页后加载固件。');enable();}
})();
