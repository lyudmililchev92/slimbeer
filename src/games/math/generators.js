/* =========================================================================
 * 9. PLAY HOST — екранът на играта
 * ========================================================================= */

/* =========================================================================
 * 8b. СМЯТАНЕ
 * -------------------------------------------------------------------------
 * Задачите се раждат от правилата на нивото, не от речник — затова
 * не се повтарят и се мащабират до колкото ни трябва.
 * ========================================================================= */
const COUNT_ICONS = ["🍎","⭐","🐟","🌸","🎈","🍓","🐞","🌰","🧩","🚗"];

const MATH_LEVELS = [
  { id:1,  modes:["count"],                      max:5,  wordsToPass:5 },
  { id:2,  modes:["count"],                      max:10, wordsToPass:6 },
  { id:3,  modes:["count","sequence"],           max:10, wordsToPass:6 },
  { id:4,  modes:["add"],                        max:5,  wordsToPass:6 },
  { id:5,  modes:["add","count"],                max:10, wordsToPass:7 },
  { id:6,  modes:["sub"],                        max:5,  wordsToPass:6 },
  { id:7,  modes:["sub","add"],                  max:10, wordsToPass:7 },
  { id:8,  modes:["compare"],                    max:10, wordsToPass:6 },
  { id:9,  modes:["add","sub","count","compare"],max:10, wordsToPass:8 },
  { id:10, modes:["add","sub","sequence"],       max:20, wordsToPass:8 }
];

/** Ражда задача според правилата на нивото. */
function pickMathItem(level){
  const kind = rand(level.modes);
  const max = level.max, icon = rand(COUNT_ICONS);
  const upto = (n) => 1 + Math.floor(Math.random() * n);
  if(kind === "count")    return { kind, icon, n: upto(max) };
  if(kind === "sequence"){
    const start = 1 + Math.floor(Math.random() * Math.max(1, max - 4));
    const seq = [start, start+1, start+2, start+3];
    return { kind, seq, gap: 1 + Math.floor(Math.random() * 2) };
  }
  if(kind === "compare"){
    let a = upto(max), b = upto(max);
    while(a === b) b = upto(max);
    return { kind, icon, a, b };
  }
  if(kind === "sub"){
    const a = 2 + Math.floor(Math.random() * (max - 1));
    return { kind, icon, a, b: 1 + Math.floor(Math.random() * (a - 1)) };
  }
  const a = upto(max - 1);
  return { kind:"add", icon, a, b: upto(Math.max(1, max - a)) };
}
function mathAnswer(it){
  if(it.kind === "count")    return it.n;
  if(it.kind === "add")      return it.a + it.b;
  if(it.kind === "sub")      return it.a - it.b;
  if(it.kind === "sequence") return it.seq[it.gap];
  return Math.max(it.a, it.b);
}
/** Име на числото на активния език — за изговор. */
function numberWord(n){
  const list = L().numbers;
  return (list && list[n] !== undefined) ? list[n] : String(n);
}
/** Ред от иконки за броене. */
function iconRow(icon, count, cls){
  const box = h("div", { class:"count-row " + (cls || "") });
  for(let i = 0; i < count; i++) box.appendChild(h("span", { class:"count-item" }, icon));
  return box;
}
/** Три възможни отговора: верният и два близки. */
function numberOptions(answer, max){
  const set = new Set([answer]);
  let guard = 0;
  while(set.size < 3 && guard++ < 50){
    const d = 1 + Math.floor(Math.random() * 3);
    const cand = Math.random() < 0.5 ? answer - d : answer + d;
    if(cand >= 0 && cand <= Math.max(max, answer + 3)) set.add(cand);
  }
  let n = 0;
  while(set.size < 3) set.add(answer + (++n));
  return shuffle([...set]);
}

/** Общ конструктор: показва задачата и три числа за отговор. */
