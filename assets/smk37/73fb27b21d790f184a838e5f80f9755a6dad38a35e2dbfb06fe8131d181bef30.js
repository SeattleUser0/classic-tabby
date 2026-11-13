/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * sdk/I18n.js: the workbench's text helpers (Classic Tabby; no translation any more)
 *
 * Purpose
 *   Classic Tabby is English only (SPEC 17.7, Task 14, 2026-11-10). This file used to hold the
 *   Chinese-to-English translation table (about 760 entries), its pattern list, the language
 *   selector and the stored language preference. All of that is gone: the page's own text is
 *   English. What stays is the three-function surface the page code already calls, so that the
 *   build (tools/linux/build-web.py inlines this module first) and the call sites do not change:
 *     FM1I18n.t(value)             the value as a string
 *     FM1I18n.text(node, value)    node.textContent = value
 *     FM1I18n.attr(node, name, v)  node.setAttribute(name, value)
 *   A later cleanup can replace the calls by plain DOM code and delete this file.
 *   Upstream merges: new workbench text must be written in English at the source, never added
 *   through a table (BUILD.md 30.5).
 *
 * Version: 1.0
 *
 * Revision log
 *   v1.0  2026-11-10  Task 14: English only; the translation table, patterns, language selector and
 *                     the fm1-language preference removed (the table had 763 entries; the page
 *                     now carries the English text itself).
 *   v0.x             Classic Tabby / upstream: the Chinese-to-English table (history in git).
 */
(() => {
  'use strict';
  const t = value => String(value ?? '');
  globalThis.FM1I18n = {
    t,
    text(node, value) { node.textContent = t(value); },
    attr(node, name, value) { node.setAttribute(name, t(value)); }
  };
})();

const FM1_PACKAGE = {"schema":1,"product":"SMK-37 Pro_8000001","profile":"pro","family":8,"release_version":"V01","display_version":"tabby-v04.3.1","build_id":"71df5724063bc0cb6075d5364f2a319650862b9baa241df6ea694467f020f6d9","sha256":"72a4feca2c284a575851a2bddbb3dc0afc08edcc56433fcc2008b2e894c8e5af","bytes":492084,"loader_sha256":"ef1f2db89b011fa53e71df363f0122de0ea896618c53fb53e8da676322004541","hardware_validated":false,"model":"pro","stock":{"schema":1,"kind":"stock","product":"SMK-37 Pro_016","model":"pro","profile":"SMK37 Pro Original V16","family":8,"release_version":"V16","build_id":"2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0","sha256":"2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0","bytes":705252,"loader_sha256":"ef1f2db89b011fa53e71df363f0122de0ea896618c53fb53e8da676322004541","url":"./assets/smk37/2d98ce72530e71d617384963423820536f094501299e2cfec0a8d3c3fb6bcfb0.bin"},"user_bytes":471040,"diag":false,"a2":true,"url":"./assets/smk37/72a4feca2c284a575851a2bddbb3dc0afc08edcc56433fcc2008b2e894c8e5af.bin"};
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
      this.timing={idle:10000,writeIdle:180000,reconnect:40000,settle:600,pace:0,...timing};
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
    async install({force=false,confirmedModel}={}) {
      check(this.link && !this.busy,'Connect the device first'); this.busy=true;
      let failure;
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
          const cap=capability(await this.link.query(49));
          check(cap.family===this.family && cap.state===0,'Device state changed. Please reconnect');
          check(cap.build!==this.pkg.build_id,'The device already has this version');
          const n=this.pkg.image.length, tag=this.pkg.build_id.match(/../g).map(s=>parseInt(s,16));
          const ack=await this.link.query(50,[1,cap.family,n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255,...tag]);
          check(ack.length===1 && ack[0]===0,'The device rejected this firmware package');
          }
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
        } else {
          const after=capability(await this.link.query(49));
          check(after.family===this.pkg.family && after.build===this.pkg.build_id && after.state===0,'Firmware verification failed after restart');
        }
        this.status('Update complete',100);
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

globalThis.FM1_DEVICES = [{"schema":"tabby-device/1","version":"0.2","id":"chase-bliss-brothers","name":"Chase Bliss Audio Brothers","maker":"Chase Bliss Audio","kind":"effect","firmware":"no firmware versions or updates published (MIDI manual PDF 2018-04-05, pedal manual 2017-03-11)","midiIn":{"connector":"1/4 inch TRS jack EXT(A)/MIDI: MIDI on the ring, tip floating ('ring active'); no DIN, no USB, no thru","trs":"ring","note":"Needs a powered Chase Bliss MIDIbox (DIN in, jumper in RING, TRS patch cable to the jack) or another ring-active TRS MIDI output. A plain TRS type A cable will not drive it. In this rig: Thru5 WC > MIDIbox (RING) > Brothers."},"clock":{"receives":false,"syncs":"nothing (a gain pedal: no tempo, no tap, no ramping)","setting":""},"channelSetting":"Hold both stomp switches while powering up, release, then send any program change on channel 12: the first PC seen sets the channel permanently (default 2). No factory reset exists.","channel":{"default":2,"note":"Default 2. Learnt from the first program change after a both-switch power-up; any channel 1..16. Wrong Room: 12 (learn it by sending a PC on channel 12, for example SEND SETUP with row 1 holding the Brothers' preset)."},"programChange":{"supported":true,"displayBase":0,"programs":123,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"PC 0 = live mode (the preset toggle's middle position); PC 1..122 = presets 1..122 (slot 1 = the toggle's right position, slot 2 = left; 3..122 are MIDI-only and empty until saved). Wire value = displayed number. Save: send the PC while holding both stomp switches. No bank select, nothing to enable. PC 123..127: not documented."},"controllers":[{"cc":14,"name":"Gain A","min":0,"max":127},{"cc":15,"name":"Master","min":0,"max":127},{"cc":16,"name":"Gain B","min":0,"max":127},{"cc":17,"name":"Tone A","min":0,"max":127},{"cc":18,"name":"Mix / Stack","min":0,"max":127},{"cc":19,"name":"Tone B","min":0,"max":127},{"cc":21,"name":"Channel A effect","min":1,"max":3,"values":{"1":"Boost","2":"Drive","3":"Fuzz"}},{"cc":22,"name":"Order","min":1,"max":3,"values":{"1":"PARA","2":"A>>B","3":"B>>A"}},{"cc":23,"name":"Channel B effect","min":1,"max":3,"values":{"1":"Fuzz","2":"Drive","3":"Boost"}},{"cc":100,"name":"Expression","min":0,"max":127,"values":{"0":"pedal up","127":"fully depressed"}},{"cc":102,"name":"Bypass switch","min":0,"max":127,"values":{"0":"both channels bypassed","127":"last saved channels engaged"}},{"cc":103,"name":"Bypass states","min":0,"max":127,"values":{"0":"both bypassed","45":"B on, A bypassed","85":"A on, B bypassed","127":"both on"}}],"setup":["Chase Bliss MIDIbox: power it, jumper in RING, DIN from the Thru5 WC, TRS patch cable to the Brothers' EXT(A)/MIDI jack (a plain TRS type A cable from a DIN out does not work).","Set channel 12: power up holding both stomp switches, release, send a program change on channel 12 (SEND SETUP with the Brothers' preset in row 1 does it).","Save the presets the song calls: hold both stomp switches and send PC n (1..122).","PC 0 in a song means live mode (the toggle's middle position), not a preset."],"notes":["Original Brothers (2017, with Resonant Electronic Design). The Brothers AM (2025) is a different pedal with another CC map (14..19 renamed, 27/29 presence, 102/103 as per-channel bypass, 111 preset save, dip switches 61..77).","CC 102 at 127 restores the last saved channels; CC 103 gives deterministic A / B states.","No MIDI thru or out; no notes, no SysEx documented; sending clock to it is harmless and useless."],"sources":[{"title":"Brothers MIDI manual (MIDI CONFIGURATION, 2018-04-05)","url":"https://cb2k22.squarespace.com/s/Brothers_MIDI-Manual_Pedal_Chase-Bliss.pdf","detail":"channel learn, PC 0..122, CC table, MIDIbox"},{"title":"Brothers instructions (2017-03-11): the EXT(A)/MIDI jack, dip switches","url":"https://cb2k22.squarespace.com/s/Brothers_Manual_Pedal_Chase-Bliss.pdf","detail":""},{"title":"Chase Bliss support page: ring-active TRS wiring, no factory reset, MIDIbox needs power","url":"https://www.chasebliss.com/support","detail":""},{"title":"Chase Bliss MIDIbox product page","url":"https://chasebliss.com/shoputility/p/midibox","detail":"jumpers ring active for Chase Bliss"},{"title":"Morningstar help and forum (secondary): a ring-active Omniport drives Chase Bliss pedals; tip left floating","url":"https://help.morningstar.io/en/article/connecting-chase-bliss-devices-to-the-morningstar-omniports-8c8wqd/","detail":"secondary"}],"unverified":["electrical level of the ring input (no pinout published)","PC 123..127","preset change latency","learn-state timeout","omni"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"dirtywave-m8","name":"Dirtywave M8 Tracker Model:02","maker":"Dirtywave","kind":"instrument","firmware":"M8 firmware 6.6.3 F (changelog 2026-10-20); operation manual v6.5.2 (2026-04-21)","midiIn":{"connector":"3.5 mm TRS type A in and out; USB-C class-compliant MIDI (behaves like the TRS input)","trs":"A","note":"DIN-to-TRS type A adapter from the Thru5 WC, or USB from a host."},"clock":{"receives":true,"syncs":"the song tempo and transport: SYNC IN = CLOCK, TRANSPORT, CLOCK+TRANSP., TRANSPORT+SPP or CLK+TRANSP+SPP","setting":"MIDI Settings > SYNC IN = CLK+TRANSP+SPP (per song)"},"channelSetting":"MIDI Settings > Track MIDI Input: each M8 track has its own CHAN (default track n = channel n), INST#, PG CHANGE and MODE; stored in the song. Wrong Room: M8 track 1 CHAN 4, track 2 CHAN 10, track 3 CHAN 13, PG CHANGE on; tracks 4..8 on a channel nothing sends on, or on 13 in POLY.","channel":{"default":null,"note":"MIDI Settings view: a channel per track 1..8 (default track n = channel n), stored in the song; separate record (9), control-map (10 or ALL) and song-row-cue (11) channels. Tracks on one channel play together: MONO, LEGATO or POLY (round-robin). Wrong Room: three M8 parts on channels 4, 10 and 13 = M8 tracks 1, 2 and 3."},"programChange":{"supported":true,"displayBase":0,"programs":128,"bankFormat":"none","pad":2,"displayHex":true,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"With PG CHANGE on, a PC on a track's channel selects that track's instrument INST 00..7F (hex). PC 0 = INST 00 is the natural reading; unverified. Bank select on receive is not documented."},"controllers":[{"cc":-1,"name":"No fixed CC list: per-song MIDI mappings (any CC on the control-map channel to instrument / mixer / effect / tempo / transpose parameters); CC 64 sustain on track input","min":0,"max":127}],"setup":["MIDI Settings (per song): track 1 CHAN 04, track 2 CHAN 10, track 3 CHAN 13; tracks 4..8 on a channel nothing sends on (or on 13 in POLY to add voices to part 3).","MIDI Settings: PG CHANGE = ON on tracks 1..3 (a PC on the channel selects that track's INST#).","MIDI Settings: SYNC IN = CLK+TRANSP+SPP so the M8 follows Classic Tabby's clock, Start, Stop and Song Position.","Save the song's MIDI settings as the default configuration (MIDI Settings page) so a new M8 song keeps them.","Name the instruments in the song; the rig profile can name INST 00..7F for the editor."],"notes":["Instruments are per-song user content (00..7F hex); no factory names.","Firmware 6.6.3 F (2026-10-20) at research time; manual v6.5.2 (2026-04-21). The 2023 manual's screenshot gives the defaults (track n = channel n, PG CHANGE ON, LEGATO)."],"sources":[{"title":"M8 Operation Manual v6.5.2 (2026-04-21)","url":"https://cdn.shopify.com/s/files/1/0455/0485/6229/files/m8_operation_manual_v20260421.pdf?v=1776791699","detail":"pp. 2, 5, 8, 43-45, 62-65, 91"},{"title":"M8 firmware changelog","url":"https://raw.githubusercontent.com/Dirtywave/M8Firmware/main/changelog.txt","detail":"2.5.0 sustain, 2.7.0 bank MSB on send, 2.7.3 and 6.5.2 program change"}],"unverified":["channel.default","programChange.displayBase (PC n = INST n is not spelled out)","bank select on receive","whether a track's CHAN can be off (the manual lists 1..16)","CCs on the track channel beyond CC 64 and pitch bend"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"emu-proteus-2-xr","name":"E-MU Proteus/2 XR","maker":"E-mu Systems","kind":"instrument","firmware":"Proteus operation manual with the 1992 MIDI addendum (revision 4, 1992-03-04); no later document","midiIn":{"connector":"5-pin DIN in, out and thru (thru is an exact copy of in)","trs":null,"note":"Standard DIN cable. In this rig: H4MIDI WC MIDI OUT 2 with a filter passing channels 5..8 only, merged with the second controller from MIDI IN 2."},"clock":{"receives":false,"syncs":"nothing: the manual has no MIDI clock and no realtime messages","setting":""},"channelSetting":"Master > MIDI MODE = Multi; Master > MIDI ENABLE channel 05..08 On and every channel you do not use Off; Master > PRESET CHANGE 05..08 On; on the main screen cursor to the channel number, dial C05..C08 and the preset for each.","channel":{"default":null,"note":"Multi mode: each of the 16 channels has its own preset; set MIDI ENABLE and PRESET CHANGE on per channel. Wrong Room: channels 5..8 are Classic Tabby's parts 1..4; every other channel the Proteus hears belongs to the second controller."},"programChange":{"supported":true,"displayBase":0,"programs":128,"bankFormat":"none","pad":3,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Presets are shown 000..383 (XR). MIDI reaches 0..127 directly; presets 128..383 only through the device's MIDI PROG>PRESET map, which maps an incoming program 0..127 to any preset. Enter such presets as the mapped program number."},"controllers":[{"cc":7,"name":"Volume","min":0,"max":127},{"cc":10,"name":"Pan","min":0,"max":127,"values":{"0":"hard left","64":"centre","127":"hard right"}},{"cc":1,"name":"Realtime controller A (default assignment)","min":0,"max":127},{"cc":2,"name":"Realtime controller B (default assignment)","min":0,"max":127},{"cc":3,"name":"Realtime controller C (default assignment)","min":0,"max":127},{"cc":4,"name":"Realtime controller D (default assignment)","min":0,"max":127},{"cc":64,"name":"Footswitch 1 (default; sustain if the preset routes it)","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":65,"name":"Footswitch 2 (default)","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":66,"name":"Footswitch 3 (default)","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":121,"name":"Reset all controllers","min":0,"max":0},{"cc":123,"name":"All notes off","min":0,"max":0}],"setup":["Master menu: MIDI MODE = Multi.","Per channel the song addresses (5..8): MIDI ENABLE on and PRESET CHANGE on; MIDI ENABLE off on every channel that is neither yours nor the second controller's.","Feed the Proteus from H4MIDI WC MIDI OUT 2 (filter: channels 5..8 only from MIDI IN 1; MIDI IN 2 unfiltered), so the second controller's channels never meet Classic Tabby's.","Master menu MIDI PROG>PRESET: identity for presets 0..127; map a program number to each preset above 127 the song needs (no bank select exists).","Leave the Edit menu before playing: program changes are ignored inside it.","Run SEND SETUP before PLAY: the manual asks for setup messages before the song starts."],"notes":["Factory list from the operation manual pp. 92-93 (192 presets 0..191; XR ROM 256..383 repeats the ROM set). User presets 64..127 (and XR RAM 0..255) carry whatever you stored; names here are the factory ones.","The manual: do not send setup information just before the first beat (timing errors)."],"sources":[{"title":"E-mu Proteus operation manual (family manual with the 1992 MIDI addendum)","url":"https://archive.org/download/synthmanual-e-mu-proteus-owners-manual/e-muproteusownersmanual.pdf","detail":"pp. 14, 18-21, 69, 92-93, 118-124 (PDF page = printed + 2)"},{"title":"synthmania Proteus/2 page (secondary, text preset list)","url":"https://www.synthmania.com/proteus-2.htm","detail":"cross-check of names 000..190"}],"unverified":["channel.default","programChange.note:factory state of the program map on a reset unit"],"presets":[{"bank":null,"program":0,"number":0,"name":"Solo Cello"},{"bank":null,"program":1,"number":1,"name":"Solo Viola"},{"bank":null,"program":2,"number":2,"name":"Solo Violin"},{"bank":null,"program":3,"number":3,"name":"Quartet"},{"bank":null,"program":4,"number":4,"name":"Solo Chamber"},{"bank":null,"program":5,"number":5,"name":"Arco Basses"},{"bank":null,"program":6,"number":6,"name":"Arco Celli"},{"bank":null,"program":7,"number":7,"name":"Arco Violas"},{"bank":null,"program":8,"number":8,"name":"Arco Violins"},{"bank":null,"program":9,"number":9,"name":"Marcato 1"},{"bank":null,"program":10,"number":10,"name":"Marcato 2"},{"bank":null,"program":11,"number":11,"name":"Legato Str"},{"bank":null,"program":12,"number":12,"name":"Concerto"},{"bank":null,"program":13,"number":13,"name":"Pizz Basses"},{"bank":null,"program":14,"number":14,"name":"Pizz Celli"},{"bank":null,"program":15,"number":15,"name":"Pizz Violas"},{"bank":null,"program":16,"number":16,"name":"Pizz Violins"},{"bank":null,"program":17,"number":17,"name":"Pizzicato 1"},{"bank":null,"program":18,"number":18,"name":"Pizzicato 2"},{"bank":null,"program":19,"number":19,"name":"Trem Strings"},{"bank":null,"program":20,"number":20,"name":"Tremulus"},{"bank":null,"program":21,"number":21,"name":"Strgs/Flutes"},{"bank":null,"program":22,"number":22,"name":"Resting Pad"},{"bank":null,"program":23,"number":23,"name":"Divertimento"},{"bank":null,"program":24,"number":24,"name":"Flute"},{"bank":null,"program":25,"number":25,"name":"Piccolo"},{"bank":null,"program":26,"number":26,"name":"Oboe"},{"bank":null,"program":27,"number":27,"name":"English Horn"},{"bank":null,"program":28,"number":28,"name":"Clarinet"},{"bank":null,"program":29,"number":29,"name":"Bass Clarinet"},{"bank":null,"program":30,"number":30,"name":"Bassoon"},{"bank":null,"program":31,"number":31,"name":"Contrbassoon"},{"bank":null,"program":32,"number":32,"name":"Chamber Winds"},{"bank":null,"program":33,"number":33,"name":"Section Winds"},{"bank":null,"program":34,"number":34,"name":"Epilogue"},{"bank":null,"program":35,"number":35,"name":"Wind Stack"},{"bank":null,"program":36,"number":36,"name":"French Horn 1"},{"bank":null,"program":37,"number":37,"name":"French Horn 2"},{"bank":null,"program":38,"number":38,"name":"Section Horns"},{"bank":null,"program":39,"number":39,"name":"Trumpet 1"},{"bank":null,"program":40,"number":40,"name":"Trumpet 2"},{"bank":null,"program":41,"number":41,"name":"Two Trumpets"},{"bank":null,"program":42,"number":42,"name":"Harmon Mute"},{"bank":null,"program":43,"number":43,"name":"Trombone 1"},{"bank":null,"program":44,"number":44,"name":"Trombone 2"},{"bank":null,"program":45,"number":45,"name":"Tuba"},{"bank":null,"program":46,"number":46,"name":"Back Brass"},{"bank":null,"program":47,"number":47,"name":"Bright Brass"},{"bank":null,"program":48,"number":48,"name":"Chamber Brass"},{"bank":null,"program":49,"number":49,"name":"BrassStrings"},{"bank":null,"program":50,"number":50,"name":"Timpani"},{"bank":null,"program":51,"number":51,"name":"Gong/Cymbal"},{"bank":null,"program":52,"number":52,"name":"Bass/Snare"},{"bank":null,"program":53,"number":53,"name":"Temple Block"},{"bank":null,"program":54,"number":54,"name":"Xylophone"},{"bank":null,"program":55,"number":55,"name":"Glockenspiel"},{"bank":null,"program":56,"number":56,"name":"Celesta"},{"bank":null,"program":57,"number":57,"name":"Tubular Bells"},{"bank":null,"program":58,"number":58,"name":"Percussion 1"},{"bank":null,"program":59,"number":59,"name":"Percussion 2"},{"bank":null,"program":60,"number":60,"name":"Harp"},{"bank":null,"program":61,"number":61,"name":"Harpstrings"},{"bank":null,"program":62,"number":62,"name":"Harpsikord"},{"bank":null,"program":63,"number":63,"name":"Notre Dame"},{"bank":null,"program":64,"number":64,"name":"Winter Signs"},{"bank":null,"program":65,"number":65,"name":"Deep Pad"},{"bank":null,"program":66,"number":66,"name":"Portamento/F"},{"bank":null,"program":67,"number":67,"name":"Bell Ensemble"},{"bank":null,"program":68,"number":68,"name":"Cyberspace"},{"bank":null,"program":69,"number":69,"name":"PizzMoogBass"},{"bank":null,"program":70,"number":70,"name":"Marimbala"},{"bank":null,"program":71,"number":71,"name":"Grim Reaper"},{"bank":null,"program":72,"number":72,"name":"Tinker Bell"},{"bank":null,"program":73,"number":73,"name":"Carousel"},{"bank":null,"program":74,"number":74,"name":"Exotic Harp"},{"bank":null,"program":75,"number":75,"name":"Darn Saucers"},{"bank":null,"program":76,"number":76,"name":"Bronze Pad"},{"bank":null,"program":77,"number":77,"name":"Vibraphone"},{"bank":null,"program":78,"number":78,"name":"Astral Flute"},{"bank":null,"program":79,"number":79,"name":"Kool Bass"},{"bank":null,"program":80,"number":80,"name":"Sombre Winds"},{"bank":null,"program":81,"number":81,"name":"Space Cowboy"},{"bank":null,"program":82,"number":82,"name":"The Machine"},{"bank":null,"program":83,"number":83,"name":"Early Perc"},{"bank":null,"program":84,"number":84,"name":"Gently Now"},{"bank":null,"program":85,"number":85,"name":"Piccolodeeyo"},{"bank":null,"program":86,"number":86,"name":"Infinite One"},{"bank":null,"program":87,"number":87,"name":"ShimmerWays"},{"bank":null,"program":88,"number":88,"name":"Turbo Bass"},{"bank":null,"program":89,"number":89,"name":"Requiem"},{"bank":null,"program":90,"number":90,"name":"Wrong Room"},{"bank":null,"program":91,"number":91,"name":"Analog Pad"},{"bank":null,"program":92,"number":92,"name":"Chapel Organ"},{"bank":null,"program":93,"number":93,"name":"Electrovocal"},{"bank":null,"program":94,"number":94,"name":"Fat Boy Tuba"},{"bank":null,"program":95,"number":95,"name":"SawBass/Lead"},{"bank":null,"program":96,"number":96,"name":"Vienna Dream"},{"bank":null,"program":97,"number":97,"name":"Vertigo Pad"},{"bank":null,"program":98,"number":98,"name":"Tarkus Twin"},{"bank":null,"program":99,"number":99,"name":"RoomOfStrings"},{"bank":null,"program":100,"number":100,"name":"Magic Bells"},{"bank":null,"program":101,"number":101,"name":"Reginatron"},{"bank":null,"program":102,"number":102,"name":"Sub It!"},{"bank":null,"program":103,"number":103,"name":"Psychlotron"},{"bank":null,"program":104,"number":104,"name":"CloudChamber"},{"bank":null,"program":105,"number":105,"name":"Sepulcher"},{"bank":null,"program":106,"number":106,"name":"Lurch Pluck"},{"bank":null,"program":107,"number":107,"name":"Pizz/Piccolo"},{"bank":null,"program":108,"number":108,"name":"Vampirical"},{"bank":null,"program":109,"number":109,"name":"String Thing"},{"bank":null,"program":110,"number":110,"name":"Galapagos"},{"bank":null,"program":111,"number":111,"name":"Square One"},{"bank":null,"program":112,"number":112,"name":"Square Link"},{"bank":null,"program":113,"number":113,"name":"<*>"},{"bank":null,"program":114,"number":114,"name":"Sardonicus"},{"bank":null,"program":115,"number":115,"name":"Master Tron"},{"bank":null,"program":116,"number":116,"name":"Lo Wind Inst"},{"bank":null,"program":117,"number":117,"name":"Sympathetic"},{"bank":null,"program":118,"number":118,"name":"Wind Chimes"},{"bank":null,"program":119,"number":119,"name":"Boat Haus"},{"bank":null,"program":120,"number":120,"name":"Glitter God"},{"bank":null,"program":121,"number":121,"name":"Story Bass"},{"bank":null,"program":122,"number":122,"name":"Nice Night"},{"bank":null,"program":123,"number":123,"name":"Prophet Lead"},{"bank":null,"program":124,"number":124,"name":"Prophet Link"},{"bank":null,"program":125,"number":125,"name":"Whistl'n Joe"},{"bank":null,"program":126,"number":126,"name":"Link2Shimmer"},{"bank":null,"program":127,"number":127,"name":"Ascending"},{"bank":null,"program":null,"number":128,"name":"Harpsomatic"},{"bank":null,"program":null,"number":129,"name":"Phaedra"},{"bank":null,"program":null,"number":130,"name":"Cimbalon"},{"bank":null,"program":null,"number":131,"name":"Recorder"},{"bank":null,"program":null,"number":132,"name":"Koto"},{"bank":null,"program":null,"number":133,"name":"Dream Garden"},{"bank":null,"program":null,"number":134,"name":"Amplify Bass"},{"bank":null,"program":null,"number":135,"name":"Asian Reed"},{"bank":null,"program":null,"number":136,"name":"Soft Harp"},{"bank":null,"program":null,"number":137,"name":"Jazz Bass"},{"bank":null,"program":null,"number":138,"name":"Grandfather"},{"bank":null,"program":null,"number":139,"name":"Classic Gtr"},{"bank":null,"program":null,"number":140,"name":"Temple Bell"},{"bank":null,"program":null,"number":141,"name":"StrHarmonic"},{"bank":null,"program":null,"number":142,"name":"Cellophane"},{"bank":null,"program":null,"number":143,"name":"Gamba Musik"},{"bank":null,"program":null,"number":144,"name":"Quintoctave"},{"bank":null,"program":null,"number":145,"name":"Basses&Vios"},{"bank":null,"program":null,"number":146,"name":"Violin&Celli"},{"bank":null,"program":null,"number":147,"name":"ArcoViolins"},{"bank":null,"program":null,"number":148,"name":"Arco Duet"},{"bank":null,"program":null,"number":149,"name":"Str Section"},{"bank":null,"program":null,"number":150,"name":"Arco Strings"},{"bank":null,"program":null,"number":151,"name":"In The Pit"},{"bank":null,"program":null,"number":152,"name":"<<InThePit<<"},{"bank":null,"program":null,"number":153,"name":"Rotary Chmbr"},{"bank":null,"program":null,"number":154,"name":"Krummhorns"},{"bank":null,"program":null,"number":155,"name":"C.Bsn/Dbl Bs"},{"bank":null,"program":null,"number":156,"name":"Soft Flute"},{"bank":null,"program":null,"number":157,"name":"Hi Wind Solo"},{"bank":null,"program":null,"number":158,"name":"Verb Clarinet"},{"bank":null,"program":null,"number":159,"name":"PiccoloPeace"},{"bank":null,"program":null,"number":160,"name":"Flute/Oboe"},{"bank":null,"program":null,"number":161,"name":"Clar./Flute"},{"bank":null,"program":null,"number":162,"name":"Clar/Bassoon"},{"bank":null,"program":null,"number":163,"name":"Double Reeds"},{"bank":null,"program":null,"number":164,"name":"Bassoon/Horn"},{"bank":null,"program":null,"number":165,"name":"Alto Flute"},{"bank":null,"program":null,"number":166,"name":"WindEnsemble"},{"bank":null,"program":null,"number":167,"name":"DblReeds/Hrn"},{"bank":null,"program":null,"number":168,"name":"Verb Horn"},{"bank":null,"program":null,"number":169,"name":"Xprsv Cornet"},{"bank":null,"program":null,"number":170,"name":"Bone&Trumpet"},{"bank":null,"program":null,"number":171,"name":"Bone&Tuba"},{"bank":null,"program":null,"number":172,"name":"Trombones"},{"bank":null,"program":null,"number":173,"name":"Sfz Brass"},{"bank":null,"program":null,"number":174,"name":"Horn Vel+Wh"},{"bank":null,"program":null,"number":175,"name":"Afroblocks"},{"bank":null,"program":null,"number":176,"name":"Timba Mallet"},{"bank":null,"program":null,"number":177,"name":"Timp w/Tone"},{"bank":null,"program":null,"number":178,"name":"Bass Drum"},{"bank":null,"program":null,"number":179,"name":"TimpLowBlock"},{"bank":null,"program":null,"number":180,"name":"Deep Drum"},{"bank":null,"program":null,"number":181,"name":"Triangle"},{"bank":null,"program":null,"number":182,"name":"Big Log"},{"bank":null,"program":null,"number":183,"name":"Gamelan"},{"bank":null,"program":null,"number":184,"name":"Clarinet/Bb"},{"bank":null,"program":null,"number":185,"name":"Clarinet/A"},{"bank":null,"program":null,"number":186,"name":"BassClar/Bb"},{"bank":null,"program":null,"number":187,"name":"EngHorn/F"},{"bank":null,"program":null,"number":188,"name":"FrenchHorn/F"},{"bank":null,"program":null,"number":189,"name":"Trumpet/Bb"},{"bank":null,"program":null,"number":190,"name":"Trumpet/D"},{"bank":null,"program":null,"number":191,"name":"Default"}]},{"schema":"tabby-device/1","version":"0.2","id":"eventide-h90","name":"Eventide H90 Harmonizer","maker":"Eventide","kind":"effect","firmware":"H90 1.12.5 (2025-12-18) and its manual v1.12.5; no newer release found on 2026-11-05","midiIn":{"connector":"5-pin DIN in, DIN out/thru, USB-C (MIDI over USB); the TRS jacks are EXP/CTL only","trs":null,"note":"Standard DIN cable from the Thru5 WC."},"clock":{"receives":true,"syncs":"the tempo (delays, modulation rates): Tempo Menu > Tempo Source = MIDI Clock","setting":"Tempo Menu (hold Presets + Parameters) > Tempo Source = MIDI Clock; System > MIDI > Clock Source = DIN or USB"},"channelSetting":"System Menu (hold Programs + Routing) > MIDI > Channel = 15 (receive and transmit) or Receive Omni.","channel":{"default":15,"note":"One channel for receive and transmit, or Receive Omni (System > MIDI). The default value is not stated in the manual; 15 is this rig's setting."},"programChange":{"supported":true,"displayBase":1,"programs":99,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"PC selects a Program in the current Playlist (a User List of up to 99). With PC Offset 0 (default) PC n loads Program n as displayed (1-based; PC 0 is not used); with PC Offset 1, PC 0 loads Program 1: set this definition's displayBase to 0 then. No bank select; banks of three are reached only by Bank Up / Down CC functions."},"controllers":[{"cc":-1,"name":"No default CC map: assign CC numbers per function in System > MIDI > Global Control (Load, Increment, Decrement, Bank Up/Down, Tuner, Tap Tempo, P/A/B active-bypass toggle or momentary, Insert 1/2, HotSwitch 1-3, Perform 1-6, Quick Knobs 1-6, HotKnob, In/Out gain, Mix) and enter them in the rig profile","min":0,"max":127}],"setup":["System > MIDI: channel 15 (or Receive Omni).","System > MIDI: PC Offset 0 keeps PC n = Program n as displayed; if you use PC Offset 1, set displayBase 0 in the rig.","Make the User List you play from the Playlist: program numbers in the song refer to its order.","Assign CC numbers for bypass / HotSwitch / tap in Global Control and enter them in the rig profile.","Tempo Menu > Tempo Source = MIDI Clock and System > MIDI > Clock Source = DIN, so delays follow Classic Tabby's clock.","A CC sent right after a PC is ignored on 1.9.x (Eventide staff, March 2025: 'not addressed'; no later release note says fixed, 1.12.5 included): keep this device's gap after the program change."],"notes":["Program names are per user (the Playlist is user-arranged): name the 99 slots in the rig profile.","A PC loads the whole Program (both A and B); presets A/B are not selectable by MIDI."],"sources":[{"title":"H90 User Guide v1.12.5, 7.4 MIDI (channel, Receive Omni, PC Offset, Output Mode, Clock Source)","url":"https://cdn.eventideaudio.com/manuals/h90/1.12.5/content/system-menu/midi.html","detail":"read 2026-11-05"},{"title":"H90 User Guide v1.12.5, Appendix C global mapping chart (no default CC map; toggle at >= 64)","url":"https://cdn.eventideaudio.com/manuals/h90/1.12.5/content/appendix/global.html","detail":""},{"title":"H90 User Guide v1.12.5, Tempo Menu (Tempo Source = MIDI Clock) and Tech Specs (DIN in, DIN out/thru, USB-C)","url":"https://cdn.eventideaudio.com/manuals/h90/1.12.5/content/tempo-menu.html","detail":"also .../appendix/specifications.html"},{"title":"Eventide staff: PC n loads Program n, no bank select, Lists not selectable by MIDI","url":"https://www.eventideaudio.com/?p=189216","detail":"March 2025"},{"title":"Eventide staff on the CC-after-PC bug: not addressed in 1.9.11","url":"https://www.eventideaudio.com/forums/topic/v1-9-11-release-notes/","detail":"March 2025; 1.12.5 notes do not mention it"},{"title":"H90 release 1.12.5 announcement","url":"https://www.eventideaudio.com/forums/topic/h90-software-latest-h90-release-1-12-5/","detail":"2025-12-18"}],"unverified":["channel.default (the manual gives none)","programChange.gapMs:no manufacturer figure; the CC-after-PC bug's fix status in 1.12.5","wire PC 99 / 100 with PC Offset off","MIDI Start / Stop handling","USB carries PC/CC (manual says only 'receive MIDI over USB')"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"instruo-seashell","name":"Instruo Seashell","maker":"Instruo","kind":"instrument","firmware":"Seashell firmware 1.0.3 (the firmware page's latest; no date given); Seashell Controller 1.0.0; firmware 2.0 announced (secondary), not released","midiIn":{"connector":"3.5 mm TRS type A MIDI in (the included adaptor) and class-compliant USB-C audio + MIDI; input only","trs":"A","note":"DIN-to-TRS type A adapter from the Thru5 WC."},"clock":{"receives":false,"syncs":"nothing: no MIDI clock; the only sync is the analogue Gate/Trig input (Tap Tempo menu)","setting":""},"channelSetting":"Seashell Controller app > Settings > MIDI Channel Menu = 1 (saved automatically since 1.0.3).","channel":{"default":null,"note":"Set in the Seashell Controller software (Settings > MIDI Channel). TRS type A MIDI in and class-compliant USB-C. Default and omni not documented. Wrong Room: channel 1."},"programChange":{"supported":"unverified","displayBase":0,"programs":0,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Not supported in the published firmware 1.0.x (presets are files of the Controller app). Firmware 2.0 (announced, not on Instruo's site) is said to add 120 preset slots selected by program change; numbering and bank scheme unknown."},"controllers":[{"cc":-1,"name":"No fixed CC map: parameters are assigned by MIDI Learn in the Controller app; any CC 0..127 can be a modulation-matrix source","min":0,"max":127}],"setup":["Seashell Controller: Settings > MIDI Channel = 1.","Map the parameters you want to drive with MIDI Learn (the mapping is yours; enter the CC numbers in the rig profile).","No program change in firmware 1.0.3: a song can only send CCs you learnt; keep an eye on firmware 2.0 (120 preset slots by program change, announced)."],"notes":["No preset names published.","Secondary: a user-made default CC map exists (Electra One preset); not a factory assignment."],"sources":[{"title":"Seashell user manual (2025, firmware 1.0.0): TRS type A in, USB-C, MIDI Channel Menu, MIDI Learn, no clock","url":"https://instruomodular.com/wp-content/uploads/manuals/Seashell%20Manual.pdf","detail":"pp. 4, 11, 45, 49-50, 55; reread 2026-11-05"},{"title":"Instruo firmware page (1.0.3 notes: revised MIDI stack, channel saved automatically)","url":"https://www.instruomodular.com/firmware/","detail":""},{"title":"SonicState report on firmware 2.0 (secondary)","url":"https://sonicstate.com/news/2026/10/26/beijing-26-instruo-seashell-v20/","detail":"120 slots, program change"}],"unverified":["channel.default","programChange.supported","programChange.programs","any CC assignment","timing"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"korg-volca-fm2","name":"Korg volca fm2","maker":"Korg","kind":"instrument","midiIn":{"connector":"3.5 mm TRS type A in and out, no USB","trs":"A","note":""},"clock":{"receives":true,"syncs":"the sequencer and arpeggiator (chart: clock, start, stop, song position)","setting":"none needed"},"channel":{"default":null,"note":"Hold MEMORY at power-on and press key 1..16; memorised. Mode 3 (omni off). TRS MIDI in/out, no USB. Factory default not stated."},"programChange":{"supported":false,"displayBase":0,"programs":64,"bankFormat":"none","pad":2,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Program change is neither received nor transmitted (chart); the 64 programs are selected on the panel or by SysEx dump. A program event targeted at this device does nothing."},"controllers":[{"cc":40,"name":"Octave (TRANSPS NOTE off) / Transpose (on)","min":0,"max":127,"values":{"0":"-3 oct","55":"0","110":"+3 oct"}},{"cc":41,"name":"Velocity","min":0,"max":127},{"cc":42,"name":"Modulator Attack","min":0,"max":127,"values":{"64":"0"}},{"cc":43,"name":"Modulator Decay","min":0,"max":127,"values":{"64":"0"}},{"cc":44,"name":"Carrier Attack","min":0,"max":127,"values":{"64":"0"}},{"cc":45,"name":"Carrier Decay","min":0,"max":127,"values":{"64":"0"}},{"cc":46,"name":"LFO Rate","min":0,"max":127},{"cc":47,"name":"LFO Pitch Depth","min":0,"max":127},{"cc":48,"name":"Algorithm","min":0,"max":127,"values":{"0":"1","127":"32"}},{"cc":49,"name":"Arp Type","min":0,"max":127,"values":{"0":"off","13":"rise 1","26":"rise 2","39":"rise 3","52":"fall 1","58":"fall 2","74":"fall 3","90":"random 1","103":"random 2","116":"random 3"}},{"cc":50,"name":"Arp Division","min":0,"max":127,"values":{"0":"1/12","12":"1/8","24":"1/4","36":"1/3","47":"1/2","59":"2/3","70":"1/1","82":"3/2","94":"2/1","105":"3/1","117":"4/1"}},{"cc":64,"name":"Sustain (firmware 1.10+)","min":0,"max":127},{"cc":91,"name":"Reverb Depth","min":0,"max":127},{"cc":93,"name":"Chorus Depth","min":0,"max":127},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Set the MIDI channel (hold MEMORY at power-on, key 1..16).","Global parameter 7 MIDI ShortMessage = on (factory default), or no channel message is received.","Program change is not received: only CC events reach this device."],"notes":["No factory program names are published; names live in the SysEx dump only."],"sources":[{"title":"volca fm2 MIDI Implementation Chart (2021-10-27, v1.0)","url":"https://cdn.korg.com/us/support/download/files/38bf877e063858210403554ec502efac.pdf","detail":"Program Change: not recognised"},{"title":"volca fm2 MIDI Implementation (text, rev 1.00, 2022-11-17)","url":"https://cdn.korg.com/us/support/download/files/b0ec4b721695a217d1ecaa248a93ab78.txt","detail":"2-1 channel messages and footnotes"},{"title":"volca fm2 owner's manual (2024-11-07)","url":"https://cdn.korg.com/us/support/download/files/fd37180c39c87b20df510643347ee119.pdf","detail":"p. 3 MIDI channel, global parameters"},{"title":"volca fm2 system updater 1.12 release notes (CC 64 in 1.10)","url":"https://www.korg.com/us/support/download/software/0/892/4964/","detail":""}],"unverified":["channel.default","panel program numbering (0..63 or 1..64)","CC 64 semantics"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"mvave-fm1-melodee","name":"M-VAVE FM-1 (Melodee firmware)","maker":"M-VAVE (firmware: Melodee by keremimo, GPL-3.0)","kind":"instrument","firmware":"Melodee 1.6.1 (2026-11-02); no newer tag on 2026-11-05","midiIn":{"connector":"USB class-compliant MIDI in/out, a 3.5 mm TRS MIDI in (input only) and BLE MIDI","trs":null,"note":"TRS type not stated. In this rig the unit sits on its own H4MIDI WC port (USB host through the hub) with a filter passing only its channel, because Melodee listens on a block of four channels."},"clock":{"receives":true,"syncs":"the sequencer: clock, Start, Continue, Stop and Song Position from the chosen input","setting":"GLO > GLOBAL > CLK = USB or TRS (the port Classic Tabby arrives on)"},"channelSetting":"GLO > SYSTEM > ROUT = CH1-4 behind an H4MIDI WC port filter that passes only the unit's channel: channel 2 then plays the unit's track 2 (FM-1 A), channel 3 its track 3 (FM-1 B). There is no per-track input channel.","channel":{"default":null,"note":"GLO > SYSTEM > ROUT = CH1-4 / CH5-8 / CH9-12 / CH13-16 (four consecutive channels on tracks 1..4) or SEL (every channel plays the selected track); DRUM channel OFF / 1..16 (default 10); MIDI-track engines have an output channel only. USB class-compliant, TRS input, BLE MIDI. Wrong Room: behind an H4MIDI channel filter, ROUT = CH1-4."},"programChange":{"supported":false,"displayBase":0,"programs":0,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Melodee 1.6.1 has no program change handler (0xCn is only forwarded to MIDI-only tracks for output); sounds are selected on the panel. The optional MIDI KNOBS profile turns the PRESETS encoder with CC 18 (GENERAL) or CC 76 (MINILAB), a knob emulation, not a PC. A program event targeted at this device does nothing."},"controllers":[{"cc":1,"name":"Mod wheel (selected track)","min":0,"max":127},{"cc":5,"name":"Glide","min":0,"max":127},{"cc":7,"name":"Track level","min":0,"max":127},{"cc":10,"name":"Pan","min":0,"max":127},{"cc":64,"name":"Sustain","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":71,"name":"Engine macro (resonance)","min":0,"max":127},{"cc":72,"name":"Release","min":0,"max":127},{"cc":73,"name":"Attack","min":0,"max":127},{"cc":74,"name":"Engine macro (brightness / cutoff)","min":0,"max":127},{"cc":75,"name":"Decay","min":0,"max":127},{"cc":120,"name":"All Sound Off","min":0,"max":0},{"cc":121,"name":"Reset All Controllers","min":0,"max":0},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Load Melodee (web installer); GLO > SYSTEM > ROUT = CH1-4; the unit's H4MIDI WC port filtered to its channel (2 or 3), so only that channel reaches it and plays its track 2 or 3.","GLO > GLOBAL > CLK = USB (or TRS) so the unit follows Classic Tabby's clock, Start and Stop; its own clock out is silent then.","No program change: only CC events reach this device."],"notes":["Melodee 1.6.1 (2026-11-02) at research time; a modified Felucca. FM6 ROM voices: TINE EP, BRASS SECT, SOLID BASS, BELLS, MARIMBA, CLAVINET, DRAWBARS, STRINGS, GLASS PAD, SYNC LEAD, HARP, KALIMBA, FLUTE, STEEL DRUM, SAW BASS, TUBULAR (not selectable by MIDI).","1.6.1 adds clock out on USB and BLE with CLK = INT (not tried with gear by its author); irrelevant here, Classic Tabby is the master."],"sources":[{"title":"Melodee release 1.6.1 (2026-11-02)","url":"https://github.com/keremimo/melodee/releases/tag/v1.6.1","detail":"clock and transport, MIDI tracks"},{"title":"Melodee repository README (ROUT, DRUM, clock, USB)","url":"https://github.com/keremimo/melodee","detail":"HEAD 165d177, read 2026-11-05"},{"title":"Melodee manual, MIDI section","url":"https://keremimo.github.io/melodee/webapp/manual/","detail":"ROUT, DRUM channel, CC list, MIDI KNOBS, MIDI LEARN"},{"title":"Melodee source: firmware/src/midi_control.c (midi_event: no 0xCn handler)","url":"https://github.com/keremimo/melodee/blob/main/firmware/src/midi_control.c","detail":"code read, not hardware-verified"}],"unverified":["channel.default","behaviour on hardware (code read only)","TRS jack type","whether a nightly adds program change"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"mvave-fm1-orange-cat","name":"M-VAVE FM-1 (Orange Cat firmware)","maker":"M-VAVE (firmware: Orange Cat, in development)","kind":"instrument","firmware":"Orange Cat source read at ~/oc-ui 7e7bf40 (2026-11-05); no version string in the sources, no published MIDI document","midiIn":{"connector":"USB class-compliant MIDI (the device enumerates as 'Orange Cat FM-1') and the FM-1's 3.5 mm TRS MIDI in","trs":null,"note":"TRS type not stated. In this rig the unit sits on its own H4MIDI WC port (USB host through the hub) with a filter passing only its channel, because Orange Cat listens on a block of four channels."},"clock":{"receives":"unverified","syncs":"the sequencer when CLOCK is USB or TRS (settings list INT / USB / TRS; behaviour read from the source only)","setting":"GLO > CLOCK = USB or TRS"},"channelSetting":"GLO > SYSTEM > ROUT = CH1-4 behind an H4MIDI WC port filter that passes only the unit's channel: channel 2 then plays the unit's track 2 (FM-1 A), channel 3 its track 3 (FM-1 B). No per-track input channel exists (a cross-project item for Orange Cat, BUILD.md left-to-build).","channel":{"default":null,"note":"GLO > SYSTEM > ROUT = CH1-4 / SEL / CH5-8 / CH9-12 / CH13-16: a block of four consecutive channels plays tracks 1..4 in order (the DRUM channel, default 10, overrides within the block), SEL makes every channel play the selected track. Read from the source (seq.c midi_track). Wrong Room: behind an H4MIDI channel filter, ROUT = CH1-4."},"programChange":{"supported":false,"displayBase":0,"programs":0,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"No program change handler in the source (midi_event dispatches notes, bend, CC and channel pressure only). A program event targeted at this device does nothing."},"controllers":[{"cc":1,"name":"Mod wheel","min":0,"max":127},{"cc":5,"name":"Glide","min":0,"max":127},{"cc":7,"name":"Level","min":0,"max":127},{"cc":10,"name":"Pan","min":0,"max":127},{"cc":12,"name":"DUB TAPE feedback","min":0,"max":127},{"cc":13,"name":"DUB TAPE send","min":0,"max":127},{"cc":14,"name":"DUB TAPE tone","min":0,"max":127},{"cc":15,"name":"DUB TAPE space","min":0,"max":127},{"cc":16,"name":"DUB TAPE throw","min":0,"max":127},{"cc":17,"name":"DUB TAPE cut","min":0,"max":127},{"cc":18,"name":"DUB TAPE kick","min":0,"max":127},{"cc":64,"name":"Sustain","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":71,"name":"Engine macro (resonance / morph by engine)","min":0,"max":127},{"cc":72,"name":"Release","min":0,"max":127},{"cc":73,"name":"Attack","min":0,"max":127},{"cc":74,"name":"Engine macro (cutoff / timbre by engine)","min":0,"max":127},{"cc":75,"name":"Decay","min":0,"max":127},{"cc":91,"name":"Reverb send","min":0,"max":127},{"cc":93,"name":"Chorus send","min":0,"max":127},{"cc":94,"name":"Delay send","min":0,"max":127},{"cc":104,"name":"Distortion","min":0,"max":127},{"cc":120,"name":"All Sound Off","min":0,"max":0},{"cc":121,"name":"Reset All Controllers","min":0,"max":0},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Load the Orange Cat firmware; GLO > SYSTEM > ROUT = CH1-4; the unit's H4MIDI WC port filtered to its channel (2 or 3), so only that channel reaches it and plays its track 2 or 3.","GLO > CLOCK = USB (or TRS) if the unit should follow Classic Tabby's clock (behaviour read from the source only).","No program change: only CC events reach this device."],"notes":["Facts read from the Orange Cat source (firmware/src/midi_control.c, seq.c midi_track, params.c N_ROUTE / N_CLOCK) at ~/oc-ui 7e7bf40 on 2026-11-05; nothing is copied from it. Not verified on hardware.","Cross-project item (BUILD.md left-to-build): a per-track input channel with OFF, as Skiff 2.2 has, would let an Orange Cat unit take one channel without a filter."],"sources":[{"title":"Orange Cat FM-1 firmware source (local checkout ~/oc-ui, 7e7bf40): firmware/src/midi_control.c, seq.c, params.c","url":"","detail":"read 2026-11-05; the project publishes no MIDI implementation document"}],"unverified":["everything on hardware (code read only)","clock receive","TRS jack type","the firmware version string"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"mvave-fm1-skiff","name":"M-VAVE FM-1 (Skiff firmware)","maker":"M-VAVE (firmware: Skiff by illuminus5, GPL-3.0)","kind":"instrument","firmware":"Skiff 2.2 (2026-11-03); the online manual still describes the 1.3-era MIDI menu","midiIn":{"connector":"USB class-compliant MIDI in/out and a 3.5 mm TRS MIDI in on the FM-1","trs":null,"note":"TRS type not stated by Skiff or M-VAVE. In this rig a Skiff unit can take its channel directly (T1 CHANNEL = its channel, T2..T6 OFF) on any port; the H4MIDI filter is not needed but harmless."},"clock":{"receives":true,"syncs":"the sequencer: Clock, Start, Continue, Stop and (2.2) Song Position from the chosen input","setting":"MENU > MIDI > CLOCK = USB or TRS (the port Classic Tabby arrives on); CLOCK OUT off"},"channelSetting":"MENU > MIDI > T1 CHANNEL = the unit's channel (2 for FM-1 A, 3 for FM-1 B), T2..T6 CHANNEL = OFF (2.2); MIDI IN shows TRACK. Older firmware: give T2..T6 channels nothing sends on.","channel":{"default":null,"note":"MENU > MIDI: T1..T6 CHANNEL = 1..16, OFF or CH n EXT per track (2.2); a channel no track is on is ignored entirely; two tracks on one channel: the first plays it; MIDI IN = SEL makes every channel play the selected track; AUTO CHANNEL (2.2) plays the selected track from one extra channel. Wrong Room: FM-1 A channel 2, FM-1 B channel 3."},"programChange":{"supported":true,"displayBase":0,"programs":148,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Skiff 1.3+ (2.2 unchanged): a PC on a track's channel loads that track's engine's factory sound number n, counted from 0 (the PRESETS list order, aliases skipped; 0 on an FM6 track = TINE EP); a program past the engine's last preset is ignored, not wrapped; user sounds are not reachable; the load happens in the main loop after the message. No bank select (CC 0 / CC 32 ignored). The number means a different sound per engine, so name presets per engine in the rig profile."},"controllers":[{"cc":1,"name":"Mod wheel (MOD source)","min":0,"max":127},{"cc":5,"name":"Glide","min":0,"max":127},{"cc":7,"name":"Level","min":0,"max":127},{"cc":10,"name":"Pan","min":0,"max":127},{"cc":11,"name":"Expression (MOD source)","min":0,"max":127},{"cc":64,"name":"Sustain","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":71,"name":"Engine resonance (ANALOG / TRIO / NOISE)","min":0,"max":127},{"cc":72,"name":"Release","min":0,"max":127},{"cc":73,"name":"Attack","min":0,"max":127},{"cc":74,"name":"Engine brightness (cutoff / DCW / tone / FM6 modulator level)","min":0,"max":127},{"cc":75,"name":"Decay","min":0,"max":127},{"cc":91,"name":"Reverb send","min":0,"max":127},{"cc":93,"name":"Chorus send","min":0,"max":127},{"cc":94,"name":"Delay send","min":0,"max":127},{"cc":120,"name":"All Sound Off","min":0,"max":0},{"cc":121,"name":"Reset All Controllers","min":0,"max":0},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Load Skiff 2.2 (web installer); MENU > MIDI > T1 CHANNEL = the unit's channel (2 or 3), T2..T6 CHANNEL = OFF.","MENU > MIDI > CLOCK = USB or TRS (where Classic Tabby arrives) so the unit follows clock, Start and Stop; CLOCK OUT = off (Classic Tabby is the master).","Program numbers count the track's engine's factory presets from 0: set track 1's engine first.","A PC is applied by the main loop after the message: keep a small gap before the notes (no published figure).","No H4MIDI filter is needed for a Skiff unit; one is harmless."],"notes":["148 factory sounds over 14 engines (per-engine order in firmware/src/engines.c); no complete published name list, so presets are named in the rig profile.","Skiff 2.2 (2026-11-03) at research time: adds T CHANNEL OFF and CH n EXT, AUTO CHANNEL, NOTES OUT, CC OUT, THRU, REMOTE (CC 102..115 on its own channel press the panel buttons), CLOCK OUT, Song Position in."],"sources":[{"title":"Skiff release 2.2 (2026-11-03): release notes","url":"https://github.com/illuminus5/skiff/releases/tag/v2.2","detail":"OFF / EXT, AUTO CHANNEL, CLOCK OUT, REMOTE, Song Position"},{"title":"Skiff README: MENU > MIDI and the MIDI implementation (CC map, clock, program change)","url":"https://github.com/illuminus5/skiff#readme","detail":"commit db2ce89, read 2026-11-05"},{"title":"Skiff manual, chapter 19 MIDI (1.3-era text)","url":"https://illuminus5.github.io/skiff/learn/","detail":"program change counted from 0, CC table, MIDI LEARN"},{"title":"Skiff source: firmware/src/midi_control.c (midi_event drops unmapped channels), seq.c (midi_slot), ui.c (midi_pc_load), midi_clock.c","url":"https://github.com/illuminus5/skiff/blob/main/firmware/src/midi_control.c","detail":"PC per track, no bank select"}],"unverified":["channel.default","per-engine preset order and names","PC latency on hardware","TRS jack type (A or B)","the 2.2 items the author lists as not yet tried on a unit"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"smk37-fm6-internal","name":"SMK-37 FM6 internal engine","maker":"M-VAVE SMK-37 Pro running Classic Tabby","kind":"internal","firmware":"Classic Tabby (this workbench's version)","midiIn":{"connector":"none: the internal engine of the SMK-37 itself, not a MIDI device","trs":null,"note":"A Tabby track plays the engine when its SEQ setting (SEQ page 6/7 MIDI TRACK, K3) is LOCAL or BOTH. Set the pinned track to LOCAL so nothing leaves on this channel."},"clock":{"receives":false,"syncs":"the SMK-37 is the clock master","setting":""},"channelSetting":"A convention: channel 9 parts land on the pinned Tabby track (track 8 in the Wrong Room profile); on the device, once, SEQ page 6/7: track 8 K3 SEQ = LOCAL.","channel":{"default":9,"note":"Convention only: no external device listens on it. The importer puts a part on this channel on the pinned Tabby track whatever its file order and writes OUT CH 9; with SEQ = LOCAL on that track nothing is sent."},"programChange":{"supported":false,"displayBase":0,"programs":0,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Row events never reach the internal engine (SPEC 8): the sound of the pinned track is the project's. A program event on this channel does nothing inside and, with SEQ = LOCAL, leaves on no port."},"controllers":[],"setup":["On the device, once: SEQ page 6/7 MIDI TRACK, select track 8, K3 SEQ = LOCAL (BOTH would also send the part on channel 9 to every port).","Give track 8 the sound you want in the project (SHIFT + HOME, SAVE) and save the project.","In the file, the FM6 part is the track on channel 9; its program changes and CCs are ignored."],"notes":["The engine is per Tabby track, not per channel: any track with SEQ LOCAL or BOTH sounds inside. The channel-9 convention and the track pin make an imported part land on the FM6 without hand work.","FM6 preview timing is one audio block looser than MIDI out (SPEC 9.6)."],"sources":[{"title":"Classic Tabby SPEC.md sections 6, 8 and 9 (song notes follow the SEQ setting; events never reach the internal engine)","url":"https://github.com/SeattleUser0/classic-tabby/blob/classic-tabby/linux-build/docs/SPEC.md","detail":"app/midi_router.c groove_midi_song_note"}],"unverified":[],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"strymon-nightsky","name":"Strymon NightSky","maker":"Strymon","kind":"effect","firmware":"NightSky firmware 1.07 (March 2021); user manual Rev F (2021-09-17)","midiIn":{"connector":"5-pin DIN MIDI IN and OUT, USB mini; optionally the 1/4 inch EXP jack in MIDI mode (Strymon MIDI EXP cable, tip active with an opto-isolator in the cable)","trs":null,"note":"Use the DIN MIDI IN from the Thru5 WC: no EXP-jack setting needed. Third-party DIN-to-TRS cables do not work on the EXP jack. Set TRS MIDI Output to OFF when only receiving."},"clock":{"receives":true,"syncs":"the sequencer tempo only (no delay or pre-delay sync), enabled per preset","setting":"Live Edit: hold PRESET BUTTONS 1 and 4, turn SPEED to green (RESPOND TO MIDI CLOCK), or CC 63 = 127; save the preset"},"channelSetting":"Power-up mode: hold INFINITE while connecting power, release when the footswitch LEDs light, turn SPEED until the ON LED blinks blue, send a program change on channel 14, press INFINITE to store. One FAQ says the 4..16 option needs a 1/4 inch MIDI connection to set; the manual does not: if the DIN path does not latch it, set it once over the EXP jack.","channel":{"default":1,"note":"Default 1; 1..16 (1..3 by LED colour, 4..16 by the next program change received while blinking blue). Wrong Room: 14."},"programChange":{"supported":true,"displayBase":0,"programs":128,"bankFormat":"hundreds","pad":0,"programsTotal":300,"bankSelect":{"scheme":"cc0","banks":[{"index":0,"name":"0..127","msb":0,"lsb":null},{"index":1,"name":"128..255","msb":1,"lsb":null},{"index":2,"name":"256..299","msb":2,"lsb":null}]},"gapMs":0,"gapAfter":"program","note":"300 presets shown 0..299: CC 0 (bank select MSB) = preset div 128, PC = preset mod 128. The pedal powers up in bank 0, so send CC 0 before every program change. Bank 0 PC 127 is Manual mode, not a preset (bank 2 holds 256..299 only). The 16 front-panel presets 1..16 are bank 0 PC 0..15. Nothing to enable. CC 32 is not mentioned by Strymon."},"controllers":[{"cc":0,"name":"Bank select","min":0,"max":2},{"cc":11,"name":"Mix: reverb level","min":0,"max":127},{"cc":12,"name":"Mix: dry level","min":0,"max":127},{"cc":13,"name":"Mod speed","min":0,"max":127},{"cc":14,"name":"Mod target","min":0,"max":2,"values":{"0":"verb","1":"pitch","2":"filter"}},{"cc":15,"name":"Mod depth","min":0,"max":127},{"cc":16,"name":"Mod shape","min":0,"max":5,"values":{"0":"triangle","1":"square","2":"ramp","3":"saw","4":"random","5":"envelope"}},{"cc":17,"name":"Decay: pre-delay","min":0,"max":127},{"cc":18,"name":"Decay: length","min":0,"max":127},{"cc":19,"name":"Decay: texture","min":0,"max":2,"values":{"0":"sparse","1":"dense","2":"diffuse"}},{"cc":20,"name":"Decay: size / pitch","min":0,"max":127},{"cc":21,"name":"Decay: quantize","min":0,"max":2,"values":{"0":"smooth","1":"half step","2":"scale"}},{"cc":22,"name":"Tone: low cut","min":0,"max":127},{"cc":23,"name":"Tone: high cut","min":0,"max":127},{"cc":24,"name":"Tone: filter","min":0,"max":1,"values":{"0":"regen","1":"lowpass"}},{"cc":25,"name":"Tone: lowpass Q","min":0,"max":127},{"cc":26,"name":"Voice: interval","min":0,"max":25,"values":{"0":"-octave","5":"-P5","7":"-P4","12":"-detune","13":"+detune","18":"+P4","20":"+P5","25":"+octave"}},{"cc":27,"name":"Voice: scale","min":0,"max":7,"values":{"0":"minor pentatonic","1":"major pentatonic","2":"major","3":"dorian","4":"minor blues","5":"harmonic minor","6":"whole tone","7":"diminished"}},{"cc":28,"name":"Voice: shimmer source","min":0,"max":1,"values":{"0":"input","1":"regen"}},{"cc":29,"name":"Voice: shimmer level","min":0,"max":127},{"cc":30,"name":"Voice: glimmer","min":0,"max":2,"values":{"0":"off","1":"high","2":"low"}},{"cc":31,"name":"Voice: glimmer gain","min":0,"max":127},{"cc":33,"name":"Voice: drive","min":0,"max":2,"values":{"0":"off","1":"pre","2":"post"}},{"cc":34,"name":"Voice: drive level","min":0,"max":127},{"cc":35,"name":"Freeze","min":0,"max":127,"values":{"0":"off","1":"on"}},{"cc":36,"name":"Morph","min":0,"max":127,"values":{"0":"off","1":"on"}},{"cc":37,"name":"Morph speed","min":0,"max":127},{"cc":41,"name":"Sequence mode","min":0,"max":127,"values":{"0":"preset","1":"sequence"}},{"cc":42,"name":"Sequencer step 1 on","min":0,"max":127,"values":{"0":"off","1":"on"}},{"cc":43,"name":"Sequencer step 2 on","min":0,"max":127},{"cc":44,"name":"Sequencer step 3 on","min":0,"max":127},{"cc":45,"name":"Sequencer step 4 on","min":0,"max":127},{"cc":46,"name":"Sequencer step 5 on","min":0,"max":127},{"cc":47,"name":"Sequencer step 6 on","min":0,"max":127},{"cc":48,"name":"Sequencer step 7 on","min":0,"max":127},{"cc":49,"name":"Sequencer step 8 on","min":0,"max":127},{"cc":50,"name":"Sequencer step 1 size","min":0,"max":127},{"cc":51,"name":"Sequencer step 2 size","min":0,"max":127},{"cc":52,"name":"Sequencer step 3 size","min":0,"max":127},{"cc":53,"name":"Sequencer step 4 size","min":0,"max":127},{"cc":54,"name":"Sequencer step 5 size","min":0,"max":127},{"cc":55,"name":"Sequencer step 6 size","min":0,"max":127},{"cc":56,"name":"Sequencer step 7 size","min":0,"max":127},{"cc":57,"name":"Sequencer step 8 size","min":0,"max":127},{"cc":58,"name":"Sequence glide","min":0,"max":127},{"cc":60,"name":"MIDI expression on/off","min":0,"max":127,"values":{"0":"off","1":"on"}},{"cc":63,"name":"MIDI clock on/off","min":0,"max":127,"values":{"0":"off","1":"on"}},{"cc":80,"name":"Footswitch ON","min":0,"max":127,"values":{"0":"release","1":"press"}},{"cc":81,"name":"Footswitch FAVORITE","min":0,"max":127,"values":{"0":"release","1":"press"}},{"cc":82,"name":"Footswitch INFINITE","min":0,"max":127,"values":{"0":"release","1":"press"}},{"cc":83,"name":"Persist","min":0,"max":127,"values":{"0":"off","1":"on"}},{"cc":93,"name":"Sequence tap","min":0,"max":127},{"cc":100,"name":"Expression pedal (MIDI expression on)","min":0,"max":127},{"cc":102,"name":"Bypass / on","min":0,"max":127,"values":{"0":"bypass","1":"on"}}],"setup":["DIN cable from the Thru5 WC into MIDI IN; leave the EXP jack in its default (expression) mode; TRS MIDI Output = OFF; DIN MIDI Thru at its default.","Channel 14: hold INFINITE while powering, release when the footswitch LEDs light, turn SPEED until the ON LED blinks blue, send a program change on channel 14 (SEND SETUP works), press INFINITE to store. If the DIN path does not latch it, do it once over the EXP jack in MIDI mode.","Presets: the song sends CC 0 = bank then PC; the pedal powers up in bank 0. Never call bank 0 PC 127 (Manual mode).","Clock: for each preset that should sync its sequencer, hold PRESET BUTTONS 1 and 4, turn SPEED to green, and save the preset (or CC 63 = 127 in the song's row events)."],"notes":["Only the sequencer syncs to clock; delay and pre-delay times do not. Start/Stop handling is not documented.","Firmware 1.07 (March 2021) is current; updated over USB with Strymon Update.","The TRS MIDI Output default and its knob name differ between the manual and the FAQs; set it to OFF explicitly."],"sources":[{"title":"NightSky User Manual Rev F (2021-09-17): rear panel, MIDI channel, presets and banks, CC table, clock, power-up modes","url":"https://www.strymon.net/manuals/Nightsky_UserManual_RevF.pdf","detail":"pp. 14-15, 19, 26, 28-31, 36-39, 41"},{"title":"Strymon FAQ: How can I control NightSky with MIDI?","url":"https://www.strymon.net/faq/how-can-i-control-nightsky-with-midi/","detail":"DIN, USB, EXP jack, channel 4..16 by the next PC"},{"title":"Strymon FAQ: Save and recall presets (CC 0 banks 0..2, PC 0..127, Manual mode at 127)","url":"https://www.strymon.net/faq/how-do-you-save-and-recall-presets-on-nightsky/","detail":""},{"title":"Strymon FAQ: sync the sequencer to MIDI clock (per preset; only the sequencer)","url":"https://www.strymon.net/faq/how-to-sync-the-nightsky-sequencer-to-midi-clock/","detail":""},{"title":"Strymon firmware release notes (1.07)","url":"https://www.strymon.net/faq/nightsky-firmware-revision-release-notes/","detail":""},{"title":"Strymon staff on the TRS MIDI scheme (tip in, ring out, opto in the cable)","url":"https://www.strymon.net/midi-control-sunset-riverside/","detail":"2018-2025 comments"}],"unverified":["USB class compliance","MIDI Start / Stop handling","preset load time","whether the DIN path latches channels 4..16 (FAQ against manual)","TRS MIDI Output default","CC 32"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"tone-king-royalist","name":"Tone King Royalist Preamp","maker":"Tone King (Synergy platform)","kind":"effect","firmware":"manual FINAL 01 19 2026 (uploads of 2026-02 and 2026-11); Synergy Editor App 8.9.6; no firmware version published","midiIn":{"connector":"5-pin DIN MIDI IN only (no out, no thru); USB-C for the Synergy Editor App, firmware updates and USB audio","trs":null,"note":"Standard DIN cable from the Thru5 WC; last in a chain or on its own Thru5 port."},"clock":{"receives":false,"syncs":"nothing (a preamp)","setting":""},"channelSetting":"Synergy Editor App over USB-C: MIDI CHANNEL = 11 (default OMNI). No panel procedure exists. In OMNI the pedal takes every program change on the chain.","channel":{"default":null,"note":"Default OMNI (all channels); set only in the Synergy Editor App. Wrong Room: 11, set in the editor before the pedal joins the chain. The range is not printed (1..16 plus OMNI presumed)."},"programChange":{"supported":true,"displayBase":0,"programs":128,"bankFormat":"none","pad":0,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"128 presets; the sibling Imperial manual numbers them 0..127, the Royalist manual says '128 storable MIDI PROGRAM CHANGES' (0- or 1-based display unverified). A preset stores channel, master bypass, IR selection and bypass, loop bypass, reverb bypass and tails. Store from the pedal: select the preset by PC, set the state, long-press REVERB + CHANNEL. No bank select, nothing to enable."},"controllers":[{"cc":24,"name":"Select channel (SYN-20IR map, unverified for the Royalist)","min":0,"max":2},{"cc":25,"name":"Select structure (SYN-20IR map, unverified)","min":0,"max":2},{"cc":27,"name":"IR bypass (SYN-20IR map, unverified)","min":0,"max":127,"values":{"0":"off","1":"toggle","127":"on"}},{"cc":28,"name":"Select IR (SYN-20IR map, unverified)","min":0,"max":3},{"cc":29,"name":"Lowpass level (SYN-20IR map, unverified)","min":0,"max":2},{"cc":30,"name":"Highpass level (SYN-20IR map, unverified)","min":0,"max":2}],"setup":["Synergy Editor App (USB-C): MIDI CHANNEL = 11; STORE.","Synergy Editor App: open the MIDI CC LIST tab, read the Royalist's own CC numbers and correct this definition (the numbers here are the SYN-20IR sibling's, unverified).","Store the presets the song calls: send PC n, set channel / IR / loop / reverb, long-press REVERB + CHANNEL.","DIN cable from the Thru5 WC into MIDI IN; the pedal has no thru."],"notes":["The Royalist MKIII head and combo have no MIDI; this is the Royalist Preamp pedal (Synergy platform, sibling of the Imperial Preamp and the SYN-20IR).","The CC list is published only inside the editor's MIDI CC LIST tab; the manual does not print it.","Firmware updates run automatically from the Synergy Editor App; old editors can no longer connect."],"sources":[{"title":"Tone King Royalist Preamp instruction manual (FINAL 01 19 2026): connections, MIDI IN OMNI default, editor MIDI CHANNEL, 128 program changes, MIDI STORE, MIDI CC LIST","url":"https://www.toneking.com/wp-content/uploads/2026/11/TONE-KING-ROYALIST-PREAMP-INSTRUCTION-MANUAL-BOOKLET-FINAL-01-19-2026.pdf","detail":"pp. 4, 6, 7, 9, 10"},{"title":"Tone King Royalist Preamp product page (128 presets via MIDI, Synergy Editor App 8.9.6, firmware update notes)","url":"https://www.toneking.com/shop/pedals/tone-king-royalist-preamp/","detail":""},{"title":"Tone King Imperial Preamp manual (sibling, secondary): program changes 0-127","url":"https://www.toneking.com/wp-content/uploads/2026/11/TONE-KING-IMPERIAL-PREAMP-WEB.pdf","detail":"secondary"},{"title":"Synergy SYN-20IR manual (same platform, secondary): CC 24, 25, 27, 28, 29, 30","url":"https://www.synergyamps.com/wp-content/uploads/2025/02/SYNERGY-SYN-20IR-MANUAL-FINAL-2-13-2025.pdf","detail":"secondary; the Royalist's own list is in the editor"}],"unverified":["every CC number (SYN-20IR sibling map until read from the editor's MIDI CC LIST)","MIDI channel range and whether 11 is selectable","0- or 1-based preset display","preset change latency","CC acceptance in OMNI","firmware version"],"presets":[]},{"schema":"tabby-device/1","version":"0.2","id":"waldorf-blofeld","name":"Waldorf Blofeld","maker":"Waldorf","kind":"instrument","midiIn":{"connector":"5-pin DIN in and USB (Desktop: no MIDI out)","trs":null,"note":""},"clock":{"receives":"unverified","syncs":"arpeggiator and LFO sync per the manual's sync settings (not researched for this rig)","setting":""},"channel":{"default":null,"note":"Global MIDI Channel (omni, 1..16). In Multi mode each of 16 parts has its own channel and a 'Prg Change' receive filter."},"programChange":{"supported":true,"displayBase":1,"programs":128,"bankFormat":"letter","pad":3,"bankSelect":{"scheme":"cc32","banks":[{"index":0,"name":"A","msb":null,"lsb":0},{"index":1,"name":"B","msb":null,"lsb":1},{"index":2,"name":"C","msb":null,"lsb":2},{"index":3,"name":"D","msb":null,"lsb":3},{"index":4,"name":"E","msb":null,"lsb":4},{"index":5,"name":"F","msb":null,"lsb":5},{"index":6,"name":"G","msb":null,"lsb":6},{"index":7,"name":"H","msb":null,"lsb":7}]},"gapMs":0,"gapAfter":"program","note":"Display A001..H128. CC 32 = 0..7 selects bank A..H (manual table; CC 0 'not used'; the OS 1.15 notes say CC 0 and CC 32 are interchangeable). 128 Multi programs are selected with CC 0 = 127 then PC on the global channel, only when already in Multi mode (secondary)."},"controllers":[{"cc":1,"name":"Modulation Wheel","min":0,"max":127},{"cc":2,"name":"Breath Control","min":0,"max":127},{"cc":4,"name":"Foot Control","min":0,"max":127},{"cc":5,"name":"Glide Rate","min":0,"max":127},{"cc":7,"name":"Channel Volume","min":0,"max":127},{"cc":10,"name":"Pan","min":0,"max":127,"values":{"0":"L64","64":"centre","127":"R63"}},{"cc":12,"name":"Arp Range","min":0,"max":9,"values":{"0":"1 octave","9":"10 octaves"}},{"cc":13,"name":"Arp Length","min":0,"max":15,"values":{"0":"1 step","15":"16 steps"}},{"cc":14,"name":"Arp Active","min":0,"max":3,"values":{"0":"off","1":"on","2":"one shot","3":"hold"}},{"cc":15,"name":"LFO 1 Shape","min":0,"max":5,"values":{"0":"sine","1":"triangle","2":"square","3":"sawtooth","4":"random","5":"S&H"}},{"cc":16,"name":"LFO 1 Speed","min":0,"max":127},{"cc":17,"name":"LFO 1 Sync","min":0,"max":1,"values":{"0":"off","1":"on"}},{"cc":18,"name":"LFO 1 Delay","min":0,"max":127},{"cc":19,"name":"LFO 2 Shape","min":0,"max":5},{"cc":20,"name":"LFO 2 Speed","min":0,"max":127},{"cc":21,"name":"LFO 2 Sync","min":0,"max":1},{"cc":22,"name":"LFO 2 Delay","min":0,"max":127},{"cc":23,"name":"LFO 3 Shape","min":0,"max":5},{"cc":24,"name":"LFO 3 Speed","min":0,"max":127},{"cc":25,"name":"LFO 3 Sync","min":0,"max":1},{"cc":26,"name":"LFO 3 Delay","min":0,"max":127},{"cc":27,"name":"Osc 1 Octave","min":16,"max":112,"values":{"16":"128'","112":"1/2'"}},{"cc":28,"name":"Osc 1 Semitone","min":52,"max":76,"values":{"52":"-12","64":"0","76":"+12"}},{"cc":29,"name":"Osc 1 Detune","min":0,"max":127},{"cc":30,"name":"Osc 1 FM","min":0,"max":127},{"cc":31,"name":"Osc 1 Shape","min":0,"max":5,"values":{"0":"pulse","1":"saw","2":"triangle","3":"sine","4":"alt 1","5":"alt 2"}},{"cc":33,"name":"Osc 1 PW","min":0,"max":127},{"cc":34,"name":"Osc 1 PWM","min":0,"max":127},{"cc":35,"name":"Osc 2 Octave","min":16,"max":112},{"cc":36,"name":"Osc 2 Semitone","min":52,"max":76},{"cc":37,"name":"Osc 2 Detune","min":0,"max":127},{"cc":38,"name":"Osc 2 FM","min":0,"max":127},{"cc":39,"name":"Osc 2 Shape","min":0,"max":5},{"cc":40,"name":"Osc 2 PW","min":0,"max":127},{"cc":41,"name":"Osc 2 PWM","min":0,"max":127},{"cc":42,"name":"Osc 3 Octave","min":16,"max":112},{"cc":43,"name":"Osc 3 Semitone","min":52,"max":76},{"cc":44,"name":"Osc 3 Detune","min":0,"max":127},{"cc":45,"name":"Osc 3 FM","min":0,"max":127},{"cc":46,"name":"Osc 3 Shape","min":0,"max":5},{"cc":47,"name":"Osc 3 PW","min":0,"max":127},{"cc":48,"name":"Osc 3 PWM","min":0,"max":127},{"cc":49,"name":"Sync","min":0,"max":1},{"cc":50,"name":"Pitchmod","min":0,"max":127},{"cc":51,"name":"Glide Mode","min":0,"max":9},{"cc":52,"name":"Osc 1 Level","min":0,"max":127},{"cc":53,"name":"Osc 1 Balance","min":0,"max":127},{"cc":54,"name":"Ringmod Level","min":0,"max":127},{"cc":55,"name":"Ringmod Balance","min":0,"max":127},{"cc":56,"name":"Osc 2 Level","min":0,"max":127},{"cc":57,"name":"Osc 2 Balance","min":0,"max":127},{"cc":58,"name":"Osc 3 Level","min":0,"max":127},{"cc":59,"name":"Osc 3 Balance","min":0,"max":127},{"cc":60,"name":"Noise Level","min":0,"max":127},{"cc":61,"name":"Noise Balance","min":0,"max":127},{"cc":62,"name":"Noise Colour","min":0,"max":127},{"cc":64,"name":"Sustain Pedal","min":0,"max":127,"values":{"0":"off","64":"on"}},{"cc":65,"name":"Glide Active","min":0,"max":127},{"cc":66,"name":"Sostenuto","min":0,"max":127},{"cc":67,"name":"Routing","min":0,"max":1,"values":{"0":"serial","1":"parallel"}},{"cc":68,"name":"Filter 1 Type","min":0,"max":10},{"cc":69,"name":"Filter 1 Cutoff","min":0,"max":127},{"cc":70,"name":"Filter 1 Resonance","min":0,"max":127},{"cc":71,"name":"Filter 1 Drive","min":0,"max":127},{"cc":72,"name":"Filter 1 Keytrack","min":0,"max":127},{"cc":73,"name":"Filter 1 Env Amount","min":0,"max":127},{"cc":74,"name":"Filter 1 Env Velocity","min":0,"max":127},{"cc":75,"name":"Filter 1 Cutoff Mod","min":0,"max":127},{"cc":76,"name":"Filter 1 FM","min":0,"max":127},{"cc":77,"name":"Filter 1 Pan","min":0,"max":127},{"cc":78,"name":"Filter 1 Pan Mod","min":0,"max":127},{"cc":79,"name":"Filter 2 Type","min":0,"max":10},{"cc":80,"name":"Filter 2 Cutoff","min":0,"max":127},{"cc":81,"name":"Filter 2 Resonance","min":0,"max":127},{"cc":82,"name":"Filter 2 Drive","min":0,"max":127},{"cc":83,"name":"Filter 2 Keytrack","min":0,"max":127},{"cc":84,"name":"Filter 2 Env Amount","min":0,"max":127},{"cc":85,"name":"Filter 2 Env Velocity","min":0,"max":127},{"cc":86,"name":"Filter 2 Cutoff Mod","min":0,"max":127},{"cc":87,"name":"Filter 2 FM","min":0,"max":127},{"cc":88,"name":"Filter 2 Pan","min":0,"max":127},{"cc":89,"name":"Filter 2 Pan Mod","min":0,"max":127},{"cc":90,"name":"Amp Volume","min":0,"max":127},{"cc":91,"name":"Amp Velocity","min":0,"max":127},{"cc":92,"name":"Amp Mod","min":0,"max":127},{"cc":93,"name":"FX 1 Mix","min":0,"max":127},{"cc":94,"name":"FX 2 Mix","min":0,"max":127},{"cc":95,"name":"Filter Env Attack","min":0,"max":127},{"cc":96,"name":"Filter Env Decay","min":0,"max":127},{"cc":97,"name":"Filter Env Sustain","min":0,"max":127},{"cc":98,"name":"Filter Env Decay 2","min":0,"max":127},{"cc":99,"name":"Filter Env Sustain 2","min":0,"max":127},{"cc":100,"name":"Filter Env Release","min":0,"max":127},{"cc":101,"name":"Amp Env Attack","min":0,"max":127},{"cc":102,"name":"Amp Env Decay","min":0,"max":127},{"cc":103,"name":"Amp Env Sustain","min":0,"max":127},{"cc":104,"name":"Amp Env Decay 2","min":0,"max":127},{"cc":105,"name":"Amp Env Sustain 2","min":0,"max":127},{"cc":106,"name":"Amp Env Release","min":0,"max":127},{"cc":107,"name":"Env 3 Attack","min":0,"max":127},{"cc":108,"name":"Env 3 Decay","min":0,"max":127},{"cc":109,"name":"Env 3 Sustain","min":0,"max":127},{"cc":110,"name":"Env 3 Decay 2","min":0,"max":127},{"cc":111,"name":"Env 3 Sustain 2","min":0,"max":127},{"cc":112,"name":"Env 3 Release","min":0,"max":127},{"cc":113,"name":"Env 4 Attack","min":0,"max":127},{"cc":114,"name":"Env 4 Decay","min":0,"max":127},{"cc":115,"name":"Env 4 Sustain","min":0,"max":127},{"cc":116,"name":"Env 4 Decay 2","min":0,"max":127},{"cc":117,"name":"Env 4 Sustain 2","min":0,"max":127},{"cc":118,"name":"Env 4 Release","min":0,"max":127},{"cc":120,"name":"All Sound Off","min":0,"max":0},{"cc":121,"name":"Reset All Controllers","min":0,"max":0},{"cc":122,"name":"Local Control","min":0,"max":127},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Global: MIDI Channel (or per-part channel in Multi mode with the part's Prg Change filter set to receive).","Global: Ctrl Receive = on, or no control change changes a parameter.","Avoid channel 10 in Multi mode (Waldorf FAQ: can cause crashes).","Allow a gap after a program change (OS notes: fast program changes can be missed)."],"notes":["Factory names from Waldorf's 2012 factory sound set (SNDD dumps, 16-character names); 2008 set differs.","Secondary: after switching a Multi, wait before selecting the parts' programs; an editor uses 800 ms."],"sources":[{"title":"Blofeld User's Manual, revision 1.1 (January 2009)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/32zdTsdYcRSX9eE","detail":"pp. 18, 24-28, 82-85, 113-117, 122"},{"title":"Blofeld factory sounds 2012 (name list and SNDD dumps)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/fi4DWR7G2aXnWQ3","detail":"Blo Factory 2012.txt, Sysex/factory 2012 A..H.syx"},{"title":"Blofeld SysEx specification, release 1.04","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/ybExJgT4TzqT8ir","detail":"SNDD layout, name at 363..378"},{"title":"Waldorf OS 1.15 notes as re-posted (secondary)","url":"https://www.elektronauts.com/t/digitakt-blofeld-multi-mode-midi/51291/20","detail":"CC 0 / CC 32 interchangeable, Multi selection, timing"}],"unverified":["channel.default","programChange.gapMs:no manufacturer figure","Multi selection by CC 0 = 127","CC 0 acceptance on OS 1.25"],"presets":[{"bank":0,"program":0,"name":"Start Up       T"},{"bank":0,"program":1,"name":"70s Pad        T"},{"bank":0,"program":2,"name":"Tschingeling SCD"},{"bank":0,"program":3,"name":"XT Close     SCD"},{"bank":0,"program":4,"name":"Digital JP4  SCD"},{"bank":0,"program":5,"name":"BloChoir       T"},{"bank":0,"program":6,"name":"Sync Different T"},{"bank":0,"program":7,"name":"TearsFromCombSCD"},{"bank":0,"program":8,"name":"Click Bass     T"},{"bank":0,"program":9,"name":"Myst 6         T"},{"bank":0,"program":10,"name":"Sander Lead    T"},{"bank":0,"program":11,"name":"Bladerunner    T"},{"bank":0,"program":12,"name":"BloStrings     T"},{"bank":0,"program":13,"name":"ArpDelayLFO? SCD"},{"bank":0,"program":14,"name":"Dahlbeck Bass  T"},{"bank":0,"program":15,"name":"CopiedByLargo  T"},{"bank":0,"program":16,"name":"JustResonanceSCD"},{"bank":0,"program":17,"name":"IntensiveCareSCD"},{"bank":0,"program":18,"name":"Planet Ice     T"},{"bank":0,"program":19,"name":"Pad Brown      T"},{"bank":0,"program":20,"name":"Rasenflaeche   T"},{"bank":0,"program":21,"name":"PWM<->SWM    SCD"},{"bank":0,"program":22,"name":"SuperPulse   SCD"},{"bank":0,"program":23,"name":"Eyes Wide Open T"},{"bank":0,"program":24,"name":"BriteWhitePad  T"},{"bank":0,"program":25,"name":"Chronos        T"},{"bank":0,"program":26,"name":"Ambientity     T"},{"bank":0,"program":27,"name":"Lothlorien     T"},{"bank":0,"program":28,"name":"Boelissimo     T"},{"bank":0,"program":29,"name":"Inglorious Pad T"},{"bank":0,"program":30,"name":"PitchShifter SCD"},{"bank":0,"program":31,"name":"X-File Pad     T"},{"bank":0,"program":32,"name":"AmbienTable    T"},{"bank":0,"program":33,"name":"ShortWave      T"},{"bank":0,"program":34,"name":"CS100          T"},{"bank":0,"program":35,"name":"Slightly Pad   T"},{"bank":0,"program":36,"name":"FlyingDutchman T"},{"bank":0,"program":37,"name":"BoelesBrass SCD"},{"bank":0,"program":38,"name":"Phase 5        T"},{"bank":0,"program":39,"name":"RingCon        T"},{"bank":0,"program":40,"name":"LeadING        T"},{"bank":0,"program":41,"name":"Chord Hose     T"},{"bank":0,"program":42,"name":"Chordalis      T"},{"bank":0,"program":43,"name":"Deadmau5 Chord T"},{"bank":0,"program":44,"name":"JigSaw         T"},{"bank":0,"program":45,"name":"Fat Pig        T"},{"bank":0,"program":46,"name":"Leadgut        T"},{"bank":0,"program":47,"name":"Crying Lead    T"},{"bank":0,"program":48,"name":"AggLead        T"},{"bank":0,"program":49,"name":"Overdrive      T"},{"bank":0,"program":50,"name":"Lead Keen      T"},{"bank":0,"program":51,"name":"Van Doorn      T"},{"bank":0,"program":52,"name":"Gummi Lead     T"},{"bank":0,"program":53,"name":"Static Leads   T"},{"bank":0,"program":54,"name":"Sync By FM   SCD"},{"bank":0,"program":55,"name":"Enganged       T"},{"bank":0,"program":56,"name":"Hummer         T"},{"bank":0,"program":57,"name":"Old School     T"},{"bank":0,"program":58,"name":"Handjob        T"},{"bank":0,"program":59,"name":"Slipping Lead  T"},{"bank":0,"program":60,"name":"Glidelis     SCD"},{"bank":0,"program":61,"name":"Rave On        T"},{"bank":0,"program":62,"name":"SynChaos       T"},{"bank":0,"program":63,"name":"Airy Lead      T"},{"bank":0,"program":64,"name":"Airy Lead 2    T"},{"bank":0,"program":65,"name":"Tiestofeld   SCD"},{"bank":0,"program":66,"name":"ARPollinaris   T"},{"bank":0,"program":67,"name":"Driving Line   T"},{"bank":0,"program":68,"name":"TD 2010      SCD"},{"bank":0,"program":69,"name":"SawmodulationSCD"},{"bank":0,"program":70,"name":"Bram A.      SCD"},{"bank":0,"program":71,"name":"Laidback     SCD"},{"bank":0,"program":72,"name":"Reseq        SCD"},{"bank":0,"program":73,"name":"S&H Drive    SCD"},{"bank":0,"program":74,"name":"Mouth Arp    SCD"},{"bank":0,"program":75,"name":"ADHD         SCD"},{"bank":0,"program":76,"name":"mARPledust     T"},{"bank":0,"program":77,"name":"305 Bassline   T"},{"bank":0,"program":78,"name":"WArpeggiator   T"},{"bank":0,"program":79,"name":"ARPower        T"},{"bank":0,"program":80,"name":"Drumloop       T"},{"bank":0,"program":81,"name":"OnTheRun       T"},{"bank":0,"program":82,"name":"LFO Delay 2  SCD"},{"bank":0,"program":83,"name":"LFOWahDelay  SCD"},{"bank":0,"program":84,"name":"The End      SCD"},{"bank":0,"program":85,"name":"Deadmau5 Bass  T"},{"bank":0,"program":86,"name":"Pulse Drive    T"},{"bank":0,"program":87,"name":"FM Bass        T"},{"bank":0,"program":88,"name":"Oizo Bass      T"},{"bank":0,"program":89,"name":"Pickup Bass    T"},{"bank":0,"program":90,"name":"BassTrap     SCD"},{"bank":0,"program":91,"name":"Wide Bass      T"},{"bank":0,"program":92,"name":"Dirty Bass     T"},{"bank":0,"program":93,"name":"Rev Pulse Bass T"},{"bank":0,"program":94,"name":"C64 Bass       T"},{"bank":0,"program":95,"name":"Tranceptor     T"},{"bank":0,"program":96,"name":"Short Trance   T"},{"bank":0,"program":97,"name":"Sauron Pad     T"},{"bank":0,"program":98,"name":"Ghost On Mars  T"},{"bank":0,"program":99,"name":"ImpulseResp. SCD"},{"bank":0,"program":100,"name":"CombDeBoele  SCD"},{"bank":0,"program":101,"name":"SpaceDigde     T"},{"bank":0,"program":102,"name":"The 1980s      T"},{"bank":0,"program":103,"name":"Pulse3+      SCD"},{"bank":0,"program":104,"name":"Dig. Modular SCD"},{"bank":0,"program":105,"name":"VA*FM        SCD"},{"bank":0,"program":106,"name":"PPGenious    SCD"},{"bank":0,"program":107,"name":"TriangleDanceSCD"},{"bank":0,"program":108,"name":"Wave Voices  SCD"},{"bank":0,"program":109,"name":"Piano E      SCD"},{"bank":0,"program":110,"name":"SimpleSeq    SCD"},{"bank":0,"program":111,"name":"Chopshop3.0  SCD"},{"bank":0,"program":112,"name":"OrganClav      T"},{"bank":0,"program":113,"name":"Wit Licht    SCD"},{"bank":0,"program":114,"name":"Morphorgan     T"},{"bank":0,"program":115,"name":"My Keys      SCD"},{"bank":0,"program":116,"name":"Warning      SCD"},{"bank":0,"program":117,"name":"InYourRoom   SCD"},{"bank":0,"program":118,"name":"Bad Highpass SCD"},{"bank":0,"program":119,"name":"ChildOfMine  SCD"},{"bank":0,"program":120,"name":"2 Cats       SCD"},{"bank":0,"program":121,"name":"PPG 2        SCD"},{"bank":0,"program":122,"name":"FlangerSaw   SCD"},{"bank":0,"program":123,"name":"ChainSaw     SCD"},{"bank":0,"program":124,"name":"BloAttack    SCD"},{"bank":0,"program":125,"name":"Sines        SCD"},{"bank":0,"program":126,"name":"BloodLife    SCD"},{"bank":0,"program":127,"name":"Delerium       T"},{"bank":1,"program":0,"name":"RisePad RL"},{"bank":1,"program":1,"name":"AmbientNodes RL"},{"bank":1,"program":2,"name":"JunoStack RL"},{"bank":1,"program":3,"name":"LayeredBass RL"},{"bank":1,"program":4,"name":"FirstContact RL"},{"bank":1,"program":5,"name":"ElectroKitty RL"},{"bank":1,"program":6,"name":"AnoDomini RL"},{"bank":1,"program":7,"name":"ClubbyOrgan RL"},{"bank":1,"program":8,"name":"DanceChord95 RL"},{"bank":1,"program":9,"name":"RioLargo RL"},{"bank":1,"program":10,"name":"FunkyDisco RL"},{"bank":1,"program":11,"name":"UtopianPad RL"},{"bank":1,"program":12,"name":"HardTrancer RL"},{"bank":1,"program":13,"name":"TechnoChords RL"},{"bank":1,"program":14,"name":"SquareWaver RL"},{"bank":1,"program":15,"name":"ArpBells RL"},{"bank":1,"program":16,"name":"FakeGuitar RL"},{"bank":1,"program":17,"name":"Trance2K RL"},{"bank":1,"program":18,"name":"Hacienda RL"},{"bank":1,"program":19,"name":"BloChoir RL"},{"bank":1,"program":20,"name":"BassNation RL"},{"bank":1,"program":21,"name":"MellowKeys RL"},{"bank":1,"program":22,"name":"TotalTrance RL"},{"bank":1,"program":23,"name":"PianoMan RL"},{"bank":1,"program":24,"name":"FloorBass RL"},{"bank":1,"program":25,"name":"AnotherWorld RL"},{"bank":1,"program":26,"name":"ClockWork RL"},{"bank":1,"program":27,"name":"SuperMario RL"},{"bank":1,"program":28,"name":"ClubDelays RL"},{"bank":1,"program":29,"name":"TronicLead RL"},{"bank":1,"program":30,"name":"FireWire RL"},{"bank":1,"program":31,"name":"DirtyRamirez RL"},{"bank":1,"program":32,"name":"MerlinsPad RL"},{"bank":1,"program":33,"name":"DreamSaw RL"},{"bank":1,"program":34,"name":"CosmicGates RL"},{"bank":1,"program":35,"name":"ElectroPulse RL"},{"bank":1,"program":36,"name":"SquelchBass RL"},{"bank":1,"program":37,"name":"TechnoDawn RL"},{"bank":1,"program":38,"name":"Orchestral RL"},{"bank":1,"program":39,"name":"StarGazer RL"},{"bank":1,"program":40,"name":"PartyLikeAlex RL"},{"bank":1,"program":41,"name":"DanceMaster RL"},{"bank":1,"program":42,"name":"HeavenlyVox RL"},{"bank":1,"program":43,"name":"PartyLead RL"},{"bank":1,"program":44,"name":"HouseClassic RL"},{"bank":1,"program":45,"name":"ClubUK RL"},{"bank":1,"program":46,"name":"TrashBass RL"},{"bank":1,"program":47,"name":"SadStrings RL"},{"bank":1,"program":48,"name":"RezzoPoly RL"},{"bank":1,"program":49,"name":"MrMiles RL"},{"bank":1,"program":50,"name":"SamplerVox RL"},{"bank":1,"program":51,"name":"TunnelPad RL"},{"bank":1,"program":52,"name":"ElectroSaw RL"},{"bank":1,"program":53,"name":"TranceMelody RL"},{"bank":1,"program":54,"name":"DancePizz RL"},{"bank":1,"program":55,"name":"DigitalDance RL"},{"bank":1,"program":56,"name":"SlowingDown RL"},{"bank":1,"program":57,"name":"303AutoGlide RL"},{"bank":1,"program":58,"name":"PhazedOut RL"},{"bank":1,"program":59,"name":"MiniLead RL"},{"bank":1,"program":60,"name":"Neptune RL"},{"bank":1,"program":61,"name":"Back2Detroit RL"},{"bank":1,"program":62,"name":"RetroKeys RL"},{"bank":1,"program":63,"name":"PowerCore RL"},{"bank":1,"program":64,"name":"Infected RL"},{"bank":1,"program":65,"name":"Pikey RL"},{"bank":1,"program":66,"name":"TechnoFX RL"},{"bank":1,"program":67,"name":"AfterDark RL"},{"bank":1,"program":68,"name":"FlangePad RL"},{"bank":1,"program":69,"name":"EuroClassic RL"},{"bank":1,"program":70,"name":"HouseMeUp RL"},{"bank":1,"program":71,"name":"Motivator RL"},{"bank":1,"program":72,"name":"TuffBass RL"},{"bank":1,"program":73,"name":"DarkSweeper RL"},{"bank":1,"program":74,"name":"DeepBlue RL"},{"bank":1,"program":75,"name":"NuElectro RL"},{"bank":1,"program":76,"name":"NiteCrawler RL"},{"bank":1,"program":77,"name":"Time2Groove RL"},{"bank":1,"program":78,"name":"Planetarium RL"},{"bank":1,"program":79,"name":"DiscoBass RL"},{"bank":1,"program":80,"name":"NoseBleeder RL"},{"bank":1,"program":81,"name":"OldSkool RL"},{"bank":1,"program":82,"name":"Slither RL"},{"bank":1,"program":83,"name":"SuperSquare RL"},{"bank":1,"program":84,"name":"RemixKeys RL"},{"bank":1,"program":85,"name":"DangerZone RL"},{"bank":1,"program":86,"name":"SnapAttack RL"},{"bank":1,"program":87,"name":"Pitch&Slide RL"},{"bank":1,"program":88,"name":"LiquidSaws RL"},{"bank":1,"program":89,"name":"Icelandic RL"},{"bank":1,"program":90,"name":"Avatar RL"},{"bank":1,"program":91,"name":"Seduction RL"},{"bank":1,"program":92,"name":"FollowMe RL"},{"bank":1,"program":93,"name":"DutchLead RL"},{"bank":1,"program":94,"name":"ElectricPiano RL"},{"bank":1,"program":95,"name":"WetElectro RL"},{"bank":1,"program":96,"name":"Airwave RL"},{"bank":1,"program":97,"name":"RaveGenerator RL"},{"bank":1,"program":98,"name":"Amnesia RL"},{"bank":1,"program":99,"name":"PlayedLive RL"},{"bank":1,"program":100,"name":"AcidHouse RL"},{"bank":1,"program":101,"name":"TechnoBoy RL"},{"bank":1,"program":102,"name":"ClubRiffer RL"},{"bank":1,"program":103,"name":"TechnoBells RL"},{"bank":1,"program":104,"name":"Evolution  RL"},{"bank":1,"program":105,"name":"DelMar RL"},{"bank":1,"program":106,"name":"HardEdge RL"},{"bank":1,"program":107,"name":"FatPulse RL"},{"bank":1,"program":108,"name":"KnockDelays RL"},{"bank":1,"program":109,"name":"Siberia RL"},{"bank":1,"program":110,"name":"TechnoEric RL"},{"bank":1,"program":111,"name":"DanceClassic RL"},{"bank":1,"program":112,"name":"OffShore44 RL"},{"bank":1,"program":113,"name":"Parisien RL"},{"bank":1,"program":114,"name":"DeepHouse RL"},{"bank":1,"program":115,"name":"MonstaBass RL"},{"bank":1,"program":116,"name":"Ambience RL"},{"bank":1,"program":117,"name":"XTBass RL"},{"bank":1,"program":118,"name":"ModularFX RL"},{"bank":1,"program":119,"name":"Organesque RL"},{"bank":1,"program":120,"name":"PearlDrops RL"},{"bank":1,"program":121,"name":"BattleStar RL"},{"bank":1,"program":122,"name":"AlienBass RL"},{"bank":1,"program":123,"name":"SuperWaves RL"},{"bank":1,"program":124,"name":"Unchartered RL"},{"bank":1,"program":125,"name":"PlanetZod RL"},{"bank":1,"program":126,"name":"Elevation RL"},{"bank":1,"program":127,"name":"BassTrap RL"},{"bank":2,"program":0,"name":"The 1980s      T"},{"bank":2,"program":1,"name":"S1l4g3        CA"},{"bank":2,"program":2,"name":"Dig. Modular SCD"},{"bank":2,"program":3,"name":"Shy T3ddy     CA"},{"bank":2,"program":4,"name":"PPGenious    SCD"},{"bank":2,"program":5,"name":"Torreblanca   CA"},{"bank":2,"program":6,"name":"Wave Voices  SCD"},{"bank":2,"program":7,"name":"Channel 1337  CA"},{"bank":2,"program":8,"name":"SimpleSeq    SCD"},{"bank":2,"program":9,"name":"404 Found  CA"},{"bank":2,"program":10,"name":"OrganClav      T"},{"bank":2,"program":11,"name":"Encinarejo    CA"},{"bank":2,"program":12,"name":"Morphorgan     T"},{"bank":2,"program":13,"name":"Vic 20        CA"},{"bank":2,"program":14,"name":"Warning      SCD"},{"bank":2,"program":15,"name":"Jaws    CitCA y"},{"bank":2,"program":16,"name":"Bad Highpass SCD"},{"bank":2,"program":17,"name":"Bottle        CA"},{"bank":2,"program":18,"name":"2 Cats       SCD"},{"bank":2,"program":19,"name":"Sa Calobra    CA"},{"bank":2,"program":20,"name":"FlangerSaw   SCD"},{"bank":2,"program":21,"name":"Graja         CA"},{"bank":2,"program":22,"name":"BloAttack    SCD"},{"bank":2,"program":23,"name":"Table FM     SCD"},{"bank":2,"program":24,"name":"Glockenklang   T"},{"bank":2,"program":25,"name":"Flowinx       CA"},{"bank":2,"program":26,"name":"BloodLife    SCD"},{"bank":2,"program":27,"name":"2Osc Sync    SCD"},{"bank":2,"program":28,"name":"Latmo          T"},{"bank":2,"program":29,"name":"Halloween      T"},{"bank":2,"program":30,"name":"Down to 5kHz   T"},{"bank":2,"program":31,"name":"Filter FM    SCD"},{"bank":2,"program":32,"name":"Comb-at       CA"},{"bank":2,"program":33,"name":"Borg Cubus     T"},{"bank":2,"program":34,"name":"Relax3       SCD"},{"bank":2,"program":35,"name":"Mahlstrom      T"},{"bank":2,"program":36,"name":"AM on Sinus  SCD"},{"bank":2,"program":37,"name":"19/20          T"},{"bank":2,"program":38,"name":"What?        SCD"},{"bank":2,"program":39,"name":"StefanIsMad  SCD"},{"bank":2,"program":40,"name":"ReverseWhoosch T"},{"bank":2,"program":41,"name":"50s Pad        T"},{"bank":2,"program":42,"name":"Deepspace 9   ST"},{"bank":2,"program":43,"name":"Chorus       WMF"},{"bank":2,"program":44,"name":"HP PPG       SCD"},{"bank":2,"program":45,"name":"Hmm, lecker  WMF"},{"bank":2,"program":46,"name":"Angel Pad     HS"},{"bank":2,"program":47,"name":"Heaven        JL"},{"bank":2,"program":48,"name":"Blovachord   SCD"},{"bank":2,"program":49,"name":"MeetInTheSky SCD"},{"bank":2,"program":50,"name":"Padings       HM"},{"bank":2,"program":51,"name":"Om mani padme HM"},{"bank":2,"program":52,"name":"Raising Sun    T"},{"bank":2,"program":53,"name":"Slow Wavetrip  T"},{"bank":2,"program":54,"name":"Brightseite    T"},{"bank":2,"program":55,"name":"LateNightPad   T"},{"bank":2,"program":56,"name":"Angels Cry    JL"},{"bank":2,"program":57,"name":"Phalanx       ST"},{"bank":2,"program":58,"name":"The Bridge    SK"},{"bank":2,"program":59,"name":"ObiWahnPad    SK"},{"bank":2,"program":60,"name":"Sonnenaufgang  T"},{"bank":2,"program":61,"name":"Queen-mom     HM"},{"bank":2,"program":62,"name":"DarkQuietPad   T"},{"bank":2,"program":63,"name":"Geiler Lurch   T"},{"bank":2,"program":64,"name":"Zeitlos        T"},{"bank":2,"program":65,"name":"MI5 Pad      ugh"},{"bank":2,"program":66,"name":"Octopussy Pad  T"},{"bank":2,"program":67,"name":"Like Wool     HM"},{"bank":2,"program":68,"name":"di-Fusion      T"},{"bank":2,"program":69,"name":"Go to Pad      T"},{"bank":2,"program":70,"name":"Kiddings      HM"},{"bank":2,"program":71,"name":"Harsh Pad      T"},{"bank":2,"program":72,"name":"Broadway     ugh"},{"bank":2,"program":73,"name":"Neocrest      ST"},{"bank":2,"program":74,"name":"BandSpass      T"},{"bank":2,"program":75,"name":"Event Horizon  T"},{"bank":2,"program":76,"name":"Long Sweep     T"},{"bank":2,"program":77,"name":"DisharmonicPad T"},{"bank":2,"program":78,"name":"Goldfinger Pad T"},{"bank":2,"program":79,"name":"Wartofsky 2.0  T"},{"bank":2,"program":80,"name":"S&H&Pad&Nice WMF"},{"bank":2,"program":81,"name":"Attacke      WMF"},{"bank":2,"program":82,"name":"Moving       SCD"},{"bank":2,"program":83,"name":"Q-rious?     WMF"},{"bank":2,"program":84,"name":"Bioshock      JL"},{"bank":2,"program":85,"name":"With Love    WMF"},{"bank":2,"program":86,"name":"Mellow Tron   TK"},{"bank":2,"program":87,"name":"JV HardBass"},{"bank":2,"program":88,"name":"PredictaBass WMF"},{"bank":2,"program":89,"name":"Phalanx Bass"},{"bank":2,"program":90,"name":"BassterKeaton  T"},{"bank":2,"program":91,"name":"Narrow"},{"bank":2,"program":92,"name":"Drum'n'Bass 1"},{"bank":2,"program":93,"name":"Mars Mouse"},{"bank":2,"program":94,"name":"Fonky Fonky"},{"bank":2,"program":95,"name":"Frittenlos"},{"bank":2,"program":96,"name":"Mo'Grass"},{"bank":2,"program":97,"name":"Bassanova"},{"bank":2,"program":98,"name":"2Step Bass"},{"bank":2,"program":99,"name":"TockTock"},{"bank":2,"program":100,"name":"Silicon Base"},{"bank":2,"program":101,"name":"Ultra Sub 1"},{"bank":2,"program":102,"name":"Ultra Sub 2"},{"bank":2,"program":103,"name":"WhopWhop"},{"bank":2,"program":104,"name":"Acrylic Bass"},{"bank":2,"program":105,"name":"Ringmono"},{"bank":2,"program":106,"name":"CascadeVCF"},{"bank":2,"program":107,"name":"303 Wanna Be"},{"bank":2,"program":108,"name":"Morph Bass    ST"},{"bank":2,"program":109,"name":"Q-Timps"},{"bank":2,"program":110,"name":"DeepHouse     SK"},{"bank":2,"program":111,"name":"FM Roads      HS"},{"bank":2,"program":112,"name":"DX-ClassiQ    HS"},{"bank":2,"program":113,"name":"Hippy Freuds  HS"},{"bank":2,"program":114,"name":"Shed          HM"},{"bank":2,"program":115,"name":"Harpsi        HS"},{"bank":2,"program":116,"name":"Easy Piano    HS"},{"bank":2,"program":117,"name":"Lounge Morph  HS"},{"bank":2,"program":118,"name":"BloodyFeld   SCD"},{"bank":2,"program":119,"name":"ModWheelOrganSCD"},{"bank":2,"program":120,"name":"Minor Chords   T"},{"bank":2,"program":121,"name":"Ice Bells     SK"},{"bank":2,"program":122,"name":"Bone Soup"},{"bank":2,"program":123,"name":"DCS3 Bubbles"},{"bank":2,"program":124,"name":"Flying Teapot"},{"bank":2,"program":125,"name":"Gastrology"},{"bank":2,"program":126,"name":"Into Mouth"},{"bank":2,"program":127,"name":"Whoosch        T"},{"bank":3,"program":0,"name":"UltraFatPoly WMF"},{"bank":3,"program":1,"name":"Brass Comp    HM"},{"bank":3,"program":2,"name":"Pussy Galore   T"},{"bank":3,"program":3,"name":"Euro-Zeichen  HS"},{"bank":3,"program":4,"name":"Brassy House  SK"},{"bank":3,"program":5,"name":"BestOfThe80s   T"},{"bank":3,"program":6,"name":"Classic Synth  T"},{"bank":3,"program":7,"name":"WT mess     SCD"},{"bank":3,"program":8,"name":"Leadrunner    HS"},{"bank":3,"program":9,"name":"10VoicePS3100SCD"},{"bank":3,"program":10,"name":"Patagonia     HS"},{"bank":3,"program":11,"name":"Quintage       T"},{"bank":3,"program":12,"name":"RoundTheHorn  HS"},{"bank":3,"program":13,"name":"Net Profit    HS"},{"bank":3,"program":14,"name":"SyncMush    DocT"},{"bank":3,"program":15,"name":"Tron Flutes   HM"},{"bank":3,"program":16,"name":"Qazzio        HS"},{"bank":3,"program":17,"name":"VintageSpringWMF"},{"bank":3,"program":18,"name":"Zawichords    HS"},{"bank":3,"program":19,"name":"Spring Clean  HS"},{"bank":3,"program":20,"name":"Papathanasiou  T"},{"bank":3,"program":21,"name":"FloorFilla    SK"},{"bank":3,"program":22,"name":"Hyper       DocT"},{"bank":3,"program":23,"name":"Dr. Motte      T"},{"bank":3,"program":24,"name":"FilterFM Keys  T"},{"bank":3,"program":25,"name":"80sFM Analog  SK"},{"bank":3,"program":26,"name":"Analog Lute   HS"},{"bank":3,"program":27,"name":"D-NoiZer      SK"},{"bank":3,"program":28,"name":"Crawlers      SK"},{"bank":3,"program":29,"name":"Brownies     WMF"},{"bank":3,"program":30,"name":"Late Ring     HS"},{"bank":3,"program":31,"name":"RingThemBellsSCD"},{"bank":3,"program":32,"name":"TributeTo DX WMF"},{"bank":3,"program":33,"name":"WhatYouSay?  SCD"},{"bank":3,"program":34,"name":"Atlantis       T"},{"bank":3,"program":35,"name":"Atmostrobe     T"},{"bank":3,"program":36,"name":"Background     T"},{"bank":3,"program":37,"name":"Baraka         T"},{"bank":3,"program":38,"name":"Beautiful Sky  T"},{"bank":3,"program":39,"name":"Clink Clash    T"},{"bank":3,"program":40,"name":"Comb Tree      T"},{"bank":3,"program":41,"name":"Drift"},{"bank":3,"program":42,"name":"Fear'n'Loath"},{"bank":3,"program":43,"name":"Flinker"},{"bank":3,"program":44,"name":"Orthanc        T"},{"bank":3,"program":45,"name":"RePression     T"},{"bank":3,"program":46,"name":"Royalties"},{"bank":3,"program":47,"name":"Biosphere      T"},{"bank":3,"program":48,"name":"Spitzbergen    T"},{"bank":3,"program":49,"name":"Stratosphere   T"},{"bank":3,"program":50,"name":"Swiss Atmo     T"},{"bank":3,"program":51,"name":"Upstream       T"},{"bank":3,"program":52,"name":"VeryCompleqs"},{"bank":3,"program":53,"name":"Waterworld     T"},{"bank":3,"program":54,"name":"RingmodFart  SCD"},{"bank":3,"program":55,"name":"Vangelibells SCD"},{"bank":3,"program":56,"name":"PolterBlofeldSCD"},{"bank":3,"program":57,"name":"Ambishous"},{"bank":3,"program":58,"name":"ScaramangAtmo  T"},{"bank":3,"program":59,"name":"CS4O RingMod   T"},{"bank":3,"program":60,"name":"ReSolotion   WMF"},{"bank":3,"program":61,"name":"Anna Powers   HM"},{"bank":3,"program":62,"name":"HardSaw       ST"},{"bank":3,"program":63,"name":"X-Feels"},{"bank":3,"program":64,"name":"Bach Whistler"},{"bank":3,"program":65,"name":"Modulator"},{"bank":3,"program":66,"name":"NoisyLead"},{"bank":3,"program":67,"name":"Pulsar Solo"},{"bank":3,"program":68,"name":"Starweed"},{"bank":3,"program":69,"name":"Saw 1 Osc    WMF"},{"bank":3,"program":70,"name":"Old Squares"},{"bank":3,"program":71,"name":"Crazy Parade"},{"bank":3,"program":72,"name":"Monoguitar"},{"bank":3,"program":73,"name":"Eff Emmd!"},{"bank":3,"program":74,"name":"DiscoPhonic"},{"bank":3,"program":75,"name":"Moany"},{"bank":3,"program":76,"name":"MiniDuke Solo"},{"bank":3,"program":77,"name":"FictionGuitar"},{"bank":3,"program":78,"name":"Autobahn      jh"},{"bank":3,"program":79,"name":"MoogSolo      HS"},{"bank":3,"program":80,"name":"LA-Pipe       HS"},{"bank":3,"program":81,"name":"Clinics      WMF"},{"bank":3,"program":82,"name":"Attacke      WMF"},{"bank":3,"program":83,"name":"Expensive2   WMF"},{"bank":3,"program":84,"name":"ZZ-you"},{"bank":3,"program":85,"name":"Juanita        T"},{"bank":3,"program":86,"name":"Ricochet2008 SCD"},{"bank":3,"program":87,"name":"Spiffing"},{"bank":3,"program":88,"name":"StarSoldiers"},{"bank":3,"program":89,"name":"Slow Pop"},{"bank":3,"program":90,"name":"Space Arp 1"},{"bank":3,"program":91,"name":"Space Arp 2"},{"bank":3,"program":92,"name":"Goonraker   DocT"},{"bank":3,"program":93,"name":"Sierra Velone"},{"bank":3,"program":94,"name":"Selbstlaeufer  T"},{"bank":3,"program":95,"name":"GeeGaGooQ    WMF"},{"bank":3,"program":96,"name":"PassPortament"},{"bank":3,"program":97,"name":"cARPet         T"},{"bank":3,"program":98,"name":"DeluXaflex    RJ"},{"bank":3,"program":99,"name":"E-Motion"},{"bank":3,"program":100,"name":"AthmoDrops"},{"bank":3,"program":101,"name":"1DrunkenStenz"},{"bank":3,"program":102,"name":"Weirdo FX"},{"bank":3,"program":103,"name":"Solaris"},{"bank":3,"program":104,"name":"SoundScapes 1"},{"bank":3,"program":105,"name":"Spektrum Pad"},{"bank":3,"program":106,"name":"Sphere"},{"bank":3,"program":107,"name":"Spitzbergen"},{"bank":3,"program":108,"name":"Stratosphere"},{"bank":3,"program":109,"name":"Swiss Atmo"},{"bank":3,"program":110,"name":"The 5th Atmo"},{"bank":3,"program":111,"name":"The Fog"},{"bank":3,"program":112,"name":"The Year 3000"},{"bank":3,"program":113,"name":"Thin Ice"},{"bank":3,"program":114,"name":"ThrillerOrgan"},{"bank":3,"program":115,"name":"Tire-Guy"},{"bank":3,"program":116,"name":"TschingHisCan"},{"bank":3,"program":117,"name":"Upstream"},{"bank":3,"program":118,"name":"ValeyPad"},{"bank":3,"program":119,"name":"Vanilla Sky"},{"bank":3,"program":120,"name":"Orthanc"},{"bank":3,"program":121,"name":"Lettland"},{"bank":3,"program":122,"name":"Wartofsky      T"},{"bank":3,"program":123,"name":"Wavescapes 1"},{"bank":3,"program":124,"name":"Wavescapes 2"},{"bank":3,"program":125,"name":"Wavescapes 3"},{"bank":3,"program":126,"name":"WideWarmWash WMF"},{"bank":3,"program":127,"name":"The Carpet"},{"bank":4,"program":0,"name":"With Love    WMF"},{"bank":4,"program":1,"name":"ScaramangAtmo  T"},{"bank":4,"program":2,"name":"Handy      H2SCD"},{"bank":4,"program":3,"name":"Angels Cry    JL"},{"bank":4,"program":4,"name":"Chorus       WMF"},{"bank":4,"program":5,"name":"ModWheelOrganSCD"},{"bank":4,"program":6,"name":"SyncMush    DocT"},{"bank":4,"program":7,"name":"Yummi       DocT"},{"bank":4,"program":8,"name":"Pussy Galore   T"},{"bank":4,"program":9,"name":"Clinics      WMF"},{"bank":4,"program":10,"name":"CtrlAltDel  DocT"},{"bank":4,"program":11,"name":"Tines&Bars   WMF"},{"bank":4,"program":12,"name":"Unstable    DocT"},{"bank":4,"program":13,"name":"Deepspace 9   ST"},{"bank":4,"program":14,"name":"DrivingLicnsDocT"},{"bank":4,"program":15,"name":"FlangedHeavenSCD"},{"bank":4,"program":16,"name":"Heaven        JL"},{"bank":4,"program":17,"name":"Hmm, lecker  WMF"},{"bank":4,"program":18,"name":"Horse Trip   SCD"},{"bank":4,"program":19,"name":"Inversion   DocT"},{"bank":4,"program":20,"name":"JMX vs. DeLeon"},{"bank":4,"program":21,"name":"LA Woman   H2SCD"},{"bank":4,"program":22,"name":"Minor Chords"},{"bank":4,"program":23,"name":"MoogSolo 2"},{"bank":4,"program":24,"name":"OhMyLord    DocT"},{"bank":4,"program":25,"name":"PPG Bells    WMF"},{"bank":4,"program":26,"name":"PPGesus      SCD"},{"bank":4,"program":27,"name":"Quadratur   DocT"},{"bank":4,"program":28,"name":"RingmodFart  SCD"},{"bank":4,"program":29,"name":"SchnoerkelosDocT"},{"bank":4,"program":30,"name":"Schulze?     SCD"},{"bank":4,"program":31,"name":"shArp       DocT"},{"bank":4,"program":32,"name":"Space Echo   SCD"},{"bank":4,"program":33,"name":"Synthline     JL"},{"bank":4,"program":34,"name":"Taken!       SCD"},{"bank":4,"program":35,"name":"TouchyBuggerDocT"},{"bank":4,"program":36,"name":"UpperWarp    SCD"},{"bank":4,"program":37,"name":"WhatYouSay?  SCD"},{"bank":4,"program":38,"name":"WT mess     SCD"},{"bank":4,"program":39,"name":"10VoicePS3100SCD"},{"bank":4,"program":40,"name":"ArcoStrings  TEK"},{"bank":4,"program":41,"name":"Blocked      SCD"},{"bank":4,"program":42,"name":"Blolitzer    SCD"},{"bank":4,"program":43,"name":"BloodyFeld   SCD"},{"bank":4,"program":44,"name":"BloSync     DocT"},{"bank":4,"program":45,"name":"Blovachord   SCD"},{"bank":4,"program":46,"name":"Boele Keys   SCD"},{"bank":4,"program":47,"name":"Bonker Bass   ST"},{"bank":4,"program":48,"name":"Camel Saw   DocT"},{"bank":4,"program":49,"name":"Cream S+H    SCD"},{"bank":4,"program":50,"name":"CS4O RingMod"},{"bank":4,"program":51,"name":"DalaiDelayMa SCD"},{"bank":4,"program":52,"name":"Dirty Organ  SCD"},{"bank":4,"program":53,"name":"Dr.Blo      DocT"},{"bank":4,"program":54,"name":"Driven      DocT"},{"bank":4,"program":55,"name":"Euro Clubber  ST"},{"bank":4,"program":56,"name":"Flangelized  SCD"},{"bank":4,"program":57,"name":"Funky Bass    JL"},{"bank":4,"program":58,"name":"Goldfinger Pad T"},{"bank":4,"program":59,"name":"HardSaw       ST"},{"bank":4,"program":60,"name":"Heimweh     DocT"},{"bank":4,"program":61,"name":"Honey House"},{"bank":4,"program":62,"name":"Horny Bass    ST"},{"bank":4,"program":63,"name":"HP PPG       SCD"},{"bank":4,"program":64,"name":"Hyper       DocT"},{"bank":4,"program":65,"name":"I'm Evil     WMF"},{"bank":4,"program":66,"name":"InfinitesimaDocT"},{"bank":4,"program":67,"name":"Jankorgel    SCD"},{"bank":4,"program":68,"name":"Leading      SCD"},{"bank":4,"program":69,"name":"Maximum Zorin  T"},{"bank":4,"program":70,"name":"MeetInTheSky SCD"},{"bank":4,"program":71,"name":"Meridian    DocT"},{"bank":4,"program":72,"name":"Messing     DocT"},{"bank":4,"program":73,"name":"Minimal Bass JL"},{"bank":4,"program":74,"name":"Morph Bass    ST"},{"bank":4,"program":75,"name":"Moving       SCD"},{"bank":4,"program":76,"name":"NearlyInTune SCD"},{"bank":4,"program":77,"name":"Neocrest      ST"},{"bank":4,"program":78,"name":"Octopussy Pad  T"},{"bank":4,"program":79,"name":"Organella"},{"bank":4,"program":80,"name":"Partyhupe     ST"},{"bank":4,"program":81,"name":"Pastry      DocT"},{"bank":4,"program":82,"name":"Persecutor  DocT"},{"bank":4,"program":83,"name":"Phalanx       ST"},{"bank":4,"program":84,"name":"Pick It Up!  SCD"},{"bank":4,"program":85,"name":"Pienzchen   DocT"},{"bank":4,"program":86,"name":"Pigs X-Mod   TEK"},{"bank":4,"program":87,"name":"PlainBass   DocT"},{"bank":4,"program":88,"name":"PolterBlofeldSCD"},{"bank":4,"program":89,"name":"Poly Lead    SCD"},{"bank":4,"program":90,"name":"PPG Piano    SCD"},{"bank":4,"program":91,"name":"PPG T40 like TEK"},{"bank":4,"program":92,"name":"PredictaBass WMF"},{"bank":4,"program":93,"name":"Pressure    DocT"},{"bank":4,"program":94,"name":"Principia   DocT"},{"bank":4,"program":95,"name":"Pure        DocT"},{"bank":4,"program":96,"name":"Reset       DocT"},{"bank":4,"program":97,"name":"Ricochet2008 SCD"},{"bank":4,"program":98,"name":"RingThemBellsSCD"},{"bank":4,"program":99,"name":"Robotic       JL"},{"bank":4,"program":100,"name":"Saw Orgy     SCD"},{"bank":4,"program":101,"name":"Seq 1        SCD"},{"bank":4,"program":102,"name":"Seven Ties   SCD"},{"bank":4,"program":103,"name":"S&Hatmo"},{"bank":4,"program":104,"name":"Sobstuff    DocT"},{"bank":4,"program":105,"name":"Soft Brass 2DocT"},{"bank":4,"program":106,"name":"SpatialDrive1SCD"},{"bank":4,"program":107,"name":"SpatialDrive2SCD"},{"bank":4,"program":108,"name":"Stenzelized  SCD"},{"bank":4,"program":109,"name":"Stop Bass    SCD"},{"bank":4,"program":110,"name":"SunOfTheDogs WMF"},{"bank":4,"program":111,"name":"Supersaw      ST"},{"bank":4,"program":112,"name":"Tabloid     DocT"},{"bank":4,"program":113,"name":"Telenovela  DocT"},{"bank":4,"program":114,"name":"Thrill Arp   SCD"},{"bank":4,"program":115,"name":"Utmost      DocT"},{"bank":4,"program":116,"name":"Variator    DocT"},{"bank":4,"program":117,"name":"Wave Mayhem DocT"},{"bank":4,"program":118,"name":"WavEpiano    SCD"},{"bank":4,"program":119,"name":"West Wave  H2SCD"},{"bank":4,"program":120,"name":"AfterConcert SCD"},{"bank":4,"program":121,"name":"AnalogBass   SCD"},{"bank":4,"program":122,"name":"Barbarie BrassST"},{"bank":4,"program":123,"name":"Basster Keaton"},{"bank":4,"program":124,"name":"Bend Me     DocT"},{"bank":4,"program":125,"name":"Bioshock      JL"},{"bank":4,"program":126,"name":"Blubber      TEK"},{"bank":4,"program":127,"name":"Diving Echos TEK"},{"bank":5,"program":0,"name":"Flups Bass    ST"},{"bank":5,"program":1,"name":"Goonraker   DocT"},{"bank":5,"program":2,"name":"microQ Plus"},{"bank":5,"program":3,"name":"MiniMoogThnd TEK"},{"bank":5,"program":4,"name":"Octa Bass     ST"},{"bank":5,"program":5,"name":"Porno Bass    ST"},{"bank":5,"program":6,"name":"ReSolotion   WMF"},{"bank":5,"program":7,"name":"Roadies Keyb TEK"},{"bank":5,"program":8,"name":"Spynett     DocT"},{"bank":5,"program":9,"name":"Tines       DocT"},{"bank":5,"program":10,"name":"Velo Drive   SCD"},{"bank":5,"program":11,"name":"Vangelibells SCD"},{"bank":5,"program":12,"name":"Bellflutes"},{"bank":5,"program":13,"name":"Bellissimo"},{"bank":5,"program":14,"name":"Bells'E.Piano RZ"},{"bank":5,"program":15,"name":"Cheap Organ"},{"bank":5,"program":16,"name":"Chorgany      SK"},{"bank":5,"program":17,"name":"Combuder Orgs SK"},{"bank":5,"program":18,"name":"Crunge Organ  SK"},{"bank":5,"program":19,"name":"DeepHouse     SK"},{"bank":5,"program":20,"name":"Dirty Organ1 WMF"},{"bank":5,"program":21,"name":"Driven Keys"},{"bank":5,"program":22,"name":"Dull Bells"},{"bank":5,"program":23,"name":"DX-ClassiQ    HS"},{"bank":5,"program":24,"name":"DX-Pipe       HS"},{"bank":5,"program":25,"name":"Easy Piano    HS"},{"bank":5,"program":26,"name":"ElectricOrgan"},{"bank":5,"program":27,"name":"ElectricPiano"},{"bank":5,"program":28,"name":"Fat Sine Keys"},{"bank":5,"program":29,"name":"FM KeysMelody"},{"bank":5,"program":30,"name":"FM Roads"},{"bank":5,"program":31,"name":"Full Organ    HS"},{"bank":5,"program":32,"name":"Glockenspiel"},{"bank":5,"program":33,"name":"GS-Piano      HS"},{"bank":5,"program":34,"name":"Harpsi        HS"},{"bank":5,"program":35,"name":"Hippy Freuds  HS"},{"bank":5,"program":36,"name":"House         HM"},{"bank":5,"program":37,"name":"Jazz Creeper  HS"},{"bank":5,"program":38,"name":"LA-Pipe       HS"},{"bank":5,"program":39,"name":"LoFi Organ    SK"},{"bank":5,"program":40,"name":"Lounge Morph  HS"},{"bank":5,"program":41,"name":"Lower Steam   HS"},{"bank":5,"program":42,"name":"Marimboid     HS"},{"bank":5,"program":43,"name":"Modern House  SK"},{"bank":5,"program":44,"name":"Modern Keys"},{"bank":5,"program":45,"name":"Noise Toys    HS"},{"bank":5,"program":46,"name":"Ode to Joy    HS"},{"bank":5,"program":47,"name":"Oil Well"},{"bank":5,"program":48,"name":"Organ #2       S"},{"bank":5,"program":49,"name":"Quad-Square"},{"bank":5,"program":50,"name":"Reso Organ"},{"bank":5,"program":51,"name":"ResOrgan      SK"},{"bank":5,"program":52,"name":"Rhodos Corso WMF"},{"bank":5,"program":53,"name":"RhodosFlango WMF"},{"bank":5,"program":54,"name":"Rodesque      HS"},{"bank":5,"program":55,"name":"Schwebend     jh"},{"bank":5,"program":56,"name":"Shed          HM"},{"bank":5,"program":57,"name":"Sick FM       SK"},{"bank":5,"program":58,"name":"SpaceChimes   SK"},{"bank":5,"program":59,"name":"The Oily Way  HS"},{"bank":5,"program":60,"name":"Thin Organ    HS"},{"bank":5,"program":61,"name":"Troubadour"},{"bank":5,"program":62,"name":"Wartz Piano1  HM"},{"bank":5,"program":63,"name":"Wooden E     WMF"},{"bank":5,"program":64,"name":"Wurlitzer104b HM"},{"bank":5,"program":65,"name":"Yamlitzer"},{"bank":5,"program":66,"name":"7th Sense     SK"},{"bank":5,"program":67,"name":"80sFM Analog  SK"},{"bank":5,"program":68,"name":"Aggreppo       T"},{"bank":5,"program":69,"name":"Analog Lute   HS"},{"bank":5,"program":70,"name":"Analog Quest  SK"},{"bank":5,"program":71,"name":"Aphazing      SK"},{"bank":5,"program":72,"name":"Bell like     RZ"},{"bank":5,"program":73,"name":"BestOfThe80s   T"},{"bank":5,"program":74,"name":"Blakes 7 Str  AT"},{"bank":5,"program":75,"name":"B-Lead        SK"},{"bank":5,"program":76,"name":"Bounty Synth"},{"bank":5,"program":77,"name":"Brass Comp    HM"},{"bank":5,"program":78,"name":"Brass-lead   SCD"},{"bank":5,"program":79,"name":"Brassy House  SK"},{"bank":5,"program":80,"name":"Bright Sync"},{"bank":5,"program":81,"name":"Brownies     WMF"},{"bank":5,"program":82,"name":"CareFull      RZ"},{"bank":5,"program":83,"name":"Caspoly      WMF"},{"bank":5,"program":84,"name":"Chamber High  HS"},{"bank":5,"program":85,"name":"Chamber Low   HS"},{"bank":5,"program":86,"name":"Chord-Hose     T"},{"bank":5,"program":87,"name":"Chord Revival SK"},{"bank":5,"program":88,"name":"Classic Dance"},{"bank":5,"program":89,"name":"Classic Synth"},{"bank":5,"program":90,"name":"Clavinetro    jh"},{"bank":5,"program":91,"name":"Clock&Bells   RZ"},{"bank":5,"program":92,"name":"Combi Saws    SK"},{"bank":5,"program":93,"name":"Compromise K  HM"},{"bank":5,"program":94,"name":"Concertino   SCD"},{"bank":5,"program":95,"name":"Cool Porta    HM"},{"bank":5,"program":96,"name":"Crawlers      SK"},{"bank":5,"program":97,"name":"Crispy Saw    SK"},{"bank":5,"program":98,"name":"CyberLeader   SK"},{"bank":5,"program":99,"name":"Dawn Organ"},{"bank":5,"program":100,"name":"Deep Synth    DK"},{"bank":5,"program":101,"name":"Delead It!    SK"},{"bank":5,"program":102,"name":"DirtyLead     SK"},{"bank":5,"program":103,"name":"D-NoiZer      SK"},{"bank":5,"program":104,"name":"DollarBells  ugh"},{"bank":5,"program":105,"name":"Dr. Motte      T"},{"bank":5,"program":106,"name":"Energee!      SK"},{"bank":5,"program":107,"name":"Enough Power   T"},{"bank":5,"program":108,"name":"EthnoPerc     SK"},{"bank":5,"program":109,"name":"Euro-Zeichen  HS"},{"bank":5,"program":110,"name":"ExploreChords SK"},{"bank":5,"program":111,"name":"Fat 8-Osc     SK"},{"bank":5,"program":112,"name":"Filigrano     SK"},{"bank":5,"program":113,"name":"FilterFM Keys"},{"bank":5,"program":114,"name":"FloorFilla    SK"},{"bank":5,"program":115,"name":"FM Chords     SK"},{"bank":5,"program":116,"name":"FM Melodies"},{"bank":5,"program":117,"name":"FMod Saws     SK"},{"bank":5,"program":118,"name":"FM-sono Saw"},{"bank":5,"program":119,"name":"French        RZ"},{"bank":5,"program":120,"name":"Fun Man"},{"bank":5,"program":121,"name":"Gated 80's"},{"bank":5,"program":122,"name":"Gattaca       SK"},{"bank":5,"program":123,"name":"Gimme Five!   SK"},{"bank":5,"program":124,"name":"Glitter Power HS"},{"bank":5,"program":125,"name":"Good Air      SK"},{"bank":5,"program":126,"name":"High Sequence jh"},{"bank":5,"program":127,"name":"HitMeQuick!   SK"},{"bank":6,"program":0,"name":"Human Touch   SK"},{"bank":6,"program":1,"name":"Ice Bells     SK"},{"bank":6,"program":2,"name":"Illbient Mind"},{"bank":6,"program":3,"name":"It's Digital"},{"bank":6,"program":4,"name":"Jembala      WMF"},{"bank":6,"program":5,"name":"JMX jun."},{"bank":6,"program":6,"name":"Juno Soul     DK"},{"bank":6,"program":7,"name":"KlingKlang'02 jh"},{"bank":6,"program":8,"name":"La Sirena     SK"},{"bank":6,"program":9,"name":"Late Ring     HS"},{"bank":6,"program":10,"name":"Leadrunner"},{"bank":6,"program":11,"name":"Legal Resins  HS"},{"bank":6,"program":12,"name":"LikeClinics  WMF"},{"bank":6,"program":13,"name":"Liquid Mel   WMF"},{"bank":6,"program":14,"name":"Liquid Var   WMF"},{"bank":6,"program":15,"name":"LoFi 1oscPoly"},{"bank":6,"program":16,"name":"LoFi Lead    WMF"},{"bank":6,"program":17,"name":"Minor Chord   RZ"},{"bank":6,"program":18,"name":"Modulizer     SK"},{"bank":6,"program":19,"name":"Move Sound"},{"bank":6,"program":20,"name":"My Ol' House  SK"},{"bank":6,"program":21,"name":"Net Profit    HS"},{"bank":6,"program":22,"name":"Neu * Utz     HM"},{"bank":6,"program":23,"name":"NewClassicLd  SK"},{"bank":6,"program":24,"name":"No. 5 lives    T"},{"bank":6,"program":25,"name":"OB-One Knobi  HS"},{"bank":6,"program":26,"name":"OBX Purple5 PROX"},{"bank":6,"program":27,"name":"Old * Uck     HM"},{"bank":6,"program":28,"name":"Organistic    SK"},{"bank":6,"program":29,"name":"Papathanasiou"},{"bank":6,"program":30,"name":"Patagonia     HS"},{"bank":6,"program":31,"name":"PEG Horns     HM"},{"bank":6,"program":32,"name":"Phased FM     SK"},{"bank":6,"program":33,"name":"Play It Sam!  jh"},{"bank":6,"program":34,"name":"Poly Flutes   HS"},{"bank":6,"program":35,"name":"PolySequencer"},{"bank":6,"program":36,"name":"PowerLead    WMF"},{"bank":6,"program":37,"name":"Harp"},{"bank":6,"program":38,"name":"PPG Nylons  PROX"},{"bank":6,"program":39,"name":"Pure Keys"},{"bank":6,"program":40,"name":"PWMaster      SK"},{"bank":6,"program":41,"name":"Qazzio        HS"},{"bank":6,"program":42,"name":"Qddicted!     SK"},{"bank":6,"program":43,"name":"Qtronix      ugh"},{"bank":6,"program":44,"name":"Quake FM      SK"},{"bank":6,"program":45,"name":"Quintage       T"},{"bank":6,"program":46,"name":"Quinter 007   SK"},{"bank":6,"program":47,"name":"RaveLover     SK"},{"bank":6,"program":48,"name":"Really Insane"},{"bank":6,"program":49,"name":"Romeo         DK"},{"bank":6,"program":50,"name":"RoundTheHorn  HS"},{"bank":6,"program":51,"name":"SawTheLight   SK"},{"bank":6,"program":52,"name":"Sax And Dregs"},{"bank":6,"program":53,"name":"Schubduese     T"},{"bank":6,"program":54,"name":"ShatterWaves  SK"},{"bank":6,"program":55,"name":"Siegessaeule   T"},{"bank":6,"program":56,"name":"Simple Melo   jh"},{"bank":6,"program":57,"name":"Smash It!     SK"},{"bank":6,"program":58,"name":"Solo Harp"},{"bank":6,"program":59,"name":"Speed"},{"bank":6,"program":60,"name":"Spice         SK"},{"bank":6,"program":61,"name":"Spring Clean"},{"bank":6,"program":62,"name":"Stabs!"},{"bank":6,"program":63,"name":"Stack with you"},{"bank":6,"program":64,"name":"SteaLead      SK"},{"bank":6,"program":65,"name":"String Poly   HS"},{"bank":6,"program":66,"name":"String Thing  HS"},{"bank":6,"program":67,"name":"Stuermer 1   WMF"},{"bank":6,"program":68,"name":"Stylotub      SK"},{"bank":6,"program":69,"name":"SyncCity"},{"bank":6,"program":70,"name":"Synchronic    SK"},{"bank":6,"program":71,"name":"SynthPiano    SK"},{"bank":6,"program":72,"name":"Synth X"},{"bank":6,"program":73,"name":"Tea @ Eight   HS"},{"bank":6,"program":74,"name":"Tech.Lead 1"},{"bank":6,"program":75,"name":"Tech.Lead 2"},{"bank":6,"program":76,"name":"TelephoneSyn ugh"},{"bank":6,"program":77,"name":"Telepromter  ugh"},{"bank":6,"program":78,"name":"The Big 80s"},{"bank":6,"program":79,"name":"The Cutter    SK"},{"bank":6,"program":80,"name":"Titanomania   SK"},{"bank":6,"program":81,"name":"TranceHarp    HM"},{"bank":6,"program":82,"name":"Trance Plant  HS"},{"bank":6,"program":83,"name":"Trancer       SK"},{"bank":6,"program":84,"name":"TrashCan!     SK"},{"bank":6,"program":85,"name":"TributeTo DX WMF"},{"bank":6,"program":86,"name":"Tron Flutes   HM"},{"bank":6,"program":87,"name":"Tsching Lead   T"},{"bank":6,"program":88,"name":"TuBerkel      DK"},{"bank":6,"program":89,"name":"Typ Reso      RZ"},{"bank":6,"program":90,"name":"UltraFatPoly WMF"},{"bank":6,"program":91,"name":"UltraSynC     jh"},{"bank":6,"program":92,"name":"UltraWave     SK"},{"bank":6,"program":93,"name":"Unisono Bass  DK"},{"bank":6,"program":94,"name":"Utopia!       SK"},{"bank":6,"program":95,"name":"VeloFreak     jh"},{"bank":6,"program":96,"name":"Vintage Days  SK"},{"bank":6,"program":97,"name":"VintageSpringWMF"},{"bank":6,"program":98,"name":"Vitalica      SK"},{"bank":6,"program":99,"name":"Wank         WMF"},{"bank":6,"program":100,"name":"Wank Lead    WMF"},{"bank":6,"program":101,"name":"Wanna Noise?? jh"},{"bank":6,"program":102,"name":"Warm PWM Lead SK"},{"bank":6,"program":103,"name":"Warm Verse"},{"bank":6,"program":104,"name":"WaveLayer     SK"},{"bank":6,"program":105,"name":"Wells'Tripod WMF"},{"bank":6,"program":106,"name":"YourChords    SK"},{"bank":6,"program":107,"name":"Zapper        SK"},{"bank":6,"program":108,"name":"Zawichords    HS"},{"bank":6,"program":109,"name":"Zing Thing    HS"},{"bank":6,"program":110,"name":"Zippy 2       HM"},{"bank":6,"program":111,"name":"Zombie Nation  T"},{"bank":6,"program":112,"name":"50s Pad"},{"bank":6,"program":113,"name":"Airpad"},{"bank":6,"program":114,"name":"AirSpacePad   SK"},{"bank":6,"program":115,"name":"AmbientSweep  SK"},{"bank":6,"program":116,"name":"Analog Pad 1"},{"bank":6,"program":117,"name":"Analog Pad 2"},{"bank":6,"program":118,"name":"Analog Pad 3"},{"bank":6,"program":119,"name":"Angel Pad"},{"bank":6,"program":120,"name":"Antarktis Pad jh"},{"bank":6,"program":121,"name":"Archangel"},{"bank":6,"program":122,"name":"Attacke      WMF"},{"bank":6,"program":123,"name":"BackStrings  WMF"},{"bank":6,"program":124,"name":"Bandpad      ugh"},{"bank":6,"program":125,"name":"BandSpass"},{"bank":6,"program":126,"name":"Bend Pad"},{"bank":6,"program":127,"name":"Big Bad Pad"},{"bank":7,"program":0,"name":"Captain Kirk"},{"bank":7,"program":1,"name":"ChopperSweep"},{"bank":7,"program":2,"name":"ComputerGames"},{"bank":7,"program":3,"name":"Cyber Farm"},{"bank":7,"program":4,"name":"DCS3 Bubbles"},{"bank":7,"program":5,"name":"Duck Lambada"},{"bank":7,"program":6,"name":"EffEmmEffIxx"},{"bank":7,"program":7,"name":"Fade FX."},{"bank":7,"program":8,"name":"Final Choice"},{"bank":7,"program":9,"name":"FlangedNoise WMF"},{"bank":7,"program":10,"name":"FlangeplosionWMF"},{"bank":7,"program":11,"name":"Flying Teapot"},{"bank":7,"program":12,"name":"FM Comb FX"},{"bank":7,"program":13,"name":"FM Noises"},{"bank":7,"program":14,"name":"Gastrology"},{"bank":7,"program":15,"name":"HawaiGlider"},{"bank":7,"program":16,"name":"Into Mouth"},{"bank":7,"program":17,"name":"LFO  Speeddwn"},{"bank":7,"program":18,"name":"LFO  Speedup"},{"bank":7,"program":19,"name":"LilaBells"},{"bank":7,"program":20,"name":"Living Water"},{"bank":7,"program":21,"name":"LosAngeles2019"},{"bank":7,"program":22,"name":"Maschinenraum"},{"bank":7,"program":23,"name":"Newtronic"},{"bank":7,"program":24,"name":"Noise Move"},{"bank":7,"program":25,"name":"NoiseSlapper"},{"bank":7,"program":26,"name":"NoRobotsHere"},{"bank":7,"program":27,"name":"Power Down"},{"bank":7,"program":28,"name":"Q Wars"},{"bank":7,"program":29,"name":"Reverse-ecioV"},{"bank":7,"program":30,"name":"RingDaBell"},{"bank":7,"program":31,"name":"Ring Steps"},{"bank":7,"program":32,"name":"Rise&Fall"},{"bank":7,"program":33,"name":"Robotalk =:b"},{"bank":7,"program":34,"name":"Score FX Pad"},{"bank":7,"program":35,"name":"Shoot Goose!"},{"bank":7,"program":36,"name":"Shore"},{"bank":7,"program":37,"name":"Short Moment"},{"bank":7,"program":38,"name":"Shot Tool"},{"bank":7,"program":39,"name":"Sine Down"},{"bank":7,"program":40,"name":"Skywalker"},{"bank":7,"program":41,"name":"SubSineSweep WMF"},{"bank":7,"program":42,"name":"The Assault"},{"bank":7,"program":43,"name":"The BORG"},{"bank":7,"program":44,"name":"Thunderain"},{"bank":7,"program":45,"name":"ThunderDrums"},{"bank":7,"program":46,"name":"Tron Ring Game"},{"bank":7,"program":47,"name":"Tuxedosun"},{"bank":7,"program":48,"name":"Why?"},{"bank":7,"program":49,"name":"Wind Athmo"},{"bank":7,"program":50,"name":"WipeOut"},{"bank":7,"program":51,"name":"ZischDeep"},{"bank":7,"program":52,"name":"Agogo Scrape"},{"bank":7,"program":53,"name":"All Thumbs"},{"bank":7,"program":54,"name":"AnalogBongo 1"},{"bank":7,"program":55,"name":"Analog HH op"},{"bank":7,"program":56,"name":"AnalogStick 1"},{"bank":7,"program":57,"name":"Bass Drum    WMF"},{"bank":7,"program":58,"name":"BD 90ies Drum"},{"bank":7,"program":59,"name":"BD 808 @ 2002"},{"bank":7,"program":60,"name":"BD analg80ies"},{"bank":7,"program":61,"name":"BD analog 02"},{"bank":7,"program":62,"name":"BD analog 03"},{"bank":7,"program":63,"name":"BD AnalogRand"},{"bank":7,"program":64,"name":"BD Club 01"},{"bank":7,"program":65,"name":"BD Deep Zap"},{"bank":7,"program":66,"name":"BD Disto 808"},{"bank":7,"program":67,"name":"BD DoorSlam"},{"bank":7,"program":68,"name":"BD Hardcore"},{"bank":7,"program":69,"name":"BD HighKick"},{"bank":7,"program":70,"name":"BD On Stage"},{"bank":7,"program":71,"name":"BD Plock!"},{"bank":7,"program":72,"name":"BD Smack It!"},{"bank":7,"program":73,"name":"BD SpectroZap"},{"bank":7,"program":74,"name":"BD SubDrum"},{"bank":7,"program":75,"name":"BD Woof&Pock"},{"bank":7,"program":76,"name":"BD ZapDrum"},{"bank":7,"program":77,"name":"Bended Metal"},{"bank":7,"program":78,"name":"Brush HH"},{"bank":7,"program":79,"name":"Clap 01"},{"bank":7,"program":80,"name":"Clap 03"},{"bank":7,"program":81,"name":"Clap 04"},{"bank":7,"program":82,"name":"ClapsMuehle"},{"bank":7,"program":83,"name":"Deep Bell"},{"bank":7,"program":84,"name":"DivX Pad"},{"bank":7,"program":85,"name":"DoubleHHclose"},{"bank":7,"program":86,"name":"Dry BD"},{"bank":7,"program":87,"name":"Dry BD 2"},{"bank":7,"program":88,"name":"FM HHcl"},{"bank":7,"program":89,"name":"FM HHop"},{"bank":7,"program":90,"name":"HammerBell"},{"bank":7,"program":91,"name":"HH closed 01"},{"bank":7,"program":92,"name":"HH closed 02"},{"bank":7,"program":93,"name":"HH closed 03"},{"bank":7,"program":94,"name":"HH closed 04"},{"bank":7,"program":95,"name":"HH closed 05"},{"bank":7,"program":96,"name":"HH closed 06"},{"bank":7,"program":97,"name":"HH closed 08"},{"bank":7,"program":98,"name":"HH closed 09"},{"bank":7,"program":99,"name":"HH open 01"},{"bank":7,"program":100,"name":"HH open 02"},{"bank":7,"program":101,"name":"HH open 03"},{"bank":7,"program":102,"name":"HH open 06"},{"bank":7,"program":103,"name":"HH open 07"},{"bank":7,"program":104,"name":"HH open 08"},{"bank":7,"program":105,"name":"High PulseZap"},{"bank":7,"program":106,"name":"PPG Zaps"},{"bank":7,"program":107,"name":"Punchy SN"},{"bank":7,"program":108,"name":"Q-La Shaker"},{"bank":7,"program":109,"name":"Skellington"},{"bank":7,"program":110,"name":"SN NeoAnalog"},{"bank":7,"program":111,"name":"SN Real Snare"},{"bank":7,"program":112,"name":"SN RimSnare"},{"bank":7,"program":113,"name":"SN SnAir ;-)"},{"bank":7,"program":114,"name":"SN Thinny"},{"bank":7,"program":115,"name":"SN Zappada"},{"bank":7,"program":116,"name":"SN ZapSnare"},{"bank":7,"program":117,"name":"Surrr"},{"bank":7,"program":118,"name":"Tombola 1"},{"bank":7,"program":119,"name":"TR66 Hihat   WMF"},{"bank":7,"program":120,"name":"Various Metal"},{"bank":7,"program":121,"name":"Woodpicker"},{"bank":7,"program":122,"name":"Zap 1"},{"bank":7,"program":123,"name":"Zap 2"},{"bank":7,"program":124,"name":"Zap BD"},{"bank":7,"program":125,"name":"Zappy :)"},{"bank":7,"program":126,"name":"Zap Stick"},{"bank":7,"program":127,"name":"Init"}]},{"schema":"tabby-device/1","version":"0.2","id":"waldorf-pulse-2","name":"Waldorf Pulse 2","maker":"Waldorf","kind":"instrument","midiIn":{"connector":"5-pin DIN in/out and USB (MIDI only)","trs":null,"note":""},"clock":{"receives":"unverified","syncs":"arpeggiator clock per the manual (not researched for this rig)","setting":""},"channel":{"default":null,"note":"Global MIDI Channel: OMNI or 1..16 (omni receives all, sends on 1)."},"programChange":{"supported":true,"displayBase":1,"programs":100,"bankFormat":"hundreds","pad":3,"bankSelect":{"scheme":"cc32","banks":[{"index":0,"name":"1..100","msb":null,"lsb":0},{"index":1,"name":"101..200","msb":null,"lsb":1},{"index":2,"name":"201..300","msb":null,"lsb":2},{"index":3,"name":"301..400","msb":null,"lsb":3},{"index":4,"name":"401..500","msb":null,"lsb":4}]},"gapMs":0,"gapAfter":"program","note":"Display 001..500 as one range. Firmware readme (v1.14): only bank LSB (CC 32) is read, banks 0..4 = 001..100, 101..200, 201..300, 301..400, 401..500; CC 0 ignored; the program number is clamped to 0..99 inside the bank; the bank stays latched until Reset All Controllers. PC 0 = 001 per user tests (not stated by Waldorf). Program 500 generates a random patch."},"controllers":[{"cc":1,"name":"Modulation Wheel","min":0,"max":127},{"cc":5,"name":"Glide Rate","min":0,"max":127},{"cc":10,"name":"VCA Panning","min":0,"max":127},{"cc":14,"name":"Filter Env Attack","min":0,"max":127},{"cc":15,"name":"Filter Env Decay","min":0,"max":127},{"cc":16,"name":"Filter Env Sustain","min":0,"max":127},{"cc":17,"name":"Filter Env Release","min":0,"max":127},{"cc":18,"name":"Amp Env Attack","min":0,"max":127},{"cc":19,"name":"Amp Env Decay","min":0,"max":127},{"cc":20,"name":"Amp Env Sustain","min":0,"max":127},{"cc":21,"name":"Amp Env Release","min":0,"max":127},{"cc":24,"name":"LFO 1 Speed","min":0,"max":127},{"cc":25,"name":"LFO 1 Shape","min":0,"max":127},{"cc":26,"name":"LFO 2 Speed","min":0,"max":127},{"cc":27,"name":"LFO 2 Delay","min":0,"max":127},{"cc":29,"name":"Filter Env Trigger","min":0,"max":127},{"cc":31,"name":"Amp Env Trigger","min":0,"max":127},{"cc":35,"name":"Osc 1 Pulsewidth","min":0,"max":127},{"cc":36,"name":"Osc 2 Semitone","min":0,"max":127},{"cc":37,"name":"Osc 2 Detune","min":0,"max":127},{"cc":38,"name":"Osc 2 Shape","min":0,"max":127},{"cc":39,"name":"Osc 2 Pulsewidth","min":0,"max":127},{"cc":40,"name":"Osc 2 Keytrack","min":0,"max":127},{"cc":41,"name":"Osc 3 Sync","min":0,"max":127},{"cc":42,"name":"Osc 3 Semitone","min":0,"max":127},{"cc":43,"name":"Osc 3 Detune","min":0,"max":127},{"cc":44,"name":"Osc 3 Shape","min":0,"max":127},{"cc":45,"name":"Osc 1 Level","min":0,"max":127},{"cc":46,"name":"Osc 2 Level","min":0,"max":127},{"cc":47,"name":"Osc 3 Level","min":0,"max":127},{"cc":48,"name":"Noise Level","min":0,"max":127},{"cc":49,"name":"VCF Type","min":0,"max":127},{"cc":50,"name":"VCF Cutoff","min":0,"max":127},{"cc":51,"name":"VCF Keytrack","min":0,"max":127},{"cc":52,"name":"VCF Env Amount","min":0,"max":127},{"cc":53,"name":"VCF Velocity","min":0,"max":127},{"cc":56,"name":"VCF Resonance","min":0,"max":127},{"cc":57,"name":"VCA Volume","min":0,"max":127},{"cc":58,"name":"VCA Velocity","min":0,"max":127},{"cc":62,"name":"Glide Mode","min":0,"max":127},{"cc":64,"name":"Sustain Pedal","min":0,"max":127},{"cc":70,"name":"Osc 1 Semitone","min":0,"max":127},{"cc":71,"name":"Osc 1 Detune","min":0,"max":127},{"cc":72,"name":"Osc 3 Routing","min":0,"max":127},{"cc":73,"name":"Osc 1 Keytrack","min":0,"max":127},{"cc":74,"name":"Filter Env Loop","min":0,"max":127},{"cc":75,"name":"Amp Env Loop","min":0,"max":127},{"cc":76,"name":"VCA Drive","min":0,"max":127},{"cc":77,"name":"VCA Drive Curve","min":0,"max":127},{"cc":79,"name":"Arp Active","min":0,"max":127},{"cc":80,"name":"Arp Range","min":0,"max":127},{"cc":81,"name":"Arp Tempo","min":0,"max":127},{"cc":82,"name":"Arp Clock","min":0,"max":127},{"cc":83,"name":"Arp Mode","min":0,"max":127},{"cc":84,"name":"Step Duration","min":0,"max":127},{"cc":85,"name":"Arp Swing","min":0,"max":127},{"cc":86,"name":"Arp Delay","min":0,"max":127},{"cc":87,"name":"Pattern Length","min":0,"max":127},{"cc":88,"name":"Accent Control","min":0,"max":127},{"cc":90,"name":"Mod 5 Source","min":0,"max":127},{"cc":91,"name":"Mod 5 Amount","min":0,"max":127},{"cc":92,"name":"Mod 5 Target","min":0,"max":127},{"cc":93,"name":"Mod 6 Source","min":0,"max":127},{"cc":94,"name":"Mod 6 Amount","min":0,"max":127},{"cc":95,"name":"Mod 6 Target","min":0,"max":127},{"cc":96,"name":"Mod 7 Source","min":0,"max":127},{"cc":97,"name":"Mod 7 Amount","min":0,"max":127},{"cc":98,"name":"Mod 7 Target","min":0,"max":127},{"cc":99,"name":"Mod 8 Source","min":0,"max":127},{"cc":100,"name":"Mod 8 Amount","min":0,"max":127},{"cc":101,"name":"Mod 8 Target","min":0,"max":127},{"cc":102,"name":"Unison Detune","min":0,"max":127},{"cc":103,"name":"Osc 1 Amp Env Fade","min":0,"max":127},{"cc":104,"name":"Osc 2 Amp Env Fade","min":0,"max":127},{"cc":105,"name":"Bend Upwards","min":0,"max":127},{"cc":106,"name":"Bend Down","min":0,"max":127},{"cc":108,"name":"Mod 1 Source","min":0,"max":127},{"cc":109,"name":"Mod 1 Amount","min":0,"max":127},{"cc":110,"name":"Mod 1 Target","min":0,"max":127},{"cc":111,"name":"Mod 2 Source","min":0,"max":127},{"cc":112,"name":"Mod 2 Amount","min":0,"max":127},{"cc":113,"name":"Mod 2 Target","min":0,"max":127},{"cc":114,"name":"Mod 3 Source","min":0,"max":127},{"cc":115,"name":"Mod 3 Amount","min":0,"max":127},{"cc":116,"name":"Mod 3 Target","min":0,"max":127},{"cc":117,"name":"Mod 4 Source","min":0,"max":127},{"cc":118,"name":"Mod 4 Amount","min":0,"max":127},{"cc":119,"name":"Mod 4 Target","min":0,"max":127},{"cc":120,"name":"All Sound Off","min":0,"max":0},{"cc":121,"name":"Reset All Controllers","min":0,"max":0},{"cc":123,"name":"All Notes Off","min":0,"max":0}],"setup":["Global: MIDI Channel.","No program-change enable exists; bank LSB (CC 32) 0..4 selects the hundred, latched until Reset All Controllers.","Program 500 is the random patch generator."],"notes":["Factory names from Waldorf's preset list (2016-07-26): 001..410 named, 411..499 INIT, 500 RANDOM.","A secondary changelog says CC 59 = preset panning against the manual's CC 10; left as the manual says."],"sources":[{"title":"Pulse 2 user manual, revision 1.0 (September 2013)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/kfHqRdr7Jd4FQoj","detail":"pp. 13-14, 40-45, 58, 61-63, 67"},{"title":"Pulse 2 factory preset list (2016-07-26)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/egSEKaiSn4jk8Lq","detail":"pages 1-2, by number"},{"title":"Pulse 2 firmware bundle with the cumulative readme (bank select in the v1.14 entry)","url":"https://downloads.waldorfmusic.com/cloud/index.php/s/n6mxaCwWFZ2yeB2","detail":"Pulse_2_Firmware_V1.21/readme.txt"},{"title":"Elektronauts user test of bank/PC numbering (secondary)","url":"https://www.elektronauts.com/t/switching-programs-on-the-pulse-2/3361?page=2","detail":"PC 0 = 001"}],"unverified":["channel.default","programChange.displayBase (user tests only)","CC 0 handling on firmware 1.21","CC 10 vs CC 59 panning"],"presets":[{"bank":0,"program":0,"name":"TECH STAB RL","category":"LEAD"},{"bank":0,"program":1,"name":"I","category":"MONO"},{"bank":0,"program":2,"name":"SWIMGER DK","category":"ARP"},{"bank":0,"program":3,"name":"TREIBGUT JD","category":"ARP"},{"bank":0,"program":4,"name":"CATHERINE IW","category":"BASS"},{"bank":0,"program":5,"name":"CHORUS","category":"BASS"},{"bank":0,"program":6,"name":"DER MUSSO DK","category":"BASS"},{"bank":0,"program":7,"name":"BAD ROCKER RL","category":"LEAD"},{"bank":0,"program":8,"name":"WITH DELAY","category":"LEAD"},{"bank":0,"program":9,"name":"SWEEPER","category":"PAD"},{"bank":0,"program":10,"name":"WHITE DOORS","category":"PAD"},{"bank":0,"program":11,"name":"ACIDIZER JD","category":"ARP"},{"bank":0,"program":12,"name":"AUTOBAHN","category":"BASS"},{"bank":0,"program":13,"name":"BITTERSWEET JD","category":"ARP"},{"bank":0,"program":14,"name":"DOPPLER JD","category":"ARP"},{"bank":0,"program":15,"name":"OVERDRIVEN","category":"ARP"},{"bank":0,"program":16,"name":"UNISON","category":"PAD"},{"bank":0,"program":17,"name":"MONOLAKE TD CG","category":"ATMO"},{"bank":0,"program":18,"name":"TIME IS CHNG","category":"ATMO"},{"bank":0,"program":19,"name":"3OSC 101 IW","category":"BASS"},{"bank":0,"program":20,"name":"ARTROCKBASS CG","category":"BASS"},{"bank":0,"program":21,"name":"BASSIC","category":"BASS"},{"bank":0,"program":22,"name":"BLOODPR@SS DK","category":"BASS"},{"bank":0,"program":23,"name":"JMJ SEQBASS CG","category":"BASS"},{"bank":0,"program":24,"name":"LIVELY","category":"BASS"},{"bank":0,"program":25,"name":"REZ SWEEP 1 IW","category":"BASS"},{"bank":0,"program":26,"name":"UNIPULSE DK","category":"BASS"},{"bank":0,"program":27,"name":"KICK","category":"DRUM"},{"bank":0,"program":28,"name":"SIMMONS SD1 CG","category":"DRUM"},{"bank":0,"program":29,"name":"SNAREROLL","category":"DRUM"},{"bank":0,"program":30,"name":"AUTOBAHNEN TEK","category":"FX"},{"bank":0,"program":31,"name":"D-FEKT TEK","category":"FX"},{"bank":0,"program":32,"name":"APW PIANO IW","category":"KEYS"},{"bank":0,"program":33,"name":"FRESH DK","category":"KEYS"},{"bank":0,"program":34,"name":"ORGANICS 1 CG","category":"KEYS"},{"bank":0,"program":35,"name":"PLUCKED","category":"KEYS"},{"bank":0,"program":36,"name":"PLUCKY","category":"KEYS"},{"bank":0,"program":37,"name":"LFO","category":"LEAD"},{"bank":0,"program":38,"name":"NAUGHTY2 DK","category":"LEAD"},{"bank":0,"program":39,"name":"NONSTER PULSE","category":"LEAD"},{"bank":0,"program":40,"name":"SAWTEETH","category":"LEAD"},{"bank":0,"program":41,"name":"SINGLE SAW","category":"LEAD"},{"bank":0,"program":42,"name":"SINGING SAW","category":"MONO"},{"bank":0,"program":43,"name":"STANDARD SYNC","category":"MONO"},{"bank":0,"program":44,"name":"CLASSIC","category":"MONO"},{"bank":0,"program":45,"name":"DRIVE","category":"LEAD"},{"bank":0,"program":46,"name":"THICK AND FAT","category":"LEAD"},{"bank":0,"program":47,"name":"FIFTH PULSE","category":"LEAD"},{"bank":0,"program":48,"name":"MACHINE","category":"MONO"},{"bank":0,"program":49,"name":"WEIRD SCHON","category":"MONO"},{"bank":0,"program":50,"name":"SQUARE SYNC","category":"MONO"},{"bank":0,"program":51,"name":"SQUARED","category":"MONO"},{"bank":0,"program":52,"name":"SYNC ATTACK","category":"MONO"},{"bank":0,"program":53,"name":"SWEET SYNC","category":"MONO"},{"bank":0,"program":54,"name":"SOFT DRIVE","category":"MONO"},{"bank":0,"program":55,"name":"FUZZY FUZZ","category":"FX"},{"bank":0,"program":56,"name":"CROSSMOD","category":"LEAD"},{"bank":0,"program":57,"name":"STEREO SYNC","category":"LEAD"},{"bank":0,"program":58,"name":"GLOBAL WARMING","category":"ATMO"},{"bank":0,"program":59,"name":"MINOR SWEEP","category":"ATMO"},{"bank":0,"program":60,"name":"DOUBLE CHORD","category":"PAD"},{"bank":0,"program":61,"name":"FIFTH","category":"PAD"},{"bank":0,"program":62,"name":"ROB STEREO","category":"FX"},{"bank":0,"program":63,"name":"SOFT 5TH & 7TH","category":"FX"},{"bank":0,"program":64,"name":"CLASSIC","category":"BASS"},{"bank":0,"program":65,"name":"FILTERED","category":"BASS"},{"bank":0,"program":66,"name":"EIGHTIES","category":"BASS"},{"bank":0,"program":67,"name":"NINETIES","category":"BASS"},{"bank":0,"program":68,"name":"DISTORTED","category":"BASS"},{"bank":0,"program":69,"name":"DEEP & BORING","category":"BASS"},{"bank":0,"program":70,"name":"SUBSTANDARD","category":"BASS"},{"bank":0,"program":71,"name":"NOT A CLAVINET","category":"MONO"},{"bank":0,"program":72,"name":"SQUARE","category":"BASS"},{"bank":0,"program":73,"name":"HOLLOW ACID","category":"BASS"},{"bank":0,"program":74,"name":"ANALOG BELL","category":"FX"},{"bank":0,"program":75,"name":"BELLISSIMO","category":"FX"},{"bank":0,"program":76,"name":"HIT ON METAL","category":"FX"},{"bank":0,"program":77,"name":"BASS BY ROB","category":"BASS"},{"bank":0,"program":78,"name":"ANLOG CIRCUIT","category":"BASS"},{"bank":0,"program":79,"name":"MY FAVOURITE","category":"ARP"},{"bank":0,"program":80,"name":"PORTAMENTO","category":"ARP"},{"bank":0,"program":81,"name":"CLICKETY-CLICK","category":"ARP"},{"bank":0,"program":82,"name":"FLUTE","category":"ARP"},{"bank":0,"program":83,"name":"MESMERIZED","category":"ARP"},{"bank":0,"program":84,"name":"JUST FILTER","category":"FX"},{"bank":0,"program":85,"name":"PLAIN","category":"ARP"},{"bank":0,"program":86,"name":"FAST RUN","category":"ARP"},{"bank":0,"program":87,"name":"CROSSMOD","category":"ARP"},{"bank":0,"program":88,"name":"CARIBBEAN JIVE","category":"ARP"},{"bank":0,"program":89,"name":"TOO NORMAL","category":"ARP"},{"bank":0,"program":90,"name":"TOO HARSH","category":"FX"},{"bank":0,"program":91,"name":"UNDER WATER","category":"FX"},{"bank":0,"program":92,"name":"RHYTHM'N","category":"BASS"},{"bank":0,"program":93,"name":"BOTTOM KICK","category":"DRUM"},{"bank":0,"program":94,"name":"ANALOG","category":"DRUM"},{"bank":0,"program":95,"name":"NOISE HIT","category":"DRUM"},{"bank":0,"program":96,"name":"TRIGGER HAPPY","category":"FX"},{"bank":0,"program":97,"name":"SETI SUCCESS","category":"FX"},{"bank":0,"program":98,"name":"ADDTHEKICK RL","category":"ARP"},{"bank":0,"program":99,"name":"ARCADE GAME","category":"ARP"},{"bank":1,"program":0,"name":"CHEAP T-BEE RL","category":"ARP"},{"bank":1,"program":1,"name":"DIGIDI JD","category":"ARP"},{"bank":1,"program":2,"name":"DREAM SEQ CG","category":"ARP"},{"bank":1,"program":3,"name":"ENGINE RUN CG","category":"ARP"},{"bank":1,"program":4,"name":"ION DANCE 1 CG","category":"ARP"},{"bank":1,"program":5,"name":"ION DANCE 2 CG","category":"ARP"},{"bank":1,"program":6,"name":"JMJ ARPBASS CG","category":"ARP"},{"bank":1,"program":7,"name":"JUMP 'N RUN","category":"ARP"},{"bank":1,"program":8,"name":"KRAFT-ARP CG","category":"ARP"},{"bank":1,"program":9,"name":"MAGNETICS 1 CG","category":"ARP"},{"bank":1,"program":10,"name":"MAGNETICS 2 CG","category":"ARP"},{"bank":1,"program":11,"name":"MAGNETICS 3 CG","category":"ARP"},{"bank":1,"program":12,"name":"MAGNETICS 4 CG","category":"ARP"},{"bank":1,"program":13,"name":"MAGNETICS 5 CG","category":"ARP"},{"bank":1,"program":14,"name":"MAGNETICS 6 CG","category":"ARP"},{"bank":1,"program":15,"name":"MAID OF","category":"ARP"},{"bank":1,"program":16,"name":"MEEDLES DK","category":"ARP"},{"bank":1,"program":17,"name":"MOD ZAPS JD","category":"ARP"},{"bank":1,"program":18,"name":"OUT OF SYNC","category":"ARP"},{"bank":1,"program":19,"name":"P2 DANCIMG CG","category":"ARP"},{"bank":1,"program":20,"name":"PARAPHONIC","category":"PAD"},{"bank":1,"program":21,"name":"PLUCKY","category":"ARP"},{"bank":1,"program":22,"name":"PUL5E KRAFT CG","category":"ARP"},{"bank":1,"program":23,"name":"REZOMACHINE RL","category":"ARP"},{"bank":1,"program":24,"name":"ROBOT DANCE CG","category":"ARP"},{"bank":1,"program":25,"name":"ROBOTIC","category":"ARP"},{"bank":1,"program":26,"name":"SHORTING TEK","category":"ARP"},{"bank":1,"program":27,"name":"SINPEGGIO JD","category":"ARP"},{"bank":1,"program":28,"name":"SPIRITUALS CG","category":"ARP"},{"bank":1,"program":29,"name":"SWINGER2 DK","category":"ARP"},{"bank":1,"program":30,"name":"TRASHER DK","category":"ARP"},{"bank":1,"program":31,"name":"ULTRAMOD RL","category":"ARP"},{"bank":1,"program":32,"name":"UNRUHE DK","category":"ARP"},{"bank":1,"program":33,"name":"XTRAKTION 1 CG","category":"ARP"},{"bank":1,"program":34,"name":"XTRAKTION 2 CG","category":"ARP"},{"bank":1,"program":35,"name":"XTRAKTION 3 CG","category":"ARP"},{"bank":1,"program":36,"name":"XTRAKTION 4 CG","category":"ARP"},{"bank":1,"program":37,"name":"DE PROFUNDISCG","category":"ATMO"},{"bank":1,"program":38,"name":"ELDRITCHIAN CG","category":"ATMO"},{"bank":1,"program":39,"name":"HOLD & PRESS","category":"ATMO"},{"bank":1,"program":40,"name":"METAMORPHIC CG","category":"ATMO"},{"bank":1,"program":41,"name":"PRESS&WAIT DK","category":"ATMO"},{"bank":1,"program":42,"name":"SWISS ALPES CG","category":"ATMO"},{"bank":1,"program":43,"name":"3 SAW DK","category":"BASS"},{"bank":1,"program":44,"name":"3OCT","category":"BASS"},{"bank":1,"program":45,"name":"ACIDIC BS 1 IW","category":"BASS"},{"bank":1,"program":46,"name":"ACIDIC BS 2 IW","category":"BASS"},{"bank":1,"program":47,"name":"ACIDIC BS 3 IW","category":"BASS"},{"bank":1,"program":48,"name":"ANALOGIQUE1 CG","category":"BASS"},{"bank":1,"program":49,"name":"ANALOGIQUE2 CG","category":"BASS"},{"bank":1,"program":50,"name":"ANALOGIQUE3 CG","category":"BASS"},{"bank":1,"program":51,"name":"ANALOGIQUE4 CG","category":"BASS"},{"bank":1,"program":52,"name":"ANALOGIQUE5 CG","category":"BASS"},{"bank":1,"program":53,"name":"ANALOGUE","category":"BASS"},{"bank":1,"program":54,"name":"ART OF","category":"BASS"},{"bank":1,"program":55,"name":"ATOMIC","category":"BASS"},{"bank":1,"program":56,"name":"BASSTAR","category":"BASS"},{"bank":1,"program":57,"name":"BLOODPR@SS2 DK","category":"BASS"},{"bank":1,"program":58,"name":"BLOODPR@SS3 DK","category":"BASS"},{"bank":1,"program":59,"name":"BRAIN SALAD IW","category":"BASS"},{"bank":1,"program":60,"name":"BROKEN","category":"BASS"},{"bank":1,"program":61,"name":"BUTTERBASS JD","category":"BASS"},{"bank":1,"program":62,"name":"CRISPY","category":"BASS"},{"bank":1,"program":63,"name":"DEEP","category":"BASS"},{"bank":1,"program":64,"name":"DUBBASS","category":"BASS"},{"bank":1,"program":65,"name":"DUBBY DK","category":"BASS"},{"bank":1,"program":66,"name":"DUBBY2 DK","category":"BASS"},{"bank":1,"program":67,"name":"ECHO","category":"BASS"},{"bank":1,"program":68,"name":"ELECTRO ORG RL","category":"BASS"},{"bank":1,"program":69,"name":"FIFTK","category":"BASS"},{"bank":1,"program":70,"name":"FREQUENCY RL","category":"BASS"},{"bank":1,"program":71,"name":"FUZZ BWZZ","category":"BASS"},{"bank":1,"program":72,"name":"FUZZY SAW IW","category":"BASS"},{"bank":1,"program":73,"name":"GIANT","category":"BASS"},{"bank":1,"program":74,"name":"J.D.BASS DK","category":"BASS"},{"bank":1,"program":75,"name":"JUNAUTICA JD","category":"BASS"},{"bank":1,"program":76,"name":"JUNOPULSE DK","category":"BASS"},{"bank":1,"program":77,"name":"JUNOPULSE2 DK","category":"BASS"},{"bank":1,"program":78,"name":"JUNOPULSE3 DK","category":"BASS"},{"bank":1,"program":79,"name":"KNOCK","category":"BASS"},{"bank":1,"program":80,"name":"LIQUID","category":"BASS"},{"bank":1,"program":81,"name":"MASSIVE JD","category":"BASS"},{"bank":1,"program":82,"name":"MEVER MIND DK","category":"BASS"},{"bank":1,"program":83,"name":"MODERN","category":"BASS"},{"bank":1,"program":84,"name":"MOOGY DK","category":"BASS"},{"bank":1,"program":85,"name":"POOG DK","category":"BASS"},{"bank":1,"program":86,"name":"PULSE XOX DK","category":"BASS"},{"bank":1,"program":87,"name":"PULSER DK","category":"BASS"},{"bank":1,"program":88,"name":"PWM","category":"BASS"},{"bank":1,"program":89,"name":"RESOBASS JD","category":"BASS"},{"bank":1,"program":90,"name":"RETRO","category":"BASS"},{"bank":1,"program":91,"name":"REZ SWEEP 2 IW","category":"BASS"},{"bank":1,"program":92,"name":"SHORT","category":"BASS"},{"bank":1,"program":93,"name":"SINGSANG JD","category":"BASS"},{"bank":1,"program":94,"name":"SNAPPY SAWS IW","category":"BASS"},{"bank":1,"program":95,"name":"SUB","category":"BASS"},{"bank":1,"program":96,"name":"SUB","category":"BASS"},{"bank":1,"program":97,"name":"TB SOLO JD","category":"BASS"},{"bank":1,"program":98,"name":"VAIN JD","category":"BASS"},{"bank":1,"program":99,"name":"WOBBLER 1 IW","category":"BASS"},{"bank":2,"program":0,"name":"WOBBLER 2 IW","category":"BASS"},{"bank":2,"program":1,"name":"AUTOBAHN","category":"DRUM"},{"bank":2,"program":2,"name":"CLAP","category":"DRUM"},{"bank":2,"program":3,"name":"CLAP 2","category":"DRUM"},{"bank":2,"program":4,"name":"KICK LOW","category":"DRUM"},{"bank":2,"program":5,"name":"NOISE TOMS1 CG","category":"DRUM"},{"bank":2,"program":6,"name":"NOISE TOMS2 CG","category":"DRUM"},{"bank":2,"program":7,"name":"SDSV TOMS1 CG","category":"DRUM"},{"bank":2,"program":8,"name":"SMARE","category":"DRUM"},{"bank":2,"program":9,"name":"TOM","category":"DRUM"},{"bank":2,"program":10,"name":"ZAPP! KW TEK","category":"DRUM"},{"bank":2,"program":11,"name":"ANSWER = 42 CG","category":"FX"},{"bank":2,"program":12,"name":"BAD SUBWOOFER","category":"FX"},{"bank":2,"program":13,"name":"BIUUU CG","category":"FX"},{"bank":2,"program":14,"name":"BLACKROCKET JD","category":"FX"},{"bank":2,"program":15,"name":"EURORACK DK","category":"FX"},{"bank":2,"program":16,"name":"FIREBALL CG","category":"FX"},{"bank":2,"program":17,"name":"FLYING OBJ JD","category":"FX"},{"bank":2,"program":18,"name":"HIGH HARLEY CG","category":"FX"},{"bank":2,"program":19,"name":"HUGE STORM CG","category":"FX"},{"bank":2,"program":20,"name":"MO P-CORDS TEK","category":"FX"},{"bank":2,"program":21,"name":"NOISE DROP CG","category":"FX"},{"bank":2,"program":22,"name":"PROZESSOR RL","category":"FX"},{"bank":2,"program":23,"name":"S&H DK","category":"FX"},{"bank":2,"program":24,"name":"SAW & HOLD DK","category":"FX"},{"bank":2,"program":25,"name":"SICK","category":"FX"},{"bank":2,"program":26,"name":"SNOW STORM CG","category":"FX"},{"bank":2,"program":27,"name":"SONAR","category":"FX"},{"bank":2,"program":28,"name":"TANGERINES CG","category":"FX"},{"bank":2,"program":29,"name":"THE PLUMMER DK","category":"FX"},{"bank":2,"program":30,"name":"THEREMIN JD","category":"FX"},{"bank":2,"program":31,"name":"TURBO PROP CG","category":"FX"},{"bank":2,"program":32,"name":"WEIRD WAVE CG","category":"FX"},{"bank":2,"program":33,"name":"A BIT KOTO TEK","category":"KEYS"},{"bank":2,"program":34,"name":"APW","category":"KEYS"},{"bank":2,"program":35,"name":"APW ORGAN IW","category":"KEYS"},{"bank":2,"program":36,"name":"BELLS IW","category":"KEYS"},{"bank":2,"program":37,"name":"CARBOMIC","category":"KEYS"},{"bank":2,"program":38,"name":"DET ORGAN JD","category":"KEYS"},{"bank":2,"program":39,"name":"DST CHORD JD","category":"KEYS"},{"bank":2,"program":40,"name":"E-ORGAN TEK","category":"KEYS"},{"bank":2,"program":41,"name":"E. GRAND 1 IW","category":"KEYS"},{"bank":2,"program":42,"name":"E. GRAND 2 IW","category":"KEYS"},{"bank":2,"program":43,"name":"FLUTE TEK","category":"KEYS"},{"bank":2,"program":44,"name":"HARPSICKEYS IW","category":"KEYS"},{"bank":2,"program":45,"name":"HITCHY JD","category":"KEYS"},{"bank":2,"program":46,"name":"LEGATO-ATO TEK","category":"KEYS"},{"bank":2,"program":47,"name":"MAGIC FLY JD","category":"KEYS"},{"bank":2,"program":48,"name":"NICRO SWEEP JD","category":"KEYS"},{"bank":2,"program":49,"name":"NOVIESTAR JD","category":"KEYS"},{"bank":2,"program":50,"name":"ORGANICS 2 CG","category":"KEYS"},{"bank":2,"program":51,"name":"ORGANICS 3 CG","category":"KEYS"},{"bank":2,"program":52,"name":"PLUCKED 2","category":"KEYS"},{"bank":2,"program":53,"name":"RAVE ORGAN JD","category":"KEYS"},{"bank":2,"program":54,"name":"REVERS ACC JD","category":"KEYS"},{"bank":2,"program":55,"name":"REZZY BP IW","category":"KEYS"},{"bank":2,"program":56,"name":"SILICON 64 JD","category":"KEYS"},{"bank":2,"program":57,"name":"SYNCED KEY","category":"KEYS"},{"bank":2,"program":58,"name":"UNIRAVE DK","category":"KEYS"},{"bank":2,"program":59,"name":"WHABBAWHEEL JD","category":"KEYS"},{"bank":2,"program":60,"name":"XTC ACID JD","category":"KEYS"},{"bank":2,"program":61,"name":"101 BRASS 1 IW","category":"LEAD"},{"bank":2,"program":62,"name":"101 BRASS 2 IW","category":"LEAD"},{"bank":2,"program":63,"name":"12AU7 TUBE TEK","category":"LEAD"},{"bank":2,"program":64,"name":"20 TO 100 IW","category":"LEAD"},{"bank":2,"program":65,"name":"3 SQUARES IW","category":"LEAD"},{"bank":2,"program":66,"name":"3 TUNED BP IW","category":"LEAD"},{"bank":2,"program":67,"name":"3OCT SAW 1 IW","category":"LEAD"},{"bank":2,"program":68,"name":"3OCT SAW 2 IW","category":"LEAD"},{"bank":2,"program":69,"name":"3OCT SQUARE IW","category":"LEAD"},{"bank":2,"program":70,"name":"3OCT TRI IW","category":"LEAD"},{"bank":2,"program":71,"name":"70'S","category":"LEAD"},{"bank":2,"program":72,"name":"70S FUNK LD IW","category":"LEAD"},{"bank":2,"program":73,"name":"ABACAB IW","category":"LEAD"},{"bank":2,"program":74,"name":"AGGRESSOR IW","category":"LEAD"},{"bank":2,"program":75,"name":"ANAZING IW","category":"LEAD"},{"bank":2,"program":76,"name":"AQUATARKUS IW","category":"LEAD"},{"bank":2,"program":77,"name":"BP TRIANGLE IW","category":"LEAD"},{"bank":2,"program":78,"name":"BAAHNPASS IW","category":"LEAD"},{"bank":2,"program":79,"name":"CELLPHONE DK","category":"LEAD"},{"bank":2,"program":80,"name":"CLARINET IW","category":"LEAD"},{"bank":2,"program":81,"name":"CRAZY KNOBS RL","category":"LEAD"},{"bank":2,"program":82,"name":"DRIVE LIGHT DK","category":"LEAD"},{"bank":2,"program":83,"name":"DRIVER SEAT CG","category":"LEAD"},{"bank":2,"program":84,"name":"DRONE LD 1 IW","category":"LEAD"},{"bank":2,"program":85,"name":"DRONE LD 2 IW","category":"LEAD"},{"bank":2,"program":86,"name":"DUCK LD IW","category":"LEAD"},{"bank":2,"program":87,"name":"DUCKY DK","category":"LEAD"},{"bank":2,"program":88,"name":"ELECTRONICA IW","category":"LEAD"},{"bank":2,"program":89,"name":"FAKE DELAYS RL","category":"LEAD"},{"bank":2,"program":90,"name":"FAKE DISTO","category":"LEAD"},{"bank":2,"program":91,"name":"FAT BP REZ IW","category":"LEAD"},{"bank":2,"program":92,"name":"FAT REZ LD IW","category":"LEAD"},{"bank":2,"program":93,"name":"FIFTHS LD IW","category":"LEAD"},{"bank":2,"program":94,"name":"FILTER FM IW","category":"LEAD"},{"bank":2,"program":95,"name":"FLUTE IW","category":"LEAD"},{"bank":2,"program":96,"name":"FUSION IW","category":"LEAD"},{"bank":2,"program":97,"name":"FUZZY BEAR CG","category":"LEAD"},{"bank":2,"program":98,"name":"FUZZYGUITAR IW","category":"LEAD"},{"bank":2,"program":99,"name":"GOOM IW","category":"LEAD"},{"bank":3,"program":0,"name":"GROWLING BP IW","category":"LEAD"},{"bank":3,"program":1,"name":"HARDROON JD","category":"LEAD"},{"bank":3,"program":2,"name":"HARSH","category":"LEAD"},{"bank":3,"program":3,"name":"HIGH SKY IW","category":"LEAD"},{"bank":3,"program":4,"name":"HORN IW","category":"LEAD"},{"bank":3,"program":5,"name":"LD DELIGHT IW","category":"LEAD"},{"bank":3,"program":6,"name":"LESS DTUME TEK","category":"LEAD"},{"bank":3,"program":7,"name":"LITTLEPULSE CG","category":"LEAD"},{"bank":3,"program":8,"name":"LOW BRASS IW","category":"LEAD"},{"bank":3,"program":9,"name":"LYLEISH IW","category":"LEAD"},{"bank":3,"program":10,"name":"MISBEHAVE DK","category":"LEAD"},{"bank":3,"program":11,"name":"MYSTICLEAD CG","category":"LEAD"},{"bank":3,"program":12,"name":"NASAL","category":"LEAD"},{"bank":3,"program":13,"name":"NEG SWEEP IW","category":"LEAD"},{"bank":3,"program":14,"name":"NOISY BP LD IW","category":"LEAD"},{"bank":3,"program":15,"name":"OBOE IW","category":"LEAD"},{"bank":3,"program":16,"name":"P2 SINGING CG","category":"LEAD"},{"bank":3,"program":17,"name":"PARAPHASED CG","category":"LEAD"},{"bank":3,"program":18,"name":"PHAT","category":"LEAD"},{"bank":3,"program":19,"name":"PITCH DOWN IW","category":"LEAD"},{"bank":3,"program":20,"name":"PULSE2","category":"LEAD"},{"bank":3,"program":21,"name":"PULSEWELT DK","category":"LEAD"},{"bank":3,"program":22,"name":"RAVE MATION JD","category":"LEAD"},{"bank":3,"program":23,"name":"RETRO","category":"LEAD"},{"bank":3,"program":24,"name":"REVIVAL LD CG","category":"LEAD"},{"bank":3,"program":25,"name":"RIWER DEEP CG","category":"LEAD"},{"bank":3,"program":26,"name":"S+H BPF IW","category":"LEAD"},{"bank":3,"program":27,"name":"SEVENTH HP IW","category":"LEAD"},{"bank":3,"program":28,"name":"SH-IOLIN IW","category":"LEAD"},{"bank":3,"program":29,"name":"SINGING HPF 1W","category":"LEAD"},{"bank":3,"program":30,"name":"SINOID LD IW","category":"LEAD"},{"bank":3,"program":31,"name":"SIZZLER IW","category":"LEAD"},{"bank":3,"program":32,"name":"SLOW SYNC IW","category":"LEAD"},{"bank":3,"program":33,"name":"STEREO LD 2 CG","category":"LEAD"},{"bank":3,"program":34,"name":"STEREO","category":"LEAD"},{"bank":3,"program":35,"name":"STEVE W. TEK","category":"LEAD"},{"bank":3,"program":36,"name":"SYNC LD 1 IW","category":"LEAD"},{"bank":3,"program":37,"name":"SYNC LD 2 IW","category":"LEAD"},{"bank":3,"program":38,"name":"THE PULSE RL","category":"LEAD"},{"bank":3,"program":39,"name":"UNI SQUARE IW","category":"LEAD"},{"bank":3,"program":40,"name":"URANUS IW","category":"LEAD"},{"bank":3,"program":41,"name":"WHISTLER IW","category":"LEAD"},{"bank":3,"program":42,"name":"WHITE ROCK IW","category":"LEAD"},{"bank":3,"program":43,"name":"ANALOG WARMTH","category":"MONO"},{"bank":3,"program":44,"name":"ART OF SYNT CG","category":"MONO"},{"bank":3,"program":45,"name":"BPPULSE DK","category":"MONO"},{"bank":3,"program":46,"name":"CIRCUIT BENT","category":"MONO"},{"bank":3,"program":47,"name":"CLASSIC MOD CG","category":"MONO"},{"bank":3,"program":48,"name":"DRAFT FUNK CG","category":"MONO"},{"bank":3,"program":49,"name":"ENOLA JD","category":"MONO"},{"bank":3,"program":50,"name":"FUJIYAMA CG","category":"MONO"},{"bank":3,"program":51,"name":"KRAFTMAX CG","category":"MONO"},{"bank":3,"program":52,"name":"MINI MOOD CG","category":"MONO"},{"bank":3,"program":53,"name":"MODERN PAST CG","category":"MONO"},{"bank":3,"program":54,"name":"PANNER DK","category":"MONO"},{"bank":3,"program":55,"name":"POINT OF VIEW","category":"MONO"},{"bank":3,"program":56,"name":"PURE PULSE2 CG","category":"MONO"},{"bank":3,"program":57,"name":"SECRETGARD JD","category":"MONO"},{"bank":3,"program":58,"name":"SHORTY DK","category":"MONO"},{"bank":3,"program":59,"name":"TOKYO TUNE CG","category":"MONO"},{"bank":3,"program":60,"name":"TUCKER DK","category":"MONO"},{"bank":3,"program":61,"name":"TUCKER2 DK","category":"MONO"},{"bank":3,"program":62,"name":"70'S","category":"PAD"},{"bank":3,"program":63,"name":"ABENDROT CG","category":"PAD"},{"bank":3,"program":64,"name":"ABENDSTERN CG","category":"PAD"},{"bank":3,"program":65,"name":"ANTIQUE","category":"PAD"},{"bank":3,"program":66,"name":"APWSTRINGS IW","category":"PAD"},{"bank":3,"program":67,"name":"BP STRINGS IW","category":"PAD"},{"bank":3,"program":68,"name":"BRASSY","category":"PAD"},{"bank":3,"program":69,"name":"BREATHY","category":"PAD"},{"bank":3,"program":70,"name":"FADING","category":"PAD"},{"bank":3,"program":71,"name":"FATTY","category":"PAD"},{"bank":3,"program":72,"name":"GLORIA","category":"PAD"},{"bank":3,"program":73,"name":"HIGHSTRINGS IW","category":"PAD"},{"bank":3,"program":74,"name":"INFLUX IW","category":"PAD"},{"bank":3,"program":75,"name":"LEIT@R DK","category":"PAD"},{"bank":3,"program":76,"name":"OLD HARMONY CG","category":"PAD"},{"bank":3,"program":77,"name":"PAD PANNER JD","category":"PAD"},{"bank":3,"program":78,"name":"PWM","category":"PAD"},{"bank":3,"program":79,"name":"PWM","category":"PAD"},{"bank":3,"program":80,"name":"QUADRO-PAD CG","category":"PAD"},{"bank":3,"program":81,"name":"SOFT PULSE2 CG","category":"PAD"},{"bank":3,"program":82,"name":"SOFTSTRINGS IW","category":"PAD"},{"bank":3,"program":83,"name":"STRINGPULSE CG","category":"PAD"},{"bank":3,"program":84,"name":"WIDE PULSE2 CG","category":"PAD"},{"bank":3,"program":85,"name":"HIHAT","category":"PERC"},{"bank":3,"program":86,"name":"Z@PPA DK","category":"PERC"},{"bank":3,"program":87,"name":"Z@PPER2 DK","category":"PERC"},{"bank":3,"program":88,"name":"ZWITSCHER CG","category":"PERC"},{"bank":3,"program":89,"name":"4-VOICE","category":"PAD"},{"bank":3,"program":90,"name":"8-VOICE PWM","category":"POLY"},{"bank":3,"program":91,"name":"APW","category":"POLY"},{"bank":3,"program":92,"name":"BRASSERERIE DK","category":"POLY"},{"bank":3,"program":93,"name":"DAS MODEL CG","category":"POLY"},{"bank":3,"program":94,"name":"FULL PULSE CG","category":"POLY"},{"bank":3,"program":95,"name":"FUNKADELIC","category":"POLY"},{"bank":3,"program":96,"name":"HARMONICS IW","category":"POLY"},{"bank":3,"program":97,"name":"HOOVER DK","category":"POLY"},{"bank":3,"program":98,"name":"MORPI LFO","category":"POLY"},{"bank":3,"program":99,"name":"NEED PRESSURE","category":"POLY"},{"bank":4,"program":0,"name":"PAD P2 DK","category":"POLY"},{"bank":4,"program":1,"name":"POLI 80IES TEK","category":"POLY"},{"bank":4,"program":2,"name":"POLY CELLO CG","category":"POLY"},{"bank":4,"program":3,"name":"POLY PULSE CG","category":"POLY"},{"bank":4,"program":4,"name":"POLYNOISIA","category":"POLY"},{"bank":4,"program":5,"name":"POLYP2 DK","category":"POLY"},{"bank":4,"program":6,"name":"PULSEWIDTH","category":"POLY"},{"bank":4,"program":7,"name":"STAKKER A CG","category":"POLY"},{"bank":4,"program":8,"name":"UNI GUITAR IW","category":"POLY"},{"bank":4,"program":9,"name":"UNISON SQUARE","category":"POLY"},{"bank":4,"program":10,"name":"INIT","category":"NONE"},{"bank":4,"program":11,"name":"INIT","category":"NONE"},{"bank":4,"program":12,"name":"INIT","category":"NONE"},{"bank":4,"program":13,"name":"INIT","category":"NONE"},{"bank":4,"program":14,"name":"INIT","category":"NONE"},{"bank":4,"program":15,"name":"INIT","category":"NONE"},{"bank":4,"program":16,"name":"INIT","category":"NONE"},{"bank":4,"program":17,"name":"INIT","category":"NONE"},{"bank":4,"program":18,"name":"INIT","category":"NONE"},{"bank":4,"program":19,"name":"INIT","category":"NONE"},{"bank":4,"program":20,"name":"INIT","category":"NONE"},{"bank":4,"program":21,"name":"INIT","category":"NONE"},{"bank":4,"program":22,"name":"INIT","category":"NONE"},{"bank":4,"program":23,"name":"INIT","category":"NONE"},{"bank":4,"program":24,"name":"INIT","category":"NONE"},{"bank":4,"program":25,"name":"INIT","category":"NONE"},{"bank":4,"program":26,"name":"INIT","category":"NONE"},{"bank":4,"program":27,"name":"INIT","category":"NONE"},{"bank":4,"program":28,"name":"INIT","category":"NONE"},{"bank":4,"program":29,"name":"INIT","category":"NONE"},{"bank":4,"program":30,"name":"INIT","category":"NONE"},{"bank":4,"program":31,"name":"INIT","category":"NONE"},{"bank":4,"program":32,"name":"INIT","category":"NONE"},{"bank":4,"program":33,"name":"INIT","category":"NONE"},{"bank":4,"program":34,"name":"INIT","category":"NONE"},{"bank":4,"program":35,"name":"INIT","category":"NONE"},{"bank":4,"program":36,"name":"INIT","category":"NONE"},{"bank":4,"program":37,"name":"INIT","category":"NONE"},{"bank":4,"program":38,"name":"INIT","category":"NONE"},{"bank":4,"program":39,"name":"INIT","category":"NONE"},{"bank":4,"program":40,"name":"INIT","category":"NONE"},{"bank":4,"program":41,"name":"INIT","category":"NONE"},{"bank":4,"program":42,"name":"INIT","category":"NONE"},{"bank":4,"program":43,"name":"INIT","category":"NONE"},{"bank":4,"program":44,"name":"INIT","category":"NONE"},{"bank":4,"program":45,"name":"INIT","category":"NONE"},{"bank":4,"program":46,"name":"INIT","category":"NONE"},{"bank":4,"program":47,"name":"INIT","category":"NONE"},{"bank":4,"program":48,"name":"INIT","category":"NONE"},{"bank":4,"program":49,"name":"INIT","category":"NONE"},{"bank":4,"program":50,"name":"INIT","category":"NONE"},{"bank":4,"program":51,"name":"INIT","category":"NONE"},{"bank":4,"program":52,"name":"INIT","category":"NONE"},{"bank":4,"program":53,"name":"INIT","category":"NONE"},{"bank":4,"program":54,"name":"INIT","category":"NONE"},{"bank":4,"program":55,"name":"INIT","category":"NONE"},{"bank":4,"program":56,"name":"INIT","category":"NONE"},{"bank":4,"program":57,"name":"INIT","category":"NONE"},{"bank":4,"program":58,"name":"INIT","category":"NONE"},{"bank":4,"program":59,"name":"INIT","category":"NONE"},{"bank":4,"program":60,"name":"INIT","category":"NONE"},{"bank":4,"program":61,"name":"INIT","category":"NONE"},{"bank":4,"program":62,"name":"INIT","category":"NONE"},{"bank":4,"program":63,"name":"INIT","category":"NONE"},{"bank":4,"program":64,"name":"INIT","category":"NONE"},{"bank":4,"program":65,"name":"INIT","category":"NONE"},{"bank":4,"program":66,"name":"INIT","category":"NONE"},{"bank":4,"program":67,"name":"INIT","category":"NONE"},{"bank":4,"program":68,"name":"INIT","category":"NONE"},{"bank":4,"program":69,"name":"INIT","category":"NONE"},{"bank":4,"program":70,"name":"INIT","category":"NONE"},{"bank":4,"program":71,"name":"INIT","category":"NONE"},{"bank":4,"program":72,"name":"INIT","category":"NONE"},{"bank":4,"program":73,"name":"INIT","category":"NONE"},{"bank":4,"program":74,"name":"INIT","category":"NONE"},{"bank":4,"program":75,"name":"INIT","category":"NONE"},{"bank":4,"program":76,"name":"INIT","category":"NONE"},{"bank":4,"program":77,"name":"INIT","category":"NONE"},{"bank":4,"program":78,"name":"INIT","category":"NONE"},{"bank":4,"program":79,"name":"INIT","category":"NONE"},{"bank":4,"program":80,"name":"INIT","category":"NONE"},{"bank":4,"program":81,"name":"INIT","category":"NONE"},{"bank":4,"program":82,"name":"INIT","category":"NONE"},{"bank":4,"program":83,"name":"INIT","category":"NONE"},{"bank":4,"program":84,"name":"INIT","category":"NONE"},{"bank":4,"program":85,"name":"INIT","category":"NONE"},{"bank":4,"program":86,"name":"INIT","category":"NONE"},{"bank":4,"program":87,"name":"INIT","category":"NONE"},{"bank":4,"program":88,"name":"INIT","category":"NONE"},{"bank":4,"program":89,"name":"INIT","category":"NONE"},{"bank":4,"program":90,"name":"INIT","category":"NONE"},{"bank":4,"program":91,"name":"INIT","category":"NONE"},{"bank":4,"program":92,"name":"INIT","category":"NONE"},{"bank":4,"program":93,"name":"INIT","category":"NONE"},{"bank":4,"program":94,"name":"INIT","category":"NONE"},{"bank":4,"program":95,"name":"INIT","category":"NONE"},{"bank":4,"program":96,"name":"INIT","category":"NONE"},{"bank":4,"program":97,"name":"INIT","category":"NONE"},{"bank":4,"program":98,"name":"INIT","category":"NONE"},{"bank":4,"program":99,"name":"RANDOM","category":"NONE"}]},{"schema":"tabby-device/1","version":"0.2","id":"zoom-ms-70cdr-plus","name":"Zoom MS-70CDR+","maker":"Zoom","kind":"effect","firmware":"MS-70CDR+ system software 1.20 (January 2025); MIDI implementation chart 1.00 (2024-03-01)","midiIn":{"connector":"USB-C only (a USB MIDI device, bus-powered); no DIN, no TRS","trs":null,"note":"Needs a USB host: H4MIDI WC USB-A through the powered hub, port filter: channel 16 only, program change only."},"clock":{"receives":false,"syncs":"nothing (chart: clock x)","setting":""},"channelSetting":"MENU > USB MIDI CH = 16 (not OMNI: in OMNI every program change on the chain would switch patches).","channel":{"default":16,"note":"MENU > USB MIDI CH = 1..16 or OMNI (memorised). USB MIDI only: the pedal is a USB device and needs a USB host (CME H4MIDI WC in this rig). Factory default not stated; 16 is this rig's setting."},"programChange":{"supported":true,"displayBase":1,"programs":100,"bankFormat":"none","pad":3,"bankSelect":{"scheme":"none","banks":[]},"gapMs":0,"gapAfter":"program","note":"Patches are displayed 001..100; the chart lists PC 0-100 'true number 0-100' without a mapping, so whether PC 0 or PC 1 is patch 001 is unverified (displayBase 1 assumed; change it after the hardware check)."},"controllers":[],"setup":["MENU > USB MIDI CH = 16 (set it: the factory default is not documented and OMNI would take every program change).","H4MIDI WC: the pedal on a USB host port behind the powered hub, that port filtered to channel 16 and program change only.","Connect the USB host before the set; the pedal shows a USB CONNECT prompt on batteries.","Hardware check: send PC 0 and PC 1 and note which patch the display shows; set displayBase accordingly."],"notes":["No control change and no SysEx are recognised (chart); patch selection is the only MIDI function.","Factory patches 001..080 from Zoom's patch list; 081..100 are empty user slots."],"sources":[{"title":"MS-70CDR+ Operation Manual (chart p. 69, USB MIDI CH p. 59)","url":"https://zoomcorp.com/media/documents/E_MS-70CDRplus.pdf","detail":"chart dated Mar. 1, 2024, version 1.00"},{"title":"MS-70CDR+ Patch Memory List, preset ver. 1.00","url":"https://zoomcorp.com/media/documents/E_MS-70CDRplus_Patchlist.pdf","detail":"80 factory patches"}],"unverified":["channel.default","programChange.displayBase","class compliance behind a USB host (not in CME's list)","patch change delay"],"presets":[{"bank":null,"program":0,"name":"C-D-R+"},{"bank":null,"program":1,"name":"63 Spring Reverb"},{"bank":null,"program":2,"name":"Silky Tape Echo"},{"bank":null,"program":3,"name":"Phase Room"},{"bank":null,"program":4,"name":"Shimmer Reverb+"},{"bank":null,"program":5,"name":"Long Echo"},{"bank":null,"program":6,"name":"69s Vibe"},{"bank":null,"program":7,"name":"Mangle Ice"},{"bank":null,"program":8,"name":"LO-FI Noise"},{"bank":null,"program":9,"name":"Small & Smooth"},{"bank":null,"program":10,"name":"Modulation Delay 1&2"},{"bank":null,"program":11,"name":"Pipe Organ"},{"bank":null,"program":12,"name":"Pop Chorus"},{"bank":null,"program":13,"name":"Deep Blue"},{"bank":null,"program":14,"name":"Dual Reverb"},{"bank":null,"program":15,"name":"Rotary"},{"bank":null,"program":16,"name":"Stairway"},{"bank":null,"program":17,"name":"Tape Echo 3"},{"bank":null,"program":18,"name":"Filter Pad"},{"bank":null,"program":19,"name":"BPM Sync Delay"},{"bank":null,"program":20,"name":"Kick Flanger"},{"bank":null,"program":21,"name":"Ambient"},{"bank":null,"program":22,"name":"Chorus One"},{"bank":null,"program":23,"name":"Green Chorus"},{"bank":null,"program":24,"name":"Orange Tremolo"},{"bank":null,"program":25,"name":"Vibrato"},{"bank":null,"program":26,"name":"Swell Vibrato"},{"bank":null,"program":27,"name":"Analog Chorus"},{"bank":null,"program":28,"name":"BF Flanger 2"},{"bank":null,"program":29,"name":"Jet Flanger"},{"bank":null,"program":30,"name":"Clone Chorus"},{"bank":null,"program":31,"name":"Detune"},{"bank":null,"program":32,"name":"Phaser"},{"bank":null,"program":33,"name":"Duo Phaser"},{"bank":null,"program":34,"name":"Tremolo-Pan"},{"bank":null,"program":35,"name":"Slicer"},{"bank":null,"program":36,"name":"Tri Chorus"},{"bank":null,"program":37,"name":"Polyphonic Octaver"},{"bank":null,"program":38,"name":"Bass Analog Octaver"},{"bank":null,"program":39,"name":"Polyphonic Pitch Shifter"},{"bank":null,"program":40,"name":"Geminos Doubler"},{"bank":null,"program":41,"name":"AC Tape Echo"},{"bank":null,"program":42,"name":"Smooth Delay"},{"bank":null,"program":43,"name":"Rockabilly"},{"bank":null,"program":44,"name":"Digital Delay"},{"bank":null,"program":45,"name":"Soft Echo"},{"bank":null,"program":46,"name":"Drive Echo"},{"bank":null,"program":47,"name":"Dual Delay"},{"bank":null,"program":48,"name":"Trigger Hold Delay"},{"bank":null,"program":49,"name":"Drunkship"},{"bank":null,"program":50,"name":"FD Spring Reverb"},{"bank":null,"program":51,"name":"Chamber Reverb"},{"bank":null,"program":52,"name":"Church Reverb"},{"bank":null,"program":53,"name":"Cave Reverb"},{"bank":null,"program":54,"name":"Slap Back Reverb"},{"bank":null,"program":55,"name":"Gate Reverb"},{"bank":null,"program":56,"name":"Long Plate"},{"bank":null,"program":57,"name":"Loop Roll"},{"bank":null,"program":58,"name":"Hold Delay"},{"bank":null,"program":59,"name":"Hold Reverb"},{"bank":null,"program":60,"name":"Higher"},{"bank":null,"program":61,"name":"Guitar Strings"},{"bank":null,"program":62,"name":"Pad Guitar"},{"bank":null,"program":63,"name":"Synchronized"},{"bank":null,"program":64,"name":"Reverse"},{"bank":null,"program":65,"name":"12 Strings"},{"bank":null,"program":66,"name":"Delay & Delay"},{"bank":null,"program":67,"name":"Mono Synth"},{"bank":null,"program":68,"name":"Voice Reverse"},{"bank":null,"program":69,"name":"Sequence Filter"},{"bank":null,"program":70,"name":"Hollywood"},{"bank":null,"program":71,"name":"Monument"},{"bank":null,"program":72,"name":"Robot"},{"bank":null,"program":73,"name":"Magical Warp"},{"bank":null,"program":74,"name":"Adamski"},{"bank":null,"program":75,"name":"Ring Noise"},{"bank":null,"program":76,"name":"Ducking"},{"bank":null,"program":77,"name":"Eraserhead"},{"bank":null,"program":78,"name":"Sound EFX"},{"bank":null,"program":79,"name":"Bomber+"}]}];
globalThis.FM1_RIG_PROFILES = [{"schema":"tabby-rig/1","name":"Wrong Room","builtin":true,"version":"0.1","notes":["Classic Tabby (SMK-37 Pro) is the clock master and sends on every port; one channel per device.","Channels 5 to 8 are Classic Tabby's Proteus/2 XR parts 1 to 4. The second controller's Proteus parts use any other channel; the Proteus hears Classic Tabby through H4MIDI WC MIDI OUT 2 filtered to channels 5 to 8.","Channel 9 is the FM6 internal engine, pinned to Tabby track 8 (SEQ = LOCAL on the device). Nothing external listens on it.","M8 parts: channel 4 = M8 track 1, 10 = track 2, 13 = track 3 (PG CHANGE on, SYNC IN clock+transport+SPP).","FM-1 A (channel 2) and FM-1 B (channel 3): each on its own H4MIDI WC USB host port behind the hub, the port filtered to its channel; a Skiff 2.2 unit needs no filter (T1 CHANNEL = its channel, the rest OFF).","H4MIDI WC: DIN IN 1 = Classic Tabby (3.5 mm MIDI OUT adapter), DIN IN 2 = the second controller, OUT 1 = Thru5 WC (unfiltered), OUT 2 = Proteus (filter: pass channels 5-8 from IN 1; IN 2 unfiltered), USB host 1 = FM-1 A (filter: channel 2), host 2 = FM-1 B (filter: channel 3), host 3 = Zoom (filter: channel 16, program change only). DIN IN does not route to DIN OUT by default: build this preset in HxMIDI Tools.","Audio-only gear with no MIDI: Boss RE-2 Space Echo (delay time by hand or tap)."],"channels":[{"device":"instruo-seashell","name":"Seashell","gapMs":null,"leadMs":0,"programs":{},"port":"Thru5 WC, DIN to TRS type A","track":null},{"device":"mvave-fm1-skiff","name":"FM-1 A","gapMs":null,"leadMs":0,"programs":{},"port":"H4MIDI USB host 1 (hub), filter: channel 2 only; firmware chosen by the device field","track":null},{"device":"mvave-fm1-skiff","name":"FM-1 B","gapMs":null,"leadMs":0,"programs":{},"port":"H4MIDI USB host 2 (hub), filter: channel 3 only; firmware chosen by the device field","track":null},{"device":"dirtywave-m8","name":"M8 part 1 (M8 track 1)","gapMs":null,"leadMs":0,"programs":{},"port":"Thru5 WC, DIN to TRS type A","track":null},{"device":"emu-proteus-2-xr","name":"Proteus part 1","gapMs":null,"leadMs":0,"programs":{},"port":"H4MIDI MIDI OUT 2, filter: channels 5-8","track":null},{"device":"emu-proteus-2-xr","name":"Proteus part 2","gapMs":null,"leadMs":0,"programs":{},"port":"H4MIDI MIDI OUT 2, filter: channels 5-8","track":null},{"device":"emu-proteus-2-xr","name":"Proteus part 3","gapMs":null,"leadMs":0,"programs":{},"port":"H4MIDI MIDI OUT 2, filter: channels 5-8","track":null},{"device":"emu-proteus-2-xr","name":"Proteus part 4","gapMs":null,"leadMs":0,"programs":{},"port":"H4MIDI MIDI OUT 2, filter: channels 5-8","track":null},{"device":"smk37-fm6-internal","name":"FM6 internal","gapMs":null,"leadMs":0,"programs":{},"port":"internal (Tabby track 8, SEQ = LOCAL)","track":8},{"device":"dirtywave-m8","name":"M8 part 2 (M8 track 2)","gapMs":null,"leadMs":0,"programs":{},"port":"Thru5 WC, DIN to TRS type A","track":null},{"device":"tone-king-royalist","name":"Royalist","gapMs":null,"leadMs":0,"programs":{},"port":"Thru5 WC, DIN (channel 11 set in the Synergy editor)","track":null},{"device":"chase-bliss-brothers","name":"Brothers","gapMs":null,"leadMs":0,"programs":{},"port":"Thru5 WC > Chase Bliss MIDIbox (RING) > TRS","track":null},{"device":"dirtywave-m8","name":"M8 part 3 (M8 track 3)","gapMs":null,"leadMs":0,"programs":{},"port":"Thru5 WC, DIN to TRS type A","track":null},{"device":"strymon-nightsky","name":"NightSky","gapMs":null,"leadMs":0,"programs":{},"port":"Thru5 WC, DIN MIDI IN","track":null},{"device":"eventide-h90","name":"H90","gapMs":255,"leadMs":0,"programs":{},"port":"Thru5 WC, DIN MIDI IN (gap 255 ms after a program change, the field maximum: the CC-after-PC bug, users report about 300 ms)","track":null},{"device":"zoom-ms-70cdr-plus","name":"Zoom","gapMs":null,"leadMs":0,"programs":{},"port":"H4MIDI USB host 3 (hub), filter: channel 16, program change only","track":null}]}];
globalThis.FM1_GUIDE_TEMPLATE = "# Writing MIDI files for Classic Tabby\n\n<!-- docs/MIDI-GUIDE.template.md: the hand-written part of the guide. tools/linux/midi-guide.mjs\n     (web/rig/guide.js) fills every placeholder token (double braces) from the rig profile and the device library and\n     writes docs/MIDI-GUIDE.md; the workbench's Import MIDI panel generates the same file for the\n     active rig. Edit this template, never the generated file. Version 0.4, 2026-11-12.\n     Revision log: v0.4 2026-11-12 (Task 16): section 14, song notes no longer wait for the 10 ms pass (fast MIDI, tabby-v04.2);\n     a song follows an external clock over USB or Bluetooth (tabby-v04.3). v0.3 2026-11-10 (Task 14): section 14, the TRS jack is output only; external clock\n     over USB through the H4MIDI WC. v0.2 2026-11-10 (Task 13 Step 3): section 14, the recommended live wiring (one DIN\n     cable per device through the H4MIDI WC). v0.1 2026-11-05 (Task 09), from the hand-written guide\n     of 2026-11-05 (tabby-v03.1). -->\n\nInstructions for an AI model (Claude, ChatGPT or another) that writes Standard MIDI files to be imported into Classic Tabby, the custom firmware on an M-VAVE SMK-37 Pro. Read all of it before writing a file. Rules marked MUST are hard limits of the importer or the device. Breaking them loses notes or gets the file refused.\n\nWritten for Classic Tabby {{VERSION}} and the rig profile \"{{RIG_NAME}}\" ({{GENERATED}}). The rules come from the importer source (web/import/midi-song.js) and the spec (docs/SPEC.md sections 7 to 13) at https://github.com/SeattleUser0/classic-tabby. Sections 8, 9 and 11 and the rig tables in Appendix B are generated from the rig profile (web/rig/profiles/) and the device definitions (web/devices/); do not edit them by hand.\n\n## 1. What Classic Tabby does with the file\n\n- The workbench web page reads the .mid file and turns it into one song. A song has up to {{TRACKS}} tracks and up to {{ROWS_MAX}} rows.\n- A row is a slice of the song, normally 4 bars of 4/4 (64 sixteenth-note steps). Each track's notes in a row form a block. Blocks that are byte for byte identical are stored once and reused.\n- Timing is kept exactly as written. The importer does not quantize. A note keeps its offset from the 16th grid and its exact length, at a resolution of 1/{{UNITS}} of a 16th note.\n- Each row is also a performance unit. On stage the player jumps the whole song to a row (a scene change), or launches one track's block from any row on its own (track launching). So rows should start where musical sections start, and each track's part in a row should make sense when it loops by itself.\n- The SMK-37 is the MIDI clock master and sends notes out over MIDI to external synths. Each Tabby track sends on one MIDI channel: the channel of the part you wrote (section 8).\n\n## 2. File format (MUST)\n\n- Standard MIDI File, binary, format 1. Format 0 is accepted, but use format 1.\n- Time division in ticks per quarter note (PPQ). Use 480. 960 is also fine. Any PPQ that divides 1920 is exact (96, 120, 192, 240, 384, 480, 960, 1920). Other values get rounded. SMPTE time division is refused.\n- Track 0 is the conductor track: one set_tempo and one time_signature, both at tick 0, then end_of_track. No notes.\n- One MIDI track per instrument part, each with a track_name, all its events on one MIDI channel, and an end_of_track. Never put two channels in one track.\n- At most {{TRACKS}} parts with notes. A part is one MIDI track on one channel. Parts beyond {{TRACKS}} are not imported unless the user reassigns them by hand.\n- Every note_on with velocity 1 to 127 has a matching note_off on the same channel and pitch. A note_on with velocity 0 counts as a note_off.\n- File name: short ASCII. The first {{NAME_LENGTH}} characters, upper-cased, become the song name.\n\n## 3. Tempo and meter\n\n- One tempo for the whole song. A whole number of BPM from {{TEMPO_MIN}} to {{TEMPO_MAX}}. Fractions are rounded. Tempo changes after the first are ignored.\n- One time signature for the whole song. Later changes are ignored. 4/4 is the default and the best choice.\n- Row length follows the meter: 4/4 gives 64-step rows (4 bars), 3/4 and 6/8 give 48 (4 bars), 2/4 gives 32, 12/8 gives 48 (2 bars), 1/4 gives 16.\n- Avoid 5/4, 7/8, 9/8, 7/4 and other meters not listed above. Rows then fall back to 64 steps and stop lining up with bar lines.\n\n## 4. Timing\n\n- Units: 1 quarter note = 4 steps = 1920 units. units = ticks x 1920 / PPQ. At PPQ 480, 1 tick = 4 units and one 16th step = 120 ticks.\n- Every note belongs to the 16th step nearest its start (its anchor). A start exactly half a step late stays with the earlier step. In units: anchor = floor((start_units + 239) / 480). The offset from the anchor is -239 to +240 units.\n- Deliberate timing is preserved. Nudge a kick a few ticks ahead of a bass note, strum a chord, swing a hi-hat by hand. All of it plays back exactly as written.\n- Nothing can start before tick 0. The first downbeat is tick 0. Don't write a pickup bar before it. If the music needs a pickup, start the song one bar earlier with silence.\n- Note length: at least 1 tick. Lengths up to about 8.5 bars are exact. Longer notes, up to about 1092 bars, keep their length to within about a quarter of a 16th.\n- The project's swing setting is off for imported songs. If you want swing, write it into the note positions.\n\n## 5. Notes (MUST)\n\n- At most {{NOTES_PER_STEP}} notes may anchor on the same 16th step in one part. A 5th note is dropped (the 4 loudest are kept). Count notes by anchor, not by exact tick, so a strum spread across a step still counts against that step. Split bigger chords across two parts or two steps.\n- Never give one part the same pitch twice on the same step. Only the louder note is kept.\n- Never let a pitch overlap itself in one part (a new note on a pitch that is still sounding). The earlier note is cut short where the new one starts. End the old note first.\n- Velocity 1 to 127. Use velocity for dynamics. There is no other expression.\n- Write real note lengths. Sustain pedal (CC 64) is ignored, so a held pad must be a long note, not a short note plus a pedal.\n- Pitch bend, aftertouch, polyphonic pressure and SysEx are ignored. Don't rely on them.\n- Drums: one part on one channel, with all drum sounds as different pitches in that part. The 4-per-step rule applies, so kick, snare, hat and one more is the most that can land on one step. In this rig the drum machine is the M8 (section 8); channel 10 is an ordinary M8 part here, not a General MIDI drum channel.\n\n## 6. Program changes and CCs (row events)\n\n- Program change, bank select and CC messages are imported only near a row start. The window runs from one beat before the row start up to half a step after it. Anything outside that window is dropped. Don't write automation sweeps; they are lost.\n- Put each part's program change at its row start tick, on that part's channel. Bank select (CC 0 and/or CC 32) goes immediately before its program change, on the same channel, at the same tick or just before.\n- At most {{EVENTS_ROW}} events per row and {{EVENTS_SONG}} per song. A bank select plus its program change counts as one event.\n- Send events on the real MIDI channel of the device they are for. Events for an instrument part go on that part's channel. When the player launches that track on stage, its row events go with it. Events for effects pedals that have no part of their own ({{EFFECTS_LIST}}) fire only on whole-song scene changes. Put them in a track of their own with no notes.\n- Program numbers in the file are 0 to 127 (MIDI wire values). Section 9 gives each device's own numbering beside the wire value, and the bank select the device needs for presets above 127. Use those; do not guess.\n- Only send a program change to a device that receives one, and only a CC the device names (section 9). The importer warns about the rest; the checker in Appendix B does too.\n- Before the first row the player can press SEND SETUP to send row 1's events to every device. So put every device's starting preset in row 1.\n\n## 7. Song shape and storage\n\n- Make the song a whole number of rows. In 4/4, that means a multiple of 4 bars. The last row may be partly silent.\n- At most {{ROWS_MAX}} rows. In 4/4 that is 512 bars.\n- Start each section (intro, verse, drop, breakdown) on a row boundary.\n- Storage is shared by all {{SONGS}} songs on the device (about {{POOL_KB}} KB). Identical blocks are stored once. A drum or bass loop that repeats bar-for-bar identically costs almost nothing. The same loop with randomized velocities or timing on every repeat stores a new copy each time. Keep repeats identical unless the variation is musically intended.\n- Consecutive rows whose 8 blocks are all identical merge into one row with a repeat count (up to {{REPEAT_MAX}}), unless the later row has row events.\n\n## 8. Channels: the rig \"{{RIG_NAME}}\"\n\nEvery device has one channel. Write each part on its device's channel and the importer sets that Tabby track's output channel from the file; nothing is set by hand. The table is generated from the rig profile.\n\n{{CHANNEL_MAP}}\n\nRules that follow from the table:\n\n- Parts take Tabby tracks 1 to {{TRACKS}} in file order, except a part on a channel with a pinned track, which lands on that track whatever its order ({{PINNED_LIST}}). Put the parts in the order you want on the tracks.\n- Name each track after its device (for example \"{{EXAMPLE_TRACK_NAME}}\"): the importer shows the device it finds on the part's channel and the device the name mentions, so a mismatch is visible before anything is written.\n- Channels marked \"effect\" take program changes and CCs only. Never write notes on them.\n- Channels marked \"internal\" sound inside the SMK-37. Nothing external listens; program changes and CCs on them are ignored.\n- A channel not in the table has no device. The importer warns and the song still sends on it.\n- Several M8 parts: each M8 channel drives one M8 track (the table says which). Each part needs its own Tabby track.\n\n{{RIG_NOTES}}\n\n## 9. The devices\n\nGenerated from the device definitions: how each device is connected and set, how it numbers programs (wire value and shown number), the CCs it names, and clock. \"Unverified\" marks what no manufacturer document settles; the hardware checklist in BUILD.md settles it.\n\n{{DEVICE_SECTIONS}}\n\n## 10. Laying out a file for scene changes and track launching\n\n- A scene change (the player jumps to a row) sends the new row's events on every channel, pedals included, before the row's first notes. So a row that starts a section carries every device's preset for that section.\n- A track launch (the player loops one track's block from a row) sends only the events on that track's own channel. So an instrument's program change must be on the instrument's channel, in the same row as the notes it belongs to. Pedal events never travel with a launch; they fire on scene changes only.\n- Therefore: pedal events go in a notes-free track on the pedal's channel; instrument presets go on the instrument's channel at row starts; row 1 holds every device's starting state (SEND SETUP sends row 1).\n- A row's events leave in file order (track after track). A device whose rig entry has a gap ({{GAP_DEVICES}}) stalls every event that follows it in that row for the gap's length, so put such a device's track last in the file. The device then still gets its program change before the bar, because the whole stream is sent early by the sum of its gaps; only at PLAY itself (row 1 with nothing sent early) does the tail after a gap come late, which is why the player runs SEND SETUP before PLAY.\n- A launched block loops with its row's length, independently of the song. Make each track's part in a row a loop that stands on its own: no note hanging over from the previous row, no fill that only makes sense before the next row.\n- The FM6 part (channel {{INTERNAL_CHANNEL_LIST}}) is pinned to Tabby track {{INTERNAL_TRACK_LIST}} and sounds inside the SMK-37 only. It is the part to audition or to keep when no external synth is free.\n\n## 11. Limits\n\n{{LIMITS}}\n\n## 12. How to produce the file\n\n1. Plan first: tempo, meter, row length, number of rows, sections and which row each starts on, parts and channels (section 8), each device's starting preset (section 9).\n2. Write the file with code, never by typing bytes by hand. Python with the mido library is the reference (pip install mido). Appendix A is a working template for this rig.\n3. Run the checker in Appendix B on the file. It knows this rig's channels, program ranges and named CCs. Fix every ERROR. Fix every WARNING unless it is intended (for example a dropped CC the user accepted). Repeat until it prints RESULT: PASS.\n4. Give the user the file and a short summary: tempo, meter, rows, parts with names and channels, row events per row, and the checker's last lines.\n\nIf you cannot run code, say so. Then give the user the Python script that writes the file and the checker, and tell them to run both before importing.\n\n## 13. Common mistakes\n\n- Notes in a track with no matching note_off, or a missing end_of_track.\n- Note-off and note-on for the same pitch at the same tick written in the wrong order. Write the note-off first.\n- Five-note chords, or a chord plus a melody note on the same step in one part.\n- Long pad notes held with the sustain pedal instead of real lengths.\n- Filter sweeps or volume fades written as CC streams. They are dropped.\n- Program changes in the middle of a row. They are dropped.\n- Tempo ramps, meter changes, or a pickup before tick 0.\n- More than {{TRACKS}} parts, or two channels mixed in one track.\n- Notes on a pedal's channel, a program change to a device that takes none, a program number the device cannot reach, a CC the device does not name.\n- A preset above 127 without its bank select, or a bank select the device does not use.\n- Humanizing every repeat of a loop, which multiplies storage and makes launching a \"loop\" sound different each time.\n- PPQ 100 or other values that don't divide 1920.\n\n## 14. Live wiring: one DIN cable per device (recommended)\n\nThis section is for the player, not for the file. It changes nothing in how you write a song.\n\n- DIN MIDI is serial: one 3-byte note takes 0.96 ms on the cable. On the SMK-37's own TRS DIN out, every track shares one cable, so the 8 notes of a step on 8 tracks leave one after another over about 7.7 ms; the last device plays its note about 7 ms after the first (measured 7.3 ms mean, Task 12 B1).\n- The SDK's DIN output uses running status by itself (a message with the same status byte as the one before it in the same burst is sent without it). That only helps notes on the same channel. The 8 notes of a step on 8 channels have 8 different status bytes, so it saves nothing there; a 4-note chord on one channel saves 3 bytes (about 1 ms).\n- Recommended live wiring: SMK-37 USB into the USB host port of the CME H4MIDI WC; the H4MIDI WC routes each MIDI channel to its own DIN out (HxMIDI Tools: one channel filter per DIN out), one DIN cable per device. Each cable then carries only its own device's notes: with two devices per DIN out a step costs about 1.9 ms on that cable instead of 7.7 ms, and with one device about 1 ms.\n- What the SMK-37 needs for it, and has today: each track sends on its own channel (MIDI TRACK, SHIFT + SEQ, K2 OUT CH; the importer sets it from the file, section 8), and the song goes out on USB (OUT PORT ALL sends it on USB, DIN and Bluetooth together; the USB copy is the one the H4MIDI routes). Nothing on the SMK-37 has to change.\n- What it does not have: a per-track port choice. OUT PORT is one setting for all tracks (ALL or OFF). A rig that puts one device on the SMK-37's own TRS DIN out and the rest on USB therefore still sends every track on that DIN cable as well; the device on it simply ignores the other channels, but the burst on that cable is still all tracks' notes. Leave the SMK-37's TRS out unconnected in the recommended wiring.\n- External clock or notes INTO the SMK-37: the SMK-37's TRS jack cannot be a MIDI input. The SDK reports its input ports as USB and Bluetooth only (`fm1_midi_input_ports` returns 6), the board hook `fm1_io_trs_midi_enabled` returns 0 (app/board/panel.c: that pin is an encoder input on both boards, no TRS receiver is fitted), and `smk37_uart_start` sets up transmit only. No cable and no setting changes that; the SYNC / MIDI page's CLK IN choice DIN receives nothing, so leave CLK IN on AUTO or USB. To give the SMK-37 a clock from a DIN device, plug that device's MIDI OUT into a DIN input of the H4MIDI WC and route it (HxMIDI Tools) to the H4MIDI's USB host port that the SMK-37 is plugged into, the same cable that already carries the song out; on the SMK-37 set CLOCK to MIDI and CLK IN to AUTO or USB. The master must send Start or Continue and Clock, and a song cannot follow it (song mode needs the INT clock). This routing is from the H4MIDI's documented function and the SMK-37's USB input; it has not been tried on this rig. Since tabby-v04.3 a song follows that clock: with CLOCK = MIDI, PLAY arms the song and the master's Start, Continue, Stop and Song Position Pointer run it (docs/SPEC.md 19.3).\n- The H4MIDI WC adds its own small delay (USB to DIN) and the USB burst of a step (about 2.4 ms for 8 notes, Task 12 B1) still comes first. Since tabby-v04.2 the firmware asks for the control pass at once when a song note is due (fast MIDI, docs/SPEC.md 19.2), so the old 10 ms step no longer delays song notes: measured on the device, one line leaves within a 4.9 ms band against 14.3 ms with it off (Task 16 night run, BUILD.md 32.4); with it switched off (ACTIONS, A2 FAST MIDI) the 10 to 14 ms band is back.\n\n## Appendix A. Template: write a song with mido\n\nWrites example.mid for this rig: 8 bars at 120 BPM in 4/4, two rows, with {{EX1_NAME}} (channel {{EX1_CH}}) playing a nudged kick-like pulse, {{EX2_NAME}} (channel {{EX2_CH}}) a bass line with a program change at each row start, and {{EX3_NAME}} (channel {{EX3_CH}}) a pad. Change the parts, keep the structure. Channels in mido are 0-based: channel 1 is 0.\n\n```python\n#!/usr/bin/env python3\n\"\"\"Example: write an 8-bar Classic Tabby song (two rows of 4 bars) with mido, for the rig \"{{RIG_NAME}}\".\"\"\"\nimport mido\n\nPPQ = 480\nSTEP = PPQ // 4              # one 16th note in ticks\nBAR = 16 * STEP\n\ndef track(name, channel, notes, pcs=()):\n    \"\"\"notes: (start_tick, length_ticks, pitch, velocity); pcs: (tick, program). channel is 0-based.\"\"\"\n    ev = [(t, 'pc', p, 0) for t, p in pcs]\n    for s, l, p, v in notes:\n        ev += [(s, 'on', p, v), (s + l, 'off', p, 0)]\n    order = {'off': 0, 'pc': 1, 'on': 2}           # note-offs first at equal ticks\n    ev.sort(key=lambda e: (e[0], order[e[1]]))\n    tr = mido.MidiTrack([mido.MetaMessage('track_name', name=name, time=0)])\n    now = 0\n    for t, kind, a, b in ev:\n        d = t - now; now = t\n        if kind == 'on': tr.append(mido.Message('note_on', channel=channel, note=a, velocity=b, time=d))\n        elif kind == 'off': tr.append(mido.Message('note_off', channel=channel, note=a, velocity=0, time=d))\n        else: tr.append(mido.Message('program_change', channel=channel, program=a, time=d))\n    tr.append(mido.MetaMessage('end_of_track', time=0))\n    return tr\n\nmid = mido.MidiFile(type=1, ticks_per_beat=PPQ)\nmid.tracks.append(mido.MidiTrack([\n    mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(120), time=0),\n    mido.MetaMessage('time_signature', numerator=4, denominator=4, time=0),\n    mido.MetaMessage('end_of_track', time=0)]))\npulse = [(b * BAR + q * 4 * STEP - 12, STEP, 36, 110) for b in range(8) for q in range(4)]  # 12 ticks (12.5 ms) early\npulse[0] = (0, STEP, 36, 110)                                    # nothing before tick 0\nbass = [(b * BAR + q * 4 * STEP, 3 * STEP, 36 + (b // 4) * 5, 100) for b in range(8) for q in range(4)]\npad = []\nfor r, root in enumerate((60, 65)):\n    pad += [(r * 4 * BAR, 4 * BAR - STEP // 2, root + i, 70) for i in (0, 4, 7)]\nmid.tracks.append(track('{{EX1_NAME}}', {{EX1_CH0}}, pulse))\nmid.tracks.append(track('{{EX2_NAME}}', {{EX2_CH0}}, bass, pcs={{EX2_PCS}}))\nmid.tracks.append(track('{{EX3_NAME}}', {{EX3_CH0}}, pad))\nmid.save('example.mid')\nprint('wrote example.mid')\n```\n\n## Appendix B. Checker\n\nSave as tabby_check.py and run: python3 tabby_check.py song.mid. Exit code 0 means no errors. The RIG table at the top is generated from the rig profile: channel, device, kind, whether it takes program changes and up to which number, its bank select, and the CCs it names (None = no fixed map, any CC passes).\n\n```python\n#!/usr/bin/env python3\n\"\"\"tabby_check.py: check a .mid file against the Classic Tabby importer rules and the rig \"{{RIG_NAME}}\".\nUsage: python3 tabby_check.py song.mid\nNeeds: pip install mido\nExit code 0 = no errors (warnings may remain), 1 = errors found.\"\"\"\nimport sys\nfrom collections import defaultdict\nimport mido\n\nU = 480                      # units per 16th step\nHALF = 240\nEXACT_PPQ = {96, 120, 192, 240, 384, 480, 960, 1920}\nMAX_NOTES_PER_STEP = {{NOTES_PER_STEP}}\nMAX_PARTS = {{TRACKS}}\nMAX_ROWS = {{ROWS_MAX}}\nMAX_LEN_STEPS = 17476\nMAX_EVENTS_ROW = {{EVENTS_ROW}}\nMAX_EVENTS_SONG = {{EVENTS_SONG}}\nPOOL_BYTES = {{POOL_BYTES}}\nPREROLL_STEPS = 4            # importer default: one quarter note\n\n# The rig (generated): 1-based channel -> name, kind, program change (None = not received, else the\n# highest wire value accepted in bank 0), banks (CC 0 / CC 32 values per bank index, or None), named CCs\n# (set, or None for a device without a fixed map), pinned Tabby track (or None).\n{{CHECKER_RIG}}\n\nerrors, warnings = [], []\ndef err(m): errors.append(m)\ndef warn(m): warnings.append(m)\n\ndef rig_program_ok(ch, program, bank_msb, bank_lsb):\n    \"\"\"True when the device on 1-based channel ch reaches program (wire 0..127) with the bank bytes seen.\"\"\"\n    d = RIG.get(ch)\n    if not d or d['pc'] is None: return False\n    if d['banks']:\n        bank = None\n        for i, (msb, lsb) in enumerate(d['banks']):\n            if (msb is None or msb == bank_msb) and (lsb is None or lsb == bank_lsb): bank = i; break\n        if bank is None: return False\n        if d['total'] is not None and bank * d['stride'] + program >= d['total']: return False\n        return program < d['stride']\n    return program <= d['pc']\n\ndef main(path):\n    mid = mido.MidiFile(path)\n    if mid.type not in (0, 1):\n        err(f\"format {mid.type}: only format 0 or 1 is accepted\")\n    ppq = mid.ticks_per_beat\n    if ppq <= 0:\n        err(\"SMPTE time division is refused; use PPQ\")\n        return\n    if ppq not in EXACT_PPQ:\n        warn(f\"PPQ {ppq} does not divide 1920; timing will be rounded. Use 480 or 960.\")\n    to_units = lambda t: t * 1920 * 1.0 / ppq    # 1920 units per quarter note\n    tempos, sigs = [], []\n    notes = defaultdict(list)    # (track, ch) -> [(on_tick, off_tick, pitch, vel)]\n    names = {}\n    ctrl = []                    # (tick, track, ch, kind, data)\n    ignored = defaultdict(int)\n    for ti, track in enumerate(mid.tracks):\n        t = 0\n        open_ = defaultdict(list)\n        has_eot = False\n        for msg in track:\n            t += msg.time\n            if msg.is_meta:\n                if msg.type == 'set_tempo': tempos.append((t, mido.tempo2bpm(msg.tempo)))\n                elif msg.type == 'time_signature': sigs.append((t, msg.numerator, msg.denominator))\n                elif msg.type == 'track_name': names[ti] = msg.name\n                elif msg.type == 'end_of_track': has_eot = True\n                continue\n            if msg.type == 'note_on' and msg.velocity > 0:\n                open_[(msg.channel, msg.note)].append((t, msg.velocity))\n            elif msg.type in ('note_off', 'note_on'):\n                stack = open_[(msg.channel, msg.note)]\n                if not stack:\n                    warn(f\"track {ti} ch {msg.channel+1}: note-off for {msg.note} at tick {t} with no note-on\")\n                    continue\n                on_t, vel = stack.pop(0)\n                notes[(ti, msg.channel)].append((on_t, t, msg.note, vel))\n            elif msg.type == 'program_change':\n                ctrl.append((t, ti, msg.channel, 'pc', msg.program))\n            elif msg.type == 'control_change':\n                if msg.control == 64: ignored['sustain CC64 (ignored: write real note lengths)'] += 1\n                ctrl.append((t, ti, msg.channel, 'cc', (msg.control, msg.value)))\n            else:\n                ignored[msg.type] += 1\n        if not has_eot: err(f\"track {ti}: no end-of-track\")\n        for (ch, p), stack in open_.items():\n            for on_t, _ in stack:\n                err(f\"track {ti} ch {ch+1}: note {p} at tick {on_t} never ends\")\n    # tempo and meter\n    if not tempos: warn(\"no tempo event: the importer uses 120 BPM\")\n    else:\n        if tempos[0][0] != 0: warn(\"first tempo is not at tick 0\")\n        bpm = tempos[0][1]\n        if abs(bpm - round(bpm)) > 1e-3: warn(f\"tempo {bpm:.3f} BPM is rounded to {round(bpm)}\")\n        if not {{TEMPO_MIN}} <= round(bpm) <= {{TEMPO_MAX}}: err(f\"tempo {bpm:.1f} outside {{TEMPO_MIN}}..{{TEMPO_MAX}}\")\n        if len({round(b, 6) for _, b in tempos}) > 1: warn(\"tempo changes after the first are ignored\")\n    num, den = (4, 4) if not sigs else sigs[0][1:]\n    if sigs and sigs[0][0] != 0: warn(\"first time signature is not at tick 0\")\n    if len({s[1:] for s in sigs}) > 1: warn(\"meter changes after the first are ignored\")\n    bar = 16 * num / den\n    if bar != int(bar) or not 1 <= bar <= 64:\n        err(f\"meter {num}/{den} gives {bar} steps per bar; must be a whole number 1..64\")\n        return\n    bar = int(bar)\n    cands = [r for r in (16, 32, 48, 64) if r % bar == 0]\n    row = min(cands, key=lambda r: (abs(r - 4 * bar), -r)) if cands else 64\n    if not cands: warn(f\"meter {num}/{den}: no row length holds whole bars; rows of 64 steps will cross bar lines\")\n    # parts\n    parts = [k for k in notes if notes[k]]\n    if len(parts) > MAX_PARTS:\n        err(f\"{len(parts)} parts (track, channel pairs with notes); Classic Tabby has {MAX_PARTS} tracks\")\n    # the rig: every part's channel, pinned tracks claimed twice\n    pinned = defaultdict(list)\n    for ti, ch in parts:\n        d = RIG.get(ch + 1)\n        if not d: warn(f\"part {names.get(ti, ti)!r} on channel {ch+1}: no device on that channel in the rig\")\n        elif d['kind'] == 'effect': warn(f\"part {names.get(ti, ti)!r} on channel {ch+1}: notes go to {d['name']}, an effects pedal\")\n        elif d['track']: pinned[d['track']].append(names.get(ti, ti))\n    for tr, ps in pinned.items():\n        if len(ps) > 1: warn(f\"Tabby track {tr} is pinned for {len(ps)} parts ({', '.join(map(repr, ps))}); only the first lands there\")\n    # notes\n    cells = defaultdict(list)   # (part, row, step_in_row) -> notes\n    last_units = 0\n    for part in parts:\n        by_pitch = defaultdict(list)\n        anchors = defaultdict(list)\n        for on_t, off_t, p, v in sorted(notes[part]):\n            su, eu = to_units(on_t), to_units(off_t)\n            if eu <= su: err(f\"part {part}: zero-length note {p} at tick {on_t}\"); continue\n            if (eu - su) / U > MAX_LEN_STEPS: err(f\"part {part}: note {p} at tick {on_t} longer than {MAX_LEN_STEPS} steps\")\n            a = int((round(su) + HALF - 1) // U)\n            anchors[a].append((p, v))\n            by_pitch[p].append((su, eu))\n            r, s = divmod(a, row)\n            cells[(part, r)].append((s, p, v, round(su) - a * U, round(eu - su)))\n            last_units = max(last_units, eu)\n        for a, ns in anchors.items():\n            if len(ns) > MAX_NOTES_PER_STEP:\n                err(f\"part {part}: {len(ns)} notes start on 16th step {a} (bar {a//bar+1}); max {MAX_NOTES_PER_STEP}\")\n            pitches = [p for p, _ in ns]\n            if len(pitches) != len(set(pitches)):\n                warn(f\"part {part}: same pitch twice on step {a}; only the louder is kept\")\n        for p, spans in by_pitch.items():\n            spans.sort()\n            for (s1, e1), (s2, _) in zip(spans, spans[1:]):\n                if e1 > s2: warn(f\"part {part}: pitch {p} overlaps itself at step {s2/U:.2f}; the earlier note is shortened\")\n    # rows and blocks\n    total_steps = last_units / U\n    rows = int(-(-total_steps // row)) if total_steps else 0\n    if rows > MAX_ROWS: err(f\"{rows} rows of {row} steps; max {MAX_ROWS}. Shorten the song\")\n    blocks = {}\n    for (part, r), ns in cells.items():\n        key = (tuple(sorted(ns)))\n        blocks.setdefault(key, len(ns))\n    pool = sum(-(-(6 + 64 + 6 * n) // 4) * 4 for n in blocks.values())\n    # row events, against the rig\n    per_row = defaultdict(int)\n    bank_seen = {}               # channel -> (msb, lsb) seen before the program change in the window\n    for t, ti, ch, kind, data in sorted(ctrl):\n        st = to_units(t) / U\n        R = round(st / row); d = st - R * row\n        if -PREROLL_STEPS <= d < 0.5 and R >= 0:\n            if kind == 'cc' and data[0] in (0, 32):\n                msb, lsb = bank_seen.get(ch, (None, None))\n                bank_seen[ch] = (data[1], lsb) if data[0] == 0 else (msb, data[1])\n                continue   # merges into the next PC\n            per_row[R] += 1\n            dev = RIG.get(ch + 1)\n            if not dev:\n                warn(f\"track {ti} ch {ch+1}: {'PC ' + str(data) if kind == 'pc' else 'CC' + str(data[0])} targets a channel with no device in the rig\")\n            elif kind == 'pc':\n                msb, lsb = bank_seen.pop(ch, (None, None))\n                if dev['pc'] is None: warn(f\"track {ti} ch {ch+1}: PC {data} to {dev['name']}, which does not receive program changes\")\n                elif not rig_program_ok(ch + 1, data, msb, lsb): warn(f\"track {ti} ch {ch+1}: PC {data} (bank {msb}/{lsb}) is outside the range of {dev['name']}\")\n            elif dev['ccs'] is not None and data[0] not in dev['ccs']:\n                warn(f\"track {ti} ch {ch+1}: CC{data[0]} is not a CC that {dev['name']} names\")\n        else:\n            what = f\"PC {data}\" if kind == 'pc' else f\"CC{data[0]}={data[1]}\"\n            if not (kind == 'cc' and data[0] == 64):\n                warn(f\"track {ti} ch {ch+1}: {what} at step {st:.2f} is not at a row start; it is dropped\")\n    for R, n in per_row.items():\n        if n > MAX_EVENTS_ROW: err(f\"row {R+1}: {n} events, max {MAX_EVENTS_ROW}\")\n    if sum(per_row.values()) > MAX_EVENTS_SONG: err(f\"{sum(per_row.values())} row events, max {MAX_EVENTS_SONG}\")\n    for k, n in ignored.items(): warn(f\"{n} x {k} ignored by the importer\")\n    print(f\"file: {path}\")\n    print(f\"format {mid.type}, PPQ {ppq}, tempo {tempos[0][1] if tempos else 120:.2f} BPM, meter {num}/{den}\")\n    print(f\"parts: {len(parts)}  \" + \", \".join(f\"T{p[0]}:{names.get(p[0],'')!r} ch{p[1]+1}\" + (f\" ({RIG[p[1]+1]['name']})\" if p[1]+1 in RIG else \"\") for p in parts))\n    print(f\"rows: {rows} of {row} steps, unique blocks: {len(blocks)}, pool bytes about {pool} ({100*pool/POOL_BYTES:.1f}% of all song storage)\")\n    print(f\"row events: {sum(per_row.values())}\")\n    for w in warnings: print(\"WARNING:\", w)\n    for e in errors: print(\"ERROR:\", e)\n    print(\"RESULT:\", \"FAIL\" if errors else \"PASS\")\n\nif __name__ == '__main__':\n    main(sys.argv[1])\n    sys.exit(1 if errors else 0)\n```\n";
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
 *     setup: [text], notes: [text], sources: [{ title, url, detail }], unverified: [text],
 *     and, optional since v0.2 (Task 09): kind: "instrument" | "effect" | "internal" (default
 *     instrument), midiIn: { connector, trs: null | "A" | "B" | "ring", note }, clock: { receives:
 *     true | false | "unverified", syncs, setting }, channelSetting (text), firmware (text),
 *     programChange.programsTotal (presets reachable over all banks, when a bank is partial)
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
 * Version: 0.2
 *
 * Revision log
 *   v0.2  2026-11-05  Task 09: the optional kind / midiIn / clock / channelSetting / firmware /
 *                     programsTotal fields validated when present; kind(), isEffect(),
 *                     programInRange() for the importer's warnings and the generated guide.
 *   v0.1  2026-11-02  Initial version (Task 04, workbench part).
 */
(() => {
  'use strict';

  const SCHEMA = 'tabby-device/1';
  const BANK_SCHEMES = ['none', 'cc0', 'cc32', 'cc0cc32'], BANK_FORMATS = ['none', 'letter', 'hundreds'];
  const KINDS = ['instrument', 'effect', 'internal'], TRS = [null, 'A', 'B', 'ring'];   /* v0.2 */

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
    /* v0.2 (Task 09): optional fields, checked only when present. */
    if (d.kind !== undefined && !KINDS.includes(d.kind)) err('kind must be instrument, effect or internal');
    if (d.midiIn !== undefined) {
      if (!d.midiIn || typeof d.midiIn !== 'object' || !isText(d.midiIn.connector) || !isText(d.midiIn.note) || !TRS.includes(d.midiIn.trs)) err('midiIn needs connector, note and trs null / A / B / ring');
    }
    if (d.clock !== undefined) {
      if (!d.clock || typeof d.clock !== 'object' || ![true, false, 'unverified'].includes(d.clock.receives) || !isText(d.clock.syncs) || !isText(d.clock.setting)) err('clock needs receives (true / false / unverified), syncs, setting');
    }
    for (const k of ['channelSetting', 'firmware']) if (d[k] !== undefined && !isText(d[k])) err(k + ' must be text');
    if (p && p.programsTotal !== undefined && !isInt(p.programsTotal, 1, 65535)) err('programChange.programsTotal must be 1..65535');
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
  /* v0.2 (Task 09): the device's kind (instrument by default), and whether a program number the
   * file carries reaches a preset: supported, within the bank's programs and the total. A device
   * without a bank scheme takes bank null; bankFormat none with programs > 128 (the Skiff's 148)
   * accepts any PC 0..127. */
  function kind(d) { return KINDS.includes(d.kind) ? d.kind : 'instrument'; }
  function isEffect(d) { return kind(d) === 'effect'; }
  function programInRange(d, bank, program) {
    const p = d.programChange;
    if (p.supported !== true || !isInt(program, 0, 127)) return false;
    const banks = p.bankSelect.banks, stride = p.programs || 128;
    if (banks.length) {
      if (bank === null || bank === undefined) bank = 0;
      if (!isInt(bank, 0, banks.length - 1) || program >= stride) return false;
      return p.programsTotal ? bank * stride + program < p.programsTotal : true;
    }
    return p.programs ? program < p.programs : true;
  }
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

  const TabbyDevices = { SCHEMA, validateDevice, load, programLabel, programFromLabel, bankBytes, bankFromBytes, presetName, controller, valueName, kind, isEffect, programInRange, version: '0.2' };
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
 *   Built-in profiles (Task 09, v0.3): tools/linux/build-web.py inlines web/rig/profiles/*.json as
 *   `globalThis.FM1_RIG_PROFILES`; rigBuiltins() returns them normalised with `builtin: true`.
 *   They are read-only in the panel; "Copy to my rig" makes the editable stored copy. A channel
 *   carries two optional fields since v0.3: `port` (where the device is cabled, text for the
 *   guide and the checklist) and `track` (the Tabby track a part on this channel is pinned to by
 *   the importer, 1..8 or null; the FM6 convention). A profile also carries `notes` (text lines
 *   the guide prints). Older profiles read with port '', track null and no notes.
 *
 * Version: 0.3
 *
 * Revision log
 *   v0.3  2026-11-05  Task 09: built-in profiles, port / track per channel, profile notes,
 *                     trackFor() and internalChannels() for the importer.
 *   v0.2  2026-11-04  Task 06: per-channel leadMs, the trailing gap kept for a lead.
 *   v0.1  2026-11-02  Initial version (Task 04, workbench part).
 */
(() => {
  'use strict';

  const SCHEMA = 'tabby-rig/1', STORAGE_KEY = 'classic-tabby-rig';
  const devices = () => globalThis.TabbyDevices || (typeof require === 'function' ? require('./device-library.js') : null);

  function rigEmpty() {
    return { schema: SCHEMA, name: 'My rig', notes: [], channels: Array.from({ length: 16 }, () => ({ device: null, name: '', gapMs: null, leadMs: 0, programs: {}, port: '', track: null })) };
  }
  /* Validate and normalise a profile object (from storage, a file or a trailer). */
  function rigNormalize(data) {
    if (!data || data.schema !== SCHEMA || !Array.isArray(data.channels) || data.channels.length !== 16) throw new Error('not a tabby-rig/1 profile');
    const rig = rigEmpty();
    rig.name = typeof data.name === 'string' ? data.name.slice(0, 40) : rig.name;
    rig.notes = Array.isArray(data.notes) ? data.notes.filter(t => typeof t === 'string').slice(0, 16).map(t => t.slice(0, 400)) : [];   /* v0.3 */
    if (data.builtin === true) rig.builtin = true;   /* v0.3: kept in memory for the panel, never stored (rigSave strips it) */
    data.channels.forEach((c, i) => {
      const ch = rig.channels[i];
      if (c && typeof c === 'object') {
        ch.device = typeof c.device === 'string' && c.device ? c.device : null;
        ch.name = typeof c.name === 'string' ? c.name.slice(0, 40) : '';
        ch.gapMs = Number.isInteger(c.gapMs) && c.gapMs >= 0 && c.gapMs <= 255 ? c.gapMs : null;
        ch.leadMs = Number.isInteger(c.leadMs) && c.leadMs >= 0 && c.leadMs <= 255 ? c.leadMs : 0;   /* Task 06: lead before the bar */
        ch.port = typeof c.port === 'string' ? c.port.slice(0, 160) : '';                                 /* v0.3 */
        ch.track = Number.isInteger(c.track) && c.track >= 1 && c.track <= 8 ? c.track : null;           /* v0.3: the pinned Tabby track */
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
  const stored = rig => { const r = rigNormalize(rig); delete r.builtin; return r; };
  function rigSave(rig) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored(rig))); } catch (_) { /* private mode: keep in memory */ } }
  function rigExport(rig) { return JSON.stringify(stored(rig), null, 1); }
  function rigImport(text) { return stored(typeof text === 'string' ? JSON.parse(text) : text); }
  function rigClone(rig) { return stored(JSON.parse(JSON.stringify(rig))); }
  /* v0.3: the built-in profiles shipped with the page (or passed in by a test), normalised. */
  function rigBuiltins(list) {
    const src = list || globalThis.FM1_RIG_PROFILES || [];
    const out = [];
    for (const p of src) { try { const r = rigNormalize(p); r.builtin = true; out.push(r); } catch (_) { /* a broken built-in is skipped */ } }
    return out;
  }
  /* v0.3: the Tabby track (1..8) a part on `channel` is pinned to, or null. */
  function trackFor(rig, channel) { const c = rig.channels[channel]; return c && c.track ? c.track : null; }
  /* v0.3: channels whose device is internal (the FM6 convention) or an effect, for the importer. */
  function channelsOfKind(rig, library, kind) {
    const D = devices(), out = [];
    for (let ch = 0; ch < 16; ch++) { const d = deviceOn(rig, library, ch); if (d && D.kind(d) === kind) out.push(ch); }
    return out;
  }

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

  const TabbyRig = { SCHEMA, STORAGE_KEY, rigEmpty, rigNormalize, rigLoad, rigSave, rigExport, rigImport, rigClone, rigBuiltins, trackFor, channelsOfKind, deviceOn, channelLabel, gapFor, leadFor, programName, applyGaps, describe, version: '0.3' };
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
 *   Profiles (Task 09, v0.3): a "Profile" select shows "My rig" (the stored, editable profile)
 *   and every built-in profile (TabbyRig.rigBuiltins(), read-only: the table's inputs are
 *   disabled); "Copy to my rig" replaces the stored profile with a copy of the built-in one
 *   after a confirmation. Songs always use "My rig" (or their own copy), never the built-in view.
 *   Two columns were added: "Port" (where the device is cabled) and "Track" (the Tabby track a
 *   part on this channel is pinned to, the FM6 convention).
 *
 * Version: 0.3
 *
 * Revision log
 *   v0.3  2026-11-05  Task 09: profile select with the built-in profiles, Port and Track columns,
 *                     the profile's notes shown under the table.
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
    const state = { rig: Rig.rigLoad(), song: null, row: 0, builtins: Rig.rigBuiltins(), view: -1 };   /* view: -1 = My rig, else a built-in index */
    const rigInUse = () => (state.song && state.song.rig) ? state.song.rig : state.rig;
    const viewRig = () => state.view >= 0 && state.builtins[state.view] ? state.builtins[state.view] : state.rig;

    /* ---- rig setup ---------------------------------------------------------------------- */
    const setupBody = h('tbody'), rigName = h('input', { type: 'text', maxLength: 40 }), programsBox = h('div', { class: 'ti-muted' });
    const profileSelect = h('select'), copyButton = h('button', { type: 'button', textContent: 'Copy to my rig' }), notesBox = h('div', { class: 'ti-muted' });
    function renderSetup() {
      const rig = viewRig(), ro = state.view >= 0;   /* v0.3: a built-in profile is shown read-only */
      profileSelect.replaceChildren(option(-1, 'My rig: ' + state.rig.name, state.view < 0), ...state.builtins.map((b, i) => option(i, b.name + ' (built-in)', state.view === i)));
      copyButton.hidden = !ro;
      rigName.value = rig.name; rigName.disabled = ro;
      notesBox.replaceChildren(...(rig.notes || []).map(t => h('p', {}, t)));
      setupBody.replaceChildren(...rig.channels.map((c, i) => {
        const dev = h('select', { disabled: ro }, option('', '— none —', !c.device), ...library.list.map(d => option(d.id, d.name, c.device === d.id)));
        dev.addEventListener('change', () => { c.device = dev.value || null; save(); });
        const name = h('input', { type: 'text', maxLength: 40, value: c.name, disabled: ro, placeholder: c.device ? (library.get(c.device) || {}).name || '' : '' });
        name.addEventListener('change', () => { c.name = name.value; save(); });
        const d = c.device ? library.get(c.device) : null;
        const gap = h('input', { type: 'number', min: 0, max: 255, step: 1, disabled: ro, value: c.gapMs === null ? '' : String(c.gapMs), placeholder: d ? String(d.programChange.gapMs) : '0' });
        gap.addEventListener('change', () => { c.gapMs = gap.value === '' ? null : Math.max(0, Math.min(255, Math.round(Number(gap.value)))); save(); });
        /* Task 06: lead before the bar, for slow devices: the program change leaves this long before the downbeat. */
        const lead = h('input', { type: 'number', min: 0, max: 255, step: 1, disabled: ro, value: String(c.leadMs || 0), title: 'Program change this many ms before the bar (track launches and scene changes)' });
        lead.addEventListener('change', () => { c.leadMs = Math.max(0, Math.min(255, Math.round(Number(lead.value) || 0))); save(); });
        /* v0.3: where the device is cabled (text for the guide and the checklist) and the pinned Tabby track. */
        const port = h('input', { type: 'text', maxLength: 160, value: c.port || '', disabled: ro, placeholder: 'port / cable', title: 'Where this device is cabled (H4MIDI port, filter, adapter); printed in the guide' });
        port.addEventListener('change', () => { c.port = port.value; save(); });
        const track = h('select', { disabled: ro, title: 'The Tabby track an imported part on this channel is pinned to (the FM6 convention)' }, option('', '—', !c.track), ...Array.from({ length: 8 }, (_, t) => option(t + 1, 'T' + (t + 1), c.track === t + 1)));
        track.addEventListener('change', () => { c.track = track.value === '' ? null : Number(track.value); save(); });
        const numbering = d ? (d.programChange.supported === true ? 'programs ' + D.programLabel(d, d.programChange.bankSelect.banks.length ? 0 : null, 0) + '..' +
          D.programLabel(d, d.programChange.bankSelect.banks.length ? d.programChange.bankSelect.banks.length - 1 : null, Math.min(127, Math.max(0, (d.programChange.programs || 128) - 1))) +
          (d.programChange.bankSelect.scheme !== 'none' ? ', bank by ' + d.programChange.bankSelect.scheme.toUpperCase().replace('CC0CC32', 'CC 0 + CC 32').replace('CC', 'CC ') : '') +
          (d.unverified.some(u => /displayBase/.test(u)) ? ' (base unverified)' : '')
          : d.programChange.supported === false ? 'no program change' : 'program change unverified') : '';
        const names = h('button', { type: 'button', textContent: 'Names…', disabled: !d || ro, onclick: () => editPrograms(i) });
        return h('tr', {}, h('td', {}, i + 1), h('td', {}, dev), h('td', {}, name), h('td', {}, gap), h('td', {}, lead), h('td', {}, port), h('td', {}, track), h('td', { class: 'ti-muted' }, numbering), h('td', {}, names));
      }));
      renderEvents();
    }
    profileSelect.addEventListener('change', () => { state.view = Number(profileSelect.value); renderSetup(); });
    copyButton.addEventListener('click', () => {
      const b = state.builtins[state.view]; if (!b) return;
      if (!confirm('Replace your rig profile with a copy of "' + b.name + '"? Your current profile is overwritten (export it first to keep it).')) return;
      state.rig = Rig.rigClone(b); state.view = -1; save(); message('Rig profile "' + b.name + '" copied to my rig.');
    });
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
      h('p', {}, h('label', {}, 'Profile ', profileSelect), ' ', copyButton),
      h('p', {}, h('label', {}, 'Profile name ', rigName), ' ',
        h('button', { type: 'button', textContent: 'Export rig (.json)', onclick: () => download(Rig.rigExport(state.rig), (state.rig.name || 'rig').replace(/[^\w-]+/g, '_') + '.rig.json') }), ' ',
        h('label', {}, 'Import rig ', importFile), ' ',
        h('button', { type: 'button', textContent: 'Reset', onclick: () => { if (confirm('Clear the rig profile?')) { state.rig = Rig.rigEmpty(); save(); } } })),
      h('table', { class: 'ti-table' }, h('thead', {}, h('tr', {}, ...['Ch', 'Device', 'Name', 'Gap ms', 'Lead ms', 'Port', 'Track', 'Numbering', ''].map(t => h('th', {}, t)))), setupBody),
      notesBox,
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
      library() { return library; },
      /* The event list to store: the rig's gaps applied (sorted by row). */
      prepareEvents(song) { return Rig.applyGaps(song.events || [], song.rig || state.rig, library).sort((a, b) => a.row - b.row); },
      trailer(song) { return song.rig ? { rig: song.rig } : null; },
    };
  }

  const TabbyRigUI = { mount, version: '0.3' };
  globalThis.TabbyRigUI = TabbyRigUI;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyRigUI;
})();

/* SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception */
/*
 * web/rig/guide.js — the MIDI authoring guide, generated from a rig profile and the device library
 *
 * Purpose
 *   Task 09. The guide an LLM reads before writing a .mid file for Classic Tabby has one source
 *   of truth: the rig profile (web/rig/profiles/*.json or the user's own) and the device
 *   definitions (web/devices/*.json). This module fills the hand-written template
 *   (docs/MIDI-GUIDE.template.md) with everything that must never be typed by hand:
 *
 *     {{CHANNEL_MAP}}        the channel table (channel, device, kind, pinned track, numbering, clock)
 *     {{DEVICE_SECTIONS}}    one section per rig channel: connection and port, channel setting,
 *                            program numbering with the wire value beside the shown number and the
 *                            bank select, the named CC table with ranges and value meanings, clock,
 *                            the rig's gap and lead, the unverified fields, the firmware read
 *     {{EFFECTS_LIST}}       the effects channels for section 6's sentence
 *     {{PINNED_LIST}}, {{INTERNAL_CHANNEL_LIST}}, {{INTERNAL_TRACK_LIST}}, {{EXAMPLE_TRACK_NAME}}
 *     {{RIG_NOTES}}          the profile's notes (the H4MIDI preset, reservations, audio-only gear)
 *     {{LIMITS}}             the song limits from web/import/song-format.js LIMITS
 *     {{EX1_*}} .. {{EX3_*}} the three instrument channels Appendix A's example uses
 *     {{CHECKER_RIG}}        the RIG dict of Appendix B's checker (Python source)
 *     {{VERSION}}, {{RIG_NAME}}, {{GENERATED}}, and the scalar limits ({{TRACKS}} ...)
 *
 *   build({ rig, library, template, version, date }) returns the Markdown. In the workbench the
 *   template arrives as globalThis.FM1_GUIDE_TEMPLATE (inlined by tools/linux/build-web.py) and
 *   the version from FM1_SIMULATOR.display_version; under Node the tool tools/linux/midi-guide.mjs
 *   reads the files and writes docs/MIDI-GUIDE.md, and tests/workbench/midi-guide.mjs regenerates
 *   it and fails when the committed guide, the profile or a definition disagree. The output is
 *   deterministic for a given input (the date is passed in, not read from the clock).
 *
 *   Loading: classic script (globalThis.TabbyGuide) and CommonJS.
 *
 * Version: 0.1
 *
 * Revision log
 *   v0.1  2026-11-05  Initial version (Task 09, checkpoint c).
 */
(() => {
  'use strict';

  const devices = () => globalThis.TabbyDevices || (typeof require === 'function' ? require('./device-library.js') : null);
  const rigModule = () => globalThis.TabbyRig || (typeof require === 'function' ? require('./rig.js') : null);
  const formatModule = () => globalThis.TabbySongFormat || (typeof require === 'function' ? require('../import/song-format.js') : null);

  const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  const list = a => a.length ? a.join(', ') : 'none';

  /* Program numbering in words: the wire value beside what the device shows, and the bank select. */
  function numberingText(d) {
    const D = devices(), p = d.programChange;
    if (p.supported === false) return 'does not receive program changes';
    if (p.supported === 'unverified') return 'program change support unverified; ' + p.note;
    const banks = p.bankSelect.banks, scheme = p.bankSelect.scheme;
    const first = D.programLabel(d, banks.length ? 0 : null, 0), second = D.programLabel(d, banks.length ? 0 : null, 1);
    let out = 'wire PC 0 = shown ' + first + ', PC 1 = ' + second + (p.displayHex ? ' (hex)' : '') + '; ';
    if (!banks.length) {
      const last = p.programs && p.programs <= 128 ? p.programs - 1 : 127;
      out += 'PC 0..' + last + ' = ' + D.programLabel(d, null, 0) + '..' + D.programLabel(d, null, last) + '; no bank select';
    } else {
      const cc = scheme === 'cc0' ? 'CC 0' : scheme === 'cc32' ? 'CC 32' : 'CC 0 and CC 32';
      out += 'bank select by ' + cc + ' before the PC: ' + banks.map(b => { const bb = D.bankBytes(d, b.index); return 'bank ' + b.name + ' = ' + [bb.msb !== null ? 'CC 0 = ' + bb.msb : null, bb.lsb !== null ? 'CC 32 = ' + bb.lsb : null].filter(Boolean).join(', '); }).join('; ');
      out += '; shown ' + D.programLabel(d, 0, 0) + '..' + D.programLabel(d, banks.length - 1, (p.programsTotal ? (p.programsTotal - 1) % (p.programs || 128) : (p.programs || 128) - 1));
    }
    return out;
  }
  function clockText(d) {
    const c = d.clock;
    if (!c) return 'not researched';
    if (c.receives === false) return 'no (' + c.syncs + ')';
    return (c.receives === true ? 'yes: ' : 'unverified: ') + c.syncs + (c.setting ? '. Setting: ' + c.setting : '');
  }
  function shortKind(d) { return devices().kind(d); }

  function channelMap(rig, library) {
    const D = devices(), rows = ['| Ch | Device (rig name) | Kind | Tabby track | Program numbering | Clock |', '| --- | --- | --- | --- | --- | --- |'];
    rig.channels.forEach((c, i) => {
      const d = c.device ? library.get(c.device) : null;
      if (!d) { rows.push('| ' + (i + 1) + ' | (no device) | — | — | — | — |'); return; }
      const kind = shortKind(d), track = c.track ? 'pinned to track ' + c.track : kind === 'effect' ? 'none (no notes)' : 'by file order';
      const p = d.programChange, banks = p.bankSelect.banks, last = !banks.length && p.programs && p.programs <= 128 ? p.programs - 1 : 127;
      const pc = p.supported === true ? (banks.length ? 'bank select + PC, shown ' + D.programLabel(d, 0, 0) + '..' + D.programLabel(d, banks.length - 1, (p.programsTotal ? (p.programsTotal - 1) % (p.programs || 128) : (p.programs || 128) - 1)) : 'PC 0..' + last + ' = shown ' + D.programLabel(d, null, 0) + '..' + D.programLabel(d, null, last)) : p.supported === false ? 'no program change' : 'unverified';
      rows.push('| ' + (i + 1) + ' | ' + esc(d.name) + (c.name && c.name !== d.name ? ' (' + esc(c.name) + ')' : '') + ' | ' + kind + ' | ' + track + ' | ' + pc + ' | ' + (d.clock ? (d.clock.receives === true ? 'yes' : d.clock.receives === false ? 'no' : 'unverified') : '?') + ' |');
    });
    return rows.join('\n');
  }

  function deviceSection(rig, library, i) {
    const D = devices(), Rig = rigModule(), c = rig.channels[i], d = c.device ? library.get(c.device) : null;
    if (!d) return '### Channel ' + (i + 1) + ': no device\n\nNothing in the rig listens here. A part on it is imported with OUT CH ' + (i + 1) + ' and a warning.';
    const out = [];
    out.push('### Channel ' + (i + 1) + ': ' + (c.name || d.name) + ' (' + d.name + '), ' + shortKind(d));
    out.push('');
    out.push('- Connection: ' + esc(d.midiIn ? d.midiIn.connector + (d.midiIn.trs ? ' (TRS ' + d.midiIn.trs + ')' : '') + '. ' + d.midiIn.note : d.channel.note) + (c.port ? ' Port in this rig: ' + esc(c.port) + '.' : ''));
    out.push('- Channel setting: ' + esc(d.channelSetting || d.channel.note));
    out.push('- Program changes: ' + esc(numberingText(d)) + '.');
    if (d.programChange.supported === true && d.programChange.note) out.push('  - ' + esc(d.programChange.note));
    if (d.presets.length) out.push('- Named presets: ' + d.presets.length + ' in the definition (the workbench shows them by name).');
    const named = d.controllers.filter(x => x.cc >= 0), free = d.controllers.find(x => x.cc === -1);
    if (named.length) {
      out.push('- Named CCs (any other CC is warned about):');
      out.push('');
      out.push('  | CC | Name | Range | Values |');
      out.push('  | --- | --- | --- | --- |');
      for (const x of named) out.push('  | ' + x.cc + ' | ' + esc(x.name) + ' | ' + x.min + '..' + x.max + ' | ' + esc(x.values ? Object.entries(x.values).map(([k, v]) => k + ' = ' + v).join('; ') : '') + ' |');
      out.push('');
    } else if (free) out.push('- CCs: ' + esc(free.name) + '. Any CC number passes the checker; what it does is the device\'s mapping.');
    else out.push('- CCs: none received.');
    out.push('- Clock: ' + esc(clockText(d)) + '.');
    const gap = Rig.gapFor(rig, library, i), lead = Rig.leadFor(rig, i);
    out.push('- Timing from the rig: ' + (gap ? 'a gap of ' + gap + ' ms after ' + (d.programChange.gapAfter === 'bank' ? 'the bank select' : 'a program change') : 'no gap') + '; ' + (lead ? 'the program change leaves ' + lead + ' ms before the bar' : 'no lead before the bar') + '.');
    if (d.setup.length) out.push('- Set on the device: ' + d.setup.map(esc).join(' '));
    if (d.unverified.length) out.push('- Unverified: ' + list(d.unverified.map(esc)) + '.');
    if (d.firmware) out.push('- Documents read: ' + esc(d.firmware) + '.');
    return out.join('\n');
  }

  function checkerRig(rig, library) {
    const D = devices(), lines = ['RIG = {'];
    rig.channels.forEach((c, i) => {
      const d = c.device ? library.get(c.device) : null;
      if (!d) return;
      const p = d.programChange, banks = p.bankSelect.banks;
      const pc = p.supported === true ? (banks.length ? 127 : Math.min(127, (p.programs && p.programs <= 128 ? p.programs : 128) - 1)) : null;
      const bankList = banks.length ? '[' + banks.map(b => { const bb = D.bankBytes(d, b.index); return '(' + (bb.msb === null ? 'None' : bb.msb) + ', ' + (bb.lsb === null ? 'None' : bb.lsb) + ')'; }).join(', ') + ']' : 'None';
      const named = d.controllers.filter(x => x.cc >= 0), free = d.controllers.some(x => x.cc === -1);
      const ccs = free || !named.length && p.supported !== true ? 'None' : '{' + named.map(x => x.cc).join(', ') + '}';
      lines.push('    ' + (i + 1) + ': {"name": ' + JSON.stringify(c.name || d.name) + ', "kind": ' + JSON.stringify(shortKind(d)) + ', "pc": ' + (pc === null ? 'None' : pc) + ', "banks": ' + bankList + ', "stride": ' + (p.programs || 128) + ', "total": ' + (p.programsTotal ? p.programsTotal : 'None') + ', "ccs": ' + (d.controllers.length === 0 && p.supported === true ? 'set()' : ccs) + ', "track": ' + (c.track ? c.track : 'None') + '},');
    });
    lines.push('}');
    return lines.join('\n');
  }

  function limitsText() {
    const L = formatModule().LIMITS;
    return ['| Limit | Value |', '| --- | --- |',
      '| Tabby tracks | ' + L.tracks + ' |', '| Rows per song | ' + L.rowsPerSong + ' |', '| Steps per block | ' + L.steps + ' |',
      '| Notes per step per track | ' + L.notesPerStep + ' |', '| Row lengths | ' + L.rowStepsAllowed.join(', ') + ' steps |', '| Repeat count per row | ' + L.repeatMin + '..' + L.repeatMax + ' |',
      '| Timing unit | 1/' + L.unitsPerStep + ' of a 16th step; offset −' + (L.offsetMax - 1) + '..+' + L.offsetMax + ' |',
      '| Row events per row / per song | ' + L.rowEventsMax + ' / ' + L.eventsMax + ' |', '| Tempo | ' + L.tempoMin + '..' + L.tempoMax + ' BPM, whole numbers |',
      '| Songs on the device | ' + L.songs + ' |', '| Block pool | ' + L.blockSectors + ' sectors, ' + L.poolBytes + ' bytes shared by all songs |',
      '| Distinct blocks per song | ' + L.blocksPerSong + ' |', '| Song name | ' + L.nameLength + ' characters |'].join('\n');
  }

  function build({ rig, library, template, version, date } = {}) {
    const D = devices(), Rig = rigModule(), L = formatModule().LIMITS;
    if (!rig || !library) throw new Error('build needs a rig profile and the device library');
    template = template || globalThis.FM1_GUIDE_TEMPLATE;
    if (typeof template !== 'string' || !template.includes('{{CHANNEL_MAP}}')) throw new Error('the guide template is missing');
    version = version || (globalThis.FM1_SIMULATOR && globalThis.FM1_SIMULATOR.display_version) || 'development';
    const deviceOn = i => rig.channels[i].device ? library.get(rig.channels[i].device) : null;
    const effects = [], internal = [], pinned = [], instruments = [];
    rig.channels.forEach((c, i) => {
      const d = deviceOn(i); if (!d) return;
      const k = D.kind(d), label = (c.name || d.name) + ' on channel ' + (i + 1);
      if (k === 'effect') effects.push(label);
      if (k === 'internal') internal.push({ channel: i + 1, track: c.track });
      if (c.track) pinned.push(label + ' → track ' + c.track);
      if (k === 'instrument') instruments.push({ channel: i + 1, name: c.name || d.name, device: d });
    });
    const ex = [0, 1, 2].map(k => instruments[k] || instruments[0] || { channel: 1, name: 'Part', device: null });
    const exPcs = ex[1].device && ex[1].device.programChange.supported === true ? '[(0, 0), (4 * BAR, 1)]' : '[]';
    const firstName = rig.channels.find(c => c.device) ? (rig.channels.find(c => c.device).name || library.get(rig.channels.find(c => c.device).device).name) : 'Device';
    const values = {
      VERSION: version, RIG_NAME: rig.name, GENERATED: 'generated ' + (date || 'at build time') + ' by web/rig/guide.js from ' + rig.channels.filter(c => c.device).length + ' rig channels and the device library',
      TRACKS: L.tracks, ROWS_MAX: L.rowsPerSong, UNITS: L.unitsPerStep, NAME_LENGTH: L.nameLength, TEMPO_MIN: L.tempoMin, TEMPO_MAX: L.tempoMax,
      NOTES_PER_STEP: L.notesPerStep, EVENTS_ROW: L.rowEventsMax, EVENTS_SONG: L.eventsMax, SONGS: L.songs, POOL_KB: Math.round(L.poolBytes / 1024), POOL_BYTES: L.poolBytes, REPEAT_MAX: L.repeatMax,
      EFFECTS_LIST: list(effects), PINNED_LIST: list(pinned), EXAMPLE_TRACK_NAME: firstName,
      GAP_DEVICES: list(rig.channels.map((c, i) => c.device && Rig.gapFor(rig, library, i) ? (c.name || library.get(c.device).name) + ' on channel ' + (i + 1) + ', ' + Rig.gapFor(rig, library, i) + ' ms' : null).filter(Boolean)),
      INTERNAL_CHANNEL_LIST: list(internal.map(x => String(x.channel))), INTERNAL_TRACK_LIST: list(internal.map(x => String(x.track || '—'))),
      CHANNEL_MAP: channelMap(rig, library), DEVICE_SECTIONS: rig.channels.map((_, i) => deviceSection(rig, library, i)).join('\n\n'),
      RIG_NOTES: (rig.notes || []).map(t => '- ' + t).join('\n'), LIMITS: limitsText(), CHECKER_RIG: checkerRig(rig, library),
      EX1_NAME: ex[0].name, EX1_CH: ex[0].channel, EX1_CH0: ex[0].channel - 1, EX2_NAME: ex[1].name, EX2_CH: ex[1].channel, EX2_CH0: ex[1].channel - 1, EX2_PCS: exPcs,
      EX3_NAME: ex[2].name, EX3_CH: ex[2].channel, EX3_CH0: ex[2].channel - 1,
    };
    const out = template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => { if (!(k in values)) throw new Error('template placeholder without a value: ' + k); return String(values[k]); });
    return out;
  }

  const TabbyGuide = { build, channelMap, deviceSection, checkerRig, limitsText, numberingText, version: '0.1' };
  globalThis.TabbyGuide = TabbyGuide;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyGuide;
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
 * Version: 0.6
 *
 * Revision log
 *   v0.6  2026-11-08  Task 12 A1: the block pool of the normal layout (USER 471040) is 80 sectors,
 *                     80 x 4076 = 326080 bytes (was 96 sectors, 391296 bytes, in the old 536576
 *                     layout). The device's own song status (command 23) still decides a write.
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
    recordArea: 4076, blockSectors: 80, poolBytes: 80 * 4076,   /* 326080: Task 12 A1, the 471040 layout (96 = 391296 in the old one) */
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
 *   Rig-aware mapping (Task 09, v0.6): convert() takes options.rig (a tabby-rig/1 profile) and
 *   options.library (TabbyDevices.load). Then: each part's OUT CH is its own MIDI channel
 *   (options.outChannels[t] still overrides when it is an integer, or null for "device");
 *   defaultAssignments() gives file order but a part on a channel whose rig entry pins a Tabby
 *   track (the FM6 convention, channel 9 → track 8) goes to that track whatever its order;
 *   partDevice() names the rig device on the part's channel and a device the track name
 *   mentions, for the preview; and four warnings: channelNotInRig (a part or an event on a
 *   channel with no device), notesOnEffectsChannel (notes to a pedal), programOutOfRange (a
 *   program the device cannot reach, or a device that takes no program change), ccNotNamed (a
 *   CC the device definition does not name; devices without a fixed map are not warned about).
 *   Without options.rig everything behaves as v0.5.
 *
 * Version: 0.6
 *
 * Revision log
 *   v0.6  2026-11-05  Task 09: rig-aware OUT CH, the pinned track, partDevice(), the four rig warnings;
 *                     fix: a program change that became a row event was still listed under
 *                     programIgnored (the taken-set held copies, not the analysis objects).
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

  /* The rig's device on a part's channel, and a device the track name mentions (Task 09). */
  function rigDevices() { return globalThis.TabbyDevices || (typeof require === 'function' ? require('../rig/device-library.js') : null); }
  function partDevice(part, rig, library) {
    if (!rig || !library) return { device: null, byName: null, track: null, kind: null };
    const c = rig.channels[part.channel], device = c && c.device ? library.get(c.device) : null, D = rigDevices();
    const text = String(part.name || '').toLowerCase();
    let byName = null;
    for (let ch = 0; ch < 16 && !byName; ch++) {
      const rc = rig.channels[ch], d = rc && rc.device ? library.get(rc.device) : null;
      if (!d) continue;
      const names = [rc.name, d.name, d.id].filter(Boolean).map(s => String(s).toLowerCase());
      if (names.some(n => n.length >= 3 && text.includes(n))) byName = { channel: ch, device: d, name: rc.name || d.name };
    }
    return { device, byName, track: c && c.track ? c.track : null, kind: device && D ? D.kind(device) : null, channelName: c ? (c.name || (device ? device.name : '')) : '' };
  }
  /* Parts in file order to tracks 1..8; with a rig, a part on a pinned channel takes its pinned
   * track and the others skip it (Task 09). */
  function defaultAssignments(analysis, rig) {
    const a = {}, taken = new Set();
    if (rig) for (const p of analysis.parts) { const c = rig.channels[p.channel]; if (c && c.track && !taken.has(c.track - 1)) { a[p.key] = c.track - 1; taken.add(c.track - 1); } }
    let next = 0;
    for (const p of analysis.parts) {
      if (p.key in a) continue;
      while (taken.has(next)) next++;
      a[p.key] = next < 8 ? next : null;
      if (next < 8) taken.add(next);
      next++;
    }
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
    const rig = options.rig || null, library = options.library || null, D = rig && library ? rigDevices() : null;   /* Task 09 */
    const assignments = options.assignments || defaultAssignments(analysis, rig);
    const deviceOnChannel = ch => { const c = rig && rig.channels[ch]; return c && c.device && library ? library.get(c.device) : null; };
    const noFixedMap = d => d.controllers.some(c => c.cc === -1);
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
    /* v0.6: `src` keeps the analysis object, so the programIgnored check below recognises a PC that
     * became an event (before, the spread copy never matched and every PC was listed as dropped). */
    const everything = [...analysis.ignored.programChange.map(p => ({ ...p, kind: 'pc', src: p })), ...(analysis.controls || []).map(c => ({ ...c, kind: 'cc' }))].sort((a, b) => a.tick - b.tick || a.seq - b.seq);   /* file order inside a tick */
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
        eventTaken.add(ev.src);
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
      if (rig) {   /* Task 09: the part's channel against the rig */
        const d = deviceOnChannel(part.channel);
        if (!d) w.add('channelNotInRig', 'warn', 'A part plays on a channel the rig has no device on', { track: Number(t) + 1, text: part.name + ' on channel ' + (part.channel + 1) });
        else if (D.isEffect(d)) w.add('notesOnEffectsChannel', 'warn', 'Notes go to an effects pedal channel (the pedal takes program changes and CCs only)', { track: Number(t) + 1, text: part.name + ' on channel ' + (part.channel + 1) + ' = ' + d.name });
      }
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
    if (rig) {   /* Task 09: every row event against the device on its channel */
      for (const e of events) {
        const d = deviceOnChannel(e.channel), at = 'row ' + (e.row + 1) + ' channel ' + (e.channel + 1);
        if (!d) { w.add('channelNotInRig', 'warn', 'An event targets a channel the rig has no device on', { text: at + ': ' + (e.type === 2 ? 'CC ' + e.d0 : 'program ' + (e.type === 1 ? e.d2 : e.d0)) }); continue; }
        if (e.type === 0 || e.type === 1) {
          const program = e.type === 1 ? e.d2 : e.d0, bank = e.type === 1 ? D.bankFromBytes(d, e.d0 === 255 ? null : e.d0, e.d1 === 255 ? null : e.d1) : null;
          if (d.programChange.supported !== true) w.add('programOutOfRange', 'warn', 'A program change targets a device that does not receive program changes (it does nothing there)', { text: at + ' = ' + d.name + ': program ' + program });
          else if (e.type === 1 && (e.d0 !== 255 || e.d1 !== 255) && bank === null) w.add('programOutOfRange', 'warn', 'A bank select does not match the device\'s bank scheme', { text: at + ' = ' + d.name + ': bank ' + (e.d0 === 255 ? '-' : e.d0) + '/' + (e.d1 === 255 ? '-' : e.d1) });
          else if (!D.programInRange(d, bank, program)) w.add('programOutOfRange', 'warn', 'A program number is outside the device\'s range', { text: at + ' = ' + d.name + ': program ' + program + (bank !== null ? ' in bank ' + bank : '') });
        } else if (e.type === 2 && !D.controller(d, e.d0) && !noFixedMap(d)) {
          w.add('ccNotNamed', 'warn', 'A control change is not one the device definition names', { text: at + ' = ' + d.name + ': CC ' + e.d0 + ' = ' + e.d1 });
        }
      }
    }
    for (const e of events) w.add('rowEvents', 'info', 'Program / bank / control change event(s) at row starts became row events (pre-roll ' + (preRoll ? preRoll + ' steps' : 'none') + ')',
      { text: 'row ' + (e.row + 1) + ' channel ' + (e.channel + 1) + ': ' + (e.type === 0 ? 'program ' + e.d0 : e.type === 1 ? 'bank ' + (e.d0 === 255 ? '-' : e.d0) + '/' + (e.d1 === 255 ? '-' : e.d1) + ' program ' + e.d2 : 'CC ' + e.d0 + ' = ' + e.d1) });
    for (const [, p] of pending) if (p.items.some(x => !eventTaken.has(x))) w.add('bankWithoutProgram', 'info', 'Bank select without a following program change dropped', { text: 'row ' + (p.row + 1) + ' channel ' + (p.items[0].channel + 1) });
    if (blocks.length > L.blocksPerSong) fail('The song needs ' + blocks.length + ' distinct blocks; a song holds ' + L.blocksPerSong + '. Narrow the bar range or import fewer tracks.', 'blocks');
    if (rows.length > L.rowsPerSong) fail('The song needs ' + rows.length + ' rows after merging repeats; a song holds 128. Narrow the bar range.', 'rows');

    const song = F.emptySong(options.name || 'IMPORTED');
    song.projectSlot = Number.isInteger(options.projectSlot) ? options.projectSlot : 0;
    song.tempo = analysis.tempo.bpm;
    song.loop = !!options.loop; song.jumpMode = options.jumpMode === 'row' ? 'row' : 'bar'; song.loopRow = 0;
    /* OUT CH per track: an explicit integer wins; else, with a rig, the part's own channel (Task 09);
     * else the device setting (null). Several parts on one track: the first part's channel. */
    const partChannel = Array(8).fill(null);
    for (const u of usedParts) if (partChannel[u.track] === null) partChannel[u.track] = u.part.channel;
    song.outChannels = Array.from({ length: 8 }, (_, t) => { const c = (options.outChannels || [])[t]; return c === null ? null : Number.isInteger(c) && c >= 0 && c <= 15 ? c : rig ? partChannel[t] : null; });
    song.rows = rows; song.blocks = blocks; song.events = events;
    song.source = { fileName: options.fileName || '', format: analysis.format, division: analysis.division, tempoExact: analysis.tempo.exact,
      meter: analysis.meter.numerator + '/' + analysis.meter.denominator, barSteps, barFrom, barTo, rowSteps, quantize, lengthRule, overflowRule, exactPpq: analysis.exactPpq,
      looseDedup: loose, velocityTolerance: loose ? tolerance : null, preRoll: options.preRoll || 'beat',
      parts: usedParts.map(u => ({ key: u.part.key, name: u.part.name, track: u.track + 1, channel: u.part.channel + 1, rigDevice: (partDevice(u.part, rig, library).device || {}).name || null })),
      rig: rig ? rig.name : null };
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

  const TabbyMidiSong = { analyze, convert, defaultAssignments, partDevice, rowStepsFor, position, where, nearest, version: '0.6' };
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
 *   Rig-aware preview (Task 09, v0.8): mount() takes `rig` (a function returning the active
 *   tabby-rig/1 profile) and `library`; the parts table shows the rig device on each part's
 *   channel (and a device the track name mentions), the OUT CH selects follow the parts'
 *   channels unless the user changes them, a part on a pinned channel is placed on its track,
 *   and the four rig warnings of midi-song.js v0.6 appear in "Dropped or changed". A "Download
 *   the MIDI guide" button writes the guide generated from the active rig (web/rig/guide.js).
 *
 * Version: 0.8
 *
 * Revision log
 *   v0.8  2026-11-05  Task 09: rig device column, OUT CH from the file, pinned track, the guide download.
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

  function mount(container, { transfer, rig = null, library = null } = {}) {
    const Midi = globalThis.TabbyMidi, Song = globalThis.TabbyMidiSong, Format = globalThis.TabbySongFormat;
    transfer = transfer || globalThis.TabbySongTransfer.select({});
    const activeRig = () => (typeof rig === 'function' ? rig() : rig) || null;   /* Task 09 */
    const state = { fileName: '', parsed: null, analysis: null, assignments: {}, outChannels: Array(8).fill(undefined), result: null, song: null, busy: false };

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
      guide: h('button', { type: 'button', textContent: 'Download the MIDI guide' }),   /* Task 09 */
      rigNote: h('p', { class: 'ti-muted' }),
    };
    for (let t = 0; t < 8; t++) {
      const sel = h('select', { dataset: { track: t } }, option('', 'device'), ...Array.from({ length: 16 }, (_, c) => option(c, 'ch ' + (c + 1))));
      sel.addEventListener('change', () => { state.outChannels[t] = sel.value === '' ? null : Number(sel.value); reconvert(); });   /* a user choice overrides the file's channel */
      ui.channels.append(h('label', {}, 'T' + (t + 1) + ' ', sel));
    }
    /* Task 09: the OUT CH selects follow the converted song unless the user changed them. */
    const showChannels = song => { for (let t = 0; t < 8; t++) { const sel = ui.channels.querySelector('select[data-track="' + t + '"]'); if (state.outChannels[t] === undefined) sel.value = song && Number.isInteger(song.outChannels[t]) ? String(song.outChannels[t]) : ''; } };
    container.replaceChildren(
      h('section', { class: 'ti-step' }, h('h3', {}, '1. MIDI file'),
        h('p', {}, ui.file, ' ', ui.guide), ui.fileSummary, ui.fileWarnings),
      h('section', { class: 'ti-step' }, h('h3', {}, '2. Parts → Classic Tabby tracks'),
        ui.rigNote,
        h('table', { class: 'ti-table' }, h('thead', {}, h('tr', {}, ...['MIDI part', 'Channel', 'Rig device', 'Notes', 'Range', 'Bars', 'Programs', 'Tabby track'].map(x => h('th', {}, x)))), ui.parts),
        h('p', { class: 'ti-muted' }, 'Several parts may share one track; the 4-notes-per-step limit then applies to the mix. Drum parts (channel 10) are marked ♩. With a rig, each part\'s channel becomes its track\'s OUT CH, and a part on a pinned channel (the FM6 convention) takes its pinned track whatever its order.'),
        h('div', {}, h('strong', {}, 'OUT CH per track '), h('span', { class: 'ti-muted' }, '(written into the song header; set from the parts\' channels; "device" keeps the device OUT CH for that track) '), ui.channels)),
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
      const a = state.analysis, p = state.parsed, rigNow = activeRig();
      ui.rigNote.textContent = rigNow ? 'Rig: ' + rigNow.name + '. Each part\'s channel sets its track\'s OUT CH; a part on a pinned channel lands on its track.' : 'No rig profile: channels are not checked and OUT CH stays "device".';
      ui.fileSummary.replaceChildren(h('p', {}, h('strong', {}, state.fileName), ' — format ' + p.format + ', ' + p.division + ' ticks per quarter, ' + p.tracks.length + ' track(s), ' +
        a.parts.length + ' part(s), ' + a.totalBars + ' bar(s) of ' + a.meter.numerator + '/' + a.meter.denominator + ', tempo ' + a.tempo.exact.toFixed(2) + ' BPM → ' + a.tempo.bpm +
        (a.tempo.changes.length ? ' (' + a.tempo.changes.length + ' change(s) ignored)' : '') + '.'));
      ui.fileWarnings.replaceChildren(...a.errors.map(e => h('li', { class: 'ti-error' }, e)), ...(p.warnings || []).map(w => h('li', {}, w.message)));
      ui.parts.replaceChildren(...a.parts.map(part => {
        const sel = h('select', {}, option('', 'skip'), ...Array.from({ length: 8 }, (_, t) => option(t, 'track ' + (t + 1))));
        sel.value = state.assignments[part.key] === null || state.assignments[part.key] === undefined ? '' : String(state.assignments[part.key]);
        sel.addEventListener('change', () => { state.assignments[part.key] = sel.value === '' ? null : Number(sel.value); reconvert(); });
        const pd = Song.partDevice(part, rigNow, library);
        const rigCell = !rigNow ? '—' : pd.device ? pd.channelName + (pd.track ? ' → T' + pd.track : '') + (pd.byName && pd.byName.channel !== part.channel ? ' (name says ' + pd.byName.name + ', channel ' + (pd.byName.channel + 1) + ')' : '') : 'not in the rig' + (pd.byName ? ' (name says ' + pd.byName.name + ', channel ' + (pd.byName.channel + 1) + ')' : '');
        return h('tr', {}, h('td', {}, (part.drums ? '♩ ' : '') + part.name), h('td', {}, part.channel + 1), h('td', { class: pd.device && !D_isEffect(pd) ? '' : 'ti-warn' }, rigCell), h('td', {}, part.noteCount),
          h('td', {}, noteName(part.low) + '–' + noteName(part.high)), h('td', {}, part.firstBar + '–' + part.lastBar),
          h('td', {}, part.programs.length ? part.programs.map(x => x + 1).join(', ') : '—'), h('td', {}, sel));
      }));
      ui.barFrom.max = ui.barTo.max = a.totalBars; ui.barFrom.value = 1; ui.barTo.value = a.totalBars;
      ui.rowSteps.replaceChildren(...a.rowSteps.candidates.map(c => option(c.steps, c.bars + (c.bars === 1 ? ' bar' : ' bars') + ' (' + c.steps + ' steps)' + (a.rowSteps.aligned ? '' : ', not on bar lines'), c.steps === a.rowSteps.default)));
    }

    const D_isEffect = pd => pd.kind === 'effect';
    function showSong(result, song) {
      showChannels(song);   /* Task 09 */
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
        const options = { fileName: state.fileName, assignments: state.assignments, outChannels: state.outChannels.map(c => c === undefined ? undefined : c), rig: activeRig(), library,
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
        state.assignments = Song.defaultAssignments(state.analysis, activeRig());   /* Task 09: the pinned track */
        state.outChannels = Array(8).fill(undefined);
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

    /* Task 09: the guide generated from the active rig (web/rig/guide.js), as a Markdown download. */
    ui.guide.addEventListener('click', () => {
      const G = globalThis.TabbyGuide;
      if (!G || !library) { say('The guide generator is not loaded on this page.'); return; }
      const rigNow = activeRig() || (globalThis.TabbyRig ? globalThis.TabbyRig.rigEmpty() : null);
      try { download(new TextEncoder().encode(G.build({ rig: rigNow, library })), 'Classic-Tabby-MIDI-Guide.md', 'text/markdown'); say('Guide written for the rig "' + rigNow.name + '".'); }
      catch (error) { say('Cannot build the guide: ' + error.message); }
    });
    enable();
    return { state, reconvert, ui };
  }

  const TabbyImportUI = { mount, h, version: '0.8' };
  globalThis.TabbyImportUI = TabbyImportUI;
  if (typeof module !== 'undefined' && module.exports) module.exports = TabbyImportUI;
})();

const FM1_SIMULATOR = {"schema":1,"release_version":"V01","display_version":"tabby-v04.3.1","sha256":"d85d8b266b37391a781f58e2d9888cd90b8153708f4d6b7d780c4b5fd9807ed4","source_sha256":"f35d0b5b2580d8dd0af71ea6a896f7f47599312d919f49383b32988e6a8077b7","sample_bank":"synthesized-demo","user_bytes":471040,"diag":false,"bytes":297105,"url":"./assets/smk37/d85d8b266b37391a781f58e2d9888cd90b8153708f4d6b7d780c4b5fd9807ed4.wasm"};
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
  const chapterText=chapters.map(node=>node.textContent.toLocaleLowerCase());
  const chapterLinks=[...document.querySelectorAll('.manual-index a')];
  function searchManual(){
    const terms=$('manual-search').value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);let count=0;
    chapters.forEach((node,i)=>{const match=terms.every(term=>(chapterText[i]+' '+node.textContent.toLocaleLowerCase()).includes(term));node.hidden=!match;chapterLinks[i].parentElement.hidden=!match;if(match)count++;});
    FM1I18n.text($('manual-count'),terms.length?'Found '+count+' / '+chapters.length+' chapters':chapters.length+' chapters');
    $('manual-empty').hidden=count!==0;$('manual-clear').hidden=!terms.length;
  }
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
    const timer=setTimeout(()=>controller.abort(Error('Connection timed out. Check USB and MIDI permissions, then retry.')),12000);
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
  function cancelConnection(){connecting?.controller.abort(Error('Connection cancelled.'));}
  async function requestMidiAccess(report=status,signal) {
    signal?.throwIfAborted();
    if(!navigator.requestMIDIAccess)throw Error('This browser does not support Web MIDI. Use desktop Chrome or Edge');
    let finished=false;
    report('Requesting MIDI access and initializing ports. If prompted, allow MIDI / SysEx.');
    navigator.permissions?.query({name:'midi',sysex:true}).then(result=>{
      if(!finished&&result.state==='granted')report('MIDI permission is allowed. Waiting for the browser to initialize device ports…');
    }).catch(()=>{});
    if(!midiRequest){
      const pending=navigator.requestMIDIAccess({sysex:true}).then(access=>{
        if(!access.sysexEnabled)throw Error('Allow MIDI / SysEx in your browser');return access;
      });
      midiRequest=pending;
      pending.catch(()=>{if(midiRequest===pending)midiRequest=undefined;});
    }
    const request=midiRequest;
    try {
      const access=await FM1Web.abortable(request,signal);
      report('Searching for SMK37 OPEN and connecting…');return access;
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
    /* Task 14: the force-activate button is gone from the page; force flash is only the checkbox in the migration section. */
    FM1I18n.text($('update-next'),SMK37Boot.blocked?'Page resources are incomplete. Reload the page.':!pkg?'':finishingUpdate?'Firmware updated. Verifying the version…':busy?'Device operation in progress. Please wait.':updateResult==='stock'?'Factory firmware and resources restored; resource read-back passed. Power-cycle the device before use.':updateResult==='ready'?
      'Update complete. Your SMK37 OPEN is ready to use; no further flashing is needed.':!connected||migration?
      (forceSuggested?'Different firmware detected. To migrate, tick Force flash by hand under Migration, factory restore and forced updates.':'Next: connect the device.'):
      same?'This firmware is already installed; no need to flash again.':!$('backup').checked?'Next: confirm that your work is backed up before flashing.':pkg.kind==='stock'?'Next: restore factory V16 for this model. Confirm to start writing.':$('force-update').checked?
      'Next: click Force flash, then read and confirm the compatibility risks.':'Next: click Start update.');
    FM1I18n.text($('install'),pkg?.kind==='stock'?'Install factory V16':$('force-update').checked?'Force flash':'Start update');
    $('library-connect').disabled=locked||!navigator.requestMIDIAccess;
    $('quick-connect').disabled=!connecting&&(locked||!navigator.requestMIDIAccess||(!$('tab-update').hidden&&!pkg));
    FM1I18n.text($('quick-connect'),connecting?'Cancel connection':'Connect device');
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
    showLoaderHint(null);   /* Task 12 A5 */
  }
  /* Task 12 A5: the builds index (builds/index.json) is looked up only when a loader reports another
     build's tag. The candidates cover the main page (./builds/), a builds/<tag>/ page (../) and the
     probe64/ or recover/ pages (../builds/); file:// pages find none and the message says so. */
  const buildsLookup=FM1Web.buildsLookup(['./builds/index.json','../index.json','../builds/index.json'].map(u=>{try{return new URL(u,location.href).href;}catch(_){return u;}}));
  function showLoaderHint(error){
    const box=$('loader-hint');box.replaceChildren();box.hidden=!(error&&error.code==='LOADER_MISMATCH');
    if(box.hidden)return;
    const label=document.createElement('strong');
    if(error.build&&error.build.url){
      FM1I18n.text(label,'That build\'s page:');
      const link=document.createElement('a');link.href=error.build.url;link.target='_blank';link.rel='noopener noreferrer';
      link.textContent=(error.build.tag||'')+' — '+error.build.url;box.append(label,' ',link);
    }else if(error.indexUrl){
      FM1I18n.text(label,'The list of published builds:');
      const link=document.createElement('a');link.href=new URL('./',error.indexUrl).href;link.target='_blank';link.rel='noopener noreferrer';
      link.textContent=link.href;box.append(label,' ',link);
    }else{FM1I18n.text(label,'Disconnect any other SMK-37 before connecting.');box.append(label);}
  }
  function connectionChanged(){
    if(busy||finishingUpdate)return;
    connectionNotice=undefined;
    if(connected&&updater?.link?.lost)clearUpdateConnection('Device disconnected. Please reconnect.');
    if(library?.link?.lost){libraryReady=false;message('Device disconnected. Reconnect the project library.');}
    enable();
  }
  function watch(access){if(watchedAccess)watchedAccess.removeEventListener('statechange',connectionChanged);watchedAccess=access;access.addEventListener('statechange',connectionChanged);}
  $('backup').addEventListener('change',enable);
  async function setForceMode(value,reconnect=connected||!!(updater?.link&&!updater.link.lost)){
    if(busy||finishingUpdate)return false;
    busy=true;clearUpdateConnection('Flashing mode changed. Reconnect the device.');
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
  /* Task 11B: when no port is named like the SMK-37, or several answered, the updater sends
     nothing more and the user picks the device's input here; the next Connect uses only it. */
  function showPortChoices(choices=[]){
    const select=$('update-port'),keep=select.value;
    while(select.options.length>1)select.remove(1);
    for(const choice of choices){const option=document.createElement('option');option.value=choice.id;
      option.textContent=choice.name+(choice.identity?' — '+choice.identity:'');select.append(option);}
    select.value=choices.some(choice=>choice.id===keep)?keep:'';$('port-pick').hidden=!choices.length;
  }
  function showConnectionDetails(diagnostics){
    const box=$('connection-details');box.hidden=!diagnostics;box.open=!!diagnostics;
    for(const kind of ['inputs','outputs','identities','expected','attempts']){
      const list=$('connection-'+kind);list.replaceChildren();
      const entries=diagnostics?.[kind]||[];
      if(!entries.length){const item=document.createElement('li');FM1I18n.text(item,'None');list.append(item);}
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
    busy=true;clearUpdateConnection('Searching for SMK37 OPEN and connecting…');showConnectionDetails(null);
    const report=text=>{status(text);connectionNotice={message:text,failed:false};enable();};
    report('Searching for SMK37 OPEN and connecting…');
    let attemptUpdater;const attempt=beginConnection(),signal=attempt.controller.signal;
    try {
      if(library){libraryReady=false;await library.disconnect();message('Switched to firmware update. Reconnect to use the project library.');}
      if(updater)await updater.disconnect();
      const access=await requestMidiAccess(report,signal);
      watch(access);
      updater=new FM1Web.Updater(access,pkg,(text,value)=>status(
        pkg.kind!=='stock'&&value===100?'Firmware written. Verifying the version…':text,
        pkg.kind!=='stock'&&typeof value==='number'?value*0.8:value),{},{builds:buildsLookup});   /* Task 12 A5 */
      attemptUpdater=updater;
      /* Task 11B: the port the user picked from #update-port, if any (CHOOSE_PORT below). */
      const device=await updater.connect({force:$('force-update').checked,signal,pick:$('update-port').value||null}); connected=true;same=!!device.same;migration=!!device.migration;forceSuggested=migration;
      $('device-identity').textContent=device.identity;
      status(migration?'Device and current firmware recognized (not Open firmware). To migrate, open Migration, factory restore and forced updates, tick Force flash by hand, then connect again.':same?'This version is already installed. No update is needed.':device.resume?'Loader connected; hardware model unverified. Check the device label before writing.':pkg.kind==='stock'?'Device connected; ready to restore factory V16.':$('force-update').checked?'Connected. Confirm the device and compatibility risks before force flashing.':'SMK37 OPEN connected. Ready to update');
      connectionNotice=undefined;
    }catch(error){connectionNotice={message:error.message,failed:true};showConnectionDetails(attemptUpdater?.diagnostics);forceSuggested=false;   /* Task 12 (2026-11-09): an error never suggests force */if(error.code==='CHOOSE_PORT')showPortChoices(error.choices);FM1I18n.text($('error'),error.message);showLoaderHint(error);status('Not connected');if(error.identity)$('device-identity').textContent=error.identity;}
    finally{await endConnection(attempt);busy=false;enable();}
  }
  $('connect').addEventListener('click',connectDevice);
  /* Task 12 (2026-11-09): the "Enable force flash and reconnect" button is gone (it was offered after a query timeout on 2026-11-09). */
  function packageDetails(){
    FM1I18n.text($('update-intro'),pkg.kind==='stock'?'Connect this model, confirm your backup, then click Install factory V16.':'Connect SMK37 OPEN, confirm your backup, then click Start update.');
    FM1I18n.text($('profile'),'SMK37 '+(pkg.model==='elite'?'Elite':'Pro')+(pkg.kind==='stock'?' Factory V16':' Open'));
    $('firmware-version').textContent=pkg.display_version||pkg.release_version||'—';   // Task 08: the display version
    $('base-version').textContent=pkg.release_version||'—';                              // the Open label stays in the details
    FM1I18n.text($('version'),pkg.build_id.slice(0,16));$('version').title=pkg.build_id;
    FM1I18n.text($('size'),(pkg.bytes/1024).toFixed(1)+' KiB');
  }
  async function chooseFirmware(stock){
    if(busy||finishingUpdate||!openPkg)return;
    const reconnect=connected;busy=true;clearUpdateConnection('Firmware target changed. Check the version and your backup.');enable();
    try{
      if(updater)await updater.disconnect();
      if(library){libraryReady=false;await library.disconnect();}
      if(stock&&!stockPkg){status('Loading factory firmware…');stockPkg=await FM1Web.prepare(FM1_PACKAGE.stock);}
      pkg=stock?stockPkg:openPkg;$('backup').checked=false;$('force-update').checked=stock;
      $('force-warning').hidden=true;packageDetails();status('Firmware verified. Waiting for device connection');
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
    if(SMK37Boot.blocked)throw Error('Page resources are incomplete. Reload the page.');
    if(busy||(finishingUpdate&&!duringUpdate))throw Error('A device operation is already in progress');busy=true;connectionNotice=undefined;enable();
    try {
      if(connected){clearUpdateConnection('Switched to the project library. Reconnect before updating firmware.');if(updater)await updater.disconnect();}
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
      message('Device operation completed.');return result;
    } finally {busy=false;enable();}
  }
  const saveDialog=$('device-save-dialog');let saveBytes,saveRunning=false,saveOpening=false,saveReturnFocus;
  function saveStatus(text){FM1I18n.text($('device-save-status'),text);}
  async function openSave(bytes){
    if(busy||finishingUpdate||saveOpening||saveRunning)throw Error('A device operation is already in progress');
    saveOpening=true;saveBytes=bytes?.slice();saveReturnFocus=document.activeElement;
    const selected=!bytes?$('project-slot').value:'';
    FM1I18n.text($('device-save-source'),bytes?'Write the current browser project to SMK37 OPEN, replacing the device workspace.':'Save the current SMK37 OPEN workspace to the selected device project slot.');
    $('device-save-confirm').disabled=true;$('device-save-slot').disabled=true;
    $('device-save-slot').replaceChildren();saveStatus('Connecting and reading device project slots…');saveDialog.showModal();
    try{
      await deviceProject(async()=>{},true);
      if(!saveDialog.open)return;
      for(const node of $('project-slot').options)$('device-save-slot').append(option(node.value,node.textContent));
      $('device-save-slot').value=selected||$('project-slot').value;
      $('device-save-confirm').disabled=false;$('device-save-slot').disabled=false;
      saveStatus('Choose a save location. Its existing content will be replaced.');$('device-save-slot').focus();
    }catch(error){saveStatus(error.message);}finally{saveOpening=false;}
  }
  function closeSave(){if(saveRunning)return;if(saveOpening)cancelConnection();saveDialog.close();saveBytes=undefined;saveReturnFocus?.focus();}
  $('device-save-cancel').onclick=closeSave;
  saveDialog.addEventListener('cancel',event=>{event.preventDefault();closeSave();});
  $('device-save-confirm').onclick=async()=>{
    if(saveRunning||busy||finishingUpdate)return;const slot=Number($('device-save-slot').value);
    saveRunning=true;writing=true;$('device-save-confirm').disabled=true;
    $('device-save-slot').disabled=true;$('device-save-cancel').disabled=true;
    saveStatus('Writing and verifying by reading back. Keep the device connected…');
    try{
      const saved=await deviceProject(l=>l.saveProject(slot,saveBytes));
      document.dispatchEvent(new CustomEvent('fm1-device-project-saved',{detail:{bytes:saved}}));
      saveStatus('Saved to device slot '+(slot+1)+'; read-back verification passed.');
      message('Saved to device slot '+(slot+1)+'; read-back verification passed.');
      saveBytes=undefined;FM1I18n.text($('device-save-cancel'),'Done');
    }catch(error){saveStatus('Save could not be confirmed: '+error.message);$('device-save-confirm').disabled=false;$('device-save-slot').disabled=false;}
    finally{saveRunning=false;writing=false;$('device-save-cancel').disabled=false;}
  };
  saveDialog.addEventListener('close',()=>{FM1I18n.text($('device-save-cancel'),'Cancel');});
  $('quick-connect').addEventListener('click',()=>connecting?cancelConnection():$('tab-update').hidden?connectLibrary():connectDevice());
  $('about-open').onclick=()=>$('about-dialog').showModal();
  // Classic Tabby Task 11: a package whose USER size is not the stock 536576 (the probe) or a
  // diagnostic build says so at the top of the update tab and in the page title.
  // Task 12 A1: 471040 is the normal layout from tabby-v04.0. A package with it says plainly that
  // installing it over tabby-v03.x (or V01 / V16) moves the storage; a 536576 package (the old
  // layout, the way back) says the reverse. Neither is a test build any more; the title changes
  // only for a diagnostic build.
  if(typeof FM1_PACKAGE==='object'&&FM1_PACKAGE&&(FM1_PACKAGE.user_bytes||FM1_PACKAGE.diag)){
    const w=$('layout-warning'),size=FM1_PACKAGE.user_bytes,notes=[];
    if(size===471040)notes.push('This release moves the device storage (USER 471040 bytes; tabby-v03.x, V01 and V16 use 536576). Coming from one of those: make a Full backup first (Projects & sounds tab) and keep it. After the install your projects, device settings and songs are gone until you run Full restore and Verify. Bluetooth pairings are lost once. If ACTIONS shows OLD DATA, erase it (with confirmation) before restoring. Going back to tabby-v03.x moves the storage back the same way: back up, install, restore.');
    else if(size&&size!==471040)notes.push('This build uses the older storage layout (USER '+size+' bytes; tabby-v04.0 and later use 471040). Installing it over tabby-v04.0 or later moves the storage back: make a Full backup first, then Full restore and Verify after the install.');
    if(FM1_PACKAGE.diag)notes.push('Diagnostic build: adds command 26, the remote ACTIONS / song commands for unattended hardware runs. The timing counters are in every build.');
    if(notes.length){w.textContent=notes.join(' ');w.hidden=false;}
    if(FM1_PACKAGE.diag)document.title='DIAGNOSTIC BUILD · '+document.title;
  }
  /* Classic Tabby (Task 03 a): no sample bank on the device. The post-update sample check
     is a no-op that reports the firmware as ready. */
  globalThis.FM1Workbench={state:()=>deviceState,read:()=>deviceProject(l=>l.download(0)),write:bytes=>deviceProject(l=>l.upload(0,0,bytes)),save:openSave};
  async function checkDeviceSamples(afterUpdate=false){
    if(busy||finishingUpdate&&!afterUpdate)return;
    updateResult=afterUpdate?'ready':'checked';
    status(afterUpdate?'Firmware ready.':'Device ready.',100);enable();
  }
  async function refreshLibrary(initial=false) {
    libraryReady=false;
    const info=await library.query(0);
    if(info.length!==14||info[1]!==16||info[2]>=16||!((info[0]===3&&info[3]===208&&info[4]===15)||(info[0]===4&&info[3]===224&&info[4]===15))||info.slice(6).some(source=>source>5))throw Error('Invalid device project-library information');
    const previous=Number($('project-slot').value),selected=initial||$('project-slot').value===''||!Number.isInteger(previous)||previous<0||previous>=16?info[2]:previous;
    const slots=[];
    for(let slot=0;slot<info[1];slot++){
      const name=await library.query(9,[slot],true);
      slots.push(option(slot,(slot+1)+' · '+String.fromCharCode(...name).trim()));
    }
    const working=await library.download(0);
    if(working.length!==(library.tuningBytes||(info[3]|info[4]<<8)))throw Error('Invalid device file length');
    FM1Web.projectVersion(working);
    // Task 06 (a): the Bluetooth settings panel replaces the device's BLE page.
    $('radio-group').hidden=!library.radioSettings;
    $('diag-group').hidden=!library.diagCounters;   // Task 11: the counters; every build from tabby-v04.0 (Task 12 A4)
    if(library.radioSettings){const r=await library.radioRead();$('radio-on').checked=r.on;$('radio-audio').checked=r.audio;$('radio-role').value=r.host?'1':'0';}
    // Publish a complete snapshot only after every query succeeds. A partial
    // list must never enable load/save/import with an empty selection.
    $('project-slot').replaceChildren(...slots);
    $('project-slot').value=String(selected);
    const sources=['DX7','303','808','PSG','Pluck','Sampler'];
    const toneTrack=$('timbre-track').value||'0';$('timbre-track').replaceChildren();
    for(let i=0;i<8;i++)$('timbre-track').append(option(i,'Track '+(i+1)+' · '+(sources[info[6+i]]||'Unknown')));
    $('timbre-track').value=toneTrack;
    const first=Array.from(info.slice(6)).findIndex(type=>type===0);
    for(const id of ['patch-track']){
      const track=Number($(id).value||0);$(id).replaceChildren();
      for(let i=0;i<8;i++){
        const node=option(i,'Track '+(i+1)+' · '+(sources[info[6+i]]||'Unknown'));node.disabled=info[6+i]!==0;$(id).append(node);
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
    report('Searching for SMK37 OPEN and connecting…');
    const attempt=beginConnection(),signal=attempt.controller.signal;
    try{
      libraryReady=false;clearUpdateConnection('Switched to the project library. Reconnect before updating firmware.');if(updater)await updater.disconnect();if(library)await library.disconnect();
      const access=await requestMidiAccess(report,signal);
      watch(access);
      library=createLibrary(access);await library.connect({signal});await refreshLibrary(true);message('Project library connected.');connectionNotice=undefined;
      await songOldDataCheck().catch(()=>{});   /* Task 12 A1 */
    }catch(error){connectionNotice={message:error.message,failed:true};
      /* Task 11C: no matching port (NO_PORT) or a failed probe: list the ports the browser sees. */
      showConnectionDetails(library?.diagnostics||error.ports||null);throw error;}
    finally{await endConnection(attempt);}
  });}
  $('library-connect').addEventListener('click',connectLibrary);
  // Task 06 (a): Bluetooth settings (transfer command 24). Each change is written at once.
  const radioMessage=text=>{$('radio-message').textContent=text?FM1I18n.t(text):'';};
  const radioWrite=async()=>{try{await library.radioWrite({on:$('radio-on').checked,audio:$('radio-audio').checked,host:$('radio-role').value==='1'});radioMessage('Bluetooth settings written to the device.');}catch(error){radioMessage(error.message);}};
  for(const id of ['radio-on','radio-audio','radio-role'])$(id).addEventListener('change',radioWrite);
  $('radio-forget').addEventListener('click',async()=>{if(!confirm(FM1I18n.t('Forget the BLE MIDI pairs stored on the device?')))return;try{await library.radioForget();radioMessage('MIDI pairs forgotten; remove the pairing on the computer or tablet too, then pair again.');}catch(error){radioMessage(error.message);}});
  $('library-refresh').addEventListener('click',()=>perform(async()=>{await refreshLibrary();message('Project and track lists refreshed.');}));
  // Classic Tabby Task 11 (Step 2): full backup, restore and verify (FM1Web Library.fullBackup /
  // fullRestore / fullVerify; docs/BACKUP-FORMAT.md). Restore validates the whole file before it
  // writes anything and writes only through the transfer commands.
  const backupMessage=text=>{$('backup-message').textContent=text||'';};
  const backupNotes=list=>{$('backup-notes').replaceChildren(...(list||[]).map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));};
  let backupText=null;
  const backupProgress=label=>value=>backupMessage(label+' '+Math.round(value*100)+' %');
  $('backup-make').addEventListener('click',()=>perform(async()=>{
    backupNotes([]);
    const rig=globalThis.TabbyRig?TabbyRig.rigLoad():null;
    const file=await library.fullBackup(backupProgress('Reading the device…'),{workbench:FM1_SIMULATOR&&FM1_SIMULATOR.display_version||null,rig});
    const stamp=file.created.replace(/[:]/g,'-').replace(/\..*/,'');
    saveFile(new TextEncoder().encode(JSON.stringify(file)),'classic-tabby-backup-'+stamp+'.json');
    backupMessage('Full backup saved: '+file.counts.projects+' projects, '+file.counts.songs+' songs, '+file.counts.blocks+' blocks (USER '+file.device.user_bytes+'). Keep this file.');
    backupNotes(['Not in the file:'].concat(file.not_included));
    await refreshLibrary();
  }));
  $('backup-file').addEventListener('change',async()=>{
    backupText=null;backupNotes([]);const file=$('backup-file').files[0];if(!file)return;
    try{const text=await file.text();const b=FM1Web.backupParse(text);backupText=text;
      backupMessage('File checked: '+b.file.counts.projects+' projects, '+b.file.counts.songs+' songs, '+b.file.counts.blocks+' blocks, made '+b.file.created+' on USER '+b.device.user_bytes+(b.device.build_id?' (build '+b.device.build_id.slice(0,12)+')':'')+'.');}
    catch(error){backupMessage('Refused: '+error.message);}
  });
  $('backup-restore').addEventListener('click',()=>perform(async()=>{
    if(!backupText)throw Error('Choose a full backup file first.');
    const b=FM1Web.backupParse(backupText);
    const plan='Replace the device contents with this backup?\n\n- Project slots written: '+b.projects.filter(p=>p.bytes).map(p=>p.slot+1).join(', ')+
      '\n- Songs written: '+(b.songs.filter(s=>!s.empty).map(s=>s.slot+1).join(', ')||'none')+'; song slots empty in the file are deleted on the device'+
      '\n- Device settings: '+(b.settings.kind8?'yes':'not in the file')+'\n\nThe file was made on USER '+b.device.user_bytes+'; this device runs USER '+library.userBytes+'.';
    if(!confirm(plan))return;
    const result=await library.fullRestore(b,backupProgress('Restoring…'));
    if($('backup-rig').checked&&b.rig&&globalThis.TabbyRig){try{TabbyRig.rigSave(TabbyRig.rigNormalize(b.rig));result.notes.push('"My rig" from the file is saved in this browser; reload the page to see it in the rig panel.');}catch(error){result.notes.push('The file\'s rig could not be read: '+error.message);}}
    backupMessage('Restore written. Verifying…');
    const v=await library.fullVerify(b,backupProgress('Verifying…'));
    backupMessage(v.pass?'Verify PASS: '+v.checked+' items identical to the file.':'Verify FAIL: '+v.difference);
    backupNotes(result.notes.concat(v.notes));
    await refreshLibrary();
  }));
  $('backup-verify').addEventListener('click',()=>perform(async()=>{
    if(!backupText)throw Error('Choose a full backup file first.');
    const v=await library.fullVerify(backupText,backupProgress('Verifying…'));
    backupMessage(v.pass?'Verify PASS: '+v.checked+' items identical to the file.':'Verify FAIL: '+v.difference);backupNotes(v.notes);
    await refreshLibrary();
  }));
  // Task 11 (Step 3): the diagnostic build's counters (transfer command 25).
  let diagText='';
  const diagShow=d=>{diagText=FM1Web.diagText(d);$('diag-output').textContent=diagText;};
  $('diag-read').addEventListener('click',()=>perform(async()=>{diagShow(await library.diagRead(false));}));
  $('diag-reset').addEventListener('click',()=>perform(async()=>{diagShow(await library.diagRead(true));message('Counters reset.');}));
  $('diag-copy').addEventListener('click',()=>{if(diagText&&navigator.clipboard)navigator.clipboard.writeText(diagText).catch(()=>{});});

  $('project-rename').addEventListener('click',()=>perform(async()=>{
    const name=$('project-name').value;if(!/^[\x20-\x7e]{1,12}$/.test(name))throw Error('Use 1–12 printable ASCII characters for the name');
    await library.query(10,Array.from(name.padEnd(12),c=>c.charCodeAt(0)));message('Name changed. Save the project to keep it.');
  }));
  $('project-save').addEventListener('click',()=>openSave().catch(error=>message(error.message)));
  $('project-load').addEventListener('click',()=>perform(async()=>{
    const slot=Number($('project-slot').value);
    await library.query(8,[slot]);await refreshLibrary();message('Project loaded.');
  }));
  $('project-export').addEventListener('click',()=>perform(async()=>{
    const data=await library.download(0);saveFile(FM1Web.projectFile(data),'SMK37 OPEN-project.fm1');message('Current project exported as a backup file.');
  }));
  $('project-file').addEventListener('change',()=>perform(async()=>{
    projectBytes=undefined;const file=$('project-file').files[0];if(!file)return;
    if(file.size>4280)throw Error('Project backup file is too large');projectBytes=FM1Web.readProjectFile(new Uint8Array(await file.arrayBuffer()));message('Backup verified. Ready to restore to the workspace.');
  }));
  $('project-import').addEventListener('click',()=>perform(async()=>{
    if(!projectBytes||!confirm(FM1I18n.t('Replace the unsaved workspace with this backup? Device project slots will not be overwritten automatically.')))return;
    await library.upload(0,0,projectBytes);await refreshLibrary();message('Project restored to the workspace. Choose a slot and save it.');
  }));
  $('timbre-file').addEventListener('change',()=>perform(async()=>{
    timbreBytes=undefined;const file=$('timbre-file').files[0];if(!file)return;
    if(file.size!==239)throw Error('Choose a .fm1t sound exported by this version');
    timbreBytes=FM1Web.readTimbreFile(new Uint8Array(await file.arrayBuffer()));message('Sound verified. Ready to import to the selected track.');
  }));
  $('timbre-import').addEventListener('click',()=>perform(async()=>{
    if(!timbreBytes)throw Error('Choose a sound file first');
    const track=Number($('timbre-track').value);
    if(!confirm(FM1I18n.t('Replace track '+(track+1)+' engine and sound? Switching between drums and melody clears this track’s steps.')))return;
    await library.upload(2,track,timbreBytes);await refreshLibrary();message('Sound imported. Save the project for PROJECT tracks. For LIVE tracks, export a timbre file, or save DX7 voices to the independent library.');
  }));
  $('timbre-export').addEventListener('click',()=>perform(async()=>{
    const track=Number($('timbre-track').value);
    saveFile(FM1Web.timbreFile(await library.download(2,track)),'SMK37 OPEN-track-'+(track+1)+'.fm1t');message('Track sound exported.');
  }));
  $('patch-file').addEventListener('change',()=>perform(async()=>{
    voices=[];$('patch-choice').replaceChildren();const file=$('patch-file').files[0];if(!file)return;
    if(file.size>4104)throw Error('Choose a single-patch or 32-patch DX7 .syx file');
    voices=FM1Web.readVoices(new Uint8Array(await file.arrayBuffer()));
    voices.forEach((p,i)=>$('patch-choice').append(option(i,(i+1)+' · '+String.fromCharCode(...p.slice(145,155)).replace(/[^\x20-\x7e]/g,'?'))));
    message('Verified '+voices.length+' patches. Choose a patch and target DX7 track.');
  }));
  $('patch-import').addEventListener('click',()=>perform(async()=>{
    const track=patchTarget(),patch=voices[Number($('patch-choice').value)];
    if(!patch||track<0)throw Error('Choose a DX7 track and patch');
    if(!confirm(FM1I18n.t('Replace track '+(track+1)+' sound? Notes on this track will stop.')))return;
    await library.upload(1,track,patch);message('Sound imported. Save the project for PROJECT tracks. For LIVE tracks, export a timbre file, or save DX7 voices to the independent library.');
  }));
  $('patch-export').addEventListener('click',()=>perform(async()=>{
    const track=patchTarget();if(track<0)throw Error('Set a track to DX7, then refresh the list');
    const patch=await library.download(1,track);saveFile(FM1Web.voiceFile(patch,track===7?9:track),'SMK37 OPEN-track-'+(track+1)+'.syx');message('Patch exported as a DX7 .syx file.');
  }));

  // ---- Classic Tabby song editor (Task 03 d) --------------------------------------------
  const songEd={song:null,blocks:new Map(),slot:0};
  const songMessage=text=>FM1I18n.text($('song-message'),text);
  const songSim=()=>$('song-target').value==='sim';
  // `progress` (Task 02 Step 4) lets the MIDI importer show the write progress in its own
  // panel; `exists` returns the slot's record image (or null) without downloading blocks.
  const songBackend=(progress=p=>songMessage('Writing song '+Math.round(p*100)+'%'))=>{
    if(songSim()){const sim=globalThis.FM1Simulator;if(!sim||!sim.ready())throw Error('Start the simulator first');
      return {read:song=>sim.request('song-read',{song}).then(d=>d?{record:d.record,blocks:new Map(d.blocks)}:null),
        write:(song,record,blocks)=>sim.request('song-write',{song,record,blocks:[...blocks]}),
        remove:song=>sim.request('song-delete',{song}),status:()=>sim.request('song-status'),
        exists:song=>sim.request('song-read',{song}).then(d=>d?d.record:null)};}
    if(!library||!libraryReady)throw Error('Connect the project library first');
    return {read:song=>library.songRead(song,p=>songMessage('Reading song '+Math.round(p*100)+'%')),write:(song,record,blocks)=>library.songWrite(song,record,blocks,progress),
      remove:song=>library.songDelete(song),status:()=>library.songStatus(),
      exists:song=>library.download(5,song).catch(error=>{if(error.deviceCode===1)return null;throw error;})};
  };
  // Task 04: the rig setup and the row event editor (web/rig/, inlined by build-web.py) edit
  // song.events in place; the write and export paths take the list with the rig's gaps applied.
  // Task 09: the device library is built once and shared with the importer, which maps parts by the rig.
  const deviceLibrary=globalThis.TabbyDevices?TabbyDevices.load(globalThis.FM1_DEVICES||[]):null;
  const rigUI=globalThis.TabbyRigUI&&globalThis.TabbyRig&&deviceLibrary&&$('rig-setup')&&$('song-events')
    ?TabbyRigUI.mount({setup:$('rig-setup'),events:$('song-events'),library:deviceLibrary,onChange:()=>{},message:text=>songMessage(text)}):null;
  // Task 02 Step 4: the MIDI importer (web/import/, inlined by build-web.py) mounts next to the
  // editor and writes through the same backend, so device and simulator targets behave alike.
  // Task 09: it reads the active rig (My rig, or the song's own copy) and the device library.
  if(globalThis.TabbyImportUI&&globalThis.TabbySongTransfer&&$('midi-import'))
    TabbyImportUI.mount($('midi-import'),{transfer:TabbySongTransfer.select({backend:songBackend,name:()=>songSim()?'simulator':'device'}),rig:()=>rigUI?rigUI.rig():null,library:deviceLibrary});
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
    for(const h of ['Step '+(s+1),'Pitch','Velocity','Retrigger','Offset (units)','','Length (steps + units)','']){const th=document.createElement('th');th.textContent=h;head.append(th);}t.append(head);
    const write=()=>{input.value=FM1Web.songStepText(step);songMark(input);songInspect(s);};
    step.notes.forEach((n,k)=>{
      const tr=document.createElement('tr');const cell=el=>{const td=document.createElement('td');td.append(el);tr.append(td);return td;};
      const num=(value,min,max,stepv,on)=>{const i=document.createElement('input');i.type='number';i.min=min;i.max=max;i.step=stepv;i.value=value;i.addEventListener('change',()=>{on(Number(i.value));write();});return i;};
      cell(document.createTextNode(String(k+1)));
      cell(num(n.pitch,0,127,1,v=>{n.pitch=Math.max(0,Math.min(127,Math.round(v)));}));
      cell(num(n.velocity,1,127,1,v=>{n.velocity=Math.max(1,Math.min(127,Math.round(v)));}));
      const r=document.createElement('input');r.type='checkbox';r.checked=!!n.retrigger;r.addEventListener('change',()=>{n.retrigger=r.checked;write();});cell(r);
      cell(num(n.offset,-240,240,1,v=>{n.offset=Math.max(-240,Math.min(240,Math.round(v)));}));
      const ro=document.createElement('span');ro.className='readout';ro.textContent=TabbyTimedNote.offsetFraction(n.offset)+' steps · '+(n.offset*msPerUnit>=0?'+':'')+(n.offset*msPerUnit).toFixed(2)+' ms @ '+bpm;cell(ro);
      const steps=Math.floor(n.length/SONG_UNITS),rest=n.length%SONG_UNITS,len=document.createElement('span');
      len.append(num(steps,0,17476,1,v=>{n.length=Math.max(1,Math.max(0,Math.round(v))*SONG_UNITS+(n.length%SONG_UNITS));}),' + ',num(rest,0,479,1,v=>{n.length=Math.max(1,Math.floor(n.length/SONG_UNITS)*SONG_UNITS+Math.max(0,Math.min(479,Math.round(v))));}));cell(len);
      const rl=document.createElement('span');rl.className='readout';rl.textContent=FM1Web.songLengthText(n.length)+' steps · '+(n.length*msPerUnit).toFixed(1)+' ms';cell(rl);
      t.append(tr);});
    box.append(t);
    if(!step.notes.length){const p=document.createElement('p');FM1I18n.text(p,'No note on this step: type one in the box above, for example 60:100:1/-12');box.append(p);}
  }
  const songQuantize=mode=>{let changed=0;for(const i of $('song-steps').querySelectorAll('input')){if(!i.value.trim())continue;let step;try{step=FM1Web.songStepParse(i.value);}catch(_){continue;}
    for(const n of step.notes){const before=n.offset+':'+n.length;if(n.offset)n.offset=0;if(mode==='ends')n.length=Math.max(1,Math.round(n.length/SONG_UNITS))*SONG_UNITS;if(before!==n.offset+':'+n.length)changed++;}
    i.value=FM1Web.songStepText(step);songMark(i);}
    if(songEd.inspecting!==undefined)songInspect(songEd.inspecting);songMessage('Quantized '+changed+' notes (this block in the editor only; click Store block to keep them).');};
  $('song-quantize-starts').addEventListener('click',()=>songQuantize('starts'));
  $('song-quantize-ends').addEventListener('click',()=>songQuantize('ends'));
  const songBlockList=()=>FM1I18n.text($('song-blocks'),songEd.blocks.size?'Blocks in the editor: '+[...songEd.blocks.keys()].sort((a,b)=>a-b).join(', '):'There are no blocks in the editor.');
  function songRowsRender(){
    const body=$('song-rows').querySelector('tbody');body.replaceChildren();
    songEd.song.rows.forEach((row,r)=>{const tr=document.createElement('tr');const th=document.createElement('th');th.textContent=String(r+1);tr.append(th);
      const cell=(value,attrs,cls)=>{const td=document.createElement('td'),i=document.createElement('input');Object.assign(i,attrs);i.value=value;i.dataset.songRow=r;i.dataset.songField=cls;td.append(i);tr.append(td);};
      for(let t=0;t<8;t++)cell(row.block[t],{type:'number',min:'0',max:'65535',step:'1'},'b'+t);
      cell(row.repeat,{type:'number',min:'1',max:'64',step:'1'},'repeat');cell(row.steps,{type:'number',min:'16',max:'64',step:'16'},'steps');
      const td=document.createElement('td'),c=document.createElement('input');c.type='checkbox';c.checked=row.loopHere;c.dataset.songRow=r;c.dataset.songField='loop';td.append(c);tr.append(td);
      body.append(tr);});
    // Task 06: per track, the pattern numbers (rows with a block) the TRACK LAUNCH page offers.
    $('song-patterns').textContent=FM1I18n.t('Patterns per track (row numbers): ')+songEd.song.rows.length?Array.from({length:8},(_,t)=>'T'+(t+1)+' '+(songEd.song.rows.map((row,r)=>row.block[t]?String(r+1):'').filter(Boolean).join(' ')||'-')).join('   '):'';
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
    const s=songEd.song;if(!s)throw Error('Read or create a song first');
    s.name=$('song-name').value;s.project=Number($('song-project').value);s.tempo=Number($('song-tempo').value)||0;s.loop=$('song-loop').checked;
    s.loopRow=Number($('song-loop-row').value)-1;s.jumpRow=$('song-jump').value==='1';s.swing=$('song-swing').checked;
    for(const i of $('song-channels').querySelectorAll('input'))s.channel[Number(i.dataset.songChannel)]=Number(i.value)||0;
    for(const i of $('song-rows').querySelectorAll('input')){const row=s.rows[Number(i.dataset.songRow)],f=i.dataset.songField;
      if(f==='loop')row.loopHere=i.checked;else if(f==='repeat')row.repeat=Number(i.value);else if(f==='steps')row.steps=Number(i.value);else row.block[Number(f.slice(1))]=Number(i.value)||0;}
    // Task 04: events with the rig's gaps applied; a song with events becomes a version-2 record.
    const record=FM1Web.songRecordBuild({...s,events:rigUI?rigUI.prepareEvents(s):(s.events||[])});
    for(const id of FM1Web.songBlockIds(s))if(!songEd.blocks.has(id))throw Error('Block '+id+' is used by a row but is not in the editor; save that block first');
    return record;
  }
  const songAct=fn=>async()=>{try{await fn();}catch(error){songMessage(error.message);}};
  $('song-target').addEventListener('change',()=>{songEd.song=null;songEd.blocks=new Map();songRender();songMessage('');});
  $('song-new').addEventListener('click',songAct(async()=>{songEd.song=FM1Web.songEmpty();songEd.blocks=new Map();songRender();songMessage('New empty song: fill in rows and blocks, then click Write song.');}));
  $('song-read').addEventListener('click',songAct(async()=>{
    const slot=Number($('song-slot').value),got=await songBackend().read(slot);
    if(!got){songEd.song=null;songEd.blocks=new Map();songRender();songMessage('This song slot is empty.');return;}
    songEd.song=FM1Web.songRecordParse(got.record);songEd.blocks=got.blocks;songRender();songMessage('Song read.');
  }));
  $('song-write').addEventListener('click',songAct(async()=>{
    const slot=Number($('song-slot').value),record=songCollect();
    // Task 03 (f): the shared write path deletes an occupied slot first; say so before writing.
    const old=await songBackend().exists(slot);
    if(!confirm(FM1I18n.t('Write song slot ')+(slot+1)+'?'+(old?'\n\n'+FM1I18n.t('This slot already holds a song: it is deleted before the write and its blocks are reclaimed at the next compaction. To keep the old song, cancel and export a .tabby first.'):'')))return;
    await songBackend().write(slot,record,songEd.blocks);songMessage(old?'Old song deleted; new song written and verified by read-back.':'Song written and verified by read-back.');
  }));
  $('song-delete').addEventListener('click',songAct(async()=>{
    const slot=Number($('song-slot').value);if(!confirm(FM1I18n.t('Delete song slot ')+(slot+1)+'?'))return;
    await songBackend().remove(slot);songMessage('Song deleted.');
  }));
  $('song-export').addEventListener('click',songAct(async()=>{
    const record=songCollect();saveFile(FM1Web.tabbyFile(record,songEd.blocks,rigUI?rigUI.trailer(songEd.song):null),'SMK37 OPEN-'+(songEd.song.name.trim()||'song').replace(/[^A-Za-z0-9-]+/g,'_')+'.tabby');songMessage('Exported the .tabby file.');
  }));
  $('song-file').addEventListener('change',songAct(async()=>{
    const file=$('song-file').files[0];if(!file)return;if(file.size>4096+2048*1608)throw Error('.tabby file too large');
    const got=FM1Web.readTabbyFile(new Uint8Array(await file.arrayBuffer()));songEd.song=FM1Web.songRecordParse(got.record);songEd.blocks=got.blocks;
    if(got.trailer&&got.trailer.rig&&globalThis.TabbyRig){try{songEd.song.rig=TabbyRig.rigNormalize(got.trailer.rig);}catch(_){songEd.song.rig=null;}}   // Task 04: per-song rig override
    songRender();
    songMessage('Imported the .tabby file into the editor; click Write song to upload it.');
  }));
  /* Task 12 A1: after the project library connects, say plainly when song storage holds OLD DATA
     and offer the erase. Nothing is sent until the user confirms the dialog. */
  async function songOldDataCheck(){
    const box=$('song-old-data');box.hidden=true;
    if(!library||!library.songStorage)return;
    const s=await library.songStatus();box.hidden=s.state!==2;
    $('song-erase-old').disabled=!(library.tabbyFlags&2);
    if(s.state===2&&!(library.tabbyFlags&2))songMessage('Song storage holds OLD DATA. This firmware cannot erase it from the web page: on the device, press SEQ and EDIT together for ACTIONS, choose ERASE OLD DATA, press the 4th button in the left group (after SHIFT, FADER BANK, HOME), then press it again to confirm.');
  }
  $('song-erase-old').addEventListener('click',songAct(async()=>{
    if(!library)throw Error('Connect the project library first');
    if(!confirm('Erase the old data in song storage?\n\nThis erases every song-storage sector that is not in the song format. Projects, tunings and device settings are kept. It cannot be undone. The device must be stopped.'))return;
    await library.eraseOldData();
    songMessage('Erasing old data on the device; this takes a few seconds. Click Storage status to check: it reports READY when done.');
    $('song-old-data').hidden=true;
  }));
  $('song-status').addEventListener('click',songAct(async()=>{
    const s=await songBackend().status();
    const words=['follow','launched','stopped'],queues=['','queued launch','queued stop','queued back to song'];
    const tracks=s.tracks?'; tracks: '+s.tracks.map((t,i)=>'T'+(i+1)+' '+words[t.state]+(t.row!==255?' r'+(t.row+1):'')+(t.queue?' ('+queues[t.queue]+')':'')+(t.waiting?' waiting':'')).join(', '):'';
    songMessage('Song storage: '+s.free+' bytes free, '+s.reclaimable+' bytes reclaimable'+(s.state===2?' (OLD DATA: erase it with Erase old data, or on the device in ACTIONS)':s.state===1?' (busy)':'')+(s.events?'; loaded song: '+s.events+' events, '+s.late+' late':'')+tracks+'.');
  }));
  $('song-row-add').addEventListener('click',songAct(async()=>{if(!songEd.song)throw Error('Read or create a song first');if(songEd.song.rows.length>=128)throw Error('At most 128 rows');
    const last=songEd.song.rows[songEd.song.rows.length-1];songEd.song.rows.push({block:last.block.slice(),repeat:last.repeat,loopHere:false,steps:last.steps});songRowsRender();}));
  $('song-row-remove').addEventListener('click',songAct(async()=>{if(!songEd.song||songEd.song.rows.length<=1)throw Error('Keep at least 1 row');songEd.song.rows.pop();songRowsRender();}));
  $('song-block-load').addEventListener('click',songAct(async()=>{
    const id=Number($('song-block-id').value),payload=songEd.blocks.get(id);
    const steps=payload?FM1Web.songPayloadParse(payload):Array.from({length:64},()=>({probability:0,alt:false,notes:[]}));
    for(const i of $('song-steps').querySelectorAll('input')){i.value=FM1Web.songStepText(steps[Number(i.dataset.songStep)]);songMark(i);}
    $('song-inspector').hidden=true;songEd.inspecting=undefined;
    songMessage(payload?'Block '+id+' loaded into the step editor.':'Block '+id+' does not exist yet: edit it, then click Store block to create it.');
  }));
  $('song-block-store').addEventListener('click',songAct(async()=>{
    const id=Number($('song-block-id').value);if(!(id>=1&&id<=65535))throw Error('Block id must be 1-65535');
    const steps=[];for(const i of $('song-steps').querySelectorAll('input'))steps[Number(i.dataset.songStep)]=FM1Web.songStepParse(i.value);
    songEd.blocks.set(id,FM1Web.songPayloadBuild(steps));songBlockList();songMessage('Block '+id+' saved in the editor; it is uploaded when you write the song.');
  }));
  $('song-block-remove').addEventListener('click',songAct(async()=>{const id=Number($('song-block-id').value);songEd.blocks.delete(id);songBlockList();songMessage('Block '+id+' removed from the editor.');}));
  $('install').addEventListener('click',async()=>{
    if(busy||finishingUpdate||SMK37Boot.blocked||!connected||migration||same||!$('backup').checked)return;
    const force=$('force-update').checked;
    const confirmedModel=updater.mode==='loader'?pkg.model:undefined;
    if(confirmedModel&&!confirm(FM1I18n.t('The loader name does not identify the hardware model. Check the device label and connect only the target device. Confirm that the hardware model is:')+' SMK-37 '+(confirmedModel==='pro'?'Pro':'Elite')+'?'))return;
    if(pkg.kind==='stock'){
      if(!confirm(FM1I18n.t('Restore factory V16? Open projects, voices and samples may be overwritten. Confirm you have backups. Target:')+' '+pkg.product+'\n\n'+FM1I18n.t('Restoring V16 also overwrites the last 40 KB of Classic Tabby song storage (block sectors 70 to 79 of the 80). Export your songs first in Projects & sounds > Song mode.')))return;
    }else if(force&&!confirm(FM1I18n.t('Force flash this device? Current identity: ')+updater.identity+'\n\n'+FM1I18n.t('Warning: incompatibility may cause data loss or prevent startup and require a recovery tool. Continue only if the target is an SMK37 OPEN and you accept these risks.')))return;
    busy=true;writing=true;enable();FM1I18n.text($('error'),'');
    let completed=false;
    try{await updater.install({force,confirmedModel});completed=true;}
    catch(error){FM1I18n.text($('error'),error.message);showLoaderHint(error);status('Update incomplete. Keep this page, check the device connection and retry',0);showConnectionDetails(updater.diagnostics);}
    finally{busy=false;writing=false;connected=false;finishingUpdate=completed;if(completed)$('device-identity').textContent=pkg.product;enable();}
    if(completed){
      if(pkg.kind==='stock'){
        updateResult='stock';finishingUpdate=false;status('Factory firmware and resources restored; resource read-back passed. Power-cycle the device before use.',100);enable();return;
      }
      await checkDeviceSamples(true);
    }
  });
  let firmwareTask;
  function loadFirmware(){
    if(firmwareTask)return firmwareTask;
    firmwareTask=(async()=>{
    try {
      if(!window.isSecureContext||!crypto.subtle)throw Error('Open this page over HTTPS or localhost');
      $('sample-bank-note').hidden=FM1_SIMULATOR.sample_bank!=='synthesized-demo';
      if(!FM1_PACKAGE){
        FM1I18n.text($('update-intro'),'The built-in firmware is missing, so this page cannot update SMK37 OPEN. Download the complete official workbench again.');
        FM1I18n.text($('profile'),'Browser play & edit');$('firmware-version').textContent=FM1_SIMULATOR.display_version||FM1_SIMULATOR.release_version||'—';$('base-version').textContent=FM1_SIMULATOR.release_version||'—';FM1I18n.text($('version'),FM1_SIMULATOR.sha256.slice(0,16));FM1I18n.text($('size'),'No device firmware included');
        status('Built-in firmware is unavailable. Download the complete official workbench again.');
        $('backup').disabled=true;enable();return;
      }
      FM1I18n.text($('error'),'');status('Loading firmware…');
      pkg=openPkg=await FM1Web.prepare(FM1_PACKAGE);
      packageDetails();
      if(!navigator.requestMIDIAccess)throw Error('This browser does not support Web MIDI. Use desktop Chrome or Edge');
      status('Firmware verified. Waiting for device connection');enable();
    }catch(error){firmwareTask=undefined;FM1I18n.text($('error'),error.message);status('Firmware could not be loaded. Reopen Device Update to retry.');}
    finally{enable();}
    })();return firmwareTask;
  }
  document.addEventListener('fm1-view-change',()=>{if(!$('tab-update').hidden)loadFirmware();});
  if(!FM1_PACKAGE||FM1_PACKAGE.data)loadFirmware();
  else {status('Firmware loads when Device Update is opened.');enable();}
})();
