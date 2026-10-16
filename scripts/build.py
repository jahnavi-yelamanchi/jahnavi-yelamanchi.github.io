"""Regenerate the static portfolio from data/portfolio.json. No dependencies."""
from pathlib import Path
from html import escape as esc
import json
ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / 'data/portfolio.json').read_text())
records = DATA['records']
def e(value): return esc(str(value), quote=True)
def links(r):
 return ''.join(f'<a href="{e(x["url"])}">{e(x["label"].rstrip(" →↗"))} <span aria-hidden="true">↗</span></a>' for x in r['links'])
def row(r):
 image = f'<img class="paper-image" src="{e(r["image"])}" alt="Figure from {e(r["title"])}" loading="lazy" width="320" height="200">' if r.get('image') else ''
 details = ''.join(f'<li>{e(x)}</li>' for x in r['details'])
 body = f'<ul>{details}</ul>' if details else f'<p>{e(r["summary"])}</p>'
 return f'''<article class="record {r['kind']}" id="{e(r['id'])}">
 <div class="record-meta"><span>{e(r['date'])}</span>{image}</div>
 <div class="record-body"><h3>{e(r['title'])}</h3><p class="record-org">{e(r['org'])}</p>
 {f'<p class="authors">{e(r["authors"])}</p>' if r.get('authors') else ''}{body}
 <div class="record-links">{links(r)}<button class="map-link" data-record="{e(r['id'])}">Locate on map <span aria-hidden="true">↗</span></button></div>
 {f'<p class="record-tools">{e(" · ".join(r["tags"]))}</p>' if r['tags'] else ''}</div></article>'''
def section(id,title,kind,description=''):
 rows=[r for r in records if r['kind']==kind]
 return f'<section class="listing" id="{id}" aria-labelledby="{id}-title"><div class="section-heading"><h2 id="{id}-title">{title}</h2><span class="mono">{len(rows):02d} entries</span></div>{f"<p class=section-intro>{description}</p>" if description else ""}{"".join(row(r) for r in rows)}</section>'
