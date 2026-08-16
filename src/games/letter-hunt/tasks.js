/* =========================================================================
 * ЛОВЪТ — какво точно се лови
 * -------------------------------------------------------------------------
 * Играта е една: Буки стои долу, нещо пада отгоре, детето го хваща.
 * Различното е какво се лови и как разбира кое е вярното.
 *
 * Затова тук стои само задачата, а самата игра не знае нищо за букви,
 * звукове или сметки. Задачата казва три неща:
 *
 *   targets      какво трябва да се хване, по ред
 *   distractor() какво друго може да пада
 *   head()       какво стои горе, за да се разбере какво се търси
 *
 * Няма таймер, животи и край на играта в нито един режим. Сгрешеното
 * отскача, пропуснатото се връща.
 * ========================================================================= */

/** Помощник: три различни неща, едно от които е вярното. */
function catchDistractors(pool, avoid){
  const list = pool.filter(x => x !== avoid);
  return list.length ? list : pool;
}

const CATCH_TASKS = {

  /* 1. Сглоби думата — буква по буква. Това беше досегашната игра. */
  word: {
    supports(word){ return !word.audioOnly && word.word.length >= 3 && word.word.length <= 7; },
    build(word){
      const letters = word.word.split("");
      const alphabet = L().alphabet;
      return {
        id: "word",
        targets: letters,
        showSlots: true,
        distractor: () => alphabet[Math.floor(Math.random() * alphabet.length)],
        head(box){ if(hasPicture(word)) box.appendChild(renderArt(word, "catch-pic")); }
      };
    }
  },

  /* 2. Хвани първата буква — показва се само картинката. */
  first: {
    supports(word){ return !word.audioOnly && hasPicture(word) && word.word.length >= 3; },
    build(word){
      const target = word.word.charAt(0);
      const alphabet = catchDistractors(L().alphabet, target);
      return {
        id: "first",
        targets: [target],
        distractor: () => alphabet[Math.floor(Math.random() * alphabet.length)],
        head(box){ box.appendChild(renderArt(word, "catch-pic")); }
      };
    }
  },

  /* 3. Хвани звука — чува се, не се вижда. */
  sound: {
    supports(word){
      return !word.audioOnly && hasPicture(word) && Speech.supported && Speech.hasVoice();
    },
    build(word){
      const lang = State.progress.language;
      const target = firstSound(word, lang);
      // ловим буква, затова целта трябва да е една буква, не двойка
      const letter = target.length === 1 ? target : word.word.charAt(0);
      const alphabet = catchDistractors(L().alphabet, letter);
      return {
        id: "sound",
        targets: [letter],
        say: () => Speech.speak(soundSay(target, lang)),
        distractor: () => alphabet[Math.floor(Math.random() * alphabet.length)],
        head(box){
          const b = h("button", { class:"catch-listen", type:"button",
                                  "aria-label": t("listenLabel") }, "🔊");
          b.addEventListener("click", () => { Sfx.tap(); Speech.speak(soundSay(target, lang)); });
          box.appendChild(b);
        }
      };
    }
  },

  /* 4. Хвани сричката — началото е дадено, търси се продължението. */
  syllable: {
    supports(word){ return !word.audioOnly && hasPicture(word) && word.syllables.length === 2; },
    build(word){
      const target = word.syllables[1];
      const others = WORDS.filter(w => w.syllables.length >= 2 && w.syllables[1] !== target)
                          .map(w => w.syllables[1]);
      return {
        id: "syllable",
        targets: [target],
        wide: true,
        prefix: word.syllables[0],
        distractor: () => others.length ? others[Math.floor(Math.random() * others.length)] : "ЛА",
        head(box){
          box.appendChild(renderArt(word, "catch-pic"));
          box.appendChild(h("span", { class:"catch-prefix" }, word.syllables[0] + " …"));
        }
      };
    }
  },

  /* 5. Хвани числото — горе стоят предмети, лови се колко са. */
  count: {
    supports(){ return true; },
    build(){
      const n = 1 + Math.floor(Math.random() * 9);
      const icon = rand(COUNT_ICONS);
      return {
        id: "count",
        targets: [String(n)],
        say: () => Speech.speak(numberWord(n)),
        distractor: () => String(1 + Math.floor(Math.random() * 10)),
        head(box){ box.appendChild(iconRow(icon, n, "group")); }
      };
    }
  },

  /* 6. Хвани отговора — горе стои сметка. */
  sum: {
    supports(){ return true; },
    build(){
      const a = 1 + Math.floor(Math.random() * 6);
      const b = 1 + Math.floor(Math.random() * (10 - a));
      return {
        id: "sum",
        targets: [String(a + b)],
        say: () => Speech.speak(numberWord(a) + " " + t("plus") + " " + numberWord(b)),
        distractor: () => String(1 + Math.floor(Math.random() * 15)),
        head(box){ box.appendChild(h("span", { class:"catch-sum" }, a + " + " + b)); }
      };
    }
  }
};

/** Избира вид лов за нивото и думата. Пада към сглобяване на дума. */
function buildCatchTask(level, word){
  const wanted = (level.hunt && level.hunt.length) ? level.hunt : ["word"];
  const usable = wanted.filter(id => CATCH_TASKS[id] && CATCH_TASKS[id].supports(word));
  const id = usable.length ? rand(usable) : "word";
  return CATCH_TASKS[id].build(word);
}
