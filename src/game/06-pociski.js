  // =============================================================== POCISKI
  function shoot(o) { G.shots.push(Object.assign({ t: 0, vy: 0, vz: 0, z: 0, life: 240, dmg: 10, knock: true }, o)); }
  // owner = gracz → rani tylko wrogów (także bossów); inaczej rani wszystkich poza bossami
  function explode(x, y, owner, opt) {
    opt = opt || {};
    const R = opt.r || 38, dmg = opt.dmg || 14;
    sfx('explode'); G.shake = 12;
    G.players.forEach(q => { const d = Math.abs(q.x - x); if (d < 260) rumble(q.pIdx, 0.9 - d / 400, 0.7, 260); });
    G.fx.push({ type: 'boom', x, y, z: 0, t: 0, life: 24 });
    G.fx.push({ type: 'shock', x, y, z: 0, t: 0, life: 20, r: R + 6 });
    for (let i = 0; i < 4; i++) dust(x + rnd(-16, 16), y + rnd(-4, 4));
    for (const t of G.actors) {
      if (!hittable(t) || t.z > 24) continue;
      if (owner ? !hostile(owner, t) : isBoss(t)) continue;
      if (Math.abs(t.x - x) < R + (t.rad || 0) * 0.5 && Math.abs(t.y - y) < 16 + (t.depthR || 0)) {
        hurt(t, owner ? Math.round(dmg * ((owner.def && owner.def.power) || 1) * (1 + 0.25 * ((owner.up && owner.up.bomb) || 0))) : Math.round(dmg * diffNow().dmg), t.x >= x ? 1 : -1, true, owner || null, { unblock: true, weapon: opt.weapon });
        spark(t.x, t.y, hitY(t), true);
      }
    }
    for (const pr of G.props) if (pr.hp > 0 && Math.abs(pr.x - x) < R && Math.abs(pr.y - y) < 16) { pr.hp = Math.min(pr.hp, pr.kind === 'wall' ? 3 : 1); hitProp(pr, pr.x >= x ? 1 : -1, owner); }
  }
  function updateShots() {
    for (let i = G.shots.length - 1; i >= 0; i--) {
      const s = G.shots[i]; s.t++;
      if (s.type === 'prop') {
        if (updateFlyingProp(s)) { breakCarried(s, s.x, s.y, s.owner); G.shots.splice(i, 1); }
        continue;
      }
      if (s.type === 'netdrop') {
        s.vz -= GRAV * 0.4; s.z += s.vz;
        if (s.z <= 0) {
          const t = G.players.find(q => hittable(q) && q.z < 12 && q.state !== 'netted' && Math.abs(q.x - s.x) < 18 && Math.abs(q.y - s.y) < 10);
          if (t) netPlayer(t); else dust(s.x, s.y);
          G.shots.splice(i, 1);
        }
        continue;
      }
      // bomba gracza trafiająca w locie wroga spada mu pod nogi
      if (s.owner && !s.landed && s.vx && (s.type === 'dynamite' || s.type === 'grenade')) {
        for (const t of G.actors) {
          if (!hostile(s.owner, t) || !hittable(t)) continue;
          if (Math.abs(t.x - s.x) < 10 + t.rad * 0.5 && Math.abs(t.y - s.y) < 10 + (t.depthR || 0) && s.z < 44 * scaleOf(t)) {
            s.vx = -s.vx * 0.15; s.vz = Math.min(s.vz, 0); sfx('hit'); break;
          }
        }
      }
      if (s.type === 'dynamite') {
        if (!s.landed) {
          if (s.z > 0) s.vx += G.wind || 0;   // wiatr znosi lecące bomby
          s.x += s.vx; s.y = clamp(s.y + s.vy, FLOOR_TOP + 6, FLOOR_BOTTOM); s.vz -= GRAV; s.z += s.vz;
          if (s.z <= 0) { s.z = 0; s.landed = true; s.fuse = s.owner ? 34 : 42; sfx('fuse'); }
        } else if (--s.fuse <= 0) { explode(s.x, s.y, s.owner, s.owner ? { r: 44, dmg: 26, weapon: 'dynamite' } : null); G.shots.splice(i, 1); }
        continue;
      }
      if (s.type === 'grenade') {
        if (s.z > 0) s.vx += G.wind || 0;
        s.x += s.vx; s.y = clamp(s.y + s.vy, FLOOR_TOP + 6, FLOOR_BOTTOM); s.vz -= GRAV; s.z += s.vz;
        if (s.z <= 0) {
          s.z = 0;
          if (s.vz < -1.2) { s.vz *= -0.45; s.vx *= 0.6; s.vy *= 0.6; sfx('land'); } else { s.vz = 0; s.vx *= 0.85; s.vy *= 0.85; s.landed = true; }
        }
        if (--s.fuse <= 0) { explode(s.x, s.y, s.owner, { r: 36, dmg: 20, weapon: 'grenade' }); G.shots.splice(i, 1); }
        continue;
      }
      if (s.type === 'snipe') {
        const f = s.from;
        if (!f || !f.alive || !f.perch || f.hp <= 0) { G.shots.splice(i, 1); continue; }
        if (--s.fuse <= 0) {
          sfx('gun'); G.fx.push({ type: 'muzzle', x: f.x + f.face * 20, y: f.y, z: f.z + 24, t: 0, life: 5 });
          spark(s.x, s.y, 4, true); dust(s.x, s.y);
          for (const t of G.actors) if (t.team === 'player' && hittable(t) && t.z < 20 && Math.abs(t.x - s.x) < 13 && Math.abs(t.y - s.y) < 9) hurt(t, Math.round(14 * (f.dmgMul || 1)), t.x >= f.x ? 1 : -1, true, null);
          G.shots.splice(i, 1);
        }
        continue;
      }
      if (s.type === 'rock') {
        s.vz -= GRAV; s.z += s.vz;
        if (s.z <= 0) {
          sfx('crash'); G.shake = 4; dust(s.x, s.y);
          for (let k = 0; k < 6; k++) G.fx.push({ type: 'debris', x: s.x, y: s.y, z: 4, vx: rnd(-2, 2), vz: rnd(1, 3), t: 0, life: 40, col: '#8a8478' });
          for (const t of G.actors) if (hittable(t) && !isBoss(t) && t.kind !== 'ptera' && t.z < 20 && Math.abs(t.x - s.x) < 14 + t.rad * 0.5 && Math.abs(t.y - s.y) < 10) hurt(t, 10, t.x >= s.x ? 1 : -1, true, null, { unblock: true });
          G.shots.splice(i, 1);
        }
        continue;
      }
      if (s.type === 'bottle') s.vx += (G.wind || 0) * 0.6;
      s.x += s.vx;
      if (s.x < G.camX - 40 || s.x > G.camX + W + 40 || s.t > s.life) { if (s.type === 'bottle') glass(s.x, s.y, s.z); G.shots.splice(i, 1); continue; }
      if (s.owner) {
        let hitAny = false;
        for (const t of G.actors) {
          if (!hostile(s.owner, t) || !hittable(t)) continue;
          if (Math.abs(t.x - s.x) > 10 + t.rad * 0.5 || Math.abs(t.y - s.y) > 10 + (t.depthR || 0) || t.z > 30) continue;
          hurt(t, s.dmg, Math.sign(s.vx) || 1, s.knock, s.owner); spark(t.x, t.y, hitY(t), true); sfx(s.type === 'bottle' ? 'crash' : 'hit'); if (s.type === 'bottle') glass(s.x, t.y, hitY(t)); G.hitstop = 4; hitAny = true; break;
        }
        if (hitAny) G.shots.splice(i, 1);
        continue;
      }
      for (const t of G.actors) {
        if (t.team !== 'player' || !hittable(t)) continue;
        if (Math.abs(t.x - s.x) > 10 || Math.abs(t.y - s.y) > 8) continue;
        if (s.type === 'wave' ? t.z > 8 : Math.abs(t.z + 22 * scaleOf(t) - s.z) > 16) continue;
        // pocisk z przodu zatrzymany gardą
        if (tryBlock(t, s.dmg || 6, s.knock, { x: s.x - (s.vx || 0) * 20, team: 'enemy', proj: true }, {})) { G.shots.splice(i, 1); break; }
        if (s.type === 'net') { netPlayer(t); G.shots.splice(i, 1); break; }
        hurt(t, s.dmg, Math.sign(s.vx) || 1, s.knock, null);
        spark(s.x, t.y, s.z || 20, s.knock); sfx('hit'); G.hitstop = 4;
        if (!s.pierce) { G.shots.splice(i, 1); break; }
      }
    }
  }

  function netPlayer(t) {
    if (t.mount) dismount(t, false);
    if (t.carry) dropCarry(t);
    if (t.grabbing) { release(t.grabbing); t.grabbing = null; }
    setState(t, 'netted'); t.netT = 130; t.vx = 0; sfx('grab');
    G.popups.push({ x: t.x, y: t.y - 60, txt: 'SIEĆ! WCISKAJ PRZYCISKI', t: 0, col: '#ffe080' });
  }

