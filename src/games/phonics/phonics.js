/* =========================================================================
 * ЗВУКОВЕ — от чуване към четене
 * -------------------------------------------------------------------------
 * Пътят е: чувам звук → познавам звука → свързвам го с буква → сливам
 * звукове → чета дума.
 *
 * Шестте упражнения изглеждат различно за детето, но правят едно и също:
 * дава се подсказка (звук, дума или сричка) и се избира от три картинки
 * или три букви. Затова има един двигател с параметри, а не шест почти
 * еднакви режима.
 * ========================================================================= */

const PHONICS = {};        // пълни се от phonics-bg.js и phonics-nl.js

function phonicsPack(lang){ return PHONICS[lang || State.progress.language] || PHONICS.bg; }

/* Първият звук на думата. На български това е първата буква, на
   нидерландски може да са три букви — sch, ij, oe. */
function firstSound(word, lang){
  const pack = phonicsPack(lang);
  const w = typeof word === "string" ? word : word.word;
  for(const d of pack.onsets) if(w.indexOf(d) === 0) return d;
  return w.charAt(0);
}

function lastSound(word, lang){
  const pack = phonicsPack(lang);
  const w = typeof word === "string" ? word : word.word;
  for(const d of pack.codas) if(w.length > d.length && w.slice(-d.length) === d) return d;
  return w.charAt(w.length - 1);
}

/** Как да се изговори звукът. Фонетично, не име на буква. */
function soundSay(sound, lang){
  const code = lang || State.progress.language;
  const pack = phonicsPack(code);
  if(pack.say && pack.say[sound]) return pack.say[sound];
  const ls = (LANGS[code] || LANGS.bg).letterSound;
  return (ls && ls[sound]) || sound;
}

/* ---------------------------------------------------------------------
 * Указател: кои думи започват и завършват с кой звук. Строи се веднъж
 * при смяна на език, защото се пита стотици пъти.
 * ------------------------------------------------------------------- */
let PHONICS_INDEX = { first: {}, last: {}, lang: null };

function buildPhonicsIndex(lang){
  const idx = { first: {}, last: {}, lang: lang };
  WORDS.forEach(w => {
    if(!hasPicture(w)) return;            // упражненията избират по картинка
    const f = firstSound(w, lang), l = lastSound(w, lang);
    (idx.first[f] = idx.first[f] || []).push(w);
    (idx.last[l] = idx.last[l] || []).push(w);
  });
  PHONICS_INDEX = idx;
  return idx;
}

function wordsByFirst(sound){ return PHONICS_INDEX.first[sound] || []; }
function wordsByLast(sound){ return PHONICS_INDEX.last[sound] || []; }

/** Звуковете, които изобщо имат достатъчно думи за упражнение. */
function usableSounds(level, lang){
  const pack = phonicsPack(lang);
  const wanted = (level.sounds && level.sounds.length)
    ? level.sounds
    : Object.keys(PHONICS_INDEX.first);
  return wanted.filter(s =>
    pack.skipFirst.indexOf(s) < 0 &&
    wordsByFirst(s).filter(w => w.word.length <= (level.maxLen || 99)).length >= 1);
}

/* ---------------------------------------------------------------------
 * Избор на задача
 * ------------------------------------------------------------------- */
function pickPhonicsItem(level){
  const lang = State.progress.language;
  if(PHONICS_INDEX.lang !== lang) buildPhonicsIndex(lang);

  const modeId = rand(level.modes);
  const fits = (w) => w.word.length <= (level.maxLen || 99);
  const pool = WORDS.filter(w => hasPicture(w) && fits(w));
  if(pool.length < 3) return null;

  /* Слабите звукове излизат по-често — същият модел като при думите. */
  const pickSound = (list) => weightedPick(list, s =>
    Mastery.weight("sound." + lang + "." + s)) || rand(list);

  if(modeId === "first" || modeId === "last"){
    const byEnd = modeId === "last";
    const sounds = byEnd
      ? Object.keys(PHONICS_INDEX.last).filter(s =>
          (level.sounds.length ? level.sounds.indexOf(s) >= 0 : true) &&
          wordsByLast(s).filter(fits).length >= 1)
      : usableSounds(level, lang);
    if(!sounds.length) return null;
    const sound = pickSound(sounds);
    const matching = (byEnd ? wordsByLast(sound) : wordsByFirst(sound)).filter(fits);
    if(!matching.length) return null;
    const target = rand(matching);
    const others = shuffle(pool.filter(w =>
      w.word !== target.word &&
      (byEnd ? lastSound(w, lang) : firstSound(w, lang)) !== sound)).slice(0, 2);
    if(others.length < 2) return null;
    return { kind:"phonics", mode:modeId, sound, target:target,
             options: shuffle([target].concat(others)) };
  }

  if(modeId === "same"){
    // дадена дума, търси се друга със същото начало
    const sounds = usableSounds(level, lang).filter(s => wordsByFirst(s).filter(fits).length >= 2);
    if(!sounds.length) return null;
    const sound = pickSound(sounds);
    const same = shuffle(wordsByFirst(sound).filter(fits));
    const cue = same[0], target = same[1];
    const others = shuffle(pool.filter(w =>
      firstSound(w, lang) !== sound)).slice(0, 2);
    if(!cue || !target || others.length < 2) return null;
    return { kind:"phonics", mode:"same", sound, cue, target:target,
             options: shuffle([target].concat(others)) };
  }

  if(modeId === "odd"){
    // три думи с общ начален звук и една различна — коя не е на място
    const sounds = usableSounds(level, lang).filter(s => wordsByFirst(s).filter(fits).length >= 3);
    if(!sounds.length) return null;
    const sound = pickSound(sounds);
    const same = shuffle(wordsByFirst(sound).filter(fits)).slice(0, 3);
    const odd = rand(pool.filter(w => firstSound(w, lang) !== sound));
    if(same.length < 3 || !odd) return null;
    return { kind:"phonics", mode:"odd", sound, target:odd,
             options: shuffle(same.concat([odd])) };
  }

  if(modeId === "blend"){
    // Сливането започва от три звука: двубуквени думи с картинка почти
    // няма, а без картинка задачата няма как да се избере.
    const n = Math.max(3, level.blend || 3);
    const cands = pool.filter(w => w.word.length >= 3 && w.word.length <= n);
    if(cands.length < 3) return null;
    const target = rand(cands);
    const others = shuffle(cands.filter(w => w.word !== target.word)).slice(0, 2);
    if(others.length < 2) return null;
    return { kind:"phonics", mode:"blend", target:target,
             parts: target.word.split(""),
             options: shuffle([target].concat(others)) };
  }

  // syllable: чува се „КО-ТЕ“ и се избира картинката
  const cands = pool.filter(w => w.syllables.length >= 2);
  if(cands.length < 3) return null;
  const target = rand(cands);
  const others = shuffle(cands.filter(w => w.word !== target.word)).slice(0, 2);
  if(others.length < 2) return null;
  return { kind:"phonics", mode:"syllable", target:target,
           parts: target.syllables,
           options: shuffle([target].concat(others)) };
}

