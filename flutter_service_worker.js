'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "main.dart.js": "c04cad82366e91ccae14746a8f8a3d3b",
"version.json": "f5952b3a36d0e2f8a98ed39dcc2f8afc",
"assets/flutterkaigi_ogp.png": "9e568fcbacdada983dd4ab8d636a1ea4",
"assets/twitter_logo.svg": "631cd5664eb1d4a27681a21ca4ad6126",
"assets/flutterkaigi_logo.svg": "60e8766ea8433373b3dcc7c84848b883",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/assets/twitter_logo.svg": "631cd5664eb1d4a27681a21ca4ad6126",
"assets/assets/photo/katsummy.png": "55a5191dca32b837439c52e763312f30",
"assets/assets/flutterkaigi_logo.svg": "60e8766ea8433373b3dcc7c84848b883",
"assets/assets/banner.png": "67493d339345a988ac360e2d0c6a0087",
"assets/assets/discord_logo.svg": "7594b796fb440fa1ef63ca65f6b59c55",
"assets/assets/flutterkaigi-navbar_dark_logo.svg": "cdc1a26f38557372e4d824e6e27ecdc3",
"assets/assets/flutterkaigi-navbar_light_logo.svg": "be9fb2e1ae8ee991547bc538c5998586",
"assets/assets/medium_logo.svg": "58e9f9cb83a457fb381dc5ebc6bf39d3",
"assets/assets/twitter_white.svg": "903d086cf532ce552a6241ab7aa158e4",
"assets/assets/github_logo.svg": "1bb027109345a90a9eab1e929d8669c2",
"assets/NOTICES": "9677fd9c8d11d12ab3a8a1c0db3ae84c",
"assets/flutter.png": "4611019c4559669d8ee7f242f5dbf4e4",
"assets/discord_logo.svg": "7594b796fb440fa1ef63ca65f6b59c55",
"assets/flutterkaigi-navbar_dark_logo.svg": "cdc1a26f38557372e4d824e6e27ecdc3",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/flutterkaigi-navbar_light_logo.svg": "be9fb2e1ae8ee991547bc538c5998586",
"assets/medium_logo.svg": "58e9f9cb83a457fb381dc5ebc6bf39d3",
"assets/twitter_white.svg": "903d086cf532ce552a6241ab7aa158e4",
"assets/github_logo.svg": "1bb027109345a90a9eab1e929d8669c2",
"assets/AssetManifest.json": "cef911a37d4687afb64ccaa85cf39e13",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"favicon.png": "6ca60969d955557b7886c622423ef486",
"service-worker.js": "8e80dc880b1e22a2e73ff409d4b1d33e",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"index.html": "9e6e25ba7f8a9f98fb647d5f050d1360",
"/": "9e6e25ba7f8a9f98fb647d5f050d1360",
"manifest.json": "e21a8991a312b40b1643de826961b249",
"flutter.js": "eb2682e33f25cd8f1fc59011497c35f8",
"icons/Icon-512.png": "3f4f8b2bd2c99c17e609b03d55d09e14",
"icons/Icon-192.png": "02861f4b4a5637703ea4c586181ad448"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}