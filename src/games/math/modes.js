function createNumberChoiceMode(id, promptKey, renderProblem, speakProblem){
  return {
    id: id, showsPicture: false,
    supports(){ return true; },
    mount(root, host){
      const it = host.item, answer = mathAnswer(it);
      let mistakes = 0, done = false;

      root.appendChild(h("p", { class:"prompt" }, t(promptKey)));
      root.appendChild(h("div", { class:"math-stage" }, renderProblem(it)));

      const optsEl = h("div", { class:"options" });
      numberOptions(answer, 20).forEach(v => {
        const b = h("button", { class:"opt-letter", type:"button",
                                "aria-label": numberWord(v) }, String(v));
        b.addEventListener("click", () => {
          if(done) return;
          if(v === answer){
            done = true; b.classList.add("right"); Sfx.place();
            setTimeout(() => host.correct(mistakes), 420);
          } else { mistakes++; Sfx.wrong(); shakeEl(b); host.mistake(); }
        });
        optsEl.appendChild(b);
      });
      root.appendChild(optsEl);

      return {
        maxHints: 2,
        hint(step){
          if(step === 1){ speakProblem(it); return t("hintCountAgain"); }
          const right = Array.from(optsEl.children).find(b => b.textContent === String(answer));
          if(right) right.classList.add("right");
          Speech.speak(numberWord(answer));
          return t("hintHereIs");
        },
        destroy(){}
      };
    }
  };
}

const MODE_COUNT = createNumberChoiceMode("count", "promptCount",
  (it) => iconRow(it.icon, it.n),
  (it) => Speech.speak(t("promptCount")));

const MODE_ADD = createNumberChoiceMode("add", "promptAdd",
  (it) => h("div", { class:"sum-row" },
    iconRow(it.icon, it.a, "group"), h("span", { class:"sum-sign" }, "+"),
    iconRow(it.icon, it.b, "group"), h("span", { class:"sum-sign" }, "=" ),
    h("span", { class:"sum-q" }, "?")),
  (it) => Speech.speak(numberWord(it.a) + " " + t("plus") + " " + numberWord(it.b)));

const MODE_SUB = createNumberChoiceMode("sub", "promptSub",
  (it) => {
    const row = h("div", { class:"count-row" });
    for(let i = 0; i < it.a; i++)
      row.appendChild(h("span", { class:"count-item" + (i >= it.a - it.b ? " gone" : "") }, it.icon));
    return row;
  },
  (it) => Speech.speak(numberWord(it.a) + " " + t("minus") + " " + numberWord(it.b)));

const MODE_SEQUENCE = createNumberChoiceMode("sequence", "promptSequence",
  (it) => {
    const row = h("div", { class:"word-line" });
    it.seq.forEach((v, i) => row.appendChild(
      h("div", { class:"ch" + (i === it.gap ? " gap" : "") }, i === it.gap ? "?" : String(v))));
    return row;
  },
  (it) => Speech.speak(it.seq.filter((v,i) => i !== it.gap).map(numberWord).join(", ")));

/** „Къде са повече?“ — избира се групата, не число. */
const MODE_COMPARE = {
  id:"compare", showsPicture:false,
  supports(){ return true; },
  mount(root, host){
    const it = host.item, more = it.a > it.b ? "a" : "b";
    let mistakes = 0, done = false;

    root.appendChild(h("p", { class:"prompt" }, t("promptCompare")));
    const wrap = h("div", { class:"options compare" });
    [["a", it.a], ["b", it.b]].forEach(([key, n]) => {
      const b = h("button", { class:"compare-card", type:"button", "aria-label": numberWord(n) },
        iconRow(it.icon, n));
      b.addEventListener("click", () => {
        if(done) return;
        if(key === more){
          done = true; b.classList.add("right"); Sfx.place();
          setTimeout(() => host.correct(mistakes), 420);
        } else { mistakes++; Sfx.wrong(); shakeEl(b); host.mistake(); }
      });
      wrap.appendChild(b);
    });
    root.appendChild(wrap);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ Speech.speak(t("promptCompare")); return t("hintCountAgain"); }
        const right = Array.from(wrap.children)[more === "a" ? 0 : 1];
        if(right) right.classList.add("right");
        return t("hintHereIs");
      },
      destroy(){}
    };
  }
};
