/* cookbook-wraps-sandwiches.js — wraps, sandwiches, burgers, bagels, tarts and quick bakes that have no single cuisine. */
KITCHEN.add([
  {id:"chicken-caesar-wraps", name:"Chicken Caesar wraps", meal:"big", time:20, serves:2,
   ing:[["chicken-breast",250],["flour-tortillas","4pc"],["lettuce",120],["parmesan",25],["ranch-dressing",50],["lemon","0.5pc"],["black-pepper",1],["olive-oil",10]],
   steps:[
    "Slice {chicken-breast} into strips and season with {black-pepper}. Cook in {olive-oil} over medium-high heat for 7 minutes, until golden and cooked through (74 °C).",
    "Shred {lettuce} and shave the {parmesan}. Toss both with {ranch-dressing} and a squeeze of {lemon}.",
    "Warm the {flour-tortillas} in a dry pan for 20 seconds per side.",
    "Pile the chicken and salad onto each tortilla, fold in the sides and roll up tightly. Halve diagonally."]},
  {id:"turkey-avocado-cheddar-wraps", name:"Turkey, avocado and cheddar wraps", meal:"bite", time:10, serves:2,
   ing:[["flour-tortillas","2pc"],["deli-turkey",120],["avocado","1pc"],["cheddar",40],["lettuce",60],["tomato","1pc"],["mustard",10]],
   steps:[
    "Mash {avocado} with a fork. Slice {tomato} and grate {cheddar}; shred {lettuce}.",
    "Spread each of the {flour-tortillas} with {mustard} and the avocado.",
    "Layer {deli-turkey}, cheddar, tomato and lettuce down the centre.",
    "Fold in the sides, roll up tightly and cut in half."]},
  {id:"hummus-roasted-veg-wraps", name:"Hummus and roasted vegetable wraps", meal:"big", time:35, serves:2,
   ing:[["flour-tortillas","4pc"],["hummus",120],["red-pepper",150],["zucchini",200],["red-onion","1pc"],["olive-oil",15],["rocket",40],["salt",2]],
   steps:[
    "Heat the oven to 220 °C. Cut {red-pepper}, {zucchini} and {red-onion} into strips and toss with {olive-oil} and {salt}.",
    "Roast on a tray for 25 minutes, turning once, until soft and charred at the edges.",
    "Warm the {flour-tortillas} and spread each with {hummus}.",
    "Add the roasted vegetables and {rocket}, fold in the sides and roll up."]},
  {id:"egg-cheese-breakfast-burritos", name:"Egg, bean and cheese breakfast burritos", meal:"morning", time:20, serves:2,
   ing:[["flour-tortillas","2pc"],["eggs","4pc"],["cheddar",50],["black-beans",120],["salsa-tomato",60],["butter",10],["spring-onion",20]],
   steps:[
    "Whisk {eggs} with a pinch of pepper. Slice {spring-onion}; grate {cheddar}.",
    "Melt {butter} in a non-stick pan and scramble the eggs gently over low heat for 3 minutes.",
    "Warm {black-beans} in a small pan for 3 minutes, then drain off excess liquid.",
    "Fill each of the {flour-tortillas} with egg, beans, cheddar, {salsa-tomato} and spring onion. Fold in the ends and roll up."]},
  {id:"bacon-egg-cheese-bagels", name:"Bacon, egg and cheese bagels", meal:"morning", time:15, serves:2,
   ing:[["bagels","2pc"],["bacon",80],["eggs","2pc"],["cheddar",40],["butter",10]],
   steps:[
    "Fry {bacon} in a dry pan for 5 minutes until crisp; set aside on paper.",
    "Melt {butter} in the same pan and fry {eggs} to your liking, about 3 minutes.",
    "Split and toast the {bagels}.",
    "Layer egg, bacon and slices of {cheddar} on the bottom halves, close and press down until the cheese softens."]},
  {id:"smoked-salmon-cream-cheese-bagels", name:"Smoked salmon and cream cheese bagels", meal:"morning", time:10, serves:2,
   ing:[["bagels","2pc"],["cream-cheese",80],["smoked-salmon",100],["cucumber",100],["capers",10],["dill",3],["lemon","0.5pc"]],
   steps:[
    "Split and toast the {bagels}.",
    "Spread both halves with {cream-cheese}. Slice {cucumber} thinly and chop {dill}.",
    "Top with {smoked-salmon}, cucumber and {capers}.",
    "Finish with {dill} and a squeeze of {lemon}."]},
  {id:"ham-egg-muffin-sandwiches", name:"Ham and egg muffin sandwiches", meal:"morning", time:15, serves:2,
   ing:[["english-muffins","2pc"],["eggs","2pc"],["ham",60],["cheddar",30],["butter",10]],
   steps:[
    "Split and toast the {english-muffins}.",
    "Melt {butter} in a small pan and fry {eggs} for 3 minutes, until the whites are set.",
    "Warm {ham} in the same pan for 1 minute.",
    "Fill each muffin with ham, egg and a slice of {cheddar}; press together while still warm."]},
  {id:"pastrami-swiss-melts-on-rye", name:"Pastrami and Swiss melts on rye", meal:"big", time:15, serves:2,
   ing:[["rye-bread","4pc"],["pastrami",150],["swiss-cheese",80],["sauerkraut",80],["mayonnaise",20],["ketchup",10],["butter",15]],
   steps:[
    "Stir {mayonnaise} and {ketchup} together for a quick sauce.",
    "Spread the sauce on two slices of {rye-bread}; top with {pastrami}, {sauerkraut} and {swiss-cheese}, then close with the remaining slices.",
    "Butter the outsides with {butter}.",
    "Toast in a pan over medium heat for 3 minutes per side, until golden and the cheese has melted."]},
  {id:"tuna-melt-english-muffins", name:"Tuna melt English muffins", meal:"big", time:15, serves:2,
   ing:[["english-muffins","2pc"],["tuna",160],["mayonnaise",30],["celery",30],["cheddar",60],["spring-onion",15]],
   steps:[
    "Heat the grill. Flake {tuna} and mix with {mayonnaise}, finely chopped {celery} and sliced {spring-onion}.",
    "Split and lightly toast the {english-muffins}.",
    "Pile the filling on the four halves and cover with grated {cheddar}.",
    "Grill for 3 minutes, until bubbling and golden."]},
  {id:"crispy-chicken-burgers", name:"Crispy chicken burgers", meal:"big", time:30, serves:2,
   ing:[["chicken-breast",280],["flour",30],["eggs","1pc"],["breadcrumbs",50],["burger-buns","2pc"],["lettuce",40],["tomato","1pc"],["mayonnaise",30],["oil",40],["salt",2],["paprika",2]],
   steps:[
    "Slice {chicken-breast} horizontally into two thin cutlets per person and flatten slightly. Season with {salt} and {paprika}.",
    "Dredge in {flour}, dip in beaten {eggs}, then press into {breadcrumbs}.",
    "Shallow-fry in {oil} over medium heat for 4 minutes per side, until deep golden and cooked through (74 °C).",
    "Toast the {burger-buns}, spread with {mayonnaise}, and fill with the chicken, {lettuce} and sliced {tomato}."]},
  {id:"classic-cheeseburgers", name:"Classic cheeseburgers", meal:"big", time:25, serves:2,
   ing:[["beef-mince",300],["burger-buns","2pc"],["cheddar",40],["onion","0.5pc"],["lettuce",40],["tomato","1pc"],["pickles",30],["ketchup",20],["mustard",5],["salt",2],["black-pepper",1],["oil",10]],
   steps:[
    "Mix {beef-mince} with {salt} and {black-pepper} and shape into two patties slightly wider than the buns, pressing a dimple in the centre.",
    "Slice {onion}, {tomato} and {pickles}.",
    "Heat {oil} in a heavy pan until very hot and cook the patties 4 minutes per side. Lay {cheddar} on top for the last minute.",
    "Toast the {burger-buns}, spread with {ketchup} and {mustard}, and stack with the patty, onion, {lettuce}, tomato and pickles."]},
  {id:"smoky-black-bean-burgers", name:"Smoky black bean burgers", meal:"big", time:30, serves:2,
   ing:[["black-beans",240],["oats",40],["onion","0.5pc"],["garlic","1pc"],["cumin",2],["smoked-paprika",2],["tomato-paste",15],["burger-buns","2pc"],["avocado","1pc"],["oil",20],["salt",2]],
   steps:[
    "Drain {black-beans} and mash roughly with a fork, leaving some texture.",
    "Finely chop {onion} and {garlic}; mix into the beans with {oats}, {cumin}, {smoked-paprika}, {tomato-paste} and {salt}. Rest 10 minutes.",
    "Shape into two patties and fry in {oil} for 4 minutes per side until crisp.",
    "Toast the {burger-buns} and fill with the patties and sliced {avocado}."]},
  {id:"bbq-pulled-chicken-sliders", name:"BBQ pulled chicken sliders", meal:"big", time:50, serves:2,
   ing:[["chicken-thigh",350],["bbq-sauce",80],["burger-buns","4pc"],["red-cabbage",100],["mayonnaise",30],["vinegar",10],["oil",10],["salt",2]],
   steps:[
    "Simmer {chicken-thigh} in a lidded pan with {oil}, {salt} and a splash of water for 30 minutes, until very tender.",
    "Shred the chicken with two forks and stir through {bbq-sauce}; keep warm over low heat.",
    "Shred {red-cabbage} and toss with {mayonnaise} and {vinegar} for a quick slaw.",
    "Toast the {burger-buns} and fill with the pulled chicken and slaw."]},
  {id:"crispy-fish-sandwiches", name:"Crispy fish sandwiches with tartare sauce", meal:"big", time:30, serves:2,
   ing:[["white-fish",300],["flour",30],["eggs","1pc"],["breadcrumbs",50],["burger-buns","2pc"],["mayonnaise",40],["cornichons",20],["lemon","0.5pc"],["lettuce",30],["oil",40]],
   steps:[
    "Chop {cornichons} and mix with {mayonnaise} and a squeeze of {lemon} for tartare sauce.",
    "Cut {white-fish} into two portions that fit the buns. Coat in {flour}, beaten {eggs}, then {breadcrumbs}.",
    "Shallow-fry in {oil} for 3 minutes per side, until golden and flaking.",
    "Toast the {burger-buns} and fill with {lettuce}, the fish and plenty of tartare sauce."]},
  {id:"halloumi-burgers", name:"Halloumi burgers with pesto", meal:"big", time:20, serves:2,
   ing:[["halloumi",200],["burger-buns","2pc"],["tomato","1pc"],["rocket",30],["pesto",30],["red-onion","0.5pc"],["olive-oil",10]],
   steps:[
    "Cut {halloumi} into thick slices. Slice {tomato} and {red-onion}.",
    "Fry the halloumi in {olive-oil} for 2 minutes per side until golden.",
    "Toast the {burger-buns} and spread both halves with {pesto}.",
    "Stack the halloumi, tomato, red onion and {rocket} in the buns."]},
  {id:"smashed-chickpea-sandwiches", name:"Smashed chickpea salad sandwiches", meal:"big", time:15, serves:2,
   ing:[["chickpeas",240],["tahini",20],["lemon","0.5pc"],["bread","4pc"],["cucumber",100],["lettuce",40],["red-onion","0.5pc"],["salt",1],["black-pepper",1]],
   steps:[
    "Drain and rinse {chickpeas}. Mash in a bowl with a fork, leaving some pieces whole.",
    "Stir in {tahini}, the juice of {lemon}, finely diced {red-onion}, {salt} and {black-pepper}.",
    "Slice {cucumber}. Toast the {bread} if you like.",
    "Spread the mixture on half the slices, top with cucumber and {lettuce}, and close the sandwiches."]},
  {id:"classic-blt-sandwiches", name:"Classic BLT sandwiches", meal:"big", time:15, serves:2,
   ing:[["bread","4pc"],["bacon",120],["tomato","2pc"],["lettuce",50],["mayonnaise",25],["black-pepper",1]],
   steps:[
    "Cook {bacon} in a dry pan for 6 minutes until crisp; drain on paper.",
    "Toast the {bread}. Slice {tomato} and season with {black-pepper}.",
    "Spread toast with {mayonnaise}.",
    "Layer bacon, tomato and {lettuce} on two slices, top with the others and cut in half."]},
  {id:"egg-chive-sandwiches", name:"Egg and chive sandwiches", meal:"bite", time:20, serves:2,
   ing:[["eggs","4pc"],["mayonnaise",40],["mustard",5],["chives",5],["bread","4pc"],["lettuce",30],["black-pepper",1]],
   steps:[
    "Boil {eggs} for 9 minutes, then cool in cold water and peel.",
    "Mash with {mayonnaise}, {mustard}, snipped {chives} and {black-pepper}.",
    "Spread over two slices of {bread}, add {lettuce}, and close with the remaining slices.",
    "Cut off the crusts if you like, then halve."]},
  {id:"coronation-chicken-sandwiches", name:"Coronation chicken sandwiches", meal:"big", time:30, serves:2,
   ing:[["chicken-breast",300],["mayonnaise",60],["yogurt",40],["curry-powder",6],["mango-chutney",30],["raisins",20],["almonds",15],["bread","4pc"],["lettuce",40],["salt",1]],
   steps:[
    "Poach {chicken-breast} in simmering salted water for 15 minutes until cooked through (74 °C); cool and shred.",
    "Mix {mayonnaise}, {yogurt}, {curry-powder} and {mango-chutney}. Stir in the chicken and {raisins}.",
    "Toast {almonds} in a dry pan for 2 minutes and chop.",
    "Spread the chicken on {bread}, scatter over the almonds, add {lettuce} and close."]},
  {id:"grilled-cheese-sandwiches", name:"Grilled cheese sandwiches", meal:"bite", time:12, serves:2,
   ing:[["bread","4pc"],["cheddar",100],["butter",20],["mustard",5]],
   steps:[
    "Spread one side of each slice of {bread} with {butter}; spread a little {mustard} on the other sides of two slices.",
    "Layer sliced {cheddar} between the mustard sides, buttered sides facing out.",
    "Cook in a pan over medium-low heat for 3 minutes per side, until deep golden and the cheese has melted."]},
  {id:"tomato-soup-grilled-cheese-dippers", name:"Creamy tomato soup with grilled cheese dippers", meal:"big", time:35, serves:2,
   ing:[["passata",400],["onion","1pc"],["garlic","2pc"],["vegetable-stock",300],["cream",50],["basil",5],["bread","4pc"],["cheddar",100],["butter",30],["olive-oil",10],["sugar",3],["salt",2]],
   steps:[
    "Dice {onion} and soften in {olive-oil} for 6 minutes. Add crushed {garlic} for 1 minute.",
    "Pour in {passata}, {vegetable-stock}, {sugar} and {salt}; simmer 15 minutes. Blend until smooth, then stir in {cream} and torn {basil}.",
    "Butter the {bread} with {butter}, sandwich with {cheddar} and fry until golden on both sides.",
    "Cut the toasties into fingers and serve with the soup for dipping."]},
  {id:"naan-pizzas", name:"Naan pizzas", meal:"big", time:20, serves:2,
   ing:[["naan","2pc"],["passata",80],["mozzarella",120],["pepperoni",40],["basil",5],["olive-oil",5],["oregano",1]],
   steps:[
    "Heat the oven to 220 °C. Place the {naan} on a tray and brush with {olive-oil}.",
    "Spread with {passata} and sprinkle with {oregano}.",
    "Top with torn {mozzarella} and {pepperoni}.",
    "Bake 8 minutes until bubbling, then finish with {basil}."]},
  {id:"crispy-tortilla-pizzas", name:"Crispy tortilla pizzas", meal:"bite", time:15, serves:2,
   ing:[["flour-tortillas","2pc"],["passata",60],["mozzarella",100],["mushrooms",80],["black-olives",30],["oregano",1],["olive-oil",5]],
   steps:[
    "Heat the oven to 230 °C. Brush the {flour-tortillas} with {olive-oil} and bake 3 minutes until just crisp.",
    "Spread with {passata}; top with sliced {mushrooms}, {black-olives}, {mozzarella} and {oregano}.",
    "Bake 6 minutes more until the cheese bubbles and the edges are crisp."]},
  {id:"lavash-hummus-feta-flatbreads", name:"Lavash with hummus, feta and olives", meal:"bite", time:10, serves:2,
   ing:[["lavash","2pc"],["hummus",100],["feta",60],["cucumber",80],["tomato","1pc"],["black-olives",30],["olive-oil",5]],
   steps:[
    "Warm the {lavash} briefly in a dry pan.",
    "Spread with {hummus}; scatter over diced {cucumber}, {tomato}, crumbled {feta} and {black-olives}.",
    "Drizzle with {olive-oil} and fold or roll to eat."]},
  {id:"peanut-butter-banana-roll-ups", name:"Peanut butter banana roll-ups", meal:"bite", time:5, serves:2,
   ing:[["flour-tortillas","2pc"],["peanut-butter",40],["banana","2pc"],["honey",10],["cinnamon",1]],
   steps:[
    "Spread {peanut-butter} over the {flour-tortillas}.",
    "Place a peeled {banana} on the edge of each, drizzle with {honey} and dust with {cinnamon}.",
    "Roll up tightly and slice into rounds, or eat whole."]},
  {id:"cinnamon-sugar-tortilla-crisps-berries", name:"Cinnamon sugar tortilla crisps with berries", meal:"treat", time:20, serves:2,
   ing:[["flour-tortillas","3pc"],["butter",20],["sugar",30],["cinnamon",3],["berries",150],["yogurt",100]],
   steps:[
    "Heat the oven to 190 °C. Melt {butter} and brush over the {flour-tortillas}.",
    "Mix {sugar} with {cinnamon} and sprinkle over. Cut each tortilla into 8 wedges.",
    "Bake on a tray for 8 minutes until crisp and golden; cool a few minutes to firm up.",
    "Serve with {berries} and {yogurt} for dipping."]},
  {id:"chocolate-hazelnut-banana-quesadillas", name:"Chocolate hazelnut and banana quesadillas", meal:"treat", time:10, serves:2,
   ing:[["flour-tortillas","2pc"],["hazelnut-spread",50],["banana","1pc"],["butter",10]],
   steps:[
    "Spread {hazelnut-spread} over half of each of the {flour-tortillas}; top with sliced {banana} and fold over.",
    "Melt {butter} in a pan and cook the quesadillas for 2 minutes per side until golden and the filling is melting.",
    "Cut into wedges and eat warm."]},
  {id:"strawberry-cream-cheese-roll-ups", name:"Berry cream cheese roll-ups", meal:"treat", time:10, serves:2,
   ing:[["flour-tortillas","2pc"],["cream-cheese",80],["berries",120],["honey",15],["vanilla",2]],
   steps:[
    "Beat {cream-cheese} with {honey} and {vanilla} until smooth.",
    "Spread over the {flour-tortillas} and scatter with chopped {berries}.",
    "Roll up tightly, chill for 10 minutes if you have time, and slice into pinwheels."]},
  {id:"berry-cheesecake-pots", name:"Berry cheesecake pots", meal:"treat", time:20, serves:2,
   ing:[["cream-cheese",150],["digestive-biscuits",60],["butter",25],["berries",100],["honey",20],["vanilla",2],["cream",100]],
   steps:[
    "Crush {digestive-biscuits} and mix with melted {butter}; press into two glasses.",
    "Whip {cream} to soft peaks, then fold in {cream-cheese}, {honey} and {vanilla}.",
    "Spoon over the biscuit base and top with {berries}. Chill for at least 15 minutes."]},
  {id:"oven-smores-sandwiches", name:"Oven s'mores sandwiches", meal:"treat", time:12, serves:2,
   ing:[["digestive-biscuits",100],["marshmallows",60],["dark-chocolate",60]],
   steps:[
    "Heat the oven to 200 °C. Lay half of the {digestive-biscuits} on a tray and top each with squares of {dark-chocolate} and {marshmallows}.",
    "Bake 4 minutes until the marshmallows puff and begin to colour.",
    "Top with the remaining biscuits, press gently and let cool for a minute before eating."]},
  {id:"peach-granola-crumble", name:"Peach crumble with granola", meal:"treat", time:35, serves:2,
   ing:[["peaches","3pc"],["granola",80],["butter",20],["cinnamon",2],["honey",20],["yogurt",100]],
   steps:[
    "Heat the oven to 190 °C. Slice {peaches} into a baking dish and toss with {honey} and {cinnamon}.",
    "Rub {butter} into {granola} with your fingertips and scatter over the fruit.",
    "Bake 25 minutes until the peaches are soft and the topping is golden.",
    "Serve warm with {yogurt}."]},
  {id:"roasted-plums-yogurt-granola", name:"Roasted plums with yogurt and granola", meal:"morning,treat", time:25, serves:2,
   ing:[["plums","5pc"],["honey",20],["yogurt",250],["granola",60],["cinnamon",1]],
   steps:[
    "Heat the oven to 200 °C. Halve and stone the {plums}, then lay cut side up in a dish with {honey} and {cinnamon}.",
    "Roast 15 minutes until soft and juicy.",
    "Spoon {yogurt} into bowls, top with the warm plums and their juices, and finish with {granola}."]},
  {id:"berry-granola-yogurt-parfaits", name:"Berry granola yogurt parfaits", meal:"morning", time:5, serves:2,
   ing:[["yogurt",300],["granola",80],["berries",150],["honey",15]],
   steps:[
    "Layer {yogurt}, {granola} and {berries} in two glasses.",
    "Drizzle with {honey} and serve straight away so the granola stays crunchy."]},
  {id:"maple-pecan-granola", name:"Maple pecan granola clusters", meal:"morning,treat", time:35, serves:4,
   ing:[["oats",200],["pecans",60],["maple-syrup",60],["oil",30],["cinnamon",3],["sunflower-seeds",30],["salt",1]],
   steps:[
    "Heat the oven to 160 °C. Mix {oats}, chopped {pecans}, {sunflower-seeds}, {cinnamon} and {salt}.",
    "Stir through {maple-syrup} and {oil} until everything is coated, then press firmly onto a lined tray.",
    "Bake 25 minutes, turning the tray halfway, until golden. Let it cool completely before breaking into clusters."]},
  {id:"roasted-peaches-honey-pecans", name:"Roasted peaches with honey, yogurt and pecans", meal:"treat", time:25, serves:2,
   ing:[["peaches","3pc"],["honey",25],["pecans",25],["yogurt",150],["cinnamon",1]],
   steps:[
    "Heat the oven to 200 °C. Halve and stone the {peaches}; place cut side up in a dish and drizzle with {honey}.",
    "Roast 18 minutes until caramelised and soft.",
    "Toast {pecans} in a dry pan for 2 minutes and chop.",
    "Serve the peaches with {yogurt}, the pecans and a dusting of {cinnamon}."]},
  {id:"affogato-with-chocolate", name:"Affogato with dark chocolate", meal:"treat", time:8, serves:2,
   ing:[["vanilla-ice-cream",200],["coffee",12],["water",120],["dark-chocolate",20]],
   steps:[
    "Brew strong {coffee} with {water} (an espresso machine or moka pot works best, but a strong filter brew is fine).",
    "Scoop {vanilla-ice-cream} into two glasses.",
    "Pour the hot coffee over the ice cream and grate {dark-chocolate} on top."]},
  {id:"banana-splits", name:"Banana splits with chocolate hazelnut sauce", meal:"treat", time:10, serves:2,
   ing:[["banana","2pc"],["vanilla-ice-cream",200],["hazelnut-spread",40],["pecans",20],["berries",60]],
   steps:[
    "Warm {hazelnut-spread} with a splash of hot water until pourable.",
    "Split the {banana} lengthways and lay each in a bowl.",
    "Add scoops of {vanilla-ice-cream}, drizzle with the sauce, and top with chopped {pecans} and {berries}."]},
  {id:"rustic-apple-galette", name:"Rustic apple galette", meal:"treat", time:50, serves:4,
   ing:[["shortcrust-pastry",220],["apple","3pc"],["sugar",40],["cinnamon",2],["butter",20],["honey",15]],
   steps:[
    "Heat the oven to 200 °C. Roll out the {shortcrust-pastry} into a rough circle on a lined tray.",
    "Slice {apple} thinly and toss with {sugar} and {cinnamon}. Pile in the centre, leaving a 4 cm border.",
    "Fold the border over the fruit, dot with {butter} and bake 35 minutes until deep golden.",
    "Brush the warm apples with {honey} before serving."]},
  {id:"chicken-mushroom-pie", name:"Chicken and mushroom pie", meal:"big", time:70, serves:3,
   ing:[["shortcrust-pastry",250],["chicken-breast",300],["mushrooms",150],["leek",150],["cream",100],["flour",15],["chicken-stock",100],["thyme",1],["butter",15],["salt",2],["eggs","1pc"]],
   steps:[
    "Heat the oven to 200 °C. Dice {chicken-breast}, slice {mushrooms} and {leek}. Soften the leek and mushrooms in {butter} for 8 minutes.",
    "Add the chicken and cook 5 minutes. Stir in {flour}, then {chicken-stock}, {cream}, {thyme} and {salt}; simmer 5 minutes and cool slightly.",
    "Roll out the {shortcrust-pastry}, line a pie dish with half, fill, and cover with the rest. Crimp the edges and brush with beaten {eggs}.",
    "Bake 35 minutes until golden and bubbling."]},
  {id:"pesto-chicken-roasted-pepper-wraps", name:"Pesto chicken and roasted pepper wraps", meal:"big", time:20, serves:2,
   ing:[["chicken-breast",250],["pesto",40],["roasted-peppers",60],["rocket",30],["mozzarella",80],["flour-tortillas","4pc"],["olive-oil",10]],
   steps:[
    "Slice {chicken-breast} into strips and cook in {olive-oil} for 7 minutes until golden and cooked through (74 °C).",
    "Stir through {pesto} off the heat.",
    "Warm the {flour-tortillas}. Fill with the chicken, sliced {roasted-peppers}, torn {mozzarella} and {rocket}.",
    "Roll up tightly and halve."]},
  {id:"ham-cream-cheese-pinwheels", name:"Ham and cream cheese tortilla pinwheels", meal:"bite", time:15, serves:2,
   ing:[["flour-tortillas","4pc"],["cream-cheese",80],["ham",80],["cheddar",40],["spring-onion",15]],
   steps:[
    "Spread the {flour-tortillas} with {cream-cheese} all the way to the edges.",
    "Cover with {ham}, grated {cheddar} and sliced {spring-onion}.",
    "Roll tightly, wrap and chill for 10 minutes, then slice into pinwheels."]},
  {id:"tuna-avocado-cucumber-wraps", name:"Tuna, avocado and cucumber wraps", meal:"bite", time:10, serves:2,
   ing:[["flour-tortillas","2pc"],["tuna",160],["avocado","1pc"],["cucumber",100],["lemon","0.5pc"],["lettuce",40],["black-pepper",1]],
   steps:[
    "Flake {tuna} and mash with {avocado}, a squeeze of {lemon} and {black-pepper}.",
    "Slice {cucumber} into batons.",
    "Spread the mashed filling over the {flour-tortillas}, add cucumber and {lettuce}, then roll up and halve."]},
  {id:"tofu-scramble-breakfast-burritos", name:"Tofu scramble breakfast burritos", meal:"morning", time:25, serves:2,
   ing:[["tofu",250],["turmeric",2],["cumin",2],["black-beans",120],["red-pepper",100],["flour-tortillas","2pc"],["avocado","1pc"],["salsa-tomato",50],["oil",15],["salt",2]],
   steps:[
    "Dice {red-pepper} and fry in {oil} for 4 minutes. Crumble in {tofu} with {turmeric}, {cumin} and {salt}; cook 6 minutes.",
    "Warm {black-beans} in a small pan for 3 minutes and drain.",
    "Warm the {flour-tortillas} and fill with the scramble, beans, sliced {avocado} and {salsa-tomato}.",
    "Fold in the sides and roll up."]},
  {id:"sweet-potato-chickpea-tahini-wraps", name:"Sweet potato and chickpea wraps with tahini", meal:"big", time:40, serves:2,
   ing:[["sweet-potato",300],["chickpeas",120],["tahini",30],["lemon","1pc"],["flour-tortillas","4pc"],["spinach",40],["cumin",2],["smoked-paprika",2],["olive-oil",20],["salt",2]],
   steps:[
    "Heat the oven to 220 °C. Cube {sweet-potato} and toss with {olive-oil}, {cumin}, {smoked-paprika} and {salt}. Roast 20 minutes.",
    "Add drained {chickpeas} to the tray for the last 10 minutes.",
    "Whisk {tahini} with the juice of {lemon} and a spoonful of water until pourable.",
    "Warm the {flour-tortillas}; fill with the roasted mixture, {spinach} and the tahini sauce, then roll up."]},
  {id:"peanut-tofu-wraps", name:"Peanut tofu and crunchy veg wraps", meal:"big", time:25, serves:2,
   ing:[["tofu",250],["peanut-butter",40],["soy-sauce",20],["lime","1pc"],["sweet-chilli-sauce",20],["carrot",80],["cabbage",80],["coriander",8],["flour-tortillas","4pc"],["oil",15]],
   steps:[
    "Cut {tofu} into strips and fry in {oil} for 8 minutes until golden on all sides.",
    "Whisk {peanut-butter}, {soy-sauce}, the juice of {lime}, {sweet-chilli-sauce} and a splash of water into a sauce. Toss the tofu in half of it.",
    "Grate {carrot} and shred {cabbage}.",
    "Fill the warmed {flour-tortillas} with tofu, vegetables and {coriander}; drizzle with the remaining sauce and roll up."]},
  {id:"turkey-brie-cranberry-baguettes", name:"Turkey, brie and cranberry baguettes", meal:"big", time:10, serves:2,
   ing:[["baguette",160],["deli-turkey",120],["brie",60],["cranberry-sauce",40],["rocket",30]],
   steps:[
    "Split the {baguette} lengthways and cut in half.",
    "Spread both sides with {cranberry-sauce}.",
    "Layer {deli-turkey}, sliced {brie} and {rocket}; close and press down."]},
  {id:"brie-apple-grilled-cheese", name:"Brie and apple grilled cheese", meal:"bite", time:15, serves:2,
   ing:[["bread","4pc"],["brie",100],["apple","1pc"],["butter",15],["honey",5],["mustard",5]],
   steps:[
    "Thinly slice {apple} and {brie}.",
    "Spread two slices of {bread} with {mustard}; layer with brie and apple, drizzle with {honey}, and close.",
    "Butter the outsides with {butter} and toast in a pan over medium-low heat for 3 minutes per side until golden and melting."]},
  {id:"smoked-mackerel-kedgeree", name:"Smoked mackerel kedgeree", meal:"big", time:30, serves:2,
   ing:[["smoked-mackerel",200],["rice",150],["eggs","2pc"],["peas",80],["curry-powder",4],["onion","1pc"],["butter",15],["parsley",8],["lemon","0.5pc"],["salt",2],["water",300]],
   steps:[
    "Dice {onion} and soften in {butter} for 6 minutes. Stir in {curry-powder} for 1 minute.",
    "Add {rice}, {water} and {salt}; cover and cook on low for 12 minutes, adding {peas} for the last 3 minutes.",
    "Boil {eggs} for 8 minutes, cool and quarter.",
    "Flake the {smoked-mackerel} into the rice, fold through gently, and top with the eggs, {parsley} and a squeeze of {lemon}."]},
  {id:"smoked-mackerel-pate-toast", name:"Smoked mackerel pâté on toast", meal:"bite", time:10, serves:2,
   ing:[["smoked-mackerel",150],["cream-cheese",80],["lemon","0.5pc"],["horseradish",10],["bread","4pc"],["chives",5],["black-pepper",1]],
   steps:[
    "Flake {smoked-mackerel} and blend or mash with {cream-cheese}, the juice of {lemon}, {horseradish} and {black-pepper}.",
    "Toast the {bread} and spread generously with the pâté.",
    "Scatter with snipped {chives}."]},
  {id:"pastrami-hash-fried-eggs", name:"Pastrami hash with fried eggs", meal:"morning,big", time:35, serves:2,
   ing:[["pastrami",120],["potatoes",400],["onion","1pc"],["eggs","2pc"],["mustard",10],["oil",30],["chives",5],["salt",2]],
   steps:[
    "Dice {potatoes} and parboil for 6 minutes; drain well and let steam dry.",
    "Fry in {oil} over medium-high heat for 10 minutes with diced {onion}, turning only now and then, until crisp.",
    "Add chopped {pastrami} and {mustard} and cook 3 minutes.",
    "Fry {eggs} separately and serve on top with {chives} and a pinch of {salt}."]},
  {id:"sausage-pepper-sub-rolls", name:"Sausage and pepper sub rolls", meal:"big", time:35, serves:2,
   ing:[["sausage",300],["red-pepper",150],["onion","1pc"],["passata",100],["baguette",160],["provolone",50],["oregano",1],["olive-oil",15]],
   steps:[
    "Brown {sausage} in {olive-oil} for 8 minutes, then slice thickly.",
    "Add sliced {red-pepper} and {onion} and cook 8 minutes until soft. Stir in {passata} and {oregano}; simmer 6 minutes.",
    "Split the {baguette} and toast lightly.",
    "Pile in the filling, top with {provolone} and melt under a hot grill for 2 minutes."]},
  {id:"italian-sub-sandwiches", name:"Italian-style sub sandwiches", meal:"big", time:10, serves:2,
   ing:[["baguette",160],["salami",50],["ham",60],["provolone",50],["lettuce",40],["tomato","1pc"],["roasted-peppers",40],["olive-oil",15],["white-wine-vinegar",8],["oregano",1]],
   steps:[
    "Split the {baguette} and drizzle the insides with {olive-oil} and {white-wine-vinegar}; sprinkle with {oregano}.",
    "Layer {salami}, {ham}, {provolone}, sliced {tomato}, {roasted-peppers} and shredded {lettuce}.",
    "Press together and cut in half."]},
  {id:"tortellini-pasta-salad", name:"Tortellini pasta salad with pesto", meal:"big", time:20, serves:2,
   ing:[["tortellini",250],["pesto",40],["tomato","2pc"],["fresh-mozzarella",80],["black-olives",30],["rocket",30],["olive-oil",10]],
   steps:[
    "Boil {tortellini} according to the packet, usually 3 minutes. Drain and cool under cold water.",
    "Toss with {pesto} and {olive-oil}.",
    "Add quartered {tomato}, torn {fresh-mozzarella}, {black-olives} and {rocket}; fold gently."]},
  {id:"chicken-parmesan-subs", name:"Chicken parmesan subs", meal:"big", time:40, serves:2,
   ing:[["chicken-breast",300],["breadcrumbs",50],["eggs","1pc"],["flour",20],["passata",150],["mozzarella",100],["baguette",160],["basil",5],["oil",40]],
   steps:[
    "Slice {chicken-breast} into cutlets and flatten. Coat in {flour}, beaten {eggs}, then {breadcrumbs}.",
    "Shallow-fry in {oil} for 3 minutes per side until golden.",
    "Heat the grill. Lay the cutlets on a tray, spoon over {passata} and top with {mozzarella}; grill 4 minutes until bubbling.",
    "Split the {baguette}, fill with the chicken and finish with torn {basil}."]},
  {id:"eggs-in-purgatory-crusty-bread", name:"Eggs in purgatory with crusty bread", meal:"morning,big", time:25, serves:2,
   ing:[["passata",300],["eggs","4pc"],["garlic","2pc"],["chilli-flakes",1],["basil",5],["baguette",100],["olive-oil",15]],
   steps:[
    "Soften sliced {garlic} in {olive-oil} for 1 minute with {chilli-flakes}. Add {passata} and simmer 8 minutes.",
    "Make four wells in the sauce and crack in the {eggs}. Cover and cook gently for 6 minutes, until the whites are set.",
    "Warm the {baguette} and tear into pieces. Finish with {basil} and serve for dipping."]},
  {id:"caprese-baguette-sandwiches", name:"Caprese baguette sandwiches", meal:"big", time:10, serves:2,
   ing:[["baguette",160],["fresh-mozzarella",125],["tomato","2pc"],["pesto",30],["rocket",20],["balsamic-vinegar",8]],
   steps:[
    "Split the {baguette} and spread both sides with {pesto}.",
    "Layer sliced {fresh-mozzarella} and {tomato} with {rocket}, then drizzle with {balsamic-vinegar}.",
    "Close, press down and cut in half."]},
  {id:"bruschetta-tomato-basil", name:"Bruschetta with tomato and basil", meal:"bite", time:15, serves:2,
   ing:[["baguette",160],["tomato","3pc"],["garlic","1pc"],["basil",8],["olive-oil",25],["balsamic-vinegar",10],["salt",2]],
   steps:[
    "Dice {tomato} and mix with torn {basil}, {olive-oil}, {balsamic-vinegar} and {salt}. Leave 10 minutes.",
    "Slice the {baguette} and toast the slices under a hot grill for 2 minutes per side.",
    "Rub each slice with a halved {garlic} clove, then top with the tomato mixture."]},
  {id:"panzanella-bread-salad", name:"Panzanella bread salad", meal:"big", time:20, serves:2,
   ing:[["baguette",150],["tomato","4pc"],["cucumber",150],["red-onion","0.5pc"],["basil",8],["capers",10],["olive-oil",40],["balsamic-vinegar",20],["salt",2]],
   steps:[
    "Tear the {baguette} into chunks and toast in a 200 °C oven or dry pan for 8 minutes until crisp at the edges.",
    "Chop {tomato} and {cucumber}; slice {red-onion} very thinly.",
    "Toss everything with {capers}, {basil}, {olive-oil}, {balsamic-vinegar} and {salt}.",
    "Leave for 10 minutes so the bread soaks up the juices."]},
  {id:"tomato-mustard-tart", name:"Tomato and mustard tart", meal:"big", time:55, serves:3,
   ing:[["shortcrust-pastry",250],["dijon-mustard",20],["tomato","3pc"],["gruyere",80],["thyme",1],["olive-oil",10],["salt",1]],
   steps:[
    "Heat the oven to 200 °C. Roll out the {shortcrust-pastry}, line a tart tin and prick the base. Bake blind 12 minutes.",
    "Spread the base with {dijon-mustard} and cover with grated {gruyere}.",
    "Arrange sliced {tomato} on top, sprinkle with {thyme} and {salt}, and drizzle with {olive-oil}.",
    "Bake 25 minutes until the pastry is golden and the cheese bubbling."]},
  {id:"leek-goat-cheese-tart", name:"Leek and goat cheese tart", meal:"big", time:60, serves:3,
   ing:[["shortcrust-pastry",250],["leek",250],["goat-cheese",100],["eggs","2pc"],["cream",100],["thyme",1],["butter",15],["salt",1]],
   steps:[
    "Heat the oven to 200 °C. Line a tart tin with {shortcrust-pastry}, prick and bake blind for 12 minutes.",
    "Soften sliced {leek} in {butter} for 8 minutes with {salt}.",
    "Whisk {eggs} with {cream} and {thyme}. Spread the leek in the case, crumble over {goat-cheese} and pour on the custard.",
    "Bake 25 minutes at 180 °C until set and golden."]},
  {id:"sardines-on-garlic-toast", name:"Sardines on garlic toast with tomato", meal:"bite", time:10, serves:2,
   ing:[["sardines",240],["bread","4pc"],["garlic","1pc"],["tomato","2pc"],["lemon","0.5pc"],["parsley",5],["olive-oil",10]],
   steps:[
    "Toast the {bread} and rub with a halved {garlic} clove; drizzle with {olive-oil}.",
    "Top with sliced {tomato} and the {sardines}.",
    "Finish with {parsley} and a squeeze of {lemon}."]},
  {id:"creamy-mushroom-gnocchi-spinach", name:"Creamy mushroom gnocchi with spinach", meal:"big", time:25, serves:2,
   ing:[["gnocchi",400],["mushrooms",250],["cream",100],["garlic","2pc"],["thyme",1],["parmesan",25],["spinach",60],["butter",15]],
   steps:[
    "Brown sliced {mushrooms} in {butter} over high heat for 6 minutes. Add crushed {garlic} and {thyme}.",
    "Add {gnocchi} and cook, stirring, for 3 minutes until lightly golden.",
    "Pour in {cream} and simmer 2 minutes. Fold through {spinach} until wilted.",
    "Serve topped with grated {parmesan}."]}
]);

