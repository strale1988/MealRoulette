/* js/ui/share-and-install.js: Share links (#s=...), the install prompt, backup and share buttons. */
/* ---- share links: the whole recipe, pizza, plan or ferment travels inside the link (#s=...), so opening it shows exactly that ---- */
(function(){
const b64=u8=>{let s="";for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};
const unb64=t=>{t=t.replace(/-/g,"+").replace(/_/g,"/");while(t.length%4)t+="=";const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
const pipe=async(u8,Ctor,fmt)=>new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new Ctor(fmt))).arrayBuffer());
const base=()=>location.origin+location.pathname;
window.__shareLink=async function(kind,data){
  /* a cookbook recipe travels as just its id and servings (about 40 characters); the other side rebuilds it from its own copy of the cookbook */
  if(kind==="r"&&data&&typeof data.rid==="string"&&/^[A-Za-z0-9_-]{1,80}$/.test(data.rid)&&K.recipes.some(x=>x.id===data.rid))return base()+"#s=c"+data.rid+"~"+Math.min(24,Math.max(1,Math.round(+data.n)||2));
  const u8=new TextEncoder().encode(JSON.stringify({k:kind,d:data}));let code;
  try{code=window.CompressionStream?"z"+b64(await pipe(u8,CompressionStream,"deflate-raw")):"j"+b64(u8)}catch(e){code="j"+b64(u8)}
  return base()+"#s="+code;
};
/* send a link (or, for the app itself, just the address) through the share sheet; copy it when there is none */
window.__shareOut=async function(kind,data,title,summary,btn,fallback){
  const orig=btn.innerHTML,lbl=I("share")+"Share";let url="";
  try{url=kind==="app"?base():await window.__shareLink(kind,data)}catch(e){}
  const msg=summary+(url?"\n"+(kind==="app"?"Try Meal Roulette:":"Open it in Meal Roulette:"):""),full=url?msg+"\n"+url:(fallback?fallback():summary);
  const done=()=>{btn.innerHTML=I("share")+"Link copied";setTimeout(()=>{btn.innerHTML=orig.includes("Copied")?lbl:orig},2000)};
  try{if(navigator.share){await navigator.share(url?{title,text:msg,url}:{title,text:full})}else{await navigator.clipboard.writeText(full);done()}}
  catch(e){if(e&&e.name!=="AbortError"){try{await navigator.clipboard.writeText(full);done()}catch(_){const nt=$("note");if(nt)nt.textContent=full}}}
};
/* never trust a link: copy only plain values, clip strings, coerce every number */
const str=(v,n)=>typeof v==="string"?v.slice(0,n||400):"",num=(v,d)=>Number.isFinite(+v)&&v!==null&&v!==""&&v!==false?+v:(d||0),pos=(v,d)=>num(v)>0?+v:d;
const strs=(a,n,m)=>Array.isArray(a)?a.slice(0,n||60).filter(x=>typeof x==="string").map(x=>x.slice(0,m||800)):[];
function ing1(i){const x={name:str(i.name,120),txt:str(i.txt,60)};if(Number.isFinite(i.a))x.a=i.a;if(typeof i.u==="string")x.u=str(i.u,12);if(typeof i.id==="string")x.id=str(i.id,60);if(typeof i.st==="string")x.st=str(i.st,12);if(typeof i.grp==="string")x.grp=str(i.grp,40);if(Number.isFinite(i.pct))x.pct=i.pct;if(i.pantry)x.pantry=1;return x}
const ings=a=>Array.isArray(a)?a.slice(0,80).filter(i=>i&&typeof i.name==="string").map(ing1):[];
function cleanRecipe(o){
  if(!o||typeof o.title!=="string")return null;const ing=ings(o.ing),steps=strs(o.steps);if(!ing.length||!steps.length)return null;
  const m=normM(MEALS.some(x=>x[0]===normM(o.meal))?o.meal:"Main"),r={title:str(o.title,120),min:pos(o.min,30),n:Math.min(pos(o.n,2),24),ing,steps,meal:m};
  if(typeof o.desc==="string")r.desc=str(o.desc,500);if(typeof o.rid==="string"&&K.recipes.some(x=>x.id===o.rid))r.rid=o.rid;return r;
}
function cleanPizza(o){
  if(!o||typeof o.title!=="string"||!Array.isArray(o.sections))return null;const ing=ings(o.ing);if(!ing.length)return null;
  const r={title:str(o.title,120),styleName:str(o.styleName,80),fermName:str(o.fermName,120),ahead:str(o.ahead,80),bake:str(o.bake,200),feeds:num(o.feeds),count:num(o.count),ferm:str(o.ferm,40),pre:str(o.pre,40),fresh:!!o.fresh,ing};
  ing.forEach((i,k)=>{if(!i.grp)i.grp="Toppings"});
  if(o.dough!==undefined)r.dough=o.dough?1:0;if(o.remix)r.remix=1;if(o.kcal)r.kcal=num(o.kcal);if(o.p)r.p=num(o.p);if(o.leftN)r.leftN=num(o.leftN);
  if(typeof o.desc==="string")r.desc=str(o.desc,600);if(typeof o.sum==="string")r.sum=str(o.sum,300);
  if(o.doughG)r.doughG=num(o.doughG);if(o.flourG)r.flourG=num(o.flourG);
  r.notes=strs(o.notes,10,500);r.ideas=strs(o.ideas,20,80);
  r.sections=o.sections.slice(0,12).filter(x=>x&&typeof x.h==="string").map(x=>({h:str(x.h,100),steps:strs(x.steps,40),tips:strs(x.tips,10,600)}));
  return r.sections.length?r:null;
}
function cleanPlan(o){
  if(!o||!Array.isArray(o.days)||!Array.isArray(o.list))return null;
  const days=o.days.slice(0,14).map((x,i)=>{const g=cleanRecipe({...x&&x.g,meal:"Main"});if(!g)return null;const n=x.g&&x.g.note;if(typeof n==="string")g.note=str(n,500);return{d:pos(x.d,i+1),m:normM(MEALS.some(q=>q[0]===normM(x.m))?x.m:"Main"),g}});
  if(!days.length||days.some(x=>!x))return null;
  return{days,list:ings(o.list).slice(0,200),title:str(o.title,120)||"Meal plan",n:Math.min(pos(o.n,2),24),mode:str(o.mode,20),date:new Date().toLocaleDateString()};
}
async function importShared(){
  const m=/^#s=([jz][A-Za-z0-9_-]+)$/.exec(location.hash)||(()=>{const q=/^#r=([jz][A-Za-z0-9_-]+)$/.exec(location.hash);return q&&[q[0],q[1],"legacy"]})(),sc=/^#s=c([A-Za-z0-9_-]{1,80})~(\d{1,2})$/.exec(location.hash);if(!m&&!sc)return;
  try{history.replaceState(history.state,"",location.pathname+location.search)}catch(e){}
  if(sc){const rec=K.recipes.find(x=>x.id===sc[1]),sp=document.getElementById("splash");
    if(!rec){const nt=$("note");if(nt)nt.textContent="That shared recipe isn't in this version of the app yet. Reload and try the link again.";return}
    if(sp)sp.remove();scrollTo({top:0});const n=Math.min(24,Math.max(1,+sc[2]||2)),meal=rec.meals.includes(S.meal)?S.meal:rec.meals[0];
    S.meal=meal;S.pm={[meal]:true};setTab("cook");draw();const x=K.resolve(rec,n,{fridge:new Set(),basic:S.basic,urgent:new Set()});
    show({rid:rec.id,title:rec.title,min:rec.min,n,steps:x.steps,ing:x.ing,desc:rec.note||"",meal},"Shared with you. Tap Save to keep it.");return}
  try{
    const u8=unb64(m[1].slice(1)),o=JSON.parse(new TextDecoder().decode(m[1][0]==="z"?await pipe(u8,DecompressionStream,"deflate-raw"):u8)),k=m[2]==="legacy"?"r":o.k,d=m[2]==="legacy"?o:o.d;
    const sp=document.getElementById("splash");
    const end=()=>{if(sp)sp.remove();scrollTo({top:0})};
    if(k==="r"){const r=cleanRecipe(d);if(!r)throw 0;end();S.meal=r.meal;S.pm={[r.meal]:true};setTab("cook");draw();show(r,"Shared with you. Tap Save to keep it.")}
    else if(k==="z"){const r=cleanPizza(d);if(!r)throw 0;end();setTab("pizza");pzSection("build");pzShow(r,"Shared with you. Tap Save to keep it.")}
    else if(k==="p"){const p=cleanPlan(d);if(!p)throw 0;end();setTab("cook");draw();renderPlan(p.days,p.list,p,false,0);const nt=$("note");if(nt)nt.textContent="Shared with you. Tap Save plan to keep it."}
    else if(k==="f"){if(!window.FERMENT||!window.FERMENT.applyShare||!window.FERMENT.applyShare(d))throw 0;end();setTab("ferm")}
    else if(k==="k"){const id=window.CRAFT&&window.CRAFT.applyShare&&window.CRAFT.applyShare(d);if(!id)throw 0;end();setTab(id);setTimeout(()=>{const c=document.querySelector("#tab-"+id+" .card");if(c)c.scrollIntoView({block:"start"})},60)}
    else throw 0;
  }catch(e){const nt=$("note");if(nt)nt.textContent="That shared link couldn't be opened.";console.error(e)}
}
importShared();
addEventListener("hashchange",importShared);

