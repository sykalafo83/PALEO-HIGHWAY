/* Etap 3 — „Miasto Cieni”: zrujnowana ulica nocą, plac z autobusem, estakada, parking centrum handlowego. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 3800;
  const NEON = [[230, 70, 'HOTEL', '#ff4a8a'], [700, 84, 'BAR', '#4af0ff'], [1180, 60, 'DINER', '#ffd040'], [2520, 66, 'MALL', '#a06aff'], [3300, 74, 'OPEN', '#ff6a3a']];
  const LAMPS = [120, 520, 900, 1500, 2080, 2700, 3150, 3600];

  window.STAGES[2] = S.makeStage({
    name: 'ETAP 3 — MIASTO CIENI', sub: 'NEONY NAD RUINAMI',
    LEN, music: 'stage3', bossMusic: 'boss', diff: 1.25,
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#04050d', '#0e1430', '#2a2448']);
      ctx.fillStyle = '#e8e6d0'; ctx.beginPath(); ctx.arc(80 - camX * 0.02, 40, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0e1430'; ctx.beginPath(); ctx.arc(86 - camX * 0.02, 37, 12, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 40; i++) { const x = (i * 53 - camX * 0.01) % W, y = (i * 37) % 70; if ((t + i * 13) % 120 < 100) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect((x + W) % W, y, 1, 1); } }
    },
    far(g, R, w) {
      for (let x = 0; x < w; x += 20 + R() * 30) {
        const bw = 24 + R() * 40, bh = 40 + R() * 90;
        g.fillStyle = '#141a30'; g.fillRect(x, 140 - bh, bw, bh + 20);
        for (let yy = 140 - bh + 6; yy < 136; yy += 8) for (let xx = x + 3; xx < x + bw - 4; xx += 6) if (R() < 0.12) { g.fillStyle = R() < 0.5 ? '#c8a050' : '#6080a0'; g.fillRect(xx, yy, 2, 3); }
      }
    },
    mid(g, R, w) {
      for (let x = 0; x < w; x += 40 + R() * 40) S.building(g, R, x, 152, 40 + R() * 30, 60 + R() * 50, R() < 0.5 ? '#2a2a3a' : '#30283a', 0.06);
    },
    near(g, R, nw) {
      // 1. ulica
      S.building(g, R, -10, FLOOR_TOP, 150, 120, '#3a3440', 0.1);
      S.building(g, R, 150, FLOOR_TOP, 170, 130, '#443a3a', 0.12);
      S.building(g, R, 330, FLOOR_TOP, 130, 100, '#3a3a48', 0.08);
      S.building(g, R, 470, FLOOR_TOP, 160, 125, '#40363a', 0.1);
      S.building(g, R, 640, FLOOR_TOP, 140, 110, '#34383e', 0.1);
      S.building(g, R, 790, FLOOR_TOP, 200, 135, '#3e3436', 0.12);
      for (let x = 0; x < 1000; x += 90) S.rect(g, x + 20, FLOOR_TOP - 30, 50, 28, '#1a1a22');
      S.car(g, 420, FLOOR_TOP - 2, '#8a3a3a');
      // 2. plac z autobusem
      g.fillStyle = '#16202a'; g.fillRect(1000, 0, 900, FLOOR_TOP);
      S.building(g, R, 1000, FLOOR_TOP, 260, 140, '#2e3440', 0.15);
      S.bigTree(g, R, 1340, FLOOR_TOP, 70, ['#14301e', '#1c4028', '#285232']);
      S.bus(g, 1520, FLOOR_TOP);
      S.building(g, R, 1650, FLOOR_TOP, 250, 120, '#3a3036', 0.1);
      S.sign(g, 1300, FLOOR_TOP, 'BUS 66', '#3a5a8a');
      // 3. estakada
      g.fillStyle = '#1a1c24'; g.fillRect(1900, 0, 1000, FLOOR_TOP);
      S.building(g, R, 1900, FLOOR_TOP, 1000, 120, '#262832', 0.05);
      S.rect(g, 1900, 30, 1000, 18, '#5a5a62');
      g.fillStyle = '#3a3a42'; g.fillRect(1900, 46, 1000, 4);
      for (let x = 1940; x < 2900; x += 160) { S.rect(g, x, 50, 22, FLOOR_TOP - 50, '#5a5a62'); g.fillStyle = '#4a4a52'; g.fillRect(x + 14, 50, 8, FLOOR_TOP - 50); g.fillStyle = '#c0a040'; g.fillRect(x + 4, 110, 14, 3); }
      S.car(g, 2300, FLOOR_TOP - 2, '#3a5a3a');
      // 4. parking centrum handlowego
      S.building(g, R, 2900, FLOOR_TOP, nw - 2900, 135, '#3a3440', 0.04);
      S.rect(g, 3000, FLOOR_TOP - 50, 500, 50, '#1a1a22');
      g.fillStyle = '#2a3a4a'; for (let x = 3010; x < 3490; x += 40) g.fillRect(x, FLOOR_TOP - 44, 34, 38);
      S.car(g, 3500, FLOOR_TOP - 2, '#5a5a8a');
      LAMPS.forEach(x => S.streetlamp(g, x, FLOOR_TOP, false));
      // podłoże: asfalt, przejścia, kałuże
      S.ground(g, R, 0, nw, '#2c2c34', '#24242a');
      for (let x = 0; x < nw; x += 40) { g.fillStyle = '#7a7a5a'; g.fillRect(x, 185, 20, 2); }
      [560, 1700, 3000].forEach(cx => { for (let i = 0; i < 6; i++) { g.fillStyle = '#9a9a8a'; g.fillRect(cx + i * 12, FLOOR_TOP + 6, 7, 58); } });
      for (let i = 0; i < 30; i++) {
        const x = R() * nw, y = FLOOR_TOP + 10 + R() * 55, w = 10 + R() * 20;
        g.fillStyle = '#1a2230'; g.beginPath(); g.ellipse(x, y, w, w * 0.18, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(140,180,255,0.35)'; g.fillRect(x - w * 0.5, y - 1, w * 0.6, 1);
      }
      g.fillStyle = '#4a4a52'; g.fillRect(0, FLOOR_TOP + 1, nw, 4);
    },
    front(g, R, fw) {
      for (let x = 80; x < fw; x += 200 + R() * 200) {
        if (R() < 0.5) { S.rect(g, x, 150, 8, 80, '#2a2c34'); S.rect(g, x - 20, 150, 48, 6, '#3a3c44'); }
        else { S.rect(g, x, 190, 40, 40, '#1a1c22'); g.fillStyle = '#3a6a3a'; g.fillRect(x + 4, 192, 30, 3); }
      }
    },
    anim(ctx, camX, t) {
      NEON.forEach(([x, y, txt, col], i) => {
        const sx = x - camX; if (sx < -80 || sx > W + 80) return;
        const on = !((t + i * 41) % 170 < 8 || (t + i * 41) % 170 > 160 && (t % 4 < 2));
        ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#111'; ctx.fillRect(sx - txt.length * 5 - 4, y - 9, txt.length * 10 + 8, 18);
        if (on) { ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.fillStyle = col; } else { ctx.shadowBlur = 0; ctx.fillStyle = '#3a3a3a'; }
        ctx.fillText(txt, sx, y + 1); ctx.shadowBlur = 0;
      });
      LAMPS.forEach((x, i) => {
        const sx = x - camX; if (sx < -60 || sx > W + 60) return;
        if ((t + i * 77) % 300 < 6) return;
        ctx.fillStyle = 'rgba(255,230,150,0.14)'; ctx.beginPath(); ctx.moveTo(sx + 11, FLOOR_TOP - 72); ctx.lineTo(sx - 18, FLOOR_TOP + 40); ctx.lineTo(sx + 50, FLOOR_TOP + 40); ctx.lineTo(sx + 19, FLOOR_TOP - 72); ctx.fill();
        ctx.fillStyle = '#fff0b0'; ctx.fillRect(sx + 11, FLOOR_TOP - 73, 8, 2);
      });
    },
    overlay(ctx, camX, t) {
      ctx.strokeStyle = 'rgba(170,190,230,0.35)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < 90; i++) {
        const x = (i * 47 + t * 2 - camX * 0.3) % (W + 40), y = (i * 61 + t * 9) % (H + 20);
        const xx = (x + W + 40) % (W + 40) - 20;
        ctx.moveTo(xx, y - 20); ctx.lineTo(xx - 3, y - 12);
      }
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const x = (i * 71 + t * 3) % W, y = FLOOR_TOP + 10 + (i * 23) % 60, k = (t * 0.1 + i) % 1;
        ctx.strokeStyle = `rgba(170,190,230,${0.4 * (1 - k)})`; ctx.beginPath(); ctx.ellipse(x, y, 1 + k * 4, 0.5 + k, 0, 0, Math.PI * 2); ctx.stroke();
      }
    },
    WAVES: [
      { lock: 330, groups: [
        { when: 0, spawns: [{ type: 'grunt', side: 'R', y: 180 }, { type: 'gunner', side: 'R', y: 205, delay: 30 }, { type: 'thin', side: 'L', y: 170, delay: 60 }] },
        { when: 1, spawns: [{ type: 'grunt', side: 'R', y: 195 }, { type: 'grunt', side: 'L', y: 175, delay: 30 }] }] },
      { lock: 820, groups: [
        { when: 0, spawns: [{ type: 'gunner', side: 'L', y: 170 }, { type: 'gunner', side: 'R', y: 205, delay: 20 }, { type: 'brute', side: 'R', y: 185, delay: 50 }] }] },
      { lock: 1300, groups: [
        { when: 0, spawns: [{ type: 'raptor', side: 'R', y: 175 }, { type: 'raptor', side: 'R', y: 200, delay: 25 }, { type: 'raptor', side: 'L', y: 188, delay: 60 }] },
        { when: 1, spawns: [{ type: 'bomber', side: 'R', y: 180 }, { type: 'thin', side: 'L', y: 200, delay: 30 }] }] },
      { lock: 1850, groups: [
        { when: 0, spawns: [{ type: 'thin', side: 'R', y: 170 }, { type: 'thin', side: 'L', y: 205, delay: 15 }, { type: 'thin', side: 'R', y: 190, delay: 40 }] },
        { when: 1, spawns: [{ type: 'gunner', side: 'R', y: 180 }, { type: 'brute', side: 'L', y: 195, delay: 40 }] }] },
      { lock: 2400, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'R', y: 175 }, { type: 'bomber', side: 'R', y: 205, delay: 30 }, { type: 'grunt', side: 'L', y: 190, delay: 50 }] },
        { when: 1, spawns: [{ type: 'gunner', side: 'L', y: 170 }, { type: 'grunt', side: 'R', y: 200, delay: 20 }, { type: 'grunt', side: 'R', y: 175, delay: 50 }] }] },
      { lock: 2950, groups: [
        { when: 0, spawns: [{ type: 'pachy', side: 'R', y: 185 }, { type: 'gunner', side: 'L', y: 200, delay: 30 }, { type: 'thin', side: 'R', y: 170, delay: 50 }] }] },
      { lock: LEN - W, boss: true, groups: [{ when: 0, spawns: [{ type: 'klin', side: 'R', y: 175 }, { type: 'klamra', side: 'L', y: 200, delay: 30 }] }] }
    ],
    PROPS: [
      { x: 260, y: 195, kind: 'barrel', drop: 'meat' }, { x: 700, y: 170, kind: 'crate', drop: 'rifle' },
      { x: 1100, y: 205, kind: 'barrel', drop: 'dynamite' }, { x: 1560, y: 180, kind: 'crate', drop: 'grenade' },
      { x: 2000, y: 200, kind: 'barrel', drop: 'meat' }, { x: 2600, y: 172, kind: 'crate', drop: 'meat' },
      { x: 3080, y: 200, kind: 'barrel', drop: 'gem' }, { x: 3340, y: 175, kind: 'crate', drop: 'meat' }
    ],
    PICKUPS: [{ x: 600, y: 185, type: 'coin' }, { x: 1420, y: 200, type: 'coin' }, { x: 2250, y: 180, type: 'coin' }]
  });
})();
