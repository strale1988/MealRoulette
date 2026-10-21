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
["chicken","chicken breast","chicken|turkey",150,7,"until no pink remains (74 °C inside)","g",30],
["pork","pork loin","pork|\\bham",150,8,"until cooked through (63 °C inside; rest 3 minutes)","g",30],
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
["sausage","sausages","sausage|chorizo",120,10,"until browned and cooked through (71 °C)","g",30],
["chickenthigh","chicken thighs","thigh|drumstick",180,9,"until golden and 74 °C inside","g",35],
["duck","duck breast","duck",140,8,"until golden (74 °C inside)","g",25],
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
const pcook=(p,pn)=>p[0]==="egg"?"Beat the eggs with a pinch of salt and scramble over medium heat for 2–3 minutes.":`Pat the ${pn} dry and add it in bite-size pieces to the hot pan in a single layer (in batches if needed). Cook ${p[4]} minutes, turning, ${p[5]}.`;

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
["hummus",230,8],["yogurt",60,4],["milk|cream",55,3],["feta|parmesan|cheese|cheddar|mozzarella",300,20],["butter",717,1],["oil",884,0],["walnut|almond|peanut|nut|seed|chia|tahini",580,20],["banana",89,1,120],["avocado",160,2,150],["apple",52,.3,180],
["berr|peach|plum|pear|mango|orange",55,.8,150],["honey|sugar|syrup|jam",310,0],["cocoa",230,20],["garlic",4,.2,4],["lemon|lime",20,.4,60]];
G.nutri=function(ing,n){let k=0,p=0;ing.forEach(i=>{const e=NUT.find(x=>new RegExp(x[0]).test(i.name.toLowerCase()));if(!e||i.a==null)return;const g=i.u==="pcs"?i.a*(e[3]||80):i.a;k+=g*e[1]/100;p+=g*e[2]/100});return{kcal:Math.round(k/n/10)*10,p:Math.round(p/n)}};

// ---- "Only what I have": builds from fridge items + optional pantry basics, never invents ingredients ----
G.pantry=/^salt$|black pepper|white pepper|oil|butter|garlic|^onions?$|^water|sugar|honey|maple|flour|vinegar|soy sauce|tamari|aminos|cinnamon|cumin|paprika|oregano|thyme|turmeric|garam|curry powder|chilli|allspice|caraway|marjoram|bay leaf|ground|dried|baking powder|sumac|vanilla|stock|mustard|cocoa/;
const EX=[["feta|cheese|parmesan|cheddar|mozzarella","cheese",25,"g","Crumble or grate the cheese over the top.","dairy"],["\\bolives?\\b(?! oil)","olives",20,"g","Scatter the olives over the top.",""],["walnut|almond|peanut|cashew|seeds?","nuts or seeds",15,"g","Sprinkle with the nuts or seeds.","nuts"],["avocado","avocado",.5,"pcs","Slice the avocado on top.",""],["yogurt|sour cream","yogurt",50,"g","Serve with a spoon of yogurt.","dairy"],["lemon|lime","lemon juice",10,"ml","Finish with a squeeze of lemon.",""]];

