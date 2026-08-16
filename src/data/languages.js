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
      skillsHead:"Wat oefent je kind", skillsGoing:"Gaat goed", skillsPractising:"Nog oefenen",
      skillsSounds:"Beginklanken", skillsWriting:"Schrijven", skillsNone:"Nog te weinig gespeeld om iets te zeggen.",
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
      trackPhonics:"KLANKEN", trackStories:"VERHALEN",
      writeFree:"Zelf", writeGuided:"Stap voor stap",
      guideHint:"Begin bij het bolletje met het cijfer.",
      guideNext:"Goed! Nu de volgende.",
      storyListenAll:"Voorlezen", storyQuestions:"Vragen",
      hintStoryListen:"Luister nog eens naar het verhaal.",
      hintStoryReRead:"Lees de vraag nog eens.",
      promptSoundFirst:"Welk woord begint met deze klank?",
      promptSoundLast:"Welk woord eindigt met deze klank?",
      promptSoundSame:"Welk woord begint net zo?",
      promptSoundOdd:"Welke hoort er niet bij?",
      promptBlend:"Welk woord hoor je?",
      promptSyllableHear:"Welk woord is dit?",
      hintListenAgain:"Luister nog eens, rustig.",
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
      skillsHead:"Какво упражнява детето", skillsGoing:"Върви добре", skillsPractising:"Още се упражнява",
      skillsSounds:"Първи звукове", skillsWriting:"Писане", skillsNone:"Още е играло малко, за да се каже нещо.",
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
      trackPhonics:"ЗВУКОВЕ", trackStories:"РАЗКАЗЧЕТА",
      writeFree:"Сам", writeGuided:"Стъпка по стъпка",
      guideHint:"Започни от кръгчето с числото.",
      guideNext:"Браво! Сега следващата.",
      storyListenAll:"Чуй всичко", storyQuestions:"Въпроси",
      hintStoryListen:"Чуй разказчето пак.",
      hintStoryReRead:"Прочети въпроса пак.",
      promptSoundFirst:"Коя дума започва с този звук?",
      promptSoundLast:"Коя дума завършва с този звук?",
      promptSoundSame:"Коя дума започва по същия начин?",
      promptSoundOdd:"Коя не е на място?",
      promptBlend:"Коя дума чуваш?",
      promptSyllableHear:"Коя е тази дума?",
      hintListenAgain:"Чуй пак, бавно.",
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
