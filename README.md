# SlimBeer

A learning game for children roughly 4–7 years old, in **Dutch and Bulgarian**.
Reading, sounds, stories, numbers, writing and a forest adventure. No dependencies,
no backend, works offline.

**Play:** https://lyudmililchev92.github.io/slimbeer/

The game is called *Letterbeer* in Dutch and *Буквик* in Bulgarian; the owl is Boekie / Буки.

---

## Who it is for

A child who cannot read yet, holding a tablet, without an adult sitting next to them.
Everything follows from that: icons instead of menus, every question spoken aloud,
big tap targets, and no text a child must read to know what to do.

## What is in it

Five worlds on the home screen.

### 📖 Words

| Path | What the child does |
|---|---|
| **Reading** — 12 levels, 6 task types | builds words from letters or syllables, finds the missing letter, the first letter, matches a spoken word to a picture, or a written word to a picture |
| **Sounds** — 12 levels, 6 exercises | which word starts with this sound, which ends with it, which two start alike, which one does not belong, blends sounds into a word, recognises a word from its syllables |
| **Stories** — 12 stories, 6 levels | reads 3 to 8 sentences, then answers what happened; every sentence has its own speaker button |

The two languages have **different** phonics progressions. Bulgarian spelling is
nearly phonetic, so letter and sound line up. Dutch has `sch`, `ij`, `oe`, `eu`,
`ui`, `ng` — one sound written with two or three letters — so those come only at
level nine, after the plain single sounds.

### 🌲 Adventure

**Forest** — 30 levels across nine places: meadow, forest, autumn, dusk, night,
winter, spring blossom, beach, cave. Boekie runs right on his own; the child's only
control is a tap to jump, plus a second jump in mid-air.

Every level is an errand from a forest friend: a squirrel wants acorns, a penguin
wants ice, a fairy wants magic orbs. **The errand opens the gate, not the word.**
Letters float at jump height and pay bonus stars, but never block the way.

Optional challenge spots pay extra stars: count the acorns on the sign, solve `4 + 4`,
pick the first letter of the pictured word, match a colour.

**Friends** — all 30 friends become a collection. Each one you have met gets a card:
where it lives, what it likes, its letter, and one true fact. Unmet friends show a
question mark, not a padlock.

**Missions** — 18 small tasks for away from the screen: find something round, count
five spoons together, make the letter T with your body. The device checks nothing —
no camera, no microphone, no permissions. The child taps *Done*.

### 🔢 Numbers

**Counting and maths** — 15 levels, 9 task types: counting, addition, subtraction,
number sequences, comparing groups, shapes, repeating patterns, matching a number to
a quantity, and making a number (`5 + ? = 8`). Every problem is generated from the
level's rules, so they never repeat.

### ✏️ Letters

The full alphabet — 30 Cyrillic and 26 Latin letters. Each letter has its sound,
example words, and two ways to write it:

* **Free trace** — ink turns purple inside the letter and pink outside, so the child
  sees when the stroke leaves the shape. Stroke order does not matter.
* **Step by step** — every letter has ordered strokes with a start, a direction and an
  end. A numbered dot shows where to begin and an arrow shows where to go. Writing
  "А" from the bottom up no longer passes. The tolerance is deliberately generous:
  a wobbly five-year-old hand still succeeds.

### 🎮 Quick games

**Letter hunt** — 10 levels, one engine, six things to catch: the next letter of a
word, a first letter, a *sound*, a syllable, a number, or the answer to a sum.

**Memory, Sorting, Odd one out** — 10 levels using the same dictionary.

---

## How it decides what to show

The game keeps a small skill model on the device: for each skill (`letter.bg.Ж.recognition`,
`reading.bg.syllables`, `math.add.10`) how many times it was tried, how many succeeded,
and how it has been going lately. Recent attempts weigh more, but older ones are not
thrown away — two mistakes should not erase a week.

Words containing weak letters then appear slightly more often. Measured over 40 000
picks with a child who confuses Ж and З: **10.6% → 12.6%** of words contain those
letters. Enough to help, not enough to feel like an interrogation.

The child never sees a number. The parent screen says it in words.

---

## Design

