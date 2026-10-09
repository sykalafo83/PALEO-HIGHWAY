  // =============================================================== FILTRY CRT (opcja)
  // AUTOMAT — zakrzywienie, poświata, miękkie skanlinie, winieta (filtr oryginalny).
  // MONITOR PC — płaski, ostry obraz, pionowa maska RGB (Trinitron), delikatne skanlinie.
  // STARY TV — mocna wypukłość, rozmycie i kolorowe obwódki sygnału antenowego, szum, pas zakłóceń, migotanie.
  const CRT_MODES = ['off', 'arcade', 'pc', 'tv'];
  const CRT_NAMES = { off: 'WYŁ.', arcade: 'AUTOMAT', pc: 'MONITOR PC', tv: 'STARY TV' };
  const CRT_DESC = { off: 'CZYSTY, OSTRY OBRAZ BEZ EFEKTÓW', arcade: 'ZAKRZYWIONY EKRAN, POŚWIATA I SKANLINIE JAK W SALONIE GIER',
    pc: 'PŁASKI MONITOR: PIONOWA MASKA RGB I DELIKATNE SKANLINIE', tv: 'STARY TELEWIZOR: ROZMYCIE, KOLOROWE OBWÓDKI, SZUM I ZAKŁÓCENIA' };
  const crtMode = () => OPTS.crt === true ? 'arcade' : CRT_MODES.includes(OPTS.crt) ? OPTS.crt : 'off';
  const crt = { a: document.createElement('canvas'), b: document.createElement('canvas'), c: document.createElement('canvas'), glow: document.createElement('canvas'), w: 0, h: 0 };
  const CRT_BEND = 0.045;
  function crtPrepare() {
    const w = screen.width, h = screen.height;
    if (crt.w === w && crt.h === h) return;
    crt.w = w; crt.h = h;
    [crt.a, crt.b, crt.c].forEach(c => { c.width = w; c.height = h; });
    crt.glow.width = W / 2; crt.glow.height = H / 2;
    const step = Math.max(2, Math.round(S));
    // skanlinie: jedna na wiersz pikseli gry, z siłą zależną od trybu
    const scan = (alpha, mask) => {
      const sl = document.createElement('canvas'); sl.width = 3; sl.height = step;
      const g = sl.getContext('2d');
      for (let y = 0; y < step; y++) {
        const d = Math.abs((y + 0.5) / step - 0.5) * 2;           // 0 w środku wiersza, 1 na granicy
        g.fillStyle = `rgba(0,0,0,${(alpha * d * d).toFixed(3)})`; g.fillRect(0, y, 3, 1);
      }
      if (mask && step >= 4) ['rgba(255,60,60,0.035)', 'rgba(60,255,60,0.035)', 'rgba(60,60,255,0.035)'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i, 0, 1, step); });
      return sctx.createPattern(sl, 'repeat');
    };
    crt.scan = scan(0.22, true);
    crt.scanPc = scan(0.13, false);
    crt.scanTv = scan(0.34, false);
    // pionowa maska RGB monitora (kreski co 3 piksele ekranu, mnożona — barwi kolumny)
    const gr = document.createElement('canvas'); gr.width = 3; gr.height = 1;
    const gg = gr.getContext('2d');
    ['#ffd0d0', '#d0ffd0', '#d0d0ff'].forEach((c, i) => { gg.fillStyle = c; gg.fillRect(i, 0, 1, 1); });
    crt.grille = sctx.createPattern(gr, 'repeat');
    // szum telewizora
    const nz = document.createElement('canvas'); nz.width = nz.height = 128;
    const nzc = nz.getContext('2d'), id = nzc.createImageData(128, 128);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255 | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    nzc.putImageData(id, 0, 0);
    crt.noise = sctx.createPattern(nz, 'repeat');
    const vig = (inner, a) => {
      const v = sctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * inner, w / 2, h / 2, Math.hypot(w, h) * 0.55);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); return v;
    };
    crt.vig = vig(0.4, 0.6); crt.vigPc = vig(0.5, 0.28); crt.vigTv = vig(0.3, 0.8);
  }
  // zakrzywienie: źródło -> (wiersze) crt.b -> (kolumny) ekran
  function crtCurve(src, bendY, bendX) {
    const w = crt.w, h = crt.h, b = crt.b.getContext('2d'), band = Math.max(2, Math.round(S));
    b.fillStyle = '#000'; b.fillRect(0, 0, w, h); b.imageSmoothingEnabled = true;
    for (let y = 0; y < h; y += band) {
      const ny = (y + band / 2) / h * 2 - 1, sw = w * (1 - bendY * ny * ny);
      b.drawImage(src, 0, y, w, band, (w - sw) / 2, y, sw, band);
    }
    sctx.fillStyle = '#000'; sctx.fillRect(0, 0, w, h); sctx.imageSmoothingEnabled = true;
    for (let x = 0; x < w; x += band) {
      const nx = (x + band / 2) / w * 2 - 1, sh = h * (1 - bendX * nx * nx);
      sctx.drawImage(crt.b, x, 0, band, h, x, (h - sh) / 2, band, sh);
    }
  }
  function crtGlow(alpha, spread) {
    const w = crt.w, h = crt.h, gc = crt.glow.getContext('2d');
    gc.imageSmoothingEnabled = true; gc.clearRect(0, 0, crt.glow.width, crt.glow.height);
    gc.drawImage(screen, 0, 0, crt.glow.width, crt.glow.height);
    sctx.imageSmoothingEnabled = true; sctx.globalCompositeOperation = 'screen'; sctx.globalAlpha = alpha;
    sctx.drawImage(crt.glow, -S * spread, -S * spread, w + S * spread * 2, h + S * spread * 2);
    sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over'; sctx.imageSmoothingEnabled = false;
  }
  function crtCorners(k) {
    const w = crt.w, h = crt.h, r = Math.min(w, h) * k;
    sctx.fillStyle = '#000'; sctx.beginPath(); sctx.rect(0, 0, w, h);
    sctx.moveTo(r, 0); sctx.arcTo(0, 0, 0, r, r); sctx.lineTo(0, h - r); sctx.arcTo(0, h, r, h, r); sctx.lineTo(w - r, h);
    sctx.arcTo(w, h, w, h - r, r); sctx.lineTo(w, r); sctx.arcTo(w, 0, w - r, 0, r); sctx.closePath();
    sctx.fill('evenodd');
  }
  function applyCrt() {
    const mode = crtMode();
    if (mode === 'off') return;
    crtPrepare();
    const w = crt.w, h = crt.h, a = crt.a.getContext('2d');
    sctx.save();
    if (mode === 'arcade') {
      a.clearRect(0, 0, w, h); a.drawImage(screen, 0, 0);
      crtCurve(crt.a, CRT_BEND, CRT_BEND * 1.3);
      crtGlow(0.35, 2);
      sctx.fillStyle = crt.scan; sctx.fillRect(0, 0, w, h);
      sctx.fillStyle = crt.vig; sctx.fillRect(0, 0, w, h);
      crtCorners(0.06);
    } else if (mode === 'pc') {
      // płaski ekran: maska RGB (mnożenie), rozjaśnienie kompensujące, skanlinie, lekka poświata
      sctx.globalCompositeOperation = 'multiply'; sctx.fillStyle = crt.grille; sctx.fillRect(0, 0, w, h);
      sctx.globalCompositeOperation = 'source-over';
      crtGlow(0.22, 1);
      sctx.fillStyle = crt.scanPc; sctx.fillRect(0, 0, w, h);
      sctx.fillStyle = crt.vigPc; sctx.fillRect(0, 0, w, h);
      crtCorners(0.012);
    } else {
      // stary telewizor: kanały R i B przesunięte w bok (kolorowe obwódki), rozmycie, wypukłość
      const c = crt.c.getContext('2d'), off = Math.max(1, Math.round(S * 0.7));
      a.globalCompositeOperation = 'source-over'; a.fillStyle = '#000'; a.fillRect(0, 0, w, h);
      [['#ff0000', off], ['#00ff00', 0], ['#0000ff', -off]].forEach(([col, dx]) => {
        c.globalCompositeOperation = 'source-over'; c.drawImage(screen, 0, 0);
        c.globalCompositeOperation = 'multiply'; c.fillStyle = col; c.fillRect(0, 0, w, h);
        a.globalCompositeOperation = 'lighter'; a.drawImage(crt.c, dx, 0);
      });
      // rozmycie sygnału: pomniejszony obraz nałożony na wierzch
      c.globalCompositeOperation = 'source-over'; c.imageSmoothingEnabled = true;
      c.clearRect(0, 0, w, h); c.drawImage(crt.a, 0, 0, w / 2, h / 2);
      a.globalCompositeOperation = 'source-over'; a.imageSmoothingEnabled = true; a.globalAlpha = 0.45;
      a.drawImage(crt.c, 0, 0, w / 2, h / 2, 0, 0, w, h);
      a.globalAlpha = 1;
      crtCurve(crt.a, 0.09, 0.12);
      crtGlow(0.4, 3);
      sctx.fillStyle = crt.scanTv; sctx.fillRect(0, 0, w, h);
      // szum
      const f = app.frame || 0;
      sctx.save(); sctx.globalAlpha = 0.07; sctx.translate((f * 37) % 128, (f * 71) % 128);
      sctx.fillStyle = crt.noise; sctx.fillRect(-128, -128, w + 256, h + 256); sctx.restore();
      // przesuwający się pas zakłóceń
      const by = ((f * 1.6) % (h * 1.6)) - h * 0.3, bh = h * 0.12, gb = sctx.createLinearGradient(0, by, 0, by + bh);
      gb.addColorStop(0, 'rgba(255,255,255,0)'); gb.addColorStop(0.5, 'rgba(255,255,255,0.06)'); gb.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.fillStyle = gb; sctx.fillRect(0, by, w, bh);
      // migotanie
      sctx.fillStyle = `rgba(0,0,0,${(0.03 + Math.random() * 0.03).toFixed(3)})`; sctx.fillRect(0, 0, w, h);
      sctx.fillStyle = crt.vigTv; sctx.fillRect(0, 0, w, h);
      crtCorners(0.1);
    }
    sctx.restore();
  }

