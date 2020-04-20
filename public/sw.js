const STATIC_CACHE_NAME = 'static-v5';
const DYNAMIC_CACHE_NAME = 'dynamic-v5';
const STATIC_ASSETS = [
                    '/', 
                    '/index.html', 
                    '/offline.html',
                    '/src/js/app.js', 
                    '/src/js/feed.js', 
                    '/src/js/fetch.js', 
                    '/src/js/material.min.js',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ]

const staticOnly = (arr, req) => {
    arr.forEach(asset => {
        if(req.indexOf(asset) > -1){
            return true;
        }
    })
}

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...');
  event.waitUntil(caches.open(STATIC_CACHE_NAME).then(cache => {
      cache.addAll(STATIC_ASSETS)
  }).catch(err => {
      console.log(err);
  }))
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....');
  event.waitUntil(caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
          if(key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME){
              console.log('removing old cache - ', key);
              caches.delete(key);
          }
      }))
  }))
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    const url = 'https://httpbin.org/get';
    if(event.request.url.indexOf(url) > -1){
        event.respondWith(caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            return fetch(event.request).then(res => {
                cache.put(event.request.url, res.clone());
                return res;
            }) 
        }))
    }else if(staticOnly(STATIC_ASSETS, event.request.url)){
        event.respondWith(
            caches.match(event.request)
        )
    }else{
        event.respondWith(caches.match(event.request).then(response => {
            if(response){
                return response;
            }
            return fetch(event.request).then(response => {
                return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    cache.put(event.request.url, response.clone());
                    return response;
                })
            }).catch(err => {
                return caches.open(STATIC_CACHE_NAME).then(cache => {
                    if(event.request.url.indexOf('/help') > -1){
                        return cache.match('/offline.html');
                    }
                })
            })
        }))
    }
  
});
