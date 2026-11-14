/* js/ui/results.js: Servings and ratings on a recipe, the phone result screen, household panel, My kitchen summary tiles. */
/* servings for made-up (generated / whisked) recipes: scale every amount from the original, so repeated +/- never drifts */
function scaleMade(r,n){
  const b=r.base||{n:r.n,ing:r.ing,steps:r.steps,desc:r.desc},k=n/b.n;
  const ing=b.ing.map(i=>typeof i.a==="number"?{...i,a:i.a*k,txt:fmt(i.a*k,i.u||"g")}:{...i});
  const steps=b.steps.map(t=>t.replace(/(\d+(?:[.,]\d+)?)(\s?)(kg|ml|g|l)\b/g,(m,v,sp,u)=>{const x=parseFloat(v.replace(",","."))*(u==="kg"||u==="l"?1000:1)*k;return fmt(x,u==="kg"||u==="g"?"g":"ml")}));
  const desc=typeof b.desc==="string"?b.desc.replace(/for \d+ (people|person)/,"for "+n+(n>1?" people":" person")):b.desc;
  const o={...r,n,ing,steps};if(desc!==undefined)o.desc=desc;
  Object.defineProperty(o,"base",{value:b,enumerable:false,writable:true,configurable:true});return o;
}
/* ---- on every recipe: change the servings, and rate it (thumbs steer future spins) ---- */
let SERV=null;
document.addEventListener("click",e=>{if(!SERV||e.target.closest&&e.target.closest(".pchip"))return;SERV=null;document.querySelectorAll(".pchip.open").forEach(c=>{c.classList.remove("open");c.setAttribute("aria-expanded","false");c.querySelectorAll(".pm").forEach(b=>b.tabIndex=-1)})});
(function(){
const _sh=show;
show=function(r,m){_sh(r,m);if(!r)return;try{
  const card=$("out").querySelector(".card"),row=card&&card.querySelector(".row");if(!row||card.classList.contains("plan"))return;
  // servings
  const rec=r.rid&&K.recipes.find(x=>x.id===r.rid),meta=card.querySelector(".meta");
  if(meta){
    const chip=[...meta.children].find(x=>x.querySelector('use[href="#i-users"]'));
    if(chip){
      const lab=chip.innerHTML;
      chip.className="pchip";chip.tabIndex=0;chip.setAttribute("role","button");chip.title="Change servings";
      chip.innerHTML=`<button type="button" class="pm" data-d="-1" aria-label="Fewer servings" tabindex="-1">${I("minus")}</button><em>${lab}</em><button type="button" class="pm" data-d="1" aria-label="More servings" tabindex="-1">${I("plus")}</button>`;
      const open=v=>{chip.classList.toggle("open",v);chip.setAttribute("aria-expanded",String(v));chip.querySelectorAll(".pm").forEach(b=>b.tabIndex=v?0:-1);if(!v)SERV=null};
      chip.setAttribute("aria-expanded","false");
      if(SERV&&SERV.t===r.title){open(true);SERV.t=r.title;if(SERV.f){const f=chip.querySelector('.pm[data-d="'+SERV.f+'"]');f&&f.focus({preventScroll:true})}}
      chip.onclick=e=>{if(e.target.closest(".pm"))return;e.stopPropagation();const v=!chip.classList.contains("open");open(v);if(v)SERV={t:r.title}};
      chip.onkeydown=e=>{if(e.target!==chip)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();chip.click()}else if(e.key==="Escape")open(false)};
      chip.querySelectorAll(".pm").forEach(b=>b.onclick=e=>{e.stopPropagation();const n=Math.min(24,Math.max(1,r.n+ +b.dataset.d));if(n===r.n)return;SERV={t:r.title,f:b.dataset.d};
        if(rec){const F=fridgeIds(),U=new Set([...S.urgent.flatMap(x=>K.match(x)),...[...F].filter(isLeftId)]),x=K.resolve(rec,n,{fridge:F,basic:S.basic,urgent:U});
          return show({...r,n,ing:x.ing,steps:x.steps},$("note").textContent)}
        show(scaleMade(r,n),$("note").textContent)});
    }
  }
  // thumbs
  const cur=ratings()[r.title],mk=(v,ic,lbl)=>{const b=document.createElement("button");b.type="button";b.className="thumb";b.dataset.v=v;b.setAttribute("aria-pressed",String(!!cur&&cur.v===v));b.innerHTML=ic+lbl;b.title=v>0?"Show me more like this":"Show me this less";return b};
  const up=mk(1,I("thumbup"),"Like"),dn=mk(-1,I("thumbdown"),"Not for me");row.append(up,dn);
  const rate=(v,b)=>{const o=ratings(),on=!(o[r.title]&&o[r.title].v===v);if(on)o[r.title]={v,t:Date.now()};else delete o[r.title];store("mr-rate",o);
    up.setAttribute("aria-pressed",String(on&&v>0));dn.setAttribute("aria-pressed",String(on&&v<0));navigator.vibrate&&navigator.vibrate(12);
    $("note").textContent=!on?"Rating removed.":v>0?"Noted. You'll see more like this.":"Noted. You'll see this one less.";
    if(on&&v<0&&$("again")){setTimeout(()=>{if(document.body.contains(dn)&&dn.getAttribute("aria-pressed")==="true")$("again").click()},900)}};
  up.onclick=()=>rate(1,up);dn.onclick=()=>rate(-1,dn);
}catch(e){console.error(e)}};
})();
/* ingredient boxes take words only: letters (any language), spaces, hyphens and apostrophes. No digits or symbols. */
(function(){
const IDS=["add","sadd","ladd"],BAD=/[^\p{L}\s'’-]/gu,isBox=t=>t&&t.id&&IDS.includes(t.id);
IDS.forEach(id=>{const el=$(id);if(el){el.maxLength=40;el.setAttribute("inputmode","text");el.setAttribute("autocapitalize","none");el.setAttribute("spellcheck","false")}});
document.addEventListener("beforeinput",e=>{if(isBox(e.target)&&typeof e.data==="string"&&e.data.search(BAD)>=0&&e.inputType==="insertText")e.preventDefault()},true);
document.addEventListener("input",e=>{const t=e.target;if(!isBox(t))return;const v=t.value;if(v.search(BAD)<0)return;const pos=t.selectionStart||0,keep=v.slice(0,pos).replace(BAD,"").length;t.value=v.replace(BAD,"");try{t.setSelectionRange(keep,keep)}catch(_){}},true); // paste and autofill
})();
/* ---- result screen (phones/tablets): spinning or opening a recipe replaces the filters; Back returns ---- */
(function(){
const cook=$("tab-cook"),small=()=>matchMedia("(max-width:959px)").matches;let origin=null;
const inRes=()=>cook.classList.contains("resmode");
function enter(){
  if(!inRes()){cook.classList.add("resmode");if(small()){try{history.pushState({mrres:1},"")}catch(e){}}scrollTo({top:0})}
  if(tab!=="cook"){origin=origin||tab;setTab("cook")}
}
function leave(){
  if(!inRes())return;const H=window.__home;if(H&&H.from){H.from=false;H.show(true)} // cover the app first, so the filters never flash
  cook.classList.remove("resmode");const to=origin;origin=null;
  if(to&&to!=="cook")setTab(to);scrollTo({top:0});
}
function back(){if(history.state&&history.state.mrres){history.back()}else leave()}
window.__leaveCook=()=>{if(!inRes())return;cook.classList.remove("resmode");origin=null;window.__nav&&__nav.drop()};
addEventListener("popstate",()=>{if(inRes())leave()});
const _run=run;run=function(){enter();return _run.apply(this,arguments)};
const _sw=show;show=function(r,m){if(r)enter();return _sw(r,m)};
const _rp2=renderPlan;renderPlan=function(){enter();return _rp2.apply(this,arguments)};
// the Cook tab itself is "home": tapping it while a result is open goes back
document.querySelector('#tabs [data-t="cook"]').addEventListener("click",()=>{if(inRes()&&tab==="cook"){if(window.__home)window.__home.from=false;back()}});
// a Back button at the end of every recipe card (phones/tablets)
const XB='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const addX=c=>{const h=c&&c.querySelector(".hero");if(h&&!h.querySelector(".heroback")){const b=document.createElement("button");b.type="button";b.className="heroback";b.setAttribute("aria-label","Back");b.title="Back";b.innerHTML=XB;b.onclick=back;h.append(b)}};
const _sh2=show;show=function(r,m){_sh2(r,m);if(!r)return;try{addX($("out").querySelector(".card"))}catch(e){console.error(e)}};
const _rp3=renderPlan;renderPlan=function(){const o=_rp3.apply(this,arguments);try{addX($("out").querySelector(".card.plan"))}catch(e){console.error(e)}return o};
/* ---- household: adults + kids (with ages) set how many portions the Cook page starts with ---- */
const kidW=hhKid; // share of an adult portion by age (defined once near the top, also used by Pizza night)
function houseRender(){
  const h=S.house,w=h.adults+h.kids.reduce((t,a)=>t+kidW(a),0),por=Math.min(12,Math.max(1,Math.round(w)));
  $("ha").textContent=h.adults;$("hk").textContent=h.kids.length;
  {const cols=["#ffc63d","#ff9b82","#7fd1a6","#b9a2f0","#8ecae6","#f4a261"],face=(sz,c)=>`<svg class="hface" viewBox="0 0 40 40" style="width:${sz}px;height:${sz}px"><circle cx="20" cy="20" r="17" fill="${c}" stroke="currentColor" stroke-width="2.5"/><circle cx="14" cy="17.5" r="2.1" fill="currentColor"/><circle cx="26" cy="17.5" r="2.1" fill="currentColor"/><path d="M13 25q7 6 14 0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;let k=0;
  $("hfaces").innerHTML=Array.from({length:h.adults},()=>face(46,cols[k++%cols.length])).join("")+h.kids.map(a=>face(Math.round(22+24*hhKid(a)),cols[k++%cols.length])).join("");}
  $("hages").innerHTML=h.kids.map((a,i)=>`<label>Kid ${i+1}<select data-k="${i}" aria-label="Age of kid ${i+1}">${Array.from({length:18},(_,y)=>`<option value="${y}"${y===a?" selected":""}>${y===0?"under 1":y+(y===1?" year":" years")}</option>`).join("")}</select></label>`).join("");
  $("hages").querySelectorAll("select").forEach(el=>el.onchange=()=>{h.kids[+el.dataset.k]=+el.value;houseSet()});
  $("hsum").textContent=`${h.adults} ${h.adults===1?"adult":"adults"}${h.kids.length?` + ${h.kids.length} ${h.kids.length===1?"kid":"kids"}`:""} cook for about ${por} ${por===1?"portion":"portions"}.`;
  return por;
}
function houseSet(){const por=houseRender();S.n=por;save();draw()}
{
  S.house=S.house&&Array.isArray(S.house.kids)?S.house:{adults:Math.max(1,S.n||2),kids:[]};
  const h=S.house;houseRender();
  $("ha-").onclick=()=>{const min=h.kids.length?0:1;if(h.adults>min){h.adults--;houseSet()}};
  $("ha+").onclick=()=>{if(h.adults+h.kids.length<12){h.adults++;houseSet()}};
  $("hk-").onclick=()=>{if(h.kids.length){h.kids.pop();if(!h.adults&&!h.kids.length)h.adults=1;houseSet()}};
  $("hk+").onclick=()=>{if(h.adults+h.kids.length<12){h.kids.push(8);houseSet()}};
}
/* saved recipes and plans live in My kitchen */
const grid=document.querySelector("#kz-saved .kgrid");
if(grid&&$("fav")&&$("plans")){
  const sec=document.createElement("section");sec.className="panel";sec.id="savedpanel";
  sec.innerHTML=`<div class="lab"><svg class="i"><use href="#i-heart"/></svg>Saved recipes and plans</div><p class="hint" id="savedempty">Nothing saved yet. Tap Save on a recipe or plan and it shows up here.</p>`;
  sec.append($("fav"),$("plans"));grid.prepend(sec);
  const upd=()=>{$("savedempty").hidden=!!($("fav").children.length||$("plans").children.length)};
  const _f=favs;favs=function(){_f();upd()};const _p=plansUI;plansUI=function(){_p();upd()};upd();
}
})();
/* ---- Cook recipe card: standard button order, Spin again with the chef icon on the right ---- */
{const _sc=show;show=function(r,m){_sc(r,m);if(!r)return;try{const c=$("out").querySelector(".card"),row=c&&c.querySelector(".row");if(row&&$("again"))window.__tidyRow(row,"chef")}catch(e){console.error(e)}}}
/* ---- result screen for Pizza night (Build a pizza), same rules as Cook on phones/tablets:
   a pizza replaces the filters, the X on the green bar and the Back button return, Back never leaves the app ---- */
(function(){
const small=()=>matchMedia("(max-width:959px)").matches,tabEl=$("tab-pizza");let on=false;
/* a pizza from the start wheel must show the Build a pizza result (Spin again + close button). If the tab was last left on the Dough lab, that section
   would show instead (a dough card has neither), so switch to Build for the result and put the person's section back when it closes */
let prevSec=null;
const toBuild=()=>{if(S.pz.sec!=="build"){prevSec=S.pz.sec||"dough";pzSection("build")}};
const restoreSec=()=>{if(prevSec){S.pz.sec=prevSec;prevSec=null;save()}};
const XB='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function enter(){if(on)return;on=true;tabEl.classList.add("resmode");if(small()){try{history.pushState({mrres:1},"")}catch(e){}}scrollTo({top:0})}
function leave(){if(!on)return;on=false;restoreSec();const H=window.__home;if(H&&H.from){H.from=false;H.show(true);setTab("cook")}tabEl.classList.remove("resmode");pzShow(null);scrollTo({top:0})}
window.__leavePizza=()=>{if(on){on=false;restoreSec();tabEl.classList.remove("resmode");pzShow(null);window.__nav&&__nav.drop()}};
function back(){if(history.state&&history.state.mrres)history.back();else leave()}
addEventListener("popstate",()=>{if(on)leave()});
const _pr=pzRun;pzRun=function(w,i){toBuild();enter();return _pr(w,i)}; // the spinning reel already shows on the result screen, like Cook
const _ps=pzShow;pzShow=function(r,m){
  if(r)enter();
  else if(m&&on){on=false;prevSec=null;tabEl.classList.remove("resmode");if(small()&&history.state&&history.state.mrres)history.back()} // nothing to show: back to the filters, keep the message
  _ps(r,m);if(!r)return;
  try{const row=$("pzout").querySelector(".card .row");if(row&&!r.dough){window.__thumbs(row,r.title,{},()=>{const a=row.querySelector(".pzagain");if(a)a.click()});window.__tidyRow(row,"pizza")}}catch(e){console.error(e)}
  try{const h=$("pzout").querySelector(".hero");if(h&&!h.querySelector(".heroback")){const b=document.createElement("button");b.type="button";b.className="heroback";b.setAttribute("aria-label","Back");b.title="Back";b.innerHTML=XB;b.onclick=back;h.append(b)}}catch(e){console.error(e)}};
document.querySelector('#tabs [data-t="craft"]').addEventListener("click",()=>{if(on&&small())back()});
})();
/* ---- My kitchen: live summary tiles that also jump to their section ---- */
(function(){
const kit=$("tab-kit");if(!kit)return;
const pl=(n,one,many)=>n===1?one:many;
function kitSum(){
  try{
    const por=hhPortions(),st=(S.staples||[]).length,dn=Object.values(S.diet||{}).filter(Boolean).length,sv=(store("mr-favs2")||[]).length+(store("mr-plans2")||[]).length;
    $("kt-table").textContent=por;$("kl-table").textContent=pl(por,"portion at the table","portions at the table");
    $("kt-pantry").textContent=st;$("kl-pantry").textContent=pl(st,"staple at home","staples at home");
    $("kt-diet").textContent=dn||"None";$("kl-diet").textContent=dn?pl(dn,"diet filter on","diet filters on"):"filters on";
    $("kt-saved").textContent=sv;$("kl-saved").textContent=pl(sv,"thing saved","things saved");
  }catch(e){console.error(e)}
}
const rm=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
kit.querySelectorAll(".ktile").forEach(b=>{b.style.setProperty("--za",["var(--sun)","#ff9b82","#7fd1a6","#b9a2f0"][+b.dataset.c]);b.onclick=()=>{const z=$(b.dataset.z);if(z)z.scrollIntoView({behavior:rm()?"auto":"smooth",block:"start"})}});
["click","change","input","keyup"].forEach(ev=>kit.addEventListener(ev,()=>setTimeout(kitSum,0)));
const _stk=setTab;setTab=function(t){const r=_stk.apply(this,arguments);if(t==="kit")kitSum();return r};
kitSum();
})();
