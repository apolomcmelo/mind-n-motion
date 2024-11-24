const version = `v1`
const CACHE_NAME = `mind-n-motion-cache-${version}`;
const ASSETS_TO_CACHE = [
    './index.html',
    './styles.css',
    './scripts.js',
    './images/mind-n-motion_logo-96x96.png',
    './images/mind-n-motion_logo-192x192.png',
    './images/mind-n-motion_logo-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            )
        )
    );
});
