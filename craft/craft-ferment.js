/* craft/craft-ferment.js — Fermentation station: pickling and lacto-fermenting calculator, recipe cards and a batch tracker.
   Load order: after craft/craft-pizza.js, before engine.js. Self-contained: it fills <div id="tab-ferm"> and keeps its own
   state in localStorage ("mr-ferm"). Every amount is worked out in grams from the amount of vegetables, so any
   batch size scales. To add a method, add an entry to METHODS (items, aromatics, salt levels, ready times, steps). */
(function(){
"use strict";
const root=document.getElementById("tab-ferm");
if(!root)return;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const I=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
const KEY="mr-ferm";
/* result screen on phones/tablets (same rules as Cook): a spun or shared ferment replaces the controls; the X on the green bar and Back return */
const small=()=>matchMedia("(max-width:959px)").matches;let res=false;
const XB='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function enter(){if(res)return;res=true;root.classList.add("resmode");if(small()){try{history.pushState({mrres:1},"")}catch(e){}}scrollTo({top:0})}
function leave(){if(!res)return;res=false;root.classList.remove("resmode");scrollTo({top:0})}
function back(){if(history.state&&history.state.mrres)history.back();else leave()}
window.__leaveFerm=()=>{if(res){res=false;root.classList.remove("resmode");window.__nav&&__nav.drop()}};
addEventListener("popstate",()=>{if(res)leave()});
{const tb=document.querySelector('#tabs [data-t="craft"]');if(tb)tb.addEventListener("click",()=>{if(res&&small())back()})}

/* ---------- rounding: salt is exact to 0.5 g, everything else to a sensible kitchen step ---------- */
const rg=a=>a<10?Math.round(a*2)/2:a<100?Math.round(a):a<500?Math.round(a/5)*5:Math.round(a/10)*10;
const G=a=>rg(a)+" g";
const SALT=a=>{const v=Math.max(.5,Math.ceil(a*2-1e-9)/2);return (v>=20?Math.round(v):v)+" g"};
const JARS=[.25,.5,.75,1,1.5,2,3,4,5];
const jarTxt=L=>{if(L>5){const n=Math.ceil(L/3);return n+" × 3 L jars"}return (JARS.find(x=>x>=L)||5)+" L jar"};
const list=a=>a.length<2?(a[0]||""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];

const LEVELS=["Light","Classic","Extra salty"];
const LEVELTIP=["Milder and quicker. Only for cool rooms.","The safe all-rounder.","Firmer and slower. For warm rooms and long keeping."];
const TEMPS=[
 {id:"cool",n:"Cool",r:"15–18 °C · 59–64 °F"},
 {id:"mild",n:"Mild",r:"19–22 °C · 66–72 °F"},
 {id:"warm",n:"Warm",r:"23–27 °C · 73–81 °F"}];

/* ---------- the methods ----------
   sal:     three salt levels, as a percentage of the base named in saltOf
   items:   what the batch is mostly made of (the grams are split between the ticked ones)
   arom:    flavourings. r = amount per kg of main vegetables (g, or pcs). veg:true means it counts as vegetable
   ready:   [min,max] days to ready, by room temperature. taste: first tasting day */
const M=[
{id:"brine",n:"Brine pickles",e:"🥒",sub:"Whole or cut veg in salt water",
 desc:"Classic lacto-fermentation: salt water keeps the wrong bugs out while friendly lactic acid bacteria sour the veg. Crunchy, tangy and alive.",
 g:[200,3000,100,800],multi:true,def:["cucumber"],sal:[2.5,3.5,5],saltOf:"water",
 items:[
  {id:"cucumber",n:"Cucumbers",e:"🥒",p:"Trim 2 mm off the blossom end (it carries softening enzymes). Leave small ones whole, spear the big ones."},
  {id:"carrot",n:"Carrots",e:"🥕",p:"Peel if you like and cut into sticks or thick coins."},
  {id:"cauli",n:"Cauliflower",e:"🥦",p:"Break into small florets."},
  {id:"beans",n:"Green beans",e:"🫘",p:"Trim the stem ends and keep them whole."},
  {id:"radish",n:"Radishes",e:"🔴",p:"Trim and halve or quarter."},
  {id:"beet",n:"Beetroot",e:"🟣",p:"Peel and cut into thin wedges (it colours everything pink)."},
  {id:"pepper",n:"Peppers",e:"🫑",p:"Remove seeds and cut into strips."},
  {id:"turnip",n:"Turnips",e:"⚪",p:"Peel and cut into thin wedges."},
  {id:"gtomato",n:"Green tomatoes",e:"🍅",p:"Halve or quarter; prick whole small ones."},
  {id:"garlic",n:"Garlic cloves",e:"🧄",p:"Peel and leave whole. They may turn blue-green, which is harmless."}],
 arom:[
  {id:"dill",n:"Fresh dill",e:"🌿",r:20,on:1},{id:"garlic",n:"Garlic cloves",e:"🧄",r:20,on:1},
  {id:"pepper",n:"Black peppercorns",e:"⚫",r:4,on:1},{id:"bay",n:"Bay leaves",e:"🍃",r:2,u:"pcs",on:1},
  {id:"tannin",n:"Grape, oak or cherry leaf",e:"🍂",r:2,u:"pcs",note:"keeps cucumbers crunchy (or use a black tea bag)"},
  {id:"mustard",n:"Mustard seeds",e:"🟡",r:5},{id:"coriander",n:"Coriander seeds",e:"🟤",r:4},
  {id:"chili",n:"Chilli flakes",e:"🌶️",r:2},{id:"horseradish",n:"Horseradish root, sliced",e:"🥔",r:15}],
 ready:{cool:[10,21],mild:[5,10],warm:[3,6]},taste:3,
 fridge:"keeps 3 to 6 months in the fridge"},
{id:"kraut",n:"Sauerkraut",e:"🥬",sub:"Shredded cabbage, dry salted",
 desc:"Just cabbage and salt. Salting draws out the juice, which becomes its own brine. Add carrot, apple or caraway to taste.",
 g:[500,5000,250,1000],multi:true,def:["green"],sal:[1.5,2,2.5],saltOf:"veg",
 items:[
  {id:"green",n:"Green cabbage",e:"🥬",p:"Remove the tough outer leaves (keep one clean one), quarter, core and shred thinly."},
  {id:"red",n:"Red cabbage",e:"🟣",p:"Remove the outer leaves, quarter, core and shred thinly."}],
 arom:[
  {id:"caraway",n:"Caraway seeds",e:"🟤",r:5,on:1},{id:"carrot",n:"Carrot, grated",e:"🥕",r:150,veg:1,on:1},
  {id:"apple",n:"Apple, grated",e:"🍎",r:150,veg:1},{id:"beet",n:"Beetroot, grated",e:"🟣",r:100,veg:1},
  {id:"onion",n:"Onion, sliced",e:"🧅",r:60,veg:1},{id:"garlic",n:"Garlic, sliced",e:"🧄",r:10,veg:1},
  {id:"juniper",n:"Juniper berries",e:"🫐",r:3},{id:"dill",n:"Fresh dill",e:"🌿",r:10},{id:"fennel",n:"Fennel seeds",e:"🟢",r:3}],
 ready:{cool:[14,35],mild:[7,21],warm:[5,12]},taste:5,
 fridge:"keeps 6 months or more in the fridge"},
{id:"kimchi",n:"Kimchi",e:"🌶️",sub:"Salted veg in a chilli paste",
 desc:"Salt the vegetables first, then coat them in a garlicky chilli paste. Sour, spicy and ready fast.",
 g:[500,3000,250,1000],multi:false,def:["napa"],sal:[4,5,6],saltOf:"veg",
 items:[
  {id:"napa",n:"Napa cabbage",e:"🥬",k:1,t:"2 hours",p:"Cut lengthways into quarters, then across into 4–5 cm pieces."},
  {id:"daikon",n:"Daikon radish (kkakdugi)",e:"⚪",k:.6,t:"30 minutes",p:"Peel and cut into 2 cm cubes."},
  {id:"cucumber",n:"Cucumber (oi sobagi)",e:"🥒",k:.6,t:"30 minutes",p:"Cut into 5 cm lengths, then into quarters."}],
 arom:[
  {id:"gochugaru",n:"Gochugaru (Korean chilli flakes)",e:"🌶️",r:40,on:1},{id:"garlic",n:"Garlic, minced",e:"🧄",r:40,on:1},
  {id:"ginger",n:"Ginger, grated",e:"🫚",r:15,on:1},{id:"fish",n:"Fish sauce",e:"🐟",r:40,on:1,note:"leave out for vegan"},
  {id:"soy",n:"Soy sauce",e:"🫙",r:40,note:"the vegan swap for fish sauce"},{id:"sugar",n:"Sugar",e:"🍬",r:15,on:1},
  {id:"scallion",n:"Spring onions, chopped",e:"🌱",r:80,on:1},{id:"julienne",n:"Daikon, in matchsticks",e:"⚪",r:150,on:1,only:"napa"},
  {id:"carrot",n:"Carrot, in matchsticks",e:"🥕",r:60},{id:"porridge",n:"Glutinous rice flour",e:"🍚",r:10,note:"cooked into a porridge with 100 g water"}],
 ready:{cool:[2,4],mild:[1,3],warm:[1,2]},taste:1,
 fridge:"keeps for months in the fridge and keeps souring slowly"},
{id:"hot",n:"Hot sauce",e:"🔥",sub:"Fermented chilli mash, blended",
 desc:"Chillies, garlic and salt fermented into a deep, tangy mash, then blended. Wear gloves.",
 g:[200,2000,100,500],multi:true,def:["jalapeno"],sal:[2,3,4],saltOf:"veg",
 items:[
  {id:"jalapeno",n:"Red jalapeños",e:"🌶️",p:"Remove the stems. Keep or discard seeds for more or less heat."},
  {id:"fresno",n:"Fresno chillies",e:"🌶️",p:"Remove the stems."},
  {id:"serrano",n:"Serranos",e:"🌶️",p:"Remove the stems."},
  {id:"habanero",n:"Habaneros or scotch bonnets",e:"🔥",p:"Remove the stems. Very hot, so gloves and open a window."},
  {id:"bird",n:"Thai bird's eye chillies",e:"🌶️",p:"Remove the stems."},
  {id:"bell",n:"Red bell pepper (body, mild)",e:"🫑",p:"Remove stem and seeds."}],
 arom:[
  {id:"garlic",n:"Garlic cloves",e:"🧄",r:100,veg:1,on:1},{id:"carrot",n:"Carrot",e:"🥕",r:150,veg:1,on:1},
  {id:"onion",n:"Onion",e:"🧅",r:100,veg:1},{id:"mango",n:"Mango",e:"🥭",r:200,veg:1},
  {id:"pineapple",n:"Pineapple",e:"🍍",r:200,veg:1},{id:"ginger",n:"Ginger",e:"🫚",r:30,veg:1}],
 ready:{cool:[10,21],mild:[7,14],warm:[4,8]},taste:4,
 fridge:"keeps 6 months or more in the fridge"},
{id:"lemons",n:"Preserved lemons",e:"🍋",sub:"Salt-cured citrus",
 desc:"Citrus packed in salt and its own juice until the rind turns soft and mellow. A spoonful transforms stews and dressings.",
 g:[200,2000,100,500],multi:false,def:["lemon"],sal:[15,20,25],saltOf:"veg",
 items:[
  {id:"lemon",n:"Lemons",e:"🍋",p:"Scrub well. Cut each one almost into quarters from the top, leaving the base joined."},
  {id:"lime",n:"Limes",e:"🟢",p:"Scrub well. Cut each one almost into quarters from the top, leaving the base joined."},
  {id:"kumquat",n:"Kumquats",e:"🍊",p:"Scrub well and slit each one lengthways."}],
 arom:[
  {id:"bay",n:"Bay leaves",e:"🍃",r:2,u:"pcs",on:1},{id:"pepper",n:"Black peppercorns",e:"⚫",r:4,on:1},
  {id:"coriander",n:"Coriander seeds",e:"🟤",r:5},{id:"cinnamon",n:"Cinnamon stick",e:"🪵",r:1,u:"pcs"},
  {id:"chili",n:"Dried chilli",e:"🌶️",r:1,u:"pcs"},{id:"cloves",n:"Cloves",e:"🟫",r:1}],
 ready:{cool:[28,42],mild:[21,35],warm:[14,28]},taste:14,
 fridge:"keeps 6 to 12 months in the fridge",noSaltPick:false},
{id:"honey",n:"Honey ferments",e:"🍯",sub:"Garlic or ginger in raw honey",
 desc:"No salt here. Raw honey draws water out of the garlic, which starts a slow, gentle ferment and a runny, savoury honey.",
 g:[100,1000,50,300],multi:false,def:["garlic"],sal:null,saltOf:"none",
 items:[
  {id:"garlic",n:"Garlic",e:"🧄",p:"Peel the cloves, trim the root ends and bruise each lightly with the flat of a knife."},
  {id:"ginger",n:"Ginger",e:"🫚",p:"Scrub (no need to peel) and slice thinly."},
  {id:"chili",n:"Chillies",e:"🌶️",p:"Leave whole with a slit cut in each."},
  {id:"lemon",n:"Lemon slices",e:"🍋",p:"Slice thinly and remove the pips."}],
 arom:[{id:"chili",n:"Chilli flakes",e:"🌶️",r:2},{id:"pepper",n:"Black peppercorns",e:"⚫",r:2},{id:"rosemary",n:"Rosemary sprig",e:"🌿",r:1,u:"pcs"}],
 ready:{cool:[28,42],mild:[14,28],warm:[10,21]},taste:7,
 fridge:"keeps up to a year in the fridge"},
{id:"quick",n:"Quick fridge pickles",e:"🥕",sub:"Vinegar, not fermented",
 desc:"Not a ferment: hot vinegar brine poured over raw veg. Ready the same day, no waiting, no bubbles.",
 g:[200,2000,100,500],multi:true,def:["onion"],sal:[2,3,4],saltOf:"liquid",noTemp:true,quick:true,
 items:[
  {id:"onion",n:"Red onion",e:"🧅",p:"Slice into thin rings."},
  {id:"cucumber",n:"Cucumbers",e:"🥒",p:"Slice into coins or spears."},
  {id:"carrot",n:"Carrots",e:"🥕",p:"Peel and cut into thin sticks or ribbons."},
  {id:"radish",n:"Radishes",e:"🔴",p:"Slice thinly."},
  {id:"cauli",n:"Cauliflower",e:"🥦",p:"Break into small florets."},
  {id:"beans",n:"Green beans",e:"🫘",p:"Trim and keep whole."},
  {id:"jalapeno",n:"Jalapeños",e:"🌶️",p:"Slice into rings."},
  {id:"beet",n:"Beetroot",e:"🟣",p:"Peel and slice thinly."},
  {id:"daikon",n:"Daikon",e:"⚪",p:"Peel and cut into thin sticks."},
  {id:"fennel",n:"Fennel",e:"🌿",p:"Slice thinly."}],
 arom:[
  {id:"dill",n:"Fresh dill",e:"🌿",r:15,on:1},{id:"garlic",n:"Garlic cloves",e:"🧄",r:15,on:1},
  {id:"pepper",n:"Black peppercorns",e:"⚫",r:3,on:1},{id:"mustard",n:"Mustard seeds",e:"🟡",r:5},
  {id:"coriander",n:"Coriander seeds",e:"🟤",r:3},{id:"chili",n:"Chilli flakes",e:"🌶️",r:2},
  {id:"bay",n:"Bay leaves",e:"🍃",r:1,u:"pcs"},{id:"turmeric",n:"Ground turmeric",e:"🟠",r:1}],
 ready:{cool:[1,28],mild:[1,28],warm:[1,28]},taste:1,
 fridge:"keeps about 4 weeks in the fridge"}
];
const MB=Object.fromEntries(M.map(m=>[m.id,m]));

/* ---------- state ---------- */
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")||{}}catch(e){return {}}};
const ST=Object.assign({m:"brine",items:{},arom:{},g:{},sal:1,temp:"mild",batches:[]},load());
if(!MB[ST.m])ST.m="brine";
if(!Array.isArray(ST.batches))ST.batches=[];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({m:ST.m,items:ST.items,arom:ST.arom,g:ST.g,sal:ST.sal,temp:ST.temp,batches:ST.batches}))}catch(e){}};
const cur=()=>MB[ST.m];
const selItems=m=>{const a=(ST.items[m.id]||m.def).filter(id=>m.items.some(i=>i.id===id));return a};
const selArom=m=>{const base=ST.arom[m.id]||m.arom.filter(a=>a.on).map(a=>a.id);const main=selItems(m);return base.filter(id=>{const a=m.arom.find(x=>x.id===id);return a&&(!a.only||main.includes(a.only))})};
const amount=m=>ST.g[m.id]||m.g[3];

