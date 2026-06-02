const CACHE='jpy-try-v4';
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./icon-192.png','./icon-512.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const u=new URL(e.request.url);
  // API ve JSON isteklerini ASLA cache'leme, direkt ağa git
  if(u.hostname.includes('jsdelivr') || u.pathname.endsWith('.json') || u.hostname.includes('api') || u.hostname.includes('currency')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }
  // HTML ve JS için Network First
  if(u.pathname.endsWith('.html') || u.pathname.endsWith('.js') || u.pathname==='/' || u.pathname==='/index.html'){
    e.respondWith(fetch(e.request).then(r=>{
      const c=r.clone();
      caches.open(CACHE).then(x=>x.put(e.request,c));
      return r;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  // Diğerleri (resimler) Cache First
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});