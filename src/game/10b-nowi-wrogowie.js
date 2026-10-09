  // =============================================================== NOWI WROGOWIE I INTERAKCJE
  // Jeździec na raptorze, podpalacz (płonąca podłoga), lotniarz (zrzuca sieci), koparka Brygadzisty,
  // wrzucanie wrogów w zagrożenia oraz podnoszenie i rzucanie beczkami.

  // ---- jeździec: po przewróceniu spada z siodła, a raptor od razu nadaje się do dosiadania
  function ejectRider(r, src) {
    if (!r.rider) return;
    const g = makeEnemy('grunt', r.x - r.face * 8, r.y);
    g.b = r.rider; r.rider = null;
    setState(g, 'fall'); g.z = 18; g.vz = 3; g.vx = -r.face * 1.6; g.bounced = false; g.face = r.face;
    G.actors.push(g);
    r.team = 'beast'; r.tame = true; r.hp = 0;
    onDeath(r, src);
    G.popups.push({ x: r.x, y: r.y - 50, txt: 'ZRZUCONY Z SIODŁA!', t: 0, col: '#ffe080' });
    sfx('screech');
  }

  // ---- ogień podpalacza: płonące plamy ranią każdego (graczy i wrogów), kto w nie wejdzie
  function addFire(x, y) {
    const F = G.fires = G.fires || [];
    if (F.some(f => Math.abs(f.x - x) < 10 && Math.abs(f.y - y) < 6)) return;
    F.push({ x, y: clamp(y, FLOOR_TOP + 8, FLOOR_BOTTOM), t: 0, life: 260 });
  }
  function updateFires() {
    const F = G.fires; if (!F) return;
    for (let i = F.length - 1; i >= 0; i--) {
      const f = F[i];
      if (++f.t > f.life) { F.splice(i, 1); continue; }
      for (const a of G.actors) {
        if (!a.alive || a.z > 4 || isBoss(a) || !hittable(a) || (a.fireT || 0) > G.frame) continue;
        if (Math.abs(a.x - f.x) < 12 && Math.abs(a.y - f.y) < 7) {
          a.fireT = G.frame + 45; hurt(a, 6, Math.random() < 0.5 ? 1 : -1, false, null, { unblock: true });
          if (a.kind === 'player') G.popups.push({ x: a.x, y: a.y - 46, txt: 'GORĄCO!', t: 0, col: '#ff9040' });
        }
      }
    }
  }
  function drawFires() {
    for (const f of G.fires || []) {
      const x = f.x - G.camX, k = 1 - f.t / f.life, s = Math.min(1, f.t / 12) * (0.6 + 0.4 * k);
      if (x < -20 || x > W + 20) continue;
      ctx.fillStyle = 'rgba(40,10,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, f.y, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
      for (let j = 0; j < 4; j++) {
        const p = (G.frame * 0.06 + j / 4 + f.x * 0.01) % 1, fx = x - 8 + j * 5 + Math.sin(G.frame * 0.3 + j) * 1.5;
        ctx.fillStyle = p < 0.4 ? 'rgba(255,230,120,0.9)' : p < 0.7 ? 'rgba(255,140,40,0.8)' : 'rgba(200,50,20,0.6)';
        ctx.beginPath(); ctx.arc(fx, f.y - 2 - p * 14 * s, (4 * (1 - p) + 1) * s, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // ---- lotniarz: przelatuje wysoko i zrzuca sieć nad graczem; po trzech przelotach ląduje i walczy wręcz
  function updateGlider(g) {
    g.t++; g.animT++;
    if (g.state === 'hurt' && g.z > 4) { setState(g, 'fall'); g.vz = 1; g.vx = 0; g.bounced = false; }   // trafiony w powietrzu spada
    if (g.state === 'fall' || g.state === 'thrown') g.fell = true;
    if (updateCommon(g)) return;
    if (g.fell || g.pass >= 3) { g.kind = 'human'; g.z = 0; setState(g, 'idle'); return; }   // dalej zwykła AI ludzi
    if (g.state === 'enter') { setState(g, 'glide'); g.pass = 0; g.z = 64; g.face = g.x < G.camX + W / 2 ? 1 : -1; }
    const alt = [64, 46, 30][Math.min(g.pass, 2)];
    g.x += g.face * 1.9; g.z += (alt - g.z) * 0.05;
    const tp = nearestPlayer(g);
    if (tp) {
      g.y += clamp(tp.y - g.y, -0.5, 0.5);
      if (!g.dropped && Math.abs(tp.x - g.x) < 10 && tp.state !== 'netted') {
        g.dropped = true; sfx('whoosh');
        shoot({ type: 'netdrop', x: g.x, y: tp.y, z: g.z, life: 200 });
      }
    }
    if ((g.face > 0 && g.x > G.camX + W + 30) || (g.face < 0 && g.x < G.camX - 30)) {
      g.pass++; g.face = -g.face; g.dropped = false;
      if (g.pass >= 3) { g.x = clamp(g.x, G.camX + 20, G.camX + W - 20); setState(g, 'fall'); g.vz = 0.5; g.vx = g.face; g.bounced = true; g.hop = true; }
    }
  }
  function drawGlider(a, sx, sy, flash) {
    SP.drawFigure(ctx, a.b, a.state === 'glide' ? P.hammerUp[0] : poseOf(a), sx, sy, a.face, { flash, hurtFace: a.state !== 'glide' });
    if (a.state !== 'glide') return;
    const top = sy - 62 * scaleOf(a);
    ctx.fillStyle = '#140c10';
    ctx.beginPath(); ctx.moveTo(sx - 34, top + 6); ctx.lineTo(sx + a.face * 30, top - 6); ctx.lineTo(sx + 34, top + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#c8402a';
    ctx.beginPath(); ctx.moveTo(sx - 31, top + 4); ctx.lineTo(sx + a.face * 28, top - 4); ctx.lineTo(sx + 31, top + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0d040'; ctx.beginPath(); ctx.moveTo(sx - 12, top + 4); ctx.lineTo(sx + a.face * 10, top - 1); ctx.lineTo(sx + 12, top + 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5a5050'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx - 20, top + 6); ctx.lineTo(sx, sy - 42); ctx.lineTo(sx + 20, top + 6); ctx.stroke();
  }

  // ---- koparka Brygadzisty: zamach łyżką z góry (pole rażenia z przodu) i szarża z łyżką przy ziemi
  function updateDigger(d) {
    d.t++; d.cool--; d.animT++; d.z = 0;
    if (d.hp <= 0) {
      if (!d.wrecked) {
        d.wrecked = true; setState(d, 'wreck'); G.shake = 20; sfx('explode');
        for (let i = 0; i < 3; i++) G.fx.push({ type: 'boom', x: d.x + rnd(-30, 30), y: d.y, z: rnd(10, 40), t: 0, life: 24 + i * 8 });
        // Brygadzista wylatuje z kabiny (już pokonany — tylko efekt)
        const f = makeEnemy('brute', d.x, d.y + 4); f.b = d.b; f.hp = 0; f.dying = true;
        setState(f, 'fall'); f.z = 30; f.vz = 4; f.vx = -d.face * 2; f.bounced = false; G.actors.push(f);
        G.popups.push({ x: d.x, y: d.y - 90, txt: 'KOPARKA ZEZŁOMOWANA!', t: 0, col: '#ffe040' });
        unlock('scrapper');
      }
      d.state = 'wreck';
      return;
    }
    const p = nearestPlayer(d);
    switch (d.state) {
      case 'enter':
        d.face = -1; d.x -= 1.2; d.animT++;
        if (d.x < G.camX + W - 80) { setState(d, 'intro'); G.introBoss = d; sfx('charge'); G.shake = 8; }
        return;
      case 'intro': if (d.t > 80) { setState(d, 'idle'); G.introBoss = null; d.cool = 40; } return;
      case 'idle': case 'walk': {
        if (!p) return;
        const dx = p.x - d.x, dist = Math.abs(dx), ddy = Math.abs(p.y - d.y);
        d.face = dx >= 0 ? 1 : -1;
        if (d.cool <= 0) {
          if (dist < 120 && dist > 40 && ddy < 22) { setState(d, 'slam'); sfx('charge'); return; }
          if (ddy < 14) { setState(d, 'sweep'); sfx('charge'); return; }
          d.cool = 20;
        }
        stepToward(d, clamp(p.x - d.face * 85, G.camX + 50, G.camX + W - 50), p.y, d.def.speed);
        return;
      }
      case 'slam':
        if (d.t === 40) {
          const hx = d.x + d.face * 72;
          G.shake = 14; sfx('slam'); dust(hx - 10, d.y); dust(hx + 10, d.y);
          G.fx.push({ type: 'shock', x: hx, y: d.y, z: 0, t: 0, life: 22, r: 40 });
          for (const q of G.players) if (hittable(q) && q.z < 20 && Math.abs(q.x - hx) < 34 && Math.abs(q.y - d.y) < 16) hurt(q, Math.round(20 * d.dmgMul), d.face, true, d, { unblock: true });
          for (const pr of G.props) if (pr.hp > 0 && Math.abs(pr.x - hx) < 34 && Math.abs(pr.y - d.y) < 16) hitProp(pr, d.face, d);
        }
        if (d.t > 72) { setState(d, 'idle'); d.cool = rnd(60, 90); }
        return;
      case 'sweep':
        if (d.t < 24) { d.x += d.t % 4 < 2 ? 0.8 : -0.8; return; }
        d.x += d.face * 3.2; d.animT++;
        if (d.t % 5 === 0) dust(d.x - d.face * 30, d.y);
        resolveHits(d, { abs: true, reach: 58, dmg: Math.round(14 * d.dmgMul), knock: true, snd: 'heavy', shake: 6, depth: 14 });
        if (d.t > 80 || d.x < G.camX + 50 || d.x > G.camX + W - 50) { d.x = clamp(d.x, G.camX + 50, G.camX + W - 50); setState(d, 'idle'); d.cool = rnd(70, 100); }
        return;
      default: setState(d, 'idle');
    }
  }
  function drawDigger(a, sx, sy, flash) {
    const f = a.face, wreck = a.state === 'wreck';
    const body = flash ? '#fff' : wreck ? '#4a4440' : '#e0a020', dark = wreck ? '#2a2420' : '#8a5a10';
    const shake = (a.state === 'sweep' || a.state === 'walk') && a.animT % 4 < 2 ? 1 : 0;
    sy -= shake;
    // gąsienice
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - 40, sy - 16, 80, 16);
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(sx - 38, sy - 14, 76, 12);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#5a5a5a'; ctx.beginPath(); ctx.arc(sx - 30 + i * 12, sy - 8, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#222'; for (let i = 0; i < 10; i++) ctx.fillRect(sx - 38 + ((i * 8 + a.animT) % 76), sy - 15, 2, 2);
    // nadwozie i kabina z Brygadzistą
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - 34, sy - 42, 60, 28);
    ctx.fillStyle = body; ctx.fillRect(sx - 33, sy - 41, 58, 26);
    ctx.fillStyle = dark; ctx.fillRect(sx - 33, sy - 20, 58, 5);
    const cx = sx - f * 6;
    ctx.fillStyle = '#140c10'; ctx.fillRect(cx - 14, sy - 70, 28, 30);
    ctx.fillStyle = body; ctx.fillRect(cx - 13, sy - 69, 26, 28);
    ctx.fillStyle = wreck ? '#222' : '#9fd0e0'; ctx.fillRect(cx - 10, sy - 66, 20, 13);
    if (!wreck) { ctx.fillStyle = '#c89070'; ctx.beginPath(); ctx.arc(cx, sy - 58, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f0d040'; ctx.fillRect(cx - 5, sy - 64, 10, 3); }
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - f * 30 - 6, sy - 48, 12, 8); ctx.fillStyle = '#5a5a5a'; ctx.fillRect(sx - f * 30 - 5, sy - 47, 10, 6);   // przeciwwaga
    // ramię i łyżka (kąty zależne od stanu)
    let a1 = -0.75, a2 = 1.25;
    if (a.state === 'slam') { const k = a.t < 36 ? Math.min(1, a.t / 30) : Math.max(0, 1 - (a.t - 36) / 4); a1 = -0.75 - k * 0.7; a2 = 1.25 - k * 0.9; if (a.t >= 38 && a.t < 72) { a1 = -0.15; a2 = 1.6; } }
    if (a.state === 'sweep') { a1 = -0.05; a2 = 1.55; }
    if (wreck) { a1 = 0.3; a2 = 1.2; }
    const bx = sx + f * 18, by = sy - 40;
    const ex = bx + f * Math.cos(a1) * 44, ey = by + Math.sin(a1) * 44;
    const tx = ex + f * Math.cos(a1 + a2) * 34, ty = ey + Math.sin(a1 + a2) * 34;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#140c10'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.strokeStyle = body; ctx.lineWidth = 6; ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.moveTo(tx - f * 4, ty - 8); ctx.lineTo(tx + f * 16, ty - 4); ctx.lineTo(tx + f * 14, ty + 10); ctx.lineTo(tx - f * 4, ty + 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = wreck ? '#3a3a3a' : '#7a7a80'; ctx.beginPath(); ctx.moveTo(tx - f * 2, ty - 6); ctx.lineTo(tx + f * 14, ty - 3); ctx.lineTo(tx + f * 12, ty + 8); ctx.lineTo(tx - f * 2, ty + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d0d0d0'; for (let i = 0; i < 3; i++) ctx.fillRect(tx + f * (13 + 0) - 1, ty - 2 + i * 4, 3 * f, 2);
    if (wreck && G.frame % 6 < 3) { ctx.fillStyle = 'rgba(60,50,50,0.6)'; ctx.beginPath(); ctx.arc(cx + Math.sin(G.frame * 0.1) * 6, sy - 80 - (G.frame % 30), 8, 0, Math.PI * 2); ctx.fill(); }
  }

  // ---- wrzucanie wrogów w zagrożenia: lawa, ścieki, morze przy przypływie, zrzucenie z pociągu
  function ringOut(a) {
    let label = null, kind = null;
    for (const h of ST.HAZARDS || []) if (a.x > h.x0 && a.x < h.x1 && a.y > h.y0 && a.y < h.y1) { label = h.label ? 'SPŁUKANY!' : 'W LAWIE!'; kind = h.label ? 'sludge' : 'lava'; }
    if (!label && G.tideY > FLOOR_TOP + 10 && a.y < G.tideY - 2) { label = 'SPŁUKANY!'; kind = 'sea'; }
    if (!label && ST.deck && (a.y < ST.deck.y0 - 2 || a.y > ST.deck.y1 + 2)) { label = 'ZRZUCONY!'; kind = 'train'; }
    if (!label) return false;
    const by = a.lastPlayer;
    a.hp = 0; onDeath(a, by);
    if (by) addScore(by, 1000);
    G.popups.push({ x: a.x, y: a.y - 40, txt: label + ' +1000', t: 0, col: kind === 'lava' ? '#ff9040' : kind === 'train' ? '#ffe080' : '#a0ff60' });
    if (kind === 'lava') { sfx('zap'); for (let i = 0; i < 8; i++) G.fx.push({ type: 'debris', x: a.x, y: a.y, z: 4, vx: rnd(-1.5, 1.5), vz: rnd(1, 4), t: 0, life: 30, col: i % 2 ? '#ffb030' : '#ff5a14' }); }
    else if (kind === 'train') { sfx('whoosh'); G.fx.push({ type: 'dust', x: a.x, y: a.y, z: 0, t: 0, life: 22 }); }
    else { sfx('land'); for (let i = 0; i < 8; i++) G.fx.push({ type: 'debris', x: a.x, y: a.y, z: 2, vx: rnd(-1.2, 1.2), vz: rnd(1.5, 3.5), t: 0, life: 30, col: kind === 'sea' ? '#c8e0f0' : '#8ad040' }); }
    a.remove = true;
    unlock('ringout');
    return true;
  }

  // ---- beczki i skrzynie: ▼ + ATAK podnosi, ATAK/SKOK rzuca
  const CARRYABLE = ['barrel', 'crate', 'fuel'];
  function nearProp(p) {
    return G.props.find(pr => pr.hp > 0 && CARRYABLE.includes(pr.kind) && Math.abs(pr.x - p.x) < 26 && Math.abs(pr.y - p.y) < 12);
  }
  function liftProp(p, pr) {
    G.props.splice(G.props.indexOf(pr), 1);
    p.carry = { kind: pr.kind, drop: pr.drop, secret: pr.secret };
    setState(p, 'lift'); p.vx = 0; sfx('grab');
  }
  // rozbicie niesionej albo rzuconej beczki (z łupem; paliwo wybucha)
  function breakCarried(c, x, y, owner) {
    sfx('crash');
    for (let i = 0; i < 10; i++) G.fx.push({ type: 'debris', x: x + rnd(-8, 8), y, z: rnd(4, 20), vx: rnd(-2, 2), vz: rnd(1, 4), t: 0, life: 50, col: PROP_COL[c.kind] || '#8a5a2b' });
    if (c.kind === 'fuel') explode(x, y, owner, { r: 46, dmg: 24 });
    if (c.drop) G.items.push({ type: c.drop, x, y, z: 12, vz: 2.5, t: 0, ammo: c.drop === 'bottle' ? 2 : c.drop === 'rifle' ? 8 : 3, dur: 16 });
  }
  function dropCarry(p) {
    if (!p.carry) return;
    breakCarried(p.carry, p.x + p.face * 10, p.y, p);
    p.carry = null;
  }
  function updateFlyingProp(s) {
    s.x += s.vx; s.vz -= GRAV * 0.6; s.z += s.vz;
    for (const t of G.actors) {
      if (s.hit.has(t) || !hostile(s.owner, t) || !hittable(t)) continue;
      if (Math.abs(t.x - s.x) < 14 + t.rad * 0.5 && Math.abs(t.y - s.y) < 12 + (t.depthR || 0) && t.z < s.z + 24) {
        s.hit.add(t); hurt(t, 18, Math.sign(s.vx) || 1, true, s.owner, { unblock: true, throw: true });
        if (s.hit.size >= 3) unlock('bowling');
        spark(t.x, t.y, hitY(t), true); sfx('heavy'); G.hitstop = 4;
        if (s.kind === 'fuel') s.boom = true;
      }
    }
    return s.boom || s.z <= 0 || s.x < G.camX - 40 || s.x > G.camX + W + 40;
  }
  function putDown(p) {
    const c = p.carry; p.carry = null;
    G.props.push({ x: p.x + p.face * 16, y: p.y, kind: c.kind, drop: c.drop, secret: c.secret, hp: PROP_HP[c.kind] || 2, shake: 6 });
    sfx('land'); setState(p, 'idle');
  }
  function throwCarry(p) {
    const c = p.carry; if (!c) return;
    p.carry = null; sfx('throw');
    shoot({ type: 'prop', kind: c.kind, drop: c.drop, owner: p, x: p.x + p.face * 10, y: p.y, z: 44 * scaleOf(p), vx: p.face * 5.2, vz: 1.4, hit: new Set(), life: 999 });
  }
  function updateCarry(p, held, pressed, dx, dy) {
    switch (p.state) {
      case 'lift': p.vx = 0; if (p.t > 12) setState(p, 'carry'); return true;
      case 'carry': {
        if (!p.carry) { setState(p, 'idle'); return true; }
        if (pressed.attack || pressed.jump || pressed.special) { setState(p, 'heave'); return true; }
        if (pressed.block) { putDown(p); return true; }
        const sp = p.def.speed * 0.7;
        p.vx = dx * sp; p.vy = dy * sp * 0.65; if (dx) p.face = dx;
        p.x += p.vx; p.y += p.vy; if (dx || dy) p.animT++;
        return true;
      }
      case 'heave':
        if (p.t === 6) throwCarry(p);
        if (p.t > 18) setState(p, 'idle');
        return true;
    }
    return false;
  }
  // rysowanie: płomień miotacza i niesiona beczka nad głową
  function drawFlame(a, sx, sy) {
    if (a.state !== 'flame' || a.t < 16 || a.t > 70) return;
    const reach = 22 + Math.min(40, (a.t - 16) * 2), nx = sx + a.face * 16, ny = sy - 24;
    for (let i = 0; i < 14; i++) {
      const fr = G ? G.frame : app.frame || 0, k = ((fr * 0.13 + i / 14) % 1), d = k * reach;
      ctx.fillStyle = k < 0.3 ? 'rgba(255,240,160,0.9)' : k < 0.65 ? 'rgba(255,150,40,0.85)' : 'rgba(200,60,20,0.55)';
      ctx.beginPath(); ctx.arc(nx + a.face * d, ny + Math.sin(i * 2.3 + fr * 0.4) * d * 0.12 + d * 0.18, 2 + k * 5, 0, Math.PI * 2); ctx.fill();
    }
  }
  function drawCarried(a, sx, sy) {
    if (!a.carry) return;
    const lift = a.state === 'lift' ? Math.min(1, a.t / 10) : a.state === 'heave' ? (a.t < 6 ? 1 : 0) : a.state === 'carry' ? 1 : 0;
    if (!lift) return;
    const s = scaleOf(a);
    SP.drawBarrel(ctx, sx + a.face * 2, sy - (20 + 32 * lift) * s, 2, a.carry.kind);
  }
