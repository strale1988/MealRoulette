/* dinner.js: "Plan dinner" for any recipe card. Pick the time you want to eat and it works backwards through the steps to the time you should start.
   window.__dinner({title, steps}) opens the plan; window.DINNER.plan(steps) is the pure calculation (used by the tests).
   Durations come from the step text ("simmer 12–15 minutes", "rise for 1 hour"); a step with no time counts as 3 minutes, heating the oven as 10.
   Steps are added up one after another, so it is an honest upper bound: where you can work while something rests, the real time is shorter.
   Load order: after xlink.js, before engine.js. Called from the Cook and Craft cards. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DUR=/(\d+(?:[.,]\d+)?)(?:\s?[–-]\s?(\d+(?:[.,]\d+)?))?\s*(hours?|hrs?|h|minutes?|mins?|min|seconds?|secs?)\b/gi;
const PASSIVE=/\b(rise|rises|rising|proof|prove|rest|chill|cool|marinat\w*|soak\w*|ferment\w*|stand|refrigerat\w*|freeze|infuse|bloom|pickle[sd]?)\b/i;
const OVEN=/\b(preheat|pre-heat|heat the oven|heat your oven|heat oven|oven to)\b/i;

/* minutes for one step, and whether most of it is hands-off waiting (judged sentence by sentence, so "Knead 10 minutes. Rise 1 hour." counts as waiting) */
const sentMin=t=>{let sum=0,m;DUR.lastIndex=0;
 while((m=DUR.exec(t))){const n=parseFloat(String(m[2]||m[1]).replace(",",".")),u=m[3][0].toLowerCase();sum+=u==="h"?n*60:u==="s"?n/60:n}
 if(sum&&/\b(per|each|a)\s+side\b/i.test(t))sum*=2; // "3 minutes per side"
 return sum};
const stepMin=t=>{
 let total=0,wait=0;String(t).split(/(?<=[.!?])\s+/).forEach(x=>{const n=sentMin(x);total+=n;if(PASSIVE.test(x))wait+=n});
 if(!total)total=OVEN.test(t)?10:3;
 total=Math.min(total,24*60);
 return{min:Math.max(1,Math.round(total)),passive:wait>=10&&wait>=total/2}};
const plan=steps=>{const items=steps.map(t=>Object.assign({text:String(t)},stepMin(String(t))));return{items,total:items.reduce((a,x)=>a+x.min,0)}};

const hm=m=>m<60?m+" min":Math.floor(m/60)+" h"+(m%60?" "+m%60+" min":"");
const clock=d=>d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});
const KEY="mr-dinnertime",get=()=>{try{return localStorage.getItem(KEY)||"19:00"}catch(e){return"19:00"}},put=v=>{try{localStorage.setItem(KEY,v)}catch(e){}};
const at=(hhmm,base)=>{const [h,m]=String(hhmm).split(":").map(Number),d=new Date(base);d.setHours(h||0,m||0,0,0);return d};

/* a small calendar file so the start time can be a reminder on the phone's own calendar */
const ics=(title,start,end)=>{const f=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d+Z$/,"Z"),t=String(title).replace(/[,;\\]/g,m=>"\\"+m);
 return["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Meal Roulette//EN","BEGIN:VEVENT","UID:"+Date.now()+"@mealroulette","DTSTAMP:"+f(new Date()),"DTSTART:"+f(start),"DTEND:"+f(end),"SUMMARY:Start cooking: "+t,
  "BEGIN:VALARM","TRIGGER:-PT10M","ACTION:DISPLAY","DESCRIPTION:Start cooking "+t,"END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n")};

