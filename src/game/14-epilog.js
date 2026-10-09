  // =============================================================== EPILOG: UCIECZKA Z TWIERDZY
  // ---- prawdziwe zakończenie: uwolnij wszystkie dinozaury w Zagrodzie i odkryj 3 sekrety w jednym przejściu
  const trueReady = () => app.gameMode === 'arcade' && app.run && app.run.cages && app.run.secrets >= 3;
  let TRUE_STAGE = null;
  function trueFinalStage() {
    if (TRUE_STAGE) return TRUE_STAGE;
    TRUE_STAGE = Object.assign({}, STAGES[5], {
      name: 'FINAŁ — ŚWIT NAD ZATOKĄ', sub: 'BURSZTYNOWY KOLOS WYCHODZI Z MORZA', label: 'F', special: 'truefinal',
      LEN: W + 40, startX: 90, music: 'final', bossMusic: 'final', EVENT: null, VEHICLES: [], PROPS: [],
      PICKUPS: [{ x: 160, y: 200, type: 'meat' }, { x: 260, y: 176, type: 'meat' }],
      WAVES: [{ lock: 0, boss: true, groups: [{ when: 0, spawns: [{ type: 'kolos', side: 'R', y: 185, delay: 60 }] }] }]
    });
    return TRUE_STAGE;
  }
  function startTrueFinal(team) {
    startStory('truefinal', team, () => {
      startStage(STAGES.length - 1, team, trueFinalStage());
      G.wx = Object.assign({ id: 'dawn' }, WEATHER.dawn);
      app.mode = 'play'; app.t = 0;
    });
  }
  // ---- etap specjalny: pociąg do Twierdzy (między Kanałami a Twierdzą)
  function startTrain(team, nextIdx) {
    team = team || makeTeam();
    saveProgress({ type: 'train', next: nextIdx }, team);
    app.trainNext = nextIdx;
    startStory('train', team, () => { startStage(6, team, window.SPECIAL_STAGES.train); app.mode = 'play'; app.t = 0; });
  }
  function startEscape(team) {
    saveProgress({ type: 'escape' }, team);
    startStory('escape', team, () => { startStage(STAGES.length - 1, team, window.SPECIAL_STAGES.escape); app.mode = 'play'; app.t = 0; });
  }
  function updateEscape() {
    const E = G.esc || (G.esc = { lava: G.camX - 40, speed: 1, spawnT: 0, rockT: 0, done: false });
    if (G.introT > 0 || E.done) return;
    E.speed = Math.min(2.1, 0.9 + G.playT / 2600);
    G.camX = Math.min(ST.LEN - W, G.camX + E.speed);
    E.lava = G.camX + 8 + Math.sin(G.frame * 0.06) * 5;
    for (const a of G.actors) {
      if (!a.alive || a.hazT > 0 || !hittable(a)) continue;
      if (a.x < E.lava + 16) { a.hazT = 30; hurt(a, a.kind === 'player' ? 16 : 40, 1, true, null, { unblock: true }); a.vx = 3; sfx('zap'); }
    }
    if (++E.rockT >= 42) { E.rockT = 0; shoot({ type: 'rock', x: G.camX + rnd(70, W - 20), y: rnd(FLOOR_TOP + 10, FLOOR_BOTTOM - 4), z: 150, vz: 0, life: 999 }); }
    if (++E.spawnT >= 150) {
      E.spawnT = 0;
      const types = ['grunt', 'thin', 'shield', 'brute', 'netter'];
      G.pending.push({ type: types[Math.random() * types.length | 0], side: 'R', y: rnd(FLOOR_TOP + 10, FLOOR_BOTTOM - 4), delay: 1 });
    }
    if (++G.timerT >= 100) {
      G.timerT = 0; G.timer--;
      if (G.timer <= 10 && G.timer > 0) sfx('select');
      if (G.timer <= 0) { G.timer = 99; for (const q of G.players) if (q.alive && q.state !== 'dead') { q.hp = 0; onDeath(q); setState(q, 'fall'); q.vz = 3; } }
    }
    if (G.camX >= ST.LEN - W - 1 && G.players.some(q => q.alive && q.x > ST.LEN - 110)) {
      E.done = true; G.bossDead = true; G.clearT = 0; AU.stopMusic(0.5); G.shake = 10;
      G.popups.push({ x: G.camX + W / 2, y: 110, txt: 'UCIECZKA UDANA!', t: 0, col: '#7cff7c' });
      G.actors.forEach(a => { if (a.team !== 'player' && a.alive && a.hp > 0) { a.hp = 0; onDeath(a); setState(a, 'fall'); a.vz = 3; } });
    }
  }

