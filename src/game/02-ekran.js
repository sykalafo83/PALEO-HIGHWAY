  // =============================================================== EKRAN
  const screen = document.getElementById('screen');
  let sctx = screen.getContext('2d');
  const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
  const ctx = buf.getContext('2d');
  let S = 3;
  // Płótno ma rozdzielczość fizycznych pikseli monitora (devicePixelRatio), więc przy skalowaniu Windows
  // (125%, 150%) przeglądarka go nie rozciąga — piksele i skanlinie CRT zostają równe.
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    // dopasowanie do okna (bez zaokrąglania do całości) — gra wypełnia pełną wysokość, wolne miejsce zostaje tylko po bokach
    const k = Math.min(innerWidth * dpr / W, innerHeight * dpr / H);
    S = k;
    screen.width = Math.round(W * S); screen.height = Math.round(H * S);
    screen.style.width = (screen.width / dpr) + 'px'; screen.style.height = (screen.height / dpr) + 'px';
    if (window.__paleoBooted) drawBezel();
  }
  matchMedia && (function watchDpr() {
    try { matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`).addEventListener('change', () => { resize(); watchDpr(); }, { once: true }); } catch (e) { }
  })();
  addEventListener('resize', resize); resize();

  // Font pikselowy nie ma polskich znaków — rysujemy literę bazową i dokładamy znak diakrytyczny.
  const DIAC = { 'Ą': ['A', 'ogonek'], 'Ć': ['C', 'acute'], 'Ę': ['E', 'ogonek'], 'Ł': ['L', 'stroke'], 'Ń': ['N', 'acute'],
    'Ó': ['O', 'acute'], 'Ś': ['S', 'acute'], 'Ź': ['Z', 'acute'], 'Ż': ['Z', 'dot'] };
  const PAD_FACE = { 0: ['A', '#3cb043'], 1: ['B', '#e03c31'], 2: ['X', '#2f6fdf'], 3: ['Y', '#e8b820'] };
  const PAD_NAMES = { 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT', 8: 'SELECT', 9: 'START', 10: 'L3', 11: 'R3', 16: 'HOME' };
  const TOKEN_ACT = { ok: 'attack', back: 'jump' };
  const PAD_BACK = 1;   // przycisk B — zawsze „wstecz” w menu
  function padBtnOf(action, pIdx) {
    if (action === 'back') return PAD_BACK;
    const M = PADMAPS[pIdx || 0];
    // „OK” w menu: przycisk ataku inny niż B (B zawsze cofa), a gdy go brak — START
    if (action === 'ok') { const b = M.attack.find(x => x !== PAD_BACK); return b !== undefined ? b : (M.start[0] !== undefined ? M.start[0] : null); }
    const m = M[TOKEN_ACT[action] || action]; return m && m.length ? m[0] : null;
  }
  Object.assign(PAD_NAMES, { 12: 'D▲', 13: 'D▼', 14: 'D◄', 15: 'D►' });
  // nazwa wpisu: przycisk, oś gałki (L/R = lewa/prawa gałka) albo krzyżak „hat”
  function padLabel(e) {
    if (typeof e === 'number') return PAD_NAMES[e] || ('B' + e);
    if (e[0] === 'a') {
      const ax = +e.slice(1, -1), neg = e.endsWith('-');
      if (ax < 4) return (ax < 2 ? 'L' : 'R') + (ax % 2 ? (neg ? '▲' : '▼') : (neg ? '◄' : '►'));
      return 'OŚ' + ax + (neg ? '-' : '+');
    }
    const v = +e.split(':')[1], dirs = ['▲', '▲►', '►', '►▼', '▼', '▼◄', '◄', '◄▲'];
    return 'HAT' + dirs[Math.round((v + 1) / HAT_STEP) % 8];
  }
  function padIconW(btn, px) { return PAD_FACE[btn] ? px * 1.25 : px * (0.75 * padLabel(btn).length + 0.6); }
  // rysuje ikonę przycisku pada (współrzędne ekranu w pikselach), zwraca szerokość
  function drawPadIcon(g, btn, x, y, px) {
    const w = btn === null ? px : padIconW(btn, px), cy = y + px * 0.5;
    g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
    if (btn === null) { g.fillStyle = '#808080'; g.font = `${px}px "Press Start 2P", monospace`; g.fillText('—', x + w / 2, cy); g.restore(); return w; }
    if (PAD_FACE[btn]) {
      const [l, c] = PAD_FACE[btn], r = px * 0.62;
      g.fillStyle = '#000'; g.beginPath(); g.arc(x + w / 2, cy, r + Math.max(1, px * 0.12), 0, Math.PI * 2); g.fill();
      g.fillStyle = c; g.beginPath(); g.arc(x + w / 2, cy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff'; g.font = `${Math.round(px * 0.72)}px "Press Start 2P", monospace`; g.fillText(l, x + w / 2 + px * 0.04, cy + px * 0.05);
    } else {
      const l = padLabel(btn), h = px * 1.15, r = px * 0.35;
      g.fillStyle = '#000'; g.fillRect(x - 1, cy - h / 2 - 1, w + 2, h + 2);
      g.fillStyle = '#505868'; g.beginPath(); g.moveTo(x + r, cy - h / 2); g.arcTo(x + w, cy - h / 2, x + w, cy + h / 2, r); g.arcTo(x + w, cy + h / 2, x, cy + h / 2, r);
      g.arcTo(x, cy + h / 2, x, cy - h / 2, r); g.arcTo(x, cy - h / 2, x + w, cy - h / 2, r); g.fill();
      // tekst + strzałki rysowane jako trójkąty (czcionka ma je bardzo małe)
      const arr = [...(l.match(/[▲▼◄►]+$/) || [''])[0]], t = l.slice(0, l.length - arr.length), aw = px * 0.62;
      g.font = `${Math.round(px * 0.6)}px "Press Start 2P", monospace`;
      const tw = t ? g.measureText(t).width : 0, tot = tw + arr.length * aw + (t && arr.length ? px * 0.1 : 0);
      let ax = x + (w - tot) / 2;
      g.fillStyle = '#fff';
      if (t) { g.textAlign = 'left'; g.fillText(t, ax, cy + px * 0.05); ax += tw + (arr.length ? px * 0.1 : 0); }
      arr.forEach(ch => {
        const c = ax + aw / 2, r = px * 0.26;
        g.beginPath();
        if (ch === '▲') { g.moveTo(c, cy - r); g.lineTo(c + r, cy + r * 0.8); g.lineTo(c - r, cy + r * 0.8); }
        else if (ch === '▼') { g.moveTo(c, cy + r); g.lineTo(c + r, cy - r * 0.8); g.lineTo(c - r, cy - r * 0.8); }
        else if (ch === '◄') { g.moveTo(c - r, cy); g.lineTo(c + r * 0.8, cy - r); g.lineTo(c + r * 0.8, cy + r); }
        else { g.moveTo(c + r, cy); g.lineTo(c - r * 0.8, cy - r); g.lineTo(c - r * 0.8, cy + r); }
        g.fill(); ax += aw;
      });
    }
    g.restore();
    return w;
  }
  // Drobny tekst (podpowiedzi, opisy) — czytelna pikselowa czcionka Tiny5 z polskimi znakami.
  // Rozmiar zaokrąglony do wielokrotności siatki kroju (8 px), żeby piksele liter były równe.
  const SMALL_TEXT = 5;
  function fontOf(size) {
    if (size < SMALL_TEXT) {
      const raw = size * S * 1.45, px = raw >= 12 ? Math.max(8, Math.round(raw / 8) * 8) : Math.max(8, Math.round(raw));
      return { px, small: true, font: `${px}px "Tiny5", "Pixelify Sans", "Courier New", monospace` };
    }
    const px = Math.round(size * S);
    return { px, small: false, font: `${px}px "Press Start 2P", "Courier New", monospace` };
  }
  function richText(str, x, y, size, col, align, noOutline) {
    const parts = [], re = /\{(\w+)(?::(\d))?\|([^}]*)\}/g;
    let m, last = 0;
    while ((m = re.exec(str))) { parts.push(str.slice(last, m.index)); parts.push({ act: m[1], p: +(m[2] || 0), kb: m[3] }); last = re.lastIndex; }
    parts.push(str.slice(last));
    if (app.lastDev !== 'pad') { text(parts.map(q => typeof q === 'string' ? q : q.kb).join(''), x, y, size, col, align, noOutline); return; }
    const px = Math.round(size * S);
    sctx.font = fontOf(size).font;
    const widths = parts.map(q => typeof q === 'string' ? sctx.measureText(q).width : (padBtnOf(q.act, q.p) === null ? px : padIconW(padBtnOf(q.act, q.p), px)));
    const total = widths.reduce((a, b) => a + b, 0);
    let cx = x * S - (align === 'center' ? total / 2 : align === 'right' ? total : 0);
    parts.forEach((q, i) => {
      if (typeof q === 'string') { if (q) text(q, cx / S, y, size, col, 'left', noOutline); }
      else drawPadIcon(sctx, padBtnOf(q.act, q.p), cx, y * S, px);
      cx += widths[i];
    });
  }
  function text(str, x, y, size, col, align, noOutline) {
    if (str.indexOf('{') >= 0) { richText(str, x, y, size, col, align, noOutline); return; }
    const F = fontOf(size), px = F.px;
    sctx.font = F.font;
    sctx.textAlign = align || 'left'; sctx.textBaseline = 'top';
    if (F.small) {
      // Tiny5 ma własne polskie znaki — bez doklejania ogonków; lekko w górę, bo krój ma wysoki górny margines
      const ty = Math.round(y * S - px * 0.12), tx = Math.round(x * S);
      if (!noOutline) { sctx.lineJoin = 'round'; sctx.lineWidth = Math.max(2, S * 1.1); sctx.strokeStyle = '#000'; sctx.strokeText(str, tx, ty); }
      sctx.fillStyle = col || '#fff'; sctx.fillText(str, tx, ty);
      return;
    }
    const marks = [];
    let base = '';
    for (const ch of str) {
      const d = DIAC[ch];
      if (d) { marks.push([base.length, d[1]]); base += d[0]; } else base += ch;
    }
    if (!noOutline) { sctx.lineJoin = 'round'; sctx.lineWidth = Math.max(2, S * 1.3); sctx.strokeStyle = '#000'; sctx.strokeText(base, x * S, y * S); }
    sctx.fillStyle = col || '#fff'; sctx.fillText(base, x * S, y * S);
    if (!marks.length) return;
    const total = sctx.measureText(base).width, cw = total / [...base].length;
    const x0 = x * S - (align === 'center' ? total / 2 : align === 'right' ? total : 0), y0 = y * S;
    const u = px / 8;
    for (const [i, m] of marks) {
      const cx = x0 + i * cw;
      const rects = m === 'acute' ? [[4, -3, 2, 1.5], [3, -2, 2, 1.2]]
        : m === 'dot' ? [[3, -2.5, 2, 1.8]]
          : m === 'ogonek' ? [[5, 7, 1.5, 1.6], [5.5, 8.2, 2, 1.2]]
            : [[0.5, 3, 4, 1.4]];
      if (!noOutline) { sctx.fillStyle = '#000'; for (const [rx, ry, rw, rh] of rects) sctx.fillRect(cx + rx * u - S * 0.6, y0 + ry * u - S * 0.6, rw * u + S * 1.2, rh * u + S * 1.2); }
      sctx.fillStyle = col || '#fff';
      for (const [rx, ry, rw, rh] of rects) sctx.fillRect(cx + rx * u, y0 + ry * u, rw * u, rh * u);
    }
  }

