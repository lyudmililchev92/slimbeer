Screens.stars = function(){
    const p = State.progress;
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("home")),
      h("h1", null, t("myStars"))
    ));
    const body = h("div", { class:"scroll-area", style:{ textAlign:"center" } });
    body.appendChild(h("div", { style:{ fontSize:"clamp(56px,14vmin,110px)" } }, "⭐"));
    body.appendChild(h("div", { style:{ fontSize:"clamp(30px,6vmin,52px)", fontWeight:"800", color:"var(--c-primary-dark)" } },
      String(p.totalStars)));

    const learned = WORDS.filter(w => LP("words").words[w.word]);
    body.appendChild(h("h2", { class:"section-head" },
      learned.length ? t("learnedWords") + " (" + learned.length + ")" : t("noWordsYet")));
    const cards = h("div", { class:"word-cards" });
    learned.forEach(w => {
      const c = h("button", { class:"word-card", type:"button", "aria-label":w.display });
      c.appendChild(renderArt(w));
      c.appendChild(h("div", { class:"label" }, w.word));
      c.addEventListener("click", () => { Sfx.tap(); Speech.speak(w.display); });
      cards.appendChild(c);
    });
    if(!learned.length){
      cards.appendChild(h("p", { class:"prompt" }, t("playToCollect")));
    }
    body.appendChild(cards);
    screen.appendChild(body);
    return screen;
};
