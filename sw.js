// 离线缓存。版本号随内容指纹变化，内容更新后换新缓存。
const V = "lang-map-bc712966";
const FILES = ["./","index.html","./3d.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var u = new URL(e.request.url);
  if (u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var c = r.clone();
    caches.open(V).then(function (x) { x.put(e.request, c); });
    return r;
  }).catch(function () {
    return caches.match(e.request, {ignoreSearch: true}).then(function (r) { return r || caches.match("./index.html"); });
  }));
});
