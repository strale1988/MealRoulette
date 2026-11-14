/* js/ui/spinner.js: The shared spinner stage: pot, pizza and the art that swaps while spinning. */
/* ---- pizza spinner, start-cooking for pizza, dynamic spin label ---- */
(function(){
const o=$("pzout");if(o){const rl=document.createElement("div");rl.className="reel pzreel";rl.id="pzreel";rl.setAttribute("aria-hidden","true");
 rl.innerHTML=`<div class="spinwrap"><div class="rot"><div class="sc" style="--r:0deg;--k:0"><div class="pop"><svg class="wg" viewBox="-85 -85 170 170" aria-hidden="true"><path d="M0 0L-23.6 -61.6A66 66 0 0 1 23.6 -61.6Z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M-23.6 -61.6A66 66 0 0 1 23.6 -61.6" fill="none" stroke="#c98a3a" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-40" r="7.5" fill="#d63a22" style="stroke:var(--ink)" stroke-width="2"/><circle cx="-5" cy="-22" r="3.5" fill="#d63a22"/></svg></div></div><div class="sc" style="--r:45deg;--k:1"><div class="pop"><svg class="wg" viewBox="-85 -85 170 170" aria-hidden="true"><path d="M0 0L-23.6 -61.6A66 66 0 0 1 23.6 -61.6Z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M-23.6 -61.6A66 66 0 0 1 23.6 -61.6" fill="none" stroke="#c98a3a" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-38" r="6" fill="#1f9d5f" style="stroke:var(--ink)" stroke-width="2"/><circle cx="6" cy="-22" r="3.5" fill="#d63a22"/></svg></div></div><div class="sc" style="--r:90deg;--k:2"><div class="pop"><svg class="wg" viewBox="-85 -85 170 170" aria-hidden="true"><path d="M0 0L-23.6 -61.6A66 66 0 0 1 23.6 -61.6Z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M-23.6 -61.6A66 66 0 0 1 23.6 -61.6" fill="none" stroke="#c98a3a" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-40" r="7.5" fill="#d63a22" style="stroke:var(--ink)" stroke-width="2"/><circle cx="-5" cy="-22" r="3.5" fill="#d63a22"/></svg></div></div><div class="sc" style="--r:135deg;--k:3"><div class="pop"><svg class="wg" viewBox="-85 -85 170 170" aria-hidden="true"><path d="M0 0L-23.6 -61.6A66 66 0 0 1 23.6 -61.6Z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M-23.6 -61.6A66 66 0 0 1 23.6 -61.6" fill="none" stroke="#c98a3a" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-38" r="6" fill="#1f9d5f" style="stroke:var(--ink)" stroke-width="2"/><circle cx="6" cy="-22" r="3.5" fill="#d63a22"/></svg></div></div><div class="sc" style="--r:180deg;--k:4"><div class="pop"><svg class="wg" viewBox="-85 -85 170 170" aria-hidden="true"><path d="M0 0L-23.6 -61.6A66 66 0 0 1 23.6 -61.6Z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M-23.6 -61.6A66 66 0 0 1 23.6 -61.6" fill="none" stroke="#c98a3a" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-40" r="7.5" fill="#d63a22" style="stroke:var(--ink)" stroke-width="2"/><circle cx="-5" cy="-22" r="3.5" fill="#d63a22"/></svg></div></div><div class="sc" style="--r:225deg;--k:5"><div class="pop"><svg class="wg" viewBox="-85 -85 170 170" aria-hidden="true"><path d="M0 0L-23.6 -61.6A66 66 0 0 1 23.6 -61.6Z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M-23.6 -61.6A66 66 0 0 1 23.6 -61.6" fill="none" stroke="#c98a3a" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-38" r="6" fill="#1f9d5f" style="stroke:var(--ink)" stroke-width="2"/><circle cx="6" cy="-22" r="3.5" fill="#d63a22"/></svg></div></div><div class="sc" style="--r:270deg;--k:6"><div class="pop"><svg class="wg" viewBox="-85 -85 170 170" aria-hidden="true"><path d="M0 0L-23.6 -61.6A66 66 0 0 1 23.6 -61.6Z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M-23.6 -61.6A66 66 0 0 1 23.6 -61.6" fill="none" stroke="#c98a3a" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-40" r="7.5" fill="#d63a22" style="stroke:var(--ink)" stroke-width="2"/><circle cx="-5" cy="-22" r="3.5" fill="#d63a22"/></svg></div></div><div class="sc" style="--r:315deg;--k:7"><div class="pop"><svg class="wg" viewBox="-85 -85 170 170" aria-hidden="true"><path d="M0 0L-23.6 -61.6A66 66 0 0 1 23.6 -61.6Z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M-23.6 -61.6A66 66 0 0 1 23.6 -61.6" fill="none" stroke="#c98a3a" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-38" r="6" fill="#1f9d5f" style="stroke:var(--ink)" stroke-width="2"/><circle cx="6" cy="-22" r="3.5" fill="#d63a22"/></svg></div></div></div></div><div class="rtx"><span id="pzrt"></span><small>Firing up the oven…</small></div>`;o.before(rl)}
const _pz=pzRun;let busy=false;
pzRun=function(what,instant){
  if(busy)return;const rl=$("pzreel");
  if(!rl||instant||matchMedia("(prefers-reduced-motion:reduce)").matches||mrNoSpin())return _pz(what);
  busy=true;const bs=[...document.querySelectorAll(".pzbtns button")],rt=$("pzrt");
  let names=((window.PZ&&PZ.recipes)||[]).map(x=>x.title||x.name).filter(Boolean);if(!names.length)names=["Margherita","Pepperoni","Diavola","Quattro formaggi","Funghi"];
  bs.forEach(b=>b.disabled=true);o.innerHTML="";$("pzph").style.display="none";$("pznote").textContent="";rl.classList.add("on");rl.scrollIntoView({behavior:"smooth",block:"center"});
  let built=false;const build=()=>{if(built)return;built=true;_pz(what)};
  mrSpinNames(rt,names,()=>{build();o.style.visibility="";rl.classList.remove("on");bs.forEach(b=>b.disabled=false);busy=false;__resultReady(o.querySelector(".card h2"))},()=>{o.style.visibility="hidden";build();const h=o.querySelector(".card h2");return h&&h.textContent.trim()});
};
const _ps=pzShow;
pzShow=function(r,m){_ps(r,m);try{const sv=o.querySelector(".pzsave");if(!r||!sv||o.querySelector("#pzcook"))return;
  const steps=[...o.querySelectorAll("ol li")].map(l=>l.textContent.trim()).filter(Boolean);if(!steps.length)return;
  const b=document.createElement("button");b.id="pzcook";b.className="go";b.innerHTML=I("flame")+"Start cooking";sv.parentNode.prepend(b);try{sv.parentNode.before(window.__noteBlock(r.title||"Pizza"))}catch(_){}
  const list=[...o.querySelectorAll("ul.ing li")].map(l=>{const sp=l.querySelectorAll(":scope>span");return[(sp[0]?sp[0].firstChild.textContent:"").trim(),(l.querySelector(".q")||{}).textContent||""]}).filter(x=>x[0]);
  b.onclick=()=>window.__cook({title:r.title||"Pizza",steps,list})}catch(e){console.error(e)}};
const _d=draw;
draw=function(){_d();const b=$("spin");if(b&&!b.disabled){b.textContent="Spin"}};
draw();
})();
/* ---- spinner stage: the same size everywhere; while spinning the art swaps: logo pizza, pot, pizza slices (add burger, pasta... to ARTS) ---- */
(function(){
const cookReel=$("reel"),pzReel=$("pzreel");if(!cookReel||!pzReel)return;
const potEl=cookReel.querySelector(".toss"),wedgeEl=pzReel.querySelector(".spinwrap");if(!potEl||!wedgeEl)return;
potEl.querySelectorAll(".ing i").forEach(i=>{const g=window.__ico&&window.__ico(i.textContent.trim());if(g&&g!==i.textContent.trim())i.innerHTML=g}); // drawn icons instead of emoji
/* the pizza spinner is the logo pizza: a whole pie, every slice different, with the slices dealt into random places each time it appears */
const ORB=[["🍅","🧀","🍄","🫑"],["🌿","🫒","🧅"]];
function orbitHTML(){const ic=e=>{const g=window.__ico&&window.__ico(e);return g&&g!==e?g:e};let k=0;
  return ORB.map((r,ri)=>`<div class="pzo" style="--m:${ri?1.2:1.8}">${r.map((e,n)=>`<div class="ing" style="--k:${k++};--r:${Math.round(n*360/r.length+ri*45)}deg;--R:calc(var(--D)*${ri?.13:.30})"><u><i>${ic(e)}</i></u></div>`).join("")}</div>`).join("")}
window.__pizzaOrbit=orbitHTML;
function pizzaSVG(orbit){const sym=document.getElementById("logo-pizza");const wrap=h=>orbit===false?h:`<div class="lgw">${h}${orbitHTML()}</div>`;if(!sym)return wrap('<svg class="lg" viewBox="0 0 128 128" aria-hidden="true"><use href="#logo-pizza"/></svg>');
  const base=[],gr=[];[...sym.children].forEach(n=>{if(n.tagName.toLowerCase()==="path"&&/^M64 64L/.test(n.getAttribute("d")||""))gr.push([n]);else if(gr.length)gr[gr.length-1].push(n);else base.push(n)});
  const ord=gr.map((_,i)=>i);for(let i=ord.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ord[i],ord[j]]=[ord[j],ord[i]]}
  const ser=n=>new XMLSerializer().serializeToString(n).replace(/ xmlns="[^"]*"/g,"");
  return wrap(`<svg class="lg" viewBox="0 0 128 128" aria-hidden="true">${base.map(ser).join("")}${gr.map((g,i)=>`<g transform="rotate(${(ord[i]-i)*360/gr.length} 64 64)">${g.map(ser).join("")}</g>`).join("")}</svg>`)}
window.__pizzaSVG=pizzaSVG;
const ART={pot:potEl.outerHTML,...(window.__craftArts||{}),logo:pizzaSVG()};
window.__art=ART;
const root=document.documentElement.style,setD=()=>{const D=Math.round(Math.max(150,Math.min(innerWidth*.58,innerHeight*.34,230)));root.setProperty("--D",D+"px");root.setProperty("--kp",(D*.86/168).toFixed(3));root.setProperty("--kw",(D*.86/141).toFixed(3))};
setD();addEventListener("resize",setD);
const rm=()=>matchMedia("(prefers-reduced-motion:reduce)").matches,STEP=620;
const NOMIX=["dairy"];window.__noMix=NOMIX; // fermenting spinners keep to their own section and stay out of the mix
const POOL=["logo","pot"].concat(Object.keys(window.__craftArts||{})).filter(k=>ART[k]&&!NOMIX.includes(k)); // Cook and the start wheel mix all of these; each section keeps its own art (Pizza: slices only, Burger: burger, Ferment: jar)
const rndArt=(n,cur)=>{let k;do{k=Math.floor(Math.random()*n)}while(n>1&&k===cur);return k}; // random, never the same twice in a row
window.__rndArt=rndArt;
const stageHTML=pool=>`<div class="stage">${pool.map(k=>`<div class="art">${ART[k]}</div>`).join("")}</div>`;
function wire(reel,old,pool){
  old.insertAdjacentHTML("beforebegin",stageHTML(pool));old.remove();
  const arts=[...reel.querySelectorAll(".stage>.art")];let i=-1,t=null;
  const step=()=>{i=rndArt(arts.length,i);const lg=arts[i].querySelector(".lgw");if(lg)lg.outerHTML=pizzaSVG();arts.forEach((a,k)=>a.classList.toggle("on",k===i))};
  let live=false,last=0; // the art swaps on the same tick as the name (see mrSpinNames), never on its own timer, so both change together
  new MutationObserver(()=>{if(reel.classList.contains("on")){if(live)return;live=true;i=-1;step();last=performance.now()}else live=false}).observe(reel,{attributes:true,attributeFilter:["class"]});
  (window.__spinHooks=window.__spinHooks||[]).push(()=>{if(!live||rm()||arts.length<2)return;const n=performance.now();if(n-last>=STEP){last=n;step()}});
}
wire(cookReel,potEl,POOL);wire(pzReel,wedgeEl,["logo"]);
window.__artStep=STEP;
})();
