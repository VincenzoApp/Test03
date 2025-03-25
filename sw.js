const CACHE_NAME = 'juegos-para-el-rato';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/Test03/tris.html',
  '/Test03/cuadrado.html',
  '/SerpienteV2/index.html',
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

// ✅ 1. Instalación y cacheo de recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE)
          .then(() => self.skipWaiting());
      })
  );
});

// ✅ 2. Limpieza de caches antiguos
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

// ✅ 3. Estrategia Cache-First con fallback a network
self.addEventListener('fetch', (event) => {
  // Excluir confetti.js para que siempre use la versión en línea
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
          return caches.match('/index.html'); // Asegúrate de que esta ruta sea correcta
        }
      })
  );
});

// ✅ 4. Manejo de actualizaciones en segundo plano
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 🚀 5. Forzar modo standalone en iOS y Android
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Inyectar metatags para iOS si es necesario
          if (response.headers.get('content-type').includes('text/html')) {
            return response.text()
              .then((html) => {
                const modifiedHtml = html.replace(
                  '<head>',
                  `<head>
                    <meta name="apple-mobile-web-app-capable" content="yes">
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
                    <meta name="mobile-web-app-capable" content="yes">
                  `
                );
                return new Response(modifiedHtml, {
                  headers: response.headers
                });
              });
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
  }
});