/* ---------- the calculation ---------- */
function calc(m){
 const ids=selItems(m),items=ids.map(id=>m.items.find(i=>i.id===id));
 if(!items.length)return null;
 const g=amount(m),kg=g/1000,lv=Math.min(2,Math.max(0,ST.sal|0)),pct=m.sal?m.sal[lv]:0;
 const tp=m.noTemp?"mild":ST.temp,[rmin,rmax]=m.ready[tp];
 const aroms=selArom(m).map(id=>m.arom.find(a=>a.id===id));
 const A=a=>({a,amt:a.r*kg}); // amounts per kg of main veg
 const aAmt=a=>a.u==="pcs"?Math.max(1,Math.round(a.r*kg)):a.r*kg;
 const aTxt=a=>a.u==="pcs"?aAmt(a)+" pcs":G(aAmt(a));
 const each=g/items.length;
 const ing=items.map(i=>({n:i.n,q:G(each),v:1}));
 let salt=0,water=0,extra=[],mass=g,steps=[],jarF=1.25,saltLine="",flav=aroms.length?list(aroms.map(a=>a.n.toLowerCase())):"";
 const vegAr=aroms.filter(a=>a.veg),spiceAr=aroms.filter(a=>!a.veg);
 const prep=items.map(i=>i.p);
 const preps=[...new Set(prep)].join(" ");
 const room=TEMPS.find(t=>t.id===tp).r;
 const head=items.length>2?"Mixed veg":list(items.map(i=>i.n.toLowerCase().replace(/ \(.*\)/,"")));
 let title="",ready=[rmin,rmax],tl=[];
 const jarT=()=>jarTxt(mass/1000*jarF);

 if(m.id==="brine"){
  water=g*.5;salt=water*pct/100;mass=g+water;
  ing.push({n:"Water",q:G(water)},{n:"Salt (non-iodised)",q:SALT(salt)});
  aroms.forEach(a=>ing.push({n:a.n,q:aTxt(a)}));
  title="Brine pickles: "+head;
  steps=[
   `Wash a clean ${jarT()} and its lid in hot soapy water and rinse well. Wash the vegetables. ${preps}`,
   `Make the brine: stir ${SALT(salt)} salt into ${G(water)} water until it dissolves. That is a ${pct}% brine (${Math.round(pct*10)} g salt per litre of water). Use non-iodised salt, and water that has stood for 30 minutes or been boiled and cooled.`,
   `Put ${flav||"your flavourings"} in the bottom of the jar, then pack the vegetables in tightly, leaving 3 cm of headspace.`,
   `Pour in the brine until everything is covered by at least 1 cm. Push a glass weight, a clean stone or a folded cabbage leaf on top so nothing floats. Anything above the brine can mould.`,
   `Close the lid loosely (or fit an airlock) and stand the jar on a plate in the shade at ${room}. If the lid is tight, open it briefly each day to release gas.`,
   `Taste from day ${m.taste}. When it is tangy enough (usually day ${rmin} to ${rmax}), tighten the lid and move it to the fridge.`];
 }
 else if(m.id==="kraut"){
  const addG=vegAr.reduce((s,a)=>s+aAmt(a),0),base=g+addG;
  salt=base*pct/100;mass=base;jarF=1.3;
  ing.push(...vegAr.map(a=>({n:a.n,q:aTxt(a),v:1})));
  ing.push({n:"Salt (non-iodised)",q:SALT(salt)});
  spiceAr.forEach(a=>ing.push({n:a.n,q:aTxt(a)}));
  title="Sauerkraut: "+head;
  steps=[
   `${preps} Reserve one clean outer leaf. ${vegAr.length?"Grate or slice "+list(vegAr.map(a=>a.n.toLowerCase().replace(/, .*/,"")))+".":""}`,
   `Weigh the lot (${G(base)}) in a big bowl and add ${SALT(salt)} salt. That is ${pct}% of the weight.`,
   `Massage and squeeze for 5 to 10 minutes until the cabbage turns glossy and sits in its own juice. Mix in ${spiceAr.length?list(spiceAr.map(a=>a.n.toLowerCase())):"any flavourings you like"}.`,
   `Pack it into a clean ${jarT()} a handful at a time, pressing hard so the liquid rises above the cabbage. Leave 4 to 5 cm of headspace.`,
   `Lay the reserved leaf on top and weigh everything down under the brine. If the cabbage is not covered after an hour, top up with a 2% brine (20 g salt per litre of water).`,
   `Close the lid loosely and keep at ${room}, on a plate. Press it down once a day for the first few days. Taste from day ${m.taste}, and move it to the fridge when you like it (usually day ${rmin} to ${rmax}).`];
 }
 else if(m.id==="kimchi"){
  const it=items[0],k=it.k||1;
  salt=g*pct/100*k;
  const paste=aroms.filter(a=>a.id!=="porridge"),rice=aroms.find(a=>a.id==="porridge");
  const pasteG=paste.reduce((s,a)=>s+aAmt(a),0)+(rice?100:0);
  mass=g+pasteG;jarF=1.4;
  ing.length=0;ing.push({n:it.n.replace(/ \(.*\)/,""),q:G(g),v:1},{n:"Coarse salt (for salting)",q:SALT(salt)});
  aroms.forEach(a=>ing.push({n:a.n,q:a.id==="porridge"?G(aAmt(a))+" + 100 g water":aTxt(a)}));
  title="Kimchi: "+it.n.replace(/ \(.*\)/,"").toLowerCase();
  steps=[
   `${it.p}`,
   `Toss with ${SALT(salt)} coarse salt and leave for ${it.t}${it.id==="napa"?", turning every 30 minutes, until it bends without snapping":""}.`,
   `Rinse 2 to 3 times in cold water, then drain for 20 minutes and squeeze gently.`,
   ...(rice?[`Stir ${G(aAmt(rice))} glutinous rice flour into 100 g water and cook until thick, 2 to 3 minutes. Let it cool completely.`]:[]),
   `Mix the paste: ${list(paste.map(a=>a.n.toLowerCase()))}${rice?", plus the cooled porridge":""}. Wear gloves for the next bit.`,
   `Work the paste into the vegetables, then pack into a clean ${jarT()}, pressing down so the juices rise. Leave 3 cm of headspace.`,
   `Close the lid loosely and leave at ${room} for ${rmin} to ${rmax} day${rmax>1?"s":""}, pressing it down once a day, until it smells pleasantly sour and bubbles. Then fridge it. It is best after 1 to 2 weeks.`];
 }
 else if(m.id==="hot"){
  const addG=vegAr.reduce((s,a)=>s+aAmt(a),0),base=g+addG;
  salt=base*pct/100;mass=base;jarF=1.35;
  ing.push(...vegAr.map(a=>({n:a.n,q:aTxt(a),v:1})));
  ing.push({n:"Salt (non-iodised)",q:SALT(salt)});
  title="Fermented hot sauce: "+head;
  steps=[
   `Wear gloves. ${preps} Roughly chop everything${vegAr.length?", including "+list(vegAr.map(a=>a.n.toLowerCase())):""}, or pulse it in a food processor into a coarse mash.`,
   `Weigh the mash (${G(base)}) and mix in ${SALT(salt)} salt. That is ${pct}% of the weight.`,
   `Pack it into a clean ${jarT()} and press down hard; liquid will rise. If the mash is not covered, top up with a brine of ${SALT(6)} salt in 200 g water.`,
   `Weigh it down so it stays under the liquid, close the lid loosely and keep at ${room}. Press or stir it daily with a clean spoon.`,
   `It is ready when sour, fizzy and smells good (day ${rmin} to ${rmax}). Blend smooth with a splash of the brine. For a thinner, longer-keeping sauce, add vinegar: about ${G(base*.15)} (15% of the mash).`,
   `Strain if you like, bottle it and keep it in the fridge.`];
 }
 else if(m.id==="lemons"){
  const juice=g*.25;salt=g*pct/100;mass=g+salt+juice;jarF=1.1;
  ing.push({n:"Coarse salt",q:SALT(salt)},{n:"Fresh lemon juice, to top up",q:G(juice)});
  aroms.forEach(a=>ing.push({n:a.n,q:aTxt(a)}));
  title="Preserved "+items[0].n.toLowerCase();
  steps=[
   `${items[0].p}`,
   `Pack salt into the cuts, using about two thirds of the ${SALT(salt)} in total, and over the outside.`,
   `Press them into a clean ${jarT()} so hard that the juice runs. Sprinkle in the rest of the salt${flav?" and tuck in the "+flav:""}.`,
   `Top up with fresh lemon juice (about ${G(juice)}) until everything is submerged.`,
   `Close the lid and keep at ${room}. Turn or shake the jar daily for the first week, then weekly.`,
   `After ${rmin} to ${rmax} days the rind is soft and translucent. To use, rinse, then chop the rind and discard the pulp (or keep it for stews).`];
 }
 else if(m.id==="honey"){
  const honey=g*.75;mass=g+honey;jarF=1;
  ing.push({n:"Raw honey",q:G(honey)});
  aroms.forEach(a=>ing.push({n:a.n,q:aTxt(a)}));
  title="Honey ferment: "+items[0].n.toLowerCase();
  steps=[
   `Run a clean ${jarT()} through hot soapy water and dry it completely. ${items[0].p} Pat everything dry.`,
   `Pack it into the jar about two thirds full${flav?", with the "+flav:""}.`,
   `Pour over about ${G(honey)} raw honey, enough to cover. Poke out air bubbles with a chopstick and top up the honey.`,
   `Close the lid loosely and keep at ${room}. Turn the jar over daily so it all stays coated and open the lid briefly to release gas.`,
   `Bubbles and a thinner, runnier honey mean it is working. Ready from day ${rmin} (taste at day ${m.taste}), best after ${rmax}. Then keep it in the fridge.`];
 }
 else if(m.id==="quick"){
  const liq=g*.6,half=liq/2;salt=liq*pct/100;const sugar=liq*.03;mass=g+liq;jarF=1.2;
  ing.push({n:"Water",q:G(half)},{n:"Vinegar (5%)",q:G(half)},{n:"Salt",q:SALT(salt)},{n:"Sugar",q:G(sugar)});
  aroms.forEach(a=>ing.push({n:a.n,q:aTxt(a)}));
  title="Quick pickles: "+head;
  steps=[
   `${preps} Pack into a clean ${jarT()}${flav?" with the "+flav:""}.`,
   `Heat ${G(half)} water, ${G(half)} vinegar, ${SALT(salt)} salt and ${G(sugar)} sugar in a pan until it all dissolves. It does not need to boil.`,
   `Pour the hot brine over the vegetables until covered and press them under.`,
   `Cool, uncovered, for 30 minutes, then close the lid and refrigerate.`,
   `Eat after 2 hours; they are best after a day and ${m.fridge.replace("keeps ","keep ")}. Not a ferment, so there are no live cultures.`];
 }

 /* expected timeline */
 if(m.quick){
  tl=[["Hour 0","Pour on the brine, cool and chill."],["2 hours","Edible, still crisp and sharp."],["Day 1","At its best. Flavours have settled."],["Week 4","Eat up. After this, smell and check before eating."]];
 }else{
  const day2=m.id==="kimchi"?["Day 1","Bubbles and a sour smell start already. Press it down."]:["Day 1 to 2","Quiet. Brine may turn cloudy, which is normal."];
  tl=[day2];
  if(m.id!=="kimchi")tl.push(["Day 2 to 4","Bubbles and a sour smell. This is the ferment taking off."]);
  tl.push(["Day "+m.taste,"First taste. Use a clean fork."]);
  tl.push(["Day "+rmin+" to "+rmax,"Ready. Move it to the fridge when it tastes right."]);
  tl.push(["After","In the fridge it "+m.fridge.replace("keeps ","keeps ")+"."]);
  if(m.id==="kimchi")tl.splice(2,0,["Day 1 to "+rmax,"Leave at room temperature until it smells sour, then fridge it."]);
 }

 const note=[];
 if(!m.quick&&m.sal&&ST.temp==="warm"&&lv===0)note.push("A warm room and light salt ferment very fast and can go soft. Choose Classic or Extra salty, or ferment in a cooler spot.");
 if(!m.quick&&ST.temp==="warm"&&lv>0)note.push("In a warm room, check daily and move it to the fridge as soon as it tastes right.");
 if(!m.quick&&ST.temp==="cool")note.push("In a cool room fermentation is slower. Be patient and keep tasting.");
 return {m,title,ing,steps,tl,note,ready:[rmin,rmax],taste:m.taste,jar:jarT(),salt:salt?SALT(salt):"",pct,mass,g,saltBase:m.saltOf};
}

