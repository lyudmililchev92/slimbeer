/* =========================================================================
 * 8c. ЛОВ НА БУКВИТЕ — 2D игра с движение
 * -------------------------------------------------------------------------
 * Буки стои долу и се движи с пръст. Буквите падат бавно отгоре.
 * Детето хваща тази, която е наред в думата.
 *
 * Нарочно няма таймер, животи и край на играта: сгрешена буква само
 * отскача, пропусната се връща по-късно. Натискът е нула, ученето остава.
 * ========================================================================= */
const MODE_CATCH = {
  id:"catch", showsPicture:false, fullArea:true,
  supports(word){ return !word.audioOnly && word.word.length >= 3 && word.word.length <= 7; },

  mount(root, host){
    const word = host.word;
    /* Какво точно се лови решава задачата, не играта. Виж tasks.js. */
    const task = buildCatchTask(getLevel(LP().currentLevel), word);
    const letters = task.targets;
    let need = 0, mistakes = 0, running = true, raf = 0;

    /* ---- горна лента: задачата казва какво да стои горе ---- */
    const head = h("div", { class:"catch-head" });
    task.head(head);
    const slotsEl = h("div", { class:"catch-slots" });
    const slotEls = letters.map((ch, i) => {
      const el = h("span", { class:"catch-slot" + (i === 0 ? " next" : "") +
                                    (task.wide ? " wide" : "") }, "");
      slotsEl.appendChild(el);
      return el;
    });
    head.appendChild(slotsEl);
    root.appendChild(head);
    if(task.say) setTimeout(task.say, 420);

    const wrap = h("div", { class:"catch-wrap" });
    const canvas = h("canvas");
    wrap.appendChild(canvas);
    root.appendChild(wrap);

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    /* ---- Буки, нарисуван веднъж и после само местен ---- */
    const hero = { x: 0.5, img: null, ready: false };
    try{
      const img = new Image();
      img.onload = () => { hero.img = img; hero.ready = true; };
      img.src = "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(mascotSVG().replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'));
    }catch(e){}

    const drops = [];          // падащите букви
    const sparks = [];         // искри при хващане
    let spawnIn = 0;

    const speed = REDUCED_MOTION ? 0.10 : 0.155;   // част от височината в секунда (~6 сек. пресичане)

    function layout(){
      const w = wrap.clientWidth, hgt = wrap.clientHeight;
      if(!w || !hgt) return;
      W = w; H = hgt;
      canvas.width = w * dpr; canvas.height = hgt * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function spawn(){
      // Гарантираме, че търсената буква е някъде на екрана.
      const needed = letters[need];
      const hasNeeded = drops.some(d => d.ch === needed);
      let ch;
      if(!hasNeeded || Math.random() < 0.35) ch = needed;
      else ch = task.distractor();
      drops.push({
        ch: ch,
        x: 0.08 + Math.random() * 0.84,
        y: -0.08,
        wob: Math.random() * Math.PI * 2,
        caught: false
      });
    }

    function burst(x, y, good){
      if(REDUCED_MOTION) return;
      for(let i = 0; i < (good ? 14 : 6); i++){
        sparks.push({ x, y, vx:(Math.random()-0.5)*0.5, vy:-Math.random()*0.5,
                      life:1, good:good });
      }
    }

    function caught(d){
      if(d.ch === letters[need]){
        slotEls[need].textContent = d.ch;
        slotEls[need].classList.add("filled");
        slotEls[need].classList.remove("next");
        need++;
        if(slotEls[need]) slotEls[need].classList.add("next");
        Sfx.place();
        burst(d.x, d.y, true);
        if(need >= letters.length){
          running = false;
          setTimeout(() => host.correct(mistakes), 400);
        }
      } else {
        mistakes++;
        Sfx.wrong();
        burst(d.x, d.y, false);
        host.mistake();
        wrap.classList.add("bump");
        setTimeout(() => wrap.classList.remove("bump"), 300);
      }
      d.caught = true;
    }

    /* ---- рисуване ---- */
    function draw(){
      ctx.clearRect(0, 0, W, H);
      const size = Math.max(46, Math.min(W * 0.11, H * 0.24, 92));

      drops.forEach(d => {
        const x = d.x * W, y = d.y * H;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(d.wob) * 0.12);
        const r = size * 0.22;
        ctx.beginPath();
        ctx.roundRect(-size/2, -size/2, size, size, r);
        // сянка и плътен ръб — иначе бялата плочка се губи в светлия фон
        ctx.shadowColor = "rgba(42,42,69,.22)";
        ctx.shadowBlur = size * 0.18;
        ctx.shadowOffsetY = size * 0.07;
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = "#8E82E8";
        ctx.lineWidth = Math.max(2.5, size * 0.055);
        ctx.stroke();
        ctx.fillStyle = "#5548C8";
        ctx.font = "800 " + Math.round(size * 0.56) + "px " + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(d.ch, 0, size * 0.03);
        ctx.restore();
      });

      sparks.forEach(s => {
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.good ? "#2FBF71" : "#E9A0A8";
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      const hs = Math.max(64, Math.min(W * 0.16, H * 0.32, 130));
      const hx = hero.x * W, hy = H - hs * 0.52;
      if(hero.ready){
        try{ ctx.drawImage(hero.img, hx - hs/2, hy - hs/2, hs, hs); }catch(e){}
      } else {
        ctx.fillStyle = "#7D6FF0";
        ctx.beginPath(); ctx.arc(hx, hy, hs * 0.35, 0, Math.PI * 2); ctx.fill();
      }
    }

    let last = 0;
    function frame(now){
      if(!running) return;
      if(!W) layout();
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;

      spawnIn -= dt;
      if(spawnIn <= 0 && drops.length < 6){ spawn(); spawnIn = 0.55 + Math.random() * 0.6; }

      const hs = Math.max(64, Math.min(W * 0.16, H * 0.32, 130));
      const catchY = 1 - (hs * 0.52) / H;

      for(let i = drops.length - 1; i >= 0; i--){
        const d = drops[i];
        d.y += speed * dt;
        d.wob += dt * 2;
        if(!d.caught && d.y >= catchY - 0.05 && d.y <= catchY + 0.06 &&
           Math.abs(d.x - hero.x) < (hs * 0.42) / W + 0.03){
          caught(d);
        }
        if(d.y > 1.15 || d.caught) drops.splice(i, 1);
      }
      for(let i = sparks.length - 1; i >= 0; i--){
        const s = sparks[i];
        s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 1.2 * dt;
        s.life -= dt * 1.6;
        if(s.life <= 0) sparks.splice(i, 1);
      }

      draw();
      raf = requestAnimationFrame(frame);
    }

    /* ---- управление: пръст, мишка, стрелки ---- */
    function aim(ev){
      const r = canvas.getBoundingClientRect();
      hero.x = Math.max(0.06, Math.min(0.94, (ev.clientX - r.left) / r.width));
    }
    let dragging = false;
    const onDown = (e) => { dragging = true; aim(e); };
    const onMove = (e) => { if(dragging) aim(e); };
    const onUp = () => { dragging = false; };
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    const onKey = (e) => {
      if(e.key === "ArrowLeft")  hero.x = Math.max(0.06, hero.x - 0.06);
      if(e.key === "ArrowRight") hero.x = Math.min(0.94, hero.x + 0.06);
    };
    window.addEventListener("keydown", onKey);
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    setTimeout(() => { layout(); raf = requestAnimationFrame(frame); }, 0);
    setTimeout(() => Speech.speak(word.display), 350);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ Speech.speak(letters[need]); return t("hintFindLetter") + " " + letters[need]; }
        // Втората подсказка сваля търсената буква право над Буки.
        const d = drops.find(x => x.ch === letters[need]);
        if(d){ d.x = hero.x; if(d.y < 0.30) d.y = 0.30; }
        else drops.push({ ch: letters[need], x: hero.x, y: 0.30, wob: 0, caught: false });
        return t("hintThisLetter");
      },
      destroy(){
        running = false;
        if(raf) cancelAnimationFrame(raf);
        wrap.removeEventListener("pointerdown", onDown);
        wrap.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("pointerup", onUp);
        wrap.removeEventListener("pointercancel", onUp);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
      }
    };
  }
};


/* =========================================================================
 * 8d. ГОРАТА НА БУКВИТЕ — страничен скролър
 * -------------------------------------------------------------------------
 * Буки тича сам надясно през гората. Детето има само едно действие —
 * докосване за подскок. Буквите висят по пътя: ниските се взимат в движение,
 * високите искат подскок. Правилната буква влита в думата, грешната отскача.
 *
 * Никъде няма провал: няма живот, няма падане, няма край на играта. Когато
 * думата се събере, напред израства дърво-порта и нивото свършва.
 * Детето усеща бягане и събиране; ученето върви отстрани.
 * ========================================================================= */
