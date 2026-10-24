# Recipe collection expansion

## Current collection

The app started with 103 recipes and 139 catalog ingredients. The previous expansion brought it to 256 recipes and 240 ingredients. The current app contains **587 validated recipes and 303 catalog ingredients**. This pass added 49 recipes and 35 ingredients, including broader regional mains, breads, seafood, vegetables, and pantry staples. The latest update also makes cooked leftovers an opt-in inventory, selects recipes only when their required leftovers are available, teaches the multi-day planner to use dedicated leftover recipes first, and prevents leftover ingredients from appearing on shopping lists. Live autocomplete suggestions now appear in the fridge, leftovers, and always-at-home staples inputs. Clock-marked ingredients now outrank normal recipe/cuisine preferences, and selected cooked rice/pasta/potatoes can replace explicitly compatible dry/raw recipe ingredients with approximate cooked amounts and adjusted steps. Every cookbook JavaScript file now lives under `cookbook/`; cuisine-tagged recipes are centralized into one `cookbook/cookbook-cuisine-<slug>.js` file per cuisine. General recipes that have no assigned cuisine remain in functional category files or `cookbook-everyday.js`. `index.html` loads these files and the service worker caches them for offline use.

The additions cover established dishes from Italian, Spanish, French, Balkan, Greek, German, Polish, Hungarian, Turkish, Indian, Thai, Chinese, Japanese, Korean, Vietnamese, Indonesian, Mexican, Caribbean, Peruvian, Middle Eastern, Moroccan, Persian, Ethiopian, Portuguese and other cooking traditions. Some are deliberately labelled “style” or “inspired” when a home-kitchen adaptation is not a strict canonical version.

## Data quality

Each recipe uses the app's own ingredient IDs, serving counts, metric amounts, meal labels and step placeholders. Nutrition values and times are practical estimates derived from the ingredient catalog and the authored method; they should not be treated as laboratory-verified values. The recipes are curated app-compatible versions of established dishes, not a verbatim bulk copy of a single external cookbook.

To validate recipe and ingredient references after editing:

```sh
node tools/check.js
```

The checker should report zero errors and zero warnings. Cuisine data is organized in one file per cuisine; the cuisine dropdown is sorted alphabetically. The meal-type buttons always allow selecting multiple types: Spin chooses randomly among selected types, while a plan uses all selected types. Leftovers are tracked separately from regular fridge ingredients and are never treated as something to buy. New cookbooks must be added to both the script list in `index.html` and the `cookbook/...` asset path list in `sw.js`; bump the service-worker cache version whenever those static assets change.

## Scaling to thousands

A genuine 1,000+ recipe library should come from a clearly identified source whose terms permit reuse, then be mapped to the ingredient catalog and checked in batches. Avoid padding the library with near-duplicate generated combinations or importing scraped recipes with unclear reuse rights. The validation rules intentionally skip recipes that cannot be reconciled with the app's ingredient and meal logic.
