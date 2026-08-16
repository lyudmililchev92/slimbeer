"use strict";
/* =========================================================================
 * БУКВИК — детска игра за учене на букви и думи
 * Всичко е в един файл, без зависимости. Секции:
 *   1. CONFIG      2. ART       3. DATA        4. STATE/PERSISTENCE
 *   5. AUDIO       6. DOM/UTIL  7. ANIMATIONS  8. GAME MODES
 *   9. PLAY HOST  10. SCREENS  11. APP INIT
 * ========================================================================= */
(function(){

/* =========================================================================
 * 1. CONFIG
 * ========================================================================= */
const DEBUG = false;                 // true → показва debug панел (смяна на ниво, reset, текуща дума)

const CONFIG = {
  saveKey: "bukvik.save",
  saveVersion: 3,
  starsPerWord: { perfect: 3, good: 2, ok: 1 },
  mistakesForHighlight: 2,           // след толкова грешки — ненатрапчиво подсказваме
  celebrateEvery: 5,                 // на всеки N решени думи — малък празник
  recentMemory: 8,                   // колко думи да не се повтарят
  nextDelay: 1100                    // пауза преди бутона "Следваща"
};

const REDUCED_MOTION = window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================================
 * 2. ART — image system
 * -------------------------------------------------------------------------
 * Всяка дума сочи или към ART[key] (inline SVG), или има emoji fallback.
 * За да сменим по-късно картинките с истински илюстрации, е достатъчно да
 * добавим нов ключ в ART и да го посочим в думата (renderArt не се променя).
 * ========================================================================= */
const SVG = (body) => '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">' + body + '</svg>';
const SHADOW = '<ellipse cx="100" cy="176" rx="58" ry="10" fill="rgba(42,42,69,.08)"/>';

const ART = {
  cat: SVG(SHADOW +
    '<path d="M52 80 L45 32 L88 58 Z" fill="#F2A65A"/><path d="M148 80 L155 32 L112 58 Z" fill="#F2A65A"/>' +
    '<path d="M57 76 L53 45 L80 60 Z" fill="#FFD3C0"/><path d="M143 76 L147 45 L120 60 Z" fill="#FFD3C0"/>' +
    '<ellipse cx="100" cy="106" rx="62" ry="56" fill="#F7B267"/>' +
    '<ellipse cx="100" cy="122" rx="40" ry="30" fill="#FFE6CC"/>' +
    '<ellipse cx="78" cy="98" rx="10" ry="13" fill="#3C3355"/><ellipse cx="122" cy="98" rx="10" ry="13" fill="#3C3355"/>' +
    '<circle cx="81.5" cy="93" r="3.6" fill="#fff"/><circle cx="125.5" cy="93" r="3.6" fill="#fff"/>' +
    '<path d="M92 116 h16 l-8 9 z" fill="#FF8FA3"/><path d="M100 125 v6" stroke="#3C3355" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M100 131 q-9 9 -17 1 M100 131 q9 9 17 1" stroke="#3C3355" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<g stroke="#3C3355" stroke-width="2.6" stroke-linecap="round"><path d="M62 110 H28 M62 120 H31 M138 110 H172 M138 120 H169"/></g>'),

  fish: SVG(
    '<path d="M150 100 L184 72 v56 Z" fill="#F4A259"/>' +
    '<ellipse cx="92" cy="100" rx="66" ry="42" fill="#5EC5E8"/>' +
    '<path d="M92 58 q26 16 26 42 t-26 42" fill="none" stroke="#3AA9D0" stroke-width="5"/>' +
    '<path d="M60 78 q22 10 22 22 t-22 22" fill="none" stroke="#3AA9D0" stroke-width="5"/>' +
    '<circle cx="48" cy="92" r="10" fill="#fff"/><circle cx="46" cy="92" r="5.5" fill="#2A2A45"/>' +
    '<path d="M34 108 q10 8 20 4" stroke="#2A2A45" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="20" cy="66" r="7" fill="#BFE8F6"/><circle cx="34" cy="48" r="5" fill="#BFE8F6"/>'),

  sun: SVG(
    '<g stroke="#FFB443" stroke-width="11" stroke-linecap="round">' +
    '<path d="M100 12 v22 M100 166 v22 M12 100 h22 M166 100 h22 M38 38 l16 16 M146 146 l16 16 M162 38 l-16 16 M54 146 l-16 16"/></g>' +
    '<circle cx="100" cy="100" r="52" fill="#FFD166"/><circle cx="100" cy="100" r="42" fill="#FFE29A"/>' +
    '<circle cx="84" cy="94" r="6" fill="#7A5312"/><circle cx="116" cy="94" r="6" fill="#7A5312"/>' +
    '<path d="M82 114 q18 16 36 0" stroke="#7A5312" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<circle cx="72" cy="112" r="8" fill="#FFB0A8" opacity=".6"/><circle cx="128" cy="112" r="8" fill="#FFB0A8" opacity=".6"/>'),

  house: SVG(SHADOW +
    '<path d="M100 26 L178 92 H22 Z" fill="#F26B6B"/>' +
    '<rect x="42" y="90" width="116" height="80" rx="10" fill="#FFE9D6"/>' +
    '<rect x="84" y="118" width="34" height="52" rx="6" fill="#8C6A4F"/>' +
    '<circle cx="111" cy="146" r="3.6" fill="#FFD166"/>' +
    '<rect x="52" y="106" width="26" height="26" rx="6" fill="#7CC5EB" stroke="#fff" stroke-width="4"/>' +
    '<rect x="124" y="106" width="26" height="26" rx="6" fill="#7CC5EB" stroke="#fff" stroke-width="4"/>' +
    '<rect x="132" y="38" width="20" height="34" rx="5" fill="#C94F4F"/>'),

  apple: SVG(SHADOW +
    '<path d="M100 58 q-8 -22 -26 -28 q12 20 22 30 Z" fill="#7BB661"/>' +
    '<rect x="96" y="40" width="8" height="24" rx="4" fill="#8C6A4F"/>' +
    '<path d="M100 62 c-30 -22 -66 -2 -62 38 c3 34 28 62 44 62 c8 0 12 -5 18 -5 s10 5 18 5 c16 0 41 -28 44 -62 c4 -40 -32 -60 -62 -38 Z" fill="#E4574F"/>' +
    '<path d="M74 92 q-8 12 -6 26" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".55"/>'),

  ball: SVG(SHADOW +
    '<circle cx="100" cy="100" r="66" fill="#FFFFFF" stroke="#DDE1F0" stroke-width="4"/>' +
    '<path d="M100 46 l26 19 -10 31 h-32 l-10 -31 Z" fill="#2A2A45"/>' +
    '<path d="M100 34 v12 M64 78 l-20 -8 M136 78 l20 -8 M84 128 l-12 22 M116 128 l12 22" stroke="#2A2A45" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M46 106 q-6 20 4 34 M154 106 q6 20 -4 34 M62 158 q38 16 76 0" stroke="#2A2A45" stroke-width="6" fill="none" stroke-linecap="round"/>'),

  car: SVG(SHADOW +
    '<path d="M28 128 v-24 q0 -10 10 -12 l18 -3 l18 -22 q4 -5 11 -5 h42 q7 0 11 5 l16 22 l20 5 q10 3 10 13 v21 q0 8 -8 8 H36 q-8 0 -8 -8 Z" fill="#6C8CF5"/>' +
    '<path d="M84 70 h26 v22 H70 Z M118 70 h14 l16 22 h-30 Z" fill="#CFE6FF"/>' +
    '<circle cx="66" cy="140" r="20" fill="#2A2A45"/><circle cx="66" cy="140" r="8" fill="#C6CCE6"/>' +
    '<circle cx="140" cy="140" r="20" fill="#2A2A45"/><circle cx="140" cy="140" r="8" fill="#C6CCE6"/>' +
    '<rect x="26" y="106" width="14" height="10" rx="5" fill="#FFD166"/>'),

  tree: SVG(SHADOW +
    '<rect x="90" y="112" width="20" height="58" rx="8" fill="#8C6A4F"/>' +
    '<circle cx="100" cy="76" r="42" fill="#5FBF7A"/><circle cx="66" cy="100" r="30" fill="#4FAE6A"/>' +
    '<circle cx="134" cy="100" r="30" fill="#6FCB8A"/><circle cx="100" cy="106" r="30" fill="#5FBF7A"/>' +
    '<circle cx="78" cy="70" r="6" fill="#E4574F"/><circle cx="122" cy="88" r="6" fill="#E4574F"/>'),

  flower: SVG(SHADOW +
    '<path d="M100 108 v56" stroke="#5FBF7A" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M100 138 q-26 -6 -30 -26 q26 0 30 26 Z" fill="#5FBF7A"/>' +
    '<g fill="#FF7BA9"><ellipse cx="100" cy="52" rx="20" ry="26"/><ellipse cx="100" cy="108" rx="20" ry="26"/>' +
    '<ellipse cx="72" cy="80" rx="26" ry="20"/><ellipse cx="128" cy="80" rx="26" ry="20"/></g>' +
    '<circle cx="100" cy="80" r="19" fill="#FFD166"/>'),

  moon: SVG(
    '<path d="M124 24 a78 78 0 1 0 44 128 a62 62 0 0 1 -44 -128 Z" fill="#FFD166"/>' +
    '<circle cx="122" cy="86" r="9" fill="#F0BE55"/><circle cx="146" cy="118" r="6" fill="#F0BE55"/>' +
    '<circle cx="112" cy="128" r="5" fill="#F0BE55"/>' +
    '<path d="M44 40 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4 Z" fill="#FFE29A"/>' +
    '<path d="M162 52 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 Z" fill="#FFE29A"/>'),

  cloud: SVG(
    '<circle cx="70" cy="106" r="34" fill="#FFFFFF"/><circle cx="106" cy="88" r="42" fill="#FFFFFF"/>' +
    '<circle cx="142" cy="110" r="30" fill="#FFFFFF"/><rect x="66" y="106" width="80" height="34" rx="17" fill="#FFFFFF"/>' +
    '<circle cx="70" cy="106" r="34" fill="none" stroke="#DDE6F5" stroke-width="3"/>' +
    '<circle cx="106" cy="88" r="42" fill="none" stroke="#DDE6F5" stroke-width="3"/>'),

  boat: SVG(
    '<path d="M100 26 l44 62 h-44 Z" fill="#FF8A6B"/><path d="M92 34 l-34 54 h34 Z" fill="#FFD166"/>' +
    '<rect x="95" y="24" width="7" height="66" rx="3" fill="#8C6A4F"/>' +
    '<path d="M28 100 h144 l-24 42 q-4 8 -14 8 H66 q-10 0 -14 -8 Z" fill="#E4574F"/>' +
    '<path d="M12 156 q22 -12 44 0 t44 0 t44 0 t44 0" stroke="#5EC5E8" stroke-width="9" fill="none" stroke-linecap="round"/>')
};

/* -------------------------------------------------------------------------
 * Проверка дали устройството може да покаже дадено emoji.
 * Рисуваме знака в скрит canvas и го сравняваме с неназначена кодова точка,
 * която винаги се рисува като празно квадратче. Ако съвпадат — шрифтът няма
 * този знак и думата отпада от речника, вместо детето да види квадратче.
 * Не хваща ZWJ последователности (те се разпадат на две картинки вместо на
 * квадратче), затова в речника няма нито една такава.
 * ----------------------------------------------------------------------- */
/** Върви ли играта вградена в чужда страница. Там браузърите ограничават
    звука и говора, а страницата няма как да си вдигне разрешението сама. */
function inForeignFrame(){
  try{ return window.top !== window.self && !window.top.location.href; }
  catch(e){ return true; }          // достъпът гръмна → различен произход
}

function createEmojiProbe(){
  let ctx, canvas;
  try{
    canvas = document.createElement("canvas");
    canvas.width = canvas.height = 20;
    ctx = canvas.getContext("2d", { willReadFrequently:true });
  }catch(e){ ctx = null; }
  if(!ctx) return () => true;                 // няма canvas → пускаме всичко

  ctx.textBaseline = "top";
  ctx.font = "16px sans-serif";
  const draw = (ch) => {
    ctx.clearRect(0, 0, 20, 20);
    ctx.fillText(ch, 0, 0);
    return canvas.toDataURL();
  };
  let missing, empty;
  try{
    missing = draw("􏿿");           // U+10FFFF — винаги липсва
    empty = draw(" ");
  }catch(e){ return () => true; }

  const cache = Object.create(null);
  return (ch) => {
    if(!ch) return false;
    if(cache[ch] === undefined){
      let px;
      try{ px = draw(ch); }catch(e){ return true; }
      cache[ch] = px !== missing && px !== empty;
    }
    return cache[ch];
  };
}

/** Връща DOM елемент с илюстрацията на дадена дума (SVG или emoji). */
function renderArt(word, cls){
  const box = document.createElement("div");
  box.className = "art " + (cls || "");
  if (word.art && ART[word.art]) box.innerHTML = ART[word.art];
  else box.innerHTML = '<span class="emoji" role="img" aria-label="' + word.display + '">' + word.emoji + "</span>";
  return box;
}

/* =========================================================================
 * 3. DATA — категории, думи, нива, азбука
 * ========================================================================= */
/* =========================================================================
 * 3a. ЕЗИЦИ (i18n)
 * -------------------------------------------------------------------------
 * Nederlands е основният език. Всеки езиков пакет носи азбуката си,
 * произношението на буквите, кода за синтез на реч и всички текстове.
 * ========================================================================= */
const DEFAULT_LANG = "nl";

/* Множители върху основната скорост на езика. Бавно е за най-малките. */
const SPEECH_SPEEDS = { slow: 0.6, normal: 1, fast: 1.5 };

const LANGS = {
  nl: {
    name: "Nederlands", flag: "\u{1F1F3}\u{1F1F1}", speech: "nl-NL", rate: 0.5,
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    letterSound: {
      A:"aa", B:"bee", C:"see", D:"dee", E:"ee", F:"ef", G:"gee", H:"haa", I:"ie",
      J:"jee", K:"kaa", L:"el", M:"em", N:"en", O:"oo", P:"pee", Q:"kuu", R:"er",
      S:"es", T:"tee", U:"uu", V:"vee", W:"wee", X:"iks", Y:"ei", Z:"zet"
    },
    praise: ["Goed zo!","Super!","Knap gedaan!","Jij kan het!","Geweldig!","Heel goed!"],
    numbers: ["nul","een","twee","drie","vier","vijf","zes","zeven","acht","negen","tien",
              "elf","twaalf","dertien","veertien","vijftien","zestien","zeventien","achttien",
              "negentien","twintig"],
    categories: {
      animals:"Dieren", food:"Eten", nature:"Natuur", home:"Thuis", objects:"Dingen",
      vehicles:"Voertuigen", family:"Mensen", body:"Lichaam", clothes:"Kleren",
      jobs:"Beroepen", sport:"Sport", music:"Muziek", school:"School", places:"Plekken",
      fantasy:"Sprookjes", holidays:"Feest", shapes:"Vormen en kleuren", space:"Ruimte",
      verbs:"Doen", qualities:"Hoe iets is", time:"Tijd", ideas:"Woorden", place:"Waar", people:"Mensen"
    },
    ui: {
      title:"Letterbeer", tagline:"Kom, we gaan leren!", play:"SPELEN",
      letters:"Letters", stars:"Mijn sterren", settings:"Instellingen",
      level:"Niveau", back:"Terug", sound:"Geluid aan of uit", hint:"Hulp",
      promptBuild:"Zet de letters op volgorde", promptSyllables:"Zet de lettergrepen op volgorde",
      promptMissing:"Welke letter mist?", promptFirst:"Met welke letter begint",
      promptListen:"Luister en kies het plaatje", listenLabel:"Luister naar het woord",
      emptySlot:"Leeg vakje", letterLabel:"Letter", slotsLabel:"Plek voor de letters",
      trayLabel:"Door elkaar gegooide letters", picture:"Luister naar het woord",
      next:"Volgende", letsPlay:"Kom, we gaan spelen!", greatJob:"Je kan het!",
      fantastic:"Fantastisch!", solvedWords:"woorden gemaakt!", carryOn:"Ga door",
      newLevel:"Nieuw niveau!", onward:"Verder",
      mascotName:"Boekie", mascotHello:"Hallo! Ik ben Boekie. We maken samen een woord!",
      mascotTap:"Tik op", tryAgain:"Probeer nog eens, het lukt!",
      hintListen:"Luister naar het woord.", hintThisLetter:"Deze letter!",
      hintGaveLetter:"Ik heb je een letter gegeven.", hintHereIs:"Hier is de letter!",
      hintStartsWith:"Het begint met", hintListenStart:"Luister naar het begin.",
      hintListenAgain:"Luister nog eens.", hintFound:"Hier is hij!",
      learnLetter:"Leer de letter", listen:"Luister", write:"Schrijven",
      startsWith:"Beginnen met", containsLetter:"Met deze letter erin",
      letterLater:"Deze letter komt later.", softSign:"",
      writeTitle:"Schrijf", traceHint:"Trek de letter na met je vinger",
      traceOutside:"Je gaat buiten de letter. Probeer nog eens!",
      traceIncomplete:"Trek de hele letter na. Probeer nog eens!",
      clear:"Wissen", show:"Laten zien", done:"Klaar",
      myStars:"Mijn sterren", learnedWords:"Geleerde woorden",
      noWordsYet:"Nog geen woorden geleerd", playToCollect:"Speel en verzamel je eerste woorden!",
      forParents:"Voor ouders", statPlayed:"gespeelde woorden", statLearned:"geleerde woorden",
      statFirstTry:"eerste keer goed", statLevel:"huidig niveau", statStars:"sterren",
      statLetters:"letters gezien", statSums:"sommen gemaakt", statMathLevel:"rekenniveau", settingsHead:"Instellingen",
      soundSpeech:"Geluid en spraak", voiceLabel:"Stem", voiceOk:"beschikbaar",
      voiceNone:"geen stem voor deze taal op dit apparaat",
      voiceBlocked:"hier geblokkeerd — open het bestand zelf",
      voiceFramed:"in deze pagina mogelijk geen geluid — open het bestand zelf",
      voiceNo:"niet ondersteund",
      language:"Taal", tutorialAgain:"Uitleg opnieuw", start:"Start",
      speechSpeed:"Spreeksnelheid", speedSlow:"Langzaam", speedNormal:"Gewoon", speedFast:"Snel",
      autoSpeak:"Woord vanzelf uitspreken",
      noSaveLabel:"Voortgang", noSaveText:"wordt hier niet bewaard — open het bestand in een browser-app", restartTrack:"Opnieuw beginnen", restartTitle:"Weer bij niveau 1 beginnen?",
      restartText:"De niveaus gaan terug naar het begin. Sterren en geleerde woorden blijven.",
      trackWords:"LEZEN", trackMath:"REKENEN", trackCatch:"LETTERJACHT", trackForest:"LETTERBOS",
      hintFindLetter:"Zoek de letter",
      promptRead:"Welk plaatje hoort bij dit woord?",
      promptCount:"Hoeveel zie je?", promptAdd:"Hoeveel zijn het er samen?",
      promptSub:"Hoeveel blijven er over?", promptSequence:"Welk getal mist?",
      promptCompare:"Waar zijn er meer?",
      plus:"plus", minus:"min", hintCountAgain:"Tel nog eens rustig.",
      privacyHead:"Privacy",
      privacyText:"Geen advertenties, geen account, geen tracking en geen persoonlijke gegevens. De voortgang blijft in de browser. Voor het voorlezen gebruikt het spel de stem van het apparaat; als er alleen een online stem is, gaat het woord naar die dienst.",
      progressHead:"Voortgang", deleteProgress:"Voortgang wissen",
      confirmTitle:"Voortgang echt wissen?",
      confirmText:"Sterren, niveaus en geleerde woorden gaan weg. Dit kan niet terug.",
      cancel:"Annuleren", confirmYes:"Ja, wissen", wellDone:"Goed zo!"
    }
  },

  bg: {
    name: "Български", flag: "\u{1F1E7}\u{1F1EC}", speech: "bg-BG", rate: 0.62,
    alphabet: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ".split(""),
    letterSound: {
      "А":"а","Б":"бъ","В":"въ","Г":"гъ","Д":"дъ","Е":"е","Ж":"жъ","З":"зъ","И":"и","Й":"й",
      "К":"къ","Л":"лъ","М":"мъ","Н":"нъ","О":"о","П":"пъ","Р":"ръ","С":"съ","Т":"тъ","У":"у",
      "Ф":"фъ","Х":"хъ","Ц":"цъ","Ч":"чъ","Ш":"шъ","Щ":"щъ","Ъ":"ъ","Ь":"ер малък","Ю":"ю","Я":"я"
    },
    praise: ["Браво!","Супер!","Отлично!","Ти можеш!","Чудесно!","Много добре!"],
    numbers: ["нула","едно","две","три","четири","пет","шест","седем","осем","девет","десет",
              "единадесет","дванадесет","тринадесет","четиринадесет","петнадесет","шестнадесет",
              "седемнадесет","осемнадесет","деветнадесет","двадесет"],
    categories: {
      animals:"Животни", food:"Храна", nature:"Природа", home:"Дом", objects:"Предмети",
      vehicles:"Превозни средства", family:"Хора и семейство", body:"Тяло", clothes:"Дрехи",
      jobs:"Професии", sport:"Спорт", music:"Музика", school:"Училище", places:"Места",
      fantasy:"Приказки", holidays:"Празници", shapes:"Форми и цветове", space:"Космос",
      verbs:"Действия", qualities:"Какви са", time:"Време", ideas:"Думи", place:"Къде", people:"Хора"
    },
    ui: {
      title:"Буквик", tagline:"Хайде да учим!", play:"ИГРАЙ",
      letters:"Букви", stars:"Моите звезди", settings:"Настройки",
      level:"Ниво", back:"Назад", sound:"Включи или изключи звука", hint:"Помощ",
      promptBuild:"Подреди буквите", promptSyllables:"Подреди сричките",
      promptMissing:"Коя буква липсва?", promptFirst:"С коя буква започва",
      promptListen:"Чуй думата и избери картинката", listenLabel:"Чуй думата",
      emptySlot:"Празно място", letterLabel:"Буква", slotsLabel:"Място за буквите",
      trayLabel:"Разбъркани букви", picture:"Чуй думата",
      next:"Следваща", letsPlay:"Хайде да играем!", greatJob:"Браво! Успя!",
      fantastic:"Страхотно!", solvedWords:"думи!", carryOn:"Продължи",
      newLevel:"Ново ниво!", onward:"Напред",
      mascotName:"Буки", mascotHello:"Здравей! Аз съм Буки. Да подредим думата!",
      mascotTap:"Докосни", tryAgain:"Опитай пак, можеш!",
      hintListen:"Слушай думата.", hintThisLetter:"Ето тази буква!",
      hintGaveLetter:"Помогнах ти с една буква.", hintHereIs:"Ето я буквата!",
      hintStartsWith:"Започва с", hintListenStart:"Слушай началото.",
      hintListenAgain:"Слушай пак.", hintFound:"Ето я!",
      learnLetter:"Научи буквата", listen:"Чуй", write:"Напиши",
      startsWith:"Започват с", containsLetter:"Има я в думата",
      letterLater:"Тази буква ще срещнем по-късно.",
      softSign:"Ь никога не е сам. Той стои след друга буква, например в „шофьор“.",
      writeTitle:"Напиши", traceHint:"Проследи буквата с пръст",
      traceOutside:"Излизаш извън буквата. Опитай пак!",
      traceIncomplete:"Мини по цялата буква. Опитай пак!",
      clear:"Изчисти", show:"Покажи", done:"Готово",
      myStars:"Моите звезди", learnedWords:"Научени думи",
      noWordsYet:"Още няма научени думи", playToCollect:"Играй и събери първите си думи!",
      forParents:"За родителя", statPlayed:"изиграни думи", statLearned:"научени думи",
      statFirstTry:"верни от първия път", statLevel:"текущо ниво", statStars:"звезди",
      statLetters:"срещнати букви", statSums:"решени сметки", statMathLevel:"ниво по смятане", settingsHead:"Настройки",
      soundSpeech:"Звук и говор", voiceLabel:"Глас", voiceOk:"наличен",
      voiceNone:"няма глас за този език на устройството",
      voiceBlocked:"блокиран тук — отвори самия файл",
      voiceFramed:"в тази страница може да няма звук — отвори самия файл",
      voiceNo:"не се поддържа",
      language:"Език", tutorialAgain:"Обучение отначало", start:"Пусни",
      speechSpeed:"Скорост на говора", speedSlow:"Бавно", speedNormal:"Нормално", speedFast:"Бързо",
      autoSpeak:"Сама да изговаря думата",
      noSaveLabel:"Прогрес", noSaveText:"тук не се запазва — отвори файла в приложение с браузър", restartTrack:"Започни отначало", restartTitle:"Да върнем ли на ниво 1?",
      restartText:"Нивата се връщат в началото. Звездите и научените думи остават.",
      trackWords:"ЧЕТЕНЕ", trackMath:"СМЯТАНЕ", trackCatch:"ЛОВ НА БУКВИ", trackForest:"В ГОРАТА",
      hintFindLetter:"Търси буквата",
      promptRead:"Коя картинка е думата?",
      promptCount:"Колко виждаш?", promptAdd:"Колко са заедно?",
      promptSub:"Колко остават?", promptSequence:"Кое число липсва?",
      promptCompare:"Къде са повече?",
      plus:"плюс", minus:"минус", hintCountAgain:"Преброй пак спокойно.",
      privacyHead:"Поверителност",
      privacyText:"Няма реклами, регистрация, проследяване или събиране на лични данни. Прогресът се пази в браузъра. За изговора играта ползва гласа на устройството; ако има само онлайн глас, думата отива до тази услуга.",
      progressHead:"Прогрес", deleteProgress:"Изтрий прогреса",
      confirmTitle:"Да изтрием ли прогреса?",
      confirmText:"Звездите, нивата и научените думи ще бъдат изтрити. Това не може да се върне.",
      cancel:"Отказ", confirmYes:"Да, изтрий", wellDone:"Браво!"
    }
  }
};

const CATEGORY_ACCENTS = {
  animals:"#59C1A6", food:"#FF9F68", nature:"#57C07A", home:"#7C9CF5",
  objects:"#B58BEF", vehicles:"#5EB7E8", family:"#FF8FB1", body:"#F2867E",
  clothes:"#E39BD8", jobs:"#6FA8DC", sport:"#61C0BF", music:"#A98BEF",
  school:"#F5B942", places:"#8AA6C4", fantasy:"#C77DD6", holidays:"#FF9CA8",
  shapes:"#7BC5E8", space:"#8E8FE0",
  verbs:"#E8A33D", qualities:"#9B8AE0", time:"#5FB3C4", ideas:"#D98BA8", place:"#7FB069", people:"#E0959B"
};

/** Активният езиков пакет. */
function L(){ return LANGS[State.progress.language] || LANGS[DEFAULT_LANG]; }
/** Текст от активния език. */
function t(key){ return L().ui[key] || key; }

/* -------------------------------------------------------------------------
 * Речник. Всеки ред е "БГ-СРИЧ-КИ/NL-SYL-LA-BEN картинка".
 * Двата езика делят една картинка, затова не могат да се разминат.
 * "-" вместо дума = понятието не се използва на този език.
 * ----------------------------------------------------------------------- */
/* Речникът живее в words.js, за да се добавят думи, без да се пипа кодът.
   Той се зарежда преди този файл и оставя речника на window. */
const WORD_SOURCE = window.WORD_SOURCE || {};
if(!Object.keys(WORD_SOURCE).length){
  // По-добре ясно съобщение, отколкото игра без нито една дума.
  document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    if(app) app.textContent = "words.js липсва — сложи го до index.html.";
  });
}


