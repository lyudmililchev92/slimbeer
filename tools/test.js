/* Тестове за логиката на Буки.
 *
 *     node tools/test.js
 *
 * Играта няма зависимости и не бива да има. Node се ползва само тук, за
 * разработка — в браузъра нищо от този файл не влиза.
 *
 * Начинът: истинските изходни файлове се изпълняват в чист контекст с
 * няколко подпори вместо браузър. Тоест тестваме кода, който наистина
 * тръгва при детето, а не негово копие.
 */
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = path.join(__dirname, "..");
let passed = 0, failed = 0;

function ok(name, cond, detail){
  if(cond){ passed++; return; }
  failed++;
  console.log("  ✗ " + name + (detail ? "  → " + detail : ""));
}
function group(name){ console.log("\n" + name); }

/* --------------------------------------------------------------------
 * Контекст: подпорите са само толкова, колкото трябва, за да се изпълнят
 * файловете. Ако някой файл започне да иска повече от браузъра, тестът
 * ще гръмне — и това е полезно да се разбере.
 * ------------------------------------------------------------------ */
function loadContext(files){
  const noop = () => {};
  const el = () => ({
    appendChild: noop, addEventListener: noop, setAttribute: noop,
    removeAttribute: noop, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    style: { setProperty: noop, removeProperty: noop }, dataset: {},
    querySelector: () => null, querySelectorAll: () => [], remove: noop,
    getContext: () => null, textContent: "", innerHTML: "", children: []
  });
  const store = {};
  const ctx = {
    console,
    Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, isFinite, parseInt, parseFloat,
    setTimeout: noop, clearTimeout: noop, requestAnimationFrame: noop,
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    },
    document: {
      createElement: el, createElementNS: el, getElementById: () => null,
      addEventListener: noop, querySelector: () => null, querySelectorAll: () => [],
      body: el(), head: el(), documentElement: el()
    },
    navigator: { language: "bg" },
    location: { protocol: "http:", href: "" },
    matchMedia: () => ({ matches: false, addEventListener: noop })
  };
  ctx.window = ctx;
  ctx.self = ctx;
  vm.createContext(ctx);
  // pickWord не пипа режимите, но файлът им прави регистър — стигат подпори
  const STUBS = ["build","syllables","missing","first","listen","read"]
    .map(id => 'var MODE_' + id.toUpperCase() + ' = { id: "' + id + '", supports: function(){ return true; } };')
    .join("\n");
  const src = files.map(f => f === "__mode-stubs__" ? STUBS
    : "/* " + f + " */\n" + fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n");
  vm.runInContext('"use strict";\n' + src + "\nthis.__api = { " + [
    "Mastery", "computeMastery", "skillsForRound", "writingSkill", "weightedPick", "wordWeight",
    "Store", "State", "defaultProgress", "CONFIG", "LANGS",
    "buildWords", "WORD_SOURCE", "MATH_LEVELS", "pickMathItem", "mathAnswer", "numberOptions",
    "pickWord", "wordPool", "LEVELS", "setWords",
    "PHONICS", "phonicsPack", "firstSound", "lastSound", "soundSay",
    "buildPhonicsIndex", "pickPhonicsItem", "phonicsCue"
  ].join(", ") + " };", ctx, { filename: "buki-bundle" });
  return ctx.__api;
}

const CORE = [
  "src/data/word-list.js",
  "src/core/config.js",
  "src/core/art.js",
  "src/data/languages.js",
  "src/data/words.js",
  "src/data/levels-reading.js",
  "src/core/storage.js",
  "src/core/state.js",
  "src/core/mastery.js",
  "src/core/speech.js",
  "src/core/audio.js",
  "src/core/dom.js",
  "src/games/math/generators.js",
  "__mode-stubs__",
  "src/games/reading/reading.js",
  "src/games/phonics/phonics.js",
  "src/data/phonics-bg.js",
  "src/data/phonics-nl.js"
];

const api = loadContext(CORE);
api.State.progress = api.defaultProgress();

/* ==================================================================== */
group("Умения — стойността");

