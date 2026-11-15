# Craft tools: adding recipes and tools

A Craft tool is a *filter plus a page*. Its recipes are ordinary recipes, so diets, household scaling, fridge matching,
the shopping list, search, saving and the cookbook shelf all work with no extra code.

## Add a recipe to a tool
1. Put it in any cookbook file (or `data/cookbook/general/cookbook-craft.js`) and call `KITCHEN.add([...])` as usual.
2. Add `craft:"burger"` to file it under a tool. Leave it out and the tool is derived from the name when that is clear-cut
   (burger, bread, pasta, dumpling, soup, pizza). The tag always wins over the name.
3. Run `node tools/check.js`. An unknown craft id is an error; every other rule (ingredient ids, `{id}` in steps, diet flags,
   duplicate names, meal sanity) is the normal recipe validation.

**Meal type for things that are not a plate** (sauces, dressings, spice blends, jams, drinks, ferments): use `meal:"extra"`
(`pantry`, `drink` and `component` mean the same). "Extra" recipes show up in Craft, search and the cookbook shelf, but Spin, Whisk
and the day planner never offer them as a meal. Use a normal meal (`big`, `morning`, `treat`...) for anything you would serve as one.

A recipe belongs to one tool. `K.report().crafts` shows how many recipes each tool has.

## Add a tool
1. `js/core/kitchen.js` → `K.CRAFTS`: `{id, name, words}`. `words` is a regex for name-derivation, or `null` for tag-only.
2. `js/ui/tabs-and-search.js` → `UI`: icon, group, blurb, optional `kw` (search synonyms), `plan` (the "Coming to this page" list), `chip:1` (Cook shortcut).
   Skip this and the tool still shows up with defaults.
3. That is enough for a working card and a page that lists the tool's recipes.

## Give a tool its own calculator (like `craft-pizza.js` and `craft-ferment.js`)
1. Create `js/craft/craft-ID.js`, then run `python3 build.py sync --add`: it adds the file to `FILES` in `index.html` and to `sw.js` and bumps the cache version.
2. Put `<div id="tab-ID" class="tab" role="tabpanel" hidden></div>` in `index.html` and let `craft-ID.js` fill it.
3. Set `ready:1` in `UI`. The placeholder page is no longer generated; the calculator page replaces it.

## Where things live (one home per recipe)
A recipe, a preset or a calculator option belongs to **one** tool. Before adding something, find its home here; if it is in two places, move it.

| Tool | Owns | Does not own (go here instead) |
|---|---|---|
| Fermentation station | every vegetable pickle and ferment: brine pickles, kraut, kimchi, hot sauce, preserved lemons, honey ferments, quick pickles | salt for meat (Brine lab) |
| Brine and salt lab | plain brines, wet and dry brines for meat and fish, the brine fixer, salt-to-spoons | any vegetable salting (Fermentation station), cures with nitrite (Curing cellar) |
| The curing cellar | long cures and what is done to a cure: whole cuts, dry-cured sausages (salami, kulen, kobasica), bacon, lardo, speck, corned beef, pastrami, jerky, gravlax, smoked salmon, and **cold smoking** (the Finish and Smoke options) | fresh, cooked or smoked-and-cooked sausages (Snap and sizzle), hot-smoking uncured meat (Low and slow) |
| Snap and sizzle | everything stuffed or shaped like a sausage that is eaten fresh or cooked: Italian, bratwurst, chorizo, merguez, breakfast, potato, danish, chicken and apple, ćevapi, snack sticks, bierwurst | dry-cured sausages (Curing cellar) |
| Rub it in | dry rubs and flavoured marinades | brines (Brine lab), cooking times (Fire it up) |
| Fire it up | cooking times by thickness and doneness, with a plain marinade | flavoured rubs and marinades (Rub it in) |
| Low and slow | hot-smoking or oven-cooking big uncured cuts | cured and smoked cuts such as pastrami (Curing cellar) |
| Cultured club | yogurt, labneh, milk kefir, strained cream cheese, kajmak, cultured butter | cheeses made with rennet or acid (Say cheese), water kefir and kombucha (Bubbling jars) |
| Say cheese | mozzarella, halloumi, feta, ricotta, sir, queso fresco, paneer, cottage cheese, gouda-style | yogurt-based products (Cultured club) |
| Bubbling jars | sourdough starter, ginger bug, water kefir, kombucha, kvass, tepache, black garlic, shio koji | vegetable ferments (Fermentation station) |
| Spice rack | spice blends and pastes by the tablespoon | rubs by meat weight (Rub it in) |

The test `node tools/smoke.js` fails if a fresh sausage appears in the Curing cellar, a cheese in Cultured club or a brine in Rub it in.

## Brine and salt lab (`js/craft/craft-brine.js`)
A self-contained calculator (tab `brine`, group "Pantry and preserving"). Four modes: brine from water, meat and fish (wet or dry brine presets in `MEATS`), a brine fixer (add salt or water to reach a target strength) and a salt-to-spoons converter (`SALTS`, grams per level teaspoon). Strength is salt as a percentage of the **water** weight. Vegetables are not here: the old "Salt for veg" mode and its kraut and kimchi presets were removed because the Fermentation station already sets the salt for every vegetable. The maths is in `window.BRINE` (`wet`, `dry`, `fix`, `spoons`; `dry` is still used for dry-brined meat) and is covered by `tools/smoke.js`. State is in localStorage `mr-brine`; an older saved "dry" mode falls back to "wet".

## The curing cellar and Snap and sizzle (`js/craft/craft-meat.js`)
`cure` is for long cures. Whole cuts share one calculation (the `C` table: curing days `c`, weight loss `l`, drying time `h`, optional salt share `S` for fat); salt only or with curing salt is the **Salt** control. Cold smoking is the **Finish** control for pancetta, lonza, coppa and duck, the **Smoke** control for bacon, and built in for speck and smoked salmon: it adds a drying step for the tacky surface (pellicle), a smoking step under 25 °C and a safety note. Corned beef and pastrami use Cure #1 at 2.5 g per kg. `sausage` also holds ćevapi, snack sticks and bierwurst (functions `cevapi` and `smokedLinks`); the Shape, Cook it and Variation controls only show for the fresh links.

## Tools in `craft-world.js`
Taco table (corn and flour tortillas, tamales, salsas), Tofu and tempeh, Pie and pastry (pie crust sized to the dish, rough puff, classic puff, croissant dough with layer counts, choux), Plant milks, Candy shop and Sushi and rice rolls. They follow the same shape as `craft-light.js`, and each has two starter recipes in `data/cookbook/general/cookbook-craft-world.js`. Before adding a tool, check it does not already exist: pickles, kimchi and hot sauce are in the Fermentation station, brines in the Brine lab, tin sizes for cakes in Bake, cold brew and tea in Drinks, sorbet in Frozen, rice cooking (including sushi rice) in Grain.
