  // =============================================================== OTOCZENIE
  // ---- wydarzenia etapów: przypływ na plaży, fala ścieków w kanałach
  const FLOOD_SAFE = FLOOR_TOP + 20;   // podwyższenie w kanałach: y mniejsze = bezpiecznie
  function banner(txt, col) { G.banner = { txt, col, t: 120 }; }
  // pogoda w rozgrywce: wiatr (burza piaskowa, deszcz, ulewa) i śliska nawierzchnia (deszcz, ulewa)
  const slippery = () => !!((G.wx && G.wx.rain) || (ST.storm && (G.fog || 0) > 0.3));
  function updateWind() {
    const windy = (G.wx && (G.wx.sand || G.wx.rain)) || ST.storm;
    if (!windy) { G.wind = 0; return; }
    if (!G.windDir || G.frame % 1800 === 0) G.windDir = G.windDir ? -G.windDir : (Math.random() < 0.5 ? -1 : 1);
    G.wind = G.windDir * (G.wx && G.wx.sand ? 0.05 : 0.032) * (0.55 + 0.45 * Math.sin(G.frame * 0.013));
  }
  // odłamki bursztynu spadające z nieba (atak Kolosa): cień rośnie przez 45 klatek, potem uderzenie
  function updateDrops() {
    const D = G.drops; if (!D) return;
    for (let i = D.length - 1; i >= 0; i--) {
      const d = D[i]; d.t++;
      if (d.t === 45) {
        sfx('crash'); spark(d.x, d.y, 6, true); G.shake = Math.max(G.shake, 4);
        for (let k = 0; k < 5; k++) G.fx.push({ type: 'debris', x: d.x, y: d.y, z: 2, vx: rnd(-1.5, 1.5), vz: rnd(1, 3), t: 0, life: 36, col: k % 2 ? '#f0b040' : '#c07820' });
        for (const q of G.players) if (hittable(q) && q.z < 10 && Math.abs(q.x - d.x) < 16 && Math.abs(q.y - d.y) < 9) hurt(q, 14, q.x >= d.x ? 1 : -1, true, null, { unblock: true });
      }
      if (d.t > 50) D.splice(i, 1);
    }
  }
  function updateEvents() {
    if (G.banner && --G.banner.t <= 0) G.banner = null;
    updateDrops();
    updateWind();
    updateRats();
    const ev = ST.EVENT;
    if (!ev || G.introT > 0 || G.bossDead || G.introBoss || G.rush) { if (G.ev) G.ev.front = null; return; }
    const E = G.ev = G.ev || { t: 0, level: 0 };
    E.t++;
    if (ev === 'tide') {
      // cykl: 900 klatek spokoju, 90 ostrzeżenia, potem woda wznosi się i opada (ok. 7 s)
      // cykl ok. 30 s: 1200 klatek spokoju, ostrzeżenie, potem woda wznosi się i opada
      const k = E.t % 1800;
      if (k === 1200) { banner('PRZYPŁYW!', '#80d0ff'); sfx('charge'); }
      const target = k >= 1290 ? Math.sin(Math.min(1, (k - 1290) / 420) * Math.PI) : 0;
      E.level += (target - E.level) * 0.05;
      G.tideY = FLOOR_TOP + 6 + E.level * 40;
      if (E.level < 0.05) G.players.forEach(q => { q.wetMsg = false; });
    } else if (ev === 'flood') {
      const k = E.t % 1200;   // cykl ok. 20 s
      if (k === 900) { E.dir = Math.random() < 0.5 ? 1 : -1; E.warn = true; banner('FALA ŚCIEKÓW! NA PODWYŻSZENIE!', '#a0ff60'); sfx('charge'); }
      if (k === 990) { E.warn = false; E.front = E.dir > 0 ? G.camX - 40 : G.camX + W + 40; E.hit = new Set(); sfx('crash'); G.shake = 6; }
      if (k > 990 && k < 1100 && E.front !== null && E.front !== undefined) {
        E.front += E.dir * 5;
        for (const a of G.actors) {
          if (E.hit.has(a) || !a.alive || isBoss(a) || a.kind === 'ptera' || a.z > 8 || a.y < FLOOD_SAFE || !hittable(a)) continue;
          if (Math.abs(a.x - E.front) < 14) {
            E.hit.add(a); hurt(a, 10, E.dir, true, null, { unblock: true });
            if (a.kind === 'player' && G.ch) G.ch.sludge = true;
            if (a.kind === 'player') G.popups.push({ x: a.x, y: a.y - 50, txt: 'ZALANY!', t: 0, col: '#a0ff60' });
          }
        }
      } else if (k >= 1100) {
        if (E.front !== null && E.front !== undefined && !G.players.some(q => E.hit && E.hit.has(q))) {
          E.dry = (E.dry || 0) + 1; if (E.dry >= 3) unlock('abovewave');
          G.popups.push({ x: G.camX + W / 2, y: 90, txt: 'SUCHA NOGA! ' + Math.min(E.dry, 3) + '/3', t: 0, col: '#a0ff60' });
        }
        E.front = null;
      }
    }
  }
  // ---- szczury w kanałach: przebiegają po chodniku, można je złapać ciosem
  function updateRats() {
    if (ST.EVENT !== 'flood') return;
    const R_ = G.rats = G.rats || [];
    if (G.frame % 140 === 70 && R_.length < 4) { const sd = Math.random() < 0.5 ? -1 : 1; R_.push({ x: sd > 0 ? G.camX - 10 : G.camX + W + 10, y: rnd(FLOOR_TOP + 24, FLOOR_BOTTOM - 4), vx: sd * rnd(1.8, 2.8), t: 0 }); }
    for (let i = R_.length - 1; i >= 0; i--) {
      const r = R_[i]; r.t++; r.x += r.vx; r.y += Math.sin(r.t * 0.3) * 0.3;
      if (r.dead) { if (++r.dead > 30) R_.splice(i, 1); continue; }
      for (const q of G.players) {
        const atk = q.state === 'attack' && q.move && q.t >= q.move.start && q.t < q.move.start + q.move.active + 2;
        const stomp = (q.state === 'jump' || q.state === 'land') && q.z < 6;
        if ((atk && Math.abs(r.x - (q.x + q.face * 16)) < 20 && Math.abs(r.y - q.y) < 10) || (stomp && Math.abs(r.x - q.x) < 12 && Math.abs(r.y - q.y) < 8)) {
          r.dead = 1; G.ratKills = (G.ratKills || 0) + 1; addScore(q, 100); sfx('screech');
          G.popups.push({ x: r.x, y: r.y - 20, txt: 'PISK! ' + Math.min(G.ratKills, 10) + '/10', t: 0, col: '#e0c0c0' });
          if (G.ratKills >= 10) unlock('ratcatcher');
          break;
        }
      }
      if (r.x < G.camX - 40 || r.x > G.camX + W + 40) R_.splice(i, 1);
    }
  }
  function drawRats() {
    for (const r of G.rats || []) {
      const x = r.x - G.camX, y = r.y, d = Math.sign(r.vx) || 1;
      if (r.dead) { ctx.fillStyle = '#5a4a4a'; ctx.fillRect(x - 5, y - 1, 10, 2); continue; }
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y, 7, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c08080'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - d * 5, y - 2); ctx.quadraticCurveTo(x - d * 10, y - 6 + Math.sin(r.t * 0.5) * 2, x - d * 14, y - 3); ctx.stroke();
      ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.ellipse(x, y - 3, 6.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6a6060'; ctx.beginPath(); ctx.ellipse(x, y - 3, 5.5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6a6060'; ctx.fillRect(x + d * 4, y - 5, 3, 3); ctx.fillStyle = '#e09090'; ctx.fillRect(x + d * 4, y - 7, 2, 2);
      ctx.fillStyle = '#ff4030'; ctx.fillRect(x + d * 6, y - 4, 1, 1);
      if (r.t % 6 < 3) { ctx.fillStyle = '#4a4040'; ctx.fillRect(x - 3, y - 1, 2, 2); ctx.fillRect(x + 2, y - 1, 2, 2); }
    }
  }
  function drawEventsBack() {
    drawRats();
    // cienie spadających odłamków i bąbelki zanurzonego Zębacza
    for (const d of G.drops || []) {
      if (d.t > 45) continue;
      const k = d.t / 45;
      ctx.fillStyle = `rgba(0,0,0,${(0.15 + k * 0.35).toFixed(2)})`; ctx.beginPath(); ctx.ellipse(d.x - G.camX, d.y, 4 + k * 10, 1.5 + k * 3, 0, 0, Math.PI * 2); ctx.fill();
      if (d.t > 30 && G.frame % 6 < 3) { ctx.strokeStyle = '#ffb040'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(d.x - G.camX, d.y, 14, 5, 0, 0, Math.PI * 2); ctx.stroke(); }
    }
    for (const a of G.actors) if (a.state === 'swim') {
      const x = a.x - G.camX;
      ctx.strokeStyle = 'rgba(160,220,120,0.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, a.y, 16 + Math.sin(G.frame * 0.3) * 3, 4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(200,255,160,0.8)';
      for (let k = 0; k < 4; k++) ctx.fillRect(x + Math.sin(G.frame * 0.2 + k * 2) * 12, a.y - 2 - ((G.frame + k * 7) % 14), 2, 2);
    }
    if (G.tideY > FLOOR_TOP + 7) {
      const y = G.tideY;
      ctx.fillStyle = 'rgba(70,110,120,0.55)'; ctx.fillRect(0, FLOOR_TOP, W, y - FLOOR_TOP);
      ctx.fillStyle = 'rgba(220,230,220,0.85)';
      for (let x = -((G.camX + G.frame * 0.6) % 10); x < W; x += 10) ctx.fillRect(x, y - 1 + Math.sin((x + G.camX) * 0.12 + G.frame * 0.08) * 1.2, 6, 2);
      ctx.strokeStyle = 'rgba(220,235,240,0.6)'; ctx.lineWidth = 1;
      for (const a of G.actors) if (a.y < y && a.z < 3) { ctx.beginPath(); ctx.ellipse(a.x - G.camX, a.y, 10 + Math.sin(G.frame * 0.2 + a.x) * 2, 2.5, 0, 0, Math.PI * 2); ctx.stroke(); }
    }
  }
  function drawEventsFront() {
    // spadające odłamki bursztynu
    for (const d of G.drops || []) {
      if (d.t >= 45) continue;
      const x = d.x - G.camX, y = d.y - (45 - d.t) * 5;
      ctx.fillStyle = '#140c10'; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 5, y); ctx.fill();
      ctx.fillStyle = '#f0a020'; ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 3.5, y); ctx.lineTo(x, y + 2.5); ctx.lineTo(x - 3.5, y); ctx.fill();
      ctx.fillStyle = '#ffe090'; ctx.fillRect(x - 1, y - 5, 1, 3);
    }
    const E = G.ev;
    if (!E || ST.EVENT !== 'flood') return;
    if (E.warn && G.frame % 20 < 12) {
      const x = E.dir > 0 ? 10 : W - 10;
      ctx.fillStyle = '#a0ff60'; ctx.beginPath(); ctx.moveTo(x + E.dir * 14, 186); ctx.lineTo(x, 176); ctx.lineTo(x, 196); ctx.fill();
    }
    if (E.front !== null && E.front !== undefined) {
      const fx = E.front - G.camX, x0 = E.dir > 0 ? 0 : fx, x1 = E.dir > 0 ? fx : W;
      if (x1 > x0) { ctx.fillStyle = 'rgba(90,150,40,0.72)'; ctx.fillRect(x0, FLOOD_SAFE, x1 - x0, H - FLOOD_SAFE); }
      ctx.fillStyle = 'rgba(160,220,90,0.9)';
      for (let y = FLOOD_SAFE - 6; y < H; y += 6) ctx.fillRect(fx - E.dir * (4 + Math.sin(y * 0.3 + G.frame * 0.4) * 3), y, 6, 5);
      ctx.fillStyle = 'rgba(220,255,180,0.9)';
      for (let i = 0; i < 6; i++) ctx.fillRect(fx + E.dir * rnd(-4, 4), FLOOD_SAFE - 10 - Math.random() * 10, 2, 2);
    }
  }
  function updateHazards() {
    const HZ = ST.HAZARDS || [];
    for (const a of G.actors) {
      if (a.hazT > 0) a.hazT--;
      if (!a.alive || a.z > 2 || isBoss(a) || a.invuln > 0 || !hittable(a) || a.kind === 'ptera' || a.hazT > 0) continue;
      for (const h of HZ) {
        if (a.x > h.x0 && a.x < h.x1 && a.y > h.y0 && a.y < h.y1) {
          a.hazT = 45; hurt(a, 9, Math.random() < 0.5 ? 1 : -1, true, null, { unblock: true });
          spark(a.x, a.y, 6, true); sfx('zap');
          if (a.kind === 'player' && G.ch) G.ch.sludge = true;
          if (a.kind === 'player') G.popups.push({ x: a.x, y: a.y - 40, txt: h.label || 'LAWA!', t: 0, col: h.label ? '#a0ff60' : '#ff8040' });
          break;
        }
      }
    }
    const C = ST.CARTS;
    if (C) {
      G.carts = G.carts || [];
      if (G.camX + W > C.x0 && G.camX < C.x1 && !G.bossDead && G.introT <= 0) {
        G.cartT = (G.cartT || 0) + 1;
        if (G.cartT === C.every - 70) { G.cartWarn = { side: Math.random() < 0.5 ? -1 : 1, t: 70 }; sfx('charge'); }
        if (G.cartT >= C.every) {
          G.cartT = 0; const sd = G.cartWarn ? G.cartWarn.side : 1;
          G.carts.push({ x: sd > 0 ? G.camX + W + 40 : G.camX - 40, y: C.y, vx: -sd * 4.6, hit: new Set() }); sfx('crash');
        }
      }
      if (G.cartWarn && --G.cartWarn.t <= 0) G.cartWarn = null;
      for (let i = G.carts.length - 1; i >= 0; i--) {
        const c = G.carts[i]; c.x += c.vx;
        if (G.frame % 5 === 0) G.fx.push({ type: 'spark', x: c.x - Math.sign(c.vx) * 12, y: c.y, z: 2, t: 0, life: 6 });
        for (const a of G.actors) {
          if (c.hit.has(a) || !hittable(a) || isBoss(a) || a.z > 8 || Math.abs(a.y - c.y) > 7 || Math.abs(a.x - c.x) > 18) continue;
          c.hit.add(a); hurt(a, 14, Math.sign(c.vx), true, null, { unblock: true }); sfx('heavy'); G.shake = 5;
        }
        if (c.x < G.camX - 120 || c.x > G.camX + W + 120) G.carts.splice(i, 1);
      }
    }
    if (ST.storm) {
      G.stormT = ((G.stormT || 0) + 1) % 1500;
      const t = G.stormT, on = t > 900 && t < 1400;
      G.fog = (G.fog || 0) + ((on ? 0.8 : 0) - (G.fog || 0)) * 0.02;
      if (t === 901) { sfx('thunder'); G.flash = 10; G.popups.push({ x: G.camX + W / 2, y: 120, txt: 'ULEWA!', t: 0, col: '#a0c0ff' }); }
    }
    if (G.flash > 0) G.flash--;
  }

