/* Двайсет нива. Всяко носи свой приятел, свой сезон и малко повече от
   всичко — по-дълга дума, повече за събиране, по-бърз бяг, повече дупки. */
const FOREST_LEVELS = [
  // ЛИВАДА — първи стъпки, без дупки
  { id:1,  theme:"meadow", quest:0,  minLen:3, maxLen:3, maxDifficulty:1, wordsToPass:3, nuts:3,  pits:0.00, speed:0.85, modes:["forest"] },
  { id:2,  theme:"meadow", quest:1,  minLen:3, maxLen:4, maxDifficulty:1, wordsToPass:4, nuts:4,  pits:0.08, speed:0.90, modes:["forest"] },
  // ГОРА — влизат предизвикателствата
  { id:3,  theme:"day", quest:2,  minLen:4, maxLen:4, maxDifficulty:1, wordsToPass:4, nuts:5,  pits:0.12, speed:0.95, zones:0.6, zoneKinds:["count"], countMax:5, modes:["forest"] },
  { id:4,  theme:"day", quest:3,  minLen:4, maxLen:4, maxDifficulty:1, wordsToPass:4, nuts:5,  pits:0.14, speed:1.00, zones:0.7, zoneKinds:["count","color"], countMax:6, modes:["forest"] },
  { id:5,  theme:"day", quest:4,  minLen:4, maxLen:5, maxDifficulty:2, wordsToPass:5, nuts:6,  pits:0.16, speed:1.04, zones:0.7, zoneKinds:["color","first"], movers:0.25, modes:["forest"] },
  // ЕСЕН — появяват се сметки
  { id:6,  theme:"autumn", quest:5,  minLen:5, maxLen:5, maxDifficulty:2, wordsToPass:5, nuts:6,  pits:0.18, speed:1.08, zones:0.8, zoneKinds:["first","sum"], sumMax:5, movers:0.30, modes:["forest"] },
  { id:7,  theme:"autumn", quest:6,  minLen:5, maxLen:5, maxDifficulty:2, wordsToPass:5, nuts:7,  pits:0.19, speed:1.11, zones:0.8, zoneKinds:["sum","count"], sumMax:6, countMax:8, movers:0.35, modes:["forest"] },
  { id:8,  theme:"autumn", quest:7,  minLen:5, maxLen:6, maxDifficulty:3, wordsToPass:6, nuts:7,  pits:0.20, speed:1.14, zones:0.85, zoneKinds:["sum","color","first"], sumMax:7, movers:0.40, modes:["forest"] },
  // ЗАЛЕЗ
  { id:9,  theme:"dusk", quest:8,  minLen:5, maxLen:6, maxDifficulty:3, wordsToPass:6, nuts:8,  pits:0.21, speed:1.17, zones:0.85, zoneKinds:["sum","count"], sumMax:7, countMax:9, movers:0.40, modes:["forest"] },
  { id:10, theme:"dusk", quest:9,  minLen:6, maxLen:6, maxDifficulty:3, wordsToPass:6, nuts:9,  pits:0.22, speed:1.20, zones:0.9, zoneKinds:["sum","first","color"], sumMax:8, movers:0.45, modes:["forest"] },
  { id:11, theme:"dusk", quest:10, minLen:6, maxLen:6, maxDifficulty:3, wordsToPass:6, nuts:10, pits:0.23, speed:1.23, zones:0.9, zoneKinds:["sum","count"], sumMax:8, countMax:9, movers:0.45, modes:["forest"] },
  // НОЩ
  { id:12, theme:"night", quest:11, minLen:6, maxLen:6, maxDifficulty:3, wordsToPass:7, nuts:11, pits:0.24, speed:1.26, zones:0.95, zoneKinds:["sum","count","color","first"], sumMax:9, countMax:10, movers:0.50, modes:["forest"] },
  { id:13, theme:"night", quest:12, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:7, nuts:12, pits:0.25, speed:1.29, zones:0.95, zoneKinds:["sum","count"], sumMax:9, countMax:10, movers:0.50, modes:["forest"] },
  { id:14, theme:"night", quest:13, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:7, nuts:12, pits:0.26, speed:1.31, zones:1.0, zoneKinds:["sum","first"], sumMax:10, movers:0.55, modes:["forest"] },
  // ЗИМА
  { id:15, theme:"winter", quest:14, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:7, nuts:13, pits:0.26, speed:1.33, zones:1.0, zoneKinds:["count","color"], countMax:10, movers:0.55, modes:["forest"] },
  { id:16, theme:"winter", quest:15, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:8, nuts:14, pits:0.27, speed:1.35, zones:1.0, zoneKinds:["sum","count"], sumMax:10, countMax:10, movers:0.60, modes:["forest"] },
  { id:17, theme:"winter", quest:16, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:8, nuts:14, pits:0.28, speed:1.37, zones:1.0, zoneKinds:["sum","first","color"], sumMax:10, movers:0.60, modes:["forest"] },
  // ДЪЛБОКАТА НОЩ
  { id:18, theme:"night", quest:17, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:8, nuts:15, pits:0.28, speed:1.39, zones:1.0, zoneKinds:["sum","count","first"], sumMax:10, countMax:10, movers:0.65, modes:["forest"] },
  { id:19, theme:"night", quest:18, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:8, nuts:16, pits:0.29, speed:1.41, zones:1.0, zoneKinds:["sum","count","color","first"], sumMax:10, countMax:10, movers:0.70, modes:["forest"] },
  { id:20, theme:"night", quest:19, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:18, pits:0.30, speed:1.43, zones:1.0, zoneKinds:["sum","count","color","first"], sumMax:10, countMax:10, movers:0.75, modes:["forest"] },
  // ПРОЛЕТ — розови корони след дългата нощ
  { id:21, theme:"blossom", quest:20, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:16, pits:0.28, speed:1.30, zones:1.0, zoneKinds:["count","color"], countMax:10, movers:0.55, modes:["forest"] },
  { id:22, theme:"blossom", quest:21, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:17, pits:0.29, speed:1.33, zones:1.0, zoneKinds:["sum","first"], sumMax:10, movers:0.60, modes:["forest"] },
  { id:23, theme:"blossom", quest:22, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:17, pits:0.30, speed:1.36, zones:1.0, zoneKinds:["sum","count","color"], sumMax:10, countMax:10, movers:0.60, modes:["forest"] },
  // МОРЕ — пясък, палми и много вода
  { id:24, theme:"beach", quest:23, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:18, pits:0.31, speed:1.38, zones:1.0, zoneKinds:["count","first"], countMax:10, movers:0.62, modes:["forest"] },
  { id:25, theme:"beach", quest:24, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:19, pits:0.32, speed:1.40, zones:1.0, zoneKinds:["sum","color"], sumMax:10, movers:0.65, modes:["forest"] },
  { id:26, theme:"beach", quest:25, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:19, pits:0.33, speed:1.43, zones:1.0, zoneKinds:["sum","count","first"], sumMax:10, countMax:10, movers:0.68, modes:["forest"] },
  // ПЕЩЕРА — светещи кристали вместо дървета, най-трудното
  { id:27, theme:"cave", quest:26, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:20, pits:0.33, speed:1.45, zones:1.0, zoneKinds:["count","color"], countMax:10, movers:0.70, modes:["forest"] },
  { id:28, theme:"cave", quest:27, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:21, pits:0.34, speed:1.47, zones:1.0, zoneKinds:["sum","first"], sumMax:10, movers:0.72, modes:["forest"] },
  { id:29, theme:"cave", quest:28, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:21, pits:0.34, speed:1.49, zones:1.0, zoneKinds:["sum","count","color","first"], sumMax:10, countMax:10, movers:0.75, modes:["forest"] },
  { id:30, theme:"cave", quest:29, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:22, pits:0.35, speed:1.52, zones:1.0, zoneKinds:["sum","count","color","first"], sumMax:10, countMax:10, movers:0.80, modes:["forest"] }
];

