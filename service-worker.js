// service-worker.js — bump CACHE_VERSION to force refresh on all clients
const CACHE_VERSION = 'flood-v4';

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './levels.js',
  './supabase-client.js',
  './profiles.js',
  './game.js',
  './app.js',
  './manifest.json',
];

self.addEventListener('install', event => {
  // Force this SW to become active immediately, don't wait
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  // Delete ALL old caches immediately
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // Take control of all open tabs
  );
});

self.addEventListener('fetch', event => {
  // Skip Supabase and external requests — always go to network
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  // Cache-first for our own assets
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
