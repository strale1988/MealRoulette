/* js/craft/craft-brine.js — Brine and salt lab: exact salt for plain wet brines, meat and fish brines (wet or dry), a brine fixer and a
   salt converter. Vegetable work (pickles, kraut, kimchi, hot sauce, preserved lemons) lives only in the Fermentation station, so it is not repeated here (grams to spoons for each kind of salt). Self-contained: it fills <div id="tab-brine"> and keeps its own state in
   localStorage ("mr-brine"). All the maths is in window.BRINE (pure functions, also used by tools/smoke.js).
   Load order: after craft/craft-ferment.js, before engine.js. To add a meat or fish preset, add an entry to MEATS. */
(function(){
"use strict";

/* ---------- the maths (pure) ----------
   Brine strength is written the way most brine recipes write it: salt as a percentage of the WATER weight (3.5% = 35 g salt in 1 kg water).
   `ofTotal` is the same brine as a share of the finished liquid, because some recipes quote it that way. */
const r1=x=>Math.round(x*10)/10;
const wet=(waterG,pct)=>{const salt=waterG*pct/100;return{salt,total:waterG+salt,ofTotal:salt/(waterG+salt)*100}};
const dry=(foodG,pct)=>({salt:foodG*pct/100});
/* a brine of `brineG` grams at `curPct` that should be `tgtPct`: how much salt or water to add */
const fix=(brineG,curPct,tgtPct)=>{
  const water=brineG/(1+curPct/100),salt=brineG-water;
  if(Math.abs(tgtPct-curPct)<.05)return{add:"none",g:0,water,salt,total:brineG};
  if(tgtPct>curPct){const g=water*tgtPct/100-salt;return{add:"salt",g,water,salt,total:brineG+g}}
  const w2=salt/(tgtPct/100),g=w2-water;return{add:"water",g,water,salt,total:brineG+g};
};
/* grams of salt in one level teaspoon. Grain size changes this a lot, so these are rounded, typical values: weigh when it matters. */
const SALTS=[
  {id:"table",n:"Table salt (fine)",tsp:6},
  {id:"sea",n:"Fine sea salt",tsp:5.5},
  {id:"morton",n:"Morton kosher",tsp:4.8},
  {id:"diamond",n:"Diamond Crystal kosher",tsp:2.8},
  {id:"flaky",n:"Flaky sea salt",tsp:2}
];
const spoons=(g,id)=>{const s=SALTS.find(x=>x.id===id)||SALTS[0],t=g/s.tsp;return{tsp:t,tbsp:t/3}};
const frac=x=>{ // quarter-spoon rounding with unicode fractions
  const q=Math.round(x*4)/4,w=Math.floor(q),f=q-w,F={0:"",.25:"¼",.5:"½",.75:"¾"}[f];
  return (w?w:"")+(F||"")||"¼";
};
const MEATS=[
  {id:"chicken",n:"Chicken pieces",wet:5,wt:"1 to 2 hours",dry:1,dt:"12 to 24 hours"},
  {id:"whole-chicken",n:"Whole chicken",wet:5,wt:"8 to 12 hours",dry:1,dt:"24 hours"},
  {id:"turkey",n:"Turkey",wet:5,wt:"12 to 24 hours",dry:1,dt:"2 to 3 days (turkey up to 5 kg)"},
  {id:"pork-chops",n:"Pork chops",wet:5,wt:"30 minutes to 2 hours",dry:1,dt:"1 to 24 hours"},
  {id:"pork-roast",n:"Pork roast",wet:5,wt:"8 to 12 hours",dry:1,dt:"12 to 24 hours"},
  {id:"steak",n:"Steak and beef roast",wet:0,wt:"",dry:.8,dt:"1 to 24 hours"},
  {id:"shrimp",n:"Shrimp",wet:3,wt:"15 to 30 minutes",dry:0,dt:""},
  {id:"fish",n:"Fish fillets",wet:5,wt:"15 to 30 minutes",dry:0,dt:""}
];
window.BRINE={wet,dry,fix,spoons,SALTS,MEATS};

const root=document.getElementById("tab-brine");
if(!root)return;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const I=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
const KEY="mr-brine";
const D={mode:"wet",water:1000,pct:3.5,meat:"chicken",how:"wet",mg:1500,cur:5,curG:1000,tgt:3,salt:"table",sg:20};
let ST=Object.assign({},D);
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s&&typeof s==="object")Object.keys(D).forEach(k=>{if(typeof s[k]===typeof D[k])ST[k]=s[k]})}catch(e){}
if(!["wet","meat","fix","conv"].includes(ST.mode))ST.mode="wet"; // an older saved "Salt for veg" mode moved to the Fermentation station
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const step=v=>v<500?50:v<2000?250:v<10000?500:1000;
const G=g=>g>=1000?(g/1000).toFixed(g%100?2:1).replace(/\.?0+$/,"")+" kg":Math.round(g)+" g";
const S=g=>g<10?r1(g)+" g":Math.round(g)+" g"; // salt: one decimal for small amounts
const spoonLine=g=>{const sp=spoons(g,ST.salt),tsp=sp.tsp;
  if(tsp<.2)return"a pinch";
  return tsp>=3?frac(sp.tbsp)+" tbsp":frac(tsp)+" tsp"};
