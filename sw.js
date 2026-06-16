const CACHE_NAME = 'tictactoe-pro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/play.html',
  '/local-multiplayer.html',
  '/daily-challenge.html',
  '/puzzle-library.html',
  '/puzzle.html',
  '/strategy-guide.html',
  '/faq.html',
  '/about.html',
  '/offline.html',
  '/manifest.json',
  '/assets/css/variables.css',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/js/main.js',
  '/assets/js/game.js',
  '/assets/js/ai.js',
  '/assets/js/audio.js',
  '/assets/js/stats.js',
  '/assets/js/puzzles-data.js',
  '/assets/js/puzzles.js',
  '/assets/js/daily.js',
  '/assets/images/logo.svg',
  '/assets/images/logo-192.png',
  '/assets/images/logo-512.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Avoid intercepting browser extension files, chrome-extension://, etc.
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in the background (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {/* Ignore network errors during background updates */});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Cache new successful GET responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails and request is for an HTML page, show offline fallback
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        });
    })
  );
});
