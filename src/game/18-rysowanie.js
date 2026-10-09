  // =============================================================== RYSOWANIE ŚWIATA
  function poseOf(a) {
    const T = a.animT;
    switch (a.state) {
      case 'idle': return a.victory ? P.victory[0] : P.idle[Math.floor(G.frame / 28) % 2];
      case 'walk': case 'enter':
        if (a.kind === 'player' && a.running) return P.run[Math.floor(T / 5) % 4];
        return P.walk[Math.floor(T / 7) % 4];
      case 'attack': return (a.t < a.move.start && a.move.wind) ? P[a.move.wind][0] : P[a.move.pose][0];
      case 'jump': return a.jumpAtk ? P.jumpkick[0] : P.jump[0];
      case 'drop': case 'flip': return P.jump[0];
      case 'land': case 'getup': case 'pickup': case 'recover': return P.crouch[0];
      case 'dash': return P.dash[0];
      case 'block': return P.guard[0];
      case 'super':
        if (a.key === 'bursztyn') return a.t % 14 < 7 ? P.hammerUp[0] : P.hammerDown[0];
        if (a.key === 'kruk') return a.t % 6 < 3 ? P.lob[0] : P.throw[0];
        if (a.key === 'nina') return P.jumpkick[0];
        if (a.key === 'tur') return a.slammed ? P.hammerDown[0] : P.hammerUp[0];
        return P.spin[Math.floor(a.t / 3) % 2];
      case 'special':
        if (a.key === 'bursztyn') return P.stab[0];
        if (a.key === 'nina') return P.jumpkick[0];
        if (a.key === 'tur') return a.slammed ? P.hammerDown[0] : P.hammerUp[0];
        return P.spin[Math.floor(a.t / 4) % 2];
      case 'cmd':
        if (a.key === 'kruk' || a.key === 'padlin' || a.key === 'zmijka') return a.t < 8 ? P.lob[0] : P.throw[0];
        if (a.key === 'nina') return P.dash[0];
        if (a.key === 'bursztyn') return P.hammerDown[0];
        return P.charge[0];
      case 'airthrow': return P.throw[0];
      case 'teamthrow': return P.throw[0];
      case 'teamfly': return P.jumpkick[0];
      case 'rage': return P.taunt[0];
      case 'rampage': return P.spin[Math.floor(a.animT / 3) % 2];
      case 'rampwait': return P.charge[0];
      case 'winded': return P.bow[0];
      case 'suplex': return a.t < 14 ? P.throw[0] : P.crouch[0];
      case 'shoot': case 'aim': case 'aimH': case 'snipeAim': return P.aim[0];
      case 'throwNet': return a.t < 10 ? P.lob[0] : P.throw[0];
      case 'flame': return P.aim[0];
      case 'hopin': return P.jump[0];
      case 'lift': return a.t < 6 ? P.crouch[0] : P.hammerUp[0];
      case 'carry': return P.hammerUp[0];
      case 'heave': return a.t < 6 ? P.hammerUp[0] : P.throw[0];
      case 'netted': return P.bow[0];
      case 'toss': return a.t < 8 ? P.lob[0] : P.throw[0];
      case 'grab': return P.grab[0];
      case 'knee': return a.t < 8 ? P.knee[0] : P.grab[0];
      case 'throw': return a.t < 6 ? P.grab[0] : P.throw[0];
      case 'lob': case 'throwKnife': case 'throwKnives': return a.t < 10 ? P.lob[0] : P.throw[0];
      case 'cast': return a.t < 18 ? P.hammerUp[0] : P.hammerDown[0];
      case 'hurt': return a.hurtCount % 2 ? P.hurt2[0] : P.hurt[0];
      case 'stun': return P.bow[0];
      case 'grabbed': return P.hurt2[0];
      case 'fall': case 'thrown': return P.fall[0];
      case 'down': case 'dead': return P.down[0];
      case 'dashkick': return a.t < 10 ? P.crouch[0] : P.jumpkick[0];
      case 'charge': return a.t < 26 || (a.kind === 'boss' && a.t < 30) ? P.crouch[0] : (a.kind === 'boss' ? P.charge[0] : P.belly[0]);
      case 'slam': return P.hammerUp[0];
      case 'intro': return a.t < 40 ? P.taunt[0] : (a.def.ai === 'hammer' ? P.hammerUp[0] : P.victory[0]);
      default: return P.idle[0];
    }
  }

  function drawActor(a) {
    if (a.alpha === 0) return;
    if (a.state === 'dead' && G.frame % 4 < 2) return;
    if (a.invuln > 0 && a.kind === 'player' && a.state !== 'special' && G.frame % 4 < 2) return;
    const sx = a.x - G.camX, sy = a.y - a.z;
    const flash = a.flash > 0 && a.flash % 2 === 0;
    if (a.kind === 'ptera') {
      const st = a.state === 'swoop' ? 'swoop' : ['fall', 'down', 'dead', 'thrown'].includes(a.state) ? 'down' : 'fly';
      SP.drawPtera(ctx, sx, sy, a.face, a.animT, st, { flash });
      return;
    }
    if (a.kind === 'raptor' || a.kind === 'rex') {
      const biteOn = a.kind === 'rex' ? (a.state === 'attack' && a.t > a.move.start - 4) : (a.t > 5 && a.t < 16);
      const map = { idle: 'idle', walk: 'walk', run: 'run', enter: a.kind === 'rex' ? 'walk' : 'run', bite: biteOn ? 'bite' : 'idle', attack: biteOn ? 'bite' : 'hurt',
        hurt: 'hurt', fall: 'down', thrown: 'down', down: 'down', dead: 'down', getup: 'idle', roar: 'roar', charge: a.t < 34 ? 'roar' : 'run', dazed: 'hurt', tail: 'hurt' };
      let face = a.face;
      if (a.state === 'tail' && a.t >= 14 && a.t < 24) face = -face;
      map.tamed = 'idle'; map.flee = 'run'; map.hopin = 'run';
      SP.drawRaptor(ctx, sx, sy, face, a.animT, map[a.state] || 'idle', a.cols, a.kind === 'rex' ? { flash, scale: 2.3, rex: true } : { flash });
      if (a.rider) {
        const bob = ['walk', 'run', 'enter'].includes(a.state) ? Math.abs(Math.sin(a.animT * 0.25)) * 2 : 0;
        SP.drawFigure(ctx, a.rider, SEAT, sx - a.face, sy - 25 - bob, a.face, { flash, weapon: map[a.state] === 'bite' ? null : 'knife' });
      }
      if (a.state === 'tamed') drawStars(sx + a.face * 18, sy - 44);
      if (a.state === 'dazed') drawStars(sx + a.face * 40, sy - 70);
      return;
    }
    if (a.kind === 'trike' || a.kind === 'para') {
      const map = { idle: 'idle', walk: 'walk', run: 'run', enter: 'walk', roar: a.kind === 'para' ? 'roar' : 'idle', windup: 'windup', charge: 'charge', recover: 'idle', bite: 'idle',
        hurt: 'idle', fall: 'down', thrown: 'down', down: 'down', dead: 'down', getup: 'idle', tamed: 'idle', flee: 'run' };
      (a.kind === 'trike' ? SP.drawTrike : SP.drawPara)(ctx, sx, sy, a.face, a.animT, map[a.state] || 'idle', a.cols, { flash });
      if (a.state === 'tamed') drawStars(sx + a.face * 20, sy - 50);
      return;
    }
    if (a.kind === 'pachy') {
      const map = { idle: 'idle', walk: 'walk', enter: 'walk', roar: 'idle', windup: 'windup', charge: 'charge', recover: 'idle', hurt: 'idle', fall: 'down', thrown: 'down', down: 'down', dead: 'down', getup: 'idle', tamed: 'idle', flee: 'run' };
      SP.drawPachy(ctx, sx, sy, a.face, a.animT, map[a.state] || 'idle', a.cols, { flash });
      if (a.state === 'tamed') drawStars(sx + a.face * 20, sy - 44);
      return;
    }
    if (a.kind === 'player' && a.mount) { drawRider(a, sx, sy, flash); return; }
    if (a.kind === 'digger') { drawDigger(a, sx, sy, flash); return; }
    if (a.kind === 'glider') { drawGlider(a, sx, sy, flash); return; }
    const pose = poseOf(a);
    let face = a.face;
    if (a.state === 'special' && Math.floor(a.t / 4) % 2 && (a.key === 'kruk' || a.key === 'borys')) face = -face;
    if (a.state === 'super' && a.key === 'borys' && Math.floor(a.t / 3) % 2) face = -face;
    const opt = { flash, hurtFace: ['hurt', 'grabbed', 'fall', 'down', 'stun'].includes(a.state) };
    if (a.airHeld) opt.rot = Math.PI * a.face;
    if (a.state === 'special' && a.key === 'nina') opt.rot = -a.t * 0.42 * a.face;
    if (a.state === 'thrown') opt.rot = a.t * 0.35;
    if (a.state === 'flip') opt.rot = -a.t * 0.4 * a.face;
    const wpn = a.weapon || (a.def && a.def.innate);
    if (wpn && !['down', 'dead', 'fall', 'thrown'].includes(a.state)) {
      opt.weapon = wpn;
      if ((a.weapon || (a.def && a.def.innate)) === 'whip' && a.state === 'attack' && a.move.whip && a.t >= a.move.start && a.t < a.move.start + a.move.active + 4) opt.weapon = 'whipOut';
      if (a.weapon === 'dynamite' && a.state === 'lob' && a.t >= 14) opt.weapon = null;
      if (a.state === 'toss' && a.t >= 8) opt.weapon = null;
    }
    let jitter = 0;
    if (isBoss(a) && a.armor && G.frame % 4 < 2) jitter = 1;
    if (a.perch) drawPerch(sx, a.y, a.z);
    if (a.alpha < 1) ctx.globalAlpha = Math.max(0, a.alpha);
    SP.drawFigure(ctx, a.b, pose, sx + jitter, sy, face, opt);
    drawFlame(a, sx, sy);
    drawCarried(a, sx, sy);
    // garda: półprzezroczysta tarcza przed postacią i pasek wytrzymałości gardy
    if (a.kind === 'player' && (a.state === 'block' || (a.guard !== undefined && a.guard < 99))) {
      const gx = sx + a.face * 13 * scaleOf(a), gy = sy - 26 * scaleOf(a), k = a.blockFlash > 0 ? 1 : 0.55;
      if (a.state === 'block') {
        ctx.strokeStyle = `rgba(128,240,255,${0.5 * k + 0.15 * Math.sin(G.frame * 0.3)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(gx, gy, 5, 16 * scaleOf(a), 0, a.face > 0 ? -Math.PI / 2 : Math.PI / 2, a.face > 0 ? Math.PI / 2 : Math.PI * 1.5); ctx.stroke();
      }
      const g = Math.max(0, a.guard) / 100, bw = 22;
      ctx.fillStyle = '#000'; ctx.fillRect(sx - bw / 2 - 1, sy + 4, bw + 2, 3);
      ctx.fillStyle = g > 0.4 ? '#80f0ff' : (G.frame % 10 < 5 ? '#ff6040' : '#ffb040'); ctx.fillRect(sx - bw / 2, sy + 5, bw * g, 1);
    }
    ctx.globalAlpha = 1;
    if (a.kind === 'player') drawPlayerMark(a, sx, sy - 66 * scaleOf(a));
    if (a.state === 'netted') SP.drawNetOver(ctx, sx, sy, 52 * scaleOf(a));
    // celownik laserowy
    if ((a.state === 'aim' && a.t < 40) || (a.state === 'aimH' && a.t < 34)) {
      if (G.frame % 4 < 3) {
        const gy = sy - 24 * scaleOf(a);
        ctx.strokeStyle = 'rgba(255,40,40,0.75)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx + a.face * 26 * scaleOf(a), gy); ctx.lineTo(a.face > 0 ? W : 0, gy); ctx.stroke();
      }
    }
    if (isBoss(a) && a.armor && a.state === 'attack') {
      ctx.strokeStyle = G.frame % 4 < 2 ? '#9ff' : '#ff6'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) ctx.lineTo(sx + rnd(-20, 20) - a.face * 14, sy - 70 + rnd(-12, 12));
      ctx.stroke();
    }
    if (a.def && a.def.ai === 'baron' && a.hp < a.maxHp * 0.5 && a.alpha > 0.5) {
      ctx.strokeStyle = `rgba(255,190,60,${0.4 + Math.sin(G.frame * 0.3) * 0.3})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(sx, sy - 34, 20, 40, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (a.state === 'stun') drawStars(sx, sy - 52 * scaleOf(a));
  }
  // znacznik 1P/2P nad głową (tylko w grze dwuosobowej)
  function drawPlayerMark(a, x, y) {
    if (G.players.length < 2 || !a.alive) return;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(x - 4, y - 1); ctx.lineTo(x + 4, y - 1); ctx.lineTo(x, y + 5); ctx.fill();
    ctx.fillStyle = P_COLS[a.pIdx]; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.lineTo(x, y + 4); ctx.fill();
  }
  // jeździec na dinozaurze
  const SEAT = Object.assign({}, P.idle[0], { air: 0, lean: 14, fa: [70, 60], ba: [55, 70], fl: [75, 110], bl: [60, 110] });
  function drawRider(a, sx, sy, flash) {
    const m = a.mount, raptor = m.type === 'raptor', R = RIDE[m.type];
    const moving = a.state === 'walk' || a.state === 'rideJump' || (a.state === 'rideAtk' && !raptor);
    let st = moving ? (raptor || m.type === 'para' ? 'run' : 'walk') : 'idle';
    if (a.state === 'rideAtk') st = raptor ? (a.t > 4 && a.t < 14 ? 'bite' : 'idle') : m.type === 'para' ? (a.rideRoar ? 'roar' : 'idle') : R.fly ? 'swoop' : 'charge';
    const opt = { flash: flash || (m.t < 120 && G.frame % 8 < 4) };
    if (m.type === 'jeep') {
      SP.drawJeep(ctx, sx, sy, a.face, a.animT, { moving: a.state === 'walk', nitro: m.nitro > 0, flash: opt.flash });
      SP.drawFigure(ctx, a.b, SEAT, sx - a.face * 2, sy - R.seat, a.face, { flash });
      drawPlayerMark(a, sx, sy - R.seat - 62 * scaleOf(a));
      return;
    }
    if (m.type === 'cart') {
      SP.drawFigure(ctx, a.b, P.idle[0], sx, sy - R.seat, a.face, { flash });
      window.Scenery.minecart(ctx, sx, sy);
      drawPlayerMark(a, sx, sy - R.seat - 66 * scaleOf(a));
      return;
    }
    if (raptor) SP.drawRaptor(ctx, sx, sy, a.face, a.animT, st, m.cols, opt);
    else if (m.type === 'pachy') SP.drawPachy(ctx, sx, sy, a.face, a.animT, st, m.cols, opt);
    else if (m.type === 'trike') SP.drawTrike(ctx, sx, sy, a.face, a.animT, st, m.cols, opt);
    else if (m.type === 'para') SP.drawPara(ctx, sx, sy, a.face, a.animT, st, m.cols, opt);
    else SP.drawPtera(ctx, sx, sy, a.face, a.animT, st === 'swoop' ? 'swoop' : 'fly', opt);
    const bob = moving && !R.fly ? Math.abs(Math.sin(a.animT * (raptor ? 0.25 : 0.2))) * 2 : 0;
    const seatX = sx - a.face * (raptor ? 1 : 2), seatY = sy - R.seat - bob;
    SP.drawFigure(ctx, a.b, SEAT, seatX, seatY, a.face, { flash });
    drawPlayerMark(a, sx, seatY - 62 * scaleOf(a));
  }
  // rusztowanie snajpera
  function drawPerch(sx, y, z) {
    const top = y - z;
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - 15, top, 4, z); ctx.fillRect(sx + 11, top, 4, z);
    ctx.fillStyle = '#8b6238'; ctx.fillRect(sx - 14, top, 2, z); ctx.fillRect(sx + 12, top, 2, z);
    ctx.strokeStyle = '#6b4a2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx - 13, y); ctx.lineTo(sx + 13, top + 4); ctx.moveTo(sx + 13, y); ctx.lineTo(sx - 13, top + 4); ctx.stroke();
    ctx.fillStyle = '#140c10'; ctx.fillRect(sx - 18, top - 1, 36, 5);
    ctx.fillStyle = '#9b7040'; ctx.fillRect(sx - 17, top, 34, 3);
  }
  function drawSnipe(s) {
    const x = s.x - G.camX, y = s.y, f = s.from, r = 4 + s.fuse * 0.25;
    if (f) {
      ctx.strokeStyle = 'rgba(255,40,40,0.45)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(f.x - G.camX + f.face * 24, f.y - f.z - 24); ctx.lineTo(x, y - 6); ctx.stroke();
    }
    ctx.strokeStyle = G.frame % 6 < 3 ? '#ff3030' : '#ffa0a0'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.6, r * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - r * 2, y); ctx.lineTo(x + r * 2, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
  }
  function drawStars(x, y) {
    for (let i = 0; i < 3; i++) {
      const a = (G ? G.frame : app.frame || 0) * 0.12 + i * 2.1;
      ctx.fillStyle = '#ffe040'; ctx.fillRect(Math.round(x + Math.cos(a) * 10) - 1, Math.round(y + Math.sin(a) * 3) - 1, 3, 3);
    }
  }

  function drawWorld() {
    const sh = G.shake > 0 ? Math.round(rnd(-2, 2)) : 0;
    ctx.save(); ctx.translate(0, sh);
    ST.drawBack(ctx, layers, G.camX, G.frame);
    if (app.ngpRun && !G.special) drawNgpTint(true);
    if (G.wx) drawWeatherBack(G.wx);
    drawEventsBack();
    drawFires();
    const ents = [];
    G.actors.forEach(a => ents.push({ y: a.y, a }));
    G.props.forEach(pr => { if (pr.hp > 0) ents.push({ y: pr.y, pr }); });
    G.items.forEach(it => ents.push({ y: it.y - 0.5, it }));
    G.shots.forEach(s => ents.push({ y: s.y + 0.1, s }));
    (G.carts || []).forEach(c => ents.push({ y: c.y, cart: c }));
    (G.vehicles || []).forEach(v => { if (!v.taken) ents.push({ y: v.y, veh: v }); });
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    for (const e of ents) {
      if (e.cart) { ctx.beginPath(); ctx.ellipse(e.cart.x - G.camX, e.cart.y, 16, 3, 0, 0, Math.PI * 2); ctx.fill(); continue; }
      if (e.veh) { ctx.beginPath(); ctx.ellipse(e.veh.x - G.camX, e.veh.y, e.veh.type === 'jeep' ? 28 : 16, 3, 0, 0, Math.PI * 2); ctx.fill(); continue; }
      const o = e.a || e.pr || e.it || e.s;
      let w = 10;
      if (e.a) w = (e.a.kind === 'rex' ? 56 : e.a.kind === 'trike' ? 30 : e.a.kind === 'para' ? 22 : e.a.kind === 'raptor' ? 22 : e.a.kind === 'pachy' ? 24 : 11 * scaleOf(e.a)) * (1 - Math.min(0.5, (o.z || 0) / 120));
      else if (e.s) w = 5;
      if (e.a && e.a.alpha < 0.5) continue;
      if (e.a && e.a.kind === 'ptera') w = 14;
      if (e.pr && e.pr.kind === 'wall') w = 22;
      if (e.s && e.s.type === 'snipe') continue;
      if (e.s && e.s.type === 'rock') w = 4 + Math.max(0, 8 - e.s.z / 10);
      ctx.beginPath(); ctx.ellipse(o.x - G.camX, o.y, w, 3, 0, 0, Math.PI * 2); ctx.fill();
    }
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) {
      if (e.a) drawActor(e.a);
      else if (e.pr) SP.drawBarrel(ctx, e.pr.x - G.camX + (e.pr.shake ? (e.pr.shake % 2 ? 1 : -1) : 0), e.pr.y, e.pr.hp, e.pr.kind);
      else if (e.s && e.s.type === 'snipe') drawSnipe(e.s);
      else if (e.s && e.s.type === 'prop') SP.drawBarrel(ctx, e.s.x - G.camX, e.s.y - e.s.z + 12, 2, e.s.kind);
      else if (e.s) SP.drawShot(ctx, e.s, e.s.x - G.camX, e.s.y - e.s.z - (e.s.type === 'dynamite' ? 3 : 0), e.s.t);
      else if (e.cart) window.Scenery.minecart(ctx, e.cart.x - G.camX, e.cart.y);
      else if (e.veh) { if (e.veh.type === 'jeep') SP.drawJeep(ctx, e.veh.x - G.camX, e.veh.y, -1, 0, { wreck: e.veh.used }); else window.Scenery.minecart(ctx, e.veh.x - G.camX, e.veh.y); }
      else {
        const it = e.it;
        if (it.t > 600 && G.frame % 6 < 3 && isWeaponItem(it.type)) continue;
        SP.drawItem(ctx, it.type, it.x - G.camX, it.y - it.z, G.frame);
      }
    }
    for (const f of G.fx) {
      const fx = f.x - G.camX, fy = f.y - f.z, k = f.t / f.life;
      if (f.type === 'spark') SP.drawSpark(ctx, fx, fy, k, f.big);
      else if (f.type === 'dust') SP.drawDust(ctx, fx, fy, k);
      else if (f.type === 'debris') { ctx.fillStyle = f.col; ctx.fillRect(fx - 1.5, fy - 1.5, 3, 3); }
      else if (f.type === 'tracer') { ctx.strokeStyle = `rgba(255,240,150,${1 - k})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(f.x2 - G.camX, fy); ctx.stroke(); }
      else if (f.type === 'muzzle') SP.drawSpark(ctx, fx, fy, k * 0.6, false);
      else if (f.type === 'ghost') { ctx.globalAlpha = 0.4 * (1 - k); SP.drawFigure(ctx, f.b, P.jumpkick[0], fx, fy, f.face, {}); ctx.globalAlpha = 1; }
      else if (f.type === 'baby') SP.drawRaptor(ctx, fx, fy, f.dir, f.t, 'run', { body: '#7aaa4a', belly: '#e0e0b0', stripe: '#4a7a2a' }, { scale: 0.55 });
      else if (f.type === 'boom') {
        const r = 10 + k * 26;
        ctx.fillStyle = `rgba(255,${200 - k * 150},60,${1 - k})`; ctx.beginPath(); ctx.arc(fx, fy - 12 - k * 10, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,200,${Math.max(0, 1 - k * 2)})`; ctx.beginPath(); ctx.arc(fx, fy - 12, r * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(60,50,50,${0.6 * k})`; ctx.beginPath(); ctx.arc(fx + 4, fy - 24 - k * 20, r * 0.7, 0, Math.PI * 2); ctx.fill();
      }
      else if (f.type === 'shock') {
        ctx.strokeStyle = `rgba(255,230,160,${1 - k})`; ctx.lineWidth = 3 * (1 - k) + 1;
        ctx.beginPath(); ctx.ellipse(fx, f.y, f.r * k + 6, (f.r * k + 6) * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ST.drawFront(ctx, layers, G.camX, G.frame);
    if (G.special === 'escape' && G.esc) {
      const lx = G.esc.lava - G.camX + 16;
      const g = ctx.createLinearGradient(lx - 40, 0, lx + 12, 0);
      g.addColorStop(0, '#ff5a14'); g.addColorStop(0.7, '#ffb030'); g.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, lx + 12, H);
      ctx.fillStyle = '#ffe080';
      for (let y = 0; y < H; y += 6) ctx.fillRect(lx - 6 + Math.sin(y * 0.2 + G.frame * 0.2) * 4, y, 4, 3);
    }
    if (app.ngpRun && !G.special) drawNgpTint(false);
    if (G.wx) drawWeatherFront(G.wx);
    drawEventsFront();
    if (G.fog > 0.02) drawFog();
    if (G.superFreeze > 0 && G.superWho) {
      const k = Math.min(1, (50 - G.superFreeze) / 8);
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = P_COLS[G.superWho.pIdx]; ctx.fillRect(0, 76, W * k, 52);
      ctx.fillStyle = '#140c10'; ctx.fillRect(0, 80, W * k, 44);
      ctx.save(); ctx.beginPath(); ctx.rect(20, 80, 60, 44); ctx.clip();
      SP.drawPortrait(ctx, G.superWho.b, 50, 110, 18, false); ctx.restore();
      if (G.superWho2) {
        ctx.fillStyle = P_COLS[G.superWho2.pIdx]; ctx.fillRect(W - 84, 76, 64, 4);
        ctx.save(); ctx.beginPath(); ctx.rect(W - 80, 80, 60, 44); ctx.clip();
        SP.drawPortrait(ctx, G.superWho2.b, W - 50, 110, 18, false); ctx.restore();
      }
    }
    if (G.flash > 0) { ctx.fillStyle = `rgba(220,220,255,${G.flash / 14})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }

