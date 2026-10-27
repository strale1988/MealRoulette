/* craft.js — calculators for the Craft hub. Load order: after ferment.js, before engine.js.
   Each tool fills <div id="tab-ID"> and keeps its settings in localStorage ("mr-craft").
   To add a tool: add an entry to TOOLS (controls + calc), add <div id="tab-ID" class="tab" role="tabpanel" hidden></div>
   to index.html, and set ready:1, rec:1 for ID in the UI table. Every amount is worked out in grams. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const I=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
const KEY="mr-craft";let ST={};try{ST=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}};
let people=2;try{people=Math.min(10,Math.max(1,+(JSON.parse(localStorage.getItem("mr2")||"{}").n)||2))}catch(e){}
const rg=a=>a<10?Math.round(a*2)/2:a<100?Math.round(a):a<500?Math.round(a/5)*5:Math.round(a/10)*10;
const G=a=>rg(a)+" g",ML=a=>rg(a)+" g",P1=a=>Math.max(.5,Math.round(a*2)/2);
const eggs=gr=>{const n=Math.max(.5,Math.round(gr/50*2)/2);return n+(n===1?" egg":" eggs")+" ("+rg(gr)+" g)"};
const hm=m=>m<60?m+" min":Math.floor(m/60)+" h"+(m%60?" "+m%60+" min":"");

/* burger spinner art: the layers lift off one after another and drop back into a stack (animated in index.html) */
const BURGER_ART=`<div class="bgr"><svg viewBox="0 0 240 190" aria-hidden="true"><ellipse cx="120" cy="180" rx="78" ry="7" fill="rgba(0,0,0,.14)"/>
<g class="bl" style="--k:0"><path d="M44 150h152v6q0 16-16 16H60q-16 0-16-16z" fill="#e8a84d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/></g>
<g class="bl" style="--k:1"><rect x="40" y="128" width="160" height="22" rx="11" fill="#7a3b1d" style="stroke:var(--ink)" stroke-width="3"/><path d="M62 137h14M94 141h12M130 136h14M160 141h12" stroke="#a5552a" stroke-width="3" stroke-linecap="round"/></g>
<g class="bl" style="--k:2"><path d="M46 121h148v7h-44l-10 14-10-14H46z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/></g>
<g class="bl" style="--k:3"><rect x="50" y="109" width="140" height="11" rx="5.5" fill="#d63a22" style="stroke:var(--ink)" stroke-width="3"/></g>
<g class="bl" style="--k:4"><path d="M40 103q9.5 10 19 0t19 0t19 0t19 0t19 0t19 0t19 0t19 0v9H40z" fill="#5fbf6a" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/></g>
<g class="bl" style="--k:5"><path d="M38 101C38 64 72 44 120 44S202 64 202 101z" fill="#e8a84d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><g fill="#fff3cf"><ellipse cx="94" cy="68" rx="5" ry="2.6" transform="rotate(-25 94 68)"/><ellipse cx="122" cy="58" rx="5" ry="2.6" transform="rotate(10 122 58)"/><ellipse cx="148" cy="70" rx="5" ry="2.6" transform="rotate(30 148 70)"/><ellipse cx="108" cy="84" rx="5" ry="2.6" transform="rotate(15 108 84)"/><ellipse cx="136" cy="85" rx="5" ry="2.6" transform="rotate(-20 136 85)"/></g></g></svg></div>`;
window.__burgerArt=BURGER_ART;

/* pasta spinner art: a bowl with a noodle spiral that twirls at the shared spin speed; tomato, basil and cheese orbit it */
const PASTA_ART=`<div class="pgr"><svg viewBox="0 0 240 190" aria-hidden="true"><ellipse cx="120" cy="182" rx="70" ry="6" fill="rgba(0,0,0,.14)"/><circle cx="120" cy="95" r="84" fill="#4a90c2" style="stroke:var(--ink)" stroke-width="3"/><circle cx="120" cy="95" r="76" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><circle cx="120" cy="95" r="70" fill="#f6efe0" style="stroke:var(--ink)" stroke-width="3"/></svg>
<div class="pspin"><svg viewBox="-33 -33 66 66" aria-hidden="true"><path d="M0 0a4 4 0 0 1 8 0a8 8 0 0 1-16 0a12 12 0 0 1 24 0a16 16 0 0 1-32 0a20 20 0 0 1 40 0a24 24 0 0 1-48 0a28 28 0 0 1 56 0" fill="none" style="stroke:var(--ink)" stroke-width="6.2" stroke-linecap="round"/><path d="M0 0a4 4 0 0 1 8 0a8 8 0 0 1-16 0a12 12 0 0 1 24 0a16 16 0 0 1-32 0a20 20 0 0 1 40 0a24 24 0 0 1-48 0a28 28 0 0 1 56 0" fill="none" stroke="#f2c14e" stroke-width="3.4" stroke-linecap="round"/></svg></div>
<svg class="pcap" viewBox="0 0 240 190" aria-hidden="true"><circle cx="120" cy="95" r="14" fill="#d63a22" style="stroke:var(--ink)" stroke-width="3"/><path d="M120 92q-10-12 2-16 8 6-2 16zM120 92q12-10 18 2-8 8-18-2z" fill="#3fae5a" style="stroke:var(--ink)" stroke-width="2" stroke-linejoin="round"/></svg>
<div class="ring"><div class="ing" style="--k:0;--r:0deg;--R:52px"><u><i>🍅</i></u></div><div class="ing" style="--k:1;--r:120deg;--R:52px"><u><i>🌿</i></u></div><div class="ing" style="--k:2;--r:240deg;--R:52px"><u><i>🧀</i></u></div></div></div>`;
window.__pastaArt=PASTA_ART;

