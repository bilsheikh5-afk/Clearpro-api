self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("aligner-cache-v1").then((cache) => {
      return cache.addAll(["/", "/index.html", "/logo-192.png", "/logo-512.png"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
