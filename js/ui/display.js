/* js/ui/display.js: Showing a recipe card, its origin line, favourites. */
/* ---------- display ---------- */
/* where a meal comes from: its cuisine, or "Mixed" when it has none or was whisked from several */
const hasKids=()=>!!(S.house&&S.house.kids&&S.house.kids.length);
function originOf(r){
  if(r.remix)return"Mixed";
  const rec=r.rid&&K.recipes.find(x=>x.id===r.rid),c=r.cuisine||(rec&&rec.cuisine)||(r.built&&Object.keys(GEN.cuisines).find(k=>r.title.startsWith(k+" ")))||"";
  return c||"Mixed";
}
function show(r,msg){
  current=r;lastPlan=null;$("note").textContent=msg||"";if(r&&r.built)markGen(r.title);
  if(!r){$("out").innerHTML="";return}
  const ic=(MEALS.find(m=>m[0]===S.meal)||[])[1]||"dice";
  $("out").innerHTML=`<article class="card"><div class="hero"><div class="ic">${I(ic)}</div><div class="ht"><h2>${esc(r.title)}</h2><p class="orig">${I("globe")}${esc(originOf(r))}</p></div></div><div class="body">
  <div class="meta"><span>${I("clock")}${r.min} min</span><span>${I("users")}${r.n} ${hasKids()?(r.n>1?"portions":"portion"):(r.n>1?"people":"person")}</span><span>${I(ic)}${ML(S.meal)}</span>${r.remix?`<span>${I("wand")}Whisked</span>`:""}${(()=>{const x=r.ing.length&&r.ing.every(i=>i.id)?K.nutri(r.ing,r.n):GEN.nutri(r.ing,r.n);return x.kcal?`<span title="Rough estimate">${I("flame")}≈${x.kcal} kcal · ${x.p} g protein each</span>`:""})()}</div>
  ${r.desc?`<p class="desc">${esc(cv(r.desc))}</p>`:""}${callout(r)}
  <div class="split"><div><h3>${I("list")}Ingredients <small style="text-transform:none;letter-spacing:0;color:var(--mute)">(tap to tick off)</small></h3>
  ${ingBlock(r.ing)}</div>
  <div><h3>${I("chef")}Method</h3><ol>${r.steps.map(s=>`<li><span>${esc(cv(s))}</span></li>`).join("")}</ol></div></div>
  <div class="row"><button id="save">${I("heart")}Save</button><button id="shop">${I("cart")}Copy list</button><button id="again">Again</button></div></div></article>`;
  $("out").querySelectorAll(".ing li").forEach(li=>li.onclick=()=>li.classList.toggle("done"));
  $("save").onclick=()=>{const f=store("mr-favs2")||[];if(!f.some(x=>x.title===r.title)){f.unshift({...r,meal:S.meal});store("mr-favs2",f.slice(0,40))}favs();$("save").innerHTML=I("heart")+"Saved"};
  $("shop").onclick=async()=>{const mm=r.ing.filter(missing),l=(mm.length?mm:r.ing).map(i=>"• "+i.name+" – "+Q(i)).join("\n");try{await navigator.clipboard.writeText(l);$("shop").innerHTML=I("cart")+"Copied"}catch(e){$("note").textContent=l}};
  $("again").onclick=()=>run(r.remix?"remix":"spin",1);
}
/* open a saved item: scroll to where the card starts (below the sticky bar), not to the top of the page */
function toCard(id){requestAnimationFrame(()=>{const el=document.getElementById(id);if(!el)return;const bar=document.querySelector(".bar"),y=el.getBoundingClientRect().top+scrollY-(bar?bar.offsetHeight:0)-12;scrollTo({top:Math.max(0,y),behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"})})}
function favs(){
  const f=store("mr-favs2")||[];
  $("fav").innerHTML=f.length?`<h3>${I("heart")}Saved</h3>`+f.map((r,i)=>`<button data-i="${i}">${I("heart")}${esc(r.title)}</button>`).join(""):"";
  $("fav").querySelectorAll("button").forEach(b=>b.onclick=()=>{const r=f[+b.dataset.i];S.meal=normM(r.meal)||S.meal;S.pm[S.meal]=true;save();draw();show(r,"");toCard("out")});
}
function run(what,single,instant){
  [["add",addItem],["sadd",addStaple],["ladd",addLeftover]].forEach(([id,fn])=>{if($(id).value.trim())fn()}); // text typed but not yet confirmed still counts
  const pl=!!S.plan&&!single,rl=$("reel"),rt=$("rt"),o=$("out"),nt=$("note");rl.querySelector("small").textContent=pl?"Planning your days…":"Picking something tasty…";
  const btns=document.querySelectorAll(".btns button"),rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
  btns.forEach(b=>b.disabled=true);o.innerHTML="";nt.textContent="";
  const names=RECIPES.map(r=>r.title).concat(Object.keys(GEN.cuisines).map(c=>c+" "+rnd(["chicken bowl","stir-fry","curry","traybake","stew"])));
  let built=false;const build=()=>{if(built)return;built=true;if(!pl&&!single){const active=selectedMeals();if(active.length)S.meal=rnd(active);save();}pl?plan(what==="remix"?"remix":""):what==="remix"?invent():go()};
  const done=()=>{build();o.style.visibility="";rl.classList.remove("on");btns.forEach(b=>b.disabled=false);
    const c=o.firstElementChild||o;c.scrollIntoView({behavior:"smooth",block:"start"});if(!instant)__resultReady(o.querySelector(".card h2"))};
  if(rm||instant||mrNoSpin())return done();
  rl.classList.add("on");rl.scrollIntoView({behavior:"smooth",block:"center"});
  /* the last name on the reel is the recipe that opens: it is built behind the reel, then its title is shown */
  mrSpinNames(rt,names,done,pl?null:()=>{o.style.visibility="hidden";build();const h=o.querySelector(".card h2");return h&&h.textContent.trim()});
}
$("dminus").onclick=()=>{S.days=Math.max(1,S.days-1);save();draw()};$("dplus").onclick=()=>{S.days=Math.min(7,S.days+1);save();draw()};
