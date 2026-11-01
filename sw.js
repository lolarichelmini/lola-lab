// Service worker: guarda la estructura de la app para que abra rápido y sin conexión.
// El contenido (episodios) se busca siempre primero en la red.

const VERSION = "lola-lab-v6";
const SHELL = [
  "./",
  "index.html",
  "app.js",
  "manifest.webmanifest",
  "styles/tokens.css",
  "styles/base.css",
  "modules/registry.js",
  "modules/icons.js",
  "modules/home/home.js",
  "modules/podcast/podcast.js",
  "modules/tendencias/tendencias.js",
  "modules/hoy/hoy.js",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // Contenido: red primero, caché como respaldo.
  if (url.pathname.includes("/content/")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Estructura: caché primero.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (url.origin === location.origin) {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
