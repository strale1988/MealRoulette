/* kitchen.js — the recipe system.
   Load order: kitchen.js, ingredients.js, cookbook-*.js, engine.js
   - ingredients.js : the ONLY place that knows what an ingredient is (name, aisle, diet flags, nutrition, aliases)
   - cookbook-*.js  : recipes that point at ingredient ids; steps use {id} placeholders, so names can never drift
   - this file      : loader, rules (diets, fridge matching, substitutions, grams), and the validator
   Authoring guide: COOKBOOK.md.  Check everything with:  node tools/check.js */
(function(){
"use strict";
const K=window.KITCHEN={ING:{},recipes:[],problems:[]};

K.AISLE={veg:"Fruit & veg",meat:"Meat, fish & tofu",dairy:"Dairy & eggs",grain:"Grains, pasta & bread",can:"Canned & jarred",sauce:"Sauces & oils",nut:"Nuts & seeds",spice:"Spices & dried herbs",bake:"Baking",left:"Leftovers",other:"Other"};
K.ROLES=["protein","carb","veg","fruit","dairy","fat","flavour","herb","sauce","baking","nut","liquid"];
// names the generator (engine.js) has flavours for; a recipe's cuisine should be one of these
K.CUISINES=["Italian","Mexican","Indian","Thai","Chinese","Japanese","Korean","Greek","Middle Eastern","French","Spanish","Balkan","Moroccan","Vietnamese","Caribbean","Turkish","Hungarian","Indonesian","Peruvian","Cajun","Persian","German","Polish","Ethiopian","Portuguese"];
// meal keys used by the app; recipe files may use the friendly names on the left
K.MEAL={extra:"Extra",pantry:"Extra",drink:"Extra",component:"Extra",morning:"Breakfast",wake:"Breakfast",breakfast:"Breakfast",bite:"Snack",snack:"Snack",big:"Main",main:"Main",lunch:"Main",dinner:"Main",treat:"Dessert",dessert:"Dessert",sweet:"Dessert",bake:"Dessert",light:"Snack",side:"Snack",quick:"Main",fancy:"Main"};
// flags: meat fish shell dairy egg gluten nuts soy pork alcohol honey (diets) · pantry (assumed at home) · canned (ready to eat) · dried:N (needs N+ minutes) · sub:group (swappable)
const FLAGS=new Set("meat fish shell dairy egg gluten nuts soy pork alcohol honey pantry canned".split(" "));
const SWEET=["sugar","cocoa","vanilla","baking-powder","maple-syrup","honey"];
// Approximate cooked yields used only when a recipe explicitly opts in and the user selected that cooked leftover.
K.LEFTOVER_SWAPS={rice:{id:"left-rice",factor:3},pasta:{id:"left-pasta",factor:2.3},potatoes:{id:"left-potatoes",factor:1}};

const E=(who,msg)=>K.problems.push({lvl:"error",who,msg}),W=(who,msg)=>K.problems.push({lvl:"warn",who,msg});

/* ---------- text matching: "tomatoes", "Tomato" and "fresh tomato" all find the same ingredient ---------- */
const sing=w=>{if(w.length<4)return w;if(/(ch|sh|x|z|o)es$/.test(w))return w.slice(0,-2);if(/[^aeiou]ies$/.test(w))return w.slice(0,-3)+"y";if(/[^su]s$/.test(w))return w.slice(0,-1);return w};
const norm=t=>String(t).toLowerCase().replace(/[^a-z]+/g," ").trim().split(" ").filter(Boolean).map(sing).join(" ");
K.norm=norm;
const cache=new Map();
// ids the text refers to. The longest alias wins, so "canned tomatoes" is not "tomato" and "green beans" are not "beans".
K.match=text=>{
  const key=String(text);if(cache.has(key))return cache.get(key);
  const t=" "+norm(key)+" ";let best=0,out=[];
  for(const id in K.ING){let m=0;for(const a of K.ING[id].al)if(t.includes(" "+a+" ")){const l=a.split(" ").length*100+a.length;if(l>m)m=l}
    if(m){if(m>best){best=m;out=[id]}else if(m===best)out.push(id)}}
  cache.set(key,out);return out;
};
K.name=id=>K.ING[id]?K.ING[id].name:id;
// Fridge, staples and suggestion labels: things you count are plural ("mushrooms", "onions"), things you measure stay singular ("rice", "spinach").
// Recipes keep K.name (singular), because their method text says "the onion".
K.PLURAL={onion:"onions",shallot:"shallots","spring-onion":"spring onions","red-onion":"red onions",leek:"leeks",carrot:"carrots","red-pepper":"bell peppers",aubergine:"aubergines",avocado:"avocados",beetroot:"beetroots",cucumber:"cucumbers",plantain:"plantains","sweet-potato":"sweet potatoes",banana:"bananas",apple:"apples",pear:"pears",lemon:"lemons",lime:"limes",orange:"oranges",mango:"mangoes","bay-leaf":"bay leaves","chicken-breast":"chicken breasts",salmon:"salmon fillets","white-fish":"white fish fillets"};
K.label=id=>K.ING[id]?(K.PLURAL[id]||K.ING[id].name):id;
K.aisleOf=name=>{const id=K.match(name)[0];return id?K.AISLE[K.ING[id].aisle]:null};

/* ---------- Craft tools (the Craft tab) ----------
   Every tool is one row here. A recipe belongs to at most one tool: write craft:"burger" in the recipe, or leave it out and the tool is
   derived from the name when "words" matches (only the clear-cut tools have words; the rest need the explicit tag, so nothing is mislabelled).
   Recipes still go through K.add like every other recipe: same ingredients, diet flags, scaling, shopping list, fridge matching and search.
   The Craft page (index.html, UI table) only adds an icon, a blurb and a group; a tool added here alone still gets a working card. */
K.CRAFTS=[
 {id:"pizza",name:"Pizza night",words:/\b(pizzas?|calzone)\b/i},
 {id:"bread",name:"Rise and shine",words:/\b(bread|loaf|sourdough|focaccia|baguette|brioche|ciabatta|flatbreads?)\b/i,not:/pudding|crumb|sandwich|toast/i},
 {id:"pasta",name:"Pasta party",words:/\b(pasta|spaghetti|tagliatelle|linguine|fettuccine|lasagn[ae]|ravioli|gnocchi|penne|rigatoni)\b/i},
 {id:"dumpling",name:"Dumpling club",words:/\b(dumplings?|gyoza|pierogi|momos?|wontons?|empanadas?)\b/i},
 {id:"burger",name:"Burger bar",words:/\bburgers?\b/i},
 {id:"soup",name:"Souper bowl",words:/\b(soups?|broth|chowder|bisque|stock)\b/i},
 {id:"grill",name:"Fire it up",words:null},
 {id:"grain",name:"Grain train",words:/\b(rice|risotto|pilaf|pilau|couscous|quinoa|bulgur|polenta|congee|porridge)\b/i,not:/pudding|noodles?|paper|cake|crispy treats?/i},
 {id:"noodle",name:"Noodle house",words:/\b(noodles?|ramen|udon|soba|lo mein|chow mein|pad thai|stir[- ]fr(y|ied))\b/i,not:/soup|salad/i},
 {id:"sandwich",name:"Stack attack",words:/\b(sandwich(es)?|wraps?|toasties|toastie|panini|burritos?|quesadillas?)\b/i},
 {id:"salad",name:"Salad days",words:/\b(salads?|slaw|coleslaw)\b/i},
 {id:"eggs",name:"Breakfast club",words:/\b(omelettes?|omelets?|pancakes?|crepes?|waffles?|frittata|scrambled|shakshuka|french toast)\b/i},
 {id:"sauce",name:"Saucy business",words:null},
 {id:"ferm",name:"Fermentation station",words:null},
 {id:"dairy",name:"Cultured club",words:null},
 {id:"jam",name:"Jam session",words:null},
 {id:"spice",name:"Spice rack",words:null},
 {id:"bake",name:"Bake-off",words:null},
 {id:"frozen",name:"Scoop shop",words:/\b(ice cream|sorbet|granita|popsicles?|ice lollies|ice lolly)\b/i},
 {id:"drinks",name:"Happy hour",words:null},
 {id:"cure",name:"The curing cellar",words:null},
 {id:"sausage",name:"Snap and sizzle",words:null},
 {id:"rub",name:"Rub it in",words:null},
 {id:"bbq",name:"Low and slow",words:null},
 {id:"cheese",name:"Say cheese",words:null},
 {id:"starter",name:"Bubbling jars",words:null}
];
K.craftOf=name=>{const n=String(name||""),c=K.CRAFTS.find(c=>c.words&&c.words.test(n)&&!(c.not&&c.not.test(n)));return c?c.id:""};

/* ---------- ingredient catalog ---------- */
// row: [id, display name, aisle, role, kcal/100g, protein/100g, flags, aliases (comma), grams per piece, generator slots ("p:chicken,c:rice,v:carrot")]
K.ingredients=rows=>rows.forEach(r=>{
  const[id,name,aisle,role,kcal,p,flags,alias,gpp,gen]=r;
  if(K.ING[id])return E(id,"duplicate ingredient id");
  if(!K.AISLE[aisle])E(id,"unknown aisle '"+aisle+"'");
  if(!K.ROLES.includes(role))E(id,"unknown role '"+role+"'");
  const f=new Set(),e={id,name,aisle,role,kcal:kcal||0,p:p||0,f,gpp:gpp||0,sub:"",dried:0};
  (flags||"").split(/\s+/).filter(Boolean).forEach(t=>{const[k,v]=t.split(":");
    if(k==="sub")e.sub=v;else if(k==="dried"){e.dried=+v||1;f.add("dried")}else if(FLAGS.has(k))f.add(k);else E(id,"unknown flag '"+t+"'")});
  e.gen=(gen||"").split(",").filter(Boolean).map(x=>x.split(":"));
  e.al=[...new Set([id.replace(/-/g," "),name,...(alias||"").split(",")].map(norm).filter(Boolean))];
  K.ING[id]=e;cache.clear();
});

/* ---------- diets: derived from ingredient flags, never from word lists ---------- */
K.allowed=(r,d)=>{
  const f=r.flags,has=x=>f.has(x);d=d||{};
  if((d.veg||d.vegan)&&(has("meat")||has("fish")||has("shell")))return false;
  if(d.vegan&&(has("dairy")||has("egg")||has("honey")))return false;
  if(d.pesc&&has("meat"))return false;
  if(d.gf&&has("gluten"))return false;
  if(d.dairy&&has("dairy"))return false;
  if(d.nuts&&has("nuts"))return false;
  if(d.noegg&&has("egg"))return false;
  if(d.nofish&&(has("fish")||has("shell")))return false;
  if(d.nosoy&&has("soy"))return false;
  if(d.halal&&(has("pork")||has("alcohol")))return false;
  if(d.nopork&&has("pork"))return false;
  if(d.noshell&&has("shell"))return false;
  if(d.kosher&&(has("pork")||has("shell")||(has("meat")&&has("dairy"))))return false;
  return true;
};

/* ---------- cooked-leftover swaps ----------
   A recipe can use a cooked leftover instead of the raw ingredient: the raw item is replaced, the amount is adjusted for
   cooking yield, and the cooking clause is replaced by "warm it through". Explicit opt-ins (leftoverSwaps:["rice"]) cover
   grains and potatoes; proteins and roast veg are derived automatically from the catalog below. */
K.AUTO_SWAPS={"chicken-breast":["left-chicken",.75],"chicken-thigh":["left-chicken",.75],"beef-strips":["left-beef",.75],"beef-mince":["left-beef",.75],"pork":["left-pork",.75],"salmon":["left-fish",.8],"white-fish":["left-fish",.8]};
K.AUTO_WORD={"chicken-breast":/chicken|turkey/i,"chicken-thigh":/chicken|turkey/i,"beef-strips":/beef|steak|mince/i,"beef-mince":/beef|steak|mince/i,"pork":/\bpork\b/i,"salmon":/salmon|trout/i,"white-fish":/\bcod\b|\bfish\b|haddock|hake/i};
K.AUTO_VEG=["zucchini","aubergine","red-pepper","carrot","broccoli","cauliflower","pumpkin","mushrooms"];
const NO_AUTO=/marina[td]|brine|\bcure\b|poach|carcass|whole chicken|batter|dredge|bread(ed)?\b|crisp|bone/i;
const PCOOK=/\b(cook|fry|brown|sear|roast|grill|bake|simmer|poach|boil|saut[eé]|braise|steam|char|griddle|heat|until|minutes?)\b/i;
// {raw: {id, factor, auto}} for the leftovers in F (a Set of catalog ids) that this recipe can use
K.swapsFor=(r,F)=>{
  const out={};F=F||new Set();
  (r.leftoverSwaps||[]).forEach(raw=>{const rule=K.LEFTOVER_SWAPS[raw];if(rule&&F.has(rule.id))out[raw]={id:rule.id,factor:rule.factor,auto:false}});
  const taken=new Set(r.ids||r.ing.map(i=>i.id));
  // "clean": the cooking clause can be replaced outright. "note": the recipe is not safe to rewrite clause by clause, so the leftover
  // is renamed and a first step tells the cook to skip the cooking and just warm it through. Recipes that cook the meat by
  // marinating or roasting it are never swapped.
  const clauses=s=>s.split(/[;.]\s*/),strip=c=>c.replace(/\{[^}]*\}/g,"").replace(/\b(chicken|beef|pork|fish|vegetable) (stock|broth|bouillon|cube)/ig,"");
  const chk=(raw,clean)=>{
    if(r.steps.some(s=>NO_AUTO.test(s)&&(s.includes("{"+raw)||/marina[td]/i.test(s))))return false;
    if(!r.steps.some(s=>s.includes("{"+raw)))return false;
    const W=K.AUTO_WORD[raw];
    for(const s of r.steps){let seen=false;
      for(const c of clauses(s)){const t=c.includes("{"+raw),p=!!(W&&W.test(strip(c))),m=t||p;
        if(clean){
          if(!t&&p&&PCOOK.test(c))return false;
          if(t&&PCOOK.test(c)){const oth=[...c.matchAll(/\{([a-z0-9-]+)#?\}/g)].map(x=>x[1]).filter(x=>x!==raw);if(oth.some(x=>K.ING[x]&&["veg","protein","carb"].includes(K.ING[x].role)))return false}
          if(seen&&!m&&/\b(brown|cook|fry|sear|roast|grill|simmer)\b[^.;]*\b(them|it|everything)\b/i.test(c))return false;
          seen=t&&!PCOOK.test(c)}
        if(!m&&/\b(cooked through|fully cooked|until (golden|browned|charred)|until the (chicken|meat|fish|beef|pork))\b/i.test(c))return false}}
    return true};
  const modeOf=raw=>chk(raw,true)?"clean":chk(raw,false)?"note":null;
  const order=r.ing.slice().sort((x,y)=>y.a-x.a);
  for(const i of order){const A=K.AUTO_SWAPS[i.id];if(!A||!F.has(A[0])||taken.has(A[0]))continue;const mode=modeOf(i.id);if(!mode)continue;out[i.id]={id:A[0],factor:A[1],auto:true,mode};taken.add(A[0])}
  if(F.has("left-veg")&&!taken.has("left-veg")){const v=order.find(i=>K.AUTO_VEG.includes(i.id)&&modeOf(i.id));if(v)out[v.id]={id:"left-veg",factor:.9,auto:true,mode:modeOf(v.id)}}
  return out;
};

/* ---------- scaling, fridge matching, substitutions, step text ---------- */
// ctx: {fridge:Set(ids), basic:bool (pantry basics count as owned), urgent:Set(ids)}
K.resolve=(r,n,ctx)=>{
  ctx=ctx||{};const F=ctx.fridge||new Set(),U=ctx.urgent||new Set(),k=n/r.serv,sw={},taken=new Set(r.ing.map(i=>i.id)),cooked=K.swapsFor(r,F);
  // scaled amounts of what is replaced and what replaces it (pieces become grams when a cooked protein replaces a raw one)
  const sq={};Object.entries(cooked).forEach(([raw,rule])=>{const q=r.ing.find(x=>x.id===raw),orig=q.a*k,og=q.u==="pcs"&&rule.auto?orig*(K.ING[raw].gpp||150):orig;sq[raw]={orig,ou:q.u,a:og*rule.factor,u:q.u==="pcs"&&rule.auto?"g":q.u}});
  const ing=r.ing.map(i=>{
    let id=cooked[i.id]?cooked[i.id].id:i.id,e=K.ING[id];const pan=e.f.has("pantry");
    let have=F.has(id)||id==="water"||!!(ctx.basic&&pan);
    if(!cooked[i.id]&&!have&&e.sub){const alt=[...F].find(x=>x!==id&&K.ING[x].sub===e.sub&&!taken.has(x));if(alt){sw[i.id]=alt;taken.add(alt);id=alt;e=K.ING[id];have=true}}
    const s=sq[i.id],a=s?s.a:i.a*k,u=s?s.u:i.u;
    return{id,name:e.name,a,u,txt:fmt(a,u),have,pantry:pan,was:i.id,leftoverSwap:!!cooked[i.id],sec:i.sec||""};
  });
  const nm=id=>K.name(sw[id]||id);
  const steps=r.steps.map(rawStep=>{
    // Work clause by clause so a step that also prepares other ingredients keeps those parts.
    const parts=rawStep.split(/([;.]\s*)/);let prevRepl=false;
    for(let pi=0;pi<parts.length;pi+=2){
      let part=parts[pi],repl=false;
      for(const [raw,rule] of Object.entries(cooked)){
        const hasTok=new RegExp("\\{"+raw+"#?\\}").test(part);
        if(!hasTok)continue;
        const cooking=PCOOK.test(part);
        if(!rule.auto){
          if(cooking){
            if(raw==="pasta")part="Use the selected cooked pasta instead of dry pasta and reheat it in hot water until steaming hot";
            else if(raw==="rice")part="Use the selected cooked rice instead of dry rice and reheat it until steaming hot";
            else part="Use the selected cooked potatoes instead of raw potatoes and reheat them until hot";
          }else part=part.replace(new RegExp("\\{"+raw+"(#?)\\}","g"),(_,h)=>"{"+rule.id+h+"}");
        }else if(rule.mode==='note'){part=part.replace(new RegExp("\\{"+raw+"(#?)\\}","g"),(_,h)=>"{"+rule.id+h+"}")
        }else if(cooking){
          if(rule.done){part="";if(parts[pi+1]!==undefined)parts[pi+1]="";repl=true}
          else{rule.done=true;repl=true;
            const toks=[...part.matchAll(/\{([a-z0-9-]+)#?\}/g)].map(m=>m[1]).filter(x=>x!==raw),fat=toks.find(x=>K.ING[x]&&K.ING[x].role==="fat"),others=toks.filter(x=>x!==fat);
            const what="{"+rule.id+"}"+(rule.id==="left-veg"?"":" (shredded or sliced)");
            part=(fat?"Warm the "+what+" in the {"+fat+"}":"Add the "+what)+(others.length?" with the "+others.map(x=>"{"+x+"}").join(", "):"")+(fat?"":" and heat through")+" for 2–3 minutes, it is already cooked";
            if(pi>0&&/^;/.test(parts[pi-1]))part=part[0].toLowerCase()+part.slice(1)}
        }else if(hasTok)part=part.replace(new RegExp("\\{"+raw+"(#?)\\}","g"),(_,h)=>"{"+rule.id+h+"}");
      }
      if(!repl&&prevRepl&&/^\s*(remove|set aside|transfer|keep warm)\b/i.test(part)){part="";if(parts[pi+1]!==undefined)parts[pi+1]=""}
      prevRepl=repl;
      parts[pi]=part;
    }
    return parts.join("").replace(/\{([a-z0-9-]+)(#?)\}/g,(m,id,h)=>{
      const reverse=Object.entries(cooked).find(([raw,rule])=>rule.id===id),q=r.ing.find(x=>x.id===id)||(reverse&&r.ing.find(x=>x.id===reverse[0]));
      const name=nm(id);if(!h||!q)return name;
      const s=reverse&&sq[reverse[0]],amount=s?s.a:q.a*k,u=s?s.u:q.u;
      return(u==="pcs"?fmt(amount,"pcs").replace(" pcs",""):fmt(amount,"g"))+" "+name;
    }).replace(/\s+([.,;])/g,"$1").trim()
      // piece counts ("shape into 8 koftas", "make 4 wells") grow and shrink with the servings; times and sizes are left alone
      .replace(/\b(into|Make|make|makes|form|shape)\s+(\d+)(?![\d.,–\-\/])(\s+)(?!(?:g|ml|kg|l|cm|mm|min|minutes?|hours?|seconds?|°|%)\b)(?=[a-z])/g,(m,w,c,sp)=>Math.abs(k-1)<.01?m:w+" "+Math.max(2,Math.round(+c*k))+sp);
  }).filter(s=>s&&!/^[.;,\s]*$/.test(s));
  Object.entries(cooked).filter(([,x])=>x.mode==="note").forEach(([raw,x])=>steps.unshift("Your "+K.name(x.id).toLowerCase()+" is already cooked: wherever the method cooks the "+K.name(raw).toLowerCase()+", skip that and stir it in for the last 3–5 minutes so it only warms through."));
  const usedSwaps=Object.entries(cooked).map(([raw,rule])=>{const s=sq[raw];return{raw,id:rule.id,factor:rule.factor,auto:rule.auto,amount:s.a,original:s.orig,ou:s.ou}});
  const leftoverNote=usedSwaps.length?usedSwaps.map(x=>"Use about "+fmt(x.amount,"g")+" "+K.name(x.id).toLowerCase()+" instead of "+fmt(x.ou==="pcs"&&!x.auto?x.original:x.original*(x.ou==="pcs"?(K.ING[x.raw].gpp||150):1),"g")+" "+(x.raw==="potatoes"?"raw potatoes":x.raw==="rice"||x.raw==="pasta"?"dry "+x.raw:"raw "+K.name(x.raw).toLowerCase())+". "+(x.auto?"It is already cooked, so it only needs warming through; add it near the end if the dish simmers for long.":"The conversion is approximate; reheat until steaming hot.")).join(" "):"";
  return{ing,steps,hit:ing.filter(i=>i.have&&!i.pantry).length,urg:ing.filter(i=>i.have&&U.has(i.id)).length,leftoverNote,usedSwaps};
};
K.nutri=(ing,n)=>{let kc=0,p=0;ing.forEach(i=>{const e=K.ING[i.id];if(!e)return;const g=i.u==="pcs"?i.a*(e.gpp||80):i.a;kc+=g*e.kcal/100;p+=g*e.p/100});return{kcal:Math.round(kc/n/10)*10,p:Math.round(p/n)}};

/* ---------- recipes ---------- */
// {id, name, meal:"big"|"wake,bite"|..., cuisine?, time (min), serves, ing:[[id, grams | "2pc", section?]], steps:["... {id} ..."], note?, legacy?}
// section (optional third item, e.g. ["bread-flour",500,"Bun"]): the card groups ingredients under that heading; a section named like a thing the app can teach (Bun, Pickles, Pesto...) also gets one "make it" link. 2-23 letters, capital first.
K.add=list=>list.forEach(r=>{
  const who=r.id||"(no id)",bad0=K.problems.length;
  const P=m=>E(who,m),Wn=m=>W(who,m);
  if(!/^[a-z0-9-]+$/.test(who))P("id must be a lowercase slug");
  if(K.recipes.some(x=>x.id===r.id))P("duplicate recipe id");
  if(r.name&&K.recipes.some(x=>x.title.toLowerCase()===String(r.name).toLowerCase()))P("duplicate recipe name (same dish already in the cookbook)");
  if(!r.name)P("missing name");else if(/'S\b/.test(r.name))Wn("odd capital after apostrophe in name");
  const meals=[...new Set(String(r.meal||"").split(/[ ,]+/).filter(Boolean).map(m=>{if(!K.MEAL[m])P("unknown meal '"+m+"'");return K.MEAL[m]}).filter(Boolean))];
  if(!meals.length)P("no meal given");
  if(!(r.time>=5&&r.time<=240))Wn("time looks wrong: "+r.time);
  if(!(r.serves>=1))P("serves must be 1 or more");
  if(r.cuisine&&!K.CUISINES.includes(r.cuisine))Wn("cuisine '"+r.cuisine+"' has no generator flavours");
  if(r.craft&&!K.CRAFTS.some(c=>c.id===r.craft))P("unknown craft '"+r.craft+"' (add the tool to K.CRAFTS in kitchen.js)");
  const seen=new Set(),ing=(r.ing||[]).map(a=>{
    const id=a[0],v=a[1],pc=typeof v==="string"&&/^[\d.]+pc$/.test(v),amt=pc?parseFloat(v):v;
    let sec=typeof a[2]==="string"?a[2].trim():"";if(sec&&!/^[A-Z][A-Za-z ]{1,22}$/.test(sec)){Wn("section name '"+sec+"' must be 2-23 letters or spaces and start with a capital; ignored");sec=""}
    if(!K.ING[id])P("unknown ingredient '"+id+"' (add it to ingredients.js)");
    if(seen.has(id))P("ingredient listed twice: "+id);seen.add(id);
    if(!(amt>0))P("bad amount for "+id+": "+v+" (grams as a number, pieces as '2pc')");
    return{id,a:amt,u:pc?"pcs":"g",sec};
  });
  if(ing.length<2)P("needs at least 2 ingredients");
  const steps=r.steps||[];
  if(steps.length<2||steps.some(s=>typeof s!=="string"||!s.trim()))P("needs at least 2 non-empty steps");
  const all=steps.join(" "),used=new Set();
  for(const m of all.matchAll(/\{([a-z0-9-]+)#?\}/g)){used.add(m[1]);if(!seen.has(m[1]))P("step uses {"+m[1]+"} which is not in the ingredient list")}
  if(/[{}]/.test(all.replace(/\{[a-z0-9-]+#?\}/g,"")))P("stray brace in steps");
  const flags=new Set();ing.forEach(i=>{const e=K.ING[i.id];if(!e)return;e.f.forEach(x=>flags.add(x))});
  if(!r.legacy)ing.forEach(i=>{if(!used.has(i.id)&&!["salt","black-pepper","water"].includes(i.id))Wn("'"+i.id+"' is listed but no step mentions it")});
  // ready-to-eat and needs-cooking logic: the reason names in steps come from {id}
  const mins=s=>[...s.matchAll(/(\d+)(?:\s?[–-]\s?(\d+))?\s*min/g)].map(m=>+(m[2]||m[1]));
  const text=" "+norm(all.replace(/\{[^}]*\}/g,""))+" ";
  ing.forEach(i=>{const e=K.ING[i.id];if(!e)return;
    if(e.f.has("canned")||(e.f.has("dried")&&!r.legacy)){
      for(const a of e.al){
        const hit=r.legacy?(!/^(canned|tinned) /.test(a)&&new RegExp("(?<!canned )(?<!tinned )(?<![a-z])"+a+"(?![a-z])").test(text)):text.includes(" "+a+" ");
        if(hit){P("steps mention '"+a+"' in plain text; "+(r.legacy?"say 'canned "+a+"'":"write {"+i.id+"} so it reads '"+e.name+"'"));break}}}
    if(e.f.has("canned"))steps.forEach(s=>{if(s.includes("{"+i.id)&&/soak/i.test(s))P("{"+i.id+"} is canned, it needs no soaking")});
    if(e.dried)steps.forEach(s=>{if(s.includes("{"+i.id)&&/simmer|cook|boil/i.test(s)){const m=mins(s);if(m.length&&m.every(x=>x<e.dried))Wn("{"+i.id+"} is dried and needs "+e.dried+"+ minutes, but this step says "+m.join("/"))}});
  });
  // meal sanity: sweet things are treats, savoury things are not
  const sweetN=ing.filter(i=>SWEET.includes(i.id)).length,hasProt=ing.some(i=>K.ING[i.id]&&K.ING[i.id].role==="protein"&&!["eggs"].includes(i.id));
  if(meals.includes("Dessert")&&(flags.has("meat")||flags.has("fish")||flags.has("shell")))P("a treat contains meat or fish");
  if(meals.includes("Main")&&!hasProt&&sweetN>=3)P("looks like a dessert; tag it 'treat' or add real mains ingredients");
  if(meals.includes("Main")&&!ing.some(i=>K.ING[i.id]&&["protein","carb","veg"].includes(K.ING[i.id].role)))P("a big plate needs a protein, carb or veg");
  if(/vegan/i.test(r.name)&&!K.allowed({flags},{vegan:1}))P("named vegan but contains animal products");
  if(/vegetarian/i.test(r.name)&&!K.allowed({flags},{veg:1}))P("named vegetarian but contains meat or fish");
  if(K.problems.slice(bad0).some(p=>p.lvl==="error"))return; // broken recipes never reach the app
  const slots=[];ing.forEach(i=>K.ING[i.id].gen.forEach(g=>{if(!slots.some(s=>s[0]===g[0]&&s[1]===g[1]))slots.push(g)}));
  const leftoverSwaps=[...new Set(Array.isArray(r.leftoverSwaps)?r.leftoverSwaps:[])];
  leftoverSwaps.forEach(raw=>{if(!K.LEFTOVER_SWAPS[raw])P("unknown leftover substitution for '"+raw+"'");else if(!seen.has(raw))P("leftover substitution '"+raw+"' is not a recipe ingredient");});
  if(K.problems.slice(bad0).some(p=>p.lvl==="error"))return;
  K.recipes.push({id:r.id,title:r.name,meals,min:r.time,serv:r.serves,cuisine:r.cuisine||"",craft:r.craft||K.craftOf(r.name),note:r.note||"",leftoverSwaps,ing,steps,flags,slots,ids:ing.map(i=>i.id)});
});

K.report=()=>{const e=K.problems.filter(p=>p.lvl==="error"),w=K.problems.filter(p=>p.lvl==="warn");
  return{ingredients:Object.keys(K.ING).length,recipes:K.recipes.length,crafts:Object.fromEntries(K.CRAFTS.map(c=>[c.id,K.recipes.filter(r=>r.craft===c.id).length])),errors:e,warnings:w}};
})();

/* ---- shared recipe-card buttons: the same names and order on Cook, Pizza night and Ferment ----
   Save · Copy list · Share · Like · Not for me · Spin again (always last, pinned to the right, with the section's icon) */
(function(){
const ic=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
const rd=()=>{try{return JSON.parse(localStorage.getItem("mr-rate")||"null")||{}}catch(e){return{}}};
const wr=o=>{try{localStorage.setItem("mr-rate",JSON.stringify(o))}catch(e){}};
window.__ratings=rd;
// Like / Not for me for a card that has none yet. meta is stored with the rating (e.g. the ferment method), again() runs after Not for me.
window.__thumbs=function(row,key,meta,again){
  if(!row||row.querySelector(".thumb"))return;
  const cur=rd()[key],mk=(v,e,l)=>{const b=document.createElement("button");b.type="button";b.className="thumb";b.dataset.v=v;b.setAttribute("aria-pressed",String(!!cur&&cur.v===v));b.innerHTML=e+l;b.title=v>0?"Show me more like this":"Show me this less";return b};
  const up=mk(1,ic("thumbup"),"Like"),dn=mk(-1,ic("thumbdown"),"Not for me");row.append(up,dn);
  const rate=v=>{const o=rd(),on=!(o[key]&&o[key].v===v);if(on)o[key]=Object.assign({v,t:Date.now()},meta||{});else delete o[key];wr(o);
    up.setAttribute("aria-pressed",String(on&&v>0));dn.setAttribute("aria-pressed",String(on&&v<0));navigator.vibrate&&navigator.vibrate(12);
    if(on&&v<0&&again)setTimeout(()=>{if(document.body.contains(dn)&&dn.getAttribute("aria-pressed")==="true")again()},900)};
  up.onclick=()=>rate(1);dn.onclick=()=>rate(-1);
};
// put the buttons of one card in the standard order; icon = the section icon for Spin again (chef, pizza, ferm)
window.__tidyRow=function(row,icon){
  if(!row)return;
  const q=s=>row.querySelector(s),pick=[
    q("#cookgo,#pzcook,.pzgo,[data-a=start]"),q("#save,.pzsave"),q("#shop,.pzshop,[data-a=copy]"),q("#sharer,.pzsh,[data-a=share]"),
    q(".thumb[data-v='1'],.thumb:nth-of-type(1)"),q(".thumb[data-v='-1']")],
    again=q("#again,.pzagain,[data-a=rand]");
  const seen=new Set();[...pick].forEach(b=>{if(b&&!seen.has(b)){seen.add(b);row.append(b)}});
  [...row.children].forEach(b=>{if(!seen.has(b)&&b!==again)row.append(b)});
  if(again){again.innerHTML=ic(icon)+"Spin again";again.classList.add("spinagain");row.append(again)}
};
})();
