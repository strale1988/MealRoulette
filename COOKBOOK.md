# Meal Roulette cookbook

The curated world-cookbook expansion is documented in `RECIPE-EXPANSION.md`. The current collection contains about 2,945 validated recipes across about 1,630 catalog ingredients (run `node tools/check.js` for the live count).

Three layers, each with one job:

| File | Job |
|---|---|
| `ingredients.js` | The catalog. One row per ingredient: name, aisle, nutrition, diet flags, aliases, pantry/canned/dried. |
| `cookbook/cookbook-cuisine-*.js` | Cuisine-tagged recipes, with one file per cuisine (for example, `cookbook/cookbook-cuisine-italian.js`). |
| `cookbook/cookbook-light.js`, `cookbook/cookbook-leftovers.js`, `cookbook/cookbook-bake.js`, `cookbook/cookbook-fancy.js` | General recipes grouped by app purpose when no cuisine is assigned. |
| `cookbook/cookbook-everyday.js` | Other general recipes without an assigned cuisine. |
| `kitchen.js` | The rules: diets, fridge matching, substitutions, grams, step text, validation. |

Everything else (shopping aisles, nutrition, diets, "only what I have", remix) is **derived** from the catalog, so adding an ingredient once improves every recipe. The main meal-type buttons are multi-select; Spin chooses from selected types and meal plans use all selected types. Cooked leftovers are opt-in inventory, selected separately from ordinary fridge items, and are never listed as groceries.

## Add a recipe

```js
{id:"shakshuka", name:"Shakshuka", meal:"morning,big", cuisine:"Middle Eastern", time:30, serves:2,
 ing:[["eggs","4pc"], ["canned-tomatoes",400], ["onion","1pc"], ["olive-oil",20], ["salt",2]],
 steps:["Dice {onion}.", "Heat {olive-oil} and cook the onion 8 minutes.", "Add {canned-tomatoes} and {salt}; simmer 10 minutes.", "Crack in {eggs} and cook 6 minutes."]}
```

- `meal`: `morning` · `bite` · `big` · `treat` (combine with commas). Aliases accepted by `K.MEAL` in `kitchen.js`: `light`/`side` → bite, `quick`/`fancy` → big, `sweet`/`bake` → treat.
- Amounts are **grams** for `serves` people. Pieces are strings: `"2pc"`, `"0.5pc"`. No ml, ever.
- Mention ingredients in steps as `{id}`. The app prints the catalog name, so the list and the method can never disagree. `{id#}` prints amount and name ("240 g canned chickpeas").
- Put cuisine-tagged recipes in `cookbook/cookbook-cuisine-<slug>.js`. For a new cuisine, create its own file. Add every new cookbook file to the `FILES` list in the loader near the end of `index.html` and to `sw.js`, then bump the service-worker cache version (`node tools/check.js` fails if either list is out of sync).


## Cooked-leftover substitutions

A recipe can opt in to one or more substitutions by adding `leftoverSwaps:["rice"]`, `leftoverSwaps:["pasta"]`, or `leftoverSwaps:["potatoes"]`. The dry/raw ingredient must also exist in the recipe's `ing` list. When the matching cooked leftover is selected in the app, its catalog ID replaces the raw ingredient, the amount is adjusted using an approximate yield factor (rice ×3, pasta ×2.3, potatoes ×1), and compatible dry-cooking steps are replaced with cooked-leftover instructions. Use this only when the dish works with already-cooked ingredients; don't use it for dishes where the grain or potato must cook as part of the dish. Cooked-leftover quantities are approximations, not exact conversions.

Clock-marked fridge ingredients are a strong ranking preference in Spin, generated meals, and day planning. Leftovers are opt-in and are only consumed in planning when selected and actually used.

## Add an ingredient

One row in `ingredients.js`:

```
[id, display name, aisle, role, kcal/100g, protein/100g, flags, aliases, grams per piece, generator slots]
```

