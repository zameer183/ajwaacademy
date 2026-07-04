self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// No custom fetch handling yet. This file exists to satisfy
// service worker registration and prevent /sw.js 404 responses.
