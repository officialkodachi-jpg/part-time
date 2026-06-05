/* Kodachi Partimer — service worker */
const CACHE = 'kodachi-partimer-v1';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                    // POST (API) → biarkan network
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;     // GAS / ipify / fonts → network

  // navigasi: pakai cache shell kalau offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  // aset shell: cache-first
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
