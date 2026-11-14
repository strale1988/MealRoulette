/* js/ui/controls.js: Fridge, staples and leftover inputs, autocomplete, filters. */
/* ---------- controls ---------- */
function draw(){
  S.pm={[S.meal]:true}; // one meal type at a time, planning included
  $("meals").innerHTML=MEALS.map(m=>`<button class="tile" data-m="${m[0]}" aria-pressed="${!!S.pm[m[0]]}">${I(m[1])}${m[2]||m[0]}</button>`).join("");
  $("meals").querySelectorAll("button").forEach(b=>b.onclick=()=>{const m=b.dataset.m;S.meal=m;S.pm={[m]:true};$("note").textContent="";save();draw()});
  $("tags").querySelectorAll(".tag").forEach(t=>t.remove());
  S.pantry.forEach((p,i)=>$("tags").insertBefore(Object.assign(document.createElement("span"),{className:"tag"+(S.urgent.includes(p)?" urg":""),innerHTML:`${esc(p)}<button class="u" aria-label="Use ${esc(p)} first" aria-pressed="${S.urgent.includes(p)}" data-p="${esc(p)}">${I("clock")}</button><button class="r" aria-label="Remove ${esc(p)}" data-i="${i}">${I("x")}</button>`}),$("add")));
  $("tags").querySelectorAll(".tag button.r").forEach(b=>b.onclick=()=>{const p=S.pantry.splice(+b.dataset.i,1)[0];S.urgent=S.urgent.filter(x=>x!==p);save();draw()});
  $("tags").querySelectorAll(".tag button.u").forEach(b=>b.onclick=()=>{const p=S.pantry[S.pantry.indexOf(b.dataset.p)];S.urgent=S.urgent.includes(p)?S.urgent.filter(x=>x!==p):[...S.urgent,p];save();draw()});
  $("quick").innerHTML=QUICK.filter(q=>!alreadyHas(S.pantry,q)).map(q=>`<button data-q="${q}">+ ${q}</button>`).join("");
  $("useleft").checked=!!S.useLeftovers;
  $("leftpanel").hidden=!S.useLeftovers;
  $("lefttags").querySelectorAll(".left-tag").forEach(t=>t.remove());
  S.leftovers.forEach((p,i)=>$("lefttags").insertBefore(Object.assign(document.createElement("span"),{className:"tag left-tag",innerHTML:`${esc(p)}<button class="r" aria-label="Remove leftover ${esc(p)}" data-li="${i}">${I("x")}</button>`}),$("ladd")));
  $("lefttags").querySelectorAll("button.r").forEach(b=>b.onclick=()=>{S.leftovers.splice(+b.dataset.li,1);save();clearCurrentForInventoryChange();draw()});
  const chosenLeft=new Set(S.leftovers.map(x=>K.norm(x)));
  $("lquick").innerHTML=S.useLeftovers?LQUICK.filter(q=>!chosenLeft.has(K.norm(q))).map(q=>`<button data-q="${q}">+ ${q}</button>`).join(""):"";
  $("lquick").querySelectorAll("button").forEach(b=>b.onclick=()=>{if(!S.leftovers.includes(b.dataset.q))S.leftovers.push(b.dataset.q);save();clearCurrentForInventoryChange();draw()});
  $("useleft").onchange=e=>{S.useLeftovers=e.target.checked;save();clearCurrentForInventoryChange();draw()};
  $("quick").querySelectorAll("button").forEach(b=>b.onclick=()=>{const v=tidy(b.dataset.q);if(!alreadyHas(S.pantry,v))S.pantry.push(v);save();draw()});
  $("pn").textContent=S.n;
  $("stags").querySelectorAll(".tag").forEach(t=>t.remove());
  S.staples.forEach((p,i)=>$("stags").insertBefore(Object.assign(document.createElement("span"),{className:"tag",innerHTML:`${esc(p)}<button class="r" aria-label="Remove ${esc(p)}" data-i="${i}">${I("x")}</button>`}),$("sadd")));
  $("stags").querySelectorAll(".tag button.r").forEach(b=>b.onclick=()=>{S.staples.splice(+b.dataset.i,1);save();draw()});
  $("squick").innerHTML=SQUICK.filter(q=>!alreadyHas(S.staples,q)).map(q=>`<button data-q="${q}">+ ${q}</button>`).join("");
  $("squick").querySelectorAll("button").forEach(b=>b.onclick=()=>{const v=tidy(b.dataset.q);if(!alreadyHas(S.staples,v))S.staples.push(v);save();draw()});
  document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>setTab(b.dataset.go));
  $("mode").innerHTML=[["strict","Only what I have","fridge"],["basic","Assume basic pantry","check"],["quick","Quick (30 min or less)","clock"],["bake","Baking only","cupcake"]].map(d=>`<button data-k="${d[0]}" aria-pressed="${!!S[d[0]]}">${I(d[2])}${d[1]}</button>`).join("");
  $("mode").querySelectorAll("button").forEach(b=>b.onclick=()=>{S[b.dataset.k]=!S[b.dataset.k];save();draw()});
  $("mh").textContent=S.strict?"Only what I have: you only get meals your fridge and staples cover. If nothing fits, you see what to add.":"Closest real recipe to your fridge. Anything missing goes on the to-buy list.";
  $("planmode").innerHTML=`<button aria-pressed="${!!S.plan}" id="plt">${I("cal")}Plan several days</button>`;
  $("plt").onclick=()=>{S.plan=!S.plan;save();draw();if(S.plan)requestAnimationFrame(()=>$("planx").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"}))};
  $("planx").hidden=!S.plan;GEN.bakeOnly=!!S.bake;
  $("ah").textContent=S.plan?"Spin plans your days with generated meals. Whisk builds every meal as a new mix of two saved recipes.":"Spin picks a saved recipe. Whisk invents a new one from two of them.";
  $("dn").textContent=S.days+(S.days>1?" days":" day");
  $("diet").innerHTML=DIETS.map(d=>`<button data-d="${d[0]}" aria-pressed="${!!S.diet[d[0]]}">${I(d[2])}${d[1]}</button>`).join("");
  $("diet").querySelectorAll("button").forEach(b=>b.onclick=()=>{const k=b.dataset.d;S.diet[k]=!S.diet[k];if(k==="vegan"&&S.diet.vegan)S.diet.veg=true;save();draw()});
  $("u1").innerHTML=[["metric","Metric (grams)"],["us","US (cups, oz, lb)"]].map(u=>`<button data-u="${u[0]}" aria-pressed="${S.units===u[0]}">${u[1]}</button>`).join("");
  $("u1").querySelectorAll("button").forEach(b=>b.onclick=()=>{S.units=b.dataset.u;save();draw();rerender()});
  $("u2").innerHTML=[["C","°C"],["F","°F"]].map(u=>`<button data-tp="${u[0]}" aria-pressed="${S.temp===u[0]}">${u[1]}</button>`).join("");
  $("u2").querySelectorAll("button").forEach(b=>b.onclick=()=>{S.temp=b.dataset.tp;save();draw();rerender()});
}
function rerender(){if(current)show(current,$("note").textContent);if(lastPlan)renderPlan(...lastPlan)}
function canonicalItem(v,allowLeft=false){
  const ids=K.match(v);const id=ids.find(x=>K.ING[x]&&(allowLeft||!isLeftId(x)))||ids[0];
  if(id&&K.ING[id]&&(allowLeft||!isLeftId(id)))return K.label(id).toLowerCase();
  return String(v).replace(/,/g,"").trim().toLowerCase();
}
function tidy(v){const ids=K.match(v),id=ids.find(x=>K.ING[x]&&!isLeftId(x));const t=String(v).trim().toLowerCase();return id&&K.norm(K.label(id))===K.norm(t)?K.label(id).toLowerCase():t}
function alreadyHas(list,v){const ids=K.match(v);return list.some(x=>{const old=K.match(x);return ids.length&&old.some(id=>ids.includes(id))||K.norm(x)===K.norm(v)});}
function addItem(value){const raw=(value===undefined?$("add").value:value).replace(/[^\p{L}\s'’-]/gu,"").replace(/\s+/g," ").trim().toLowerCase();
  if(raw&&K.match(raw).some(isLeftId)){$("note").textContent="Add cooked leftovers under “Use leftovers” instead of the regular fridge list; they are available for matching recipes but never treated as groceries.";$("add").value="";return;}
  const v=canonicalItem(raw,false);if(v&&!alreadyHas(S.pantry,v))S.pantry.push(v);$("add").value="";hideSuggest("add-suggest");save();draw()}
function addStaple(value){const raw=(value===undefined?$("sadd").value:value).replace(/[^\p{L}\s'’-]/gu,"").replace(/\s+/g," ").trim().toLowerCase();
  if(raw&&K.match(raw).some(isLeftId)){$("note").textContent="Cooked leftovers belong under “Use leftovers”, not in kitchen staples.";$("sadd").value="";return;}
  const v=canonicalItem(raw,false);if(v&&!alreadyHas(S.staples,v))S.staples.push(v);$("sadd").value="";hideSuggest("sadd-suggest");save();draw()}
function addLeftover(value){const raw=(value===undefined?$("ladd").value:value).replace(/[^\p{L}\s'’-]/gu,"").replace(/\s+/g," ").trim().toLowerCase();if(!raw)return;
  const ids=K.match(raw),direct=ids.find(isLeftId),q=K.norm(raw);let left=direct?K.ING[direct]:null,best=Infinity;
  // If a typed shorthand like "rice" maps to raw rice first, prefer the matching cooked-leftover catalog entry here.
  if(!left&&q.length>=2)Object.values(K.ING).filter(isLeftId).forEach(e=>[K.norm(e.name),...e.al.map(K.norm)].forEach(a=>{let score=Infinity;if(a===q)score=0;else if(a.startsWith(q))score=10+a.length-q.length;else if(q.length>=3&&a.includes(q))score=30+a.indexOf(q)+a.length-q.length;if(score<best){best=score;left=e}}));
  const v=left&&best<70||direct?left.name.toLowerCase():raw;
  if(!alreadyHas(S.leftovers,v))S.leftovers.push(v);$("ladd").value="";hideSuggest("ladd-suggest");save();clearCurrentForInventoryChange();draw()}
function hideSuggest(id){const box=$(id);if(box){box.hidden=true;box.innerHTML=""}}
function attachAutocomplete(inputId,boxId,kind,onPick,onFree){
  const input=$(inputId),box=$(boxId);let options=[],active=0,picking=false;
  const allowed=e=>kind==="left"?isLeftId(e.id):!isLeftId(e.id);
  function render(){const q=K.norm(input.value);if(!q){hideSuggest(boxId);options=[];return;}
    const ranked=[];
    Object.values(K.ING).forEach(e=>{if(!allowed(e))return;const fields=[K.norm(e.name),...e.al];let score=Infinity;
      fields.forEach(a=>{if(a.startsWith(q))score=Math.min(score,a===q?0:10+a.length-q.length);else{const at=a.indexOf(q);if(at>=0)score=Math.min(score,40+at+a.length-q.length)}});
      if(Number.isFinite(score))ranked.push({e,score});});
    options=ranked.sort((a,b)=>a.score-b.score||a.e.name.localeCompare(b.e.name,"en",{sensitivity:"base"})).slice(0,8).map(x=>x.e);active=0;
    if(!options.length){hideSuggest(boxId);return;}
    box.innerHTML=options.map((e,i)=>`<button type="button" role="option" data-id="${esc(e.id)}" aria-selected="${i===active}"><span>${esc(isLeftId(e.id)?e.name:K.label(e.id))}</span><small>${esc(K.AISLE[e.aisle]||e.aisle)}</small></button>`).join("");box.hidden=false;
    box.querySelectorAll("button").forEach((b,i)=>{b.onpointerdown=e=>{e.preventDefault();picking=true;setTimeout(()=>picking=false,600)};b.onmousedown=b.ontouchstart=e=>{picking=true;setTimeout(()=>picking=false,600)};b.onclick=()=>choose(i)});
  }
  function choose(i){const e=options[i];if(!e)return;hideSuggest(boxId);onPick(kind==="left"?e.name:K.label(e.id));}
  input.addEventListener("input",render);
  input.addEventListener("keydown",e=>{
    if(e.key==="ArrowDown"&&!box.hidden){e.preventDefault();active=Math.min(active+1,options.length-1);updateActive();}
    else if(e.key==="ArrowUp"&&!box.hidden){e.preventDefault();active=Math.max(0,active-1);updateActive();}
    else if((e.key==="Enter"||e.key===",")&&!box.hidden&&options.length){e.preventDefault();choose(active);}
    else if(e.key==="Escape"){hideSuggest(boxId);}
    else if(e.key==="Enter"||e.key===","){e.preventDefault();onFree();}
    else if(e.key==="Backspace"&&!input.value){if(kind==="fridge"&&S.pantry.length){S.pantry.pop();S.urgent=S.urgent.filter(x=>S.pantry.includes(x));save();draw();}else if(kind==="staple"&&S.staples.length){S.staples.pop();save();draw();}else if(kind==="left"&&S.leftovers.length){S.leftovers.pop();save();clearCurrentForInventoryChange();draw();}}
  });
  /* The commit is delayed a moment: re-drawing the lists on blur would replace the button being tapped and swallow its tap on phones,
     and tapping a suggestion blurs the field first on some of them. */
  input.addEventListener("blur",()=>setTimeout(()=>{if(picking)return;if(input.value.trim())onFree();hideSuggest(boxId)},250));
  function updateActive(){box.querySelectorAll("button").forEach((b,i)=>b.setAttribute("aria-selected",String(i===active)));const b=box.querySelectorAll("button")[active];if(b)b.scrollIntoView({block:"nearest"});}
  document.addEventListener("pointerdown",e=>{if(!box.contains(e.target)&&e.target!==input)hideSuggest(boxId)});
}
{const fix=l=>{const o=[];l.forEach(x=>{const v=tidy(x);if(!o.some(y=>K.norm(y)===K.norm(v)))o.push(v)});return o};
  const nice=new Map(S.pantry.map(x=>[x,tidy(x)]));S.pantry=fix(S.pantry);S.staples=fix(S.staples);S.urgent=S.urgent.map(x=>nice.get(x)||x).filter(x=>S.pantry.includes(x));save()}
attachAutocomplete("add","add-suggest","fridge",v=>addItem(v),()=>addItem());
attachAutocomplete("sadd","sadd-suggest","staple",v=>addStaple(v),()=>addStaple());
attachAutocomplete("ladd","ladd-suggest","left",v=>addLeftover(v),()=>addLeftover());
const dec=()=>{S.n=Math.max(1,S.n-1);save();draw()},inc=()=>{S.n=Math.min(12,S.n+1);save();draw()};
$("minus").onclick=dec;$("plus").onclick=inc;
$("cuisine").onchange=e=>{S.cuisine=e.target.value;save()};