projects=[r for r in records if r['kind']=='project']
featured_ids=['project-cutdown','project-forge','project-inferencebench','project-aegis']
featured=[next(r for r in projects if r['id']==i) for i in featured_ids]
remaining=[r for r in projects if r not in featured]
projects_html=f'''<section class="listing" id="projects" aria-labelledby="projects-title"><div class="section-heading"><h2 id="projects-title">Selected projects</h2><span class="mono">04 / 11</span></div><p class="section-intro">A few things I've built, from multimodal video to the kernels underneath.</p>{''.join(row(r) for r in featured)}<details class="more-projects"><summary>Seven more experiments <span aria-hidden="true">+</span></summary>{''.join(row(r) for r in remaining)}</details></section>'''
skills=''.join(f'<div><h3>{e(s["title"])}</h3><p>{e(" · ".join(s["tools"]))}</p></div>' for s in DATA['skills'])
html='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Jahnavi Yelamanchi — Between models and machines</title>
<meta name="description" content="Jahnavi Yelamanchi: ML systems and research engineering. Multimodal learning, hands-on robotics, GPU systems, and the work connecting them.">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<script>try{const t=localStorage.getItem('portfolio-theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}</script>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="page-shell">
<aside class="sidebar" aria-label="Introduction and navigation">
 <div class="identity"><a class="name" href="#top">Jahnavi<br>Yelamanchi<span class="name-dot">.</span></a><p class="role">ML systems &amp; research engineering</p></div>
 <p class="intro">I like understanding what happens between a model and the machine it runs on.</p>
 <p class="intro-secondary">Learning from touch and video.<br>Working with robots and GPU clusters.<br>Following the interesting questions.</p>
 <nav class="site-nav" aria-label="Main navigation">
 <a href="#top" aria-current="location"><span>The map</span><span class="nav-mark">↗</span></a>
 <a href="#projects"><span>Projects</span><span class="nav-mark">↗</span></a>
 <a href="#experience"><span>Experience</span><span class="nav-mark">↗</span></a>
 <a href="#open-source"><span>Open source</span><span class="nav-mark">↗</span></a>
 <a href="#research"><span>Research</span><span class="nav-mark">↗</span></a>
 <a href="#about"><span>About</span><span class="nav-mark">↗</span></a>
 </nav>
 <div class="sidebar-bottom"><div class="social-links"><a href="mailto:jahnavi.applc@gmail.com">Email ↗</a><a href="data/jahnavi_cv.pdf">Resume ↗</a><a href="https://github.com/jahnavi-yelamanchi/">GitHub ↗</a><a href="https://www.linkedin.com/in/jahnaviym">LinkedIn ↗</a></div>
 <div class="theme-control" role="group" aria-label="Color theme"><button data-theme-choice="light" aria-pressed="true">Light</button><span>/</span><button data-theme-choice="dark" aria-pressed="false">Dark</button><span class="local-note">New York</span></div></div>
</aside>
<main id="main">
<section class="atlas-section" id="top" aria-labelledby="map-title">
 <header class="atlas-heading"><div><h1 id="map-title">A map of my work</h1><p>Different questions. Connected work.</p></div><a class="year-range mono" href="#about">2020 — 2026 ↘</a></header>
 <div class="map-filters" role="group" aria-label="Filter map by type">
 <button data-kind="all" aria-pressed="true">All work</button><button data-kind="experience" aria-pressed="false">Experience</button><button data-kind="project" aria-pressed="false">Projects</button><button data-kind="research" aria-pressed="false">Research</button><button data-kind="oss" aria-pressed="false">OSS</button><button data-kind="education" aria-pressed="false">Education</button>
 </div>
 <div class="map-stage" id="map-stage"><canvas id="work-map" aria-hidden="true"></canvas><div id="map-labels"></div><div class="map-axis-note mono">What holds, transforms,<br>moves, decides &amp; measures.</div><p class="map-fallback" hidden>The interactive drawing is unavailable. Explore the same work using the filters and record controls below.</p><noscript><p class="map-fallback">Enable JavaScript to explore the map. All work is available in the listings below.</p></noscript></div>
 <div class="map-caption"><span id="map-context">Hover a cell to find the connections.</span><button id="reset-map" class="text-button">Reset view ↺</button></div>
 <div class="year-filter" role="group" aria-label="Filter dated work by year"><button data-year="all" aria-pressed="true">All years</button>''' + ''.join(f'<button data-year="{y}" aria-pressed="false">{y}</button>' for y in range(2020,2027)) + '''</div>
 <div class="evidence" id="evidence" aria-live="polite" aria-atomic="true">
 <div class="evidence-copy"><div class="evidence-meta mono" id="evidence-meta">Experience · 2025–26</div><h2 id="evidence-title">Learning through touch &amp; vision</h2><p id="evidence-summary">World models, tactile data, and robotics experiments at NYU CILVR.</p><a id="evidence-link" href="#experience-cilvr">View experience ↗</a></div>
 <div class="evidence-controls"><span id="evidence-count" class="mono"></span><div><button id="previous-record" aria-label="Previous record">←</button><button id="next-record" aria-label="Next record">→</button></div></div>
 </div>
 <div class="map-footnote"><span>Layers × roles. Select a cell; follow the evidence.</span><a href="#experience">The longer story ↓</a></div>
</section>
''' + projects_html + section('experience','Experience','experience','Research and applied work, from undergraduate study to hands-on robotics and ML systems.') + section('open-source','Open source','oss','Small changes in systems I care about. The pull requests tell the story.') + section('research','Publications & thesis','research') + '''
<section class="listing about" id="about" aria-labelledby="about-title"><div class="section-heading"><h2 id="about-title">A little more context</h2><span class="mono">2020 — 2026</span></div>
<div class="about-intro"><img src="images/headshot.png" alt="Jahnavi by a pond in autumn" width="461" height="471" loading="lazy"><div><h3>Between models<br>and machines.</h3><p>I'm drawn to the parts of ML that meet the real world: a robot learning through touch, a model waiting on memory, an experiment that needs to run reliably.</p><p>Six years of computer science and computer engineering have taken me through research, applied ML, and the systems underneath. I like being able to follow the problem across those boundaries.</p><p>Right now, I'm digging further into how hardware shapes a model, how to understand what it learns, and how to keep agents useful over longer tasks.</p></div></div>
<div class="education-list">''' + ''.join(row(r) for r in records if r['kind']=='education') + '''</div>
<details class="toolbox"><summary>Tools I work with <span aria-hidden="true">+</span></summary><div class="skills-grid">''' + skills + '''</div></details>
</section>
<section class="listing contact" id="contact" aria-labelledby="contact-title"><h2 id="contact-title">Good problems.<br>Good people.</h2><p>I'm interested in ML engineering and research roles, thoughtful teams, and ideas worth testing.</p><a class="contact-email" href="mailto:jahnavi.applc@gmail.com">Let's talk ↗</a><div class="contact-links"><a href="data/jahnavi_cv.pdf">Resume ↗</a><a href="https://scholar.google.com/citations?user=SkukPTgAAAAJ&amp;hl=en">Google Scholar ↗</a><a href="https://x.com/sugoi_loop">Elsewhere ↗</a></div></section>
<footer><span>© 2026 Jahnavi Yelamanchi</span><a href="#top">Back to the map ↑</a></footer>
</main></div>
<aside id="link-preview" class="link-preview" role="dialog" aria-label="Link preview" hidden><div class="preview-bar"><span id="preview-domain" class="mono"></span><div><button id="preview-pin" aria-label="Pin preview" aria-pressed="false">Pin</button><button id="preview-close" aria-label="Close preview">×</button></div></div><div id="preview-content"></div><a id="preview-open">Open destination ↗</a></aside>
<script id="portfolio-data" type="application/json">''' + json.dumps(DATA,ensure_ascii=False).replace('<','\\u003c') + '''</script>
<script type="module" src="js/portfolio.js"></script>
</body></html>
'''
(ROOT/'index.html').write_text(html)
print(f'Built index.html with {len(records)} linked records.')
