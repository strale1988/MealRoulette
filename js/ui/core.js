/* js/ui/core.js: Constants, meal names, grams-everywhere densities, diets, screen-reader focus, units. */
const K=window.KITCHEN,$=id=>document.getElementById(id);
const MEALS=[["Breakfast","sunrise","Morning"],["Snack","cookie","Bite"],["Main","chef","Big plate"],["Dessert","cupcake","Treat"]];
const normM=m=>m==="Lunch"||m==="Dinner"?"Main":m,isMain=m=>normM(m)==="Main",ML=m=>(MEALS.find(x=>x[0]===normM(m))||[])[2]||m;
/* ---- grams everywhere: ml amounts become grams using a density for the ingredient ---- */
const DENS=[[/\boil\b/,.92],[/honey|syrup|molasses/,1.4],[/flour|cornflour|starch/,.55],[/baking powder|baking soda|bicarb/,.9],[/sugar/,.85],[/cocoa/,.45],[/\bsalt\b/,1.2],[/\boats?\b/,.4],[/cumin|paprika|turmeric|cinnamon|garam|oregano|thyme|pepper|spice/,.45]];
const dens=n=>(DENS.find(d=>d[0].test(String(n).toLowerCase()))||[0,1])[1];
const Q=i=>(S.units!=="us"&&i.u==="ml"&&typeof i.a==="number")?fmt(i.a*dens(i.name),"g"):cv(i.txt);
const DIETS=[["veg","Vegetarian","leaf"],["vegan","Vegan","leaf"],["gf","Gluten-free","wheat"],["dairy","Dairy-free","ban"],["nuts","Nut-free","ban"],["noegg","Egg-free","ban"],["nofish","Fish-free","ban"],["nosoy","Soy-free","ban"],["halal","Halal","check"],["kosher","Kosher","check"],["pesc","Pescatarian","leaf"],["nopork","Pork-free","ban"],["noshell","Shellfish-free","ban"]];
const LQUICK=["leftover chicken","cooked rice","cooked pasta","cooked potatoes","leftover roast beef","leftover pork or ham","leftover cooked fish","leftover roast vegetables","stale bread"];
const QUICK=["chicken","eggs","rice","tomatoes","spinach","salmon","potatoes","mushrooms","tofu","pasta"];
const I=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd=a=>a[Math.floor(Math.random()*a.length)],cap=s=>s[0].toUpperCase()+s.slice(1);
const shufA=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* screen readers: when a spin finishes, say which recipe opened and move focus to its heading (without scrolling) */
window.__resultReady=function(h){try{
  if(!h||!h.isConnected)return;const t=h.textContent.trim();if(!t)return;
  let L=document.getElementById("mrlive");
  if(!L){L=document.createElement("div");L.id="mrlive";L.setAttribute("role","status");L.setAttribute("aria-live","polite");L.setAttribute("aria-atomic","true");L.style.cssText="position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap";document.body.appendChild(L)}
  L.textContent="";setTimeout(()=>{L.textContent="Opened "+t},60);
  if(!h.hasAttribute("tabindex"))h.setAttribute("tabindex","-1");h.style.outline="none";h.focus({preventScroll:true})}catch(e){}};
window.mrSpinNames=function(el,names,done,peek){let d=70,t=0;const tick=()=>{el.textContent=names[Math.floor(Math.random()*names.length)];(window.__spinHooks||[]).forEach(f=>{try{f()}catch(e){}});t+=d;if(t>=1500)return setTimeout(()=>{let n=null;if(peek){try{n=peek()}catch(e){console.error(e)}}if(n){el.textContent=n;setTimeout(done,750)}else done()},350);d=Math.round(d*1.15);setTimeout(tick,d)};tick()}; // every spinner shows names the same way for the same time
window.mrNoSpin=()=>{try{return JSON.parse(localStorage.getItem("mr-spins"))===0}catch(e){return false}};
const store=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||"null");localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const S=Object.assign({meal:"Main",n:2,pantry:[],diet:{},cuisine:"",strict:true,basic:true,days:5,pm:{Main:true},urgent:[],quick:false,staples:[],useLeftovers:false,leftovers:[],units:"metric",temp:"C"},store("mr-state")||{});
if(!Array.isArray(S.pantry))S.pantry=[];
if(!Array.isArray(S.urgent))S.urgent=[];
if(!Array.isArray(S.staples))S.staples=[];
if(!Array.isArray(S.leftovers))S.leftovers=[];
S.meal=normM(S.meal)||"Main";S.pm=Object.assign({},S.pm);if(S.pm.Lunch||S.pm.Dinner)S.pm.Main=true;delete S.pm.Lunch;delete S.pm.Dinner;if(!MEALS.some(m=>S.pm[m[0]]))S.pm[S.meal]=true;
const SQUICK=["rice","pasta","eggs","flour","canned tomatoes","milk","butter","onions","potatoes","olive oil","sugar","bread"];
const save=()=>store("mr-state",S),dietP=x=>({...S.diet,urgent:S.urgent,...x});
// Migrate leftovers previously stored in the general fridge list into the dedicated inventory.
const legacyLeft=[...new Set([...S.pantry,...S.staples].filter(p=>K.match(p).some(id=>K.ING[id]&&K.ING[id].aisle==="left")))];
if(legacyLeft.length){S.leftovers=[...new Set([...S.leftovers,...legacyLeft])];S.pantry=S.pantry.filter(p=>!legacyLeft.includes(p));S.staples=S.staples.filter(p=>!legacyLeft.includes(p));S.urgent=S.urgent.filter(p=>!legacyLeft.includes(p));S.useLeftovers=true;save();}
S.leftovers=[...new Set(S.leftovers)];

