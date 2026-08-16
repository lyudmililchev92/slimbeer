/* =========================================================================
 * 7. ANIMATIONS — конфети
 * ========================================================================= */
function runConfetti(canvas){
  if(REDUCED_MOTION || !canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, hgt = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = hgt * dpr;
  ctx.scale(dpr, dpr);
  canvas.hidden = false;

  const colors = ["#6C5CE7","#FFB443","#2FBF71","#FF7BA9","#48B7F0"];
  const parts = [];
  for(let i = 0; i < 54; i++){
    parts.push({
      x: w/2 + (Math.random()-0.5) * w * 0.5,
      y: hgt * 0.42 + (Math.random()-0.5) * 40,
      vx: (Math.random()-0.5) * 5.2,
      vy: -3 - Math.random() * 5.5,
      s: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random()-0.5) * 0.22,
      c: colors[i % colors.length]
    });
  }
  const start = performance.now();
  function frame(now){
    const t = now - start;
    ctx.clearRect(0, 0, w, hgt);
    parts.forEach(p => {
      p.vy += 0.16; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - t/1800);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s * 0.65);
      ctx.restore();
    });
    if(t < 1800) requestAnimationFrame(frame);
    else { ctx.clearRect(0,0,w,hgt); canvas.hidden = true; }
  }
  requestAnimationFrame(frame);
}
