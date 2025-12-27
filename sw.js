const CACHE_NAME = 'myeqapp-v8';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
});

self.addEventListener('fetch', e => {
  if (e.request.url.startsWith('blob:')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});