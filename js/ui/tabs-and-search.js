/* js/ui/tabs-and-search.js: The three tabs (Cook, Craft, My kitchen), the Craft hub, result rows and the Cook search. */
/* ---------- sections: 3 tabs (Cook, Craft, My kitchen). Craft is a hub of tools.
   WHAT a tool is lives in kitchen.js (K.CRAFTS: id, name, which recipes belong to it). HOW it looks lives in UI below (icon, blurb, group).
   A tool added to K.CRAFTS alone still gets a working card and a page that lists its recipes. To give a tool its own calculator:
   put <div id="tab-ID" class="tab" role="tabpanel" hidden></div> in the page, let craft-ID.js fill it (like craft-ferment.js) and set ready:1 here. ---------- */
const UI={
 pizza:{icon:"pizza",grp:"Doughs and pasta",ready:1,chip:1,blurb:"Dough lab, sauces and toppings, scaled to your table"},
 bread:{icon:"bread",grp:"Doughs and pasta",ready:1,rec:1,chip:1,blurb:"Loaves, rolls and flatbreads",kw:"loaf sourdough focaccia rolls naan bagel bagels",plan:["Loaf calculator: flour, water, salt and yeast","Sourdough timing planner","Rolls, flatbreads and enriched doughs"]},
 pasta:{icon:"pasta",grp:"Doughs and pasta",ready:1,rec:1,chip:1,blurb:"Fresh pasta, gnocchi, ravioli, shapes and sauces",kw:"noodle spaghetti gnocchi ravioli fettuccine alfredo arrabbiata amatriciana puttanesca farfalle",plan:["Fresh pasta dough by eggs and flour","Shapes and cooking times","Sauces matched to the shape"]},
 dumpling:{icon:"dumpling",grp:"Doughs and pasta",ready:1,rec:1,blurb:"Gyoza, wontons, samosas, empanadas, pierogi and momo",kw:"gyoza wonton momo pierogi samosa empanada empanadas",plan:["Wrapper dough by hydration","Filling quantities per dumpling","Steam, boil or pan-fry times"]},
 burger:{icon:"burger",grp:"Mains",ready:1,rec:1,chip:1,blurb:"Patties, buns and sauces, from smash to portobello",kw:"smash turkey salmon mushroom portobello veggie",plan:["Patty size and fat ratio for your table","Brioche and potato bun dough","Sauces and toppings that go together"]},
 soup:{icon:"soup",grp:"Mains",ready:1,rec:1,chip:1,blurb:"Stocks, soups, minestrone and chilli",kw:"broth stock chowder tomato soup chicken noodle lentil minestrone chilli chili",plan:["Stock from bones and scraps: water, salt and time","Soup thickness and seasoning guide","Big-batch scaling and freezing"]},
 grill:{icon:"grill",grp:"Mains",ready:1,rec:1,blurb:"Cooking times by thickness and doneness, with a simple marinade",kw:"bbq barbecue marinade chicken thigh tuna steak",plan:["Cooking time by thickness and doneness","A simple marinade by weight","Flavoured rubs and marinades are in Rub it in"]},
 grain:{icon:"rice",grp:"Mains",ready:1,rec:1,blurb:"Rice, risotto and grains with the right water",kw:"rice risotto quinoa couscous pilaf porridge fried rice sushi rice",plan:["Water ratio and cook time by grain","Risotto and pilaf timing","Big batches that reheat well"]},
 sandwich:{icon:"sandwich",grp:"Light and quick",ready:1,rec:1,blurb:"Sandwiches, wraps and toasties, from BLT to banh mi",kw:"wrap toastie panini burrito quesadilla blt tuna caprese banh mi",plan:["Fillings that balance: crunch, creamy, sharp","Wraps and toasties for a crowd","Lunchbox builds"]},
 salad:{icon:"salad",grp:"Light and quick",ready:1,rec:1,blurb:"Salads, slaws and bowls",kw:"slaw coleslaw bowl caesar caprese potato salad",plan:["Bowl builder: base, protein, crunch, dressing","Dressing ratios per serving","Salads that keep for tomorrow"]},
 eggs:{icon:"egg",grp:"Light and quick",ready:1,rec:1,blurb:"Omelettes, pancakes, crepes and waffles",kw:"omelette omelet pancake crepe waffle frittata scrambled shakshuka",plan:["Batter ratios: flour, milk and eggs","Omelette and frittata sizes by pan","Cooking times by doneness"]},
 noodle:{icon:"noodle",grp:"Mains",ready:1,rec:1,blurb:"Noodle bowls and stir-fries with a sauce from the pantry",kw:"ramen udon soba stir fry lo mein",plan:["Stir-fry sauce ratios from pantry staples","Noodle cook times by type","Fast bowls for one"]},
 sauce:{icon:"sauce",grp:"Pantry and preserving",ready:1,rec:1,blurb:"Dressings, dips, pan sauces, tomato sauce and béchamel",kw:"dressing dip gravy pesto tomato sauce bechamel mayonnaise mayo guacamole",plan:["Dressing ratios that always balance","Pan sauces from what is in the pan","Dips and spreads"]},
 ferm:{icon:"ferm",grp:"Pantry and preserving",ready:1,blurb:"Every vegetable pickle and ferment: pickles, kraut, kimchi, hot sauce and preserved lemons, with exact salt and timing",kw:"ferment pickle kimchi sauerkraut hot sauce preserved lemon vegetable brine veg salt"},
 taco:{rec:1,icon:"sandwich",grp:"Doughs and pasta",ready:1,blurb:"Corn and flour tortillas, tamales and salsas",kw:"tortilla masa harina tamale tamales salsa roja verde pico de gallo mexican taco tacos"},
 pastry:{rec:1,icon:"cupcake",grp:"Doughs and pasta",ready:1,blurb:"Pie crust by dish size, puff, croissant and choux with layer counts",kw:"pie crust shortcrust tart puff pastry rough puff croissant lamination choux eclair profiterole"},
 tofu:{rec:1,icon:"leaf",grp:"Mains",ready:1,blurb:"Crispy tofu, scramble, homemade tofu and tempeh",kw:"tofu tempeh soy soybean vegan protein"},
 sushi:{rec:1,icon:"rice",grp:"Mains",ready:1,blurb:"Rice, nori and fillings for maki, hand rolls and onigiri",kw:"sushi maki roll nori temaki onigiri rice vinegar"},
 plantmilk:{rec:1,icon:"dairy",grp:"Sweet and sips",ready:1,blurb:"Oat, almond, soy, cashew and coconut milk",kw:"oat milk almond milk soy milk cashew milk coconut milk vegan dairy-free"},
 candy:{rec:1,icon:"cookie",grp:"Sweet and sips",ready:1,blurb:"Caramel, toffee, fudge and truffles with the temperature to stop at",kw:"caramel toffee fudge truffles sweets confectionery candy sugar thermometer"},
 brine:{icon:"jar",grp:"Pantry and preserving",ready:1,blurb:"Salt for plain brines and for meat and fish, in grams and spoons",kw:"brine salt percentage dry brine wet brine turkey chicken pork salinity fix a brine"},
 dairy:{icon:"dairy",grp:"Pantry and preserving",ready:1,rec:1,blurb:"Yogurt, labneh, milk kefir, strained cream cheese, kajmak and cultured butter",kw:"yogurt yoghurt labneh milk kefir cream cheese kajmak butter cultured",plan:["Yogurt: milk, starter, temperature and hours","Strained yogurt and labneh by thickness","Cultured butter and kajmak"]},
 jam:{icon:"jam",grp:"Pantry and preserving",ready:1,rec:1,blurb:"Jams, compotes and quick fridge preserves",kw:"jam compote marmalade preserve",plan:["Fruit-to-sugar ratios and set point","Fridge jams versus properly canned jars","Compotes and fruit sauces"]},
 spice:{icon:"spice",grp:"Pantry and preserving",ready:1,rec:1,blurb:"Spice blends and pastes you make once and reuse",kw:"masala seasoning curry paste blend",plan:["Blends by the tablespoon, scaled to any batch","Curry pastes and marinades","How long each blend keeps"]},
 frozen:{icon:"icecream",grp:"Sweet and sips",ready:1,rec:1,blurb:"Ice cream, sorbet, nice cream, semifreddo and lollies",kw:"icecream sorbet granita popsicle lolly nice cream banana semifreddo froyo",plan:["Sorbet from fruit: sugar balance for a soft scoop","Ice cream bases with and without a machine","Granita and lollies"]},
 cure:{icon:"fridge",grp:"Meat and smoke",ready:1,rec:1,blurb:"Pancetta, speck, salami, bacon, corned beef, pastrami, jerky and cold-smoked salmon",kw:"charcuterie salami ham bacon cured dry cure nitrite curing salt speck lardo pancetta guanciale coppa bresaola corned beef pastrami jerky gravlax smoked salmon lox cold smoke cold smoking kulen kobasica",plan:[]},
 sausage:{icon:"grill",grp:"Meat and smoke",ready:1,rec:1,blurb:"Fresh sausages, bratwurst, ćevapi, snack sticks and bierwurst, with variations",kw:"sausage links patties bratwurst brat italian cevapi cevapcici snack sticks bierwurst chorizo merguez breakfast potato sausage banger snag grilled smoked baked",plan:[]},
 rub:{icon:"spice",grp:"Meat and smoke",ready:1,rec:1,blurb:"Dry rubs and marinades for any meat",kw:"marinade seasoning bbq jerk tandoori",plan:[]},
 bbq:{icon:"flame",grp:"Meat and smoke",ready:1,rec:1,blurb:"Low and slow: ribs, brisket, pulled pork, short ribs and turkey",kw:"barbecue smoker smoking ribs brisket",plan:[]},
 cheese:{icon:"dairy",grp:"Pantry and preserving",ready:1,rec:1,blurb:"Mozzarella, halloumi, feta, ricotta, sir, queso fresco, paneer, cottage cheese and gouda-style",kw:"mozzarella halloumi feta ricotta rennet sir farmer queso fresco paneer cottage cheese gouda pressed",plan:[]},
 starter:{icon:"jar",grp:"Pantry and preserving",ready:1,rec:1,blurb:"Sourdough, water kefir, kombucha, kvass, tepache, black garlic and shio koji",kw:"sourdough ginger bug water kefir kombucha scoby kvass tepache black garlic koji shio",plan:[]},
 bake:{icon:"cupcake",grp:"Sweet and sips",ready:1,rec:1,blurb:"Cakes, brownies, muffins, scones and cookies",kw:"cake cookie cookies brownie brownies banana bread muffin scone shortbread",plan:["Scale a cake to any tin size","Cookie dough ratios","Baking times by tin and oven"]},
 drinks:{icon:"drinks",grp:"Sweet and sips",ready:1,rec:1,blurb:"Smoothies, cold brew, lemonade, hot chocolate, chai and mulled wine",kw:"smoothie coffee lemonade hot chocolate cocoa chai tea mulled wine gluhwein",plan:["Cold brew and tea ratios","Smoothies from your fridge","Syrups and lemonade by the jug"]}
};
Object.keys(UI).forEach(k=>{if(!K.CRAFTS.some(c=>c.id===k))console.error("Craft UI entry '"+k+"' has no tool in K.CRAFTS (kitchen.js)")});
const TOOLS=K.CRAFTS.map(c=>{const u=UI[c.id]||{};return{id:c.id,name:c.name,icon:u.icon||"chef",grp:u.grp||"More",blurb:u.blurb||"",ready:u.ready||0,rec:u.rec||0,chip:u.chip||0,plan:u.plan||[],
  words:[...new Set(K.norm(c.id+" "+c.name+" "+(u.kw||"")).split(" ").filter(Boolean))]}});