(function(){
  const M = api.Mastery;
  M.all()["t.a"] = undefined; delete M.all()["t.a"];

  // три верни подред вдигат стойността
  let prev = 0, rising = true;
  for(let i = 0; i < 3; i++){
    M.record("t.rise", true, 1000 + i);
    if(M.score("t.rise") <= prev) rising = false;
    prev = M.score("t.rise");
  }
  ok("три верни подред вдигат уменията", rising, "стойност " + prev);
  ok("три верни не значат усвоено", M.band("t.rise") !== "mastered", M.band("t.rise"));

  // после две грешни свалят, но не нулират
  const before = M.score("t.rise");
  M.record("t.rise", false, 2000);
  M.record("t.rise", false, 2001);
  const after = M.score("t.rise");
  ok("две грешки свалят стойността", after < before, before + " → " + after);
  ok("две грешки не изтриват напредъка", after > 0, String(after));
  ok("опитите се пазят", M.get("t.rise").attempts === 5, String(M.get("t.rise").attempts));
  ok("верните се пазят", M.get("t.rise").correct === 3, String(M.get("t.rise").correct));

  // упорито вярно води до усвоено
  for(let i = 0; i < 12; i++) M.record("t.master", true, 3000 + i);
  ok("дълга поредица верни → усвоено", M.band("t.master") === "mastered", M.band("t.master"));

  // упорито грешно
  for(let i = 0; i < 8; i++) M.record("t.weak", false, 4000 + i);
  ok("само грешки → има нужда от упражнение", M.band("t.weak") === "practice", M.band("t.weak"));
  ok("стойността никога не е под нула", M.score("t.weak") >= 0, String(M.score("t.weak")));
  ok("стойността никога не е над едно", M.score("t.master") <= 1, String(M.score("t.master")));

  // невиждано умение
  ok("невиждано умение е «ново»", M.band("t.never") === "new");
  ok("невиждано умение има стойност 0", M.score("t.never") === 0);

  // помни се ограничен брой скорошни
  ok("помнят се най-много 8 скорошни", M.get("t.master").recent.length === 8,
     String(M.get("t.master").recent.length));

  // детерминираност
  const a = api.computeMastery({ attempts: 5, correct: 3, recent: [1,1,1,0,0], mastery: 0, lastSeen: 0 });
  const b = api.computeMastery({ attempts: 5, correct: 3, recent: [1,1,1,0,0], mastery: 0, lastSeen: 0 });
  ok("една и съща поредица дава едно и също число", a === b, a + " / " + b);
})();

/* ==================================================================== */
group("Умения — избор на съдържание");

(function(){
  const M = api.Mastery;
  ok("слабото тежи повече от усвоеното",
     M.weight("t.weak") > M.weight("t.master"),
     M.weight("t.weak").toFixed(2) + " срещу " + M.weight("t.master").toFixed(2));
  ok("невиждано тежи като напълно слабо", M.weight("t.never") === M.weight("t.zero"));

  // претегленият избор наистина изважда по-често тежкото, но не само него
  const items = [{ id: "a", w: 3 }, { id: "b", w: 1 }];
  const seen = { a: 0, b: 0 };
  for(let i = 0; i < 4000; i++) seen[api.weightedPick(items, it => it.w).id]++;
  const ratio = seen.a / seen.b;
  ok("тежкото излиза около три пъти по-често", ratio > 2.4 && ratio < 3.6, ratio.toFixed(2));
  ok("лекото пак излиза", seen.b > 300, String(seen.b));

  // и никога не се задушава: най-слабото не бива да е единственото
  ok("претегленият избор връща нещо и при равни тегла",
     api.weightedPick([{x:1},{x:1}], () => 1) !== null);
  ok("празен списък не чупи", api.weightedPick([], () => 1) === null);

  // думите с непознати букви тежат повече
  api.State.progress.mastery = {};
  for(let i = 0; i < 12; i++) api.Mastery.record("letter.bg.А.recognition", true, i);
  const easy = { word: "АА" }, hard = { word: "ЖЗ" };
  ok("дума с непознати букви тежи повече",
     api.wordWeight(hard, "bg") > api.wordWeight(easy, "bg"),
     api.wordWeight(hard, "bg").toFixed(2) + " срещу " + api.wordWeight(easy, "bg").toFixed(2));
})();

/* ==================================================================== */
group("Умения — имена");

(function(){
  const s = api.skillsForRound;
  ok("първа буква", s({ word: "КОТЕ" }, "first", "bg")[0] === "letter.bg.К.first");
  ok("подреждане дава буквите и дължината",
     s({ word: "КОТЕ" }, "build", "bg").indexOf("reading.bg.length.4") >= 0);
  ok("срички", s({ word: "КОТЕ" }, "syllables", "bg")[0] === "reading.bg.syllables");
  ok("смятане", s({ kind: "add", max: 10 }, null, "bg")[0] === "math.add.10");
  const ph = s({ kind: "phonics", mode: "first", sound: "К", options: [] }, null, "bg");
  ok("звук — не се брои за сметка", ph.indexOf("sound.bg.К") >= 0, ph.join(" "));
  ok("звук — записва се и видът упражнение", ph.indexOf("phonics.bg.first") >= 0, ph.join(" "));
  ok("писане", api.writingSkill("Ж", "bg") === "letter.bg.Ж.writing");
  ok("без дума няма умения", s(null, "build", "bg").length === 0);
  ok("повтарящи се букви не се броят двойно",
     s({ word: "МАМА" }, "build", "bg").filter(x => x.indexOf("letter.") === 0).length === 2);
})();

