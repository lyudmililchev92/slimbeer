Screens.parents = function(){
    const p = State.progress;
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("home")),
      h("h1", null, t("forParents"))
    ));
    const body = h("div", { class:"scroll-area" });

    /* статистика */
    const wp = LP("words"), mp = LP("math");
    const learned = Object.keys(wp.words).length;
    const stats = h("div", { class:"stat-grid" },
      stat(wp.completedWords, t("statPlayed")),
      stat(learned, t("statLearned")),
      stat(wp.firstTryCorrect, t("statFirstTry")),
      stat(t("trackWords") + " " + wp.currentLevel, t("statLevel")),
      stat(mp.completedWords, t("statSums")),
      stat(t("trackMath") + " " + mp.currentLevel, t("statMathLevel")),
      stat(p.totalStars, t("statStars")),
      stat(Object.keys(wp.learnedLetters).length, t("statLetters"))
    );
    body.appendChild(h("div", { class:"card" }, stats));

    /* настройки */
    body.appendChild(h("h2", { class:"section-head" }, t("settingsHead")));
    const soundToggle = h("button", {
      class:"toggle", type:"button", role:"switch",
      "aria-checked": String(p.soundEnabled), "aria-label":t("sound")
    });
    soundToggle.addEventListener("click", () => {
      p.soundEnabled = !p.soundEnabled;
      soundToggle.setAttribute("aria-checked", String(p.soundEnabled));
      if(!p.soundEnabled) Speech.stop(); else Sfx.tap();
      Store.save();
    });
    const settings = h("div", { class:"card" },
      h("div", { class:"setting-row" }, h("span", { class:"lbl" }, t("soundSpeech")), soundToggle),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("voiceLabel")),
        (() => {
          // Различните причини за мълчание искат различни действия от родителя.
          let text, warn = true;
          const v = Speech.voices[State.progress.language];
          if(!Speech.supported)      text = t("voiceNo");
          else if(Speech.blocked)    text = t("voiceBlocked");
          else if(!v)                text = t("voiceNone");
          else if(inForeignFrame())  text = v.name + " · " + t("voiceFramed");
          else { text = t("voiceOk") + " ✓ · " + v.name; warn = false; }
          return h("span", {
            style:{ color: warn ? "#B7791F" : "var(--c-ink-soft)", fontWeight:"700",
                    textAlign:"right", maxWidth:"60%" }
          }, text);
        })()
      ),
      Store.available ? null : h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("noSaveLabel")),
        h("span", { style:{ color:"#B7791F", fontWeight:"700", textAlign:"right", maxWidth:"62%" } },
          t("noSaveText"))
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("autoSpeak")),
        (() => {
          const tg = h("button", { class:"toggle", type:"button", role:"switch",
                                   "aria-checked": String(p.autoSpeak), "aria-label": t("autoSpeak") });
          tg.addEventListener("click", () => {
            p.autoSpeak = !p.autoSpeak;
            tg.setAttribute("aria-checked", String(p.autoSpeak));
            Sfx.tap();
            Store.save();
          });
          return tg;
        })()
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("restartTrack")),
        (() => {
          // Връща само нивата на този път — звездите и научените думи остават.
          const row = h("div", { class:"lang-row compact" });
          [["words","trackWords","📖"],["math","trackMath","🔢"],["catch","trackCatch","🕹️"],["forest","trackForest","🌲"]].forEach(([tr, label, icon]) => {
            const b = h("button", { class:"lang-btn", type:"button" },
              h("span", { class:"flag" }, icon), t(label));
            b.addEventListener("click", () => {
              Sfx.tap();
              confirmAction(t("restartTitle"), t("restartText"), () => {
                const lp = State.progress.byLang[State.progress.language][tr];
                lp.currentLevel = 1;
                lp.levelProgress = 0;
                if(tr === "words") State.progress.tutorialCompleted = false;
                Store.save();
                State.session.recent = [];
                Router.go("parents");
              });
            });
            row.appendChild(b);
          });
          return row;
        })()
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("speechSpeed")),
        (() => {
          // При избор веднага се чува пример, за да се настрои на ухо.
          const row = h("div", { class:"lang-row compact" });
          const opts = [["slow","speedSlow"],["normal","speedNormal"],["fast","speedFast"]];
          const sample = () => {
            const w = WORDS.find(x => x.art === "cat") || WORDS[0];
            return w ? w.display : null;
          };
          opts.forEach(([key, label]) => {
            const b = h("button", {
              class:"lang-btn" + (State.progress.speechSpeed === key ? " active" : ""),
              type:"button", "aria-pressed": String(State.progress.speechSpeed === key)
            }, t(label));
            b.addEventListener("click", () => {
              State.progress.speechSpeed = key;
              Store.save();
              Array.from(row.children).forEach((el, i) => {
                const on = opts[i][0] === key;
                el.classList.toggle("active", on);
                el.setAttribute("aria-pressed", String(on));
              });
              Sfx.tap();
              Speech.speak(sample());
            });
            row.appendChild(b);
          });
          return row;
        })()
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("language")),
        (() => {
          const row = h("div", { class:"lang-row compact" });
          Object.keys(LANGS).forEach(code => {
            const on = code === State.progress.language;
            const b = h("button", { class:"lang-btn" + (on ? " active" : ""), type:"button",
                                    "aria-pressed":String(on) },
              h("span", { class:"flag" }, LANGS[code].flag), LANGS[code].name);
            b.addEventListener("click", () => { Sfx.tap(); setLanguage(code); });
            row.appendChild(b);
          });
          return row;
        })()
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("tutorialAgain")),
        (() => {
          const b = h("button", { class:"btn btn-ghost", type:"button" }, t("start"));
          b.addEventListener("click", () => {
            p.tutorialCompleted = false; Store.save();
            Sfx.tap(); Router.go("play");
          });
          return b;
        })()
      )
    );
    body.appendChild(settings);

    /* поверителност */
    body.appendChild(h("h2", { class:"section-head" }, t("privacyHead")));
    body.appendChild(h("div", { class:"card" },
      h("p", { style:{ color:"var(--c-ink-soft)", fontWeight:"700", lineHeight:"1.55" } },
        t("privacyText"))
    ));

    /* изтриване */
    body.appendChild(h("h2", { class:"section-head" }, t("progressHead")));
    const resetBtn = h("button", { class:"btn btn-danger", type:"button" }, "🗑 " + t("deleteProgress"));
    resetBtn.addEventListener("click", () => confirmAction(t("confirmTitle"), t("confirmText"), () => {
      Store.reset();
      State.session = { recent:[], solvedInSession:0, round:null, track:"words" };
      Router.go("parents");
    }));
    body.appendChild(h("div", { class:"card" }, resetBtn));

    screen.appendChild(body);
    return screen;

    function stat(num, lbl){
      return h("div", { class:"stat" }, h("div", { class:"num" }, String(num)), h("div", { class:"lbl" }, lbl));
    }
    /** Питаме, преди да върнем нещо назад. */
    function confirmAction(title, text, onYes){
      const ov = h("div", { class:"overlay", role:"dialog", "aria-modal":"true", "aria-label":title });
      const no = h("button", { class:"btn btn-ghost", type:"button" }, t("cancel"));
      const yes = h("button", { class:"btn btn-danger", type:"button" }, t("confirmYes"));
      no.addEventListener("click", () => ov.remove());
      yes.addEventListener("click", () => { onYes(); ov.remove(); });
      ov.appendChild(h("div", { class:"modal-card" },
        h("h2", null, title), h("p", null, text),
        h("div", { class:"modal-actions" }, no, yes)));
      screen.appendChild(ov);
      yes.focus();
    }
};
