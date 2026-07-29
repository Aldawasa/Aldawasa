// Service Worker — بسيط وآمن
// يتجاوز طلبات Supabase و CDN تمامًا (تبقى البيانات والصور محدّثة دائمًا)،
// ويخزّن هيكل الموقع فقط لتفعيل التثبيت والعمل جزئيًا بدون اتصال.
const CACHE = 'aldawa-v1';
const SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // طلبات خارج نطاق الموقع (Supabase، Tailwind، الخطوط) — دائمًا من الشبكة مباشرة
  if (url.origin !== self.location.origin) return;
  // نفس النطاق: الشبكة أولًا (لعرض آخر تحديث)، ثم الكاش عند انقطاع الاتصال
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('/')))
  );
});
