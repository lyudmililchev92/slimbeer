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
    "buildPhonicsIndex", "pickPhonicsItem", "phonicsCue",
    "STORIES", "STORY_LEVELS", "pickStory", "storyPack",
    "STROKES", "strokesFor", "hasStrokes", "createStrokeTracker", "strokeCheckpoints",
    "FOREST_FRIENDS", "FOREST_THEMES", "FOREST_BIOME_COUNT"
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
  "src/data/forest-world.js",
  "src/data/forest-friends.js",
  "src/games/writing/strokes.js",
  "src/data/strokes-latin.js",
  "src/data/strokes-cyrillic.js",
  "src/games/reading/stories.js",
  "src/data/stories-bg.js",
  "src/data/stories-nl.js",
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
  const bad = [];
  const seenKinds = {};
  const NUMERIC = ["count", "add", "sub", "sequence", "compare", "match", "build"];

  for(const lvl of api.MATH_LEVELS){
    for(let i = 0; i < 600; i++){
      const it = api.pickMathItem(lvl);
      if(!it || !it.kind){ bad.push("ниво " + lvl.id + ": празна задача"); break; }
      seenKinds[it.kind] = (seenKinds[it.kind] || 0) + 1;
      if(lvl.modes.indexOf(it.kind) < 0) bad.push("ниво " + lvl.id + ": непоискан вид " + it.kind);
      const ans = api.mathAnswer(it);

      if(NUMERIC.indexOf(it.kind) >= 0){
        if(typeof ans !== "number" || !isFinite(ans)) bad.push("ниво " + lvl.id + " " + it.kind + ": отговорът не е число");
        else {
          if(!Number.isInteger(ans)) bad.push("ниво " + lvl.id + ": не е цяло — " + ans);
          if(ans < 0) bad.push("ниво " + lvl.id + " " + it.kind + ": отрицателен отговор " + ans);
          if(ans > 20) bad.push("ниво " + lvl.id + ": отговор " + ans + " над изговорените числа");
        }
      } else if(typeof ans !== "string" || !ans){
        bad.push("ниво " + lvl.id + " " + it.kind + ": отговорът не е стойност");
      }

      // задачите със собствени възможности
      if(it.options){
        if(it.options.length < 3) bad.push("ниво " + lvl.id + " " + it.kind + ": под три възможности");
        if(new Set(it.options).size !== it.options.length) bad.push("ниво " + lvl.id + " " + it.kind + ": повтарящa се възможност");
        if(it.options.indexOf(ans) < 0) bad.push("ниво " + lvl.id + " " + it.kind + ": верният отговор липсва");
      } else {
        const opts = api.numberOptions(ans, 20);
        if(opts.indexOf(ans) < 0) bad.push("ниво " + lvl.id + ": верният отговор липсва сред числата");
        if(new Set(opts).size !== opts.length) bad.push("ниво " + lvl.id + ": повтарящи се числа");
        if(opts.some(v => v < 0)) bad.push("ниво " + lvl.id + ": отрицателно число сред вариантите");
      }

      // всеки вид със своите изисквания
      if(it.kind === "sub" && it.a - it.b < 0) bad.push("ниво " + lvl.id + ": изваждане под нулата");
      if(it.kind === "add" && it.a + it.b > lvl.max) bad.push("ниво " + lvl.id + ": събиране над тавана");
      if(it.kind === "compare" && it.a === it.b) bad.push("ниво " + lvl.id + ": сравняване на равни групи");
      if(it.kind === "build"){
        if(it.a >= it.total) bad.push("ниво " + lvl.id + ": „направи“ без какво да се добави");
        if(it.total > lvl.max) bad.push("ниво " + lvl.id + ": „направи“ над тавана");
      }
      if(it.kind === "pattern"){
        // редицата наистина трябва да се повтаря, иначе отговорът е гадаене
        const period = new Set(it.seq).size;
        if(it.seq.length % period !== 0) bad.push("ниво " + lvl.id + ": редицата не се затваря");
        for(let k = period; k < it.seq.length; k++)
          if(it.seq[k] !== it.seq[k - period]) bad.push("ниво " + lvl.id + ": редицата не се повтаря");
        if(it.answer !== it.seq[it.seq.length % period]) bad.push("ниво " + lvl.id + ": грешно следващо в редицата");
      }
      if(it.kind === "shape" && it.options.indexOf(it.shape) < 0)
        bad.push("ниво " + lvl.id + ": формата липсва сред възможностите");
    }
  }
  ok("9000 задачи без нито един невалиден отговор", bad.length === 0,
     [...new Set(bad)].slice(0, 3).join(" | "));
  ok("всичките девет вида задачи се появяват", Object.keys(seenKinds).length === 9,
     Object.keys(seenKinds).sort().join(" "));
  ok("има нива и с усет за числа, и с аритметика",
     api.MATH_LEVELS.length >= 15, String(api.MATH_LEVELS.length));
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
group("Разказчета");