/** Разгъва речника за даден език. */
function buildWords(lang, isImageUsable){
  const out = [];
  const index = lang === "bg" ? 0 : 1;
  for(const category in WORD_SOURCE){
    WORD_SOURCE[category].split(/[|\n]/).forEach(raw => {
      const entry = raw.trim();
      if(!entry) return;
      const parts = entry.split(/\s+/);
      const split = (parts[0].split("/")[index] || "").trim();
      if(!split || split === "-") return;              // няма дума на този език
      const syllables = split.split("-");
      const word = syllables.join("");
      const image = parts[1] || "";
      const w = {
        word: word,
        display: word.charAt(0) + word.slice(1).toLowerCase(),
        category: category,
        syllables: syllables,
        difficulty: word.length <= 4 ? 1 : (word.length <= 6 ? 2 : 3)
      };
      if(image === "~"){
        // Дума без картинка: детето я чува и я подрежда. Влиза само там,
        // където има глас — иначе е неиграема.
        w.audioOnly = true;
        out.push(w);
      } else {
        if(image.charAt(0) === "@") w.art = image.slice(1);
        else w.emoji = image;
        if(isImageUsable(w)) out.push(w);
      }
    });
  }
  return out;
}

/* Попълва се в init() и при смяна на език. */
let WORDS = [];

