// App-shell cache for the web build: the UI opens offline, API calls always go to the network
// (the app keeps its own copy of API answers, see api.ts).
const CACHE = "worktime-v2";

// Install caches index.html and every script, stylesheet and icon it references, so even
// the very first visit can be reopened offline. Hashed asset names change with each deploy.
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const res = await fetch("./index.html", { cache: "no-store" });
    const html = await res.clone().text();
    await cache.put("./index.html", res.clone());
    await cache.put("./", res);
    const refs = [...html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g)].map((m) => "./" + m[1]);
    await cache.addAll([...new Set([...refs, "./manifest.webmanifest", "./icon-192.png"])]);
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  // Network first so a deploy shows up at once; fall back to the cache offline.
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreVary: true }).then((r) => r || (e.request.mode === "navigate" ? caches.match("./index.html") : Response.error()))),
  );
});
