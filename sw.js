const CACHE_NAME = "our-little-world-static-v20";
const STATIC_ASSETS = [
  "./css/her.css",
  "./js/her.js",
  "./css/her-inbox.css?v=5",
  "./js/her-inbox.js?v=6",
  "./css/dashboard.css?v=5",
  "./js/dashboard.js?v=7",
  "./Images/love-app-icon.svg",
  "./manifest.webmanifest"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.includes("/functions/") || url.pathname.includes("/rest/") || url.pathname.includes("/auth/")) return;
  const isStatic = /\.(css|js|svg|png|jpe?g|webp|woff2?)$/i.test(url.pathname);
  if (!isStatic) return;
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)); }
    return response;
  })));
});
self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data ? event.data.text() : "" }; }
  const title = payload.title || "A little message ♡";
  const options = {
    body: payload.body || "You have a new message. Open Our Little World to read it.",
    icon: "./Images/love-app-icon.svg",
    badge: "./Images/love-app-icon.svg",
    tag: payload.tag || "our-little-world-message",
    data: { url: payload.url || "./her.html" },
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const target = new URL(event.notification.data && event.notification.data.url ? event.notification.data.url : "./her.html", self.location.href);
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin)) {
        await client.navigate(target.href);
        return client.focus();
      }
    }
    return self.clients.openWindow(target.href);
  })());
});
