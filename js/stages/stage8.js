/* Etap 6 (plik 8) — „Kanały Otchłani”: ceglane tunele pod miastem, ścieki, toksyczne kałuże. Boss: Zębacz. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 3700;

  // toksyczne kałuże — ranią każdego, kto w nie wejdzie
  const SLUDGE = [
    { x0: 700, x1: 780, y0: 188, y1: 204, label: 'ŚCIEKI!' },
    { x0: 1560, x1: 1650, y0: 170, y1: 186, label: 'ŚCIEKI!' },
    { x0: 2380, x1: 2450, y0: 196, y1: 212, label: 'ŚCIEKI!' },
    { x0: 2900, x1: 2990, y0: 176, y1: 192, label: 'ŚCIEKI!' }
  ];
  function bricks(g, R, x0, x1, top, bottom, base) {
    S.rect(g, x0, top, x1 - x0, bottom - top, base, false);
    for (let y = top; y < bottom; y += 6) {
      const off = ((y - top) / 6) % 2 ? 0 : 6;
      for (let x = x0 - off; x < x1; x += 12) {
        g.fillStyle = S.shade(base, (R() - 0.5) * 0.25); g.fillRect(x + 1, y + 1, 10, 4);
      }
    }
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x0, top, x1 - x0, 2);
  }
  function arch(g, x, base, w, h, col) {
    g.fillStyle = OUT; g.beginPath(); g.moveTo(x - w / 2 - 3, base); g.lineTo(x - w / 2 - 3, base - h + w / 2); g.arc(x, base - h + w / 2, w / 2 + 3, Math.PI, 0); g.lineTo(x + w / 2 + 3, base); g.closePath(); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(x - w / 2, base); g.lineTo(x - w / 2, base - h + w / 2); g.arc(x, base - h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, base); g.closePath(); g.fill();
  }
  function grate(g, x, y, w, h) {
    S.rect(g, x, y, w, h, '#141418');
    g.fillStyle = '#4a4a50'; for (let i = 2; i < w; i += 5) g.fillRect(x + i, y, 2, h);
    g.fillStyle = '#3a3a40'; g.fillRect(x, y + h / 2 - 1, w, 2);
  }
  function ladder(g, x, top, base) {
    g.fillStyle = OUT; g.fillRect(x - 1, top, 3, base - top); g.fillRect(x + 13, top, 3, base - top);
    g.fillStyle = '#7a6a5a'; g.fillRect(x, top, 1, base - top); g.fillRect(x + 14, top, 1, base - top);
    for (let y = top + 4; y < base; y += 8) { g.fillStyle = OUT; g.fillRect(x, y - 1, 15, 3); g.fillStyle = '#8a7a6a'; g.fillRect(x, y, 15, 1); }
  }
  function lamp(g, x, y) {
    S.rect(g, x - 1, y - 10, 2, 10, '#2a2a2a');
    S.rect(g, x - 5, y, 10, 7, '#3a3a3a'); g.fillStyle = '#e8d890'; g.fillRect(x - 3, y + 2, 6, 3);
    g.strokeStyle = '#2a2a2a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 5, y + 3); g.lineTo(x + 5, y + 3); g.stroke();
  }
  function graffiti(g, x, y, txt, col) {
    g.save(); g.translate(x, y); g.rotate(-0.06);
    g.font = 'bold 13px monospace'; g.textAlign = 'left';
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillText(txt, 1, 1); g.fillStyle = col; g.fillText(txt, 0, 0);
    g.restore();
  }
  const lampsAt = [];
  for (let x = 160; x < LEN; x += 300) lampsAt.push(x);

  window.STAGES[6] = S.makeStage({
    name: 'ETAP 6 — KANAŁY OTCHŁANI', sub: 'POD MIASTEM ŻYJE COŚ STARSZEGO NIŻ MIASTO',
    LEN, music: 'sewer', bossMusic: 'beast', diff: 1.7, farP: 0.15, midP: 0.45, EVENT: 'flood',
    HAZARDS: SLUDGE,
    sky(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, FLOOR_TOP);
      g.addColorStop(0, '#050608'); g.addColorStop(1, '#0e1412');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR_TOP);
    },
    far(g, R, w) {
      // głąb tunelu: zwężające się łuki z odległym światłem
      for (let x = 40; x < w; x += 220 + R() * 60) {
        for (let k = 0; k < 4; k++) arch(g, x, FLOOR_TOP - 22 + k * 3, 110 - k * 22, 120 - k * 24, ['#1a2220', '#141c1a', '#101614', '#0a0e0c'][k]);
        g.fillStyle = 'rgba(160,200,140,0.18)'; g.beginPath(); g.ellipse(x, FLOOR_TOP - 40, 10, 14, 0, 0, Math.PI * 2); g.fill();
      }
    },
    mid(g, R, w) {
      // kolumny i łuki z cegły
      for (let x = 0; x < w; x += 130) {
        bricks(g, R, x, x + 26, 20, FLOOR_TOP - 6, '#3a3430');
        g.fillStyle = '#2a2420'; g.beginPath(); g.moveTo(x + 26, 20); g.quadraticCurveTo(x + 78, 70, x + 130, 20); g.lineTo(x + 130, 0); g.lineTo(x + 26, 0); g.fill();
        g.strokeStyle = OUT; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 26, 22); g.quadraticCurveTo(x + 78, 72, x + 130, 22); g.stroke();
      }
    },
    near(g, R, nw) {
      // ściana z cegły do poziomu chodnika, rynna ze ściekami pod nią
      bricks(g, R, 0, nw, 0, FLOOR_TOP - 16, '#4a3e36');
      // pas mchu i zacieki
      for (let x = 0; x < nw; x += 8) { if (R() < 0.5) { g.fillStyle = 'rgba(70,110,50,0.5)'; g.fillRect(x, FLOOR_TOP - 34 - R() * 8, 8, 6 + R() * 18); } }
      for (let x = 30; x < nw; x += 60 + R() * 80) { g.fillStyle = 'rgba(20,30,20,0.45)'; g.fillRect(x, 0, 4 + R() * 6, 40 + R() * 70); }
      // rury
      S.pipesWall(g, R, 0, nw, 18);
      for (let x = 260; x < nw; x += 520 + R() * 200) { S.rect(g, x, 0, 14, FLOOR_TOP - 20, '#5a6a5a'); S.rect(g, x - 3, FLOOR_TOP - 26, 20, 8, '#4a5a4a'); }   // pionowe rury wylotowe
      // kraty, drabiny, graffiti, lampy
      for (let x = 120; x < nw; x += 380 + R() * 160) grate(g, x, 70 + R() * 20, 34, 30);
      for (let x = 480; x < nw; x += 700 + R() * 200) ladder(g, x, 0, FLOOR_TOP - 16);
      graffiti(g, 560, 104, 'NIE SCHODŹ NIŻEJ', '#c03a2a');
      graffiti(g, 1380, 96, 'ON JEST GŁODNY', '#d0c040');
      graffiti(g, 2260, 100, 'PALEO 4EVER', '#40a0c0');
      graffiti(g, 3150, 92, '!!! ZĘBY !!!', '#c03a2a');
      lampsAt.forEach(x => lamp(g, x, 40));
      // pęknięta ściana prowadząca w głąb (sekcja 3)
      g.fillStyle = OUT; g.beginPath(); g.moveTo(1980, FLOOR_TOP - 16); g.lineTo(1990, 60); g.lineTo(2030, 50); g.lineTo(2060, 80); g.lineTo(2070, FLOOR_TOP - 16); g.fill();
      g.fillStyle = '#0a0e0c'; g.beginPath(); g.moveTo(1986, FLOOR_TOP - 16); g.lineTo(1994, 64); g.lineTo(2030, 56); g.lineTo(2056, 84); g.lineTo(2064, FLOOR_TOP - 16); g.fill();
      // leże bossa: kości w niszy
      for (let i = 0; i < 18; i++) { const x = 3300 + R() * 300, y = FLOOR_TOP - 22 + R() * 6; g.fillStyle = OUT; g.fillRect(x - 1, y - 1, 10, 4); g.fillStyle = '#d8ccb0'; g.fillRect(x, y, 8, 2); }
      // rynna ze ściekami
      g.fillStyle = '#1a201c'; g.fillRect(0, FLOOR_TOP - 16, nw, 16);
      g.fillStyle = '#3a5a2a'; g.fillRect(0, FLOOR_TOP - 12, nw, 9);
      g.fillStyle = '#5a5048'; g.fillRect(0, FLOOR_TOP - 4, nw, 4);
      // chodnik: mokry beton z kratkami
      S.ground(g, R, 0, nw, '#3a3e3a', '#4a4e48', 3);
      g.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 0; x < nw; x += 48) g.fillRect(x, FLOOR_TOP + 2, 1, H - FLOOR_TOP);
      // podwyższony chodnik przy ścianie — schronienie przed falą ścieków
      g.fillStyle = '#5a5e56'; g.fillRect(0, FLOOR_TOP + 2, nw, 18);
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, FLOOR_TOP + 2, nw, 2);
      for (let x = 0; x < nw; x += 16) { g.fillStyle = (x / 16) % 2 ? '#d0b030' : '#1a1a1a'; g.fillRect(x, FLOOR_TOP + 18, 16, 2); }
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(0, FLOOR_TOP + 20, nw, 3);
      for (let x = 200; x < nw; x += 420 + R() * 160) grate(g, x, FLOOR_TOP + 20 + R() * 30, 30, 12);
      for (let i = 0; i < nw / 25; i++) { g.fillStyle = 'rgba(120,160,140,0.18)'; g.beginPath(); g.ellipse(R() * nw, FLOOR_TOP + 8 + R() * 60, 6 + R() * 12, 1.5, 0, 0, Math.PI * 2); g.fill(); }   // kałuże wody
    },
    front(g, R, fw) {
      for (let x = 50; x < fw; x += 180 + R() * 200) {
        if (R() < 0.5) { S.rect(g, x, 186, 12, 40, '#4a5a4a'); S.rect(g, x - 4, 182, 20, 6, '#3a4a3a'); }   // rura z przodu
        else { g.fillStyle = OUT; g.fillRect(x - 2, 0, 6, 30); g.fillStyle = '#2a3028'; g.fillRect(x - 1, 0, 4, 28); }   // zwisający kabel
      }
    },
    anim(ctx, camX, t) {
      // płynące ścieki w rynnie
      ctx.fillStyle = 'rgba(140,200,80,0.35)';
      for (let x = -((camX + t * 0.8) % 16); x < W; x += 16) ctx.fillRect(x, FLOOR_TOP - 10 + (Math.floor((x + camX) / 16) % 2) * 3, 8, 1);
      // toksyczne kałuże
      SLUDGE.forEach((h, i) => {
        const x = h.x0 - camX, w = h.x1 - h.x0, cy = (h.y0 + h.y1) / 2, ry = (h.y1 - h.y0) / 2 + 2;
        if (x > W + 10 || x + w < -10) return;
        ctx.fillStyle = '#0a1008'; ctx.beginPath(); ctx.ellipse(x + w / 2, cy, w / 2 + 3, ry + 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5ac82a'; ctx.beginPath(); ctx.ellipse(x + w / 2, cy, w / 2, ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(200,255,120,0.6)';
        for (let k = 0; k < 4; k++) ctx.fillRect(x + 6 + ((t * 0.3 + k * 19 + i * 7) % (w - 12)), cy - 2 + (k % 2) * 3, 5, 1.5);
        const b = (t * 0.035 + i * 0.3) % 1;
        ctx.strokeStyle = `rgba(200,255,140,${1 - b})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x + w * 0.4 + i * 5, cy - b * 8, 1 + b * 3, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(120,255,80,0.08)'; ctx.beginPath(); ctx.ellipse(x + w / 2, cy - 12, w / 2 + 10, 14, 0, 0, Math.PI * 2); ctx.fill();
      });
      // światło lamp (z migotaniem)
      lampsAt.forEach((lx, i) => {
        const x = lx - camX;
        if (x < -80 || x > W + 80) return;
        const on = (t + i * 37) % 200 > 6 && !((t + i * 53) % 90 < 3);
        if (!on) return;
        const g = ctx.createRadialGradient(x, 46, 2, x, 70, 70);
        g.addColorStop(0, 'rgba(240,220,140,0.35)'); g.addColorStop(1, 'rgba(240,220,140,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 70, 40, 140, 110);
      });
      // krople z sufitu
      for (let i = 0; i < 10; i++) {
        const x = ((i * 97 - camX) % (W + 40) + W + 40) % (W + 40) - 20, p = (t * 0.02 + i * 0.37) % 1;
        ctx.fillStyle = 'rgba(160,200,180,0.7)'; ctx.fillRect(x, p * (FLOOR_TOP - 10), 1, 3);
      }
      // oczy w ciemności rynny
      for (let i = 0; i < 4; i++) {
        const x = ((i * 211 + 60 - camX * 1) % (W + 60) + W + 60) % (W + 60) - 30;
        if ((t + i * 70) % 260 < 90) { ctx.fillStyle = '#e04020'; ctx.fillRect(x, FLOOR_TOP - 13, 2, 1); ctx.fillRect(x + 4, FLOOR_TOP - 13, 2, 1); }
      }
    },
    overlay(ctx, camX, t) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(0.35, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,10,0,0.25)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) {
        const x = ((i * 140 - camX * 0.5 + t * 0.15) % (W + 260) + W + 260) % (W + 260) - 130;
        ctx.fillStyle = 'rgba(120,180,90,0.06)'; ctx.beginPath(); ctx.ellipse(x, 176 + i * 9, 120, 12, 0, 0, Math.PI * 2); ctx.fill();
      }
    },
    WAVES: [
      { lock: 280, groups: [
        { when: 0, spawns: [{ type: 'thin', side: 'R', y: 175 }, { type: 'thin', side: 'L', y: 205, delay: 20 }, { type: 'grunt', side: 'R', y: 190, delay: 50 }] },
        { when: 1, spawns: [{ type: 'raptor', side: 'R', y: 185 }, { type: 'netter', side: 'L', y: 175, delay: 40 }] }] },
      { lock: 820, groups: [
        { when: 0, spawns: [{ type: 'shield', side: 'R', y: 180 }, { type: 'gunner', side: 'R', y: 205, delay: 30 }, { type: 'thin', side: 'L', y: 170, delay: 50 }] },
        { when: 1, spawns: [{ type: 'raptor', side: 'L', y: 190 }, { type: 'raptor', side: 'R', y: 175, delay: 20 }, { type: 'brute', side: 'R', y: 205, delay: 60 }] }] },
      { lock: 1320, groups: [
        { when: 0, spawns: [{ type: 'bomber', side: 'R', y: 170 }, { type: 'bomber', side: 'L', y: 205, delay: 20 }, { type: 'netter', side: 'R', y: 190, delay: 50 }] },
        { when: 1, spawns: [{ type: 'para', side: 'R', y: 185 }, { type: 'shield', side: 'L', y: 200, delay: 30 }] }] },
      { lock: 1860, groups: [
        { when: 0, spawns: [{ type: 'brute', side: 'R', y: 175 }, { type: 'brute', side: 'L', y: 205, delay: 20 }, { type: 'sniper', side: 'R', y: 160, delay: 40 }] },
        { when: 1, spawns: [{ type: 'whitefang', side: 'R', y: 190 }] }] },
      { lock: 2420, groups: [
        { when: 0, spawns: [{ type: 'thin', side: 'R', y: 170 }, { type: 'thin', side: 'R', y: 205, delay: 10 }, { type: 'grunt', side: 'L', y: 185, delay: 30 }, { type: 'gunner', side: 'L', y: 200, delay: 60 }] },
        { when: 1, spawns: [{ type: 'pachy', side: 'R', y: 185 }, { type: 'raptor', side: 'L', y: 200, delay: 30 }] }] },
      { lock: 2880, groups: [
        { when: 0, spawns: [{ type: 'shield', side: 'R', y: 180 }, { type: 'netter', side: 'L', y: 205, delay: 20 }, { type: 'bomber', side: 'R', y: 170, delay: 40 }, { type: 'brute', side: 'L', y: 190, delay: 70 }] }] },
      { lock: LEN - W, boss: true, groups: [{ when: 0, spawns: [{ type: 'deino', side: 'R', y: 185 }] }] }
    ],
    PROPS: [
      { x: 220, y: 200, kind: 'barrel', drop: 'meat' }, { x: 520, y: 172, kind: 'crate', drop: 'machete' }, { x: 1300, y: 200, kind: 'barrel', drop: 'chain' },
      { x: 960, y: 205, kind: 'fuel' }, { x: 1180, y: 178, kind: 'barrel', drop: 'dynamite' },
      { x: 1480, y: 205, kind: 'crate', drop: 'meat' }, { x: 2020, y: 158, kind: 'wall', secret: 'treasure' },
      { x: 2240, y: 175, kind: 'fuel' }, { x: 2280, y: 200, kind: 'fuel' }, { x: 2650, y: 205, kind: 'crate', drop: 'grenade' },
      { x: 3080, y: 175, kind: 'barrel', drop: 'meat' }, { x: 3200, y: 205, kind: 'crate', drop: 'dynamite' }
    ],
    PICKUPS: [{ x: 650, y: 175, type: 'coin' }, { x: 1750, y: 200, type: 'gem' }, { x: 2560, y: 185, type: 'coin' }, { x: 3260, y: 190, type: 'meat' }],
    VEHICLES: []
  });
})();
