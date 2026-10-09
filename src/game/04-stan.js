  // =============================================================== STAN GRY
  let layers = null;
  let G = null;
  const urlParams = new URLSearchParams(location.search);
  const urlStage = clamp((parseInt(urlParams.get('stage'), 10) || 1) - 1, 0, STAGES.length - 1);
  const app = { mode: 'title', t: 0, frame: 0, sel: 0, sel2: 1, p2Active: false, stageSel: urlStage, hiscore: 0 };
  // ---- tabela wyników (top 10, localStorage)
  const DEFAULT_SCORES = [['ANA', 120000, 6, 'nina'], ['KRK', 90000, 5, 'kruk'], ['TUR', 70000, 4, 'tur'], ['DIN', 55000, 4, 'nina'],
    ['REX', 40000, 3, 'tur'], ['ŻMI', 30000, 3, 'kruk'], ['PAL', 22000, 2, 'nina'], ['HWY', 15000, 2, 'kruk'], ['KŁY', 10000, 1, 'tur'], ['RDZ', 5000, 1, 'kruk']]
    .map(([n, s, st, c]) => ({ n, s, st, c }));
  function loadScores() {
    try { const v = JSON.parse(safeGet('paleo_scores')); if (Array.isArray(v) && v.length) return v.slice(0, 10); } catch (e) { /* brak */ }
    return DEFAULT_SCORES.map(x => Object.assign({}, x));
  }
  app.scores = loadScores();
  app.hiscore = app.scores[0].s;
  // Tryb debug pochodzi wyłącznie z pliku konfiguracji (config.js).
  app.debug = !!(window.GAME_CONFIG && window.GAME_CONFIG.debug);
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* brak */ } }

  function makeTeam() {
    const K = selKeys();
    const team = [makePlayer(K[app.sel] || K[0], 0)];
    if (app.p2Active) team.push(makePlayer(K[app.sel2] || K[1], 1, app.sel2 === app.sel));
    return team;
  }
  function startStage(idx, team, stObj) {
    if (team && !Array.isArray(team)) team = [team];
    ST = stObj || STAGES[idx];
    app.share = null;
    if (!stObj) {
      app.route = app.route || [];
      if (app.route[app.route.length - 1] !== idx) { app.route.push(idx); if (app.route.length === 1) { app.wxSeed = 1 + Math.random() * 1000; app.run = { cages: false, secrets: 0 }; } }
    }
    layers = ST.buildLayers();
    G = {
      stageIdx: idx, frame: 0, camX: 0, lockX: null, waveIdx: 0, wave: null, groupIdx: 0, pending: [],
      actors: [], items: [], props: [], fx: [], popups: [], shots: [],
      timer: 99, timerT: 0, goT: 0, hitstop: 0, shake: 0, slowmo: 0,
      lastEnemy: null, lastEnemyT: 0, bossDead: false, clearT: 0, introT: 150, introBoss: null
    };
    ST.PROPS.forEach(p => G.props.push({ x: p.x, y: p.y, kind: p.kind, drop: p.drop, secret: p.secret, hp: PROP_HP[p.kind] || 2, shake: 0 }));
    G.WAVES = (app.ngpRun && !stObj) ? shuffleWaves(ST.WAVES) : ST.WAVES;
    G.wx = stObj ? null : pickWeather(idx);
    G.vehicles = (ST.VEHICLES || []).map(v => Object.assign({ used: false }, v));
    G.special = ST.special || null; G.freed = 0; G.cageTotal = ST.PROPS.filter(p => p.kind === 'pen').length;
    if (G.special) G.timer = ST.time || 45;
    ST.PICKUPS.forEach(p => G.items.push({ type: p.type, x: p.x, y: p.y, z: 0, vz: 0, t: 0 }));
    G.players = team || makeTeam();
    G.playT = 0;
    G.players.forEach((pl, i) => {
      pl.st = { kills: 0, maxCombo: 0, dmg: 0, deaths: 0 }; pl.combo = 0; pl.comboT = 0;
      if (pl.out) { pl.out = false; pl.lives = Math.max(pl.lives, 0); }
      applyUps(pl);
      Object.assign(pl, { x: ST.startX - 60 - i * 26, y: 178 + i * 18, z: 0, vx: 0, vy: 0, vz: 0, face: 1, hp: pl.maxHp, lagHp: pl.maxHp, weapon: null,
        grabbing: null, grabbedBy: null, invuln: 0, flash: 0, alive: true, dying: false, victory: false, running: false, mount: null });
      setState(pl, 'enter');
      G.actors.push(pl);
    });
    G.player = G.players[0];
    AU.stopMusic(); AU.play(ST.music);
  }

