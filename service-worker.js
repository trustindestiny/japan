const CACHE = 'jpy-try-v2';
const STATIC_ASSETS = ['./icon-192.png', './icon-512.png', './manifest.json'];

// Install: sadece statik dosyaları cache'le, index.html'yi CACHE'LEME
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // Hemen aktif ol, bekletme
});

// Activate: eski cache'leri temizle
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // Açık sekmeleri hemen devral
});

// Fetch stratejisi:
// - index.html → her zaman NETWORK (network başarısız olursa cache fallback yok, hata göster)
// - İkonlar / manifest → cache-first
// - Dış API istekleri → direkt network (SW araya girmiyor)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Dış domain isteklerine (kur API'leri) DOKUNMA
  if (url.origin !== self.location.origin) {
    return; // SW bypass, tarayıcı direkt fetch yapsın
  }

  // index.html → Network-first, cache fallback yok
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(() => {
        // Çevrimdışıysa cached versiyonu göster (varsa)
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Statik dosyalar (ikonlar, manifest) → Cache-first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
