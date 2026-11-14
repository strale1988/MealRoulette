/* js/ui/roulette.js: Spin and Whisk: seen-history, ratings, smarter random, picking a recipe, Remix. */
/* ---------- recipe roulette ---------- */
const RECIPES=K.recipes; // built by kitchen.js from ingredients.js + cookbook-*.js
let current=null,kind="spin";
/* history survives reloads: recipes are not repeated until the whole pool for that meal has been used */
const HK="mr-hist3",hist=()=>store(HK)||{},seenOf=()=>(hist().r||{})[S.meal]||[],recentG=()=>hist().g||[];
function markSeen(id){const h=hist();h.r=h.r||{};h.r[S.meal]=(h.r[S.meal]||[]).filter(x=>x!==id).concat(id).slice(-400);store(HK,h)}
function clearSeen(){const h=hist();h.r=h.r||{};h.r[S.meal]=[];store(HK,h)}
function markGen(t){const h=hist();h.g=(h.g||[]).filter(x=>x!==t).concat(t).slice(-40);store(HK,h)}
const recent=t=>recentG().includes(t);
/* a ferment that is ready in My kitchen counts as something you have: recipes that use it need less shopping and rank higher, and their card says so.
   [catalog id, name shown, Fermentation methods, word the batch title must contain] */
const FERM=[["kimchi","kimchi",["kimchi"]],["sauerkraut","sauerkraut",["kraut"]],["hot-sauce","hot sauce",["hot"]],["sriracha","hot sauce",["hot"]],
 ["pickles","pickles",["quick","brine"],"cucumber|gherkin"],["pickled-red-onions","pickled onions",["quick","brine"],"onion"],["pickled-jalapenos","pickled jalapeños",["quick","brine"],"jalape"],["pickled-beets","pickled beets",["quick","brine"],"beet"]];
const readyFerm=()=>{try{return window.FERMENT&&window.FERMENT.have?FERM.filter(x=>K.ING[x[0]]&&window.FERMENT.have(x[2],x[3])):[]}catch(e){return[]}};
const fridgeIds=(()=>{let key="",set=new Set();return()=>{const it=items(),rf=readyFerm().map(x=>x[0]),k=it.join("|")+"#"+rf.join(",");if(k!==key){key=k;set=new Set(it.flatMap(x=>K.match(x)).concat(rf))}return set}})();
/* Cook cards: an ingredient written as ["flour",500,"Bun"] sits under a "Bun" heading, with one link for the whole section when the app can teach it (see xlink.js SEC).
   A label needs 2+ lines, or a link, to be a section; lines with no label are listed first, or under "Also" when they come after a section. */
const ingLi=(i,nopill)=>`<li><span>${esc(i.name)}${window.XLINK&&!nopill?XLINK.btn(i.name,i.id,null):""}${missing(i)?'<span class="buy">to buy</span>':""}</span><span class="q">${esc(Q(i))}</span></li>`;
const ingBlock=ing=>{const X=window.XLINK,cnt={};ing.forEach(i=>{if(i.sec)cnt[i.sec]=(cnt[i.sec]||0)+1});
  const sec=l=>X&&X.sec?X.sec(l,null):"",by=new Map();
  ing.forEach(i=>{const l=i.sec&&(cnt[i.sec]>1||sec(i.sec))?i.sec:"";if(!by.has(l))by.set(l,[]);by.get(l).push(i)});
  const lab=[...by.keys()].some(Boolean);
  return[...by].map(([l,a],k)=>{const head=l||(lab&&k>0?"Also":""),hl=l?sec(l):"";return(head?`<div class="ingh"><span>${esc(head)}</span>${hl}</div>`:"")+`<ul class="ing">${a.map(i=>ingLi(i,!!hl)).join("")}</ul>`}).join("")}; // a section that already carries the link needs no pill on its own lines
