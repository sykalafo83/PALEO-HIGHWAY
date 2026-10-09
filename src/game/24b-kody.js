  // =============================================================== KODY Z IKON
  // Po wybraniu postaci w zwykłej grze: 4 kafle z ikonami (◄► kafel, ▲▼ ikona, ENTER — sprawdź kod).
  // Poprawny kod: krótki napis „KOD: …!” i gra rusza sama.
  // Spis kodów dla graczy: iconcodes.html. Kody działają do końca przejścia (nie zapisują się).
  const CODE_ICONS = ['JAJO', 'KOŚĆ', 'KIEŁ', 'BURSZTYN', 'LIŚĆ', 'CZASZKA'];
  const CODES = [
    { id: 'stagesel', name: 'WYBÓR ETAPU', desc: 'WYBIERASZ ETAP, OD KTÓREGO ZACZYNASZ', combo: [1, 3, 1, 0] },
    { id: 'bighead', name: 'WIELKIE GŁOWY', desc: 'WSZYSCY MAJĄ OGROMNE GŁOWY', combo: [5, 5, 0, 0], fun: true },
    { id: 'lowgrav', name: 'NISKA GRAWITACJA', desc: 'SKOKI I UPADKI JAK NA KSIĘŻYCU', combo: [4, 0, 4, 0], fun: true },
    { id: 'fury', name: 'WIECZNA FURIA', desc: 'PASEK FURII ZAWSZE PEŁNY', combo: [2, 2, 2, 3] },
    { id: 'lives', name: 'DZIEWIĘĆ ŻYĆ', desc: 'START Z 9 ŻYCIAMI', combo: [0, 3, 0, 3] },
    { id: 'onehit', name: 'JEDEN CIOS', desc: 'ZWYKLI WROGOWIE PADAJĄ OD JEDNEGO CIOSU', combo: [2, 5, 2, 5] },
    { id: 'raptor', name: 'WIERNY RAPTOR', desc: 'NA KAŻDYM ETAPIE CZEKA OSWOJONY RAPTOR', combo: [2, 4, 2, 0] },
    { id: 'film', name: 'KINO NIEME', desc: 'OBRAZ CZARNO-BIAŁY JAK STARY FILM', combo: [5, 1, 1, 5], fun: true },
    { id: 'tiny', name: 'KARZEŁKI', desc: 'WROGOWIE SĄ MALUTCY', combo: [0, 1, 4, 2], fun: true },
    { id: 'gold', name: 'ZŁOTA GORĄCZKA', desc: 'KAŻDY WRÓG SYPIE MONETAMI I BURSZTYNEM', combo: [3, 3, 3, 3] },
    { id: 'helium', name: 'HEL', desc: 'WSZYSCY MÓWIĄ PISKLIWYM GŁOSEM', combo: [4, 4, 3, 4], fun: true }
  ];
  app.cheats = new Set();
  const cheat = id => app.cheats.has(id);
  // kody dające przewagę wyłączają osiągnięcia i tabelę wyników (kosmetyczne i wybór etapu — nie)
  const cheated = () => CODES.some(c => app.cheats.has(c.id) && !c.fun && c.id !== 'stagesel');
  function applyCheatMods() {
    SP.mods.bigHead = cheat('bighead') ? 1.7 : 1;
    GRAV = cheat('lowgrav') ? 0.17 : 0.32;
    AU.voicePitch = cheat('helium') ? 1.9 : 1;
    screen.style.filter = cheat('film') ? 'grayscale(1) sepia(0.35) contrast(1.15) brightness(1.05)' : '';
  }
  function clearCheats() { app.cheats = new Set(); applyCheatMods(); }

  function openCodes() {
    app.mode = 'codes'; app.t = 0;
    app.codes = { tiles: [0, 0, 0, 0], cur: 0, msg: null, msgT: 0, ok: false, time: 60 * 20 };
    clearCheats();
  }
  function startWithCodes() {
    sfx('start'); applyCheatMods();
    if (cheat('stagesel') || app.debug) { app.mode = 'stagesel'; app.t = 0; }
    else goMap(urlStage, null);
  }
  function updateCodes() {
    const C = app.codes;
    if (C.msgT > 0) C.msgT--;
    if (C.flash > 0) C.flash--;
    if (C.go > 0) { if (--C.go === 0) startWithCodes(); return; }   // po poprawnym kodzie — start
    if (pressed.pause || pressed.jump) { clearCheats(); app.mode = 'select'; app.t = 0; sfx('select'); return; }
    if (--C.time <= 0) { startWithCodes(); return; }
    if (pressed.left) { C.cur = (C.cur + 4) % 5; sfx('select'); }
    if (pressed.right) { C.cur = (C.cur + 1) % 5; sfx('select'); }
    if (C.cur < 4 && (pressed.up || pressed.down)) { C.tiles[C.cur] = (C.tiles[C.cur] + (pressed.up ? 5 : 1)) % 6; C.bump = { i: C.cur, t: 8 }; sfx('select'); }
    if ((pressed.start || pressed.attack) && app.t > 10) {
      if (C.cur === 4) { startWithCodes(); return; }
      const code = CODES.find(c => c.combo.every((v, i) => v === C.tiles[i]));
      if (!code) { C.msg = 'NIEPRAWIDŁOWY KOD'; C.ok = false; sfx('empty'); }
      else { app.cheats.add(code.id); C.msg = 'KOD: ' + code.name + '!'; C.ok = true; sfx('oneup'); C.flash = 20; C.go = 70; applyCheatMods(); }
      C.msgT = 150;
    }
    if (C.bump && C.bump.t > 0) C.bump.t--;
  }
  // ikony rysowane kodem (te same kształty co w iconcodes.html)
  function drawCodeIcon(i, cx, cy, s) {
    const O = '#140c10';
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.lineJoin = 'round'; ctx.lineWidth = 1.6; ctx.strokeStyle = O;
    const path = (pts, fill) => { ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); };
    switch (i) {
      case 0:   // jajo
        ctx.beginPath(); ctx.ellipse(0, 1, 7, 9, 0, 0, Math.PI * 2); ctx.fillStyle = '#f0e6c8'; ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#7aa04a'; [[-3, -2, 1.6], [2.5, 2, 2], [-1, 5, 1.3], [3, -5, 1.1]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
        ctx.fillStyle = '#fff'; ctx.fillRect(-4, -5, 2, 3);
        break;
      case 1:   // kość
        ctx.save(); ctx.rotate(-0.6);
        ctx.fillStyle = '#f4efe0';
        [[-8, -2.5], [-8, 2.5], [8, -2.5], [8, 2.5]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
        ctx.fillRect(-8, -2.6, 16, 5.2); ctx.strokeRect(-8, -2.6, 16, 5.2);
        ctx.fillRect(-9.5, -2, 19, 4); ctx.restore();
        break;
      case 2:   // kieł
        path([[-5, -9], [5, -9], [3, -2], [0, 9], [-2, 2]], '#f8f4e8');
        ctx.fillStyle = '#c8b898'; ctx.beginPath(); ctx.moveTo(1, -8); ctx.lineTo(4, -8); ctx.lineTo(2, -1); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#b04030'; ctx.fillRect(-5, -10, 10, 2);
        break;
      case 3:   // bursztyn
        path([[0, -9], [7, -4], [7, 4], [0, 9], [-7, 4], [-7, -4]], '#f0a020');
        ctx.fillStyle = '#ffd060'; ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(0, -7); ctx.lineTo(1, -2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#5a2a0a'; ctx.beginPath(); ctx.ellipse(1, 2, 2.2, 1.2, 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#5a2a0a'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-1, 1); ctx.lineTo(-3, -1); ctx.moveTo(3, 1); ctx.lineTo(5, -1); ctx.stroke();
        break;
      case 4:   // liść paproci
        ctx.strokeStyle = O; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(0, 10); ctx.quadraticCurveTo(-1, 0, 2, -10); ctx.stroke();
        for (let k = 0; k < 5; k++) {
          const y = 6 - k * 3.6, w = 7 - k * 1.1;
          [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * w * 0.55, y - 1, w * 0.55, 1.7, sd * -0.5, 0, Math.PI * 2); ctx.fillStyle = k % 2 ? '#4c9a44' : '#5ab84a'; ctx.fill(); ctx.lineWidth = 0.8; ctx.stroke(); });
        }
        break;
      case 5:   // czaszka
        ctx.beginPath(); ctx.arc(0, -2, 8, Math.PI, 0); ctx.lineTo(6, 4); ctx.lineTo(-6, 4); ctx.closePath(); ctx.fillStyle = '#eae4d4'; ctx.fill(); ctx.stroke();
        ctx.fillRect(-4.5, 4, 9, 4); ctx.strokeRect(-4.5, 4, 9, 4);
        ctx.fillStyle = O; ctx.beginPath(); ctx.arc(-3, -1, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(3, -1, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, 1.5); ctx.lineTo(-1.2, 3.5); ctx.lineTo(1.2, 3.5); ctx.fill();
        ctx.fillRect(-2.5, 4.5, 0.8, 3); ctx.fillRect(-0.4, 4.5, 0.8, 3); ctx.fillRect(1.7, 4.5, 0.8, 3);
        break;
    }
    ctx.restore();
  }
  const TILE = 40, TILE_GAP = 12, TILES_X = W / 2 - (TILE * 4 + TILE_GAP * 3) / 2, TILES_Y = 76;
  function drawCodes() {
    drawScoresBg();
    ctx.fillStyle = 'rgba(10,6,16,0.65)'; ctx.fillRect(0, 0, W, H);
    const C = app.codes, f = app.frame || 0;
    for (let i = 0; i < 4; i++) {
      const x = TILES_X + i * (TILE + TILE_GAP), sel = C.cur === i, b = C.bump && C.bump.i === i ? C.bump.t / 8 : 0;
      ctx.fillStyle = sel ? (f % 20 < 10 ? '#ffe040' : '#ffb020') : '#5a4a6a'; ctx.fillRect(x - 3, TILES_Y - 3, TILE + 6, TILE + 6);
      ctx.fillStyle = '#140c10'; ctx.fillRect(x - 1, TILES_Y - 1, TILE + 2, TILE + 2);
      const g = ctx.createLinearGradient(0, TILES_Y, 0, TILES_Y + TILE); g.addColorStop(0, '#3a4a6a'); g.addColorStop(1, '#1a2238');
      ctx.fillStyle = g; ctx.fillRect(x, TILES_Y, TILE, TILE);
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x, TILES_Y, TILE, 4);
      drawCodeIcon(C.tiles[i], x + TILE / 2, TILES_Y + TILE / 2 - b * 3, 1.45 + b * 0.15);
      if (sel) {
        ctx.fillStyle = '#ffe040';
        ctx.beginPath(); ctx.moveTo(x + TILE / 2 - 5, TILES_Y - 7); ctx.lineTo(x + TILE / 2 + 5, TILES_Y - 7); ctx.lineTo(x + TILE / 2, TILES_Y - 12); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + TILE / 2 - 5, TILES_Y + TILE + 7); ctx.lineTo(x + TILE / 2 + 5, TILES_Y + TILE + 7); ctx.lineTo(x + TILE / 2, TILES_Y + TILE + 12); ctx.fill();
      }
    }
    // przycisk GRAJ
    const gx = W / 2 - 34, gy = 150, gsel = C.cur === 4;
    ctx.fillStyle = gsel ? (f % 20 < 10 ? '#7cff7c' : '#40c040') : '#3a5a3a'; ctx.fillRect(gx - 2, gy - 2, 72, 18);
    ctx.fillStyle = '#140c10'; ctx.fillRect(gx, gy, 68, 14);
    // pasek czasu
    const k = C.time / (60 * 20);
    ctx.fillStyle = '#140c10'; ctx.fillRect(W / 2 - 61, 182, 122, 5);
    ctx.fillStyle = k > 0.3 ? '#40c0ff' : (f % 10 < 5 ? '#ff6040' : '#ffb040'); ctx.fillRect(W / 2 - 60, 183, 120 * k, 3);
    if (C.flash > 0) { ctx.fillStyle = `rgba(255,240,160,${C.flash / 40})`; ctx.fillRect(0, 0, W, H); }
  }
  function drawCodesText() {
    const C = app.codes;
    text('KODY', W / 2, 14, 12, '#ffe080', 'center');
    text(C.go > 0 ? 'START!' : 'ZNASZ KOD? USTAW IKONY I ZATWIERDŹ', W / 2, 36, 5, C.go > 0 ? '#7cff7c' : '#c0c0d0', 'center');
    for (let i = 0; i < 4; i++) text(CODE_ICONS[C.tiles[i]], TILES_X + i * (TILE + TILE_GAP) + TILE / 2, TILES_Y + TILE + 15, 4, C.cur === i ? '#ffe040' : '#a0a0b0', 'center');
    text('GRAJ', W / 2, 153, 7, C.cur === 4 ? '#7cff7c' : '#90b090', 'center');
    if (C.msgT > 0 && C.msg) text(C.msg, W / 2, 56, 6, C.ok ? '#7cff7c' : '#ff6060', 'center');
    else if (app.cheats.size) text('AKTYWNE: ' + CODES.filter(c => app.cheats.has(c.id)).map(c => c.name).join(', '), W / 2, 56, 4, '#7cff7c', 'center');
    text('◄► KAFEL   ▲▼ IKONA   {ok|ENTER} SPRAWDŹ KOD / GRAJ   {back|ESC} WSTECZ', W / 2, 196, 4, '#c0c0c0', 'center');
    text('CZAS NA KODY: ' + Math.ceil(C.time / 60) + ' S', W / 2, 172, 4, '#a0a0b0', 'center');
  }