/* ---------- rendering ---------- */
const SAFETY=[
 ["Looks and smells: what is normal",
  "Cloudy brine, bubbles, a sour smell, a little sediment, and white flecks from dill or spices are all normal. A flat, white, wrinkly film on top is kahm yeast: harmless. Skim it off and keep the veg submerged."],
 ["When to throw it away",
  "Fuzzy, raised or coloured mould (blue, green, black, pink or orange) on the surface or on anything not submerged. A rotten, putrid or rancid smell (a ferment should smell sour and fresh). Slime that spreads through the whole jar. When in doubt, throw it out."],
 ["Soft or mushy?",
  "Usually too warm, too little salt, or the blossom end of cucumbers was left on. Next time: more salt, a cooler spot, tannin leaves, and trim the blossom ends."],
 ["Keep everything under the brine",
  "Veg above the liquid is what goes mouldy. Use a weight and top up with brine (a 3.5% brine: 35 g salt per litre of water). A glass jar, non-iodised salt and clean utensils matter more than anything else."],
 ["Is it acidic enough?",
  "A properly salted ferment drops below pH 4.6 within a few days and below 4 when ready, which is what makes it safe. pH strips cost little if you want to check."]];

const fmtDate=d=>new Date(d).toLocaleDateString(undefined,{day:"numeric",month:"short"});
const todayStr=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const dayNo=s=>{const a=new Date(s+"T00:00:00"),b=new Date(todayStr()+"T00:00:00");return Math.round((b-a)/864e5)+1};
const isReady=b=>!b.quick&&dayNo(b.start)>=b.min;
function status(b){
 const d=dayNo(b.start),m=MB[b.m]||{};
 if(b.quick)return d<=28?`Day ${d} · In the fridge, ready to eat.`:`Day ${d} · Over 4 weeks old. Smell and check it before eating.`;
 if(d<b.taste)return `Day ${d} · Fermenting. Keep it under the brine.`;
 if(d<b.min)return `Day ${d} · Time for a first taste.`;
 if(d<=b.max)return `Day ${d} · Ready. Move it to the fridge when it tastes right.`;
 return `Day ${d} · Past the usual window. Taste it, then fridge it.`;
}

