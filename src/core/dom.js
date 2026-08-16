/* =========================================================================
 * 6. DOM / помощни функции
 * ========================================================================= */
function h(tag, props, ...children){
  const e = document.createElement(tag);
  if(props){
    for(const k in props){
      const v = props[k];
      if(v === null || v === undefined || v === false) continue;
      if(k === "class") e.className = v;
      else if(k === "html") e.innerHTML = v;
      else if(k === "style") Object.assign(e.style, v);
      else if(k.slice(0,2) === "on") e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v === true ? "" : v);
    }
  }
  children.flat().forEach(c => {
    if(c === null || c === undefined || c === false) return;
    e.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  });
  return e;
}

const shuffle = (arr) => {
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
};
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Разбърква токени, но избягва вече подредения резултат. Всеки токен има uid. */
function shuffledTokens(tokens){
  const withId = tokens.map((t, i) => ({ id: "t" + i, text: t }));
  if(withId.length < 2) return withId;
  let out = withId, tries = 0;
  do{
    out = shuffle(withId);
    tries++;
  } while(tries < 40 && out.map(o => o.text).join("") === tokens.join(""));
  return out;
}

function shakeEl(el){
  if(!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;                       // рестарт на анимацията
  el.classList.add("shake");
  setTimeout(() => el.classList.remove("shake"), 480);
}

function backButton(onClick, label){
  return h("button", { class:"icon-btn", "aria-label": label || t("back"), onClick: () => { Sfx.tap(); onClick(); } }, "←");
}

/* Маскот „Буки“ — прост inline SVG персонаж */
function MASCOT_NAME(){ return t("mascotName"); }
function mascotSVG(cls){
  return '<svg class="' + (cls||"") + '" viewBox="0 0 120 120" role="img" aria-label="' + MASCOT_NAME() + '">' +
    '<ellipse cx="60" cy="112" rx="34" ry="6" fill="rgba(42,42,69,.10)"/>' +
    '<path d="M28 44 L20 16 L44 30 Z" fill="#6C5CE7"/><path d="M92 44 L100 16 L76 30 Z" fill="#6C5CE7"/>' +
    '<ellipse cx="60" cy="66" rx="42" ry="42" fill="#7D6FF0"/>' +
    '<ellipse cx="60" cy="80" rx="27" ry="24" fill="#EDEAFF"/>' +
    '<circle cx="45" cy="58" r="14" fill="#fff"/><circle cx="75" cy="58" r="14" fill="#fff"/>' +
    '<circle cx="47" cy="59" r="7" fill="#2A2A45"/><circle cx="73" cy="59" r="7" fill="#2A2A45"/>' +
    '<circle cx="49.5" cy="56" r="2.6" fill="#fff"/><circle cx="75.5" cy="56" r="2.6" fill="#fff"/>' +
    '<path d="M54 74 h12 l-6 8 z" fill="#FFB443"/>' +
    '<path d="M52 90 q8 7 16 0" stroke="#6C5CE7" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="32" cy="76" r="6" fill="#FF9DBB" opacity=".65"/><circle cx="88" cy="76" r="6" fill="#FF9DBB" opacity=".65"/>' +
    '</svg>';
}
