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
function extend(id,ctls,fn,after){const t=T[id];if(!t)return;const at=after?t.ctl.findIndex(c=>c.k===after):-1;if(at>=0)t.ctl.splice(at+1,0,...ctls);else t.ctl.push(...ctls);const o=t.calc;
 t.calc=function(s){const r=o.call(this,s);try{return fn(r,s)||r}catch(e){console.error(e);return r}}}
/* "Add to it" lines: each option has a name, an amount for n people and a pattern that spots the same thing already in the recipe ("Extra garlic") */
function addOns(r,picked,defs,n){const names=[];
 (picked||[]).forEach(k=>{const d=defs[k];if(!d)return;const dup=d[2]&&r.ing.some(i=>d[2].test(i[0]));r.ing.push([(dup?"Extra: ":"")+d[0],d[1](n)]);names.push(d[0].toLowerCase().replace(/,.*$/,""))});
 return names}

/* ---------------- Sauces: tang and salt dials, add-ins, tips ---------------- */
{const c=T.sauce&&T.sauce.ctl.find(x=>x.k==="p");if(c)c.step[1]=40} // bigger batches, so a 500 ml or 1 L jar can be filled
{const ALL=["vin","yog","pesto","tomato","mayo","guac"];
 const D={garlic:["Garlic, grated",n=>P1(.5*n)+(P1(.5*n)===1?" clove":" cloves"),/garlic/i],chilli:["Fresh chilli, finely chopped",n=>P1(2*n)+" g",/chilli/i],herbs:["Fresh herbs, chopped",n=>G(3*n),/herbs|basil|coriander|chives|dill|parsley/i],
  honey:["Honey",n=>P1(2*n)+" g",/honey/i],mustard:["Dijon mustard",n=>P1(1.5*n)+" g",/mustard/i],zest:["Lemon zest",n=>num(Math.max(1,Math.ceil(n/4)),"lemon","lemons"),/zest/i],
  rosemary:["Rosemary, finely chopped",n=>P1(.5*n)+" g",/rosemary/i],thyme:["Thyme leaves",n=>P1(.5*n)+" g",/thyme/i],oregano:["Dried oregano",n=>P1(.4*n)+" g",/oregano/i],capers:["Capers, chopped",n=>G(5*n),/caper/i],paprika:["Smoked paprika",n=>P1(.7*n)+" g",/paprika/i],anchovy:["Anchovy, finely chopped",n=>G(3*n),/anchov/i]};
 extend("sauce",[
  {k:"xt",label:"Tang (acid)",icon:"flame",def:1,x:1,tg:[[0,"Milder"],[1,"As written"],[2,"Zestier"]],only:ALL},
  {k:"xs",label:"Salt",icon:"flame",def:1,x:1,tg:[[0,"Less"],[1,"As written"],[2,"More"]],only:ALL.concat("bech")},
  {k:"xa",label:"Add to it",icon:"wand",def:[],x:1,ms:[["garlic","Garlic"],["chilli","Chilli"],["herbs","Fresh herbs"],["honey","A little honey"],["mustard","Mustard"],["zest","Lemon zest"],["rosemary","Rosemary"],["thyme","Thyme"],["oregano","Oregano"],["capers","Capers"],["paprika","Smoked paprika"],["anchovy","Anchovy"]],only:ALL}],
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
  {k:"xa",label:"Add-ins",icon:"wand",def:[],x:1,ms:[["vanilla","Vanilla"],["chilli","Chilli"],["ginger","Ginger"],["rosemary","Rosemary"],["cinnamon","Cinnamon"],["orange","Orange zest"],["star","Star anise"],["cardamom","Cardamom"],["thyme","Thyme"],["basil","Basil"],["pepper","Black pepper"]]});
 const P={strawberry:[60,"Low in pectin"],raspberry:[30,"Medium pectin"],apricot:[30,"Medium pectin"],plum:[30,"Medium pectin"],blueberry:[60,"Low in pectin"],cherry:[60,"Low in pectin"],apple:[15,"High in pectin"],blackcurrant:[15,"High in pectin"],
  rhubarb:[45,"Low in pectin"],pear:[60,"Low in pectin"],peach:[60,"Low in pectin"],fig:[60,"Low in pectin"],gooseberry:[15,"High in pectin"],quince:[15,"High in pectin"],mixedberry:[45,"Low to medium pectin"]};
 const SOFT=["rhubarb","pear","quince","apple"]; // firm fruit gets a short simmer in a little water first
 t.calc=function(s){
  const Pk=P[s.u]||P.strawberry,custom=s.l===3,pc=custom?(s.sp||75):[50,65,100][s.l],f=s.w,k=f/1000,sug=f*pc/100,lem=Pk[0]*k,out=(f+sug)*.78,jars=Math.ceil(out/300);
  const tier=pc>=100?2:pc>=60?1:0,keep=["2–3 weeks in the fridge","1–2 months in the fridge, or freeze","1 year in sterilised sealed jars"][tier];
  const soft=SOFT.includes(s.u),water=soft?f*.08:0;
  const A={vanilla:["Vanilla pod, split",num(Math.max(1,Math.round(k)),"pod","pods")],chilli:["Fresh chilli, finely chopped",P1(5*k)+" g"],ginger:["Ginger, grated",G(15*k)],rosemary:["Rosemary",num(Math.max(1,Math.round(k)),"sprig","sprigs")],cinnamon:["Cinnamon stick",num(Math.max(1,Math.round(k)),"stick","sticks")],orange:["Orange zest",num(Math.max(1,Math.round(k)),"orange","oranges")],star:["Star anise",num(Math.max(1,Math.round(k)),"star","stars")],cardamom:["Cardamom pods, crushed",num(Math.max(2,Math.round(3*k)),"pod","pods")],thyme:["Thyme sprigs",num(Math.max(2,Math.round(2*k)),"sprig","sprigs")],basil:["Basil leaves, torn",G(5*k)],pepper:["Black pepper, cracked",P1(1*k)+" g"]};
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
 const IN={ginger:["Ginger, sliced",k=>G(15*k)],mint:["Fresh mint",k=>G(10*k)],vanilla:["Vanilla pod, split",k=>num(Math.max(1,Math.round(k)),"pod","pods")],berries:["Berries",k=>G(100*k)],rosemary:["Rosemary",k=>num(Math.max(1,Math.ceil(k*2)),"sprig","sprigs")],peel:["Lemon peel, in strips",k=>num(Math.max(2,Math.round(k*3)),"strip","strips")],cinnamon:["Cinnamon stick",k=>num(Math.max(1,Math.round(k*2)),"stick","sticks")],star:["Star anise",k=>num(Math.max(1,Math.round(k*2)),"star","stars")],cardamom:["Cardamom pods, crushed",k=>num(Math.max(2,Math.round(k*6)),"pod","pods")],cloves:["Cloves",k=>num(Math.max(2,Math.round(k*4)),"clove","cloves")],thyme:["Thyme sprigs",k=>num(Math.max(2,Math.round(k*4)),"sprig","sprigs")],basil:["Basil leaves",k=>G(10*k)],orange:["Orange peel, in strips",k=>num(Math.max(2,Math.round(k*3)),"strip","strips")]};
 extend("drinks",[
  {k:"sx",label:"Sweetness",icon:"flame",def:1,x:1,tg:[[0,"Less sweet"],[1,"As written"],[2,"Sweeter"]],only:["choc","chai","mulled","smoothie"]},
  {k:"sf",label:"Fruit",icon:"leaf",def:"bb",x:1,tg:[["bb","Berry + banana"],["mg","Mango + banana"],["pb","Peach + berry"],["gs","Apple + spinach"]],only:"smoothie"},
  {k:"si",label:"Infuse the syrup",icon:"wand",def:[],x:1,ms:[["ginger","Ginger"],["mint","Mint"],["vanilla","Vanilla"],["berries","Berries"],["rosemary","Rosemary"],["peel","Lemon peel"],["cinnamon","Cinnamon stick"],["star","Star anise"],["cardamom","Cardamom"],["cloves","Cloves"],["thyme","Thyme"],["basil","Basil"],["orange","Orange peel"]],only:"syrup"},
  {k:"xb",label:"Flavour it with",icon:"wand",def:[],x:1,ms:[["rosemary","Rosemary"],["cinnamon","Cinnamon stick"],["star","Star anise"],["cardamom","Cardamom"],["cloves","Cloves"],["vanilla","Vanilla"],["ginger","Ginger"],["mint","Mint"],["thyme","Thyme"],["basil","Basil"],["orange","Orange peel"],["lemon","Lemon peel"]],only:["tea","lemonade","choc","chai","mulled","smoothie"]}],
 (r,s)=>{const a=s.a||1000,k=a/1000;
  if(["choc","chai","mulled","smoothie"].includes(s.t))scaleRows(r,/^(sugar|honey)/i,[.5,1,1.5][s.sx===undefined?1:s.sx]);
  if(s.t==="smoothie"&&FR[s.sf]){const f=FR[s.sf];
   if(s.sf==="mg"||s.sf==="gs"){const row=r.ing.find(i=>/mixed berries/i.test(i[0]));if(row)row[0]=f[0]}
   if(s.sf==="pb"){const row=r.ing.find(i=>/banana/i.test(i[0]));if(row)row[0]=f[0]}
   if(s.sf==="gs"){const b=r.ing.find(i=>/banana/i.test(i[0]));if(b)r.ing.push(["Baby spinach",G(20*(a/250))])}
   r.title=r.title.replace(/^Berry banana/,f[1]);r.learn=undefined}
  if(["tea","lemonade","choc","chai","mulled","smoothie"].includes(s.t)){const kk=a/250,pc=n=>num(Math.max(1,Math.round(n)),"piece","pieces"),
    B={rosemary:["Rosemary sprigs",num(Math.max(1,Math.round(kk/2)),"sprig","sprigs")],cinnamon:["Cinnamon sticks",num(Math.max(1,Math.round(kk/2)),"stick","sticks")],star:["Star anise",num(Math.max(1,Math.round(kk/2)),"star","stars")],cardamom:["Cardamom pods, crushed",num(Math.max(2,Math.round(2*kk)),"pod","pods")],cloves:["Cloves",num(Math.max(2,Math.round(2*kk)),"clove","cloves")],vanilla:["Vanilla pod, split",num(Math.max(1,Math.round(kk/4)),"pod","pods")],ginger:["Fresh ginger, sliced",G(4*kk)],mint:["Fresh mint",G(3*kk)],thyme:["Thyme sprigs",num(Math.max(1,Math.round(kk/2)),"sprig","sprigs")],basil:["Basil leaves",G(3*kk)],orange:["Orange peel, in strips",num(Math.max(1,Math.round(kk/2)),"strip","strips")],lemon:["Lemon peel, in strips",num(Math.max(1,Math.round(kk/2)),"strip","strips")]};
   const xb=(s.xb||[]).filter(x=>B[x]);if(xb.length){xb.forEach(x=>r.ing.push(B[x]));const nm=list(xb.map(x=>B[x][0].toLowerCase().replace(/,.*$/,"")));
    r.steps.splice(Math.max(0,r.steps.length-1),0,["choc","chai","mulled"].includes(s.t)?"Add the "+nm+" with the other spices and warm them together, then strain.":s.t==="smoothie"?"Blend in the "+nm+" with everything else.":"Add the "+nm+" and leave to steep in the fridge 2 hours, then strain out the woody pieces.")}}
  if(s.t==="syrup"){const picks=(s.si||[]).filter(x=>IN[x]);if(picks.length){picks.forEach(x=>r.ing.push([IN[x][0],IN[x][1](k)]));
   r.steps.splice(Math.max(0,r.steps.length-1),0,"While the syrup is still warm, add the "+list(picks.map(x=>IN[x][0].toLowerCase().replace(/,.*$/,"")))+" and leave it to steep 20–30 minutes, then strain.");
   r.note=(r.note||[]).concat(["Infused syrup keeps about 2 weeks in the fridge."])}}})}

/* ---------------- Soups, breads and cakes: herbs and spices ---------------- */
{const D={rosemary:["Rosemary sprigs",n=>num(Math.max(1,Math.ceil(n/4)),"sprig","sprigs")],thyme:["Thyme sprigs",n=>num(Math.max(1,Math.ceil(n/4)),"sprig","sprigs")],bay:["Bay leaves",n=>num(Math.max(1,Math.ceil(n/4)),"leaf","leaves")],paprika:["Smoked paprika",n=>P1(.7*n)+" g"],chilli:["Chilli flakes",n=>P1(.3*n)+" g"],parmesan:["Parmesan rind",n=>"1 rind (about 30 g)"],zest:["Lemon zest",n=>"1 lemon"],cinnamon:["Cinnamon stick",n=>"1 stick"]};
 extend("soup",[{k:"xa",label:"Add herbs and spices",icon:"wand",def:[],x:1,ms:[["rosemary","Rosemary"],["thyme","Thyme"],["bay","Bay leaf"],["paprika","Smoked paprika"],["chilli","Chilli flakes"],["parmesan","Parmesan rind"],["zest","Lemon zest"],["cinnamon","Cinnamon stick"]],only:["soup","tomato","noodle","lentil","mine","chili"]}],
  (r,s)=>{const a=addOns(r,s.xa,D,s.p||people);if(a.length)r.steps.splice(Math.min(1,r.steps.length),0,"Add the "+list(a)+" when the liquid goes in. Fish out the sprigs, bay leaf, rind and cinnamon stick before serving.")})}
{const B={rosemary:["Rosemary, chopped",f=>P1(2*f)+" g"],thyme:["Thyme leaves",f=>P1(1.5*f)+" g"],garlic:["Garlic, finely chopped",f=>P1(5*f)+" g"],olives:["Black olives, chopped",f=>G(60*f)],seeds:["Seeds (sesame, fennel or nigella)",f=>G(15*f)],parmesan:["Parmesan, grated",f=>G(40*f)],oregano:["Dried oregano",f=>P1(1.5*f)+" g"]};
 const D=o=>Object.keys(o).reduce((m,k)=>(m[k]=[o[k][0],o[k][1]],m),{});
 extend("bread",[{k:"xa",label:"Add herbs and flavours",icon:"wand",def:[],x:1,ms:[["rosemary","Rosemary"],["thyme","Thyme"],["garlic","Garlic"],["olives","Olives"],["seeds","Seeds"],["parmesan","Parmesan"],["oregano","Oregano"]]}],
  (r,s)=>{const f=(s.f||500)/500,a=addOns(r,s.xa,D(B),f);if(a.length)r.steps.splice(Math.min(1,r.steps.length),0,"Mix the "+list(a)+" into the dough at the end of mixing. For focaccia, press them on top just before baking.")})
 const C={cinnamon:["Ground cinnamon",f=>P1(3*f)+" g"],cardamom:["Ground cardamom",f=>P1(1.5*f)+" g"],zest:["Orange or lemon zest",f=>num(Math.max(1,Math.round(f)),"fruit","fruits")],vanilla:["Vanilla extract",f=>P1(5*f)+" g"],rosemary:["Rosemary, finely chopped",f=>P1(1.5*f)+" g"],nutmeg:["Nutmeg, grated",f=>P1(.5*f)+" g"]};
 if(T.bake)extend("bake",[{k:"xa",label:"Add flavours",icon:"wand",def:[],x:1,ms:[["cinnamon","Cinnamon"],["cardamom","Cardamom"],["zest","Citrus zest"],["vanilla","Vanilla"],["rosemary","Rosemary"],["nutmeg","Nutmeg"]]}],
  (r,s)=>{const fr=r.ing.find(i=>/flour/i.test(i[0])&&/^\d/.test(i[1]));if(!fr||!(s.xa||[]).length)return;const f=parseFloat(fr[1])/250,a=addOns(r,s.xa,D(C),f);
   if(a.length)r.steps.splice(Math.min(1,r.steps.length),0,"Mix the "+list(a)+" in with the dry ingredients.")})}

/* ---------------- "Inspired by": a cuisine for burgers, sandwiches and wraps ----------------
   Each style swaps the sauce or spread, adds its cheese and toppings (grams per person), and gives a tip. */
{const STY={
 fr:{adj:"French-inspired",sauce:[["Mayonnaise",15],["Dijon mustard",5],["Chives, chopped",1]],cheese:["Brie, sliced",25],tops:[["Cornichons, sliced",10],["Watercress",6]],bun:"brioche",tip:"Toast the bread or bun in butter until golden, the French way.",note:"Dijon, creamy brie and sharp cornichons."},
 it:{adj:"Italian-inspired",sauce:[["Mayonnaise",12],["Basil pesto",12]],cheese:["Fresh mozzarella, sliced",30],tops:[["Roasted red peppers",20],["Rocket",8],["Balsamic glaze",3]],bun:"ciabatta",tip:"Warm the bread cut side down in a dry pan, then finish with a drizzle of balsamic glaze.",note:"Pesto, mozzarella and roasted peppers."},
 gr:{adj:"Greek-inspired",sauce:[["Greek yogurt",25],["Cucumber, grated and squeezed dry",12],["Garlic, crushed",1],["Lemon juice",3],["Dill, chopped",1]],cheese:["Feta, crumbled",20],tops:[["Red onion, thinly sliced",10],["Cucumber, sliced",15],["Kalamata olives, sliced",8]],bun:"pitta or soft",tip:"A pinch of dried oregano on the meat and a squeeze of lemon at the end.",note:"Tzatziki, feta and olives."},
 mx:{adj:"Mexican-inspired",sauce:[["Soured cream",22],["Chipotle paste",4],["Lime juice",4]],cheese:["Pepper jack or Monterey Jack, grated",20],tops:[["Avocado, mashed with lime",40],["Pickled jalapeños",8],["Fresh coriander",3],["Red onion, finely chopped",8]],bun:"soft",tip:"Season the meat with a pinch of cumin and chilli powder before cooking.",note:"Chipotle crema, avocado and jalapeños."},
 jp:{adj:"Japanese-inspired",sauce:[["Mayonnaise",15],["Soy sauce",6],["Mirin",6],["Sesame seeds",2]],tops:[["Cabbage, finely shredded",25],["Pickled ginger",8],["Spring onion, sliced",5]],bun:"soft milk",tip:"Brush the meat with a little extra soy sauce and mirin in the last minute for shine.",note:"Sesame mayo, crisp cabbage and pickled ginger."},
 kr:{adj:"Korean-inspired",sauce:[["Mayonnaise",18],["Gochujang",6],["Honey",2]],tops:[["Kimchi, chopped",25],["Spring onion, sliced",5],["Sesame seeds",2]],bun:"soft",tip:"Squeeze the kimchi dry so the bread does not go soggy.",note:"Gochujang mayo and tangy kimchi."},
 in:{adj:"Indian-inspired",sauce:[["Plain yogurt",25],["Fresh mint, chopped",4],["Lime juice",3],["Green chilli, finely chopped",1]],cheese:["Paneer, sliced and pan-fried",30],tops:[["Red onion rings",10],["Tomato, sliced",20],["Mango chutney",10],["Fresh coriander",3]],patty:["Garam masala",1.5],bun:"soft or naan-style",tip:"Fry the paneer slices 1–2 minutes per side until golden.",note:"Mint yogurt, paneer and mango chutney."},
 me:{adj:"Middle Eastern",sauce:[["Plain yogurt",20],["Tahini",8],["Lemon juice",4],["Garlic, crushed",1]],cheese:["Halloumi, sliced",30],tops:[["Pickled turnips or cucumbers",15],["Tomato, sliced",20],["Flat-leaf parsley",3],["Za'atar",1]],bun:"pitta",tip:"Grill the halloumi 1 minute per side until golden.",note:"Tahini yogurt, halloumi and za'atar."},
 vn:{adj:"Vietnamese-inspired",sauce:[["Mayonnaise",15],["Sriracha",3]],tops:[["Pickled carrots",20],["Cucumber, sliced",15],["Fresh coriander",4],["Fresh chilli, sliced",3]],patty:["Fish sauce",3],bun:"baguette-style",tip:"A crusty baguette-style roll is what makes it a bánh mì.",note:"Sriracha mayo, pickled carrots and coriander."},
 es:{adj:"Spanish-inspired",sauce:[["Mayonnaise",20],["Garlic, crushed",2],["Smoked paprika",2]],cheese:["Manchego, sliced",20],tops:[["Roasted red peppers",20],["Rocket",8],["Chorizo, thinly sliced and fried",20]],bun:"rustic",tip:"Fry the chorizo slices 1 minute per side to release their red oil.",note:"Smoked paprika aioli, manchego and chorizo."},
 tx:{adj:"Texas BBQ-style",sauce:[["BBQ sauce",25],["Mayonnaise",8]],cheese:["Cheddar, sliced",20],tops:[["Coleslaw",30],["Crispy fried onions",8],["Pickles",12]],bun:"soft",tip:"Toast the bread on the grill with a little butter.",note:"Smoky sauce, cheddar and coleslaw."}};
 const OPTS=[["none","Classic"],["fr","French"],["it","Italian"],["gr","Greek"],["mx","Mexican"],["jp","Japanese"],["kr","Korean"],["in","Indian"],["me","Middle Eastern"],["vn","Vietnamese"],["es","Spanish"],["tx","Texas BBQ"]];
 const CTL=[{k:"xi",label:"Inspired by (swaps the sauce, cheese and toppings)",icon:"wand",def:"none",tg:OPTS}];
 const lo=a=>a.map(x=>{const n=x[0].replace(/,.*$/,"");return /^(Dijon|Greek|BBQ|Kalamata|Monterey)/.test(n)?n:n.charAt(0).toLowerCase()+n.slice(1)});
 extend("burger",CTL,(r,s)=>{const st=STY[s.xi];if(!st)return;const n=s.p||people;
  r.ing=r.ing.filter(i=>!/^Sauce: /.test(i[0]));st.sauce.forEach(x=>r.ing.push(["Sauce: "+x[0],G(x[1]*n)]));
  if(st.cheese){r.ing=r.ing.filter(i=>!/^Toppings: (Cheddar|Swiss|Blue cheese|American|Pepper jack)/.test(i[0]));r.ing.push(["Toppings: "+st.cheese[0],G(st.cheese[1]*n)]);r.title=r.title.replace(/^(\d+) (cheddar|Swiss|blue cheese|American cheese|pepper jack) /,"$1 ")}
  st.tops.forEach(x=>r.ing.push(["Toppings: "+x[0],G(x[1]*n)]));
  if(st.patty){r.ing.push(["Patty: "+st.patty[0],P1(st.patty[1]*n)+" g"]);const i=r.steps.findIndex(x=>/^Patties:/.test(x));if(i>=0)r.steps[i]+=" Mix in the "+st.patty[0].toLowerCase()+"."}
  const mix="Stir the "+list(lo(st.sauce))+" together and toast the buns.",i2=r.steps.findIndex(x=>/^Stir the sauce ingredients/.test(x));if(i2>=0)r.steps[i2]=mix;
  const last=r.steps.length-1;r.steps.splice(last,0,st.tip);const fin=list(lo(st.tops));
  r.steps[r.steps.length-1]=r.steps[r.steps.length-1].replace(/ patty with (cheddar|Swiss|blue cheese|American cheese|pepper jack)/,st.cheese?" patty with "+lo([st.cheese])[0]:" patty").replace("Add the top bun","Add the "+fin+", then the top bun");
  r.title=r.title.replace(/^(\d+) /,"$1 "+st.adj+" ");r.note=[st.note+" "+(r.note&&r.note[0]||"")].concat((r.note||[]).slice(1));
  const bun=r.ing.find(i=>i[0]==="Bun: burger buns");if(bun)bun[0]="Bun: "+st.bun+" burger buns";else r.note.push("Tip: "+st.bun+" buns suit this style. Try the Soft rolls tool.")},"t");
 const sw=T.burger.spin;if(sw)T.burger.spin=function(s){sw.call(this,s);s.xi=Math.random()<.5?"none":OPTS[1+Math.floor(Math.random()*(OPTS.length-1))][0]};
 extend("sandwich",CTL,(r,s)=>{const st=STY[s.xi];if(!st)return;const n=s.p||people;
  r.ing=r.ing.filter(i=>!/^(Mayonnaise|Mustard)$/.test(i[0]));
  st.sauce.forEach(x=>r.ing.push([x[0],G(x[1]*n)]));if(st.cheese)r.ing.push([st.cheese[0],G(st.cheese[1]*n)]);st.tops.forEach(x=>r.ing.push([x[0],G(x[1]*n)]));
  r.steps.unshift("Stir together the "+list(lo(st.sauce))+" for your spread. "+st.tip);
  r.steps.splice(Math.max(1,r.steps.length-1),0,"Add the "+list(lo(st.tops).concat(st.cheese?lo([st.cheese]):[]))+" along with the filling.");
  r.title=st.adj+" "+r.title.charAt(0).toLowerCase()+r.title.slice(1);r.note=[st.note].concat(r.note||[])},"f")}

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
