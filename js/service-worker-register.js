/**
 * VECT — Service Worker Registration
 * Extracted from index.html inline script
 * Registers the VECT PWA service worker
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            console.log('SW registered with scope:', registration.scope);
        }, function (err) {
            console.log('SW registration failed:', err);
        });
    });
}
