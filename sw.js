const CACHE_NAME = 'vect-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './favicon.svg',
    './vect-logo.svg',
    './fonts/fonts.css',
    './js/main.js',
    './js/animations.js',
    './js/form.js',
    './particles.js',
    './js/privacy-consent.js'
];

// Network-first routes (API calls should never be cached stale)
const NETWORK_FIRST = ['/api/'];
// Cache-first routes (static assets, long TTL)
const CACHE_FIRST = ['.css', '.js', '.svg', '.png', '.jpg', '.webp', '.woff2'];

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
    if (event.request.method !== 'GET') return;

    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) return;

    const pathname = requestUrl.pathname;

    // Network-first: API routes always go to network
    if (NETWORK_FIRST.some(route => pathname.startsWith(route))) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(JSON.stringify({ error: 'offline' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Stale-while-revalidate: serve from cache, update in background
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => cachedResponse);

                return cachedResponse || fetchPromise;
            });
        }).catch(() => fetch(event.request))
    );
});
