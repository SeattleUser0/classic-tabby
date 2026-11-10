# SMK37 OPEN V01

[English](README.md) · 简体中文

**已含 SDK：**本开发包包含匹配的原生二进制 SDK。

[工作台与开发包](https://open.m-vave.com/smk37-workbench) · [官方论坛](https://forum.m-vave.com)

适用于 M-VAVE SMK-37 Pro／Elite，支持 37 个琴键、16 个打击垫、8 个旋钮和 4 个推子。SMK37 OPEN 工作台支持固件更新、浏览器试听及项目、歌曲和 DX7 音色管理；选择“源码与 SDK”可下载与该版本匹配的开发包。

## V01 功能

- 8 轨，支持 DX7 FM、303、808、PSG 和拨弦共 5 种音源（采样器已移除）；16–64 步音序、琶音器、和弦、参数锁、效果及 16 个项目槽。
- **DX7 音色：**128 个预置音色，分为 A–D 4 组，每组 32 个。工作台可把标准单音色或 32 音色 DX7 SysEx 文件导入某一轨，不处理扩展参数。机身没有用户音色库。
- **轨道模式：**SHIFT + HOME，K2 选择 PROJECT、LIVE 或 OFF。LIVE 在切换项目时保留音色和按住的音符；其音色须单独导出。PROJECT 与 LIVE 分别独奏。
- **录音：**自 tabby-v04.0 起机身没有录音（步进录入、实时录入、预备拍和节拍器已移除，之后的版本会恢复）。歌曲在网页工作台编写，或从 MIDI 文件导入。
- **速度：**30–300 BPM。工作台 TAP，或任何页面的 HOME + SEQ 可打拍测速（单独按 SEQ 总是打开 SYNC / MIDI 页）。Delay 支持速度同步或约 30–2040 ms 的固定延时。

## SMK37 操作

- **PAD / STEP** 进入／退出独立 Pad 乐器（tabby-v04.0 没有 Pad 步进模式）。K5 选择当前乐器的轨道。KEY 与 PAD 分别记忆分配，默认轨 1／通道 1 和轨 8／通道 10。SHIFT + Pads 1–8 选轨；SHIFT + Pads 9–16 切换静音。
- **SHIFT + HOME / SRC** 打开音源选择：Pads 1–6 或 K1 选择，左侧按键组第 4 键（SHIFT、FADER BANK、HOME 之后）应用，HOME 取消。EDIT、ENV、LFO、FX 和 OCT 跟随当前乐器。K1–K4 调整屏幕参数，K6 翻页，K7 选择当前页面的预设或音色（SYNC / MIDI 页上是 KEY OUT）。
- **FADER BANK** 将推子分配到轨 1–4 或 5–8；切换组或加载项目后，经过屏幕提示的目标值才接管。弯音轮、调制轮和踏板跟随 KEY；开机前请将两轮归位。
- **Pad 压力** 在该 Pad 音符原始通道发送通道触后，最后一个 Pad 松开时归零。DX7 用于颤音；其他音源及外接乐器按各自实现响应。网页 Pad 可向上拖动或使用支持压力的触控笔。
- **左侧按键组第 4 键（SHIFT、FADER BANK、HOME 之后）** 打开项目保存页并确认屏幕上的操作；HOME + 该键撤销最近一次改动。旋钮从左起为 K1 到 K8（固件把 K5 叫 SELECT、K6 叫 PAGE、K7 叫 PRESETS、K8 叫 MASTER）。

详细页面操作见工作台“帮助”。网页与设备分别存储；网页修改须主动写入设备。

## MIDI 与蓝牙

支持 USB／BLE MIDI 输入及 DIN／USB／BLE MIDI 输出；Pro 和 Elite 没有 DIN MIDI 输入。默认输入通道 1–7 对应轨 1–7，通道 10 对应轨 8；共享输入通道可叠加演奏。

- **SYNC / MIDI（任何页面按 SEQ）：**K1 CLOCK（INT／MIDI）、K2 CLK IN（AUTO／USB／BLE；DIN 收不到任何数据，因为 TRS 口只能输出）、K3 SWING、K4 SEQ OUT（OFF、ON，或 CLOCK 仅时钟／启停）、K7 KEY OUT（琴键／Pad 输出开关）。速度只在 HOME 的 K4 设置（HOME + SEQ 可拍击速度）。
- **MIDI TRACK（SHIFT + SEQ）：**K1 IN CH、K2 OUT CH、K3 SEQ（LOCAL／BOTH／MIDI）、K4 OUT PORT（ALL／OFF）。输入和输出通道独立；分轨输出需逐轨设置 OUT CH。
- tabby-v04.0 机身没有步进编辑和录音（STEP DETAILS、LOCKS、RHYTHM、REC、预备拍和节拍器已移除）；歌曲来自网页工作台。
- SEQ 设置不控制 ARP；ARP 固定 BOTH，跟随本轨 OUT CH 和公共 OUT PORT。只发时钟时，还需关闭 KEY OUT 和各轨 ARP。

默认 SEQ BOTH、KEY OUT ON、OUT PORT ALL、SEQ OUT ON。升级保留已保存的选择；偏好独立于项目。本地演奏始终开启，MIDI Thru 关闭。支持 MIDI Clock、Start、Continue、Stop 和 Song Position Pointer；外部时钟丢失后停止同步播放。网页仅预览设置，不向外部设备发送演奏 MIDI。

蓝牙 **DEVICE** 模式通过 `SMK37 Pro Open_BLE` 或 `SMK37 Elite Open_BLE` 连接 MIDI，电脑端需支持 BLE MIDI 的软件／驱动。音频需开启 BLUETOOTH 和 BT AUDIO，再配对 `SMK37 Pro Open` 或 `SMK37 Elite Open`。DEVICE／HOST 只选择 MIDI 角色。旧 MIDI 配对失败时，使用 **FORGET MIDI PAIRS**，并删除电脑上的旧记录后重新配对。

## 更新与恢复

选择与机身 Pro 或 Elite 一致的工作台，使用桌面 Chrome／Edge、USB 连接及 MIDI／SysEx 权限。备份项目、歌曲和音色（完整备份）后，按“设备更新”提示操作。从一个 Classic Tabby 版本更新到另一个从不需要强制烧录；只有首次从原厂固件迁移时，才手动勾选“强制烧录”；连接升级程序时须确认机身型号。更新和版本核对完成前保持供电与 USB 连接。

更新中断时，设备的升级程序只接受它正在接收的那个版本：关闭其他标签页，给设备断电重启，再打开工作台提示的那个版本的页面（每个版本的永久页面见 builds/ 列表）；绝不要强制烧录。安装后若设备提示 OLD DATA IN SONG STORAGE，长按 SEQ，在 ACTIONS 中选 ERASE OLD DATA，并用左侧按键组第 4 键确认；项目、调音和设置不受影响。帮助中的“tabby-v04 有什么变化”一章列出存储迁移、被移除的步进编辑、SYNC / MIDI、STOP TO SAVE、计时计数器和恢复页面。

“**刷回原厂 V16**”使用 [M-VAVE 下载页](https://www.m-vave.com/download)于 2026-08-12 发布的对应型号原始 V016 包。先备份 Open 数据，资源校验完成后断电重启。“切回 Open 固件”返回 Open 更新流程。Pro／Elite 固件分别适配；仅凭升级程序名称无法识别机型。

切换固件不代表数据格式互通。请分别导出项目、歌曲和音色；项目不包含歌曲。保留备份以便回退；尚未验证所有第三方固件的兼容性。

## 编译

需要 Windows x64、PowerShell、`curl.exe` 和 `tar.exe`。本 SMK37 SDK 使用 [杰理 Windows 工具链 2.5.3](https://jl-update.oss-cn-shenzhen.aliyuncs.com/2.5.3.exe)，包含 PI32v2 clang 4.0.1，目标为 `r3`；参见[安装指南](https://doc.zh-jieli.com/Tools/zh-cn/dev_tools/dev_env/jl_toolchain.html)。`sdk/manifest.json` 校验全部 22 个工具链文件及 SDK。更新时请成套替换源码和 SDK，并保留清单校验。

本地网页预览：

```powershell
.\tools\Build-Web.ps1 -LocalPreview
```

分发前，将 `FM1_SOURCE_URL` 设为匹配源码压缩包的 HTTPS 地址，包含修改、许可及编译／安装脚本；持续变化的仓库页面不能代替匹配源码包。然后运行：

```powershell
$env:FM1_PI32_TOOLCHAIN = 'C:\JL\pi32'
.\build.bat pro --package
.\build.bat elite --package
```

仅编译固件可运行 `.\sdk\Build.ps1 -Model pro -FirmwareOnly -Toolchain 'C:\JL\pi32'`（或 `-Model elite`）。网页首次构建下载 WASI SDK 27，可用 `FM1_WASI_SDK` 指定已有安装。环境变量名与 FM1 共用。

输出：`build/preview/index.html`、`build/<model>/generated/` 和 `build/official-web/<model>/SMK37-Open-Source.html`。静态部署见 [HOSTING.md](HOSTING.md)。两款硬件共用 APP，驱动位于 `app/board/`。[逐轨调律接口](app/instrument.h)可用，暂未提供专门的调律编辑页面。

## 许可

APP 与网页应用源码采用[附 SDK 链接例外的 GPLv3](LICENSE.md)，具有单独许可声明的文件保留其许可。原生 SDK 与原厂恢复固件以二进制提供，适用单独条款。再分发时请保留适用的 [SDK 条款、第三方许可和贡献者声明](THIRD_PARTY.md)。
