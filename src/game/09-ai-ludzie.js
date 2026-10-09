  // =============================================================== AI LUDZI
  function nearestPlayer(e) {
    let best = null, bd = 1e9;
    for (const p of players()) { if (p.state === 'dead') continue; const d = Math.abs(p.x - e.x) + Math.abs(p.y - e.y) * 2; if (d < bd) { bd = d; best = p; } }
    return best;
  }
  function enterScreen(e) {
    const m = e.kind === 'rex' ? 90 : 24;
    const tx = clamp(e.x, G.camX + m, G.camX + W - m);
    e.face = tx > e.x ? 1 : -1;
    e.x += e.face * Math.max(1, e.def.speed * 1.2); e.animT++;
    e.y += Math.sign(e.hoverY - e.y) * 0.3;
    if (Math.abs(tx - e.x) < 2) setState(e, 'idle');
  }
  function stepToward(e, tx, ty, sp) {
    tx = clamp(tx, G.camX + 14, G.camX + W - 14);
    const mx = Math.abs(tx - e.x) > 3 ? Math.sign(tx - e.x) : 0, my = Math.abs(ty - e.y) > 2 ? Math.sign(ty - e.y) : 0;
    e.x += mx * sp; e.y += my * sp * 0.6;
    e.state = (mx || my) ? 'walk' : 'idle';
    if (mx || my) e.animT++;
  }
  function maxAttackers() { return ST.diff >= 1.35 ? 3 : 2; }

  function updateHuman(e) {
    e.t++; e.cool--;
    if (updateCommon(e)) return;
    const p = nearestPlayer(e);
    const ai = e.def.ai;
    const boss = isBoss(e);
    const spMul = e.enraged ? 1.3 : 1;
    switch (e.state) {
      case 'enter':
        enterScreen(e);
        if (e.state === 'idle' && boss && !G.introBoss) { G.introBoss = e; setState(e, 'intro'); }
        return;
      case 'intro':
        if (e.t === 1) { sfx('roar'); G.shake = 8; }
        if (e.t > 80) { setState(e, 'idle'); G.introBoss = null; }
        return;
      case 'idle': case 'walk': {
        if (!p) { e.state = 'idle'; return; }
        if (--e.modeT <= 0) {
          const attackers = foes().filter(o => o.mode === 'approach' && o !== e).length;
          e.mode = boss || attackers < maxAttackers() ? 'approach' : 'hover';
          e.modeT = rnd(80, 160); e.hoverY = rnd(FLOOR_TOP + 8, FLOOR_BOTTOM - 4);
        }
        const side = Math.sign(e.x - p.x) || 1;
        const dist = Math.abs(p.x - e.x), ddy = Math.abs(p.y - e.y);
        if (ai === 'shield') {
          // tarczownik obraca się powoli — okazja, by zajść go od tyłu
          const want = p.x > e.x ? 1 : -1;
          if (want !== e.face) { if (++e.turnT > 40) { e.face = want; e.turnT = 0; } } else e.turnT = 0;
        } else e.face = p.x > e.x ? 1 : -1;
        if (ai === 'dummy') { e.state = 'idle'; return; }
        if (ai === 'sniper' && e.perch) {
          if (e.cool <= 0) { setState(e, 'snipeAim'); e.cool = rnd(150, 210) / ST.diff; }
          return;
        }
        if (ai === 'netter') {
          if (dist < 30 && ddy < 6 && e.cool <= 0) { startMove(e, MOVES.slash); e.cool = rnd(50, 80); return; }
          if (e.cool <= 0 && ddy < 6 && dist > 50 && dist < 170 && p.state !== 'netted') { setState(e, 'throwNet'); e.cool = rnd(170, 230) / ST.diff; return; }
          stepToward(e, p.x + side * 100, p.y, e.def.speed);
          return;
        }
        // dystansowcy
        if (ai === 'flamer') {
          if (e.cool <= 0 && ddy < 8 && dist > 20 && dist < 72) { setState(e, 'flame'); e.cool = rnd(130, 180) / ST.diff; sfx('charge'); return; }
          stepToward(e, p.x + side * 52, p.y, e.def.speed);
          return;
        }
        if (ai === 'bomber') {
          if (dist < 30 && ddy < 6 && e.cool <= 0) { startMove(e, MOVES.slash); e.cool = rnd(50, 80); return; }
          if (e.cool <= 0 && dist > 50 && dist < 200) { setState(e, 'lob'); e.cool = rnd(110, 170) / ST.diff; return; }
          stepToward(e, p.x + side * 110, e.mode === 'approach' ? p.y : e.hoverY, e.def.speed);
          return;
        }
        if (ai === 'gunner') {
          if (dist < 30 && ddy < 6 && e.cool <= 0) { startMove(e, MOVES.slash); e.cool = rnd(50, 80); return; }
          if (e.cool <= 0 && ddy < 4 && dist > 60 && dist < 260) { setState(e, 'aim'); e.cool = rnd(120, 170) / ST.diff; return; }
          stepToward(e, p.x + side * 140, p.y, e.def.speed);
          return;
        }
        if (ai === 'thin' && e.mode === 'approach' && dist > 45 && dist < 95 && ddy < 6 && e.cool <= 0 && Math.random() < 0.05) {
          setState(e, 'dashkick'); sfx('whoosh'); return;
        }
        if (e.def.knives && dist > 80 && ddy < 8 && e.cool <= 0 && Math.random() < 0.04) { setState(e, 'throwKnife'); return; }
        if (ai === 'brute' && dist > 70 && dist < 190 && ddy < 8 && e.cool <= 0 && Math.random() < (boss ? 0.05 : 0.03)) {
          setState(e, 'charge'); sfx('charge'); return;
        }
        if (e.mode === 'approach' && dist < e.def.range + 6 && ddy < 6 && e.cool <= 0 && p.state !== 'down') {
          const m = MOVES[e.def.attacks[Math.random() * e.def.attacks.length | 0]];
          startMove(e, m); e.cool = rnd(50, 100) / (boss ? 1.6 * spMul : ST.diff); return;
        }
        if (e.mode === 'approach') stepToward(e, p.x + side * (e.def.range - 4), p.y, e.def.speed * spMul);
        else stepToward(e, p.x + side * 95, e.hoverY, e.def.speed * 0.7);
        return;
      }
      case 'attack': {
        const m = e.move;
        if (e.t >= m.start && e.t < m.start + m.active) resolveHits(e, m);
        if (e.t === m.start) sfx('whoosh');
        if (e.t >= m.start + m.active + m.rec) setState(e, 'idle');
        return;
      }
      case 'snipeAim':
        if (e.t === 2 && p) { shoot({ type: 'snipe', x: p.x, y: p.y, z: 0, fuse: 52, from: e, life: 999 }); sfx('select'); }
        if (e.t > 58) setState(e, 'idle');
        return;
      case 'flame':
        // strumień ognia: rośnie do 62 px, co 12 klatek zostawia płonącą plamę na podłodze
        if (e.t > 16 && e.t < 70) {
          const reach = 22 + Math.min(40, (e.t - 16) * 2);
          if (e.t % 4 === 0) sfx('whoosh');
          if (e.t % 12 === 0) addFire(e.x + e.face * reach, e.y);
          if (e.t % 15 === 0) e.hitSet = null;
          resolveHits(e, { abs: true, reach, dmg: 6, knock: false, depth: 9, snd: 'zap' });
        }
        if (e.t > 84) setState(e, 'idle');
        return;
      case 'throwNet':
        if (e.t === 10) { shoot({ type: 'net', x: e.x + e.face * 12, y: e.y, z: 24 * scaleOf(e), vx: e.face * 3.6, dmg: 0, knock: false, life: 120 }); sfx('whoosh'); }
        if (e.t > 22) setState(e, 'idle');
        return;
      case 'lob':
        if (e.t === 14 && p) {
          const air = 28;
          shoot({ type: 'dynamite', x: e.x + e.face * 8, y: e.y, z: 30, vx: (p.x - e.x) / air, vy: (p.y - e.y) / air, vz: 3.6 });
          sfx('whoosh');
        }
        if (e.t > 28) setState(e, 'idle');
        return;
      case 'aim':
        if (e.t === 2) sfx('select');
        if (e.t === 40) { shoot({ type: 'bullet', x: e.x + e.face * 26, y: e.y, z: 22 * scaleOf(e), vx: e.face * 5, dmg: Math.round(10 * e.dmgMul) }); sfx('gun'); G.fx.push({ type: 'muzzle', x: e.x + e.face * 28, y: e.y, z: 24, t: 0, life: 5 }); }
        if (e.t > 52) setState(e, 'idle');
        return;
      case 'throwKnife':
        if (e.t === 10) { [-8, 0, 8].forEach(o => shoot({ type: 'knife', x: e.x + e.face * 12, y: e.y + o, z: 24 * scaleOf(e), vx: e.face * 4.2, dmg: 8, knock: false })); sfx('whoosh'); }
        if (e.t > 24) { setState(e, 'idle'); e.cool = rnd(60, 100); }
        return;
      case 'dashkick':
        if (e.t < 10) return;
        e.x += e.face * 4; e.animT++;
        if (e.t < 28) resolveHits(e, { reach: 20, dmg: 8, knock: true, snd: 'heavy' });
        if (e.t > 28 || e.x < G.camX + 6 || e.x > G.camX + W - 6) { setState(e, 'recover'); e.cool = rnd(80, 140) / ST.diff; }
        return;
      case 'charge':
        if (e.t < 26) { e.x += (e.t % 4 < 2 ? 0.6 : -0.6); return; }
        e.x += e.face * (boss ? 3.8 : 3.2); e.animT++;
        resolveHits(e, { reach: 18, dmg: 13, knock: true, snd: 'heavy', shake: 4 });
        if (e.t > 100 || e.x < G.camX + 10 || e.x > G.camX + W - 10) { setState(e, 'recover'); e.cool = rnd(90, 150) / ST.diff; }
        return;
      case 'recover': if (e.t > 26) setState(e, 'idle'); return;
    }
  }

