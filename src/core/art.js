/* =========================================================================
 * 2. ART — image system
 * -------------------------------------------------------------------------
 * Всяка дума сочи или към ART[key] (inline SVG), или има emoji fallback.
 * За да сменим по-късно картинките с истински илюстрации, е достатъчно да
 * добавим нов ключ в ART и да го посочим в думата (renderArt не се променя).
 * ========================================================================= */
const SVG = (body) => '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">' + body + '</svg>';
const SHADOW = '<ellipse cx="100" cy="176" rx="58" ry="10" fill="rgba(42,42,69,.08)"/>';

const ART = {
  cat: SVG(SHADOW +
    '<path d="M52 80 L45 32 L88 58 Z" fill="#F2A65A"/><path d="M148 80 L155 32 L112 58 Z" fill="#F2A65A"/>' +
    '<path d="M57 76 L53 45 L80 60 Z" fill="#FFD3C0"/><path d="M143 76 L147 45 L120 60 Z" fill="#FFD3C0"/>' +
    '<ellipse cx="100" cy="106" rx="62" ry="56" fill="#F7B267"/>' +
    '<ellipse cx="100" cy="122" rx="40" ry="30" fill="#FFE6CC"/>' +
    '<ellipse cx="78" cy="98" rx="10" ry="13" fill="#3C3355"/><ellipse cx="122" cy="98" rx="10" ry="13" fill="#3C3355"/>' +
    '<circle cx="81.5" cy="93" r="3.6" fill="#fff"/><circle cx="125.5" cy="93" r="3.6" fill="#fff"/>' +
    '<path d="M92 116 h16 l-8 9 z" fill="#FF8FA3"/><path d="M100 125 v6" stroke="#3C3355" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M100 131 q-9 9 -17 1 M100 131 q9 9 17 1" stroke="#3C3355" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<g stroke="#3C3355" stroke-width="2.6" stroke-linecap="round"><path d="M62 110 H28 M62 120 H31 M138 110 H172 M138 120 H169"/></g>'),

  fish: SVG(
    '<path d="M150 100 L184 72 v56 Z" fill="#F4A259"/>' +
    '<ellipse cx="92" cy="100" rx="66" ry="42" fill="#5EC5E8"/>' +
    '<path d="M92 58 q26 16 26 42 t-26 42" fill="none" stroke="#3AA9D0" stroke-width="5"/>' +
    '<path d="M60 78 q22 10 22 22 t-22 22" fill="none" stroke="#3AA9D0" stroke-width="5"/>' +
    '<circle cx="48" cy="92" r="10" fill="#fff"/><circle cx="46" cy="92" r="5.5" fill="#2A2A45"/>' +
    '<path d="M34 108 q10 8 20 4" stroke="#2A2A45" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="20" cy="66" r="7" fill="#BFE8F6"/><circle cx="34" cy="48" r="5" fill="#BFE8F6"/>'),

  sun: SVG(
    '<g stroke="#FFB443" stroke-width="11" stroke-linecap="round">' +
    '<path d="M100 12 v22 M100 166 v22 M12 100 h22 M166 100 h22 M38 38 l16 16 M146 146 l16 16 M162 38 l-16 16 M54 146 l-16 16"/></g>' +
    '<circle cx="100" cy="100" r="52" fill="#FFD166"/><circle cx="100" cy="100" r="42" fill="#FFE29A"/>' +
    '<circle cx="84" cy="94" r="6" fill="#7A5312"/><circle cx="116" cy="94" r="6" fill="#7A5312"/>' +
    '<path d="M82 114 q18 16 36 0" stroke="#7A5312" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<circle cx="72" cy="112" r="8" fill="#FFB0A8" opacity=".6"/><circle cx="128" cy="112" r="8" fill="#FFB0A8" opacity=".6"/>'),

  house: SVG(SHADOW +
    '<path d="M100 26 L178 92 H22 Z" fill="#F26B6B"/>' +
    '<rect x="42" y="90" width="116" height="80" rx="10" fill="#FFE9D6"/>' +
    '<rect x="84" y="118" width="34" height="52" rx="6" fill="#8C6A4F"/>' +
    '<circle cx="111" cy="146" r="3.6" fill="#FFD166"/>' +
    '<rect x="52" y="106" width="26" height="26" rx="6" fill="#7CC5EB" stroke="#fff" stroke-width="4"/>' +
    '<rect x="124" y="106" width="26" height="26" rx="6" fill="#7CC5EB" stroke="#fff" stroke-width="4"/>' +
    '<rect x="132" y="38" width="20" height="34" rx="5" fill="#C94F4F"/>'),

  apple: SVG(SHADOW +
    '<path d="M100 58 q-8 -22 -26 -28 q12 20 22 30 Z" fill="#7BB661"/>' +
    '<rect x="96" y="40" width="8" height="24" rx="4" fill="#8C6A4F"/>' +
    '<path d="M100 62 c-30 -22 -66 -2 -62 38 c3 34 28 62 44 62 c8 0 12 -5 18 -5 s10 5 18 5 c16 0 41 -28 44 -62 c4 -40 -32 -60 -62 -38 Z" fill="#E4574F"/>' +
    '<path d="M74 92 q-8 12 -6 26" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".55"/>'),

  ball: SVG(SHADOW +
    '<circle cx="100" cy="100" r="66" fill="#FFFFFF" stroke="#DDE1F0" stroke-width="4"/>' +
    '<path d="M100 46 l26 19 -10 31 h-32 l-10 -31 Z" fill="#2A2A45"/>' +
    '<path d="M100 34 v12 M64 78 l-20 -8 M136 78 l20 -8 M84 128 l-12 22 M116 128 l12 22" stroke="#2A2A45" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M46 106 q-6 20 4 34 M154 106 q6 20 -4 34 M62 158 q38 16 76 0" stroke="#2A2A45" stroke-width="6" fill="none" stroke-linecap="round"/>'),

  car: SVG(SHADOW +
    '<path d="M28 128 v-24 q0 -10 10 -12 l18 -3 l18 -22 q4 -5 11 -5 h42 q7 0 11 5 l16 22 l20 5 q10 3 10 13 v21 q0 8 -8 8 H36 q-8 0 -8 -8 Z" fill="#6C8CF5"/>' +
    '<path d="M84 70 h26 v22 H70 Z M118 70 h14 l16 22 h-30 Z" fill="#CFE6FF"/>' +
    '<circle cx="66" cy="140" r="20" fill="#2A2A45"/><circle cx="66" cy="140" r="8" fill="#C6CCE6"/>' +
    '<circle cx="140" cy="140" r="20" fill="#2A2A45"/><circle cx="140" cy="140" r="8" fill="#C6CCE6"/>' +
    '<rect x="26" y="106" width="14" height="10" rx="5" fill="#FFD166"/>'),

  tree: SVG(SHADOW +
    '<rect x="90" y="112" width="20" height="58" rx="8" fill="#8C6A4F"/>' +
    '<circle cx="100" cy="76" r="42" fill="#5FBF7A"/><circle cx="66" cy="100" r="30" fill="#4FAE6A"/>' +
    '<circle cx="134" cy="100" r="30" fill="#6FCB8A"/><circle cx="100" cy="106" r="30" fill="#5FBF7A"/>' +
    '<circle cx="78" cy="70" r="6" fill="#E4574F"/><circle cx="122" cy="88" r="6" fill="#E4574F"/>'),

  flower: SVG(SHADOW +
    '<path d="M100 108 v56" stroke="#5FBF7A" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M100 138 q-26 -6 -30 -26 q26 0 30 26 Z" fill="#5FBF7A"/>' +
    '<g fill="#FF7BA9"><ellipse cx="100" cy="52" rx="20" ry="26"/><ellipse cx="100" cy="108" rx="20" ry="26"/>' +
    '<ellipse cx="72" cy="80" rx="26" ry="20"/><ellipse cx="128" cy="80" rx="26" ry="20"/></g>' +
    '<circle cx="100" cy="80" r="19" fill="#FFD166"/>'),

  moon: SVG(
    '<path d="M124 24 a78 78 0 1 0 44 128 a62 62 0 0 1 -44 -128 Z" fill="#FFD166"/>' +
    '<circle cx="122" cy="86" r="9" fill="#F0BE55"/><circle cx="146" cy="118" r="6" fill="#F0BE55"/>' +
    '<circle cx="112" cy="128" r="5" fill="#F0BE55"/>' +
    '<path d="M44 40 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4 Z" fill="#FFE29A"/>' +
    '<path d="M162 52 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 Z" fill="#FFE29A"/>'),

  cloud: SVG(
    '<circle cx="70" cy="106" r="34" fill="#FFFFFF"/><circle cx="106" cy="88" r="42" fill="#FFFFFF"/>' +
    '<circle cx="142" cy="110" r="30" fill="#FFFFFF"/><rect x="66" y="106" width="80" height="34" rx="17" fill="#FFFFFF"/>' +
    '<circle cx="70" cy="106" r="34" fill="none" stroke="#DDE6F5" stroke-width="3"/>' +
    '<circle cx="106" cy="88" r="42" fill="none" stroke="#DDE6F5" stroke-width="3"/>'),

  boat: SVG(
    '<path d="M100 26 l44 62 h-44 Z" fill="#FF8A6B"/><path d="M92 34 l-34 54 h34 Z" fill="#FFD166"/>' +
    '<rect x="95" y="24" width="7" height="66" rx="3" fill="#8C6A4F"/>' +
    '<path d="M28 100 h144 l-24 42 q-4 8 -14 8 H66 q-10 0 -14 -8 Z" fill="#E4574F"/>' +
    '<path d="M12 156 q22 -12 44 0 t44 0 t44 0 t44 0" stroke="#5EC5E8" stroke-width="9" fill="none" stroke-linecap="round"/>')
};

