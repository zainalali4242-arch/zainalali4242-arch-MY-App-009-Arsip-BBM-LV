/* sw.js — cache luring.
   Naikkan nomor VERSI di bawah setiap kali index.html diperbarui,
   kalau tidak ponsel akan tetap memakai salinan lama. */
var VERSI = 'bbm-v2.0.0';
var ASET = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSI).then(function (c) {
      return Promise.all(ASET.map(function (a) { return c.add(a).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (k) {
      return Promise.all(k.filter(function (x) { return x !== VERSI; })
        .map(function (x) { return caches.delete(x); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (c) {
      return c || fetch(e.request).then(function (r) {
        if (r && r.status === 200 && r.type === 'basic') {
          var salin = r.clone();
          caches.open(VERSI).then(function (ca) { ca.put(e.request, salin); });
        }
        return r;
      }).catch(function () { return caches.match('./index.html'); });
    })
  );
});
