/* craft/craft-sweet.js: Craft recipes for frozen treats, baking, drinks.
   Each entry is a tool: its controls (ctl) and a calc(s) that returns the card (title, meta, note, ing, steps).
   "learn" notes for the Good to know box live in LEARN below, keyed by tool then option. Load order: after craft-lib.js, before craft.js. */
(function(){
"use strict";
const {rg,G,ML,P1,eggs,hm,people}=window.CRAFTLIB;
Object.assign(window.CRAFTLIB.TOOLS,{
frozen:{title:"What are we freezing?",sub:"Sorbet, ice cream, granita, frozen yogurt and lollies with a soft scoop.",
 ctl:[{k:"t",label:"Make",icon:"icecream",def:"sorbet",tg:[["sorbet","Fruit sorbet"],["custard","Ice cream"],["nochurn","No-churn ice cream"],["lolly","Ice lollies"],["granita","Lemon granita"],["froyo","Frozen yogurt"],["nice","Banana nice cream"],["semi","Raspberry semifreddo"]]},{k:"a",label:"Batch",icon:"ruler",def:1000,step:[500,2000,250,"g"]}],
 calc(s){
  const a=s.a,k=a/1000,pt=(a*.9/250)|0;
  if(s.t==="sorbet")return{title:"Fruit sorbet",meta:[["clock","30 min + freezing"],["icecream","Makes about "+G(a)],["fridge","Best within 2 weeks"]],note:["The sugar is what keeps it scoopable. Very sweet fruit (mango, ripe peach) needs a little less."],ing:[["Fruit purée",G(a*.75)],["Sugar",G(a*.18)],["Lemon juice",G(a*.02)],["Water",G(a*.05)]],steps:["Warm the sugar and water until dissolved. Cool.","Blend with the fruit purée and lemon juice. Chill until very cold.","Churn in an ice cream machine 20–25 minutes. Or freeze in a tray and whisk every 45 minutes, 4 times.","Freeze until firm, and take out 10 minutes before scooping."]};
  if(s.t==="custard")return{title:"Vanilla ice cream",meta:[["clock","1 hour + freezing"],["icecream","Makes about "+G(a)],["fridge","Best within 2 weeks"]],note:["Cook the custard to 82 °C. No higher, or it scrambles."],ing:[["Whole milk",G(a*.5)],["Cream",G(a*.25)],["Egg yolks",Math.max(2,Math.round(a*.1/18))+" yolks"],["Sugar",G(a*.13)],["Vanilla",P1(5*k)+" g"]],steps:["Heat the milk, half the cream and the vanilla until steaming.","Whisk the yolks with the sugar until pale. Pour in the hot milk slowly, whisking.","Cook on low heat, stirring, until it coats the back of a spoon (82 °C). Strain into the cold cream.","Chill overnight, then churn and freeze."]};
  if(s.t==="nochurn")return{title:"No-churn ice cream",meta:[["clock","15 min + 6 h freezing"],["icecream","Makes about "+G(a*1.5)],["fridge","Best within 2 weeks"]],note:["The air whipped into the cream is what makes it soft."],ing:[["Cold whipping cream",G(a*.6)],["Sweetened condensed milk",G(a*.4)],["Vanilla",P1(5*k)+" g"]],steps:["Whip the cream to stiff peaks.","Fold in the condensed milk and vanilla.","Spoon into a container, cover and freeze at least 6 hours."]};
  if(s.t==="nice")return{title:"Banana nice cream",meta:[["clock","10 min + freezing the bananas"],["icecream","Makes about "+G(a)],["fridge","Best eaten straight away"]],note:["Use very ripe, spotty bananas: they are sweeter and blend creamier. Slice and freeze them at least 4 hours."],
   ing:[["Very ripe bananas, sliced and frozen",G(a*.9)],["Milk or plant milk",G(a*.08)],["Vanilla",P1(a*.003)+" g"],["Peanut butter or cocoa (optional)",G(a*.04)]],
   steps:["Slice the bananas into coins and freeze them on a tray for at least 4 hours.","Blend in a food processor with the milk and vanilla, scraping down the sides, 3–5 minutes, until smooth and creamy.","Eat straight away as soft-serve, or freeze 30 minutes for a firmer scoop."],
   learn:["Frozen bananas turn creamy when blended because of their natural sugar and pectin, with no cream or churning.","Blend in short bursts and scrape down the sides: the mixture goes from crumbly to creamy quite suddenly."]};
  if(s.t==="semi")return{title:"Raspberry semifreddo",meta:[["clock","30 min + 6 hours freezing"],["icecream","Makes about "+G(a)],["fridge","Keeps 2 weeks"]],note:["A semifreddo is a frozen mousse that needs no ice cream machine. The egg yolks are warmed to 75 °C so they are safe to eat."],
   ing:[["Double cream, cold",G(a*.45)],["Egg yolks",Math.max(2,Math.round(a/200))+" yolks"],["Sugar",G(a*.15)],["Raspberries or raspberry purée",G(a*.2)],["Vanilla",P1(a*.005)+" g"]],
   steps:["Line a loaf tin with cling film.","Whisk the yolks and sugar in a bowl over a pan of barely simmering water for 8 minutes, until thick and about 75 °C. Whisk off the heat until cool.","Whip the cream to soft peaks and fold it into the yolk mixture with the vanilla.","Crush half the raspberries and swirl them through. Pour into the tin, dot with the rest and freeze at least 6 hours.","Turn out and slice with a warm knife."],
   learn:["Semifreddo means half cold in Italian. The whipped cream traps air, so it is soft enough to slice without churning.","Folding gently keeps the air in the cream, which is what makes the texture light."]};
  if(s.t==="granita")return{title:"Lemon granita",meta:[["clock","20 min + 4 h freezing"],["icecream","Makes about "+G(a)],["fridge","Best the same day"]],note:["No machine needed. Scraping with a fork every 30 minutes gives light, fluffy ice crystals."],
   ing:[["Lemon juice (about "+Math.ceil(a*.22/45)+" lemons)",G(a*.22)],["Sugar",G(a*.2)],["Water",G(a*.58)],["Lemon zest",P1(a*.002)+" g"]],
   steps:["Warm half the water with the sugar and zest until the sugar dissolves. Add the rest of the water and the lemon juice. Cool.","Pour into a shallow metal or glass dish, about 3 cm deep. Freeze 45 minutes.","Scrape the frozen edges into the middle with a fork. Repeat every 30 minutes for 3–4 hours, until you have a pile of light crystals.","Serve straight away in cold glasses."],
   learn:["The sugar controls how hard it freezes: too little gives a block of ice, too much stays slushy.","If it freezes solid, leave it 10 minutes at room temperature, then break it up with a fork."]};
  if(s.t==="froyo")return{title:"Frozen yogurt",meta:[["clock","15 min + freezing"],["icecream","Makes about "+G(a)],["fridge","Best within 2 weeks"]],note:["Full-fat yogurt freezes creamier. Low-fat versions turn icy."],
   ing:[["Full-fat Greek yogurt",G(a*.78)],["Sugar or honey",G(a*.15)],["Milk",G(a*.06)],["Vanilla",P1(a*.01)+" g"]],
   steps:["Stir the yogurt, sugar, milk and vanilla until the sugar has dissolved. Taste: it should be a little too sweet.","Chill 1 hour, then churn in an ice cream machine 20 minutes. Or pour into a tray, freeze and whisk every 45 minutes, 4 times.","Freeze until scoopable, and leave 10 minutes at room temperature before serving."],
   learn:["Sugar lowers the freezing point, so it keeps frozen yogurt scoopable instead of rock hard.","Honey makes it a little softer than sugar does."]};
  return{title:"Ice lollies",meta:[["clock","10 min + 6 h freezing"],["icecream","About "+Math.max(4,Math.round(a/70))+" lollies"]],note:["A little sugar keeps them from freezing rock hard."],ing:[["Blended fruit or juice",G(a*.85)],["Sugar or honey",G(a*.08)],["Water",G(a*.07)]],steps:["Blend everything until smooth. Taste: it should be a bit too sweet, as freezing dulls sweetness.","Pour into moulds, add sticks after 1 hour and freeze 6 hours.","Run the mould under warm water for 10 seconds to release."]}}},
bake:{title:"What are we baking?",sub:"Cakes scaled to any tin, and cookies, muffins and scones by the count.",
 ctl:[{k:"t",label:"Bake",icon:"cupcake",def:"cake",tg:[["cake","Sponge cake"],["cookie","Cookies"],["brownie","Brownies"],["banana","Banana bread"],["muffin","Muffins"],["scone","Scones"],["short","Shortbread"]]},
      {k:"sh",label:"Tin shape",icon:"ruler",def:"round",tg:[["round","Round"],["square","Square"],["loaf","Loaf"]],only:"cake"},
      {k:"c",label:"Tin size (cm across, or length)",icon:"ruler",def:20,step:[12,32,1,"cm"],only:["cake","brownie"]},
      {k:"l",label:"How many loaves",icon:"ruler",def:1,step:[1,3,1,""],only:"banana"},
      {k:"k",label:"How many",icon:"cookie",def:24,step:[6,60,6,""],only:["cookie","muffin","scone","short"]}],
 calc(s){
  if(s.t==="brownie"){
   const c=s.c,f=c*c/400,t=Math.max(20,Math.round((25+8*(f-1))/5)*5),temp=f>1.6?"170 °C":"180 °C",pcs=Math.max(4,Math.round(f*16));
   return{title:"Fudgy brownies for a "+c+" cm square tin",meta:[["clock",t+" min bake"],["flame",temp],["cookie","Cuts into "+pcs]],
    note:["Based on a 20 cm square tin (16 brownies). Pull them out while the middle still wobbles a little: they set as they cool."],
    ing:[["Dark chocolate, chopped",G(150*f)],["Butter",G(150*f)],["Sugar",G(200*f)],["Eggs",eggs(150*f)],["Plain flour",G(90*f)],["Cocoa powder",G(30*f)],["Vanilla",P1(5*f)+" g"],["Salt",P1(2*f)+" g"]],
    steps:["Heat the oven to "+temp+". Grease and line the tin with baking paper, with some hanging over the sides.","Melt the chocolate and butter together over a pan of barely simmering water or in short bursts in the microwave. Stir smooth and cool 5 minutes.","Whisk in the sugar, then the eggs one at a time, then the vanilla, until glossy.","Sift in the flour, cocoa and salt and fold in just until no dry streaks remain.","Scrape into the tin and bake about "+t+" minutes, until the top is papery and a skewer comes out with a few moist crumbs.","Cool completely in the tin (or chill 1 hour), then lift out and cut into "+pcs+" squares with a hot knife."]}}
  if(s.t==="banana"){
   const l=s.l||1;
   return{title:l+" banana bread "+(l>1?"loaves":"loaf"),meta:[["clock","About 1 h 20 min"],["flame","175 °C"],["cupcake","Tin: 22 × 12 cm each"]],
    note:["The riper the bananas, the sweeter and moister the loaf. Black-spotted or fully brown is perfect."],
    ing:[["Very ripe bananas, peeled",G(300*l)],["Melted butter",G(80*l)],["Brown or white sugar",G(120*l)],["Eggs",eggs(100*l)],["Plain flour",G(220*l)],["Bicarbonate of soda",P1(5*l)+" g"],["Salt",P1(2*l)+" g"],["Walnuts or chocolate chips (optional)",G(60*l)]],
    steps:["Heat the oven to 175 °C. Grease and line "+(l>1?l+" 22 × 12 cm loaf tins":"a 22 × 12 cm loaf tin")+".","Mash the bananas in a large bowl until almost smooth. Stir in the melted butter, sugar and eggs.","Add the flour, soda and salt and fold until just combined. Fold in the nuts or chocolate if using.","Pour into the tin"+(l>1?"s":"")+" and bake 55–65 minutes, until a skewer comes out clean. Cover loosely with foil if the top browns too fast.","Cool 10 minutes in the tin, then on a rack."]}}
  if(s.t==="muffin"){
   const k=s.k/12;
   return{title:s.k+" blueberry muffins",meta:[["clock","About 40 min"],["flame","200 °C, then 180 °C"],["cupcake","12-hole tray: "+Math.ceil(s.k/12)]],
    note:["Stir until just combined. A lumpy batter gives tall, tender muffins; overmixing makes them tough."],
    ing:[["Plain flour",G(300*k)],["Sugar",G(120*k)],["Baking powder",P1(12*k)+" g"],["Salt",P1(2*k)+" g"],["Milk",G(240*k)],["Oil or melted butter",G(90*k)],["Eggs",eggs(100*k)],["Vanilla",P1(5*k)+" g"],["Blueberries (fresh or frozen)",G(150*k)]],
    steps:["Heat the oven to 200 °C and line a muffin tray with paper cases.","Whisk the flour, sugar, baking powder and salt in a large bowl.","In a jug, whisk the milk, oil, eggs and vanilla. Pour into the dry mix and stir about 10 times, until just combined. Fold in the berries.","Fill the cases about three-quarters full.","Bake 5 minutes at 200 °C, then turn the oven down to 180 °C and bake 13–15 minutes more, until golden and springy.","Cool 5 minutes in the tray, then on a rack."]}}
  if(s.t==="scone"){
   const k=s.k/10;
   return{title:s.k+" scones",meta:[["clock","About 35 min"],["flame","220 °C"],["cookie","About 85 g each"]],
    note:["Press the cutter straight down and do not twist: twisting seals the edges and the scones rise lopsided."],
    ing:[["Self-raising flour (or plain plus baking powder)",G(450*k)],["Baking powder (skip if self-raising)",P1(8*k)+" g"],["Sugar",G(50*k)],["Salt",P1(2*k)+" g"],["Cold butter, cubed",G(90*k)],["Cold milk",G(180*k)],["Egg",eggs(50*k)],["Milk, for brushing",G(15*k)]],
    steps:["Heat the oven to 220 °C and flour a tray.","Rub the cold butter into the flour, sugar and salt with your fingertips until it looks like breadcrumbs.","Beat the egg into the milk, keeping a spoonful to brush on top. Stir into the flour with a knife until a soft dough forms.","Pat out gently to 3 cm thick. Cut out "+s.k+" rounds with a 6 cm cutter, re-pressing the scraps once.","Place close together on the tray, brush the tops with milk and bake 12–15 minutes until risen and golden.","Cool a few minutes and serve warm with jam and cream."]}}
  if(s.t==="short"){
   const k=s.k/24;
   return{title:s.k+" shortbread fingers",meta:[["clock","About 50 min"],["flame","160 °C"],["cookie","About 25 g each"]],
    note:["The classic ratio is 3 parts flour, 2 parts butter, 1 part sugar by weight. It keeps in a tin for 2 weeks."],
    ing:[["Plain flour",G(300*k)],["Cold butter, cubed",G(200*k)],["Caster sugar (plus a little to sprinkle)",G(100*k)],["Salt",P1(1*k)+" g"]],
    steps:["Heat the oven to 160 °C and line a tin or tray.","Rub the butter into the flour, sugar and salt, then squeeze together into a smooth dough. Do not overwork it.","Press into a 1.5 cm layer in the tin, or roll out and cut into "+s.k+" fingers. Prick all over with a fork.","Chill 20 minutes so they hold their shape.","Bake 22–28 minutes until pale gold. Sprinkle with sugar and cut into fingers while still warm.","Cool completely in the tin before lifting out."]}}
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
drinks:{title:"What are we drinking?",sub:"Cold brew, lemonade and syrup by the jug, and hot chocolate and chai by the mug.",
 ctl:[{k:"t",label:"Drink",icon:"drinks",def:"coffee",tg:[["coffee","Cold brew coffee"],["tea","Cold brew tea"],["lemonade","Lemonade"],["syrup","Simple syrup"],["choc","Hot chocolate"],["chai","Masala chai"],["smoothie","Berry banana smoothie"],["mulled","Mulled wine"]]},
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
  if(s.t==="smoothie"){const k=a/250,m=Math.max(1,Math.round(k));return{title:"Berry banana smoothie for "+m,meta:[["clock","5 min"],["drinks","Makes "+m+(m>1?" glasses":" glass")],["fridge","Best straight away"]],note:["Frozen fruit makes it thick and cold without ice, which would water it down. Add the liquid first so the blender does not stall."],
   ing:[["Milk (or plant milk)",ML(100*k)],["Plain yogurt",G(70*k)],["Frozen banana, in chunks",G(60*k)],["Frozen mixed berries",G(70*k)],["Honey (optional)",P1(5*k)+" g"]],
   steps:["Put the milk and yogurt in the blender first, then the frozen banana and berries on top.","Blend on high 45–60 seconds until completely smooth. Add a splash more milk if it is too thick.","Taste, add honey if you like, and pour into glasses."],
   learn:["Ripe bananas, peeled and frozen in chunks, are the secret to a creamy smoothie.","Yogurt adds protein and a little tang that balances the sweet fruit."]}}
  if(s.t==="mulled"){const k=a/250,m=Math.max(1,Math.round(k));return{title:"Mulled wine for "+m,meta:[["clock","25 min"],["drinks","Makes "+m+(m>1?" mugs":" mug")],["flame","Very low heat, never boiling"]],note:["Never let it boil: that burns off the alcohol and makes it bitter. For a non-alcoholic version, use apple or red grape juice instead of the wine."],
   ing:[["Red wine (fruity, not expensive)",ML(200*k)],["Water",ML(30*k)],["Sugar or honey, to taste",P1(15*k)+" g"],["Orange, sliced",Math.max(1,Math.ceil(k/2))+(Math.ceil(k/2)>1?" oranges":" orange")],["Cinnamon stick",Math.max(1,Math.round(.5*k))+(Math.max(1,Math.round(.5*k))>1?" sticks":" stick")],["Cloves",Math.max(2,Math.round(2*k))+""],["Star anise",Math.max(1,Math.round(.5*k))+""],["Brandy (optional)",ML(10*k)]],
   steps:["Put the wine, water, sugar, orange and spices in a pot.","Warm over the lowest heat for 15–20 minutes, until steaming (about 75 °C) but never simmering.","Taste and add sugar if you like. Stir in the brandy, if using, and strain into mugs."],
   learn:["Mulled wine is a cold-weather classic across Europe, known as glühwein in Germany and vin chaud in France.","Heating the spices gently in the wine releases their flavour without turning the wine bitter."]}}
  if(s.t==="choc"){const k=a/250,m=Math.max(1,Math.round(k));return{title:"Hot chocolate for "+m,meta:[["clock","10 min"],["drinks","Makes "+m+(m>1?" mugs":" mug")],["flame","Low heat"]],note:["Keep the heat low and never let it boil: boiling makes it grainy and can scorch the milk."],
   ing:[["Whole milk",ML(230*k)],["Dark chocolate (60–70%), chopped",G(40*k)],["Sugar, to taste",P1(8*k)+" g"],["Salt","a pinch"]],
   steps:["Warm the milk in a pot over low heat until steaming, not boiling.","Add the chocolate and whisk until completely melted and smooth.","Taste and add the sugar and a pinch of salt. Whisk until frothy and pour into mugs."],
   learn:["Real chocolate gives a richer drink than cocoa powder because of its cocoa butter.","A pinch of salt makes the chocolate taste stronger and less flat."]}}
  if(s.t==="chai"){const k=a/250,m=Math.max(1,Math.round(k));return{title:"Masala chai for "+m,meta:[["clock","15 min"],["drinks","Makes "+m+(m>1?" mugs":" mug")],["flame","Gentle simmer"]],note:["Strong black tea (Assam is traditional) stands up to the milk and spices."],
   ing:[["Water",ML(125*k)],["Whole milk",ML(125*k)],["Loose black tea",P1(3*k)+" g"],["Sugar, to taste",P1(12*k)+" g"],["Fresh ginger, sliced",P1(4*k)+" g"],["Cardamom pods, crushed",Math.max(1,Math.round(2*k))+" pods"],["Cinnamon stick","a small piece"],["Cloves",Math.max(1,Math.round(1*k))+""]],
   steps:["Simmer the water with the ginger, cardamom, cinnamon and cloves 5 minutes.","Add the tea and simmer 2 minutes.","Add the milk and sugar and heat until it just begins to rise. Lower the heat and simmer 2 minutes.","Strain into mugs and serve hot."],
   learn:["Chai simply means tea in Hindi. The spiced milk tea is called masala chai.","Simmering the tea in the milk, instead of steeping it, gives the strong, creamy flavour it is known for."]}}
  const rich=s.r==="2",wt=a/(rich?2.05:1.6)*1,sg=wt*(rich?2:1);
  return{title:(rich?"Rich":"Simple")+" syrup",meta:[["drinks","About "+ML(a)],["fridge",rich?"Keeps 6 months":"Keeps 1 month"]],note:["Ratio by weight: "+(rich?"2 parts sugar to 1 part water":"equal sugar and water")+"."],
   ing:[["Water",ML(wt)],["Sugar",G(sg)]],steps:["Warm the water and sugar in a pot, stirring, until the sugar dissolves. Do not boil hard.","Cool, pour into a clean bottle and keep in the fridge."]}}}
});
Object.assign(window.CRAFTLIB.LEARN,{
bake:{cake:["Creaming the butter and sugar traps tiny air bubbles that the baking powder then expands. Pale and fluffy really does matter.","Eggs added all at once can split the batter. A spoonful of flour with each addition stops that."],
 cookie:["Brown sugar adds moisture and chew, white sugar adds crispness. Half and half gives both.","Underbake a little: the cookies finish setting on the hot tray."],
 brownie:["The shiny, crackly top comes from whisking the sugar and eggs until glossy before adding the flour.","Fewer dry ingredients means fudgier brownies, so measure the flour carefully and do not overmix."],
 banana:["Ripe bananas have turned their starch into sugar, so they taste sweeter and mash more easily.","Overripe bananas can be peeled and frozen whole. Thaw them and use the juice too."],
 muffin:["The hot start at 200 °C makes the tops spring up fast, then the lower heat cooks them through without burning.","Frozen blueberries can go straight in. Toss them in a spoon of flour first so they do not sink."],
 scone:["Cold butter and a quick hand give a flaky crumb: the little butter pieces melt in the oven and make steam pockets.","Do not twist the cutter. A clean press lets the scones rise tall and straight."],
 short:["There is no egg or water, so the dough is tender and sandy. Overworking develops gluten and makes it tough instead.","Chilling before baking stops the butter melting too fast, so the fingers keep their shape."]}
});
})();
