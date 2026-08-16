const MATH_MODES = {};
[MODE_COUNT, MODE_ADD, MODE_SUB, MODE_SEQUENCE, MODE_COMPARE].forEach(m => { MATH_MODES[m.id] = m; });

/* =========================================================================
 * ПЪТИЩА — какво се учи. Всеки път има свои нива, задачи и мини-игри.
 * ========================================================================= */
const TRACKS = {
  words: {
    id:"words", icon:"📖",
    levels: () => LEVELS,
    pickItem: (level) => pickWord(level),
    pickMode: (level, item, force) => pickMode(level, item, force),
    itemKey: (item) => item.word,
    speak: (item) => item.display
  },
  forest: {
    id:"forest", icon:"🌲",
    levels: () => FOREST_LEVELS,
    pickItem: (level) => pickWord(level),
    pickMode: () => MODE_FOREST,
    itemKey: (item) => item.word,
    speak: (item) => item.display
  },
  catch: {
    id:"catch", icon:"🕹️",
    levels: () => CATCH_LEVELS,
    pickItem: (level) => pickWord(level),
    pickMode: () => MODE_CATCH,
    itemKey: (item) => item.word,
    speak: (item) => item.display
  },
  math: {
    id:"math", icon:"🔢",
    levels: () => MATH_LEVELS,
    pickItem: (level) => pickMathItem(level),
    pickMode: (level, item) => MATH_MODES[item.kind] || MODE_COUNT,
    itemKey: (item) => item.kind + ":" + JSON.stringify(item),
    speak: (item) => numberWord(mathAnswer(item))
  }
};
