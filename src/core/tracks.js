const MATH_MODES = {};
[MODE_COUNT, MODE_ADD, MODE_SUB, MODE_SEQUENCE, MODE_COMPARE,
 MODE_SHAPE, MODE_PATTERN, MODE_MATCH, MODE_MAKE].forEach(m => { MATH_MODES[m.id] = m; });

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
    speak: (item) => item.display,
    label: (item) => item.word
  },
  forest: {
    id:"forest", icon:"🌲",
    levels: () => FOREST_LEVELS,
    pickItem: (level) => pickWord(level),
    pickMode: () => MODE_FOREST,
    itemKey: (item) => item.word,
    speak: (item) => item.display,
    label: (item) => item.word
  },
  catch: {
    id:"catch", icon:"🕹️",
    levels: () => CATCH_LEVELS,
    pickItem: (level) => pickWord(level),
    pickMode: () => MODE_CATCH,
    itemKey: (item) => item.word,
    speak: (item) => item.display,
    label: (item) => item.word
  },
  stories: {
    id:"stories", icon:"\uD83D\uDCDA",
    levels: () => STORY_LEVELS,
    pickItem: (level) => pickStory(level),
    pickMode: () => MODE_STORY,
    itemKey: (item) => item.id,
    speak: (item) => item.title,
    label: (item) => item.title
  },
  phonics: {
    id:"phonics", icon:"\uD83D\uDC42",
    levels: () => phonicsPack().levels,
    pickItem: (level) => pickPhonicsItem(level),
    pickMode: () => MODE_PHONICS,
    itemKey: (item) => item.mode + ":" + item.target.word,
    speak: (item) => item.target.display,
    label: (item) => item.target.word
  },
  math: {
    id:"math", icon:"🔢",
    levels: () => MATH_LEVELS,
    pickItem: (level) => pickMathItem(level),
    pickMode: (level, item) => MATH_MODES[item.kind] || MODE_COUNT,
    itemKey: (item) => item.kind + ":" + JSON.stringify(item),
    speak: (item) => numberWord(mathAnswer(item)),
    label: (item) => String(mathAnswer(item))
  }
};
