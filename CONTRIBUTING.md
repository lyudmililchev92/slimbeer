# Contributing

Content and code are deliberately kept apart, so most useful contributions need no
programming at all. Everything below is one file edit plus `python3 build.py`.

You need Python 3 for the build and Node for the tests. Neither is needed to *play*.

```sh
python3 build.py     # rebuild; fails loudly if you broke something
node tools/test.js   # 100 checks
```

If the build refuses, read what it says — it names the file and the entry.

---

## Add a word

One line in `src/data/word-list.js`, inside the right category:

```
КО-ТЕ/POES @cat
```

* Hyphens split the syllables. The word is the syllables joined, so a word and its
  syllables can never drift apart — they are the same string.
* **UPPERCASE**, and only letters from that language's alphabet. No `Ï`, no `É`.
* Every syllable needs at least one vowel.
* If the concept is not used in one language, put a dash there: `КРУ-ША/- 🍐`

The last field is the picture:

| | |
|---|---|
| `🍎` | an emoji — drawn by the device's own font |
| `@cat` | one of the twelve hand-drawn illustrations in `src/core/art.js` |
| `~` | no picture; the word is heard instead. This is how verbs and adjectives work |

**One emoji per word.** If it is already used elsewhere, "listen and choose" becomes
ambiguous — the build will tell you which word already has it.

Pick pictures a four-year-old names without hesitating. 🐕 is a dog. 🦮 is an argument.

## Add a translation

Same line, other side of the slash. Please write the word, do not translate it
mechanically — syllable breaks and first sounds differ between languages, and those
are exactly what the game teaches.

## Add a story

One object in `src/data/stories-bg.js` or `stories-nl.js`:

```js
{
  id: "buki-topka", level: 1, title: "Буки и топката", scene: "⚽",
  sentences: [
    "Буки има топка.",
    "Топката е синя.",
    "Буки играе с Мечо."
  ],
  questions: [
    { text: "Какъв цвят е топката?", answers: ["червена", "синя", "зелена"], correct: 1 },
    { type: "finish", text: "Буки има ___.", answers: ["топка", "книга", "шапка"], correct: 0 },
    { type: "order", text: "Кое стана първо?", answers: ["…", "…", "…"], correct: 1 }
  ]
}
```

* `level` 1–6. Levels 1–2 are at most four sentences; levels 5–6 are at least six.
  The build checks this — the progression should be real, not decorative.
* Every sentence ends with punctuation.
* Three or more answers, all different, `correct` is the index.
* **Use the forest characters.** Buki, Beer, Vos, Uil, Konijn, the squirrel, the
  penguin, the fairy, the beaver, the mouse. The world should feel like one place, not
  a pile of unrelated textbook texts.

Stories for the two languages are written separately, not translated. A story that
reads well in Bulgarian may need different sentences in Dutch.

## Add a forest level

One line in `src/data/levels.js`:

```js
{ id:31, theme:"winter", quest:12, minLen:6, maxLen:7, maxDifficulty:3,
  wordsToPass:8, nuts:14, pits:0.27, speed:1.35, zones:1.0,
  zoneKinds:["sum","count"], sumMax:10, countMax:10, movers:0.60, modes:["forest"] },
```

* `theme` is one of the nine in `src/data/forest-world.js`.
* `quest` indexes `src/data/forest-friends.js`. Each friend appears once — the tests
  check that.
* `speed` drives everything else. Gap width is derived from the jump arc, so a level
  **cannot** generate a gap that is too wide to clear. The tests recompute this for
  every level; if you break it, they fail before a child ever gets stuck.

## Add a forest friend

One entry in `src/data/forest-friends.js`. Name, home, what it wants, its letter and
one true fact, in both languages. The emoji, the item and the name must all be unused,
and `letter` must really be the first letter of the name in that language — the tests
check all four.

## Add a mission

One line in `src/data/missions.js`. Keep it doable indoors, with no special objects,
and remember the device verifies nothing.

## Add a language

Larger, but not deep:

1. `src/data/languages.js` — alphabet, letter sounds, all UI strings.
2. `src/data/word-list.js` — a third column would change the format, so a new language
   is currently a fork of the list. This is the one place the design does not scale
   gracefully; say so in your pull request rather than working around it.
3. `src/data/phonics-XX.js` — **do not copy another language's progression.** Which
   sounds are easy, which letters combine, what order they are taught in — all of it is
   language-specific.
4. `src/data/strokes-*.js` — if the script differs.
5. `src/data/stories-XX.js` — written, not translated.

## Code

* Plain scripts, one shared scope, no `import`/`export`. ES modules break `file://`,
  and "double-click and play" is a requirement, not a preference.
* Add new files to the `SOURCES` list in `build.py` in the right position — data before
  the engines that read it at load time.
* Top-level names are global. The build fails on collisions; take the error seriously,
  it once cost a white screen.
* No runtime dependencies. No CDN, no fonts, no analytics — not even privacy-friendly
  ones.
* Comments explain *why*, not *what*. If a number was measured, say what it was
  measured against.

## Report a problem

Useful reports, roughly in order of value:

* **A child got stuck.** What screen, what they tried, what happened. This is the most
  valuable report there is.
* **A word is wrong** — bad syllable break, wrong picture, unnatural translation.
* **A pronunciation is wrong** — say which word, which language, and which voice your
  device uses (the parent screen shows it).
* **Something is unreadable or too small** on your device — include the screen size.

## What will not be added

No accounts, no analytics, no ads, no streaks, no daily rewards, no lives, no shop, no
currency, no leaderboards, no push notifications, no timers that punish. Not because
they are hard, but because the game is for four-year-olds and none of that is for them.
