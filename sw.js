const CACHE_NAME = 'myeqapp-v8';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install: Cache the UI components and logic
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old versions to ensure categories and backups work
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch: Serve from cache, but ignore music blobs
self.addEventListener('fetch', (event) => {
  // We do not cache the audio blobs (which are handled by IndexedDB)
  // and we ignore non-GET requests
  if (event.request.url.startsWith('blob:') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});