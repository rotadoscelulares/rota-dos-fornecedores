"use strict";

// Service worker do site público (index.html / fornecedores.html): permite
// acesso offline depois da primeira visita. Não afeta login/cadastro/admin,
// que continuam exigindo conexão com o backend.
const CACHE_NAME = "rc66-static-v1";

const PRECACHE_URLS = [
  "index.html",
  "fornecedores.html",
  "central-de-ajuda.html",
  "manifest.json",
  "assets/css/styles.css",
  "assets/js/app.js",
  "assets/js/auth-client.js",
  "assets/js/data.js",
  "assets/img/logo-oficial.png",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png",
  "assets/img/produtos/iphone-15-128gb.png",
  "assets/img/produtos/iphone-13-256gb.png",
  "assets/img/produtos/whoop-peak-5.png",
  "assets/img/produtos/iphone-14-pro-128gb.png",
  "assets/img/produtos/iphone-17-pro-max-256gb.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;

  // Nunca cachear chamadas de API — sempre precisam de rede.
  if (req.url.includes("/api/")) return;

  if (req.mode === "navigate") {
    // Páginas HTML: tenta a rede primeiro, cai para o cache se estiver offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("index.html")))
    );
    return;
  }

  // Demais arquivos estáticos: cache primeiro, atualiza em segundo plano.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