const PANELS=["cook","craft",...TOOLS.map(t=>t.id),"kit"],navOf=t=>t==="cook"||t==="kit"?t:"craft";
const recText=r=>r._h||(r._h=K.norm([r.title,r.cuisine,r.craft,...(r.ids||[]).map(id=>K.ING[id]?K.ING[id].name:"")].join(" ")));
function findRecipes(q){const t=K.norm(q||"").split(" ").filter(Boolean);if(!t.length)return[];
  return K.recipes.filter(r=>K.allowed(r,S.diet)&&t.every(w=>recText(r).includes(w))).sort((a,b)=>(K.norm(b.title).includes(t[0])?1:0)-(K.norm(a.title).includes(t[0])?1:0)||a.min-b.min)}
/* one result row, used by Cook, the shelf and every Craft page */
const recRow=r=>`<li><button type="button" class="bkrec" data-id="${esc(r.id)}"><span><b>${esc(r.title)}</b><small>${r.min} min${r.cuisine?" · "+esc(r.cuisine):""}</small></span></button></li>`;
// a tool's recipes: the ones filed under it (craft tag or derived from the name), after the diet filters
const craftAll=t=>K.recipes.filter(r=>r.craft===t.id),craftRecipes=t=>craftAll(t).filter(r=>K.allowed(r,S.diet)).sort((a,b)=>a.min-b.min||a.title.localeCompare(b.title));
function stubSync(t,all){const el=$("tab-"+t.id);if(!el)return;
  const inp=el.querySelector(".rsearch"),qw=K.norm(inp?inp.value||"":"").split(" ").filter(Boolean);
  if(inp&&!inp._w){inp._w=1;inp.oninput=()=>stubSync(t);inp.onkeydown=e=>{if(e.key==="Escape"){inp.value="";stubSync(t)}}}
  const base=craftRecipes(t),rs=qw.length?base.filter(r=>qw.every(w=>recText(r).includes(w))):base,tot=craftAll(t).length,cap=all?rs.length:(qw.length?24:8),p=el.querySelector("[data-n]"),ul=el.querySelector("[data-l]"),more=el.querySelector(".stubmore");
  p.textContent=!tot?"No recipes here yet. They show up as soon as one is added to the cookbooks.":qw.length?(rs.length?`${rs.length} of ${base.length} ${base.length===1?"recipe":"recipes"} match. Tap one to cook it for your household.`:"No recipes match. Your diet filters apply here too."):`${rs.length} ${rs.length===1?"recipe":"recipes"}${tot>rs.length?` (${tot-rs.length} hidden by your diet filters)`:""}. Tap one to cook it for your household.`;
  ul.innerHTML=rs.slice(0,cap).map(r=>`<li><button type="button" class="bkrec" data-id="${esc(r.id)}"><span><b>${esc(r.title)}</b><small>${r.min} min${r.meals.length===1&&r.meals[0]==="Extra"?"":" · serves "+r.serv}</small></span></button></li>`).join("");
  ul.querySelectorAll("button").forEach(b=>b.onclick=()=>window.__openRecipe&&window.__openRecipe(b.dataset.id));
  more.hidden=rs.length<=cap;more.textContent=`Show all ${rs.length}`;more.onclick=()=>stubSync(t,true)}
