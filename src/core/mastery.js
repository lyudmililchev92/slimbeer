/* =========================================================================
 * УМЕНИЯ
 * -------------------------------------------------------------------------
 * Нивата казват докъде е стигнало детето. Не казват какво не му се удава.
 * Тук се пази второто: за всяко умение — колко пъти е опитвало, колко пъти
 * е успяло и как е вървяло напоследък.
 *
 * Име на умение:
 *
 *     letter.bg.Ж.recognition     разпознава ли буквата
 *     letter.bg.Ж.first           чува ли я в началото на дума
 *     letter.bg.Ж.writing         може ли да я напише
 *     reading.bg.length.5         подрежда ли петбуквени думи
 *     reading.bg.syllables        подрежда ли срички
 *     math.count.10               брои ли до десет
 *     math.add.5                  събира ли до пет
 *
 * Стойността е между 0 и 1, но детето никога не я вижда. Тя служи само
 * да реши кое да излиза по-често и какво да пише в екрана за родители.
 *
 * Нарочно е проста и детерминирана: същата поредица отговори дава същото
 * число, винаги. Няма никакъв изкуствен интелект.
 * ========================================================================= */

const MASTERY = {
  recent: 8,        // колко последни опита се помнят
  confidence: 5,    // след толкова опита стойността се брои за пълноценна
  freshWeight: 0.7, // колко тежи скорошното спрямо цялата история
  boost: 2.2        // колко по-често излиза слабото умение спрямо усвоеното
};

/* Прагове за екрана на родителя. Детето вижда думи, не числа. */
const MASTERY_BANDS = [
  { upto: 0.35, id: "practice" },   // има нужда от упражнение
  { upto: 0.65, id: "learning" },   // учи се
  { upto: 0.85, id: "good" },       // върви добре
  { upto: 1.01, id: "mastered" }    // усвоено
];

function emptySkill(){
  return { attempts: 0, correct: 0, recent: [], mastery: 0, lastSeen: 0 };
}

/* Скорошното тежи повече от старото, но старото не се изхвърля — иначе
   две поредни грешки биха изтрили седмица напредък. Увереността расте с
   броя опити, за да не обявяваме умение за усвоено след три отговора. */
function computeMastery(rec){
  if(!rec || !rec.attempts) return 0;
  let num = 0, den = 0;
  rec.recent.forEach((v, i) => { const w = i + 1; num += v * w; den += w; });
  const fresh = den ? num / den : 0;
  const overall = rec.correct / rec.attempts;
  const blended = fresh * MASTERY.freshWeight + overall * (1 - MASTERY.freshWeight);
  const confidence = Math.min(1, rec.attempts / MASTERY.confidence);
  return Math.round(blended * confidence * 1000) / 1000;
}

const Mastery = {
  /** Всички умения на активния език и път. Живее в записа. */
  all(){
    const p = State.progress;
    if(!p.mastery || typeof p.mastery !== "object") p.mastery = {};
    return p.mastery;
  },

  get(id){ return this.all()[id] || null; },

  /** 0..1. Невиждано умение е 0 — тоест слабо, тоест ще излиза по-често. */
  score(id){ const r = this.get(id); return r ? r.mastery : 0; },

  seen(id){ return !!this.get(id); },

  /** Записва един резултат. `now` се подава, за да е тестваемо. */
  record(id, correct, now){
    if(!id) return null;
    const all = this.all();
    const rec = all[id] || emptySkill();
    rec.attempts += 1;
    if(correct) rec.correct += 1;
    rec.recent.push(correct ? 1 : 0);
    if(rec.recent.length > MASTERY.recent) rec.recent.shift();
    rec.lastSeen = now || Date.now();
    rec.mastery = computeMastery(rec);
    all[id] = rec;
    return rec;
  },

  recordMany(ids, correct, now){
    (ids || []).forEach(id => this.record(id, correct, now));
  },

  /** Дума вместо число — това вижда родителят. */
  band(id){
    if(!this.seen(id)) return "new";
    const m = this.score(id);
    for(const b of MASTERY_BANDS) if(m < b.upto) return b.id;
    return "mastered";
  },

  /** Тегло при избора: слабото излиза по-често, но не задушаващо често. */
  weight(id){
    return 1 + (1 - this.score(id)) * MASTERY.boost;
  },

  /** Умения с даден префикс, подредени от най-слабото. Само видените. */
  ranked(prefix){
    const all = this.all();
    return Object.keys(all)
      .filter(id => id.indexOf(prefix) === 0)
      .map(id => ({ id: id, mastery: all[id].mastery, attempts: all[id].attempts }))
      .sort((a, b) => a.mastery - b.mastery);
  },

  weakest(prefix, n){ return this.ranked(prefix).slice(0, n || 5); },
  strongest(prefix, n){ return this.ranked(prefix).reverse().slice(0, n || 5); }
};

/* ---------------------------------------------------------------------
 * Кои умения се упражняват в един рунд.
 * Отделено от двигателите нарочно: игрите не бива да знаят как се казват
 * уменията, а моделът не бива да знае как изглеждат игрите.
 * ------------------------------------------------------------------- */
function skillsForRound(item, modeId, lang){
  const ids = [];
  if(!item) return ids;

  if(item.kind){                                  // задача по смятане
    const cap = item.max || 10;
    ids.push("math." + item.kind + "." + cap);
    return ids;
  }

  const word = item.word || "";
  if(!word) return ids;
  const letters = word.split("").filter((ch, i, a) => a.indexOf(ch) === i);

  switch(modeId){
    case "first":
      ids.push("letter." + lang + "." + word.charAt(0) + ".first");
      break;
    case "missing":
      // коя точно е липсвала не се знае тук, затова всички букви взимат по малко
      letters.forEach(ch => ids.push("letter." + lang + "." + ch + ".recognition"));
      break;
    case "syllables":
      ids.push("reading." + lang + ".syllables");
      break;
    case "listen":
      ids.push("reading." + lang + ".listen");
      break;
    case "read":
      ids.push("reading." + lang + ".read");
      break;
    default:                                       // подреждане на букви
      letters.forEach(ch => ids.push("letter." + lang + "." + ch + ".recognition"));
      ids.push("reading." + lang + ".length." + word.length);
  }
  return ids;
}

/** Умение за писане на буква — вика се от екрана за проследяване. */
function writingSkill(letter, lang){
  return "letter." + lang + "." + letter + ".writing";
}

/* ---------------------------------------------------------------------
 * Претеглен избор. Слабото излиза по-често, скоро показаното — по-рядко.
 * ------------------------------------------------------------------- */
function weightedPick(items, weightOf){
  if(!items || !items.length) return null;
  let total = 0;
  const weights = items.map(it => {
    const w = Math.max(0.0001, weightOf(it));
    total += w;
    return w;
  });
  let r = Math.random() * total;
  for(let i = 0; i < items.length; i++){
    r -= weights[i];
    if(r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/* Колко „слаба“ е думата: средното по буквите ѝ. Дете, което бърка Ж и З,
   ще вижда думи с Ж и З малко по-често, без това да личи като повторение. */
function wordWeight(word, lang){
  const letters = word.word.split("").filter((ch, i, a) => a.indexOf(ch) === i);
  if(!letters.length) return 1;
  let sum = 0;
  letters.forEach(ch => { sum += Mastery.weight("letter." + lang + "." + ch + ".recognition"); });
  return sum / letters.length;
}