// ---- taste rules (researched: USDA safe temperatures; spice blooming; veg cooked together need similar times) ----
G.MEAT=["chicken","chickenthigh","pork","beef","lamb","duck","salmon","cod","prawns","tuna","sausage","bacon"];
// per cuisine: [proteins that don't suit it, carbs that don't suit it]
G.R={Italian:["tofu tempeh paneer","noodles couscous"],Mexican:["tofu tempeh paneer duck","pasta noodles couscous polenta gnocchi barley bulgur"],Indian:["pork bacon sausage tuna duck","pasta noodles couscous polenta gnocchi barley bulgur"],
Thai:["lamb paneer bacon sausage","pasta couscous polenta gnocchi barley bulgur bread potato sweet"],Chinese:["lamb paneer bacon sausage tuna","pasta couscous polenta gnocchi barley bulgur bread sweet"],
Japanese:["lamb paneer bacon sausage duck","pasta couscous polenta gnocchi barley bulgur bread"],Korean:["lamb paneer bacon sausage duck tuna","pasta couscous polenta gnocchi barley bulgur bread"],
Vietnamese:["lamb paneer bacon sausage duck tuna","pasta couscous polenta gnocchi barley bulgur bread potato sweet"],Indonesian:["pork bacon sausage paneer duck tuna","pasta couscous polenta gnocchi barley bulgur bread"],
Greek:["tofu tempeh paneer duck","noodles polenta gnocchi barley couscous"],"Middle Eastern":["pork bacon sausage tofu tempeh paneer duck","noodles polenta gnocchi barley pasta"],
Turkish:["pork bacon sausage tofu tempeh paneer duck","noodles polenta gnocchi barley"],Persian:["pork bacon sausage tofu tempeh paneer duck","pasta noodles polenta gnocchi barley couscous"],
French:["tofu tempeh paneer","noodles couscous"],Spanish:["tofu tempeh paneer duck","noodles couscous polenta gnocchi barley bulgur"],Portuguese:["tofu tempeh paneer duck","noodles couscous polenta gnocchi barley bulgur"],
Balkan:["tofu tempeh paneer duck tuna","noodles couscous gnocchi barley"],Hungarian:["tofu tempeh paneer duck tuna","noodles couscous polenta bulgur"],German:["tofu tempeh paneer prawns tuna","noodles couscous bulgur polenta"],
Polish:["tofu tempeh paneer prawns tuna","noodles couscous bulgur polenta"],Cajun:["tofu tempeh paneer duck tuna lamb","noodles couscous gnocchi barley bulgur polenta"],Caribbean:["paneer duck tuna","pasta noodles couscous polenta gnocchi barley bulgur"],
Moroccan:["pork bacon sausage tofu tempeh paneer duck","pasta noodles polenta gnocchi barley"],Ethiopian:["pork bacon sausage tofu tempeh paneer duck tuna","pasta noodles couscous polenta gnocchi barley bulgur quinoa"],Peruvian:["tofu tempeh paneer duck lamb","couscous polenta gnocchi barley bulgur"]};
// vegetables that only suit certain cuisines (VR) or clash with some (VX)
G.VR={beetroot:"Polish|German|Hungarian|French|Balkan|Greek|Turkish|Persian|Italian|Ethiopian|Moroccan|Middle Eastern",brussels:"German|Polish|French|Hungarian|Italian|Balkan|Spanish|Portuguese",fennel:"Italian|French|Greek|Spanish|Portuguese|Moroccan|Turkish",pakchoi:"Chinese|Japanese|Korean|Thai|Vietnamese|Indonesian",rocket:"Italian|French|Greek|Spanish|Portuguese|Turkish|Middle Eastern|Moroccan|Balkan"};
G.VX={celery:"Mexican|Indian|Thai|Japanese|Korean|Vietnamese|Indonesian|Peruvian"};
// fresh garnishes, so every "finish with" ingredient is really on the list
G.gar={Italian:"basil 3 g|parmesan 15 g",Mexican:"coriander 3 g|lime juice 10 ml",Indian:"coriander 3 g|plain yogurt 20 g",Thai:"coriander 3 g|lime juice 10 ml",Chinese:"sesame seeds 3 g|spring onion 10 g",Japanese:"sesame seeds 3 g|spring onion 10 g",Korean:"sesame seeds 3 g|spring onion 10 g",Vietnamese:"mint 3 g|coriander 3 g|lime juice 10 ml",Indonesian:"spring onion 10 g|lime juice 10 ml",Greek:"feta 25 g|lemon juice 10 ml","Middle Eastern":"parsley 5 g|tahini 10 g",Turkish:"parsley 5 g|plain yogurt 20 g",Persian:"parsley 5 g|mint 3 g",French:"parsley 3 g|butter 5 g",Spanish:"parsley 3 g",Portuguese:"parsley 3 g|lemon juice 10 ml",Balkan:"parsley 3 g|sour cream 20 g",Hungarian:"sour cream 25 g|parsley 3 g",German:"parsley 3 g",Polish:"dill 3 g|sour cream 25 g",Cajun:"spring onion 10 g",Caribbean:"lime juice 10 ml",Moroccan:"coriander 3 g|parsley 3 g|olives 20 g",Ethiopian:"parsley 3 g",Peruvian:"coriander 3 g|lime juice 10 ml"};
const EGGSIM=["Middle Eastern","Turkish","Moroccan","Italian","Spanish","Portuguese","Mexican","Greek","Balkan","Ethiopian","Indian","Persian"];
const DEL={salmon:6,cod:6,prawns:3,tuna:2};
const ASIAN=["Chinese","Japanese","Korean","Thai","Vietnamese","Indonesian"],BAKEOK=["Italian","Greek","French","Spanish","Portuguese","Balkan","Hungarian","German","Polish","Mexican","Turkish"]; // delicate proteins go in late

