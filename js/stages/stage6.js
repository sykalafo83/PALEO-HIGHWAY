/* Etap 6 — „Bursztynowa Twierdza”: dziedziniec w burzy, hangar, laboratorium zarodków, sala tronowa barona. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 4000;
  const ALARMS = [1100, 1500, 1900, 2150, 2550, 2950, 3250, 3600, 3900];

  window.STAGES[7] = S.makeStage({
    name: 'ETAP 6 — BURSZTYNOWA TWIERDZA', sub: 'OSTATNIA BITWA O WOLNOŚĆ DINOZAURÓW',
    LEN, music: 'stage6', bossMusic: 'final', diff: 1.65,
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#0a0612', '#22163a', '#3e2440']);
      for (let i = 0; i < 6; i++) {
        const x = ((i * 100 - camX * 0.05 + t * 0.3) % (W + 240)) - 120;
        ctx.fillStyle = 'rgba(20,12,30,0.6)'; ctx.beginPath(); ctx.ellipse(x, 20 + i * 12, 100, 14, 0, 0, Math.PI * 2); ctx.fill();
      }
      const cyc = t % 420;
      if (cyc < 14 && cyc % 6 < 3) {
        ctx.fillStyle = 'rgba(220,210,255,0.5)'; ctx.fillRect(0, 0, W, FLOOR_TOP);
        const lx = 60 + (Math.floor(t / 420) * 137) % 260;
        ctx.strokeStyle = '#f0eaff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, 0);
        let y = 0, x = lx; while (y < 110) { y += 12; x += (Math.sin(y * 7 + t) * 10); ctx.lineTo(x, y); }
        ctx.stroke();
      }
    },
    far(g, R, w) {
      S.ridge(g, R, w, '#1a1428', 120, 26, 24);
      for (let x = 40; x < w; x += 140 + R() * 60) {
        g.fillStyle = '#140f20'; g.fillRect(x, 60, 26, 90); g.fillRect(x - 4, 56, 34, 6);
        for (let i = 0; i < 3; i++) g.fillRect(x - 4 + i * 13, 50, 8, 6);
        g.fillStyle = '#e0a040'; g.fillRect(x + 10, 80, 4, 6);
      }
    },
    mid(g, R, w) {
      S.fortressWall(g, R, 0, w, 100, 152, '#2a2434');
      for (let x = 30; x < w; x += 120) { g.fillStyle = '#7a2a2a'; g.fillRect(x, 104, 16, 30); g.fillStyle = '#d0a040'; g.fillRect(x + 5, 112, 6, 6); }
    },
    near(g, R, nw) {
      // 1. dziedziniec
      S.fortressWall(g, R, 0, 1000, 60, FLOOR_TOP, '#4a4252');
      for (let x = 60; x < 1000; x += 220) {
        S.rect(g, x, 30, 50, FLOOR_TOP - 30, '#3a3444');
        g.fillStyle = '#1a141e'; g.fillRect(x + 18, 70, 14, 26);
        g.fillStyle = '#7a2a2a'; g.fillRect(x + 8, 34, 34, 24); g.fillStyle = '#d0a040'; g.beginPath(); g.arc(x + 25, 46, 7, 0, Math.PI * 2); g.fill();
      }
      S.cage(g, 300, FLOOR_TOP - 1, '#8a6a3a'); S.cage(g, 740, FLOOR_TOP - 1, '#5a8a6a');
      // 2. hangar
      S.rect(g, 1000, 0, 1000, FLOOR_TOP, '#2e3036', false);
      g.fillStyle = '#3a3c44'; for (let x = 1000; x < 2000; x += 50) g.fillRect(x, 0, 4, FLOOR_TOP);
      for (let y = 10; y < 60; y += 16) { g.fillStyle = '#44464e'; g.fillRect(1000, y, 1000, 3); }
      S.rect(g, 1150, 40, 300, FLOOR_TOP - 40, '#1e2026');
      g.fillStyle = '#262830'; for (let y = 44; y < FLOOR_TOP; y += 6) g.fillRect(1150, y, 300, 1);
      // śmigłowiec
      S.rect(g, 1520, 90, 120, 40, '#3a4a3a'); S.rect(g, 1640, 100, 90, 10, '#3a4a3a'); S.rect(g, 1530, 96, 30, 20, '#7a9ab0');
      S.rect(g, 1480, 84, 220, 3, '#2a2a2a'); S.rect(g, 1560, 132, 60, 4, '#2a2a2a');
      S.crates(g, 1820, FLOOR_TOP - 1, '#5a6a4a');
      // 3. laboratorium
      S.rect(g, 2000, 0, 1000, FLOOR_TOP, '#22262e', false);
      S.pipesWall(g, R, 2000, 3000, 8);
      for (let x = 2060; x < 3000; x += 110) S.tank(g, x, FLOOR_TOP - 2, R() < 0.5 ? '#e09a2a' : '#d0802a');
      S.consoleDesk(g, 2440, FLOOR_TOP - 1); S.consoleDesk(g, 2880, FLOOR_TOP - 1);
      // 4. sala tronowa
      S.rect(g, 3000, 0, nw - 3000, FLOOR_TOP, '#2a1e26', false);
      for (let x = 3040; x < nw; x += 150) { S.rect(g, x, 20, 30, FLOOR_TOP - 20, '#4a3440'); g.fillStyle = '#d0a040'; g.fillRect(x, 20, 30, 4); g.fillRect(x, FLOOR_TOP - 8, 30, 4); }
      S.rect(g, 3400, 30, 200, 90, '#5a1a22');
      g.fillStyle = '#d0a040'; g.beginPath(); g.moveTo(3500, 44); g.lineTo(3540, 74); g.lineTo(3500, 104); g.lineTo(3460, 74); g.fill();
      g.fillStyle = '#e8b040'; g.beginPath(); g.ellipse(3500, 74, 14, 20, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(80,40,10,0.6)'; g.beginPath(); g.ellipse(3502, 76, 6, 9, 0.4, 0, Math.PI * 2); g.fill();
      S.rect(g, 3470, FLOOR_TOP - 40, 60, 40, '#6a1a22'); S.rect(g, 3460, FLOOR_TOP - 60, 80, 20, '#7a2a2a');
      // podłoże
      S.ground(g, R, 0, 1000, '#4a4650', '#3a3640');
      for (let y = FLOOR_TOP + 12; y < H; y += 14) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, y, 1000, 1); }
      for (let x = 0; x < 1000; x += 24) { g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x, FLOOR_TOP, 1, H - FLOOR_TOP); }
      S.ground(g, R, 1000, 3000, '#4a4e56', '#3e4248');
      g.fillStyle = 'rgba(0,0,0,0.3)';
      for (let x = 1000; x < 3000; x += 6) g.fillRect(x, FLOOR_TOP + 4, 1, H - FLOOR_TOP);
      for (let y = FLOOR_TOP + 16; y < H; y += 16) g.fillRect(1000, y, 2000, 2);
      g.fillStyle = '#d0b030'; for (let x = 1000; x < 3000; x += 24) { g.fillRect(x, FLOOR_TOP + 3, 12, 3); }
      S.ground(g, R, 3000, nw, '#5a2a30', '#4a2026');
      g.fillStyle = '#8a1a22'; g.fillRect(3000, 175, nw - 3000, 24);
      g.fillStyle = '#d0a040'; g.fillRect(3000, 175, nw - 3000, 1); g.fillRect(3000, 198, nw - 3000, 1);
    },
    front(g, R, fw) {
      for (let x = 100; x < fw; x += 220 + R() * 200) {
        S.rect(g, x, 120, 18, 110, '#24202c');
        g.fillStyle = '#d0a040'; g.fillRect(x, 160, 18, 3);
      }
    },
    anim(ctx, camX, t) {
      ALARMS.forEach((x, i) => {
        const sx = x - camX; if (sx < -60 || sx > W + 60) return;
        const a = (t * 0.08 + i) % (Math.PI * 2);
        ctx.fillStyle = '#5a1010'; ctx.fillRect(sx - 4, 12, 8, 6);
        ctx.fillStyle = Math.cos(a) > 0 ? '#ff3030' : '#801818'; ctx.fillRect(sx - 3, 13, 6, 4);
        ctx.fillStyle = `rgba(255,40,40,${0.12 * Math.max(0, Math.cos(a))})`;
        ctx.beginPath(); ctx.moveTo(sx, 16); ctx.lineTo(sx + Math.sin(a) * 120 - 30, FLOOR_TOP + 60); ctx.lineTo(sx + Math.sin(a) * 120 + 30, FLOOR_TOP + 60); ctx.fill();
      });
      // bąbelki w zbiornikach
      for (let x = 2060; x < 3000; x += 110) {
        const sx = x - camX; if (sx < -20 || sx > W + 20) continue;
        for (let i = 0; i < 3; i++) { const k = (t * 0.01 + i / 3 + x * 0.001) % 1; ctx.fillStyle = 'rgba(255,240,200,0.6)'; ctx.fillRect(sx - 6 + i * 5, FLOOR_TOP - 16 - k * 50, 2, 2); }
      }
      // reflektory dziedzińca
      for (let i = 0; i < 2; i++) {
        const sx = 200 + i * 500 - camX; if (sx < -200 || sx > W + 200) continue;
        const a = Math.sin(t * 0.015 + i * 2) * 0.6;
        ctx.fillStyle = 'rgba(255,250,200,0.08)';
        ctx.beginPath(); ctx.moveTo(sx, 30); ctx.lineTo(sx + Math.sin(a) * 200 - 20, -10); ctx.lineTo(sx + Math.sin(a) * 200 + 20, -10); ctx.fill();
      }
    },
    overlay(ctx, camX, t) {
      if (camX > 700) return;
      ctx.strokeStyle = 'rgba(180,170,220,0.3)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < 60; i++) {
        const x = ((i * 53 + t * 3) % (W + 40)) - 20, y = (i * 71 + t * 10) % (H + 20);
        ctx.moveTo(x, y - 18); ctx.lineTo(x - 4, y - 10);
      }
      ctx.stroke();
    },
    WAVES: [
      { lock: 300, groups: [
        { when: 0, spawns: [{ type: 'grunt', side: 'R', y: 172 }, { type: 'grunt', side: 'L', y: 205, delay: 10 }, { type: 'gunner', side: 'R', y: 190, delay: 30 }, { type: 'thin', side: 'L', y: 180, delay: 60 }] },
        { when: 1, spawns: [{ type: 'brute', side: 'R', y: 185 }, { type: 'bomber', side: 'L', y: 200, delay: 30 }] }] },
      { lock: 760, groups: [
        { when: 0, spawns: [{ type: 'raptor', side: 'R', y: 175 }, { type: 'raptor', side: 'L', y: 200, delay: 20 }, { type: 'pachy', side: 'R', y: 190, delay: 60 }] },
        { when: 1, spawns: [{ type: 'gunner', side: 'R', y: 170 }, { type: 'gunner', side: 'L', y: 205, delay: 30 }] }] },
      { lock: 1250, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'R', y: 175 }, { type: 'brute', side: 'L', y: 205, delay: 20 }, { type: 'bomber', side: 'R', y: 190, delay: 50 }] },
        { when: 1, spawns: [{ type: 'thin', side: 'R', y: 170 }, { type: 'thin', side: 'R', y: 205, delay: 15 }, { type: 'thin', side: 'L', y: 188, delay: 30 }] }] },
      { lock: 1750, groups: [
        { when: 0, spawns: [{ type: 'klin', side: 'R', y: 185, sub: true }, { type: 'grunt', side: 'L', y: 170, delay: 30 }, { type: 'grunt', side: 'L', y: 205, delay: 50 }] }] },
      { lock: 2250, groups: [
        { when: 0, spawns: [{ type: 'gunner', side: 'R', y: 172 }, { type: 'bomber', side: 'R', y: 205, delay: 20 }, { type: 'raptor', side: 'L', y: 188, delay: 40 }] },
        { when: 1, spawns: [{ type: 'brute', side: 'R', y: 180 }, { type: 'pachy', side: 'L', y: 200, delay: 40 }, { type: 'grunt', side: 'R', y: 205, delay: 60 }] }] },
      { lock: 2750, groups: [
        { when: 0, spawns: [{ type: 'zmija', side: 'R', y: 185, sub: true }, { type: 'thin', side: 'L', y: 200, delay: 40 }] }] },
      { lock: 3200, groups: [
        { when: 0, spawns: [{ type: 'raptor', side: 'R', y: 175 }, { type: 'gunner', side: 'L', y: 205, delay: 20 }, { type: 'brute', side: 'R', y: 190, delay: 40 }, { type: 'bomber', side: 'L', y: 172, delay: 60 }] }] },
      { lock: LEN - W, boss: true, groups: [{ when: 0, spawns: [{ type: 'baron', side: 'R', y: 185 }] }] }
    ],
    PROPS: [
      { x: 200, y: 200, kind: 'crate', drop: 'meat' }, { x: 560, y: 172, kind: 'barrel', drop: 'rifle' },
      { x: 960, y: 205, kind: 'crate', drop: 'fruit' }, { x: 1380, y: 175, kind: 'barrel', drop: 'meat' },
      { x: 1700, y: 205, kind: 'crate', drop: 'grenade' }, { x: 2150, y: 175, kind: 'barrel', drop: 'meat' },
      { x: 2650, y: 205, kind: 'crate', drop: 'meat' }, { x: 3100, y: 175, kind: 'barrel', drop: 'rifle' },
      { x: 3420, y: 205, kind: 'crate', drop: 'meat' }, { x: 3550, y: 172, kind: 'barrel', drop: 'gem' }
    ],
    PICKUPS: [{ x: 640, y: 200, type: 'coin' }, { x: 1600, y: 180, type: 'coin' }, { x: 2400, y: 200, type: 'gem' }, { x: 3300, y: 185, type: 'coin' }]
  });
})();
