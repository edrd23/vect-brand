const CACHE_NAME = 'vect-v4';
const OFFLINE_URL = './index.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.add(OFFLINE_URL))
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

function isMutableAsset(pathname) {
    return /\.(html|css|js)$/.test(pathname);
}

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) return;

    if (requestUrl.pathname.startsWith('/api/')) return;

    if (isMutableAsset(requestUrl.pathname) || requestUrl.search) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                    return caches.match(event.request);
                })
        );
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse.ok) {
                    const cloned = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
                }
                return networkResponse;
            })
            .catch(() => caches.match(event.request))
    );
});
