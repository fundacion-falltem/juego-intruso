/* FALLTEM — Intruso — Service Worker
   Estrategia híbrida:
   - Precache de “núcleo” (HTML/CSS/JS/íconos)
   - Stale-While-Revalidate para GET same-origin
   - Limpieza de caches viejos
   - Soporte a skipWaiting (mensaje 'SKIP_WAITING')
*/
const CACHE_NAME = 'intruso-v1.0.0'; // ← subí versión cuando cambies assets

// Ajustá paths si el proyecto vive en una subcarpeta distinta
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './images/intruso-icon-192.png',
  './images/intruso-icon-512.png',
  // './sounds/success.mp3',
  // './sounds/wrong.mp3',
  './manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

/* Stale-While-Revalidate para GET same-origin */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Solo caché same-origin
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Intentá del cache primero
    const cached = await cache.match(req);
    const networkPromise = fetch(req).then((res) => {
      // Guardar una copia si es válido
      if (res && res.status === 200 && res.type === 'basic') {
        cache.put(req, res.clone());
      }
      return res;
    }).catch(() => {
      // Si falla la red y hay cache, devolvelo
      return cached;
    });

    // Devolvés rápido desde cache si existe; si no, esperás a la red
    return cached || networkPromise;
  })());
});

/* Permitir activar SW nuevo sin esperar */
self.addEventListener('message', (event) => {
  if (event && event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
