// Meal Roulette data. Edit freely. All amounts are metric: g, ml, or pcs (countable items).
// Recipe format: [title, [meals], minutes, servings, [[amount, unit, name], ...], "step|step|step"]
window.MEAL_DATA = {
recipes: [
["Shakshuka",["Breakfast","Lunch","Dinner"],30,2,[[30,"ml","olive oil"],[150,"g","onion"],[1,"pcs","red pepper"],[2,"pcs","garlic clove"],[5,"g","ground cumin"],[5,"g","paprika"],[400,"g","canned tomatoes"],[4,"pcs","eggs"],[2,"g","salt"]],"Heat the oil in a wide pan over medium heat. Fry the chopped onion and pepper for 8 minutes.|Add garlic, cumin and paprika and cook for 1 minute.|Pour in the tomatoes and salt, then simmer 10 minutes until thick.|Make 4 wells, crack in the eggs, cover and cook on low for 6–8 minutes until the whites are set."],
["Banana oat pancakes",["Breakfast"],15,2,[[2,"pcs","banana"],[80,"g","oats"],[2,"pcs","eggs"],[5,"g","baking powder"],[10,"g","butter"]],"Blend the bananas, oats, eggs and baking powder into a smooth batter.|Melt a little butter in a non-stick pan over medium heat.|Pour small rounds of batter and cook 2–3 minutes per side until golden."],
["Overnight oats",["Breakfast","Snack"],5,1,[[50,"g","oats"],[150,"ml","milk"],[100,"g","yogurt"],[15,"g","honey"],[80,"g","berries"]],"Stir oats, milk, yogurt and honey together in a jar.|Refrigerate for at least 8 hours.|Top with berries and eat cold."],
["Spinach and feta omelette",["Breakfast","Lunch"],15,1,[[3,"pcs","eggs"],[60,"g","spinach"],[40,"g","feta"],[10,"g","butter"],[1,"g","black pepper"]],"Beat the eggs with the pepper.|Melt the butter in a pan over medium heat and wilt the spinach for 1 minute.|Pour in the eggs, cook 2 minutes, add crumbled feta, fold and cook 1 more minute."],
["Hummus veggie wrap",["Lunch","Snack"],10,2,[[2,"pcs","tortilla"],[120,"g","hummus"],[100,"g","cucumber"],[100,"g","carrot"],[60,"g","lettuce"]],"Spread the hummus over the tortillas.|Add thinly sliced cucumber, grated carrot and lettuce.|Roll tightly and cut in half."],
["Greek yogurt with honey and walnuts",["Snack","Breakfast"],5,1,[[200,"g","yogurt"],[15,"g","honey"],[30,"g","walnuts"]],"Spoon the yogurt into a bowl.|Drizzle with honey and top with roughly chopped walnuts."],
["Tomato bruschetta",["Snack","Lunch"],10,2,[[120,"g","bread"],[300,"g","tomatoes"],[1,"pcs","garlic clove"],[15,"ml","olive oil"],[5,"g","basil"],[1,"g","salt"]],"Dice the tomatoes and mix with oil, basil and salt.|Toast the bread until golden and rub with the cut garlic clove.|Spoon the tomatoes on top and serve at once."],
["Chicken fried rice",["Lunch","Dinner"],25,2,[[400,"g","cooked rice (day-old)"],[250,"g","chicken breast"],[2,"pcs","eggs"],[150,"g","frozen peas and carrots"],[3,"pcs","spring onions"],[30,"ml","soy sauce"],[20,"ml","oil"]],"Dice the chicken and fry in half the oil over high heat for 6 minutes until cooked through (75 °C inside). Set aside.|Scramble the eggs in the same pan, 1–2 minutes.|Add the remaining oil, vegetables and rice, fry 4 minutes breaking up clumps.|Return the chicken, add soy sauce and spring onions, toss 1 minute."],
["Spaghetti aglio e olio",["Dinner","Lunch"],20,2,[[200,"g","spaghetti"],[4,"pcs","garlic clove"],[60,"ml","olive oil"],[2,"g","chilli flakes"],[10,"g","parsley"],[20,"g","salt (for the water)"]],"Boil the spaghetti in 2 litres of water with the salt for 9–11 minutes. Keep 100 ml pasta water.|Gently fry sliced garlic and chilli in the oil over low heat for 2–3 minutes until just golden.|Add the pasta and 50 ml of the pasta water, toss 1 minute.|Finish with chopped parsley."],
["Tomato lentil soup",["Lunch","Dinner"],35,4,[[200,"g","red lentils"],[150,"g","onion"],[2,"pcs","garlic clove"],[100,"g","carrot"],[400,"g","canned tomatoes"],[1000,"ml","vegetable stock"],[5,"g","ground cumin"],[20,"ml","oil"]],"Fry the chopped onion and carrot in the oil for 6 minutes. Add garlic and cumin for 1 minute.|Add rinsed lentils, tomatoes and stock. Simmer 20 minutes until the lentils are soft.|Blend partly or fully and season with salt."],
["Lemon garlic chicken with potatoes",["Dinner"],45,2,[[400,"g","chicken thighs"],[600,"g","potatoes"],[1,"pcs","lemon"],[3,"pcs","garlic clove"],[30,"ml","olive oil"],[5,"g","dried oregano"],[3,"g","salt"]],"Heat the oven to 200 °C.|Cut the potatoes into 3 cm chunks and toss with half the oil, salt and oregano on a tray.|Add chicken, garlic, lemon juice and remaining oil. Roast 35–40 minutes until the chicken reaches 75 °C inside."],
["Beef chilli",["Dinner"],50,4,[[500,"g","minced beef"],[150,"g","onion"],[2,"pcs","garlic clove"],[1,"pcs","pepper"],[400,"g","canned tomatoes"],[240,"g","kidney beans (drained)"],[10,"g","chilli powder"],[5,"g","ground cumin"],[5,"g","paprika"],[20,"ml","oil"],[3,"g","salt"]],"Fry the onion and pepper in the oil for 6 minutes. Add garlic and spices for 1 minute.|Add the mince and brown for 8 minutes.|Add tomatoes, beans and salt, then simmer 30 minutes, stirring now and then."],
["Salmon with rice and broccoli",["Dinner"],25,2,[[300,"g","salmon fillets"],[150,"g","rice"],[300,"g","broccoli"],[20,"ml","soy sauce"],[15,"ml","oil"],[1,"pcs","lemon"]],"Cook the rice: 225 ml water per 150 g rice, covered on low for 12 minutes, then rest 10.|Steam or boil the broccoli florets 4 minutes.|Fry the salmon in oil, skin side down, 4 minutes, turn and cook 3 more until it flakes (63 °C).|Brush with soy sauce, squeeze over lemon and serve."],
["Chickpea coconut curry",["Dinner","Lunch"],30,3,[[480,"g","chickpeas (drained)"],[400,"ml","coconut milk"],[150,"g","onion"],[3,"pcs","garlic clove"],[15,"g","curry powder"],[200,"g","canned tomatoes"],[100,"g","spinach"],[20,"ml","oil"]],"Fry the onion in the oil for 6 minutes. Add garlic and curry powder for 1 minute.|Add tomatoes, coconut milk and chickpeas and simmer 15 minutes.|Stir in the spinach until wilted and season with salt."],
["Mushroom risotto",["Dinner"],45,2,[[150,"g","arborio rice"],[250,"g","mushrooms"],[100,"g","onion"],[1,"pcs","garlic clove"],[700,"ml","hot vegetable stock"],[30,"g","parmesan"],[20,"g","butter"],[15,"ml","oil"]],"Fry sliced mushrooms in the oil over high heat for 5 minutes. Set aside.|Soften the onion and garlic in the butter for 5 minutes. Add the rice and stir 1 minute.|Add stock a ladle at a time, stirring, for about 18 minutes until creamy.|Stir in the mushrooms and parmesan."],
["Greek salad",["Lunch","Snack"],10,2,[[300,"g","tomatoes"],[200,"g","cucumber"],[100,"g","red onion"],[100,"g","feta"],[50,"g","olives"],[30,"ml","olive oil"],[2,"g","dried oregano"]],"Cut the tomatoes and cucumber into chunks and slice the onion.|Combine with olives, top with feta, then add oil and oregano."],
["Cinnamon baked apples",["Dessert"],35,2,[[300,"g","apples"],[5,"g","cinnamon"],[20,"g","honey"],[30,"g","oats"],[15,"g","butter"]],"Heat the oven to 180 °C.|Core and slice the apples into a dish and toss with cinnamon and honey.|Rub oats with butter, scatter on top, and bake 25 minutes."],
["Banana ice cream",["Dessert"],5,2,[[300,"g","frozen banana"],[30,"ml","milk"],[20,"g","peanut butter"]],"Blend the frozen banana chunks with milk until smooth, 2–3 minutes, scraping down the sides.|Blend in the peanut butter and serve immediately."],
["Rice pudding",["Dessert"],40,3,[[100,"g","pudding rice"],[750,"ml","milk"],[40,"g","sugar"],[3,"g","cinnamon"],[5,"ml","vanilla extract"]],"Combine rice, milk and sugar in a pot and bring to a gentle simmer.|Cook 30–35 minutes on low, stirring often, until thick and creamy.|Stir in vanilla and dust with cinnamon."]
],

// COOKING RULES used by "Build a meal from my fridge".
// re = regex matched against what you typed; g = grams per person; pcs = pieces per person.
rules: {
  protein: {
    chicken: {re:"chicken|turkey", name:"chicken breast", g:150, cook:"Slice the chicken into strips, season with salt and pan-fry in oil over medium-high heat for 6–7 minutes, turning, until no pink remains (75 °C inside)."},
    beef:    {re:"beef|mince",     name:"minced beef",    g:120, cook:"Brown the mince in a hot pan for 7–8 minutes, breaking it up, until no pink remains (71 °C)."},
    salmon:  {re:"salmon|fish|cod|tuna", name:"salmon fillet", g:150, cook:"Fry in oil, skin side down, over medium heat for 4 minutes, turn and cook 3 more minutes until it flakes (63 °C)."},
    egg:     {re:"egg",            name:"eggs",           pcs:2,  cook:"Beat the eggs with a pinch of salt and scramble over low heat for 2–3 minutes, stirring."},
    tofu:    {re:"tofu",           name:"firm tofu",      g:150, cook:"Press and cube the tofu, then fry in oil over medium-high heat for 8 minutes until golden."},
    chickpea:{re:"chickpea|bean|lentil", name:"canned chickpeas (drained)", g:120, cook:"Drain and rinse, then fry in oil for 5 minutes until lightly crisp."},
    sausage: {re:"sausage|ham|bacon", name:"sausage",     g:120, cook:"Slice and fry for 8 minutes until browned and cooked through (72 °C)."}
  },
  carb: {
    rice:    {re:"rice",     name:"rice (dry)",  g:75,  water:1.5, cook:"Rinse the rice, then simmer with {w} ml water and a pinch of salt, covered, on low for 12 minutes. Rest 10 minutes."},
    pasta:   {re:"pasta|spaghetti|penne|noodle", name:"pasta (dry)", g:100, cook:"Boil in water with 10 g salt per litre (1 litre per 100 g pasta) for 9–11 minutes."},
    potato:  {re:"potato",   name:"potatoes",    g:250, cook:"Cut into 3 cm chunks and boil in salted water for 15–20 minutes until a knife slides in easily."},
    couscous:{re:"couscous|bulgur", name:"couscous (dry)", g:70, water:1, cook:"Pour {w} ml boiling water over the couscous, cover 5 minutes, then fluff with a fork."}
  },
  veg: {
    default:  {name:"vegetables", g:150, cook:"Slice and sauté in oil over medium-high heat for 5–8 minutes until tender-crisp."},
    spinach:  {re:"spinach|kale|chard", g:100, cook:"Wilt in a hot pan for 1–2 minutes."},
    tomato:   {re:"tomato",   g:150, cook:"Chop and cook in the pan for 4 minutes until softened."},
    broccoli: {re:"broccoli|cauliflower", g:150, cook:"Boil or steam the florets for 4 minutes."},
    pepper:   {re:"pepper",   g:150, cook:"Slice and sauté for 6 minutes."},
    zucchini: {re:"zucchini|courgette", g:150, cook:"Slice and fry for 5 minutes until golden."},
    carrot:   {re:"carrot",   g:150, cook:"Slice thinly and sauté for 8 minutes, or roast at 200 °C for 25 minutes."},
    mushroom: {re:"mushroom", g:150, cook:"Slice and fry over high heat for 5 minutes until browned."},
    onion:    {re:"onion",    g:100, cook:"Slice and fry for 6 minutes until soft."},
    cabbage:  {re:"cabbage",  g:150, cook:"Shred and fry for 6 minutes."},
    peas:     {re:"peas|corn", g:100, cook:"Boil for 3 minutes."}
  },
  fruit: {re:"banana|apple|pear|berr|peach|plum|mango|orange"},
  staples: [["oil",15,"ml","oil"],["salt",2,"g","salt"],["black pepper",1,"g","black pepper"],["garlic clove",1,"pcs","garlic clove"]]
}
};