const MODES=[["wet","Brine from water"],["meat","Meat and fish"],["fix","Fix a brine"],["conv","Salt to spoons"]];
const WPRE=[[2,"Light"],[3.5,"Everyday"],[5,"Meat brine"],[10,"Strong keeping"]];

const stepper=(id,val,label,txt)=>`<div class="step" style="margin-top:10px"><button data-a="m${id}" aria-label="Less ${label}">${I("minus")}</button><b>${txt}</b><button data-a="p${id}" aria-label="More ${label}">${I("plus")}</button></div>`;
const slider=(id,val,min,max,stp,txt)=>`<div class="sl"><input type="range" data-s="${id}" min="${min}" max="${max}" step="${stp}" value="${val}" aria-label="Salt percentage" style="--p:${(val-min)/(max-min)*100}%"><p class="sum" style="margin:2px 0 0"><b data-sv="${id}">${txt}</b></p></div>`;
const saltTg=()=>`<div class="lab" style="margin-top:16px">${I("jar")}Which salt do you have?</div><div class="tg">${SALTS.map(s=>`<button data-a="salt" data-id="${s.id}" aria-pressed="${ST.salt===s.id}">${esc(s.n)}</button>`).join("")}</div><p class="sum" style="margin:8px 0 0">Spoon amounts change a lot with the grain, so weigh the salt when you can. Amounts here are for level spoons.</p>`;
const presets=(arr,cur,act)=>`<div class="tg">${arr.map(p=>`<button data-a="${act}" data-id="${p[0]}" aria-pressed="${Math.abs(cur-p[0])<.01}">${esc(p[1])} · ${p[0]}%</button>`).join("")}</div>`;

function controls(){
  const mm=MODES.map(m=>`<button data-a="mode" data-id="${m[0]}" aria-pressed="${ST.mode===m[0]}">${esc(m[1])}</button>`).join("");
  let c="";
  if(ST.mode==="wet"){
    c=`<div class="lab" style="margin-top:16px">${I("ruler")}How much water?</div>${stepper("w",ST.water,"water",G(ST.water))}
    <div class="lab" style="margin-top:16px">${I("flame")}How salty?</div>${presets(WPRE,ST.pct,"wp")}${slider("pct",ST.pct,1,12,.5,ST.pct+"% of the water weight")}${saltTg()}`;
  }else if(ST.mode==="meat"){
    const m=MEATS.find(x=>x.id===ST.meat)||MEATS[0],canW=m.wet>0,canD=m.dry>0,how=ST.how==="dry"&&canD?"dry":canW?"wet":"dry";
    c=`<div class="lab" style="margin-top:16px">${I("chef")}What are you brining?</div><div class="tg">${MEATS.map(x=>`<button data-a="meat" data-id="${x.id}" aria-pressed="${ST.meat===x.id}">${esc(x.n)}</button>`).join("")}</div>
    <div class="lab" style="margin-top:16px">${I("flame")}Method</div><div class="tg"><button data-a="how" data-id="wet" aria-pressed="${how==="wet"}"${canW?"":" disabled"}>Wet brine</button><button data-a="how" data-id="dry" aria-pressed="${how==="dry"}"${canD?"":" disabled"}>Dry brine (salt only)</button></div>
    <div class="lab" style="margin-top:16px">${I("ruler")}Weight of the ${esc(m.n.toLowerCase())}</div>${stepper("g",ST.mg,"meat",G(ST.mg))}${saltTg()}`;
  }else if(ST.mode==="fix"){
    c=`<div class="lab" style="margin-top:16px">${I("jar")}The brine you have now</div>${stepper("cg",ST.curG,"brine",G(ST.curG))}${slider("cur",ST.cur,1,15,.5,ST.cur+"% (salt as a share of the water weight)")}
    <div class="lab" style="margin-top:16px">${I("flame")}The strength you want</div>${slider("tgt",ST.tgt,1,15,.5,ST.tgt+"%")}${saltTg()}`;
  }else{
    c=`<div class="lab" style="margin-top:16px">${I("ruler")}How much salt?</div>${stepper("s",ST.sg,"salt",S(ST.sg))}`;
  }
  return `<section class="panel"><div class="lab">${I("jar")}What do you need?</div><div class="tg fm">${mm}</div>${c}</section>`;
}

