/* =========================================================================
 * РЕЧНИКЪТ НА ИГРАТА
 * -------------------------------------------------------------------------
 * Този файл е нарочно отделен от играта, за да се добавят думи лесно,
 * без да се пипа кодът.
 *
 * Един ред е една дума и изглежда така:
 *
 *     БЪЛ-ГАР-СКИ/NE-DER-LANDS 🖼
 *
 *   • Тирето дели сричките. Думата се сглобява от тях, тоест думата и
 *     сричките ѝ не могат да се разминат — те са един и същ надпис.
 *   • Всяка сричка трябва да има поне една гласна.
 *   • Пиши с ГЛАВНИ букви и само с букви от азбуката на езика.
 *   • Липсва ли думата на единия език, сложи там тире:  КРУ-ША/- 🍐
 *
 * Картинката накрая е едно от трите:
 *
 *     🍎     емоджи — рисува го шрифтът на устройството
 *     @cat   ръчно рисувана илюстрация от ART в game.js
 *     ~      няма картинка: детето чува думата вместо да я вижда
 *            (така стават възможни глаголи и прилагателни)
 *
 * Едно емоджи стига само за една дума. Повтори ли се, режимът
 * "чуй и избери картинката" става двусмислен.
 *
 * Думите се разделят с | или с нов ред — както е по-четимо.
 * ========================================================================= */