/* Ниво = филтър върху речника + кои мини-игри се появяват. Data-driven. */
const LEVELS = [
  { id:1,  minLen:2, maxLen:3,  maxDifficulty:1, wordsToPass:5,  modes:["build"] },
  { id:2,  minLen:4, maxLen:4,  maxDifficulty:1, wordsToPass:6,  modes:["build","build","first"] },
  { id:3,  minLen:4, maxLen:4,  maxDifficulty:1, wordsToPass:6,  modes:["build","build","first","missing"] },
  { id:4,  minLen:4, maxLen:5,  maxDifficulty:2, wordsToPass:7,  modes:["build","build","missing","listen","read"] },
  { id:5,  minLen:5, maxLen:5,  maxDifficulty:2, wordsToPass:7,  modes:["build","build","missing","syllables","listen","read"] },
  { id:6,  minLen:5, maxLen:6,  maxDifficulty:2, audioWords:true, wordsToPass:8,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:7,  minLen:6, maxLen:6,  maxDifficulty:2, audioWords:true, wordsToPass:8,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:8,  minLen:6, maxLen:7,  maxDifficulty:3, audioWords:true, wordsToPass:8,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:9,  minLen:7, maxLen:7,  maxDifficulty:3, audioWords:true, wordsToPass:9,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:10, minLen:7, maxLen:8,  maxDifficulty:3, audioWords:true, wordsToPass:9,  modes:["build","build","missing","syllables","first","listen","read"] },
  { id:11, minLen:8, maxLen:9,  maxDifficulty:3, audioWords:true, wordsToPass:10, modes:["build","build","missing","syllables","first","listen","read"] },
  { id:12, minLen:8, maxLen:99, maxDifficulty:3, audioWords:true, wordsToPass:10, modes:["build","build","missing","syllables","first","listen","read"] }
];
function levelName(id){ return t("level") + " " + id; }

/* Похвали и азбука идват от активния език. */

function defaultTrackProgress(){
  return {
    currentLevel: 1,
    levelProgress: 0,      // решени задачи в текущото ниво
    completedWords: 0,
    firstTryCorrect: 0,
    attempts: 0,
    words: {},             // "POES": {solved:2, mistakes:1, firstTry:true}
    learnedLetters: {}     // "P": 4  (само за пътя с думите)
  };
}
/* Всеки език има отделен прогрес за всеки път на учене. */
function defaultLangProgress(){
  return { words: defaultTrackProgress(), math: defaultTrackProgress(),
           catch: defaultTrackProgress(), forest: defaultTrackProgress() };
}

/* Прогресът по думи и нива е отделен за всеки език — ученето на
   нидерландски е независимо от българското. Звездите са общи. */
function defaultProgress(){
  return {
    version: CONFIG.saveVersion,
    language: DEFAULT_LANG,
    totalStars: 0,
    soundEnabled: true,
    speechSpeed: "normal",
    autoSpeak: false,   // да изговаря ли думата сама при нов рунд
    tutorialCompleted: false,
    byLang: { nl: defaultLangProgress(), bg: defaultLangProgress() }
  };
}

const TRACK_IDS = ["words", "math", "catch", "forest"];

const Store = {
  load(){
    try{
      const raw = localStorage.getItem(CONFIG.saveKey);
      if(!raw) return defaultProgress();
      return Store.migrate(JSON.parse(raw));
    }catch(e){
      return defaultProgress();
    }
  },
  /** Обновяване на стари формати. */
  migrate(data){
    const base = defaultProgress();
    if(!data || typeof data !== "object") return base;

    // v1 → v3: единичен прогрес → по език и по път (старият беше само български, само думи)
    if(data.version === 1){
      const bg = defaultLangProgress();
      ["currentLevel","levelProgress","completedWords","firstTryCorrect","attempts","words","learnedLetters"]
        .forEach(k => { if(data[k] !== undefined) bg.words[k] = data[k]; });
      return Object.assign(base, {
        totalStars: data.totalStars || 0,
        soundEnabled: data.soundEnabled !== false,
        speechSpeed: "normal",
        tutorialCompleted: !!data.tutorialCompleted,
        language: "bg",
        byLang: { nl: defaultLangProgress(), bg: bg }
      });
    }

    const out = Object.assign(base, data, { version: CONFIG.saveVersion });
    out.byLang = Object.assign(base.byLang, data.byLang || {});
    for(const code in LANGS){
      const src2 = out.byLang[code] || {};
      // v2 → v3: прогресът беше плосък (само думи) → влиза в пътя "words"
      const flat = src2.currentLevel !== undefined;
      const lang = defaultLangProgress();
      if(flat) Object.assign(lang.words, src2);
      else TRACK_IDS.forEach(tr => { if(src2[tr]) Object.assign(lang[tr], src2[tr]); });
      out.byLang[code] = lang;
    }
    if(!LANGS[out.language]) out.language = DEFAULT_LANG;
    if(!SPEECH_SPEEDS[out.speechSpeed]) out.speechSpeed = "normal";
    return out;
  },
  available: true,     // може ли браузърът да пази прогрес тук
  save(){
    try{
      localStorage.setItem(CONFIG.saveKey, JSON.stringify(State.progress));
      this.available = true;
    }catch(e){
      // Частен режим или преглед на файл (напр. Files на iOS). Играта
      // продължава нормално — губи се само помненето след затваряне.
      this.available = false;
    }
  },
  reset(){
    try{ localStorage.removeItem(CONFIG.saveKey); }catch(e){}
    const lang = State.progress ? State.progress.language : DEFAULT_LANG;
    State.progress = defaultProgress();
    State.progress.language = lang;
  }
};

const State = {
  progress: null,
  /* Сесийни данни — не се пазят */
  session: { recent:[], solvedInSession:0, round:null, track:"words" },
  ui: { screen:"home", params:null }
};

/** Прогресът за активния език и път (по подразбиране — текущия път). */
function LP(track){
  const lang = State.progress.byLang[State.progress.language];
  return lang[track || State.session.track || "words"];
}

/** Смяна на езика: пресглобява речника и се връща на началния екран. */
function setLanguage(code){
  if(!LANGS[code] || code === State.progress.language) return;
  State.progress.language = code;
  Store.save();
  rebuildWords();
  document.documentElement.lang = code;
  Speech.stop();
  State.session = { recent:[], solvedInSession:0, round:null, track:State.session.track };
  Router.go("home");
}

/** Централизиран запис на резултат от решена задача (дума или сметка). */
function recordResult(item, mistakes, hintsUsed){
  const p = State.progress, lp = LP(), alphabet = L().alphabet;
  if(mistakes === 0 && hintsUsed === 0) lp.firstTryCorrect += 1;

  if(item.word){                      // само пътят с думите пази думи и букви
    const rec = lp.words[item.word] || { solved:0, mistakes:0, firstTry:false };
    rec.solved += 1;
    rec.mistakes += mistakes;
    if(mistakes === 0 && hintsUsed === 0) rec.firstTry = true;
    lp.words[item.word] = rec;
    item.word.split("").forEach(ch => {
      if(alphabet.indexOf(ch) >= 0) lp.learnedLetters[ch] = (lp.learnedLetters[ch]||0) + 1;
    });
  }
  lp.completedWords += 1;

  let stars = CONFIG.starsPerWord.ok;
  if(mistakes === 0 && hintsUsed === 0) stars = CONFIG.starsPerWord.perfect;
  else if(mistakes <= 2 && hintsUsed <= 1) stars = CONFIG.starsPerWord.good;
  p.totalStars += stars;

  lp.levelProgress += 1;
  let leveledUp = false;
  const lv = getLevel(lp.currentLevel);
  if(lp.levelProgress >= lv.wordsToPass && lp.currentLevel < levelCount()){
    lp.currentLevel += 1;
    lp.levelProgress = 0;
    leveledUp = true;
  }
  Store.save();
  return { stars, leveledUp };
}

function addStars(n){
  State.progress.totalStars += n;
  Store.save();
}

function getLevel(id, track){
  const list = (TRACKS[track || State.session.track || "words"] || TRACKS.words).levels();
  return list.find(l => l.id === id) || list[0];
}
function levelCount(track){
  return (TRACKS[track || State.session.track || "words"] || TRACKS.words).levels().length;
}

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
  rate(opts){
    if(opts && opts.rate) return opts.rate;
    const base = (LANGS[State.progress.language] || {}).rate || 0.8;
    const mult = SPEECH_SPEEDS[State.progress.speechSpeed] || 1;
    return Math.max(0.1, Math.min(2, base * mult));
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

/* =========================================================================
 * 6. DOM / помощни функции
 * ========================================================================= */
function h(tag, props, ...children){
  const e = document.createElement(tag);
  if(props){
    for(const k in props){
      const v = props[k];
      if(v === null || v === undefined || v === false) continue;
      if(k === "class") e.className = v;
      else if(k === "html") e.innerHTML = v;
      else if(k === "style") Object.assign(e.style, v);
      else if(k.slice(0,2) === "on") e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v === true ? "" : v);
    }
  }
  children.flat().forEach(c => {
    if(c === null || c === undefined || c === false) return;
    e.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  });
  return e;
}

const shuffle = (arr) => {
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
};
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Разбърква токени, но избягва вече подредения резултат. Всеки токен има uid. */
function shuffledTokens(tokens){
  const withId = tokens.map((t, i) => ({ id: "t" + i, text: t }));
  if(withId.length < 2) return withId;
  let out = withId, tries = 0;
  do{
    out = shuffle(withId);
    tries++;
  } while(tries < 40 && out.map(o => o.text).join("") === tokens.join(""));
  return out;
}

function shakeEl(el){
  if(!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;                       // рестарт на анимацията
  el.classList.add("shake");
  setTimeout(() => el.classList.remove("shake"), 480);
}

function backButton(onClick, label){
  return h("button", { class:"icon-btn", "aria-label": label || t("back"), onClick: () => { Sfx.tap(); onClick(); } }, "←");
}

/* Маскот „Буки“ — прост inline SVG персонаж */
function MASCOT_NAME(){ return t("mascotName"); }
function mascotSVG(cls){
  return '<svg class="' + (cls||"") + '" viewBox="0 0 120 120" role="img" aria-label="' + MASCOT_NAME() + '">' +
    '<ellipse cx="60" cy="112" rx="34" ry="6" fill="rgba(42,42,69,.10)"/>' +
    '<path d="M28 44 L20 16 L44 30 Z" fill="#6C5CE7"/><path d="M92 44 L100 16 L76 30 Z" fill="#6C5CE7"/>' +
    '<ellipse cx="60" cy="66" rx="42" ry="42" fill="#7D6FF0"/>' +
    '<ellipse cx="60" cy="80" rx="27" ry="24" fill="#EDEAFF"/>' +
    '<circle cx="45" cy="58" r="14" fill="#fff"/><circle cx="75" cy="58" r="14" fill="#fff"/>' +
    '<circle cx="47" cy="59" r="7" fill="#2A2A45"/><circle cx="73" cy="59" r="7" fill="#2A2A45"/>' +
    '<circle cx="49.5" cy="56" r="2.6" fill="#fff"/><circle cx="75.5" cy="56" r="2.6" fill="#fff"/>' +
    '<path d="M54 74 h12 l-6 8 z" fill="#FFB443"/>' +
    '<path d="M52 90 q8 7 16 0" stroke="#6C5CE7" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="32" cy="76" r="6" fill="#FF9DBB" opacity=".65"/><circle cx="88" cy="76" r="6" fill="#FF9DBB" opacity=".65"/>' +
    '</svg>';
}

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

/** Режим „Липсваща буква“. */
const MODE_MISSING = {
  id:"missing", showsPicture:true,
  supports(word){ return word.word.length >= 3; },
  mount(root, host){
    const letters = host.word.word.split("");
    const gapIndex = 1 + Math.floor(Math.random() * (letters.length - 2)); // не първата и не последната
    const answer = letters[gapIndex];

    const lineEl = h("div", { class:"word-line", "aria-label":t("promptMissing") });
    let gapEl = null;
    letters.forEach((ch, i) => {
      if(i === gapIndex){
        gapEl = h("div", { class:"ch gap", "aria-label":t("promptMissing") }, "?");
        lineEl.appendChild(gapEl);
      } else {
        lineEl.appendChild(h("div", { class:"ch" }, ch));
      }
    });

    const distractors = shuffle(L().alphabet.filter(l => l !== answer)).slice(0, 2);
    const options = shuffle([answer].concat(distractors));
    const optsEl = h("div", { class:"options" });
    let mistakes = 0, done = false;

    options.forEach(l => {
      const b = h("button", { class:"opt-letter", type:"button", "aria-label":t("letterLabel") + " " + l }, l);
      b.addEventListener("click", () => {
        if(done) return;
        if(l === answer){
          done = true;
          b.classList.add("right");
          gapEl.textContent = l;
          gapEl.classList.add("filled");
          Sfx.place();
          setTimeout(() => host.correct(mistakes), 420);
        } else {
          mistakes++;
          Sfx.wrong();
          shakeEl(b);
          host.mistake();
        }
      });
      optsEl.appendChild(b);
    });

    root.appendChild(h("p", { class:"prompt" }, t("promptMissing")));
    root.appendChild(lineEl);
    root.appendChild(optsEl);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ host.speakWord(); return t("hintListen"); }
        const right = Array.from(optsEl.children).find(b => b.textContent === answer);
        if(right) right.classList.add("right");
        return t("hintHereIs");
      },
      destroy(){}
    };
  }
};

/** Режим „С коя буква започва?“. */
const MODE_FIRST = {
  id:"first", showsPicture:true,
  supports(){ return true; },
  mount(root, host){
    const answer = host.word.word[0];
    const distractors = shuffle(L().alphabet.filter(l => l !== answer)).slice(0, 2);
    const options = shuffle([answer].concat(distractors));
    const optsEl = h("div", { class:"options" });
    let mistakes = 0, done = false;

    options.forEach(l => {
      const b = h("button", { class:"opt-letter", type:"button", "aria-label":t("letterLabel") + " " + l }, l);
      b.addEventListener("click", () => {
        if(done) return;
        if(l === answer){
          done = true;
          b.classList.add("right");
          Sfx.place();
          setTimeout(() => host.correct(mistakes), 420);
        } else {
          mistakes++; Sfx.wrong(); shakeEl(b); host.mistake();
        }
      });
      optsEl.appendChild(b);
    });

    root.appendChild(h("p", { class:"prompt" }, t("promptFirst") + " " + host.word.word + "?"));
    root.appendChild(optsEl);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ host.speakWord(); return t("hintListenStart"); }
        const right = Array.from(optsEl.children).find(b => b.textContent === answer);
        if(right) right.classList.add("right");
        Speech.speak(L().letterSound[answer] || answer);
        return t("hintStartsWith") + " " + answer + ".";
      },
      destroy(){}
    };
  }
};

/** Режим „Чуй думата“ — показва 3 картинки, детето избира правилната. */
const MODE_LISTEN = {
  id:"listen", showsPicture:false,
  supports(word){ return !word.audioOnly && Speech.supported && Speech.hasVoice(); },
  mount(root, host){
    const others = shuffle(WORDS.filter(w => w.word !== host.word.word)).slice(0, 2);
    const choices = shuffle([host.word].concat(others));
    let mistakes = 0, done = false;

    const listen = h("button", { class:"big-listen", type:"button", "aria-label":t("listenLabel") }, "🔊");
    listen.addEventListener("click", () => host.speakWord());
    root.appendChild(listen);
    root.appendChild(h("p", { class:"prompt" }, t("promptListen")));

    const optsEl = h("div", { class:"options" });
    choices.forEach(w => {
      const b = h("button", { class:"opt-pic", type:"button", "aria-label":w.display });
      b.appendChild(renderArt(w));
      b.addEventListener("click", () => {
        if(done) return;
        if(w.word === host.word.word){
          done = true;
          b.classList.add("right");
          Sfx.place();
          setTimeout(() => host.correct(mistakes), 420);
        } else {
          mistakes++; Sfx.wrong(); shakeEl(b); host.mistake();
        }
      });
      optsEl.appendChild(b);
    });
    root.appendChild(optsEl);
    setTimeout(() => host.speakWord(), 500);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ host.speakWord(); return t("hintListenAgain"); }
        const right = Array.from(optsEl.children)[choices.findIndex(w => w.word === host.word.word)];
        if(right) right.classList.add("right");
        return t("hintFound");
      },
      destroy(){}
    };
  }
};


