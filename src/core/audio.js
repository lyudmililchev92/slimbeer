const Sfx = {
  ctx: null,
  blocked: false,          // няма WebAudio или средата не го пуска
  /* Отключване при жест. resume() се вика САМО тук — ако се викаше при всеки
     тон, а средата блокира звука (напр. iframe без allow="autoplay"),
     всяко поставяне на буква трупаше неизпълними обещания и играта заглъхваше. */
  tries: 0,
  resuming: false,
  unlock(){
    if(this.blocked || this.resuming) return;
    if(!this.ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC){ this.blocked = true; return; }
      try{ this.ctx = new AC(); }catch(e){ this.blocked = true; return; }
    }
    if(this.ctx.state === "running") return;
    // Ако средата не пуска звук (iframe без allow="autoplay"), resume() не
    // успява никога. Спираме след няколко опита — иначе всяко докосване
    // трупа поредното обещание и играта започва да засича.
    if(this.tries >= 3){ this.blocked = true; return; }
    this.tries++;
    this.resuming = true;
    const done = () => { this.resuming = false; };
    try{
      const p = this.ctx.resume();
      if(p && p.then) p.then(done, done); else done();
    }catch(e){ done(); }
  },
  /** Връща контекста само ако наистина свири. Никакви опити за събуждане тук. */
  ensure(){
    if(!State.progress.soundEnabled || this.blocked || !this.ctx) return null;
    return this.ctx.state === "running" ? this.ctx : null;
  },
  tone(freq, dur, type, vol, delay){
    const ctx = this.ensure();
    if(!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.16, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  },
  tap(){ this.tone(620, 0.09, "triangle", 0.10); },
  place(){ this.tone(760, 0.13, "sine", 0.14); this.tone(1140, 0.10, "sine", 0.07, 0.05); },
  wrong(){ this.tone(300, 0.16, "sine", 0.11); this.tone(240, 0.18, "sine", 0.09, 0.08); },
  star(){ this.tone(1050, 0.14, "sine", 0.12); },
  success(){
    [523.25, 659.25, 783.99, 1046.5].forEach((f,i) => this.tone(f, 0.24, "sine", 0.15, i*0.10));
  },
  levelUp(){
    [523.25, 587.33, 659.25, 783.99, 880, 1046.5].forEach((f,i) => this.tone(f, 0.26, "triangle", 0.13, i*0.09));
  }
};
