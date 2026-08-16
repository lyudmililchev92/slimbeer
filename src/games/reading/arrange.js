/* =========================================================================
 * 8. GAME MODES
 * -------------------------------------------------------------------------
 * Всеки режим е обект:
 *   { id, name, prompt, showsPicture, supports(word), mount(root, host) }
 * mount() връща { hint(step), maxHints, destroy() }.
 * host (виж PlayHost) дава: word, correct(), mistake(el), speakWord(), setBubble()
 * ========================================================================= */

/** Общ конструктор за "подреди токени" — използва се от „Подреди думата“ и „Срички“. */
function createArrangeMode(opts){
  return {
    id: opts.id,
    showsPicture: true,
    // Тук картинката е самата дума, която детето подрежда. Докосването по
    // нея казва думата, а не въпроса — иначе помощта изчезва.
    wholeWord: true,
    supports(word){ return opts.getTokens(word).length >= 2; },

    mount(root, host){
      const tokens = opts.getTokens(host.word);
      const wide = opts.wide;
      const slotsEl = h("div", { class:"slots", role:"list", "aria-label":t("slotsLabel") });
      const trayEl  = h("div", { class:"tray", role:"list", "aria-label":t("trayLabel") });

      const slots = tokens.map((tok, i) => {
        const el = h("button", {
          class: "slot" + (wide ? " wide" : ""),
          type: "button",
          role: "listitem",
          "aria-label": t("emptySlot") + " " + (i+1),
          "data-index": i
        });
        el.addEventListener("click", () => onSlotTap(i));
        return { el, index:i, expect: tok, filledBy: null };
      });
      slots.forEach(s => slotsEl.appendChild(s.el));

      const tiles = shuffledTokens(tokens).map(t => {
        const el = h("button", {
          class: "tile" + (wide ? " wide" : ""),
          type: "button",
          role: "listitem",
          "aria-label": L().ui.letterLabel + " " + t.text
        }, t.text);
        const tile = { id:t.id, text:t.text, el, placed:false };
        attachTileInput(tile);
        return tile;
      });
      tiles.forEach(t => trayEl.appendChild(t.el));

      let selected = null;
      let mistakes = 0;
      let hintTilesShown = false;

      root.appendChild(h("p", { class:"prompt" }, t(opts.promptKey)));
      root.appendChild(slotsEl);
      root.appendChild(trayEl);

      /* ---- логика на поставяне ---- */
      function firstEmpty(){ return slots.find(s => !s.filledBy) || null; }

      function place(tile, slot){
        slot.filledBy = tile;
        tile.placed = true;
        tile.el.classList.add("used");
        tile.el.setAttribute("aria-hidden","true");
        tile.el.tabIndex = -1;
        slot.el.textContent = tile.text;
        slot.el.classList.add("filled");
        slot.el.classList.remove("target");
        slot.el.setAttribute("aria-label", L().ui.letterLabel + " " + tile.text);
        Sfx.place();
        clearSelection();
        clearHintTiles();
        if(slots.every(s => s.filledBy)) finish();
        else if(host.tutorial) tutorialStep();
      }

      function tryPlace(tile, slot){
        if(!tile || tile.placed || !slot || slot.filledBy) return false;
        if(slot.expect === tile.text){ place(tile, slot); return true; }
        wrongMove(tile.el);
        return false;
      }

      function wrongMove(el){
        mistakes++;
        Sfx.wrong();
        shakeEl(el);
        host.mistake();
        if(mistakes >= CONFIG.mistakesForHighlight) softHint();
      }

      /** Ненатрапчива подсказка: маркира следващото поле и правилната плочка. */
      function softHint(){
        const slot = firstEmpty();
        if(!slot) return;
        slot.el.classList.add("target");
        clearHintTiles();
        const tile = tiles.find(t => !t.placed && t.text === slot.expect);
        if(tile){ tile.el.classList.add("hintful"); hintTilesShown = true; }
      }
      function clearHintTiles(){
        if(!hintTilesShown) return;
        tiles.forEach(t => t.el.classList.remove("hintful"));
        hintTilesShown = false;
      }
      function clearSelection(){
        if(selected){ selected.el.classList.remove("selected"); selected = null; }
      }

      function onTileTap(tile){
        if(tile.placed) return;
        Sfx.tap();
        const slot = firstEmpty();
        if(slot && slot.expect === tile.text){ place(tile, slot); return; }
        // Грешна буква за следващото място → остава избрана, детето може да я сложи другаде.
        clearSelection();
        selected = tile;
        tile.el.classList.add("selected");
        wrongMove(tile.el);
      }

      function onSlotTap(i){
        const slot = slots[i];
        if(slot.filledBy){                       // връщане на плочка обратно в редицата
          const tile = slot.filledBy;
          slot.filledBy = null;
          slot.el.textContent = "";
          slot.el.classList.remove("filled");
          slot.el.setAttribute("aria-label", t("emptySlot") + " " + (i+1));
          tile.placed = false;
          tile.el.classList.remove("used");
          tile.el.removeAttribute("aria-hidden");
          tile.el.tabIndex = 0;
          Sfx.tap();
          return;
        }
        if(selected) tryPlace(selected, slot);
      }

      function finish(){
        setTimeout(() => host.correct(mistakes), 260);
      }

      /* ---- drag & drop (pointer events: мишка, пръст, стилус) ---- */
      function attachTileInput(tile){
        let ghost = null, startX = 0, startY = 0, dragging = false, hoverSlot = null, pid = null;

        tile.el.addEventListener("pointerdown", (ev) => {
          if(tile.placed) return;
          pid = ev.pointerId;
          startX = ev.clientX; startY = ev.clientY;
          dragging = false;
          try{ tile.el.setPointerCapture(pid); }catch(e){}
        });

        tile.el.addEventListener("pointermove", (ev) => {
          if(pid !== ev.pointerId || tile.placed) return;
          const dx = ev.clientX - startX, dy = ev.clientY - startY;
          if(!dragging && Math.hypot(dx, dy) < 9) return;
          if(!dragging){
            dragging = true;
            const r = tile.el.getBoundingClientRect();
            ghost = tile.el.cloneNode(true);
            ghost.classList.add("ghost");
            ghost.style.width = r.width + "px";
            ghost.style.height = r.height + "px";
            document.body.appendChild(ghost);
            tile.el.classList.add("grabbed");
            tile.el.style.opacity = "0.25";
            Sfx.tap();
          }
          ghost.style.left = (ev.clientX - ghost.offsetWidth/2) + "px";
          ghost.style.top  = (ev.clientY - ghost.offsetHeight/2) + "px";
          const under = slotUnderPoint(ev.clientX, ev.clientY);
          if(under !== hoverSlot){
            if(hoverSlot) hoverSlot.el.classList.remove("hover");
            hoverSlot = under;
            if(hoverSlot && !hoverSlot.filledBy) hoverSlot.el.classList.add("hover");
          }
        });

        const end = (ev) => {
          if(pid !== ev.pointerId) return;
          try{ tile.el.releasePointerCapture(pid); }catch(e){}
          pid = null;
          if(!dragging){ onTileTap(tile); return; }
          dragging = false;
          tile.el.classList.remove("grabbed");
          tile.el.style.opacity = "";
          if(ghost){ ghost.remove(); ghost = null; }
          if(hoverSlot) hoverSlot.el.classList.remove("hover");
          const target = slotUnderPoint(ev.clientX, ev.clientY);
          hoverSlot = null;
          if(target) tryPlace(tile, target);
          else shakeEl(tile.el);
        };
        tile.el.addEventListener("pointerup", end);
        tile.el.addEventListener("pointercancel", (ev) => {
          if(pid !== ev.pointerId) return;
          try{ tile.el.releasePointerCapture(pid); }catch(e){}
          pid = null; dragging = false;
          tile.el.classList.remove("grabbed");
          tile.el.style.opacity = "";
          if(ghost){ ghost.remove(); ghost = null; }
          if(hoverSlot){ hoverSlot.el.classList.remove("hover"); hoverSlot = null; }
        });
      }

      function slotUnderPoint(x, y){
        const el = document.elementFromPoint(x, y);
        if(!el) return null;
        const slotEl = el.closest ? el.closest(".slot") : null;
        if(!slotEl) return null;
        return slots.find(s => s.el === slotEl) || null;
      }

      /* ---- туториал: показваме кое да докоснем ---- */
      function tutorialStep(){
        const slot = firstEmpty();
        if(!slot) return;
        slot.el.classList.add("target");
        tiles.forEach(t => t.el.classList.remove("hintful"));
        const tile = tiles.find(t => !t.placed && t.text === slot.expect);
        if(tile) tile.el.classList.add("hintful");
        hintTilesShown = true;
        host.setBubble(t("mascotTap") + " " + slot.expect);
      }
      if(host.tutorial) setTimeout(tutorialStep, 600);

      /* ---- публичен интерфейс на режима ---- */
      return {
        maxHints: 3,
        hint(step){
          if(step === 1){ host.speakWord(); return t("hintListen"); }
          const slot = firstEmpty();
          if(!slot) return "";
          if(step === 2){
            slot.el.classList.add("target");
            const tile = tiles.find(t => !t.placed && t.text === slot.expect);
            if(tile){ tile.el.classList.add("hintful"); hintTilesShown = true; }
            return t("hintThisLetter");
          }
          const tile = tiles.find(t => !t.placed && t.text === slot.expect);
          if(tile) place(tile, slot);
          return t("hintGaveLetter");
        },
        destroy(){ clearSelection(); }
      };
    }
  };
}

const MODE_BUILD = createArrangeMode({
  id:"build", promptKey:"promptBuild",
  getTokens: (w) => w.word.split("")
});

const MODE_SYLLABLES = createArrangeMode({
  id:"syllables", promptKey:"promptSyllables", wide:true,
  getTokens: (w) => w.syllables.slice()
});
