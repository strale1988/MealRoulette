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
 Balkan:{ar:[["garlic clove",1,"pcs"],["onion",60,"g"]],sp:[["sweet paprika",3,"g"]],sauce:[["ajvar",40,"g"],["sour cream",30,"g"]],fat:"oil",fin:"Serve with parsley and a spoon of sour cream."}
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
["sausage","sausages","sausage|chorizo",120,10,"until browned and cooked through (72 °C)","g",30]];

// carbs: key,name,regex,g dry/person,water ratio,minutes
const C=[
["rice","rice (dry)","rice",75,1.5,12],["pasta","pasta (dry)","pasta|spaghetti|penne|fusilli",100,0,10],
["noodles","noodles (dry)","noodle|ramen",80,0,4],["sweet","sweet potato","sweet potato",250,0,20],
["potato","potatoes","potato",250,0,18],["couscous","couscous (dry)","couscous",70,1,5],
["bulgur","bulgur (dry)","bulgur",70,1.5,12],["quinoa","quinoa (dry)","quinoa",70,2,15],
["bread","bread / pita","bread|pita|tortilla|naan",70,0,3]];

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
["pumpkin","pumpkin","pumpkin|squash",200,10,30,0],["leek","leek","leek",100,6,0,0],
["cucumber","cucumber","cucumber",150,0,0,1],["lettuce","lettuce","lettuce|salad",80,0,0,1]];

const find=(l,it)=>l.filter(x=>it.some(w=>new RegExp(x[2]).test(w)));
const hasW=(it,name)=>it.some(w=>w.includes(name.split(" ")[0].toLowerCase()));

function carbCook(c,n){
 const w=Math.round(c[3]*n*c[4]/5)*5,k=c[0];
 if(k==="couscous")return`Pour ${w} ml boiling water over the couscous, cover for 5 minutes, then fluff with a fork.`;
 if(c[4])return`Rinse the ${k}, then simmer with ${w} ml water and a pinch of salt, covered, on low for ${c[5]} minutes. Rest 5–10 minutes.`;
 if(k==="pasta"||k==="noodles")return`Boil in well-salted water (10 g salt per litre, 1 litre per 100 g) for ${c[5]} minutes, then drain.`;
 if(k==="bread")return"Warm or toast the bread until golden.";
 return`Cut into 3 cm chunks and boil in salted water for ${c[5]} minutes until a knife slides in easily.`;
}
const pcook=(p,pn)=>p[0]==="egg"?"Beat the eggs with a pinch of salt and scramble over medium heat for 2–3 minutes.":`Add the ${pn}, cut into bite-size pieces, and cook ${p[4]} minutes, turning, ${p[5]}.`;

G.make=function(it,n,cuName){
 if(!G.cuisines[cuName])cuName=rnd(Object.keys(G.cuisines));
 const cu=G.cuisines[cuName],hp=find(P,it),hc=find(C,it),hv=find(V,it);
 const p=hp.length?rnd(hp):rnd(P.filter(x=>x[0]!=="egg")),c=hc.length?rnd(hc):rnd(C.filter(x=>x[0]!=="bread"));
 let vs=shuf(hv).slice(0,2);
 const tpl=rnd(p[0]==="egg"?["stirfry","bowl","simmer"]:["stirfry","traybake","simmer","bowl"]);
 if(!vs.length)vs=shuf(V.filter(x=>x[5])).slice(0,2);
 if(tpl==="traybake"){vs=vs.filter(v=>v[5]);if(!vs.length)vs=[V.find(v=>v[0]==="carrot")]}
 const tn=(x,d)=>it.find(w=>new RegExp(x).test(w))||d;
 const pn=tn(p[2],p[1]),cn=tn(c[2],c[1]),vn=vs.map(v=>tn(v[2],v[1]));
 const ing=[],A=(name,a,u,have)=>ing.push({name,txt:fmt(a,u),have:have!==false});
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
})();
