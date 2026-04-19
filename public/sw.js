self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through fetch handler is enough to pass the Chrome PWA criteria
  // We can add actual caching strategies (stale-while-revalidate) in the future
});
