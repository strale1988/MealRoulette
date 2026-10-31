/* craft/craft-pizza.js — Pizza night: dough styles, classic pizzas and a remix generator.
   Load order: kitchen.js, ingredients.js, cookbook-*.js, craft/craft-pizza.js, craft/craft-ferment.js, craft/craft-lib.js, craft/craft-*.js, craft.js, xlink.js, engine.js
   Everything is data-driven: a dough STYLE (baker's percentages, ferment, oven) + a SAUCE + toppings from the catalog.
   Dough amounts are computed from the percentages, so every style scales to any number of pizzas.
   Authoring guide: COOKBOOK.md (Pizza night). Validated by: node tools/check.js */
(function(){
"use strict";
const K=window.KITCHEN,PZ=window.PIZZA={styles:{},recipes:[],themes:{},groups:[],cats:[]};
const bad=(who,msg)=>K.problems.push({lvl:"error",who:"pizza "+who,msg});
const cap=s=>s[0].toUpperCase()+s.slice(1),rnd=a=>a[Math.floor(Math.random()*a.length)],shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const nm=id=>K.name(id).toLowerCase();
const rg=a=>a<5?Math.round(a*10)/10:a<50?Math.round(a):a<500?Math.round(a/5)*5:Math.round(a/10)*10;
const num=(a,u)=>u==="pcs"?String(Math.max(1,Math.round(a))):String(rg(a));
const gtxt=(a,u)=>u==="pcs"?num(a,u)+" pcs":rg(a)+" g";
const Q=(id,a,u)=>(u==="pcs"?num(a,u):gtxt(a,"g"))+" "+nm(id);

/* ------------------------------------------------------------------ dough styles
   A style is the FORMULA and the shaping/baking. How long it ferments is chosen separately (MODES below), so any style
   can be made same-day, overnight, or with a 24/48/72 h cold ferment, with or without a poolish.
   flours:[[id,share]] liq:[[id,%]] (default water at hyd %) salt oil sugar extra:[[id,%]] — all baker's percentages of the flour.
   y:1 = yeasted (the amount comes from the fermentation mode). ball: grams of dough per pizza/pan. size: topping multiplier vs a 30 cm pizza.
   kind: round | pan | fried | flat. rest: time out of the fridge before shaping. pan/panProof: tin prep and final proof for pan styles.
   Sources for the formulas: AVPN Neapolitan specification (55–62 % hydration, 40–60 g salt per litre of water, 200–280 g balls);
   home-baker formulas for NY, Roman, Detroit, Sicilian etc. (60–82 % hydration, 2–2.8 % salt). */
const S=PZ.styles;
const mk=(id,o)=>{S[id]=Object.assign({id,kind:"round",place:"std",feeds:1.5,size:1,sugar:0,oil:0,y:1,salt:2,extra:[],knead:"Knead on the counter for 8–10 minutes (or 5 in a mixer) until smooth and elastic.",fat:"olive-oil",def:"cold24",rest:"2 hours",panProof:"1 hour"},o)};
mk("neapolitan",{name:"Neapolitan",grp:"Round",from:"Naples",desc:"Soft, puffy, blistered crust with a thin centre. High-protein flour, a long ferment and the hottest oven you have.",
 flours:[["pizza-flour",100]],hyd:62,salt:2.8,ball:250,size:1,feeds:1.5,def:"cold48",rest:"2–3 hours",t:"250–275 °C",bt:"6–8 min",
 heat:"Put a pizza steel or stone on the top third of the oven and preheat on the highest setting (250–275 °C) for a full 45–60 minutes.",
 shape:"Flour a ball and press from the centre outwards with your fingertips, leaving a 1.5 cm rim untouched. Stretch over the backs of your hands to about 30 cm. No rolling pin, it knocks out the air.",
 bake:"Slide the pizza onto the hot steel and bake 6–8 minutes until the rim is puffed and spotted with char. For the last minute, switch the grill on to blister the top."});
mk("roman-tonda",{name:"Roman tonda (thin and crisp)",grp:"Round",from:"Rome",desc:"Very thin, crackly and light. Rolled out with a pin, baked until it shatters.",
 flours:[["bread-flour",100]],hyd:58,salt:2.5,oil:3,ball:170,size:.8,feeds:1.2,rest:"1–2 hours",t:"250–275 °C",bt:"8–10 min",
 heat:"Put a steel, stone or upside-down heavy tray on the top third of the oven and preheat at the maximum (250–275 °C) for 45 minutes.",
 shape:"Roll each ball with a pin on a floured surface to about 30 cm, so thin you can almost see the counter. Prick all over with a fork so it doesn't puff.",
 bake:"Bake 8–10 minutes on the hot surface until crisp and golden, with brown spots underneath."});
mk("roman-teglia",{name:"Roman al taglio (tray pizza)",grp:"Tray and pan",from:"Rome",desc:"Airy, high-hydration dough baked in a tray and sold by the slice. Crisp base, open crumb.",
 flours:[["bread-flour",100]],hyd:78,salt:2.2,oil:3,ball:550,size:1.8,feeds:4,kind:"pan",def:"cold48",panProof:"2–3 hours",t:"250 °C",bt:"16–20 min",
 knead:"Don't knead: stir until combined, rest 30 minutes, then do 3 sets of stretch-and-folds 30 minutes apart.",
 pan:"Oil a 40×30 cm tray generously. Tip the dough in and stretch it gently towards the corners (rest 15 minutes if it springs back).",
 heat:"Heat the oven to 250 °C with a rack on the lower third.",
 shape:"Dimple the dough all over with oiled fingertips, pressing to the base of the tray.",
 bake:"Bake on the lower rack for 16–20 minutes until the edges and base are deep golden. Cut with scissors or a big knife and serve in squares."});
mk("pinsa",{name:"Pinsa-style (oval, super light)",grp:"Round",from:"Rome",desc:"Oval, very high hydration and a long cold ferment: crisp outside, cloud-like inside.",
 flours:[["bread-flour",100]],hyd:80,salt:2.2,oil:2,ball:280,size:1,feeds:1.5,def:"cold48",rest:"1 hour",t:"250 °C",bt:"8–10 min",
 knead:"Mix with wet hands until no dry flour remains, rest 30 minutes, then do 3 stretch-and-folds 30 minutes apart.",
 heat:"Preheat a steel or stone at 250 °C for 45 minutes. Use plenty of semolina or flour on the peel: the dough is sticky.",
 shape:"Stretch gently into an oval about 35×20 cm on a floured peel, dimpling with your fingertips.",
 bake:"Bake 8–10 minutes until golden with dark spots."});
mk("ny",{name:"New York",grp:"Round",from:"New York",desc:"Large, foldable slices with a chewy, crisp-bottomed crust. Bread flour and a cold ferment.",
 flours:[["bread-flour",100]],hyd:62,salt:2,oil:2,sugar:1.5,ball:300,size:1.2,feeds:2,def:"cold48",rest:"1½–2 hours",t:"260 °C",bt:"8–10 min",
 heat:"Preheat a steel or stone at 260 °C (or your maximum) for 45–60 minutes.",
 shape:"Press out from the centre, then stretch over your knuckles to about 33 cm. Keep the rim slightly thicker.",
 bake:"Bake 8–10 minutes on the steel until the crust is deeply golden with brown spots and the cheese is bubbling."});
mk("detroit",{name:"Detroit",grp:"Tray and pan",from:"Detroit",desc:"Thick, airy and crisp-fried in a pan, with cheese baked right to the edges into a caramelised lace.",
 flours:[["bread-flour",100]],hyd:72,salt:2,oil:2,ball:400,size:1.5,feeds:3,kind:"pan",place:"detroit",panProof:"45–60 minutes",t:"260 °C",bt:"12–15 min",
 knead:"Stir and fold for 2 minutes until it holds together; it will be sticky.",
 pan:"Pour 20 g oil into a 25×35 cm metal pan (a dark baking tin works). Add the dough, turn it to coat and press out gently; if it springs back, rest 15 minutes and press again into the corners.",
 heat:"Heat the oven to 260 °C with a rack on the lower third.",
 shape:"The dough is already in the pan; dimple it gently.",
 bake:"Bake 12–15 minutes until the edges are dark brown and the cheese frills are caramelised. Run a knife round the edge and lift out onto a rack."});
mk("chicago",{name:"Chicago deep-dish",grp:"Tray and pan",from:"Chicago",desc:"A buttery, cornmeal-tinged crust pressed up the sides of a deep pan, filled upside down: cheese, toppings, then sauce on top.",
 flours:[["bread-flour",88]],extra:[["cornmeal",12]],hyd:50,salt:2,oil:12,sugar:1.5,fat:"butter",ball:450,size:2.2,feeds:4,kind:"pan",place:"chicago",def:"same",panProof:"30 minutes",t:"220 °C",bt:"35–45 min",
 pan:"Grease a 23 cm deep cake tin or cast-iron pan well with butter or oil. Roll the dough to about 32 cm and press it into the tin and up the sides by about 4 cm.",
 heat:"Heat the oven to 220 °C with a rack on the lower third.",
 shape:"Press the dough up the sides so it forms a wall.",
 bake:"Bake 35–45 minutes until the crust is deep golden and the sauce is bubbling. Rest 10 minutes before cutting."});
mk("sicilian",{name:"Sicilian (thick pan)",grp:"Tray and pan",from:"Sicily",desc:"Thick, springy and crisp underneath. Baked in a rectangular pan with plenty of olive oil.",
 flours:[["bread-flour",100]],hyd:70,salt:2.2,oil:4,ball:600,size:1.8,feeds:4,kind:"pan",def:"same",panProof:"1½–2 hours",t:"230 °C",bt:"22–25 min",
 pan:"Oil a 23×33 cm pan with 30 g olive oil. Press the dough in (rest 10 minutes if it shrinks back).",
 heat:"Heat the oven to 230 °C with a rack on the lower third.",
 shape:"Dimple the risen dough with your fingertips.",
 bake:"Bake 22–25 minutes on the lower rack until the base is deep golden. Slide out onto a rack."});
mk("grandma",{name:"Grandma pan (thin, crisp-bottomed)",grp:"Tray and pan",from:"New York / Long Island",desc:"A thin pan pizza with a crisp oily base: cheese first, chunky sauce dotted on top.",
 flours:[["bread-flour",100]],hyd:63,salt:2.2,oil:4,ball:400,size:1.3,feeds:3,kind:"pan",place:"grandma",def:"same",panProof:"40–60 minutes",t:"250 °C",bt:"12–15 min",
 pan:"Oil a 33×23 cm baking tray with 20 g olive oil and press the dough out to the corners.",
 heat:"Heat the oven to 250 °C with a rack on the lower third.",
 shape:"Dimple the rested dough.",
 bake:"Bake 12–15 minutes on the lower rack until the base is crisp and the cheese is golden."});
mk("tavern",{name:"Tavern (cracker thin)",grp:"Round",from:"Chicago / Midwest",desc:"Cracker-crisp, cut into squares. Low hydration, rolled paper-thin.",
 flours:[["flour",100]],hyd:45,salt:2,oil:5,ball:200,size:.9,feeds:1.5,def:"same",rest:"30 minutes",t:"230 °C",bt:"12–14 min",
 heat:"Heat the oven to 230 °C with a tray inside.",
 shape:"Roll paper-thin with a pin to about 30 cm, prick all over with a fork.",
 bake:"Slide onto the hot tray and bake 12–14 minutes until crisp all over. Cut into squares (a party cut)."});
mk("pan",{name:"Pan pizza (deep and fluffy)",grp:"Tray and pan",from:"USA",desc:"A soft, golden, fried-bottomed deep pan pizza.",
 flours:[["bread-flour",100]],hyd:66,salt:2,oil:6,sugar:2,ball:300,size:1.2,feeds:2,kind:"pan",def:"same",t:"230 °C",bt:"15–18 min",
 pan:"Pour 15 g oil into a 23–25 cm cake tin or cast-iron pan. Press the dough in.",
 heat:"Heat the oven to 230 °C.",
 shape:"Dimple the proofed dough lightly.",
 bake:"Bake 15–18 minutes until the crust is deep golden and the cheese is bubbling."});
mk("sameday",{name:"Everyday pizza dough",grp:"Round",from:"Any kitchen",desc:"A forgiving all-round dough that works on a stone or a tray. Make it in 3 hours or ferment it for days.",
 flours:[["bread-flour",100]],hyd:62,salt:2,oil:2,sugar:1,ball:250,size:1,feeds:1.5,def:"same",rest:"1½ hours",t:"250 °C",bt:"10–12 min",
 heat:"Put a tray or stone on the top third and preheat at 250 °C for 30–45 minutes.",
 shape:"Stretch or roll each ball to about 30 cm.",
 bake:"Bake 10–12 minutes until golden and the cheese is bubbling."});
mk("noknead",{name:"No-knead (high hydration)",grp:"Round",from:"Any kitchen",desc:"Stir, fold, forget. Time does the work; chewy, bubbly and easy.",
 flours:[["bread-flour",100]],hyd:70,salt:2.2,ball:260,size:1,feeds:1.5,def:"over",rest:"1½ hours",t:"250–260 °C",bt:"7–9 min",
 knead:"Don't knead: stir until no dry flour remains, then fold the dough over itself 4 times, twice during the first hour.",
 heat:"Preheat a stone or steel at 250–260 °C for 45 minutes.",
 shape:"Press out gently from the centre on a well-floured surface and stretch to about 30 cm.",
 bake:"Bake 7–9 minutes on the hot surface until puffed and blistered."});
mk("sourdough",{name:"Sourdough",grp:"Round",from:"Any kitchen",desc:"Tangy, chewy and digestible, risen with a starter and no added yeast. Needs an active starter.",
 flours:[["bread-flour",90]],extra:[["sourdough-starter",20]],hyd:52,hydTot:62,sd:1,y:0,modes:["same","over","cold24","cold48","cold72"],ball:260,size:1,feeds:1.5,def:"cold24",rest:"1½–2 hours",t:"250 °C",bt:"7–9 min",
 knead:"Mix, rest 30 minutes, then do 3 sets of stretch-and-folds 30 minutes apart. Use a starter that is bubbly and has doubled after its last feed.",
 heat:"Preheat a stone or steel at 250 °C for 45 minutes.",
 shape:"Press out from the centre and stretch to about 30 cm.",
 bake:"Bake 7–9 minutes until the rim is spotted dark brown."});
mk("wholemeal",{name:"Wholemeal",grp:"Round",from:"Any kitchen",desc:"Half wholemeal flour for a nutty, hearty crust.",
 flours:[["bread-flour",50],["wholemeal-flour",50]],hyd:68,salt:2,oil:3,sugar:1,ball:260,size:1,feeds:1.5,def:"cold24",rest:"1½ hours",t:"250 °C",bt:"9–11 min",
 heat:"Preheat a stone or steel at 250 °C for 45 minutes.",
 shape:"Press out gently and stretch to about 30 cm; whole grain tears more easily.",
 bake:"Bake 9–11 minutes until golden."});
mk("gluten-free",{nopool:1,name:"Gluten-free",grp:"Round",from:"Any kitchen",desc:"A wet, psyllium-bound dough for gluten-free flour blends. Pressed, not stretched, and best made the same day.",
 flours:[["gluten-free-flour",100]],extra:[["psyllium",3]],hyd:85,salt:2,oil:6,sugar:2,ball:250,size:1,feeds:1.5,def:"quick",modes:["quick","same"],rest:"15 minutes",t:"240 °C",bt:"6 + 8–10 min",
 knead:"Don't knead: beat with a spoon for 3 minutes, then rest 15 minutes so the psyllium thickens the dough.",
 heat:"Heat the oven to 240 °C with a tray inside.",
 shape:"With wet or oiled hands, press each portion on baking paper into a round about 28 cm with a slightly raised rim.",
 bake:"Slide the paper onto the hot tray and par-bake the plain base for 6 minutes; take out, top, and bake 8–10 more minutes until golden."});
mk("montanara",{name:"Montanara (fried, then baked)",grp:"Fried",from:"Naples",kind:"fried",desc:"Small discs fried until puffed, then topped and flashed under the grill. Crisp outside, cloud inside.",
 flours:[["pizza-flour",100]],hyd:62,salt:2.8,ball:120,size:.5,feeds:1,def:"cold24",rest:"1–2 hours",t:"180 °C oil",bt:"1–2 min per side",
 heat:"Pour about 4 cm of neutral oil (about 700 g) into a wide heavy pot and heat to 180 °C. Heat the grill to high.",
 shape:"Stretch each ball into a disc about 12 cm across.",
 bake:"Fry 1 minute per side until puffed and golden, then drain on paper."});
mk("flammkuchen",{name:"Flammkuchen (no yeast)",grp:"Flatbreads",from:"Alsace / Baden",kind:"flat",desc:"A cracker-thin, yeast-free dough baked fast and hot. Traditionally topped with crème fraîche, bacon and onion.",
 flours:[["flour",100]],hyd:50,salt:1.8,oil:6,y:0,ball:170,size:.9,feeds:1.5,def:"quick",modes:["quick"],fixed:"Knead 3 minutes until smooth. There is no yeast, so there is no long wait: cover and rest 30 minutes at room temperature, then divide into balls.",t:"250–270 °C",bt:"8–10 min",
 heat:"Heat the oven to its maximum (250–270 °C) with a tray or stone inside.",
 shape:"Roll each piece into a thin oval or rectangle about 35×22 cm on baking paper.",
 bake:"Slide the paper onto the hot tray and bake 8–10 minutes until the edges are dark and blistered."});
mk("lahmacun",{name:"Lahmacun (thin Turkish flatbread)",grp:"Flatbreads",from:"Turkey / Armenia",kind:"flat",desc:"A thin, soft-crisp round carrying a spiced minced-meat topping. Rolled up with herbs and lemon.",
 flours:[["flour",100]],hyd:56,salt:2,oil:3,ball:110,size:.55,feeds:1,def:"same",rest:"30 minutes",t:"260 °C",bt:"5–6 min",
 heat:"Heat the oven to 260 °C with a tray or stone inside.",
 shape:"Roll each ball very thin into a round about 22 cm.",
 bake:"Bake 5–6 minutes until the edges are crisp but the middle still folds."});
mk("manakish",{name:"Manakish (soft Levantine flatbread)",grp:"Flatbreads",from:"Lebanon",kind:"flat",desc:"Soft, pillowy flatbread baked with za'atar and oil or cheese.",
 flours:[["flour",100]],hyd:58,salt:1.8,oil:5,sugar:1,ball:130,size:.6,feeds:1,def:"same",rest:"30 minutes",t:"250 °C",bt:"8–10 min",
 heat:"Heat the oven to 250 °C with a tray inside.",
 shape:"Press each ball into a round about 18 cm, leaving a slightly raised rim, and dimple with your fingertips.",
 bake:"Bake 8–10 minutes until golden at the edges."});
mk("khachapuri",{name:"Khachapuri dough (boat)",grp:"Flatbreads",from:"Georgia",kind:"flat",desc:"A soft yogurt-enriched dough shaped like a boat and filled with cheese and an egg.",
 flours:[["flour",100]],liq:[["milk",30],["yogurt",25]],salt:1.8,sugar:2,oil:3,ball:280,size:1,feeds:1.5,def:"same",rest:"20 minutes",nopool:1,t:"230 °C",bt:"12 + 4 min",
 heat:"Heat the oven to 230 °C with a tray inside.",
 shape:"Roll each piece into an oval about 28 cm long. Roll the long edges inwards to make walls, then twist and pinch the two ends to form a boat.",
 bake:"Bake the filled boat for 12 minutes."});
mk("coca",{name:"Coca (Catalan flatbread)",grp:"Flatbreads",from:"Catalonia / Provence",kind:"pan",desc:"An olive-oil flatbread baked in a thin tray, usually under onions, peppers or anchovies.",
 flours:[["flour",100]],hyd:50,salt:2,oil:8,ball:350,size:1.4,feeds:3,def:"same",panProof:"30 minutes",t:"220 °C",bt:"20–25 min",
 pan:"Oil a 33×23 cm tray with olive oil and press the dough to the edges.",
 heat:"Heat the oven to 220 °C with a rack on the lower third.",
 shape:"Dimple the dough with your fingertips.",
 bake:"Bake 20–25 minutes until the base is golden and the topping is soft and lightly caramelised."});
PZ.groups=["Round","Tray and pan","Fried","Flatbreads"];
PZ.hrange={"neapolitan":[58,65],"roman-tonda":[55,62],"roman-teglia":[70,85],"pinsa":[72,85],"ny":[60,67],"detroit":[68,78],"chicago":[45,55],"sicilian":[65,75],"grandma":[60,68],"tavern":[42,50],"pan":[62,70],"sameday":[58,68],"noknead":[65,78],"sourdough":[60,75],"wholemeal":[65,75],"gluten-free":[80,95],"montanara":[58,66],"flammkuchen":[45,55],"lahmacun":[52,60],"manakish":[55,62],"coca":[48,55]};


/* ------------------------------------------------------------------ fermentation modes
   idy: instant dried yeast, % of the flour weight (x3 = fresh yeast, x1.33 = active dry). Values follow common home-baker yeast-by-time tables:
   about 0.8 % for a 3 h dough, 0.3 % for 8 h, 0.06 % for 16 h at 18–20 °C, and 0.25 / 0.15 / 0.08 % for 24 / 48 / 72 h in the fridge.
   h: hours from mixing to baking, used for the "start ahead" line. */
const MODES={
 quick:{id:"quick",name:"Quick (about 3 hours)",short:"Quick · 3 h",idy:.8,h:3,ahead:"3 hours",temp:"warm water, about 35 °C",
  info:"Fast and forgiving, with the least flavour."},
 same:{id:"same",name:"Same day (about 8 hours)",short:"Same day · 8 h",idy:.3,h:8,ahead:"8 hours",temp:"water at about 25 °C",
  info:"Mix in the morning, bake in the evening."},
 over:{id:"over",name:"Overnight at room temperature (about 16 hours)",short:"Overnight · 16 h",idy:.06,h:16,ahead:"16 hours",temp:"cool water, about 18 °C",
  info:"Very little yeast and a long, slow rise at 18–20 °C. Shorten it in a warm kitchen."},
 cold24:{id:"cold24",name:"Cold ferment, 24 hours",short:"Cold · 1 day",idy:.25,h:26,ahead:"1 day",temp:"cool water, about 18 °C",fridge:"20–24 hours",
  info:"A day in the fridge: much better flavour and blistering."},
 cold48:{id:"cold48",name:"Cold ferment, 48 hours",short:"Cold · 2 days",idy:.15,h:50,ahead:"2 days",temp:"cool water, about 18 °C",fridge:"44–48 hours",
  info:"The sweet spot for flavour, texture and digestibility."},
 cold72:{id:"cold72",name:"Cold ferment, 72 hours",short:"Cold · 3 days",idy:.08,h:74,ahead:"3 days",temp:"cool water, about 18 °C",fridge:"68–72 hours",
  info:"Maximum flavour. The crust browns faster, so bake a little cooler."}
};
const MODE_ORDER=["quick","same","over","cold24","cold48","cold72"];
PZ.modes=MODES;PZ.modeOrder=MODE_ORDER;
PZ.modesFor=sid=>{const st=S[sid];return st?MODE_ORDER.filter(m=>!st.modes||st.modes.includes(m)):MODE_ORDER};
PZ.defMode=sid=>S[sid]?S[sid].def:"same";

/* ------------------------------------------------------------------ sauces
   ing: [id, grams per 30 cm pizza] (olive oil etc. are grams). step: how to prepare it. */
const SAUCES={
 raw:{name:"Raw tomato",ing:[["canned-tomatoes",80],["olive-oil",5],["salt",1]],step:q=>`Crush the ${q("canned-tomatoes")} by hand or with a fork and stir in the ${q("salt")} and ${q("olive-oil")}. Don't cook it: it cooks on the pizza.`},
 cooked:{name:"Cooked tomato",ing:[["canned-tomatoes",100],["tomato-paste",8],["garlic",1,"pcs"],["oregano",1],["sugar",1],["olive-oil",5],["salt",1]],step:q=>`Simmer the ${q("canned-tomatoes")}, ${q("tomato-paste")}, crushed ${q("garlic")}, ${q("oregano")}, ${q("sugar")}, ${q("olive-oil")} and ${q("salt")} for 10 minutes until thick. Cool completely.`},
 white:{name:"Garlic oil",ing:[["olive-oil",12],["garlic",1,"pcs"],["salt",.5]],step:q=>`Warm the ${q("olive-oil")} with the thinly sliced ${q("garlic")} and ${q("salt")} over low heat for 2 minutes. Cool.`},
 cf:{name:"Crème fraîche",ing:[["creme-fraiche",70],["nutmeg",.3],["black-pepper",.5],["salt",.5]],step:q=>`Stir the ${q("creme-fraiche")} with the ${q("nutmeg")}, ${q("black-pepper")} and ${q("salt")}.`},
 pesto:{name:"Pesto",ing:[["pesto",35]],step:()=>""},
 bbq:{name:"BBQ sauce",ing:[["bbq-sauce",50]],step:()=>""},
 buffalo:{name:"Buffalo sauce",ing:[["buffalo-sauce",30]],step:()=>""},
 salsa:{name:"Tomato salsa",ing:[["salsa-tomato",70]],step:()=>""},
 spread:{name:"Chocolate hazelnut",ing:[["hazelnut-spread",50]],step:()=>"",after:true},
 none:{name:"No sauce",ing:[],step:()=>""}
};
PZ.sauces=SAUCES;

/* ------------------------------------------------------------------ toppings
   when: on (before baking) · late (added for the last minutes) · after (when it comes out) · cheese (the cheese layer)
   g: grams for a 30 cm pizza, p: preparation (null = none), l: cooked leftover that may replace it ($A amount, $N name) */
const PT={},CHEESE=new Set();
const P=(id,when,g,prep,opt)=>{PT[id]=Object.assign({when,g,p:prep||"",u:"g"},opt||{});if(when==="cheese")CHEESE.add(id)};
P("mozzarella","cheese",110,"Shred or slice the $N.");
P("fresh-mozzarella","cheese",100,"Tear the $N into pieces and pat dry on paper towel for 15 minutes so the pizza doesn't turn soggy.");
P("buffalo-mozzarella","cheese",110,"Tear the $N and drain it on paper towel for 15 minutes.");
P("provolone","cheese",60,"Slice or grate the $N.");
P("cheddar","cheese",50,"Grate the $N.");
P("gruyere","cheese",30,"Grate the $N.");
P("feta","cheese",50,"Crumble the $N.");
P("blue-cheese","cheese",40,"Crumble the $N.");
P("goat-cheese","cheese",40,"Crumble the $N.");
P("ricotta","cheese",70,"Drain the $N for 10 minutes.");
P("pecorino","cheese",25,"Grate the $N.");
P("parmesan","after",12,"",{v:"grate the $N over"});
P("pepperoni","on",45);P("salami","on",50);
P("ham","on",60,"Tear the $N into rough pieces.");
P("sausage","on",80,"Crumble the $A $N out of its casings and brown in a dry pan for 5 minutes; drain on paper.");
P("bacon","on",50,"Cut the $A $N into small pieces and fry for 4 minutes until half-crisp; drain.");
P("nduja","on",35,"",{v:"dot with the $N"});
P("chorizo","on",50,"Slice the $N thinly.");
P("prosciutto","after",40,"",{v:"drape the $N over"});
P("chicken-breast","on",100,"Slice the $A $N thinly and cook in a hot oiled pan for 5–6 minutes until no pink remains (74 °C).",{l:"left-chicken",lf:.75});
P("beef-strips","on",90,"Cut the $A $N into thin strips and sear in a very hot pan for 2 minutes; season.",{l:"left-beef",lf:.75});
P("beef-mince","on",90,"Brown the $A $N in a pan for 6 minutes, breaking it up; drain.");
P("lamb","on",90);
P("mushrooms","on",80,"Slice the $A $N and sauté in a dry pan for 4 minutes to drive off the water; season.");
P("red-onion","on",35,"Slice the $N very thinly.");P("onion","on",50,"Slice the $N very thinly.");
P("red-pepper","on",60,"Slice the $N into thin strips.");
P("zucchini","on",80,"Slice the $N paper-thin, salt lightly and pat dry.");
P("aubergine","on",80,"Slice the $N 5 mm thick, brush with oil and grill or pan-fry 3 minutes per side until soft.");
P("spinach","on",50,"Wilt the $N in a dry pan, cool and squeeze dry.");
P("broccoli","on",80,"Cut the $N into small florets and blanch 2 minutes; drain well.");
P("kale","on",60,"Blanch the $N for 2 minutes and squeeze dry.");
P("pumpkin","on",90,"Slice the $N thinly and roast at 200 °C for 12 minutes until just tender.");
P("tomato","on",70,"Halve the cherry $N and pat dry.");
P("black-olives","on",25,"Halve the $N.");P("green-olives","on",25,"Halve the $N.");
P("capers","on",8);P("anchovies","on",20);
P("artichoke-hearts","on",50,"Drain, pat dry and quarter the $N.");
P("pineapple","on",70,"Drain and cut the $N into small chunks; pat dry.");
P("jalapeno","on",15,"Slice the $N into thin rings.");P("pickled-jalapenos","on",20);
P("potatoes","on",100,"Slice the $N paper-thin on a mandoline, toss with a little oil and salt.",{l:"left-potatoes",lf:1});
P("fresh-figs","on",60,"Quarter the $N.");
P("pear","on",80,"Slice the $N thinly.");P("apple","on",90,"Slice the $N thinly.");P("banana","after",90,"Slice the $N.",{v:"arrange the $N over"});
P("berries","after",70,"",{v:"scatter the $N over"});
P("tuna","on",80,"Drain and flake the $N.");
P("black-beans","on",50,"Drain and rinse the $N.");P("sweetcorn","on",40,"Drain the $N.");
P("garlic","on",1,"Slice the $N very thinly.",{u:"pcs"});
P("eggs","late",1,"",{u:"pcs",v:"crack in the $N"});
P("rosemary","on",3,"Strip the leaves from the $N.");
P("oregano","on",1);P("thyme","on",1);P("cinnamon","on",1);P("zaatar","on",8);
P("brown-sugar","on",12);P("sugar","on",8);P("butter","on",12,"",{v:"dot with the $N"});
P("tomato-paste","on",15);P("black-pepper","after",1,"",{v:"grind over the $N"});
P("basil","after",4,"",{v:"tear over the $N"});P("parsley","after",4,"",{v:"scatter with the $N"});P("coriander","after",4,"",{v:"scatter with the $N"});P("mint","after",3,"",{v:"scatter with the $N"});
P("rocket","after",30,"",{v:"pile the $N on top"});
P("chilli-flakes","after",1,"",{v:"sprinkle with the $N"});
P("honey","after",12,"",{v:"drizzle with the $N"});P("olive-oil","after",8,"",{v:"drizzle with the $N"});
P("walnuts","after",20,"Roughly chop the $N.");P("dark-chocolate","after",15,"",{v:"shave the $N over"});
P("lemon","after",8,"",{v:"grate the zest of the $N over"});
P("cucumber","after",40,"Dice the $N.");P("lettuce","after",30,"Shred the $N.");P("sour-cream","after",30,"",{v:"dollop with the $N"});
P("mascarpone","after",40,"",{v:"dollop with the $N"});
P("breadcrumbs","on",25);
// cooked leftovers: never cooked again, only warmed
P("left-chicken","late",90,"Shred the $N; it is already cooked.");
P("left-beef","late",80,"Slice the $N thinly; it is already cooked.");
P("left-pork","late",60,"Tear the $N into pieces; it is already cooked.");
P("left-veg","on",80,"Roughly chop the $N; it is already cooked.");
P("left-potatoes","on",100,"Slice the $N thinly; it is already cooked.");
const LVEG=["zucchini","aubergine","red-pepper","mushrooms","pumpkin","broccoli"]; // left-veg may replace one of these
const SWEETY=new Set(["banana","berries","apple","pear","fresh-figs","hazelnut-spread","mascarpone","dark-chocolate","cinnamon","brown-sugar","sugar","walnuts"]);
PZ.PT=PT;PZ.CHEESE=CHEESE;

/* ------------------------------------------------------------------ classic pizzas
   R(id, name, from, cat, style, sauce, toppings, opts). Toppings are [id, grams for a 30 cm pizza, when?, prep?].
   cat: italian · american · pan · world · sweet · folded.  opts.lock: dough style is part of the recipe. opts.fmt: calzone | stromboli | fried-calzone */
const RC=[];
const R=(id,name,from,cat,style,sauce,top,o)=>RC.push(Object.assign({id,name,from,cat,style,sauce,top},o||{}));
// -- Italian
R("margherita","Margherita","Naples","italian","neapolitan","raw",[["fresh-mozzarella",100],["basil",4],["olive-oil",8]],{desc:"Tomato, mozzarella, basil: the benchmark. The sauce stays raw and the mozzarella goes on dry."});
R("marinara","Marinara","Naples","italian","neapolitan","raw",[["garlic",2,"on"],["oregano",1],["olive-oil",15]],{desc:"No cheese at all: tomato, garlic, oregano and good oil. Naturally vegan."});
R("napoletana","Napoletana (anchovy and capers)","Naples","italian","neapolitan","raw",[["fresh-mozzarella",90],["anchovies",20],["capers",8],["oregano",1],["basil",3]]);
R("diavola","Diavola","Italy","italian","neapolitan","raw",[["fresh-mozzarella",100],["salami",55],["chilli-flakes",1],["basil",3]],{desc:"Spicy salami and chilli on a Neapolitan base."});
R("quattro-formaggi","Quattro formaggi","Italy","italian","neapolitan","white",[["mozzarella",70],["blue-cheese",30],["provolone",40],["parmesan",20,"cheese"]],{desc:"Four cheeses on garlic oil: creamy, sharp and a little smoky."});
R("quattro-stagioni","Quattro stagioni","Italy","italian","neapolitan","raw",[["fresh-mozzarella",90],["ham",40],["mushrooms",50],["artichoke-hearts",40],["black-olives",20]],{desc:"Four quarters for the four seasons: ham, mushrooms, artichokes and olives."});
R("prosciutto-funghi","Prosciutto e funghi","Italy","italian","neapolitan","raw",[["fresh-mozzarella",100],["ham",50],["mushrooms",70]]);
R("bufalina","Bufalina","Campania","italian","neapolitan","raw",[["buffalo-mozzarella",110],["tomato",60],["basil",4],["olive-oil",8]]);
R("prosciutto-rucola","Prosciutto e rucola","Rome","italian","roman-tonda","raw",[["mozzarella",100],["prosciutto",45],["rocket",30],["parmesan",15],["olive-oil",8]],{desc:"Hot, crisp base topped with cold cured ham and peppery rocket."});
R("ortolana","Ortolana (garden)","Italy","italian","neapolitan","raw",[["mozzarella",90],["zucchini",60],["aubergine",60],["red-pepper",50],["basil",3]]);
R("salsiccia-broccoli","Salsiccia e broccoli","Naples","italian","neapolitan","white",[["provolone",70],["sausage",90],["broccoli",80],["chilli-flakes",1]],{desc:"The Neapolitan classic uses friarielli (broccoli rabe); broccoli is an easy stand-in."});
R("tonno-cipolla","Tonno e cipolla","Italy","italian","neapolitan","raw",[["mozzarella",90],["tuna",80],["red-onion",40],["capers",6]]);
R("bianca","Pizza bianca (ricotta)","Italy","italian","neapolitan","white",[["mozzarella",80],["ricotta",70],["garlic",1,"on"],["black-pepper",1],["olive-oil",8]]);
R("cacio-e-pepe","Cacio e pepe pizza","Rome","italian","roman-tonda","white",[["mozzarella",80],["pecorino",40],["black-pepper",2]]);
R("carbonara-pizza","Carbonara pizza","Rome","italian","roman-tonda","white",[["mozzarella",80],["bacon",60],["eggs",1,"late"],["pecorino",20,"after"],["black-pepper",1]],{desc:"Bacon, pecorino and a yolk that you break over the slices."});
R("patate-rosmarino","Patate e rosmarino","Rome","italian","roman-teglia","white",[["potatoes",160],["rosemary",3],["red-onion",30],["olive-oil",15]],{desc:"The Roman tray classic: paper-thin potato, rosemary and oil on a crisp, airy base."});
R("zucchine-ricotta","Zucchine, ricotta e limone","Italy","italian","roman-tonda","white",[["mozzarella",70],["zucchini",90],["ricotta",60,"after"],["lemon",8],["basil",3]]);
R("pesto-pomodorini","Pesto e pomodorini","Liguria","italian","neapolitan","pesto",[["mozzarella",90],["tomato",80],["parmesan",10]]);
R("pera-gorgonzola","Pera, gorgonzola e noci","Italy","italian","neapolitan","white",[["mozzarella",70],["blue-cheese",50],["pear",90],["walnuts",20],["honey",12]],{desc:"Sweet pear, sharp blue cheese, crunchy walnuts and a drizzle of honey."});
R("pizza-rossa","Pizza rossa (tray, no cheese)","Rome","italian","roman-teglia","raw",[["oregano",1],["olive-oil",15]],{desc:"Just tomato, oregano and olive oil on a tray. Cheap, simple and vegan."});
R("focaccia-bianca","Pizza bianca romana","Rome","italian","roman-teglia","none",[["rosemary",3],["olive-oil",25]],{desc:"Rome's plain pizza: a tray of dimpled dough, olive oil, rosemary and salt. Slice and fill with ham, or eat as is."});
R("sfincione","Sfincione (Palermo)","Sicily","italian","sicilian","none",[["onion",100,"on","Slice the $N and soften slowly in a little oil for 15 minutes with the tomato paste until jammy."],["tomato-paste",15],["anchovies",25],["provolone",60],["breadcrumbs",30],["oregano",1],["olive-oil",15]],{lock:1,desc:"Sicily's spongy street pizza: onions, anchovies, breadcrumbs and a little caciocavallo, no sauce."});
R("calzone","Calzone classico","Naples","folded","neapolitan","raw",[["fresh-mozzarella",80],["ricotta",60],["ham",50],["black-pepper",1]],{fmt:"calzone",desc:"A folded, baked pizza stuffed with ricotta, ham and mozzarella."});
R("calzone-veg","Calzone with spinach and ricotta","Italy","folded","neapolitan","raw",[["mozzarella",80],["ricotta",70],["spinach",60],["garlic",1,"on"],["black-pepper",1]],{fmt:"calzone"});
R("pizza-fritta","Pizza fritta (fried calzone)","Naples","folded","neapolitan","raw",[["ricotta",60],["mozzarella",50],["ham",40],["black-pepper",1]],{fmt:"fried-calzone",desc:"Naples street food: a folded calzone deep-fried until puffed and golden."});
R("stromboli","Stromboli","Philadelphia","folded","sameday","none",[["mozzarella",120],["salami",50],["ham",40],["red-pepper",40],["oregano",1]],{fmt:"stromboli",desc:"A pizza dough rolled up around cheese and cured meat, baked like a loaf and sliced."});
R("montanara","Montanara","Naples","italian","montanara","raw",[["mozzarella",60],["parmesan",8],["basil",3]],{lock:1});
// -- American
R("ny-cheese","New York cheese slice","New York","american","ny","cooked",[["mozzarella",130],["oregano",1],["parmesan",10]],{desc:"The plain slice: a thin layer of cooked sauce under a generous blanket of low-moisture mozzarella."});
R("ny-pepperoni","Pepperoni","New York","american","ny","cooked",[["mozzarella",120],["pepperoni",55],["oregano",1]]);
R("ny-white","White slice (ricotta and garlic)","New York","american","ny","white",[["mozzarella",90],["ricotta",80],["garlic",1,"on"],["black-pepper",1],["parmesan",10],["basil",3]]);
R("hawaiian","Hawaiian","Canada","american","ny","cooked",[["mozzarella",120],["ham",60],["pineapple",70]],{desc:"Sweet pineapple against salty ham. Everyone has an opinion."});
R("bbq-chicken","BBQ chicken","California","american","ny","bbq",[["mozzarella",100],["cheddar",20],["chicken-breast",100],["red-onion",35],["coriander",4]]);
R("buffalo-chicken","Buffalo chicken","Buffalo","american","ny","buffalo",[["mozzarella",100],["chicken-breast",100],["red-onion",25],["blue-cheese",25,"after"]]);
R("meat-lovers","Meat lovers","USA","american","ny","cooked",[["mozzarella",120],["pepperoni",35],["sausage",55],["bacon",35],["ham",35]]);
R("supreme","Supreme","USA","american","ny","cooked",[["mozzarella",120],["pepperoni",30],["sausage",45],["mushrooms",40],["red-pepper",35],["red-onion",25],["black-olives",20]]);
R("veggie-supreme","Veggie supreme","USA","american","ny","cooked",[["mozzarella",120],["mushrooms",45],["red-pepper",40],["red-onion",25],["black-olives",20],["tomato",40],["spinach",30]]);
R("philly-cheesesteak","Philly cheesesteak pizza","Philadelphia","american","ny","white",[["provolone",90],["beef-strips",100],["red-pepper",50],["onion",50,"on","Slice the $N and cook in a little oil for 6 minutes until soft."]]);
R("breakfast-pizza","Breakfast pizza","USA","american","sameday","white",[["cheddar",80],["mozzarella",40],["bacon",60],["eggs",2,"late"],["parsley",4],["black-pepper",1]],{desc:"Bacon, cheddar and eggs baked right on top."});
R("taco-pizza","Taco pizza","USA","american","ny","salsa",[["cheddar",80],["beef-mince",100,"on","Brown the $A $N with 1 tsp cumin and 1 tsp chilli powder for 6 minutes, breaking it up; drain."],["black-beans",50],["red-onion",20],["lettuce",30],["tomato",50],["sour-cream",30]],{desc:"Seasoned beef, beans and cheese; lettuce, tomato and soured cream go on cold after baking."});
R("mexican","Chorizo and jalapeño","Mexico","american","ny","salsa",[["cheddar",70],["mozzarella",40],["chorizo",60],["jalapeno",15],["sweetcorn",40],["black-beans",40],["coriander",4]]);
R("detroit-red-top","Detroit-style pepperoni","Detroit","pan","detroit","cooked",[["pepperoni",60],["mozzarella",90],["cheddar",60]],{lock:1,desc:"Pepperoni on the dough, cheese to the very edge, sauce in stripes on top."});
R("chicago-sausage","Chicago deep-dish sausage","Chicago","pan","chicago","cooked",[["mozzarella",150],["sausage",140],["mushrooms",60],["parmesan",20,"after"],["oregano",1]],{lock:1,desc:"Built upside down: cheese on the dough, sausage on the cheese, chunky sauce on top."});
R("grandma-pie","Grandma pie","Long Island","pan","grandma","cooked",[["mozzarella",150],["parmesan",15],["basil",4]],{lock:1,desc:"Thin pan pizza with the cheese on first and sauce in dollops on top."});
R("tavern-sausage","Tavern-style sausage","Chicago","pan","tavern","cooked",[["mozzarella",90],["sausage",60],["oregano",1]],{lock:1});
R("pan-pepperoni","Deep-pan pepperoni","USA","pan","pan","cooked",[["mozzarella",150],["pepperoni",55]],{lock:1});
// -- World
R("flammkuchen","Flammkuchen","Alsace","world","flammkuchen","cf",[["bacon",60,"on","Cut the $A $N into small lardons; there is no need to cook it first."],["onion",60],["gruyere",30]],{lock:1,desc:"Crème fraîche, bacon, onion: baked until the edges blister."});
R("lahmacun","Lahmacun","Turkey","world","lahmacun","none",[["lamb",90,"on","Mix the $A minced $N with the finely chopped onion, tomato, pepper, parsley, tomato paste, cumin and chilli until it forms a spreadable paste."],["onion",40,"on",""],["tomato",40,"on",""],["red-pepper",25,"on",""],["tomato-paste",15],["cumin",1],["chilli-flakes",1],["parsley",8],["lemon",20,"after"]],{lock:1,spread:"Spread the lamb paste in a very thin, even layer over each round, right to the edges.",desc:"A razor-thin round with a spiced lamb topping. Serve rolled with parsley and lemon."});
R("manakish-zaatar","Manakish za'atar","Lebanon","world","manakish","none",[["zaatar",8,"on","Mix the $A $N with the olive oil into a thick paste."],["olive-oil",15,"on",""],["tomato",40,"after","Slice the $N."],["cucumber",40,"after"],["mint",3]],{lock:1,spread:"Brush the za'atar paste over each round, leaving a small rim.",desc:"Soft flatbread brushed with za'atar and oil; eat with fresh tomato, cucumber and mint. Vegan."});
R("manakish-cheese","Manakish with cheese","Lebanon","world","manakish","none",[["mozzarella",60],["feta",30],["zaatar",4],["tomato",40,"after","Slice the $N."],["mint",3]],{lock:1});
R("khachapuri","Khachapuri adjaruli","Georgia","world","khachapuri","none",[["mozzarella",110],["feta",80],["eggs",1,"late"],["butter",15,"after"]],{lock:1,fmt:"khachapuri",desc:"The cheese boat: bubbling cheese with a yolk and butter stirred in at the table."});
R("pissaladiere","Pissaladière","Nice","world","coca","none",[["onion",200,"on","Cook the $A sliced $N slowly in oil with a splash of water for 30 minutes until soft and sweet."],["anchovies",30],["black-olives",30],["thyme",1]],{lock:1,desc:"Slow-cooked onions, anchovies and black olives on a thin bread base."});
R("coca-recapte","Coca de recapte","Catalonia","world","coca","none",[["red-pepper",100,"on","Roast or grill the $N and aubergine until soft and charred; peel and cut into strips."],["aubergine",100,"on",""],["onion",60],["olive-oil",15]],{lock:1,desc:"Catalan flatbread under roasted peppers, aubergine and onion. Vegan."});
R("greek","Greek-style","Greece","world","sameday","cooked",[["mozzarella",70],["feta",60],["black-olives",25],["red-onion",25],["tomato",50],["red-pepper",30],["oregano",1]]);
// -- Sweet
R("nutella-banana","Chocolate hazelnut and banana","Italy","sweet","sameday","spread",[["banana",100],["walnuts",15],["sugar",0]],{desc:"Bake the plain base, then spread it hot with chocolate hazelnut spread and top with banana."});
R("apple-cinnamon","Apple and cinnamon","USA","sweet","sameday","none",[["apple",120],["cinnamon",2],["brown-sugar",12],["butter",12],["mascarpone",40],["honey",10]],{desc:"Thin apple slices, cinnamon sugar and butter, with cool mascarpone and honey."});
R("berry-ricotta","Berry and ricotta","Italy","sweet","sameday","none",[["ricotta",90,"on","Mix the $N with the honey and spread over the base."],["honey",15,"on",""],["berries",80]],{desc:"Honeyed ricotta baked on the base, topped with fresh berries."});
R("dessert-calzone","Chocolate and banana calzone","Italy","folded","sameday","none",[["hazelnut-spread",50,"on"],["banana",60,"on","Slice the $N."]],{fmt:"calzone",desc:"A folded sweet pocket filled with chocolate hazelnut spread and banana."});
PZ.cats=[["","Any pizza"],["italian","Italian classics"],["american","American"],["pan","Pan and deep-dish"],["world","World flatbreads"],["folded","Calzone and folded"],["sweet","Sweet and dessert"]];

/* ------------------------------------------------------------------ resolve: dough + sauce + toppings -> ingredients and method */
const FOLD={calzone:1,stromboli:1,"fried-calzone":1};
const dg=a=>a>=20?String(Math.round(a)):a>=2?String(Math.round(a*10)/10):String(Math.round(a*100)/100);
const pp=p=>p>=10?String(Math.round(p)):p>=1?String(Math.round(p*10)/10):String(Math.round(p*100)/100);
const list=a=>a.length>1?a.slice(0,-1).join(", ")+" and "+a[a.length-1]:a[0]||"";
const joinNames=list;
const ahead=h=>h;
/* doughPlan: one dough, from its formula, a fermentation mode, optional poolish and a number of pizzas.
   Everything is derived from baker's percentages, so any combination stays consistent. */
function doughPlan(st,o){
  const diet=o.diet||{},count=Math.max(1,o.count||1),foldx=o.foldx||1,notes=[];
  let mid=o.mode&&MODES[o.mode]?o.mode:st.def;
  if(st.modes&&!st.modes.includes(mid)){const was=MODES[mid].short;mid=st.modes.includes(st.def)?st.def:st.modes[0];notes.push(`${st.name} dough doesn't suit the ${was.toLowerCase()} schedule, so it uses ${MODES[mid].short.toLowerCase()} instead.`)}
  const M=MODES[mid],yeasted=!!st.y,sd=!!st.sd,pan=st.kind==="pan";
  const H=o.hyd&&!st.liq?Math.max(40,Math.min(100,o.hyd)):0,eh=H||(sd?st.hydTot:st.hyd);
  const want=o.pre||(o.pool?"poolish":""),okPre=yeasted&&!st.nopool&&!st.liq,
    pre=want==="poolish"&&okPre&&st.flours[0][1]>=30&&eh>=45?"poolish":want==="biga"&&okPre&&eh>=56&&!st.extra.length?"biga":"",pool=!!pre,biga=pre==="biga",PG=biga?"Biga":"Poolish";
  if(want&&!pre)notes.push(yeasted?`A ${want} isn't used with ${st.name}${want==="biga"&&eh<56?" (the dough is too dry to hold back half the flour's water for it)":""}.`:`A ${want} isn't used with ${st.name} (there is no commercial yeast).`);
  const fresh=o.fresh!==false,YID=fresh?"fresh-yeast":"yeast",YM=fresh?3:1,yname=fresh?"fresh yeast":"dried yeast";
  const fat=st.fat==="butter"&&!(diet.dairy||diet.vegan)?"butter":"olive-oil";
  const ballG=o.ball||st.ball,total=ballG*count*foldx;
  let flours=st.flours.map(f=>[f[0],f[1]]),extra=st.extra.map(e=>[e[0],e[1]]),hyd=H||st.hyd,starter=0;
  if(sd){starter={same:25,over:8,cold24:15,cold48:10,cold72:6}[mid]||15;flours=[[flours[0][0],100-starter/2]];extra=[["sourdough-starter",starter]];hyd=eh-starter/2}
  const yP=yeasted?M.idy*(st.yf||1):0,poolFl=pre==="poolish"?30:0,P=[];
  if(pre==="poolish")P.push({id:flours[0][0],p:poolFl,grp:PG},{id:"water",p:poolFl,grp:PG},{id:YID,p:.03*YM,grp:PG});
  if(biga){flours.forEach(f=>P.push({id:f[0],p:f[1],grp:PG}));P.push({id:"water",p:50,grp:PG},{id:YID,p:.15*YM,grp:PG})}
  else flours.forEach((f,i)=>P.push({id:f[0],p:f[1]-(i===0?poolFl:0),grp:"Dough"}));
  (st.liq||[["water",hyd]]).forEach(l=>P.push({id:l[0],p:l[0]==="water"?l[1]-poolFl-(biga?50:0):l[1],grp:"Dough"}));
  extra.forEach(e=>P.push({id:e[0],p:e[1],grp:"Dough"}));
  P.push({id:"salt",p:st.salt,grp:"Dough"});
  if(yeasted)P.push({id:YID,p:(biga?yP*.4:pool?yP*.5:yP)*YM,grp:"Dough"});
  if(st.oil)P.push({id:fat,p:st.oil,grp:"Dough"});
  if(st.sugar)P.push({id:"sugar",p:st.sugar,grp:"Dough"});
  const f=total/P.reduce((t,x)=>t+x.p,0),items=P.map(x=>{const e=K.ING[x.id];return{id:x.id,a:x.p*f,u:"g",grp:x.grp,pct:x.p,name:e.name,txt:dg(x.p*f)+" g"}});
  const it=(id,grp)=>items.find(x=>x.id===id&&x.grp===grp),qq=(id,grp)=>{const x=it(id,grp);return x?dg(x.a)+" g "+nm(id):""};
  const s=[],tot=Math.round(total/5)*5,nb=Math.max(1,count);
  const flourGrams=items.filter(x=>/flour/.test(x.id)||x.id==="cornmeal").reduce((t,x)=>t+x.a,0);
  // --- mix
  const yD=it(YID,"Dough"),yPo=it(YID,PG),w=it("water","Dough"),yv=fresh?"Crumble":"Stir";
  if(pre==="poolish")s.push(`The evening before (12–16 hours ahead) make the poolish: ${yv.toLowerCase()} ${qq(YID,PG)} into ${qq("water",PG)} (about 20 °C), add ${qq(flours[0][0],PG)} and stir to a thick batter. Cover and leave at 18–20 °C until domed, bubbly and just starting to sink in the middle.`);
  if(biga)s.push(`The evening before (16–18 hours ahead) make the biga: ${yv.toLowerCase()} ${qq(YID,PG)} into ${qq("water",PG)} (16–18 °C), add ${list(items.filter(x=>x.grp===PG&&/flour/.test(x.id)).map(x=>qq(x.id,PG)))} and mix just until there is no dry flour. It stays a stiff, shaggy dough, so don't knead it. Cover and leave at 16–18 °C for 16–18 hours until about tripled, domed and full of bubbles, with a slightly sweet smell.`);
  if(!yeasted&&!sd){
    s.push(`Put the ${list((st.liq||[["water"]]).map(l=>qq(l[0],"Dough")))} in a large bowl. Add the ${list(items.filter(x=>x.grp==="Dough"&&(K.ING[x.id].role==="carb"||x.id==="psyllium")).map(x=>qq(x.id,"Dough")))} and the ${qq("salt","Dough")}${it(fat,"Dough")?`, ${qq(fat,"Dough")}`:""}.`);
    s.push(st.fixed||st.knead);
  }else{
    const liqP=list((st.liq||[["water"]]).map(l=>qq(l[0],"Dough")));
    const yt=!yeasted?"":qq(YID,"Dough");
    const flList=list(items.filter(x=>x.grp==="Dough"&&(/flour/.test(x.id)||x.id==="cornmeal"||x.id==="psyllium")).map(x=>qq(x.id,"Dough")));
    if(biga)s.push(`Tear the ripe biga into small pieces in a large bowl. Add ${liqP} and ${yt} (${M.temp}) and squeeze and mix with your hands or a mixer for about 5 minutes until the biga has broken down and the dough comes together. Cover and rest 20 minutes.`);
    else s.push((pre==="poolish"?"Break up the ripe poolish in a large bowl with ":sd?`Whisk the ${qq("sourdough-starter","Dough")} into `:"")+(yeasted?(pool?`${liqP} and ${yt}`:`${yv} ${yt} into ${liqP}`):liqP)+` (${M.temp}).`+` Add the ${flList} and mix until no dry flour is left. Cover and rest 20–30 minutes.`);
    s.push(`Add the ${qq("salt","Dough")}${it(fat,"Dough")?`, ${qq(fat,"Dough")}`:""}${it("sugar","Dough")?` and ${qq("sugar","Dough")}`:""}. ${st.knead}`);
  }
  // --- fermentation schedule
  const balls=`Divide the dough (about ${tot} g in all) into ${nb} ${nb>1?"balls":"ball"} of about ${Math.round(total/nb/5)*5} g and shape each into a tight ball.`;
  const cold=!!M.fridge&&(yeasted||sd),sdTxt=sd;
  if(!yeasted&&!sd){/* unyeasted dough: no schedule */}
  else if(!pan){
    if(mid==="quick")s.push("Cover and leave 1 hour somewhere warm (28–30 °C) until puffy.",balls+" Place on a floured tray, cover and rest 45–60 minutes while the oven heats.");
    else if(mid==="same")s.push(`Cover and leave ${sd?"5–6":"4–5"} hours at room temperature (22–24 °C) until ${sd?"risen by about half":"doubled"}.`,balls+" Place in oiled lidded containers or on a floured tray under a damp cloth and proof 2–3 hours until soft and puffy.");
    else if(mid==="over")s.push(`Cover and leave ${sd?"10–12":"8–10"} hours at 18–20 °C until doubled and bubbly. In a kitchen warmer than 24 °C, put it in the fridge for the first 4 hours.`,balls+" Place in oiled lidded containers, cover and proof 3–4 hours until puffy.");
    else s.push(sd?"Leave 3–4 hours at room temperature (about 24 °C), folding the dough once an hour for the first 2 hours.":"Cover and leave 1 hour at room temperature.",balls+` Place in oiled lidded containers and refrigerate for ${M.fridge}.`,`Take the balls out ${st.rest} before baking and leave them covered at room temperature until soft, puffy and no longer cold.`);
  }else{
    const tt=`Total dough: about ${tot} g for ${nb} ${nb>1?"pans":"pan"}.`;
    if(mid==="quick")s.push("Cover and leave 1 hour somewhere warm until doubled.");
    else if(mid==="same")s.push(`Cover and leave ${sd?"5–6":"3–4"} hours at room temperature until ${sd?"risen by about half":"doubled"}.`);
    else if(mid==="over")s.push(`Cover and leave ${sd?"10–12":"8–10"} hours at 18–20 °C until doubled.`);
    else s.push((sd?"Leave 3–4 hours at room temperature, folding once an hour for the first 2 hours, then":"Leave 1 hour at room temperature, then")+` refrigerate the whole dough in an oiled covered container for ${M.fridge}.`);
    s.push(tt+" "+(cold?"Take the dough out of the fridge and ":"")+st.pan.replace(/^./,c=>cold?c.toLowerCase():c),`Cover and proof ${st.panProof} at room temperature until puffy.`);
  }
  // --- summary line and tips
  const yTot=yeasted?((biga?.15+yP*.4:pool?.03+yP*.5:yP)*YM):0,hydShow=st.liq?st.liq.reduce((t,l)=>t+l[1],0):eh;
  const sum=[`Hydration ${pp(hydShow)}%`,`salt ${pp(st.salt)}%`].concat(yeasted?[`${yname} ${pp(yTot)}%`]:sd?[`starter ${starter}%`]:[]).concat(st.oil?[`${fat==="butter"?"butter":"oil"} ${pp(st.oil)}%`]:[]).concat([`${ballG} g per ${pan?"pan":"ball"}`]).join(" · ");
  const tips=[];
  if(yeasted){const ys=[yD,yPo].filter(y=>y&&y.a<1);if(ys.length)tips.push(`If your scale can't weigh yeast this finely, stir 1 g ${yname} into 100 g water and use `+ys.map(y=>`${Math.max(1,Math.round(y.a*101))} g of that mix for the ${y.grp==="Dough"?"dough":pre}`).join(" and ")+", taking the same weight off the water.")}
  if(yeasted)tips.push(fresh?"Yeast is fresh (cake) yeast: crumble it into the water. If you only have dried yeast, use one third of the weight in instant dried yeast.":"Yeast is instant dried yeast. For fresh yeast use 3×, for active dry 1⅓×; dissolve it in the water first.");
  if(cold)tips.push("Judge long ferments by the dough, not the clock: it should grow by about 1½–2× and feel airy and slightly domed. A cold fridge slows it down; a warm one speeds it up.");
  if(mid==="cold72"||mid==="over")tips.push("Long ferments brown faster: bake slightly cooler or a minute shorter if the crust darkens too quickly.");
  if(pre==="poolish")tips.push("The poolish is made from 30% of the flour and an equal weight of water, and gives a sweeter, more open crumb.");
  if(biga)tips.push("The biga uses all of the flour with water at half the flour's weight (50% hydration) and a little yeast. The rest of the water goes in at the final mix, so there is no extra flour. It gives a nutty flavour and a strong, chewy crumb.");
  const hr=PZ.hrange[st.id];if(H&&hr&&(H<hr[0]||H>hr[1]))tips.push(`${H}% is outside the usual ${hr[0]}–${hr[1]}% for ${st.name}, so expect a ${H>hr[1]?"wetter, slacker":"stiffer, tighter"} dough than the traditional one.`);
  if(eh>=75)tips.push("This is a wet dough: use wet hands or a scraper, and flour or oil the surface rather than adding flour to the dough. High hydration needs a good-protein flour and a gentle hand.");
  if(eh<55&&!st.fixed)tips.push("This is a stiff dough: knead a little longer and rest the balls well before rolling.");
  const ah=st.fixed?"45 minutes":M.ahead+(pre?` (${pre} the evening before)`:"");
  return{items,steps:s,sum,tips,notes,ahead:ah,mode:mid,modeName:M.name,pool,pre,fresh,total:tot,ball:ballG,flour:Math.round(flourGrams),yeastPct:yTot};
}

PZ.resolve=function(spec,o){
  o=o||{};const diet=o.diet||{},F=o.fridge||new Set(),U=o.urgent||new Set(),count=Math.max(1,o.count||2);
  const fmtKind=spec.fmt||"";
  let sid=o.style||spec.style,st=S[sid];if(!st)return null;
  if((FOLD[fmtKind]||fmtKind==="khachapuri")&&st.kind!=="round"&&st.kind!=="flat")return null;
  if(diet.gf){ // swap in the gluten-free dough but keep the shape and the oven of the chosen style
    if(FOLD[fmtKind])return null;
    const g=S["gluten-free"];if(sid!=="gluten-free")st=Object.assign({},st,{flours:g.flours,extra:g.extra,hyd:g.hyd,hydTot:undefined,sd:0,liq:undefined,salt:g.salt,oil:g.oil,sugar:g.sugar,y:1,modes:g.modes,def:g.def,fixed:undefined,nopool:1,knead:g.knead,rest:g.rest,name:st.name+" (gluten-free dough)",
      shape:st.kind==="round"||st.kind==="flat"?g.shape:st.shape,bake:st.bake+" Gluten-free bases may need 2–3 minutes longer.",gfx:1})}
  const fk=fmtKind||(st.kind==="fried"?"fried":"");
  let foldx=1;if(fk==="stromboli")foldx=1.3;if(fk==="calzone"||fk==="fried-calzone")foldx=.9;
  const sz=(fk==="calzone"||fk==="fried-calzone")?.75:fk==="stromboli"?1.5:st.size;
  const dough=Object.assign({},st,{foldx});
  const plan=doughPlan(dough,{mode:o.ferm,pool:o.pool,pre:o.pre,fresh:o.fresh,hyd:o.hyd,count,diet,ball:o.ball,foldx}),ing=[],add=(id,a,u,grp)=>{const e=ing.find(x=>x.id===id&&x.grp===grp);if(e){e.a+=a;return}ing.push({id,a,u,grp})};
  plan.items.forEach(x=>ing.push({id:x.id,a:x.a,u:"g",grp:x.grp,txt:x.txt,pct:x.pct}));
  // sauce
  const sc=SAUCES[spec.sauce||"none"],sauceTot={};
  if(!sc)return null;
  const sscale=(fk==="calzone"||fk==="fried-calzone")?.5:sz;
  sc.ing.forEach(x=>{const u=x[2]||"g",a=u==="pcs"?Math.max(1,Math.round(x[1]*sscale*count)):x[1]*sscale*count;sauceTot[x[0]]=[a,u];add(x[0],a,u,"Sauce")});
  // toppings, with cooked leftovers replacing raw ones
  let items=spec.top.map(t=>({id:t[0],g:t[1],w:t[2],p:t[3],orig:t[0]}));
  items.forEach(i=>{const d=PT[i.id];if(d&&d.l&&F.has(d.l)){i.id=d.l;i.g=i.g*d.lf;i.left=1;i.w=undefined;i.p=undefined}});
  if(F.has("left-veg")){const v=items.find(i=>LVEG.includes(i.id)&&!i.left);if(v){v.id="left-veg";v.g*=.9;v.left=1;v.w=undefined;v.p=undefined}}
  const L=[],groups={cheese:[],on:[],late:[],after:[]};
  items.forEach(i=>{const d=PT[i.id]||{when:"on",g:i.g,p:"",u:"g"};const w=i.w||d.when,u=d.u||"g",a=u==="pcs"?Math.max(1,Math.round(i.g*sz*count)):i.g*sz*count;if(a<=0)return;
    const g=w==="cheese"?"Cheese":w==="after"?"To finish":"Toppings";add(i.id,a,u,g);
    const prep=i.p!==undefined&&i.p!==""?i.p:i.p===""?"":(d.p||""),entry={id:i.id,a,u,w,prep,v:d.v,left:i.left};
    (groups[w]||groups.on).push(entry)});
  // diet check on every ingredient that ended up in the recipe
  const flags=new Set();ing.forEach(x=>{const e=K.ING[x.id];if(!e)return;e.f.forEach(f=>flags.add(f))});
  if(!K.allowed({flags},diet))return null;
  ing.forEach(x=>{const e=K.ING[x.id];x.name=e.name;x.pantry=e.f.has("pantry");x.have=F.has(x.id)||x.id==="water";x.txt=x.txt||gtxt(x.a,x.u);x.left=e.aisle==="left"});
  // ---- method
  const steps={dough:plan.steps,prep:[],make:[]},qq=(id,u)=>{const x=ing.find(y=>y.id===id);return x?Q(id,sauceTot[id]?sauceTot[id][0]:x.a,sauceTot[id]?sauceTot[id][1]:x.u):nm(id)};
  const sstep=sc.step(id=>Q(id,sauceTot[id][0],sauceTot[id][1]));if(sstep)steps.prep.push(sstep);
  const amt=e=>e.u==="pcs"?num(e.a,"pcs"):gtxt(e.a,"g");
  const sub=(t,e)=>t.replace(/\$A/g,amt(e)+" g").replace(/\$N/g,nm(e.id)).replace(" g g"," g").replace(/(\d) g pcs/,"$1");
  [...groups.cheese,...groups.on,...groups.late,...groups.after].forEach(e=>{if(e.prep)steps.prep.push(sub(e.prep,e).replace(/(\d+(?:\.\d+)?) g (\d+(?:\.\d+)?) g/,"$1 g"))});
  const names=a=>joinNames(a.map(e=>nm(e.id))),ph=(e)=>e.v?sub(e.v,e):"add the "+nm(e.id);
  const heat=dough.heat,T=dough.t,bt=dough.bt;
  const out=steps.make;
  const place=dough.place,fold=fk&&FOLD[fk];
  out.push(heat);
  const eggs=[...groups.late].filter(e=>e.id==="eggs");
  if(fk==="khachapuri"){
    out.push("Roll each piece into an oval about 28 cm long. Roll the long edges inwards to make walls, then twist and pinch the two ends to form a boat.");
    out.push(`Fill each boat with the ${names(groups.cheese)}, mixed together, leaving the edges bare. Brush the dough with a little oil.`);
    out.push(`Bake ${bt.split("+")[0].trim()} minutes until the crust is golden and the cheese is bubbling.`);
    out.push(`Take the boats out, make a well in each, slip an egg into each and bake 3–4 more minutes until the white is just set.`);
    out.push(`Add the ${groups.after.map(e=>nm(e.id)).join(" and ")||"butter"} and stir the egg into the hot cheese at the table, tearing the crust to dip.`);
  }else if(fold){
    const filling=[...groups.cheese,...groups.on,...groups.late];
    out.push(fk==="stromboli"?`Roll each piece of dough into a rectangle about 30×40 cm. Leave a 2 cm border and layer on the ${names(filling)}.${sc.ing.length?" Add a thin layer of the sauce first.":""}`
      :`Stretch or roll each ball into a round about 24 cm. ${sc.ing.length?`Spread a spoonful of the sauce over half, keeping 2 cm from the edge, then `:"Over half, "}layer the ${names(filling)}.`);
    out.push(fk==="stromboli"?"Roll up tightly from the long side, tuck in the ends and place seam-side down on a lined tray. Brush with olive oil and cut 3 slits in the top.":"Fold the dough over the filling, press the edges and crimp them firmly with a fork. Cut a small slit in the top so steam can escape.");
    if(fk==="fried-calzone"){out.push("Heat about 4 cm of neutral oil (about 700 g) to 175 °C. Fry the calzone 2 minutes per side until puffed and deep golden. Drain on paper towel.");}
    else out.push(fk==="stromboli"?"Bake at 210 °C for 22–25 minutes until deep golden. Rest 5 minutes, then slice.":"Brush with olive oil and bake at 230 °C for 15–18 minutes until puffed and golden.");
    if(sc.ing.length)out.push("Warm a little of the extra sauce and serve it for dipping.");
    const af=groups.after.map(ph);if(af.length)out.push("To finish, "+joinNames(af)+".");
  }else{
    out.push(dough.shape);
    if(dough.kind==="fried"){
      out.push(`Fry the discs in the hot oil: ${dough.bake}`);
      out.push(`${sc.ing.length?"Spoon a little sauce onto each disc. ":""}${groups.cheese.length?"Add the "+names(groups.cheese)+". ":""}${groups.on.length?"Add the "+names(groups.on)+". ":""}Grill 1–2 minutes until the cheese melts.`);
    }else{
      const sauceStep=sc.ing.length?(sc.after?"":place==="std"||place==="chicago"&&false?`Spread the sauce thinly over the dough${dough.kind==="pan"?" to the edges":", leaving a 1.5 cm rim"}.`:""):"";
      if(place==="detroit"){
        out.push(`Put the ${names(groups.on.filter(e=>e.id==="pepperoni"||e.id==="sausage"||true))} straight onto the dough, then cover with the ${names(groups.cheese)}, pushing it right to the edges and corners of the pan.`.replace("Put the  straight onto the dough, then cover with the","Cover the dough with the"));
        if(sc.ing.length)out.push("Spoon the sauce over the top in two or three stripes; don't spread it.");
      }else if(place==="chicago"){
        out.push(`Layer the ${names(groups.cheese)} over the base, then the ${names(groups.on)||"toppings"}${groups.late.length?" and "+names(groups.late):""}.`.replace("then the toppings and ","then the "));
        if(sc.ing.length)out.push("Spoon the sauce over the top, spread it to the edges and sprinkle with a little parmesan.");
      }else if(place==="grandma"){
        out.push(`Scatter the ${names(groups.cheese)} over the dough${groups.on.length?", then the "+names(groups.on):""}.`);
        if(sc.ing.length)out.push("Spoon the sauce over the top in dollops; it will spread as it bakes.");
      }else{
        if(sauceStep)out.push(sauceStep);
        if(groups.cheese.length)out.push(`${groups.cheese.length>1||groups.cheese.some(e=>e.id==="ricotta")?"Dot or scatter":"Scatter"} the ${names(groups.cheese)} over ${sc.ing.length&&!sc.after?"the sauce":"the dough"}.`);
        if(spec.spread)out.push(spec.spread);
        else if(groups.on.length)out.push(`Add the ${names(groups.on)}.`);
      }
      out.push(dough.bake);
      if(groups.late.length)out.push(`When the pizza is about two-thirds baked, quickly ${joinNames(groups.late.map(e=>e.id==="eggs"?`crack in the ${num(e.a,"pcs")} ${e.a>1?"eggs":"egg"} (use a spoon to make a gap in the cheese first)`:e.left?`scatter on the ${nm(e.id)}`:`add the ${nm(e.id)}`))} and bake until done.`);
      if(sc.after)out.push(`As soon as it comes out, spread the hot base with the ${nm("hazelnut-spread")}.`);
    }
    const af=groups.after.map(ph);if(af.length)out.push((place==="detroit"||place==="chicago"?"Turn out of the pan. ":"As soon as it comes out, ")+joinNames(af)+".");
    out.push(dough.kind==="pan"?"Let it rest 2 minutes, then cut into squares and serve hot.":"Rest 1 minute, slice and serve at once.");
  }
  const ppl=Math.round(count*dough.feeds*(fk==="stromboli"?1.5:foldx<1?.9:1));
  const kc=K.nutri(ing.filter(x=>x.id!=="water"),Math.max(1,count*(dough.feeds||1)));
  const sections=[{h:"Dough (start "+plan.ahead.replace(/ \(.*/,"")+" ahead)",steps:steps.dough,tips:plan.tips}];
  if(steps.prep.length)sections.push({h:"Sauce and toppings",steps:steps.prep});
  sections.push({h:"Shape, top and bake",steps:steps.make});
  const hit=ing.filter(x=>x.grp!=="Dough"&&x.grp!=="Poolish"&&x.grp!=="Biga"&&x.have&&!x.pantry).length,urg=ing.filter(x=>x.have&&U.has(x.id)).length,leftN=ing.filter(x=>x.left).length;
  return{kind:"pizza",title:spec.name,desc:[spec.desc,dough.desc].filter(Boolean).join(" "),from:spec.from||"",style:sid,styleName:dough.name,cat:spec.cat,count,feeds:ppl,
    ahead:plan.ahead,ferm:plan.mode,fermName:plan.modeName,pool:plan.pool,pre:plan.pre,fresh:plan.fresh,sum:plan.sum,notes:plan.notes,doughG:plan.total,ballG:plan.ball,flourG:plan.flour,bake:`${T}, ${bt}`,ing,sections,kcal:kc.kcal,p:kc.p,hit,urg,leftN,spec:{id:spec.id,name:spec.name,remix:!!spec.remix},remix:!!spec.remix,built:!!spec.remix};
};

/* ------------------------------------------------------------------ dough only */
PZ.dough=function(sid,count,o){
  o=o||{};const diet=o.diet||{},F=o.fridge||new Set();let st=S[sid];if(!st)return null;
  if(diet.gf&&sid!=="gluten-free"){sid="gluten-free";st=S[sid]}
  const plan=doughPlan(st,{mode:o.ferm,pool:o.pool,pre:o.pre,fresh:o.fresh,hyd:o.hyd,count,diet,ball:o.ball}),ing=plan.items.map(x=>{const e=K.ING[x.id];return Object.assign({},x,{pantry:e.f.has("pantry"),have:F.has(x.id)||x.id==="water"})});
  const flags=new Set();ing.forEach(x=>K.ING[x.id].f.forEach(f=>flags.add(f)));if(!K.allowed({flags},diet))return null;
  const ideas=PZ.recipes.filter(r=>r.style===sid||(r.cat!=="sweet"&&r.cat!=="folded"&&S[r.style].kind===st.kind)).slice(0,60);
  const pick=shuf(ideas).slice(0,4).map(r=>r.name);
  const make=[st.heat,st.shape,"Sauce and top the dough with whatever you like, keeping toppings light so the base can crisp. "+st.bake];
  return{kind:"pizza",dough:true,title:/dough/i.test(st.name)?st.name:st.name+" dough",desc:st.desc,from:st.from,style:sid,styleName:st.name,count,feeds:Math.round(count*st.feeds),ahead:plan.ahead,ferm:plan.mode,fermName:plan.modeName,pool:plan.pool,pre:plan.pre,fresh:plan.fresh,sum:plan.sum,notes:plan.notes,doughG:plan.total,ballG:plan.ball,flourG:plan.flour,bake:`${st.t}, ${st.bt}`,ing,
    sections:[{h:"Dough (start "+plan.ahead.replace(/ \(.*/,"")+" ahead)",steps:plan.steps,tips:plan.tips},{h:"Bake day",steps:make}],ideas:pick,hit:0,urg:0,spec:{id:"dough-"+sid,name:st.name}};
};

/* ------------------------------------------------------------------ remix: invent a pizza from a theme, your fridge and your leftovers */
const T=PZ.themes;
const mt=(id,o)=>T[id]=Object.assign({id,name:id},o);
mt("italian",{cats:["italian",""],sauces:["raw","raw","white","pesto"],cheese:[["fresh-mozzarella",100],["mozzarella",110]],extraCheese:["parmesan","ricotta","blue-cheese","provolone","pecorino"],
 pool:["salami","ham","mushrooms","artichoke-hearts","black-olives","red-pepper","zucchini","aubergine","spinach","tomato","sausage","potatoes","capers","broccoli","pumpkin"],after:["basil","rocket","parmesan","olive-oil","prosciutto"],
 styles:["neapolitan","roman-tonda","pinsa","sourdough","noknead","sameday","roman-teglia"]});
mt("american",{cats:["american","pan",""],sauces:["cooked","cooked","bbq","buffalo"],cheese:[["mozzarella",120]],extraCheese:["cheddar","provolone"],
 pool:["pepperoni","sausage","bacon","ham","mushrooms","red-onion","red-pepper","black-olives","jalapeno","pineapple","chicken-breast","tomato","spinach","sweetcorn"],after:["oregano","chilli-flakes","parsley","parmesan"],
 styles:["ny","pan","sameday","grandma","tavern","detroit"],stylesPan:["pan","detroit","grandma","sicilian","chicago"]});
mt("mediterranean",{cats:["world",""],sauces:["cooked","raw","white"],cheese:[["mozzarella",70],["feta",60]],extraCheese:["goat-cheese"],
 pool:["black-olives","red-onion","tomato","spinach","artichoke-hearts","red-pepper","zucchini","aubergine","chicken-breast","capers","mushrooms","lamb"],after:["oregano","parsley","lemon","mint","olive-oil"],
 styles:["sameday","wholemeal","manakish","roman-tonda","coca"],stylesFlat:["manakish","lahmacun","flammkuchen","coca","sameday"]});
mt("spicy",{cats:["american","world",""],sauces:["cooked","buffalo","salsa"],cheese:[["mozzarella",110]],extraCheese:["cheddar","provolone"],
 pool:["salami","nduja","chorizo","jalapeno","pickled-jalapenos","red-onion","red-pepper","pineapple","sausage","pepperoni"],after:["honey","chilli-flakes","basil","coriander"],styles:["ny","sameday","neapolitan","pan","grandma"]});
mt("garden",{cats:["italian","world",""],sauces:["raw","pesto","white"],cheese:[["mozzarella",90],["fresh-mozzarella",90]],extraCheese:["ricotta","goat-cheese"],
 pool:["mushrooms","zucchini","aubergine","red-pepper","spinach","artichoke-hearts","black-olives","tomato","red-onion","broccoli","pumpkin","potatoes","fresh-figs"],after:["basil","rocket","lemon","parmesan","olive-oil"],styles:["neapolitan","sourdough","roman-tonda","wholemeal","sameday","pinsa"]});
mt("white",{cats:["italian","american",""],sauces:["white","cf","white"],cheese:[["mozzarella",80],["provolone",50]],extraCheese:["ricotta","blue-cheese","pecorino","goat-cheese"],
 pool:["mushrooms","spinach","potatoes","bacon","sausage","red-onion","chicken-breast","artichoke-hearts","broccoli","pear","walnuts"],after:["black-pepper","parsley","lemon","parmesan","honey"],styles:["ny","neapolitan","sameday","roman-tonda","pan"]});
mt("sweet",{cats:["sweet"],sauces:["spread","none"],cheese:[],extraCheese:["ricotta","mascarpone"],pool:["banana","apple","pear","berries","fresh-figs"],after:["honey","walnuts","dark-chocolate","cinnamon"],styles:["sameday","neapolitan","ny"],sweet:true});
mt("folded",{cats:["folded"],sauces:["raw","none"],cheese:[["mozzarella",80],["fresh-mozzarella",80]],extraCheese:["ricotta"],pool:["ham","salami","spinach","mushrooms","sausage","red-pepper","black-olives","chicken-breast","broccoli"],after:["parmesan","basil"],styles:["neapolitan","sameday"],fmts:["calzone","stromboli"]});
const MEATS=new Set(["salami","pepperoni","ham","prosciutto","sausage","bacon","chicken-breast","beef-strips","beef-mince","nduja","chorizo","lamb","left-chicken","left-beef","left-pork"]);
const FISH=new Set(["anchovies","tuna"]);
const single=(id,diet)=>{const e=K.ING[id];return !!e&&K.allowed({flags:e.f},diet)};
PZ.remix=function(o){
  o=o||{};const diet=o.diet||{},F=o.fridge||new Set(),U=o.urgent||new Set(),cat=o.cat||"";
  let themes=Object.values(T).filter(t=>t.cats.includes(cat)||(!cat&&t.cats.includes("")&&!t.sweet));
  if(!themes.length)themes=[T.italian];
  let best=null,bs=1e9;
  for(let tries=0;tries<60;tries++){
    const th=rnd(themes);let style=o.style;
    if(!style){const pool=cat==="pan"&&th.stylesPan?th.stylesPan:cat==="world"&&th.stylesFlat?th.stylesFlat:th.styles;style=rnd(pool)}
    const stObj=S[style];if(!stObj)continue;
    const fmts=th.fmts?rnd(th.fmts):"";
    if(fmts&&stObj.kind!=="round")continue;
    const sauce=rnd(th.sauces.filter(s=>SAUCES[s].ing.every(x=>single(x[0],diet))));if(!sauce&&th.sauces.length)continue;
    const cheeses=[];
    if(th.cheese.length){const c=rnd(th.cheese.filter(c=>single(c[0],diet)));if(c)cheeses.push(c);
      if(cheeses.length&&Math.random()<.45){const x=rnd(th.extraCheese.filter(id=>single(id,diet)&&id!==cheeses[0][0]));if(x)cheeses.push([x,PT[x].g,"cheese"])}}
    else if(th.extraCheese.length&&th.sweet){const x=rnd(th.extraCheese.filter(id=>single(id,diet)));if(x)cheeses.push([x,PT[x].g,"after"])}
    // fridge first (clock items and cooked leftovers before everything else), then the theme's own toppings
    const okTop=id=>PT[id]&&!CHEESE.has(id)&&PT[id].when!=="after"&&single(id,diet)&&((SWEETY.has(id))===!!th.sweet);
    const fridge=[...F].filter(id=>okTop(id)&&!["garlic","oregano","thyme","tomato-paste","breadcrumbs","sugar","brown-sugar","cinnamon","butter","rosemary","eggs","black-pepper"].includes(id)).sort((a,b)=>(U.has(b)-U.has(a))||((K.ING[b].aisle==="left")-(K.ING[a].aisle==="left"))||Math.random()-.5);
    const want=th.sweet?2:2+(Math.random()<.5?1:0),top=[],has=id=>top.some(t=>t[0]===id);
    const meats=()=>top.filter(t=>MEATS.has(t[0])).length;
    const can=id=>{
      if(has(id)||!okTop(id))return false;
      const FAM={"left-chicken":"chicken","chicken-breast":"chicken","left-beef":"beef","beef-strips":"beef","beef-mince":"beef","left-veg":"veg","left-potatoes":"pot","potatoes":"pot"},fm=FAM[id];
      if(fm&&top.some(t=>FAM[t[0]]===fm))return false;
      if(fm==="veg"&&false)return false;
      if(MEATS.has(id)&&meats()>=(th.id==="american"?3:2))return false;
      if(FISH.has(id)&&(top.some(t=>MEATS.has(t[0])||FISH.has(t[0]))))return false;
      if(MEATS.has(id)&&top.some(t=>FISH.has(t[0])))return false;
      if(id==="pineapple"&&!top.some(t=>["ham","bacon","chicken-breast","jalapeno","left-pork","left-chicken"].includes(t[0])))return false;
      if(id==="pear"&&!top.some(t=>["blue-cheese"].includes(t[0]))&&!cheeses.some(c=>c[0]==="blue-cheese")&&!th.sweet)return false;
      if(id==="fresh-figs"&&!th.sweet&&!top.some(t=>t[0]==="prosciutto"))return false;
      if(id==="tuna"&&sauce!=="raw")return false;
      if(id==="lamb"&&th.id!=="mediterranean")return false;
      if((id==="aubergine"||id==="zucchini")&&top.some(t=>["pineapple","pepperoni"].includes(t[0])))return false;
      return true};
    for(const id of fridge){if(top.length>=want)break;if(can(id))top.push([id,PT[id].g])}
    // leftovers must be used when present (cooked chicken/beef/pork, roast veg)
    const lefts=[...F].filter(id=>K.ING[id].aisle==="left"&&PT[id]&&single(id,diet)&&!th.sweet&&id!=="left-potatoes"||id==="left-potatoes"&&F.has(id)&&!th.sweet);
    lefts.forEach(id=>{if(!has(id)&&top.length<4&&can(id))top.push([id,PT[id].g])});
    let guard=0;while(top.length<want&&guard++<30){const id=rnd(th.pool);if(can(id))top.push([id,PT[id].g])}
    if(!top.length&&!th.sweet)continue;
    const after=[];const aPool=th.after.filter(id=>single(id,diet)&&!cheeses.some(c=>c[0]===id)&&!(id==="prosciutto"&&(meats()>=2||FISH.size&&top.some(t=>FISH.has(t[0])))));
    if(aPool.length){const a=rnd(aPool);after.push([a,PT[a].g])}
    if(!th.sweet&&Math.random()<.5){const a2=rnd(aPool.filter(x=>x!==(after[0]&&after[0][0])));if(a2)after.push([a2,PT[a2].g])}
    if(th.sweet&&Math.random()<.5){const a2=rnd(aPool.filter(x=>x!==(after[0]&&after[0][0])));if(a2)after.push([a2,PT[a2].g])}
    // sweet themes: sugar and cinnamon sit on the base before baking when there is no spread
    const pre=th.sweet&&sauce==="none"?[["brown-sugar",10],["cinnamon",1]]:[];
    const mains=top.map(t=>t[0]).filter(id=>PT[id]&&PT[id].when!=="after").slice(0,3);
    const label=joinNames([...new Set(mains.map(id=>nm(id).replace(/^leftover /,"").replace(/ breast$/,"").replace(/ strips$/,"")))]);
    const spec={id:"remix",name:cap(label||"cheese")+(th.sweet?" dessert pizza":fmts==="stromboli"?" stromboli":fmts?" calzone":" pizza"),from:"Remix",cat:th.sweet?"sweet":fmts?"folded":cat,style,sauce:sauce||"none",
      top:[...cheeses.map(c=>[c[0],c[1],c[2]]),...pre,...top.map(t=>[t[0],t[1]]),...after.map(t=>[t[0],t[1]])],remix:true,fmt:fmts,
      desc:`A new ${th.name.toLowerCase()}-style pizza invented from what you have${fridge.length?" and your fridge":""}.`};
    const r=PZ.resolve(spec,o);if(!r)continue;
    const miss=r.ing.filter(x=>x.grp!=="Dough"&&!x.have&&!(o.basic&&x.pantry)).length;
    const sc=(o.hasItems?miss*100:0)-r.urg*60-r.leftN*80-(Math.random()*5);
    if(sc<bs){best=r;bs=sc;if(miss===0&&(r.urg>0||r.leftN>0||!fridge.length))break}
  }
  return best;
};

/* ------------------------------------------------------------------ registry + validation */
PZ.add=list=>list.forEach(r=>{
  const who=r.id||"(no id)";
  if(!/^[a-z0-9-]+$/.test(who))bad(who,"id must be a lowercase slug");
  if(PZ.recipes.some(x=>x.id===r.id))bad(who,"duplicate pizza id");
  if(!r.name)bad(who,"missing name");
  if(!S[r.style])bad(who,"unknown dough style '"+r.style+"'");
  if(!SAUCES[r.sauce])bad(who,"unknown sauce '"+r.sauce+"'");
  if(!PZ.cats.some(c=>c[0]&&c[0]===r.cat))bad(who,"unknown category '"+r.cat+"'");
  if(r.fmt&&!FOLD[r.fmt]&&r.fmt!=="khachapuri")bad(who,"unknown format '"+r.fmt+"'");
  SAUCES[r.sauce]&&SAUCES[r.sauce].ing.forEach(x=>{if(!K.ING[x[0]])bad(who,"sauce uses unknown ingredient "+x[0])});
  if(!Array.isArray(r.top)||!r.top.length)bad(who,"needs toppings");
  (r.top||[]).forEach(t=>{if(!K.ING[t[0]])bad(who,"unknown ingredient '"+t[0]+"' (add it to ingredients.js)");if(!(t[1]>=0))bad(who,"bad amount for "+t[0]);if(t[2]&&!["on","late","after","cheese"].includes(t[2]))bad(who,"bad placement '"+t[2]+"' for "+t[0])});
  if(K.problems.some(p=>p.lvl==="error"&&p.who==="pizza "+who))return;
  PZ.recipes.push(r);
});
PZ.add(RC);
// every topping the generator can use must exist, and so must every dough/sauce ingredient
Object.keys(PT).forEach(id=>{if(!K.ING[id])bad(id,"topping table uses an unknown ingredient")});
Object.values(S).forEach(st=>{[...st.flours,...(st.liq||[]),...st.extra].forEach(x=>{if(!K.ING[x[0]])bad(st.id,"dough uses unknown ingredient "+x[0])});if(!st.heat||!st.bake||!st.shape)bad(st.id,"dough style missing text")});
Object.values(T).forEach(th=>{[...th.pool,...th.after,...(th.extraCheese||[])].forEach(id=>{if(!PT[id])bad(th.id,"theme topping '"+id+"' has no entry in the topping table")});th.cheese.forEach(c=>{if(!K.ING[c[0]])bad(th.id,"unknown cheese "+c[0])})});
})();
