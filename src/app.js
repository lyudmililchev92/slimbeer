/* =========================================================================
 * 11. APP INIT
 * ========================================================================= */
/* Пресглобява речника за активния език според това какво устройството показва. */
let canShowImage = () => true;
function rebuildWords(){
  WORDS = buildWords(State.progress.language, w => w.art ? !!ART[w.art] : canShowImage(w.emoji));
  if(DEBUG) console.log("[" + State.progress.language + "] думи:", WORDS.length);
  buildPhonicsIndex(State.progress.language);
}

/* Иконата за началния екран на телефона се рисува в момента и се закача
   като apple-touch-icon. Така файлът си остава един, без външни картинки. */
function installAppIcon(){
  try{
    // Маскотът, нарисуван в PNG — iOS иска PNG за иконата на началния екран.
    const svg = mascotSVG().replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    const img = new Image();
    img.onload = () => {
      try{
        const c = document.createElement("canvas");
        c.width = c.height = 180;
        const x = c.getContext("2d");
        x.fillStyle = "#EDEAFF"; x.fillRect(0, 0, 180, 180);
        x.drawImage(img, 12, 12, 156, 156);
        const url = c.toDataURL("image/png");

        ["apple-touch-icon", "icon"].forEach(rel => {
          const link = document.createElement("link");
          link.rel = rel; link.href = url;
          document.head.appendChild(link);
        });

        const manifest = {
          name: "Letterbeer", short_name: "Letterbeer",
          display: "standalone", orientation: "any",
          background_color: "#F3F5FD", theme_color: "#F3F5FD",
          start_url: location.href.split("#")[0],
          icons: [{ src: url, sizes: "180x180", type: "image/png", purpose: "any" }]
        };
        const m = document.createElement("link");
        m.rel = "manifest";
        m.href = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type:"application/manifest+json" }));
        document.head.appendChild(m);
      }catch(e){}
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }catch(e){}
}

function init(){
  State.progress = Store.load();
  applyCalmMode();
  applyBigText();
  installAppIcon();
  canShowImage = createEmojiProbe();
  rebuildWords();
  Speech.init();

  document.documentElement.lang = State.progress.language;

  // Отключване на аудиото при първото докосване (изискване на браузърите).
  // Опитваме отключване при всеки жест, докато контекстът тръгне — първият
  // жест невинаги стига (мобилни браузъри, iframe с ограничения).
  const unlock = () => {
    Sfx.unlock();
    const settled = Sfx.blocked || (Sfx.ctx && Sfx.ctx.state === "running");
    if(settled) document.removeEventListener("pointerdown", unlock);
  };
  document.addEventListener("pointerdown", unlock);

  // Без zoom при двойно докосване и без "дърпане" на страницата.
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("touchmove", (e) => {
    if(e.touches.length > 1) e.preventDefault();
  }, { passive:false });

  Router.go("home");
  Debug.mount();

  /* Офлайн работа — има смисъл само при хостинг по HTTPS. При отваряне
     на файла директно или по http:// браузърът не позволява service
     worker и регистрацията тихо се проваля, без да пречи на играта. */
  if("serviceWorker" in navigator && location.protocol === "https:"){
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
