/* =========================================================================
 * ЩРИХИ — от какви движения се състои буквата
 * -------------------------------------------------------------------------
 * Свободното рисуване проверява само дали мастилото е в буквата. Дете,
 * което пише „А“ отдолу нагоре, минава. Тук се пази и редът: откъде
 * започва щрихът, накъде върви и къде свършва.
 *
 * Как е описан щрихът: списък от точки в квадрат 0..1, y расте надолу.
 * Редът на точките е посоката на движение. Първата точка е началото,
 * последната — краят.
 *
 *     A: [ sLine(.5,.06, .14,.94), sLine(.5,.06, .86,.94), sLine(.24,.64, .76,.64) ]
 *
 * Проверката е нарочно търпелива. Дете на пет няма моторика за точност,
 * а целта е да усвои движението, не да улучи пиксел.
 * ========================================================================= */

const STROKES = { latin: {}, cyrillic: {} };

/** Права: две точки. */
function sLine(x1, y1, x2, y2){ return [[x1, y1], [x2, y2]]; }

/** Дъга в градуси, 0° е вдясно, ъгълът расте по часовниковата стрелка. */
function sArc(cx, cy, rx, ry, from, to, steps){
  const n = steps || 10, out = [];
  for(let i = 0; i <= n; i++){
    const a = (from + (to - from) * (i / n)) * Math.PI / 180;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

/** Чупена линия от изредени числа: sPath(x1,y1, x2,y2, x3,y3, …). */
function sPath(){
  const out = [];
  for(let i = 0; i + 1 < arguments.length; i += 2) out.push([arguments[i], arguments[i + 1]]);
  return out;
}

/* ---------------------------------------------------------------------
 * Проверка на един щрих
 * ------------------------------------------------------------------- */

const STROKE_TOLERANCE = 0.16;    // част от страната на платното
const STROKE_START_TOLERANCE = 0.22;

/** Дели щриха на равномерни контролни точки по дължина. */
function strokeCheckpoints(points, count){
  const n = count || 7;
  let total = 0;
  const segs = [];
  for(let i = 1; i < points.length; i++){
    const d = Math.hypot(points[i][0] - points[i-1][0], points[i][1] - points[i-1][1]);
    segs.push(d); total += d;
  }
  if(!total) return [points[0]];
  const out = [];
  for(let k = 0; k < n; k++){
    let want = (total * k) / (n - 1), i = 0;
    while(i < segs.length && want > segs[i]){ want -= segs[i]; i++; }
    if(i >= segs.length) { out.push(points[points.length - 1]); continue; }
    const f = segs[i] ? want / segs[i] : 0;
    out.push([points[i][0] + (points[i+1][0] - points[i][0]) * f,
              points[i][1] + (points[i+1][1] - points[i][1]) * f]);
  }
  return out;
}

/* Следи един щрих, докато детето го рисува. Не наказва: ако тръгне от
   грешното място или се отклони, щрихът просто не се брои и се опитва пак. */
function createStrokeTracker(points, opts){
  const o = opts || {};
  const checks = strokeCheckpoints(points, o.checkpoints || 7);
  const tol = o.tolerance || STROKE_TOLERANCE;
  const startTol = o.startTolerance || STROKE_START_TOLERANCE;
  let next = 0, started = false, strayed = 0;

  const near = (p, q, r) => Math.hypot(p[0] - q[0], p[1] - q[1]) <= r;

  return {
    checkpoints: checks,
    get progress(){ return next / (checks.length - 1 || 1); },
    get started(){ return started; },
    done(){ return next >= checks.length; },

    /** Връща "start-wrong" | "ok" при докосване. */
    begin(p){
      if(!near(p, checks[0], startTol)) return "start-wrong";
      started = true; next = 1; strayed = 0;
      return "ok";
    },

    /** Движение. Контролните точки се минават по ред — това е посоката. */
    move(p){
      if(!started) return "idle";
      // разрешаваме прескачане най-много на една точка напред, за да не
      // блокираме бърза ръка, но не и скачане до края
      for(let k = next; k < Math.min(next + 2, checks.length); k++){
        if(near(p, checks[k], tol)){ next = k + 1; strayed = 0; return this.done() ? "done" : "ok"; }
      }
      // далеч от следващата точка — брои се, но не спира детето
      if(!near(p, checks[Math.min(next, checks.length - 1)], tol * 2.4)) strayed++;
      return strayed > 40 ? "stray" : "ok";
    },

    /** Вдигане на пръста. Изисква да е стигнал до края. */
    finish(){ return this.done() ? "done" : "short"; },

    reset(){ next = 0; started = false; strayed = 0; }
  };
}

/** Щрихове за буква, ако ги има. Азбуките се различават. */
function strokesFor(letter, lang){
  const set = (lang || State.progress.language) === "bg" ? STROKES.cyrillic : STROKES.latin;
  return set[letter] || null;
}

function hasStrokes(letter, lang){ return !!strokesFor(letter, lang); }
