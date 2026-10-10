/* PALEO HIGHWAY — service worker: gra działa offline po pierwszym uruchomieniu.
 * Pliki gry: najpierw sieć (żeby zmiany, np. w config.js, były widoczne), w razie braku sieci — pamięć podręczna.
 * Czcionki Google: najpierw pamięć podręczna.
 * Po zmianie listy plików podbij numer wersji w CACHE.
 */
const CACHE = 'paleo-highway-v32';
const FILES = [
  './', './index.html', './config.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './js/audio.js', './js/sprites.js', './js/scenery.js', './js/bonus.js', './js/flight.js', './js/lang-en.js', './js/game.js',
  './js/stages/stage1.js', './js/stages/stage2.js', './js/stages/stage3.js', './js/stages/stage4.js',
  './js/stages/stage5.js', './js/stages/stage6.js', './js/stages/stage7.js', './js/stages/stage8.js', './js/stages/cages.js', './js/stages/extras.js',
  './js/stages/training.js', './js/stages/survival.js', './js/stages/escape.js', './js/stages/custom.js',
  './editor.html', './js/editor.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('paleo-highway-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(fetch(req)
      .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  }
});
