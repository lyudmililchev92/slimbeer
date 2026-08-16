Screens.friends = function(){
    const p = State.progress;
    const lang = p.language;
    const found = (p.discoveries && p.discoveries.friends) || {};
    const foundBiomes = (p.discoveries && p.discoveries.biomes) || {};

    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("home")),
      h("h1", null, t("friendsTitle"))
    ));

    const body = h("div", { class:"scroll-area" });

    /* Брояч на открития. Показва какво е видяло детето, не колко му липсва. */
    const n = Object.keys(found).length;
    body.appendChild(h("div", { class:"discovery-row" },
      h("span", { class:"disc" }, "🦊 " + n + " / " + FOREST_FRIENDS.length),
      h("span", { class:"disc" }, "🗺️ " + Object.keys(foundBiomes).length + " / " + FOREST_BIOME_COUNT),
      h("span", { class:"disc" }, "⭐ " + p.totalStars)
    ));

    const grid = h("div", { class:"friend-grid" });
    FOREST_FRIENDS.forEach((f, i) => {
      const known = !!found[String(i)];
      const card = h("button", { class:"friend-card" + (known ? "" : " locked"), type:"button",
                                 "aria-label": known ? f.name[lang] : t("friendUnknown") });
      card.appendChild(h("span", { class:"friend-face" }, known ? f.who : "❓"));
      card.appendChild(h("span", { class:"friend-name" }, known ? f.name[lang] : "?"));
      if(known){
        card.addEventListener("click", () => { Sfx.tap(); showFriend(f); });
      } else {
        // Неоткритият приятел не е заключен, а още непознат — казваме къде живее.
        card.addEventListener("click", () => { Sfx.tap(); Speech.speak(t("friendUnknown")); });
      }
      grid.appendChild(card);
    });
    body.appendChild(grid);
    screen.appendChild(body);

    function showFriend(f){
      const box = h("div", { class:"modal-card friend-detail" },
        h("div", { class:"friend-face big" }, f.who),
        h("h2", null, f.name[lang]),
        h("p", { class:"friend-line" }, t("friendLives") + " " + t("biome_" + f.biome) + "."),
        h("p", { class:"friend-line" }, t("friendLikes") + " " + f.wants[lang] + "."),
        h("p", { class:"friend-line" }, t("friendLetter") + " " + f.letter[lang] + "."),
        h("p", { class:"friend-fact" }, f.fact[lang])
      );
      const close = h("button", { class:"btn btn-primary", type:"button" }, t("close"));
      box.appendChild(close);
      const back = h("div", { class:"overlay", role:"dialog", "aria-modal":"true",
                              "aria-label": f.name[lang] }, box);
      close.addEventListener("click", () => { Sfx.tap(); back.remove(); });
      back.addEventListener("click", (e) => { if(e.target === back) back.remove(); });
      screen.appendChild(back);
      Speech.speak(f.name[lang] + ". " + f.fact[lang]);
    }

    return screen;
};
