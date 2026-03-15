const CACHE_NAME = 'leaflet-tiles-cache-v1';

// Al instalar, no guardamos recursos de inmediato porque este Service Worker es solo perezoso para el mapa
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Obligar a activar sin esperar
});

// Al activarse, limpiamos cachés viejos si los hubiera en el futuro
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Tomar control de las páginas abiertas de inmediato
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Solo interceptamos e intramos guardar los cuadros de mapas de OpenStreetMap
  if (url.origin.includes('tile.openstreetmap.org') && url.pathname.endsWith('.png')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Cache primero (offline / navegación ultrarrápida sin cuadros negros)
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no está, lo pedimos a la red normal y lo guardamos
        return fetch(event.request).then((response) => {
          // Si la respuesta no es 200 OK, no la guardamos
          if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch((err) => {
          // Si falla (sin internet y nunca visitado), no podemos hacer mucho para un PNG de mapa.
          console.error("Map tile fetch failed", err);
        });
      })
    );
  }
});
