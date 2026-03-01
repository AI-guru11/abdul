const CACHE_NAME = 'aa-portfolio-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/envelope.svg',
  './icons/github.svg',
  './icons/linkedin.svg',
  './src/main.js',
  './src/ticket-composer.js',
  './src/data/cases.js',
  './src/data/experience.js',
  './src/data/translations.js',
  './src/data/tracks.js',
  './src/modules/state.js',
  './src/modules/registry.js',
  './src/modules/theme.js',
  './src/modules/i18n.js',
  './src/modules/board.js',
  './src/modules/modal.js',
  './src/modules/ticket.js',
  './src/modules/interview.js',
  './src/modules/pwa.js',
  './src/modules/ui.js',
  './src/utils/dom.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
