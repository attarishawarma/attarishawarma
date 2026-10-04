// شوارما کھاتہ — آف لائن سروس ورکر
// ایپ کی فائل بدلنے پر صرف VER کا نمبر بڑھا دیں
const VER = 'khata-v3';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js',
  'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // فائربیس کا ڈیٹا (API) کبھی کیش نہیں کرنا
  if (u.hostname.endsWith('googleapis.com') && u.hostname !== 'fonts.googleapis.com') return;
  if (u.hostname.endsWith('firebaseio.com') || u.hostname.includes('firestore')) return;

  const isPage = r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/');
  if (isPage) {
    // پہلے نیٹ سے تازہ فائل، نہ ملے تو محفوظ شدہ فائل
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put('./index.html', cp)); return res; })
      .catch(() => caches.match('./index.html').then(m => m || caches.match('./'))));
    return;
  }
  // باقی چیزیں (فائربیس لائبریری، فونٹ، آئیکن): پہلے کیش سے
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => m)));
});
