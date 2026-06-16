const CACHE_NAME = 'tictactoe-pro-v3';

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const ASSETS_TO_CACHE = [
  '/',

  // Extensionless Cloudflare Pages routes
  '/play',
  '/local-multiplayer',
  '/daily-challenge',
  '/puzzle-library',
  '/puzzle',
  '/strategy-guide',
  '/faq',
  '/about',

  // HTML routes (backward compatibility)
  '/index.html',
  '/play.html',
  '/local-multiplayer.html',
  '/daily-challenge.html',
  '/puzzle-library.html',
  '/puzzle.html',
  '/strategy-guide.html',
  '/faq.html',
  '/about.html',

  // Core files
  '/offline.html',
  '/manifest.json',

  // CSS
  '/assets/css/variables.css',
  '/assets/css/main.css',
  '/assets/css/components.css',

  // JS
  '/assets/js/main.js',
  '/assets/js/game.js',
  '/assets/js/ai.js',
  '/assets/js/audio.js',
  '/assets/js/stats.js',
  '/assets/js/puzzles-data.js',
  '/assets/js/puzzles.js',
  '/assets/js/daily.js',

  // Images
  '/assets/images/logo.svg',
  '/assets/images/logo-192.png',
  '/assets/images/logo-512.png'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('[SW] Pre-caching assets...');

        // Prevent one bad file from breaking install
        await Promise.allSettled(
          ASSETS_TO_CACHE.map((asset) => cache.add(asset))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      if (cachedResponse) {

        // Update cache in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {});

        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {

          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {

          // Offline fallback for pages
          if (
            event.request.mode === 'navigate' ||
            (
              event.request.headers.get('accept') &&
              event.request.headers.get('accept').includes('text/html')
            )
          ) {
            return caches.match('/offline.html');
          }

          return new Response('', {
            status: 503,
            statusText: 'Offline'
          });
        });
    })
  );
});