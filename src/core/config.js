/* =========================================================================
 * 1. CONFIG
 * ========================================================================= */
const DEBUG = false;                 // true → показва debug панел (смяна на ниво, reset, текуща дума)

const CONFIG = {
  saveKey: "bukvik.save",
  saveVersion: 6,
  starsPerWord: { perfect: 3, good: 2, ok: 1 },
  mistakesForHighlight: 2,           // след толкова грешки — ненатрапчиво подсказваме
  celebrateEvery: 5,                 // на всеки N решени думи — малък празник
  recentMemory: 16,                  // колко думи да не се повтарят
  nextDelay: 1100                    // пауза преди бутона "Следваща"
};

/* Системното предпочитание се уважава по подразбиране, но родителят може
   да включи спокойния режим и без него — някои деца се разсейват от
   движение, което операционната система не знае за тях. */
const SYSTEM_REDUCED_MOTION = !!(window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches);
let REDUCED_MOTION = SYSTEM_REDUCED_MOTION;

function applyCalmMode(){
  REDUCED_MOTION = SYSTEM_REDUCED_MOTION ||
    !!(State.progress && State.progress.settings && State.progress.settings.reduceMotion);
  document.documentElement.classList.toggle("calm", REDUCED_MOTION);
}

/* По-едър шрифт за деца, които още не различават дребното. Мащабира
   всичко наведнъж, защото размерите идват от токени. */
function applyBigText(){
  const on = !!(State.progress && State.progress.settings && State.progress.settings.bigText);
  document.documentElement.classList.toggle("big-text", on);
}