/* ==================================================================== */
group("Записът — версии и повреди");

(function(){
  const S = api.Store, D = api.defaultProgress;

  const v1 = { version: 1, totalStars: 40, currentLevel: 5, completedWords: 12, words: { КОТЕ: { solved: 2 } } };
  const m1 = S.migrate(v1);
  ok("v1 → сега: звездите оцеляват", m1.totalStars === 40, String(m1.totalStars));
  ok("v1 → сега: нивото оцелява", m1.byLang.bg.words.currentLevel === 5);
  ok("v1 → сега: думите оцеляват", !!m1.byLang.bg.words.words["КОТЕ"]);
  ok("v1 → сега: версията е новата", m1.version === api.CONFIG.saveVersion);
  ok("v1 → сега: уменията са празни, не липсващи", typeof m1.mastery === "object");

  const v3 = { version: 3, totalStars: 7, language: "nl",
               byLang: { nl: { words: { currentLevel: 9, completedWords: 3, words: {}, learnedLetters: {} } } } };
  const m3 = S.migrate(v3);
  ok("v3 → v4: нивото оцелява", m3.byLang.nl.words.currentLevel === 9, String(m3.byLang.nl.words.currentLevel));
  ok("v3 → v4: звездите оцеляват", m3.totalStars === 7);
  ok("v3 → v4: другият език получава празен прогрес", m3.byLang.bg.words.currentLevel === 1);

  const broken = { version: 4, totalStars: 3, mastery: { good: { attempts: 2, correct: 1, recent: [1,0] },
                                                         bad: "не е обект", worse: { attempts: "х" } } };
  const mb = S.migrate(broken);
  ok("счупено умение се изхвърля", !mb.mastery.bad && !mb.mastery.worse);
  ok("здравото умение до него оцелява", !!mb.mastery.good);
  ok("звездите оцеляват въпреки счупеното", mb.totalStars === 3);

  ok("боклук вместо запис не чупи", S.migrate("не е обект").version === api.CONFIG.saveVersion);
  ok("null не чупи", S.migrate(null).version === api.CONFIG.saveVersion);
  ok("непознат език пада към подразбирания", S.migrate({ version: 4, language: "xx" }).language !== "xx");
})();

/* ==================================================================== */
group("Смятане — генераторите");

(function(){
  api.State.progress = api.defaultProgress();
  let bad = [];
  for(const lvl of api.MATH_LEVELS){
    for(let i = 0; i < 500; i++){
      const it = api.pickMathItem(lvl);
      const ans = api.mathAnswer(it);
      if(!it || !it.kind) { bad.push("ниво " + lvl.id + ": празна задача"); break; }
      if(typeof ans !== "number" || !isFinite(ans)) bad.push("ниво " + lvl.id + " " + it.kind + ": отговорът не е число");
      if(!Number.isInteger(ans)) bad.push("ниво " + lvl.id + ": не е цяло — " + ans);
      if(ans < 0) bad.push("ниво " + lvl.id + ": отрицателен отговор " + ans);
      if(ans > 20) bad.push("ниво " + lvl.id + ": отговор " + ans + " над изговорените числа");
      if(lvl.modes.indexOf(it.kind) < 0) bad.push("ниво " + lvl.id + ": непоискан вид " + it.kind);
      const opts = api.numberOptions(ans, 20);
      if(opts.indexOf(ans) < 0) bad.push("ниво " + lvl.id + ": верният отговор липсва сред вариантите");
      if(new Set(opts).size !== opts.length) bad.push("ниво " + lvl.id + ": повтарящи се варианти");
      if(opts.some(v => v < 0)) bad.push("ниво " + lvl.id + ": отрицателен вариант");
    }
  }
  ok("5000 задачи без нито един невалиден отговор", bad.length === 0, bad.slice(0, 3).join(" | "));
})();

/* ====================================================================
 * Това е приемният тест на фазата: слабото умение излиза по-често, но
 * не толкова, че детето да усети разпит. Мери се върху истинския
 * pickWord с десетки хиляди тегления, защото при сто думи разликата
 * потъва в шума.
 * ================================================================== */