G.cook=function(it,n,cuName,diet,o){
 diet=diet||{};o=o||{};const strict=!!o.strict,basic=!!o.basic;let nd=diet.vegan||diet.dairy;
 const bp=new Set([...(diet.veg||diet.vegan?G.MEAT:[]),...(diet.vegan||diet.noegg?["egg"]:[]),...(nd?["halloumi","paneer"]:[]),...(diet.nofish?["salmon","cod","prawns","tuna"]:[]),...(diet.nosoy?["tofu","tempeh"]:[]),...(diet.halal||diet.kosher||diet.nopork?["pork","bacon","sausage"]:[]),...(diet.kosher||diet.noshell?["prawns"]:[]),...(diet.pesc?["chicken","chickenthigh","pork","beef","lamb","duck","sausage","bacon"]:[]),...(diet.avoidP||[])]),bc=new Set([...(diet.gf?["pasta","noodles","couscous","bulgur","bread","barley","gnocchi"]:[]),...(diet.avoidC||[])]);
 const PA=P.filter(x=>!bp.has(x[0])),CA=C.filter(x=>!bc.has(x[0]));
 const inL=(s,k)=>(" "+s+" ").includes(" "+k+" "),inP=(s,k)=>("|"+s+"|").includes("|"+k+"|");
 const okP=(cu,x)=>!inL(G.R[cu][0],x[0]),okC=(cu,x)=>!inL(G.R[cu][1],x[0]),okV=(cu,v)=>(!G.VR[v[0]]||inP(G.VR[v[0]],cu))&&!(G.VX[v[0]]&&inP(G.VX[v[0]],cu));
 let hp=find(PA,it),hc=find(CA,it),hv=find(V,it);
 const ug=(diet.urgent||[]).map(x=>x.toLowerCase()),isU=r=>ug.some(w=>new RegExp(r[2]).test(w)),rndU=l=>{const u=l.filter(isU);return rnd(u.length?u:l)};
 const av=nm=>{nm=nm.toLowerCase();return(basic&&G.pantry.test(nm))||it.some(w=>nm.includes(w)||w.includes(nm.split(" ")[0]))};
 const mapN=a=>{let n=a[0];if(diet.nosoy)n=n.replace("soy sauce","coconut aminos");else if(diet.gf)n=n.replace("soy sauce","tamari");
  if(diet.halal&&n==="mirin")return["sugar",5,"g"];if(diet.halal&&n==="sherry vinegar")return["apple cider vinegar",5,"ml"];return[n,a[1],a[2]]};
 const garOf=k=>(G.gar[k]||"").split("|").filter(Boolean).map(x=>{const m=x.match(/^(.*) ([\d.]+) (g|ml)$/);return[m[1],+m[2],m[3]]}).filter(a=>!(nd&&/parmesan|feta|yogurt|cream|butter|cheese/.test(a[0])));
 const cuOf=k=>{const c0=G.cuisines[k],f=a=>!strict||av(a[0]),sa=c0.sauce.filter(a=>!((nd&&/yogurt|cream/.test(a[0]))||diet.vegan&&/honey/.test(a[0]))).map(mapN).filter(f);
  return{...c0,sauce:sa,ar:c0.ar.filter(f),sp:c0.sp.filter(f),gar:garOf(k).filter(f),fat:nd&&c0.fat==="butter"?"oil":c0.fat}};
 // choose the cuisine so that protein and carb actually suit it
 const p0=hp.length?rndU(hp):null,c0=hc.length?rndU(hc):null;let cuN=G.cuisines[cuName]?cuName:null;
 if(!cuN){const names=Object.keys(G.cuisines),good=names.filter(k=>(!p0||okP(k,p0))&&(!c0||okC(k,c0))),pool=good.length?good:names;
  cuN=strict?pool.map(k=>{const x=cuOf(k);return[k,x.sauce.length+x.ar.length+x.sp.length+Math.random()*1.5]}).sort((a,b)=>b[1]-a[1])[0][0]:rnd(pool)}
 let cu=cuOf(cuN);hp=hp.filter(x=>okP(cuN,x));hc=hc.filter(x=>okC(cuN,x));hv=hv.filter(v=>okV(cuN,v));
 const rp=PA.filter(x=>x[0]!=="egg"&&okP(cuN,x)),rc=CA.filter(x=>x[0]!=="bread"&&okC(cuN,x));
 const p=hp.length?rndU(hp):strict?null:rnd(rp.length?rp:PA.filter(x=>x[0]!=="egg"));let c=hc.length?rndU(hc):strict?null:rnd(rc.length?rc:CA.filter(x=>x[0]!=="bread"));
 // kosher: never mix meat and dairy, so a meat dish drops dairy sauces, garnishes and toppings
 if(diet.kosher&&!nd&&p&&["chicken","chickenthigh","beef","lamb","duck"].includes(p[0])){nd=true;cu=cuOf(cuN)}
 let vs=shuf(hv).sort((a,b)=>isU(b)-isU(a)).slice(0,strict?3:2);
 if(!vs.length&&!strict)vs=shuf(V.filter(v=>v[5]&&okV(cuN,v))).slice(0,2);
 // clash rules: one strong brassica per dish; beetroot stains and dominates, so only onion or carrot alongside
 const BRA=["broccoli","cauliflower","cabbage","brussels","kale"];let sb=false;vs=vs.filter(v=>{if(BRA.includes(v[0])){if(sb)return false;sb=true}return true});
 if(vs.some(v=>v[0]==="beetroot"))vs=vs.filter(v=>["beetroot","onion","carrot"].includes(v[0]));
 if(!vs.length&&!strict)vs=[rnd(V.filter(v=>v[5]&&!BRA.includes(v[0])&&v[0]!=="beetroot"&&okV(cuN,v)))];
 if(strict&&(p?1:0)+(c?1:0)+vs.length<2)return null;
 // which cooking styles make sense for these ingredients
 let root=c&&(c[0]==="potato"||c[0]==="sweet");const pk=p?p[0]:"",cookV=vs.filter(v=>v[4]),sideV=vs.filter(v=>!v[4]),vR=cookV.filter(v=>v[5]),legume=pk==="lentils"||pk==="beans";
 const pool=["bowl"];if(!legume)pool.push("pan");
 if(pk!=="tuna"&&pk!=="halloumi"&&(pk!=="egg"||EGGSIM.includes(cuN)))pool.push("pot");
 if((vR.length||root)&&!["egg","lentils","beans","tuna"].includes(pk))pool.push("tray");
 const BR=C.find(x=>x[0]==="bread");
 if(!ASIAN.includes(cuN)&&((c&&c[0]==="bread")||(!strict&&!bc.has("bread")&&okC(cuN,BR))))pool.push("wrap");
 if(cookV.length&&!(c&&["couscous","polenta","gnocchi"].includes(c[0])))pool.push("soup");
 if(BAKEOK.includes(cuN)&&c&&["pasta","potato","sweet","gnocchi","rice"].includes(c[0])&&!DEL[pk]&&pk!=="egg"&&pk!=="halloumi")pool.push("bake");
 const tpl=rnd(pool);if(tpl==="wrap"&&(!c||c[0]!=="bread")){c=BR;root=false}
 const tn=(x,d)=>it.find(w=>new RegExp(x).test(w))||d,pn=p&&tn(p[2],p[1]),cb=c&&tn(c[2],c[1]),vn=vs.map(v=>tn(v[2],v[1])),vnOf=v=>vn[vs.indexOf(v)];
 const sauc=tpl==="bowl"?cu.sauce.filter(a=>!/tomato/.test(a[0])):tpl==="tray"?cu.sauce.filter(a=>/yogurt|cream|lemon|lime|mustard|vinegar/.test(a[0])):tpl==="wrap"?cu.sauce.filter(a=>/yogurt|cream|lemon|lime|mustard|vinegar|ajvar/.test(a[0])):tpl==="bake"?cu.sauce.filter(a=>!/lemon|lime|vinegar|soy|tamari|aminos|mirin|sugar|honey/.test(a[0])):cu.sauce;
 const ex=strict?EX.filter(e=>it.some(w=>new RegExp(e[0]).test(w))&&!(e[5]==="dairy"&&nd)&&!(e[5]==="nuts"&&diet.nuts)):[];
 const ing=[],A=(name,a,u,h)=>{if(!ing.some(i=>i.name===name))ing.push({name,a,u,txt:fmt(a,u),have:strict||h!==false})};
 p&&A(pn,p[3]*n,p[6],hp.includes(p));c&&A(cb,c[3]*n,"g",hc.includes(c));vs.forEach(v=>A(vnOf(v),v[3]*n/vs.length,"g",hv.includes(v)));
 [...cu.ar,...cu.sp,...sauc,...cu.gar].forEach(a=>A(a[0],a[1]*n,a[2],hasW(it,a[0])));
 ex.forEach(e=>A(tn(e[0],e[1]),e[2]*n,e[3]));
 const lem=tpl==="bowl"&&(!strict||it.some(w=>/lemon|lime/.test(w)));if(lem)A("lemon juice",10*n,"ml",hasW(it,"lemon"));
 A(cu.fat,10*n,"ml",hasW(it,cu.fat));A("salt",2*n,"g",true);
 const o2=fmt(10*n,"ml"),J=a=>{const x=a.map(y=>y[0]);return x.length>1?x.slice(0,-1).join(", ")+" and "+x[x.length-1]:x[0]||""},ar=J(cu.ar),sp=J(cu.sp),sau=J(sauc),del=DEL[pk],asian=ASIAN.includes(cuN);
 const fin=[...ex.map(e=>e[4]),cu.gar.length?`Finish with ${J(cu.gar)}.`:""],serve=c?`Serve ${["potato","sweet","bread","gnocchi","barley"].includes(c[0])?"with":"over"} the ${cb}.`:"Serve hot.";
 const side=sideV.map(v=>`Slice the ${vnOf(v)} and serve fresh on the side.`);
 const late=pk==="egg"||del,S=[];let label,min;
 if(tpl==="pan"){label=asian?"stir-fry":"skillet";
  const bloom=[ar&&ar+" (finely chopped)",sp&&"the "+sp].filter(Boolean).join(" with "),oil=`Heat ${o2} ${cu.fat} in a wide pan over medium-high heat${bloom?` and fry the ${bloom} for 1 minute${sp?" to bloom the spices":""}`:""}.`;
  const vsteps=cookV.slice().sort((a,b)=>b[4]-a[4]).map(v=>`Add the ${vnOf(v)} (sliced) and cook ${v[4]} minutes${asian?", stirring":""}.`);
  const pc=!p?null:pk==="egg"?(cookV.length?"Push the vegetables aside, pour in the beaten eggs (with a pinch of salt) and scramble 2–3 minutes, then mix together.":"Beat the eggs with a pinch of salt and scramble over medium heat for 2–3 minutes."):del&&cookV.length?`Push the vegetables aside, add the ${pn} and cook ${p[4]} minutes, turning gently, ${p[5]}.`:`Pat the ${pn} dry and add it in bite-size pieces to the hot pan in a single layer (in batches if needed). Cook ${p[4]} minutes, turning, ${p[5]}.`;
  S.push(c&&carbCook(c,n),oil,...(late?[...vsteps,pc]:[pc,...vsteps]),sau&&`Add the ${sau} and toss for 1–2 minutes until glossy.`,"Season with salt and pepper.",...fin,serve,...side);
  min=10+Math.max(c?c[5]:0,(p?p[4]:0)+cookV.reduce((t,v)=>t+v[4],0));
 }else if(tpl==="tray"){label="traybake";const items=[];p&&p[7]&&items.push({name:pn,m:p[7]});cookV.forEach(v=>items.push({name:vnOf(v),m:v[5]||5}));
  if(root)items.push({name:cb,m:c[0]==="potato"?35:30});else if(c)S.push(carbCook(c,n));
  items.sort((a,b)=>b.m-a.m);const T=items[0].m;min=T+15;
  S.push(`Heat the oven to 200 °C. Chop everything into similar-sized pieces and toss with ${o2} ${cu.fat}${sp?`, the ${sp}`:""}${ar?`, the ${ar}`:""} and salt. Use a large tray so nothing is crowded.`,
   `Spread the ${items.filter(x=>x.m===T).map(x=>x.name).join(" and ")} on the tray and roast for ${T} minutes.`);
  items.filter(x=>x.m<T).forEach(x=>S.push(`After ${T-x.m} minutes, add the ${x.name} to the tray.`));
  S.push(p&&`Check the ${pn} is cooked ${p[5]}.`,p&&["pork","lamb","duck","chicken","chickenthigh","beef"].includes(pk)&&"Rest the meat for 3–5 minutes before serving.",sau&&`Drizzle with the ${sau}.`,...fin,c&&!root?serve:"Serve hot.",...side);
 }else if(tpl==="pot"){label=["Indian","Thai","Indonesian","Caribbean"].includes(cuN)?"curry":"stew";A("water",200*n,"ml",true);min=40;
  const hard=cookV.filter(v=>v[4]>3),soft=cookV.filter(v=>v[4]<=3);
  S.push(c&&carbCook(c,n),`Heat ${o2} ${cu.fat} in a wide pot over medium heat${ar?` and fry the ${ar} (finely chopped) for 5 minutes until soft`:""}.`,sp&&`Stir in the ${sp} for 1 minute.`,
   p&&!late&&`Add the ${pn}, cut into chunks, and brown for ${Math.min(p[4],5)} minutes.`,
   `Add ${sau?`the ${sau}, `:""}${fmt(200*n,"ml")} water (or stock)${hard.length?` and the ${hard.map(vnOf).join(" and ")}`:""}. Bring to the boil, then simmer gently for ${del?15:20} minutes.`,
   soft.length&&`Stir in the ${soft.map(vnOf).join(" and ")} and cook 3 more minutes.`,
   p&&(pk==="egg"?"Make wells, crack in the eggs, cover and cook 6–8 minutes until set.":del?`Add the ${pn} and simmer ${del} more minutes ${p[5]}.`:`Check the ${pn} is cooked ${p[5]}.`),"Season with salt and pepper.",...fin,serve,...side);
 }else if(tpl==="wrap"){label="wrap";const raw=vs.filter(v=>v[6]),hot=vs.filter(v=>!v[6]);min=15+(p?p[4]:0)+hot.reduce((t,v)=>t+v[4],0);
  S.push(p&&(pk==="egg"?"Beat the eggs with a pinch of salt and scramble over medium heat for 2–3 minutes.":pk==="tuna"?`Drain and flake the ${pn}.`:`Cut the ${pn} into strips, toss with ${sp?`the ${sp}`:"a pinch of salt"}, then fry in ${o2} ${cu.fat} over medium-high heat for ${p[4]} minutes, turning, ${p[5]}.`),
   ...hot.map(v=>`Fry the ${vnOf(v)} in the same pan for ${v[4]} minutes.`),raw.length&&`Slice the ${raw.map(vnOf).join(" and ")} thinly.`,sau&&`Stir the ${sau} together into a quick sauce.`,
   carbCook(c,n),`Fill the warm ${cb} with the ${[pn,...vn].filter(Boolean).join(", ")}${sau?" and the sauce":""}, then fold or roll.`,...fin,...side);
 }else if(tpl==="soup"){label="soup";A("water",300*n,"ml",true);min=40;
  const lateS=sauc.filter(a=>/yogurt|cream|lemon|lime|vinegar|mustard/.test(a[0])),earlyS=sauc.filter(a=>!lateS.includes(a)),inC=c&&["rice","pasta","noodles","potato","sweet","barley","bulgur","quinoa"].includes(c[0]);
  const hardS=cookV.filter(v=>v[4]>3),softS=cookV.filter(v=>v[4]<=3),inStart=inC&&(root||c[0]==="barley"),T=del?15:c&&c[0]==="barley"?25:20,blend=!p&&cookV.length>1;
  S.push(`Heat ${o2} ${cu.fat} in a large pot over medium heat${ar?` and fry the ${ar} (finely chopped) for 5 minutes until soft`:""}.`,sp&&`Stir in the ${sp} for 1 minute.`,
   p&&!late&&!legume&&`Add the ${pn}, cut into chunks, and brown for ${Math.min(p[4],5)} minutes.`,
   `Add ${earlyS.length?`the ${J(earlyS)}, `:""}${fmt(300*n,"ml")} water (or stock)${hardS.length?` and the ${hardS.map(vnOf).join(" and ")}`:""}${legume?` and the ${pn}`:""}${inStart?` and the ${cb}`:""}. Bring to the boil, then simmer gently for ${T} minutes.`,
   inC&&!inStart&&`For the last ${c[5]} minutes of simmering, add the ${cb}.`,softS.length&&`Stir in the ${softS.map(vnOf).join(" and ")} and cook 3 more minutes.`,
   p&&!legume&&(pk==="egg"?"Beat the eggs and stream into the simmering soup, stirring, for 1–2 minutes.":del?`Add the ${pn} and simmer ${del} more minutes ${p[5]}.`:`Check the ${pn} is cooked ${p[5]}.`),
   blend&&"Blend the soup until smooth.",lateS.length&&`Stir in the ${J(lateS)} off the heat.`,"Season with salt and pepper.",c&&!inC&&carbCook(c,n),...fin,c&&!inC?`Serve with the ${cb} on the side.`:"Serve hot.",...side);
 }else if(tpl==="bake"){label=["pasta","gnocchi"].includes(c[0])?"pasta bake":c[0]==="rice"?"rice bake":"gratin";min=55;A("water",100*n,"ml",true);
  const topS=strict?(ex.some(e=>e[1]==="cheese")?"Scatter the cheese over the top.":""):(nd?"":(A("cheese",25*n,"g",false),"Scatter the cheese over the top."));
  const cookC=c[0]==="pasta"?`Boil the pasta in well-salted water for ${Math.max(c[5]-2,5)} minutes (it finishes cooking in the oven), then drain.`:root?"Slice the potatoes thinly and boil for 6 minutes until just tender, then drain.":carbCook(c,n);
  S.push("Heat the oven to 200 °C.",cookC,`Heat ${o2} ${cu.fat} in a wide pan over medium heat${ar?` and fry the ${ar} (finely chopped) for 5 minutes`:""}.`,sp&&`Stir in the ${sp} for 1 minute.`,
   p&&`Add the ${pn}, cut into small pieces, and cook ${p[4]} minutes until browned.`,cookV.length&&`Add the ${cookV.map(vnOf).join(" and ")} and cook ${Math.max(...cookV.map(v=>v[4]))} minutes.`,
   `Stir in ${sau?`the ${sau} and `:""}${fmt(100*n,"ml")} water and simmer 5 minutes. Mix with the ${cb} and tip into a baking dish.`,topS,"Bake 20–25 minutes until bubbling and golden, then rest 5 minutes.",...fin.filter(x=>!/cheese/.test(x)),...side);
 }else{label="bowl";const raw=vs.filter(v=>v[6]),hot=vs.filter(v=>!v[6]);min=15+Math.max(c?c[5]:0,p?p[4]:0);
  S.push(c&&carbCook(c,n),p&&(pk==="egg"?"Boil the eggs for 9 minutes until the yolks are firm, cool in cold water, peel and halve.":`Rub the ${pn} with ${sp?`the ${sp}`:"a pinch of salt"}, then fry in ${o2} ${cu.fat} over medium-high heat for ${p[4]} minutes, turning, ${p[5]}.`),
   ...hot.map(v=>`Cook the ${vnOf(v)} in a little oil in a pan for ${v[4]} minutes.`),raw.length&&`Slice the ${raw.map(vnOf).join(" and ")} thinly.`,
   `Whisk ${o2} ${cu.fat}${lem?", the lemon juice":""}${sau?`, the ${sau}`:""} and a pinch of salt into a dressing.`,
   `Build the bowl with ${[cb,pn,...vn].filter(Boolean).join(", ")} and pour over the dressing.`,...fin);}
 const parts=[pn,cb,...vn].filter(Boolean),list=parts.length>1?parts.slice(0,-1).join(", ")+" & "+parts[parts.length-1]:parts[0];
 const used=ing.map(i=>i.name.toLowerCase()),unused=strict?it.filter(w=>!used.some(u=>u.includes(w)||w.includes(u.split(" ")[0]))):[];
 return{title:`${cuN} ${label} with ${list}`,desc:strict?`Made only from your fridge${basic?" plus pantry basics":""}. ${cuN} flavours.`:`Generated: ${cuN} flavours, ${label}. Quantities are for ${n} ${n>1?"people":"person"}.`,min:Math.round(min),ing,steps:S.filter(Boolean),unused,pk,ck:c?c[0]:""};
};
G.make=(it,n,cu,d)=>G.cook(it,n,cu,d,{});
G.makeFridge=(it,n,cu,d,basic)=>G.cook(it,n,cu,d,{strict:1,basic});
})();
