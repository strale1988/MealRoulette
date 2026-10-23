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
K.MEAL={morning:"Breakfast",wake:"Breakfast",breakfast:"Breakfast",bite:"Snack",snack:"Snack",big:"Main",main:"Main",lunch:"Main",dinner:"Main",treat:"Dessert",dessert:"Dessert"};
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
K.aisleOf=name=>{const id=K.match(name)[0];return id?K.AISLE[K.ING[id].aisle]:null};

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

/* ---------- scaling, fridge matching, substitutions, step text ---------- */
// ctx: {fridge:Set(ids), basic:bool (pantry basics count as owned), urgent:Set(ids)}
K.resolve=(r,n,ctx)=>{
  ctx=ctx||{};const F=ctx.fridge||new Set(),U=ctx.urgent||new Set(),k=n/r.serv,sw={},taken=new Set(r.ing.map(i=>i.id)),cooked={};
  (r.leftoverSwaps||[]).forEach(raw=>{const rule=K.LEFTOVER_SWAPS[raw];if(rule&&F.has(rule.id))cooked[raw]={id:rule.id,factor:rule.factor}});
  const ing=r.ing.map(i=>{
    let id=cooked[i.id]?cooked[i.id].id:i.id,e=K.ING[id];const pan=e.f.has("pantry");
    let have=F.has(id)||id==="water"||!!(ctx.basic&&pan);
    if(!cooked[i.id]&&!have&&e.sub){const alt=[...F].find(x=>x!==id&&K.ING[x].sub===e.sub&&!taken.has(x));if(alt){sw[i.id]=alt;taken.add(alt);id=alt;e=K.ING[id];have=true}}
    const a=i.a*k*(cooked[i.id]?cooked[i.id].factor:1);
    return{id,name:e.name,a,u:i.u,txt:fmt(a,i.u),have,pantry:pan,was:i.id,leftoverSwap:!!cooked[i.id]};
  });
  const nm=id=>K.name(sw[id]||id);
  const steps=r.steps.map(rawStep=>{
    // Keep clauses about other ingredients when a step also tells the cook how to prepare dry rice/pasta/potatoes.
    const parts=rawStep.split(/([;.]\s*)/);
    for(let pi=0;pi<parts.length;pi+=2){
      let part=parts[pi];
      for(const [raw,rule] of Object.entries(cooked)){
        const token=new RegExp("\\{"+raw+"#?\\}");
        if(!token.test(part))continue;
        const cooking=/\b(cook|boil|simmer|drain|rinse|steam)\b|bring.{0,30}to the boil/i.test(part);
        if(cooking){
          if(raw==="pasta")part="Use the selected cooked pasta instead of dry pasta and reheat it in hot water until steaming hot";
          else if(raw==="rice")part="Use the selected cooked rice instead of dry rice and reheat it until steaming hot";
          else part="Use the selected cooked potatoes instead of raw potatoes and reheat them until hot";
        }else{
          part=part.replace(new RegExp("\\{"+raw+"(#?)\\}","g"),(_,h)=>"{"+rule.id+h+"}");
        }
      }
      parts[pi]=part;
    }
    return parts.join("").replace(/\{([a-z0-9-]+)(#?)\}/g,(m,id,h)=>{
      const reverse=Object.entries(cooked).find(([raw,rule])=>rule.id===id),q=r.ing.find(x=>x.id===id)||(reverse&&r.ing.find(x=>x.id===reverse[0]));
      const name=nm(id);if(!h||!q)return name;
      const amount=q.a*k*(cooked[q.id]?cooked[q.id].factor:1);
      return(q.u==="pcs"?fmt(amount,"pcs").replace(" pcs",""):fmt(amount,"g"))+" "+name;
    });
  });
  const usedSwaps=Object.entries(cooked).map(([raw,rule])=>{const q=r.ing.find(i=>i.id===raw);return{raw,id:rule.id,factor:rule.factor,amount:(q?.a||0)*k*rule.factor,original:(q?.a||0)*k}});
  const leftoverNote=usedSwaps.length?usedSwaps.map(x=>"Use about "+fmt(x.amount,"g")+" "+K.name(x.id)+" instead of "+fmt(x.original,"g")+" "+(x.raw==="potatoes"?"raw potatoes":"dry "+x.raw)+". The conversion is approximate; reheat until steaming hot.").join(" "):"";
  return{ing,steps,hit:ing.filter(i=>i.have&&!i.pantry).length,urg:ing.filter(i=>i.have&&U.has(i.id)).length,leftoverNote,usedSwaps};
};
K.nutri=(ing,n)=>{let kc=0,p=0;ing.forEach(i=>{const e=K.ING[i.id];if(!e)return;const g=i.u==="pcs"?i.a*(e.gpp||80):i.a;kc+=g*e.kcal/100;p+=g*e.p/100});return{kcal:Math.round(kc/n/10)*10,p:Math.round(p/n)}};

/* ---------- recipes ---------- */
// {id, name, meal:"big"|"wake,bite"|..., cuisine?, time (min), serves, ing:[[id, grams | "2pc"]], steps:["... {id} ..."], note?, legacy?}
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
  const seen=new Set(),ing=(r.ing||[]).map(a=>{
    const id=a[0],v=a[1],pc=typeof v==="string"&&/^[\d.]+pc$/.test(v),amt=pc?parseFloat(v):v;
    if(!K.ING[id])P("unknown ingredient '"+id+"' (add it to ingredients.js)");
    if(seen.has(id))P("ingredient listed twice: "+id);seen.add(id);
    if(!(amt>0))P("bad amount for "+id+": "+v+" (grams as a number, pieces as '2pc')");
    return{id,a:amt,u:pc?"pcs":"g"};
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
  K.recipes.push({id:r.id,title:r.name,meals,min:r.time,serv:r.serves,cuisine:r.cuisine||"",note:r.note||"",leftoverSwaps,ing,steps,flags,slots,ids:ing.map(i=>i.id)});
});

K.report=()=>{const e=K.problems.filter(p=>p.lvl==="error"),w=K.problems.filter(p=>p.lvl==="warn");
  return{ingredients:Object.keys(K.ING).length,recipes:K.recipes.length,errors:e,warnings:w}};
})();
