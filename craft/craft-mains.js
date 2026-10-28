/* craft/craft-mains.js: Craft recipes for burgers, soup, grill, grains, noodles.
   Each entry is a tool: its controls (ctl) and a calc(s) that returns the card (title, meta, note, ing, steps).
   "learn" notes for the Good to know box live in LEARN below, keyed by tool then option. Load order: after craft-lib.js, before craft.js. */
(function(){
"use strict";
const {rg,G,ML,P1,eggs,hm,people}=window.CRAFTLIB;
Object.assign(window.CRAFTLIB.TOOLS,{
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
noodle:{title:"What are we slurping?",sub:"Noodles and a stir-fry sauce from pantry staples.",
 ctl:[{k:"n",label:"Noodles",icon:"noodle",def:"egg",tg:[["egg","Egg noodles"],["ramen","Ramen"],["udon","Udon (fresh)"],["soba","Soba"],["rice","Rice noodles"]]},{k:"s",label:"Sauce",icon:"sauce",def:"soy",tg:[["soy","Savoury soy"],["sweet","Sticky sweet"],["peanut","Peanut"]]},{k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,N={egg:["Egg noodles (dry)",80,4],ramen:["Ramen noodles (dry)",80,3],udon:["Udon noodles (fresh)",150,2],soba:["Soba noodles (dry)",80,5],rice:["Rice noodles (dry)",70,0]}[s.n],
   S={soy:[["Soy sauce",15],["Rice vinegar",5],["Sugar",3],["Sesame oil",3],["Cornflour",3],["Water",20]],sweet:[["Soy sauce",15],["Honey",10],["Rice vinegar",5],["Garlic, grated",3],["Water",20]],peanut:[["Peanut butter",20],["Soy sauce",10],["Lime juice",8],["Chilli flakes",.5],["Water",20]]}[s.s];
  return{title:"Stir-fried noodles for "+n,meta:[["clock","20 min"],["noodle",N[0].split(" (")[0]+" "+G(N[1]*n)]],note:[s.n==="rice"?"Soak rice noodles in hot (not boiling) water 10–20 minutes until flexible, then drain.":"Cook the noodles "+N[2]+" minutes, then rinse in cold water so they do not stick."],
   ing:[[N[0],G(N[1]*n)],["Vegetables, sliced",G(150*n)],["Chicken, tofu or prawns",G(100*n)],["Garlic",Math.max(1,n)+" cloves"],["Ginger",G(5*n)],["Oil",G(10*n)]].concat(S.map(x=>["Sauce: "+x[0],x[1]<1?"a pinch":G(x[1]*n)])),
   steps:["Whisk the sauce ingredients in a bowl.","Heat the oil in a wok on high heat. Cook the protein 3–4 minutes, then take it out.","Stir-fry the garlic and ginger 20 seconds, then the vegetables 3–4 minutes.","Add the noodles, protein and sauce. Toss 1–2 minutes until glossy and hot."]}}}
});
})();
