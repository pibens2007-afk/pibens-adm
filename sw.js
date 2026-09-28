// PIBENS ADM — Service Worker
// v1 — 2026-09-28
const VERSION = 'v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Ignora esquemas não http(s) (ex: chrome-extension://)
  if (!url.startsWith('http')) return;

  // NUNCA intercepta chamadas para APIs externas
  const APIs = [
    'script.google.com',
    'script.googleusercontent.com',
    'supabase.co',
    'generativelanguage.googleapis.com',
    'i.imgur.com',
    'bible-api.com',
    'cdn.tailwindcss.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com'
  ];
  if (APIs.some(a => url.includes(a))) return;

  // NUNCA cacheia HTML (sempre pega fresquinho do GitHub Pages)
  const isHTML = event.request.mode === 'navigate'
              || url.endsWith('.html')
              || url.endsWith('/');
  if (isHTML) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // Para outros assets (manifest, ícones), tenta rede, cai pro cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