(function(){
  const bad = [];
  const ids = new Set();
  let total = 0, questions = 0;

  for(const lang of ["bg", "nl"]){
    const pack = api.STORIES[lang];
    if(!pack || !pack.length){ bad.push(lang + ": няма разказчета"); continue; }
    pack.forEach(st => {
      total++;
      const where = lang + "/" + st.id;
      if(!st.id) bad.push(lang + ": разказче без id");
      if(ids.has(lang + st.id)) bad.push(where + ": повторено id");
      ids.add(lang + st.id);
      if(!st.title || !st.title.trim()) bad.push(where + ": без заглавие");
      if(!st.scene) bad.push(where + ": без картинка");
      if(!(st.level >= 1 && st.level <= 6)) bad.push(where + ": ниво извън 1..6");
      if(!Array.isArray(st.sentences) || st.sentences.length < 2) bad.push(where + ": под две изречения");
      st.sentences.forEach(x => {
        if(!x || !x.trim()) bad.push(where + ": празно изречение");
        if(!/[.!?]$/.test(x.trim())) bad.push(where + ": изречение без препинателен знак → " + x);
      });
      // дължината трябва да расте с нивото, иначе прогресията е измислена
      if(st.level <= 2 && st.sentences.length > 4) bad.push(where + ": твърде дълго за ниво " + st.level);
      if(st.level >= 5 && st.sentences.length < 6) bad.push(where + ": твърде късо за ниво " + st.level);
      if(!Array.isArray(st.questions) || !st.questions.length) bad.push(where + ": без въпроси");
      (st.questions || []).forEach((q, i) => {
        questions++;
        const w2 = where + " въпрос " + (i + 1);
        if(!q.text || !q.text.trim()) bad.push(w2 + ": без текст");
        if(!Array.isArray(q.answers) || q.answers.length < 3) bad.push(w2 + ": под три отговора");
        if(new Set(q.answers).size !== q.answers.length) bad.push(w2 + ": повтарящ се отговор");
        if(!(q.correct >= 0 && q.correct < (q.answers || []).length)) bad.push(w2 + ": верният отговор сочи никъде");
        (q.answers || []).forEach(a => { if(!a || !String(a).trim()) bad.push(w2 + ": празен отговор"); });
      });
    });
  }

  ok(total + " разказчета и " + questions + " въпроса без нито един проблем",
     bad.length === 0, bad.slice(0, 4).join(" | "));
  ok("двата езика имат еднакъв брой разказчета",
     api.STORIES.bg.length === api.STORIES.nl.length,
     api.STORIES.bg.length + " срещу " + api.STORIES.nl.length);
  ok("има разказчета за всяко от шестте нива",
     [1,2,3,4,5,6].every(l => api.STORIES.bg.some(s => s.level === l)));

  // изборът връща разказче за всяко ниво и не повтаря скоро четеното
  api.State.progress = api.defaultProgress();
  api.State.progress.language = "bg";
  const seen = [];
  for(const lvl of api.STORY_LEVELS){
    api.State.session.recent = [];
    for(let i = 0; i < 50; i++){
      const st = api.pickStory(lvl);
      if(!st){ bad.push("ниво " + lvl.id + ": няма разказче"); break; }
      if(st.level > lvl.maxStoryLevel) bad.push("ниво " + lvl.id + ": разказче над нивото");
      api.State.session.recent.push(st.id);
      if(api.State.session.recent.length > api.CONFIG.recentMemory) api.State.session.recent.shift();
      seen.push(st.id);
    }
  }
  ok("всяко ниво връща подходящо разказче", bad.length === 0, bad.slice(0, 3).join(" | "));
  ok("изборът стига до различни разказчета", new Set(seen).size >= 8, String(new Set(seen).size));
})();

/* ==================================================================== */
group("Писане — щрихите");