/* Additional curated recipes */
KITCHEN.add([
{
  "id": "wraps-crispy-tofu-slaw-wraps",
  "name": "Crispy tofu slaw wraps",
  "meal": "big",
  "time": 25,
  "serves": 2,
  "ing": [
    [
      "tofu",
      300
    ],
    [
      "flour-tortillas",
      "4pc"
    ],
    [
      "red-cabbage",
      150
    ],
    [
      "carrot",
      100
    ],
    [
      "mayonnaise",
      30
    ],
    [
      "soy-sauce",
      15
    ],
    [
      "cornstarch",
      15
    ],
    [
      "lime",
      "0.5pc"
    ]
  ],
  "steps": [
    "Pat {tofu} dry and cut into strips. Toss with {soy-sauce} then coat with {cornstarch}.",
    "Pan-fry in oil over medium-high heat until crisp on all sides. Thinly slice {red-cabbage} and grate {carrot}.",
    "Mix vegetables with {mayonnaise} and {lime} juice. Warm {flour-tortillas}, add slaw and tofu, then roll tightly."
  ]
},
{
  "id": "wraps-roast-beef-horseradish-baguette",
  "name": "Roast beef and horseradish baguette",
  "meal": "big",
  "time": 10,
  "serves": 2,
  "ing": [
    [
      "baguette",
      "1pc"
    ],
    [
      "left-beef",
      180
    ],
    [
      "horseradish",
      20
    ],
    [
      "mayonnaise",
      25
    ],
    [
      "rocket",
      40
    ],
    [
      "pickles",
      50
    ]
  ],
  "steps": [
    "Split {baguette} lengthwise. Mix {horseradish} with {mayonnaise}.",
    "Spread the sauce inside the baguette and layer on thin slices of cooked {left-beef}.",
    "Add {rocket} and sliced {pickles}; close, press lightly and cut into portions."
  ]
},
{
  "id": "wraps-halloumi-avocado-burgers",
  "name": "Halloumi and avocado burgers",
  "meal": "big",
  "time": 20,
  "serves": 2,
  "ing": [
    [
      "burger-buns",
      "2pc"
    ],
    [
      "halloumi",
      180
    ],
    [
      "avocado",
      "1pc"
    ],
    [
      "tomato",
      100
    ],
    [
      "lettuce",
      50
    ],
    [
      "yogurt",
      40
    ],
    [
      "lemon",
      "0.5pc"
    ]
  ],
  "steps": [
    "Slice {halloumi} and pan-sear in a dry skillet until golden on both sides.",
    "Mash {avocado} with {lemon} juice and a pinch of salt. Mix {yogurt} with black pepper.",
    "Toast {burger-buns}; spread with avocado and yogurt, then add halloumi, sliced {tomato} and {lettuce}."
  ]
}
]);


