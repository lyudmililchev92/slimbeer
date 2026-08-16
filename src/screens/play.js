function currentTrack(){ return TRACKS[State.session.track] || TRACKS.words; }

const Play = {
  root:null, els:null, round:null,

  render(params){
    // Обучението е за пътя с думите — смятането се разбира от само себе си.
    const tutorial = State.session.track === "words" && !State.progress.tutorialCompleted;
    const screen = h("section", { class:"screen play" });

    /* --- топ лента --- */
    const starsVal = h("span", null, String(State.progress.totalStars));
    const starsChip = h("div", { class:"stars-chip", "aria-label":t("stars") }, "⭐", starsVal);
    const progFill = h("div", { class:"progress-fill" });
    const progress = h("div", {
      class:"progress", role:"progressbar", "aria-label":t("level"),
      "aria-valuemin":"0", "aria-valuemax":"100", "aria-valuenow":"0"
    }, progFill);
    const soundBtn = h("button", { class:"icon-btn", type:"button", "aria-label":t("sound") });
    soundBtn.textContent = State.progress.soundEnabled ? "🔊" : "🔇";
    soundBtn.addEventListener("click", () => {
      State.progress.soundEnabled = !State.progress.soundEnabled;
      soundBtn.textContent = State.progress.soundEnabled ? "🔊" : "🔇";
      if(!State.progress.soundEnabled) Speech.stop(); else Sfx.tap();
      Store.save();
    });

    const topbar = h("header", { class:"topbar" },
      backButton(() => Router.go("home")),
      starsChip, progress, soundBtn
    );

    /* --- сцена --- */
    const picHolder = h("div", { class:"stage-visual" });
    const playArea  = h("div", { class:"stage-play" });
    const stage = h("main", { class:"stage" }, picHolder, playArea);

    /* --- долна лента: помощ --- */
    const hintBtn = h("button", { class:"btn hint-btn", type:"button", "aria-label":t("hint") },
      h("span", { class:"em" }, "💡"), t("hint"));
    hintBtn.addEventListener("click", () => Play.useHint());
    const actionbar = h("footer", { class:"actionbar" }, hintBtn);

    /* --- маскот с балонче --- */
    const bubble = h("div", { class:"bubble" }, "");
    const mascot = h("div", { class:"mascot-talk", hidden:true, "aria-live":"polite" },
      h("div", { class:"m-svg", html: mascotSVG() }), bubble);

    /* --- overlay за успех --- */
    const confetti = h("canvas", { id:"confetti", hidden:true });
    const okWord   = h("div", { class:"big-word" }, "");
    const okPraise = h("div", { class:"praise" }, "");
    const okStars  = h("div", { class:"star-row", "aria-label":t("stars") });
    const okNext   = h("div", { class:"next-wrap" });
    const overlay  = h("div", { class:"overlay", hidden:true, role:"dialog", "aria-label":t("wellDone") },
      okPraise, okStars, okWord, okNext);

    screen.append(topbar, stage, actionbar, mascot, overlay, confetti);
    this.els = { screen, starsChip, starsVal, progFill, progress, picHolder, playArea,
                 hintBtn, mascot, bubble, overlay, okWord, okPraise, okStars, okNext, confetti, soundBtn };
    this.root = screen;
    this.updateTop();
    this.nextRound(tutorial);
    return screen;
  },

  updateTop(){
    const lp = LP();
    const lv = getLevel(lp.currentLevel);
    const pct = Math.min(100, Math.round(lp.levelProgress / lv.wordsToPass * 100));
    this.els.starsVal.textContent = String(State.progress.totalStars);
    this.els.progFill.style.width = pct + "%";
    this.els.progress.setAttribute("aria-valuenow", String(pct));
  },

  setBubble(text){
    if(!text){ this.els.mascot.hidden = true; return; }
    this.els.bubble.textContent = text;
    this.els.mascot.hidden = false;
  },

  nextRound(tutorial){
    const els = this.els;
    els.overlay.hidden = true;
    els.okNext.innerHTML = "";
    els.okStars.innerHTML = "";
    els.picHolder.innerHTML = "";
    els.playArea.innerHTML = "";
    els.playArea.style.removeProperty("--tile");
    this.setBubble(null);
    if(this.round && this.round.instance && this.round.instance.destroy) this.round.instance.destroy();

    const track = currentTrack();
    const lp = LP();
    const level = getLevel(lp.currentLevel);
    let item, mode;
    if(tutorial){
      // Котето има рисувана илюстрация и е кратка дума и на двата езика.
      item = WORDS.find(w => w.art === "cat") || wordPool(getLevel(1))[0] || WORDS[0];
      mode = MODES.build;
    } else {
      item = track.pickItem(level);
      mode = track.pickMode(level, item, lp.levelProgress === 0);
    }

    const key = track.itemKey(item);
    State.session.recent.push(key);
    if(State.session.recent.length > CONFIG.recentMemory) State.session.recent.shift();
    lp.attempts += 1;
    Store.save();

    const host = {
      item: item,
      word: item,                 // пътят с думите чете host.word
      tutorial: !!tutorial,
      mistake: () => Play.onMistake(),
      correct: (mistakes) => Play.onCorrect(mistakes),
      speakWord: () => Play.speakWord(),
      setBubble: (t2) => Play.setBubble(t2)
    };

    this.round = { item, word:item, mode, instance:null, mistakes:0, hintStep:0, tutorial:!!tutorial };

    els.playArea.classList.toggle("full", !!mode.fullArea);
    els.screen.classList.toggle("stage-full", !!mode.fullArea);
    if(mode.showsPicture) els.picHolder.appendChild(this.buildPicture(item));

    if(item.word){                // размер на плочките спрямо дължината на думата
      const count = mode.id === "syllables" ? item.syllables.length : item.word.length;
      els.playArea.style.setProperty("--tile", tileSizeFor(count, mode.id === "syllables"));
    }

    this.round.instance = mode.mount(els.playArea, host);
    els.hintBtn.hidden = false;

    this.makePromptSpeakable();
    if(tutorial){
      this.setBubble(t("mascotHello"));
      setTimeout(() => this.announceRound(true), 900);
    } else if(!mode.fullArea){
      // Въпросът се чете винаги: детето не може да го прочете само.
      // Думата се добавя само когато и без това щеше да се изговори —
      // при картинка тя вече казва коя е думата.
      const alsoWord = mode.showsPicture && (State.progress.autoSpeak || item.audioOnly);
      setTimeout(() => this.announceRound(alsoWord), 450);
    }
    if(DEBUG) Debug.update();
  },

  /* Въпросът се докосва, за да се чуе пак. Децата го искат по няколко пъти. */
  makePromptSpeakable(){
    const el = this.els && this.els.playArea.querySelector(".prompt");
    if(!el || el.dataset.speakable) return;
    el.dataset.speakable = "1";
    el.classList.add("say");
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", el.textContent.trim() + " — " + t("listenLabel"));
    const again = () => { Sfx.tap(); const q = this.questionText(); if(q) Speech.speak(q); };
    el.addEventListener("click", again);
    el.addEventListener("keydown", (e) => {
      if(e.key === " " || e.key === "Enter"){ e.preventDefault(); again(); }
    });
  },

  buildPicture(word){
    if(word.audioOnly){
      // Няма картинка — думата се чува. Бутонът е и подканата, и помощта.
      const b = h("button", { class:"big-listen", type:"button", "aria-label":t("listenLabel") }, "🔊");
      b.addEventListener("click", () => this.speakWord());
      this.picCard = null;
      return b;
    }
    const accent = CATEGORY_ACCENTS[word.category];
    const card = h("button", {
      class:"pic-card", type:"button",
      style:{ "--acc": accent || "var(--c-primary)" },
      "aria-label":t("picture")
    });
    card.appendChild(renderArt(word));
    card.appendChild(h("div", { class:"speaker" }, "🔊"));
    card.addEventListener("click", () => this.speakPicture());
    this.picCard = card;
    return card;
  },

  /* Текстът на въпроса, както детето го вижда на екрана. */
  questionText(){
    const p = this.els && this.els.playArea.querySelector(".prompt");
    return p ? p.textContent.replace(/\s+/g, " ").trim() : "";
  },

  /* Какво се чува освен въпроса: думата, а при смятане — самата сметка. */
  itemSpeech(){
    const r = this.round;
    if(!r) return "";
    if(State.session.track === "math"){
      const it = r.item;
      if(it.kind === "add") return numberWord(it.a) + " " + t("plus") + " " + numberWord(it.b);
      if(it.kind === "sub") return numberWord(it.a) + " " + t("minus") + " " + numberWord(it.b);
      return "";
    }
    return r.word.display || "";
  },

  /* Въпрос и задача в едно изречение. Един utterance, защото всяко ново
     повикване на Speech.speak() прекъсва предишното. */
  questionSpeech(withItem){
    const q = this.questionText();
    const item = withItem ? this.itemSpeech() : "";
    if(!q) return item;
    if(!item) return q;
    // "С коя буква започва КОТЕ?" вече съдържа думата — не я казваме два пъти.
    if(q.toUpperCase().indexOf(String(item).toUpperCase()) >= 0) return q;
    return q + " " + item;
  },

  /* Прочита въпроса на глас. Детето още не чете, затова това е
     единственият начин да разбере какво се иска от него. */
  announceRound(withItem){
    const text = this.questionSpeech(withItem);
    if(text) Speech.speak(text);
  },

  /* Докосване по картинката. При подреждане на цялата нарисувана дума
     картинката е самата дума, затова там казва нея, а не въпроса. */
  speakPicture(){
    const r = this.round;
    if(!r) return;
    if(r.mode && r.mode.wholeWord) return this.speakWord();
    const text = this.questionSpeech(true);
    if(!text) return this.speakWord();
    if(this.picCard){
      this.picCard.classList.remove("speaking");
      void this.picCard.offsetWidth;
      this.picCard.classList.add("speaking");
    }
    if(Speech.supported && Speech.hasVoice()) Speech.speak(text);
    else Sfx.star();
  },

  speakWord(){
    if(!this.round) return;
    if(State.session.track === "math"){
      const it = this.round.item;
      if(it.kind === "add")      Speech.speak(numberWord(it.a) + " " + t("plus") + " " + numberWord(it.b));
      else if(it.kind === "sub") Speech.speak(numberWord(it.a) + " " + t("minus") + " " + numberWord(it.b));
      else                       Sfx.star();
      return;
    }
    if(this.picCard){
      this.picCard.classList.remove("speaking");
      void this.picCard.offsetWidth;
      this.picCard.classList.add("speaking");
    }
    if(Speech.supported && Speech.hasVoice()){
      Speech.speak(this.round.word.display);
    } else {
      Sfx.star();   // няма български глас → поне звуков сигнал, играта продължава
    }
  },

  useHint(){
    if(!this.round || !this.round.instance) return;
    const inst = this.round.instance;
    this.round.hintStep = Math.min(this.round.hintStep + 1, inst.maxHints || 3);
    Sfx.tap();
    const msg = inst.hint(this.round.hintStep);
    if(msg) this.setBubble(msg);
    setTimeout(() => { if(this.els.bubble.textContent === msg) this.setBubble(null); }, 3200);
  },

  onMistake(){
    if(!this.round) return;
    this.round.mistakes++;
    if(this.round.mistakes === CONFIG.mistakesForHighlight){
      this.setBubble(t("tryAgain"));
      setTimeout(() => this.setBubble(null), 2600);
    }
  },

  onCorrect(modeMistakes){
    const r = this.round;
    if(!r) return;
    const mistakes = Math.max(r.mistakes, modeMistakes || 0);

    if(r.tutorial){
      State.progress.tutorialCompleted = true;
      Store.save();
      this.showSuccess(r.item, 3, false, true);
      return;
    }
    const res = recordResult(r.item, mistakes, r.hintStep, r.mode && r.mode.id);
    State.session.solvedInSession += 1;
    this.updateTop();
    this.els.starsChip.classList.remove("bump");
    void this.els.starsChip.offsetWidth;
    this.els.starsChip.classList.add("bump");
    this.showSuccess(r.item, res.stars, res.leveledUp, false);
  },

  showSuccess(word, stars, leveledUp, isTutorial){
    const els = this.els;
    els.hintBtn.hidden = true;
    this.setBubble(null);
    Sfx.success();

    els.okPraise.textContent = isTutorial ? t("greatJob") : rand(L().praise);
    els.okWord.textContent = word.word ? word.word : String(mathAnswer(word));
    els.okStars.innerHTML = "";
    for(let i = 0; i < 3; i++){
      els.okStars.appendChild(h("span", { class: i < stars ? "" : "dim" }, "⭐"));
    }
    els.okNext.innerHTML = "";
    els.overlay.hidden = false;
    runConfetti(els.confetti);
    setTimeout(() => Speech.speak(word.display || numberWord(mathAnswer(word))), 500);

    setTimeout(() => {
      const label = isTutorial ? t("letsPlay") : t("next");
      const btn = h("button", { class:"btn btn-primary btn-huge", type:"button" }, label, " →");
      btn.addEventListener("click", () => {
        Sfx.tap();
        if(leveledUp){ Play.showLevelUp(); return; }
        if(!isTutorial && State.session.solvedInSession > 0 &&
           State.session.solvedInSession % CONFIG.celebrateEvery === 0){
          Play.showCelebration();
          return;
        }
        Play.nextRound(false);
      });
      els.okNext.appendChild(btn);
      btn.focus();
    }, CONFIG.nextDelay);
  },

  /** Малък празник на всеки N думи. */
  showCelebration(){
    const els = this.els;
    els.okPraise.textContent = t("fantastic");
    els.okWord.textContent = State.session.solvedInSession + " " + t("solvedWords");
    els.okStars.innerHTML = "";
    els.okStars.appendChild(h("span", null, "🎉"));
    els.okNext.innerHTML = "";
    els.overlay.hidden = false;
    runConfetti(els.confetti);
    Sfx.levelUp();
    const btn = h("button", { class:"btn btn-success btn-huge", type:"button" }, t("carryOn") + " →");
    btn.addEventListener("click", () => { Sfx.tap(); Play.nextRound(false); });
    els.okNext.appendChild(btn);
    btn.focus();
  },

  showLevelUp(){
    const els = this.els;
    const lv = getLevel(LP().currentLevel);
    els.okPraise.textContent = t("newLevel");
    els.okWord.textContent = levelName(LP().currentLevel);
    els.okStars.innerHTML = "";
    els.okStars.appendChild(h("span", null, "🏆"));
    els.okNext.innerHTML = "";
    els.overlay.hidden = false;
    runConfetti(els.confetti);
    Sfx.levelUp();
    Speech.speak(t("newLevel"));
    const btn = h("button", { class:"btn btn-success btn-huge", type:"button" }, t("onward") + " →");
    btn.addEventListener("click", () => { Sfx.tap(); Play.nextRound(false); });
    els.okNext.appendChild(btn);
    btn.focus();
  },

  destroy(){
    if(this.round && this.round.instance && this.round.instance.destroy) this.round.instance.destroy();
    this.round = null; this.picCard = null;
    Speech.stop();
  }
};

/** По-дълга дума → по-малки плочки, за да няма скролиране. */
function tileSizeFor(count, wide){
  const n = wide ? count * 1.6 : count;
  if(n <= 4) return "clamp(56px, 15vmin, 88px)";
  if(n <= 6) return "clamp(48px, 12.5vmin, 76px)";
  if(n <= 8) return "clamp(42px, 10.5vmin, 64px)";
  return "clamp(36px, 9vmin, 56px)";
}
