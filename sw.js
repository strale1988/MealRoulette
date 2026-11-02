/* Network-first: online devices always get the newest files (no stale app after an update); offline devices fall back to the cache.
   Bump V whenever a file is added or removed. */
const V="mr-v120",F=["./","index.html","kitchen.js","ingredients.js","cookbook.bundle.js","craft/craft-pizza.js","craft/craft-ferment.js","craft/craft-lib.js","craft/craft-doughs.js","craft/craft-mains.js","craft/craft-light.js","craft/craft-pantry.js","craft/craft-sweet.js","craft/craft-meat.js","craft.js","xlink.js","dinner.js","engine.js","fonts/bricolage-grotesque-latin-wght-normal.woff2","fonts/dm-sans-latin-wght-normal.woff2","icon.svg","icon-180.png","icon-192.png","icon-512.png","icon-maskable-512.png","manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(V).then(c=>Promise.all(F.map(u=>c.add(u).then(()=>0,()=>u)))).then(bad=>{const m=bad.filter(Boolean);if(m.length)console.warn("Meal Roulette: "+m.length+" file(s) could not be cached for offline use:",m)}).then(()=>self.skipWaiting()))); // one missing file must not block the install, but it is reported
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
/* Fetch: files that never change (fonts, icons) come from the cache first. Everything else is network-first so an update shows up at once,
   but if the network has not answered in 3.5 s (weak signal) the cached copy is used, and the network answer still refreshes the cache for next time. */
const SLOW=3500,STATIC=/\/fonts\/|\/icon[-.]/;
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
