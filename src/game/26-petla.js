  // =============================================================== PĘTLA
  // ---- DŹWIĘKI OTOCZENIA: fale na plaży, krople w kanałach, wiatr w burzy piaskowej, deszcz, stukot pociągu
  function ambienceFor() {
    if (!G || !['play', 'pause', 'gameover'].includes(app.mode)) return null;
    if (G.special === 'train') return 'train';
    if (G.wx && G.wx.sand) return 'wind';
    if (G.wx && G.wx.rain) return 'rain';
    if (G.special || ST.custom) return null;
    if (G.stageIdx === 5) return 'waves';
    if (G.stageIdx === 6) return 'drips';
    if (G.stageIdx === 2) return 'rain';   // Miasto Cieni — nocna ulewa
    return null;
  }
  // ---- TRYB DEMO (attract mode)
  const DEMO_STAGES = [0, 1, 2, 3, 4, 5];
  function startDemo() {
    const keys = CHAR_KEYS, two = Math.random() < 0.4;
    const k1 = keys[Math.random() * keys.length | 0], k2 = keys.filter(k => k !== k1)[Math.random() * (keys.length - 1) | 0];
    app.demo = { t: 0, prev: { gameMode: app.gameMode, p2Active: app.p2Active, ngpRun: app.ngpRun, route: app.route, run: app.run } };
    app.gameMode = 'demo'; app.ngpRun = false; app.p2Active = two; app.demo.prev.wxSeed = app.wxSeed; app.route = [];
    const team = [makePlayer(k1, 0)]; if (two) team.push(makePlayer(k2, 1));
    startStage(DEMO_STAGES[Math.random() * DEMO_STAGES.length | 0], team);
    G.introT = 90; app.mode = 'play'; app.t = 0;
  }
  function endDemo() {
    const d = app.demo; if (!d) return;
    Object.assign(app, d.prev); app.demo = null;
    AU.stopMusic(); G = null; app.mode = 'title'; app.t = 0; app.idle = 0;
  }
  // zwraca true, gdy demo się skończyło (gracz nacisnął przycisk albo minął czas)
  function updateDemo() {
    const d = app.demo; d.t++;
    if (ACTIONS.some(k => pressed[k]) || d.t > 60 * 40 || G.bossDead || !G.players.some(q => q.alive && q.lives >= 0 && q.state !== 'dead')) { endDemo(); return true; }
    G.players.forEach(p => demoBot(p, inp[p.pIdx]));
    return false;
  }
  function demoBot(p, I) {
    const H_ = I.held, Pr = I.pressed;
    ACTIONS.forEach(k => { H_[k] = false; Pr[k] = false; });
    if (!p.alive) return;
    if (p.state === 'netted') { if (G.frame % 3 === 0) Pr.attack = true; return; }
    if (p.state === 'jump') { if (p.t === 7 && !p.jumpAtk) Pr.attack = true; return; }
    const foesNow = foes().filter(e => e.hp > 0 && hittable(e) && e.state !== 'enter' && Math.abs(e.x - G.camX - W / 2) < W / 2 + 10);
    if ((p.fury || 0) >= 100 && foesNow.length >= 2) { Pr.special = true; H_.attack = H_.jump = true; return; }
    const near = foesNow.filter(e => Math.abs(e.x - p.x) < 50 && Math.abs(e.y - p.y) < 14);
    if (near.length >= 3 && p.hp > 20 && G.frame % 50 === 0) { Pr.special = true; H_.attack = H_.jump = true; return; }
    let tgt = null, bd = 1e9;
    for (const e of foesNow) { const dd = Math.abs(e.x - p.x) + Math.abs(e.y - p.y) * 2; if (dd < bd) { bd = dd; tgt = e; } }
    if (!tgt) {
      // brak wrogów: idź w prawo za kamerą
      if (G.goT > 0 || !G.wave) H_.right = true;
      if (Math.abs(p.y - 186) > 6) H_[p.y < 186 ? 'down' : 'up'] = true;
      return;
    }
    const dx = tgt.x - p.x, dy = tgt.y - p.y, side = dx >= 0 ? 1 : -1;
    const reach = (isBoss(tgt) ? 34 : 24) + (tgt.rad || 8) * 0.5;
    if (Math.abs(dy) > 3) H_[dy > 0 ? 'down' : 'up'] = true;
    if (Math.abs(dx) > reach) H_[side > 0 ? 'right' : 'left'] = true;
    else if (Math.abs(dx) < reach - 12) H_[side > 0 ? 'left' : 'right'] = true;
    if (p.face !== side && Math.abs(dx) <= reach) H_[side > 0 ? 'right' : 'left'] = true;
    if (Math.abs(dy) <= 6 && Math.abs(dx) > 55 && Math.abs(dx) < 85 && G.frame % 90 === 0) { Pr.jump = true; return; }
    if (Math.abs(dy) <= 6 && Math.abs(dx) <= reach + 4 && p.face === side && G.frame % 7 === 0) Pr.attack = true;
  }
  function drawDemoOverlay() {
    if (!app.demo) return;
    if (app.frame % 60 < 40) text('DEMO', W / 2, 46, 12, '#ffe040', 'center');
    if (app.frame % 60 < 40) text('NACIŚNIJ {ok|START}, ABY ZAGRAĆ', W / 2, 200, 6, '#fff', 'center');
  }
  function tick() {
    pollInput();
    if (app.demo && app.mode !== 'play') endDemo();
    if (pressed.mute) AU.toggleMute();
    app.t++; app.frame = (app.frame || 0) + 1;
    AU.setAmbience(ambienceFor());
    if (app.mode === 'title' && app.cheats.size) clearCheats();   // kody działają tylko w jednym przejściu
    if (app.mode !== 'play' && app.mode !== 'pause') AU.setIntensity(false);
    if (app.share) { updateShare(); clearPressed(); return; }
    if (pressed.up && G && ((app.mode === 'clear' && app.t > 40) || (app.mode === 'gameover' && app.cont > 0 && app.t > 30) || (app.mode === 'ending' && app.t > 300))) { openShare(); clearPressed(); return; }
    switch (app.mode) {
      case 'title':
        if (AU.ctx && !AU.current) AU.play('title');
        if (inp[1].pressed.start && !inp[0].pressed.start) { sfx('start'); app.gameMode = 'arcade'; app.ngpRun = false; app.mode = 'select'; app.t = 0; app.p2Active = true; break; }
        // licznik bezczynności (pokaz tabeli wyników) — osobny od animacji ekranu
        app.idle = ACTIONS.some(k => pressed[k]) ? 0 : (app.idle || 0) + 1;
        const TI = titleItems();
        if ((app.menuSel || 0) >= TI.length) app.menuSel = 0;
        if (pressed.up || pressed.down) { app.menuSel = ((app.menuSel || 0) + (pressed.down ? 1 : TI.length - 1)) % TI.length; sfx('select'); }
        else if (pressed.start || pressed.attack) {
          if (!AU.ctx) AU.init();
          sfx('start');
          const item = TI[app.menuSel || 0];
          if (item === 'KONTYNUUJ') resumeProgress();
          else if (item === 'ZAINSTALUJ APLIKACJĘ') { const ev = app.installPrompt; app.installPrompt = null; app.menuSel = 0; if (ev) ev.prompt(); }
          else if (MODE_OF[item]) { app.gameMode = MODE_OF[item]; app.ngpRun = item === 'NOWA GRA+'; app.mode = 'select'; app.t = 0; app.p2Active = false; }
          else if (item === 'EKSTRA') { app.mode = 'extras'; app.exSel = 0; app.sub = null; app.t = 0; }
          else if (item === 'JAK GRAĆ') { openHowto(); sfx('select'); }
          else if (item === 'WYZWANIA') { app.mode = 'chal'; app.chSel = app.chSel || 0; app.t = 0; }
          else if (item === 'OPCJE') { app.mode = 'options'; app.t = 0; app.optSel = 0; app.keysFor = null; app.padFor = null; }
          else showScores(-1, false, 'main');
        } else if (app.idle > 900) {
          // jak na automacie: na zmianę pokaz gry i tabela wyników
          app.idle = 0; app.attractDemo = !app.attractDemo;
          if (app.attractDemo) startDemo(); else showScores(-1, true);
        }
        break;
      case 'story': {
        const S_ = app.story, line = S_.lines[S_.i][1];
        S_.t++;
        if (pressed.pause || pressed.jump) { S_.after(); break; }
        if ((pressed.start || pressed.attack) && app.t > 8) {
          if (S_.t * 1.1 < line.length) S_.t = Math.ceil(line.length / 1.1);
          else if (++S_.i >= S_.lines.length) { sfx('start'); S_.after(); }
          else { S_.t = 0; sfx('select'); }
        }
        if (S_.t % 4 === 1 && S_.t * 1.1 < line.length) sfx('punch');
        break;
      }
      case 'shop': {
        const sh = app.shop, q = sh.team[sh.who], N = UPGRADES.length + 1;
        if (sh.msgT > 0) sh.msgT--;
        if (sh.team.length > 1 && (pressed.left || pressed.right)) { sh.who = 1 - sh.who; sfx('select'); }
        if (pressed.up) { sh.sel = (sh.sel + N - 1) % N; sfx('select'); }
        if (pressed.down) { sh.sel = (sh.sel + 1) % N; sfx('select'); }
        const leave = pressed.pause || pressed.jump || ((pressed.start || pressed.attack) && sh.sel === UPGRADES.length && app.t > 10);
        if (leave) { app.skipShop = true; goMap(sh.idx, sh.team); app.skipShop = false; break; }
        if ((pressed.start || pressed.attack) && app.t > 10) {
          const [id, name, costs] = UPGRADES[sh.sel], cost = upCost(q, id, costs);
          if (cost === undefined) { sfx('empty'); sh.msg = 'MAKSYMALNY POZIOM'; }
          else if ((q.amber || 0) < cost) { sfx('empty'); sh.msg = 'ZA MAŁO BURSZTYNU'; }
          else { q.amber -= cost; if (id === 'life') q.lives++; else q.up[id]++; applyUps(q); sfx('coin'); sh.msg = 'KUPIONO: ' + name; }
          sh.msgT = 100;
        }
        break;
      }
      case 'howto': updateHowto(); break;
      case 'chal': {
        const n = CHALLENGES.length + 1;
        if (pressed.up) { app.chSel = (app.chSel + n - 1) % n; sfx('select'); }
        if (pressed.down) { app.chSel = (app.chSel + 1) % n; sfx('select'); }
        if (pressed.pause || pressed.jump) { app.mode = 'title'; app.t = 0; sfx('select'); break; }
        if ((pressed.start || pressed.attack) && app.t > 5) {
          sfx('start'); app.ngpRun = false; app.p2Active = false;
          if (app.chSel === 0) app.gameMode = 'daily';
          else { app.gameMode = 'challenge'; app.chDef = CHALLENGES[app.chSel - 1]; }
          app.mode = 'select'; app.t = 0;
        }
        break;
      }
      case 'chalres':
        if (app.t > 40 && (pressed.start || pressed.attack)) { sfx('start'); const team = makeTeam(); startChallenge(team); }
        else if (app.t > 20 && (pressed.pause || pressed.jump)) { G = null; app.mode = 'chal'; app.t = 0; AU.stopMusic(); AU.play('title'); sfx('select'); }
        break;
      case 'extras': {
        const back = pressed.pause || pressed.jump, ok = (pressed.start || pressed.attack) && app.t > 5;
        if (!app.sub) {
          const NE = EXTRA_ITEMS.length;
          if (pressed.up) { app.exSel = (app.exSel + NE - 1) % NE; sfx('select'); }
          if (pressed.down) { app.exSel = (app.exSel + 1) % NE; sfx('select'); }
          if (ok) {
            sfx('select');
            if (app.exSel === 0) app.sub = 'ach';
            else if (app.exSel === 1) { app.sub = 'bestiary'; app.bestSel = app.bestSel || 0; }
            else if (app.exSel === 2) { app.sub = 'jukebox'; app.jukeSel = 0; AU.stopMusic(); }
            else if (app.exSel === 3) { app.sub = 'custom'; app.cuSel = 0; app.cuList = customList(); }
            else { app.mode = 'title'; app.t = 0; }
            app.t = 0;
          } else if (back) { app.mode = 'title'; app.t = 0; sfx('select'); }
          break;
        }
        if (back) { if (app.sub === 'jukebox') AU.stopMusic(); app.sub = null; app.t = 0; sfx('select'); break; }
        if (app.sub === 'custom') {
          const n = app.cuList.length + 1;
          if (pressed.up) { app.cuSel = (app.cuSel + n - 1) % n; sfx('select'); }
          if (pressed.down) { app.cuSel = (app.cuSel + 1) % n; sfx('select'); }
          if (ok) {
            sfx('start');
            if (app.cuSel === app.cuList.length) location.href = 'editor.html';
            else { app.customData = app.cuList[app.cuSel]; app.gameMode = 'custom'; app.ngpRun = false; app.p2Active = false; app.mode = 'select'; app.t = 0; }
          }
        } else if (app.sub === 'bestiary') {
          const n = BESTIARY.length;
          if (pressed.left || pressed.up) { app.bestSel = (app.bestSel + n - 1) % n; sfx('select'); }
          if (pressed.right || pressed.down) { app.bestSel = (app.bestSel + 1) % n; sfx('select'); }
        } else if (app.sub === 'jukebox') {
          const n = JUKE.length;
          if (pressed.up) { app.jukeSel = (app.jukeSel + n - 1) % n; sfx('select'); }
          if (pressed.down) { app.jukeSel = (app.jukeSel + 1) % n; sfx('select'); }
          if (ok) {
            const k = JUKE[app.jukeSel][0];
            if (!songUnlocked(k)) sfx('empty');
            else if (AU.current && AU.current.name === k) AU.stopMusic();
            else { AU.stopMusic(); AU.play(k); }
          }
        }
        break;
      }
      case 'options': {
        if (app.captureMsg > 0) app.captureMsg--;
        if (app.keysFor !== null && app.keysFor !== undefined) {
          if (app.capture) break;
          const N = BIND_ACTIONS.length + 1;
          if (pressed.up) { app.keySel = (app.keySel + N - 1) % N; sfx('select'); }
          if (pressed.down) { app.keySel = (app.keySel + 1) % N; sfx('select'); }
          if ((pressed.start || pressed.attack) && app.t > 5) {
            if (app.keySel < BIND_ACTIONS.length) { app.capture = { pIdx: app.keysFor, action: BIND_ACTIONS[app.keySel] }; sfx('select'); }
            else { app.keysFor = null; sfx('select'); }
          } else if (pressed.pause || pressed.jump) { app.keysFor = null; sfx('select'); }
          break;
        }
        if (app.padFor !== null && app.padFor !== undefined) {
          if (app.padCapture) {
            if (pressed.pause || ++app.padCapture.t > 600) { app.padCapture = null; sfx('select'); }
            break;
          }
          const N = PAD_BINDS.length + 1;
          if (pressed.up) { app.padSel = (app.padSel + N - 1) % N; sfx('select'); }
          if (pressed.down) { app.padSel = (app.padSel + 1) % N; sfx('select'); }
          if (kbd[0].resetPad) { kbd[0].resetPad = false; resetPads(); sfx('start'); }
          if ((pressed.start || pressed.attack) && app.t > 5) {
            if (app.padSel < PAD_BINDS.length) { app.padCapture = { pIdx: app.padFor, action: PAD_BINDS[app.padSel], t: 0, rest: null }; sfx('select'); }
            else { app.padFor = null; sfx('select'); }
          } else if (pressed.pause || pressed.jump) { app.padFor = null; sfx('select'); }
          break;
        }
        const N = OPT_ROWS.length;
        if (pressed.up) { app.optSel = (app.optSel + N - 1) % N; sfx('select'); }
        if (pressed.down) { app.optSel = (app.optSel + 1) % N; sfx('select'); }
        const dir = (pressed.right ? 1 : 0) - (pressed.left ? 1 : 0), ok = (pressed.start || pressed.attack) && app.t > 5;
        switch (OPT_ROWS[app.optSel]) {
          case 'diff': if (dir) { OPTS.difficulty = DIFF_KEYS[(DIFF_KEYS.indexOf(OPTS.difficulty) + dir + 3) % 3]; saveOpts(); sfx('select'); } break;
          case 'lives': if (dir) { OPTS.lives = clamp(OPTS.lives + dir, 1, 5); saveOpts(); sfx('select'); } break;
          case 'assist': if (dir || ok) { OPTS.assist = !OPTS.assist; saveOpts(); sfx('select'); } break;
          case 'crt': if (dir || ok) { const n = CRT_MODES.length; OPTS.crt = CRT_MODES[(CRT_MODES.indexOf(crtMode()) + (dir || 1) + n) % n]; saveOpts(); sfx('select'); } break;
          case 'bezel': if (dir || ok) { OPTS.bezel = !OPTS.bezel; saveOpts(); drawBezel(); sfx('select'); } break;
          case 'rumble': if (dir || ok) { OPTS.rumble = !OPTS.rumble; saveOpts(); sfx('select'); if (OPTS.rumble) rumbleAll(0.6, 0.6, 250); } break;
          case 'pad1': case 'pad2': if (ok) { app.padFor = OPT_ROWS[app.optSel] === 'pad1' ? 0 : 1; app.padSel = 0; app.padCapture = null; app.t = 0; sfx('select'); } break;
          case 'music': if (dir) { OPTS.music = clamp(OPTS.music + dir, 0, 10); saveOpts(); } break;
          case 'sfx': if (dir) { OPTS.sfx = clamp(OPTS.sfx + dir, 0, 10); saveOpts(); sfx('punch'); } break;
          case 'touch': if (dir) { OPTS.touch = TOUCH_MODES[(TOUCH_MODES.indexOf(OPTS.touch) + dir + 3) % 3]; saveOpts(); sfx('select'); } break;
          case 'keys1': case 'keys2': if (ok) { app.keysFor = OPT_ROWS[app.optSel] === 'keys1' ? 0 : 1; app.keySel = 0; app.t = 0; sfx('select'); } break;
          case 'reset': if (ok) { OPTS = defaultOpts(); resetKeys(); resetPads(); saveOpts(); drawBezel(); app.optMsg = 120; sfx('start'); } break;
          case 'back': if (ok) { app.mode = 'title'; app.t = 0; sfx('select'); } break;
        }
        if (app.optMsg > 0) app.optMsg--;
        if (pressed.pause || pressed.jump) { app.mode = 'title'; app.t = 0; sfx('select'); }
        break;
      }
      case 'scores':
        if (!app.attract && (pressed.left || pressed.right)) {
          const i = TABLE_KEYS.indexOf(app.scoreTable);
          app.scoreTable = TABLE_KEYS[(i + (pressed.right ? 1 : TABLE_KEYS.length - 1)) % TABLE_KEYS.length]; app.scoresHi = -1; app.t = 21; sfx('select');
        }
        if ((pressed.start || pressed.attack) && app.t > 20) {
          if (app.attract) { sfx('start'); app.gameMode = 'arcade'; app.mode = 'select'; app.t = 0; }
          else { app.mode = 'title'; app.t = 0; }
        } else if ((pressed.pause || pressed.jump) && app.t > 5) { app.mode = 'title'; app.t = 0; sfx('select'); }
        else if (app.t > (app.attract ? 420 : 900)) { app.mode = 'title'; app.t = 0; }
        break;
      case 'entry': {
        const e = app.entry, n = LETTERS.length;
        if (pressed.up) { e.letters[e.pos] = (e.letters[e.pos] + 1) % n; sfx('select'); }
        if (pressed.down) { e.letters[e.pos] = (e.letters[e.pos] + n - 1) % n; sfx('select'); }
        if (pressed.left && e.pos > 0) { e.pos--; sfx('select'); }
        if (pressed.right && e.pos < 2) { e.pos++; sfx('select'); }
        if ((pressed.pause || pressed.jump) && e.pos > 0 && app.t > 20) { e.pos--; sfx('select'); }
        if ((pressed.attack || pressed.start) && app.t > 20) {
          sfx('pickup');
          if (e.pos < 2) { e.pos++; e.letters[e.pos] = e.letters[e.pos - 1]; } else { commitEntry(); break; }
        }
        if (--e.time <= 0) commitEntry();
        break;
      }
      case 'select': {
        const n = selKeys().length, I1 = inp[0].pressed, I2 = inp[1].pressed;
        if (I1.left) { app.sel = (app.sel + n - 1) % n; sfx('select'); }
        if (I1.right) { app.sel = (app.sel + 1) % n; sfx('select'); }
        if (!app.p2Active && I2.start && app.t > 5) { app.p2Active = true; app.sel2 = (app.sel + 1) % n; sfx('start'); }
        else if (app.p2Active) {
          if (I2.left) { app.sel2 = (app.sel2 + n - 1) % n; sfx('select'); }
          if (I2.right) { app.sel2 = (app.sel2 + 1) % n; sfx('select'); }
          if (I2.jump || I2.pause) { app.p2Active = false; sfx('select'); }
        }
        if ((I1.pause || I1.jump) && app.t > 5) {
          sfx('select'); app.p2Active = false; app.t = 0;
          if (app.gameMode === 'custom') { app.mode = 'extras'; app.sub = 'custom'; app.cuList = customList(); }
          else if (app.gameMode === 'challenge' || app.gameMode === 'daily') app.mode = 'chal';
          else app.mode = 'title';
          break;
        }
        if ((I1.start || I1.attack) && app.t > 10) {
          sfx('start');
          G = null; app.route = [];
          if (app.gameMode === 'training') startTraining(null);
          else if (app.gameMode === 'rush') startRush(null);
          else if (app.gameMode === 'survival') startSurvival(null);
          else if (app.gameMode === 'custom') startCustom(null);
          else if (app.gameMode === 'challenge') startChallenge(null);
          else if (app.gameMode === 'daily') startDaily(null);
          else if (app.gameMode === 'arcade') openCodes();
          else if (app.debug) { app.mode = 'stagesel'; app.t = 0; }
          else { goMap(urlStage, null); }
        }
        break;
      }
      case 'codes': updateCodes(); break;
      case 'stagesel':
        if (pressed.up) { app.stageSel = (app.stageSel + SEL_COUNT - 1) % SEL_COUNT; sfx('select'); }
        if (pressed.down) { app.stageSel = (app.stageSel + 1) % SEL_COUNT; sfx('select'); }
        if (pressed.jump || pressed.pause) { app.mode = 'select'; app.t = 0; sfx('select'); break; }
        if ((pressed.start || pressed.attack) && app.t > 10) {
          sfx('start');
          app.route = [];
          if (app.stageSel === STAGES.length) startBonus(null, 4);
          else if (app.stageSel === STAGES.length + 1) startCages(null, 5);
          else if (app.stageSel === STAGES.length + 2) startFlight(null, 6);
          else goMap(app.stageSel, null);
        }
        break;
      case 'play': {
        if (app.demo) { if (updateDemo()) break; updateGame(); break; }
        let joined = false;
        for (let i = 0; i < 2; i++) if (inp[i].pressed.start && (!G.players[i] || G.players[i].out) && !G.bossDead) joined = joinOrContinue(i) || joined;
        if (!joined && (pressed.pause || pressed.start)) { app.mode = 'pause'; app.pauseSel = 0; app.pausedFrom = 'play'; sfx('select'); if (AU.ctx) AU.ctx.suspend(); break; }
        updateGame();
        break;
      }
      case 'bonus':
        if (pressed.pause) { app.mode = 'pause'; app.pauseSel = 0; app.pausedFrom = 'bonus'; sfx('select'); if (AU.ctx) AU.ctx.suspend(); break; }
        if (curBonus().update()) {
          const B = curBonus().state;
          if (app.bonusKind === 'flight') { if (B.result && B.result.sunk >= 12) unlock('flyer'); }
          else if (B.result && B.result.ok && B.car.hp >= 100) unlock('cleanroad');
          goMap(app.bonusNext, app.bonusTeam);
        }
        break;
      case 'pause':
        // menu pauzy: 0 = wznów, 1 = wyjdź do menu
        if (pressed.up || pressed.down) { app.pauseSel = 1 - app.pauseSel; if (AU.ctx) AU.ctx.resume(); sfx('select'); }
        const resume = pressed.pause || pressed.jump;
        if (resume) app.pauseSel = 0;
        if (resume || pressed.start || pressed.attack) {
          if (AU.ctx) AU.ctx.resume();
          if (app.pauseSel === 1 && !resume) {
            AU.stopMusic(); sfx('start');
            G = null; app.p2Active = false; app.mode = 'title'; app.t = 0;
          } else app.mode = app.pausedFrom || 'play';
        }
        break;
      case 'gameover':
        if (app.t % 60 === 0 && app.t > 0) app.cont--;
        if ((pressed.start || pressed.attack) && app.cont > 0 && app.t > 30) {
          G.players.forEach(q => { q.out = false; q.lives = OPTS.lives - 1; if (!G.actors.includes(q)) G.actors.push(q); respawn(q); });
          app.mode = 'play'; AU.stopMusic(); AU.play(G.wave && G.wave.boss ? ST.bossMusic : ST.music);
        } else if (app.cont <= 0 && app.t > (G.rush || G.special === 'survival' ? 150 : 60)) finishRun();
        break;
      case 'clear':
        if (app.t === 40 && app.results && app.results[0] && app.results[0].rank) sfx(['S', 'A'].includes(app.results[0].rank) ? 'oneup' : 'go');
        if ((pressed.start || pressed.attack) && app.t > 90) {
          if (ST.custom) { sfx('start'); leaveCustom(); break; }
          if (app.gameMode === 'daily') { sfx('start'); unlock('daily'); endRun('daily', dailyRecs()); break; }
          if (G.special === 'cages') goMap(app.cageNext, G.players);
          else if (G.special === 'train') goMap(app.trainNext || 7, G.players);
          else if (!G.special && G.stageIdx === STAGES.length - 1 && app.gameMode === 'arcade') startEscape(G.players);
          else if (G.special === 'escape' && trueReady()) { saveProgress({ type: 'truefinal' }, G.players); startTrueFinal(G.players); }
          else if (G.stageIdx < STAGES.length - 1) afterStage(G.stageIdx, G.players);
          else {
            app.trueEnd = G.special === 'truefinal';
            if (app.trueEnd) unlock('trueend');
            unlock('beatgame'); if (OPTS.difficulty === 'arcade') unlock('arcade'); if (app.ngpRun) unlock('ngplus'); clearProgress();
            app.newUnlocks = !app.unlocks.ngp || !app.unlocks.baron;
            app.unlocks.ngp = true; app.unlocks.baron = true; safeSet('paleo_unlocks', JSON.stringify(app.unlocks));
            app.mode = 'ending'; app.t = 0; app.epilogShown = false; AU.stopMusic(); AU.play('ending'); G.players.forEach(q => saveHi(q.score));
          }
        }
        break;
      case 'map':
        if (app.mapChoice) {
          const c = app.mapChoice;
          app.t = Math.min(app.t, 39);
          if (pressed.left || pressed.right || pressed.up || pressed.down) { c.sel = 1 - c.sel; app.mapTo = c.opts[c.sel]; sfx('select'); }
          if ((pressed.start || pressed.attack) && app.t > 15) { app.mapTo = c.opts[c.sel]; app.mapChoice = null; app.t = 40; sfx('start'); }
          break;
        }
        if (app.t === MAP_ARRIVE) { sfx('go'); G_MAP.flash = 20; }
        if ((pressed.start || pressed.attack) && app.t > 15) {
          if (app.t < MAP_ARRIVE) { app.t = MAP_ARRIVE - 1; break; }
          app.t = MAP_END;
        }
        if (app.t >= MAP_END) { sfx('start'); beginStage(app.mapTo, app.mapPlayer); }
        break;
      case 'ending':
        if ((pressed.start || pressed.attack) && app.t > 300) {
          // najpierw komiks z zakończeniami postaci, potem tablica wyników
          if (!app.epilogShown && G && G.players.length) { app.epilogShown = true; sfx('start'); startEpilog(G.players, () => endGame('★')); }
          else endGame('★');
        }
        break;
    }
    clearPressed();
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    const view = app.mode === 'pause' ? app.pausedFrom : app.mode;
    if (view === 'title') drawTitle();
    else if (view === 'select') drawSelect();
    else if (view === 'stagesel') drawStageSel();
    else if (view === 'codes') drawCodes();
    else if (view === 'map') drawMap();
    else if (view === 'ending') drawEnding();
    else if (view === 'scores') drawScores();
    else if (view === 'options') drawOptions();
    else if (view === 'extras') drawExtras();
    else if (view === 'chal') drawChalList();
    else if (view === 'howto') drawHowto();
    else if (view === 'shop') drawShop();
    else if (view === 'story') drawStory();
    else if (view === 'entry') drawEntry();
    else if (view === 'bonus') { curBonus().draw(); if (app.mode === 'pause') { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H); } }
    else if (G) {
      drawWorld();
      drawHud();
      if (app.mode === 'pause' || app.mode === 'gameover' || app.mode === 'clear' || app.mode === 'chalres') { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H); }
    }
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(buf, 0, 0, screen.width, screen.height);
    if (view === 'title') drawTitleText();
    else if (view === 'select') drawSelectText();
    else if (view === 'stagesel') drawStageSelText();
    else if (view === 'codes') drawCodesText();
    else if (view === 'map') drawMapText();
    else if (view === 'ending') drawEndingText();
    else if (view === 'scores') drawScoresText();
    else if (view === 'options') drawOptionsText();
    else if (view === 'extras') drawExtrasText();
    else if (view === 'chal') drawChalListText();
    else if (view === 'howto') drawHowtoText();
    else if (view === 'shop') drawShopText();
    else if (view === 'story') drawStoryText();
    else if (view === 'entry') drawEntryText();
    else if (view === 'bonus') curBonus().drawText();
    else if (G) {
      drawHudText();
      drawDemoOverlay();
      if (app.mode === 'gameover') {
        text('KONIEC GRY', W / 2, 70, 16, '#ff5050', 'center');
        if (app.cont > 0) { text('KONTYNUOWAĆ?', W / 2, 104, 8, '#fff', 'center'); text(String(app.cont - 1), W / 2, 122, 18, '#ffe040', 'center'); }
        if (app.cont > 0 && app.t > 30) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 160, 4, '#c0e0ff', 'center');
      }
      if (app.mode === 'chalres') drawChalRes();
      if (app.mode === 'clear') {
        const res = app.results || [];
        const cages = G.special === 'cages';
        const last = ST.custom || (!cages && G.stageIdx >= STAGES.length - 1 && (G.special === 'truefinal' || (G.special === 'escape' && !trueReady()) || app.gameMode !== 'arcade'));
        text(cages ? 'ZAGRODA — ' + (res[0] && res[0].all ? 'SUKCES!' : 'KONIEC CZASU') : G.special === 'escape' ? 'UCIECZKA UDANA!' : G.special === 'truefinal' ? 'KOLOS POKONANY!' : ST.custom ? ST.name : 'ETAP ' + ST.label + ' UKOŃCZONY', W / 2, 36, ST.custom ? 9 : 12, '#ffe040', 'center');
        res.forEach((r, i) => {
          const cx = res.length > 1 ? (i ? W * 0.72 : W * 0.28) : W / 2, col = res.length > 1 ? P_COLS[i] : '#ffe080';
          text(r.p.name, cx, 62, 7, col, 'center');
          if (r.cages) {
            text('UWOLNIONE ' + r.freed + ' × 1000', cx, 80, 6, '#fff', 'center');
            text(r.all ? 'KOMPLET +10000  CZAS +' + r.time : 'BEZ KOMPLETU', cx, 94, 5, r.all ? '#7cff7c' : '#ff9a80', 'center');
          } else {
            text('BONUS CZASU ' + r.time, cx, 72, 5, '#fff', 'center');
            text('BONUS ZDROWIA ' + r.life, cx, 81, 5, '#fff', 'center');
            text('POKONANI ' + r.st.kills + '   KOMBO ' + r.st.maxCombo, cx, 92, 5, '#c0e0ff', 'center');
            text('OBRAŻENIA ' + Math.round(r.st.dmg) + (r.st.deaths ? '   STRACONE ŻYCIA ' + r.st.deaths : ''), cx, 101, 5, '#ffb0a0', 'center');
            if (app.t > 40) {
              text('OCENA', cx - 16, 116, 5, '#fff', 'center');
              text(r.rank, cx + 16, 110, 16, RANK_COLS[r.rank], 'center');
              text('+' + r.rankBonus, cx, 130, 5, '#ffe080', 'center');
            }
          }
          text(String(r.p.score), cx, r.cages ? 114 : 140, 9, '#80d0ff', 'center');
        });
        if (!cages && res[0]) text('CZAS ETAPU ' + Math.floor(res[0].secs / 60) + ':' + String(res[0].secs % 60).padStart(2, '0'), W / 2, 50, 5, '#c0c0c0', 'center');
        if (cages) text('NASTĘPNY: ' + shortName(STAGES[app.cageNext]), W / 2, 158, 6, '#c0f0c0', 'center');
        else if (G.special === 'train') text('NASTĘPNY: ' + shortName(STAGES[app.trainNext || 7]), W / 2, 158, 6, '#c0f0c0', 'center');
        else if (ST.custom) { /* własny etap — bez kolejnego */ }
        else if (G.special === 'escape' && trueReady()) text('NASTĘPNY: ??? — COŚ NADCHODZI OD MORZA', W / 2, 158, 6, '#ffe040', 'center');
        else if (!G.special && G.stageIdx === STAGES.length - 1 && app.gameMode === 'arcade') text('NASTĘPNY: EPILOG — UCIECZKA', W / 2, 158, 6, '#ff9a80', 'center');
        else if (!last) text('NASTĘPNY: ' + nextLabel(G.stageIdx), W / 2, 158, 6, G.stageIdx === 1 ? '#ffe080' : '#c0f0c0', 'center');
        if (app.t > 40) text('▲ — UDOSTĘPNIJ WYNIK', W / 2, 198, 4, '#c0e0ff', 'center');
        if (app.t > 90 && app.t % 50 < 35) text(ST.custom ? '{ok|ENTER} — MENU' : last ? '{ok|ENTER} — ZAKOŃCZENIE' : '{ok|ENTER} — DALEJ', W / 2, 184, 6, '#fff', 'center');
      }
    }
    if (app.mode === 'pause') {
      text('PAUZA', W / 2, 76, 14, '#fff', 'center');
      ['WZNÓW', 'WYJDŹ DO MENU'].forEach((l, i) => {
        const sel = app.pauseSel === i;
        text((sel ? '► ' : '  ') + l, W / 2, 110 + i * 16, 8, sel ? '#ffe040' : '#a0a0b0', 'center');
      });
      text('▲▼ WYBÓR   {ok|ENTER/ATAK} — OK   {back|ESC} — WZNÓW', W / 2, 160, 4, '#c0c0c0', 'center');
    }
    drawToasts();
    if (AU.muted) text('♪ OFF', W - 4, H - 10, 5, '#ff8080', 'right');
    if (app.share) drawShare();
    applyCrt();
  }

  let last = performance.now(), acc = 0;
  const STEP = 1000 / 60;
  function frame(now) {
    acc += Math.min(100, now - last); last = now;
    let n = 0;
    while (acc >= STEP && n < 4) { tick(); acc -= STEP; n++; }
    render();
    requestAnimationFrame(frame);
  }

  // ---- PWA: praca offline i instalacja (tylko przez http/https — nie z file://)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* brak wsparcia */ });
  }
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); app.installPrompt = e; });
  addEventListener('appinstalled', () => { app.installPrompt = null; });

  function boot() {
    AU.setVolumes(OPTS.music, OPTS.sfx);
    updateTouchVisibility();
    STAGES[0].buildLayers();
    window.__paleoBooted = true; drawBezel();
    // index.html?test=1 — szybki test etapu prosto z edytora
    if (urlParams.get('test') === '1') {
      const d = loadJSON('paleo_custom_test');
      if (d) { app.customData = d; app.gameMode = 'custom'; app.ngpRun = false; app.mode = 'select'; app.t = 0; }
    }
    requestAnimationFrame(frame);
  }
  if (document.fonts && document.fonts.load) {
    Promise.race([Promise.all([document.fonts.load('10px "Press Start 2P"', 'AĄĆĘŁŃÓŚŹŻ×►'), document.fonts.load('16px "Tiny5"', 'AĄĆĘŁŃÓŚŹŻ')]),
      new Promise(r => setTimeout(r, 2500))]).then(boot, boot);
  } else boot();

  // debug / testy: uchwyty do stanu gry tylko w trybie debug (config.js) albo z parametrem adresu ?hooks=1 (testy automatyczne)
  if (CFG.debug === true || urlParams.has('hooks')) window.__paleo = { get G() { return G; }, app, pickWeather, customList, buildCustomStage, startCustom, CHARS, ENEMIES, bonus, startStage: i => { startStage(i, G && G.players); app.mode = 'play'; }, startBonus: () => startBonus(G && G.players, 4), startCages: () => startCages(G && G.players, 5), startTraining: () => startTraining(null), startSuper: i => startSuper(G.players[i || 0]), newStage: i => { startStage(i, null); app.mode = 'play'; }, startEscape: () => startEscape(G.players), startDemo, endDemo, AU, CODES, openCodes, applyCheatMods, cheats: () => app.cheats, grav: () => GRAV, startEpilog: () => startEpilog(G.players, () => endGame('★')), ENDINGS, startTrain: () => { app.gameMode = app.gameMode || 'arcade'; startTrain(G ? G.players : null, 7); }, unlocks: () => app.unlocks, hurt: (t, d, src, knock) => hurt(t, d, 1, !!knock, src), spawn: (type, x, y) => { const e = makeEnemy(type, x, y); if (type !== 'glider' && type !== 'digger') setState(e, 'idle'); G.actors.push(e); return e; }, afterStage, resumeProgress, saveInfo: () => app.save, startRush: () => startRush(null), startSurvival: () => startSurvival(null), unlock, opts: () => OPTS, endGame, inp, joinOrContinue: i => joinOrContinue(i),
    flight, curBonus: () => curBonus(), startFlight: () => startFlight(G ? G.players : null, 6), CHALLENGES, dailyPlan, startDaily: () => startDaily(null),
    startChallenge: id => { app.chDef = CHALLENGES.find(c => c.id === id); app.gameMode = 'challenge'; startChallenge(null); }, STAGES };
