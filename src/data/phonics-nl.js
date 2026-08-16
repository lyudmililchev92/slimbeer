/* =========================================================================
 * ДЕ KLANKEN VAN HET NEDERLANDS
 * -------------------------------------------------------------------------
 * Нидерландският не е фонетичен като българския. Две-три букви често дават
 * един звук: sch, ch, ij, oe, eu, ui, au, ou, ie, aa, ee, oo, uu, ng.
 * Затова тук има таблица, а прогресията на нивата е различна от българската
 * — първо чистите единични звукове, чак после двойките.
 *
 * `say` е какво да каже синтезаторът. Продължителните съгласни (m, s, f, r,
 * l, n, z, v) звучат добре сами. Взривните (p, t, k, b, d, g) не могат да
 * се произнесат без гласна — там пишем кратка форма и разчитаме на
 * примерната дума да носи ученето.
 * ========================================================================= */

PHONICS.nl = {
  /* Проверяват се по дължина, най-дългото първо. */
  onsets: ["SCH", "CH", "IJ", "EI", "OE", "EU", "UI", "AU", "OU", "IE",
           "AA", "EE", "OO", "UU"],
  codas:  ["SCH", "NG", "NK", "CH", "IJ", "EI", "OE", "EU", "UI", "AU", "OU",
           "IE", "AA", "EE", "OO", "UU"],

  skipFirst: ["Q", "X", "Y", "C"],

  /* Как да прозвучи звукът. Липсващите падат към letterSound. */
  say: {
    M:"mmm", N:"nnn", S:"sss", F:"fff", L:"lll", R:"rrr", Z:"zzz", V:"vvv",
    W:"wuh", J:"juh", H:"huh", P:"puh", T:"tuh", K:"kuh", B:"buh", D:"duh",
    G:"guh", A:"aa", E:"eh", I:"ie", O:"oh", U:"uh",
    SCH:"sgh", CH:"gch", IJ:"ij", EI:"ei", OE:"oe", EU:"eu", UI:"ui",
    AU:"au", OU:"ou", IE:"ie", AA:"aa", EE:"ee", OO:"oo", UU:"uu",
    NG:"ng", NK:"nk"
  },

  levels: [
    { id:1,  modes:["first"],                    sounds:["A","E","I","O","U"],                 maxLen:5,  wordsToPass:6 },
    { id:2,  modes:["first"],                    sounds:["M","S","L","R","N","P"],             maxLen:5,  wordsToPass:6 },
    { id:3,  modes:["first","same"],             sounds:["K","T","D","B","V","G","H"],         maxLen:6,  wordsToPass:7 },
    { id:4,  modes:["last"],                     sounds:["M","N","R","T","S","K"],             maxLen:6,  wordsToPass:7 },
    { id:5,  modes:["same","odd"],               sounds:["M","S","K","L","P","T","B","R"],     maxLen:6,  wordsToPass:7 },
    { id:6,  modes:["blend"],                    sounds:[],                                    maxLen:3,  wordsToPass:6, blend:3 },
    { id:7,  modes:["blend"],                    sounds:[],                                    maxLen:4,  wordsToPass:7, blend:4 },
    { id:8,  modes:["syllable"],                 sounds:[],                                    maxLen:6,  wordsToPass:7 },
    /* Чак тук идват двойките — те са същинската трудност на езика. */
    { id:9,  modes:["first"],                    sounds:["OE","IE","EE","AA","OO","UU"],       maxLen:6,  wordsToPass:8 },
    { id:10, modes:["first","last"],             sounds:["IJ","EI","UI","EU","AU","OU","SCH","CH"], maxLen:7, wordsToPass:8 },
    { id:11, modes:["blend","syllable"],         sounds:[],                                    maxLen:5,  wordsToPass:8, blend:5 },
    { id:12, modes:["first","last","same","odd","syllable"], sounds:[],                        maxLen:8,  wordsToPass:9 }
  ]
};
