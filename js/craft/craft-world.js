/* js/craft/craft-world.js: Craft tools for subjects the other tools do not cover: tacos and masa, tofu and tempeh, pie and pastry,
   plant milks, candy and caramel, sushi rolls. Same shape as craft-light.js: each tool has controls (ctl) and a calc(s) that returns the card
   (title, meta, note, ing, steps, learn). Load order: after craft-lib.js, before craft-ui.js.
   Overlaps on purpose avoided: pickles/hot sauce live in the Fermentation station, brines in the Brine lab, rice cooking in Grain,
   tin sizes for cakes in Bake, pizza and bread doughs in their own tools. */
(function(){
"use strict";
const {rg,G,P1,hm,people}=window.CRAFTLIB;
const g1=a=>(Math.round(a*10)/10)+" g";
const gs=a=>a<10?g1(a):G(a);                       // small amounts keep a decimal
const ml=a=>rg(a)+" ml";
const L=a=>a>=1000?(a/1000).toFixed(a%1000?2:0).replace(/\.?0+$/,"")+" L":rg(a)+" ml";
const N=(a,w)=>{const v=P1(a);return v+" "+(v===1?w:w+"s")};
Object.assign(window.CRAFTLIB.TOOLS,{

/* ---------------- Taco table ---------------- */
taco:{icon:"sandwich",title:"What is on the taco table?",sub:"Tortillas from masa harina or flour, tamales, and the salsas to go with them.",
 ctl:[{k:"t",label:"Make",icon:"sandwich",def:"corn",tg:[["corn","Corn tortillas"],["flour","Flour tortillas"],["tamal","Tamales"],["roja","Salsa roja"],["verde","Salsa verde"],["pico","Pico de gallo"]]},
  {k:"c",label:"How many",icon:"ruler",def:12,step:[4,48,4,""],only:["corn","flour"]},
  {k:"m",label:"How many tamales",icon:"ruler",def:12,step:[6,48,6,""],only:"tamal"},
  {k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""],only:["roja","verde","pico"]}],
 calc(s){
  if(s.t==="corn"){const n=s.c;return{title:n+" corn tortillas",meta:[["clock","30 min"],["flame","Hot dry pan"]],note:["Use masa harina (nixtamalised corn flour), not plain cornmeal. It is the only thing that makes a dough that holds together."],
   ing:[["Masa harina",G(13.5*n)],["Warm water",G(17*n)],["Salt",gs(.4*n)]],
   steps:["Mix the masa harina and salt, add the warm water and knead 2 minutes into a soft dough like play-dough. Cover and rest 15 minutes.","Roll into balls of about 30 g. Press each flat between two sheets of plastic in a tortilla press or under a heavy pan, to about 14 cm.","Cook on a very hot dry pan: 45 seconds, flip, 45 seconds, flip again until it puffs a little. Keep warm wrapped in a clean towel."],
   learn:["If the edges crack when you press, the dough is too dry: knead in a spoonful of water. If it sticks, add a spoonful of masa harina.","Wrapped in a towel, the steam finishes cooking them and keeps them pliable."]}}
  if(s.t==="flour"){const n=s.c;return{title:n+" flour tortillas",meta:[["clock","45 min"],["flame","Hot dry pan"]],note:["Resting the dough for 30 minutes is what lets you roll them thin without them shrinking back."],
   ing:[["Plain flour",G(40*n)],["Warm water",G(22*n)],["Lard or oil",G(8*n)],["Baking powder",gs(.6*n)],["Salt",gs(.8*n)]],
   steps:["Mix the flour, baking powder and salt. Rub in the lard, then add the warm water and knead 3 minutes into a smooth dough.","Divide into balls of about 70 g, cover and rest 30 minutes.","Roll each ball very thin, about 20 cm across. Cook on a hot dry pan 30 to 40 seconds per side until covered in light brown spots and puffed. Stack under a towel."]}}
  if(s.t==="tamal"){const n=s.m;return{title:n+" tamales",meta:[["clock","2 h 30 min"],["flame","Steamed"]],note:["Whip the fat until pale and fluffy first: a spoonful of the dough should float in a glass of cold water before you assemble."],
   ing:[["Dried corn husks",N(n*1.2,"husk")],["Masa harina",G(20*n)],["Warm stock",G(30*n)],["Lard or butter",G(9*n)],["Baking powder",gs(.4*n)],["Salt",gs(.6*n)],["Filling (shredded pork or chicken in salsa, or cheese and peppers)",G(35*n)]],
   steps:["Soak the corn husks in hot water for 30 minutes until pliable. Pat dry.","Beat the lard until fluffy. Mix in the masa harina, baking powder and salt, then add the stock a little at a time, beating until the dough is soft and spreadable like thick frosting.","Spread about 50 g of dough over the middle of each husk, add the filling down the centre, fold the sides over and fold up the bottom.","Stand the tamales open end up in a steamer and steam 60 to 90 minutes. They are ready when the dough pulls away from the husk cleanly. Rest 10 minutes before unwrapping."],
   learn:["Do not eat the husk: it is the wrapper.","Tamales freeze well in their husks and reheat in a steamer in about 20 minutes."]}}
  const n=s.p||people;
  if(s.t==="roja")return{title:"Salsa roja for "+n,meta:[["clock","25 min"],["flame","Simmered"],["fridge","Keeps 5 days"]],note:["Toasting the dried chillies for 20 seconds gives a deeper, smoky taste. Do not let them burn or the salsa turns bitter."],
   ing:[["Ripe tomatoes",G(120*n)],["Dried guajillo or arbol chillies",gs(4*n)],["White onion",G(25*n)],["Garlic",gs(3*n)],["Water",G(20*n)],["Lime juice",gs(5*n)],["Salt",gs(1.2*n)]],
   steps:["Toast the chillies in a dry pan for 20 seconds per side, then soak in hot water 10 minutes.","Simmer the tomatoes, onion and garlic with the water for 10 minutes until soft.","Blend everything with the drained chillies until smooth. Season with salt and lime and cool before serving."]}
  if(s.t==="verde")return{title:"Salsa verde for "+n,meta:[["clock","20 min"],["fridge","Keeps 5 days"]],note:["Tomatillos are sticky under the husk: rinse them well after peeling."],
   ing:[["Tomatillos",G(120*n)],["White onion",G(20*n)],["Serrano or green chilli",gs(8*n)],["Garlic",gs(3*n)],["Fresh coriander",gs(8*n)],["Lime juice",gs(4*n)],["Salt",gs(1.2*n)]],
   steps:["Husk and rinse the tomatillos. Simmer them with the chilli for 8 minutes until they turn dull green and soft.","Blend with the onion, garlic, coriander and a little of the cooking water.","Season with salt and lime. Taste and add more chilli if you like it hot."]}
  return{title:"Pico de gallo for "+n,meta:[["clock","10 min"],["fridge","Best the same day"]],note:["Salt the tomatoes and let them drain for 10 minutes so the salsa is fresh, not watery."],
   ing:[["Ripe tomatoes",G(100*n)],["White onion",G(25*n)],["Jalapeño",gs(5*n)],["Fresh coriander",gs(6*n)],["Lime juice",gs(5*n)],["Salt",gs(1*n)]],
   steps:["Dice the tomatoes, salt them and drain in a sieve for 10 minutes.","Chop the onion, jalapeño and coriander very finely.","Stir everything together with the lime juice and taste."]}}},

/* ---------------- Tofu and tempeh ---------------- */
tofu:{icon:"leaf",title:"What are we making with soy?",sub:"Crispy tofu, scramble, homemade tofu, homemade tempeh and a sticky tempeh glaze.",
 ctl:[{k:"t",label:"Make",icon:"leaf",def:"crispy",tg:[["crispy","Crispy tofu"],["scramble","Tofu scramble"],["glaze","Sticky tempeh"],["home","Homemade tofu"],["tempeh","Homemade tempeh"]]},
  {k:"p",label:"People",icon:"users",def:null,step:[1,10,1,""],only:["crispy","scramble","glaze"]},
  {k:"b",label:"Dried soybeans",icon:"ruler",def:300,step:[100,1000,100,"g"],only:["home","tempeh"]}],
 calc(s){
  const n=s.p||people;
  if(s.t==="crispy")return{title:"Crispy tofu for "+n,meta:[["clock","30 min"],["flame","Pan or oven"]],note:["Pressing is the step that matters: wet tofu steams instead of crisping."],
   ing:[["Extra-firm tofu",G(150*n)],["Cornflour",G(8*n)],["Soy sauce",G(8*n)],["Neutral oil",G(10*n)],["Black pepper",gs(.3*n)]],
   steps:["Wrap the tofu in a clean towel and press under a heavy pan for 15 minutes. Cut into 2 cm cubes.","Toss the cubes with the soy sauce, then the cornflour and pepper until lightly coated.","Fry in the oil over medium-high heat 10 to 12 minutes, turning, until golden and crisp on every side. Or bake at 220 °C for 25 minutes, turning once."]};
  if(s.t==="scramble")return{title:"Tofu scramble for "+n,meta:[["clock","15 min"],["flame","Medium heat"]],note:["Crumble the tofu with your hands. Pieces of different sizes give the best texture."],
   ing:[["Firm tofu",G(150*n)],["Oil",G(8*n)],["Onion",G(30*n)],["Turmeric",gs(.5*n)],["Soy sauce",G(5*n)],["Nutritional yeast (optional)",G(4*n)],["Black pepper",gs(.3*n)]],
   steps:["Soften the chopped onion in the oil for 4 minutes.","Crumble in the tofu with the turmeric and pepper and cook 6 minutes, stirring, until any liquid is gone.","Stir in the soy sauce and nutritional yeast and serve hot."]};
  if(s.t==="glaze")return{title:"Sticky tempeh for "+n,meta:[["clock","25 min"],["flame","Steamed then fried"]],note:["Steaming the tempeh first takes away the slight bitterness and lets it soak up the glaze."],
   ing:[["Tempeh",G(100*n)],["Soy sauce",G(10*n)],["Maple syrup or honey",G(8*n)],["Rice vinegar",G(5*n)],["Garlic",gs(3*n)],["Ginger",gs(3*n)],["Neutral oil",G(8*n)]],
   steps:["Cut the tempeh into thin slices and steam 10 minutes.","Mix the soy sauce, syrup, vinegar, grated garlic and ginger.","Fry the tempeh in the oil 3 minutes per side until golden, pour in the glaze and cook about 2 minutes until it clings and turns sticky."]};
  const b=s.b;
  if(s.t==="home")return{title:"Homemade tofu from "+G(b)+" of soybeans",meta:[["clock","3 h (plus soaking)"],["fridge","Keeps 4 days"]],note:["Follow the coagulant pack if it gives a different amount: strengths vary. Calcium sulfate gives a softer tofu, nigari a firmer one with more flavour."],
   ing:[["Dried soybeans, soaked overnight",G(b)],["Water for blending",L(b*10)],["Nigari or calcium sulfate",gs(b/100*3.5)],["Water to dissolve the coagulant",ml(b/100*40)]],
   steps:["Drain the soaked beans, blend with the water until very smooth, then pour into a pot.","Bring to a gentle boil, stirring, and simmer 10 minutes. Strain through a cloth, squeezing well: this is the soy milk.","Cool the milk to about 80 °C. Dissolve the coagulant in its water and stir it in with three slow strokes, then cover and leave 10 to 15 minutes until curds form.","Ladle the curds into a cloth-lined mould or sieve, fold over, weigh down for 15 to 30 minutes and chill in cold water."],
   learn:["Soy milk must be boiled for 10 minutes: raw soybeans are not safe to eat.","The leftover pulp (okara) is good in veggie burgers, bread or pancakes."]};
  return{title:"Homemade tempeh from "+G(b)+" of soybeans",meta:[["clock","About 36 h, mostly waiting"],["fridge","Keeps 1 week"]],note:["It needs a steady 28 to 32 °C for about 24 to 36 hours: an oven with only the light on works well. It is ready when white mould holds the beans together in a firm cake."],
   ing:[["Dried soybeans (about "+G(b*2.2)+" cooked)",G(b)],["Vinegar",ml(b/100*6)],["Tempeh starter (Rhizopus)",gs(b/100*1)]],
   steps:["Soak the beans overnight, boil 30 minutes, drain and rub off the loose skins in water.","Boil again in fresh water 30 more minutes until tender, then drain and dry thoroughly on a towel. Wet beans spoil, so they must be dry.","Mix in the vinegar and the starter until evenly spread, then pack 2 cm thick into perforated bags or a pierced container.","Incubate at 28 to 32 °C for 24 to 36 hours until covered in white mould. Cool and cook within a few days, or freeze."],
   learn:["Grey or black spots are normal sporulation. Pink, green or slimy patches, or a bad smell, mean you should throw it out."]}}},

/* ---------------- Pie and pastry ---------------- */
pastry:{icon:"cupcake",title:"What pastry are we making?",sub:"Pie crust sized to your dish, laminated doughs with their layer counts, and choux.",
 ctl:[{k:"t",label:"Pastry",icon:"cupcake",def:"short",tg:[["short","Pie crust"],["sweet","Sweet tart pastry"],["rough","Rough puff"],["puff","Classic puff"],["crois","Croissant dough"],["choux","Choux"]]},
  {k:"d",label:"Pie dish across (cm)",icon:"ruler",def:23,step:[16,30,1,"cm"],only:["short","sweet"]},
  {k:"c",label:"Crusts",icon:"cupcake",def:"two",tg:[["one","Base only"],["two","Base and lid"]],only:["short","sweet"]},
  {k:"f",label:"Flour",icon:"ruler",def:500,step:[250,1000,250,"g"],only:["rough","puff","crois"]},
  {k:"q",label:"Flour",icon:"ruler",def:120,step:[60,360,60,"g"],only:"choux"}],
 calc(s){
  if(s.t==="short"||s.t==="sweet"){
   const d=s.d,A=Math.PI*(d/2)*(d/2),P=Math.PI*d,area=(s.c==="two"?2*A:A)+P*3,dough=area*.42*1.15,sweet=s.t==="sweet";
   const flour=sweet?dough*.52:dough/2,fat=sweet?dough*.3:dough/3,wat=sweet?0:dough/6;
   return{title:(sweet?"Sweet tart pastry":"Pie crust")+" for a "+d+" cm dish",meta:[["clock","1 h 20 min (with chilling)"],["flame","Bake 190 to 200 °C"],["cupcake",G(dough)+" dough"]],note:[sweet?"A rich, crumbly pastry for fruit and custard tarts.":"The classic 3 : 2 : 1 ratio by weight: flour, cold butter, cold water."],
   ing:[["Plain flour",G(flour)],["Cold butter, cubed",G(fat)]].concat(sweet?[["Icing sugar",G(flour*.3)],["Egg yolk",N(flour/110,"yolk")],["Cold water, only if needed","a splash"]]:[["Iced water",G(wat)]]).concat([["Salt",gs(flour/100)]]),
   steps:sweet?["Rub the butter into the flour, icing sugar and salt until it looks like breadcrumbs.","Mix in the egg yolk, adding a splash of water only if it will not come together. Press into a disc, wrap and chill 1 hour.","Roll out, line the dish, chill 20 minutes more, then blind bake with baking beans at 190 °C for 15 minutes. Remove the beans and bake 8 to 10 minutes more."]:["Rub the butter into the flour and salt until pieces are the size of peas: some butter chunks make flaky layers.","Sprinkle over the iced water a little at a time and mix until it just holds. Press into "+(s.c==="two"?"two discs, one slightly bigger":"a disc")+", wrap and chill at least 1 hour.","Roll out, line the dish and chill 20 minutes before filling and baking at 200 °C."],
   learn:["Cold is the whole secret: warm butter melts into the flour and gives a tough crust instead of a flaky one.","Rested dough shrinks less in the oven."]}}
  if(s.t==="choux"){const f=s.q,e=f*1.67,w=f*.835,bt=f*.67;return{title:"Choux pastry from "+G(f)+" flour",meta:[["clock","50 min"],["flame","Bake 200 °C, then 180 °C"],["cupcake","About "+Math.round(f/6)+" puffs"]],note:["Cook the paste until it forms a ball and a skin forms on the pan: too wet and the puffs will not rise."],
   ing:[["Water",G(w)],["Milk",G(w)],["Butter",G(bt)],["Plain flour, sifted",G(f)],["Salt",gs(f/60)],["Eggs, beaten (add gradually)",N(e/50,"egg")]],
   steps:["Bring the water, milk, butter and salt to a boil. Tip in the flour all at once and stir hard 2 minutes until it forms a smooth ball and a film shows on the pan.","Cool 5 minutes, then beat in the egg a little at a time until the paste is glossy and falls from the spoon in a slow V shape. You may not need all of it.","Pipe onto lined trays and bake at 200 °C for 15 minutes, then 180 °C for 20 minutes without opening the door. Pierce each puff to let the steam out and dry 5 minutes."]}}
  const f=s.f;
  if(s.t==="rough"){return{title:"Rough puff from "+G(f)+" flour",meta:[["clock","About 2 h (mostly chilling)"],["flame","Bake 200 °C"],["cupcake","Hundreds of layers"]],note:["The quick cousin of puff pastry: no butter block, you fold cubes of butter in."],
   ing:[["Plain flour",G(f)],["Cold butter, in 1.5 cm cubes",G(f)],["Iced water",G(f*.5)],["Salt",gs(f/50)]],
   steps:["Mix the flour and salt. Toss in the butter cubes without breaking them up, then add the iced water and mix until it just comes together with visible chunks of butter.","Roll into a long rectangle and fold in thirds (a single turn). Turn 90 degrees and chill 30 minutes.","Repeat the roll, fold and chill four more times. After the last turn chill 1 hour, then roll and bake at 200 °C."],
   learn:["After 4 single turns it has about 81 layers of dough, 6 turns about 729."]}}
  if(s.t==="puff"){return{title:"Classic puff from "+G(f)+" flour",meta:[["clock","Plan a day"],["flame","Bake 200 °C"],["cupcake","729 layers (6 single turns)"]],note:["Dough and butter must be the same firmness while rolling: if the butter cracks it is too cold, if it oozes it is too warm."],
   ing:[["Plain flour",G(f)],["Cold water",G(f*.5)],["Salt",gs(f/50)],["Butter melted into the dough",G(f*.1)],["Cold butter for the block",G(f*.6)]],
   steps:["Mix the flour, salt, water and melted butter to a soft dough, shape into a square, cut a cross on top and chill 1 hour.","Pound the butter into a flat square about 1.5 cm thick between sheets of baking paper and chill.","Open the dough like a flower, place the butter in the middle and fold the corners over to seal it in. Roll to a long rectangle.","Fold in thirds (a single turn), chill 30 minutes and repeat for six turns in all. Chill before the final roll and bake at 200 °C."],
   learn:["Layers after n single turns: 3 to the power n, then multiplied by the butter. 6 turns gives 729."]}}
  return{title:"Croissant dough from "+G(f)+" flour",meta:[["clock","About 20 h, mostly waiting"],["flame","Bake 190 °C"],["cupcake","27 layers (3 single turns)"]],note:["It is a yeast dough with a butter block: keep everything cold and work quickly."],
   ing:[["Strong white flour",G(f)],["Cold milk",G(f*.28)],["Cold water",G(f*.28)],["Sugar",G(f*.1)],["Salt",gs(f*.02)],["Instant yeast",gs(f*.014)],["Butter melted into the dough",G(f*.1)],["Cold butter for the block",G(f*.5)]],
   steps:["Mix everything except the block butter into a smooth dough, shape into a rectangle, wrap and chill overnight.","Shape the block butter into a flat square, chill, then enclose it in the dough and roll out.","Give 3 single turns, chilling 30 minutes between each. Roll to 5 mm, cut triangles and roll up into croissants.","Prove 2 hours until puffy and wobbly, brush with egg wash and bake at 190 °C for 18 to 20 minutes until deep golden."]}}},

/* ---------------- Plant milks ---------------- */
plantmilk:{icon:"dairy",title:"Which plant milk?",sub:"Oat, almond, soy, cashew and coconut, scaled to the amount you want.",
 ctl:[{k:"t",label:"Milk",icon:"dairy",def:"oat",tg:[["oat","Oat"],["almond","Almond"],["soy","Soy"],["cashew","Cashew"],["coco","Coconut"]]},
  {k:"v",label:"How much",icon:"ruler",def:1000,step:[500,4000,500,"ml"]},
  {k:"s",label:"Sweet",icon:"wand",def:"no",tg:[["no","Unsweetened"],["date","With dates and vanilla"]]}],
 calc(s){
  const v=s.v,k=v/1000,M={oat:{n:"Oat milk",b:["Rolled oats",90*k],w:1,t:"4 days",st:["Blend the oats with the cold water for just 20 to 30 seconds: longer makes it slimy.","Strain through a fine sieve or cloth without squeezing hard, then stir in the salt. Chill."],note:"Use cold water and do not heat it: warmth and long blending turn the starch to slime. Shake before pouring."},
   almond:{n:"Almond milk",b:["Almonds, soaked 8 hours and drained",140*k],w:1,t:"4 days",st:["Blend the soaked almonds with the cold water for 1 to 2 minutes until very smooth.","Strain through a nut-milk bag or fine cloth, pressing out all the liquid, then add the salt and chill."],note:"The leftover almond pulp can go into granola, crackers or baking."},
   soy:{n:"Soy milk",b:["Dried soybeans, soaked overnight",100*k],w:1,t:"4 days",st:["Blend the soaked soybeans with the water until completely smooth.","Strain through a cloth, then simmer the liquid gently for 15 to 20 minutes, stirring often so it does not scorch. Skim any foam.","Add the salt, cool and chill."],note:"Raw soy milk is not safe: it must be simmered at least 15 minutes."},
   cashew:{n:"Cashew milk",b:["Cashews, soaked 2 hours and drained",100*k],w:1,t:"4 days",st:["Blend the soaked cashews with the water until silky. It needs no straining.","Add the salt and chill."],note:"The creamiest and easiest of the nut milks: great in coffee and sauces."},
   coco:{n:"Coconut milk",b:["Unsweetened desiccated coconut",250*k],w:1,t:"4 days",st:["Pour hot (not boiling) water over the coconut and soak 10 minutes.","Blend 1 minute, strain through a cloth squeezing well, add the salt and chill. It separates: shake before use."],note:"Homemade coconut milk is thinner than canned. Stir in a spoonful of the cream that rises on top."}}[s.t],
  ing=[[M.b[0],G(M.b[1])],["Cold water"+(s.t==="coco"?" (hot, for the soak)":""),L(v)],["Salt",gs(.8*k)]];
  if(s.s==="date")ing.push(["Medjool dates, pitted",N(2*k,"date")],["Vanilla extract",gs(2*k)]);
  const st=M.st.slice();if(s.s==="date")st.splice(st.length-1,0,"Add the dates and vanilla when blending (or to the strained milk for a second quick blend).");
  return{title:M.n+", "+L(v),meta:[["clock","15 min"],["fridge","Keeps "+M.t]],note:[M.note],ing,steps:st,learn:["Homemade plant milk has no stabilisers, so it separates: shake it before pouring.","It does not froth like shop barista milks."]}}},

/* ---------------- Candy shop ---------------- */
candy:{icon:"cookie",title:"What are we cooking in the sugar pan?",sub:"Caramel sauce, chewy caramels, toffee, fudge and truffles, with the temperature to stop at.",
 ctl:[{k:"t",label:"Make",icon:"cookie",def:"sauce",tg:[["sauce","Salted caramel sauce"],["chewy","Chewy caramels"],["toffee","Toffee"],["fudge","Fudge"],["truffle","Chocolate truffles"]]},
  {k:"b",label:"Sugar or chocolate",icon:"ruler",def:200,step:[100,600,100,"g"]}],
 calc(s){
  const b=s.b,k=b/200;
  if(s.t==="sauce")return{title:"Salted caramel sauce from "+G(b)+" sugar",meta:[["clock","20 min"],["flame","Dry or wet caramel, amber"],["fridge","Keeps 2 weeks"]],note:["No thermometer needed: stop when the sugar is the colour of dark honey, and add the cream carefully because it spits."],
   ing:[["Sugar",G(b)],["Water",G(b/4)],["Double cream, warm",G(120*k)],["Butter",G(30*k)],["Flaky salt",gs(1*k)]],
   steps:["Dissolve the sugar in the water over medium heat, then boil without stirring (swirl the pan) until it turns deep amber, 7 to 10 minutes.","Take off the heat and pour in the warm cream, standing back as it bubbles. Whisk until smooth.","Whisk in the butter and salt. Cool, then jar and chill."],
   learn:["Cold cream makes the caramel seize. Warm it first, and if it does seize, simmer it a minute and it melts again."]};
  if(s.t==="chewy")return{title:"Chewy caramels from "+G(b)+" sugar",meta:[["clock","1 h + setting"],["flame","Cook to 118 °C (firm ball)"]],note:["Temperature decides the chew: 115 °C is soft, 118 °C is chewy, 122 °C is firm. Use a thermometer."],
   ing:[["Sugar",G(b)],["Golden syrup or glucose",G(100*k)],["Double cream",G(250*k)],["Butter",G(50*k)],["Salt",gs(1.5*k)],["Vanilla",gs(2*k)]],
   steps:["Line a small tin with baking paper.","Warm the cream with the butter and salt. In another heavy pan dissolve the sugar and syrup, then boil to a light amber.","Carefully pour in the warm cream mixture and cook, stirring, until the thermometer reads 118 °C. Add the vanilla.","Pour into the tin, cool 3 hours, then cut and wrap each piece in baking paper."]};
  if(s.t==="toffee")return{title:"Toffee from "+G(b)+" sugar",meta:[["clock","30 min + setting"],["flame","Cook to 149 °C (hard crack)"]],note:["Work with a thermometer and keep the heat steady: toffee goes from perfect to burnt within seconds."],
   ing:[["Sugar",G(b)],["Butter",G(100*k)],["Water",G(60*k)],["Salt",gs(1*k)],["Dark chocolate, to top (optional)",G(100*k)]],
   steps:["Melt the butter with the water and sugar over medium heat, stirring until dissolved.","Boil without stirring, swirling, until it reaches 149 °C and is golden brown.","Pour onto a lined tray, spread thin and cool 2 minutes. Scatter on the chocolate, let it melt, spread, and chill. Break into shards."]};
  if(s.t==="fudge")return{title:"Fudge from "+G(b*2)+" sugar",meta:[["clock","1 h + setting"],["flame","Cook to 114 °C (soft ball)"]],note:["Beat it while still warm but not hot: beating too early gives coarse crystals, too late gives hard fudge."],
   ing:[["Sugar",G(b*2)],["Evaporated milk",G(170*k*2)],["Butter",G(55*k*2)],["Dark chocolate, chopped",G(150*k*2)],["Vanilla",gs(2*k*2)]],
   steps:["Butter and line a small tin.","Heat the sugar, milk and butter, stirring until the sugar dissolves, then boil to 114 °C.","Off the heat stir in the chocolate and vanilla and beat with a wooden spoon about 5 minutes until it thickens and loses its gloss.","Pour into the tin, level and set 2 hours before cutting."]};
  return{title:"Chocolate truffles from "+G(b)+" chocolate",meta:[["clock","30 min + chilling"],["fridge","Keeps 1 week"]],note:["The ratio is 2 parts chocolate to 1 part cream by weight: a firm ganache that rolls into balls. For a soft truffle use 1 : 1."],
   ing:[["Dark chocolate (55 to 70%)",G(b)],["Double cream",G(b/2)],["Butter",G(10*k)],["Cocoa powder, for rolling",G(25*k)]],
   steps:["Chop the chocolate finely and put it in a bowl.","Heat the cream until just steaming and pour it over. Wait 1 minute, then stir from the centre outwards until smooth. Stir in the butter.","Chill 2 hours until firm, scoop small spoonfuls, roll into balls and coat in cocoa."]}}},

/* ---------------- Sushi and rice rolls ---------------- */
sushi:{icon:"rice",title:"What are we rolling?",sub:"Rice, nori and filling for any number of rolls. Cook the rice with Grain, the sushi rice option.",
 ctl:[{k:"t",label:"Roll",icon:"rice",def:"hoso",tg:[["hoso","Thin maki"],["uramaki","Inside-out roll"],["futo","Fat roll"],["temaki","Hand roll"],["onigiri","Onigiri"]]},
  {k:"c",label:"How many",icon:"ruler",def:8,step:[2,40,2,""]},
  {k:"f",label:"Filling",icon:"sandwich",def:"cuke",tg:[["cuke","Cucumber and avocado"],["salmon","Salmon"],["tuna","Tuna"],["veg","Veggie"],["egg","Omelette"]]}],
 calc(s){
  const n=s.c,T={hoso:{n:"Thin maki",r:80,f:25,nori:.5,u:"cut into 6"},uramaki:{n:"Inside-out rolls",r:120,f:45,nori:1,u:"cut into 8"},futo:{n:"Fat rolls",r:150,f:90,nori:1,u:"cut into 8"},temaki:{n:"Hand rolls",r:55,f:40,nori:.5,u:"eaten whole"},onigiri:{n:"Onigiri",r:100,f:20,nori:.3,u:"triangles"}}[s.t];
  const F={cuke:[["Cucumber, in sticks",.55],["Avocado",.45]],salmon:[["Sushi-grade salmon, in strips",.7],["Cucumber, in sticks",.3]],tuna:[["Sushi-grade tuna, in strips",.75],["Spring onion",.25]],veg:[["Carrot, in sticks",.4],["Cucumber, in sticks",.3],["Pickled radish or red pepper",.3]],egg:[["Tamago (sweet omelette), in strips",.6],["Cucumber, in sticks",.4]]}[s.f];
  if(s.t==="onigiri"&&s.f==="salmon")F[0]=["Cooked salmon, flaked",.7];
  const cooked=T.r*n*1.1,dry=cooked/2.3;
  const ing=[["Sushi rice (dry), cooked as in Grain",G(dry)],["Rice vinegar",G(dry*.175)],["Sugar",G(dry*.06)],["Salt",gs(dry*.015)],["Nori sheets",N(T.nori*n,"sheet")]];
  F.forEach(x=>ing.push([x[0],G(T.f*n*x[1])]));
  if(s.t==="uramaki")ing.push(["Sesame seeds, to coat",G(3*n)]);
  ing.push(["Soy sauce, to serve",G(8*n)],["Pickled ginger",G(3*n)],["Wasabi",gs(.8*n)]);
  const raw=s.f==="salmon"||s.f==="tuna",prep="Cook the rice (Grain, sushi rice). While it is hot, fold in the vinegar, sugar and salt (warmed to dissolve) with a cutting motion, fanning it to cool. Cover with a damp cloth.";
  const steps=s.t==="temaki"?[prep,"Cut each nori sheet in half. Hold one half shiny side down in your palm and spread a thin layer of rice over the left third.","Lay the filling diagonally on the rice, fold the bottom corner over it and roll into a cone. Seal with a grain of rice and eat straight away, while the nori is crisp."]
   :s.t==="onigiri"?[prep,"Wet your hands and rub in a pinch of salt. Take a ball of rice, press a hollow in the middle and put in the filling.","Close the rice around it and shape into a triangle with gentle pressure. Wrap a strip of nori around the base and eat the same day."]
   :[prep,"Lay a sheet of nori shiny side down on a bamboo mat. Spread the rice with wet fingers in a thin even layer, leaving 2 cm bare at the far edge"+(s.t==="uramaki"?" (for inside-out, cover the whole sheet, sprinkle the sesame seeds, flip it, and put the filling on the nori side).":"."),"Lay the filling in a line across the middle, roll tightly with the mat, press, then wet the bare edge to seal.","Cut with a wet, sharp knife using one smooth draw. Serve with soy sauce, ginger and wasabi."];
  return{title:n+" "+T.n.toLowerCase()+" ("+T.u+")",meta:[["clock","45 min"],["rice",G(cooked)+" cooked rice"]],note:[raw?"Raw fish: only use fish sold as sushi- or sashimi-grade, keep it cold and eat the same day.":"Wet your hands with water mixed with a little rice vinegar so the rice does not stick."],ing,steps,
   learn:["Sushi rice is seasoned while hot and never refrigerated: cold rice turns hard.","A thin layer of rice rolls better and lets the filling show."]}}}
});
})();
