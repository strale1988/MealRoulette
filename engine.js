// Meal generator: ingredients x techniques x templates x cuisines. Metric only.
(function(){
const rnd=a=>a[Math.floor(Math.random()*a.length)], shuf=a=>a.slice().sort(()=>Math.random()-.5);
const G=window.GEN={};

// cuisine: ar=aromatics, sp=spices, sauce, fat, fin=finish. [name, amount per person, unit]
G.cuisines={
 Italian:{ar:[["garlic clove",1,"pcs"],["onion",50,"g"]],sp:[["dried oregano",1,"g"],["chilli flakes",0.5,"g"]],sauce:[["canned tomatoes",120,"g"]],fat:"olive oil",fin:"Finish with fresh basil and grated parmesan."},
 Mexican:{ar:[["garlic clove",1,"pcs"],["onion",50,"g"]],sp:[["ground cumin",2,"g"],["smoked paprika",2,"g"],["chilli powder",1,"g"]],sauce:[["canned tomatoes",100,"g"],["lime juice",10,"ml"]],fat:"oil",fin:"Top with coriander and a squeeze of lime."},
 Indian:{ar:[["garlic clove",1,"pcs"],["fresh ginger",5,"g"],["onion",60,"g"]],sp:[["garam masala",2,"g"],["turmeric",1,"g"],["ground cumin",2,"g"]],sauce:[["canned tomatoes",100,"g"],["plain yogurt",30,"g"]],fat:"oil",fin:"Finish with coriander and a spoon of yogurt."},
 Thai:{ar:[["garlic clove",1,"pcs"],["fresh ginger",5,"g"],["shallot",30,"g"]],sp:[["red curry paste",15,"g"]],sauce:[["coconut milk",100,"ml"],["soy sauce",10,"ml"],["lime juice",10,"ml"]],fat:"oil",fin:"Top with coriander or Thai basil and a squeeze of lime."},
 Chinese:{ar:[["garlic clove",1,"pcs"],["fresh ginger",5,"g"],["spring onion",20,"g"]],sp:[["white pepper",0.5,"g"]],sauce:[["soy sauce",20,"ml"],["rice vinegar",5,"ml"],["sesame oil",3,"ml"]],fat:"oil",fin:"Sprinkle with sesame seeds."},
 Japanese:{ar:[["garlic clove",1,"pcs"],["fresh ginger",5,"g"],["spring onion",20,"g"]],sp:[["white pepper",0.5,"g"]],sauce:[["soy sauce",20,"ml"],["mirin",15,"ml"],["rice vinegar",5,"ml"]],fat:"oil",fin:"Finish with sesame seeds and spring onion."},
 Korean:{ar:[["garlic clove",2,"pcs"],["spring onion",20,"g"]],sp:[["gochugaru (chilli flakes)",2,"g"]],sauce:[["gochujang",15,"g"],["soy sauce",15,"ml"],["honey",5,"g"]],fat:"oil",fin:"Top with sesame seeds."},
 Greek:{ar:[["garlic clove",1,"pcs"],["onion",40,"g"]],sp:[["dried oregano",1,"g"]],sauce:[["lemon juice",15,"ml"],["canned tomatoes",80,"g"]],fat:"olive oil",fin:"Crumble feta over and add a squeeze of lemon."},
 "Middle Eastern":{ar:[["garlic clove",1,"pcs"],["onion",50,"g"]],sp:[["ground cumin",2,"g"],["ground coriander",1,"g"],["sumac",1,"g"]],sauce:[["plain yogurt",40,"g"],["lemon juice",10,"ml"]],fat:"olive oil",fin:"Finish with parsley and a drizzle of tahini."},
 French:{ar:[["garlic clove",1,"pcs"],["shallot",30,"g"]],sp:[["dried thyme",1,"g"]],sauce:[["Dijon mustard",5,"g"],["cream",40,"ml"]],fat:"butter",fin:"Finish with parsley."},
 Spanish:{ar:[["garlic clove",1,"pcs"],["onion",50,"g"]],sp:[["smoked paprika",2,"g"]],sauce:[["canned tomatoes",100,"g"],["sherry vinegar",5,"ml"]],fat:"olive oil",fin:"Finish with parsley."},
 Balkan:{ar:[["garlic clove",1,"pcs"],["onion",60,"g"]],sp:[["sweet paprika",3,"g"]],sauce:[["ajvar",40,"g"],["sour cream",30,"g"]],fat:"oil",fin:"Serve with parsley and a spoon of sour cream."},
 Moroccan:{ar:[["garlic clove",1,"pcs"],["onion",50,"g"]],sp:[["ground cumin",2,"g"],["cinnamon",1,"g"],["ground ginger",1,"g"],["sweet paprika",1,"g"]],sauce:[["canned tomatoes",100,"g"],["lemon juice",10,"ml"]],fat:"olive oil",fin:"Finish with coriander, parsley and a few olives."},
 Vietnamese:{ar:[["garlic clove",1,"pcs"],["shallot",30,"g"]],sp:[["black pepper",0.5,"g"]],sauce:[["soy sauce",15,"ml"],["lime juice",15,"ml"],["sugar",3,"g"]],fat:"oil",fin:"Top with fresh mint, coriander and lime."},
 Caribbean:{ar:[["garlic clove",1,"pcs"],["onion",50,"g"],["spring onion",20,"g"]],sp:[["allspice",1,"g"],["dried thyme",1,"g"],["chilli powder",1,"g"]],sauce:[["coconut milk",100,"ml"],["lime juice",10,"ml"]],fat:"oil",fin:"Finish with lime and fresh thyme."},
 Turkish:{ar:[["garlic clove",1,"pcs"],["onion",50,"g"]],sp:[["chilli flakes",1,"g"],["ground cumin",2,"g"],["dried mint",1,"g"]],sauce:[["canned tomatoes",80,"g"],["plain yogurt",40,"g"]],fat:"olive oil",fin:"Finish with parsley and a spoon of yogurt."},
 Hungarian:{ar:[["garlic clove",1,"pcs"],["onion",80,"g"]],sp:[["sweet paprika",4,"g"],["caraway seeds",1,"g"]],sauce:[["canned tomatoes",80,"g"],["sour cream",30,"g"]],fat:"oil",fin:"Finish with sour cream and parsley."},
 Indonesian:{ar:[["garlic clove",2,"pcs"],["shallot",30,"g"],["fresh ginger",5,"g"]],sp:[["ground coriander",1,"g"],["turmeric",1,"g"],["chilli powder",1,"g"]],sauce:[["soy sauce",15,"ml"],["coconut milk",80,"ml"],["lime juice",10,"ml"]],fat:"oil",fin:"Top with spring onion and a squeeze of lime."},
 Peruvian:{ar:[["garlic clove",2,"pcs"],["onion",50,"g"]],sp:[["ground cumin",2,"g"],["sweet paprika",2,"g"],["chilli powder",1,"g"]],sauce:[["lime juice",15,"ml"],["soy sauce",10,"ml"]],fat:"oil",fin:"Finish with coriander and lime."},
 Cajun:{ar:[["garlic clove",1,"pcs"],["onion",50,"g"],["celery",30,"g"]],sp:[["smoked paprika",2,"g"],["dried thyme",1,"g"],["dried oregano",1,"g"],["chilli powder",1,"g"]],sauce:[["canned tomatoes",80,"g"]],fat:"oil",fin:"Finish with spring onion and hot sauce."},
 Persian:{ar:[["onion",60,"g"],["garlic clove",1,"pcs"]],sp:[["turmeric",1,"g"],["cinnamon",1,"g"],["dried mint",1,"g"]],sauce:[["lemon juice",15,"ml"],["canned tomatoes",60,"g"]],fat:"oil",fin:"Finish with parsley and fresh mint."},
 German:{ar:[["onion",60,"g"],["garlic clove",1,"pcs"]],sp:[["caraway seeds",1,"g"],["dried thyme",1,"g"]],sauce:[["Dijon mustard",8,"g"],["apple cider vinegar",10,"ml"]],fat:"butter",fin:"Serve with more mustard and fresh parsley."},
 Polish:{ar:[["onion",60,"g"],["garlic clove",1,"pcs"]],sp:[["dried marjoram",1,"g"],["black pepper",0.5,"g"]],sauce:[["sour cream",40,"g"],["Dijon mustard",5,"g"]],fat:"butter",fin:"Finish with dill and a spoon of sour cream."},
 Ethiopian:{ar:[["garlic clove",2,"pcs"],["onion",80,"g"],["fresh ginger",5,"g"]],sp:[["sweet paprika",3,"g"],["ground cumin",1,"g"],["ground coriander",1,"g"],["chilli powder",1,"g"]],sauce:[["canned tomatoes",100,"g"]],fat:"oil",fin:"Serve with flatbread."},
 Portuguese:{ar:[["garlic clove",2,"pcs"],["onion",50,"g"]],sp:[["smoked paprika",2,"g"],["bay leaf",0.2,"g"]],sauce:[["canned tomatoes",80,"g"],["lemon juice",10,"ml"]],fat:"olive oil",fin:"Finish with parsley and a squeeze of lemon."}
};

// proteins: key,name,regex,g/person,pan-minutes,doneness,unit,roast-minutes
const P=[
["chicken","chicken breast","chicken|turkey",150,7,"until no pink remains (75 °C inside)","g",30],
["pork","pork loin","pork|\\bham",150,8,"until cooked through (70 °C inside)","g",30],
["beef","beef strips","beef|steak|mince",130,6,"until browned (63 °C for medium, 71 °C if minced)","g",25],
["lamb","lamb","lamb",130,7,"until browned (63 °C for medium)","g",30],
["salmon","salmon fillet","salmon|trout",150,7,"until it flakes (63 °C)","g",12],
["cod","white fish fillet","cod|fish|haddock|hake",150,6,"until it flakes (63 °C)","g",12],
["prawns","prawns","prawn|shrimp",120,4,"until pink and curled","g",8],
["tofu","firm tofu","tofu",150,8,"until golden on all sides","g",25],
["tempeh","tempeh","tempeh",120,8,"until golden","g",25],
["halloumi","halloumi","halloumi",100,4,"until golden on both sides","g",10],
["egg","eggs","\\beggs?\\b",2,3,"until just set","pcs",0],
["chickpeas","canned chickpeas (drained)","chickpea",120,5,"until lightly crisp","g",20],
["lentils","canned lentils (drained)","lentil",120,5,"until heated through","g",20],
["beans","canned beans (drained)","bean",120,5,"until heated through","g",20],
["sausage","sausages","sausage|chorizo",120,10,"until browned and cooked through (72 °C)","g",30],
["chickenthigh","chicken thighs","thigh|drumstick",180,9,"until golden and 75 °C inside","g",35],
["duck","duck breast","duck",140,8,"until golden (70 °C inside)","g",25],
["tuna","canned tuna (drained)","tuna",100,2,"until just warmed through","g",8],
["bacon","bacon","bacon",60,6,"until crisp","g",15],
["paneer","paneer","paneer",120,5,"until golden on both sides","g",15]];

// carbs: key,name,regex,g dry/person,water ratio,minutes
const C=[
["rice","rice (dry)","rice",75,1.5,12],["pasta","pasta (dry)","pasta|spaghetti|penne|fusilli|orzo|macaroni|tagliatelle|linguine",100,0,10],
["noodles","noodles (dry)","noodle|ramen",80,0,4],["sweet","sweet potato","sweet potato",250,0,20],
["potato","potatoes","potato",250,0,18],["couscous","couscous (dry)","couscous",70,1,5],
["bulgur","bulgur (dry)","bulgur",70,1.5,12],["quinoa","quinoa (dry)","quinoa",70,2,15],
["bread","bread / pita","bread|pita|tortilla|naan",70,0,3],
["barley","pearl barley (dry)","barley",70,3,25],["polenta","polenta (dry)","polenta",70,4,8],["gnocchi","gnocchi","gnocchi",150,0,3]];

// veg: key,name,regex,g/person,saute-min,roast-min (0 = don't roast),raw-ok
const V=[
["broccoli","broccoli","broccoli",150,5,20,0],["cauliflower","cauliflower","cauliflower",150,6,25,0],
["spinach","spinach","spinach",100,2,0,1],["kale","kale","kale|chard",80,4,15,0],
["tomato","tomatoes","tomato",150,4,20,1],["pepper","bell pepper","bell pepper|\\bpepper",150,6,25,1],
["zucchini","zucchini","zucchini|courgette",150,5,20,0],["aubergine","aubergine","aubergine|eggplant",150,8,25,0],
["carrot","carrots","carrot",150,8,30,1],["mushroom","mushrooms","mushroom",150,6,20,0],
["onion","onions","onion",100,6,25,0],["cabbage","cabbage","cabbage",150,6,0,1],
["peas","peas","peas",100,3,0,0],["beans","green beans","green bean",120,6,20,0],
["asparagus","asparagus","asparagus",120,4,12,0],["corn","sweetcorn","corn",100,4,0,0],
["pumpkin","pumpkin","pumpkin|squash|butternut",200,10,30,0],["leek","leek","leek",100,6,0,0],
["cucumber","cucumber","cucumber",150,0,0,1],["lettuce","lettuce","lettuce|salad",80,0,0,1],
["celery","celery","celery",80,6,0,1],["fennel","fennel","fennel",120,8,25,1],["beetroot","beetroot","beetroot|beet",150,10,35,0],["pakchoi","pak choi","bok choy|pak choi|pakchoi",120,3,12,0],["brussels","brussels sprouts","brussels",150,8,25,0],["rocket","rocket","rocket|arugula",60,1,0,1]];

const find=(l,it)=>l.filter(x=>it.some(w=>new RegExp(x[2]).test(w)));
const hasW=(it,name)=>it.some(w=>w.includes(name.split(" ")[0].toLowerCase()));

function carbCook(c,n){
 const w=Math.round(c[3]*n*c[4]/5)*5,k=c[0];
 if(k==="couscous")return`Pour ${w} ml boiling water over the couscous, cover for 5 minutes, then fluff with a fork.`;
 if(k==="polenta")return`Whisk the polenta into ${w} ml boiling salted water and stir for ${c[5]} minutes until thick.`;
 if(k==="gnocchi")return"Boil the gnocchi in salted water until they float, about 3 minutes, then drain.";
 if(c[4])return`Rinse the ${k}, then simmer with ${w} ml water and a pinch of salt, covered, on low for ${c[5]} minutes. Rest 5–10 minutes.`;
 if(k==="pasta"||k==="noodles")return`Boil in well-salted water (10 g salt per litre, 1 litre per 100 g) for ${c[5]} minutes, then drain.`;
 if(k==="bread")return"Warm or toast the bread until golden.";
 return`Cut into 3 cm chunks and boil in salted water for ${c[5]} minutes until a knife slides in easily.`;
}
const pcook=(p,pn)=>p[0]==="egg"?"Beat the eggs with a pinch of salt and scramble over medium heat for 2–3 minutes.":`Add the ${pn}, cut into bite-size pieces, and cook ${p[4]} minutes, turning, ${p[5]}.`;

G.make=function(it,n,cuName,diet){
 diet=diet||{};
 if(!G.cuisines[cuName])cuName=rnd(Object.keys(G.cuisines));
 let cu=G.cuisines[cuName];
 const banP=new Set([...(diet.veg||diet.vegan?["chicken","chickenthigh","pork","beef","lamb","duck","salmon","cod","prawns","tuna","sausage","bacon"]:[]),...(diet.vegan||diet.noegg?["egg"]:[]),...(diet.vegan||diet.dairy?["halloumi","paneer"]:[]),...(diet.nofish?["salmon","cod","prawns","tuna"]:[]),...(diet.nosoy?["tofu","tempeh"]:[])]);
 const banC=new Set(diet.gf?["pasta","noodles","couscous","bulgur","bread","barley","gnocchi"]:[]);
 const PP=P.filter(x=>!banP.has(x[0])),CC=C.filter(x=>!banC.has(x[0]));
 cu={...cu,sauce:cu.sauce.filter(a=>!((diet.vegan||diet.dairy)&&/yogurt|cream/.test(a[0])||diet.vegan&&/honey/.test(a[0]))).map(a=>[diet.nosoy?a[0].replace("soy sauce","coconut aminos"):diet.gf?a[0].replace("soy sauce","tamari"):a[0],a[1],a[2]]),fat:(diet.vegan||diet.dairy)&&cu.fat==="butter"?"oil":cu.fat};
 const hp=find(PP,it),hc=find(CC,it),hv=find(V,it);
 const p=hp.length?rnd(hp):rnd(PP.filter(x=>x[0]!=="egg")),c=hc.length?rnd(hc):rnd(CC.filter(x=>x[0]!=="bread"));
 let vs=shuf(hv).slice(0,2);
 const tpl=rnd(p[0]==="egg"?["stirfry","bowl","simmer"]:["stirfry","traybake","simmer","bowl"]);
 if(!vs.length)vs=shuf(V.filter(x=>x[5])).slice(0,2);
 if(tpl==="traybake"){vs=vs.filter(v=>v[5]);if(!vs.length)vs=[V.find(v=>v[0]==="carrot")]}
 const tn=(x,d)=>it.find(w=>new RegExp(x).test(w))||d;
 const pn=tn(p[2],p[1]),cn=tn(c[2],c[1]),vn=vs.map(v=>tn(v[2],v[1]));
 const ing=[],A=(name,a,u,have)=>ing.push({name,a,u,txt:fmt(a,u),have:have!==false});
 const o=fmt(10*n,"ml"),ar=cu.ar.map(a=>a[0]).join(", "),sp=cu.sp.map(a=>a[0]).join(", "),sau=cu.sauce.map(a=>a[0]).join(", ");
 const byVeg=vs.map((v,i)=>({v,name:vn[i]})).sort((a,b)=>b.v[4]-a.v[4]);
 A(pn,p[3]*n,p[6],hp.includes(p));A(cn,c[3]*n,"g",hc.includes(c));
 vs.forEach((v,i)=>A(vn[i],v[3]*n/vs.length,"g",hv.includes(v)));
 cu.ar.forEach(a=>A(a[0],a[1]*n,a[2],hasW(it,a[0])));cu.sp.forEach(a=>A(a[0],a[1]*n,a[2],hasW(it,a[0])));
 if(tpl!=="traybake")cu.sauce.forEach(a=>A(a[0],a[1]*n,a[2],hasW(it,a[0])));
 A(cu.fat,10*n,"ml",hasW(it,cu.fat));A("salt",2*n,"g");
 if(tpl==="bowl")A("lemon juice",10*n,"ml",hasW(it,"lemon"));
 const S=[];let min,label;
 if(tpl==="stirfry"){
  label="stir-fry";
  S.push(carbCook(c,n),`Heat ${o} ${cu.fat} in a wide pan over medium-high heat and fry the ${ar} (finely chopped) for 1 minute.`,pcook(p,pn),
   ...byVeg.map(x=>`Add the ${x.name} (sliced) and stir-fry for ${x.v[4]} minutes.`),
   `Stir in the ${sp} for 30 seconds, then add the ${sau} and toss for 1–2 minutes until glossy.`,`Serve over the ${cn}. ${cu.fin}`);
  min=c[5]+10+p[4]+byVeg.reduce((s,x)=>s+x.v[4],0);
 }else if(tpl==="traybake"){
  label="traybake";
  const items=[{name:pn,m:p[7]}];vs.forEach((v,i)=>items.push({name:vn[i],m:v[5]}));
  if(c[0]==="potato"||c[0]==="sweet")items.push({name:cn,m:c[0]==="potato"?35:30});else S.push(carbCook(c,n));
  items.sort((a,b)=>b.m-a.m);const T=items[0].m;min=T+15;
  S.push(`Heat the oven to 200 °C. Chop everything into similar-sized pieces and toss with ${o} ${cu.fat}, the ${sp}, the ${ar} and salt.`,
   `Spread the ${items.filter(x=>x.m===T).map(x=>x.name).join(" and ")} on a tray and roast for ${T} minutes.`);
  items.filter(x=>x.m<T).forEach(x=>S.push(`After ${T-x.m} minutes, add the ${x.name} to the tray.`));
  S.push(`Check the ${pn} is cooked ${p[5]}.`,cu.fin);
 }else if(tpl==="simmer"){
  label=["Indian","Thai"].includes(cuName)?"curry":"stew";
  A("stock",200*n,"ml",hasW(it,"stock"));
  S.push(carbCook(c,n),`Heat ${o} ${cu.fat} in a wide pot and fry the ${ar} (finely chopped) for 5 minutes until soft.`,`Stir in the ${sp} for 1 minute.`);
  if(p[0]!=="egg")S.push(`Add the ${pn}, cut into chunks, and brown for ${Math.min(p[4],5)} minutes.`);
  S.push(`Add the ${sau}, ${fmt(200*n,"ml")} stock and the ${byVeg.map(x=>x.name).join(" and ")}. Bring to the boil, then simmer gently for 20 minutes.`);
  S.push(p[0]==="egg"?"Make wells, crack in the eggs, cover and cook 6–8 minutes until set.":`Check the ${pn} is cooked ${p[5]}.`,`Serve with the ${cn}. ${cu.fin}`);
  min=c[5]+35;
 }else{
  label="bowl";
  const raw=vs.filter(v=>v[6]),hot=vs.filter(v=>!v[6]);
  S.push(carbCook(c,n),`Heat ${o} ${cu.fat} in a pan over medium-high heat. ${pcook(p,pn)}`);
  hot.forEach(v=>S.push(`Cook the ${vn[vs.indexOf(v)]} in the same pan for ${v[4]} minutes.`));
  S.push(`Slice ${raw.length?"the "+raw.map(v=>vn[vs.indexOf(v)]).join(" and "):"some fresh herbs"} thinly.`,
   `Whisk ${fmt(10*n,"ml")} lemon juice with the ${sau}, ${sp} and a pinch of salt for the dressing.`,`Build the bowl with ${cn}, ${pn} and vegetables, then pour over the dressing. ${cu.fin}`);
  min=c[5]+p[4]+15;
 }
 return{title:`${cuName} ${p[0]==="egg"?"eggs":p[0]} ${label} with ${cn.replace(" (dry)","")} & ${vn.join(" & ")}`,
  desc:`Generated: ${cuName} flavours, ${label}. Quantities are for ${n} ${n>1?"people":"person"}.`,min:Math.round(min),ing,steps:S};
};

// ---- breakfast / snack / dessert templates ----
const FRUIT="banana|apple|pear|berr|peach|plum|mango|orange",FR=["banana","apple","pear","berries","peach","plum","mango","orange"];
const cap=s=>s[0].toUpperCase()+s.slice(1);
G.makeSmall=function(meal,it,n,diet){
 diet=diet||{};const vg=diet.vegan,nd=vg||diet.dairy,ne=vg||diet.noegg,nn=diet.nuts,gf=diet.gf;
 const has=re=>it.some(w=>re.test(w)),fr=it.find(w=>new RegExp(FRUIT).test(w)),f=fr||rnd(FR),ing=[];
 const A=(name,a,u,h)=>ing.push({name,a,u,txt:fmt(a,u),have:h!==false});
 const milk=nd?"oat milk":"milk",yog=nd?"plant yogurt":"yogurt",sw=vg?"maple syrup":"honey",fat=nd?"coconut oil":"butter",nut=nn?"pumpkin seeds":"walnuts",oats=gf?"gluten-free oats":"oats";
 const cuN=rnd(Object.keys(G.cuisines)),cu=G.cuisines[cuN],o={};
 const vrow=pool=>{const k=rnd(pool);return find(V,it).find(v=>pool.includes(v[0]))||V.find(v=>v[0]===k)},vnm=v=>it.find(w=>new RegExp(v[2]).test(w))||v[1];
 let t;
 if(meal==="Breakfast"){t=has(/\beggs?\b/)&&!ne?"eggs":has(/oat/)?"porridge":rnd(["porridge","parfait","pancakes"].concat(ne?[]:["eggs"]))}
 else if(meal==="Snack"){t=has(/chickpea/)?"chickpeas":rnd(["dippers","chickpeas","fruitnuts"].concat(gf?[]:["bruschetta"]))}
 else t=has(/banana/)?"icecream":rnd(["crumble","icecream","chia"]);
 if(t==="porridge"){A(oats,50*n,"g",has(/oat/));A(milk,250*n,"ml",has(/milk/));A(f,80*n,"g",!!fr);A(sw,10*n,"g",false);A("cinnamon",n,"g",false);
  o.title=cap(f)+" porridge";o.min=10;o.steps=[`Simmer the ${oats} with the ${milk} and a pinch of salt for 5 minutes, stirring, until creamy.`,`Top with sliced ${f}, ${sw} and cinnamon.`]}
 else if(t==="parfait"){A(yog,150*n,"g",has(/yogh?urt/));A(f,80*n,"g",!!fr);A(nut,15*n,"g",false);A(sw,10*n,"g",false);
  o.title=cap(f)+" yogurt parfait";o.min=5;o.steps=[`Slice the ${f}.`,`Layer ${yog}, ${f} and chopped ${nut} in a glass.`,`Drizzle with ${sw}.`]}
 else if(t==="pancakes"){A("ripe banana",n,"pcs",has(/banana/));A(oats,40*n,"g",has(/oat/));ne?A(milk,60*n,"ml",false):A("eggs",n,"pcs",has(/\beggs?\b/));A(fat,5*n,"g",false);
  o.title="Banana oat pancakes";o.min=15;o.steps=["Blend the banana, oats and "+(ne?milk:"eggs")+" into a smooth batter.",`Heat the ${fat} in a non-stick pan over medium heat.`,"Cook small rounds 2–3 minutes per side until golden."]}
 else if(t==="eggs"){const v=vrow(["tomato","spinach","mushroom","pepper"]),st=rnd(["scrambled","fried","poached","omelette"]),sp=cu.sp[0];
  const cook={scrambled:"Beat the eggs with a pinch of salt and scramble gently over medium-low heat for 3 minutes.",fried:"Fry the eggs in oil over medium heat for 3 minutes until the whites are set.",poached:"Poach the eggs in barely simmering water with a splash of vinegar for 3 minutes.",omelette:"Beat the eggs, pour into a hot buttered pan, cook 3 minutes, then fold."}[st];
  A("eggs",2*n,"pcs",has(/\beggs?\b/));gf?A("potatoes",150*n,"g",has(/potato/)):A("bread",60*n,"g",has(/bread/));A(vnm(v),v[3]*n/2,"g",find(V,it).includes(v));A(sp[0],sp[1]*n,sp[2],false);
  o.title=cap(st)+" eggs with "+vnm(v);o.min=15;o.steps=[gf?"Dice the potatoes and pan-fry for 12 minutes until crisp.":"Toast the bread until golden.",`Sauté the ${vnm(v)} for ${v[4]} minutes.`,cook,`Serve on the ${gf?"potatoes":"toast"} and season with ${sp[0]}.`]}
 else if(t==="dippers"){const v=vrow(["carrot","cucumber","pepper"]),d=nd||Math.random()<.5?"hummus":"yogurt dip";A(vnm(v),150*n,"g",find(V,it).includes(v));
  d==="hummus"?A("hummus",60*n,"g",has(/hummus/)):(A(yog,100*n,"g",has(/yogh?urt/)),A("lemon juice",5*n,"ml",false),A("salt",1,"g"));
  o.title=cap(vnm(v))+" sticks with "+d;o.min=10;o.steps=[`Cut the ${vnm(v)} into sticks.`,d==="hummus"?"Serve with the hummus.":`Season the ${yog} with salt and lemon juice, then dip.`]}
 else if(t==="bruschetta"){A("bread",40*n,"g",has(/bread/));A("tomatoes",100*n,"g",has(/tomato/));A("garlic clove",1,"pcs",false);A("olive oil",5*n,"ml",false);A("basil",2*n,"g",false);
  o.title="Tomato bruschetta";o.min=10;o.steps=["Dice the tomatoes and mix with oil, basil and a pinch of salt.","Toast the bread until golden and rub with the cut garlic clove.","Spoon the tomatoes on top and serve at once."]}
 else if(t==="chickpeas"){const sp=cu.sp.slice(0,2);A("canned chickpeas (drained)",120*n,"g",has(/chickpea/));A("oil",5*n,"ml",false);sp.forEach(x=>A(x[0],x[1]*n,x[2],false));A("salt",1,"g");
  o.title=cuN+" roasted chickpeas";o.min=30;o.steps=["Heat the oven to 200 °C.","Drain, rinse and pat the chickpeas very dry.",`Toss with the oil, ${sp.map(x=>x[0]).join(", ")} and salt.`,"Roast 25 minutes, shaking the tray halfway, until crisp."]}
 else if(t==="fruitnuts"){A(f,150*n,"g",!!fr);A(nut,20*n,"g",false);o.title=cap(f)+" with "+nut;o.min=5;o.steps=[`Slice the ${f}.`,`Serve with a handful of ${nut}.`]}
 else if(t==="crumble"){const b=fr||rnd(["apples","pears","plums"]);A(b,200*n,"g",!!fr);A(oats,25*n,"g",has(/oat/));A(fat,10*n,"g",false);A(sw,10*n,"g",false);A("cinnamon",n,"g",false);
  o.title="Baked "+b+" crumble";o.min=35;o.steps=["Heat the oven to 180 °C.",`Slice the ${b} into a dish and toss with cinnamon.`,`Rub the ${oats} with the ${fat} and ${sw}, scatter on top and bake 25 minutes.`]}
 else if(t==="icecream"){A("frozen banana",150*n,"g",has(/banana/));A(milk,15*n,"ml",has(/milk/));nn?A("cocoa",5*n,"g",false):A("peanut butter",10*n,"g",false);
  o.title="Banana ice cream";o.min=5;o.steps=["Blend the frozen banana chunks with the "+milk+" for 2–3 minutes, scraping down the sides.","Blend in the "+(nn?"cocoa":"peanut butter")+" and serve immediately."]}
 else{A("chia seeds",25*n,"g",has(/chia/));A(milk,150*n,"ml",has(/milk/));A(sw,10*n,"g",false);A(f,60*n,"g",!!fr);
  o.title=cap(f)+" chia pudding";o.min=5;o.steps=["Stir the chia, "+milk+" and "+sw+" together; rest 10 minutes and stir again.","Refrigerate at least 4 hours or overnight.","Top with "+f+"."]}
 return{title:o.title,desc:`Quantities are for ${n} ${n>1?"people":"person"}.${t==="chia"?" Plus 4 hours chilling.":""}`,min:o.min,ing,steps:o.steps};
};

// ---- approximate nutrition (per 100 g or ml; optional grams per piece) ----
const NUT=[["oat milk|plant milk",45,1],["vinegar|mirin|soy|tamari|aminos|stock|juice",10,1],["coconut milk",190,2],["canned tomato|ajvar",30,1.2],["tomato",18,.9,120],["sweet potato",90,2],["potato",77,2],
["broccoli|cauliflower|spinach|kale|chard|cabbage|cucumber|lettuce|zucchini|aubergine|asparagus|green bean|pepper|pumpkin|celery|fennel|beetroot|choi|brussels|rocket|arugula",28,2],["\\bpeas|corn",80,5],["carrot",41,.9,80],["onion|shallot|leek",40,1,100],["mushroom",22,3],
["chicken|turkey|duck",165,31],["\\bham|pork",190,25],["beef|steak|mince",200,26],["lamb",230,25],["salmon|trout",208,20],["cod|fish|haddock|hake|tuna",90,20],["prawn|shrimp",85,18],["tofu",120,13],["tempeh",190,19],["halloumi|paneer",320,22],
["\\beggs?\\b",145,12,50],["chickpea",140,8],["lentil",115,9],["bean",120,8],["sausage|chorizo|bacon",300,14],["gnocchi",150,4],["flour",360,10],["rice|couscous|bulgur|quinoa|pasta|spaghetti|noodle|barley|polenta|orzo|macaroni",360,11],["bread|pita|tortilla|naan|flatbread",265,9,60],["oat",375,13],
["hummus",230,8],["yogurt",60,4],["milk|cream",55,3],["feta|parmesan|cheese|cheddar",300,20],["butter",717,1],["oil",884,0],["walnut|almond|peanut|nut|seed|chia|tahini",580,20],["banana",89,1,120],["avocado",160,2,150],["apple",52,.3,180],
["berr|peach|plum|pear|mango|orange",55,.8,150],["honey|sugar|syrup|jam",310,0],["cocoa",230,20],["garlic",4,.2,4],["lemon|lime",20,.4,60]];
G.nutri=function(ing,n){let k=0,p=0;ing.forEach(i=>{const e=NUT.find(x=>new RegExp(x[0]).test(i.name.toLowerCase()));if(!e||i.a==null)return;const g=i.u==="pcs"?i.a*(e[3]||80):i.a;k+=g*e[1]/100;p+=g*e[2]/100});return{kcal:Math.round(k/n/10)*10,p:Math.round(p/n)}};

// ---- "Only what I have": builds from fridge items + optional pantry basics, never invents ingredients ----
G.pantry=/^salt$|black pepper|white pepper|oil|butter|garlic|^onions?$|^water|sugar|honey|maple|flour|vinegar|soy sauce|tamari|aminos|cinnamon|cumin|paprika|oregano|thyme|turmeric|garam|curry powder|chilli|allspice|caraway|marjoram|bay leaf|ground|dried|baking powder|sumac|vanilla|stock|mustard|cocoa/;
const EX=[["feta|cheese|parmesan|cheddar|mozzarella","cheese",25,"g","Crumble or grate the cheese over the top.","dairy"],["olive","olives",20,"g","Scatter the olives over the top.",""],["walnut|almond|peanut|cashew|seeds?","nuts or seeds",15,"g","Sprinkle with the nuts or seeds.","nuts"],["avocado","avocado",.5,"pcs","Slice the avocado on top.",""],["yogurt|sour cream","yogurt",50,"g","Serve with a spoon of yogurt.","dairy"],["lemon|lime","lemon juice",10,"ml","Finish with a squeeze of lemon.",""]];
G.makeFridge=function(it,n,cuName,diet,basic){
 diet=diet||{};
 const bp=new Set([...(diet.veg||diet.vegan?["chicken","chickenthigh","pork","beef","lamb","duck","salmon","cod","prawns","tuna","sausage","bacon"]:[]),...(diet.vegan||diet.noegg?["egg"]:[]),...(diet.vegan||diet.dairy?["halloumi","paneer"]:[]),...(diet.nofish?["salmon","cod","prawns","tuna"]:[]),...(diet.nosoy?["tofu","tempeh"]:[])]),bc=new Set(diet.gf?["pasta","noodles","couscous","bulgur","bread","barley","gnocchi"]:[]);
 const hp=find(P.filter(x=>!bp.has(x[0])),it),hc=find(C.filter(x=>!bc.has(x[0])),it),hv=find(V,it);
 const ex=EX.filter(e=>it.some(w=>new RegExp(e[0]).test(w))&&!(e[5]==="dairy"&&(diet.vegan||diet.dairy))&&!(e[5]==="nuts"&&diet.nuts));
 const p=hp.length?rnd(hp):null,c=hc.length?rnd(hc):null,vs=shuf(hv).slice(0,3);
 if((p?1:0)+(c?1:0)+vs.length<2)return null;
 const av=nm=>{nm=nm.toLowerCase();return(basic&&G.pantry.test(nm))||it.some(w=>nm.includes(w)||w.includes(nm.split(" ")[0]))};
 const mapN=a=>[diet.nosoy?a[0].replace("soy sauce","coconut aminos"):diet.gf?a[0].replace("soy sauce","tamari"):a[0],a[1],a[2]];
 const cuOf=k=>{const c0=G.cuisines[k],sa=c0.sauce.filter(a=>!((diet.vegan||diet.dairy)&&/yogurt|cream/.test(a[0])||diet.vegan&&/honey/.test(a[0]))).map(mapN);
  return{...c0,sauce:sa.filter(a=>av(a[0])),ar:c0.ar.filter(a=>av(a[0])),sp:c0.sp.filter(a=>av(a[0])),fat:(diet.vegan||diet.dairy)&&c0.fat==="butter"?"oil":c0.fat}};
 const sc=k=>{const x=cuOf(k);return x.sauce.length+x.ar.length+x.sp.length+Math.random()*1.5};
 const cuN=G.cuisines[cuName]?cuName:Object.keys(G.cuisines).map(k=>[k,sc(k)]).sort((a,b)=>b[1]-a[1])[0][0],cu=cuOf(cuN);
 const tn=(x,d)=>it.find(w=>new RegExp(x).test(w))||d;
 const pn=p&&tn(p[2],p[1]),cb=c&&tn(c[2],c[1]),vn=vs.map(v=>tn(v[2],v[1])),ing=[];
 const A=(name,a,u)=>ing.push({name,a,u,txt:fmt(a,u),have:true});
 const o=fmt(10*n,"ml"),ar=cu.ar.map(a=>a[0]).join(", "),sp=cu.sp.map(a=>a[0]).join(", "),sau=cu.sauce.map(a=>a[0]).join(", ");
 const byVeg=vs.map((v,i)=>({v,name:vn[i]})).sort((a,b)=>b.v[4]-a.v[4]);
 p&&A(pn,p[3]*n,p[6]);c&&A(cb,c[3]*n,"g");vs.forEach((v,i)=>A(vn[i],v[3]*n/vs.length,"g"));
 cu.ar.forEach(a=>A(a[0],a[1]*n,a[2]));cu.sp.forEach(a=>A(a[0],a[1]*n,a[2]));cu.sauce.forEach(a=>A(a[0],a[1]*n,a[2]));
 const exN=ex.map(e=>tn(e[0],e[1]));ex.forEach((e,i)=>A(exN[i],e[2]*n,e[3]));
 A(cu.fat,10*n,"ml");A("salt",2*n,"g");
 const vR=vs.filter(v=>v[5]),root=c&&(c[0]==="potato"||c[0]==="sweet"),pool=["pan","pot"];
 if((vR.length||root)&&!(p&&p[0]==="egg"))pool.push("tray");
 const tpl=rnd(pool),S=[],oil=`Heat ${o} ${cu.fat} in a wide pan over medium-high heat${ar?` and fry the ${ar} for 1 minute`:""}.`;
 const serve=c?`Serve over the ${cb}.`:"Serve hot.",fin=[...ex.map(e=>e[4]),serve];
 const spS=sp&&`Stir in the ${sp} for 30 seconds.`,saS=sau&&`Add the ${sau} and toss for 1–2 minutes until glossy.`;
 let label,min;
 if(tpl==="pan"){label="stir-fry";
  S.push(c&&carbCook(c,n),oil,p&&pcook(p,pn),...byVeg.map(x=>x.v[4]?`Add the ${x.name} (sliced) and stir-fry for ${x.v[4]} minutes.`:`Slice the ${x.name} and add at the end, raw.`),spS,saS,"Season with salt and pepper.",...fin);
  min=10+(c?c[5]:0)+(p?p[4]:0)+byVeg.reduce((t,x)=>t+x.v[4],0);
 }else if(tpl==="tray"){label="traybake";
  const items=[];p&&p[7]&&items.push({name:pn,m:p[7]});vs.forEach((v,i)=>items.push({name:vn[i],m:v[5]||5}));
  if(root)items.push({name:cb,m:c[0]==="potato"?35:30});else if(c)S.push(carbCook(c,n));
  items.sort((a,b)=>b.m-a.m);const T=items[0].m;min=T+15;
  S.push(`Heat the oven to 200 °C. Chop everything into similar-sized pieces and toss with ${o} ${cu.fat}${sp?`, the ${sp}`:""}${ar?`, the ${ar}`:""} and salt.`,
   `Spread the ${items.filter(x=>x.m===T).map(x=>x.name).join(" and ")} on a tray and roast for ${T} minutes.`);
  items.filter(x=>x.m<T).forEach(x=>S.push(`After ${T-x.m} minutes, add the ${x.name} to the tray.`));
  if(p)S.push(`Check the ${pn} is cooked ${p[5]}.`);S.push(...fin);
 }else{label=["Indian","Thai","Caribbean"].includes(cuN)?"curry":"stew";A("water",200*n,"ml");min=40;
  S.push(c&&carbCook(c,n),oil.replace("wide pan","wide pot").replace("for 1 minute","for 5 minutes"),spS&&`Stir in the ${sp} for 1 minute.`,p&&p[0]!=="egg"&&`Add the ${pn}, cut into chunks, and brown for ${Math.min(p[4],5)} minutes.`,
   `Add ${sau?`the ${sau}, `:""}${fmt(200*n,"ml")} water (or stock)${vs.length?` and the ${vn.join(" and ")}`:""}. Bring to the boil, then simmer gently for 20 minutes.`,
   p&&(p[0]==="egg"?"Make wells, crack in the eggs, cover and cook 6–8 minutes until set.":`Check the ${pn} is cooked ${p[5]}.`),"Season with salt and pepper.",...fin);}
 const parts=[pn,cb,...vn].filter(Boolean),list=parts.length>1?parts.slice(0,-1).join(", ")+" & "+parts[parts.length-1]:parts[0];
 const used=ing.map(i=>i.name.toLowerCase()),unused=it.filter(w=>!used.some(u=>u.includes(w)||w.includes(u.split(" ")[0])));
 return{title:`${cuN} ${label} with ${list}`,desc:`Made only from your fridge${basic?" plus pantry basics":""}. ${cuN} flavours.`,min:Math.round(min),ing,steps:S.filter(Boolean),unused};
};
})();
