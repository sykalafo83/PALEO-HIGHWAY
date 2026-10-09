  // =============================================================== AI BOSSÓW (LUDZIE)
  function updateBoss(b) {
    b.t++; b.cool--;
    b.armor = false;
    if (updateCommon(b)) return;
    const p = nearestPlayer(b);
    const d = b.def;
    const enraged = b.hp < b.maxHp * 0.5;
    if (enraged && !b.called && d.summon) {
      b.called = true;
      G.pending.push({ type: d.summon[0], side: 'L', y: 175, delay: 20 }, { type: d.summon[1], side: 'R', y: 200, delay: 50 });
      G.popups.push({ x: b.x, y: b.y - 80, txt: d.shout, t: 0, col: '#ff6040' });
      sfx(d.ai === 'baron' ? 'warp' : 'eDie');
    }
    if (b.state === 'enter') {
      enterScreen(b);
      if (b.state === 'idle') { setState(b, 'intro'); if (!G.introBoss) G.introBoss = b; }
      return;
    }
    if (b.state === 'intro') {
      if (b.t === 1) { sfx(d.ai === 'baron' ? 'thunder' : 'zap'); G.shake = 10; }
      if (b.t > 80) { setState(b, 'idle'); G.introBoss = null; }
      return;
    }
    if (b.state === 'recover') { if (b.t > 30) setState(b, 'idle'); return; }
    // druga faza: przy 30% życia „ostatni atak” — trzykrotna szarża przez całą arenę, potem zadyszka; co kilka sekund od nowa
    if (['hammer', 'whip', 'harpoon'].includes(d.ai) && b.hp > 0 && b.hp < b.maxHp * 0.3 && !b.phase2) {
      b.phase2 = true; b.rampCool = 0;
      G.popups.push({ x: b.x, y: b.y - 90, txt: 'OSTATNI ATAK!', t: 0, col: '#ff4020' });
    }
    if (b.phase2 && ['idle', 'walk'].includes(b.state) && --b.rampCool <= 0) { setState(b, 'rage'); }
    if (b.state === 'rage') {
      b.armor = true;
      if (b.t === 1) { sfx('roar'); G.shake = 12; G.popups.push({ x: b.x, y: b.y - 84, txt: d.ai === 'hammer' ? 'SZAŁ!' : 'GIŃCIE!', t: 0, col: '#ff6040' }); }
      if (b.t > 45) { setState(b, 'rampage'); b.rampN = 3; b.face = b.x > G.camX + W / 2 ? -1 : 1; }
      return;
    }
    if (b.state === 'rampage') {
      b.armor = true; b.x += b.face * 5.2; b.animT++;
      if (G.frame % 4 === 0) dust(b.x - b.face * 12, b.y);
      resolveHits(b, MOVES.rampage, true);
      const edge = b.face > 0 ? G.camX + W - 34 : G.camX + 34;
      if ((b.face > 0 && b.x >= edge) || (b.face < 0 && b.x <= edge)) {
        b.x = edge; G.shake = 6; sfx('slam'); G.fx.push({ type: 'shock', x: b.x, y: b.y, z: 0, t: 0, life: 18, r: 30 });
        if (--b.rampN <= 0) { setState(b, 'winded'); b.rampCool = 520; G.popups.push({ x: b.x, y: b.y - 80, txt: 'ZADYSZKA!', t: 0, col: '#7cff7c' }); }
        else setState(b, 'rampwait');
      }
      return;
    }
    if (b.state === 'rampwait') {
      const tp = nearestPlayer(b);
      if (tp) b.y += clamp(tp.y - b.y, -1.6, 1.6);
      if (b.t > 22) { setState(b, 'rampage'); b.face = -b.face; }
      return;
    }
    if (b.state === 'winded') { if (b.t > 80) setState(b, 'idle'); return; }
    if (b.state === 'attack') {
      const m = b.move;
      if (b.t < m.start && (d.ai === 'hammer' || m === MOVES.anchor)) b.armor = true;
      if (b.t === 3 && d.ai === 'hammer') sfx('zap');
      if (b.t >= m.start && b.t < m.start + m.active) {
        if (b.t === m.start && (m === MOVES.bossSwing || m === MOVES.anchor)) { sfx('slam'); G.shake = 6; G.fx.push({ type: 'shock', x: b.x + b.face * 44, y: b.y, z: 0, t: 0, life: 18, r: 30 }); }
        resolveHits(b, m);
      }
      if (b.t >= m.start + m.active + m.rec) {
        if (d.ai === 'baron' && b.combo > 0) { b.combo--; startMove(b, b.combo === 0 ? MOVES.caneFinal : MOVES.cane); return; }
        if (d.ai === 'harpoon') b.weapon = 'harpoonGun';
        setState(b, 'idle');
      }
      return;
    }
    if (!p) { b.state = 'idle'; return; }
    const dist = Math.abs(p.x - b.x), ddy = Math.abs(p.y - b.y);
    if (d.ai === 'hammer') return bossHammer(b, p, dist, ddy, enraged);
    if (d.ai === 'whip') return bossWhip(b, p, dist, ddy, enraged);
    if (d.ai === 'harpoon') return bossHarpoon(b, p, dist, ddy, enraged);
    if (d.ai === 'baron') return bossBaron(b, p, dist, ddy, enraged);
  }

  function bossCharge(b, speed, dmg) {
    b.armor = true;
    if (b.t < 30) { b.x += (b.t % 4 < 2 ? 0.8 : -0.8); return; }
    b.x += b.face * speed; b.animT++;
    if (b.t % 6 === 0) dust(b.x - b.face * 10, b.y);
    resolveHits(b, { reach: 22, dmg, knock: true, snd: 'heavy', shake: 6, depth: 12 });
    if (b.t > 110 || b.x < G.camX + 16 || b.x > G.camX + W - 16) { setState(b, 'recover'); G.shake = 6; sfx('land'); }
  }

  function bossHammer(b, p, dist, ddy, enraged) {
    switch (b.state) {
      case 'idle': case 'walk': {
        b.face = p.x > b.x ? 1 : -1;
        if (b.hurtCount >= 3) { b.hurtCount = 0; startMove(b, MOVES.bossSwing); return; }
        if (b.cool <= 0) {
          const r = Math.random();
          if (dist < 56 && ddy < 12) { startMove(b, MOVES.bossSwing); b.cool = enraged ? 40 : 60; return; }
          if (ddy < 16 && dist > 90 && r < 0.45) { setState(b, 'charge'); sfx('charge'); b.cool = enraged ? 50 : 80; return; }
          if (r < 0.7) { setState(b, 'slam'); b.cool = enraged ? 60 : 90; return; }
          b.cool = 30;
        }
        stepToward(b, p.x + (Math.sign(b.x - p.x) || 1) * 40, p.y, b.def.speed * (enraged ? 1.35 : 1));
        return;
      }
      case 'charge': return bossCharge(b, enraged ? 5 : 4.4, 14);
      case 'slam':
        b.armor = true;
        if (b.t === 1) {
          b.vz = 6.6;
          const tx = clamp(p.x, G.camX + 20, G.camX + W - 20);
          b.vx = (tx - b.x) / 40; b.vy = (p.y - b.y) / 40; b.face = b.vx >= 0 ? 1 : -1;
          sfx('jump');
        }
        b.x += b.vx; b.y += b.vy; b.vz -= GRAV; b.z += b.vz;
        if (b.z <= 0 && b.t > 3) {
          b.z = 0; b.vz = 0;
          sfx('slam'); G.shake = 14;
          G.fx.push({ type: 'shock', x: b.x, y: b.y, z: 0, t: 0, life: 26, r: 90 });
          for (let i = 0; i < 6; i++) dust(b.x + rnd(-40, 40), b.y + rnd(-6, 6));
          for (const t of G.actors) {
            if (t.team !== 'player' || !hittable(t) || t.z > 4) continue;
            if (Math.abs(t.x - b.x) < 80 && Math.abs(t.y - b.y) < 24) hurt(t, 12, t.x >= b.x ? 1 : -1, true, b);
          }
          setState(b, 'recover');
        }
        return;
    }
  }

  function bossWhip(b, p, dist, ddy, enraged) {
    switch (b.state) {
      case 'idle': case 'walk': {
        b.face = p.x > b.x ? 1 : -1;
        if (b.cool <= 0) {
          if (dist < 30 && Math.random() < 0.6) { setState(b, 'flip'); b.cool = 30; return; }
          if (dist < 76 && ddy < 8) { b.whipN = (b.whipN || 0) + 1; startMove(b, b.whipN % 2 ? MOVES.whip : Object.assign({}, MOVES.whip, { knock: true })); b.cool = enraged ? 26 : 40; return; }
          if (dist > 100 && ddy < 10 && Math.random() < 0.5) { setState(b, 'dashkick'); sfx('whoosh'); b.cool = 60; return; }
          if (dist > 80 && Math.random() < 0.5) { setState(b, 'throwKnives'); b.cool = enraged ? 50 : 80; return; }
          b.cool = 15;
        }
        stepToward(b, p.x + (Math.sign(b.x - p.x) || 1) * 60, p.y, b.def.speed * (enraged ? 1.25 : 1));
        return;
      }
      case 'flip':
        b.invuln = 2;
        if (b.t === 1) { b.vz = 5.4; b.vx = -b.face * 3.2; sfx('jump'); }
        b.x = clamp(b.x + b.vx, G.camX + 16, G.camX + W - 16); b.vz -= GRAV; b.z += b.vz;
        if (b.z <= 0 && b.t > 3) { b.z = 0; b.vz = 0; sfx('land'); setState(b, 'throwKnives'); }
        return;
      case 'throwKnives':
        b.face = p.x > b.x ? 1 : -1;
        if (b.t === 10) { (enraged ? [-14, -7, 0, 7, 14] : [-10, 0, 10]).forEach(o => shoot({ type: 'knife', x: b.x + b.face * 12, y: b.y + o, z: 28, vx: b.face * 4.6, dmg: 9, knock: false })); sfx('whoosh'); }
        if (b.t > 26) setState(b, 'idle');
        return;
      case 'dashkick':
        if (b.t < 10) return;
        b.x += b.face * 5; b.animT++;
        if (b.t < 30) resolveHits(b, { reach: 22, dmg: 12, knock: true, snd: 'heavy' });
        if (b.t > 30 || b.x < G.camX + 8 || b.x > G.camX + W - 8) setState(b, 'recover');
        return;
    }
  }

  function bossHarpoon(b, p, dist, ddy, enraged) {
    switch (b.state) {
      case 'idle': case 'walk': {
        b.face = p.x > b.x ? 1 : -1;
        if (b.cool <= 0) {
          if (dist < 56 && ddy < 12) { b.weapon = 'anchor'; startMove(b, MOVES.anchor); b.cool = enraged ? 35 : 55; return; }
          if (ddy < 8 && dist > 80) { setState(b, 'aimH'); b.cool = enraged ? 50 : 80; return; }
          if (ddy < 16 && dist > 60 && Math.random() < 0.3) { setState(b, 'charge'); sfx('charge'); b.cool = 80; return; }
          b.cool = 20;
        }
        const want = dist < 70 ? 120 : 40;
        stepToward(b, p.x + (Math.sign(b.x - p.x) || 1) * want, p.y, b.def.speed * (enraged ? 1.3 : 1));
        return;
      }
      case 'aimH':
        b.face = p.x > b.x ? 1 : -1;
        if (b.t < 20) b.y += Math.sign(p.y - b.y) * 0.5;
        if (b.t === 2) sfx('charge');
        if (b.t === 34) { shoot({ type: 'harpoon', x: b.x + b.face * 34, y: b.y, z: 30, vx: b.face * 6.5, dmg: Math.round(15 * b.dmgMul) }); sfx('harpoon'); G.shake = 4; }
        if (b.t > 50) setState(b, 'idle');
        return;
      case 'charge': return bossCharge(b, enraged ? 4.8 : 4.2, 13);
    }
  }

  function bossBaron(b, p, dist, ddy, enraged) {
    switch (b.state) {
      case 'idle': case 'walk': {
        b.face = p.x > b.x ? 1 : -1;
        if (b.cool <= 0) {
          const r = Math.random();
          if (dist < 42 && ddy < 8) { b.combo = 2; startMove(b, MOVES.cane); b.cool = enraged ? 30 : 45; return; }
          if (r < 0.35) { setState(b, 'warp'); sfx('warp'); b.cool = enraged ? 40 : 70; return; }
          if (dist > 90 && ddy < 24) { setState(b, 'cast'); b.cool = enraged ? 45 : 75; return; }
          b.cool = 15;
        }
        stepToward(b, p.x + (Math.sign(b.x - p.x) || 1) * 36, p.y, b.def.speed * (enraged ? 1.3 : 1));
        return;
      }
      case 'warp':
        b.invuln = 2;
        b.alpha = b.t < 16 ? 1 - b.t / 16 : Math.min(1, (b.t - 16) / 10);
        if (b.t === 16) {
          const side = -p.face || 1;
          b.x = clamp(p.x + side * 34, G.camX + 20, G.camX + W - 20); b.y = p.y; b.face = p.x > b.x ? 1 : -1;
          sfx('warp'); G.fx.push({ type: 'shock', x: b.x, y: b.y, z: 0, t: 0, life: 14, r: 24 });
        }
        if (b.t > 26) { b.alpha = 1; b.invuln = 0; b.combo = 2; startMove(b, MOVES.cane); }
        return;
      case 'cast':
        b.armor = b.t < 18;
        if (b.t === 4) sfx('energy');
        if (b.t === 18) {
          const lanes = enraged ? [-16, 0, 16] : [0];
          lanes.forEach(o => shoot({ type: 'wave', x: b.x + b.face * 20, y: clamp(p.y + o, FLOOR_TOP + 8, FLOOR_BOTTOM), z: 0, vx: b.face * 3.4, dmg: Math.round(14 * b.dmgMul), pierce: true }));
          G.shake = 6;
        }
        if (b.t > 34) setState(b, 'idle');
        return;
    }
  }

