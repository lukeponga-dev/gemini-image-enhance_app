const CACHE_NAME = 'gemini-image-enhancer-cache-v1';
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.svg',
    '/icon-512.svg',
    '/maskable-icon-512.svg'
];

// Install event: precache the app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .catch(error => {
                console.error('Failed to cache assets during install:', error);
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('Service Worker: Deleting old cache', name);
                        return caches.delete(name);
                    })
            );
        })
    );
});

// Fetch event: Stale-While-Revalidate strategy
self.addEventListener('fetch', event => {
    // Skip non-GET requests, chrome-extension URLs, and API requests
    if (
        event.request.method !== 'GET' ||
        event.request.url.startsWith('chrome-extension://') ||
        event.request.url.includes("generativelanguage.googleapis.com")
    ) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                // Fetch from network in the background to update the cache
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // Check for valid response to cache
                    // Opaque responses (from cross-origin requests like CDNs) have status 0
                    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(error => {
                    console.error('Service Worker: Fetch failed:', error);
                    // This could be a place to return a fallback page if needed
                });

                // Return cached response immediately if available, otherwise wait for fetch
                return response || fetchPromise;
            });
        })
    );
});