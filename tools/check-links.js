#!/usr/bin/env node
/* tools/check-links.js: run from the project root (or pass the root as an argument):  node tools/check-links.js
   Catches the mistakes that only show up on a phone:
   1. every file the loader (index.html FILES) asks for exists, and the service worker (sw.js) precaches it
   2. every file the service worker lists exists
   3. every "Make it" link in xlink.js points at a real Craft tool option or a real Fermentation method and item
   4. the name patterns and catalog ids in xlink.js only use link keys that exist
   Exit code 1 when anything is wrong, so it can run before every upload. */
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.resolve(process.argv[2]||process.cwd());
const rd=f=>fs.readFileSync(path.join(root,f),"utf8"),has=f=>fs.existsSync(path.join(root,f));
const errs=[],warns=[];
const E=m=>errs.push(m),W=m=>warns.push(m);

/* ---- 1 and 2: file lists ---- */
const list=(src,re)=>{const m=re.exec(src);if(!m)return null;return[...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1])};
let FILES=null,SW=null;
try{FILES=list(rd("index.html"),/var FILES=\[([^\]]*)\]/)}catch(e){E("index.html: cannot read ("+e.message+")")}
try{SW=list(rd("sw.js"),/F=\[([^\]]*)\]/)}catch(e){E("sw.js: cannot read ("+e.message+")")}
if(FILES===null&&!errs.length)E("index.html: could not find the FILES list");
if(SW===null&&!errs.length)E("sw.js: could not find the file list");
if(FILES&&SW){
 for(const f of FILES){if(!has(f))E("index.html loads '"+f+"' but the file does not exist");if(!SW.includes(f))E("sw.js does not precache '"+f+"' (offline would break)")}
 for(const f of SW){if(f==="./")continue;if(!has(f))W("sw.js lists '"+f+"' but the file does not exist (the install skips a missing file, so this is harmless but untidy)")}
 const dup=FILES.filter((f,i)=>FILES.indexOf(f)!==i);dup.forEach(f=>E("index.html lists '"+f+"' twice"));
 const v=/const V="([^"]+)"/.exec(rd("sw.js"));if(!v)W("sw.js: no cache version found");
}

/* ---- 3 and 4: links ---- */
const fake=()=>{const w={KITCHEN:{CRAFTS:[]},addEventListener(){},localStorage:{getItem(){return null},setItem(){}}};
 const doc={addEventListener(){},createElement(){return{}},head:{appendChild(){}},getElementById(){return null},querySelector(){return null}};
 return vm.createContext({window:w,document:doc,localStorage:w.localStorage,console,setTimeout,clearTimeout,Math,JSON,Date,Object,Array,String,Number,RegExp,Set,Map,Promise,parseInt,parseFloat,isNaN,isFinite})};
const run=(ctx,f)=>vm.runInContext(rd(f),ctx,{filename:f});
let X=null,TOOLS=null;
try{
 const ctx=fake();ctx.window.window=ctx.window;run(ctx,"xlink.js");X=ctx.window.XLINK;
 const c2=fake();c2.window.window=c2.window;
 run(c2,"craft/craft-lib.js");
 for(const f of fs.readdirSync(path.join(root,"craft")).filter(n=>/^craft-.*\.js$/.test(n)&&!/craft-(lib|ferment|pizza)\.js$/.test(n)).sort()){try{run(c2,"craft/"+f)}catch(e){E("craft/"+f+": does not load ("+e.message+")")}}
 TOOLS=c2.window.CRAFTLIB.TOOLS;
}catch(e){E("cannot load xlink.js or the Craft tools: "+e.message)}

if(X&&TOOLS){
 const fer=has("craft/craft-ferment.js")?rd("craft/craft-ferment.js"):"";
 const methods={};fer.split(/^(?=\{id:"\w+",n:")/m).forEach(b=>{const m=/^\{id:"(\w+)",n:"/.exec(b);if(m)methods[m[1]]=new Set([...b.matchAll(/\bid:"(\w+)"/g)].map(x=>x[1]))});
 for(const [key,t] of Object.entries(X.targets)){
  const at="xlink.js link '"+key+"'";
  if(t.k==="craft"){
   const tool=TOOLS[t.id];if(!tool){E(at+": there is no Craft tool '"+t.id+"'");continue}
   for(const [k,v] of Object.entries(t.s)){
    const c=(tool.ctl||[]).find(x=>x.k===k);
    if(!c){E(at+": tool '"+t.id+"' has no control '"+k+"'");continue}
    if(c.tg){if(!c.tg.some(o=>String(o[0])===String(v)))E(at+": control '"+k+"' of '"+t.id+"' has no option '"+v+"' (options: "+c.tg.map(o=>o[0]).join(", ")+")")}
    else if(c.step){if(!(+v>=c.step[0]&&+v<=c.step[1]))E(at+": value "+v+" is outside the range of '"+k+"'")}
    else E(at+": control '"+k+"' of '"+t.id+"' is neither a choice nor a number")}
  }else if(t.k==="ferm"){
   if(!fer){E(at+": craft/craft-ferment.js not found");continue}
   const ids=methods[t.m];if(!ids){E(at+": no Fermentation method '"+t.m+"'");continue}
   for(const it of t.items||[])if(!ids.has(it))E(at+": method '"+t.m+"' has no item '"+it+"'")
  }else E(at+": unknown kind '"+t.k+"'")}
 /* the patterns and ids in xlink.js must name links that exist: read them back out of the source */
 const src=rd("xlink.js"),used=new Set();
 const byid=/const BYID=\{([\s\S]*?)\};/.exec(src);if(byid)for(const m of byid[1].matchAll(/"[^"]+":"(\w+)"/g))used.add(m[1]);
 const rules=/const RULES=\[([\s\S]*?)\n\];/.exec(src);if(rules)for(const m of rules[1].matchAll(/,"(\w+)"(?:,\/|\])/g))used.add(m[1]);
 const sec=/const SEC=\[(.*?)\];/.exec(src);if(sec)for(const m of sec[1].matchAll(/,"(\w+)"\]/g))used.add(m[1]);
 for(const k of used)if(!X.targets[k])E("xlink.js: a pattern or id points at the link '"+k+"', which is not defined in T");
 for(const k of Object.keys(X.targets))if(!used.has(k))W("xlink.js: link '"+k+"' is defined but no pattern or id uses it");
 /* catalog ids named in BYID should exist in ingredients.js (loose check: the id appears as a quoted word) */
 if(has("ingredients.js")&&byid){const ing=rd("ingredients.js");for(const m of byid[1].matchAll(/"([a-z0-9-]+)":"/g))if(!ing.includes('"'+m[1]+'"'))W("xlink.js BYID: '"+m[1]+"' was not found in ingredients.js")}
}

/* ---- report ---- */
for(const w of warns)console.log("warning: "+w);
for(const e of errs)console.log("ERROR:   "+e);
console.log(errs.length?"\n"+errs.length+" problem"+(errs.length>1?"s":"")+" found.":"\nAll good: files, offline list and links agree."+(warns.length?" ("+warns.length+" warning"+(warns.length>1?"s":"")+")":""));
process.exit(errs.length?1:0);
