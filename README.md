# Jahnavi Yelamanchi — portfolio

A static, two-page portfolio with one shared sidebar: `index.html` contains the
viewport-sized WebGL map; `work.html` contains the scrollable projects, experience,
open source, research, about, and contact sections.

## Preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/ for the map, or http://127.0.0.1:4173/work.html for the work page. No package installation or API keys are required.

## Edit content

- `data/portfolio.json` contains the 27 records, links, dates, and map coordinates.
- `scripts/visuals.py` supplies research diagrams and the pixel transformer footer.
- `js/footer-motion.js` handles footer pause, reduced motion, and offscreen behavior.
- `scripts/build.py` generates `index.html` and `work.html`, sharing the sidebar and embedded record data.
- `css/style.css` contains light/dark tokens and responsive layouts.
- `js/work-map.js` draws the wireframe in WebGL, with an SVG fallback.
- `js/portfolio.js` handles shared navigation and theme preference.
- `js/map-controller.js` handles map filtering, selection, and incoming record links.
- `js/previews.js` provides desktop link previews from local content.

After editing content or the page template:

```sh
python3 scripts/build.py
```

Commit both generated HTML pages alongside the source. GitHub Pages serves the
site directly; there is no build dependency at deployment time.

## Map conventions

Rows: Data, Math, Algorithms, Architecture, Optimization, Runtime, Hardware,
Production. Columns: Represent, Compute, Communicate, Control, Measure.
Coordinates are zero-indexed `[row, column]`. They are editorial connections to
work described in each record, not proficiency scores. Relief highlights the
selected record and does not encode a quantitative measurement.

Dated entries appear when their date range includes the selected year. Undated
projects and contributions appear under **All years**, so no dates are invented.
Record kind and year filters combine. **Reset view** in the map header clears both
and dismisses the selected record.

Every record has a static anchor. Hover or keyboard focus on a row or column name
shows its definition; tapping a label also opens it. Column definitions and examples
are adapted from the supplied StaffML reference. Escape dismisses the definition.
Hovering or focusing a tile previews matching work. Click, tap, or Enter pins that
selection so other tile hovers and focus changes leave it unchanged. Selecting a
different tile switches the pin; selecting the pinned tile again unpins it.
Record arrows and **Locate on map** provide additional ways to explore; locating a
record pins its preview. Reset and filters clear the pin. All work remains available
in the full listings. Seven additional projects expand under the project list;
deep links open the disclosure automatically.

## Accessibility and resilience

- Real HTML buttons, visible keyboard focus, labeled cells, and an evidence panel.
- Light/dark theme follows the device initially and remembers an explicit choice.
- Reduced-motion preference removes the cell transition and footer animation.
  The footer can also be paused manually; both animations stop offscreen.
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

The October 2026 arXiv entry and retrieval chart use the paper abstract at
https://arxiv.org/abs/2610.17549. The thesis illustration and transformer footer
are conceptual schematics, not experimental figures or live model traces.

Map links open `work.html#record-id`. Locate links return to
`index.html?record=record-id#top` with that record pinned. Legacy single-page
record and section hashes redirect to the work page. Desktop map layout reserves
space for its work preview and keeps the help line visible; very short windows
can scroll instead of clipping content.