(function buildCraft(){
  const hub=$("tab-craft"),groups=[...new Set(TOOLS.map(t=>t.grp))];
  hub.innerHTML=`<h1 class="hl">What are we making?</h1><p>Pick a project. Amounts scale to your household.</p><section class="gs" aria-label="Search crafts and recipes"><input class="bksearch" id="cq" type="search" placeholder="Search crafts and recipes: soup, bread, dumplings…" aria-label="Search crafts and recipes" autocomplete="off"><ul class="bklist" id="cres" hidden></ul></section>`+groups.map(g=>`<section class="cgroup"><h2>${esc(g)}</h2><div class="cgrid">${TOOLS.filter(t=>t.grp===g).map(t=>`<button type="button" class="cc" data-tool="${t.id}">${t.ready?"":'<span class="soon" title="Its own calculator is coming. The recipes work now.">Soon</span>'}<span class="ci">${I(t.icon)}</span><b>${esc(t.name)}</b><small>${esc(t.blurb)}</small><em class="cn" hidden></em></button>`).join("")}</div></section>`).join("");
  hub.querySelectorAll(".cc").forEach(b=>b.onclick=()=>setTab(b.dataset.tool));
  { // search: narrows the cards to the matching crafts and lists matching recipes underneath, like Cook and the shelf
    const hq=$("cq"),hr=$("cres"),hint=t=>`<li class="hint" style="grid-column:1/-1;margin:2px">${t}</li>`;
    const hp=()=>{const q=hq.value.trim(),qn=K.norm(q),on=qn.length>=2,tl=on?TOOLS.filter(t=>t.words.some(w=>w.startsWith(qn)||(qn.length>=3&&qn.startsWith(w)))||K.norm(t.name+" "+t.blurb).includes(qn)):TOOLS;
      hub.querySelectorAll(".cc").forEach(b=>{b.hidden=!tl.some(t=>t.id===b.dataset.tool)});hub.querySelectorAll(".cgroup").forEach(g=>{g.hidden=!g.querySelector(".cc:not([hidden])")});
      if(!on){hr.hidden=true;hr.innerHTML="";return}
      const rs=findRecipes(q),sh=rs.slice(0,12);hr.innerHTML=sh.map(recRow).join("")+(rs.length>sh.length?hint(`${rs.length-sh.length} more. Add a word to narrow it down.`):"")+(!rs.length&&!tl.length?hint("Nothing matches. Your diet filters apply to recipes."):"");hr.hidden=!hr.innerHTML;
      hr.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>window.__openRecipe&&window.__openRecipe(b.dataset.id))};
    hq.oninput=hp;hq.onkeydown=e=>{if(e.key==="Escape"){hq.value="";hp()}};
  }
  let after=$("tab-kit");
  TOOLS.forEach(t=>{if($("tab-"+t.id)||t.ready)return;const el=document.createElement("div");el.id="tab-"+t.id;el.className="tab";el.setAttribute("role","tabpanel");el.hidden=true;
    el.innerHTML=`<h1 class="hl">${esc(t.name)}</h1><p>${esc(t.blurb)}. The calculators are on their way.</p><section class="panel"><div class="lab">${I(t.icon)}Recipes</div><input class="bksearch rsearch" type="search" placeholder="Search ${esc(t.name)} recipes…" aria-label="Search ${esc(t.name)} recipes" autocomplete="off"><p class="hint" data-n></p><ul class="bklist" data-l></ul><button type="button" class="stubmore" hidden></button></section>`
     +(t.plan.length?`<section class="panel"><div class="lab">${I("wand")}Coming to this page</div><ul class="stubl">${t.plan.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`:"");
    after.after(el);after=el});
  $("crumbb").onclick=()=>setTab("craft");
})();
// recipe count on each card that has no calculator yet (after the diet filters), refreshed whenever the hub opens
function hubSync(){TOOLS.forEach(t=>{const e=document.querySelector(`#tab-craft .cc[data-tool="${t.id}"] .cn`);if(!e)return;const n=t.ready&&!t.rec?0:craftRecipes(t).length;e.hidden=!n;e.textContent=n?`${n} ${n===1?"recipe":"recipes"}`:""})}
function setTab(t){if(!PANELS.includes(t))t="cook";tab=t;
  PANELS.forEach(k=>{const el=$("tab-"+k);if(el)el.hidden=k!==t});
  document.querySelectorAll("#tabs button[data-t]").forEach(b=>b.setAttribute("aria-selected",b.dataset.t===navOf(t)));
  const T=TOOLS.find(x=>x.id===t);$("crumb").hidden=!T;$("crumbn").textContent=T?T.name:"";if(window.XLINK&&XLINK.sync)XLINK.sync(t);if(T&&(!T.ready||T.rec))stubSync(T);if(t==="craft")hubSync();
  if(t==="pizza"&&typeof pzUI==="function")pzSection(S.pz.sec||"dough");scrollTo({top:0})}
