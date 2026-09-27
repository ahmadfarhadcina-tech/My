const CACHE_NAME = "farhad-cina-portfolio-v4";

const APP_SHELL = [
    "/My/",
    "/My/index.html",
    "/My/manifest.json",
    "/My/assets/css/style.css",
    "/My/assets/js/config.js",
    "/My/assets/js/translations.js",
    "/My/assets/js/projects.js",
    "/My/assets/js/github.js",
    "/My/assets/js/app.js",
    "/My/assets/images/favicon.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseClone = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
