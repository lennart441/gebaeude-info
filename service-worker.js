const CACHE_NAME = 'gebaeude-info-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/daten2.csv',
  // ...weitere statische Dateien...
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell and static assets');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate event');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => {
        console.log('[ServiceWorker] Deleting old cache:', key);
        return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  console.log('[ServiceWorker] Fetch:', event.request.url);
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[ServiceWorker] Serving from cache:', event.request.url);
      }
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              console.log('[ServiceWorker] Updating cache:', event.request.url);
              cache.put(event.request, responseClone);
            });
          }
          console.log('[ServiceWorker] Serving from network:', event.request.url);
          return networkResponse;
        })
        .catch(() => {
          console.warn('[ServiceWorker] Network failed, offline fallback for:', event.request.url);
          if (cachedResponse) return cachedResponse;
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          return new Response('Offline. Datei nicht verfügbar.', { status: 503, statusText: 'Offline' });
        });
      return cachedResponse || fetchPromise;
    })
  );
});
