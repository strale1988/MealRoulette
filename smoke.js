#!/usr/bin/env node
/* tools/smoke.js: quick safety net for the Craft recipes. No dependencies.
   Run from the project folder:   node tools/smoke.js
   It loads craft/craft-lib.js and the craft-*.js recipe files the way the browser does, then calculates every tool with every choice of its
   first control, with the extras (Geek foody) off and fully on, and fails if any result has an undefined or NaN in it, an empty ingredient list,
   or throws. It does not replace tools/check.js (the catalog validator); run both after a change. */
const fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,"..");
global.window={};global.localStorage={getItem:()=>null,setItem(){}};global.document={};
const load=f=>(0,eval)(fs.readFileSync(path.join(root,f),"utf8"));
["craft/craft-lib.js","craft/craft-doughs.js","craft/craft-mains.js","craft/craft-light.js","craft/craft-pantry.js","craft/craft-sweet.js","craft/craft-meat.js","craft/craft-extras.js"].forEach(load);
const TOOLS=window.CRAFTLIB.TOOLS;
const defaults=T=>{const o={};T.ctl.forEach(c=>{o[c.k]=c.def});return o};
let runs=0,fails=0;
const fail=(id,tag,why)=>{fails++;console.log("FAIL",id,tag,why)};
const check=(id,s,tag)=>{
 try{const r=TOOLS[id].calc(s);runs++;
  if(!r||!Array.isArray(r.ing)||!r.ing.length)return fail(id,tag,"no ingredients");
  if(!Array.isArray(r.steps)||!r.steps.length)return fail(id,tag,"no steps");
  const text=JSON.stringify([r.title,r.meta,r.note,r.ing,r.steps]);
  const bad=text.match(/.{0,25}(undefined|NaN|\[object).{0,25}/);if(bad)fail(id,tag,bad[0]);
 }catch(e){fail(id,tag,e.message)}};
for(const id of Object.keys(TOOLS)){
 const T=TOOLS[id],main=T.ctl.find(c=>c.k===(T.main||"t"))||T.ctl.find(c=>c.tg);
 for(const extras of [false,true]){
  for(const opt of main.tg){
   const s=defaults(T);s[main.k]=opt[0];
   if(extras)T.ctl.forEach(c=>{if(c.k===main.k)return;if(c.ms)s[c.k]=c.ms.map(x=>x[0]);else if(c.tg&&(c.g||c.x))s[c.k]=c.tg[c.tg.length-1][0]});
   check(id,s,main.k+"="+opt[0]+(extras?" +extras":""));
  }}}
console.log(runs+" recipes calculated, "+fails+" problem"+(fails===1?"":"s"));
process.exit(fails?1:0);
