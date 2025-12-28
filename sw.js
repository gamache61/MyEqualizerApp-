// --- MyEqApp Service Worker v8.5 ---
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE_NAME = "myeqapp-v8.5";
// You can create a simple offline.html to show when there is no signal
const offlineFallbackPage = "index.html"; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Message listener for SKIP_WAITING to force updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Install: Cache UI and Icons
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("MyEqApp: Caching UI and Icons...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Purge old caches (v8.4 and below)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

// Enable Navigation Preload if supported (from your uploaded script)
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Fetch logic: Handle UI vs. Blobs
self.addEventListener('fetch', (event) => {
  // 1. Skip non-GET and music blobs (handled by IndexedDB)
  if (event.request.url.startsWith('blob:') || event.request.method !== 'GET') {
    return;
  }

  // 2. Navigation handling (Offline support)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;
        if (preloadResp) return preloadResp;

        return await fetch(event.request);
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(offlineFallbackPage);
      }
    })());
  } else {
    // 3. Asset handling (Images/Manifest/CSS)
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});