document.querySelectorAll("#tabs button[data-t]").forEach(b=>b.onclick=()=>setTab(b.dataset.t));
/* ---------- Cook search: one box for every recipe, plus a shortcut into a matching Craft tool ---------- */
let gSearch,gPaint;
(function(){
  const inp=$("gq"),out=$("gres"),cnt=$("gn"),more=$("gmore");
  let cap=60;
  const isMeal=r=>r.meals.some(m=>MEALS.some(x=>x[0]===m)); // sauces, spice blends, jams and drinks are "Extra", not meals
  let base=null,baseDiet="";
  const meals=()=>{const k=JSON.stringify(S.diet||"");if(!base||k!==baseDiet){baseDiet=k;base=K.recipes.filter(r=>isMeal(r)&&K.allowed(r,S.diet)).sort((a,b)=>a.title.localeCompare(b.title))}return base};
  const paint=(keep)=>{if(keep!==true)cap=60;const q=inp.value.trim(),qn=K.norm(q);if(!qn){out.innerHTML="";cnt.textContent="";more.hidden=true;return}const all=meals();
    const tw=qn.split(" ").filter(Boolean);
    const rs=tw.length?all.filter(r=>tw.every(w=>recText(r).includes(w))).sort((a,b)=>(K.norm(b.title).includes(tw[0])?1:0)-(K.norm(a.title).includes(tw[0])?1:0)||a.min-b.min):all;
    const tools=qn.length>=2?TOOLS.filter(t=>t.words.some(w=>w.startsWith(qn)||(qn.length>=3&&qn.startsWith(w)))):[],shown=rs.slice(0,cap);
    cnt.textContent=tw.length?(rs.length?`${rs.length} of ${all.length} meals match. Tap one to cook it.`:"No meals match. Your diet filters apply here too."):`${all.length} meals. Search, or scroll and tap one to cook it.`;
    out.innerHTML=tools.map(t=>`<li><button type="button" class="bkrec gtool" data-tool="${t.id}"><span><b>${I(t.icon)}${esc(t.name)}</b><small>${t.ready?"Open in Craft":"In Craft"}</small></span></button></li>`).join("")
     +shown.map(r=>`<li><button type="button" class="bkrec" data-id="${esc(r.id)}"><span><b>${esc(r.title)}</b><small>${r.min} min${r.cuisine?" · "+esc(r.cuisine):""}</small></span></button></li>`).join("");
    more.hidden=rs.length<=cap;more.textContent=`Show ${Math.min(60,rs.length-cap)} more`;
    out.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{window.__openRecipe&&window.__openRecipe(b.dataset.id)});
    out.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>setTab(b.dataset.tool))};
  more.onclick=()=>{cap+=60;paint(true)};gPaint=()=>paint(true);
  gSearch=q=>{inp.value=q;paint();inp.scrollIntoView({block:"center"})};paint();
  inp.oninput=()=>paint();inp.onkeydown=e=>{if(e.key==="Escape"){inp.value="";paint()}else if(e.key==="Enter"&&inp.value.trim()){const b=out.querySelector("[data-id]")||out.querySelector("[data-tool]");if(b){e.preventDefault();inp.blur();b.click()}}};
})();
{const _st=setTab;setTab=function(t){_st(t);if(t==="cook"&&gPaint)gPaint();try{localStorage.setItem("mr-tab",t)}catch(e){}};try{const t0=localStorage.getItem("mr-tab");if(t0!=="cook"&&PANELS.includes(t0))_st(t0)}catch(e){}} // reopen on the last tab

