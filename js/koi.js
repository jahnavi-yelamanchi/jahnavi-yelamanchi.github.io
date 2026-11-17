// Pen-and-ink koi pond: engraved water lines, a sunburst (moon at night), hatched koi.
// Simulation runs in pond units (S css px each); drawing scales by S * devicePixelRatio.
(() => {
  const S = 4;
  const canvas = document.getElementById('pond');
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (xs) => xs[(Math.random() * xs.length) | 0];
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const HUE = { red: '#cf3f27', orange: '#e07a26', gold: '#d3a02b', pink: '#d9849a' };

  let W, H, dpr, colors, sky, top, rows, fish = [], ripples = [], pair, t = 0;

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    colors = { bg: v('--pond'), ink: v('--ink-line'), water: v('--water-line'), rays: v('--sun-line'),
      pad: v('--pad'), white: v('--koi-white'), black: v('--koi-black'), moon: +v('--moon') };
  }
  const tint = (c) => c === 'white' ? colors.white : c === 'black' ? colors.black : HUE[c];

  function layer() {
    const c = document.createElement('canvas');
    c.width = canvas.width; c.height = canvas.height;
    const g = c.getContext('2d');
    g.setTransform(S * dpr, 0, 0, S * dpr, 0, 0);
    g.lineCap = 'round';
    return [c, g];
  }

  function line(g, x0, y0, x1, y1) { g.moveTo(x0, y0); g.lineTo(x1, y1); }

  // Static layers: sun/moon with rays (under fish), lily pads (over fish). Plus broken water rows.
  function paintLayers() {
    let g;
    [sky, g] = layer();
    const sx = W * 0.84, sy = H * 0.15, sr = Math.max(7, Math.min(14, Math.min(W, H) * 0.06));
    g.strokeStyle = colors.rays; g.lineWidth = 0.2;
    g.beginPath();
    for (let i = 0; i < 260; i++) {
      const a = (i / 260) * 6.283 + rand(-0.01, 0.01), r1 = sr + 1.5 + rand(3, colors.moon ? 14 : 34) * (1 - 0.4 * Math.abs(Math.sin(a * 3)));
      line(g, sx + Math.cos(a) * (sr + 1.5), sy + Math.sin(a) * (sr + 1.5), sx + Math.cos(a) * r1, sy + Math.sin(a) * r1);
    }
    g.stroke();
    g.beginPath(); g.arc(sx, sy, sr, 0, 6.283);
    g.fillStyle = colors.bg; g.fill();
    g.strokeStyle = colors.ink; g.lineWidth = 0.25; g.stroke();
    if (colors.moon) { // crescent: hatch the shadowed side
      g.save(); g.clip();
      g.beginPath(); g.arc(sx + sr * 0.45, sy - sr * 0.2, sr, 0, 6.283); g.rect(sx - sr * 2, sy - sr * 2, sr * 4, sr * 4);
      g.clip('evenodd');
      g.beginPath();
      for (let x = sx - sr * 2; x < sx + sr; x += 0.5) line(g, x, sy - sr, x + sr, sy + sr);
      g.strokeStyle = colors.rays; g.lineWidth = 0.18; g.stroke();
      g.restore();
    }

    [top, g] = layer();
    const n = Math.max(3, Math.round(W * H / 14000));
    for (let i = 0; i < n; i++) {
      const x = rand(8, W - 8), y = rand(8, H - 8), r = rand(6, 10), notch = rand(0, 6.28);
      g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, notch + 0.3, notch - 0.3 + 6.283); g.closePath();
      g.fillStyle = colors.bg; g.fill();
      g.globalAlpha = 0.2; g.fillStyle = colors.pad; g.fill(); g.globalAlpha = 1;
      g.strokeStyle = colors.pad; g.lineWidth = 0.35; g.stroke();
      g.beginPath();
      for (let j = 0; j <= 18; j++) {
        const a = notch + 0.3 + (j / 18) * (6.283 - 0.6);
        line(g, x, y, x + Math.cos(a) * r * 0.93, y + Math.sin(a) * r * 0.93);
      }
      g.lineWidth = 0.15; g.stroke();
      if (Math.random() < 0.5) { // lotus
        const lx = x + Math.cos(notch + 3) * r * 0.3, ly = y + Math.sin(notch + 3) * r * 0.3;
        g.strokeStyle = HUE.pink; g.lineWidth = 0.22;
        for (let p = 0; p < 6; p++) {
          const a = p * 1.047;
          g.beginPath(); g.ellipse(lx + Math.cos(a) * 1.4, ly + Math.sin(a) * 1.4, 1.6, 0.8, a, 0, 6.283);
          g.fillStyle = colors.bg; g.fill(); g.globalAlpha = 0.3; g.fillStyle = HUE.pink; g.fill(); g.globalAlpha = 1; g.stroke();
        }
        g.beginPath(); g.arc(lx, ly, 0.7, 0, 6.283); g.fillStyle = HUE.gold; g.fill();
      }
    }

    rows = [];
    for (let y = 1; y < H; y += 1.7) {
      const segs = [];
      for (let x = rand(-20, 0); x < W; ) { const len = rand(8, 70); segs.push([x, x + len]); x += len + rand(1, 5); }
      rows.push({ y, segs });
    }
  }

  const PROFILE = [2.3, 3.0, 3.3, 3.3, 3.1, 2.8, 2.4, 1.9, 1.4, 1.0];
  const SP = 1.8; // spine spacing
  const BREEDS = [
    { base: 'white', spots: ['red'] },          // kohaku
    { base: 'white', spots: ['red', 'black'] }, // sanke
    { base: 'black', spots: ['red', 'white'] }, // showa
    { base: 'orange', spots: ['gold'] },        // ochiba
    { base: 'gold', spots: ['orange'] },        // ogon
  ];

  function makeFish(x, y, base, spots, k) {
    const breed = base ? { base, spots: [] } : pick(BREEDS);
    const f = { x, y, a: rand(0, 6.28), v: rand(0.22, 0.4), turn: 0, phase: rand(0, 6.28), k: k || rand(0.85, 1.25),
      base: breed.base, spine: [], spots: spots || [] };
    if (!spots) for (let i = 0, n = 2 + (Math.random() * 3 | 0); i < n; i++)
      f.spots.push({ seg: (Math.random() * 6) | 0, off: rand(-0.5, 0.5), r: rand(0.5, 0.85), color: pick(breed.spots) });
    for (let i = 0; i < PROFILE.length; i++) f.spine.push({ x: x - Math.cos(f.a) * i * SP, y: y - Math.sin(f.a) * i * SP });
    return f;
  }

  function follow(f) {
    const sp = SP * f.k;
    f.spine[0].x = f.x; f.spine[0].y = f.y;
    for (let i = 1; i < f.spine.length; i++) {
      const p = f.spine[i - 1], q = f.spine[i], d = Math.hypot(p.x - q.x, p.y - q.y) || 1;
      if (d > sp) { q.x = p.x + (q.x - p.x) * sp / d; q.y = p.y + (q.y - p.y) * sp / d; }
    }
  }

  function swim(f) {
    f.turn = Math.max(-0.05, Math.min(0.05, f.turn * 0.97 + rand(-0.012, 0.012)));
    f.a += f.turn;
    const m = 18;
    if (f.x < m || f.x > W - m || f.y < m || f.y > H - m) f.a += wrap(Math.atan2(H / 2 - f.y, W / 2 - f.x) - f.a) * 0.04;
    f.phase += 0.22 + f.v * 0.4;
    const h = f.a + Math.sin(f.phase) * 0.28;
    f.x += Math.cos(h) * f.v; f.y += Math.sin(h) * f.v;
    follow(f);
  }

  // Tui and La: a white and a black koi circling a slowly wandering point.
  function swimPair() {
    pair.turn = Math.max(-0.02, Math.min(0.02, pair.turn * 0.98 + rand(-0.004, 0.004)));
    pair.dir += pair.turn;
    const m = pair.R + 20;
    if (pair.x < m || pair.x > W - m || pair.y < m || pair.y > H - m) pair.dir += wrap(Math.atan2(H / 2 - pair.y, W / 2 - pair.x) - pair.dir) * 0.05;
    pair.x += Math.cos(pair.dir) * 0.06; pair.y += Math.sin(pair.dir) * 0.06;
    pair.th += 0.012;
    pair.fish.forEach((f, i) => {
      const th = pair.th + i * Math.PI, wob = Math.sin(t * 0.35 + i) * 1.2;
      f.x = pair.x + Math.cos(th) * (pair.R + wob); f.y = pair.y + Math.sin(th) * (pair.R + wob);
      f.phase += 0.3;
      follow(f);
    });
  }

  // Spine frame: point, unit normal, unit forward, radius at fractional index u.
  function frameAt(f, u) {
    const s = f.spine, n = s.length, i = Math.min(n - 2, Math.floor(u)), w = u - i;
    const x = s[i].x + (s[i + 1].x - s[i].x) * w, y = s[i].y + (s[i + 1].y - s[i].y) * w;
    let dx = s[i].x - s[i + 1].x, dy = s[i].y - s[i + 1].y;
    const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    return { x, y, nx: -dy, ny: dx, dx, dy, r: (PROFILE[i] + (PROFILE[i + 1] - PROFILE[i]) * w) * f.k };
  }

  function drawFish(f) {
    const n = f.spine.length, k = f.k;
    const fr = []; for (let i = 0; i < n; i++) fr.push(frameAt(f, Math.min(i, n - 1.001)));
    const finColor = f.base === 'white' || f.base === 'black' ? colors.ink : HUE[f.base];

    // fins first so the body overlaps their roots; open lines, so the water shows through
    ctx.strokeStyle = finColor; ctx.lineWidth = 0.18;
    const tl = fr[n - 1], ta = Math.atan2(-tl.dy, -tl.dx) + Math.sin(f.phase + 2) * 0.35;
    ctx.beginPath();
    const tips = [];
    for (let j = 0; j <= 8; j++) {
      const e = j / 8 - 0.5, a = ta + e * 1.3, len = 6.8 * k * (0.65 + 0.7 * Math.abs(e));
      tips.push([tl.x + Math.cos(a) * len, tl.y + Math.sin(a) * len]);
      line(ctx, tl.x, tl.y, tips[j][0], tips[j][1]);
    }
    ctx.moveTo(tips[0][0], tips[0][1]); tips.forEach((p) => ctx.lineTo(p[0], p[1]));
    const p2 = fr[2], flap = 0.55 + Math.sin(f.phase * 1.3) * 0.3;
    for (const side of [-1, 1]) {
      const bx = p2.x + p2.nx * side * p2.r * 0.8, by = p2.y + p2.ny * side * p2.r * 0.8;
      const base = Math.atan2(p2.ny * side, p2.nx * side) + side * flap;
      for (let j = 0; j < 5; j++) {
        const a = base + side * (j - 2) * 0.18;
        line(ctx, bx, by, bx + Math.cos(a) * 4.6 * k, by + Math.sin(a) * 4.6 * k);
      }
    }
    ctx.stroke();

    // body outline through left edge, tail, right edge
    const pts = [[fr[0].x + fr[0].dx * fr[0].r * 0.85, fr[0].y + fr[0].dy * fr[0].r * 0.85]];
    for (const q of fr) pts.push([q.x + q.nx * q.r, q.y + q.ny * q.r]);
    pts.push([tl.x - tl.dx * 0.8, tl.y - tl.dy * 0.8]);
    for (let i = n - 1; i >= 0; i--) pts.push([fr[i].x - fr[i].nx * fr[i].r, fr[i].y - fr[i].ny * fr[i].r]);
    const body = new Path2D(), mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let m = mid(pts[pts.length - 1], pts[0]); body.moveTo(m[0], m[1]);
    for (let i = 0; i < pts.length; i++) { m = mid(pts[i], pts[(i + 1) % pts.length]); body.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }

    ctx.fillStyle = colors.bg; ctx.fill(body);
    ctx.save(); ctx.clip(body);
    if (f.base === 'white' || f.base === 'black') { ctx.fillStyle = tint(f.base); ctx.fill(body); }
    else { // colored koi: tint plus contour hatching across the body
      ctx.globalAlpha = 0.22; ctx.fillStyle = HUE[f.base]; ctx.fill(body); ctx.globalAlpha = 1;
      ctx.beginPath();
      for (let u = 0.2; u < n - 1; u += 0.32) { const q = frameAt(f, u); line(ctx, q.x + q.nx * q.r, q.y + q.ny * q.r, q.x - q.nx * q.r, q.y - q.ny * q.r); }
      ctx.strokeStyle = HUE[f.base]; ctx.lineWidth = 0.22; ctx.stroke();
    }
    for (const p of f.spots) { // patches: solid for black/white, diagonal hatch for color
      const q = frameAt(f, p.seg + 0.5), r = q.r * p.r, cx = q.x + q.nx * p.off * q.r, cy = q.y + q.ny * p.off * q.r;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.5, r, Math.atan2(q.dy, q.dx), 0, 6.283);
      if (p.color === 'white' || p.color === 'black') { ctx.fillStyle = tint(p.color); ctx.fill(); }
      else {
        ctx.clip(); ctx.globalAlpha = 0.35; ctx.fillStyle = HUE[p.color]; ctx.fill(); ctx.globalAlpha = 1;
        ctx.beginPath();
        for (let o = -r * 2; o < r * 2; o += 0.42) line(ctx, cx + o - r * 2, cy - r * 2, cx + o + r * 2, cy + r * 2);
        ctx.strokeStyle = HUE[p.color]; ctx.lineWidth = 0.17; ctx.stroke();
      }
      ctx.restore();
    }
    // scales: small arcs opening toward the tail
    ctx.beginPath();
    for (let u = 1; u < n - 2; u += 0.55) {
      const q = frameAt(f, u), back = Math.atan2(-q.dy, -q.dx);
      for (const o of [-0.55, -0.15, 0.25, 0.65]) {
        const cx = q.x + q.nx * o * q.r, cy = q.y + q.ny * o * q.r;
        ctx.moveTo(cx + Math.cos(back - 1.3) * 0.55, cy + Math.sin(back - 1.3) * 0.55);
        ctx.arc(cx, cy, 0.55, back - 1.3, back + 1.3);
      }
    }
    ctx.strokeStyle = f.base === 'black' ? colors.white : colors.ink; ctx.globalAlpha = 0.22; ctx.lineWidth = 0.1; ctx.stroke(); ctx.globalAlpha = 1;
    // engraved shading on one flank
    ctx.beginPath();
    for (let u = 0.4; u < n - 1; u += 0.45) { const q = frameAt(f, u); line(ctx, q.x - q.nx * q.r * 0.35, q.y - q.ny * q.r * 0.35, q.x - q.nx * q.r, q.y - q.ny * q.r); }
    ctx.strokeStyle = f.base === 'black' ? colors.white : colors.ink; ctx.globalAlpha = 0.3; ctx.lineWidth = 0.12; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.restore();

    ctx.strokeStyle = colors.ink; ctx.lineWidth = 0.28; ctx.stroke(body);
    const h = fr[0], ex = h.x + h.dx * h.r * 0.3, ey = h.y + h.dy * h.r * 0.3;
    ctx.fillStyle = f.base === 'black' ? colors.white : colors.ink;
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(ex + h.nx * side * h.r * 0.55, ey + h.ny * side * h.r * 0.55, 0.32, 0, 6.283); ctx.fill(); }
  }

  function frame() {
    t += 1 / 30;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(S * dpr, 0, 0, S * dpr, 0, 0);
    ctx.lineCap = 'round';

    // water: broken engraved rows that swell gently and ring outward around each koi
    const wakes = fish.concat(pair.fish).map((f) => f.spine[3]);
    ctx.beginPath();
    for (const row of rows) {
      const near = wakes.filter((p) => Math.abs(p.y - row.y) < 9);
      for (const [x0, x1] of row.segs) {
        for (let x = x0; x <= x1; x += 2.5) {
          let y = row.y + Math.sin(x * 0.07 + t * 0.5 + row.y * 0.4) * 0.3;
          for (const p of near) {
            const d2 = (x - p.x) ** 2 + (row.y - p.y) ** 2;
            if (d2 < 81) y += Math.sin(Math.sqrt(d2) * 1.1 - t * 5) * 0.5 * (1 - d2 / 81);
          }
          x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      }
    }
    ctx.strokeStyle = colors.water; ctx.lineWidth = 0.18; ctx.stroke();

    ctx.drawImage(sky, 0, 0, W, H);

    if (!still && Math.random() < 0.012) ripples.push({ x: rand(0, W), y: rand(0, H), r: 0 });
    ripples = ripples.filter((p) => (p.r += 0.1) < 12);
    for (const p of ripples) {
      ctx.globalAlpha = 0.7 * (1 - p.r / 12);
      ctx.beginPath();
      for (const rr of [p.r, p.r * 0.65]) { ctx.moveTo(p.x + rr, p.y); ctx.ellipse(p.x, p.y, rr, rr * 0.55, 0, 0, 6.283); }
      ctx.strokeStyle = colors.ink; ctx.lineWidth = 0.15; ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (!still) { fish.forEach(swim); swimPair(); }
    fish.forEach(drawFish); pair.fish.forEach(drawFish);
    ctx.drawImage(top, 0, 0, W, H);
  }

  function resize() {
    const w = innerWidth / S, h = innerHeight / S;
    if (w === W && Math.abs(h - H) < 20) return; // ignore mobile URL-bar jitter
    W = w; H = h; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    readColors(); paintLayers();
    if (!pair) {
      const n = Math.max(4, Math.min(8, Math.round(W * H / 2500)));
      for (let i = 0; i < n; i++) fish.push(makeFish(rand(20, W - 20), rand(20, H - 20)));
      pair = { x: W > 200 ? W * 0.13 : W * 0.5, y: H * 0.62, R: 20, th: 0, dir: rand(0, 6.28), turn: 0, fish: [
        makeFish(0, 0, 'white', [{ seg: 3, off: 0, r: 0.45, color: 'black' }], 1.05), // Tui
        makeFish(0, 0, 'black', [{ seg: 3, off: 0, r: 0.45, color: 'white' }], 1.05), // La
      ] };
    }
    for (const f of fish) { f.x = Math.min(f.x, W - 10); f.y = Math.min(f.y, H - 10); }
    pair.x = Math.min(pair.x, W - 40); pair.y = Math.min(pair.y, H - 40);
    if (still) { for (let i = 0; i < 90; i++) { fish.forEach(swim); swimPair(); } frame(); }
  }

  addEventListener('resize', resize);
  const retheme = () => { readColors(); paintLayers(); if (still) frame(); };
  addEventListener('themechange', retheme);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', retheme);
  resize();
  if (still) return;

  let last = 0, raf = 0;
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30fps
    last = now; frame();
  };
  raf = requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(loop);
  });
})();
