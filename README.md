# Jahnavi Yelamanchi — portfolio

A static, two-column portfolio with a WebGL map connecting experience, projects,
research, open-source contributions, and education.

## Preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. No package installation or API keys are required.

## Edit content

- `data/portfolio.json` contains the 26 records, links, dates, and map coordinates.
- `scripts/build.py` generates `index.html`, including all static listings and embedded map data.
- `css/style.css` contains light/dark tokens and responsive layouts.
- `js/work-map.js` draws the wireframe in WebGL, with an SVG fallback.
- `js/portfolio.js` handles map filtering, navigation, and theme preference.
- `js/previews.js` provides desktop link previews from local content.

After editing content or the page template:

```sh
python3 scripts/build.py
```

Commit the generated `index.html` alongside the source. GitHub Pages serves the
site directly; there is no build dependency at deployment time.

## Map conventions

Rows: Data, Math, Algorithms, Architecture, Optimization, Runtime, Hardware,
Production. Columns: Represent, Compute, Communicate, Control, Measure.
Coordinates are zero-indexed `[row, column]`. They are editorial connections to
work described in each record, not proficiency scores. Relief highlights the
selected record and does not encode a quantitative measurement.

Dated entries appear when their date range includes the selected year. Undated
projects and contributions appear under **All years**, so no dates are invented.
Record kind and year filters combine. **Reset view** clears both.

Every record has a static anchor. Cell selection, record arrows, and **Locate on
map** provide multiple ways to explore. The nonselected work remains available
in the full listings. Seven additional projects expand under the project list;
deep links open the disclosure automatically.

## Accessibility and resilience

- Real HTML buttons, visible keyboard focus, labeled cells, and an evidence panel.
- Light/dark theme follows the device initially and remembers an explicit choice.
- Reduced-motion preference removes the cell transition; drawing stops offscreen.
- SVG fallback when WebGL is unavailable; the full record is readable without JS.
- Desktop previews support pointer hover and keyboard focus. Press Arrow Down
  from a previewed link to enter the preview, or pin it. Escape closes it.
- Touch devices keep normal link navigation; no hover-only information is needed.
- Previews use curated local excerpts, not embedded third-party pages.

## Content notes

This redesign preserves the prior repository's records and numerical claims.
It does not independently verify those claims or PR status. Founder-team details
were not present in the source content, so no company or ownership claims were
added. The old standalone AI-chat modules remain in the repository but are not
loaded by the new page.

Original portfolio acknowledgment: previously adapted from Jon Barron’s academic
website (https://jonbarron.info/). Current visual references: Paradigm and Sahaana
Shankar; custom implementation and interaction model.
