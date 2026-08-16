#!/usr/bin/env python3
"""Сглобява Буки от изходните файлове.

Кодът се пише разделен по системи в src/ и styles/, а този скрипт го слепва.
Няма npm, няма bundler и няма ES модули — модулите се теглят по CORS и
браузърът ги отказва при file://, а изискването е играта да се отваря с
двоен клик.

Затова изходните файлове са обикновени скриптове без import/export. Този
скрипт ги слепва в определения по-долу ред и ги увива в един IIFE, тоест
всички споделят един обхват — точно както преди разделянето.

    python3 build.py            → app.js, styles.css, dist/buki.html
    python3 build.py --check    → само проверява съдържанието, не пише нищо

Кой файл е ръчен и кой генериран:

    ръчни      index.html, sw.js, build.py, src/**, styles/**
    генерирани app.js, styles.css, dist/**
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent

# Редът има значение: данните трябва да са преди двигателите, които ги четат
# при зареждане. Списъкът е явен, а не glob, защото glob подрежда по азбука.
SOURCES = [
    # съдържание, което не зависи от нищо
    "src/data/word-list.js",

    # ядро
    "src/core/config.js",
    "src/core/art.js",
    "src/data/languages.js",
    "src/data/words.js",
    "src/data/levels-reading.js",
    "src/core/storage.js",
    "src/core/state.js",
    "src/core/mastery.js",
    "src/core/speech.js",
    "src/core/audio.js",
    "src/core/dom.js",
    "src/ui/animations.js",

    # игри
    "src/games/phonics/phonics.js",
    "src/data/phonics-bg.js",
    "src/data/phonics-nl.js",
    "src/games/reading/arrange.js",
    "src/games/reading/choose.js",
    "src/games/reading/reading.js",
    "src/games/math/generators.js",
    "src/games/math/modes.js",
    "src/games/letter-hunt/catch.js",
    "src/data/forest-world.js",
    "src/games/forest/forest.js",

    # нива и пътища
    "src/data/levels.js",
    "src/core/tracks.js",

    # екрани
    "src/screens/play.js",
    "src/screens/registry.js",
    "src/screens/home.js",
    "src/screens/play-screen.js",
    "src/screens/letters.js",
    "src/screens/write.js",
    "src/screens/stars.js",
    "src/screens/parents.js",
    "src/games/writing/tracing.js",

    # свързване
    "src/core/router.js",
    "src/core/debug.js",
    "src/app.js",
]

STYLES = [
    "styles/tokens.css",
    "styles/base.css",
    "styles/components.css",
    "styles/screens.css",
    "styles/games.css",
    "styles/cards.css",
    "styles/responsive.css",
]

BANNER = "/* Генериран файл — не го редактирай. Източникът е в {}/ */\n"

VIEWPORT_GUARD = """<script>
/* Обвивката на Artifact слага своя секция head, затова подсигуряваме viewport. */
(function(){
  var m = document.querySelector('meta[name="viewport"]');
  if(!m){ m = document.createElement("meta"); m.name = "viewport"; document.head.appendChild(m); }
  m.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no");
})();
</script>
"""


def read(name):
    p = HERE / name
    if not p.exists():
        raise SystemExit("липсва изходен файл: " + name)
    return p.read_text(encoding="utf-8")


def bundle_js():
    parts = ['"use strict";', "(function(){"]
    for name in SOURCES:
        parts.append("\n/* ==== " + name + " ==== */")
        parts.append(read(name).rstrip())
    parts.append("\n})();")
    return BANNER.format("src") + "\n".join(parts) + "\n"


def bundle_css():
    return BANNER.format("styles") + "\n\n".join(read(n).rstrip() for n in STYLES) + "\n"


def single_file(html, css, js):
    """Един самостоятелен файл: всичко вътре, без service worker."""
    html = html.replace('<link rel="stylesheet" href="styles.css">',
                        "<style>\n" + css.rstrip() + "\n</style>")
    html = html.replace('<script src="app.js"></script>',
                        "<script>\n" + js.rstrip() + "\n</script>")
    return html


def artifact_file(html):
    """Изрязва document-таговете — обвивката на Artifact слага свои."""
    lines = html.split("\n")
    hs = next(i for i, l in enumerate(lines) if l.startswith("<title>"))
    he = next(i for i, l in enumerate(lines) if l.strip() == "</head>")
    bs = next(i for i, l in enumerate(lines) if l.strip() == "<body>")
    be = next(i for i, l in enumerate(lines) if l.strip() == "</body>")
    head = [l for l in lines[hs:he] if not l.startswith("<meta")]
    out = "\n".join(head + [""] + lines[bs + 1:be])
    out = out.replace('<div id="app"></div>', '<div id="app"></div>\n' + VIEWPORT_GUARD, 1)
    left = re.findall(r"(?i)<!doctype|</?html[ >]|</?head>|</?body>", out)
    if left:
        raise SystemExit("останали document-тагове: " + ", ".join(left))
    return out


ALPHA = {"bg": set("АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ"),
         "nl": set("ABCDEFGHIJKLMNOPQRSTUVWXYZ")}
VOWELS = {"bg": set("АЕИОУЪЮЯ"), "nl": set("AEIOUY")}


def content_report():
    """Брои съдържанието и намира счупени записи. Връща (числа, грешки)."""
    src = read("src/data/word-list.js")
    body = src[src.index("window.WORD_SOURCE"):]
    cats = dict(re.findall(r"  (\w+): `\n(.*?)\n  `", body, re.S))

    errors, seen_img = [], {}
    seen = {"bg": {}, "nl": {}}
    n = {"bg": 0, "nl": 0, "pic": 0, "audio": 0}

    for cat, block in cats.items():
        for entry in (e.strip() for e in re.split(r"[|\n]", block)):
            if not entry:
                continue
            tok = entry.split()
            if len(tok) != 2:
                errors.append(cat + ": «" + entry + "» не е «дума/woord картинка»")
                continue
            pair, img = tok
            sides = pair.split("/")
            if len(sides) != 2:
                errors.append(cat + ": «" + entry + "» липсва / между езиците")
                continue
            if img == "~":
                n["audio"] += 1
            else:
                n["pic"] += 1
                if img in seen_img:
                    errors.append("картинката " + img + " е и на " + seen_img[img] + ", и на " + pair)
                seen_img[img] = pair
            for lang, side in zip(("bg", "nl"), sides):
                if side in ("-", ""):
                    continue
                word = side.replace("-", "")
                n[lang] += 1
                bad = sorted(set(c for c in word if c not in ALPHA[lang]))
                if bad:
                    errors.append(lang + ": " + word + " има буква извън азбуката: " + "".join(bad))
                for syl in side.split("-"):
                    if not syl:
                        errors.append(lang + ": " + side + " има празна сричка")
                    elif not (set(syl) & VOWELS[lang]):
                        errors.append(lang + ": " + side + " → сричката «" + syl + "» няма гласна")
                if word in seen[lang]:
                    errors.append(lang + ": " + word + " се повтаря (" + seen[lang][word] + " и " + cat + ")")
                seen[lang][word] = cat

    n["categories"] = len(cats)
    n["reading"] = len(re.findall(r"\{ id:\d+", read("src/data/levels-reading.js")))
    n["math"] = len(re.findall(r"\{ id:\d+", read("src/games/math/generators.js")))
    levels = read("src/data/levels.js")
    n["forest"] = len(re.findall(r"\{ id:\d+,\s*theme:", levels))
    n["catch"] = len(re.findall(r"id:\d+,\s+minLen", levels))
    world = read("src/data/forest-world.js")
    n["friends"] = len(re.findall(r"who:", world))
    n["biomes"] = len(re.findall(r"sky1:", world))
    return n, errors


def main():
    n, errors = content_report()
    if errors:
        print("Съдържанието е счупено:\n")
        for e in errors[:40]:
            print("  ✗ " + e)
        if len(errors) > 40:
            print("  … и още " + str(len(errors) - 40))
        raise SystemExit(1)

    if "--check" in sys.argv:
        print("Съдържанието е наред: %d bg / %d nl думи." % (n["bg"], n["nl"]))
        return

    js, css = bundle_js(), bundle_css()
    html = read("index.html")

    (HERE / "app.js").write_text(js, encoding="utf-8")
    (HERE / "styles.css").write_text(css, encoding="utf-8")

    dist = HERE / "dist"
    dist.mkdir(exist_ok=True)
    standalone = single_file(html, css, js)
    (dist / "buki.html").write_text(standalone, encoding="utf-8")
    (dist / "buki-artifact.html").write_text(artifact_file(standalone), encoding="utf-8")

    print("Буки — сглобяването е готово\n")
    print("  думи            %d bg / %d nl в %d категории" % (n["bg"], n["nl"], n["categories"]))
    print("  от тях          %d с картинка, %d само звук" % (n["pic"], n["audio"]))
    print("  нива            четене %d · смятане %d · лов %d · гора %d"
          % (n["reading"], n["math"], n["catch"], n["forest"]))
    print("  гората          %d приятели, %d места" % (n["friends"], n["biomes"]))
    print("  счупени връзки  0")
    print("\n  изходни файлове %d js, %d css" % (len(SOURCES), len(STYLES)))
    print("  app.js          %s байта" % f"{len(js.encode()):,}")
    print("  styles.css      %s байта" % f"{len(css.encode()):,}")
    print("  dist/buki.html  %s байта" % f"{len(standalone.encode()):,}")


if __name__ == "__main__":
    main()