const cookList=ing=>{const c={};ing.forEach(i=>{if(i.sec)c[i.sec]=(c[i.sec]||0)+1});return ing.map(i=>[(i.sec&&c[i.sec]>1?i.sec+": ":"")+i.name,Q(i)])}; // the cooking-mode panel groups "Label: name" lines
const missing=i=>!isLeftIng(i)&&items().length>0&&!i.have&&!(S.basic&&(i.pantry||GEN.pantry.test(i.name.toLowerCase())));
function priorityCount(g){const ids=new Set(S.urgent.flatMap(x=>K.match(x)));return(g.ing||[]).filter(i=>(i.id?[i.id]:K.match(i.name||"")).some(id=>ids.has(id))).length;}
function bestOf(fn,k){let best=null,bm=1e9;for(let j=0;j<k;j++){const g=fn(),m=g.ing.filter(missing).length*100-priorityCount(g)*30+(S.quick&&g.min>30?1000:0)+(recent(g.title)?50:0);if(m<bm){best=g;bm=m;if(m<=-30)break}}return best}
function callout(r){
  if(!items().length)return"";const m=r.ing.filter(missing),uu=(r.unused||[]).filter(x=>!stap().includes(x)),un=uu.length?` Not used this time: ${esc(uu.join(", "))}.`:"";
  return m.length?`<div class="call buy2">${I("cart")}<span>To buy (${m.length}): ${m.map(i=>esc(i.name)).join(", ")}.${un}</span></div>`:`<div class="call ok2">${I("check")}<span>You already have everything.${un}</span></div>`;
}
const isBake=r=>/^bake-|bread|cake|cookie|crumble/.test(r.id),isLeft=isLeftId;
function recipeInfos(meal){
  meal=meal||S.meal;const F=fridgeIds(),U=new Set([...S.urgent.flatMap(x=>K.match(x)),...[...F].filter(isLeft)]); // leftovers always count as use-first
  let pool=RECIPES.filter(r=>{
    if(!r.meals.includes(meal)||!K.allowed(r,S.diet)||S.bake&&!isBake(r))return false;
    const needLeft=r.ids.filter(isLeft);
    // Never suggest buying cooked leftovers: a recipe that needs them is available only when every required leftover is in the active inventory.
    return needLeft.every(id=>F.has(id));
  });const qk=pool.filter(r=>r.min<=30);if(S.quick&&qk.length)pool=qk;
  return pool.map(r=>{const x=K.resolve(r,S.n,{fridge:F,basic:S.basic,urgent:U});
    return{r,ing:x.ing,steps:x.steps,leftoverNote:x.leftoverNote,miss:x.ing.filter(missing).length,hit:x.hit,urg:x.urg,cu:S.cuisine&&isMain(meal)&&r.cuisine===S.cuisine?1:0}});
}
function spin(){
  const it=items();let L=recipeInfos(),msg="";if(!L.length)return S.bake?nothing():build(); // no stored recipe fits the diet: make one up instead
  pickRecipe(L,msg);
}
/* ratings (thumbs) and seasons */
const ratings=()=>store("mr-rate")||{};
const WARMRX=/stew|soup|roast|casserole|\bbake[ds]?\b|curry|chil[il]i?|risotto|goulash|\bpie\b|braise|hotpot|porridge|\bdal\b|ramen|gratin|lasagn|dumpling|chowder|cassoulet|tagine|shakshuka|moussaka|stroganoff|\bpho\b|congee|cottage|mac(aroni)? and cheese|hot chocolate|crumble|pudding/i,COOLRX=/salad|gazpacho|\bcold\b|ceviche|poke|summer|grilled|\bbbq\b|barbecue|\bwraps?\b|slaw|chilled|tzatziki|sushi|iced|smoothie|ice cream|no-bake|bruschetta|caprese|ni[cç]oise|spring roll|tabbouleh|fattoush|sorbet|granita|overnight oats/i;
const southern=(()=>{try{return/^(Australia|Pacific\/Auckland|Pacific\/Fiji|America\/(Argentina|Sao_Paulo|Santiago|Montevideo|Lima|La_Paz|Asuncion)|Africa\/(Johannesburg|Maputo|Harare|Windhoek))/.test(Intl.DateTimeFormat().resolvedOptions().timeZone)}catch(e){return false}})();
function warmth(){const m=(new Date().getMonth()+(southern?6:0))%12;return[-1,-.8,-.4,0,.5,.9,1,1,.5,0,-.5,-.9][m]} // -1 deep winter .. +1 high summer
function seasonK(r){const t=warmth(),txt=r.title||"";if(WARMRX.test(txt)&&!COOLRX.test(txt))return 1-.6*t;if(COOLRX.test(txt)&&!WARMRX.test(txt))return 1+.6*t;return 1}
/* ---- smarter random: still random, but it leans away from what you just saw or cooked and toward what you saved ---- */
const PFAM=g=>/^(salmon|cod|tuna|prawns)$/.test(g)?"fish":g==="chickenthigh"?"chicken":g;
const proteinsOf=r=>[...new Set((r.ids||[]).map(id=>K.ING[id]).filter(e=>e&&e.role==="protein").flatMap(e=>e.gen.filter(g=>g[0]==="p").map(g=>PFAM(g[1]))))];
function markShown(r){const h=hist();h.v=(h.v||[]).filter(x=>x.id!==r.id).concat({id:r.id,c:r.cuisine||"",p:proteinsOf(r)}).slice(-4);store(HK,h)}
function pickWeighted(pool){
  if(pool.length<2)return pool[0];
  const v=(hist().v||[]).slice(-3),cooked=new Set((store("mr-cooklog")||[]).filter(x=>Date.now()-x.d<10*864e5).map(x=>x.t)),fav=new Set((store("mr-favs2")||[]).map(x=>x.title));
  const w=x=>{let k=1;const r=x.r,ps=proteinsOf(r);
    v.forEach((h,i)=>{const recency=i===v.length-1?1:.6; // the dish just before counts most
      if(r.cuisine&&h.c===r.cuisine)k*=1-.6*recency;if(ps.some(p=>h.p.includes(p)))k*=1-.55*recency});
    if(cooked.has(r.title))k*=.25;if(fav.has(r.title))k*=1.5;
    const rt=ratings()[r.title];if(rt)k*=rt.v>0?1.7:(Date.now()-rt.t<28*864e5?.05:.3);
    if(S.seasonal)k*=seasonK(r);return Math.max(k,.02)};
  const ws=pool.map(w);let t=Math.random()*ws.reduce((a,b)=>a+b,0);
  for(let i=0;i<pool.length;i++){if((t-=ws[i])<0)return pool[i]}return pool[pool.length-1];
}
function pickRecipe(L,msg){
  if(!L||!L.length)return nothing();
  // best tier first (fewest to buy, cuisine match, priority items, then most fridge items); only move to a worse tier when every recipe in the better ones was already shown
  const sn=seenOf(),tiers=[];
  L.slice().sort((a,b)=>b.urg-a.urg||a.miss-b.miss||b.hit-a.hit||b.cu-a.cu).forEach(x=>{const t=tiers[tiers.length-1];if(t&&t[0].urg===x.urg&&t[0].miss===x.miss&&t[0].hit===x.hit&&t[0].cu===x.cu)t.push(x);else tiers.push([x])});
  let pool=null;for(const t of tiers){const f=t.filter(x=>!sn.includes(x.r.id));if(f.length){pool=f;break}}
  if(!pool){const last=sn[sn.length-1];clearSeen();pool=tiers[0].filter(x=>x.r.id!==last);if(!pool.length)pool=tiers[0]}
  const x=pickWeighted(pool);markSeen(x.r.id);markShown(x.r);
  if(S.strict&&items().length&&x.miss>0)msg="Nothing fits using only your fridge, so this is the closest match. See what to buy below.";
  show({rid:x.r.id,title:x.r.title,min:x.r.min,n:S.n,steps:x.steps,ing:x.ing,desc:[x.r.note,x.leftoverNote].filter(Boolean).join(" ")},msg);
}
/* One button. With "Only what I have" on, it picks between real recipes that need nothing extra and a meal
   made up from your fridge and staples. With it off, it picks the recipe closest to your fridge. */
