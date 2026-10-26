# Craft tools: adding recipes and tools

A Craft tool is a *filter plus a page*. Its recipes are ordinary recipes, so diets, household scaling, fridge matching,
the shopping list, search, saving and the cookbook shelf all work with no extra code.

## Add a recipe to a tool
1. Put it in any cookbook file (or `cookbook/cookbook-craft.js`) and call `KITCHEN.add([...])` as usual.
2. Add `craft:"burger"` to file it under a tool. Leave it out and the tool is derived from the name when that is clear-cut
   (burger, bread, pasta, dumpling, soup, pizza). The tag always wins over the name.
3. Run `node tools/check.js`. An unknown craft id is an error; every other rule (ingredient ids, `{id}` in steps, diet flags,
   duplicate names, meal sanity) is the normal recipe validation.

**Meal type for things that are not a plate** (sauces, dressings, spice blends, jams, drinks, ferments): use `meal:"extra"`
(`pantry`, `drink` and `component` mean the same). "Extra" recipes show up in Craft, search and the cookbook shelf, but Spin, Whisk
and the day planner never offer them as a meal. Use a normal meal (`big`, `morning`, `treat`...) for anything you would serve as one.

A recipe belongs to one tool. `K.report().crafts` shows how many recipes each tool has.

## Add a tool
1. `kitchen.js` → `K.CRAFTS`: `{id, name, words}`. `words` is a regex for name-derivation, or `null` for tag-only.
2. `index.html` → `UI`: icon, group, blurb, optional `kw` (search synonyms), `plan` (the "Coming to this page" list), `chip:1` (Cook shortcut).
   Skip this and the tool still shows up with defaults.
3. That is enough for a working card and a page that lists the tool's recipes.

## Give a tool its own calculator (like pizza.js and ferment.js)
1. Create `ID.js`, add it to `FILES` in `index.html` and to `F` in `sw.js`, and bump `V`.
2. Put `<div id="tab-ID" class="tab" role="tabpanel" hidden></div>` in `index.html` and let `ID.js` fill it.
3. Set `ready:1` in `UI`. The placeholder page is no longer generated; the calculator page replaces it.
