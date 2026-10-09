  // =============================================================== AKTUALIZACJA
  // dynamiczna muzyka: perkusja dochodzi przy kombo 10+ albo gdy bossom zostało < 25% życia
  function tension() {
    if (G.bossDead) return false;
    if (G.players.some(q => q.combo >= 10 && q.comboT > 0)) return true;
    let hp = 0, max = 0;
    for (const a of G.actors) if (isBoss(a) && a.team !== 'player' && !a.dying) { hp += Math.max(0, a.hp); max += a.maxHp; }
    return max > 0 && hp < max * 0.25;
  }
  function updateGame() {
    G.frame++;
    AU.setIntensity(tension());
    if (G.introT > 0) G.introT--;
    if (G.goT > 0) G.goT--;
    if (G.lastEnemyT > 0) G.lastEnemyT--;
    if (G.shake > 0) G.shake--;
    for (let i = G.fx.length - 1; i >= 0; i--) {
      const f = G.fx[i]; f.t++;
      if (f.type === 'debris') { f.x += f.vx; f.vz -= GRAV; f.z += f.vz; if (f.z < 0) { f.z = 0; f.vz *= -0.4; f.vx *= 0.6; } }
      if (f.type === 'baby') f.x += f.dir * 2.4;
      if (f.t >= f.life) G.fx.splice(i, 1);
    }
    for (let i = G.popups.length - 1; i >= 0; i--) { if (++G.popups[i].t > 60) G.popups.splice(i, 1); }
    if (G.hint && G.hint.t > 0) G.hint.t--;
    if (G.superFreeze > 0) { G.superFreeze--; return; }
    if (G.teamSuperT > 0 && --G.teamSuperT === 0) teamBlast();
    for (const a of G.actors) { a._px = a.x; a._py = a.y; }
    if (G.hitstop > 0) { G.hitstop--; return; }
    if (G.slowmo > 0) { G.slowmo--; if (G.slowmo % 3) return; }

    for (const p of G.players) {
      if (!p.alive) continue;
      if (cheat('fury') && p.state !== 'super') p.fury = 100;
      if (p.state === 'drop') {
        p.vz -= GRAV; p.z += p.vz;
        if (p.z <= 0) {
          p.z = 0; setState(p, 'land'); sfx('slam'); G.shake = 8;
          G.fx.push({ type: 'shock', x: p.x, y: p.y, z: 0, t: 0, life: 20, r: 70 });
          for (const e of foes()) if (hittable(e) && !isBoss(e) && Math.abs(e.x - p.x) < 90) hurt(e, 4, e.x > p.x ? 1 : -1, true, p);
        }
      } else if (!updateCommon(p)) updatePlayer(p);
      else p.t++;
    }
    const p = G.player;
    for (const a of G.actors) {
      if (a.kind === 'player') continue;
      if (a.kind === 'raptor') updateRaptor(a);
      else if (a.kind === 'pachy') updatePachy(a);
      else if (a.kind === 'ptera') updatePtera(a);
      else if (a.kind === 'trike') updatePachy(a);
      else if (a.kind === 'para') updatePara(a);
      else if (a.kind === 'rex') updateRex(a);
      else if (a.kind === 'boss') updateBoss(a);
      else if (a.kind === 'glider') updateGlider(a);
      else if (a.kind === 'digger') updateDigger(a);
      else updateHuman(a);
    }
    updateShots();
    updateFires();
    updateHazards();
    updateEvents();
    if (G.ch) updateChallenge();
    for (const a of G.actors) {
      if (a.flash > 0) a.flash--;
      if (a.invuln > 0) a.invuln--;
      a.lagHp += (a.hp - a.lagHp) * 0.06;
      if (a.state !== 'enter') {
        const dk = ST.deck && !['fall', 'thrown', 'down', 'dead', 'hopin'].includes(a.state);   // pociąg: chodzimy tylko po platformie
        a.y = clamp(a.y, dk ? ST.deck.y0 : FLOOR_TOP + 6, dk ? ST.deck.y1 : FLOOR_BOTTOM);
        if (a.kind === 'player') a.x = clamp(a.x, G.camX + 10, G.camX + W - 10);
        else if (a.kind === 'rex' && a.alive) a.x = clamp(a.x, G.camX + 90, G.camX + W - 90);
        else if (!['dead', 'down', 'fall', 'thrown'].includes(a.state)) a.x = clamp(a.x, G.camX - 40, G.camX + W + 40);
      }
    }
    // przypływ: woda spowalnia wszystkich (poza bossami) w zalanym pasie
    if (G.tideY > FLOOR_TOP + 8) for (const a of G.actors) {
      if (a._px === undefined || a.z > 2 || a.y > G.tideY || isBoss(a) || a.state === 'enter') continue;
      a.x = a._px + (a.x - a._px) * 0.5; a.y = a._py + (a.y - a._py) * 0.5;
      if (a.kind === 'player' && !a.wetMsg) { a.wetMsg = true; G.popups.push({ x: a.x, y: a.y - 50, txt: 'WODA SPOWALNIA!', t: 0, col: '#80d0ff' }); }
    }
    G.actors = G.actors.filter(a => !a.remove);
    for (const pr of G.props) if (pr.shake > 0) pr.shake--;
    for (const it of G.items) { it.t++; if (it.z > 0 || it.vz > 0) { it.vz -= GRAV; it.z += it.vz; if (it.z <= 0) { it.z = 0; it.vz = 0; } } }
    G.items = G.items.filter(it => !(it.t > 900 && isWeaponItem(it.type)));

    updateWaves();
    updateCamera();

    for (const q of G.players) { if (q.comboPulse > 0) q.comboPulse--; if (q.comboT > 0 && --q.comboT === 0) finishCombo(q); }
    if (G.introT <= 0 && !G.bossDead) G.playT++;
    if (G.rush && !G.bossDead) app.rush.frames++;
    if (G.rushCard > 0) G.rushCard--;
    if (G.special === 'survival' || G.special === 'training') G.timer = 99;
    if (G.special === 'cages') updateCages();
    else if (G.special === 'training') updateTraining();
    else if (G.special === 'survival') updateSurvival();
    else if (G.special === 'escape') { if (!G.bossDead) updateEscape(); }
    else if (!G.bossDead && G.introT <= 0 && G.players.some(q => q.alive)) {
      if (++G.timerT >= 100) {
        G.timerT = 0; G.timer--;
        if (G.timer <= 0) {
          G.timer = 99;
          for (const q of G.players) if (q.alive && q.state !== 'dead') { if (q.mount) dismount(q, false); q.hp = 0; onDeath(q); setState(q, 'fall'); q.vz = 3; G.popups.push({ x: q.x, y: q.y - 60, txt: 'CZAS!', t: 0, col: '#ff6060' }); }
        }
      }
    }
    if (G.bossDead) {
      G.clearT++;
      if (G.clearT === 150) { AU.play('clear'); G.players.forEach(q => { q.victory = true; if (q.mount) dismount(q, false); }); }
      G.players.forEach((q, i) => { if (G.clearT === 158 + i * 40 && q.alive) shout(q, 'win'); });
      if (G.rush) { if (G.clearT > 120) rushNext(); return; }
      if (G.clearT > 330) {
        const secs = Math.round(G.playT / 60);
        app.results = G.players.map(q => {
          const time = q.alive ? G.timer * 100 : 0, life = q.alive ? Math.max(0, Math.round(q.hp)) * 50 : 0;
          if (q.comboT > 0) { q.comboT = 0; finishCombo(q); }
          const st = q.st || { kills: 0, maxCombo: 0, dmg: 0, deaths: 0 };
          const rank = rankOf(st, secs), rankBonus = RANK_BONUS[rank];
          addScore(q, time + life + rankBonus); saveHi(q.score);
          if (st.dmg === 0) unlock('nodmg');
          if (rank === 'S') unlock('rankS');
          markCleared(q.key);
          return { time, life, p: q, st, rank, rankBonus, secs };
        });
        if (G.players.length > 1) unlock('coop');
        app.mode = 'clear'; app.t = 0;
      }
    }
  }
  function saveHi(score) { if (score > app.hiscore) app.hiscore = score; }

