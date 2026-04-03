Downloading gemma-4-E4B-it.litertlm from litert-community/gemma-4-E4B-it-litert-lm...
const CACHE_NAME = 'fractal-focus-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching essential assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache-first strategy for specific assets
      if (event.request.url.includes('/') || event.request.url.includes('index.html') || event.request.url.includes('manifest.json')) {
        return response || fetch(event.request);
      }
      // Network-first for everything else (or fallback to cache)
      return fetch(event.request).catch(() => {
        return caches.match(event.request);
      });
    })
  );
});
