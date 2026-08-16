/* =========================================================================
 * 5. AUDIO — говор (bg-BG) + меки звукови ефекти
 * ========================================================================= */
const Speech = {
  supported: typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined",
  voices: {},          // код на език → избран глас
  init(){
    if(!this.supported) return;
    const pick = () => {
      const list = window.speechSynthesis.getVoices() || [];
      for(const code in LANGS){
        const tag = LANGS[code].speech;              // напр. "nl-NL"
        const short = tag.split("-")[0];             // "nl"
        const norm = v => (v.lang || "").replace("_","-").toLowerCase();
        const exact  = list.filter(v => norm(v) === tag.toLowerCase());
        const nearby = list.filter(v => norm(v).indexOf(short) === 0 && norm(v) !== tag.toLowerCase());
        // Точният език е над всичко: nl-BE (фламандски) звучи различно от
        // nl-NL и не става за учене на нидерландски. Вътре в една група
        // предпочитаме локален глас — той се синтезира на устройството,
        // тоест думата не пътува до чужд сървър.
        this.voices[code] =
          exact.find(v => v.localService)  || exact[0] ||
          nearby.find(v => v.localService) || nearby[0] || null;
      }
    };
    pick();
    try{ window.speechSynthesis.onvoiceschanged = pick; }catch(e){}
  },
  /** Има ли глас за активния (или подадения) език. */
  hasVoice(code){ return this.usable() && !!this.voices[code || State.progress.language]; },
  /** Скорост за активния език, съобразена с настройката на родителя. */
  /* opts.rate е множител, не абсолютна стойност. Преди беше абсолютна и
     подсказките се изговаряха по-БЪРЗО от избраното от родителя — точно
     обратното на замисъла. Сега „по-бавно от обичайното“ значи наистина
     по-бавно, каквото и да е обичайното. */
  rate(opts){
    const base = (LANGS[State.progress.language] || {}).rate || 0.6;
    const mult = SPEECH_SPEEDS[State.progress.speechSpeed] || 1;
    const extra = (opts && opts.rate) ? opts.rate : 1;
    return Math.max(0.1, Math.min(2, base * mult * extra));
  },
  _pending: null,
  attempts: 0,      // колко пъти сме искали изговор
  started: 0,       // колко пъти наистина е тръгнал
  blocked: false,   // средата няма да пусне говор (чужда рамка)
  lastError: null,  // последната грешка от браузъра — само за показване
  /** Играе ли се изобщо говор тук. */
  usable(){ return this.supported && !this.blocked; },
  /** Изговаря текст на активния език. Тихо не прави нищо при липсваща поддръжка. */
  speak(text, opts){
    if(!this.usable() || !State.progress.soundEnabled || !text) return;
    try{
      window.speechSynthesis.cancel();
      if(this._pending){ clearTimeout(this._pending); this._pending = null; }

      const code = State.progress.language;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANGS[code].speech;
      const v = this.voices[code];
      if(v) u.voice = v;
      u.rate = this.rate(opts);
      u.pitch = (opts && opts.pitch) || 1.05;
      u.volume = 1;

      // Някои среди приемат speak() и не свирят нищо (cross-origin iframe без
      // allow="autoplay"). Засичаме го и спираме да чакаме глас, който няма
      // да дойде — иначе режимът "чуй думата" остава неиграем.
      // Само изричната грешка от браузъра значи "тук няма да има говор".
      // Не броим "не чух onstart", защото това събитие не идва надеждно
      // навсякъде — на такава догадка играта си изключваше работещ глас.
      u.onstart = () => { this.started++; };
      u.onerror = (e) => {
        const err = (e && e.error) || null;
        this.lastError = err;
        // "not-allowed" често значи само "още няма жест от потребителя" и
        // минава при първото докосване. Изключваме говора за постоянно само
        // когато и контекстът е сигурен: чужда рамка, където няма да тръгне.
        if(err === "not-allowed" && inForeignFrame()) this.blocked = true;
      };
      this.attempts++;

      // Кратка пауза след cancel(): ако speak() тръгне веднага, Chrome
      // понякога отрязва първата сричка и думата звучи недоизказана.
      this._pending = setTimeout(() => {
        this._pending = null;
        try{ window.speechSynthesis.speak(u); }catch(e){}
      }, 90);
    }catch(e){}
  },
  stop(){
    if(this._pending){ clearTimeout(this._pending); this._pending = null; }
    if(this.supported){ try{ window.speechSynthesis.cancel(); }catch(e){} }
  }
};
