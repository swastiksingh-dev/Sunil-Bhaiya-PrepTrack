/** PrepTrack — service worker.
 * Caches the app shell (pages, chunks, icon, manifest). NEVER caches PDFs:
 * volumes are large and served straight from network to protect device storage. */
const CACHE = "sb-tracker-v2";
// Subdirectory hosting (GitHub Pages): derive the base from our own URL so
// cached shell paths stay inside the deployed scope.
const BASE = self.location.pathname.replace(/\/sw\.js$/, "");
const SHELL = [`${BASE}/`, `${BASE}/app/dashboard`, `${BASE}/icon.svg`, `${BASE}/manifest.webmanifest`];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // PDFs: network only, never stored.
  if (url.pathname.endsWith(".pdf") || url.pathname.startsWith("/pdfs/")) return;

  // Same-origin static assets: cache-first.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Navigations + everything else same-origin: network-first, cache fallback.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && (request.mode === "navigate" || url.pathname.endsWith("/icon.svg"))) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit ?? caches.match("/"))),
    );
  }
});
