// Service worker: guarda la estructura de la app para que abra rápido y sin conexión.
// Todo se busca primero en la red; la caché es el respaldo sin conexión.

const VERSION = "lola-lab-v14";
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
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // Red primero para todo: así siempre se ve la última versión publicada.
  // Si no hay conexión, se usa la copia guardada.
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
