Screens.missions = function(){
    const p = State.progress;
    const lang = p.language;
    const done = (p.discoveries && p.discoveries.missions) || {};

    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("world", { id:"adventure" })),
      h("h1", null, t("missions"))
    ));

    const body = h("div", { class:"scroll-area" });
    body.appendChild(h("p", { class:"prompt say" }, t("missionsHint")));

    /* Три мисии наведнъж. Дълъг списък е стена за дете — три са покана.
       Изборът е стабилен през деня, за да не се сменят при всяко влизане. */
    const pool = MISSIONS.filter(m => !done[m.id]);
    const today = pool.length >= 3 ? pool : MISSIONS;
    const seed = Object.keys(done).length;
    const three = [];
    for(let i = 0; i < 3 && i < today.length; i++)
      three.push(today[(seed * 7 + i * 5) % today.length]);

    const list = h("div", { class:"mission-list" });
    three.forEach(m => {
      const card = h("div", { class:"mission-card" },
        h("span", { class:"mission-icon" }, m.icon),
        h("p", { class:"mission-text" }, m[lang]));
      const say = h("button", { class:"line-listen", type:"button",
                                "aria-label": t("listenLabel") }, "🔊");
      say.addEventListener("click", () => { Sfx.tap(); Speech.speak(m[lang]); });
      const ok = h("button", { class:"btn btn-success", type:"button" }, "✅ " + t("missionDone"));
      ok.addEventListener("click", () => {
        if(card.classList.contains("done")) return;
        card.classList.add("done");
        discover("missions", m.id);
        addStars(2);
        Sfx.success();
        Speech.speak(t("wellDone"));
        ok.textContent = "⭐ " + t("wellDone");
      });
      card.append(say, ok);
      list.appendChild(card);
    });
    body.appendChild(list);

    body.appendChild(h("p", { class:"mission-note" }, t("missionsNote")));
    screen.appendChild(body);
    return screen;
};
