const CACHE_NAME = 'juegos-emeli-v3';
const ASSETS_TO_CACHE = [
  '//',
  '//index.html',
  '/Test03/tris.html',
  '/Test03/cuadrado.html',
  '/SerpienteV2/index.html'
  '/Test03/icon.png',
  '/Test03/icon-72x72.png',
  '/Test03/icon-96x96.png',
  '/Test03/icon-128x128.png',
  '/Test03/icon-144x144.png',
  '/Test03/icon-192x192.png',
  '/Test03/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.3.2/dist/confetti.browser.min.js',
  '/Test03/manifest.json'
];

// Instalación y cacheo de recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE)
          .then(() => self.skipWaiting());
      })
  );
});

// Limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim());
    })
  );
});

// Estrategia Cache-First con fallback a network
self.addEventListener('fetch', (event) => {
  // Excluir las peticiones a confetti.js para que siempre use la versión en línea
  if (event.request.url.includes('confetti.browser.min.js')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cachear nuevas peticiones GET
            if (event.request.method === 'GET') {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseToCache));
            }
            return fetchResponse;
          });
      })
      .catch(() => {
        // Fallback para páginas HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/Test03/index.html');
        }
      })
  );
});

// Manejo de actualizaciones en segundo plano
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
