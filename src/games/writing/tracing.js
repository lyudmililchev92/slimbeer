/* ----------------------------------------------------------------------
 * Прототип „Напиши буквата“ — Canvas проследяване
 * Архитектурата вече поддържа оценка: evaluate() сравнява рисунката с
 * маска на буквата и връща 0..1 (по-късно може да стане по-прецизна).
 * -------------------------------------------------------------------- */
function createLetterTracer(wrap, guideCanvas, inkCanvas, letter){
  const gctx = guideCanvas.getContext("2d");
  const ictx = inkCanvas.getContext("2d");
  let size = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let mask = null;                       // щедра лента: къде е позволено да се рисува
  let core = null, corePixels = 0;       // самата буква: колко от нея е минато
  let drawing = false, pid = null, last = null;
  let inside = 0, outside = 0;           // точки в буквата и извън нея

  function fontFor(px){ return "800 " + px + "px " + getComputedStyle(document.body).fontFamily; }

  let lastSize = 0;
  function layout(){
    const w = wrap.clientWidth;
    if(!w || w === lastSize) return;      // още няма размер, или не се е променил
    lastSize = w;
    size = w;
    [guideCanvas, inkCanvas].forEach(c => {
      c.width = size * dpr; c.height = size * dpr;
      const cx = c.getContext("2d");
      cx.setTransform(1,0,0,1,0,0);
      cx.scale(dpr, dpr);
    });
    drawGuide();
    buildMask();
    reset();
  }

  function drawGuide(){
    gctx.clearRect(0, 0, size, size);
    const px = size * 0.68;
    gctx.textAlign = "center";
    gctx.textBaseline = "middle";
    gctx.font = fontFor(px);
    gctx.fillStyle = "rgba(108,92,231,.10)";
    gctx.fillText(letter, size/2, size/2);
    gctx.save();
    gctx.setLineDash([10, 12]);
    gctx.lineWidth = 4;
    gctx.strokeStyle = "rgba(108,92,231,.55)";
    gctx.strokeText(letter, size/2, size/2);
    gctx.restore();
  }

  /** Маска: удебелена буква — площта, в която е редно да се рисува. */
  function buildMask(){
    const m = document.createElement("canvas");
    m.width = size; m.height = size;
    const mc = m.getContext("2d");
    mc.textAlign = "center"; mc.textBaseline = "middle";
    mc.font = fontFor(size * 0.68);
    mc.lineWidth = size * 0.13;         // щедра лента — детските ръце треперят
    mc.lineJoin = "round";
    mc.strokeStyle = "#000"; mc.fillStyle = "#000";
    mc.strokeText(letter, size/2, size/2);
    mc.fillText(letter, size/2, size/2);
    mask = mc.getImageData(0, 0, size, size).data;

    // Втора маска — самата буква без удебеляване. Спрямо нея мерим
    // колко от буквата детето наистина е минало.
    const c2 = document.createElement("canvas");
    c2.width = size; c2.height = size;
    const cc = c2.getContext("2d");
    cc.textAlign = "center"; cc.textBaseline = "middle";
    cc.font = fontFor(size * 0.68);
    cc.fillStyle = "#000";
    cc.fillText(letter, size/2, size/2);
    core = cc.getImageData(0, 0, size, size).data;
    corePixels = 0;
    for(let y = 0; y < size; y += 4)
      for(let x = 0; x < size; x += 4)
        if(core[(y * size + x) * 4 + 3] > 60) corePixels++;
  }

  function isInside(x, y){
    if(!mask) return true;
    const ix = Math.round(x), iy = Math.round(y);
    if(ix < 0 || iy < 0 || ix >= size || iy >= size) return false;
    return mask[(iy * size + ix) * 4 + 3] > 40;
  }

  function reset(){ inside = 0; outside = 0; }

  function pos(ev){
    const r = inkCanvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * (size / r.width),
             y: (ev.clientY - r.top)  * (size / r.height) };
  }

  /* Рисуваме отсечка по отсечка и оцветяваме според това дали сме в буквата.
     Детето вижда веднага, че е излязло — не чак накрая. */
  function segment(from, to){
    const ok = isInside(to.x, to.y);
    ictx.strokeStyle = ok ? "#6C5CE7" : "#E9A0A8";
    ictx.lineWidth = Math.max(16, size * 0.075);
    ictx.lineCap = "round"; ictx.lineJoin = "round";
    ictx.beginPath();
    ictx.moveTo(from.x, from.y);
    ictx.lineTo(to.x, to.y);
    ictx.stroke();
    if(ok) inside++; else outside++;
  }

  function start(ev){
    pid = ev.pointerId; drawing = true;
    last = pos(ev);
    segment(last, { x: last.x + 0.01, y: last.y });
    try{ inkCanvas.setPointerCapture(pid); }catch(e){}
  }
  function move(ev){
    if(!drawing || ev.pointerId !== pid) return;
    const p = pos(ev);
    segment(last, p);
    last = p;
  }
  function end(ev){
    if(ev.pointerId !== pid) return;
    drawing = false;
    try{ inkCanvas.releasePointerCapture(pid); }catch(e){}
    pid = null; last = null;
  }

  inkCanvas.addEventListener("pointerdown", start);
  inkCanvas.addEventListener("pointermove", move);
  inkCanvas.addEventListener("pointerup", end);
  inkCanvas.addEventListener("pointercancel", end);
  /* Кутията още няма размер в първия кадър, а платното по подразбиране е
     300x150. Ако се откажем след един опит, оценката мери в грешен мащаб.
     Затова опитваме кадър след кадър, докато размерът се получи. */
  // Резервно: ако сигналът закъснее, опитваме и с таймер (той работи и
  // когато кадрите са задушени).
  let tries = 0;
  const settle = () => { layout(); if(!size && tries++ < 40) setTimeout(settle, 50); };
  setTimeout(settle, 0);

  // След това следим за промени (завъртане на таблет, смяна на прозорец).
  let ro = null;
  if(typeof ResizeObserver !== "undefined"){
    ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
  }
  const onResize = () => layout();
  window.addEventListener("resize", onResize);

  return {
    layout: layout,
    clear(){
      ictx.clearRect(0, 0, size, size);
      reset();
    },
    /** Кратка демонстрация: контурът светва по-плътно. */
    demo(){
      const px = size * 0.68;
      let t = 0;
      const step = () => {
        gctx.clearRect(0, 0, size, size);
        drawGuide();
        gctx.save();
        gctx.textAlign = "center"; gctx.textBaseline = "middle";
        gctx.font = fontFor(px);
        gctx.globalAlpha = 0.35 + 0.35 * Math.sin(t / 5);
        gctx.fillStyle = "#6C5CE7";
        gctx.fillText(letter, size/2, size/2);
        gctx.restore();
        t++;
        if(t < 60 && !REDUCED_MOTION) requestAnimationFrame(step);
        else drawGuide();
      };
      step();
    },
    /** Оценка: колко точно (в буквата ли е) и колко пълно (цялата буква ли). */
    evaluate(){
      const total = inside + outside;
      if(total < 12 || !core) return { status:"empty", precision:0, coverage:0 };
      const precision = inside / total;

      // Покритие: колко от пикселите на буквата са застъпени с мастило.
      const ink = ictx.getImageData(0, 0, size * dpr, size * dpr).data;
      const w = Math.floor(size * dpr);
      let hit = 0;
      for(let y = 0; y < size; y += 4){
        for(let x = 0; x < size; x += 4){
          if(core[(y * size + x) * 4 + 3] <= 60) continue;
          const ix = Math.floor(x * dpr), iy = Math.floor(y * dpr);
          if(ink[(iy * w + ix) * 4 + 3] > 40) hit++;
        }
      }
      const coverage = corePixels ? hit / corePixels : 0;

      let status = "ok";
      if(precision < 0.70)       status = "outside";      // рисува встрани
      else if(coverage < 0.35)   status = "incomplete";   // не е минал цялата
      return { status, precision, coverage };
    },
    destroy(){ window.removeEventListener("resize", onResize); if(ro) ro.disconnect(); }
  };
}
