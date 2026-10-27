// node tools/shelf-test.js — opens the app in a real browser at many widths and checks the cookbook shelf.
// Needs Playwright once:  npm i -D playwright && npx playwright install chromium
// Catches: a frozen page (the (h>>10)%4 bug), clipped books, rows without a closed right side, missing books, script errors.
const http=require('http'),fs=require('fs'),path=require('path');
let chromium;try{({chromium}=require('playwright'))}catch(e){console.error('Playwright is not installed: npm i -D playwright && npx playwright install chromium');process.exit(3)}
const root=path.join(__dirname,'..'),T={'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const WIDTHS=[320,360,414,480,640,768,900,1024,1280,1440,1920];
(async()=>{await new Promise(r=>srv.listen(0,r));const url='http://localhost:'+srv.address().port+'/index.html';
 const b=await chromium.launch(),bad=[];let books=0;
 for(const theme of ['light','dark']){
  const p=await b.newPage({viewport:{width:WIDTHS[0],height:900},colorScheme:theme});
  p.on('pageerror',e=>bad.push(theme+': script error: '+e.message.slice(0,200)));
  const t0=Date.now();
  try{await p.goto(url,{timeout:20000,waitUntil:'load'});await p.waitForFunction(()=>window.KITCHEN&&KITCHEN.recipes.length&&!document.querySelector('.splash'),null,{timeout:20000})}
  catch(e){bad.push(theme+': page did not finish loading (frozen?)');await p.close();continue}
  await p.evaluate(()=>setTab('kit'));
  for(const w of WIDTHS){
   await p.setViewportSize({width:w,height:900});
   try{await p.waitForFunction(()=>document.querySelector('.shelf .bk'),null,{timeout:8000});await p.waitForTimeout(250)}catch(e){bad.push(`${theme} ${w}px: shelf not drawn`);continue}
   const r=await p.evaluate(()=>{const o=[],sh=document.querySelector('.shelf').getBoundingClientRect(),inner=sh.right-3;
    const want=new Set(KITCHEN.recipes.map(x=>x.cuisine||'Everyday')).size,bk=[...document.querySelectorAll('.shelf .bk')];
    const names=new Set(bk.map(x=>x.dataset.b));
    document.querySelectorAll('.shrow').forEach((row,i)=>{
     const secs=[...row.children].filter(x=>x.classList.contains('sec')),last=secs[secs.length-1];
     if(!secs.length)return o.push(`row ${i}: no compartments`);
     if(Math.abs(last.getBoundingClientRect().right-inner)>3)o.push(`row ${i}: last compartment ends ${Math.round(inner-last.getBoundingClientRect().right)}px short of the right edge`);
     if(row.scrollWidth>row.clientWidth+1)o.push(`row ${i}: content wider than the row`);
     secs.forEach(s=>{const sr=s.getBoundingClientRect();[...s.querySelectorAll('.bk')].forEach(k=>{const kr=k.getBoundingClientRect();if(!k.classList.contains('lean')&&(kr.left<sr.left+10||kr.right>sr.right-10))o.push(`${k.dataset.b}: touches the compartment wall`)})})});
    const lab=[...document.querySelectorAll('.sec .wt:not(.cont)')].filter(x=>x.textContent&&x.scrollWidth>x.clientWidth+1).map(x=>x.textContent);
    if(lab.length)o.push('label cut off: '+lab.join(', '));
    if(sh.right>innerWidth+1||sh.left<-1)o.push('the shelf is wider than the screen');
    return{o,count:names.size,want}});
   books=r.count;
   r.o.forEach(m=>bad.push(`${theme} ${w}px: ${m}`));
   if(r.count!==r.want)bad.push(`${theme} ${w}px: ${r.count} cookbooks on the shelf, expected ${r.want}`);
  }
  await p.close();
 }
 await b.close();srv.close();
 if(bad.length){console.log([...new Set(bad)].slice(0,40).join('\n'));console.log(bad.length+' problem(s)');process.exit(1)}
 console.log(`shelf ok: ${books} cookbooks, ${WIDTHS.length} widths, light and dark`);
})();