- **flags**: `meat fish shell dairy egg gluten nuts soy pork alcohol honey` drive the diet filters automatically. `pantry` = assumed at home when "Assume basic pantry" is on. `canned` = ready to eat, no soaking. `dried:15` = needs 15+ minutes. `sub:pasta` = interchangeable with others in that group when "Only what I have" is on.
- **aliases**: what people type in the fridge, kitchen-staples or leftovers box. Live suggestions appear while typing. Plurals are handled; the longest match wins ("canned tomatoes" is not "tomato").
- **generator slots** (`p:chicken`, `c:rice`, `v:carrot`) let Remix borrow this ingredient from a recipe.

## Rules the checker enforces

Run `node tools/check.js` after any change. Broken recipes are skipped by the app, and the checker says why:

- unknown ingredient, duplicate id, missing steps, bad amounts
- a step uses `{id}` that is not in the ingredient list; an ingredient no step mentions
- a canned ingredient written as plain text in a step (it must say "canned chickpeas"), or "soak" next to a canned item
- a dried ingredient simmered for less than its minimum time
- a treat containing meat or fish; a big plate that is really a dessert
- named vegan or vegetarian but the flags say otherwise

## Move old recipes over

```
node tools/convert-old.js recipes.js recipes-extra.js > cookbook/cookbook-old.js
node tools/check.js
```

The converter matches names to the catalog, turns ml into grams, names canned legumes canned, re-tags sweet recipes as treats, and drops ready-made dishes (burgers, nuggets, hot dogs...). It lists every ingredient it could not match; add those to `ingredients.js` and run the checker again.

## The shelf (My kitchen)

Every cuisine becomes a cookbook on the shelf, grouped into wooden continent compartments. A cuisine gets its place from the `SHELVES` list in `index.html`; a cuisine missing from it lands on "More books", so add new cuisines there. Each continent has one colour family and one top pattern (`SC` and `PATN` in `index.html`), and a book's thickness grows with its recipe count.

After changing the shelf code, run `node tools/shelf-test.js`. It opens the app in a real browser at 11 widths, in light and dark mode, and fails on a frozen page, clipped books, a row without a closed right side, a cut-off label or a missing cookbook. It needs Playwright once: `npm i -D playwright && npx playwright install chromium`.

## Pizza night (`pizza.js`)

Pizza is generated from data, not stored as 57 separate step lists:

- **Dough styles** (`mk("id",{...})`): the formula only (baker's percentages `flours`, `hyd`, `salt`, `oil`, `sugar`, `extra`), a ball or pan weight, oven temperature and the shaping and baking text. Add a new style with one `mk(...)` block and it appears in the Dough lab.
- **Fermentation modes** (`MODES`): quick 3 h, same day 8 h, overnight 16 h, cold 24/48/72 h, each with its own instant-yeast percentage, plus an optional poolish (30% of the flour) or biga (all the flour with water at half its weight, rest of the water at the final mix). Yeast is fresh by default (3× the instant-dried weight) with a switch to dried. Any style can use any mode (`modes:[...]` restricts it), and all weights are computed from the percentages (`doughPlan`).
- **Sauces** (`SAUCES`) and a **topping table** (`P(id, when, grams, prep)`). `when` is `cheese`, `on` (before baking), `late` (last minutes), or `after` (when it comes out). Cooked leftovers (`left-*`) are only warmed.
- **Classics** (`R(...)`): id, name, origin, category, dough style, sauce, toppings. `lock:1` keeps the dough style fixed; `fmt` makes calzone, stromboli or fried calzone.
- **Remix** (`PZ.remix`) builds a new pizza from a theme, your fridge, urgent items and leftovers; **`PZ.dough`** gives just the dough.

`node tools/check.js` validates every pizza (unknown ingredient, sauce, dough style, category). After adding files, keep `FILES` in index.html and the list in sw.js in sync; bump the version in sw.js.
