Screens.home = function(){
    const p = State.progress;
    const screen = h("section", { class:"screen home" });

    const mascot = h("div", { class:"home-mascot", html: mascotSVG() });
    const trackCard = (track, labelKey, icon, cls) => {
      const lvl = State.progress.byLang[State.progress.language][track].currentLevel;
      const b = h("button", { class:"track-card " + cls, type:"button" },
        h("span", { class:"track-icon" }, icon),
        h("span", { class:"track-name" }, t(labelKey)),
        h("span", { class:"track-level" }, t("level") + " " + lvl));
      b.addEventListener("click", () => {
        Sfx.tap();
        State.session.track = track;
        State.session.recent = [];
        Router.go("play");
      });
      return b;
    };
    const tracks = h("div", { class:"track-row" },
      trackCard("words", "trackWords", "📖", "t-words"),
      trackCard("math",  "trackMath",  "🔢", "t-math"),
      trackCard("catch", "trackCatch", "🕹️", "t-catch"),
      trackCard("forest", "trackForest", "🌲", "t-forest"),
      trackCard("phonics", "trackPhonics", "👂", "t-phonics"),
      trackCard("stories", "trackStories", "📚", "t-stories"));
    const playBtn = tracks.firstChild;

    const row = h("div", { class:"home-row" },
      navBtn("🔤", t("letters"), () => Router.go("letters")),
      navBtn("🦊", t("friends"), () => Router.go("friends")),
      navBtn("⭐", t("stars"), () => Router.go("stars")),
      navBtn("⚙️", t("settings"), () => Router.go("parents"))
    );

    screen.append(
      mascot,
      h("h1", { class:"logo" }, t("title")),
      h("p", { class:"tagline" }, t("tagline")),
      h("div", { class:"level-chip" }, "⭐ " + p.totalStars),
      tracks,
      row
    );
    screen.appendChild(langSwitcher());
    setTimeout(() => playBtn.focus(), 60);
    return screen;

    function langSwitcher(){
      const row = h("div", { class:"lang-row", role:"group", "aria-label":t("language") });
      Object.keys(LANGS).forEach(code => {
        const on = code === State.progress.language;
        const b = h("button", {
          class:"lang-btn" + (on ? " active" : ""), type:"button",
          "aria-pressed": String(on), "aria-label": LANGS[code].name
        }, h("span", { class:"flag" }, LANGS[code].flag), LANGS[code].name);
        b.addEventListener("click", () => { Sfx.tap(); setLanguage(code); });
        row.appendChild(b);
      });
      return row;
    }

    function navBtn(icon, label, fn){
      const b = h("button", { class:"btn btn-ghost", type:"button", "aria-label":label },
        h("span", { class:"em" }, icon), label);
      b.addEventListener("click", () => { Sfx.tap(); fn(); });
      return b;
    }
};
