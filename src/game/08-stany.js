  // =============================================================== WSPÓLNE STANY
  function updateCommon(a) {
    switch (a.state) {
      case 'hurt':
        a.x += a.vx; a.vx *= 0.8;
        if (a.t > (a.kind === 'player' ? 16 : (isBoss(a) ? 10 : 18))) setState(a, 'idle');
        return true;
      case 'stun':
        if (a.t > 70) setState(a, 'idle');
        return true;
      case 'fall': case 'thrown': {
        a.x += a.vx; a.vz -= GRAV; a.z += a.vz;
        if (ST.deck && a.state === 'thrown' && !a.fvy && a.team !== 'player') a.fvy = (a.y < (ST.deck.y0 + ST.deck.y1) / 2 ? -1 : 1) * 0.9;
        if (a.fvy) a.y += a.fvy;   // pociąg: odrzut w stronę krawędzi platformy
        // odbicie od krawędzi ekranu: wróg wraca w powietrzu — można go dobić
        if (a.team !== 'player' && !a.wallBounced && Math.abs(a.vx) > 1.2 && a.kind !== 'rex' && G) {
          const L = G.camX + 8, Rr = G.camX + W - 8;
          if ((a.x < L && a.vx < 0) || (a.x > Rr && a.vx > 0)) {
            a.wallBounced = true; a.x = clamp(a.x, L, Rr); a.vx = -a.vx * 0.75; a.vz = Math.max(a.vz, 2.6); a.z = Math.max(a.z, 6);
            a.hp -= 4; a.flash = 6; G.shake = Math.max(G.shake, 5); sfx('heavy'); spark(a.x, a.y, 24, true);
            G.popups.push({ x: a.x, y: a.y - 56, txt: 'ODBICIE!', t: 0, col: '#ffe080' });
            if (a.lastPlayer) { addScore(a.lastPlayer, 300); addCombo(a.lastPlayer); }
            if (a.hp <= 0 && !a.dying) onDeath(a, a.lastPlayer);
          }
        }
        if (a.state === 'thrown') {
          for (const o of G.actors) {
            if (o === a || o.team === 'player' || !hittable(o) || (isBoss(o) && o.armor)) continue;
            if (Math.abs(o.x - a.x) < 16 + o.rad * 0.5 && Math.abs(o.y - a.y) < 10) {
              hurt(o, 12, a.vx > 0 ? 1 : -1, !isBoss(o), a.thrower, { unblock: true, throw: true }); spark(o.x, o.y, 22, true); sfx('heavy'); G.hitstop = 5;
            }
          }
        }
        if (a.z <= 0) {
          a.z = 0; a.fvy = 0;
          if (a.team !== 'player' && !isBoss(a) && a.kind !== 'rex' && !a.bounced && ringOut(a)) return true;
          if (a.state === 'thrown') {
            a.hp -= 12; a.lastThrow = true; sfx('heavy'); G.shake = 5; dust(a.x, a.y);
            if (a.hp <= 0 && !a.dying) onDeath(a, a.thrower);
            a.state = 'fall'; a.bounced = false;
          }
          if (!a.bounced) { a.bounced = true; a.vz = 1.8; a.z = 0.1; a.vx *= 0.5; sfx('land'); dust(a.x, a.y); if (a.kind === 'rex') G.shake = 10; }
          else { setState(a, 'down'); a.vx = 0; a.vz = 0; a.juggle = 0; a.wallBounced = false; }
        }
        return true;
      }
      case 'hopin':   // wskok na platformę pociągu
        a.y += a.fvy || 0; a.vz -= GRAV; a.z += a.vz; a.animT++;
        if (a.z <= 0) { a.z = 0; a.fvy = 0; setState(a, 'idle'); dust(a.x, a.y); sfx('land'); }
        return true;
      case 'down':
        if (a.t > (a.kind === 'player' ? 46 : 40)) {
          if (a.hp <= 0 && a.tame) setState(a, 'tamed');
          else if (a.hp <= 0) setState(a, 'dead');
          else setState(a, 'getup');
        }
        return true;
      case 'tamed':
        if (a.t > 420) { a.face = a.x - G.camX < W / 2 ? -1 : 1; setState(a, 'flee'); }
        return true;
      case 'flee':
        a.x += a.face * 3; a.animT++;
        if (a.x < G.camX - 70 || a.x > G.camX + W + 70) { a.alive = false; a.remove = true; }
        return true;
      case 'getup':
        if (a.t > 14) { setState(a, 'idle'); a.hurtCount = 0; if (a.kind === 'player') a.invuln = 60; }
        return true;
      case 'grabbed':
        if (!a.grabbedBy) setState(a, 'idle');
        return true;
      case 'dead':
        if (a.t > 60) {
          if (a.kind === 'player') playerDied(a);
          else { a.alive = false; a.remove = true; }
        }
        return true;
    }
    return false;
  }

  function respawn(p) {
    p.hp = p.maxHp; p.lagHp = p.maxHp; p.weapon = null; p.alive = true; p.dying = false;
    p.x = G.camX + 80; p.y = 185; p.z = 140; p.vz = 0; setState(p, 'drop'); p.invuln = 150;
  }
  function playerDied(p) {
    if (p.st) p.st.deaths++;
    if (p.lives > 0) { p.lives--; respawn(p); return; }
    p.alive = false; p.out = true;
    if (G.players.some(q => q.alive)) {
      G.popups.push({ x: G.camX + W / 2, y: 120, txt: (p.pIdx + 1) + 'P: START = KONTYNUACJA', t: 0, col: P_COLS[p.pIdx] });
      return;
    }
    app.mode = 'gameover'; app.t = 0; app.cont = (G.rush || G.special === 'survival' || G.ch || app.gameMode === 'daily') ? 0 : 10; AU.stopMusic(); AU.play('gameover');
  }
  // dołączenie gracza 2 lub kontynuacja gracza, który stracił wszystkie życia
  function joinOrContinue(i) {
    let p = G.players[i];
    if (!p) {
      if (i !== 1) return false;
      app.p2Active = true;
      let k = app.sel2;
      if (k === app.sel) k = (app.sel + 1) % selKeys().length;
      p = makePlayer(selKeys()[k], 1, false);
      p.lives = OPTS.lives - 1;
      G.players.push(p); G.actors.push(p);
      respawn(p);
      G.popups.push({ x: p.x, y: 110, txt: '2P DOŁĄCZA!', t: 0, col: P_COLS[1] });
      sfx('start');
      return true;
    }
    if (!p.out) return false;
    p.out = false; p.lives = OPTS.lives - 1;
    if (!G.actors.includes(p)) G.actors.push(p);
    respawn(p); sfx('start');
    return true;
  }

