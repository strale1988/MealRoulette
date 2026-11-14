/* js/ui/nudges-and-log.js: Share/save, time-of-day and use-it-first nudges, cooking log, keyboard shortcuts, portrait lock. */
/* ---- more polish: share, save toggle, clear fridge ---- */
(function(){
const _s2=show;
show=function(r,m){_s2(r,m);if(!r)return;try{
  const card=$("out").querySelector(".card"),row=card&&card.querySelector(".row"),sv=$("save");if(!row||!sv)return;
  const has=()=>(store("mr-favs2")||[]).some(x=>x.title===r.title);
  const paint=()=>{sv.setAttribute("aria-pressed",has());sv.innerHTML=I("heart")+(has()?"Saved":"Save")};
  sv.onclick=()=>{let f=store("mr-favs2")||[];if(has())f=f.filter(x=>x.title!==r.title);else f.unshift({...r,meal:S.meal});store("mr-favs2",f.slice(0,40));favs();paint();navigator.vibrate&&navigator.vibrate(15)};paint();
  const b=document.createElement("button");b.id="sharer";b.innerHTML=I("share")+"Share";
  const text=()=>r.title+"\n"+r.min+" min · serves "+r.n+"\n\nIngredients\n"+r.ing.map(i=>"• "+i.name+" – "+Q(i)).join("\n")+"\n\nMethod\n"+r.steps.map((x,k)=>(k+1)+". "+cv(x)).join("\n")+"\n\nMade with Meal Roulette";
  b.onclick=()=>window.__shareOut("r",{...r,meal:S.meal},r.title,r.title+" · "+r.min+" min · serves "+r.n,b,text);
  const shop=$("shop");shop?shop.after(b):row.append(b);
}catch(e){console.error(e)}};
const cf=document.createElement("button");cf.id="clearfridge";cf.className="lnk";cf.hidden=true;cf.textContent="Clear fridge";cf.style.cssText="display:block;margin:8px 2px 0;font-size:13px";
$("quick").after(cf);
cf.onclick=()=>{if(!S.pantry.length)return;S.pantry=[];S.urgent=[];save();clearCurrentForInventoryChange();draw()};
const _d2=draw;draw=function(){_d2();cf.hidden=S.pantry.length<2};cf.hidden=S.pantry.length<2;
})();
/* ---- smarter: time-of-day meal, "use it first" nudges for ageing food, quick-add chips that learn ---- */
(function(){
const DAY=864e5,LIM={meat:3,veg:5,dairy:7},today=new Date().toDateString();
let ages=store("mr-ages")||{},freq=store("mr-freq")||{};
// 1) meal type follows the time of day until you pick one yourself today
$("meals").addEventListener("click",e=>{if(e.target.closest(".tile"))store("mr-pick",today)},true);
if(store("mr-pick")!==today){const h=new Date().getHours(),m=h>=5&&h<11?"Breakfast":h>=11&&h<15?"Main":h>=15&&h<17?"Snack":h>=17&&h<22?"Main":"Snack";
  if(m!==S.meal){S.meal=m;S.pm={[m]:true};save();$("note").textContent="It's "+(h<11?"morning":h<15?"midday":h<17?"afternoon":h<22?"evening":"late")+", so "+({Breakfast:"breakfast",Main:"a main meal",Snack:"a snack"}[m]||m)+" is preselected. Tap another to change it."}}
// 2) remember when items went in, and offer to prioritise the perishable ones that have waited
const hint=document.createElement("div");hint.id="agehint";hint.className="agehint";hint.hidden=true;$("clearfridge").after(hint);
const track=()=>{let ch=false;S.pantry.forEach(p=>{if(!ages[p]){ages[p]=Date.now();freq[p]=(freq[p]||0)+1;ch=true}});Object.keys(ages).forEach(k=>{if(!S.pantry.includes(k)){delete ages[k];ch=true}});if(ch){store("mr-ages",ages);store("mr-freq",freq)}};
const waiting=()=>S.pantry.filter(p=>{if(S.urgent.includes(p)||!ages[p])return false;const e=K.match(p).map(i=>K.ING[i]).find(x=>x&&LIM[x.aisle]);return !!e&&(Date.now()-ages[p])/DAY>=LIM[e.aisle]});
function nudge(){const w=waiting();hint.hidden=!w.length;if(!w.length)return;
  const names=w.slice(0,3).map(x=>"<b>"+esc(x)+"</b>").join(w.length>2?", ":" and ");
  hint.innerHTML="<span>💡 "+names+(w.length>3?" and "+(w.length-3)+" more":"")+(w.length>1?" have":" has")+" been in your fridge a while.</span><button type=\"button\">Use first</button>";
  hint.querySelector("button").onclick=()=>{S.urgent=[...new Set([...S.urgent,...w])];save();draw()}}
// 3) quick-add chips: your own most-added items first, then the usual suspects
function chips(){const mine=Object.keys(freq).filter(k=>freq[k]>=2&&!S.pantry.includes(k)).sort((a,b)=>freq[b]-freq[a]).slice(0,6),
  list=[...mine,...QUICK.filter(q=>!S.pantry.includes(q)&&!mine.includes(q))].slice(0,10);
  $("quick").innerHTML=list.map(q=>`<button data-q="${esc(q)}">+ ${esc(q)}</button>`).join("");
  $("quick").querySelectorAll("button").forEach(b=>b.onclick=()=>{S.pantry.push(b.dataset.q);save();draw()})}
const _d3=draw;draw=function(){_d3();try{track();nudge();chips()}catch(e){console.error(e)}};
draw();
})();
/* cook spinner tosses what is actually in your fridge */
(function(){
const EM=[[/chicken|poultry|turkey/,"🍗"],[/beef|steak|mince|pork|ham|bacon|sausage|lamb/,"🥩"],[/salmon|fish|tuna|cod|prawn|shrimp/,"🐟"],[/egg/,"🥚"],[/rice/,"🍚"],[/pasta|spaghetti|noodle|macaroni|orzo/,"🍝"],[/tomato/,"🍅"],[/spinach|lettuce|kale|cabbage|salad|herb|basil|parsley/,"🥬"],[/potato/,"🥔"],[/mushroom/,"🍄"],[/cheese|cheddar|feta|parmesan|mozzarella/,"🧀"],[/onion|leek/,"🧅"],[/garlic/,"🧄"],[/carrot/,"🥕"],[/lemon|lime/,"🍋"],[/pepper|chilli|chili|paprika/,"🌶️"],[/bread|toast|bun/,"🍞"],[/milk|cream|yogurt|yoghurt/,"🥛"],[/butter/,"🧈"],[/corn/,"🌽"],[/avocado/,"🥑"],[/broccoli|cauliflower/,"🥦"],[/banana/,"🍌"],[/apple|pear/,"🍎"],[/bean|lentil|chickpea/,"🫘"],[/cucumber|courgette|zucchini/,"🥒"],[/aubergine|eggplant/,"🍆"]];
const DEF=["🍅","🥕","🧄","🍋","🧀","🍄"];
function fill(){const mine=[];[...S.pantry,...(S.useLeftovers?S.leftovers:[])].forEach(p=>{const e=(EM.find(x=>x[0].test(p.toLowerCase()))||[])[1];if(e&&!mine.includes(e))mine.push(e)});
  const list=[...shufA(mine).slice(0,6)];DEF.forEach(e=>{if(list.length<6&&!list.includes(e))list.push(e)});
  document.querySelectorAll("#reel .toss .ing i").forEach((el,k)=>{const e=list[k]||DEF[k],g=window.__ico&&window.__ico(e);if(g&&g!==e)el.innerHTML=g;else el.textContent=e})} // drawn icons, same set as the other spinners (emoji only if one is missing)
const _r2=run;run=function(){try{fill()}catch(e){}return _r2.apply(this,arguments)};
})();

