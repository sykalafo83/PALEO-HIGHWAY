  // =============================================================== BOSS RUSH
  const RUSH_ORDER = [0, 1, 2, 3, 4, 5, 6, 7];
  function startRush(team) { app.rush = { i: 0, frames: 0, done: 0 }; rushFight(team); }
  function rushFight(team) {
    const idx = RUSH_ORDER[app.rush.i];
    startStage(idx, team);
    G.rush = true; G.introT = 0; G.rushCard = 150;
    const WV = G.WAVES, last = WV.length - 1;
    G.waveIdx = last; G.camX = WV[last].lock;
    G.players.forEach((q, i) => { q.x = G.camX + 70 + i * 26; q.y = 180 + i * 14; setState(q, 'idle'); });
    app.mode = 'play'; app.t = 0;
  }
  function rushNext() {
    const R = app.rush; R.done++; R.i++;
    if (R.i >= RUSH_ORDER.length) { unlock('rush'); rushEnd(); return; }
    rushFight(G.players);
  }
  function rushEnd() {
    const R = app.rush;
    endRun('rush', G.players.map(q => ({ b: R.done, f: R.frames, c: q.key, pIdx: q.pIdx })));
  }

  // =============================================================== PRZETRWANIE
  const SURV_POOLS = [['grunt', 'thin'], ['brute', 'bomber', 'raptor'], ['gunner', 'shield', 'netter', 'pachy', 'para'], ['sniper', 'ptera', 'trike']];
  const SURV_BOSSES = ['boss', 'zmija', 'klin', 'szpon', 'baron', 'rex'];
  function startSurvival(team) {
    startStage(0, team, window.SPECIAL_STAGES.survival);
    G.surv = { wave: 0, state: 'rest', t: 120 };
    app.mode = 'play'; app.t = 0;
  }
  function spawnSurvWave(n) {
    ST.diff = Math.min(2.2, 1 + n * 0.05);
    const pool = [].concat(...SURV_POOLS.slice(0, 1 + Math.min(3, Math.floor(n / 3))));
    const cnt = Math.min(2 + Math.floor(n * 0.7), 9);
    for (let i = 0; i < cnt; i++) {
      const tp = pool[Math.random() * pool.length | 0];
      G.pending.push({ type: tp, side: i % 2 ? 'L' : 'R', y: rnd(FLOOR_TOP + 10, FLOOR_BOTTOM - 4), delay: 1 + i * 35 });
    }
    if (n % 10 === 0) G.pending.push({ type: SURV_BOSSES[(n / 10 - 1) % SURV_BOSSES.length], side: 'R', y: 186, delay: 60 });
    else if (n % 5 === 0) G.pending.push({ type: 'whitefang', side: 'L', y: 190, delay: 60 });
    G.popups.push({ x: G.camX + W / 2, y: 110, txt: 'FALA ' + n, t: 0, col: '#ffe080' });
    sfx('go');
  }
  function updateSurvival() {
    const V = G.surv;
    if (G.introT > 0) return;
    if (V.state === 'rest') {
      if (--V.t <= 0) { V.wave++; spawnSurvWave(V.wave); V.state = 'fight'; }
      return;
    }
    if (G.pending.length === 0 && foes().filter(a => a.hp > 0).length === 0) {
      V.state = 'rest'; V.t = 180;
      G.players.forEach(q => { if (q.alive) addScore(q, V.wave * 300); });
      G.popups.push({ x: G.camX + W / 2, y: 110, txt: 'FALA ' + V.wave + ' POKONANA!  +' + V.wave * 300, t: 0, col: '#7cff7c' });
      if (V.wave % 3 === 0) G.items.push({ type: 'meat', x: G.camX + W / 2, y: 190, z: 30, vz: 2, t: 0 });
      if (V.wave >= 10) unlock('surv10');
      sfx('coin');
    }
  }
  function survEnd() {
    const V = G.surv;
    endRun('surv', G.players.map(q => ({ w: Math.max(0, V.wave - (V.state === 'fight' ? 1 : 0)), s: q.score, c: q.key, pIdx: q.pIdx })));
  }
  function finishRun() {
    if (G && G.ch) { if (!G.ch.end) chalEnd(false, 'POKONANY!'); return; }
    if (app.gameMode === 'daily' && G) { endRun('daily', dailyRecs()); return; }
    if (G && G.rush) rushEnd();
    else if (G && G.special === 'survival') survEnd();
    else if (ST && ST.custom) leaveCustom();
    else endGame(ST.label);
  }

  // =============================================================== WŁASNE ETAPY (edytor)
  // Źródła: plik js/stages/custom.js (window.CUSTOM_STAGES) i biblioteka edytora w przeglądarce (paleo_custom).
  function customList() {
    const out = [], seen = {};
    const lib = loadJSON('paleo_custom');
    (Array.isArray(lib) ? lib : []).forEach(d => { if (d && d.id && !seen[d.id]) { seen[d.id] = 1; out.push(Object.assign({ _src: 'EDYTOR' }, d)); } });
    (window.CUSTOM_STAGES || []).forEach(d => { if (d && !seen[d.id]) { seen[d.id || Math.random()] = 1; out.push(Object.assign({ _src: 'PLIK' }, d)); } });
    return out;
  }
  const CUSTOM_TYPES = () => Object.keys(ENEMIES).filter(k => k !== 'dummy');
  function buildCustomStage(d) {
    const theme = clamp(d.theme | 0, 0, STAGES.length - 1), base = STAGES[theme];
    const LEN = clamp(Math.round(d.LEN || 2400), 800, base.LEN);
    const types = CUSTOM_TYPES(), numY = v => clamp(Math.round(+v || 185), FLOOR_TOP + 4, FLOOR_BOTTOM - 2);
    const WAVES = (d.WAVES || []).map(w => {
      const groups = (w.groups || []).map(g => ({ when: Math.max(0, g.when | 0),
        spawns: (g.spawns || []).filter(sp => types.includes(sp.type)).map(sp => ({ type: sp.type, side: sp.side === 'L' ? 'L' : 'R', y: numY(sp.y), delay: Math.max(0, sp.delay | 0) })) }))
        .filter(g => g.spawns.length);
      return { lock: clamp(Math.round(w.lock || 0), 0, LEN - W), groups, boss: groups.some(g => g.spawns.some(sp => ENEMIES[sp.type].boss)) };
    }).filter(w => w.groups.length).sort((a, b) => a.lock - b.lock);
    const PROPS = (d.PROPS || []).filter(pr => ['barrel', 'crate', 'fuel', 'wall'].includes(pr.kind)).map(pr => ({ x: clamp(Math.round(pr.x), 20, LEN - 20), y: numY(pr.y), kind: pr.kind, drop: pr.drop || undefined, secret: pr.kind === 'wall' ? (pr.secret || 'treasure') : undefined }));
    const PICKUPS = (d.PICKUPS || []).map(it => ({ x: clamp(Math.round(it.x), 20, LEN - 20), y: numY(it.y), type: it.type || 'coin' }));
    const VEHICLES = (d.VEHICLES || []).filter(v => v.type === 'jeep' || v.type === 'cart').map(v => ({ type: v.type, x: clamp(Math.round(v.x), 40, LEN - 40), y: numY(v.y) }));
    return Object.assign({}, base, {
      name: String(d.name || 'WŁASNY ETAP').toUpperCase().slice(0, 34), sub: String(d.sub || '').toUpperCase().slice(0, 48), label: 'W', custom: true,
      LEN, WAVES, PROPS, PICKUPS, VEHICLES, special: null, startX: 90,
      music: SONGS_OK(d.music) || base.music, bossMusic: SONGS_OK(d.bossMusic) || base.bossMusic,
      diff: clamp(+d.diff || 1, 0.6, 2.2), storm: !!d.storm && !!base.storm, weather: d.weather || null
    });
  }
  const SONGS_OK = k => (k && window.GameAudio && window.GameAudio.SONGS[k]) ? k : null;
  function startCustom(team) {
    const st = buildCustomStage(app.customData || {});
    startStage(clamp(app.customData.theme | 0, 0, STAGES.length - 1), team, st);
    G.wx = WEATHER[st.weather] ? Object.assign({ id: st.weather }, WEATHER[st.weather]) : null;
    app.mode = 'play'; app.t = 0;
  }
  function leaveCustom() {
    G = null; app.mode = 'extras'; app.sub = 'custom'; app.t = 0; AU.stopMusic(); AU.play('title');
  }

  // =============================================================== WYZWANIA
  // Krótkie zadania z gwiazdkami za czas. Rekordy: localStorage „paleo_chal” ({ id: { stars, best } }).
  const CHALLENGES = [
    { id: 'throws', name: 'RZUTOWIEC', desc: 'POKONAJ 10 WROGÓW RZUTAMI (CHWYT, RZUT W LOCIE, SUPLEX)', arena: 'surv', kind: 'throws', goal: 10, unit: 'RZUTY', limit: 240, stars: [90, 150] },
    { id: 'juggle', name: 'CYRK', desc: 'PODBIJ WROGÓW W POWIETRZU 12 RAZY (▲ + ATAK WYBIJA)', arena: 'surv', kind: 'juggles', goal: 12, unit: 'PODBICIA', limit: 120, stars: [60, 90] },
    { id: 'combo', name: 'MISTRZ KOMBO', desc: 'ZRÓB SERIĘ 25 TRAFIEŃ BEZ PRZERWY', arena: 'surv', kind: 'combo', goal: 25, unit: 'KOMBO', limit: 120, stars: [45, 80] },
    { id: 'nohit', name: 'NIETYKALNY', desc: 'POKONAJ 3 PIERWSZE FALE ZIELONEJ RDZY BEZ OBRAŻEŃ', stage: 0, kind: 'waves', goal: 3, unit: 'FALE', noHit: true, limit: 240, stars: [70, 110] },
    { id: 'sewer', name: 'SUCHA STOPA', desc: 'PRZEJDŹ KANAŁY OTCHŁANI BEZ DOTKNIĘCIA ŚCIEKÓW', stage: 6, kind: 'clear', noSludge: true, limit: 600, stars: [240, 330] },
    { id: 'zebacz', name: 'POSKROMICIEL', desc: 'POKONAJ ZĘBACZA W 60 SEKUND', stage: 6, boss: true, kind: 'clear', limit: 60, stars: [35, 48] },
    { id: 'padlin', name: 'KRÓL ŚMIECI', desc: 'POKONAJ PADLINIARZA W 75 SEKUND', stage: 5, boss: true, kind: 'clear', limit: 75, stars: [45, 60] }
  ];
  app.chal = loadJSON('paleo_chal') || {};
  function startChallenge(team) {
    const d = app.chDef;
    G = null; app.route = [];
    if (d.arena === 'surv') startSurvival(team);
    else {
      startStage(d.stage, team);
      if (d.boss) {
        const WV = G.WAVES, last = WV.length - 1;
        G.waveIdx = last; G.camX = WV[last].lock; G.introT = 0;
        G.players.forEach((q, i) => { q.x = G.camX + 70 + i * 26; q.y = 180 + i * 14; setState(q, 'idle'); });
      }
      app.mode = 'play'; app.t = 0;
    }
    G.wx = null;
    G.ch = { def: d, t: 0, throws: 0, juggles: 0, best: 0, prog: 0, hurt: false, sludge: false, end: false };
  }
  function updateChallenge() {
    const C = G.ch;
    if (!C || C.end || G.introT > 0) return;
    C.t++;
    const d = C.def;
    let ok = false;
    if (d.kind === 'throws') { C.prog = C.throws; ok = C.prog >= d.goal; }
    else if (d.kind === 'juggles') { C.prog = C.juggles; ok = C.prog >= d.goal; }
    else if (d.kind === 'combo') { C.best = Math.max(C.best, ...G.players.map(q => q.comboT > 0 ? q.combo : 0)); C.prog = C.best; ok = C.best >= d.goal; }
    else if (d.kind === 'waves') { C.prog = Math.min(G.waveIdx, d.goal); ok = G.waveIdx >= d.goal; }
    else ok = G.bossDead;
    if (d.noHit && C.hurt) return chalEnd(false, 'OTRZYMANO OBRAŻENIA!');
    if (d.noSludge && C.sludge) return chalEnd(false, 'DOTKNIĘTO ŚCIEKÓW!');
    if (ok) return chalEnd(true);
    if (C.t > d.limit * 60) chalEnd(false, 'KONIEC CZASU!');
  }
  function chalEnd(ok, why) {
    const C = G.ch, d = C.def;
    C.end = true;
    const secs = Math.ceil(C.t / 60), stars = ok ? (secs <= d.stars[0] ? 3 : secs <= d.stars[1] ? 2 : 1) : 0;
    const rec = app.chal[d.id] || { stars: 0, best: 0 };
    const newBest = ok && (!rec.best || secs < rec.best);
    rec.stars = Math.max(rec.stars, stars); if (newBest) rec.best = secs;
    app.chal[d.id] = rec; safeSet('paleo_chal', JSON.stringify(app.chal));
    if (CHALLENGES.every(c => (app.chal[c.id] || {}).stars >= 3)) unlock('chalall');
    app.chRes = { ok, why, secs, stars, newBest };
    app.mode = 'chalres'; app.t = 0; AU.stopMusic(0.3); AU.play(ok ? 'clear' : 'gameover');
  }
  const starStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const mmss = sec => Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  function drawChalHud() {
    const C = G.ch, d = C.def, secs = Math.floor(C.t / 60);
    const prog = d.goal ? '   ' + d.unit + ' ' + C.prog + '/' + d.goal : '';
    text(d.name + prog + '   ' + mmss(secs) + ' / ' + mmss(d.limit), W / 2, 34, 5, '#ffe080', 'center');
    if (d.noHit) text('BEZ OBRAŻEŃ!', W / 2, 43, 4, '#ff9a80', 'center');
    if (d.noSludge) text('NIE DOTYKAJ ŚCIEKÓW!', W / 2, 43, 4, '#a0ff60', 'center');
  }
  function drawChalRes() {
    const r = app.chRes, d = G.ch.def;
    text(d.name, W / 2, 50, 10, '#ffe080', 'center');
    text(r.ok ? 'WYZWANIE UKOŃCZONE!' : 'NIEUDANE — ' + (r.why || ''), W / 2, 72, 7, r.ok ? '#7cff7c' : '#ff8080', 'center');
    if (r.ok) {
      text(starStr(r.stars), W / 2, 92, 16, '#ffe040', 'center');
      text('CZAS ' + mmss(r.secs) + (r.newBest ? '   NOWY REKORD!' : ''), W / 2, 122, 6, '#fff', 'center');
      text('3★ DO ' + mmss(d.stars[0]) + '   2★ DO ' + mmss(d.stars[1]), W / 2, 136, 4, '#c0c0c0', 'center');
    }
    if (app.t > 40 && app.t % 50 < 35) text('{ok|ENTER} — POWTÓRZ   {back|ESC} — LISTA WYZWAŃ', W / 2, 170, 5, '#fff', 'center');
  }
  // ---- ekran listy wyzwań (pierwsza pozycja: codzienne wyzwanie)
  function drawChalList() { drawScoresBg(); }
  function drawChalListText() {
    text('WYZWANIA', W / 2, 8, 10, '#ffe080', 'center');
    const D = dailyPlan(), best = (app.tables.daily || [])[0];
    const rows = [{ name: 'CODZIENNE WYZWANIE ' + dailyLabel(), desc: shortName(STAGES[D.idx]) + ' • POGODA: ' + (WEATHER[D.wx] ? WEATHER[D.wx].name : 'POGODNIE') + ' • LOSOWI WROGOWIE • BEZ KONTYNUACJI', right: best ? 'REKORD ' + best.s : 'BRAK WYNIKÓW', daily: true }]
      .concat(CHALLENGES.map(c => { const r = app.chal[c.id] || { stars: 0, best: 0 }; return { name: c.name, desc: c.desc, right: starStr(r.stars) + (r.best ? '  ' + mmss(r.best) : '') }; }));
    rows.forEach((r, i) => {
      const y = 26 + i * 21, sel = i === app.chSel;
      text((sel ? '► ' : '') + r.name, 22, y, 6, sel ? '#ffe040' : r.daily ? '#80d0ff' : '#e0e0f0');
      text(r.right, W - 20, y, 5, r.daily ? '#80d0ff' : '#ffe040', 'right');
      text(r.desc, 34, y + 9, 3.5, sel ? '#fff' : '#a0a0b0');
    });
    const stars = CHALLENGES.reduce((a, c) => a + ((app.chal[c.id] || {}).stars || 0), 0);
    text('GWIAZDKI ' + stars + '/' + CHALLENGES.length * 3, W / 2, 196, 5, '#ffe080', 'center');
    text('▲▼ WYBÓR   {ok|ENTER} — GRAJ   {back|ESC} — POWRÓT', W / 2, 208, 4, '#c0c0c0', 'center');
  }

  // =============================================================== CODZIENNE WYZWANIE
  // Ten sam etap, pogoda i wrogowie dla wszystkich graczy danego dnia (ziarno z daty). Osobna tabela wyników na każdy dzień.
  const dailyId = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  const dailyLabel = () => { const k = dailyId(); return k.slice(6) + '.' + k.slice(4, 6) + '.' + k.slice(0, 4); };
  function seeded(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function dailyPlan() {
    const R = seeded(Number(dailyId()) * 2654435761 % 4294967296);
    const idx = Math.floor(R() * STAGES.length), list = STAGE_WX[idx] || ['clear'];
    return { idx, wx: list[Math.floor(R() * list.length)], seed: Math.floor(R() * 1e9) };
  }
  function startDaily(team) {
    const D = dailyPlan();
    G = null; app.route = []; app.ngpRun = false;
    startStage(D.idx, team);
    G.WAVES = shuffleWaves(STAGES[D.idx].WAVES, seeded(D.seed));
    G.wx = WEATHER[D.wx] ? Object.assign({ id: D.wx }, WEATHER[D.wx]) : null;
    G.daily = D;
    app.mode = 'play'; app.t = 0;
  }
  const dailyRecs = () => G.players.map(q => ({ s: q.score, st: ST.label, c: q.key, pIdx: q.pIdx }));

  // =============================================================== TRENING
  const TRAIN_ITEMS = [{ type: 'pipe', x: 110, y: 168 }, { type: 'rifle', x: 150, y: 206, ammo: 8 }, { type: 'dynamite', x: 420, y: 168, ammo: 3 }, { type: 'grenade', x: 470, y: 206, ammo: 3 }, { type: 'machete', x: 200, y: 200 }, { type: 'chain', x: 250, y: 172 }, { type: 'bottle', x: 530, y: 186, ammo: 2 }];
  function startTraining(team) {
    startStage(0, team, window.SPECIAL_STAGES.training);
    app.mode = 'play'; app.t = 0;
    G.train = { last: 0, total: 0, hits: 0, itemsT: 299, beastT: 420 };
    [[300, 176], [400, 202]].forEach(([x, y]) => { const d = makeEnemy('dummy', x, y); setState(d, 'idle'); d.face = -1; G.actors.push(d); });
  }
  function updateTraining() {
    const T = G.train;
    for (const d of G.actors) {
      if (d.type !== 'dummy' || d.hp >= d.maxHp) continue;
      const dmg = Math.round(d.maxHp - d.hp); d.hp = d.maxHp; d.lagHp = d.maxHp; d.dying = false;
      T.last = dmg; T.total += dmg; T.hits++;
      G.popups.push({ x: d.x + rnd(-8, 8), y: d.y - 64, txt: '-' + dmg, t: 0, col: dmg >= 12 ? '#ff9040' : '#fff' });
    }
    if (++T.itemsT >= 300) {
      T.itemsT = 0;
      TRAIN_ITEMS.forEach(ti => {
        if (G.players.some(q => q.weapon === ti.type) || G.items.some(it => it.type === ti.type)) return;
        G.items.push({ type: ti.type, x: ti.x, y: ti.y, z: 20, vz: 2, t: 0, ammo: ti.ammo || 3, dur: 16 });
      });
    }
    if (--T.beastT <= 0) {
      T.beastT = 900;
      const busy = G.actors.some(a => TAMEABLE.includes(a.kind) && a.alive) || G.players.some(q => q.mount);
      if (!busy) {
        const r = makeEnemy(TAMEABLE[Math.random() * TAMEABLE.length | 0], G.camX + W - 60, 192);
        r.hp = 0; r.tame = true; r.dying = true; r.face = -1; setState(r, 'tamed'); G.actors.push(r);
        G.popups.push({ x: r.x, y: r.y - 60, txt: 'ĆWICZ JAZDĘ!', t: 0, col: '#7cff7c' });
      }
    }
  }

  // =============================================================== ZAGRODA (etap bonusowy 2)
  function startCages(team, nextIdx) {
    if (team) saveProgress({ type: 'cages', next: nextIdx }, team);
    app.cageNext = nextIdx;
    startStage(4, team, window.SPECIAL_STAGES.cages);
    app.mode = 'play'; app.t = 0;
  }
  function updateCages() {
    if (G.cagesDone) {
      if (++G.clearT === 140) {
        const n = G.freed, all = n >= G.cageTotal;
        if (all) { unlock('cages'); if (app.run) app.run.cages = true; }
        app.results = G.players.map(q => {
          const time = all ? G.timer * 200 : 0, v = n * 1000 + (all ? 10000 : 0) + time;
          addScore(q, v); saveHi(q.score);
          return { cages: true, freed: n, all, time, total: v, p: q };
        });
        app.mode = 'clear'; app.t = 0;
      }
      return;
    }
    if (G.introT > 0) return;
    if (++G.timerT >= 60) { G.timerT = 0; G.timer--; if (G.timer <= 10 && G.timer > 0) sfx('select'); }
    if (G.freed >= G.cageTotal || G.timer <= 0) {
      G.cagesDone = true; G.clearT = 0; G.timer = Math.max(0, G.timer);
      const ok = G.freed >= G.cageTotal;
      AU.stopMusic(0.5); AU.play(ok ? 'clear' : 'gameover');
      if (ok) G.players.forEach(q => shout(q, 'win'));
      G.popups.push({ x: G.camX + W / 2, y: 110, txt: ok ? 'WSZYSTKIE UWOLNIONE!' : 'KONIEC CZASU!', t: 0, col: ok ? '#7cff7c' : '#ff6060' });
      G.actors.forEach(a => { if (a.team !== 'player' && a.alive && a.hp > 0) { a.hp = 0; onDeath(a); setState(a, 'fall'); a.vz = 3; } });
      G.players.forEach(q => { q.victory = ok; });
      return;
    }
    if (G.frame % 200 === 0 && foes().filter(a => a.hp > 0).length < 2 + G.players.length) {
      const types = ['grunt', 'thin', 'shield', 'netter', 'grunt'];
      G.pending.push({ type: types[Math.random() * types.length | 0], side: Math.random() < 0.5 ? 'L' : 'R', y: rnd(FLOOR_TOP + 10, FLOOR_BOTTOM - 4), delay: 1 });
    }
  }

