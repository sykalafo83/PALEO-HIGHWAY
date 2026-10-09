/* Etap 4 — „Ogniste Szyby”: zbocze wulkanu, wejście do kopalni, most nad rzeką lawy, kaldera. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 3600;
  const CRACKS = [];
  (function () { const R = S.rng(99); for (let i = 0; i < 40; i++) CRACKS.push([R() * LEN, FLOOR_TOP + 8 + R() * 56, 8 + R() * 18, R() * 6]); })();

  window.STAGES[3] = S.makeStage({
    name: 'ETAP 4 — OGNISTE SZYBY', sub: 'W SERCU GÓRY ŚPI STARY KIEŁ',
    LEN, music: 'stage4', bossMusic: 'beast', diff: 1.38,
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#140606', '#4a1410', '#b8481e']);
      for (let i = 0; i < 6; i++) {
        const x = ((i * 90 - camX * 0.04 + t * 0.12) % (W + 200)) - 100;
        ctx.fillStyle = 'rgba(30,20,20,0.35)'; ctx.beginPath(); ctx.ellipse(x, 24 + i * 10, 90, 12, 0, 0, Math.PI * 2); ctx.fill();
      }
    },
    far(g, R, w) {
      for (let x = 40; x < w; x += 180 + R() * 120) {
        const h = 60 + R() * 30;
        g.fillStyle = '#2a1414'; g.beginPath(); g.moveTo(x - 90, 140); g.lineTo(x - 12, 140 - h); g.lineTo(x + 12, 140 - h); g.lineTo(x + 90, 140); g.fill();
        g.fillStyle = '#ff6a1a'; g.fillRect(x - 10, 140 - h - 1, 20, 3);
        g.fillStyle = 'rgba(255,110,30,0.6)'; g.beginPath(); g.moveTo(x - 3, 140 - h); g.lineTo(x - 14 + R() * 10, 140); g.lineTo(x - 6 + R() * 10, 140); g.lineTo(x + 3, 140 - h); g.fill();
      }
      S.ridge(g, R, w, '#1e0e0e', 140, 14, 16);
    },
    farAnim(ctx, camX, t) {
      const off = camX * 0.2;
      for (let i = 0; i < 18; i++) {
        const k = (t * 0.012 + i / 18) % 1, base = 40 + (i % 4) * 230 - off % 920;
        const x = ((base % (W + 200)) + W + 200) % (W + 200) - 100;
        ctx.fillStyle = `rgba(255,${120 + (i * 13) % 80},40,${1 - k})`;
        ctx.fillRect(x + Math.sin(i * 7) * k * 30, 70 - k * 50 + k * k * 60, 2, 2);
      }
    },
    mid(g, R, w) {
      S.basalt(g, R, 0, w, 70, 152);
      g.fillStyle = 'rgba(255,90,20,0.18)'; g.fillRect(0, 140, w, 12);
    },
    near(g, R, nw) {
      // 1. zbocze z kryształami
      S.cliff(g, R, 0, 900, 60, FLOOR_TOP + 2, ['#3a2a2a', '#4a3030', '#3a2424', '#4a2a28']);
      for (let x = 30; x < 900; x += 60 + R() * 60) S.crystal(g, x, FLOOR_TOP, 1 + R() * 0.8, R() < 0.5 ? '#ff7a3a' : '#e0c040');
      S.sign(g, 700, FLOOR_TOP, 'MINE 2KM', '#7a5a2a');
      // 2. kopalnia
      g.fillStyle = '#1a1010'; g.fillRect(900, 0, 900, FLOOR_TOP);
      S.cliff(g, R, 900, 1800, 10, FLOOR_TOP + 2, ['#2a1e1e', '#342424', '#2a1c1c']);
      S.mineEntrance(g, 1050, FLOOR_TOP);
      for (let x = 1150; x < 1800; x += 110) { S.rect(g, x, 40, 8, FLOOR_TOP - 40, '#6b4a2e'); S.rect(g, x - 20, 36, 48, 8, '#7b5a36'); g.fillStyle = '#ffd040'; g.fillRect(x + 1, 50, 6, 4); }
      S.minecart(g, 1300, FLOOR_TOP - 1); S.minecart(g, 1600, FLOOR_TOP - 1);
      S.crates(g, 1450, FLOOR_TOP - 1, '#6a5a3a');
      // 3. most nad lawą
      g.fillStyle = '#ff5a14'; g.fillRect(1800, 100, 1000, FLOOR_TOP - 100);
      g.fillStyle = '#ffb030'; for (let i = 0; i < 40; i++) g.fillRect(1800 + R() * 1000, 104 + R() * 40, 8 + R() * 16, 2);
      S.basalt(g, R, 1800, 2800, 60, 104);
      for (let x = 1800; x < 2800; x += 50) S.rect(g, x, 120, 6, FLOOR_TOP - 120, '#3a2a20');
      S.rect(g, 1800, 118, 1000, 4, '#5a3a24');
      // 4. kaldera
      S.cliff(g, R, 2800, nw, 30, FLOOR_TOP + 2, ['#3a2220', '#4a2a24', '#3a2020', '#2a1818']);
      for (let x = 2850; x < nw; x += 70 + R() * 50) S.crystal(g, x, FLOOR_TOP, 1.4 + R(), '#ff9a3a');
      // kości olbrzyma
      g.strokeStyle = '#d8ccb0'; g.lineWidth = 3;
      for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(3150, FLOOR_TOP - 4, 14 + i * 7, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); }
      // podłoże
      S.ground(g, R, 0, 900, '#3a2a28', '#2e2220');
      S.ground(g, R, 900, 1800, '#2e2626', '#241c1c');
      S.ground(g, R, 1800, 2800, '#5a3e2a', '#4a3020');
      S.ground(g, R, 2800, nw, '#3a2624', '#2c1c1a');
      g.fillStyle = '#4a4a52'; for (let x = 900; x < 1800; x += 10) g.fillRect(x, 160, 6, 6);
      g.fillStyle = '#8a8a92'; g.fillRect(900, 160, 900, 2); g.fillRect(900, 165, 900, 2);
      for (let x = 1800; x < 2800; x += 9) { g.fillStyle = x % 18 ? '#6a4a30' : '#5a3a24'; g.fillRect(x, FLOOR_TOP + 2, 8, H - FLOOR_TOP); }
      CRACKS.forEach(([x, y, w]) => { if (x > 1800 && x < 2800) return; g.fillStyle = '#1a0a08'; g.fillRect(x, y, w, 2); });
    },
    front(g, R, fw) {
      for (let x = 60; x < fw; x += 180 + R() * 200) {
        g.fillStyle = OUT; g.beginPath(); g.moveTo(x - 30, H); g.lineTo(x - 10, 170 + R() * 20); g.lineTo(x + 14, 180); g.lineTo(x + 30, H); g.fill();
        g.fillStyle = '#2a1818'; g.beginPath(); g.moveTo(x - 27, H); g.lineTo(x - 9, 174); g.lineTo(x + 12, 184); g.lineTo(x + 27, H); g.fill();
      }
    },
    anim(ctx, camX, t) {
      const pulse = 0.5 + Math.sin(t * 0.06) * 0.3;
      CRACKS.forEach(([x, y, w, ph]) => {
        if (x > 1800 && x < 2800) return;
        const sx = x - camX; if (sx < -30 || sx > W + 10) return;
        ctx.fillStyle = `rgba(255,${110 + Math.sin(t * 0.05 + ph) * 40},30,${pulse})`; ctx.fillRect(sx, y, w, 1);
      });
      // lawa pod mostem
      const lx0 = 1800 - camX, lx1 = 2800 - camX;
      if (lx1 > 0 && lx0 < W) {
        for (let i = 0; i < 14; i++) {
          const x = lx0 + ((i * 73 + t * 0.6) % 1000);
          if (x < Math.max(0, lx0) || x > Math.min(W, lx1)) continue;
          ctx.fillStyle = i % 2 ? '#ffd040' : '#ff8a2a'; ctx.fillRect(x, 108 + (i * 11) % 30, 10, 2);
        }
      }
    },
    overlay(ctx, camX, t) {
      for (let i = 0; i < 26; i++) {
        const x = ((i * 59 - camX * 0.4 + Math.sin(t * 0.02 + i) * 20) % (W + 40) + W + 40) % (W + 40) - 20;
        const y = (i * 41 + t * (0.4 + (i % 3) * 0.2)) % (H + 10);
        ctx.fillStyle = i % 3 ? 'rgba(255,140,40,0.85)' : 'rgba(200,200,200,0.4)';
        ctx.fillRect(x, y, i % 4 ? 1 : 2, i % 4 ? 1 : 2);
      }
      ctx.fillStyle = 'rgba(255,80,20,0.06)'; ctx.fillRect(0, 0, W, H);
    },
    WAVES: [
      { lock: 300, groups: [
        { when: 0, spawns: [{ type: 'raptor', side: 'R', y: 180 }, { type: 'raptor', side: 'L', y: 200, delay: 40 }] },
        { when: 0, spawns: [{ type: 'grunt', side: 'R', y: 170 }, { type: 'bomber', side: 'R', y: 205, delay: 20 }, { type: 'grunt', side: 'L', y: 190, delay: 40 }] }] },
      { lock: 820, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'R', y: 180 }, { type: 'brute', side: 'L', y: 200, delay: 30 }] },
        { when: 1, spawns: [{ type: 'thin', side: 'R', y: 170 }, { type: 'gunner', side: 'R', y: 205, delay: 30 }] }] },
      { lock: 1250, groups: [
        { when: 0, spawns: [{ type: 'pachy', side: 'R', y: 175 }, { type: 'pachy', side: 'L', y: 200, delay: 50 }] },
        { when: 1, spawns: [{ type: 'grunt', side: 'R', y: 185 }, { type: 'grunt', side: 'L', y: 205, delay: 20 }, { type: 'bomber', side: 'R', y: 170, delay: 40 }] }] },
      { lock: 1900, groups: [
        { when: 0, spawns: [{ type: 'gunner', side: 'R', y: 170 }, { type: 'gunner', side: 'L', y: 205, delay: 20 }, { type: 'thin', side: 'R', y: 190, delay: 40 }] },
        { when: 1, spawns: [{ type: 'brute', side: 'R', y: 185 }, { type: 'raptor', side: 'L', y: 175, delay: 40 }] }] },
      { lock: 2400, groups: [
        { when: 0, spawns: [{ type: 'raptor', side: 'R', y: 170 }, { type: 'raptor', side: 'R', y: 205, delay: 20 }, { type: 'pachy', side: 'L', y: 188, delay: 50 }] },
        { when: 1, spawns: [{ type: 'grunt', side: 'R', y: 180 }, { type: 'bomber', side: 'L', y: 200, delay: 20 }, { type: 'brute', side: 'R', y: 195, delay: 50 }] }] },
      { lock: LEN - W, boss: true, groups: [{ when: 0, spawns: [{ type: 'rex', side: 'R', y: 188 }] }] }
    ],
    PROPS: [
      { x: 200, y: 200, kind: 'barrel', drop: 'meat' }, { x: 560, y: 175, kind: 'crate', drop: 'pipe' },
      { x: 1000, y: 200, kind: 'crate', drop: 'meat' }, { x: 1380, y: 172, kind: 'barrel', drop: 'grenade' },
      { x: 1760, y: 205, kind: 'crate', drop: 'fruit' }, { x: 2150, y: 180, kind: 'barrel', drop: 'meat' },
      { x: 2650, y: 200, kind: 'crate', drop: 'gem' }, { x: 2950, y: 175, kind: 'barrel', drop: 'meat' },
      { x: 3120, y: 205, kind: 'crate', drop: 'rifle' }
    ],
    PICKUPS: [{ x: 700, y: 195, type: 'coin' }, { x: 1600, y: 205, type: 'coin' }, { x: 2300, y: 170, type: 'gem' }]
  });
})();
