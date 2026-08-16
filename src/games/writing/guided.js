/* =========================================================================
 * ВОДЕНО ПИСАНЕ
 * -------------------------------------------------------------------------
 * Свободното рисуване проверява дали мастилото е в буквата. Тук се води и
 * ръката: щрих по щрих, всеки със своето начало, посока и край.
 *
 * Детето не чете, затова указанието е рисувано: номер в кръгче на
 * началото, пунктир по пътя и стрелка накрая. Текущият щрих е цветен,
 * следващите са бледи, готовите остават нарисувани.
 *
 * Проверката е търпелива по проект. Ако тръгне от грешното място или
 * спре по средата, щрихът просто не се брои и се опитва пак — без звук
 * на грешка, без червено, без броене на провали.
 * ========================================================================= */

function createGuidedTracer(wrap, guideCanvas, inkCanvas, letter, lang){
  const gctx = guideCanvas.getContext("2d");
  const ictx = inkCanvas.getContext("2d");
  const strokes = strokesFor(letter, lang) || [];
  let size = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let index = 0;                 // кой щрих се пише сега
  let tracker = null;
  let drawing = false;
  let lastPoint = null;
  let onProgress = null;

  function layout(){
    const box = Math.min(wrap.clientWidth, wrap.clientHeight);
    if(!box) return false;
    size = box;
    [guideCanvas, inkCanvas].forEach(c => {
      c.width = box * dpr; c.height = box * dpr;
      c.style.width = box + "px"; c.style.height = box + "px";
      const ctx = c.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    });
    redraw();
    return true;
  }

  const toPx = (p) => [p[0] * size, p[1] * size];

  function pathOf(points){
    gctx.beginPath();
    points.forEach((p, i) => {
      const [x, y] = toPx(p);
      if(i) gctx.lineTo(x, y); else gctx.moveTo(x, y);
    });
  }

  /* Стрелка накрая: детето вижда накъде върви щрихът, без да чете. */
  function arrowHead(from, to, color){
    const [x1, y1] = toPx(from), [x2, y2] = toPx(to);
    const a = Math.atan2(y2 - y1, x2 - x1);
    const s = Math.max(10, size * 0.045);
    gctx.fillStyle = color;
    gctx.beginPath();
    gctx.moveTo(x2, y2);
    gctx.lineTo(x2 - s * Math.cos(a - 0.42), y2 - s * Math.sin(a - 0.42));
    gctx.lineTo(x2 - s * Math.cos(a + 0.42), y2 - s * Math.sin(a + 0.42));
    gctx.closePath();
    gctx.fill();
  }

  function startDot(p, n, color){
    const [x, y] = toPx(p);
    const r = Math.max(12, size * 0.055);
    gctx.fillStyle = color;
    gctx.beginPath(); gctx.arc(x, y, r, 0, Math.PI * 2); gctx.fill();
    gctx.fillStyle = "#FFF";
    gctx.font = "800 " + Math.round(r * 1.15) + "px " + getComputedStyle(document.body).fontFamily;
    gctx.textAlign = "center"; gctx.textBaseline = "middle";
    gctx.fillText(String(n), x, y + r * 0.06);
  }

  function redraw(){
    if(!size) return;
    gctx.clearRect(0, 0, size, size);
    gctx.lineCap = "round"; gctx.lineJoin = "round";

    strokes.forEach((pts, i) => {
      const done = i < index;
      const active = i === index;
      gctx.lineWidth = Math.max(10, size * 0.055);
      gctx.setLineDash(active ? [size * 0.03, size * 0.035] : []);
      gctx.strokeStyle = done ? "rgba(125,111,240,.30)"
                       : active ? "#C9C1FF" : "rgba(42,42,69,.10)";
      pathOf(pts);
      gctx.stroke();
      gctx.setLineDash([]);

      // Номерът се рисува само на текущия щрих. При букви като Ж няколко
      // щриха тръгват от почти същата точка и кръгчетата се трупаха едно
      // върху друго — ставаше по-объркващо, отколкото полезно.
      if(active){
        arrowHead(pts[pts.length - 2] || pts[0], pts[pts.length - 1], "#8E82E8");
        startDot(pts[0], i + 1, "#7D6FF0");
      }
    });
  }

  function pos(ev){
    const r = inkCanvas.getBoundingClientRect();
    return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
  }

  function inkSegment(from, to){
    ictx.strokeStyle = "#6C5CE7";
    ictx.lineWidth = Math.max(12, size * 0.062);
    ictx.lineCap = "round"; ictx.lineJoin = "round";
    ictx.beginPath();
    const a = toPx(from), b = toPx(to);
    ictx.moveTo(a[0], a[1]); ictx.lineTo(b[0], b[1]);
    ictx.stroke();
  }

  function beginStroke(ev){
    if(index >= strokes.length) return;
    const p = pos(ev);
    tracker = createStrokeTracker(strokes[index]);
    const res = tracker.begin(p);
    if(res === "start-wrong"){
      // Не е грешка — просто показваме пак откъде се тръгва.
      pulseStart();
      tracker = null;
      return;
    }
    drawing = true;
    lastPoint = p;
    try{ inkCanvas.setPointerCapture(ev.pointerId); }catch(e){}
  }

  function moveStroke(ev){
    if(!drawing || !tracker) return;
    const p = pos(ev);
    inkSegment(lastPoint, p);
    lastPoint = p;
    tracker.move(p);
  }

  function endStroke(){
    if(!drawing){ return; }
    drawing = false;
    const res = tracker ? tracker.finish() : "short";
    if(res === "done"){
      index += 1;
      Sfx.place();
      redraw();
      if(onProgress) onProgress(index, strokes.length);
    } else {
      // недовършен щрих: изтриваме опита и каним пак, без наказание
      clearInk();
      redrawDoneStrokes();
      pulseStart();
    }
    tracker = null;
  }

  function clearInk(){ ictx.clearRect(0, 0, size, size); }

  /* Готовите щрихове остават нарисувани, за да се вижда напредъкът. */
  function redrawDoneStrokes(){
    for(let i = 0; i < index; i++){
      const pts = strokes[i];
      for(let k = 1; k < pts.length; k++) inkSegment(pts[k-1], pts[k]);
    }
  }

  function pulseStart(){
    if(index >= strokes.length) return;
    const pts = strokes[index];
    let t = 0;
    const step = () => {
      if(t > 26) { redraw(); return; }
      redraw();
      const [x, y] = toPx(pts[0]);
      const r = Math.max(12, size * 0.055) * (1 + Math.sin(t * 0.4) * 0.35);
      gctx.strokeStyle = "#FF9DBB"; gctx.lineWidth = 4;
      gctx.beginPath(); gctx.arc(x, y, r * 1.5, 0, Math.PI * 2); gctx.stroke();
      t++;
      requestAnimationFrame(step);
    };
    if(REDUCED_MOTION) redraw(); else step();
  }

  inkCanvas.addEventListener("pointerdown", (e) => { e.preventDefault(); beginStroke(e); });
  inkCanvas.addEventListener("pointermove", moveStroke);
  inkCanvas.addEventListener("pointerup", endStroke);
  inkCanvas.addEventListener("pointercancel", endStroke);
  inkCanvas.addEventListener("pointerleave", endStroke);

  return {
    layout,
    strokeCount: strokes.length,
    get index(){ return index; },
    done(){ return index >= strokes.length; },
    onProgress(fn){ onProgress = fn; },
    /** Подсказка: показва движението на текущия щрих. */
    showNext(){
      if(index >= strokes.length) return;
      const pts = strokes[index];
      let k = 0;
      const step = () => {
        if(k >= pts.length){ setTimeout(() => { clearInk(); redrawDoneStrokes(); }, 500); return; }
        if(k) inkSegment(pts[k-1], pts[k]);
        k++;
        if(REDUCED_MOTION) step(); else setTimeout(step, 90);
      };
      clearInk(); redrawDoneStrokes(); step();
    },
    reset(){ index = 0; tracker = null; clearInk(); redraw(); },
    destroy(){}
  };
}
