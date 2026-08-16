Screens.write = function(params){
    const Lt = params.letter;
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("letter", { letter:Lt })),
      h("h1", null, t("writeTitle") + " " + Lt)
    ));

    const body = h("div", { class:"scroll-area", style:{ textAlign:"center" } });
    const wrap = h("div", { class:"write-wrap" });
    const guide = h("canvas");   // пунктирният шаблон
    const ink   = h("canvas");   // рисунката на детето
    wrap.append(guide, ink);
    body.appendChild(wrap);

    const msg = h("p", { class:"prompt", style:{ marginTop:"12px" } }, t("traceHint"));
    body.appendChild(msg);

    const tracer = createLetterTracer(wrap, guide, ink, Lt);

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
        return;
      }
      let stars = 1;
      if(r.precision > 0.82 && r.coverage > 0.50) stars = 2;
      if(r.precision > 0.90 && r.coverage > 0.65) stars = 3;
      addStars(stars);
      LP("words").learnedLetters[Lt] = (LP("words").learnedLetters[Lt] || 0) + 1;
      Store.save();
      Sfx.success();
      msg.textContent = t("wellDone") + " " + "⭐".repeat(stars);
      Speech.speak(t("wellDone"));
    });
    body.appendChild(h("div", { class:"write-actions" }, clearBtn, showBtn, doneBtn));

    screen.appendChild(body);
    screen._onMounted = () => tracer.layout();
    screen._cleanup = () => tracer.destroy();
    return screen;
};
