/* js/ui/plan.js: Plan several days. */
/* ---------- plan ---------- */
// aisle grouping: first match wins, so the order of CATS matters (e.g. "coconut oil" is oil, "canned tuna" is canned)
const CATS=[["Sauces & oils",/stock|sauce|\boil\b|vinegar|juice|paste|mustard|honey|sugar|syrup|mirin|tahini|tamari|aminos|cocoa|\bjam\b|peanut butter|baking|gochujang/],
["Canned & jarred",/canned|tinned|coconut|olives?\b|ajvar|hummus|passata/],
["Meat, fish & tofu",/chicken|turkey|pork|\bham\b|beef|steak|mince|lamb|duck|salmon|trout|\bcod\b|fish|haddock|hake|prawn|shrimp|tuna|sausage|chorizo|bacon|tofu|tempeh/],
["Dairy & eggs",/\beggs?\b|milk|yogh?urt|cream|butter|cheese|feta|parmesan|cheddar|mozzarella|halloumi|paneer/],
["Nuts & seeds",/seeds?\b|walnut|almond|peanut|cashew|\bnuts?\b|chia/],
["Spices & dried herbs",/\bground |dried|powder|flakes|cumin|garam|turmeric|cinnamon|sumac|paprika|allspice|caraway|bay leaf|black pepper|white pepper|oregano|marjoram|vanilla|gochugaru|\bsalt\b/],
["Grains, pasta & bread",/\brice\b|pasta|spaghetti|noodle|couscous|bulgur|quinoa|barley|polenta|gnocchi|bread|pita|tortilla|naan|flatbread|\boats?\b|flour|orzo|macaroni|penne|fusilli|tagliatelle|linguine/],
["Fruit & veg",/tomato|potato|onion|garlic|ginger|shallot|leek|carrot|broccoli|cauliflower|spinach|kale|chard|cabbage|cucumber|lettuce|salad|zucchini|courgette|aubergine|eggplant|pepper|mushroom|\bpeas?\b|beans?\b|corn|pumpkin|squash|celery|fennel|beet|choi|brussels|rocket|arugula|asparagus|avocado|banana|apple|pear|berr|peach|plum|mango|orange|lemon|lime|basil|parsley|coriander|mint|dill|thyme|chive/]];
const CORD=["Fruit & veg","Meat, fish & tofu","Dairy & eggs","Grains, pasta & bread","Canned & jarred","Sauces & oils","Nuts & seeds","Spices & dried herbs","Baking","Other"];
const catOf=n=>K.aisleOf(n)||(CATS.find(c=>c[1].test(n.toLowerCase()))||["Other"])[0];
// each stored ingredient carries st: "buy" (not at home), "have" (fridge/staples) or "pantry" (assumed basic)
const planG=b=>({title:b.title,min:b.min,pk:b.pk,ck:b.ck,steps:b.steps,note:b.note||"",ing:b.ing.map(i=>({id:i.id,name:i.name,txt:i.txt,a:i.a,u:i.u,st:isLeftIng(i)||i.have?"have":(S.basic&&(i.pantry||GEN.pantry.test(i.name.toLowerCase()))?"pantry":"buy")}))});
const priorityIds=list=>(list||[]).flatMap(x=>K.match(x));
function priorityUseCount(g,list){const ids=new Set(priorityIds(list));return(g.ing||[]).filter(i=>(i.id?[i.id]:K.match(i.name||"")).some(id=>ids.has(id))).length;}
function hasLeftoverRoute(r,F){
  const direct=r.ids.filter(isLeft),directOk=direct.every(id=>F.has(id));
  const cooked=Object.keys(K.swapsFor(r,F)).length>0;
  return !!(directOk&&(direct.length>0||cooked));
}
const useUp=(it,g)=>{
  // Consume only the exact catalog ingredient(s) used. A cooked leftover must not consume a matching raw ingredient (e.g. leftover chicken ≠ raw chicken).
  const usedIds=new Set(g.ing.filter(i=>i.st==="have").flatMap(i=>i.id?[i.id]:K.match(i.name)));
  it=it.filter(w=>!K.match(w).some(id=>usedIds.has(id)));
  return[...new Set([...it,...stap()])];
};
function mealFromAvailableLeftovers(m,it){
  const F=new Set(it.flatMap(x=>K.match(x))),activeUrgent=S.urgent.filter(u=>it.some(x=>K.match(x).some(id=>K.match(u).includes(id)))),urgent=new Set(activeUrgent.flatMap(x=>K.match(x)));
  const pool=RECIPES.filter(r=>r.meals.includes(m)&&K.allowed(r,S.diet)&&(!S.bake||isBake(r))&&hasLeftoverRoute(r,F)&&!PT.has(r.title));
  if(!pool.length)return null;
  const ready=pool.map(r=>{const x=K.resolve(r,S.n,{fridge:F,basic:S.basic,urgent});return{r,x,miss:x.ing.filter(i=>!i.have&&!(S.basic&&(i.pantry||GEN.pantry.test(i.name.toLowerCase())))).length,used:x.ing.filter(isLeftIng).length,priority:x.urg};});
  const q=ready.filter(x=>!S.quick||x.r.min<=30);const list=q.length?q:ready;
  list.sort((a,b)=>b.priority-a.priority||b.used-a.used||a.miss-b.miss||(S.cuisine?Number(b.r.cuisine===S.cuisine)-Number(a.r.cuisine===S.cuisine):0));
  const top=list.filter(x=>x.priority===list[0].priority&&x.used===list[0].used&&x.miss===list[0].miss&&(!S.cuisine||x.r.cuisine===list[0].r.cuisine));
  const {r,x}=rnd(top);
  return{title:r.title,min:r.min,steps:x.steps,ing:x.ing,note:[r.note,x.leftoverNote].filter(Boolean).join(" "),pk:"",ck:"",savedRecipe:true,cuisine:r.cuisine};
}
function mealGen(m,it,cu,dd,mode,pc){
  // Spend real, selected leftovers in recipes designed for cooked food before generating anything new.
  const leftMeal=mealFromAvailableLeftovers(m,it);if(leftMeal)return leftMeal;
  if(mode==="remix"){const p=pc[m]||(pc[m]=remixPool(m));if(p.length>=2){const g=remixOnce(m,it,dd,p,false);if(g&&(g.pk||m!=="Main"))return g}}
  return m==="Main"?GEN.make(it,S.n,cu,dd):GEN.makeSmall(m,it,S.n,dd);
}
let PT=new Set();
function bestMeal(m,it,cu,dd,mode,pc,not){m=normM(m);
  let best=null,bm=1e9;
  for(let j=0;j<25;j++){const g=mealGen(m,it,cu,dd,mode,pc);if(!g||g.title===not||PT.has(g.title))continue;
    const missingCount=g.ing.filter(i=>!isLeftIng(i)&&!i.have&&!(S.basic&&(i.pantry||GEN.pantry.test(i.name.toLowerCase())))).length;
    // A clock-marked ingredient is a strong preference during planning too, not just during single-recipe spinning.
    const urgencyPool=(dd&&Array.isArray(dd.urgent)?dd.urgent:S.urgent).filter(u=>it.some(x=>K.match(x).some(id=>K.match(u).includes(id))));
    const urgentCount=priorityUseCount(g,urgencyPool),leftoverCount=g.ing.filter(isLeftIng).length;
    const k=missingCount*100-urgentCount*250-leftoverCount*100+(S.quick&&g.min>30?1000:0);
    if(k<bm){best=g;bm=k;if(k<=-250)break}}
  return best||mealGen(m,it,cu,dd,mode,pc);
}
// EVERY ingredient from every day ends up here: "buy" amounts are summed over the days you need to buy them,
// everything else is kept as "have"/"pantry" so nothing silently disappears
function buildList(days){
  const t={};
  days.forEach(x=>x.g.ing.forEach(i=>{if(i.name==="water"||isLeftIng(i))return;const k=i.name.toLowerCase()+"|"+i.u,e=t[k]=t[k]||{name:i.name,u:i.u,buy:0,all:0,have:0};e.all+=i.a;if(i.st==="buy")e.buy+=i.a;else if(i.st==="have")e.have++}));
  return Object.values(t).map(e=>e.buy?{name:e.name,u:e.u,a:e.buy,txt:fmt(e.buy,e.u),st:"buy"}:{name:e.name,u:e.u,a:e.all,txt:fmt(e.all,e.u),st:e.have?"have":"pantry"}).sort((a,b)=>a.name.localeCompare(b.name));
}
function plan(mode){
  const meals=MEALS.map(m=>m[0]).filter(m=>S.pm[m]);PT=new Set();if(!meals.length){$("out").innerHTML="";$("note").textContent="Pick a meal type above to plan.";return}
  let it=items(),ug=S.urgent.slice();const cus=shufA(Object.keys(GEN.cuisines)),days=[],pc={},rp=[],rc=[];let ci=0;
  for(let d=1;d<=S.days;d++)for(const m of meals){
    const cu=S.cuisine||cus[ci++%cus.length],g=planG(bestMeal(m,it,cu,dietP({avoidP:rp.slice(-3),avoidC:rc.slice(-2),urgent:ug}),mode,pc));
    if(m==="Main"){if(g.pk)rp.push(g.pk);if(g.ck)rc.push(g.ck)}
    it=useUp(it,g);ug=ug.filter(u=>it.includes(u.toLowerCase()));PT.add(g.title);days.push({d,m,g});
  }
  renderPlan(days,buildList(days),{title:S.days+(mode==="remix"?"-day remix plan":"-day plan"),n:S.n,mode},false);
}
// swap one meal for a new one: same slot, different protein, rest of the plan untouched, list rebuilt from all days
function swap(i){
  const[days,,m0]=lastPlan,x=days[i],meta={title:m0.title,n:m0.n,mode:m0.mode},others=days.filter((_,j)=>j!==i);PT=new Set(others.map(o=>o.g.title));
  let it=items();others.forEach(o=>{it=useUp(it,o.g)});
  const mains=others.filter(o=>o.m==="Main").map(o=>o.g),rp=mains.map(g=>g.pk).filter(Boolean).slice(-3),rc=mains.map(g=>g.ck).filter(Boolean).slice(-2);
  if(x.g.pk)rp.push(x.g.pk);if(x.g.ck)rc.push(x.g.ck);
  const cu=S.cuisine||rnd(Object.keys(GEN.cuisines).filter(c=>!x.g.title.startsWith(c)));
  days[i]={...x,g:planG(bestMeal(x.m,it,cu,dietP({avoidP:rp,avoidC:rc,urgent:S.urgent}),meta.mode,{},x.g.title))};
  renderPlan(days,buildList(days),meta,false,i);
}
function renderPlan(days,list,meta,saved,open){
  lastPlan=[days,list,meta,saved];current=null;
  const can=days.every(x=>x.g.ing.every(i=>typeof i.a==="number")),st=i=>i.st||"buy",buy=list.filter(i=>st(i)==="buy"&&!isLeftIng(i)),rest=list.filter(i=>st(i)!=="buy"&&!isLeftIng(i)),
    groups=CORD.map(c=>[c,buy.filter(i=>catOf(i.name)===c)]).filter(g=>g[1].length),li=i=>`<li><span>${esc(i.name)}</span><span class="q">${esc(Q(i))}</span></li>`;
  $("note").textContent=saved?"":(meta.mode==="remix"?"Available leftovers are used in dedicated cookbook recipes first; other meals are remixes. ":"")+"Priority (clock) items go first, selected leftovers are used in recipes written for cooked food, fridge items are used up day by day, and proteins rotate.";
  $("out").innerHTML=`<article class="card plan"><div class="hero"><div class="ic">${I("cal")}</div><h2>${esc(meta.title)} for ${meta.n} ${meta.n>1?"people":"person"}</h2></div><div class="body">`+days.map((x,i)=>`<details class="day"${i===open?" open":""}><summary>Day ${x.d} · ${ML(x.m)}: ${esc(x.g.title)}</summary>${x.g.note?`<p class="hint">${esc(cv(x.g.note))}</p>`:""}<h3>${I("list")}Ingredients</h3><ul class="ing">${x.g.ing.map(i=>`<li><span>${esc(i.name)}</span><span class="q">${esc(Q(i))}</span></li>`).join("")}</ul><h3>${I("chef")}Method</h3><ol>${x.g.steps.map(s=>`<li><span>${esc(cv(s))}</span></li>`).join("")}</ol>${can?`<div class="row"><button data-sw="${i}">${I(meta.mode==="remix"?"wand":"dice")}${meta.mode==="remix"?"Whisk another":"Try another"} ${ML(x.m).toLowerCase()}</button></div>`:""}</details>`).join("")+
   `<h3>${I("cart")}Shopping list <small style="text-transform:none;letter-spacing:0;color:var(--mute)">(${buy.length} to buy, tap to tick off)</small></h3>`+
   (groups.length?`<div class="shopg">`+groups.map(g=>`<div class="sg"><h4 class="cat">${g[0]}</h4><ul class="ing tick">${g[1].map(li).join("")}</ul></div>`).join("")+`</div>`:"<p class=\"hint\">Nothing to buy.</p>")+
   (rest.length?`<details><summary>Already have or assumed at home (${rest.length})</summary><ul class="ing">${rest.map(li).join("")}</ul></details>`:"")+
   `<div class="row"><button id="sp">${I("heart")}${saved?"Saved":"Save plan"}</button><button id="cp">${I("cart")}Copy list</button></div></div></article>`;
  $("out").querySelectorAll("[data-sw]").forEach(b=>b.onclick=()=>swap(+b.dataset.sw));
  $("out").querySelectorAll("ul.tick li").forEach(l=>l.onclick=()=>l.classList.toggle("done"));
  $("cp").onclick=async()=>{try{await navigator.clipboard.writeText(groups.map(g=>g[0]+"\n"+g[1].map(i=>"• "+i.name+" – "+Q(i)).join("\n")).join("\n\n")||"Nothing to buy.");$("cp").innerHTML=I("cart")+"Copied"}catch(e){}};
  $("sp").onclick=()=>{if(saved)return;const f=store("mr-plans2")||[];f.unshift({title:meta.title,n:meta.n,mode:meta.mode,days,list,date:new Date().toLocaleDateString()});store("mr-plans2",f.slice(0,15));plansUI();$("sp").innerHTML=I("heart")+"Saved"};
}
function plansUI(){
  const f=store("mr-plans2")||[];$("plans").innerHTML=f.length?`<h3>${I("cal")}Saved plans</h3>`+f.map((p,i)=>`<div class="prow"><button data-o="${i}">${I("cal")}${esc(p.title)} · ${esc(p.date)}</button><button class="d" data-x="${i}" aria-label="Delete plan">${I("x")}</button></div>`).join(""):"";
  $("plans").querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const p=f[+b.dataset.o];renderPlan(p.days,p.list,p,true);toCard("out")});
  $("plans").querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{f.splice(+b.dataset.x,1);store("mr-plans2",f);plansUI()});
}
