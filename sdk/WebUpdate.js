/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/* Classic Tabby Task 14 (2026-11-10): Help audit against tabby-v04.1: strings that named removed pages, modes or actions (step editing, REC, SEQ pages, the sampler, "Enable force flash and reconnect") rewritten or deleted, in both languages; new chapter 00 "What changed in tabby-v04"; tests/workbench/help-banned.mjs guards it. Second pass: factory-restore sectors (70-79 of 80), the TRS jack is output only (CLK IN DIN), demo-sample line. English only (SPEC 17.7): the Chinese text is replaced by English at the source, the translation table and the language selector are gone. */
/* SMK37 OPEN browser updater.
 * Fixed device protocol: 00 59, 7-bit SysEx packing, USB MIDI only.
 * Classic Tabby Task 11 (2026-11-07): the project library accepts any song region size of the
 * layout setting (capability reply 21), reads capability bits 6 (diagnostic counters) and 7
 * (device settings kind 8), and carries the full backup and restore (fullBackup, fullRestore,
 * fullVerify; docs/BACKUP-FORMAT.md) and the counters (diagRead).
 * Classic Tabby Task 11B (2026-11-08): port selection for the update, force-flash and factory V16
 * flows. Only ports named like the SMK-37 or its Jieli update loader are opened (UPDATE_PORT);
 * force flash no longer widens the search to every MIDI input. When no port name matches, or
 * more than one port answers, connect() fails with code CHOOSE_PORT and the candidates, and the
 * page lets the user pick one input; a picked port is the only way any other port is opened.
 * Test: tests/workbench/update-ports.mjs (12 fake ports, 10 of them not the SMK-37).
 * Classic Tabby Task 12 A1 (2026-11-08): the default layout is USER 471040 (song region 397312);
 * Library reads command 27 (version, feature flags, USER size) and offers eraseOldData (command
 * 28); reply code 76 = refused while the device plays.
 * Classic Tabby Task 12 A4 (2026-11-08): diagRead adds the screen page and the control-loop profile
 * (command 25 pages 4 and 5); the counters are in every build from tabby-v04.0.
 * Classic Tabby Task 12 A3 (2026-11-08): writeGuard() before every flash write (project slot save,
 * song uploads and deletes, settings kind 8, Bluetooth writes, ERASE OLD DATA, full restore): it
 * reads command 27's live transport byte and sends nothing while the device plays.
 * Classic Tabby Task 12, install incident (2026-11-09, BUILD.md 26.7 and 26.8): (1) a loader named
 * ota-SMK37 + 16 zeros (entered without command 50) takes the model-confirmed resume, as the vendor's
 * unidentified loader does (ZERO_TAG); any other foreign tag is still LOADER_MISMATCH. (2) Connect
 * never leads to force flash after a timeout: the identity query is tried 4 times when a port opens,
 * the capability query (49) 4 times, and if 49 still does not answer on an Open identity Connect
 * fails with code NO_REPLY ("did not answer; power-cycle") instead of offering migration. Migration
 * and force stay for a non-Open identity (factory V16), and force is a manual choice on the page.
 * The identity re-check in install() is retried too (queryRetry). Test: tests/workbench/loader-tag.mjs
 * scenarios X-Z.
 * Classic Tabby Task 17 (2026-11-13): an update is armed only when the device's update replies arrive
 * (Updater.prepareReplies, repliesHeld): with CLOCK on MIDI or SEQ OUT off the SDK holds them. The
 * push hold (remote op 8) on firmware that has it; CLOCK to INT and back (remote panel keys, remote op
 * 9) on tabby-v04.3.1; otherwise the update is refused with the reason (code REPLIES_HELD). The checks
 * before arming and after the restart are retried. Test: tests/workbench/update-clock.mjs.
 * Classic Tabby Task 12 A5 (2026-11-08): safe resume for a stale loader. The Jieli loader's USB name
 * carries the build it waits for (ota-SMK37 + the first 16 hex digits of the build id, taggedLoader).
 * When connect() or waitFor() meets a loader whose tag is not this page's build, the page never
 * treats it as its own and never waits for the timeout: it looks the tag up in builds/index.json
 * (the permanent build pages, tools/linux/builds-index.py), says which build the loader waits for
 * and links to that build's page (code LOADER_MISMATCH: loaderTag, build {tag, page, url} or null,
 * indexState found | unknown | unavailable). Updater takes {builds} (buildsLookup) as a 5th argument.
 * Test: tests/workbench/loader-tag.mjs.
 * Classic Tabby Task 11C (2026-11-08): port names are normalized before matching (portName):
 * macOS CoreMIDI reported the SMK-37 as "SMK37 Open" plus 3 or 4 spaces, with different padding on
 * the input and output endpoints, so no input/output pair formed and the page connected to
 * nothing. Matching and pairing now use NFKC, NUL/control characters as spaces, collapsed white
 * space, trimmed, lower case. No path fails without saying why: no matching port -> CHOOSE_PORT
 * with every input; a picked input with no same-name output -> CHOOSE_PORT with that message;
 * waitFor timeout -> NO_DEVICE with the ports seen; project library -> NO_PORT with the ports.
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
          'Opening the MIDI port timed out. Close other MIDI apps or tabs and retry.':
          'Closing the MIDI port timed out. Reconnect USB, then connect again.'),{code:'PORT_TIMEOUT'}));},method==='open'?5000:3000);
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
  // Task 12 A5: the 16 hex digits of the build a Jieli loader waits for, or null for any other name.
  const LOADER_TAG=/^ota-SMK37([0-9a-fA-F]{16})$/;
  const loaderTag = identity => { const m=LOADER_TAG.exec(identity||''); return m?m[1].toLowerCase():null; };
  const ownTag = pkg => String(pkg.build_id||'').slice(0,16).toLowerCase();
  // Task 12 (2026-11-09): the tag of a loader entered without command 50 (the SDK's target_id is
  // all zeros until command 50 writes it). It names no build, so it is treated like the vendor's
  // unidentified loader: the resume needs the explicit model confirmation, and the build id is
  // checked after the restart.
  const ZERO_TAG='0000000000000000';
  // Task 12 (2026-11-09): a query tried up to `tries` times on a timeout (never on another error,
  // never after the port was lost). Used where a single missed reply used to end in migration.
  async function queryRetry(link,command,payload=[],tries=4) {
    for(let attempt=0;;attempt++) {
      try { return await link.query(command,payload); }
      catch(error) { if(error.code!=='TIMEOUT'||link.lost||attempt>=tries-1) throw error; }
    }
  }
  // Task 12 A5: find a loader tag in a builds index (builds/index.json, schema 1). The entry's page
  // path is relative to the site root; indexUrl (where the index was read from) resolves it.
  function matchBuild(index,tag,indexUrl) {
    if(!index || index.schema!==1 || !Array.isArray(index.builds)) return null;
    const want=String(tag).toLowerCase();
    const entry=index.builds.find(b=>b && (String(b.loader||'').toLowerCase()==='ota-smk37'+want || String(b.build||'').toLowerCase().startsWith(want)));
    if(!entry) return null;
    let url=entry.page||'';
    try { if(indexUrl) url=new URL('../'+String(entry.page||'').replace(/^\/+/,''),indexUrl).href; } catch(_) {}
    return {tag:entry.tag,build:entry.build,loader:entry.loader,version:entry.version,page:entry.page,published:entry.published,url};
  }
  // Task 12 A5: a lookup over an index object already in hand (tests, or a page that embeds it).
  const buildsLookupFromIndex = (index,indexUrl=null) => async tag => {
    if(!index || index.schema!==1 || !Array.isArray(index.builds)) return {state:'unavailable',entry:null,indexUrl:null};
    const entry=matchBuild(index,tag,indexUrl);
    return {state:entry?'found':'unknown',entry,indexUrl};
  };
  // Task 12 A5: a lookup that fetches the first readable index among candidate URLs (the page passes
  // ./builds/index.json, ../index.json and ../builds/index.json resolved against its own address, so
  // the main page, a builds/<tag>/ page and the probe64/ or recover/ pages all find the same file).
  // file:// pages and network failures give 'unavailable'; the message still names the tag.
  const buildsLookup = (urls,fetcher=(typeof fetch==='function'?fetch.bind(globalThis):null)) => async tag => {
    if(!fetcher) return {state:'unavailable',entry:null,indexUrl:null};
    for(const url of urls) {
      try {
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
        let index;
        try { const r=await fetcher(url,{cache:'no-store',signal:controller.signal}); if(!r.ok) continue; index=await r.json(); }
        finally { clearTimeout(timer); }
        if(!index || index.schema!==1 || !Array.isArray(index.builds)) continue;
        const entry=matchBuild(index,tag,url);
        return {state:entry?'found':'unknown',entry,indexUrl:url};
      } catch(_) { /* try the next address */ }
    }
    return {state:'unavailable',entry:null,indexUrl:null};
  };
  async function sha256(bytes) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))); }
  // Official M-VAVE V016 downloads (2026-08-12), preserved byte-for-byte.
  const stockHashes={pro:'2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0',
    elite:'b2ee38abfef3ae922e4eecdb8a551e14345300ae6f270265feacd33b6ef99cb6'};
  async function factoryCheck(data) {
    check(data instanceof Uint8Array&&data.length===37382&&await sha256(data)===
      'a5de2548c68a5bb4b7bc17fc0f13d76e9a00b399181cc683715f9e7e162cf44b','Factory resource validation failed');
  }
  function inspectPackage(bytes,markers=20,stock=false) {
    check(bytes instanceof Uint8Array && bytes.length>=1024 && bytes.length<=2097152, 'Invalid firmware package length');
    // Production Pro V16 uses 36 identity slots; Elite and Open use 20.
    // The pinned package selects the format, never an untrusted header hint.
    const image=new Uint8Array(bytes.length-markers); let product='', ended=false;
    for(let i=0;i<markers;i++) {
      image.set(bytes.subarray(i*48,i*48+47),i*47);
      const marker=bytes[i*48+47];
      if(marker===125) ended=true;
      else { const c=(marker-i-1)&255; check(!ended && c>=32 && c<=126,'Invalid firmware identity'); product+=String.fromCharCode(c); }
    }
    image.set(bytes.subarray(markers*48),markers*47);
    const head=decodeHeader(image.subarray(0,64)), count=le(head,8,2);
    check(le(head,0,2)===crc16(head.subarray(2)) && le(head,4,4)===image.length,'Firmware header verification failed');
    check(ascii(head.subarray(16,32))==='AC791N' && count>0 && count<=12,'Invalid chip type or package directory');
    const table=image.subarray(64,64+count*80);
    check(crc16(table)===le(head,2,2),'Firmware directory verification failed');
    const entries=[];
    for(let i=0;i<count;i++) {
      const e=decodeHeader(table.subarray(i*80,i*80+80));
      const type=le(e,0,2), offset=le(e,8,4), size=le(e,12,4), name=ascii(e.subarray(64));
      const stored=le(e,16,4), encrypted=le(e,24,4);
      check(offset>=64+count*80 && offset<=image.length && size<=image.length-offset,'Firmware entry is out of bounds');
      check(stored>=size && stored<=image.length-offset && (!encrypted || encrypted===stored),'Invalid stored firmware length');
      check(!entries.some(p => stored && p.stored && offset<p.offset+p.stored && p.offset<offset+stored),'Firmware entries overlap');
      const data=image.subarray(offset,offset+size);
      // Vendor auxiliary metadata has a plaintext CRC but encrypted storage.
      // The outer SHA-256 covers it byte-for-byte; flash/loader must be plain.
      check(encrypted || crc16(data)===le(e,4,2),'Firmware content verification failed: '+name);
      check(!encrypted || (type!==0 && type!==100),'Incompatible main firmware or updater format');
      entries.push({type,offset,size,stored,encrypted,crc:le(e,4,2),name,data});
    }
    const flash=entries.filter(e=>e.type===0), loader=entries.filter(e=>e.type===100);
    check(flash.length===1 && flash[0].size>=16384 && flash[0].size<=1044480 && flash[0].size%4096===0,'Invalid flash image');
    check(loader.length===1 && loader[0].size>0 && loader[0].size<32768,'Updater is missing or invalid');
    let factory;
    if(stock) {
      const resources=entries.filter(e=>e.type===50&&e.name==='USR');
      check(resources.length===1&&resources[0].size===37382&&resources[0].encrypted===37408,'Factory resource validation failed');
      const entry=resources[0],decoded=new Uint8Array(entry.stored);
      for(let i=0;i<decoded.length;i+=32)
        decoded.set(decodeHeader(image.subarray(entry.offset+i,entry.offset+i+32),0x980f^((entry.offset+i)>>>2)),i);
      factory=decoded.slice(0,entry.size);
      check(crc16(factory)===entry.crc,'Factory resource validation failed');
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
    if(stock)check(meta.sha256===stockHashes[model]&&meta.build_id===meta.sha256,'Original firmware verification failed');
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
    check(payload.length<=520,'Protocol data is too long');
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
        if(this.queue.length>=32) this.error=new Error('Too many device responses; update stopped');
        else this.queue.push(p);
        if(this.waiter) this.waiter();
      };
      input.addEventListener('midimessage',this.receive);
    }
    get lost() { return this.closed || this.input.state==='disconnected' || this.output.state==='disconnected'; }
    send(bytes) { this.signal?.throwIfAborted();check(!this.lost,'USB disconnected'); this.output.send(bytes); }
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
        check(!this.lost,'USB disconnected');
      }
      const error=new Error('Device did not respond. Its firmware may not support browser updates yet');error.code='TIMEOUT';throw error;
    }
  }
  function capability(data) {
    check(data.length===47 && ascii(data.subarray(0,4))==='FMC1' && data[4]===1 && (data[5]===8||data[5]===9) && le(data,8,2)===512 && le(data,10,4)===1048576,'Device update protocol does not match');
    check(data[7]===1,'The device uses an unknown updater');
    return {family:data[5],state:data[6],build:hex(data.subarray(14,46)),error:data[46]};
  }
  // Port names the SMK-37 can enumerate under, on any firmware the updater talks to:
  //   "SMK37 Open ..." (Classic Tabby and Open V01), "SINCO-MIDI" / "USB MIDI ..." (M-VAVE
  //   firmware; Windows can retain SINCO-MIDI after the updater re-enumerates), and the Jieli
  //   update loader ("USB Composite Device", manufacturer Jieli Technology).
  // Task 11B: the FM-1 names (Felucca, Sloop, Clipper) and the loose "ota" match are gone, so
  // an FM-1 or an audio interface on the same computer is never sent the identity query.
  // Task 11C: every pattern below is matched against portName(), never the raw name.
  //   Linux ALSA:   "SMK37 Open MIDI 1", "USB Composite Device MIDI 1", "SINCO-MIDI MIDI 1"
  //   macOS:        "SMK37 Open" + 3 or 4 spaces, "USB Composite Device" + spaces, "USB MIDI   "
  //   Windows:      "SMK37 Open", "SINCO-MIDI", "USB MIDI"
  // Loader:  usb composite device / jieli.  Open firmware: smk37 open.  Factory V16: smk-37 pro,
  // sinco-midi, usb midi.  (smk[ -_]?37 covers both SMK37 and SMK-37.)
  const UPDATE_PORT=/smk[ _-]?37|sinco|^usb[ _-]?midi\b|composite|jieli/;
  const LIBRARY_PORT=/smk[ _-]?37|^(?:usb|sinco)[ _-]?midi(?: midi)?(?: \d+)?$/;
  // Task 11C: the name used for matching and for pairing an input with its output. CoreMIDI pads
  // USB string descriptors with spaces (and some hosts with NULs); NBSP, tabs and full-width
  // forms are folded by NFKC and the white-space collapse.
  function portName(name) {
    return String(name??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  }
  // Task 11C: what the page shows when nothing matched (connection details and the pick list).
  function portList(access) {
    const live=map=>[...map.values()].filter(p=>p.state==='connected');
    return {inputs:live(access.inputs).map(p=>p.name||'?'),outputs:live(access.outputs).map(p=>p.name||'?'),
      choices:live(access.inputs).map(p=>({id:p.id,name:p.name||'?'}))};
  }
  function pairs(access,loader=false,pick=null) {
    // Names only nominate candidates; identity/capability or project replies must
    // still match before a connection can be used. pick (Task 11B): the id of one input
    // the user chose from the page's list; then only that input is used, whatever its name.
    const name=loader ? UPDATE_PORT : LIBRARY_PORT;
    const connectedInputs=[...access.inputs.values()].filter(p=>p.state==='connected');
    const inputs=pick ? connectedInputs.filter(p=>p.id===pick) : connectedInputs.filter(p=>name.test(portName(p.name)));
    const outputs=[...access.outputs.values()].filter(p=>p.state==='connected');
    return inputs.flatMap(input=>{
      const named=outputs.filter(output=>portName(output.name)===portName(input.name));
      const exact=named.filter(output=>portName(output.manufacturer)===portName(input.manufacturer));
      const found=exact.length===1?exact:named.length===1?named:
        !named.length&&connectedInputs.length===1&&outputs.length===1?outputs:[];
      return found.length===1 ? [{input,output:found[0]}] : [];
    });
  }
  class Updater {
    constructor(access,pkg,status=()=>{},timing={},options={}) {
      this.access=access; this.pkg=pkg; this.status=status; this.link=null; this.identity=null; this.busy=false;
      this.timing={idle:10000,writeIdle:180000,reconnect:40000,settle:600,pace:0,flush:150,save:2500,...timing};   // Task 17: flush, save
      // Task 12 A5: builds(tag16) -> {state, entry, indexUrl}; null means no index (the message still names the tag).
      this.builds=options.builds||null;
    }
    async open(pair,signal) {
      try { await portOperation(pair.input,'open',signal); await portOperation(pair.output,'open',signal); }
      catch(e) { await closePorts(pair.input,pair.output).catch(()=>{}); throw e; }
      const link=new Link(pair.input,pair.output,parse,signal);
      try {
        let reply;
        for(let attempt=0;attempt<4;attempt++){   // Task 12 (2026-11-09): 4 tries (was 2)
          try {reply=await link.query(17,[],750);break;}
          catch(error){if(error.code!=='TIMEOUT'||attempt>=3||link.lost)throw error;}
        }
        check(reply.length===27 && /^[\x20-\x7e]{1,27}$/.test(ascii(reply)),'Invalid device identity response');
        return {link,identity:ascii(reply)};
      }
      catch(e) { await link.close(); throw e; }
    }
    // Task 11B: discover(signal,pick) replaces discover(force,signal). Force flash no longer
    // changes which ports are opened; see UPDATE_PORT and pairs().
    async discover(signal,pick=null) {
      signal?.throwIfAborted();
      const ports=pairs(this.access,true,pick),found=[];let lastError;
      const connectedInputs=[...this.access.inputs.values()].filter(p=>p.state==='connected');
      this.diagnostics={inputs:connectedInputs.map(p=>p.name||'?'),
        outputs:[...this.access.outputs.values()].filter(p=>p.state==='connected').map(p=>p.name||'?'),attempts:[],
        candidates:ports.map(pair=>pair.input.name||'?'),
        // What the page offers to pick from: the inputs that answered when several did,
        // otherwise every connected input (filled in by connect() when none matched).
        choices:[]};
      if(ports.length>16)throw Object.assign(Error('Too many MIDI ports. Disconnect unrelated devices and try again.'),{code:'AMBIGUOUS'});
      for(const pair of ports){
        try {signal?.throwIfAborted();found.push(await this.open(pair,signal));}
        catch(error){
          if(signal?.aborted){await Promise.allSettled(found.map(device=>device.link.close()));throw signal.reason;}
          lastError=error;this.diagnostics.attempts.push({input:pair.input.name||'?',output:pair.output.name||'?',error:error.message});
        }
      }
      this.diagnostics.identities=found.map(device=>device.identity);
      if(found.length>1){
        await Promise.allSettled(found.map(device=>device.link.close()));
        // Task 11B: several SMK-37-named ports answered. The user picks one; nothing is sent
        // to any of them until then.
        const choices=found.map(device=>({id:device.link.input.id,name:device.link.input.name||'?',identity:device.identity}));
        this.diagnostics.choices=choices;
        throw Object.assign(Error('More than one possible device answered. Choose the target device\'s MIDI port below, then connect again.'),{code:'CHOOSE_PORT',choices});
      }
      if(found.length)return found[0];
      if(lastError&&lastError.code!=='TIMEOUT')throw lastError;
      return null;
    }
    async connect({force=false,signal,pick=null}={}) {
      check(!this.busy,'Updating'); await this.disconnect();
      this.force=force;this.mode=null;this.pick=pick||null;
      const device=await this.discover(signal,this.pick);
      if(!device){
        const d=this.diagnostics;
        if(!d?.inputs.length||!d.outputs.length)fail('The browser could not find both a MIDI input and output. Connect a powered-on SMK37 OPEN through its USB-MIDI port, then reconnect.');
        if(!d.candidates.length&&!this.pick){
          // Task 11B: no port is named like the SMK-37 or its loader. Nothing was sent; the
          // user may pick the device's port from every connected input.
          const choices=[...this.access.inputs.values()].filter(p=>p.state==='connected').map(p=>({id:p.id,name:p.name||'?'}));
          d.choices=choices;
          throw Object.assign(Error('No MIDI port is named like the SMK37 or its update loader; nothing was sent to any port. If the device is connected, choose its MIDI port below, then connect again.'),{code:'CHOOSE_PORT',choices});
        }
        if(!d.attempts.length){
          // Task 11C: a picked (or name-matched) input has no output of the same name. Say so and
          // offer the list again rather than ending on a generic error.
          const choices=portList(this.access).choices;d.choices=choices;
          throw Object.assign(Error('The chosen MIDI input has no MIDI output with the same name; nothing was sent to any port. Check the connection details, choose another port below, then connect again.'),{code:'CHOOSE_PORT',choices});
        }
        fail('MIDI ports were found, but the device did not reply with its identity. Close other MIDI apps and updater tabs, power-cycle the device and reconnect USB, then retry. Force flash also requires a responding device.');
      }
      this.link=device.link; this.identity=device.identity;
      try {
        // Task 12 A5: a loader waiting for another build is named, never accepted, never silent.
        const stale=loaderTag(this.identity);
        if(stale && stale!==ownTag(this.pkg) && stale!==ZERO_TAG) throw await this.loaderMismatch(stale,this.identity);
        // Task 12 (2026-11-09): the zero tag joins the unidentified-loader resume (model confirmation).
        if(this.identity===this.pkg.loaderIdentity || this.identity===taggedLoader(this.pkg) || stale===ZERO_TAG ||
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
        try {cap=capability(await queryRetry(this.link,49));}   // Task 12 (2026-11-09): 4 tries
        catch(error) {
          // Some third-party identities share Open's numeric prefix. A missing
          // capability reply requires explicit migration, never a silent flash.
          // Malformed replies and disconnected ports remain errors.
          if(error.code!=='TIMEOUT' || this.link.lost)throw error;
          // Task 12 (2026-11-09): after 4 unanswered tries the page no longer offers migration (it
          // used to, and on 2026-11-09 force flash was turned on from that offer; the forced write
          // skipped command 50 and left the loader with a zero tag). Without force it says the
          // device did not answer. Force ticked by the user beforehand (the manual choice in the
          // migration section) keeps the old legacy path.
          if(!force)throw Object.assign(Error('The device did not answer the version query after 4 tries. Nothing was written. Power-cycle the SMK-37, close other MIDI apps and workbench tabs, then click Connect device again.'),{code:'NO_REPLY'});
          this.mode='legacy';return {resume:false,identity:this.identity,legacy:true};
        }
        check(cap.family===this.pkg.family,'Firmware family does not match this SMK37 model');
        check(cap.state===0,'The device is processing another update');
        this.mode='tagged';this.family=cap.family;
        return {resume:false,identity:this.identity,current:cap.build,same:cap.build===this.pkg.build_id};
      } catch(e) { await this.disconnect(); throw e; }
    }
    async disconnect() { if(this.link) await this.link.close(); this.link=null; this.identity=null; }
    // Task 12 A5: the error for a loader that waits for another build. Nothing has been sent to the
    // loader but the identity query. The message names the tag, this page's build, and (when the
    // builds index lists it) the build's own tag; the page adds the link from error.build.url.
    async loaderMismatch(tag,identity) {
      let found={state:'unavailable',entry:null,indexUrl:null};
      if(this.builds) { try { found={state:'unavailable',entry:null,indexUrl:null,...(await this.builds(tag))}; } catch(_) {} }
      const own=this.pkg.display_version||this.pkg.release_version||ownTag(this.pkg);
      let message;
      if(found.state==='found' && found.entry)
        message='The update loader is waiting for another firmware: build '+tag+' ('+found.entry.tag+'), not this page\'s '+own+'. This page sent no firmware. Open that build\'s page and continue the install there.';
      else if(found.state==='unknown')
        message='The update loader is waiting for build '+tag+', which is not in the list of published builds and is not this page\'s '+own+'. This page sent no firmware. If that is a build you compiled yourself, continue with the page that built it; otherwise power-cycle the device and connect again.';
      else
        message='The update loader is waiting for another firmware: build '+tag+', not this page\'s '+own+'. This page sent no firmware, and the list of published builds could not be read (offline page or network problem). Open the builds/ page online and find the page of the build with this number to continue.';
      return Object.assign(Error(message),{code:'LOADER_MISMATCH',loaderTag:tag,identity,build:found.entry||null,indexState:found.state,indexUrl:found.indexUrl||null});
    }
    async waitFor(identity,alternatives=[],loaderModel) {
      const end=Date.now()+this.timing.reconnect,expected=[...new Set([identity,...alternatives])],observed=new Set();
      while(Date.now()<end) {
        {
          let device;
          // Task 11B: a picked port is kept while it is still connected; once the device
          // re-enumerates (loader or new firmware) the name filter finds it again.
          const pick=this.pick&&[...this.access.inputs.values()].some(p=>p.id===this.pick&&p.state==='connected')?this.pick:null;
          try {device=await this.discover(undefined,pick);}
          catch(error){if(error.code==='AMBIGUOUS'||error.code==='CHOOSE_PORT')throw error;}
          if(device)observed.add(device.identity);
          this.diagnostics={...this.diagnostics,expected,identities:[...observed]};
          if(device) {
            // Task 12 A5: a loader with another build's tag ends the wait at once with its name,
            // instead of being skipped until the timeout.
            const stale=loaderTag(device.identity);
            if(stale && stale!==ownTag(this.pkg) && stale!==ZERO_TAG && !expected.includes(device.identity)) {
              await device.link.close();
              const ports=portList(this.access);
              this.diagnostics={...this.diagnostics,inputs:ports.inputs,outputs:ports.outputs,expected,identities:[...observed]};
              throw await this.loaderMismatch(stale,device.identity);
            }
            if(expected.includes(device.identity) || (loaderModel && (modelLoader(device.identity,loaderModel) || stale===ZERO_TAG))) {
              this.link=device.link; this.identity=device.identity; return;
            }
            await device.link.close();
          }
        }
        await sleep(this.timing.settle);
      }
      // Task 11C: the timeout carries the ports seen, so the page's connection details list them.
      const ports=portList(this.access);
      this.diagnostics={...this.diagnostics,inputs:ports.inputs,outputs:ports.outputs,expected,identities:[...observed]};
      throw Object.assign(Error('Timed out waiting for reconnection. Keep this update page, reconnect the same device and retry'),{code:'NO_DEVICE',ports});
    }
    async serve(finish,idle,phase) {
      const image=this.pkg.image, covered=new Uint8Array(Math.ceil(image.length/8));
      const started=Date.now(); let last=started,total=0;
      for(;;) {
        check(Date.now()-started<Math.max(idle*3,120000),'Update exceeded the maximum wait time and is incomplete');
        check(Date.now()-last<idle,'The device stopped requesting data; update incomplete');
        const packet=await this.link.read(250);
        if(!packet) { check(!this.link.lost,'USB disconnected unexpectedly. Reconnect the same device and retry with this page'); check(Date.now()-last<idle,'The device stopped requesting data; update incomplete'); continue; }
        if(packet.command!==48 || packet.data.length!==8) continue;
        const p=packet.data, address=le(p,1,4), bytes=le(p,5,3);
        check(bytes>0 && bytes<=512,'Invalid device request length');
        if(address===0xe0000000 || address===0xf0000000) {
          check(address===finish && bytes===8,'Device update stage does not match');
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
        check(address<=image.length && bytes<=image.length-address,'Device read exceeds the firmware package');
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
      check(this.pkg.kind==='stock'&&this.identity===this.pkg.product,'Restoring resources requires factory V16 for the matching model');
      await factoryCheck(this.pkg.factory);
      check(ascii(await this.link.query(17))===this.pkg.product,'Restoring resources requires factory V16 for the matching model');
      // V16 NOR_EXT is 0; its hash-pinned USR resource occupies 0xF4000..0xFDFFF.
      // Never touch calibration, user patterns, VM or Bluetooth addresses.
      const data=new Uint8Array(40960);data.fill(255);data.set(this.pkg.factory);
      const header=(offset,size=0)=>[0,offset&255,(offset>>>8)&255,offset>>>16,0,size&255,size>>>8,0];
      const acknowledge=async(command,payload)=>{
        this.link.queue.length=0;this.link.send(frame(command,payload));
        const end=Date.now()+this.timing.idle;
        while(Date.now()<end){
          const reply=await this.link.read(Math.min(250,end-Date.now()));
          check(!this.link.lost,'USB disconnected');
          if(reply?.command===0){check(reply.data.length===1&&reply.data[0]===0,'Factory resource write failed');return;}
        }
        fail('Factory resource write timed out; reconnect and retry');
      };
      this.status('Restoring factory resources',0);
      for(let offset=0;offset<data.length;offset+=512){
        const address=0xf4000+offset,h=header(address,512),block=data.subarray(offset,offset+512);
        if(!(offset%4096))await acknowledge(33,h.slice(0,5));
        await acknowledge(34,[...h,...block]);
        const read=await this.link.query(35,h);
        check(read.length===520&&h.every((b,i)=>read[i]===b)&&block.every((b,i)=>read[8+i]===b),'Factory resource read-back failed');
        this.status('Restoring factory resources',Math.floor((offset+512)*99/data.length));
      }
      check(ascii(await this.link.query(17))===this.pkg.product,'Restoring resources requires factory V16 for the matching model');
    }
    // ---- Task 17 (2026-11-13): updating while the device holds its update replies ----------------
    // Measured (BUILD 36.3): the SDK sends the last message written to the USB port only when another
    // write follows. With CLOCK on INT and SEQ OUT on, the MIDI clock is that write. With CLOCK on MIDI,
    // or SEQ OUT off, the SDK's own update replies (17, 49, 50 and the block requests 48) stay in the
    // device: an update armed then would stall. So before arming, install() checks that one identity
    // reply arrives by itself (repliesHeld). If not:
    //   - firmware with the push hold (command 27 flag bit 3, tabby-v04.4 and later): remote op 8 on;
    //     every control pass then sends a push byte; no setting changes. After the restart the hold is
    //     switched on again for the check and off at the end.
    //   - tabby-v04.3.1 (remote control, no push hold) with CLOCK on MIDI: CLOCK is set to INT through
    //     the remote panel keys (SEQ, K1 one detent down), saved by the device, and set back to MIDI on
    //     the new firmware (remote op 9) after the restart.
    //   - anything else (SEQ OUT off on tabby-v04.3.1, older firmware): the update is refused with the
    //     reason and what to change on the device (code REPLIES_HELD). Nothing is written.
    // The app's own protocol (demoFrame / demoParse) shares the port with the update protocol.
    async appQuery(command,payload=[],{attempts=3,timeout=800}={}) {
      const link=this.link; check(link&&!link.lost,'USB disconnected');
      this.appToken=((this.appToken??crypto.getRandomValues(new Uint16Array(1))[0])+1)&16383;
      const token=this.appToken,packet=demoFrame(command,token,payload);
      let found=null;
      const listen=ev=>{const r=demoParse(ev.data);if(r&&r.command===(command|64)&&r.token===token)found=r;};
      link.input.addEventListener('midimessage',listen);
      try {
        for(let attempt=0;attempt<attempts&&!found;attempt++){
          link.send(packet);const until=Date.now()+timeout;
          while(!found&&Date.now()<until){await sleep(5);check(!link.lost,'USB disconnected');}
        }
      } finally {link.input.removeEventListener('midimessage',listen);}
      if(!found)throw Object.assign(Error('The device did not answer'),{code:'TIMEOUT'});
      check(found.data.length>0,'Incomplete device response');
      return found.data;   // [reply code, ...payload]
    }
    // One identity query, no retry: does the SDK's reply arrive by itself?
    async replyArrives(ms=400) {
      try {return (await this.link.query(17,[],ms)).length===27;}
      catch(error){if(error.code!=='TIMEOUT'||this.link.lost)throw error;return false;}
    }
    // Held = twice in a row a single identity query got no reply. Before each one an app query flushes
    // the device: a reply still held from an earlier query would otherwise be pushed out by this query's
    // own reply and look like its answer (and the app's reply leaves by itself on firmware with the USB
    // pusher; on older firmware it is held too and nothing arrives).
    async repliesHeld() {
      for(let round=0;round<2;round++){
        try {await this.appQuery(27,[],{attempts:2,timeout:500});} catch(error){if(error.code!=='TIMEOUT')throw error;}
        await sleep(this.timing.flush);
        if(await this.replyArrives())return false;
      }
      return true;
    }
    async remoteKey(kind,id,value) {
      const r=await this.appQuery(29,[6,kind,id,value&255]);
      check(r[0]===0,'The device refused a remote panel key (code '+r[0]+')');return r;
    }
    async clockMode() {const r=await this.appQuery(0);check(r[0]===0&&r.length===15,'Invalid device status reply');return r[6];}
    async prepareReplies() {
      this.replyFix=null;this.clockNote='';
      if(!(await this.repliesHeld()))return;
      const refuse=why=>{throw Object.assign(Error(why),{code:'REPLIES_HELD'});};
      const HOW=' On the device press SEQ, set K1 CLOCK to INT and K4 SEQ OUT to ON, then click Connect device and update again. Nothing was written.';
      let cap=null;
      try {cap=await this.appQuery(27);} catch(error){if(error.code!=='TIMEOUT')throw error;}
      const flags=cap&&cap[0]===0&&cap.length>=4?cap[2]|cap[3]<<8:0;
      if(flags&8){
        this.status('Asking the device to send its update replies',null);
        const r=await this.appQuery(29,[8,1]);
        if(r[0]===0&&!(await this.repliesHeld())){this.replyFix='hold';return;}
        refuse('The device does not send its update replies over USB, and switching its push mode on did not change that. The update was not started.'+HOW);
      }
      if(!(flags&4))refuse('The device does not send its update replies over USB (CLOCK is on MIDI, or SEQ OUT is OFF), and this firmware is too old for the page to change that. The update was not started.'+HOW);
      if((await this.clockMode())!==1)refuse('The device sends no MIDI clock over USB (SEQ OUT is OFF), so its update replies do not arrive, and this firmware cannot be told to send them. The update was not started. On the device press SEQ and set K4 SEQ OUT to ON, then click Connect device and update again. Nothing was written.');
      // tabby-v04.3.1 with CLOCK on MIDI: SEQ opens SYNC / MIDI (screen page 1), K1 one detent down = INT.
      this.status('Setting CLOCK to INT for the update',null);
      const page=async()=>{const r=await this.appQuery(29,[0]);check(r[0]===0&&r.length>=13,'Invalid device status reply');return r[2];};
      const press=async id=>{await this.remoteKey(0,id,1);await sleep(60);await this.remoteKey(0,id,0);await sleep(250);};
      await press(15);
      if((await page())!==1){await press(2);await press(15);}
      if((await page())!==1)refuse('The page could not open the SYNC / MIDI page on the device to set CLOCK to INT. The update was not started.'+HOW);
      await this.remoteKey(4,0,255);await sleep(300);
      if((await this.clockMode())!==0){await press(2);refuse('The page could not set CLOCK to INT on the device. The update was not started.'+HOW);}
      await sleep(this.timing.save);                     // the device saves the setting 1.5 s after the change
      if(await this.repliesHeld()){
        await this.remoteKey(4,0,1);await sleep(300);await press(2);
        refuse('CLOCK was set to INT and back to MIDI: the device still does not send its update replies over USB (SEQ OUT is OFF). The update was not started. On the device press SEQ, set K4 SEQ OUT to ON, then click Connect device and update again.');
      }
      await press(2);                                    // HOME: leave SYNC / MIDI
      this.replyFix='clock';
    }
    // After the restart into the new firmware (never for a factory restore). Returns a note for the
    // final status line. The update itself is complete before anything here can fail.
    async finishReplies(hold) {
      if(hold){try {await this.appQuery(29,[8,0]);} catch(_){} }
      if(this.replyFix!=='clock')return '';
      try {
        const r=await this.appQuery(29,[9,1]);
        if(r[0]===0&&(await this.clockMode())===1){this.replyFix=null;return ' CLOCK is back on MIDI.';}
      } catch(_){}
      return ' CLOCK was set to INT for the update and could not be set back: on the device press SEQ and turn K1 to MIDI.';
    }
    async install({force=false,confirmedModel}={}) {
      check(this.link && !this.busy,'Connect the device first'); this.busy=true;
      let failure,armed=false;
      try {
        check(!this.force || force,'Force flashing has not been confirmed');
        check(this.mode,'Reconnect the device');
        check(this.mode!=='migration','Device recognized. To migrate, tick Force flash by hand under Migration, factory restore and forced updates, then connect again.');
        check(this.mode!=='loader' || confirmedModel===this.pkg.model,
          'The loader cannot identify the hardware model. Check the label on the device first.');
        const original=this.identity;
        const reply=await queryRetry(this.link,17);   // Task 12 (2026-11-09): retried on a timeout
        check(reply.length===27 && ascii(reply)===original,'Device identity changed; reconnect the device');
        if(this.pkg.kind==='stock')await factoryCheck(this.pkg.factory);
        if(this.mode!=='loader') {
          // Recheck immediately before arming; a stale Connect result is insufficient.
          if(this.mode==='tagged') {
          const cap=capability(await queryRetry(this.link,49));   // Task 17: retried (a held reply arrives with the next query)
          check(cap.family===this.family && cap.state===0,'Device state changed. Please reconnect');
          check(cap.build!==this.pkg.build_id,'The device already has this version');
          await this.prepareReplies();                             // Task 17: before anything is armed
          const n=this.pkg.image.length, tag=this.pkg.build_id.match(/../g).map(s=>parseInt(s,16));
          const ack=await this.link.query(50,[1,cap.family,n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255,...tag]);
          check(ack.length===1 && ack[0]===0,'The device rejected this firmware package');
          }
          armed=true;
          this.status('Preparing the updater',0); this.link.send([240,34,36,53,127,247]);
          await this.serve(0xe0000000,this.timing.idle,'Preparing the updater');
          await this.disconnect(); this.status('Waiting for the update device to reconnect',null);
          // A migrated board can retain its production loader identity even
          // after running Open. Accept that identity only for this model;
          // the final application still requires an exact identity/build match.
          await this.waitFor(this.pkg.loaderIdentity,['ota-'+original,taggedLoader(this.pkg)],this.pkg.model);
        }
        this.status('Writing firmware',0); this.link.send([240,34,36,53,127,247]);
        await this.serve(0xf0000000,this.timing.writeIdle,'Writing firmware');
        await this.disconnect(); this.status('Restarting and verifying the new version',null);
        await this.waitFor(this.pkg.product);
        if(this.pkg.kind==='stock') {
          // V16 has no Open hash capability. Check its exact model/version,
          // then restore and read back the original resource partition.
          await this.restoreFactory();
          this.status('Update complete',100);
        } else {
          // Task 17: the new firmware may hold its replies too (CLOCK still on MIDI, or SEQ OUT off):
          // the push hold for the check, then off; the check itself is retried.
          let hold=false;
          if(await this.repliesHeld()){try {hold=(await this.appQuery(29,[8,1]))[0]===0;} catch(_){} }
          const after=capability(await queryRetry(this.link,49));
          check(after.family===this.pkg.family && after.build===this.pkg.build_id && after.state===0,'Firmware verification failed after restart');
          const note=await this.finishReplies(hold);
          this.clockNote=note;                                   // the page adds it to its own last line
          this.status('Update complete.'+note,100);
        }
      } catch(error) {
        // Task 17: CLOCK changed for the update and the update did not finish.
        if(this.replyFix==='clock'){
          let back=false;
          if(!armed&&this.link&&!this.link.lost){try {await this.remoteKey(0,15,1);await this.remoteKey(0,15,0);await sleep(250);await this.remoteKey(4,0,1);await sleep(300);back=(await this.clockMode())===1;await this.remoteKey(0,2,1);await this.remoteKey(0,2,0);} catch(_){} }
          if(!back)error.message+=' CLOCK was set to INT for this update and is still on INT: after the update, press SEQ and turn K1 to MIDI.';
          this.replyFix=null;
        }
        failure=error;throw error;}
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
    check(Number.isInteger(command)&&command>=0&&command<128&&Number.isInteger(token)&&token>=0&&token<16384&&payload.length<=132,'Invalid file protocol parameters');
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
    check(patch.length===156,'Invalid DX7 patch length');
    const op=[99,99,99,99,99,99,99,99,99,99,99,3,3,7,3,7,99,1,31,99,14];
    const global=[99,99,99,99,99,99,99,99,31,7,1,99,99,99,99,1,5,7,48];
    for(let i=0;i<156;i++)check(patch[i]<=(i<126?op[i%21]:i<145?global[i-126]:i===155?63:127),'DX7 parameter out of range: '+i);
    return patch;
  }
  function readVoices(bytes) {
    check(bytes instanceof Uint8Array&&(bytes.length===163||bytes.length===4104),'Choose a single-patch or 32-patch DX7 .syx file');
    check(bytes[0]===240&&bytes[1]===67&&bytes[2]<16&&bytes.at(-1)===247&&!bytes.slice(1,-1).some(b=>b>127),'Invalid DX7 SysEx message');
    const bank=bytes.length===4104, size=bank?4096:155;
    check(bytes[3]===(bank?9:0)&&((bytes[4]<<7)|bytes[5])===size,'DX7 data type or length mismatch');
    check(bytes.slice(6,-1).reduce((a,b)=>a+b,0)%128===0,'DX7 patch verification failed');
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
    check(raw instanceof Uint8Array&&raw.length===4096&&Number.isInteger(channel)&&channel>=0&&channel<16,'Invalid DX7 bank length or channel');
    const file=Uint8Array.from([240,67,channel,9,32,0,...raw,(-raw.reduce((a,b)=>a+b,0))&127,247]);
    readVoices(file);return file;
  }
  function voiceBank(voices){
    check(voices.length===32,'Select a DX7 bank containing 32 voices');
    const raw=new Uint8Array(4096);voices.forEach((p,i)=>raw.set(packVoice(p),i*128));return raw;
  }
  function voiceFile(patch,channel=0) {
    validateVoice(patch);check(Number.isInteger(channel)&&channel>=0&&channel<16,'Invalid MIDI channel');
    const voice=patch.slice(0,155),sum=voice.reduce((a,b)=>a+b,0);
    return Uint8Array.from([240,67,channel,0,1,27,...voice,(-sum)&127,247]);
  }
  function projectVersion(payload) {
    check(payload instanceof Uint8Array&&[4048,4064,4264].includes(payload.length),'Invalid project length');
    const version=payload.length===4048?3:4;
    if(payload.length===4264){
      const block=payload.subarray(4064),view=new DataView(block.buffer,block.byteOffset,block.byteLength);
      check(view.getUint32(0,true)===0x54314d46&&view.getUint32(196,true)===crc32(block.subarray(0,196))&&
        !block.subarray(4,196).includes(128),'Invalid project tuning data');
    }
    check(payload[3852]===version,'Invalid project backup format');return version;
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
    check(file instanceof Uint8Array&&[4064,4080,4280].includes(file.length),'Invalid project backup length');
    check(ascii(file.slice(0,4))==='FM1P'&&[3,4].includes(file[4])&&file[5]===0&&file[6]===0&&file[7]===0,'Invalid project backup format');
    const payload=file.slice(16),view=new DataView(file.buffer,file.byteOffset,file.byteLength);
    check(file[4]===projectVersion(payload)&&view.getUint32(8,true)===payload.length&&view.getUint32(12,true)===crc32(payload),'Project backup verification failed');
    return payload;
  }
  function timbreFile(payload) {
    check(payload instanceof Uint8Array&&payload.length===223,'Invalid sound length');
    const file=new Uint8Array(239),view=new DataView(file.buffer);file.set([70,77,49,84,1,0,0,0]);
    view.setUint32(8,payload.length,true);view.setUint32(12,crc32(payload),true);file.set(payload,16);return file;
  }
  function readTimbreFile(file) {
    check(file instanceof Uint8Array&&file.length===239,'Invalid sound file length');
    check(ascii(file.slice(0,4))==='FM1T'&&file[4]===1&&file[5]===0&&file[6]===0&&file[7]===0,'Invalid sound format');
    const p=file.slice(16),v=new DataView(file.buffer,file.byteOffset,file.byteLength);
    check(v.getUint32(8,true)===223&&v.getUint32(12,true)===crc32(p),'Sound verification failed');return p;
  }
  function voiceTimbre(timbre,patch,program) {
    check(timbre instanceof Uint8Array&&timbre.length===223&&timbre[0]===0,'Choose a DX7 track and patch');
    check(Number.isInteger(program)&&program>=0&&program<128,'Invalid voice number');
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
      // Task 11C: no matching port is an error with the port list (the page shows it).
      if(!ports.length){const list=portList(this.access);this.diagnostics={inputs:list.inputs,outputs:list.outputs};
        throw Object.assign(Error('No SMK37 OPEN USB MIDI device with project-library support was found'),{code:'NO_PORT',ports:list});}
      check(ports.length<=16,'Too many MIDI ports. Disconnect unrelated devices and try again.');
      if(ports.length===1)return this.open(ports[0],signal);
      // A BLE or DAW port is only a candidate, not another project device.
      // Probe read-only capabilities before deciding whether the target is ambiguous.
      for(const pair of ports){
        try {await this.open(pair,signal,true);found.push(pair);}
        catch(error){signal?.throwIfAborted();lastError=error;}
        finally {await this.disconnect();}
      }
      signal?.throwIfAborted();
      check(found.length<=1,'Multiple devices responded to the project library. Connect only one SMK37 OPEN');
      if(!found.length)throw lastError;
      return this.open(found[0],signal);
    }
    async open({input,output},signal,probe=false) {
      try {
        await portOperation(input,'open',signal);await portOperation(output,'open',signal);
        this.link=new Link(input,output,demoParse,signal);
        const info=await this.query(0,[],false,probe?{attempts:2,timeout:750}:undefined);
        check(info.length===14&&info[1]===16&&((info[0]===3&&le(info,3,2)===4048)||(info[0]===4&&le(info,3,2)===4064)),'The current firmware does not support this project library');
        this.projectBytes=le(info,3,2);
        if(!probe)await this.extensions();
        return info;
      }
      catch(e){if(this.link)await this.disconnect().catch(()=>{});else await closePorts(input,output).catch(()=>{});throw e;}
    }
    async disconnect(){if(this.link)await this.link.close();this.link=null;this.projectBytes=0;this.tuningBytes=0;}
    async extensions(){
      this.tuningBytes=0;this.programs=16;this.tabbyFlags=0;this.tabbyUserBytes=0;this.sampleCapacity=462848;this.songRegion=397312;this.userBytes=471040;this.diagCounters=false;this.settingsTransfer=false;this.trackRoles=false;this.bankAvailable=false;this.extendedDelay=false;this.songStorage=false;this.songBatch=false;this.timedNotes=false;this.radioSettings=false;
      try {
        const info=await this.query(21);
        // Classic Tabby Task 11 (Step 4): bytes 3..6 are the song region, which follows the firmware's
        // USER size (user_bytes = region + 73728: projects 69632 + the tuning sector 4096): 462848 in the
        // old stock 536576 layout, 397312 in the 471040 layout (normal since Task 12 A1; the defaults
        // above assume it until the reply arrives). Any multiple of 4096 from a 128 KiB
        // move up to the stock size is accepted; the layout is kept for the full backup.
        const region=le(info,3,4);
        check(info.length===7&&(info[0]&~1)===0&&le(info,1,2)===4264&&region%4096===0&&region>=331776&&region<=462848,'Invalid device file length');
        this.songRegion=region;this.userBytes=region+73728;
        if(info[0]&1)this.tuningBytes=4264;
      } catch(error){if(error.deviceCode!==71)throw error;}
      try {
        const info=await this.query(22);
        // Classic Tabby (Task 03 a): a device may report no DX7 library (0 banks) and no sample bank (limit 0).
        check(info.length===9&&info[0]===1&&info[1]===128&&(info[2]===4||info[2]===0)&&info[3]<=1&&(le(info,4,4)===446464||le(info,4,4)===0)&&(info[8]&~255)===0,'Invalid device extension capability response');   // Task 11: bit 6 = diagnostic counters (command 25), bit 7 = device settings transfer kind 8 (full backup)
        this.diagCounters=!!(info[8]&64);this.settingsTransfer=!!(info[8]&128);   // (earlier) Task 06 (a): bit 5 = Bluetooth settings; the mask was ~15 and refused a Task 05 device (bit 4)
        this.programs=128;this.sampleCapacity=le(info,4,4);this.bankAvailable=!!info[3]&&info[2]===4;this.trackRoles=!!(info[8]&1);this.extendedDelay=!!(info[8]&2);this.songStorage=!!(info[8]&4);this.songBatch=!!(info[8]&8);this.timedNotes=!!(info[8]&16);this.radioSettings=!!(info[8]&32);   // Task 05: payload format 1 accepted; Task 06: command 24
      } catch(error){if(error.deviceCode!==71)throw error;}
      // Task 12 A1: command 27, the Classic Tabby capability reply (tabby-v04.0 and later): version,
      // feature flags (bit 0 writes refused while playing, bit 1 command 28 ERASE OLD DATA) and the
      // USER size the firmware reserves. Older firmware answers 71 (unknown command).
      try {
        const info=await this.query(27);
        check(info.length>=7&&info[0]>=1,'Invalid device extension capability response');
        this.tabbyFlags=le(info,1,2);this.tabbyUserBytes=le(info,3,4);
      } catch(error){if(error.deviceCode!==71)throw error;}
    }
    projectPayload(bytes){
      projectVersion(bytes);
      if((this.programs||16)<128){
        let copied=false;
        for(let t=0;t<8;t++){const at=2048+t*223;if(bytes[at]===0&&bytes[at+2]>=16){if(!copied){bytes=bytes.slice();copied=true;}bytes[at+2]=0;bytes[at+3]=1;}}
        // The patch is embedded in the project; only its library label changes.
      }
      check(this.extendedDelay||bytes[3849]<=127,'Before writing to older firmware, set delay to a supported FREE time of at most about 353 ms');
      if(this.tuningBytes)return tunedProject(bytes);
      if(bytes.length===4264){
        check(bytes.subarray(4068,4260).every(value=>value===0),'Update the device firmware before writing a project with tuning settings');
        bytes=bytes.slice(0,4064);
      }
      check(this.projectBytes!==4048||bytes.length===4048,'Update the device firmware before writing a project with ARP settings');
      return this.projectBytes===4064?upgradeProject(bytes):bytes;
    }
    async query(command,payload=[],emptyOK=false,{attempts=3,timeout=1000}={}) {
      check(this.link&&!this.link.lost,'Connect the project library first');check(!this.pending,'A file transfer is in progress');
      if([5,8,10].includes(command))this.onProjectChange?.();
      const link=this.link,token=this.token=(this.token+1)&16383,packet=demoFrame(command,token,payload);
      this.pending=true;
      try {
        link.queue.length=0;
        for(let attempt=0;attempt<attempts;attempt++) {
          link.send(packet);const until=Date.now()+timeout;
          while(Date.now()<until) {
            const r=await link.read(Math.min(200,until-Date.now()));check(!link.lost,'USB disconnected; the operation is incomplete');
            if(!r||r.command!==(command|64)||r.token!==token)continue;
            check(r.data.length>0,'Incomplete device response');const code=r.data[0];
            if(code!==0&&!(emptyOK&&code===1))throw Object.assign(Error(code===1?'This project slot is empty':code===72?'Insufficient memory. The current project is unchanged':code===71?'Invalid file or parameters. The current project is unchanged':code===74?'Song storage is full; compact song storage from the device\'s ACTIONS page or delete a song':code===76?'The device is playing; nothing was written. Stop playback, then try again.':'Device operation failed: '+code),{deviceCode:code});
            return r.data.slice(1);
          }
        }
        fail('Device did not respond. Check USB and project-library firmware support');
      } finally {this.pending=false;}
    }
    async download(kind,target=0) {
      if(kind===0&&this.tuningBytes)kind=3;
      // The device may have begun even if every start ACK was lost.
      try {
        const head=await this.query(1,[kind,target]),size=le(head,0,2);check(head.length===2&&(kind?size===(kind===8?40:kind===5?4096:kind===4?4096:kind===3?4264:kind===2?223:156):[4048,4064].includes(size)),'Invalid device file length');   // Task 11: kind 8 = device settings (40)
        const bytes=new Uint8Array(size);
        for(let at=0;at<size;at+=64){const n=Math.min(64,size-at),part=await this.query(2,[at&255,at>>8,n]);check(part.length===n,'Incomplete file chunk');bytes.set(part,at);}return bytes;
      }
      finally {if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
    }
    // Classic Tabby song mode (Task 03 d): kinds 5 (record) and 6 (block, 16-bit id).
    // Task 06 (a): Bluetooth settings through transfer command 24 (the device's BLE page is gone).
    // Task 12 A1: ERASE OLD DATA (command 28 with the confirm bytes "ERASE"). The device refuses it
    // unless song storage reports OLD DATA, and while the transport runs (code 76). The page asks
    // the user first; this method never asks.
    async eraseOldData(){check(this.tabbyFlags&2,'This firmware cannot erase old data from the web page; use ACTIONS on the device.');await this.writeGuard();await this.query(28,[69,82,65,83,69]);}
    // Task 12 A3: every method that writes flash calls this first. On tabby-v04.0 and later
    // (command 27 flag bit 0) it reads the live transport byte and refuses, before a single
    // write is sent, while a song or the stock sequencer plays. The device refuses on its own
    // too (reply code 76); this check makes the page say so instead of starting a transfer.
    async writeGuard(){
      if(!(this.tabbyFlags&1))return;
      const r=await this.query(27);
      if(r.length>=8&&r[7])throw Object.assign(Error('The device is playing; nothing was written. Stop playback, then try again.'),{deviceCode:76,playing:true});
    }
    async radioRead(){const r=await this.query(24);check(r.length===2,'Invalid Bluetooth settings reply');return {on:!!(r[0]&1),audio:!!(r[0]&2),host:r[1]===1};}
    async radioWrite(s){await this.writeGuard();await this.query(24,[(s.on?1:0)|(s.audio?2:0)|4,s.host?1:0]);}
    async radioForget(){await this.writeGuard();await this.query(24,[0x7f]);}
    // Task 06 (9.13): a 31-byte reply adds, per track, the state byte (bits 0-1 follow / launched / stopped,
    // bits 2-3 the pending queue: none / launch / stop / back to song, bit 4 waiting) and the pattern row (255 = none).
    async songStatus(){const s=await this.query(23);check(s.length===13||s.length===15||s.length===31,'Invalid song storage status reply');
      const tracks=s.length>=31?Array.from({length:8},(_,t)=>({state:s[15+t]&3,queue:(s[15+t]>>2)&3,waiting:!!(s[15+t]&16),row:s[23+t]})):null;
      return {free:le(s,0,4),reclaimable:le(s,4,4),state:s[8],loaded:s[9],playing:s[10],row:s[11],error:s[12],late:s.length>13?s[13]:0,events:s.length>14?s[14]:0,tracks};}
    async downloadBlock(song,id){
      try {
        const head=await this.query(1,[6,song,id&255,id>>8]),size=le(head,0,2);check(head.length===2&&size>=64&&size<=1600,'Invalid block length');   // Task 05: format-1 payloads up to 1600
        const bytes=new Uint8Array(size);
        for(let at=0;at<size;at+=64){const n=Math.min(64,size-at),part=await this.query(2,[at&255,at>>8,n]);check(part.length===n,'Incomplete file chunk');bytes.set(part,at);}return bytes;
      } finally {if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
    }
    async uploadBlock(song,id,bytes){
      songPayloadParse(bytes);await this.writeGuard();   // Task 12 A3
      try {
        await this.query(3,[6,song,id&255,id>>8,bytes.length&255,bytes.length>>8]);
        for(let at=0;at<bytes.length;at+=64)await this.query(4,[at&255,at>>8,...bytes.slice(at,at+64)]);
        const c=crc32(bytes);await this.query(5,[c&255,(c>>>8)&255,(c>>>16)&255,c>>>24]);
      } finally {if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
    }
    // Batched block upload (Task 03 e, transfer kind 7, 9.9 v0.5): one stream of block records
    // lands in whole block sectors under one journal commit, or not at all.
    async uploadBatch(song,stream){
      await this.writeGuard();   // Task 12 A3
      try {
        await this.query(3,[7,song,stream.length&255,stream.length>>8]);
        for(let at=0;at<stream.length;at+=64)await this.query(4,[at&255,at>>8,...stream.slice(at,at+64)]);
        const c=crc32(stream);await this.query(5,[c&255,(c>>>8)&255,(c>>>16)&255,c>>>24]);
      } finally {if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
    }
    async songRead(song,progress=()=>{}){
      check(this.songStorage,'Update the firmware to use song mode');
      let record;try{record=await this.download(5,song);}catch(error){if(error.deviceCode===1)return null;throw error;}
      const parsed=songRecordParse(record),ids=[...songBlockIds(parsed)],blocks=new Map();
      for(let i=0;i<ids.length;i++){blocks.set(ids[i],await this.downloadBlock(song,ids[i]));progress((i+1)/ids.length);}
      return {record,blocks};
    }
    async songWrite(song,record,blocks,progress=()=>{}){
      check(this.songStorage,'Update the firmware to use song mode');check(this.timedNotes,'The device firmware does not accept timed-note blocks; update the firmware first');songRecordParse(record);
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
      check(saved.subarray(20,SONG_BODY).every((v,i)=>v===record[20+i]),'Song read-back mismatch; retry');
      progress(1);return {record:saved,replaced};
    }
    async songDelete(song){check(this.songStorage,'Update the firmware to use song mode');await this.upload(5,song,new Uint8Array(SONG_RECORD).fill(255));}
    async saveProject(slot,bytes) {
      check(Number.isInteger(slot)&&slot>=0&&slot<16,'Choose a device project slot');
      await this.writeGuard();   // Task 12 A3: the slot write is refused while playing
      if(bytes){bytes=this.projectPayload(bytes);await this.upload(0,0,bytes);}
      const expected=await this.download(0);
      check(!bytes||(bytes.length===expected.length&&bytes.every((value,i)=>value===expected[i])),
        'The device workspace differs from the project to save. No project slot was written');
      await this.query(7,[slot]);
      // Reload from persistent storage before comparing; an upload echo only
      // proves the RAM workspace changed, not that the slot was written.
      await this.query(8,[slot]);
      const saved=await this.download(0);
      check(saved.length===expected.length&&saved.every((value,i)=>value===expected[i]),
        'Saved project read-back did not match. Reconnect and check the device slot');
      return saved;
    }
    /* Task 14: samplesRead / samplesWrite (the 8-slot sample bank) are gone: the firmware has no sample bank and nothing called them. */
    async readBank(index){
      check(this.programs===128&&Number.isInteger(index)&&index>=0&&index<4,'Update the firmware to use the 128-voice library');
      const raw=await this.download(4,index);bankFile(raw);return raw;
    }
    async writeBank(index,raw){
      check(Number.isInteger(index)&&index>=0&&index<4,'Invalid voice group number');bankFile(raw);
      await this.upload(4,index,raw);const saved=await this.readBank(index);
      check(saved.every((v,i)=>v===raw[i]),'Voice bank verification failed. Read it again to check');return saved;
    }
    async saveVoice(program,patch){
      check(Number.isInteger(program)&&program>=0&&program<128,'Invalid voice number');
      const voice=packVoice(patch),index=program>>5,raw=await this.readBank(index);
      raw.set(voice,(program&31)*128);return this.writeBank(index,raw);
    }
    async loadVoice(track,program){
      check(Number.isInteger(track)&&track>=0&&track<8,'Choose a DX7 track and patch');
      check(Number.isInteger(program)&&program>=0&&program<128,'Invalid voice number');
      const raw=await this.readBank(program>>5),patch=readVoices(bankFile(raw))[program&31];
      const next=voiceTimbre(await this.download(2,track),patch,program);
      await this.upload(2,track,next);
      const saved=await this.download(2,track);
      check(saved.length===next.length&&saved.every((v,i)=>v===next[i]),'Voice verification after loading failed. Reconnect and check the track');
      return saved;
    }
    async upload(kind,target,bytes) {
      if(kind===1)validateVoice(bytes);
      else if(kind===2){
        check(bytes.length===223,'Invalid file length');
        if((this.programs||16)<128&&bytes[0]===0&&bytes[2]>=16){bytes=bytes.slice();bytes[2]=0;bytes[3]=1;}
      }
      else if(kind===4){check(this.programs===128,'Update the firmware to use the 128-voice library');bankFile(bytes);}
      else if(kind===5){check(bytes.length===SONG_RECORD,'Invalid song record length');}
      else if(kind===8){check(this.settingsTransfer&&bytes.length===40,'Invalid device settings length');}   // Task 11: device settings, sent as they are
      if(kind>=5&&kind<=8)await this.writeGuard();   // Task 12 A3: the flash kinds
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
    check(Array.isArray(events)&&events.length<=SONG_EVENTS_MAX,'A song may have at most 292 events');
    let last=-1,inRow=0;
    events.forEach((e,i)=>{
      check(Number.isInteger(e.row)&&e.row>=0&&e.row<rows&&e.row>=last,'Event '+(i+1)+' has an invalid row or is not in row order');
      inRow=e.row===last?inRow+1:1;last=e.row;check(inRow<=SONG_ROW_EVENTS_MAX,'Row '+(e.row+1)+' has more than 32 events');
      check(Number.isInteger(e.channel)&&e.channel>=0&&e.channel<=15,'Event '+(i+1)+' has an invalid channel');
      const b=v=>Number.isInteger(v)&&v>=0&&v<=127,bb=v=>b(v)||v===255;
      if(e.type===0)check(b(e.d0)&&!e.d1&&!e.d2,'Event '+(i+1)+': the program number must be 0-127');
      else if(e.type===1)check(bb(e.d0)&&bb(e.d1)&&b(e.d2),'Event '+(i+1)+': invalid bank or program number');
      else if(e.type===2)check(b(e.d0)&&b(e.d1)&&!e.d2,'Event '+(i+1)+': the controller number and value must be 0-127');
      else if(e.type===3)check(Number.isInteger(e.d0)&&e.d0>=1&&e.d0<=255&&!e.d1&&!e.d2,'Event '+(i+1)+': the gap must be 1-255 ms');
      else check(false,'Event '+(i+1)+' has an invalid type');});
  }
  function songEventsParse(bytes){
    const n=u16(bytes,SONG_EVENTS);check(n<=SONG_EVENTS_MAX&&bytes[SONG_EVENTS+2]===1&&bytes[SONG_EVENTS+3]===0&&u32(bytes,SONG_EVENTS+4)===0,'Invalid song event table');
    const events=[];for(let i=0;i<n;i++){const at=SONG_EVENTS_START+i*SONG_EVENT_BYTES;events.push({row:bytes[at],channel:bytes[at+1]&15,type:bytes[at+1]>>4,d0:bytes[at+2],d1:bytes[at+3],d2:bytes[at+4]});}
    for(let i=SONG_EVENTS_START+n*SONG_EVENT_BYTES;i<SONG_V2_END;i++)check(bytes[i]===255,'Bytes after the song event table must be 0xFF');
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
    check(bytes instanceof Uint8Array&&bytes.length===SONG_RECORD&&u32(bytes,0)===SONG_MAGIC,'Not a song record');
    const version=u32(bytes,20);check(version===1||version===2,'Unsupported song record version');
    check(u32(bytes,12)===crc32(bytes.subarray(20,version===2?SONG_V2_END:SONG_BODY)),'Song record checksum failed');   // (Task 04) CRC range by version
    const rows=bytes[40];check(rows>=1&&rows<=128&&bytes[42]<rows&&bytes[36]<16&&!(bytes[37]&~7),'Invalid song record field');   // Task 05: flags bit 2 = swing
    check(u16(bytes,38)===0||(u16(bytes,38)>=30&&u16(bytes,38)<=300),'Song tempo must be 0 or 30–300');   // (f): as the device checks
    const song={name:String.fromCharCode(...bytes.subarray(24,36)).replace(/\s+$/,''),project:bytes[36],loop:!!(bytes[37]&1),jumpRow:!!(bytes[37]&2),swing:!!(bytes[37]&4),
      tempo:u16(bytes,38),loopRow:bytes[42],channel:Array.from(bytes.subarray(48,56)),rows:[]};
    for(let r=0;r<rows;r++){const at=SONG_ROW0+r*SONG_ROW;const block=[];for(let t=0;t<8;t++)block.push(u16(bytes,at+t*2));
      const steps=bytes[at+18]||64;check(bytes[at+16]>=1&&bytes[at+16]<=64&&steps%16===0&&steps<=64,'Row '+(r+1)+' is invalid');
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
    const name=String(song.name||'').toUpperCase().slice(0,12);check(/^[\x20-\x7e]{0,12}$/.test(name),'The song name must use ASCII characters');
    for(let i=0;i<12;i++)bytes[24+i]=name.charCodeAt(i)||32;
    check(Number.isInteger(song.project)&&song.project>=0&&song.project<16,'Invalid project slot');bytes[36]=song.project;
    bytes[37]=(song.loop?1:0)|(song.jumpRow?2:0)|(song.swing?4:0);   // Task 05 (9.12): bit 2, swing for v2 blocks
    check(Number.isInteger(song.tempo)&&song.tempo>=0&&song.tempo<=65535,'Invalid BPM');put16(bytes,38,song.tempo);
    check(Array.isArray(song.rows)&&song.rows.length>=1&&song.rows.length<=128,'A song needs 1-128 rows');bytes[40]=song.rows.length;
    check(Number.isInteger(song.loopRow)&&song.loopRow>=0&&song.loopRow<song.rows.length,'Invalid loop start row');bytes[42]=song.loopRow;
    for(let t=0;t<8;t++){const c=song.channel[t]|0;check(c>=0&&c<=16,'Output channels must be 0-16');bytes[48+t]=c;}
    song.rows.forEach((row,r)=>{const at=SONG_ROW0+r*SONG_ROW;
      for(let t=0;t<8;t++){const id=row.block[t]|0;check(id>=0&&id<=65535,'Row '+(r+1)+' has an invalid block id');put16(bytes,at+t*2,id);}
      check(row.repeat>=1&&row.repeat<=64,'Row '+(r+1)+': the repeat count must be 1-64');bytes[at+16]=row.repeat;
      bytes[at+17]=row.loopHere?1:0;check([16,32,48,64].includes(row.steps),'Row '+(r+1)+': the step count must be 16, 32, 48 or 64');bytes[at+18]=row.steps;});
    if(events.length){songEventsValidate(events,song.rows.length);songEventsBuild(bytes,events);}
    put32(bytes,12,crc32(bytes.subarray(20,events.length?SONG_V2_END:SONG_BODY)));
    return bytes;
  }
  // Block payload <-> 64 steps of {probability, alt, notes:[{pitch,velocity,offset,length,retrigger}]}.
  // Task 05 (section 9.12): payloads are format 1 (6-byte timed notes, web/timed-note/timed-note.js:
  // offset -240..240 units of 1/480 step, length in units); format 0 (9.3, 3-byte notes) is read
  // from older .tabby files through songPayloadParseV1 and written back as format 1.
  const timedNote=()=>{const T=globalThis.TabbyTimedNote;check(T,'timed-note.js is not loaded');return T;};
  const SONG_UNITS=480;
  function songPayloadParse(bytes){
    const T=timedNote(),steps=[];let at=0;
    for(let s=0;s<64;s++){check(at<bytes.length,'Block data is incomplete');const head=bytes[at++],count=head&7;check(count<=4&&!(head&128),'Invalid block step header');
      const step={probability:(head>>3)&7,alt:!!(head&64),notes:[]};
      for(let n=0;n<count;n++,at+=6){check(at+6<=bytes.length,'Invalid block note');let note;try{note=T.decode(bytes.subarray(at,at+6));}catch(e){check(false,'Invalid block note: '+e.message);}
        step.notes.push({pitch:note.pitch,velocity:note.velocity,offset:note.offset,length:note.length,retrigger:note.retrigger});}
      steps.push(step);}
    check(at===bytes.length,'Block length mismatch');return steps;
  }
  function songPayloadParseV1(bytes){
    const steps=[];let at=0;
    for(let s=0;s<64;s++){check(at<bytes.length,'Block data is incomplete');const head=bytes[at++],count=head&7;check(count<=4&&!(head&128),'Invalid block step header');
      const step={probability:(head>>3)&7,alt:!!(head&64),notes:[]};
      for(let n=0;n<count;n++,at+=3){check(at+3<=bytes.length&&bytes[at]<128&&(bytes[at+1]&127)>0&&bytes[at+2]>0,'Invalid block note');
        step.notes.push({pitch:bytes[at],velocity:bytes[at+1]&127,offset:0,length:bytes[at+2]*SONG_UNITS,retrigger:!!(bytes[at+1]&128)});}
      steps.push(step);}
    check(at===bytes.length,'Block length mismatch');return steps;
  }
  function songPayloadBuild(steps){
    const T=timedNote(),out=[];check(steps.length===64,'A block needs 64 steps');
    for(const step of steps){check(step.notes.length<=4,'At most 4 notes per step');
      out.push((step.notes.length)|((step.probability&7)<<3)|(step.alt?64:0));
      const seen=new Set();for(const n of step.notes){const note={pitch:n.pitch,velocity:n.velocity,retrigger:!!n.retrigger,offset:n.offset|0,length:n.length};
        check(T.valid(note)&&!seen.has(n.pitch),'Notes need pitch 0-127, velocity 1-127, offset within ±240 units, length of at least 1 unit, and no repeated pitch within a step');seen.add(n.pitch);
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
      if(token[0]==='@'){step.probability=Number(token.slice(1));check(Number.isInteger(step.probability)&&step.probability>=0&&step.probability<=7,'Probability must be @0-@7');continue;}
      const m=token.match(/^(\d+)(?::(\d+))?(?::(\d+(?:\.\d+)?))?(?:\/([+-]?\d+)(ms)?)?(r)?$/i);check(m,'Cannot parse note '+token);
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
    check(bytes.length>=SONG_RECORD,'Not a .tabby song file');const record=bytes.slice(0,SONG_RECORD);songRecordParse(record);
    const blocks=new Map();let at=SONG_RECORD;
    while(at+6<=bytes.length&&bytes[at]!==255){check(bytes[at]===0,'Blocks in a file must belong to song 0');const format=bytes[at+1],id=u16(bytes,at+2),len=u16(bytes,at+4);
      check((format===0||format===1)&&id>=1&&len>=64&&len<=(format?1600:832)&&at+6+len<=bytes.length,'Invalid block record');let payload=bytes.slice(at+6,at+6+len);
      if(format===0)payload=songPayloadBuild(songPayloadParseV1(payload));else songPayloadParse(payload);   // Task 05: a format-0 block is upgraded on read
      blocks.set(id,payload);at+=6+len;at+=(4-at%4)%4;}
    let trailer=null;
    if(at+9<=bytes.length&&bytes[at]===255&&String.fromCharCode(...bytes.subarray(at+1,at+5))==='TRIG'){const len=u32(bytes,at+5);check(at+9+len<=bytes.length,'Invalid .tabby trailer data');
      try{trailer=JSON.parse(new TextDecoder().decode(bytes.subarray(at+9,at+9+len)));}catch(_){check(false,'Invalid .tabby trailer data');}}
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
  // ---- Classic Tabby Task 11 (Step 2): full backup, restore and verify -------------------------
  // docs/BACKUP-FORMAT.md is the file format (version 1). Everything goes through the project
  // library's transfer commands (project slots: load 8 / save 7 + kind 0/3; songs: kinds 5/6/7;
  // device and session settings: kind 8 on a diagnostic or later build; radio: command 24),
  // never through flash offsets, so one file restores onto the stock layout and onto the
  // 471040 probe layout alike. Reading a backup loads each slot into the workspace in turn and
  // puts the workspace back at the end; nothing is written except, when a slot loads, the
  // device's "current slot" setting (the device saves that itself 1.5 s later).
  const BACKUP_FORMAT='classic-tabby-full-backup',BACKUP_VERSION=1;
  const b64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
  const unb64=text=>{check(typeof text==='string'&&/^[A-Za-z0-9+/]*={0,2}$/.test(text),'Invalid backup file content (base64)');const s=atob(text),out=new Uint8Array(s.length);for(let i=0;i<s.length;i++)out[i]=s.charCodeAt(i);return out;};
  const sameBytes=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>v===b[i]);
  const firstDiff=(a,b)=>{const n=Math.min(a.length,b.length);for(let i=0;i<n;i++)if(a[i]!==b[i])return i;return a.length===b.length?-1:n;};
  // What a backup cannot hold, said in the file and in the UI.
  const BACKUP_NOT_INCLUDED=[
    'Bluetooth pairings (the BTIF area): the vendor runtime owns them; pair again after a layout change.',
    'Staging/journal sectors: transient. A committed journal is finished by the device before any transfer write, an uncommitted one is discarded, so the backup reads the settled state.',
    'Rig profiles other than "My rig" stay in this browser (export them from the rig panel).',
    'The FM-1 / external devices themselves.'];
  Library.prototype.songStoragePlaying=async function(){if(!this.songStorage)return false;const s=await this.songStatus();return s.playing!==0;};
  // The update-protocol identity (command 17) and build id (capability 49) through a second
  // listener on the same ports; the project library's own link stays open. null when unavailable.
  Library.prototype.firmwareIdentity=async function(){
    const link=this.link;if(!link||!link.input||!link.output||typeof link.input.addEventListener!=='function')return null;
    const probe=new Link(link.input,link.output,parse);
    try{let identity=null,build=null;
      try{identity=ascii(await probe.query(17,[],1200));}catch(_){}
      try{build=capability(await probe.query(49,[],1200)).build;}catch(_){}
      return {identity,build};
    } finally {probe.closed=true;link.input.removeEventListener('midimessage',probe.receive);}
  };
  // Read everything into memory (no file yet). Shared by fullBackup and fullVerify.
  Library.prototype.fullRead=async function(progress=()=>{}){
    check(this.link&&!this.link.lost,'Connect the project library first');
    check(!(await this.songStoragePlaying()),'Stop song playback before a full backup or verify.');
    const info=await this.query(0);check(info.length===14,'Invalid device information reply');
    const current=info[2],clock=info[5];
    const workspace=await this.download(0);progress(0.02);
    const projects=[];
    for(let slot=0;slot<16;slot++){
      let name=null;
      try{const r=await this.query(9,[slot]);name=ascii(r.slice(0,12)).trimEnd();}
      catch(error){if(error.deviceCode===1){projects.push({slot,empty:true});progress(0.02+0.4*(slot+1)/16);continue;}throw error;}
      try{await this.query(8,[slot]);projects.push({slot,name,bytes:await this.download(0)});}
      catch(error){if(!error.deviceCode)throw error;projects.push({slot,name,error:error.deviceCode});}
      progress(0.02+0.4*(slot+1)/16);
    }
    // Put the workspace back: the current slot, then the unsaved edits if they differ from it.
    const home=projects[current];
    if(home&&home.bytes){await this.query(8,[current]);if(!sameBytes(home.bytes,workspace))await this.upload(0,0,workspace);}
    else await this.upload(0,0,workspace);
    const settings={clock,kind8:null,radio:null};
    if(this.settingsTransfer)settings.kind8=await this.download(8);
    if(this.radioSettings)settings.radio=await this.radioRead();
    const songs=[];
    for(let slot=0;slot<16;slot++){
      if(!this.songStorage){songs.push({slot,empty:true});continue;}
      const song=await this.songRead(slot);
      songs.push(song?{slot,record:song.record,blocks:song.blocks}:{slot,empty:true});
      progress(0.45+0.55*(slot+1)/16);
    }
    return {current,workspace,projects,settings,songs};
  };
  // The backup file (an object; JSON.stringify it to save).
  Library.prototype.fullBackup=async function(progress=()=>{},extra={}){
    const identity=await this.firmwareIdentity().catch(()=>null);
    const data=await this.fullRead(progress);
    const enc=bytes=>({size:bytes.length,crc32:crc32(bytes),data:b64(bytes)});
    let blocks=0;
    const file={format:BACKUP_FORMAT,version:BACKUP_VERSION,created:new Date().toISOString(),
      workbench:extra.workbench||null,
      device:{identity:identity&&identity.identity,build_id:identity&&identity.build,
        user_bytes:this.userBytes,song_region:this.songRegion,project_bytes:this.projectBytes,tuning:!!this.tuningBytes,
        song_storage:!!this.songStorage,settings_kind8:!!this.settingsTransfer,radio:!!this.radioSettings},
      current_slot:data.current,workspace:enc(data.workspace),
      projects:data.projects.map(p=>p.empty?{slot:p.slot,empty:true}:p.error?{slot:p.slot,name:p.name,error:p.error}:{slot:p.slot,name:p.name,...enc(p.bytes)}),
      settings:{clock:data.settings.clock,kind8:data.settings.kind8?enc(data.settings.kind8):null,radio:data.settings.radio},
      songs:data.songs.map(s=>{if(s.empty)return {slot:s.slot,empty:true};const list=[...s.blocks].sort((a,b)=>a[0]-b[0]);blocks+=list.length;
        return {slot:s.slot,record:enc(s.record),blocks:list.map(([id,bytes])=>({id,...enc(bytes)}))};}),
      rig:extra.rig===undefined?null:extra.rig,
      not_included:BACKUP_NOT_INCLUDED.concat(this.settingsTransfer?[]:['Device MIDI settings, track roles, input channels and panel preferences: this firmware has no settings transfer (kind 8). Note them by hand; the diagnostic build and later carry them.']),
      counts:{projects:data.projects.filter(p=>p.bytes).length,songs:data.songs.filter(s=>!s.empty).length,blocks},
      end:BACKUP_FORMAT};
    return file;
  };
  // Parse and validate a backup file completely (text or object). Throws on anything unknown,
  // truncated or inconsistent; returns the decoded form. Nothing on the device is touched.
  function backupParse(input){
    let f=input;
    if(typeof input==='string'){try{f=JSON.parse(input);}catch(_){fail('Backup file is not complete JSON (truncated or damaged); nothing was changed.');}}
    check(f&&typeof f==='object'&&f.format===BACKUP_FORMAT,'Not a Classic Tabby full backup file.');
    check(f.version===BACKUP_VERSION,'Backup file version '+f.version+' is not supported by this workbench (it reads version '+BACKUP_VERSION+').');
    check(f.end===BACKUP_FORMAT,'Backup file is incomplete (no end marker); nothing was changed.');
    const dec=(e,what,sizes)=>{check(e&&Number.isInteger(e.size)&&Number.isInteger(e.crc32),what+': entry damaged');const bytes=unb64(e.data);
      check(bytes.length===e.size&&(!sizes||sizes.includes(bytes.length)),what+': wrong length');check(crc32(bytes)===e.crc32,what+': checksum mismatch');return bytes;};
    check(f.device&&Number.isInteger(f.device.user_bytes)&&f.device.user_bytes%4096===0,'Backup file: device layout missing');
    check(Number.isInteger(f.current_slot)&&f.current_slot>=0&&f.current_slot<16,'Backup file: current slot invalid');
    const workspace=dec(f.workspace,'workspace',[4048,4064,4264]);projectVersion(workspace);
    check(Array.isArray(f.projects)&&f.projects.length===16&&f.projects.every((p,i)=>p&&p.slot===i),'Backup file: project list incomplete');
    const projects=f.projects.map(p=>{if(p.empty)return {slot:p.slot,empty:true};if(p.error)return {slot:p.slot,name:p.name,error:p.error};
      const bytes=dec(p,'project slot '+(p.slot+1),[4048,4064,4264]);projectVersion(bytes);return {slot:p.slot,name:p.name,bytes};});
    check(f.settings&&Number.isInteger(f.settings.clock),'Backup file: settings missing');
    const kind8=f.settings.kind8?dec(f.settings.kind8,'device settings',[40]):null;
    if(kind8)check(le(kind8,0,4)===0x31534254&&kind8[4]===1&&le(kind8,36,4)===crc32(kind8.subarray(0,36)),'Backup file: device settings damaged');
    check(Array.isArray(f.songs)&&f.songs.length===16&&f.songs.every((s,i)=>s&&s.slot===i),'Backup file: song list incomplete');
    let blockCount=0;
    const songs=f.songs.map(s=>{if(s.empty)return {slot:s.slot,empty:true};
      const record=dec(s.record,'song '+(s.slot+1)+' record',[SONG_RECORD]);const parsed=songRecordParse(record);
      check(Array.isArray(s.blocks),'song '+(s.slot+1)+': block list missing');const blocks=new Map();
      for(const b of s.blocks){check(Number.isInteger(b.id)&&b.id>0&&b.id<65536&&!blocks.has(b.id),'song '+(s.slot+1)+': block id invalid');
        const bytes=dec(b,'song '+(s.slot+1)+' block '+b.id);songPayloadParse(bytes);blocks.set(b.id,bytes);}
      for(const id of songBlockIds(parsed))check(blocks.has(id),'song '+(s.slot+1)+': block '+id+' is referenced but missing');
      blockCount+=blocks.size;return {slot:s.slot,record,blocks};});
    check(f.counts&&f.counts.projects===projects.filter(p=>p.bytes).length&&f.counts.songs===songs.filter(s=>!s.empty).length&&f.counts.blocks===blockCount,'Backup file: counts do not match its contents');
    return {file:f,current:f.current_slot,workspace,projects,settings:{clock:f.settings.clock,kind8,radio:f.settings.radio||null},songs,rig:f.rig||null,device:f.device};
  }
  // Restore a parsed backup. Validates the whole file and the device first; erases nothing before.
  Library.prototype.fullRestore=async function(input,progress=()=>{},{settleMs=2500}={}){
    const b=input&&input.projects&&input.workspace instanceof Uint8Array?input:backupParse(input);
    check(this.link&&!this.link.lost,'Connect the project library first');
    await this.writeGuard();   // Task 12 A3: a restore writes flash; nothing is sent while the device plays
    const notes=[],songsWanted=b.songs.some(s=>!s.empty);
    check(!songsWanted||(this.songStorage&&this.timedNotes),'This firmware has no song storage; the backup holds songs. Nothing was changed.');
    if(this.songStorage){const st=await this.songStatus();
      check(st.state!==2,'Song storage holds OLD DATA. Run Erase old data (Song mode group) or ACTIONS > ERASE OLD DATA on the device first. Nothing was changed.');
      check(st.state===0,'Song storage is not ready (state '+st.state+'). Wait for the scan or the compaction, then retry. Nothing was changed.');
      check(st.playing===0,'Stop song playback before a restore. Nothing was changed.');}
    // Device and session settings first: track roles decide how the projects load.
    if(b.settings.kind8){if(this.settingsTransfer)await this.upload(8,0,b.settings.kind8);else notes.push('Device settings are in the file but this firmware cannot take them (no kind 8): not restored.');}
    else notes.push('The file holds no device MIDI settings, track roles or panel preferences (made on firmware without kind 8).');
    if(!b.settings.kind8&&b.settings.radio&&this.radioSettings)await this.radioWrite(b.settings.radio);
    progress(0.03);
    // Project slots.
    for(const p of b.projects){
      if(p.bytes)await this.saveProject(p.slot,p.bytes);
      else if(p.error)notes.push('Project slot '+(p.slot+1)+' was unreadable when the backup was made (code '+p.error+'): left as it is.');
      else{try{await this.query(9,[p.slot]);notes.push('Project slot '+(p.slot+1)+' is empty in the file but holds a project on the device; there is no command to clear a slot, so it was left as it is.');}catch(error){if(error.deviceCode!==1)throw error;}}
      progress(0.03+0.4*(p.slot+1)/16);
    }
    // Songs: written (an occupied slot is deleted first by songWrite), or deleted when the file's slot is empty.
    for(const s of b.songs){
      if(this.songStorage){
        if(!s.empty)await this.songWrite(s.slot,s.record,s.blocks);
        else{let present=true;try{await this.query(1,[5,s.slot]);}catch(error){if(error.deviceCode!==1)throw error;present=false;}finally{if(this.link&&!this.link.lost)await this.query(6).catch(()=>{});}
          if(present)await this.songDelete(s.slot);}
      }
      progress(0.45+0.5*(s.slot+1)/16);
    }
    // The current slot and the workspace, as they were.
    const home=b.projects[b.current];
    if(home&&home.bytes){await this.query(8,[b.current]);const now=await this.download(0);if(!sameBytes(now,b.workspace))await this.upload(0,0,b.workspace);}
    else await this.upload(0,0,b.workspace);
    if(settleMs)await sleep(settleMs);   // the device stores changed settings 1.5 s after the last change
    progress(1);
    return {notes};
  };
  // Read everything back and compare with the file. {pass, difference, notes, checked}.
  Library.prototype.fullVerify=async function(input,progress=()=>{}){
    const b=input&&input.projects&&input.workspace instanceof Uint8Array?input:backupParse(input);
    const d=await this.fullRead(progress),notes=[];let checked=0;
    const report=difference=>({pass:false,difference,notes,checked});
    const cmp=(what,a,c)=>{const at=firstDiff(a,c);checked++;return at<0?null:what+': first difference at byte '+at+' (file '+(a[at]??'end')+', device '+(c[at]??'end')+')';};
    for(let i=0;i<16;i++){const f=b.projects[i],g=d.projects[i];
      if(f.bytes){if(!g.bytes)return report('Project slot '+(i+1)+': in the file, '+(g.empty?'empty':'unreadable')+' on the device');const x=cmp('Project slot '+(i+1),f.bytes,g.bytes);if(x)return report(x);}
      else if(f.empty&&!g.empty)return report('Project slot '+(i+1)+': empty in the file, holds a project on the device (no command can clear a slot)');}
    if(d.current!==b.current)return report('Current slot: file '+(b.current+1)+', device '+(d.current+1));
    {const x=cmp('Workspace',b.workspace,d.workspace);if(x)return report(x);}
    if(b.settings.kind8){if(d.settings.kind8){const x=cmp('Device settings',b.settings.kind8,d.settings.kind8);if(x)return report(x);}else notes.push('Device settings not compared: this firmware has no kind 8.');}
    else if(b.settings.radio&&d.settings.radio){checked++;if(JSON.stringify(b.settings.radio)!==JSON.stringify(d.settings.radio))return report('Bluetooth settings differ');}
    if(d.settings.clock!==b.settings.clock)return report('Clock mode: file '+b.settings.clock+', device '+d.settings.clock);
    for(let i=0;i<16;i++){const f=b.songs[i],g=d.songs[i];
      if(!!f.empty!==!!g.empty)return report('Song slot '+(i+1)+': '+(f.empty?'empty in the file, present on the device':'in the file, empty on the device'));
      if(f.empty)continue;
      // Bytes 0..19 are storage bookkeeping (magic, generation, target, CRC, commit word); 20.. is the song.
      {const x=cmp('Song '+(i+1)+' record',f.record.subarray(20),g.record.subarray(20));if(x)return report(x);}
      if(f.blocks.size!==g.blocks.size)return report('Song '+(i+1)+': '+f.blocks.size+' blocks in the file, '+g.blocks.size+' on the device');
      for(const [id,bytes] of f.blocks){if(!g.blocks.has(id))return report('Song '+(i+1)+': block '+id+' missing on the device');const x=cmp('Song '+(i+1)+' block '+id,bytes,g.blocks.get(id));if(x)return report(x);}
    }
    if(b.device.user_bytes!==this.userBytes)notes.push('Layout: the file came from USER '+b.device.user_bytes+', this device runs USER '+this.userBytes+'.');
    return {pass:true,difference:null,notes,checked};
  };
  // ---- Classic Tabby Task 11 (Step 3): the diagnostic build's counters (transfer command 25) ----
  // Page 1 (64 bytes) and page 2 (20 bytes) as app/diag.c lists them; times in 24 MHz ticks,
  // returned here in milliseconds.
  Library.prototype.diagRead=async function(reset=false){
    check(this.diagCounters,'This firmware has no diagnostic counters (tabby-v04.0 and later have them in every build).');
    const a=await this.query(25,[reset?1:0]),b=await this.query(25,[2]);
    check(a.length===64&&b.length===20,'Diagnostic reply has the wrong length');
    const u=(p,i)=>le(p,i,4),hz=u(a,0)||24000000,ms=t=>t*1000/hz;
    const bins=[];for(let i=0;i<8;i++)bins.push(a[48+2*i]|a[49+2*i]<<8);
    const seconds=u(a,4)/hz;
    const out={seconds,loop:{count:u(a,8),max_ms:ms(u(a,12)),mean_ms:ms(u(a,16))},
      flash:{erases:u(a,20),erase_max_ms:ms(u(a,24)),writes:u(a,28),write_max_ms:ms(u(a,32)),write_max_bytes:u(a,36)},
      keys:{count:u(a,40),max_ms:ms(u(a,44)),bins},
      scan:{count:u(b,0),per_second:seconds?u(b,0)/seconds:0,gap_max_ms:ms(u(b,4)),isr_peak_ms:ms(u(b,8)),adc_peak_ms:ms(u(b,12))}};
    // Task 11B page 3 (screen) and Task 12 A4 pages 4 and 5 (the control-loop profile); firmware
    // older than tabby-v04.0 answers page 3 only in a diag-r2 build and pages 4 and 5 not at all.
    try{const c=await this.query(25,[3]);if(c.length===28)out.screen={controls:u(c,0),control_mean_ms:ms(u(c,4)),control_max_ms:ms(u(c,8)),paints:u(c,12),bands:u(c,16),paint_mean_ms:ms(u(c,20)),paint_max_ms:ms(u(c,24))};}catch(error){if(!error.deviceCode)throw error;}
    try{
      const p4=await this.query(25,[4]),p5=await this.query(25,[5]);
      if(p4.length===60&&p5.length===56){
        const names=['router','song','storage','screen','panel','transfer','project','sdk'],sections={};
        for(let i=0;i<6;i++)sections[names[i]]={max_ms:ms(u(p4,12+8*i)),mean_ms:ms(u(p4,16+8*i))};
        for(let i=0;i<2;i++)sections[names[6+i]]={max_ms:ms(u(p5,8*i)),mean_ms:ms(u(p5,4+8*i))};
        for(let i=0;i<7;i++)sections[names[i]].calls=u(p5,28+4*i);
        out.profile={passes:u(p4,0),pass_mean_ms:ms(u(p4,4)),pass_max_ms:ms(u(p4,8)),sections,
          midi_in:{calls:u(p5,16),mean_ms:ms(u(p5,20)),max_ms:ms(u(p5,24))}};
      }
    }catch(error){if(!error.deviceCode)throw error;}
    // Task 16: option A2 (fast MIDI), command 25 request 7 (tabby-v04.2 and later; older firmware answers
    // an error): the switch, the audio blocks, the pass requests made from the audio interrupt, the call
    // cost (24 MHz ticks, shown in microseconds) and its histogram (BUILD.md 28.4).
    try{const q=await this.query(25,[7]);if(q.length===48){const bl=u(q,4),calls=u(q,8);
      out.a2={on:u(q,0)===1,blocks:bl,calls,calls_per_s:bl?calls*44118/(bl*128):0,mean_us:u(q,12)/24,max_us:u(q,16)/24,retries:u(q,20),bins:[0,1,2,3,4,5].map(i=>u(q,24+4*i))};}}
    catch(error){if(!error.deviceCode)throw error;}
    return out;
  };
  // Task 12 A4: the section names as the report and docs/BUILD.md 26.4 use them.
  const PROFILE_LABELS={router:'router (MIDI out sends)',song:'song scheduling',storage:'song storage (scan / erase / compact)',screen:'screen (panel input, pages, LCD)',panel:'panel and LEDs (key queue, LEDs)',transfer:'transfer (workbench protocol)',project:'project (restores, settings saves)',sdk:'SDK between the hooks'};
  function diagText(d){
    const f=v=>v.toFixed(3);
    const lines=['Classic Tabby diagnostic counters, '+f(d.seconds)+' s since reset',
      'L.1 control loop (groove_midi_poll): '+d.loop.count+' loops, mean '+f(d.loop.mean_ms)+' ms, max '+f(d.loop.max_ms)+' ms',
      'L.3 flash: '+d.flash.erases+' erases, longest '+f(d.flash.erase_max_ms)+' ms; '+d.flash.writes+' writes, longest '+f(d.flash.write_max_ms)+' ms ('+d.flash.write_max_bytes+' bytes)',
      'L.4 key/pad note-on to router: '+d.keys.count+' notes, max '+f(d.keys.max_ms)+' ms; <0.5 '+d.keys.bins[0]+', <1 '+d.keys.bins[1]+', <2 '+d.keys.bins[2]+', <4 '+d.keys.bins[3]+', <8 '+d.keys.bins[4]+', <16 '+d.keys.bins[5]+', <32 '+d.keys.bins[6]+', >=32 '+d.keys.bins[7]+' (ms)',
      'L.5 matrix scan: '+d.scan.count+' scans, '+d.scan.per_second.toFixed(1)+' per second, longest gap '+f(d.scan.gap_max_ms)+' ms; scan ISR peak '+f(d.scan.isr_peak_ms)+' ms, ADC ISR peak '+f(d.scan.adc_peak_ms)+' ms'];
    if(d.screen)lines.push('screen: '+d.screen.controls+' control calls, mean '+f(d.screen.control_mean_ms)+' ms, max '+f(d.screen.control_max_ms)+' ms; '+d.screen.paints+' band paints ('+d.screen.bands+' bands), mean '+f(d.screen.paint_mean_ms)+' ms, max '+f(d.screen.paint_max_ms)+' ms');
    if(d.a2)lines.push('A2 fast MIDI: '+(d.a2.on?'ON':'OFF')+'; '+d.a2.calls+' pass requests from the audio interrupt in '+d.a2.blocks+' audio blocks ('+d.a2.calls_per_s.toFixed(1)+' per second); call cost mean '+d.a2.mean_us.toFixed(1)+' us, longest '+d.a2.max_us.toFixed(1)+' us; '+d.a2.retries+' retries; calls <5, <10, <20, <50, <100, >=100 us: '+d.a2.bins.join(', '));
    if(d.profile){
      const p=d.profile;
      lines.push('control pass (SDK call of groove_midi_poll to the next): '+p.passes+' passes, mean '+f(p.pass_mean_ms)+' ms, max '+f(p.pass_max_ms)+' ms; per section, per pass (mean / max, exclusive):');
      for(const [k,label] of Object.entries(PROFILE_LABELS)){const s=p.sections[k];lines.push('  '+label+': '+f(s.mean_ms)+' / '+f(s.max_ms)+' ms'+(s.calls!==undefined&&p.passes?', '+(s.calls/p.passes).toFixed(2)+' calls per pass':''));}
      lines.push('  MIDI input callback (routing task, not in the pass): '+p.midi_in.calls+' calls, mean '+f(p.midi_in.mean_ms)+' ms, max '+f(p.midi_in.max_ms)+' ms');
    }
    return lines.join('\n');
  }
  globalThis.FM1Web={abortable,assetBytes,crc16,inspectPackage,prepare,pack7,frame,parse,capability,Link,pairs,portName,Updater,
    loaderTag,matchBuild,buildsLookup,buildsLookupFromIndex,
    songEmpty,songRecordParse,songRecordBuild,songPayloadParse,songPayloadParseV1,songPayloadBuild,songStepText,songStepParse,songLengthText,tabbyFile,readTabbyFile,songBlockIds,songBatches,songEventsValidate,
    crc32,demoFrame,demoParse,validateVoice,readVoices,voiceFile,packVoice,bankFile,voiceBank,projectVersion,upgradeProject,tunedProject,projectFile,readProjectFile,timbreFile,readTimbreFile,voiceTimbre,Library,
    backupParse,BACKUP_FORMAT,BACKUP_VERSION,diagText};   // Task 11
})();
