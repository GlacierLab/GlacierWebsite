var APP_PREFIX = '红楼续梦'
var VERSION = '20230506'
var VERSION_AZUSA_PATCH_USE = '20221129'
var AZUSA_PATCH_SKIP_LIST = [
    "./Setup.webp"
]
var CACHE_NAME = APP_PREFIX + VERSION
var AZUSA_CACHE = APP_PREFIX + VERSION_AZUSA_PATCH_USE
var URLS = [
    './'
]
const getCacheName = url => {
    return CACHE_NAME;
}
self.addEventListener('fetch', event => {
    if (event.request.url.indexOf("getVersionWorker") > 0) {
        event.respondWith(new Response(VERSION));
        return;
    }
    if (event.request.method == "GET" && (event.request.url.indexOf("qinlili.bid") > 0) && (event.request.url.indexOf("google") == -1) && (event.request.url.indexOf("ForceNoCache") == -1)) {
        event.respondWith(
            caches.open(getCacheName(event.request.url)).then(async cache => {
                return cache.match(event.request).then(response => {
                    return response || fetch(event.request).then(response => {
                        if (response.status < 400) {
                            cache.put(event.request, response.clone());
                            console.log('file cached : ' + event.request.url)
                        }
                        return response;
                    }).catch(error => {
                        console.log("failed to fetch :" + event.request.url)
                        console.log(error);
                    });
                });
            })

        );
    } else {
        event.respondWith(fetch(event.request))
    }
});
self.addEventListener('install', e => {
    self.skipWaiting();
    const install = async () => {
        const cache = await caches.open(CACHE_NAME)
        console.log('installing cache : ' + CACHE_NAME)
        if ((await caches.has(AZUSA_CACHE))) {
            console.log("Found Old Cache! Azusa Patch Working...");
            caches.open(AZUSA_CACHE).then(oldCache => {
                AZUSA_PATCH_SKIP_LIST.forEach(async url => {
                    let tempResponse = await oldCache.match(url);
                    if (tempResponse) {
                        console.log("Azusa Success Transfer Old Cache : " + url)
                        cache.put(url, tempResponse);
                    }
                })
            })
        }
        await cache.addAll(AZUSA_PATCH_SKIP_LIST.concat(URLS));
        return true;
    }
    e.waitUntil(install());
});
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            var cacheWhitelist = keyList.filter(key => {
                return key.indexOf(APP_PREFIX)
            })
            cacheWhitelist.push(CACHE_NAME);
            return Promise.all(keyList.map((key, i) => {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keyList[i])
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
});