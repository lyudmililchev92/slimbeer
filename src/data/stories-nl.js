/* =========================================================================
 * VERHAALTJES — NEDERLANDS
 * -------------------------------------------------------------------------
 * Същите герои и същата подредба като в българските разказчета, но текстът
 * е писан на нидерландски, а не преведен дума по дума. Дължината на
 * изреченията и трудността на думите се различават между двата езика.
 *
 * Форматът е обяснен в stories-bg.js.
 * ========================================================================= */

STORIES.nl = [
  {
    id: "buki-bal", level: 1, title: "Boekie en de bal", scene: "⚽",
    sentences: [
      "Boekie heeft een bal.",
      "De bal is blauw.",
      "Boekie speelt met Beer."
    ],
    questions: [
      { text: "Welke kleur heeft de bal?", answers: ["rood", "blauw", "groen"], correct: 1 },
      { text: "Met wie speelt Boekie?", answers: ["met Beer", "met Vos", "alleen"], correct: 0 }
    ]
  },
  {
    id: "eekhoorn-eikel", level: 1, title: "De eekhoorn zoekt", scene: "🐿️",
    sentences: [
      "De eekhoorn zoekt eikels.",
      "Zij vindt er drie.",
      "De eekhoorn is heel blij."
    ],
    questions: [
      { text: "Hoeveel eikels vindt zij?", answers: ["twee", "drie", "vijf"], correct: 1 },
      { type: "finish", text: "De eekhoorn zoekt ___.", answers: ["eikels", "paddenstoelen", "bloemen"], correct: 0 }
    ]
  },
  {
    id: "beer-honing", level: 2, title: "Beer en de honing", scene: "🍯",
    sentences: [
      "Beer heeft honger.",
      "Hij zoekt honing in het bos.",
      "De bij geeft hem een beetje honing.",
      "Beer zegt dank je wel."
    ],
    questions: [
      { text: "Wat zoekt Beer?", answers: ["honing", "vis", "appels"], correct: 0 },
      { text: "Wie geeft hem honing?", answers: ["Boekie", "de bij", "de vos"], correct: 1 },
      { type: "order", text: "Wat gebeurt eerst?", answers: ["Beer zegt dank je wel", "Beer heeft honger", "De bij geeft honing"], correct: 1 }
    ]
  },
  {
    id: "vos-regen", level: 2, title: "De vos en de regen", scene: "🌧️",
    sentences: [
      "Het regent hard.",
      "De vos heeft geen paraplu.",
      "Hij schuilt onder de grote boom.",
      "Straks schijnt de zon weer."
    ],
    questions: [
      { text: "Waar schuilt de vos?", answers: ["in huis", "onder de boom", "in de rivier"], correct: 1 },
      { type: "finish", text: "De vos heeft geen ___.", answers: ["paraplu", "muts", "bal"], correct: 0 }
    ]
  },
  {
    id: "uil-nacht", level: 3, title: "De uil slaapt niet", scene: "🦉",
    sentences: [
      "De nacht is stil en donker.",
      "Alle dieren slapen.",
      "Alleen de uil is wakker.",
      "Hij telt de sterren aan de hemel.",
      "Een, twee, drie… en hij valt in slaap."
    ],
    questions: [
      { text: "Wie is wakker in de nacht?", answers: ["Beer", "de uil", "het konijn"], correct: 1 },
      { text: "Wat telt de uil?", answers: ["de sterren", "de eikels", "de bomen"], correct: 0 },
      { type: "order", text: "Wat gebeurt op het laatst?", answers: ["De uil valt in slaap", "De dieren slapen", "De uil telt"], correct: 0 }
    ]
  },
  {
    id: "konijn-wortel", level: 3, title: "De wortel van het konijn", scene: "🥕",
    sentences: [
      "Het konijn plant een wortel in de tuin.",
      "Elke dag geeft het water.",
      "De wortel groeit langzaam.",
      "Op het laatst wordt hij groot en oranje.",
      "Het konijn geeft hem aan zijn vrienden."
    ],
    questions: [
      { text: "Wat plant het konijn?", answers: ["een bloem", "een wortel", "een boom"], correct: 1 },
      { text: "Hoe wordt de wortel?", answers: ["klein en groen", "groot en oranje", "rond en rood"], correct: 1 },
      { type: "finish", text: "Het konijn geeft de wortel ___.", answers: ["water", "honing", "melk"], correct: 0 }
    ]
  },
  {
    id: "pinguin-ijs", level: 4, title: "De pinguïn en het ijs", scene: "🐧",
    sentences: [
      "De pinguïn woont waar het koud is.",
      "Hij glijdt de hele dag over het ijs.",
      "Op een dag smelt het ijs een beetje.",
      "De pinguïn schrikt en roept om hulp.",
      "Boekie komt snel en geeft hem een hand.",
      "Samen lachen ze en worden vrienden."
    ],
    questions: [
      { text: "Waar woont de pinguïn?", answers: ["in het bos", "waar het koud is", "in de zee"], correct: 1 },
      { text: "Wie helpt hem?", answers: ["Boekie", "Beer", "de vos"], correct: 0 },
      { type: "order", text: "Wat gebeurt eerst?", answers: ["Boekie helpt", "Het ijs smelt", "De pinguïn glijdt"], correct: 2 }
    ]
  },
  {
    id: "fee-kristal", level: 4, title: "De fee en het kristal", scene: "🔮",
    sentences: [
      "Diep in de grot schijnt een blauw kristal.",
      "De fee wil het aan iedereen laten zien.",
      "Maar de grot is donker en eng.",
      "Boekie pakt een lamp en gaat mee.",
      "Samen vinden ze het kristal.",
      "Het schijnt als een kleine ster."
    ],
    questions: [
      { text: "Wat schijnt in de grot?", answers: ["een kristal", "een vuur", "de maan"], correct: 0 },
      { text: "Wat pakt Boekie?", answers: ["een paraplu", "een lamp", "een touw"], correct: 1 },
      { type: "finish", text: "De grot is donker en ___.", answers: ["eng", "warm", "vrolijk"], correct: 0 }
    ]
  },
  {
    id: "bever-brug", level: 5, title: "De bever bouwt een brug", scene: "🦫",
    sentences: [
      "De rivier is breed en snel.",
      "De dieren kunnen niet naar de andere kant.",
      "De bever verzamelt de hele ochtend stokjes.",
      "Hij legt ze op elkaar.",
      "Langzaam komt er een kleine brug.",
      "Nu gaat iedereen erover zonder nat te worden.",
      "De bever lacht en gaat rusten."
    ],
    questions: [
      { text: "Wat bouwt de bever?", answers: ["een huis", "een brug", "een boot"], correct: 1 },
      { text: "Waarvan bouwt hij het?", answers: ["van stenen", "van stokjes", "van ijs"], correct: 1 },
      { type: "order", text: "Wat gebeurt op het laatst?", answers: ["De bever rust", "De rivier is breed", "De bever verzamelt stokjes"], correct: 0 }
    ]
  },
  {
    id: "muis-kaas", level: 5, title: "De muis en de kaas", scene: "🧀",
    sentences: [
      "De muis vindt een groot stuk kaas.",
      "Het is zo groot dat de muis het niet kan dragen.",
      "De muis denkt lang na.",
      "Daarna roept hij zijn vrienden om hulp.",
      "Samen dragen ze de kaas naar huis.",
      "s Avonds eten ze allemaal samen.",
      "De kaas is genoeg voor iedereen."
    ],
    questions: [
      { text: "Waarom draagt de muis de kaas niet?", answers: ["hij is te zwaar", "hij lust hem niet", "hij is kwijt"], correct: 0 },
      { text: "Wie helpt hem?", answers: ["niemand", "zijn vrienden", "de kat"], correct: 1 },
      { type: "finish", text: "De kaas is genoeg voor ___.", answers: ["iedereen", "een muis", "morgen"], correct: 0 }
    ]
  },
  {
    id: "buki-leert", level: 6, title: "Boekie leert lezen", scene: "📖",
    sentences: [
      "Boekie wil lezen zoals de groten.",
      "Eerst lijken de letters op tekeningen.",
      "Hij probeert het steeds weer, maar het lukt niet.",
      "Beer zegt dat hij rustig aan moet doen.",
      "Elke dag leert Boekie een letter.",
      "Daarna worden twee letters een lettergreep.",
      "En lettergrepen worden een woord.",
      "Op een dag leest Boekie een hele zin alleen."
    ],
    questions: [
      { text: "Wat wil Boekie?", answers: ["lezen", "slapen", "vliegen"], correct: 0 },
      { text: "Wat zegt Beer?", answers: ["stop maar", "rustig aan", "vraag iemand anders"], correct: 1 },
      { type: "order", text: "Wat gebeurt eerst?", answers: ["Boekie leest een zin", "Boekie leert een letter", "Lettergrepen worden een woord"], correct: 1 }
    ]
  },
  {
    id: "bos-nacht", level: 6, title: "De nacht in het bos", scene: "🌙",
    sentences: [
      "De zon zakt langzaam achter de bomen.",
      "De hemel wordt roze en daarna donkerblauw.",
      "De glimwormen gaan een voor een aan.",
      "De vleermuis gaat paddenstoelen zoeken.",
      "De uil bewaakt het bos van boven.",
      "Alle andere dieren gaan naar huis.",
      "Het bos valt stil in slaap.",
      "Morgen is er een nieuwe dag met nieuwe avonturen."
    ],
    questions: [
      { text: "Wat doen de glimwormen?", answers: ["slapen", "aangaan", "zingen"], correct: 1 },
      { text: "Wie bewaakt het bos?", answers: ["de uil", "de vleermuis", "Beer"], correct: 0 },
      { type: "finish", text: "Morgen is er een nieuwe ___.", answers: ["dag", "regen", "sneeuw"], correct: 0 }
    ]
  }
];
