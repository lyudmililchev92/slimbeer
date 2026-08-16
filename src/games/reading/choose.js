/** Режим „Липсваща буква“. */
const MODE_MISSING = {
  id:"missing", showsPicture:true,
  supports(word){ return word.word.length >= 3; },
  mount(root, host){
    const letters = host.word.word.split("");
    const gapIndex = 1 + Math.floor(Math.random() * (letters.length - 2)); // не първата и не последната
    const answer = letters[gapIndex];

    const lineEl = h("div", { class:"word-line", "aria-label":t("promptMissing") });
    let gapEl = null;
    letters.forEach((ch, i) => {
      if(i === gapIndex){
        gapEl = h("div", { class:"ch gap", "aria-label":t("promptMissing") }, "?");
        lineEl.appendChild(gapEl);
      } else {
        lineEl.appendChild(h("div", { class:"ch" }, ch));
      }
    });

    const distractors = shuffle(L().alphabet.filter(l => l !== answer)).slice(0, 2);
    const options = shuffle([answer].concat(distractors));
    const optsEl = h("div", { class:"options" });
    let mistakes = 0, done = false;

    options.forEach(l => {
      const b = h("button", { class:"opt-letter", type:"button", "aria-label":t("letterLabel") + " " + l }, l);
      b.addEventListener("click", () => {
        if(done) return;
        if(l === answer){
          done = true;
          b.classList.add("right");
          gapEl.textContent = l;
          gapEl.classList.add("filled");
          Sfx.place();
          setTimeout(() => host.correct(mistakes), 420);
        } else {
          mistakes++;
          Sfx.wrong();
          shakeEl(b);
          host.mistake();
        }
      });
      optsEl.appendChild(b);
    });

    root.appendChild(h("p", { class:"prompt" }, t("promptMissing")));
    root.appendChild(lineEl);
    root.appendChild(optsEl);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ host.speakWord(); return t("hintListen"); }
        const right = Array.from(optsEl.children).find(b => b.textContent === answer);
        if(right) right.classList.add("right");
        return t("hintHereIs");
      },
      destroy(){}
    };
  }
};

/** Режим „С коя буква започва?“. */
const MODE_FIRST = {
  id:"first", showsPicture:true,
  supports(){ return true; },
  mount(root, host){
    const answer = host.word.word[0];
    const distractors = shuffle(L().alphabet.filter(l => l !== answer)).slice(0, 2);
    const options = shuffle([answer].concat(distractors));
    const optsEl = h("div", { class:"options" });
    let mistakes = 0, done = false;

    options.forEach(l => {
      const b = h("button", { class:"opt-letter", type:"button", "aria-label":t("letterLabel") + " " + l }, l);
      b.addEventListener("click", () => {
        if(done) return;
        if(l === answer){
          done = true;
          b.classList.add("right");
          Sfx.place();
          setTimeout(() => host.correct(mistakes), 420);
        } else {
          mistakes++; Sfx.wrong(); shakeEl(b); host.mistake();
        }
      });
      optsEl.appendChild(b);
    });

    root.appendChild(h("p", { class:"prompt" }, t("promptFirst") + " " + host.word.word + "?"));
    root.appendChild(optsEl);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ host.speakWord(); return t("hintListenStart"); }
        const right = Array.from(optsEl.children).find(b => b.textContent === answer);
        if(right) right.classList.add("right");
        Speech.speak(L().letterSound[answer] || answer);
        return t("hintStartsWith") + " " + answer + ".";
      },
      destroy(){}
    };
  }
};

/** Режим „Чуй думата“ — показва 3 картинки, детето избира правилната. */
const MODE_LISTEN = {
  id:"listen", showsPicture:false,
  supports(word){ return !word.audioOnly && pictureWords().length >= 3 &&
                       Speech.supported && Speech.hasVoice(); },
  mount(root, host){
    // Само думи с картинка: озвучената дума няма какво да покаже и
    // на екрана се появяваше "undefined" вместо трета картинка.
    const others = shuffle(WORDS.filter(w => hasPicture(w) && w.word !== host.word.word)).slice(0, 2);
    const choices = shuffle([host.word].concat(others));
    let mistakes = 0, done = false;

    const listen = h("button", { class:"big-listen", type:"button", "aria-label":t("listenLabel") }, "🔊");
    listen.addEventListener("click", () => host.speakWord());
    root.appendChild(listen);
    root.appendChild(h("p", { class:"prompt" }, t("promptListen")));

    const optsEl = h("div", { class:"options" });
    choices.forEach(w => {
      const b = h("button", { class:"opt-pic", type:"button", "aria-label":w.display });
      b.appendChild(renderArt(w));
      b.addEventListener("click", () => {
        if(done) return;
        if(w.word === host.word.word){
          done = true;
          b.classList.add("right");
          Sfx.place();
          setTimeout(() => host.correct(mistakes), 420);
        } else {
          mistakes++; Sfx.wrong(); shakeEl(b); host.mistake();
        }
      });
      optsEl.appendChild(b);
    });
    root.appendChild(optsEl);
    setTimeout(() => host.speakWord(), 500);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ host.speakWord(); return t("hintListenAgain"); }
        const right = Array.from(optsEl.children)[choices.findIndex(w => w.word === host.word.word)];
        if(right) right.classList.add("right");
        return t("hintFound");
      },
      destroy(){}
    };
  }
};


/** Режим „Чети думата“ — показва думата с букви, детето избира картинката.
    Обратното на „Чуй думата“: тук се чете, не се слуша. */
const MODE_READ = {
  id:"read", showsPicture:false,
  supports(word){ return !word.audioOnly && pictureWords().length >= 3 && word.word.length >= 3; },
  mount(root, host){
    const others = shuffle(WORDS.filter(w => hasPicture(w) && w.word !== host.word.word &&
      Math.abs(w.word.length - host.word.word.length) <= 2)).slice(0, 2);
    const choices = shuffle([host.word].concat(others));
    let mistakes = 0, done = false;

    root.appendChild(h("p", { class:"prompt" }, t("promptRead")));
    const big = h("div", { class:"read-word", "aria-label":host.word.word }, host.word.word);
    root.appendChild(big);

    const optsEl = h("div", { class:"options" });
    choices.forEach(w => {
      const b = h("button", { class:"opt-pic", type:"button", "aria-label":w.display });
      b.appendChild(renderArt(w));
      b.addEventListener("click", () => {
        if(done) return;
        if(w.word === host.word.word){
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
        if(step === 1){ host.speakWord(); return t("hintListen"); }
        const right = Array.from(optsEl.children)[choices.findIndex(w => w.word === host.word.word)];
        if(right) right.classList.add("right");
        return t("hintFound");
      },
      destroy(){}
    };
  }
};