/* Ловът не е една игра с шест нива, а един двигател с шест вида задачи.
   `hunt` казва кои от тях излизат на нивото. Виж letter-hunt/tasks.js. */
const CATCH_LEVELS = [
  { id:1,  minLen:3, maxLen:3, maxDifficulty:1, wordsToPass:4, modes:["catch"], hunt:["word"] },
  { id:2,  minLen:3, maxLen:4, maxDifficulty:1, wordsToPass:5, modes:["catch"], hunt:["word","first"] },
  { id:3,  minLen:4, maxLen:4, maxDifficulty:1, wordsToPass:5, modes:["catch"], hunt:["first","count"] },
  { id:4,  minLen:4, maxLen:5, maxDifficulty:2, wordsToPass:5, modes:["catch"], hunt:["word","sound"] },
  { id:5,  minLen:4, maxLen:5, maxDifficulty:2, wordsToPass:6, modes:["catch"], hunt:["syllable","first"] },
  { id:6,  minLen:5, maxLen:5, maxDifficulty:2, wordsToPass:6, modes:["catch"], hunt:["word","count"] },
  { id:7,  minLen:5, maxLen:6, maxDifficulty:3, wordsToPass:6, modes:["catch"], hunt:["sum"] },
  { id:8,  minLen:5, maxLen:6, maxDifficulty:3, wordsToPass:6, modes:["catch"], hunt:["sound","syllable"] },
  { id:9,  minLen:6, maxLen:6, maxDifficulty:3, wordsToPass:7, modes:["catch"], hunt:["word","sum"] },
  { id:10, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:7, modes:["catch"],
    hunt:["word","first","sound","syllable","count","sum"] }
];
