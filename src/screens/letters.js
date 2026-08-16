Screens.letters = function(){
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("home")),
      h("h1", null, t("letters"))
    ));
    const grid = h("div", { class:"letter-grid" });
    L().alphabet.forEach(l => {
      const known = (LP("words").learnedLetters[l] || 0) >= 3;
      const cell = h("button", {
        class:"letter-cell" + (known ? " known" : ""),
        type:"button", "aria-label":t("letterLabel") + " " + l
      }, l);
      // Говорът се пуска в екрана на буквата — Router.go спира текущия изговор.
      cell.addEventListener("click", () => { Sfx.tap(); Router.go("letter", { letter:l }); });
      grid.appendChild(cell);
    });
    screen.appendChild(h("div", { class:"scroll-area" }, grid));
    return screen;
};

Screens.letter = function(params){
    const Lt = params.letter;
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("letters")),
      h("h1", null, t("learnLetter"))
    ));

    const body = h("div", { class:"scroll-area", style:{ textAlign:"center" } });

    const hero = h("button", { class:"letter-pair", type:"button", "aria-label":t("listen") + " " + Lt,
      style:{ margin:"0 auto", display:"flex", background:"none" } },
      h("span", { class:"letter-hero" }, Lt),
      h("span", { class:"small" }, Lt.toLowerCase())
    );
    hero.addEventListener("click", () => { Sfx.tap(); Speech.speak(L().letterSound[Lt] || Lt); });
    body.appendChild(hero);

    const listen = h("button", { class:"btn btn-warm", type:"button" }, "🔊 " + t("listen"));
    listen.addEventListener("click", () => { Sfx.tap(); Speech.speak(L().letterSound[Lt] || Lt); });
    const writeBtn = h("button", { class:"btn btn-primary", type:"button" }, "✏️ " + t("write"));
    writeBtn.addEventListener("click", () => { Sfx.tap(); Router.go("write", { letter:Lt }); });
    body.appendChild(h("div", { class:"write-actions" }, listen, writeBtn));

    /* Примери в две групи: думи, които ЗАПОЧВАТ с буквата, и думи, които я СЪДЪРЖАТ. */
    const starting = WORDS.filter(w => w.word[0] === Lt).slice(0, 6);
    const containing = WORDS.filter(w => w.word[0] !== Lt && w.word.indexOf(Lt) >= 0);

    if(starting.length){
      body.appendChild(h("h2", { class:"section-head" }, t("startsWith") + " " + Lt));
      body.appendChild(wordCards(starting));
    }
    if(containing.length && starting.length < 4){
      body.appendChild(h("h2", { class:"section-head" }, t("containsLetter") + " " + Lt));
      body.appendChild(wordCards(shuffle(containing).slice(0, 6)));
    }
    if(!starting.length && !containing.length){
      // Ь не започва дума и се среща рядко — обясняваме приятелски вместо празен екран.
      body.appendChild(h("p", { class:"prompt" },
        (Lt === "Ь" && t("softSign")) ? t("softSign") : t("letterLater")));
    }
    screen.appendChild(body);
    setTimeout(() => Speech.speak(L().letterSound[Lt] || Lt), 400);
    return screen;

    function wordCards(list){
      const cards = h("div", { class:"word-cards" });
      list.forEach(w => {
        const c = h("button", { class:"word-card", type:"button", "aria-label":w.display });
        c.appendChild(renderArt(w));
        c.appendChild(h("div", { class:"label" }, w.word));
        c.addEventListener("click", () => { Sfx.tap(); Speech.speak(w.display); });
        cards.appendChild(c);
      });
      return cards;
    }
};
