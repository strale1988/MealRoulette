/* craft/craft-extras.js: extra choices, taste dials, add-ons and "use the leftovers" tips for the Craft tools.
   It wraps the calc of tools that already exist (sauce, spice, salad, sandwich, drinks) and replaces jam's, so the recipe files stay as they are.
   Controls marked x:1 are tweaks: the random spin leaves them at their defaults. A control with when:{k,v} only shows while another control has that value.
   Load order: after craft-lib.js and the other craft-*.js files, before craft.js. */
(function(){
"use strict";
const L=window.CRAFTLIB,T=L.TOOLS,LEARN=L.LEARN,{rg,G,P1,people}=L;
const scaleQ=(q,f)=>{const m=/^(\d+(?:\.\d+)?)\s?g$/.exec(String(q));if(!m)return q;const v=m[1]*f;return(v<10?P1(v):rg(v))+" g"};
const scaleRows=(r,re,f)=>{if(f===1)return;r.ing.forEach(i=>{if(re.test(i[0]))i[1]=scaleQ(i[1],f)})};
const num=(n,one,many)=>n+" "+(n===1?one:many);
const list=a=>a.length<2?(a[0]||""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];
const learn=(id,keys,arr)=>{const o=LEARN[id]=LEARN[id]||{};keys.forEach(k=>{o[k]=(o[k]||[]).concat(arr)})};
/* add controls to an existing tool and run fn(result, settings) on every calc */
function extend(id,ctls,fn){const t=T[id];if(!t)return;t.ctl.push(...ctls);const o=t.calc;
 t.calc=function(s){const r=o.call(this,s);try{return fn(r,s)||r}catch(e){console.error(e);return r}}}
/* "Add to it" lines: each option has a name, an amount for n people and a pattern that spots the same thing already in the recipe ("Extra garlic") */
function addOns(r,picked,defs,n){const names=[];
 (picked||[]).forEach(k=>{const d=defs[k];if(!d)return;const dup=d[2]&&r.ing.some(i=>d[2].test(i[0]));r.ing.push([(dup?"Extra: ":"")+d[0],d[1](n)]);names.push(d[0].toLowerCase().replace(/,.*$/,""))});
 return names}

/* ---------------- Sauces: tang and salt dials, add-ins, tips ---------------- */
{const c=T.sauce&&T.sauce.ctl.find(x=>x.k==="p");if(c)c.step[1]=40} // bigger batches, so a 500 ml or 1 L jar can be filled
{const ALL=["vin","yog","pesto","tomato","mayo","guac"];
 const D={garlic:["Garlic, grated",n=>P1(.5*n)+(P1(.5*n)===1?" clove":" cloves"),/garlic/i],chilli:["Fresh chilli, finely chopped",n=>P1(2*n)+" g",/chilli/i],herbs:["Fresh herbs, chopped",n=>G(3*n),/herbs|basil|coriander|chives|dill|parsley/i],
  honey:["Honey",n=>P1(2*n)+" g",/honey/i],mustard:["Dijon mustard",n=>P1(1.5*n)+" g",/mustard/i],zest:["Lemon zest",n=>num(Math.max(1,Math.ceil(n/4)),"lemon","lemons"),/zest/i]};
 extend("sauce",[
  {k:"xt",label:"Tang (acid)",icon:"flame",def:1,x:1,tg:[[0,"Milder"],[1,"As written"],[2,"Zestier"]],only:ALL},
  {k:"xs",label:"Salt",icon:"flame",def:1,x:1,tg:[[0,"Less"],[1,"As written"],[2,"More"]],only:ALL.concat("bech")},
  {k:"xa",label:"Add to it",icon:"wand",def:[],x:1,ms:[["garlic","Garlic"],["chilli","Chilli"],["herbs","Fresh herbs"],["honey","A little honey"],["mustard","Mustard"],["zest","Lemon zest"]],only:ALL}],
 (r,s)=>{const n=s.p||people;
  scaleRows(r,/vinegar|lemon juice|lime juice|balsamic/i,[.7,1,1.4][s.xt===undefined?1:s.xt]);
  scaleRows(r,/^salt\b/i,[.6,1,1.5][s.xs===undefined?1:s.xs]);
  if(ALL.includes(s.t)){const a=addOns(r,s.xa,D,n);if(a.length)r.steps.push("Finally, stir in the "+list(a)+". Taste and adjust the salt and acid.")}})
 learn("sauce",["pesto"],["Freeze pesto in an ice-cube tray without the cheese and stir the cheese in when you use it.","A thin layer of oil on top keeps it green in the fridge for a week."]);
 learn("sauce",["vin"],["Make double: in a jar with a lid it keeps a week in the fridge. Shake it before using."]);
 learn("sauce",["tomato"],["Freeze in portions (a muffin tin works) and keep the cubes in a bag. Leftover sauce is a base for shakshuka, soups and pizza."])}

/* ---------------- Spice blends: heat and salt dials, add-ins ---------------- */
{const c=T.spice&&T.spice.ctl.find(x=>x.k==="c");if(c)c.step[1]=40}
{const D={smoked:"Smoked paprika",garlic:"Garlic powder",onion:"Onion powder",orange:"Dried orange peel",sesame:"Toasted sesame seeds",oregano:"Dried oregano"};
 extend("spice",[
  {k:"xh",label:"Heat",icon:"flame",def:1,x:1,tg:[[.5,"Milder"],[1,"As written"],[2,"Hotter"]],only:["taco","ras","cajun","curry"]},
  {k:"xl",label:"Salt",icon:"flame",def:1,x:1,tg:[[0,"Salt-free"],[.5,"Less"],[1,"As written"]],only:["taco","zaatar","cajun"]},
  {k:"xa",label:"Add to it",icon:"wand",def:[],x:1,ms:Object.keys(D).map(k=>[k,D[k]])}],
 (r,s)=>{
  const heat=s.xh===undefined?1:+s.xh,salt=s.xl===undefined?1:+s.xl,add=(s.xa||[]).filter(k=>D[k]);
  const rows=r.ing.map(i=>({n:i[0],g:parseFloat(i[1])||0})),base=rows.reduce((t,x)=>t+x.g,0);
  r.vol=base/.55;r.fill=.9; // a ground blend weighs about 0.55 g per ml
  if(heat===1&&salt===1&&!add.length)return;
  rows.forEach(x=>{if(/cayenne|chilli powder/i.test(x.n))x.g*=heat;if(/^salt$/i.test(x.n))x.g*=salt});
  add.forEach(k=>{const e=rows.find(x=>x.n===D[k]);if(e)e.g+=base*.08;else rows.push({n:D[k],g:base*.08})});
  const sum=rows.reduce((t,x)=>t+x.g,0)||1;
  r.ing=rows.filter(x=>x.g>0).map(x=>[x.n,P1(x.g*base/sum)+" g"]);
  if(add.length)r.note=(r.note||[]).concat(["Extras are about 8% of the blend each. The batch stays the same size."])});
 learn("spice",["garam","taco","ras","zaatar","cajun","curry"],["Make a small batch more often: ground spices lose their punch after about 6 months. Toasting whole spices first and grinding them as you need them keeps the flavour longest."])}

/* ---------------- Jam: more fruit, a sugar slider, add-ins, a finished weight ---------------- */
if(T.jam){const t=T.jam;
 t.main="u";
 t.ctl[0].tg.push(["rhubarb","Rhubarb"],["pear","Pears"],["peach","Peaches"],["fig","Figs"],["gooseberry","Gooseberries"],["quince","Quince"],["mixedberry","Mixed berries"]);
 t.ctl[2].tg.push([3,"Custom"]);
 t.ctl.push({k:"sp",label:"Sugar (% of the fruit weight)",icon:"flame",def:75,step:[30,110,5,"%"],when:{k:"l",v:3}},
  {k:"xa",label:"Add-ins",icon:"wand",def:[],x:1,ms:[["vanilla","Vanilla"],["chilli","Chilli"],["ginger","Ginger"],["rosemary","Rosemary"],["cinnamon","Cinnamon"],["orange","Orange zest"]]});
 const P={strawberry:[60,"Low in pectin"],raspberry:[30,"Medium pectin"],apricot:[30,"Medium pectin"],plum:[30,"Medium pectin"],blueberry:[60,"Low in pectin"],cherry:[60,"Low in pectin"],apple:[15,"High in pectin"],blackcurrant:[15,"High in pectin"],
  rhubarb:[45,"Low in pectin"],pear:[60,"Low in pectin"],peach:[60,"Low in pectin"],fig:[60,"Low in pectin"],gooseberry:[15,"High in pectin"],quince:[15,"High in pectin"],mixedberry:[45,"Low to medium pectin"]};
 const SOFT=["rhubarb","pear","quince","apple"]; // firm fruit gets a short simmer in a little water first
 t.calc=function(s){
  const Pk=P[s.u]||P.strawberry,custom=s.l===3,pc=custom?(s.sp||75):[50,65,100][s.l],f=s.w,k=f/1000,sug=f*pc/100,lem=Pk[0]*k,out=(f+sug)*.78,jars=Math.ceil(out/300);
  const tier=pc>=100?2:pc>=60?1:0,keep=["2–3 weeks in the fridge","1–2 months in the fridge, or freeze","1 year in sterilised sealed jars"][tier];
  const soft=SOFT.includes(s.u),water=soft?f*.08:0;
  const A={vanilla:["Vanilla pod, split",num(Math.max(1,Math.round(k)),"pod","pods")],chilli:["Fresh chilli, finely chopped",P1(5*k)+" g"],ginger:["Ginger, grated",G(15*k)],rosemary:["Rosemary",num(Math.max(1,Math.round(k)),"sprig","sprigs")],cinnamon:["Cinnamon stick",num(Math.max(1,Math.round(k)),"stick","sticks")],orange:["Orange zest",num(Math.max(1,Math.round(k)),"orange","oranges")]};
  const add=(s.xa||[]).filter(x=>A[x]),ing=[["Prepared fruit (hulled, stoned, chopped)",G(f)],["Sugar",G(sug)],["Lemon juice",G(lem)]];
  if(soft)ing.push(["Water, to soften the fruit",G(water)]);
  add.forEach(x=>ing.push(A[x]));
  const steps=["Put a few small plates in the freezer for the set test. Sterilise the jars in a 120 °C oven for 15 minutes.",
   soft?"Simmer the fruit with the water for 10–15 minutes until soft, then stir in the sugar and lemon juice and leave 30 minutes until the sugar is wet.":"Mix the fruit, sugar and lemon juice and leave 30 minutes until the sugar is wet.",
   "Heat gently, stirring, until the sugar has dissolved. Then boil hard 10–20 minutes.",
   "Test: it is ready at 105 °C, or when a drop on a cold plate wrinkles when you push it. Skim off the foam.",
   "Cool 10 minutes, pour into the hot jars and seal. Label with the date."];
  if(add.length)steps.splice(2,0,"Add the "+list(add.map(x=>A[x][0].toLowerCase().replace(/,.*$/,"")))+" with the sugar.");
  const note=[Pk[1]+", so "+G(lem)+" of lemon juice is added to help it set."];
  if(custom)note.push("Sugar is set to "+pc+"% of the fruit weight. "+(pc>=100?"A full 1 : 1 jam is safe in sealed jars on the shelf.":pc>=60?"Below a full 1 : 1 it keeps less well. Keep it in the fridge or freezer.":"With this little sugar it is a soft, fresh jam: keep it cold and eat it within 2 weeks, or freeze it."));
  else note.push(s.l<2?"Less sugar means a softer set and a shorter life. Keep it cold.":"Only a full 1 : 1 jam is safe in sealed jars on the shelf.");
  return{title:s.u==="mixedberry"?"Mixed berry jam":s.u[0].toUpperCase()+s.u.slice(1)+" jam",meta:[["clock","About 30 min"],["jam","Makes about "+G(out)],["jar",jars+" jar"+(jars>1?"s":"")+" of 250 ml"],["fridge",keep]],note,ing,steps,
   makes:G(out)+" ("+jars+(jars>1?" jars":" jar")+" of 250 ml)",makesLabel:"Makes about",vol:out/1.2,fill:.92}};
 const tips=["A small knob of butter stirred in at the end breaks up the foam, so there is less to skim. The foam itself is perfectly good: spoon it onto toast.","Lower-sugar jam: use a bit more lemon, boil it a little longer, keep it in the fridge and freeze what you will not eat in 2 weeks.","Fill jars while the jam is hot, leave 1 cm at the top and tighten the lids straight away. Anything that did not seal goes in the fridge.","Leftover jam and a little water make a quick fruit sauce for yogurt, pancakes or ice cream."];
 Object.keys(P).forEach(k=>learn("jam",[k],tips))}

/* ---------------- Salads and sandwiches: add-ons ---------------- */
{const D={avocado:["Avocado",n=>G(50*n)],chicken:["Cooked chicken, sliced",n=>G(70*n)],egg:["Eggs, boiled and halved",n=>P1(.5*n)+" eggs"],chickpea:["Canned chickpeas, drained",n=>G(60*n)],nuts:["Toasted nuts",n=>G(10*n)],seeds:["Seeds (pumpkin or sunflower)",n=>G(8*n)],cheese:["Shaved hard cheese",n=>G(15*n)],croutons:["Croutons",n=>G(15*n)],olives:["Olives",n=>G(15*n)],fruit:["Fresh fruit (pear, apple or berries)",n=>G(50*n)]};
 extend("salad",[{k:"xa",label:"Add on top",icon:"salad",def:[],x:1,ms:Object.keys(D).map(k=>[k,D[k][0].replace(/,.*$/,"").replace(" (pumpkin or sunflower)","").replace(" (pear, apple or berries)","")])}],
  (r,s)=>{const a=addOns(r,s.xa,D,s.p||people);if(a.length)r.steps.push("Finish with the "+list(a)+" on top, after tossing so they stay in pieces.")})}
{const D={avocado:["Avocado, sliced",n=>G(30*n)],pickles:["Pickles",n=>G(15*n)],cheese:["Extra cheese",n=>G(20*n)],egg:["Fried or boiled egg",n=>P1(.5*n)+" eggs"],onion:["Red onion, thinly sliced",n=>G(10*n)],rocket:["Rocket",n=>G(8*n)],chilli:["Chilli sauce or chilli jam",n=>P1(5*n)+" g"],hummus:["Hummus",n=>G(25*n)]};
 extend("sandwich",[{k:"xa",label:"Extras",icon:"sandwich",def:[],x:1,ms:Object.keys(D).map(k=>[k,D[k][0].replace(/,.*$/,"").replace("Extra cheese","Cheese").replace("Fried or boiled egg","Egg").replace("Chilli sauce or chilli jam","Chilli sauce")])}],
  (r,s)=>{const a=addOns(r,s.xa,D,s.p||people);if(a.length)r.steps.splice(Math.max(0,r.steps.length-1),0,"Add the "+list(a)+" before you close it.")})}

/* ---------------- Drinks: sweetness for every drink, smoothie fruit, infused syrups ---------------- */
{const FR={bb:null,mg:["Frozen mango, in chunks","Mango banana"],pb:["Frozen peach slices","Peach berry"],gs:["Apple, cored and chopped","Apple spinach"]};
 const IN={ginger:["Ginger, sliced",k=>G(15*k)],mint:["Fresh mint",k=>G(10*k)],vanilla:["Vanilla pod, split",k=>num(Math.max(1,Math.round(k)),"pod","pods")],berries:["Berries",k=>G(100*k)],rosemary:["Rosemary",k=>num(Math.max(1,Math.ceil(k*2)),"sprig","sprigs")],peel:["Lemon peel, in strips",k=>num(Math.max(2,Math.round(k*3)),"strip","strips")]};
 extend("drinks",[
  {k:"sx",label:"Sweetness",icon:"flame",def:1,x:1,tg:[[0,"Less sweet"],[1,"As written"],[2,"Sweeter"]],only:["choc","chai","mulled","smoothie"]},
  {k:"sf",label:"Fruit",icon:"leaf",def:"bb",x:1,tg:[["bb","Berry + banana"],["mg","Mango + banana"],["pb","Peach + berry"],["gs","Apple + spinach"]],only:"smoothie"},
  {k:"si",label:"Infuse the syrup",icon:"wand",def:[],x:1,ms:[["ginger","Ginger"],["mint","Mint"],["vanilla","Vanilla"],["berries","Berries"],["rosemary","Rosemary"],["peel","Lemon peel"]],only:"syrup"}],
 (r,s)=>{const a=s.a||1000,k=a/1000;
  if(["choc","chai","mulled","smoothie"].includes(s.t))scaleRows(r,/^(sugar|honey)/i,[.5,1,1.5][s.sx===undefined?1:s.sx]);
  if(s.t==="smoothie"&&FR[s.sf]){const f=FR[s.sf];
   if(s.sf==="mg"||s.sf==="gs"){const row=r.ing.find(i=>/mixed berries/i.test(i[0]));if(row)row[0]=f[0]}
   if(s.sf==="pb"){const row=r.ing.find(i=>/banana/i.test(i[0]));if(row)row[0]=f[0]}
   if(s.sf==="gs"){const b=r.ing.find(i=>/banana/i.test(i[0]));if(b)r.ing.push(["Baby spinach",G(20*(a/250))])}
   r.title=r.title.replace(/^Berry banana/,f[1]);r.learn=undefined}
  if(s.t==="syrup"){const picks=(s.si||[]).filter(x=>IN[x]);if(picks.length){picks.forEach(x=>r.ing.push([IN[x][0],IN[x][1](k)]));
   r.steps.splice(Math.max(0,r.steps.length-1),0,"While the syrup is still warm, add the "+list(picks.map(x=>IN[x][0].toLowerCase().replace(/,.*$/,"")))+" and leave it to steep 20–30 minutes, then strain.");
   r.note=(r.note||[]).concat(["Infused syrup keeps about 2 weeks in the fridge."])}}})}

/* ---------------- Use the leftovers ---------------- */
learn("dairy",["yogurt","cottage","cream"],["Spare whey? Use it instead of water in bread dough, smoothies, soups, or to cook rice and oats for a gentle tang. It keeps about a week in the fridge."]);
learn("dairy",["labneh"],["The whey that drips out keeps a week in the fridge. Use it in bread dough, smoothies and chicken marinades."]);
learn("dairy",["paneer"],["Do not throw the whey away: use it to knead roti or bread dough, or to cook rice and lentils. It keeps 3 days in the fridge."]);
learn("dairy",["kefir"],["Extra kefir blends into smoothies, salad dressings and pancake batter. Strain and share spare grains with a friend."]);
learn("dairy",["butter"],["The buttermilk left behind is good in pancakes, scones and soda bread."]);
learn("cheese",["mozz","halloumi","feta","sir","queso","gouda"],["Keep the whey. Heat it to about 90 °C with a splash of vinegar and you get a small extra batch of ricotta, or use the whey in bread, soups and for cooking grains."]);
learn("cheese",["ricotta"],["The last whey is mild: use it in bread dough or to cook rice and pasta."]);
learn("starter",["sour"],["Starter discard is food: stir it into pancake or waffle batter, crackers, flatbreads or muffins instead of throwing it away. It keeps a week in the fridge.","A starter kept in the fridge needs feeding only about once a week. Feed it once or twice at room temperature before you bake."]);
learn("starter",["komb"],["Extra SCOBYs can live in a \"hotel\" jar covered with kombucha. Add a little of the finished brew to every new batch."]);
learn("soup",["stock"],["Freeze stock in 250 ml tubs or ice-cube trays. Keep onion skins, carrot ends, herb stems and bones in a bag in the freezer until you have enough for a pot."]);
})();
