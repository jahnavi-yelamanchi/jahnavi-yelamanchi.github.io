"""Small, theme-aware SVG illustrations generated with the static page."""

def research_visual(kind):
 if kind == 'thesis':
  title = 'Conceptual sketch: vision and touch feed a world model that predicts a future state.'
  art = '''<text x="8" y="14">VISION</text><text x="102" y="14">TOUCH</text>
  <rect class="diagram-line" x="8" y="23" width="58" height="35"/>
  <path class="diagram-line" d="M12 52 28 36 38 45 48 33 62 49"/>
  <circle class="diagram-line" cx="53" cy="31" r="3"/>
  <rect class="diagram-line" x="102" y="23" width="58" height="35"/>
  <path class="diagram-accent" d="M108 43h7l4-7 5 15 5-22 5 14h20"/>
  <path class="diagram-line" d="M37 58v14h47v14m47-28v14H84"/>
  <rect class="diagram-line" x="34" y="86" width="100" height="25"/>
  <text x="84" y="102" text-anchor="middle">WORLD MODEL</text>
  <path class="diagram-line" d="M84 111v15m-3-3 3 3 3-3"/>
  <text x="84" y="140" text-anchor="middle">NEXT STATE</text>'''
  caption = 'Vision + touch'
 else:
  title = 'Mean top-1 retrieval accuracy: character TF-IDF 61.3%, BM25 55.6%, word TF-IDF 54.9%. RLBench held-out instructions, averaged over 80 reference galleries.'
  art = '<text x="8" y="14">TOP-1 ACCURACY</text>'
  for y, label, value in [(37,'CHAR TF-IDF',61.3),(78,'BM25',55.6),(119,'WORD TF-IDF',54.9)]:
   art += f'<text x="8" y="{y}">{label}</text><text x="160" y="{y}" text-anchor="end">{value}%</text><path class="diagram-line" d="M8 {y+13}h152"/><rect class="chart-bar" x="8" y="{y+8}" width="{152*value/100:.2f}" height="10"/>'
  caption = 'RLBench · 80 galleries'
 return f'<figure class="research-visual"><svg viewBox="0 0 168 150" role="img" aria-label="{title}">{art}</svg><figcaption>{caption}</figcaption></figure>'

def transformer_footer():
 # A schematic, not a live model trace. Sparse pixels keep the shape readable at rest.
 tokens = ''.join(f'<rect class="token-pixel" x="{18+c*10}" y="{58+r*12}" width="4" height="4" style="--delay:{(r+c)*-.45}s"/>' for r in range(5) for c in range(5) if (r*3+c*7)%5 != 0)
 attention = ''.join(f'<rect class="attention-pixel" x="{308+c*10}" y="{51+r*10}" width="6" height="6" style="--weight:{.2+((r*7+c*3)%7)/10:.1f};--delay:{-r*.5-c*.35}s"/>' for r in range(7) for c in range(r+1))
 network = ''.join(f'<path d="M628 {67+r*16} 663 {52+c*11} 698 {67+r*16}"/>' for r in range(3) for c in range(7))
 nodes = ''.join(f'<rect x="{x-2}" y="{y-2}" width="4" height="4"/>' for x,ys in [(628,range(67,100,16)),(663,range(52,119,11)),(698,range(67,100,16))] for y in ys)
 output = ''.join(f'<rect class="token-pixel" x="{892+c*10}" y="{58+r*12}" width="4" height="4" style="--delay:{-3-(r+c)*.45}s"/>' for r in range(5) for c in range(5) if (r+c*3)%5!=0)
 return f'''<footer class="site-footer">
 <div class="transformer-heading"><span>A little attention.</span><button id="toggle-footer-motion" aria-pressed="false" aria-label="Pause footer animation" hidden>Pause motion</button></div>
 <div class="transformer-art is-paused" id="transformer-art">
 <svg class="transformer-wide" viewBox="0 0 960 180" role="img" aria-labelledby="transformer-title transformer-description">
 <title id="transformer-title">A transformer block, in pixels</title>
 <desc id="transformer-description">Tokens become embeddings, pass through masked self-attention and a feed-forward network, with residual connections and normalization, to produce contextual representations. A schematic of information flow.</desc>
 <g class="flow-wires"><path d="M76 84h40m108 0h64m100 0h49m48 0h93m150 0h49m48 0h53"/>
 <path d="M250 84V24h211v34m76 26V24h264v34"/>
 <path d="m450 47 11 11 11-11m318 0 11 11 11-11"/></g>
 <g class="flow-packets"><path d="M76 84h40m108 0h64m100 0h49m48 0h93m150 0h49m48 0h53"/></g>
 <g class="block-outline"><rect x="116" y="48" width="108" height="72"/><rect x="288" y="38" width="100" height="92"/><rect x="437" y="58" width="48" height="52"/><rect x="578" y="38" width="150" height="92"/><rect x="777" y="58" width="48" height="52"/></g>
 <g class="embedding-lines"><path d="M132 65h76m-76 12h76m-76 12h76m-76 12h76"/></g>
 <g>{tokens}{attention}{output}</g>
 <g class="network-lines">{network}</g><g class="network-nodes">{nodes}</g>
 <g class="norm-labels"><text x="461" y="80">+</text><text x="461" y="97">NORM</text><text x="801" y="80">+</text><text x="801" y="97">NORM</text></g>
 <g class="block-labels"><text x="40" y="154">TOKENS</text><text x="170" y="154">EMBEDDINGS</text><text x="338" y="154">SELF-ATTENTION</text><text x="653" y="154">FEED-FORWARD</text><text x="915" y="154">CONTEXT</text></g>
 </svg>
 <svg class="transformer-compact" viewBox="0 0 360 150" role="img" aria-labelledby="attention-detail-title">
 <title id="attention-detail-title">Self-attention detail: tokens gather context through a masked attention matrix.</title>
 <g class="flow-wires"><path d="M76 84h60m88 0h56"/></g>
 <g class="flow-packets"><path d="M76 84h60m88 0h56"/></g>
 <g class="block-outline"><rect x="136" y="38" width="88" height="92"/></g>
 <g>{tokens}</g><g transform="translate(-160 0)">{attention}</g><g transform="translate(-600 0)">{output}</g>
 <g class="compact-labels"><text x="40" y="145">TOKENS</text><text x="180" y="145">ATTENTION</text><text x="315" y="145">CONTEXT</text></g>
 </svg></div>
 <div class="footer-meta"><span>© 2026 Jahnavi Yelamanchi</span><a href="#top">Back to the map ↑</a></div>
 </footer>'''
