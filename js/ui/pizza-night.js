/* js/ui/pizza-night.js: Household helpers and the Pizza night page. */
/* ---- household helpers, shared by My kitchen and Pizza night ---- */
function hhKid(a){return a<1?.15:a<3?.3:a<5?.45:a<8?.6:a<11?.75:a<14?.9:1} // share of an adult portion by age
function hhPortions(){const h=S.house;if(!h||!Array.isArray(h.kids))return Math.min(12,Math.max(1,S.n||2));return Math.min(12,Math.max(1,Math.round(h.adults+h.kids.reduce((t,a)=>t+hhKid(a),0))))}
function hhText(){const h=S.house;if(!h||!Array.isArray(h.kids))return (S.n||2)+" "+((S.n||2)===1?"person":"people");return h.adults+" "+(h.adults===1?"adult":"adults")+(h.kids.length?" + "+h.kids.length+" "+(h.kids.length===1?"kid":"kids"):"")}
/* ---------- pizza night ---------- */
const PZ=window.PIZZA;
S.pz=Object.assign({n:2,manual:false,cat:"",style:"neapolitan",ferm:"",pre:"",fresh:true,ball:0,hyd:0,classic:"",fridge:true,auto:false,sec:"dough"},S.pz||{});
if(S.pz.pool&&!S.pz.pre)S.pz.pre="poolish";delete S.pz.pool;
if(!PZ.styles[S.pz.style])S.pz.style="neapolitan";
let pzCur=null;const pzRecent=[];
const pzSt=()=>PZ.styles[S.pz.style],pzCount=()=>S.pz.manual?Math.min(12,Math.max(1,S.pz.n||1)):Math.min(12,Math.max(1,Math.ceil(hhPortions()/((S.pz.auto?1.5:PZ.styles[S.pz.style].feeds)||1.5)-.01))),pzShort=n=>n.replace(/ \(.*\)/,""),pzIsPan=st=>st.kind==="pan";
const pzFerm=()=>{const ok=PZ.modesFor(S.pz.style);return ok.includes(S.pz.ferm)?S.pz.ferm:PZ.defMode(S.pz.style)};
const pzHyd=st=>st.liq?0:(S.pz.hyd||(st.sd?st.hydTot:st.hyd));
const pzCan=(st,k)=>!!st.y&&!st.nopool&&!st.liq&&(k==="biga"?pzHyd(st)>=56&&!st.extra.length:pzHyd(st)>=45&&st.flours[0][1]>=30);
const pzPre=()=>pzCan(pzSt(),S.pz.pre)?S.pz.pre:"";
const pzOpts=()=>{const F=S.pz.fridge?new Set(fridgeIds()):new Set(),U=new Set(S.pz.fridge?S.urgent.flatMap(x=>K.match(x)):[]);
  return{diet:{...S.diet},fridge:F,urgent:U,count:pzCount(),style:S.pz.auto?undefined:S.pz.style,ferm:S.pz.auto?undefined:pzFerm(),pre:S.pz.auto?"":pzPre(),fresh:S.pz.fresh,hyd:S.pz.auto?undefined:S.pz.hyd||undefined,ball:S.pz.auto||!S.pz.ball?undefined:S.pz.ball,hasItems:S.pz.fridge&&items().length>0,basic:S.basic,cat:S.pz.cat}};
