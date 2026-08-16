#!/usr/bin/env python3
"""Сглобява едно-файлова версия на играта.

Проектът се пише в няколко файла — index.html, styles.css, words.js и
game.js — защото
така се работи по-лесно. Но за някои начини на разпространение трябва
всичко да е в един файл (например Claude Artifact, който слага собствена
<head> секция, или изпращане на един файл по AirDrop).

    python3 build.py            -> letterbeer-artifact.html (за Artifact)
    python3 build.py --single   -> letterbeer.html (пълен самостоятелен файл)
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent

VIEWPORT_GUARD = """<script>
/* Обвивката на Artifact слага своя секция head, затова подсигуряваме viewport. */
(function(){
  var m = document.querySelector('meta[name="viewport"]');
  if(!m){ m = document.createElement("meta"); m.name = "viewport"; document.head.appendChild(m); }
  m.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no");
})();
</script>
"""


def read(name: str) -> str:
    return (HERE / name).read_text(encoding="utf-8")


def build(single: bool) -> tuple[str, str]:
    html = read("index.html")
    css = read("styles.css")
    words = read("words.js")
    js = read("game.js")

    html = html.replace('<link rel="stylesheet" href="styles.css">',
                        "<style>\n" + css.rstrip() + "\n</style>")
    html = html.replace('<script src="words.js"></script>',
                        "<script>\n" + words.rstrip() + "\n</script>")
    html = html.replace('<script src="game.js"></script>',
                        "<script>\n" + js.rstrip() + "\n</script>")

    if single:
        return html, "letterbeer.html"

    # Artifact-версия: без document-таговете и без meta, които обвивката слага сама.
    lines = html.split("\n")
    hs = next(i for i, l in enumerate(lines) if l.startswith("<title>"))
    he = next(i for i, l in enumerate(lines) if l.strip() == "</head>")
    bs = next(i for i, l in enumerate(lines) if l.strip() == "<body>")
    be = next(i for i, l in enumerate(lines) if l.strip() == "</body>")
    head = [l for l in lines[hs:he] if not l.startswith("<meta")]
    out = "\n".join(head + [""] + lines[bs + 1:be])
    out = out.replace('<div id="app"></div>', '<div id="app"></div>\n' + VIEWPORT_GUARD, 1)

    leftovers = re.findall(r"(?i)<!doctype|</?html[ >]|</?head>|</?body>", out)
    if leftovers:
        raise SystemExit("останали document-тагове: " + ", ".join(leftovers))
    return out, "letterbeer-artifact.html"


if __name__ == "__main__":
    text, name = build("--single" in sys.argv)
    (HERE / name).write_text(text, encoding="utf-8")
    print(f"{name}: {len(text.encode()):,} байта")