/** Режим „Чети думата“ — показва думата с букви, детето избира картинката.
    Обратното на „Чуй думата“: тук се чете, не се слуша. */
const MODE_READ = {
  id:"read", showsPicture:false,
  supports(word){ return !word.audioOnly && WORDS.length >= 3 && word.word.length >= 3; },
  mount(root, host){
    const others = shuffle(WORDS.filter(w => w.word !== host.word.word &&
      Math.abs(w.word.length - host.word.word.length) <= 2)).slice(0, 2);
    const choices = shuffle([host.word].concat(others));
    let mistakes = 0, done = false;

    root.appendChild(h("p", { class:"prompt" }, t("promptRead")));
    const big = h("div", { class:"read-word", "aria-label":host.word.word }, host.word.word);
    root.appendChild(big);

    const optsEl = h("div", { class:"options" });
    choices.forEach(w => {
      const b = h("button", { class:"opt-pic", type:"button", "aria-label":w.display });
      b.appendChild(renderArt(w));
      b.addEventListener("click", () => {
        if(done) return;
        if(w.word === host.word.word){
          done = true; b.classList.add("right"); Sfx.place();
          setTimeout(() => host.correct(mistakes), 420);
        } else { mistakes++; Sfx.wrong(); shakeEl(b); host.mistake(); }
      });
      optsEl.appendChild(b);
    });
    root.appendChild(optsEl);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ host.speakWord(); return t("hintListen"); }
        const right = Array.from(optsEl.children)[choices.findIndex(w => w.word === host.word.word)];
        if(right) right.classList.add("right");
        return t("hintFound");
      },
      destroy(){}
    };
  }
};

const MODES = {};
[MODE_BUILD, MODE_SYLLABLES, MODE_MISSING, MODE_FIRST, MODE_LISTEN, MODE_READ].forEach(m => { MODES[m.id] = m; });

/* Избор на дума и режим за следващия рунд. */
function wordPool(level){
  const allowAudio = !!level.audioWords && Speech.hasVoice();
  return WORDS.filter(w =>
    (allowAudio || !w.audioOnly) &&
    w.word.length >= level.minLen &&
    w.word.length <= level.maxLen &&
    w.difficulty <= level.maxDifficulty
  );
}
function pickWord(level){
  const pool = wordPool(level);
  if(!pool.length) return rand(WORDS);
  let cands = pool.filter(w => State.session.recent.indexOf(w.word) < 0);
  if(!cands.length) cands = pool;
  const unsolved = cands.filter(w => !LP().words[w.word]);
  return rand(unsolved.length ? unsolved : cands);
}
function pickMode(level, word, forceBuild){
  if(forceBuild) return MODES.build;
  const ids = level.modes.filter(id => MODES[id] && MODES[id].supports(word));
  if(!ids.length) return MODES.build;
  return MODES[rand(ids)];
}

/* =========================================================================
 * 9. PLAY HOST — екранът на играта
 * ========================================================================= */

/* =========================================================================
 * 8b. СМЯТАНЕ
 * -------------------------------------------------------------------------
 * Задачите се раждат от правилата на нивото, не от речник — затова
 * не се повтарят и се мащабират до колкото ни трябва.
 * ========================================================================= */
const COUNT_ICONS = ["🍎","⭐","🐟","🌸","🎈","🍓","🐞","🌰","🧩","🚗"];

const MATH_LEVELS = [
  { id:1,  modes:["count"],                      max:5,  wordsToPass:5 },
  { id:2,  modes:["count"],                      max:10, wordsToPass:6 },
  { id:3,  modes:["count","sequence"],           max:10, wordsToPass:6 },
  { id:4,  modes:["add"],                        max:5,  wordsToPass:6 },
  { id:5,  modes:["add","count"],                max:10, wordsToPass:7 },
  { id:6,  modes:["sub"],                        max:5,  wordsToPass:6 },
  { id:7,  modes:["sub","add"],                  max:10, wordsToPass:7 },
  { id:8,  modes:["compare"],                    max:10, wordsToPass:6 },
  { id:9,  modes:["add","sub","count","compare"],max:10, wordsToPass:8 },
  { id:10, modes:["add","sub","sequence"],       max:20, wordsToPass:8 }
];

/** Ражда задача според правилата на нивото. */
function pickMathItem(level){
  const kind = rand(level.modes);
  const max = level.max, icon = rand(COUNT_ICONS);
  const upto = (n) => 1 + Math.floor(Math.random() * n);
  if(kind === "count")    return { kind, icon, n: upto(max) };
  if(kind === "sequence"){
    const start = 1 + Math.floor(Math.random() * Math.max(1, max - 4));
    const seq = [start, start+1, start+2, start+3];
    return { kind, seq, gap: 1 + Math.floor(Math.random() * 2) };
  }
  if(kind === "compare"){
    let a = upto(max), b = upto(max);
    while(a === b) b = upto(max);
    return { kind, icon, a, b };
  }
  if(kind === "sub"){
    const a = 2 + Math.floor(Math.random() * (max - 1));
    return { kind, icon, a, b: 1 + Math.floor(Math.random() * (a - 1)) };
  }
  const a = upto(max - 1);
  return { kind:"add", icon, a, b: upto(Math.max(1, max - a)) };
}
function mathAnswer(it){
  if(it.kind === "count")    return it.n;
  if(it.kind === "add")      return it.a + it.b;
  if(it.kind === "sub")      return it.a - it.b;
  if(it.kind === "sequence") return it.seq[it.gap];
  return Math.max(it.a, it.b);
}
/** Име на числото на активния език — за изговор. */
function numberWord(n){
  const list = L().numbers;
  return (list && list[n] !== undefined) ? list[n] : String(n);
}
/** Ред от иконки за броене. */
function iconRow(icon, count, cls){
  const box = h("div", { class:"count-row " + (cls || "") });
  for(let i = 0; i < count; i++) box.appendChild(h("span", { class:"count-item" }, icon));
  return box;
}
/** Три възможни отговора: верният и два близки. */
function numberOptions(answer, max){
  const set = new Set([answer]);
  let guard = 0;
  while(set.size < 3 && guard++ < 50){
    const d = 1 + Math.floor(Math.random() * 3);
    const cand = Math.random() < 0.5 ? answer - d : answer + d;
    if(cand >= 0 && cand <= Math.max(max, answer + 3)) set.add(cand);
  }
  let n = 0;
  while(set.size < 3) set.add(answer + (++n));
  return shuffle([...set]);
}

/** Общ конструктор: показва задачата и три числа за отговор. */
function createNumberChoiceMode(id, promptKey, renderProblem, speakProblem){
  return {
    id: id, showsPicture: false,
    supports(){ return true; },
    mount(root, host){
      const it = host.item, answer = mathAnswer(it);
      let mistakes = 0, done = false;

      root.appendChild(h("p", { class:"prompt" }, t(promptKey)));
      root.appendChild(h("div", { class:"math-stage" }, renderProblem(it)));

      const optsEl = h("div", { class:"options" });
      numberOptions(answer, 20).forEach(v => {
        const b = h("button", { class:"opt-letter", type:"button",
                                "aria-label": numberWord(v) }, String(v));
        b.addEventListener("click", () => {
          if(done) return;
          if(v === answer){
            done = true; b.classList.add("right"); Sfx.place();
            setTimeout(() => host.correct(mistakes), 420);
          } else { mistakes++; Sfx.wrong(); shakeEl(b); host.mistake(); }
        });
        optsEl.appendChild(b);
      });
      root.appendChild(optsEl);

      return {
        maxHints: 2,
        hint(step){
          if(step === 1){ speakProblem(it); return t("hintCountAgain"); }
          const right = Array.from(optsEl.children).find(b => b.textContent === String(answer));
          if(right) right.classList.add("right");
          Speech.speak(numberWord(answer));
          return t("hintHereIs");
        },
        destroy(){}
      };
    }
  };
}

const MODE_COUNT = createNumberChoiceMode("count", "promptCount",
  (it) => iconRow(it.icon, it.n),
  (it) => Speech.speak(t("promptCount")));

const MODE_ADD = createNumberChoiceMode("add", "promptAdd",
  (it) => h("div", { class:"sum-row" },
    iconRow(it.icon, it.a, "group"), h("span", { class:"sum-sign" }, "+"),
    iconRow(it.icon, it.b, "group"), h("span", { class:"sum-sign" }, "=" ),
    h("span", { class:"sum-q" }, "?")),
  (it) => Speech.speak(numberWord(it.a) + " " + t("plus") + " " + numberWord(it.b)));

const MODE_SUB = createNumberChoiceMode("sub", "promptSub",
  (it) => {
    const row = h("div", { class:"count-row" });
    for(let i = 0; i < it.a; i++)
      row.appendChild(h("span", { class:"count-item" + (i >= it.a - it.b ? " gone" : "") }, it.icon));
    return row;
  },
  (it) => Speech.speak(numberWord(it.a) + " " + t("minus") + " " + numberWord(it.b)));

const MODE_SEQUENCE = createNumberChoiceMode("sequence", "promptSequence",
  (it) => {
    const row = h("div", { class:"word-line" });
    it.seq.forEach((v, i) => row.appendChild(
      h("div", { class:"ch" + (i === it.gap ? " gap" : "") }, i === it.gap ? "?" : String(v))));
    return row;
  },
  (it) => Speech.speak(it.seq.filter((v,i) => i !== it.gap).map(numberWord).join(", ")));

/** „Къде са повече?“ — избира се групата, не число. */
const MODE_COMPARE = {
  id:"compare", showsPicture:false,
  supports(){ return true; },
  mount(root, host){
    const it = host.item, more = it.a > it.b ? "a" : "b";
    let mistakes = 0, done = false;

    root.appendChild(h("p", { class:"prompt" }, t("promptCompare")));
    const wrap = h("div", { class:"options compare" });
    [["a", it.a], ["b", it.b]].forEach(([key, n]) => {
      const b = h("button", { class:"compare-card", type:"button", "aria-label": numberWord(n) },
        iconRow(it.icon, n));
      b.addEventListener("click", () => {
        if(done) return;
        if(key === more){
          done = true; b.classList.add("right"); Sfx.place();
          setTimeout(() => host.correct(mistakes), 420);
        } else { mistakes++; Sfx.wrong(); shakeEl(b); host.mistake(); }
      });
      wrap.appendChild(b);
    });
    root.appendChild(wrap);

    return {
      maxHints: 2,
      hint(step){
        if(step === 1){ Speech.speak(t("promptCompare")); return t("hintCountAgain"); }
        const right = Array.from(wrap.children)[more === "a" ? 0 : 1];
        if(right) right.classList.add("right");
        return t("hintHereIs");
      },
      destroy(){}
    };
  }
};


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
    const letters = word.word.split("");
    let need = 0, mistakes = 0, running = true, raf = 0;

    /* ---- горна лента: картинка и местата за буквите ---- */
    const head = h("div", { class:"catch-head" });
    if(word.art || word.emoji) head.appendChild(renderArt(word, "catch-pic"));
    const slotsEl = h("div", { class:"catch-slots" });
    const slotEls = letters.map((ch, i) => {
      const el = h("span", { class:"catch-slot" + (i === 0 ? " next" : "") }, "");
      slotsEl.appendChild(el);
      return el;
    });
    head.appendChild(slotsEl);
    root.appendChild(head);

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

    const alphabet = L().alphabet;
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
      else ch = alphabet[Math.floor(Math.random() * alphabet.length)];
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
/* Всяко ниво има свой сезон. Само цветове и дребни детайли, но гората
   изглежда различна и детето усеща, че напредва някъде. */
const FOREST_THEMES = {
  day:    { sky1:"#CFE8FF", sky2:"#EAF6E9", h1:"#CDE8D2", h2:"#A9D9B5",
            gr:"#7FB069", grass:"#6BA057", t1:"#8FD3A5", t2:"#A6DDB6",
            trunk:"#8C6A4F", sun:"rgba(255,214,102,.85)", air:"🦋", stars:false },
  meadow: { sky1:"#DCF0FF", sky2:"#F6FCEA", h1:"#DCEFC0", h2:"#C2E39E",
            gr:"#8FC46A", grass:"#7AB157", t1:"#9FD98A", t2:"#B7E5A2",
            trunk:"#96724F", sun:"rgba(255,232,150,.9)", air:"🐝", stars:false },
  autumn: { sky1:"#FFE0BE", sky2:"#FFF4E4", h1:"#F0D3A8", h2:"#E4BF8E",
            gr:"#C98A4B", grass:"#B0763C", t1:"#E8A33D", t2:"#F2C14E",
            trunk:"#7A5230", sun:"rgba(255,178,80,.9)", air:"🍂", stars:false },
  night:  { sky1:"#2B2B57", sky2:"#4C4C7E", h1:"#3A3A68", h2:"#4A4A7C",
            gr:"#3F5C47", grass:"#345040", t1:"#3E6E52", t2:"#4C8062",
            trunk:"#4A3A2E", sun:"rgba(235,240,255,.92)", air:"✨", stars:true },
  dusk:   { sky1:"#FFBE9C", sky2:"#FFE4D6", h1:"#EFC0B4", h2:"#DBA79C",
            gr:"#8E6B5C", grass:"#7A5A4C", t1:"#9C5F58", t2:"#B87A6C",
            trunk:"#5A3A2E", sun:"rgba(255,132,80,.95)", air:"🦋", stars:false },
  winter: { sky1:"#CFE6F8", sky2:"#F4FBFF", h1:"#E6F2FB", h2:"#CFE3F1",
            gr:"#F0F7FC", grass:"#B7D6EC", t1:"#4E8A6A", t2:"#6BA585",
            trunk:"#6B5344", sun:"rgba(255,250,230,.9)", air:"❄️",
            stars:false, snow:true },
  blossom:{ sky1:"#BFE6F5", sky2:"#F0FBFF", h1:"#CDEBC8", h2:"#B4DFB0",
            gr:"#8CC98A", grass:"#6FB472", t1:"#F2A6C4", t2:"#FFC2D8",
            trunk:"#7A5642", sun:"rgba(255,246,200,.95)", air:"🌸", stars:false },
  beach:  { sky1:"#7FD4EC", sky2:"#D8F5FB", h1:"#F2E0B8", h2:"#E6CE9C",
            gr:"#F0DFB4", grass:"#D9C48E", t1:"#4FA36F", t2:"#6FBE88",
            trunk:"#9C7248", sun:"rgba(255,240,160,.95)", air:"🐚",
            stars:false, palm:true },
  cave:   { sky1:"#1E1A2E", sky2:"#3A3050", h1:"#2A2440", h2:"#37304F",
            gr:"#453A5C", grass:"#5A4A74", t1:"#4E4270", t2:"#5E5085",
            trunk:"#3A3152", sun:"rgba(180,220,255,.35)", air:"✨",
            stars:false, rock:true }
};

