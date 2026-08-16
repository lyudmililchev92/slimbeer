/* Началният екран: пет свята, не десет бутона.
 *
 * Осем отделни карти щяха да са стена от избор за дете на четири. Затова
 * са пет свята с разбираема икона и по няколко неща вътре. Докосването
 * върху света го отваря; вътре са пътищата му, с нивото до всеки.
 *
 * Светът се изговаря при докосване, защото детето още не чете. */

const WORLDS = [
  { id:"words",   icon:"📖", color:"w-words",
    tracks:[ { track:"words",   icon:"📖" },
             { track:"phonics", icon:"👂" },
             { track:"stories", icon:"📚" } ] },
  { id:"adventure", icon:"🌲", color:"w-forest",
    tracks:[ { track:"forest", icon:"🌲" } ],
    links:[ { icon:"🦊", key:"friends", screen:"friends" },
            { icon:"🎒", key:"missions", screen:"missions" } ] },
  { id:"numbers", icon:"🔢", color:"w-math",
    tracks:[ { track:"math", icon:"🔢" } ] },
  { id:"letters", icon:"✏️", color:"w-letters",
    tracks:[],
    links:[ { icon:"🔤", key:"letters", screen:"letters" } ] },
  { id:"quick",   icon:"🎮", color:"w-quick",
    tracks:[ { track:"quick", icon:"🎮" },
             { track:"catch", icon:"🕹️" } ] }
];

Screens.home = function(){
    const p = State.progress;
    const screen = h("section", { class:"screen home" });

    const mascot = h("div", { class:"home-mascot", html: mascotSVG() });

    const worlds = h("div", { class:"world-grid" });
    WORLDS.forEach(w => {
      const b = h("button", { class:"world-card " + w.color, type:"button",
                              "aria-label": t("world_" + w.id) },
        h("span", { class:"world-icon" }, w.icon),
        h("span", { class:"world-name" }, t("world_" + w.id)));
      b.addEventListener("click", () => {
        Sfx.tap();
        Speech.speak(t("world_" + w.id));
        Router.go("world", { id: w.id });
      });
      worlds.appendChild(b);
    });

    const row = h("div", { class:"home-row" },
      navBtn("⭐", t("stars"), () => Router.go("stars")),
      navBtn("⚙️", t("settings"), () => Router.go("parents"))
    );

    screen.append(
      mascot,
      h("h1", { class:"logo" }, t("title")),
      h("p", { class:"tagline" }, t("tagline")),
      h("div", { class:"level-chip" }, "⭐ " + p.totalStars),
      worlds,
      row
    );
    screen.appendChild(langSwitcher());
    setTimeout(() => worlds.firstChild.focus(), 60);
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

/* Вътре в един свят: неговите пътища с нивото до всеки. */
Screens.world = function(params){
    const world = WORLDS.find(w => w.id === params.id) || WORLDS[0];
    const screen = h("section", { class:"screen home world-screen" });

    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("home")),
      h("h1", null, t("world_" + world.id))
    ));

    const body = h("div", { class:"scroll-area" });
    const grid = h("div", { class:"track-row" });

    world.tracks.forEach(entry => {
      const lvl = State.progress.byLang[State.progress.language][entry.track].currentLevel;
      const b = h("button", { class:"track-card t-" + entry.track, type:"button" },
        h("span", { class:"track-icon" }, entry.icon),
        h("span", { class:"track-name" }, t("track" + cap(entry.track))),
        h("span", { class:"track-level" }, t("level") + " " + lvl));
      b.addEventListener("click", () => {
        Sfx.tap();
        State.session.track = entry.track;
        State.session.recent = [];
        Router.go("play");
      });
      grid.appendChild(b);
    });

    (world.links || []).forEach(l => {
      const b = h("button", { class:"track-card t-link", type:"button" },
        h("span", { class:"track-icon" }, l.icon),
        h("span", { class:"track-name" }, t(l.key)));
      b.addEventListener("click", () => { Sfx.tap(); Router.go(l.screen); });
      grid.appendChild(b);
    });

    body.appendChild(grid);
    screen.appendChild(body);
    setTimeout(() => { const f = grid.firstChild; if(f) f.focus(); }, 60);
    return screen;

    function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
};
