#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
//
// tools/linux/anglicize-workbench.mjs: turn an upstream workbench into the English-only one
//
// Purpose
//   Classic Tabby's workbench is English only (SPEC 17.7, Task 14, 2026-11-10). Upstream (M-VAVE's
//   SMK37 OPEN) writes its page text in Chinese and supplies English through a translation table in
//   sdk/I18n.js. When upstream workbench files are merged in (BUILD.md 30.5), they arrive in that
//   form again. This script converts them the way Task 14 did:
//     * every text node and title / aria-label / placeholder / alt / value attribute of
//       sdk/Update.html.in that is a key of the table is replaced by its English value;
//     * every string literal of sdk/Update.html.in's scripts, sdk/Simulator.js, sdk/WebUpdate.js and
//       sdk/Samples.js that is a key of the table is replaced by its English value;
//     * what it cannot convert (strings built from pieces, template literals, text that has no table
//       entry) is listed in <table dir>/anglicize-left.json for hand translation.
//   Afterwards: replace the upstream sdk/I18n.js by Classic Tabby's pass-through version (git show
//   <head>:sdk/I18n.js), remove the language selector again, run tests/workbench/help-banned.mjs (its
//   CJK check lists what is left), re-pin the changed files with tools/linux/pin-sdk-files.py.
//
// Usage
//   node tools/linux/anglicize-workbench.mjs <upstream I18n.js> [--dry-run]
//   (run it in the repository root, on files that have the upstream's Chinese text)
//
// Version: 1.0
//
// Revision log
//   v1.0  2026-11-10  Task 14: first version (the converter that produced the English-only workbench).
import {readFileSync,writeFileSync} from 'node:fs';
const TABLE=process.argv[2],DRY=process.argv.includes('--dry-run');
if(!TABLE){console.error('usage: anglicize-workbench.mjs <upstream I18n.js> [--dry-run]');process.exit(2)}
const g={};new Function('globalThis','document','localStorage','location',readFileSync(TABLE,'utf-8'))(g,undefined,undefined,{search:''});
const M=g.FM1I18n.messages;
const cjk=/[㐀-鿿　-〿＀-￯]/;
const unesc=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ');
const escT=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escA=s=>escT(s).replace(/"/g,'&quot;');
const left=[]; let n=0;
function litFix(src,file){
  return src.replace(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g,(all,a,b,c)=>{
    const q=all[0],body=a??b??c;
    if(!cjk.test(body))return all;
    if(q==='`'&&body.includes('${')){left.push([file,'template',body]);return all}
    let val;try{val=new Function('return '+all)()}catch(e){left.push([file,'unparsable',body]);return all}
    if(!Object.hasOwn(M,val)){left.push([file,'literal',body]);return all}
    const en=M[val];n++;
    let o=en.replace(/\\/g,'\\\\').replace(/\n/g,'\\n');
    if(q==="'")o=o.replace(/'/g,"\\'");else if(q==='"')o=o.replace(/"/g,'\\"');else o=o.replace(/`/g,'\\`').replace(/\$\{/g,'\\${');
    return q+o+q;
  });
}
function htmlFix(src,file){
  return src.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)|(<style[\s\S]*?<\/style>)|(<!--[\s\S]*?-->)|(<[^>]*>)|([^<]+)/g,(all,s1,sbody,s3,style,comment,tag,text)=>{
    if(s1!==undefined)return s1+litFix(sbody,file+' script')+s3;
    if(style||comment)return all;
    if(tag){
      return tag.replace(/\b(aria-label|title|placeholder|alt|value|data-label|label)="([^"]*)"/g,(w,name,v)=>{
        if(!cjk.test(v))return w;const k=unesc(v);
        if(!Object.hasOwn(M,k)){left.push([file,'attr '+name,v]);return w}
        n++;return name+'="'+escA(M[k])+'"';});
    }
    if(!cjk.test(text))return all;
    const lead=text.match(/^\s*/)[0],trail=text.match(/\s*$/)[0],mid=text.slice(lead.length,text.length-trail.length);
    const k=unesc(mid);
    if(!Object.hasOwn(M,k)){left.push([file,'text',mid]);return all}
    n++;return lead+escT(M[k])+trail;
  });
}
for(const f of ['sdk/Simulator.js','sdk/WebUpdate.js','sdk/Samples.js']){const r=litFix(readFileSync(f,'utf-8'),f);if(!DRY)writeFileSync(f,r)}
{const r=htmlFix(readFileSync('sdk/Update.html.in','utf-8'),'sdk/Update.html.in');if(!DRY)writeFileSync('sdk/Update.html.in',r)}
console.log('replaced',n,'left',left.length);
if(!DRY)writeFileSync(TABLE.replace(/[^/]*$/,'')+'anglicize-left.json',JSON.stringify(left,null,1));
