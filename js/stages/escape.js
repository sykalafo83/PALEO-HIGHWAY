/* Epilog — „Ucieczka”: płonąca Bursztynowa Twierdza. Kamera przewija się sama, od lewej goni ściana lawy. */
(function () {
  'use strict';
  const S = window.Scenery, { W, H, FLOOR_TOP, OUT } = S;
  const LEN = 3200;

  window.SPECIAL_STAGES = window.SPECIAL_STAGES || {};
  window.SPECIAL_STAGES.escape = S.makeStage({
    name: 'EPILOG — UCIECZKA', sub: 'TWIERDZA PŁONIE — BIEGNIJ DO WYJŚCIA!', label: 'E',
    LEN, music: 'beast', bossMusic: 'beast', special: 'escape', diff: 1.5, startX: 140,
    sky(ctx, camX, t) {
      S.skyGrad(ctx, ['#1a0606', '#4a0e08', '#8a2a10']);
      for (let i = 0; i < 8; i++) {
        const x = ((i * 70 - camX * 0.1 + t * 0.4) % (W + 160)) - 80;
        ctx.fillStyle = 'rgba(30,10,10,0.5)'; ctx.beginPath(); ctx.ellipse(x, 30 + i * 9, 80, 12, 0, 0, Math.PI * 2); ctx.fill();
      }
    },
    far(g, R, w) { S.fortressWall(g, R, 0, w, 70, 150, '#2a1418'); },
    mid(g, R, w) {
      for (let x = 20; x < w; x += 90 + R() * 40) { S.rect(g, x, 40, 22, 112, '#3a1a1a'); g.fillStyle = '#8a3a1a'; g.fillRect(x + 3, 60 + R() * 40, 16, 3); }
    },
    near(g, R, nw) {
      S.rect(g, 0, 0, nw, FLOOR_TOP, '#2a1414', false);
      for (let x = 0; x < nw; x += 160) {
        S.rect(g, x + 20, 10, 28, FLOOR_TOP - 10, '#4a2228');
        g.fillStyle = '#d0a040'; g.fillRect(x + 20, 10, 28, 3);
        // pęknięcia
        g.strokeStyle = '#ff6a1a'; g.lineWidth = 1; g.beginPath();
        g.moveTo(x + 30, 30); g.lineTo(x + 36, 60); g.lineTo(x + 28, 90); g.lineTo(x + 38, 120); g.stroke();
      }
      for (let x = 80; x < nw; x += 240 + R() * 80) S.tank(g, x, FLOOR_TOP - 2, '#a05010');
      S.sign(g, nw - 150, FLOOR_TOP, 'WYJŚCIE', '#2a7a3a');
      S.ground(g, R, 0, nw, '#4a3438', '#3a262a');
      g.fillStyle = 'rgba(0,0,0,0.3)'; for (let x = 0; x < nw; x += 6) g.fillRect(x, FLOOR_TOP + 4, 1, H - FLOOR_TOP);
      for (let i = 0; i < 40; i++) { g.fillStyle = '#1a0a08'; g.fillRect(R() * nw, FLOOR_TOP + 8 + R() * 56, 8 + R() * 16, 2); }
    },
    anim(ctx, camX, t) {
      // płomienie wzdłuż ścian
      for (let i = 0; i < 16; i++) {
        const x = ((i * 53 - camX) % (W + 40) + W + 40) % (W + 40) - 20;
        for (let k = 0; k < 3; k++) {
          const p = (t * 0.05 + k / 3 + i * 0.17) % 1;
          ctx.fillStyle = p < 0.4 ? 'rgba(255,220,100,0.8)' : p < 0.7 ? 'rgba(255,140,40,0.7)' : 'rgba(180,40,20,0.5)';
          ctx.beginPath(); ctx.arc(x + Math.sin(i + t * 0.1) * 3, FLOOR_TOP - 4 - p * 26, 6 * (1 - p) + 1, 0, Math.PI * 2); ctx.fill();
        }
      }
    },
    overlay(ctx, camX, t) {
      for (let i = 0; i < 30; i++) {
        const x = ((i * 47 - camX * 0.4 + Math.sin(t * 0.03 + i) * 20) % (W + 40) + W + 40) % (W + 40) - 20, y = (i * 37 + t * (0.5 + (i % 3) * 0.2)) % (H + 10);
        ctx.fillStyle = i % 3 ? 'rgba(255,150,50,0.9)' : 'rgba(220,220,220,0.4)'; ctx.fillRect(x, y, 2, 2);
      }
      ctx.fillStyle = `rgba(255,60,20,${0.06 + Math.sin(t * 0.1) * 0.03})`; ctx.fillRect(0, 0, W, H);
    },
    WAVES: [],
    PROPS: [{ x: 700, y: 200, kind: 'fuel' }, { x: 1200, y: 172, kind: 'crate', drop: 'meat' }, { x: 1800, y: 205, kind: 'fuel' }, { x: 2300, y: 175, kind: 'barrel', drop: 'meat' }, { x: 2700, y: 200, kind: 'fuel' }]
  });
})();
