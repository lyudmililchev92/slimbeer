/* -------------------------------------------------------------------------
 * Речник. Всеки ред е "БГ-СРИЧ-КИ/NL-SYL-LA-BEN картинка".
 * Двата езика делят една картинка, затова не могат да се разминат.
 * "-" вместо дума = понятието не се използва на този език.
 * ----------------------------------------------------------------------- */
/* Речникът живее в words.js, за да се добавят думи, без да се пипа кодът.
   Той се зарежда преди този файл и оставя речника на window. */
const WORD_SOURCE = window.WORD_SOURCE || {};
if(!Object.keys(WORD_SOURCE).length){
  // По-добре ясно съобщение, отколкото игра без нито една дума.
  document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    if(app) app.textContent = "words.js липсва — сложи го до index.html.";
  });
}


/** Разгъва речника за даден език. */
function buildWords(lang, isImageUsable){
  const out = [];
  const index = lang === "bg" ? 0 : 1;
  for(const category in WORD_SOURCE){
    WORD_SOURCE[category].split(/[|\n]/).forEach(raw => {
      const entry = raw.trim();
      if(!entry) return;
      const parts = entry.split(/\s+/);
      const split = (parts[0].split("/")[index] || "").trim();
      if(!split || split === "-") return;              // няма дума на този език
      const syllables = split.split("-");
      const word = syllables.join("");
      const image = parts[1] || "";
      const w = {
        word: word,
        display: word.charAt(0) + word.slice(1).toLowerCase(),
        category: category,
        syllables: syllables,
        difficulty: word.length <= 4 ? 1 : (word.length <= 6 ? 2 : 3)
      };
      if(image === "~"){
        // Дума без картинка: детето я чува и я подрежда. Влиза само там,
        // където има глас — иначе е неиграема.
        w.audioOnly = true;
        out.push(w);
      } else {
        if(image.charAt(0) === "@") w.art = image.slice(1);
        else w.emoji = image;
        if(isImageUsable(w)) out.push(w);
      }
    });
  }
  return out;
}

/* Попълва се в init() и при смяна на език. */
let WORDS = [];

/* Дума, която има какво да покаже. Озвучените нямат и не бива да
   попадат сред картинките за избор — там ставаха "undefined". */
function hasPicture(w){
  return !!w && !w.audioOnly && !!(w.emoji || (w.art && ART[w.art]));
}
function pictureWords(){ return WORDS.filter(hasPicture); }