function pzSection(sec){S.pz.sec=sec;save();$("pz-dough").hidden=sec!=="dough";$("pz-build").hidden=sec!=="build";$("pzseg").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===sec));pzUI();if(sec==="dough")pzDoughRun()}
function pzHH(){
  const n=pzCount(),pz=n===1?"pizza":"pizzas",pan=pzIsPan(pzSt())?(n===1?"pan":"pans"):pz,por=hhPortions();
  $("pzhhtxt").innerHTML=S.pz.manual?`Set by hand to ${n} ${pan}. Your kitchen is ${esc(hhText())}, about ${por} ${por===1?"portion":"portions"}.`:`${I("users")}<b>${esc(hhText())}</b> · about ${por} ${por===1?"portion":"portions"} · <b>${n} ${pan}</b>`;
  $("pzhhgo").hidden=!S.pz.manual;
  $("pzhhkit").textContent=S.pz.manual?"Edit household":"Change who is eating";
}
function pzUI(){
  const st=pzSt(),fm=pzFerm();
  // dough lab
  $("pzstyles").innerHTML=PZ.groups.map(g=>`<div class="pzg">${g}</div><div class="tg">`+Object.values(PZ.styles).filter(x=>x.grp===g).map(x=>`<button data-s="${x.id}" aria-pressed="${x.id===S.pz.style}">${esc(pzShort(x.name))}</button>`).join("")+"</div>").join("");
  $("pzstyles").querySelectorAll("button").forEach(b=>b.onclick=()=>{S.pz.style=b.dataset.s;S.pz.ball=0;S.pz.hyd=0;save();pzUI();pzDoughRun()});
  $("pzsinfo").textContent=cv(`${st.from} · ${st.fixed?"no yeast":(st.liq?"milk and yogurt dough":(st.sd?st.hydTot:st.hyd)+"% hydration")} · ${st.ball} g per ${pzIsPan(st)?"pan":"ball"} · ${st.t}, ${st.bt}`);
  $("pzferm").innerHTML=PZ.modeOrder.map(m=>{const ok=PZ.modesFor(S.pz.style).includes(m);return`<button data-m="${m}" aria-pressed="${m===fm}"${ok?"":" disabled"}>${PZ.modes[m].short}</button>`}).join("");
  $("pzferm").querySelectorAll("button").forEach(b=>b.onclick=()=>{S.pz.ferm=b.dataset.m;save();pzUI();pzDoughRun()});
  $("pzfinfo").textContent=st.fixed?"No yeast, so no fermentation: it is ready in about 45 minutes.":PZ.modes[fm].info+(st.sd?" Sourdough needs an active starter; the starter share scales with the time.":"");
  const pk=pzPre();
  $("pzpre").innerHTML=[["","None"],["poolish","Poolish"],["biga","Biga"]].map(([k,l])=>`<button data-k="${k}" aria-pressed="${k===pk}"${k&&!pzCan(st,k)?" disabled":""}>${l}</button>`).join("");
  $("pzpre").querySelectorAll("button").forEach(b=>b.onclick=()=>{S.pz.pre=b.dataset.k;save();pzUI();pzDoughRun()});
  $("pzpinfo").textContent=pk==="poolish"?"Poolish: 30% of the flour with an equal weight of water, made 12–16 hours before. Sweeter, more open crumb.":pk==="biga"?"Biga: all of the flour with water at half its weight, made 16–18 hours before; the rest of the water goes in at the final mix. Nutty and chewy.":(st.y?"":"No commercial yeast in this dough, so no preferment.")||"Direct dough. Add a poolish or biga for more flavour.";
  $("pzfresh").checked=!!S.pz.fresh;$("pzfresh").disabled=!st.y;
  const hy=pzHyd(st),hr=PZ.hrange[st.id]||[st.hyd-4,st.hyd+4],defH=st.sd?st.hydTot:st.hyd;
  $("pzhyd").textContent=st.liq?"set by recipe":hy+"%";$("pzhminus").disabled=$("pzhplus").disabled=!!st.liq;
  $("pzhpre").innerHTML=st.liq?"":[60,65,70,75,80].map(v=>`<button data-h="${v}" aria-pressed="${hy===v}">${v}%</button>`).join("")+`<button data-h="0" aria-pressed="${!S.pz.hyd}">Default ${defH}%</button>`;
  $("pzhpre").querySelectorAll("button").forEach(b=>b.onclick=()=>{S.pz.hyd=+b.dataset.h;save();pzUI();pzDoughRun()});
  $("pzhinfo").textContent=st.liq?"This dough is made with milk and yogurt, so the liquid is fixed.":`Usual for ${pzShort(st.name)}: ${hr[0]}–${hr[1]}%.${hy>hr[1]?" Wetter than usual: sticky, open and tender.":hy<hr[0]?" Drier than usual: stiffer and tighter.":""} Home doughs are mostly 60–70%; 75–80% is a wet, airy dough.`;
  $("pzn").textContent=pzCount();pzHH();$("pzbl").textContent="Dough per "+(pzIsPan(st)?"pan":"ball");$("pzball").textContent=cv((S.pz.ball||st.ball)+" g");
  // build
  const bits=[pzShort(st.name),PZ.modes[fm].short,st.liq?"":hy+"% hydration",pk,st.y?(S.pz.fresh?"fresh yeast":"dried yeast"):"",`${pzCount()} × ${S.pz.ball||st.ball} g`].filter(Boolean).join(" · ");
  $("pzsel").textContent=S.pz.auto?"The dough is picked to suit each pizza. Pick it yourself in the Dough lab.":bits;
  $("pzauto").setAttribute("aria-pressed",!!S.pz.auto);
  // calzone, stromboli and fried calzone cannot be made with the gluten-free dough, so that tile (and its classics) are switched off while Gluten-free is on
  const gf=!!S.diet.gf,noFold=c=>gf&&c==="folded";
  if(noFold(S.pz.cat))S.pz.cat="";
  if(gf&&(PZ.recipes.find(r=>r.id===S.pz.classic)||{}).cat==="folded")S.pz.classic="";
  $("pzcat").innerHTML=PZ.cats.map(c=>`<button data-c="${c[0]}" aria-pressed="${S.pz.cat===c[0]}"${noFold(c[0])?' disabled title="Needs a wheat dough, so it is off while gluten-free is on"':""}>${c[1]}</button>`).join("");
  $("pzcat").querySelectorAll("button").forEach(b=>b.onclick=()=>{S.pz.cat=b.dataset.c;S.pz.classic="";save();pzUI()});
  const opts=PZ.cats.filter(c=>c[0]).map(c=>{const l=PZ.recipes.filter(r=>r.cat===c[0]);return l.length?`<optgroup label="${c[1]}"${noFold(c[0])?" disabled":""}>`+l.map(r=>`<option value="${r.id}"${S.pz.classic===r.id?" selected":""}>${esc(r.name)}</option>`).join("")+"</optgroup>":""}).join("");
  $("pzclassic").innerHTML='<option value="">Surprise me</option>'+opts;$("pzclassic").value=S.pz.classic;
  $("pzfridge").checked=!!S.pz.fridge;
  const n=items().length,dn=DIETS.filter(d=>S.diet[d[0]]).map(d=>d[1]);
  $("pzsum").textContent=`Feeding ${hhText()}. `+(S.pz.fridge?(n?`Using ${n} item${n>1?"s":""} from your fridge${S.useLeftovers&&S.leftovers.length?" and leftovers":""}.`:"Your fridge is empty. Add items on the Cook tab to get pizzas made from them."):"Ignoring your fridge.")+(dn.length?" Diet: "+dn.join(", ")+".":"")+(gf?" Calzone and folded pizzas are switched off because they need a wheat dough.":"");
  $("pzspin").lastChild.textContent=S.pz.classic?"Make this pizza":"Spin a classic";
}
const pzStep=(id,fn)=>$(id).onclick=()=>{fn();save();pzUI();if(S.pz.sec==="dough")pzDoughRun()};
pzStep("pzminus",()=>{S.pz.n=Math.max(1,pzCount()-1);S.pz.manual=true});pzStep("pzplus",()=>{S.pz.n=Math.min(12,pzCount()+1);S.pz.manual=true});
$("pzhhgo").onclick=()=>{S.pz.manual=false;save();pzUI();if(S.pz.sec==="dough")pzDoughRun()};
$("pzhhkit").onclick=()=>setTab("kit");
pzStep("pzhminus",()=>S.pz.hyd=Math.max(45,pzHyd(pzSt())-1));pzStep("pzhplus",()=>S.pz.hyd=Math.min(95,pzHyd(pzSt())+1));
pzStep("pzbminus",()=>S.pz.ball=Math.max(60,(S.pz.ball||pzSt().ball)-10));pzStep("pzbplus",()=>S.pz.ball=Math.min(1200,(S.pz.ball||pzSt().ball)+10));
$("pzfresh").onchange=e=>{S.pz.fresh=e.target.checked;save();pzUI();pzDoughRun()};
$("pzfridge").onchange=e=>{S.pz.fridge=e.target.checked;save();pzUI()};
$("pzclassic").onchange=e=>{S.pz.classic=e.target.value;save();pzUI()};
$("pzauto").onclick=()=>{S.pz.auto=!S.pz.auto;save();pzUI()};
$("pzchange").onclick=()=>pzSection("dough");
$("pzuse").onclick=()=>{S.pz.auto=false;save();pzSection("build");scrollTo({top:0})};
$("pzseg").querySelectorAll("button").forEach(b=>b.onclick=()=>pzSection(b.dataset.s));
function pzCard(r,target,msg){
  const buy=i=>!r.dough&&S.pz.fridge&&items().length>0&&!i.have&&!i.left&&!(S.basic&&i.pantry),grp=[...new Set(r.ing.map(i=>i.grp))];
  const ord=["Poolish","Biga","Dough","Sauce","Cheese","Toppings","To finish"];grp.sort((a,b)=>ord.indexOf(a)-ord.indexOf(b));
  const row=i=>`<li><span>${esc(i.name)}${buy(i)?'<span class="buy">to buy</span>':""}</span><span class="q">${esc(cv(i.txt))}${i.pct!=null&&r.dough!==undefined?` <small style="color:var(--mute)">${i.pct>=10?Math.round(i.pct):Math.round(i.pct*100)/100}%</small>`:""}</span></li>`;
  const html=`<article class="card"><div class="hero"><div class="ic">${I("pizza")}</div><h2>${esc(r.title)}</h2></div><div class="body">
  <div class="pzmeta meta"><span>${I("chef")}${esc(r.styleName)}</span><span>${I("clock")}${esc(r.fermName?r.fermName.replace(/ \(.*\)/,""):"")}</span><span>${I("clock")}Plan ahead: ${esc(r.ahead)}</span><span>${I("flame")}${esc(cv(r.bake))}</span><span>${I("users")}Feeds about ${r.feeds}</span>${r.remix?`<span>${I("wand")}Whisked</span>`:""}${r.kcal?`<span title="Rough estimate">≈${r.kcal} kcal · ${r.p} g protein each</span>`:""}</div>
  ${r.desc?`<p class="desc">${esc(cv(r.desc))}</p>`:""}${r.sum?`<p class="desc"><strong>Dough:</strong> ${esc(cv(r.sum))}. Total dough ${esc(cv(r.doughG+" g"))}, flour ${esc(cv(r.flourG+" g"))}.</p>`:""}
  ${(r.notes||[]).map(n=>`<p class="desc">${esc(n)}</p>`).join("")}${r.leftN?`<p class="desc"><strong>Uses your leftovers.</strong> They are already cooked, so they are only warmed on the pizza.</p>`:""}
  <div class="split"><div><h3>${I("list")}Ingredients <small style="text-transform:none;letter-spacing:0;color:var(--mute)">(tap to tick off${r.dough?"; % = baker's percentage":""})</small></h3>
  ${grp.map(g=>`<div class="pzgrp">${g==="Poolish"||g==="Biga"?g+" (evening before)":g==="Dough"&&(grp.includes("Poolish")||grp.includes("Biga"))?"Final dough":g}</div><ul class="ing">${r.ing.filter(i=>i.grp===g).map(row).join("")}</ul>`).join("")}</div>
  <div><h3>${I("chef")}Method</h3>${r.sections.map(sec=>`<div class="pzsec">${esc(sec.h)}</div><ol>${sec.steps.map(t=>`<li><span>${esc(cv(t))}</span></li>`).join("")}</ol>${sec.tips&&sec.tips.length?`<div class="pztips">${sec.tips.map(t=>`<p>${esc(cv(t))}</p>`).join("")}</div>`:""}`).join("")}
  ${r.ideas&&r.ideas.length?`<div class="pzsec">Try it with</div><div class="pzideas">${r.ideas.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`:""}</div></div>
  <div class="row"><button class="pzsave">${I("heart")}Save</button><button class="pzshop">${I("cart")}Copy list</button>${r.dough?`<button class="pzgo">${I("pizza")}Build a pizza</button>`:`<button class="pzagain">${I(r.remix?"wand":"dice")}Again</button>`}</div></div></article>`;
  target.innerHTML=html;
  target.querySelectorAll(".ing li").forEach(li=>li.onclick=()=>li.classList.toggle("done"));
  const sv=target.querySelector(".pzsave");sv.onclick=()=>{const f=store("mr-pzfavs")||[];if(!f.some(x=>x.title===r.title&&x.count===r.count&&x.ferm===r.ferm&&x.pre===r.pre&&x.fresh===r.fresh)){f.unshift(r);store("mr-pzfavs",f.slice(0,30))}pzFavs();sv.innerHTML=I("heart")+"Saved"};
  const sh=target.querySelector(".pzshop");sh.onclick=async()=>{const mm=r.dough?r.ing:r.ing.filter(buy),l=(mm.length?mm:r.ing).map(i=>"• "+i.name+" – "+cv(i.txt)).join("\n");try{await navigator.clipboard.writeText(l);sh.innerHTML=I("cart")+"Copied"}catch(e){$("pznote").textContent=l}};
  const ag=target.querySelector(".pzagain");if(ag)ag.onclick=()=>pzRun(r.remix?"remix":"spin");
  try{const row=target.querySelector(".row"),steps=(r.sections||[]).flatMap(x=>x.steps||[]).map(cv);
    if(window.__dinner&&row&&steps.length&&!row.querySelector("[data-a=plan]")){const pl=document.createElement("button");pl.type="button";pl.dataset.a="plan";pl.innerHTML=I("clock")+"Plan dinner";pl.onclick=()=>window.__dinner({title:r.title,steps});
      const at=row.querySelector(".pzgo");if(at)at.after(pl);else row.querySelector(".pzshop").after(pl)}}catch(e){console.error(e)}
  const go=target.querySelector(".pzgo");if(go)go.onclick=()=>{S.pz.auto=false;save();pzSection("build");scrollTo({top:0})};
}
function pzDoughRun(){
  const o=pzOpts();let r=null;try{r=PZ.dough(S.pz.style,o.count,{diet:o.diet,ferm:pzFerm(),pre:pzPre(),fresh:S.pz.fresh,hyd:S.pz.hyd||undefined,ball:S.pz.ball||undefined,fridge:o.fridge})}catch(e){console.error(e)}
  if(!r){$("pzdout").innerHTML='<div class="ph" style="display:block"><b>That dough doesn\'t fit your diet.</b>Try the gluten-free dough, or change your diet in My kitchen.</div>';return}
  pzCard(r,$("pzdout"));
}
function pzShow(r,msg){
  pzCur=r;$("pznote").textContent=msg||"";$("pzph").style.display=r?"none":"";
  if(!r){$("pzout").innerHTML="";return}
  pzCard(r,$("pzout"));
}
function pzFavs(){
  const f=store("mr-pzfavs")||[];
  $("pzfav").innerHTML=f.length?`<h3>${I("heart")}Saved pizzas and doughs</h3>`+f.map((r,i)=>`<button data-i="${i}">${I("heart")}${esc(r.title)}${r.fermName?" · "+esc(r.fermName.replace(/ \(.*\)/,"").replace("Cold ferment, ","cold ")):""}</button>`).join(""):"";
  $("pzfav").querySelectorAll("button").forEach(b=>b.onclick=()=>{const r=f[+b.dataset.i];pzSection("build");pzShow(r,"");toCard("pzout")});
}
function pzRun(what){
  const o=pzOpts();let r=null,msg="";
  try{
    if(what==="remix"){
      r=PZ.remix(o);if(!r)msg=S.diet.gf&&o.cat==="folded"?"Calzone and stromboli aren't offered gluten-free yet. Try a round pizza.":"Couldn't build a pizza that fits your diet and fridge. Try another kind or turn off the fridge.";
    }else if(S.pz.classic){
      const spec=PZ.recipes.find(x=>x.id===S.pz.classic);r=spec&&PZ.resolve(spec,o);if(!r)msg="That classic doesn't fit your diet or this dough. Try another, or change the dough.";
    }else{
      const pool=PZ.recipes.filter(x=>!o.cat||x.cat===o.cat||(o.cat==="folded"&&x.fmt)||(o.cat==="pan"&&PZ.styles[x.style].kind==="pan")).map(x=>PZ.resolve(x,o)).filter(Boolean);
      if(!pool.length)msg="No classic matches that diet, dough and kind. Try Whisk, or change the dough.";
      else{
        const sc=x=>(o.hasItems?x.urg*4+x.leftN*6+x.hit*1.5-(x.ing.filter(i=>i.grp!=="Dough"&&i.grp!=="Poolish"&&i.grp!=="Biga"&&!i.have&&!i.left&&!(S.basic&&i.pantry)).length)*1.2:0)+Math.random()*3-(pzRecent.includes(x.title)?8:0)+(()=>{const t=ratings()[x.title];return t?(t.v>0?2.5:-(Date.now()-t.t<28*864e5?12:3)):0})();
        pool.sort((a,b)=>sc(b)-sc(a));r=pool[0];
      }
    }
  }catch(e){console.error(e);msg="Something went wrong building that pizza. Try again."}
  if(r){pzRecent.push(r.title);if(pzRecent.length>8)pzRecent.shift()}
  pzShow(r,msg);if(r)$("pzout").firstElementChild.scrollIntoView({behavior:"smooth",block:"start"});
}
$("pzspin").onclick=()=>pzRun("spin");$("pzremix").onclick=()=>pzRun("remix");
$("spin").onclick=()=>run("spin");
$("logo").onclick=()=>{ // the logo goes back to the start screen (the main roulette)
  if(window.__home&&window.__home.open()){setTimeout(()=>{const H=window.__home;if(H&&H.up())H.spin()},60);return} // back on the start screen, and it spins straight away
  if(document.querySelector(".cookov,.splash:not(.out)")||$("spin").disabled)return;
  const lg=$("logo").firstElementChild;setTab("cook");run("spin",true); // same spinner as the Spin button
  if(!matchMedia("(prefers-reduced-motion:reduce)").matches&&lg.animate)lg.animate([{transform:"rotate(0)"},{transform:"rotate(720deg)"}],{duration:900,easing:"cubic-bezier(.15,.7,.2,1)"})};
$("remix").onclick=()=>run("remix");
/* the logo does a small random trick every so often, so people notice they can tap it */
(function(){
  const lg=$("logo");if(!lg||!lg.animate||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  const pz=lg.firstElementChild,
  T=[ // [target, keyframes, options]: spins and wiggles turn only the pizza, so the shadow stays in place
    [pz,[{transform:"rotate(0)"},{transform:"rotate(-18deg)"},{transform:"rotate(16deg)"},{transform:"rotate(-10deg)"},{transform:"rotate(6deg)"},{transform:"rotate(0)"}],{duration:700}],
    [pz,[{transform:"rotate(0)"},{transform:"rotate(360deg)"}],{duration:900,easing:"cubic-bezier(.3,1.3,.5,1)"}],
    [pz,[{transform:"scale(1)"},{transform:"scale(1.2)"},{transform:"scale(.94)"},{transform:"scale(1)"}],{duration:600}]
  ];
  let last=-1;
  const go=()=>{
    if(!document.hidden&&!document.querySelector(".splash:not(.out),.cookov")){let k;do k=Math.floor(Math.random()*T.length);while(k===last);last=k;T[k][0].animate(T[k][1],T[k][2])}
    setTimeout(go,5000+Math.random()*7000)};
  setTimeout(go,2500+Math.random()*2000);
})();
const cuisineOptions=[...new Set([...Object.keys(GEN.cuisines),...K.recipes.map(r=>r.cuisine).filter(Boolean)])].sort((a,b)=>a.localeCompare(b,"en",{sensitivity:"base"}));
$("cuisine").innerHTML='<option value="">Surprise me</option>'+cuisineOptions.map(c=>`<option${c===S.cuisine?" selected":""}>${c}</option>`).join("");
$("yr").textContent=new Date().getFullYear();
draw();favs();plansUI();pzFavs();pzSection(S.pz.sec==="build"?"build":"dough");