group("Умения — адаптивността наистина ли работи");

(function(){
  const level = api.LEVELS.find(l => l.id === 6);
  const az = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ".split("");

  function seed(weak){
    api.State.progress = api.defaultProgress();
    api.State.progress.language = "bg";
    api.State.session.recent = [];
    az.forEach(ch => {
      const w = weak.indexOf(ch) >= 0;
      api.State.progress.mastery["letter.bg." + ch + ".recognition"] = {
        attempts: 10, correct: w ? 2 : 9,
        recent: w ? [0,0,1,0,0,0,1,0] : [1,1,1,0,1,1,1,1],
        mastery: w ? 0.16 : 0.86, lastSeen: 1
      };
    });
  }

  function run(n){
    let hits = 0;
    for(let i = 0; i < n; i++){
      const w = api.pickWord(level);
      if(/[ЖЗ]/.test(w.word)) hits++;
      api.State.session.recent.push(w.word);
      if(api.State.session.recent.length > api.CONFIG.recentMemory) api.State.session.recent.shift();
    }
    return hits / n;
  }

  api.setWords(api.buildWords("bg", () => true));
  const N = 40000;
  seed([]);            const flat = run(N);
  seed(["Ж", "З"]);    const adapted = run(N);
  const lift = adapted / flat;

  console.log("    без адаптация " + (flat*100).toFixed(1) + "%  →  със слаби Ж/З " +
              (adapted*100).toFixed(1) + "%   (×" + lift.toFixed(2) + ")");
  ok("думите с Ж и З излизат по-често, когато те не се удават",
     adapted > flat, (flat * 100).toFixed(1) + "% → " + (adapted * 100).toFixed(1) + "%");
  ok("увеличението е забележимо", lift > 1.10, "×" + lift.toFixed(2));
  ok("увеличението не е задушаващо", lift < 1.90, "×" + lift.toFixed(2));
  ok("останалите думи не изчезват", adapted < 0.45, (adapted * 100).toFixed(1) + "%");

  // и не бива да се повтаря една и съща дума в близките рундове
  seed(["Ж", "З"]);
  const seq = [];
  for(let i = 0; i < 400; i++){
    const w = api.pickWord(level);
    seq.push(w.word);
    api.State.session.recent.push(w.word);
    if(api.State.session.recent.length > api.CONFIG.recentMemory) api.State.session.recent.shift();
  }
  let tooSoon = 0;
  for(let i = 0; i < seq.length; i++)
    for(let j = i + 1; j < Math.min(seq.length, i + api.CONFIG.recentMemory + 1); j++)
      if(seq[i] === seq[j]) tooSoon++;
  ok("нито една дума не се повтаря в рамките на паметта", tooSoon === 0, String(tooSoon));
})();

/* ==================================================================== */
group("Звукове — правилата на езика");

(function(){
  api.State.progress = api.defaultProgress();

  api.State.progress.language = "bg";
  ok("бг: първият звук е първата буква", api.firstSound("КОТЕ", "bg") === "К");
  ok("бг: последният звук е последната буква", api.lastSound("КОТЕ", "bg") === "Е");

  api.State.progress.language = "nl";
  ok("нл: sch е един звук", api.firstSound("SCHAAP", "nl") === "SCH", api.firstSound("SCHAAP", "nl"));
  ok("нл: oe е един звук", api.firstSound("OER", "nl") === "OE", api.firstSound("OER", "nl"));
  ok("нл: ij е един звук", api.firstSound("IJS", "nl") === "IJ", api.firstSound("IJS", "nl"));
  ok("нл: единична буква си остава единична", api.firstSound("MAAN", "nl") === "M");
  ok("нл: ng накрая е един звук", api.lastSound("RING", "nl") === "NG", api.lastSound("RING", "nl"));
  ok("нл: къса дума не се реже погрешно", api.lastSound("EE", "nl") === "E", api.lastSound("EE", "nl"));
  ok("звукът се изговаря фонетично, не като име на буква",
     api.soundSay("M", "nl") === "mmm", api.soundSay("M", "nl"));
})();

/* ==================================================================== */
group("Звукове — задачите");

