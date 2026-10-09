  // =============================================================== AI BESTII
  function beastTarget(r) {
    let best = null, bd = 1e9;
    for (const a of G.actors) {
      if (!hostile(r, a) || !hittable(a)) continue;
      const d = Math.abs(a.x - r.x) + Math.abs(a.y - r.y) * 2 + (a.kind === 'player' ? -40 : 0);
      if (d < bd) { bd = d; best = a; }
    }
    return best;
  }
  function updateRaptor(r) {
    r.t++; r.cool--; r.animT++;
    if (updateCommon(r)) return;
    const best = beastTarget(r);
    switch (r.state) {
      case 'enter':
        enterScreen(r); r.x += r.face * 0.8;
        if (r.state === 'idle') { setState(r, 'roar'); sfx('screech'); }
        return;
      case 'roar': if (r.t > 36) setState(r, 'idle'); return;
      case 'idle': case 'walk': case 'run': {
        if (!best) { r.state = 'idle'; return; }
        const dist = Math.abs(best.x - r.x), ddy = Math.abs(best.y - r.y);
        r.face = best.x > r.x ? 1 : -1;
        if (dist < 36 && ddy < 7 && r.cool <= 0) { setState(r, 'bite'); r.cool = rnd(40, 70) / ST.diff; return; }
        const run = dist > 90;
        const tx = best.x - r.face * 28, ty = best.y;
        const sp = r.def.speed * (run ? 2 : 1);
        const mx = Math.abs(tx - r.x) > 3 ? Math.sign(tx - r.x) : 0, my = Math.abs(ty - r.y) > 2 ? Math.sign(ty - r.y) : 0;
        r.x += mx * sp; r.y += my * sp * 0.6;
        r.state = (mx || my) ? (run ? 'run' : 'walk') : 'idle';
        return;
      }
      case 'bite':
        if (r.t === 6) sfx('screech');
        if (r.t >= 8 && r.t < 13) { r.x += r.face * 2; if (r.t === 9) sfx('bite'); resolveHits(r, { reach: 34, dmg: 9, snd: 'hit' }); }
        if (r.t > 28) setState(r, 'idle');
        return;
    }
  }
  function updatePachy(r) {
    r.t++; r.cool--; r.animT++;
    if (updateCommon(r)) return;
    const best = beastTarget(r);
    switch (r.state) {
      case 'enter':
        enterScreen(r);
        if (r.state === 'idle') { setState(r, 'roar'); sfx('roar'); }
        return;
      case 'roar': if (r.t > 30) setState(r, 'idle'); return;
      case 'idle': case 'walk': {
        if (!best) { r.state = 'idle'; return; }
        const dist = Math.abs(best.x - r.x), ddy = Math.abs(best.y - r.y);
        r.face = best.x > r.x ? 1 : -1;
        if (ddy < 8 && dist > 40 && dist < 220 && r.cool <= 0) { setState(r, 'windup'); sfx('charge'); return; }
        if (dist < 34 && ddy < 8 && r.cool <= 0) { setState(r, 'windup'); r.t = 14; return; }
        const tx = best.x - r.face * 90, ty = best.y;
        const mx = Math.abs(tx - r.x) > 3 ? Math.sign(tx - r.x) : 0, my = Math.abs(ty - r.y) > 2 ? Math.sign(ty - r.y) : 0;
        r.x += mx * r.def.speed; r.y += my * r.def.speed * 0.7;
        r.state = (mx || my) ? 'walk' : 'idle';
        return;
      }
      case 'windup':
        if (r.t % 6 === 0) dust(r.x - r.face * 6, r.y);
        if (r.t > 22) setState(r, 'charge');
        return;
      case 'charge':
        r.x += r.face * (r.def.chargeSpeed || 4.2);
        if (r.t % 5 === 0) dust(r.x - r.face * 10, r.y);
        resolveHits(r, { reach: 30, dmg: r.def.chargeDmg || 13, knock: true, snd: 'heavy', shake: 4 });
        if (r.t > 70 || r.x < G.camX + 10 || r.x > G.camX + W - 10) { setState(r, 'recover'); r.cool = rnd(70, 120) / ST.diff; }
        return;
      case 'recover': if (r.t > 30) setState(r, 'idle'); return;
    }
  }

  // =============================================================== AI PARAZAUROLOFA
  function updatePara(r) {
    r.t++; r.cool--; r.animT++;
    if (updateCommon(r)) return;
    const best = beastTarget(r);
    switch (r.state) {
      case 'enter': enterScreen(r); if (r.state === 'idle') { setState(r, 'roar'); sfx('roar'); } return;
      case 'idle': case 'walk': case 'run': {
        if (!best) { r.state = 'idle'; return; }
        const dist = Math.abs(best.x - r.x), ddy = Math.abs(best.y - r.y);
        r.face = best.x > r.x ? 1 : -1;
        if (r.cool <= 0 && dist < 120 && Math.random() < 0.02) { setState(r, 'roar'); r.cool = rnd(160, 220) / ST.diff; return; }
        if (dist < 34 && ddy < 8 && r.cool <= 0) { setState(r, 'bite'); r.cool = rnd(50, 80) / ST.diff; return; }
        const run = dist > 90, sp = r.def.speed * (run ? 1.7 : 1);
        const tx = best.x - r.face * 28, mx = Math.abs(tx - r.x) > 3 ? Math.sign(tx - r.x) : 0, my = Math.abs(best.y - r.y) > 2 ? Math.sign(best.y - r.y) : 0;
        r.x += mx * sp; r.y += my * sp * 0.6;
        r.state = (mx || my) ? (run ? 'run' : 'walk') : 'idle';
        return;
      }
      case 'roar':
        if (r.t === 8) {
          sfx('roar'); G.shake = 8;
          for (const t of G.actors) if (hostile(r, t) && hittable(t) && t.z < 4 && Math.abs(t.x - r.x) < 110 && Math.abs(t.y - r.y) < 30) {
            if (t.kind === 'player' || (t.kind === 'human' && !isBoss(t))) { setState(t, 'stun'); t.flash = 4; }
          }
        }
        if (r.t > 46) setState(r, 'idle');
        return;
      case 'bite':
        if (r.t >= 8 && r.t < 13) { r.x += r.face * 1.5; resolveHits(r, { reach: 30, dmg: 10, knock: true, snd: 'heavy' }); }
        if (r.t > 26) setState(r, 'idle');
        return;
    }
  }

  // =============================================================== AI PTERANODONA
  function updatePtera(r) {
    r.t++; r.cool--; r.animT++;
    if (updateCommon(r)) return;
    const ps = players().filter(q => q.state !== 'dead');
    const tgt = ps.length ? ps.reduce((a, b) => Math.abs(a.x - r.x) < Math.abs(b.x - r.x) ? a : b) : null;
    switch (r.state) {
      case 'enter':
        r.z = 80; r.x += r.face * 2; r.animT++;
        if (r.x > G.camX + 30 && r.x < G.camX + W - 30) { setState(r, 'fly'); sfx('screech'); }
        return;
      case 'idle': setState(r, 'fly'); return;
      case 'fly': {
        r.z += ((76 + Math.sin(r.t * 0.05) * 6) - r.z) * 0.08;
        if (!tgt) return;
        const tx = tgt.x + Math.sin(r.t * 0.02) * 60;
        r.vx = clamp((tx - r.x) * 0.03, -r.def.speed * 1.5, r.def.speed * 1.5);
        r.x += r.vx; r.y += Math.sign(tgt.y - r.y) * 0.4;
        if (Math.abs(r.vx) > 0.2) r.face = r.vx >= 0 ? 1 : -1;
        if (r.cool <= 0 && Math.abs(tgt.x - r.x) < 14) {
          if (Math.random() < 0.6) { shoot({ type: 'rock', x: r.x, y: tgt.y, z: r.z - 8, vz: 0, life: 999 }); sfx('whoosh'); r.cool = rnd(110, 160) / ST.diff; }
          else { setState(r, 'swoop'); r.face = tgt.x >= r.x ? 1 : -1; r.cool = rnd(140, 200) / ST.diff; sfx('screech'); }
        }
        return;
      }
      case 'swoop': {
        const k = Math.min(1, r.t / 50);
        r.z = 76 - Math.sin(k * Math.PI) * 60;
        r.x += r.face * 2.6;
        if (r.z < 34) resolveHits(r, { reach: 24, dmg: 9, knock: true, snd: 'bite', height: 30 });
        if (r.t > 50) setState(r, 'fly');
        return;
      }
    }
  }

  // =============================================================== AI STAREGO KŁA
  function updateRex(b) {
    b.t++; b.cool--; b.animT++;
    if (updateCommon(b)) return;
    // druga faza bestii: wściekłość — częstsze ataki
    if (!b.phase2 && b.hp > 0 && b.hp < b.maxHp * 0.3 && b.state !== 'enter' && b.state !== 'intro') {
      b.phase2 = true; sfx('roar'); G.shake = 16; G.popups.push({ x: b.x, y: b.y - 110, txt: 'WŚCIEKŁOŚĆ!', t: 0, col: '#ff4020' });
    }
    if (b.phase2) b.cool--;
    const p = nearestPlayer(b);
    const enraged = b.hp < b.maxHp * 0.5;
    if (enraged && !b.called) {
      b.called = true; setState(b, 'roar');
      G.pending.push({ type: 'raptor', side: 'L', y: 175, delay: 40 }, { type: 'raptor', side: 'R', y: 205, delay: 70 });
      return;
    }
    switch (b.state) {
      case 'enter':
        enterScreen(b);
        if (b.state === 'idle') { setState(b, 'roar'); G.introBoss = b; }
        return;
      case 'roar':
        if (b.t === 4) { sfx('roar'); G.shake = 30; }
        if (b.t === 10) for (const t of players()) if (hittable(t) && t.z < 2 && Math.abs(t.x - b.x) < 240) { setState(t, 'stun'); t.flash = 4; }
        if (b.t > 70) { setState(b, 'idle'); G.introBoss = null; }
        return;
      case 'idle': case 'walk': {
        if (!p) { b.state = 'idle'; return; }
        const dx = p.x - b.x, dist = Math.abs(dx), ddy = Math.abs(p.y - b.y);
        const behind = Math.sign(dx) !== b.face;
        if (b.cool <= 0) {
          // ataki specjalne: Kolos — deszcz bursztynowych odłamków, Zębacz — atak z rynny ściekowej
          if (b.type === 'kolos' && Math.random() < (b.phase2 ? 0.5 : 0.3)) { setState(b, 'shards'); b.cool = enraged ? 60 : 80; return; }
          if (b.type === 'deino' && dist > 60 && Math.random() < (b.phase2 ? 0.5 : 0.3)) { setState(b, 'submerge'); b.cool = enraged ? 70 : 100; return; }
          if (behind && dist < 90 && ddy < 18) { setState(b, 'tail'); b.cool = enraged ? 30 : 50; return; }
          if (!behind && dist < 90 && ddy < 18) { startMove(b, MOVES.rexBite); b.cool = enraged ? 35 : 55; return; }
          if (ddy < 20 && dist > 120 && Math.random() < 0.5) { setState(b, 'charge'); b.cool = enraged ? 60 : 90; return; }
          if (Math.random() < 0.15) { setState(b, 'roar'); b.cool = 80; return; }
          b.cool = 20;
        }
        if (!behind || dist > 120) b.face = dx >= 0 ? 1 : -1;
        stepToward(b, clamp(p.x - b.face * 70, G.camX + 90, G.camX + W - 90), p.y, b.def.speed * (enraged ? 1.3 : 1));
        return;
      }
      case 'attack': {
        const m = b.move;
        if (b.t === 2) sfx('screech');
        if (b.t >= m.start && b.t < m.start + m.active) { b.x += b.face * 1.5; resolveHits(b, m); if (b.t === m.start) sfx('bite'); }
        if (b.t >= m.start + m.active + m.rec) setState(b, 'idle');
        return;
      }
      case 'tail': {
        const m = MOVES.rexTail;
        if (b.t >= m.start && b.t < m.start + m.active) {
          if (b.t === m.start) sfx('whoosh');
          b.face = -b.face; resolveHits(b, m); b.face = -b.face;
        }
        if (b.t >= m.start + m.active + m.rec) setState(b, 'idle');
        return;
      }
      case 'charge':
        if (b.t < 34) { if (b.t === 1) sfx('roar'); b.x += (b.t % 4 < 2 ? 1 : -1); return; }
        b.x += b.face * (enraged ? 5 : 4.2);
        if (b.t % 5 === 0) { dust(b.x - b.face * 30, b.y); G.shake = 3; }
        resolveHits(b, { abs: true, reach: 50, dmg: 18, knock: true, snd: 'heavy', shake: 8, depth: 16 });
        if (b.t > 140 || b.x < G.camX + 92 || b.x > G.camX + W - 92) {
          b.x = clamp(b.x, G.camX + 90, G.camX + W - 90);
          setState(b, 'dazed'); sfx('slam'); G.shake = 14; spark(b.x + b.face * 40, b.y, 50, true);
          G.popups.push({ x: b.x, y: b.y - 80, txt: 'OGŁUSZONY!', t: 0, col: '#ffe040' });
        }
        return;
      case 'dazed': if (b.t > 90) setState(b, 'idle'); return;
      case 'shards':
        // ryk i tupnięcie, potem odłamki spadają w cienie pod graczami
        if (b.t === 1) { sfx('roar'); G.shake = 12; }
        if (b.t >= 12 && b.t <= 66 && b.t % 9 === 3) {
          for (const q of players()) if (q.alive) (G.drops = G.drops || []).push({ x: clamp(q.x + rnd(-36, 36), G.camX + 16, G.camX + W - 16), y: clamp(q.y + rnd(-10, 10), FLOOR_TOP + 8, FLOOR_BOTTOM), t: 0 });
        }
        if (b.t > 80) setState(b, 'idle');
        return;
      case 'submerge':
        // zanurza się w rynnie ściekowej
        b.invuln = Math.max(b.invuln, 2);
        if (b.t === 1) { sfx('screech'); G.shake = 6; }
        b.y += (FLOOR_TOP + 8 - b.y) * 0.15; b.alpha = Math.max(0, 1 - b.t / 18);
        if (b.t % 4 === 0) dust(b.x + rnd(-20, 20), b.y);
        if (b.t > 18) { b.alpha = 0; setState(b, 'swim'); b.alpha = 0; }
        return;
      case 'swim':
        // pod powierzchnią — widać tylko bąbelki sunące za graczem
        b.invuln = Math.max(b.invuln, 2); b.alpha = 0;
        if (p) { b.x += clamp(p.x - b.x, -3.2, 3.2); b.y += clamp(p.y - b.y, -1.3, 1.3); b.face = p.x >= b.x ? 1 : -1; }
        if (b.t % 10 === 0) sfx('land');
        if (b.t > 75) { setState(b, 'leap'); b.alpha = 1; b.z = 1; b.vz = 6.4; sfx('roar'); G.shake = 8; }
        return;
      case 'leap':
        b.invuln = Math.max(b.invuln, 2);
        b.z += b.vz; b.vz -= GRAV;
        if (b.z <= 0) {
          b.z = 0; b.vz = 0; sfx('slam'); G.shake = 16; dust(b.x - 30, b.y); dust(b.x + 30, b.y);
          G.fx.push({ type: 'shock', x: b.x, y: b.y, z: 0, t: 0, life: 22, r: 60 });
          for (const q of players()) if (hittable(q) && q.z < 12 && Math.abs(q.x - b.x) < 56 && Math.abs(q.y - b.y) < 18) hurt(q, 18, q.x >= b.x ? 1 : -1, true, b, { unblock: true });
          setState(b, 'dazed'); b.t = 40;
          G.popups.push({ x: b.x, y: b.y - 80, txt: 'TERAZ!', t: 0, col: '#ffe040' });
        }
        return;
    }
  }

