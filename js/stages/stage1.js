/* Etap 1 — „Zielona Rdza”: ruiny wioski, droga przez dżunglę, obóz kłusowników, kamieniołom. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 3600;

  window.STAGES[0] = S.makeStage({
    name: 'ETAP 1 — ZIELONA RDZA', sub: 'DŻUNGLA ZAPOMNIANEJ AUTOSTRADY',
    LEN, music: 'stage1', bossMusic: 'boss', diff: 1,
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#2a4f86', '#d98b58', '#f6cf88']);
      ctx.fillStyle = 'rgba(255,240,190,0.9)'; ctx.beginPath(); ctx.arc(300 - camX * 0.03, 70, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,190,0.25)'; ctx.beginPath(); ctx.arc(300 - camX * 0.03, 70, 28, 0, Math.PI * 2); ctx.fill();
      const vx = 420 - camX * 0.08;
      ctx.fillStyle = '#5a3a4a';
      ctx.beginPath(); ctx.moveTo(vx - 110, 130); ctx.lineTo(vx - 18, 62); ctx.lineTo(vx + 16, 62); ctx.lineTo(vx + 110, 130); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff7a2a'; ctx.fillRect(vx - 14, 60, 28, 3);
      ctx.fillStyle = 'rgba(255,120,40,0.7)';
      ctx.beginPath(); ctx.moveTo(vx - 4, 63); ctx.lineTo(vx - 12, 100); ctx.lineTo(vx - 6, 100); ctx.lineTo(vx + 2, 63); ctx.fill();
      for (let i = 0; i < 9; i++) {
        const k = ((t * 0.004 + i / 9) % 1);
        ctx.fillStyle = `rgba(70,60,70,${0.5 * (1 - k)})`;
        ctx.beginPath(); ctx.arc(vx + Math.sin(i * 2.1 + t * 0.01) * 6 + k * 40, 58 - k * 55, 6 + k * 16, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 3; i++) {
        const px = ((i * 150 + t * (0.35 + i * 0.1)) % (W + 300)) - 100 - (camX * 0.1) % 50;
        const py = 30 + i * 18 + Math.sin(t * 0.03 + i) * 6;
        const flap = Math.sin(t * 0.18 + i * 2) * 4;
        ctx.strokeStyle = '#3a2a3a'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px - 9, py - flap); ctx.lineTo(px, py); ctx.lineTo(px + 9, py - flap); ctx.stroke();
        ctx.fillStyle = '#3a2a3a'; ctx.fillRect(px - 1, py - 1, 6, 2);
      }
    },
    far(g, R, w) {
      S.ridge(g, R, w, '#7a6aa0', 95, 40, 22);
      S.ridge(g, R, w, '#5e5888', 115, 30, 16);
      g.fillStyle = '#4a4a74';
      for (let i = 0; i < 6; i++) { const x = R() * w, ww = 30 + R() * 50, h = 30 + R() * 30; g.fillRect(x, 135 - h, ww, h + 20); g.fillRect(x - 4, 135 - h, ww + 8, 4); }
    },
    mid(g, R, w) {
      g.fillStyle = '#244a3a'; g.fillRect(0, 128, w, H - 128);
      for (let x = 0; x < w; x += 26 + R() * 20) S.canopy(g, R, x, 120 + R() * 10, 50, 30, ['#1f4535', '#2a5a42', '#35704c']);
      for (let x = 10; x < w; x += 60 + R() * 80) S.palm(g, R, x, 150, 50 + R() * 30, (R() - 0.5) * 1.2, true);
    },
    near(g, R, nw) {
      for (let x = -20; x < 1000; x += 40 + R() * 40) S.fern(g, R, x, FLOOR_TOP, 18 + R() * 10, ['#2f6a2a', '#3e8a34']);
      S.palm(g, R, 40, FLOOR_TOP, 90, 0.8, false);
      S.hut(g, R, 210, FLOOR_TOP - 4);
      S.palm(g, R, 330, FLOOR_TOP, 105, -0.6, false);
      S.sign(g, 420, FLOOR_TOP, 'HWY 7', '#3a6a9a');
      S.hut(g, R, 560, FLOOR_TOP - 2);
      S.palm(g, R, 690, FLOOR_TOP, 80, 0.5, false);
      S.hut(g, R, 820, FLOOR_TOP - 4);
      S.palm(g, R, 940, FLOOR_TOP, 95, -0.9, false);
      g.fillStyle = '#183a24'; g.fillRect(1000, 40, 900, FLOOR_TOP - 40);
      S.canopy(g, R, 1450, 60, 960, 70, ['#16341f', '#1f4a2b', '#2b5e35']);
      for (let x = 1020; x < 1900; x += 90 + R() * 60) S.bigTree(g, R, x, FLOOR_TOP, 90 + R() * 30);
      for (let x = 1000; x < 1900; x += 20 + R() * 20) S.fern(g, R, x, FLOOR_TOP + 1, 14 + R() * 12, ['#2a6a2e', '#3c8a3a', '#4fa046']);
      S.car(g, 1360, FLOOR_TOP - 2);
      S.sign(g, 1560, FLOOR_TOP, 'MOTEL', '#a03a3a');
      S.sign(g, 1800, FLOOR_TOP, '12 MI', '#3a7a4a');
      S.fence(g, 1900, 2800, FLOOR_TOP);
      for (let x = 1910; x < 2800; x += 70 + R() * 40) S.palm(g, R, x, FLOOR_TOP - 30, 70 + R() * 20, (R() - 0.5), true);
      S.tent(g, 2000, FLOOR_TOP - 1, '#7a8a4a');
      S.cage(g, 2140, FLOOR_TOP - 1);
      S.crates(g, 2250, FLOOR_TOP - 1);
      S.tent(g, 2390, FLOOR_TOP - 1, '#8a7a5a');
      S.cage(g, 2540, FLOOR_TOP - 1);
      S.tent(g, 2680, FLOOR_TOP - 1, '#6a7a5a');
      S.sign(g, 2780, FLOOR_TOP, 'NO ENTRY', '#8a3a2a');
      S.cliff(g, R, 2800, nw, 28, FLOOR_TOP + 2);
      S.scaffold(g, 2900, FLOOR_TOP, 96);
      S.scaffold(g, 3300, FLOOR_TOP, 72);
      S.sign(g, 3100, FLOOR_TOP, 'DANGER', '#c0902a');
      S.crates(g, 3460, FLOOR_TOP - 1);
      S.ground(g, R, 0, 1000, '#b08a58', '#9a7648');
      S.ground(g, R, 1000, 1900, '#5c5a58', '#4c4a48');
      S.ground(g, R, 1900, 2800, '#8a6a42', '#765832');
      S.ground(g, R, 2800, nw, '#b8a084', '#a08a70');
      for (let x = 0; x < 1000; x += 10) { g.fillStyle = '#8b6238'; g.fillRect(x, 168, 8, 3); g.fillStyle = '#6b4a2e'; g.fillRect(x, 171, 8, 1); }
      for (let x = 1000; x < 1900; x += 36) { g.fillStyle = '#d8c060'; g.fillRect(x, 186, 18, 2); }
      g.strokeStyle = '#2e2c2a'; g.lineWidth = 1;
      for (let i = 0; i < 40; i++) { const x = 1000 + R() * 900, y = FLOOR_TOP + 6 + R() * 60; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + R() * 8, y + (R() - 0.5) * 6); g.lineTo(x + 12 + R() * 10, y + (R() - 0.5) * 8); g.stroke(); }
      for (let i = 0; i < 30; i++) S.fern(g, R, 1000 + R() * 900, FLOOR_TOP + 4 + R() * 60, 5, ['#3c7a34', '#4a9a40']);
      for (let i = 0; i < 12; i++) {
        const mx = 1900 + R() * 900, my = FLOOR_TOP + 10 + R() * 55, mw = 10 + R() * 14, mh = 3 + R() * 2;
        g.fillStyle = '#5e4428'; g.beginPath(); g.ellipse(mx, my, mw, mh, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#7a8a9a'; g.fillRect(mx - mw * 0.4, my - mh * 0.4, mw * 0.5, 1);
      }
      g.fillStyle = 'rgba(50,35,20,0.4)';
      for (let x = 1900; x < 2800; x += 6) { g.fillRect(x, 176, 4, 2); g.fillRect(x, 196, 4, 2); }
      for (let i = 0; i < 70; i++) S.blob(g, 2800 + R() * (nw - 2800), FLOOR_TOP + 4 + R() * 60, 1 + R() * 3, R() < 0.5 ? '#8a7258' : '#cbb89a');
      g.fillStyle = '#5a4a3a'; for (let x = 2820; x < nw; x += 10) g.fillRect(x, 158, 6, 8);
      g.fillStyle = '#8a929a'; g.fillRect(2820, 159, nw - 2820, 2); g.fillRect(2820, 164, nw - 2820, 2);
    },
    front(g, R, fw) {
      for (let x = 60; x < fw; x += 160 + R() * 220) {
        if (R() < 0.35) { g.fillStyle = OUT; g.fillRect(x - 7, 120, 14, 110); g.fillStyle = '#3b2a1e'; g.fillRect(x - 6, 120, 12, 110); S.canopy(g, R, x, 110, 60, 30, ['#10261a', '#183a24', '#21482c']); }
        else S.fern(g, R, x, H + 4, 26 + R() * 14, ['#173a1f', '#21502a', '#2b6233']);
      }
    },
    anim(ctx, camX, t) {
      const fx = 2310 - camX, fy = FLOOR_TOP + 8;
      if (fx > -30 && fx < W + 30) {
        ctx.fillStyle = '#3a2a1a'; ctx.fillRect(fx - 10, fy - 2, 20, 3);
        for (let i = 0; i < 6; i++) {
          const k = (t * 0.06 + i / 6) % 1;
          ctx.fillStyle = k < 0.4 ? '#ffe36a' : (k < 0.7 ? '#ff9a2a' : 'rgba(200,60,20,0.6)');
          ctx.beginPath(); ctx.arc(fx + Math.sin(i * 3 + t * 0.2) * 4, fy - 3 - k * 16, 4 * (1 - k) + 1, 0, Math.PI * 2); ctx.fill();
        }
      }
    },
    WAVES: [
      { lock: 360, groups: [
        { when: 0, spawns: [{ type: 'grunt', side: 'R', y: 170 }, { type: 'grunt', side: 'R', y: 200, delay: 40 }, { type: 'grunt', side: 'L', y: 185, delay: 90 }] },
        { when: 1, spawns: [{ type: 'thin', side: 'R', y: 180 }] }] },
      { lock: 1060, groups: [
        { when: 0, spawns: [{ type: 'raptor', side: 'R', y: 175 }, { type: 'thin', side: 'L', y: 200, delay: 30 }] },
        { when: 1, spawns: [{ type: 'raptor', side: 'L', y: 190 }, { type: 'grunt', side: 'R', y: 165, delay: 20 }, { type: 'grunt', side: 'R', y: 205, delay: 50 }] }] },
      { lock: 1560, groups: [
        { when: 0, spawns: [{ type: 'thin', side: 'R', y: 165 }, { type: 'thin', side: 'R', y: 205, delay: 25 }, { type: 'grunt', side: 'L', y: 185, delay: 60 }] }] },
      { lock: 2060, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'R', y: 185 }, { type: 'grunt', side: 'L', y: 170, delay: 40 }] },
        { when: 1, spawns: [{ type: 'grunt', side: 'R', y: 200 }, { type: 'thin', side: 'L', y: 165, delay: 30 }, { type: 'raptor', side: 'R', y: 185, delay: 80 }] }] },
      { lock: 2470, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'L', y: 200 }, { type: 'brute', side: 'R', y: 170, delay: 40 }] },
        { when: 1, spawns: [{ type: 'grunt', side: 'R', y: 185 }, { type: 'thin', side: 'R', y: 205, delay: 20 }] }] },
      { lock: LEN - W, boss: true, groups: [{ when: 0, spawns: [{ type: 'boss', side: 'R', y: 185 }] }] }
    ],
    PROPS: [
      { x: 150, y: 175, kind: 'barrel', drop: 'dynamite' }, { x: 470, y: 200, kind: 'barrel', drop: 'pipe' },
      { x: 760, y: 168, kind: 'crate', drop: 'meat' }, { x: 1250, y: 205, kind: 'barrel', drop: 'gem' },
      { x: 1480, y: 172, kind: 'crate', drop: 'meat' }, { x: 1980, y: 200, kind: 'crate', drop: 'rifle' },
      { x: 2230, y: 170, kind: 'barrel', drop: 'fruit' }, { x: 2620, y: 205, kind: 'barrel', drop: 'meat' },
      { x: 2950, y: 175, kind: 'crate', drop: 'meat' }, { x: 3120, y: 205, kind: 'barrel', drop: 'gem' }
    ],
    PICKUPS: [{ x: 620, y: 190, type: 'coin' }, { x: 1700, y: 180, type: 'coin' }, { x: 2850, y: 200, type: 'coin' }]
  });
})();