function build(){
 const m=cur(),r=calc(m);
 const mm=M.map(x=>`<button data-a="m" data-id="${x.id}" aria-pressed="${x.id===m.id}"><span>${x.e}</span>${esc(x.n)}</button>`).join("");
 const sel=selItems(m);
 const its=m.items.map(i=>`<button data-a="i" data-id="${i.id}" aria-pressed="${sel.includes(i.id)}"><span>${i.e}</span>${esc(i.n)}</button>`).join("");
 const sa=selArom(m);
 const ar=m.arom.filter(a=>!a.only||sel.includes(a.only)).map(a=>`<button data-a="a" data-id="${a.id}" aria-pressed="${sa.includes(a.id)}" ${a.note?`title="${esc(a.note)}"`:""}><span>${a.e}</span>${esc(a.n)}</button>`).join("");
 const g=amount(m);
 const sal=m.sal?`<div class="lab" style="margin-top:16px">${I("flame")}Saltiness</div><div class="tg">${LEVELS.map((l,i)=>`<button data-a="s" data-id="${i}" aria-pressed="${ST.sal===i}">${l}</button>`).join("")}</div><p class="sum" style="margin:10px 0 0">${m.sal[ST.sal]}% ${m.saltOf==="water"?"brine, by weight of water":m.saltOf==="liquid"?"of the pickling liquid":m.id==="kimchi"?"of the veg weight, for the salting step":m.id==="lemons"?"of the fruit weight":"of the total weight"}. ${LEVELTIP[ST.sal]}</p>`:"";
 const tmp=m.noTemp?"":`<div class="lab" style="margin-top:16px">${I("clock")}Room temperature</div><div class="tg">${TEMPS.map(t=>`<button data-a="t" data-id="${t.id}" aria-pressed="${ST.temp===t.id}">${t.n}</button>`).join("")}</div><p class="sum" style="margin:10px 0 0">${TEMPS.find(t=>t.id===ST.temp).r}. Warmer means faster.</p>`;
 const pcs=m.id==="lemons"?` · about ${Math.max(1,Math.round(g/110))} fruit`:"";
 const side=`
 <p class="hint2" style="margin:0 0 8px">Every amount, including the salt, is worked out for you in grams.</p>
 <section class="panel">
  <div class="lab">${I("jar")}What are you making?</div>
  <div class="tg fm">${mm}</div>
  <p class="sum" style="margin:10px 0 0">${esc(m.desc)}</p>
  <div class="lab" style="margin-top:16px">${I("leaf")}${m.multi?"What is going in? <small style='font-weight:400'>(pick one or more)</small>":"What is going in?"}</div>
  <div class="tg fm">${its}</div>
  <div class="lab" style="margin-top:16px">${I("ruler")}How much ${m.id==="honey"?"to ferment":m.id==="lemons"?"fruit":"vegetables"}</div>
  <div class="step"><button data-a="gm" aria-label="Less ${m.id==="honey"?"honey":m.id==="lemons"?"fruit":"vegetables"}">${I("minus")}</button><b id="fmg">${g} g</b><button data-a="gp" aria-label="More ${m.id==="honey"?"honey":m.id==="lemons"?"fruit":"vegetables"}">${I("plus")}</button></div>
  <p class="sum" style="margin:8px 0 0">${(g/1000).toFixed(g%100?2:1)} kg${pcs}${r?` · makes about ${r.jar}`:""}</p>
  ${sal}${tmp}
  <div class="lab" style="margin-top:16px">${I("wand")}Flavour</div>
  <div class="tg fm">${ar}</div>
 </section>
 <button class="fmspin" data-a="rand">Spin a ferment!</button>`;

 let out;
 if(!r)out=`<div class="ph"><b>Your ferment shows up here</b>Tick at least one ingredient, or spin a ferment.</div>`;
 else{
  const dRange=m.quick?"2 hours to 1 day":r.ready[0]===r.ready[1]?r.ready[0]+" days":r.ready[0]+" to "+r.ready[1]+" days";
  out=`<article class="card"><div class="hero"><div class="ic" style="font-size:28px;line-height:1">${m.e}</div><h2>${esc(r.title)}</h2></div><div class="body">
  <div class="meta"><span>${I("clock")}Ready in ${dRange}</span><span>${I("jar")}${r.jar}</span>${r.salt?`<span>${I("flame")}${r.salt} salt${r.pct&&m.saltOf==="water"?` · ${r.pct}% brine`:""}</span>`:""}${m.quick?`<span>${I("fridge")}Fridge only</span>`:""}</div>
  <p class="desc">${esc(m.desc)}</p>
  ${r.note.map(n=>`<div class="call" style="background:var(--soft)">${I("flame")}<span>${esc(n)}</span></div>`).join("")}
  <div class="split"><div><h3>${I("list")}Ingredients <small style="text-transform:none;letter-spacing:0;color:var(--mute)">(tap to tick off)</small></h3>
  <ul class="ing">${r.ing.map(i=>`<li><span>${esc(i.n)}${window.XLINK?XLINK.btn(i.n,null,{ferm:m.id}):""}</span><span class="q">${esc(i.q)}</span></li>`).join("")}</ul></div>
  <div><h3>${I("chef")}Method</h3><ol>${r.steps.map(s=>`<li><span>${esc(s)}</span></li>`).join("")}</ol></div></div>
  <h3 style="margin-top:22px">${I("clock")}What to expect</h3>
  <ol class="fmtl">${r.tl.map(t=>`<li><b>${esc(t[0])}</b><span>${esc(t[1])}</span></li>`).join("")}</ol>
  ${m.quick?"":`<h3 style="margin-top:22px">${I("check")}Keep it safe</h3>${SAFETY.map(s=>`<details><summary>${esc(s[0])}</summary><p class="desc" style="margin:0 0 12px">${esc(s[1])}</p></details>`).join("")}`}
  <div class="row"><button data-a="start">${I("cal")}Start this batch today</button><button data-a="copy">${I("cart")}Copy list</button><button data-a="share">${I("share")}Share</button><button data-a="rand">Spin again</button></div></div></article>`;
 }
 const bt=ST.batches.length?ST.batches.map((b,i)=>`<li class="${isReady(b)?"rdy":""}"><div><b>${esc(b.title)}</b>${isReady(b)?' <span class="rdytag">Ready</span>':""}<small>Started ${fmtDate(b.start+"T00:00:00")} · ${esc(status(b))}</small></div><button data-a="rm" data-id="${i}" aria-label="Remove ${esc(b.title)}">${I("x")}</button></li>`).join(""):`<li class="none">Nothing on the go. Start a batch and its tasting days show up here.</li>`;
 let fmbox=document.getElementById("fmbatches");
 if(!fmbox){const g=document.querySelector("#kz-saved .kgrid");if(g){fmbox=document.createElement("section");fmbox.className="panel fmb";fmbox.id="fmbatches";g.appendChild(fmbox);
  fmbox.addEventListener("click",e=>{const b=e.target.closest('button[data-a="rm"]');if(!b)return;ST.batches.splice(+b.dataset.id,1);save();build()})}}
 if(fmbox)fmbox.innerHTML=`<div class="lab">${I("jar")}My ferments</div><ul>${bt}</ul>`;
 root.innerHTML=`<h1 class="hl">What are we fermenting?</h1><p>Pick something to make, or spin for an idea.</p><div class="cols"><aside class="side">${side}</aside><section class="res"><div id="fmout">${out}</div></section></div>`;
 root.querySelectorAll(".ing li").forEach(li=>li.onclick=()=>li.classList.toggle("done"));
 root._r=r;
 {const row=root.querySelector("#fmout .card .row");if(row&&r&&window.__tidyRow){window.__thumbs(row,r.title,{m:m.id},()=>{const a=row.querySelector("[data-a=rand]");if(a)a.click()});window.__tidyRow(row,"ferm")}}
 {const h=root.querySelector("#fmout .hero");if(h){const b=document.createElement("button");b.type="button";b.className="heroback";b.setAttribute("aria-label","Back");b.title="Back";b.innerHTML=XB;b.onclick=back;h.append(b)}}
 const nb=ST.batches.filter(isReady).length,tb=document.querySelector('#tabs [data-t="kit"]');
 if(tb){tb.classList.toggle("dot",nb>0);tb.title=nb?nb+" ferment"+(nb>1?"s":"")+" ready to taste":""}
}


