importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE_NAME = "myeqapp-v9.6";
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon192.png',
  './icon512.png',
  './screenshot1.png',
  './screenshot2.png',
  './screenshot3.png',
  './screenshot4.png'
];

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('blob:') || event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});