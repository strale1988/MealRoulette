/* js/ui/app-extras.js: Later additions that hook into the code above: pizza as a Big plate, tick-off lists, Whisk wording, tab history, Cook headline. */
/* ---- pizzas can come up as a Big plate: now and then a Spin, "Only what I have" spin or planned day returns a pizza classic ---- */
(function(){
const FROM={Italian:"Italy"};
const okHere=()=>typeof PZ!=="undefined"&&PZ.recipes&&!S.quick; // a pizza needs hours of dough, so never in Quick mode
// strict = "Only what I have": only pizzas where nothing has to be bought
function cands(strict,m){
  const rt=ratings(),base={diet:{...S.diet},fridge:fridgeIds(),urgent:new Set(S.urgent.flatMap(x=>K.match(x))),count:Math.max(1,pzCount()),ferm:"quick",basic:S.basic},out=[];
  [S.pz.fresh,!S.pz.fresh].slice(0,strict?2:1).forEach(fresh=>PZ.recipes.filter(x=>x.cat!=="sweet"&&(!S.cuisine||FROM[S.cuisine]===x.from)).forEach(x=>{
    const p=PZ.resolve(x,{...base,fresh});if(!p||out.some(y=>y.title===p.title))return;
    if(strict&&p.ing.some(missing))return;
    if(recent(p.title)||(rt[p.title]&&rt[p.title].v<0&&Date.now()-rt[p.title].t<28*864e5))return;
    out.push(p)}));
  const sc=x=>x.urg*4+x.hit*1.5-x.ing.filter(missing).length*1.2+Math.random()*3+(rt[x.title]&&rt[x.title].v>0?2.5:0);
  return out.sort((a,b)=>sc(b)-sc(a));
}
function asMeal(p){ // one shape for both the Cook card and a planned day
  const steps=[];p.sections.forEach(sec=>sec.steps.forEach((t,i)=>steps.push((i===0?sec.h.replace(/\s*\(.*$/,"")+": ":"")+t)));
  const h=(PZ.modes[p.ferm]||{}).h||3,ing=[];
  p.ing.forEach(i=>{const e=ing.find(x=>x.id===i.id&&x.u===i.u&&typeof i.a==="number");if(e){e.a+=i.a;e.txt=fmt(e.a,e.u||"g")}else ing.push({...i})}); // one line per ingredient
  const desc=["The dough needs about "+h+" hours before baking; for a longer, tastier rise use Pizza night.",p.desc].filter(Boolean).join(" ");
  return{title:p.title,min:h*60+30,steps,ing,cuisine:p.from||"Pizza",pizza:true,pk:"",ck:"",desc,note:desc};
}
const card=p=>({...asMeal(p),n:S.n});
// single spin
const _spin=spin;
spin=function(){
  try{if(okHere()&&isMain(S.meal)&&Math.random()<.12){const c=cands(false);if(c.length){markGen(c[0].title);return show(card(c[0]),"")}}}catch(e){console.error(e)}
  return _spin.apply(this,arguments);
};
// "Only what I have"
const _go=go;
go=function(){
  try{if(S.strict&&items().length&&okHere()&&isMain(S.meal)&&Math.random()<.12){const c=cands(true);if(c.length){markGen(c[0].title);return show(card(c[0]),"")}}}catch(e){console.error(e)}
  return _go.apply(this,arguments);
};
// planned days: at most one pizza per plan, never over a meal that uses your use-first items or leftovers
const _bm=bestMeal,PZT=()=>new Set((PZ.recipes||[]).map(x=>x.name));
bestMeal=function(m,it,cu,dd,mode,pc,not){
  const best=_bm.apply(this,arguments);
  try{
    if(!okHere()||normM(m)!=="Main"||!best||Math.random()>.15)return best;
    const names=PZT();if([...PT].some(t=>names.has(t)))return best;
    const urg=(dd&&Array.isArray(dd.urgent)?dd.urgent:S.urgent).filter(u=>it.some(x=>K.match(x).some(id=>K.match(u).includes(id))));
    if(priorityUseCount(best,urg)>0||best.ing.some(isLeftIng))return best;
    const c=cands(false).filter(x=>x.title!==not&&!PT.has(x.title));
    if(c.length)return planPizza(c[0],it);
  }catch(e){console.error(e)}
  return best;
};
function planPizza(p,it){const g=asMeal(p);const F=new Set(it.flatMap(x=>K.match(x)));g.ing.forEach(i=>{i.have=F.has(i.id)||i.id==="water"});return g}
})();
/* ---- tick-off lists work on every card: Cook, Pizza night, Ferment, plans and saved recipes.
   One delegated handler covers any method step or ingredient line that has no handler of its own. ---- */
(function(){
const SEL=".card ol:not(.fmtl)>li,.card ul.ing>li";
const flip=li=>li.classList.toggle("done");
document.addEventListener("click",e=>{
  const li=e.target.closest&&e.target.closest(SEL);
  if(!li||li.onclick||e.target.closest("a,button,input,textarea,select")||li.closest(".cookov"))return;
  flip(li);
});
document.addEventListener("keydown",e=>{
  if(e.key!==" "&&e.key!=="Enter")return;
  const li=e.target.matches&&e.target.matches(SEL)?e.target:null;
  if(!li||li.onclick||li.closest(".cookov"))return;
  e.preventDefault();flip(li);
});
let q=0;const tidy=()=>{q=0;document.querySelectorAll(".card ol:not(.fmtl)>li:not([tabindex]),.card ul.ing>li:not([tabindex])").forEach(li=>li.tabIndex=0)};
new MutationObserver(()=>{if(!q)q=requestAnimationFrame(tidy)}).observe(document.body,{childList:true,subtree:true});
tidy();
})();
/* ---- a whisked result says "Whisk again" (wand icon) instead of "Spin again", on Cook and Pizza night cards ---- */
(function(){
const _t=window.__tidyRow;if(!_t)return;
window.__tidyRow=function(row,icon){
  const r=_t.apply(this,arguments);
  try{const a=row&&row.querySelector(".spinagain");if(a){row.querySelectorAll(".shakehint").forEach(x=>x.remove());
    if("DeviceMotionEvent" in window&&matchMedia("(hover:none)").matches&&JSON.parse(localStorage.getItem("mr-shake")||"null")===1){const p=document.createElement("p");p.className="shakehint";p.textContent="Or shake your phone";a.after(p)}
    if(document.documentElement.classList.contains("homeres")&&matchMedia("(hover:hover)").matches){const p=document.createElement("p");p.className="shakehint kb";p.innerHTML="Press <kbd>S</kbd> for another, <kbd>Esc</kbd> to close";a.after(p)}}}catch(e){}
  try{const a=row&&row.querySelector(".spinagain"),c=row&&row.closest(".card");
    if(a&&c&&c.querySelector(".meta use[href='#i-wand']"))a.innerHTML=I("wand")+"Whisk again"}catch(e){console.error(e)}
  return r;
};
})();

/* ---- Back goes through the tabs too: every tab change the user makes is one history step, so the phone's Back returns to the previous tab before it ever asks to exit ---- */
/* ---- Cook headline: greets you by the time of day and the day of the week. Tap it for another line; the small button picks the meal that fits the hour. ---- */
(function(){
const h=document.querySelector("#tab-cook .hl"),sub=h&&h.nextElementSibling;if(!h||!sub||sub.tagName!=="P")return;
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
const slotOf=d=>{const H=d.getHours();return H<5?"late":H<10?"morning":H<12?"brunch":H<15?"lunch":H<18?"afternoon":H<22?"dinner":"late"};
const P={
 morning:{meal:"Breakfast",nm:"Breakfast",h:["What's for breakfast?","Good morning. What smells good?","Rise and dine: what are we eating?","Coffee on? Now the food."],s:["Eggs, oats or something wild: spin and see.","Start the day on a tasty note.","Pick a mood, then spin.","Big breakfast or quick bite? You decide."]},
 brunch:{meal:"Breakfast",nm:"Breakfast",h:["Brunch, anyone?","Too late for breakfast, too early for lunch?","What's for brunch?"],s:["The best meal of the day has no rules.","Sweet, savoury or both? Spin and see.","Pick a mood, then spin."]},
 lunch:{meal:"Main",nm:"a big plate",h:["What's for lunch?","Lunch break: what are we eating?","Hungry yet? Let's fix that."],s:["Something quick, something comforting: your call.","Pick a mood, then spin.","Step away from the desk, the food is waiting."]},
 afternoon:{meal:"Snack",nm:"a snack",h:["Snack o'clock?","Peckish? Let's fix that.","A little something for the afternoon?"],s:["Small bites, big smiles.","Dinner is still a while away: spin a snack.","Pick a mood, then spin."]},
 dinner:{meal:"Main",nm:"a big plate",h:["What are we eating tonight?","Dinner time: what's the plan?","Who's cooking tonight?","What's for dinner?"],s:["Pick a mood, then spin.","Let the wheel decide so nobody has to.","Cosy, quick or fancy? Spin and see.","Tonight's dinner is one spin away."]},
 late:{meal:"Snack",nm:"a snack",h:["Midnight snack?","Still up? Let's find something small.","Late-night cravings?"],s:["Something small, something tasty.","Quiet kitchen, perfect time for a snack.","Pick a mood, then spin."]}
};
const DAY={ // extra headlines for the evening and lunch, by day of the week
 5:["It's Friday: treat yourself tonight?","Friday night: something good?"],6:["Saturday cooking: go big?","Weekend feast time?"],0:["Sunday dinner: slow and cosy?","Sunday supper, anyone?"],1:["Monday needs a good dinner.","Make Monday taste better?"]};
let last="",slot="",idx={};
const pickFrom=(a,k)=>{if(a.length<2)return a[0];let i;do i=Math.floor(Math.random()*a.length);while(i===idx[k]);idx[k]=i;return a[i]};
const render=anim=>{
  const d=new Date(),sl=slotOf(d),p=P[sl],day=DAY[d.getDay()];slot=sl;
  const hs=p.h.concat(sl==="dinner"&&day?day.concat(day):[]);
  let t=pickFrom(hs,"h"+sl);if(t===last&&hs.length>1)t=pickFrom(hs,"h"+sl);last=t;
  h.textContent=t;
  const on=typeof S!=="undefined"&&S.meal===p.meal;
  sub.innerHTML=esc(pickFrom(p.s,"s"+sl))+(on?"":` <button type="button" class="hchip">Try ${esc(p.nm)}</button>`);
  const b=sub.querySelector(".hchip");if(b)b.onclick=()=>{const t=document.querySelector(`#meals [data-m="${p.meal}"]`);if(t)t.click();render()};
  if(anim&&!rm){h.classList.remove("hlpop");void h.offsetWidth;h.classList.add("hlpop")}
};
h.tabIndex=0;h.setAttribute("role","button");h.title="Tap for another line";h.style.cursor="pointer";
h.onclick=()=>render(true);h.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();render(true)}};
document.getElementById("meals").addEventListener("click",()=>setTimeout(()=>{const p=P[slotOf(new Date())],on=S.meal===p.meal,b=sub.querySelector(".hchip");if(on&&b)b.remove();else if(!on&&!b)render()},0));
const st=document.createElement("style");st.textContent=".hlpop{animation:hlpop .45s cubic-bezier(.2,1.3,.4,1)}@keyframes hlpop{0%{transform:scale(.94) rotate(-1deg);opacity:.4}100%{transform:none;opacity:1}}.hchip{font:inherit;font-size:13px;font-weight:800;color:var(--acct,var(--acc2));background:transparent;border:1.5px solid currentColor;border-radius:999px;padding:1px 11px;margin-left:6px;cursor:pointer;white-space:nowrap;vertical-align:middle}.hchip:hover{background:var(--soft)}#tab-cook .hl:focus-visible{outline:2px solid var(--ink);outline-offset:4px;border-radius:8px}@media (prefers-reduced-motion:reduce){.hlpop{animation:none}}";
document.head.appendChild(st);
render();
setInterval(()=>{if(!document.hidden&&slotOf(new Date())!==slot)render(true)},60000); // the hour changed: new greeting
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&slotOf(new Date())!==slot)render(true)});
})();
(function(){const N=window.__nav;if(!N||!N.on)return;const _st=setTab;let restoring=false;
  setTab=function(t){const prev=tab,r=_st.apply(this,arguments);
    if(!restoring&&tab!==prev&&!document.querySelector(".splash:not(.out)")&&!(window.__home&&window.__home.from))N.tabPush(prev); // wheel flows manage their own Back (the result screen closes back to the wheel)
    return r};
  N.onTabBack=prev=>{restoring=true;try{setTab(prev)}finally{restoring=false}};
})();
