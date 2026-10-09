  // =============================================================== HUD
  function bar(x, y, w, h, frac, lag, col) {
    ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = '#401010'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, Math.max(0, w * Math.min(1, lag)), h);
    ctx.fillStyle = col; ctx.fillRect(x, y, Math.max(0, w * frac), h);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x, y, Math.max(0, w * frac), 1);
  }
  const LAYER_COLS = ['#f0d030', '#f08a20', '#e03030', '#b040d0', '#3070f0', '#30c0a0', '#e0e0e0'];
  function layeredBar(x, y, w, h, hp, lag, per) {
    hp = Math.max(0, hp);
    const layer = Math.floor(Math.max(0, hp - 0.01) / per);
    const frac = (hp - layer * per) / per;
    ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = layer > 0 ? LAYER_COLS[(layer - 1) % LAYER_COLS.length] : '#401010'; ctx.fillRect(x, y, w, h);
    const lagFrac = clamp((lag - layer * per) / per, 0, 1);
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w * lagFrac, h);
    ctx.fillStyle = LAYER_COLS[layer % LAYER_COLS.length]; ctx.fillRect(x, y, w * frac, h);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x, y, w * frac, 1);
    return layer;
  }
  function hudEnemy() {
    if (G.special === 'training') return null;
    const e = G.lastEnemy;
    if (e && G.lastEnemyT > 0 && e.alive && isBoss(e)) return e;
    const boss = G.actors.find(a => isBoss(a) && a.alive && a.hp > 0 && a.state !== 'enter');
    if (boss) return boss;
    return e && G.lastEnemyT > 0 ? e : null;
  }
  // panel gracza: side 0 = lewy, 1 = prawy (lustrzany)
  const PANEL = [{ px: 5, bx: 30 }, { px: W - 27, bx: W - 126 }];
  function drawPlayerPanel(p, side) {
    const L = PANEL[side];
    ctx.fillStyle = P_COLS[side]; ctx.fillRect(L.px - 1, 4, 24, 24);
    const hurtNow = G.frame - (p.hurtF || -99) < 30, low = p.hp > 0 && p.hp / p.maxHp < 0.25, fury = (p.fury || 0) >= 100;
    // tło portretu: czerwone pulsowanie przy niskim życiu, płomienie przy pełnej furii
    ctx.fillStyle = low ? `rgb(${90 + Math.round(60 * Math.abs(Math.sin(G.frame * 0.12)))},26,30)` : '#2a3a5a'; ctx.fillRect(L.px + 1, 6, 20, 20);
    ctx.save(); ctx.beginPath(); ctx.rect(L.px + 1, 6, 20, 20); ctx.clip();
    if (fury) for (let i = 0; i < 6; i++) {
      const k = ((G.frame * 0.05 + i / 6) % 1);
      ctx.fillStyle = k < 0.5 ? 'rgba(255,200,60,0.8)' : 'rgba(255,90,20,0.7)';
      ctx.beginPath(); ctx.arc(L.px + 3 + i * 3.4, 26 - k * 18, 3.5 * (1 - k) + 1, 0, Math.PI * 2); ctx.fill();
    }
    const shake = hurtNow && G.frame % 4 < 2 ? (G.frame % 8 < 4 ? 1 : -1) : 0;
    SP.drawPortrait(ctx, p.b, L.px + 11 + shake, 17, 7, p.flash > 0 && p.flash % 2 === 0, { hurt: hurtNow, low, fury, t: G.frame });
    ctx.restore();
    if (fury) { ctx.strokeStyle = G.frame % 10 < 5 ? '#ffe040' : '#ff6020'; ctx.lineWidth = 1; ctx.strokeRect(L.px - 0.5, 4.5, 23, 23); }
    if (p.out) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(L.px + 1, 6, 20, 20); return; }
    const f = clamp(p.hp / p.maxHp, 0, 1);
    bar(L.bx, 17, 96, 6, f, p.lagHp / p.maxHp, f > 0.5 ? '#40e060' : (f > 0.25 ? '#f0d030' : '#f04040'));
    ctx.fillStyle = '#000'; ctx.fillRect(L.bx - 1, 24, 98, 4);
    if (p.mount) { ctx.fillStyle = '#7cff7c'; ctx.fillRect(L.bx, 25, 96 * p.mount.t / (p.mount.max || MOUNT_TIME), 2); }
    else {
      const full = p.fury >= 100;
      ctx.fillStyle = full ? (G.frame % 10 < 5 ? '#ffe040' : '#ff6020') : '#e07020'; ctx.fillRect(L.bx, 25, 96 * Math.min(1, (p.fury || 0) / 100), 2);
    }
    // bursztyn
    const ax = L.bx + 74;
    ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.moveTo(ax, 29); ctx.lineTo(ax + 3, 32); ctx.lineTo(ax, 35); ctx.lineTo(ax - 3, 32); ctx.fill();
    ctx.fillStyle = '#f0a020'; ctx.beginPath(); ctx.moveTo(ax, 30); ctx.lineTo(ax + 2, 32); ctx.lineTo(ax, 34); ctx.lineTo(ax - 2, 32); ctx.fill();
  }
  function drawHud() {
    G.players.forEach((p, i) => drawPlayerPanel(p, i));
    G.hudEnemy = hudEnemy();
    if (G.hudEnemy) G.hudLayer = layeredBar(30, 37, 96, 5, G.hudEnemy.hp, G.hudEnemy.lagHp, 100);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(W / 2 - 16, 4, 32, 18);
  }
  function drawPanelText(p, side) {
    const L = PANEL[side];
    text(p.name, L.bx, 6, 6, '#ffe080');
    text(String(p.score).padStart(7, '0'), L.bx + 96, 6, 6, '#fff', 'right');
    if (p.out) { if (G.frame % 50 < 34) text((side + 1) + 'P: START', L.bx + 48, 17, 6, P_COLS[side], 'center'); return; }
    if (p.combo >= 2 && p.comboT > 0) {
      const sz = 9 + Math.min(5, p.combo / 4) + (p.comboPulse || 0) * 0.25, col = p.combo >= 10 ? '#ff9040' : p.combo >= 5 ? '#ffe040' : '#fff';
      const cy = side === 0 ? 54 : 38, cx = side === 0 ? 8 : W - 8, al = side === 0 ? 'left' : 'right';
      text(p.combo + ' HIT!', cx, cy, sz, col, al);
      text('KOMBO', cx, cy + sz + 2, 4, '#c0c0c0', al);
    }
    text('×' + p.lives, L.bx, 29, 5, '#fff');
    text(String(p.amber || 0), L.bx + 96, 29, 5, '#f0c060', 'right');
    const wx = L.bx + 18;
    if (p.mount) text(RIDE[p.mount.type].name, wx, 30, 4, '#7cff7c');
    else if (p.fury >= 100 && G.frame % 40 < 28) text('FURIA! ATAK+SKOK', wx, 30, 4, '#ffe040');
    else if (p.weapon === 'rifle') text('STRZELBA ' + p.ammo, wx, 29, 5, '#ffd080');
    else if (p.weapon === 'dynamite') text('DYNAMIT ×' + p.ammo, wx, 29, 5, '#ff9070');
    else if (p.weapon === 'grenade') text('GRANAT ×' + p.ammo, wx, 29, 5, '#a0e070');
    else if (MELEE[p.weapon]) text(WEAPON_NAMES[p.weapon] + ' ' + p.dur, wx, 29, 5, '#c0d0e0');
  }
  function drawHudText() {
    G.players.forEach((q, i) => drawPanelText(q, i));
    if (G.players.length < 2 && G.frame % 60 < 40) {
      text('2P: NACIŚNIJ START', W - 8, 8, 5, P_COLS[1], 'right');
      text('{start:1|SHIFT / NUM ENTER}', W - 8, 16, 4, '#a0a0b0', 'right');
    }
    if (G.special === 'training' || G.special === 'survival') text('--', W / 2, 7, 10, '#c0c0c0', 'center');
    else text(String(Math.max(0, G.timer)).padStart(2, '0'), W / 2, 7, 10, G.timer < 15 && G.frame % 30 < 15 ? '#ff6060' : '#fff', 'center');
    if (G.special === 'training' && G.train) {
      const T = G.train;
      text('TRENING', W / 2, 32, 7, '#7cff7c', 'center');
      text('OSTATNI CIOS ' + T.last + '   SUMA ' + T.total + '   TRAFIENIA ' + T.hits, W / 2, 43, 4, '#fff', 'center');
      G.players.forEach((q, i) => {
        const mv = q.def.moves || [];
        text(q.name + ': ' + mv.join('   '), W / 2, 196 + i * 7, 3.5, i ? '#b0c8e0' : '#e0c0b0', 'center');
      });
      text('BLOK (TRZYMAJ): GARDA, TUŻ PRZED CIOSEM = PAROWANIE   DÓŁ+ATAK W SKOKU: RZUT W LOCIE   PAUZA: WYJŚCIE', W / 2, 210, 3.5, '#c0c0c0', 'center');
    }
    text('HI ' + String(Math.max(app.hiscore, ...G.players.map(q => q.score))).padStart(7, '0'), W / 2, 24, 4, '#80d0ff', 'center');
    if (G.rush) {
      text('BOSS RUSH ' + (app.rush.i + 1) + '/6   ' + fmtTime(app.rush.frames), W / 2, 32, 5, '#ff9a80', 'center');
      if (G.rushCard > 0) { text('BOSS ' + (app.rush.i + 1) + ' / 6', W / 2, 74, 12, '#ffe080', 'center'); text(shortName(ST), W / 2, 92, 6, '#fff', 'center'); }
    }
    if (G.special === 'escape' && !G.bossDead) {
      text('UCIEKAJ! ►  DO WYJŚCIA ' + Math.max(0, Math.round((ST.LEN - W - G.camX) / 10)) + ' M', W / 2, 32, 5, G.frame % 30 < 20 ? '#ffb030' : '#fff', 'center');
    }
    if (G.special === 'survival' && G.surv) {
      text('FALA ' + G.surv.wave, W / 2, 32, 6, '#ffe080', 'center');
      if (G.surv.state === 'rest' && G.introT <= 0) text('NASTĘPNA FALA ZA ' + Math.ceil(G.surv.t / 60), W / 2, 100, 7, '#fff', 'center');
    }
    if (G.special === 'cages') text('UWOLNIONE ' + G.freed + '/' + G.cageTotal, W / 2, 32, 6, G.freed >= G.cageTotal ? '#7cff7c' : '#ffe080', 'center');
    if (G.cartWarn && G.frame % 10 < 6) { const wx = G.cartWarn.side > 0 ? W - 20 : 20; text('!', wx, 150, 16, '#ff4040', 'center'); text('WAGONIK', wx, 172, 4, '#ff8080', 'center'); }
    if (G.superFreeze > 0 && G.superWho) {
      const q = G.superWho;
      if (G.superWho2) {
        text(q.name + ' + ' + G.superWho2.name, W / 2, 86, 6, '#fff', 'center');
        text('SUPER DRUŻYNOWY!', W / 2, 98, 11, '#ffe040', 'center');
      } else {
        text(q.name, 90, 86, 6, P_COLS[q.pIdx]);
        text(SUPER_NAMES[q.key] + '!', 90, 98, 11, '#ffe040');
      }
    }
    if (G.hint && G.hint.t > 0) {
      sctx.fillStyle = 'rgba(10,8,20,0.82)'; sctx.fillRect(20 * S, 192 * S, (W - 40) * S, 22 * S);
      text('OPIEKUN', W / 2, 195, 4, '#80f0ff', 'center');
      text(G.hint.txt, W / 2, 203, 4.5, '#fff', 'center');
    }
    // podpowiedź przy oswojonej bestii
    for (const a of G.actors) if (a.state === 'tamed' && G.frame % 40 < 28) text('{attack|ATAK} — DOSIĄDŹ!', a.x - G.camX, a.y - 58, 4, '#7cff7c', 'center');
    for (const v of (G.vehicles || [])) if (!v.used && G.frame % 40 < 28) text(v.type === 'jeep' ? 'ATAK — WSIĄDŹ!' : 'ATAK — WSKOCZ!', v.x - G.camX, v.y - 46, 4, '#7cff7c', 'center');
    if (G.hudEnemy) {
      text(G.hudEnemy.name, 30, 44, 5, '#ff9a80');
      if (G.hudLayer > 0) text('×' + (G.hudLayer + 1), 128, 36, 5, '#fff');
    }
    if (G.ch && app.mode !== 'chalres') drawChalHud();
    if (G.daily && G.introT <= 0) text('CODZIENNE ' + dailyLabel(), W / 2, 34, 4, '#80d0ff', 'center');
    if (Math.abs(G.wind || 0) > 0.012) {
      const n = Math.abs(G.wind) > 0.035 ? 3 : Math.abs(G.wind) > 0.022 ? 2 : 1;
      text('WIATR ' + (G.wind > 0 ? '►'.repeat(n) : '◄'.repeat(n)), W / 2 + 46, 10, 4, '#c0e0ff');
    }
    if (G.banner && G.frame % 30 < 22) text(G.banner.txt, W / 2, 62, 8, G.banner.col, 'center');
    if (G.goT > 0 && G.frame % 40 < 26) { text('GO', W - 52, 90, 14, '#ffe040'); text('►', W - 26, 90, 14, '#ffe040'); }
    if (G.introT > 0) {
      const a = G.introT > 130 ? (150 - G.introT) / 20 : (G.introT < 20 ? G.introT / 20 : 1);
      sctx.globalAlpha = a;
      text(ST.name, W / 2, 80, 9, '#ffe080', 'center');
      text(ST.sub, W / 2, 98, 6, '#fff', 'center');
      if (G.wx) text(G.wx.name, W / 2, 112, 5, '#c0e0ff', 'center');
      sctx.globalAlpha = 1;
    }
    for (const pp of G.popups) text(pp.txt, pp.x - G.camX, pp.y - pp.t * 0.4, 6, pp.col || '#fff', 'center');
    if (G.introBoss && G.introBoss.def.title) {
      text(G.introBoss.def.title, W / 2, 60, 12, '#ff6040', 'center');
      text(G.introBoss.def.sub, W / 2, 78, 6, '#fff', 'center');
    }
    if (G.bossDead && G.clearT > 150 && app.mode === 'play') text('ETAP UKOŃCZONY!', W / 2, 80, 12, G.frame % 20 < 10 ? '#ffe040' : '#fff', 'center');
  }

