# SlimBeer

A learning game for children aged roughly 4–7, in **Dutch and Bulgarian**.
Reading, counting, letter writing and a letter-catching game — one HTML file, no build step, no
dependencies, no backend, works offline.

**Play:** https://lyudmililchev92.github.io/slimbeer/

The game is called *Letterbeer* in Dutch and *Буквик* in Bulgarian.

---

## What is in it

**Reading — 12 levels, 6 game types**

| Game type | What the child does |
|---|---|
| Build the word | Drags or taps scrambled letters into place |
| Syllables | Same, but with syllables instead of letters |
| Missing letter | Picks the letter that completes the word |
| First letter | Picks the letter a word starts with |
| Listen and choose | Hears a word, picks the matching picture |
| Read and choose | Reads a written word, picks the matching picture |

**Forest — 20 levels across six seasons, a side-scrolling platformer.** Boekie runs to the right
on his own; the child's only control is a tap to jump, plus a second jump in
mid-air. Letters float at jump height, so nothing is picked up by accident —
every letter is a decision. Platforms to land on, bouncy mushrooms, and water
gaps. Falling in costs nothing: a gust carries him across and he runs on.

Every level is a small errand. A forest friend waits near the start with a
speech bubble showing what they need, and waits again at the gate: a squirrel
wants acorns, a bird wants eggs, a bee wants flowers, a bear wants honey, a
dragon wants crystals, a penguin wants ice, a snowman wants snowflakes, a
beaver wants sticks — twenty friends, twenty things to gather. The orders grow
with the levels, from three acorns to eighteen sticks.

Finding them all opens the star-gate. The word floating around the level is a
**bonus**: complete it and you get extra stars, skip it and the level still
ends. Letters are the seasoning here, not the meal.

From level three the forest holds **challenge spots**, marked by a wooden sign
with three platforms below. Land on the right one:

| Sign shows | The child works out |
|---|---|
| Seven acorns drawn on the board | how many — counting |
| `4 + 4` | the sum |
| The word's picture | the letter it starts with |
| A colour | which of three berries matches |

All are optional and pay bonus stars, so a child who ignores them still
finishes the level.

The seasons change as the levels go: meadow, forest, autumn, dusk with a low
orange sun, night with stars and fireflies, then winter — snow on the tree
crowns, drifts along the ground, pale ice in the water gaps. Later levels add
platforms that drift up and down. Water
gaps are sized from the actual jump arc, so every one of them can be cleared
with a single jump.

**Letter hunt — 6 levels, one 2D game.** Boekie moves along the bottom,
letters drift down, and the child catches the one the word needs next. No
timer, no lives, no game over: a wrong catch just bounces, a missed letter
comes back around.

**Counting — 10 levels, 5 game types**: counting objects, addition,
subtraction, number sequences, and comparing groups. Problems are generated
from level rules, so they never repeat.

**Writing**: trace a letter with a finger, mouse or stylus. Ink turns purple
inside the letter and pink outside, so the child sees immediately when the
stroke leaves the shape. Both alphabets — 26 Latin letters and 30 Cyrillic.

**758 words** across 23 categories. 593 have a picture; 165 more have no
picture and are heard instead, which is what makes verbs and adjectives
possible at all.

Progress is kept separately per language and per subject. Stars are shared.

## Design notes

The game avoids the usual engagement mechanics: no timers, no streak pressure,
no lives, no shop, no currency, no ads, no accounts. A wrong answer shakes
gently and can be retried at once. Hints never cost anything.

Words are stored already split into syllables (`КО-ТЕ/POES @cat`), so the word
and its syllables cannot drift apart — they are the same string. A validator
checks that every syllable holds exactly one vowel.

## Privacy

Nothing is collected. No analytics, no cookies, no accounts, no network calls.
Progress lives in `localStorage` on the device and never leaves it.

One honest caveat: the spoken words use the browser's speech synthesis. The
game prefers a voice that runs on the device, but if the only voice available
for a language is a server-side one, the word is sent to that service by the
browser. The parent screen shows which voice is in use.

## Files

| File | What it is |
|---|---|
| `index.html` | the shell — a handful of tags |
| `styles.css` | all the styling |
| `game.js` | everything else: data, screens, game modes |
| `sw.js` | offline caching, only used over HTTPS |
| `build.py` | glues the three into one file |

Nothing is compiled and nothing is installed. `python3 build.py --single`
produces `letterbeer.html`, a single self-contained file you can send to a
phone; `python3 build.py` produces the trimmed variant used for hosting inside
another page.

## Running it

Open `index.html`. The three files have to sit in the same folder.

