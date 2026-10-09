/* Rozszerzenia etapów: nowi przeciwnicy (tarczownik, snajper, sieciarz, pteranodon), sekrety,
 * beczki z paliwem, dodatkowe życia, lawa, wagoniki w kopalni i ulewa w mieście.
 * Dane bazowe etapów zostają w stageN.js — tu tylko je uzupełniamy.
 */
(function () {
  'use strict';
  const S = window.STAGES;
  const add = (si, wi, gi, spawns) => S[si].WAVES[wi].groups[gi].spawns.push(...spawns);
  const props = (si, list) => S[si].PROPS.push(...list);
  // zamienia łup z pierwszej beczki o danym x na dodatkowe życie
  const lifeIn = (si, x) => { const p = S[si].PROPS.find(q => q.x === x); if (p) p.drop = '1up'; };

  // nowa broń biała w kilku miejscach
  const drop = (si, x, d) => { const pr = S[si].PROPS.find(q => q.x === x); if (pr) pr.drop = d; };
  drop(0, 1480, 'machete'); drop(1, 1960, 'bottle'); drop(2, 2600, 'chain'); drop(4, 2080, 'machete');
  // ---------------------------------------------------------------- etap 1 — Zielona Rdza
  add(0, 1, 0, [{ type: 'ptera', side: 'R', y: 180, delay: 60 }]);
  add(0, 3, 1, [{ type: 'shield', side: 'R', y: 190, delay: 40 }]);
  props(0, [{ x: 2160, y: 205, kind: 'fuel' }, { x: 2560, y: 170, kind: 'fuel' }, { x: 1720, y: 158, kind: 'wall', secret: 'treasure1up' }]);

  add(0, 4, 1, [{ type: 'para', side: 'L', y: 185, delay: 40 }]);

  // ---------------------------------------------------------------- etap 2 — Smolne Bagna
  add(1, 2, 1, [{ type: 'trike', side: 'R', y: 190, delay: 30 }]);
  add(1, 1, 1, [{ type: 'netter', side: 'L', y: 190, delay: 50 }]);
  add(1, 3, 0, [{ type: 'shield', side: 'R', y: 185, delay: 30 }]);
  add(1, 5, 0, [{ type: 'ptera', side: 'R', y: 185, delay: 30 }]);
  props(1, [{ x: 1200, y: 200, kind: 'fuel' }, { x: 1450, y: 165, kind: 'fuel' }, { x: 1700, y: 205, kind: 'fuel' }, { x: 2650, y: 158, kind: 'wall', secret: 'boss' }]);
  lifeIn(1, 3100);

  // ---------------------------------------------------------------- etap 3A — Miasto Cieni (ulewy)
  S[2].storm = true;
  add(2, 1, 0, [{ type: 'sniper', side: 'R', y: 160, delay: 20 }]);
  add(2, 4, 1, [{ type: 'shield', side: 'L', y: 185, delay: 30 }, { type: 'netter', side: 'R', y: 200, delay: 60 }]);
  add(2, 5, 0, [{ type: 'sniper', side: 'L', y: 160, delay: 10 }]);
  props(2, [{ x: 2300, y: 200, kind: 'fuel' }, { x: 1180, y: 158, kind: 'wall', secret: 'treasure' }]);

  // ---------------------------------------------------------------- etap 3B — Ogniste Szyby (lawa, wagoniki)
  const LAVA = [
    { x0: 520, x1: 600, y0: 186, y1: 204 },
    { x0: 3300, x1: 3370, y0: 170, y1: 186 },
    { x0: 3480, x1: 3545, y0: 196, y1: 212 }
  ];
  S[3].HAZARDS = LAVA;
  S[3].CARTS = { x0: 900, x1: 1800, y: 163, every: 300 };
  S[3].VEHICLES = [{ type: 'cart', x: 960, y: 163 }];
  const baseAnim = S[3].anim;
  S[3].anim = function (ctx, camX, t) {
    baseAnim(ctx, camX, t);
    LAVA.forEach((h, i) => {
      const x = h.x0 - camX, w = h.x1 - h.x0, cy = (h.y0 + h.y1) / 2, ry = (h.y1 - h.y0) / 2 + 2;
      if (x > S[3].W + 10 || x + w < -10) return;
      ctx.fillStyle = '#140808'; ctx.beginPath(); ctx.ellipse(x + w / 2, cy, w / 2 + 3, ry + 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff5a14'; ctx.beginPath(); ctx.ellipse(x + w / 2, cy, w / 2, ry, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffb030';
      for (let k = 0; k < 4; k++) ctx.fillRect(x + 6 + ((t * 0.4 + k * 17 + i * 9) % (w - 12)), cy - 2 + (k % 2) * 3, 6, 1.5);
      const b = (t * 0.03 + i * 0.4) % 1;
      ctx.strokeStyle = `rgba(255,220,120,${1 - b})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x + w * 0.3 + i * 7, cy - b * 6, 1 + b * 3, 0, Math.PI * 2); ctx.stroke();
    });
  };
  add(3, 1, 1, [{ type: 'shield', side: 'R', y: 190, delay: 30 }]);
  add(3, 2, 0, [{ type: 'trike', side: 'L', y: 185, delay: 40 }]);
  add(3, 3, 0, [{ type: 'ptera', side: 'L', y: 180, delay: 40 }]);
  props(3, [{ x: 2500, y: 158, kind: 'wall', secret: 'boss' }, { x: 1500, y: 205, kind: 'fuel' }]);

  // ---------------------------------------------------------------- etap 4 — Port Przemytników
  S[4].VEHICLES = [{ type: 'jeep', x: 1090, y: 200 }, { type: 'jeep', x: 2960, y: 196 }];
  add(4, 1, 0, [{ type: 'sniper', side: 'R', y: 160, delay: 30 }]);
  add(4, 3, 0, [{ type: 'netter', side: 'R', y: 185, delay: 50 }]);
  add(4, 2, 1, [{ type: 'para', side: 'R', y: 180, delay: 30 }]);
  add(4, 4, 1, [{ type: 'shield', side: 'L', y: 190, delay: 20 }]);
  props(4, [{ x: 1150, y: 170, kind: 'fuel' }, { x: 1400, y: 205, kind: 'fuel' }, { x: 2400, y: 200, kind: 'fuel' }, { x: 1900, y: 158, kind: 'wall', secret: 'treasure1up' }]);
  lifeIn(4, 3320);

  // ---------------------------------------------------------------- etap 5 — Bursztynowa Twierdza
  add(7, 0, 1, [{ type: 'sniper', side: 'R', y: 160, delay: 30 }]);
  add(7, 1, 0, [{ type: 'ptera', side: 'R', y: 180, delay: 60 }]);
  add(7, 3, 0, [{ type: 'trike', side: 'R', y: 195, delay: 40 }]);
  add(7, 4, 0, [{ type: 'shield', side: 'L', y: 200, delay: 20 }, { type: 'netter', side: 'R', y: 175, delay: 50 }]);
  props(7, [{ x: 2150, y: 200, kind: 'fuel' }, { x: 2700, y: 170, kind: 'fuel' }, { x: 1150, y: 158, kind: 'wall', secret: 'boss' }]);
  // ---------------------------------------------------------------- nowi wrogowie (jeździec, podpalacz, lotniarz)
  add(0, 4, 0, [{ type: 'rraptor', side: 'R', y: 190, delay: 50 }]);
  add(0, 3, 0, [{ type: 'glider', side: 'L', y: 185, delay: 80 }]);
  add(2, 4, 0, [{ type: 'flamer', side: 'R', y: 190, delay: 40 }]);
  add(3, 3, 0, [{ type: 'rraptor', side: 'R', y: 185, delay: 60 }]);
  add(4, 2, 0, [{ type: 'flamer', side: 'L', y: 195, delay: 30 }]);
  add(4, 4, 0, [{ type: 'glider', side: 'R', y: 180, delay: 60 }]);
  add(5, 2, 1, [{ type: 'rraptor', side: 'R', y: 175, delay: 50 }]);
  add(5, 3, 0, [{ type: 'glider', side: 'L', y: 190, delay: 90 }]);
  add(7, 2, 0, [{ type: 'flamer', side: 'R', y: 185, delay: 40 }]);
  add(7, 4, 1 < S[7].WAVES[4].groups.length ? 1 : 0, [{ type: 'rraptor', side: 'L', y: 190, delay: 60 }]);
})();
