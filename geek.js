/* geek.js: the "Geek foody" setting, shared by the whole app. Loads before every craft file.
   Off (the default): recipes and presets, as always. On: the extras (inspired-by cuisines, add-ins, fine-tuned amounts, jar sizing,
   ferment totals by jar size, taste reminders...). Anything that is an extra is flagged g:1 (a control or an ingredient) or has a third
   value 1 (a choice inside a control); craft.js and craft-ferment.js hide those and ignore their settings while the switch is off.
   API: GEEK.on() -> boolean; GEEK.set(on, quiet) saves it and (unless quiet) tells every subscriber; GEEK.sub(fn) runs fn when it changes.
   The one place to switch it is My kitchen > Make it yours (the panel is added here). Stored in localStorage "mr-geek";
   "mr-seen-geek" remembers that the one-time hint was dismissed. */
(function(){
"use strict";
if(window.GEEK)return;
const subs=[];let on=false;try{on=localStorage.getItem("mr-geek")==="1"}catch(e){}
window.GEEK={on:()=>on,set(v,quiet){v=!!v;if(v===on)return;on=v;try{localStorage.setItem("mr-geek",v?"1":"0")}catch(e){}if(!quiet)subs.slice().forEach(f=>{try{f(v)}catch(e){console.error(e)}})},sub:f=>{subs.push(f)}};
const css=document.createElement("style");
css.textContent=".geekrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 12px}.geekrow span{font-size:12px;color:var(--mute)}.geekreset{font:inherit;font-size:12px;font-weight:800;background:none;border:0;padding:0;text-decoration:underline;color:var(--acct,var(--acc2));cursor:pointer}";
document.head.appendChild(css);

/* ---------------- the one universal switch, in My kitchen > Make it yours ---------------- */
{const mount=()=>{const grid=document.querySelector("#kz-setup .kgrid");if(!grid||document.getElementById("geekpanel")||!window.GEEK)return;
  const p=document.createElement("section");p.className="panel";p.id="geekpanel";
  p.innerHTML='<div class="lab"><svg class="i"><use href="#i-wand"/></svg>Geek foody</div><p class="hint">Simple is the default: recipes and presets. Geek foody adds the extras everywhere: inspired-by cuisines, add-ins like rosemary and cinnamon, fine-tuned amounts, fitting a recipe to your jar or pot, ferment totals by jar size, and taste reminders.</p><div class="tg" id="geekset"><button type="button" data-geekset="0">Simple</button><button type="button" data-geekset="1">Geek foody</button></div>';
  grid.insertBefore(p,grid.firstChild);
  const sync=()=>p.querySelectorAll("[data-geekset]").forEach(b=>b.setAttribute("aria-pressed",String((b.dataset.geekset==="1")===window.GEEK.on())));
  p.addEventListener("click",e=>{const b=e.target.closest("[data-geekset]");if(b)window.GEEK.set(b.dataset.geekset==="1")});
  window.GEEK.sub(sync);sync()};
 if(typeof document!=="undefined"){mount();document.addEventListener("DOMContentLoaded",mount);setTimeout(mount,400);setTimeout(mount,1500)}}

/* ---------------- one-time hint about Geek foody ---------------- */
{const KEY="mr-seen-geek";let seen=false;try{seen=localStorage.getItem(KEY)==="1"||(window.GEEK&&window.GEEK.on())}catch(e){}
 if(!seen&&typeof document!=="undefined"&&document.body){
  const c=document.createElement("style");c.textContent=".whatsnew{position:fixed;left:12px;right:12px;bottom:calc(96px + env(safe-area-inset-bottom));z-index:35;max-width:520px;margin:0 auto;display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:16px;background:var(--card,#fff);color:var(--ink,#111);border:2px solid var(--ink,#111);box-shadow:3px 3px 0 var(--ink,#111);font-size:14px}.whatsnew b{font-weight:800}.whatsnew button{flex:none;font:inherit;font-weight:800;padding:6px 14px;border-radius:999px;border:2px solid var(--ink,#111);background:var(--sun,#ffc63d);color:inherit;cursor:pointer}html:has(.reel.on,.fmreel,.pzreel.on,.splash:not(.out)) .whatsnew{display:none}";document.head.appendChild(c);
  const el=document.createElement("div");el.className="whatsnew";el.setAttribute("role","status");el.innerHTML="<span><b>New:</b> turn on <b>Geek foody</b> in My kitchen for inspired-by styles, add-ins, jar sizing and more.</span><button type=\"button\" data-show>Show me</button><button type=\"button\" data-ok>Got it</button>";
  const done=()=>{try{localStorage.setItem(KEY,"1")}catch(e){}el.remove()};el.querySelector("[data-ok]").onclick=done;el.querySelector("[data-show]").onclick=()=>{done();if(typeof window.setTab==="function")window.setTab("kit");setTimeout(()=>{const g=document.getElementById("geekpanel");if(g)g.scrollIntoView({block:"center"})},120)};
  setTimeout(()=>{if(document.body)document.body.appendChild(el)},1500)}}
})();
