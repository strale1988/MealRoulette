// node check.js — load the catalog + every cookbook/cookbook-*.js and report problems.
const vm=require('vm'),fs=require('fs'),path=require('path');
const root=__dirname,ctx={console};ctx.window=ctx;vm.createContext(ctx);
const bookDir=path.join(root,'cookbook');
const files=['kitchen.js','ingredients.js',...fs.readdirSync(bookDir).filter(f=>/^cookbook-.*\.js$/.test(f)).sort().map(f=>path.join('cookbook',f))];
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const r=ctx.KITCHEN.report();
console.log(`${r.ingredients} ingredients, ${r.recipes} recipes loaded from ${files.length-2} cookbook file(s)`);
const by={};ctx.KITCHEN.recipes.forEach(x=>x.meals.forEach(m=>by[m]=(by[m]||0)+1));console.log('per meal:',JSON.stringify(by));
r.warnings.forEach(p=>console.log('  warn  ',p.who+':',p.msg));
r.errors.forEach(p=>console.log('  ERROR ',p.who+':',p.msg));
if(r.errors.length){console.log(r.errors.length+' error(s): those recipes are skipped by the app');process.exit(1)}
if(r.warnings.length){console.log(r.warnings.length+' warning(s): please review them');process.exit(2)}
console.log('ok');