(function(){
  const problems = [];
  let made = 0;
  const byMode = {};

  for(const lang of ["bg", "nl"]){
    api.State.progress = api.defaultProgress();
    api.State.progress.language = lang;
    api.setWords(api.buildWords(lang, () => true));
    api.buildPhonicsIndex(lang);
    const levels = api.phonicsPack(lang).levels;

    for(const lvl of levels){
      let nulls = 0;
      for(let i = 0; i < 300; i++){
        const it = api.pickPhonicsItem(lvl);
        if(!it){ nulls++; continue; }
        made++;
        byMode[it.mode] = (byMode[it.mode] || 0) + 1;
        if(lvl.modes.indexOf(it.mode) < 0) problems.push(lang + "/" + lvl.id + ": непоискан вид " + it.mode);
        if(!it.target || !it.target.word) problems.push(lang + "/" + lvl.id + ": няма целева дума");
        if(!it.options || it.options.length < 3) problems.push(lang + "/" + lvl.id + ": под три възможности");
        const ids = it.options.map(o => o.word);
        if(new Set(ids).size !== ids.length) problems.push(lang + "/" + lvl.id + ": повтарящa се възможност");
        if(ids.indexOf(it.target.word) < 0) problems.push(lang + "/" + lvl.id + ": верният отговор липсва");
        if(it.options.some(o => !o.emoji && !o.art)) problems.push(lang + "/" + lvl.id + ": възможност без картинка");
        if(it.target.word.length > (lvl.maxLen || 99)) problems.push(lang + "/" + lvl.id + ": дума над позволената дължина");
        // подсказката трябва да е нещо изговоримо
        const cue = api.phonicsCue(it);
        if(!cue || !String(cue).trim()) problems.push(lang + "/" + lvl.id + ": празна подсказка");
        // при "коя не е на място" верният отговор е различната дума
        if(it.mode === "odd"){
          const same = it.options.filter(o => api.firstSound(o, lang) === it.sound).length;
          if(same !== 3) problems.push(lang + "/" + lvl.id + ": «не е на място» няма точно три еднакви");
        }
        if(it.mode === "first"){
          const ok2 = api.firstSound(it.target, lang) === it.sound;
          const others = it.options.filter(o => o.word !== it.target.word)
            .every(o => api.firstSound(o, lang) !== it.sound);
          if(!ok2 || !others) problems.push(lang + "/" + lvl.id + ": началният звук не е еднозначен");
        }
        if(it.mode === "last"){
          const others = it.options.filter(o => o.word !== it.target.word)
            .every(o => api.lastSound(o, lang) !== it.sound);
          if(!others) problems.push(lang + "/" + lvl.id + ": крайният звук не е еднозначен");
        }
        if(it.mode === "blend" && it.parts.join("") !== it.target.word)
          problems.push(lang + "/" + lvl.id + ": звуковете не дават думата");
        if(it.mode === "syllable" && it.parts.join("") !== it.target.word)
          problems.push(lang + "/" + lvl.id + ": сричките не дават думата");
      }
      if(nulls > 150) problems.push(lang + "/" + lvl.id + ": ниво без достатъчно задачи (" + nulls + "/300 празни)");
    }
  }
  ok(made + " задачи по звукове без нито един проблем", problems.length === 0,
     [...new Set(problems)].slice(0, 4).join(" | "));
  ok("всичките шест вида упражнения се появяват", Object.keys(byMode).length === 6,
     Object.keys(byMode).join(" "));
})();

/* ==================================================================== */
group("Речникът — построяване");

(function(){
  for(const lang of ["bg", "nl"]){
    const words = api.buildWords(lang, () => true);
    ok(lang + ": речникът е над 1000 думи", words.length > 1000, String(words.length));
    const az = new Set(api.LANGS[lang].alphabet);
    const outside = words.filter(w => [...w.word].some(c => !az.has(c)));
    ok(lang + ": няма буква извън азбуката", outside.length === 0,
       outside.slice(0, 3).map(w => w.word).join(", "));
    const broken = words.filter(w => w.syllables.join("") !== w.word);
    ok(lang + ": сричките дават думата", broken.length === 0, broken.slice(0, 3).map(w => w.word).join(", "));
    const noPic = words.filter(w => !w.audioOnly && !w.emoji && !w.art);
    ok(lang + ": всяка дума има картинка или е озвучена", noPic.length === 0,
       noPic.slice(0, 3).map(w => w.word).join(", "));
    const dup = new Set(), twice = words.filter(w => dup.has(w.word) || (dup.add(w.word), false));
    ok(lang + ": няма повторени думи", twice.length === 0, twice.slice(0, 3).map(w => w.word).join(", "));
  }
})();

/* ==================================================================== */
console.log("\n" + (failed ? "ПАДНАЛИ: " + failed + " от " + (passed + failed)
                           : "всички " + passed + " проверки минаха"));
process.exit(failed ? 1 : 0);
