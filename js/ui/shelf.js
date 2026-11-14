/* js/ui/shelf.js: My kitchen: the cookbook shelf. */
/* ---- My kitchen: the cookbook shelf. One book per cuisine (recipes without one share "Everyday"); diet filters hide recipes ---- */
(function(){
const box=$("shelfbox");if(!box)return;
const PAL=["#ffc63d","#ff9b82","#7fd1a6","#b9a2f0","#8ecae6","#f4a261","#f6e27a","#e86a5a"];
const hash=t=>{let h=5381;for(const c of String(t))h=((h<<5)+h+c.charCodeAt(0))>>>0;return h};
const MEALK=["Breakfast","Snack","Main","Dessert","Extra"];
let cur=null,cont=null,q="",mf="",sig="",lastW=0,back=0;
let view="all"; // regions = bookcase per continent; all = every cookbook on one packed shelf
// shelves: books are grouped by region. A cuisine not listed here lands on "More books", so nothing ever disappears.
const SHELVES=[
 ["ev","Everyday cooking",["Everyday"]],
 ["na","North America",["American","Canadian","Cajun","Mexican","Belizean","Caribbean","Costa Rican","Cuban","Dominican","Guatemalan","Haitian","Honduran","Jamaican","Nicaraguan","Panamanian","Puerto Rican","Salvadoran","Trinidadian"]],
 ["sa","South America",["Argentine","Bolivian","Brazilian","Chilean","Colombian","Ecuadorian","Guyanese","Paraguayan","Peruvian","Surinamese","Uruguayan","Venezuelan"]],
 ["eu","Europe",["Balkan","British","Czech","Danish","French","German","Greek","Hungarian","Irish","Israeli","Italian","Norwegian","Polish","Portuguese","Russian","Scottish","Spanish","Swedish","Swiss","Ukrainian","Austrian","Baltic","Belgian","Bulgarian","Dutch","Finnish","Icelandic","Romanian"]],
 ["as","Asia",["Lebanese","Middle Eastern","Persian","Turkish","Armenian","Azerbaijani","Georgian","Kazakh","Kyrgyz","Tajik","Turkmen","Uzbek","Indian","Nepali","Pakistani","Sri Lankan","Chinese","Filipino","Indonesian","Japanese","Korean","Malaysian","Singaporean","Taiwanese","Thai","Vietnamese","Afghan","Bangladeshi","Burmese","Cambodian","Lao","Mongolian"]],
 ["af","Africa",["Cameroonian","Congolese","Egyptian","Eritrean","Ethiopian","Ghanaian","Ivorian","Kenyan","Malian","Moroccan","Nigerian","Senegalese","Somali","South African","Sudanese","Tanzanian","Tunisian","Ugandan","Algerian"]],
 ["oc","Oceania",["Australian","Fijian","Hawaiian","Māori","Papua New Guinean","Samoan","Tongan"]],
 ];
function shelves(list){
  const used=new Set(),out=[];
  SHELVES.forEach(([id,name,names])=>{const bs=list.filter(b=>names.includes(b.name));bs.forEach(b=>used.add(b.name));if(bs.length)out.push({id,name,books:bs})});
  const rest=list.filter(b=>!used.has(b.name));if(rest.length)out.push({id:"more",name:"More books",books:rest});
  out.forEach(s=>s.n=s.books.reduce((t,b)=>t+b.recs.length,0));
  return out;
}
const SC={ev:"#ffc63d",na:"#ff9b82",sa:"#7fd1a6",eu:"#8ecae6",as:"#b9a2f0",af:"#f4a261",oc:"#f6e27a",more:"#e0d6c8"};
const PATN={ev:2,na:0,sa:1,eu:3,as:4,af:5,oc:6,more:8}; // top pattern of every book in a continent
const CONT={};SHELVES.forEach(([id,,names])=>names.forEach(n=>CONT[n]=id));
// colour family of a continent: the base colour with shifted hue and lightness, six variations in a fixed order
const _hsl=hex=>{const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let h=0,s=0;
  if(d){s=d/(1-Math.abs(2*l-1));h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360}return[h,s*100,l*100]};
const SHADES=[[0,0],[-16,8],[14,-6],[-7,-12],[20,6],[6,12],[-22,-2],[10,-16]]; // [hue shift, lightness shift]
const shade=(id,i)=>{const[h,s,l]=_hsl(SC[id]),[dh,dl]=SHADES[i%SHADES.length];return `hsl(${Math.round(h+dh+360)%360} ${Math.round(Math.min(85,Math.max(40,s)))}% ${Math.round(Math.min(86,Math.max(52,l+dl-4)))}%)`};
const goTop=()=>{const bt=$("kz-shelf");bt&&bt.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"})};
const backBtn=label=>`<button type="button" class="bkback"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>${esc(label)}</button>`;
const bookName=c=>c||"Everyday";
function books(){
  const m={};let hidden=0;
  K.recipes.forEach(r=>{if(!K.allowed(r,S.diet)){hidden++;return}(m[bookName(r.cuisine)]=m[bookName(r.cuisine)]||[]).push(r)});
  const list=Object.keys(m).sort((a,b)=>a.localeCompare(b,"en",{sensitivity:"base"})).map(n=>({name:n,recs:m[n].sort((a,b)=>a.title.localeCompare(b.title,"en",{sensitivity:"base"}))}));
  // look: seeded from the title, so the shelf looks random but is the same every visit
  let prev=-1;list.forEach(b=>{const h=hash(b.name);let c=h%PAL.length;if(c===prev)c=(c+1)%PAL.length;prev=c;
    b.c=PAL[c];b.p=(h>>>3)%4;b.h=Math.max(150+(h>>>5)%62,Math.ceil(90+b.name.length*(b.name.length>11?9.8:11.4)));b.w=Math.round(38+Math.min(1,Math.log(b.recs.length+1)/Math.log(150))*46+(h>>>9)%5);
    b.tw=Math.round(38+Math.min(b.recs.length,60)/60*8+(h>>>9)%4);b.th=Math.max(138+(h>>>5)%40,Math.ceil(78+b.name.length*(b.name.length>11?9.2:10.4)));b.ang=8+(h>>>17)%6;b.L=Math.max(116,Math.ceil(76+b.name.length*9.8));b.T=30+(h>>>19)%9;b.o=((h>>>21)%11)-5});
  // books of one continent look alike: same top pattern, same colour family (alternating shades)
  const nth={};list.forEach(b=>{const id=CONT[b.name]||"more",n=nth[id]=(nth[id]||0)+1;b.c=shade(id,n-1);b.p=PATN[id]});
  return{list,hidden};
}
const kitOpen=()=>!$("tab-kit").hidden;
// units: standing books, books leaning on a neighbour, and piles of 2-3 books lying flat
function unitsOf(list,tight){
  const u=[];
  if(tight)return list.map(b=>({k:"up",b,w:b.tw,t:1}));
  let piles=0;const maxPiles=Math.max(1,Math.floor(list.length/8)); // a few piles per shelf, never a whole continent lying down
  let guard=0; // the index must always move forward; this stops a bad slice from ever freezing the page again
  for(let i=0;i<list.length&&guard++<list.length*3+10;i++){const b=list[i],h=hash(b.name);
    if((h>>>7)%5===0&&i+2<list.length&&piles<maxPiles){piles++;const g=list.slice(i,i+3+((h>>>10)%2));u.push({k:"stack",bs:g,w:Math.max(...g.map(x=>x.L))+24});i+=Math.max(1,g.length)-1}
    else if((h>>>11)%5===0)u.push({k:"lean",b,ex:Math.ceil(b.h*Math.sin(b.ang*Math.PI/180)),w:b.w});
    else u.push({k:"up",b,w:b.w});
  }
  return u;
}
const uw=x=>(x.k==="lean"?x.w+x.ex:x.w)+(x.ov||0); // ov: the room a continent's wooden frame takes
function rowsOf(list,tight,avail,units,scOf){
  const W=avail?avail-(matchMedia("(max-width:420px)").matches?30:42):(box.clientWidth||360)-(matchMedia("(max-width:420px)").matches?24:36),rows=[[]];let used=0;
  const us=units||unitsOf(list,tight);
  // on the one-long-shelf view a row that starts in the middle of a continent opens a "· cont." compartment with its own wooden walls: count that room too (it used to be forgotten, so rows overflowed)
  const wall=units?(matchMedia("(max-width:420px)").matches?36:40):0;
  us.forEach((x,i)=>{let w=uw(x),nx=us[i+1],need=(x.dv&&!x.en&&nx)||(nx&&nx.en)?w+uw(nx):w;if(used+need>W&&rows[rows.length-1].length){rows.push([]);used=0}
    if(wall&&!x.ov&&!rows[rows.length-1].length){w+=wall;need+=wall}
    rows[rows.length-1].push(x);used+=w});
  // when arrange() has to stand piles up again it needs the same room for the compartment walls (one set per continent in the row, they overlap by 14px)
  const extraOf=r=>{if(!wall||!scOf)return 0;const n=new Set(r.map(scOf)).size;return wall+Math.max(0,n-1)*(wall-14)};
  return rows.map(r=>arrange(r,W,extraOf(r)));
}
// a row starts and ends with a standing book; leaning books rest on a standing neighbour, piles sit in between
function arrange(row,W,extra=0){
  // a row needs a standing book at both ends: with fewer than two, stand everything up if it still fits
  if(row.filter(x=>x.k==="up").length<2&&row.length>1){const all=row.flatMap(x=>x.k==="stack"?x.bs.map(b=>({k:"up",b,w:b.w})):[x.dv?x:{k:"up",b:x.b,w:x.w}]);if(all.reduce((t,x)=>t+x.w,0)<=W-extra||!row.some(x=>x.k==="up"))row=all}
  let ups=row.filter(x=>x.k==="up");
  if(ups.length<2){row.forEach(x=>{if(x.k==="lean")x.k="up"});ups=row.filter(x=>x.k==="up")}
  if(ups.length>=2){const f=ups[0],l=ups[ups.length-1];row=[f,...row.filter(x=>x!==f&&x!==l),l]}
  row.forEach((x,i)=>{if(x.k!=="lean")return;const nx=row[i+1],pv=row[i-1];
    if(nx&&nx.k==="up")x.dir="r";else if(pv&&pv.k==="up")x.dir="l";else x.k="up"});
  return row;
}
function spine(b,cls,style){
  const n=b.recs.length;
  return `<button type="button" class="bk ${cls} p${b.p}${b.name.length>11?" sm":""}" data-b="${esc(b.name)}" style="--c:${b.c};${style}" aria-label="${esc(b.name)} cookbook, ${n} ${n===1?"recipe":"recipes"}"><i class="bd"></i><b>${esc(b.name)}</b><span class="bn">${n}</span></button>`;
}
function unitHTML(x){
  if(x.dv&&x.en)return `<div class="dv en" aria-hidden="true" style="--h:${x.h}px;--c:${x.c}"></div>`;
  if(x.dv)return `<div class="dv" role="heading" aria-level="3" aria-label="${esc(x.name)}, ${x.n} cookbooks" style="--h:${x.h}px;--c:${x.c}"><span>${esc(x.name)}</span><em>${x.n}</em></div>`;
  if(x.k==="stack"){const mx=Math.max(...x.bs.map(b=>b.L));return `<div class="stack">${x.bs.map(b=>{const a=(mx-b.L)/2+4,o=Math.max(-a,Math.min(a,b.o));return spine(b,"flat",`--L:${b.L}px;--T:${b.T}px;--o:${o}px`)}).join("")}</div>`}
  const b=x.b;
  if(x.k==="lean"){const r=x.dir==="r";return spine(b,"lean "+(r?"r":"l"),`--h:${b.h}px;--w:${b.w}px;--t:${r?b.ang:-b.ang}deg;margin-${r?"right":"left"}:${x.ex}px`)}
  if(x.t)return spine(b,"up",`--h:${b.th}px;--w:${b.tw}px`);
  return spine(b,"up",`--h:${b.h}px;--w:${b.w}px`);
}
function fit(){
  box.querySelectorAll(".bk b").forEach(el=>{
    if(!el.clientHeight&&!el.clientWidth)return;const flat=el.parentNode.classList.contains("flat"),over=()=>flat?el.scrollWidth>el.clientWidth+1:el.scrollHeight>el.clientHeight+1;
    let fs=parseFloat(getComputedStyle(el).fontSize);el.style.fontSize="";fs=parseFloat(getComputedStyle(el).fontSize);
    while(fs>10&&over()){fs-=.5;el.style.fontSize=fs+"px"}});
}
const viewBar=()=>`<div class="tg shview" role="group" aria-label="Shelf layout"><button type="button" data-v="regions" aria-pressed="${view==="regions"}">By continent</button><button type="button" data-v="all" aria-pressed="${view==="all"}">All on one shelf</button></div>`;
const bindView=()=>box.querySelectorAll(".shview button").forEach(x=>x.onclick=()=>{if(view===x.dataset.v)return;view=x.dataset.v;store("mr-shelfview",view);cont=null;paintShelf()});
const shelfLevel=()=>!cur&&(view==="all"||cont);
function paintShelf(){
  const{list,hidden}=books();lastW=box.clientWidth;
  $("kt-shelf").textContent=list.length;$("kl-shelf").textContent=list.length===1?"cookbook on the shelf":"cookbooks on the shelf";
  if(cur&&!list.some(b=>b.name===cur))cur=null;
  const shs=shelves(list);
  if(cur){if(view==="all")return paintBook(list.find(b=>b.name===cur),hidden,{id:"all",name:"Shelf"});const sh=shs.find(s=>s.books.some(b=>b.name===cur));cont=sh.id;return paintBook(list.find(b=>b.name===cur),hidden,sh)}
  if(cont&&!shs.some(s=>s.id===cont))cont=null;
  if(!list.length){box.innerHTML='<div class="ph" style="display:block"><b>Your shelf is empty</b>Your diet filters hide every recipe. Loosen them in Around the table.</div>';return}
  const note=hidden?` ${hidden} ${hidden===1?"recipe is":"recipes are"} hidden by your diet filters.`:"";
  if(view==="all"){ // every cookbook on one shelf, grouped into labelled sections
    // one long shelf: each continent starts with a sign. The first and last book of a continent always stand, so a sign is never next to a leaning book or a pile.
    const stand=x=>x.k==="stack"?x.bs.map(b=>({k:"up",b,w:b.w})):x.k==="lean"?[{k:"up",b:x.b,w:x.w}]:[x];
    const units=[];
    shs.forEach(sc=>{let u=unitsOf(sc.books);if(u.length){u=[...stand(u[0]),...u.slice(1)];const l=u.pop();u.push(...stand(l))}
      if(u.length){const need=sc.name.length*10+34; // the name is written on the first compartment, which must be wide enough for it
        u[0]={...u[0],ov:40+Math.max(0,need-40-uw(u[0]))}}
      units.push(...u)});
    const BS={},SI={},named=new Set();shs.forEach(s=>{SI[s.id]=s;s.books.forEach(b=>BS[b.name]=s.id)});
    const scOf=x=>x.sc||BS[(x.b||x.bs[0]).name];
    const secs=r=>{const g=[];r.forEach(x=>{const id=scOf(x),l=g[g.length-1];if(l&&l.id===id)l.u.push(x);else g.push({id,u:[x]})});return g.map(s=>{const c=SI[s.id];const first=!named.has(s.id);named.add(s.id);return `<div class="sec" role="group" aria-label="${esc(c.name)}, ${c.books.length} cookbooks"${first?` style="min-width:${c.name.length*10+34}px"`:""}><i class="wt${first?"":" cont"}" title="${esc(c.name)}">${esc(first?c.name:c.name+" · cont.")}</i><i class="wd l"></i><i class="wd r"></i>${s.u.map(unitHTML).join("")}</div>`}).join("")};
    let rows=rowsOf(null,false,0,units,scOf);
    const draw=()=>{named.clear();box.innerHTML=`<div class="shelf">${rows.map(r=>`<div class="shrow cs">${secs(r)}</div><div class="plank"></div>`).join("")}</div>`
     +`<p class="shelfhint">${list.length} cookbooks, grouped by continent. Tap a spine to open the book.${note}</p>`;
     fit()};
    draw();
    // The row fitting above works from estimated widths and always errs on the wide side, which left a gap at the right end of most rows.
    // So measure the rendered rows and pull standing books up from the next row while they really fit; repeat until nothing moves.
    const keyOf=x=>(x.b||x.bs[0]).name,realW=x=>{const e=x.k==="stack"?box.querySelector(`.stack:has(.bk[data-b="${CSS.escape(keyOf(x))}"])`):box.querySelector(`.bk[data-b="${CSS.escape(keyOf(x))}"]`);
      return x.k==="lean"?x.w+x.ex+4:e?e.getBoundingClientRect().width+2+(x.ov||0):uw(x)};
    // a row starts with a standing book: when the first one was taken, the next one stands up (never reorder, or books land in the wrong continent)
    const standFirst=r=>{if(!r.length||r[0].k==="up")return r;const f=r[0],ns=f.k==="stack"?f.bs.map(b=>({k:"up",b,w:b.w})):[{k:"up",b:f.b,w:f.w,ov:f.ov}];if(ns[0]&&f.ov)ns[0].ov=f.ov;return arrange([...ns,...r.slice(1)],0,0)};
    for(let pass=0;pass<8;pass++){
      const els=[...box.querySelectorAll(".shrow")];let moved=0;
      for(let i=0;i<rows.length-1;i++){
        const cur=rows[i],sc=els[i]&&els[i].querySelectorAll(":scope>.sec");if(!sc||!sc.length||!cur.length)continue;
        const ls=sc[sc.length-1],kids=[...ls.children].filter(c=>!c.matches(".wt,.wd,i")),lk=kids.length&&kids[kids.length-1];if(!lk)continue;
        let free=ls.getBoundingClientRect().right-20-lk.getBoundingClientRect().right-(parseFloat(getComputedStyle(lk).marginRight)||0);
        while(rows[i+1]&&rows[i+1].length>1){
          const f=rows[i+1][0];if(f.k!=="up")break;
          const same=scOf(f)===scOf(cur[cur.length-1]),w=same?realW(f):realW(f)+6;
          if(free<w)break;
          free-=w;cur.push(rows[i+1].shift());moved++;
          rows[i+1]=standFirst(rows[i+1])}
        if(moved)rows[i]=arrange(cur,0,0)}
      if(!moved)break;
      rows=rows.filter(r=>r.length);draw()}
    box.querySelectorAll(".bk").forEach(b=>b.onclick=()=>{cur=b.dataset.b;q="";mf="";paintShelf();goTop()});
    return;
  }
  if(!cont){ // level 1: the bookcases
    box.innerHTML=viewBar()+`<div class="shgrid">${shs.map(s=>{const h=hash(s.id);
      const mini=s.books.slice(0,15).map(b=>{const k=hash(b.name);return `<i style="--c:${b.c};--h:${34+k%44}px"></i>`}).join("")+(s.books.length>15?`<em>+${s.books.length-15}</em>`:"");
      return `<button type="button" class="shcase" data-s="${s.id}" aria-label="${esc(s.name)} shelf, ${s.books.length} ${s.books.length===1?"cookbook":"cookbooks"}, ${s.n} recipes"><span class="shcap"><b>${esc(s.name)}</b><small>${s.books.length} ${s.books.length===1?"book":"books"} · ${s.n} recipes</small></span><span class="shmini">${mini}</span><span class="plank" style="display:block"></span></button>`}).join("")}</div>`
     +`<p class="shelfhint">Tap a shelf to see its cookbooks.${note}</p>`;
    bindView();
    box.querySelectorAll(".shcase").forEach(x=>x.onclick=()=>{cont=x.dataset.s;paintShelf();goTop()});
    return;
  }
  const sh=shs.find(s=>s.id===cont); // level 2: one shelf, its books standing, leaning and piled up
  box.innerHTML=`<div class="bkhead">${backBtn("Shelves")}<div class="bkt"><div><h3>${esc(sh.name)}</h3><p>${sh.books.length} ${sh.books.length===1?"cookbook":"cookbooks"} · ${sh.n} recipes</p></div></div></div>`
   +`<div class="shelf">${rowsOf(sh.books).map(r=>`<div class="shrow">${r.map(unitHTML).join("")}</div><div class="plank"></div>`).join("")}</div>`
   +`<p class="shelfhint">Tap a spine to open the book.${note}</p>`;
  fit();
  box.querySelector(".bkback").onclick=()=>{cont=null;paintShelf();goTop()};
  box.querySelectorAll(".bk").forEach(b=>b.onclick=()=>{cur=b.dataset.b;q="";mf="";paintShelf();goTop()});
}
function paintBook(b,hidden,sh){
  const cnt=m=>b.recs.filter(r=>r.meals.includes(m)).length;
  box.innerHTML=`<div class="bkv"><div class="bkhead">${backBtn(sh.name)}</div>
  <div class="bkcover p${b.p}" style="--c:${b.c}"><span class="hinge"></span><div class="face"><i class="bd"></i><div class="ttl"><div><small class="kind">Cookbook</small><h3>${esc(b.name)}</h3><p>${b.recs.length} ${b.recs.length===1?"recipe":"recipes"}${hidden?` · ${hidden} hidden by your diet filters`:""}</p></div><span class="bn" aria-hidden="true">${b.recs.length}</span></div></div></div>
  <input class="bksearch" id="bksearch" type="search" placeholder="Search this book…" aria-label="Search this cookbook" autocomplete="off" value="${esc(q)}">
  <div class="tg" id="bkmeals" role="group" aria-label="Filter by meal"><button type="button" data-m="" aria-pressed="${mf===""}">All <small>${b.recs.length}</small></button>${MEALK.filter(cnt).map(m=>`<button type="button" data-m="${m}" aria-pressed="${mf===m}">${esc(ML(m))} <small>${cnt(m)}</small></button>`).join("")}</div>
  <ul class="bklist" id="bklist"></ul></div>`;
  const list=()=>{
    const fav=new Set((store("mr-favs2")||[]).map(x=>x.title)),t=K.norm(q);
    const rs=b.recs.filter(r=>(!mf||r.meals.includes(mf))&&(!t||K.norm(r.title).includes(t)));
    $("bklist").innerHTML=rs.length?rs.map(r=>`<li><button type="button" class="bkrec" data-id="${esc(r.id)}"><span><b>${esc(r.title)}</b><small>${r.min} min · ${esc(ML(r.meals.includes(S.meal)?S.meal:r.meals[0]))}</small></span>${fav.has(r.title)?I("heart"):""}</button></li>`).join(""):'<li class="hint" style="grid-column:1/-1;margin:6px 2px">No recipes match.</li>';
    $("bklist").querySelectorAll(".bkrec").forEach(x=>x.onclick=()=>openRecipe(x.dataset.id));
  };
  list();
  box.querySelector(".bkback").onclick=()=>{cur=null;q="";mf="";paintShelf();goTop()};
  $("bksearch").oninput=e=>{q=e.target.value;list()};
  $("bkmeals").querySelectorAll("button").forEach(x=>x.onclick=()=>{mf=x.dataset.m;$("bkmeals").querySelectorAll("button").forEach(y=>y.setAttribute("aria-pressed",String(y===x)));list()});
}
function openRecipe(id){
  const r=K.recipes.find(x=>x.id===id);if(!r)return;
  // same card as a spin: your household size, fridge and leftovers apply
  {const mm=r.meals.find(m=>MEALS.some(x=>x[0]===m));if(mm&&!r.meals.includes(S.meal))S.meal=mm} // "Extra" recipes (sauces, spice blends, jams) keep the meal you had
  S.pm={[S.meal]:true};save();draw();
  const F=fridgeIds(),U=new Set([...S.urgent.flatMap(x=>K.match(x)),...[...F].filter(isLeftId)]),x=K.resolve(r,S.n,{fridge:F,basic:S.basic,urgent:U});
  back=1;
  show({rid:r.id,title:r.title,min:r.min,n:S.n,steps:x.steps,ing:x.ing,desc:[r.note,x.leftoverNote].filter(Boolean).join(" ")},"");
  toCard("out");
}
window.__openRecipe=openRecipe;
{ // one search over every cookbook: while it has text, the matching recipes replace the shelf
  const sq=$("sq"),sr=$("sres");
  if(sq&&sr){const hint=t=>`<li class="hint" style="grid-column:1/-1;margin:2px">${t}</li>`;
    const paint=()=>{const q=sq.value.trim();if(K.norm(q).length<2){sr.hidden=true;sr.innerHTML="";box.hidden=false;return}
      const rs=findRecipes(q),sh=rs.slice(0,24);sr.innerHTML=sh.map(recRow).join("")+(rs.length>sh.length?hint(`${rs.length-sh.length} more. Add a word to narrow it down.`):"")+(!rs.length?hint("No recipes match. Your diet filters apply here too."):"");
      sr.hidden=false;box.hidden=true;sr.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>openRecipe(b.dataset.id))};
    sq.oninput=paint;sq.onkeydown=e=>{if(e.key==="Escape"){sq.value="";paint()}}}
}
const _ps=paintShelf;let _psBusy=false;
paintShelf=function(){try{return _ps.apply(this,arguments)}catch(e){console.error(e);if(_psBusy)return;_psBusy=true;
  try{const{list}=books();box.innerHTML='<p class="shelfhint">The shelf could not be drawn, so here is a plain list.</p><ul class="bklist">'+list.map(b=>`<li><button type="button" class="bkrec" data-b="${esc(b.name)}"><span><b>${esc(b.name)}</b><small>${b.recs.length} recipes</small></span></button></li>`).join("")+"</ul>";
    box.querySelectorAll(".bkrec").forEach(x=>x.onclick=()=>{cur=x.dataset.b;_psBusy=false;paintShelf()})}catch(e2){console.error(e2);box.textContent="The shelf could not be drawn. Reload the page."}
  _psBusy=false}};
const refresh=()=>{const k=JSON.stringify(S.diet||{});if(k===sig&&box.firstChild)return;sig=k;paintShelf()};
const _dr=draw;draw=function(){_dr.apply(this,arguments);try{refresh()}catch(e){console.error(e)}};
// the page may be laid out while My kitchen is hidden, so re-chunk the rows once it has a width
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(shelfLevel()&&kitOpen())fit()});
try{new ResizeObserver(()=>{if(shelfLevel()&&kitOpen()&&Math.abs(box.clientWidth-lastW)>8)paintShelf()}).observe(box)}catch(e){}
const _stS=setTab;setTab=function(t){const r=_stS.apply(this,arguments);
  if(t==="kit"){try{if(shelfLevel()&&Math.abs(box.clientWidth-lastW)>8)paintShelf();else if(shelfLevel())fit();if(back){back=0;setTimeout(()=>{const z=$("kz-shelf");z&&z.scrollIntoView({block:"start"})},40)}}catch(e){console.error(e)}}
  return r};
refresh();
})();
if("serviceWorker" in navigator&&location.protocol.startsWith("http")){
  const had=!!navigator.serviceWorker.controller;let reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(had&&!reloaded){reloaded=true;location.reload()}}); // a new version took over: load it once
  navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(r=>r.update&&r.update()).catch(()=>{});
}
