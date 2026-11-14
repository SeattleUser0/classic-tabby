The CLIPS page: launch and stop clips from the pads, recall scenes, mute; reinstall to get it (Full backup first; storage does not move).

# Classic Tabby tabby-v04.7: clip launching

- Firmware package build ID: `0d191b58095bef25` (first 16 hex digits). App image 459044 bytes (measured), margin 60413 bytes
  below the 519457-byte limit (docs/FLASH-BUDGET.md 26). From tabby-v04.6 (`e9bc4788e8399d26`): +2144 bytes. Runtime heap
  161484 bytes (161548 before).
- Installing over tabby-v04.2 to tabby-v04.6 keeps storage as it is. Take a Full backup first anyway.
- Songs are not changed. Every song already on the device has clips: each different part of a track is one.

## What is new

- **The control map** (docs/CONTROL-MAP.md): what every button, pad, knob and fader does on the two pages a song is played
  from, with the stage actions and their press counts.
- **The CLIPS page.** BT opens it from any page; BT again goes back. The pads show the selected track's clips, 16 of up to
  64 at a time: off empty, dim white stopped, green playing, blinking green queued, blinking red a stop queued, bright the
  selected clip, orange when the track is muted. A pad launches its clip, or stops the playing one, on the next master
  cycle. A blinking pad pressed again takes that back. A pad held half a second selects its clip without launching it.
  SHIFT + pad 1 to 8 or K5 selects the track; OCT or K6 turns the bank; ENV sends the track back to the scenes.
- **Scene recall with lights.** On the SONG page the pads show the scenes (dim white, green the one playing, blinking the
  one queued) and recall them. The page says SCENE and CYCLE where it said ROW and BAR.
- **Mute.** SHIFT + pad 9 to 16 now also holds the track's song notes back on MIDI out; the clip runs on, so unmuting is in
  time. A track with no internal sound can be muted this way too.
- A clip that no scene uses can be launched; it loops with its own length.
- Remote commands for the unattended tests: read the page (pad states and colours), launch a clip by place, take a queue back.

## Changed behaviour to know about

- BT no longer shows BLUETOOTH: SET IN WORKBENCH.
- The old TRACK LAUNCH page showed one pad per row; the CLIPS page shows one pad per clip. A part that repeats over many
  rows is one pad now.
- Pressing a blinking (queued) pad takes the launch back. Before, it queued the same pattern again.
- A mute set on the MIX page, and the mute tracks 6 and 7 of a new project start with, silence the internal sound only, as
  before.

## Hardware validation

Installed on the SMK-37 Pro on 2026-11-14 through the published page (Full backup first; identity checked; one attempt;
"Firmware ready." after 10.5 s). All tests by remote command and remote panel keys, nobody at the panel (docs/BUILD.md 39.3):

- The CLIPS and SCENES pages: 37 of 37 checks. Every pad colour as in the control map; five launches at random moments,
  each on the next master cycle within 0.7 ms; five stops; a launch taken back; the long press; mute; ENV; a scene recall
  from its pad; BT there and back. No stuck note, no audio underrun.
- Three earlier songs again: every note-on sent (960, 1600 and 16), controller events in order.
- One line of 960 notes: band 1.67 ms on DIN, 2.00 ms on USB.
- Full backup and verify after: PASS (10 songs, 28 blocks).

## Known limits

- With the song stopped a pad only selects its clip; PLAY starts the song.
- No clip editing and no recording on the device yet.
- The step editor in the workbench cannot show a v3 clip.
