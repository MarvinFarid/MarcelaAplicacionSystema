const CACHE_NAME = 'taqueria-v1';
const APP_ASSETS = [
    './',
    './index.html',
    './taque.css',
    './taque.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(cacheName => cacheName.startsWith('taqueria-') && cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin) return;

    event.respondWith(
        caches.open(CACHE_NAME).then(cache =>
            cache.match(request).then(cachedResponse => {
                if (cachedResponse) return cachedResponse;

                return fetch(request).then(networkResponse => {
                    if (networkResponse.ok && networkResponse.type === 'basic') {
                        return cache.put(request, networkResponse.clone())
                            .then(() => networkResponse);
                    }
                    return networkResponse;
                });
            })
        )
    );
});