/* controls: {k,label,icon,tg:[[value,label]]} or {k,label,icon,step:[min,max,by,unit]}; def = default value */
const TOOLS={
bread:{title:"What are we baking?",sub:"Baker's percentages: pick a bread and your flour, and every amount follows.",
 ctl:[{k:"t",label:"Bread",icon:"bread",def:"lean",tg:[["lean","Everyday loaf"],["sour","Sourdough"],["focaccia","Focaccia"],["rolls","Soft rolls"],["pita","Flatbreads"]]},
      {k:"f",label:"Flour",icon:"ruler",def:500,step:[250,1500,50,"g"]}],
 calc(s){
  const F=s.f,B={
   lean:{n:"Everyday loaf",h:68,y:.7,sl:2,mins:[["Mix and rest",30],["Three folds, 30 min apart",90],["Shape and proof",45],["Bake",30]],
    st:["Mix everything into a shaggy dough and rest 30 minutes, covered.","Fold the dough over itself 3 times, 30 minutes apart (wet your hand so it does not stick).","Leave to rise until about 1½ times bigger, 1–1½ hours.","Shape into a tight loaf and proof 45 minutes. Heat the oven to 230 °C with a tray of water at the bottom.","Slash the top and bake 25–30 minutes until deep golden and hollow when tapped. Cool 30 minutes before slicing."]},
   sour:{n:"Sourdough",h:75,y:0,sl:2,starter:20,
    st:["Mix the flour, water and starter and rest 30 minutes. Then add the salt.","Fold the dough 4 times over 2 hours.","Let it rise at room temperature (about 24 °C) 4–6 hours, until about 50% bigger and jiggly.","Shape into a tight round and chill in a floured bowl 8–14 hours.","Heat a lidded pot in the oven at 245 °C. Bake the loaf 20 minutes with the lid on, then 20–25 minutes with it off, until dark golden. Cool 1 hour."]},
   focaccia:{n:"Focaccia",h:80,y:.8,sl:2,oil:6,
    st:["Stir everything except the topping oil into a very wet dough. Rest 30 minutes.","Fold 2–3 times, 30 minutes apart, then rise 1–2 hours (or overnight in the fridge).","Pour half the topping oil into the tray, tip the dough in and stretch it to the corners. Rest 30 minutes.","Heat the oven to 220 °C. Dimple the dough with oiled fingers, drizzle with the rest of the oil and flaky salt.","Bake 22–25 minutes until golden underneath and on top."]},
   rolls:{n:"Soft rolls",h:56,y:1,sl:1.8,sugar:8,butter:8,egg:10,milk:1,
    st:["Mix the flour, sugar, salt and yeast. Add the warm milk and egg, then knead 8–10 minutes until smooth.","Work in the soft butter and knead 3 minutes more.","Rise about 1 hour until doubled.","Divide into 70 g balls, shape and place them close together on a tray. Proof 40 minutes.","Brush with milk and bake at 190 °C for 15–18 minutes until golden."]},
   pita:{n:"Flatbreads",h:62,y:1,sl:2,oil:3,
    st:["Mix everything and knead 8 minutes until smooth. Rise about 1 hour.","Divide into 90 g balls and roll each into a 3 mm disc.","Heat a dry pan until very hot. Cook 1–2 minutes per side until puffed with brown spots.","Stack and wrap in a cloth so they stay soft."]}}[s.t];
  const st=B.starter?F*B.starter/100:0,fl=F-st/2,wt=F*B.h/100-st/2-(B.milk?0:0),ing=[],sub=B.milk?"warm milk":"water";
  ing.push(["Flour",G(fl)],[B.milk?"Warm milk":"Water (about 25 °C)",G(wt)]);
  if(st)ing.push(["Active sourdough starter (100% hydration)",G(st)]);
  ing.push(["Salt",(Math.round(F*B.sl/100*2)/2)+" g"]);
  if(B.y)ing.push(["Instant yeast",(Math.max(1,Math.round(F*B.y/100*2)/2))+" g"]);
  if(B.sugar)ing.push(["Sugar",G(F*B.sugar/100)]);
  if(B.butter)ing.push(["Soft butter",G(F*B.butter/100)]);
  if(B.egg)ing.push(["Egg",eggs(F*B.egg/100)]);
  if(B.oil)ing.push([s.t==="focaccia"?"Olive oil (dough 6%, plus tray and top)":"Oil",G(s.t==="focaccia"?F*.14:F*B.oil/100)]);
  const tot=F+wt-0+(B.sugar||0)*F/100+(B.butter||0)*F/100+(B.egg||0)*F/100+(B.oil||0)*F/100,
   made=s.t==="rolls"?Math.round(tot/70)+" rolls":s.t==="pita"?Math.round(tot/90)+" flatbreads":s.t==="focaccia"?"one tray about "+(F<=500?"25 × 35":"30 × 40")+" cm":"about "+Math.max(1,Math.round(tot/800*10)/10)+" loaf"+(tot>1200?"s":"");
  return{title:B.n,meta:[["clock",s.t==="sour"?"About 1 day":s.t==="pita"?"About 2 hours":"About 4 hours"],["bread","Dough "+G(tot)],["check","Makes "+made]],
   note:["Hydration "+B.h+"%. Salt "+B.sl+"% of the flour weight."],ing,steps:B.st}}},
grain:{title:"What are we cooking?",sub:"Rice and grains with exactly the right water.",
 ctl:[{k:"t",label:"Grain",icon:"rice",def:"white",tg:[["white","White rice"],["basmati","Basmati"],["brown","Brown rice"],["quinoa","Quinoa"],["couscous","Couscous"],["bulgur","Bulgur"],["barley","Pearl barley"],["polenta","Polenta"],["risotto","Risotto"]]},
      {k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,T={
   white:{n:"White rice",pp:75,w:1.5,m:12,r:10,tip:"Rinse until the water runs nearly clear."},basmati:{n:"Basmati rice",pp:75,w:1.5,m:10,r:5,tip:"Rinse well and soak 20 minutes if you have time."},
   brown:{n:"Brown rice",pp:75,w:2.25,m:40,r:10,tip:"Rinse first. It takes longer because of the bran."},quinoa:{n:"Quinoa",pp:60,w:2,m:15,r:5,tip:"Rinse in a sieve to wash off the bitter coating."},
   couscous:{n:"Couscous",pp:70,w:1,m:0,r:5,tip:"No cooking: pour boiling water over it."},bulgur:{n:"Bulgur (medium)",pp:70,w:1.5,m:12,r:10,tip:"Coarse bulgur needs about 5 minutes more."},
   barley:{n:"Pearl barley",pp:70,w:3,m:30,r:5,tip:"Drain any water left at the end."},polenta:{n:"Polenta (coarse)",pp:70,w:4.5,m:40,r:0,tip:"Stir often. Instant polenta takes only 5 minutes."},
   risotto:{n:"Risotto",pp:75,w:3.3,m:18,r:2,tip:"Keep the stock hot in a second pan."}}[s.t],
  d=T.pp*n,w=d*T.w,salt=Math.max(.5,Math.round(w*(s.t==="risotto"?.004:.007)*2)/2),ing=[];let steps=[];
  if(s.t==="risotto"){
   ing.push(["Risotto rice (arborio or carnaroli)",G(d)],["Hot stock",ML(w)],["Onion, finely chopped",G(40*n)],["Butter",G(15*n)],["White wine (optional)",ML(30*n)],["Parmesan, grated",G(20*n)],["Salt (taste first, stock is salty)","about "+salt+" g"]);
   steps=["Soften the onion in half the butter 5 minutes. Add the rice and stir 2 minutes until the grains look glassy.","Add the wine and stir until it is gone.","Add the hot stock one ladle at a time, stirring, letting each be absorbed before the next. This takes about 18 minutes.","Take off the heat when the rice is creamy but still has a little bite. Stir in the rest of the butter and the parmesan, cover and rest 2 minutes."]}
  else if(s.t==="couscous"){
   ing.push(["Couscous",G(d)],["Boiling water or stock",ML(w)],["Olive oil",ML(5*n)],["Salt",salt+" g"]);
   steps=["Stir the salt and oil into the couscous in a bowl.","Pour over the boiling water, cover tightly and leave 5 minutes.","Fluff with a fork."]}
  else if(s.t==="polenta"){
   ing.push(["Coarse polenta",G(d)],["Water or stock",ML(w)],["Salt",salt+" g"],["Butter (optional)",G(10*n)]);
   steps=["Bring the salted water to a boil. Pour in the polenta in a thin stream while whisking.","Turn the heat to low and cook "+T.m+" minutes, stirring often, until thick and no longer gritty.","Stir in the butter and serve soft, or pour into a tin to set and slice."]}
  else{
   ing.push([T.n+" (dry)",G(d)],["Water",ML(w)],["Salt",salt+" g"]);
   steps=[T.tip,"Put the grain, water and salt in a pot with a lid and bring to a boil.","Turn the heat to the lowest setting, cover and cook "+T.m+" minutes. Do not lift the lid.","Turn off the heat and rest, covered, "+T.r+" minutes. Fluff with a fork."]}
  const vol=(d+w)/1000*1.6;
  return{title:T.n+" for "+n,meta:[["clock",T.m?T.m+" min"+(T.r?" + "+T.r+" rest":""):"5 min"],["rice","Dry "+G(d)],["jar","Pot of at least "+(Math.ceil(vol*4)/4).toFixed(2).replace(/\.?0+$/,"")+" L"]],
   note:["Ratio: "+T.w+" g water per 1 g dry grain. "+(s.t==="risotto"?"":T.tip)],ing,steps}}},
bake:{title:"What are we baking?",sub:"Sponge scaled to any tin, or cookies by the count.",
 ctl:[{k:"t",label:"Bake",icon:"cupcake",def:"cake",tg:[["cake","Sponge cake"],["cookie","Cookies"]]},
      {k:"sh",label:"Tin shape",icon:"ruler",def:"round",tg:[["round","Round"],["square","Square"],["loaf","Loaf"]],only:"cake"},
      {k:"c",label:"Tin size (cm across, or length)",icon:"ruler",def:20,step:[12,32,1,"cm"],only:"cake"},
      {k:"k",label:"How many cookies",icon:"cookie",def:24,step:[6,60,6,""],only:"cookie"}],
 calc(s){
  if(s.t==="cookie"){
   const k=s.k*30/755;
   return{title:s.k+" cookies",meta:[["clock","About 30 min"],["cookie","30 g of dough each"],["flame","180 °C"]],note:["Chilling the dough 30 minutes makes thicker, chewier cookies."],
    ing:[["Flour",G(300*k)],["Soft butter",G(150*k)],["Sugar (half brown, half white)",G(150*k)],["Egg",eggs(50*k)],["Bicarbonate of soda",P1(3*k)+" g"],["Salt",P1(2*k)+" g"],["Chocolate, chopped",G(100*k)]],
    steps:["Heat the oven to 180 °C and line a tray.","Beat the butter and both sugars until pale and fluffy.","Beat in the egg, then stir in the flour, soda and salt just until combined. Fold in the chocolate.","Roll into 30 g balls and place 5 cm apart.","Bake 10–12 minutes until the edges are golden and the middle still looks soft. Cool on the tray 5 minutes."]}}
  const c=s.c,area=s.sh==="round"?Math.PI*c*c/4:s.sh==="square"?c*c:c*12,f=area/314.16,ne=200*f,
   t=Math.round((30+12*(f-1)+(s.sh==="loaf"?8:0))/5)*5,temp=f>1.6?"170 °C":"180 °C";
  return{title:"Sponge for a "+c+" cm "+s.sh+" tin",meta:[["clock",Math.max(20,t)+" min bake"],["flame",temp],["cupcake","Tin: "+c+" cm "+s.sh+(s.sh==="loaf"?" × 12 cm":"")]],
   note:["Based on a 20 cm round tin (4 × 200 g). Scaled by the tin's area. Bigger tins bake longer at a slightly lower heat."],
   ing:[["Soft butter",G(200*f)],["Sugar",G(200*f)],["Eggs",eggs(ne)],["Flour (self-raising, or plain plus baking powder)",G(200*f)],["Baking powder (skip if self-raising)",P1(8*f)+" g"],["Milk",ML(15*f)],["Vanilla",ML(5*f)],["Salt","a pinch"]],
   steps:["Heat the oven to "+temp+". Grease and line the tin.","Beat the butter and sugar until pale and fluffy, 3–4 minutes.","Beat in the eggs a little at a time. Add a spoon of flour if it starts to curdle.","Fold in the flour, baking powder and salt, then the milk and vanilla until just smooth.","Spread in the tin and bake about "+Math.max(20,t)+" minutes, until a skewer comes out clean.","Cool 10 minutes in the tin, then on a rack."]}}},
drinks:{title:"What are we drinking?",sub:"Cold brew, lemonade and syrup by the jug.",
 ctl:[{k:"t",label:"Drink",icon:"drinks",def:"coffee",tg:[["coffee","Cold brew coffee"],["tea","Cold brew tea"],["lemonade","Lemonade"],["syrup","Simple syrup"]]},
      {k:"a",label:"How much to make",icon:"ruler",def:1000,step:[250,3000,250,"g"]},
      {k:"x",label:"Strength",icon:"flame",def:"rtd",tg:[["rtd","Ready to drink"],["conc","Concentrate"]],only:"coffee"},
      {k:"sw",label:"Sweetness",icon:"flame",def:1,tg:[[0,"Tart"],[1,"Balanced"],[2,"Sweet"]],only:"lemonade"},
      {k:"r",label:"Syrup",icon:"flame",def:"1",tg:[["1","1 : 1 everyday"],["2","2 : 1 rich"]],only:"syrup"}],
 calc(s){
  const a=s.a;
  if(s.t==="coffee"){const conc=s.x==="conc",r=conc?5:10,cf=a/r;
   return{title:"Cold brew "+(conc?"concentrate":"coffee"),meta:[["clock","12–18 hours"],["fridge","Keeps 1 week"],["drinks",ML(a)+" water"]],note:[conc?"Dilute 1 : 1 with water, milk or ice to serve.":"Ready to pour over ice."],
    ing:[["Coffee, coarsely ground",G(cf)],["Cold water",ML(a)]],steps:["Stir the coffee and cold water together in a jar. Make sure all the grounds are wet.","Cover and leave in the fridge 12–18 hours.","Strain through a paper filter or fine sieve, twice if it looks cloudy.","Keep in the fridge up to 1 week."]}}
  if(s.t==="tea")return{title:"Cold brew tea",meta:[["clock","6–8 hours"],["fridge","Keeps 3 days"],["drinks",ML(a)]],note:["No bitterness, no cooling down. Add lemon, mint or honey at the end."],
   ing:[["Loose tea (black, green or fruit)",P1(a/1000*8)+" g"],["Cold water",ML(a)]],steps:["Put the tea and cold water in a jar and stir.","Leave in the fridge 6–8 hours (green tea 4–6).","Strain and serve over ice."]};
  if(s.t==="lemonade"){const sug=[60,90,120][s.sw]*a/1000,juice=150*a/1000,w=a-juice-sug;
   return{title:"Lemonade",meta:[["drinks",ML(a)],["fridge","Keeps 3 days"],["leaf","About "+Math.ceil(juice/45)+" lemons"]],note:["The sugar is dissolved in hot water first so the lemonade is smooth."],
    ing:[["Lemon juice",ML(juice)],["Sugar",G(sug)],["Hot water (to dissolve the sugar)",ML(sug)],["Cold water",ML(Math.max(0,w-sug))]],
    steps:["Stir the sugar into the hot water until clear. Cool 10 minutes.","Add the lemon juice and cold water. Taste and add more water or sugar if you like.","Chill and serve over ice with lemon slices."]}}
  const rich=s.r==="2",wt=a/(rich?2.05:1.6)*1,sg=wt*(rich?2:1);
  return{title:(rich?"Rich":"Simple")+" syrup",meta:[["drinks","About "+ML(a)],["fridge",rich?"Keeps 6 months":"Keeps 1 month"]],note:["Ratio by weight: "+(rich?"2 parts sugar to 1 part water":"equal sugar and water")+"."],
   ing:[["Water",ML(wt)],["Sugar",G(sg)]],steps:["Warm the water and sugar in a pot, stirring, until the sugar dissolves. Do not boil hard.","Cool, pour into a clean bottle and keep in the fridge."]}}},
pasta:{title:"What pasta are we rolling?",sub:"Pick a dough, shape and sauce, or spin for a surprise.",
 spinLabel:"Spin a pasta!",spinNote:"Rolling out your pasta…",
 names:["Tagliatelle ragù","Cacio e pepe","Orecchiette with pesto","Pappardelle with mushrooms","Spaghetti-style aglio e olio","Tomato and basil","Trofie with pesto","Carbonara","Cavatelli with tomato","Tagliolini with garlic and chilli","Creamy mushroom"],
 spin(s){const pk=a=>a[Math.floor(Math.random()*a.length)];
  s.t=pk(["egg","egg","egg","semo"]);s.h=pk(["tagliatelle","pappardelle","tagliolini"]);s.m=pk(["orecchiette","cavatelli","trofie"]);s.a=pk(["tomato","cacio","pesto","ragu","aglio","carbonara","mushroom"])},
 ctl:[{k:"t",label:"Dough",icon:"pasta",def:"egg",tg:[["egg","Egg pasta"],["semo","Eggless semolina"]]},
  {k:"h",label:"Shape",icon:"pasta",def:"tagliatelle",tg:[["tagliatelle","Tagliatelle"],["pappardelle","Pappardelle"],["tagliolini","Tagliolini"]],only:"egg"},
  {k:"m",label:"Shape",icon:"pasta",def:"orecchiette",tg:[["orecchiette","Orecchiette"],["cavatelli","Cavatelli"],["trofie","Trofie"]],only:"semo"},
  {k:"a",label:"Sauce",icon:"sauce",def:"tomato",tg:[["tomato","Tomato and basil"],["cacio","Cacio e pepe"],["pesto","Pesto"],["ragu","Ragù"],["aglio","Garlic and chilli"],["carbonara","Carbonara"],["mushroom","Creamy mushroom"]]},
  {k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,egg=s.t!=="semo",w=Math.max(2000,100*n*10),salt=Math.round(w/100),Gm=x=>x<10?P1(x)+" g":G(x);
  const SH=(egg?{tagliatelle:["Tagliatelle",["Roll out thin (you should see your hand through it), dust with semolina, roll up loosely and cut into ribbons about 6 mm wide. Shake them out into loose nests."],"2–3"],
    pappardelle:["Pappardelle",["Roll out thin (you should see your hand through it), dust with semolina and cut into ribbons about 2 cm wide, with a knife or a fluted wheel."],"2–3"],
    tagliolini:["Tagliolini",["Roll out very thin, dust with semolina, roll up loosely and cut into thin ribbons about 2 mm wide. Shake them out into loose nests."],"1–2"]}[s.h||"tagliatelle"]
   :{orecchiette:["Orecchiette",["Roll the dough into ropes 1 cm thick and cut into small pieces. Drag each piece against the board with a butter knife so it curls, then flip it over your thumb into a little dome."],"4–5"],
    cavatelli:["Cavatelli",["Roll the dough into ropes as thick as a finger and cut into 2 cm pieces. Press two fingers on each piece and drag it toward you so it curls into a little shell."],"4–5"],
    trofie:["Trofie",["Cut the dough into small 2 cm pieces and roll each one under your palm on the board into a thin twist about 4 cm long."],"3–4"]}[s.m||"orecchiette"]);
  const SA={
   tomato:{n:"tomato and basil",t:20,ing:[["Sauce: passata or canned tomatoes",130],["Sauce: olive oil",8],["Sauce: garlic, sliced",4],["Sauce: fresh basil",3],["Parmesan, to serve",10]],
    pre:["Warm the oil and garlic gently for 1 minute, without letting the garlic brown. Add the tomatoes and a pinch of salt and simmer 15 minutes until thick."],fin:"Toss the drained pasta in the sauce with a splash of the pasta water. Tear in the basil and serve with parmesan."},
   cacio:{n:"cacio e pepe",t:10,ing:[["Sauce: pecorino romano, finely grated",35],["Sauce: black pepper, freshly ground",1.5]],
    pre:["Toast the pepper in a wide dry pan for 1 minute. Stir the pecorino with a few spoonfuls of cooled pasta water into a thick paste."],fin:"Move the drained pasta to the pepper pan with a splash of pasta water. Off the heat, stir in the cheese paste, adding more water until the sauce is creamy and clings to the pasta."},
   pesto:{n:"pesto",t:10,ing:[["Sauce: fresh basil",25],["Sauce: pine nuts",6],["Sauce: parmesan, grated",12],["Sauce: olive oil",18],["Sauce: garlic",1.5]],
    pre:["Pound or blitz the basil, pine nuts, garlic and a pinch of salt, then stir in the parmesan and the oil."],fin:"Toss the drained pasta with the pesto and a splash of pasta water, off the heat (heat turns basil dark and bitter)."},
   ragu:{n:"ragù",t:130,first:1,note:"The ragù is the long part (about 1½ hours), so start it before the pasta.",ing:[["Sauce: beef mince",70],["Sauce: onion, finely chopped",30],["Sauce: carrot, finely chopped",15],["Sauce: celery, finely chopped",15],["Sauce: canned tomatoes",100],["Sauce: red wine (or stock)",30],["Sauce: olive oil",8],["Parmesan, to serve",10]],
    pre:["Ragù: soften the onion, carrot and celery in the oil for 8 minutes. Add the mince and brown it well, about 8 minutes.","Add the wine and let it bubble away, then the tomatoes and a pinch of salt. Simmer on low heat 1½ hours, stirring now and then, with a splash of water if it gets dry."],fin:"Toss the drained pasta with the ragù and a splash of pasta water. Serve with parmesan."},
   aglio:{n:"garlic and chilli",t:10,ing:[["Sauce: olive oil",20],["Sauce: garlic, thinly sliced",6],["Sauce: chilli flakes",.3],["Sauce: parsley, chopped",5],["Parmesan, to serve (optional)",8]],
    pre:["Warm the oil with the garlic and chilli on low heat 3–4 minutes, until the garlic is pale gold (not brown)."],fin:"Toss the drained pasta in the pan with a ladle of pasta water for 1 minute until glossy. Stir in the parsley."},
   carbonara:{n:"carbonara",t:15,ing:[["Sauce: pancetta or guanciale, diced",40],["Sauce: egg yolks",n+(n>1?" yolks":" yolk")],["Sauce: pecorino or parmesan, grated",25],["Sauce: black pepper",1.5]],
    pre:["Fry the pancetta in a dry pan over medium heat 6–8 minutes until crisp. Whisk the yolks with the cheese and plenty of pepper."],fin:"Off the heat, toss the hot drained pasta with the pancetta, then the egg mix, adding pasta water a splash at a time until creamy. Do not put it back on the heat or the eggs scramble."},
   mushroom:{n:"creamy mushroom",t:20,ing:[["Sauce: mushrooms, sliced",100],["Sauce: cream",40],["Sauce: butter",8],["Sauce: garlic",3],["Sauce: fresh thyme",1],["Parmesan, to serve",10]],
    pre:["Fry the mushrooms in the butter on high heat 6 minutes until golden. Add the garlic and thyme for 30 seconds, then the cream, and simmer 3 minutes."],fin:"Toss the drained pasta in the sauce with a splash of pasta water. Serve with parmesan."}}[s.a||"tomato"];
  const dough=egg?["Mound the flour, make a well and add the eggs and salt. Whisk with a fork, slowly pulling in flour.","Knead 8–10 minutes until smooth and elastic. Wrap and rest 30 minutes."]:["Mix the semolina and salt, add the warm water and knead 8 minutes until smooth.","Wrap and rest 30 minutes."];
  const cook="Boil the pasta in "+(w/1000)+" L of water with "+salt+" g salt (10 g per litre) for "+SH[2]+" minutes. Drain, keeping a cup of the water for the sauce.";
  return{title:SH[0]+" with "+SA.n+" for "+n,meta:[["clock","About "+hm(60+SA.t)],["pasta","Dough "+G(egg?100*n*1.55:100*n*1.5)],["jar","Pot of "+Math.ceil(w/1000)+" L water"]],
   note:[egg?"Rest the dough 30 minutes: it makes rolling much easier. Cook fresh egg pasta only 2–3 minutes.":"Semolina pasta is firmer than egg pasta and suits robust sauces. Shape it while the dough is still smooth.",SA.note].filter(Boolean),
   ing:(egg?[["Pasta: plain or 00 flour",G(100*n)],["Pasta: eggs",eggs(55*n)],["Pasta: salt",P1(n)+" g"],["Pasta: semolina, for dusting",G(20*n)]]:[["Pasta: semolina flour",G(100*n)],["Pasta: warm water",G(50*n)],["Pasta: salt",P1(n)+" g"]]).concat([["Salt, for the pasta water",salt+" g"]],SA.ing.map(x=>[x[0],typeof x[1]==="number"?Gm(x[1]*n):x[1]])),
   steps:[].concat(SA.first?SA.pre:[],dough,SH[1],SA.first?[]:SA.pre,[cook,SA.fin])}}},
soup:{title:"What are we simmering?",sub:"Stock from bones and scraps, or soup for your table.",
 ctl:[{k:"t",label:"Make",icon:"soup",def:"soup",tg:[["soup","Soup"],["stock","Stock"]]},
  {k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""],only:"soup"},{k:"y",label:"Style",icon:"soup",def:"brothy",tg:[["brothy","Brothy"],["creamy","Creamy"]],only:"soup"},
  {k:"k",label:"Type",icon:"soup",def:"chicken",tg:[["chicken","Chicken"],["beef","Beef"],["veg","Vegetable"],["fish","Fish"]],only:"stock"},{k:"b",label:"Bones or scraps",icon:"ruler",def:1000,step:[500,3000,250,"g"],only:"stock"}],
 calc(s){
  if(s.t==="stock"){const b=s.b,T={chicken:{n:"Chicken",w:2,h:"3 hours",r:""},beef:{n:"Beef",w:2,h:"6 hours",r:"Roast the bones at 220 °C for 30 minutes first for a deeper flavour. "},veg:{n:"Vegetable",w:1.5,h:"45 minutes",r:""},fish:{n:"Fish",w:1.5,h:"30 minutes",r:"Use bones from white fish only. "}}[s.k],wt=b*T.w;
   return{title:T.n+" stock",meta:[["clock",T.h],["jar","Makes about "+G(wt*.85)],["fridge","Fridge 4 days · freezer 3 months"]],note:["Do not add salt now. Season the dish you cook with it."],
    ing:[[s.k==="veg"?"Vegetable scraps":"Bones",G(b)],["Cold water",G(wt)],["Onion",G(b*.15)],["Carrot",G(b*.1)],["Celery",G(b*.08)],["Bay leaves",Math.max(1,Math.round(b/1000))+""],["Black peppercorns",P1(b/1000*3)+" g"]],
    steps:[T.r+"Put everything in a big pot and cover with the cold water.","Bring slowly to a gentle simmer. Skim off the foam. Do not boil hard or the stock turns cloudy.","Simmer uncovered for "+T.h+".","Strain, cool quickly (within 2 hours) and chill. Remove the fat from the top before using."]}}
  const n=s.p||people,cr=s.y==="creamy",liq=350*n+(cr?0:0),salt=Math.round(liq*.008*2)/2;
  return{title:(cr?"Creamy":"Brothy")+" soup for "+n,meta:[["clock","About 40 min"],["soup","Serves "+n],["fridge","Fridge 4 days · freezer 3 months"]],note:["Freeze in portions and leave 2 cm of space at the top of the container."],
   ing:[["Vegetables, chopped",G(250*n)],["Onion",G(50*n)],["Oil or butter",G(10*n)],["Stock",G(liq)]].concat(cr?[["Potato (makes it creamy)",G(80*n)],["Cream (optional)",G(20*n)]]:[["Small pasta, rice or beans (optional)",G(25*n)]]).concat([["Salt","about "+salt+" g"]]),
   steps:["Soften the onion in the oil 5 minutes.","Add the vegetables"+(cr?" and potato":"")+" and stir 3 minutes.","Add the stock, bring to a boil, then simmer 20–25 minutes until everything is tender.",cr?"Blend until smooth, stir in the cream and heat through.":"Add the pasta, rice or beans for the last 10 minutes.","Season with salt and pepper at the end."]}}},
sauce:{title:"What are we dressing?",sub:"Dressings, pesto and pan sauce with the right balance.",
 ctl:[{k:"t",label:"Sauce",icon:"sauce",def:"vin",tg:[["vin","Vinaigrette"],["yog","Yogurt dressing"],["pesto","Pesto"],["pan","Pan sauce"]]},{k:"p",label:"Servings",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,R={
   vin:{n:"Vinaigrette",m:"5 min",note:"The rule is 3 parts oil to 1 part acid. A little mustard keeps it from separating.",ing:[["Olive oil",G(22*n)],["Vinegar or lemon juice",G(7.5*n)],["Dijon mustard",P1(3*n)+" g"],["Honey (optional)",P1(2*n)+" g"],["Salt",P1(.5*n)+" g"]],st:["Put the vinegar, mustard, honey and salt in a jar.","Add the oil, close the lid and shake hard for 15 seconds.","Taste on a leaf and adjust with salt or acid."]},
   yog:{n:"Yogurt dressing",m:"5 min",note:"Good on salads, grilled veg and roast chicken.",ing:[["Plain yogurt",G(60*n)],["Lemon juice",P1(8*n)+" g"],["Olive oil",P1(5*n)+" g"],["Garlic",P1(.25*n)+" clove"],["Fresh herbs, chopped",G(3*n)],["Salt",P1(.7*n)+" g"]],st:["Grate the garlic into the yogurt.","Stir in the lemon, oil, herbs and salt.","Thin with a splash of water if it is too thick."]},
   pesto:{n:"Pesto",m:"10 min",note:"Enough for about 100 g of dry pasta per person.",ing:[["Fresh basil",G(25*n)],["Pine nuts",G(8*n)],["Parmesan, grated",G(12*n)],["Garlic",P1(.5*n)+" clove"],["Olive oil",G(30*n)],["Salt",P1(.3*n)+" g"]],st:["Toast the pine nuts in a dry pan until golden. Cool.","Blend or pound the basil, nuts, garlic and salt.","Stir in the parmesan and oil. Toss with hot pasta and a splash of the pasta water."]},
   pan:{n:"Pan sauce",m:"8 min",note:"Make it right after cooking meat, in the same pan, without washing it.",ing:[["Shallot, finely chopped",G(20*n)],["Stock",G(80*n)],["White wine or extra stock",G(40*n)],["Cold butter",G(8*n)],["Salt and pepper","to taste"]],st:["Pour off most of the fat. Soften the shallot in the pan 1 minute.","Add the wine and scrape up the browned bits. Boil until almost gone.","Add the stock and boil until it has reduced by half.","Take off the heat and swirl in the cold butter. Season and pour over the meat."]}}[s.t];
  return{title:R.n+" for "+n,meta:[["clock",R.m],["sauce","Serves "+n]],note:[R.note],ing:R.ing,steps:R.st}}},
eggs:{title:"What are we cracking?",sub:"Batters, omelettes and boiled eggs without guessing.",
 ctl:[{k:"t",label:"Make",icon:"egg",def:"pan",tg:[["pan","Pancakes"],["crepe","Crepes"],["omelette","Omelette"],["boiled","Boiled eggs"]]},
  {k:"c",label:"How many",icon:"ruler",def:8,step:[4,24,4,""],only:["pan","crepe"]},{k:"d",label:"Pan size (cm)",icon:"ruler",def:24,step:[18,30,2,"cm"],only:"omelette"},
  {k:"e",label:"Eggs",icon:"egg",def:4,step:[1,12,1,""],only:"boiled"},{k:"o",label:"Doneness",icon:"clock",def:"jam",tg:[["soft","Soft"],["jam","Jammy"],["med","Medium"],["hard","Hard"]],only:"boiled"}],
 calc(s){
  if(s.t==="pan"){const k=s.c/4;return{title:s.c+" fluffy pancakes",meta:[["clock","20 min"],["flame","Medium heat"]],note:["Do not overmix. Lumps are fine."],ing:[["Flour",G(125*k)],["Milk",G(150*k)],["Egg",eggs(50*k)],["Baking powder",P1(5*k)+" g"],["Sugar",G(12*k)],["Melted butter",G(15*k)],["Salt","a pinch"]],steps:["Whisk the dry ingredients. In another bowl whisk the milk, egg and butter.","Pour the wet into the dry and stir until just combined. Rest 5 minutes.","Cook spoonfuls in a lightly buttered pan on medium heat about 2 minutes per side, until bubbles form and the edges look set. Flip once."]}}
  if(s.t==="crepe"){const k=s.c/8;return{title:s.c+" thin crepes",meta:[["clock","30 min"],["flame","Medium-high heat"]],note:["Resting the batter 30 minutes gives tender crepes that do not tear."],ing:[["Flour",G(125*k)],["Milk",G(250*k)],["Eggs",eggs(100*k)],["Melted butter",G(20*k)],["Salt",P1(k)+" g"]],steps:["Whisk the flour and salt, then the milk and eggs, until smooth. Stir in the butter.","Rest 30 minutes.","Pour a thin layer into a hot buttered pan, swirl to coat and cook 1 minute. Flip and cook 30 seconds."]}}
  if(s.t==="omelette"){const d=s.d,n=d<=20?2:d<=24?3:d<=28?4:5;return{title:n+"-egg omelette",meta:[["clock","5 min"],["egg","For a "+d+" cm pan"]],note:["For more people, make one omelette at a time, or bake a frittata in the oven at 180 °C."],ing:[["Eggs",n+" eggs"],["Butter",G(5+n*2)],["Salt","a pinch"],["Filling (cheese, herbs, veg)",G(15*n)]],steps:["Beat the eggs with the salt.","Melt the butter in the pan until foaming. Pour in the eggs.","Stir gently for 20 seconds, then let it set for 1 minute.","Add the filling on one half, fold over and slide onto a plate while the middle is still a little soft."]}}
  const T={soft:[6,"runny yolk, set white"],jam:[7,"jammy yolk"],med:[9,"creamy, just set yolk"],hard:[11,"fully set yolk"]}[s.o];
  return{title:s.e+" boiled egg"+(s.e>1?"s":""),meta:[["clock",T[0]+" min"],["egg",T[1]]],note:["Timed from the moment the water boils, for fridge-cold eggs."],ing:[["Eggs",s.e+""],["Water","enough to cover"],["Ice and cold water","for the bath"]],steps:["Bring a pot of water to a rolling boil.","Lower in the eggs and set a timer for "+T[0]+" minutes.","Move the eggs straight into ice water for 5 minutes. This stops the cooking and makes them easy to peel."]}}},
jam:{title:"What are we preserving?",sub:"Fruit and sugar ratios with the lemon and the set point.",
 ctl:[{k:"u",label:"Fruit",icon:"jam",def:"strawberry",tg:[["strawberry","Strawberries"],["raspberry","Raspberries"],["apricot","Apricots"],["plum","Plums"],["blueberry","Blueberries"],["cherry","Cherries"],["apple","Apples"],["blackcurrant","Blackcurrants"]]},
  {k:"w",label:"Prepared fruit",icon:"ruler",def:1000,step:[500,3000,250,"g"]},{k:"l",label:"Sugar",icon:"flame",def:1,tg:[[0,"Light (fridge)"],[1,"Balanced"],[2,"Classic (shelf)"]]}],
 calc(s){
  const P={strawberry:[60,"Low in pectin"],raspberry:[30,"Medium pectin"],apricot:[30,"Medium pectin"],plum:[30,"Medium pectin"],blueberry:[60,"Low in pectin"],cherry:[60,"Low in pectin"],apple:[15,"High in pectin"],blackcurrant:[15,"High in pectin"]}[s.u],
   pc=[50,65,100][s.l],f=s.w,sug=f*pc/100,lem=P[0]*f/1000,out=(f+sug)*.78,jars=Math.ceil(out/300),keep=["2–3 weeks in the fridge","1–2 months in the fridge, or freeze","1 year in sterilised sealed jars"][s.l];
  return{title:s.u[0].toUpperCase()+s.u.slice(1)+" jam",meta:[["clock","About 30 min"],["jam","Makes about "+G(out)],["jar",jars+" jar"+(jars>1?"s":"")+" of 250 ml"],["fridge",keep]],note:[P[1]+", so "+G(lem)+" of lemon juice is added to help it set.",s.l<2?"Less sugar means a softer set and a shorter life. Keep it cold.":"Only a full 1 : 1 jam is safe in sealed jars on the shelf."],
   ing:[["Prepared fruit (hulled, stoned, chopped)",G(f)],["Sugar",G(sug)],["Lemon juice",G(lem)]],
   steps:["Put a few small plates in the freezer for the set test. Sterilise the jars in a 120 °C oven for 15 minutes.","Mix the fruit, sugar and lemon juice and leave 30 minutes until the sugar is wet.","Heat gently, stirring, until the sugar has dissolved. Then boil hard 10–20 minutes.","Test: it is ready at 105 °C, or when a drop on a cold plate wrinkles when you push it. Skim off the foam.","Cool 10 minutes, pour into the hot jars and seal. Label with the date."]}}},
dairy:{title:"What are we culturing?",sub:"Yogurt, labneh and fresh cheese from milk.",
 ctl:[{k:"t",label:"Make",icon:"dairy",def:"yogurt",tg:[["yogurt","Yogurt"],["labneh","Labneh"],["paneer","Paneer"]]},{k:"a",label:"Milk or yogurt",icon:"ruler",def:1000,step:[500,4000,500,"g"]}],
 calc(s){
  const a=s.a;
  if(s.t==="yogurt")return{title:"Yogurt",meta:[["clock","6–10 hours"],["dairy","Makes "+G(a)],["fridge","Keeps 1 week"]],note:["Use a plain yogurt with live cultures as the starter. Longer incubation means tangier yogurt."],ing:[["Whole milk",G(a)],["Plain yogurt, as starter",G(a*.03)]],
   steps:["Heat the milk to 82 °C and hold 5 minutes for a thicker yogurt. Cool to 43 °C.","Whisk a spoon of the milk into the starter, then stir it back into the milk.","Keep at 40–43 °C for 6–10 hours (oven with just the light on, or a warm spot in a flask).","Chill at least 4 hours before eating."]};
  if(s.t==="labneh")return{title:"Labneh",meta:[["clock","12–24 hours"],["dairy","Makes about "+G(a*.45)],["fridge","Keeps 2 weeks"]],note:["Strain 6 hours for a thick spread, 24 hours for a firm ball you can roll in herbs."],ing:[["Thick plain yogurt",G(a)],["Salt",P1(a/1000*5)+" g"]],
   steps:["Stir the salt into the yogurt.","Line a sieve with a clean cloth, tip in the yogurt and set it over a bowl.","Cover and leave in the fridge 12–24 hours.","Spoon into a jar and cover with olive oil."]};
  return{title:"Paneer",meta:[["clock","1 hour"],["dairy","Makes about "+G(a*.17)],["fridge","Keeps 4 days"]],note:["Use whole milk (not UHT) for the best yield."],ing:[["Whole milk",G(a)],["Lemon juice",G(a*.04)]],
   steps:["Bring the milk to a near boil, stirring.","Turn off the heat and stir in the lemon juice slowly until the curds split from the clear whey.","Rest 5 minutes. Drain through a cloth-lined sieve and rinse briefly under cold water.","Twist the cloth, press under a heavy weight for 20–30 minutes, then cut into cubes."]}}},
dumpling:{title:"What are we folding?",sub:"Wrappers, filling and cooking time for any number of dumplings.",
 ctl:[{k:"t",label:"Style",icon:"dumpling",def:"gyoza",tg:[["gyoza","Pan-fried gyoza"],["jiaozi","Boiled jiaozi"],["momo","Steamed momo"]]},{k:"c",label:"How many",icon:"ruler",def:24,step:[12,72,12,""]}],
 calc(s){
  const c=s.c,fl=c*(s.t==="gyoza"?12:15),how={
   gyoza:["Heat 1 tablespoon of oil in a non-stick pan with a lid. Place the dumplings flat side down and fry 2 minutes until golden.","Add "+G(c*5)+" of water, cover and steam 5–6 minutes. Uncover and cook until the water has gone and the bottoms are crisp."],
   jiaozi:["Boil in plenty of water. When they float, cook 2–3 minutes more, until the wrappers look slightly see-through."],
   momo:["Steam over boiling water on an oiled rack 10–12 minutes, until the wrappers are glossy and firm."]}[s.t];
  return{title:c+" "+({gyoza:"gyoza",jiaozi:"jiaozi",momo:"momo"})[s.t],meta:[["clock","About 1 hour"],["dumpling","Filling "+G(fl)+" in total"],["flame",s.t==="gyoza"?"Fry then steam":s.t==="jiaozi"?"Boil 5–8 min":"Steam 10–12 min"]],
   note:["Per dumpling: 10 g of dough and "+(s.t==="gyoza"?12:15)+" g of filling. Freeze uncooked on a tray, then bag them. Cook from frozen, 2 minutes longer."],
   ing:[["Wrapper: flour",G(c*10)],["Wrapper: warm water",G(c*5)],["Wrapper: salt",P1(c*.1)+" g"],["Pork mince (or chicken, or crumbled tofu)",G(fl*.55)],["Cabbage, finely chopped",G(fl*.35)],["Salt, for the cabbage",P1(fl*.35*.01)+" g"],["Spring onion",G(fl*.05)],["Ginger, grated",G(fl*.02)],["Soy sauce",G(fl*.03)],["Sesame oil",P1(fl*.015)+" g"]],
   steps:["Mix the flour and salt, stir in the warm water and knead 8 minutes until smooth. Rest 30 minutes under a cloth.","Toss the cabbage with its salt, wait 10 minutes and squeeze out the water. Mix with all the other filling ingredients.","Roll the dough into 8 cm discs ("+c+" of them, 10 g each).","Put a spoonful of filling in the middle, wet the edge, fold in half and pleat to seal."].concat(how,["Dip in soy sauce mixed with a little rice vinegar."])}}},
burger:{title:"What are we flipping?",sub:"Pick your patty, cheese, sauce and toppings, or spin for a surprise.",
 spinLabel:"Spin a burger!",spinNote:"Stacking your burger…",
 names:["Cheddar beef","Swiss and caramelised onion","Blue cheese lamb","Smoky BBQ bacon","Chipotle chicken","Black bean and avocado","Fried egg and bacon","Jalapeño cheddar","Garlic aioli chicken","Classic with pickles","Lamb and tomato","Beef, egg and avocado"],
 spin(s){ // a random burger that still makes sense: toppings are shuffled, bacon stays off the veggie one
  const pk=a=>a[Math.floor(Math.random()*a.length)],sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  s.t=pk(["beef","beef","lamb","chicken","bean"]);s.c=pk(["none","cheddar","cheddar","swiss","blue"]);s.s=pk(["classic","bbq","chipotle","aioli"]);
  s.o=sh(["lettuce","tomato","onion","pickles","bacon","egg","avocado","jalapeno","caramel"].filter(x=>!(x==="bacon"&&s.t==="bean"))).slice(0,2+Math.floor(Math.random()*3))},
 ctl:[{k:"p",label:"Burgers",icon:"burger",def:null,step:[1,12,1,""]},{k:"z",label:"Patty size",icon:"ruler",def:150,tg:[[100,"Small 100 g"],[150,"Classic 150 g"],[200,"Big 200 g"]]},
  {k:"t",label:"Patty",icon:"burger",def:"beef",tg:[["beef","Beef"],["lamb","Lamb"],["chicken","Chicken"],["bean","Black bean (veggie)"]]},
  {k:"c",label:"Cheese",icon:"dairy",def:"none",tg:[["none","No cheese"],["cheddar","Cheddar"],["swiss","Swiss"],["blue","Blue cheese"]]},
  {k:"s",label:"Sauce",icon:"sauce",def:"classic",tg:[["classic","Classic"],["bbq","Smoky BBQ"],["chipotle","Chipotle mayo"],["aioli","Garlic aioli"]]},
  {k:"o",label:"Toppings (pick any)",icon:"salad",def:["pickles"],ms:[["lettuce","Lettuce"],["tomato","Tomato"],["onion","Red onion"],["pickles","Pickles"],["bacon","Bacon"],["egg","Fried egg"],["avocado","Avocado"],["jalapeno","Jalapeños"],["caramel","Caramelised onions"]]}],
 calc(s){
  const n=s.p||people,z=+s.z,meat=n*z,top=Array.isArray(s.o)?s.o:[],has=k=>top.includes(k),pt=s.t||"beef",ch=s.c||"none",sc=s.s||"classic";
  const PT={
   beef:{w:"beef",flame:"71 °C inside",note:"Use beef mince with about 20% fat. Keep it cold and handle it as little as you can.",
    ing:[["Patty: beef mince (20% fat)",G(meat)],["Patty: salt",P1(meat*.01)+" g"],["Patty: black pepper",P1(meat*.004)+" g"]],
    shape:"Patties: gently shape "+n+" patties of "+z+" g, a little wider than the bun. Press a dimple in the middle. Salt only just before cooking.",
    cook:"Cook on a very hot pan or grill 3–4 minutes per side, until 71 °C inside.",rest:" Rest 3 minutes."},
   lamb:{w:"lamb",flame:"71 °C inside",note:"Use lamb mince with about 20% fat. Keep it cold and handle it as little as you can.",
    ing:[["Patty: lamb mince (20% fat)",G(meat)],["Patty: salt",P1(meat*.01)+" g"],["Patty: black pepper",P1(meat*.004)+" g"],["Patty: ground cumin",P1(meat*.004)+" g"],["Patty: fresh mint, chopped",G(meat*.03)]],
    shape:"Patties: mix the mince lightly with the cumin, mint and pepper, then shape "+n+" patties of "+z+" g, a little wider than the bun. Press a dimple in the middle. Salt only just before cooking.",
    cook:"Cook on a very hot pan or grill 3–4 minutes per side, until 71 °C inside.",rest:" Rest 3 minutes."},
   chicken:{w:"chicken",flame:"75 °C inside",note:"Use thigh mince (or mince skinless thighs yourself). Breast mince turns dry. Chicken must cook all the way through.",
    ing:[["Patty: chicken thigh mince",G(meat)],["Patty: salt",P1(meat*.01)+" g"],["Patty: smoked paprika",P1(meat*.006)+" g"],["Patty: garlic powder",P1(meat*.004)+" g"]],
    shape:"Patties: mix the mince with the salt, paprika and garlic powder, then shape "+n+" patties of "+z+" g, a little wider than the bun. Chill 15 minutes.",
    cook:"Cook in a hot pan or on a grill over medium-high heat 4–5 minutes per side, until 75 °C inside.",rest:" Rest 3 minutes."},
   bean:{w:"black bean",flame:"Crisp and hot through",note:"Mash only half the beans so the patties keep some bite. Chilling 20 minutes helps them hold together.",
    ing:[["Patty: canned black beans, drained",G(meat*.5)],["Patty: breadcrumbs or rolled oats",G(meat*.2)],["Patty: onion, grated",G(meat*.15)],["Patty: egg, beaten",G(meat*.12)],["Patty: smoked paprika",P1(meat*.008)+" g"],["Patty: ground cumin",P1(meat*.008)+" g"],["Patty: salt",P1(meat*.01)+" g"]],
    shape:"Patties: mash half the beans roughly with a fork, mix in everything else for the patties, and shape "+n+" patties of "+z+" g. Chill 20 minutes.",
    cook:"Cook in a pan with a little oil over medium heat 4 minutes per side, until crisp outside and hot through. Do not press on them.",rest:""}}[pt]||null;
  const CH={cheddar:["Cheddar, sliced",20,"cheddar"],swiss:["Swiss cheese (Emmental or Gruyère), sliced",20,"Swiss"],blue:["Blue cheese, crumbled",15,"blue cheese"]}[ch];
  const SC={classic:[["Sauce: mayonnaise",20],["Sauce: ketchup",10],["Sauce: mustard",4]],bbq:[["Sauce: BBQ sauce",25],["Sauce: mayonnaise",10]],chipotle:[["Sauce: mayonnaise",25],["Sauce: chipotle paste (or chipotles in adobo)",5],["Sauce: lime juice",4]],aioli:[["Sauce: mayonnaise",25],["Sauce: garlic, crushed",3],["Sauce: lemon juice",4]]}[sc]||[];
  const TP={lettuce:["Lettuce leaves",15],tomato:["Tomato, sliced",30],onion:["Red onion, thinly sliced",15],pickles:["Chopped pickles",15],bacon:["Streaky bacon",30],egg:["Eggs, for frying",n+(n>1?" eggs":" egg")],avocado:["Ripe avocado, sliced",40],jalapeno:["Pickled jalapeños",8],caramel:["Onions, for caramelising",60]};
  const tops=Object.keys(TP).filter(has).map(k=>[TP[k][0],typeof TP[k][1]==="number"?G(TP[k][1]*n):TP[k][1]]);
  if(has("caramel"))tops.push(["Butter, for the onions",P1(5*n)+" g"]);
  const stack=[has("lettuce")&&"lettuce",PT.w+" patty"+(CH?" with "+CH[2]:""),has("bacon")&&"bacon",has("egg")&&"fried egg",has("avocado")&&"avocado",has("caramel")&&"caramelised onions",has("tomato")&&"tomato",has("onion")&&"red onion",has("pickles")&&"pickles",has("jalapeno")&&"jalapeños"].filter(Boolean);
  const st=["Buns: knead the flour, milk, egg, sugar, yeast and salt 8 minutes. Work in the butter. Rise 1 hour.","Divide into "+n+" balls, shape, proof 40 minutes and bake at 190 °C for 15 minutes. Cool."];
  if(has("caramel"))st.push("Onions: slice them thinly and cook slowly in the butter with a pinch of salt for 25 minutes, stirring now and then, until soft and golden.");
  st.push(PT.shape);
  if(has("bacon"))st.push("Fry the bacon in a dry pan until crisp, then drain it on paper.");
  st.push(PT.cook+(CH?" Lay the cheese on the patties for the last minute and cover with a lid so it melts.":"")+PT.rest);
  if(has("egg"))st.push("Fry the eggs in a little oil 2–3 minutes, until the whites are set and the yolk is still soft.");
  st.push("Stir the sauce ingredients together and toast the buns.","Build from the bottom: sauce on the bottom bun, then "+stack.join(", ")+". Add the top bun and press down gently.");
  return{title:n+" "+(CH?CH[2]+" ":"")+PT.w+" burger"+(n>1?"s":""),meta:[["clock","About 3 hours (buns)"],["burger","Patties "+G(meat)],["flame",PT.flame]],note:[PT.note],
   ing:PT.ing.concat([["Bun: flour",G(70*n)],["Bun: warm milk",G(40*n)],["Bun: egg",eggs(12*n)],["Bun: butter",G(8*n)],["Bun: sugar",P1(7*n)+" g"],["Bun: instant yeast",P1(Math.max(2,n)*.7)+" g"],["Bun: salt",P1(1.2*n)+" g"]],CH?[[CH[0],G(CH[1]*n)]]:[],SC.map(x=>[x[0],G(x[1]*n)]),tops),
   steps:st}}},
grill:{title:"What are we grilling?",sub:"Marinade amounts and cooking times by thickness.",
 ctl:[{k:"m",label:"Meat or fish",icon:"grill",def:"beef",tg:[["beef","Beef steak"],["pork","Pork chop"],["chicken","Chicken breast"],["lamb","Lamb chop"],["salmon","Salmon"],["prawn","Prawns"]]},
  {k:"d",label:"Doneness",icon:"flame",def:"mr",tg:[["rare","Rare"],["mr","Medium-rare"],["med","Medium"],["well","Well done"]],only:"beef"},
  {k:"h",label:"Thickness",icon:"ruler",def:2.5,step:[1,5,.5,"cm"],only:["beef","pork","chicken","lamb","salmon"]},{k:"w",label:"Weight",icon:"ruler",def:1000,step:[250,2000,250,"g"]}],
 calc(s){
  const D={rare:[1.2,"50 °C"],mr:[1.6,"55 °C"],med:[2,"60 °C"],well:[2.6,"71 °C"]}[s.d]||[1.6,"55 °C"],
   M={beef:{n:"Beef steak",k:D[0],t:D[1],m:"2–8 hours"},pork:{n:"Pork chop",k:2.2,t:"63 °C",m:"2–6 hours"},chicken:{n:"Chicken breast",k:3.2,t:"74 °C",m:"2–6 hours"},lamb:{n:"Lamb chop",k:1.8,t:"57 °C",m:"2–8 hours"},salmon:{n:"Salmon",k:1.8,t:"55 °C",m:"30 minutes"},prawn:{n:"Prawns",k:null,t:"pink and curled",m:"30 minutes"}}[s.m],
   mins=M.k?Math.round(M.k*s.h*2)/2:2,w=s.w;
  return{title:M.n+(M.k?", "+s.h+" cm":""),meta:[["clock",mins+" min per side"],["flame","Inside: "+M.t],["grill","Rest 5 min"]],note:["Times are for a hot grill or pan and are a guide. A thermometer is the sure way."+(s.m==="chicken"&&s.h>3?" Butterfly thick breasts so they cook evenly.":"")],
   ing:[["Oil",G(w*.05)],["Acid (lemon juice or vinegar)",G(w*.02)],["Salt",P1(w*.01)+" g"],["Honey or sugar",G(w*.01)],["Garlic",Math.max(1,Math.round(w/500))+" cloves"],["Herbs or spices",G(w*.005)]],
   steps:["Whisk the marinade ingredients and coat the meat. Marinate in the fridge "+M.m+" (no longer, the acid turns it mushy).","Take it out 20 minutes before cooking and pat dry so it browns instead of steaming.","Cook "+mins+" minutes per side on a very hot grill or pan, turning once.","Check the inside reaches "+M.t+", then rest 5 minutes before cutting."]}}},
sandwich:{title:"What are we stacking?",sub:"A filling that balances crunch, creamy and sharp.",
 ctl:[{k:"b",label:"Bread",icon:"sandwich",def:"bread",tg:[["bread","Sandwich"],["wrap","Wrap"],["toastie","Toastie"]]},{k:"f",label:"Filling",icon:"sandwich",def:"deli",tg:[["deli","Deli"],["chicken","Chicken"],["veg","Veggie"],["egg","Egg"]]},{k:"p",label:"How many",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,F={deli:[["Sliced ham or turkey",60],["Cheese",25],["Tomato",30],["Lettuce",15],["Mustard",5],["Pickles",15]],chicken:[["Cooked chicken, shredded",80],["Mayonnaise",20],["Celery, chopped",15],["Lettuce",15],["Lemon juice",3],["Spring onion",5]],
   veg:[["Hummus",40],["Cucumber",30],["Tomato",30],["Rocket",10],["Feta",25],["Olive oil",3]],egg:[["Eggs, boiled (2 per sandwich)",100],["Mayonnaise",15],["Mustard",3],["Lettuce or cress",10],["Salt",.5]]}[s.f],
   base=s.b==="wrap"?["Tortilla wraps",60]:["Bread (2 slices)",70],ing=[[base[0],G(base[1]*n)]].concat(F.map(x=>[x[0],x[1]<1?"a pinch":G(x[1]*n)]));
  if(s.b==="toastie"){ing.push(["Butter, for the outside",G(10*n)],["Extra cheese",G(30*n)])}
  return{title:({bread:"Sandwiches",wrap:"Wraps",toastie:"Toasties"})[s.b]+" with "+({deli:"deli meat",chicken:"chicken",veg:"hummus and veg",egg:"egg"})[s.f],meta:[["clock","10 min"],["sandwich","Makes "+n]],note:["Balance: something creamy, something crunchy and something sharp (pickles, mustard or lemon)."],ing,
   steps:s.b==="toastie"?["Butter the outside of the bread. Layer the filling and extra cheese inside.","Cook in a pan over medium heat 3 minutes per side under a weight, until golden and melted."]:s.b==="wrap"?["Warm the wraps for 10 seconds so they fold without cracking.","Spread the creamy part down the middle, add the rest, fold in the sides and roll tightly. Cut in half."]:["Spread the creamy part on both slices so the bread stays dry.","Layer the filling, putting the lettuce next to the bread. Press and cut."]}}},
salad:{title:"What are we tossing?",sub:"Bowls with a base, a protein, some crunch and a dressing.",
 ctl:[{k:"t",label:"Bowl",icon:"salad",def:"greek",tg:[["greek","Greek"],["asian","Asian slaw"],["mex","Mexican bowl"],["grain","Grain bowl"]]},{k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,B={greek:{n:"Greek salad",i:[["Tomatoes",120],["Cucumber",100],["Red onion",20],["Olives",25],["Feta",40]],d:[["Olive oil",15],["Lemon juice or red wine vinegar",7],["Dried oregano",.5]]},
   asian:{n:"Asian slaw",i:[["Cabbage, shredded",120],["Carrot, grated",50],["Cucumber",40],["Spring onion",10],["Peanuts",15],["Coriander",5]],d:[["Lime juice",15],["Soy sauce",8],["Sesame oil",4],["Honey",4]]},
   mex:{n:"Mexican bowl",i:[["Cooked rice",120],["Canned black beans, drained",80],["Sweetcorn",50],["Tomatoes",60],["Avocado",50],["Lettuce",30]],d:[["Lime juice",10],["Oil",8],["Ground cumin",.5]]},
   grain:{n:"Grain bowl",i:[["Cooked grain (quinoa, bulgur, rice)",120],["Roasted vegetables",150],["Canned chickpeas, drained",80],["Leaves",30]],d:[["Tahini",15],["Lemon juice",10],["Water",15]]}}[s.t],
   f=x=>[x[0],x[1]<1?"a pinch":G(x[1]*n)];
  return{title:B.n+" for "+n,meta:[["clock","15 min"],["salad","Serves "+n],["fridge","Dressing keeps 3 days"]],note:["Keep the dressing separate until you eat. It stays crisp for tomorrow."],ing:B.i.map(f).concat(B.d.map(x=>["Dressing: "+x[0],f(x)[1]])).concat([["Salt","to taste"]]),
   steps:["Chop everything into bite-size pieces.","Whisk the dressing ingredients with a pinch of salt.","Toss the salad with the dressing just before serving. Taste and adjust."]}}},
noodle:{title:"What are we slurping?",sub:"Noodles and a stir-fry sauce from pantry staples.",
 ctl:[{k:"n",label:"Noodles",icon:"noodle",def:"egg",tg:[["egg","Egg noodles"],["ramen","Ramen"],["udon","Udon (fresh)"],["soba","Soba"],["rice","Rice noodles"]]},{k:"s",label:"Sauce",icon:"sauce",def:"soy",tg:[["soy","Savoury soy"],["sweet","Sticky sweet"],["peanut","Peanut"]]},{k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,N={egg:["Egg noodles (dry)",80,4],ramen:["Ramen noodles (dry)",80,3],udon:["Udon noodles (fresh)",150,2],soba:["Soba noodles (dry)",80,5],rice:["Rice noodles (dry)",70,0]}[s.n],
   S={soy:[["Soy sauce",15],["Rice vinegar",5],["Sugar",3],["Sesame oil",3],["Cornflour",3],["Water",20]],sweet:[["Soy sauce",15],["Honey",10],["Rice vinegar",5],["Garlic, grated",3],["Water",20]],peanut:[["Peanut butter",20],["Soy sauce",10],["Lime juice",8],["Chilli flakes",.5],["Water",20]]}[s.s];
  return{title:"Stir-fried noodles for "+n,meta:[["clock","20 min"],["noodle",N[0].split(" (")[0]+" "+G(N[1]*n)]],note:[s.n==="rice"?"Soak rice noodles in hot (not boiling) water 10–20 minutes until flexible, then drain.":"Cook the noodles "+N[2]+" minutes, then rinse in cold water so they do not stick."],
   ing:[[N[0],G(N[1]*n)],["Vegetables, sliced",G(150*n)],["Chicken, tofu or prawns",G(100*n)],["Garlic",Math.max(1,n)+" cloves"],["Ginger",G(5*n)],["Oil",G(10*n)]].concat(S.map(x=>["Sauce: "+x[0],x[1]<1?"a pinch":G(x[1]*n)])),
   steps:["Whisk the sauce ingredients in a bowl.","Heat the oil in a wok on high heat. Cook the protein 3–4 minutes, then take it out.","Stir-fry the garlic and ginger 20 seconds, then the vegetables 3–4 minutes.","Add the noodles, protein and sauce. Toss 1–2 minutes until glossy and hot."]}}},
spice:{title:"What are we grinding?",sub:"Blends you make once and use all month.",
 ctl:[{k:"b",label:"Blend",icon:"spice",def:"garam",tg:[["garam","Garam masala"],["taco","Taco seasoning"],["ras","Ras el hanout"],["zaatar","Za'atar"],["cajun","Cajun"],["curry","Curry powder"]]},{k:"c",label:"Batch (tablespoons)",icon:"ruler",def:4,step:[2,16,2,""]}],
 calc(s){
  const B={garam:["Garam masala",[["Ground cumin",4],["Ground coriander",4],["Black pepper",2],["Ground cardamom",2],["Cinnamon",2],["Ground cloves",.5],["Nutmeg",1]],"Add at the end of cooking. Use 1–2 teaspoons per 500 g."],
   taco:["Taco seasoning",[["Chilli powder",4],["Ground cumin",3],["Smoked paprika",3],["Garlic powder",2],["Onion powder",2],["Dried oregano",1],["Salt",2]],"Use 2 tablespoons per 500 g of meat or beans, with a splash of water."],
   ras:["Ras el hanout",[["Ground cumin",3],["Ground coriander",3],["Ground ginger",2],["Cinnamon",2],["Turmeric",2],["Sweet paprika",2],["Black pepper",1],["Ground cardamom",1],["Allspice",1],["Cayenne",.5]],"Rub it on lamb or chicken, or stir 1 tablespoon into a tagine."],
   zaatar:["Za'atar",[["Dried thyme",4],["Sumac",3],["Toasted sesame seeds",3],["Salt",1]],"Mix with olive oil and spread on flatbread, or sprinkle on eggs and yogurt."],
   cajun:["Cajun seasoning",[["Sweet paprika",4],["Garlic powder",2],["Onion powder",2],["Dried oregano",1.5],["Dried thyme",1.5],["Cayenne",1],["Black pepper",1.5],["Salt",3]],"Great on chicken, prawns and potatoes. Cut the cayenne for a milder mix."],
   curry:["Curry powder",[["Ground coriander",4],["Ground cumin",3],["Turmeric",3],["Ground fenugreek",1],["Ground ginger",1],["Black pepper",1],["Chilli powder",1]],"Fry in oil for 30 seconds first to wake it up."]}[s.b],
   tot=B[1].reduce((a,x)=>a+x[1],0),g=s.c*7;
  return{title:B[0],meta:[["spice","About "+G(g)+" ("+s.c+" tbsp)"],["jar","Keeps 6 months"]],note:[B[2]],ing:B[1].map(x=>[x[0],P1(g*x[1]/tot)+" g"]),
   steps:["If you have whole spices, toast them in a dry pan for 1–2 minutes until fragrant, cool and grind.","Mix everything well in a bowl.","Store in a clean airtight jar, away from light and heat. Label it with the date."]}}},
frozen:{title:"What are we freezing?",sub:"Sorbet, ice cream and lollies with a soft scoop.",
 ctl:[{k:"t",label:"Make",icon:"icecream",def:"sorbet",tg:[["sorbet","Fruit sorbet"],["custard","Ice cream"],["nochurn","No-churn ice cream"],["lolly","Ice lollies"]]},{k:"a",label:"Batch",icon:"ruler",def:1000,step:[500,2000,250,"g"]}],
 calc(s){
  const a=s.a,k=a/1000,pt=(a*.9/250)|0;
  if(s.t==="sorbet")return{title:"Fruit sorbet",meta:[["clock","30 min + freezing"],["icecream","Makes about "+G(a)],["fridge","Best within 2 weeks"]],note:["The sugar is what keeps it scoopable. Very sweet fruit (mango, ripe peach) needs a little less."],ing:[["Fruit purée",G(a*.75)],["Sugar",G(a*.18)],["Lemon juice",G(a*.02)],["Water",G(a*.05)]],steps:["Warm the sugar and water until dissolved. Cool.","Blend with the fruit purée and lemon juice. Chill until very cold.","Churn in an ice cream machine 20–25 minutes. Or freeze in a tray and whisk every 45 minutes, 4 times.","Freeze until firm, and take out 10 minutes before scooping."]};
  if(s.t==="custard")return{title:"Vanilla ice cream",meta:[["clock","1 hour + freezing"],["icecream","Makes about "+G(a)],["fridge","Best within 2 weeks"]],note:["Cook the custard to 82 °C. No higher, or it scrambles."],ing:[["Whole milk",G(a*.5)],["Cream",G(a*.25)],["Egg yolks",Math.max(2,Math.round(a*.1/18))+" yolks"],["Sugar",G(a*.13)],["Vanilla",P1(5*k)+" g"]],steps:["Heat the milk, half the cream and the vanilla until steaming.","Whisk the yolks with the sugar until pale. Pour in the hot milk slowly, whisking.","Cook on low heat, stirring, until it coats the back of a spoon (82 °C). Strain into the cold cream.","Chill overnight, then churn and freeze."]};
  if(s.t==="nochurn")return{title:"No-churn ice cream",meta:[["clock","15 min + 6 h freezing"],["icecream","Makes about "+G(a*1.5)],["fridge","Best within 2 weeks"]],note:["The air whipped into the cream is what makes it soft."],ing:[["Cold whipping cream",G(a*.6)],["Sweetened condensed milk",G(a*.4)],["Vanilla",P1(5*k)+" g"]],steps:["Whip the cream to stiff peaks.","Fold in the condensed milk and vanilla.","Spoon into a container, cover and freeze at least 6 hours."]};
  return{title:"Ice lollies",meta:[["clock","10 min + 6 h freezing"],["icecream","About "+Math.max(4,Math.round(a/70))+" lollies"]],note:["A little sugar keeps them from freezing rock hard."],ing:[["Blended fruit or juice",G(a*.85)],["Sugar or honey",G(a*.08)],["Water",G(a*.07)]],steps:["Blend everything until smooth. Taste: it should be a bit too sweet, as freezing dulls sweetness.","Pour into moulds, add sticks after 1 hour and freeze 6 hours.","Run the mould under warm water for 10 seconds to release."]}}}
};

/* ---- one spinner per section: burger and pasta have hand-drawn art; every other section gets a base (bowl, pan, board, jar, glass) with its own colour,
   a big emoji in the middle and three more orbiting it. Same size and speed as every other spinner. ---- */
const emojiArt=(base,col,c,o)=>{
 const ik='style="stroke:var(--ink)" stroke-width="3"',dash='fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" stroke-dasharray="14 24"';
 const B={ // every base is seen from above and turns at the shared speed; the dashed rim (and handle / straw) makes the turn visible
  bowl:`<circle cx="120" cy="95" r="84" fill="${col}" ${ik}/><circle cx="120" cy="95" r="77" ${dash}/><circle cx="120" cy="95" r="70" fill="#f6efe0" ${ik}/>`,
  pan:`<rect x="186" y="88" width="40" height="15" rx="7.5" fill="#6b4a2b" ${ik}/><circle cx="120" cy="95" r="76" fill="#3b3b44" ${ik}/><circle cx="120" cy="95" r="70" ${dash}/><circle cx="120" cy="95" r="64" fill="${col}" ${ik}/>`,
  board:`<rect x="196" y="87" width="34" height="16" rx="8" fill="${col}" ${ik}/><circle cx="120" cy="95" r="84" fill="${col}" ${ik}/><circle cx="120" cy="95" r="74" ${dash}/><circle cx="220" cy="95" r="4" fill="#f6efe0" ${ik}/>`,
  jar:`<circle cx="120" cy="95" r="84" fill="#e9f5d0" fill-opacity=".9" ${ik}/><circle cx="120" cy="95" r="72" fill="${col}" fill-opacity=".85"/><circle cx="120" cy="95" r="78" ${dash}/>`,
  glass:`<circle cx="120" cy="95" r="84" fill="#e9f5fb" fill-opacity=".9" ${ik}/><circle cx="120" cy="95" r="72" fill="${col}" fill-opacity=".85"/><circle cx="120" cy="95" r="78" ${dash}/><path d="M130 86L164 28" ${ik} stroke-width="11" stroke-linecap="round"/><path d="M130 86L164 28" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`}[base];
 const R=base==="board"?60:base==="pan"?48:base==="bowl"?54:56;
 return `<div class="pgr"><svg viewBox="0 0 240 190" aria-hidden="true"><ellipse cx="120" cy="186" rx="64" ry="5" fill="rgba(0,0,0,.14)"/></svg><svg class="base" viewBox="0 0 240 190" aria-hidden="true">${B}</svg><div class="cem"><i>${c}</i></div><div class="ring">${o.map((e,k)=>`<div class="ing" style="--k:${k};--r:${Math.round(k*360/o.length)}deg;--R:${R}px"><u><i>${e}</i></u></div>`).join("")}</div></div>`};
/* ---- themed section spinners: each one is a little scene seen from above that turns at the shared speed (emoji sit on the turning base, like food on a turntable);
   sandwich is a side-view stack like the burger. SCENES[id](colour) returns the art. ---- */
const IK='style="stroke:var(--ink)" stroke-width="3"',DASH='fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" stroke-dasharray="14 24"';
const CI=(r,f,x="")=>`<circle cx="120" cy="95" r="${r}" fill="${f}" ${IK} ${x}/>`,RG=r=>`<circle cx="120" cy="95" r="${r}" ${DASH}/>`;
const EM=(e,r,a,s=30,t=0)=>{const x=(120+r*Math.cos(a*Math.PI/180)).toFixed(1),y=(95+r*Math.sin(a*Math.PI/180)).toFixed(1);return `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" dominant-baseline="central" transform="rotate(${t} ${x} ${y})">${e}</text>`};
const SPI="M0 0a4 4 0 0 1 8 0a8 8 0 0 1-16 0a12 12 0 0 1 24 0a16 16 0 0 1-32 0a20 20 0 0 1 40 0a24 24 0 0 1-48 0a28 28 0 0 1 56 0";
const SW=(s,w,c,o=1)=>`<path d="${SPI}" transform="translate(120 95) scale(${s})" fill="none" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"/>`;
const RR=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const SC=inner=>`<div class="pgr"><svg viewBox="0 0 240 190" aria-hidden="true"><ellipse cx="120" cy="186" rx="64" ry="5" fill="rgba(0,0,0,.14)"/></svg><svg class="base" viewBox="0 0 240 190" aria-hidden="true">${inner}</svg></div>`;
const HANDLE=(c,x=186,w=40)=>`<rect x="${x}" y="87" width="${w}" height="16" rx="8" fill="${c}" ${IK}/>`;
const EGG=(x,y,s,t)=>`<g transform="translate(${x} ${y}) rotate(${t}) scale(${s})"><path d="M-22 -6C-30 -22 -6 -30 6 -22C24 -26 34 -4 24 8C28 24 6 32 -6 24C-24 30 -34 8 -22 -6Z" fill="#fffdf5" ${IK} stroke-width="2.5" stroke-linejoin="round"/><circle cx="1" cy="0" r="9" fill="#ffb81c" ${IK} stroke-width="2"/><circle cx="-2" cy="-3" r="2.6" fill="#fff" fill-opacity=".8"/></g>`;
const LAY=(k,d)=>`<g class="bl" style="--k:${k}">${d}</g>`;
const SCENES={
 soup:c=>SC(HANDLE("#8a2f1b",192,34)+`<rect x="14" y="87" width="34" height="16" rx="8" fill="#8a2f1b" ${IK}/>`+CI(84,c)+RG(77)+CI(70,"#5a2a22")+CI(64,"#f0a03c")+SW(1.8,2.6,"#fff",.4)+[[30,40],[-50,34],[110,48],[190,26]].map(([a,r])=>`<circle cx="${(120+r*Math.cos(a*.01745)).toFixed(0)}" cy="${(95+r*Math.sin(a*.01745)).toFixed(0)}" r="5" fill="rgba(255,255,255,.55)" ${IK} stroke-width="2"/>`).join("")+EM("🥕",42,20,30,30)+EM("🧅",42,95,28)+EM("🍅",42,170,28)+EM("🥔",42,245,28,20)+EM("🌿",42,320,24,-20)+EM("🧄",16,60,22)),
 dumpling:c=>SC(CI(84,c)+RG(78)+CI(68,"#e8c98b")+[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<path d="M120 95L${(120+68*Math.cos(i*Math.PI/6)).toFixed(1)} ${(95+68*Math.sin(i*Math.PI/6)).toFixed(1)}" stroke="#b9853f" stroke-width="2.2"/>`).join("")+`<circle cx="120" cy="95" r="40" fill="none" stroke="#b9853f" stroke-width="2.2"/>`+[0,72,144,216,288].map((a,i)=>EM("🥟",44,a+18,32,Math.round(RR(i+3)*360))).join("")+EM("🥟",0,0,30,Math.round(RR(9)*360))),
 grill:c=>SC(CI(84,"#2f2f36")+`<circle cx="120" cy="95" r="79" fill="none" stroke="#ff8a2a" stroke-opacity=".75" stroke-width="4" stroke-dasharray="6 9" stroke-linecap="round"/>`+[62,42,22].map(r=>`<circle cx="120" cy="95" r="${r}" fill="none" stroke="#6b6b76" stroke-width="3"/>`).join("")+[0,1,2,3,4,5,6,7].map(i=>`<path d="M120 95L${(120+70*Math.cos(i*Math.PI/4)).toFixed(1)} ${(95+70*Math.sin(i*Math.PI/4)).toFixed(1)}" stroke="#55555f" stroke-width="3"/>`).join("")+EM("🥩",46,-25,36,20)+EM("🍗",46,95,34,-30)+EM("🌽",46,215,34,35)+EM("🍄",20,40,24)+EM("🌶️",20,160,24,40)+EM("🥕",20,280,24,-30)),
 salad:c=>SC(CI(84,c)+RG(77)+CI(70,"#f6efe0")+CI(64,"#8fd36a")+[[60,14,22,40],[150,18,26,-20],[240,12,30,10],[310,16,20,60],[30,40,24,0],[200,44,22,30]].map(([a,r,rx,t])=>`<ellipse cx="${(120+r*Math.cos(a*.01745)+14).toFixed(0)}" cy="${(95+r*Math.sin(a*.01745)).toFixed(0)}" rx="${rx}" ry="9" transform="rotate(${t} 120 95)" fill="#6fbf4a" fill-opacity=".7"/>`).join("")+EM("🥒",42,10,28,20)+EM("🍅",42,80,28)+EM("🫒",42,150,22)+EM("🥕",42,220,28,-30)+EM("🧅",42,290,24)+EM("🥑",14,40,26)+EM("🌽",18,200,24,50)),
 noodle:c=>SC(CI(84,c)+RG(77)+CI(70,"#f6efe0")+CI(64,"#e0a14a")+SW(2,5.4,"#2a1a13")+SW(2,3.2,"#f7e2a0")+EM("🥚",42,35,28)+EM("🍥",42,150,28)+EM("🥬",42,265,28,-20)+EM("🥢",40,210,32,40)),
 bread:c=>SC(`<rect x="196" y="87" width="34" height="16" rx="8" fill="${c}" ${IK}/>`+CI(84,c)+RG(75)+Array.from({length:22},(_,i)=>`<circle cx="${(120+Math.sqrt(RR(i+7))*64*Math.cos(RR(i)*6.28)).toFixed(0)}" cy="${(95+Math.sqrt(RR(i+7))*64*Math.sin(RR(i)*6.28)).toFixed(0)}" r="${(1.5+RR(i+30)*2).toFixed(1)}" fill="#fff" fill-opacity=".6"/>`).join("")+`<circle cx="220" cy="95" r="4" fill="#f6efe0" ${IK}/>`+EM("🍞",44,-20,40,10)+EM("🥖",44,100,40,-35)+EM("🥐",44,215,36,20)+EM("🥨",12,30,28)+EM("🌾",44,320,24,30)),
 grain:c=>SC(CI(84,c)+RG(77)+CI(70,"#f6efe0")+CI(63,"#f3e3b8")+Array.from({length:34},(_,i)=>`<ellipse cx="${(120+Math.sqrt(RR(i+5))*58*Math.cos(RR(i+60)*6.28)).toFixed(0)}" cy="${(95+Math.sqrt(RR(i+5))*58*Math.sin(RR(i+60)*6.28)).toFixed(0)}" rx="4.5" ry="2" transform="rotate(${Math.round(RR(i+90)*180)} ${(120+Math.sqrt(RR(i+5))*58*Math.cos(RR(i+60)*6.28)).toFixed(0)} ${(95+Math.sqrt(RR(i+5))*58*Math.sin(RR(i+60)*6.28)).toFixed(0)})" fill="#fffaf0"/>`).join("")+EM("🍚",0,0,36)+EM("🥕",40,30,26)+EM("🧅",40,150,24)+EM("🌾",40,270,26,20)),
 bake:c=>SC(CI(84,"#c9ced6")+RG(77)+CI(70,"#aeb4bd")+CI(64,"#f7c6d4")+Array.from({length:12},(_,i)=>`<circle cx="${(120+52*Math.cos(i*Math.PI/6)).toFixed(1)}" cy="${(95+52*Math.sin(i*Math.PI/6)).toFixed(1)}" r="6" fill="#fff" ${IK} stroke-width="2"/>`).join("")+EM("🍒",0,0,36)+[0,72,144,216,288].map(a=>EM("🍓",30,a,22,a)).join("")),
 drinks:c=>SC(CI(84,"#e9f5fb")+CI(72,c,'fill-opacity=".9"')+RG(78)+[[40,30,14],[160,36,-18],[270,30,28]].map(([a,r,t])=>`<rect x="${(120+r*Math.cos(a*.01745)-12).toFixed(0)}" y="${(95+r*Math.sin(a*.01745)-12).toFixed(0)}" width="24" height="24" rx="6" transform="rotate(${t} ${(120+r*Math.cos(a*.01745)).toFixed(0)} ${(95+r*Math.sin(a*.01745)).toFixed(0)})" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-width="2"/>`).join("")+EM("🍋",42,-60,36,10)+EM("🍊",42,100,32)+EM("🌿",44,205,28,-40)+`<path d="M130 86L164 28" ${IK} stroke-width="11" stroke-linecap="round"/><path d="M130 86L164 28" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`),
 sauce:c=>SC(HANDLE("#6b4a2b")+CI(76,"#3b3b44")+RG(70)+CI(64,c)+SW(1.8,3,"#fff",.45)+EM("🍅",44,30,30)+EM("🧄",44,150,26)+EM("🌿",44,270,28,20)+EM("🌶️",18,210,24,30)),
 eggs:c=>SC(HANDLE("#6b4a2b")+CI(76,"#3b3b44")+RG(70)+CI(64,"#55555f")+EGG(98,76,1,-15)+EGG(146,114,.92,20)+EM("🍄",42,215,26,20)+EM("🧈",44,-30,24,30)+EM("🥓",20,45,26,-40)),
 jam:c=>SC(CI(84,"#e9f5d0",'fill-opacity=".9"')+RG(78)+`<circle cx="120" cy="95" r="58" fill="${c}" ${IK}/><circle cx="120" cy="95" r="52" fill="#fff" stroke="#d63a22" stroke-width="7" stroke-dasharray="9 7"/><circle cx="120" cy="95" r="44" fill="none" stroke="#c9a26a" stroke-width="3"/>`+EM("🍓",0,0,36)+EM("🍓",70,0,24)+EM("🍑",70,72,24)+EM("🍇",70,144,24)+EM("🍋",70,216,24)+EM("🍒",70,288,24)),
 dairy:c=>SC(CI(84,"#8fb8de")+RG(77)+CI(70,"#f6efe0")+CI(62,"#fffaf0")+SW(1.7,4,"#e9dcc0")+EM("🧀",40,40,28,20)+EM("🧈",40,160,26)+EM("🍯",40,280,26)),
 spice:c=>SC(CI(84,"#9a9aa3")+RG(77)+CI(70,"#6d6d76")+CI(62,c)+Array.from({length:30},(_,i)=>`<circle cx="${(120+Math.sqrt(RR(i+2))*54*Math.cos(RR(i+40)*6.28)).toFixed(0)}" cy="${(95+Math.sqrt(RR(i+2))*54*Math.sin(RR(i+40)*6.28)).toFixed(0)}" r="${(2+RR(i+70)*2).toFixed(1)}" fill="${["#8a3a10","#e8a33a","#b5481c","#f3d27a"][i%4]}"/>`).join("")+`<rect x="116" y="87" width="66" height="16" rx="8" fill="#d9d0c0" ${IK}/><circle cx="182" cy="95" r="9" fill="#d9d0c0" ${IK}/>`+EM("🌶️",42,115,26,20)+EM("🧄",42,195,24)+EM("🌿",42,275,26,-30)),
 frozen:c=>SC(CI(84,c)+RG(77)+CI(70,"#f6efe0")+[[30,"#f7b6cc"],[150,"#fff1c9"],[270,"#b6e8cf"]].map(([a,f])=>{const x=120+34*Math.cos(a*.01745),y=95+34*Math.sin(a*.01745);return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="26" fill="${f}" ${IK}/><path d="M${(x-14).toFixed(0)} ${(y-8).toFixed(0)}q8-12 20-8" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>`}).join("")+EM("🍒",0,0,28)+EM("🍓",50,90,18)+EM("🍫",50,210,18)+EM("🍋",50,330,18)),
 sandwich:()=>`<div class="bgr"><svg viewBox="0 0 240 190" aria-hidden="true"><ellipse cx="120" cy="180" rx="78" ry="7" fill="rgba(0,0,0,.14)"/>`+
  LAY(0,`<rect x="44" y="144" width="152" height="24" rx="11" fill="#e8c98b" ${IK}/><path d="M60 156h120" stroke="#fff3cf" stroke-width="3" stroke-linecap="round"/>`)+
  LAY(1,`<path d="M40 136q9.5 10 19 0t19 0t19 0t19 0t19 0t19 0t19 0t19 0v12H40z" fill="#f4a3a3" ${IK} stroke-linejoin="round"/>`)+
  LAY(2,`<path d="M46 124h148v8h-40l-10 12-10-12H46z" fill="#ffc63d" ${IK} stroke-linejoin="round"/>`)+
  LAY(3,`<ellipse cx="82" cy="119" rx="30" ry="6.5" fill="#d63a22" ${IK}/><ellipse cx="158" cy="119" rx="30" ry="6.5" fill="#d63a22" ${IK}/>`)+
  LAY(4,`<path d="M38 108q9.5 10 19 0t19 0t19 0t19 0t19 0t19 0t19 0t19 0t19 0v6H38z" fill="#5fbf6a" ${IK} stroke-linejoin="round"/>`)+
  LAY(5,`<path d="M44 106v-14q0-18 18-18h116q18 0 18 18v14z" fill="#e8c98b" ${IK} stroke-linejoin="round"/><path d="M66 88h108" stroke="#fff3cf" stroke-width="3" stroke-linecap="round"/>`)+`</svg></div>`};
/* id: [button label, spinner caption, base, colour, centre emoji, orbiting emojis] */
const SPIN={
 bread:["Spin a bread!","Kneading the dough…","board","#c98a3a","🍞",["🌾","🧈","🥖"]],
 grain:["Spin a grain dish!","Fluffing the grains…","bowl","#e07a3a","🍚",["🌾","🥕","🧅"]],
 bake:["Spin a bake!","Preheating the oven…","board","#e58fa6","🧁",["🥚","🧈","🍫"]],
 drinks:["Spin a drink!","Shaking it up…","glass","#f5a623","🍹",["🍋","🍊","🌿"]],
 soup:["Spin a soup!","Stirring the pot…","bowl","#d95f3b","🍲",["🥕","🧅","🍅"]],
 sauce:["Spin a sauce!","Whisking it together…","jar","#d63a22","🥫",["🍅","🧄","🌿"]],
 eggs:["Spin an egg dish!","Cracking the eggs…","pan","#ffd35c","🍳",["🥚","🧈","🍄"]],
 jam:["Spin a jam!","Bubbling the fruit…","jar","#a33a6b","🍓",["🍑","🍇","🍋"]],
 dairy:["Spin a dairy ferment!","Warming the milk…","jar","#fff1c9","🥛",["🧀","🧈","🥣"]],
 dumpling:["Spin a dumpling!","Pleating the dumplings…","bowl","#c9a26a","🥟",["🧄","🥬","🌶️"]],
 grill:["Spin a grill!","Heating the grill…","pan","#7a3b1d","🥩",["🔥","🌶️","🍋"]],
 sandwich:["Spin a sandwich!","Stacking the filling…","board","#d9a45a","🥪",["🍅","🥬","🧀"]],
 salad:["Spin a salad!","Tossing the leaves…","bowl","#5fbf6a","🥗",["🥒","🍅","🫒"]],
 noodle:["Spin a noodle dish!","Tossing the wok…","bowl","#c0392b","🍜",["🥢","🌶️","🥬"]],
 spice:["Spin a spice blend!","Grinding the spices…","jar","#c9741a","🌶️",["🧄","🌿","🧂"]],
 frozen:["Spin a frozen treat!","Churning it up…","glass","#f4a6c0","🍨",["🍓","🍦","🍋"]]};
const CRAFT_ARTS={burger:BURGER_ART,pasta:PASTA_ART};
Object.keys(SPIN).forEach(id=>{if(TOOLS[id])CRAFT_ARTS[id]=SCENES[id]?SCENES[id](SPIN[id][3]):emojiArt(SPIN[id][2],SPIN[id][3],SPIN[id][4],SPIN[id][5])});
window.__craftArts=CRAFT_ARTS;
const autoSpin=T=>s=>{T.ctl.forEach(c=>{if(c.tg)s[c.k]=c.tg[Math.floor(Math.random()*c.tg.length)][0]})}; // a random option for every choice; amounts and people stay as set
Object.keys(TOOLS).forEach(id=>{const T=TOOLS[id],sp=SPIN[id];
 T.art=CRAFT_ARTS[id];if(sp){T.spinLabel=T.spinLabel||sp[0];T.spinNote=T.spinNote||sp[1]}
 if(!T.spin)T.spin=autoSpin(T);
 if(!T.names)T.names=[...new Set(T.ctl.filter(c=>c.tg&&!c.only).flatMap(c=>c.tg.map(o=>o[1])))]});
TOOLS.grill.main="m"; // Doneness and Thickness depend on the meat (key m), not on key t

const cfg=id=>{const o=ST[id]=ST[id]||{};TOOLS[id].ctl.forEach(c=>{if(o[c.k]===undefined)o[c.k]=c.def});return o};
function draw(id){
 const T=TOOLS[id],s=cfg(id),root=document.getElementById("tab-"+id);if(!root)return;
 const vis=T.ctl.filter(c=>!c.only||[].concat(c.only).includes(s[T.main||"t"]));
 const ctl=vis.map(c=>`<div class="lab"${c===vis[0]?"":' style="margin-top:16px"'}>${I(c.icon)}${esc(c.label)}</div>`+(c.tg?`<div class="tg">${c.tg.map(o=>`<button data-k="${c.k}" data-v="${esc(o[0])}" aria-pressed="${String(s[c.k])===String(o[0])}">${esc(o[1])}</button>`).join("")}</div>`
   :c.ms?`<div class="tg">${c.ms.map(o=>`<button data-k="${c.k}" data-m="${esc(o[0])}" aria-pressed="${(s[c.k]||[]).includes(o[0])}">${esc(o[1])}</button>`).join("")}</div>`
   :`<div class="step"><button data-k="${c.k}" data-d="-1" aria-label="Less">${I("minus")}</button><b>${s[c.k]||people}${c.step[3]?" "+c.step[3]:""}</b><button data-k="${c.k}" data-d="1" aria-label="More">${I("plus")}</button></div>`)).join("");
 const r=T.calc(s);
 root.querySelector("[data-ctl]").innerHTML=ctl;
 root.querySelector("[data-out]").innerHTML=`<article class="card"><div class="hero"><div class="ic">${I(T.icon)}</div><h2>${esc(r.title)}</h2></div><div class="body">
  <div class="meta">${r.meta.map(m=>`<span>${I(m[0])}${esc(m[1])}</span>`).join("")}</div>
  ${(r.note||[]).map(n=>`<div class="call" style="background:var(--soft)">${I("flame")}<span>${esc(n)}</span></div>`).join("")}
  <div class="split"><div><h3>${I("list")}Ingredients <small style="text-transform:none;letter-spacing:0;color:var(--mute)">(tap to tick off)</small></h3><ul class="ing">${r.ing.map(i=>`<li><span>${esc(i[0])}</span><span class="q">${esc(i[1])}</span></li>`).join("")}</ul></div>
  <div><h3>${I("chef")}Method</h3><ol>${r.steps.map(x=>`<li><span>${esc(x)}</span></li>`).join("")}</ol></div></div>
  <div class="row"><button class="go" data-a="start">${I("flame")}Start cooking</button><button class="pzsave">${I("heart")}Save</button><button data-a="copy" data-copy>${I("cart")}Copy list</button><button data-a="share">${I("share")}Share</button><button type="button" data-a="rand" data-spin>Spin again</button></div></div></article>`;
 root.querySelectorAll(".ing li").forEach(li=>li.onclick=()=>li.classList.toggle("done"));
 decorate(id,T,r,root,s);
 root.querySelector("[data-copy]").onclick=e=>{const b=e.currentTarget,txt=r.title+"\n"+r.ing.map(i=>"• "+i[0]+" – "+i[1]).join("\n");
  (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>{b.innerHTML=I("check")+"Copied"},()=>{})};
}
/* ---- card buttons: the same set and order as the Cook card: Start cooking · Spin again, then Save · Copy list · Share · Like · Not for me ---- */
const FK="mr-craftfav",favs=()=>{try{return JSON.parse(localStorage.getItem(FK)||"[]")||[]}catch(e){return[]}},setFavs=f=>{try{localStorage.setItem(FK,JSON.stringify(f.slice(0,60)))}catch(e){}};
function drawFavs(id){
 const root=document.getElementById("tab-"+id),el=root&&root.querySelector("[data-fav]");if(!el)return;
 const f=favs().filter(x=>x.id===id);
 el.innerHTML=f.length?`<h3>${I("heart")}Saved</h3>`+f.map((x,i)=>`<button data-fi="${i}">${I("heart")}${esc(x.title)}</button>`).join(""):"";
 el.onclick=e=>{const b=e.target.closest("button[data-fi]");if(!b)return;const x=f[+b.dataset.fi];if(!x)return;Object.assign(cfg(id),x.s);save();draw(id);const c=root.querySelector(".card");if(c)c.scrollIntoView({behavior:"smooth",block:"start"})};
}
function decorate(id,T,r,root,s){
 const row=root.querySelector("[data-out] .row");if(!row)return;
 const go=row.querySelector("[data-a=start]"),sv=row.querySelector(".pzsave"),sh=row.querySelector("[data-a=share]"),sig=JSON.stringify(s);
 go.onclick=()=>{if(window.__cook)window.__cook({title:r.title,steps:r.steps})};
 const has=()=>favs().some(x=>x.id===id&&x.sig===sig),paint=()=>{sv.setAttribute("aria-pressed",String(has()));sv.innerHTML=I("heart")+(has()?"Saved":"Save")};
 sv.onclick=()=>{let f=favs();if(has())f=f.filter(x=>!(x.id===id&&x.sig===sig));else f.unshift({id,title:r.title,sig,s:JSON.parse(sig)});setFavs(f);paint();drawFavs(id);navigator.vibrate&&navigator.vibrate(15)};paint();
 sh.onclick=async()=>{const text=r.title+"\n\nIngredients\n"+r.ing.map(i=>"• "+i[0]+" – "+i[1]).join("\n")+"\n\nMethod\n"+r.steps.map((x,k)=>(k+1)+". "+x).join("\n")+"\n\nMade with Meal Roulette";
  try{if(navigator.share)await navigator.share({title:r.title,text});else{await navigator.clipboard.writeText(text);sh.innerHTML=I("share")+"Copied";setTimeout(()=>{sh.innerHTML=I("share")+"Share"},2000)}}catch(e){}};
 try{const m=root.querySelector("[data-out] .meta");if(m&&window.__noteBlock)m.after(window.__noteBlock(r.title))}catch(e){}
 if(window.__thumbs)window.__thumbs(row,r.title,{craft:id},()=>spinTool(id));
 if(window.__tidyRow)window.__tidyRow(row,T.icon);
}

/* spin a random build: full-screen spinner with the tool's own art and a name ticker, then the card (same rhythm as Cook, Pizza and Ferment) */
const SPINNING={};
function spinTool(id,instant){
 const T=TOOLS[id],root=document.getElementById("tab-"+id);if(!T||!T.spin||!root||SPINNING[id])return;
 const done=()=>{T.spin(cfg(id));save();draw(id);const c=root.querySelector(".card");if(c)c.scrollIntoView({behavior:"smooth",block:"start"})};
 if(instant||matchMedia("(prefers-reduced-motion:reduce)").matches||(window.mrNoSpin&&mrNoSpin())||!window.mrSpinNames||!T.art)return done();
 SPINNING[id]=1;const bs=[...root.querySelectorAll("[data-spin]")];bs.forEach(b=>b.disabled=true);
 const rl=document.createElement("div");rl.className="reel on";rl.setAttribute("aria-hidden","true");
 rl.innerHTML=`<div class="stage"><div class="art on">${T.art}</div></div><div class="rtx"><span class="rt"></span><small>${esc(T.spinNote||"Picking something tasty…")}</small></div>`;
 document.body.appendChild(rl);
 mrSpinNames(rl.querySelector(".rt"),T.names||[T.title],()=>{rl.remove();bs.forEach(b=>b.disabled=false);SPINNING[id]=0;done()});
}
Object.keys(TOOLS).forEach(id=>{
 const T=TOOLS[id],root=document.getElementById("tab-"+id);if(!root)return;
 T.icon=T.icon||({bread:"bread",grain:"rice",bake:"cupcake",drinks:"drinks",pasta:"pasta",soup:"soup",sauce:"sauce",eggs:"egg",jam:"jam",dairy:"dairy",dumpling:"dumpling",burger:"burger",grill:"grill",sandwich:"sandwich",salad:"salad",noodle:"noodle",spice:"spice",frozen:"icecream"})[id]||"chef";
 root.innerHTML=`<h1 class="hl">${esc(T.title)}</h1><p>${esc(T.sub)}</p><div class="cols"><aside class="side"><section class="panel" data-ctl></section>${T.spin?`<button type="button" class="fmspin" data-spin>${I(T.icon)}${esc(T.spinLabel||"Spin!")}</button>`:""}<div class="fav" data-fav></div></aside><section class="res"><div data-out></div></section></div>
  <section class="panel"><div class="lab">${I(T.icon)}Recipes</div><p class="hint" data-n></p><ul class="bklist" data-l></ul><button type="button" class="stubmore" hidden></button></section>`;
 root.querySelector("[data-ctl]").addEventListener("click",e=>{
  const b=e.target.closest("button[data-k]");if(!b)return;const s=cfg(id),c=T.ctl.find(x=>x.k===b.dataset.k);
  if(b.dataset.m!==undefined){const a=Array.isArray(s[c.k])?s[c.k]:[];s[c.k]=a.includes(b.dataset.m)?a.filter(x=>x!==b.dataset.m):[...a,b.dataset.m]}
  else if(b.dataset.d){const[lo,hi,by]=c.step,v=(s[c.k]||people)+(+b.dataset.d)*by;s[c.k]=Math.min(hi,Math.max(lo,v))}
  else{const o=c.tg.find(x=>String(x[0])===b.dataset.v);s[c.k]=o?o[0]:b.dataset.v}
  save();draw(id)});
 root.addEventListener("click",e=>{const b=e.target.closest("[data-spin]");if(b&&!b.disabled)spinTool(id)});
 draw(id);drawFavs(id);
});

window.CRAFT={tools:TOOLS,cfg,spin:spinTool,redraw:()=>Object.keys(TOOLS).forEach(id=>{if(document.getElementById("tab-"+id)){draw(id);drawFavs(id)}})};
})();
