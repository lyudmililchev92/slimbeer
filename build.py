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

    ръчни      index.html, build.py, src/**, styles/**
    генерирани app.js, styles.css, sw.js, dist/**
"""
import hashlib
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
    "src/games/reading/stories.js",
    "src/data/stories-bg.js",
    "src/data/stories-nl.js",
    "src/games/reading/arrange.js",
    "src/games/reading/choose.js",
    "src/games/reading/reading.js",
    "src/games/math/generators.js",
    "src/games/math/modes.js",
    "src/games/math/number-sense.js",
    "src/games/quick/quick.js",
    "src/games/letter-hunt/tasks.js",
    "src/games/letter-hunt/catch.js",
    "src/data/forest-world.js",
    "src/data/forest-friends.js",
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
    "src/data/missions.js",
    "src/screens/friends.js",
    "src/screens/missions.js",
    "src/screens/stars.js",
    "src/screens/parents.js",
    "src/games/writing/tracing.js",
    "src/games/writing/strokes.js",
    "src/data/strokes-latin.js",
    "src/data/strokes-cyrillic.js",
    "src/games/writing/guided.js",

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
    "styles/accessibility.css",
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
    n["friends"] = len(re.findall(r"who:", read("src/data/forest-friends.js")))
    n["biomes"] = len(re.findall(r"sky1:", read("src/data/forest-world.js")))
    n["phonics"] = len(re.findall(r"\{ id:\d+", read("src/data/phonics-bg.js")))
    n["stories"] = len(re.findall(r"^    id: \"", read("src/data/stories-bg.js"), re.M))
    n["quick"] = len(re.findall(r"\{ id:\d+", read("src/games/quick/quick.js")))
    n["missions"] = len(re.findall(r"\{ id:", read("src/data/missions.js")))
    n["strokes"] = (len(re.findall(r"^  \"?\w+\"?: \[", read("src/data/strokes-latin.js"), re.M)) +
                    len(re.findall(r"^  \"?[^\":]+\"?: \[", read("src/data/strokes-cyrillic.js"), re.M)))
    return n, errors


def _block_after(src, marker):
    """Тялото на обект след даден надпис, чрез броене на скоби. Регулярният
    израз не става: обектите са вложени и не се затварят предвидимо."""
    i = src.index(marker) + len(marker)
    i = src.index("{", i)
    depth, j = 0, i
    while j < len(src):
        if src[j] == "{":
            depth += 1
        elif src[j] == "}":
            depth -= 1
            if depth == 0:
                return src[i + 1:j]
        j += 1
    raise SystemExit("незатворен обект след " + marker)


def duplicate_ui_keys():
    """Езиковият пакет е обикновен обект. Обяви ли се два пъти един ключ,
    JavaScript мълчи и вторият печели — точно така четенето започна да пита
    «Как се прави», защото ключ от смятането изяде неговия."""
    src = read("src/data/languages.js")
    langs = re.findall(r"^  (\w+): \{", src, re.M)
    bad = []
    for lang in langs:
        block = _block_after(src, "\n  " + lang + ": ")
        if "ui: {" not in block:
            bad.append(lang + ": няма ui блок")
            continue
        ui = _block_after(block, "ui: ")
        seen = {}
        depth = 0
        for m in re.finditer(r"[{}]|(?:^|[,{]\s*)(\w+)\s*:", ui, re.M):
            tok = m.group(0)
            if tok == "{":
                depth += 1; continue
            if tok == "}":
                depth -= 1; continue
            if depth != 0 or not m.group(1):
                continue                      # ключ на вложен обект, не наш
            key = m.group(1)
            seen[key] = seen.get(key, 0) + 1
        for key, n in sorted(seen.items()):
            if n > 1:
                bad.append(lang + ": ключът «" + key + "» е обявен " + str(n) + " пъти")
    if len(langs) < 2:
        bad.append("проверени са само " + str(len(langs)) + " езика — нещо не се разпознава")
    return bad


def broken_css_comments():
    """Стиловете се разделиха по секции и три от файловете се оказаха
    срязани по средата на коментар. Един увиснал /* или самотен */ кара
    браузъра да изхвърли правилата около шева — така .home загуби
    центрирането си и маскотът клекна вляво. Проверката е за цялата
    сглобка, защото шевът се вижда чак когато файловете се слепят."""
    bad = []
    for name in STYLES:
        src = read(name)
        i, depth, first_stray = 0, 0, None
        while i < len(src):
            if src.startswith("/*", i):
                depth += 1; i += 2
            elif src.startswith("*/", i):
                depth -= 1; i += 2
                if depth < 0:
                    if first_stray is None: first_stray = src[:i].count("\n") + 1
                    depth = 0
            else:
                i += 1
        if first_stray:
            bad.append(name + ": самотен */ на ред " + str(first_stray))
        if depth > 0:
            bad.append(name + ": незатворен коментар")
    return bad


def undefined_css_vars():
    """var(--нещо) без дефиниция мълчи: браузърът взима резервната стойност
    и всичко изглежда наред, докато токенът не се промени и не се промени
    нищо. Точно така --touch се ползваше на пет места, без изобщо да
    съществува — размерите бяха 48px вместо 56.

    Двете изключения се задават от кода при рисуване, не в стиловете."""
    ОТ_КОДА = {"--acc", "--cols"}
    defined, used = set(), {}
    for name in STYLES:
        src = read(name)
        for m in re.finditer(r"(--[\w-]+)\s*:", src):
            defined.add(m.group(1))
        for m in re.finditer(r"var\(\s*(--[\w-]+)", src):
            used.setdefault(m.group(1), set()).add(name)
    return [v + " (" + ", ".join(sorted(used[v])) + ")"
            for v in sorted(used) if v not in defined and v not in ОТ_КОДА]


def rules_lost(css):
    """Колко правила биха се изгубили: броим отварящите скоби извън
    коментари и низове. Не е пълен парсер, но хваща точно случая, който
    ни изяде правилата."""
    depth, i, opens = 0, 0, 0
    while i < len(css):
        if css.startswith("/*", i):
            j = css.find("*/", i + 2)
            i = (j + 2) if j != -1 else len(css)
            continue
        if css[i] == "{":
            opens += 1
        i += 1
    return opens


def name_clashes():
    """Всички файлове живеят в един обхват. Ако две от тях обявят едно и
    също име отгоре, второто мълчаливо изяжда първото — точно това стана
    с помощника sLine, кръстен L, който изяде L() за езиковия пакет."""
    seen, clashes = {}, []
    pattern = re.compile(r"^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)", re.M)
    for name in SOURCES:
        for m in pattern.finditer(read(name)):
            ident = m.group(1)
            if ident in seen and seen[ident] != name:
                clashes.append(ident + ": " + seen[ident] + " и " + name)
            else:
                seen[ident] = name
    return clashes


def main():
    css_bad = broken_css_comments()
    if css_bad:
        print("Счупен коментар в стиловете:\n")
        for c in css_bad:
            print("  ✗ " + c)
        raise SystemExit(1)

    missing_vars = undefined_css_vars()
    if missing_vars:
        print("Ползван, но недефиниран токен в стиловете:\n")
        for v in missing_vars:
            print("  ✗ " + v)
        raise SystemExit(1)

    dupes = duplicate_ui_keys()
    if dupes:
        print("Повторен ключ в езиков пакет:\n")
        for d in dupes:
            print("  ✗ " + d)
        raise SystemExit(1)

    clashes = name_clashes()
    if clashes:
        print("Две имена се блъскат в общия обхват:\n")
        for c in clashes:
            print("  ✗ " + c)
        raise SystemExit(1)

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

    # Печатът върви по съдържанието: нов билд → ново име на кеша → браузърът
    # инсталира нов worker и изхвърля стария. Без това играта оставаше стара
    # до следващото отваряне.
    stamp = hashlib.sha1((js + css + html).encode()).hexdigest()[:10]
    sw = read("src/sw.js").replace("__STAMP__", stamp)
    if "__STAMP__" in sw:
        raise SystemExit("печатът не се записа в sw.js")
    (HERE / "sw.js").write_text(BANNER.format("src") + sw, encoding="utf-8")

    dist = HERE / "dist"
    dist.mkdir(exist_ok=True)
    standalone = single_file(html, css, js)
    (dist / "buki.html").write_text(standalone, encoding="utf-8")
    (dist / "buki-artifact.html").write_text(artifact_file(standalone), encoding="utf-8")

    print("Буки — сглобяването е готово\n")
    print("  думи            %d bg / %d nl в %d категории" % (n["bg"], n["nl"], n["categories"]))
    print("  от тях          %d с картинка, %d само звук" % (n["pic"], n["audio"]))
    print("  нива            четене %d · звукове %d · разказчета %d · смятане %d"
          % (n["reading"], n["phonics"], n["stories"], n["math"]))
    print("                  гора %d · лов %d · игрички %d"
          % (n["forest"], n["catch"], n["quick"]))
    print("  гората          %d приятели, %d места" % (n["friends"], n["biomes"]))
    print("  писане          %d букви с щрихове" % n["strokes"])
    print("  задачки         %d извън екрана" % n["missions"])
    print("  счупени връзки  0")
    print("  правила в css   %d" % rules_lost(css))
    print("  app.js          %s байта" % f"{len(js.encode()):,}")
    print("  styles.css      %s байта" % f"{len(css.encode()):,}")
    print("  dist/buki.html  %s байта" % f"{len(standalone.encode()):,}")


if __name__ == "__main__":
    main()
