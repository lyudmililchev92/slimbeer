/* Service worker за Letterbeer.
 *
 * Има значение само когато играта е качена на хостинг по HTTPS.
 * Тогава след първото отваряне тя работи и без интернет — детето може
 * да играе в колата, в самолета или при спрял Wi-Fi.
 *
 * При отваряне на index.html като файл или по http:// браузърът не
 * позволява service worker и този файл просто не се използва.
 */
/* Името се сменя при всяко сглобяване (build.py го записва по съдържанието
   на файловете). Смени ли се, браузърът инсталира нов worker, изхвърля
   стария кеш и страницата се презарежда сама — иначе детето щеше да вижда
   вчерашната версия до следващото отваряне. */
const CACHE = "buki-__STAMP__";
const SHELL = ["./", "./index.html", "./styles.css", "./app.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .catch(() => {})          // липсващ файл не бива да чупи инсталацията
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Отговаряме от кеша веднага, а в същото време дърпаме свежо копие за
   следващия път. Така играта тръгва мигновено и пак се обновява. */
self.addEventListener("fetch", (e) => {
  if(e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request).then((hit) => {
      const fresh = fetch(e.request).then((res) => {
        if(res && res.status === 200){
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || fresh;
    })
  );
});
