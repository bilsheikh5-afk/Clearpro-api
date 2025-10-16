
const VERSION = 'v1.0.0';
const STATIC_CACHE = `cp-static-${VERSION}`;
const RUNTIME_CACHE = `cp-runtime-${VERSION}`;
const PRECACHE = [
  '/Clearpro.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/maskable-512.png'
];

const DB_NAME = 'cp-sync';
const STORE = 'outbox';
function idb() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => {
      open.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}
async function queueRequest(req) {
  const db = await idb();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  const body = await req.clone().text();
  const item = { url: req.url, method: req.method, headers: [...req.headers], body, timestamp: Date.now() };
  store.add(item);
  await tx.done;
  if ('sync' in self.registration) {
    try { await self.registration.sync.register('cp-sync'); } catch(e){}
  }
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, net.clone());
        return net;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || caches.match('/offline.html');
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    if (req.method === 'GET') {
      event.respondWith((async () => {
        try {
          const net = await fetch(req);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(req, net.clone());
          return net;
        } catch (e) {
          const cached = await caches.match(req);
          return cached || new Response(JSON.stringify([]), { headers: {'Content-Type':'application/json'} });
        }
      })());
    } else if (['POST','PUT','PATCH','DELETE'].includes(req.method)) {
      event.respondWith((async () => {
        try {
          const net = await fetch(req);
          return net;
        } catch (e) {
          await queueRequest(req);
          return new Response(JSON.stringify({ ok:true, queued:true }), { headers: {'Content-Type':'application/json'} });
        }
      })());
    }
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const net = await fetch(req);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, net.clone());
        return net;
      } catch (e) {
        return new Response('', { status: 404 });
      }
    })());
  }
});

self.addEventListener('sync', event => {
  if (event.tag === 'cp-sync') {
    event.waitUntil((async () => {
      const db = await idb();
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const all = store.getAll();
      await new Promise(r => { all.onsuccess = () => r(); });
      const items = all.result || [];
      for (const item of items) {
        try {
          const headers = new Headers(item.headers);
          await fetch(item.url, { method: item.method, headers, body: item.body });
          store.delete(item.id);
        } catch (e) { /* keep for next sync */ }
      }
      await tx.done;
    })());
  }
});
