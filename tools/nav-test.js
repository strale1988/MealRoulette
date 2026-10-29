// node tools/nav-test.js — checks the 3-tab menu, the Craft hub, every tool's Back link and the Cook search at phone and desktop widths.
// Needs Playwright once:  npm i -D playwright && npx playwright install chromium
const http=require('http'),fs=require('fs'),path=require('path');
let chromium;try{({chromium}=require('playwright'))}catch(e){console.error('Playwright is not installed: npm i -D playwright && npx playwright install chromium');process.exit(3)}
const root=path.join(__dirname,'..'),T={'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
(async()=>{await new Promise(r=>srv.listen(0,r));const url='http://localhost:'+srv.address().port+'/index.html',b=await chromium.launch(),bad=[];
 for(const w of [320,390,768,1280]){
  const p=await b.newPage({viewport:{width:w,height:800}});p.on('pageerror',e=>bad.push(w+'px: script error: '+e.message.slice(0,160)));
  try{await p.goto(url,{waitUntil:'load'});await p.waitForFunction(()=>window.KITCHEN&&KITCHEN.recipes.length&&window.__home&&__home.up(),null,{timeout:20000});await p.evaluate(()=>document.getElementById('spgo').click());await p.waitForTimeout(450)}catch(e){bad.push(w+'px: page did not finish loading');await p.close();continue}
  const r=await p.evaluate(async()=>{const o=[],vis=id=>!document.getElementById('tab-'+id).hidden,nav=[...document.querySelectorAll('#tabs button')];
   if(nav.length!==3)o.push('expected 3 menu buttons, found '+nav.length);
   nav.forEach(n=>{const b=n.getBoundingClientRect();if(b.right>innerWidth+1||b.left<-1||b.width<40)o.push('menu button "'+n.textContent.trim()+'" does not fit')});
   setTab('craft');if(!vis('craft'))o.push('Craft hub not shown');
   const cards=[...document.querySelectorAll('.cc')];if(cards.length!==KITCHEN.CRAFTS.length)o.push('Craft hub has '+cards.length+' cards, K.CRAFTS has '+KITCHEN.CRAFTS.length);
   const bad=KITCHEN.recipes.filter(r=>r.craft&&!KITCHEN.CRAFTS.some(c=>c.id===r.craft));if(bad.length)o.push('recipes with an unknown craft: '+bad.map(r=>r.id).join(', '));
   for(const c of cards){c.click();const id=c.dataset.tool;if(!vis(id))o.push(id+': tool page not shown');
    if(document.getElementById('crumb').hidden)o.push(id+': no Back to Craft link');
    if(document.querySelector('#tabs [aria-selected=true]').dataset.t!=='craft')o.push(id+': Craft not highlighted');
    const first=document.querySelector('#tab-'+id+' [data-l] .bkrec'),n=KITCHEN.recipes.filter(r=>r.craft===id&&KITCHEN.allowed(r,S.diet)).length;
    if(!c.querySelector('.soon')===false&&n&&!first)o.push(id+': has '+n+' recipes but the page lists none');
    document.getElementById('crumbb').click();if(!vis('craft'))o.push(id+': Back did not return to the hub')}
   setTab('cook');const q=document.getElementById('gq');q.value='burger';q.dispatchEvent(new Event('input'));
   if(document.getElementById('gres').hidden)o.push('Cook search shows nothing for "burger"');
   setTab('kit');if(!vis('kit'))o.push('My kitchen not shown');
   return o});
  r.forEach(m=>bad.push(w+'px: '+m));await p.close()}
 await b.close();srv.close();
 if(bad.length){console.log([...new Set(bad)].join('\n'));process.exit(1)}console.log('nav ok: 3 tabs, Craft hub, Back links and Cook search at 4 widths');
})();
