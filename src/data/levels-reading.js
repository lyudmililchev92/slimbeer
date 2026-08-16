/* Ниво = филтър върху речника + кои мини-игри се появяват. Data-driven. */
const LEVELS = [
  { id:1,  minLen:2, maxLen:3,  maxDifficulty:1, wordsToPass:5,  modes:["build"] },
  { id:2,  minLen:4, maxLen:4,  maxDifficulty:1, wordsToPass:6,  modes:["build","build","first"] },
  { id:3,  minLen:4, maxLen:4,  maxDifficulty:1, wordsToPass:6,  modes:["build","build","first","missing"] },
  { id:4,  minLen:4, maxLen:5,  maxDifficulty:2, wordsToPass:7,  modes:["build","build","missing","listen","read"] },
  { id:5,  minLen:5, maxLen:5,  maxDifficulty:2, wordsToPass:7,  modes:["build","build","missing","syllables","listen","read"] },
  { id:6,  minLen:5, maxLen:6,  maxDifficulty:2, audioWords:true, wordsToPass:8,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:7,  minLen:6, maxLen:6,  maxDifficulty:2, audioWords:true, wordsToPass:8,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:8,  minLen:6, maxLen:7,  maxDifficulty:3, audioWords:true, wordsToPass:8,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:9,  minLen:7, maxLen:7,  maxDifficulty:3, audioWords:true, wordsToPass:9,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:10, minLen:7, maxLen:8,  maxDifficulty:3, audioWords:true, wordsToPass:9,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:11, minLen:8, maxLen:9,  maxDifficulty:3, audioWords:true, wordsToPass:10, modes:["build","build","missing","syllables","first","listen","read"] },
  { id:12, minLen:8, maxLen:99, maxDifficulty:3, audioWords:true, wordsToPass:10, modes:["build","build","missing","syllables","first","listen","read"] }
];
function levelName(id){ return t("level") + " " + id; }
