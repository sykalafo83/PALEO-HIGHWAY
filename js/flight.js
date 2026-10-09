/* PALEO HIGHWAY — etap bonusowy „Lot nad Zatoką”: lot na pteranodonie wzdłuż wybrzeża.
 * Zrzucaj kamienie na łodzie kłusowników, omijaj mewy i harpuny, uwalniaj dinozaury z kutrów.
 * Moduł działa jak bonus z autostradą: start(team), update() → true po wyniku, draw(), drawText().
 */
(function (global) {
  'use strict';
  const SP = global.Sprites, SC = global.Scenery;

  global.FlightStage = function (api) {
    const { W, H, ctx, text, sfx, held, pressed, AU } = api, rumble = api.rumble || (() => {});
    const TIME = 50 * 60, SEA = 150, SPEED = 2.2, OUT = '#140c10';
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    let F = null, tiles = null;

    function buildTiles() {
      if (tiles) return tiles;
      const mk = (w, fn, seed) => { const c = SC.canvas(w, H); fn(c.getContext('2d'), SC.rng(seed), w); return c; };
      tiles = {
        far: mk(1152, (g, R, w) => {
          // daleki brzeg z klifami i latarnią
          g.fillStyle = '#6a5a7a';
          g.beginPath(); g.moveTo(0, SEA); for (let x = 0; x <= w; x += 24) g.lineTo(x, SEA - 18 - R() * 26 - (Math.sin(x * 0.01) + 1) * 10); g.lineTo(w, SEA); g.fill();
          g.fillStyle = '#4a3a5a'; g.fillRect(w * 0.6, SEA - 74, 8, 40); g.fillStyle = '#ffe080'; g.fillRect(w * 0.6, SEA - 78, 8, 5);
        }, 5),
        mid: mk(768, (g, R, w) => {
          for (let x = 0; x < w; x += 60 + R() * 80) { g.fillStyle = '#3a3048'; g.beginPath(); g.moveTo(x, SEA); g.lineTo(x + 10 + R() * 10, SEA - 18 - R() * 16); g.lineTo(x + 34, SEA); g.fill(); }   // skały w wodzie
        }, 7)
      };
      return tiles;
    }
    function tileDraw(c, off) { const w = c.width, o = ((off % w) + w) % w; ctx.drawImage(c, -o, 0); if (w - o < W) ctx.drawImage(c, w - o, 0); }

    function start(team) {
      buildTiles();
      team = Array.isArray(team) ? team : [team];
      F = {
        t: 0, phase: 'intro', team, player: team[0], timer: TIME, dist: 0,
        pt: { x: 90, y: 70, vx: 0, vy: 0, hp: 100, inv: 0, cool: 0, dash: 0, dashCool: 0 },
        rocks: [], boats: [], gulls: [], shots: [], items: [], fx: [], pops: [],
        sunk: 0, freed: 0, bonus: 0, nextBoat: 90, nextGull: 300, nextItem: 200, shake: 0, result: null
      };
      AU.stopMusic(); AU.play('drive');
    }

    // ---------------------------------------------------------- spawny
    const BOATS = {
      dinghy: { hp: 1, w: 30, score: 500, col: '#a04a2a', shoot: false },
      trawler: { hp: 2, w: 48, score: 1000, col: '#3a6a8a', shoot: false, cage: true },
      gunboat: { hp: 3, w: 56, score: 1500, col: '#4a4a52', shoot: true }
    };
    function spawnBoat() {
      const r = Math.random(), type = F.t > 1800 && r < 0.35 ? 'gunboat' : r < 0.55 ? 'dinghy' : r < 0.85 ? 'trawler' : 'gunboat';
      const D = BOATS[type];
      F.boats.push({ type, x: W + 50, y: rnd(166, 206), vx: rnd(0.4, 1.3) * (Math.random() < 0.3 ? -0.5 : 1), hp: D.hp, t: 0, flash: 0, sink: 0, cool: Math.round(rnd(80, 160)) });
    }
    function pop(x, y, txt, col) { F.pops.push({ x, y, txt, col: col || '#fff', t: 0 }); }

    // ---------------------------------------------------------- aktualizacja
    function update() {
      const p = F.pt;
      F.t++;
      if (F.shake > 0) F.shake--;
      for (let i = F.pops.length - 1; i >= 0; i--) if (++F.pops[i].t > 50) F.pops.splice(i, 1);
      for (let i = F.fx.length - 1; i >= 0; i--) { const f = F.fx[i]; f.t++; f.x += (f.vx || 0) - SPEED * 0.5; f.y += (f.vy || 0); if (f.grav) f.vy += 0.2; if (f.t >= f.life) F.fx.splice(i, 1); }
      if (F.phase === 'intro') {
        if (F.t % 50 === 1 && F.t < 150) sfx('select');
        if (F.t === 150) { sfx('go'); F.phase = 'fly'; F.t = 0; }
        return false;
      }
      if (F.phase === 'result') return (pressed.start || pressed.attack) && F.t > 60;
      const flying = F.phase === 'fly';
      F.dist += SPEED;
      if (flying) {
        if (--F.timer <= 0) { F.phase = 'end'; F.t = 0; sfx('go'); }
        // sterowanie
        const dx = (held.right ? 1 : 0) - (held.left ? 1 : 0), dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
        p.vx += dx * 0.35; p.vy += dy * 0.35; p.vx *= 0.86; p.vy *= 0.86;
        if (pressed.jump && p.dashCool <= 0) { p.dash = 14; p.dashCool = 60; sfx('whoosh'); }
        if (p.dash > 0) { p.dash--; p.vx += 0.6; }
        if (p.dashCool > 0) p.dashCool--;
        p.x = clamp(p.x + p.vx, 24, W - 60); p.y = clamp(p.y + p.vy, 26, 124);
        if (p.cool > 0) p.cool--;
        if (pressed.attack && p.cool <= 0) {
          p.cool = 16; sfx('throw');
          F.rocks.push({ x: p.x + 4, y: p.y + 10, vx: SPEED * 0.4 + p.vx * 0.5, vy: 0.6, t: 0 });
        }
        if (p.inv > 0) p.inv--;
        // spawny
        if (--F.nextBoat <= 0) { spawnBoat(); F.nextBoat = Math.max(55, 120 - F.t / 40) + rnd(0, 50); }
        if (--F.nextGull <= 0) { const y = clamp(p.y + rnd(-30, 30), 30, 120); for (let i = 0; i < 4; i++) F.gulls.push({ x: W + 20 + i * 14, y: y + (i % 2) * 10 - 5, t: rnd(0, 20) }); F.nextGull = rnd(180, 300); sfx('screech'); }
        if (--F.nextItem <= 0) { F.items.push({ x: W + 10, y: rnd(30, 110), t: 0 }); F.nextItem = rnd(200, 340); }
      }
      if (F.phase === 'crash') { p.vy += 0.15; p.y += p.vy; p.x += 0.5; if (p.y > SEA + 30 && F.t > 60) finish(); }
      if (F.phase === 'end') { p.x += 2.5; p.y += (60 - p.y) * 0.05; if (F.t > 120) finish(); }
      // kamienie
      for (let i = F.rocks.length - 1; i >= 0; i--) {
        const r = F.rocks[i]; r.t++; r.x += r.vx - SPEED * 0.3; r.vy += 0.22; r.y += r.vy;
        let hit = false;
        for (const b of F.boats) {
          if (b.sink) continue;
          const D = BOATS[b.type];
          if (Math.abs(r.x - b.x) < D.w / 2 + 3 && r.y > b.y - 16 && r.y < b.y + 2) { hitBoat(b); hit = true; break; }
        }
        if (hit) { F.rocks.splice(i, 1); continue; }
        if (r.y > 214) { for (let k = 0; k < 5; k++) F.fx.push({ type: 'splash', x: r.x, y: 212, vx: rnd(-1, 1), vy: rnd(-2.4, -1), grav: true, t: 0, life: 24 }); sfx('land'); F.rocks.splice(i, 1); }
      }
      // łodzie
      for (let i = F.boats.length - 1; i >= 0; i--) {
        const b = F.boats[i], D = BOATS[b.type]; b.t++;
        if (b.flash > 0) b.flash--;
        b.x -= SPEED * 0.6 + b.vx;
        if (b.sink) { b.sink++; if (b.sink > 60) F.boats.splice(i, 1); continue; }
        // kanonierka: błysk lufy (ostrzeżenie) przez 30 klatek, potem niezbyt celny strzał
        if (D.shoot && flying && b.x < W - 20 && b.x > 40) b.cool--;
        if (D.shoot && b.cool === 30) sfx('charge');
        if (D.shoot && flying && b.x < W - 20 && b.x > 40 && b.cool <= 0) {
          b.cool = Math.round(rnd(170, 240)); sfx('harpoon');
          const ang = Math.atan2(p.y - b.y, p.x - b.x) + rnd(-0.22, 0.22);
          F.shots.push({ x: b.x, y: b.y - 14, vx: Math.cos(ang) * 3.4, vy: Math.sin(ang) * 3.4, t: 0 });
        }
        if (b.x < -80 || b.x > W + 120) F.boats.splice(i, 1);
      }
      // harpuny
      for (let i = F.shots.length - 1; i >= 0; i--) {
        const s = F.shots[i]; s.t++; s.x += s.vx - SPEED * 0.3; s.y += s.vy;
        if (flying && p.inv <= 0 && Math.abs(s.x - p.x) < 14 && Math.abs(s.y - p.y) < 9) { hurtP(12); F.shots.splice(i, 1); continue; }
        if (s.t > 120 || s.y < -10) F.shots.splice(i, 1);
      }
      // mewy
      for (let i = F.gulls.length - 1; i >= 0; i--) {
        const g = F.gulls[i]; g.t++; g.x -= SPEED + 1.6; g.y += Math.sin(g.t * 0.1) * 0.5;
        if (flying && p.inv <= 0 && Math.abs(g.x - p.x) < 16 && Math.abs(g.y - p.y) < 10) { hurtP(10); F.gulls.splice(i, 1); continue; }
        if (g.x < -20) F.gulls.splice(i, 1);
      }
      // bursztyny w chmurach
      for (let i = F.items.length - 1; i >= 0; i--) {
        const it = F.items[i]; it.t++; it.x -= SPEED;
        if (flying && Math.abs(it.x - p.x) < 16 && Math.abs(it.y - p.y) < 14) { F.bonus += 500; sfx('coin'); pop(it.x, it.y - 10, '+500', '#f0a020'); F.items.splice(i, 1); continue; }
        if (it.x < -20) F.items.splice(i, 1);
      }
      return false;
    }
    function hitBoat(b) {
      const D = BOATS[b.type];
      b.hp--; b.flash = 8; sfx('crash'); F.shake = 4;
      for (let k = 0; k < 6; k++) F.fx.push({ type: 'wood', x: b.x + rnd(-10, 10), y: b.y - 10, vx: rnd(-1.5, 1.5), vy: rnd(-3, -1), grav: true, t: 0, life: 30 });
      if (b.hp > 0) return;
      b.sink = 1; F.sunk++; F.bonus += D.score; sfx('explode'); F.shake = 8; rumble(0.5, 0.5, 160);
      pop(b.x, b.y - 30, String(D.score), '#ffe080');
      if (D.cage) { F.freed++; F.bonus += 500; pop(b.x, b.y - 44, 'UWOLNIONY!', '#7cff7c'); sfx('screech'); F.fx.push({ type: 'baby', x: b.x, y: b.y - 20, vx: 0.5, vy: -1.2, t: 0, life: 90 }); }
    }
    function hurtP(n) {
      const p = F.pt;
      p.hp -= n; p.inv = 70; F.shake = 8; sfx('pHurt'); rumble(0.8, 0.6, 200);
      pop(p.x, p.y - 20, '-' + n, '#ff8080');
      if (p.hp <= 0) { p.hp = 0; F.phase = 'crash'; F.t = 0; p.vy = -1; sfx('screech'); AU.stopMusic(0.5); }
    }
    function finish() {
      const p = F.pt, ok = p.hp > 0;
      F.result = { boats: F.sunk * 0 + F.bonus, freed: F.freed, sunk: F.sunk, hp: ok ? p.hp * 40 : 0, done: ok ? 5000 : 0, ok };
      F.result.total = F.result.boats + F.result.hp + F.result.done;
      F.team.forEach(q => { q.score += F.result.total; });
      F.phase = 'result'; F.t = 0;
    }

    // ---------------------------------------------------------- rysowanie
    function draw() {
      const p = F.pt, t = F.t;
      ctx.save();
      if (F.shake) ctx.translate(Math.round(rnd(-2, 2)), 0);
      const sky = ctx.createLinearGradient(0, 0, 0, SEA);
      sky.addColorStop(0, '#3a4a8a'); sky.addColorStop(0.6, '#d07a7a'); sky.addColorStop(1, '#f8c080');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, SEA);
      ctx.fillStyle = '#ffe0a0'; ctx.beginPath(); ctx.arc(300, 112, 22, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 6; i++) { const x = ((i * 90 - F.dist * 0.15) % (W + 160) + W + 160) % (W + 160) - 80; ctx.fillStyle = 'rgba(255,230,220,0.55)'; ctx.beginPath(); ctx.ellipse(x, 28 + (i * 17) % 60, 40, 7, 0, 0, Math.PI * 2); ctx.fill(); }
      tileDraw(tiles.far, F.dist * 0.15);
      // morze
      const sea = ctx.createLinearGradient(0, SEA, 0, H);
      sea.addColorStop(0, '#3a6a8a'); sea.addColorStop(1, '#1e3a5a');
      ctx.fillStyle = sea; ctx.fillRect(0, SEA, W, H - SEA);
      tileDraw(tiles.mid, F.dist * 0.45);
      ctx.fillStyle = 'rgba(220,235,255,0.35)';
      for (let i = 0; i < 40; i++) { const y = SEA + 4 + (i * 13) % (H - SEA - 4), sp = 0.4 + (y - SEA) / 60; ctx.fillRect(((i * 53 - F.dist * sp) % W + W) % W, y, 6 + (y - SEA) / 8, 1); }
      // bursztyny
      for (const it of F.items) SP.drawItem(ctx, 'amber', it.x, it.y + 6, it.t);
      // łodzie (od dalszych)
      F.boats.slice().sort((a, b) => a.y - b.y).forEach(drawBoat);
      // cień pteranodona na wodzie
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(p.x, 200, Math.max(2, 16 - p.y / 14), 3, 0, 0, Math.PI * 2); ctx.fill();
      // kamienie
      for (const r of F.rocks) { ctx.fillStyle = OUT; ctx.fillRect(r.x - 4, r.y - 4, 8, 8); ctx.fillStyle = '#8a8478'; ctx.fillRect(r.x - 3, r.y - 3, 6, 6); ctx.fillStyle = '#aaa498'; ctx.fillRect(r.x - 3, r.y - 3, 3, 2); }
      // harpuny
      ctx.strokeStyle = OUT; ctx.lineWidth = 3;
      for (const s of F.shots) { ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3); ctx.stroke(); ctx.strokeStyle = '#d0d8e0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; }
      // mewy
      ctx.strokeStyle = '#f8f8f0'; ctx.lineWidth = 2;
      for (const g of F.gulls) { const f = Math.sin(g.t * 0.4) * 3; ctx.beginPath(); ctx.moveTo(g.x - 7, g.y - f); ctx.quadraticCurveTo(g.x - 3, g.y - 4, g.x, g.y); ctx.quadraticCurveTo(g.x + 3, g.y - 4, g.x + 7, g.y - f); ctx.stroke(); }
      // efekty
      for (const f of F.fx) {
        if (f.type === 'splash') { ctx.fillStyle = 'rgba(220,240,255,0.8)'; ctx.fillRect(f.x, f.y, 2, 2); }
        else if (f.type === 'wood') { ctx.fillStyle = '#7a4a22'; ctx.fillRect(f.x, f.y, 3, 2); }
        else if (f.type === 'baby') { ctx.save(); ctx.translate(f.x, f.y); ctx.scale(0.6, 0.6); SP.drawPtera(ctx, 0, 0, 1, f.t, 'fly', {}); ctx.restore(); }
      }
      // pteranodon z jeźdźcem
      if (!(p.inv > 0 && Math.floor(p.inv / 4) % 2)) {
        const st = F.phase === 'crash' ? 'down' : p.dash > 0 ? 'swoop' : 'fly';
        SP.drawPtera(ctx, p.x, p.y + 12, 1, t, st, {});
        if (F.phase !== 'crash') {
          ctx.save(); ctx.translate(p.x - 9, p.y + 9); ctx.scale(0.55, 0.55);   // jeździec na środku grzbietu
          SP.drawFigure(ctx, F.player.b, SP.POSES.crouch[0], 0, 0, 1, {});
          ctx.restore();
        }
      }
      ctx.restore();
      // pasek życia pteranodona
      ctx.fillStyle = OUT; ctx.fillRect(9, 15, 62, 6);
      ctx.fillStyle = '#401010'; ctx.fillRect(10, 16, 60, 4);
      ctx.fillStyle = p.hp > 30 ? '#5ad04a' : '#e04040'; ctx.fillRect(10, 16, 60 * p.hp / 100, 4);
    }
    function drawBoat(b) {
      const D = BOATS[b.type], x = b.x, y = b.y + (b.sink ? b.sink * 0.4 : Math.sin((b.t + b.x) * 0.08) * 1), w = D.w;
      ctx.save();
      if (b.sink) { ctx.translate(x, y); ctx.rotate(Math.min(0.5, b.sink * 0.01)); ctx.translate(-x, -y); }
      ctx.fillStyle = OUT; ctx.beginPath(); ctx.moveTo(x - w / 2 - 2, y - 10); ctx.lineTo(x + w / 2 + 4, y - 12); ctx.lineTo(x + w / 2 - 4, y + 1); ctx.lineTo(x - w / 2 + 4, y + 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = b.flash ? '#fff' : D.col; ctx.beginPath(); ctx.moveTo(x - w / 2, y - 9); ctx.lineTo(x + w / 2 + 2, y - 11); ctx.lineTo(x + w / 2 - 4, y); ctx.lineTo(x - w / 2 + 4, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x - w / 2 + 2, y - 8, w - 4, 2);
      if (b.type === 'trawler') {
        ctx.fillStyle = OUT; ctx.fillRect(x - 8, y - 26, 18, 16); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x - 7, y - 25, 16, 14);
        ctx.fillStyle = '#c8b070'; for (let i = 0; i < 4; i++) ctx.fillRect(x - 6 + i * 4, y - 25, 1, 14);   // klatka
        ctx.fillStyle = '#5a8a3a'; ctx.fillRect(x - 4, y - 18, 8, 6);   // dinozaur w klatce
      } else if (b.type === 'gunboat') {
        ctx.fillStyle = OUT; ctx.fillRect(x - 10, y - 22, 20, 12); ctx.fillStyle = '#5a5a62'; ctx.fillRect(x - 9, y - 21, 18, 10);
        ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x - 10, y - 30); ctx.stroke();
        ctx.strokeStyle = b.cool <= 30 && b.cool > 0 && Math.floor(b.cool / 4) % 2 ? '#ff6040' : '#7a828a'; ctx.lineWidth = 1.5; ctx.stroke();
        if (b.cool <= 30 && b.cool > 0 && Math.floor(b.cool / 4) % 2) { ctx.fillStyle = '#ffe080'; ctx.fillRect(x - 12, y - 33, 4, 4); }
      } else {
        ctx.fillStyle = '#c89070'; ctx.fillRect(x - 3, y - 18, 5, 8); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(x - 3, y - 20, 5, 3);   // kłusownik
      }
      ctx.restore();
      ctx.fillStyle = 'rgba(220,235,255,0.45)'; ctx.fillRect(x - w / 2 - 4, b.y + 1, w + 8, 1);
    }
    function drawText() {
      const p = F.pt;
      text('PTERANODON', 10, 6, 5, '#fff');
      text('ETAP BONUSOWY', W / 2, 6, 6, '#ffe080', 'center');
      text('ŁODZIE ' + F.sunk + '   BONUS ' + F.bonus, W - 8, 6, 5, '#fff', 'right');
      text(String(Math.ceil(F.timer / 60)).padStart(2, '0'), W - 8, 16, 8, F.timer < 600 && F.t % 30 < 15 ? '#ff6060' : '#fff', 'right');
      for (const q of F.pops) text(q.txt, q.x, q.y - q.t * 0.5, 5, q.col, 'center');
      if (F.phase === 'intro') {
        const n = 3 - Math.floor(F.t / 50);
        text('LOT NAD ZATOKĄ', W / 2, 52, 12, '#ffe080', 'center');
        text('ZATAP ŁODZIE KŁUSOWNIKÓW KAMIENIAMI!', W / 2, 72, 5, '#fff', 'center');
        text('▲▼◄► LOT   {attack|ATAK}: ZRZUĆ KAMIEŃ   {jump|SKOK}: ZRYW', W / 2, 84, 4, '#c0c0c0', 'center');
        if (n > 0) text(String(n), W / 2, 100, 20, '#fff', 'center');
      }
      if (F.phase === 'fly' && F.t < 40) text('LECIMY!', W / 2, 100, 16, '#ffe040', 'center');
      if (F.phase === 'end') text('KONIEC LOTU!', W / 2, 90, 16, F.t % 20 < 10 ? '#ffe040' : '#fff', 'center');
      if (F.phase === 'crash') text('PTERANODON ZESTRZELONY!', W / 2, 90, 12, '#ff5050', 'center');
      if (F.phase === 'result') {
        const r = F.result;
        text('WYNIK LOTU', W / 2, 30, 10, '#ffe040', 'center');
        const rows = [['ZATOPIONE ŁODZIE (' + r.sunk + ') I ZDOBYCZE', r.boats], ['UWOLNIONE DINOZAURY', r.freed], ['ZDROWIE PTERANODONA', r.hp], ['UKOŃCZONY LOT', r.done]];
        rows.forEach(([l, v], i) => { text(l, 60, 60 + i * 14, 6, '#fff'); text(String(v), W - 60, 60 + i * 14, 6, '#fff', 'right'); });
        text('RAZEM ' + r.total, W / 2, 130, 10, '#80d0ff', 'center');
        if (F.t > 60 && F.t % 50 < 35) text('{ok|ENTER} — DALEJ', W / 2, 176, 6, '#fff', 'center');
      }
    }
    return { start, update, draw, drawText, get state() { return F; } };
  };
})(window);