/* Всяко ниво е малка история: горски приятел има нужда от нещо и детето
   му го събира по пътя. Буквите висят наоколо като допълнение — носят
   бонус звезди, но портата се отваря от мисията. */
const FOREST_QUESTS = [
  { who:"🐿️", item:"🌰", nl:"eikels",     bg:"жълъди" },
  { who:"🐦", item:"🥚", nl:"eieren",     bg:"яйца" },
  { who:"🐝", item:"🌸", nl:"bloemen",    bg:"цветя" },
  { who:"🦔", item:"🍎", nl:"appels",     bg:"ябълки" },
  { who:"🐸", item:"💧", nl:"druppels",   bg:"капки" },
  { who:"🦋", item:"🍃", nl:"blaadjes",   bg:"листа" },
  { who:"🐰", item:"🥕", nl:"wortels",    bg:"моркови" },
  { who:"🐻", item:"🍯", nl:"honing",     bg:"мед" },
  { who:"🦊", item:"🫐", nl:"bessen",     bg:"боровинки" },
  { who:"🦉", item:"⭐", nl:"sterren",    bg:"звезди" },
  { who:"🦇", item:"🍄", nl:"paddenstoelen", bg:"гъби" },
  { who:"🐉", item:"💎", nl:"kristallen", bg:"кристали" },
  { who:"🐺", item:"🦴", nl:"botjes",     bg:"кокали" },
  { who:"🕷️", item:"🕸️", nl:"webben",     bg:"паяжини" },
  { who:"🐧", item:"🧊", nl:"ijsblokjes",  bg:"ледчета" },
  { who:"⛄", item:"❄️", nl:"sneeuwvlokken", bg:"снежинки" },
  { who:"🦌", item:"🎁", nl:"cadeaus",    bg:"подаръци" },
  { who:"🐢", item:"🍀", nl:"klavertjes", bg:"детелини" },
  { who:"🦜", item:"🥜", nl:"pinda's",    bg:"фъстъци" },
  { who:"🦫", item:"🪵", nl:"stokjes",    bg:"клечки" },
  { who:"🐨", item:"🌿", nl:"kruiden",    bg:"стръкчета" },
  { who:"🐼", item:"🎋", nl:"bamboe",     bg:"бамбук" },
  { who:"🐣", item:"🌾", nl:"korenaren",  bg:"класчета" },
  { who:"🦀", item:"🐚", nl:"schelpen",   bg:"мидички" },
  { who:"🐬", item:"🎈", nl:"ballonnen",  bg:"балони" },
  { who:"🦭", item:"🍦", nl:"ijsjes",     bg:"сладоледи" },
  { who:"🐭", item:"🧀", nl:"kaasjes",    bg:"парченца сирене" },
  { who:"🐛", item:"🍇", nl:"druiven",    bg:"гроздове" },
  { who:"🦄", item:"🌈", nl:"regenbogen", bg:"дъги" },
  { who:"🧚", item:"🔮", nl:"toverbollen", bg:"вълшебни кълба" }
];

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
/* Двайсет нива. Всяко носи свой приятел, свой сезон и малко повече от
   всичко — по-дълга дума, повече за събиране, по-бърз бяг, повече дупки. */
const FOREST_LEVELS = [
  // ЛИВАДА — първи стъпки, без дупки
  { id:1,  theme:"meadow", quest:0,  minLen:3, maxLen:3, maxDifficulty:1, wordsToPass:3, nuts:3,  pits:0.00, speed:0.85, modes:["forest"] },
  { id:2,  theme:"meadow", quest:1,  minLen:3, maxLen:4, maxDifficulty:1, wordsToPass:4, nuts:4,  pits:0.08, speed:0.90, modes:["forest"] },
  // ГОРА — влизат предизвикателствата
  { id:3,  theme:"day", quest:2,  minLen:4, maxLen:4, maxDifficulty:1, wordsToPass:4, nuts:5,  pits:0.12, speed:0.95, zones:0.6, zoneKinds:["count"], countMax:5, modes:["forest"] },
  { id:4,  theme:"day", quest:3,  minLen:4, maxLen:4, maxDifficulty:1, wordsToPass:4, nuts:5,  pits:0.14, speed:1.00, zones:0.7, zoneKinds:["count","color"], countMax:6, modes:["forest"] },
  { id:5,  theme:"day", quest:4,  minLen:4, maxLen:5, maxDifficulty:2, wordsToPass:5, nuts:6,  pits:0.16, speed:1.04, zones:0.7, zoneKinds:["color","first"], movers:0.25, modes:["forest"] },
  // ЕСЕН — появяват се сметки
  { id:6,  theme:"autumn", quest:5,  minLen:5, maxLen:5, maxDifficulty:2, wordsToPass:5, nuts:6,  pits:0.18, speed:1.08, zones:0.8, zoneKinds:["first","sum"], sumMax:5, movers:0.30, modes:["forest"] },
  { id:7,  theme:"autumn", quest:6,  minLen:5, maxLen:5, maxDifficulty:2, wordsToPass:5, nuts:7,  pits:0.19, speed:1.11, zones:0.8, zoneKinds:["sum","count"], sumMax:6, countMax:8, movers:0.35, modes:["forest"] },
  { id:8,  theme:"autumn", quest:7,  minLen:5, maxLen:6, maxDifficulty:3, wordsToPass:6, nuts:7,  pits:0.20, speed:1.14, zones:0.85, zoneKinds:["sum","color","first"], sumMax:7, movers:0.40, modes:["forest"] },
  // ЗАЛЕЗ
  { id:9,  theme:"dusk", quest:8,  minLen:5, maxLen:6, maxDifficulty:3, wordsToPass:6, nuts:8,  pits:0.21, speed:1.17, zones:0.85, zoneKinds:["sum","count"], sumMax:7, countMax:9, movers:0.40, modes:["forest"] },
  { id:10, theme:"dusk", quest:9,  minLen:6, maxLen:6, maxDifficulty:3, wordsToPass:6, nuts:9,  pits:0.22, speed:1.20, zones:0.9, zoneKinds:["sum","first","color"], sumMax:8, movers:0.45, modes:["forest"] },
  { id:11, theme:"dusk", quest:10, minLen:6, maxLen:6, maxDifficulty:3, wordsToPass:6, nuts:10, pits:0.23, speed:1.23, zones:0.9, zoneKinds:["sum","count"], sumMax:8, countMax:9, movers:0.45, modes:["forest"] },
  // НОЩ
  { id:12, theme:"night", quest:11, minLen:6, maxLen:6, maxDifficulty:3, wordsToPass:7, nuts:11, pits:0.24, speed:1.26, zones:0.95, zoneKinds:["sum","count","color","first"], sumMax:9, countMax:10, movers:0.50, modes:["forest"] },
  { id:13, theme:"night", quest:12, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:7, nuts:12, pits:0.25, speed:1.29, zones:0.95, zoneKinds:["sum","count"], sumMax:9, countMax:10, movers:0.50, modes:["forest"] },
  { id:14, theme:"night", quest:13, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:7, nuts:12, pits:0.26, speed:1.31, zones:1.0, zoneKinds:["sum","first"], sumMax:10, movers:0.55, modes:["forest"] },
  // ЗИМА
  { id:15, theme:"winter", quest:14, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:7, nuts:13, pits:0.26, speed:1.33, zones:1.0, zoneKinds:["count","color"], countMax:10, movers:0.55, modes:["forest"] },
  { id:16, theme:"winter", quest:15, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:8, nuts:14, pits:0.27, speed:1.35, zones:1.0, zoneKinds:["sum","count"], sumMax:10, countMax:10, movers:0.60, modes:["forest"] },
  { id:17, theme:"winter", quest:16, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:8, nuts:14, pits:0.28, speed:1.37, zones:1.0, zoneKinds:["sum","first","color"], sumMax:10, movers:0.60, modes:["forest"] },
  // ДЪЛБОКАТА НОЩ
  { id:18, theme:"night", quest:17, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:8, nuts:15, pits:0.28, speed:1.39, zones:1.0, zoneKinds:["sum","count","first"], sumMax:10, countMax:10, movers:0.65, modes:["forest"] },
  { id:19, theme:"night", quest:18, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:8, nuts:16, pits:0.29, speed:1.41, zones:1.0, zoneKinds:["sum","count","color","first"], sumMax:10, countMax:10, movers:0.70, modes:["forest"] },
  { id:20, theme:"night", quest:19, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:18, pits:0.30, speed:1.43, zones:1.0, zoneKinds:["sum","count","color","first"], sumMax:10, countMax:10, movers:0.75, modes:["forest"] },
  // ПРОЛЕТ — розови корони след дългата нощ
  { id:21, theme:"blossom", quest:20, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:16, pits:0.28, speed:1.30, zones:1.0, zoneKinds:["count","color"], countMax:10, movers:0.55, modes:["forest"] },
  { id:22, theme:"blossom", quest:21, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:17, pits:0.29, speed:1.33, zones:1.0, zoneKinds:["sum","first"], sumMax:10, movers:0.60, modes:["forest"] },
  { id:23, theme:"blossom", quest:22, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:17, pits:0.30, speed:1.36, zones:1.0, zoneKinds:["sum","count","color"], sumMax:10, countMax:10, movers:0.60, modes:["forest"] },
  // МОРЕ — пясък, палми и много вода
  { id:24, theme:"beach", quest:23, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:9, nuts:18, pits:0.31, speed:1.38, zones:1.0, zoneKinds:["count","first"], countMax:10, movers:0.62, modes:["forest"] },
  { id:25, theme:"beach", quest:24, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:19, pits:0.32, speed:1.40, zones:1.0, zoneKinds:["sum","color"], sumMax:10, movers:0.65, modes:["forest"] },
  { id:26, theme:"beach", quest:25, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:19, pits:0.33, speed:1.43, zones:1.0, zoneKinds:["sum","count","first"], sumMax:10, countMax:10, movers:0.68, modes:["forest"] },
  // ПЕЩЕРА — светещи кристали вместо дървета, най-трудното
  { id:27, theme:"cave", quest:26, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:20, pits:0.33, speed:1.45, zones:1.0, zoneKinds:["count","color"], countMax:10, movers:0.70, modes:["forest"] },
  { id:28, theme:"cave", quest:27, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:21, pits:0.34, speed:1.47, zones:1.0, zoneKinds:["sum","first"], sumMax:10, movers:0.72, modes:["forest"] },
  { id:29, theme:"cave", quest:28, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:21, pits:0.34, speed:1.49, zones:1.0, zoneKinds:["sum","count","color","first"], sumMax:10, countMax:10, movers:0.75, modes:["forest"] },
  { id:30, theme:"cave", quest:29, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:10, nuts:22, pits:0.35, speed:1.52, zones:1.0, zoneKinds:["sum","count","color","first"], sumMax:10, countMax:10, movers:0.80, modes:["forest"] }
];

const CATCH_LEVELS = [
  { id:1, minLen:3, maxLen:3, maxDifficulty:1, wordsToPass:4, modes:["catch"] },
  { id:2, minLen:4, maxLen:4, maxDifficulty:1, wordsToPass:5, modes:["catch"] },
  { id:3, minLen:4, maxLen:5, maxDifficulty:2, wordsToPass:5, modes:["catch"] },
  { id:4, minLen:5, maxLen:5, maxDifficulty:2, wordsToPass:6, modes:["catch"] },
  { id:5, minLen:5, maxLen:6, maxDifficulty:3, wordsToPass:6, modes:["catch"] },
  { id:6, minLen:6, maxLen:7, maxDifficulty:3, wordsToPass:7, modes:["catch"] }
];

const MATH_MODES = {};
[MODE_COUNT, MODE_ADD, MODE_SUB, MODE_SEQUENCE, MODE_COMPARE].forEach(m => { MATH_MODES[m.id] = m; });

/* =========================================================================
 * ПЪТИЩА — какво се учи. Всеки път има свои нива, задачи и мини-игри.
 * ========================================================================= */
const TRACKS = {
  words: {
    id:"words", icon:"📖",
    levels: () => LEVELS,
    pickItem: (level) => pickWord(level),
    pickMode: (level, item, force) => pickMode(level, item, force),
    itemKey: (item) => item.word,
    speak: (item) => item.display
  },
  forest: {
    id:"forest", icon:"🌲",
    levels: () => FOREST_LEVELS,
    pickItem: (level) => pickWord(level),
    pickMode: () => MODE_FOREST,
    itemKey: (item) => item.word,
    speak: (item) => item.display
  },
  catch: {
    id:"catch", icon:"🕹️",
    levels: () => CATCH_LEVELS,
    pickItem: (level) => pickWord(level),
    pickMode: () => MODE_CATCH,
    itemKey: (item) => item.word,
    speak: (item) => item.display
  },
  math: {
    id:"math", icon:"🔢",
    levels: () => MATH_LEVELS,
    pickItem: (level) => pickMathItem(level),
    pickMode: (level, item) => MATH_MODES[item.kind] || MODE_COUNT,
    itemKey: (item) => item.kind + ":" + JSON.stringify(item),
    speak: (item) => numberWord(mathAnswer(item))
  }
};
function currentTrack(){ return TRACKS[State.session.track] || TRACKS.words; }

