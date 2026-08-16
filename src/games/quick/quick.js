/* =========================================================================
 * БЪРЗИ ИГРИ
 * -------------------------------------------------------------------------
 * Три кратки игри, които ползват вече наличното съдържание: памет,
 * сортиране по категория и „кое не е на място“.
 *
 * Всичките са без таймер и без край на играта. Сгрешеното се връща
 * обратно и детето опитва пак.
 *
 * Категориите се вземат от речника, но не всяка е ясна за дете на пет.
 * Затова тук стои изричен списък — по-добре шест разбираеми групи,
 * отколкото двайсет и седем спорни.
 * ========================================================================= */

const SORT_GROUPS = ["animals", "food", "vehicles", "clothes", "nature", "home"];

const QUICK_LEVELS = [
  { id:1,  modes:["memory"],           pairs:3, wordsToPass:3 },
  { id:2,  modes:["sort"],             groups:2, items:4, wordsToPass:3 },
  { id:3,  modes:["odd"],              wordsToPass:4 },
  { id:4,  modes:["memory"],           pairs:4, wordsToPass:3 },
  { id:5,  modes:["sort"],             groups:3, items:5, wordsToPass:3 },
  { id:6,  modes:["memory","odd"],     pairs:4, wordsToPass:4 },
  { id:7,  modes:["memory"],           pairs:6, wordsToPass:3, letters:true },
  { id:8,  modes:["sort","odd"],       groups:3, items:6, wordsToPass:4 },
  { id:9,  modes:["memory"],           pairs:6, wordsToPass:3 },
  { id:10, modes:["memory","sort","odd"], pairs:6, groups:3, items:6, wordsToPass:5 }
];

function quickPool(){
  return WORDS.filter(hasPicture);
}

function pickQuickItem(level){
  const kind = rand(level.modes);
  const pool = quickPool();
  if(pool.length < 8) return null;

  if(kind === "memory"){
    const n = level.pairs || 4;
    const picked = shuffle(pool).slice(0, n);
    if(picked.length < n) return null;
    return { kind:"quick", mode:"memory", words: picked, letters: !!level.letters };
  }

  if(kind === "sort"){
    const cats = shuffle(SORT_GROUPS.filter(c => pool.filter(w => w.category === c).length >= 3))
      .slice(0, level.groups || 2);
    if(cats.length < 2) return null;
    const items = [];
    const perCat = Math.max(2, Math.ceil((level.items || 4) / cats.length));
    cats.forEach(c => {
      shuffle(pool.filter(w => w.category === c)).slice(0, perCat).forEach(w => items.push(w));
    });
    if(items.length < cats.length * 2) return null;
    return { kind:"quick", mode:"sort", cats, items: shuffle(items) };
  }

  // odd: три от една категория и едно от друга
  const cats = shuffle(SORT_GROUPS.filter(c => pool.filter(w => w.category === c).length >= 3));
  if(cats.length < 2) return null;
  const main = cats[0], other = cats[1];
  const same = shuffle(pool.filter(w => w.category === main)).slice(0, 3);
  const odd = rand(pool.filter(w => w.category === other));
  if(same.length < 3 || !odd) return null;
  return { kind:"quick", mode:"odd", cat: main, word: odd,
           options: shuffle(same.concat([odd])) };
}

/* ---------------------------------------------------------------------
 * Памет: обръщат се две картички и се търси двойка.
 * Двойката може да е картинка↔дума или картинка↔първа буква.
 * ------------------------------------------------------------------- */
const MODE_MEMORY = {
  id:"memory", showsPicture:false, fullArea:true,
  supports(){ return true; },
  mount(root, host){
    const it = host.item;
    const cards = [];
    it.words.forEach((w, i) => {
      cards.push({ id:i, face:"art", word:w });
      cards.push({ id:i, face: it.letters ? "letter" : "text", word:w });
    });
    const deck = shuffle(cards);
    let open = [], found = 0, mistakes = 0, busy = false;

    root.appendChild(h("p", { class:"prompt" }, t("promptMemory")));
    // Близка до квадрат подредба: 6 картички стават 3×2, 12 стават 4×3.
    const cols = Math.min(4, Math.ceil(Math.sqrt(deck.length)));
    const grid = h("div", { class:"memory-grid", style:{ "--cols": String(cols) } });

    deck.forEach((c) => {
      const el = h("button", { class:"memory-card", type:"button", "aria-label": t("memoryCard") });
      const back = h("span", { class:"card-back" }, "❓");
      const front = h("span", { class:"card-front" });
      if(c.face === "art") front.appendChild(renderArt(c.word));
      else front.appendChild(h("span", { class:"card-text" },
                               c.face === "letter" ? c.word.word.charAt(0) : c.word.word));
      el.append(back, front);
      c.el = el;

      el.addEventListener("click", () => {
        if(busy || el.classList.contains("open") || el.classList.contains("done")) return;
        el.classList.add("open");
        Sfx.tap();
        open.push(c);
        if(open.length < 2) return;
        busy = true;
        const [a, b] = open;
        if(a.id === b.id && a.face !== b.face){
          setTimeout(() => {
            a.el.classList.add("done"); b.el.classList.add("done");
            Sfx.place();
            Speech.speak(a.word.display);
            found++;
            open = []; busy = false;
            if(found >= it.words.length) setTimeout(() => host.correct(mistakes), 500);
          }, 320);
        } else {
          mistakes++;
          host.mistake();
          setTimeout(() => {
            a.el.classList.remove("open"); b.el.classList.remove("open");
            open = []; busy = false;
          }, 800);
        }
      });
      grid.appendChild(el);
    });
    root.appendChild(grid);

    return {
      maxHints: 1,
      hint(){
        // показваме всички за миг — без наказание, това е играта на паметта
        deck.forEach(c => c.el.classList.add("open"));
        setTimeout(() => deck.forEach(c => {
          if(!c.el.classList.contains("done")) c.el.classList.remove("open");
        }), 1100);
        return t("hintLookAgain");
      },
      destroy(){}
    };
  }
};

