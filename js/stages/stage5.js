/* Etap 5 — „Port Przemytników”: nabrzeże rybackie, plac kontenerów, magazyny, molo przy statku. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 3800;

  window.STAGES[4] = S.makeStage({
    name: 'ETAP 5 — PORT PRZEMYTNIKÓW', sub: 'ŁADUNEK NIE MOŻE ODPŁYNĄĆ',
    LEN, music: 'stage5', bossMusic: 'boss', diff: 1.5, farP: 0.12,
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#2a2058', '#c05a6a', '#f8b868']);
      ctx.fillStyle = '#ffe8a0'; ctx.beginPath(); ctx.arc(240 - camX * 0.02, 108, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,220,150,0.25)'; ctx.beginPath(); ctx.arc(240 - camX * 0.02, 108, 40, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 5; i++) {
        const x = ((i * 110 - camX * 0.03 + t * 0.05) % (W + 160)) - 80;
        ctx.fillStyle = 'rgba(255,170,150,0.4)'; ctx.fillRect(x, 50 + i * 11, 70 + i * 8, 3);
      }
    },
    far(g, R, w) {
      g.fillStyle = '#3a4a7a'; g.fillRect(0, 118, w, H - 118);
      g.fillStyle = '#4a5a8a'; for (let i = 0; i < w / 6; i++) g.fillRect(R() * w, 120 + R() * 30, 6 + R() * 10, 1);
      for (let x = 60; x < w; x += 150 + R() * 150) {
        const s = 0.6 + R() * 0.6;
        g.fillStyle = '#2a2a4a'; g.fillRect(x, 112 - 6 * s, 50 * s, 6 * s); g.fillRect(x + 10 * s, 112 - 14 * s, 18 * s, 8 * s); g.fillRect(x + 30 * s, 112 - 22 * s, 3, 16 * s);
      }
      // latarnia morska
      g.fillStyle = '#2a2a4a'; g.fillRect(w * 0.3, 70, 10, 48); g.fillRect(w * 0.3 - 2, 66, 14, 6);
    },
    farAnim(ctx, camX, t) {
      for (let i = 0; i < 30; i++) {
        const x = (i * 37 + Math.sin(t * 0.02 + i) * 6) % W, y = 122 + (i * 13) % 26;
        if ((t + i * 11) % 60 < 40) { ctx.fillStyle = 'rgba(255,220,170,0.6)'; ctx.fillRect(x, y, 3 + (i % 3), 1); }
      }
    },
    mid(g, R, w) {
      for (let x = 0; x < w; x += 70 + R() * 60) {
        g.fillStyle = '#2e2a44'; g.fillRect(x, 150 - 30 - R() * 20, 50 + R() * 30, 60);
      }
      g.fillStyle = '#26223a'; g.fillRect(0, 140, w, 14);
      for (let x = 30; x < w; x += 260) { g.strokeStyle = '#26223a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 150); g.lineTo(x, 80); g.lineTo(x + 70, 80); g.stroke(); }
    },
    near(g, R, nw) {
      // 1. nabrzeże rybackie
      for (let x = 0; x < 1000; x += 40) S.rect(g, x, FLOOR_TOP - 22, 6, 22, '#4a3a2a');
      S.shack(g, R, 180, FLOOR_TOP - 4, '#5a7a9a');
      S.shack(g, R, 520, FLOOR_TOP - 4, '#9a6a5a');
      S.crates(g, 360, FLOOR_TOP - 1, '#6a7a5a');
      S.sign(g, 760, FLOOR_TOP, 'FISH', '#3a6a9a');
      // sieci
      g.strokeStyle = 'rgba(220,210,180,0.6)'; g.lineWidth = 0.8;
      for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(820 + i * 8, FLOOR_TOP - 50); g.lineTo(830 + i * 8, FLOOR_TOP - 10); g.stroke(); g.beginPath(); g.moveTo(820, FLOOR_TOP - 50 + i * 4); g.lineTo(900, FLOOR_TOP - 48 + i * 4); g.stroke(); }
      // 2. kontenery
      const cols = ['#a83a2a', '#2a6aa0', '#3a8a4a', '#c08a2a', '#6a4a8a', '#8a8a8a'];
      for (let x = 1000; x < 2000; x += 92) {
        S.container(g, x, FLOOR_TOP, 88, 34, cols[Math.floor(R() * cols.length)], R() < 0.5 ? 'PALEO' : null);
        if (R() < 0.7) S.container(g, x + 6, FLOOR_TOP - 36, 80, 32, cols[Math.floor(R() * cols.length)]);
        if (R() < 0.3) S.container(g, x + 10, FLOOR_TOP - 70, 74, 32, cols[Math.floor(R() * cols.length)]);
      }
      S.crane(g, 1250, FLOOR_TOP - 40, 110, '#d0902a');
      S.crane(g, 1760, FLOOR_TOP - 40, 100, '#c0402a');
      // 3. magazyny
      S.warehouse(g, 2000, FLOOR_TOP, 200, 90, '#6a5a4a');
      S.warehouse(g, 2220, FLOOR_TOP, 220, 100, '#4a5a6a');
      S.warehouse(g, 2460, FLOOR_TOP, 200, 86, '#6a4a3a');
      S.warehouse(g, 2680, FLOOR_TOP, 220, 96, '#5a6a5a');
      // 4. molo przy statku
      g.fillStyle = '#3a4a7a'; g.fillRect(2900, 90, nw - 2900, FLOOR_TOP - 90);
      S.rect(g, 3000, 40, nw - 3000, 100, '#2a2a34');
      g.fillStyle = '#8a2a22'; g.fillRect(3000, 110, nw - 3000, 30);
      g.fillStyle = '#e8e0d0'; g.fillRect(3000, 106, nw - 3000, 3);
      for (let x = 3020; x < nw; x += 26) { S.blob(g, x, 70, 5, '#1a1a22'); S.blob(g, x, 70, 4, '#d8c070'); }
      S.rect(g, 3200, 0, 120, 42, '#3a3a44'); S.rect(g, 3220, -10, 20, 30, '#2a2a32');
      g.fillStyle = '#f0f0f0'; g.font = 'bold 14px monospace'; g.textAlign = 'left'; g.fillText('KRAKEN', 3060, 132);
      for (let x = 2920; x < nw; x += 70) S.rect(g, x, FLOOR_TOP - 12, 8, 12, '#2a2a2a');
      g.strokeStyle = '#c0a070'; g.lineWidth = 1.5;
      for (let x = 2920; x < nw; x += 140) { g.beginPath(); g.moveTo(x + 4, FLOOR_TOP - 10); g.quadraticCurveTo(x + 40, FLOOR_TOP - 40, x + 80, 110); g.stroke(); }
      // podłoże: deski
      S.ground(g, R, 0, 1000, '#8a6a48', '#7a5a3a');
      S.ground(g, R, 1000, 2000, '#5a5a5e', '#4a4a4e');
      S.ground(g, R, 2000, 2900, '#6a6460', '#5a5450');
      S.ground(g, R, 2900, nw, '#8a6a48', '#7a5a3a');
      [[0, 1000], [2900, nw]].forEach(([a, b]) => {
        g.fillStyle = 'rgba(0,0,0,0.22)';
        for (let y = FLOOR_TOP + 9; y < H; y += 9) g.fillRect(a, y, b - a, 1);
        for (let i = 0; i < (b - a) / 30; i++) g.fillRect(a + R() * (b - a), FLOOR_TOP + 2 + Math.floor(R() * 7) * 9, 1, 9);
      });
      g.fillStyle = '#c8b040'; for (let x = 1000; x < 2900; x += 30) g.fillRect(x, 200, 16, 2);
    },
    front(g, R, fw) {
      for (let x = 80; x < fw; x += 170 + R() * 200) {
        if (R() < 0.5) { S.rect(g, x, 196, 14, 30, '#2a2a2a'); S.rect(g, x - 3, 194, 20, 5, '#3a3a3a'); }
        else { g.strokeStyle = '#a08a60'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, 214, 18, 6, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(x, 210, 12, 4, 0, 0, Math.PI * 2); g.stroke(); }
      }
    },
    overlay(ctx, camX, t) {
      for (let i = 0; i < 4; i++) {
        const x = ((i * 130 + t * (0.6 + i * 0.15) - camX * 0.3) % (W + 80) + W + 80) % (W + 80) - 40;
        const y = 34 + i * 12 + Math.sin(t * 0.05 + i) * 5, f = Math.sin(t * 0.2 + i * 2) * 3;
        ctx.strokeStyle = '#f0f0f0'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x - 6, y - f); ctx.quadraticCurveTo(x - 3, y - 3, x, y); ctx.quadraticCurveTo(x + 3, y - 3, x + 6, y - f); ctx.stroke();
      }
    },
    WAVES: [
      { lock: 300, groups: [
        { when: 0, spawns: [{ type: 'grunt', side: 'R', y: 175 }, { type: 'grunt', side: 'R', y: 205, delay: 20 }, { type: 'gunner', side: 'L', y: 190, delay: 50 }] },
        { when: 1, spawns: [{ type: 'brute', side: 'R', y: 185 }, { type: 'thin', side: 'L', y: 170, delay: 30 }] }] },
      { lock: 820, groups: [
        { when: 0, spawns: [{ type: 'bomber', side: 'R', y: 170 }, { type: 'bomber', side: 'L', y: 205, delay: 30 }, { type: 'thin', side: 'R', y: 190, delay: 50 }] },
        { when: 1, spawns: [{ type: 'gunner', side: 'R', y: 180 }, { type: 'grunt', side: 'R', y: 200, delay: 20 }] }] },
      { lock: 1300, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'L', y: 175 }, { type: 'brute', side: 'R', y: 205, delay: 30 }, { type: 'gunner', side: 'R', y: 185, delay: 60 }] },
        { when: 1, spawns: [{ type: 'raptor', side: 'R', y: 180 }, { type: 'raptor', side: 'L', y: 195, delay: 30 }] }] },
      { lock: 1800, groups: [
        { when: 0, spawns: [{ type: 'thin', side: 'R', y: 170 }, { type: 'thin', side: 'L', y: 200, delay: 10 }, { type: 'gunner', side: 'R', y: 205, delay: 30 }, { type: 'bomber', side: 'L', y: 175, delay: 60 }] }] },
      { lock: 2300, groups: [
        { when: 0, spawns: [{ type: 'grunt', side: 'R', y: 175 }, { type: 'grunt', side: 'L', y: 205, delay: 20 }, { type: 'brute', side: 'R', y: 190, delay: 40 }] },
        { when: 1, spawns: [{ type: 'pachy', side: 'R', y: 180 }, { type: 'gunner', side: 'L', y: 200, delay: 30 }, { type: 'gunner', side: 'R', y: 170, delay: 50 }] }] },
      { lock: 2950, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'R', y: 180 }, { type: 'thin', side: 'L', y: 205, delay: 20 }, { type: 'bomber', side: 'R', y: 170, delay: 40 }] }] },
      { lock: LEN - W, boss: true, groups: [{ when: 0, spawns: [{ type: 'szpon', side: 'R', y: 185 }] }] }
    ],
    PROPS: [
      { x: 240, y: 200, kind: 'barrel', drop: 'meat' }, { x: 640, y: 172, kind: 'crate', drop: 'rifle' },
      { x: 1100, y: 205, kind: 'crate', drop: 'dynamite' }, { x: 1520, y: 175, kind: 'barrel', drop: 'pipe' },
      { x: 2080, y: 200, kind: 'crate', drop: 'meat' }, { x: 2560, y: 172, kind: 'barrel', drop: 'meat' },
      { x: 3050, y: 205, kind: 'crate', drop: 'gem' }, { x: 3320, y: 178, kind: 'barrel', drop: 'meat' }
    ],
    PICKUPS: [{ x: 880, y: 200, type: 'coin' }, { x: 1700, y: 185, type: 'coin' }, { x: 2800, y: 195, type: 'gem' }]
  });
})();