function genFridge(){const it=items(),m=S.meal,main=isMain(m);if(S.bake&&main)return null;return main?fridgeTry(it):bestOf(()=>GEN.makeSmall(m,it,S.n,dietP()),80)}
/* Plain random: no fridge items, no filters (and always for the start wheel) means any real recipe of the meal type from the whole cookbook; diet is still respected, staples and fridge are ignored */
const hasExtras=()=>!!(S.pantry.length||(S.useLeftovers&&S.leftovers.length)||S.urgent.length||S.quick||S.cuisine||S.bake);
/* things that are part of a meal, not a meal: the start wheel never lands on them (sauces, spice mixes, jams, ferments, dairy basics, doughs, pickles, stocks, plain loaves/buns/flatbreads, croutons) */
const PART_CRAFT=new Set(["sauce","ferm","dairy","jam","spice","cure","rub","starter","cheese"]),PART_ID=new Set(["bake-white-loaf","easy-white-loaf","soft-flatbreads","soft-burger-buns-homemade","left-stale-bread-croutons","apple-cinnamon-compote"]),PART_RX=/^(?!.*\b(with|and|in)\b)(?:[a-z ]*\b(?:stock|bouillon|brine|dough)|(?:quick |easy |simple |homemade )?(?:pickles?|pickled [a-z ]+))$|^(?:quick |easy )pickled\b/i;
const isPart=r=>r.meals.includes("Extra")||PART_CRAFT.has(r.craft)||PART_ID.has(r.id)||PART_RX.test(r.title.replace(/\s*\(.*\)\s*$/,""));
window.__isPart=isPart;
function plainPick(uniform){
  const m=S.meal,pool=RECIPES.filter(r=>r.meals.includes(m)&&K.allowed(r,S.diet)&&!r.ids.some(isLeft)&&!(uniform&&isPart(r)));if(!pool.length)return false;
  const sn=seenOf();let c=pool.filter(r=>!sn.includes(r.id));
  if(!c.length){const last=sn[sn.length-1];clearSeen();c=pool.filter(r=>r.id!==last);if(!c.length)c=pool}
  const r=uniform?c[Math.floor(Math.random()*c.length)]:pickWeighted(c.map(x=>({r:x}))).r,x=K.resolve(r,S.n,{fridge:fridgeIds(),basic:S.basic,urgent:new Set([...S.urgent.flatMap(w=>K.match(w)),...[...fridgeIds()].filter(isLeft)])}); // same resolve as every other pick, so staples and leftovers still show what is already at home and what is "to buy"
  markSeen(r.id);markShown(r);
  show({rid:r.id,title:r.title,min:r.min,n:S.n,steps:x.steps,ing:x.ing,desc:[r.note,x.leftoverNote].filter(Boolean).join(" ")},"");return true;
}
window.__plainRoll=m=>{S.meal=m;S.pm={[m]:true};save();window.__plain="uniform"}; // the start wheel: a random kind of meal, fridge and filters ignored
function go(){
  const forced=window.__plain;window.__plain=false;
  if((forced||!hasExtras())&&plainPick(forced==="uniform"))return;
  if(S.strict&&items().length){
    const all=recipeInfos().filter(x=>x.miss===0),sn0=seenOf(),ex=all.filter(x=>!sn0.includes(x.r.id)),priorityAll=all.filter(x=>x.urg>0),priorityNew=ex.filter(x=>x.urg>0),g=genFridge(),gOk=g&&!g.ing.some(missing);
    if(priorityNew.length)return pickRecipe(priorityNew,"");
    if(priorityAll.length){clearSeen();return pickRecipe(priorityAll,"")}
    if(gOk&&(!ex.length||Math.random()<.5))return show({...g,n:S.n,built:true},"");
    if(ex.length)return pickRecipe(ex,"");
    if(all.length){clearSeen();return pickRecipe(all,"")}
    return nothing();
  }
  spin();
}
// "Only what I have" never shows a recipe that needs shopping. If nothing fits, say what would unlock something.
function canMake(m){const o=S.meal;S.meal=m;try{if(recipeInfos(m).some(x=>x.miss===0))return true;const it=items(),g=isMain(m)?(S.bake?null:fridgeTry(it)):bestOf(()=>GEN.makeSmall(m,it,S.n,dietP()),30);return !!(g&&!g.ing.some(missing))}catch(e){return false}finally{S.meal=o}}
function nothing(){
  current=null;lastPlan=null;$("note").textContent="";
  const others=MEALS.filter(m=>m[0]!==S.meal&&canMake(m[0])),near={},RI=recipeInfos(),
    almost=RI.filter(x=>x.miss>=1&&x.miss<=2).sort((a,b)=>a.miss-b.miss||b.hit-a.hit||Math.random()-.5).slice(0,6); // "almost there": real recipes that are only one or two ingredients short
  RI.filter(x=>x.miss===1).forEach(x=>{const i=x.ing.find(missing);if(i)near[i.name]=(near[i.name]||0)+1});
  const add=Object.entries(near).sort((a,b)=>b[1]-a[1]).slice(0,4);
  $("out").innerHTML=`<article class="card"><div class="body"><div class="ph"><b>Nothing for ${esc(ML(S.meal).toLowerCase())} from only your fridge</b>${others.length||add.length||almost.length?"Here is what would work:":"Add a few more ingredients and try again."}</div>
  ${others.length?`<h3>${I("dice")}Works right now</h3><div class="row">${others.map(m=>`<button data-meal="${m[0]}">${I(m[1])}${m[2]}</button>`).join("")}</div>`:""}
  ${add.length?`<h3>${I("cart")}One ingredient away</h3><div class="row">${add.map(a=>`<button data-add="${esc(a[0])}">+ ${esc(a[0])} <small>(${a[1]} recipe${a[1]>1?"s":""})</small></button>`).join("")}</div>`:""}
  ${almost.length?`<h3>${I("check")}Almost there</h3><div class="alm">${almost.map((x,k)=>`<button data-near="${k}"><b>${esc(x.r.title)}</b><small>${x.r.min} min · need ${x.ing.filter(missing).map(i=>esc(i.name)).join(", ")}</small></button>`).join("")}</div>`:""}
  <div class="row"><button data-closest="1">${I("list")}Show the closest recipe anyway</button></div></div></article>`;
  $("out").querySelectorAll("[data-meal]").forEach(b=>b.onclick=()=>{S.meal=b.dataset.meal;S.pm[S.meal]=true;save();draw();go()});
  $("out").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{S.pantry.push(b.dataset.add.toLowerCase());save();draw();go()});
  $("out").querySelectorAll("[data-near]").forEach(b=>b.onclick=()=>{const x=almost[+b.dataset.near];markSeen(x.r.id);markShown(x.r);show({rid:x.r.id,title:x.r.title,min:x.r.min,n:S.n,steps:x.steps,ing:x.ing,desc:[x.r.note,x.leftoverNote].filter(Boolean).join(" ")},"")});
  $("out").querySelectorAll("[data-closest]").forEach(b=>b.onclick=()=>spin());
}
function fridgeTry(it){let best=null,bestScore=1e9;for(let j=0;j<40;j++){const x=GEN.makeFridge(it,S.n,S.cuisine,dietP(),S.basic);if(!x)continue;const score=x.ing.filter(missing).length*100-priorityCount(x)*500+(S.quick&&x.min>30?1000:0)+(recent(x.title)?50:0);if(score<bestScore){best=x;bestScore=score}if(priorityCount(x)>0&&!x.ing.some(missing)&&(!S.quick||x.min<=30)&&!recent(x.title))break}return best}
function build(){
  const it=items(),m=S.meal,main=isMain(m);let g;
  if(S.strict&&it.length){
    g=main?fridgeTry(it):bestOf(()=>GEN.makeSmall(m,it,S.n,dietP()),80);
    if(!g)return show(null,"Add at least two ingredients (a protein, a carb or some veg) that fit your diet to build from your fridge.");
  }else g=bestOf(()=>main?GEN.make(it,S.n,S.cuisine,dietP()):GEN.makeSmall(m,it,S.n,dietP()),it.length||S.quick?40:1);
  show({...g,n:S.n,built:true},"");
}

