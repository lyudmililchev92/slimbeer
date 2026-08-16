/* Генериран файл — не го редактирай. Източникът е в src/ */
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
const CACHE = "buki-f199a9385a";
const SHELL = ["./", "./index.html", "./styles.css", "./app.js"];

/* Всеки файл се записва поотделно. addAll е „всичко или нищо“: един
   бавен файл проваля целия кеш и играта остава без офлайн копие. */
function cacheEach(cache, urls){
  return Promise.all(urls.map((u) =>
    // cache:"reload" заобикаля HTTP кеша на браузъра. Без него новият worker
    // записваше СТАРИТЕ файлове: GitHub Pages ги дава с max-age=600 и
    // браузърът ги връщаше от паметта си, без да пита сървъра.
    fetch(new Request(u, { cache: "reload" }))
      .then((res) => (res && res.ok) ? cache.put(u, res) : null)
      .catch(() => null)
  ));
}

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => cacheEach(c, SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
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
   следващия път. Така играта тръгва мигновено и пак се обновява.
 *
 * Записът върви през waitUntil. Без него браузърът спокойно спира worker-а
 * веднага след като отговорът е даден — и записът така и не се случва.
 * Точно затова кешът на живия сайт оставаше празен, докато локално, където
 * мрежата е мигновена, всичко изглеждаше наред. */
self.addEventListener("fetch", (e) => {
  if(e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;

  e.respondWith(
    // ignoreSearch: адресът може да носи ?нещо (споделена връзка, презареждане
    // с параметър). Без това кешираният index.html не се разпознава и офлайн
    // играта показва грешка на браузъра.
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      const fresh = fetch(new Request(e.request, { cache: "no-cache" }))
        .then((res) => {
          if(res && res.status === 200){
            const copy = res.clone();
            e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}));
          }
          return res;
        })
        .catch(() => {
          // Мрежата я няма. Ако е поискана страница, даваме началната от
          // кеша — иначе детето вижда съобщение за грешка вместо игра.
          if(hit) return hit;
          if(e.request.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        });
      return hit || fresh;
    })
  );
});