No timers. No lives. No streaks. No shop, no currency, no ads, no accounts, no
leaderboards, no "come back tomorrow". A wrong answer wobbles gently and can be
retried immediately. Hints are always free.

Stars are not currency and cannot be spent — they are a trace of where the child has
been, alongside friends found, places visited and words met.

**Calm mode** turns off particles, shake and confetti while keeping the movement that
*is* the game — Boekie still has to run. The system's `prefers-reduced-motion` is
respected by default. Correctness is never signalled by colour alone: a correct answer
also gets a check mark, a wrong one also moves.

## Privacy

Nothing is collected. No analytics, no cookies, no accounts, no network calls.
Progress lives in `localStorage` on the device and never leaves it.

One honest caveat: spoken words use the browser's speech synthesis. The game prefers a
voice that runs on the device, but if the only voice available for a language is a
server-side one, the word is sent to that service by the browser — not by the game.
The parent screen shows which voice is in use and whether it is local.

---

## Content

**1023 words in Bulgarian and 1012 in Dutch**, across 27 categories. 622 of the
Bulgarian ones have a picture; 401 more have no picture and are heard instead, which is
what makes verbs, adjectives, weekdays and months possible. Picture-less words start at
level six, so the first levels stay anchored to a picture.

This repository contains **no emoji artwork**. The word list stores Unicode code points;
the pictures are drawn by the font on your own device — Apple, Google, Microsoft and
others each draw them differently. That artwork belongs to those vendors and is not
covered by this licence, which is also why there are no screenshots here.

Twelve illustrations (cat, fish, sun, house, apple, ball, car, tree, flower, moon,
cloud, boat), the shapes and the mascot are hand-written inline SVG and are covered by
the licence below. No fonts are bundled.

---

## Running it

Open `index.html`. All the files have to sit in the same folder.

For a phone on the same network:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
# then open http://<your-ip>:8000 on the phone
```

Serving it over HTTPS additionally registers a service worker, so after the first visit
the game works with no connection at all.

`dist/buki.html` is a single self-contained file with everything inside. Send it by
email or AirDrop, double-click it, and it plays — no server, no service worker, no
network.

## Building

```sh
python3 build.py          # app.js, styles.css and dist/buki.html
python3 build.py --check  # validate the content only
```

The source lives in `src/` and `styles/`; `build.py` concatenates them in an explicit
order and wraps everything in one IIFE.

**There are no ES modules on purpose.** Modules are fetched under CORS rules and
browsers refuse them over `file://` — that would break "double-click and play". So the
source files are plain scripts sharing one scope, and the build enforces two things
that a shared scope makes easy to get wrong:

* **name clashes** — two files declaring the same top-level name would silently
  shadow each other. The build fails and names both files.
* **broken content** — a malformed word, a syllable without a vowel, a duplicate
  picture, a letter outside the alphabet. The build fails and points at the entry.

The build prints what it made:

```
Буки — сглобяването е готово

  думи            1023 bg / 1012 nl в 27 категории
  нива            четене 12 · смятане 15 · лов 10 · гора 30
  гората          30 приятели, 9 места
  счупени връзки  0
```

## Tests

```sh
node tools/test.js
```

100 checks, no dependencies. They execute the real source files in a bare context, so
what is tested is the code that actually runs. Among other things they verify that
every stroke of all 56 letters can actually be completed, that no forest level can
generate a gap wider than the jump, that 9000 generated maths problems never produce an
invalid answer, and that old saves survive migration.

## Files

| Path | What it is |
|---|---|
| `index.html`, `sw.js` | the shell and the offline cache |
| `src/core/` | state, storage, audio, speech, routing, the skill model |
| `src/data/` | words, languages, levels, friends, stories, strokes, missions |
| `src/games/` | reading, phonics, stories, forest, maths, letter hunt, writing, quick games |
| `src/screens/` | home, worlds, play, letters, writing, friends, missions, stars, parents |
| `styles/` | tokens, base, components, screens, games, cards, responsive, accessibility |
| `build.py` | concatenates, validates, reports |
| `tools/test.js` | the tests |
| `app.js`, `styles.css`, `dist/` | **generated — do not edit** |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Adding a word is one line. Adding a story is one
object. Adding a forest level is one line of data. None of them require touching the
engine.