/* Remix: pick two real recipes (biased to your fridge), borrow their protein / carb / veg and flavour, and let the
   engine cook them under the same taste, timing and diet rules. Falls back to the plain builder if too few recipes fit. */
function remixPool(meal){meal=normM(meal);const p=RECIPES.filter(r=>r.meals.includes(meal)&&K.allowed(r,S.diet)&&(!S.bake||isBake(r))&&!r.ids.some(isLeft)),q=p.filter(r=>r.min<=30);return S.quick&&q.length>=2?q:p}
function remixOnce(meal,it,dd,pool,strict){
  const F=fridgeIds(),w=r=>1+2*r.ids.filter(id=>F.has(id)).length,
    pick=l=>{let t=Math.random()*l.reduce((s,r)=>s+w(r),0);return l.find(r=>(t-=w(r))<0)||l[0]},
    a=pick(pool),b=pick(pool.filter(r=>r!==a)),
    g=GEN.remix([a,b].map(r=>({title:r.title,names:r.ids.map(K.name),slots:r.slots,cuisine:r.cuisine})),it,S.n,dd,{cuisine:S.cuisine,fridge:it,strict,basic:S.basic,small:isMain(meal)?null:meal});
  if(g)g.ing.forEach(i=>{const id=K.match(i.name)[0];i.have=/^(salt|water)$/.test(i.name)||(id&&F.has(id))||it.some(x=>x.length>2&&i.name.toLowerCase().includes(x.toLowerCase()));if(id&&K.ING[id].f.has("pantry"))i.pantry=true});
  return g;
}
function invent(){
  if(S.bake&&isMain(S.meal))return go();
  const it=items(),pool=remixPool(S.meal),st=S.strict&&it.length>0;if(pool.length<2)return build();
  let best=null,bm=1e9;
  for(let j=0;j<40;j++){const g=remixOnce(S.meal,it,dietP(),pool,st);if(!g)continue;const m=g.ing.filter(missing).length+(S.quick&&g.min>30?100:0)+(recent(g.title)?50:0);if(m<bm){best=g;bm=m;if(!m)break}}
  if(!best)return build();
  if(st&&bm>0)return nothing();
  show({...best,n:S.n,built:true},"");
}