/* ---------- units ----------
   The engine and recipes always write metric (fmt). cv() converts that text for display, so
   switching units re-renders everything, including saved recipes and plans. */
function fmt(v,u){
  if(u==="pcs")return Math.max(0.5,Math.round(v*2)/2)+" pcs";
  v=v<10?Math.round(v*2)/2:v<50?Math.round(v):Math.round(v/5)*5;
  if(u==="g"&&v>=1000)return v/1000+" kg";if(u==="ml"&&v>=1000)return v/1000+" l";return v+" "+u;
}
const FRS=[[0,""],[1/8,"⅛"],[1/4,"¼"],[1/3,"⅓"],[1/2,"½"],[2/3,"⅔"],[3/4,"¾"],[1,""]];
function frac(x){let w=Math.floor(x),f=x-w,b=FRS.reduce((a,c)=>Math.abs(c[0]-f)<Math.abs(a[0]-f)?c:a);if(b[0]===1){w++;b=FRS[0]}if(!w&&!b[0])return"⅛";return(w||"")+(w&&b[1]?" ":"")+b[1]}
function fmtUS(v,u){
  if(u==="g"){
    if(v>=454)return frac(Math.round(v/453.6*4)/4)+" lb";
    if(v>=28)return frac(Math.round(v/28.35*2)/2)+" oz";
    if(v>=15)return frac(Math.round(v/15*2)/2)+" tbsp";
    return frac(v/5)+" tsp";
  }
  if(v<15)return frac(v/5)+" tsp";
  if(v<60)return frac(Math.round(v/15*2)/2)+" tbsp";
  const c=v/240;return frac(c)+(Math.round(c*8)/8>1?" cups":" cup");
}
function cv(t){
  t=String(t);
  if(S.units==="us"){
    t=t.replace(/(\d+(?:\.\d+)?)\s?(kg|g|ml|l|cm)\b/g,(m,n,u)=>{n=+n;return u==="kg"?fmtUS(n*1000,"g"):u==="g"?fmtUS(n,"g"):u==="ml"?fmtUS(n,"ml"):u==="l"?fmtUS(n*1000,"ml"):frac(Math.round(n/2.54*4)/4)+" in"});
    t=t.replace(/(\d+(?:\.\d+)?) litres?/g,(m,n)=>frac(Math.round(n*1.0567*4)/4)+" qt").replace(/per litre/g,"per quart");
  }
  if(S.units!=="us")t=t.replace(/(\d+(?:\.\d+)?) ml\b/g,(m,n)=>fmt(+n,"g")).replace(/(\d+(?:\.\d+)?) l\b/g,(m,n)=>fmt(+n*1000,"g"));
  if(S.temp==="F")t=t.replace(/(\d+)\s?°C/g,(m,c)=>Math.round((c*9/5+32)/5)*5+" °F");
  return t;
}
const stem=x=>x.replace(/s$/,"");
const stap=()=>S.staples.map(x=>x.toLowerCase());
const items=()=>[...new Set([...S.pantry.map(x=>x.toLowerCase()),...stap(),...(S.useLeftovers?S.leftovers.map(x=>x.toLowerCase()):[])])];
const selectedMeals=()=>[S.meal];
const isLeftId=id=>!!(K.ING[id]&&K.ING[id].aisle==="left");
const isLeftIng=i=>!!(i&&(isLeftId(i.id)||K.match(i.name||"").some(isLeftId)));
function clearCurrentForInventoryChange(){current=null;lastPlan=null;$("out").innerHTML="";$("note").textContent="";}
let tab="cook",lastPlan=null;