const Play = {
  root:null, els:null, round:null,

  render(params){
    // Обучението е за пътя с думите — смятането се разбира от само себе си.
    const tutorial = State.session.track === "words" && !State.progress.tutorialCompleted;
    const screen = h("section", { class:"screen play" });

    /* --- топ лента --- */
    const starsVal = h("span", null, String(State.progress.totalStars));
    const starsChip = h("div", { class:"stars-chip", "aria-label":t("stars") }, "⭐", starsVal);
    const progFill = h("div", { class:"progress-fill" });
    const progress = h("div", {
      class:"progress", role:"progressbar", "aria-label":t("level"),
      "aria-valuemin":"0", "aria-valuemax":"100", "aria-valuenow":"0"
    }, progFill);
    const soundBtn = h("button", { class:"icon-btn", type:"button", "aria-label":t("sound") });
    soundBtn.textContent = State.progress.soundEnabled ? "🔊" : "🔇";
    soundBtn.addEventListener("click", () => {
      State.progress.soundEnabled = !State.progress.soundEnabled;
      soundBtn.textContent = State.progress.soundEnabled ? "🔊" : "🔇";
      if(!State.progress.soundEnabled) Speech.stop(); else Sfx.tap();
      Store.save();
    });

    const topbar = h("header", { class:"topbar" },
      backButton(() => Router.go("home")),
      starsChip, progress, soundBtn
    );

    /* --- сцена --- */
    const picHolder = h("div", { class:"stage-visual" });
    const playArea  = h("div", { class:"stage-play" });
    const stage = h("main", { class:"stage" }, picHolder, playArea);

    /* --- долна лента: помощ --- */
    const hintBtn = h("button", { class:"btn hint-btn", type:"button", "aria-label":t("hint") },
      h("span", { class:"em" }, "💡"), t("hint"));
    hintBtn.addEventListener("click", () => Play.useHint());
    const actionbar = h("footer", { class:"actionbar" }, hintBtn);

    /* --- маскот с балонче --- */
    const bubble = h("div", { class:"bubble" }, "");
    const mascot = h("div", { class:"mascot-talk", hidden:true, "aria-live":"polite" },
      h("div", { class:"m-svg", html: mascotSVG() }), bubble);

    /* --- overlay за успех --- */
    const confetti = h("canvas", { id:"confetti", hidden:true });
    const okWord   = h("div", { class:"big-word" }, "");
    const okPraise = h("div", { class:"praise" }, "");
    const okStars  = h("div", { class:"star-row", "aria-label":t("stars") });
    const okNext   = h("div", { class:"next-wrap" });
    const overlay  = h("div", { class:"overlay", hidden:true, role:"dialog", "aria-label":t("wellDone") },
      okPraise, okStars, okWord, okNext);

    screen.append(topbar, stage, actionbar, mascot, overlay, confetti);
    this.els = { screen, starsChip, starsVal, progFill, progress, picHolder, playArea,
                 hintBtn, mascot, bubble, overlay, okWord, okPraise, okStars, okNext, confetti, soundBtn };
    this.root = screen;
    this.updateTop();
    this.nextRound(tutorial);
    return screen;
  },

  updateTop(){
    const lp = LP();
    const lv = getLevel(lp.currentLevel);
    const pct = Math.min(100, Math.round(lp.levelProgress / lv.wordsToPass * 100));
    this.els.starsVal.textContent = String(State.progress.totalStars);
    this.els.progFill.style.width = pct + "%";
    this.els.progress.setAttribute("aria-valuenow", String(pct));
  },

  setBubble(text){
    if(!text){ this.els.mascot.hidden = true; return; }
    this.els.bubble.textContent = text;
    this.els.mascot.hidden = false;
  },

  nextRound(tutorial){
    const els = this.els;
    els.overlay.hidden = true;
    els.okNext.innerHTML = "";
    els.okStars.innerHTML = "";
    els.picHolder.innerHTML = "";
    els.playArea.innerHTML = "";
    els.playArea.style.removeProperty("--tile");
    this.setBubble(null);
    if(this.round && this.round.instance && this.round.instance.destroy) this.round.instance.destroy();

    const track = currentTrack();
    const lp = LP();
    const level = getLevel(lp.currentLevel);
    let item, mode;
    if(tutorial){
      // Котето има рисувана илюстрация и е кратка дума и на двата езика.
      item = WORDS.find(w => w.art === "cat") || wordPool(getLevel(1))[0] || WORDS[0];
      mode = MODES.build;
    } else {
      item = track.pickItem(level);
      mode = track.pickMode(level, item, lp.levelProgress === 0);
    }

    const key = track.itemKey(item);
    State.session.recent.push(key);
    if(State.session.recent.length > CONFIG.recentMemory) State.session.recent.shift();
    lp.attempts += 1;
    Store.save();

    const host = {
      item: item,
      word: item,                 // пътят с думите чете host.word
      tutorial: !!tutorial,
      mistake: () => Play.onMistake(),
      correct: (mistakes) => Play.onCorrect(mistakes),
      speakWord: () => Play.speakWord(),
      setBubble: (t2) => Play.setBubble(t2)
    };

    this.round = { item, word:item, mode, instance:null, mistakes:0, hintStep:0, tutorial:!!tutorial };

    els.playArea.classList.toggle("full", !!mode.fullArea);
    els.screen.classList.toggle("stage-full", !!mode.fullArea);
    if(mode.showsPicture) els.picHolder.appendChild(this.buildPicture(item));

    if(item.word){                // размер на плочките спрямо дължината на думата
      const count = mode.id === "syllables" ? item.syllables.length : item.word.length;
      els.playArea.style.setProperty("--tile", tileSizeFor(count, mode.id === "syllables"));
    }

    this.round.instance = mode.mount(els.playArea, host);
    els.hintBtn.hidden = false;

    this.makePromptSpeakable();
    if(tutorial){
      this.setBubble(t("mascotHello"));
      setTimeout(() => this.announceRound(true), 900);
    } else if(!mode.fullArea){
      // Въпросът се чете винаги: детето не може да го прочете само.
      // Думата се добавя само когато и без това щеше да се изговори —
      // при картинка тя вече казва коя е думата.
      const alsoWord = mode.showsPicture && (State.progress.autoSpeak || item.audioOnly);
      setTimeout(() => this.announceRound(alsoWord), 450);
    }
    if(DEBUG) Debug.update();
  },

  /* Въпросът се докосва, за да се чуе пак. Децата го искат по няколко пъти. */
  makePromptSpeakable(){
    const el = this.els && this.els.playArea.querySelector(".prompt");
    if(!el || el.dataset.speakable) return;
    el.dataset.speakable = "1";
    el.classList.add("say");
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", el.textContent.trim() + " — " + t("listenLabel"));
    const again = () => { Sfx.tap(); const q = this.questionText(); if(q) Speech.speak(q); };
    el.addEventListener("click", again);
    el.addEventListener("keydown", (e) => {
      if(e.key === " " || e.key === "Enter"){ e.preventDefault(); again(); }
    });
  },

  buildPicture(word){
    if(word.audioOnly){
      // Няма картинка — думата се чува. Бутонът е и подканата, и помощта.
      const b = h("button", { class:"big-listen", type:"button", "aria-label":t("listenLabel") }, "🔊");
      b.addEventListener("click", () => this.speakWord());
      this.picCard = null;
      return b;
    }
    const accent = CATEGORY_ACCENTS[word.category];
    const card = h("button", {
      class:"pic-card", type:"button",
      style:{ "--acc": accent || "var(--c-primary)" },
      "aria-label":t("picture")
    });
    card.appendChild(renderArt(word));
    card.appendChild(h("div", { class:"speaker" }, "🔊"));
    card.addEventListener("click", () => this.speakPicture());
    this.picCard = card;
    return card;
  },

  /* Текстът на въпроса, както детето го вижда на екрана. */
  questionText(){
    const p = this.els && this.els.playArea.querySelector(".prompt");
    return p ? p.textContent.replace(/\s+/g, " ").trim() : "";
  },

  /* Какво се чува освен въпроса: думата, а при смятане — самата сметка. */
  itemSpeech(){
    const r = this.round;
    if(!r) return "";
    if(State.session.track === "math"){
      const it = r.item;
      if(it.kind === "add") return numberWord(it.a) + " " + t("plus") + " " + numberWord(it.b);
      if(it.kind === "sub") return numberWord(it.a) + " " + t("minus") + " " + numberWord(it.b);
      return "";
    }
    return r.word.display || "";
  },

  /* Въпрос и задача в едно изречение. Един utterance, защото всяко ново
     повикване на Speech.speak() прекъсва предишното. */
  questionSpeech(withItem){
    const q = this.questionText();
    const item = withItem ? this.itemSpeech() : "";
    if(!q) return item;
    if(!item) return q;
    // "С коя буква започва КОТЕ?" вече съдържа думата — не я казваме два пъти.
    if(q.toUpperCase().indexOf(String(item).toUpperCase()) >= 0) return q;
    return q + " " + item;
  },

  /* Прочита въпроса на глас. Детето още не чете, затова това е
     единственият начин да разбере какво се иска от него. */
  announceRound(withItem){
    const text = this.questionSpeech(withItem);
    if(text) Speech.speak(text);
  },

  /* Докосване по картинката. При подреждане на цялата нарисувана дума
     картинката е самата дума, затова там казва нея, а не въпроса. */
  speakPicture(){
    const r = this.round;
    if(!r) return;
    if(r.mode && r.mode.wholeWord) return this.speakWord();
    const text = this.questionSpeech(true);
    if(!text) return this.speakWord();
    if(this.picCard){
      this.picCard.classList.remove("speaking");
      void this.picCard.offsetWidth;
      this.picCard.classList.add("speaking");
    }
    if(Speech.supported && Speech.hasVoice()) Speech.speak(text);
    else Sfx.star();
  },

  speakWord(){
    if(!this.round) return;
    if(State.session.track === "math"){
      const it = this.round.item;
      if(it.kind === "add")      Speech.speak(numberWord(it.a) + " " + t("plus") + " " + numberWord(it.b));
      else if(it.kind === "sub") Speech.speak(numberWord(it.a) + " " + t("minus") + " " + numberWord(it.b));
      else                       Sfx.star();
      return;
    }
    if(this.picCard){
      this.picCard.classList.remove("speaking");
      void this.picCard.offsetWidth;
      this.picCard.classList.add("speaking");
    }
    if(Speech.supported && Speech.hasVoice()){
      Speech.speak(this.round.word.display);
    } else {
      Sfx.star();   // няма български глас → поне звуков сигнал, играта продължава
    }
  },

  useHint(){
    if(!this.round || !this.round.instance) return;
    const inst = this.round.instance;
    this.round.hintStep = Math.min(this.round.hintStep + 1, inst.maxHints || 3);
    Sfx.tap();
    const msg = inst.hint(this.round.hintStep);
    if(msg) this.setBubble(msg);
    setTimeout(() => { if(this.els.bubble.textContent === msg) this.setBubble(null); }, 3200);
  },

  onMistake(){
    if(!this.round) return;
    this.round.mistakes++;
    if(this.round.mistakes === CONFIG.mistakesForHighlight){
      this.setBubble(t("tryAgain"));
      setTimeout(() => this.setBubble(null), 2600);
    }
  },

  onCorrect(modeMistakes){
    const r = this.round;
    if(!r) return;
    const mistakes = Math.max(r.mistakes, modeMistakes || 0);

    if(r.tutorial){
      State.progress.tutorialCompleted = true;
      Store.save();
      this.showSuccess(r.item, 3, false, true);
      return;
    }
    const res = recordResult(r.item, mistakes, r.hintStep);
    State.session.solvedInSession += 1;
    this.updateTop();
    this.els.starsChip.classList.remove("bump");
    void this.els.starsChip.offsetWidth;
    this.els.starsChip.classList.add("bump");
    this.showSuccess(r.item, res.stars, res.leveledUp, false);
  },

  showSuccess(word, stars, leveledUp, isTutorial){
    const els = this.els;
    els.hintBtn.hidden = true;
    this.setBubble(null);
    Sfx.success();

    els.okPraise.textContent = isTutorial ? t("greatJob") : rand(L().praise);
    els.okWord.textContent = word.word ? word.word : String(mathAnswer(word));
    els.okStars.innerHTML = "";
    for(let i = 0; i < 3; i++){
      els.okStars.appendChild(h("span", { class: i < stars ? "" : "dim" }, "⭐"));
    }
    els.okNext.innerHTML = "";
    els.overlay.hidden = false;
    runConfetti(els.confetti);
    setTimeout(() => Speech.speak(word.display || numberWord(mathAnswer(word))), 500);

    setTimeout(() => {
      const label = isTutorial ? t("letsPlay") : t("next");
      const btn = h("button", { class:"btn btn-primary btn-huge", type:"button" }, label, " →");
      btn.addEventListener("click", () => {
        Sfx.tap();
        if(leveledUp){ Play.showLevelUp(); return; }
        if(!isTutorial && State.session.solvedInSession > 0 &&
           State.session.solvedInSession % CONFIG.celebrateEvery === 0){
          Play.showCelebration();
          return;
        }
        Play.nextRound(false);
      });
      els.okNext.appendChild(btn);
      btn.focus();
    }, CONFIG.nextDelay);
  },

  /** Малък празник на всеки N думи. */
  showCelebration(){
    const els = this.els;
    els.okPraise.textContent = t("fantastic");
    els.okWord.textContent = State.session.solvedInSession + " " + t("solvedWords");
    els.okStars.innerHTML = "";
    els.okStars.appendChild(h("span", null, "🎉"));
    els.okNext.innerHTML = "";
    els.overlay.hidden = false;
    runConfetti(els.confetti);
    Sfx.levelUp();
    const btn = h("button", { class:"btn btn-success btn-huge", type:"button" }, t("carryOn") + " →");
    btn.addEventListener("click", () => { Sfx.tap(); Play.nextRound(false); });
    els.okNext.appendChild(btn);
    btn.focus();
  },

  showLevelUp(){
    const els = this.els;
    const lv = getLevel(LP().currentLevel);
    els.okPraise.textContent = t("newLevel");
    els.okWord.textContent = levelName(LP().currentLevel);
    els.okStars.innerHTML = "";
    els.okStars.appendChild(h("span", null, "🏆"));
    els.okNext.innerHTML = "";
    els.overlay.hidden = false;
    runConfetti(els.confetti);
    Sfx.levelUp();
    Speech.speak(t("newLevel"));
    const btn = h("button", { class:"btn btn-success btn-huge", type:"button" }, t("onward") + " →");
    btn.addEventListener("click", () => { Sfx.tap(); Play.nextRound(false); });
    els.okNext.appendChild(btn);
    btn.focus();
  },

  destroy(){
    if(this.round && this.round.instance && this.round.instance.destroy) this.round.instance.destroy();
    this.round = null; this.picCard = null;
    Speech.stop();
  }
};

/** По-дълга дума → по-малки плочки, за да няма скролиране. */
function tileSizeFor(count, wide){
  const n = wide ? count * 1.6 : count;
  if(n <= 4) return "clamp(56px, 15vmin, 88px)";
  if(n <= 6) return "clamp(48px, 12.5vmin, 76px)";
  if(n <= 8) return "clamp(42px, 10.5vmin, 64px)";
  return "clamp(36px, 9vmin, 56px)";
}

/* =========================================================================
 * 10. SCREENS
 * ========================================================================= */