(function(){
  const bad = [];
  let letters = 0, strokes = 0;
  const sets = { latin: api.LANGS.nl.alphabet, cyrillic: api.LANGS.bg.alphabet };

  for(const set in sets){
    const data = api.STROKES[set];
    sets[set].forEach(ch => {
      const st = data[ch];
      if(!st){ bad.push(set + ": липсва буквата " + ch); return; }
      letters++;
      if(!st.length) bad.push(set + "/" + ch + ": без нито един щрих");
      if(st.length > 6) bad.push(set + "/" + ch + ": повече от шест щриха");
      st.forEach((pts, i) => {
        strokes++;
        const w = set + "/" + ch + " щрих " + (i + 1);
        if(!Array.isArray(pts) || pts.length < 2) bad.push(w + ": под две точки");
        (pts || []).forEach(pt => {
          if(!Array.isArray(pt) || pt.length !== 2) return bad.push(w + ": точка не е [x,y]");
          if(!(pt[0] >= -0.05 && pt[0] <= 1.05)) bad.push(w + ": x извън платното (" + pt[0].toFixed(2) + ")");
          if(!(pt[1] >= -0.15 && pt[1] <= 1.05)) bad.push(w + ": y извън платното (" + pt[1].toFixed(2) + ")");
        });
        // щрих без дължина няма посока и детето не може да го „мине“
        let len = 0;
        for(let k = 1; k < pts.length; k++)
          len += Math.hypot(pts[k][0] - pts[k-1][0], pts[k][1] - pts[k-1][1]);
        if(len < 0.12) bad.push(w + ": твърде къс (" + len.toFixed(2) + ")");
      });
    });
    for(const ch in data) if(sets[set].indexOf(ch) < 0) bad.push(set + ": " + ch + " не е в азбуката");
  }

  ok(letters + " букви и " + strokes + " щриха без нито един проблем",
     bad.length === 0, bad.slice(0, 4).join(" | "));
  ok("и двете азбуки са пълни", letters === 56, String(letters));
})();

/* ==================================================================== */
group("Писане — проверката на движението");

(function(){
  const stroke = [[0.2, 0.2], [0.8, 0.8]];       // проста диагонала

  // вярно: тръгва от началото и минава до края
  let tr = api.createStrokeTracker(stroke);
  ok("тръгването от началото се приема", tr.begin([0.2, 0.2]) === "ok");
  for(let i = 0; i <= 20; i++){ const f = i / 20; tr.move([0.2 + 0.6*f, 0.2 + 0.6*f]); }
  ok("минаването до края се брои", tr.finish() === "done");

  // грешно начало: тръгва от края
  tr = api.createStrokeTracker(stroke);
  ok("тръгването от края се отказва", tr.begin([0.8, 0.8]) === "start-wrong");

  // грешна посока: тръгва вярно, но върви назад
  tr = api.createStrokeTracker(stroke);
  tr.begin([0.2, 0.2]);
  for(let i = 0; i <= 20; i++){ const f = i / 20; tr.move([0.2 - 0.15*f, 0.2 - 0.15*f]); }
  ok("движението назад не завършва щриха", tr.finish() === "short");

  // спиране по средата
  tr = api.createStrokeTracker(stroke);
  tr.begin([0.2, 0.2]);
  for(let i = 0; i <= 10; i++){ const f = i / 20; tr.move([0.2 + 0.6*f, 0.2 + 0.6*f]); }
  ok("спирането по средата не завършва щриха", tr.finish() === "short");

  // търпимост: криволичещо детско движение пак минава
  tr = api.createStrokeTracker(stroke);
  tr.begin([0.23, 0.17]);
  for(let i = 0; i <= 30; i++){
    const f = i / 30;
    tr.move([0.2 + 0.6*f + Math.sin(f * 9) * 0.05, 0.2 + 0.6*f - Math.sin(f * 7) * 0.05]);
  }
  ok("криволичещата детска ръка пак минава", tr.finish() === "done");

  // контролните точки покриват целия щрих
  const cp = api.strokeCheckpoints(stroke, 7);
  ok("контролните точки са колкото поискаме", cp.length === 7, String(cp.length));
  ok("първата е началото", Math.abs(cp[0][0] - 0.2) < 1e-6);
  ok("последната е краят", Math.abs(cp[6][0] - 0.8) < 1e-6);

  // всяка истинска буква може да бъде написана вярно
  const failed = [];
  ["latin", "cyrillic"].forEach(set => {
    for(const ch in api.STROKES[set]){
      api.STROKES[set][ch].forEach((pts, i) => {
        const t2 = api.createStrokeTracker(pts);
        if(t2.begin(pts[0]) !== "ok") return failed.push(set + "/" + ch + "/" + i + ": начало");
        // движим се плътно по описания път
        for(let k = 1; k < pts.length; k++){
          for(let f = 0; f <= 1; f += 0.1){
            t2.move([pts[k-1][0] + (pts[k][0] - pts[k-1][0]) * f,
                     pts[k-1][1] + (pts[k][1] - pts[k-1][1]) * f]);
          }
        }
        if(t2.finish() !== "done") failed.push(set + "/" + ch + " щрих " + (i + 1) + ": не се завършва");
      });
    }
  });
  ok("всеки щрих на всяка буква може да се завърши", failed.length === 0,
     failed.slice(0, 4).join(" | "));
})();