/* ---- cooking log (local only), keyboard shortcuts ---- */
(function(){
  const day=ts=>new Date(ts).toDateString(),DAY=864e5;
  const log=()=>store("mr-cooklog")||[];
  function streak(l){const d=new Set(l.map(x=>day(x.d)));let t=Date.now();if(!d.has(day(t)))t-=DAY;let n=0;while(d.has(day(t))){n++;t-=DAY}return n}
  window.__logCooked=function(title){const l=log();l.unshift({t:title,d:Date.now()});store("mr-cooklog",l.slice(0,300));renderLog();const n=l.length+0,st=streak(l);return "Meal #"+n+(st>1?" · "+st+"-day streak":"")};
  function ago(ts){const n=Math.round((new Date(day(Date.now()))-new Date(day(ts)))/DAY);return n<=0?"today":n===1?"yesterday":n+" days ago"}
  function renderLog(){
    const b=$("cooklogbody");if(!b)return;const l=log();
    if(!l.length){b.innerHTML='<p class="hint" style="margin:0">Finish a recipe in cooking mode and it shows up here, with your streak. Saved on this device only.</p>';return}
    const wk=l.filter(x=>Date.now()-x.d<7*DAY).length,st=streak(l);
    const names=["S","M","T","W","T","F","S"];let dots="";
    for(let i=6;i>=0;i--){const t=Date.now()-i*DAY;dots+=`<i class="${l.some(x=>day(x.d)===day(t))?"on":""}" title="${esc(day(t))}">${names[new Date(t).getDay()]}</i>`}
    b.innerHTML=`<div class="cl-stats"><div><b>${l.length}</b><span>meals cooked</span></div><div><b>${st}</b><span>day streak</span></div><div><b>${wk}</b><span>this week</span></div></div><div class="cl-days" aria-label="Last 7 days">${dots}</div><ul class="cl-list">${l.slice(0,5).map(x=>`<li>${esc(x.t)}<span>${ago(x.d)}</span></li>`).join("")}</ul><button type="button" class="lnk" id="clearlog" style="display:block;margin:12px 0 0;font-size:13px">Clear log</button>`;
    $("clearlog").onclick=()=>{if(confirm("Clear your cooking log?")){store("mr-cooklog",[]);renderLog()}};
  }
  renderLog();
  const _st=setTab;setTab=function(t){const r=_st.apply(this,arguments);if(t==="kit")renderLog();return r};
  document.addEventListener("keydown",e=>{
    if(e.metaKey||e.ctrlKey||e.altKey||e.defaultPrevented)return;
    const el=e.target;if(el&&el.closest&&el.closest("input,textarea,select,button,a,[contenteditable],[role=listbox]"))return;
    const k=e.key.toLowerCase(),tabs=["cook","craft","kit"],H=window.__home;
    if(document.querySelector(".cookov"))return;
    if(H&&H.up()){if(k>="2"&&k<="4"){e.preventDefault();H.from=false;H.hide();setTab(tabs[+k-2])}return} // on the wheel itself: 2-4 open the app on that page
    if(k==="1"){if(H&&H.open&&H.open())e.preventDefault();return} // 1 = the start wheel, from any page (also from a recipe the wheel gave you)
    if(document.documentElement.classList.contains("homeres"))return;
    if(k>="2"&&k<="4"){setTab(tabs[+k-2]);return}
    if(tab==="cook"){if(k==="s"){const b=$("spin");if(b&&!b.disabled)b.click()}else if(k==="w"){const b=$("remix");if(b&&!b.disabled)b.click()}}
  });
})();


/* ---- portrait only on phones: the lock is accepted when installed to the home screen (the manifest also says portrait); a normal browser tab ignores it ---- */
(function(){
  const lock=()=>{try{const o=screen.orientation;if(o&&o.lock&&matchMedia("(hover:none) and (pointer:coarse)").matches)o.lock("portrait").catch(()=>{})}catch(e){}};
  lock();addEventListener("pointerdown",lock,{once:true});
})();