const Screens = {

  /* ---------------------------------------------------------------- home */
  home(){
    const p = State.progress;
    const screen = h("section", { class:"screen home" });

    const mascot = h("div", { class:"home-mascot", html: mascotSVG() });
    const trackCard = (track, labelKey, icon, cls) => {
      const lvl = State.progress.byLang[State.progress.language][track].currentLevel;
      const b = h("button", { class:"track-card " + cls, type:"button" },
        h("span", { class:"track-icon" }, icon),
        h("span", { class:"track-name" }, t(labelKey)),
        h("span", { class:"track-level" }, t("level") + " " + lvl));
      b.addEventListener("click", () => {
        Sfx.tap();
        State.session.track = track;
        State.session.recent = [];
        Router.go("play");
      });
      return b;
    };
    const tracks = h("div", { class:"track-row" },
      trackCard("words", "trackWords", "📖", "t-words"),
      trackCard("math",  "trackMath",  "🔢", "t-math"),
      trackCard("catch", "trackCatch", "🕹️", "t-catch"),
      trackCard("forest", "trackForest", "🌲", "t-forest"));
    const playBtn = tracks.firstChild;

    const row = h("div", { class:"home-row" },
      navBtn("🔤", t("letters"), () => Router.go("letters")),
      navBtn("⭐", t("stars"), () => Router.go("stars")),
      navBtn("⚙️", t("settings"), () => Router.go("parents"))
    );

    screen.append(
      mascot,
      h("h1", { class:"logo" }, t("title")),
      h("p", { class:"tagline" }, t("tagline")),
      h("div", { class:"level-chip" }, "⭐ " + p.totalStars),
      tracks,
      row
    );
    screen.appendChild(langSwitcher());
    setTimeout(() => playBtn.focus(), 60);
    return screen;

    function langSwitcher(){
      const row = h("div", { class:"lang-row", role:"group", "aria-label":t("language") });
      Object.keys(LANGS).forEach(code => {
        const on = code === State.progress.language;
        const b = h("button", {
          class:"lang-btn" + (on ? " active" : ""), type:"button",
          "aria-pressed": String(on), "aria-label": LANGS[code].name
        }, h("span", { class:"flag" }, LANGS[code].flag), LANGS[code].name);
        b.addEventListener("click", () => { Sfx.tap(); setLanguage(code); });
        row.appendChild(b);
      });
      return row;
    }

    function navBtn(icon, label, fn){
      const b = h("button", { class:"btn btn-ghost", type:"button", "aria-label":label },
        h("span", { class:"em" }, icon), label);
      b.addEventListener("click", () => { Sfx.tap(); fn(); });
      return b;
    }
  },

  /* --------------------------------------------------------------- play */
  play(){ return Play.render(); },

  /* ------------------------------------------------------------ letters */
  letters(){
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("home")),
      h("h1", null, t("letters"))
    ));
    const grid = h("div", { class:"letter-grid" });
    L().alphabet.forEach(l => {
      const known = (LP("words").learnedLetters[l] || 0) >= 3;
      const cell = h("button", {
        class:"letter-cell" + (known ? " known" : ""),
        type:"button", "aria-label":t("letterLabel") + " " + l
      }, l);
      // Говорът се пуска в екрана на буквата — Router.go спира текущия изговор.
      cell.addEventListener("click", () => { Sfx.tap(); Router.go("letter", { letter:l }); });
      grid.appendChild(cell);
    });
    screen.appendChild(h("div", { class:"scroll-area" }, grid));
    return screen;
  },

  /* ------------------------------------------- letter detail (Научи буквата) */
  letter(params){
    const Lt = params.letter;
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("letters")),
      h("h1", null, t("learnLetter"))
    ));

    const body = h("div", { class:"scroll-area", style:{ textAlign:"center" } });

    const hero = h("button", { class:"letter-pair", type:"button", "aria-label":t("listen") + " " + Lt,
      style:{ margin:"0 auto", display:"flex", background:"none" } },
      h("span", { class:"letter-hero" }, Lt),
      h("span", { class:"small" }, Lt.toLowerCase())
    );
    hero.addEventListener("click", () => { Sfx.tap(); Speech.speak(L().letterSound[Lt] || Lt); });
    body.appendChild(hero);

    const listen = h("button", { class:"btn btn-warm", type:"button" }, "🔊 " + t("listen"));
    listen.addEventListener("click", () => { Sfx.tap(); Speech.speak(L().letterSound[Lt] || Lt); });
    const writeBtn = h("button", { class:"btn btn-primary", type:"button" }, "✏️ " + t("write"));
    writeBtn.addEventListener("click", () => { Sfx.tap(); Router.go("write", { letter:Lt }); });
    body.appendChild(h("div", { class:"write-actions" }, listen, writeBtn));

    /* Примери в две групи: думи, които ЗАПОЧВАТ с буквата, и думи, които я СЪДЪРЖАТ. */
    const starting = WORDS.filter(w => w.word[0] === Lt).slice(0, 6);
    const containing = WORDS.filter(w => w.word[0] !== Lt && w.word.indexOf(Lt) >= 0);

    if(starting.length){
      body.appendChild(h("h2", { class:"section-head" }, t("startsWith") + " " + Lt));
      body.appendChild(wordCards(starting));
    }
    if(containing.length && starting.length < 4){
      body.appendChild(h("h2", { class:"section-head" }, t("containsLetter") + " " + Lt));
      body.appendChild(wordCards(shuffle(containing).slice(0, 6)));
    }
    if(!starting.length && !containing.length){
      // Ь не започва дума и се среща рядко — обясняваме приятелски вместо празен екран.
      body.appendChild(h("p", { class:"prompt" },
        (Lt === "Ь" && t("softSign")) ? t("softSign") : t("letterLater")));
    }
    screen.appendChild(body);
    setTimeout(() => Speech.speak(L().letterSound[Lt] || Lt), 400);
    return screen;

    function wordCards(list){
      const cards = h("div", { class:"word-cards" });
      list.forEach(w => {
        const c = h("button", { class:"word-card", type:"button", "aria-label":w.display });
        c.appendChild(renderArt(w));
        c.appendChild(h("div", { class:"label" }, w.word));
        c.addEventListener("click", () => { Sfx.tap(); Speech.speak(w.display); });
        cards.appendChild(c);
      });
      return cards;
    }
  },

  /* ------------------------------------------- write (Напиши буквата) */
  write(params){
    const Lt = params.letter;
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("letter", { letter:Lt })),
      h("h1", null, t("writeTitle") + " " + Lt)
    ));

    const body = h("div", { class:"scroll-area", style:{ textAlign:"center" } });
    const wrap = h("div", { class:"write-wrap" });
    const guide = h("canvas");   // пунктирният шаблон
    const ink   = h("canvas");   // рисунката на детето
    wrap.append(guide, ink);
    body.appendChild(wrap);

    const msg = h("p", { class:"prompt", style:{ marginTop:"12px" } }, t("traceHint"));
    body.appendChild(msg);

    const tracer = createLetterTracer(wrap, guide, ink, Lt);

    const clearBtn = h("button", { class:"btn btn-ghost", type:"button" }, "🧽 " + t("clear"));
    clearBtn.addEventListener("click", () => { Sfx.tap(); tracer.clear(); msg.textContent = t("traceHint"); });
    const showBtn = h("button", { class:"btn btn-warm", type:"button" }, "👀 " + t("show"));
    showBtn.addEventListener("click", () => { Sfx.tap(); tracer.demo(); });
    const doneBtn = h("button", { class:"btn btn-success", type:"button" }, "✅ " + t("done"));
    doneBtn.addEventListener("click", () => {
      const r = tracer.evaluate();
      if(r.status === "empty"){
        msg.textContent = t("traceHint");
        Sfx.tap();
        return;
      }
      if(r.status !== "ok"){
        // Не е грешка, а „още веднъж“: буквата остава, за да се види къде
        // е излязла, и детето пробва пак веднага.
        Sfx.wrong();
        shakeEl(wrap);
        msg.textContent = r.status === "outside" ? t("traceOutside") : t("traceIncomplete");
        msg.classList.add("try-again");
        setTimeout(() => msg.classList.remove("try-again"), 1200);
        return;
      }
      let stars = 1;
      if(r.precision > 0.82 && r.coverage > 0.50) stars = 2;
      if(r.precision > 0.90 && r.coverage > 0.65) stars = 3;
      addStars(stars);
      LP("words").learnedLetters[Lt] = (LP("words").learnedLetters[Lt] || 0) + 1;
      Store.save();
      Sfx.success();
      msg.textContent = t("wellDone") + " " + "⭐".repeat(stars);
      Speech.speak(t("wellDone"));
    });
    body.appendChild(h("div", { class:"write-actions" }, clearBtn, showBtn, doneBtn));

    screen.appendChild(body);
    screen._onMounted = () => tracer.layout();
    screen._cleanup = () => tracer.destroy();
    return screen;
  },

  /* -------------------------------------------------------------- stars */
  stars(){
    const p = State.progress;
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("home")),
      h("h1", null, t("myStars"))
    ));
    const body = h("div", { class:"scroll-area", style:{ textAlign:"center" } });
    body.appendChild(h("div", { style:{ fontSize:"clamp(56px,14vmin,110px)" } }, "⭐"));
    body.appendChild(h("div", { style:{ fontSize:"clamp(30px,6vmin,52px)", fontWeight:"800", color:"var(--c-primary-dark)" } },
      String(p.totalStars)));

    const learned = WORDS.filter(w => LP("words").words[w.word]);
    body.appendChild(h("h2", { class:"section-head" },
      learned.length ? t("learnedWords") + " (" + learned.length + ")" : t("noWordsYet")));
    const cards = h("div", { class:"word-cards" });
    learned.forEach(w => {
      const c = h("button", { class:"word-card", type:"button", "aria-label":w.display });
      c.appendChild(renderArt(w));
      c.appendChild(h("div", { class:"label" }, w.word));
      c.addEventListener("click", () => { Sfx.tap(); Speech.speak(w.display); });
      cards.appendChild(c);
    });
    if(!learned.length){
      cards.appendChild(h("p", { class:"prompt" }, t("playToCollect")));
    }
    body.appendChild(cards);
    screen.appendChild(body);
    return screen;
  },

  /* ------------------------------------------------- parents / settings */
  parents(){
    const p = State.progress;
    const screen = h("section", { class:"screen" });
    screen.appendChild(h("div", { class:"page-title" },
      backButton(() => Router.go("home")),
      h("h1", null, t("forParents"))
    ));
    const body = h("div", { class:"scroll-area" });

    /* статистика */
    const wp = LP("words"), mp = LP("math");
    const learned = Object.keys(wp.words).length;
    const stats = h("div", { class:"stat-grid" },
      stat(wp.completedWords, t("statPlayed")),
      stat(learned, t("statLearned")),
      stat(wp.firstTryCorrect, t("statFirstTry")),
      stat(t("trackWords") + " " + wp.currentLevel, t("statLevel")),
      stat(mp.completedWords, t("statSums")),
      stat(t("trackMath") + " " + mp.currentLevel, t("statMathLevel")),
      stat(p.totalStars, t("statStars")),
      stat(Object.keys(wp.learnedLetters).length, t("statLetters"))
    );
    body.appendChild(h("div", { class:"card" }, stats));

    /* настройки */
    body.appendChild(h("h2", { class:"section-head" }, t("settingsHead")));
    const soundToggle = h("button", {
      class:"toggle", type:"button", role:"switch",
      "aria-checked": String(p.soundEnabled), "aria-label":t("sound")
    });
    soundToggle.addEventListener("click", () => {
      p.soundEnabled = !p.soundEnabled;
      soundToggle.setAttribute("aria-checked", String(p.soundEnabled));
      if(!p.soundEnabled) Speech.stop(); else Sfx.tap();
      Store.save();
    });
    const settings = h("div", { class:"card" },
      h("div", { class:"setting-row" }, h("span", { class:"lbl" }, t("soundSpeech")), soundToggle),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("voiceLabel")),
        (() => {
          // Различните причини за мълчание искат различни действия от родителя.
          let text, warn = true;
          const v = Speech.voices[State.progress.language];
          if(!Speech.supported)      text = t("voiceNo");
          else if(Speech.blocked)    text = t("voiceBlocked");
          else if(!v)                text = t("voiceNone");
          else if(inForeignFrame())  text = v.name + " · " + t("voiceFramed");
          else { text = t("voiceOk") + " ✓ · " + v.name; warn = false; }
          return h("span", {
            style:{ color: warn ? "#B7791F" : "var(--c-ink-soft)", fontWeight:"700",
                    textAlign:"right", maxWidth:"60%" }
          }, text);
        })()
      ),
      Store.available ? null : h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("noSaveLabel")),
        h("span", { style:{ color:"#B7791F", fontWeight:"700", textAlign:"right", maxWidth:"62%" } },
          t("noSaveText"))
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("autoSpeak")),
        (() => {
          const tg = h("button", { class:"toggle", type:"button", role:"switch",
                                   "aria-checked": String(p.autoSpeak), "aria-label": t("autoSpeak") });
          tg.addEventListener("click", () => {
            p.autoSpeak = !p.autoSpeak;
            tg.setAttribute("aria-checked", String(p.autoSpeak));
            Sfx.tap();
            Store.save();
          });
          return tg;
        })()
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("restartTrack")),
        (() => {
          // Връща само нивата на този път — звездите и научените думи остават.
          const row = h("div", { class:"lang-row compact" });
          [["words","trackWords","📖"],["math","trackMath","🔢"],["catch","trackCatch","🕹️"],["forest","trackForest","🌲"]].forEach(([tr, label, icon]) => {
            const b = h("button", { class:"lang-btn", type:"button" },
              h("span", { class:"flag" }, icon), t(label));
            b.addEventListener("click", () => {
              Sfx.tap();
              confirmAction(t("restartTitle"), t("restartText"), () => {
                const lp = State.progress.byLang[State.progress.language][tr];
                lp.currentLevel = 1;
                lp.levelProgress = 0;
                if(tr === "words") State.progress.tutorialCompleted = false;
                Store.save();
                State.session.recent = [];
                Router.go("parents");
              });
            });
            row.appendChild(b);
          });
          return row;
        })()
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("speechSpeed")),
        (() => {
          // При избор веднага се чува пример, за да се настрои на ухо.
          const row = h("div", { class:"lang-row compact" });
          const opts = [["slow","speedSlow"],["normal","speedNormal"],["fast","speedFast"]];
          const sample = () => {
            const w = WORDS.find(x => x.art === "cat") || WORDS[0];
            return w ? w.display : null;
          };
          opts.forEach(([key, label]) => {
            const b = h("button", {
              class:"lang-btn" + (State.progress.speechSpeed === key ? " active" : ""),
              type:"button", "aria-pressed": String(State.progress.speechSpeed === key)
            }, t(label));
            b.addEventListener("click", () => {
              State.progress.speechSpeed = key;
              Store.save();
              Array.from(row.children).forEach((el, i) => {
                const on = opts[i][0] === key;
                el.classList.toggle("active", on);
                el.setAttribute("aria-pressed", String(on));
              });
              Sfx.tap();
              Speech.speak(sample());
            });
            row.appendChild(b);
          });
          return row;
        })()
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("language")),
        (() => {
          const row = h("div", { class:"lang-row compact" });
          Object.keys(LANGS).forEach(code => {
            const on = code === State.progress.language;
            const b = h("button", { class:"lang-btn" + (on ? " active" : ""), type:"button",
                                    "aria-pressed":String(on) },
              h("span", { class:"flag" }, LANGS[code].flag), LANGS[code].name);
            b.addEventListener("click", () => { Sfx.tap(); setLanguage(code); });
            row.appendChild(b);
          });
          return row;
        })()
      ),
      h("div", { class:"setting-row" },
        h("span", { class:"lbl" }, t("tutorialAgain")),
        (() => {
          const b = h("button", { class:"btn btn-ghost", type:"button" }, t("start"));
          b.addEventListener("click", () => {
            p.tutorialCompleted = false; Store.save();
            Sfx.tap(); Router.go("play");
          });
          return b;
        })()
      )
    );
    body.appendChild(settings);

    /* поверителност */
    body.appendChild(h("h2", { class:"section-head" }, t("privacyHead")));
    body.appendChild(h("div", { class:"card" },
      h("p", { style:{ color:"var(--c-ink-soft)", fontWeight:"700", lineHeight:"1.55" } },
        t("privacyText"))
    ));

    /* изтриване */
    body.appendChild(h("h2", { class:"section-head" }, t("progressHead")));
    const resetBtn = h("button", { class:"btn btn-danger", type:"button" }, "🗑 " + t("deleteProgress"));
    resetBtn.addEventListener("click", () => confirmAction(t("confirmTitle"), t("confirmText"), () => {
      Store.reset();
      State.session = { recent:[], solvedInSession:0, round:null, track:"words" };
      Router.go("parents");
    }));
    body.appendChild(h("div", { class:"card" }, resetBtn));

    screen.appendChild(body);
    return screen;

    function stat(num, lbl){
      return h("div", { class:"stat" }, h("div", { class:"num" }, String(num)), h("div", { class:"lbl" }, lbl));
    }
    /** Питаме, преди да върнем нещо назад. */
    function confirmAction(title, text, onYes){
      const ov = h("div", { class:"overlay", role:"dialog", "aria-modal":"true", "aria-label":title });
      const no = h("button", { class:"btn btn-ghost", type:"button" }, t("cancel"));
      const yes = h("button", { class:"btn btn-danger", type:"button" }, t("confirmYes"));
      no.addEventListener("click", () => ov.remove());
      yes.addEventListener("click", () => { onYes(); ov.remove(); });
      ov.appendChild(h("div", { class:"modal-card" },
        h("h2", null, title), h("p", null, text),
        h("div", { class:"modal-actions" }, no, yes)));
      screen.appendChild(ov);
      yes.focus();
    }
  }
};

