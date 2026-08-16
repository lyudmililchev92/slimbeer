/* =========================================================================
 * DEBUG (скрит при DEBUG = false)
 * ========================================================================= */
const Debug = {
  el:null,
  mount(){
    if(!DEBUG) return;
    this.el = h("div", { class:"debug-panel" });
    document.body.appendChild(this.el);
    this.update();
  },
  update(){
    if(!DEBUG || !this.el) return;
    const p = State.progress;
    const r = Play.round;
    this.el.innerHTML = "";
    this.el.appendChild(h("div", null,
      "screen: " + State.ui.screen +
      " | " + p.language + " lvl " + LP().currentLevel + " (" + LP().levelProgress + "/" + getLevel(LP().currentLevel).wordsToPass + ")"));
    this.el.appendChild(h("div", null,
      "word: " + (r ? r.word.word + " [" + r.mode.id + "] err:" + r.mistakes + " hint:" + r.hintStep : "—")));
    this.el.appendChild(h("div", null, "stars: " + p.totalStars + " | words: " + WORDS.length + " | voice: " + (Speech.hasVoice() ? "yes" : "no")));
    const row = h("div");
    row.appendChild(btn("lvl −", () => { LP().currentLevel = Math.max(1, LP().currentLevel-1); LP().levelProgress = 0; Store.save(); Router.go("play"); }));
    row.appendChild(btn("lvl +", () => { LP().currentLevel = Math.min(LEVELS.length, LP().currentLevel+1); LP().levelProgress = 0; Store.save(); Router.go("play"); }));
    row.appendChild(btn("skip", () => Play.nextRound(false)));
    row.appendChild(btn("reset", () => { Store.reset(); Router.go("home"); }));
    this.el.appendChild(row);
    function btn(label, fn){
      const b = h("button", { type:"button" }, label);
      b.addEventListener("click", fn);
      return b;
    }
  }
};