## Licence

[MIT](LICENSE) — use it, change it, share it.

---

# SlimBeer (на български)

Образователна игра за деца на около 4–7 години, на **нидерландски и български**.
Четене, звукове, разказчета, смятане, писане и приключение в гората. Без инсталация,
без зависимости, работи офлайн.

**Играй:** https://lyudmililchev92.github.io/slimbeer/

## За кого е

За дете, което още не чете, с таблет в ръце и без възрастен до себе си. Оттам следва
всичко останало: икони вместо менюта, всеки въпрос се изговаря, големи бутони и нито
един текст, който детето трябва да прочете, за да разбере какво да прави.

## Какво има вътре

Пет свята на началния екран.

**📖 Думи** — Четене (12 нива, 6 вида задачи), Звукове (12 нива, 6 упражнения от
разпознаване на звук до сливане в дума) и Разказчета (12 разказчета в 6 нива, от три
до осем изречения, всяко със свой високоговорител).

Прогресията по звукове е **различна** за двата езика. Българското писане е почти
фонетично, а нидерландският има sch, ij, oe, eu, ui, ng — един звук от две-три букви —
затова там двойките идват чак на девето ниво.

**🌲 Приключение** — Гората (30 нива на девет места), колекцията с 30-те приятеля и
18 задачки за извън екрана. Поръчката отваря портата, не думата: буквите носят звезди,
но никога не препречват пътя.

**🔢 Числа** — 15 нива и 9 вида: броене, събиране, изваждане, редици, сравняване,
форми, повтарящи се шарки, число↔количество и „как се прави 8".

**✏️ Букви** — цялата азбука, 30 кирилски и 26 латински, с два начина на писане:
свободно рисуване и стъпка по стъпка с ред, посока, начало и край на всеки щрих.

**🎮 Игрички** — Лов на буквите (10 нива, шест неща за хващане, включително звук и
отговор на сметка), Памет, Сортиране и „Кое не е на място".

## Как решава какво да покаже

Играта пази малък модел на уменията на самото устройство. Слабото излиза малко
по-често. Премерено върху 40 000 тегления с дете, което бърка Ж и З: **10.6% → 12.6%**.
Достатъчно да помогне, недостатъчно да заприлича на разпит. Детето никога не вижда
число — родителят го чете с думи.

## Подход

Без таймери, без животи, без серии, без магазин, без реклами, без регистрация, без
класации. Грешката само поклаща и детето опитва пак веднага. Подсказките не струват
нищо. Звездите не са валута и не се харчат.

Спокойният режим спира украсата, но не и движението, което е самата игра. Вярното
никога не се показва само с цвят — има и знак.

## Поверителност

Нищо не се събира. Прогресът стои в браузъра на устройството.

Едно уточнение: изговорът минава през синтезатора на браузъра. Играта предпочита глас,
който работи на самото устройство, но ако единственият за езика е сървърен, думата
отива до тази услуга — от браузъра, не от играта. В екрана за родители пише кой глас
се използва и дали е местен.

## Съдържание

**1023 думи на български и 1012 на нидерландски**, в 27 категории. 622 от българските
са с картинка, а още 401 се чуват вместо да се виждат. Тук няма emoji изображения —
пазят се само кодовите точки, а рисунките идват от шрифта на устройството.

## Пускане и сглобяване

Отваряш `index.html`. За телефон в същата мрежа: `python3 -m http.server 8000 --bind 0.0.0.0`.

`dist/buki.html` е един самостоятелен файл — пращаш го и се отваря с двоен клик.

```sh
python3 build.py          # сглобява
python3 build.py --check  # само проверява съдържанието
node tools/test.js        # 100 проверки
```

Няма ES модули нарочно: браузърът ги отказва при `file://`, а изискването е играта да
се отваря с двоен клик.

## Принос

Виж [CONTRIBUTING.md](CONTRIBUTING.md). Добавянето на дума е един ред. На разказче —
един обект. На ниво в гората — един ред данни. Нито едно от трите не иска пипане на
кода.

## Лиценз

[MIT](LICENSE)