/* -------------------------------------------------------------------------
 * Проверка дали устройството може да покаже дадено emoji.
 * Рисуваме знака в скрит canvas и го сравняваме с неназначена кодова точка,
 * която винаги се рисува като празно квадратче. Ако съвпадат — шрифтът няма
 * този знак и думата отпада от речника, вместо детето да види квадратче.
 * Не хваща ZWJ последователности (те се разпадат на две картинки вместо на
 * квадратче), затова в речника няма нито една такава.
 * ----------------------------------------------------------------------- */
/** Върви ли играта вградена в чужда страница. Там браузърите ограничават
    звука и говора, а страницата няма как да си вдигне разрешението сама. */
function inForeignFrame(){
  try{ return window.top !== window.self && !window.top.location.href; }
  catch(e){ return true; }          // достъпът гръмна → различен произход
}

function createEmojiProbe(){
  let ctx, canvas;
  try{
    canvas = document.createElement("canvas");
    canvas.width = canvas.height = 20;
    ctx = canvas.getContext("2d", { willReadFrequently:true });
  }catch(e){ ctx = null; }
  if(!ctx) return () => true;                 // няма canvas → пускаме всичко

  ctx.textBaseline = "top";
  ctx.font = "16px sans-serif";
  const draw = (ch) => {
    ctx.clearRect(0, 0, 20, 20);
    ctx.fillText(ch, 0, 0);
    return canvas.toDataURL();
  };
  let missing, empty;
  try{
    missing = draw("􏿿");           // U+10FFFF — винаги липсва
    empty = draw(" ");
  }catch(e){ return () => true; }

  const cache = Object.create(null);
  return (ch) => {
    if(!ch) return false;
    if(cache[ch] === undefined){
      let px;
      try{ px = draw(ch); }catch(e){ return true; }
      cache[ch] = px !== missing && px !== empty;
    }
    return cache[ch];
  };
}

/** Връща DOM елемент с илюстрацията на дадена дума (SVG или emoji). */
function renderArt(word, cls){
  const box = document.createElement("div");
  box.className = "art " + (cls || "");
  if (word.art && ART[word.art]) box.innerHTML = ART[word.art];
  else if (word.emoji) box.innerHTML = '<span class="emoji" role="img" aria-label="' + word.display + '">' + word.emoji + "</span>";
  else {
    // Дума без картинка не бива да стига дотук, но ако стигне, детето
    // вижда високоговорител вместо думата "undefined".
    box.innerHTML = '<span class="emoji" role="img" aria-label="' + (word.display || "") + '">\uD83D\uDD0A</span>';
  }
  return box;
}
