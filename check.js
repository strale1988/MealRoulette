// node tools/check.js  — loads the catalog + every cookbook-*.js and reports problems. Exit code 1 if any recipe is broken.
const vm=require('vm'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),ctx={console};ctx.window=ctx;vm.createContext(ctx);
const files=['kitchen.js','ingredients.js',...fs.readdirSync(root).filter(f=>/^cookbook-.*\.js$/.test(f)).sort()];
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const r=ctx.KITCHEN.report();
console.log(`${r.ingredients} ingredients, ${r.recipes} recipes loaded from ${files.length-2} cookbook file(s)`);
const by={};ctx.KITCHEN.recipes.forEach(x=>x.meals.forEach(m=>by[m]=(by[m]||0)+1));console.log('per meal:',JSON.stringify(by));
r.warnings.forEach(p=>console.log('  warn  ',p.who+':',p.msg));
r.errors.forEach(p=>console.log('  ERROR ',p.who+':',p.msg));
if(r.errors.length){console.log(r.errors.length+' error(s): those recipes are skipped by the app');process.exit(1)}
console.log('ok');
