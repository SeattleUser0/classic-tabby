/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/* Classic Tabby Task 14 (2026-11-10): Help audit against tabby-v04.1: strings that named removed pages, modes or actions (step editing, REC, SEQ pages, the sampler, "Enable force flash and reconnect") rewritten or deleted, in both languages; new chapter 00 "What changed in tabby-v04"; tests/workbench/help-banned.mjs guards it. Second pass: factory-restore sectors (70-79 of 80), the TRS jack is output only (CLK IN DIN), demo-sample line. English only (SPEC 17.7): the Chinese text is replaced by English at the source, the translation table and the language selector are gone. */
/* Classic Tabby, Task 03 a: sample bank and DX7 user library removed from the simulator. */
/* Classic Tabby Task 13 Step 4 (2026-11-10): panel wording: knobs K1-K8 by their printed numbers (firmware SELECT = K5, PAGE = K6, PRESETS = K7, MASTER = K8); the firmware's SAVE button named by position (the 4th button in the left group, after SHIFT, FADER BANK, HOME); SPEC 17.4 has the table. The panel button the firmware calls SAVE is labelled BTN 4 here. */
(() => {
  'use strict';
  // One portable C instance owns the panel, project and sound state. Before
  // audio is enabled it runs on the page; its complete memory moves to the
  // audio thread at a C-call boundary, preserving edits and the current page.
  function coreRuntime() {
    const sameBytes=(a,b)=>{
      if(!a||a.length!==b.length)return false;
      for(let i=0;i<b.length;i++)if(a[i]!==b[i])return false;
      return true;
    };
    const label=bytes=>{
      let text='';for(const byte of bytes){if(!byte)break;text+=String.fromCharCode(byte);}return text;
    };
    return class FM1Core {
      constructor(wasm, flash, snapshot) {
        this.c = new WebAssembly.Instance(new WebAssembly.Module(wasm), {}).exports;
        const c = this.c; c._initialize();
        if (snapshot) {
          if (snapshot.byteLength % 65536 || snapshot.byteLength < c.memory.buffer.byteLength || snapshot.byteLength > 33554432) throw Error('Invalid simulator state');
          c.memory.grow((snapshot.byteLength - c.memory.buffer.byteLength) / 65536);
          new Uint8Array(c.memory.buffer).set(new Uint8Array(snapshot));
        } else {
          // Classic Tabby Task 11: the size comes from the wasm (sim_flash_size, the build's USER
          // size: 471040 normal since Task 12 A1, 536576 the old stock layout); a stored image of
          // another size is not loaded. Task 12 A1: the fallback for an older wasm is 471040.
          const size = c.sim_flash_size ? c.sim_flash_size() : 471040, saved = flash?.length === size;
          if (saved) new Uint8Array(c.memory.buffer,c.sim_flash(),size).set(flash);
          c.sim_boot(saved ? 0 : 1);
        }
        this.lastFrame = this.lastFlash = -1;
      }
      command(message) {
        const c = this.c; let result = 0, data;
        switch(message.type) {
          case 'smk37': c.sim_smk37(message.kind,message.index,message.value); break;
          case 'control': c.sim_control(message.kind,message.index,message.value); break;
          case 'release': c.sim_release(); break;
          case 'panic': c.sim_panic(); break;
          case 'tapTempo': c.sim_tap_tempo(); break;
          case 'select': result=c.sim_select(message.track,message.source); break;
          case 'open': result=c.sim_open(message.page); if(result)throw Error('The current engine does not support this editing page.'); break;
          case 'preset': result=c.sim_preset(message.index); break;
          case 'step': result=c.sim_step(message.index,message.toggle?1:0); break;
          case 'lcd': result=c.sim_lcd(message.context,message.action,message.index,message.owner,message.delta); break;
          case 'midi':
            if (!message.data || message.data.length>1024) throw Error('Invalid MIDI data');
            new Uint8Array(c.memory.buffer,c.sim_file(),message.data.length).set(message.data);
            result=c.sim_midi(message.data.length); break;
          case 'export':
            result=message.timbre?c.sim_timbre_export():message.patch?c.sim_patch_export():c.sim_export();
            if (!result) data=new Uint8Array(c.memory.buffer,c.sim_file(),message.timbre?223:message.patch?156:4264).slice();
            break;
          case 'snapshot':
            result=c.sim_export();
            if(!result)data={bytes:new Uint8Array(c.memory.buffer,c.sim_file(),4264).slice(),revision:this.projectRevision()};
            break;
          // Task 03 (f): the 'factory' / 'factories' requests are gone with the factory scenes.
          case 'import':
            if (!message.data || (message.timbre?message.data.length!==223:message.patch?message.data.length!==156:![4048,4064,4264].includes(message.data.length))) throw Error('Invalid file length');
            new Uint8Array(c.memory.buffer,c.sim_file(),message.data.length).set(message.data);
            result=message.timbre?c.sim_timbre_import():message.patch?c.sim_patch_import():c.sim_import(message.data.length); break;
          case 'clear': c.sim_clear(); break;
          // Classic Tabby song mode (Task 03 d): records and blocks in the simulator's flash.
          case 'song-read': {
            const song=message.song>>>0;result=c.sim_song_record_read(song);
            if(result===1){data=null;result=0;break;}
            if(!result){
              const record=new Uint8Array(c.memory.buffer,c.sim_file(),4096).slice(),ids=new Set(),blocks=[];
              for(let r=0;r<record[40];r++)for(let t=0;t<8;t++){const id=record[64+r*20+t*2]|record[65+r*20+t*2]<<8;if(id)ids.add(id);}
              for(const id of ids){const n=c.sim_block_read(song,id);if(n>0)blocks.push([id,new Uint8Array(c.memory.buffer,c.sim_file(),n).slice()]);}
              data={record,blocks};
            }
            break;
          }
          case 'song-write': {
            // Task 03 e (9.6 v0.5): the record first, then the blocks as kind-7 batches cut at the
            // device's packing boundaries (4076-byte record areas, 8 sectors per batch), as the
            // workbench does against a device.
            const song=message.song>>>0;
            // Task 03 (f): like Library.songWrite, an occupied slot is deleted first.
            const replaced=c.sim_song_record_read(song)===0;if(replaced)result=c.sim_song_record_delete(song);
            if(!result){new Uint8Array(c.memory.buffer,c.sim_file(),4096).set(message.record);result=c.sim_song_record_write(song);}
            data={replaced};
            const batches=[];let parts=[],total=0,fill=0,sectors=1;
            for(const [id,payload] of message.blocks){
              const size=6+payload.length+(4-(6+payload.length)%4)%4;
              if(fill+size>4076){if(sectors===8){batches.push([parts,total]);parts=[];total=0;sectors=0;}sectors++;fill=0;}
              const rec=new Uint8Array(size).fill(255);rec[0]=0;rec[1]=1;rec[2]=id&255;rec[3]=id>>8;rec[4]=payload.length&255;rec[5]=payload.length>>8;rec.set(payload,6);   // Task 05: payload format 1 (9.4 v0.7 byte 1)
              parts.push(rec);total+=size;fill+=size;
            }
            if(parts.length)batches.push([parts,total]);
            for(const [list,bytes] of batches){if(result)break;const buf=new Uint8Array(c.memory.buffer,c.sim_batch_buffer(),bytes);let at=0;for(const p of list){buf.set(p,at);at+=p.length;}result=c.sim_block_batch(song,bytes);}
            break;
          }
          case 'song-delete': result=c.sim_song_record_delete(message.song>>>0); break;
          case 'song-status': data={free:c.sim_song_free()>>>0,reclaimable:c.sim_song_reclaimable()>>>0,state:c.sim_song_status(0)>>>0,late:(c.sim_song_status(2)>>>16)&0xffff,events:c.sim_song_status(3)>>>0,
            // Task 06: the same per-track words the device's command 23 carries.
            tracks:Array.from({length:8},(_,t)=>{const w=c.sim_song_track_status(t)>>>0;return {state:w&3,queue:(w>>2)&3,waiting:!!(w&16),row:(w>>8)&255};})}; break;
          case 'tick': for(let i=0;i<Math.min(32,message.blocks>>>0);i++)c.sim_render();break;
          default: throw Error('Unknown simulator operation');
        }
        if(result)throw Error(result===-8?'Insufficient memory. The current project is unchanged':result===-10?'Song storage is full':'The current engine or parameter does not support this operation');
        return data;
      }
      projectRevision(){return this.c.sim_edit_revision()+':'+this.c.sim_project_revision();}
      frame(force=false) {
        const c=this.c,message={type:'frame',state:new Uint8Array(c.memory.buffer,c.sim_state(),225).slice()};
        const name=new Uint8Array(c.memory.buffer,c.sim_project_name(),12),position=c.sim_preset_position();
        const targets=c.sim_lcd_targets(),count=c.sim_lcd_count();
        const labels=new Uint8Array(c.memory.buffer,c.sim_knobs(),128);
        const bytes=new Uint8Array(c.memory.buffer,targets,count*64),words=new Int32Array(c.memory.buffer,targets,count*16);
        const first=c.sim_step_first(),context=c.sim_lcd_context(),mask=c.sim_lcd_mask();
        // Retain decoded labels until their C bytes or edit context changes.
        // Copies own their memory and remain valid across WASM memory growth.
        if(!this.screen||this.screen.first!==first||this.screen.context!==context||this.screen.mask!==mask||
            !sameBytes(this.labels,labels)||!sameBytes(this.targets,bytes)){
          this.labels=labels.slice();this.targets=bytes.slice();
          this.screen={first,context,mask,
            knobs:Array.from({length:4},(_,i)=>[0,1].map(field=>label(labels.subarray(i*32+field*16,i*32+field*16+16)))),
            targets:Array.from({length:count},(_,i)=>({
              rect:Array.from(words.subarray(i*16,i*16+4)),action:words[i*16+4],index:words[i*16+5],owner:words[i*16+6],
              label:label(bytes.subarray(i*64+32,i*64+48)),value:label(bytes.subarray(i*64+48,i*64+64))
            }))};
        }
        message.screen=this.screen;
        message.workspace={name:String.fromCharCode(...name).trim(),slot:position&255,dirty:!!c.sim_project_dirty(),revision:this.projectRevision()};
        message.countIn=c.sim_count_in();
        message.hardware=c.sim_smk37_state();
        message.session=Array.from({length:8},(_,i)=>c.sim_smk37_session(i));
        message.padNotes=c.sim_smk37_pad_notes();
        message.instruments=c.sim_smk37_instruments();
        const padBytes=new Uint8Array(c.memory.buffer,c.sim_smk37_pad_labels(),128);
        if(!sameBytes(this.padLabelBytes,padBytes)){
          this.padLabelBytes=padBytes.slice();
          this.padLabels=Array.from({length:16},(_,i)=>label(padBytes.subarray(i*8,i*8+8)));
        }
        message.padLabels=this.padLabels;
        const revision=c.sim_frame_revision();
        if(force||revision!==this.lastFrame){
          const changed=c.sim_frame_changes(),bands=force||this.lastFrame<0?32767:changed;
          const source=new Uint16Array(c.memory.buffer,c.sim_pixels(),57600);
          if(bands===32767)message.pixels=source.slice();
          else {
            let count=0;for(let bits=bands;bits;bits&=bits-1)count++;
            message.pixels=new Uint16Array(count*3840);
            for(let band=0,at=0;band<15;){
              if(!(bands&(1<<band))){band++;continue;}
              const first=band;while(band<15&&(bands&(1<<band)))band++;
              const run=source.subarray(first*3840,band*3840);message.pixels.set(run,at);at+=run.length;
            }
          }
          message.pixelBands=bands;this.lastFrame=revision;
        }
        const flash=c.sim_flash_revision();
        if(flash!==this.lastFlash){message.flash=new Uint8Array(c.memory.buffer,c.sim_flash(),c.sim_flash_size?c.sim_flash_size():471040).slice();this.lastFlash=flash;}   // Task 11
        return message;
      }
    };
  }
  function audioThread(createCore) {
    const Core=createCore();
    class FM1Processor extends AudioWorkletProcessor {
      constructor(options) {
        super(); const config=options.processorOptions;
        this.core=new Core(config.wasm,config.flash,config.snapshot);this.c=this.core.c;
        this.blockFrames=this.c.sim_block_frames();this.position=this.blockFrames;this.fraction=0;this.ratio=44100/sampleRate;this.count=0;
        this.a=new Float32Array(2);this.b=new Float32Array(2);this.resetAudio();
        this.port.onmessage=e=>this.command(e.data);this.publish(true);this.port.postMessage({type:'ready'});
      }
      render() {
        this.audioAt=this.c.sim_render();this.position=0;
        // Rebind only after memory grows. The C output block has a fixed address.
        if(!this.buffer||this.buffer.buffer!==this.c.memory.buffer)
          this.buffer=new Float32Array(this.c.memory.buffer,this.audioAt,this.blockFrames*2);
      }
      next(target) {
        if(this.position===this.blockFrames)this.render();
        const at=this.position++*2;target[0]=this.buffer[at];target[1]=this.buffer[at+1];
      }
      resetAudio(){this.position=this.blockFrames;this.fraction=0;this.next(this.a);this.next(this.b);}
      command(message) {
        try {
          const data=this.core.command(message);
          if(['panic','import','clear'].includes(message.type))this.resetAudio();
          if(message.id)this.port.postMessage({id:message.id,data},ArrayBuffer.isView(data)?[data.buffer]:[]);
          this.publish();
        }catch(error){this.port.postMessage({id:message.id,error:error.message});}
      }
      publish(force=false){const message=this.core.frame(force);this.port.postMessage(message,Object.values(message).filter(v=>ArrayBuffer.isView(v)).map(v=>v.buffer));}
      process(inputs,outputs) {
        const out=outputs[0];if(!out?.[0])return true;
        const left=out[0],right=out[1],length=left.length;
        if(this.buffer.buffer!==this.c.memory.buffer)
          this.buffer=new Float32Array(this.c.memory.buffer,this.audioAt,this.blockFrames*2);
        if(this.ratio===1&&length>=2) {
          // Keep the same two-sample lookahead and C render boundaries as the
          // resampler, while copying whole runs at the native 44.1 kHz rate.
          left[0]=this.a[0];left[1]=this.b[0];
          if(right){right[0]=this.a[1];right[1]=this.b[1];}
          for(let i=2;i<length;) {
            if(this.position===this.blockFrames)this.render();
            const count=Math.min(this.blockFrames-this.position,length-i),start=this.position*2;
            if(right)for(let j=0;j<count;j++){left[i+j]=this.buffer[start+j*2];right[i+j]=this.buffer[start+j*2+1];}
            else for(let j=0;j<count;j++)left[i+j]=this.buffer[start+j*2];
            this.position+=count;i+=count;
          }
          this.next(this.a);this.next(this.b);
        } else for(let i=0;i<length;i++) {
          left[i]=this.a[0]+(this.b[0]-this.a[0])*this.fraction;
          if(right)right[i]=this.a[1]+(this.b[1]-this.a[1])*this.fraction;
          this.fraction+=this.ratio;
          while(this.fraction>=1){this.fraction--;const spare=this.a;this.a=this.b;this.b=spare;this.next(this.b);}
        }
        this.count+=length;if(this.count>=sampleRate/20){this.count%=sampleRate/20;this.publish();}return true;
      }
    }
    registerProcessor('fm1-engine',FM1Processor);
  }
  globalThis.FM1SimulatorCore=coreRuntime();
  globalThis.FM1SimulatorAudioSource='('+audioThread.toString()+')('+coreRuntime.toString()+');';

  if (typeof document === 'undefined') return;
  const $ = id=>document.getElementById(id), sources=['DX7','303','808','PSG','PLUCK','SAMPLER'];
  const storageKey='fm1.simulator.flash.v4',pending=new Map();
  let context,node,gain,analyser,meterData,state,workspace,hardwareState,padSignature,preview,wasm,ready=false,starting=false,audioOn=false,handoff=false,sequence=0,selectedFile,fileRevision=0,voices=[],midiInput,midiAccess,midiConnecting=false,presetBusy=false,libraryBusy=false;
  const waiting=[],wakingKeys=new Map();let startTask,wakingPlay,muted=false,sourceShortcut=false,bootError='';
  let padNoteMask=0,instrumentState;
  const say=text=>{FM1I18n.text($('sim-status'),text);};
  const image=$('sim-screen').getContext('2d'),pixels=image.createImageData(240,240);
  const rgb5=new Uint8ClampedArray(32),rgb6=new Uint8ClampedArray(64);
  for(let i=0;i<32;i++)rgb5[i]=i*255/31;
  for(let i=0;i<64;i++)rgb6[i]=i*255/63;
  for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=255;
  function encode(bytes){let text='';for(let i=0;i<bytes.length;i+=16384)text+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(text);}
  function decode(text){return Uint8Array.from(atob(text),c=>c.charCodeAt(0));}
  function save(bytes,name){const url=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function availability() {
    for(const element of ui.controls)element.disabled=!ready;
    $('sim-start').disabled=starting||!ready;
    $('sim-play-control').disabled=starting||!ready;
    $('sim-midi').disabled=!ready||midiConnecting||!navigator.requestMIDIAccess;
    FM1I18n.text($('sim-start'),starting?'Enabling sound…':muted?'Unmute':'Mute');
    $('sim-start').setAttribute('aria-pressed',String(muted));
    $('sim-patch-export').disabled=!ready||!state||state[8+state[0]*20]!==0;
    $('sim-file-apply').disabled=!ready||!selectedFile||(selectedFile.patch&&(!state||state[8+state[0]*20]!==0));
    $('sim-placeholder').hidden=ready;
    FM1I18n.text($('sim-engine-state'),ready?'Panel ready':bootError?'Loading failed':'Loading');
    if(bootError)FM1I18n.text($('sim-current-project'),'Loading failed');
    FM1I18n.text($('sim-audio-state'),audioOn?'Sound enabled':muted?'Silent editing':'Ready to play');
    $('sim-engine-state').hidden=ready;$('sim-audio-state').hidden=!ready;
    // Task 03 (f): prev / next step through the USER project slots of the simulated flash.
    for(const id of ['sim-preset-prev','sim-preset-next'])$(id).disabled=!ready||presetBusy;
    $('sim-preset-prev').disabled||=(workspace?.slot??0)===0;
    $('sim-preset-next').disabled||=(workspace?.slot??0)===15;
    for(const id of ['sim-save-device','sim-read-device'])$(id).disabled=!ready||syncDevice.busy||!navigator.requestMIDIAccess;
  }
  let syncDevice={mode:'offline',epoch:0,busy:false},deviceSnapshot,deviceSnapshotKind;
  let comparedRevision,comparisonMatches=false,syncTimer,syncChecking=false,syncGeneration=0,syncText='';
  function clearDeviceSnapshot(){
    deviceSnapshot=undefined;comparedRevision=undefined;comparisonMatches=false;++syncGeneration;
    clearTimeout(syncTimer);syncTimer=undefined;renderSync();
  }
  function rememberDeviceSnapshot(bytes,kind){
    deviceSnapshot=FM1Web.tunedProject(bytes).slice();deviceSnapshotKind=kind;
    comparedRevision=undefined;comparisonMatches=false;++syncGeneration;renderSync();
  }
  async function compareDeviceSnapshot(){
    syncTimer=undefined;if(syncChecking||!deviceSnapshot||!ready)return;
    syncChecking=true;const generation=syncGeneration,expected=deviceSnapshot;
    try{
      const snapshot=await request('snapshot');
      if(generation!==syncGeneration)return;
      comparedRevision=snapshot.revision;
      comparisonMatches=snapshot.bytes.length===expected.length&&snapshot.bytes.every((v,i)=>v===expected[i]);
    }catch(_){comparisonMatches=false;}
    finally{syncChecking=false;renderSync();}
  }
  function renderSync(){
    let title='Browser preview · no device',detail='',style='preview';
    if(syncDevice.mode==='update')title='Device connected for update · separate browser preview';
    if(syncDevice.mode==='library'){
      const changed=deviceSnapshot&&(!comparisonMatches||comparedRevision!==workspace?.revision);
      title=!deviceSnapshot?'Device connected · read a project to edit':changed?'Browser edits not saved to device':deviceSnapshotKind==='save'?'Saved to device · verified':'Device project loaded';
      style=!deviceSnapshot?'preview':changed?'pending':'verified';
      detail='Save browser edits manually. Read again after changes on the device.';
      if(deviceSnapshot&&ready&&comparedRevision!==workspace?.revision&&!syncTimer&&!syncChecking)
        syncTimer=setTimeout(compareDeviceSnapshot,120);
    }
    if(syncDevice.connection){
      title=syncDevice.connection.failed?'Device connection failed':'Connecting to device…';
      detail=syncDevice.connection.message;style='pending';
    }
    const text=title+'|'+detail+'|'+style;
    if(text===syncText)return;syncText=text;
    $('device-sync-status').dataset.state=style;
    FM1I18n.text($('device-sync-title'),title);FM1I18n.text($('device-sync-detail'),detail);
  }
  document.addEventListener('fm1-device-state',event=>{
    const changed=event.detail.epoch!==syncDevice.epoch;syncDevice=event.detail;
    if(changed)clearDeviceSnapshot();else renderSync();availability();
  });
  document.addEventListener('fm1-device-project-change',clearDeviceSnapshot);
  document.addEventListener('fm1-device-project-saved',event=>rememberDeviceSnapshot(event.detail.bytes,'save'));
  function dispatch(message) {
    if(handoff){waiting.push(message);return;}
    if(node){node.port.postMessage(message);return;}
    if(!preview)return;
    try {const data=preview.command(message);if(message.id)receive({id:message.id,data});receive(preview.frame());}
    catch(error){receive({id:message.id,error:error.message});}
  }
  function send(type,args={}){if(ready)dispatch({type,...args});}
  function request(type,args={}) {
    if(!ready)return Promise.reject(Error('The simulator is not loaded yet'));
    // These operations release/reset the C controls. Clear their page-side
    // owners too, so a stale latch cannot suppress the next press.
    if(['import','clear'].includes(type))release();
    if(['open','select','step'].includes(type)){
      wakingPlay=undefined;
      for(const key of wakingKeys.keys())
        if(type==='select'||!String(key).startsWith('11:'))wakingKeys.delete(key);
    }
    // Presets retain already sounding Play keys, but must cancel gestures
    // still waiting for audio permission on the previous project.
    if(type==='preset'){wakingPlay=undefined;wakingKeys.clear();}
    const id=++sequence;return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{pending.delete(id);reject(Error('Simulator operation timed out'));},7000);
      pending.set(id,{resolve,reject,timer});dispatch({type,id,...args});
    });
  }
  async function select(track,source) {
    try {await request('select',{track,source});}
    catch(error){
      // Failed allocation leaves the C project unchanged. Restore the visible
      // selection too; an unchanged frame will not rewrite these controls.
      if(state){$('sim-track').value=state[0];$('sim-source').value=state[8+state[0]*20];}
      throw error;
    }
  }

  function receive(message) {
    if(message.id){const item=pending.get(message.id);if(item){clearTimeout(item.timer);pending.delete(message.id);message.error?item.reject(Error(message.error)):item.resolve(message.data);}return;}
    if(message.error){say(message.error);return;}
    if(message.type!=='frame')return;
    const before=state,oldInstrument=instrumentState;state=message.state;
    instrumentState=message.instruments;
    // Once a Pad becomes an editor, its old audition is cancelled even if
    // the player switches back before audio is ready. Other controls keep
    // their pending gestures; a new Pad press can edit immediately.
    const editingPads=padNoteMask&~message.padNotes;
    if(editingPads)for(let i=0;i<16;++i)if(editingPads&(1<<i))wakingKeys.delete('13:'+i);
    padNoteMask=message.padNotes;
    // A gesture made before REC changes must not become a recorded note (or
    // escape a stopped take) when audio starts. Octave changes cancel it too.
    if(before&&before[4]!==state[4])wakingKeys.clear();
    else if(before&&oldInstrument!==undefined&&instrumentState!==undefined){
      const changed=oldInstrument^instrumentState;
      for(const [kind,shift,mask,count]of [[11,0,0x1c3c7,37],[13,3,0xe3c38,16]]){
        const owner=instrumentState>>>shift&7;
        if((changed&mask)||before[8+owner*20]!==state[8+owner*20])
          for(let i=0;i<count;i++)wakingKeys.delete(kind+':'+i);
      }
    }else if(before&&before[7]!==state[7])wakingKeys.clear();
    const contextChanged=!before||before[1]!==state[1]||before[0]!==state[0]||before[8+before[0]*20]!==state[8+state[0]*20];
    const fm=state[8+state[0]*20]===0;
    if(before&&contextChanged){
      wakingPlay=undefined;
      if(instrumentState===undefined)wakingKeys.clear();
      else for(const key of wakingKeys.keys())if(typeof key==='number')wakingKeys.delete(key);
      const pageTips={
        0:'HOME: K5 chooses a track, K1 sets level and K4 tempo; K7 changes projects; K6 / K2 changes engines.',
        1:'SYNC / MIDI: K1 CLOCK, K2 CLK IN, K3 SWING, K4 SEQ OUT, K7 KEY OUT; SHIFT + SEQ opens MIDI TRACK, SEQ + EDIT opens ACTIONS.',
        6:'Mixer: pads 1–8 mute, 9–16 solo; mute / solo are exclusive per track. K5 chooses a track; K1–K4 adjust the four-track group.',
        8:'Save project: K5 / K7 chooses a USER slot; the 4th button in the left group (after SHIFT, FADER BANK, HOME) writes it. Replacing another occupied slot requires confirmation. The panel returns after saving.',
        10:'Effects: K6 switches TRACK / SHARED / DELAY, K5 chooses a track, and K1–K4 edit the displayed parameters. Tap SEQ or TAP on DELAY; K7 also changes pages.',
        11:'Sound source: choose with Pads 1–6 or K1, the 4th button in the left group (after SHIFT, FADER BANK, HOME) to apply, HOME to return. K2 TRACK immediately selects PROJECT (follow projects), LIVE (keep sound across project changes), or OFF (disable the instrument).',
        12:'ACTIONS: K1 or K5 chooses the entry, the 4th button in the left group (after SHIFT, FADER BANK, HOME) runs it, HOME cancels; SONG MODE opens the SONG page.',
        15:'FM quick parameters: K7 chooses voice 1-128, K6 switches bank A-D; K1 algorithm, K2 feedback, K3 transpose, K4 level. EDIT returns; use the web workbench for full voice editing.',
        19:'Song mode: K5 / K7 select the song, PLAY starts and stops, pads 1-16 queue a jump to that row, OCT pages the pads, K4 sets where jumps land. Songs are written from the web workbench.',
        17:'ARP: tap to toggle, hold for settings. K6 changes pages: rate / direction / range / gate, then Swing / Hold. K5 chooses a track. Enable and settings are saved with the project; held notes are not.',
        16:'Preset list: K7 / K5 loads immediately, PLAY loads and plays, the 4th button in the left group (after SHIFT, FADER BANK, HOME) opens project saving. K1 chooses USER / FACTORY. Preset changes are immediate, with no save prompt.'
      };
      if(pageTips[state[1]])say(pageTips[state[1]]);
    }
    if(contextChanged){
      for(const button of document.querySelectorAll('[data-sim-page]'))button.setAttribute('aria-pressed',String(Number(button.dataset.simPage)===state[1]||(Number(button.dataset.simPage)===15&&state[1]===5)));
      const presetUse={0:'change the whole preset',1:'toggle KEY OUT',8:'choose a save slot',10:'switch track sends / shared settings',12:'choose an action',15:'change the track sound',16:'choose a whole preset',17:'unused on this page'};
      FM1I18n.text($('sim-context'),'Panel K7 knob: '+(presetUse[state[1]]||'follow the labels below the screen')+'.');
    }
    updateScreenControls(message.screen,contextChanged);
    if(message.pixels)for(let band=0,source=0;band<15;){
      if(!(message.pixelBands&(1<<band))){band++;continue;}
      const first=band;while(band<15&&(message.pixelBands&(1<<band)))band++;
      for(let i=first*3840;i<band*3840;i++){
        const value=message.pixels[source++],at=i*4;
        pixels.data[at]=rgb5[value>>11];pixels.data[at+1]=rgb6[(value>>5)&63];pixels.data[at+2]=rgb5[value&31];
      }
      image.putImageData(pixels,0,0,0,first*16,240,(band-first)*16);
    }
    const selectionChanged=!before||before[0]!==state[0]||before[8+state[0]*20]!==state[8+state[0]*20];
    const oldWorkspace=workspace;
    if(message.workspace){
      workspace=message.workspace;
      if(!oldWorkspace||workspace.name!==oldWorkspace.name)$('sim-current-project').textContent=workspace.name||'UNTITLED';
      if(!oldWorkspace||workspace.dirty!==oldWorkspace.dirty)FM1I18n.text($('sim-project-note'),workspace.dirty?'Workspace has changes':'Workspace unchanged');
      renderSync();
    }
    /* Task 14: the device has no recording (v0.4); this line only reports the external-clock wait. */
    const waitClock=!!(state[16]&&state[17]!==1);
    const recording=waitClock?'Waiting for external MIDI clock. Choose INT on the SYNC / MIDI page (press SEQ) to use internal tempo.':'';
    const hideRecording=!waitClock;
    if($('sim-record-state').hidden!==hideRecording)$('sim-record-state').hidden=hideRecording;
    if($('sim-record-state').dataset.message!==recording){$('sim-record-state').dataset.message=recording;FM1I18n.text($('sim-record-state'),recording);}
    if(!before||before[14]!==state[14]){
      FM1I18n.text($('sim-play-control'),state[14]?'Pause':'Play');
      $('sim-play-control').setAttribute('aria-pressed',String(!!state[14]));
    }
    if(selectionChanged){$('sim-track').value=state[0];$('sim-source').value=state[8+state[0]*20];}
    for(let t=0;t<8;t++){
      const at=8+t*20,{button,source,level,dots}=ui.tracks[t];
      if(!before||before[0]!==state[0])button.classList.toggle('selected',state[0]===t);
      if(!before||before[at]!==state[at])FM1I18n.text(source,sources[state[at]]);
      if(!before||before[at+3]!==state[at+3])level.style.setProperty('--level',(state[at+3]/127*100)+'%');
      for(let byte=0;byte<8;byte++){
        const mask=at+12+byte,changed=before?before[mask]^state[mask]:255;
        if(changed)for(let bit=0;bit<8;bit++)if(changed&(1<<bit))dots[byte*8+bit].classList.toggle('on',!!(state[mask]&(1<<bit)));
      }
      if(!before||before[209+t]!==state[209+t])
        for(let i=0;i<64;i++)dots[i].classList.toggle('outside',i>=state[209+t]);
      if(!before||before[at+6]!==state[at+6]||before[at+7]!==state[at+7]){
        if(before&&before[at+6]&&before[at+7]<64)dots[before[at+7]].classList.remove('play');
        if(state[at+6]&&state[at+7]<64)dots[state[at+7]].classList.add('play');
      }
      if(!before||before[at+4]!==state[at+4]||before[at+5]!==state[at+5]||before[209+t]!==state[209+t]||before[217+t]!==state[217+t])FM1I18n.attr(button,'title','Track '+(t+1)+' · '+state[209+t]+' steps'+(state[217+t]!==state[209+t]?' · next loop: '+state[217+t]+' steps':'')+(state[at+4]?' · muted':'')+(state[at+5]?' · solo':''));
    }
    for(const [button,at]of ui.leds)if(!before||before[at]!==state[at])button.classList.toggle('lit',!!state[at]);
    if(message.session){
      for(let t=0;t<8;t++){
        const value=message.session[t],role=['PROJECT','LIVE','OFF'][value&255],channel=(value>>>8)+1;
        const option=$('sim-track').options[t],label='T'+(t+1)+' · '+role+' · IN '+channel;
        if(option.textContent!==label)option.textContent=label;
      }
    }
    const shift=!!(message.hardware&8);
    let padFlags=shift?1+(state[0]<<1):0;
    if(shift)for(let t=0;t<8;t++){
      if(state[8+t*20+4])padFlags|=1<<(t+4);
      if((message.session?.[t]&255)===2)padFlags|=1<<(t+12);
    }
    const instrument=message.instruments,stepPads=!!(message.hardware&2),padFocus=!!(instrument&(1<<20));
    const stepLabels=stepPads&&state[1]===1;
    const padChannel=(instrument>>>10&15)+1,firstStep=message.screen?.firstStep||0;
    const nextPadSignature=[padFlags,instrument&0x1fffff,stepPads,stepLabels,padNoteMask,firstStep,
      message.padLabels?.join(',')].join(':');
    if(nextPadSignature!==padSignature)for(const button of ui.pads){
      const pad=Number(button.dataset.pad),target=pad&7;
      const playable=!!(padNoteMask&(1<<pad));
      const label=shift?(pad<8?'T':'M')+(target+1):stepLabels?'S'+(firstStep+pad+1):
        playable?message.padLabels[pad]:String(pad+1).padStart(2,'0');
      if(button.textContent!==label)button.textContent=label;
      button.classList.toggle('select-track',shift&&pad<8&&target===state[0]);
      button.classList.toggle('muted-track',shift&&pad>=8&&!!state[8+target*20+4]);
      const off=shift&&pad>=8&&(message.session?.[target]&255)===2;
      button.classList.toggle('off-track',off);
      button.classList.toggle('note-root',!shift&&playable&&/^C\d/.test(label));
      const title=shift?FM1I18n.t(pad<8?'Select track':off?'Track is off':'Mute track')+' '+(target+1):
        'Pad '+(pad+1)+(playable?' · '+label+' · CH '+padChannel:stepLabels?' · Step '+(firstStep+pad+1):'');
      if(button.getAttribute('aria-label')!==title){button.setAttribute('aria-label',title);button.title=title;}
    }
    if(nextPadSignature!==padSignature)ui.padMode.classList.toggle('lit',stepPads||padFocus);
    padSignature=nextPadSignature;
    const keySource=state[8+(instrument&7)*20],sampleKeys=[0,2,4,5,7,9,11,12];
    if(oldInstrument===undefined||((oldInstrument^instrument)&0x1c3c7)||!before||before[8+(oldInstrument&7)*20]!==keySource){
      const base=48+12*((instrument>>>14&7)-2),channel=(instrument>>>6&15)+1;
      for(let i=0;i<37;i++){
        const key=ui.holds.get('11:'+i);
        const slot=keySource===5?sampleKeys.indexOf(i):-1;
        key.classList.toggle('sample-key',slot>=0);key.classList.toggle('sample-inactive',keySource===5&&slot<0);
        key.setAttribute('aria-label',(keySource===5?(slot>=0?'Sample slot '+(slot+1):'No sample assigned'):'MIDI note '+(base+i))+' · CH '+channel);
        key.querySelector('span').textContent=keySource===5?(slot>=0?String(slot+1):''):i%12===0?'C'+((base+i)/12-1):'';
      }
    }
    const routeText='KEY T'+((instrument&7)+1)+' · CH '+((instrument>>>6&15)+1)+
      '  |  PAD T'+((instrument>>>3&7)+1)+' · CH '+padChannel+'  |  AT '+(instrument>>>21&127)+
      '  |  '+(stepPads?'STEP':padFocus?'PAD EDIT':'KEY EDIT');
    if($('sim-instruments').textContent!==routeText)$('sim-instruments').textContent=routeText;
    if(message.hardware!==undefined&&message.hardware!==hardwareState){
      hardwareState=message.hardware;
      const bank=message.hardware&1,pickup=message.hardware>>>8;
      ui.faderBank.classList.toggle('lit',!!bank);
      ui.faderLabels.forEach((label,i)=>{
        const text='T'+(bank*4+i+1)+((pickup&(1<<i))?' ↕':'');
        if(label.textContent!==text)label.textContent=text;
      });
      if(message.hardware&4){
        const value=Math.round((message.hardware>>>16)*100/1023);
        $('sim-volume').value=value;
        $('sim-master').style.setProperty('--angle',(-135+value*2.7)+'deg');
        $('sim-master').setAttribute('aria-valuenow',String(value));
      }
    }
    if(message.flash){try{localStorage.setItem(storageKey,encode(message.flash));$('sim-storage-warning').hidden=true;}catch(_){$('sim-storage-warning').hidden=false;}}
    if(selectionChanged||!oldWorkspace||workspace?.slot!==oldWorkspace.slot)availability();
  }
  let lcdKey='',lcdScreen,lcdEditing,lcdItems=new Map(),lcdReturnFocus;
  const lcdDialog=$('sim-lcd-dialog');
  const lcdId=item=>[item.action,item.index,item.owner].join(':');
  function lcdAdjust(item,delta){
    if(!item||!ready)return;
    send('lcd',{context:lcdScreen.context,action:item.action,index:item.index,owner:item.owner,delta});
  }
  // Trackpads report many small pixel deltas; wheel notches report large deltas.
  // Keep one fine step per notch, accumulate small movements, and leave browser
  // zoom (Ctrl/Meta + wheel) untouched.
  function lcdWheel(button,getItem){
    let amount=0,last=0,direction=0,context;
    const reset=()=>{amount=last=direction=0;};
    button.addEventListener('pointerleave',reset);
    button.addEventListener('wheel',event=>{
      const item=getItem();
      if(button.disabled||!item||!event.deltaY||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
      event.preventDefault();event.stopPropagation();
      const now=performance.now(),sign=Math.sign(event.deltaY);
      const nextContext=lcdScreen.context+':'+lcdId(item);
      if(nextContext!==context){reset();context=nextContext;}
      if(sign!==direction||now-last>250){amount=0;direction=sign;}
      last=now;amount+=Math.abs(event.deltaY);
      if(event.deltaMode||amount>=40){amount=0;lcdAdjust(item,-sign);}
    },{passive:false});
  }
  function lcdValue(){
    const item=lcdItems.get(lcdEditing);
    if(!item)return;
    if($('sim-lcd-label').textContent!==item.label)$('sim-lcd-label').textContent=item.label;
    if($('sim-lcd-value').textContent!==item.value)$('sim-lcd-value').textContent=item.value;
  }
  function editLcd(id,button){
    release();lcdEditing=id;lcdReturnFocus=button;lcdValue();lcdDialog.showModal();$('sim-lcd-plus').focus();
  }
  function closeLcd(){lcdDialog.close();if(lcdReturnFocus?.isConnected)lcdReturnFocus.focus();}
  $('sim-lcd-close').onclick=closeLcd;
  lcdDialog.addEventListener('cancel',event=>{event.preventDefault();closeLcd();});
  $('sim-lcd-minus').onclick=()=>lcdAdjust(lcdItems.get(lcdEditing),-1);
  $('sim-lcd-plus').onclick=()=>lcdAdjust(lcdItems.get(lcdEditing),1);
  lcdWheel($('sim-lcd-value'),()=>lcdDialog.open&&lcdItems.get(lcdEditing));
  lcdDialog.addEventListener('keydown',event=>{
    if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'].includes(event.code)){
      event.preventDefault();event.stopPropagation();lcdAdjust(lcdItems.get(lcdEditing),['ArrowLeft','ArrowDown'].includes(event.code)?-1:1);
    }
  });
  function updateScreenControls(screen,contextChanged){
    if(!screen)return;
    const changed=contextChanged||lcdScreen?.context!==screen.context;
    lcdScreen=screen;
    if(changed&&lcdDialog.open)closeLcd();
    const items=screen.targets.slice();
    for(let col=0;col<4;col++)if(screen.mask&(1<<col)){
      const [label,value]=screen.knobs[col];
      items.push({rect:[6+59*col,195,54,32],action:0,index:col,owner:state[0],label,value,knob:col});
    }
    lcdItems=new Map(items.map(item=>[lcdId(item),item]));
    if(lcdDialog.open){if(lcdItems.has(lcdEditing))lcdValue();else closeLcd();}
    const lengths=state[1]===0?state.subarray(209,217).join(','):state[209+state[0]];
    const key=screen.context+':'+screen.first+':'+lengths+':'+items.map(item=>[lcdId(item),...item.rect].join(',')).join(';');
    const host=$('sim-lcd-targets');
    if(key!==lcdKey){
      lcdKey=key;host.replaceChildren();
      const target=(x,y,w,h,label,fn)=>{
        const button=document.createElement('button');button.className='lcd-target';
        Object.assign(button.style,{left:x/2.4+'%',top:y/2.4+'%',width:w/2.4+'%',height:h/2.4+'%'});
        FM1I18n.attr(button,'aria-label',label);FM1I18n.attr(button,'title',label);
        button.onclick=()=>action(fn);host.append(button);return button;
      };
      // Task 12 A2: the overview's step cells and page 1's step grid left with the step editor;
      // page 1 is SYNC / MIDI now. Only the track rows of the overview stay clickable.
      if(state[1]===0){
        for(let t=0;t<8;t++)target(5,48+t*18,72,16,'Track '+(t+1),()=>select(t,6));
      }
      for(const item of items){
        const id=lcdId(item),button=target(...item.rect,item.label,()=>editLcd(id,button));
        button.dataset.lcdEdit=id;
        if(item.knob!==undefined)button.dataset.lcdKnob=item.knob;
        lcdWheel(button,()=>lcdItems.get(id));
        button.addEventListener('keydown',event=>{
          const delta={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1}[event.code];
          if(delta){event.preventDefault();event.stopPropagation();lcdAdjust(lcdItems.get(id),delta);}
        });
      }
    }
    for(const cell of host.querySelectorAll('[data-lcd-step]'))cell.tabIndex=Number(cell.dataset.lcdStep)===state[2]?0:-1;
    for(const button of host.querySelectorAll('[data-lcd-edit]')){
      const item=lcdItems.get(button.dataset.lcdEdit);
      button.disabled=!ready||!item;
      const description=(button.dataset.lcdKnob!==undefined?'K'+(Number(button.dataset.lcdKnob)+1)+' / ':'')+item.label+' / '+item.value;
      if(button.getAttribute('aria-label')!==description){button.setAttribute('aria-label',description);button.title=description;}
    }
  }
  function deadline(promise,milliseconds,message) {
    return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(message)),milliseconds);Promise.resolve(promise).then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});
  }
  function setVolume(value) {
    value=Math.max(0,Math.min(100,value));$('sim-volume').value=value;
    const master=$('sim-master');if(master){master.style.setProperty('--angle',(-135+value*2.7)+'deg');master.setAttribute('aria-valuenow',String(value));}
    if(ready)control(3,0,Math.round(value*1023/100));
    if(gain)gain.gain.setTargetAtTime(audioOn?1:0,context.currentTime,.01);
  }
  async function boot() {
    try {
      if(!globalThis.WebAssembly||!globalThis.crypto?.subtle)throw Error('This preview cannot run the simulator. Save the HTML and open it in desktop Chrome or Edge.');
      wasm=await FM1Web.assetBytes(FM1_SIMULATOR,2097152,'Simulator verification failed. Download the complete workbench again.');
      let flash;try{const saved=localStorage.getItem(storageKey);if(saved)flash=decode(saved);}catch(_){}
      preview=new globalThis.FM1SimulatorCore(wasm,flash);
      ready=true;receive(preview.frame(true));availability();setVolume(Number($('sim-volume').value));
      availability();
      say('Ready. Press a key or Play to listen.');globalThis.SMK37Boot?.ready();
      const blockFrames=preview.c.sim_block_frames();
      let last=performance.now(),frames=0;
      setInterval(()=>{
        updateMeter();
        const now=performance.now();frames+=Math.min(40,now-last)*44.1;last=now;
        const blocks=Math.floor(frames/blockFrames);frames%=blockFrames;
        if(!ready||handoff)return;
        if(preview){preview.command({type:'tick',blocks});receive(preview.frame());}
        else if(context?.state!=='running')send('tick',{blocks});
      },20);
    }catch(error){
      const blocked=/WebAssembly|wasm/i.test(error.message)&&/content security policy|unsafe-eval|wasm-unsafe-eval/i.test(error.message);
      bootError=blocked?'This preview\'s security policy blocks the audio engine. Leave the attachment preview and open the workbench URL directly in desktop Chrome or Edge, or download the complete HTML and open it on your computer.':error.message;
      ready=false;globalThis.SMK37Boot?.fail(FM1I18n.t(bootError));availability();say(bootError);
      for(const id of ['sim-placeholder','boot-error-detail'])FM1I18n.text($(id),bootError);
      $('boot-reload').hidden=blocked;
    }
  }
  let meterLevel=-1;
  function updateMeter() {
    let peak=0;
    if(analyser&&audioOn&&context?.state==='running'){
      analyser.getFloatTimeDomainData(meterData);
      for(const value of meterData)peak=Math.max(peak,Math.abs(value));
    }
    const level=Math.min(100,Math.round(peak*100));
    if(level===meterLevel)return;meterLevel=level;
    $('sim-output-meter').value=level;
    $('sim-output-meter').setAttribute('aria-valuetext',level+'%');
  }
  function start(requested) {
    if(!startTask)startTask=startAudio(requested).finally(()=>{startTask=undefined;});
    return startTask;
  }
  async function startAudio(requested) {
    if(starting||!ready)return;
    const target=typeof requested==='boolean'?requested:!audioOn;
    if(!target&&!node){audioOn=false;availability();return;}
    starting=true;availability();let candidate;
    try {
      if(node) {
        if(target&&context.state!=='running')await deadline(context.resume(),2500,'The browser did not enable audio. Editing is still available.');
        audioOn=target;setVolume(Number($('sim-volume').value));
        say(audioOn?'Sound enabled. Adjust the Monitor volume slider.':'Sound disabled. The panel and editor continue running.');return;
      }
      if(!globalThis.AudioContext||!globalThis.AudioWorkletNode)throw Error('Audio worklets are unavailable. Use desktop Chrome or Edge; the panel can still be edited.');
      context=new AudioContext({sampleRate:44100,latencyHint:'interactive'});
      await deadline(context.resume(),2500,'Audio playback was not allowed. The panel can still be edited.');
      await deadline(context.audioWorklet.addModule('data:text/javascript;charset=utf-8,'+encodeURIComponent(globalThis.FM1SimulatorAudioSource)),3500,'Audio module loading timed out. The panel can still be edited.');
      handoff=true;
      candidate=new AudioWorkletNode(context,'fm1-engine',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{wasm,snapshot:preview.c.memory.buffer.slice(0)}});
      gain=context.createGain();gain.gain.value=0;
      analyser=context.createAnalyser();analyser.fftSize=512;meterData=new Float32Array(analyser.fftSize);
      candidate.connect(gain).connect(analyser).connect(context.destination);
      await deadline(new Promise((resolve,reject)=>{
        candidate.onprocessorerror=()=>reject(Error('Audio thread failed to start. The panel can still be edited.'));
        candidate.port.onmessage=e=>{if(e.data.type==='ready')resolve();else receive(e.data);};
      }),3500,'Audio thread did not respond. The panel can still be edited.');
      node=candidate;preview=null;audioOn=true;
      node.onprocessorerror=()=>{ready=false;audioOn=false;availability();say('Audio thread stopped. Reload the page; projects saved in local slots are retained.');};
      context.onstatechange=()=>{if(context.state!=='running'){audioOn=false;setVolume(Number($('sim-volume').value));say('Audio was interrupted; editing is still available. Press a key or restart playback to resume sound.');}availability();};
      setVolume(Number($('sim-volume').value));say('Sound enabled. Your panel state and edits were preserved.');
    }catch(error){
      candidate?.disconnect();candidate?.port.close();
      if(!node&&context)await deadline(context.close().catch(()=>{}),500,'').catch(()=>{});
      if(!node){context=undefined;gain=undefined;analyser=undefined;meterData=undefined;}audioOn=false;say(error.message);
    }finally{
      handoff=false;for(const message of waiting.splice(0))dispatch(message);
      starting=false;availability();
    }
  }

  function control(kind,index,value){
    if(kind===10&&index===12)sourceShortcut=!!value&&held.has('10:0');
    // A HOME press must complete a held PLAY chord even while audio is waking.
    const homePress=value&&(kind===0&&index===8||kind===10&&(index===2||index===12&&!sourceShortcut));
    if(homePress&&(wakingPlay?.down||held.has('0:12')||held.has('10:16'))){wakingKeys.clear();resetWheels();}
    if(homePress&&wakingPlay?.down){
      const play=wakingPlay;wakingPlay=undefined;
      send(play.type,play.message);
    }
    if(kind===0&&index===12||kind===10&&index===16){
      const home=held.has('0:8')||held.has('10:2')||held.has('10:12')&&!sourceShortcut;
      if(value&&home){wakingKeys.clear();resetWheels();}
      if(wakingPlay){
        if(value&&home)wakingPlay=undefined;
        else{if(wakingPlay.kind===kind)wakingPlay.down=!!value;return;}
      }
      // Physical PLAY and keyboard PLAY share startup/cancellation semantics.
      // Stop, muted editing and HOME+PLAY do not need an audio device.
      if(value&&!muted&&!audioOn&&!state?.[14]&&!home){
        const play={kind,type:kind===10?'smk37':'control',message:{kind:0,index,value:1},down:true,page:state?.[1],track:state?.[0]};wakingPlay=play;
        start(true).then(()=>{
          if(wakingPlay!==play)return;wakingPlay=undefined;
          if(!audioOn||state?.[1]!==play.page||state?.[0]!==play.track)return;
          send(play.type,play.message);
          if(!play.down)send(play.type,{...play.message,value:0});
        });return;
      }
    }
    if(kind>=10){
      const token=kind+':'+index,pending=wakingKeys.get(token);
      if(pending){pending.down=!!value;return;}
      const note=kind===11||kind===13,owner='wake:'+token;
      if(note){clearTimeout(pulseTimers.get(owner));pulseTimers.delete(owner);}
      const message={kind:kind-10,index,value:note&&value?100:value};
      // C owns Pad routing: menu/step edits work even without an audio device.
      const playable=kind===11||(kind===13&&!held.has('10:0')&&!!(padNoteMask&(1<<index)));
      if(playable&&value&&!muted&&!audioOn){
        const wake={down:true};wakingKeys.set(token,wake);
        start(true).then(()=>{
          if(wakingKeys.get(token)!==wake)return;
          wakingKeys.delete(token);if(!audioOn)return;
          if(kind===13&&!(padNoteMask&(1<<index)))return;
          send('smk37',message);
          if(kind===13&&wake.down&&wake.pressure)send('smk37',{kind:2,index,value:wake.pressure});
          if(!wake.down)pulseTimers.set(owner,setTimeout(()=>{
            pulseTimers.delete(owner);send('smk37',{...message,value:0});
          },80));
        });return;
      }
      send('smk37',message);return;
    }
    // The first key press is delivered after audio starts. A quick tap still
    // gets a short audible gate; editing keys never get replayed as notes.
    const key=wakingKeys.get(index);
    if(kind===1&&key){key.down=!!value;return;}
    const black=[1,3,5,8,10,13,15,17,20,22];
    const playable=state&&([0,2,3,4,5,10,15,17].includes(state[1])||(state[1]===1&&state[4]))&&
      !(state[1]===2&&black.includes(index))&&!(state[1]===5&&state[8+state[0]*20]===1&&[20,22].includes(index));
    if(kind===1&&value&&!muted&&!audioOn&&playable){
      const pendingKey={down:true,track:state[0],page:state[1]};wakingKeys.set(index,pendingKey);
      start(true).then(()=>{
        if(wakingKeys.get(index)!==pendingKey)return;
        wakingKeys.delete(index);
        if(!audioOn||state[0]!==pendingKey.track||state[1]!==pendingKey.page)return;
        send('control',{kind,index,value:1});
        if(!pendingKey.down){
          const owner='wake:'+index;clearTimeout(pulseTimers.get(owner));
          pulseTimers.set(owner,setTimeout(()=>{pulseTimers.delete(owner);if(!held.has('11:'+index))send('control',{kind,index,value:0});},100));
        }
      });return;
    }
    send('control',{kind,index,value});
  }
  const holders=new Map(),latched=new Set(),pulseTimers=new Map();let held=new Set();
  function syncHolds() {
    const next=new Set(latched);for(const item of holders.values())next.add(item);
    for(const item of held)if(!next.has(item)){const [kind,index]=item.split(':').map(Number);control(kind,index,0);}
    for(const item of next)if(!held.has(item)){const [kind,index]=item.split(':').map(Number);control(kind,index,1);}
    const previous=held;
    held=next;
    for(const item of new Set([...previous,...next])){
      const element=ui.holds.get(item),down=next.has(item);
      element.classList.toggle('held',down);element.classList.toggle('latched',latched.has(item));
      if(previous.has(item)!==down)element.setAttribute('aria-pressed',String(down));
    }
  }
  function release(){
    wakingPlay=undefined;wakingKeys.clear();sourceShortcut=false;
    for(const timer of pulseTimers.values())clearTimeout(timer);
    pulseTimers.clear();holders.clear();latched.clear();
    const released=[...held];held.clear();send('release');resetWheels();
    for(const item of released){const e=ui.holds.get(item);e.classList.remove('held','latched');e.setAttribute('aria-pressed','false');}
  }
  // The C release/panic paths return pitch and modulation to neutral.
  function resetWheels(){ui.wheels.forEach((input,i)=>{input.value=i?0:64;});}
  function feedback(kind,index,element){
    if(kind===10&&index===7){
      say('PAD / STEP: tap to enter or leave the independent Pad instrument. KEY and PAD retain their own tracks, channels and octaves.');return;
    }
    if(kind===0){
    const tips={2:'FX: K5 chooses a track; K1 reverb, K2 delay, 0 disables sends. K7 switches to detailed settings.',3:'SCL: switches between the SONG and TRACK LAUNCH pages; on other pages it says voice editing moved to the workbench.',10:'ARP: tap to toggle, hold for settings. K6 changes pages: rate / direction / range / gate, then Swing / Hold. K5 chooses a track. Enable and settings are saved with the project; held notes are not.',11:'SEQ: tap to open SYNC / MIDI, SHIFT + SEQ opens MIDI TRACK, SEQ + EDIT together open ACTIONS; HOME + SEQ taps the tempo.'};if(tips[index])say(tips[index]);}}
  function latch(item){latched.has(item)?latched.delete(item):latched.add(item);syncHolds();}
  function pulse(kind,index) {
    const owner='click:'+kind+':'+index;clearTimeout(pulseTimers.get(owner));
    if(holders.delete(owner))syncHolds();
    holders.set(owner,kind+':'+index);syncHolds();
    pulseTimers.set(owner,setTimeout(()=>{pulseTimers.delete(owner);holders.delete(owner);syncHolds();},kind===1?100:55));
  }
  function hold(element,kind,index) {
    const item=kind+':'+index;element.dataset.hold=item;element.setAttribute('aria-pressed','false');
    const pointers=new Map();let lastPressure=0;
    const pressure=()=>{
      if(kind!==13||!held.has(item)||!(padNoteMask&(1<<index))||held.has('10:0'))return;
      let value=0;for(const [id,p] of pointers)
        if(holders.get('pointer:'+id)===item)value=Math.max(value,p.value);
      if(value===lastPressure)return;lastPressure=value;
      const wake=wakingKeys.get(item);
      if(wake)wake.pressure=value;else send('smk37',{kind:2,index,value});
    };
    const updatePressure=event=>{
      const p=pointers.get(event.pointerId);if(!p)return;
      // A mouse reports a synthetic 0.5 pressure. Use deliberate upward
      // dragging for mice and touchscreens without a pressure sensor.
      if(event.pointerType==='touch'&&event.pressure>0&&event.pressure!==0.5)p.sensor=true;
      p.value=Math.max(0,Math.min(127,Math.round(
        event.pointerType==='pen'||p.sensor
          ? event.pressure*127:(p.y-event.clientY)*127/96)));
      pressure();
    };
    element.addEventListener('contextmenu',e=>e.preventDefault());
    element.addEventListener('pointerdown',event=>{
      if(element.disabled||event.button!==0&&!((kind===0||kind===10)&&event.button===2))return;event.preventDefault();feedback(kind,index,element);
      if((kind===0||kind===10)&&(event.shiftKey||event.button===2||latched.has(item))){latch(item);return;}
      if(kind===13&&!held.has(item)){pointers.clear();lastPressure=0;}
      element.setPointerCapture(event.pointerId);holders.set('pointer:'+event.pointerId,item);syncHolds();
      if(kind===13){pointers.set(event.pointerId,{y:event.clientY,value:0});updatePressure(event);}
    });
    element.addEventListener('pointermove',event=>{if(kind===13)updatePressure(event);});
    const up=event=>{
      pointers.delete(event.pointerId);
      if(holders.delete('pointer:'+event.pointerId))syncHolds();
      if(!held.has(item))lastPressure=0;else pressure();
    };
    for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,up);
    element.addEventListener('keydown',event=>{if(!element.disabled&&['Enter','Space'].includes(event.code)){event.preventDefault();event.stopPropagation();if(!event.repeat){feedback(kind,index,element);if((kind===0||kind===10)&&(event.shiftKey||latched.has(item)))latch(item);else{holders.set('focus:'+event.code,item);syncHolds();}}}});
    element.addEventListener('blur',()=>{let changed=false;for(const code of ['Enter','Space'])if(holders.get('focus:'+code)===item){holders.delete('focus:'+code);changed=true;}if(changed)syncHolds();});
    // Accessibility actions and keyboard-generated clicks may not emit pointer events.
    element.addEventListener('click',event=>{if(event.detail===0&&!element.disabled){feedback(kind,index,element);if((kind===0||kind===10)&&(event.shiftKey||latched.has(item)))latch(item);else pulse(kind,index);}});
  }
  function tap(index){control(0,index,1);control(0,index,0);}
  function buildControls() {
    for(let t=0;t<8;t++){
      const button=document.createElement('button');button.id='sim-track-'+t;button.className='track-tile';button.dataset.sim='';button.disabled=true;
      button.innerHTML='<span class="track-number">'+String(t+1).padStart(2,'0')+'</span><span class="track-source"></span><span class="track-level"></span><span class="track-steps">'+'<i></i>'.repeat(64)+'</span>';
      button.addEventListener('click',()=>select(t,6).catch(e=>say(e.message)));$('sim-tracks').append(button);
      const option=document.createElement('option');option.value=t;FM1I18n.text(option,'Track '+(t+1));$('sim-track').append(option);
    }
    sources.forEach((name,type)=>{const option=document.createElement('option');option.value=type;option.textContent=name;$('sim-source').append(option);});
    // The SMK37 workbench exposes each physical control. Shapes and handlers are
    // local implementations; no remote font, image or script is needed.
    const encoders=['K1','K2','K3','K4','K5','K6','K7','K8'];   // Task 13: printed numbers (firmware SELECT, PAGE, PRESETS, MASTER = K5-K8)
    for(const [index,label]of encoders.entries()){
      const box=document.createElement('div');box.className='encoder';
      box.innerHTML='<span>'+label+'</span><button class="dial" data-sim disabled aria-label="'+label+': drag, scroll or click to adjust"><i></i></button><div class="detents"><button data-sim disabled aria-label="'+label+' decrease">−</button><button data-sim disabled aria-label="'+label+' increase">+</button></div>';
      const dial=box.querySelector('.dial'),buttons=box.lastElementChild.querySelectorAll('button');dial.dataset.encoder=index;
      if(index===7){dial.id='sim-master';dial.setAttribute('role','slider');dial.setAttribute('aria-valuemin','0');dial.setAttribute('aria-valuemax','100');}
      let angle=0,lastY=0,moved=false;
      const turn=delta=>{if(!ready)return;if(index!==7){angle+=delta*18;dial.style.setProperty('--angle',angle+'deg');}control(14,index,delta);};
      buttons[0].onclick=()=>turn(-1);buttons[1].onclick=()=>turn(1);
      dial.addEventListener('wheel',event=>{if(dial.disabled||!event.deltaY||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;event.preventDefault();turn(event.deltaY<0?1:-1);},{passive:false});
      dial.addEventListener('pointerdown',event=>{if(dial.disabled||event.button!==0)return;event.preventDefault();lastY=event.clientY;moved=false;dial.setPointerCapture(event.pointerId);});
      dial.addEventListener('pointermove',event=>{if(!dial.hasPointerCapture(event.pointerId))return;const delta=Math.trunc((lastY-event.clientY)/6);if(delta){moved=true;lastY-=delta*6;turn(Math.max(-20,Math.min(20,delta)));}});
      dial.addEventListener('pointerup',event=>{if(dial.hasPointerCapture(event.pointerId)&&!moved)turn(event.shiftKey?-1:1);});
      dial.addEventListener('click',event=>{if(event.detail===0)turn(event.shiftKey?-1:1);});
      dial.addEventListener('keydown',event=>{if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(event.code)){event.preventDefault();event.stopPropagation();turn(event.code==='ArrowUp'||event.code==='ArrowRight'?1:-1);}});
      $('sim-encoders').append(box);
    }
    const labels=['SHIFT','FADER BANK','HOME','BTN 4','OCT -','OCT +','ARP','PAD / STEP','SCL','ENV / LFO','MIX','BT','HOME / SRC','EDIT','FX','SEQ','PLAY','REC'];
    for(let id=0;id<18;++id){
      const button=document.createElement('button');button.textContent=labels[id];button.className='panel-button';button.dataset.sim='';button.dataset.button=id;button.disabled=true;
      const led=[255,255,8,9,0,1,10,255,3,4,7,255,8,6,2,11,12,13][id];
      if(led<14)button.dataset.led=led;
      button.setAttribute('aria-label',labels[id]);hold(button,10,id);$(id<6?'sim-left-buttons':'sim-right-buttons').append(button);
    }
    for(let id=0;id<16;++id){
      const button=document.createElement('button');button.textContent=String(id+1).padStart(2,'0');button.className='smk-pad';button.dataset.sim='';button.dataset.pad=id;button.disabled=true;
      button.setAttribute('aria-label','Pad '+(id+1));hold(button,13,id);$('sim-pads').append(button);
    }
    for(let id=0;id<4;++id){
      const label=document.createElement('label');label.className='smk-fader';
      label.innerHTML='<span>F'+(id+1)+'</span><input data-sim disabled type="range" min="0" max="127" value="0" aria-label="Fader '+(id+1)+'">';
      label.lastElementChild.oninput=event=>control(17,id,Number(event.target.value));$('sim-faders').append(label);
    }
    for(let id=4;id<6;++id){
      const label=document.createElement('label');label.className='smk-wheel';
      label.innerHTML='<span>'+(id===4?'PITCH':'MOD')+'</span><input data-sim disabled type="range" min="0" max="127" value="'+(id===4?64:0)+'" aria-label="'+(id===4?'Pitch bend':'Modulation')+'">';
      const input=label.lastElementChild;input.oninput=()=>control(17,id,Number(input.value));
      if(id===4)for(const type of ['pointerup','pointercancel','blur'])input.addEventListener(type,()=>{input.value=64;control(17,id,64);});
      $('sim-wheels').append(label);
    }
    const whites=Array.from({length:37},(_,i)=>i).filter(i=>![1,3,6,8,10].includes(i%12));
    for(let key=0;key<37;key++){
      const white=whites.indexOf(key),button=document.createElement('button');button.className='piano-key '+(white>=0?'white':'black');button.dataset.sim='';button.dataset.key=key;button.disabled=true;
      const center=white>=0?white+.5:whites.filter(k=>k<key).length;
      button.style.left=(center*100/22)+'%';button.innerHTML='<i></i><span>'+(key%12===0?'C'+(3+Math.floor(key/12)):'')+'</span>';
      button.setAttribute('aria-label','MIDI note '+(48+key));hold(button,11,key);$('sim-keyboard').append(button);
    }
  }

  async function action(fn){try{await fn();}catch(error){say(error.message);}}
  $('sim-start').onclick=()=>{muted=!muted;return start(!muted);};$('sim-panic').onclick=()=>{release();send('panic');};
  $('sim-tap-tempo').onclick=()=>send('tapTempo');
  $('sim-play-control').onclick=()=>action(async()=>{
    if(starting)return;
    release();
    if(!state?.[14]&&!muted&&!audioOn){
      const play={page:state?.[1],track:state?.[0]};wakingPlay=play;
      await start(true);
      if(wakingPlay!==play)return;wakingPlay=undefined;
      if(!audioOn||state?.[1]!==play.page||state?.[0]!==play.track)return;
    }
    // PLAY on the preset browser loads its selection. The toolbar controls
    // transport only; other editors keep their page and cursor while playing.
    if(state?.[1]===16)send('open',{page:0});
    tap(12);
  });
  $('sim-save-control').onclick=()=>{release();send('open',{page:0});tap(9);};
  $('sim-save-device').onclick=()=>action(async()=>{release();await globalThis.FM1Workbench.save(await request('export'));});
  globalThis.FM1Simulator={request,ready:()=>ready}; /* song editor access (Task 03 d) */
  for(const button of document.querySelectorAll('[data-sim-page]'))button.onclick=()=>action(async()=>{
    await request('open',{page:Number(button.dataset.simPage)});
    $('sim-device').scrollIntoView({behavior:'smooth',block:'center'});
    say('Opened '+button.textContent+'; adjust with the panel knobs. HOME returns.');
  });
  $('sim-volume').oninput=()=>setVolume(Number($('sim-volume').value));
  $('sim-track').onchange=()=>action(()=>select(Number($('sim-track').value),6));
  $('sim-source').onchange=()=>action(async()=>{
    const track=Number($('sim-track').value),source=Number($('sim-source').value);
    if(confirm(FM1I18n.t('Changing engines resets this track’s sound. Switching between drums and melody also clears its steps. Continue?')))await select(track,source);
    else $('sim-source').value=String(state[8+track*20]);
  });
  $('sim-project-export').onclick=()=>action(async()=>{save(FM1Web.projectFile(await request('export')),'SMK37-simulation.fm1');say('Browser workspace project exported.');});
  async function loadPreset(index){
    if(presetBusy||!Number.isInteger(index)||index<0||index>=16)return;
    presetBusy=true;availability();
    try{
      await request('preset',{index});
      say('Loaded user project '+(index+1)+'.');
    }finally{presetBusy=false;availability();}
  }
  $('sim-preset-prev').onclick=()=>action(()=>loadPreset(Math.max(0,(workspace?.slot??0)-1)));
  $('sim-preset-next').onclick=()=>action(()=>loadPreset(Math.min(15,(workspace?.slot??0)+1)));
  $('sim-timbre-export').onclick=()=>action(async()=>{save(FM1Web.timbreFile(await request('export',{timbre:true})),'SMK37-timbre.fm1t');say('Current track engine and all sound parameters exported.');});
  $('sim-patch-export').onclick=()=>action(async()=>{save(FM1Web.voiceFile(await request('export',{patch:true})),'SMK37-voice.syx');say('Current track DX7 patch exported.');});
  $('sim-file').onchange=async()=>{
    const revision=++fileRevision;selectedFile=undefined;voices=[];$('sim-voice').replaceChildren();$('sim-voice').hidden=true;availability();const file=$('sim-file').files[0];if(!file)return;
    try {
    if(file.size>4280)throw Error('Choose a .fm1 project, .fm1t sound or DX7 .syx patch file');const bytes=new Uint8Array(await file.arrayBuffer());
    if(revision!==fileRevision)return;
    if(bytes[0]===240){voices=FM1Web.readVoices(bytes);voices.forEach((voice,i)=>{const option=document.createElement('option');option.value=i;option.textContent=(i+1)+' · '+String.fromCharCode(...voice.slice(145,155)).replace(/[^\x20-\x7e]/g,'?');$('sim-voice').append(option);});selectedFile={patch:true};}
    else if(bytes[3]===84) selectedFile={timbre:true,data:FM1Web.readTimbreFile(bytes)};
    else selectedFile={data:FM1Web.readProjectFile(bytes)};
    $('sim-voice').hidden=!selectedFile.patch;availability();say(selectedFile.patch&&state[8+state[0]*20]!==0?'Patch verified. Choose a DX7 track before importing.':'File verified. Click “Import into browser” to apply it.');
    }catch(error){if(revision===fileRevision)say(error.message);}
  };
  $('sim-file-apply').onclick=()=>action(async()=>{
    if(!selectedFile)return;if(!confirm(FM1I18n.t('Replace the browser workspace '+(selectedFile.patch?'current DX7 patch':selectedFile.timbre?'current track sound':'project')+' and continue?')))return;
    const timbre=!!(selectedFile.patch||selectedFile.timbre),data=selectedFile.patch?voices[Number($('sim-voice').value)]:selectedFile.data;
    await request('import',{patch:!!selectedFile.patch,timbre:!!selectedFile.timbre,data});say(timbre?'Sound imported. Save the project for PROJECT tracks. For LIVE tracks, export a timbre file, or save DX7 voices to the independent library.':'Imported into the browser workspace. Press the browser panel\'s 4th button in the left group (after SHIFT, FADER BANK, HOME) to store it in a browser slot.');
  });
  $('sim-read-device').onclick=()=>action(async()=>{
    if(!ready)throw Error('Start the simulator first');
    const data=await globalThis.FM1Workbench.read();
    await request('import',{data});rememberDeviceSnapshot(data,'read');say('Device project loaded into the browser workspace.');
  });
  $('sim-clear').onclick=()=>action(async()=>{if(confirm(FM1I18n.t('Clear all 16 project slots in this browser and restore default engines? Monitor volume is preserved. Device contents will not change.'))){await request('clear');say('Browser project saves cleared. Monitor volume is preserved.');}});
  $('sim-midi').onclick=()=>action(async()=>{
    if(midiConnecting)return;
    if(!ready)throw Error('Start the simulator first');if(!navigator.requestMIDIAccess)throw Error('This browser does not support MIDI input. Use desktop Chrome or Edge');
    midiConnecting=true;availability();
    try{
    const audioReady=muted?Promise.resolve():start(true);
    const access=await deadline(navigator.requestMIDIAccess({sysex:false}),30000,
      'MIDI access is not ready. Check the site\'s MIDI permission; if it is allowed and no prompt appears, restart the browser and try again.');await audioReady;
    if(midiAccess)midiAccess.onstatechange=null;midiAccess=access;
    const refresh=()=>{
      if(midiInput&&(midiInput.state!=='connected'||access.inputs.get(midiInput.id)!==midiInput)){midiInput.onmidimessage=null;midiInput=undefined;release();send('panic');say('MIDI input disconnected; simulator notes released.');}
      $('sim-midi-port').replaceChildren();const empty=document.createElement('option');empty.value='';FM1I18n.text(empty,'Choose MIDI input');$('sim-midi-port').append(empty);
      for(const port of access.inputs.values()){if(port.state!=='connected')continue;const option=document.createElement('option');option.value=port.id;option.textContent=port.name;$('sim-midi-port').append(option);}
      $('sim-midi-port').value=midiInput?.id||'';
    };
    access.onstatechange=refresh;refresh();$('sim-midi-port').hidden=false;
    $('sim-midi-port').onchange=()=>{
      if(midiInput)midiInput.onmidimessage=null;
      midiInput=access.inputs.get($('sim-midi-port').value);release();send('panic');
      if(midiInput)midiInput.onmidimessage=event=>{
        if(!ready)return;
        const data=new Uint8Array(event.data);
        // Keep note-offs, controllers and clock ordering while audio resumes.
        send('midi',{data});
        const playing=(data[0]&0xf0)===0x90&&data[2]>0||data[0]===0xfa||data[0]===0xfb;
        // The statechange notification can lag behind the next MIDI event.
        if(playing&&!muted&&(!audioOn||context?.state!=='running'))start(true);
      };
    };
    say($('sim-midi-port').options.length>1?'Choose an input port. MIDI channels follow the device’s track mapping.':'No MIDI input devices found.');
    }finally{midiConnecting=false;availability();}
  });
  const keyCodes=['KeyZ','KeyS','KeyX','KeyD','KeyC','KeyF','KeyV','KeyB','KeyH','KeyN','KeyJ','KeyM','Comma','KeyL','Period','Semicolon','Slash','Quote','KeyQ','Digit2','KeyW','Digit3','KeyE','KeyR','Digit5','KeyT','Digit6'];
  window.addEventListener('keydown',event=>{
    if(!ready||$('tab-sim').hidden||document.hidden||document.querySelector('dialog[open]'))return;
    if(event.code==='Escape'){release();send('panic');return;}
    if(event.ctrlKey||event.metaKey||event.altKey||/INPUT|SELECT|TEXTAREA|SUMMARY|A/.test(event.target.tagName))return;
    if(event.code==='Space'){if(event.target.tagName==='BUTTON')return;event.preventDefault();if(!event.repeat)tap(12);return;}
    const index=keyCodes.indexOf(event.code);if(index<0)return;event.preventDefault();if(!event.repeat){holders.set('keyboard:'+event.code,'11:'+index);syncHolds();}
  });
  window.addEventListener('keyup',event=>{const keyboard=holders.delete('keyboard:'+event.code),focus=holders.delete('focus:'+event.code);if(keyboard||focus){event.preventDefault();syncHolds();}});
  window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
  document.addEventListener('fm1-view-change',()=>{if($('tab-sim').hidden)release();});
  buildControls();
  const ui={
    controls:document.querySelectorAll('[data-sim]'),holds:new Map(Array.from(document.querySelectorAll('[data-hold]'),e=>[e.dataset.hold,e])),
    faderBank:document.querySelector('[data-button="1"]'),padMode:document.querySelector('[data-button="7"]'),
    faderLabels:document.querySelectorAll('.smk-fader>span'),
    pads:document.querySelectorAll('.smk-pad'),
    wheels:document.querySelectorAll('.smk-wheel input'),
    leds:Array.from(document.querySelectorAll('[data-led]'),button=>[button,168+Number(button.dataset.led)]),
    tracks:Array.from({length:8},(_,t)=>{const button=$('sim-track-'+t);return{button,source:button.querySelector('.track-source'),level:button.querySelector('.track-level'),dots:button.querySelectorAll('i')};})
  };
  availability();boot();
})();
