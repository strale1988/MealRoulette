/* craft/craft-doughs.js: Craft recipes for bread, pasta, dumplings.
   Each entry is a tool: its controls (ctl) and a calc(s) that returns the card (title, meta, note, ing, steps).
   "learn" notes for the Good to know box live in LEARN below, keyed by tool then option. Load order: after craft-lib.js, before craft.js. */
(function(){
"use strict";
const {rg,G,ML,P1,eggs,hm,people}=window.CRAFTLIB;
Object.assign(window.CRAFTLIB.TOOLS,{
bread:{title:"What are we baking?",sub:"Baker's percentages: pick a bread and your flour, and every amount follows.",
 ctl:[{k:"t",label:"Bread",icon:"bread",def:"lean",tg:[["lean","Everyday loaf"],["sour","Sourdough"],["focaccia","Focaccia"],["rolls","Soft rolls"],["pita","Flatbreads"],["naan","Naan"],["bagel","Bagels"]]},
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
   naan:{n:"Naan",h:38,y:1,sl:2,sugar:2,oil:4,yog:30,
    st:["Stir the yeast and sugar into the warm water and leave 5 minutes. Mix with the flour, salt, yogurt and oil and knead 8 minutes until soft and slightly sticky.","Cover and rise about 1–1½ hours until doubled.","Divide into 100 g balls and rest 10 minutes. Roll each into a teardrop about 5 mm thick.","Heat a heavy dry pan (cast iron is best) until very hot. Cook one naan at a time with a lid on, 1–2 minutes per side, until puffed with dark blisters.","Brush with melted butter (garlic or herbs are good) and keep warm wrapped in a cloth."]},
   bagel:{n:"Bagels",h:55,y:1,sl:2,sugar:2,
    st:["Mix everything and knead 10 minutes: the dough is stiff and should feel smooth and elastic. Rest 1 hour, covered.","Divide into 110 g pieces. Shape each into a tight ball, poke a hole through the middle and stretch it to about 5 cm.","Proof on a floured tray 30 minutes (or cover and chill overnight for better flavour). Heat the oven to 230 °C.","Bring a wide pot of water to a gentle boil with a spoonful of honey or sugar. Boil the bagels 1 minute per side, in batches.","Drain, add toppings if you like (seeds, salt), and bake 18–22 minutes until deep golden. Cool on a rack."]},
   pita:{n:"Flatbreads",h:62,y:1,sl:2,oil:3,
    st:["Mix everything and knead 8 minutes until smooth. Rise about 1 hour.","Divide into 90 g balls and roll each into a 3 mm disc.","Heat a dry pan until very hot. Cook 1–2 minutes per side until puffed with brown spots.","Stack and wrap in a cloth so they stay soft."]}}[s.t];
  const st=B.starter?F*B.starter/100:0,fl=F-st/2,wt=F*B.h/100-st/2-(B.milk?0:0),ing=[],sub=B.milk?"warm milk":"water";
  ing.push(["Flour",G(fl)],[B.milk?"Warm milk":s.t==="naan"?"Warm water (about 35 °C)":"Water (about 25 °C)",G(wt)]);
  if(B.yog)ing.push(["Plain yogurt",G(F*B.yog/100)]);
  if(st)ing.push(["Active sourdough starter (100% hydration)",G(st)]);
  ing.push(["Salt",(Math.round(F*B.sl/100*2)/2)+" g"]);
  if(B.y)ing.push(["Instant yeast",(Math.max(1,Math.round(F*B.y/100*2)/2))+" g"]);
  if(B.sugar)ing.push(["Sugar",G(F*B.sugar/100)]);
  if(B.butter)ing.push(["Soft butter",G(F*B.butter/100)]);
  if(B.egg)ing.push(["Egg",eggs(F*B.egg/100)]);
  if(B.oil)ing.push([s.t==="focaccia"?"Olive oil (dough 6%, plus tray and top)":"Oil",G(s.t==="focaccia"?F*.14:F*B.oil/100)]);
  const tot=F+wt-0+(B.yog||0)*F/100+(B.sugar||0)*F/100+(B.butter||0)*F/100+(B.egg||0)*F/100+(B.oil||0)*F/100,
   made=s.t==="rolls"?Math.round(tot/70)+" rolls":s.t==="naan"?Math.round(tot/100)+" naan":s.t==="bagel"?Math.round(tot/110)+" bagels":s.t==="pita"?Math.round(tot/90)+" flatbreads":s.t==="focaccia"?"one tray about "+(F<=500?"25 × 35":"30 × 40")+" cm":"about "+Math.max(1,Math.round(tot/800*10)/10)+" loaf"+(tot>1200?"s":"");
  return{title:B.n,meta:[["clock",s.t==="sour"?"About 1 day":s.t==="pita"||s.t==="naan"?"About 2 hours":s.t==="bagel"?"About 3 hours":"About 4 hours"],["bread","Dough "+G(tot)],["check","Makes "+made]],
   note:["Hydration "+B.h+"%. Salt "+B.sl+"% of the flour weight."],ing,steps:B.st}}},
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
dumpling:{title:"What are we folding?",sub:"Gyoza, jiaozi, momo and pierogi: dough, filling and cooking for any number.",
 ctl:[{k:"t",label:"Style",icon:"dumpling",def:"gyoza",tg:[["gyoza","Pan-fried gyoza"],["jiaozi","Boiled jiaozi"],["momo","Steamed momo"],["pierogi","Pierogi (potato and cheese)"]]},{k:"c",label:"How many",icon:"ruler",def:24,step:[12,72,12,""]}],
 calc(s){
  if(s.t==="pierogi"){const c=s.c,k=c/24;
   return{title:c+" pierogi",meta:[["clock","About 1½ hours"],["dumpling","Filling about 25 g each"],["flame","Boil, then pan-fry"]],
    note:["Boil first, then fry in butter with onions for the classic finish. Freeze uncooked on a tray, then bag them, and boil from frozen 2 minutes longer."],
    ing:[["Dough: plain flour",G(400*k)],["Dough: warm water",G(150*k)],["Dough: egg",eggs(50*k)],["Dough: sour cream",G(80*k)],["Dough: melted butter",G(20*k)],["Dough: salt",P1(4*k)+" g"],["Filling: floury potatoes, peeled",G(400*k)],["Filling: farmer's cheese or ricotta",G(150*k)],["Filling: onion, finely chopped",G(80*k)],["Filling: butter",G(20*k)],["Filling: salt and black pepper",P1(4*k)+" g"],["Butter, for frying and serving",G(30*k)],["Sour cream, to serve","to taste"]],
    steps:["Mix the flour and salt, add the egg, sour cream, melted butter and warm water and knead 8 minutes until soft and smooth. Wrap and rest 30 minutes.","Boil the potatoes until tender, drain well and mash until smooth. Cook the onion in the butter 8–10 minutes until golden. Mix with the potato and cheese, season generously and cool completely.","Roll the dough 2 mm thin on a floured board and cut 8 cm circles. Put about 1 tablespoon of filling on each, fold over, and pinch the edge firmly to seal. Cover the finished ones so they do not dry out.","Boil in batches in a large pot of salted water. When they float, cook 3 minutes more. Lift out and drain.","Fry in butter in a wide pan 2–3 minutes per side until golden. Serve with fried onions and sour cream."],
    learn:["Floury potatoes (Maris Piper, Russet) mash dry and fluffy. Waxy ones make a gluey filling.","The filling must be cool before you fill the dough, or it softens the dough and the pierogi tear."]}}
  const c=s.c,fl=c*(s.t==="gyoza"?12:15),how={
   gyoza:["Heat 1 tablespoon of oil in a non-stick pan with a lid. Place the dumplings flat side down and fry 2 minutes until golden.","Add "+G(c*5)+" of water, cover and steam 5–6 minutes. Uncover and cook until the water has gone and the bottoms are crisp."],
   jiaozi:["Boil in plenty of water. When they float, cook 2–3 minutes more, until the wrappers look slightly see-through."],
   momo:["Steam over boiling water on an oiled rack 10–12 minutes, until the wrappers are glossy and firm."]}[s.t];
  return{title:c+" "+({gyoza:"gyoza",jiaozi:"jiaozi",momo:"momo"})[s.t],meta:[["clock","About 1 hour"],["dumpling","Filling "+G(fl)+" in total"],["flame",s.t==="gyoza"?"Fry then steam":s.t==="jiaozi"?"Boil 5–8 min":"Steam 10–12 min"]],
   note:["Per dumpling: 10 g of dough and "+(s.t==="gyoza"?12:15)+" g of filling. Freeze uncooked on a tray, then bag them. Cook from frozen, 2 minutes longer."],
   ing:[["Wrapper: flour",G(c*10)],["Wrapper: warm water",G(c*5)],["Wrapper: salt",P1(c*.1)+" g"],["Pork mince (or chicken, or crumbled tofu)",G(fl*.55)],["Cabbage, finely chopped",G(fl*.35)],["Salt, for the cabbage",P1(fl*.35*.01)+" g"],["Spring onion",G(fl*.05)],["Ginger, grated",G(fl*.02)],["Soy sauce",G(fl*.03)],["Sesame oil",P1(fl*.015)+" g"]],
   steps:["Mix the flour and salt, stir in the warm water and knead 8 minutes until smooth. Rest 30 minutes under a cloth.","Toss the cabbage with its salt, wait 10 minutes and squeeze out the water. Mix with all the other filling ingredients.","Roll the dough into 8 cm discs ("+c+" of them, 10 g each).","Put a spoonful of filling in the middle, wet the edge, fold in half and pleat to seal."].concat(how,["Dip in soy sauce mixed with a little rice vinegar."])}}}
});
Object.assign(window.CRAFTLIB.LEARN,{
bread:{lean:["Folding the dough builds strength without kneading. Wet hands stop it sticking.","The tray of water in the oven makes steam, which keeps the crust soft long enough for the loaf to rise fully."],
 naan:["Yogurt makes the dough tender and slightly tangy, and the high heat in the pan makes the bubbles puff.","Keep a lid on the pan: the trapped steam helps the naan puff and cooks the top."],
 bagel:["Boiling sets the crust before baking, which is what gives bagels their chewy skin and dense crumb.","The dough is stiff on purpose, with less water than regular bread. Overnight proofing in the fridge makes the best flavour."]}
});
})();
