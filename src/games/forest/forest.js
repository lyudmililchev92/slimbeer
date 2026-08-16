const MODE_FOREST = {
  id:"forest", showsPicture:false, fullArea:true,
  supports(word){ return !word.audioOnly && word.word.length >= 3 && word.word.length <= 7; },

  mount(root, host){
    const word = host.word;
    const letters = word.word.split("");
    const lvl = getLevel(LP().currentLevel);
    const nutsNeeded = lvl.nuts || 3;
    const TH = FOREST_THEMES[lvl.theme || "day"];
    const Q = FOREST_QUESTS[(lvl.quest !== undefined ? lvl.quest : (lvl.id - 1)) % FOREST_QUESTS.length];

    let need = 0, mistakes = 0, nuts = 0, running = true, raf = 0, gateOut = false;
    let bonus = 0;                 // решени предизвикателства по пътя
    const zones = [];

    /* ---------- горна лента: дума + куест ---------- */
    const head = h("div", { class:"catch-head" });
    if(word.art || word.emoji) head.appendChild(renderArt(word, "catch-pic"));
    const slotsEl = h("div", { class:"catch-slots" });
    const slotEls = letters.map((ch, i) => {
      const el = h("span", { class:"catch-slot" + (i === 0 ? " next" : "") }, "");
      slotsEl.appendChild(el);
      return el;
    });
    head.appendChild(slotsEl);
    const quest = h("span", { class:"nut-badge quest" },
      h("span", { class:"q-who" }, Q.who), Q.item + " 0/" + nutsNeeded);
    head.appendChild(quest);
    const bonusBadge = h("span", { class:"nut-badge bonus", hidden:true }, "⭐ 0");
    head.appendChild(bonusBadge);
    function gotBonus(){
      bonus++;
      bonusBadge.hidden = false;
      bonusBadge.textContent = "⭐ " + bonus;
      bonusBadge.classList.remove("pop"); void bonusBadge.offsetWidth; bonusBadge.classList.add("pop");
    }
    root.appendChild(head);

    const wrap = h("div", { class:"forest-wrap" });
    const canvas = h("canvas");
    wrap.appendChild(canvas);
    root.appendChild(wrap);

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, ground = 0, CH = 0;

    /* ---------- Буки ---------- */
    const hero = { y:0, vy:0, onGround:true, jumps:0, bob:0, hurt:0,
                   run:0, land:0, blink:0, scarf:[] };
    let power = 0;              // секунди летене от златното перо

    let camX = 0, nextChunk = 0, clock = 0;
    const air = [];        // пеперуди, листа, светулки
    const chunks = [], items = [], sparks = [];
    /* Височина на площадка в момента — някои се движат нагоре-надолу. */
    function ph(p){ return p.move ? p.hgt + Math.sin(clock * p.move.sp + p.move.ph) * p.move.amp : p.hgt; }
    const alphabet = L().alphabet;

    const RUN  = (REDUCED_MOTION ? 0.17 : 0.27) * (lvl.speed || 1);
    const GRAV = 2.9, JUMP = 1.32;      // връх на единичен скок ≈ 0.30 H

    function layout(){
      const w = wrap.clientWidth, hgt = wrap.clientHeight;
      if(!w || !hgt) return;
      W = w; H = hgt; ground = H * 0.78; CH = W * 0.52;
      canvas.width = w * dpr; canvas.height = hgt * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    /* ---------- светът се ражда парче по парче ---------- */
    function addItem(kind, x, hgt, ch){
      items.push({ kind:kind, x:x, hgt:hgt, ch:ch, taken:false, bob:Math.random()*6 });
    }
    function wordDone(){ return need >= letters.length; }
    function neededLetter(){
      // След като думата е събрана, няма нужна буква — тогава изобщо не
      // раждаме букви (иначе плочката щеше да е с надпис "undefined").
      const nd = letters[need];
      if(nd === undefined) return null;
      const pending = items.some(i => i.kind === "letter" && !i.taken && i.ch === nd && i.x > camX);
      return (!pending || Math.random() < 0.5) ? nd : alphabet[Math.floor(Math.random()*alphabet.length)];
    }
    function addLetterOrNut(x, hgt){
      const ch = neededLetter();
      if(ch) addItem("letter", x, hgt, ch);
      else addItem("nut", x, hgt);          // думата е готова → жълъд
    }
    /* Предизвикателство по пътя: мост със сметка или цветни плодове.
       Заема едно парче и не се смесва с дупки, за да е винаги решимо. */
    function makeZone(c, x){
      const kinds = lvl.zoneKinds || [];
      if(!kinds.length) return false;
      const kind = rand(kinds);

      if(kind === "count" || kind === "first"){
        let answer, opts;
        if(kind === "count"){
          answer = 2 + Math.floor(Math.random() * ((lvl.countMax || 6) - 1));
          opts = shuffle([answer, answer + 1, Math.max(1, answer - 1)]);
        } else {
          answer = letters[0];
          const other = shuffle(alphabet.filter(l => l !== answer)).slice(0, 2);
          opts = shuffle([answer].concat(other));
        }
        const z = { kind:kind, x:x + CH * 0.28, answer:answer, n:answer, done:false };
        zones.push(z);
        c.plats = opts.map((v, k) => ({
          x: x + CH * (0.34 + k * 0.24), w: CH * 0.26, hgt: 0.18 + (k % 2) * 0.05,
          label: String(v), zone: z, value: v
        }));
        return true;
      }

      if(kind === "sum"){
        const max = lvl.sumMax || 5;
        const a = 1 + Math.floor(Math.random() * (max - 1));
        const b = 1 + Math.floor(Math.random() * (max - a));
        const answer = a + b;
        const opts = shuffle([answer, answer + 1, Math.max(1, answer - 1)]);
        const z = { kind:"sum", x:x + CH * 0.28, a:a, b:b, answer:answer, done:false };
        zones.push(z);
        c.plats = opts.map((v, k) => ({
          x: x + CH * (0.34 + k * 0.24), w: CH * 0.26, hgt: 0.18 + (k % 2) * 0.05,
          label: String(v), zone: z, value: v
        }));
        return true;
      }

      // цветове: на табелата свети цвят, взима се плодът със същия цвят
      const palette = [["#E4574F","rood"], ["#4CA167","groen"], ["#5B8DEF","blauw"], ["#F5B942","geel"]];
      const pick = shuffle(palette).slice(0, 3);
      const target = pick[Math.floor(Math.random() * 3)];
      const z = { kind:"color", x:x + CH * 0.24, color:target[0], done:false };
      zones.push(z);
      pick.forEach((p, k) => {
        items.push({ kind:"fruit", x: x + CH * (0.42 + k * 0.22), hgt: 0.29 + (k % 2) * 0.05,
                     color: p[0], zone: z, taken:false, bob: Math.random() * 6 });
      });
      return true;
    }

    function makeChunk(){
      const i = nextChunk++, x = i * CH;
      const c = { x:x, pit:false, plat:null, shroom:null, plats:null };

      if(i > 3 && i % 4 === 0 && Math.random() < (lvl.zones || 0)){
        if(makeZone(c, x)){ chunks.push(c); return; }
      }
      if(i > 2 && Math.random() < (lvl.pits || 0.16)){
        // Ширината се смята от реалния скок, за да е винаги прескачаема.
        const airTime = 2 * JUMP / GRAV;
        const jumpDist = RUN * W * airTime;
        const pw = Math.min(CH * 0.55, jumpDist * 0.62);
        c.pit = { x: x + (CH - pw) * 0.5, w: pw };
      }
      else if(Math.random() < 0.42){
        c.plat = { x: x + CH * 0.18, w: CH * 0.58, hgt: 0.22 + Math.random() * 0.12 };
        if(lvl.movers && Math.random() < lvl.movers)
          c.plat.move = { amp: 0.05 + Math.random() * 0.05, sp: 1.1 + Math.random() * 0.8,
                          ph: Math.random() * 6.3 };
      }
      else if(Math.random() < 0.28)
        c.shroom = { x: x + CH * 0.5 };
      chunks.push(c);

      if(c.pit) return;
      const r = Math.random();
      if(c.plat){
        // Върху площадка: буква над нея или жълъд отгоре.
        if(r < 0.62) addLetterOrNut(c.plat.x + c.plat.w * 0.5, c.plat.hgt + 0.13);
        else addItem("nut", c.plat.x + c.plat.w * 0.5, c.plat.hgt + 0.07);
      } else if(r < 0.45){
        addLetterOrNut(x + CH * 0.55, 0.29 + Math.random() * 0.05);
      } else if(r < 0.78){
        addItem("nut", x + CH * 0.5, Math.random() < 0.55 ? 0.05 : 0.30);
      } else if((lvl.id || 1) >= 3 && r < 0.84){
        addItem("feather", x + CH * 0.5, 0.30);     // златно перо: летене
      }
    }
    function chunkAt(wx){
      const i = Math.floor(wx / CH);
      return chunks[i - (nextChunk - chunks.length)] || null;
    }

    function burst(sx, sy, kind){
      if(REDUCED_MOTION) return;
      const n = kind === "bad" ? 5 : 12;
      for(let i = 0; i < n; i++)
        sparks.push({ x:sx, y:sy, vx:(Math.random()-0.5)*200, vy:-Math.random()*240,
                      life:1, c: kind === "bad" ? "#E9A0A8" : (kind === "nut" ? "#C58B4E" : "#FFD166") });
    }

    function checkQuest(){
      if(gateOut) return;
      // Мисията отваря портата. Думата е допълнение и носи звезди.
      if(nuts >= nutsNeeded){
        gateOut = true;
        items.push({ kind:"gate", x: camX + W * 1.25, hgt:0.34, taken:false, bob:0 });
        Sfx.star();
      }
    }

    function take(it, sx, sy){
      it.taken = true;
      if(it.kind === "fruit"){
        const z = it.zone;
        if(z && !z.done && it.color === z.color){
          z.done = true; gotBonus(); Sfx.success(); burst(sx, sy, "good");
        } else if(z && !z.done){
          Sfx.wrong(); burst(sx, sy, "bad");
        } else { Sfx.tap(); }
        return;
      }
      if(it.kind === "feather"){
        power = 7;                       // седем секунди летене
        Sfx.success(); burst(sx, sy, "good");
        hero.jumps = 0;
        return;
      }
      if(it.kind === "nut"){
        nuts++;
        quest.lastChild.textContent = Q.item + " " + Math.min(nuts, nutsNeeded) + "/" + nutsNeeded;
        if(nuts === nutsNeeded) quest.classList.add("done");
        Sfx.tap(); burst(sx, sy, "nut"); checkQuest();
        return;
      }
      if(wordDone() || !slotEls[need]){
        // Думата вече е събрана — каквото падне, е просто бонус.
        Sfx.tap(); burst(sx, sy, "nut");
        return;
      }
      if(it.ch === letters[need]){
        slotEls[need].textContent = it.ch;
        slotEls[need].classList.add("filled");
        slotEls[need].classList.remove("next");
        need++;
        if(slotEls[need]) slotEls[need].classList.add("next");
        Sfx.place(); burst(sx, sy, "good"); checkQuest();
      } else {
        mistakes++; Sfx.wrong(); burst(sx, sy, "bad"); host.mistake();
      }
    }

    /* ---------- рисуване ---------- */
    function hills(off, amp, base, color){
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(0, H);
      for(let x = 0; x <= W; x += 14){
        const y = base - Math.sin((x + off) / (W * 0.42)) * amp
                       - Math.sin((x + off) / (W * 0.17)) * amp * 0.35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }
    /* Дърво от заоблени корони — по-меко и по-детско от триъгълници. */
    function tree(x, y, s, seed){
      if(TH.rock){
        // в пещерата растат камъни: зъбер със светещ кристал отгоре
        ctx.fillStyle = seed % 2 ? TH.t1 : TH.t2;
        ctx.beginPath();
        ctx.moveTo(x - s*0.26, y);
        ctx.lineTo(x - s*0.10, y - s*0.82 - (seed % 5) * s*0.04);
        ctx.lineTo(x + s*0.08, y - s*0.60);
        ctx.lineTo(x + s*0.28, y);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.10)";
        ctx.beginPath();
        ctx.moveTo(x - s*0.26, y); ctx.lineTo(x - s*0.10, y - s*0.82); ctx.lineTo(x - s*0.02, y);
        ctx.closePath(); ctx.fill();
        const gx = x - s*0.10, gy = y - s*0.86 - (seed % 5) * s*0.04;
        const gl = ctx.createRadialGradient(gx, gy, 0, gx, gy, s*0.18);
        gl.addColorStop(0, "rgba(150,225,255,.75)"); gl.addColorStop(1, "rgba(150,225,255,0)");
        ctx.fillStyle = gl;
        ctx.beginPath(); ctx.arc(gx, gy, s*0.18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#9EE7FF";
        ctx.beginPath();
        ctx.moveTo(gx, gy - s*0.07); ctx.lineTo(gx + s*0.045, gy);
        ctx.lineTo(gx, gy + s*0.07); ctx.lineTo(gx - s*0.045, gy);
        ctx.closePath(); ctx.fill();
        return;
      }
      if(TH.palm){
        // на плажа растат палми: наклонен ствол, ветрило от листа, кокоси
        const lean = ((seed % 3) - 1) * s*0.10;
        ctx.strokeStyle = TH.trunk;
        ctx.lineWidth = s*0.075; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + lean*0.6, y - s*0.42, x + lean, y - s*0.78);
        ctx.stroke();
        const tx = x + lean, ty = y - s*0.78;
        [-1.15, -0.62, 0, 0.62, 1.15].forEach((a, i) => {
          ctx.fillStyle = i % 2 ? TH.t1 : TH.t2;
          ctx.save(); ctx.translate(tx, ty); ctx.rotate(a);
          ctx.beginPath();
          ctx.ellipse(0, -s*0.17, s*0.09, s*0.20, 0, 0, Math.PI*2);
          ctx.fill(); ctx.restore();
        });
        ctx.fillStyle = "#8A6244";
        ctx.beginPath(); ctx.arc(tx - s*0.05, ty + s*0.05, s*0.045, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + s*0.05, ty + s*0.06, s*0.04, 0, Math.PI*2); ctx.fill();
        return;
      }
      ctx.fillStyle = TH.trunk;
      ctx.beginPath();
      ctx.roundRect(x - s*0.06, y - s*0.46, s*0.12, s*0.46, s*0.04);
      ctx.fill();
      const blobs = [[0, -0.86, 0.30], [-0.22, -0.66, 0.26], [0.22, -0.66, 0.26],
                     [-0.12, -0.46, 0.24], [0.12, -0.46, 0.24]];
      blobs.forEach((b, i) => {
        ctx.fillStyle = i % 2 ? TH.t1 : TH.t2;
        ctx.beginPath();
        ctx.arc(x + b[0]*s + ((seed % 5) - 2) * s*0.01, y + b[1]*s, b[2]*s, 0, Math.PI*2);
        ctx.fill();
      });
      if(TH.snow){
        // шапки сняг по горните корони — зимата трябва да се вижда, не да се предполага
        ctx.fillStyle = "rgba(255,255,255,.92)";
        [[0, -1.02, 0.17], [-0.26, -0.80, 0.13], [0.26, -0.80, 0.13]].forEach(b => {
          ctx.beginPath();
          ctx.ellipse(x + b[0]*s, y + b[1]*s, b[2]*s, b[2]*s*0.45, 0, 0, Math.PI*2);
          ctx.fill();
        });
      }
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.beginPath(); ctx.arc(x - s*0.10, y - s*0.90, s*0.11, 0, Math.PI*2); ctx.fill();
    }
    /* Буки, рисуван на място: крачета в бяг, шал, който изостава,
       клепачи, свиване при кацане. Оживява го много повече от картинка. */
    function drawBoekie(cx, cy, s, flying){
      const t = hero.run;
      const air = !hero.onGround;
      const squash = hero.land > 0 ? 1 + hero.land * 0.35 : 1;
      const stretch = hero.land > 0 ? 1 - hero.land * 0.30 : (air ? 1.08 : 1);

      ctx.save();
      ctx.translate(cx, cy);
      if(hero.hurt > 0) ctx.globalAlpha = 0.55 + Math.sin(hero.hurt * 30) * 0.35;

      if(flying){                                   // сияние при летене
        const g = ctx.createRadialGradient(0, 0, s*0.2, 0, 0, s*0.85);
        g.addColorStop(0, "rgba(255,214,102,.55)");
        g.addColorStop(1, "rgba(255,214,102,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, s*0.85, 0, Math.PI*2); ctx.fill();
      }

      ctx.scale(squash, stretch);

      // шал, който изостава след движението
      hero.scarf.forEach((p, i) => {
        const w = s * (0.15 - i * 0.035), hh = s * (0.085 - i * 0.015);
        if(w <= 0) return;
        ctx.fillStyle = i === 0 ? "#E4574F" : (i === 1 ? "#EC6A62" : "#F4877F");
        ctx.save();
        ctx.translate(-s * (0.22 + i * 0.13), s * 0.13 + p.y * 0.6);
        ctx.rotate(-0.15 - i * 0.12 + p.y * 0.02);
        ctx.beginPath(); ctx.roundRect(-w/2, -hh/2, w, hh, hh/2); ctx.fill();
        ctx.restore();
      });

      // крачета
      const swing = air ? 0.35 : Math.sin(t) * 0.55;
      ctx.fillStyle = "#5F55C9";
      [-1, 1].forEach((d, i) => {
        const a = air ? (i ? 0.5 : -0.3) : Math.sin(t + (i ? Math.PI : 0)) * 0.55;
        ctx.save();
        ctx.translate(d * s*0.13, s*0.30);
        ctx.rotate(a * 0.6);
        ctx.beginPath(); ctx.roundRect(-s*0.06, 0, s*0.12, s*0.20, s*0.06); ctx.fill();
        ctx.restore();
      });

      // ушички
      ctx.fillStyle = "#6C5CE7";
      [-1, 1].forEach(d => {
        ctx.save();
        ctx.translate(d * s*0.26, -s*0.30);
        ctx.rotate(d * (0.15 + Math.sin(t * 0.6) * 0.10));
        ctx.beginPath();
        ctx.moveTo(0, -s*0.26); ctx.lineTo(-d*s*0.16, s*0.08); ctx.lineTo(d*s*0.16, s*0.06);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      });

      // тяло и коремче
      ctx.fillStyle = "#7D6FF0";
      ctx.beginPath(); ctx.arc(0, 0, s*0.38, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#EDEAFF";
      ctx.beginPath(); ctx.ellipse(0, s*0.10, s*0.25, s*0.21, 0, 0, Math.PI*2); ctx.fill();

      // бузки
      ctx.fillStyle = "rgba(255,157,187,.65)";
      [-1, 1].forEach(d => { ctx.beginPath(); ctx.arc(d*s*0.26, s*0.06, s*0.06, 0, Math.PI*2); ctx.fill(); });

      // очи с мигане
      const open = hero.blink > 0.86 ? 0.15 : 1;
      [-1, 1].forEach(d => {
        ctx.fillStyle = "#FFF";
        ctx.beginPath(); ctx.ellipse(d*s*0.13, -s*0.04, s*0.12, s*0.13*open, 0, 0, Math.PI*2); ctx.fill();
        if(open > 0.5){
          ctx.fillStyle = "#2A2A45";
          ctx.beginPath(); ctx.arc(d*s*0.15, -s*0.03, s*0.06, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#FFF";
          ctx.beginPath(); ctx.arc(d*s*0.17, -s*0.06, s*0.022, 0, Math.PI*2); ctx.fill();
        }
      });

      // човка
      ctx.fillStyle = "#FFB443";
      ctx.beginPath();
      ctx.moveTo(-s*0.06, s*0.02); ctx.lineTo(s*0.06, s*0.02); ctx.lineTo(0, s*0.11);
      ctx.closePath(); ctx.fill();

      ctx.restore();
    }

    /* Горският приятел: стои и чака, с балонче какво му трябва. */
    function drawFriend(sx, ready){
      const s = H * 0.16;
      const by = ground - s * 0.55;
      ctx.font = Math.round(s) + "px serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(Q.who, sx, by + Math.sin(clock * 2) * 3);

      const bw = s * 1.25, bh = s * 0.72, bx = sx + s * 0.62, byy = by - s * 0.85;
      ctx.fillStyle = ready ? "#DFF6E6" : "#FFFFFF";
      ctx.strokeStyle = ready ? "#2FBF71" : "#D9D4F5";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(bx - bw/2, byy - bh/2, bw, bh, bh*0.34);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx - bw*0.24, byy + bh*0.42);
      ctx.lineTo(bx - bw*0.44, byy + bh*0.80);
      ctx.lineTo(bx - bw*0.04, byy + bh*0.44);
      ctx.closePath(); ctx.fill();

      ctx.font = Math.round(bh*0.52) + "px serif";
      ctx.fillText(ready ? "✅" : Q.item, bx - bw*0.22, byy);
      if(!ready){
        ctx.fillStyle = "#5548C8";
        ctx.font = "800 " + Math.round(bh*0.44) + "px " + getComputedStyle(document.body).fontFamily;
        ctx.fillText("×" + nutsNeeded, bx + bw*0.20, byy);
      }
    }

    function tile(sx, sy, size, txt, col){
      ctx.save(); ctx.translate(sx, sy);
      ctx.beginPath(); ctx.roundRect(-size/2, -size/2, size, size, size*0.24);
      ctx.shadowColor = "rgba(42,42,69,.25)"; ctx.shadowBlur = size*0.2; ctx.shadowOffsetY = size*0.08;
      ctx.fillStyle = "#FFF"; ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = "#8E82E8"; ctx.lineWidth = Math.max(2.5, size*0.055); ctx.stroke();
      ctx.fillStyle = col; ctx.font = "800 " + Math.round(size*0.55) + "px " + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(txt, 0, size*0.03);
      ctx.restore();
    }

    function draw(){
      ctx.clearRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, ground);
      sky.addColorStop(0, TH.sky1); sky.addColorStop(1, TH.sky2);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, ground + 2);
      if(TH.stars){
        for(let k = 0; k < 26; k++){
          const sxx = ((k * 137) % 100) / 100 * W, syy = ((k * 53) % 60) / 100 * H;
          ctx.globalAlpha = 0.35 + ((k * 31) % 50) / 100;
          ctx.fillStyle = "#FFF";
          ctx.fillRect(sxx, syy, 2, 2);
        }
        ctx.globalAlpha = 1;
      }
      if(TH.rock){
        // под земята няма слънце — само мека светлина от процеп в тавана
        const lg = ctx.createRadialGradient(W*0.78, 0, 0, W*0.78, 0, H*0.55);
        lg.addColorStop(0, TH.sun); lg.addColorStop(1, "rgba(180,220,255,0)");
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.arc(W*0.78, 0, H*0.55, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle = TH.sun;
        ctx.beginPath(); ctx.arc(W*0.84, H*0.15, H*0.07, 0, Math.PI*2); ctx.fill();
      }

      // облаци, които плуват бавно
      if(!TH.stars && !TH.rock){
        ctx.fillStyle = "rgba(255,255,255,.72)";
        for(let k = 0; k < 3; k++){
          const cx2 = ((k * 0.42 * W - camX * 0.05) % (W * 1.5) + W * 1.5) % (W * 1.5) - W*0.2;
          const cy2 = H * (0.10 + (k % 3) * 0.07), r = H * (0.045 + (k % 2) * 0.015);
          ctx.beginPath();
          ctx.arc(cx2, cy2, r, 0, Math.PI*2);
          ctx.arc(cx2 + r*0.9, cy2 + r*0.15, r*0.75, 0, Math.PI*2);
          ctx.arc(cx2 - r*0.85, cy2 + r*0.2, r*0.65, 0, Math.PI*2);
          ctx.fill();
        }
      }
      hills(camX*0.10, H*0.06, ground - H*0.11, TH.h1);
      hills(camX*0.24, H*0.05, ground - H*0.04, TH.h2);
      const step = W*0.32, first = Math.floor((camX*0.45)/step) - 1;
      for(let i = first; i < first + 8; i++)
        tree(i*step - camX*0.45 + (i%3)*16, ground - H*0.02, H*(0.24 + ((i*37)%11)/44), i);

      // земя с дупки
      chunks.forEach(c => {
        const sx = c.x - camX;
        if(sx > W + CH || sx < -CH * 1.5) return;
        ctx.fillStyle = TH.gr; ctx.fillRect(sx, ground, CH + 1, H - ground);
        ctx.fillStyle = TH.grass; ctx.fillRect(sx, ground, CH + 1, Math.max(4, H*0.014));
        // тревички и цветенца по ръба
        const idx = Math.round(c.x / CH);
        ctx.lineCap = "round";
        for(let k = 0; k < 9; k++){
          const gx = sx + CH * (0.05 + k * 0.107) + ((idx * 17 + k * 11) % 12);
          if(c.pit && gx > c.pit.x - camX - 10 && gx < c.pit.x - camX + c.pit.w + 10) continue;
          const tall = H * (0.020 + ((idx * 7 + k * 5) % 10) / 700);
          ctx.strokeStyle = TH.grass; ctx.lineWidth = 2.2;
          for(let b = -1; b <= 1; b++){
            ctx.beginPath();
            ctx.moveTo(gx, ground + 1);
            ctx.quadraticCurveTo(gx + b * 3, ground - tall * 0.6,
                                 gx + b * 6, ground - tall * (b ? 0.85 : 1.15));
            ctx.stroke();
          }
          if((idx * 13 + k) % 6 === 0){
            ctx.fillStyle = TH.snow ? "#FFF"
                          : TH.rock ? "#8FE3FF"
                          : TH.stars ? "#C9C2F0"
                          : ["#FF9DBB", "#FFD166", "#FFF"][(idx + k) % 3];
            ctx.beginPath(); ctx.arc(gx + 6, ground - tall * 1.25, 3.6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,.7)";
            ctx.beginPath(); ctx.arc(gx + 6, ground - tall * 1.25, 1.4, 0, Math.PI*2); ctx.fill();
          }
        }
        if(c.pit){
          const px = c.pit.x - camX;
          const wg = ctx.createLinearGradient(0, ground, 0, H);
          const deep = TH.stars || TH.rock;
          wg.addColorStop(0, TH.snow ? "#BEE6F5" : deep ? "#4A6E9E" : "#9FD3EE");
          wg.addColorStop(1, TH.snow ? "#79BEDC" : deep ? "#2E4A70" : "#6FB6DC");
          ctx.fillStyle = wg;
          ctx.fillRect(px, ground, c.pit.w, H - ground);
          // вълнички, които се движат
          ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
          for(let k = 0; k < 3; k++){
            const wy = ground + H*0.045 + k*H*0.038;
            ctx.beginPath();
            for(let wx = 0; wx <= c.pit.w; wx += 8)
              ctx.lineTo(px + wx, wy + Math.sin((wx*0.06) + clock*2 + k) * 3);
            ctx.stroke();
          }
          // тревни ръбове от двете страни, за да се вижда откъде се скача
          ctx.fillStyle = TH.grass;
          ctx.fillRect(px - 6, ground, 6, Math.max(4, H*0.02));
          ctx.fillRect(px + c.pit.w, ground, 6, Math.max(4, H*0.02));
        }
        if(c.plats) c.plats.forEach(p => {
          const px = p.x - camX, py = ground - ph(p)*H;
          ctx.fillStyle = p.zone && p.zone.done ? "#9FBF8C" : "#8C6A4F";
          ctx.beginPath(); ctx.roundRect(px, py, p.w, H*0.045, 6); ctx.fill();
          ctx.fillStyle = "#FFF";
          ctx.font = "800 " + Math.round(H*0.055) + "px " + getComputedStyle(document.body).fontFamily;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(p.label, px + p.w/2, py + H*0.023);
        });
        if(c.plat){
          const px = c.plat.x - camX, py = ground - ph(c.plat)*H;
          ctx.fillStyle = "#8C6A4F";
          ctx.beginPath(); ctx.roundRect(px, py, c.plat.w, H*0.035, 6); ctx.fill();
          ctx.fillStyle = "#5FBF7A";
          ctx.beginPath(); ctx.roundRect(px, py - H*0.014, c.plat.w, H*0.02, 6); ctx.fill();
        }
        if(c.shroom){
          const mx = c.shroom.x - camX, my = ground;
          ctx.fillStyle = "#FFF1E0"; ctx.fillRect(mx - H*0.018, my - H*0.05, H*0.036, H*0.05);
          ctx.fillStyle = "#E4574F";
          ctx.beginPath(); ctx.ellipse(mx, my - H*0.05, H*0.055, H*0.038, 0, Math.PI, 0); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.85)";
          ctx.beginPath(); ctx.arc(mx - H*0.02, my - H*0.062, H*0.009, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(mx + H*0.018, my - H*0.055, H*0.007, 0, Math.PI*2); ctx.fill();
        }
      });

      // приятелят чака в началото на пътя
      const fx = CH * 1.15 - camX;
      if(fx > -H && fx < W + H) drawFriend(fx, nuts >= nutsNeeded);

      // табели на предизвикателствата
      zones.forEach(z => {
        const sx = z.x - camX;
        if(sx < -W*0.4 || sx > W + W*0.2) return;
        const bw = H*0.30, bh = H*0.15, by = ground - H*0.52;
        ctx.fillStyle = "#8C6A4F";
        ctx.fillRect(sx - H*0.012, by + bh, H*0.024, H*0.52 - bh);
        ctx.fillStyle = z.done ? "#CFE8CF" : "#FFF6E5";
        ctx.strokeStyle = "#8C6A4F"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(sx - bw/2, by, bw, bh, 10); ctx.fill(); ctx.stroke();
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        if(z.kind === "sum"){
          ctx.fillStyle = "#5548C8";
          ctx.font = "800 " + Math.round(bh*0.52) + "px " + getComputedStyle(document.body).fontFamily;
          ctx.fillText(z.a + " + " + z.b, sx, by + bh*0.5);
        } else if(z.kind === "count"){
          // Толкова жълъда, колкото е отговорът — детето ги брои.
          const per = Math.min(4, z.n), rows = Math.ceil(z.n / per);
          const r = bh * 0.13;
          for(let k = 0; k < z.n; k++){
            const rr = Math.floor(k / per), cc = k % per;
            const cnt = Math.min(per, z.n - rr * per);
            ctx.fillStyle = "#A9713F";
            ctx.beginPath();
            ctx.arc(sx + (cc - (cnt - 1) / 2) * r * 2.6,
                    by + bh * 0.5 + (rr - (rows - 1) / 2) * r * 2.6, r, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if(z.kind === "first"){
          ctx.font = Math.round(bh*0.62) + "px serif";
          ctx.fillText(word.emoji || "?", sx, by + bh*0.52);
        } else {
          ctx.fillStyle = z.color;
          ctx.beginPath(); ctx.arc(sx, by + bh*0.5, bh*0.30, 0, Math.PI*2); ctx.fill();
        }
      });

      const isz = Math.max(32, Math.min(W*0.08, H*0.16, 66));
      items.forEach(it => {
        const sx = it.x - camX;
        if(sx < -isz*2 || sx > W + isz) return;
        const sy = ground - it.hgt*H - isz*0.5;
        if(it.kind === "gate"){
          ctx.fillStyle = "#8C6A4F";
          ctx.fillRect(sx - H*0.04, ground - H*0.36, H*0.08, H*0.36);
          ctx.fillStyle = "#3E9460";
          ctx.beginPath(); ctx.arc(sx, ground - H*0.42, H*0.18, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#FFD166";
          ctx.font = "800 " + Math.round(H*0.11) + "px " + getComputedStyle(document.body).fontFamily;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("★", sx, ground - H*0.42);
          drawFriend(sx - H*0.30, true);      // приятелят чака при портата
          return;
        }
        if(it.taken) return;
        it.bob += 0.05;
        const by = sy + Math.sin(it.bob)*4;
        if(it.kind === "nut"){
          ctx.font = Math.round(isz*0.8) + "px serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(Q.item, sx, by);
        } else if(it.kind === "feather"){
          const gl = ctx.createRadialGradient(sx, by, 2, sx, by, isz*0.75);
          gl.addColorStop(0, "rgba(255,214,102,.75)");
          gl.addColorStop(1, "rgba(255,214,102,0)");
          ctx.fillStyle = gl;
          ctx.beginPath(); ctx.arc(sx, by, isz*0.75, 0, Math.PI*2); ctx.fill();
          ctx.save(); ctx.translate(sx, by); ctx.rotate(Math.sin(it.bob)*0.3);
          ctx.font = Math.round(isz*0.78) + "px serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("🪶", 0, 0);
          ctx.restore();
        } else if(it.kind === "fruit"){
          ctx.fillStyle = it.color;
          ctx.beginPath(); ctx.arc(sx, by, isz*0.34, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 3; ctx.stroke();
          ctx.fillStyle = "#4CA167";
          ctx.beginPath(); ctx.ellipse(sx + isz*0.14, by - isz*0.34, isz*0.14, isz*0.07, -0.5, 0, Math.PI*2); ctx.fill();
        } else tile(sx, by, isz, it.ch, "#5548C8");
      });

      ctx.font = Math.round(H*0.055) + "px serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      air.forEach(a => ctx.fillText(TH.air, a.x, a.y));

      sparks.forEach(s => {
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.c;
        ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      const hs = Math.max(48, Math.min(W*0.12, H*0.24, 100));
      const hx = W*0.22, hy = ground - hero.y*H - hs*0.5;

      // сянка на земята — колкото по-високо е, толкова по-малка
      const sh = Math.max(0, 1 - hero.y * 2.2);
      if(sh > 0.05){
        ctx.fillStyle = "rgba(42,42,69," + (0.16 * sh).toFixed(3) + ")";
        ctx.beginPath();
        ctx.ellipse(hx, ground - 2, hs*0.34*sh, hs*0.10*sh, 0, 0, Math.PI*2);
        ctx.fill();
      }
      drawBoekie(hx, hy + (hero.onGround ? Math.sin(hero.bob)*2 : 0), hs, power > 0);
    }

    /* ---------- ход на света ---------- */
    let last = 0;
    function frame(now){
      if(!running) return;
      if(!W) layout();
      const dt = Math.min(0.05, last ? (now - last)/1000 : 0.016);
      last = now;

      camX += RUN * W * dt;
      clock += dt;
      hero.bob += dt * 9;
      hero.run += dt * (hero.onGround ? 13 : 5);
      if(hero.land > 0) hero.land = Math.max(0, hero.land - dt * 4);
      hero.blink = (hero.blink + dt * 0.42) % 1;

      // шалът изостава след движението
      const sway = (hero.onGround ? Math.sin(hero.run) * 2 : hero.vy * 6);
      hero.scarf.unshift({ x: 0, y: sway });
      if(hero.scarf.length > 3) hero.scarf.pop();

      if(power > 0 && !REDUCED_MOTION && Math.random() < dt * 26)
        sparks.push({ x: W*0.22 - 10 + Math.random()*20, y: ground - hero.y*H - 20,
                      vx:-60 - Math.random()*60, vy:-10 + Math.random()*40,
                      life:0.8, c:"#FFD166" });

      // пеперуди, листа или светулки според сезона
      if(!REDUCED_MOTION && air.length < 4 && Math.random() < dt * 0.8){
        const band = air.length ? (air[air.length-1].y > H*0.35 ? 0.10 : 0.42) : 0.20;
        air.push({ x: W + 30, y: H * (band + Math.random() * 0.22),
                   vx: -(22 + Math.random() * 40), t: Math.random() * 6 });
      }
      for(let i = air.length - 1; i >= 0; i--){
        const a = air[i];
        a.x += a.vx * dt; a.t += dt * 3;
        a.y += Math.sin(a.t) * 14 * dt;
        if(a.x < -40) air.splice(i, 1);
      }
      if(hero.hurt > 0) hero.hurt -= dt;

      while(nextChunk * CH < camX + W * 2.2) makeChunk();
      while(chunks.length && chunks[0].x < camX - W * 1.2) chunks.shift();
      while(items.length && items[0].x < camX - W * 0.8) items.shift();

      const hs = Math.max(48, Math.min(W*0.12, H*0.24, 100));
      const hx = W*0.22, heroWorld = camX + hx;
      const prevY = hero.y;

      const flying = power > 0;
      if(flying){
        power -= dt;
        if(power <= 0){ power = 0; Sfx.tap(); }
      }
      hero.vy -= (flying ? GRAV * 0.42 : GRAV) * dt;
      hero.y += hero.vy * dt;

      // площадки: стъпва се само отгоре
      let landed = false;
      for(const c of chunks){
        if(c.plats){
          for(const p of c.plats){
            const py = ph(p);
            if(heroWorld > p.x - hs*0.25 && heroWorld < p.x + p.w + hs*0.25 &&
               prevY >= py - 0.02 && hero.y <= py && hero.vy <= 0){
              hero.y = py; hero.vy = 0; landed = true;
              const z = p.zone;
              if(z && !z.done){
                if(p.value === z.answer){
                  z.done = true; gotBonus(); Sfx.success();
                  burst(p.x + p.w/2 - camX, ground - p.hgt*H, "good");
                  Speech.speak(numberWord(z.answer));
                } else {
                  Sfx.wrong(); hero.vy = JUMP * 0.5;
                  burst(p.x + p.w/2 - camX, ground - p.hgt*H, "bad");
                }
              }
            }
          }
        }
        if(!c.plat) continue;
        const p = c.plat;
        const py2 = ph(p);
        if(heroWorld > p.x - hs*0.25 && heroWorld < p.x + p.w + hs*0.25){
          if(prevY >= py2 - 0.02 && hero.y <= py2 && hero.vy <= 0){
            hero.y = py2; hero.vy = 0; landed = true;
          }
        }
        if(c.shroom && Math.abs(heroWorld - c.shroom.x) < hs*0.4 && hero.y <= 0.06 && hero.vy <= 0){
          hero.y = 0.06; hero.vy = JUMP * 1.45; hero.jumps = 0;
          Sfx.star(); burst(c.shroom.x - camX, ground - H*0.06, "good");
        }
      }

      const overPit = (() => {
        const c = chunkAt(heroWorld);
        return !!(c && c.pit && heroWorld > c.pit.x && heroWorld < c.pit.x + c.pit.w);
      })();
      if(!landed && hero.y <= 0 && !overPit){ hero.y = 0; hero.vy = 0; landed = true; }

      if(landed && !hero.onGround) hero.land = 1;      // тупване
      hero.onGround = landed;
      if(landed) hero.jumps = 0;

      // Падане в дупка: не връщаме назад — така дете, което не скача, би
      // заседнало в същата дупка завинаги. Вместо това го пренасяме отвъд
      // нея и продължава напред. Няма загуба, само малко трепване.
      if(hero.y < -0.55){
        const cc = chunkAt(camX + W * 0.22);
        camX += (cc && cc.pit) ? cc.pit.w + W * 0.10 : CH * 0.5;
        hero.y = 0.55; hero.vy = 0; hero.hurt = 0.6;
        Sfx.tap();
      }

      // събиране
      const isz = Math.max(32, Math.min(W*0.08, H*0.16, 66));
      const hy = ground - hero.y*H - hs*0.5, hr = hs*0.38;
      // Ако портата е останала назад (детето я е подминало във въздуха или
      // е паднало в дупка точно там), я израстваме отново напред.
      // Иначе нивото не може да свърши.
      if(gateOut && !items.some(it => it.kind === "gate" && !it.taken && it.x > camX - W * 0.1))
        items.push({ kind:"gate", x: camX + W * 1.1, hgt:0.34, taken:false, bob:0 });

      for(const it of items){
        if(it.taken) continue;
        const sx = it.x - camX;
        if(sx < -isz || sx > W + isz) continue;
        // Портата е цяло дърво от земята нагоре — затова я мерим като
        // отвесна ивица, а не като кръгче горе. Иначе Буки минава под нея
        // и нивото никога не свършва.
        const sy = ground - it.hgt*H - isz*0.5;
        const hit = it.kind === "gate"
          ? (Math.abs(sx - hx) < hs*0.45 + H*0.05 && hero.y < 0.60)
          : Math.hypot(sx - hx, sy - hy) < hr + isz*0.5;
        if(hit){
          if(it.kind === "gate"){
            it.taken = true; running = false;
            const extra = Math.min(3, bonus) + (wordDone() ? 2 : 0)
                        + Math.min(2, Math.floor((nuts - nutsNeeded) / 4));
            if(extra > 0) addStars(extra);
            setTimeout(() => host.correct(mistakes), 350);
          } else take(it, sx, sy);
        }
      }

      for(let i = sparks.length - 1; i >= 0; i--){
        const s = sparks[i];
        s.x += s.vx*dt; s.y += s.vy*dt; s.vy += 760*dt;
        s.life -= dt*1.5;
        if(s.life <= 0) sparks.splice(i, 1);
      }

      draw();
      raf = requestAnimationFrame(frame);
    }

    /* ---------- управление: докосване = скок, втори скок във въздуха ---------- */
    function jump(){
      if(!running) return;
      const maxJumps = power > 0 ? 4 : 2;
      if(hero.onGround || hero.jumps < maxJumps){
        if(hero.onGround) hero.jumps = 1; else hero.jumps++;
        hero.vy = JUMP * (hero.onGround ? 1 : 0.88) * (power > 0 ? 0.92 : 1);
        hero.onGround = false;
        Sfx.tap();
      }
    }
    const onDown = (e) => { e.preventDefault(); jump(); };
    wrap.addEventListener("pointerdown", onDown);
    const onKey = (e) => { if(e.key === " " || e.key === "ArrowUp" || e.key === "Enter"){ e.preventDefault(); jump(); } };
    window.addEventListener("keydown", onKey);
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    setTimeout(() => { layout(); raf = requestAnimationFrame(frame); }, 0);
    setTimeout(() => Speech.speak(word.display), 350);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ Speech.speak(letters[need]); return t("hintFindLetter") + " " + letters[need]; }
        if(need < letters.length)
          addItem("letter", camX + W*0.62, 0.06, letters[need]);   // ниско, лесно за вземане
        else addItem("nut", camX + W*0.62, 0.06);
        return t("hintThisLetter");
      },
      destroy(){
        running = false;
        if(raf) cancelAnimationFrame(raf);
        wrap.removeEventListener("pointerdown", onDown);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
      }
    };
  }
};

/* Всяко ниво носи по-дълга дума, повече жълъди за куеста, повече дупки
   и малко повече скорост. Промяната е плавна, за да не се усеща скок. */
