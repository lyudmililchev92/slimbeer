/* =========================================================================
 * РАЗКАЗЧЕТА
 * -------------------------------------------------------------------------
 * Мостът между „чета дума“ и „разбирам какво се случва“.
 *
 * Всяко изречение си има високоговорител, но нищо не се изговаря само.
 * Детето решава дали да чете, или да слуша — насила изговорено изречение
 * учи на слушане, не на четене.
 *
 * Едно разказче е един рунд: чете се, после идват въпросите. Грешката не
 * наказва — въпросът просто изчаква следващия опит.
 * ========================================================================= */

const STORIES = {};        // пълни се от stories-bg.js и stories-nl.js

function storyPack(lang){ return STORIES[lang || State.progress.language] || STORIES.bg; }

/* Шест нива, като дължината на разказчето расте. Нивото е филтър. */
const STORY_LEVELS = [
  { id:1, maxStoryLevel:1, wordsToPass:2 },
  { id:2, maxStoryLevel:2, wordsToPass:2 },
  { id:3, maxStoryLevel:3, wordsToPass:2 },
  { id:4, maxStoryLevel:4, wordsToPass:2 },
  { id:5, maxStoryLevel:5, wordsToPass:2 },
  { id:6, maxStoryLevel:6, wordsToPass:3 }
];

function pickStory(level){
  const all = storyPack().filter(s => s.level <= (level.maxStoryLevel || 6));
  if(!all.length) return null;
  const recent = State.session.recent;
  let cands = all.filter(s => recent.indexOf(s.id) < 0);
  if(!cands.length) cands = all;
  // непрочетените имат предимство, после се редува
  const unread = cands.filter(s => !LP().words[s.id]);
  return rand(unread.length ? unread : cands);
}

const MODE_STORY = {
  id: "story", showsPicture: false, fullArea: true,
  supports(){ return true; },

  mount(root, host){
    const story = host.item;
    let mistakes = 0;
    let qIndex = 0;
    let phase = "read";                 // read → questions

    const wrap = h("div", { class:"story" });
    root.appendChild(wrap);

    /* --- корица и изречения --- */
    const head = h("div", { class:"story-head" },
      h("span", { class:"story-scene" }, story.scene || "📖"),
      h("h2", { class:"story-title" }, story.title));
    wrap.appendChild(head);

    const lines = h("div", { class:"story-lines" });
    story.sentences.forEach((text, i) => {
      const row = h("div", { class:"story-line" });
      const say = h("button", { class:"line-listen", type:"button",
                                "aria-label": t("listenLabel") }, "🔊");
      say.addEventListener("click", () => {
        Sfx.tap();
        Speech.speak(text);
        row.classList.remove("speaking");
        void row.offsetWidth;
        row.classList.add("speaking");
      });
      row.appendChild(say);
      row.appendChild(h("p", { class:"line-text" }, text));
      lines.appendChild(row);
    });
    wrap.appendChild(lines);

    const actions = h("div", { class:"story-actions" });
    const readAll = h("button", { class:"btn btn-warm", type:"button" }, "🔊 " + t("storyListenAll"));
    readAll.addEventListener("click", () => {
      Sfx.tap();
      Speech.speak(story.sentences.join(" "));
    });
    const goQuestions = h("button", { class:"btn btn-primary", type:"button" }, t("storyQuestions") + " →");
    goQuestions.addEventListener("click", () => { Sfx.tap(); showQuestion(); });
    actions.append(readAll, goQuestions);
    wrap.appendChild(actions);

    /* --- въпроси --- */
    const qBox = h("div", { class:"story-question", hidden: true });
    wrap.appendChild(qBox);

    function showQuestion(){
      phase = "questions";
      lines.hidden = true;
      actions.hidden = true;
      qBox.hidden = false;
      qBox.innerHTML = "";

      const q = story.questions[qIndex];
      if(!q){                                    // всички въпроси свършиха
        setTimeout(() => host.correct(mistakes), 200);
        return;
      }

      const counter = h("div", { class:"q-counter" },
        (qIndex + 1) + " / " + story.questions.length);
      const prompt = h("p", { class:"prompt say" }, q.text);
      prompt.setAttribute("role", "button");
      prompt.setAttribute("tabindex", "0");
      const sayQ = () => { Sfx.tap(); Speech.speak(q.text); };
      prompt.addEventListener("click", sayQ);
      qBox.append(counter, prompt);

      const opts = h("div", { class:"options" });
      let answered = false;
      q.answers.forEach((text, i) => {
        const b = h("button", { class:"opt-word", type:"button" }, text);
        b.addEventListener("click", () => {
          if(answered) return;
          if(i === q.correct){
            answered = true;
            b.classList.add("right");
            Sfx.place();
            Speech.speak(text);
            qIndex += 1;
            setTimeout(showQuestion, 700);
          } else {
            mistakes++;
            Sfx.wrong();
            shakeEl(b);
            host.mistake();
          }
        });
        opts.appendChild(b);
      });
      qBox.appendChild(opts);
      setTimeout(sayQ, 350);
    }

    return {
      maxHints: 2,
      hint(step){
        if(phase === "read"){
          Speech.speak(story.sentences.join(" "));
          return t("hintStoryListen");
        }
        const q = story.questions[qIndex];
        if(!q) return t("hintHereIs");
        if(step === 1){ Speech.speak(q.text); return t("hintStoryReRead"); }
        const right = qBox.querySelectorAll(".options button")[q.correct];
        if(right) right.classList.add("right");
        Speech.speak(q.answers[q.correct]);
        return t("hintHereIs");
      },
      destroy(){}
    };
  }
};
