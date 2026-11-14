/* Network-first: online devices always get the newest files (no stale app after an update); offline devices fall back to the cache.
   Bump V whenever a file is added or removed. */
const V="mr-v134",F=["./","index.html","js/core/kitchen.js","data/ingredients.js","data/cookbook.bundle.js","js/craft/craft-pizza.js","js/craft/craft-ferment.js","js/craft/craft-lib.js","js/craft/craft-doughs.js","js/craft/craft-mains.js","js/craft/craft-light.js","js/craft/craft-pantry.js","js/craft/craft-sweet.js","js/craft/craft-meat.js","js/craft/craft-extras.js","js/craft/craft-ui.js","js/craft/craft-brine.js","js/core/xlink.js","js/core/dinner.js","js/core/engine.js","js/ui/core.js","js/ui/tabs-and-search.js","js/ui/controls.js","js/ui/roulette.js","js/ui/display.js","js/ui/plan.js","js/ui/pizza-night.js","js/ui/cooking-mode.js","js/ui/spinner.js","js/ui/pizza-dough.js","js/ui/nudges-and-log.js","js/ui/shake.js","js/ui/results.js","js/ui/share-and-install.js","js/ui/shelf.js","js/ui/app-extras.js","fonts/bricolage-grotesque-latin-wght-normal.woff2","fonts/dm-sans-latin-wght-normal.woff2","icons/icon.svg","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","manifest.webmanifest","css/app.css"];
self.addEventListener("install",e=>e.waitUntil(caches.open(V).then(c=>Promise.all(F.map(u=>c.add(u).then(()=>0,()=>u)))).then(bad=>{const m=bad.filter(Boolean);if(m.length)console.warn("Meal Roulette: "+m.length+" file(s) could not be cached for offline use:",m)}).then(()=>self.skipWaiting()))); // one missing file must not block the install, but it is reported
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
/* Fetch: files that never change (fonts, icons) come from the cache first. Everything else is network-first so an update shows up at once,
   but if the network has not answered in 3.5 s (weak signal) the cached copy is used, and the network answer still refreshes the cache for next time. */
const SLOW=3500,STATIC=/\/(fonts|icons)\//;
self.addEventListener("fetch",e=>{
  const q=e.request,u=new URL(q.url);if(q.method!=="GET"||u.origin!==location.origin)return;
  const keep=!u.search; // retry URLs such as ?r=123 are fetched but not stored as extra copies
  const cached=()=>caches.match(q,{ignoreSearch:true}).then(r=>r||(q.mode==="navigate"?caches.match("index.html"):null));
  const net=opts=>fetch(q,opts).then(r=>{if(r&&r.ok&&keep){const c=r.clone();caches.open(V).then(x=>x.put(q,c)).catch(()=>{})}return r});
  if(STATIC.test(u.pathname)){e.respondWith(cached().then(r=>r||net()).catch(()=>Response.error()));return}
  e.respondWith(new Promise(resolve=>{
    let done=false;const fin=r=>{if(!done&&r){done=true;resolve(r)}};
    const t=setTimeout(()=>cached().then(fin),SLOW);
    net({cache:"no-cache"}).then(r=>{clearTimeout(t);fin(r)},()=>{clearTimeout(t);cached().then(r=>fin(r||Response.error()))});
  }));
});
