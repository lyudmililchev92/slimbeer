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

/* Смятането е повече от сметки. Първо идва усетът за количество: колко са,
   кое е повече, кое следва, коя форма е това. Аритметиката стъпва отгоре. */
const MATH_LEVELS = [
  { id:1,  modes:["count"],                          max:5,  wordsToPass:5 },
  { id:2,  modes:["count","shape"],                  max:10, wordsToPass:6 },
  { id:3,  modes:["count","match"],                  max:10, wordsToPass:6 },
  { id:4,  modes:["pattern","shape"],                max:10, wordsToPass:6 },
  { id:5,  modes:["sequence","match"],               max:10, wordsToPass:7 },
  { id:6,  modes:["add"],                            max:5,  wordsToPass:6 },
  { id:7,  modes:["add","count","pattern"],          max:10, wordsToPass:7 },
  { id:8,  modes:["sub"],                            max:5,  wordsToPass:6 },
  { id:9,  modes:["sub","add"],                      max:10, wordsToPass:7 },
  { id:10, modes:["compare","match"],                max:10, wordsToPass:6 },
  { id:11, modes:["build"],                          max:10, wordsToPass:7 },
  { id:12, modes:["add","sub","sequence","compare"], max:10, wordsToPass:8 },
  { id:13, modes:["build","pattern","shape"],        max:10, wordsToPass:8 },
  { id:14, modes:["add","sub","build"],              max:20, wordsToPass:8 },
  { id:15, modes:["add","sub","sequence","build","match","compare"], max:20, wordsToPass:9 }
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
  if(kind === "shape"){
    // Формите не са аритметика, но са същото умение: гледам и познавам.
    const target = rand(SHAPES);
    const others = shuffle(SHAPES.filter(s2 => s2.id !== target.id)).slice(0, 2);
    return { kind, shape: target.id, options: shuffle([target].concat(others)).map(s2 => s2.id) };
  }
  if(kind === "pattern"){
    // Редица от две или три неща, която се повтаря. Търси се следващото.
    const len = Math.random() < 0.55 ? 2 : 3;
    const set = shuffle(COUNT_ICONS).slice(0, len);
    const reps = 2 + Math.floor(Math.random() * 2);
    const seq = [];
    for(let i = 0; i < reps * len; i++) seq.push(set[i % len]);
    const answer = set[seq.length % len];
    const others = shuffle(COUNT_ICONS.filter(x => x !== answer)).slice(0, 2);
    return { kind, seq, answer, options: shuffle([answer].concat(others)) };
  }
  if(kind === "match"){
    // Число ↔ количество: показва се число, избира се групата с толкова неща.
    const n = upto(max);
    const wrong = shuffle([n - 2, n - 1, n + 1, n + 2, n + 3]
      .filter(v => v >= 1 && v <= 20 && v !== n)).slice(0, 2);
    return { kind, icon, n, options: shuffle([n].concat(wrong)) };
  }
  if(kind === "build"){
    // „Направи 8“: показва се 5 + ? и се търси другото събираемо.
    const total = 3 + Math.floor(Math.random() * (max - 2));
    const a = 1 + Math.floor(Math.random() * (total - 1));
    return { kind, icon, total, a };
  }
  const a = upto(max - 1);
  return { kind:"add", icon, a, b: upto(Math.max(1, max - a)) };
}

/* Формите се учат по вид, не по име — детето вижда фигурата и я познава. */
const SHAPES = [
  { id:"circle",    draw:"circle"    },
  { id:"square",    draw:"square"    },
  { id:"triangle",  draw:"triangle"  },
  { id:"rectangle", draw:"rectangle" },
  { id:"star",      draw:"star"      },
  { id:"heart",     draw:"heart"     }
];
function mathAnswer(it){
  if(it.kind === "shape")    return it.shape;      // отговорът е вид, не число
  if(it.kind === "pattern")  return it.answer;     // отговорът е картинка
  if(it.kind === "match")    return it.n;
  if(it.kind === "build")    return it.total - it.a;
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
