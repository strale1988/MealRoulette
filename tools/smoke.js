#!/usr/bin/env node
/* tools/smoke.js: quick safety net for the Craft recipes. No dependencies.
   Run from the project folder:   node tools/smoke.js
   It loads js/craft/craft-lib.js and the craft-*.js recipe files the way the browser does, then calculates every tool with every choice of its
   first control, with the extras (Geek foody) off and fully on, and fails if any result has an undefined or NaN in it, an empty ingredient list,
   or throws. It does not replace tools/check.js (the catalog validator); run both after a change. */
const fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,"..");
global.window={};global.localStorage={getItem:()=>null,setItem(){}};
const noop=()=>null;global.document={querySelector:noop,querySelectorAll:()=>[],getElementById:noop,addEventListener(){},createElement:()=>({style:{},classList:{add(){},remove(){}},setAttribute(){},addEventListener(){}})};
const load=f=>(0,eval)(fs.readFileSync(path.join(root,f),"utf8"));
["js/craft/craft-lib.js","js/craft/craft-doughs.js","js/craft/craft-mains.js","js/craft/craft-light.js","js/craft/craft-pantry.js","js/craft/craft-sweet.js","js/craft/craft-meat.js","js/craft/craft-extras.js","js/craft/craft-world.js"].forEach(load);
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
// Brine and salt lab: the pure maths in window.BRINE
load("js/craft/craft-brine.js");
{const B=window.BRINE,near=(a,b)=>Math.abs(a-b)<.01,t=(n,ok)=>{runs++;if(!ok)fail("brine",n,"wrong result")};
 t("3.5% of 1 kg water is 35 g",near(B.wet(1000,3.5).salt,35));
 t("1% dry brine on 1 kg of meat is 10 g",near(B.dry(1000,1).salt,10));
 t("the brine lab has no vegetable mode",!/\["dry","Salt for veg"\]/.test(require("fs").readFileSync(path.join(root,"js/craft/craft-brine.js"),"utf8")));
 const up=B.fix(1000,3,5);t("fix up adds salt",up.add==="salt"&&near((up.salt+up.g)/up.water,.05));
 const dn=B.fix(1000,5,3);t("fix down adds water",dn.add==="water"&&near(dn.salt/(dn.water+dn.g),.03));
 t("same strength adds nothing",B.fix(1000,4,4).add==="none");
 t("35 g table salt is about 6 tsp",near(B.spoons(35,"table").tsp,35/6));
 t("every salt has a spoon weight",B.SALTS.every(x=>x.tsp>0));
 t("meat presets are usable",B.MEATS.every(m=>m.n&&(m.wet>0||m.dry>0)));}
// every choice of every option for the tools where one control hides or shows others (cure, sausage, rub, dairy, cheese)
for(const id of ["cure","sausage","rub","dairy","cheese"]){
 const T=TOOLS[id],main=T.ctl.find(c=>c.k==="t"),others=T.ctl.filter(c=>c!==main&&c.tg);
 const go=(i,cur,tag)=>{if(i===others.length)return check(id,cur,tag);for(const o of others[i].tg)go(i+1,Object.assign({},cur,{[others[i].k]:o[0]}),tag+" "+others[i].k+"="+o[0])};
 for(const m of main.tg)go(0,Object.assign(defaults(T),{t:m[0]}),"t="+m[0]);
}
// where things live: no recipe may sit in two crafts (the Curing cellar keeps the long cures, Snap and sizzle the sausages, Say cheese the cheeses)
{const has=(id,t)=>TOOLS[id].ctl.some(c=>c.k==="t"&&c.tg.some(o=>o[0]===t)),seen={};
 for(const id of Object.keys(TOOLS)){const c=TOOLS[id].ctl.find(c=>c.k==="t");if(!c||!c.tg)continue;
  if(["cure","sausage","rub","dairy","cheese","starter"].includes(id))c.tg.forEach(o=>{const k=o[0];if(["italian","brat","cevapi","snack","bier"].includes(k)&&id==="cure")fail(id,k,"a fresh or smoked sausage is in the Curing cellar");if(["paneer","cottage"].includes(k)&&id==="dairy")fail(id,k,"a cheese is in Cultured club");if(k==="brine"&&id==="rub")fail(id,k,"brines are in the Brine and salt lab")})}
 runs++;void has;void seen}
console.log(runs+" recipes calculated, "+fails+" problem"+(fails===1?"":"s"));
process.exit(fails?1:0);
