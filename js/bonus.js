/* PALEO HIGHWAY — etap bonusowy „Autostrada 7”: jazda krążownikiem szos.
 * Moduł dostaje od silnika wspólne API (bufor, tekst, dźwięk, wejście) i działa jako osobny tryb gry.
 */
(function (global) {
  'use strict';
  const SP = global.Sprites, SC = global.Scenery;

  global.BonusStage = function (api) {
    const { W, H, ctx, text, sfx, held, pressed, AU } = api, rumble = api.rumble || (() => {});
    const ROAD_T = 162, ROAD_B = 214, GOAL = 9000, TIME = 60 * 60;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const OUT = '#140c10';
    let B = null, tiles = null;

    // ---------------------------------------------------------- tła (kafle zapętlane)
    function buildTiles() {
      if (tiles) return tiles;
      const mk = (w, fn, seed) => { const c = SC.canvas(w, H); fn(c.getContext('2d'), SC.rng(seed), w); return c; };
      tiles = {
        far: mk(1152, (g, R, w) => {
          SC.ridge(g, R, w, '#7a5a8a', 100, 36, 24);
          // wulkan — cel podróży
          g.fillStyle = '#5a3040'; g.beginPath(); g.moveTo(560, 140); g.lineTo(640, 58); g.lineTo(668, 58); g.lineTo(760, 140); g.fill();
          g.fillStyle = '#ff7a2a'; g.fillRect(640, 56, 28, 3);
          SC.ridge(g, R, w, '#5a4a70', 124, 18, 16);
        }, 3),
        mid: mk(768, (g, R, w) => {
          g.fillStyle = '#2a4a34'; g.fillRect(0, 134, w, 30);
          for (let x = 0; x < w; x += 24 + R() * 16) SC.canopy(g, R, x, 128 + R() * 8, 46, 26, ['#1f4535', '#2a5a42', '#35704c']);
          for (let x = 20; x < w - 20; x += 90 + R() * 70) SC.palm(g, R, x, 156, 50 + R() * 26, (R() - 0.5), true);
        }, 9),
        front: mk(768, (g, R, w) => {
          for (let x = 30; x < w - 30; x += 70 + R() * 90) SC.fern(g, R, x, H + 6, 18 + R() * 12, ['#173a1f', '#21502a', '#2b6233']);
        }, 13)
      };
      return tiles;
    }
    function tileDraw(c, off, y) {
      const w = c.width, o = ((off % w) + w) % w;
      ctx.drawImage(c, -o, y || 0); if (w - o < W) ctx.drawImage(c, w - o, y || 0);
    }

    // ---------------------------------------------------------- start
    function start(team) {
      buildTiles();
      team = Array.isArray(team) ? team : [team];
      const player = team[0];
      B = {
        t: 0, dist: 0, speed: 0, phase: 'intro', player, team, timer: TIME, bonus: 0, kills: 0, jumps: 0,
        car: { x: 80, y: 190, z: 0, vz: 0, hp: 100, inv: 0, boost: 0, bcool: 0, slow: 0, spin: 0 },
        ents: [], fx: [], pops: [], nextSpawn: 260, shake: 0, result: null, done: false, signs: 0
      };
      AU.stopMusic(); AU.play('drive');
    }

    // ---------------------------------------------------------- spawny
    const DEFS = {
      rock: { w: 18, h: 10 }, drum: { w: 16, h: 16 }, tar: { w: 30, h: 0 }, biker: { w: 30, h: 30 },
      jeep: { w: 54, h: 36 }, raptor: { w: 26, h: 22 }, gem: { w: 14, h: 99 }, coin: { w: 14, h: 99 }, clock: { w: 14, h: 99 }
    };
    function spawn(type, o) {
      const e = Object.assign({ type, x: W + 40, y: rnd(ROAD_T + 6, ROAD_B - 4), v: 0, vy: 0, z: 0, t: 0, hp: 1, dead: false }, DEFS[type], o);
      B.ents.push(e);
      return e;
    }
    function spawnWave() {
      const p = B.dist / GOAL;
      const table = [['rock', 3], ['drum', 2], ['tar', 1.3], ['biker', 2 + p * 3], ['jeep', p > 0.3 ? p * 3 : 0], ['raptor', 1.2], ['gem', 0.7], ['coin', 2], ['clock', 0.5]];
      let sum = table.reduce((s, x) => s + x[1], 0), r = Math.random() * sum, type = 'rock';
      for (const [k, w] of table) { if ((r -= w) <= 0) { type = k; break; } }
      if (type === 'biker') {
        if (Math.random() < 0.35) { spawn('biker', { x: -40, v: B.speed + 1.6, cols: Math.random() * 2 | 0 }); sfx('charge'); }
        else spawn('biker', { v: rnd(2.6, 4), cols: Math.random() * 2 | 0 });
      } else if (type === 'jeep') spawn('jeep', { v: 3, hp: 2 });
      else if (type === 'raptor') {
        const down = Math.random() < 0.5;
        for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) spawn('raptor', { x: W + 30 + i * 26, y: down ? ROAD_T - 10 - i * 8 : ROAD_B + 10 + i * 8, vy: down ? 1.1 : -1.1, v: 1.5, cols: i % 2 });
      } else if (type === 'gem' || type === 'coin' || type === 'clock') {
        const n = type === 'coin' ? 3 : 1, y = rnd(ROAD_T + 8, ROAD_B - 6);
        for (let i = 0; i < n; i++) spawn(type, { x: W + 30 + i * 22, y, z: Math.random() < 0.3 ? 18 : 6 });
      } else spawn(type);
      B.nextSpawn = B.dist + rnd(150, 260) * (1 - p * 0.4);
    }

    // ---------------------------------------------------------- efekty
    function pop(x, y, txt, col) { B.pops.push({ x, y, txt, col: col || '#fff', t: 0 }); }
    function boom(x, y) { B.fx.push({ type: 'boom', x, y, t: 0, life: 24 }); sfx('explode'); B.shake = 10; rumble(0.6, 0.6, 200); }
    function sparkAt(x, y, big) { B.fx.push({ type: 'spark', x, y, t: 0, life: big ? 14 : 10, big }); }
    function damage(n) {
      const c = B.car;
      if (c.inv > 0 || B.phase !== 'drive') return;
      c.hp -= n; c.inv = 50; B.shake = 8; sfx('crash'); sfx('pHurt'); rumble(0.8, 0.6, 220);
      sparkAt(c.x + 20, c.y - 14, true);
      if (c.hp <= 0) { c.hp = 0; B.phase = 'wreck'; B.t = 0; sfx('explode'); boom(c.x, c.y); AU.stopMusic(0.5); }
    }

    // ---------------------------------------------------------- kolizje
    function collide(e) {
      const c = B.car;
      if (e.dead || Math.abs(e.x - c.x) > (e.w + 58) / 2 || Math.abs(e.y - c.y) > (e.type === 'jeep' ? 12 : 9)) return;
      const boost = c.boost > 0;
      switch (e.type) {
        case 'gem': case 'coin': case 'clock':
          if (Math.abs(e.z - c.z) > 22) return;
          e.dead = true;
          if (e.type === 'gem') { B.bonus += 2000; sfx('coin'); pop(e.x, e.y - 30, '2000', '#80f0ff'); }
          else if (e.type === 'coin') { B.bonus += 500; sfx('coin'); pop(e.x, e.y - 30, '500', '#ffe080'); }
          else { B.timer += 5 * 60; sfx('oneup'); pop(e.x, e.y - 30, '+5 S', '#7cff7c'); }
          return;
        case 'tar':
          if (c.z > 2 || e.used) return;
          e.used = true; c.slow = 45; sfx('land'); pop(c.x, c.y - 40, 'SMOŁA!', '#c0c0c0');
          return;
        case 'rock':
          if (c.z >= e.h) { if (!e.jumped) { e.jumped = true; B.jumps++; B.bonus += 100; } return; }
          e.dead = true; sparkAt(e.x, e.y - 8, true);
          for (let i = 0; i < 6; i++) B.fx.push({ type: 'debris', x: e.x, y: e.y, z: 6, vx: rnd(-1, 3), vz: rnd(1, 3), t: 0, life: 40, col: '#8a8a8a' });
          damage(15);
          return;
        case 'drum':
          if (c.z >= e.h) { if (!e.jumped) { e.jumped = true; B.jumps++; B.bonus += 100; } return; }
          e.dead = true; boom(e.x, e.y);
          if (boost || B.speed > 6.5) { B.bonus += 300; B.kills++; pop(e.x, e.y - 40, '300', '#ffe080'); }
          else damage(8);
          return;
        case 'raptor':
          if (c.z > 8) { if (!e.jumped) { e.jumped = true; B.jumps++; B.bonus += 200; pop(e.x, e.y - 40, 'SKOK! 200', '#7cff7c'); sfx('pickup'); } return; }
          if (e.knock) return;
          e.knock = true; e.vz = 3; e.v = B.speed + 2; sfx('screech');
          damage(8);
          return;
        case 'biker':
          if (e.knock) return;
          if (boost) {
            e.knock = true; e.vz = 4; e.v = B.speed + 3; e.vy = Math.sign(e.y - c.y || 1) * 1.5;
            B.bonus += 1000; B.kills++; sfx('heavy'); sfx('eDie'); sparkAt(e.x, e.y - 20, true); pop(e.x, e.y - 40, '1000', '#ffe080');
          } else {
            e.vy = Math.sign(e.y - c.y || 1) * 2.4; e.x += 14; sfx('hit');
            damage(10);
          }
          return;
        case 'jeep':
          if (boost) {
            if (e.hitT > 0) return;
            e.hp--; e.hitT = 20; c.boost = 0; c.x -= 16; sfx('slam'); B.shake = 8; sparkAt(e.x - 20, e.y - 20, true);
            if (e.hp <= 0) { e.dead = true; boom(e.x, e.y); B.bonus += 2500; B.kills++; pop(e.x, e.y - 50, '2500', '#ffe080'); }
          } else { c.x -= 10; damage(14); }
          return;
      }
    }

    // ---------------------------------------------------------- aktualizacja
    function update() {
      const c = B.car;
      B.t++;
      if (B.shake > 0) B.shake--;
      for (let i = B.fx.length - 1; i >= 0; i--) {
        const f = B.fx[i]; f.t++;
        if (f.type === 'debris') { f.x += f.vx - B.speed; f.vz -= 0.3; f.z += f.vz; if (f.z < 0) { f.z = 0; f.vz *= -0.3; } }
        else f.x -= B.speed * 0.6;
        if (f.t >= f.life) B.fx.splice(i, 1);
      }
      for (let i = B.pops.length - 1; i >= 0; i--) if (++B.pops[i].t > 50) B.pops.splice(i, 1);

      if (B.phase === 'intro') {
        if (B.t % 50 === 1 && B.t < 150) sfx('select');
        if (B.t === 150) { sfx('go'); B.phase = 'drive'; B.t = 0; }
        return false;
      }
      if (B.phase === 'result') {
        if ((pressed.start || pressed.attack) && B.t > 60) return true;
        return false;
      }
      if (B.phase === 'drive') {
        const dx = (held.right ? 1 : 0) - (held.left ? 1 : 0), dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
        c.y = clamp(c.y + dy * 1.8, ROAD_T + 4, ROAD_B);
        let target = dx > 0 ? 8 : dx < 0 ? 2.5 : 5;
        if (c.slow > 0) { c.slow--; target = Math.min(target, 2.4); }
        if (c.boost > 0) { c.boost--; target += 3.5; }
        B.speed += (target - B.speed) * 0.05;
        if (pressed.jump && c.z === 0) { c.vz = 4.8; sfx('jump'); }
        if (pressed.attack && c.bcool <= 0) { c.boost = 32; c.bcool = 80; sfx('charge'); sfx('whoosh'); }
        if (c.bcool > 0) c.bcool--;
        if (--B.timer <= 0) { B.timer = 0; B.phase = 'finish'; B.timeout = true; B.t = 0; AU.stopMusic(0.5); sfx('ko'); }
      } else if (B.phase === 'finish') {
        B.speed += (7 - B.speed) * 0.05;
        c.x += 2.5;
      } else if (B.phase === 'wreck') {
        B.speed *= 0.96; c.spin += 0.3;
      }
      // samochód
      if (c.vz || c.z > 0) { c.vz -= 0.3; c.z += c.vz; if (c.z <= 0) { c.z = 0; c.vz = 0; sfx('land'); B.fx.push({ type: 'dust', x: c.x - 20, y: c.y, t: 0, life: 20 }); } }
      if (c.inv > 0) c.inv--;
      if (B.phase === 'drive') c.x += ((70 + (B.speed - 2.5) * 14 + (c.boost > 0 ? 30 : 0)) - c.x) * 0.06;
      B.dist += B.speed;

      if (B.phase === 'drive') {
        if (B.dist >= B.nextSpawn && B.dist < GOAL - 400) spawnWave();
        if (B.dist >= GOAL) { B.phase = 'finish'; B.t = 0; AU.stopMusic(0.3); AU.play('clear'); }
      }
      // encje
      for (let i = B.ents.length - 1; i >= 0; i--) {
        const e = B.ents[i]; e.t++;
        if (e.hitT > 0) e.hitT--;
        e.x += e.v - B.speed;
        if (e.type === 'raptor' && !e.knock) e.y += e.vy;
        if (e.type === 'biker' && !e.knock) {
          if (Math.abs(e.x - c.x) < 150) e.y += clamp(c.y - e.y, -0.6, 0.6);
          e.y = clamp(e.y + e.vy, ROAD_T + 4, ROAD_B); e.vy *= 0.9;
        }
        if (e.knock) { e.vz -= 0.3; e.z += e.vz; e.y += e.vy; if (e.z < 0 && e.t > 4) e.dead = true; }
        if (B.phase === 'drive') collide(e);
        if (e.dead || e.x < -100 || e.x > W + 160 || e.y < ROAD_T - 40 || e.y > ROAD_B + 40) B.ents.splice(i, 1);
      }
      if ((B.phase === 'finish' && B.t > 150) || (B.phase === 'wreck' && B.t > 140)) finishResult();
      return false;
    }
    function finishResult() {
      const c = B.car, ok = B.phase === 'finish' && !B.timeout;
      B.result = {
        finish: ok ? 10000 : 0, car: ok ? c.hp * 50 : 0, time: ok ? Math.floor(B.timer / 60) * 100 : 0,
        bonus: B.bonus, kills: B.kills, jumps: B.jumps, ok, wreck: c.hp <= 0
      };
      B.result.total = B.result.finish + B.result.car + B.result.time + B.result.bonus;
      B.team.forEach(q => { q.score += B.result.total; });
      B.phase = 'result'; B.t = 0;
      if (!ok) { AU.stopMusic(); }
    }

    // ---------------------------------------------------------- rysowanie
    function drawCar(c) {
      if (c.inv > 0 && B.t % 4 < 2 && B.phase === 'drive') return;
      const x = Math.round(c.x), y = Math.round(c.y - c.z);
      ctx.save(); ctx.translate(x, y);
      if (c.spin) ctx.rotate(Math.sin(c.spin) * 0.3);
      const bob = B.phase === 'drive' && c.z === 0 ? Math.round(Math.sin(B.t * 0.6) * 0.6) : 0;
      ctx.translate(0, bob);
      // wydech / dopalacz
      if (c.boost > 0) {
        for (let i = 0; i < 3; i++) { ctx.fillStyle = i ? '#ffd040' : '#ff6020'; ctx.beginPath(); ctx.ellipse(-36 - i * 6 - Math.random() * 6, -8, 8 - i * 2, 3, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        for (let i = 0; i < 4; i++) { const ly = -24 + i * 6; ctx.beginPath(); ctx.moveTo(-40 - Math.random() * 30, ly); ctx.lineTo(-60 - Math.random() * 30, ly); ctx.stroke(); }
      }
      // nadwozie (sylwetka z płetwami)
      ctx.fillStyle = OUT;
      ctx.beginPath(); ctx.moveTo(-34, -4); ctx.lineTo(-34, -16); ctx.lineTo(-26, -20); ctx.lineTo(-6, -20); ctx.lineTo(4, -28); ctx.lineTo(10, -28); ctx.lineTo(12, -20);
      ctx.lineTo(30, -18); ctx.lineTo(36, -14); ctx.lineTo(36, -4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c03028';
      ctx.beginPath(); ctx.moveTo(-33, -5); ctx.lineTo(-33, -15); ctx.lineTo(-26, -19); ctx.lineTo(12, -19); ctx.lineTo(30, -17); ctx.lineTo(35, -13); ctx.lineTo(35, -5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e04a3a'; ctx.fillRect(-32, -18, 62, 2);
      ctx.fillStyle = '#9fd0e0'; ctx.beginPath(); ctx.moveTo(4, -27); ctx.lineTo(10, -27); ctx.lineTo(11, -20); ctx.lineTo(1, -20); ctx.fill();
      ctx.fillStyle = '#d8dee4'; ctx.fillRect(-34, -9, 70, 2); ctx.fillRect(34, -7, 4, 3); ctx.fillRect(-36, -7, 4, 3);
      ctx.fillStyle = '#fff2a8'; ctx.fillRect(33, -13, 3, 3);
      // kierowca
      const b = B.player ? B.player.b : null;
      if (B.team[1]) SP.drawPortrait(ctx, B.team[1].b, -20, -26, 4.2, false);
      if (b) {
        SP.drawPortrait(ctx, b, -6, -27, 4.2, false);
        SP.segs(ctx, [[-4, -21], [4, -22]], 2.5, b.colors.skin, OUT);
      }
      // koła
      [-20, 22].forEach(wx => {
        ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(wx, -3, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#26262a'; ctx.beginPath(); ctx.arc(wx, -3, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8e8e0'; ctx.beginPath(); ctx.arc(wx, -3, 3.5, 0, Math.PI * 2); ctx.fill();
        const a = B.dist * 0.15;
        ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * 3, -3 + Math.sin(a) * 3); ctx.lineTo(wx - Math.cos(a) * 3, -3 - Math.sin(a) * 3); ctx.stroke();
      });
      ctx.restore();
    }
    const RIDE = Object.assign({}, SP.POSES.idle[0], { air: 6, lean: 22, fa: [85, 25], ba: [75, 35], fl: [80, 95], bl: [70, 100] });
    const BIKER_BUILDS = [0, 1].map(i => Object.assign({}, { scale: 0.9, legU: 11, legL: 11, torso: 17, shoulderW: 11, hipW: 9, armU: 9, armL: 9, limbW: 4.5, armW: 3.8, head: 5.3,
      hair: 'helmet', details: [{ t: 'belt', c: '#1a1a1a' }],
      colors: i ? { outline: OUT, skin: '#c89070', hair: '#3a3a3a', shirt: '#6a2a2a', pants: '#2a2a2a', boots: '#111', gloves: '#111', accent: '#ff3a2a' }
        : { outline: OUT, skin: '#d0a078', hair: '#4a5a3a', shirt: '#4a3a2a', pants: '#3a3a2a', boots: '#111', gloves: '#111', accent: '#ffd040' } }));
    const GUNNER = Object.assign({}, BIKER_BUILDS[0], { hair: 'cap', scale: 0.95, colors: Object.assign({}, BIKER_BUILDS[0].colors, { hair: '#3a4a2a', shirt: '#5a6a3a' }) });
    function drawEnt(e) {
      const x = Math.round(e.x), y = Math.round(e.y - e.z);
      switch (e.type) {
        case 'rock':
          ctx.fillStyle = OUT; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x - 7, y - 9); ctx.lineTo(x + 2, y - 12); ctx.lineTo(x + 10, y - 6); ctx.lineTo(x + 10, y); ctx.fill();
          ctx.fillStyle = '#8a8478'; ctx.beginPath(); ctx.moveTo(x - 9, y - 1); ctx.lineTo(x - 6, y - 8); ctx.lineTo(x + 2, y - 11); ctx.lineTo(x + 9, y - 6); ctx.lineTo(x + 9, y - 1); ctx.fill();
          ctx.fillStyle = '#aaa498'; ctx.fillRect(x - 4, y - 9, 5, 2);
          break;
        case 'drum': SP.drawBarrel(ctx, x, y, 2, 'barrel'); break;
        case 'tar':
          ctx.fillStyle = '#100c0c'; ctx.beginPath(); ctx.ellipse(x, y, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(120,140,180,0.35)'; ctx.fillRect(x - 8, y - 1, 8, 1);
          break;
        case 'gem': case 'coin': SP.drawItem(ctx, e.type, x, y, B.t); break;
        case 'clock':
          ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x, y - 6, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#e8f0f0'; ctx.beginPath(); ctx.arc(x, y - 6, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = OUT; ctx.fillRect(x - 0.5, y - 10, 1, 4); ctx.fillRect(x, y - 6.5, 3, 1); ctx.fillRect(x - 2, y - 13, 4, 2);
          break;
        case 'raptor':
          SP.drawRaptor(ctx, x, y, -1, B.t + e.cols * 7, e.knock ? 'down' : 'run', e.cols ? { body: '#3a7a7a', belly: '#d0d8b8', stripe: '#1e3a4a' } : { body: '#5a8a3a', belly: '#d8d0a0', stripe: '#2e4a1e' }, { scale: 0.8 });
          break;
        case 'biker': {
          ctx.save(); if (e.knock) { ctx.translate(x, y); ctx.rotate(-e.t * 0.2); ctx.translate(-x, -y); }
          [-11, 11].forEach(wx => { ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x + wx, y - 5, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3a3a3e'; ctx.beginPath(); ctx.arc(x + wx, y - 5, 4, 0, Math.PI * 2); ctx.fill(); });
          SP.segs(ctx, [[x - 11, y - 5], [x - 2, y - 14], [x + 9, y - 16], [x + 11, y - 5]], 3, e.cols ? '#c03a2a' : '#4a6a3a', OUT);
          ctx.fillStyle = '#c0c8d0'; ctx.fillRect(x - 6, y - 9, 8, 3);
          SP.drawFigure(ctx, BIKER_BUILDS[e.cols], RIDE, x - 3, y - 10, 1, { flash: e.knock && B.t % 4 < 2 });
          ctx.restore();
          break;
        }
        case 'jeep': {
          const fl = e.hitT > 0 && B.t % 4 < 2;
          SP.drawFigure(ctx, GUNNER, SP.POSES.aim[0], x - 12, y - 18, 1, { weapon: 'rifle', flash: fl });
          ctx.fillStyle = OUT; ctx.fillRect(x - 28, y - 22, 56, 18);
          ctx.fillStyle = fl ? '#fff' : '#5a6a3a'; ctx.fillRect(x - 27, y - 21, 54, 16);
          ctx.fillStyle = '#4a5a2a'; ctx.fillRect(x - 27, y - 13, 54, 2);
          ctx.fillStyle = '#9fd0e0'; ctx.fillRect(x + 12, y - 30, 3, 9);
          ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 4, y - 21); ctx.lineTo(x - 4, y - 34); ctx.lineTo(x + 8, y - 34); ctx.lineTo(x + 8, y - 21); ctx.stroke();
          ctx.fillStyle = '#e8d8a0'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center'; ctx.fillText('XX', x - 14, y - 9);
          [-17, 17].forEach(wx => { ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x + wx, y - 4, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2a2a2e'; ctx.beginPath(); ctx.arc(x + wx, y - 4, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#6a6a6a'; ctx.fillRect(x + wx - 1, y - 5, 2, 2); });
          break;
        }
      }
    }
    function draw() {
      const c = B.car, d = B.dist;
      ctx.save();
      if (B.shake > 0) ctx.translate(Math.round(rnd(-2, 2)), Math.round(rnd(-2, 2)));
      // niebo
      const g = ctx.createLinearGradient(0, 0, 0, 150);
      g.addColorStop(0, '#2a3a7a'); g.addColorStop(0.6, '#e88a58'); g.addColorStop(1, '#f8d090');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, 160);
      ctx.fillStyle = 'rgba(255,240,190,0.9)'; ctx.beginPath(); ctx.arc(320, 64, 16, 0, Math.PI * 2); ctx.fill();
      tileDraw(tiles.far, d * 0.06);
      tileDraw(tiles.mid, d * 0.35);
      // pobocze i bariera
      ctx.fillStyle = '#5a7a3a'; ctx.fillRect(0, 150, W, 10);
      const po = d % 40;
      for (let x = -po; x < W + 40; x += 40) { ctx.fillStyle = OUT; ctx.fillRect(x - 1, 146, 4, 12); ctx.fillStyle = '#b0b8c0'; ctx.fillRect(x, 147, 2, 10); }
      ctx.fillStyle = OUT; ctx.fillRect(0, 148, W, 4); ctx.fillStyle = '#d0d8e0'; ctx.fillRect(0, 149, W, 2);
      // znaki odległości co 1500
      const nextSign = Math.ceil(d / 1500) * 1500, sx = nextSign - d + W * 0.2;
      if (sx < W + 60 && nextSign < GOAL) {
        const km = Math.max(1, Math.round((GOAL - nextSign) / 1000));
        ctx.save(); ctx.translate(sx, 0);
        ctx.fillStyle = OUT; ctx.fillRect(-2, 110, 4, 44); ctx.fillStyle = '#7a6a5a'; ctx.fillRect(-1, 110, 2, 44);
        ctx.fillStyle = OUT; ctx.fillRect(-24, 98, 48, 18); ctx.fillStyle = '#2a6a3a'; ctx.fillRect(-23, 99, 46, 16);
        ctx.fillStyle = '#f0ecd8'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillText('META ' + km + 'KM', 0, 110);
        ctx.restore();
      }
      // meta
      const fx = GOAL - d + c.x;
      if (fx > -40 && fx < W + 40) {
        for (let y = 158; y < 218; y += 6) for (let i = 0; i < 2; i++) { ctx.fillStyle = ((y / 6 + i) % 2) ? '#fff' : '#111'; ctx.fillRect(fx + i * 6, y, 6, 6); }
        ctx.fillStyle = OUT; ctx.fillRect(fx - 2, 110, 4, 50); ctx.fillRect(fx + 12, 110, 4, 50);
        ctx.fillStyle = '#c03028'; ctx.fillRect(fx - 4, 104, 24, 10);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillText('META', fx + 8, 112);
      }
      // jezdnia
      ctx.fillStyle = '#4a4a50'; ctx.fillRect(0, 158, W, 60);
      ctx.fillStyle = '#3e3e44'; for (let i = 0; i < 40; i++) ctx.fillRect(((i * 97 - d) % W + W) % W, 160 + (i * 23) % 56, 3, 1);
      ctx.fillStyle = '#e8e0c0'; ctx.fillRect(0, 158, W, 2); ctx.fillRect(0, 216, W, 2);
      const lo = d % 48;
      ctx.fillStyle = '#e0c860'; for (let x = -lo; x < W; x += 48) { ctx.fillRect(x, 176, 24, 2); ctx.fillRect(x + 12, 197, 24, 2); }
      ctx.fillStyle = '#3a6a2a'; ctx.fillRect(0, 218, W, H - 218);
      // encje + auto (sortowanie wg głębi)
      const list = B.ents.map(e => ({ y: e.y, e })).concat([{ y: c.y, car: true }]);
      list.sort((a, b) => a.y - b.y);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (const o of list) {
        const ox = o.car ? c.x : o.e.x, w = o.car ? 34 : o.e.type === 'tar' ? 0 : o.e.w * 0.5;
        if (w) { ctx.beginPath(); ctx.ellipse(ox, o.y, w, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      }
      for (const o of list) { if (o.car) drawCar(c); else drawEnt(o.e); }
      for (const f of B.fx) {
        const k = f.t / f.life;
        if (f.type === 'spark') SP.drawSpark(ctx, f.x, f.y, k, f.big);
        else if (f.type === 'dust') SP.drawDust(ctx, f.x, f.y, k);
        else if (f.type === 'debris') { ctx.fillStyle = f.col; ctx.fillRect(f.x - 1.5, f.y - f.z - 1.5, 3, 3); }
        else if (f.type === 'boom') {
          const r = 10 + k * 22;
          ctx.fillStyle = `rgba(255,${200 - k * 150},60,${1 - k})`; ctx.beginPath(); ctx.arc(f.x, f.y - 12 - k * 8, r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(255,255,200,${Math.max(0, 1 - k * 2)})`; ctx.beginPath(); ctx.arc(f.x, f.y - 12, r * 0.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      tileDraw(tiles.front, d * 1.3);
      ctx.restore();
      // HUD: pasek postępu, wytrzymałość
      const px = 112, pw = 160;
      ctx.fillStyle = '#000'; ctx.fillRect(px - 1, 25, pw + 2, 6);
      ctx.fillStyle = '#3a3040'; ctx.fillRect(px, 26, pw, 4);
      ctx.fillStyle = '#e0a040'; ctx.fillRect(px, 26, pw * Math.min(1, d / GOAL), 4);
      ctx.fillStyle = '#c03028'; ctx.fillRect(px + pw * Math.min(1, d / GOAL) - 3, 23, 6, 4);
      ctx.fillStyle = '#ff7a2a'; ctx.fillRect(px + pw - 2, 22, 4, 4);
      ctx.fillStyle = '#000'; ctx.fillRect(9, 19, 62, 6);
      ctx.fillStyle = '#401010'; ctx.fillRect(10, 20, 60, 4);
      ctx.fillStyle = c.hp > 50 ? '#40e060' : c.hp > 25 ? '#f0d030' : '#f04040'; ctx.fillRect(10, 20, 60 * c.hp / 100, 4);
      if (c.bcool > 0) { ctx.fillStyle = '#3a3040'; ctx.fillRect(10, 27, 60, 2); ctx.fillStyle = '#40c0f0'; ctx.fillRect(10, 27, 60 * (1 - c.bcool / 80), 2); }
      else { ctx.fillStyle = B.t % 20 < 10 ? '#40c0f0' : '#a0e0ff'; ctx.fillRect(10, 27, 60, 2); }
      if (B.phase === 'result') { ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H); }
    }
    function drawText() {
      text('AUTO', 10, 10, 5, '#fff');
      text('ETAP BONUSOWY', W / 2, 6, 6, '#ffe080', 'center');
      text('BONUS ' + B.bonus, W - 8, 6, 5, '#fff', 'right');
      text(String(Math.ceil(B.timer / 60)).padStart(2, '0'), W - 8, 16, 8, B.timer < 600 && B.t % 30 < 15 ? '#ff6060' : '#fff', 'right');
      for (const p of B.pops) text(p.txt, p.x, p.y - p.t * 0.5, 5, p.col, 'center');
      if (B.phase === 'intro') {
        const n = 3 - Math.floor(B.t / 50);
        text('AUTOSTRADA 7', W / 2, 52, 12, '#ffe080', 'center');
        text('DOJEDŹ DO METY PRZED CZASEM!', W / 2, 72, 5, '#fff', 'center');
        text('▲▼ PAS  ► GAZ  ◄ HAMULEC  {jump|SKOK}: PODSKOK  {attack|ATAK}: DOPALACZ', W / 2, 84, 4, '#c0c0c0', 'center');
        if (n > 0) text(String(n), W / 2, 100, 20, '#fff', 'center');
      }
      if (B.phase === 'drive' && B.t < 40) text('START!', W / 2, 100, 16, '#ffe040', 'center');
      if (B.phase === 'finish') text(B.timeout ? 'KONIEC CZASU!' : 'META!', W / 2, 90, 16, B.t % 20 < 10 ? '#ffe040' : '#fff', 'center');
      if (B.phase === 'wreck') text('AUTO ROZBITE!', W / 2, 90, 14, '#ff5050', 'center');
      if (B.phase === 'result') {
        const r = B.result;
        text('WYNIK ETAPU BONUSOWEGO', W / 2, 30, 9, '#ffe040', 'center');
        const rows = [['DOJAZD DO METY', r.finish], ['STAN AUTA', r.car], ['POZOSTAŁY CZAS', r.time], ['ZNISZCZENIA (' + r.kills + ')', 0], ['ZDOBYCZE I SKOKI', r.bonus]];
        rows.forEach(([l, v], i) => {
          if (i === 3) { text(l, 70, 60 + i * 14, 6, '#c0c0c0'); return; }
          text(l, 70, 60 + i * 14, 6, '#fff'); text(String(v), W - 70, 60 + i * 14, 6, '#fff', 'right');
        });
        text('RAZEM ' + r.total, W / 2, 140, 10, '#80d0ff', 'center');
        if (B.t > 60 && B.t % 50 < 35) text('{ok|ENTER} — DALEJ', W / 2, 176, 6, '#fff', 'center');
      }
    }

    return { start, update, draw, drawText, get state() { return B; } };
  };
})(window);