/* ----------------------------------------------------------------------
 * Прототип „Напиши буквата“ — Canvas проследяване
 * Архитектурата вече поддържа оценка: evaluate() сравнява рисунката с
 * маска на буквата и връща 0..1 (по-късно може да стане по-прецизна).
 * -------------------------------------------------------------------- */
function createLetterTracer(wrap, guideCanvas, inkCanvas, letter){
  const gctx = guideCanvas.getContext("2d");
  const ictx = inkCanvas.getContext("2d");
  let size = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let mask = null;                       // щедра лента: къде е позволено да се рисува
  let core = null, corePixels = 0;       // самата буква: колко от нея е минато
  let drawing = false, pid = null, last = null;
  let inside = 0, outside = 0;           // точки в буквата и извън нея

  function fontFor(px){ return "800 " + px + "px " + getComputedStyle(document.body).fontFamily; }

  let lastSize = 0;
  function layout(){
    const w = wrap.clientWidth;
    if(!w || w === lastSize) return;      // още няма размер, или не се е променил
    lastSize = w;
    size = w;
    [guideCanvas, inkCanvas].forEach(c => {
      c.width = size * dpr; c.height = size * dpr;
      const cx = c.getContext("2d");
      cx.setTransform(1,0,0,1,0,0);
      cx.scale(dpr, dpr);
    });
    drawGuide();
    buildMask();
    reset();
  }

  function drawGuide(){
    gctx.clearRect(0, 0, size, size);
    const px = size * 0.68;
    gctx.textAlign = "center";
    gctx.textBaseline = "middle";
    gctx.font = fontFor(px);
    gctx.fillStyle = "rgba(108,92,231,.10)";
    gctx.fillText(letter, size/2, size/2);
    gctx.save();
    gctx.setLineDash([10, 12]);
    gctx.lineWidth = 4;
    gctx.strokeStyle = "rgba(108,92,231,.55)";
    gctx.strokeText(letter, size/2, size/2);
    gctx.restore();
  }

  /** Маска: удебелена буква — площта, в която е редно да се рисува. */
  function buildMask(){
    const m = document.createElement("canvas");
    m.width = size; m.height = size;
    const mc = m.getContext("2d");
    mc.textAlign = "center"; mc.textBaseline = "middle";
    mc.font = fontFor(size * 0.68);
    mc.lineWidth = size * 0.13;         // щедра лента — детските ръце треперят
    mc.lineJoin = "round";
    mc.strokeStyle = "#000"; mc.fillStyle = "#000";
    mc.strokeText(letter, size/2, size/2);
    mc.fillText(letter, size/2, size/2);
    mask = mc.getImageData(0, 0, size, size).data;

    // Втора маска — самата буква без удебеляване. Спрямо нея мерим
    // колко от буквата детето наистина е минало.
    const c2 = document.createElement("canvas");
    c2.width = size; c2.height = size;
    const cc = c2.getContext("2d");
    cc.textAlign = "center"; cc.textBaseline = "middle";
    cc.font = fontFor(size * 0.68);
    cc.fillStyle = "#000";
    cc.fillText(letter, size/2, size/2);
    core = cc.getImageData(0, 0, size, size).data;
    corePixels = 0;
    for(let y = 0; y < size; y += 4)
      for(let x = 0; x < size; x += 4)
        if(core[(y * size + x) * 4 + 3] > 60) corePixels++;
  }

  function isInside(x, y){
    if(!mask) return true;
    const ix = Math.round(x), iy = Math.round(y);
    if(ix < 0 || iy < 0 || ix >= size || iy >= size) return false;
    return mask[(iy * size + ix) * 4 + 3] > 40;
  }

  function reset(){ inside = 0; outside = 0; }

  function pos(ev){
    const r = inkCanvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * (size / r.width),
             y: (ev.clientY - r.top)  * (size / r.height) };
  }

  /* Рисуваме отсечка по отсечка и оцветяваме според това дали сме в буквата.
     Детето вижда веднага, че е излязло — не чак накрая. */
  function segment(from, to){
    const ok = isInside(to.x, to.y);
    ictx.strokeStyle = ok ? "#6C5CE7" : "#E9A0A8";
    ictx.lineWidth = Math.max(16, size * 0.075);
    ictx.lineCap = "round"; ictx.lineJoin = "round";
    ictx.beginPath();
    ictx.moveTo(from.x, from.y);
    ictx.lineTo(to.x, to.y);
    ictx.stroke();
    if(ok) inside++; else outside++;
  }

  function start(ev){
    pid = ev.pointerId; drawing = true;
    last = pos(ev);
    segment(last, { x: last.x + 0.01, y: last.y });
    try{ inkCanvas.setPointerCapture(pid); }catch(e){}
  }
  function move(ev){
    if(!drawing || ev.pointerId !== pid) return;
    const p = pos(ev);
    segment(last, p);
    last = p;
  }
  function end(ev){
    if(ev.pointerId !== pid) return;
    drawing = false;
    try{ inkCanvas.releasePointerCapture(pid); }catch(e){}
    pid = null; last = null;
  }

  inkCanvas.addEventListener("pointerdown", start);
  inkCanvas.addEventListener("pointermove", move);
  inkCanvas.addEventListener("pointerup", end);
  inkCanvas.addEventListener("pointercancel", end);
  /* Кутията още няма размер в първия кадър, а платното по подразбиране е
     300x150. Ако се откажем след един опит, оценката мери в грешен мащаб.
     Затова опитваме кадър след кадър, докато размерът се получи. */
  // Резервно: ако сигналът закъснее, опитваме и с таймер (той работи и
  // когато кадрите са задушени).
  let tries = 0;
  const settle = () => { layout(); if(!size && tries++ < 40) setTimeout(settle, 50); };
  setTimeout(settle, 0);

  // След това следим за промени (завъртане на таблет, смяна на прозорец).
  let ro = null;
  if(typeof ResizeObserver !== "undefined"){
    ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
  }
  const onResize = () => layout();
  window.addEventListener("resize", onResize);

  return {
    layout: layout,
    clear(){
      ictx.clearRect(0, 0, size, size);
      reset();
    },
    /** Кратка демонстрация: контурът светва по-плътно. */
    demo(){
      const px = size * 0.68;
      let t = 0;
      const step = () => {
        gctx.clearRect(0, 0, size, size);
        drawGuide();
        gctx.save();
        gctx.textAlign = "center"; gctx.textBaseline = "middle";
        gctx.font = fontFor(px);
        gctx.globalAlpha = 0.35 + 0.35 * Math.sin(t / 5);
        gctx.fillStyle = "#6C5CE7";
        gctx.fillText(letter, size/2, size/2);
        gctx.restore();
        t++;
        if(t < 60 && !REDUCED_MOTION) requestAnimationFrame(step);
        else drawGuide();
      };
      step();
    },
    /** Оценка: колко точно (в буквата ли е) и колко пълно (цялата буква ли). */
    evaluate(){
      const total = inside + outside;
      if(total < 12 || !core) return { status:"empty", precision:0, coverage:0 };
      const precision = inside / total;

      // Покритие: колко от пикселите на буквата са застъпени с мастило.
      const ink = ictx.getImageData(0, 0, size * dpr, size * dpr).data;
      const w = Math.floor(size * dpr);
      let hit = 0;
      for(let y = 0; y < size; y += 4){
        for(let x = 0; x < size; x += 4){
          if(core[(y * size + x) * 4 + 3] <= 60) continue;
          const ix = Math.floor(x * dpr), iy = Math.floor(y * dpr);
          if(ink[(iy * w + ix) * 4 + 3] > 40) hit++;
        }
      }
      const coverage = corePixels ? hit / corePixels : 0;

      let status = "ok";
      if(precision < 0.70)       status = "outside";      // рисува встрани
      else if(coverage < 0.35)   status = "incomplete";   // не е минал цялата
      return { status, precision, coverage };
    },
    destroy(){ window.removeEventListener("resize", onResize); if(ro) ro.disconnect(); }
  };
}

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
    const screen = Screens[name] ? Screens[name](params || {}) : Screens.home();
    this.current = screen;
    app.appendChild(screen);
    // Чак сега елементите имат размер. Екрани с платно се нуждаят от това —
    // rAF и ResizeObserver не са надеждни, когато прозорецът не е на фокус.
    if(screen._onMounted) screen._onMounted();
    if(DEBUG) Debug.update();
  }
};

/* =========================================================================
 * DEBUG (скрит при DEBUG = false)
 * ========================================================================= */
const Debug = {
  el:null,
  mount(){
    if(!DEBUG) return;
    this.el = h("div", { class:"debug-panel" });
    document.body.appendChild(this.el);
    this.update();
  },
  update(){
    if(!DEBUG || !this.el) return;
    const p = State.progress;
    const r = Play.round;
    this.el.innerHTML = "";
    this.el.appendChild(h("div", null,
      "screen: " + State.ui.screen +
      " | " + p.language + " lvl " + LP().currentLevel + " (" + LP().levelProgress + "/" + getLevel(LP().currentLevel).wordsToPass + ")"));
    this.el.appendChild(h("div", null,
      "word: " + (r ? r.word.word + " [" + r.mode.id + "] err:" + r.mistakes + " hint:" + r.hintStep : "—")));
    this.el.appendChild(h("div", null, "stars: " + p.totalStars + " | words: " + WORDS.length + " | voice: " + (Speech.hasVoice() ? "yes" : "no")));
    const row = h("div");
    row.appendChild(btn("lvl −", () => { LP().currentLevel = Math.max(1, LP().currentLevel-1); LP().levelProgress = 0; Store.save(); Router.go("play"); }));
    row.appendChild(btn("lvl +", () => { LP().currentLevel = Math.min(LEVELS.length, LP().currentLevel+1); LP().levelProgress = 0; Store.save(); Router.go("play"); }));
    row.appendChild(btn("skip", () => Play.nextRound(false)));
    row.appendChild(btn("reset", () => { Store.reset(); Router.go("home"); }));
    this.el.appendChild(row);
    function btn(label, fn){
      const b = h("button", { type:"button" }, label);
      b.addEventListener("click", fn);
      return b;
    }
  }
};

/* =========================================================================
 * 11. APP INIT
 * ========================================================================= */
/* Пресглобява речника за активния език според това какво устройството показва. */
let canShowImage = () => true;
function rebuildWords(){
  WORDS = buildWords(State.progress.language, w => w.art ? !!ART[w.art] : canShowImage(w.emoji));
  if(DEBUG) console.log("[" + State.progress.language + "] думи:", WORDS.length);
}

/* Иконата за началния екран на телефона се рисува в момента и се закача
   като apple-touch-icon. Така файлът си остава един, без външни картинки. */
function installAppIcon(){
  try{
    // Маскотът, нарисуван в PNG — iOS иска PNG за иконата на началния екран.
    const svg = mascotSVG().replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    const img = new Image();
    img.onload = () => {
      try{
        const c = document.createElement("canvas");
        c.width = c.height = 180;
        const x = c.getContext("2d");
        x.fillStyle = "#EDEAFF"; x.fillRect(0, 0, 180, 180);
        x.drawImage(img, 12, 12, 156, 156);
        const url = c.toDataURL("image/png");

        ["apple-touch-icon", "icon"].forEach(rel => {
          const link = document.createElement("link");
          link.rel = rel; link.href = url;
          document.head.appendChild(link);
        });

        const manifest = {
          name: "Letterbeer", short_name: "Letterbeer",
          display: "standalone", orientation: "any",
          background_color: "#F3F5FD", theme_color: "#F3F5FD",
          start_url: location.href.split("#")[0],
          icons: [{ src: url, sizes: "180x180", type: "image/png", purpose: "any" }]
        };
        const m = document.createElement("link");
        m.rel = "manifest";
        m.href = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type:"application/manifest+json" }));
        document.head.appendChild(m);
      }catch(e){}
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }catch(e){}
}

function init(){
  State.progress = Store.load();
  installAppIcon();
  canShowImage = createEmojiProbe();
  rebuildWords();
  Speech.init();

  document.documentElement.lang = State.progress.language;

  // Отключване на аудиото при първото докосване (изискване на браузърите).
  // Опитваме отключване при всеки жест, докато контекстът тръгне — първият
  // жест невинаги стига (мобилни браузъри, iframe с ограничения).
  const unlock = () => {
    Sfx.unlock();
    const settled = Sfx.blocked || (Sfx.ctx && Sfx.ctx.state === "running");
    if(settled) document.removeEventListener("pointerdown", unlock);
  };
  document.addEventListener("pointerdown", unlock);

  // Без zoom при двойно докосване и без "дърпане" на страницата.
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("touchmove", (e) => {
    if(e.touches.length > 1) e.preventDefault();
  }, { passive:false });

  Router.go("home");
  Debug.mount();

  /* Офлайн работа — има смисъл само при хостинг по HTTPS. При отваряне
     на файла директно или по http:// браузърът не позволява service
     worker и регистрацията тихо се проваля, без да пречи на играта. */
  if("serviceWorker" in navigator && location.protocol === "https:"){
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

})();