/* ---------- the spinner: veg tumbling in a brine jar, then a random ferment ---------- */
const DEFE=["🥒","🥕","🧄","🌶️","🥬","🍋"];
let busy=false;
function pickRandom(){
 let rt={};try{rt=JSON.parse(localStorage.getItem("mr-rate")||"null")||{}}catch(e){}
 const wt=x=>{let k=1;for(const t in rt){const e=rt[t];if(e&&e.m===x.id)k*=e.v>0?1.6:.5}return k}; // thumbs steer which kind of ferment comes up
 let tot=0;const ws=M.map(x=>{const w=wt(x);tot+=w;return w});let pick=Math.random()*tot,mm=M[M.length-1];for(let i=0;i<M.length;i++){pick-=ws[i];if(pick<=0){mm=M[i];break}}
ST.m=mm.id;
 ST.items[mm.id]=mm.multi?shuf(mm.items.map(i=>i.id)).slice(0,1+Math.floor(Math.random()*2)):[rnd(mm.items).id];
 const base=mm.arom.filter(x=>!x.only||ST.items[mm.id].includes(x.only));
 ST.arom[mm.id]=shuf(base.map(x=>x.id)).slice(0,2+Math.floor(Math.random()*3));
 if(mm.id==="kimchi"&&ST.items[mm.id][0]==="napa")ST.arom[mm.id]=[...new Set([...ST.arom[mm.id],"gochugaru","garlic"])];
 ST.sal=1;ST.temp=rnd(["cool","mild","mild","warm"]);
}
function jarHTML(em){
 const f=em.map((e,k)=>`<div class="ing" style="--k:${k};--r:${Math.round(k*360/em.length)}deg;--R:30px"><u><i>${(window.__ico&&window.__ico(e))||e}</i></u></div>`).join("");
 const bub=[0,1,2,3,4,5].map(k=>`<span class="fb" style="--k:${k};left:${96+((k*37)%48)}px"></span>`).join("");
 return `<div class="fmreel" aria-hidden="true"><div class="fmjar"><svg viewBox="0 0 240 190"><circle cx="120" cy="95" r="84" fill="#f6efe0" style="stroke:var(--ink)" stroke-width="3"/><circle cx="120" cy="95" r="76" fill="none" stroke="#d63a22" stroke-opacity=".4" stroke-width="3"/></svg><div class="fmin"><svg viewBox="0 0 240 190"><rect x="88" y="14" width="64" height="20" rx="6" fill="#c98a3a" style="stroke:var(--ink)" stroke-width="3"/><path d="M92 34h56v8q22 6 22 26v94q0 12-12 12H82q-12 0-12-12V68q0-20 22-26z" fill="#e9f5d0" fill-opacity=".75" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M74 78h92v84q0 8-8 8H82q-8 0-8-8z" fill="#9fd36b" fill-opacity=".55"/><path d="M82 52q-6 8-6 24" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="4" stroke-linecap="round"/></svg><div class="fring">${f}</div>${bub}</div></div><div class="rtx"><span class="fmrt"></span><small>Brewing an idea…</small></div></div>`;
}
function spin(btn){
 if(busy)return;
 enter();
 const out=root.querySelector("#fmout"),rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
 const finish=()=>{pickRandom();save();busy=false;build();const c=root.querySelector(".card");if(c)c.scrollIntoView({behavior:"smooth",block:"start"})};
 if(rm||!out||(window.mrNoSpin&&mrNoSpin()))return finish();
 busy=true;
 const m=cur(),mine=[...selItems(m).map(id=>m.items.find(i=>i.id===id).e),...selArom(m).map(id=>m.arom.find(a=>a.id===id).e)];
 const em=[...new Set(mine)].slice(0,6);DEFE.forEach(e=>{if(em.length<6&&!em.includes(e))em.push(e)});
 out.innerHTML=jarHTML(em);
 const rt=out.querySelector(".fmrt"),names=M.map(x=>x.e+" "+x.n);
 out.scrollIntoView({behavior:"smooth",block:"center"});
 window.mrSpinNames?window.mrSpinNames(rt,names,finish):finish();
}