const call=t=>`<div class="call" style="background:var(--soft)">${I("flame")}<span>${esc(t)}</span></div>`;
const row=(a,b,big)=>`<li${big?' class="big"':""}><span>${esc(a)}</span><span class="q">${esc(b)}</span></li>`;
const card=(title,body)=>`<article class="card"><div class="hero"><div class="ic" style="font-size:28px;line-height:1">🧂</div><h2>${esc(title)}</h2></div><div class="body">${body}</div></article>`;
const SAFE=[
 ["Weigh the salt","Spoons are only a guide: a teaspoon of flaky salt can hold less than half the salt of a teaspoon of table salt. A kitchen scale makes every brine repeatable."],
 ["Keep meat brines cold","Brine meat and fish in the fridge, in a covered container, and never reuse the liquid. Pat the food dry afterwards; brined meat needs less salt in the pan."],
 ["Vegetables live in the Fermentation station","Pickles, kraut, kimchi, hot sauce and preserved lemons have their salt and timing worked out for each vegetable there, so they are not repeated here. This lab sets the salt, not the safety of canned or shelf-stable food: those need tested recipes."],
 ["Iodine and anti-caking agents","Ordinary iodised table salt is fine for most cooking, but can cloud a brine. Plain salt with no additives gives the clearest result."]
];
function results(){
  let t="",b="";
  if(ST.mode==="wet"){
    const r=wet(ST.water,ST.pct);t=ST.pct+"% brine";
    b=`<div class="meta"><span>${I("flame")}${S(r.salt)} salt</span><span>${I("jar")}About ${G(r.total)} of brine</span></div>
    <ul class="ing">${row("Water",G(ST.water))}${row("Salt",S(r.salt)+" ("+spoonLine(r.salt)+")",true)}</ul>
    <p class="desc">That is ${r1(r.ofTotal)}% salt in the finished liquid. Stir until the salt dissolves, warming a little water first if it is slow.</p>`+
    (ST.pct>=8?call("This is a strong brine. It suits curing and keeping things like olives, not eating straight from the jar."):ST.pct<=2?call("A light brine is for a short soak in the fridge, not for keeping food."):"");
  }else if(ST.mode==="meat"){
    const m=MEATS.find(x=>x.id===ST.meat)||MEATS[0],how=ST.how==="dry"&&m.dry>0?"dry":m.wet>0?"wet":"dry";
    if(how==="wet"){
      const water=ST.mg*(m.id==="whole-chicken"||m.id==="turkey"||m.id==="pork-roast"?1.5:1.2),r=wet(water,m.wet);
      t=m.n+": wet brine";
      b=`<div class="meta"><span>${I("flame")}${S(r.salt)} salt</span><span>${I("clock")}${esc(m.wt)}</span></div>
      <ul class="ing">${row(m.n,G(ST.mg))}${row("Cold water",G(water)+" (enough to cover)")}${row("Salt",S(r.salt)+" ("+spoonLine(r.salt)+")",true)}</ul>
      <p class="desc">A ${m.wet}% brine (${m.wet*10} g salt per litre of water). Dissolve the salt, chill the brine, then submerge the food and keep it in the fridge. Rinse briefly, pat dry and cook. Do not add more salt until you have tasted it.</p>`;
    }else{
      const r=dry(ST.mg,m.dry);t=m.n+": dry brine";
      b=`<div class="meta"><span>${I("flame")}${S(r.salt)} salt</span><span>${I("clock")}${esc(m.dt)}</span></div>
      <ul class="ing">${row(m.n,G(ST.mg))}${row("Salt",S(r.salt)+" ("+spoonLine(r.salt)+")",true)}</ul>
      <p class="desc">That is ${m.dry}% of the meat weight. Pat the meat dry, salt all sides evenly, and rest it uncovered on a rack in the fridge so the surface dries and browns better. No rinsing needed.</p>`;
    }
    b+=call("Times are starting points. Thicker cuts and larger birds take the long end. Wet brines can make food too salty if left too long.");
  }else if(ST.mode==="fix"){
    const r=fix(ST.curG,ST.cur,ST.tgt);t="Fix a brine";
    if(r.add==="none")b=`<p class="desc">The brine is already at ${ST.tgt}%. Nothing to add.</p>`;
    else if(r.add==="salt")b=`<div class="meta"><span>${I("flame")}Add ${S(r.g)} salt</span><span>${I("jar")}Makes about ${G(r.total)}</span></div><ul class="ing">${row("Brine you have",G(ST.curG)+" at "+ST.cur+"%")}${row("Add salt",S(r.g)+" ("+spoonLine(r.g)+")",true)}${row("Result",G(r.total)+" at "+ST.tgt+"%")}</ul><p class="desc">Dissolve the extra salt into a little warm water first if it will not stir in.</p>`;
    else b=`<div class="meta"><span>${I("jar")}Add ${G(r.g)} water</span><span>${I("jar")}Makes about ${G(r.total)}</span></div><ul class="ing">${row("Brine you have",G(ST.curG)+" at "+ST.cur+"%")}${row("Add water",G(r.g),true)}${row("Result",G(r.total)+" at "+ST.tgt+"%")}</ul><p class="desc">Use water that is not hot, and keep it clean: tap water is fine.</p>`;
    b+=`<p class="sum">Strength here means salt as a share of the water weight, the way most brine recipes write it.</p>`;
  }else{
    t=S(ST.sg)+" of salt in spoons";
    b=`<ul class="ing">${SALTS.map(s=>{const sp=spoons(ST.sg,s.id),tsp=sp.tsp;return row(s.n,(tsp<.2?"a pinch":tsp>=3?frac(sp.tbsp)+" tbsp ("+frac(tsp)+" tsp)":frac(tsp)+" tsp"),false)}).join("")}</ul>
    <p class="desc">Level spoons. Fine grains pack more salt into a spoon, so the same weight takes up different room. Always follow the weight in a recipe over the spoon amount.</p>`;
  }
  const safe=`<h3 style="margin-top:22px">${I("check")}Good to know</h3>${SAFE.map(s=>`<details><summary>${esc(s[0])}</summary><p class="desc" style="margin:0 0 12px">${esc(s[1])}</p></details>`).join("")}`;
  return card(t,b+safe);
}

