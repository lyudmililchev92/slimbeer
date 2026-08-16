/* =========================================================================
 * Router
 * ========================================================================= */
const Router = {
  current:null,
  go(name, params){
    const app = document.getElementById("app");
    if(this.current && this.current._cleanup) this.current._cleanup();
    if(State.ui.screen === "play" && name !== "play") Play.destroy();
    Speech.stop();
    app.innerHTML = "";
    State.ui.screen = name;
    State.ui.params = params || null;
    // Ако екран гръмне, детето не бива да остане пред празнота. Връщаме го
    // вкъщи и оставяме следата в конзолата за разработка.
    let screen;
    try{
      screen = Screens[name] ? Screens[name](params || {}) : Screens.home();
    }catch(err){
      console.error("Екранът «" + name + "» не се отвори:", err);
      State.ui.screen = "home";
      State.ui.params = null;
      try{ screen = Screens.home(); }
      catch(e2){ console.error("И началният екран гръмна:", e2); return; }
    }
    this.current = screen;
    app.appendChild(screen);
    // Чак сега елементите имат размер. Екрани с платно се нуждаят от това —
    // rAF и ResizeObserver не са надеждни, когато прозорецът не е на фокус.
    if(screen._onMounted) screen._onMounted();
    if(DEBUG) Debug.update();
  }
};
