  // =============================================================== MAPA (przejście między etapami)
  // Węzły trasy: start + 8 etapów. Współrzędne w pikselach bufora 384×224.
  const MAP_NODES = [
    { x: 26, y: 186, label: 'START' },
    { x: 66, y: 146, icon: 'palm' }, { x: 112, y: 188, icon: 'swamp' }, { x: 172, y: 138, icon: 'city' },
    { x: 196, y: 70, icon: 'volcano' }, { x: 282, y: 150, icon: 'port' }, { x: 250, y: 200, icon: 'beach' },
    { x: 252, y: 104, icon: 'sewer' }, { x: 334, y: 66, icon: 'fort' }
  ];
  // krawędzie trasy (węzeł = etap + 1) z punktami kontrolnymi krzywych
  const MAP_EDGES = { '0-1': [40, 150], '1-2': [96, 176], '2-3': [142, 172], '2-4': [130, 110], '3-5': [228, 170], '4-5': [252, 98],
    '5-6': [280, 186], '6-7': [222, 150], '7-8': [294, 70] };
  const edgeKey = (a, b) => a < b ? a + '-' + b : b + '-' + a;
  const MAP_ARRIVE = 170, MAP_END = 330;
  const G_MAP = { canvas: null, flash: 0 };
  // ---- OBÓZ: sklep z ulepszeniami przed każdą mapą trasy (zwykła gra)
  const UPGRADES = [
    ['hp', '+10% ŻYCIA', [3, 5, 8], 'WIĘKSZY PASEK ŻYCIA NA KOLEJNE ETAPY'],
    ['combo', 'DŁUŻSZE KOMBO', [3, 6], 'WIĘCEJ CZASU MIĘDZY TRAFIENIAMI W SERII'],
    ['bomb', 'MOCNIEJSZE BOMBY', [4, 7], '+25% OBRAŻEŃ WYBUCHÓW I +1 BOMBA W PACZCE'],
    ['ride', 'DŁUŻSZA JAZDA', [3, 5], '+5 SEKUND NA GRZBIECIE DINOZAURA'],
    ['fury', 'SZYBSZA FURIA', [4, 7], 'PASEK FURII ŁADUJE SIĘ O 25% SZYBCIEJ'],
    ['life', 'DODATKOWE ŻYCIE', [10], 'JEDNO ŻYCIE WIĘCEJ (MOŻNA KUPOWAĆ WIELE RAZY)']
  ];
  function upCost(q, id, costs) { return id === 'life' ? costs[0] : costs[q.up[id]]; }
  function goMap(idx, team) {
    if (team && !Array.isArray(team)) team = [team];
    if (team && app.gameMode === 'arcade' && !app.skipShop) {
      app.mode = 'shop'; app.t = 0; app.shop = { idx, team, who: 0, sel: 0, msg: '', msgT: 0 };
      AU.stopMusic(); AU.play('map');
      return;
    }
    if (team) saveProgress(idx === 'branch' ? { type: 'branch' } : { type: 'map', idx }, team);
    app.route = app.route || [];
    app.mapFrom = app.route.length ? app.route[app.route.length - 1] + 1 : 0;
    app.mapChoice = idx === 'branch' ? { opts: [2, 3], sel: 0 } : null;
    if (idx === 'branch') idx = 2;
    app.mode = 'map'; app.t = 0; app.mapTo = idx; app.mapPlayer = team;
    app.mapTeam = team ? team.map(q => ({ key: q.key, b: q.b, name: q.name })) : makeTeam().map(q => ({ key: q.key, b: q.b, name: q.name }));
    AU.stopMusic(); AU.play('map');
  }
  function mapSeg(na, nb, k) {
    // punkt na krzywej z węzła na do nb (kwadratowa Béziera); brak krawędzi → linia prosta
    const a = MAP_NODES[na], b = MAP_NODES[nb], c = MAP_EDGES[edgeKey(na, nb)] || [(a.x + b.x) / 2, (a.y + b.y) / 2], u = 1 - k;
    return [u * u * a.x + 2 * u * k * c[0] + k * k * b.x, u * u * a.y + 2 * u * k * c[1] + k * k * b.y];
  }
  function buildMapCanvas() {
    if (G_MAP.canvas) return G_MAP.canvas;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), R = window.Scenery.rng(5), SC = window.Scenery;
    // pergamin
    g.fillStyle = '#d8c49a'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 2600; i++) { g.fillStyle = R() < 0.5 ? 'rgba(120,90,50,0.08)' : 'rgba(255,240,200,0.10)'; g.fillRect(R() * W, R() * H, 1 + R() * 3, 1 + R() * 2); }
    // morze (wschód i południe)
    g.fillStyle = '#6a9ab0';
    g.beginPath(); g.moveTo(W, 0); g.lineTo(300, 0);
    for (let y = 0; y <= H; y += 8) g.lineTo(300 + Math.sin(y * 0.05) * 14 + (y > 110 ? (y - 110) * 0.15 : 0) - (y > 170 ? (y - 170) * 1.6 : 0), y);
    g.lineTo(W, H); g.fill();
    g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= 230; x += 8) g.lineTo(x, 212 + Math.sin(x * 0.07) * 4); g.lineTo(230, H); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1;
    for (let i = 0; i < 26; i++) { const x = 300 + R() * 84, y = R() * H; if (x < 312 + y * 0.1) continue; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 3, y - 2, x + 6, y); g.stroke(); }
    // wyspa twierdzy
    g.fillStyle = '#b8a07a'; g.beginPath(); g.ellipse(336, 70, 26, 18, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#5a4a3a'; g.lineWidth = 1; g.stroke();
    // regiony
    const region = (x, y, rx, ry, col, n) => { for (let i = 0; i < n; i++) { g.fillStyle = col; g.beginPath(); g.ellipse(x + (R() - 0.5) * rx, y + (R() - 0.5) * ry, 6 + R() * 10, 4 + R() * 7, 0, 0, Math.PI * 2); g.fill(); } };
    region(66, 140, 80, 50, 'rgba(60,120,50,0.55)', 40);
    region(112, 190, 60, 26, 'rgba(110,110,60,0.55)', 26);
    region(172, 136, 50, 34, 'rgba(110,110,120,0.45)', 20);
    region(196, 72, 90, 40, 'rgba(130,60,40,0.45)', 30);
    region(280, 150, 40, 40, 'rgba(150,130,100,0.45)', 14);
    region(250, 202, 46, 16, 'rgba(220,200,140,0.6)', 14);
    region(252, 106, 36, 26, 'rgba(70,90,70,0.45)', 12);
    // góry
    for (let i = 0; i < 14; i++) {
      const x = 130 + R() * 140, y = 40 + R() * 50;
      g.fillStyle = '#8a6a50'; g.beginPath(); g.moveTo(x - 7, y + 6); g.lineTo(x, y - 6); g.lineTo(x + 7, y + 6); g.fill();
      g.fillStyle = '#6a4a38'; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 7, y + 6); g.lineTo(x + 2, y + 6); g.fill();
    }
    // rzeka
    g.strokeStyle = '#6a9ab0'; g.lineWidth = 2; g.beginPath(); g.moveTo(150, 30); g.bezierCurveTo(140, 90, 210, 120, 230, 200); g.lineTo(235, H); g.stroke();
    // siatka i ramka
    g.strokeStyle = 'rgba(90,60,30,0.15)'; g.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y < H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    // róża wiatrów
    g.save(); g.translate(356, 196);
    g.fillStyle = '#5a3a20'; g.beginPath(); g.moveTo(0, -14); g.lineTo(3, 0); g.lineTo(0, 14); g.lineTo(-3, 0); g.fill();
    g.beginPath(); g.moveTo(-14, 0); g.lineTo(0, 3); g.lineTo(14, 0); g.lineTo(0, -3); g.fill();
    g.fillStyle = '#c03a2a'; g.beginPath(); g.moveTo(0, -14); g.lineTo(3, 0); g.lineTo(-3, 0); g.fill();
    g.restore();
    // ikony lokacji
    const icon = (n) => {
      const { x, y } = n;
      g.save(); g.translate(x, y - 12);
      switch (n.icon) {
        case 'palm': SC.palm(g, R, 0, 8, 16, 0.4, false); break;
        case 'swamp': SC.deadTree(g, R, 0, 8, 22); break;
        case 'city': [[-8, 14], [-1, 20], [6, 12]].forEach(([dx, h]) => { SC.rect(g, dx, 8 - h, 6, h, '#5a5a6a'); g.fillStyle = '#f0d070'; g.fillRect(dx + 2, 10 - h, 2, 2); }); break;
        case 'volcano': g.fillStyle = '#5a2a2a'; g.beginPath(); g.moveTo(-12, 8); g.lineTo(-3, -8); g.lineTo(3, -8); g.lineTo(12, 8); g.fill(); g.fillStyle = '#ff7a2a'; g.fillRect(-3, -9, 6, 2); g.fillStyle = 'rgba(80,70,80,0.6)'; g.beginPath(); g.arc(2, -14, 5, 0, Math.PI * 2); g.fill(); break;
        case 'port': SC.rect(g, -9, 2, 18, 5, '#7a4a2a'); SC.rect(g, -1, -10, 2, 12, '#5a3a2a'); g.fillStyle = '#f0ece0'; g.beginPath(); g.moveTo(1, -10); g.lineTo(9, 0); g.lineTo(1, 0); g.fill(); break;
        case 'beach': g.fillStyle = '#e0c890'; g.beginPath(); g.ellipse(0, 6, 12, 4, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#140c10'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-6, 6); g.quadraticCurveTo(-2, -4, 4, -8); g.stroke();
          g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-3 + i * 3, -1 - i * 2); g.quadraticCurveTo(i * 3, 3, -1 + i * 3, 6); g.stroke(); } break;
        case 'sewer': SC.rect(g, -9, -6, 18, 14, '#4a4440'); g.fillStyle = '#140c10'; g.beginPath(); g.arc(0, 4, 6, Math.PI, 0); g.fillRect(-6, 4, 12, 4); g.fill();
          g.fillStyle = '#5ac82a'; g.fillRect(-5, 6, 10, 2); break;
        case 'fort': SC.rect(g, -10, -4, 20, 12, '#6a6070'); for (let i = 0; i < 3; i++) SC.rect(g, -10 + i * 8, -8, 4, 4, '#6a6070'); SC.rect(g, -2, 0, 4, 8, '#2a2030'); g.fillStyle = '#d0a040'; g.fillRect(-1, -14, 1, 6); g.fillRect(0, -14, 5, 3); break;
      }
      g.restore();
    };
    MAP_NODES.forEach(n => { if (n.icon) icon(n); });
    // winieta
    const vg = g.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 250);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(70,40,10,0.55)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#5a3a20'; g.lineWidth = 3; g.strokeRect(3, 3, W - 6, H - 6);
    g.strokeStyle = '#8a6a40'; g.lineWidth = 1; g.strokeRect(7, 7, W - 14, H - 14);
    G_MAP.canvas = c;
    return c;
  }
  function drawCurve(na, nb, kk) {
    ctx.beginPath();
    const steps = 30;
    for (let s = 0; s <= steps * kk; s++) { const p = mapSeg(na, nb, s / steps); s ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    const p = mapSeg(na, nb, kk); ctx.lineTo(p[0], p[1]);
    ctx.stroke();
  }
  function drawRoute(fromNode, toNode, k) {
    // wszystkie drogi kreskowane, przebyte — czerwone, bieżąca — animowana
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(90,60,30,0.6)'; ctx.setLineDash([3, 3]);
    Object.keys(MAP_EDGES).forEach(key => { const [a, b] = key.split('-').map(Number); drawCurve(a, b, 1); });
    ctx.setLineDash([]);
    ctx.lineWidth = 2; ctx.strokeStyle = '#b02a1a';
    const path = [0].concat((app.route || []).map(i => i + 1));
    for (let i = 0; i < path.length - 1; i++) drawCurve(path[i], path[i + 1], 1);
    if (app.mapChoice) {
      app.mapChoice.opts.forEach((o, i) => {
        ctx.strokeStyle = i === app.mapChoice.sel ? `rgba(255,208,64,${0.6 + Math.sin(app.t * 0.2) * 0.3})` : 'rgba(176,42,26,0.35)';
        ctx.lineWidth = i === app.mapChoice.sel ? 3 : 2; drawCurve(fromNode, o + 1, 1);
      });
    } else if (fromNode !== toNode) { ctx.strokeStyle = '#b02a1a'; ctx.lineWidth = 2; drawCurve(fromNode, toNode, k); }
  }
  function drawMapCar(x, y, face, t) {
    ctx.save(); ctx.translate(Math.round(x), Math.round(y - 4 - Math.abs(Math.sin(t * 0.4)) * 1.5)); ctx.scale(face, 1);
    ctx.fillStyle = '#140c10'; ctx.fillRect(-9, -5, 18, 6); ctx.fillRect(-4, -8, 8, 4);
    ctx.fillStyle = '#c03a2a'; ctx.fillRect(-8, -4, 16, 4); ctx.fillStyle = '#9fd0e0'; ctx.fillRect(-3, -7, 5, 3);
    ctx.fillStyle = '#e8e8e0'; ctx.fillRect(7, -3, 2, 1);
    ctx.fillStyle = '#140c10'; ctx.fillRect(-7, 0, 4, 3); ctx.fillRect(3, 0, 4, 3);
    ctx.restore();
  }
  function drawMap() {
    const t = app.t, from = app.mapFrom, to = app.mapTo + 1;
    ctx.drawImage(buildMapCanvas(), 0, 0);
    const k = app.mapChoice ? 0 : clamp((t - 40) / (MAP_ARRIVE - 40), 0, 1);
    const ease = k * k * (3 - 2 * k);
    drawRoute(from, to, ease);
    const route = app.route || [];
    // węzły
    MAP_NODES.forEach((n, i) => {
      if (i === 0) { ctx.fillStyle = '#5a3a20'; ctx.fillRect(n.x - 3, n.y - 3, 6, 6); return; }
      const st = i - 1, cleared = route.includes(st);
      const choice = app.mapChoice && app.mapChoice.opts.includes(st);
      const target = choice ? st === app.mapChoice.opts[app.mapChoice.sel] : st === app.mapTo;
      const skipped = !cleared && ((st === 2 && route.includes(3)) || (st === 3 && route.includes(2)) || (route.length && st < route[route.length - 1] && !choice && st !== app.mapTo));
      const pulse = target ? 2 + Math.sin(t * 0.2) * 1.5 + (G_MAP.flash > 0 ? 3 : 0) : choice ? 1 : 0;
      ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.arc(n.x, n.y, 5 + pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cleared ? '#8a7a60' : skipped ? '#6a6058' : target ? '#ffd040' : '#e8dcc0'; ctx.beginPath(); ctx.arc(n.x, n.y, 4 + pulse, 0, Math.PI * 2); ctx.fill();
      if (cleared) {
        ctx.strokeStyle = '#c0201a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(n.x - 6, n.y - 6); ctx.lineTo(n.x + 6, n.y + 6); ctx.moveTo(n.x + 6, n.y - 6); ctx.lineTo(n.x - 6, n.y + 6); ctx.stroke();
      }
    });
    if (G_MAP.flash > 0) G_MAP.flash--;
    // samochód
    const p = mapSeg(from, to, ease), q = mapSeg(from, to, Math.min(1, ease + 0.02));
    drawMapCar(p[0], p[1], q[0] >= p[0] ? 1 : -1, t);
    // ramka portretu
    app.mapTeam.forEach((m, i) => {
      const ox = 12 + i * 34;
      ctx.fillStyle = app.mapTeam.length > 1 ? P_COLS[i] : '#140c10'; ctx.fillRect(ox, 12, 30, 30);
      ctx.fillStyle = '#2a3a5a'; ctx.fillRect(ox + 1, 13, 28, 28);
      ctx.save(); ctx.beginPath(); ctx.rect(ox + 1, 13, 28, 28); ctx.clip();
      SP.drawPortrait(ctx, m.b, ox + 15, 29, 10, false);
      ctx.restore();
    });
    // pasek z nazwą / wyborem trasy
    if (app.mapChoice) { ctx.fillStyle = 'rgba(20,12,16,0.82)'; ctx.fillRect(0, 162, W, 56); ctx.fillStyle = '#d0a040'; ctx.fillRect(0, 162, W, 1); }
    else if (t > MAP_ARRIVE - 10) {
      const a = clamp((t - MAP_ARRIVE + 10) / 20, 0, 1);
      ctx.fillStyle = `rgba(20,12,16,${0.8 * a})`; ctx.fillRect(0, 168, W, 40);
      ctx.fillStyle = `rgba(208,160,64,${a})`; ctx.fillRect(0, 168, W, 1); ctx.fillRect(0, 207, W, 1);
    }
  }
  function drawMapText() {
    const t = app.t, st = STAGES[app.mapTo];
    text('MAPA REGIONU', W / 2, 12, 8, '#5a3a20', 'center', true);
    if (app.mapChoice) {
      const c = app.mapChoice;
      text('WYBIERZ TRASĘ', W / 2, 168, 8, '#ffe080', 'center');
      c.opts.forEach((o, i) => {
        const sel = i === c.sel, x = i ? W * 0.74 : W * 0.26;
        text((sel ? '► ' : '') + shortName(STAGES[o]), x, 184, 6, sel ? '#fff' : '#a09080', 'center');
        text(STAGES[o].label === '3A' ? 'BOSS: BRACIA TRZASK' : 'BOSS: STARY KIEŁ', x, 196, 4, sel ? '#ff9a80' : '#8a7060', 'center');
      });
      if (t % 50 < 35) text('◄ ► WYBÓR   {ok|ENTER} — JEDZIEMY', W / 2, 210, 4, '#ffe080', 'center');
    }
    const tx = 14 + app.mapTeam.length * 34;
    text(app.mapTeam.map(m => m.name).join(' + '), tx, 16, 5, '#5a3a20', 'left', true);
    text('ETAP ' + st.label + ' / ' + RUN_LEN, tx, 26, 5, '#7a5a30', 'left', true);
    if (app.mapChoice) return;
    const n = MAP_NODES[app.mapTo + 1];
    if (t > 40) text(st.label, n.x, n.y - 3, 4, '#140c10', 'center', true);
    if (t > MAP_ARRIVE - 10) {
      const name = shortName(st);
      text(name, W / 2, 174, 10, '#ffe080', 'center');
      if (t > MAP_ARRIVE + 15) text(st.sub, W / 2, 192, 5, '#fff', 'center');
    }
    if (!app.mapChoice && t > 20 && t % 50 < 35) text('{ok|ENTER} — DALEJ', W - 12, 212, 4, '#5a3a20', 'right', true);
  }

  // ---- wybór etapu (tylko w trybie debug): podgląd tła wybranego etapu + lista (+ etap bonusowy)
  const SEL_COUNT = STAGES.length + 3;
  const SEL_EXTRA = ['BONUS — AUTOSTRADA 7', 'BONUS — ZAGRODA', 'BONUS — LOT NAD ZATOKĄ'];
  const SEL_DY = Math.min(21, 164 / SEL_COUNT);
  function drawStageSel() {
    const st = app.stageSel === STAGES.length + 1 ? window.SPECIAL_STAGES.cages : STAGES[Math.min(app.stageSel, STAGES.length - 1)], L = st.buildLayers();
    const camX = (app.t * 0.8) % (st.LEN - W);
    st.drawBack(ctx, L, camX, app.t);
    st.drawFront(ctx, L, camX, app.t);
    ctx.fillStyle = 'rgba(8,4,14,0.62)'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < SEL_COUNT; i++) {
      const y = 34 + i * SEL_DY, sel = i === app.stageSel;
      ctx.fillStyle = sel ? '#ffb030' : 'rgba(60,40,80,0.8)'; ctx.fillRect(40, y - 2, W - 80, SEL_DY - 2);
      ctx.fillStyle = sel ? '#3a2a5a' : 'rgba(30,20,40,0.85)'; ctx.fillRect(41, y - 1, W - 82, SEL_DY - 4);
    }
  }
  function drawStageSelText() {
    text('WYBÓR ETAPU', W / 2, 12, 10, '#ffe080', 'center');
    text('DEBUG', W - 8, 4, 5, '#ff8060', 'right');
    for (let i = 0; i < SEL_COUNT; i++) {
      const y = 34 + i * SEL_DY - 1, sel = i === app.stageSel;
      const name = i < STAGES.length ? STAGES[i].name : SEL_EXTRA[i - STAGES.length];
      text(name, 52, y + 3, 6, sel ? '#fff' : (i < STAGES.length ? '#a090b0' : '#c0a060'));
      if (sel) text('►', 44, y + 3, 6, '#ffe040');
    }
    if (app.t % 50 < 35) text('▲ ▼ WYBÓR   {ok|ENTER} START   {back|ESC} — WSTECZ', W / 2, 202, 5, '#fff', 'center');
  }

  // ---- etap bonusowy
  function startBonus(team, nextIdx) {
    if (team && !Array.isArray(team)) team = [team];
    if (team) saveProgress({ type: 'bonus', next: nextIdx }, team);
    app.mode = 'bonus'; app.t = 0; app.bonusNext = nextIdx; app.bonusKind = 'drive';
    app.bonusTeam = team || makeTeam();
    app.bonusPlayer = app.bonusTeam[0];
    bonus.start(app.bonusTeam);
  }
  function startFlight(team, nextIdx) {
    if (team && !Array.isArray(team)) team = [team];
    if (team) saveProgress({ type: 'flight', next: nextIdx }, team);
    app.mode = 'bonus'; app.t = 0; app.bonusNext = nextIdx; app.bonusKind = 'flight';
    app.bonusTeam = team || makeTeam();
    app.bonusPlayer = app.bonusTeam[0];
    flight.start(app.bonusTeam);
  }

  // ---- tabela wyników i wpisywanie inicjałów
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZĄĆĘŁŃÓŚŹŻ0123456789.-! '.split('');
  function qualifies(score) { return score > 0 && (app.scores.length < 10 || score > app.scores[app.scores.length - 1].s); }
  // ---- tabele: zwykła gra, Boss Rush (pokonani bossowie, potem czas), przetrwanie (fale, potem wynik)
  const TABLES = {
    main: { key: 'paleo_scores', title: 'NAJLEPSZE WYNIKI', cmp: (a, b) => b.s - a.s },
    rush: { key: 'paleo_rush', title: 'BOSS RUSH', cmp: (a, b) => (b.b - a.b) || (a.f - b.f) },
    surv: { key: 'paleo_surv', title: 'PRZETRWANIE', cmp: (a, b) => (b.w - a.w) || (b.s - a.s) },
    daily: { get key() { return 'paleo_daily_' + dailyId(); }, get title() { return 'CODZIENNE ' + dailyLabel(); }, cmp: (a, b) => b.s - a.s }
  };
  const TABLE_KEYS = ['main', 'rush', 'surv', 'daily'];
  const fmtTime = f => { const sec = Math.floor(f / 60); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0') + '.' + String(Math.floor((f % 60) / 0.6)).padStart(2, '0'); };
  function loadTable(k) {
    if (k === 'main') return app.scores;
    const v = loadJSON(TABLES[k].key);
    if (Array.isArray(v) && v.length) return v.slice(0, 10);
    if (k === 'daily') return [];
    const def = k === 'rush'
      ? [['BAR', 6, 21600], ['RDZ', 6, 25200], ['ANA', 6, 28800], ['KŁY', 5, 21600], ['TUR', 5, 27000], ['NIN', 4, 18000], ['REX', 3, 14400], ['ŻMI', 2, 9000], ['HWY', 1, 5400], ['PAL', 1, 7200]]
        .map(([n, b, f], i) => ({ n, b, f, c: CHAR_KEYS[i % 4] }))
      : [['ANA', 25, 90000], ['TUR', 20, 70000], ['KRK', 16, 52000], ['BOR', 12, 40000], ['NIN', 10, 30000], ['DIN', 8, 22000], ['REX', 6, 15000], ['ŻMI', 5, 11000], ['HWY', 3, 6000], ['PAL', 2, 3000]]
        .map(([n, w, sc], i) => ({ n, w, s: sc, c: CHAR_KEYS[i % 4] }));
    return def;
  }
  app.tables = { main: app.scores, rush: loadTable('rush'), surv: loadTable('surv'), daily: loadTable('daily') };
  function qualifiesIn(table, rec) {
    const T = app.tables[table], cmp = TABLES[table].cmp;
    return (table !== 'main' || rec.s > 0) && (T.length < 10 || cmp(rec, T[T.length - 1]) < 0);
  }
  function qualifies(score) { return qualifiesIn('main', { s: score }); }
  // zakończ rozgrywkę: kolejka wpisów inicjałów dla graczy, którzy weszli do tabeli
  function endRun(table, recs) {
    AU.stopMusic();
    app.entryQueue = recs.slice().sort(TABLES[table].cmp).map(r => Object.assign({ table }, r));
    app.lastTable = table;
    nextEntry(-1);
  }
  // ---- ZAPIS POSTĘPU (tylko zwykła gra): zapisywany przed każdym kolejnym krokiem trasy
  const SAVE_KEY = 'paleo_save';
  app.save = loadJSON(SAVE_KEY);
  function saveProgress(point, team) {
    if (!team || app.gameMode !== 'arcade') return;
    const data = {
      v: 1, point, route: (app.route || []).slice(), run: app.run || null, p2: !!app.p2Active, ngp: !!app.ngpRun, ts: Date.now(),
      players: team.map(q => ({ key: q.key, pIdx: q.pIdx, alt: q.b !== CHARS[q.key].build, score: q.score, lives: Math.max(0, q.lives), nextLife: q.nextLife || 30000, amber: q.amber || 0, up: q.up }))
    };
    safeSet(SAVE_KEY, JSON.stringify(data)); app.save = data;
  }
  function clearProgress() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* brak */ } app.save = null; }
  function saveLabel(d) {
    const pt = d.point, dt = new Date(d.ts);
    const where = (d.ngp ? 'NG+ ' : '') + (pt.type === 'escape' ? 'EPILOG' : pt.type === 'truefinal' ? 'FINAŁ' : pt.type === 'branch' ? 'WYBÓR TRASY' : pt.type === 'bonus' ? 'BONUS AUTOSTRADA' : pt.type === 'flight' ? 'BONUS LOT' : pt.type === 'cages' ? 'BONUS ZAGRODA' : pt.type === 'train' ? 'POCIĄG' : 'ETAP ' + STAGES[pt.idx].label);
    const date = String(dt.getDate()).padStart(2, '0') + '.' + String(dt.getMonth() + 1).padStart(2, '0') + ' ' + String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
    return where + ' — ' + d.players.map(r => CHARS[r.key].name).join('+') + ' — ' + d.players.reduce((a, r) => a + r.score, 0) + ' PKT — ' + date;
  }
  function resumeProgress() {
    const d = app.save; if (!d) return;
    clearCheats();
    app.gameMode = 'arcade'; app.ngpRun = !!d.ngp; app.route = d.route.slice(); app.run = d.run || { cages: false, secrets: 0 }; app.p2Active = !!d.p2; G = null;
    const team = d.players.map(r => { const p = makePlayer(r.key, r.pIdx, r.alt); p.score = r.score; p.lives = r.lives; p.nextLife = r.nextLife; p.amber = r.amber || 0; if (r.up) Object.assign(p.up, r.up); return p; });
    app.sel = Math.max(0, selKeys().indexOf(team[0].key)); if (team[1]) app.sel2 = Math.max(0, selKeys().indexOf(team[1].key));
    const pt = d.point;
    if (pt.type === 'branch') goMap('branch', team);
    else if (pt.type === 'bonus') startBonus(team, pt.next);
    else if (pt.type === 'flight') startFlight(team, pt.next);
    else if (pt.type === 'cages') startCages(team, pt.next);
    else if (pt.type === 'train') startTrain(team, pt.next);
    else if (pt.type === 'escape') startEscape(team);
    else if (pt.type === 'truefinal') startTrueFinal(team);
    else goMap(pt.idx, team);
  }
  function endGame(stageLabel) {
    if (app.gameMode === 'arcade' || !app.gameMode) clearProgress();
    const team = (G && G.players) || app.bonusTeam || [];
    endRun('main', cheated() ? [] : team.map(q => ({ s: q.score, st: stageLabel, c: q.key, pIdx: q.pIdx })));   // z kodami bez wpisu do tabeli
  }
  function nextEntry(lastHi) {
    while (app.entryQueue && app.entryQueue.length) {
      const q = app.entryQueue.shift();
      const rec = Object.assign({}, q); delete rec.table; delete rec.pIdx;
      // poza lokalną dziesiątką wynik może jeszcze trafić do tabeli światowej
      const local = qualifiesIn(q.table, rec);
      if (!local && !netWorthy(q.table, rec)) continue;
      app.mode = 'entry'; app.t = 0;
      const last = loadJSON('paleo_initials');
      app.entry = { letters: Array.isArray(last) && last.length === 3 ? last.slice() : [0, 0, 0], pos: 0, table: q.table, rec, c: q.c, pIdx: q.pIdx || 0, score: q.s || 0, time: 30 * 60, local };
      AU.stopMusic(); AU.play('map'); sfx('oneup');
      return;
    }
    showScores(lastHi, false, app.lastTable || 'main');
  }
  function commitEntry() {
    const e = app.entry, k = e.table;
    const rec = Object.assign({ n: e.letters.map(i => LETTERS[i]).join('') }, e.rec);
    safeSet('paleo_initials', JSON.stringify(e.letters));
    if (e.local) {
      const T = app.tables[k];
      T.push(rec); T.sort(TABLES[k].cmp);
      app.tables[k] = T.slice(0, 10);
      if (k === 'main') { app.scores = app.tables.main; app.hiscore = app.scores[0].s; }
      safeSet(TABLES[k].key, JSON.stringify(app.tables[k]));
    }
    netSubmit(k, rec);
    sfx('start');
    nextEntry(e.local ? app.tables[k].indexOf(rec) : -1);
  }
  function entryLabel(e) {
    if (e.table === 'rush') return 'BOSSOWIE ' + e.rec.b + '/6   CZAS ' + fmtTime(e.rec.f);
    if (e.table === 'surv') return 'FALA ' + e.rec.w + '   WYNIK ' + e.rec.s;
    return 'WYNIK ' + e.rec.s;
  }
  function showScores(hi, attract, table) {
    app.mode = 'scores'; app.t = 0; app.scoresHi = hi; app.attract = attract; app.scoreTable = table || 'main'; app.scoreNet = false;
    if (!attract) { AU.stopMusic(); AU.play('title'); }
  }
  function drawScoresBg() {
    const s1 = STAGES[0], L = s1.buildLayers();
    const camX = ((app.frame || 0) * 0.5 + 900) % (s1.LEN - W);
    s1.drawBack(ctx, L, camX, app.frame || 0);
    ctx.fillStyle = 'rgba(8,4,14,0.78)'; ctx.fillRect(0, 0, W, H);
  }
  function drawScores() {
    drawScoresBg();
    scoreRows().forEach((r, i) => {
      const y = 40 + i * 16;
      if (i === app.scoresHi && !app.scoreNet && app.t % 20 < 12) { ctx.fillStyle = 'rgba(255,200,60,0.25)'; ctx.fillRect(28, y - 3, W - 56, 15); }
      const ch = CHARS[r.c] || CHARS.kruk;
      ctx.save(); ctx.beginPath(); ctx.rect(304, y - 3, 14, 14); ctx.clip();
      ctx.fillStyle = '#2a3a5a'; ctx.fillRect(304, y - 3, 14, 14);
      SP.drawPortrait(ctx, ch.build, 311, y + 5, 4.5, false);
      ctx.restore();
    });
  }
  function drawScoresText() {
    const k = app.scoreTable, T = scoreRows();
    text('◄ ' + TABLES[k].title + ' ►', W / 2, 12, 9, '#ffe080', 'center');
    if (net.on && !app.attract) text(app.scoreNet ? '▲▼  LOKALNE / [ŚWIAT]' : '▲▼  [LOKALNE] / ŚWIAT', W / 2, 196, 5, app.scoreNet ? '#80d0ff' : '#c0c0c0', 'center');
    const st = netStatus(); if (st) text(st, W / 2, 110, 6, '#80d0ff', 'center');
    const heads = k === 'rush' ? [['BOSSOWIE', 200, 'center'], ['CZAS', 268, 'right']] : k === 'surv' ? [['FALA', 190, 'center'], ['WYNIK', 268, 'right']] : [['WYNIK', 230, 'right'], ['ETAP', 268, 'center']];
    [['MIEJSCE', 50, 'center'], ['INICJAŁY', 107, 'center'], ['POSTAĆ', 311, 'center']].concat(heads).forEach(([l, x, al]) => text(l, x, 28, 4, '#8a80a0', al));
    const cols = ['#ffe040', '#e0e0f0', '#e0a060'];
    T.forEach((r, i) => {
      const y = 40 + i * 16, col = i === app.scoresHi && !app.scoreNet ? '#7cff7c' : (cols[i] || '#c0b8d0');
      text(String(i + 1).padStart(2, ' ') + '.', 40, y, 7, col);
      text(r.n, 96, y, 7, col);
      if (k === 'rush') { text(r.b + '/' + RUSH_ORDER.length, 200, y, 7, col, 'center'); text(fmtTime(r.f), 268, y, 6, col, 'right'); }
      else if (k === 'surv') { text(String(r.w), 190, y, 7, col, 'center'); text(String(r.s).padStart(6, '0'), 268, y, 6, col, 'right'); }
      else { text(String(r.s).padStart(7, '0'), 230, y, 7, col, 'right'); text(String(r.st), 268, y, 7, col, 'center'); }
    });
    if (app.t % 50 < 35) text(app.attract ? 'NACIŚNIJ ENTER' : '◄ ► TABELA   {back|ESC} — MENU', W / 2, 206, 5, '#fff', 'center');
  }
  function drawEntry() {
    drawScoresBg();
    const e = app.entry;
    for (let i = 0; i < 3; i++) {
      const x = 132 + i * 44, cur = i === e.pos;
      ctx.fillStyle = cur ? '#ffb030' : '#3a2a4a'; ctx.fillRect(x - 1, 89, 34, 40);
      ctx.fillStyle = cur ? '#3a2a5a' : '#1e1628'; ctx.fillRect(x, 90, 32, 38);
    }
    ctx.save(); ctx.beginPath(); ctx.rect(36, 88, 44, 44); ctx.clip();
    ctx.fillStyle = '#2a3a5a'; ctx.fillRect(36, 88, 44, 44);
    SP.drawPortrait(ctx, (CHARS[e.c] || CHARS.kruk).build, 58, 112, 15, false);
    ctx.restore();
  }
  function drawEntryText() {
    const e = app.entry;
    text(e.local ? 'NOWY REKORD!' : 'TABELA ŚWIATOWA', W / 2, 18, 14, app.t % 20 < 10 ? '#ffe040' : '#ff9040', 'center');
    if ((G && G.players.length > 1) || (app.bonusTeam && app.bonusTeam.length > 1)) text('GRACZ ' + (e.pIdx + 1), 58, 136, 5, P_COLS[e.pIdx], 'center');
    text(entryLabel(e), W / 2, 44, 7, '#80d0ff', 'center');
    text('WPISZ INICJAŁY', W / 2, 64, 6, '#fff', 'center');
    for (let i = 0; i < 3; i++) {
      const x = 132 + i * 44 + 16;
      const ch = i < e.pos || i === e.pos ? LETTERS[e.letters[i]] : '·';
      text(ch, x, 100, 18, i === e.pos && app.t % 30 < 20 ? '#ffe040' : '#fff', 'center');
      if (i === e.pos) { text('▲', x, 80, 5, '#ffe040', 'center'); text('▼', x, 132, 5, '#ffe040', 'center'); }
    }
    text('▲▼ LITERA   ◄► POZYCJA   {ok|ATAK/ENTER} — ZATWIERDŹ   {back|ESC} — COFNIJ', W / 2, 160, 4, '#c0c0c0', 'center');
    text('CZAS ' + Math.ceil(e.time / 60), W / 2, 176, 6, e.time < 600 ? '#ff6060' : '#fff', 'center');
  }

  function drawEnding() {
    const t = app.t;
    if (app.trueEnd) { drawEndingTrue(t); return; }
    if (app.ngpRun) { drawEndingNgp(t); return; }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#3a5a9a'); g.addColorStop(0.5, '#f0a060'); g.addColorStop(0.75, '#ffe0a0'); g.addColorStop(1, '#5a8a3a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff4c0'; ctx.beginPath(); ctx.arc(W / 2, 150 - Math.min(40, t * 0.1), 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a6a3a'; ctx.fillRect(0, 160, W, H - 160);
    ctx.fillStyle = '#2e5a30'; for (let i = 0; i < 30; i++) ctx.fillRect((i * 47 + t * 0.2) % W, 162 + (i * 13) % 50, 6, 2);
    // dinozaury na wolności
    SP.drawRaptor(ctx, (t * 1.1) % (W + 120) - 60, 186, 1, t, 'run', RAPTOR_COLS[1], {});
    SP.drawPachy(ctx, W + 60 - (t * 0.6) % (W + 120), 200, -1, t, 'walk', PACHY_COLS[0], {});
    SP.drawRaptor(ctx, (t * 0.9 + 200) % (W + 120) - 60, 210, 1, t + 20, 'run', RAPTOR_COLS[0], {});
    CHAR_KEYS.forEach((k, i) => {
      const pose = (t + i * 20) % 90 < 30 ? P.victory[0] : P.idle[Math.floor(t / 28) % 2];
      SP.drawFigure(ctx, CHARS[k].build, pose, 136 + i * 38, 196 + (i % 2) * 6, i >= 2 ? -1 : 1, { weapon: CHARS[k].innate });
    });
  }
  function drawEndingNgp(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#060818'); g.addColorStop(0.6, '#1a1a3a'); g.addColorStop(1, '#14261a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 50; i++) { if ((t + i * 7) % 120 < 100) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect((i * 61) % W, (i * 23) % 120, 1, 1); } }
    ctx.fillStyle = '#e8e6d0'; ctx.beginPath(); ctx.arc(310, 40, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#14261a'; ctx.fillRect(0, 160, W, H - 160);
    // ognisko
    const fx = W / 2, fy = 196;
    ctx.fillStyle = 'rgba(255,150,50,0.15)'; ctx.beginPath(); ctx.arc(fx, fy - 8, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(fx - 12, fy - 2, 24, 4);
    for (let i = 0; i < 6; i++) { const k = (t * 0.06 + i / 6) % 1; ctx.fillStyle = k < 0.4 ? '#ffe36a' : k < 0.7 ? '#ff9a2a' : 'rgba(200,60,20,0.6)'; ctx.beginPath(); ctx.arc(fx + Math.sin(i * 3 + t * 0.2) * 4, fy - 4 - k * 18, 5 * (1 - k) + 1, 0, Math.PI * 2); ctx.fill(); }
    // śpiące dinozaury i bohaterowie przy ognisku
    SP.drawPachy(ctx, 60, 206, 1, 0, 'idle', PACHY_COLS[1], {});
    SP.drawTrike(ctx, 330, 210, -1, 0, 'idle', TRIKE_COLS[0], {});
    selKeys().forEach((k, i) => {
      const x = fx + (i - (selKeys().length - 1) / 2) * 34 + (i >= selKeys().length / 2 ? 30 : -30);
      SP.drawFigure(ctx, CHARS[k].build, P.idle[Math.floor((t + i * 9) / 28) % 2], x, 204 + (i % 2) * 4, x < fx ? 1 : -1, { weapon: CHARS[k].innate });
    });
  }
  function drawEndingTrue(t) {
    // świt nad zatoką: uwolnione dinozaury i bohaterowie na plaży
    const g = ctx.createLinearGradient(0, 0, 0, 150);
    g.addColorStop(0, '#4a5aa0'); g.addColorStop(0.6, '#f0a080'); g.addColorStop(1, '#ffe0a0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 150);
    ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.arc(W / 2, 130, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a7a9a'; ctx.fillRect(0, 130, W, 24);
    ctx.fillStyle = 'rgba(255,240,180,0.6)'; for (let i = 0; i < 8; i++) ctx.fillRect(W / 2 - 30 + Math.sin(t * 0.05 + i) * 6, 134 + i * 2.5, 60 - i * 6, 1);
    ctx.fillStyle = '#e0c890'; ctx.fillRect(0, 154, W, H - 154);
    for (let i = 0; i < 3; i++) { const x = ((t * (0.6 + i * 0.2) + i * 140) % (W + 120)) - 60; SP.drawPtera(ctx, x, 40 + i * 18 + Math.sin(t * 0.05 + i) * 6, 1, t + i * 7, 'fly', {}); }
    SP.drawRaptor(ctx, ((t * 0.9) % (W + 160)) - 80, 196, 1, t, 'run', RAPTOR_COLS[0], {});
    SP.drawRaptor(ctx, ((t * 0.9 + 60) % (W + 160)) - 80, 206, 1, t + 5, 'run', RAPTOR_COLS[1] || RAPTOR_COLS[0], { scale: 0.7 });
    SP.drawTrike(ctx, 320, 196, -1, t, 'idle', TRIKE_COLS[0], {});
    const team = (G && G.players) || [];
    team.forEach((q, i) => SP.drawFigure(ctx, q.b, (t + i * 20) % 90 < 30 ? P.victory[0] : P.idle[Math.floor(t / 28) % 2], 150 + i * 40, 204, 1, {}));
  }
  function drawEndingText() {
    const t = app.t;
    if (app.trueEnd) {
      text('PRAWDZIWE ZAKOŃCZENIE', W / 2, 10, 11, '#ffe080', 'center');
      if (t > 60) text('BURSZTYNOWY KOLOS ROZPADŁ SIĘ W PIASEK.', W / 2, 30, 5, '#fff', 'center');
      if (t > 120) text('UWOLNIONE DINOZAURY ZOSTAŁY NAD ZATOKĄ — NIKT JUŻ ICH NIE ZŁAPIE.', W / 2, 42, 5, '#fff', 'center');
      if (t > 180) text('A STARA AUTOSTRADA PROWADZI TERAZ TYLKO DO DOMU.', W / 2, 54, 5, '#fff', 'center');
      if (t > 240) text('WYNIK: ' + G.players.map(q => q.score).join(' / '), W / 2, 70, 8, '#2a3a6a', 'center', true);
      if (t > 300 && t % 50 < 35) text('DZIĘKUJEMY ZA GRĘ!   {ok|ENTER} — MENU', W / 2, 86, 5, '#2a1a10', 'center', true);
      if (t > 300) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 98, 4, '#2a1a10', 'center', true);
      return;
    }
    if (app.ngpRun) {
      text('ZAKOŃCZENIE NOWEJ GRY+', W / 2, 14, 11, '#ffe080', 'center');
      if (t > 60) text('BURSZTYNOWE SERCE TWIERDZY ZGASŁO NA ZAWSZE.', W / 2, 40, 5, '#fff', 'center');
      if (t > 120) text('DINOZAURY WRÓCIŁY DO DOLINY, A AUTOSTRADĘ POROSŁA DŻUNGLA.', W / 2, 52, 5, '#fff', 'center');
      if (t > 180) text('PRZY OGNISKU NIKT JUŻ NIE PYTA, KTO BYŁ PO KTÓREJ STRONIE.', W / 2, 64, 5, '#fff', 'center');
      if (t > 240) text('WYNIK: ' + G.players.map(q => q.score).join(' / '), W / 2, 82, 8, '#80d0ff', 'center');
      if (t > 300 && t % 50 < 35) text('DZIĘKUJEMY ZA GRĘ — NAPRAWDĘ!   {ok|ENTER} — MENU', W / 2, 104, 5, '#c0f0c0', 'center');
      if (t > 300) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 116, 4, '#c0e0ff', 'center');
      return;
    }
    if (t > 260 && app.newUnlocks) text('ODBLOKOWANO: NOWA GRA+ I BARON BURSZTYN!', W / 2, 120, 5, '#ffe040', 'center');
    if (t > 300) text('SEKRET: UWOLNIJ WSZYSTKIE DINOZAURY W ZAGRODZIE I ODKRYJ 3 SEKRETY W JEDNYM PRZEJŚCIU...', W / 2, 146, 3.5, '#3a2a1a', 'center', true);
    text('KONIEC', W / 2, 16, 16, '#ffe040', 'center');
    if (t > 60) text('KŁUSOWNICY ZOSTALI POKONANI.', W / 2, 46, 6, '#fff', 'center');
    if (t > 120) text('DINOZAURY ZNÓW SĄ WOLNE.', W / 2, 58, 6, '#fff', 'center');
    if (t > 180) text('WYNIK: ' + G.players.map(q => q.score).join(' / '), W / 2, 76, 8, '#80d0ff', 'center');
    if (t > 240) text('PALEO HIGHWAY — RDZA I KŁY', W / 2, 96, 5, '#2a1a10', 'center', true);
    if (t > 300 && t % 50 < 35) text('{ok|ENTER} — POWRÓT DO MENU', W / 2, 108, 5, '#2a1a10', 'center', true);
    if (t > 300) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 134, 4, '#5a3a20', 'center', true);
  }

