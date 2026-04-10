const CACHE_NAME = 'vect-v2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './technical-deck.html',
    './deck.css',
    './favicon.svg',
    './vect-logo.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            return fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse.ok) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    return new Response('', { status: 503, statusText: 'Offline' });
                });
        })
    );
});