/* ---------------------------------------------------------------------
 * Един двигател за шестте упражнения
 * ------------------------------------------------------------------- */

/** Какво се чува, когато детето докосне бутона с високоговорителя. */
function phonicsCue(item){
  const lang = State.progress.language;
  switch(item.mode){
    case "first":
    case "last":    return soundSay(item.sound, lang);
    case "same":    return item.cue.display;
    case "odd":     return soundSay(item.sound, lang);
    // паузите карат синтезатора да раздели звуковете, вместо да ги слее
    case "blend":   return item.parts.map(p => soundSay(p, lang)).join(" … ");
    default:        return item.parts.join(" … ");
  }
}

function phonicsPromptKey(mode){
  return { first:"promptSoundFirst", last:"promptSoundLast", same:"promptSoundSame",
           odd:"promptSoundOdd", blend:"promptBlend", syllable:"promptSyllableHear" }[mode];
}

const MODE_PHONICS = {
  id: "phonics", showsPicture: false,
  supports(){ return true; },

  mount(root, host){
    const item = host.item;
    const lang = State.progress.language;
    let mistakes = 0, done = false;

    /* Голям бутон „чуй“ — той е и подканата, и помощта. Детето може да
       го натиска колкото иска; повтарянето не струва нищо. */
    const cue = h("button", { class:"big-listen", type:"button", "aria-label":t("listenLabel") }, "🔊");
    const say = () => { Sfx.tap(); Speech.speak(phonicsCue(item), { rate: 0.8 }); };
    cue.addEventListener("click", say);
    root.appendChild(cue);

    /* При „същото начало“ се показва и думата-подсказка с картинката ѝ. */
    if(item.mode === "same"){
      const box = h("div", { class:"cue-word" });
      box.appendChild(renderArt(item.cue, "cue-pic"));
      box.appendChild(h("div", { class:"label" }, item.cue.word));
      box.addEventListener("click", say);
      root.appendChild(box);
    }
    /* При сливане показваме и буквите — детето вижда какво чува. */
    if(item.mode === "blend" || item.mode === "syllable"){
      const row = h("div", { class:"sound-parts" });
      item.parts.forEach((p, i) => {
        if(i) row.appendChild(h("span", { class:"sound-dash" }, "·"));
        row.appendChild(h("span", { class:"sound-part" }, p));
      });
      root.appendChild(row);
    }

    root.appendChild(h("p", { class:"prompt" }, t(phonicsPromptKey(item.mode))));

    const optsEl = h("div", { class:"options" });
    const correct = item.target;
    item.options.forEach(w => {
      const b = h("button", { class:"opt-pic", type:"button", "aria-label":w.display });
      b.appendChild(renderArt(w));
      b.addEventListener("click", () => {
        if(done) return;
        if(w.word === correct.word){
          done = true;
          b.classList.add("right");
          Sfx.place();
          Speech.speak(correct.display);
          setTimeout(() => host.correct(mistakes), 520);
        } else {
          mistakes++;
          Sfx.wrong();
          shakeEl(b);
          host.mistake();
        }
      });
      optsEl.appendChild(b);
    });
    root.appendChild(optsEl);

    setTimeout(say, 400);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ Speech.speak(phonicsCue(item), { rate: 0.55 }); return t("hintListenAgain"); }
        const right = Array.from(optsEl.children)
          .find(b => b.getAttribute("aria-label") === correct.display);
        if(right) right.classList.add("right");
        Speech.speak(correct.display);
        return t("hintHereIs");
      },
      destroy(){}
    };
  }
};
