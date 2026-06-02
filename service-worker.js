const CACHE='jpy-try-v2';
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
if(u.pathname.endsWith('.html')||u.pathname.endsWith('.js')||u.hostname.includes('api')||u.hostname.includes('jsdelivr')||u.pathname==='/'||u.pathname==='/index.html'){
e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request)));
}else{
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
}
});