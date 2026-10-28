/* craft/craft-light.js: Craft recipes for sandwiches, salads, eggs.
   Each entry is a tool: its controls (ctl) and a calc(s) that returns the card (title, meta, note, ing, steps).
   "learn" notes for the Good to know box live in LEARN below, keyed by tool then option. Load order: after craft-lib.js, before craft.js. */
(function(){
"use strict";
const {rg,G,ML,P1,eggs,hm,people}=window.CRAFTLIB;
Object.assign(window.CRAFTLIB.TOOLS,{
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
eggs:{title:"What are we cracking?",sub:"Batters, omelettes and boiled eggs without guessing.",
 ctl:[{k:"t",label:"Make",icon:"egg",def:"pan",tg:[["pan","Pancakes"],["crepe","Crepes"],["omelette","Omelette"],["boiled","Boiled eggs"]]},
  {k:"c",label:"How many",icon:"ruler",def:8,step:[4,24,4,""],only:["pan","crepe"]},{k:"d",label:"Pan size (cm)",icon:"ruler",def:24,step:[18,30,2,"cm"],only:"omelette"},
  {k:"e",label:"Eggs",icon:"egg",def:4,step:[1,12,1,""],only:"boiled"},{k:"o",label:"Doneness",icon:"clock",def:"jam",tg:[["soft","Soft"],["jam","Jammy"],["med","Medium"],["hard","Hard"]],only:"boiled"}],
 calc(s){
  if(s.t==="pan"){const k=s.c/4;return{title:s.c+" fluffy pancakes",meta:[["clock","20 min"],["flame","Medium heat"]],note:["Do not overmix. Lumps are fine."],ing:[["Flour",G(125*k)],["Milk",G(150*k)],["Egg",eggs(50*k)],["Baking powder",P1(5*k)+" g"],["Sugar",G(12*k)],["Melted butter",G(15*k)],["Salt","a pinch"]],steps:["Whisk the dry ingredients. In another bowl whisk the milk, egg and butter.","Pour the wet into the dry and stir until just combined. Rest 5 minutes.","Cook spoonfuls in a lightly buttered pan on medium heat about 2 minutes per side, until bubbles form and the edges look set. Flip once."]}}
  if(s.t==="crepe"){const k=s.c/8;return{title:s.c+" thin crepes",meta:[["clock","30 min"],["flame","Medium-high heat"]],note:["Resting the batter 30 minutes gives tender crepes that do not tear."],ing:[["Flour",G(125*k)],["Milk",G(250*k)],["Eggs",eggs(100*k)],["Melted butter",G(20*k)],["Salt",P1(k)+" g"]],steps:["Whisk the flour and salt, then the milk and eggs, until smooth. Stir in the butter.","Rest 30 minutes.","Pour a thin layer into a hot buttered pan, swirl to coat and cook 1 minute. Flip and cook 30 seconds."]}}
  if(s.t==="omelette"){const d=s.d,n=d<=20?2:d<=24?3:d<=28?4:5;return{title:n+"-egg omelette",meta:[["clock","5 min"],["egg","For a "+d+" cm pan"]],note:["For more people, make one omelette at a time, or bake a frittata in the oven at 180 °C."],ing:[["Eggs",n+" eggs"],["Butter",G(5+n*2)],["Salt","a pinch"],["Filling (cheese, herbs, veg)",G(15*n)]],steps:["Beat the eggs with the salt.","Melt the butter in the pan until foaming. Pour in the eggs.","Stir gently for 20 seconds, then let it set for 1 minute.","Add the filling on one half, fold over and slide onto a plate while the middle is still a little soft."]}}
  const T={soft:[6,"runny yolk, set white"],jam:[7,"jammy yolk"],med:[9,"creamy, just set yolk"],hard:[11,"fully set yolk"]}[s.o];
  return{title:s.e+" boiled egg"+(s.e>1?"s":""),meta:[["clock",T[0]+" min"],["egg",T[1]]],note:["Timed from the moment the water boils, for fridge-cold eggs."],ing:[["Eggs",s.e+""],["Water","enough to cover"],["Ice and cold water","for the bath"]],steps:["Bring a pot of water to a rolling boil.","Lower in the eggs and set a timer for "+T[0]+" minutes.","Move the eggs straight into ice water for 5 minutes. This stops the cooking and makes them easy to peel."]}}}
});
})();
