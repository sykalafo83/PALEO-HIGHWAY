  // =============================================================== RAMKA AUTOMATU (tło wokół ekranu gry)
  // Rysowana raz (przy zmianie rozmiaru okna lub opcji) na osobnym płótnie pod ekranem gry:
  // pixel-artowa sceneria po bokach i ramka kineskopu.
  const bezel = document.createElement('canvas');
  bezel.id = 'bezel';
  document.body.insertBefore(bezel, screen);
  function drawBezel() {
    const dpr = window.devicePixelRatio || 1, bw = Math.round(innerWidth * dpr), bh = Math.round(innerHeight * dpr);
    bezel.width = bw; bezel.height = bh;
    const g = bezel.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#07050a'; g.fillRect(0, 0, bw, bh);
    if (!OPTS.bezel) { screen.style.boxShadow = ''; return; }
    screen.style.boxShadow = 'none';
    const sw = screen.width, sh = screen.height, sx = Math.round((bw - sw) / 2), sy = Math.round((bh - sh) / 2);
    const u = Math.max(2, Math.round(Math.max(S, 2 * dpr)));          // wielkość „piksela” grafiki tła
    const fr = Math.round(Math.min(sx, 26 * dpr));                      // grubość bocznych listew ramki
    // ---- 1. sceneria w niskiej rozdzielczości: zachód słońca nad autostradą
    const lw = Math.ceil(bw / u), lh = Math.ceil(bh / u), L = document.createElement('canvas');
    L.width = lw; L.height = lh;
    const l = L.getContext('2d'), R = window.Scenery.rng(1977), hz = Math.round(lh * 0.66);
    const sky = l.createLinearGradient(0, 0, 0, hz);
    sky.addColorStop(0, '#120822'); sky.addColorStop(0.55, '#4a1240'); sky.addColorStop(1, '#ff6a2a');
    l.fillStyle = sky; l.fillRect(0, 0, lw, hz);
    for (let i = 0; i < 70; i++) { l.fillStyle = `rgba(255,240,220,${0.3 + R() * 0.6})`; l.fillRect(Math.floor(R() * lw), Math.floor(R() * hz * 0.5), 1, 1); }
    // słońce z pasami
    const cx = lw / 2, sr = Math.max(14, Math.min(lw, lh) * 0.22);
    for (let y = -sr; y < 0; y++) {
      const k = (y + sr) / sr, half = Math.sqrt(sr * sr - y * y);
      if ((y | 0) % 5 > 2 && k > 0.45) continue;
      l.fillStyle = k < 0.5 ? '#ffd040' : '#ff9a30'; l.fillRect(Math.round(cx - half), hz + y, Math.round(half * 2), 1);
    }
    // góry i wulkan
    const ridge = (col, base, amp, step) => {
      l.fillStyle = col; l.beginPath(); l.moveTo(0, hz);
      for (let x = 0; x <= lw + step; x += step) l.lineTo(x, base - R() * amp);
      l.lineTo(lw, hz); l.closePath(); l.fill();
    };
    ridge('#2a0e2e', hz - 4, lh * 0.12, 9); ridge('#1a0820', hz, lh * 0.06, 6);
    const vx = Math.round(lw * 0.12), vh = lh * 0.28;
    l.fillStyle = '#1e0a1a'; l.beginPath(); l.moveTo(vx - vh * 1.1, hz); l.lineTo(vx - 6, hz - vh); l.lineTo(vx + 6, hz - vh); l.lineTo(vx + vh * 1.1, hz); l.fill();
    l.fillStyle = '#ff5a14'; l.fillRect(vx - 5, Math.round(hz - vh), 10, 2);
    l.fillStyle = 'rgba(255,90,20,0.55)'; l.beginPath(); l.moveTo(vx - 2, hz - vh); l.lineTo(vx - 12, hz - vh * 0.4); l.lineTo(vx - 6, hz - vh * 0.4); l.lineTo(vx + 2, hz - vh); l.fill();
    for (let i = 0; i < 5; i++) { l.fillStyle = `rgba(60,40,50,${0.5 - i * 0.08})`; l.beginPath(); l.ellipse(vx + i * 6, hz - vh - 6 - i * 7, 8 + i * 4, 4 + i * 2, 0, 0, Math.PI * 2); l.fill(); }
    // ziemia z autostradą w perspektywie
    l.fillStyle = '#140a14'; l.fillRect(0, hz, lw, lh - hz);
    l.strokeStyle = 'rgba(255,90,160,0.35)'; l.lineWidth = 1;
    for (let k = 1; k < 12; k++) { const y = Math.round(hz + (lh - hz) * Math.pow(k / 11, 2)); l.beginPath(); l.moveTo(0, y + 0.5); l.lineTo(lw, y + 0.5); l.stroke(); }
    for (let k = -12; k <= 12; k++) { l.beginPath(); l.moveTo(cx + k * 3, hz); l.lineTo(cx + k * lw * 0.12, lh); l.stroke(); }
    l.fillStyle = '#2a2230'; l.beginPath(); l.moveTo(cx - 4, hz); l.lineTo(cx + 4, hz); l.lineTo(cx + lw * 0.32, lh); l.lineTo(cx - lw * 0.32, lh); l.fill();
    l.fillStyle = '#ffb030';
    for (let k = 0; k < 9; k++) { const t0 = Math.pow(k / 9, 2), t1 = Math.pow((k + 0.45) / 9, 2), y0 = hz + (lh - hz) * t0, y1 = hz + (lh - hz) * t1; l.fillRect(Math.round(cx - 0.5 - t1 * 2), Math.round(y0), Math.max(1, Math.round(1 + t1 * 4)), Math.max(1, Math.round(y1 - y0))); }
    // palmy po bokach
    const side = Math.max(1, sx / u);
    [[side * 0.25, 1], [side * 0.7, -1], [lw - side * 0.3, -1], [lw - side * 0.75, 1]].forEach(([x, lean], i) =>
      window.Scenery.palm(l, R, Math.round(x), hz + 6 + i * 3, lh * (0.32 + (i % 2) * 0.08), lean * (0.6 + R() * 0.4), true));
    // dinozaury: raptor po lewej, stary tyranozaur po prawej
    const ds = Math.max(0.8, Math.min(3, side / 70));
    SP.drawRaptor(l, Math.round(side * 0.5), Math.round(lh - (lh - hz) * 0.3), 1, 6, 'run', RAPTOR_COLS[0], { scale: ds });
    SP.drawRaptor(l, Math.round(lw - side * 0.5), Math.round(lh - (lh - hz) * 0.2), -1, 0, 'roar', REX_COLS, { scale: ds * 1.25, rex: true });
    g.drawImage(L, 0, 0, lw * u, lh * u);
    // przyciemnienie i winieta, żeby tło nie odciągało uwagi od gry
    g.fillStyle = 'rgba(8,4,14,0.42)'; g.fillRect(0, 0, bw, bh);
    const vg = g.createRadialGradient(bw / 2, bh / 2, Math.min(bw, bh) * 0.3, bw / 2, bh / 2, Math.hypot(bw, bh) * 0.6);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.75)');
    g.fillStyle = vg; g.fillRect(0, 0, bw, bh);
    // listwy boczne obudowy (jak T-molding w automatach)
    if (sx > 60 * dpr) {
      [[0, 1], [bw, -1]].forEach(([x0, d]) => {
        const w = Math.round(8 * dpr), gr = g.createLinearGradient(x0, 0, x0 + d * w, 0);
        gr.addColorStop(0, '#ff7a20'); gr.addColorStop(0.5, '#ffb050'); gr.addColorStop(1, '#a03a10');
        g.fillStyle = gr; g.fillRect(d > 0 ? 0 : bw - w, 0, w, bh);
      });
    }
    const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
    // ---- 3. boczne listwy ramki ekranu: błyszczące tworzywo, krawędź i neon (na całą wysokość okna)
    if (fr >= 4 * dpr) {
      [[sx - fr, 1], [sx + sw, -1]].forEach(([x0, d]) => {
        g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 24 * dpr; g.fillStyle = '#000'; g.fillRect(x0, 0, fr, bh); g.restore();
        const pg = g.createLinearGradient(x0, 0, x0 + fr, 0);
        pg.addColorStop(0, d > 0 ? '#2a2430' : '#141018'); pg.addColorStop(0.5, '#1c1820'); pg.addColorStop(1, d > 0 ? '#141018' : '#2a2430');
        g.fillStyle = pg; g.fillRect(x0, 0, fr, bh);
        g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(d > 0 ? x0 + dpr : x0 + fr - 2 * dpr, 0, dpr, bh);
        // śruby
        if (fr >= 14 * dpr) for (let y = fr; y < bh; y += Math.max(160 * dpr, bh / 4)) {
          const cx = x0 + fr / 2;
          g.fillStyle = '#5a5460'; g.beginPath(); g.arc(cx, y, 3 * dpr, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#1a161e'; g.lineWidth = dpr; g.beginPath(); g.moveTo(cx - 2 * dpr, y); g.lineTo(cx + 2 * dpr, y); g.stroke();
        }
      });
    }
    if (sx >= 2 * dpr) {
      g.save(); g.shadowColor = '#ff7a20'; g.shadowBlur = 10 * dpr; g.fillStyle = 'rgba(255,140,40,0.9)';
      const lw2 = Math.max(1, Math.round(1.5 * dpr));
      g.fillRect(sx - lw2 - dpr, 0, lw2, bh); g.fillRect(sx + sw + dpr, 0, lw2, bh); g.restore();
    }
  }

