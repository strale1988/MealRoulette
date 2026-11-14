/* js/ui/shake.js: Shake to spin on Cook, Pizza night and Ferment. */
/* ---- shake to spin ---- */
(function(){
  /* shake */
  const canShake="DeviceMotionEvent" in window&&matchMedia("(hover:none)").matches;
  let hits=[],last=0;
  function onMotion(e){
    const a=e.accelerationIncludingGravity;if(!a)return;
    const m=Math.sqrt((a.x||0)**2+(a.y||0)**2+(a.z||0)**2),t=Date.now();
    if(Math.abs(m-9.8)>14){hits=hits.filter(h=>t-h<700);hits.push(t);
      if(hits.length>=3&&t-last>2500){hits=[];last=t;
        const ae=document.activeElement;if(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName))return;
        const H=window.__home;if(H&&H.up()){H.spin();navigator.vibrate&&navigator.vibrate(30);return}if(document.querySelector(".cookov,.reel.on,.fmreel"))return;if(H&&H.roll&&H.again()){navigator.vibrate&&navigator.vibrate(30);return}
        const b=tab==="cook"?$("spin"):tab==="pizza"?$("pzspin"):tab==="ferm"?document.querySelector("#tab-ferm .fmspin"):document.querySelector("#tab-"+tab+" .fmspin[data-spin]");
        if(b&&!b.disabled){b.click();navigator.vibrate&&navigator.vibrate(30)}}}
  }
  const set=v=>{if(v){addEventListener("devicemotion",onMotion)}else removeEventListener("devicemotion",onMotion)};
  if(canShake&&store("mr-shake")===1)set(true);
  /* start screen = home: the pizza spins once like it is loading, then waits. Tap it (or shake) for a random recipe;
     closing the recipe brings you back here; "Full app" opens the whole app. */
  {const sp=document.getElementById("splash");
  if(sp){
    const pz=sp.querySelector(".sp-pizza"),go=document.getElementById("spgo"),hint=document.getElementById("sph"),rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
    let ready=false,busy=false,load=null;
    let hintHtml="";
    const mkHint=pre=>{const t=canShake&&store("mr-shake")===1?"Tap anywhere or shake your phone to spin a new recipe":"Tap anywhere to spin a new recipe";return (pre?`<span style="visibility:hidden" aria-hidden="true">${t}</span>`:rm?t:t.split(" ").map((w,i)=>`<span class="w" style="--w:${i}">${w}</span>`).join(" "))+funFact(pre&&!rm)};
    const funFact=(up)=>{try{const nf=new Intl.NumberFormat("en"),tot=K.recipes.length,r=wheelCount(),c=window.GEN&&GEN.combos?(v=>v<1e3?v:Math.floor(v/10**(String(Math.floor(v)).length-2))*10**(String(Math.floor(v)).length-2))(GEN.combos()):0; // counted live, so it grows with the cookbook
      const n=`<span class="cn"><i aria-hidden="true">${nf.format(r)}</i><b data-to="${r}">${up?0:nf.format(r)}</b></span>`; // the final number holds the width, the live one counts up inside it
      return r?`<span class="fact">${r<tot?`${n} of ${nf.format(tot)} recipes on your wheel`:`${n} recipes`}${c?` · ${nf.format(c)}+ Whisk combinations`:""}</span>`:""}catch(e){return""}};
    /* while the start screen loads the counter climbs to the real number, under the same hidden hint text so nothing moves when the hint appears */
    const countUp=()=>{const e=hint.querySelector(".cn b");if(!e)return;const to=+e.dataset.to,nf=new Intl.NumberFormat("en"),t0=performance.now()+300,D=1900;
      const f=t=>{if(!e.isConnected)return;const p=Math.min(1,Math.max(0,(t-t0)/D));e.textContent=nf.format(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
    const wheel=sp.querySelector(".sp-wheel"),AR=window.__art;let overlays=[];
    const OV=AR?["pot"].concat(Object.keys(window.__craftArts||{})).filter(k=>AR[k]&&!(window.__noMix||[]).includes(k)):[]; // the pizza logo itself is the 4th art
    if(AR&&OV.length){wheel.insertAdjacentHTML("beforeend",OV.map(k=>`<div class="art">${AR[k]}</div>`).join(""));overlays=[...wheel.querySelectorAll(":scope>.art")]}
    let cyc=null,rot=null,ci=-1,landed=false,spinLast=0;
    const orb=null; /* no flying toppings on the start screen */
    const nA=()=>overlays.length+1,showArt=i=>{ci=i;if(i===0&&window.__pizzaSVG)pz.innerHTML=__pizzaSVG(false);pz.style.visibility=i===0?"visible":"hidden";orb&&orb.classList.toggle("off",i!==0);overlays.forEach((a,k)=>a.classList.toggle("on",k+1===i))};
    const cycStart=ms=>{if(!overlays.length||rm)return;clearInterval(cyc);ci=-1;const step=()=>showArt(window.__rndArt?__rndArt(nA(),ci):(ci+1)%nA());step();cyc=setInterval(step,ms||1400)}; // random start, random swaps, never the same art twice in a row
    const cycStop=()=>{clearInterval(cyc);cyc=null;if(overlays.length&&!rm)showArt(window.__rndArt?__rndArt(nA(),ci):0);else{pz.style.visibility="";overlays.forEach(a=>a.classList.remove("on"))}}; // it finishes on a random spinner, every time
    (window.__spinHooks=window.__spinHooks||[]).push(()=>{if(landed||!sp.classList.contains("spinning")||!overlays.length||rm)return;const n=performance.now();if(n-spinLast>=(window.__artStep||620)){spinLast=n;showArt(window.__rndArt?__rndArt(nA(),ci):0)}});
    // loading: the pizza just keeps turning at the idle speed; the other spinners only appear once a spin starts
    const names=()=>{const z=((window.PZ&&PZ.recipes)||[]).map(x=>x.title||x.name).filter(Boolean);
      return RECIPES.map(r=>r.title).concat(Object.keys(GEN.cuisines).map(c=>c+" "+rnd(["chicken bowl","stir-fry","curry","traybake","stew"])),z)};
    /* the start wheel mixes the app's spinners: add a kind here (e.g. burger) and it joins the roulette */
    const KINDS=[...["Main","Breakfast","Snack","Dessert"].map(m=>({key:"cook-"+m,cook:m==="Main"?2:1,go:i=>{window.__plainRoll(m);setTab("cook");run("spin",true,i)}})),{key:"pizza",w:1,art:"wedge",go:i=>{setTab("pizza");pzRun("spin",i)}}];
    /* the Craft meals and treats are on the wheel too (burgers, pasta, noodles, soups...): each opens its own tool and spins a random build */
    const CRAFTK=["burger","pasta","noodle","soup","salad","sandwich","dumpling","eggs","grain","bake","frozen"];
    const allKinds=()=>KINDS.concat(window.__spinCraft?CRAFTK.filter(id=>window.__craftHas(id)).map(id=>({key:id,w:1,go:i=>{setTab(id);window.__spinCraft(id,i)}})):[]);
    /* My kitchen > "On the start wheel": the kinds switched off there (stored as a list of keys) never come up; if everything were off, everything counts */
    const WOFF="mr-wheeloff",wOff=()=>new Set(Array.isArray(store(WOFF))?store(WOFF):[]);
    const kinds=()=>{const a=allKinds(),off=wOff(),on=a.filter(k=>!off.has(k.key));return on.length?on:a};
    /* how many cookbook recipes the wheel can land on right now: the meal kinds and Craft tools switched on, minus anything the diet filters rule out and anything that is only part of a meal */
    const wheelCount=()=>{const ks=kinds(),meals=new Set(ks.filter(k=>k.cook).map(k=>k.key.slice(5))),cr=new Set(ks.filter(k=>!k.cook).map(k=>k.key));
      return RECIPES.filter(r=>K.allowed(r,S.diet)&&!isPart(r)&&!r.ids.some(isLeft)&&(r.meals.some(m=>meals.has(m))||(r.craft&&cr.has(r.craft)))).length};
    let lastKind=null; // equal chance for every kind, but never the same kind twice in a row
    /* the cookbook (all its recipes, split Main 2 : Breakfast 1 : Snack 1 : Dessert 1) gets COOKSHARE of the wheel, the Craft builds and Pizza night share the rest: before, every Craft tool had a slot as big as the whole cookbook's, so builds came up three times in four */
    const COOKSHARE=.5;
    const pick=()=>{let KS=kinds().filter(k=>k.key!==lastKind);
      const ck=KS.filter(k=>k.cook),ot=KS.filter(k=>!k.cook),cs=ck.reduce((t,k)=>t+k.cook,0),os=ot.reduce((t,k)=>t+k.w,0),sh=!ck.length?0:!ot.length?1:COOKSHARE;
      const wt=k=>k.cook?sh*k.cook/cs:(1-sh)*k.w/os;
      const r0=KS.reduce((t,k)=>t+wt(k),0);let r=Math.random()*r0;const k=KS.find(k=>(r-=wt(k))<0)||KS[0];lastKind=k.key;return k};
    let _from=false;
    const H=window.__home={
      up:()=>sp.isConnected&&ready&&!sp.classList.contains("out"),kinds:allKinds,count:()=>{try{return wheelCount()}catch(e){return 0}},
      hide(){sp.classList.add("out");sp.inert=true;go.tabIndex=-1},
      show(now){busy=false;H.roll=false;sp.classList.remove("spinning");cycStop();sp.inert=false;if(now)sp.classList.add("nofade");sp.classList.remove("out","ready");hint.classList.remove("tick");hint.style.animation="";hintHtml=mkHint();hint.innerHTML=hintHtml;void sp.offsetWidth;sp.classList.add("ready");go.tabIndex=0;scrollTo({top:0});if(now)requestAnimationFrame(()=>requestAnimationFrame(()=>sp.classList.remove("nofade")))},
      open(){ // the logo in the top left brings you back to this screen
        if(!sp.isConnected||!ready||document.querySelector(".cookov"))return false;
        H.from=false;H.show(true);try{window.__leaveCook&&window.__leaveCook();window.__leavePizza&&window.__leavePizza();window.__leaveFerm&&window.__leaveFerm();window.__leaveCraft&&window.__leaveCraft();setTab("cook")}catch(e){console.error(e)}return true},
      spin(){
        if(busy||!H.up())return;let a0=0;try{const m=new DOMMatrix(getComputedStyle(pz).transform);a0=Math.atan2(m.b,m.a)*180/Math.PI}catch(e){} // where the idle turn is right now
        busy=true;sp.classList.add("spinning");const k=pick();
        let built=false;const build=()=>{if(built)return;built=true;H.from=true;H.roll=true;try{k.go(true)}catch(e){console.error(e)}};
        const fire=()=>{build();cycStop();if(rot){const r=rot;rot=null;setTimeout(()=>r.cancel(),500)}H.hide();busy=false;setTimeout(()=>{const t=typeof tab==="string"?tab:"";__resultReady(document.querySelector("#tab-"+t+" :is(#out,#pzout,[data-out]) .card h2"))},80)};
        if(rm||mrNoSpin()){fire();return}
        landed=false;clearInterval(cyc);cyc=null;ci=-1;if(overlays.length&&!rm){showArt(window.__rndArt?__rndArt(nA(),ci):0);spinLast=performance.now()} // from here the art swaps on the name ticks
        if(pz.animate){const rev=(parseFloat(getComputedStyle(sp).getPropertyValue("--rev"))||2.4)*1000; // constant speed, the same turn time as every other spinner
          rot=pz.animate([{transform:`rotate(${a0}deg)`},{transform:`rotate(${a0+360}deg)`}],{duration:rev,iterations:Infinity,easing:"linear"})}
        hint.classList.add("tick");hint.style.animation="none";
        const peek=()=>{landed=true;clearInterval(cyc);cyc=null; // the wheel keeps swapping at random to the end, then lands on the art that matches the pick (slices = Pizza night)
          if(overlays.length&&!rm){let i;if(k.art==="wedge")i=0;else{do i=Math.floor(Math.random()*nA());while(i===0&&nA()>1)}showArt(i)} // pizza pick lands on the pizza; Cook lands on any other spinner
          build(); // the recipe is built behind the wheel and its title is the last name shown
          const t=typeof tab==="string"?tab:"",h=document.querySelector("#tab-"+t+" :is(#out,#pzout,[data-out]) .card h2");return h&&h.textContent.trim()};
        mrSpinNames(hint,names(),fire,peek); // same name ticker as the Cook spinner
      }};
    Object.defineProperty(H,"from",{configurable:true,enumerable:true,get:()=>_from,set:v=>{_from=!!v;document.documentElement.classList.toggle("homeres",_from)}}); // desktop: a recipe from the wheel shows alone, as a centred card
    const makeReady=()=>{
      if(ready||!sp.isConnected)return;ready=true;
      const txt="Tap anywhere for a random recipe";
      hintHtml=mkHint();hint.innerHTML=hintHtml;
      sp.removeAttribute("role");sp.setAttribute("aria-label","Meal Roulette. "+txt);
      go.tabIndex=0;sp.classList.add("ready");
    };
    /* a recipe that came from the start wheel keeps rolling the wheel: "Again" (or a shake) picks a new kind at random, instead of repeating whichever kind it landed on */
    H.roll=false;
    H.again=()=>{if(!H.roll||!H.from||busy)return false;try{window.__leaveCook&&__leaveCook();window.__leavePizza&&__leavePizza();window.__leaveCraft&&__leaveCraft();H.show(true);setTimeout(()=>H.spin(),60)}catch(e){console.error(e)}return true}; // "Again" runs the start wheel again: random spinners to the end, then it lands on its pick
    document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#again,.pzagain,.crafttab.resmode [data-a=rand],#spin,#remix,#pzspin,#pzremix");if(!t)return;
      if(t.matches("#again,.pzagain,.crafttab.resmode [data-a=rand]")){if(H.again()){e.stopImmediatePropagation();e.preventDefault()}}else{H.roll=false;window.__plain=false}},true); // using Spin or Remix yourself switches this off
    sp.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#spgo"))return;H.spin()}); // tap anywhere
    document.addEventListener("keydown",e=>{if(!H.up()||e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.closest&&e.target.closest("#spgo"))return;const k=e.key.toLowerCase();if(k==="enter"||k===" "||k==="s"){e.preventDefault();H.spin()}});
    document.addEventListener("keydown",e=>{ // recipe card from the start wheel: S rolls the wheel again, Esc closes
      if(!document.documentElement.classList.contains("homeres")||e.metaKey||e.ctrlKey||e.altKey||e.defaultPrevented)return;
      if(document.querySelector(".cookov,.reel.on,.pzreel.on"))return;
      const t=e.target;if(t&&t.closest&&t.closest("input,textarea,select,[contenteditable]"))return;
      const k=e.key.toLowerCase();
      if(k==="s"){e.preventDefault();H.again()}
      else if(k==="escape"){const x=document.querySelector(".tab.resmode:not([hidden]) .heroback");if(x){e.preventDefault();x.click()}}
    });
    document.addEventListener("click",e=>{ // click outside the card closes it
      if(!document.documentElement.classList.contains("homeres"))return;
      const t=e.target;if(t&&t.classList&&t.classList.contains("tab")&&t.classList.contains("resmode")){const x=t.querySelector(".heroback");if(x)x.click()}
    });
    go.onclick=e=>{e.stopPropagation();H.from=false;H.hide()};
    {const L=["Rummage through the kitchen","Raid the pantry","Peek in the fridge","Pull up a stool","Come hungry, stay curious","Stir things up yourself","Sneak into the kitchen","Snoop around the cookbook","Taste the full menu","Open the recipe vault"],gl=document.getElementById("spgl");
      if(gl){let n=Math.floor(Math.random()*L.length);gl.textContent=L[n];gl.style.transition="opacity .25s ease";
        setInterval(()=>{if(!H.up()||sp.classList.contains("spinning")||document.hidden)return;gl.style.opacity="0";setTimeout(()=>{n=(n+1+Math.floor(Math.random()*(L.length-1)))%L.length;gl.textContent=L[n];gl.style.opacity="1"},260)},3800)}}
    hint.innerHTML=mkHint(true);countUp();
    setTimeout(makeReady,rm?200:2500);
    setTimeout(makeReady,3800); // safety net
  }}
  const grid=document.querySelector("#kz-setup .kgrid");
  if(grid){
    {const NAMES={"cook-Main":"Big plates","cook-Breakfast":"Breakfasts","cook-Snack":"Snacks","cook-Dessert":"Desserts",pizza:"Pizza night"},CR=(window.KITCHEN&&KITCHEN.CRAFTS)||[],H0=window.__home,WOFF="mr-wheeloff",wOff=()=>new Set(Array.isArray(store(WOFF))?store(WOFF):[]);
      const lab=k=>NAMES[k]||((CR.find(c=>c.id===k)||{}).name)||k;
      const wp=document.createElement("section");wp.className="panel";wp.id="kitwheel";
      const num=()=>(H0&&H0.count?H0.count():0).toLocaleString("en");
      const upd=()=>{const e=wp.querySelector("[data-wcount]");if(e)e.textContent=num()};
      /* diet, household and staple changes elsewhere in My kitchen: refresh the number once their own handlers have run */
      ["click","change","input"].forEach(t=>document.addEventListener(t,()=>setTimeout(upd,60)));
      const draw=()=>{const a=H0&&H0.kinds?H0.kinds():[],off=wOff();
        wp.innerHTML=`<div class="lab"><svg class="i"><use href="#i-dice"/></svg>On the start wheel</div><p class="hint">Pick what the wheel may land on. Cookbook recipes cover big plates, breakfasts, snacks and desserts; the rest are Craft builds.</p><p class="hint"><b data-wcount>${num()}</b> recipes can come up with your diet filters and these choices.</p><div class="tg" role="group" aria-label="On the start wheel">${a.map(k=>`<button type="button" data-wk="${esc(k.key)}" aria-pressed="${!off.has(k.key)}">${esc(lab(k.key))}</button>`).join("")}</div>`;
        wp.querySelectorAll("[data-wk]").forEach(b=>b.onclick=()=>{const o=wOff(),k=b.dataset.wk;if(o.has(k))o.delete(k);else{if(a.filter(x=>!o.has(x.key)).length<=1){b.title="Keep at least one on";return}o.add(k)}store(WOFF,[...o]);draw();const f=wp.querySelector(`[data-wk="${k}"]`);if(f)f.focus()})};
      draw();grid.appendChild(wp);}
    const sec=document.createElement("section");sec.className="panel";sec.id="kitextras";
    sec.innerHTML=`<div class="lab"><svg class="i"><use href="#i-wand"/></svg>Extras</div><div class="xtra-row"><p><b>Spin animation</b>Turn off to get your result straight away.</p><div class="tg"><button type="button" id="spintg" aria-pressed="${!mrNoSpin()}">${mrNoSpin()?"Off":"On"}</button></div></div>${canShake?`<div class="xtra-row"><p><b>Shake to spin</b>Shake your phone to spin on every page that has a Spin button.</p><div class="tg"><button type="button" id="shaketg" aria-pressed="${store("mr-shake")===1}">${store("mr-shake")===1?"On":"Off"}</button></div></div>`:""}`;
    grid.appendChild(sec);
    const st=$("spintg");
    if(st)st.onclick=()=>{const on=st.getAttribute("aria-pressed")!=="true";st.setAttribute("aria-pressed",String(on));st.textContent=on?"On":"Off";store("mr-spins",on?1:0)};
    const sb=$("shaketg");
    if(sb)sb.onclick=()=>{
      const on=sb.getAttribute("aria-pressed")!=="true";
      const apply=ok=>{sb.setAttribute("aria-pressed",String(ok));sb.textContent=ok?"On":"Off";store("mr-shake",ok?1:0);set(ok)};
      if(on&&typeof DeviceMotionEvent.requestPermission==="function"){DeviceMotionEvent.requestPermission().then(r=>apply(r==="granted")).catch(()=>apply(false))}else apply(on);
    };
  }
})();