/* ---- install prompt: a small card (after ~20 s of use, never over a spin or a recipe) that offers to add the app to the home screen. Installed apps, and people who said "Not now" 3 times, are left alone. ---- */
(function(){
const KEY="mr-install",rd=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}},wr=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
const standalone=()=>matchMedia("(display-mode:standalone)").matches||navigator.standalone===true;
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
let dp=null,el=null,shown=false;
const HOW=()=>ios?'Tap <b>Share</b> '+I("share")+' in your browser, then <b>Add to Home Screen</b>.':"Open your browser menu and choose <b>Install app</b> or <b>Add to Home Screen</b>.";
const can=()=>!standalone()&&!rd().done&&(dp||ios);
const hide=()=>{if(el){el.remove();el=null}};
const snooze=()=>{wr({...rd(),t:Date.now(),n:(rd().n||0)+1});hide()};
async function go(){if(!dp)return;try{dp.prompt();const r=await dp.userChoice;dp=null;if(r&&r.outcome==="accepted"){wr({...rd(),done:1});hide()}else snooze()}catch(e){hide()}}
function card(){const st=rd();if(el||!can()||st.n>=3||(st.t&&Date.now()-st.t<14*864e5))return false;
  el=document.createElement("div");el.className="inst";el.setAttribute("role","region");el.setAttribute("aria-label","Install Meal Roulette");
  el.innerHTML=`<div class="instt"><b>Add Meal Roulette to your home screen</b><span>${dp?"Opens like an app, with its own icon, and works offline.":HOW()}</span></div><div class="insta">${dp?'<button type="button" class="go" data-a="i">Install</button>':""}<button type="button" data-a="n">${dp?"Not now":"Got it"}</button></div>`;
  el.onclick=e=>{const a=e.target.closest("button");if(!a)return;if(a.dataset.a==="i")go();else snooze()};
  document.body.appendChild(el);return true}
addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;const r=document.getElementById("instrow");if(r)r.hidden=!can()});
addEventListener("appinstalled",()=>{wr({...rd(),done:1});dp=null;hide();const r=document.getElementById("instrow");if(r)r.hidden=true});
const idle=()=>!document.querySelector(".cookov,.reel.on,.fmreel,.pzreel.on")&&!(window.__home&&window.__home.up());
let tries=0;const tick=()=>{if(shown||++tries>30||!can())return;if(idle()&&card()){shown=true;return}setTimeout(tick,8000)};
setTimeout(tick,20000);
/* My kitchen: the same offer, any time */
const kx=document.getElementById("kitextras");
if(kx&&!standalone()){const row=document.createElement("div");row.className="xtra-row";row.id="instrow";
  row.innerHTML='<p><b>Install the app</b><span id="instmsg">Add Meal Roulette to your home screen so it opens like an app.</span></p><div class="tg"><button type="button" id="instgo">Install</button></div>';
  kx.appendChild(row);
  document.getElementById("instgo").onclick=()=>{if(dp)go();else document.getElementById("instmsg").innerHTML=HOW()}}
})();

/* share buttons for plans and pizzas, and for the app itself */
const addBtn=(row,after,id,fn)=>{if(!row||row.querySelector("."+id))return;const b=document.createElement("button");b.className=id;b.innerHTML=I("share")+"Share";after&&after.parentNode===row?after.after(b):row.append(b);b.onclick=()=>fn(b)};
const _rp=renderPlan;
renderPlan=function(days,list,meta,saved,open){_rp(days,list,meta,saved,open);try{
  addBtn($("out").querySelector(".plan .body>.row"),$("cp"),"psh",b=>window.__shareOut("p",{title:meta.title,n:meta.n,mode:meta.mode,days,list},meta.title,meta.title+" for "+meta.n+" · "+days.length+" days of meals and a shopping list",b))}catch(e){console.error(e)}};