/* ---------- events ---------- */
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
root.addEventListener("click",e=>{
 const b=e.target.closest("button[data-a]");if(!b)return;
 const a=b.dataset.a,id=b.dataset.id,m=cur();
 if(a==="m"){ST.m=id;}
 else if(a==="i"){
  const cs=selItems(m);
  ST.items[m.id]=m.multi?(cs.includes(id)?cs.filter(x=>x!==id):[...cs,id]):[id];
  if(ST.arom[m.id])ST.arom[m.id]=selArom(m);
 }
 else if(a==="a"){const c=selArom(m);ST.arom[m.id]=c.includes(id)?c.filter(x=>x!==id):[...c,id]}
 else if(a==="s")ST.sal=+id;
 else if(a==="t")ST.temp=id;
 else if(a==="gm"||a==="gp"){const [lo,hi,st]=m.g;ST.g[m.id]=Math.min(hi,Math.max(lo,amount(m)+(a==="gp"?st:-st)))}
 else if(a==="rand"){spin(b);return}
 else if(a==="start"){
  const r=root._r;if(!r)return;
  ST.batches.unshift({title:r.title,m:r.m.id,start:todayStr(),min:r.ready[0],max:r.ready[1],taste:r.taste,quick:!!r.m.quick});
  ST.batches=ST.batches.slice(0,20);
 }
 else if(a==="share"){
  const r=root._r,m=cur();if(!r||!window.__shareOut)return;
  window.__shareOut("f",{m:m.id,items:selItems(m),arom:selArom(m),g:amount(m),sal:ST.sal,temp:ST.temp},r.title,r.title+" · ready in about "+(r.ready[0]===r.ready[1]?r.ready[0]:r.ready[0]+" to "+r.ready[1])+" days",b,()=>r.title+"\n"+r.ing.map(i=>"• "+i.n+" – "+i.q).join("\n"));
  return;
 }
 else if(a==="rm"){ST.batches.splice(+id,1)}
 else if(a==="copy"){
  const r=root._r;if(!r)return;
  const txt=r.title+"\n"+r.ing.map(i=>"• "+i.n+" – "+i.q).join("\n");
  (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>{b.innerHTML=I("check")+"Copied"},()=>{});
  return;
 }
 save();
 const top=window.scrollY;
 build();
 if(a==="start"){const sb=root.querySelector('[data-a="start"]');if(sb)sb.innerHTML=I("check")+"Added to My kitchen"}
 if(a==="rand"||a==="m"){const c=root.querySelector(".card");if(c&&a==="rand")c.scrollIntoView({behavior:"smooth",block:"start"});else scrollTo({top:top})}
 else scrollTo({top:top});
});

