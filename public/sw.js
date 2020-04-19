const STATIC_CACHE_NAME = 'static-v1';
const STATIC_DYNAMIC_NAME = 'dynamic-v1';

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...');
  event.waitUntil(caches.open(STATIC_CACHE_NAME).then(cache => {
      cache.addAll(['/', 
                    '/index.html', 
                    '/src/js/app.js', 
                    '/src/js/feed.js', 
                    '/src/js/fetch.js', 
                    '/src/js/material.min.js'
                ])
  }).catch(err => {
      console.log(err);
  }))
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....');
  event.waitUntil(caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
          if(key !== STATIC_CACHE_NAME && key !== STATIC_DYNAMIC_NAME){
              console.log('removing old cache - ', key);
              caches.delete(key);
          }
      }))
  }))
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(response => {
      if(response) {
          return response;
      }
      return fetch(event.request).then(res => {
          return caches.open(STATIC_DYNAMIC_NAME).then(cache => {
              cache.put(event.request.url, res.clone());
              return res;
          })
      });
  }))
});
