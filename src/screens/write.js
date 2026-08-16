Screens.write = function(params){
    const Lt = params.letter;
    const lang = State.progress.language;
    /* Два начина на писане. Свободното е за най-малките: важи само дали
       мастилото е в буквата. Воденото пази и реда на щриховете. То се
       предлага само за букви, за които има описани щрихи. */
    const canGuide = hasStrokes(Lt, lang);
    let mode = (params.mode === "guided" && canGuide) ? "guided" : "free";

    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("letter", { letter:Lt })),
      h("h1", null, t("writeTitle") + " " + Lt)
    ));

    const body = h("div", { class:"scroll-area", style:{ textAlign:"center" } });

    /* Превключвател между двата начина — с икони, не с обяснение. */
    if(canGuide){
      const tabs = h("div", { class:"write-tabs", role:"tablist" });
      const tab = (id, icon, key) => {
        const b = h("button", { class:"write-tab" + (mode === id ? " on" : ""), type:"button",
                                role:"tab", "aria-selected": String(mode === id) },
          h("span", { class:"tab-icon" }, icon), t(key));
        b.addEventListener("click", () => {
          if(mode === id) return;
          Sfx.tap();
          Router.go("write", { letter:Lt, mode:id });
        });
        return b;
      };
      tabs.append(tab("free", "🖍️", "writeFree"), tab("guided", "①", "writeGuided"));
      body.appendChild(tabs);
    }

    const wrap = h("div", { class:"write-wrap" });
    const guide = h("canvas");   // шаблонът
    const ink   = h("canvas");   // рисунката на детето
    wrap.append(guide, ink);
    body.appendChild(wrap);

    const msg = h("p", { class:"prompt", style:{ marginTop:"12px" } },
      mode === "guided" ? t("guideHint") : t("traceHint"));
    body.appendChild(msg);

    let tracer, actions;

    if(mode === "guided"){
      tracer = createGuidedTracer(wrap, guide, ink, Lt, lang);

      const steps = h("div", { class:"stroke-steps", "aria-live":"polite" });
      const paintSteps = (i, n) => {
        steps.innerHTML = "";
        for(let k = 0; k < n; k++)
          steps.appendChild(h("span", { class:"stroke-dot" + (k < i ? " on" : "") }, String(k + 1)));
      };
      paintSteps(0, tracer.strokeCount);
      body.insertBefore(steps, msg);

      tracer.onProgress((i, n) => {
        paintSteps(i, n);
        if(i < n){ msg.textContent = t("guideNext"); return; }
        // всички щрихове са минати в правилния ред
        const stars = 3;
        addStars(stars);
        LP("words").learnedLetters[Lt] = (LP("words").learnedLetters[Lt] || 0) + 1;
        Mastery.record(writingSkill(Lt, lang), true);
        Store.save();
        Sfx.success();
        msg.textContent = t("wellDone") + " " + "⭐".repeat(stars);
        Speech.speak(t("wellDone"));
      });

      const again = h("button", { class:"btn btn-ghost", type:"button" }, "🧽 " + t("clear"));
      again.addEventListener("click", () => { Sfx.tap(); tracer.reset(); paintSteps(0, tracer.strokeCount); msg.textContent = t("guideHint"); });
      const show = h("button", { class:"btn btn-warm", type:"button" }, "👀 " + t("show"));
      show.addEventListener("click", () => { Sfx.tap(); tracer.showNext(); });
      actions = h("div", { class:"write-actions" }, again, show);

    } else {
      tracer = createLetterTracer(wrap, guide, ink, Lt);

      const clearBtn = h("button", { class:"btn btn-ghost", type:"button" }, "🧽 " + t("clear"));
      clearBtn.addEventListener("click", () => { Sfx.tap(); tracer.clear(); msg.textContent = t("traceHint"); });
      const showBtn = h("button", { class:"btn btn-warm", type:"button" }, "👀 " + t("show"));
      showBtn.addEventListener("click", () => { Sfx.tap(); tracer.demo(); });
      const doneBtn = h("button", { class:"btn btn-success", type:"button" }, "✅ " + t("done"));
      doneBtn.addEventListener("click", () => {
        const r = tracer.evaluate();
        if(r.status === "empty"){
          msg.textContent = t("traceHint");
          Sfx.tap();
          return;
        }
        if(r.status !== "ok"){
          // Не е грешка, а „още веднъж“: буквата остава, за да се види къде
          // е излязла, и детето пробва пак веднага.
          Sfx.wrong();
          shakeEl(wrap);
          msg.textContent = r.status === "outside" ? t("traceOutside") : t("traceIncomplete");
          msg.classList.add("try-again");
          setTimeout(() => msg.classList.remove("try-again"), 1200);
          Mastery.record(writingSkill(Lt, lang), false);
          Store.save();
          return;
        }
        let stars = 1;
        if(r.precision > 0.82 && r.coverage > 0.50) stars = 2;
        if(r.precision > 0.90 && r.coverage > 0.65) stars = 3;
        addStars(stars);
        LP("words").learnedLetters[Lt] = (LP("words").learnedLetters[Lt] || 0) + 1;
        Mastery.record(writingSkill(Lt, lang), true);
        Store.save();
        Sfx.success();
        msg.textContent = t("wellDone") + " " + "⭐".repeat(stars);
        Speech.speak(t("wellDone"));
      });
      actions = h("div", { class:"write-actions" }, clearBtn, showBtn, doneBtn);
    }

    body.appendChild(actions);
    screen.appendChild(body);
    screen._onMounted = () => tracer.layout();
    screen._cleanup = () => tracer.destroy();
    return screen;
};