build();
function applyShare(d){ // a shared setup: validate every id against the real method, then show it
 const m=d&&MB[d.m];if(!m)return false;
 const its=Array.isArray(d.items)?d.items.filter(id=>m.items.some(i=>i.id===id)):[],ar=Array.isArray(d.arom)?d.arom.filter(id=>m.arom.some(a=>a.id===id)):[];
 if(!its.length)return false;
 ST.m=m.id;ST.items[m.id]=m.multi?its:its.slice(0,1);ST.arom[m.id]=ar;
 const g=Number(d.g);if(Number.isFinite(g)&&g>0)ST.g[m.id]=Math.min(Math.max(g,m.g[0]),m.g[1]);
 ST.sal=Math.min(2,Math.max(0,Number(d.sal)|0));ST.temp=["cool","mild","warm"].includes(d.temp)?d.temp:"mild";
 enter();save();build();return true;
}
const snap=()=>{const m=cur();return{m:m.id,items:selItems(m),arom:selArom(m),g:amount(m),sal:ST.sal,temp:ST.temp}}; // the setup as it is now, for "Back to ..." links
const have=(ids,w)=>ST.batches.some(b=>[].concat(ids).includes(b.m)&&isReady(b)&&(!w||new RegExp(w,"i").test(b.title))); // is a batch of this method ready in My kitchen? (w: a word the batch title must contain, e.g. "onion")
window.FERMENT={rebuild:build,methods:M,applyShare,snap,have};
})();
