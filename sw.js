var CACHE = 'brackets-v1.2.1';

var ASSETS = [
  '/bracket/',
  '/bracket/index.html',
  '/bracket/app.html',
  '/bracket/manifest.json',
  '/bracket/icons/icon-72x72.png',
  '/bracket/icons/icon-96x96.png',
  '/bracket/icons/icon-128x128.png',
  '/bracket/icons/icon-144x144.png',
  '/bracket/icons/icon-152x152.png',
  '/bracket/icons/icon-192x192.png',
  '/bracket/icons/icon-384x384.png',
  '/bracket/icons/icon-512x512.png',
  '/bracket/icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap'
];

// Install: cache everything
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Cache core assets — ignore font failures (they'll just fall back)
      return cache.addAll(ASSETS.slice(0, -1)).then(function() {
        return cache.add(ASSETS[ASSETS.length - 1]).catch(function() {});
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k)  { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache valid responses for future offline use
        if (response && response.status === 200 && response.type !== 'opaque') {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() {
        // If network fails and nothing cached, return offline fallback
        return caches.match('/bracket/app.html');
      });
    })
  );
});
