const staticCache = 'Static-cache-v1';
const dynamicCache = 'Dynamic-cache-v1';

const assets = [
    "/",
    "/public/index.html",
    "/public/js/App.js",
    "/public/js/ui.js",
    "/public/js/db.js",
    "/public/css/app.css",
    "/public/pages/about.html",
    "/public/pages/resetpassword.html",
    "/public/pages/fallback.html",
    "/public/img/box.jpg",
    "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
];

//Cache size limit
const limitCacheSize = (name, size) => {
    caches.open(name).then((cache) => {
        cache.keys().then((keys) => {
            if(keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name,size));
            }
        });
    });
};

self.addEventListener("install", function (event) {
    console.log(`Event fired: ${event.type}`);
    event.waitUntil(
        caches.open(staticCache).then(function (cache){
            // console.log("SW: Precaching App shell");
            cache.addAll(assets);
        })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                .filter((key) => key != staticCache && key != dynamicCache)
                .map((key) => caches.delete(key))
            );
        })
    );
});

self.addEventListener("fetch", function (event) {
    if(event.request.url.indexOf("firestore.googleapis.com") == -1) {     //stop app from adding firestore info to dynamic cache
        event.respondWith(
            caches.match(event.request).then((response) => {
                return (
                    response || 
                    fetch(event.request).then(fetchRes => {
                        return caches.open(dynamicCache).then((cache) => {
                            cache.put(event.request.url, fetchRes.clone());
                            limitCacheSize(dynamicCache, 15);
                            return fetchRes;
                        });
                    })
                );
            }).catch(() => caches.match('/public/pages/fallback.html'))
        );
    }
});
