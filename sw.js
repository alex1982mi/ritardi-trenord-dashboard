const CACHE='trenord-shell-v3';
const SHELL=['./','./index.html','./mio-viaggio.html','./manifest.webmanifest','./favicon-treni.svg','./favicon-viaggi.svg'];
const DATA=['/data/dashboard.json','/data/services.json','/data/personal_selections.csv'];

self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',e=>e.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin || e.request.method!=='GET')return;

  if(DATA.includes(u.pathname)){
    const canonical=new Request(u.origin+u.pathname);
    e.respondWith(
      fetch(e.request).then(r=>{
        if(r.ok){
          const copy=r.clone();
          caches.open(CACHE).then(c=>Promise.all([
            c.put(canonical,copy),
            c.put(e.request,r.clone())
          ]));
        }
        return r;
      }).catch(()=>caches.match(canonical))
    );
    return;
  }

  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});