function open(r){
 const P=plan(r.steps||[]);if(!P.items.length)return;
 const ov=document.createElement("div");ov.className="dnov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","Plan dinner");
 let nv=null;
 const close=fp=>{if(nv){const n=nv;nv=null;if(fp!==true&&window.__nav)window.__nav.pop(n)}document.removeEventListener("keydown",key);ov.remove();document.body.style.overflow=""};
 const key=e=>{if(e.key==="Escape")close()};
 const paint=()=>{
  const now=new Date();let eat=at(get(),now),tomorrow=false;if(eat<=now){eat=new Date(eat.getTime()+864e5);tomorrow=true}
  const start=new Date(eat.getTime()-P.total*6e4),late=start<now,earliest=new Date(now.getTime()+P.total*6e4);
  let t=new Date(start),rows="";
  P.items.forEach((x,i)=>{const when=clock(t);t=new Date(t.getTime()+x.min*6e4);
   rows+=`<li${x.passive?' class="wait"':""}><time>${when}</time><div><p>${esc(x.text)}</p><small>${hm(x.min)}${x.passive?" · mostly waiting, do something else":""}</small></div></li>`});
  rows+=`<li class="eat"><time>${clock(eat)}</time><div><p>Dinner is ready</p></div></li>`;
  ov.innerHTML=`<div class="dn"><div class="dn-top"><b>Plan dinner</b><button type="button" class="dn-x" aria-label="Close"><svg class="i"><use href="#i-x"/></svg></button></div>
   <p class="dn-t">${esc(r.title||"Your recipe")}</p>
   <label class="dn-l">I want to eat at <input type="time" id="dntime" value="${esc(get())}"></label>
   <div class="dn-big${late?" late":""}">${late?`<span>Too late for ${clock(eat)}</span><b>Earliest dinner: ${clock(earliest)}</b><button type="button" class="dn-use">Use ${clock(earliest)}</button>`
     :`<span>Start cooking at</span><b>${clock(start)}${tomorrow?" tomorrow":""}</b><small>${hm(P.total)} in total</small>`}</div>
   <ol class="dn-list">${rows}</ol>
   <p class="dn-note">Steps are added up one after another, so if you can work while something rests it will be quicker than this.</p>
   <div class="dn-act"><button type="button" class="dn-cal"${late?" disabled":""}>Add start time to my calendar</button></div></div>`;
  ov.querySelector(".dn-x").onclick=()=>close();
  ov.querySelector("#dntime").onchange=e=>{if(e.target.value){put(e.target.value);paint()}};
  const u=ov.querySelector(".dn-use");if(u)u.onclick=()=>{const e=new Date(Math.ceil(earliest.getTime()/3e5)*3e5);put(String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0"));paint()};
  const c=ov.querySelector(".dn-cal");if(c)c.onclick=()=>{try{const b=new Blob([ics(r.title||"dinner",start,eat)],{type:"text/calendar"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="start-cooking.ics";document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},1500)}catch(e){console.error(e)}};
 };
 paint();document.body.appendChild(ov);document.body.style.overflow="hidden";document.addEventListener("keydown",key);
 ov.addEventListener("click",e=>{if(e.target===ov)close()});
 nv=window.__nav?window.__nav.push(()=>close(true)):null;
 const x=ov.querySelector(".dn-x");if(x)x.focus()}

const css=document.createElement("style");
css.textContent=".dnov{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;padding:env(safe-area-inset-top) 0 0}@media(min-width:700px){.dnov{align-items:center}}"
+".dn{background:var(--card,#fff);color:var(--ink,#111);width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;padding:16px 18px calc(18px + env(safe-area-inset-bottom))}@media(min-width:700px){.dn{border-radius:20px}}"
+".dn-top{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}.dn-x{border:0;background:transparent;color:inherit;width:36px;height:36px;border-radius:50%;cursor:pointer;display:grid;place-items:center}.dn-x svg{width:20px;height:20px}"
+".dn-t{font-size:20px;font-weight:800;margin:6px 0 12px}.dn-l{display:flex;align-items:center;gap:10px;font-weight:700}.dn-l input{font:inherit;font-size:18px;font-weight:800;padding:6px 10px;border:2px solid var(--line,#ddd);border-radius:12px;background:transparent;color:inherit}"
+".dn-big{margin:14px 0;padding:14px;border-radius:16px;background:var(--soft,#f4f4f4);display:flex;flex-direction:column;gap:2px}.dn-big span{font-size:13px;font-weight:700;color:var(--mute)}.dn-big b{font-size:30px;line-height:1.1}.dn-big small{color:var(--mute)}.dn-big.late b{font-size:20px}.dn-use{margin-top:8px;align-self:flex-start;font:inherit;font-weight:800;padding:8px 14px;border-radius:999px;border:2px solid currentColor;background:transparent;color:var(--acct,var(--acc2));cursor:pointer}"
+".dn-list{list-style:none;margin:0;padding:0}.dn-list li{display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--line,#ddd)}.dn-list time{flex:0 0 74px;font-weight:800;font-variant-numeric:tabular-nums}.dn-list p{margin:0 0 2px}.dn-list small{color:var(--mute)}.dn-list li.wait{opacity:.8}.dn-list li.wait small{color:var(--acct,var(--acc2));font-weight:700}.dn-list li.eat{font-weight:800}"
+".dn-note{font-size:12px;color:var(--mute);margin:12px 0}.dn-act{display:flex}.dn-cal{flex:1;font:inherit;font-weight:800;padding:12px;border-radius:14px;border:2px solid var(--ink,#111);background:transparent;color:inherit;cursor:pointer}.dn-cal:disabled{opacity:.4;cursor:default}";
document.head.appendChild(css);

window.__dinner=open;window.DINNER={plan,stepMin};
})();
