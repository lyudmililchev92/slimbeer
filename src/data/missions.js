/* =========================================================================
 * МИСИИ ИЗВЪН ЕКРАНА
 * -------------------------------------------------------------------------
 * Малки задачи за истинския свят: намери нещо кръгло, донеси четири малки
 * неща, направи буквата О с ръце.
 *
 * Устройството НЕ проверява нищо. Няма камера, няма микрофон, няма
 * местоположение и не се иска никакво разрешение. Детето натиска „Готово“
 * и получава откритие. Доверието е част от играта.
 *
 * `needs` казва за какво умение става дума, за да може екранът да предложи
 * мисия, свързана с това, което детето точно упражнява.
 * ========================================================================= */

const MISSIONS = [
  { id:"red",     icon:"🔴", needs:"color",   bg:"Намери нещо червено.",              nl:"Zoek iets roods." },
  { id:"round",   icon:"⭕", needs:"shape",   bg:"Намери нещо кръгло.",               nl:"Zoek iets ronds." },
  { id:"soft",    icon:"🧸", needs:"quality", bg:"Намери нещо меко.",                 nl:"Zoek iets zachts." },
  { id:"cold",    icon:"🧊", needs:"quality", bg:"Намери нещо студено.",              nl:"Zoek iets kouds." },
  { id:"four",    icon:"4️⃣", needs:"count",   bg:"Донеси четири малки неща.",         nl:"Breng vier kleine dingen." },
  { id:"count5",  icon:"🥄", needs:"count",   bg:"Пребройте пет лъжици заедно.",       nl:"Tel samen vijf lepels." },
  { id:"pairs",   icon:"🧦", needs:"count",   bg:"Намери два еднакви чорапа.",         nl:"Zoek twee dezelfde sokken." },
  { id:"letterM", icon:"🅼", needs:"letter",  bg:"Намери нещо, което започва с М.",    nl:"Zoek iets dat met M begint." },
  { id:"letterS", icon:"🆂", needs:"letter",  bg:"Намери нещо, което започва със С.",  nl:"Zoek iets dat met S begint." },
  { id:"bodyO",   icon:"🙆", needs:"letter",  bg:"Направи буквата О с ръце.",          nl:"Maak de letter O met je armen." },
  { id:"bodyT",   icon:"🙋", needs:"letter",  bg:"Направи буквата Т с тялото си.",     nl:"Maak de letter T met je lijf." },
  { id:"tall",    icon:"📏", needs:"compare", bg:"Намери нещо по-високо от теб.",      nl:"Zoek iets dat groter is dan jij." },
  { id:"small",   icon:"🐜", needs:"compare", bg:"Намери най-малкото нещо в стаята.",  nl:"Zoek het kleinste ding in de kamer." },
  { id:"sound",   icon:"👂", needs:"sound",   bg:"Затвори очи и чуй три звука.",       nl:"Doe je ogen dicht en hoor drie geluiden." },
  { id:"outside", icon:"🌳", needs:"nature",  bg:"Намери навън нещо зелено.",          nl:"Zoek buiten iets groens." },
  { id:"draw",    icon:"🖍️", needs:"draw",    bg:"Нарисувай приятеля си от гората.",   nl:"Teken je vriend uit het bos." },
  { id:"tell",    icon:"💬", needs:"story",   bg:"Разкажи какво стана в разказчето.",  nl:"Vertel wat er in het verhaal gebeurde." },
  { id:"help",    icon:"🤝", needs:"story",   bg:"Помогни на някого с нещо малко.",    nl:"Help iemand met iets kleins." }
];