/* Additional recipes — added in a schema-compatible batch. */
KITCHEN.add([
  {
    "id": "wrap-crispy-chickpea-salad",
    "name": "Crispy chickpea salad wraps",
    "meal": "big",
    "time": 20,
    "serves": 2,
    "ing": [
      [
        "chickpeas",
        300
      ],
      [
        "tortillas",
        2
      ],
      [
        "lettuce",
        100
      ],
      [
        "tomato",
        150
      ],
      [
        "cucumber",
        120
      ],
      [
        "yogurt",
        100
      ],
      [
        "lemon",
        "0.5pc"
      ],
      [
        "paprika",
        3
      ],
      [
        "olive-oil",
        12
      ]
    ],
    "steps": [
      "Drain {chickpeas}, pat dry and toss with {olive-oil}, {paprika}, salt and pepper. Roast at 220°C for 15 minutes or pan-fry until crisp.",
      "Mix {yogurt} with lemon juice from {lemon}, salt and pepper.",
      "Chop {lettuce}, {tomato} and {cucumber}. Warm {tortillas}.",
      "Fill tortillas with salad and crispy chickpeas, drizzle with yogurt sauce and roll tightly."
    ]
  },
  {
    "id": "wrap-halloumi-roasted-pepper",
    "name": "Halloumi and roasted pepper wraps",
    "meal": "big,bite",
    "time": 18,
    "serves": 2,
    "ing": [
      [
        "tortillas",
        2
      ],
      [
        "halloumi",
        180
      ],
      [
        "red-pepper",
        180
      ],
      [
        "yogurt",
        70
      ],
      [
        "lemon",
        "0.5pc"
      ],
      [
        "mint",
        5
      ],
      [
        "olive-oil",
        10
      ],
      [
        "lettuce",
        60
      ]
    ],
    "steps": [
      "Slice {red-pepper} and cook in {olive-oil} until soft and lightly charred.",
      "Slice {halloumi} and sear in a hot dry pan for 1–2 minutes per side.",
      "Mix {yogurt} with lemon juice from {lemon} and chopped {mint}.",
      "Warm {tortillas}; fill with {lettuce}, peppers and halloumi. Add yogurt sauce and roll."
    ]
  }
]);
