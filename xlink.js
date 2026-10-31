/* xlink.js: "make it yourself" links on ingredient lines. A line such as "burger buns" gets a small pill that opens the matching Craft tool
   (Rise and shine, Soft rolls); "pickles" opens the Fermentation station with quick pickles preset; kimchi, kraut, hot sauce and the
   homemade sauces link the same way. Every ingredient list asks for its pill through XLINK.btn(name, id, ctx); a line with no match gets "".
   Load order: after craft.js and ferment.js (the targets are only called on a tap), before engine.js. To add a link: add a target to T,
   then a name pattern (and/or a catalog id from ingredients.js) to RULES. The renderers that call it: craft.js, ferment.js, index.html (Cook card). */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* where each link goes. craft: a Craft tool id plus its settings (the same keys as the tool's own controls). ferm: a Fermentation station method plus the items to tick. */
const T={
 bun:{l:"Make buns",k:"craft",id:"bread",s:{t:"rolls"}},
 loaf:{l:"Make bread",k:"craft",id:"bread",s:{t:"lean"}},
 pickle:{l:"Quick pickle",k:"ferm",m:"quick",items:["cucumber"]},
 pickleOnion:{l:"Quick pickle",k:"ferm",m:"quick",items:["onion"]},
 pickleJal:{l:"Quick pickle",k:"ferm",m:"quick",items:["jalapeno"]},
 pickleBeet:{l:"Quick pickle",k:"ferm",m:"quick",items:["beet"]},
 pickleDaikon:{l:"Quick pickle",k:"ferm",m:"quick",items:["daikon"]},
 pickleCarrot:{l:"Quick pickle",k:"ferm",m:"quick",items:["carrot"]},
 kimchi:{l:"Make kimchi",k:"ferm",m:"kimchi",items:["napa"]},
 kraut:{l:"Make kraut",k:"ferm",m:"kraut",items:["green"]},
 hot:{l:"Make hot sauce",k:"ferm",m:"hot",items:["jalapeno"]},
 mayo:{l:"Make mayo",k:"craft",id:"sauce",s:{t:"mayo"}},
 pesto:{l:"Make pesto",k:"craft",id:"sauce",s:{t:"pesto"}},
 guac:{l:"Make guacamole",k:"craft",id:"sauce",s:{t:"guac"}},
 bech:{l:"Make béchamel",k:"craft",id:"sauce",s:{t:"bech"}},
 tzatziki:{l:"Make tzatziki",k:"craft",id:"sauce",s:{t:"yog"}},
 tomato:{l:"Make tomato sauce",k:"craft",id:"sauce",s:{t:"tomato"}}
};
/* catalog ids (cookbook recipes carry them) and name patterns (Craft and Ferment cards only have names). The first match wins, so the specific ones come first. */
const BYID={"burger-buns":"bun","bread-rolls":"bun","pickles":"pickle","pickled-red-onions":"pickleOnion","pickled-jalapenos":"pickleJal","pickled-beets":"pickleBeet",
 "kimchi":"kimchi","sauerkraut":"kraut","sriracha":"hot","hot-sauce":"hot","mayonnaise":"mayo","pesto":"pesto","guacamole":"guac","bechamel":"bech","bechamel-sauce":"bech",
 "tzatziki":"tzatziki","tomato-sauce":"tomato","bread":"loaf"};
const RULES=[
 [/\bpickled (red )?onions?\b/,"pickleOnion"],[/\bpickled jalape[nñ]os?\b/,"pickleJal"],[/\bpickled beet(root)?s?\b/,"pickleBeet"],
 [/\bpickled (daikon|radish(es)?)\b/,"pickleDaikon"],[/\bpickled carrots?\b/,"pickleCarrot"],[/\b(dill )?pickles?\b|\bgherkins?\b|\bpickled (cucumbers?|gherkins?)\b/,"pickle"],
 [/\bkimchi\b/,"kimchi"],[/\bsauerkraut\b|\bkraut\b/,"kraut"],
 [/\bhot sauce\b|\bsriracha\b|\btabasco\b|\bchil+i sauce\b/,"hot",/sweet|thai/],
 [/\bmayo(nnaise)?\b/,"mayo"],[/\bpesto\b/,"pesto"],[/\bguacamole\b/,"guac"],[/\bb[eé]chamel\b/,"bech"],[/\btzatziki\b/,"tzatziki"],[/\btomato sauce\b/,"tomato"],
 [/\bbuns?\b|\b(bread|soft|dinner) rolls?\b/,"bun",/noodle|vermicelli|spring|egg roll/],
 [/\bbread\b(?!\s*(flour|crumbs?))/,"loaf",/garlic|flat|naan|pita|corn|brown|no-knead/]
];
const find=(name,id)=>{
 if(id&&BYID[id])return BYID[id];
 const n=String(name||"").toLowerCase();
 for(const r of RULES)if(r[0].test(n)&&!(r[2]&&r[2].test(n)))return r[1];
 return null};

/* a card that is already showing the thing a link would open gets no link (the Soft rolls card does not offer "Make buns") */
const same=(t,ctx)=>{if(!ctx)return false;
 if(t.k==="craft")return ctx.tool===t.id&&Object.keys(t.s).every(k=>ctx.s&&String(ctx.s[k])===String(t.s[k]));
 return ctx.ferm===t.m};

const destName=t=>{
 if(t.k==="ferm")return "Fermentation station";
 const kc=((window.KITCHEN&&window.KITCHEN.CRAFTS)||[]).find(c=>c.id===t.id);return kc?kc.name:"Craft"};

/* the pill for one ingredient line: "" when there is nothing to link to. ctx = {tool, s} on Craft cards, {ferm} on Ferment cards */
const btn=(name,id,ctx)=>{
 const key=find(name,id),t=key&&T[key];if(!t||same(t,ctx))return "";
 const to=destName(t);
 return `<button type="button" class="xl" data-xl="${esc(key)}" title="Opens ${esc(to)}" aria-label="${esc(t.l)}: opens ${esc(to)}">${esc(t.l)}</button>`};

/* open the target: leave any full-screen result first (same calls the Home wheel makes), apply the settings, then switch tab.
   The tab switch is a normal setTab, so the Back button returns to the recipe the person came from. */
const leave=()=>["Cook","Pizza","Ferm","Craft"].forEach(n=>{try{const f=window["__leave"+n];if(f)f()}catch(e){}});
const toCard=tab=>setTimeout(()=>{const c=document.querySelector("#tab-"+tab+" .card");if(c)c.scrollIntoView({block:"start"})},60);
const go=key=>{
 const t=T[key];if(!t||typeof window.setTab!=="function")return;
 try{
  if(t.k==="craft"){
   if(!window.CRAFT||!window.CRAFT.applyShare)return;
   leave();if(!window.CRAFT.applyShare({id:t.id,s:t.s}))return;
   window.setTab(t.id);toCard(t.id)}
  else{
   const F=window.FERMENT,m=F&&F.methods&&F.methods.find(x=>x.id===t.m);if(!m||!F.applyShare)return;
   /* applyShare resets anything it is not given, so hand it the method's own defaults: its usual amount and the aromatics that start ticked */
   const d={m:t.m,items:t.items,arom:(m.arom||[]).filter(a=>a.on).map(a=>a.id),g:m.g&&m.g[3],sal:1,temp:"mild"};
   leave();if(!F.applyShare(d))return;
   window.setTab("ferm");toCard("ferm")}
 }catch(e){console.error(e)}};

/* one listener for every list. It runs first (capture) and stops the tap there, so pressing a pill never ticks the line off. */
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest("button.xl");if(!b)return;
 e.preventDefault();e.stopPropagation();go(b.dataset.xl)},true);

const css=document.createElement("style");
css.textContent=".xl{font:inherit;font-size:11px;font-weight:800;line-height:1.5;color:var(--acct,var(--acc2));background:transparent;border:1.5px solid currentColor;border-radius:999px;padding:0 9px;margin-left:8px;cursor:pointer;white-space:nowrap;vertical-align:middle;-webkit-user-select:none;user-select:none;touch-action:manipulation}.xl:hover{background:var(--soft)}.xl:focus-visible{outline:2px solid var(--ink);outline-offset:2px}";
document.head.appendChild(css);

window.XLINK={btn,find,go,targets:T};
})();
