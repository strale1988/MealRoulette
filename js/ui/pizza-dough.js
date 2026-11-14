/* js/ui/pizza-dough.js: Pizza dough sliders (fermentation and hydration). */
/* ---- pizza dough sliders (fermentation + hydration), layered on the existing state; the old buttons still work ---- */
(function(){
if(!$("pzferm")||!$("pzhyd"))return;
const mk=(h)=>{const d=document.createElement("div");d.className="sl";d.innerHTML=h;return d};
const fs=mk(`<input type="range" id="pzfsl" min="0" max="${PZ.modeOrder.length-1}" step="1" aria-label="How long to ferment"><div class="ticks" id="pzftk"></div>`);
$("pzferm").after(fs);
const hs=mk(`<div class="hbig"><b id="pzhbig"></b><span class="badge" id="pzhbadge"></span></div><input type="range" id="pzhsl" min="50" max="90" step="1" aria-label="Hydration, water to flour"><div class="ticks"><span>50 stiff</span><span>65</span><span>75</span><span>90 soupy</span></div>`);
$("pzhpre").before(hs);
const fsl=$("pzfsl"),hsl=$("pzhsl"),fill=(el)=>el.style.setProperty("--p",((el.value-el.min)/(el.max-el.min)*100)+"%");
const badge=v=>v<=58?"stiff":v<=67?"classic":v<=73?"soft":v<=80?"wet & airy":"very wet";
function sync(){
  const fm=pzFerm(),i=PZ.modeOrder.indexOf(fm),st=pzSt(),ok=m=>PZ.modesFor(S.pz.style).includes(m)&&!st.fixed;
  fsl.value=i;fill(fsl);fsl.disabled=!!st.fixed;fsl.setAttribute("aria-valuetext",PZ.modes[fm].short);
  $("pzftk").innerHTML=PZ.modeOrder.map((m,k)=>`<span class="${k===i?"on":""}${ok(m)?"":" off"}">${esc(PZ.modes[m].short)}</span>`).join("");
  const h=parseInt($("pzhyd").textContent),has=!isNaN(h);hs.hidden=!has;
  if(has){hsl.value=Math.min(90,Math.max(50,h));fill(hsl);$("pzhbig").textContent=h+"%";$("pzhbadge").textContent=badge(h)}
}
let raf=0;const later=f=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(f)};
fsl.oninput=()=>{const m=PZ.modeOrder[+fsl.value];if(!PZ.modesFor(S.pz.style).includes(m)){sync();return}S.pz.ferm=m;save();later(()=>{pzUI();pzDoughRun()})};
hsl.oninput=()=>{S.pz.hyd=+hsl.value;$("pzhbig").textContent=hsl.value+"%";$("pzhbadge").textContent=badge(+hsl.value);fill(hsl);save();later(()=>{pzUI();pzDoughRun()})};
const _u=pzUI;pzUI=function(){_u();try{sync()}catch(e){console.error(e)}};
sync();
})();
