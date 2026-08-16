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

    /* Какво се удава и какво не — с думи, не с проценти. Родителят иска
       да знае с какво да помогне, не колко процента е детето му. */
    body.appendChild(h("h2", { class:"section-head" }, t("skillsHead")));
    body.appendChild(h("div", { class:"card skills-card" }, skillSummary()));

    /* Спокоен режим и по-едър шрифт. И двете са за средата, не за детето. */
    body.appendChild(h("h2", { class:"section-head" }, t("comfortHead")));
    const comfort = h("div", { class:"card" });
    comfort.appendChild(settingRow("calmMode", "reduceMotion", () => applyCalmMode()));
    comfort.appendChild(settingRow("bigText", "bigText", () => applyBigText()));
    body.appendChild(comfort);

    /* Днес: с какво се е занимавало. Кратко и без история назад. */
    body.appendChild(h("h2", { class:"section-head" }, t("todayHead")));
    body.appendChild(h("div", { class:"card skills-card" }, todaySummary()));

    /* Какво да се направи извън екрана — избрано според слабото. */
    body.appendChild(h("h2", { class:"section-head" }, t("offscreenHead")));
    body.appendChild(h("div", { class:"card skills-card" }, offscreenIdeas()));

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

    /* Показваме само буквите: те са конкретни и родителят може да ги
       упражни вкъщи. Числата остават скрити нарочно. */
    function skillSummary(){
      const lang = p.language;
      const letters = (suffix) => Mastery.ranked("letter." + lang + ".")
        .filter(x => x.id.slice(-suffix.length) === suffix && x.attempts >= 3);
      const name = (rec) => rec.id.split(".")[2];   // "letter.bg.Ж.recognition" → "Ж"
      const rows = [];

      const rec = letters(".recognition");
      const going = rec.filter(x => x.mastery >= 0.65).map(name);
      const work  = rec.filter(x => x.mastery < 0.35).map(name);
      const first = letters(".first").filter(x => x.mastery < 0.35).map(name);
      const write = letters(".writing").filter(x => x.mastery < 0.35).map(name);

      const row = (label, list) => {
        if(!list.length) return;
        rows.push(h("div", { class:"skill-row" },
          h("span", { class:"skill-label" }, label),
          h("span", { class:"skill-letters" }, list.slice(0, 12).join(" "))));
      };
      row(t("skillsGoing"), going);
      row(t("skillsPractising"), work);
      row(t("skillsSounds"), first);
      row(t("skillsWriting"), write);

      if(!rows.length) return [h("p", { class:"prompt" }, t("skillsNone"))];
      return rows;
    }

    /* Ред на ден: колко неща по кой път. Ако още не е играло — казваме го. */
    function todaySummary(){
      const today = activityToday();
      const rows = [];
      const label = { words:"trackWords", math:"trackMath", catch:"trackCatch",
                      forest:"trackForest", phonics:"trackPhonics",
                      stories:"trackStories", quick:"trackQuick" };
      TRACK_IDS.forEach(tr => {
        if(!today[tr]) return;
        rows.push(h("div", { class:"skill-row" },
          h("span", { class:"skill-label" }, t(label[tr] || tr)),
          h("span", { class:"skill-letters" }, String(today[tr]))));
      });
      if(!rows.length) return [h("p", { class:"prompt" }, t("todayNone"))];
      return rows;
    }

    /* Идея за извън екрана, свързана с това, което точно куца. Без сървър,
       без изкуствен интелект — просто съответствие между умение и задачка. */
    function offscreenIdeas(){
      const lang = p.language;
      const weakLetters = Mastery.ranked("letter." + lang + ".")
        .filter(x => x.attempts >= 3 && x.mastery < 0.4);
      const weakMath = Mastery.ranked("math.").filter(x => x.attempts >= 3 && x.mastery < 0.5);

      const picks = [];
      if(weakLetters.length){
        const ch = weakLetters[0].id.split(".")[2];
        picks.push(t("ideaLetter").replace("{L}", ch));
      }
      if(weakMath.length) picks.push(t("ideaCount"));
      MISSIONS.slice(0, 12).forEach(m => { if(picks.length < 3) picks.push(m[lang]); });

      return picks.slice(0, 3).map(text => {
        const row = h("div", { class:"idea-row" }, h("span", null, "💡"), h("p", null, text));
        row.addEventListener("click", () => { Sfx.tap(); Speech.speak(text); });
        return row;
      });
    }

    /* Ред с превключвател. Настройките живеят в p.settings. */
    function settingRow(labelKey, key, after){
      const st = p.settings || (p.settings = {});
      const tg = h("button", { class:"toggle", type:"button", role:"switch",
                               "aria-checked": String(!!st[key]), "aria-label": t(labelKey) });
      tg.addEventListener("click", () => {
        st[key] = !st[key];
        tg.setAttribute("aria-checked", String(!!st[key]));
        Sfx.tap();
        Store.save();
        if(after) after();
      });
      return h("div", { class:"setting-row" }, h("span", { class:"lbl" }, t(labelKey)), tg);
    }

    function stat(num, lbl){
      return h("div", { class:"stat" }, h("div", { class:"num" }, String(num)), h("div", { class:"lbl" }, lbl));
    }
    /** Питаме, преди да върнем нещо назад. */
    /* Нулирането трие напредъка на дете. Едно докосване не стига — трябва
       задържане. Без ПИН: ПИН се забравя и заключва родителя, а задържането
       е нещо, което малка ръка няма да направи случайно. */
    function confirmAction(title, text, onYes){
      const ov = h("div", { class:"overlay", role:"dialog", "aria-modal":"true", "aria-label":title });
      const no = h("button", { class:"btn btn-ghost", type:"button" }, t("cancel"));
      const yes = h("button", { class:"btn btn-danger hold", type:"button" }, t("holdToConfirm"));
      const fill = h("span", { class:"hold-fill" });
      yes.appendChild(fill);

      const HOLD = 1600;
      let timer = null, started = 0, raf = 0;
      const stop = () => {
        if(timer) clearTimeout(timer);
        if(raf) cancelAnimationFrame(raf);
        timer = raf = 0;
        fill.style.width = "0%";
        yes.classList.remove("holding");
      };
      const tick = () => {
        const f = Math.min(1, (Date.now() - started) / HOLD);
        fill.style.width = (f * 100) + "%";
        if(f < 1) raf = requestAnimationFrame(tick);
      };
      const begin = (e) => {
        e.preventDefault();
        if(timer) return;
        started = Date.now();
        yes.classList.add("holding");
        if(!REDUCED_MOTION) raf = requestAnimationFrame(tick); else fill.style.width = "100%";
        timer = setTimeout(() => { stop(); onYes(); ov.remove(); }, HOLD);
      };
      yes.addEventListener("pointerdown", begin);
      ["pointerup", "pointerleave", "pointercancel"].forEach(ev => yes.addEventListener(ev, stop));
      // клавиатурата е за родителя: Enter задържа, докато се държи
      yes.addEventListener("keydown", (e) => { if(e.key === "Enter" || e.key === " ") begin(e); });
      yes.addEventListener("keyup", stop);

      no.addEventListener("click", () => { stop(); ov.remove(); });
      ov.appendChild(h("div", { class:"modal-card" },
        h("h2", null, title), h("p", null, text),
        h("div", { class:"modal-actions" }, no, yes)));
      screen.appendChild(ov);
      no.focus();
    }
};
