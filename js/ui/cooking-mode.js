/* js/ui/cooking-mode.js: Tap-through steps, cooking mode (timers, screen awake), notes per recipe. */
/* ---- improvements: pantry progress, tap-through steps, cooking mode (big steps, timers, screen stays on) ---- */
(function(){
window.__cookReady=1;const _show=show;
show=function(r,m){_show(r,m);if(!r)return;try{enhance(r)}catch(e){console.error(e)}};
function enhance(r){
  const card=$("out").querySelector(".card");if(!card)return;
  const tot=r.ing.length,have=r.ing.filter(i=>!missing(i)).length,pct=tot?Math.round(have/tot*100):0;
  const pg=document.createElement("div");pg.className="pantry";pg.hidden=!items().length;
  pg.innerHTML=`<div><b>You already have ${have} of ${tot}</b><span class="${have===tot?"all":""}">${have===tot?"Nothing to buy":tot-have+" to buy"}</span></div><i role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${have}"><u style="width:${pct}%"></u></i>`;
  const body=card.querySelector(".body"),meta=body.querySelector(".meta");meta.after(pg);pg.after(noteBlock(r.title));
  try{const rf=readyFerm(),ids=new Set(r.ing.map(i=>i.id||K.match(i.name||"")[0])),hit=[...new Set(rf.filter(x=>ids.has(x[0])).map(x=>x[1]))];
   if(hit.length){const c=document.createElement("div");c.className="call ok2";c.innerHTML=I("check")+"<span>Uses your ready "+hit.map(esc).join(" and ")+" from My kitchen.</span>";meta.after(c)}}catch(e){}
  card.querySelectorAll("ol li").forEach(li=>{li.tabIndex=0;li.onclick=()=>li.classList.toggle("done");li.onkeydown=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();li.click()}}});
  card.querySelectorAll("ul.ing li").forEach(li=>{li.tabIndex=0;li.onkeydown=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();li.click()}}});
  const b=document.createElement("button");b.id="cookgo";b.className="go";b.innerHTML=I("flame")+"Start cooking";
  card.querySelector(".row").prepend(b);b.onclick=()=>cookMode({...r,list:cookList(r.ing)});
  if(window.__dinner){const pl=document.createElement("button");pl.type="button";pl.id="plandn";pl.innerHTML=I("clock")+"Plan dinner";pl.onclick=()=>window.__dinner({title:r.title,steps:r.steps.map(s=>cv(s))});b.after(pl)}
  const sv=$("save");if(sv){const o=sv.onclick;sv.onclick=()=>{o();navigator.vibrate&&navigator.vibrate(15)}}
}
let wl=null;window.__cook=(r)=>cookMode(r);
/* notes per recipe title, kept on this device */
const NK="mr-cooknotes",notesAll=()=>store(NK)||{},getNote=t=>notesAll()[t]||null;
const putNote=(t,v)=>{const n=notesAll();v=String(v||"").trim().slice(0,600);if(v)n[t]={t:v,d:Date.now()};else delete n[t];store(NK,n);window.dispatchEvent(new Event("mr-notes"))};
const PH="e.g. used bulgur instead of rice, 5 min less in the oven";
function noteBlock(title){
  const d=document.createElement("div");d.className="cknote";let edit=false;
  const draw=()=>{
    if(d.dataset.ready&&!d.isConnected){window.removeEventListener("mr-notes",draw);return}d.dataset.ready=1;
    const x=getNote(title);
    if(edit){
      d.innerHTML=`<label class="ck-nl">Your note<textarea class="ck-ta" rows="3" maxlength="600" placeholder="${PH}"></textarea></label><div class="cnr"><button type="button" class="lnk" data-a="save">Save</button><button type="button" class="lnk" data-a="cancel">Cancel</button></div>`;
      const ta=d.querySelector("textarea");ta.value=x?x.t:"";ta.focus();
    }else d.innerHTML=x?`<p class="nt"><b>Your note · ${new Date(x.d).toLocaleDateString()}</b>${esc(x.t)}</p><button type="button" class="lnk" data-a="edit">Edit note</button>`:`<button type="button" class="lnk" data-a="edit">+ Add a note (swaps, tweaks)</button>`;
  };
  d.onclick=e=>{const a=e.target.closest("button");if(!a)return;const k=a.dataset.a;
    if(k==="edit"){edit=true;draw()}
    else if(k==="cancel"){edit=false;draw()}
    else if(k==="save"){const v=d.querySelector("textarea").value;edit=false;putNote(title,v)}};
  window.addEventListener("mr-notes",draw);draw();return d;
}
window.__noteBlock=noteBlock;try{window.CRAFT&&CRAFT.redraw&&CRAFT.redraw()}catch(e){console.error(e)} // craft cards get the note block too
const mins=t=>{const m=String(t).match(/(\d+)(?:\s?[–-]\s?(\d+))?\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i);if(!m)return 0;const n=+(m[2]||m[1]),u=m[3][0].toLowerCase();return u==="h"?n*3600:u==="s"?n:n*60};
function beep(){ // a soft bell arpeggio (C-E-G-C), played twice, instead of one harsh tone
  try{const A=window.AudioContext||window.webkitAudioContext,a=new A();a.resume&&a.resume();const t0=a.currentTime+.05,out=a.createGain();out.gain.value=.2;out.connect(a.destination);
    const bell=(f,t)=>{[[1,1],[2,.16],[3,.05]].forEach(([m,v])=>{const o=a.createOscillator(),g=a.createGain();o.type="sine";o.frequency.value=f*m;o.connect(g);g.connect(out);
      g.gain.setValueAtTime(0,t0+t);g.gain.linearRampToValueAtTime(v,t0+t+.015);g.gain.exponentialRampToValueAtTime(.0008,t0+t+(m===1?1.3:.6));o.start(t0+t);o.stop(t0+t+1.4)})};
    [523.25,659.25,783.99,1046.5].forEach((f,i)=>bell(f,i*.2));
    setTimeout(()=>{try{a.close()}catch(e){}},3000)}catch(e){}
  navigator.vibrate&&navigator.vibrate([160,120,160]);
}
let alarmT=null;const ringStop=()=>{clearInterval(alarmT);alarmT=null};
function ringStart(){ringStop();beep();alarmT=setInterval(beep,3200)} // rings again and again until the cook presses Next, Back, Done or close
function cookMode(r){
  const steps=r.steps.map(s=>cv(s)),ov=document.createElement("div");let i=0,tm=null,wlOn=false;const noteLast=n=>{const x=n===0&&getNote(r.title);return x?`<div class="ck-last"><b>Your note from ${new Date(x.d).toLocaleDateString()}</b>${esc(x.t)}</div>`:""};

  const LS=(r.list||[]).map(x=>Array.isArray(x)?{n:String(x[0]),q:String(x[1]==null?"":x[1])}:{n:String((x&&(x.n||x.name))||""),q:String((x&&x.q)||"")}).filter(x=>x.n),got=new Set();let showIng=false;
  const STOP=new Set("fresh ground chopped sliced diced grated large small medium whole plain canned tinned dried frozen cooked raw ripe soft hard cold warm hot extra virgin finely roughly thinly crushed minced optional taste serve serving your own good quality dough batter filling topping dressing the and for with".split(" ")),CLR=new Set("black white red green yellow brown sweet sour spring".split(" "));
  const stem=w=>w.length>4?w.replace(/ies$/,"y").replace(/(es|s)$/,""):w;
  LS.forEach(x=>{const core=x.n.replace(/^[^:]{1,20}:\s*/,"").split(/[,(]/)[0].toLowerCase().split(/[^a-zà-ž]+/).filter(w=>w.length>2&&!STOP.has(w)).map(stem);x.k=core.length?[core[core.length-1]].concat(core.length>1&&!CLR.has(core[0])?[core[0]]:[]):[]});
  const useNow=t=>{const ws=new Set(t.toLowerCase().split(/[^a-zà-ž]+/).filter(Boolean).map(stem));return LS.filter(x=>x.k.some(k=>ws.has(k))).slice(0,8)};
  const tempsOf=t=>{const o=[],lab=/oven|bake|roast|preheat/i.test(t)?"Oven":/grill|bbq|barbecue|smoker|cooker/i.test(t)?"Cooker":/pan|fry|sear|saut|wok/i.test(t)?"Pan":/inside|internal|thermometer|probe|reaches/i.test(t)?"Inside":"Temp";t.replace(/(\d{2,3})\s?°\s?([CF])/g,(m,n)=>{o.push([lab,m.replace(/\s/g,"")])});return o};
  const ovenAt=n=>{let v=null;for(let j=0;j<=n;j++){const t=tempsOf(steps[j]).find(x=>x[0]==="Oven");if(t)v=t[1]}return v};
  const aids=n=>{if(!LS.length&&!/°/.test(steps[n]))return"";const tp=tempsOf(steps[n]),ov=ovenAt(n),later=steps.slice(n).some(t=>/oven|bake|roast/i.test(t)),u=useNow(steps[n]);
    const chips=tp.map(x=>`<span class="ck-chip">${x[0]} <b>${esc(x[1])}</b></span>`).join("")+(ov&&!tp.some(x=>x[0]==="Oven")&&later?`<span class="ck-chip">Oven stays at <b>${esc(ov)}</b></span>`:"");
    return(chips?`<div class="ck-chips">${chips}</div>`:"")+(u.length?`<div class="ck-use"><small>Use now</small><ul>${u.map(x=>`<li><span>${esc(x.n.replace(/^[^:]{1,20}:\s*/,""))}</span><b>${esc(x.q)}</b></li>`).join("")}</ul></div>`:"")};
  const PX=/^([A-Z][A-Za-z ]{1,22}):\s+(.+)$/,secOf=(()=>{const c={};LS.forEach(x=>{const m=PX.exec(x.n);if(m)c[m[1]]=(c[m[1]]||0)+1});return x=>{const m=PX.exec(x.n);return m&&c[m[1]]>1?m:null}})();
  const panel=()=>{if(!LS.length)return"";let cur="";const rows=LS.map((x,k)=>{const m=secOf(x),l=m?m[1]:"";let h="";if(l!==cur){h=l?`<li class="ck-h">${esc(l)}</li>`:(cur?`<li class="ck-h">Also</li>`:"");cur=l} // "Bun: flour" lines become a "Bun" heading with plain lines under it, like the recipe card
    const n=m?m[2].charAt(0).toUpperCase()+m[2].slice(1):x.n;return h+`<li data-k="${k}"${got.has(k)?' class="got"':""}><span>${esc(n)}</span><b>${esc(x.q)}</b></li>`}).join("");
    return`<div class="ck-panel"${showIng?"":" hidden"}><ul>${rows}</ul></div>`};
  ov.className="cookov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","Cooking mode");
  let nv=null;const close=fp=>{if(nv){const n=nv;nv=null;if(fp!==true&&window.__nav)__nav.pop(n)}clearInterval(tm);ringStop();ov.remove();document.body.style.overflow="";document.removeEventListener("keydown",key);document.removeEventListener("visibilitychange",vis);if(wl){wl.release().catch(()=>{});wl=null}};
  const key=e=>{if(e.target&&e.target.closest&&e.target.closest("textarea")&&e.key!=="Escape")return;if(e.key==="Escape")close();else if(e.key==="i"&&!e.metaKey&&!e.ctrlKey){const b=ov.querySelector(".ck-ib");if(b)b.click()}else if(e.key==="ArrowRight")go(1);else if(e.key==="ArrowLeft")go(-1)};
  const vis=()=>{if(document.visibilityState==="visible"&&ov.isConnected)lock()};
  function wlPaint(){const e=ov.querySelector(".ck-wl");if(!e)return;e.dataset.on=wlOn?"1":"0";e.lastChild.textContent=wlOn?"Screen on":"Screen may sleep";e.title=wlOn?"The screen stays awake while you cook":navigator.wakeLock?"The browser refused to keep the screen awake (battery saver?)":"This browser can't keep the screen awake"}
  function lock(){ // keeps the screen awake; re-asks after the tab comes back or the system drops the lock
    if(!navigator.wakeLock){wlOn=false;wlPaint();return}
    if(wl&&!wl.released){wlOn=true;wlPaint();return}
    navigator.wakeLock.request("screen").then(x=>{wl=x;wlOn=true;wlPaint();x.addEventListener("release",()=>{if(wl===x)wl=null;wlOn=false;wlPaint()})}).catch(()=>{wlOn=false;wlPaint()});
  }document.addEventListener("visibilitychange",vis);
  function finish(){clearInterval(tm);ringStop();ov.innerHTML=`<div class="ck-done"><svg class="ck-badge" viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="52"/><path class="tick" d="M36 62l16 16 32-36"/></svg><h2>Enjoy your meal</h2><p>${esc(r.title)}</p>${(function(){try{return window.__logCooked?`<p class="ck-meta">${window.__logCooked(r.title)}</p>`:""}catch(e){return ""}})()}<label class="ck-nl" for="cknote">Tweaks for next time</label><textarea id="cknote" class="ck-ta" rows="3" maxlength="600" placeholder="${PH}"></textarea><button class="ck-n">Done</button></div>`;const ta=ov.querySelector("#cknote");ta.value=(getNote(r.title)||{}).t||"";ta.oninput=()=>putNote(r.title,ta.value);ov.querySelector(".ck-n").onclick=close;ov.querySelector(".ck-n").focus();navigator.vibrate&&navigator.vibrate([80,60,80,60,200])}
  function go(d){i=Math.max(0,Math.min(steps.length-1,i+d));paint()}
  function paint(){
    clearInterval(tm);ringStop();const s=steps[i],sec=mins(s),last=i===steps.length-1;
    ov.innerHTML=`<div class="ck-top"><b>${esc(r.title)}</b>${LS.length?`<button class="ck-ib" aria-expanded="${showIng}">Ingredients</button>`:""}<button class="ck-x" aria-label="Close cooking mode">${I("x")}</button></div><i class="ck-bar"><u style="width:${(i+1)/steps.length*100}%"></u></i><div class="ck-step"><small>Step ${i+1} of ${steps.length}</small><p>${esc(s)}</p>${aids(i)}${noteLast(i)}${sec?`<button class="ck-t" data-s="${sec}">${I("clock")}<span>Start ${Math.round(sec/60*10)/10>=1?Math.round(sec/60)+" min":sec+" s"} timer</span></button>`:""}</div>${panel()}<div class="ck-nav"><button class="ck-p" ${i?"":"disabled"}>Back</button><button class="ck-n">${last?"Done!":"Next"}</button></div>`;
    ov.querySelector(".ck-x").onclick=close;ov.querySelector(".ck-p").onclick=()=>go(-1);
    const ib=ov.querySelector(".ck-ib"),pn=ov.querySelector(".ck-panel");if(ib&&pn){ib.onclick=()=>{showIng=!showIng;pn.hidden=!showIng;ib.setAttribute("aria-expanded",showIng)};pn.onclick=e=>{const li=e.target.closest("li");if(!li||li.dataset.k===undefined)return;const k=+li.dataset.k;got.has(k)?got.delete(k):got.add(k);li.classList.toggle("got",got.has(k))}}
   ov.querySelector(".ck-n").onclick=()=>last?finish():go(1);
    const t=ov.querySelector(".ck-t");if(t)t.onclick=()=>{let left=+t.dataset.s;const end=Date.now()+left*1000,lab=t.querySelector("span"),show=()=>lab.textContent=Math.floor(left/60)+":"+String(left%60).padStart(2,"0")+" left";show();t.onclick=null;tm=setInterval(()=>{left=Math.ceil((end-Date.now())/1000);if(left<=0){clearInterval(tm);lab.textContent="Time's up!";t.classList.add("ring");ringStart()}else show()},1000)};
    ov.querySelector(".ck-n").focus();wlPaint();
  }
  document.body.appendChild(ov);document.body.style.overflow="hidden";document.addEventListener("keydown",key);paint();nv=window.__nav?__nav.push(()=>close(true)):null;
  lock();
}
})();