window.WORD_SOURCE = {
  animals: `
    КОН/PAARD 🐴 | КО-ТЕ/POES @cat | КУ-ЧЕ/HOND 🐶 | РИ-БА/VIS @fish
    ЖА-БА/KIK-KER 🐸 | МЕ-ЧЕ/BEER 🐻 | ПИ-ЛЕ/KUI-KEN 🐤 | КО-ЗА/GEIT 🐐
    ОВ-ЦА/SCHAAP 🐑 | ЗА-ЕК/KO-NIJN 🐰 | СЛОН/O-LI-FANT 🐘 | ЛЪВ/LEEUW 🦁
    РАК/KRAB 🦀 | МИШ-КА/MUIS 🐭 | ПТИ-ЦА/VO-GEL 🐦 | ТИ-ГЪР/TIJ-GER 🐯
    ПА-ТИ-ЦА/EEND 🦆 | КО-КОШ-КА/KIP 🐔 | ПЕ-ПЕ-РУ-ДА/VLIN-DER 🦋 | ДЕЛ-ФИН/DOL-FIJN 🐬
    Е-ЛЕН/HERT 🦌 | ПА-ЯК/SPIN 🕷️ | ЖИ-РАФ/GI-RAF 🦒 | ЩУ-РЕЦ/SPRINK-HAAN 🦗
    МАЙ-МУ-НА/AAP 🐒 | ЗЕБ-РА/ZE-BRA 🦓 | КРА-ВА/KOE 🐄 | ПРА-СЕ/VAR-KEN 🐷
    ПЕ-ТЕЛ/HAAN 🐓 | ПУ-ЯК/KAL-KOEN 🦃 | ПА-УН/PAUW 🦚 | ПА-ПА-ГАЛ/PA-PE-GAAI 🦜
    О-РЕЛ/A-REND 🦅 | СО-ВА/UIL 🦉 | ГЪ-ЛЪБ/DUIF 🕊️ | ЛЕ-БЕД/ZWAAN 🦢
    ФЛА-МИН-ГО/FLA-MIN-GO 🦩 | ПИН-ГВИН/- 🐧 | ТЮ-ЛЕН/ZEE-HOND 🦭 | КИТ/WAL-VIS 🐳
    А-КУ-ЛА/HAAI 🦈 | ОК-ТО-ПОД/OC-TO-PUS 🐙 | ОХ-ЛЮВ/SLAK 🐌 | МРАВ-КА/MIER 🐜
    ПЧЕ-ЛА/BIJ 🐝 | БУ-БО-ЛЕЧ-КА/- 🐞 | МУ-ХА/VLIEG 🪰 | КО-МАР/MUG 🦟
    СКОР-ПИ-ОН/SCHOR-PI-OEN 🦂 | ЗМИ-Я/SLANG 🐍 | ГУ-ЩЕР/HA-GE-DIS 🦎 | КРО-КО-ДИЛ/KRO-KO-DIL 🐊
    КОС-ТЕ-НУР-КА/SCHILD-PAD 🐢 | ДИ-НО-ЗА-ВЪР/DI-NO-SAU-RUS 🦕 | ВЪЛК/WOLF 🐺 | ЛИ-СИ-ЦА/VOS 🦊
    Е-НОТ/WAS-BEER 🦝 | ПАН-ДА/PAN-DA 🐼 | КО-А-ЛА/KO-A-LA 🐨 | ЛЕ-НИ-ВЕЦ/LUI-AARD 🦥
    ВИД-РА/O-TER 🦦 | ТА-РА-ЛЕЖ/E-GEL 🦔 | ПРИ-ЛЕП/VLEER-MUIS 🦇 | КЕН-ГУ-РУ/KAN-GOE-ROE 🦘
    БОР-СУК/DAS 🦡 | ЛА-МА/LA-MA 🦙 | КА-МИ-ЛА/KA-MEEL 🐫 | НО-СО-РОГ/NEUS-HOORN 🦏
    ХИ-ПО-ПО-ТАМ/NIJL-PAARD 🦛 | БИ-ВОЛ/BUF-FEL 🐃 | БИК/STIER 🐂 | МА-ГА-РЕ/E-ZEL 🫏
    О-ВЕН/RAM 🐏 | О-МАР/KREEFT 🦞 | СКА-РИ-ДА/GAR-NAAL 🦐 | КАЛ-МАР/INKT-VIS 🦑
    МИ-ДА/OES-TER 🦪 | ГЪ-СЕ-НИ-ЦА/RUPS 🐛 | ГО-РИ-ЛА/GO-RIL-LA 🦍 | О-РАН-ГУ-ТАН/O-RANG-OE-TAN 🦧
    БО-БЪР/BE-VER 🦫 | ПЛЪХ/RAT 🐀 | ХАМ-СТЕР/HAM-STER 🐹 | ПУ-ДЕЛ/POE-DEL 🐩
    ЛЕ-О-ПАРД/LUI-PAARD 🐆 | ГЪС-КА/GANS 🪿 | ЧЕР-ВЕЙ/WORM 🪱 | ХЛЕ-БАР-КА/KA-KER-LAK 🪳
    ПА-Я-ЖИ-НА/SPIN-NEN-WEB 🕸️ | ПЕ-РО/VEER 🪶 | ЯЙ-ЦЕ/EI 🥚 | МА-МУТ/MAM-MOET 🦣
    КА-ТЕ-РИ-ЦА/EEK-HOORN 🐿️ | ТИ-РА-НО-ЗА-ВЪР/- 🦖 | РА-КО-ВИ-НА/SCHELP 🐚 | КО-РАЛ/KO-RAAL 🪸
    БРЪМ-БАР/KE-VER 🪲 | МИК-РОБ/MI-CRO-BE 🦠 | ПИ-ЛЕН-ЦЕ/- 🐥
  `,
  food: `
    СОК/SAP 🧃 | МЕД/HO-NING 🍯 | ЛУК/UI 🧅 | ХЛЯБ/BROOD 🍞
    ГЪ-БА/PAD-DEN-STOEL 🍄 | ПИ-ЦА/PIZ-ZA 🍕 | БА-НАН/BA-NAAN 🍌 | ДО-МАТ/TO-MAAT 🍅
    ТОР-ТА/TAART 🎂 | КРУ-ША/PEER 🍐 | МОР-КОВ/WOR-TEL 🥕 | ГРОЗ-ДЕ/DRUIF 🍇
    Я-БЪЛ-КА/AP-PEL @apple | СЛА-ДО-ЛЕД/IJS 🍦 | Я-ГО-ДА/AARD-BEI 🍓 | А-НА-НАС/A-NA-NAS 🍍
    ЧЕ-РЕ-ША/KERS 🍒 | ЛИ-МОН/CI-TROEN 🍋 | ПОР-ТО-КАЛ/SI-NAAS-AP-PEL 🍊 | ДИ-НЯ/WA-TER-ME-LOEN 🍉
    ПЪ-ПЕШ/ME-LOEN 🍈 | ПРАС-КО-ВА/PER-ZIK 🍑 | МАН-ГО/MAN-GO 🥭 | КО-КОС/KO-KOS 🥥
    КИ-ВИ/KI-WI 🥝 | БО-РО-ВИН-КА/BOS-BES 🫐 | МАС-ЛИ-НА/O-LIJF 🫒 | А-ВО-КА-ДО/A-VO-CA-DO 🥑
    КРАС-ТА-ВИ-ЦА/KOM-KOM-MER 🥒 | ЧУШ-КА/PA-PRI-KA 🫑 | ЦА-РЕ-ВИ-ЦА/- 🌽 | КАР-ТОФ/AARD-AP-PEL 🥔
    БА-ТАТ/- 🍠 | ГРАХ/ERWT 🫛 | БРО-КО-ЛИ/BROC-CO-LI 🥦 | МА-РУ-ЛЯ/SLA 🥬
    ЧЕ-СЪН/KNOF-LOOK 🧄 | ДЖИН-ДЖИ-ФИЛ/GEM-BER 🫚 | ПИ-ПЕР/PE-PER 🌶️ | ФЪС-ТЪК/PIN-DA 🥜
    КЕС-ТЕН/KAS-TAN-JE 🌰 | БОБ/BOON 🫘 | КРО-А-САН/CROIS-SANT 🥐 | ФРАН-ЗЕ-ЛА/STOK-BROOD 🥖
    ГЕВ-РЕК/KRA-KE-LING 🥨 | ПА-ЛА-ЧИН-КА/PAN-NEN-KOEK 🥞 | ВАФ-ЛА/WA-FEL 🧇 | СИ-РЕ-НЕ/KAAS 🧀
    МЕ-СО/VLEES 🍖 | ПЪР-ЖО-ЛА/BIEF-STUK 🥩 | БЕ-КОН/SPEK 🥓 | ХАМ-БУР-ГЕР/HAM-BUR-GER 🍔
    КАР-ТОФ-КИ/FRIET 🍟 | ХОТ-ДОГ/HOT-DOG 🌭 | СЕН-ДВИЧ/BO-TER-HAM 🥪 | ТА-КО/TA-CO 🌮
    БУ-РИ-ТО/WRAP 🌯 | ФА-ЛА-ФЕЛ/FA-LA-FEL 🧆 | О-МЛЕТ/OM-E-LET 🍳 | ЯХ-НИ-Я/STOOF-POT 🥘
    СУ-ПА/SOEP 🍲 | КЪ-РИ/CUR-RY 🍛 | РА-МЕН/NOE-DELS 🍜 | СПА-ГЕ-ТИ/SPA-GHET-TI 🍝
    СУ-ШИ/SU-SHI 🍣 | КНЕ-ДЛА/DUM-PLING 🥟 | О-РИЗ/RIJST 🍚 | СОЛ/ZOUT 🧂
    МАС-ЛО/BO-TER 🧈 | КОН-СЕР-ВА/BLIK 🥫 | ПОП-КОРН/POP-CORN 🍿 | ШО-КО-ЛАД/CHO-CO-LA 🍫
    БОН-БОН/SNOEP-JE 🍬 | БИС-КВИ-ТА/KOEK-JE 🍪 | КЕКС/CUP-CAKE 🧁 | ПУ-ДИНГ/PUD-DING 🍮
    БЛИ-ЗАЛ-КА/LOL-LY 🍭 | ПАЙ/- 🥧 | ДО-НЪТ/DO-NUT 🍩 | ЧАЙ/THEE 🍵
    КА-ФЕ/KOF-FIE ☕ | МЛЯ-КО/MELK 🥛 | ЛИ-МО-НА-ДА/LI-MO-NA-DE 🥤 | СА-ЛА-ТА/SA-LA-DE 🥗
    БУР-КАН/POT 🫙 | БЕЙ-ГЪЛ/BA-GEL 🥯 | БИ-БЕ-РОН/ZUIG-FLES 🍼
  `,
  nature: `
    ЛУ-НА/MAAN @moon | СНЯГ/SNEEUW ❄️ | ДЪЖД/RE-GEN 🌧️ | ГО-РА/BOS 🌳
    МО-РЕ/ZEE 🌊 | О-ГЪН/VUUR 🔥 | ЛИСТ/BLAD 🍃 | ОБ-ЛАК/WOLK @cloud
    ЗВЕЗ-ДА/STER ⭐ | ПЛА-НИ-НА/BERG ⛰️ | ДЪ-ГА/RE-GEN-BOOG 🌈 | МЪЛ-НИ-Я/BLIK-SEM ⚡
    ТОР-НА-ДО/TOR-NA-DO 🌪️ | МЪГ-ЛА/MIST 🌫️ | ВУЛ-КАН/VUL-KAAN 🌋 | ПУС-ТИ-НЯ/WOES-TIJN 🏜️
    ПЛАЖ/STRAND 🏖️ | ОСТ-РОВ/EI-LAND 🏝️ | РО-ЗА/ROOS 🌹 | ЛА-ЛЕ/TULP 🌷
    СЛЪН-ЧО-ГЛЕД/ZON-NE-BLOEM 🌻 | МАР-ГА-РИТ-КА/MA-DE-LIEF-JE 🌼 | ЗЮМ-БЮЛ/HY-A-CINT 🪻 | КАК-ТУС/CAC-TUS 🌵
    ПАЛ-МА/PALM 🌴 | БОР/DEN 🌲 | ДЪР-ВО/BOOM @tree | ЦВЕ-ТЕ/BLOEM @flower
    САК-СИ-Я/PLANT 🪴 | ТРЕ-ВА/GRAS 🌱 | ЖИ-ТО/TAR-WE 🌾 | ДЕ-ТЕ-ЛИ-НА/KLA-VER ☘️
    ЛЕД/IJS-BLOK-JE 🧊 | ВЯ-ТЪР/WIND 🌬️ | ЗЕ-МЯ/AAR-DE 🌍 | КО-МЕ-ТА/KO-MEET ☄️
    ПЛА-НЕ-ТА/PLA-NEET 🪐 | ЗА-ЛЕЗ/- 🌅 | Е-ЗЕ-РО/MEER 🏞️ | ВО-ДА/WA-TER 💧
    БУ-КЕТ/BOE-KET 💐 | БИЛ-КА/KRUID 🌿 | КЛЕН/ES-DOORN 🍁 | ПЪН/BOOM-STAM 🪵
    ВИ-ХЪР/WER-VEL-WIND 🌀 | СЛЪН-ЦЕ/ZON @sun
    БУ-РЯ/ON-WEER ⛈️
  `,
  home: `
    КЪ-ЩА/HUIS 🏡 | ДОМ/THUIS @house | ВРА-ТА/DEUR 🚪 | ПРО-ЗО-РЕЦ/RAAM 🪟
    ЛЕГ-ЛО/BED 🛏️ | ДИ-ВАН/SO-FA 🛋️ | СТОЛ/STOEL 🪑 | ДУШ/DOU-CHE 🚿
    ВА-НА/BAD 🛁 | ТО-А-ЛЕТ-НА/TOI-LET 🚽 | ХАР-ТИ-Я/TOI-LET-PA-PIER 🧻 | СА-ПУН/ZEEP 🧼
    КО-ФА/EM-MER 🪣 | МЕТ-ЛА/BE-ZEM 🧹 | КОШ/MAND 🧺 | КЛЮЧ/SLEU-TEL 🔑
    СВЕЩ/KAARS 🕯️ | ЛАМ-ПА/LAMP 💡 | ФЕ-НЕР/ZAK-LAMP 🔦 | КАР-ТИ-НА/SCHIL-DE-RIJ 🖼️
    О-ГЛЕ-ДА-ЛО/SPIE-GEL 🪞 | КУ-ТИ-Я/DOOS 📦 | НОЖ/MES 🔪 | ВИ-ЛИ-ЦА/VORK 🍴
    ЛЪ-ЖИ-ЦА/LE-PEL 🥄 | ЧИ-НИ-Я/BORD 🍽️ | ЧАЙ-НИК/THEE-POT 🫖 | КОШ-ЧЕ/PRUL-LEN-BAK 🗑️
    ПО-ЩА/BRIE-VEN-BUS 📫 | СТЪЛ-БА/LAD-DER 🪜 | КА-ТИ-НАР/SLOT 🔒 | ЧА-СОВ-НИК/WEK-KER ⏰
    СВЕ-ТИЛ-НИК/O-LIE-LAMP 🪔 | ОГ-НЕ-ГА-СИ-ТЕЛ/BRAND-BLUS-SER 🧯 | КЛЮЧ-АЛ-КА/SLEU-TEL-GAT 🗝️
  `,
  objects: `
    ТОП-КА/BAL @ball | КНИ-ГА/BOEK 📖 | ЧА-ДЪР/PA-RA-PLU ☂️ | БА-ЛОН/BAL-LON 🎈
    МО-ЛИВ/POT-LOOD ✏️ | ЧУК/HA-MER 🔨 | ТРИ-ОН/ZAAG 🪚 | ВИНТ/SCHROEF 🔩
    МАГ-НИТ/MAG-NEET 🧲 | КО-НЕЦ/DRAAD 🧵 | ПРЕЖ-ДА/WOL 🧶 | О-ЧИ-ЛА/BRIL 👓
    ПРЪС-ТЕН/RING 💍 | КО-РО-НА/KROON 👑 | РА-НИ-ЦА/RUG-ZAK 🎒 | ЧАН-ТА/TAS 👜
    КУ-ФАР/KOF-FER 🧳 | ЧЕТ-КА/BOR-STEL 🪥 | БРЪС-НАЧ/SCHEER-MES 🪒 | ТЕ-ЛЕ-ФОН/TE-LE-FOON 📱
    КОМ-ПЮ-ТЪР/LAP-TOP 💻 | ТЕ-ЛЕ-ВИ-ЗОР/TE-LE-VI-SIE 📺 | РА-ДИ-О/RA-DI-O 📻 | МИК-РО-ФОН/MI-CRO-FOON 🎙️
    ПРИН-ТЕР/PRIN-TER 🖨️ | КЛА-ВИ-А-ТУ-РА/TOET-SEN-BORD ⌨️ | ФО-ТО-А-ПА-РАТ/FO-TO-TOE-STEL 📷 | КА-МЕ-РА/CA-ME-RA 📹
    ЩЕП-СЕЛ/STEK-KER 🔌 | БА-ТЕ-РИ-Я/BAT-TE-RIJ 🔋 | ХА-ПЧЕ/PIL 💊 | ЛЕЙ-КО-ПЛАСТ/PLEIS-TER 🩹
    ТЕР-МО-МЕ-ТЪР/THER-MO-ME-TER 🌡️ | СПРИН-ЦОВ-КА/SPUIT 💉 | МИК-РО-СКОП/MI-CROS-COOP 🔬 | ТЕ-ЛЕ-СКОП/TE-LES-COOP 🔭
    ВЕ-ЗНА/WEEG-SCHAAL ⚖️ | ЛУ-ПА/LOEP 🔍 | КОМ-ПАС/KOM-PAS 🧭 | КАР-ТА/KAART 🗺️
    ГЛО-БУС/GLO-BE 🌐 | ПИС-МО/BRIEF ✉️ | МО-НЕ-ТА/MUNT 🪙 | ПО-ДА-РЪК/CA-DEAU 🎁
    ЗВЪ-НЕЦ/BEL 🔔 | БА-РА-БАН/TROM 🥁 | ВЪ-ЗЕЛ/KNOOP 🪢 | ЛО-ПА-ТА/SCHEP 🪏
    МЕН-ГЕ-МЕ/KLEM 🗜️ | СЕ-КИ-РА/BIJL 🪓 | ОТ-ВЕР-ТКА/- 🪛 | КУ-КА/HAAK 🪝
    ИГ-ЛА/NAALD 🪡 | ХУ-ДОЖ-НИК/VERF 🎨 | НО-ЖИ-ЦА/SCHAAR ✂️ | МЕ-ТЪР/LI-NI-AAL 📏
    ТРИ-Ъ-ГЪЛ-НИК/DRIE-HOEK 🔺 | БЛОК-НОТ/SCHRIFT 📓 | ТЕТ-РАД-КА/DAG-BOEK 📔 | ВЕСТ-НИК/KRANT 📰
    БИ-ЛЕТ/TIC-KET 🎫 | Е-ТИ-КЕТ/LA-BEL 🏷️ | МО-НИ-ТОР/SCHERM 🖥️ | ДИСК/- 💿
    ЛЕН-ТА/FILM 🎞️ | СВИ-ТЪК/ROL 📜 | СМЕТ-КА/BON 🧾 | СМЕ-ТА-ЛО/TEL-RAAM 🧮
    ПА-РИ/GELD 💰 | БАНК-НО-ТА/BIL-JET 💵 | СЕН-ДЪК/GE-REED-SCHAP 🧰 | ГА-ЕЧ-НИК/MOER-SLEU-TEL 🔧
    КИР-КА/PIK-HOU-WEEL ⛏️ | ЗЪБ-ЧАТ-КА/TAND-WIEL ⚙️ | КА-ПАН/VAL 🪤 | ЧЕШ-МА/KRAAN 🚰
    ДИ-НА-МИТ/DY-NA-MIET 🧨 | ПЯ-СЪЧ-НИК/ZAND-LO-PER ⌛ | ТОЧ-КА/PUNT 📍
  `,
  vehicles: `
    ВЛАК/TREIN 🚂 | КО-ЛА/AU-TO @car | ЛОД-КА/BOOT @boat | КО-РАБ/SCHIP 🚢
    РА-КЕ-ТА/RA-KET 🚀 | АВ-ТО-БУС/BUS 🚌 | СА-МО-ЛЕТ/VLIEG-TUIG ✈️ | ТРАК-ТОР/TRAC-TOR 🚜
    ВЕ-ЛО-СИ-ПЕД/FIETS 🚲 | МО-ТОР/MO-TOR 🏍️ | СКУ-ТЕР/SCOO-TER 🛵 | ТРАМ-ВАЙ/TRAM 🚊
    МЕТ-РО/ME-TRO 🚇 | ТАК-СИ/TA-XI 🚕 | ЛИ-НЕЙ-КА/AM-BU-LAN-CE 🚑 | ПО-ЖАР-НА/BRAND-WEER 🚒
    КА-МИ-ОН/VRACHT-WA-GEN 🚚 | МИ-НИ-БУС/BUS-JE 🚐 | ХЕ-ЛИ-КОП-ТЕР/HE-LI-KOP-TER 🚁 | ЯХ-ТА/JACHT 🛥️
    КА-НУ/KA-NO 🛶 | ВЕТ-РО-ХОД/ZEIL-BOOT ⛵ | ПА-РА-ХОД/CRUI-SE-SCHIP 🛳️ | ТРО-ЛЕЙ/TROL-LEY 🚎
    ВА-ГОН/WA-GON 🚃 | СКЕЙТ-БОРД/SKATE-BOARD 🛹 | ТРО-ТИ-НЕТ-КА/STEP 🛴 | КО-ЛИЧ-КА/KAR-RE-TJE 🛒
    ШЕЙ-НА/SLEE 🛷 | ГУ-МА/BAND 🛞 | СВЕ-ТО-ФАР/STOP-LICHT 🚦 | КО-ТВА/AN-KER ⚓
    БУ-РЕ/VAT 🛢️ | ЛИФТ/KA-BEL-BAAN 🚡 | ВЛЕК/SKI-LIFT 🚠 | ДЖИП/PICK-UP 🛻
    РИК-ША/RIK-SJA 🛺 | ТИР/TRUCK 🚛 | БО-ЛИД/RA-CE-AU-TO 🏎️ | КА-ТЕР/SPEED-BOOT 🚤
    ФЕ-РИ-БОТ/VEER-BOOT ⛴️ | ПО-ЯС/RED-DINGS-BOEI 🛟 | БЕН-ЗИН/BEN-ZI-NE ⛽ | СИ-РЕ-НА/SI-RE-NE 🚨
    СТОП/STOP 🛑 | СЕ-ДАЛ-КА/ZIT-PLAATS 💺
  `,
  family: `
    МА-МА/MA-MA 👩 | БА-БА/O-MA 👵 | ДЯ-ДО/O-PA 👴 | ДЕ-ТЕ/KIND 🧒
    БРАТ/BROER 👦 | ТАТ-КО/PA-PA 👨 | СЕС-ТРА/ZUS 👧 | БЕ-БЕ/BA-BY 👶
    СЕ-МЕЙС-ТВО/GE-ZIN 👪
  `,
  body: `
    О-КО/OOG 👁️ | НОС/NEUS 👃 | У-ХО/OOR 👂 | ЗЪБ/TAND 🦷
    РЪ-КА/HAND 🤚 | КРАК/BEEN 🦵 | СТЪ-ПА-ЛО/VOET 🦶 | Е-ЗИК/TONG 👅
    УС-ТА/MOND 👄 | МО-ЗЪК/HER-SE-NEN 🧠 | СЪР-ЦЕ/HART ❤️ | КОСТ/BOT 🦴
    БРА-ДА/BAARD 🧔 | МУС-КУЛ/SPIER 💪 | ПРЪСТ/VIN-GER 👆 | ДЛАН/HAND-PALM 🖐️
    КО-СА/HAAR 💇 | БЯЛ-ДРОБ/LONG 🫁 | НОК-ЪТ/NA-GEL 💅
  `,
  clothes: `
    ШАП-КА/PET 🧢 | РИ-ЗА/SHIRT 👕 | ПАН-ТА-ЛОН/BROEK 👖 | РОК-ЛЯ/JURK 👗
    БЛУ-ЗА/BLOU-SE 👚 | ПАЛ-ТО/JAS 🧥 | ХА-ЛАТ/LAB-JAS 🥼 | ШАЛ/SJAAL 🧣
    РЪ-КА-ВИ-ЦИ/WAN-TEN 🧤 | ЧО-РА-ПИ/SOK 🧦 | О-БУВ-КА/SCHOEN 👟 | БО-ТУШ/LAARS 👢
    САН-ДАЛ/SAN-DAAL 🥿 | ЧЕ-ХЪЛ/SLIP-PER 🩴 | КОС-ТЮМ/PAK 🤵 | БУЛ-КА/BRUID 👰
    ЦИ-ЛИН-ДЪР/HOED 🎩 | КАС-КА/HELM ⛑️ | БАН-СКИ/BAD-PAK 🩱 | ЧЕР-ВИ-ЛО/LIP-STIFT 💄
    ПОРТ-МО-НЕ/POR-TE-MON-NEE 👛 | КИ-МО-НО/KI-MO-NO 👘 | СА-РИ/SA-RI 🥻 | ГА-ЩИ/ON-DER-BROEK 🩲
    ШОР-ТИ/SHORT 🩳 | ЖИ-ЛЕТ-КА/VEST 🦺 | ВРАТ-ВРЪЗ-КА/STROP-DAS 👔 | ШЛЕМ/- 🪖
    ТОР-БА/ZAK 🛍️ | ДИ-А-МАНТ/DI-A-MANT 💎 | БРО-Е-НИ-ЦА/KET-TING 📿 | БУ-ЛАВ-КА/SPELD 🧷
    ЛО-СИ-ОН/LO-TION 🧴
    ГРЕ-БЕН/KAM 🪮 | СЛЪН-ЧО-ГЛЕ-ДИ/ZON-NE-BRIL 🕶️
  `,
  jobs: `
    ПО-ЛИ-ЦАЙ/A-GENT 👮 | ВОЙ-НИК/WACHT 💂 | СТРО-И-ТЕЛ/BOU-WER 👷 | КРАЛ/PRINS 🤴
    КРА-ЛИ-ЦА/PRIN-SES 👸 | РИ-ЦАР/ZWAARD 🗡️ | НИН-ДЖА/NIN-JA 🥷 | ДЕ-ТЕК-ТИВ/SPI-ON 🕵️
    КЛО-УН/CLOWN 🤡 | БА-ЛЕ-РИ-НА/BAL-LET 🩰 | ЛЕ-КАР/DOK-TER 🩺 | ПЕ-ВЕЦ/ZAN-GER 🎤
    ДИП-ЛО-МА/DI-PLO-MA 🎓
    ГО-ТВАЧ/KOK 👨‍🍳 | ПО-ЖАР-НИ-КАР/BRAND-WEER-MAN 👨‍🚒 | ФЕР-МЕР/BOER 👩‍🌾
    МЕ-ХА-НИК/MON-TEUR 👨‍🔧 | У-ЧЕН/GE-LEER-DE 👩‍🔬 | ПИ-ЛОТ/PI-LOOT 👩‍✈️
    СЪ-ДИ-Я/RECH-TER 🧑‍⚖️ | ПРО-ГРА-МИСТ/PRO-GRAM-MEUR 👩‍💻
  `,
  sport: `
    ФУТ-БОЛ/VOET-BAL ⚽ | БАС-КЕТ-БОЛ/BAS-KET-BAL 🏀 | ВО-ЛЕЙ-БОЛ/VOL-LEY-BAL 🏐 | ТЕ-НИС/TEN-NIS 🎾
    РЪГ-БИ/RUG-BY 🏉 | БЕЙЗ-БОЛ/HONK-BAL ⚾ | ГОЛФ/GOLF ⛳ | БОКС/BOK-SEN 🥊
    КА-РА-ТЕ/KA-RA-TE 🥋 | ПЛУ-ВА-НЕ/ZWEM-MEN 🏊 | БЯ-ГА-НЕ/REN-NEN 🏃 | СКИ/SKI 🎿
    СЪРФ/SUR-FEN 🏄 | ЯЗ-ДА/PAARD-RIJ-DEN 🏇 | СТРЕЛ-БА/BOOG 🏹 | РИ-БО-ЛОВ/VIS-SEN 🎣
    БАД-МИН-ТОН/BAD-MIN-TON 🏸 | ХО-КЕЙ/HOC-KEY 🏒 | КРИ-КЕТ/CRIC-KET 🏏 | БО-У-ЛИНГ/BOW-LEN 🎳
    МЕ-ДАЛ/ME-DAIL-LE 🏅 | КУ-ПА/BE-KER 🏆 | ФИ-НАЛ/FI-NISH 🏁 | ПА-ЛАТ-КА/TENT ⛺
    ПЛА-НИ-НАР/KLIM-MEN 🧗 | МИ-ШЕ-НА/DART-BORD 🎯 | ЙО-ЙО/JO-JO 🪀 | ХВЪР-ЧИ-ЛО/VLIE-GER 🪁
    БИ-ЛЯРД/BIL-JART 🎱 | ЗАР/DOB-BEL-STEEN 🎲 | ПЪ-ЗЕЛ/PUZ-ZEL 🧩 | ШАХ/SCHAAK ♟️
    КЪН-КИ/ROL-SCHAATS 🛼 | ПА-РА-ШУТ/PA-RA-CHU-TE 🪂 | ФРИЗ-БИ/FRIS-BEE 🥏 | СТИК/HOC-KEY-STICK 🏑
    ПИНГ-ПОНГ/TA-FEL-TEN-NIS 🏓 | МРЕ-ЖА/NET 🥅 | ШНОР-ХЕЛ/SNOR-KEL 🤿 | БУ-МЕ-РАНГ/BOE-ME-RANG 🪃
    ДЖОЙ-СТИК/CON-SO-LE 🎮
    ЩАН-ГА/HAL-TER 🏋️ | ГИМ-НАС-ТИ-КА/TUR-NEN 🤸 | СНО-У-БОРД/SNOW-BOARD 🏂
    КО-ЛО-ЕЗ-ДАЧ/WIEL-REN-NER 🚴 | ФЕХ-ТОВ-КА/SCHER-MEN 🤺 | БОР-БА/WOR-STE-LEN 🤼
  `,
  music: `
    КИ-ТА-РА/GI-TAAR 🎸 | ПИ-А-НО/PI-A-NO 🎹 | ЦИ-ГУЛ-КА/VI-OOL 🎻 | ТРЪ-БА/TROM-PET 🎺
    САК-СО-ФОН/SAX-O-FOON 🎷 | А-КОР-ДЕ-ОН/AC-COR-DE-ON 🪗 | НО-ТА/NOOT 🎵 | СЛУ-ШАЛ-КИ/KOP-TE-LE-FOON 🎧
    ТОН-КО-ЛО-НА/LUID-SPRE-KER 🔊 | БАН-ДЖО/BAN-JO 🪕 | МА-РА-КА-СИ/MA-RA-CAS 🪇 | ФЛЕЙ-ТА/FLUIT 🪈
    НО-ТИ/NO-TEN 🎶
  `,
  school: `
    ТЕ-БЕ-ШИР/KRIJT 🖍️ | ХИ-МИ-КАЛ/PEN 🖊️ | ПИ-САЛ-КА/VUL-PEN 🖋️ | ПАП-КА/MAP 📁
    КА-ЛЕН-ДАР/KA-LEN-DER 📅 | У-ЧЕБ-НИК/BOE-KEN 📚 | КЛА-МЕР/PA-PER-CLIP 📎 | БЕ-ЛЕЖ-КА/BRIEF-JE 📝
    КА-БЪР-ЧЕ/PU-NAI-SE 📌 | У-ЧИ-ЛИ-ЩЕ/SCHOOL 🏫
    ДО-МАШ-НО/HUIS-WERK ~ | ИЗ-ПИТ/TOETS ~ | О-ЦЕН-КА/CIJ-FER ~
    ВА-КАН-ЦИ-Я/VA-KAN-TIE ~ | ПО-ЧИВ-КА/PAU-ZE ~ | БИБ-ЛИ-О-ТЕ-КА/BI-BLI-O-THEEK ~
  `,
  places: `
    ЗА-МЪК/KAS-TEEL 🏰 | БОЛ-НИ-ЦА/ZIE-KEN-HUIS 🏥 | БАН-КА/BANK 🏦 | ХО-ТЕЛ/HO-TEL 🏨
    МА-ГА-ЗИН/WIN-KEL 🏪 | ЦЪР-КВА/KERK ⛪ | ДЖА-МИ-Я/MOS-KEE 🕌 | ФАБ-РИ-КА/FA-BRIEK 🏭
    СТА-ДИ-ОН/STA-DI-ON 🏟️ | ЦИРК/CIR-CUS 🎪 | ТЕ-А-ТЪР/THE-A-TER 🎭 | КИ-НО/BIOS-COOP 🎬
    МУ-ЗЕЙ/MU-SE-UM 🏛️ | ФОН-ТАН/FON-TEIN ⛲ | МОСТ/BRUG 🌉 | ГА-РА/STA-TION 🚉
    ЛЕ-ТИ-ЩЕ/VLIEG-VELD 🛫 | КЪМ-ПИНГ/CAM-PING 🏕️ | ГРАД/STAD 🏙️ | СГРА-ДА/GE-BOUW 🏢
    МОЛ/WA-REN-HUIS 🏬 | КУ-ЛА/TO-REN 🗼 | СТА-ТУ-Я/STAND-BEELD 🗽 | ХРАМ/TEM-PEL 🛕
    КО-ЛИ-БА/HUT 🛖 | КВАР-ТАЛ/BUURT 🏘️ | СТРО-ЕЖ/BOUW 🏗️ | ТУХ-ЛА/STEEN 🧱
    КА-МЪК/ROTS 🪨 | БА-НЯ/BAD-HUIS ♨️ | ВЪР-ТЕ-ЛЕЖ-КА/DRAAI-MO-LEN 🎠 | ПЪР-ЗАЛ-КА/GLIJ-BAAN 🛝
    ВЛАК-ЧЕ/ACHT-BAAN 🎢 | СПИР-КА/HAL-TE 🚏 | ШО-СЕ/WEG 🛣️ | РЕЛ-СИ/RAILS 🛤️
  `,
  fantasy: `
    ДРА-КОН/DRAAK 🐉 | ЕД-НО-РОГ/EEN-HOORN 🦄 | РО-БОТ/RO-BOT 🤖 | ПРИ-ЗРАК/SPOOK 👻
    ЗОМ-БИ/ZOM-BIE 🧟 | ВАМ-ПИР/VAM-PIER 🧛 | ВЕ-ЩИ-ЦА/HEKS 🧙 | ФЕ-Я/FEE 🧚
    ЕЛФ/ELF 🧝 | ДЖИН/GEEST 🧞 | РУ-САЛ-КА/ZEE-MEER-MIN 🧜 | ИЗ-ВЪН-ЗЕМ-НО/A-LI-EN 👽
    ЧУ-ДО-ВИ-ЩЕ/MON-STER 👹 | ТИК-ВА/POM-POEN 🎃 | ПРЪЧ-КА/TO-VER-STAF 🪄 | КРИС-ТАЛ/BOL 🔮
    МАТ-РЬОШ-КА/MA-TROESJ-KA 🪆 | ПИ-НЯ-ТА/PI-NA-TA 🪅 | И-ГРАЧ-КА/BEER-TJE 🧸
  `,
  holidays: `
    ЕЛ-ХА/KERST-BOOM 🎄 | ФОЙ-ЕР-ВЕРК/VUUR-WERK 🎆 | КОН-ФЕ-ТИ/CON-FET-TI 🎊
    ПАН-ДЕЛ-КА/STRIK 🎀
  `,
  shapes: `
    КРЪГ/CIR-KEL ⭕ | КВАД-РАТ/VIER-KANT 🟦 | РОМБ/RUIT 🔷 | ЧЕР-ВЕ-НО/ROOD 🔴
    ЗЕ-ЛЕ-НО/GROEN 🟢 | СИ-НЬО/BLAUW 🔵 | ЖЪЛ-ТО/GEEL 🟡 | ЛИ-ЛА-ВО/PAARS 🟣
    ЧЕР-НО/ZWART ⚫ | БЯ-ЛО/WIT ⚪ | О-РАН-ЖЕ-ВО/O-RAN-JE 🟠 | КА-ФЯ-ВО/BRUIN 🟤
  `,
  space: `
    СПЪТ-НИК/SA-TEL-LIET 🛰️ | ГА-ЛАК-ТИ-КА/MELK-WEG 🌌
    АС-ТРО-НАВТ/AS-TRO-NAUT 🧑‍🚀
  `,

  /* --- Думи без картинка: чуват се и се подреждат. --- */
  verbs: `
    СПЯ/SLA-PEN ~ | ЯМ/E-TEN ~ | ПИ-Я/DRIN-KEN ~ | ЧЕ-ТА/LE-ZEN ~
    ПИ-ША/SCHRIJ-VEN ~ | РИ-СУ-ВАМ/TE-KE-NEN ~ | ПЕ-Я/ZIN-GEN ~ | ТАН-ЦУ-ВАМ/DAN-SEN ~
    СКА-ЧАМ/SPRIN-GEN ~ | ПЛА-ЧА/HUI-LEN ~ | ГЛЕ-ДАМ/KIJ-KEN ~ | СЛУ-ШАМ/LUIS-TE-REN ~
    ГО-ВО-РЯ/PRA-TEN ~ | МИС-ЛЯ/DEN-KEN ~ | ПО-МА-ГАМ/HEL-PEN ~ | ДА-ВАМ/GE-VEN ~
    ВЗЕ-МАМ/NE-MEN ~ | ИД-ВАМ/KO-MEN ~ | СТО-Я/STAAN ~ | СЕ-ДЯ/ZIT-TEN ~
    ЛЕ-ТЯ/VLIE-GEN ~ | КА-РАМ/RIJ-DEN ~ | МИ-Я/WAS-SEN ~ | ГО-ТВЯ/KO-KEN ~
    СТРО-Я/BOU-WEN ~ | ТЪР-СЯ/ZOE-KEN ~ | НА-МИ-РАМ/VIN-DEN ~ | ЧА-КАМ/WACH-TEN ~
    РА-БО-ТЯ/WER-KEN ~ | У-ЧА/LE-REN ~ | ИГ-РА-Я/SPE-LEN ~ | КУ-ПУ-ВАМ/KO-PEN ~
    ОТ-ВА-РЯМ/O-PE-NEN ~ | ЗА-ТВА-РЯМ/SLUI-TEN ~ | ЧУ-ПЯ/BRE-KEN ~ | ПА-ДАМ/VAL-LEN ~
    ДЪР-ЖА/HOU-DEN ~ | ДЪР-ПАМ/TREK-KEN ~ | БУ-ТАМ/DU-WEN ~ | РЕ-ЖА/SNIJ-DEN ~
    ЛЕ-ПЯ/PLAK-KEN ~ | КО-ПА-Я/GRAV-EN ~
    БРО-Я/TEL-LEN ~ | ВЪР-ВЯ/LO-PEN ~ | ЧИС-ТЯ/POET-SEN ~
    СА-ДЯ/PLAN-TEN ~ | ПО-ЛИ-ВАМ/GIE-TEN ~ | НО-СЯ/DRA-GEN ~
    ХВЪР-ЛЯМ/GOOI-EN ~ | ЛО-ВЯ/VAN-GEN ~ | ГУ-БЯ/VER-LIE-ZEN ~
    ПИ-ТАМ/VRA-GEN ~ | ОТ-ГО-ВА-РЯМ/ANT-WOOR-DEN ~ | МЪЛ-ЧА/ZWIJ-GEN ~
    ЗНАМ/WE-TEN ~ | ПОМ-НЯ/ONT-HOU-DEN ~ | ЗА-БРА-ВЯМ/VER-GE-TEN ~
    ПРЕ-ГРЪ-ЩАМ/KNUF-FE-LEN ~ | ЦЕ-ЛУ-ВАМ/KUS-SEN ~ | ВИ-КАМ/ROE-PEN ~
    ШЕП-НА/FLUIS-TE-REN ~ | ПО-ЧИ-ВАМ/RUS-TEN ~ | РИ-ТАМ/SCHOP-PEN ~
    ХВА-ЩАМ/PAK-KEN ~ | ПУС-КАМ/LOS-LA-TEN ~ | СЛИ-ЗАМ/DA-LEN ~
    СТА-ВАМ/OP-STAAN ~ | ЛЯ-ГАМ/LIG-GEN ~ | ВЪР-ТЯ/DRAAI-EN ~
    СГЪ-ВАМ/VOU-WEN ~ | ШИ-Я/NAAI-EN ~ | МЕ-ТА/VE-GEN ~
    СУ-ША/DRO-GEN ~ | ТО-ПЛЯ/VER-WAR-MEN ~ | ОХ-ЛАЖ-ДАМ/KOE-LEN ~
    МЕ-РЯ/ME-TEN ~ | ТЕ-ЖА/WE-GEN ~ | РАС-ТА/GROEI-EN ~
    ЖИ-ВЕ-Я/LE-VEN ~ | ДИ-ША/A-DE-MEN ~ | КИ-ХАМ/NIE-ZEN ~
    ЛЕ-КУ-ВАМ/GE-NE-ZEN ~ | ПО-ДА-РЯ-ВАМ/SCHEN-KEN ~ | ПРО-ДА-ВАМ/VER-KO-PEN ~
    ПЛА-ЩАМ/BE-TA-LEN ~ | СМЕ-НЯМ/RUI-LEN ~ | ПО-ПРА-ВЯМ/RE-PA-RE-REN ~
    БО-Я-ДИС-ВАМ/VER-VEN ~ | СВЕ-ТЯ/SCHIJ-NEN ~ | ГА-СЯ/DO-VEN ~
    ЗА-ПАЛ-ВАМ/AAN-STE-KEN ~ | ЗВЪ-НЯ/BEL-LEN ~ | ЧУ-КАМ/KLOP-PEN ~
    ГО-НЯ/JA-GEN ~ | КРИ-Я/VER-STOP-PEN ~ | ПО-КАЗ-ВАМ/TO-NEN ~
    ВИЖ-ДАМ/ZIEN ~ | ЧУ-ВАМ/HO-REN ~
    ПО-ЗДРА-ВЯ-ВАМ/GROE-TEN ~ | БЛА-ГО-ДА-РЯ/BE-DAN-KEN ~ | СРЕ-ЩАМ/ONT-MOE-TEN ~
    ОБ-ЛИ-ЧАМ/AAN-KLE-DEN ~ | СЪ-БЛИ-ЧАМ/UIT-KLE-DEN ~ | ЧЕ-ША/KRAB-BEN ~
    ГА-ЛЯ/AAI-EN ~ | ХРА-НЯ/VOE-REN ~ | ПА-СА/GRA-ZEN ~
    ЛА-Я/BLAF-FEN ~ | МЯУ-КАМ/MI-AU-WEN ~ | ЦЪ-ФТЯ/BLOEI-EN ~
    ВЕ-Я/WAAI-EN ~ | ВА-ЛИ/RE-GE-NEN ~ | ГЪР-МИ/DON-DE-REN ~
    ЗАМ-РЪЗ-ВАМ/BE-VRIE-ZEN ~ | ТО-ПЯ/SMEL-TEN ~ | ГО-РЯ/BRAN-DEN ~
    КА-ЦАМ/LAN-DEN ~ | ПЪ-ТУ-ВАМ/REI-ZEN ~ | ЧЕР-ТА-Я/LIJ-NEN ~
    СМЯ-ТАМ/RE-KE-NEN ~ | СЪ-БИ-РАМ/OP-TEL-LEN ~ | ИЗ-ВАЖ-ДАМ/AF-TREK-KEN ~
    СРАВ-НЯ-ВАМ/VER-GE-LIJ-KEN ~ | РЕ-ША-ВАМ/OP-LOS-SEN ~ | ПОЗ-НА-ВАМ/HER-KEN-NEN ~
    ИЗ-БИ-РАМ/KIE-ZEN ~ | О-ПИТ-ВАМ/PRO-BE-REN ~ | У-СПЯ-ВАМ/LUK-KEN ~
    ЗА-ПОЧ-ВАМ/BE-GIN-NEN ~ | СВЪР-ШВАМ/EIN-DI-GEN ~ | ПРО-ДЪЛ-ЖА-ВАМ/DOOR-GAAN ~
    СПИ-РАМ/STOP-PEN ~
    ЗА-ЩИ-ТА-ВАМ/BE-SCHER-MEN ~ | СЛЕД-ВАМ/VOL-GEN ~ | ВО-ДЯ/LEI-DEN ~
    ПО-СЕ-ЩА-ВАМ/BE-ZOE-KEN ~ | ПО-КАН-ВАМ/UIT-NO-DI-GEN ~ | ОБ-ЯС-НЯ-ВАМ/UIT-LEG-GEN ~
    ПО-ВТА-РЯМ/HER-HA-LEN ~ | СЪ-НУ-ВАМ/DRO-MEN ~ | ЖЕ-ЛА-Я/WEN-SEN ~
    НА-ДЯ-ВАМ/HO-PEN ~ | ВЯР-ВАМ/GE-LO-VEN ~ | О-БЕ-ЩА-ВАМ/BE-LO-VEN ~
    СПО-ДЕ-ЛЯМ/DE-LEN ~ | ПО-ЗВО-ЛЯ-ВАМ/TOE-STAAN ~ | ЗА-БРА-НЯ-ВАМ/VER-BIE-DEN ~
  `,
  qualities: `
    ГО-ЛЯМ/GROOT ~ | МА-ЛЪК/KLEIN ~ | ДЪ-ЛЪГ/LANG ~ | КЪС/KORT ~
    ВИ-СОК/HOOG ~ | НИ-СЪК/LAAG ~ | БЪРЗ/SNEL ~ | БА-ВЕН/LANG-ZAAM ~
    ТО-ПЪЛ/WARM ~ | СТУ-ДЕН/KOUD ~ | МО-КЪР/NAT ~ | СУХ/DROOG ~
    ЧИСТ/SCHOON ~ | МРЪ-СЕН/VUIL ~ | ТЕ-ЖЪК/ZWAAR ~ | СИ-ЛЕН/STERK ~
    МЕК/ZACHT ~ | ТВЪРД/HARD ~ | СЛА-ДЪК/ZOET ~ | КИ-СЕЛ/ZUUR ~
    ВКУ-СЕН/LEK-KER ~ | КРА-СИВ/MOOI ~ | РА-ДОС-ТЕН/BLIJ ~ | СЪР-ДИТ/BOOS ~
    УП-ЛА-ШЕН/BANG ~ | У-МО-РЕН/MOE ~ | БО-ЛЕН/ZIEK ~ | ЗДРАВ/GE-ZOND ~
    НОВ/NIEUW ~ | СТАР/OUD ~ | МЛАД/JONG ~ | БО-ГАТ/RIJK ~
    ПЪ-ЛЕН/VOL ~ | ПРА-ЗЕН/LEEG ~ | ДЪ-ЛБОК/DIEP ~ | ШИ-РОК/BREED ~
    ТЕ-СЕН/SMAL ~ | КРЪ-ГЪЛ/ROND ~ | КРИВ/KROM ~ | ТЪ-МЕН/DON-KER ~
    ДЕ-БЕЛ/DIK ~ | ТЪ-НЪК/DUN ~ | ЛЕК/LICHT ~
    ГО-РЕЩ/HEET ~ | СЛАБ/ZWAK ~ | ГЛА-ДЪК/GLAD ~
    ГРА-ПАВ/RUW ~ | СВЕ-ТЪЛ/HEL ~ | ТИХ/STIL ~
    ШУ-МЕН/LUID ~ | ГОР-ЧИВ/BIT-TER ~ | ГЛА-ДЕН/HON-GE-RIG ~
    ЖА-ДЕН/DOR-STIG ~ | БУ-ДЕН/WAK-KER ~ | ВЕ-СЕЛ/VRO-LIJK ~
    ТЪ-ЖЕН/VER-DRIE-TIG ~ | СПО-КО-ЕН/RUS-TIG ~ | СМЕЛ/DAP-PER ~
    ДО-БЪР/GOED ~ | ЛОШ/SLECHT ~ | ГРО-ЗЕН/LE-LIJK ~
    ЛЕ-СЕН/MAK-KE-LIJK ~ | ТРУ-ДЕН/MOEI-LIJK ~ | ОС-ТЪР/SCHERP ~
    ПРАВ/RECHT ~ | ЛЕП-КАВ/PLAK-KE-RIG ~
    ЛЮ-БО-ПИ-ТЕН/NIEUWS-GIE-RIG ~ | ТЪР-ПЕ-ЛИВ/GE-DUL-DIG ~ | ВНИ-МА-ТЕ-ЛЕН/VOOR-ZICH-TIG ~
    ЩЕ-ДЪР/GUL ~ | ЧЕС-ТЕН/EER-LIJK ~ | У-ЧТИВ/BE-LEEFD ~
    ЗА-БА-ВЕН/GRAP-PIG ~ | СЕ-РИ-О-ЗЕН/SE-RI-EUS ~ | ВА-ЖЕН/BE-LANG-RIJK ~
    ГО-ТОВ/KLAAR ~
  `,
  time: `
    ДЕН/DAG ~ | НОЩ/NACHT ~ | У-ТРО/MOR-GEN ~ | ВЕ-ЧЕР/A-VOND ~
    СЕД-МИ-ЦА/WEEK ~ | МЕ-СЕЦ/MAAND ~ | ГО-ДИ-НА/JAAR ~ | ВРЕ-МЕ/TIJD ~
    ЧАС/UUR ~ | МИ-НУ-ТА/MI-NUUT ~ | ПРО-ЛЕТ/LEN-TE ~ | ЛЯ-ТО/ZO-MER ~
    Е-СЕН/HERFST ~ | ЗИ-МА/WIN-TER ~
    СЕ-ГА/NU ~ | ПО-СЛЕ/STRAKS ~ | РА-НО/VROEG ~
    КЪС-НО/LAAT ~ | ДНЕС/VAN-DAAG ~ | ВЧЕ-РА/GIS-TE-REN ~
    ВИ-НА-ГИ/AL-TIJD ~ | НИ-КО-ГА/NOOIT ~ | ЧЕС-ТО/VAAK ~
    РЯД-КО/ZEL-DEN ~ | ПО-НЕ-ДЕЛ-НИК/MAAN-DAG ~ | ВТОР-НИК/DINS-DAG ~
    СРЯ-ДА/WOENS-DAG ~ | ЧЕТ-ВЪР-ТЪК/DON-DER-DAG ~ | ПЕ-ТЪК/VRIJ-DAG ~
    СЪ-БО-ТА/ZA-TER-DAG ~ | НЕ-ДЕ-ЛЯ/ZON-DAG ~ | Я-НУ-А-РИ/JA-NU-A-RI ~
    ФЕВ-РУ-А-РИ/FE-BRU-A-RI ~ | МАРТ/MAART ~ | АП-РИЛ/A-PRIL ~
    МАЙ/MEI ~ | Ю-НИ/JU-NI ~ | Ю-ЛИ/JU-LI ~
    АВ-ГУСТ/AU-GUS-TUS ~ | СЕП-ТЕМ-ВРИ/SEP-TEM-BER ~ | ОК-ТОМ-ВРИ/OK-TO-BER ~
    НО-ЕМ-ВРИ/NO-VEM-BER ~ | ДЕ-КЕМ-ВРИ/DE-CEM-BER ~
    СЕ-КУН-ДА/SE-CON-DE ~
  `,
  ideas: `
    И-МЕ/NAAM ~ | ДУ-МА/WOORD ~ | ВЪ-ПРОС/VRAAG ~ | ОТ-ГО-ВОР/ANT-WOORD ~
    ПРИ-КАЗ-КА/VER-HAAL ~ | ПЕ-СЕН/LIED ~ | ИГ-РА/SPEL ~ | РА-БО-ТА/WERK ~
    ПО-МОЩ/HULP ~ | ПРИ-Я-ТЕЛ/VRIEND ~ | СЪ-СЕД/BUUR ~ | ЧО-ВЕК/MENS ~
    ЗВУК/GE-LUID ~ | ГЛАС/STEM ~ | ЦВЯТ/KLEUR ~ | ФОР-МА/VORM ~
    ЧИС-ЛО/GE-TAL ~ | БУК-ВА/LET-TER ~ | У-РОК/LES ~ | ПРАЗ-НИК/FEEST ~
    СЪН/DROOM ~ | ЛЮ-БОВ/LIEF-DE ~ | ЦЕ-ЛУВ-КА/KUS ~ | ПРЕ-ГРЪД-КА/KNUF-FEL ~
    БОЛ-КА/PIJN ~ | ГЛАД/HON-GER ~ | ЖА-ЖДА/DORST ~ | ВКУС/SMAAK ~
    МИ-РИЗ-МА/GEUR ~ | ЗА-ДА-ЧА/SOM ~ | КЛАС/KLAS ~
    ИС-ТИ-НА/WAAR-HEID ~ | ЛЪ-ЖА/LEU-GEN ~ | ТАЙ-НА/GE-HEIM ~
    ПЛАН/PLAN ~ | И-ДЕ-Я/I-DEE ~ | ПРИ-МЕР/VOOR-BEELD ~
    ПРА-ВИ-ЛО/RE-GEL ~ | РЕД/OR-DE ~ | ГРЕШ-КА/FOUT ~
    У-СПЕХ/SUC-CES ~ | НА-ЧА-ЛО/BE-GIN ~ | КРАЙ/EIN-DE ~
    СРЕ-ДА/MID-DEN ~ | ЧАСТ/DEEL ~ | ЦЯ-ЛО/GE-HEEL ~
    ГРУ-ПА/GROEP ~
  `,
  place: `
    ЛЯ-ВО/LINKS ~ | ДЯС-НО/RECHTS ~ | ГО-РЕ/BO-VEN ~ | ДО-ЛУ/BE-NE-DEN ~
    ПРЕД/VOOR ~ | ЗАД/ACH-TER ~ | ВЪ-ТРЕ/BIN-NEN ~ | ВЪН/BUI-TEN ~
    ТУК/HIER ~ | ТАМ/DAAR ~ | ДА-ЛЕЧ/VER ~ | НЕ-БЕ/HE-MEL ~
    ВЪЗ-ДУХ/LUCHT ~ | ПОЧ-ВА/GROND ~ | СВЯТ/WE-RELD ~ | СТРА-НА/LAND ~
    СЕ-ЛО/DORP ~ | У-ЛИ-ЦА/STRAAT ~ | СТА-Я/KA-MER ~ | КУХ-НЯ/KEU-KEN ~
    ГРА-ДИ-НА/TUIN ~ | СТЕ-НА/MUUR ~ | ПО-КРИВ/DAK ~ | ПОД/VLOER ~
    БЛИ-ЗО/DICHT-BIJ ~ | МЕЖ-ДУ/TUS-SEN ~ | СРЕ-ЩУ/TE-GEN-O-VER ~
    ОТ-СТРА-НИ/OP-ZIJ ~ | НА-ГО-РЕ/OM-HOOG ~ | НА-ДО-ЛУ/OM-LAAG ~
    НА-ПРЕД/VOOR-UIT ~ | НА-ЗАД/ACH-TER-UIT ~ | ОТ-ГО-РЕ/BO-VEN-OP ~
    ОТ-ДО-ЛУ/ON-DER-OP ~
  `,
  people: `
    МАЙ-КА/MOE-DER ~ | БА-ЩА/VA-DER ~ | СИН/ZOON ~ | ДЪ-ЩЕ-РЯ/DOCH-TER ~
    РО-ДИ-ТЕ-ЛИ/OU-DERS ~ | ДЕ-ЦА/KIN-DE-REN ~ | МОМ-ЧЕ/JON-GEN ~ | МО-МИ-ЧЕ/MEIS-JE ~
    МЪЖ/MAN ~ | ЖЕ-НА/VROUW ~ | ЧИ-ЧО/OOM ~ | ЛЕ-ЛЯ/TAN-TE ~
    У-ЧИ-ТЕЛ-КА/JUF ~ | У-ЧИ-ТЕЛ/MEES-TER ~
    ПРИ-Я-ТЕЛ-КА/VRIEN-DIN ~ | БЛИЗ-НА-ЦИ/TWEE-LING ~ | ВНУК/KLEIN-ZOON ~
    БРА-ТО-ВЧЕД/NEEF ~ | ГОСТ/GAST ~ | ХО-РА/MEN-SEN ~
    ОТ-БОР/TEAM ~
  `,
  tech: `
    МЕ-ГА-ФОН/ME-GA-FOON 📢
  `,
  feelings: `
    РА-ДОСТ/BLIJD-SCHAP ~ | ТЪ-ГА/VER-DRIET ~ | СТРАХ/ANGST ~
    ГНЯВ/WOE-DE ~ | СРАМ/SCHAAM-TE ~ | ИЗ-НЕ-НА-ДА/VER-RAS-SING ~
    СКУ-КА/VER-VE-LING ~ | НА-ДЕЖ-ДА/HOOP ~ | ГОР-ДОСТ/TROTS ~
    СМЕЛ-ОСТ/MOED ~
  `,
  numbers: `
    Е-ДНО/EEN ~ | ДВЕ/TWEE ~ | ТРИ/DRIE ~
    ЧЕ-ТИ-РИ/VIER ~ | ПЕТ/VIJF ~ | ШЕСТ/ZES ~
    СЕ-ДЕМ/ZE-VEN ~ | О-СЕМ/ACHT ~ | ДЕ-ВЕТ/NE-GEN ~
    ДЕ-СЕТ/TIEN ~ | ДВА-НА-ДЕ-СЕТ/TWAALF ~ | ДВА-ДЕ-СЕТ/TWIN-TIG ~
    ПО-ЛО-ВИН-КА/HELFT ~ | ДВОЙ-КА/PAAR ~ | БРОЙ/AAN-TAL ~
    МЯР-КА/MAAT ~
  `
};
