/* Etap 2 — „Smolne Bagna”: osada na palach, pole naftowe, kładki nad bagnem, ruiny rafinerii. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 3800;
  const TAR = [[1180, 172, 22], [1420, 200, 18], [1650, 180, 26], [1880, 205, 16]];

  window.STAGES[1] = S.makeStage({
    name: 'ETAP 2 — SMOLNE BAGNA', sub: 'TAM, GDZIE ZIEMIA PŁACZE ROPĄ',
    LEN, music: 'stage2', bossMusic: 'boss', diff: 1.12,
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#1e2a2e', '#5a6a4a', '#c8b878']);
      ctx.fillStyle = 'rgba(240,220,160,0.55)'; ctx.beginPath(); ctx.arc(90 - camX * 0.02, 96, 22, 0, Math.PI * 2); ctx.fill();
      // smog
      for (let i = 0; i < 5; i++) {
        const x = ((i * 120 - camX * 0.05 + t * 0.08) % (W + 200)) - 100;
        ctx.fillStyle = 'rgba(60,60,50,0.25)'; ctx.beginPath(); ctx.ellipse(x, 40 + i * 9, 80, 10, 0, 0, Math.PI * 2); ctx.fill();
      }
    },
    far(g, R, w) {
      S.ridge(g, R, w, '#3a4a40', 112, 22, 30);
      for (let x = 30; x < w; x += 70 + R() * 90) S.derrick(g, x, 128, 40 + R() * 25, '#2a3230');
      S.ridge(g, R, w, '#2e3a32', 130, 10, 20);
    },
    mid(g, R, w) {
      g.fillStyle = '#2a3a2e'; g.fillRect(0, 132, w, H - 132);
      g.fillStyle = '#3a4a3e'; g.fillRect(0, 140, w, 3);
      for (let x = 10; x < w; x += 50 + R() * 50) S.deadTree(g, R, x, 146, 60 + R() * 40, '#262620');
      for (let x = 0; x < w; x += 18) S.reeds(g, R, x, 150, 2, '#4a5a2a');
    },
    near(g, R, nw) {
      // 1. osada na palach
      g.fillStyle = '#3a4a3a'; g.fillRect(0, FLOOR_TOP - 10, 1000, 10);
      S.shack(g, R, 160, FLOOR_TOP - 6, '#7a8a8a');
      S.deadTree(g, R, 300, FLOOR_TOP, 110);
      S.shack(g, R, 470, FLOOR_TOP - 4, '#8a7a6a');
      S.sign(g, 600, FLOOR_TOP, 'BAIT', '#5a7a3a');
      S.shack(g, R, 760, FLOOR_TOP - 6, '#6a7a8a');
      S.deadTree(g, R, 920, FLOOR_TOP, 90);
      for (let x = 0; x < 1000; x += 24) S.reeds(g, R, x, FLOOR_TOP + 2, 3, '#5a6a2a');
      // 2. pole naftowe
      S.derrick(g, 1100, FLOOR_TOP, 120, '#5a4a40');
      S.pumpjack(g, 1300, FLOOR_TOP);
      S.pipeline(g, 1000, 2000, FLOOR_TOP - 30, '#7a5a3a');
      S.derrick(g, 1520, FLOOR_TOP, 100, '#5a4a40');
      S.pumpjack(g, 1740, FLOOR_TOP);
      S.sign(g, 1900, FLOOR_TOP, 'NO FIRE', '#a03a2a');
      // 3. kładki nad bagnem
      g.fillStyle = '#2a3a30'; g.fillRect(2000, FLOOR_TOP - 40, 900, 40);
      g.fillStyle = '#3a5040'; for (let i = 0; i < 30; i++) g.fillRect(2000 + R() * 900, FLOOR_TOP - 38 + R() * 36, 12 + R() * 20, 1);
      for (let x = 2010; x < 2900; x += 60 + R() * 40) S.deadTree(g, R, x, FLOOR_TOP - 10, 70 + R() * 40);
      S.boardwalk(g, 2000, 2900, FLOOR_TOP - 16, 20);
      S.shack(g, R, 2450, FLOOR_TOP - 18, '#5a6a5a');
      // 4. ruiny rafinerii
      g.fillStyle = '#3a3a3a'; g.fillRect(2900, 20, nw - 2900, FLOOR_TOP - 20);
      for (let x = 2920; x < nw; x += 120) {
        S.rect(g, x, 40, 60, FLOOR_TOP - 40, '#5a5048');
        g.fillStyle = '#8a4a22'; g.fillRect(x + 10, 60 + (x % 50), 20, 10); g.fillRect(x + 30, 100, 14, 20);
        g.fillStyle = '#4a4038'; for (let y = 50; y < FLOOR_TOP; y += 12) g.fillRect(x, y, 60, 1);
      }
      S.pipesWall(g, R, 2900, nw, 30);
      S.crates(g, 3250, FLOOR_TOP - 1, '#5a6a5a');
      S.sign(g, 3550, FLOOR_TOP, 'REFINERY', '#5a5a7a');
      // podłoże
      S.ground(g, R, 0, 1000, '#6a5a3a', '#544630');
      S.ground(g, R, 1000, 2000, '#4a4030', '#3a3226');
      S.ground(g, R, 2000, 2900, '#7a5a3a', '#6a4a2e');
      S.ground(g, R, 2900, nw, '#5a5652', '#4a4642');
      // deski kładki
      for (let x = 2000; x < 2900; x += 9) { g.fillStyle = x % 18 ? '#8a6a44' : '#7a5a38'; g.fillRect(x, FLOOR_TOP + 2, 8, H - FLOOR_TOP); }
      g.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 2000; x < 2900; x += 9) g.fillRect(x + 8, FLOOR_TOP + 2, 1, H - FLOOR_TOP);
      // kałuże smoły
      TAR.forEach(([x, y, r]) => {
        g.fillStyle = OUT; g.beginPath(); g.ellipse(x, y, r + 1, r * 0.3 + 1, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#100c0c'; g.beginPath(); g.ellipse(x, y, r, r * 0.3, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(120,140,180,0.35)'; g.fillRect(x - r * 0.5, y - r * 0.15, r * 0.6, 1);
      });
      // płyty betonowe rafinerii
      g.fillStyle = 'rgba(0,0,0,0.25)';
      for (let x = 2900; x < nw; x += 48) g.fillRect(x, FLOOR_TOP, 1, H - FLOOR_TOP);
      for (let y = FLOOR_TOP + 20; y < H; y += 22) g.fillRect(2900, y, nw - 2900, 1);
    },
    front(g, R, fw) {
      for (let x = 40; x < fw; x += 120 + R() * 180) {
        if (R() < 0.5) S.reeds(g, R, x, H + 2, 8, '#2a3a1a');
        else S.deadTree(g, R, x, H + 10, 60, '#1a1a14');
      }
    },
    anim(ctx, camX, t) {
      TAR.forEach(([x, y, r], i) => {
        const sx = x - camX; if (sx < -40 || sx > W + 40) return;
        const k = ((t * 0.02 + i * 0.37) % 1);
        ctx.strokeStyle = `rgba(80,80,90,${1 - k})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(sx + Math.sin(i * 5) * r * 0.4, y, 2 + k * 5, 1 + k * 1.5, 0, 0, Math.PI * 2); ctx.stroke();
      });
      // świetliki
      for (let i = 0; i < 10; i++) {
        const x = ((i * 97 + t * 0.2) % (W + 40)) - 20, y = 90 + Math.sin(t * 0.03 + i * 1.7) * 30 + (i % 3) * 12;
        if ((t + i * 17) % 90 < 60) { ctx.fillStyle = 'rgba(220,255,120,0.85)'; ctx.fillRect(x, y, 2, 2); }
      }
    },
    overlay(ctx, camX, t) {
      for (let i = 0; i < 4; i++) {
        const x = ((i * 160 - camX * 0.6 + t * 0.25) % (W + 260)) - 130;
        ctx.fillStyle = 'rgba(200,210,180,0.07)'; ctx.beginPath(); ctx.ellipse(x, 196 + i * 4, 120, 10, 0, 0, Math.PI * 2); ctx.fill();
      }
    },
    WAVES: [
      { lock: 300, groups: [
        { when: 0, spawns: [{ type: 'grunt', side: 'R', y: 175 }, { type: 'bomber', side: 'R', y: 200, delay: 40 }, { type: 'grunt', side: 'L', y: 190, delay: 70 }] },
        { when: 1, spawns: [{ type: 'thin', side: 'R', y: 170 }, { type: 'thin', side: 'L', y: 205, delay: 30 }] }] },
      { lock: 800, groups: [
        { when: 0, spawns: [{ type: 'pachy', side: 'R', y: 185 }, { type: 'grunt', side: 'L', y: 170, delay: 30 }] },
        { when: 1, spawns: [{ type: 'bomber', side: 'R', y: 205 }, { type: 'grunt', side: 'R', y: 170, delay: 30 }] }] },
      { lock: 1300, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'R', y: 190 }, { type: 'bomber', side: 'L', y: 170, delay: 40 }] },
        { when: 1, spawns: [{ type: 'raptor', side: 'R', y: 180 }, { type: 'raptor', side: 'L', y: 200, delay: 40 }] }] },
      { lock: 1800, groups: [
        { when: 0, spawns: [{ type: 'thin', side: 'R', y: 170 }, { type: 'thin', side: 'R', y: 200, delay: 20 }, { type: 'bomber', side: 'L', y: 185, delay: 40 }] },
        { when: 1, spawns: [{ type: 'pachy', side: 'L', y: 180 }, { type: 'grunt', side: 'R', y: 205, delay: 30 }] }] },
      { lock: 2400, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'L', y: 175 }, { type: 'grunt', side: 'R', y: 200 }, { type: 'grunt', side: 'R', y: 170, delay: 40 }] },
        { when: 1, spawns: [{ type: 'bomber', side: 'R', y: 190 }, { type: 'bomber', side: 'L', y: 190, delay: 40 }, { type: 'thin', side: 'R', y: 205, delay: 60 }] }] },
      { lock: 2950, groups: [
        { when: 0, spawns: [{ type: 'raptor', side: 'R', y: 175 }, { type: 'pachy', side: 'L', y: 200, delay: 40 }, { type: 'grunt', side: 'R', y: 190, delay: 70 }] }] },
      { lock: LEN - W, boss: true, groups: [{ when: 0, spawns: [{ type: 'zmija', side: 'R', y: 185 }] }] }
    ],
    PROPS: [
      { x: 220, y: 200, kind: 'barrel', drop: 'fruit' }, { x: 640, y: 175, kind: 'crate', drop: 'grenade' },
      { x: 980, y: 195, kind: 'barrel', drop: 'meat' }, { x: 1360, y: 170, kind: 'barrel', drop: 'gem' },
      { x: 1960, y: 200, kind: 'crate', drop: 'meat' }, { x: 2300, y: 172, kind: 'barrel', drop: 'rifle' },
      { x: 2800, y: 205, kind: 'crate', drop: 'fruit' }, { x: 3100, y: 180, kind: 'barrel', drop: 'meat' },
      { x: 3380, y: 205, kind: 'crate', drop: 'meat' }
    ],
    PICKUPS: [{ x: 520, y: 205, type: 'coin' }, { x: 2150, y: 185, type: 'coin' }, { x: 3000, y: 200, type: 'gem' }]
  });
})();
