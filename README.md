# Jahnavi Yelamanchi

Personal site: one static page with a pen-and-ink koi pond drawn on a canvas behind it.

- `index.html`: all content. Edit it directly; there is no build step.
- `css/style.css`: type, layout, and light/dark color tokens (including the pond colors).
- `js/koi.js`: the pond animation. It pauses when the tab is hidden and draws a still frame for reduced motion.
- `js/theme.js`: light/dark toggle.

Preview locally:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

GitHub Pages serves `master` as is. The previous map-based site is kept on branch `archive/v1-map` (tag `v1-map`).
