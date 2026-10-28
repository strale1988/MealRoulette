/* craft/craft-sweet.js: Craft recipes for frozen treats, baking, drinks.
   Each entry is a tool: its controls (ctl) and a calc(s) that returns the card (title, meta, note, ing, steps).
   "learn" notes for the Good to know box live in LEARN below, keyed by tool then option. Load order: after craft-lib.js, before craft.js. */
(function(){
"use strict";
const {rg,G,ML,P1,eggs,hm,people}=window.CRAFTLIB;
Object.assign(window.CRAFTLIB.TOOLS,{
frozen:{title:"What are we freezing?",sub:"Sorbet, ice cream and lollies with a soft scoop.",
 ctl:[{k:"t",label:"Make",icon:"icecream",def:"sorbet",tg:[["sorbet","Fruit sorbet"],["custard","Ice cream"],["nochurn","No-churn ice cream"],["lolly","Ice lollies"]]},{k:"a",label:"Batch",icon:"ruler",def:1000,step:[500,2000,250,"g"]}],
 calc(s){
  const a=s.a,k=a/1000,pt=(a*.9/250)|0;
  if(s.t==="sorbet")return{title:"Fruit sorbet",meta:[["clock","30 min + freezing"],["icecream","Makes about "+G(a)],["fridge","Best within 2 weeks"]],note:["The sugar is what keeps it scoopable. Very sweet fruit (mango, ripe peach) needs a little less."],ing:[["Fruit purée",G(a*.75)],["Sugar",G(a*.18)],["Lemon juice",G(a*.02)],["Water",G(a*.05)]],steps:["Warm the sugar and water until dissolved. Cool.","Blend with the fruit purée and lemon juice. Chill until very cold.","Churn in an ice cream machine 20–25 minutes. Or freeze in a tray and whisk every 45 minutes, 4 times.","Freeze until firm, and take out 10 minutes before scooping."]};
  if(s.t==="custard")return{title:"Vanilla ice cream",meta:[["clock","1 hour + freezing"],["icecream","Makes about "+G(a)],["fridge","Best within 2 weeks"]],note:["Cook the custard to 82 °C. No higher, or it scrambles."],ing:[["Whole milk",G(a*.5)],["Cream",G(a*.25)],["Egg yolks",Math.max(2,Math.round(a*.1/18))+" yolks"],["Sugar",G(a*.13)],["Vanilla",P1(5*k)+" g"]],steps:["Heat the milk, half the cream and the vanilla until steaming.","Whisk the yolks with the sugar until pale. Pour in the hot milk slowly, whisking.","Cook on low heat, stirring, until it coats the back of a spoon (82 °C). Strain into the cold cream.","Chill overnight, then churn and freeze."]};
  if(s.t==="nochurn")return{title:"No-churn ice cream",meta:[["clock","15 min + 6 h freezing"],["icecream","Makes about "+G(a*1.5)],["fridge","Best within 2 weeks"]],note:["The air whipped into the cream is what makes it soft."],ing:[["Cold whipping cream",G(a*.6)],["Sweetened condensed milk",G(a*.4)],["Vanilla",P1(5*k)+" g"]],steps:["Whip the cream to stiff peaks.","Fold in the condensed milk and vanilla.","Spoon into a container, cover and freeze at least 6 hours."]};
  return{title:"Ice lollies",meta:[["clock","10 min + 6 h freezing"],["icecream","About "+Math.max(4,Math.round(a/70))+" lollies"]],note:["A little sugar keeps them from freezing rock hard."],ing:[["Blended fruit or juice",G(a*.85)],["Sugar or honey",G(a*.08)],["Water",G(a*.07)]],steps:["Blend everything until smooth. Taste: it should be a bit too sweet, as freezing dulls sweetness.","Pour into moulds, add sticks after 1 hour and freeze 6 hours.","Run the mould under warm water for 10 seconds to release."]}}},
bake:{title:"What are we baking?",sub:"Sponge scaled to any tin, or cookies by the count.",
 ctl:[{k:"t",label:"Bake",icon:"cupcake",def:"cake",tg:[["cake","Sponge cake"],["cookie","Cookies"]]},
      {k:"sh",label:"Tin shape",icon:"ruler",def:"round",tg:[["round","Round"],["square","Square"],["loaf","Loaf"]],only:"cake"},
      {k:"c",label:"Tin size (cm across, or length)",icon:"ruler",def:20,step:[12,32,1,"cm"],only:"cake"},
      {k:"k",label:"How many cookies",icon:"cookie",def:24,step:[6,60,6,""],only:"cookie"}],
 calc(s){
  if(s.t==="cookie"){
   const k=s.k*30/755;
   return{title:s.k+" cookies",meta:[["clock","About 30 min"],["cookie","30 g of dough each"],["flame","180 °C"]],note:["Chilling the dough 30 minutes makes thicker, chewier cookies."],
    ing:[["Flour",G(300*k)],["Soft butter",G(150*k)],["Sugar (half brown, half white)",G(150*k)],["Egg",eggs(50*k)],["Bicarbonate of soda",P1(3*k)+" g"],["Salt",P1(2*k)+" g"],["Chocolate, chopped",G(100*k)]],
    steps:["Heat the oven to 180 °C and line a tray.","Beat the butter and both sugars until pale and fluffy.","Beat in the egg, then stir in the flour, soda and salt just until combined. Fold in the chocolate.","Roll into 30 g balls and place 5 cm apart.","Bake 10–12 minutes until the edges are golden and the middle still looks soft. Cool on the tray 5 minutes."]}}
  const c=s.c,area=s.sh==="round"?Math.PI*c*c/4:s.sh==="square"?c*c:c*12,f=area/314.16,ne=200*f,
   t=Math.round((30+12*(f-1)+(s.sh==="loaf"?8:0))/5)*5,temp=f>1.6?"170 °C":"180 °C";
  return{title:"Sponge for a "+c+" cm "+s.sh+" tin",meta:[["clock",Math.max(20,t)+" min bake"],["flame",temp],["cupcake","Tin: "+c+" cm "+s.sh+(s.sh==="loaf"?" × 12 cm":"")]],
   note:["Based on a 20 cm round tin (4 × 200 g). Scaled by the tin's area. Bigger tins bake longer at a slightly lower heat."],
   ing:[["Soft butter",G(200*f)],["Sugar",G(200*f)],["Eggs",eggs(ne)],["Flour (self-raising, or plain plus baking powder)",G(200*f)],["Baking powder (skip if self-raising)",P1(8*f)+" g"],["Milk",ML(15*f)],["Vanilla",ML(5*f)],["Salt","a pinch"]],
   steps:["Heat the oven to "+temp+". Grease and line the tin.","Beat the butter and sugar until pale and fluffy, 3–4 minutes.","Beat in the eggs a little at a time. Add a spoon of flour if it starts to curdle.","Fold in the flour, baking powder and salt, then the milk and vanilla until just smooth.","Spread in the tin and bake about "+Math.max(20,t)+" minutes, until a skewer comes out clean.","Cool 10 minutes in the tin, then on a rack."]}}},
drinks:{title:"What are we drinking?",sub:"Cold brew, lemonade and syrup by the jug.",
 ctl:[{k:"t",label:"Drink",icon:"drinks",def:"coffee",tg:[["coffee","Cold brew coffee"],["tea","Cold brew tea"],["lemonade","Lemonade"],["syrup","Simple syrup"]]},
      {k:"a",label:"How much to make",icon:"ruler",def:1000,step:[250,3000,250,"g"]},
      {k:"x",label:"Strength",icon:"flame",def:"rtd",tg:[["rtd","Ready to drink"],["conc","Concentrate"]],only:"coffee"},
      {k:"sw",label:"Sweetness",icon:"flame",def:1,tg:[[0,"Tart"],[1,"Balanced"],[2,"Sweet"]],only:"lemonade"},
      {k:"r",label:"Syrup",icon:"flame",def:"1",tg:[["1","1 : 1 everyday"],["2","2 : 1 rich"]],only:"syrup"}],
 calc(s){
  const a=s.a;
  if(s.t==="coffee"){const conc=s.x==="conc",r=conc?5:10,cf=a/r;
   return{title:"Cold brew "+(conc?"concentrate":"coffee"),meta:[["clock","12–18 hours"],["fridge","Keeps 1 week"],["drinks",ML(a)+" water"]],note:[conc?"Dilute 1 : 1 with water, milk or ice to serve.":"Ready to pour over ice."],
    ing:[["Coffee, coarsely ground",G(cf)],["Cold water",ML(a)]],steps:["Stir the coffee and cold water together in a jar. Make sure all the grounds are wet.","Cover and leave in the fridge 12–18 hours.","Strain through a paper filter or fine sieve, twice if it looks cloudy.","Keep in the fridge up to 1 week."]}}
  if(s.t==="tea")return{title:"Cold brew tea",meta:[["clock","6–8 hours"],["fridge","Keeps 3 days"],["drinks",ML(a)]],note:["No bitterness, no cooling down. Add lemon, mint or honey at the end."],
   ing:[["Loose tea (black, green or fruit)",P1(a/1000*8)+" g"],["Cold water",ML(a)]],steps:["Put the tea and cold water in a jar and stir.","Leave in the fridge 6–8 hours (green tea 4–6).","Strain and serve over ice."]};
  if(s.t==="lemonade"){const sug=[60,90,120][s.sw]*a/1000,juice=150*a/1000,w=a-juice-sug;
   return{title:"Lemonade",meta:[["drinks",ML(a)],["fridge","Keeps 3 days"],["leaf","About "+Math.ceil(juice/45)+" lemons"]],note:["The sugar is dissolved in hot water first so the lemonade is smooth."],
    ing:[["Lemon juice",ML(juice)],["Sugar",G(sug)],["Hot water (to dissolve the sugar)",ML(sug)],["Cold water",ML(Math.max(0,w-sug))]],
    steps:["Stir the sugar into the hot water until clear. Cool 10 minutes.","Add the lemon juice and cold water. Taste and add more water or sugar if you like.","Chill and serve over ice with lemon slices."]}}
  const rich=s.r==="2",wt=a/(rich?2.05:1.6)*1,sg=wt*(rich?2:1);
  return{title:(rich?"Rich":"Simple")+" syrup",meta:[["drinks","About "+ML(a)],["fridge",rich?"Keeps 6 months":"Keeps 1 month"]],note:["Ratio by weight: "+(rich?"2 parts sugar to 1 part water":"equal sugar and water")+"."],
   ing:[["Water",ML(wt)],["Sugar",G(sg)]],steps:["Warm the water and sugar in a pot, stirring, until the sugar dissolves. Do not boil hard.","Cool, pour into a clean bottle and keep in the fridge."]}}}
});
})();
