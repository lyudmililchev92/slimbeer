const State = {
  progress: null,
  /* Сесийни данни — не се пазят */
  session: { recent:[], solvedInSession:0, round:null, track:"words" },
  ui: { screen:"home", params:null }
};

/** Прогресът за активния език и път (по подразбиране — текущия път). */
function LP(track){
  const lang = State.progress.byLang[State.progress.language];
  return lang[track || State.session.track || "words"];
}

/** Смяна на езика: пресглобява речника и се връща на началния екран. */
function setLanguage(code){
  if(!LANGS[code] || code === State.progress.language) return;
  State.progress.language = code;
  Store.save();
  rebuildWords();
  document.documentElement.lang = code;
  Speech.stop();
  State.session = { recent:[], solvedInSession:0, round:null, track:State.session.track };
  Router.go("home");
}

/** Централизиран запис на резултат от решена задача (дума или сметка). */
function recordResult(item, mistakes, hintsUsed, modeId){
  const p = State.progress, lp = LP(), alphabet = L().alphabet;
  if(mistakes === 0 && hintsUsed === 0) lp.firstTryCorrect += 1;

  // Един резултат на рунд: сгрешило ли е детето по пътя, или не.
  // Подсказката не е грешка — тя е позволена и не се брои.
  Mastery.recordMany(skillsForRound(item, modeId, p.language), mistakes === 0);

  if(typeof item.word === "string"){  // само пътят с думите пази думи и букви
    const rec = lp.words[item.word] || { solved:0, mistakes:0, firstTry:false };
    rec.solved += 1;
    rec.mistakes += mistakes;
    if(mistakes === 0 && hintsUsed === 0) rec.firstTry = true;
    lp.words[item.word] = rec;
    item.word.split("").forEach(ch => {
      if(alphabet.indexOf(ch) >= 0) lp.learnedLetters[ch] = (lp.learnedLetters[ch]||0) + 1;
    });
  }
  lp.completedWords += 1;

  let stars = CONFIG.starsPerWord.ok;
  if(mistakes === 0 && hintsUsed === 0) stars = CONFIG.starsPerWord.perfect;
  else if(mistakes <= 2 && hintsUsed <= 1) stars = CONFIG.starsPerWord.good;
  p.totalStars += stars;

  lp.levelProgress += 1;
  let leveledUp = false;
  const lv = getLevel(lp.currentLevel);
  if(lp.levelProgress >= lv.wordsToPass && lp.currentLevel < levelCount()){
    lp.currentLevel += 1;
    lp.levelProgress = 0;
    leveledUp = true;
  }
  Store.save();
  return { stars, leveledUp };
}

function addStars(n){
  State.progress.totalStars += n;
  Store.save();
}

function getLevel(id, track){
  const list = (TRACKS[track || State.session.track || "words"] || TRACKS.words).levels();
  return list.find(l => l.id === id) || list[0];
}
function levelCount(track){
  return (TRACKS[track || State.session.track || "words"] || TRACKS.words).levels().length;
}
