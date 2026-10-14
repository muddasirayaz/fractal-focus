'use strict';
const CACHE_PREFIX = `fractal-focus:${self.registration.scope}:`;
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const ASSETS = ['index.html', 'manifest.json', 'privacy.html'].map(
  path => new URL(path, self.registration.scope).href
);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  // Cache only the known shell, never queries, API responses or user files.
  const asset = url.href === scope.href ? ASSETS[0] : url.href;
  if (!ASSETS.includes(asset)) return;
  event.respondWith(caches.open(CACHE_NAME).then(async cache =>
    (await cache.match(asset)) || fetch(request)
  ));
});
