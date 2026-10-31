/* craft/craft-mains.js: Craft recipes for burgers, soup, grill, grains, noodles.
   Each entry is a tool: its controls (ctl) and a calc(s) that returns the card (title, meta, note, ing, steps).
   "learn" notes for the Good to know box live in LEARN below, keyed by tool then option. Load order: after craft-lib.js, before craft.js. */
(function(){
"use strict";
const {rg,G,ML,P1,eggs,hm,people}=window.CRAFTLIB;
const cl=x=>{const v=P1(x);return v+(v===1?" clove":" cloves")}; // "1 clove", "2 cloves"
const sl=x=>Math.max(.5,Math.round(x*.008*2)/2)+" g"; // salt at 0.8% of the liquid
/* named soups and chilli: each returns {n,m,note,ing,st} for n people */
const SOUPS={
 tomato:n=>({n:"Tomato soup",m:"35 min",note:"Canned tomatoes give a deeper, sweeter soup than fresh ones outside summer. Serve with grilled cheese for dunking.",
  ing:[["Butter or olive oil",G(10*n)],["Onion, chopped",G(60*n)],["Garlic",cl(.5*n)],["Canned whole tomatoes",G(200*n)],["Stock or water",G(150*n)],["Sugar (only if sharp)",P1(1*n)+" g"],["Cream (optional)",G(20*n)],["Fresh basil",G(2*n)],["Salt",sl(350*n)]],
  st:["Soften the onion in the butter 6–8 minutes, until sweet and translucent. Add the garlic for 1 minute.","Add the tomatoes (crushing them), the stock and the sugar. Simmer 20 minutes.","Blend until smooth. Stir in the cream, if using, and reheat gently.","Season with salt and pepper and top with torn basil."]}),
 noodle:n=>({n:"Chicken noodle soup",m:"45 min",note:"Add the noodles at the end so they do not turn soft and swell. If you are keeping leftovers, cook the noodles separately.",
  ing:[["Chicken thighs or breast, skinless",G(100*n)],["Stock",G(400*n)],["Carrot, sliced",G(50*n)],["Celery, sliced",G(30*n)],["Onion, chopped",G(50*n)],["Olive oil",G(5*n)],["Egg noodles (dry)",G(25*n)],["Parsley, chopped",G(3*n)],["Lemon juice",P1(4*n)+" g"],["Salt",sl(400*n)]],
  st:["Soften the onion, carrot and celery in the oil 6 minutes.","Add the stock and the chicken, bring to a gentle simmer and cook 18–20 minutes, until the chicken is cooked through (75 °C).","Lift out the chicken, shred it with two forks and return it to the pot.","Add the noodles and cook 6–8 minutes until tender.","Stir in the parsley and lemon juice. Season with salt and pepper."]}),
 lentil:n=>({n:"Red lentil soup",m:"35 min",note:"Red lentils need no soaking and break down into a creamy soup without any cream. Blend half for a thicker texture.",
  ing:[["Red lentils, rinsed",G(60*n)],["Oil or butter",G(10*n)],["Onion, chopped",G(60*n)],["Carrot, diced",G(50*n)],["Garlic",cl(.5*n)],["Ground cumin",P1(1.5*n)+" g"],["Stock or water",G(400*n)],["Lemon juice",P1(5*n)+" g"],["Salt",sl(400*n)]],
  st:["Soften the onion and carrot in the oil 6 minutes. Add the garlic and cumin for 1 minute.","Add the lentils and the stock. Bring to a boil, then simmer 20–25 minutes, until the lentils are soft.","Blend part or all of the soup. Thin with water if needed.","Season with salt and finish with the lemon juice."]}),
 mine:n=>({n:"Minestrone",m:"50 min",note:"Use whatever vegetables you have. Add a parmesan rind to the pot for extra flavour.",
  ing:[["Olive oil",G(10*n)],["Onion, diced",G(40*n)],["Carrot, diced",G(40*n)],["Celery, diced",G(30*n)],["Courgette, diced",G(50*n)],["Potato, diced",G(50*n)],["Canned chopped tomatoes",G(80*n)],["Canned cannellini beans, drained",G(50*n)],["Small pasta",G(20*n)],["Stock",G(350*n)],["Parmesan, to serve",G(8*n)],["Salt",sl(400*n)]],
  st:["Soften the onion, carrot and celery in the oil 8 minutes.","Add the potato, tomatoes and stock. Simmer 15 minutes.","Add the courgette, beans and pasta and cook 10 minutes more, until the pasta is tender.","Season with salt and pepper. Serve with parmesan and a drizzle of olive oil."]}),
 chili:n=>({n:"Chilli con carne",m:"1 h 15 min",note:"Better the next day. Serve with rice, tortillas or baked potatoes. Freezes well for 3 months.",
  ing:[["Beef mince",G(120*n)],["Onion, chopped",G(70*n)],["Garlic",cl(.75*n)],["Oil",G(8*n)],["Tomato purée",G(10*n)],["Canned chopped tomatoes",G(100*n)],["Canned kidney beans, drained",G(100*n)],["Chilli powder",P1(3*n)+" g"],["Ground cumin",P1(2*n)+" g"],["Smoked paprika",P1(2*n)+" g"],["Stock or water",G(80*n)],["Salt",P1(1.5*n)+" g"]],
  st:["Soften the onion in the oil 6 minutes. Add the garlic and spices and stir 1 minute.","Add the mince and brown it well, breaking it up, about 8 minutes. Stir in the tomato purée for 1 minute.","Add the tomatoes and stock. Simmer on low heat, partly covered, 40 minutes, stirring now and then.","Add the beans and cook 10 minutes more, until thick. Taste and add salt, and more chilli if you like it hot."]})
};
/* rice dishes beyond the plain grains */
const GRAINX=(s,n)=>{
 if(s.t==="fried")return{title:"Egg fried rice for "+n,meta:[["clock","15 min"],["rice","Cooked rice "+G(200*n)],["flame","High heat"]],note:["Use cold, day-old rice: freshly cooked rice is too wet and turns to mush. Cook it, spread it on a tray and chill it."],
  ing:[["Cooked cold rice (about "+G(75*n)+" dry)",G(200*n)],["Eggs",eggs(50*n)],["Oil",G(10*n)],["Spring onion, sliced",G(15*n)],["Garlic",cl(.5*n)],["Frozen peas and diced carrot",G(50*n)],["Soy sauce",G(12*n)],["Sesame oil",P1(3*n)+" g"],["White pepper","a pinch"]],
  steps:["Break up the cold rice with your hands so there are no clumps.","Heat half the oil in a wok on high heat. Scramble the eggs 30 seconds and take them out.","Add the rest of the oil, then the garlic and white parts of the spring onion for 20 seconds. Add the peas and carrot for 1 minute.","Add the rice and stir-fry 3–4 minutes, pressing it against the wok, until hot and starting to crisp.","Return the egg, add the soy sauce and sesame oil and toss. Finish with the green spring onion."],
  learn:["Cooked rice dries out in the fridge, and dry grains fry up separate and fluffy instead of sticky.","Keep the heat high and the batch small. A crowded pan steams the rice instead of frying it."]};
 if(s.t==="pilaf")return{title:"Rice pilaf for "+n,meta:[["clock","30 min"],["rice","Dry "+G(75*n)],["jar","Pot with a lid"]],note:["Toasting the rice and noodles in butter gives pilaf its nutty flavour and keeps the grains separate."],
  ing:[["Long-grain rice",G(75*n)],["Butter",G(10*n)],["Vermicelli, broken into short pieces",G(8*n)],["Onion, finely chopped",G(30*n)],["Hot stock",G(112*n)],["Bay leaf","1"],["Salt (taste the stock first)",P1(.8*n)+" g"]],
  steps:["Rinse the rice until the water runs nearly clear. Drain well.","Melt the butter in a pot. Fry the vermicelli until golden brown, 1–2 minutes. Add the onion and soften 3 minutes.","Add the rice and stir 2 minutes until coated and slightly translucent.","Pour in the hot stock, add the bay leaf and salt and bring to a boil. Cover, turn the heat to the lowest setting and cook 12 minutes.","Rest, covered, 10 minutes. Fluff with a fork and remove the bay leaf."],
  learn:["Pilaf is made across the Middle East, Central Asia and the Balkans, and each region has its own version.","Hot stock keeps the pot at a simmer so the rice cooks evenly."]};
 return{title:"Sushi rice for "+n,meta:[["clock","50 min"],["rice","Dry "+G(80*n)],["jar","Makes enough for "+Math.max(1,Math.round(n*1.5))+" rolls or bowls"]],note:["Use short-grain or sushi rice. Long-grain rice will not stick together."],
  ing:[["Sushi rice",G(80*n)],["Water",ML(88*n)],["Rice vinegar",G(15*n)],["Sugar",P1(6*n)+" g"],["Salt",P1(1.5*n)+" g"]],
  steps:["Rinse the rice in cold water, swirling and draining, until the water runs almost clear. Drain and rest 20 minutes.","Cook the rice with the water in a covered pot: bring to a boil, then lowest heat 12 minutes. Do not lift the lid. Rest 10 minutes.","Warm the vinegar, sugar and salt until dissolved.","Tip the rice into a wide bowl, pour the vinegar mix over and fold with a cutting motion. Fan the rice while mixing so it cools quickly and turns glossy.","Cover with a damp cloth and use within 2 hours at room temperature."],
  learn:["Short-grain rice has more starch, which is what makes it sticky enough to hold sushi together.","Cut and fold the vinegar through rather than stirring, which would crush the grains and turn them to paste."]};
};
Object.assign(window.CRAFTLIB.TOOLS,{
burger:{title:"What are we flipping?",sub:"Pick your patty, cheese, sauce and toppings, or spin for a surprise.",
 spinLabel:"Spin a burger!",spinNote:"Stacking your burger…",
 names:["Cheddar beef","Swiss and caramelised onion","Blue cheese lamb","Smoky BBQ bacon","Chipotle chicken","Black bean and avocado","Fried egg and bacon","Jalapeño cheddar","Garlic aioli chicken","Classic with pickles","Lamb and tomato","Beef, egg and avocado","Smash with American cheese","Salmon and dill","Turkey and pepper jack","Portobello and swiss"],
 spin(s){ // a random burger that still makes sense: toppings are shuffled, bacon stays off the veggie one
  const pk=a=>a[Math.floor(Math.random()*a.length)],sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  s.t=pk(["beef","beef","smash","lamb","chicken","turkey","salmon","bean","mushroom"]);s.c=pk(["none","cheddar","cheddar","swiss","blue","american","pepperjack"]);s.s=pk(["classic","bbq","chipotle","aioli","special"]);
  s.o=sh(["lettuce","tomato","onion","pickles","bacon","egg","avocado","jalapeno","caramel"].filter(x=>!(x==="bacon"&&(s.t==="bean"||s.t==="mushroom")))).slice(0,2+Math.floor(Math.random()*3))},
 ctl:[{k:"p",label:"Burgers",icon:"burger",def:null,step:[1,12,1,""]},{k:"b",label:"Buns",icon:"bread",def:"home",tg:[["home","Homemade"],["shop","Shop-bought"]]},{k:"z",label:"Patty size (150 g is classic)",icon:"ruler",def:150,step:[60,500,10,"g"]},
  {k:"t",label:"Patty",icon:"burger",def:"beef",tg:[["beef","Beef"],["lamb","Lamb"],["chicken","Chicken"],["bean","Black bean (veggie)"],["smash","Smash beef"],["turkey","Turkey"],["salmon","Salmon"],["mushroom","Portobello (veggie)"]]},
  {k:"c",label:"Cheese",icon:"dairy",def:"none",tg:[["none","No cheese"],["cheddar","Cheddar"],["swiss","Swiss"],["blue","Blue cheese"],["american","American cheese"],["pepperjack","Pepper jack"]]},
  {k:"s",label:"Sauce",icon:"sauce",def:"classic",tg:[["classic","Classic"],["bbq","Smoky BBQ"],["chipotle","Chipotle mayo"],["aioli","Garlic aioli"],["special","Burger sauce"]]},
  {k:"o",label:"Toppings (pick any)",icon:"salad",def:["pickles"],ms:[["lettuce","Lettuce"],["tomato","Tomato"],["onion","Red onion"],["pickles","Pickles"],["bacon","Bacon"],["egg","Fried egg"],["avocado","Avocado"],["jalapeno","Jalapeños"],["caramel","Caramelised onions"]]}],
 calc(s){
  const n=s.p||people,z=Math.min(500,Math.max(60,+s.z||150)),kb=z>200?3:2,shop=s.b==="shop",meat=n*z,top=Array.isArray(s.o)?s.o:[],has=k=>top.includes(k),pt=s.t||"beef",ch=s.c||"none",sc=s.s||"classic";
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
   smash:{w:"smash",flame:"71 °C inside",note:"Use beef mince with about 20% fat. Roll loose balls and do not pack them: the fat is what makes the crispy, lacy edges.",
    ing:[["Patty: beef mince (20% fat)",G(meat)],["Patty: salt",P1(meat*.01)+" g"],["Patty: black pepper",P1(meat*.004)+" g"]],
    shape:"Patties: loosely roll "+(kb*n)+" balls of "+Math.round(z/kb)+" g without packing them. Chill until you cook. Season only after you smash.",
    cook:"Heat a cast-iron pan or griddle until it is smoking hot. Put the balls down, smash each flat with a stiff spatula, season and cook 2 minutes until the edges are crisp and lacy. Scrape under, flip, add the cheese and cook 1 minute more. Stack "+(kb===3?"three":"two")+" patties per burger.",rest:""},
   turkey:{w:"turkey",flame:"75 °C inside",note:"Use thigh mince if you can, since breast mince turns dry. Turkey must cook all the way through.",
    ing:[["Patty: turkey mince (thigh)",G(meat)],["Patty: salt",P1(meat*.01)+" g"],["Patty: dried sage",P1(meat*.004)+" g"],["Patty: garlic powder",P1(meat*.004)+" g"],["Patty: olive oil",G(meat*.03)]],
    shape:"Patties: mix the mince lightly with the salt, sage, garlic powder and oil, then shape "+n+" patties of "+z+" g. Chill 15 minutes.",
    cook:"Cook in a hot pan or on a grill over medium-high heat 4–5 minutes per side, until 75 °C inside.",rest:" Rest 3 minutes."},
   salmon:{w:"salmon",flame:"63 °C inside",note:"Chop the salmon by hand into small pieces instead of mincing it, so the patties keep a good texture. Chill well so they hold together.",
    ing:[["Patty: skinless salmon fillet",G(meat)],["Patty: breadcrumbs",G(meat*.1)],["Patty: egg, beaten",G(meat*.08)],["Patty: Dijon mustard",P1(meat*.01)+" g"],["Patty: fresh dill, chopped",G(meat*.02)],["Patty: salt",P1(meat*.008)+" g"]],
    shape:"Patties: chop the salmon by hand into small pieces. Fold in the breadcrumbs, egg, mustard, dill and salt, then shape "+n+" patties of "+z+" g. Chill 20 minutes.",
    cook:"Cook in a pan with a little oil over medium heat 3–4 minutes per side, until golden and opaque all through. Turn only once.",rest:""},
   mushroom:{w:"portobello",flame:"Tender all through",note:"Wipe the caps instead of washing them, and pat them dry, so they brown instead of steaming.",
    ing:[["Patty: large portobello mushroom caps",n+(n>1?" caps":" cap")],["Patty: olive oil",G(10*n)],["Patty: balsamic vinegar",G(8*n)],["Patty: garlic, crushed",P1(2*n)+" g"],["Patty: salt",P1(1*n)+" g"]],
    shape:"Patties: remove the stems and wipe the caps. Marinate them in the oil, balsamic, garlic and salt for 15 minutes.",
    cook:"Cook in a hot pan or on a grill 4–5 minutes per side, pressing once, until tender and well browned.",rest:""},
   bean:{w:"black bean",flame:"Crisp and hot through",note:"Mash only half the beans so the patties keep some bite. Chilling 20 minutes helps them hold together.",
    ing:[["Patty: canned black beans, drained",G(meat*.5)],["Patty: breadcrumbs or rolled oats",G(meat*.2)],["Patty: onion, grated",G(meat*.15)],["Patty: egg, beaten",G(meat*.12)],["Patty: smoked paprika",P1(meat*.008)+" g"],["Patty: ground cumin",P1(meat*.008)+" g"],["Patty: salt",P1(meat*.01)+" g"]],
    shape:"Patties: mash half the beans roughly with a fork, mix in everything else for the patties, and shape "+n+" patties of "+z+" g. Chill 20 minutes.",
    cook:"Cook in a pan with a little oil over medium heat 4 minutes per side, until crisp outside and hot through. Do not press on them.",rest:""}}[pt]||null;
  if(pt!=="smash"&&pt!=="mushroom"){ // a big patty is thick: sear it, then finish it in the oven so the middle cooks before the outside burns
   if(z>200)PT.cook="At "+z+" g these patties are thick, so a pan alone would burn the outside before the middle is done. Sear them in a very hot pan or on a grill 3 minutes per side until well browned, then finish them in a 180 °C oven for "+(z>350?"12–15":"6–10")+" minutes, until "+(/°C/.test(PT.flame)?PT.flame:"hot all the way through")+".";
   else if(z<100)PT.cook+=" Small patties cook faster, so check them after 2 minutes per side."}
  const CH={cheddar:["Cheddar, sliced",20,"cheddar"],swiss:["Swiss cheese (Emmental or Gruyère), sliced",20,"Swiss"],blue:["Blue cheese, crumbled",15,"blue cheese"],american:["American cheese slices",20,"American cheese"],pepperjack:["Pepper jack cheese, sliced",20,"pepper jack"]}[ch];
  const SC={classic:[["Sauce: mayonnaise",20],["Sauce: ketchup",10],["Sauce: mustard",4]],bbq:[["Sauce: BBQ sauce",25],["Sauce: mayonnaise",10]],chipotle:[["Sauce: mayonnaise",25],["Sauce: chipotle paste (or chipotles in adobo)",5],["Sauce: lime juice",4]],aioli:[["Sauce: mayonnaise",25],["Sauce: garlic, crushed",3],["Sauce: lemon juice",4]],special:[["Sauce: mayonnaise",20],["Sauce: ketchup",10],["Sauce: pickle relish",8],["Sauce: mustard",3]]}[sc]||[];
  const TP={lettuce:["Lettuce leaves",15],tomato:["Tomato, sliced",30],onion:["Red onion, thinly sliced",15],pickles:["Chopped pickles",15],bacon:["Streaky bacon",30],egg:["Eggs, for frying",n+(n>1?" eggs":" egg")],avocado:["Ripe avocado, sliced",40],jalapeno:["Pickled jalapeños",8],caramel:["Onions, for caramelising",60]};
  const tops=Object.keys(TP).filter(has).map(k=>["Toppings: "+TP[k][0],typeof TP[k][1]==="number"?G(TP[k][1]*n):TP[k][1]]);
  if(has("caramel"))tops.push(["Toppings: Butter, for the onions",P1(5*n)+" g"]);
  const stack=[has("lettuce")&&"lettuce",PT.w+" patty"+(CH?" with "+CH[2]:""),has("bacon")&&"bacon",has("egg")&&"fried egg",has("avocado")&&"avocado",has("caramel")&&"caramelised onions",has("tomato")&&"tomato",has("onion")&&"red onion",has("pickles")&&"pickles",has("jalapeno")&&"jalapeños"].filter(Boolean);
  const st=shop?[]:["Buns: knead the flour, milk, egg, sugar, yeast and salt 8 minutes. Work in the butter. Rise 1 hour.","Divide into "+n+" balls, shape, proof 40 minutes and bake at 190 °C for 15 minutes. Cool."];
  if(has("caramel"))st.push("Onions: slice them thinly and cook slowly in the butter with a pinch of salt for 25 minutes, stirring now and then, until soft and golden.");
  st.push(PT.shape);
  if(has("bacon"))st.push("Fry the bacon in a dry pan until crisp, then drain it on paper.");
  st.push(PT.cook+(CH?" Lay the cheese on the patties for the last minute and cover with a lid so it melts.":"")+PT.rest);
  if(has("egg"))st.push("Fry the eggs in a little oil 2–3 minutes, until the whites are set and the yolk is still soft.");
  st.push("Stir the sauce ingredients together and toast the buns.","Build from the bottom: sauce on the bottom bun, then "+stack.join(", ")+". Add the top bun and press down gently.");
  return{title:n+" "+(CH?CH[2]+" ":"")+PT.w+" burger"+(n>1?"s":""),meta:[["clock",shop?"About "+(has("caramel")?"50":"30")+" min":"About 3 hours (buns)"],["burger","Patties "+G(meat)],["flame",PT.flame]],note:[PT.note],
   ing:PT.ing.concat(shop?[["Bun: burger buns",n+(n>1?" buns":" bun")]]:[["Bun: flour",G(70*n)],["Bun: warm milk",G(40*n)],["Bun: egg",eggs(12*n)],["Bun: butter",G(8*n)],["Bun: sugar",P1(7*n)+" g"],["Bun: instant yeast",P1(Math.max(2,n)*.7)+" g"],["Bun: salt",P1(1.2*n)+" g"]],SC.map(x=>[x[0],G(x[1]*n)]),CH?[["Toppings: "+CH[0],G(CH[1]*n)]]:[],tops),
   steps:st}}},
soup:{title:"What are we simmering?",sub:"Stock, soups and chilli for your table.",
 ctl:[{k:"t",label:"Make",icon:"soup",def:"soup",tg:[["soup","Soup"],["stock","Stock"],["tomato","Tomato soup"],["noodle","Chicken noodle soup"],["lentil","Red lentil soup"],["mine","Minestrone"],["chili","Chilli con carne"]]},
  {k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""],only:["soup","tomato","noodle","lentil","mine","chili"]},{k:"y",label:"Style",icon:"soup",def:"brothy",tg:[["brothy","Brothy"],["creamy","Creamy"]],only:"soup"},
  {k:"k",label:"Type",icon:"soup",def:"chicken",tg:[["chicken","Chicken"],["beef","Beef"],["veg","Vegetable"],["fish","Fish"]],only:"stock"},{k:"b",label:"Bones or scraps",icon:"ruler",def:1000,step:[500,3000,250,"g"],only:"stock"}],
 calc(s){
  if(SOUPS[s.t]){const n=s.p||people,R=SOUPS[s.t](n);return{title:R.n+" for "+n,meta:[["clock",R.m],["soup","Serves "+n],["fridge","Fridge 4 days · freezer 3 months"]],note:[R.note],ing:R.ing,steps:R.st}}
  if(s.t==="stock"){const b=s.b,T={chicken:{n:"Chicken",w:2,h:"3 hours",r:""},beef:{n:"Beef",w:2,h:"6 hours",r:"Roast the bones at 220 °C for 30 minutes first for a deeper flavour. "},veg:{n:"Vegetable",w:1.5,h:"45 minutes",r:""},fish:{n:"Fish",w:1.5,h:"30 minutes",r:"Use bones from white fish only. "}}[s.k],wt=b*T.w;
   return{title:T.n+" stock",meta:[["clock",T.h],["jar","Makes about "+G(wt*.85)],["fridge","Fridge 4 days · freezer 3 months"]],note:["Do not add salt now. Season the dish you cook with it."],
    ing:[[s.k==="veg"?"Vegetable scraps":"Bones",G(b)],["Cold water",G(wt)],["Onion",G(b*.15)],["Carrot",G(b*.1)],["Celery",G(b*.08)],["Bay leaves",Math.max(1,Math.round(b/1000))+""],["Black peppercorns",P1(b/1000*3)+" g"]],
    steps:[T.r+"Put everything in a big pot and cover with the cold water.","Bring slowly to a gentle simmer. Skim off the foam. Do not boil hard or the stock turns cloudy.","Simmer uncovered for "+T.h+".","Strain, cool quickly (within 2 hours) and chill. Remove the fat from the top before using."]}}
  const n=s.p||people,cr=s.y==="creamy",liq=350*n+(cr?0:0),salt=Math.round(liq*.008*2)/2;
  return{title:(cr?"Creamy":"Brothy")+" soup for "+n,meta:[["clock","About 40 min"],["soup","Serves "+n],["fridge","Fridge 4 days · freezer 3 months"]],note:["Freeze in portions and leave 2 cm of space at the top of the container."],
   ing:[["Vegetables, chopped",G(250*n)],["Onion",G(50*n)],["Oil or butter",G(10*n)],["Stock",G(liq)]].concat(cr?[["Potato (makes it creamy)",G(80*n)],["Cream (optional)",G(20*n)]]:[["Small pasta, rice or beans (optional)",G(25*n)]]).concat([["Salt","about "+salt+" g"]]),
   steps:["Soften the onion in the oil 5 minutes.","Add the vegetables"+(cr?" and potato":"")+" and stir 3 minutes.","Add the stock, bring to a boil, then simmer 20–25 minutes until everything is tender.",cr?"Blend until smooth, stir in the cream and heat through.":"Add the pasta, rice or beans for the last 10 minutes.","Season with salt and pepper at the end."]}}},
grill:{title:"What are we grilling?",sub:"Marinade amounts and cooking times by thickness.",
 ctl:[{k:"m",label:"Meat or fish",icon:"grill",def:"beef",tg:[["beef","Beef steak"],["pork","Pork chop"],["chicken","Chicken breast"],["lamb","Lamb chop"],["salmon","Salmon"],["prawn","Prawns"],["thigh","Chicken thigh"],["tuna","Tuna steak"]]},
  {k:"d",label:"Doneness",icon:"flame",def:"mr",tg:[["rare","Rare"],["mr","Medium-rare"],["med","Medium"],["well","Well done"]],only:"beef"},
  {k:"h",label:"Thickness",icon:"ruler",def:2.5,step:[1,5,.5,"cm"],only:["beef","pork","chicken","lamb","salmon","thigh","tuna"]},{k:"w",label:"Weight",icon:"ruler",def:1000,step:[250,2000,250,"g"]}],
 calc(s){
  const D={rare:[1.2,"50 °C"],mr:[1.6,"55 °C"],med:[2,"60 °C"],well:[2.6,"71 °C"]}[s.d]||[1.6,"55 °C"],
   M={beef:{n:"Beef steak",k:D[0],t:D[1],m:"2–8 hours"},pork:{n:"Pork chop",k:2.2,t:"63 °C",m:"2–6 hours"},chicken:{n:"Chicken breast",k:3.2,t:"74 °C",m:"2–6 hours"},lamb:{n:"Lamb chop",k:1.8,t:"57 °C",m:"2–8 hours"},salmon:{n:"Salmon",k:1.8,t:"55 °C",m:"30 minutes"},prawn:{n:"Prawns",k:null,t:"pink and curled",m:"30 minutes"},thigh:{n:"Chicken thigh (boneless)",k:2.4,t:"75 °C",m:"2–6 hours"},tuna:{n:"Tuna steak",k:1,t:"50 °C (seared, pink inside)",m:"30 minutes"}}[s.m],
   mins=M.k?Math.round(M.k*s.h*2)/2:2,w=s.w;
  return{title:M.n+(M.k?", "+s.h+" cm":""),meta:[["clock",mins+" min per side"],["flame","Inside: "+M.t],["grill","Rest 5 min"]],note:["Times are for a hot grill or pan and are a guide. A thermometer is the sure way."+(s.m==="chicken"&&s.h>3?" Butterfly thick breasts so they cook evenly.":"")],
   ing:[["Oil",G(w*.05)],["Acid (lemon juice or vinegar)",G(w*.02)],["Salt",P1(w*.01)+" g"],["Honey or sugar",G(w*.01)],["Garlic",cl(Math.max(1,Math.round(w/500)))],["Herbs or spices",G(w*.005)]],
   steps:["Whisk the marinade ingredients and coat the meat. Marinate in the fridge "+M.m+" (no longer, the acid turns it mushy).","Take it out 20 minutes before cooking and pat dry so it browns instead of steaming.","Cook "+mins+" minutes per side on a very hot grill or pan, turning once.","Check the inside reaches "+M.t+", then rest 5 minutes before cutting."]}}},
grain:{title:"What are we cooking?",sub:"Rice and grains with exactly the right water.",
 ctl:[{k:"t",label:"Grain",icon:"rice",def:"white",tg:[["white","White rice"],["basmati","Basmati"],["brown","Brown rice"],["quinoa","Quinoa"],["couscous","Couscous"],["bulgur","Bulgur"],["barley","Pearl barley"],["polenta","Polenta"],["risotto","Risotto"],["fried","Egg fried rice"],["pilaf","Rice pilaf"],["sushi","Sushi rice"]]},
      {k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  if(["fried","pilaf","sushi"].includes(s.t))return GRAINX(s,s.p||people);
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
noodle:{title:"What are we slurping?",sub:"Noodles and a stir-fry sauce from pantry staples.",
 ctl:[{k:"n",label:"Noodles",icon:"noodle",def:"egg",tg:[["egg","Egg noodles"],["ramen","Ramen"],["udon","Udon (fresh)"],["soba","Soba"],["rice","Rice noodles"]]},{k:"s",label:"Sauce",icon:"sauce",def:"soy",tg:[["soy","Savoury soy"],["sweet","Sticky sweet"],["peanut","Peanut"],["pad","Pad Thai"],["teri","Teriyaki"]]},{k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,N={egg:["Egg noodles (dry)",80,4],ramen:["Ramen noodles (dry)",80,3],udon:["Udon noodles (fresh)",150,2],soba:["Soba noodles (dry)",80,5],rice:["Rice noodles (dry)",70,0]}[s.n],
   S={soy:[["Soy sauce",15],["Rice vinegar",5],["Sugar",3],["Sesame oil",3],["Cornflour",3],["Water",20]],sweet:[["Soy sauce",15],["Honey",10],["Rice vinegar",5],["Garlic, grated",3],["Water",20]],peanut:[["Peanut butter",20],["Soy sauce",10],["Lime juice",8],["Chilli flakes",.5],["Water",20]],pad:[["Tamarind paste",10],["Fish sauce",10],["Sugar (palm sugar is best)",8],["Lime juice",5],["Water",15]],teri:[["Soy sauce",15],["Mirin (or 1 tsp extra sugar)",15],["Sugar",5],["Ginger, grated",2],["Water",15]]}[s.s];
  return{title:"Stir-fried noodles for "+n,meta:[["clock","20 min"],["noodle",N[0].split(" (")[0]+" "+G(N[1]*n)]],note:[s.n==="rice"?"Soak rice noodles in hot (not boiling) water 10–20 minutes until flexible, then drain.":"Cook the noodles "+N[2]+" minutes, then rinse in cold water so they do not stick."],
   ing:[[N[0],G(N[1]*n)],["Vegetables, sliced",G(150*n)],["Chicken, tofu or prawns",G(100*n)],["Garlic",Math.max(1,n)+" cloves"],["Ginger",G(5*n)],["Oil",G(10*n)]].concat(S.map(x=>["Sauce: "+x[0],x[1]<1?"a pinch":G(x[1]*n)])),
   steps:["Whisk the sauce ingredients in a bowl.","Heat the oil in a wok on high heat. Cook the protein 3–4 minutes, then take it out.","Stir-fry the garlic and ginger 20 seconds, then the vegetables 3–4 minutes.","Add the noodles, protein and sauce. Toss 1–2 minutes until glossy and hot."]}}}
});
Object.assign(window.CRAFTLIB.LEARN,{
grill:{thigh:["Thighs have more fat and connective tissue than breast, so they stay juicy and forgive a few extra minutes. Cook them to 75 °C or higher.","Pat the surface dry before cooking so it browns instead of steaming."],
 tuna:["Tuna is best seared hot and fast, leaving the middle rare. Cooking it through makes it dry.","Buy sushi-grade or very fresh tuna if you plan to eat it rare."]},
soup:{tomato:["Simmering tomatoes breaks down their acidity and brings out sweetness. A pinch of sugar only helps if they are sharp.","Blend while hot, with the lid vented, to avoid splashes."],
 noodle:["Simmering the chicken in the stock makes the stock richer as the soup cooks.","Noodles keep absorbing broth, so for leftovers store them separately."],
 lentil:["Red lentils are split and have no skin, which is why they cook so fast and fall apart into a creamy soup.","Lemon juice at the end brightens a soup that can taste flat."],
 mine:["Minestrone means 'big soup' in Italian, and it was traditionally made from whatever vegetables were in season.","Adding a parmesan rind while it simmers gives a deep, savoury background flavour."],
 chili:["Frying the spices in oil for a minute before adding liquid unlocks their flavour.","Chilli powder blends vary a lot in heat. Start with the amount given, then add more at the end."]}
});
})();
