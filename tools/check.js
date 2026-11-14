// node tools/check.js : load the catalog + every cookbook file and report recipe problems.
// File wiring (loader, sw.js, bundle) is checked separately: python3 build.py check  and  node tools/check-links.js
const vm=require('vm'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const CORE=['js/core/kitchen.js','data/ingredients.js'];     // the rules and the ingredient catalog
const BOOK_DIRS=['data/cookbook/cuisines','data/cookbook/general'];                    // every cookbook-*.js in these folders is loaded
const EXTRA=['js/craft/craft-pizza.js'];            // pizzas are validated too
const ctx={console};ctx.window=ctx;vm.createContext(ctx);
const files=[...CORE];
for(const d of BOOK_DIRS)for(const f of fs.readdirSync(path.join(root,d)).filter(f=>/^cookbook-.*\.js$/.test(f)).sort())files.push(d+'/'+f);
files.push(...EXTRA);
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const r=ctx.KITCHEN.report();
console.log(`${r.ingredients} ingredients, ${r.recipes} recipes loaded from ${files.length-CORE.length-EXTRA.length} cookbook file(s)`);
const by={};ctx.KITCHEN.recipes.forEach(x=>x.meals.forEach(m=>by[m]=(by[m]||0)+1));console.log('per meal:',JSON.stringify(by));
// "cuisine X has no generator flavours" is one fact per cuisine, not one per recipe: show it once
const flav={},rest=[];
r.warnings.forEach(p=>{const m=/^cuisine '([^']+)' has no generator flavours/.exec(p.msg);if(m)flav[m[1]]=(flav[m[1]]||0)+1;else rest.push(p)});
const fl=Object.keys(flav).sort();
if(fl.length)console.log(`  note   ${fl.length} cuisine(s) have no Remix flavours (their recipes are never used as generator input): ${fl.join(', ')}`);
rest.forEach(p=>console.log('  warn  ',p.who+':',p.msg));
r.errors.forEach(p=>console.log('  ERROR ',p.who+':',p.msg));
if(r.errors.length){console.log(r.errors.length+' error(s): those recipes are skipped by the app');process.exit(1)}
if(rest.length){console.log(rest.length+' warning(s): please review them');process.exit(2)}
console.log('ok');
