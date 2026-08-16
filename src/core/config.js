/* =========================================================================
 * 1. CONFIG
 * ========================================================================= */
const DEBUG = false;                 // true → показва debug панел (смяна на ниво, reset, текуща дума)

const CONFIG = {
  saveKey: "bukvik.save",
  saveVersion: 4,
  starsPerWord: { perfect: 3, good: 2, ok: 1 },
  mistakesForHighlight: 2,           // след толкова грешки — ненатрапчиво подсказваме
  celebrateEvery: 5,                 // на всеки N решени думи — малък празник
  recentMemory: 16,                  // колко думи да не се повтарят
  nextDelay: 1100                    // пауза преди бутона "Следваща"
};

const REDUCED_MOTION = window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