For a phone on the same network:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
# then open http://<your-ip>:8000 on the phone
```

Serving it over HTTPS additionally registers a service worker, so after the
first visit the game works with no connection at all.

## About the pictures

This repository contains **no emoji artwork**. The word list stores Unicode
code points; the pictures you see are drawn by the font on your own device —
Apple, Google, Microsoft and others each draw them differently. That artwork
belongs to those vendors and is not covered by this licence, which is also why
there are no screenshots here.

Twelve illustrations (cat, fish, sun, house, apple, ball, car, tree, flower,
moon, cloud, boat) and the mascot are hand-written inline SVG and are covered
by the licence below.

No fonts are bundled; the game uses whatever rounded system font is available.

## Licence

[MIT](LICENSE) — use it, change it, share it.

---

# SlimBeer (на български)

Образователна игра за деца на 4–7 години, на **нидерландски и български**.
Четене, смятане и писане на букви. Един HTML файл, без инсталация, работи и
офлайн.

**Играй:** https://lyudmililchev92.github.io/slimbeer/

## Какво има вътре

**Четене** — 12 нива и 6 вида задачи: подреждане на буквите, подреждане на
срички, липсваща буква, с коя буква започва, чуй и избери картинка, прочети и
избери картинка.

**В гората** — 20 нива в шест сезона, страничен платформинг. Буки е рисуван
на място: крачета в бяг, развяващ се шал, мигане и свиване при кацане.
Златното перо дава седем секунди летене с четворен скок. Буки тича сам надясно, а
детето има едно действие: докосване за скок, плюс втори скок във въздуха.
Буквите висят на височина за скок, тоест нищо не се взима случайно — всяка
буква е избор. Има площадки, гъби-пружини и водни дупки. Падането не струва
нищо: полъх го пренася отвъд и продължава.

Всяко ниво е малка поръчка. Горски приятел чака в началото с балонче какво му
трябва и пак чака при портата: катеричка иска жълъди, птичка иска яйца, пчела
иска цветя, мечок иска мед, дракон иска кристали, пингвин иска ледчета,
снежко иска снежинки, бобър иска клечки — двайсет приятели, двайсет неща за
събиране. Поръчките растат с нивата: от три жълъда до осемнайсет клечки.

Събереш ли ги, портата се отваря. Думата, която виси наоколо, е **бонус** —
събереш ли я, взимаш още звезди; подминеш ли я, нивото пак свършва. Буквите
тук са подправката, не ястието.

От трето ниво се появяват **предизвикателства** — дървена табела и три
площадки под нея. Стъпва се на вярната:

| На табелата | Детето решава |
|---|---|
| Седем нарисувани жълъда | колко са — броене |
| `4 + 4` | сметката |
| Картинката на думата | с коя буква започва |
| Цвят | кой от трите плода е същият |

Всички са по избор и дават бонус звезди, тоест дете, което ги подмине, пак
завършва нивото.

Сезоните се сменят с нивата: ливада, гора, есен, залез с ниско оранжево
слънце, нощ със звезди и светулки и накрая зима — сняг по короните, преспи по
земята, светъл лед във водните дупки. По-късните нива добавят площадки, които
се движат нагоре-надолу.
Дупките с вода са премерени по дъгата на скока — всяка се прескача с един скок.

**Лов на буквите** — 6 нива, 2D игра. Буки се движи долу, буквите падат
отгоре и детето хваща тази, която е наред. Без таймер, без животи и без край
на играта: сгрешена буква само отскача, пропусната се връща по-късно.

**Смятане** — 10 нива и 5 вида: броене, събиране, изваждане, редици и
сравняване. Задачите се раждат от правилата на нивото, затова не се повтарят.

**Писане** — детето проследява буквата с пръст. Мастилото е лилаво в буквата и
розово извън нея, така че веднага вижда, когато излезе. И двете азбуки.

**758 думи** в 23 категории. 593 са с картинка, а още 165 се чуват вместо да
се виждат — това позволява глаголи и прилагателни, за които картинка няма.

Прогресът е отделен за всеки език и за всеки предмет. Звездите са общи.

## Подход

Без таймери, без животи, без серии, без магазин, без реклами, без регистрация.
Грешката само поклаща буквата и детето опитва пак веднага. Подсказките не
струват нищо.

## Поверителност

Нищо не се събира. Прогресът стои в браузъра на устройството.

Едно уточнение: изговорът минава през синтезатора на браузъра. Играта
предпочита глас, който работи на самото устройство, но ако единственият
наличен глас за езика е сървърен, думата отива до тази услуга. В екрана за
родители пише кой глас се използва.

## Картинките

Тук няма emoji изображения — пазят се само кодовите точки, а рисунките идват
от шрифта на устройството и принадлежат на Apple, Google и другите. Затова
няма и екранни снимки. Дванайсетте рисувани илюстрации и маскотът са ръчно
писан SVG и се покриват от лиценза.

## Лиценз

[MIT](LICENSE)