const _pc=pzCard;
pzCard=function(r,target,msg){_pc(r,target,msg);try{
  addBtn(target.querySelector(".row"),target.querySelector(".pzshop"),"pzsh",b=>window.__shareOut("z",r,r.title,r.title+(r.dough?" · dough recipe":"")+" · feeds about "+r.feeds,b))}catch(e){console.error(e)}};
const kx=document.getElementById("kitextras");
if(kx){const row=document.createElement("div");row.className="xtra-row";row.innerHTML='<p><b>Share Meal Roulette</b>Send a friend the link to the app.</p><div class="tg"><button type="button" id="appsh">Share</button></div>';kx.appendChild(row);
  const th=document.createElement("div");th.className="xtra-row";th.innerHTML=`<p><b>Theme</b>Light, dark, or follow your device.</p><div class="tg" id="themetg" role="group" aria-label="Theme"><button type="button" data-th="system">System</button><button type="button" data-th="light">Light</button><button type="button" data-th="dark">Dark</button></div>`;kx.insertBefore(th,kx.firstElementChild.nextSibling);
  const themeMeta=document.querySelector('meta[name="theme-color"]'),mq=matchMedia("(prefers-color-scheme:dark)");
  const applyTheme=m=>{const root=document.documentElement;if(m==="light"||m==="dark")root.setAttribute("data-theme",m);else root.removeAttribute("data-theme");
    const dark=m==="dark"||(m!=="light"&&mq.matches);if(themeMeta)themeMeta.setAttribute("content",dark?"#1d140f":"#fff3da");
    document.querySelectorAll("#themetg button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.th===(m==="light"||m==="dark"?m:"system"))))};
  const curTheme=()=>{try{const t=localStorage.getItem("mr-theme");return t==="light"||t==="dark"?t:"system"}catch(e){return"system"}};
  applyTheme(curTheme());
  document.querySelectorAll("#themetg button").forEach(b=>b.onclick=()=>{const m=b.dataset.th;try{m==="system"?localStorage.removeItem("mr-theme"):localStorage.setItem("mr-theme",m)}catch(e){}applyTheme(m)});
  (mq.addEventListener?mq.addEventListener.bind(mq,"change"):mq.addListener.bind(mq))(()=>applyTheme(curTheme()));
  const so=document.createElement("div");so.className="xtra-row";so.innerHTML=`<p><b>Seasonal picks</b>Favour hearty dishes in the cold months and light ones when it's warm.</p><div class="tg"><button type="button" id="seastg" aria-pressed="${!!S.seasonal}">${S.seasonal?"On":"Off"}</button></div>`;kx.insertBefore(so,row);
  $("seastg").onclick=()=>{S.seasonal=!S.seasonal;save();$("seastg").setAttribute("aria-pressed",String(!!S.seasonal));$("seastg").textContent=S.seasonal?"On":"Off"};
  const rr=document.createElement("div");rr.className="xtra-row";const nr=()=>Object.keys(ratings()).length;
  rr.innerHTML=`<p><b>Recipe ratings</b><span id="ratecount"></span></p><div class="tg"><button type="button" id="ratereset">Reset</button></div>`;kx.insertBefore(rr,row);
  const pr=()=>{$("ratecount").textContent=nr()?nr()+" rated with Like or Not for me. They steer what you get when you spin.":"Tap Like or Not for me on a recipe to steer what you get when you spin.";$("ratereset").disabled=!nr()};pr();
  $("ratereset").onclick=()=>{if(nr()&&confirm("Forget all your Like and Not for me ratings?")){store("mr-rate",{});pr()}};
  document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest(".thumb"))setTimeout(pr,0)});
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){} // ask the browser not to clear favourites, ferments and the cooking log when space runs low
  /* backup: everything this app keeps lives in localStorage under "mr-" keys, so export/import just copies those */
  const bk=document.createElement("div");bk.className="xtra-row";
  bk.innerHTML='<p><b>Back up your data</b><span id="bkmsg">Favourites, plans, ferments, notes and your cooking log live only in this browser, and clearing site data erases them. Save a copy to keep them safe.</span></p><div class="tg"><button type="button" id="bkexp">Export</button><button type="button" id="bkimp">Import</button></div><input type="file" id="bkfile" accept="application/json,.json" hidden aria-label="Backup file">';
  kx.insertBefore(bk,row);
  const bkm=t=>{$("bkmsg").textContent=t},SKIP={"mr-tab":1,"mr-keys":1},isJ=v=>{try{JSON.parse(v);return true}catch(e){return false}};
  const mine=()=>{const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf("mr-")===0&&!SKIP[k])o[k]=localStorage.getItem(k)}}catch(e){}return o};
  $("bkexp").onclick=()=>{try{const data=mine(),n=Object.keys(data).length;if(!n){bkm("Nothing to back up yet. Save a recipe or change a setting first.");return}
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({app:"meal-roulette",v:1,saved:new Date().toISOString(),data})],{type:"application/json"}));
    a.download="meal-roulette-backup-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    bkm("Backup saved ("+n+" items). Keep the file somewhere safe.")}catch(e){bkm("Could not create a backup in this browser.")}};
  $("bkimp").onclick=()=>$("bkfile").click();
  $("bkfile").onchange=async e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;
    try{if(f.size>5e6)throw 0;const j=JSON.parse(await f.text());if(!j||j.app!=="meal-roulette"||!j.data||typeof j.data!=="object")throw 0;
      const d={};Object.keys(j.data).forEach(k=>{const v=j.data[k];if(k.indexOf("mr-")===0&&!SKIP[k]&&typeof v==="string"&&(k==="mr-theme"?v==="light"||v==="dark":isJ(v)))d[k]=v});
      const n=Object.keys(d).length;if(!n)throw 0;
      if(!confirm("Replace everything on this device with the backup"+(j.saved?" from "+new Date(j.saved).toLocaleDateString():"")+"? Your current favourites, plans, ferments, notes and log will be overwritten."))return;
      const was=mine();try{Object.keys(was).forEach(k=>localStorage.removeItem(k));Object.keys(d).forEach(k=>localStorage.setItem(k,d[k]))}catch(er){try{Object.keys(d).forEach(k=>localStorage.removeItem(k));Object.keys(was).forEach(k=>localStorage.setItem(k,was[k]))}catch(e2){}throw er} // all or nothing
      bkm("Restored "+n+" items. Reloading…");setTimeout(()=>location.reload(),400)}
    catch(err){bkm("That file is not a Meal Roulette backup, or it could not be read. Nothing was changed.")}};
  $("appsh").onclick=()=>window.__shareOut("app",null,"Meal Roulette","Meal Roulette: spin for a recipe, plan your week and build a shopping list.",$("appsh"))}
})();

