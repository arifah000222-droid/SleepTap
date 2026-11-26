
const CACHE = "sleeptap-v3-cache";

const FILES = [
  "./",
  "./index.html",
  "./v3-prototype.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("sleeptap-v3-") && key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached ||
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache =>
          cache.put(event.request, copy)
        );
        return response;
      }).catch(() =>
        caches.match(
          event.request.mode === "navigate" &&
          new URL(event.request.url).pathname.endsWith("/v3-prototype.html")
            ? "./v3-prototype.html"
            : "./index.html"
        )
      )
    )
  );
});