/* ---------------------------------------------------------------------
 * Сортиране: всяко нещо отива в своята група. Докосване, не влачене —
 * влаченето между кутии е трудно за малка ръка.
 * ------------------------------------------------------------------- */
const MODE_SORT = {
  id:"sort", showsPicture:false, fullArea:true,
  supports(){ return true; },
  mount(root, host){
    const it = host.item;
    let left = it.items.slice(), mistakes = 0, chosen = null;

    root.appendChild(h("p", { class:"prompt" }, t("promptSort")));

    const tray = h("div", { class:"sort-tray" });
    const bins = h("div", { class:"sort-bins" });

    const binOf = {};
    it.cats.forEach(c => {
      const bin = h("button", { class:"sort-bin", type:"button",
                                "aria-label": L().categories[c] || c },
        h("span", { class:"bin-icon" }, CATEGORY_ICONS[c] || "📦"),
        h("span", { class:"bin-name" }, L().categories[c] || c),
        h("span", { class:"bin-items" }));
      bin.addEventListener("click", () => place(c, bin));
      binOf[c] = bin;
      bins.appendChild(bin);
    });

    function paintTray(){
      tray.innerHTML = "";
      left.forEach((w, i) => {
        const b = h("button", { class:"sort-item" + (chosen === w ? " on" : ""),
                                type:"button", "aria-label": w.display });
        b.appendChild(renderArt(w));
        b.addEventListener("click", () => {
          Sfx.tap();
          chosen = (chosen === w) ? null : w;
          Speech.speak(w.display);
          paintTray();
        });
        tray.appendChild(b);
      });
    }

    function place(cat, bin){
      if(!chosen){ Sfx.tap(); return; }
      if(chosen.category === cat){
        const art = renderArt(chosen, "bin-pic");
        bin.querySelector(".bin-items").appendChild(art);
        left = left.filter(w => w !== chosen);
        chosen = null;
        Sfx.place();
        paintTray();
        if(!left.length) setTimeout(() => host.correct(mistakes), 450);
      } else {
        mistakes++;
        Sfx.wrong();
        shakeEl(bin);
        host.mistake();
      }
    }

    paintTray();
    root.append(tray, bins);

    return {
      maxHints: 2,
      hint(){
        if(!left.length) return t("hintHereIs");
        const w = chosen || left[0];
        chosen = w; paintTray();
        binOf[w.category].classList.add("hintful");
        setTimeout(() => binOf[w.category].classList.remove("hintful"), 1400);
        return t("hintSortHere");
      },
      destroy(){}
    };
  }
};

/* ---------------------------------------------------------------------
 * Кое не е на място: три неща от една група и едно чуждо.
 * ------------------------------------------------------------------- */
const MODE_ODD = {
  id:"odd", showsPicture:false,
  supports(){ return true; },
  mount(root, host){
    const it = host.item;
    let mistakes = 0, done = false;

    root.appendChild(h("p", { class:"prompt" }, t("promptOddOne")));
    const opts = h("div", { class:"options" });
    it.options.forEach(w => {
      const b = h("button", { class:"opt-pic", type:"button", "aria-label": w.display });
      b.appendChild(renderArt(w));
      b.addEventListener("click", () => {
        if(done) return;
        if(w.word === it.word.word){
          done = true; b.classList.add("right"); Sfx.place();
          Speech.speak(w.display);
          setTimeout(() => host.correct(mistakes), 520);
        } else { mistakes++; Sfx.wrong(); shakeEl(b); host.mistake(); }
      });
      opts.appendChild(b);
    });
    root.appendChild(opts);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){
          Speech.speak(L().categories[it.cat] || it.cat);
          return t("hintOddGroup") + " " + (L().categories[it.cat] || it.cat) + ".";
        }
        const right = Array.from(opts.children)
          .find(b => b.getAttribute("aria-label") === it.word.display);
        if(right) right.classList.add("right");
        return t("hintHereIs");
      },
      destroy(){}
    };
  }
};

const QUICK_MODES = {};
[MODE_MEMORY, MODE_SORT, MODE_ODD].forEach(m => { QUICK_MODES[m.id] = m; });

/* Икони за кутиите при сортиране. */
const CATEGORY_ICONS = {
  animals:"🐾", food:"🍎", vehicles:"🚗", clothes:"👕", nature:"🌿", home:"🏠",
  objects:"📦", school:"✏️", sport:"⚽", music:"🎵", places:"🏙️", body:"👤"
};
