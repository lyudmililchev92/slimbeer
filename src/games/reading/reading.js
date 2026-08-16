const MODES = {};
[MODE_BUILD, MODE_SYLLABLES, MODE_MISSING, MODE_FIRST, MODE_LISTEN, MODE_READ].forEach(m => { MODES[m.id] = m; });

/* Избор на дума и режим за следващия рунд. */
function wordPool(level){
  const allowAudio = !!level.audioWords && Speech.hasVoice();
  return WORDS.filter(w =>
    (allowAudio || !w.audioOnly) &&
    w.word.length >= level.minLen &&
    w.word.length <= level.maxLen &&
    w.difficulty <= level.maxDifficulty
  );
}
function pickWord(level){
  const pool = wordPool(level);
  if(!pool.length) return rand(WORDS);
  let cands = pool.filter(w => State.session.recent.indexOf(w.word) < 0);
  if(!cands.length) cands = pool;
  const unsolved = cands.filter(w => !LP().words[w.word]);
  return rand(unsolved.length ? unsolved : cands);
}
function pickMode(level, word, forceBuild){
  if(forceBuild) return MODES.build;
  const ids = level.modes.filter(id => MODES[id] && MODES[id].supports(word));
  if(!ids.length) return MODES.build;
  return MODES[rand(ids)];
}