/* ====================================================================
 * Дупките в гората. Скокът е с постоянна гравитация, значи дължината
 * му се смята точно — и нито едно ниво не бива да ражда дупка, която е
 * по-широка. Иначе детето засяда завинаги.
 * ================================================================== */
group("Гората — прескачаеми ли са дупките");

(function(){
  // числата са същите като в forest.js
  const GRAV = 2.9, JUMP = 1.32, RUN_BASE = 0.27, PIT_SHARE = 0.55, PIT_OF_JUMP = 0.62;
  const W = 980, CH = W * 0.52;
  const airTime = 2 * JUMP / GRAV;

  const src = fs.readFileSync(path.join(ROOT, "src/data/levels.js"), "utf8");
  const speeds = [...src.matchAll(/speed:([\d.]+)/g)].map(m => parseFloat(m[1]));
  ok("всяко ниво има зададена скорост", speeds.length === 30, String(speeds.length));

  let worst = Infinity, worstLevel = 0;
  speeds.forEach((sp, i) => {
    const jump = RUN_BASE * sp * W * airTime;         // колко далеч стига един скок
    const pit = Math.min(CH * PIT_SHARE, jump * PIT_OF_JUMP);
    const margin = jump / pit;
    if(margin < worst){ worst = margin; worstLevel = i + 1; }
  });
  ok("най-тясната дупка пак се прескача с margin над 1.2",
     worst > 1.2, "ниво " + worstLevel + ": ×" + worst.toFixed(2));

  // контролна сметка: ако дупката беше по-широка от скока, това трябва да падне
  const jump1 = RUN_BASE * speeds[0] * W * airTime;
  ok("проверката би хванала непрескачаема дупка",
     jump1 / (jump1 * 1.4) < 1.2, (jump1 / (jump1 * 1.4)).toFixed(2));
})();

/* ==================================================================== */
group("Гората — приятели и места");

(function(){
  const bad = [];
  const seenWho = new Set(), seenItem = new Set(), seenName = { bg:new Set(), nl:new Set() };
  api.FOREST_FRIENDS.forEach((f, i) => {
    const w = "приятел " + (i + 1);
    if(!f.who) bad.push(w + ": без емоджи");
    if(seenWho.has(f.who)) bad.push(w + ": повторено емоджи " + f.who);
    seenWho.add(f.who);
    if(!f.item) bad.push(w + ": без предмет");
    if(seenItem.has(f.item)) bad.push(w + ": повторен предмет " + f.item);
    seenItem.add(f.item);
    if(!api.FOREST_THEMES[f.biome]) bad.push(w + ": непознато място " + f.biome);
    ["bg", "nl"].forEach(l => {
      if(!f.name || !f.name[l]) return bad.push(w + ": липсва име на " + l);
      if(seenName[l].has(f.name[l])) bad.push(w + ": повторено име " + f.name[l]);
      seenName[l].add(f.name[l]);
      if(!f.wants || !f.wants[l]) bad.push(w + ": липсва какво иска на " + l);
      if(!f.fact || !f.fact[l]) bad.push(w + ": липсва факт на " + l);
      if(!f.letter || !f.letter[l]) return bad.push(w + ": липсва буква на " + l);
      const first = f.name[l].toUpperCase().charAt(0);
      if(f.letter[l] !== first)
        bad.push(w + ": буквата " + f.letter[l] + " не е първата на " + f.name[l]);
    });
  });
  ok(api.FOREST_FRIENDS.length + " приятели без нито един проблем", bad.length === 0,
     bad.slice(0, 4).join(" | "));
  ok("всичките 30 приятеля са налице", api.FOREST_FRIENDS.length === 30);
  ok("местата се броят правилно", api.FOREST_BIOME_COUNT === Object.keys(api.FOREST_THEMES).length);

  // всяко ниво трябва да сочи към съществуващ приятел
  const levels = fs.readFileSync(path.join(ROOT, "src/data/levels.js"), "utf8");
  const quests = [...levels.matchAll(/quest:(\d+)/g)].map(m => +m[1]);
  ok("всяко ниво сочи към съществуващ приятел",
     quests.every(q => q >= 0 && q < api.FOREST_FRIENDS.length), quests.join(","));
  ok("нито един приятел не се повтаря между нивата",
     new Set(quests).size === quests.length, String(quests.length));
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