function paint(){
  root.innerHTML=`<h1 class="hl">Brine and salt lab</h1><p>Exact salt for plain brines and for meat and fish. Vegetable pickles and ferments are in the Fermentation station.</p><div class="cols"><aside class="side" id="brside">${controls()}</aside><section class="res"><div id="brout">${results()}</div></section></div>`;
}
const out=()=>{const o=root.querySelector("#brout");if(!o)return;o.innerHTML=results();const c=o.firstElementChild;if(c)c.style.animation="none"}; // no fade-in while a slider is being dragged
const upd=(k,v)=>{ST[k]=v;save()};
const SPEC={w:["water",100,20000],g:["mg",100,20000],cg:["curG",100,20000],s:["sg",1,500]};
root.addEventListener("click",e=>{
  const b=e.target.closest("[data-a]");if(!b||!root.contains(b))return;
  const a=b.dataset.a,id=b.dataset.id;
  if(a==="mode"){upd("mode",id)}
  else if(a==="wp"){upd("pct",+id)}
  else if(a==="salt"){upd("salt",id)}
  else if(a==="meat"){upd("meat",id);const m=MEATS.find(x=>x.id===id);if(m){if(ST.how==="wet"&&!m.wet)upd("how","dry");else if(ST.how==="dry"&&!m.dry)upd("how","wet")}}
  else if(a==="how"){upd("how",id)}
  else if(/^[mp](w|g|cg|s)$/.test(a)){
    const sp=SPEC[a.slice(1)],sg=a[0]==="p"?1:-1,v=ST[sp[0]],st=a.slice(1)==="s"?(v<20?1:v<100?5:25):step(v);
    upd(sp[0],clamp(Math.round((v+sg*st)/st)*st,sp[1],sp[2]));
  }else return;
  paint();
});
root.addEventListener("input",e=>{
  const el=e.target;if(!el.matches||!el.matches("input[data-s]"))return;
  const k=el.dataset.s,v=+el.value,min=+el.min,max=+el.max;
  upd(k,v);el.style.setProperty("--p",(v-min)/(max-min)*100+"%");
  const lab=root.querySelector(`[data-sv="${k}"]`);
  if(lab)lab.textContent=k==="pct"?v+"% of the water weight":k==="cur"?v+"% (salt as a share of the water weight)":v+"%";
  out();
});
paint();
})();
