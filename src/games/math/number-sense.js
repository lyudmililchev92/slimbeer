/* =========================================================================
 * УСЕТ ЗА ЧИСЛА
 * -------------------------------------------------------------------------
 * Сметките са само едната половина. Другата е усетът: колко са, кое идва
 * след кое, коя форма е това, от какво се прави осем.
 *
 * Четирите режима тук ползват същия скелет като аритметичните — въпрос
 * горе, задача в средата, три възможности долу — за да няма шест почти
 * еднакви реализации.
 * ========================================================================= */

/** Рисува форма в SVG. Формите се учат по вид, не по име. */
function shapeSVG(id, size){
  const s = size || 100;
  const box = '0 0 100 100';
  const fill = 'var(--c-primary)';
  const body = {
    circle:    '<circle cx="50" cy="50" r="38"/>',
    square:    '<rect x="14" y="14" width="72" height="72" rx="6"/>',
    rectangle: '<rect x="8" y="26" width="84" height="48" rx="6"/>',
    triangle:  '<path d="M50 12 L90 86 L10 86 Z"/>',
    star:      '<path d="M50 10 L61 39 L92 39 L67 58 L76 88 L50 70 L24 88 L33 58 L8 39 L39 39 Z"/>',
    heart:     '<path d="M50 86 C10 58 12 26 32 22 C42 20 48 28 50 34 C52 28 58 20 68 22 C88 26 90 58 50 86 Z"/>'
  }[id] || '<circle cx="50" cy="50" r="38"/>';
  return '<svg viewBox="' + box + '" width="' + s + '" height="' + s + '" aria-hidden="true" ' +
         'focusable="false" fill="' + fill + '">' + body + '</svg>';
}

/* ---------------------------------------------------------------------
 * Общ скелет: задача горе, три възможности долу.
 * `render` рисува задачата, `option` рисува една възможност.
 * ------------------------------------------------------------------- */
function createSenseMode(id, promptKey, render, option, sayIt){
  return {
    id: id, showsPicture: false,
    supports(){ return true; },
    mount(root, host){
      const it = host.item, answer = mathAnswer(it);
      let mistakes = 0, done = false;

      root.appendChild(h("p", { class:"prompt" }, t(promptKey)));
      root.appendChild(h("div", { class:"math-stage" }, render(it)));

      const optsEl = h("div", { class:"options" });
      it.options.forEach(value => {
        const b = option(value);
        b.addEventListener("click", () => {
          if(done) return;
          if(value === answer){
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
          if(step === 1){ if(sayIt) sayIt(it); return t("hintLookAgain"); }
          const right = Array.from(optsEl.children)
            .find(b => b.dataset.value === String(answer));
          if(right) right.classList.add("right");
          return t("hintHereIs");
        },
        destroy(){}
      };
    }
  };
}

/* --- коя форма е това --------------------------------------------- */
const MODE_SHAPE = createSenseMode("shape", "promptShape",
  (it) => h("div", { class:"shape-target", html: shapeSVG(it.shape, 120) }),
  (value) => {
    const b = h("button", { class:"opt-shape", type:"button",
                            "aria-label": value, html: shapeSVG(value, 72) });
    b.dataset.value = value;
    return b;
  });

/* --- какво следва в редицата -------------------------------------- */
const MODE_PATTERN = createSenseMode("pattern", "promptPattern",
  (it) => {
    const row = h("div", { class:"pattern-row" });
    it.seq.forEach(x => row.appendChild(h("span", { class:"pattern-cell" }, x)));
    row.appendChild(h("span", { class:"pattern-cell q" }, "?"));
    return row;
  },
  (value) => {
    const b = h("button", { class:"opt-icon", type:"button", "aria-label": value }, value);
    b.dataset.value = value;
    return b;
  });

/* --- кое число е това: показва се число, избира се групата ---------- */
const MODE_MATCH = createSenseMode("match", "promptMatch",
  (it) => h("div", { class:"big-number" }, String(it.n)),
  (value) => {
    const b = h("button", { class:"opt-group", type:"button",
                            "aria-label": numberWord(value) });
    b.appendChild(iconRow("⭐", value, "group"));
    b.dataset.value = value;
    return b;
  },
  (it) => Speech.speak(numberWord(it.n)));

/* --- направи числото: 5 + ? = 8 ------------------------------------ */
const MODE_MAKE = {
  id: "build", showsPicture: false,
  supports(){ return true; },
  mount(root, host){
    const it = host.item, answer = mathAnswer(it);
    let mistakes = 0, done = false;

    root.appendChild(h("p", { class:"prompt" },
      t("promptBuild") + " " + it.total + "?"));
    root.appendChild(h("div", { class:"math-stage" },
      h("div", { class:"sum-row" },
        iconRow(it.icon, it.a, "group"),
        h("span", { class:"sum-sign" }, "+"),
        h("span", { class:"sum-q" }, "?"),
        h("span", { class:"sum-sign" }, "="),
        h("span", { class:"sum-total" }, String(it.total)))));

    const optsEl = h("div", { class:"options" });
    numberOptions(answer, 20).forEach(v => {
      const b = h("button", { class:"opt-letter", type:"button",
                              "aria-label": numberWord(v) }, String(v));
      b.dataset.value = String(v);
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
        if(step === 1){
          Speech.speak(numberWord(it.a) + " " + t("plus") + " ? " + t("makes") + " " + numberWord(it.total));
          return t("hintCountAgain");
        }
        const right = Array.from(optsEl.children).find(b => b.textContent === String(answer));
        if(right) right.classList.add("right");
        Speech.speak(numberWord(answer));
        return t("hintHereIs");
      },
      destroy(){}
    };
  }
};
