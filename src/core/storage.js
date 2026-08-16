/* Похвали и азбука идват от активния език. */

function defaultTrackProgress(){
  return {
    currentLevel: 1,
    levelProgress: 0,      // решени задачи в текущото ниво
    completedWords: 0,
    firstTryCorrect: 0,
    attempts: 0,
    words: {},             // "POES": {solved:2, mistakes:1, firstTry:true}
    learnedLetters: {}     // "P": 4  (само за пътя с думите)
  };
}
/* Всеки език има отделен прогрес за всеки път на учене. */
function defaultLangProgress(){
  return { words: defaultTrackProgress(), math: defaultTrackProgress(),
           catch: defaultTrackProgress(), forest: defaultTrackProgress(),
           phonics: defaultTrackProgress(), stories: defaultTrackProgress() };
}

/* Прогресът по думи и нива е отделен за всеки език — ученето на
   нидерландски е независимо от българското. Звездите са общи. */
function defaultProgress(){
  return {
    version: CONFIG.saveVersion,
    language: DEFAULT_LANG,
    totalStars: 0,
    soundEnabled: true,
    speechSpeed: "normal",
    autoSpeak: false,   // да изговаря ли думата сама при нов рунд
    tutorialCompleted: false,
    // v4: какво се удава и какво не. Ключът е име на умение, виж mastery.js.
    mastery: {},
    // v5: какво е открило детето. Звездите не са валута, а следа от игра.
    discoveries: { friends: {}, biomes: {} },
    byLang: { nl: defaultLangProgress(), bg: defaultLangProgress() }
  };
}

const TRACK_IDS = ["words", "math", "catch", "forest", "phonics", "stories"];

const Store = {
  load(){
    try{
      const raw = localStorage.getItem(CONFIG.saveKey);
      if(!raw) return defaultProgress();
      return Store.migrate(JSON.parse(raw));
    }catch(e){
      return defaultProgress();
    }
  },
  /** Обновяване на стари формати. */
  migrate(data){
    const base = defaultProgress();
    if(!data || typeof data !== "object") return base;

    // v1 → v3: единичен прогрес → по език и по път (старият беше само български, само думи)
    if(data.version === 1){
      const bg = defaultLangProgress();
      ["currentLevel","levelProgress","completedWords","firstTryCorrect","attempts","words","learnedLetters"]
        .forEach(k => { if(data[k] !== undefined) bg.words[k] = data[k]; });
      return Object.assign(base, {
        totalStars: data.totalStars || 0,
        soundEnabled: data.soundEnabled !== false,
        speechSpeed: "normal",
        tutorialCompleted: !!data.tutorialCompleted,
        language: "bg",
        byLang: { nl: defaultLangProgress(), bg: bg }
      });
    }

    const out = Object.assign(base, data, { version: CONFIG.saveVersion });
    out.byLang = Object.assign(base.byLang, data.byLang || {});
    for(const code in LANGS){
      const src2 = out.byLang[code] || {};
      // v2 → v3: прогресът беше плосък (само думи) → влиза в пътя "words"
      const flat = src2.currentLevel !== undefined;
      const lang = defaultLangProgress();
      if(flat) Object.assign(lang.words, src2);
      else TRACK_IDS.forEach(tr => { if(src2[tr]) Object.assign(lang[tr], src2[tr]); });
      out.byLang[code] = lang;
    }
    // v3 → v4: уменията са нови. Стар запис просто тръгва с празни —
    // напредъкът по нива и думи не се пипа.
    if(!out.mastery || typeof out.mastery !== "object") out.mastery = {};
    // v4 → v5: откритията са нови и тръгват празни
    if(!out.discoveries || typeof out.discoveries !== "object") out.discoveries = {};
    if(!out.discoveries.friends || typeof out.discoveries.friends !== "object") out.discoveries.friends = {};
    if(!out.discoveries.biomes || typeof out.discoveries.biomes !== "object") out.discoveries.biomes = {};
    for(const id in out.mastery){
      const r = out.mastery[id];
      if(!r || typeof r !== "object" || typeof r.attempts !== "number" || !Array.isArray(r.recent)){
        delete out.mastery[id];        // счупен запис се изхвърля, не чупи играта
      }
    }
    if(!LANGS[out.language]) out.language = DEFAULT_LANG;
    if(!SPEECH_SPEEDS[out.speechSpeed]) out.speechSpeed = "normal";
    return out;
  },
  available: true,     // може ли браузърът да пази прогрес тук
  save(){
    try{
      localStorage.setItem(CONFIG.saveKey, JSON.stringify(State.progress));
      this.available = true;
    }catch(e){
      // Частен режим или преглед на файл (напр. Files на iOS). Играта
      // продължава нормално — губи се само помненето след затваряне.
      this.available = false;
    }
  },
  reset(){
    try{ localStorage.removeItem(CONFIG.saveKey); }catch(e){}
    const lang = State.progress ? State.progress.language : DEFAULT_LANG;
    State.progress = defaultProgress();
    State.progress.language = lang;
  }
};
